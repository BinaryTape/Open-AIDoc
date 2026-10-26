[//]: # (title: 使用 React 與 Kotlin/JS 建構 Web 應用程式 – 教學)

<no-index/>

本教學將引導你了解如何使用 Kotlin/JS 和 [React](https://reactjs.org/) 架構建構瀏覽器應用程式。你將會：

* 完成建構典型 React 應用程式相關的常見任務。
* 探索如何使用 [Kotlin 的 DSL](type-safe-builders.md) 在不犧牲可讀性的情況下，簡潔且一致地表達概念，讓你完全使用 Kotlin 編寫成熟的應用程式。
* 學習如何使用現成的 npm 組建、使用外部程式庫，以及發佈最終應用程式。

輸出成果將會是一個專為 [KotlinConf](https://kotlinconf.com/) 活動打造的 _KotlinConf Explorer_ Web 應用程式，其中包含會議演講的連結。使用者將能在單一頁面上觀看所有演講，並將其標記為已觀看或未觀看。

本教學假設你已具備 Kotlin 的先備知識，以及 HTML 和 CSS 的基礎知識。了解 React 背後的基本概念有助於理解部分範例程式碼，但並非必要條件。

> 你可以在[此處](https://github.com/kotlin-hands-on/web-app-react-kotlin-js-gradle/tree/finished)取得最終應用程式。
>
{style="note"}

## 開始之前 {id="before-you-start"}

1. 下載並安裝最新版本的 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/)。
2. 複製（clone）[專案樣板](https://github.com/kotlin-hands-on/web-app-react-kotlin-js-gradle)並在 IntelliJ IDEA 中開啟。該樣板包含一個基本的 Kotlin Multiplatform Gradle 專案，其中包含所有必要的組態與相依性。

   * `build.gradle.kts` 檔案中的相依性與任務：
   
   ```kotlin
   dependencies {
       // React, React DOM + Wrappers
       implementation(enforcedPlatform("org.jetbrains.kotlin-wrappers:kotlin-wrappers-bom:1.0.0-pre.430"))
       implementation("org.jetbrains.kotlin-wrappers:kotlin-react")
       implementation("org.jetbrains.kotlin-wrappers:kotlin-react-dom")
   
       // Kotlin React Emotion (CSS)
       implementation("org.jetbrains.kotlin-wrappers:kotlin-emotion")
   
       // Video Player
       implementation(npm("react-player", "^2.12.0"))
   
       // Share Buttons
       implementation(npm("react-share", "^4.4.1"))
   
       // Coroutines & serialization
       implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.6.4")
       implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.5.0")
   }
   ```

   * 位於 `src/jsMain/resources/index.html` 的 HTML 樣板頁面，用於插入你在本教學中將會使用的 JavaScript 程式碼：

   ```html
   <!doctype html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <title>Hello, Kotlin/JS!</title>
   </head>
   <body>
       <div id="root"></div>
       <script src="confexplorer.js"></script>
   </body>
   </html>
   ```
   {validate="false"}

   當你建置 Kotlin/JS 專案時，專案會自動將所有程式碼及其相依性打包成一個與專案同名的單一 JavaScript 檔案 `confexplorer.js`。按照典型的 [JavaScript 慣例](https://faqs.skillcrush.com/article/176-where-should-js-script-tags-be-linked-in-html-documents)，body 的內容（包括 `root` div）會優先載入，以確保瀏覽器在執行指令碼之前先載入所有頁面元素。

* 位於 `src/jsMain/kotlin/Main.kt` 的程式碼片段：

   ```kotlin
   import kotlinx.browser.document
   
   fun main() {
       document.bgColor = "red"
   }
   ```

### 執行開發伺服器 {id="run-the-development-server"}

預設情況下，Kotlin Multiplatform Gradle 外掛程式內建支援嵌入式 `webpack-dev-server`，讓你可以直接從 IDE 執行應用程式，無需手動設定任何伺服器。

若要測試程式是否能在瀏覽器中成功執行，請在 IntelliJ IDEA 內的 Gradle 工具視窗中，透過呼叫 `run` 或 `browserDevelopmentRun` 任務（位於 `other` 或 `kotlin browser` 目錄下）來啟動開發伺服器：

![Gradle 任務清單](browser-development-run.png){width=700}

若要從終端執行程式，請改用 `./gradlew run`。

當專案編譯並打包完成後，瀏覽器視窗中將會顯示一個空白的紅色頁面：

![空白紅色頁面](red-page.png){width=700}

### 啟用熱重載 / 連續模式 {id="enable-hot-reload-continuous-mode"}

設定 _[連續編譯 (continuous compilation)](dev-server-continuous-compilation.md)_ 模式，這樣每次進行變更時就不必手動編譯並執行專案。在繼續之前，請確保已停止所有執行中的開發伺服器執行個體。

1. 編輯 IntelliJ IDEA 在首次執行 Gradle `run` 任務後自動產生的執行組態：

   ![編輯執行組態](edit-configurations-continuous.png){width=700}

2. 在 **Run/Debug Configurations** 對話方塊中，將 `--continuous` 選項新增至執行組態的引數中：

   ![啟用連續模式](continuous-mode.png){width=700}

   套用變更後，你可以使用 IntelliJ IDEA 內的 **Run** 按鈕重新啟動開發伺服器。若要從終端執行連續 Gradle 建置，請改用 `./gradlew run --continuous`。

3. 若要測試此功能，請在 Gradle 任務執行期間，將 `Main.kt` 檔案中的頁面顏色變更為藍色：

   ```kotlin
   document.bgColor = "blue"
   ```

   專案隨後會重新編譯，並在重新整理後，瀏覽器頁面將顯示新的顏色。

在開發過程中，你可以讓開發伺服器保持在連續模式下執行。當你進行修改時，它會自動重新建置並重新整理頁面。

> 你可以在[此處](https://github.com/kotlin-hands-on/web-app-react-kotlin-js-gradle/tree/master)的 `master` 分支上找到專案的此狀態。
>
{style="note"}

## 建立 Web 應用程式草稿 {id="create-a-web-app-draft"}

### 使用 React 新增第一個靜態頁面 {id="add-the-first-static-page-with-react"}

若要讓你的應用程式顯示簡單的訊息，請將 `Main.kt` 檔案中的程式碼替換為以下內容：

```kotlin
import kotlinx.browser.document
import react.*
import emotion.react.css
import csstype.Position
import csstype.px
import react.dom.html.ReactHTML.h1
import react.dom.html.ReactHTML.h3
import react.dom.html.ReactHTML.div
import react.dom.html.ReactHTML.p
import react.dom.html.ReactHTML.img
import react.dom.client.createRoot
import kotlinx.serialization.Serializable

fun main() {
    val container = document.getElementById("root") ?: error("Couldn't find root container!")
    createRoot(container).render(Fragment.create {
        h1 {
            +"Hello, React+Kotlin/JS!"
        }
    })
}
```
{validate="false"}

* `render()` 函式指示 [kotlin-react-dom](https://github.com/JetBrains/kotlin-wrappers/tree/master/kotlin-react-dom) 將 [fragment](https://reactjs.org/docs/fragments.html) 內的第一個 HTML 元素轉譯至 `root` 元素中。該元素是樣板中所包含、定義在 `src/jsMain/resources/index.html` 中的容器。
* 內容為 `<h1>` 標題，並使用型別安全的 DSL 來轉譯 HTML。
* `h1` 是一個接受 Lambda 參數的函式。當你在字串常值前加上 `+` 號時，實際上是透過[運算子多載](operator-overloading.md)呼叫了 `unaryPlus()` 函式。它會將字串附加到包圍的 HTML 元素中。

當專案重新編譯後，瀏覽器會顯示此 HTML 頁面：

![HTML 頁面範例](hello-react-js.png){width=700}

### 將 HTML 轉換為 Kotlin 的型別安全 HTML DSL {id="convert-html-to-kotlin-s-typesafe-html-dsl"}

React 的 Kotlin [包裝函式](https://github.com/JetBrains/kotlin-wrappers/blob/master/kotlin-react/README.md) 提供了一個[領域特定語言 (DSL)](type-safe-builders.md)，使得用純 Kotlin 程式碼編寫 HTML 成為可能。這種方式類似於 JavaScript 中的 [JSX](https://reactjs.org/docs/introducing-jsx.html)。然而，由於標記本身是 Kotlin 程式碼，你可以獲得靜態型別語言的所有好處，例如自動補全或型別檢查。

比較你未來的 Web 應用程式的傳統 HTML 程式碼與其在 Kotlin 中的型別安全變體：

<tabs>
<tab title="HTML">

```html
<h1>KotlinConf Explorer</h1>
<div>
    <h3>Videos to watch</h3>
    <p>John Doe: Building and breaking things</p>
    <p>Jane Smith: The development process</p>
    <p>Matt Miller: The Web 7.0</p>
    <h3>Videos watched</h3>
    <p>Tom Jerry: Mouseless development</p>
</div>
<div>
    <h3>John Doe: Building and breaking things</h3>
    <img src="https://via.placeholder.com/640x360.png?text=Video+Player+Placeholder">
</div>
```

</tab>
<tab title="Kotlin">

```kotlin
h1 {
    +"KotlinConf Explorer"
}
div {
    h3 {
        +"Videos to watch"
    }
    p {
        + "John Doe: Building and breaking things"
    }
    p {
        +"Jane Smith: The development process"
    }
    p {
        +"Matt Miller: The Web 7.0"
    }
    h3 {
        +"Videos watched"
    }
    p {
        +"Tom Jerry: Mouseless development"
    }
}
div {
    h3 {
        +"John Doe: Building and breaking things"
    }
    img {
       src = "https://via.placeholder.com/640x360.png?text=Video+Player+Placeholder"
    }
}
```

</tab>
</tabs>

複製 Kotlin 程式碼並更新 `main()` 函式內的 `Fragment.create()` 函式呼叫，替換原先的 `h1` 標籤。

等待瀏覽器重新載入。頁面現在看起來應該如下所示：

![Web 應用程式草稿](website-draft.png){width=700}

### 在標記中使用 Kotlin 結構新增影片 {id="add-videos-using-kotlin-constructs-in-markup"}

使用此 DSL 在 Kotlin 中編寫 HTML 有許多優勢。你可以使用常規的 Kotlin 結構來操作應用程式，例如迴圈、條件式、集合以及字串插值。

現在你可以將寫死的影片清單替換為 Kotlin 物件清單：

1. 在 `Main.kt` 中，建立一個 `Video` [資料類別](data-classes.md)，將所有影片屬性集中在一處：

   ```kotlin
   data class Video(
       val id: Int,
       val title: String,
       val speaker: String,
       val videoUrl: String
   )
   ```

2. 分別填入未觀看影片和已觀看影片的兩個清單。在 `Main.kt` 的檔案層級新增以下宣告：

   ```kotlin
   val unwatchedVideos = listOf(
       Video(1, "Opening Keynote", "Andrey Breslav", "https://youtu.be/PsaFVLr8t4E"),
       Video(2, "Dissecting the stdlib", "Huyen Tue Dao", "https://youtu.be/Fzt_9I733Yg"),
       Video(3, "Kotlin and Spring Boot", "Nicolas Frankel", "https://youtu.be/pSiZVAeReeg")
   )
   
   val watchedVideos = listOf(
       Video(4, "Creating Internal DSLs in Kotlin", "Venkat Subramaniam", "https://youtu.be/JzTeAM8N1-o")
   )
   ```

3. 若要在頁面上使用這些影片，請撰寫一個 Kotlin `for` 迴圈來遍歷未觀看的 `Video` 物件集合。將 "Videos to watch" 下方的三個 `p` 標籤替換為以下程式碼片段：

   ```kotlin
   for (video in unwatchedVideos) {
       p {
           +"${video.speaker}: ${video.title}"
       }
   }
   ```
   
4. 採用相同的方法，修改接在 "Videos watched" 後面的單一標籤程式碼：

   ```kotlin
   for (video in watchedVideos) {
       p {
           +"${video.speaker}: ${video.title}"
       }
   }
   ```

等待瀏覽器重新載入。版面配置應該與之前保持一致。你可以在清單中新增更多影片，以確認迴圈運作正常。

### 使用型別安全的 CSS 新增樣式 {id="add-styles-with-typesafe-css"}

針對 [Emotion](https://emotion.sh/docs/introduction) 程式庫的 [kotlin-emotion](https://github.com/JetBrains/kotlin-wrappers/blob/master/kotlin-emotion/) 包裝函式讓你可以直接在 HTML 與 JavaScript 旁指定 CSS 屬性（甚至是動態屬性）。從概念上講，這類似於 [CSS-in-JS](https://reactjs.org/docs/faq-styling.html#what-is-css-in-js) – 但適用於 Kotlin。使用 DSL 的好處在於你可以使用 Kotlin 程式碼結構來表達格式規則。

本教學的樣板專案已包含使用 `kotlin-emotion` 所需的相依性：

```kotlin
dependencies {
    // ...
    // Kotlin React Emotion (CSS) (chapter 3)
    implementation("org.jetbrains.kotlin-wrappers:kotlin-emotion")
    // ...
}
```

透過 `kotlin-emotion`，你可以在 HTML 元素 `div` 和 `h3` 內指定 `css` 區塊，並在其中定義樣式。

若要將影片播放器移至頁面右上角，請使用 CSS 並調整影片播放器的程式碼（程式碼片段中的最後一個 `div`）：

```kotlin
div {
    css {
        position = Position.absolute
        top = 10.px
        right = 10.px
    }
    h3 {
        +"John Doe: Building and breaking things"
    }
    img {
        src = "https://via.placeholder.com/640x360.png?text=Video+Player+Placeholder"
    }
}
```

歡迎隨意嘗試其他樣式。例如，你可以變更 `fontFamily` 或為 UI 新增一些 `color`。

## 設計應用程式組建 {id="design-app-components"}

React 中的基本建構基塊稱為 _[組建](https://reactjs.org/docs/components-and-props.html)_。組建本身也可以由其他較小的組建複合而成。透過組合組建，你可以建構出整個應用程式。如果你將組建架構設計為通用且可重複使用，就能在應用程式的多個部分中使用它們，而無需重複編寫程式碼或邏輯。

`render()` 函式的內容通常描述了一個基本組建。你應用程式目前的版面配置如下所示：

![目前的版面配置](current-layout.png){width=700}

如果你將應用程式拆解為各個獨立的組建，最終將獲得一個結構更清晰的版面配置，其中每個組建各自處理其職責：

![包含組建的結構化版面配置](structured-layout.png){width=700}

組建封裝了特定的功能。使用組建可縮短原始碼，並使其更易於閱讀與理解。

### 新增主要組建 {id="add-the-main-component"}

若要開始建立應用程式的架構，首先明確指定 `App`，即用於轉譯至 `root` 元素的主要組建：

1. 在 `src/jsMain/kotlin` 資料夾中建立一個新的 `App.kt` 檔案。
2. 在此檔案內新增以下程式碼片段，並將型別安全的 HTML 從 `Main.kt` 移至其中：

   ```kotlin
   import kotlinx.coroutines.async
   import react.*
   import react.dom.*
   import kotlinx.browser.window
   import kotlinx.coroutines.*
   import kotlinx.serialization.decodeFromString
   import kotlinx.serialization.json.Json
   import emotion.react.css
   import csstype.Position
   import csstype.px
   import react.dom.html.ReactHTML.h1
   import react.dom.html.ReactHTML.h3
   import react.dom.html.ReactHTML.div
   import react.dom.html.ReactHTML.p
   import react.dom.html.ReactHTML.img
   
   val App = FC<Props> {
       // 型別安全的 HTML 置於此處，從第一個 h1 標籤開始！
   }
   ```
   
   `FC` 函式用於建立[函式組建](https://reactjs.org/docs/components-and-props.html#function-and-class-components)。

3. 在 `Main.kt` 檔案中，如下更新 `main()` 函式：

   ```kotlin
   fun main() {
       val container = document.getElementById("root") ?: error("Couldn't find root container!")
       createRoot(container).render(App.create())
   }
   ```

   現在程式會建立 `App` 組建的執行個體，並將其轉譯至指定的容器中。

有關 React 概念的更多資訊，請參閱[文件與指南](https://reactjs.org/docs/hello-world.html#how-to-read-this-guide)。

### 擷取清單組建 {id="extract-a-list-component"}

由於 `watchedVideos` 和 `unwatchedVideos` 清單各自包含一系列影片，因此建立單一可重複使用的組建，並僅調整清單中顯示的內容是合理的做法。

`VideoList` 組建遵循與 `App` 組建相同的模式。它使用 `FC` 建置器函式，並包含來自 `unwatchedVideos` 清單的程式碼。

1. 在 `src/jsMain/kotlin` 資料夾中建立一個新的 `VideoList.kt` 檔案，並新增以下程式碼：

   ```kotlin
   import kotlinx.browser.window
   import react.*
   import react.dom.*
   import react.dom.html.ReactHTML.p
   
   val VideoList = FC<Props> {
       for (video in unwatchedVideos) {
           p {
               +"${video.speaker}: ${video.title}"
           }
       }
   }
   ```

2. 在 `App.kt` 中，透過無參數呼叫來使用 `VideoList` 組建：

   ```kotlin
   // . . .

   div {
       h3 {
           +"Videos to watch"
       }
       VideoList()
   
       h3 {
           +"Videos watched"
       }
       VideoList()
   }

   // . . .
   ```

   目前，`App` 組建無法控制 `VideoList` 組建所顯示的內容。因為內容是寫死的，所以你會看到相同的清單出現兩次。

### 新增 props 以在組建之間傳遞資料 {id="add-props-to-pass-data-between-components"}

由於你將重複使用 `VideoList` 組建，因此需要能夠為其填入不同的內容。你可以新增將項目清單作為屬性傳遞給組建的功能。在 React 中，這些屬性稱為 _props_。當 React 中組建的 props 發生變更時，架構會自動重新轉譯該組建。

對於 `VideoList`，你需要一個包含要顯示影片清單的 prop。定義一個介面，用於存放所有可傳遞給 `VideoList` 組建的 props：

1. 在 `VideoList.kt` 檔案中新增以下定義：

   ```kotlin
   external interface VideoListProps : Props {
       var videos: List<Video>
   }
   ```
   [external](js-interop.md#external-modifier) 修飾詞告訴編譯器該介面的實作是在外部提供的，因此它不會嘗試從該宣告產生 JavaScript 程式碼。

2. 調整 `VideoList` 的類別定義，以使用作為參數傳入 `FC` 區塊的 props：

   ```kotlin
   val VideoList = FC<VideoListProps> { props ->
       for (video in props.videos) {
           p {
               key = video.id.toString()
               +"${video.speaker}: ${video.title}"
           }
       }
   }
   ```

   `key` 屬性有助於 React 轉譯器確定當 `props.videos` 的值發生變化時該執行什麼操作。它使用 key 來決定清單中的哪些部分需要重新整理，哪些部分保持不變。你可以在 [React 指南](https://reactjs.org/docs/lists-and-keys.html)中找到更多關於清單與 key 的資訊。

3. 在 `App` 組建中，確保使用正確的屬性具現化子組建。在 `App.kt` 中，將 `h3` 元素下方的兩個迴圈替換為對 `VideoList` 的呼叫，並附帶 `unwatchedVideos` 和 `watchedVideos` 屬性。
   在 Kotlin DSL 中，你在屬於 `VideoList` 組建的區塊內對其進行指派：

   ```kotlin
   h3 {
       +"Videos to watch"
   }
   VideoList {
       videos = unwatchedVideos
   }
   h3 {
       +"Videos watched"
   }
   VideoList {
       videos = watchedVideos
   }
   ```

重新載入後，瀏覽器將顯示清單現在已正確轉譯。

### 讓清單具備互動性 {id="make-the-list-interactive"}

首先，新增一個當使用者點擊清單項目時跳出的警告訊息。在 `VideoList.kt` 中，新增一個 `onClick` 處理常式函式，以使用目前影片觸發警告：

```kotlin
// . . .

p {
    key = video.id.toString()
    onClick = {
        window.alert("Clicked $video!")
    }
    +"${video.speaker}: ${video.title}"
}

// . . .
```

如果你在瀏覽器視窗中點擊其中一個清單項目，將會在如下所示的警告視窗中獲得有關該影片的資訊：

![瀏覽器警告視窗](alert-window.png){width=700}

> 直接將 `onClick` 函式定義為 Lambda 語法非常簡潔，非常適合用於原型設計。然而，由於 Kotlin/JS 中相等性[目前的運作方式](https://youtrack.jetbrains.com/issue/KT-15101)，從效能角度來看，這並不是傳遞點擊處理常式的最佳方式。如果你想要最佳化轉譯效能，請考慮將函式儲存在變數中並進行傳遞。
>
{style="tip"}

### 新增狀態以保留數值 {id="add-state-to-keep-values"}

除了僅向使用者發出警告外，你還可以新增使用 ▶ 三角形醒目提示所選影片的功能。為此，請引入專屬於此組建的_狀態 (state)_。

狀態是 React 的核心概念之一。在現代 React 中（使用所謂的 _Hooks API_），狀態是透過 [`useState` hook](https://reactjs.org/docs/hooks-state.html) 來表示的。

1. 在 `VideoList` 宣告頂部新增以下程式碼：

   ```kotlin
   val VideoList = FC<VideoListProps> { props ->
       var selectedVideo: Video? by useState(null)

   // . . .
   ```
   {validate="false"}

   * `VideoList` 函式組建保留狀態（一個獨立於目前函式呼叫的值）。狀態可為 null，且具有 `Video?` 型別。其預設值為 `null`。
   * 來自 React 的 `useState()` 函式指示架構在函式的多次呼叫之間持續追蹤狀態。例如，即使你指定了預設值，React 也會確保預設值僅在初始時指派。當狀態變更時，組建將根據新狀態重新轉譯。
   * `by` 關鍵字表示 `useState()` 作為[委託屬性](delegated-properties.md)運作。就像操作其他變數一樣，你可以讀取和寫入值。`useState()` 背後的實作負責處理讓狀態正常運作所需的機制。

   若要進一步了解 State Hook，請查看 [React 文件](https://reactjs.org/docs/hooks-state.html)。

2. 將 `VideoList` 組建中的 `onClick` 處理常式和文字修改為如下所示：

   ```kotlin
   val VideoList = FC<VideoListProps> { props ->
       var selectedVideo: Video? by useState(null)
       for (video in props.videos) {
           p {
               key = video.id.toString()
               onClick = {
                   selectedVideo = video
               }
               if (video == selectedVideo) {
                   +"▶ "
               }
               +"${video.speaker}: ${video.title}"
           }
       }
   }
   ```

   * 當使用者點擊某部影片時，其值會被指派給 `selectedVideo` 變數。
   * 當轉譯所選的清單項目時，前面會加上三角形。

你可以在 [React 常見問題](https://reactjs.org/docs/faq-state.html)中找到更多關於狀態管理的詳細資訊。

檢查瀏覽器並點擊清單中的某個項目，以確保一切運作正常。

## 組合組建 {id="compose-components"}

目前，這兩個影片清單各自獨立運作，這意味著每個清單都會各自記錄所選取的影片。即使只有一個播放器，使用者仍可選取兩部影片（一部在未觀看清單中，一部在已觀看清單中）：

![兩個清單中同時選取了兩部影片](two-videos-select.png){width=700}

單一清單無法同時記錄自身內部以及同層清單中所選取的影片。原因在於所選影片並非屬於_清單_狀態，而是屬於_應用程式_狀態。這意味著你需要將狀態從個別組建中_提升 (lift)_ 出來。

### 提升狀態 {id="lift-state"}

React 確保 props 只能從父組建傳遞給其子組建。這樣可以避免組建之間產生緊密耦合。

如果某個組建想要變更同層組建的狀態，它需要透過共同的父組建來實現。此時，該狀態也不再屬於任何子組建，而是屬於上層的父組建。

將狀態從組建遷移至其父組建的過程稱為_提升狀態 (lifting state)_。對於你的應用程式，請將 `currentVideo` 作為狀態新增至 `App` 組建中：

1. 在 `App.kt` 中，將以下內容新增至 `App` 組建定義的頂部：

   ```kotlin
   val App = FC<Props> {
       var currentVideo: Video? by useState(null)
   
       // . . .
   }
   ```

   `VideoList` 組建不再需要追蹤狀態。相反地，它將透過 prop 接收目前影片。

2. 移除 `VideoList.kt` 中的 `useState()` 呼叫。
3. 讓 `VideoList` 組建準備好接收所選影片作為 prop。為此，展開 `VideoListProps` 介面以包含 `selectedVideo`：

   ```kotlin
   external interface VideoListProps : Props {
       var videos: List<Video>
       var selectedVideo: Video?
   }
   ```

4. 變更三角形的條件式，使其使用 `props` 而非 `state`：

   ```kotlin
   if (video == props.selectedVideo) {
       +"▶ "
   }
   ```

### 傳遞處理常式 {id="pass-handlers"}

目前沒有任何方法可以對 prop 指派數值，因此 `onClick` 函式將無法按照目前的設定方式運作。若要變更父組建的狀態，你需要再次提升狀態。

在 React 中，狀態一律由父層流向子層。因此，若要從其中一個子組建變更_應用程式_狀態，你需要將處理使用者互動的邏輯移至父組建，然後將該邏輯作為 prop 傳入。請記住，在 Kotlin 中，變數可以擁有[函式型別](lambdas.md#function-types)。

1. 再次擴充 `VideoListProps` 介面，使其包含一個變數 `onSelectVideo`，該變數是一個接受 `Video` 並傳回 `Unit` 的函式：

   ```kotlin
   external interface VideoListProps : Props {
       // ...
       var onSelectVideo: (Video) -> Unit
   }
   ```

2. 在 `VideoList` 組建中，於 `onClick` 處理常式中使用新的 prop：

   ```kotlin
   onClick = {
       props.onSelectVideo(video)
   }
   ```
   
   現在你可以從 `VideoList` 組建中刪除 `selectedVideo` 變數。

3. 回到 `App` 組建，為兩個影片清單分別傳遞 `selectedVideo` 和 `onSelectVideo` 的處理常式：

   ```kotlin
   VideoList {
       videos = unwatchedVideos // 以及對應的 watchedVideos
       selectedVideo = currentVideo
       onSelectVideo = { video ->
           currentVideo = video
       }
   }
   ```

4. 對已觀看影片清單重複上一個步驟。

切換回瀏覽器，確保選取影片時，選取醒目提示會在兩個清單之間跳轉而不會重複選取。

## 新增更多組建 {id="add-more-components"}

### 擷取影片播放器組建 {id="extract-the-video-player-component"}

現在你可以建立另一個獨立的組建：影片播放器（目前為預留位置圖片）。你的影片播放器需要知道演講標題、演講作者以及影片連結。這些資訊已經包含在每個 `Video` 物件中，因此你可以將其作為 prop 傳入並存取其屬性。

1. 建立一個新的 `VideoPlayer.kt` 檔案，並為 `VideoPlayer` 組建新增以下實作：

   ```kotlin
   import csstype.*
   import react.*
   import emotion.react.css
   import react.dom.html.ReactHTML.button
   import react.dom.html.ReactHTML.div
   import react.dom.html.ReactHTML.h3
   import react.dom.html.ReactHTML.img
   
   external interface VideoPlayerProps : Props {
       var video: Video
   }
   
   val VideoPlayer = FC<VideoPlayerProps> { props ->
       div {
           css {
               position = Position.absolute
               top = 10.px
               right = 10.px
           }
           h3 {
               +"${props.video.speaker}: ${props.video.title}"
           }
           img {
               src = "https://via.placeholder.com/640x360.png?text=Video+Player+Placeholder"              
           }
       }
   }
   ```

2. 由於 `VideoPlayerProps` 介面指定 `VideoPlayer` 組建接受不可為 null 的 `Video`，因此請確保在 `App` 組建中進行相應處理。

   在 `App.kt` 中，將先前影片播放器的 `div` 程式碼片段替換為以下內容：

   ```kotlin
   currentVideo?.let { curr ->
       VideoPlayer {
           video = curr
       }
   }
   ```

   [`let` 作用域函式](scope-functions.md#let) 確保僅在 `state.currentVideo` 不為 null 時才新增 `VideoPlayer` 組建。

現在點擊清單中的項目將會顯示影片播放器，並填入所點擊項目的資訊。

### 新增按鈕並進行連接 {id="add-a-button-and-wire-it"}

為了讓使用者能夠將影片標記為已觀看或未觀看，並在兩個清單之間移動影片，請在 `VideoPlayer` 組建中新增一個按鈕。

由於此按鈕會在兩個不同的清單之間移動影片，因此處理狀態變更的邏輯需要從 `VideoPlayer` 中_提升_出來，並作為 prop 從父層傳入。按鈕的外觀應根據影片是否已觀看而有所不同。這也是你需要作為 prop 傳遞的資訊。

1. 在 `VideoPlayer.kt` 中擴充 `VideoPlayerProps` 介面，以包含針對這兩種情況的屬性：

   ```kotlin
   external interface VideoPlayerProps : Props {
       var video: Video
       var onWatchedButtonPressed: (Video) -> Unit
       var unwatchedVideo: Boolean
   }
   ```

2. 現在你可以將按鈕新增至實際的組建中。將以下程式碼片段複製到 `VideoPlayer` 組建主體中，位於 `h3` 和 `img` 標籤之間：

   ```kotlin
   button {
       css {
           display = Display.block
           backgroundColor = if (props.unwatchedVideo) NamedColor.lightgreen else NamedColor.red
       }
       onClick = {
           props.onWatchedButtonPressed(props.video)
       }
       if (props.unwatchedVideo) {
           +"Mark as watched"
       } else {
           +"Mark as unwatched"
       }
   }
   ```

   藉助可動態變更樣式的 Kotlin CSS DSL，你可以使用基本的 Kotlin `if` 運算式來變更按鈕的顏色。

### 將影片清單移至應用程式狀態 {id="move-video-lists-to-the-application-state"}

現在是時候調整 `App` 組建中 `VideoPlayer` 的使用位置了。點擊按鈕時，影片應從未觀看清單移動到已觀看清單，反之亦然。由於這些清單現在確實會發生變更，請將它們移入應用程式狀態：

1. 在 `App.kt` 中，將以下帶有 `useState()` 呼叫的屬性新增至 `App` 組建頂部：

   ```kotlin
   val App = FC<Props> {
       var currentVideo: Video? by useState(null)
       var unwatchedVideos: List<Video> by useState(listOf(
           Video(1, "Opening Keynote", "Andrey Breslav", "https://youtu.be/PsaFVLr8t4E"),
           Video(2, "Dissecting the stdlib", "Huyen Tue Dao", "https://youtu.be/Fzt_9I733Yg"),
           Video(3, "Kotlin and Spring Boot", "Nicolas Frankel", "https://youtu.be/pSiZVAeReeg")
       ))
       var watchedVideos: List<Video> by useState(listOf(
           Video(4, "Creating Internal DSLs in Kotlin", "Venkat Subramaniam", "https://youtu.be/JzTeAM8N1-o")
       ))

       // . . .
   }
   ```

2. 由於所有展示資料已直接包含在 `watchedVideos` 和 `unwatchedVideos` 的預設值中，因此你不再需要檔案層級的宣告。在 `Main.kt` 中刪除 `watchedVideos` 和 `unwatchedVideos` 的宣告。
3. 將 `App` 組建中屬於影片播放器的 `VideoPlayer` 呼叫點修改為如下所示：

   ```kotlin
   VideoPlayer {
       video = curr
       unwatchedVideo = curr in unwatchedVideos
       onWatchedButtonPressed = {
           if (video in unwatchedVideos) {
               unwatchedVideos = unwatchedVideos - video
               watchedVideos = watchedVideos + video
           } else {
               watchedVideos = watchedVideos - video
               unwatchedVideos = unwatchedVideos + video
           }
       }
   }
   ```

回到瀏覽器，選取一部影片，然後按幾次該按鈕。影片將會在兩個清單之間跳轉。

## 使用來自 npm 的套件 {id="use-packages-from-npm"}

為了讓應用程式更實用，你仍然需要一個能真正播放影片的影片播放器，以及一些能協助使用者分享內容的按鈕。

React 擁有豐富的生態系統，提供大量現成的組建，你可以直接使用它們，而無需親自建構這些功能。

### 新增影片播放器組建 {id="add-the-video-player-component"}

若要將預留位置的影片組建替換為真正的 YouTube 播放器，請使用 npm 中的 `react-player` 套件。它可以播放影片並允許你控制播放器的外觀。

有關該組建的文件和 API 說明，請參閱其在 GitHub 上的 [README](https://www.npmjs.com/package/react-player)。

1. 檢查 `build.gradle.kts` 檔案。`react-player` 套件應該已經包含在內：

   ```kotlin
   dependencies {
       // ...
       // Video Player
       implementation(npm("react-player", "^2.12.0"))
       // ...
   }
   ```

   如你所見，在組建檔案的 `dependencies` 區塊中使用 `npm()` 函式即可將 npm 相依性新增至 Kotlin/JS 專案中。Gradle 外掛程式隨後會負責為你下載並安裝這些相依性。為此，它會使用自帶的 [Yarn](https://yarnpkg.com/) 套件管理員安裝。

2. 若要從 React 應用程式內部使用 JavaScript 套件，必須透過提供[外部宣告](js-interop.md)來告知 Kotlin 編譯器相應的預期結構。

   建立一個新的 `ReactYouTube.kt` 檔案並新增以下內容：

   ```kotlin
   @file:JsModule("react-player")
   @file:JsNonModule
   
   import react.*
   
   @JsName("default")
   external val ReactPlayer: ComponentClass<dynamic>
   ```

   當編譯器看到像 `ReactPlayer` 這樣的外部宣告時，它會假定對應類別的實作是由相依項提供的，且不會為其產生程式碼。

   最後兩行等同於 JavaScript 匯入，如 `require("react-player").default;`。它們告訴編譯器，該組建在執行期肯定符合 `ComponentClass<dynamic>`。

然而，在此設定中，`ReactPlayer` 所接受的 props 泛型型別被設為 `dynamic`。這意味著編譯器將接受任何程式碼，但可能帶來執行期出錯的風險。

更好的替代方案是建立一個 `external interface`，明確指定屬於此外部組建的 props 屬性。你可以在該組建的 [README](https://www.npmjs.com/package/react-player) 中了解 props 的介面。在此範例中，請使用 `url` 和 `controls` 屬性：

1. 透過將 `dynamic` 替換為外部介面來修改 `ReactYouTube.kt` 的內容：

   ```kotlin
   @file:JsModule("react-player")
   @file:JsNonModule
   
   import react.*
   
   @JsName("default")
   external val ReactPlayer: ComponentClass<ReactPlayerProps>
   
   external interface ReactPlayerProps : Props {
       var url: String
       var controls: Boolean
   }
   ```

2. 現在你可以使用新的 `ReactPlayer` 來替換 `VideoPlayer` 組建中的灰色預留位置矩形。在 `VideoPlayer.kt` 中，將 `img` 標籤替換為以下程式碼片段：

   ```kotlin
   ReactPlayer {
       url = props.video.videoUrl
       controls = true
   }
   ```

### 新增社群分享按鈕 {id="add-social-share-buttons"}

分享應用程式內容的簡單方法是提供適用於通訊軟體與電子郵件的社群分享按鈕。你也可以為此使用現成的 React 組建，例如 [react-share](https://github.com/nygardk/react-share/blob/master/README.md)：

1. 檢查 `build.gradle.kts` 檔案。此 npm 程式庫應該已經包含在內：

   ```kotlin
   dependencies {
       // ...
       // Share Buttons
       implementation(npm("react-share", "^4.4.1"))
       // ...
   }
   ```

2. 若要從 Kotlin 使用 `react-share`，你需要撰寫更多基本的外部宣告。[GitHub 上的範例](https://github.com/nygardk/react-share/blob/master/demo/Demo.tsx#L61) 顯示，一個分享按鈕由兩個 React 組建組成，例如 `EmailShareButton` 和 `EmailIcon`。不同類型的分享按鈕與圖示皆具備相同的介面風格。
   你將以先前處理影片播放器的相同方式為每個組建建立外部宣告。

   將以下程式碼新增至新的 `ReactShare.kt` 檔案中：

   ```kotlin
   @file:JsModule("react-share")
   @file:JsNonModule
   
   import react.ComponentClass
   import react.Props
   
   @JsName("EmailIcon")
   external val EmailIcon: ComponentClass<IconProps>
   
   @JsName("EmailShareButton")
   external val EmailShareButton: ComponentClass<ShareButtonProps>
   
   @JsName("TelegramIcon")
   external val TelegramIcon: ComponentClass<IconProps>
   
   @JsName("TelegramShareButton")
   external val TelegramShareButton: ComponentClass<ShareButtonProps>
   
   external interface ShareButtonProps : Props {
       var url: String
   }
   
   external interface IconProps : Props {
       var size: Int
       var round: Boolean
   }
   ```

3. 將新組建新增至應用程式的使用者介面中。在 `VideoPlayer.kt` 中，於 `ReactPlayer` 用法的正上方 `div` 內新增兩個分享按鈕：

   ```kotlin
   // . . .

   div {
       css {
            position = Position.absolute
            top = 10.px
            right = 10.px
        }
       EmailShareButton {
           url = props.video.videoUrl
           EmailIcon {
               size = 32
               round = true
           }
       }
       TelegramShareButton {
           url = props.video.videoUrl
           TelegramIcon {
               size = 32
               round = true
           }
       }
   }

   // . . .
   ```

現在你可以檢查瀏覽器，確認按鈕是否正常運作。點擊按鈕時，應該會出現帶有影片 URL 的_分享視窗_。如果按鈕未顯示或無法運作，你可能需要停用廣告或社群媒體阻擋外掛。

![分享視窗](social-buttons.png){width=700}

歡迎針對 [react-share](https://github.com/nygardk/react-share/blob/master/README.md#features) 中提供的其他社群網路分享按鈕重複此步驟。

## 使用外部 REST API {id="use-an-external-rest-api"}

現在你可以將應用程式中寫死的展示資料替換為來自 REST API 的真實資料。

在本教學中，有一個[小型的 API](https://my-json-server.typicode.com/kotlin-hands-on/kotlinconf-json/videos/1)。它僅提供單一端點 `videos`，並接受數字參數來存取清單中的元素。如果你在瀏覽器中瀏覽該 API，將會看到 API 傳回的物件與 `Video` 物件具有相同的結構。

### 從 Kotlin 使用 JS 功能 {id="use-js-functionality-from-kotlin"}

瀏覽器本身就內建了各式各樣的 [Web API](https://developer.mozilla.org/en-US/docs/Web/API)。你也可以從 Kotlin/JS 中使用它們，因為它開箱即用地包含了這些 API 的包裝函式。其中一個範例是用於發送 HTTP 請求的 [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)。

第一個潛在問題是，像 `fetch()` 這樣的瀏覽器 API 使用[回呼 (callbacks)](https://developer.mozilla.org/en-US/docs/Glossary/Callback_function) 來執行非阻塞操作。當多個回呼需要相繼執行時，它們就必須巢狀嵌套。自然而然地，程式碼會產生大量縮排，越來越多的功能堆疊在一起，使得程式碼難以閱讀。

為了解決這個問題，你可以使用 Kotlin 的協同程式，這是處理此類功能更好的方法。

第二個問題來自於 JavaScript 的動態型別本質。對於從外部 API 傳回的資料型別沒有任何保證。為了解決這個問題，你可以使用 `kotlinx.serialization` 程式庫。

檢查 `build.gradle.kts` 檔案。相關的程式碼片段應該已經存在：

```kotlin
dependencies {
    // . . .

    // Coroutines & serialization
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.6.4")
}
```

### 新增序列化 {id="add-serialization"}

當你呼叫外部 API 時，會收到 JSON 格式的文字，這些文字仍需要轉換為可操作的 Kotlin 物件。

[`kotlinx.serialization`](https://github.com/Kotlin/kotlinx.serialization) 是一個程式庫，讓編寫從 JSON 字串到 Kotlin 物件的此類轉換成為可能。

1. 檢查 `build.gradle.kts` 檔案。對應的程式碼片段應該已經存在：

   ```kotlin
   plugins {
       // . . .
       kotlin("plugin.serialization") version "%kotlinVersion%"
   }
   
   dependencies {
       // . . .

       // Serialization
       implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.5.0")
   }
   ```

2. 作為擷取第一部影片的準備工作，有必要讓序列化程式庫認識 `Video` 類別。在 `Main.kt` 中，將 `@Serializable` 註解新增至其定義：

   ```kotlin
   @Serializable
   data class Video(
       val id: Int,
       val title: String,
       val speaker: String,
       val videoUrl: String
   )
   ```

### 擷取影片 {id="fetch-videos"}

若要從 API 擷取影片，請在 `App.kt`（或新檔案）中新增以下函式：

```kotlin
suspend fun fetchVideo(id: Int): Video {
    val response = window
        .fetch("https://my-json-server.typicode.com/kotlin-hands-on/kotlinconf-json/videos/$id")
        .await()
        .text()
        .await()
    return Json.decodeFromString(response)
}
```

* _掛起函式 (Suspending function)_ `fetch()` 從 API 擷取具有指定 `id` 的影片。此回應可能需要一些時間，因此你呼叫 `await()` 等待結果。接著，使用回呼的 `text()` 會讀取回應的本文內容。然後你再次呼叫 `await()` 等待其完成。
* 在傳回函式的值之前，將其傳遞給 `Json.decodeFromString`（來自 `kotlinx.coroutines` 的函式）。它會將你從請求中收到的 JSON 文字轉換為具有相應欄位的 Kotlin 物件。
* `window.fetch` 函式呼叫會傳回一個 `Promise` 物件。通常你必須定義一個回呼處理常式，一旦 `Promise` 被解析且結果可用時就會呼叫該處理常式。然而，透過協同程式，你可以直接 `await()` 這些 Promise。每當呼叫像 `await()` 這樣的函式時，方法都會暫停（掛起）其執行。一旦 `Promise` 解析完成，執行便會繼續。

為了給使用者提供影片選項，定義 `fetchVideos()` 函式，該函式將從上述相同的 API 中擷取 25 部影片。若要並行執行所有請求，請使用 Kotlin 協同程式提供的 [`async`](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/async.html) 功能：

1. 將以下實作新增至你的 `App.kt`：

   ```kotlin
   suspend fun fetchVideos(): List<Video> = coroutineScope {
       (1..25).map { id ->
           async {
               fetchVideo(id)
           }
       }.awaitAll()
   }
   ```

   遵循[結構化並行 (structured concurrency)](https://kotlinlang.org/docs/coroutines-basics.html#structured-concurrency)原則，該實作包裝在一個 `coroutineScope` 中。接著你可以啟動 25 個非同步任務（每個請求一個）並等待所有任務完成。

2. 現在你可以將資料新增至應用程式中。新增 `mainScope` 的定義，並修改你的 `App` 組建，使其以以下程式碼片段開頭。同時請記得將展示數值替換為 `emptyLists` 執行個體：

   ```kotlin
   val mainScope = MainScope()
   
   val App = FC<Props> {
       var currentVideo: Video? by useState(null)
       var unwatchedVideos: List<Video> by useState(emptyList())
       var watchedVideos: List<Video> by useState(emptyList())
   
       useEffectOnce {
           mainScope.launch {
               unwatchedVideos = fetchVideos()
           }
       }

   // . . .
   ```
   {validate="false"}

   * [`MainScope()`](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-main-scope.html) 是 Kotlin 結構化並行模型的一部分，用於建立供非同步任務執行的作用域。
   * `useEffectOnce` 是另一個 React _hook_（具體而言，是 [useEffect](https://reactjs.org/docs/hooks-effect.html) hook 的簡化版本）。它表示該組建執行了_副作用 (side effect)_。它不僅僅是轉譯自身，還透過網路進行通訊。

檢查你的瀏覽器。應用程式現在應該顯示真實資料：

![從 API 擷取的資料](website-api-data.png){width=700}

當你載入頁面時：

* `App` 組建的程式碼將被叫用。這會啟動 `useEffectOnce` 區塊中的程式碼。
* `App` 組建會以已觀看和未觀看影片的空清單進行轉譯。
* 當 API 請求完成時，`useEffectOnce` 區塊會將結果指派給 `App` 組建的狀態。這會觸發重新轉譯。
* `App` 組建的程式碼將再次被叫用，但 `useEffectOnce` 區塊_不會_再次執行。

如果你想要深入了解協同程式的運作方式，請參閱這篇[協同程式教學](coroutines-and-channels.md)。

## 部署至實際執行環境與雲端 {id="deploy-to-production-and-the-cloud"}

現在是時候將應用程式發佈至雲端，讓其他人也能存取了。

### 打包正式環境組建 {id="package-a-production-build"}

若要在正式模式下打包所有資源，請在 IntelliJ IDEA 中透過工具視窗執行 Gradle 的 `build` 任務，或是執行 `./gradlew build`。這會產生最佳化的專案組建，並套用各種改進功能，例如 DCE（無效程式碼消除）。

建置完成後，你可以在 `/build/dist` 中找到部署所需的所有檔案。其中包含執行應用程式所需的 JavaScript 檔案、HTML 檔案及其他資源。你可以將它們放置在靜態 HTTP 伺服器上、使用 GitHub Pages 提供服務，或是代管在你選擇的雲端服務提供者上。

### 部署至 Heroku {id="deploy-to-heroku"}

Heroku 讓啟動可透過專屬網域存取的應用程式變得相當簡單。他們的免費方案對於開發用途來說已經足夠。

1. [建立帳戶](https://signup.heroku.com/)。
2. [安裝 CLI 用戶端並進行驗證](https://devcenter.heroku.com/articles/heroku-cli)。
3. 在專案根目錄下的終端中執行以下指令，以建立 Git 存放庫並連結 Heroku 應用程式：

   ```bash
   git init
   heroku create
   git add .
   git commit -m "initial commit"
   ```

4. 與在 Heroku 上執行的常規 JVM 應用程式（例如使用 Ktor 或 Spring Boot 編寫的應用程式）不同，你的應用程式會產生需要相應託管的靜態 HTML 頁面和 JavaScript 檔案。你可以調整所需的 buildpack 來正確代管程式：

   ```bash
   heroku buildpacks:set heroku/gradle
   heroku buildpacks:add https://github.com/heroku/heroku-buildpack-static.git
   ```

5. 為了讓 `heroku/gradle` buildpack 正常運作，`build.gradle.kts` 檔案中需要包含一個 `stage` 任務。此任務等同於 `build` 任務，相應的別名已包含在檔案底部：

   ```kotlin
   // Heroku Deployment
   tasks.register("stage") {
       dependsOn("build")
   }
   ```

6. 在專案根目錄中新增一個 `static.json` 檔案以設定 `buildpack-static`。
7. 在檔案中新增 `root` 屬性：

   ```xml
   {
       "root": "build/distributions"
   }
   ```
   {validate="false"}

8. 現在你可以觸發部署，例如執行以下指令：

   ```bash
   git add -A
   git commit -m "add stage task and static content root configuration"
   git push heroku master
   ```

> 如果你是從非 main 分支推送，請調整指令以推送到 `main` 遠端，例如 `git push heroku feature-branch:main`。
>
{style="tip"}

若部署成功，你將會看到供大家在網際網路上存取該應用程式的 URL。

![Web 應用程式部署至實際執行環境](deployment-to-production.png){width=700}

> 你可以在[此處](https://github.com/kotlin-hands-on/web-app-react-kotlin-js-gradle/tree/finished)的 `finished` 分支上找到專案的此狀態。
>
{style="note"}

## 下一步 {id="what-s-next"}

### 新增更多功能 {initial-collapse-state="collapsed" collapsible="true" id="add-more-features"}

你可以將產出的應用程式作為起點，探索 React、Kotlin/JS 等領域中更進階的主題。

* **搜尋**。你可以新增一個搜尋欄位來篩選演講清單 – 例如依標題或依作者篩選。了解 [HTML 表單元素在 React 中如何運作](https://reactjs.org/docs/forms.html)。
* **持久化**。目前，每當頁面重新整理時，應用程式就會遺失觀眾的觀看清單。考慮使用適用於 Kotlin 的 Web 架構（例如 [Ktor](https://ktor.io/)）建構自己的後端。或者，研究[在用戶端儲存資訊](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)的方法。
* **複雜的 API**。網路上有大量的資料集與 API 可供使用。你可以將各種資料引入應用程式中。例如，你可以為[貓咪照片](https://thecatapi.com/)或[免費圖庫 API](https://unsplash.com/developers) 建立視覺化呈現工具。

### 改進樣式：響應式設計與網格 {initial-collapse-state="collapsed" collapsible="true" id="improve-the-style-responsiveness-and-grids"}

應用程式目前的設計非常簡單，在行動裝置或窄視窗上看起來效果欠佳。探索更多 CSS DSL 的用法，讓應用程式更具無障礙性與適應性。

### 加入社群並取得協助 {initial-collapse-state="collapsed" collapsible="true" id="join-the-community-and-get-help"}

回報問題和尋求協助的最佳方式是透過 [kotlin-wrappers 問題追蹤器](https://github.com/JetBrains/kotlin-wrappers/issues)。如果你找不到與你問題相關的票證，請隨時建立新的票證。你也可以加入官方的 [Kotlin Slack](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)，其中設有 `#javascript` 和 `#react` 頻道。

### 進一步了解協同程式 {initial-collapse-state="collapsed" collapsible="true" id="learn-more-about-coroutines"}

如果你有興趣進一步了解如何撰寫並行程式碼，請參閱關於[協同程式](coroutines-and-channels.md)的教學。

### 進一步了解 React {initial-collapse-state="collapsed" collapsible="true" id="learn-more-about-react"}

現在你已經了解了 React 的基本概念及其如何對應至 Kotlin，你可以嘗試將 [React 文件](https://react.dev/learn)中概述的其他概念轉換為 Kotlin 實作。