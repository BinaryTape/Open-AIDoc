[//]: # (title: KSP 如何对 Kotlin 代码建模)
[//]: # (description: 了解 KSP API 如何通过符号层次结构对 Kotlin 源代码进行建模。)

KSP 将源代码表示为符号层次结构。处理器可以遍历该层次结构，以检查源代码的声明、类型、注解以及其他元素。
考虑以下顶层函数：

```Kotlin
import com.example.annotations.HelloWorldAnnotation

@HelloWorldAnnotation
fun main() {
    helloWorld()
}
```

KSP 使用以下符号层次结构来表示此函数：

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

层次结构中的 `resolve()` 调用表示完整的类型解析。与直接检查按原样书写的类型引用不同，对其进行解析需要 KSP 分析其上下文并确定它所引用的类型。这种额外的分析使得类型解析成为 KSP API 中开销最高的操作之一。继续阅读以了解类型解析的工作原理以及何时使用它。

## 类型解析 {id="type-resolution"}

符号层次结构中的某些属性（例如 `annotationType` 和 `returnType`）表示为 `KSTypeReference`。处理器可以直接检查这些引用，也可以对其进行解析以访问有关底层类型的更多信息。

引用类型的属性（例如 `KSFunctionDeclaration.returnType` 和 `KSAnnotation.annotationType`）会返回一个 `KSTypeReference`。

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

`KSTypeReference` 表示未解析的类型，并保留该类型在源代码中呈现的句法表示。其 `KSReferenceElement` 对 Kotlin 语法中对应的类型元素建模，包括其注解和修饰符。

你可以在不解析 `KSReferenceElement` 的情况下对其进行检查。它可以是以下之一：

* `KSClassifierReference`，提供诸如 `referencedName` 之类的信息。

* `KSCallableReference`，提供诸如 `receiverType`、`functionParameters` 和 `returnType` 之类的信息。

如果处理器生成的代码引用的类型与源代码中的类型相同，则无需解析这些类型。相反，它可以直接利用 `KSTypeReference` 中提供的类型名称来生成相同的句法类型引用。KSP 会将生成的源文件添加到编译中，随后 Kotlin 编译器会连同其余源代码一起对这些类型引用进行解析和类型检查。

`KSTypeReference.resolve()` 将该引用解析为 `KSType`，从而提供对定义该类型的声明的访问：

```Kotlin
val ksTypeReference = functionDeclaration.returnType ?: return
val ksType: KSType = ksTypeReference.resolve()
val ksDeclaration: KSDeclaration = ksType.declaration
```

对于函数类型引用，大多数信息已可从 `KSCallableReference` 中获取。解析函数类型会生成来自 `Function0`、`Function1` 及其相关家族的类型，并且通常是没有必要的。不过，解析可以提供额外的信息，例如函数原型的标识。

### 何时解析类型 {id="when-to-resolve-types"}

类型解析是 KSP API 中开销最高的操作之一。为了避免不必要的解析，KSP 通常不会隐式解析类型引用。相反，当你的处理器需要解析后的类型时，请显式调用 `KSTypeReference.resolve()`。

在可能的情况下，请在解析类型之前先检查 `KSReferenceElement`。例如，使用 `KSClassifierReference.referencedName()` 筛选出与你的处理器无关的引用。

处理器是否需要解析类型取决于它所需的信息。以下示例通过在进行解析和不进行解析的情况下检查相同的属性类型，对比了这两种方法。处理器提供程序使用 `resolveTypes` 选项来选择使用哪种方法：

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

        // This example inspects only top-level properties.
        val properties = resolver.getAllFiles()
            .flatMap { it.declarations }
            .filterIsInstance<KSPropertyDeclaration>()

        for (property in properties) {
            val name = property.simpleName.asString()
            val reference = property.type

            if (!resolveTypes) {
                // Inspect the reference without explicitly resolving it.
                val element =
                    reference.element as? KSClassifierReference ?: continue

                logger.info(
                    "$name: writtenName=${element.referencedName()}, " +
                        "arguments=${element.typeArguments.size}",
                    property,
                )
            } else {
                // Resolve once, then reuse the resulting type.
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

当 `resolveTypes = false` 时，相关输出为：

```Kotlin
birthday: writtenName=SqlDate, arguments=0
names: writtenName=List, arguments=1
```

当 `resolveTypes = true` 时，输出为：

```Kotlin
birthday: declaration=java.sql.Date, nullability=NULLABLE
names: declaration=kotlin.collections.List, nullability=NOT_NULL
```

在未解析的情况下，处理器可以检查诸如类型名称和类型实参等句法信息。例如，它看到的是源代码中所书写的导入别名 `SqlDate`。解析后，处理器可以访问有关该类型的语义信息，例如完全限定声明名称和为 null 性。

## KSP 模型参考 {id="ksp-model-reference"}

下图说明了主要 KSP API 类型之间的关系。它是使用 IntelliJ IDEA 的类图功能从 KSP API 源代码生成的。

![KSP 2 模型的完整类图](ksp-class-diagram.svg){thumbnail="true" width="800" thumbnail-same-file="true"}

> [查看完整尺寸的图表](https://kotlinlang.org/docs/images/ksp-class-diagram.svg)。
>
{style="note"}

有关完整的 API 定义，请参阅 KSP GitHub 仓库中的 [KSP API 源码](https://github.com/google/ksp/tree/main/api/src/main/kotlin/com/google/devtools/ksp/symbol/)。