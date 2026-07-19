[//]: # (title: 配置 Gradle 專案)

若要使用 [Gradle](https://docs.gradle.org/current/userguide/userguide.html) 建置 Kotlin 專案，
您需要將 [Kotlin Gradle 外掛程式](#apply-the-plugin) 新增至您的組建指令碼檔案 `build.gradle(.kts)`，
並在該處 [配置專案的相依性](#configure-dependencies)。

> 若要進一步了解組建指令碼的內容，
> 請造訪 [探索組建指令碼](get-started-with-jvm-gradle-project.md#explore-the-build-script) 章節。
>
{style="note"}

## 套用外掛程式

若要套用 Kotlin Gradle 外掛程式，請使用 Gradle 外掛程式 DSL 中的 [`plugins{}` 區塊](https://docs.gradle.org/current/userguide/plugins.html#sec:plugins_block)：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    // 將 `<...>` 替換為適合您目標環境的外掛程式名稱
    kotlin("<...>") version "%kotlinVersion%"
    // 例如，如果您的目標環境是 JVM：
    // kotlin("jvm") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    // 將 `<...>` 替換為適合您目標環境的外掛程式名稱
    id 'org.jetbrains.kotlin.<...>' version '%kotlinVersion%'
    // 例如，如果您的目標環境是 JVM： 
    // id 'org.jetbrains.kotlin.jvm' version '%kotlinVersion%'
}
```

</tab>
</tabs>

> Kotlin Gradle 外掛程式 (KGP) 和 Kotlin 共用相同的版本編號。
>
{style="note"}

配置專案時，請檢查 Kotlin Gradle 外掛程式 (KGP) 與可用 Gradle 版本的相容性。
下表列出了 Gradle 和 Android Gradle 外掛程式 (AGP) **完全支援** 的最小與最大版本：

| KGP 版本       | Gradle 最小與最大版本                 | AGP 最小與最大版本                                  |
|---------------|---------------------------------------|-----------------------------------------------------|
| 2.4.0-2.4.10  | %minGradleVersion%–%maxGradleVersion% | %minAndroidGradleVersion%–%maxAndroidGradleVersion% |
| 2.3.20–2.3.21 | 7.6.3–9.3.0                           | 8.2.2–9.0.0                                         |
| 2.3.10        | 7.6.3–9.0.0                           | 8.2.2–9.0.0                                         |
| 2.3.0         | 7.6.3–9.0.0                           | 8.2.2–8.13.0                                        |
| 2.2.20–2.2.21 | 7.6.3–8.14                            | 7.3.1–8.11.1                                        |
| 2.2.0–2.2.10  | 7.6.3–8.14                            | 7.3.1–8.10.0                                        |
| 2.1.20–2.1.21 | 7.6.3–8.12.1                          | 7.3.1–8.7.2                                         |
| 2.1.0–2.1.10  | 7.6.3–8.10*                           | 7.3.1–8.7.2                                         |
| 2.0.20–2.0.21 | 6.8.3–8.8*                            | 7.1.3–8.5                                           |
| 2.0.0         | 6.8.3–8.5                             | 7.1.3–8.3.1                                         |
| 1.9.20–1.9.25 | 6.8.3–8.1.1                           | 4.2.2–8.1.0                                         |

> *Kotlin 2.0.20–2.0.21 和 Kotlin 2.1.0–2.1.10 與高達 8.6 版的 Gradle 完全相容。
> 亦支援 Gradle 8.7–8.10 版本，但有一個例外：如果您使用 Kotlin Multiplatform Gradle 外掛程式，
> 在 JVM 目標中呼叫 `withJava()` 函式的多平台專案可能會看到棄用警告。
> 如需更多資訊，請參閱 [預設建立的 Java 原始碼集](https://kotlinlang.org/docs/multiplatform/multiplatform-compatibility-guide.html#java-source-sets-created-by-default)。
>
{style="warning"}

您也可以使用最新發佈版本的 Gradle 和 AGP，但若這樣做，請記住您可能會遇到棄用警告，或者某些新功能可能無法運作。

例如，Kotlin Gradle 外掛程式和 `kotlin-multiplatform` 外掛程式 %kotlinVersion% 要求專案編譯的最小 Gradle 版本為 %minGradleVersion%。

同樣地，完全支援的最大版本為 %maxGradleVersion%。它沒有棄用的 Gradle 方法和屬性，並支援所有目前的 Gradle 特性。

### 較早期的 KGP 版本 {initial-collapse-state="collapsed" collapsible="true"}

| KGP 版本       | Gradle 最小與最大版本                 | AGP 最小與最大版本                                  |
|---------------|---------------------------------------|-----------------------------------------------------|
| 1.9.0–1.9.10  | 6.8.3–7.6.0                           | 4.2.2–7.4.0                                         |
| 1.8.20–1.8.22 | 6.8.3–7.6.0                           | 4.1.3–7.4.0                                         |      
| 1.8.0–1.8.11  | 6.8.3–7.3.3                           | 4.1.3–7.2.1                                         |   
| 1.7.20–1.7.22 | 6.7.1–7.1.1                           | 3.6.4–7.0.4                                         |
| 1.7.0–1.7.10  | 6.7.1–7.0.2                           | 3.4.3–7.0.2                                         |
| 1.6.20–1.6.21 | 6.1.1–7.0.2                           | 3.4.3–7.0.2                                         |

### 專案中的 Kotlin Gradle 外掛程式資料

預設情況下，Kotlin Gradle 外掛程式會將持久性的專案特定資料儲存在專案根目錄的 `.kotlin` 目錄中。

> 不要將 `.kotlin` 目錄提交到版本控制。
> 例如，如果您使用的是 Git，請將 `.kotlin` 新增到您專案的 `.gitignore` 檔案中。
>
{style="warning"}

您可以將屬性新增到專案的 `gradle.properties` 檔案中來配置此行為：

| Gradle 屬性                                         | 描述                                                                                                                                       |
|-----------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| `kotlin.project.persistent.dir`                     | 配置儲存專案層級資料的位置。預設值：`<project-root-directory>/.kotlin`                                      |
| `kotlin.project.persistent.dir.gradle.disableWrite` | 控制是否停用將 Kotlin 資料寫入 `.gradle` 目錄（為了與舊版 IDEA 版本向後相容）。預設值：false |

## 以 JVM 為目標

若要以 JVM 為目標，請套用 Kotlin JVM 外掛程式。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("jvm") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id "org.jetbrains.kotlin.jvm" version "%kotlinVersion%"
}
```

</tab>
</tabs>

在此區塊中 `version` 應為常值，且不能從另一個組建指令碼套用。

### Kotlin 與 Java 原始碼

Kotlin 原始碼和 Java 原始碼可以儲存在同一個目錄中，也可以放置在不同的目錄中。

預設慣例是使用不同的目錄：

```text
project
    - src
        - main (root)
            - kotlin
            - java
```

> 不要將 Java `.java` 檔案儲存在 `src/*/kotlin` 目錄中，因為這些 `.java` 檔案將不會被編譯。
> 
> 相反地，您可以使用 `src/main/java`。
>
{style="warning"} 

如果您不使用預設慣例，則應更新對應的 `sourceSets` 屬性：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
sourceSets.main {
    java.srcDirs("src/main/myJava", "src/main/myKotlin")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
sourceSets {
    main.kotlin.srcDirs += 'src/main/myKotlin'
    main.java.srcDirs += 'src/main/myJava'
}
```

</tab>
</tabs>

<!-- The following header is used in the Mari link service. If you wish to change it here, change the link there too -->

### 檢查相關編譯任務的 JVM 目標相容性

在組建模組中，您可能擁有相關的編譯任務，例如：
* `compileKotlin` 和 `compileJava`
* `compileTestKotlin` 和 `compileTestJava`

> `main` 和 `test` 原始碼集的編譯任務是不相關的。
>
{style="note"}

對於此類相關任務，Kotlin Gradle 外掛程式會檢查 JVM 目標相容性。`kotlin` 擴充套件或任務中的 [`jvmTarget` 屬性](gradle-compiler-options.md#attributes-specific-to-jvm) 與 `java` 擴充套件或任務中的 [`targetCompatibility`](https://docs.gradle.org/current/userguide/java_plugin.html#sec:java-extension) 具有不同的值會導致 JVM 目標不相容。例如：
`compileKotlin` 任務具有 `jvmTarget=1.8`，而 
`compileJava` 任務具有（或 [繼承](https://docs.gradle.org/current/userguide/java_plugin.html#sec:java-extension)）`targetCompatibility=15`。

透過在 `gradle.properties` 檔案中設定 `kotlin.jvm.target.validation.mode` 屬性，為整個專案配置此檢查的行為：

* `error` – 外掛程式使組建失敗；這是 Gradle 8.0+ 專案的預設值。
* `warning` – 外掛程式印出警告訊息；這是低於 Gradle 8.0 專案的預設值。
* `ignore` – 外掛程式跳過檢查且不產生任何訊息。

您也可以在 `build.gradle(.kts)` 檔案中於任務層級進行配置：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinJvmCompile>().configureEach {
    jvmTargetValidationMode.set(org.jetbrains.kotlin.gradle.dsl.jvm.JvmTargetValidationMode.WARNING)
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinJvmCompile.class).configureEach {
    jvmTargetValidationMode = org.jetbrains.kotlin.gradle.dsl.jvm.JvmTargetValidationMode.WARNING
}
```

</tab>
</tabs>

若要避免 JVM 目標不相容，請 [配置工具鏈](#gradle-java-toolchains-support) 或手動對齊 JVM 版本。

#### 如果目標不相容會發生什麼問題 {initial-collapse-state="collapsed" collapsible="true"}

有兩種手動設定 Kotlin 和 Java 原始碼集 JVM 目標的方法：
* 透過 [設定 Java 工具鏈](#gradle-java-toolchains-support) 的隱式方式。
* 透過設定 `kotlin` 擴充套件或任務中的 `jvmTarget` 屬性以及 `java` 擴充套件或任務中的 `targetCompatibility` 的顯式方式。

如果您執行以下操作，則會發生 JVM 目標不相容：
* 顯式設定了不同的 `jvmTarget` 和 `targetCompatibility` 值。
* 使用預設組態，且您的 JDK 不等於 `1.8`。

讓我們考慮一個 JVM 目標的預設組態，即您的組建指令碼中只有 Kotlin JVM 外掛程式，且沒有針對 JVM 目標的額外設定：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("jvm") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id "org.jetbrains.kotlin.jvm" version "%kotlinVersion%"
}
```

</tab>
</tabs>

當組建指令碼中沒有關於 `jvmTarget` 值的明確資訊時，其預設值為 `null`，編譯器將其轉換為預設值 `1.8`。`targetCompatibility` 等於目前 Gradle 的 JDK 版本，這等於您的 JDK 版本（除非您使用 [Java 工具鏈方法](gradle-configure-project.md#gradle-java-toolchains-support)）。假設您的 JDK 版本為 `%jvmLTSVersionSupportedByKotlin%`，您發佈的程式庫構件將 [宣告其與 JDK %jvmLTSVersionSupportedByKotlin%+ 相容](https://docs.gradle.org/current/userguide/publishing_gradle_module_metadata.html)：`org.gradle.jvm.version=%jvmLTSVersionSupportedByKotlin%`，這是錯誤的。在這種情況下，您必須在主專案中使用 Java %jvmLTSVersionSupportedByKotlin% 才能新增此程式庫，即使位元組碼的版本是 `1.8`。請 [配置工具鏈](gradle-configure-project.md#gradle-java-toolchains-support) 來解決此問題。

### Gradle Java 工具鏈支援

> 給 Android 使用者的警告。若要使用 Gradle 工具鏈支援，請使用 Android Gradle 外掛程式 (AGP) 8.1.0-alpha09 或更高版本。
> 
> Gradle Java 工具鏈支援僅從 AGP 7.4.0 [開始可用](https://issuetracker.google.com/issues/194113162)。
> 然而，由於 [此問題](https://issuetracker.google.com/issues/260059413)，AGP 在 8.1.0-alpha09 版本之前並未將 `targetCompatibility` 設定為等於工具鏈的 JDK。
> 如果您使用的版本低於 8.1.0-alpha09，則需要透過 `compileOptions` 手動配置 `targetCompatibility`。將佔位符 `<MAJOR_JDK_VERSION>` 替換為您想使用的 JDK 版本：
>
> ```kotlin
> android {
>     compileOptions {
>         sourceCompatibility = <MAJOR_JDK_VERSION>
>         targetCompatibility = <MAJOR_JDK_VERSION>
>     }
> }
> ```
>
{style="warning"} 

Gradle 6.7 引入了 [Java 工具鏈支援](https://docs.gradle.org/current/userguide/toolchains.html)。
使用此功能，您可以：
* 使用與 Gradle 不同的 JDK 和 JRE 來執行編譯、測試和可執行檔。
* 使用尚未發佈的語言版本來編譯和測試程式碼。

有了工具鏈支援，Gradle 可以自動偵測本機 JDK，並安裝 Gradle 執行組建所需的缺失 JDK。
現在 Gradle 本身可以在任何 JDK 上執行，並且仍然可以針對依賴於主要 JDK 版本的任務重複使用 [遠端建置快取功能](gradle-compilation-and-caches.md#gradle-build-cache-support)。

Kotlin Gradle 外掛程式支援 Kotlin/JVM 編譯任務的 Java 工具鏈。JS 和 Native 任務不使用工具鏈。
Kotlin 編譯器始終在執行 Gradle daemon 的 JDK 上執行。
Java 工具鏈：
* 設定可用於 JVM 目標的 [`-jdk-home` 選項](compiler-reference.md#jdk-home-path)。
* 如果使用者沒有顯式設定 `jvmTarget` 選項，則將 [`compilerOptions.jvmTarget`](gradle-compiler-options.md#attributes-specific-to-jvm) 設定為工具鏈的 JDK 版本。
  如果使用者沒有配置工具鏈，則 `jvmTarget` 欄位使用預設值。
  進一步了解 [JVM 目標相容性](#check-for-jvm-target-compatibility-of-related-compile-tasks)。
* 設定要由任何 Java 編譯、測試和 javadoc 任務使用的工具鏈。
* 影響 [`kapt` 背景工作執行緒](kapt.md#run-kapt-tasks-in-parallel) 執行的 JDK。

使用以下程式碼設定工具鏈。將佔位符 `<MAJOR_JDK_VERSION>` 替換為您想使用的 JDK 版本：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    jvmToolchain {
        languageVersion.set(JavaLanguageVersion.of(<MAJOR_JDK_VERSION>))
    }
    // 或更短的形式：
    jvmToolchain(<MAJOR_JDK_VERSION>)
    // 例如：
    jvmToolchain(%jvmLTSVersionSupportedByKotlin%)
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    jvmToolchain {
        languageVersion = JavaLanguageVersion.of(<MAJOR_JDK_VERSION>)
    }
    // 或更短的形式：
    jvmToolchain(<MAJOR_JDK_VERSION>)
    // 例如：
    jvmToolchain(%jvmLTSVersionSupportedByKotlin%)
}
```

</tab>
</tabs>

請注意，透過 `kotlin` 擴充套件設定工具鏈也會更新 Java 編譯任務的工具鏈。

您可以透過 `java` 擴充套件設定工具鏈，Kotlin 編譯任務將會使用它：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(<MAJOR_JDK_VERSION>)) 
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(<MAJOR_JDK_VERSION>)
    }
}
```

</tab>
</tabs>

如果您使用 Gradle 8.0.2 或更高版本，您還需要新增一個 [工具鏈解析器外掛程式](https://docs.gradle.org/current/userguide/toolchains.html#sub:download_repositories)。
此類型的外掛程式管理要從哪些存儲庫下載工具鏈。例如，將以下外掛程式新增至您的 `settings.gradle(.kts)`：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version("%foojayResolver%")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id 'org.gradle.toolchains.foojay-resolver-convention' version '%foojayResolver%'
}
```

</tab>
</tabs>

在 [Gradle 網站](https://docs.gradle.org/current/userguide/toolchains.html#sub:download_repositories) 上檢查 `foojay-resolver-convention` 的版本是否對應您的 Gradle 版本。

> 若要了解 Gradle 使用哪個工具鏈，請以 [日誌級別 `--info`](https://docs.gradle.org/current/userguide/logging.html#sec:choosing_a_log_level) 執行您的 Gradle 組建，
> 並在輸出中尋找以 `[KOTLIN] Kotlin compilation 'jdkHome' argument:` 開頭的字串。
> 冒號後的部分將是來自工具鏈的 JDK 版本。
>
{style="note"}

若要為特定任務設定任何 JDK（甚至是本機 JDK），請使用 [任務 DSL](#set-jdk-version-with-the-task-dsl)。

進一步了解 [Kotlin 外掛程式中的 Gradle JVM 工具鏈支援](https://blog.jetbrains.com/kotlin/2021/11/gradle-jvm-toolchain-support-in-the-kotlin-plugin/)。

### 使用任務 DSL 設定 JDK 版本

任務 DSL 允許為任何實作了 `UsesKotlinJavaToolchain` 介面的任務設定任何 JDK 版本。
目前，這些任務是 `KotlinCompile` 和 `KaptTask`。
如果您想讓 Gradle 搜尋主要 JDK 版本，請替換您組建指令碼中的 `<MAJOR_JDK_VERSION>` 佔位符：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
val service = project.extensions.getByType<JavaToolchainService>()
val customLauncher = service.launcherFor {
    languageVersion.set(JavaLanguageVersion.of(<MAJOR_JDK_VERSION>))
}
project.tasks.withType<UsesKotlinJavaToolchain>().configureEach {
    kotlinJavaToolchain.toolchain.use(customLauncher)
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
JavaToolchainService service = project.getExtensions().getByType(JavaToolchainService.class)
Provider<JavaLauncher> customLauncher = service.launcherFor {
    it.languageVersion = JavaLanguageVersion.of(<MAJOR_JDK_VERSION>)
}
tasks.withType(UsesKotlinJavaToolchain::class).configureEach { task ->
    task.kotlinJavaToolchain.toolchain.use(customLauncher)
}
```

</tab>
</tabs>

或者您可以指定本機 JDK 的路徑，並將佔位符 `<LOCAL_JDK_VERSION>` 替換為此 JDK 版本：

```kotlin
tasks.withType<UsesKotlinJavaToolchain>().configureEach {
    kotlinJavaToolchain.jdk.use(
        "/path/to/local/jdk", // 放入您的 JDK 路徑
        JavaVersion.<LOCAL_JDK_VERSION> // 例如，JavaVersion.17
    )
}
```

### 關聯編譯任務

您可以透過在編譯之間建立關係來 _關聯_ 編譯，使得一個編譯使用另一個編譯的編譯輸出。關聯編譯會在它們之間建立 `internal` 可見性。

Kotlin 編譯器預設會關聯某些編譯，例如每個目標的 `test` 和 `main` 編譯。
如果您需要表達您的某個自訂編譯與另一個編譯相連，請建立您自己的關聯編譯。

若要讓 IDE 支援關聯編譯以推論原始碼集之間的可見性，請將以下程式碼新增至您的 `build.gradle(.kts)`：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
val integrationTestCompilation = kotlin.target.compilations.create("integrationTest") {
    associateWith(kotlin.target.compilations.getByName("main"))
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
integrationTestCompilation {
    kotlin.target.compilations.create("integrationTest") {
        associateWith(kotlin.target.compilations.getByName("main"))
    }
}
```

</tab>
</tabs>

在這裡，`integrationTest` 編譯與 `main` 編譯相關聯，這使得功能測試可以存取來自 `main` 的 `internal` 物件。

### 在啟用 Java 模組 (JPMS) 的情況下配置

若要讓 Kotlin Gradle 外掛程式與 [Java 模組](https://www.oracle.com/corporate/features/understanding-java-9-modules.html) 搭配運作，
請將以下幾行新增至您的組建指令碼，並將 `YOUR_MODULE_NAME` 替換為您的 JPMS 模組參考，例如 `org.company.module`：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">
        
```kotlin
// 如果您使用的 Gradle 版本低於 7.0，請新增以下三行
java {
    modularity.inferModulePath.set(true)
}

tasks.named("compileJava", JavaCompile::class.java) {
    options.compilerArgumentProviders.add(CommandLineArgumentProvider {
        // 向 javac 提供編譯後的 Kotlin 類別 – 這是 Java/Kotlin 混合原始碼運作所需的
        listOf("--patch-module", "YOUR_MODULE_NAME=${sourceSets["main"].output.asPath}")
    })
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
// 如果您使用的 Gradle 版本低於 7.0，請新增以下三行
java {
    modularity.inferModulePath = true
}

tasks.named("compileJava", JavaCompile.class) {
    options.compilerArgumentProviders.add(new CommandLineArgumentProvider() {
        @Override
        Iterable<String> asArguments() {
            // 向 javac 提供編譯後的 Kotlin 類別 – 這是 Java/Kotlin 混合原始碼運作所需的
            return ["--patch-module", "YOUR_MODULE_NAME=${sourceSets["main"].output.asPath}"]
        }
    })
}
```

</tab>
</tabs>

> 像往常一樣將 `module-info.java` 放入 `src/main/java` 目錄中。
> 
> 對於模組，Kotlin 檔案中的套件名稱應等於 `module-info.java` 中的套件名稱，以避免「套件為空或不存在」的組建失敗。
>
{style="note"}

進一步了解：
* [為 Java 模組系統建置模組](https://docs.gradle.org/current/userguide/java_library_plugin.html#sec:java_library_modular)
* [使用 Java 模組系統建置應用程式](https://docs.gradle.org/current/userguide/application_plugin.html#sec:application_modular)
* [Kotlin 中「模組」的含義](visibility-modifiers.md#modules)

### 其他細節

#### 在編譯任務中停用產物的使用

在某些罕見的情況下，您可能會遇到由循環相依錯誤引起的組建失敗。例如，當您有多個編譯，其中一個編譯可以看到另一個編譯的所有內部宣告，且產生的產物依賴於兩個編譯任務的輸出時：

```none
FAILURE: Build failed with an exception.

What went wrong:
Circular dependency between the following tasks:
:lib:compileKotlinJvm
--- :lib:jvmJar
     \--- :lib:compileKotlinJvm (*)
(*) - details omitted (listed previously)
```

為了修復此循環相依錯誤，我們新增了一個 Gradle 屬性：`archivesTaskOutputAsFriendModule`。
此屬性控制在編譯任務中產物輸入的使用，並決定是否因此建立任務相依性。

預設情況下，此屬性設定為 `true` 以追蹤任務相依性。如果您遇到循環相依錯誤，
您可以在編譯任務中停用產物的使用，以移除任務相依性並避免循環相依錯誤。

若要在編譯任務中停用產物的使用，請將以下內容新增到您的 `gradle.properties` 檔案中：

```kotlin
kotlin.build.archivesTaskOutputAsFriendModule=false
```

#### 延遲 Kotlin/JVM 任務建立

從 Kotlin 1.8.20 開始，Kotlin Gradle 外掛程式會註冊所有任務，且不會在模擬執行 (dry run) 時配置它們。

#### 編譯任務 destinationDirectory 的非預設位置

如果您覆寫了 Kotlin/JVM `KotlinJvmCompile`/`KotlinCompile` 任務的 `destinationDirectory` 位置，請更新您的組建指令碼。您需要在 JAR 檔案中顯式將 `sourceSets.main.kotlin.classesDirectories` 新增到 `sourceSets.main.outputs`：

```kotlin
tasks.jar(type: Jar) {
    from sourceSets.main.outputs
    from sourceSets.main.kotlin.classesDirectories
}
```

## 以多平台為目標

針對 [多個平台](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#targets) 的專案（稱為 [多平台專案](https://kotlinlang.org/docs/multiplatform/get-started.html)）需要 `kotlin-multiplatform` 外掛程式。

> `kotlin-multiplatform` 外掛程式適用於 Gradle %minGradleVersion% 或更高版本。
>
{style="note"}

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("multiplatform") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
}
```

</tab>
</tabs>

進一步了解 [適用於不同平台的 Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform/get-started.html) 以及 [適用於 iOS 和 Android 的 Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform/multiplatform-getting-started.html)。

## 以 Android 為目標

建議使用 Android Studio 建立 Android 應用程式。[了解如何使用 Android Gradle 外掛程式](https://developer.android.com/studio/releases/gradle-plugin)。

## 以 Web 為目標

Kotlin 透過 Kotlin Multiplatform 為 Web 開發提供了兩種方法：

* 基於 JavaScript（使用 Kotlin/JS 編譯器）
* 基於 WebAssembly（使用 Kotlin/Wasm 編譯器）

這兩種方法都使用 Kotlin Multiplatform 外掛程式，但支援不同的使用案例。
以下章節說明如何在您的 Gradle 組建中配置每個目標，以及何時使用它們。

### 以 JavaScript 為目標

如果您的目標是執行以下操作，請使用 Kotlin/JS：

* 與 JavaScript/TypeScript 程式碼庫共用商業邏輯
* 使用 Kotlin 建置不可共用的 Web 應用程式

如需更多資訊，請參閱 [Web 開發](web-overview.md#kotlin-js)。

當以 JavaScript 為目標時，請使用 `kotlin-multiplatform` 外掛程式：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("multiplatform") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
}
```

</tab>
</tabs>

透過指定目標應在瀏覽器還是 Node.js 環境中執行來配置 JavaScript 目標：

```kotlin
kotlin {
    js().browser {  // 或 js().nodejs
        /* ... */
    }
}
```

> 請參閱 [關於 JavaScript 的 Gradle 配置的進一步細節](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#web-targets) 並進一步了解 [設定 Kotlin/JS 專案](js-project-setup.md)。
>
{style="note"}

### 以 WebAssembly 為目標

如果您想在多個平台之間共用邏輯和 UI，請使用 Kotlin/Wasm。如需更多資訊，
請參閱 [Web 開發](web-overview.md#kotlin-wasm)。

與 JavaScript 一樣，當以 WebAssembly (Wasm) 為目標時，請使用 `kotlin-multiplatform` 外掛程式：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("multiplatform") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
}
```

</tab>
</tabs>

根據您的需求，您可以鎖定以下目標：

* **`wasmJs`**: 用於在瀏覽器或 Node.js 中執行
* **`wasmWasi`**: 用於在支援 [WASI (WebAssembly System Interface)](https://wasi.dev/) 的 Wasm環境中執行，例如 Wasmtime、WasmEdge 等。

為 Web 瀏覽器或 Node.js 配置 `wasmJs` 目標：

```kotlin
kotlin {
    wasmJs {
        browser { // 或 nodejs
            /* ... */
        }
    }
}
```

對於 WASI 環境，配置 `wasmWasi` 目標：

```kotlin
kotlin {
    wasmWasi {
        nodejs {
            /* ... */
        }
    }
}
```

> [請參閱關於 Wasm 的 Gradle 配置的進一步細節](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#web-targets)。
>
{style="note"}

### Web 目標的 Kotlin 與 Java 原始碼

KGP 僅適用於 Kotlin 檔案，因此建議您將 Kotlin 和 Java 檔案分開存放（如果專案包含 Java 檔案）。如果您不分開存放，請在 `sourceSets{}` 區塊中指定原始碼資料夾：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets["main"].apply {
        kotlin.srcDir("src/main/myKotlin")
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets {
        main.kotlin.srcDirs += 'src/main/myKotlin'
    }
}
```

</tab>
</tabs>

## 使用 KotlinBasePlugin 介面觸發配置操作

若要在套用任何 Kotlin Gradle 外掛程式（JVM、JS、Multiplatform、Native 等）時觸發某些配置操作，請使用所有 Kotlin 外掛程式都繼承自的 `KotlinBasePlugin` 介面：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.plugin.KotlinBasePlugin

// ...

project.plugins.withType<KotlinBasePlugin>() {
    // 在此處配置您的操作
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.plugin.KotlinBasePlugin

// ...

project.plugins.withType(KotlinBasePlugin.class) {
    // 在此處配置您的操作
}
```

</tab>
</tabs>

## 配置相依性

若要新增對程式庫的相依性，請在原始碼集 DSL 的 `dependencies{}` 區塊中設定所需 [類型](#dependency-types) 的相依性（例如 `implementation`）。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        commonMain.dependencies {
            implementation("com.example:my-library:1.0")
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets {
        commonMain {
            dependencies {
                implementation 'com.example:my-library:1.0'
            }
        }
    }
}
```

</tab>
</tabs>

### 在頂層配置相依性
<primary-label ref="experimental-opt-in"/>

您可以使用頂層 `dependencies {}` 區塊在多平台專案中配置通用相依性。
在此處宣告的相依性，其行為就像是被新增到 `commonMain` 或 `commonTest` 原始碼集中一樣。

若要使用頂層 `dependencies {}` 區塊，請在該區塊前新增 `@OptIn(ExperimentalKotlinGradlePluginApi::class)` 註解以進行啟用：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    @OptIn(ExperimentalKotlinGradlePluginApi::class)
    dependencies {
        implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    dependencies {
        implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%'
    }
}
```

</tab>
</tabs>

在對應目標的 `sourceSets {}` 區塊內新增平台特定相依性。

您可以在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-76446) 分享您對此功能的意見回饋。

### 相依性類型

根據您的需求選擇相依性類型。

<table>
    <tr>
        <th>類型</th>
        <th>描述</th>
        <th>何時使用</th>
    </tr>
    <tr>
        <td><code>api</code></td>
        <td>在編譯期間和執行時都會使用，並匯出給程式庫取用者。</td>
        <td>如果目前模組的公開 API 中使用了來自相依性的任何類型，請使用 <code>api</code> 相依性。
        </td>
    </tr>
    <tr>
        <td><code>implementation</code></td>
        <td>在目前模組的編譯期間和執行時使用，但不會公開給依賴於此模組的其他模組編譯。</td>
        <td>
            <p>用於模組內部邏輯所需的相依性。</p>
            <p>如果一個模組是不發佈的端點應用程式，請使用 <code>implementation</code> 相依性而不是 <code>api</code> 相依性。</p>
        </td>
    </tr>
    <tr>
        <td><code>compileOnly</code></td>
        <td>用於目前模組的編譯，且在執行時或其他模組的編譯期間均不可用。</td>
        <td>用於在執行時有第三方實作可用的 API。</td>
    </tr>
    <tr>
        <td><code>runtimeOnly</code></td>
        <td>在執行時可用，但在任何模組的編譯期間都不可見。</td>
        <td></td>
    </tr>
</table>

### 對標準程式庫的相依性

對標準程式庫 (`stdlib`) 的相依性會自動新增到每個原始碼集。所使用的標準程式庫版本與 Kotlin Gradle 外掛程式的版本相同。

對於平台特定原始碼集，會使用對應的平台特定程式庫變體，而其餘部分則會新增通用標準程式庫。Kotlin Gradle 外掛程式會根據您 Gradle 組建指令碼的 `compilerOptions.jvmTarget` [編譯器選項](gradle-compiler-options.md) 選擇適當的 JVM 標準程式庫。

如果您顯式宣告了標準程式庫相依性（例如，如果您需要不同的版本），Kotlin Gradle 外掛程式將不會覆蓋它或新增第二個標準程式庫。

如果您完全不需要標準程式庫，可以將以下 Gradle 屬性新增到您的 `gradle.properties` 檔案中：

```none
kotlin.stdlib.default.dependency=false
```

#### 傳遞性相依性的版本對齊

從 Kotlin 標準程式庫 1.9.20 版本開始，Gradle 會使用標準程式庫中包含的元資料來自動對齊傳遞性的 `kotlin-stdlib-jdk7` 和 `kotlin-stdlib-jdk8` 相依性。

如果您為 1.8.0 – 1.9.10 之間的任何 Kotlin 標準程式庫版本新增相依性，例如：
`implementation("org.jetbrains.kotlin:kotlin-stdlib:1.8.0")`，則 Kotlin Gradle 外掛程式會將此 Kotlin 版本用於傳遞性的 `kotlin-stdlib-jdk7` 和 `kotlin-stdlib-jdk8` 相依性。這避免了來自不同標準程式庫版本的類別重複。[進一步了解將 `kotlin-stdlib-jdk7` 和 `kotlin-stdlib-jdk8` 合併到 `kotlin-stdlib`](whatsnew18.md#updated-jvm-compilation-target)。您可以透過在 `gradle.properties` 檔案中設定 `kotlin.stdlib.jdk.variants.version.alignment` Gradle 屬性來停用此行為：

```none
kotlin.stdlib.jdk.variants.version.alignment=false
```

##### 對齊版本的其他方式 {initial-collapse-state="collapsed" collapsible="true"}

* 如果您在版本對齊方面遇到問題，可以透過 Kotlin [BOM](https://docs.gradle.org/current/userguide/platforms.html#sub:bom_import) 對齊所有版本。在您的組建指令碼中宣告對 `kotlin-bom` 的平台相依性：

  <tabs group="build-script">
  <tab title="Kotlin" group-key="kotlin">

  ```kotlin
  implementation(platform("org.jetbrains.kotlin:kotlin-bom:%kotlinVersion%"))
  ```

  </tab>
  <tab title="Groovy" group-key="groovy">

  ```groovy
  implementation platform('org.jetbrains.kotlin:kotlin-bom:%kotlinVersion%')
  ```

  </tab>
  </tabs>

* If you don't add a dependency for a standard library version, but you have two different dependencies that transitively
  bring different old versions of the Kotlin standard library, then you can explicitly require `%kotlinVersion%`
  versions of these transitive libraries:

  <tabs group="build-script">
  <tab title="Kotlin" group-key="kotlin">

  ```kotlin
  dependencies {
      constraints {
          add("implementation", "org.jetbrains.kotlin:kotlin-stdlib-jdk7") {
              version {
                  require("%kotlinVersion%")
              }
          }
          add("implementation", "org.jetbrains.kotlin:kotlin-stdlib-jdk8") {
              version {
                  require("%kotlinVersion%")
              }
          }
      }
  }
  ```

  </tab>
  <tab title="Groovy" group-key="groovy">

  ```groovy
  dependencies {
      constraints {
          add("implementation", "org.jetbrains.kotlin:kotlin-stdlib-jdk7") {
              version {
                  require("%kotlinVersion%")
              }
          }
          add("implementation", "org.jetbrains.kotlin:kotlin-stdlib-jdk8") {
              version {
                  require("%kotlinVersion%")
              }
          }
      }
  }
  ```

  </tab>
  </tabs>
  
* 如果您新增了 Kotlin 標準程式庫版本 `%kotlinVersion%` 的相依性：`implementation("org.jetbrains.kotlin:kotlin-stdlib:%kotlinVersion%")`，以及舊版本（早於 `1.8.0`）的 Kotlin Gradle 外掛程式，請更新 Kotlin Gradle 外掛程式以符合標準程式庫版本：

  
  <tabs group="build-script">
  <tab title="Kotlin" group-key="kotlin">

  ```kotlin
  plugins {
      // 將 `<...>` 替換為外掛程式名稱
      kotlin("<...>") version "%kotlinVersion%"
  }
  ```

  </tab>
  <tab title="Groovy" group-key="groovy">

  ```groovy
  plugins {
      // 將 `<...>` 替換為外掛程式名稱
      id "org.jetbrains.kotlin.<...>" version "%kotlinVersion%"
  }
  ```

  </tab>
  </tabs>

* 如果您使用早於 `1.8.0` 版本的 `kotlin-stdlib-jdk7`/`kotlin-stdlib-jdk8`，例如 
  `implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk7:SOME_OLD_KOTLIN_VERSION")`，以及一個傳遞性地帶來 `kotlin-stdlib:1.8+` 的相依性，[請將您的 `kotlin-stdlib-jdk<7/8>:SOME_OLD_KOTLIN_VERSION` 替換為 `kotlin-stdlib-jdk*:%kotlinVersion%`](whatsnew18.md#updated-jvm-compilation-target)，或從帶來它的程式庫中 [排除](https://docs.gradle.org/current/userguide/dependency_downgrade_and_exclude.html#sec:excluding-transitive-deps) 傳遞性的 `kotlin-stdlib:1.8+`：

  <tabs group="build-script">
  <tab title="Kotlin" group-key="kotlin">

  ```kotlin
  dependencies {
      implementation("com.example:lib:1.0") {
          exclude(group = "org.jetbrains.kotlin", module = "kotlin-stdlib")
      }
  }
  ```

  </tab>
  <tab title="Groovy" group-key="groovy">

  ```groovy
  dependencies {
      implementation("com.example:lib:1.0") {
          exclude group: "org.jetbrains.kotlin", module: "kotlin-stdlib"
      }
  }
  ```

  </tab>
  </tabs>

### 設定測試程式庫的相依性

[`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) API 可用於在所有受支援平台上測試 Kotlin 專案。
將 `kotlin-test` 相依性新增到 `commonTest` 原始碼集，以便 Gradle 外掛程式可以推論每個測試原始碼集的對應測試相依性。

Kotlin/Native 目標不需要額外的測試相依性，且 `kotlin.test` API 實作是內建的。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        commonTest.dependencies {
            implementation(kotlin("test")) // 這會自動帶入所有平台相依性
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets {
        commonTest {
            dependencies {
                implementation kotlin("test") // 這會自動帶入所有平台相依性
            }
        }
    }
}
```

</tab>
</tabs>

> 您可以使用 Kotlin 模組相依性的簡寫，例如使用 kotlin("test") 代表 "org.jetbrains.kotlin:kotlin-test"。
>
{style="note"}

您也可以在任何共用或平台特定的原始碼集中使用 `kotlin-test` 相依性。

#### kotlin-test 的 JVM 變體

對於 Kotlin/JVM，Gradle 預設使用 JUnit 4。因此，`kotlin("test")` 相依性會解析為 JUnit 4 的變體，即 `kotlin-test-junit`。

您可以透過在組建指令碼的測試任務中呼叫 [`useJUnitPlatform()`](https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/testing/Test.html#useJUnitPlatform) 或 [`useTestNG()`](https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/testing/Test.html#useTestNG) 來選擇 JUnit 5 或 TestNG。
以下範例適用於 Kotlin Multiplatform 專案：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    jvm {
        testRuns["test"].executionTask.configure {
            useJUnitPlatform()
        }
    }
    sourceSets {
        commonTest.dependencies {
            implementation(kotlin("test"))
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    jvm {
        testRuns["test"].executionTask.configure {
            useJUnitPlatform()
        }
    }
    sourceSets {
        commonTest {
            dependencies {
                implementation kotlin("test")
            }
        }
    }
}
```

</tab>
</tabs>

以下範例適用於 JVM 專案：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
dependencies {
    testImplementation(kotlin("test"))
}

tasks {
    test {
        useTestNG()
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
dependencies {
    testImplementation 'org.jetbrains.kotlin:kotlin-test'
}

test {
    useTestNG()
}
```

</tab>
</tabs>

[了解如何在 JVM 上使用 JUnit 測試程式碼](jvm-test-using-junit.md)。

自動 JVM 變體解析有時可能會給您的組態帶來問題。在這種情況下，您可以顯式指定必要的框架，並透過在專案 `gradle.properties` 檔案中新增此行來停用自動解析：

```text
kotlin.test.infer.jvm.variant=false
```

如果您在組建指令碼中顯式使用了 `kotlin("test")` 的變體，且您的專案組建因相容性衝突而停止運作，
請參閱 [相容性指南中的此問題](compatibility-guide-15.md#do-not-mix-several-jvm-variants-of-kotlin-test-in-a-single-project)。

### 設定對 kotlinx 程式庫的相依性

如果您使用多平台程式庫且需要依賴共用程式碼，請在共用原始碼集中僅設定一次相依性。使用程式庫的基礎構件名稱，例如 `kotlinx-coroutines-core` 或 `ktor-client-core`：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        commonMain.dependencies {
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets {
        commonMain {
            dependencies {
                implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%'
            }
        }
    }
}
```

</tab>
</tabs>

如果您需要用於平台特定相依性的 kotlinx 程式庫，您仍然可以在對應的平台原始碼集中使用該程式庫的基礎構件名稱：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        jvmMain.dependencies {
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets {
        jvmMain {
            dependencies {
                implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%'
            }
        }
    }
}
```

</tab>
</tabs>

## 宣告存儲庫

您可以宣告公開可用的存儲庫來使用其開源相依性。在 `repositories{}` 區塊中設定存儲庫的名稱：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
repositories {
    mavenCentral()
}
```
</tab>
<tab title="Groovy" group-key="groovy">

```groovy
repositories {
    mavenCentral()
}
```
</tab>
</tabs>

熱門的存儲庫包括 [Maven Central](https://central.sonatype.com/) 和 [Google 的 Maven 存儲庫](https://maven.google.com/web/index.html)。

> 如果您也使用 Maven 專案，我們建議避免將 `mavenLocal()` 新增為存儲庫，因為在 Gradle 和 Maven 專案之間切換時可能會遇到問題。如果您必須新增 `mavenLocal()` 存儲庫，請將其作為 `repositories{}` 區塊中的最後一個存儲庫。如需更多資訊，請參閱 [使用 mavenLocal() 的案例](https://docs.gradle.org/current/userguide/declaring_repositories.html#sec:case-for-maven-local)。
> 
{style="warning"}

如果您需要在多個子專案中宣告相同的存儲庫，請在 `settings.gradle(.kts)` 檔案中的 `dependencyResolutionManagement{}` 區塊中集中宣告存儲庫：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
dependencyResolutionManagement {
    repositories {
        mavenCentral()
    }
}
```
</tab>
<tab title="Groovy" group-key="groovy">

```groovy
dependencyResolutionManagement {
    repositories {
        mavenCentral()
    }
}
```
</tab>
</tabs>

子專案中任何宣告的存儲庫都會覆蓋集中宣告的存儲庫。有關如何控制此行為以及有哪些可用選項的更多資訊，請參閱 [Gradle 的文件](https://docs.gradle.org/current/userguide/declaring_repositories.html#sub:centralized-repository-declaration)。

## 註冊產生的原始碼
<primary-label ref="experimental-general"/>

註冊產生的原始碼以幫助 IDE、第三方外掛程式和其他工具區分產生的程式碼和常規原始碼檔案。
這有助於 IDE 等工具在 UI 中以不同方式醒目提示產生的程式碼，並在匯入專案時觸發產生任務。
使用 [`KotlinSourceSet`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/) 介面來註冊產生的原始碼。

若要註冊包含 Kotlin 檔案的目錄，請在您的 `build.gradle.kts` 檔案中使用 [`generatedKotlin`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/generated-kotlin.html) 屬性搭配 [`SourceDirectorySet`](https://docs.gradle.org/current/kotlin-dsl/gradle/org.gradle.api.file/-source-directory-set/index.html) 類型。例如：

```kotlin
val generatorTask = project.tasks.register("generator") {
    val outputDirectory = project.layout.projectDirectory.dir("src/main/kotlinGen")
    outputs.dir(outputDirectory)
    doLast {
        outputDirectory.file("generated.kt").asFile.writeText(
            // language=kotlin
            """
            fun printHello() {
                println("hello")
            }
            """.trimIndent()
        )
    }
}

kotlin.sourceSets.getByName("main").generatedKotlin.srcDir(generatorTask)
```

此範例建立了一個名為 `generator` 的新任務，其輸出目錄為 `"src/main/kotlinGen"`。當任務執行時，`doLast {}` 任務操作會在輸出目錄中建立一個 `generated.kt` 檔案。最後，該範例將任務的輸出註冊為產生的原始碼。

如果您正在開發 Gradle 外掛程式，您可以使用 [`allKotlinSources`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/all-kotlin-sources.html) 屬性來存取在 [`KotlinSourceSet.kotlin`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/kotlin.html) 和 `KotlinSourceSet.generatedKotlin` 屬性中註冊的所有原始碼。

## 下一步是什麼？

進一步了解：
* [編譯器選項以及如何傳遞它們](gradle-compiler-options.md)。
* [累加編譯、快取支援、組建報告和 Kotlin daemon](gradle-compilation-and-caches.md)。
* [Gradle 基礎與細節](https://docs.gradle.org/current/userguide/userguide.html)。
* [Gradle 外掛程式變體的支援](gradle-plugin-variants.md)。