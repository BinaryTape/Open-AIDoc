# 貢獻

我們對於此專案的目標是建立一個您可以信賴的簡單、快速且安全的組件。我們特意規劃了專案範疇，以便輕鬆處理常見的使用案例，並使其具備擴充性，因此它也能處理特殊的使用案例。

## 不使用生成式工具 {id="no-generative-tools"}

我們不在原始碼或文件中使用 LLM 或生成式工具。我們也不會在提交 (commit)、問題 (issue) 和提取要求 (pull request) 中的人際溝通中使用它們。我們相信寫作即思考，並希望我們的工作是經過深思熟慮的。

我們要求所有貢獻者也這樣做。當每個人都付出努力時，建置 (Building) 會更有趣。

為了保護我們專案的文化，我們將立即拒絕 LLM 產生的貢獻。我們禁止重複違規者。

此政策的一些窄小例外情況：

*   非英語母語人士如果揭露其行為，可以使用機器翻譯工具。
*   本機自動補全 (auto-complete)。（避免使用以權杖 (token) 計費的工具。）

編碼 (Coding) 是很有趣的。

## 程式碼貢獻 {id="code-contributions"}

如果您想為此專案貢獻程式碼，可以透過 GitHub 分支 (fork) 存儲庫並發送提取要求 (pull request)。

提交程式碼時，請盡力遵循現有的慣例與風格，以保持程式碼盡可能具備可讀性。

## SQLDelight {id="sqldelight"}

如果您正想開始嘗試貢獻，請根據您想貢獻的 SQLDelight 部分參閱下方的特定指南。如果您仍不確定，請在您關注的問題 (issue) 中留言說明您卡住的地方，我們會在該處回覆，或者為您想做的事情建立一個問題並開始討論。

### IDE 外掛程式 (Plugin) {id="ide-plugin"}

如果您想修復錯誤 (bug) 或擴充 IDE，程式碼變更通常會發生在 `sqldelight-idea-plugin` 模組中。您可以使用 `./gradlew runIde` 任務來測試您的變更，並可以使用 `./gradlew runIde --debug-jvm` 進行即時偵錯。

