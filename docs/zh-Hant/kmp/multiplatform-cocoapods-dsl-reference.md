[//]: # (title: CocoaPods Gradle 外掛程式 DSL 參考)

<tldr>

* 在增加 Pod 相依性之前，請[完成初始配置](multiplatform-cocoapods-overview.md#set-up-an-environment-to-work-with-cocoapods)。
* 請參閱[在 Kotlin 專案中設定不同 Pod 相依性](https://github.com/Kotlin/kmp-with-cocoapods-multitarget-xcode-sample)的範例專案。
* 查看[具有多個目標的 Xcode 專案如何依賴 Kotlin 程式庫](https://github.com/Kotlin/kmp-with-cocoapods-multitarget-xcode-sample)的範例專案。

</tldr>
<show-structure for="chapter,procedure" depth="2"/>

Kotlin CocoaPods Gradle 外掛程式是用於建立 Podspec 檔案的工具。這些檔案是將您的 Kotlin 專案與 [CocoaPods 封裝管理員](https://cocoapods.org/)整合所必需的。

本 DSL 參考列出了 Kotlin CocoaPods Gradle 外掛程式的主要區塊、函式和屬性，供您在設定 CocoaPods 整合時使用。

## 啟用外掛程式

若要套用 CocoaPods 外掛程式，請將以下幾行增加到 `build.gradle(.kts)` 檔案中：

```kotlin
plugins {
   kotlin("multiplatform") version "%kotlinVersion%"
   kotlin("native.cocoapods") version "%kotlinVersion%"
}
```

外掛程式版本與 [Kotlin 發佈版本](https://kotlinlang.org/docs/releases.html)一致。最新的穩定版本為 %kotlinVersion%。

## `cocoapods {}` 區塊

`cocoapods {}` 區塊是 CocoaPods 配置的頂層區塊。它包含有關 Pod 的一般資訊，包括必要的資訊（如 Pod 版本、摘要和首頁）以及選用功能。

您可以在其中使用以下區塊、函式和屬性：

| **名稱**                              | **描述**                                                                                                                                                                                                                  | 
|---------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `version`                             | Pod 的版本。如果未指定，則使用 Gradle 專案版本。如果未配置這些屬性中的任何一個，將會收到錯誤。                                                                                                                             |
| `summary`                             | 從此專案建置的 Pod 之必要描述。                                                                                                                                                                                                |
| `homepage`                            | 從此專案建置的 Pod 之必要首頁連結。                                                                                                                                                                                            |
| `authors`                             | 指定從此專案建置的 Pod 作者。                                                                                                                                                                                                  |
| `podfile`                             | 配置現有的 Podfile。                                                                                                                                                                                                         |
| `noPodspec()`                         | 設定外掛程式不為 `cocoapods` 區段產生 Podspec 檔案。                                                                                                                                                                            |
| `name`                                | 從此專案建置的 Pod 名稱。如果未提供，則使用專案名稱。                                                                                                                                                                          |
| `license`                             | 從此專案建置的 Pod 授權、其類型和文字。                                                                                                                                                                                        |
| `framework`                           | framework 區塊配置由外掛程式產生的架構。                                                                                                                                                                                       |
| `source`                              | 從此專案建置的 Pod 所在位置。                                                                                                                                                                                                  |
| `extraSpecAttributes`                 | 配置其他 Podspec 屬性，如 `libraries` 或 `vendored_frameworks`。                                                                                                                                                             |
| `xcodeConfigurationToNativeBuildType` | 將自訂 Xcode 配置對應到 NativeBuildType：「Debug」對應到 `NativeBuildType.DEBUG`，「Release」對應到 `NativeBuildType.RELEASE`。                                                                                               |
| `publishDir`                          | 配置 Pod 發佈的輸出目錄。                                                                                                                                                                                                      |
| `pods`                                | 傳回 Pod 相依性清單。                                                                                                                                                                                                        |
| `pod()`                               | 將 CocoaPods 相依性增加到從此專案建置的 Pod。                                                                                                                                                                                  |
| `specRepos`                           | 使用 `url()` 增加規格存儲庫。當使用私有 Pod 作為相依性時，這是必需的。如需更多資訊，請參閱 [CocoaPods 文件](https://guides.cocoapods.org/making/private-cocoapods.html)。 |

### 目標

| iOS                 | macOS        | tvOS                 | watchOS                 |
|---------------------|--------------|----------------------|-------------------------|
| `iosArm64`          | `macosArm64` | `tvosArm64`          | `watchosArm64`          |
| `iosSimulatorArm64` |              | `tvosSimulatorArm64` | `watchosSimulatorArm64` |
| `iosX64`            |              |                      | `watchosArm32`          |
|                     |              |                      | `watchosDeviceArm64`    |

對於每個目標，請使用 `deploymentTarget` 屬性指定 Pod 程式庫的最低部署目標版本。

套用後，CocoaPods 會為所有目標增加 `debug` 和 `release` 架構作為輸出二進位檔案。

```kotlin
kotlin {
    iosArm64()
   
    cocoapods {
        version = "2.0"
        name = "MyCocoaPod"
        summary = "CocoaPods test library"
        homepage = "https://github.com/JetBrains/kotlin"
        
        extraSpecAttributes["vendored_frameworks"] = 'CustomFramework.xcframework'
        license = "{ :type => 'MIT', :text => 'License text'}"
        source = "{ :git => 'git@github.com:vkormushkin/kmmpodlibrary.git', :tag => '$version' }"
        authors = "Kotlin Dev"
        
        specRepos {
            url("https://github.com/Kotlin/kotlin-cocoapods-spec.git")
        }
        pod("example")
        
        xcodeConfigurationToNativeBuildType["CUSTOM_RELEASE"] = NativeBuildType.RELEASE
   }
}
```

### `framework {}` 區塊

`framework {}` 區塊巢狀於 `cocoapods` 內部，用於配置從專案建置的 Pod 的架構屬性。

> 請注意，`baseName` 是必要欄位。
>
{style="note"}

| **名稱**           | **描述**                                                                         | 
|--------------------|-----------------------------------------------------------------------------------------|
| `baseName`         | 必要的架構名稱。請使用此屬性取代已棄用的 `frameworkName`。                             |
| `isStatic`         | 定義架構連結類型。預設為動態。                                                          |
| `transitiveExport` | 啟用相依性匯出。                                                                        |                                                      

```kotlin
kotlin {
    cocoapods {
        version = "2.0"
        framework {
            baseName = "MyFramework"
            isStatic = false
            export(project(":anotherKMMModule"))
            transitiveExport = true
        }
    }
}
```

## `pod()` 函式

`pod()` 函式呼叫會將 CocoaPods 相依性增加到從此專案建置的 Pod 中。每個相依性都需要個別的函式呼叫。

您可以在函式參數中指定 Pod 程式庫的名稱，並在其配置區塊中指定其他參數值，例如程式庫的 `version` 和 `source`：

| **名稱**                     | **描述**                                                                                                                                                                                                                                                                                    | 
|------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `version`                    | 程式庫版本。若要使用最新版本的程式庫，請省略此參數。                                                                                                                                                                                                                                         |
| `source`                     | 配置 Pod 來源：<list><li>使用 `git()` 的 Git 存儲庫。在 `git()` 之後的區塊中，您可以指定 `commit` 以使用特定提交，指定 `tag` 以使用特定標籤，以及指定 `branch` 以使用存儲庫中的特定分支</li><li>使用 `path()` 的本機存儲庫</li></list> |
| `packageName`                | 指定套件名稱。                                                                                                                                                                                                                                                                        |
| `extraOpts`                  | 指定 Pod 程式庫的選項清單。例如特定旗標：<code-block lang="Kotlin" code="extraOpts = listOf(&quot;-compiler-option&quot;)"></code-block>                                                                                                                                        |
| `linkOnly`                   | 指示 CocoaPods 外掛程式使用具有動態架構的 Pod 相依性，而不產生 cinterop 綁定。如果與靜態架構搭配使用，此選項將完全移除 Pod 相依性。                                                                                           |
| `interopBindingDependencies` | 包含對其他 Pod 的相依性清單。此清單在為新 Pod 建置 Kotlin 綁定時使用。                                                                                                                                                                                   |
| `useInteropBindingFrom()`    | 指定用作相依性的現有 Pod 名稱。此 Pod 應在函式執行前宣告。該函式指示 CocoaPods 外掛程式在為新 Pod 建置綁定時，使用現有 Pod 的 Kotlin 綁定。                                     |

```kotlin
kotlin {
    iosArm64()
    
    cocoapods {
        version = "2.0"
        summary = "CocoaPods test library"
        homepage = "https://github.com/JetBrains/kotlin"
        ios.deploymentTarget = "16.0"
      
        pod("pod_dependency") {
            version = "1.0"
            extraOpts += listOf("-compiler-option")
            linkOnly = true
            source = path(project.file("../pod_dependency"))
        }
    }
}
```

## 下一步

* [在 Kotlin Gradle 外掛程式存儲庫中查看 Kotlin DSL 的完整語法](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-plugin/src/common/kotlin/org/jetbrains/kotlin/gradle/targets/native/cocoapods/CocoapodsExtension.kt)
* [在您的 Kotlin 專案中增加 Pod 程式庫的相依性](multiplatform-cocoapods-libraries.md)
* [在 Kotlin 專案與 Xcode 專案之間設定相依性](multiplatform-cocoapods-xcode.md)