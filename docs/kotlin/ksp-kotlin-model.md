[//]: # (title: KSP 如何对 Kotlin 代码建模)

<web-summary>了解 KSP API 如何将 Kotlin 源代码建模为符号层次结构，以及如何避免高开销的分析。</web-summary>

KSP 将源代码表示为符号层次结构。处理器可以遍历该层次结构以检查源代码中的声明、类型、注解和其他元素。
考虑以下顶层函数：

```kotlin
import com.example.annotations.HelloWorldAnnotation

@HelloWorldAnnotation
fun main() {
    helloWorld()
}
```

KSP 使用以下符号层次结构表示该函数：

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

层次结构中的 `resolve()` 调用表示完整的类型解析。与直接检查按原样书写的类型引用不同，解析它需要 KSP 分析其上下文并确定其所引用的类型。这种额外的分析使得类型解析成为 KSP API 中开销最高的操作之一。

## 类型解析 {id="type-resolution"}

引用类型的属性（例如 `KSAnnotation.annotationType` 和 `KSFunctionDeclaration.returnType`）会返回 `KSTypeReference`。根据属性的不同，它可能是可空的，例如 `returnType`。处理器可以直接检查这些引用，也可以解析它们以获取底层类型的更多信息：

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

`KSTypeReference` 表示未解析的类型。它保留了类型在源代码中呈现的句法表示，包括其注解和修饰符。它的 `element` 属性持有一个 `KSReferenceElement`，用于对 Kotlin 语法中的相应类型元素进行建模。

你可以在不解析 `KSReferenceElement` 的情况下直接检查它。最常见的引用元素类型如下：

* `KSClassifierReference`：提供诸如 `referencedName()` 等信息。
* `KSCallableReference`：提供诸如 `receiverType`、`functionParameters` 和 `returnType` 等信息。

如果处理器生成的代码引用的类型与源代码中的相同，则无需解析这些类型。相反，它可以直接使用 `KSTypeReference` 中提供的类型名称来生成相同的句法类型引用。KSP 会将生成的源文件添加到编译中，随后 Kotlin 编译器会与其他源代码一起解析这些类型引用并进行类型检查。

`KSTypeReference.resolve()` 会将引用解析为 `KSType`，从而允许访问定义该类型的声明：

```kotlin
val ksTypeReference = functionDeclaration.returnType ?: return
val ksType: KSType = ksTypeReference.resolve()
val ksDeclaration: KSDeclaration = ksType.declaration
```

对于函数类型引用，大部分信息已可直接从 `KSCallableReference` 中获取。解析函数类型会生成来自 `Function0`、`Function1` 及相关族的类型，通常是不必要的。但是，解析可以提供额外的信息，例如函数原型的标识。

### 何时解析类型 {id="when-to-resolve-types"}

类型解析是 KSP API 中开销最高的操作之一。为避免不必要的解析，KSP 通常不会隐式解析类型引用。如果你的处理器需要已解析的类型，请显式调用 `KSTypeReference.resolve()`。

在可能的情况下，请在解析类型之前先检查 `KSReferenceElement`。例如，使用 `KSClassifierReference.referencedName()` 过滤掉与处理器无关的引用。

处理器是否需要解析类型取决于它所需的信息。以下示例通过在进行解析和不进行解析的情况下检查相同的属性类型，对这两种方法进行了对比。它使用以下顶层属性作为输入：

```kotlin
import java.sql.Date as SqlDate

val birthday: SqlDate? = null
val names: List<String> = emptyList()
```

处理器提供程序将 `resolveTypes` 选项传递给处理器，以选择使用哪种方式：

```kotlin
import com.google.devtools.ksp.processing.*
import com.google.devtools.ksp.symbol.*

class TypeInventoryProcessor(
    private val logger: KSPLogger,
    private val resolveTypes: Boolean,
) : SymbolProcessor {

    override fun process(resolver: Resolver): List<KSAnnotated> {
        val deferred = mutableListOf<KSAnnotated>()

        // 此示例仅检查顶层属性。
        val properties = resolver.getAllFiles()
            .flatMap { it.declarations }
            .filterIsInstance<KSPropertyDeclaration>()

        for (property in properties) {
            val name = property.simpleName.asString()
            val reference = property.type

            if (!resolveTypes) {
                // 检查引用而不显式解析它。
                val element =
                    reference.element as? KSClassifierReference ?: continue

                logger.info(
                    "$name: writtenName=${element.referencedName()}, " +
                        "arguments=${element.typeArguments.size}",
                    property,
                )
            } else {
                // 解析引用一次，然后复用生成的类型。
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

如果 `resolveTypes = false`，输出如下：

```text
birthday: writtenName=SqlDate, arguments=0
names: writtenName=List, arguments=1
```

如果 `resolveTypes = true`，输出如下：

```text
birthday: declaration=java.sql.Date, nullability=NULLABLE
names: declaration=kotlin.collections.List, nullability=NOT_NULL
```

在不进行解析的情况下，处理器可以检查类型名称和类型实参等句法信息。例如，它按源代码中所书写的方式处理导入的别名 `SqlDate`。而在解析后，处理器可以访问有关该类型的语义信息，例如完全限定声明名称和为 null 性。

## KSP 模型参考 {id="ksp-model-reference"}

下图说明了主要 KSP API 类型之间的关系。

![KSP 2 模型的完整类图。](ksp-class-diagram.svg){thumbnail="true" width="700" thumbnail-same-file="true"}

> [查看完整尺寸图表](https://kotlinlang.org/docs/images/ksp-class-diagram.svg)。
>
{style="tip"}

有关完整的 API 定义，请参阅 KSP GitHub 仓库中的 [KSP API 源码](https://github.com/google/ksp/tree/main/api/src/main/kotlin/com/google/devtools/ksp/symbol/)。

## 另请参阅 {id="see-also"}

* 在 [KSP 快速入门指南](ksp-quickstart.md) 中了解如何将处理器添加到项目中或创建自定义处理器。
* 在 [Java 注解处理到 KSP 参考](ksp-reference.md) 中查找与 Java 注解处理 API 等效的 KSP API。
* 了解 KSP 如何跟踪类型解析以[确定要重新处理哪些文件](ksp-incremental.md#dirtiness-propagation)。
* 探索 KSP 仓库中的[示例项目](https://github.com/google/ksp/tree/main/examples)。
* 在 JetBrains 的 Kotlin YouTube 频道上观看 [Kotlin Symbol Processing (KSP)](https://www.youtube.com/watch?v=bv-VyGM3HCY) 视频。