[//]: # (title: KSP가 Kotlin 코드를 모델링하는 방식)
[//]: # (description: KSP API가 심볼 계층 구조를 통해 Kotlin 소스 코드를 모델링하는 방법을 알아봅니다.)

KSP는 소스 코드를 심볼(symbol)의 계층 구조로 표현합니다. 프로세서는 이 계층 구조를 탐색하여 소스 코드의 선언(declaration), 타입, 어노테이션 및 기타 요소를 검사할 수 있습니다.
다음과 같은 최상위 함수(top-level function)를 살펴보겠습니다.

```Kotlin
import com.example.annotations.HelloWorldAnnotation

@HelloWorldAnnotation
fun main() {
    helloWorld()
}
```

KSP는 이 함수를 다음과 같은 심볼 계층 구조로 표현합니다.

```None
KSFile: packageName = "" (root package)
└── declarations
└── KSFunctionDeclaration: main
├── simpleName = "main"
├── qualifiedName = "main"
├── parentDeclaration = null
├── functionKind = TOP_LEVEL
├── annotations
│   └── KSAnnotation: @HelloWorldAnnotation
│       ├── shortName = "HelloWorldAnnotation"
│       └── annotationType: KSTypeReference
│           └── resolve().declaration.qualifiedName
│               → com.example.annotations.HelloWorldAnnotation
├── parameters = []
├── typeParameters = []
├── extensionReceiver = null
└── returnType: KSTypeReference
└── resolve() → kotlin.Unit, NOT_NULL
```

계층 구조의 `resolve()` 호출은 완전한 타입 확인(type resolution)을 나타냅니다. 작성된 그대로의 타입 참조를 검사하는 것과 달리, 이를 확인(resolve)하려면 KSP가 해당 컨텍스트를 분석하고 참조하는 타입을 결정해야 합니다. 이러한 추가 분석으로 인해 타입 확인은 KSP API에서 가장 비용이 많이 드는 작업 중 하나가 됩니다. 타입 확인이 어떻게 동작하고 언제 사용해야 하는지 아래에서 자세히 알아보겠습니다.

## 타입 확인 (Type resolution) {id="type-resolution"}

심볼 계층 구조의 일부 프로퍼티(예: `annotationType`, `returnType`)는 `KSTypeReference`로 표현됩니다. 프로세서는 이러한 참조를 직접 검사하거나, 기본 타입에 대한 자세한 정보에 접근하기 위해 이를 확인할(resolve) 수 있습니다.

`KSFunctionDeclaration.returnType`이나 `KSAnnotation.annotationType`과 같이 타입을 참조하는 프로퍼티는 `KSTypeReference`를 반환합니다.

```Kotlin
interface KSFunctionDeclaration : ... {
    val returnType: KSTypeReference?
    // ...
}

interface KSTypeReference : KSAnnotated, KSModifierListOwner {
    val element: KSReferenceElement?
    fun resolve(): KSType
}
```

`KSTypeReference`는 확인되지 않은(unresolved) 타입을 나타내며, 소스 코드에 나타난 타입의 구문적 표현(syntactic representation)을 유지합니다. 이 객체의 `KSReferenceElement`는 어노테이션과 수정자(modifier)를 포함하여 Kotlin 문법에서 대응하는 타입 요소를 모델링합니다.

`KSReferenceElement`는 resolve하지 않고도 검사할 수 있습니다. 다음 중 하나일 수 있습니다.

* `KSClassifierReference`: `referencedName`과 같은 정보를 제공합니다.

* `KSCallableReference`: `receiverType`, `functionParameters`, `returnType`과 같은 정보를 제공합니다.

프로세서가 소스 코드와 동일한 타입을 참조하는 코드를 생성하는 경우, 해당 타입을 resolve할 필요가 없습니다. 대신 `KSTypeReference`에서 제공되는 타입 이름을 사용하여 동일한 구문적 타입 참조를 생성할 수 있습니다. KSP는 생성된 소스 파일을 컴파일에 추가하고, 이후 Kotlin 컴파일러가 나머지 소스 코드와 함께 해당 타입 참조를 확인하고 타입 검사를 수행합니다.

`KSTypeReference.resolve()`는 참조를 `KSType`으로 확인(resolve)하며, 이를 통해 타입을 정의하는 선언에 접근할 수 있습니다.

```Kotlin
val ksTypeReference = functionDeclaration.returnType ?: return
val ksType: KSType = ksTypeReference.resolve()
val ksDeclaration: KSDeclaration = ksType.declaration
```

함수 타입 참조의 경우, 대부분의 정보는 이미 `KSCallableReference`에서 확인할 수 있습니다. 함수 타입을 resolve하면 `Function0`, `Function1` 및 관련 계열의 타입이 생성되며, 이는 대개의 경우 불필요합니다. 그러나 함수 프로토타입의 식별성과 같은 추가 정보를 얻기 위해 resolve가 필요할 수도 있습니다.

### 타입을 resolve해야 하는 시점 {id="when-to-resolve-types"}

타입 확인(Type resolution)은 KSP API에서 가장 비용이 많이 드는 작업 중 하나입니다. 불필요한 확인을 방지하기 위해 KSP는 일반적으로 타입 참조를 암시적으로 resolve하지 않습니다. 대신 프로세서에 resolve된 타입이 필요할 때 명시적으로 `KSTypeReference.resolve()`를 호출해야 합니다.

가능하다면 타입을 resolve하기 전에 먼저 `KSReferenceElement`를 검사하세요. 예를 들어, `KSClassifierReference.referencedName()`을 사용하여 프로세서와 관련 없는 참조를 미리 필터링할 수 있습니다.

프로세서가 타입을 resolve해야 하는지 여부는 필요한 정보에 따라 달라집니다. 다음 예제에서는 resolve를 사용한 경우와 사용하지 않은 경우 동일한 프로퍼티 타입을 검사하여 두 접근 방식을 비교합니다. 프로세서 제공자(processor provider)는 `resolveTypes` 옵션을 사용하여 어떤 방식을 사용할지 선택합니다.

```Kotlin
import java.sql.Date as SqlDate

val birthday: SqlDate? = null
val names: List<String> = emptyList()
```

```Kotlin
import com.google.devtools.ksp.processing.*
import com.google.devtools.ksp.symbol.*

class TypeInventoryProcessor(
private val logger: KSPLogger,
private val resolveTypes: Boolean,
) : SymbolProcessor {

    override fun process(resolver: Resolver): List<KSAnnotated> {
        val deferred = mutableListOf<KSAnnotated>()

        // 이 예제에서는 최상위 프로퍼티만 검사합니다.
        val properties = resolver.getAllFiles()
            .flatMap { it.declarations }
            .filterIsInstance<KSPropertyDeclaration>()

        for (property in properties) {
            val name = property.simpleName.asString()
            val reference = property.type

            if (!resolveTypes) {
                // 명시적으로 resolve하지 않고 참조를 검사합니다.
                val element =
                    reference.element as? KSClassifierReference ?: continue

                logger.info(
                    "$name: writtenName=${element.referencedName()}, " +
                        "arguments=${element.typeArguments.size}",
                    property,
                )
            } else {
                // 한 번 resolve한 후, 결과 타입을 재사용합니다.
                val type = reference.resolve()

                if (type.isError) {
                    deferred += property
                    continue
                }

                logger.info(
                    "$name: declaration=" +
                        "${type.declaration.qualifiedName?.asString()}, " +
                        "nullability=${type.nullability}",
                    property,
                )
            }
        }
        return deferred
    }
}
```

`resolveTypes = false`일 때의 관련 출력은 다음과 같습니다.

```Kotlin
birthday: writtenName=SqlDate, arguments=0
names: writtenName=List, arguments=1
```

`resolveTypes = true`일 때의 출력은 다음과 같습니다.

```Kotlin
birthday: declaration=java.sql.Date, nullability=NULLABLE
names: declaration=kotlin.collections.List, nullability=NOT_NULL
```

resolve하지 않으면 프로세서는 타입 이름 및 타입 인자와 같은 구문적 정보(syntactic information)를 검사할 수 있습니다. 예를 들어 소스 코드에 작성된 대로 임포트된 별칭인 `SqlDate`를 확인할 수 있습니다. resolve한 후에는 정규화된 선언 이름(fully qualified declaration name) 및 널 가능성(nullability)과 같은 타입에 대한 의미론적 정보(semantic information)에 접근할 수 있습니다.

## KSP 모델 참조 {id="ksp-model-reference"}

다음 다이어그램은 주요 KSP API 타입 간의 관계를 보여줍니다. 이 다이어그램은 IntelliJ IDEA의 클래스 다이어그램 기능을 사용하여 KSP API 소스로부터 생성되었습니다.

![KSP 2 모델의 전체 클래스 다이어그램](ksp-class-diagram.svg){thumbnail="true" width="800" thumbnail-same-file="true"}

> [전체 크기 다이어그램 보기](https://kotlinlang.org/docs/images/ksp-class-diagram.svg).
>
{style="note"}

전체 API 정의는 KSP GitHub 저장소의 [KSP API 소스](https://github.com/google/ksp/tree/main/api/src/main/kotlin/com/google/devtools/ksp/symbol/)를 참고하세요.