如果您在 IDE 中遇到錯誤，但無法在範例專案中重現，您可以對您的 IDE 進行即時偵錯。您需要安裝第二個 IntelliJ 才能執行此操作。您可以使用 [Toolbox](https://www.jetbrains.com/toolbox-app/)，捲動到 IDE 列表底部並選擇不同版本的 IntelliJ 來達成此目的。

在您想使用偵錯工具的 IDE 中，檢出 SQLDelight 存儲庫，然後建立一個新的 `Remote` 執行配置 (Run Configuration)。它會自動填入「Command line arguments for remote JVM」，類似 `-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005`。複製該值，然後開啟您想要偵錯的 IDE。選擇 `Help -> Edit Custom VM Options`，並將複製的內容貼到開啟檔案的底部。重新啟動您要偵錯的 IDE，啟動後開啟您建立配置的 IDE，並使用您建立的遠端配置連接偵錯工具。

有關建置 IDE 外掛程式及其功能的更多資訊，請參閱 [JetBrains 官方文件](https://jetbrains.org/intellij/sdk/docs/reference_guide/custom_language_support.html) 或加入 [JetBrains Platform Slack](https://blog.jetbrains.com/platform/2019/10/introducing-jetbrains-platform-slack-for-plugin-developers/)。

### 驅動程式 (Drivers) {id="drivers"}

如果您有興趣建立自己的驅動程式，可以使用 `runtime` 構件 (artifact) 在 SQLDelight 存儲庫之外進行。若要測試驅動程式，您可以相依於 `driver-test` 並擴充 `DriverTest` 與 `TransactionTest`，以確保其運作符合 SQLDelight 的預期。

#### 非同步驅動程式 {id="asynchronous-drivers"}

發送非同步呼叫的驅動程式可以透過使用 `runtime-async` 構件來實作。

### Gradle {id="gradle"}

如果您遇到 Gradle 問題，請先在 `sqldelight-gradle-plugin/src/test` 中建立一個與該處其他資料夾類似的測試夾具 (test fixture) 來重現您的問題。如果您不知道如何修復，歡迎直接開啟一個帶有此失敗測試的提取要求 (PR)！我們非常歡迎提供測試案例。整合測試展示了如何設定整個 Gradle 專案，該專案將執行 SQLite/MySQL/PostgreSQL 等，並使用各自的執行環境與 SQLDelight 執行 SQL 查詢。如果您在 SQLDelight 中遇到執行期問題，請考慮將測試加入這些已有的整合測試中。

### 編譯器 (Compiler) {id="compiler"}

SQLDelight 的編譯器有多個層級——如果您僅對程式碼產生 (codegen) 感興趣（而非 SQL 的剖析），那麼您會希望在 `sqldelight-compiler` 模組中進行貢獻。如果您對剖析器 (parser) 感興趣，則需要貢獻至 [sql-psi](https://github.com/alecstrong/sql-psi)。SQLDelight 使用 [kotlinpoet](https://github.com/square/kotlinpoet) 來產生 Kotlin 程式碼，請務必使用其 API 來參照 Kotlin 型別，以便匯入仍能正確運作。如果您以任何方式修改了程式碼產生，請在開啟提取要求之前執行 `./gradlew build`，因為它會更新 `sqldelight-compiler:integration-tests` 中的整合測試。如果您想撰寫整合測試（意即在執行環境中執行 SQL 查詢），請將測試加入 `sqldelight-compiler:integration-tests`。

---

## SQL PSI {id="sql-psi"}

在下一節中，我們將介紹如何貢獻至剖析器與 PSI 層，但在執行此操作之前，您應該閱讀一篇關於 [多種方言 (multiple dialects)](https://www.alecstrong.com/posts/multiple-dialects/) 的部落格文章，以了解 [sql-psi](https://github.com/AlecStrong/sql-psi) 中各個動態組件。與 SQLDelight 一樣，如果您遇到問題但不知道如何貢獻修復或需要協助，請在 GitHub 問題中留言或建立一個新問題來開始討論。

對於 SQL-PSI 中的任何變更，您需要將測試夾具加入對應的 `core/src/test/fixtures_*` 資料夾中。`fixtures` 資料夾（無字尾）適用於所有方言。在您的變更合併到 sql-psi 之後，如果 SQLDelight 中也需要進行變更，請檢出 SQLDelight 上的 `sql-psi-dev` 分支並針對該分支提交 PR。它使用 sql-psi 的快照 (snapshot) 版本，因此您可以在 sql-psi 變更合併大約 10 分鐘後建置您的 SQLDelight 變更。

### 語法 (Grammar) {id="grammar"}

如果您要增加語法，首先要決定這是您要加入現有語法的新規則，還是您想要從 ANSI SQL 覆寫的規則（ANSI SQL 位於 [sql.bnf](https://github.com/AlecStrong/sql-psi/blob/master/core/src/main/kotlin/com/alecstrong/sql/psi/core/sql.bnf)）。在這兩種情況下，您都需要在新的語法中定義該規則，但在覆寫 ANSI SQL 規則的情況下，請將其加入 `overrides` 列表並在規則上設定覆寫屬性：

```bnf
overrides ::= my_rule

my_rule ::= SOME_TOKEN {
  override = true
}
```

您的規則定義應從完全複製/貼上 ANSI-SQL 中的規則開始。若要參照來自 ANSI-SQL 的規則，您需要用花括號 `{}` 將其包圍，因此您應該在覆寫規則中用花括號 `{}` 包圍所有外部規則：

```bnf
my_rule ::= internal_rule {external_rule} {
  override = true
}
internal_rule ::= SOME_TOKEN
```

一個需要注意的是，參照來自 ANSI-SQL 的 `expr` 規則應該看起來像 `<<expr '-1'>>`，因為它是特殊的且無法被覆寫。

您想從 ANSI SQL 使用的任何標記 (token) 也應手動匯入：

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

方言不能加入自己的標記，但您可以透過用雙引號 `""` 包圍來要求確切的文字：

```bnf
my_rule ::= "SOME_TOKEN"
```

覆寫規則仍必須產生符合原始規則型別的程式碼，因此請務必為原始規則 `implement` 並 `extend` 現有型別：

```bnf
my_rule ::= internal_rule {external_rule} {
  extends = "com.alecstrong.sql.psi.core.psi.impl.SqlMyRuleImpl"
  implements = "com.alecstrong.sql.psi.core.psi.SqlMyRule"
  overrides = true
}
```

若要查看語法中覆寫規則的範例，請參考 [此 PR](https://github.com/AlecStrong/sql-psi/pull/163/files)，該 PR 為 PostgreSQL 加入了 `RETURNING` 語法。

### 規則行為 {id="rule-behavior"}

通常您會想要修改 PSI 層的行為（例如，針對您想要讓編譯失敗的情況拋出錯誤）。若要執行此操作，請讓您的規則使用 `mixin` 而非 `extends`，這是您撰寫的一個包含新邏輯的類別：

```bnf
my_rule ::= interal_rule {external_rule} {
  mixin = "com.alecstrong.sql.psi.MyRuleMixin"
  implements = "com.alecstrong.sql.psi.core.psi.SqlMyRule"
  overrides = true
}
```

然後在該類別中，確保其導向原始 ANSI SQL 型別與 SQL-PSI 基底類別 `SqlCompositeElementImpl`：

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

例如，[DropIndexMixin](https://github.com/AlecStrong/sql-psi/blob/f1137ff82dd0aa77f741a09d88855fbf9b751c00/core/src/main/kotlin/com/alecstrong/sql/psi/core/psi/mixins/DropIndexMixin.kt) 會驗證正在刪除的索引是否存在於架構 (schema) 中。

---

如果您對本文件未涵蓋的貢獻有任何疑問，請隨時在 SQLDelight 上建立問題或開啟 PR，以便我們改進！