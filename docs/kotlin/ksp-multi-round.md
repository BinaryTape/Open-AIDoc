[//]: # (title: 多轮处理)

<web-summary>了解 KSP 如何在多轮中运行处理器，以及处理器如何将符号延迟到后续轮次。</web-summary>

KSP 按轮次运行处理器。在每一轮中，处理器可以使用较早轮次中生成的源文件。

若要将符号延迟到下一轮，请从 `SymbolProcessor.process()` 将它们作为 `List<KSAnnotated>` 返回。KSP 会在下一轮中再次将这些符号传递给该处理器。

若要延迟无效符号，请使用 `KSAnnotated.validate()` 对其进行筛选，例如：

```kotlin
override fun process(resolver: Resolver): List<KSAnnotated> {
    val symbols = resolver.getSymbolsWithAnnotation("com.example.annotation.Builder")
    val result = symbols.filter { !it.validate() }.toList()
    symbols
        .filter { it is KSClassDeclaration && it.validate() }
        .forEach { it.accept(BuilderVisitor(), Unit) }
    return result
}
```

> 请参阅 KSP 仓库中包含[多轮处理](https://github.com/google/ksp/blob/main/examples/playground/processors/src/main/kotlin/BuilderProcessor.kt)的完整示例。
>
{style="note"}

当整轮均未生成任何新文件时，多轮处理结束。如果仍有未处理的延迟符号，KSP 将针对每个仍包含延迟符号的处理器记录错误。

## 将符号延迟到下一轮 {id="defer-symbols-to-the-next-round"}

当需要来自其他处理器的附加信息时，处理器可以将符号延迟到后续轮次。处理器可以跨多轮持续延迟某个符号，直到所需信息可用。一旦信息可用，处理器即可处理该符号。

仅在以下情况下延迟符号：

* 在处理该符号之前需要额外信息。
* 该符号源自源代码。

    > 不要延迟来自类路径的符号。KSP 会自动将其筛选掉。
    >
    {style="note"}

例如，为带注解类生成 builder 的处理器可能需要所有构造函数形参类型都解析为具体类型。在第一轮中，某个形参类型可能无法解析。在后续轮次中，由于在此期间生成了文件，该类型可能会变得可解析。随后，处理器即可处理该类。

## 验证符号 {id="validate-symbols"}

验证有助于确定是否将符号延迟到后续轮次。处理器应明确正确处理符号所需的信息。

> 验证通常需要类型解析，这可能会消耗较多资源。请仅检查处理该符号所需的信息。
>
{style="tip"}

默认的验证行为可能并不适用于所有用例。要自定义验证，请使用 `KSValidateVisitor` 并提供一个 `predicate` lambda表达式来选择要验证的符号。

实现自定义验证时，请使用 `KSType.isError` 来确定类型是否有效。如果 `isError` 为 `true`，则表明 KSP 无法解析该类型。利用此信息来决定是否将处理延迟到后续轮次。

## 访问文件与符号 {id="accessing-files-and-symbols"}

新生成的文件和现有文件均可通过 `Resolver` 进行访问。

KSP 提供了两个用于访问文件的 API：

* `Resolver.getAllFiles()` 返回先前已存在的文件和新生成文件的列表。
* `Resolver.getNewFiles()` 仅返回上一轮中生成的文件。

请将 `Resolver.getSymbolsWithAnnotation()` 作为获取相关符号的主要入口点。

在每一轮中，`Resolver.getSymbolsWithAnnotation()` 仅返回新生成文件中的符号以及从上一轮延迟的符号。这有助于避免不必要的重新处理。

## 处理器实例化 {id="processor-instantiation"}

KSP 仅创建一次处理器实例。您可以在处理器实例中存储信息并在多轮中复用它。

然而，并非所有 KSP 符号都可以在轮次之间复用。当处理器生成新文件时，符号解析结果可能会发生变化，这可能会影响之前解析过的符号的有效性。

> 仅使用当前轮次传递给处理器的 `Resolver` 实例。不要跨轮次存储并复用 `Resolver`。
>
{style="note"}

## 错误与异常处理 {id="error-and-exception-handling"}

### 错误 {id="errors"}

处理器通过调用 `KSPLogger.error()` 报告错误。

当处理器报告错误时，KSP 会调用 `SymbolProcessor.onError()` 而不是 `SymbolProcessor.finish()`。处理将在当前轮次完成后停止。

其他处理器在该轮次中继续正常处理。KSP 仅在所有处理器完成当前轮次后才处理错误。

### 异常 {id="exceptions"}

KSP 会区分由 KSP 抛出的异常与由处理器抛出的异常。这两种类型的异常都会立即终止处理，并通过 `KSPLogger` 记录为错误。

请向 KSP 开发者报告 KSP 抛出的异常以供调查。在 [KSP 问题跟踪器](https://github.com/google/ksp/issues)中创建问题。

在发生错误或异常的轮次结束时，KSP 会在所有处理器上调用 `SymbolProcessor.onError()`。`SymbolProcessor` 提供了 `onError()` 的默认空实现。重写该方法以实现自定义的错误处理逻辑。

## 另请参阅 {id="see-also"}

* 了解源代码发生更改时，KSP 如何[决定重新处理哪些文件](ksp-incremental.md)。
* 了解 KSP 如何对 Kotlin 代码建模以及[何时解析类型](ksp-kotlin-model.md#when-to-resolve-types)。