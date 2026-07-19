[//]: # (title: Kotlin Multiplatform 快速入門指南)

## 從何處開始

1. 了解 Kotlin Multiplatform (KMP) 與 Compose Multiplatform (CMP)：
   它們是什麼、其[優勢與使用案例](kmp-overview.md)。
2. [在範例專案中嘗試 KMP](quickstart.md)，查看其組織方式以及如何在不同平台上執行。

## 學習 KMP 基礎知識

基礎知識包括：

* [了解 KMP / CMP 專案的組織方式](multiplatform-discover-project.md)。
  這涵蓋：
    * 共享模組中的通用與平台特定程式碼。
    * 目標平台宣告。
* [為 KMP 專案新增相依性](multiplatform-add-dependencies.md)。
    * 有關多平台與平台特定相依性組織的實際範例，請參閱我們的[範例](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main)。
    * 引導至該範例最終狀態的教學可在[文件中查閱](multiplatform-upgrade-app.md)。
* 如果您已熟悉 KMP，請確保您已掌握一般專案的[推薦專案結構](multiplatform-project-recommended-structure.md)。
  它考量了 Android Gradle plugin 9.0 的發佈如何影響 KMP 專案的需求，並涵蓋：
    * 模組結構（具有作為程式庫使用的共享程式碼模組的獨立應用程式模組）。
    * 建立新的應用程式模組，並從與 AGP 8 搭配使用的舊結構進行轉移。
* 由 JetBrains 技術傳教士錄製的[專案結構建議影片](https://www.youtube.com/watch?v=Atvl0l7fm1Y)。

<!-- ## \[AI Agents scenario tools TODO\] -->

## 共享程式碼

在 KMP 專案中共享程式碼有多種方式，並具有一些平台特性：

* 從應用程式模組呼叫通用程式碼的基礎範例涵蓋在引導教學中：
    * [針對原生 UI 與共享邏輯](multiplatform-create-first-app.md)
    * [針對共享 UI 與邏輯](compose-multiplatform-create-first-app.md)
* [如何存取平台特定 API](multiplatform-connect-to-apis.md)：
    * 盡可能使用多平台程式庫。
    * 當沒有合適的多平台程式庫可用時，請使用 `expect`/`actual` 機制。
* 雖然從 Android Kotlin 呼叫共享 Kotlin 相對直接，但 iOS 互通性需要一些時間來了解：
    * [了解如何將您的共享程式碼與 iOS 應用程式整合](multiplatform-ios-integration-overview.md#local-integration)（本文件中引用的所有範例都有 iOS 整合設定的示例）。
      > CocoaPods 通常正逐漸被 Swift Package Manager 取代，我們不建議在新的專案中使用它。
      >
      {style="note"}   
    * 查看包含讓 Kotlin 協同程式與 iOS 搭配運作的[範例與教學](multiplatform-upgrade-app.md#add-more-dependencies)。
    * 參閱在您的 [KMP iOS 應用程式中使用現有 SPM 套件](multiplatform-spm-import.md)的指南。
    * 閱讀[從 Kotlin 呼叫 Swift / ObjC](https://kotlinlang.org/docs/native-objc-interop.html) 以及反向呼叫的深入說明。
    * 了解更直接的 [Swift export](https://kotlinlang.org/docs/native-swift-export.html) 方法（目前為 Alpha 版本）。
    * 一般而言，互通性越少越好，因此為了獲得更流暢的體驗，我們建議依賴 Compose Multiplatform 為所有平台建置大部分的 UI。

## 探索生態系統

[klibs.io](https://klibs.io/) 提供多平台程式庫的完整型錄：

* 最受歡迎的案例已由強大的解決方案涵蓋，通常也有可用的替代方案：
  資料庫使用 [SQLDelight](https://sqldelight.github.io/sqldelight/) 與 [Room](https://developer.android.com/kotlin/multiplatform/room)，網路連線使用 [Ktor](https://ktor.io/) 與 [OkHttp](https://square.github.io/okhttp/)，圖片載入使用 [Coil](https://coil-kt.github.io/coil/) 等等。
* 提供了針對最熱門使用案例使用多平台程式庫建置的應用程式範例：
    * [SQLDelight / Ktor / kotlinx-serialization / Koin](https://github.com/kotlin-hands-on/kmp-networking-and-data-storage/tree/final) 以及對應的[教學](multiplatform-ktor-sqldelight.md)。
    * 從[原始 Android 範例](https://github.com/android/compose-samples/tree/main/Jetcaster)轉換而來的[多平台 Jetcaster 應用程式](https://github.com/kotlin-hands-on/jetcaster-kmp-migration)。

## 建立 KMP 程式庫

如果您決定透過使用多平台程式庫來建立共享程式碼的應用程式，請查看以下文件頁面：

* [基礎程式庫教學](create-kotlin-multiplatform-library.md)
* [KMP 程式庫的發佈配置](multiplatform-publish-lib-setup.md)
* 將建置產物發佈到 [Maven Central](multiplatform-publish-libraries-to-maven.md) 與 [npm](multiplatform-publish-libraries-to-npm.md) 的教學

## 發佈建置產物

* 閱讀[發佈 KMP 應用程式的通用文章](multiplatform-publish-apps.md)。
* 別忘了 Apple App Store 所要求的[隱私權資訊清單](multiplatform-privacy-manifest.md)。

## 學習資源型錄

所有提到的資源，以及更深入的指南與第三方內容，都收錄在[學習資源](kmp-learning-resources.md)頁面中。