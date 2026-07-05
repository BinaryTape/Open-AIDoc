[//]: # (title: 增量处理)

KSP 支持增量处理：仅当一个或多个依赖项发生更改时，KSP 才会重新处理文件。这避免了不必要的重新处理，从而缩短了编译时间。

增量处理默认启用。在进行调试或需要强制执行全量重新构建时，您可以将其禁用。要将其禁用，请在 `gradle.properties` 文件中添加以下行：

```
ksp.incremental=false
```

## Dirty 文件

如果一个文件是由开发者直接修改的，或者受其他 dirty 文件的更改间接影响的，则该文件被视为 *dirty*（需要重新处理）。

为了确定哪些源是 dirty 的，KSP 依赖于处理程序，处理程序将生成的输出与其对应的输入源相关联。KSP 使用这些关联来识别发生更改时必须重新处理的源。

KSP 只需要一小组最小的根源文件。处理程序将这些源作为导航代码结构的入口点。

根源文件是指其符号直接通过以下任何方法获取的源文件：

* `Resolver.getAllFiles()`
* `Resolver.getSymbolsWithAnnotation()`
* `Resolver.getClassDeclarationByName()`
* `Resolver.getDeclarationsFromPackage()`

处理程序可以通过解析来自根源文件的信息，从其他源文件中获取额外的符号。KSP 会自动跟踪这些依赖项。

在生成输出时，处理程序必须声明对该输出有贡献的根源文件。KSP 使用这些根源文件及其被跟踪的依赖项来确定何时需要重新生成输出。

> 使用 `CodeGenerator` 接口创建输出文件并将输入与输出相关联。有关更多信息，请参阅[源代码中的 `CodeGenerator.kt`](https://github.com/google/ksp/blob/main/api/src/main/kotlin/com/google/devtools/ksp/processing/CodeGenerator.kt)。
>
{style="tip"}

### 聚合和隔离输出

KSP 将生成的输出分为两种类型：聚合 (aggregating) 和隔离 (isolating)。

> 与 Gradle 注解处理不同，KSP 将分类应用于单个输出，而不是整个处理程序。
>
{style="note"}

<deflist collapsible="true">
<def title="聚合 (Aggregating)">

聚合输出可能会受到任何源文件更改的影响，但删除不影响其他文件的文件除外。

任何输入更改都会触发所有聚合输出的重新构建，以及所有对应的已注册、新增或已修改源文件的重新处理。

例如，收集带有特定注解的所有符号的输出就是聚合的。

</def>
<def title="隔离 (Isolating)">

隔离输出仅依赖于其指定的源。

对其他源的更改不会影响该输出。多个源文件可以与单个输出关联。

例如，专门为其实现的接口生成的类就是隔离的。

</def>
</deflist>

### Dirty 状态传播

KSP 通过以下方式传播 dirty 状态：

1.  通过**解析跟踪 (resolution tracing)**：类型解析是跨文件遍历的唯一方式。当处理程序解析类型引用（显式或隐式）时，KSP 会考虑包含该引用的文件与任何定义了影响该解析的符号的文件之间的依赖关系。因此，解析符号的更改可能会将引用文件标记为 dirty。

2.  通过**输入-输出对应关系 (input-output correspondence)**：如果一个源文件被更改或受影响，则与其共享生成输出的所有其他源文件也会被标记为受影响。这将相关文件根据共享的输出划分为等价类。

> 规则 (1) 和 (2) 可以相互重复触发。例如，规则 (1) 可以触发规则 (2)，规则 (2) 随后可以再次触发规则 (1)。
>
{style="tip"}

## 实现原理

依赖项由输入和输出文件之间的多对多关系决定。

以下是 KSP 确定哪些文件需要重新处理的方式：

*   如果输入文件发生了更改，它将始终被重新处理。

    **原因：** 如果输入发生了更改，可能会引入新的信息。处理程序需要使用该输入再次运行。

*   如果输入文件发生了更改并且与某个输出相关联，那么与该相同输出关联的所有其他输入文件也将被重新处理。这会重复发生，直到没有新的 dirty 文件为止。

    **原因：** 一个输出是由一组输入构成的。处理程序可能需要所有输入来重新生成输出。

*   如果未更改的输入文件不与任何聚合输出相关联，它将不会被重新处理。

    **原因：** 该文件由于未更改且不与聚合输出相关联，因此不会影响任何输出。除非上述规则之一适用，否则它不会被重新处理。

例如，考虑一个具有以下结构的项目：

```none
.
├── src
│   ├── sourceA.kt
│   └── sourceB.kt
└── generated
   ├── outputA
   └── outputB
```

一个处理程序：

1.  读取 `sourceA`。

2.  生成 `outputA`。

3.  读取 `sourceB`。

4.  生成 `outputB`。

当 `sourceA` 发生更改时：

*   如果 `outputB` 是聚合的，KSP 会同时重新处理 `sourceA` 和 `sourceB`。

*   如果 `outputB` 是隔离的，KSP 仅重新处理 `sourceA`。

如果添加了 `sourceC`：

*   如果 `outputB` 是聚合的，KSP 会重新处理 `sourceC` 和 `sourceB`。

*   如果 `outputB` 是隔离的，KSP 仅重新处理 `sourceC`。

如果删除了 `sourceA` 或 `sourceB` 中的任何一个，KSP 不需要重新处理任何文件。

## 处理程序示例

以下项目包含类 `A` 和 `B`，其中 `A` 继承自 `B`：

```kotlin
// A.kt
@Interesting
class A : B()

// B.kt
open class B

// Example1Processor.kt
class Example1Processor : SymbolProcessor {
   override fun process(resolver: Resolver) {
       val declA = resolver.getSymbolsWithAnnotation("Interesting").first() as KSClassDeclaration
       val declB = declA.superTypes.first().resolve().declaration
       // B.kt 不是必需的，因为它可以被 KSP 推断为依赖项
       val dependencies = Dependencies(aggregating = true, declA.containingFile!!)
       // outputForA.kt
       val outputName = "outputFor${declA.simpleName.asString()}"
       // outputForA 依赖于 A.kt 和 B.kt
       val output = codeGenerator.createNewFile(dependencies, "com.example", outputName, "kt")
       output.write("// $declA : $declB
".toByteArray())
       output.close()
   }
   // ...
}
```

为了生成 `outputForA`，处理程序：

1.  通过调用 `Resolver.getSymbolsWithAnnotation` 获取 A。

2.  通过在 A 上调用 `KSClassDeclaration.superTypes` 获取 B。

KSP 通过解析跟踪来跟踪此关系，并自动将 `B` 记录为 `A` 的依赖项。因此，您不需要显式地将 `B.kt` 声明为 `outputForA` 的依赖项。

## 报告错误

如果您遇到仅在启用增量处理时才会发生的任何错误，请在 [GitHub 仓库](https://github.com/google/ksp/issues)中创建一个问题并附上相关的日志文件。

1.  通过在 `gradle.properties` 中添加以下行来启用增量处理日志：

    ```
    ksp.incremental.log=true
    ```

2.  执行一次成功完成的清理构建。

3.  通过将生成的日志文件复制到其他位置来保存它们：

    *   `build/kspCaches/<source set>/logs/kspDirtySet.log`
    *   `build/kspCaches/<source set>/logs/kspSourceToOutputs.log`

4.  修改触发该问题的源文件并再次运行构建。

5.  将成功构建和复现该问题的构建中的日志文件都作为附件添加到 GitHub 问题中。