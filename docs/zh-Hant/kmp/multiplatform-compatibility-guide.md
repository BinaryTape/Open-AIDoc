[//]: # (title: Kotlin Multiplatform 相容性指南)

<show-structure depth="1"/>

本指南總結了在開發 Kotlin Multiplatform 專案時可能會遇到的[不相容變更](https://kotlinlang.org/docs/kotlin-evolution-principles.html#incompatible-changes)。

> 有關 Compose Multiplatform 的詳細資訊，請參閱 [Compose Multiplatform 的新功能](https://kotlinlang.org/docs/multiplatform/whats-new-compose.html)以及 [Kotlin 與 Jetpack 相容性](compose-compatibility-and-versioning.md)頁面。
> 
{style="note"}

Kotlin 目前的穩定版本為 %kotlinVersion%。請注意特定變更相對於您專案中所使用的 Kotlin 版本的棄用週期，例如：

* 從 Kotlin 1.7.0 升級到 Kotlin 1.9.0 時，請檢查在 [Kotlin 1.9.0](#kotlin-1-9-0-1-9-25) 和 [Kotlin 1.7.0−1.8.22](#kotlin-1-7-0-1-8-22) 中生效的不相容變更。
* 從 Kotlin 1.9.0 升級到 Kotlin 2.0.0 時，請檢查在 [Kotlin 2.0.0](#kotlin-2-0-0-and-later) 和 [Kotlin 1.9.0−1.9.25](#kotlin-1-9-0-1-9-25) 中生效的不相容變更。 

## 版本相容性

在配置專案時，請檢查特定版本的 Kotlin Multiplatform Gradle 外掛程式（與您專案中的 Kotlin 版本相同）與 Gradle、Xcode 以及 Android Gradle 外掛程式版本的相容性：

| Kotlin Multiplatform 外掛程式版本 | Gradle                                | Android Gradle 外掛程式                             | Xcode   |
|-------------------------------------|---------------------------------------|-----------------------------------------------------|---------|
| 2.4.0-2.4.10                        | %minGradleVersion%–%maxGradleVersion% | %minAndroidGradleVersion%–%maxAndroidGradleVersion% | %xcode% |
| 2.3.20–2.3.21                       | 7.6.3–9.3.0                           | 8.2.2–9.0.0                                         | 26.0    |
| 2.3.10                              | 7.6.3–9.0.0                           | 8.2.2–9.0.0                                         | 26.0    |
| 2.3.0                               | 7.6.3–9.0.0                           | 8.2.2–8.13.0                                        | 26.0    |
| 2.2.21                              | 7.6.3–8.14                            | 7.3.1–8.11.1                                        | 26.0    |
| 2.2.20                              | 7.6.3–8.14                            | 7.3.1–8.11.1                                        | 16.4    |
| 2.2.0–2.2.10                        | 7.6.3–8.14                            | 7.3.1–8.10.0                                        | 16.3    |
| 2.1.21                              | 7.6.3–8.12.1                          | 7.3.1–8.7.2                                         | 16.3    |
| 2.1.20                              | 7.6.3–8.11                            | 7.4.2–8.7.2                                         | 16.0    |
| 2.1.0–2.1.10                        | 7.6.3-8.10*                           | 7.4.2–8.7.2                                         | 16.0    |
| 2.0.21                              | 7.5-8.8*                              | 7.4.2–8.5                                           | 16.0    |
| 2.0.20                              | 7.5-8.8*                              | 7.4.2–8.5                                           | 15.3    |
| 2.0.0                               | 7.5-8.5                               | 7.4.2–8.3                                           | 15.3    |
| 1.9.20                              | 7.5-8.1.1                             | 7.4.2–8.2                                           | 15.0    |

> *Kotlin 2.0.20–2.0.21 和 Kotlin 2.1.0–2.1.10 與最高 8.6 版的 Gradle 完全相容。
> 也支援 Gradle 8.7–8.10 版，但有一個例外：如果您使用 Kotlin Multiplatform Gradle 外掛程式，在多平台專案中呼叫 JVM 目標中的 `withJava()` 函式時可能會看到棄用警告。
> 如需詳細資訊，請參閱[預設建立的 Java 原始碼集](#java-source-sets-created-by-default)。
>
{style="warning"}

## Kotlin 2.0.0 及更高版本

本節涵蓋在 Kotlin 2.0.0−%kotlinVersion% 中結束棄用週期並生效的不相容變更。

undefined
### 遷移至 Google 的 Android 目標外掛程式

**發生了什麼變化？**

在 Kotlin 2.3.0 之前，我們透過 `com.android.application` 和 `com.android.library` 外掛程式提供對 Android 目標的支援。這是在 Google 的 Android 小組開發專門為 Kotlin Multiplatform 量身定制的外掛程式期間的臨時解決方案。

最初我們使用 `android` 區塊，但後來轉向使用 `androidTarget` 區塊，以便將 `android` 名稱保留給新外掛程式使用。

現在，來自 Android 小組的 [`com.android.kotlin.multiplatform.library` 外掛程式](https://developer.android.com/kotlin/multiplatform/plugin)已經可用，您可以將其與原始的 `android` 區塊搭配使用。

Kotlin 2.3.0 在 Kotlin Multiplatform 專案中使用 `androidTarget` 名稱時會引入棄用警告。如果您需要更多時間遷移到 `android` 區塊，請使用帶有 AGP 8.x 的 Kotlin 2.3.10，該版本不會出現警告。

**現在的最佳實務是什麼？**

遷移到新的 `com.android.kotlin.multiplatform.library` 外掛程式。將所有出現的 `androidTarget` 區塊重新命名為 `android`。有關如何遷移的詳細指令，請參閱 Google 的[遷移指南](https://developer.android.com/kotlin/multiplatform/plugin#migrate)。

**變更何時生效？**

以下是 Kotlin Multiplatform Gradle 外掛程式的棄用週期：

* 1.9.0：在 Kotlin Multiplatform 專案中使用 `android` 名稱時引入棄用警告
* 2.1.0：將此警告提升為錯誤
* 2.2.0：從 Kotlin Multiplatform Gradle 外掛程式中移除 `android` 目標 DSL
* 2.3.0：新的 Android 外掛程式可用；在 Kotlin Multiplatform 專案中使用 `androidTarget` 名稱時引入棄用警告。
* 2.3.10：還原在 Kotlin Multiplatform 專案中使用 `androidTarget` 名稱時的棄用警告。

### 棄用 bitcode 內嵌

**發生了什麼變化？**

Bitcode 內嵌已在 Xcode 14 中被棄用，並在 Xcode 15 中針對所有 Apple 目標移除。因此，框架配置中的 `embedBitcode` 參數，以及 `-Xembed-bitcode` 和 `-Xembed-bitcode-marker` 命令列引數在 Kotlin 中也已被棄用。

**現在的最佳實務是什麼？**

如果您仍在使用較舊版本的 Xcode，但希望升級到 Kotlin 2.0.20 或更高版本，請在您的 Xcode 專案中停用 bitcode 內嵌。

**變更何時生效？**

以下是計劃的棄用週期：

* 2.0.20：Kotlin/Native 編譯器不再支援 bitcode 內嵌
* 2.1.0：`embedBitcode` DSL 在 Kotlin Multiplatform Gradle 外掛程式中被棄用並發出警告
* 2.2.0：警告提升為錯誤
* 2.3.0：移除 `embedBitcode` DSL 

undefined
### 預設建立的 Java 原始碼集

**發生了什麼變化？**

為了使 Kotlin Multiplatform 與 Gradle 即將發生的變更保持一致，我們正在逐步淘汰 `withJava()` 函式。`withJava()` 函式透過建立必要的 Java 原始碼集來實現與 Gradle Java 外掛程式的整合。從 Kotlin 2.1.20 開始，這些 Java 原始碼集會預設建立。

**現在的最佳實務是什麼？**

以前，您必須明確使用 `withJava()` 函式來建立 `src/jvmMain/java` 和 `src/jvmTest/java` 原始碼集：

```kotlin
kotlin {
    jvm {
        withJava()
    }
}
``` 

從 Kotlin 2.1.20 開始，您可以從建置指令碼中移除 `withJava()` 函式。

此外，現在只有在存在 Java 原始碼時，Gradle 才會執行 Java 編譯任務，這會觸發先前未曾執行的 JVM 驗證診斷。如果您在 `KotlinJvmCompile` 任務中或 `compilerOptions` 內部明確配置了不相容的 JVM 目標，此診斷將失敗。有關確保 JVM 目標相容性的指南，請參閱[檢查相關編譯任務的 JVM 目標相容性](https://kotlinlang.org/docs/gradle-configure-project.html#check-for-jvm-target-compatibility-of-related-compile-tasks)。

如果您的專案使用的 Gradle 版本高於 8.7，且不依賴 Gradle Java 外掛程式（如 [Java](https://docs.gradle.org/current/userguide/java_plugin.html)、[Java Library](https://docs.gradle.org/current/userguide/java_library_plugin.html) 或 [Application](https://docs.gradle.org/current/userguide/application_plugin.html)），或是依賴 Gradle Java 外掛程式的第三方 Gradle 外掛程式，則可以移除 `withJava()` 函式。

如果您的專案使用了 [Application](https://docs.gradle.org/current/userguide/application_plugin.html) Gradle Java 外掛程式，我們建議遷移到[新的實驗性 DSL](https://kotlinlang.org/docs/whatsnew2120.html#kotlin-multiplatform-new-dsl-to-replace-gradle-s-application-plugin)。從 Gradle 8.7 開始，Application 外掛程式將不再與 Kotlin Multiplatform Gradle 外掛程式配合工作。

如果您想在多平台專案中同時使用 Kotlin Multiplatform Gradle 外掛程式和其他 Gradle Java 外掛程式，請參閱[與 Kotlin Multiplatform Gradle 外掛程式和 Java 外掛程式的已棄用相容性](multiplatform-compatibility-guide.md#deprecated-compatibility-with-kotlin-multiplatform-gradle-plugin-and-gradle-java-plugins)。

如果您在 Kotlin 2.1.20 且 Gradle 版本高於 8.7 的情況下使用 [Java 測試夾具](https://docs.gradle.org/current/userguide/java_testing.html#sec:java_test_fixtures) Gradle 外掛程式，該外掛程式將無法運作。請改為升級到 [Kotlin 2.1.21](https://kotlinlang.org/docs/releases.html#release-details)，該問題已在該版本中修復。

如果您遇到任何問題，請在我們的[問題追蹤器](https://kotl.in/issue)中報告，或是在我們的[公開 Slack 頻道](https://kotlinlang.slack.com/archives/C19FD9681)尋求協助。

**變更何時生效？**

以下是計劃的棄用週期：

* Gradle >8.6：對於使用 `withJava()` 函式的多平台專案中任何舊版本的 Kotlin，引入棄用警告。
* Gradle 9.0：將此警告提升為錯誤。
* 2.1.20：在與任何版本的 Gradle 搭配使用 `withJava()` 函式時引入棄用警告。

undefined
### 宣告多個相似目標

**發生了什麼變化？**

我們不建議在單一 Gradle 專案中宣告多個相似的目標。例如：

```kotlin
kotlin {
    jvm("jvmKtor")
    jvm("jvmOkHttp") // 不推薦並會產生棄用警告
}
```

一種常見情況是將兩個相關的程式碼片段放在一起。例如，您可能想在 `:shared` Gradle 專案中使用 `jvm("jvmKtor")` 和 `jvm("jvmOkHttp")`，以便使用 Ktor 或 OkHttp 程式庫實作網路功能：

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
                // 共享相依性
            }
        }
        val jvmKtorMain by getting {
            dependsOn(commonJvmMain)
            dependencies {
                // Ktor 相依性
            }
        }
        val jvmOkHttpMain by getting {
            dependsOn(commonJvmMain)
            dependencies {
                // OkHttp 相依性
            }
        }
    }
}
```

該實作帶來了不小的配置複雜性：

* 您必須在 `:shared` 端和每個取用者端設定 Gradle 屬性。否則，Gradle 無法解析此類專案中的相依性，因為在沒有額外資訊的情況下，不清楚取用者應該接收基於 Ktor 的實作還是基於 OkHttp 的實作。
* 您必須手動設定 `commonJvmMain` 原始碼集。
* 配置涉及多個低階 Gradle 和 Kotlin Gradle 外掛程式抽象與 API。

**現在的最佳實務是什麼？**

配置之所以複雜，是因為基於 Ktor 和 OkHttp 的實作都位於_同一個 Gradle 專案中_。在許多情況下，可以將這些部分提取到獨立的 Gradle 專案中。以下是此類重構的一般大綱：

1. 將原始專案中的兩個重複目標替換為單一目標。如果這些目標之間原本有共享原始碼集，請將其原始碼和配置移動到新建立目標的預設原始碼集中：

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

2. 加入兩個新的 Gradle 專案，通常是在 `settings.gradle.kts` 檔案中呼叫 `include`。例如：

    ```kotlin
    include(":okhttp-impl")
    include(":ktor-impl")
    ```

3. 配置每個新的 Gradle 專案：

    * 您很可能不需要套用 `kotlin("multiplatform")` 外掛程式，因為這些專案僅編譯到一個目標。在此範例中，您可以套用 `kotlin("jvm")`。
    * 將原始目標特定原始碼集的內容移動到各自的專案中，例如從 `jvmKtorMain` 移動到 `ktor-impl/src`。
    * 複製原始碼集的配置：相依性、編譯器選項等。
    * 加入從新 Gradle 專案到原始專案的相依性。

    ```kotlin
    // ktor-impl/build.gradle.kts:
    plugins {
        kotlin("jvm")
    }
    
    dependencies {
        project(":shared") // 加入對原始專案的相依性
        // 將 jvmKtorMain 的相依性複製到此處
    }
    
    kotlin {
        compilerOptions {
            // 將 jvmKtorMain 的編譯器選項複製到此處
        }
    }
    ```

雖然這種方法在初始設定上需要更多工作，但它不使用 Gradle 和 Kotlin Gradle 外掛程式的任何低階實體，使得產出的組建更易於使用 and 維護。

> 遺憾的是，我們無法為每種情況提供詳細的遷移步驟。如果上述指令對您不適用，請在此 [YouTrack 問題](https://youtrack.jetbrains.com/issue/KT-59316)中描述您的使用案例。
>
{style="tip"}

**變更何時生效？**

以下是計劃的棄用週期：

* 1.9.20：在 Kotlin Multiplatform 專案中使用多個相似目標時引入棄用警告
* 2.1.0：在此類情況下報告錯誤，Kotlin/JS 目標除外；欲了解更多關於此例外的資訊，請參閱 [YouTrack 中的問題](https://youtrack.jetbrains.com/issue/KT-47038/KJS-MPP-Split-JS-target-into-JsBrowser-and-JsNode)

undefined
### 棄用支援以舊版模式發佈的多平台程式庫

**發生了什麼變化？**

先前，我們已在 Kotlin Multiplatform 專案中[棄用了舊版模式](#deprecated-gradle-properties-for-hierarchical-structure-support)，以防止發佈「舊版」二進位檔案，並鼓勵您將專案遷移到[階層結構](multiplatform-hierarchy.md)。

為了繼續從生態系統中逐步淘汰「舊版」二進位檔案，從 Kotlin 1.9.0 開始，也不再建議使用舊版程式庫。如果您的專案使用了對舊版程式庫的相依性，您將看到以下警告：

```none
The dependency group:artifact:1.0 was published in the legacy mode. Support for such dependencies will be removed in the future
```

**現在的最佳實務是什麼？**

_如果您使用多平台程式庫_，大多數程式庫已經遷移到「階層結構」模式，因此您只需更新程式庫版本即可。詳情請參閱各個程式庫的文件。

如果程式庫尚未支援非舊版二進位檔案，您可以聯絡維護者並告知他們這個相容性問題。

_如果您是程式庫作者_，請將 Kotlin Gradle 外掛程式更新至最新版本，並確保您已修復了[已棄用的 Gradle 屬性](#deprecated-gradle-properties-for-hierarchical-structure-support)。

Kotlin 團隊非常希望能協助生態系統遷移，因此如果您面臨任何問題，請隨時在 [YouTrack 中建立問題](https://kotl.in/issue)。

**變更何時生效？**

以下是計劃的棄用週期：

* 1.9.0：對舊版程式庫的相依性引入棄用警告
* 2.0.0：將對舊版程式庫相依性的警告提升為錯誤
* &gt;2.0.0：移除對舊版程式庫相依性的支援；使用此類相依性可能會導致組建失敗

undefined
### 棄用用於階層結構支援的 Gradle 屬性

**發生了什麼變化？**

在發展過程中，Kotlin 逐漸在多平台專案中引入了對[階層結構](multiplatform-hierarchy.md)的支援，這使得在通用原始碼集 `commonMain` 與任何特定平台原始碼集（例如 `jvmMain`）之間建立中間原始碼集成為可能。

在工具鏈尚未足夠穩定之前的過渡期，引入了一些 Gradle 屬性，允許細粒度的選擇加入 (opt-in) 或退出 (opt-out)。

自 Kotlin 1.6.20 起，預設已啟用階層式專案結構支援。然而，這些屬性被保留下來以便在遇到阻礙性問題時可以選擇退出。在處理完所有回饋後，我們現在開始完全淘汰這些屬性。

以下屬性現已被棄用：

* `kotlin.internal.mpp.hierarchicalStructureByDefault`
* `kotlin.mpp.enableCompatibilityMetadataVariant`
* `kotlin.mpp.hierarchicalStructureSupport`
* `kotlin.mpp.enableGranularSourceSetsMetadata`
* `kotlin.native.enableDependencyPropagation`

**現在的最佳實務是什麼？**

* 從您的 `gradle.properties` 和 `local.properties` 檔案中移除這些屬性。
* 避免在 Gradle 建置指令碼或您的 Gradle 外掛程式中以程式化方式設定它們。
* 如果棄用屬性是由您組建中使用的某些第三方 Gradle 外掛程式設定的，請要求外掛程式維護者不要設定這些屬性。

由於自 Kotlin 1.6.20 以來，Kotlin 工具鏈的預設行為已不包含此類屬性，因此我們預期不會產生任何嚴重影響。大多數後果將在專案重新建置後立即顯現。

如果您是程式庫作者並希望確保萬無一失，請檢查取用者是否可以配合您的程式庫運作。

**變更何時生效？**

以下是計劃的棄用週期：

* 1.8.20：使用已棄用的 Gradle 屬性時報告警告
* 1.9.20：將此警告提升為錯誤
* 2.0.0：移除已棄用的屬性；Kotlin Gradle 外掛程式將忽略其使用情況

在極少數情況下，如果您在移除這些屬性後遇到問題，請在 [YouTrack 中建立問題](https://kotl.in/issue)。

undefined
### 棄用目標預設設定 API

**發生了什麼變化？**

在開發初期，Kotlin Multiplatform 引入了一個用於處理所謂「目標預設設定 (target presets)」的 API。每個目標預設設定實際上代表了一個 Kotlin Multiplatform 目標的工廠。這個 API 後來被證明在很大程度上是多餘的，因為像 `jvm()` 或 `iosSimulatorArm64()` 這樣的 DSL 函式涵蓋了相同的使用案例，且更加直觀、簡潔。

為了減少混淆並提供更清晰的指南，Kotlin Gradle 外掛程式的公開 API 中所有與預設設定相關的 API 現已被棄用。這包括：

* `org.jetbrains.kotlin.gradle.dsl.KotlinMultiplatformExtension` 中的 `presets` 屬性
* `org.jetbrains.kotlin.gradle.plugin.KotlinTargetPreset` 介面及其所有繼承者
* `fromPreset` 多載

**現在的最佳實務是什麼？**

請改用對應的 [Kotlin 目標](multiplatform-dsl-reference.md#targets)，例如：

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

以下是計劃的棄用週期：

* 1.9.20：對任何使用預設設定相關 API 的行為報告警告
* 2.0.0：將此警告提升為錯誤
* 2.2.0：從 Kotlin Gradle 外掛程式的公開 API 中移除預設設定相關 API；仍在使用它的原始碼將因「無法解析的參照 (unresolved reference)」錯誤而失敗，且二進位檔案（例如 Gradle 外掛程式）除非針對最新版本的 Kotlin Gradle 外掛程式重新編譯，否則可能會發生連結錯誤

undefined
### 棄用 Apple 目標快速鍵

**發生了什麼變化？**

我們正在棄用 Kotlin Multiplatform DSL 中的 `ios()`、`watchos()` 和 `tvos()` 目標快速鍵。它們原本旨在為 Apple 目標部分建立原始碼集階層結構。然而，事實證明它們難以擴展，有時甚至會造成混淆。

例如，`ios()` 快速鍵同時建立了 `iosArm64` 和 `iosX64` 目標，但未包含在使用 Apple 晶片的主機上工作時所必需的 `iosSimulatorArm64` 目標。然而，更改此快速鍵難以實作，並可能導致現有使用者專案出現問題。

**現在的最佳實務是什麼？**

Kotlin Gradle 外掛程式 now 提供了一個內建的階層結構模板。自 Kotlin 1.9.20 起，它預設啟用，並包含為常見使用案例預定義的中間原始碼集。

您應該指定目標清單，而不是使用快速鍵，外掛程式隨後會根據此清單自動設定中間原始碼集。

例如，如果您的專案中有 `iosArm64` 和 `iosSimulatorArm64` 目標，外掛程式會自動建立 `iosMain` 和 `iosTest` 中間原始碼集。如果您有 `iosArm64` 和 `macosArm64` 目標，則會建立 `appleMain` 和 `appleTest` 原始碼集。

如需詳細資訊，請參閱[階層式專案結構](multiplatform-hierarchy.md)

**變更何時生效？**

以下是計劃的棄用週期：

* 1.9.20：使用 `ios()`、`watchos()` 和 `tvos()` 目標快速鍵時報告警告；改為預設啟用預設階層結構模板
* 2.1.0：使用目標快速鍵時報告錯誤
* 2.2.0：從 Kotlin Multiplatform Gradle 外掛程式中移除目標快速鍵 DSL

### Kotlin 升級後 iOS 框架版本不正確

**問題是什麼？**

在使用直接整合時，Kotlin 程式碼的變更可能無法反映在 Xcode 的 iOS 應用程式中。直接整合是透過 `embedAndSignAppleFrameworkForXcode` 任務設定的，該任務將多平台專案中的 iOS 框架連接到 Xcode 中的 iOS 應用程式。

當您在多平台專案中將 Kotlin 版本從 1.9.2x 升級到 2.0.0（或從 2.0.0 降級到 1.9.2x），然後更改 Kotlin 檔案並嘗試組建應用程式時，Xcode 可能會錯誤地使用舊版本的 iOS 框架。因此，變更在 Xcode 的 iOS 應用程式中將不可見。

**現在的解決方案是什麼？**

1. 在 Xcode 中，使用 **Product** | **Clean Build Folder** 清除組建目錄。
2. 在終端機中執行以下指令：

   ```none
   ./gradlew clean
   ```

3. 再次組建應用程式，以確保使用了新版本的 iOS 框架。

**問題何時修復？**

我們計劃在 Kotlin 2.0.10 中修復此問題。您可以在[參與 Kotlin 早期體驗計劃](https://kotlinlang.org/docs/eap.html)章節中檢查 Kotlin 2.0.10 的任何預覽版本是否已可用。

如需詳細資訊，請參閱 [YouTrack 中的對應問題](https://youtrack.jetbrains.com/issue/KT-68257)。

## Kotlin 1.9.0−1.9.25

本節涵蓋在 Kotlin 1.9.0−1.9.25 中結束棄用週期並生效的不相容變更。

undefined
### 移除了直接將 Kotlin 原始碼集加入 Kotlin 編譯的 API {initial-collapse-state="collapsed" collapsible="true"}

**發生了什麼變化？**

已移除對 `KotlinCompilation.source` 的存取權限。不再支援如下程式碼：

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

若要替換 `KotlinCompilation.source(someSourceSet)`，請使用 `.srcDir()` 函式將您的原始碼直接加入適當的原始碼集。或者，您可以建立一個新的原始碼集，並加入從 `KotlinCompilation` 的預設原始碼集到 `someSourceSet` 的 `dependsOn` 關係。您也可以使用[原始碼集慣例](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.dsl/-kotlin-multiplatform-source-set-conventions/)直接引用原始碼，這對 IDE 較友善且被認為是最穩健的方法。最後，您可以使用 `KotlinCompilation.defaultSourceSet.dependsOn(someSourceSet)`，這在所有情況下都有效。

您可以透過以下方式之一更改上述程式碼：

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

        // 選項 1. 將您的原始碼直接加入適當的原始碼集：
        commonMain {
            kotlin.srcDir(layout.projectDirectory.dir("src/commonMain/my-custom-kotlin"))
        }

        // 選項 2. 使用預設 Kotlin Multiplatform 目標為其
        // 主要 (main) 和測試 (test) 原始碼集提供的慣例：
        jvmMain {
            dependsOn(myCustomIntermediateSourceSet)
        }

        // 選項 3. 更通用的解決方案。如果您的建置指令碼
        // 需要更進階的方法，請使用此項：
        targets["jvm"].compilations["main"].defaultSourceSet.dependsOn(myCustomIntermediateSourceSet)
    }
}
```

**變更何時生效？**

以下是棄用週期：

* 1.9.0：使用 `KotlinCompilation.source` 時引入棄用警告
* 1.9.20：將此警告提升為錯誤
* 2.3.0：從 Kotlin Gradle 外掛程式中移除 `KotlinCompilation.source`，嘗試使用它將導致建置指令碼編譯期間出現「無法解析的參照」錯誤

undefined
### 從 `kotlin-js` Gradle 外掛程式遷移至 `kotlin-multiplatform` Gradle 外掛程式 {initial-collapse-state="collapsed" collapsible="true"}

**發生了什麼變化？**

從 Kotlin 1.9.0 開始，`kotlin-js` Gradle 外掛程式已被棄用。基本上，它重複了帶有 `js()` 目標的 `kotlin-multiplatform` 外掛程式的功能，並在底層共享相同的實作。這種重疊造成了混淆，並增加了 Kotlin 團隊的維護負擔。我們建議您改為遷移至帶有 `js()` 目標的 `kotlin-multiplatform` Gradle 外掛程式。

**現在的最佳實務是什麼？**

1. 從您的專案中移除 `kotlin-js` Gradle 外掛程式，如果您使用了 `pluginManagement {}` 區塊，請在 `settings.gradle.kts` 檔案中套用 `kotlin-multiplatform`：

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
           // 改為加入以下這行：
           kotlin("multiplatform") version "1.9.0"
       }
       
       repositories {
           // ...
       }
   }
   ```

   </TabItem>
   </Tabs>

   如果您使用了不同的外掛程式套用方式，請參閱 [Gradle 文件](https://docs.gradle.org/current/userguide/plugins.html)以獲取遷移指令。

2. 將您的原始碼檔案從 `main` 和 `test` 資料夾移動到同一目錄下的 `jsMain` 和 `jsTest` 資料夾。
3. 調整相依性宣告：

   * 我們建議使用 `sourceSets {}` 區塊並配置各個原始碼集的相依性，`jsMain {}` 用於生產相依性，`jsTest {}` 用於測試相依性。詳情請參閱[加入相依性](multiplatform-add-dependencies.md)。
   * 但是，如果您想在頂層區塊中宣告相依性，請將宣告從 `api("group:artifact:1.0")` 更改為 `add("jsMainApi", "group:artifact:1.0")`，依此類推。

     > 在這種情況下，請確保頂層 `dependencies {}` 區塊位於 `kotlin {}` 區塊**之後**。否則，您將收到「找不到配置 (Configuration not found)」錯誤。
     >
     {style="note"}

   您可以透過以下方式之一更改 `build.gradle.kts` 檔案中的程式碼：

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
                   // 此處不需要 js 前綴，您可以直接從頂層區塊複製並貼上
                   implementation("org.jetbrains.kotlinx:kotlinx-html:0.8.0")
               }
          }
       }
   }
   
   dependencies {
       // 選項 2. 將 js 前綴加入相依性宣告：
       add("jsTestImplementation", kotlin("test"))
   }
   ```

   </TabItem>
   </Tabs>

4. 由 Kotlin Gradle 外掛程式在 `kotlin {}` 區塊內部提供的 DSL 在大多數情況下保持不變。但是，如果您是以名稱引用低階 Gradle 實體（如任務和配置），則現在需要對其進行調整，通常是加入 `js` 前綴。例如，您可以在 `jsBrowserTest` 名稱下找到原本的 `browserTest` 任務。

**變更何時生效？**

以下是 `kotlin-js` Gradle 外掛程式的棄用週期：

* 1.9.0：使用 `kotlin-js` Gradle 外掛程式時產生棄用警告
* 2.4.0：[將此警告提升為錯誤](https://youtrack.jetbrains.com/issue/KT-59305)

undefined
### 棄用 `jvmWithJava` 預設設定 {initial-collapse-state="collapsed" collapsible="true"}

**發生了什麼變化？**

`targetPresets.jvmWithJava` 已被棄用，不建議使用。

**現在的最佳實務是什麼？**

請改用 `jvm { withJava() }` 目標。請注意，切換到 `jvm { withJava() }` 後，您將需要調整包含 `.java` 原始碼的原始碼目錄路徑。

例如，如果您使用預設名稱為 "jvm" 的 `jvm` 目標：

| 之前          | 現在                |
|-----------------|--------------------|
| `src/main/java` | `src/jvmMain/java` |
| `src/test/java` | `src/jvmTest/java` |

**變更何時生效？**

以下是計劃的棄用週期：

* 1.3.40：使用 `targetPresets.jvmWithJava` 時引入警告
* 1.9.20：將此警告提升為錯誤
* &gt;1.9.20：移除 `targetPresets.jvmWithJava` API；嘗試使用它將導致建置指令碼編譯失敗

> 儘管整個 `targetPresets` API 都已被棄用，但 `jvmWithJava` 預設設定具有不同的棄用時間表。
>
{style="note"}

undefined
### 棄用舊版 Android 原始碼集佈局 {initial-collapse-state="collapsed" collapsible="true"}

**發生了什麼變化？**

自 Kotlin 1.9.0 起，預設使用[新的 Android 原始碼集佈局](multiplatform-android-layout.md)。對舊版佈局的支援已被棄用，且使用 `kotlin.mpp.androidSourceSetLayoutVersion` Gradle 屬性現在會觸發棄用診斷。

**變更何時生效？**

以下是棄用週期：

* <=1.9.0：使用 `kotlin.mpp.androidSourceSetLayoutVersion=1` 時報告警告；該警告可以使用 `kotlin.mpp.androidSourceSetLayoutVersion1.nowarn=true` Gradle 屬性來隱藏
* 1.9.20：將此警告提升為錯誤；此錯誤**無法**被隱藏
* 2.4.0：移除對舊版 Android 原始碼集佈局的支援，並[移除 `kotlin.mpp.androidSourceSetLayoutVersion=1` Gradle 屬性](https://youtrack.jetbrains.com/issue/KT-82265)

undefined
### 棄用帶有自訂 `dependsOn` 的 `commonMain` 和 `commonTest` {initial-collapse-state="collapsed" collapsible="true"}

**發生了什麼變化？**

`commonMain` 和 `commonTest` 原始碼集通常分別代表 `main` 和 `test` 原始碼集階層結構的根。然而，以前可以透過手動配置這些原始碼集的 `dependsOn` 關係來覆蓋此行為。

維護此類配置需要額外的工作以及對多平台組建內部的了解。此外，它還會降低程式碼的可讀性和可重用性，因為您必須閱讀特定的建置指令碼才能確定 `commonMain` 是否為 `main` 原始碼集階層結構的根。

因此，存取 `commonMain` 和 `commonTest` 上的 `dependsOn` 現已被棄用。

**現在的最佳實務是什麼？**

假設您需要將使用 `commonMain.dependsOn(customCommonMain)` 的 `customCommonMain` 原始碼集遷移到 1.9.20。在大多數情況下，`customCommonMain` 與 `commonMain` 參與相同的編譯，因此您可以將 `customCommonMain` 合併到 `commonMain` 中：

1. 將 `customCommonMain` 的原始碼複製到 `commonMain`。
2. 將 `customCommonMain` 的所有相依性加入 `commonMain`。
3. 將 `customCommonMain` 的所有編譯器選項設定加入 `commonMain`。

在極少數情況下，`customCommonMain` 可能參與比 `commonMain` 更多的編譯。此類配置需要額外的建置指令碼低階配置。如果您不確定這是否屬於您的使用案例，那它很可能不是。

如果這確實是您的使用案例，請透過將 `customCommonMain` 的原始碼和設定移動到 `commonMain`（反之亦然）來「交換」這兩個原始碼集。

**變更何時生效？**

以下是計劃的棄用週期：

* 1.9.0：在 `commonMain` 中使用 `dependsOn` 時報告警告
* &gt;=1.9.20：在 `commonMain` 或 `commonTest` 中使用 `dependsOn` 時報告錯誤

### 前向宣告的新方法 {initial-collapse-state="collapsed" collapsible="true"}

**發生了什麼變化？**

JetBrains 團隊重新設計了 Kotlin 中前向宣告的方法，以使其行為更可預測：

* 您只能使用 `cnames` 或 `objcnames` 套件匯入前向宣告。
* 您需要明確在對應的 C 和 Objective-C 前向宣告之間進行轉型。

**現在的最佳實務是什麼？**

* 考慮一個帶有 `library.package` 的 C 程式庫，它宣告了一個 `cstructName` 前向宣告。以前，可以直接從程式庫使用 `import library.package.cstructName` 進行匯入。現在，您只能使用特殊的前向宣告套件來執行此操作：`import cnames.structs.cstructName` 對於 `objcnames` 也是如此。

* 考慮兩個 objcinterop 程式庫：一個使用 `objcnames.protocols.ForwardDeclaredProtocolProtocol`，另一個則有實際定義：

  ```ObjC
  // 第一个 objcinterop 库
  #import <Foundation/Foundation.h>
  
  @protocol ForwardDeclaredProtocol;
  
  NSString* consumeProtocol(id<ForwardDeclaredProtocol> s) {
      return [NSString stringWithUTF8String:"Protocol"];
  }
  ```

  ```ObjC
  // 第二個 objcinterop 程式庫
  // 頁首 (Header)：
  #import <Foundation/Foundation.h>
  @protocol ForwardDeclaredProtocol
  @end
  // 實作 (Implementation)：
  @interface ForwardDeclaredProtocolImpl : NSObject <ForwardDeclaredProtocol>
  @end

  id<ForwardDeclaredProtocol> produceProtocol() {
      return [ForwardDeclaredProtocolImpl new];
  }
  ```

  以前，可以在它們之間無縫轉移物件。現在，對於前向宣告需要明確使用 `as` 轉型：

  ```kotlin
  // Kotlin 程式碼：
  fun test() {
      consumeProtocol(produceProtocol() as objcnames.protocols.ForwardDeclaredProtocolProtocol)
  }
  ```

  > 您只能從對應的真實類別轉型為 `objcnames.protocols.ForwardDeclaredProtocolProtocol`。否則，您將收到錯誤。
  >
  {style="note"}

**變更何時生效？**

從 Kotlin 1.9.20 開始，您需要明確在對應的 C 和 Objective-C 前向宣告之間進行轉型。此外，現在僅能透過使用特殊套件來匯入前向宣告。

## Kotlin 1.7.0−1.8.22

本節涵蓋在 Kotlin 1.7.0−1.8.22 中結束棄用週期並生效的不相容變更。

undefined
### Kotlin Multiplatform Gradle 外掛程式與 Gradle Java 外掛程式的相容性已被棄用 {initial-collapse-state="collapsed" collapsible="true"}

**發生了什麼變化？**

由於 Kotlin Multiplatform Gradle 外掛程式與 Gradle 外掛程式 [Java](https://docs.gradle.org/current/userguide/java_plugin.html)、[Java Library](https://docs.gradle.org/current/userguide/java_library_plugin.html) 及 [Application](https://docs.gradle.org/current/userguide/application_plugin.html) 之間的相容性問題，現在當您在同一個專案中套用這些外掛程式時會出現棄用警告。當多平台專案中的另一個 Gradle 外掛程式套用了 Gradle Java 外掛程式時，也會顯示該警告。例如，[Spring Boot Gradle 外掛程式](https://docs.spring.io/spring-boot/gradle-plugin/index.html)會自動套用 Application 外掛程式。

我們加入此棄用警告是由於 Kotlin Multiplatform 的專案模型與 Gradle 的 Java 生態系統外掛程式之間存在根本性的相容性問題。Gradle 的 Java 生態系統外掛程式目前未考慮到其他外掛程式可能：

* 也以與 Java 生態系統外掛程式不同的方式發佈或為 JVM 目標進行編譯。
* 在同一個專案中有兩個不同的 JVM 目標，例如 JVM 和 Android。
* 具有複雜的多平台專案結構，可能包含多個非 JVM 目標。

遺憾的是，Gradle 目前並未提供任何 API 來解決這些問題。

我們之前在 Kotlin Multiplatform 中使用了一些暫時解決方案來協助與 Java 生態系統外掛程式的整合。然而，這些方案從未真正解決相容性問題，且自 Gradle 8.8 版本發佈以來，這些方案已不再可行。如需詳細資訊，請參閱我們的 [YouTrack 問題](https://youtrack.jetbrains.com/issue/KT-66542/Gradle-JVM-target-with-withJava-produces-a-deprecation-warning)。

雖然我們目前尚不清楚如何解決此相容性問題，但我們致力於繼續支援您 Kotlin Multiplatform 專案中某種形式的 Java 原始碼編譯。至少，我們將支援 Java 原始碼的編譯，並在您的多平台專案中使用 Gradle 的 [`java-base`](https://docs.gradle.org/current/javadoc/org/gradle/api/plugins/JavaBasePlugin.html) 外掛程式。

**現在的最佳實務是什麼？**

如果您在多平台專案中看到此棄用警告，我們建議您：
1. 判斷您的專案中是否真的需要 Gradle Java 外掛程式。如果不需要，請考慮移除它。
2. 檢查 Gradle Java 外掛程式是否僅用於單一任務。若是，您可能可以毫不費力地移除該外掛程式。例如，如果該任務使用 Gradle Java 外掛程式來建立 Javadoc JAR 檔案，您可以改為手動定義 Javadoc 任務。

否則，如果您想在多平台專案中同時使用 Kotlin Multiplatform Gradle 外掛程式和這些 Gradle Java 外掛程式，我們建議您：

1. 在您的 Gradle 專案中建立一個獨立的子專案。
2. 在該獨立子專案中套用 Gradle Java 外掛程式。
3. 在該獨立子專案中，加入對您父層多平台專案的相依性。

> 該獨立子專案必須**不**是多平台專案，且您必須僅將其用於設定對您多平台專案的相依性。
>
{style="warning"}

例如，您有一個名為 `my-main-project` 的多平台專案，且您想使用 [Java Library](https://docs.gradle.org/current/userguide/java_library_plugin.html) Gradle 外掛程式。

建立子專案（假設稱為 `subproject-A`）後，您的父專案結構應如下所示：

```text
.
├── build.gradle
├── settings.gradle.kts
├── subproject-A
    └── build.gradle.kts
    └── src
        └── Main.java
```

在您子專案的 `build.gradle.kts` 檔案中，於 `plugins {}` 區塊中套用 Java Library 外掛程式：

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

在您子專案的 `build.gradle.kts` 檔案中，加入對您父層多平台專案的相依性：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
dependencies {
    implementation(project(":my-main-project")) // 您父層多平台專案的名稱
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
dependencies {
    implementation project(':my-main-project') // 您父層多平台專案的名稱
}
```

</TabItem>
</Tabs>

您的父專案現在已設定為可同時配合兩個外掛程式運作。

### 自動產生目標的新方法 {initial-collapse-state="collapsed" collapsible="true"}

**發生了什麼變化？**

由 Gradle 自動產生的目標存取子不再於 `kotlin.targets {}` 區塊內部可用。請改用 `findByName("targetName")` 方法。

請注意，此類存取子在 `kotlin.targets {}` 之外（例如 `kotlin.targets.linuxX64`）仍然可用。

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

在 Kotlin 1.7.20 中，於 `kotlin.targets {}` 區塊中使用目標存取子會引入錯誤。

如需詳細資訊，請參閱 [YouTrack 中的對應問題](https://youtrack.jetbrains.com/issue/KT-47047)。

### Gradle 輸入與輸出編譯任務的變更 {initial-collapse-state="collapsed" collapsible="true"}

**發生了什麼變化？**

Kotlin 編譯任務不再繼承具有 `sourceCompatibility` 和 `targetCompatibility` 輸入的 Gradle `AbstractCompile` 任務，使得這些輸入在 Kotlin 使用者的指令碼中不可用。

其他編譯任務中的破壞性變更：

**現在的最佳實務是什麼？**

| 之前                                                              | 現在                                                                                                            |
|---------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|
| `SourceTask.stableSources` 輸入不再可用。        | 請改用 `sources` 輸入。此外，`setSource()` 方法仍然可用。                          |
| `sourceFilesExtensions` 輸入已被移除。                      | 編譯任務仍然實作 `PatternFilterable` 介面。使用其方法來篩選 Kotlin 原始碼。 |
| `Gradle destinationDir: File` 輸出已被棄用。            | 請改用 `destinationDirectory: DirectoryProperty` 輸出。                                              |
| `KotlinCompile` 任務的 `classpath` 屬性已被棄用。 | 所有編譯任務現在都使用 `libraries` 輸入來取得編譯所需的程式庫清單。              |

**變更何時生效？**

在 Kotlin 1.7.20 中，輸入不可用，輸出被替換，且 `classpath` 屬性被棄用。

如需詳細資訊，請參閱 [YouTrack 中的對應問題](https://youtrack.jetbrains.com/issue/KT-32805)。

### 編譯相依性的新配置名稱 {initial-collapse-state="collapsed" collapsible="true"}

**發生了什麼變化？**

由 Kotlin Multiplatform Gradle 外掛程式建立的編譯配置獲得了新名稱。

Kotlin Multiplatform 專案中的目標具有兩個預設編譯：`main` 和 `test`。每個編譯都有其自己的預設原始碼集，例如 `jvmMain` 和 `jvmTest`。以前，測試編譯及其預設原始碼集的配置名稱是相同的，這可能導致名稱衝突，進而導致當標記有平台特定屬性的配置包含在另一個配置中時出現問題。

現在編譯配置具有額外的 `Compilation` 後置詞，而使用舊的硬編碼配置名稱的專案和外掛程式將不再能編譯。

對應原始碼集相依性的配置名稱保持不變。

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

可用的範圍為 `Api`、`Implementation`、`CompileOnly` 和 `RuntimeOnly`。

**變更何時生效？**

在 Kotlin 1.8.0 中，在硬編碼字串中使用舊的配置名稱會引入錯誤。

如需詳細資訊，請參閱 [YouTrack 中的對應問題](https://youtrack.jetbrains.com/issue/KT-35916/)。