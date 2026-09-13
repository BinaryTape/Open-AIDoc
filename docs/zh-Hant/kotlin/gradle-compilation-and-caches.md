[//]: # (title: Kotlin Gradle 外掛程式中的編譯與快取)

在此頁面中，您可以了解以下主題：
* [增量編譯](#incremental-compilation)
* [Gradle 組建快取支援](#gradle-build-cache-support)
* [Gradle 組態快取支援](#gradle-configuration-cache-support)
* [Kotlin daemon 以及如何在 Gradle 中使用它](#the-kotlin-daemon-and-how-to-use-it-with-gradle)
* [回退至先前的編譯器](#rolling-back-to-the-previous-compiler)
* [定義 Kotlin 編譯器執行策略](compiler-execution-strategy.md)
* [Kotlin 編譯器回退策略](compiler-execution-strategy.md#fallback-strategy)
* [嘗試最新的語言版本](#trying-the-latest-language-version)
* [組建報告](#build-reports)

## 增量編譯 {id="incremental-compilation"}

Kotlin Gradle 外掛程式支援增量編譯，這在 Kotlin/JVM 和 Kotlin/JS 專案中是預設啟用的。
增量編譯會追蹤 classpath 中檔案在兩次組建之間的變更，以便僅編譯受這些變更影響的檔案。
此方法可與 [Gradle 的組建快取](#gradle-build-cache-support)配合使用，並支援 [編譯規避 (compilation avoidance)](https://docs.gradle.org/current/userguide/java_plugin.html#sec:java_compile_avoidance)。

對於 Kotlin/JVM，增量編譯依賴於 classpath 快照，這些快照會擷取模組的 API 結構，以確定何時需要重新編譯。
為了優化整體管線，Kotlin 編譯器使用兩種類型的 classpath 快照：

* **細粒度快照 (Fine-grained snapshots)：** 包含關於類別成員（例如屬性或函式）的詳細資訊。
當偵測到成員層級的變更時，Kotlin 編譯器僅重新編譯相依於該修改成員的類別。
為了維持效能，Kotlin Gradle 外掛程式會針對 Gradle 快取中的 `.jar` 檔案建立粗粒度快照。
* **粗粒度快照 (Coarse-grained snapshots)：** 僅包含類別 [ABI](https://en.wikipedia.org/wiki/Application_binary_interface) 雜湊。
當 ABI 的某部分發生變化時，Kotlin 編譯器會重新編譯所有相依於該變更類別的類別。
這對於不常更動的類別（例如外部程式庫）非常有用。

> Kotlin/JS 專案使用基於歷程記錄檔案的不同增量編譯方法。 
>
{style="note"}

有幾種方式可以停用增量編譯：

* 針對 Kotlin/JVM，設定 `kotlin.incremental=false`。
* 針對 Kotlin/JS 專案，設定 `kotlin.incremental.js=false`。
* 使用 `-Pkotlin.incremental=false` 或 `-Pkotlin.incremental.js=false` 作為命令列參數。

  該參數應新增至後續的每次組建中。

當您停用增量編譯時，增量快取會在組建後失效。第一次組建絕對不會是增量的。

> 有時增量編譯的問題會在失敗發生後的幾個回合才顯現出來。請使用 [組建報告](#build-reports) 來追蹤變更與編譯的歷程記錄。這可以幫助您提供可重現的錯誤報告。
>
{style="tip"}

若要進一步了解我們目前的增量編譯方法及其與先前方法的比較，請參閱我們的 [部落格文章](https://blog.jetbrains.com/kotlin/2022/07/a-new-approach-to-incremental-compilation-in-kotlin/)。

## Gradle 組建快取支援 {id="gradle-build-cache-support"}

Kotlin 外掛程式使用 [Gradle 組建快取](https://docs.gradle.org/current/userguide/build_cache.html)，它會儲存組建輸出，以便在未來的組建中重複使用。

若要停用所有 Kotlin 任務的快取，請將系統屬性 `kotlin.caching.enabled` 設定為 `false`（執行組建時帶上引數 `-Dkotlin.caching.enabled=false`）。

## Gradle 組態快取支援 {id="gradle-configuration-cache-support"}

Kotlin 外掛程式使用 [Gradle 組態快取](https://docs.gradle.org/current/userguide/configuration_cache.html)，透過重複使用組態階段的結果來加速後續組建的過程。

請參閱 [Gradle 文件](https://docs.gradle.org/current/userguide/configuration_cache.html#config_cache:usage) 以了解如何啟用組態快取。在您啟用此功能後，Kotlin Gradle 外掛程式會自動開始使用它。

## Kotlin daemon 以及如何在 Gradle 中使用它 {id="the-kotlin-daemon-and-how-to-use-it-with-gradle"}

[Kotlin daemon](kotlin-daemon.md)：
* 與 Gradle daemon 一起執行以編譯專案。
* 當您使用 IntelliJ IDEA 內建組建系統編譯專案時，會與 Gradle daemon 分開執行。

Kotlin daemon 會在 Gradle [執行階段](https://docs.gradle.org/current/userguide/build_lifecycle.html#sec:build_phases)中，當其中一個 Kotlin 編譯任務開始編譯原始碼時啟動。
Kotlin daemon 會隨 Gradle daemon 一起停止，或在連續兩小時沒有 Kotlin 編譯任務的閒置後停止。

Kotlin daemon 使用與 Gradle daemon 相同的 JDK。

### 設定 Kotlin daemon 的 JVM 引數 {id="setting-kotlin-daemon-s-jvm-arguments"}

以下每種設定引數的方式都會覆蓋其之前的設定：
* [Gradle daemon 引數繼承](#gradle-daemon-arguments-inheritance)
* [`kotlin.daemon.jvm.options` 系統屬性](#kotlin-daemon-jvm-options-system-property)
* [`kotlin.daemon.jvmargs` 屬性](#kotlin-daemon-jvmargs-property)
* [`kotlin` 擴充套件](#kotlin-extension)
* [特定任務定義](#specific-task-definition)

#### Gradle daemon 引數繼承 {id="gradle-daemon-arguments-inheritance"}

預設情況下，Kotlin daemon 會從 Gradle daemon 繼承一組特定的引數，但會使用直接為 Kotlin daemon 指定的任何 JVM 引數將其覆寫。例如，如果您在 `gradle.properties` 檔案中新增以下 JVM 引數：

```none
org.gradle.jvmargs=-Xmx1500m -Xms500m -XX:MaxMetaspaceSize=1g
```

這些引數隨後會被新增到 Kotlin daemon 的 JVM 引數中：

```none
-Xmx1500m -XX:ReservedCodeCacheSize=320m -XX:MaxMetaspaceSize=1g -XX:UseParallelGC -ea -XX:+UseCodeCacheFlushing -XX:+HeapDumpOnOutOfMemoryError -Djava.awt.headless=true -Djava.rmi.server.hostname=127.0.0.1 --add-exports=java.base/sun.nio.ch=ALL-UNNAMED
```

> 若要進一步了解 Kotlin daemon 處理 JVM 引數的預設行為，請參閱 [Kotlin daemon 處理 JVM 引數的行為](#kotlin-daemon-s-behavior-with-jvm-arguments)。
>
{style="note"}

#### kotlin.daemon.jvm.options 系統屬性 {id="kotlin-daemon-jvm-options-system-property"}

如果 Gradle daemon 的 JVM 引數具有 `kotlin.daemon.jvm.options` 系統屬性 – 請在 `gradle.properties` 檔案中使用它：

```none
org.gradle.jvmargs=-Dkotlin.daemon.jvm.options=-Xmx1500m,Xms500m
```

傳遞引數時，請遵循以下規則：
* **僅** 在引數 `Xmx`、`XX:MaxMetaspaceSize` 和 `XX:ReservedCodeCacheSize` 之前使用減號 `-`。
* 使用逗號 (`,`) 分隔引數，中間 *不加* 空格。空格之後的引數將用於 Gradle daemon，而非 Kotlin daemon。

> 如果滿足以下所有條件，Gradle 會忽略這些屬性：
> * Gradle 正在使用 JDK 1.9 或更高版本。
> * Gradle 版本介於 7.0 到 7.1.1 之間（含）。
> * Gradle 正在編譯 Kotlin DSL 指令碼。
> * Kotlin daemon 尚未執行。
>
> 若要克服此問題，請將 Gradle 升級至 7.2 版（或更高版本），或使用 `kotlin.daemon.jvmargs` 屬性 – 請參閱下一節。
>
{style="warning"}

#### kotlin.daemon.jvmargs 屬性 {id="kotlin-daemon-jvmargs-property"}

您可以在 `gradle.properties` 檔案中新增 `kotlin.daemon.jvmargs` 屬性：

```none
kotlin.daemon.jvmargs=-Xmx1500m -Xms500m
```

請注意，如果您未在此處或 Gradle 的 JVM 引數中指定 `ReservedCodeCacheSize` 引數，Kotlin Gradle 外掛程式將套用預設值 `320m`：

```none
-Xmx1500m -XX:ReservedCodeCacheSize=320m -Xms500m
```

#### kotlin 擴充套件 {id="kotlin-extension"}

您可以在 `kotlin` 擴充套件中指定引數：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    kotlinDaemonJvmArgs = listOf("-Xmx486m", "-Xms256m", "-XX:+UseParallelGC")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    kotlinDaemonJvmArgs = ["-Xmx486m", "-Xms256m", "-XX:+UseParallelGC"]
}
```

</tab>
</tabs>

#### 特定任務定義 {id="specific-task-definition"}

您可以為特定任務指定引數：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.withType<CompileUsingKotlinDaemon>().configureEach {
    kotlinDaemonJvmArguments.set(listOf("-Xmx486m", "-Xms256m", "-XX:+UseParallelGC"))
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
tasks.withType(CompileUsingKotlinDaemon).configureEach { task ->
    task.kotlinDaemonJvmArguments = ["-Xmx1g", "-Xms512m"]
}
```

</tab>
</tabs>

> 在這種情況下，一個新的 Kotlin daemon 執行個體可能會在任務執行時啟動。進一步了解 [Kotlin daemon 處理 JVM 引數的行為](#kotlin-daemon-s-behavior-with-jvm-arguments)。
>
{style="note"}

### Kotlin daemon 處理 JVM 引數的行為 {id="kotlin-daemon-s-behavior-with-jvm-arguments"}

設定 Kotlin daemon 的 JVM 引數時，請注意：

* 當不同的子專案或任務具有不同的 JVM 引數組合時，預期會同時執行多個 Kotlin daemon 執行個體。
* 只有當 Gradle 執行相關編譯任務，且現有的 Kotlin daemon 沒有相同的 JVM 引數組合時，才會啟動新的 Kotlin daemon 執行個體。
  想像您的專案有很多子專案。大多數子專案只需要一定的堆積記憶體給 Kotlin daemon，但有一個模組需要非常多（儘管它很少被編譯）。
  在這種情況下，您應該為該模組提供一組不同的 JVM 引數，這樣只有在開發人員接觸該特定模組時，才會啟動具有較大堆積大小的 Kotlin daemon。
  > 如果您已經有一個正在執行的 Kotlin daemon 具有足夠的堆積大小來處理編譯請求，即使其他請求的 JVM 引數不同，也會重複使用該 daemon 而非啟動新的。
  >
  {style="note"}

如果未指定以下引數，Kotlin daemon 會從 Gradle daemon 繼承：

* `-Xmx`
* `-XX:MaxMetaspaceSize`
* `-XX:ReservedCodeCacheSize`。如果未指定或繼承，預設值為 `320m`。

Kotlin daemon 具有以下預設 JVM 引數：
* `-XX:UseParallelGC`。僅當未指定其他垃圾收集器時，才會套用此引數。
* `-ea`
* `-XX:+UseCodeCacheFlushing`
* `-Djava.awt.headless=true`
* `-D{java.servername.property}={localhostip}`
* `--add-exports=java.base/sun.nio.ch=ALL-UNNAMED`。此引數僅套用於 JDK 16 或更高版本。

> Kotlin daemon 的預設 JVM 引數列表可能會隨版本而異。您可以使用像 [VisualVM](https://visualvm.github.io/) 這樣的工具來檢查執行中 JVM 程序（如 Kotlin daemon）的實際設定。
>
{style="note"}

## 回退至先前的編譯器 {id="rolling-back-to-the-previous-compiler"}

從 Kotlin 2.0.0 開始，預設使用 K2 編譯器。

若要在 Kotlin 2.0.0 及更高版本中使用先前的編譯器，請執行以下任一操作：

* 在您的 `build.gradle.kts` 檔案中，[將您的語言版本設定](gradle-compiler-options.md#example-of-setting-languageversion)為 `1.9`。

  或
* 使用以下編譯器選項：`-language-version 1.9`。

若要進一步了解 K2 編譯器的優點，請參閱 [K2 編譯器遷移指南](k2-compiler-migration-guide.md)。

## 嘗試最新的語言版本 {id="trying-the-latest-language-version"}

從 Kotlin 2.0.0 開始，若要嘗試最新的語言版本，請在 `gradle.properties` 檔案中設定 `kotlin.experimental.tryNext` 屬性。
當您使用此屬性時，Kotlin Gradle 外掛程式會將語言版本增加到比您 Kotlin 版本預設值高一級的版本。
例如，在 Kotlin 2.0.0 中，預設語言版本為 2.0，因此該屬性會將語言版本配置為 2.1。

或者，您可以執行以下指令：

```shell
./gradlew assemble -Pkotlin.experimental.tryNext=true
``` 

在 [組建報告](#build-reports) 中，您可以找到用於編譯每個任務的語言版本。

## 組建報告 {id="build-reports"}

組建報告包含不同編譯階段的持續時間，以及編譯無法進行增量編譯的任何原因。
當編譯時間太長或同一個專案的編譯時間出現差異時，請使用組建報告來調查效能問題。

Kotlin 組建報告比 [Gradle build scans](https://scans.gradle.com/) 能更有效地幫助您調查組建效能問題，因為後者的細微性單位是單一 Gradle 任務。

分析執行時間較長的編譯報告可以幫助您解決以下兩個常見案例：
* 組建不是增量的。分析原因並修正底層問題。
* 組建是增量的，但花費了太多時間。嘗試重新組織原始檔 — 拆分大型檔案、將不同的類別儲存在不同的檔案中、重構大型類別、在不同的檔案中宣告頂層函式等等。

組建報告還會顯示專案中使用的 Kotlin 版本。此外，從 Kotlin 1.9.0 開始，您可以在 [Gradle build scans](https://scans.gradle.com/) 中看到用於編譯程式碼的編譯器。

了解 [如何閱讀組建報告](https://blog.jetbrains.com/kotlin/2022/06/introducing-kotlin-build-reports/#how_to_read_build_reports) 以及 [JetBrains 如何使用組建報告](https://blog.jetbrains.com/kotlin/2022/06/introducing-kotlin-build-reports/#how_we_use_build_reports_in_jetbrains)。

### 啟用組建報告 {id="enabling-build-reports"}

若要啟用組建報告，請在 `gradle.properties` 中宣告組建報告輸出的儲存位置：

```none
kotlin.build.report.output=file
```

輸出可使用以下值及其組合：

| 選項 | 描述 |
|---|---|
| `file` | 將組建報告以人類可讀的格式儲存到本機檔案。預設路徑為 `${project_folder}/build/reports/kotlin-build/${project_name}-timestamp.txt` |
| `single_file` | 將組建報告以物件格式儲存到指定的本機檔案。 |
| `build_scan` | 將組建報告儲存在 [build scan](https://scans.gradle.com/) 的 `custom values` 區段。請注意，Gradle Enterprise 外掛程式限制了自訂值的數量及其長度。在大型專案中，某些值可能會遺失。 |
| `http` | 使用 HTTP(S) 發布組建報告。POST 方法以 JSON 格式傳送指標。您可以在 [Kotlin 儲存庫](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-plugin/src/common/kotlin/org/jetbrains/kotlin/gradle/report/data/GradleCompileStatisticsData.kt) 中查看傳送資料的目前版本。您可以在 [這篇部落格文章](https://blog.jetbrains.com/kotlin/2022/06/introducing-kotlin-build-reports/#enable_build_reports) 中找到 HTTP 端點的範例。 |
| `json` | 將組建報告以 JSON 格式儲存到本機檔案。預設路徑為 `${project_folder}/build/reports/kotlin-build/${project_name}-build-<date-time>-<index>.json`。 |

以下是 `kotlin.build.report` 的可用選項列表：

```none
# 必要的輸出。允許任何組合
kotlin.build.report.output=file,single_file,http,build_scan,json

# 如果使用 single_file 輸出則為必填。報告存放位置 
# 用於取代已棄用的 `kotlin.internal.single.build.metrics.file` 屬性
kotlin.build.report.single_file=my/directory/path/some_filename

# 選填。基於檔案或 JSON 報告的輸出目錄。預設值：build/reports/kotlin-build/
kotlin.build.report.file.output_dir=kotlin-reports

# 選填。用於標記組建報告的標籤（例如，偵錯參數）
kotlin.build.report.label=some_label
```

僅適用於 HTTP 的選項：

```none
# 必填。發布基於 HTTP(S) 報告的位置
kotlin.build.report.http.url=http://127.0.0.1:8080

# 選填。如果 HTTP 端點需要驗證，則提供使用者與密碼
kotlin.build.report.http.user=someUser
kotlin.build.report.http.password=somePassword

# 選填。將組建的 Git 分支名稱新增至組建報告
kotlin.build.report.http.include_git_branch.name=true|false

# 選填。將編譯器引數新增至組建報告
# 如果專案包含許多模組，報告中的編譯器引數可能會非常沈重且沒什麼幫助
kotlin.build.report.include_compiler_arguments=true|false
```

### 自訂值限制 {id="limit-of-custom-values"}

為了收集組建掃描的統計數據，Kotlin 組建報告使用 [Gradle 的自訂值 (custom values)](https://docs.gradle.com/enterprise/tutorials/extending-build-scans/)。
您和不同的 Gradle 外掛程式都可以將資料寫入自訂值。自訂值的數量有限制。
請在 [Build scan 外掛程式文件](https://docs.gradle.com/enterprise/gradle-plugin/#adding_custom_values) 中查看目前的自訂值數量上限。

如果您有一個大型專案，此類自訂值的數量可能會相當多。如果此數量超過限制，您可能會在日誌中看到以下訊息：

```text
Maximum number of custom values (1,000) exceeded
```

若要減少 Kotlin 外掛程式產生的自訂值數量，您可以在 `gradle.properties` 中使用以下屬性：

```none
kotlin.build.report.build_scan.custom_values_limit=500
```

### 關閉專案與系統屬性的收集 {id="switching-off-collecting-project-and-system-properties"}

HTTP 組建統計日誌可能包含某些專案與系統屬性。這些屬性會改變組建的行為，因此在組建統計中記錄它們很有用。
但這些屬性可能儲存敏感資料，例如密碼或專案的完整路徑。

您可以透過在 `gradle.properties` 中新增 `kotlin.build.report.http.verbose_environment` 屬性來停用這些統計資料的收集。

> JetBrains 不會收集這些統計資料。您可以選擇 [儲存報告的位置](#enabling-build-reports)。
> 
{style="note"}

## 下一步？ {id="what-s-next"}

進一步了解：
* [Gradle 基礎與細節](https://docs.gradle.org/current/userguide/userguide.html)。
* [對 Gradle 外掛程式變體的支援](gradle-plugin-variants.md)。
* [編譯器執行策略](compiler-execution-strategy.md)