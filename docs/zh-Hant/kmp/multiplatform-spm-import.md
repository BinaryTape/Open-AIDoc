[//]: # (title: 將 Swift 軟件包作為相依性新增至 KMP 模組)
<primary-label ref="alpha"/>

<tldr>
   <p>Swift 封裝管理員 (SwiftPM) 扮演與 CocoaPods 相同的角色：
   它讓你能透明地編排 iOS 應用程式的原生 iOS 相依性。</p>
   <p>在此你可以了解如何在 KMP 專案中配置 SwiftPM 相依性，
   以及必要時如何將 KMP 配置從 CocoaPods 遷移至 SwiftPM。</p>
</tldr>

> 此功能處於 [Alpha](https://kotlinlang.org/docs/components-stability.html#stability-levels-explained) 階段。
> 請在專屬的 Kotlin Slack 頻道中分享你遇到的任何問題或回饋：[#kmp-swift-package-manager](https://kotlinlang.slack.com/archives/C09TW68099C)
>
{style="note"}

支援 SwiftPM 匯入整合的 Kotlin Gradle 外掛程式允許你使用為 Apple 目標 宣告的 SwiftPM 相依性，從 Objective-C 和 Swift 程式碼中匯入 Objective-C API。

對於遞移相依性（相依於那些使用 SwiftPM 匯入的專案），Kotlin Gradle 外掛程式會自動從 SwiftPM 相依性提供必要的 機器碼。例如，在執行 Kotlin/Native 測試或連結 架構 時，你不需要進行任何額外的 配置。

> 目前尚不支援將使用 SwiftPM 匯入的 KMP 模組本身作為 Swift 軟件包 [匯出](multiplatform-spm-export.md)，且可能無法運作。
> 請參閱此 [YouTrack 問題](https://youtrack.jetbrains.com/issue/KT-84420) 了解更多詳細資訊，並讓我們知道你的使用案例。
>
{style="note"}

要配置你的專案：

1. [配置你的開發環境](#set-the-kotlin-multiplatform-gradle-plugin-version)
2. [將 SwiftPM 相依性新增至你的 KMP 模組並使用它](#add-and-use-swiftpm-dependencies)

## 配置 Kotlin Multiplatform Gradle 外掛程式版本

要嘗試 SwiftPM 匯入功能，請確保你使用的是 Kotlin Multiplatform Gradle 外掛程式的 **%kotlinEapVersion%** 版本。
`gradle/libs.versions.toml` 檔案範例如下：

```toml
[versions]
kotlin = "%kotlinEapVersion%"

[plugins]
kotlin-multiplatform = { id = "org.jetbrains.kotlin.multiplatform", version.ref = "kotlin" }
```

## 新增並使用 SwiftPM 相依性

> 有關實際運作的範例，請參閱我們的範例專案。
> 在 `master` 分支 上，每個專案都使用 CocoaPods 配置，而 `spm_import` 分支 則使用 SwiftPM：
> 
> * [SwiftUI 與 Firebase 範例應用程式](https://github.com/Kotlin/kmp-with-cocoapods-firebase-sample/tree/spm_import)
> * [Compose Multiplatform iOS 範例應用程式](https://github.com/Kotlin/kmp-with-cocoapods-compose-sample/tree/spm_import)
>
{type="tip"}

### 配置組建

特定的 SwiftPM 相依性可以新增在 `build.gradle.kts` 檔案的 `swiftPMDependencies {}` 區塊中，即宣告 Apple 目標 的位置。
例如，對於 Firebase：

```kotlin
kotlin {
    iosArm64()
    iosSimulatorArm64()

    swiftPMDependencies {
        // 將 FirebaseAnalytics 匯入你的 Kotlin 程式碼中
        swiftPackage(
            url = url("https://github.com/firebase/firebase-ios-sdk.git"),
            version = from("12.5.0"),
            products = listOf(product("FirebaseAnalytics")),
        )
        // swift-protobuf 是 Firebase 的遞移相依性，
        // 因此只有在你想要使用特定版本時，
        // 才需要包含它
        swiftPackage(
            url = url("https://github.com/apple/swift-protobuf.git"),
            version = exact("1.32.0"),
            products = listOf(),
        )
    }
}
```

SwiftPM 整合基於匯入 Clang 模組。
預設情況下，匯入機制會自動發現指定 Swift 軟件包 中的 Clang 模組，並使所有可用的 模組 都能被 Kotlin 程式碼存取 —— 類似於 API 可見性在 Swift 和 Objective-C 中的運作方式。
<!-- TODO link to where it is explained? -->

要停用預設行為和自動 模組 發現，請將 `discoverClangModulesImplicitly` 配置為 `false`。
當 模組 發現被停用時，SwiftPM 匯入會使用產品名稱作為 Clang 模組 名稱。

要匯入名稱與產品名稱不同的 Clang 模組，請使用 `importedClangModules` 參數，例如：

```kotlin
kotlin {
    swiftPMDependencies {
        // 如果 'discoverClangModulesImplicitly' 被設定為 'true'，
        // 則下方的 'importedClangModules' 參數將會被忽略
        discoverClangModulesImplicitly = false

        // 匯入的軟件包、其產品以及 Clang 模組
        swiftPackage(
            url = url("https://github.com/firebase/firebase-ios-sdk.git"),
            version = from("12.5.0"),
            products = listOf(
                product("FirebaseAnalytics"),
                product("FirebaseFirestore")
            ),
            importedClangModules = listOf(
                "FirebaseAnalytics", 
                // FirebaseFirestore 的 Objective-C API 位於
                // 'FirebaseFirestoreInternal' Clang 模組中
                "FirebaseFirestoreInternal"
            ),
        )
    }
}
```

### 配置平台約束

某些 SwiftPM 相依性可能無法在你的 組建 指令碼 中的所有 目標 上編譯或提供有效的 API。
例如，Google Maps SDK 目前僅支援 iOS 目標。

如果你的專案僅針對 iOS，你不需要明確宣告平台。
但只要你新增另一個 目標（例如 macOS），你就需要為每個相依性指定平台 約束。

為了確保相依性僅套用於相關的編譯，請在 `product` 規格的 `platforms` 參數 中指定正確的 目標：

```kotlin
kotlin {
    iosArm64()
    iosSimulatorArm64()
    macosArm64()

    swiftPMDependencies {
        swiftPackage(
            url = url("https://github.com/googlemaps/ios-maps-sdk.git"),
            version = exact("10.3.0"),
            products = listOf(
                product(
                    "GoogleMaps", 
                    platforms = setOf(
                        // `GoogleMaps` 軟件包將僅對
                        // iOS 編譯可見
                        iOS()
                    )
                )
            )
        ) 
    }
}
```

### 執行 SwiftPM 整合任務

SwiftPM 匯入工具會產生一個中間 軟件包，用於追蹤目前的 SwiftPM 相依性清單。
當你第一次將 SwiftPM 相依性新增至專案時，你需要將你的 Xcode 專案與產生的 軟件包 連結。

要執行此操作，請在專案目錄中透過以下指令執行特殊的 Gradle 任務：

```shell
XCODEPROJ_PATH='/path/to/project/iosApp/iosApp.xcodeproj' ./gradlew :kotlin-library:integrateLinkagePackage
```

該指令將產生 SwiftPM 軟件包 並在 Xcode 專案中執行必要的變更。請確保將產生的 軟件包 以及更新後的 Xcode 專案提交至你的 存儲庫。

在初始整合之後，每當你變更 SwiftPM 相依性集合或其 版本 時，該合成 軟件包 都會自動更新。

### 使用匯入的 API

匯入的 Objective-C API 包含在以 `swiftPMImport` 前綴開始，並以專案及其群組的 Gradle 名稱結尾的 命名空間 中。

例如，Kotlin 組建 指令碼 指定群組名稱如下：

```kotlin
// subproject/build.gradle.kts
group = "groupName"
```

此處 `groupName` 是專案的 Gradle 群組名稱，而 `subproject` 是專案名稱。現在你可以在該 模組 的 `iosMain` 原始碼集 中匯入 Firebase API，例如：

```kotlin
// subproject/src/iosMain/kotlin/useFirebaseAnalytics.kt
import swiftPMImport.groupName.subproject.FIRAnalytics
import swiftPMImport.groupName.subproject.FIRApp
```

## 產生的 `Package.resolved` 檔案

為了使相依於 Swift 軟件包 的 組建 更穩定，SwiftPM 匯入工具引入了一種鎖定機制：
在初始 軟件包 解析期間會為每個子專案產生 `Package.resolved` 檔案。

預設情況下，這些檔案會合併為單個 `Package.resolved` 檔案，放置於 `.swiftpm-locks/default/swiftImport` 目錄中的合成 軟件包 內。
此共用鎖定檔案隨後用於 組建 專案，確保所有子專案使用相同 版本 的 Swift 軟件包。
你可以透過 [將子專案分組或將其排除在同步之外](#customize-aggregation-of-swift-package-versions) 來自訂鎖定檔案合併行為。

你應該將鎖定檔案提交至你的 存儲庫，以確保所有 組建 使用相同的相依性。
為了簡化 檔案 管理，你可以將整個 `.swiftpm-locks` 目錄提交至你的 存儲庫。
雖然只有 `Package.resolved` 檔案對於相依性同步至關重要，
但保留整個目錄可以加速第一次 組建 期間的解析。 

當你在 組建 指令碼 中變更 SwiftPM 相依性集合或 版本 時，鎖定檔案會自動更新。
你也可以 [手動強制更新鎖定檔案](#force-an-update-of-the-lock-file)。

### 自訂 Swift 軟件包 版本聚合

與其為所有子專案使用 `default` 群組，
你可以定義自訂群組，以便為每個群組產生獨立的 `Package.resolved` 鎖定檔案。

合併行為由 `swiftDependencies {}` 區塊中的 `packageResolvedSynchronization` 選項控制：

```kotlin
kotlin {
    swiftDependencies {
        // 當未為 `packageResolvedSynchronization` 設定值時， 
        // 該子專案會被分配一個預設群組識別碼，
        // 就像這樣設定一樣： 
        // packageResolvedSynchronization = identifier("default")
    }
}
```

要自訂合併行為，請為每個子專案分配一個非預設的群組識別碼。
在以下範例中，子專案 `one` 和 `two` 使用相同的 `custom` 軟件包 版本集，
而子專案 `three` 則使用預設集合：

<Tabs>
<TabItem title="子專案 &quot;one&quot;">

```kotlin
// one/build.gradle.kts

kotlin {
    swiftDependencies {
        packageResolvedSynchronization = identifier("custom"),
        ...
    }
}
```
</TabItem>

<TabItem title="子專案 &quot;two&quot;">

```kotlin
// two/build.gradle.kts

kotlin {
    swiftDependencies {
        packageResolvedSynchronization = identifier("custom"),
        ...
    }
}
```

</TabItem>

<TabItem title="子專案 &quot;three&quot;">

```kotlin
// three/build.gradle.kts

kotlin {
    swiftDependencies {
        // 使用預設識別碼，就像設定了以下內容一樣：
        // packageResolvedSynchronization = identifier("default")
        ...
    }
}
```

</TabItem>

</Tabs>

如果你想完全停用某個子專案的同步機制，
請使用 `noSynchronization()` 呼叫而不是 `identifier()`：

```kotlin
kotlin {
    swiftDependencies { 
        // 此子專案的 Package.resolved 檔案
        // 不會與任何其他檔案合併
        packageResolvedSynchronization = noSynchronization()
    }
}
```

停用同步的子專案將擁有自己的 `Package.resolved` 鎖定檔案，
放置在子專案目錄中 `build.gradle.kts` 檔案旁邊。

與預設同步一樣，自訂子專案的所有 `Package.resolved` 檔案都應提交至你的 存儲庫。

### 強制更新鎖定檔案

如果你想手動強制更新鎖定檔案：

1. 刪除應更新鎖定檔案的每個子專案的 `build` 目錄。
2. 移除現有的 `Package.resolved` 檔案：
   * 對於沒有特定同步 配置 的子專案，刪除 `.swiftpm-locks/default/` 目錄。
   * 對於具有 [自訂同步群組](#customize-aggregation-of-swift-package-versions) 的子專案，尋找並刪除 `.swiftpm-locks/<group-name>/` 目錄。
   * 對於設定了 `noSynchronization()` 的子專案，尋找並刪除子專案目錄中的 `Package.resolved` 檔案。
3. 再次執行相依性解析任務：`./gradlew :yourModuleName:fetchSyntheticImportProjectPackages`。

## 其他匯入選項

### 匯入本機 Swift 軟件包

SwiftPM 匯入機制還允許從本機檔案系統匯入 Swift 軟件包。

讓我們考慮一個位於 `/path/to/ExamplePackage` 目錄中、具有以下資訊清單的 Swift 軟件包：

```swift
// /path/to/ExamplePackage/Package.swift
let package = Package(
  name: "ExamplePackage",
  platforms: [.iOS("15.0")],
  products: [
    .library(name: "ExamplePackage", targets: ["ExamplePackage"]),
  ],
  dependencies: [
    .package(url: "https://github.com/grpc/grpc-swift.git", exact: "1.27.0",),
  ],
  targets: [
    // 此目標可以透過 @objc API 在 Swift 中實作，或在 Objective-C 中實作
    .target(name: "ExamplePackage", dependencies: [.product(name: "GRPC", package: "grpc-swift")]),
  ]
)
```
{collapsible="true" collapsed-title-line-number="3"}

要在你的 Kotlin 組建 指令碼 中匯入它，請使用 `localSwiftPackage` API：

```kotlin
// <projectDir>/shared/build.gradle.kts
kotlin {
    swiftPMDependencies {
        localSwiftPackage(
            directory = project.layout.projectDirectory.dir("/path/to/ExamplePackage/"),
            products = listOf("ExamplePackage")
        )
    }
}
```

同步 Gradle 檔案以執行 SwiftPM 匯入，然後在你的 Kotlin 程式碼中使用匯入的 API：

```kotlin
// /path/to/shared/src/appleMain/kotlin/useExamplePackage.kt

@OptIn(kotlinx.cinterop.ExperimentalForeignApi::class)
fun useExamplePackage() {
    // 如果 Swift 軟件包已成功匯入，
    // IDE 會為該類別建議正確的匯入
    HelloFromExamplePackage().hello()
}
```

### 特定部署版本

如果你的相依性需要更高的 [部署版本](https://developer.apple.com/documentation/packagedescription/supportedplatform)，請在 `*MinimumDeploymentTarget` 參數 中指定。例如，針對 iOS：

```kotlin
kotlin {
    swiftPMDependencies {
        iosMinimumDeploymentTarget.set("16.0")
    }
}
```

### Swift 軟件包 的位置與版本

與 `Package.swift` 資訊清單檔案類似，你可以在 `swiftPackage()` 呼叫中指定 Swift 軟件包 的位置和 版本。兩者都有幾個互斥的選項。 

要配置位置，你可以使用 URL 或 [SwiftPM 登錄 ID](https://docs.swift.org/swiftpm/documentation/packagemanagerdocs/usingswiftpackageregistry)：

```kotlin
swiftPackage(
    // 選項 1，URL 字串
    // 指向軟件包的 Git 存儲庫
    url = url("https://github.com/firebase/firebase-ios-sdk.git")

    // 選項 2，Swift 軟件包登錄 ID
    // 請參閱上方連結中關於使用軟件包登錄的 Apple 文件
    repository = id("...")
)
```

要指定 版本，請使用以下 Gradle 和 Git 風格的 版本 規格：

```kotlin
swiftPackage(
    // 類似於 Gradle 的 'require' 版本約束，
    // 從指定版本開始
    version = from("1.0")

    // 類似於 Gradle 的 'strict' 版本約束，
    // 完全符合指定版本
    version = exact("2.0")

    // Git 特定的版本規格，
    // 符合指定的 分支 或修訂版
    version = branch("master")
    // 或者
    version = revision("e74b07278b926c9ec6f9643455ea00d1ce04a021")
)
```

## 動態 Kotlin/Native 架構 的已知限制

目前，SwiftPM 匯入整合不支援產生動態 Kotlin/Native 架構 時可能出現的所有 邊緣情況。你可能會在 Xcode 組建 期間遇到問題，或在 執行階段 看到警告，例如：

* `Undefined symbols for architecture ...: "...", referenced from: ld: symbol(s) not found ...`
* `dyld: Symbol not found: ...`
* `objc[...]: Class _Foo is implemented in both /path/to/Shared and /path/to/Bar. This may cause spurious casting failures and mysterious crashes. One of the duplicates must be removed or renamed.`

這些問題的通用修正方法是將 `isStatic` 屬性設定為 `true` 來變更 架構 的連結模式：

```kotlin
// shared/build.gradle.kts
kotlin {
    listOf(
        iosArm64(),
        iosSimulatorArm64()
    ).forEach { iosTarget ->
        iosTarget.binaries.framework {
            baseName = "Shared"

            // 將此屬性設定為 "true"
            isStatic = true
        }
    }
}
```

如果你遇到任何這些問題、需要保持 `isStatic=false`，或者變更此 屬性 無助於解決 組建 失敗，請在我們的 Slack 頻道中告知我們。獲取 [邀請](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up) 並加入 [#kmp-swift-package-manager](https://kotlinlang.slack.com/archives/C09TW68099C)。

## 下一步

進一步了解 [如何在 KMP 專案中從 CocoaPods 切換到 SwiftPM 相依性](multiplatform-cocoapods-spm-migration.md)。