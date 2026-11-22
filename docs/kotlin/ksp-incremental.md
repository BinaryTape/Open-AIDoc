[//]: # (title: 增量处理)

<web-summary>了解 KSP 中的增量处理如何运作，以及它如何缩短构建时间。</web-summary>

KSP 支持增量处理。仅当一个或多个依赖项发生更改时，它才会重新处理文件。这通过避免不必要的重新处理来缩短编译时间。

增量处理默认处于启用状态。你可以在排查故障或强制完全重新构建时将其禁用。要禁用增量处理，请在 `gradle.properties` 文件中添加以下行：

```properties
ksp.incremental=false
```

## 脏文件 {id="dirty-files"}

*脏*（dirty）文件是指 KSP 需要重新处理的文件。如果开发者直接修改了某个文件，或者其他脏文件的更改间接影响了该文件，该文件就会变为脏文件。

为了确定哪些源码是脏的，KSP 依赖于处理器（processor），它们会将生成的输出与其对应的输入源码相关联。发生更改时，KSP 利用这些关联来识别必须重新处理的源码。

KSP 要求处理器仅声明最小集的*根源文件*（root sources）。处理器将它们用作导航代码结构的入口点。

根源文件是指其符号直接通过以下任一方法获取的源文件：

* `Resolver.getAllFiles()`
* `Resolver.getSymbolsWithAnnotation()`
* `Resolver.getClassDeclarationByName()`
* `Resolver.getDeclarationsFromPackage()`

处理器可以通过解析根源文件中的信息，从其他源文件中获取更多符号。KSP 会自动跟踪这些依赖项。

生成输出时，处理器必须声明对该输出有贡献的根源文件。KSP 会利用这些根源文件及其被跟踪的依赖项来确定何时需要重新生成该输出。

> 使用 `CodeGenerator` 接口创建输出文件并将输入与输出关联。有关更多信息，请参阅 [KSP 源代码中的 `CodeGenerator.kt`](https://github.com/google/ksp/blob/main/api/src/main/kotlin/com/google/devtools/ksp/processing/CodeGenerator.kt)。
>
{style="tip"}

### 聚合输出与隔离输出 {id="aggregating-and-isolating-outputs"}

KSP 将生成的输出分为两类：聚合输出（aggregating）和隔离输出（isolating）。

> 与 Gradle 注解处理不同，KSP 将分类应用于各个输出，而不是整个处理器。
>
{style="note"}

<deflist collapsible="true">
<def title="聚合 (Aggregating)">

聚合输出可能会受到任何源文件更改的影响。例如，用于收集带有特定注解的所有符号的输出。

任何输入更改（包括文件删除）都会触发重新构建所有聚合输出，并重新处理所有对应的已注册、新增或修改的源文件。

</def>
<def title="隔离 (Isolating)">

隔离输出仅依赖于其指定的源文件。例如，为实现特定接口而生成的类就是隔离的。

对显式指定源文件之外的其他源文件进行更改不会影响该输出。一个输出可以与多个源文件关联。

</def>
</deflist>

### 脏状态传播 {id="dirtiness-propagation"}

当文件变脏时，KSP 会按以下方式传播脏状态：

* **解析跟踪 (Resolution tracing)**：当处理器解析类型引用时，KSP 会在包含该引用的文件与每个可能影响结果的文件之间记录依赖关系。如果这些文件中的任何一个发生更改，包含该引用的文件就会变脏。这适用于显式和隐式类型解析。

  处理器只能通过解析类型从一个文件移动到另一个文件，因此这些是 KSP 需要跟踪的唯一跨文件依赖关系。

* **共享输出 (Shared outputs)**：如果某个脏文件对某个生成的输出有贡献，则对同一输出有贡献的所有其他文件也会变脏。这将相关文件根据共享输出划分为等价类。

KSP 会反复应用这两条规则，直到不再出现新的脏文件。例如，通过解析跟踪变脏的文件可能会通过共享输出使其他文件变脏。这些文件随后又可能通过解析跟踪使更多文件变脏。

## 实现机制 {id="implementation"}

依赖关系由输入文件和输出文件之间的多对多关系决定。

KSP 使用以下规则来确定要重新处理哪些文件：

* 如果输入文件发生更改，它将始终被重新处理，因为此更改可能会为处理器引入新信息。
* 如果发生更改的输入文件与某个输出关联，KSP 还会重新处理与同一输出关联的所有其他输入文件。这是因为处理器可能需要所有输入才能重新生成该输出。KSP 会重复此过程，直到不再出现新的脏文件。
* 除非适用上述规则之一，否则未发生更改且未与任何聚合输出关联的输入文件不会被 KSP 重新处理。这样的文件不会对任何输出产生影响。

例如，考虑具有以下结构的项目，其中 `sourceA` 和 `sourceB` 彼此独立，且 `outputA` 是隔离输出：

```text
.
├── src
│   ├── sourceA.kt
│   └── sourceB.kt
└── generated
    ├── outputA
    └── outputB
```

处理器：

* 读取 `sourceA` 并生成 `outputA`。
* 读取 `sourceB` 并生成 `outputB`。

如果 `sourceA` 发生更改：
* 如果 `outputB` 是聚合输出，KSP 将同时重新处理 `sourceA` 和 `sourceB`。
* 如果 `outputB` 是隔离输出，KSP 仅重新处理 `sourceA`。

如果添加了 `sourceC`：
* 如果 `outputB` 是聚合输出，KSP 将重新处理 `sourceC` 和 `sourceB`。
* 如果 `outputB` 是隔离输出，KSP 仅重新处理 `sourceC`。

如果删除了 `sourceA`：
* 如果 `outputB` 是聚合输出，KSP 将重新处理 `sourceB`。
* 如果 `outputB` 是隔离输出，KSP 不需要重新处理任何文件。

如果删除了 `sourceB`，在这两种情况下 KSP 都不需要重新处理任何文件，因为 `sourceB` 是 `outputB` 的唯一源文件。

## 示例处理器 {id="example-processor"}

以下项目包含类 `A` 和 `B`，其中 `A` 继承自 `B`：

```kotlin
// A.kt
@Interesting
class A : B()

// B.kt
open class B

// Example1Processor.kt
class Example1Processor(private val codeGenerator: CodeGenerator) : SymbolProcessor {
    override fun process(resolver: Resolver): List<KSAnnotated> {
        val declA = resolver.getSymbolsWithAnnotation("Interesting")
            .firstOrNull() as? KSClassDeclaration
            // 在后续轮次中，如果没有找到新的带注解符号，则提前返回
            ?: return emptyList()
        val declB = declA.superTypes.first().resolve().declaration
        // 不需要显式包含 B.kt，因为 KSP 可以推导出它是一个依赖项
        val dependencies = Dependencies(aggregating = true, declA.containingFile!!)
        // outputForA.kt
        val outputName = "outputFor${declA.simpleName.asString()}"
        // outputForA 依赖于 A.kt 和 B.kt
        val output = codeGenerator.createNewFile(dependencies, "com.example", outputName, "kt")
        output.write("// $declA : $declB\n".toByteArray())
        output.close()
        return emptyList()
    }
    // ...
}
```

为了生成 `outputForA`，处理器执行以下操作：

1. 调用 `Resolver.getSymbolsWithAnnotation()` 获取 `A`。
2. 通过解析 `A` 的 `superTypes` 中的超类型引用获取 `B`。

KSP 通过解析跟踪来追踪这种关系，并自动将 `B` 记录为 `A` 的依赖项。因此，你不需要将 `B.kt` 显式声明为 `outputForA` 的依赖项。

## 报告错误 {id="reporting-bugs"}

如果遇到仅在启用增量处理时才出现的任何错误，请在 [KSP GitHub 仓库](https://github.com/google/ksp/issues) 中创建问题，并附上相关的日志文件。

要收集日志文件并将其附加到问题中：

1. 在 `gradle.properties` 文件中添加以下行以捕获增量处理日志：

   ```properties
   ksp.incremental.log=true
   ```

2. 执行一次干净构建 (clean build) 并确保其成功完成。
3. 将生成的日志文件复制到其他位置进行保存：

   * `build/kspCaches/<source set>/logs/kspDirtySet.log`
   * `build/kspCaches/<source set>/logs/kspSourceToOutputs.log`

4. 修改触发该问题的源文件，并再次运行构建。
5. 将成功构建以及重现该问题的构建所产生的日志文件附加到 GitHub 问题中。

### 可视化符号依赖图 {id="visualizing-the-symbol-dependency-graph"}

为了帮助调试增量处理，KSP 可以生成一个 Graphviz DOT 文件，用于可视化从指定符号开始的符号依赖图。

启用增量日志记录，并指定作为可视化图起点的符号[完全限定名称](packages.md#package-headers)：

```properties
ksp.incremental.log=true
ksp.incremental.log.graph.origin=<fully-qualified-name>
```

如果你在命令行中使用 KSP，请添加以下选项：

```bash
-incremental-log=true -incremental-log-graph-origin=<fully-qualified-name>
```

KSP 会将该图写入到与其他增量处理日志位于同一 `logs` 目录下的 `kspLookupGraphOrigin.dot` 文件中。

## 另请参阅 {id="see-also"}

* 了解处理器如何[声明其输出的依赖项](ksp-quickstart.md#create-and-register-a-processor)。
* 了解 KSP 如何[分多轮运行处理器](ksp-multi-round.md)。
* 了解 [KSP 如何对 Kotlin 代码建模](ksp-kotlin-model.md)以及何时解析类型。
* 了解如何[从命令行运行 KSP](ksp-command-line.md)（无需适用于 Gradle 的 KSP 插件）。