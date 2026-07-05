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

##### 配置 kapt 註解處理

若要配置註解處理的模式，請在 `<configuration>` 區塊中設定 `<aptMode>` 選項：

* `stubs` – 僅產生註解處理所需的虛設常式。
* `apt` – 僅執行註解處理。
* `stubsAndApt` – （預設）產生虛設常式並執行註解處理。

例如：

```xml
<configuration>
   ...
   <aptMode>stubs</aptMode>
</configuration>
```

### CLI

kapt 編譯器外掛程式包含在 Kotlin 編譯器的二進位發行版中。

您可以透過使用 `-Xplugin` Kotlin 編譯器選項提供其 JAR 檔案的路徑來附加該外掛程式：

```bash
-Xplugin=$KOTLIN_HOME/lib/kotlin-annotation-processing.jar
```

以下是可用選項的列表：

* `sources` (*必填*): 產生檔案的輸出路徑。
* `classes` (*必填*): 產生的類別檔案和資源的輸出路徑。
* `stubs` (*必填*): 虛設常式檔案的暫存輸出路徑。
* `incrementalData`: 二進位虛設常式的輸出路徑。
* `apclasspath` (*可重複*): 註解處理器 JAR 的路徑。為每個 JAR 傳遞一個 `apclasspath` 選項。
* `apoptions`: Base64 編碼的註解處理器選項列表。有關更多資訊，請參閱 [AP/javac 選項編碼](#ap-javac-options-encoding)。
* `javacArguments`: Base64 編碼的傳遞給 javac 的選項列表。有關更多資訊，請參閱 [AP/javac 選項編碼](#ap-javac-options-encoding)。
* `processors`: 以逗號分隔的註解處理器完整類別名稱列表。如果指定，kapt 將不會嘗試在 `apclasspath` 中尋找註解處理器。
* `verbose`: 啟用詳細輸出。
* `aptMode` (*必填*)
    * `stubs` – 僅產生註解處理所需的虛設常式。
    * `apt` – 僅執行註解處理。
    * `stubsAndApt` – 產生虛設常式並執行註解處理。
* `correctErrorTypes`: 有關更多資訊，請參閱 [不存在的型別校正](#non-existent-type-correction)。預設為停用。
* `dumpFileReadHistory`: 針對每個檔案傾印註解處理期間使用的類別列表的輸出路徑。

外掛程式選項格式為：`-P plugin:<plugin id>:<key>=<value>`。選項可以重複。

範例：

```bash
-P plugin:org.jetbrains.kotlin.kapt3:sources=build/kapt/sources
-P plugin:org.jetbrains.kotlin.kapt3:classes=build/kapt/classes
-P plugin:org.jetbrains.kotlin.kapt3:stubs=build/kapt/stubs

-P plugin:org.jetbrains.kotlin.kapt3:apclasspath=lib/ap.jar
-P plugin:org.jetbrains.kotlin.kapt3:apclasspath=lib/anotherAp.jar

-P plugin:org.jetbrains.kotlin.kapt3:correctErrorTypes=true
```

## 配置註解處理器

### 傳遞引數給註解處理器

在您的建置指令碼檔案 `build.gradle(.kts)` 中使用 `arguments {}` 區塊將引數傳遞給註解處理器：

```kotlin
kapt {
    arguments {
        arg("key", "value")
    }
}
```

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

您可以在單獨的 Gradle 配置中定義一組通用的註解處理器作為父配置，並在子專案的 kapt 專屬配置中進一步延伸它。

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

在 Gradle 組建檔案中，使用 `keepJavacAnnotationProcessors` 選項：

```groovy
kapt {
    keepJavacAnnotationProcessors = true
}
```

如果您使用 Maven，則需要明確配置外掛程式。請參閱這份 [Lombok 編譯器外掛程式設定範例](lombok.md#using-with-kapt)。

## Gradle 組建快取支援

預設情況下，kapt 註解處理任務會在 [Gradle 中快取](https://guides.gradle.org/using-build-cache/)。然而，註解處理器可以執行任意程式碼，這可能無法可靠地將任務輸入轉換為輸出，或者可能會存取及修改 Gradle 未追蹤的檔案。如果組建中使用的註解處理器無法正確快取，您可以透過在建置指令碼中指定 `useBuildCache` 屬性來完全停用 kapt 的快取。這有助於防止 kapt 任務出現錯誤的快取命中：

```groovy
kapt {
    useBuildCache = false
}
```

## 提高使用 kapt 的組建速度

### 並行執行 kapt 任務

為了提高使用 kapt 的組建速度，您可以為 kapt 任務啟用 [Gradle Worker API](https://guides.gradle.org/using-the-worker-api/)。使用 Worker API 讓 Gradle 能從單一專案中並行執行獨立的註解處理任務，在某些情況下可以顯著減少執行時間。

當您在 Kotlin Gradle 外掛程式中使用 [自訂 JDK home](gradle-configure-project.md#gradle-java-toolchains-support) 功能時，kapt 任務的 worker 僅使用 [處理序隔離模式](https://docs.gradle.org/current/userguide/worker_api.html#changing_the_isolation_mode)。請注意，`kapt.workers.isolation` 屬性會被忽略。

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

> 如果您在使用此功能時遇到任何問題，歡迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-28901) 中向我們提供回饋。
> 
{style="note"}

### 評估註解處理器的效能

若要獲取註解處理器執行的效能統計資料，請使用 `-Kapt-show-processor-timings` 外掛程式選項。輸出範例：

```text
Kapt Annotation Processing performance report:
com.example.processor.TestingProcessor: total: 133 ms, init: 36 ms, 2 round(s): 97 ms, 0 ms
com.example.processor.AnotherProcessor: total: 100 ms, init: 6 ms, 1 round(s): 93 ms
```

您可以使用外掛程式選項 [`-Kapt-dump-processor-timings` (`org.jetbrains.kotlin.kapt3:dumpProcessorTimings`)](https://github.com/JetBrains/kotlin/pull/4280) 將此報告傾印到檔案中。以下指令將執行 kapt 並將統計資料傾印到 `ap-perf-report.file` 檔案中：

```bash
kotlinc -cp $MY_CLASSPATH \
-Xplugin=kotlin-annotation-processing-SNAPSHOT.jar -P \
plugin:org.jetbrains.kotlin.kapt3:aptMode=stubsAndApt,\
plugin:org.jetbrains.kotlin.kapt3:apclasspath=processor/build/libs/processor.jar,\
plugin:org.jetbrains.kotlin.kapt3:dumpProcessorTimings=ap-perf-report.file \
-Xplugin=$JAVA_HOME/lib/tools.jar \
-d cli-tests/out \
-no-jdk -no-reflect -no-stdlib -verbose \
sample/src/main/
```

### 評估註解處理器產生的檔案數量

`kapt` Gradle 外掛程式可以報告每個註解處理器產生檔案數量的統計資料。

這有助於追蹤組建中是否包含任何未使用的註解處理器。您可以使用產生的報告來尋找觸發不必要註解處理器的模組，並更新模組以避免這種情況。

若要啟用統計報告：

1. 在您的 `build.gradle(.kts)` 中將 `showProcessorStats` 屬性值設定為 `true`：

   ```kotlin
   // build.gradle.kts
   kapt {
       showProcessorStats = true
   }
   ```

2. 在您的 `gradle.properties` 中將 `kapt.verbose` Gradle 屬性設定為 `true`：

   ```none
   # gradle.properties
   kapt.verbose=true
   ```

> 您也可以透過 [命令列選項 `verbose`](#cli) 啟用詳細輸出。
>
{style="note"}

統計資料會以 `info` 層級顯示在日誌中。您可以看到 `Annotation processor stats:` 行，接著是每個註解處理器執行時間的統計資料。在這些行之後，有 `Generated files report:` 行，接著是每個註解處理器產生檔案數量的統計資料。例如：

```text
[INFO] Annotation processor stats:
[INFO] org.mapstruct.ap.MappingProcessor: total: 290 ms, init: 1 ms, 3 round(s): 289 ms, 0 ms, 0 ms
[INFO] Generated files report:
[INFO] org.mapstruct.ap.MappingProcessor: total sources: 2, sources per round: 2, 0, 0
```

## 增量註解處理

kapt 預設支援增量註解處理。目前，只有當所有使用的註解處理器都是增量的，註解處理才具備增量性。

若要停用增量註解處理，請在您的 `gradle.properties` 檔案中加入此行：

```none
kapt.incremental.apt=false
```

請注意，增量註解處理也需要啟用 [增量編譯](gradle-compilation-and-caches.md#incremental-compilation)。

## Java 編譯器選項

kapt 使用 Java 編譯器來執行註解處理器。以下是您傳遞任意選項給 javac 的方式：

```groovy
kapt {
    javacOptions {
        // 增加註解處理器的最大錯誤數量。
        // 預設值為 100。
        option("-Xmaxerrs", 500)
    }
}
```

## 不存在的型別校正

某些註解處理器（如 `AutoFactory`）依賴宣告簽章中的精確型別。預設情況下，kapt 會將每個未知的型別（包括產生的類別型別）替換為 `NonExistentClass`，但您可以變更此行為。在 `build.gradle(.kts)` 檔案中加入選項，以啟用虛設常式中的錯誤型別推論：

```groovy
kapt {
    correctErrorTypes = true
}
```

## 產生 Kotlin 原始碼

kapt 可以產生 Kotlin 原始碼。只需將產生的 Kotlin 原始碼檔案寫入 `processingEnv.options["kapt.kotlin.generated"]` 指定的目錄，這些檔案就會與主原始碼一起編譯。

請注意，kapt 不支援產生 Kotlin 檔案的多回合處理。

## AP/Javac 選項編碼

`apoptions` 和 `javacArguments` 命令列選項接受一個編碼後的選項對照表。以下是您可以自行編碼選項的方式：

```kotlin
fun encodeList(options: Map<String, String>): String {
    val os = ByteArrayOutputStream()
    val oos = ObjectOutputStream(os)

    oos.writeInt(options.size)
    for ((key, value) in options.entries) {
        oos.writeUTF(key)
        oos.writeUTF(value)
    }

    oos.flush()
    return Base64.getEncoder().encodeToString(os.toByteArray())
}
```

## 下一步

* [參閱如何從 kapt 遷移到 KSP](ksp-kapt-migration.md)