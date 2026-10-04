[//]: # (title: KSP 如何對 Kotlin 程式碼建模)
[//]: # (description: 了解 KSP API 如何透過符號階層對 Kotlin 原始碼進行建模。)

KSP 將原始碼表示為符號階層。處理器可以遍歷此階層以檢查宣告、型別、註解以及原始碼的其他元素。
請看以下頂層函式：

```Kotlin
import com.example.annotations.HelloWorldAnnotation

@HelloWorldAnnotation
fun main() {
    helloWorld()
}
```

KSP 透過以下符號階層來表示此函式：

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

階層中的 `resolve()` 呼叫代表完整的型別解析。與直接檢查書寫形式的型別參照不同，解析型別需要 KSP 分析其上下文並確定其所參照的型別。這種額外的分析使型別解析成為 KSP API 中開銷最高的操作之一。請繼續閱讀以了解型別解析的運作方式以及何時使用它。

## 型別解析 {id="type-resolution"}

符號階層中的某些屬性（例如 `annotationType` 和 `returnType`）表示為 `KSTypeReference`。處理器可以直接檢查這些參照，也可以解析它們以存取有關底層型別的更多資訊。

參照型別的屬性（例如 `KSFunctionDeclaration.returnType` 和 `KSAnnotation.annotationType`）會回傳 `KSTypeReference`。

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

`KSTypeReference` 代表尚未解析的型別，並保留該型別在原始碼中所呈現的語法表示法。其 `KSReferenceElement` 則為 Kotlin 文法中相對應的型別元素建模，包含其註解與修飾詞。

您可以在不解析的情況下檢查 `KSReferenceElement`。它可以是下列之一：

* `KSClassifierReference`，提供如 `referencedName` 等資訊。

* `KSCallableReference`，提供如 `receiverType`、`functionParameters` 和 `returnType` 等資訊。

如果處理器產生的程式碼參照了與原始碼相同的型別，則不需要解析這些型別。相反地，它可以直接使用 `KSTypeReference` 中提供的型別名稱來產生相同的語法型別參照。KSP 會將產生的原始檔加入編譯中，隨後 Kotlin 編譯器會將這些型別參照與其餘原始碼一起進行解析與型別檢查。

`KSTypeReference.resolve()` 會將參照解析為 `KSType`，該型別提供了存取定義該型別之宣告的能力：

```Kotlin
val ksTypeReference = functionDeclaration.returnType ?: return
val ksType: KSType = ksTypeReference.resolve()
val ksDeclaration: KSDeclaration = ksType.declaration
```

對於函式型別參照，大部分資訊都已可從 `KSCallableReference` 取得。解析函式型別會產生來自 `Function0`、`Function1` 及其相關家族的型別，這通常是不必要的。然而，解析可以提供額外的資訊，例如函式原型的識別性。

### 何時解析型別 {id="when-to-resolve-types"}

型別解析是 KSP API 中開銷最高的操作之一。為了避免不必要的解析，KSP 通常不會隱式解析型別參照。相反地，當您的處理器需要解析後的型別時，請明確呼叫 `KSTypeReference.resolve()`。

在可能的情況下，請在解析型別之前先檢查 `KSReferenceElement`。例如，使用 `KSClassifierReference.referencedName()` 來篩選與您的處理器無關的參照。

處理器是否需要解析型別取決於它所需的資訊。以下範例透過在有解析與無解析的情況下檢查相同的屬性型別，來比較這兩種方法。處理器提供者使用 `resolveTypes` 選項來選取要使用的方法：

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

        // 此範例僅檢查頂層屬性。
        val properties = resolver.getAllFiles()
            .flatMap { it.declarations }
            .filterIsInstance<KSPropertyDeclaration>()

        for (property in properties) {
            val name = property.simpleName.asString()
            val reference = property.type

            if (!resolveTypes) {
                // 檢查參照而不明確解析它。
                val element =
                    reference.element as? KSClassifierReference ?: continue

                logger.info(
                    "$name: writtenName=${element.referencedName()}, " +
                        "arguments=${element.typeArguments.size}",
                    property,
                )
            } else {
                // 解析一次，然後重複使用產生的型別。
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

當 `resolveTypes = false` 時，相關輸出為：

```Kotlin
birthday: writtenName=SqlDate, arguments=0
names: writtenName=List, arguments=1
```

當 `resolveTypes = true` 時，輸出為：

```Kotlin
birthday: declaration=java.sql.Date, nullability=NULLABLE
names: declaration=kotlin.collections.List, nullability=NOT_NULL
```

在不進行解析的情況下，處理器可以檢查語法資訊，例如型別名稱和型別引數。例如，它會看到原始碼中書寫的匯入別名 `SqlDate`。解析之後，處理器可以存取有關該型別的語意資訊，例如完全限定宣告名稱以及可 null 性。

## KSP 模型參考 {id="ksp-model-reference"}

下圖說明了主要 KSP API 型別之間的關聯性。它是使用 IntelliJ IDEA 的類別圖功能從 KSP API 原始碼產生的。

![KSP 2 模型的完整類別圖](ksp-class-diagram.svg){thumbnail="true" width="800" thumbnail-same-file="true"}

> [查看完整大小的圖表](https://kotlinlang.org/docs/images/ksp-class-diagram.svg)。
>
{style="note"}

有關完整的 API 定義，請參閱 KSP GitHub 存儲庫中的 [KSP API 原始碼](https://github.com/google/ksp/tree/main/api/src/main/kotlin/com/google/devtools/ksp/symbol/)。