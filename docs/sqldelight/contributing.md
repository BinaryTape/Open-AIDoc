# 贡献

我们在本项目中的目标是构建一个您可以信任的简单、快速且安全的组件。我们刻意缩小了项目的范围，以便轻松应对常见的**用例**，并使其具有**可扩展性**，从而也能处理一些特殊的**用例**。

## 禁止使用生成式工具 {id="no-generative-tools"}

我们不在源代码或**文档**中使用大语言模型 (LLM) 或生成式工具。我们不在**提交**、**问题**和**拉取请求 (PR)** 中将它们用于人与人之间的交流。我们相信写作即思考，并希望我们的工作是经过深思熟虑的。

我们要求所有贡献者也这样做。当每个人都在努力时，构建过程会更有趣。

为了保护我们项目的文化，我们会立即拒绝由大语言模型 (LLM) **生成**的贡献。我们禁止重复违规者。

本政策的一些细微例外：

* 非英语母语者如果公开说明，可以使用机器翻译工具。
* 本地自动补全。（避免使用按**令牌**计费的工具。）

编码很有趣。

## 代码贡献 {id="code-contributions"}

如果您想为本项目贡献代码，可以通过在 GitHub 上**复刻**仓库并发送**拉取请求 (PR)** 来实现。

提交代码时，请尽力遵循现有的**约定**和样式，以保持代码尽可能具有可读性。

## SQLDelight {id="sqldelight"}

如果您想开始参与贡献，请参阅下方根据您想贡献的 SQLDelight 部分提供的特定指南。如果您仍然不确定，请在您正在查看的**问题**中留言，说明您卡在哪里，我们会在那里进行回复——或者为您尝试做的事情创建一个**问题**并开始讨论。

### IDE 插件 {id="ide-plugin"}

如果您想修复**错误**或扩展 IDE，代码更改通常会发生在 `sqldelight-idea-plugin` 模块中。您可以使用 `./gradlew runIde` **任务**测试您的更改，并可以使用 `./gradlew runIde --debug-jvm` 进行实时**调试**。

