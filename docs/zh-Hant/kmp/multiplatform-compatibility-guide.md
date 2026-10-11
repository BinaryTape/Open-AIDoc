[//]: # (title: Kotlin Multiplatform 相容性指南)

<show-structure depth="1"/>

本指南彙總了在開發 Kotlin Multiplatform 專案時可能遇到的[不相容變更](https://kotlinlang.org/docs/kotlin-evolution-principles.html#incompatible-changes)。

> 關於 Compose Multiplatform 的資訊，
> 請參閱 [Compose Multiplatform 新功能](https://kotlinlang.org/docs/multiplatform/whats-new-compose.html)
> 以及 [Kotlin 與 Jetpack 相容性](compose-compatibility-and-versioning.md)頁面。
> 
{style="note"}

目前的 Kotlin 穩定版本 (Stable) 為 %kotlinVersion%。請注意特定變更相對於您專案中所使用 Kotlin 版本的棄用週期，例如：

* 從 Kotlin 1.7.0 升級至 Kotlin 1.9.0 時，請檢查在 [Kotlin 1.9.0](#kotlin-1-9-0-1-9-25) 與 [Kotlin 1.7.0−1.8.22](#kotlin-1-7-0-1-8-22) 中生效的不相容變更。
* 從 Kotlin 1.9.0 升級至 Kotlin 2.0.0 時，請檢查在 [Kotlin 2.0.0](#kotlin-2-0-0-and-later) 與 [Kotlin 1.9.0−1.9.25](#kotlin-1-9-0-1-9-25) 中生效的不相容變更。 

## 版本相容性 {id="version-compatibility"}

設定專案時，請檢查特定版本的 Kotlin Multiplatform Gradle 外掛程式（與專案中的 Kotlin 版本相同）與 Gradle、Xcode 以及 Android Gradle 外掛程式版本的相容性：

| Kotlin Multiplatform 外掛程式版本 | Gradle                                | Android Gradle 外掛程式                               | Xcode   |
|-------------------------------------|---------------------------------------|-----------------------------------------------------|---------|
| 2.4.20–2.4.21                              | %minGradleVersion%–%maxGradleVersion% | %minAndroidGradleVersion%–%maxAndroidGradleVersion% | %xcode% |
| 2.4.0–2.4.10                        | 7.6.3–9.5.0                           | 8.5.2–9.1.0                                         | 26.4    |
| 2.3.20–2.3.21                       | 7.6.3–9.3.0                           | 8.2.2–9.0.0                                         | 26.0    |
| 2.3.10                              | 7.6.3–9.0.0                           | 8.2.2–9.0.0                                         | 26.0    |
| 2.3.0                               | 7.6.3–9.0.0                           | 8.2.2–8.13.0                                        | 26.0    |
| 2.2.21                              | 7.6.3–8.14                            | 7.3.1–8.11.1                                        | 26.0    |
| 2.2.20                              | 7.6.3–8.14                            | 7.3.1–8.11.1                                        | 16.4    |
| 2.2.0–2.2.10                        | 7.6.3–8.14                            | 7.3.1–8.10.0                                        | 16.3    |
| 2.1.21                              | 7.6.3–8.12.1                          | 7.3.1–8.7.2                                         | 16.3    |
| 2.1.20                              | 7.6.3–8.11                            | 7.4.2–8.7.2                                         | 16.0    |
| 2.1.0–2.1.10                        | 7.6.3–8.10*                           | 7.4.2–8.7.2                                         | 16.0    |
| 2.0.21                              | 7.5–8.8*                              | 7.4.2–8.5                                           | 16.0    |
| 2.0.20                              | 7.5–8.8*                              | 7.4.2–8.5                                           | 15.3    |
| 2.0.0                               | 7.5–8.5                               | 7.4.2–8.3                                           | 15.3    |
| 1.9.20                              | 7.5–8.1.1                             | 7.4.2–8.2                                           | 15.0    |

> *Kotlin 2.0.20–2.0.21 與 Kotlin 2.1.0–2.1.10 完全相容於最高至 8.6 的 Gradle 版本。
> 也支援 Gradle 8.7–8.10 版本，但僅有一個例外：如果您使用 Kotlin Multiplatform Gradle 外掛程式，
> 在多平台專案中的 JVM 目標呼叫 `withJava()` 函式時可能會看到棄用警告。
> 如需更多資訊，請參閱[預設建立 Java 原始碼集](#java-source-sets-created-by-default)。
>
{style="warning"}

## Kotlin 2.0.0 及更新版本 {id="kotlin-2-0-0-and-later"}

本節介紹在 Kotlin 2.0.0−%kotlinVersion% 中結束棄用週期並生效的不相容變更。

<a id="android-target-rename"></a>
### 遷移至 Google 適用於 Android 目標的外掛程式 {id="migrate-to-google-s-plugin-for-android-targets"}

**變更了什麼？**

在 Kotlin 2.3.0 之前，我們透過 `com.android.application` 與 `com.android.library` 外掛程式提供對 Android 目標的支援。
這是 Google 的 Android 團隊開發專門針對 Kotlin Multiplatform 外掛程式期間的過渡性解決方案。

最初我們使用 `android` 區塊，但後來轉移到了 `androidTarget` 區塊，以便將 `android` 名稱保留給新外掛程式使用。

現在，Android 團隊推出了 [`com.android.kotlin.multiplatform.library` 外掛程式](https://developer.android.com/kotlin/multiplatform/plugin)，您可以將其與原始的 `android` 區塊一起使用。

Kotlin 2.3.0 在 Kotlin Multiplatform 專案中使用 `androidTarget` 名稱時會發出棄用警告。如果您需要更多時間遷移到 `android` 區塊，請使用帶有 AGP 8.x 的 Kotlin 2.3.10，此版本中不會出現該警告。

**現在的最佳實務是什麼？**

遷移至新的 `com.android.kotlin.multiplatform.library` 外掛程式。將所有出現的 `androidTarget` 區塊重新命名為 `android`。
有關如何遷移的詳細說明，請參閱 Google 的[遷移指南](https://developer.android.com/kotlin/multiplatform/plugin#migrate)。

**變更何時生效？**

以下是 Kotlin Multiplatform Gradle 外掛程式的棄用週期：

* 1.9.0：在 Kotlin Multiplatform 專案中使用 `android` 名稱時發出棄用警告
* 2.1.0：將此警告提升為錯誤
* 2.2.0：從 Kotlin Multiplatform Gradle 外掛程式中移除 `android` 目標 DSL
* 2.3.0：新的 Android 外掛程式推出；在 Kotlin Multiplatform 專案中使用 `androidTarget` 名稱時發出棄用警告。
* 2.3.10：還原在 Kotlin Multiplatform 專案中使用 `androidTarget` 名稱時的棄用警告。

### 棄用 Bitcode 嵌入 {id="deprecated-bitcode-embedding"}

**變更了什麼？**

Bitcode 嵌入在 Xcode 14 中已被棄用，並在 Xcode 15 中針對所有 Apple 目標移除。相應地，framework 配置的 `embedBitcode` 參數，以及 `-Xembed-bitcode` 和 `-Xembed-bitcode-marker` 命令列引數在 Kotlin 中已被棄用。

**現在的最佳實務是什麼？**

如果您仍在使用較舊版本的 Xcode，但希望升級至 Kotlin 2.0.20 或更新版本，請在 Xcode 專案中停用 bitcode 嵌入。

**變更何時生效？**

以下是計畫的棄用週期：

* 2.0.20：Kotlin/Native 編譯器不再支援 bitcode 嵌入
* 2.1.0：Kotlin Multiplatform Gradle 外掛程式中的 `embedBitcode` DSL 被棄用並伴隨警告
* 2.2.0：該警告提升為錯誤
* 2.3.0：移除 `embedBitcode` DSL 

<a id="java-source-set-created-by-default"></a>
### 預設建立 Java 原始碼集 {id="java-source-sets-created-by-default"}

**變更了什麼？**

為了使 Kotlin Multiplatform 與 Gradle 即將推出的變更保持一致，我們正在逐步淘汰 `withJava()` 函式。`withJava()` 函式透過建立必要的 Java 原始碼集來實現與 Gradle Java 外掛程式的整合。從 Kotlin 2.1.20 開始，這些 Java 原始碼集已預設建立。

**現在的最佳實務是什麼？**

先前，您必須明確使用 `withJava()` 函式來建立 `src/jvmMain/java` 與 `src/jvmTest/java` 原始碼集：

```kotlin
kotlin {
    jvm {
        withJava()
    }
}
``` 

從 Kotlin 2.1.20 開始，您可以從建置指令碼中移除 `withJava()` 函式。

此外，Gradle 現在僅在存在 Java 原始碼時才執行 Java 編譯任務，這會觸發先前未執行的 JVM 驗證診斷。如果您在 `KotlinJvmCompile` 任務中或在 `compilerOptions` 內部明確設定了不相容的 JVM 目標，此診斷將會失敗。有關確保 JVM 目標相容性的指引，請參閱[檢查相關編譯任務的 JVM 目標相容性](https://kotlinlang.org/docs/gradle-configure-project.html#check-for-jvm-target-compatibility-of-related-compile-tasks)。

如果您的專案使用高於 8.7 的 Gradle 版本，且不依賴 Gradle Java 外掛程式（如 [Java](https://docs.gradle.org/current/userguide/java_plugin.html)、[Java Library](https://docs.gradle.org/current/userguide/java_library_plugin.html) 或 [Application](https://docs.gradle.org/current/userguide/application_plugin.html)），或者不依賴相依於 Gradle Java 外掛程式的第三方 Gradle 外掛程式，您可以移除 `withJava()` 函式。

如果您的專案使用 [Application](https://docs.gradle.org/current/userguide/application_plugin.html) Gradle Java 外掛程式，我們建議遷移至[新的實驗性 DSL](https://kotlinlang.org/docs/whatsnew2120.html#kotlin-multiplatform-new-dsl-to-replace-gradle-s-application-plugin)。從 Gradle 8.7 開始，Application 外掛程式將無法再與 Kotlin Multiplatform Gradle 外掛程式一起運作。

如果您想在多平台專案中同時使用 Kotlin Multiplatform Gradle 外掛程式與其他適用於 Java 的 Gradle 外掛程式，請參閱[棄用 Kotlin Multiplatform Gradle 外掛程式與 Java 外掛程式的相容性](multiplatform-compatibility-guide.md#deprecated-compatibility-with-kotlin-multiplatform-gradle-plugin-and-gradle-java-plugins)。

如果您在 Kotlin 2.1.20 和高於 8.7 的 Gradle 版本中使用 [Java test fixtures](https://docs.gradle.org/current/userguide/java_testing.html#sec:java_test_fixtures) Gradle 外掛程式，該外掛程式將無法運作。請改為升級至已解決此問題的 [Kotlin 2.1.21](https://kotlinlang.org/docs/releases.html#release-details)。

如果遇到任何問題，請在我們的[問題追蹤器](https://kotl.in/issue)中回報，或在我們的[公開 Slack 頻道](https://kotlinlang.slack.com/archives/C19FD9681)中尋求協助。

**變更何時生效？**

以下是計畫的棄用週期：

* Gradle >8.6：針對使用 `withJava()` 函式的多平台專案中任何舊版 Kotlin 發出棄用警告。
* Gradle 9.0：將此警告提升為錯誤。
* 2.1.20：在與任何版本的 Gradle 一起使用 `withJava()` 函式時發出棄用警告。

<a id="declaring-multiple-targets"></a>
### 宣告多個相似目標 {id="declaring-several-similar-targets"}

**變更了什麼？**

我們不建議在單個 Gradle 專案中宣告多個相似目標。例如：

```kotlin
kotlin {
    jvm("jvmKtor")
    jvm("jvmOkHttp") // 不建議這樣做，且會產生棄用警告
}
```

一個常見的情況是將兩個相關的程式碼片段放在一起。例如，您可能希望在 `:shared` Gradle 專案中使用 `jvm("jvmKtor")` 和 `jvm("jvmOkHttp")`，以使用 Ktor 或 OkHttp 程式庫實作網路功能：

```kotlin
// shared/build.gradle.kts:
kotlin {
    jvm("jvmKtor") {
        attributes.attribute(/* ... */)
    }
    jvm("jvmOkHttp") {
        attributes.attribute(/* ... */)
    }

    sourceSets {
        val commonMain by getting
        val commonJvmMain by sourceSets.creating {
            dependsOn(commonMain)
            dependencies {
                // Shared dependencies
            }
        }
        val jvmKtorMain by getting {
            dependsOn(commonJvmMain)
            dependencies {
                // Ktor dependencies
            }
        }
        val jvmOkHttpMain by getting {
            dependsOn(commonJvmMain)
            dependencies {
                // OkHttp dependencies
            }
        }
    }
}
```

這種實作帶來了不小的配置複雜度：

* 您必須在 `:shared` 端和每個取用端設定 Gradle 屬性。否則，Gradle 無法解析此類專案中的相依性，因為如果沒有額外資訊，就無法確定取用端應該接收基於 Ktor 的實作還是基於 OkHttp 的實作。
* 您必須手動設定 `commonJvmMain` 原始碼集。
* 該配置涉及大量低階的 Gradle 和 Kotlin Gradle 外掛程式抽象及 API。

**現在的最佳實務是什麼？**

配置之所以複雜，是因為基於 Ktor 和基於 OkHttp 的實作位於_同一個 Gradle 專案中_。在許多情況下，可以將這些部分提取到單獨的 Gradle 專案中。以下是此類重構的大致步驟：

1. 將原始專案中的兩個重複目標替換為單個目標。如果您在這些目標之間有共用的原始碼集，請將其原始碼和配置移至新建立目標的預設原始碼集中：

    ```kotlin
    // shared/build.gradle.kts:
    kotlin {
        jvm()
        
        sourceSets {
            jvmMain {
                // 將 jvmCommonMain 的配置複製到此處
            }
        }
    }
    ```

2. 新增兩個新的 Gradle 專案，通常是透過在 `settings.gradle.kts` 檔案中呼叫 `include` 來完成。例如：

    ```kotlin
    include(":okhttp-impl")
    include(":ktor-impl")
    ```

3. 配置每個新的 Gradle 專案：

    * 大多數情況下，您不需要套用 `kotlin("multiplatform")` 外掛程式，因為這些專案僅編譯為一個目標。在此範例中，您可以套用 `kotlin("jvm")`。
    * 將原始特定於目標的原始碼集內容移至其各自的專案中，例如從 `jvmKtorMain` 移至 `ktor-impl/src`。
    * 複製原始碼集的配置：相依性、編譯器選項等等。
    * 新增從新 Gradle 專案到原始專案的相依性。

    ```kotlin
    // ktor-impl/build.gradle.kts:
    plugins {
        kotlin("jvm")
    }
    
    dependencies {
        project(":shared") // 新增對原始專案的相依性
        // 將 jvmKtorMain 的相依性複製到此處
    }
    
    kotlin {
        compilerOptions {
            // 將 jvmKtorMain 的編譯器選項複製到此處
        }
    }
    ```

雖然這種方法在初始設定時需要更多工作，但它不使用 Gradle 和 Kotlin Gradle 外掛程式的任何低階實體，從而使得產生的組建更容易使用與維護。

> 很遺憾，我們無法為每種情況提供詳細的遷移步驟。如果上述說明不適用於您的情況，請在此 [YouTrack 問題](https://youtrack.jetbrains.com/issue/KT-59316)中描述您的使用案例。
>
{style="tip"}

**變更何時生效？**

以下是計畫的棄用週期：

* 1.9.20：在 Kotlin Multiplatform 專案中使用多個相似目標時發出棄用警告
* 2.1.0：在此類情況下回報錯誤，但 Kotlin/JS 目標除外；若要進一步了解此例外情況，請參閱 [YouTrack](https://youtrack.jetbrains.com/issue/KT-47038/KJS-MPP-Split-JS-target-into-JsBrowser-and-JsNode) 中的問題

<a id="deprecate-pre-hmpp-dependencies"></a>
### 棄用對舊版模式發佈的多平台程式庫的支援 {id="deprecated-support-of-multiplatform-libraries-published-in-legacy-mode"}

**變更了什麼？**

先前，我們已經在 Kotlin Multiplatform 專案中[棄用了舊版模式](#deprecated-gradle-properties-for-hierarchical-structure-support)，以防止發佈「舊版」二進位檔案，並鼓勵您將專案遷移至[階層結構](multiplatform-hierarchy.md)。

為了繼續從生態系統中淘汰「舊版」二進位檔案，從 Kotlin 1.9.0 開始，也不建議使用舊版程式庫。如果您的專案使用了對舊版程式庫的相依性，您將會看到以下警告：

```none
The dependency group:artifact:1.0 was published in the legacy mode. Support for such dependencies will be removed in the future
```

**現在的最佳實務是什麼？**

_如果您使用多平台程式庫_，其中大多數已經遷移到「階層結構」模式，因此您只需更新程式庫版本即可。詳情請參閱各程式庫的文件。

如果該程式庫尚不支援非舊版二進位檔案，您可以聯絡維護人員並告知他們此相容性問題。

_如果您是程式庫作者_，請將 Kotlin Gradle 外掛程式更新至最新版本，並確保您已修正[已棄用的 Gradle 屬性](#deprecated-gradle-properties-for-hierarchical-structure-support)。

Kotlin 團隊非常樂意協助生態系統進行遷移，因此如果您遇到任何問題，請隨時在 [YouTrack 中建立問題](https://kotl.in/issue)。

**變更何時生效？**

以下是計畫的棄用週期：

* 1.9.0：針對舊版程式庫的相依性發出棄用警告
* 2.0.0：將針對舊版程式庫相依性的警告提升為錯誤
* &gt;2.0.0：移除對舊版程式庫相依性的支援；使用此類相依性可能會導致組建失敗

<a id="deprecate-hmpp-properties"></a>
### 棄用支援階層結構的 Gradle 屬性 {id="deprecated-gradle-properties-for-hierarchical-structure-support"}

**變更了什麼？**

在整個發展過程中，Kotlin 逐漸在多平台專案中引入了對[階層結構](multiplatform-hierarchy.md)的支援，即在通用原始碼集 `commonMain` 與任何特定於平台的原始碼集（例如 `jvmMain`）之間擁有中繼原始碼集的能力。

在過渡期間，由於工具鏈不夠穩定，因此引入了幾個 Gradle 屬性，允許進行精細的選擇加入 (opt-in) 和退出 (opt-out)。

自 Kotlin 1.6.20 起，階層專案結構支援已預設啟用。但是，保留這些屬性是為了在出現阻礙性問題時可以選擇退出。在處理完所有回饋後，我們現在開始完全淘汰這些屬性。

以下屬性現已棄用：

* `kotlin.internal.mpp.hierarchicalStructureByDefault`
* `kotlin.mpp.enableCompatibilityMetadataVariant`
* `kotlin.mpp.hierarchicalStructureSupport`
* `kotlin.mpp.enableGranularSourceSetsMetadata`
* `kotlin.native.enableDependencyPropagation`

**現在的最佳實務是什麼？**

* 從您的 `gradle.properties` 和 `local.properties` 檔案中移除這些屬性。
* 避免在 Gradle 建置指令碼或您的 Gradle 外掛程式中以程式設計方式設定它們。
* 如果組建中使用的某些第三方 Gradle 外掛程式設定了已棄用的屬性，請要求外掛程式維護人員不要設定這些屬性。

由於自 Kotlin 1.6.20 起，Kotlin 工具鏈的預設行為已不再包含此類屬性，因此我們預計不會產生任何嚴重影響。大多數結果將在重建專案後立即顯現。

如果您是程式庫作者並且希望格外安全，請檢查取用端是否可以使用您的程式庫。

**變更何時生效？**

以下是計畫的棄用週期：

* 1.8.20：使用已棄用的 Gradle 屬性時回報警告
* 1.9.20：將此警告提升為錯誤
* 2.0.0：移除已棄用的屬性；Kotlin Gradle 外掛程式會忽略它們的使用

如果在移除這些屬性後遇到問題（這種情況極少發生），請在 [YouTrack 中建立問題](https://kotl.in/issue)。

<a id="target-presets-deprecation"></a>
### 棄用目標預設 API {id="deprecated-target-presets-api"}

**變更了什麼？**

在非常早期的開發階段，Kotlin Multiplatform 引入了用於處理所謂_目標預設 (target presets)_ 的 API。每個目標預設本質上代表了 Kotlin Multiplatform 目標的工廠。這個 API 後來被證明很大程度上是多餘的，因為像 `jvm()` 或 `iosSimulatorArm64()` 這樣的 DSL 函式涵蓋了相同的使用案例，同時更加直觀且簡潔。

為了減少混淆並提供更清晰的指導方針，Kotlin Gradle 外掛程式的公開 API 中現在已棄用所有與預設相關的 API。這包括：

* `org.jetbrains.kotlin.gradle.dsl.KotlinMultiplatformExtension` 中的 `presets` 屬性
* `org.jetbrains.kotlin.gradle.plugin.KotlinTargetPreset` 介面及其所有繼承者
* `fromPreset` 多載

**現在的最佳實務是什麼？**

改為使用相應的 [Kotlin 目標](multiplatform-dsl-reference.md#targets)，例如：

<table>
    
<tr>
<td>之前</td>
        <td>現在</td>
</tr>

    
<tr>
<td>
<code-block lang="kotlin" code="kotlin {&#10;    targets {&#10;        fromPreset(presets.iosArm64, 'ios')&#10;    }&#10;}"/>
</td>
<td>
<code-block lang="kotlin" code="kotlin {&#10;    iosArm64()&#10;}"/>
</td>
</tr>

</table>

**變更何時生效？**

以下是計畫的棄用週期：

* 1.9.20：對任何使用預設相關 API 的行為回報警告
* 2.0.0：將此警告提升為錯誤
* 2.2.0：從 Kotlin Gradle 外掛程式的公開 API 中移除預設相關的 API；仍在使用它的原始碼將因「unresolved reference」錯誤而失敗，二進位檔案（例如 Gradle 外掛程式）可能會因連結錯誤而失敗，除非針對最新版本的 Kotlin Gradle 外掛程式重新編譯

<a id="target-shortcuts-deprecation"></a>
### 棄用 Apple 目標捷徑 {id="deprecated-apple-target-shortcuts"}

**變更了什麼？**

我們正在棄用 Kotlin Multiplatform DSL 中的 `ios()`、`watchos()` 和 `tvos()` 目標捷徑。它們原本設計用於部分建立 Apple 目標的原始碼集階層。然而，實務證明它們難以擴展，且有時令人混淆。

例如，`ios()` 捷徑同時建立了 `iosArm64` 和 `iosX64` 目標，但不包含 `iosSimulatorArm64` 目標，而這在搭載 Apple M 晶片的主機上運作時是必需的。然而，修改此捷徑很難實作，並可能會在現有的使用者專案中引發問題。

**現在的最佳實務是什麼？**

Kotlin Gradle 外掛程式現在提供了內建的階層範本。自 Kotlin 1.9.20 起，它已預設啟用，並包含適用於常見使用案例的預定義中繼原始碼集。

您應該指定目標清單，而不是使用捷徑，然後外掛程式會根據此清單自動設定中繼原始碼集。

例如，如果您的專案中有 `iosArm64` 和 `iosSimulatorArm64` 目標，該外掛程式會自動建立 `iosMain` 和 `iosTest` 中繼原始碼集。如果您有 `iosArm64` 和 `macosArm64` 目標，則會建立 `appleMain` 和 `appleTest` 原始碼集。

如需更多資訊，請參閱[階層專案結構](multiplatform-hierarchy.md)

**變更何時生效？**

以下是計畫的棄用週期：

* 1.9.20：使用 `ios()`、`watchos()` 和 `tvos()` 目標捷徑時回報警告；改為預設啟用預設階層範本
* 2.1.0：使用目標捷徑時回報錯誤
* 2.2.0：從 Kotlin Multiplatform Gradle 外掛程式中移除目標捷徑 DSL

### 升級 Kotlin 後 iOS 架構版本不正確 {id="incorrect-version-of-ios-framework-after-kotlin-upgrade"}

**問題是什麼？**

當使用直接整合時，Kotlin 程式碼的變更可能不會反映在 Xcode 的 iOS 應用程式中。直接整合是透過 `embedAndSignAppleFrameworkForXcode` 任務設定的，該任務將多平台專案中的 iOS 架構連接到 Xcode 中的 iOS 應用程式。

當您在多平台專案中將 Kotlin 版本從 1.9.2x 升級至 2.0.0（或從 2.0.0 降級至 1.9.2x）時，可能會發生這種情況，接著在 Kotlin 檔案中進行修改並嘗試建置應用程式時，Xcode 可能會錯誤地使用舊版的 iOS 架構。因此，這些變更在 Xcode 的 iOS 應用程式中將不可見。

**因應措施是什麼？**

1. 在 Xcode 中，使用 **Product** | **Clean Build Folder** 清理組建目錄。
2. 在終端機中，執行以下指令：

   ```none
   ./gradlew clean
   ```

3. 再次建置應用程式，以確保使用新版本的 iOS 架構。

**此問題何時會解決？**

我們計畫在 Kotlin 2.0.10 中修正此問題。您可以在[參與 Kotlin 早期體驗計畫](https://kotlinlang.org/docs/eap.html)部分檢查 Kotlin 2.0.10 的任何預覽版本是否已可用。

如需更多資訊，請參閱 [YouTrack 中的對應問題](https://youtrack.jetbrains.com/issue/KT-68257)。

## Kotlin 1.9.0−1.9.25 {id="kotlin-1-9-0-1-9-25"}

本節介紹在 Kotlin 1.9.0−1.9.25 中結束棄用週期並生效的不相容變更。

<a id="compilation-source-deprecation"></a>
### 移除了將 Kotlin 原始碼集直接新增到 Kotlin 編譯的 API {initial-collapse-state="collapsed" collapsible="true" id="removed-api-for-adding-kotlin-source-sets-directly-to-the-kotlin-compilation"}

**變更了什麼？**

對 `KotlinCompilation.source` 的存取已被移除。不再支援如下程式碼：

```kotlin
kotlin {
    jvm()
    js()
    iosArm64()
    iosSimulatorArm64()
    
    sourceSets {
        val commonMain by getting
        val myCustomIntermediateSourceSet by creating {
            dependsOn(commonMain)
        }
        
        targets["jvm"].compilations["main"].source(myCustomIntermediateSourceSet)
    }
}
```

**現在的最佳實務是什麼？**

若要取代 `KotlinCompilation.source(someSourceSet)`，請使用 `.srcDir()` 函式將原始碼直接新增到適當的原始碼集中。或者，您可以透過將 `dependsOn` 關聯從 `KotlinCompilation` 的預設原始碼集新增到 `someSourceSet` 來建立新的原始碼集。您也可以使用對 IDE 友好且被認為是最穩健方法的[原始碼集慣例](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.dsl/-kotlin-multiplatform-source-set-conventions/)來直接參照原始碼。最後，您可以使用在所有情況下都有效的 `KotlinCompilation.defaultSourceSet.dependsOn(someSourceSet)`。

您可以透過以下方式之一變更上述程式碼：

```kotlin
kotlin {
    jvm()
    js()
    iosArm64()
    iosSimulatorArm64()

    sourceSets {
        val myCustomIntermediateSourceSet by creating {
            // 需要使用 .get() 函式存取 commonMain 原始碼集
            dependsOn(commonMain.get())
        }

        // 選項 1. 將您的原始碼直接新增至適當的原始碼集：
        commonMain {
            kotlin.srcDir(layout.projectDirectory.dir("src/commonMain/my-custom-kotlin"))
        }

        // 選項 2. 使用預設 Kotlin Multiplatform 目標為其 main 和 test 
        // 原始碼集提供的慣例：
        jvmMain {
            dependsOn(myCustomIntermediateSourceSet)
        }

        // 選項 3. 更通用的解決方案。如果您的建置指令碼
        // 需要更進階的方法，請使用它：
        targets["jvm"].compilations["main"].defaultSourceSet.dependsOn(myCustomIntermediateSourceSet)
    }
}
```

**變更何時生效？**

以下是棄用週期：

* 1.9.0：在使用 `KotlinCompilation.source` 時發出棄用警告
* 1.9.20：將此警告提升為錯誤
* 2.3.0：從 Kotlin Gradle 外掛程式中移除 `KotlinCompilation.source`，嘗試使用它會導致在建置指令碼編譯期間出現「unresolved reference」錯誤

<a id="kotlin-js-plugin-deprecation"></a>
### 從 `kotlin-js` Gradle 外掛程式遷移至 `kotlin-multiplatform` Gradle 外掛程式 {initial-collapse-state="collapsed" collapsible="true" id="migration-from-kotlin-js-gradle-plugin-to-kotlin-multiplatform-gradle-plugin"}

**變更了什麼？**

從 Kotlin 1.9.0 開始，`kotlin-js` Gradle 外掛程式已被棄用。基本上，它重複了帶有 `js()` 目標的 `kotlin-multiplatform` 外掛程式的功能，並在底層共用相同的實作。這種重疊造成了混淆，並增加了 Kotlin 團隊的維護負擔。我們建議您改為遷移至帶有 `js()` 目標的 `kotlin-multiplatform` Gradle 外掛程式。

**現在的最佳實務是什麼？**

1. 從專案中移除 `kotlin-js` Gradle 外掛程式，如果您使用的是 `pluginManagement {}` 區塊，請在 `settings.gradle.kts` 檔案中套用 `kotlin-multiplatform`：

   <Tabs>
   <TabItem title="kotlin-js">

   ```kotlin
   // settings.gradle.kts:
   pluginManagement {
       plugins {
           // 移除以下這行：
           kotlin("js") version "1.9.0"
       }
       
       repositories {
           // ...
       }
   }
   ```

   </TabItem>
   <TabItem title="kotlin-multiplatform">

   ```kotlin
   // settings.gradle.kts:
   pluginManagement {
       plugins {
           // 改為新增以下這行：
           kotlin("multiplatform") version "1.9.0"
       }
       
       repositories {
           // ...
       }
   }
   ```

   </TabItem>
   </Tabs>

   如果您使用其他方式套用外掛程式，請參閱 [Gradle 文件](https://docs.gradle.org/current/userguide/plugins.html)以獲取遷移說明。

2. 將原始碼檔案從 `main` 和 `test` 資料夾移動到同一目錄下的 `jsMain` 和 `jsTest` 資料夾中。
3. 調整相依性宣告：

   * 我們建議使用 `sourceSets {}` 區塊並配置各原始碼集的相依性，`jsMain {}` 用於生產相依性，`jsTest {}` 用於測試相依性。
     詳情請參閱[新增相依性](multiplatform-add-dependencies.md)。
   * 但是，如果您想在頂層區塊中宣告相依性，請將宣告從 `api("group:artifact:1.0")` 變更為 `add("jsMainApi", "group:artifact:1.0")` 等。

     > 在這種情況下，請確保頂層 `dependencies {}` 區塊位於 `kotlin {}` 區塊**之後**。否則，您將收到「Configuration not found」錯誤。
     >
     {style="note"}

   您可以透過以下方式之一變更 `build.gradle.kts` 檔案中的程式碼：

   <Tabs>
   <TabItem title="kotlin-js">

   ```kotlin
   // build.gradle.kts:
   plugins {
       kotlin("js") version "1.9.0"
   }
   
   dependencies {
       testImplementation(kotlin("test"))
       implementation("org.jetbrains.kotlinx:kotlinx-html:0.8.0")
   }
   
   kotlin {
       js {
           // ...
       }
   }
   ```

   </TabItem>
   <TabItem title="kotlin-multiplatform">

   ```kotlin
   // build.gradle.kts:
   plugins {
       kotlin("multiplatform") version "1.9.0"
   }
   
   kotlin {
       js {
           // ...
       }
       
       // 選項 1. 在 sourceSets {} 區塊中宣告相依性：
       sourceSets {
           val jsMain by getting {
               dependencies {
                   // 這裡不需要 js 前綴，只需從頂層區塊複製貼上即可
                   implementation("org.jetbrains.kotlinx:kotlinx-html:0.8.0")
               }
          }
       }
   }
   
   dependencies {
       // 選項 2. 將 js 前綴新增至相依性宣告：
       add("jsTestImplementation", kotlin("test"))
   }
   ```

   </TabItem>
   </Tabs>

4. 在大多數情況下，Kotlin Gradle 外掛程式在 `kotlin {}` 區塊內提供的 DSL 保持不變。但是，如果您過去曾依名稱參照低階 Gradle 實體（例如任務和配置），您現在需要對其進行調整，通常是透過新增 `js` 前綴。例如，您可以在 `jsBrowserTest` 名稱下找到 `browserTest` 任務。

**變更何時生效？**

以下是 `kotlin-js` Gradle 外掛程式的棄用週期：

* 1.9.0：在使用 `kotlin-js` 外掛程式時發出棄用警告
* 2.4.0：[將警告提升為錯誤](https://youtrack.jetbrains.com/issue/KT-59305)

<a id="jvmWithJava-preset-deprecation"></a>
### 棄用 `jvmWithJava` 預設 {initial-collapse-state="collapsed" collapsible="true" id="deprecated-jvmwithjava-preset"}

**變更了什麼？**

`targetPresets.jvmWithJava` 已被棄用，且不建議使用。

**現在的最佳實務是什麼？**

改為使用 `jvm { withJava() }` 目標。請注意，切換至 `jvm { withJava() }` 後，您需要調整包含 `.java` 原始碼的原始碼目錄路徑。

例如，如果您使用預設名稱為「jvm」的 `jvm` 目標：

| 之前          | 現在                |
|-----------------|--------------------|
| `src/main/java` | `src/jvmMain/java` |
| `src/test/java` | `src/jvmTest/java` |

**變更何時生效？**

以下是計畫的棄用週期：

* 1.3.40：在使用 `targetPresets.jvmWithJava` 時引入警告
* 1.9.20：將此警告提升為錯誤
* &gt;1.9.20：移除 `targetPresets.jvmWithJava` API；嘗試使用它會導致建置指令碼編譯失敗

> 儘管整個 `targetPresets` API 都已被棄用，但 `jvmWithJava` 預設具有不同的棄用時程表。
>
{style="note"}

<a id="android-sourceset-layout-v1-deprecation"></a>
### 棄用舊版 Android 原始碼集配置 {initial-collapse-state="collapsed" collapsible="true" id="deprecated-legacy-android-source-set-layout"}

**變更了什麼？**

自 Kotlin 1.9.0 起，預設使用[新 Android 原始碼集配置](multiplatform-android-layout.md)。對舊版配置的支援已被棄用，且使用 `kotlin.mpp.androidSourceSetLayoutVersion` Gradle 屬性現在會觸發棄用診斷。

**變更何時生效？**

以下是棄用週期：

* <=1.9.0：使用 `kotlin.mpp.androidSourceSetLayoutVersion=1` 時回報警告；可以使用 `kotlin.mpp.androidSourceSetLayoutVersion1.nowarn=true` Gradle 屬性來隱藏該警告
* 1.9.20：將此警告提升為錯誤；該錯誤**無法**被隱藏
* 2.4.0：移除對舊版 Android 原始碼集配置的支援，並[移除 `kotlin.mpp.androidSourceSetLayoutVersion=1` Gradle 屬性](https://youtrack.jetbrains.com/issue/KT-82265)

<a id="common-sourceset-with-dependson-deprecation"></a>
### 棄用具有自訂 `dependsOn` 的 `commonMain` 和 `commonTest` {initial-collapse-state="collapsed" collapsible="true" id="deprecated-commonmain-and-commontest-with-custom-dependson"}

**變更了什麼？**

`commonMain` 和 `commonTest` 原始碼集通常分別代表 `main` 和 `test` 原始碼集階層的根。但是，先前可以透過手動配置這些原始碼集的 `dependsOn` 關聯來覆寫此設定。

維護此類配置需要額外的工作以及對多平台建置內部機制的了解。此外，它還會降低程式碼的可讀性和可重複使用性，因為您需要閱讀特定的建置指令碼才能確定 `commonMain` 是否為 `main` 原始碼集階層的根。

因此，現在已棄用在 `commonMain` 和 `commonTest` 上存取 `dependsOn`。

**現在的最佳實務是什麼？**

假設您需要將使用 `commonMain.dependsOn(customCommonMain)` 的 `customCommonMain` 原始碼集遷移至 1.9.20。在大多數情況下，`customCommonMain` 與 `commonMain` 參與相同的編譯，因此您可以將 `customCommonMain` 合併到 `commonMain` 中：

1. 將 `customCommonMain` 的原始碼複製到 `commonMain` 中。
2. 將 `customCommonMain` 的所有相依性新增至 `commonMain`。
3. 將 `customCommonMain` 的所有編譯器選項設定新增至 `commonMain`。

在少數情況下，`customCommonMain` 參與的編譯可能比 `commonMain` 更多。此類配置需要對建置指令碼進行額外的低階配置。如果您不確定這是否屬於您的使用案例，那麼很可能不是。

如果這確實是您的使用案例，請透過將 `customCommonMain` 的原始碼和設定移至 `commonMain`（反之亦然）來「交換」這兩個原始碼集。

**變更何時生效？**

以下是計畫的棄用週期：

* 1.9.0：在 `commonMain` 中使用 `dependsOn` 時回報警告
* &gt;=1.9.20：在 `commonMain` 或 `commonTest` 中使用 `dependsOn` 時回報錯誤

### 前向宣告的新處理方式 {initial-collapse-state="collapsed" collapsible="true" id="new-approach-to-forward-declarations"}

**變更了什麼？**

JetBrains 團隊改進了 Kotlin 中前向宣告的處理方式，使其行為更具可預測性：

* 您只能使用 `cnames` 或 `objcnames` 套件匯入前向宣告。
* 您需要明確地與對應的 C 和 Objective-C 前向宣告進行型別轉換。

**現在的最佳實務是什麼？**

* 考慮一個宣告了 `cstructName` 前向宣告且具有 `library.package` 的 C 程式庫。以前可以直接使用 `import library.package.cstructName` 從該程式庫匯入。現在，您只能使用特殊的前向宣告套件：`import cnames.structs.cstructName`。對於 `objcnames` 也是如此。

* 考慮兩個 objcinterop 程式庫：一個使用 `objcnames.protocols.ForwardDeclaredProtocolProtocol`，另一個具有實際定義：

  ```ObjC
  // 第一個 objcinterop 程式庫
  #import <Foundation/Foundation.h>
  
  @protocol ForwardDeclaredProtocol;
  
  NSString* consumeProtocol(id<ForwardDeclaredProtocol> s) {
      return [NSString stringWithUTF8String:"Protocol"];
  }
  ```

  ```ObjC
  // 第二個 objcinterop 程式庫
  // 標頭檔：
  #import <Foundation/Foundation.h>
  @protocol ForwardDeclaredProtocol
  @end
  // 實作：
  @interface ForwardDeclaredProtocolImpl : NSObject <ForwardDeclaredProtocol>
  @end

  id<ForwardDeclaredProtocol> produceProtocol() {
      return [ForwardDeclaredProtocolImpl new];
  }
  ```

  以前，可以在它們之間無縫傳遞物件。現在，前向宣告需要明確使用 `as` 進行型別轉換：

  ```kotlin
  // Kotlin 程式碼：
  fun test() {
      consumeProtocol(produceProtocol() as objcnames.protocols.ForwardDeclaredProtocolProtocol)
  }
  ```

  > 您只能從對應的真實類別轉換為 `objcnames.protocols.ForwardDeclaredProtocolProtocol`。否則將會收到錯誤。
  >
  {style="note"}

**變更何時生效？**

從 Kotlin 1.9.20 開始，您需要明確地與對應的 C 和 Objective-C 前向宣告進行型別轉換。此外，現在只能透過使用特殊套件來匯入前向宣告。

## Kotlin 1.7.0−1.8.22 {id="kotlin-1-7-0-1-8-22"}

本節介紹在 Kotlin 1.7.0−1.8.22 中結束棄用週期並生效的不相容變更。

<a id="deprecated-compatibility-with-kmp-gradle-plugin-and-gradle-java-plugins"></a>
### 棄用 Kotlin Multiplatform Gradle 外掛程式與 Gradle Java 外掛程式的相容性 {initial-collapse-state="collapsed" collapsible="true" id="deprecated-compatibility-with-kotlin-multiplatform-gradle-plugin-and-gradle-java-plugins"}

**變更了什麼？**

由於 Kotlin Multiplatform Gradle 外掛程式與 Gradle 外掛程式 [Java](https://docs.gradle.org/current/userguide/java_plugin.html)、[Java Library](https://docs.gradle.org/current/userguide/java_library_plugin.html) 以及 [Application](https://docs.gradle.org/current/userguide/application_plugin.html) 之間的相容性問題，當您將這些外掛程式套用至同一個專案時，現在會出現棄用警告。當多平台專案中的另一個 Gradle 外掛程式套用 Gradle Java 外掛程式時，也會顯示該警告。例如，[Spring Boot Gradle Plugin](https://docs.spring.io/spring-boot/gradle-plugin/index.html) 會自動套用 Application 外掛程式。

我們新增此棄用警告是由於 Kotlin Multiplatform 的專案模型與 Gradle 的 Java 生態系統外掛程式之間存在根本的相容性問題。Gradle 的 Java 生態系統外掛程式目前未考慮到其他外掛程式可能：

* 也以不同於 Java 生態系統外掛程式的方式針對 JVM 目標進行發佈或編譯。
* 在同一個專案中具有兩個不同的 JVM 目標，例如 JVM 和 Android。
* 具有複雜的多平台專案結構，可能包含多個非 JVM 目標。

遺憾的是，Gradle 目前並未提供任何 API 來解決這些問題。

先前我們在 Kotlin Multiplatform 中使用了一些因應措施來協助整合 Java 生態系統外掛程式。然而，這些因應措施從未真正解決相容性問題，且自 Gradle 8.8 發佈以來，這些因應措施已不再可行。如需更多資訊，請參閱我們的 [YouTrack 問題](https://youtrack.jetbrains.com/issue/KT-66542/Gradle-JVM-target-with-withJava-produces-a-deprecation-warning)。

雖然我們尚不清楚該如何精確解決此相容性問題，但我們致力於繼續在您的 Kotlin Multiplatform 專案中支援某種形式的 Java 原始碼編譯。至少，我們將支援 Java 原始碼的編譯，並在多平台專案中使用 Gradle 的 [`java-base`](https://docs.gradle.org/current/javadoc/org/gradle/api/plugins/JavaBasePlugin.html) 外掛程式。

**現在的最佳實務是什麼？**

如果您在多平台專案中看到此棄用警告，我們建議您：
1. 確定專案中是否確實需要 Gradle Java 外掛程式。如果不需要，請考慮將其移除。
2. 檢查 Gradle Java 外掛程式是否僅用於單一任務。如果是，您也許可以毫不費力地移除該外掛程式。例如，如果該任務使用 Gradle Java 外掛程式來建立 Javadoc JAR 檔案，您可以改為手動定義 Javadoc 任務。

否則，如果您希望在多平台專案中同時使用 Kotlin Multiplatform Gradle 外掛程式與這些適用於 Java 的 Gradle 外掛程式，我們建議您：

1. 在 Gradle 專案中建立一個單獨的子專案。
2. 在單獨的子專案中套用適用於 Java 的 Gradle 外掛程式。
3. 在單獨的子專案中新增對父多平台專案的相依性。

> 該獨立子專案**不得**為多平台專案，且您只能使用它來設定對多平台專案的相依性。
>
{style="warning"}

例如，您有一個名為 `my-main-project` 的多平台專案，並且想要使用 [Java Library](https://docs.gradle.org/current/userguide/java_library_plugin.html) Gradle 外掛程式。

建立子專案（我們稱之為 `subproject-A`）後，您的父專案結構應如下所示：

```text
.
├── build.gradle
├── settings.gradle.kts
├── subproject-A
    └── build.gradle.kts
    └── src
        └── Main.java
```

在子專案的 `build.gradle.kts` 檔案中，於 `plugins {}` 區塊內套用 Java Library 外掛程式：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    id("java-library")
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
plugins {
    id('java-library')
}
```

</TabItem>
</Tabs>

在子專案的 `build.gradle.kts` 檔案中，新增對父多平台專案的相依性：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
dependencies {
    implementation(project(":my-main-project")) // 您的父多平台專案名稱
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
dependencies {
    implementation project(':my-main-project') // 您的父多平台專案名稱
}
```

</TabItem>
</Tabs>

您的父專案現在已設定為可與這兩個外掛程式一起使用。

### 自動產生目標的新處理方式 {initial-collapse-state="collapsed" collapsible="true" id="new-approach-to-auto-generated-targets"}

**變更了什麼？**

Gradle 自動產生的目標存取子在 `kotlin.targets {}` 區塊內部已不再可用。請改為使用 `findByName("targetName")` 方法。

請注意，此類存取子在 `kotlin.targets` 情況下仍然可用，例如 `kotlin.targets.linuxX64`。

**現在的最佳實務是什麼？**

<table>
    
<tr>
<td>之前</td>
        <td>現在</td>
</tr>

    
<tr>
<td>
<code-block lang="kotlin" code="kotlin {&#10;    targets {&#10;        configure(['windows',&#10;            'linux']) {&#10;        }&#10;    }&#10;}"/>
</td>
<td>
<code-block lang="kotlin" code="kotlin {&#10;    targets {&#10;        configure([findByName('windows'),&#10;            findByName('linux')]) {&#10;        }&#10;    }&#10;}"/>
</td>
</tr>

</table>

**變更何時生效？**

在 Kotlin 1.7.20 中，在 `kotlin.targets {}` 區塊中使用目標存取子時會引入錯誤。

如需更多資訊，請參閱 [YouTrack 中的對應問題](https://youtrack.jetbrains.com/issue/KT-47047)。

### Gradle 編譯任務輸入與輸出的變更 {initial-collapse-state="collapsed" collapsible="true" id="changes-in-gradle-input-and-output-compile-tasks"}

**變更了什麼？**

Kotlin 編譯任務不再繼承具有 `sourceCompatibility` 和 `targetCompatibility` 輸入的 Gradle `AbstractCompile` 任務，使得它們在 Kotlin 使用者的指令碼中不可用。

編譯任務中的其他破壞性變更：

**現在的最佳實務是什麼？**

| 之前                                                              | 現在                                                                                                            |
|---------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|
| `SourceTask.stableSources` 輸入已不再可用。        | 請改用 `sources` 輸入。此外，`setSource()` 方法仍然可用。                          |
| 移除了 `sourceFilesExtensions` 輸入。                      | 編譯任務仍然實作了 `PatternFilterable` 介面。使用其方法來篩選 Kotlin 原始碼。 |
| `Gradle destinationDir: File` 輸出已被棄用。            | 請改用 `destinationDirectory: DirectoryProperty` 輸出。                                              |
| `KotlinCompile` 任務的 `classpath` 屬性已棄用。 | 所有編譯任務現在均使用 `libraries` 輸入來取得編譯所需的程式庫清單。              |

**變更何時生效？**

在 Kotlin 1.7.20 中，輸入不可用，輸出被替換，且 `classpath` 屬性被棄用。

如需更多資訊，請參閱 [YouTrack 中的對應問題](https://youtrack.jetbrains.com/issue/KT-32805)。

### 編譯相依性的新配置名稱 {initial-collapse-state="collapsed" collapsible="true" id="new-configuration-names-for-dependencies-on-the-compilation"}

**變更了什麼？**

由 Kotlin Multiplatform Gradle 外掛程式建立的編譯配置獲得了新名稱。

Kotlin Multiplatform 專案中的目標有兩個預設編譯：`main` 和 `test`。這些編譯各自具有自己的預設原始碼集，例如 `jvmMain` 和 `jvmTest`。先前，測試編譯及其預設原始碼集的配置名稱是相同的，當標記有特定平台屬性的配置包含在另一個配置中時，這可能會導致名稱衝突並引發問題。

現在編譯配置帶有額外的 `Compilation` 後綴，而使用舊硬式編碼配置名稱的專案和外掛程式將不再能夠編譯。

對應原始碼集的相依性配置名稱保持不變。

**現在的最佳實務是什麼？**

<table>
    
<tr>
<td></td>
        <td>之前</td>
        <td>現在</td>
</tr>

    
<tr>
<td rowspan="2"><code>jvmMain</code> 編譯的相依性</td>
<td>
<code-block lang="kotlin" code="jvm&lt;Scope&gt;"/>
</td>
<td>
<code-block lang="kotlin" code="jvmCompilation&lt;Scope&gt;"/>
</td>
</tr>

    
<tr>
<td>
<code-block lang="kotlin" code="dependencies {&#10;    add(&quot;jvmImplementation&quot;,&#10;        &quot;foo.bar.baz:1.2.3&quot;)&#10;}"/>
</td>
<td>
<code-block lang="kotlin" code="dependencies {&#10;    add(&quot;jvmCompilationImplementation&quot;,&#10;        &quot;foo.bar.baz:1.2.3&quot;)&#10;}"/>
</td>
</tr>

    
<tr>
<td><code>jvmMain</code> 原始碼集的相依性</td>
<td colspan="2">
<code-block lang="kotlin" code="jvmMain&lt;Scope&gt;"/>
</td>
</tr>

    
<tr>
<td><code>jvmTest</code> 編譯的相依性</td>
<td>
<code-block lang="kotlin" code="jvmTest&lt;Scope&gt;"/>
</td>
<td>
<code-block lang="kotlin" code="jvmTestCompilation&lt;Scope&gt;"/>
</td>
</tr>

    
<tr>
<td><code>jvmTest</code> 原始碼集的相依性</td>
<td colspan="2">
<code-block lang="kotlin" code="jvmTest&lt;Scope&gt;"/>
</td>
</tr>

</table>

可用的作用域為 `Api`、`Implementation`、`CompileOnly` 和 `RuntimeOnly`。

**變更何時生效？**

在 Kotlin 1.8.0 中，在硬式編碼字串中使用舊配置名稱時會引入錯誤。

如需更多資訊，請參閱 [YouTrack 中的對應問題](https://youtrack.jetbrains.com/issue/KT-35916/)。