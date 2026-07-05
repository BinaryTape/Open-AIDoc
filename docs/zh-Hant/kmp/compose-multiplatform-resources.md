[//]: # (title: 資源概覽)

Compose Multiplatform 提供特殊的 `compose-multiplatform-resources` 程式庫和 Gradle 外掛程式支援，用於在所有受支援平台的通用程式碼中存取資源。資源是靜態內容，例如圖片、字型和字串，您可以在應用程式中使用。

在 Compose Multiplatform 中處理資源時，請考慮目前的狀況：

* 幾乎所有資源都是在呼叫者執行緒中同步讀取的。唯一的例外是原始檔案和 [Web 資源](compose-web-resources.md)，它們是非同步讀取的。
* 目前尚不支援將大型原始檔案（例如長影片）作為串流讀取。請使用 [`getUri()`](compose-multiplatform-resources-usage.md#accessing-multiplatform-resources-from-external-libraries) 函式將個別檔案傳遞給系統 API，例如 [kotlinx-io](https://github.com/Kotlin/kotlinx-io) 程式庫。
* 從 1.6.10 開始，只要您使用的是 Kotlin 2.0.0 或更新版本，以及 Gradle 7.6 或更新版本，就可以將資源放置在任何模組或原始碼集中。

若要了解如何在 Compose Multiplatform 中使用資源，請參閱以下關鍵章節：

* [多平台資源的設定與配置](compose-multiplatform-resources-setup.md)

  新增 `resources` 程式庫相依性，並設定您的應用程式應能存取的所有資源。

* [在您的應用程式中使用多平台資源](compose-multiplatform-resources-usage.md)

  了解如何使用自動產生的存取子直接在 UI 程式碼中存取資源。

* [本機資源環境](compose-resource-environment.md)
  
  管理您的應用程式資源環境，例如應用程式內佈景主題和語言。