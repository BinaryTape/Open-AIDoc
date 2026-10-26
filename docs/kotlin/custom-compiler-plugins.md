[//]: # (title: 自定义编译器插件)

> Kotlin 编译器插件 API 尚不稳定，且在每个版本中都会引入破坏性变更。
> 
{style="warning"}

编译器插件通过挂钩（hook）编译过程，在代码编译期间对其进行分析或修改，而无需修改编译器本身。例如，它们可以为代码添加注解，或者生成新代码以使其与其他框架或 API 兼容。

在创建自定义编译器插件之前，请查看[可用编译器插件列表](compiler-plugins-overview.md)，了解是否已有适合您用例的插件。

您还可以检查是否可以使用 [Kotlin Symbol Processing (KSP) API](https://kotlinlang.org/docs/ksp-overview.html) 或外部 Lint 分析工具（例如 [Android lint](https://developer.android.com/studio/write/lint)）来实现目标。

如果您_仍然_找不到满足需求的方法，可以创建自定义编译器插件。请注意，Kotlin 编译器插件 API **不稳定**。由于每个新的编译器版本都会引入破坏性变更，您需要持续投入大量精力进行维护。

### Kotlin 编译器与编译器插件 {id="the-kotlin-compiler-and-compiler-plugins"}

<p></p> <!-- workaround for MRK057: Paragraph can only contain inline elements-->
<list columns="2">
    <li>
        <p></p>
        <br/>
        <img src="compiler-stages.svg" width="400" alt="Kotlin compiler stages"/>
    </li>
    <li>
        <p>Kotlin 编译器会：</p>
        <ol>
            <li>解析源代码并将其转换为结构化的语法树。</li>
            <li>通过确定代码含义、解析名称、检查类型以及强制执行可见性规则来分析和解析代码。</li>
            <li>生成中间表示 (Intermediate Representation, IR)，这是一种充当源代码与机器码之间桥梁的数据结构。</li>
            <li>逐步将 IR 降级转换（Lower）为更简单的形式。</li>
            <li>将 Lower 后的 IR 转换为特定于目标的输出，例如 JVM 字节码、JavaScript 或原生机器码。</li>
        </ol>
    </li>
</list>

插件可以通过前端 API 影响编译器的初始阶段，改变编译器解析代码的方式。例如，插件可以添加注解、引入没有函数体的新方法，或者更改可见性修饰符。这些更改在 IDE 中是可见的。

插件还可以通过后端 API 影响后续阶段，修改声明的行为。这些更改会出现在编译完成后生成的二进制文件中。

在实践中，编译器插件会影响从分析和解析到代码生成的各个阶段，涵盖前端和后端。例如，前端部分生成声明，而后端部分为这些声明添加主体。

![Kotlin compiler stages with plugins](compiler-stages-with-plugins.svg){width=650}

[Kotlin serialization 插件](https://github.com/Kotlin/kotlinx.serialization)就是一个很好的例子。该插件的前端部分添加了一个伴生对象和一个序列化器函数，并添加了防止名称冲突的检查。后端部分则通过 `KSerializer` 对象实现所需的序列化行为。

### Kotlin 编译器插件模板 {id="kotlin-compiler-plugin-template"}

要开始编写自定义编译器插件，可以使用 [Kotlin 编译器插件模板](https://github.com/Kotlin/compiler-plugin-template)。然后注册前端和后端插件 API 的扩展点。

> 目前，只能使用 [Gradle](gradle.md) 开发自定义编译器插件。
> 
{style="note"}

### 前端插件 API {id="frontend-plugin-api"}

前端插件 API 也称为前端中间表示 (FIR)，具有以下专门用于自定义解析的扩展点：

| 扩展名称                                                                                                                                                                                      | 描述                                                                              |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------|
| [`FirAdditionalCheckersExtension`](https://github.com/JetBrains/kotlin/blob/master/compiler/fir/checkers/src/org/jetbrains/kotlin/fir/analysis/extensions/FirAdditionalCheckersExtension.kt) | 添加自定义编译器检查器。                                                                 |
| [`FirDeclarationGenerationExtension`](https://github.com/JetBrains/kotlin/blob/master/compiler/fir/providers/src/org/jetbrains/kotlin/fir/extensions/FirDeclarationGenerationExtension.kt)   | 生成新声明。                                                                            |
| [`FirExtensionSessionComponent`](https://github.com/JetBrains/kotlin/blob/master/compiler/fir/tree/src/org/jetbrains/kotlin/fir/extensions/FirExtensionSessionComponent.kt)                  | 在 `FirSession` 中注册自定义组件，供插件的其他部分使用。                                  |
| [`FirFunctionTypeKindExtension`](https://github.com/JetBrains/kotlin/blob/master/compiler/fir/tree/src/org/jetbrains/kotlin/fir/extensions/FirFunctionTypeKindExtension.kt)                  | 定义新的函数类型族。                                                                      |
| [`FirMetadataSerializerPlugin`](https://github.com/JetBrains/kotlin/blob/master/compiler/fir/fir-serialization/src/org/jetbrains/kotlin/fir/serialization/FirMetadataSerializerPlugin.kt)    | 读取声明元数据并向其中写入信息。                                                          |
| [`FirStatusTransformerExtension`](https://github.com/JetBrains/kotlin/blob/master/compiler/fir/resolve/src/org/jetbrains/kotlin/fir/extensions/FirStatusTransformerExtension.kt)             | 修改声明状态属性，例如可见性或模态（modality）。                                          |
| [`FirSupertypeGenerationExtension`](https://github.com/JetBrains/kotlin/blob/master/compiler/fir/resolve/src/org/jetbrains/kotlin/fir/extensions/FirSupertypeGenerationExtension.kt)         | 为现有类添加新的超类型。                                                                  |
| [`FirTypeAttributeExtension`]( https://github.com/JetBrains/kotlin/blob/master/compiler/fir/tree/src/org/jetbrains/kotlin/fir/extensions/FirTypeAttributeExtension.kt)                       | 根据类型注解为某些类型添加特殊属性。                                                      |

#### IDE 集成 {id="ide-integration"}

解析的更改会影响代码高亮显示和建议等 IDE 行为，因此让插件与 IDE 保持兼容至关重要。每个版本的 IntelliJ IDEA 和 Android Studio 都包含一个 Kotlin 编译器的开发版本。该版本特定于 IDE，且与已发布的 Kotlin 编译器并不二进制兼容。因此，当更新 IDE 时，还需要更新编译器插件以使其保持正常工作。出于此原因，社区插件默认不会被加载。

为了确保自定义编译器插件可以在不同的 IDE 版本中正常工作，请针对各个 IDE 版本进行测试并修复发现的任何问题。

如果能提供针对 Kotlin 编译器插件的 devkit，支持多个 IDE 版本可能会变得更加容易。如果您对该功能感兴趣，欢迎在我们的[问题跟踪器](https://youtrack.jetbrains.com/issue/KT-82617)中分享反馈。

### 后端插件 API {id="backend-plugin-api"}

> 后端插件开发难度较大，若要不降低 IDE 或调试器的性能更是如此，因此请谨慎且保守地进行更改。
> 
{style="warning"}

后端插件 API 也称为 IR，具有单个扩展点：[`IrGenerationExtension`](https://github.com/JetBrains/kotlin/blob/master/compiler/ir/backend.common/src/org/jetbrains/kotlin/backend/common/extensions/IrGenerationExtension.kt)。使用此扩展点并重写 `generate()` 函数，可以为前端已生成的声明添加主体，或者更改现有的声明主体。

通过此扩展点所做的更改**未经编译器检查**。您必须确保所做的更改不会破坏编译器在此阶段的预期。例如，您可能会意外引入无效类型、不正确的函数引用，或者引入超出正确作用域的引用。

#### 探索后端插件代码 {id="explore-backend-plugin-code"}

您可以研究 Kotlin serialization 插件的代码，了解后端插件编译器代码在实践中的样貌。例如，[`SerializableCompanionIrGenerator.kt`](https://github.com/JetBrains/kotlin/blob/master/plugins/kotlinx-serialization/kotlinx-serialization.backend/src/org/jetbrains/kotlinx/serialization/compiler/backend/ir/SerializerIrGenerator.kt) 会为关键序列化器成员填充缺失的主体。一个示例是 [`generateChildSerializersGetter()`](https://github.com/JetBrains/kotlin/blob/9cfa558902abc13d245c825717026af63ef82dd2/plugins/kotlinx-serialization/kotlinx-serialization.backend/src/org/jetbrains/kotlinx/serialization/compiler/backend/ir/SerializerIrGenerator.kt#L242) 函数，它会收集 `KSerializer` 表达式的列表并在数组中返回它们。

#### 检查后端插件代码是否存在问题 {id="check-your-backend-plugin-code-for-problems"}

可以通过三种方式检查后端插件代码中的问题：

1. **验证 IR**

    构建 IR 树并启用 `Xverify-ir` 编译器选项。此选项对编译速度有性能影响，因此建议仅在测试期间使用。

2. **转储并比较 IR 输出**

    使用 `-Xphases-to-dump-before=ExternalPackageParentPatcherLowering` 编译器选项在 IR lowering 编译阶段之后创建转储文件。对于 JVM 后端，请使用 `-Xdump-directory=<your-file-directory>` 编译器选项配置转储目录。手动编写预期代码，生成另一个转储文件，然后比较两者以查看是否存在差异。

3. **调试编译器代码**

    在 `convertToIr.kt` 文件中，于 `convertToIrAndActualize()` 函数中添加断点，并在调试模式下运行编译器，以在编译期间获取更详细的信息。

### 测试您的插件 {id="test-your-plugin"}

实现插件后，请对其进行充分测试。[Kotlin 编译器插件模板](https://github.com/Kotlin/compiler-plugin-template)已配置为使用 [Kotlin 编译器测试框架](https://github.com/JetBrains/kotlin/blob/master/compiler/test-infrastructure/ReadMe.md)。您可以在以下目录中添加测试：

* `compiler-plugin/testData`
* `compiler-plugin/testData/box` 用于代码生成测试
* `compiler-plugin/testData/diagnostics` 用于诊断测试

当测试运行时，该框架会：

1. 解析测试源文件。例如，[`anotherBoxTest.kt`](https://github.com/Kotlin/compiler-plugin-template/blob/master/compiler-plugin/testData/box/anotherBoxTest.kt)
2. 为每个文件构建 FIR 和 IR。
3. 将这些内容写入文本转储文件。例如，[`anotherBoxTest.fir.txt`](https://github.com/Kotlin/compiler-plugin-template/blob/master/compiler-plugin/testData/box/anotherBoxTest.fir.txt) 和 [`anotherBoxTest.fir.ir.txt`](https://github.com/Kotlin/compiler-plugin-template/blob/master/compiler-plugin/testData/box/anotherBoxTest.fir.ir.txt)。
4. 将这些文件与之前创建的文件（如果存在）进行比较。

您可以使用这些文件来检查生成的差异中是否存在非预期的更改。如果没有问题，新的转储文件将成为您最新的_基准（golden）_文件：作为经过批准且可信的基准，用于与未来的更改进行比对。

### 获取帮助 {id="get-help"}

如果在开发自定义编译器插件时遇到问题，可以在 [Kotlin Slack](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up) 的 [#compiler](https://slack-chats.kotlinlang.org/c/compiler) 频道中寻求帮助。我们无法保证一定能提供解决方案，但会尽力提供协助。