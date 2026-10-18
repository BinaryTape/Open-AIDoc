[//]: # (title: 使用 Kotlin 進行後端開發)

<web-summary>使用 Spring、Ktor 和其他後端架構，透過 Kotlin 建置伺服器應用程式</web-summary>

Kotlin 非常適合用於開發伺服器端應用程式。使用 Kotlin，你可以撰寫簡潔且具表現力的程式碼，同時維持與現有 Java 技術堆疊的完全相容性。

## 開始使用 {id="get-started"}

Kotlin 支援將大型程式碼庫從 Java 漸進式遷移到 Kotlin。你可以開始使用 Kotlin 撰寫測試或新的正式環境程式碼，同時將專案的其他部分保留在 Java 中。

設定你的 Java 專案以與 Kotlin 協同運作，並利用 IntelliJ IDEA 內建的自動化 Java 轉 Kotlin 轉換器：

<a href="mixing-java-kotlin-intellij.md" as="button" mode="rock" icon="arrow-right" icon-position="right">將 Kotlin 引入你的 Java 專案</a>

## 探索架構 {id="explore-frameworks"}

Kotlin 與所有基於 Java 的架構完全相容，因此你可以在享受 Kotlin 語法優勢的同時，繼續使用熟悉的技術堆疊。除了出色的 IDE 支援外，Kotlin 還提供特定架構的專屬工具支援，例如在擁有 Ultimate 訂閱的 IntelliJ IDEA 中對 Spring 與 Ktor 的支援。

### Spring {id="spring"}

[Spring](https://spring.io) 利用 Kotlin 的語言特性來提供更簡潔的 API。[線上專案產生器](https://start.spring.io/#!language=kotlin) 讓你能快速產生一個新的 Kotlin 專案。

<a href="jvm-get-started-spring-boot.md" as="button" mode="rock" icon="arrow-right" icon-position="right">開始使用 Spring Boot 與 Kotlin</a>

### Ktor {id="ktor"}

[Ktor](https://github.com/kotlin/ktor) 是 JetBrains 用於以 Kotlin 建立 Web 應用程式的架構。它使用協同程式來實現高擴充性，並提供易於使用的慣用 API。

<a href="https://ktor.io/docs/server-create-a-new-project.html" as="button" mode="rock" icon="arrow-right" icon-position="right">建立新的 Ktor 專案</a>

### 其他架構 {id="other-frameworks"}

以下是一些適用於 Kotlin 的其他後端架構範例：

| 架構                                                   | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
|--------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Quarkus](https://quarkus.io/guides/kotlin)            | 一個為 Kotlin 提供第一級（first-class）支援的開源架構。Quarkus 從一開始就是專為 Kubernetes 打造，並透過結合數百個頂尖程式庫，提供一個緊密整合的全端架構。                                                                                                                                                                                                                                                   |
| [Vert.x](https://vertx.io)                             | 一個用於在 JVM 上建置反應式 Web 應用程式的架構。Vert.x 為 Kotlin 提供[專屬支援](https://github.com/vert-x3/vertx-lang-kotlin)，包括[整合 Kotlin 協同程式](https://vertx.io/docs/vertx-lang-kotlin-coroutines/kotlin/)。                                                                                                                                                                                                                            |
| [kotlinx.html](https://github.com/kotlin/kotlinx.html) | 一個可用於在 Web 應用程式中建置 HTML 的 DSL。它可作為 JSP 和 FreeMarker 等傳統範本系統的替代方案。                                                                                                                                                                                                                                                                                                                                             |
| [Micronaut](https://micronaut.io/)                     | 一個現代的基於 JVM 的全端架構，用於建置模組化且易於測試的微服務與無伺服器應用程式。觀看在線講座 [Micronaut for microservices with Kotlin](https://micronaut.io/2020/12/03/webinar-micronaut-for-microservices-with-kotlin/)，並探索詳細的[指南](https://guides.micronaut.io/latest/micronaut-kotlin-extension-fns.html)，了解如何在 Micronaut 架構中使用 [Kotlin 擴充函式](extensions.md#extension-functions)。 |
| [http4k](https://http4k.org/)                          | 一個輕量且以純 Kotlin 撰寫的函式式工具套件，適用於 Kotlin HTTP 應用程式。http4k 提供了[支援 CLI 的工具箱](https://toolbox.http4k.org)來產生完整結構的專案樣板，並提供基於 Web 的[專案精靈](https://toolbox.http4k.org/project)，可搭配選定的後端、模組及建置工具來快速啟動可運作的 http4k 應用程式。                                                                                                           |
| [Javalin](https://javalin.io)                          | 一個適用於 Kotlin 和 Java 的超輕量級 Web 架構，支援 WebSocket、HTTP2 和非同步請求。                                                                                                                                                                                                                                                                                                                                                                                      |

## 部署你的應用程式 {id="deploy-your-applications"}

Kotlin 應用程式可以部署到任何支援 Java Web 應用程式的主機，包括 Amazon Web Services (AWS)、Google Cloud Platform (GCP) 等諸多平台。

* **AWS** 提供了專屬的 [SDK for Kotlin](https://docs.aws.amazon.com/sdk-for-kotlin/latest/developer-guide/home.html) 來與其服務互動。對於無伺服器部署，你可以參考 [Kotlin 的 AWS Lambda 程式碼範例](https://docs.aws.amazon.com/sdk-for-kotlin/latest/developer-guide/kotlin_lambda_code_examples.html)。
* **Ktor** 允許你將 Kotlin 應用程式發布到各個雲端服務供應商。例如，你可以參考 Ktor 教學來深入了解如何部署至 [Google App Engine](https://ktor.io/docs/google-app-engine.html) 和其他服務。
* **Spring** 應用程式也與大多數主流雲端服務供應商相容。請參閱 [Spring 官方文件](https://docs.spring.io/spring-boot/how-to/deployment/cloud.html)，了解如何將 Spring Boot 應用程式部署到雲端。

## 加入社群 {id="join-the-community"}

* ![Slack](slack.svg){width=25}{type="joined"} **Kotlin Slack**：[取得邀請](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)並加入 [#spring](https://kotlinlang.slack.com/archives/C0B8ZTWE4) 和 [#server](https://kotlinlang.slack.com/archives/C0B8RC352) 頻道
* ![Stack Overflow](stackoverflow.svg){width=25}{type="joined"} **Stack Overflow**：訂閱 ["kotlin"](https://stackoverflow.com/questions/tagged/kotlin)、["spring-kotlin"](https://stackoverflow.com/questions/tagged/spring-kotlin) 或 ["ktor"](https://stackoverflow.com/questions/tagged/ktor) 標籤
* ![YouTube](youtube.svg){width=25}{type="joined"} **Kotlin YouTube 頻道**：訂閱並觀看關於 [Kotlin 與 Spring](https://www.youtube.com/playlist?list=PLlFc5cFwUnmxOJL0GSSZ1Vot4KL2Vwe7x) 的影片

## 後續步驟 {id="next-steps"}

* [了解如何使用 Kotlin 和 JUnit 測試你的 Java Maven 專案](jvm-test-using-junit.md)
* [探索如何使用 Ktor 建置非同步伺服器應用程式](https://ktor.io/docs/server-create-a-new-project.html)
* [在 Kotlin 後端開發常見問題中尋找常見問題的解答](jvm-backend-faq.md)