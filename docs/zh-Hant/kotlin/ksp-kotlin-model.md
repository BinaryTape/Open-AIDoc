[//]: # (title: KSP 如何建立 Kotlin 程式碼模型)

<web-summary>了解 KSP API 如何將 Kotlin 原始碼建立為符號階層結構模型，以及如何避免耗費效能的分析。</web-summary>

KSP 將原始碼表示為符號階層結構。處理器可以遍歷此階層結構來檢查原始碼的宣告、型別、註解以及其他元素。
請看以下頂層函式：

```kotlin
import com.example.annotations.HelloWorldAnnotation

@HelloWorldAnnotation
fun main() {
    helloWorld()
}
```

KSP 使用以下符號階層結構來表示此函式：

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

階層結構中的 `resolve()` 呼叫代表完整的型別解析。與直接檢查書寫形式的型別參照不同，解析型別需要 KSP 分析其上下文並確定它所參照的型別。這種額外的分析使得型別解析成為 KSP API 中最耗費效能的操作之一。

## 型別解析 {id="type-resolution"}

參照型別的屬性（例如 `KSAnnotation.annotationType` 與 `KSFunctionDeclaration.returnType`）會傳回 `KSTypeReference`。視屬性而定，它可能是可為 null 的，例如 `returnType`。處理器可以直接檢查這些參照，也可以解析它們以存取底層型別的更多資訊：

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

`KSTypeReference` 表示未解析的型別。它保留了型別在原始碼中呈現的語法表示形式，包括其註解與修飾詞。其 `element` 屬性包含一個 `KSReferenceElement`，該元素建立了 Kotlin 語法中對應型別元素的模型。

你可以在不解析它的情況下檢查 `KSReferenceElement`。最常見的參照元素種類如下：

* `KSClassifierReference`：提供如 `referencedName()` 等資訊。
* `KSCallableReference`：提供如 `receiverType`、`functionParameters` 以及 `returnType` 等資訊。

如果處理器產生的程式碼所參照的型別與原始碼相同，則不需要解析這些型別。相反地，它可以直接使用 `KSTypeReference` 中可用的型別名稱來產生相同的語法型別參照。KSP 會將產生的原始程式碼檔案加入編譯中，隨後 Kotlin 編譯器會將這些型別參照與其餘原始碼一起進行解析和型別檢查。

`KSTypeReference.resolve()` 會將參照解析為 `KSType`，以提供對定義該型別之宣告的存取：

```kotlin
val ksTypeReference = functionDeclaration.returnType ?: return
val ksType: KSType = ksTypeReference.resolve()
val ksDeclaration: KSDeclaration = ksType.declaration
```

對於函式型別參照，大部分資訊都可以從 `KSCallableReference` 中取得。解析函式型別會產生來自 `Function0`、`Function1` 及相關家族的型別，這通常是不必要的。然而，解析可以提供額外的資訊，例如函式原型的識別身分。

### 何時解析型別 {id="when-to-resolve-types"}

型別解析是 KSP API 中最耗費效能的操作之一。為了避免不必要的解析，KSP 通常不會隱式解析型別參照。如果你的處理器需要已解析的型別，請改為明確呼叫 `KSTypeReference.resolve()`。

在可行的情況下，請在解析型別之前先檢查 `KSReferenceElement`。例如，使用 `KSClassifierReference.referencedName()` 來篩選與你的處理器無關的參照。

處理器是否需要解析型別取決於它所需的資訊。以下範例透過在有解析與無解析的情況下檢查相同的屬性型別，來比較這兩種方法。它使用以下頂層屬性作為輸入：

```kotlin
import java.sql.Date as SqlDate

val birthday: SqlDate? = null
val names: List<String> = emptyList()
```

處理器提供者將 `resolveTypes` 選項傳遞給處理器，以選擇要使用的方法：

```kotlin
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
                // 檢查該參照而不明確解析它。
                val element =
                    reference.element as? KSClassifierReference ?: continue

                logger.info(
                    "$name: writtenName=${element.referencedName()}, " +
                        "arguments=${element.typeArguments.size}",
                    property,
                )
            } else {
                // 解析該參照一次，然後重複使用產生的型別。
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

若 `resolveTypes = false`，輸出如下：

```text
birthday: writtenName=SqlDate, arguments=0
names: writtenName=List, arguments=1
```

若 `resolveTypes = true`，輸出如下：

```text
birthday: declaration=java.sql.Date, nullability=NULLABLE
names: declaration=kotlin.collections.List, nullability=NOT_NULL
```

在未解析的情況下，處理器可以檢查型別名稱和型別引數等語法資訊。例如，它會處理原始碼中所書寫的匯入別名 `SqlDate`。解析後，處理器可以存取有關該型別的語意資訊，例如完全限定宣告名稱以及可 null 性。

## KSP 模型參考 {id="ksp-model-reference"}

下圖說明了主要 KSP API 型別之間的關聯。

![KSP 2 模型的完整類別圖。](ksp-class-diagram.svg){thumbnail="true" width="700" thumbnail-same-file="true"}

> [查看完整大小的圖表](https://kotlinlang.org/docs/images/ksp-class-diagram.svg)。
>
{style="tip"}

如需完整的 API 定義，請參閱 KSP GitHub 存儲庫中的 [KSP API 原始碼](https://github.com/google/ksp/tree/main/api/src/main/kotlin/com/google/devtools/ksp/symbol/)。

## 另請參閱 {id="see-also"}

* 在 [KSP 入門指南](ksp-quickstart.md) 中了解如何將處理器加入專案或建立自己的處理器。
* 在 [Java 註解處理到 KSP 參考指南](ksp-reference.md) 中尋找與 Java 註解處理 API 對應的 KSP 項目。
* 了解 KSP 如何追蹤型別解析以[決定要重新處理哪些檔案](ksp-incremental.md#dirtiness-propagation)。
* 探索 KSP 存儲庫中的[範例專案](https://github.com/google/ksp/tree/main/examples)。
* 觀看 Kotlin by JetBrains YouTube 頻道上的 [Kotlin 符號處理 (KSP)](https://www.youtube.com/watch?v=bv-VyGM3HCY) 影片。