[//]: # (title: kapt 編譯器外掛程式)

<tldr>

* 在以下情況使用 **kapt**：
   * 您有 Maven 專案。
   * 您有 Gradle 專案，但所需的 Java 註解處理器尚不支援 KSP。[請參閱支援的程式庫列表](ksp-overview.md#supported-libraries)。
* 在以下情況使用 **[KSP](ksp-overview.md)**：
   * 您有 Gradle 專案，且所需的 Java 註解處理器支援 KSP。
   * 您想要建立自己的註解處理器。

</tldr>

kapt 編譯器外掛程式允許您在 Kotlin 中使用現有的 Java 註解處理器，並可與 Maven 及 Gradle 搭配運作。
它會從 Kotlin 原始碼產生虛設常式檔案，然後在這些虛設常式上執行 Java 註解處理器。

這讓您在 Kotlin 專案中能針對 [MapStruct](https://mapstruct.org/) 和 [資料繫結](https://developer.android.com/topic/libraries/data-binding/index.html) 等程式庫啟用基於 Java 的註解處理。

> IntelliJ 組建系統不支援 kapt。若要在 IntelliJ IDEA 中重新執行註解處理，請從 **Maven** 工具視窗啟動組建。
>
{style="warning"}

## 設定外掛程式

您可以為 [Gradle](#set-up-in-gradle)、[Maven](#set-up-in-maven) 配置 kapt 外掛程式，或從 [命令列](#cli) 使用它。

### Gradle {id="set-up-in-gradle"}

若要在 Gradle 中使用 kapt，請按照下列步驟操作：

1. 在您的建置指令碼檔案 `build.gradle(.kts)` 中套用 `kapt` Gradle 外掛程式：

   <tabs group="build-script">
   <tab title="Kotlin" group-key="kotlin">

   ```kotlin
   plugins {
       kotlin("kapt") version "%kotlinVersion%"
   }
   ```

   </tab>
   <tab title="Groovy" group-key="groovy">

   ```groovy
   plugins {
       id "org.jetbrains.kotlin.kapt" version "%kotlinVersion%"
   }
   ```

   </tab>
   </tabs>

2. 在 `dependencies {}` 區塊中使用 `kapt` 配置加入對應的相依性：

   <tabs group="build-script">
   <tab title="Kotlin" group-key="kotlin">

   ```kotlin
   dependencies {
       kapt("groupId:artifactId:version")
   }
   ```

   </tab>
   <tab title="Groovy" group-key="groovy">

   ```groovy
   dependencies {
       kapt 'groupId:artifactId:version'
   }
   ```

   </tab>
   </tabs>

3. 如果您之前曾針對註解處理器使用 [Android 支援](https://developer.android.com/build/annotation-processors)，請將 `annotationProcessor` 配置的使用替換為 `kapt`。如果您的專案包含 Java 類別，kapt 外掛程式也會一併處理它們。

   如果您為 `androidTest` 或 `test` 原始碼使用註解處理器，對應的 `kapt` 配置名稱分別為 `kaptAndroidTest` 和 `kaptTest`。請注意，`kaptAndroidTest` 和 `kaptTest` 繼承自 `kapt`，因此您可以提供 `kapt` 相依性，它將同時可用於生產原始碼和測試。

### Maven {id="set-up-in-maven"}

您可以使用 [`<extensions>` 選項](#automatic-configuration) 來簡化設定，或透過 [手動](#manual-configuration) 方式以獲得對 kapt 執行的完整控制。

#### 自動配置

您可以透過為 Kotlin Maven 外掛程式啟用 `<extensions>` 選項來簡化 kapt 配置。在這種情況下，您不需要手動設定帶有目標或原始碼目錄的 kapt `<execution>` 區塊。

若要自動配置 kapt，請在您的 `pom.xml` 建置檔案中，將 `kotlin-maven-plugin` 的 `<extensions>` 選項設定為 `true`：

```xml
<plugin>
    <groupId>org.jetbrains.kotlin</groupId>
    <artifactId>kotlin-maven-plugin</artifactId>
    <version>${kotlin.version}</version>
    <extensions>true</extensions>
    <configuration>
        <annotationProcessorPaths>
            <!-- 在此處指定您的註解處理器 -->
            <annotationProcessorPath>
                <groupId>org.mapstruct</groupId>
                <artifactId>mapstruct-processor</artifactId>
                <version>1.6.3</version>
            </annotationProcessorPath>
        </annotationProcessorPaths>
    </configuration>
</plugin>
```

有關 `<extensions>` 選項的更多資訊，請參閱 [自動配置](maven-configure-project.md#automatic-configuration)。

#### 手動配置

若要在您的 Kotlin Maven 專案中手動設定 kapt，請在 `compile` 執行之前加入 `kotlin-maven-plugin` 的 `kapt` 目標執行：

```xml
<execution>
    <id>kapt</id>
    <goals>
        <goal>kapt</goal>
    </goals>
    <configuration>
        <sourceDirs>
            <sourceDir>src/main/kotlin</sourceDir>
            <sourceDir>src/main/java</sourceDir>
        </sourceDirs>
        <annotationProcessorPaths>
            <!-- 在此處指定您的註解處理器 -->
            <annotationProcessorPath>
                <groupId>org.mapstruct</groupId>
                <artifactId>mapstruct-processor</artifactId>
                <version>1.6.3</version>
            </annotationProcessorPath>
        </annotationProcessorPaths>
    </configuration>
</execution>
```

若要配置註解處理模式，請在 `<configuration>` 區塊中設定 [`aptMode`](#annotation-processor-configuration) 選項。例如：

```xml
<configuration>
   ...
   <aptMode>stubs</aptMode>
</configuration>
```

### CLI

kapt 在 Kotlin 編譯器的二進位發行版中作為獨立的命令列工具提供。

若要從命令列執行 kapt，請使用：

```bash
kapt <options> <source files>
```

例如：

```bash
kapt -Kapt-mode=stubsAndApt \
  -Kapt-sources=build/kapt/sources \
  -Kapt-classes=build/kapt/classes \
  -Kapt-stubs=build/kapt/stubs \
  -Kapt-classpath=lib/ap.jar \
  -Kapt-classpath=lib/anotherAp.jar \
  src/main/kotlin
```

* 請參閱 [kapt 專用編譯器選項](#compiler-options) 的完整列表。
* 您也可以傳遞所有有效的 [Kotlin 編譯器選項](compiler-reference.md)。執行 `kotlinc -help` 即可查看。

## 配置註解處理器

kapt 提供了用於控制註解處理器如何被探索、組織和執行的選項，包括管理處理器類別路徑、從共享配置繼承處理器，以及保持 javac 專屬處理器的啟用狀態。

如需更多配置選項（例如將選項傳遞給註解處理器和 javac），請參閱 [註解處理器配置](#annotation-processor-configuration)。

### 配置處理器類別路徑與探索

您可以停用在 kapt 處理器路徑中未包含的註解處理器探索。這能有效從編譯類別路徑中排除不必要的註解處理器。

#### Gradle {id="classpath-discovery-gradle"}

Gradle 使用 [編譯規避](https://docs.gradle.org/current/userguide/java_plugin.html#sec:java_compile_avoidance) 在重新組建專案時跳過註解處理，從而提高使用 kapt 的增量組建時間。特別是在下列情況下會跳過註解處理：

* 專案的原始碼檔案未變更。
* 相依性的變更符合 [ABI](https://en.wikipedia.org/wiki/Application_binary_interface) 相容。例如，僅有函式主體變更。

然而，編譯規避無法用於在編譯類別路徑中探索到的註解處理器，因為其內部實作的任何變更都需要執行註解處理任務，即使處理器的 ABI 保持不變。

這就是為什麼我們不建議使用來自編譯類別路徑的註解處理器。若要從 kapt 處理中排除這些處理器，請在您的 `gradle.properties` 檔案中加入 `kapt.include.compile.classpath` 屬性：

```none
# gradle.properties
kapt.include.compile.classpath=false
```

將該選項設定為 `false` 後，未包含在處理器路徑（`kapt*` 配置）中的註解處理器相依性將被排除在 kapt 處理之外。

#### Maven {id="classpath-discovery-maven"}

若要排除 kapt 處理器路徑中未包含的註解處理器，請在 kapt 外掛程式的 `<execution>` 區塊中將 `includeCompileClasspath` 選項設定為 `false`：

```xml
<execution>
    <id>kapt</id>
    <goals>
        <goal>kapt</goal>
    </goals>
    <configuration>
        <includeCompileClasspath>false</includeCompileClasspath>
        <sourceDirs>...</sourceDirs>
        <annotationProcessorPaths>...</annotationProcessorPaths>
    </configuration>
</execution>
```

或者，您可以在 `pom.xml` 的 `<properties>` 區塊中使用 `kapt.include.compile.classpath` 屬性：

```xml
<properties>
    <kapt.include.compile.classpath>false</kapt.include.compile.classpath>
</properties>
```

將該選項設定為 `false` 後，未包含在 `<annotationProcessorPaths>` 區塊中的註解處理器將被排除在 kapt 處理之外。

如果未設定 `includeCompileClasspath` 選項，且 kapt 在編譯類別路徑上偵測到未在處理器路徑中明確定義的註解處理器，您將看到一個棄用警告：

```none
[WARNING] Annotation processors discovery from compile classpath is deprecated.
Set 'kapt.include.compile.classpath=false' to disable discovery.
```

> 若要查看不在 kapt 類別路徑上的註解處理器列表，請使用 `--info` 記錄層級選項執行組建。
>
{style="tip"}

### 從父配置繼承註解處理器

您可以在單獨的 Gradle 配置中定義一組通用的註解處理器作為父配置（superconfiguration），並在子專案的 kapt 專屬配置中進一步延伸它。

例如，對於使用 [MapStruct](https://mapstruct.org/) 的子專案，在您的 `build.gradle(.kts)` 檔案中使用以下配置：

```kotlin
val commonAnnotationProcessors by configurations.creating
configurations.named("kapt") { extendsFrom(commonAnnotationProcessors) }

dependencies {
    implementation("org.mapstruct:mapstruct:1.6.3")
    commonAnnotationProcessors("org.mapstruct:mapstruct-processor:1.6.3")
}
```

在此範例中，`commonAnnotationProcessors` Gradle 配置是您希望用於所有專案的通用註解處理父配置。您使用 [`extendsFrom()`](https://docs.gradle.org/current/dsl/org.gradle.api.artifacts.Configuration.html#org.gradle.api.artifacts.Configuration:extendsFrom) 方法將 `commonAnnotationProcessors` 加入為父配置。kapt 會看到 `commonAnnotationProcessors` Gradle 配置對 MapStruct 註解處理器具有相依性。因此，kapt 會在其註解處理配置中包含 MapStruct 註解處理器。

### 保留 Java 編譯器的註解處理器

預設情況下，kapt 會執行所有註解處理器並停用 javac 的註解處理。但是，您可能需要 javac 執行一些註解處理器（例如 [Lombok](https://projectlombok.org/)）。

在 Gradle 建置檔案中，使用選項 `keepJavacAnnotationProcessors`：

```groovy
kapt {
    keepJavacAnnotationProcessors = true
}
```

如果您使用 Maven，則需要明確配置外掛程式。請參閱這份 [Lombok 編譯器外掛程式設定範例](lombok.md#using-with-kapt)。

## 優化 kapt 組建

kapt 提供了一些 Gradle 專用的策略來縮短註解處理時間，包括並行執行任務、利用組建快取、快取處理器類別載入器，以及使用增量註解處理。

對於影響建置行為的其他選項，例如錯誤型別校正、虛設常式元資料剝離以及編譯類別路徑掃描，請參閱 [行為選項](#behavioral-options)。

### 並行執行 kapt 任務

kapt 使用 [Gradle Worker API](https://docs.gradle.org/current/userguide/worker_api.html) 來執行註解處理任務。使用 Worker API 讓 Gradle 能從單一專案中並行執行獨立的註解處理任務，在某些情況下可以顯著減少執行時間。

如果您在 Kotlin Gradle 外掛程式中設定了 [自訂 JDK 版本](gradle-configure-project.md#gradle-java-toolchains-support)，kapt 任務的 worker 僅使用 [`processIsolation()`](https://docs.gradle.org/current/userguide/worker_api.html#step_3_change_the_isolation_mode) 模式。

如果您想為 kapt worker 處理序提供額外的 JVM 引數，請使用 `KaptWithoutKotlincTask` 的輸入 `kaptProcessJvmArgs`：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.withType<org.jetbrains.kotlin.gradle.internal.KaptWithoutKotlincTask>()
    .configureEach {
        kaptProcessJvmArgs.add("-Xmx512m")
    }
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
tasks.withType(org.jetbrains.kotlin.gradle.internal.KaptWithoutKotlincTask.class)
    .configureEach {
        kaptProcessJvmArgs.add('-Xmx512m')
    }
```

</tab>
</tabs>

### 安全地使用 Gradle 組建快取

預設情況下，kapt 註解處理任務會在 [Gradle 中快取](https://docs.gradle.org/current/userguide/build_cache_use_cases.html)。然而，註解處理器可以執行任意程式碼，這可能導致任務輸入向輸出的不必要轉換，或者可能會存取及修改 Gradle 未追蹤的檔案。

當組建中使用的註解處理器無法正確快取時，您可以停用快取以防止 kapt 任務出現錯誤的快取命中。若要執行此操作，請在建置指令碼中使用 `useBuildCache` 屬性：

```groovy
kapt {
    useBuildCache = false
}
```

### 為註解處理器的類別載入器提供快取

<primary-label ref="experimental-general"/>

如果您連續執行多個 Gradle 任務，為註解處理器的類別載入器提供快取有助於 kapt 執行得更快。

若要啟用此功能，請在您的 `gradle.properties` 檔案中使用以下屬性：

```none
# gradle.properties
#
# 任何正值都會啟用快取
# 使用與使用 kapt 的模組數量相同的值
kapt.classloaders.cache.size=5

# 必須停用此項以使快取運作
kapt.include.compile.classpath=false
```

如果您在註解處理器的快取方面遇到任何問題，請停用它們的快取：

```none
# 指定註解處理器的完整名稱以停用其快取
kapt.classloaders.cache.disableForProcessors=[註解處理器完整名稱]
```

> 如果您在該功能方面遇到任何問題，歡迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-28901) 中向我們提供回饋。
>
{style="note"}

### 使用增量註解處理

配合 Gradle，kapt 預設支援增量註解處理，因此僅會重新處理變更的檔案。

目前，增量註解處理僅在以下情況運作：

* 已啟用 [增量編譯](gradle-compilation-and-caches.md#incremental-compilation)。
* 組建中所有的註解處理器都是增量的。

若要停用增量註解處理，請在您的 `gradle.properties` 檔案中加入此行：

```none
kapt.incremental.apt=false
```

> 目前 Maven 或 CLI 不支援 kapt 的增量註解處理。
> 
{style="note"}

## 分析效能

kapt 提供內建診斷功能來協助您了解註解處理效能，包括每個處理器的執行時間報告以及產生的檔案數量，以識別未使用的處理器。

如需更多診斷選項，例如用於偵錯增量處理的檔案讀取歷程記錄以及記憶體洩漏偵測，請參閱 [診斷與統計選項](#diagnostics-and-statistics-options)。

### 評估註解處理器的效能

若要獲取註解處理器執行的效能統計資料，請使用 [`showProcessorStats`](#diagnostics-and-statistics-options) 選項。輸出範例：

```text
Kapt Annotation Processing performance report:
com.example.processor.TestingProcessor: total: 133 ms, init: 36 ms, 2 round(s): 97 ms, 0 ms
com.example.processor.AnotherProcessor: total: 100 ms, init: 6 ms, 1 round(s): 93 ms
```

您可以使用 [`dumpProcessorStats`](#diagnostics-and-statistics-options) 選項將此報告傾印到檔案中。例如，以下 CLI 指令將執行 kapt 並將統計資料傾印到 `ap-perf-report.file` 檔案中：

```bash
kapt -Kapt-mode=stubsAndApt \
  -Kapt-classpath=processor/build/libs/processor.jar \
  -Kapt-dump-processor-stats=ap-perf-report.file \
  sample/src/main/
```

### 評估註解處理器產生的檔案數量

kapt 外掛程式可以報告每個註解處理器產生檔案數量的統計資料。

這有助於追蹤組建中是否包含任何未使用的註解處理器。您可以使用產生的報告來尋找觸發不必要註解處理器的模組，並更新模組以避免這種情況。

若要啟用統計報告：

1. 在您的 Gradle 建置檔案中，將 `showProcessorStats` 選項設定為 `true`：

   ```kotlin
   // build.gradle(.kts)
   kapt {
       showProcessorStats = true
   }
   ```

2. 在您的 `gradle.properties` 檔案中，將 `verbose` 編譯器選項設定為 `true`：

   ```
   # gradle.properties
   kapt.verbose=true
   ```

統計資料會以 `info` 層級顯示在日誌中。您可以看到 `Annotation processor stats:` 行，接著是每個註解處理器執行時間的統計資料。在這些行之後，有 `Generated files report:` 行，接著是每個註解處理器產生檔案數量的統計資料。例如：

```text
[INFO] Annotation processor stats:
[INFO] org.mapstruct.ap.MappingProcessor: total: 290 ms, init: 1 ms, 3 round(s): 289 ms, 0 ms, 0 ms
[INFO] Generated files report:
[INFO] org.mapstruct.ap.MappingProcessor: total sources: 2, sources per round: 2, 0, 0
```

> 目前 Maven 或 CLI 不支援透過 `showProcessorStats` 和 `verbose` 編譯器選項追蹤產生的檔案數量。
>
{style="note"}

## 產生 Kotlin 原始碼

kapt 可以產生 Kotlin 原始碼。若要執行此操作，請使用 `processingEnv.options["kapt.kotlin.generated"]` 將產生的 Kotlin 原始碼檔案寫入指定的目錄。隨後 Kotlin 原始碼檔案將與主原始碼一起編譯。

> kapt 不支援針對產生的 Kotlin 檔案進行多回合註解處理。
> 
{style="note"}

## 編譯器選項

### 註解處理器配置

<table>
    <tr>
        <td>選項</td>
        <td>描述</td>
        <td>如何設定</td>
    </tr>
    <tr>
        <td><code>aptMode</code></td>
        <td>
            控制 kapt 工作流程階段的執行：
            <list>
                <li><code>stubsAndApt</code> 產生虛設常式並執行註解處理（預設）</li>
                <li><code>stubs</code> 僅從 Kotlin 產生 Java 虛設常式</li>
                <li><code>apt</code> 僅執行註解處理器（假設虛設常式已存在）</li>
            </list>
        </td>
        <td>
            <p><b>Gradle:</b> 無法直接使用；Gradle 將虛設常式產生和 apt 作為獨立任務執行</p>
            <p><b>Maven:</b></p>
                <code-block lang="xml">
                    <![CDATA[
<aptMode>stubsAndApt</aptMode>
                    ]]>
                </code-block>
            <p><b>CLI:</b> <code>-Kapt-mode=stubsAndApt</code></p>
        </td>
    </tr>
    <tr>
        <td><code>classpath</code></td>
        <td>用於探索註解處理器的類別路徑項目。</td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    dependencies {
                        kapt("com.example:processor:1.0")
                    }
                </code-block>
            <p><b>Maven:</b></p>
                <code-block lang="xml">
                    <![CDATA[
<annotationProcessorPaths>
    <annotationProcessorPath>...</annotationProcessorPath>
</annotationProcessorPaths>
                    ]]>
                </code-block>
            <p><b>CLI:</b> <code>-Kapt-classpath=lib/my-processor.jar</code></p>
        </td>
    </tr>
    <tr>
        <td><code>processors</code></td>
        <td>以逗號分隔的要執行的處理器完整限定類名，會繞過自動探索。</td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        annotationProcessor("com.example.MyProcessor")
                    }
                </code-block>
            <p><b>Maven:</b></p>
                <code-block lang="xml">
                    <![CDATA[
<annotationProcessors>
    <annotationProcessor>com.example.MyProcessor</annotationProcessor>
</annotationProcessors>
                    ]]>
                </code-block>
            <p><b>CLI:</b> <code>-Kapt-processors=com.example.MyProcessor</code></p>
        </td>
    </tr>
    <tr>
        <td><code>apOption</code></td>
        <td>傳遞給註解處理器的鍵值對選項。</td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        arguments {
                            arg("room.schemaLocation", "$projectDir/schemas")
                        }
                    }
                </code-block>
            <p><b>Maven:</b></p>
                <code-block lang="xml">
                    <![CDATA[
<annotationProcessorArgs>
    <annotationProcessorArg>room.schemaLocation=/schemas</annotationProcessorArg>
</annotationProcessorArgs>
                    ]]>
                </code-block>
            <p><b>CLI:</b> <code>-Kapt-options:room.schemaLocation=/schemas</code></p>
        </td>
    </tr>
    <tr>
        <td><code>javacOption</code></td>
        <td>傳遞給 Java 編譯器的鍵值對選項。</td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        javacOptions {
                            option("-source", "11")
                        }
                    }
                </code-block>
            <p><b>Maven:</b></p>
                <code-block lang="xml">
                    <![CDATA[
<javacOptions>
    <javacOption>-source=11</javacOption>
</javacOptions>
                    ]]>
                </code-block>
            <p><b>CLI:</b> <code>-Kapt-javac-option:-source=11</code></p>
        </td>
    </tr>
    <tr>
        <td><code>processIncrementally</code></td>
        <td>啟用增量註解處理；僅重新處理受變更影響的檔案。</td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    # gradle.properties
                    kapt.incremental.apt=true
                </code-block>
            <p><b>Maven:</b> 目前不支援</p>
            <p><b>CLI:</b> 目前不支援</p>
        </td>
    </tr>
</table>

### 輸出目錄選項

<table>
    <tr>
        <td>選項</td>
        <td>描述</td>
        <td>如何設定</td>
    </tr>
    <tr>
        <td><code>sources</code></td>
        <td>註解處理器產生 <code>.java</code> 原始碼檔案的目錄。</td>
        <td>
            <p><b>Gradle:</b> 自動設定為 <code>build/generated/source/kapt/main</code></p>
            <p><b>Maven:</b> 自動設定為 <code>target/generated-sources/kapt/</code></p>
            <p><b>CLI:</b> <code>-Kapt-sources=build/kapt/sources</code></p>
        </td>
    </tr>
    <tr>
        <td><code>classes</code></td>
        <td>從產生的原始碼編譯而來的 <code>.class</code> 檔案目錄。</td>
        <td>
            <p><b>Gradle:</b> 自動管理</p>
            <p><b>Maven:</b> 自動管理</p>
            <p><b>CLI:</b> <code>-Kapt-classes=build/kapt/classes</code></p>
        </td>
    </tr>
    <tr>
        <td><code>stubs</code></td>
        <td>從 Kotlin 原始碼產生的 Java 虛設常式檔案目錄，用作註解處理器的輸入。</td>
        <td>
            <p><b>Gradle:</b> 自動管理</p>
            <p><b>Maven:</b> 自動管理</p>
            <p><b>CLI:</b> <code>-Kapt-stubs=build/kapt/stubs</code></p>
        </td>
    </tr>
    <tr>
        <td><code>incrementalData</code></td>
        <td>儲存增量組建的狀態。</td>
        <td>
            <p><b>Gradle:</b> 自動管理</p>
            <p><b>Maven:</b> 目前不支援</p>
            <p><b>CLI:</b> 目前不支援</p>
        </td>
    </tr>
</table>

### 行為選項

<table>
    <tr>
        <td>選項</td>
        <td>描述</td>
        <td>如何設定</td>
    </tr>
    <tr>
        <td><code>correctErrorTypes</code></td>
        <td>
            預設情況下，kapt 會將每個未知的型別（包括產生的類別型別）替換為 <code>NonExistentClass</code>。
            您可以啟用虛設常式中的錯誤型別推論，以將尚未解決的錯誤型別替換為來自產生原始碼中的型別。
            <p>預設為 <code>false</code></p>
        </td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        correctErrorTypes = true
                    }
                </code-block>
            <p><b>Maven:</b></p>
                <code-block lang="xml">
                    <![CDATA[
<correctErrorTypes>true</correctErrorTypes>
                    ]]>
                </code-block>
            <p><b>CLI:</b> <code>-Kapt-correct-error-types=true</code></p>
        </td>
    </tr>
    <tr>
        <td><code>dumpDefaultParameterValues</code></td>
        <td>
            在產生的虛設常式中將預設參數初始值設定項作為欄位值包含在內。
            <p>預設為 <code>false</code></p>
        </td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        dumpDefaultParameterValues = true
                    }
                </code-block>
            <p><b>Maven:</b> 不可用</p>
            <p><b>CLI:</b> <code>-Kapt-dump-default-parameter-values=true</code></p>
        </td>
    </tr>
    <tr>
        <td><code>mapDiagnosticLocations</code></td>
        <td>
            將虛設常式檔案中的錯誤訊息對應回其原始 Kotlin 原始碼位置。
            <p>預設為 <code>false</code></p>
        </td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        mapDiagnosticLocations = true
                    }
                </code-block>
            <p><b>Maven:</b></p>
                <code-block lang="xml">
                    <![CDATA[
<mapDiagnosticLocations>true</mapDiagnosticLocations>
                    ]]>
                </code-block>
            <p><b>CLI:</b> <code>-Kapt-map-diagnostic-locations=true</code></p>
        </td>
    </tr>
    <tr>
        <td><code>strict</code></td>
        <td>
            將虛設常式產生的不相容情況轉化為錯誤而非警告。
            <p>預設為 <code>false</code></p>
        </td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        strictMode = true
                    }
                </code-block>
            <p><b>Maven:</b> 不可用</p>
            <p><b>CLI:</b> <code>-Kapt-strict=true</code></p>
        </td>
    </tr>
    <tr>
        <td><code>stripMetadata</code></td>
        <td>
            從產生的虛設常式中移除 <code>@kotlin.Metadata</code> 註解，減少虛設常式大小並對處理器隱藏 Kotlin 專用資訊。
            <p>預設為 <code>false</code></p>
        </td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        stripMetadata = true
                    }
                </code-block>
            <p><b>Maven:</b> 不可用</p>
            <p><b>CLI:</b> <code>-Kapt-strip-metadata=true</code></p>
        </td>
    </tr>
    <tr>
        <td><code>verbose</code></td>
        <td>
            啟用詳細的 kapt 記錄。
            <p>預設為 <code>false</code></p>
        </td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    # gradle.properties
                    kapt.verbose=true
                </code-block>
            <p><b>Maven:</b> 目前不支援</p>
            <p><b>CLI:</b> 目前不支援</p>
        </td>
    </tr>
    <tr>
        <td><code>infoAsWarnings</code></td>
        <td>
            將資訊層級的 kapt 訊息提升為警告。
            <p>預設為 <code>false</code></p>
        </td>
        <td>
            <p><b>Gradle:</b> 無法直接使用</p>
            <p><b>Maven:</b> 目前不支援</p>
            <p><b>CLI:</b> 目前不支援</p>
        </td>
    </tr>
    <tr>
        <td><code>includeCompileClasspath</code></td>
        <td>
            掃描編譯類別路徑以尋找註解處理器。為了可重現性，請將其設定為 <code>false</code>。
            <p>預設為 <code>true</code></p>
        </td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        includeCompileClasspath = false
                    }
                </code-block>
            <p><b>Maven:</b></p>
                <code-block lang="xml">
                    <![CDATA[
<includeCompileClasspath>false</includeCompileClasspath>
                    ]]>
                </code-block>
            <p><b>CLI:</b> 目前不支援</p>
        </td>
    </tr>
</table>

### 診斷與統計選項

<table>
    <tr>
        <td>選項</td>
        <td>描述</td>
        <td>如何設定</td>
    </tr>
    <tr>
        <td><code>showProcessorStats</code></td>
        <td>將每個處理器的執行時間列印到 stdout。</td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        showProcessorStats = true
                    }
                </code-block>
            <p><b>Maven:</b> 不可用</p>
            <p><b>CLI:</b> <code>-Kapt-show-processor-stats=true</code></p>
        </td>
    </tr>
    <tr>
        <td><code>dumpProcessorStats</code></td>
        <td>將處理器計時統計資料寫入檔案。</td>
        <td>
            <p><b>Gradle:</b> 不可用</p>
            <p><b>Maven:</b> 不可用</p>
            <p><b>CLI:</b> <code>-Kapt-dump-processor-stats=build/kapt-stats.txt</code></p>
        </td>
    </tr>
    <tr>
        <td><code>dumpFileReadHistory</code></td>
        <td>將處理器讀取的檔案列表寫入檔案，這對於偵錯增量註解處理器非常有用。</td>
        <td>
            <p><b>Gradle:</b> 不可用</p>
            <p><b>Maven:</b> 不可用</p>
            <p><b>CLI:</b> <code>-Kapt-dump-file-read-history=build/kapt-reads.txt</code></p>
        </td>
    </tr>
    <tr>
        <td><code>detectMemoryLeaks</code></td>
        <td>記憶體洩漏偵測模式：<code>none</code>、<code>default</code> 或 <code>paranoid</code>。</td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        detectMemoryLeaks = "paranoid"
                    }
                </code-block>
            <p><b>Maven:</b> 目前不支援</p>
            <p><b>CLI:</b> 目前不支援</p>
        </td>
    </tr>
</table>

## 下一步

* [將 kapt 與 MapStruct 註解處理器搭配使用](jvm-annotation-processors.md#use-kapt-with-java-annotation-processors)
* [參閱如何從 kapt 遷移到 KSP](ksp-kapt-migration.md)