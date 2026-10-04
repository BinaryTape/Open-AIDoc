[//]: # (title: 常見問題)

## Kotlin Multiplatform {id="kotlin-multiplatform"}

### 什麼是 Kotlin Multiplatform？ {id="what-is-kotlin-multiplatform"}

[Kotlin Multiplatform](https://www.jetbrains.com/kotlin-multiplatform/) (KMP) 是 JetBrains 推出的開源技術，用於靈活的跨平台開發。它允許你為各種平台建立應用程式，並在不同平台間高效重複使用程式碼，同時保有原生程式設計的優勢。透過 Kotlin Multiplatform，你可以開發適用於 Android、iOS、桌面、Web、伺服器端及其他平台的應用程式。

### 我可以使用 Kotlin Multiplatform 共用 UI 程式碼嗎？ {id="can-i-share-ui-code-using-kotlin-multiplatform"}

可以，你可以使用 [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/) 來共用 UI，這是 JetBrains 基於 Kotlin 和 [Jetpack Compose](https://developer.android.com/jetpack/compose) 開發的宣告式 UI 架構。該架構允許你為 iOS、Android、桌面和 Web 等平台建立共用的 UI 元件，協助你在不同裝置和平台間維持一致的使用者介面。

若要了解更多，請參閱 [Compose Multiplatform](#compose-multiplatform) 小節。

### Kotlin Multiplatform 支援哪些平台？ {id="what-platforms-does-kotlin-multiplatform-support"}

Kotlin Multiplatform 支援 Android、iOS、桌面、Web、伺服器端及其他平台。進一步了解[支援的平台](supported-platforms.md)。

### 我應該使用哪款 IDE 來開發跨平台應用程式？ {id="in-which-ide-should-i-work-on-my-cross-platform-app"}

我們建議使用 IntelliJ IDEA 或 Android Studio 來進行 Kotlin Multiplatform 專案開發。

如果你的 Kotlin Multiplatform 專案以 iOS 為目標平台，你的電腦上需要安裝 [Xcode](https://developer.apple.com/xcode/)，以便編寫 iOS 專屬程式碼並執行 iOS 應用程式。

### 如何建立新的 Kotlin Multiplatform 專案？ {id="how-do-i-create-a-new-kotlin-multiplatform-project"}

[建立 Kotlin Multiplatform 應用程式](get-started.topic)教學提供了建立 Kotlin Multiplatform 專案的逐步說明。你可以決定要共用什麼——僅共用邏輯，或是同時共用邏輯與 UI。

### 我有一個現有的 Android 應用程式，該如何將其遷移至 Kotlin Multiplatform？ {id="i-have-an-existing-android-application-how-can-i-migrate-it-to-kotlin-multiplatform"}

[讓你的 Android 應用程式在 iOS 上執行](multiplatform-integrate-in-existing-app.md)逐步教學說明了如何讓你的 Android 應用程式搭配原生 UI 在 iOS 上運作。

[將 Jetpack Compose 應用程式遷移至 Kotlin Multiplatform](migrate-from-android.md) 是一篇進階教學，展示了將複雜 Android 應用程式轉換為多平台的完整路徑，包括將 UI 遷移至 Compose Multiplatform。

### 可以在哪裡取得完整的範例來試用？ {id="where-can-i-get-complete-examples-to-play-with"}

這裡有一份[真實範例清單](multiplatform-samples.md)。

### 哪裡可以找到真實 Kotlin Multiplatform 應用程式清單？有哪些公司在生產環境中使用 KMP？ {id="where-can-i-find-a-list-of-real-life-kotlin-multiplatform-applications-what-companies-use-kmp-in-production"}

請查看我們的[案例研究清單](https://kotlinlang.org/case-studies/?type=multiplatform)，了解其他已經在生產環境中採用 Kotlin Multiplatform 的公司經驗。

### 哪些作業系統可以使用 Kotlin Multiplatform？ {id="which-operating-systems-can-work-with-kotlin-multiplatform"}

如果你要處理共用程式碼或特定平台的程式碼（iOS 除外），你可以在 IDE 支援的任何作業系統上工作。

如果你想編寫 iOS 專屬程式碼並在模擬器或實體裝置上執行 iOS 應用程式，請使用執行 macOS 的 Mac 電腦。這是因為根據 Apple 的要求，iOS 模擬器只能在 macOS 上執行，無法在 Microsoft Windows 或 Linux 等其他作業系統上執行。

進一步了解[推薦的 IDE](recommended-ides.md)。

### 如何在 Kotlin Multiplatform 專案中編寫並行程式碼？ {id="how-can-i-write-concurrent-code-in-kotlin-multiplatform-projects"}

你仍然可以在 Kotlin Multiplatform 專案中使用協同程式 (coroutine) 與 Flow 來編寫非同步程式碼。如何呼叫這些程式碼取決於你從何處呼叫。從 Kotlin 程式碼呼叫掛起函式 (suspending functions) 與 Flow 有詳盡的文件記載，尤其是針對 Android。[從 Swift 程式碼呼叫它們](https://kotlinlang.org/docs/native-arc-integration.html#completion-handlers)需要多做一些工作，詳情請參閱 [KT-47610](https://youtrack.jetbrains.com/issue/KT-47610)。

目前從 Swift 呼叫掛起函式與 Flow 的最佳方法，是使用像 [KMP-NativeCoroutines](https://github.com/rickclephas/KMP-NativeCoroutines) 這類的外掛程式與程式庫，搭配 Swift 的 `async`/`await` 或 Combine 與 RxSwift 等程式庫。

目前，KMP-NativeCoroutines 是經過更多驗證的解決方案，並且支援 `async`/`await`、Combine 和 RxSwift 的並行處理方式。SKIE 則更容易設定且較不冗長。例如，它直接將 Kotlin `Flow` 對應至 Swift `AsyncSequence`。這兩個程式庫都支援協同程式的正常取消。

若要了解如何使用它們，請參閱[原生 UI：REST API 請求的共用邏輯](multiplatform-upgrade-app.md)教學。

### 什麼是 Kotlin/Native，它與 Kotlin Multiplatform 有何關聯？ {id="what-is-kotlin-native-and-how-does-it-relate-to-kotlin-multiplatform"}

[Kotlin/Native](https://kotlinlang.org/docs/native-overview.html) 是一項將 Kotlin 程式碼編譯為原生二進位檔的技術，無需虛擬機即可執行。它包含一個基於 [LLVM](https://llvm.org/) 的 Kotlin 編譯器後端，以及 Kotlin 標準程式庫的原生實作。

Kotlin/Native 主要旨在允許針對不適合或無法使用虛擬機的平台（例如嵌入式裝置和 iOS）進行編譯。當你需要產生不需要額外執行時期或虛擬機的獨立程式時，它特別適用。

例如，在行動應用程式中，使用 Kotlin 編寫的共用程式碼會透過 Kotlin/JVM 編譯為 Android 的 JVM 位元組碼，並透過 Kotlin/Native 編譯為 iOS 的原生二進位檔。這使得與 Kotlin Multiplatform 在這兩個平台上的整合變得天衣無縫。

![Kotlin/Native and Kotlin/JVM binaries](kotlin-native-and-jvm-binaries.png){width=350}

### 如何加快原生平台（iOS、macOS、Linux）的 Kotlin Multiplatform 模組編譯速度？ {id="how-can-i-speed-up-my-kotlin-multiplatform-module-compilation-for-native-platforms-ios-macos-linux"}

請參閱這些[改善 Kotlin/Native 編譯時間的提示](https://kotlinlang.org/docs/native-improving-compilation-time.html)。

## Compose Multiplatform {id="compose-multiplatform"}

### 什麼是 Compose Multiplatform？ {id="what-is-compose-multiplatform"}

[Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/) 是由 JetBrains 開發的現代宣告式與響應式 UI 架構，提供了一種只需少量 Kotlin 程式碼即可建構使用者介面的簡單方法。它還允許你編寫一次 UI，即可在任何受支援的平台上執行——iOS、Android、桌面（Windows、macOS、Linux）和 Web。

### 它與 Android 的 Jetpack Compose 有何關聯？ {id="how-does-it-relate-to-jetpack-compose-for-android"}

Compose Multiplatform 與 Google 開發的 Android UI 架構 [Jetpack Compose](https://developer.android.com/jetpack/compose) 共用大部分 API。事實上，當你使用 Compose Multiplatform 以 Android 為目標時，你的應用程式就只是在 Jetpack Compose 上執行。
Compose Multiplatform 所針對的其他平台，其底層實作細節可能與 Android 上的 Jetpack Compose 不同，但它們仍為你提供相同的 API。

有關詳細資訊，請參閱[架構相互關係概觀](compose-multiplatform-and-jetpack-compose.md)。

### 可以在哪些平台之間共用 UI？ {id="between-which-platforms-can-i-share-my-ui"}

我們希望你能夠在主流平台的任意組合之間共用 UI——Android、iOS、桌面（Linux、macOS、Windows）和 Web（基於 Wasm）。目前 Compose Multiplatform 在 Android、iOS 和桌面平台上已達到穩定 (Stable) 狀態。有關更多詳細資訊，請參閱[支援的平台](supported-platforms.md)。

### 我可以在生產環境中使用 Compose Multiplatform 嗎？ {id="can-i-use-compose-multiplatform-in-production"}

Compose Multiplatform 的 Android、iOS 和桌面目標平台皆已穩定 (Stable)。你可以在生產環境中使用它們。

基於 WebAssembly 的 Web 版 Compose Multiplatform 處於 Beta 階段，這意味著它已接近完成。你可以使用它，但仍可能遇到遷移問題。它具有與 iOS、Android 和桌面版 Compose Multiplatform 相同的 UI。

### 如何建立新的 Compose Multiplatform 專案？ {id="how-do-i-create-a-new-compose-multiplatform-project"}

[建立具備共用邏輯與 UI 的 Compose Multiplatform 應用程式](compose-multiplatform-new-project.md)教學提供了建立適用於 Android、iOS 和桌面的 Compose Multiplatform 專案的逐步說明。你也可以觀看 Kotlin 技術傳教士 Sebastian Aigner 在 YouTube 上製作的[教學影片](https://www.youtube.com/watch?v=5_W5YKPShZ4)。

### 使用 Compose Multiplatform 建置應用程式時應該使用哪款 IDE？ {id="what-ide-should-i-use-for-building-apps-with-compose-multiplatform"}

我們建議使用安裝了 [KMP IDE 外掛程式](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform/)的 IntelliJ IDEA 或 Android Studio IDE。

有關更多詳細資訊，請參閱[推薦的 IDE 與程式碼編輯器](recommended-ides.md)。

### 我可以試用展示應用程式嗎？可以在哪裡找到？ {id="can-i-play-with-a-demo-application-where-can-i-find-it"}

你可以試用我們的[範例專案](multiplatform-samples.md)。

### Compose Multiplatform 是否隨附小工具？ {id="does-compose-multiplatform-come-with-widgets"}

是的，Compose Multiplatform 完整支援 [Material 3](https://m3.material.io/) 小工具。

### 我可以在多大程度上自訂 Material 小工具的外觀？ {id="to-what-extent-can-i-customize-the-appearance-of-material-widgets"}

你可以使用 Material 的佈景主題功能來自訂顏色、字型與間距 (paddings)。如果你想打造獨特的設計，也可以建立自訂小工具與版面配置。

### 我可以在現有的 Kotlin Multiplatform 應用程式中共用 UI 嗎？ {id="can-i-share-the-ui-in-my-existing-kotlin-multiplatform-app"}

如果你的應用程式使用原生 API 來建構 UI（這是最常見的情況），你可以逐步將部分內容改寫為 Compose Multiplatform，因為它為此提供了互通性。你可以使用包裝了 Compose 編寫的通用 UI 的特殊互通視圖 (interop view) 來取代原生 UI。

### 我有一個使用 Jetpack Compose 的現有 Android 應用程式，該如何將其遷移至其他平台？ {id="i-have-an-existing-android-application-that-uses-jetpack-compose-what-should-i-do-to-migrate-it-to-other-platforms"}

應用程式的遷移包含兩個部分：遷移 UI 與遷移邏輯。遷移的複雜度取決於應用程式的複雜度以及所使用的 Android 專屬程式庫數量。

有關複雜應用程式遷移的範例，請參閱[將 Jetpack Compose 應用程式遷移至 Kotlin Multiplatform](migrate-from-android.md)指南。

你可以將大部分畫面直接遷移至 Compose Multiplatform 而無需修改。所有 Jetpack Compose 小工具均受支援。然而，某些 API 僅能在 Android 目標平台上運作——它們可能是 Android 專屬的，或者尚未移植到其他平台。例如，資源處理是 Android 專屬的，因此你需要遷移至 [Compose Multiplatform 資源程式庫](compose-multiplatform-resources.md)或使用社群解決方案。有關僅適用於 Android 的元件詳細資訊，請參閱目前的[僅限 Android 的 API 清單](compose-android-only-components.md)。

你需要[將商業邏輯遷移至 Kotlin Multiplatform](multiplatform-integrate-in-existing-app.md)。當你嘗試將程式碼移至共用模組時，使用 Android 相依性的部分將無法編譯，你需要重新編寫它們。

* 你可以改寫使用僅限 Android 相依性的程式碼，改為使用多平台程式庫。某些程式庫可能已經支援 Kotlin Multiplatform，因此不需要做任何修改。請查看 [klibs.io](https://klibs.io/) 目錄或 [KMP-awesome](https://github.com/terrakok/kmp-awesome) 程式庫清單。
* 或者，你可以將通用程式碼與特定平台邏輯分離，並[提供通用介面](multiplatform-connect-to-apis.md)，根據平台的不同進行不同實作。在 Android 上，實作可以使用你現有的功能；而在 iOS 等其他平台上，你需要為這些通用介面提供新的實作。

### 我可以將 Compose 畫面整合到現有的 iOS 應用程式中嗎？ {id="can-i-integrate-compose-screens-into-an-existing-ios-app"}

可以。Compose Multiplatform 支援不同的整合情境。有關與 iOS UI 架構整合的更多資訊，請參閱[與 SwiftUI 整合](compose-swiftui-integration.md)以及[與 UIKit 整合](compose-uikit-integration.md)。

### 我可以將 UIKit 或 SwiftUI 元件整合到 Compose 畫面中嗎？ {id="can-i-integrate-uikit-or-swiftui-components-into-a-compose-screen"}

可以。請參閱[與 SwiftUI 整合](compose-swiftui-integration.md)以及[與 UIKit 整合](compose-uikit-integration.md)。

<!-- Need to revise
### What happens when my mobile OS updates and introduces new platform capabilities? {id="what-happens-when-my-mobile-os-updates-and-introduces-new-platform-capabilities"}

You can use them in platform-specific parts of your codebase once Kotlin supports them. We do our best to support them
in the upcoming Kotlin version. All new Android capabilities provide Kotlin or Java APIs, and wrappers over iOS APIs are
generated automatically.
-->

### 當我的行動作業系統更新並變更系統元件的視覺樣式或行為時，會發生什麼事？ {id="what-happens-when-my-mobile-os-updates-and-changes-the-visual-style-of-the-system-components-or-their-behavior"}

作業系統更新後，你的 UI 將保持不變，因為所有元件都是繪製在畫布上的。如果你在畫面中嵌入原生 iOS 元件，更新可能會影響它們的外觀。

## 未來規劃 {id="future-plans"}

### Kotlin Multiplatform 的未來演進計畫為何？ {id="what-are-the-plans-for-the-kotlin-multiplatform-evolution"}

JetBrains 正投入大量資源，旨在為多平台開發提供最佳體驗，並消除多平台使用者現有的痛點。我們計劃改進 Kotlin Multiplatform 核心技術、與 Apple 生態系統的整合、工具鏈以及我們的 Compose Multiplatform UI 架構。請查看 [Kotlin 藍圖中的多平台小節](https://kotlinlang.org/docs/roadmap.html#kotlin-roadmap-by-subsystem)。

### Compose Multiplatform 何時會達到穩定版 (Stable)？ {id="when-will-compose-multiplatform-become-stable"}

Compose Multiplatform 在 Android、iOS 和桌面平台上已達到穩定 (Stable) 狀態，而基於 Wasm 的 Web 支援則處於 Beta 階段。我們正致力於推出 Web 平台的穩定版本，確切日期將在日後公佈。

有關穩定性狀態的更多資訊，請參閱[支援的平台](supported-platforms.md)。

### Kotlin 和 Compose Multiplatform 未來對 Web 目標的支援情況如何？ {id="what-about-future-support-for-web-targets-in-kotlin-and-compose-multiplatform"}

我們目前正將資源集中在極具潛力的 WebAssembly (Wasm) 上。你可以試用我們全新的 [Kotlin/Wasm 後端](https://kotlinlang.org/docs/wasm-overview.html)以及由 Wasm 驅動的 [Web 版 Compose Multiplatform](https://kotl.in/wasm-compose-example)。

至於 JS 目標平台，Kotlin/JS 後端已達到穩定 (Stable) 狀態。在 Compose Multiplatform 中，由於資源有限，我們已將焦點從 JS Canvas 轉移到我們認為更有前景的 Wasm 上。

我們也提供 Compose HTML（先前稱為 Web 版 Compose Multiplatform）。這是一個專為在 Kotlin/JS 中操作 DOM（文件物件模型）而設計的附加程式庫，其目的並非用於跨平台共用 UI。

### 是否有改善多平台開發工具的計畫？ {id="are-there-any-plans-to-improve-tooling-for-multiplatform-development"}

有的，我們深知目前多平台工具所面臨的挑戰，並正在多個領域積極進行改進。

### 你們打算提供與 Swift 的互通性嗎？ {id="are-you-going-to-provide-swift-interoperability"}

是的。我們目前正在研究提供與 Swift 直接互通的各種方法，重點是將 Kotlin 程式碼匯出至 Swift。