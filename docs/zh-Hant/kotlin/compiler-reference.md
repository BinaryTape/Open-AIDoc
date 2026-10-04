[//]: # (title: Kotlin 編譯器選項)

<show-structure depth="1"/>

Kotlin 的每個版本都包含適用於支援目標的編譯器：
JVM、JavaScript 以及適用於[受支援平台](native-overview.md#target-platforms)的原生二進位檔。

這些編譯器會由以下工具使用：
* 當您在 Kotlin 專案中點擊 __Compile__ 或 __Run__ 按鈕時的 IDE。
* 當您在主控台或 IDE 中呼叫 `gradle build` 時的 Gradle。
* 當您在主控台或 IDE 中呼叫 `mvn compile` 或 `mvn test-compile` 時的 Maven。

您也可以按照[使用命令列編譯器](command-line.md)教學中的說明，從命令列手動執行 Kotlin 編譯器。

## 編譯器選項 {id="compiler-options"}

Kotlin 編譯器提供了許多用於自訂編譯程序的選項。
本頁列出了針對不同目標的編譯器選項以及各個選項的說明。

有幾種設定編譯器選項及其值（_編譯器引數_）的方式：
* 在 IntelliJ IDEA 中，於 **Settings/Preferences** | **Build, Execution, Deployment** | **Compiler** | **Kotlin Compiler** 的 **Additional command line parameters** 文字欄位中填入編譯器引數。
* 若您使用 Gradle，請在 Kotlin 編譯任務的 `compilerOptions` 屬性中指定編譯器引數。
如需詳細資訊，請參閱 [Gradle 編譯器選項](gradle-compiler-options.md#how-to-define-options)。
* 若您使用 Maven，請在 Maven 外掛程式節點的 `<configuration>` 元素中指定編譯器引數。
如需詳細資訊，請參閱 [Maven](maven-kotlin-compiler.md#specify-compiler-options)。
* 若您執行命令列編譯器，可直接將編譯器引數新增至工具呼叫中，或將它們寫入 [argfile](#argfile)。

  例如：

  ```bash
  $ kotlinc hello.kt -include-runtime -d hello.jar
  ```

  > 在 Windows 上，當您傳遞包含分隔符號字元（空白字元、`=`、`;`、`,`）的編譯器引數時，
  > 請使用雙引號（`"`）將這些引數括起來。
  > ```
  > $ kotlinc.bat hello.kt -include-runtime -d "My Folder\hello.jar"
  > ```
  {style="note"}

## 編譯器選項架構 {id="schema-for-compiler-options"}

所有編譯器選項的通用結構（Schema）均作為 JAR 構件發佈於 [`org.jetbrains.kotlin:kotlin-compiler-arguments-description`](https://central.sonatype.com/artifact/org.jetbrains.kotlin/kotlin-compiler-arguments-description) 下。
此構件包含所有編譯器選項說明的程式碼表示法以及對應的 JSON 格式（供非 Kotlin 使用者使用），
以及中繼資料，例如每個選項被引入或穩定化的版本。

## 通用選項 {id="common-options"}

以下選項適用於所有 Kotlin 編譯器。

### -api-version _version_ {id="api-version-version"}

設定 API 版本，以控制您的程式碼在執行時可以使用哪些 Kotlin API。例如，如果您使用 Kotlin 編譯器版本 2.4.0 搭配 `-api-version=2.1`，您的程式碼仍將保持與 Kotlin 標準程式庫 2.1.0 相容。

您不能將 `-api-version` 的值設定得高於 `-language-version` 的值。

在大多數情況下，API 版本應與[語言版本](#language-version-version)相同。例外情況是當您為必須在較舊版本 Kotlin 標準程式庫上執行的使用者開發程式庫時。在這種情況下，請設定較舊的 API 版本，以避免意外使用這些使用者無法取得的 API。

如需更多關於 API 版本如何影響相容性的資訊，請參閱[程式庫作者的回溯相容性指引](api-guidelines-backward-compatibility.md#choose-compatible-language-and-api-versions)。

### -help (-h) {id="help-h"}

顯示使用方式資訊並結束。僅顯示標準選項。
若要顯示進階選項，請使用 `-X`。

### -kotlin-home _path_ {id="kotlin-home-path"}

指定自訂的 Kotlin 編譯器路徑，用於尋找執行時程式庫。

### -language-version _version_ {id="language-version-version"}

設定語言版本，以控制在編譯期間可以使用哪些 Kotlin 語言特性。

例如，如果您希望在不改變編譯器行為的情況下獲益於新的編譯效能改進，
可以使用新的編譯器版本搭配較舊的語言版本。使用較舊的語言版本時，您無法使用較新的語言特性，
但也不會看到該版本之後引入的新錯誤和棄用通知。
這種方法對於需要維持與舊版 Kotlin 相容性的程式庫作者特別有用。
如需詳細資訊，請參閱[程式庫作者的回溯相容性指引](api-guidelines-backward-compatibility.md#choose-compatible-language-and-api-versions)。

您可以將最新的三個 Kotlin 穩定版本之一設定為語言版本。例如，Kotlin 2.5.0
支援低至 2.2 的語言版本。

如果您使用較舊的語言版本，您也需要使用較舊的 API 版本。
如需詳細資訊，請參閱 [](#api-version-version)。

> 從技術上講，您可以配置較新的語言版本，以便在即將推出的語言特性穩定之前嘗試它們。
> 不過，最好依照各個特性的專用說明來單獨啟用它們。
> 
{style="tip"}

### -opt-in _annotation_ {id="opt-in-annotation"}

啟用[需要選擇加入](opt-in-requirements.md)的 API 使用，需指定該需求註解的完全限定名稱。

### -P plugin:pluginId:optionName=value {id="p-plugin-pluginid-optionname-value"}

將選項傳遞給 Kotlin 編譯器外掛程式。
核心外掛程式及其選項列於文件的[核心編譯器外掛程式](components-stability.md#core-compiler-plugins)一節中。

### -progressive {id="progressive"}

為編譯器啟用[漸進模式](whatsnew13.md#progressive-mode)。

在漸進模式下，針對不穩定程式碼的棄用和錯誤修復會立即生效，
而不是經歷漸進式的遷移週期。
在漸進模式下編寫的程式碼可向前相容；但是，在非漸進模式下編寫的程式碼在漸進模式下可能會導致編譯錯誤。

### -script {id="script"}

評估 Kotlin 指令碼檔案。當使用此選項呼叫時，編譯器會執行指定引數中的第一個 Kotlin 指令碼（`*.kts`）檔案。

### -verbose {id="verbose"}

啟用詳細記錄輸出，其中包含編譯程序的詳細資訊。

### -version {id="version"}

顯示編譯器版本。

### -X {id="x"}

<primary-label ref="experimental-general"/>

顯示關於進階選項的資訊並結束。這些選項目前處於不穩定狀態：
其名稱和行為可能會在不另行通知的情況下變更。

### Kotlin 協約選項 {id="kotlin-contract-options"}
<primary-label ref="experimental-general"/>

以下選項可啟用實驗性的 Kotlin 協約（Contract）功能。

#### -Xallow-contracts-on-more-functions {id="xallow-contracts-on-more-functions"}

在其他宣告中啟用協約，包括屬性存取子、特定運算子函式以及泛型型別上的型別斷言。

#### -Xallow-condition-implies-returns-contracts {id="xallow-condition-implies-returns-contracts"}

允許在協約中使用 `returnsNotNull()` 函式，以假定指定條件下的非 null 傳回值。

#### -Xallow-holdsin-contract {id="xallow-holdsin-contract"}

允許在協約中使用 `holdsIn` 關鍵字，以假定 Lambda 內的布林運算式為 `true`。

#### -Xallow-returns-result-of {id="xallow-returns-result-of"}

允許使用 `returnsResultOf()` 協約，使未使用的傳回值檢查器能夠區分可忽略的結果與高階函式產生的有意義結果。

### -Xallow-reified-type-in-catch {id="xallow-reified-type-in-catch"}
<primary-label ref="experimental-general"/>

在 `inline` 函式的 `catch` 子句中啟用對具體化（reified）`Throwable` 型別參數的支援。

### -Xcollection-literals {id="xcollection-literals"}
<primary-label ref="experimental-general"/>

啟用對使用方括號語法 `[]` 的[集合常值](whatsnew24.md#support-for-collection-literals)的支援。

### -Xcompiler-plugin-order={plugin.before>plugin.after} {id="xcompiler-plugin-order-plugin-before-plugin-after"}
<primary-label ref="experimental-general"/>

設定編譯器外掛程式的執行順序。編譯器會先執行 `plugin.before`，然後執行 `plugin.after`：

您可以為三個或更多外掛程式定義多個排序規則。例如：

```bash
kotlinc -Xcompiler-plugin-order=plugin.first>plugin.middle
kotlinc -Xcompiler-plugin-order=plugin.middle>plugin.last
```

這將產生以下執行順序：

1. `plugin.first`
2. `plugin.middle`
3. `plugin.last`

若某個編譯器外掛程式不存在，則會忽略對應的規則。

您可以透過外掛程式 ID 設定以下外掛程式：

| 編譯器外掛程式             | 外掛程式 ID                                  |
|-----------------------------|--------------------------------------------|
| `all-open`, `kotlin-spring` | `org.jetbrains.kotlin.allopen`             |
| AtomicFU                    | `org.jetbrains.kotlinx.atomicfu`           |
| Compose                     | `androidx.compose.compiler.plugins.kotlin` |
| `js-plain-objects`          | `org.jetbrains.kotlinx.jspo`               |
| `jvm-abi-gen`               | `org.jetbrains.kotlin.jvm.abi`             |
| kapt                        | `org.jetbrains.kotlin.kapt3`               |
| Lombok                      | `org.jetbrains.kotlin.lombok`              |
| `no-arg`, `kotlin-jpa`      | `org.jetbrains.kotlin.noarg`               |
| Parcelize                   | `org.jetbrains.kotlin.parcelize`           |
| Power-assert                | `org.jetbrains.kotlin.powerassert`         |
| SAM with receiver           | `org.jetbrains.kotlin.samWithReceiver`     |
| Serialization               | `org.jetbrains.kotlinx.serialization`      |

此執行順序僅控制編譯器外掛程式的後端，而不控制前端。

### -Xdata-flow-based-exhaustiveness {id="xdata-flow-based-exhaustiveness"}
<primary-label ref="experimental-general"/>

為 `when` 運算式啟用基於資料流的窮舉性檢查。

### -Xexplicit-context-arguments {id="xexplicit-context-arguments"}
<primary-label ref="experimental-general"/>

為上下文參數啟用明確的[上下文引數](context-parameters.md#pass-context-arguments-explicitly)。

這可讓您在呼叫點透過傳遞上下文引數來解決多載模稜兩可的問題。

### -Xklib-ir-inliner {id="xklib-ir-inliner"}
<primary-label ref="experimental-general"/>

設定是否為 Kotlin/Native、Kotlin/JS 和 Kotlin/Wasm 啟用[模組內內嵌](whatsnew24.md#consistent-intra-module-function-inlining-during-klib-compilation)。預設為啟用。

此選項支援以下模式：

* `disabled`：停用 Kotlin/Native、Kotlin/JS 和 Kotlin/Wasm 的模組內內嵌。
* `full`：啟用跨模組內嵌。

### -Xintrinsic-const-evaluation {id="xintrinsic-const-evaluation"}
<primary-label ref="experimental-general"/>

啟用[改進的編譯期常數](whatsnew24.md#improved-compile-time-constants)。

### -Xname-based-destructuring {id="xname-based-destructuring"}
<primary-label ref="experimental-opt-in"/>

設定編譯器如何根據屬性名稱解譯[解構宣告](destructuring-declarations.md#name-based-destructuring)。

此選項支援以下模式：

* `only-syntax`：啟用明確形式的基於名稱解構，而不變更現有解構宣告的行為。
* `name-mismatch`：當資料類別中的基於位置解構所使用的變數名稱與屬性名稱不相符時回報警告。
* `complete`：啟用使用圓括號的簡短形式基於名稱解構，並繼續支援使用方括號語法的基於位置解構。

### -Xphases-to-dump-before {id="xphases-to-dump-before"}
<primary-label ref="experimental-general"/>

設定為 `ExternalPackageParentPatcherLowering` 以在 IR Lowering 編譯階段後建立傾印檔案。使用 [`-Xdump-directory`](#xdump-directory) 編譯器選項設定 Kotlin/JVM 的輸出目錄。

### -Xrepl {id="xrepl"}
<primary-label ref="experimental-general"/>

啟動 Kotlin REPL。

```bash
kotlinc -Xrepl
```

### -Xreturn-value-checker {id="xreturn-value-checker"}
<primary-label ref="experimental-general"/>

設定編譯器如何[回報被忽略的結果](unused-return-value-checker.md)：

* `disable`：停用未使用的傳回值檢查器（預設）。
* `check`：啟用檢查器，並針對來自已標記函式的被忽略結果回報警告。
* `full`：啟用檢查器，將專案中的所有函式均視為已標記，並針對被忽略的結果回報警告。

### 警告管理 {id="warning-management"}

#### -nowarn {id="nowarn"}

在編譯期間隱藏所有警告。

#### -Werror {id="werror"}

將所有警告視為編譯錯誤。

#### -Wextra {id="wextra"}

啟用[額外的宣告、運算式和型別編譯器檢查](whatsnew21.md#extra-compiler-checks)，若符合條件則發出警告。

#### -Xrender-internal-diagnostic-names {id="xrender-internal-diagnostic-names"}
<primary-label ref="experimental-general"/>

在警告旁輸出內部診斷名稱。這有助於識別針對 `-Xwarning-level` 選項設定的 `DIAGNOSTIC_NAME`。

#### -Xwarning-level {id="xwarning-level"}
<primary-label ref="experimental-general"/>

設定特定編譯器警告的嚴重等級：

```bash
kotlinc -Xwarning-level=DIAGNOSTIC_NAME:(error|warning|disabled)
```

* `error`：僅將指定的警告提升為錯誤。
* `warning`：針對指定的診斷發出警告，且此為預設啟用狀態。
* `disabled`：僅在整個模組範圍內隱藏指定的警告。

您可以透過將整個模組的規則與特定規則相結合，來調整專案中的警告回報機制：

| 指令                                               | 說明                                                        |
|----------------------------------------------------|-------------------------------------------------------------|
| `-nowarn -Xwarning-level=DIAGNOSTIC_NAME:warning`  | 隱藏除指定警告之外的所有警告。                              |
| `-Werror -Xwarning-level=DIAGNOSTIC_NAME:warning`  | 將除指定警告之外的所有警告提升為錯誤。                      |
| `-Wextra -Xwarning-level=DIAGNOSTIC_NAME:disabled` | 啟用除指定檢查之外的所有額外檢查。                          |

如果您有許多要從通用規則中排除的警告，可以使用 [`@argfile`](#argfile) 將它們列在單獨的檔案中。

您可以使用 [`-Xrender-internal-diagnostic-names`](#xrender-internal-diagnostic-names) 來找出 `DIAGNOSTIC_NAME`。

### @argfile {id="argfile"}

從指定檔案讀取編譯器選項。此類檔案可包含帶有值的編譯器選項以及原始碼檔案的路徑。選項和路徑之間應以空白字元分隔。例如：

```
-include-runtime -d hello.jar hello.kt
```

若要傳遞包含空白字元的值，請使用單引號（**'**）或雙引號（**"**）將其括起來。如果值內部包含引號，請使用反斜線（**\\**）進行跳脫。

```
-include-runtime -d 'My folder'
```

您也可以傳遞多個引數檔案，例如將編譯器選項與原始碼檔案分開：

```bash
$ kotlinc @compiler.options @classes
```

如果檔案位於與當前目錄不同的位置，請使用相對路徑。

```bash
$ kotlinc @options/compiler.options hello.kt
```

## Kotlin/JVM 編譯器選項 {id="kotlin-jvm-compiler-options"}

適用於 JVM 的 Kotlin 編譯器會將 Kotlin 原始碼檔案編譯為 Java 類別檔案。
Kotlin 到 JVM 編譯的命令列工具為 `kotlinc` 和 `kotlinc-jvm`。
您也可以使用它們來執行 Kotlin 指令碼檔案。

除[通用選項](#common-options)外，Kotlin/JVM 編譯器還具有以下列出的選項。

### -classpath _path_ (-cp _path_) {id="classpath-path-cp-path"}

在指定的路徑中搜尋類別檔案。使用系統路徑分隔符號（Windows 上為 **;**，macOS/Linux 上為 **:**）分隔 Classpath 的各個元素。
Classpath 可以包含檔案與目錄路徑、ZIP 或 JAR 檔案。

### -d _path_ {id="d-path"}

將產生的類別檔案放入指定位置。該位置可以是目錄、ZIP 或 JAR 檔案。

### -include-runtime {id="include-runtime"}

將 Kotlin 執行時包含在產生的 JAR 檔案中。使產生的封存檔可在任何支援 Java 的環境中執行。

### -jdk-home _path_ {id="jdk-home-path"}

如果與預設的 `JAVA_HOME` 不同，可使用自訂的 JDK 主目錄包含至 Classpath 中。

### -Xjdk-release=version {id="xjdk-release-version"}

<primary-label ref="experimental-general"/>

指定產生的 JVM 位元組碼的目標版本。將 Classpath 中 JDK 的 API 限制為指定的 Java 版本。
自動設定 [`-jvm-target version`](#jvm-target-version)。
可能的值為 `1.8`、`9`、`10`、……、`26`。

> 此選項[無法保證](https://youtrack.jetbrains.com/issue/KT-29974)對每個 JDK 發行版都有效。
>
{style="note"}

### -jvm-default _mode_ {id="jvm-default-mode"}

控制介面中宣告的函式如何編譯為 JVM 上的預設方法。

| 模式               | 說明                                                                                              |
|--------------------|---------------------------------------------------------------------------------------------------|
| `enable`           | 在介面中產生預設實作，並在子類別和 `DefaultImpls` 類別中包含橋接函式。（預設）                    |
| `no-compatibility` | 僅在介面中產生預設實作，跳過相容性橋接與 `DefaultImpls` 類別。                                    |
| `disable`          | 僅產生相容性橋接與 `DefaultImpls` 類別，跳過預設方法。                                            |

### -jvm-target _version_ {id="jvm-target-version"}

指定產生的 JVM 位元組碼的目標版本。可能的值為 `1.8`、`9`、`10`、……、`26`。
預設值為 `%defaultJvmTargetVersion%`。

### -java-parameters {id="java-parameters"}

為方法參數上的 Java 1.8 反射產生中繼資料。

### -module-name _name_ (JVM) {id="module-name-name-jvm"}

為產生的 `.kotlin_module` 檔案設定自訂名稱。
  
### -no-jdk {id="no-jdk"}

不要自動將 Java 執行時包含在 Classpath 中。

### -no-reflect {id="no-reflect"}

不要自動將 Kotlin 反射（`kotlin-reflect.jar`）包含在 Classpath 中。

### -no-stdlib (JVM) {id="no-stdlib-jvm"}

不要自動將 Kotlin/JVM 標準庫（`kotlin-stdlib.jar`）和 Kotlin 反射（`kotlin-reflect.jar`）包含在 Classpath 中。
  
### -script-templates _classnames[,]_ {id="script-templates-classnames"}

指令碼定義範本類別。請使用完全限定類名並以逗號（**,**）分隔。

### -Xadd-modules=module[,] {id="xadd-modules-module"}
<primary-label ref="experimental-general"/>

指定除初始模組之外要解析的根模組。設定 `ALL-MODULE-PATH` 值以解析模組路徑上的所有模組。多個模組之間以逗號（**,**）分隔。

例如，若要解析 incubator 模組：

```bash
kotlinc -Xadd-modules=jdk.incubator.vector
```

### -Xdump-directory {id="xdump-directory"}
<primary-label ref="experimental-general"/>

設定用於 [`-Xphases-to-dump-before`](#xphases-to-dump-before) 編譯器選項的傾印檔案目錄。

### -Xjvm-expose-boxed {id="xjvm-expose-boxed"}
<primary-label ref="experimental-general"/>

在模組中產生所有內嵌值類別的裝箱版本，以及使用它們的函式的裝箱變體，
使兩者皆可從 Java 存取。如需詳細資訊，請參閱從 Java 呼叫 Kotlin 指南中的[內嵌值類別](java-to-kotlin-interop.md#inline-value-classes)。

### -Xnullability-annotations {id="xnullability-annotations"}
<primary-label ref="experimental-general"/>

設定 Kotlin 編譯器如何解譯來自特定 Java 套件的可 null 性註解。

有關支援的註解與組態選項的完整清單，請參閱[可 null 性註解](java-interop.md#nullability-annotations)。

## Kotlin/JS 編譯器選項 {id="kotlin-js-compiler-options"}

適用於 JS 的 Kotlin 編譯器會將 Kotlin 原始碼檔案編譯為 JavaScript 程式碼。
Kotlin 到 JS 編譯的命令列工具為 `kotlinc-js`。

除[通用選項](#common-options)外，Kotlin/JS 編譯器還具有以下列出的選項。

### -libraries _path_ {id="libraries-path"}

帶有 `.meta.js` 和 `.kjsm` 檔案的 Kotlin 程式庫路徑，以系統路徑分隔符號分隔。

### -main _{call|noCall}_ {id="main-call-nocall"}

定義執行時是否應呼叫 `main` 函式。

### -meta-info {id="meta-info"}

產生帶有中繼資料的 `.meta.js` 和 `.kjsm` 檔案。建立 JS 程式庫時請使用此選項。

### -module-kind {umd|commonjs|amd|plain} {id="module-kind-umd-commonjs-amd-plain"}

編譯器產生的 JS 模組類型：

- `umd` - [Universal Module Definition](https://github.com/umdjs/umd) 模組
- `commonjs` - [CommonJS](http://www.commonjs.org/) 模組
- `amd` - [Asynchronous Module Definition](https://en.wikipedia.org/wiki/Asynchronous_module_definition) 模組
- `plain` - 純 JS 模組
    
若要深入了解不同類型的 JS 模組及其差異，
請參閱[此文章](https://www.davidbcalhoun.com/2014/what-is-amd-commonjs-and-umd/)。

### -no-stdlib (JS) {id="no-stdlib-js"}

不要自動將預設的 Kotlin/JS 標準庫包含在編譯相依性中。

### -output _filepath_ {id="output-filepath"}

設定編譯結果的目標檔案。該值必須是包含檔案名稱的 `.js` 檔案路徑。

### -output-postfix _filepath_ {id="output-postfix-filepath"}

將指定檔案的內容新增至輸出檔案的末尾。

### -output-prefix _filepath_ {id="output-prefix-filepath"}

將指定檔案的內容新增至輸出檔案的開頭。

### -source-map {id="source-map"}

產生原始碼對應檔。

### -source-map-base-dirs _path_ {id="source-map-base-dirs-path"}

使用指定的路徑作為基底目錄。基底目錄用於計算原始碼對應檔中的相對路徑。

### -source-map-embed-sources _{always|never|inlining}_ {id="source-map-embed-sources-always-never-inlining"}

將原始碼檔案嵌入至原始碼對應檔中。

### -source-map-names-policy _{simple-names|fully-qualified-names|no}_ {id="source-map-names-policy-simple-names-fully-qualified-names-no"}

將您在 Kotlin 程式碼中宣告的變數和函式名稱新增至原始碼對應檔中。

| 設定                    | 說明                                                          | 輸出範例                          |
|-------------------------|---------------------------------------------------------------|-----------------------------------|
| `simple-names`          | 新增變數名稱和簡短函式名稱。（預設）                          | `main`                            |
| `fully-qualified-names` | 新增變數名稱和完全限定函式名稱。                              | `com.example.kjs.playground.main` |
| `no`                    | 不新增任何變數或函式名稱。                                    | 不適用                            |

### -source-map-prefix {id="source-map-prefix"}

將指定的前綴新增至原始碼對應檔中的路徑。

### -target {es5|es2015|es2020} {id="target-es5-es2015-es2020"}

為指定的 ECMA 版本產生 JS 檔案。

### -Xenable-implementing-interfaces-from-typescript {id="xenable-implementing-interfaces-from-typescript"}
<primary-label ref="experimental-general"/>

允許從 JavaScript/TypeScript [實作](whatsnew2320.md#implementing-kotlin-interfaces-from-javascript-typescript)以 `@JsExport` 註解匯出的 Kotlin 介面。

### -Xes-long-as-bigint {id="xes-long-as-bigint"}

在編譯為現代 JavaScript (ES2020) 時，啟用對 JavaScript `BigInt` 型別的支援以表示 Kotlin `Long` 值。
僅有 `es5` 和 `es2015` 目標需要此選項。`es2020` 目標預設會啟用此選項。

### -Xsuspend-lambda-exporting {id="xsuspend-lambda-exporting"}
<primary-label ref="experimental-general"/>

允許將 `@JsExport` 宣告中宣告的[掛起 Lambda 運算式匯出](js-to-kotlin-interop.md#export-suspending-lambdas)為 JavaScript `async` 函式。

## Kotlin/Native 編譯器選項 {id="kotlin-native-compiler-options"}

Kotlin/Native 編譯器會將 Kotlin 原始碼檔案編譯為適用於[受支援平台](native-overview.md#target-platforms)的原生二進位檔。
Kotlin/Native 編譯的命令列工具為 `kotlinc-native`。

除[通用選項](#common-options)外，Kotlin/Native 編譯器還具有以下列出的選項。

### -enable-assertions (-ea) {id="enable-assertions-ea"}

在產生的程式碼中啟用執行時斷言。

### -entry _name_ (-e _name_) {id="entry-name-e-name"}

指定合格的入口點名稱。

### -g {id="g"}

啟用發出偵錯資訊。此選項會降低最佳化等級，不應與 [`-opt`](#opt) 選項合併使用。
    
### -generate-test-runner (-tr) {id="generate-test-runner-tr"}

產生用於執行專案中單元測試的應用程式。

### -generate-no-exit-test-runner (-trn) {id="generate-no-exit-test-runner-trn"}

產生用於執行單元測試且無明確處理序結束的應用程式。

### -include-binary _path_ (-ib _path_) {id="include-binary-path-ib-path"}

將外部二進位檔打包在產生的 klib 檔案內。

### -library _path_ (-l _path_) {id="library-path-l-path"}

與程式庫連結。若要了解在 Kotlin/Native 專案中使用程式庫的資訊，請參閱
[Kotlin/Native 程式庫](native-libraries.md)。

### -library-version _version_ (-lv _version_) {id="library-version-version-lv-version"}

設定程式庫版本。

### -linker-option {id="linker-option"}

在二進位檔建置期間將引數傳遞給連結器。可用於連結某些原生程式庫。

### -linker-options _args_ {id="linker-options-args"}

在二進位檔建置期間將多個引數傳遞給連結器。請以空白字元分隔各個引數。
    
### -list-targets {id="list-targets"}

列出可用的硬體目標。

### -manifest _path_ {id="manifest-path"}

提供資訊清單附加檔案。

### -module-name _name_ (Native) {id="module-name-name-native"}

指定編譯模組的名稱。
此選項也可用於指定匯出至 Objective-C 之宣告的名稱前綴：
[如何為我的 Kotlin 架構指定自訂 Objective-C 前綴/名稱？](native-faq.md#how-do-i-specify-a-custom-objective-c-prefix-name-for-my-kotlin-framework)

### -native-library _path_ (-nl _path_) {id="native-library-path-nl-path"}

包含原生位元碼程式庫。

### -no-default-libs {id="no-default-libs"}

停用將使用者程式碼與隨編譯器散佈的預先建構[平台程式庫](native-platform-libs.md)進行連結。

### -nomain {id="nomain"}

假定 `main` 入口點由外部程式庫提供。

### -nopack {id="nopack"}

不要將程式庫打包至 klib 檔案中。

### -nostdlib {id="nostdlib"}

不要與 stdlib 連結。

### -opt {id="opt"}

啟用編譯最佳化並產生具有更佳執行時效能的二進位檔。不建議將其與降低最佳化等級的 [`-g`](#g) 選項合併使用。

### -output _name_ (-o _name_) {id="output-name-o-name"}

設定輸出檔案的名稱。

### -produce _output_ (-p _output_) {id="produce-output-p-output"}

指定輸出檔案類型：

- `program`
- `static`
- `dynamic`
- `framework`
- `library`
- `bitcode`

### -repo _path_ (-r _path_) {id="repo-path-r-path"}

程式庫搜尋路徑。如需詳細資訊，請參閱[程式庫搜尋順序](native-libraries.md#library-search-sequence)。

### -target _target_ {id="target-target"}

設定硬體目標。若要查看可用目標清單，請使用 [`-list-targets`](#list-targets) 選項。

### -Xccall-mode {id="xccall-mode"}
<primary-label ref="experimental-general"/>

為透過 cinterop 匯入的 C 或 Objective-C 程式庫啟用[全新互通性模式](whatsnew2320.md#new-interoperability-mode-for-c-or-objective-c-libraries)。

### -Xoverride-konan-properties=min.version.* {id="xoverride-konan-properties-min-version"}
<primary-label ref="experimental-general"/>

設定低於 Kotlin 預設值的 Apple 目標支援版本。例如：

```bash
kotlinc -Xoverride-konan-properties=minVersion.ios=14.0
kotlinc -Xoverride-konan-properties=minVersion.macos=11.0
kotlinc -Xoverride-konan-properties=minVersion.tvos=14.0
kotlinc -Xoverride-konan-properties=minVersion.watchos=7.0
```