[//]: # (title: 常見問題)

<web-summary>Kotlin 是由 JetBrains 開發的簡潔多平台程式語言。</web-summary>

### 什麼是 Kotlin？ {id="what-is-kotlin"}

Kotlin 是一種開源的靜態型別程式語言，目標平台為 JVM、Android、JavaScript、Wasm 和 Native。
它由 [JetBrains](https://www.jetbrains.com) 開發。該專案始於 2010 年，並在很早期就已開源。
第一個官方 1.0 版本於 2016 年 2 月發佈。

### Kotlin 的目前版本是什麼？ {id="what-is-the-current-version-of-kotlin"}

目前發佈的版本為 %kotlinVersion%，發佈日期為 %kotlinReleaseDate%。  
你可以在 [GitHub 上](https://github.com/jetbrains/kotlin)找到更多資訊。

### Kotlin 是免費的嗎？ {id="is-kotlin-free"}

是的。Kotlin 是免費的，一直以來都是免費的，且將來也會保持免費。它是在 Apache 2.0 授權下開發的，原始碼可在 [GitHub 上](https://github.com/jetbrains/kotlin)取得。

### Kotlin 是物件導向語言還是函式式語言？ {id="is-kotlin-an-object-oriented-language-or-a-functional-one"}

Kotlin 同時具備物件導向和函式式的建構。你可以使用 OO 和 FP 風格，或混合兩者的元素。
憑藉對高階函數、函式型別和 Lambda 等特性的第一級支援，如果你正在進行或探索函式式程式設計，Kotlin 是一個絕佳的選擇。

### 相較於 Java 程式語言，Kotlin 為我帶來哪些優勢？ {id="what-advantages-does-kotlin-give-me-over-the-java-programming-language"}

Kotlin 更為簡潔。粗略估計程式碼行數約可減少 40%。
它也更具型別安全性——例如，對不可為 null 型別的支援讓應用程式較不易發生 NPE。
其他特性包括智慧轉型、高階函數、擴充函式以及帶有接收者的 Lambda，讓你能編寫富有表現力的程式碼，並促進 DSL 的建立。
 
### Kotlin 與 Java 程式語言相容嗎？ {id="is-kotlin-compatible-with-the-java-programming-language"}

是的。Kotlin 與 Java 程式語言 100% 互通，並且特別強調確保現有的程式碼庫能與 Kotlin 良好互動。你可以輕鬆地[從 Java 呼叫 Kotlin 程式碼](java-to-kotlin-interop.md)，以及[從 Kotlin 呼叫 Java 程式碼](java-interop.md)。這使得採用 Kotlin 變得更容易且風險更低。IDE 中還內建了自動化 [Java 轉 Kotlin 轉換器](mixing-java-kotlin-intellij.md#convert-java-files-to-kotlin)，簡化了現有程式碼的遷移。

### 我可以用 Kotlin 做什麼？ {id="what-can-i-use-kotlin-for"}

Kotlin 可用於任何類型的開發，無論是後端、用戶端 Web、Android 還是多平台程式庫。
隨著 Kotlin/Native 的開發，也支援了嵌入式系統、macOS 和 iOS 等其他平台。
人們正將 Kotlin 用於行動裝置和伺服器端應用程式、搭配 JavaScript 或 JavaFX 的用戶端，以及資料科學，這僅是其中的少數幾種可能。

### 我可以用 Kotlin 進行 Android 開發嗎？ {id="can-i-use-kotlin-for-android-development"}

是的。Kotlin 在 Android 上被支援為第一級語言。已有數百個應用程式在 Android 上使用 Kotlin，例如 Basecamp、Pinterest 等。若要了解更多資訊，請查看 [Android 開發資源](android-overview.md)。

### 我可以用 Kotlin 進行後端開發嗎？ {id="can-i-use-kotlin-for-backend-development"}

是的。Kotlin 與 JVM 100% 相容，因此你可以使用任何現有的架構，例如 Spring Boot、vert.x 或 JSF。此外，還有專門以 Kotlin 編寫的架構，例如 [Ktor](https://github.com/kotlin/ktor)。若要了解更多資訊，請查看[後端開發概觀](server-overview.md)。

### 我可以用 Kotlin 進行 Web 開發嗎？ {id="can-i-use-kotlin-for-web-development"}

是的。在後端 Web 開發方面，Kotlin 可以與 [Ktor](https://ktor.io/) 和 [Spring](https://spring.io/) 等架構良好協作，讓你能高效建置伺服器端應用程式。此外，你也可以將 Kotlin/Wasm 用於用戶端 Web 開發。
了解如何[開始使用 Kotlin/Wasm](wasm-get-started.md)。

### 我可以用 Kotlin 進行桌面開發嗎？ {id="can-i-use-kotlin-for-desktop-development"}

是的。你可以使用任何 Java UI 架構，例如 JavaFX、Swing 等。
此外，還有專為 Kotlin 設計的架構，例如 [TornadoFX](https://github.com/edvin/tornadofx)。

### 我可以用 Kotlin 進行原生開發嗎？ {id="can-i-use-kotlin-for-native-development"}

是的。Kotlin/Native 是 Kotlin 的一部分。它將 Kotlin 編譯為可在沒有虛擬機的情況下執行的原生程式碼。
你可以在主流的桌面和行動平台上試用它，甚至是某些物聯網 (IoT) 裝置上。
若要了解更多資訊，請查看 [Kotlin/Native 文件](native-overview.md)。

### 哪些 IDE 支援 Kotlin？ {id="what-ides-support-kotlin"}

Kotlin 在 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 和 [Android Studio](https://developer.android.com/kotlin/get-started) 中享有完整的開箱即用支援，並配有 JetBrains 開發的官方 Kotlin 外掛程式。
你也可以安裝由 Kotlin Language Server 支援且處於 [Alpha](components-stability.md#stability-levels-explained) 階段的官方 [Visual Studio Code 的 Kotlin by JetBrains 擴充套件](kotlin-lsp.md#kotlin-in-visual-studio-code)。

其他 IDE 和程式碼編輯器僅有 Kotlin 社群支援的外掛程式。

你也可以嘗試使用 [Kotlin Playground](https://play.kotlinlang.org) 在瀏覽器中編寫、執行和分享 Kotlin 程式碼。
此外，還提供了一個[命令列編譯器](command-line.md)，為編譯和執行應用程式提供直接的支援。
  
### 哪些建置工具支援 Kotlin？ {id="what-build-tools-support-kotlin"}

在 JVM 方面，主要建置工具包括 [Gradle](gradle.md) 和 [Maven](maven.md)。
還有一些針對用戶端 JavaScript 的建置工具可供使用。

### Kotlin 會編譯成什麼？ {id="what-does-kotlin-compile-down-to"}

當目標為 JVM 時，Kotlin 會產生與 Java 相容的位元組碼。

當目標為 JavaScript 時，Kotlin 可根據設定的目標產生 ES5、ES2015 或 ES2020 程式碼。該程式碼與包括 AMD 和 CommonJS 在內的模組系統相容。

當目標為原生平台時，Kotlin 將產生特定於平台的程式碼（透過 LLVM）。

### Kotlin 支援哪些版本的 JVM？ {id="which-versions-of-jvm-does-kotlin-target"}

Kotlin 讓你能選擇執行時的 JVM 版本。預設情況下，Kotlin/JVM 編譯器會產生與 Java 8 相容的位元組碼。如果你想利用新版本 Java 中提供的最佳化，可以明確指定 9 到 26 之間的目標 Java 版本。請注意，在這種情況下，產生的位元組碼可能無法在較低版本上執行。從 [Kotlin 1.5](whatsnew15.md#new-default-jvm-target-1-8) 開始，編譯器不再支援產生與 Java 8 以下版本相容的位元組碼。

### Kotlin 難學嗎？ {id="is-kotlin-hard"}

Kotlin 受到 Java、C#、JavaScript、Scala 和 Groovy 等現有語言的啟發。我們努力確保 Kotlin 易於學習，以便人們能輕鬆上手，在幾天內就能閱讀和編寫 Kotlin。學習符合慣用寫法的 Kotlin 並使用其更進階的特性可能會需要更長一點的時間，但總體而言，它並不是一門複雜的語言。  
若要了解更多資訊，請查看[我們的學習資源](learning-materials-overview.md)。
 
### 哪些公司正在使用 Kotlin？ {id="what-companies-are-using-kotlin"}
 
使用 Kotlin 的公司不勝枚舉，但一些透過部落格文章、GitHub 存儲庫或演講公開宣佈使用 Kotlin 的知名公司包括 [Square](https://medium.com/square-corner-blog/square-open-source-loves-kotlin-c57c21710a17)、[Pinterest](https://www.youtube.com/watch?v=mDpnc45WwlI) 以及 [Basecamp](https://signalvnoise.com/svn3/using-kotlin-to-make-android-apis-fun-again/)。
 
### 誰在開發 Kotlin？ {id="who-develops-kotlin"}

Kotlin 由 [JetBrains（目前團隊規模超過 100 人）](https://www.jetbrains.com/)的工程師團隊開發。首席語言設計師是 Michail Zarečenskij。除了核心團隊之外，GitHub 上還有超過 250 位外部貢獻者。

### 我可以在哪裡了解更多關於 Kotlin 的資訊？ {id="where-can-i-learn-more-about-kotlin"}

最好的起點是[我們的官方網站](https://kotlinlang.org)。
要開始使用 Kotlin，你可以安裝其中一個[官方 IDE](kotlin-ide.md) 或[線上試用](https://play.kotlinlang.org)。

### 有關於 Kotlin 的書籍嗎？ {id="are-there-any-books-on-kotlin"}

目前有許多關於 Kotlin 的書籍。我們審閱了其中一些，並推薦作為入門起點。它們列在[書籍](books.md)頁面上。若要查看更多書籍，請參閱社群維護的清單：[kotlin.link](https://kotlin.link/)。

### 有 Kotlin 的線上課程嗎？ {id="are-any-online-courses-available-for-kotlin"}

你可以透過 JetBrains Academy 的 [Kotlin Core track](https://hyperskill.org/tracks?category=4&utm_source=jbkotlin_hs&utm_medium=referral&utm_campaign=kotlinlang-docs&utm_content=button_1&utm_term=22.03.23) 一邊建構可運作的應用程式，一邊學習所有 Kotlin 核心知識。

你還可以參加其他一些課程：
* Kevin Jones 的 [Pluralsight 課程：Getting Started with Kotlin](https://www.pluralsight.com/courses/kotlin-getting-started)
* Hadi Hariri 的 [O'Reilly 課程：Introduction to Kotlin Programming](https://www.oreilly.com/library/view/introduction-to-kotlin/9781491964125/)

你也可以查看我們 [YouTube 頻道](https://www.youtube.com/c/Kotlin)上的其他教學和內容。

### Kotlin 有社群嗎？ {id="does-kotlin-have-a-community"}

有的！Kotlin 擁有非常活躍的社群。Kotlin 開發人員常聚集在 [Kotlin 論壇](https://discuss.kotlinlang.org)、[StackOverflow](https://stackoverflow.com/questions/tagged/kotlin)，以及更為活躍的 [Kotlin Slack](https://slack.kotlinlang.org)（截至 2020 年 4 月已接近 30,000 名成員）。

### 有 Kotlin 相關活動嗎？ {id="are-there-kotlin-events"}
 
有的！現在有許多專門圍繞 Kotlin 的使用者群組與聚會。你可以在[網站上找到清單](https://kotlinlang.org/user-groups/user-group-list.html)。此外，世界各地還有社群組織的 [Kotlin Nights](kotlin-night-guidelines.md) 活動。

### 有 Kotlin 研討會嗎？ {id="is-there-a-kotlin-conference"}

有的！[KotlinConf](https://kotlinconf.com/) 是由 JetBrains 主辦的年度大會，匯聚了來自世界各地的開發人員、愛好者和專家，分享他們對 Kotlin 的知識與經驗。

除了技術演講與工作坊外，KotlinConf 還提供交流機會、社群互動以及社交活動，讓與會者能與其他 Kotlin 愛好者建立聯繫並交流想法。它是促進 Kotlin 生態系統內協作與社群建設的平台。

全球各地的不同研討會也都有涵蓋 Kotlin 相關主題。你可以在[網站上找到即將舉行的演講清單](https://kotlinlang.org/community/talks.html?time=upcoming)。

### Kotlin 有社群媒體帳號嗎？ {id="is-kotlin-on-social-media"}

有的。
歡迎訂閱 [Kotlin YouTube 頻道](https://www.youtube.com/c/Kotlin)，並[在 Twitter 上](https://twitter.com/kotlin)或[在 Bluesky 上](https://bsky.app/profile/kotlinlang.org)追蹤 Kotlin。

### 還有其他 Kotlin 線上資源嗎？ {id="any-other-online-kotlin-resources"}

該網站擁有豐富的[線上資源](https://kotlinlang.org/community/)，包括社群成員撰寫的 [Kotlin Digests](https://kotlin.link)、[電子報](http://kotlinweekly.net)、[播客 (Podcast)](https://talkingkotlin.com) 等等。

### 我可以在哪裡取得高解析度 Kotlin 標誌？ {id="where-can-i-get-an-hd-kotlin-logo"}

標誌可在[此處](https://resources.jetbrains.com/storage/products/kotlin/docs/kotlin_logos.zip)下載。
使用標誌時，請遵循封存檔內 `guidelines.pdf` 中的簡易規則以及 [Kotlin 品牌使用準則](https://kotlinfoundation.org/guidelines/)。

若要了解更多資訊，請查看關於 [Kotlin 品牌資產](kotlin-brand-assets.md)的頁面。