如果您在 IDE 中遇到**错误**但在示例项目中无法复现，您可以对您的 IDE 进行实时**调试**。为此，您需要安装第二个 IntelliJ。您可以通过 [Toolbox](https://www.jetbrains.com/toolbox-app/) 来实现：滚动到 IDE 列表底部并选择不同版本的 IntelliJ。

在您想使用**调试器**的 IDE 中，检出 SQLDelight **仓库**，然后创建一个新的 `Remote` **运行配置**。它会自动填充 "Command line arguments for remote JVM"，类似于 `-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005`。复制该值，然后打开您想要**调试**的 IDE。选择 `Help -> Edit Custom VM Options`，并将复制的行粘贴到打开的文件末尾。重新启动您要**调试**的 IDE，启动后打开您创建配置的 IDE，并使用您创建的远程配置连接**调试器**。

有关构建 IDE **插件**及其功能的更多信息，请参阅 [官方 Jetbrains 文档](https://jetbrains.org/intellij/sdk/docs/reference_guide/custom_language_support.html) 或加入 [Jetbrains Platform Slack](https://blog.jetbrains.com/platform/2019/10/introducing-jetbrains-platform-slack-for-plugin-developers/)。

### 驱动程序 {id="drivers"}

如果您有兴趣创建自己的驱动程序，可以使用 `runtime` **构件**在 SQLDelight **仓库**之外进行。要测试驱动程序，您可以依赖 `driver-test` 并扩展 `DriverTest` 和 `TransactionTest`，以确保其按 SQLDelight 预期的方式工作。

#### 异步驱动程序 {id="asynchronous-drivers"}

进行异步调用的驱动程序可以使用 `runtime-async` **构件**来实现。

### Gradle {id="gradle"}

如果您遇到 Gradle **问题**，请先在 `sqldelight-gradle-plugin/src/test` 中创建一个类似于该目录下其他**文件夹**的**固定例程**，以复现您的**问题**。如果您不知道如何修复，请随时开启一个包含此失败测试的 **拉取请求 (PR)**！我们非常欢迎测试用例。集成测试展示了如何设置整个 Gradle 项目，该项目将运行 SQLite/MySQL/PostgreSQL 等，并使用它们各自的运行时环境和 SQLDelight 执行 SQL **查询**。如果您在 SQLDelight 中遇到运行时**问题**，请考虑在这些现有的集成测试中添加测试。

### 编译器 {id="compiler"}

SQLDelight 的**编译器**有许多层——如果您只对**代码生成**（而不是 SQL 的**解析**）感兴趣，那么您需要在 `sqldelight-compiler` 模块中进行贡献。如果您对**解析器**感兴趣，则需要向 [sql-psi](https://github.com/alecstrong/sql-psi) 贡献代码。SQLDelight 使用 [kotlinpoet](https://github.com/square/kotlinpoet) 来**生成** Kotlin 代码，请务必使用其 API 来引用 Kotlin 类型，以便**导入**仍能正常工作。如果您以任何方式修改了**代码生成**，请在开启**拉取请求 (PR)** 之前运行 `./gradlew build`，因为它会更新 `sqldelight-compiler:integration-tests` 中的集成测试。如果您想编写集成测试（即在运行时环境中运行 SQL **查询**），请在 `sqldelight-compiler:integration-tests` 中添加测试。

---

## SQL PSI {id="sql-psi"}

在下一节中，我们将介绍如何为**解析器**和 PSI 层做贡献，但在那之前，您应该阅读一篇关于[多个方言](https://www.alecstrong.com/posts/multiple-dialects/)的**博客**文章，以了解 [sql-psi](https://github.com/AlecStrong/sql-psi) 中各种变动的部分。与 SQLDelight 一样，如果您遇到**问题**但不知道如何贡献修复或需要帮助，请在 GitHub **问题**中留言或创建一个新**问题**以开始讨论。

对于 SQL-PSI 中的任何更改，您都需要在相应的 `core/src/test/fixtures_*` **文件夹**中添加一个**固定例程**。`fixtures` **文件夹**（无后缀）适用于所有**方言**。在您的更改合并到 sql-psi 后，如果 SQLDelight 中也需要进行更改，请检出 SQLDelight 上的 `sql-psi-dev` **分支**，并针对该**分支**提交您的 **拉取请求 (PR)**。它使用 sql-psi 的**快照**版本，因此您可以在 sql-psi 的更改合并后大约 10 分钟构建您的 SQLDelight 更改。

### 语法 {id="grammar"}

如果您正在添加**语法**，首先要决定这是您添加到现有**语法**中的新**规则**，还是您想要从 ANSI SQL（可在 [sql.bnf](https://github.com/AlecStrong/sql-psi/blob/master/core/src/main/kotlin/com/alecstrong/sql/psi/core/sql.bnf) 中找到）中**重写**的**规则**。在这两种情况下，您都需要在新**语法**中定义该**规则**，但在**重写** ANSI SQL **规则**的情况下，请将其添加到**重写**列表并在**规则**上设置 `override` **特性**：

```bnf
overrides ::= my_rule

my_rule ::= SOME_TOKEN {
  override = true
}
```

您的**规则**定义应首先精确复制/粘贴 ANSI-SQL 中的**规则**。要引用来自 ANSI-SQL 的**规则**，您需要将其包裹在 {} 中，因此您应该在**重写规则**中用 {} 包裹所有外部**规则**：

```bnf
my_rule ::= internal_rule {external_rule} {
  override = true
}
internal_rule ::= SOME_TOKEN
```

一个注意事项是，引用来自 ANSI-SQL 的 `expr` **规则**时应写为 `<<expr '-1'>>`，因为它很特殊，无法被**重写**。

您想从 ANSI SQL 中使用的任何**令牌**也应手动**导入**：

```bnf
{
  parserImports = [
    "static com.alecstrong.sql.psi.core.psi.SqlTypes.DELETE"
    "static com.alecstrong.sql.psi.core.psi.SqlTypes.FROM"
  ]
}
overrides ::= delete

delete ::= DELETE FROM {table_name} {
  override = true
}
```

**方言**不能添加自己的**令牌**，但您可以通过用 "" 包裹来要求精确的文本：

```bnf
my_rule ::= "SOME_TOKEN"
```

**重写规则**必须仍然**生成**符合原始**规则**类型的代码，因此请确保为原始**规则****实现**并扩展现有类型：

```bnf
my_rule ::= internal_rule {external_rule} {
  extends = "com.alecstrong.sql.psi.core.psi.impl.SqlMyRuleImpl"
  implements = "com.alecstrong.sql.psi.core.psi.SqlMyRule"
  overrides = true
}
```

要查看**语法**中**重写规则**的示例，请查看[此 PR](https://github.com/AlecStrong/sql-psi/pull/163/files)，它为 PostgreSQL 添加了 `RETURNING` **语法**。

### 规则行为 {id="rule-behavior"}

通常您希望修改 PSI 层的行为（例如，对于您希望**编译**失败的情况抛出错误）。为此，请让您的**规则**使用 `mixin`（**混入**）而不是 `extends`，这是一个包含新逻辑的类：

```bnf
my_rule ::= interal_rule {external_rule} {
  mixin = "com.alecstrong.sql.psi.MyRuleMixin"
  implements = "com.alecstrong.sql.psi.core.psi.SqlMyRule"
  overrides = true
}
```

然后在该类中确保它**实现**了原始 ANSI SQL 类型和 SQL-PSI 基类 `SqlCompositeElementImpl`：

```
class MyRule(
  node: ASTNode
) : SqlCompositeElementImpl(node),
    SqlMyRule {
  fun annotate(annotationHolder: SqlAnnotationHolder) {
    if (internal_rule.text == "bad_text") {
      annotationHolder.createErrorAnnotation("Invalid text value", internal_rule)
    }
  }
}
```

例如，[DropIndexMixin](https://github.com/AlecStrong/sql-psi/blob/f1137ff82dd0aa77f741a09d88855fbf9b751c00/core/src/main/kotlin/com/alecstrong/sql/psi/core/psi/mixins/DropIndexMixin.kt) 验证了正在删除的**索引**是否存在于**架构**中。

---

如果您有任何关于贡献的**问题**且本文档未涵盖，请随时在 SqlDelight 上开启一个**问题**或开启一个 **拉取请求 (PR)**，以便我们改进它！