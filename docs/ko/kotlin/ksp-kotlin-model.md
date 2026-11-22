[//]: # (title: KSP가 Kotlin 코드를 모델링하는 방식)

<web-summary>KSP API가 Kotlin 소스 코드를 심볼 계층 구조로 모델링하는 방식과
비용이 많이 드는 분석을 방지하는 방법을 알아봅니다.</web-summary>

KSP는 소스 코드를 심볼의 계층 구조로 표현합니다. 프로세서는 이 계층 구조를 탐색하여 소스 코드의 선언,
타입, 어노테이션 및 기타 요소를 검사할 수 있습니다.
다음과 같은 최상위 함수(Top-level function)를 살펴보겠습니다.

```kotlin
import com.example.annotations.HelloWorldAnnotation

@HelloWorldAnnotation
fun main() {
    helloWorld()
}
```

KSP는 이 함수를 다음과 같은 심볼 계층 구조로 나타냅니다.

```text
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

계층 구조 내의 `resolve()` 호출은 완전한 타입 해결(Type resolution)을 의미합니다. 작성된 그대로의 타입 참조를 검사하는 것과 달리,
이를 해결하려면 KSP가 해당 컨텍스트를 분석하고 참조하는 타입을 결정해야 합니다. 이러한 추가 분석으로 인해
타입 해결은 KSP API에서 가장 비용이 많이 드는 연산 중 하나가 됩니다.

## 타입 해결 (Type resolution) {id="type-resolution"}

`KSAnnotation.annotationType` 및 `KSFunctionDeclaration.returnType`과 같이 타입을 참조하는 프로퍼티는
`KSTypeReference`를 반환합니다. 프로퍼티에 따라 `returnType`처럼 null 허용(Nullable)일 수 있습니다. 프로세서는 이러한
참조를 직접 검사하거나 해결(Resolve)하여 기본 타입에 대한 자세한 정보에 접근할 수 있습니다.

```kotlin
interface KSFunctionDeclaration : ... {
    val returnType: KSTypeReference?
    // ...
}

interface KSTypeReference : KSAnnotated, KSModifierListOwner {
    val element: KSReferenceElement?
    fun resolve(): KSType
}
```

`KSTypeReference`는 해결되지 않은 타입을 나타냅니다. 이는 어노테이션과 수정자(Modifier)를 포함하여 소스 코드에 나타난
타입의 구문적 표현을 그대로 보존합니다. `element` 프로퍼티는 Kotlin 문법에서 대응하는 타입 요소를 모델링하는
`KSReferenceElement`를 보유합니다.

`KSReferenceElement`는 해결하지 않고도 검사할 수 있습니다. 가장 흔한 종류의 참조 요소는 다음과 같습니다.

* `referencedName()`과 같은 정보를 제공하는 `KSClassifierReference`.
* `receiverType`, `functionParameters`, `returnType`과 같은 정보를 제공하는 `KSCallableReference`.

프로세서가 소스 코드와 동일한 타입을 참조하는 코드를 생성하는 경우, 해당 타입을
해결할 필요가 없습니다. 대신 `KSTypeReference`에서 제공되는 타입 이름을 사용하여 동일한 구문적 타입 참조를 생성할 수 있습니다.
KSP는 생성된 소스 파일을 컴파일에 추가하고, 이후 Kotlin 컴파일러가 나머지 소스 코드와 함께 해당 타입 참조를
해결하고 타입을 검사합니다.

`KSTypeReference.resolve()`는 참조를 `KSType`으로 해결하며, 이를 통해 해당 타입을 정의하는 선언에
접근할 수 있습니다.

```kotlin
val ksTypeReference = functionDeclaration.returnType ?: return
val ksType: KSType = ksTypeReference.resolve()
val ksDeclaration: KSDeclaration = ksType.declaration
```

함수 타입 참조의 경우 대부분의 정보는 이미 `KSCallableReference`에서 확인할 수 있습니다. 함수 타입을
해결하면 `Function0`, `Function1` 및 관련 계열의 타입이 생성되며, 이는 대개 불필요합니다. 하지만
해결을 통해 함수의 프로토타입 정체성과 같은 추가 정보를 얻을 수도 있습니다.

### 타입을 해결해야 하는 시점 {id="when-to-resolve-types"}

타입 해결은 KSP API에서 가장 비용이 많이 드는 연산 중 하나입니다. 불필요한 해결을 방지하기 위해 KSP는 일반적으로
타입 참조를 암시적으로 해결하지 않습니다. 프로세서에 해결된 타입이 필요한 경우, 대신 명시적으로
`KSTypeReference.resolve()`를 호출해야 합니다.

가능한 경우 타입을 해결하기 전에 `KSReferenceElement`를 먼저 검사하세요. 예를 들어,
`KSClassifierReference.referencedName()`을 사용하여 프로세서와 관련이 없는 참조를 필터링할 수 있습니다.

프로세서가 타입을 해결해야 하는지 여부는 필요한 정보에 따라 달라집니다. 다음 예제는 해결을 수행하는 방식과
수행하지 않는 방식으로 동일한 프로퍼티 타입을 검사하여 두 접근법을 비교합니다. 입력으로 다음과 같은
최상위 프로퍼티를 사용합니다.

```kotlin
import java.sql.Date as SqlDate

val birthday: SqlDate? = null
val names: List<String> = emptyList()
```

프로세서 공급자(Processor provider)는 사용할 접근 방식을 선택할 수 있도록 프로세서에 `resolveTypes` 옵션을 전달합니다.

```kotlin
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
                // 명시적으로 해결하지 않고 참조를 검사합니다.
                val element =
                    reference.element as? KSClassifierReference ?: continue

                logger.info(
                    "$name: writtenName=${element.referencedName()}, " +
                        "arguments=${element.typeArguments.size}",
                    property,
                )
            } else {
                // 참조를 한 번 해결한 후, 결과 타입을 재사용합니다.
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

`resolveTypes = false`인 경우의 출력 결과는 다음과 같습니다.

```text
birthday: writtenName=SqlDate, arguments=0
names: writtenName=List, arguments=1
```

`resolveTypes = true`인 경우의 출력 결과는 다음과 같습니다.

```text
birthday: declaration=java.sql.Date, nullability=NULLABLE
names: declaration=kotlin.collections.List, nullability=NOT_NULL
```

해결을 거치지 않으면 프로세서는 타입 이름 및 타입 인자와 같은 구문적 정보만 검사할 수 있습니다.
예를 들어, 소스 코드에 작성된 대로 import된 별칭 `SqlDate`를 처리합니다. 반면 해결을 거친 후에는
완규화된 선언 이름(Fully qualified declaration name) 및 null 허용 여부(Nullability)와 같은 타입의 의미론적(Semantic) 정보에 접근할 수 있습니다.

## KSP 모델 레퍼런스 {id="ksp-model-reference"}

다음 다이어그램은 주요 KSP API 타입 간의 관계를 보여줍니다.

![KSP 2 모델의 전체 클래스 다이어그램.](ksp-class-diagram.svg){thumbnail="true" width="700" thumbnail-same-file="true"}

> [전체 크기 다이어그램 보기](https://kotlinlang.org/docs/images/ksp-class-diagram.svg).
>
{style="tip"}

전체 API 정의는 KSP GitHub 저장소의 [KSP API 소스](https://github.com/google/ksp/tree/main/api/src/main/kotlin/com/google/devtools/ksp/symbol/)를
참조하세요.

## 관련 항목 {id="see-also"}

* 프로젝트에 프로세서를 추가하거나 자체 프로세서를 만드는 방법은 [KSP 시작하기](ksp-quickstart.md)를 참조하세요.
* Java 어노테이션 처리 API에 해당하는 KSP 기능은 [Java 어노테이션 처리를 KSP로 마이그레이션하기 위한 레퍼런스](ksp-reference.md)에서 확인할 수 있습니다.
* KSP가 타입 해결을 추적하여 [재처리할 파일을 결정하는 방법](ksp-incremental.md#dirtiness-propagation)을 알아보세요.
* KSP 저장소의 [예제 프로젝트](https://github.com/google/ksp/tree/main/examples)를 살펴보세요.
* Kotlin by JetBrains YouTube 채널에서 [Kotlin Symbol Processing (KSP)](https://www.youtube.com/watch?v=bv-VyGM3HCY) 비디오를 시청해 보세요.