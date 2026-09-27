[//]: # (title: 常見問題)

<web-summary>Kotlin 是由 JetBrains 開發的一種簡潔多平台程式語言。</web-summary>

### 什麼是 Kotlin？ {id="what-is-kotlin"}

Kotlin 是一門開源的靜態型別程式語言，目標平台包括 JVM、Android、JavaScript、Wasm 以及 Native。
它由 [JetBrains](https://www.jetbrains.com) 開發。該專案始於 2010 年，並從很早就開始開源。
第一個官方 1.0 版本於 2016 年 2 月發佈。

### Kotlin 的目前版本是什麼？ {id="what-is-the-current-version-of-kotlin"}

目前發佈的版本是 %kotlinVersion%，發佈日期為 %kotlinReleaseDate%。  
您可以在 [GitHub](https://github.com/jetbrains/kotlin) 上找到更多資訊。

### Kotlin 是免費的嗎？ {id="is-kotlin-free"}

是的。Kotlin 是免費的，過去如此，未來也將保持免費。它是在 Apache 2.0 授權下開發的，原始碼可在 [GitHub](https://github.com/jetbrains/kotlin) 上取得。

### Kotlin 是物件導向語言還是函式式語言？ {id="is-kotlin-an-object-oriented-language-or-a-functional-one"}

Kotlin 同時具有物件導向和函式式建構。您可以以 OO 和 FP 風格使用它，或混合使用這兩者的元素。
憑藉對高階函數、函式型別和 Lambda 運算式等特性的原生支援，如果您正在從事或探索函式式程式設計，Kotlin 是一個絕佳的選擇。

### 與 Java 程式語言相比，Kotlin 給了我哪些優勢？ {id="what-advantages-does-kotlin-give-me-over-the-java-programming-language"}

Kotlin 更加簡潔。粗略估計顯示程式碼行數減少了約 40%。
它也更加型別安全——例如，對不可為 null 型別的支援使應用程式不易出現 NPE。
其他特性包括智慧轉換、高階函數、擴充函式以及帶接收者的 Lambda 運算式，提供了編寫具表現力程式碼的能力，並促進了 DSL 的建立。
 
### Kotlin 與 Java 程式語言相容嗎？ {id="is-kotlin-compatible-with-the-java-programming-language"}

是的。Kotlin 與 Java 程式語言 100% 互通，且重點一直放在確保您現有的程式碼庫可以與 Kotlin 正確互動。您可以輕鬆地[從 Java 呼叫 Kotlin 程式碼](java-to-kotlin-interop.md)以及[從 Kotlin 呼叫 Java 程式碼](java-interop.md)。這使得採用變得更加容易且風險更低。IDE 中還內建了自動的 [Java-to-Kotlin 轉換器](mixing-java-kotlin-intellij.md#convert-java-files-to-kotlin)，可簡化現有程式碼的遷移。

### 我可以用 Kotlin 做什麼？ {id="what-can-i-use-kotlin-for"}

Kotlin 可用於任何類型的開發，無論是後端、用戶端 Web、Android 還是多平台程式庫。
隨著 Kotlin/Native 目前正在開發中，對嵌入式系統、macOS 和 iOS 等其他平台的支援也在增加。
人們正將 Kotlin 用於行動和伺服器端應用程式、使用 JavaScript 或 JavaFX 的用戶端，以及資料科學，這僅是其中的一部分可能性。

### 我可以將 Kotlin 用於 Android 開發嗎？ {id="can-i-use-kotlin-for-android-development"}

是的。Kotlin 在 Android 上被支援為一等語言。已有數百個應用程式使用 Kotlin 進行 Android 開發，例如 Basecamp、Pinterest 等。如需更多資訊，請查看 [Android 開發資源](android-overview.md)。

### 我可以將 Kotlin 用於後端開發嗎？ {id="can-i-use-kotlin-for-backend-development"}

是的。Kotlin 與 JVM 100% 相容，因此您可以使用任何現有的架構，例如 Spring Boot、vert.x 或 JSF。此外，還有專門用 Kotlin 編寫的架構，例如 [Ktor](https://github.com/kotlin/ktor)。如需更多資訊，請查看[後端開發概覽](server-overview.md)。

### 我可以將 Kotlin 用於 Web 開發嗎？ {id="can-i-use-kotlin-for-web-development"}

是的。對於後端 Web 開發，Kotlin 與 [Ktor](https://ktor.io/) 和 [Spring](https://spring.io/) 等架構搭配良好，讓您能高效建置伺服器端應用程式。此外，您可以使用 Kotlin/Wasm 進行用戶端 Web 開發。
了解如何[開始使用 Kotlin/Wasm](wasm-get-started.md)。

### 我可以將 Kotlin 用於桌面開發嗎？ {id="can-i-use-kotlin-for-desktop-development"}

是的。您可以使用任何 Java UI 架構，例如 JavaFx、Swing 或其他。
此外，還有 Kotlin 專用的架構，例如 [TornadoFX](https://github.com/edvin/tornadofx)。

### 我可以將 Kotlin 用於原生開發嗎？ {id="can-i-use-kotlin-for-native-development"}

是的。Kotlin/Native 是 Kotlin 的一部分。它將 Kotlin 編譯為可在不含虛擬機的情況下執行的原生程式碼。
您可以在流行的桌面和行動平台，甚至是一些 IoT 裝置上嘗試。
如需更多資訊，請查看 [Kotlin/Native 文件](native-overview.md)。

### 哪些 IDE 支援 Kotlin？ {id="what-ides-support-kotlin"}

Kotlin 在 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 和 [Android Studio](https://developer.android.com/kotlin/get-started) 中擁有完整的開箱即用支援，並配有由 JetBrains 開發的官方 Kotlin 外掛程式。
您也可以安裝官方由 JetBrains 開發的 [Visual Studio Code Kotlin 擴充套件](kotlin-lsp.md#kotlin-in-visual-studio-code)，它由處於 [Alpha](components-stability.md#stability-levels-explained) 階段的 Kotlin 語言伺服器提供技術支援。

其他 IDE 和程式碼編輯器僅有 Kotlin 社群支援的外掛程式。

您也可以嘗試使用 [Kotlin Playground](https://play.kotlinlang.org) 在瀏覽器中編寫、執行和分享 Kotlin 程式碼。
此外，還提供[命令列編譯器](command-line.md)，為編譯和執行應用程式提供簡單直接的支援。
  
### 哪些建置工具支援 Kotlin？ {id="what-build-tools-support-kotlin"}

在 JVM 方面，主要的建置工具包括 [Gradle](gradle.md) 和 [Maven](maven.md)。
還有一些針對用戶端 JavaScript 的建置工具可用。

### Kotlin 會編譯成什麼？ {id="what-does-kotlin-compile-down-to"}

當目標平台為 JVM 時，Kotlin 會產生與 Java 相容的位元組碼。

當目標平台為 JavaScript 時，Kotlin 可根據設定的目標產生 ES5、ES2015 或 ES2020 程式碼。該程式碼與包含 AMD 和 CommonJS 在內的模組系統相容。

當目標平台為 Native 時，Kotlin 將產生特定於平台的程式碼（透過 LLVM）。

### Kotlin 支援哪些版本的 JVM？ {id="which-versions-of-jvm-does-kotlin-target"}

Kotlin 讓您選擇執行的 JVM 版本。預設情況下，Kotlin/JVM 編譯器會產生與 Java 8 相容的位元組碼。
如果您想利用較新版本 Java 中的最佳化，可以明確指定目標 Java 版本（從 9 到 26）。請注意，在這種情況下，產生的位元組碼可能無法在較低版本上執行。
從 [Kotlin 1.5](whatsnew15.md#new-default-jvm-target-1-8) 開始，編譯器不再支援產生與 Java 8 以下版本相容的位元組碼。

### Kotlin 很難嗎？ {id="is-kotlin-hard"}

Kotlin 受到 Java、C#、JavaScript、Scala 和 Groovy 等現有語言的啟發。我們試圖確保 Kotlin 易於學習，以便大家可以輕鬆上手，在幾天內就能閱讀和編寫 Kotlin。
學習慣用的 Kotlin 並使用其更多進階特性可能需要更長的時間，但總體而言它不是一門複雜的語言。  
如需更多資訊，請查看我們的[學習材料](learning-materials-overview.md)。
 
### 哪些公司正在使用 Kotlin？ {id="what-companies-are-using-kotlin"}
 
使用 Kotlin 的公司太多，無法一一列舉，但一些較知名且已公開宣佈使用 Kotlin 的公司（透過部落格文章、GitHub 存儲庫或演講）包括 [Square](https://medium.com/square-corner-blog/square-open-source-loves-kotlin-c57c21710a17)、[Pinterest](https://www.youtube.com/watch?v=mDpnc45WwlI) 以及 [Basecamp](https://signalvnoise.com/svn3/using-kotlin-to-make-android-apis-fun-again/)。
 
### 誰開發了 Kotlin？ {id="who-develops-kotlin"}

Kotlin 由 [JetBrains](https://www.jetbrains.com/) 的工程師團隊開發（目前團隊規模為 100 人以上）。
首席語言設計師是 Michail Zarečenskij。除了核心團隊外，GitHub 上還有超過 250 名外部貢獻者。

### 我在哪裡可以了解更多關於 Kotlin 的資訊？ {id="where-can-i-learn-more-about-kotlin"}

最好的起點是[我們的網站](https://kotlinlang.org)。
要開始使用 Kotlin，您可以安裝[官方 IDE 之一](kotlin-ide.md)或[線上嘗試](https://play.kotlinlang.org)。

### 有關於 Kotlin 的書籍嗎？ {id="are-there-any-books-on-kotlin"}

Kotlin 有許多書籍可供選擇。我們審閱過其中一些，並推薦作為起點。它們列在[書籍](books.md)頁面上。如需更多書籍，請參閱 [kotlin.link](https://kotlin.link/) 上由社群維護的清單。

### 有關於 Kotlin 的線上課程嗎？ {id="are-any-online-courses-available-for-kotlin"}

您可以在透過 JetBrains Academy 的 [Kotlin Core 學習路徑](https://hyperskill.org/tracks?category=4&utm_source=jbkotlin_hs&utm_medium=referral&utm_campaign=kotlinlang-docs&utm_content=button_1&utm_term=22.03.23)建立實際應用程式的同時，學習所有 Kotlin 基本要素。

您還可以參加其他課程：
* [Pluralsight 課程：Getting Started with Kotlin](https://www.pluralsight.com/courses/kotlin-getting-started) 由 Kevin Jones 提供
* [O'Reilly 課程：Introduction to Kotlin Programming](https://www.oreilly.com/library/view/introduction-to-kotlin/9781491964125/) 由 Hadi Hariri 提供

您也可以查看我們 [YouTube 頻道](https://www.youtube.com/c/Kotlin)上的其他教學和內容。

### Kotlin 有社群嗎？ {id="does-kotlin-have-a-community"}

是的！Kotlin 有一個非常活躍的社群。Kotlin 開發人員常聚在 [Kotlin 論壇](https://discuss.kotlinlang.org)、[StackOverflow](https://stackoverflow.com/questions/tagged/kotlin)，更活躍的則在 [Kotlin Slack](https://slack.kotlinlang.org)（截至 2020 年 4 月成員已接近 30,000 人）。

### 有 Kotlin 的相關活動嗎？ {id="are-there-kotlin-events"}
 
是的！現在有許多 User Groups 和 Meetups 專門圍繞 Kotlin。您可以在[網站上找到清單](https://kotlinlang.org/user-groups/user-group-list.html)。
此外，世界各地還有社群組織的 [Kotlin Nights](https://kotlinlang.org/community/events.html) 活動。

### 有 Kotlin 的大會嗎？ {id="is-there-a-kotlin-conference"}

是的！[KotlinConf](https://kotlinconf.com/) 是由 JetBrains 主辦的年度會議，匯集了來自世界各地的開發人員、愛好者和專家，分享他們對 Kotlin 的知識與經驗。

除了技術演講和工作坊，KotlinConf 還提供交流機會、社群互動和社交活動，讓與會者可以與其他 Kotlin 使用者建立聯繫並交換想法。
它是促進 Kotlin 生態系統內協作和社群建設的平台。

Kotlin 也在全球不同的會議中被提及。您可以在網站上找到[即將舉行的演講清單](https://kotlinlang.org/community/talks.html?time=upcoming)。

### Kotlin 在社群媒體上嗎？ {id="is-kotlin-on-social-media"}

是的。
訂閱 [Kotlin YouTube 頻道](https://www.youtube.com/c/Kotlin) 並在 [Twitter](https://twitter.com/kotlin) 或 [Bluesky](https://bsky.app/profile/kotlinlang.org) 上追蹤 Kotlin。

### 還有其他 Kotlin 線上資源嗎？ {id="any-other-online-kotlin-resources"}

網站上有許多[線上資源](https://kotlinlang.org/community/)，包括社群成員編寫的 [Kotlin Digests](https://kotlin.link)、[電子報](http://kotlinweekly.net)、[播客](https://talkingkotlin.com)等。

### 我在哪裡可以取得高解析度的 Kotlin 標誌？ {id="where-can-i-get-an-hd-kotlin-logo"}

標誌可以在[這裡](https://resources.jetbrains.com/storage/products/kotlin/docs/kotlin_logos.zip)下載。
使用標誌時，請遵循封存檔案中 `guidelines.pdf` 裡的簡單規則以及 [Kotlin 品牌使用指南](https://kotlinfoundation.org/guidelines/)。

如需更多資訊，請查看關於 [Kotlin 品牌資產](kotlin-brand-assets.md)的頁面。