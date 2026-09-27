[//]: # (title: Kotlin Gradle 外掛程式中的編譯器選項)

Kotlin 的每個版本都包含適用於支援目標的編譯器：
JVM、JavaScript 以及針對[支援平台](native-overview.md#target-platforms)的 Native 二進位檔。

這些編譯器會被以下對象使用：
* 當您在 Kotlin 專案中點擊 **編譯 (Compile)** 或 **執行 (Run)** 按鈕時的 IDE。
* 當您在主控台或 IDE 中呼叫 `gradle build` 時的 Gradle。
* 當您在主控台或 IDE 中呼叫 `mvn compile` 或 `mvn test-compile` 時的 Maven。

您也可以按照[使用命令列編譯器](command-line.md)教學中的說明，從命令列手動執行 Kotlin 編譯器。

## 如何定義選項 {id="how-to-define-options"}

Kotlin 編譯器具有多個選項，用於自訂編譯過程。

Gradle DSL 允許對編譯器選項進行全面的配置。它適用於 [Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#compiler-options) 和 [JVM/Android](#target-the-jvm) 專案。

透過 Gradle DSL，您可以在建置指令碼中於三個層級配置編譯器選項：
* **[擴充層級](#extension-level)**：在 `kotlin {}` 區塊中，適用於所有目標和共用原始碼集。
* **[目標層級](#target-level)**：在特定目標的區塊中。
* **[編譯單元層級](#compilation-unit-level)**：通常在特定的編譯任務中。

![Kotlin 編譯器選項層級](compiler-options-levels.svg){width=700}

較高層級的設定會作為較低層級的慣例（預設值）：

* 在擴充層級設定的編譯器選項是目標層級選項的預設值，包括 `commonMain`、`nativeMain` 和 `commonTest` 等共用原始碼集。
* 在目標層級設定的編譯器選項是編譯單元（任務）層級選項的預設值，例如 `compileKotlinJvm` 和 `compileTestKotlinJvm` 任務。

反之，在較低層級進行的配置會覆蓋較高層級的相關設定：

* 任務層級的編譯器選項會覆蓋目標或擴充層級的相關配置。
* 目標層級的編譯器選項會覆蓋擴充層級的相關配置。

若要了解編譯時套用了哪個層級的編譯器引數，請使用 Gradle [記錄](https://docs.gradle.org/current/userguide/logging.html)的 `DEBUG` 層級。
對於 JVM 和 JS/WASM 任務，請在記錄中搜尋 `"Kotlin compiler args:"` 字串；對於 Native 任務，請搜尋 `"Arguments ="` 字串。

> 如果您是第三方外掛程式作者，最好將您的配置套用於專案層級，以避免覆蓋問題。您可以為此使用新的 [Kotlin 外掛程式 DSL 擴充類型](whatsnew21.md#new-api-for-kotlin-gradle-plugin-extensions)。建議您在自家的文件中明確說明此配置。
>
{style="tip"}

### 擴充層級 {id="extension-level"}

您可以在最上層的 `compilerOptions {}` 區塊中，為所有目標和共用原始碼集配置通用的編譯器選項：

```kotlin
kotlin {
    compilerOptions {
        optIn.add("kotlin.RequiresOptIn")
    }
}
```

### 目標層級 {id="target-level"}

您可以在 `target {}` 區塊內的 `compilerOptions {}` 區塊中，為 JVM/Android 目標配置編譯器選項：

```kotlin
kotlin {
    target {
        compilerOptions {
            optIn.add("kotlin.RequiresOptIn")
        }
    }
}
```

在 Kotlin Multiplatform 專案中，您可以在特定目標內配置編譯器選項。例如 `jvm { compilerOptions {}}`。如需更多資訊，請參閱 [Multiplatform Gradle DSL 參考](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html)。

### 編譯單元層級 {id="compilation-unit-level"}

您可以在任務配置內的 `compilerOptions {}` 區塊中，為特定的編譯單元或任務配置編譯器選項：

```kotlin
tasks.named<KotlinJvmCompile>("compileKotlin"){
    compilerOptions {
        optIn.add("kotlin.RequiresOptIn")
    }
}
```

您也可以透過 `KotlinCompilation` 在編譯單元層級存取並配置編譯器選項：

```kotlin
kotlin {
    target {
        val main by compilations.getting {
            compileTaskProvider.configure {
                compilerOptions {
                    optIn.add("kotlin.RequiresOptIn")
                }
            }
        }
    }
}
```

如果您想要配置 JVM/Android 和 [Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html) 以外的目標外掛程式，請使用相應 Kotlin 編譯任務的 `compilerOptions {}` 屬性。以下範例顯示如何在 Kotlin 和 Groovy DSL 中進行此設定：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.named("compileKotlin", org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask::class.java) {
    compilerOptions {
        apiVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_2_0)
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
tasks.named('compileKotlin', org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask.class) {
    compilerOptions {
        apiVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_2_0)
    }
}
```

</tab>
</tabs>

### 從 `kotlinOptions {}` 遷移至 `compilerOptions {}` {initial-collapse-state="collapsed" collapsible="true" id="migrate-from-kotlinoptions-to-compileroptions"}

在 Kotlin 2.2.0 之前，您可以使用 `kotlinOptions {}` 區塊配置編譯器選項。由於 `kotlinOptions {}` 區塊自 Kotlin 2.0.0 起已被棄用，本節提供了將建置指令碼遷移為使用 `compilerOptions {}` 區塊的指引與建議：

* [集中化編譯器選項並使用型別](#centralize-compiler-options-and-use-types)
* [不再使用 `android.kotlinOptions`](#migrate-away-from-android-kotlinoptions)
* [遷移 `freeCompilerArgs`](#migrate-freecompilerargs)

#### 集中化編譯器選項並使用型別 {id="centralize-compiler-options-and-use-types"}

盡可能在 [擴充層級](#extension-level) 配置編譯器選項，並在 [編譯單元層級](#compilation-unit-level) 為特定任務覆蓋它們。

您不能在 `compilerOptions {}` 區塊中使用原始字串，因此請將其轉換為型別值。例如，如果您原本有：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("jvm") version "%kotlinVersion%"
}

tasks.withType<KotlinCompile>().configureEach {
    kotlinOptions {
        jvmTarget = "%jvmLTSVersionSupportedByKotlin%"
        languageVersion = "%languageVersion%"
        apiVersion = "%apiVersion%"
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```kotlin
plugins {
    id 'org.jetbrains.kotlin.jvm' version '%kotlinVersion%'
}

tasks.withType(KotlinCompile).configureEach {
    kotlinOptions {
        jvmTarget = '%jvmLTSVersionSupportedByKotlin%'
        languageVersion = '%languageVersion%'
        apiVersion = '%apiVersion%'
    }
}
```

</tab>
</tabs>

遷移之後，應該改為：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import org.jetbrains.kotlin.gradle.dsl.KotlinVersion

plugins {
    kotlin("jvm") version "%kotlinVersion%"
}

kotlin {
    // 擴充層級
    compilerOptions {
        jvmTarget = JvmTarget.fromTarget("%jvmLTSVersionSupportedByKotlin%")
        languageVersion = KotlinVersion.fromVersion("%languageVersion%")
        apiVersion = KotlinVersion.fromVersion("%apiVersion%")
    }
}

// 在編譯單元層級覆蓋的範例
tasks.named<KotlinJvmCompile>("compileKotlin"){
    compilerOptions {
        apiVersion = KotlinVersion.fromVersion("%apiVersion%")
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```kotlin
import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import org.jetbrains.kotlin.gradle.dsl.KotlinVersion

plugins {
    id 'org.jetbrains.kotlin.jvm' version '%kotlinVersion%'
}

kotlin {
  // 擴充層級
    compilerOptions {
        jvmTarget = JvmTarget.fromTarget("%jvmLTSVersionSupportedByKotlin%")
        languageVersion = KotlinVersion.fromVersion("%languageVersion%")
        apiVersion = KotlinVersion.fromVersion("%apiVersion%")
    }
}

// 在編譯單元層級覆蓋的範例
tasks.named("compileKotlin", KotlinJvmCompile).configure {
    compilerOptions {
        apiVersion = KotlinVersion.fromVersion("%apiVersion%")
    }
}
```

</tab>
</tabs>

#### 不再使用 `android.kotlinOptions` {id="migrate-away-from-android-kotlinoptions"}

如果您的建置指令碼先前使用了 `android.kotlinOptions`，請遷移至使用 `kotlin.compilerOptions`。可以在擴充層級或目標層級進行遷移。

例如，如果您有一個 Android 專案：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    id("com.android.application")
    kotlin("android")
}

android {
    kotlinOptions {
        jvmTarget = "%jvmLTSVersionSupportedByKotlin%"
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```kotlin
plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

android {
    kotlinOptions {
        jvmTarget = '%jvmLTSVersionSupportedByKotlin%'
    }
}
```
</tab>
</tabs>

將其更新為：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    id("com.android.application")
    kotlin("android")
}

kotlin {
    compilerOptions {
        jvmTarget = JvmTarget.fromTarget("%jvmLTSVersionSupportedByKotlin%")
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```kotlin
plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

kotlin {
    compilerOptions {
        jvmTarget = JvmTarget.fromTarget("%jvmLTSVersionSupportedByKotlin%")
    }
}
```

</tab>
</tabs>

例如，如果您有一個帶有 Android 目標的 Kotlin Multiplatform 專案：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("multiplatform")
    id("com.android.application")
}

kotlin {
    androidTarget {
        compilations.all {
            kotlinOptions.jvmTarget = "%jvmLTSVersionSupportedByKotlin%"
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```kotlin
plugins {
    id 'org.jetbrains.kotlin.multiplatform'
    id 'com.android.application'
}

kotlin {
    androidTarget {
        compilations.all {
            kotlinOptions {
                jvmTarget = '%jvmLTSVersionSupportedByKotlin%'
            }
        }
    }
}
```

</tab>
</tabs>

將其更新為：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("multiplatform")
    id("com.android.application")
}

kotlin {
    androidTarget {
        compilerOptions {
            jvmTarget = JvmTarget.fromTarget("%jvmLTSVersionSupportedByKotlin%")
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```kotlin
plugins {
    id 'org.jetbrains.kotlin.multiplatform'
    id 'com.android.application'
}

kotlin {
    androidTarget {
        compilerOptions {
            jvmTarget = JvmTarget.fromTarget("%jvmLTSVersionSupportedByKotlin%")
        }
    }
}
```

</tab>
</tabs>

#### 遷移 `freeCompilerArgs` {id="migrate-freecompilerargs"}

* 將所有的 `+=` 操作替換為 `add()` 或 `addAll()` 函式。
* 如果您使用 `-opt-in` 編譯器選項，請檢查 [KGP API 參考](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/) 中是否已有專門的 DSL 可供使用，並改用該 DSL。
* 將任何 `-progressive` 編譯器選項的使用遷移至專用的 DSL：`progressiveMode.set(true)`。
* 將任何 `-Xjvm-default` 編譯器選項的使用遷移至 [使用專用 DSL](gradle-compiler-options.md#attributes-specific-to-jvm)：`jvmDefault.set()`。使用以下選項對應：

  | 之前 | 之後 |
  |---|---|
  | `-Xjvm-default=all-compatibility` | `jvmDefault.set(JvmDefaultMode.ENABLE)` |
  | `-Xjvm-default=all` | `jvmDefault.set(JvmDefaultMode.NO_COMPATIBILITY)` | 
  | `-Xjvm-default=disable` | `jvmDefault.set(JvmDefaultMode.DISABLE)` |

例如，如果您原本有：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlinOptions {
    freeCompilerArgs += "-opt-in=kotlin.RequiresOptIn"
    freeCompilerArgs += listOf("-Xcontext-receivers", "-Xinline-classes", "-progressive", "-Xjvm-default=all")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```kotlin
kotlinOptions {
    freeCompilerArgs += "-opt-in=kotlin.RequiresOptIn"
    freeCompilerArgs += ["-Xcontext-receivers", "-Xinline-classes", "-progressive", "-Xjvm-default=all"]
}
```

</tab>
</tabs>

遷移至：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    compilerOptions {
        optIn.add("kotlin.RequiresOptIn")
        freeCompilerArgs.addAll(listOf("-Xcontext-receivers", "-Xinline-classes"))
        progressiveMode.set(true)
        jvmDefault.set(JvmDefaultMode.NO_COMPATIBILITY)
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```kotlin
kotlin {
    compilerOptions {
        optIn.add("kotlin.RequiresOptIn")
        freeCompilerArgs.addAll(["-Xcontext-receivers", "-Xinline-classes"])
        progressiveMode.set(true)
        jvmDefault.set(JvmDefaultMode.NO_COMPATIBILITY)
    }
}
```

</tab>
</tabs>

## 目標為 JVM {id="target-the-jvm"}

[如前所述](#how-to-define-options)，您可以在擴充、目標和編譯單元層級（任務）為您的 JVM/Android 專案定義編譯器選項。

預設的 JVM 編譯任務對於生產程式碼稱為 `compileKotlin`，對於測試程式碼稱為 `compileTestKotlin`。自訂原始碼集的任務則根據其 `compile<Name>Kotlin` 模式命名。

您可以透過在終端機執行 `gradlew tasks --all` 指令，並在 `Other tasks` 組中搜尋 `compile*Kotlin` 任務名稱，來查看 Android 編譯任務清單。

一些需要注意的重要細節：

* `kotlin.compilerOptions` 會配置專案中的每個 Kotlin 編譯任務。
* 您可以使用 `tasks.named<KotlinJvmCompile>("compileKotlin") { }`（或 `tasks.withType<KotlinJvmCompile>().configureEach { }`）方法來覆蓋由 `kotlin.compilerOptions` DSL 套用的配置。

## 目標為 JavaScript {id="target-javascript"}

JavaScript 編譯任務對於生產程式碼稱為 `compileKotlinJs`，對於測試程式碼稱為 `compileTestKotlinJs`，對於自訂原始碼集則稱為 `compile<Name>KotlinJs`。

若要配置單一任務，請使用其名稱：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

val compileKotlin: KotlinCompilationTask<*> by tasks

compileKotlin.compilerOptions.suppressWarnings.set(true)
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

tasks.named('compileKotlin', KotlinCompilationTask) {
    compilerOptions {
        suppressWarnings = true
    }
}
```

</tab>
</tabs>

請注意，在使用 Gradle Kotlin DSL 時，您應該先從專案的 `tasks` 中獲取任務。

請分別為 JS 和通用目標使用 `Kotlin2JsCompile` 和 `KotlinCompileCommon` 類型。

您可以透過在終端機執行 `gradlew tasks --all` 指令，並在 `Other tasks` 組中搜尋 `compile*KotlinJS` 任務名稱，來查看 JavaScript 編譯任務清單。

## 所有 Kotlin 編譯任務 {id="all-kotlin-compilation-tasks"}

也可以配置專案中所有的 Kotlin 編譯任務：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

tasks.named<KotlinCompilationTask<*>>("compileKotlin").configure {
    compilerOptions { /*...*/ }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

tasks.named('compileKotlin', KotlinCompilationTask) {
    compilerOptions { /*...*/ }
}
```

</tab>
</tabs>

## 所有編譯器選項 {id="all-compiler-options"}

以下是 Gradle 編譯器的完整選項列表：

### 常用屬性 {id="common-attributes"}

| 名稱 | 描述 | 可能的值 | 預設值 |
|---|---|---|---|
| `optIn` | 用於配置 [加入編譯器引數](opt-in-requirements.md) 列表的屬性 | `listOf( /* opt-ins */ )` | `emptyList()` |
| `progressiveMode` | 啟用 [漸進式編譯器模式](whatsnew13.md#progressive-mode) | `true`, `false` | `false` |
| `extraWarnings` | 如果為 true，則啟用 [額外的宣告、運算式和型別編譯器檢查](whatsnew21.md#extra-compiler-checks)，這些檢查會發出警告 | `true`, `false` | `false` |

### JVM 特定屬性 {id="attributes-specific-to-jvm"}

| 名稱 | 描述 | 可能的值 | 預設值 |
|---|---|---|---|
| `javaParameters` | 為方法參數上的 Java 1.8 反射產生元資料 | | false |
| `jvmTarget` | 產生的 JVM 位元組碼的目標版本 | "1.8", "9", "10", ..., "25", 26"。另請參閱 [編譯器選項的類型](#types-for-compiler-options) | "%defaultJvmTargetVersion%" |
| `noJdk` | 不要自動將 Java 執行階段包含到類別路徑中 | | false |
| `jvmTargetValidationMode` | <list><li>驗證 Kotlin 與 Java 之間的 [JVM 目標相容性](gradle-configure-project.md#check-for-jvm-target-compatibility-of-related-compile-tasks)</li><li>`KotlinCompile` 類型任務的屬性。</li></list> | `WARNING`, `ERROR`, `IGNORE` | `ERROR` |
| `jvmDefault` | 控制如何將介面中宣告的函式編譯為 JVM 上的預設方法 | `ENABLE`, `NO_COMPATIBILITY`, `DISABLE` | `ENABLE` |

### JVM 和 JavaScript 共有屬性 {id="attributes-common-to-jvm-and-javascript"}

| 名稱 | 描述 | 可能的值 | 預設值 |
|---|---|---|---|
| `allWarningsAsErrors` | 如果有任何警告，則回報錯誤 | | false |
| `suppressWarnings` | 不要產生警告 | | false |
| `verbose` | 啟用詳細的記錄輸出。僅在 [啟用 Gradle 偵錯記錄層級](https://docs.gradle.org/current/userguide/logging.html) 時有效 | | false |
| `freeCompilerArgs` | 額外編譯器引數的列表。您也可以在此處使用實驗性的 `-X` 引數。請參閱 [範例](#example-of-additional-arguments-usage-via-freecompilerargs) | | [] |
| `apiVersion` | 控制您的程式碼可以使用哪些 Kotlin API。如需更多資訊，請參閱 [`-api-version`](compiler-reference.md#api-version-version)。 | "2.0", "2.1", "2.2", "2.3", "2.4", "2.5" (實驗性) | |
| `languageVersion` | 控制編譯期間可使用哪些 Kotlin 語言功能與語法。如需更多資訊，請參閱 [`-language-version`](compiler-reference.md#language-version-version)。 | "2.0", "2.1", "2.2", "2.3", "2.4", "2.5" (實驗性) | |

> 我們將在未來的版本中棄用 `freeCompilerArgs` 屬性。如果您在 Kotlin Gradle DSL 中缺少某些選項，請[提交問題 (Issue)](https://youtrack.jetbrains.com/newissue?project=kt)。
>
{style="warning"}

#### 透過 freeCompilerArgs 使用額外引數的範例 {initial-collapse-state="collapsed" collapsible="true" id="example-of-additional-arguments-usage-via-freecompilerargs"}

使用 `freeCompilerArgs` 屬性提供額外的（包括實驗性的）編譯器引數。
您可以向此屬性新增單個引數或引數列表：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

kotlin {
    compilerOptions {
        // 指定 Kotlin API 版本和 JVM 目標
        apiVersion.set(KotlinVersion.%gradleLanguageVersion%)
        jvmTarget.set(JvmTarget.JVM_1_8)
        
        // 單個實驗性引數
        freeCompilerArgs.add("-Xexport-kdoc")

        // 單個額外引數
        freeCompilerArgs.add("-Xno-param-assertions")

        // 引數列表
        freeCompilerArgs.addAll(
            listOf(
                "-Xno-receiver-assertions",
                "-Xno-call-assertions"
            )
        ) 
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

tasks.named('compileKotlin', KotlinCompilationTask) {
    compilerOptions {
        // 指定 Kotlin API 版本和 JVM 目標
        apiVersion = KotlinVersion.%gradleLanguageVersion%
        jvmTarget = JvmTarget.JVM_1_8
        
        // 單個實驗性引數
        freeCompilerArgs.add("-Xexport-kdoc")
        
        // 單個額外引數，可以是鍵值對
        freeCompilerArgs.add("-Xno-param-assertions")
        
        // 引數列表
        freeCompilerArgs.addAll(["-Xno-receiver-assertions", "-Xno-call-assertions"])
    }
}
```

</tab>
</tabs>

> `freeCompilerArgs` 屬性可在 [擴充](#extension-level)、[目標](#target-level) 和 [編譯單元（任務）](#compilation-unit-level) 層級使用。
>
{style="tip"} 

#### 設定 languageVersion 的範例 {initial-collapse-state="collapsed" collapsible="true" id="example-of-setting-languageversion"}

若要設定語言版本，請使用以下語法：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    compilerOptions {
        languageVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.%gradleLanguageVersion%)
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
tasks
    .withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask.class)
    .configureEach {
        compilerOptions.languageVersion =
            org.jetbrains.kotlin.gradle.dsl.KotlinVersion.%gradleLanguageVersion%
    }
```

</tab>
</tabs>

另請參閱 [編譯器選項的類型](#types-for-compiler-options)。

### JavaScript 特定屬性 {id="attributes-specific-to-javascript"}

| 名稱 | 描述 | 可能的值 | 預設值 |
|---|---|---|---|
| `friendModulesDisabled` | 停用內部宣告匯出 | | `false` |
| `main` | 指定執行時是否應呼叫 `main` 函式 | `JsMainFunctionExecutionMode.CALL`, `JsMainFunctionExecutionMode.NO_CALL` | `JsMainFunctionExecutionMode.CALL` |
| `moduleKind` | 編譯器產生的 JS 模組類型 | `JsModuleKind.MODULE_AMD`, `JsModuleKind.MODULE_PLAIN`, `JsModuleKind.MODULE_ES`, `JsModuleKind.MODULE_COMMONJS`, `JsModuleKind.MODULE_UMD` | `null` |
| `sourceMap` | 產生原始碼對應檔 | | `false` |
| `sourceMapEmbedSources` | 將原始碼檔案嵌入原始碼對應檔中 | `JsSourceMapEmbedMode.SOURCE_MAP_SOURCE_CONTENT_INLINING`, `JsSourceMapEmbedMode.SOURCE_MAP_SOURCE_CONTENT_NEVER`, `JsSourceMapEmbedMode.SOURCE_MAP_SOURCE_CONTENT_ALWAYS` | `null` |
| `sourceMapNamesPolicy` | 將您在 Kotlin 程式碼中宣告的變數和函式名稱新增到原始碼對應檔中。如需關於此行為的更多資訊，請參閱我們的 [編譯器參考](compiler-reference.md#source-map-names-policy-simple-names-fully-qualified-names-no) | `JsSourceMapNamesPolicy.SOURCE_MAP_NAMES_POLICY_FQ_NAMES`, `JsSourceMapNamesPolicy.SOURCE_MAP_NAMES_POLICY_SIMPLE_NAMES`, `JsSourceMapNamesPolicy.SOURCE_MAP_NAMES_POLICY_NO` | `null` |
| `sourceMapPrefix` | 向原始碼對應檔中的路徑新增指定的前綴 | | `null` |
| `target` | 為特定的 ECMA 版本產生 JS 檔案 | `"es5"`, `"es2015"`, `"es2020"` | `"es5"` |
| `useEsClasses` | 讓產生的 JavaScript 程式碼使用 ES2015 類別。在使用 ES2015 與 ES2020 目標的情況下預設啟用 | | `null` |

### 編譯器選項的類型 {id="types-for-compiler-options"}

部分 `compilerOptions` 使用新型別而非 `String` 型別：

| 選項 | 型別 | 範例 |
|---|---|---|
| `jvmTarget` | [`JvmTarget`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JvmTarget.kt) | `compilerOptions.jvmTarget.set(JvmTarget.JVM_11)` |
| `apiVersion` 和 `languageVersion` | [`KotlinVersion`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/KotlinVersion.kt) | `compilerOptions.languageVersion.set(KotlinVersion.%gradleLanguageVersion%)` |
| `main` | [`JsMainFunctionExecutionMode`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JsMainFunctionExecutionMode.kt) | `compilerOptions.main.set(JsMainFunctionExecutionMode.NO_CALL)` |
| `moduleKind` | [`JsModuleKind`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JsModuleKind.kt) | `compilerOptions.moduleKind.set(JsModuleKind.MODULE_ES)` |
| `sourceMapEmbedSources` | [`JsSourceMapEmbedMode`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JsSourceMapEmbedMode.kt) | `compilerOptions.sourceMapEmbedSources.set(JsSourceMapEmbedMode.SOURCE_MAP_SOURCE_CONTENT_INLINING)` |
| `sourceMapNamesPolicy` | [`JsSourceMapNamesPolicy`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JsSourceMapNamesPolicy.kt) | `compilerOptions.sourceMapNamesPolicy.set(JsSourceMapNamesPolicy.SOURCE_MAP_NAMES_POLICY_FQ_NAMES)` |

## 接下來做什麼？ {id="what-s-next"}

進一步了解：
* [Kotlin Multiplatform DSL 參考](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html)。
* [增量編譯、快取支援、建置報告和 Kotlin 精靈進程](gradle-compilation-and-caches.md)。
* [Gradle 基礎知識與細節](https://docs.gradle.org/current/userguide/userguide.html)。
* [支援 Gradle 外掛程式變體](gradle-plugin-variants.md)。