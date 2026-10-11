[//]: # (title: 設定 Gradle 專案)

若要使用 [Gradle](https://docs.gradle.org/current/userguide/userguide.html) 建置 Kotlin 專案，
你需要在建置指令碼檔案 `build.gradle(.kts)` 中[套用 Kotlin Gradle 外掛程式](#apply-the-plugin)，
並在其中[設定專案的相依性](#configure-dependencies)。

> 若要進一步了解建置指令碼的內容，
> 請參閱[探索建置指令碼](get-started-with-jvm-gradle-project.md#explore-the-build-script)章節。
>
{style="note"}

## 套用外掛程式 {id="apply-the-plugin"}

若要套用 Kotlin Gradle 外掛程式，請使用 Gradle plugins DSL 中的 [`plugins{}` 區塊](https://docs.gradle.org/current/userguide/plugins.html#sec:plugins_block)：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    // 將 `<...>` 替換為適合你目標環境的外掛程式名稱
    kotlin("<...>") version "%kotlinVersion%"
    // 例如，如果你的目標環境是 JVM：
    // kotlin("jvm") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    // 將 `<...>` 替換為適合你目標環境的外掛程式名稱
    id 'org.jetbrains.kotlin.<...>' version '%kotlinVersion%'
    // 例如，如果你的目標環境是 JVM： 
    // id 'org.jetbrains.kotlin.jvm' version '%kotlinVersion%'
}
```

</tab>
</tabs>

> Kotlin Gradle 外掛程式 (KGP) 與 Kotlin 共用相同的版本編號。
>
{style="note"}

在設定專案時，請檢查 Kotlin Gradle 外掛程式 (KGP) 與可用 Gradle 版本的相容性。
下表列出了 Gradle 和 Android Gradle 外掛程式 (AGP) **完全支援**的最低與最高版本：

| KGP 版本   | Gradle 最低與最高版本           | AGP 最低與最高版本                            |
|---------------|---------------------------------------|-----------------------------------------------------|
| 2.4.20–2.4.21        | %minGradleVersion%–%maxGradleVersion% | %minAndroidGradleVersion%–%maxAndroidGradleVersion% |
| 2.4.0–2.4.10  | 7.6.3–9.5.0                           | 8.5.2–9.1.0                                         |
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

> *Kotlin 2.0.20–2.0.21 與 Kotlin 2.1.0–2.1.10 可完全相容至 Gradle 8.6。
> Gradle 8.7–8.10 亦受支援，但只有一個例外：如果你使用 Kotlin Multiplatform Gradle 外掛程式，
> 在多平台專案中於 JVM 目標呼叫 `withJava()` 函式時，可能會看到棄用警告。
> 如需詳細資訊，請參閱[預設建立的 Java 原始碼集](https://kotlinlang.org/docs/multiplatform/multiplatform-compatibility-guide.html#java-source-sets-created-by-default)。
>
{style="warning"}

你也可以使用最新發行版本的 Gradle 和 AGP，但若這樣做，請注意你可能會遇到棄用警告，或者某些新功能可能無法正常運作。

例如，Kotlin Gradle 外掛程式與 `kotlin-multiplatform` 外掛程式 %kotlinVersion% 需要最低 %minGradleVersion% 的 Gradle 版本才能編譯你的專案。

同樣地，完全支援的最高版本是 %maxGradleVersion%。它沒有已棄用的 Gradle 方法與屬性，並且支援所有目前的 Gradle 功能。

### 較早的 KGP 版本 {initial-collapse-state="collapsed" collapsible="true" id="earlier-kgp-versions"}

| KGP 版本   | Gradle 最低與最高版本           | AGP 最低與最高版本                            |
|---------------|---------------------------------------|-----------------------------------------------------|
| 1.9.0–1.9.10  | 6.8.3–7.6.0                           | 4.2.2–7.4.0                                         |
| 1.8.20–1.8.22 | 6.8.3–7.6.0                           | 4.1.3–7.4.0                                         |      
| 1.8.0–1.8.11  | 6.8.3–7.3.3                           | 4.1.3–7.2.1                                         |   
| 1.7.20–1.7.22 | 6.7.1–7.1.1                           | 3.6.4–7.0.4                                         |
| 1.7.0–1.7.10  | 6.7.1–7.0.2                           | 3.4.3–7.0.2                                         |
| 1.6.20–1.6.21 | 6.1.1–7.0.2                           | 3.4.3–7.0.2                                         |

### 專案中的 Kotlin Gradle 外掛程式資料 {id="kotlin-gradle-plugin-data-in-a-project"}

預設情況下，Kotlin Gradle 外掛程式會將專案特定的永續資料儲存在專案根目錄的 `.kotlin` 目錄中。

> 請勿將 `.kotlin` 目錄提交至版本控制系統。
> 例如，如果你使用 Git，請將 `.kotlin` 新增至專案的 `.gitignore` 檔案中。
>
{style="warning"}

你可以在專案的 `gradle.properties` 檔案中新增屬性來設定此行為：

| Gradle 屬性                                     | 說明                                                                                                                                       |
|-----------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| `kotlin.project.persistent.dir`                     | 設定專案層級資料的儲存位置。預設值：`<project-root-directory>/.kotlin`                                      |
| `kotlin.project.persistent.dir.gradle.disableWrite` | 控制是否停用將 Kotlin 資料寫入 `.gradle` 目錄（用於與舊版 IDEA 版本的回溯相容性）。預設值：false |

## 目標鎖定 JVM {id="targeting-the-jvm"}

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

在此區塊中，`version` 必須是常值，且無法從另一個建置指令碼套用。

### Kotlin 與 Java 原始碼 {id="kotlin-and-java-sources"}

Kotlin 原始碼與 Java 原始碼可以儲存在同一個目錄中，也可以放在不同的目錄中。

預設慣例是使用不同的目錄：

```text
project
    - src
        - main (root)
            - kotlin
            - java
```

> 請勿將 Java 的 `.java` 檔案儲存在 `src/*/kotlin` 目錄中，因為這些 `.java` 檔案將不會被編譯。
> 
> 相反地，你可以使用 `src/main/java`。
>
{style="warning"} 

如果你不使用預設慣例，則應更新對應的 `sourceSets` 屬性：

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

### 檢查相關編譯任務的 JVM 目標相容性 {id="check-for-jvm-target-compatibility-of-related-compile-tasks"}

在建置模組中，你可能會有相關聯的編譯任務，例如：
* `compileKotlin` 與 `compileJava`
* `compileTestKotlin` 與 `compileTestJava`

> `main` 與 `test` 原始碼集的編譯任務彼此是不相關的。
>
{style="note"}

對於像這類相關的任務，Kotlin Gradle 外掛程式會檢查 JVM 目標相容性。如果在 `kotlin` 擴充套件或任務中的 [`jvmTarget` 屬性](gradle-compiler-options.md#attributes-specific-to-jvm)
與 `java` 擴充套件或任務中的 [`targetCompatibility`](https://docs.gradle.org/current/userguide/java_plugin.html#sec:java-extension)
設定了不同的值，將會導致 JVM 目標不相容。例如：
`compileKotlin` 任務具有 `jvmTarget=1.8`，而
`compileJava` 任務具有（或[繼承](https://docs.gradle.org/current/userguide/java_plugin.html#sec:java-extension)）`targetCompatibility=15`。

透過在 `gradle.properties` 檔案中設定 `kotlin.jvm.target.validation.mode` 屬性，可以設定整個專案此項檢查的行為：

* `error` – 外掛程式使建置失敗；適用於 Gradle 8.0+ 專案的預設值。
* `warning` – 外掛程式印出警告訊息；適用於低於 Gradle 8.0 專案的預設值。
* `ignore` – 外掛程式跳過檢查且不產生任何訊息。

你也可以在 `build.gradle(.kts)` 檔案中的任務層級進行設定：

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

為避免 JVM 目標不相容，請[設定工具鏈](#gradle-java-toolchains-support)或手動對齊 JVM 版本。

#### 如果目標不相容會發生什麼問題 {initial-collapse-state="collapsed" collapsible="true" id="what-can-go-wrong-if-targets-are-incompatible"}

有兩種手動設定 Kotlin 和 Java 原始碼集 JVM 目標的方法：
* 隱式方式：透過[設定 Java 工具鏈](#gradle-java-toolchains-support)。
* 顯式方式：透過在 `kotlin` 擴充套件或任務中設定 `jvmTarget` 屬性，並在 `java` 擴充套件或任務中設定 `targetCompatibility`。

如果你遇到以下情況，就會發生 JVM 目標不相容：
* 明確設定了不同的 `jvmTarget` 和 `targetCompatibility` 值。
* 使用預設設定，且你的 JDK 不等於 `1.8`。

讓我們考慮建置指令碼中只有 Kotlin JVM 外掛程式且沒有額外 JVM 目標設定時的預設配置：

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

當建置指令碼中沒有關於 `jvmTarget` 值的明確資訊時，其預設值為 `null`，
且編譯器會將其轉換為預設值 `1.8`。而 `targetCompatibility` 等於
當前 Gradle 的 JDK 版本，也就是你的 JDK 版本（除非你使用
[Java 工具鏈方式](gradle-configure-project.md#gradle-java-toolchains-support)）。假設你的 JDK 版本是
`%jvmLTSVersionSupportedByKotlin%`，你發布的程式庫構件將會[聲明自身相容於](https://docs.gradle.org/current/userguide/publishing_gradle_module_metadata.html)
JDK %jvmLTSVersionSupportedByKotlin%+：`org.gradle.jvm.version=%jvmLTSVersionSupportedByKotlin%`，這是不正確的。
在這種情況下，即使位元組碼的版本為 `1.8`，你也必須在主專案中使用 Java %jvmLTSVersionSupportedByKotlin% 才能新增此程式庫。[設定工具鏈](gradle-configure-project.md#gradle-java-toolchains-support)
即可解決此問題。

### Gradle Java 工具鏈支援 {id="gradle-java-toolchains-support"}

> Android 使用者注意事項：若要使用 Gradle 工具鏈支援，請使用 Android Gradle 外掛程式 (AGP) 8.1.0-alpha09 或更高版本。
> 
> Gradle Java 工具鏈支援僅從 AGP 7.4.0 起[開始提供](https://issuetracker.google.com/issues/194113162)。
> 然而，由於[此問題](https://issuetracker.google.com/issues/260059413)，在 8.1.0-alpha09 版本之前，AGP 並未將 `targetCompatibility` 
> 設定為等於工具鏈的 JDK。
> 如果你使用的版本低於 8.1.0-alpha09，你需要透過 `compileOptions` 手動設定 `targetCompatibility`。
> 將占位符號 `<MAJOR_JDK_VERSION>` 替換為你想要使用的 JDK 版本：
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
使用此功能，你可以：
* 使用與 Gradle 不同的 JDK 和 JRE 來執行編譯、測試和可執行檔。
* 使用尚未發行的語言版本編譯與測試程式碼。

有了工具鏈支援，Gradle 可以自動偵測本機 JDK，並安裝 Gradle 建置所需的缺失 JDK。
現在 Gradle 本身可以在任何 JDK 上執行，並且對於相依於主要 JDK 版本的任務，
仍然可以重複使用[遠端建置快取功能](gradle-compilation-and-caches.md#gradle-build-cache-support)。

Kotlin Gradle 外掛程式支援在 Kotlin/JVM 編譯任務中使用 Java 工具鏈。JS 和 Native 任務不使用工具鏈。
Kotlin 編譯器一律在 Gradle 常駐程式 (daemon) 所執行的 JDK 上執行。
Java 工具鏈：
* 設定適用於 JVM 目標的 [`-jdk-home` 選項](compiler-reference.md#jdk-home-path)。
* 如果使用者未明確設定 `jvmTarget` 選項，則將 [`compilerOptions.jvmTarget`](gradle-compiler-options.md#attributes-specific-to-jvm)
  設定為工具鏈的 JDK 版本。
  如果使用者未設定工具鏈，則 `jvmTarget` 欄位會使用預設值。
  進一步了解 [JVM 目標相容性](#check-for-jvm-target-compatibility-of-related-compile-tasks)。
* 設定任何 Java 編譯、測試和 javadoc 任務所使用的工具鏈。
* 影響 [`kapt` 背景工作執行緒](kapt.md#run-kapt-tasks-in-parallel)在何種 JDK 上執行。

使用以下程式碼來設定工具鏈。將占位符號 `<MAJOR_JDK_VERSION>` 替換為你想要使用的 JDK 版本：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    jvmToolchain {
        languageVersion.set(JavaLanguageVersion.of(<MAJOR_JDK_VERSION>))
    }
    // 或簡寫為：
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
    // 或簡寫為：
    jvmToolchain(<MAJOR_JDK_VERSION>)
    // 例如：
    jvmToolchain(%jvmLTSVersionSupportedByKotlin%)
}
```

</tab>
</tabs>

請注意，透過 `kotlin` 擴充套件設定工具鏈也會同時更新 Java 編譯任務的工具鏈。

你可以透過 `java` 擴充套件設定工具鏈，Kotlin 編譯任務將會使用它：

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

如果你使用 Gradle 8.0.2 或更高版本，你還需要新增[工具鏈解析器外掛程式](https://docs.gradle.org/current/userguide/toolchains.html#sub:download_repositories)。
此類型的外掛程式管理要從哪些存放庫下載工具鏈。舉例來說，將以下外掛程式新增至你的 `settings.gradle(.kts)`：

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

請在 [Gradle 網站](https://docs.gradle.org/current/userguide/toolchains.html#sub:download_repositories)上檢查 `foojay-resolver-convention` 的版本是否對應於你的 Gradle 版本。

> 若要了解 Gradle 使用了哪一個工具鏈，請以[記錄層級 `--info`](https://docs.gradle.org/current/userguide/logging.html#sec:choosing_a_log_level)
> 執行你的 Gradle 建置，並在輸出中尋找以 `[KOTLIN] Kotlin compilation 'jdkHome' argument:` 開頭的字串。
> 冒號後面的部分即為來自工具鏈的 JDK 版本。
>
{style="note"}

若要為特定任務設定任何 JDK（甚至是本機 JDK），請使用 [Task DSL](#set-jdk-version-with-the-task-dsl)。

進一步了解 [Kotlin 外掛程式中的 Gradle JVM 工具鏈支援](https://blog.jetbrains.com/kotlin/2021/11/gradle-jvm-toolchain-support-in-the-kotlin-plugin/)。

### 使用 Task DSL 設定 JDK 版本 {id="set-jdk-version-with-the-task-dsl"}

Task DSL 允許為實作 `UsesKotlinJavaToolchain` 介面的任何任務設定任何 JDK 版本。
目前，這些任務是 `KotlinCompile` 和 `KaptTask`。
如果你希望 Gradle 搜尋主要 JDK 版本，請在建置指令碼中替換 `<MAJOR_JDK_VERSION>` 占位符號：

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

或者你可以指定本機 JDK 的路徑，並將占位符號 `<LOCAL_JDK_VERSION>` 替換為該 JDK 版本：

```kotlin
tasks.withType<UsesKotlinJavaToolchain>().configureEach {
    kotlinJavaToolchain.jdk.use(
        "/path/to/local/jdk", // 填入你的 JDK 路徑
        JavaVersion.<LOCAL_JDK_VERSION> // 例如，JavaVersion.17
    )
}
```

### 關聯編譯器任務 {id="associate-compiler-tasks"}

你可以透過建立編譯任務之間的關係來*關聯*編譯，使一個編譯任務使用另一個編譯任務的編譯輸出。
關聯編譯會在它們之間建立 `internal` 可見性。

Kotlin 編譯器預設會關聯某些編譯任務，例如每個目標的 `test` 和 `main` 編譯。
如果你需要表達自訂編譯任務與另一個任務相連，請建立你自己的關聯編譯。

若要讓 IDE 支援關聯編譯以推論原始碼集之間的可見性，請將以下程式碼新增至你的 `build.gradle(.kts)`：

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

在此範例中，`integrationTest` 編譯與 `main` 編譯相關聯，從而賦予功能測試存取 `internal` 物件的權限。

### 在啟用 Java 模組 (JPMS) 的情況下進行設定 {id="configure-with-java-modules-jpms-enabled"}

若要使 Kotlin Gradle 外掛程式與 [Java 模組](https://dev.java/learn/modules/)搭配運作，
請在建置指令碼中新增以下內容，並將 `YOUR_MODULE_NAME` 替換為你的 JPMS 模組參照，例如 `org.company.module`：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.named("compileJava", JavaCompile::class.java) {
    // 將編譯後的 Kotlin 類別提供給 javac – 這是 Java/Kotlin 混合原始碼正常運作所必需的
    val mainOutput: FileCollection = sourceSets["main"].output
    options.compilerArgumentProviders.add(CommandLineArgumentProvider {
        listOf("--patch-module", "YOUR_MODULE_NAME=${mainOutput.asPath}")
    })
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
tasks.named("compileJava", JavaCompile.class) {
    // 將編譯後的 Kotlin 類別提供給 javac – 這是 Java/Kotlin 混合原始碼正常運作所必需的
    FileCollection mainOutput = sourceSets["main"].output
    options.compilerArgumentProviders.add(new CommandLineArgumentProvider() {
        @Override
        Iterable<String> asArguments() {
            return ["--patch-module", "YOUR_MODULE_NAME=${mainOutput.asPath}"]
        }
    })
}
```

</tab>
</tabs>

> 照常將 `module-info.java` 放入 `src/main/java` 目錄中。
> 
> 對於模組而言，Kotlin 檔案中的套件名稱應等於 `module-info.java` 中的套件名稱，以避免出現「package is empty or does not exist」建置失敗。
>
{style="note"}

進一步了解：
* [為 Java 模組系統建置模組](https://docs.gradle.org/current/userguide/java_library_plugin.html#sec:java_library_modular)
* [使用 Java 模組系統建置應用程式](https://docs.gradle.org/current/userguide/application_plugin.html#sec:application_modular)
* [Kotlin 中「模組」的涵義](visibility-modifiers.md#modules)

### 其他詳細資訊 {id="other-details"}

#### 停用編譯任務中的構件使用 {id="disable-use-of-artifact-in-compilation-task"}

在極少數情況下，你可能會遇到由循環相依錯誤導致的建置失敗。例如，當你有多個編譯任務，
其中一個編譯可以看見另一個編譯的所有內部宣告，而產生的構件又依賴於這兩個編譯任務的輸出：

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
此屬性控制編譯任務中構件輸入的使用，並決定是否因此建立任務相依性。

預設情況下，此屬性設為 `true` 以追蹤任務相依性。如果你遇到循環相依錯誤，
可以在編譯任務中停用構件的使用，以移除任務相依性並避免循環相依錯誤。

若要在編譯任務中停用構件的使用，請在 `gradle.properties` 檔案中新增以下內容：

```kotlin
kotlin.build.archivesTaskOutputAsFriendModule=false
```

#### 延遲建立 Kotlin/JVM 任務 {id="lazy-kotlin-jvm-task-creation"}

從 Kotlin 1.8.20 開始，Kotlin Gradle 外掛程式會註冊所有任務，並且在試執行 (dry run) 時不會對它們進行設定。

#### 編譯任務 destinationDirectory 的非預設位置 {id="non-default-location-of-compile-tasks-destinationdirectory"}

如果你覆寫了 Kotlin/JVM `KotlinJvmCompile`/`KotlinCompile` 任務的 `destinationDirectory` 位置，
請更新你的建置指令碼。你需要明確地將 `sourceSets.main.kotlin.classesDirectories` 新增至 JAR 檔案中的 `sourceSets.main.outputs`：

```kotlin
tasks.jar(type: Jar) {
    from sourceSets.main.outputs
    from sourceSets.main.kotlin.classesDirectories
}
```

## 目標鎖定多平台 {id="targeting-multiple-platforms"}

鎖定[多平台](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#targets)的專案（稱為[多平台專案](https://kotlinlang.org/docs/multiplatform/get-started.html)）
需要 `kotlin-multiplatform` 外掛程式。

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

進一步了解[適用於不同平台的 Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform/get-started.html) 以及 
[適用於 iOS 和 Android 的 Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform/multiplatform-getting-started.html)。

## 目標鎖定 Android {id="targeting-android"}

建議使用 Android Studio 來建立 Android 應用程式。[了解如何使用 Android Gradle 外掛程式](https://developer.android.com/studio/releases/gradle-plugin)。

## 目標鎖定 Web {id="targeting-the-web"}

Kotlin 透過 Kotlin Multiplatform 為 Web 開發提供兩種途徑：

* 基於 JavaScript（使用 Kotlin/JS 編譯器）
* 基於 WebAssembly（使用 Kotlin/Wasm 編譯器）

兩種途徑均使用 Kotlin Multiplatform 外掛程式，但支援不同的使用案例。
以下各節將說明如何在 Gradle 建置中設定每個目標以及何時使用它們。

### 目標鎖定 JavaScript {id="targeting-javascript"}

如果你的目標是進行以下作業，請使用 Kotlin/JS：

* 與 JavaScript/TypeScript 程式碼庫共用商務邏輯
* 使用 Kotlin 建置不可共用的 Web 應用程式

如需詳細資訊，請參閱 [Web 開發](web-overview.md#kotlin-js)。

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

透過指定應在瀏覽器還是 Node.js 環境中執行來設定 JavaScript 目標：

```kotlin
kotlin {
    js().browser {  // 或 js().nodejs
        /* ... */
    }
}
```

> 請參閱[關於 JavaScript 的 Gradle 設定進一步詳細資訊](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#web-targets)，並進一步了解[設定 Kotlin/JS 專案](js-project-setup.md)。
>
{style="note"}

### 目標鎖定 WebAssembly {id="targeting-webassembly"}

如果你希望在多個平台之間共用邏輯和 UI，請使用 Kotlin/Wasm。如需詳細資訊，
請參閱 [Web 開發](web-overview.md#kotlin-wasm)。

與 JavaScript 一樣，以 WebAssembly (Wasm) 為目標時，請使用 `kotlin-multiplatform` 外掛程式：

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

根據你的需求，你可以鎖定以下目標：

* **`wasmJs`**：用於在瀏覽器或 Node.js 中執行
* **`wasmWasi`**：用於在支援 [WASI (WebAssembly System Interface)](https://wasi.dev/) 的 Wasm 環境中執行，例如 Wasmtime、WasmEdge 等。

為網頁瀏覽器或 Node.js 設定 `wasmJs` 目標：

```kotlin
kotlin {
    wasmJs {
        browser { // 或 nodejs
            /* ... */
        }
    }
}
```

對於 WASI 環境，請使用 Node.js 或 Wasmtime 設定 `wasmWasi` 目標：

```kotlin
kotlin {
    wasmWasi {
        nodejs { // 或 wasmtime
            /* ... */
        }
    }
}
```

> [請參閱關於 Wasm 的 Gradle 設定進一步詳細資訊](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#web-targets)。
>
{style="note"}

### Web 目標的 Kotlin 與 Java 原始碼 {id="kotlin-and-java-sources-for-the-web-target"}

KGP 僅適用於 Kotlin 檔案，因此建議你將 Kotlin 與 Java 檔案分開存放（如果專案包含 Java 檔案）。如果不分開存放，請在 `sourceSets{}` 區塊中指定原始碼資料夾：

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

## 使用 KotlinBasePlugin 介面觸發設定操作 {id="triggering-configuration-actions-with-the-kotlinbaseplugin-interface"}

每當套用任何 Kotlin Gradle 外掛程式（JVM、JS、Multiplatform、Native 等）時，若要觸發某些設定操作，
請使用所有 Kotlin 外掛程式所繼承的 `KotlinBasePlugin` 介面：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.plugin.KotlinBasePlugin

// ...

project.plugins.withType<KotlinBasePlugin>() {
    // 在此處設定你的操作
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.plugin.KotlinBasePlugin

// ...

project.plugins.withType(KotlinBasePlugin.class) {
    // 在此處設定你的操作
}
```

</tab>
</tabs>

## 設定相依性 {id="configure-dependencies"}

若要新增對程式庫的相依性，請在原始碼集 DSL 的 `dependencies{}` 區塊中設定所需[類型](#dependency-types)的相依性（例如 `implementation`）。

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

### 在最頂層設定相依性 {id="configure-dependencies-at-the-top-level"}
<primary-label ref="experimental-opt-in"/>

你可以使用頂層 `dependencies {}` 區塊在多平台專案中設定共用相依性。
在此宣告的相依性運作方式就如同將它們新增到 `commonMain` 或 `commonTest` 原始碼集中一樣。

若要使用頂層 `dependencies {}` 區塊，請在該區塊前新增 `@OptIn(ExperimentalKotlinGradlePluginApi::class)` 註解以選擇加入：

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

在對應目標的 `sourceSets {}` 區塊內新增特定於平台的相依性。

你可以在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-76446) 上分享你對此功能的回饋。

### 相依性類型 {id="dependency-types"}

根據你的需求選擇相依性類型。

<table>
    <tr>
        <th>類型</th>
        <th>說明</th>
        <th>何時使用</th>
    </tr>
    <tr>
        <td><code>api</code></td>
        <td>在編譯期間和執行階段都會使用，並匯出給程式庫使用者。</td>
        <td>如果來自相依性的任何型別用於目前模組的公用 API 中，請使用 <code>api</code> 相依性。
        </td>
    </tr>
    <tr>
        <td><code>implementation</code></td>
        <td>在目前模組的編譯期間和執行階段使用，但不會對相依於包含 <code>implementation</code> 相依性模組的其他模組公開編譯。</td>
        <td>
            <p>用於模組內部邏輯所需的相依性。</p>
            <p>如果模組是不發布的終端應用程式，請使用 <code>implementation</code> 相依性取代 <code>api</code> 相依性。</p>
        </td>
    </tr>
    <tr>
        <td><code>compileOnly</code></td>
        <td>用於目前模組的編譯，在執行階段以及其他模組編譯期間均不可用。</td>
        <td>用於在執行階段具有可用第三方實作的 API。</td>
    </tr>
    <tr>
        <td><code>runtimeOnly</code></td>
        <td>在執行階段可用，但在任何模組的編譯期間均不可見。</td>
        <td></td>
    </tr>
</table>

### 標準程式庫的相依性 {id="dependency-on-the-standard-library"}

每個原始碼集都會自動新增對標準程式庫 (`stdlib`) 的相依性。所使用的標準程式庫版本與 Kotlin Gradle 外掛程式的版本相同。

對於平台專屬的原始碼集，會使用該程式庫對應的平台專屬變體，而其餘原始碼集則新增通用標準程式庫。Kotlin Gradle 外掛程式會根據 Gradle 建置指令碼的 `compilerOptions.jvmTarget` [編譯器選項](gradle-compiler-options.md)來選擇適當的 JVM 標準程式庫。

如果你明確宣告標準程式庫相依性（例如，如果你需要不同的版本），Kotlin Gradle 外掛程式不會覆寫它，也不會新增第二個標準程式庫。

如果你完全不需要標準程式庫，可以在 `gradle.properties` 檔案中新增以下 Gradle 屬性：

```none
kotlin.stdlib.default.dependency=false
```

#### 傳遞相依性的版本對齊 {id="versions-alignment-of-transitive-dependencies"}

從 Kotlin 標準程式庫 1.9.20 版開始，Gradle 會使用標準程式庫中包含的元資料來自動對齊傳遞的 `kotlin-stdlib-jdk7` 與 `kotlin-stdlib-jdk8` 相依性。

如果你新增了 1.8.0 至 1.9.10 之間的任何 Kotlin 標準程式庫版本的相依性，例如：
`implementation("org.jetbrains.kotlin:kotlin-stdlib:1.8.0")`，則 Kotlin Gradle 外掛程式會將此 Kotlin 版本用於傳遞的 `kotlin-stdlib-jdk7` 與 `kotlin-stdlib-jdk8` 相依性。這避免了來自不同標準程式庫版本的類別重複問題。[進一步了解將 `kotlin-stdlib-jdk7` 與 `kotlin-stdlib-jdk8` 合併至 `kotlin-stdlib`](whatsnew18.md#updated-jvm-compilation-target)。
你可以在 `gradle.properties` 檔案中使用 `kotlin.stdlib.jdk.variants.version.alignment` Gradle 屬性來停用此行為：

```none
kotlin.stdlib.jdk.variants.version.alignment=false
```

##### 對齊版本的其他方法 {initial-collapse-state="collapsed" collapsible="true" id="other-ways-to-align-versions"}

* 如果你在版本對齊方面遇到問題，可以透過 Kotlin [BOM](https://docs.gradle.org/current/userguide/platforms.html#sub:bom_import) 對齊所有版本。
  在你的建置指令碼中宣告對 `kotlin-bom` 的平台相依性：

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

* 如果你沒有新增標準程式庫版本的相依性，但有兩個不同的相依性以傳遞方式引入了不同舊版的 Kotlin 標準程式庫，
  則你可以明確要求這些傳遞程式庫使用 `%kotlinVersion%` 版本：

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
  
* 如果你新增了 Kotlin 標準程式庫版本 `%kotlinVersion%` 的相依性：`implementation("org.jetbrains.kotlin:kotlin-stdlib:%kotlinVersion%")`，
  但使用的是舊版（早於 `1.8.0`）的 Kotlin Gradle 外掛程式，請更新 Kotlin Gradle 外掛程式以符合該標準程式庫版本：

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

* 如果你使用的 `kotlin-stdlib-jdk7`/`kotlin-stdlib-jdk8` 版本早於 `1.8.0`，例如：
  `implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk7:SOME_OLD_KOTLIN_VERSION")`，並且某個相依性傳遞引入了 `kotlin-stdlib:1.8+`，
  請[將 `kotlin-stdlib-jdk<7/8>:SOME_OLD_KOTLIN_VERSION` 替換為 `kotlin-stdlib-jdk*:%kotlinVersion%`](whatsnew18.md#updated-jvm-compilation-target)，
  或從引入它的程式庫中[排除](https://docs.gradle.org/current/userguide/dependency_downgrade_and_exclude.html#sec:excluding-transitive-deps)傳遞的 `kotlin-stdlib:1.8+`：

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

### 設定測試程式庫的相依性 {id="set-dependencies-on-test-libraries"}

[`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) API 可用於在所有受支援平台上測試 Kotlin 專案。
將 `kotlin-test` 相依性新增至 `commonTest` 原始碼集，這樣 Gradle 外掛程式就可以為每個測試原始碼集推論對應的測試相依性。

Kotlin/Native 目標不需要額外的測試相依性，且 `kotlin.test` API 實作是內建的。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        commonTest.dependencies {
            implementation(kotlin("test")) // 這會自動引入所有平台相依性
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
                implementation kotlin("test") // 這會自動引入所有平台相依性
            }
        }
    }
}
```

</tab>
</tabs>

> 你可以對 Kotlin 模組相依性使用簡寫，例如使用 kotlin("test") 代表 "org.jetbrains.kotlin:kotlin-test"。
>
{style="note"}

你也可以在任何共用或平台專屬的原始碼集中使用 `kotlin-test` 相依性。

#### kotlin-test 的 JVM 變體 {id="jvm-variants-of-kotlin-test"}

對於 Kotlin/JVM，Gradle 預設使用 JUnit 4。因此，`kotlin("test")` 相依性會解析為 JUnit 4 的變體，即 `kotlin-test-junit`。

你可以在建置指令碼的測試任務中呼叫
[`useJUnitPlatform()`]( https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/testing/Test.html#useJUnitPlatform)
或 [`useTestNG()`](https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/testing/Test.html#useTestNG) 來選擇 JUnit 5 或 TestNG。
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

自動 JVM 變體解析有時可能會導致設定出現問題。在這種情況下，你可以明確指定所需的架構，
並透過在專案的 `gradle.properties` 檔案中新增此行來停用自動解析：

```text
kotlin.test.infer.jvm.variant=false
```

如果你在建置指令碼中明確使用了 `kotlin("test")` 的某個變體，且專案建置因相容性衝突而停止運作，
請參閱[相容性指南中的此問題](compatibility-guide-15.md#do-not-mix-several-jvm-variants-of-kotlin-test-in-a-single-project)。

### 設定 kotlinx 程式庫的相依性 {id="set-a-dependency-on-a-kotlinx-library"}

如果你使用多平台程式庫並且需要相依於共用程式碼，請僅在共用原始碼集中設定一次該相依性。
使用該程式庫的基本構件名稱，例如 `kotlinx-coroutines-core` 或 `ktor-client-core`：

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

如果你需要平台專屬相依性的 kotlinx 程式庫，仍可在對應的平台原始碼集中使用該程式庫的基本構件名稱：

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

## 宣告存儲庫 {id="declare-repositories"}

你可以宣告公開可用的存儲庫以使用其開源相依性。在 `repositories{}` 區塊中設定存儲庫名稱：

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

常見的存儲庫包括 [Maven Central](https://central.sonatype.com/) 與 [Google 的 Maven 存儲庫](https://maven.google.com/web/index.html)。

> 如果你也從事 Maven 專案，我們建議避免將 `mavenLocal()` 新增為存儲庫，因為在 Gradle 和 Maven 專案之間切換時可能會遇到問題。
> 如果必須新增 `mavenLocal()` 存儲庫，請將其新增為 `repositories{}` 區塊中的最後一個存儲庫。如需詳細資訊，請參閱
> [The case for mavenLocal()](https://docs.gradle.org/current/userguide/declaring_repositories.html#sec:case-for-maven-local)。
> 
{style="warning"}

如果你需要在多個子專案中宣告相同的存儲庫，請在 `settings.gradle(.kts)` 檔案的 `dependencyResolutionManagement{}` 區塊中集中宣告這些存儲庫：

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

在子專案中宣告的任何存儲庫都會覆寫集中宣告的存儲庫。有關如何控制此行為以及可用選項的詳細資訊，請參閱 [Gradle 的文件](https://docs.gradle.org/current/userguide/declaring_repositories.html#sub:centralized-repository-declaration)。

## 註冊產生的原始碼 {id="register-generated-sources"}
<primary-label ref="experimental-general"/>

註冊產生的原始碼有助於 IDE、第三方外掛程式和其他工具區分產生的程式碼與常規原始碼檔案。
這有助於像 IDE 這樣的工具在 UI 中以不同方式醒目提示產生的程式碼，並在匯入專案時觸發產生任務。
使用 [`KotlinSourceSet`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/) 介面來註冊產生的原始碼。

若要註冊包含 Kotlin 檔案的目錄，請在 `build.gradle.kts` 檔案中使用帶有 [`SourceDirectorySet`](https://docs.gradle.org/current/kotlin-dsl/gradle/org.gradle.api.file/-source-directory-set/index.html) 型別的 [`generatedKotlin`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/generated-kotlin.html) 屬性。例如：

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

此範例建立了一個名為 `generator` 的新任務，其輸出目錄為 `"src/main/kotlinGen"`。當任務執行時，
`doLast {}` 任務操作會在輸出目錄中建立一個 `generated.kt` 檔案。最後，該範例將任務的輸出註冊為產生的原始碼。

如果你正在開發 Gradle 外掛程式，可以使用 [`allKotlinSources`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/all-kotlin-sources.html) 屬性來存取在 [`KotlinSourceSet.kotlin`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/kotlin.html) 和 
`KotlinSourceSet.generatedKotlin` 屬性中註冊的所有原始碼。

## 後續步驟 {id="what-s-next"}

進一步了解：
* [編譯器選項及其傳遞方式](gradle-compiler-options.md)。
* [增量編譯、快取支援、建置報告與 Kotlin 常駐程式 (daemon)](gradle-compilation-and-caches.md)。
* [Gradle 基礎與細節](https://docs.gradle.org/current/userguide/userguide.html)。
* [Gradle 外掛程式變體支援](gradle-plugin-variants.md)。