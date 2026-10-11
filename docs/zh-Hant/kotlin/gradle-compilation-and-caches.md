[//]: # (title: Kotlin Gradle 外掛程式中的編譯與快取)

在本頁中，你可以了解以下主題：
* [增量編譯](#incremental-compilation)
* [Gradle 建置快取支援](#gradle-build-cache-support)
* [Gradle 組態快取支援](#gradle-configuration-cache-support)
* [Kotlin 常駐程式及其在 Gradle 中的使用方式](#the-kotlin-daemon-and-how-to-use-it-with-gradle)
* [復原至先前的編譯器](#rolling-back-to-the-previous-compiler)
* [定義 Kotlin 編譯器執行策略](compiler-execution-strategy.md)
* [Kotlin 編譯器備援策略](compiler-execution-strategy.md#fallback-strategy)
* [嘗試最新的語言版本](#trying-the-latest-language-version)
* [建置報告](#build-reports)

## 增量編譯 {id="incremental-compilation"}

Kotlin Gradle 外掛程式支援增量編譯，這在 Kotlin/JVM 和 Kotlin/JS 專案中預設為啟用。
增量編譯會追蹤建置之間類別路徑 (classpath) 中檔案的變更，以便僅編譯受這些變更影響的檔案。
此方法可與 [Gradle 的建置快取](#gradle-build-cache-support) 協同運作，並支援[編譯規避 (compilation avoidance)](https://docs.gradle.org/current/userguide/java_plugin.html#sec:java_compile_avoidance)。

對於 Kotlin/JVM，增量編譯依賴類別路徑快照，
這些快照會擷取模組的 API 結構，以判斷何時需要重新編譯。
為了最佳化整體管線，Kotlin 編譯器使用兩種類型的類別路徑快照：

* **細粒度快照 (Fine-grained snapshots)：** 包含有關類別成員的詳細資訊，例如屬性或函式。
當偵測到成員層級的變更時，Kotlin 編譯器僅會重新編譯依賴於修改後成員的類別。
為了維持效能，Kotlin Gradle 外掛程式會為 Gradle 快取中的 `.jar` 檔案建立粗粒度快照。
* **粗粒度快照 (Coarse-grained snapshots)：** 僅包含類別的 [ABI](https://en.wikipedia.org/wiki/Application_binary_interface) 雜湊。
當 ABI 的某個部分發生變更時，Kotlin 編譯器會重新編譯所有依賴於該變更類別的類別。
這對於不常變更的類別（例如外部程式庫）非常有用。

> Kotlin/JS 專案使用基於歷程記錄檔案的不同增量編譯方法。
>
{style="note"}

有幾種方法可以停用增量編譯：

* 對於 Kotlin/JVM，設定 `kotlin.incremental=false`。
* 對於 Kotlin/JS 專案，設定 `kotlin.incremental.js=false`。
* 使用 `-Pkotlin.incremental=false` 或 `-Pkotlin.incremental.js=false` 作為命令列參數。

  該參數應新增至每個後續的建置中。

停用增量編譯後，建置完成時增量快取將失效。第一次建置絕不會是增量的。

> 有時增量編譯的問題會在失敗發生幾輪後才會顯現。使用[建置報告](#build-reports)
> 來追蹤變更和編譯的歷程記錄。這有助於你提供可重現的錯誤報告。
>
{style="tip"}

若要進一步了解我們目前的增量編譯方法如何運作以及與先前方法的比較，
請參閱我們的[部落格文章](https://blog.jetbrains.com/kotlin/2022/07/a-new-approach-to-incremental-compilation-in-kotlin/)。

## Gradle 建置快取支援 {id="gradle-build-cache-support"}

Kotlin 外掛程式使用 [Gradle 建置快取](https://docs.gradle.org/current/userguide/build_cache.html)，該快取會儲存建置輸出，以便在未來的建置中重複使用。

若要停用所有 Kotlin 任務的快取，請將系統屬性 `kotlin.caching.enabled` 設定為 `false`
（使用引數 `-Dkotlin.caching.enabled=false` 執行建置）。

## Gradle 組態快取支援 {id="gradle-configuration-cache-support"}

Kotlin 外掛程式使用 [Gradle 組態快取](https://docs.gradle.org/current/userguide/configuration_cache.html)，
該快取透過重複使用組態階段的結果來加速後續建置的建置過程。

請參閱 [Gradle 文件](https://docs.gradle.org/current/userguide/configuration_cache.html#config_cache:usage)
以了解如何啟用組態快取。啟用此功能後，Kotlin Gradle 外掛程式會自動開始使用它。

## Kotlin 常駐程式及其在 Gradle 中的使用方式 {id="the-kotlin-daemon-and-how-to-use-it-with-gradle"}

[Kotlin 常駐程式 (Kotlin daemon)](kotlin-daemon.md)：
* 與 Gradle 常駐程式一起執行以編譯專案。
* 當你使用 IntelliJ IDEA 內建建置系統編譯專案時，與 Gradle 常駐程式分開執行。

當其中一個 Kotlin 編譯任務開始編譯原始碼時，Kotlin 常駐程式會在 Gradle [執行階段](https://docs.gradle.org/current/userguide/build_lifecycle.html#sec:build_phases)啟動。
Kotlin 常駐程式會在 Gradle 常駐程式停止時停止，或在沒有 Kotlin 編譯的閒置兩小時後停止。

Kotlin 常駐程式使用與 Gradle 常駐程式相同的 JDK。

### 設定 Kotlin 常駐程式的 JVM 引數 {id="setting-kotlin-daemon-s-jvm-arguments"}

以下每種設定引數的方法都會覆寫先前的設定：
* [Gradle 常駐程式引數繼承](#gradle-daemon-arguments-inheritance)
* [`kotlin.daemon.jvm.options` 系統屬性](#kotlin-daemon-jvm-options-system-property)
* [`kotlin.daemon.jvmargs` 屬性](#kotlin-daemon-jvmargs-property)
* [`kotlin` 擴充套件](#kotlin-extension)
* [特定任務定義](#specific-task-definition)

#### Gradle 常駐程式引數繼承 {id="gradle-daemon-arguments-inheritance"}

預設情況下，Kotlin 常駐程式會從 Gradle 常駐程式繼承一組特定的引數，但會使用直接為 Kotlin 常駐程式指定的任何 JVM 引數進行覆寫。例如，如果你在 `gradle.properties` 檔案中新增以下 JVM 引數：

```none
org.gradle.jvmargs=-Xmx1500m -Xms500m -XX:MaxMetaspaceSize=1g
```

這些引數隨後會新增至 Kotlin 常駐程式的 JVM 引數中：

```none
-Xmx1500m -XX:ReservedCodeCacheSize=320m -XX:MaxMetaspaceSize=1g -XX:UseParallelGC -ea -XX:+UseCodeCacheFlushing -XX:+HeapDumpOnOutOfMemoryError -Djava.awt.headless=true -Djava.rmi.server.hostname=127.0.0.1 --add-exports=java.base/sun.nio.ch=ALL-UNNAMED
```

> 若要進一步了解 Kotlin 常駐程式對 JVM 引數的預設行為，請參閱 [Kotlin 常駐程式對 JVM 引數的行為](#kotlin-daemon-s-behavior-with-jvm-arguments)。
>
{style="note"}

#### kotlin.daemon.jvm.options 系統屬性 {id="kotlin-daemon-jvm-options-system-property"}

如果 Gradle 常駐程式的 JVM 引數具有 `kotlin.daemon.jvm.options` 系統屬性 – 請在 `gradle.properties` 檔案中使用它：

```none
org.gradle.jvmargs=-Dkotlin.daemon.jvm.options=-Xmx1500m,Xms500m
```

傳遞引數時，請遵循以下規則：
* **僅** 在引數 `Xmx`、`XX:MaxMetaspaceSize` 和 `XX:ReservedCodeCacheSize` 前使用減號 `-`。
* 使用逗號 (`,`) 分隔引數，_不含_ 空格。空格後面的引數將用於 Gradle 常駐程式，而不是 Kotlin 常駐程式。

> 如果符合以下所有條件，Gradle 將忽略這些屬性：
> * Gradle 正在使用 JDK 1.9 或更高版本。
> * Gradle 的版本介於 7.0 到 7.1.1 之間（含）。
> * Gradle 正在編譯 Kotlin DSL 指令碼。
> * Kotlin 常駐程式未執行。
>
> 若要解決此問題，請將 Gradle 升級至 7.2 版（或更高版本），或使用 `kotlin.daemon.jvmargs` 屬性 – 請參閱下一節。
>
{style="warning"}

#### kotlin.daemon.jvmargs 屬性 {id="kotlin-daemon-jvmargs-property"}

你可以在 `gradle.properties` 檔案中新增 `kotlin.daemon.jvmargs` 屬性：

```none
kotlin.daemon.jvmargs=-Xmx1500m -Xms500m
```

請注意，如果你沒有在此處或 Gradle 的 JVM 引數中指定 `ReservedCodeCacheSize` 引數，Kotlin Gradle 外掛程式會套用預設值 `320m`：

```none
-Xmx1500m -XX:ReservedCodeCacheSize=320m -Xms500m
```

#### kotlin 擴充套件 {id="kotlin-extension"}

你可以在 `kotlin` 擴充套件中指定引數：

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

你可以為特定任務指定引數：

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

> 在這種情況下，執行任務時可能會啟動新的 Kotlin 常駐程式執行個體。進一步了解 [Kotlin 常駐程式對 JVM 引數的行為](#kotlin-daemon-s-behavior-with-jvm-arguments)。
>
{style="note"}

### Kotlin 常駐程式對 JVM 引數的行為 {id="kotlin-daemon-s-behavior-with-jvm-arguments"}

設定 Kotlin 常駐程式的 JVM 引數時，請注意：

* 當不同的子專案或任務具有不同的 JVM 引數集時，同時執行多個 Kotlin 常駐程式執行個體是正常的。
* 僅當 Gradle 執行相關編譯任務且現有的 Kotlin 常駐程式沒有相同的 JVM 引數集時，才會啟動新的 Kotlin 常駐程式執行個體。
  試想你的專案有許多子專案。大多數子專案都需要一些堆積記憶體供 Kotlin 常駐程式使用，但有一個模組需要大量記憶體（儘管它很少被編譯）。
  在這種情況下，你應該為該模組提供不同的 JVM 引數集，這樣較大堆積大小的 Kotlin 常駐程式只會為接觸該特定模組的開發人員啟動。
  > 如果你已經在執行具有足夠堆積大小以處理編譯請求的 Kotlin 常駐程式，
  > 即使要求的其他 JVM 引數不同，也會重複使用該常駐程式，而不是啟動新的常駐程式。
  >
  {style="note"}

如果未指定以下引數，Kotlin 常駐程式會從 Gradle 常駐程式繼承它們：

* `-Xmx`
* `-XX:MaxMetaspaceSize`
* `-XX:ReservedCodeCacheSize`。如果未指定或未繼承，預設值為 `320m`。

Kotlin 常駐程式具有以下預設 JVM 引數：
* `-XX:UseParallelGC`。僅在未指定其他垃圾收集器時套用此引數。
* `-ea`
* `-XX:+UseCodeCacheFlushing`
* `-Djava.awt.headless=true`
* `-D{java.servername.property}={localhostip}`
* `--add-exports=java.base/sun.nio.ch=ALL-UNNAMED`。此引數僅適用於 JDK 16 或更高版本。

> Kotlin 常駐程式的預設 JVM 引數清單可能因版本而異。你可以使用 [VisualVM](https://visualvm.github.io/) 等工具來檢查正在執行的 JVM 行程（如 Kotlin 常駐程式）的實際設定。
>
{style="note"}

## 復原至先前的編譯器 {id="rolling-back-to-the-previous-compiler"}

從 Kotlin 2.0.0 開始，預設使用 K2 編譯器。

若要在 Kotlin 2.0.0–2.3.21 中使用先前的編譯器，請執行以下任一操作：

* 在你的 `build.gradle.kts` 檔案中，[將語言版本設定](gradle-compiler-options.md#example-of-setting-languageversion)為 `1.9`。

  或者
* 使用以下編譯器選項：`-language-version 1.9`。

從 Kotlin 2.4.0 開始，你將無法回復至先前的編譯器。

若要進一步了解 K2 編譯器的優勢，請參閱 [K2 編譯器遷移指南](k2-compiler-migration-guide.md)。

## 嘗試最新的語言版本 {id="trying-the-latest-language-version"}

從 Kotlin 2.0.0 開始，若要嘗試最新的語言版本，請在 `gradle.properties` 檔案中設定 `kotlin.experimental.tryNext` 屬性。當你使用此屬性時，Kotlin Gradle 外掛程式會將語言版本遞增為高於目前 Kotlin 版本預設值的一個版本。例如，在 Kotlin 2.0.0 中，預設語言版本為 2.0，因此該屬性會設定語言版本 2.1。

或者，你可以執行以下指令：

```shell
./gradlew assemble -Pkotlin.experimental.tryNext=true
``` 

在[建置報告](#build-reports)中，你可以找到用於編譯每個任務的語言版本。

## 建置報告 {id="build-reports"}

建置報告包含不同編譯階段的持續時間，以及編譯無法進行增量的任何原因。
當編譯時間過長或同一個專案的編譯時間不同時，使用建置報告來調查效能問題。

Kotlin 建置報告可協助你更有效地調查建置效能問題，相比之下，[Gradle 建置掃描 (Gradle build scans)](https://scans.gradle.com/) 則是以單一 Gradle 任務作為粒度單位。

分析長時間執行的編譯報告可以協助你解決兩個常見情況：
* 建置不是增量的。分析原因並修正根本問題。
* 建置是增量的，但耗費了太多時間。嘗試重新組織原始碼檔案 — 拆分大檔案、將單獨的類別儲存在不同檔案中、重構大型類別、在不同檔案中宣告頂層函式等。

建置報告還會顯示專案中使用的 Kotlin 版本。此外，從 Kotlin 1.9.0 開始，
你可以在 [Gradle 建置掃描](https://scans.gradle.com/)中查看用於編譯程式碼的編譯器。

了解[如何閱讀建置報告](https://blog.jetbrains.com/kotlin/2022/06/introducing-kotlin-build-reports/#how_to_read_build_reports)以及[JetBrains 如何使用建置報告](https://blog.jetbrains.com/kotlin/2022/06/introducing-kotlin-build-reports/#how_we_use_build_reports_in_jetbrains)。

### 啟用建置報告 {id="enabling-build-reports"}

若要啟用建置報告，請在 `gradle.properties` 中宣告儲存建置報告輸出的位置：

```none
kotlin.build.report.output=file
```

輸出提供以下值及其組合：

| 選項 | 說明 |
|---|---|
| `file` | 以人類可讀的格式將建置報告儲存到本機檔案。預設為 `${project_folder}/build/reports/kotlin-build/${project_name}-timestamp.txt` |
| `single_file` | 以物件格式將建置報告儲存到指定的本機檔案。 |
| `build_scan` | 將建置報告儲存在[建置掃描 (build scan)](https://scans.gradle.com/) 的 `custom values` 區段中。請注意，Gradle Enterprise 外掛程式限制了自訂值的數量及其長度。在大型專案中，某些值可能會遺失。 |
| `http` | 使用 HTTP(S) 發布建置報告。POST 方法會以 JSON 格式傳送指標。你可以在 [Kotlin 存儲庫](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-plugin/src/common/kotlin/org/jetbrains/kotlin/gradle/report/data/GradleCompileStatisticsData.kt)中查看已傳送資料的目前版本。你可以在[這篇部落格文章](https://blog.jetbrains.com/kotlin/2022/06/introducing-kotlin-build-reports/#enable_build_reports)中找到 HTTP 端點的範例 |
| `json` | 以 JSON 格式將建置報告儲存到本機檔案。預設為 `${project_folder}/build/reports/kotlin-build/${project_name}-build-<date-time>-<index>.json`。 |

以下是 `kotlin.build.report` 的可用選項清單：

```none
# 必要輸出。允許任何組合
kotlin.build.report.output=file,single_file,http,build_scan,json

# 若使用 single_file 輸出則為必填。放置報告的位置
# 用於取代已棄用的 `kotlin.internal.single.build.metrics.file` 屬性
kotlin.build.report.single_file=my/directory/path/some_filename

# 選用。基於檔案或 JSON 報告的輸出目錄。預設：build/reports/kotlin-build/
kotlin.build.report.file.output_dir=kotlin-reports

# 選用。用於標記建置報告的標籤（例如偵錯參數）
kotlin.build.report.label=some_label
```

僅適用於 HTTP 的選項：

```none
# 必填。發布基於 HTTP(S) 報告的位置
kotlin.build.report.http.url=http://127.0.0.1:8080

# 選用。若 HTTP 端點需要驗證的使用者名稱和密碼
kotlin.build.report.http.user=someUser
kotlin.build.report.http.password=somePassword

# 選用。將建置的 Git 分支名稱新增至建置報告
kotlin.build.report.http.include_git_branch.name=true|false

# 選用。將編譯器引數新增至建置報告
# 如果專案包含許多模組，其在報告中的編譯器引數可能會非常龐大且沒有太大幫助
kotlin.build.report.include_compiler_arguments=true|false
```

### 自訂值的限制 {id="limit-of-custom-values"}

為了收集建置掃描的統計資訊，Kotlin 建置報告使用 [Gradle 的自訂值 (custom values)](https://docs.gradle.com/enterprise/tutorials/extending-build-scans/)。
你和不同的 Gradle 外掛程式都可以將資料寫入自訂值。自訂值的數量有限制。
請參閱[建置掃描外掛程式文件](https://docs.gradle.com/enterprise/gradle-plugin/#adding_custom_values)中的目前最大自訂值數量。

如果你的專案很大，此類自訂值的數量可能會相當多。如果此數量超過限制，
你可以在記錄中看到以下訊息：

```text
Maximum number of custom values (1,000) exceeded
```

若要減少 Kotlin 外掛程式產生的自訂值數量，你可以在 `gradle.properties` 中使用以下屬性：

```none
kotlin.build.report.build_scan.custom_values_limit=500
```

### 關閉專案和系統屬性收集 {id="switching-off-collecting-project-and-system-properties"}

HTTP 建置統計記錄可能包含某些專案和系統屬性。這些屬性可能會改變建置的行為，
因此在建置統計資訊中記錄它們很有用。
這些屬性可能會儲存敏感資料，例如密碼或專案的完整路徑。

你可以透過在 `gradle.properties` 中新增 `kotlin.build.report.http.verbose_environment` 屬性來停用這些統計資訊的收集。

> JetBrains 不會收集這些統計資訊。由你選擇[儲存報告的位置](#enabling-build-reports)。
> 
{style="note"}

## 接續步驟 {id="what-s-next"}

進一步了解：
* [Gradle 基礎與細節](https://docs.gradle.org/current/userguide/userguide.html)。
* [支援 Gradle 外掛程式變體](gradle-plugin-variants.md)。
* [編譯器執行策略](compiler-execution-strategy.md)