[//]: # (title: Kotlin/JavaScript)

Kotlin/JavaScript (Kotlin/JS) 讓您可以將 Kotlin 程式碼、Kotlin 標準函式庫以及任何相容的相依性轉譯為 JavaScript。透過這種方式，您的 Kotlin 應用程式可以在任何支援 JavaScript 的環境中執行。

透過 [Kotlin Multiplatform Gradle 外掛程式](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html) (`kotlin.multiplatform`) 使用 Kotlin/JS，在單一位置配置並管理針對 JavaScript 的 Kotlin 專案。

Kotlin Multiplatform Gradle 外掛程式讓您可以存取各種功能，例如控制應用程式的打包 (bundling) 以及直接從 npm 新增 JavaScript 相依性。若要查看可用配置選項的概覽，請參閱[設定 Kotlin/JS 專案](js-project-setup.md)。

> 目前 Kotlin/JS 的實作針對 [ES5](https://www.ecma-international.org/ecma-262/5.1/)、[ES2015](https://262.ecma-international.org/6.0/) 與 [ES2020](https://262.ecma-international.org/11.0/) 標準。
>
{style="tip"}

## Kotlin/JS 的使用案例 {id="use-cases-for-kotlin-js"}

以下是使用 Kotlin/JS 的一些常見方式：

*  **在前端與 JVM 後端之間共享通用邏輯**

   如果您的後端是使用 Kotlin 或其他 JVM 相容語言編寫的，您可以在 Web 應用程式與後端之間共享通用程式碼。這包括資料傳輸物件 (DTO)、驗證與身份驗證規則、REST API 端點的抽象等等。

*  **在 Android、iOS 與 Web 用戶端之間共享通用邏輯**

   您可以在 Web 介面與 Android 及 iOS 行動應用程式之間共享商業邏輯，同時保持原生的使用者介面。這可以避免重複開發通用的功能，例如 REST API 抽象、使用者身份驗證、表單驗證以及領域模型。

* **使用 Kotlin/JS 建構前端 Web 應用程式**

     使用 Kotlin 開發傳統的 Web 前端，同時與現有的工具和程式庫整合：

     * 如果您熟悉 Android 開發，可以使用基於 Compose 的架構來建構 Web 應用程式，例如 [Kobweb](https://kobweb.varabyte.com/) 或 [Kilua](https://kilua.dev/)。
     * 使用 JetBrains 提供的 [JavaScript 常用程式庫的 Kotlin 包裝函式](https://github.com/JetBrains/kotlin-wrappers)，透過 Kotlin/JS 建構完全型別安全的 React 應用程式。Kotlin 包裝函式 (`kotlin-wrappers`) 為 React 與其他 JavaScript 架構提供了抽象與整合。
       
       這些包裝函式還支援補充性程式庫，例如 [React Redux](https://react-redux.js.org/)、[React Router](https://reactrouter.com/) 與 [styled-components](https://styled-components.com/)。您也可以透過與 JavaScript 生態系統的互通性，使用第三方 React 元件與元件庫。
  
     * 使用 [Kotlin/JS 架構](js-frameworks.md)，這些架構與 Kotlin 生態系統整合，並支援簡潔且具表現力的程式碼。

*  **建構支援舊版瀏覽器的多平台應用程式**

      藉由 Compose Multiplatform，您可以使用 Kotlin 建構應用程式，並在 Web 專案中重複使用行動與桌面使用者介面。雖然 [Kotlin/Wasm](wasm-overview.md) 是此用途的主要目標，但您也可以透過針對 Kotlin/JS 來擴展對舊版瀏覽器的支援。

* **使用 Kotlin/JS 建構伺服器端與無伺服器應用程式**

  Kotlin/JS 中的 Node.js 目標讓您可以在 JavaScript 執行階段建立適用於伺服器端或無伺服器環境的應用程式。這提供了快速的啟動速度與低記憶體使用量。[`kotlinx-nodejs`](https://github.com/Kotlin/kotlinx-nodejs) 程式庫提供了從 Kotlin 對 [Node.js API](https://nodejs.org/docs/latest/api/) 的型別安全存取。

根據您的使用案例，Kotlin/JS 專案可以使用來自 Kotlin 生態系統的相容程式庫，以及來自 JavaScript 與 TypeScript 生態系統的第三方程式庫。 

若要從 Kotlin 程式碼使用第三方程式庫，您可以建立自己的型別安全包裝函式或使用社群維護的包裝函式。此外，您也可以使用 Kotlin/JS 的 [動態型別 (dynamic type)](dynamic-type.md)，這讓您可以跳過嚴格的型別檢查與程式庫包裝函式，但代價是犧牲型別安全性。

Kotlin/JS 也與最常見的模組系統相容：[ESM](https://tc39.es/ecma262/#sec-modules)、[CommonJS](https://nodejs.org/api/modules.html#modules-commonjs-modules)、[UMD](https://github.com/umdjs/umd) 與 [AMD](https://github.com/amdjs/amdjs-api)。這讓您可以[產生與取用模組](js-modules.md)，並以結構化的方式與 JavaScript 生態系統整合。

### 分享您的使用案例 {id="share-your-use-cases"}

[Kotlin/JS 的使用案例](#use-cases-for-kotlin-js)中的列表並未窮舉。歡迎嘗試不同的方法，並找到最適合您專案的方式。

歡迎在 [Kotlin Slack](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up) 的 [#javascript](https://kotlinlang.slack.com/archives/C0B8L3U69) 頻道中，與 Kotlin/JS 社群分享您的使用案例、經驗與問題。

## 開始使用 Kotlin/JS {id="get-started-with-kotlin-js"}

探索開始使用 Kotlin/JS 的基礎知識與初始步驟：

* 如果您是 Kotlin 新手，請先查看[基本語法](basic-syntax.md)並探索 [Kotlin 導覽](kotlin-tour-welcome.md)。
* 查看 [Kotlin/JS 範例專案](#sample-projects-for-kotlin-js)列表以獲取靈感。這些範例包含實用的程式碼片段與模式，可以幫助您開始自己的專案。
* 如果您是 Kotlin/JS 新手，請在探索更進階的主題之前，先從[設定指南](js-project-setup.md)開始。

想要親自嘗試 Kotlin/JS 嗎？

<a href="js-get-started.md" as="button" mode="rock" icon="arrow-right" icon-position="right">開始使用 Kotlin/JS</a>

## Kotlin/JS 範例專案 {id="sample-projects-for-kotlin-js"}

下表列出了一組範例專案，展示了各種 Kotlin/JS 使用案例、架構與程式碼共享策略：

| 專案                                                                                                                           | 描述                                                                                                                                                                                                                                                                                                                      |
|-----------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Spring 與 Angular 之間共享程式碼的 Petclinic](https://github.com/Kotlin/kmp-spring-petclinic/#readme)                   | 展示如何透過共享資料傳輸物件、驗證與身份驗證規則，以及 REST API 端點的抽象，來避免企業級應用程式中的程式碼重複。程式碼在 [Spring Boot](https://spring.io/projects/spring-boot) 後端與 [Angular](https://angular.dev/) 前端之間共享。 |
| [全端研討會內容管理系統 (CMS)](https://github.com/Kotlin/kmp-fullstack-conference-cms/#readme)                                        | 展示多種程式碼共享方式，從最簡單的共享到 [Ktor](https://ktor.io/)、[Jetpack Compose](https://developer.android.com/compose) 與 [Vue.js](https://vuejs.org/) 應用程式之間的全面程式碼共享。                                                                                          |
| [基於 Compose-HTML 的 Kobweb 架構待辦事項 App](https://github.com/varabyte/kobweb-templates/tree/main/examples/todo/#readme) | 展示如何透過重複使用 Android 開發者熟悉的開發方式來建立待辦事項清單應用程式。它建構了一個由 [Kobweb 架構](https://kobweb.varabyte.com/) 驅動的用戶端 UI 應用程式。                                                                                            |
| [Android、iOS 與 Web 之間的簡單邏輯共享](https://github.com/Kotlin/kmp-logic-sharing-simple-example/#readme)          | 包含一個使用 Kotlin 建構具有通用邏輯專案的範本，這些邏輯被取用於 Android ([Jetpack Compose](https://developer.android.com/compose))、iOS ([SwiftUI](https://developer.apple.com/tutorials/swiftui/)) 與 Web ([React](https://react.dev/)) 的平台原生 UI 應用程式中。                      |
| [全端協作待辦事項清單](https://github.com/kotlin-hands-on/jvm-js-fullstack/#readme)                                | 展示如何使用針對 JS 與 JVM 目標的 Kotlin Multiplatform 建立協作工作的待辦事項清單應用程式。後端使用 [Ktor](https://ktor.io/)，前端使用 Kotlin/JS 搭配 React。                                                                                                             |

## Kotlin/JS 架構 {id="kotlin-js-frameworks"}

Kotlin/JS 架構透過提供立即可用的元件、路由、狀態管理以及其他工具來建構現代 Web 應用程式，從而簡化 Web 開發。

[查看由不同作者編寫的可用 Kotlin/JS 架構](js-frameworks.md)。

## 加入 Kotlin/JS 社群 {id="join-the-kotlin-js-community"}

您可以加入官方 [Kotlin Slack](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up) 中的 [#javascript](https://kotlinlang.slack.com/archives/C0B8L3U69) 頻道，與社群及 Kotlin/JS 團隊聊天。

## 下一步 {id="what-s-next"}

* [設定 Kotlin/JS 專案](js-project-setup.md)
* [執行 Kotlin/JS 專案](running-kotlin-js.md)
* [偵錯 Kotlin/JS 程式碼](js-debugging.md)
* [在 Kotlin/JS 中執行測試](js-running-tests.md)