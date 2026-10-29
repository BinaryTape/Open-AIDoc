[//]: # (title: iOS 應用程式的隱私清單)

如果您的應用程式預計發佈至 Apple App Store，且使用了 [必須提供原因的 API (required reasons APIs)](https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api)，
App Store Connect 可能會發出警告，提示應用程式未包含正確的隱私清單：

![必須提供原因警告](app-store-required-reasons-warning.png){width=700}

這可能會影響任何 Apple 生態系統的應用程式，無論是原生還是多平台。您的應用程式可能透過第三方程式庫或 SDK 使用了必須提供原因的 API，而這可能並不明顯。Kotlin Multiplatform 可能是其中一個使用了您未察覺之 API 的架構。

在此頁面中，您將找到有關該問題的詳細說明以及處理建議。

> 此頁面反映了 Kotlin 團隊目前對該問題的瞭解。
> 隨著我們獲得更多關於公認做法和規避措施的數據與知識，我們將更新此頁面以反映這些資訊。
>
{style="tip"}

## 問題是什麼 {id="what-s-the-issue"}

Apple 對於提交至 App Store 的要求 [在 2024 年春季已發生變化](https://developer.apple.com/news/?id=r1henawx)。
[App Store Connect](https://appstoreconnect.apple.com) 不再接受未在隱私清單中說明使用必須提供原因的 API 之原因的應用程式。

這是一項自動檢查，而非人工審核：您的應用程式程式碼會被分析，然後您會收到一封包含問題列表的電子郵件。郵件中會提到 「ITMS-91053: Missing API declaration」 問題，並列出應用程式中所有屬於 [必須提供原因](https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api) 類別的 API 類別。

理想情況下，您的應用程式所使用的所有 SDK 都會提供各自的隱私清單，這樣您就無需擔心。
但如果您的某些相依性沒有這樣做，您提交至 App Store 的內容可能會被標記。

## 如何解決 {id="how-to-resolve"}

在您嘗試提交應用程式並從 App Store 收到詳細的問題列表後，您可以參考 Apple 文件來建立您的清單：

* [隱私清單檔案概覽](https://developer.apple.com/documentation/bundleresources/privacy-manifest-files)
* [在隱私清單中描述資料使用情況](https://developer.apple.com/documentation/bundleresources/describing-data-use-in-privacy-manifests)
* [描述必須提供原因的 API 之用法](https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api)

產生的檔案是一個字典集合。針對每個存取的 API 類型，從提供的列表中選擇一個或多個使用原因。Xcode 透過提供視覺化佈局和包含每個欄位有效值的下拉式功能表，協助編輯 `.xcprivacy` 檔案。

您可以使用 [特殊工具](#find-usages-of-required-reason-apis) 來尋找 Kotlin 架構相依性中必須提供原因的 API 之用法，並使用 [獨立的外掛程式](#place-the-xcprivacy-file-in-your-kotlin-artifacts) 將 `.xcprivacy` 檔案與您的 Kotlin 產物打包在一起。

如果新的隱私清單無法滿足 App Store 的要求，或者您無法確定如何完成這些步驟，請與我們聯絡並在 [此 YouTrack 問題](https://youtrack.jetbrains.com/issue/KT-67603) 中分享您的案例。

## 尋找必須提供原因的 API 之用法 {id="find-usages-of-required-reason-apis"}

您的應用程式中的 Kotlin 程式碼或其中一個相依性可能會存取來自 `platform.posix` 等程式庫中必須提供原因的 API，例如 `fstat`：

```kotlin
import platform.posix.fstat

fun useRequiredReasonAPI() {
    fstat(...)
}
```

在某些情況下，可能很難確定哪些相依性使用了必須提供原因的 API。
為了幫助您找到它們，我們建立了一個簡單的工具。

若要使用它，請在專案中宣告 Kotlin 架構的目錄下執行以下指令：

```shell
/usr/bin/python3 -c "$(curl -fsSL https://github.com/JetBrains/kotlin/raw/rrf_v0.0.1/libraries/tools/required-reason-finder/required_reason_finder.py)"
```

您也可以單獨 [下載此指令碼](https://github.com/JetBrains/kotlin/blob/rrf_v0.0.1/libraries/tools/required-reason-finder/required_reason_finder.py)，檢查它，並使用 `python3` 執行。

## 將 .xcprivacy 檔案放置在您的 Kotlin 產物中 {id="place-the-xcprivacy-file-in-your-kotlin-artifacts"}

如果您需要將 `PrivacyInfo.xcprivacy` 檔案與您的 Kotlin 產物打包，請使用 `apple-privacy-manifests` 外掛程式：

```kotlin
plugins {
    kotlin("multiplatform")
    kotlin("apple-privacy-manifests") version "1.0.0"
}

kotlin {
    privacyManifest {
        embed(
            privacyManifest = layout.projectDirectory.file("PrivacyInfo.xcprivacy").asFile,
        )
    }
}
```

該外掛程式會將隱私清單檔案複製到 [相對應的輸出位置](https://developer.apple.com/documentation/bundleresources/adding-a-privacy-manifest-to-your-app-or-third-party-sdk?language=objc)。

## 已知用法 {id="known-usages"}

### Compose Multiplatform {id="compose-multiplatform"}

使用 Compose Multiplatform 可能會導致您的二進位檔案中使用 `fstat`、`stat` 和 `mach_absolute_time`。
儘管這些函式不用於追蹤或指紋採集，也不會從裝置發送，但 Apple 仍可能將其標記為缺少必須原因的 API。

如果您必須為 `stat` 和 `fstat` 用法指定原因，請使用 `0A2A.1`。對於 `mach_absolute_time`，請使用 `35F9.1`。

有關 Compose Multiplatform 中使用的必須提供原因的 API 之進一步更新，請關注 [此問題](https://github.com/JetBrains/compose-multiplatform/issues/4738)。

### 1.9.10 或更早版本中的 Kotlin/Native 執行期 {id="kotlin-native-runtime-in-versions-1-9-10-or-earlier"}

`mach_absolute_time` API 用於 Kotlin/Native 執行期中的 `mimalloc` 分配器。這是 Kotlin 1.9.10 及更早版本中的預設分配器。

我們建議升級到 Kotlin 1.9.20 或更高版本。如果無法升級，請更改記憶體分配。
為此，請在您的 Gradle 建置指令碼中為目前的 Kotlin 分配器設定 `-Xallocator=custom` 編譯選項，或為系統分配器設定 `-Xallocator=std`。

如需更多資訊，請參閱 [Kotlin/Native 記憶體管理](https://kotlinlang.org/docs/native-memory-manager.html)。