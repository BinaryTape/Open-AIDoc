[//]: # (title: 使用 React 與 Kotlin/JS 建立 Web 應用程式 – 教學)

<no-index/>

本教學將教導您如何使用 Kotlin/JS 與 [React](https://reactjs.org/) 架構建立瀏覽器應用程式。您將會：

* 完成建立典型 React 應用程式相關的常見任務。
* 探索如何使用 [Kotlin 的 DSL](type-safe-builders.md) 來協助精簡且一致地表達概念，同時不犧牲可讀性，讓您能完全使用 Kotlin 編寫功能齊全的應用程式。
* 學習如何使用現成的 npm 組件、使用外部程式庫，以及發布最終應用程式。

輸出結果將是一個專為 [KotlinConf](https://kotlinconf.com/) 活動設計的 _KotlinConf Explorer_ Web 應用程式，其中包含會議演講的連結。使用者將能在一個頁面上觀看所有演講，並將其標記為已看過或未看過。

本教學假設您已具備 Kotlin 的先備知識以及 HTML 和 CSS 的基礎知識。了解 React 背後的基礎概念可能有助於理解部分範例程式碼，但並非絕對必要。

> 您可以在[此處](https://github.com/kotlin-hands-on/web-app-react-kotlin-js-gradle/tree/finished)取得最終的應用程式。
>
{style="note"}

## 開始之前

1. 下載並安裝最新版本的 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/)。
2. 複製 [專案樣板](https://github.com/kotlin-hands-on/web-app-react-kotlin-js-gradle) 並在 IntelliJ IDEA 中開啟。該樣板包含一個基礎的 Kotlin 多平台 Gradle 專案，並已完成所有必要的配置與相依性設定。

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
       implementation(npm("react-player", "2.12.0"))
   
       // Share Buttons
       implementation(npm("react-share", "4.4.1"))
   
       // Coroutines & serialization
       implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.6.4")
       implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.5.0")
   }
   ```

   * 位於 `src/jsMain/resources/index.html` 的 HTML 樣板頁面，用於插入您在本教學中將使用的 JavaScript 程式碼：

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

   當您建置 Kotlin/JS 專案時，系統會自動將您的所有程式碼及其相依性打包成一個與專案同名的單一 JavaScript 檔案 `confexplorer.js`。根據典型的 [JavaScript 慣例](https://faqs.skillcrush.com/article/176-where-should-js-script-tags-be-linked-in-html-documents)，body 的內容（包括 `root` div）會先載入，以確保瀏覽器在執行指令碼之前已載入所有頁面元素。

* 位於 `src/jsMain/kotlin/Main.kt` 的程式碼片段：

   ```kotlin
   import kotlinx.browser.document
   
   fun main() {
       document.bgColor = "red"
   }
   ```

### 執行開發伺服器

預設情況下，Kotlin 多平台 Gradle 外掛程式支援內嵌的 `webpack-dev-server`，讓您能從 IDE 執行應用程式，而無需手動設定任何伺服器。

要測試程式是否能在瀏覽器中成功執行，請從 IntelliJ IDEA 內的 Gradle 工具視窗呼叫 `run` 或 `browserDevelopmentRun` 任務（位於 `other` 或 `kotlin browser` 目錄下）來啟動開發伺服器：

![Gradle 任務列表](browser-development-run.png){width=700}

若要從終端機執行程式，請改用 `./gradlew run`。

當專案編譯並打包完成後，瀏覽器視窗中將出現一個空白的紅色頁面：

![空白紅色頁面](red-page.png){width=700}

### 啟用熱重載 / 持續模式

配置 _[持續編譯](dev-server-continuous-compilation.md)_ 模式，如此您就不必在每次進行更改時都手動編譯並執行專案。在繼續之前，請確保停止所有正在執行的開發伺服器執行個體。

1. 編輯 IntelliJ IDEA 在第一次執行 Gradle `run` 任務後自動產生的執行配置：

   ![編輯執行配置](edit-configurations-continuous.png){width=700}

2. 在 **執行/偵錯配置** 對話方塊中，於執行配置的引數（arguments）中加入 `--continuous` 選項：

   ![啟用持續模式](continuous-mode.png){width=700}

   套用變更後，您可以使用 IntelliJ IDEA 內的 **執行** 按鈕重新啟動開發伺服器。若要從終端機執行持續的 Gradle 組建，請改用 `./gradlew run --continuous`。

3. 要測試此功能，請在 Gradle 任務執行期間，將 `Main.kt` 檔案中的頁面顏色改為藍色：

   ```kotlin
   document.bgColor = "blue"
   ```

   接著專案會重新編譯，重新載入後瀏覽器頁面將呈現新顏色。

您可以在開發過程中讓開發伺服器保持在持續模式下執行。當您進行更改時，它會自動重新組建並重新載入頁面。

> 您可以在 `master` 分支的[此處](https://github.com/kotlin-hands-on/web-app-react-kotlin-js-gradle/tree/master)找到專案的此狀態。
>
{style="note"}

## 建立 Web 應用程式草稿

### 使用 React 加入第一個靜態頁面

要讓您的應用程式顯示簡單的訊息，請將 `Main.kt` 檔案中的程式碼替換為以下內容：

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

* `render()` 函式指示 [kotlin-react-dom](https://github.com/JetBrains/kotlin-wrappers/tree/master/kotlin-react-dom) 將 [fragment](https://reactjs.org/docs/fragments.html) 內的第一個 HTML 元素渲染到 `root` 元素中。這個元素是定義在樣板隨附的 `src/jsMain/resources/index.html` 中的容器。
* 內容是一個 `<h1>` 標題，並使用型別安全的 DSL 來渲染 HTML。
* `h1` 是一個接受 lambda 參數的函式。當您在字串常值前加上 `+` 號時，實際上是透過 [運算子多載](operator-overloading.md) 呼叫了 `unaryPlus()` 函式。它會將字串附加到所屬的 HTML 元素中。

當專案重新編譯後，瀏覽器會顯示此 HTML 頁面：

![HTML 頁面範例](hello-react-js.png){width=700}

### 將 HTML 轉換為 Kotlin 的型別安全 HTML DSL

React 的 Kotlin [包裝函式](https://github.com/JetBrains/kotlin-wrappers/blob/master/kotlin-react/README.md) 附帶了一個 [領域特定語言 (DSL)](type-safe-builders.md)，可以用純 Kotlin 程式碼編寫 HTML。就此而言，它類似於 JavaScript 的 [JSX](https://reactjs.org/docs/introducing-jsx.html)。然而，由於這些標記是 Kotlin，您可以獲得靜態型別語言的所有好處，例如自動補全或型別檢查。

比較您未來 Web 應用程式的傳統 HTML 程式碼與其在 Kotlin 中的型別安全變體：

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

複製 Kotlin 程式碼並更新 `main()` 函式內的 `Fragment.create()` 函式呼叫，替換先前的 `h1` 標籤。

等待瀏覽器重新載入。頁面現在看起來應該像這樣：

![Web 應用程式草稿](website-draft.png){width=700}

### 使用標記中的 Kotlin 結構加入影片

使用此 DSL 在 Kotlin 中編寫 HTML 有一些優點。您可以使用常規的 Kotlin 結構來操作應用程式，例如迴圈、條件、集合和字串插值。

您現在可以將硬編碼的影片清單替換為 Kotlin 物件清單：

1. 在 `Main.kt` 中，建立一個 `Video` [資料類別](data-classes.md) 以將所有影片屬性保留在一個地方：

   ```kotlin
   data class Video(
       val id: Int,
       val title: String,
       val speaker: String,
       val videoUrl: String
   )
   ```

2. 分別填寫未觀看影片和已觀看影片的兩個清單。在 `Main.kt` 的檔案層級加入這些宣告：

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

3. 要在頁面中使用這些影片，請撰寫一個 Kotlin `for` 迴圈來遍歷未觀看 `Video` 物件的集合。將 "Videos to watch" 下的三個 `p` 標籤替換為以下程式碼片段：

   ```kotlin
   for (video in unwatchedVideos) {
       p {
           +"${video.speaker}: ${video.title}"
       }
   }
   ```
   
4. 對 "Videos watched" 之後的單個標籤也應用同樣的過程進行修改：

   ```kotlin
   for (video in watchedVideos) {
       p {
           +"${video.speaker}: ${video.title}"
       }
   }
   ```

等待瀏覽器重新載入。配置應保持與之前相同。您可以向清單中加入更多影片，以確保迴圈正常運作。

### 使用型別安全的 CSS 加入樣式

用於 [Emotion](https://emotion.sh/docs/introduction) 程式庫的 [kotlin-emotion](https://github.com/JetBrains/kotlin-wrappers/blob/master/kotlin-emotion/) 包裝函式讓您能直接在 HTML 中使用 JavaScript 指定 CSS 屬性（甚至是動態屬性）。從概念上講，這類似於 [CSS-in-JS](https://reactjs.org/docs/faq-styling.html#what-is-css-in-js) —— 但適用於 Kotlin。使用 DSL 的好處是您可以使用 Kotlin 程式碼結構來表達格式化規則。

本教學的專案樣板已經包含了使用 `kotlin-emotion` 所需的相依性：

```kotlin
dependencies {
    // ...
    // Kotlin React Emotion (CSS) (chapter 3)
    implementation("org.jetbrains.kotlin-wrappers:kotlin-emotion")
    // ...
}
```

使用 `kotlin-emotion`，您可以在 HTML 元素 `div` 和 `h3` 內部指定一個 `css` 區塊，在該區塊中定義樣式。

要將影片播放器移至頁面的右上角，請使用 CSS 並調整影片播放器的程式碼（程式碼片段中的最後一個 `div`）：

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

您可以隨意嘗試其他樣式。例如，您可以更改 `fontFamily` 或為 UI 加入一些 `color`。

## 設計應用程式組件

React 中的基本構建塊稱為 _[組件](https://reactjs.org/docs/components-and-props.html)_。組件本身也可以由其他更小的組件組成。透過組合組件，您可以建置應用程式。如果您將組件結構化為通用且可重複使用的，您將能在應用程式的多個部分使用它們，而無需重複程式碼或邏輯。

`render()` 函式的內容通常描述了一個基本組件。您應用程式目前的配置如下所示：

![目前配置](current-layout.png){width=700}

如果您將應用程式拆解為個別組件，您最終將得到一個更有結構的配置，其中每個組件負責其職責：

![具有組件的結構化配置](structured-layout.png){width=700}

組件封裝了特定的功能。使用組件可以縮短原始碼，並使其更易於閱讀和理解。

### 加入主組件

要開始建立應用程式的結構，首先明確指定 `App`，即用於渲染到 `root` 元素的主組件：

1. 在 `src/jsMain/kotlin` 資料夾中建立一個新的 `App.kt` 檔案。
2. 在此檔案中，加入以下程式碼片段，並將 `Main.kt` 中的型別安全 HTML 移入其中：

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
       // 型別安全的 HTML 放在這裡，從第一個 h1 標籤開始！
   }
   ```
   
   `FC` 函式會建立一個 [函式組件](https://reactjs.org/docs/components-and-props.html#function-and-class-components)。

3. 在 `Main.kt` 檔案中，如下更新 `main()` 函式：

   ```kotlin
   fun main() {
       val container = document.getElementById("root") ?: error("Couldn't find root container!")
       createRoot(container).render(App.create())
   }
   ```

   現在，程式會建立 `App` 組件的執行個體，並將其渲染到指定的容器中。

有關 React 概念的更多資訊，請參閱 [文件與指南](https://reactjs.org/docs/hello-world.html#how-to-read-this-guide)。

### 提取清單組件

由於 `watchedVideos` 和 `unwatchedVideos` 清單各包含一個影片清單，因此建立一個單一的可重複使用組件是有意義的，只需調整清單中顯示的內容即可。

`VideoList` 組件遵循與 `App` 組件相同的模式。它使用 `FC` 構建函式，並包含來自 `unwatchedVideos` 清單的程式碼。

1. 在 `src/jsMain/kotlin` 資料夾中建立一個新的 `VideoList.kt` 檔案，並加入以下程式碼：

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

2. 在 `App.kt` 中，透過不帶參數呼叫 `VideoList` 組件來使用它：

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

   目前，`App` 組件無法控制 `VideoList` 組件顯示的內容。它是硬編碼的，因此您會看到相同的清單兩次。

### 加入屬性 (Props) 以在組件之間傳遞資料

由於您將重複使用 `VideoList` 組件，您需要能夠為其填入不同的內容。您可以加入將項目清單作為屬性傳遞給組件的功能。在 React 中，這些屬性稱為 _props_。當 React 中組件的 props 發生變化時，架構會自動重新渲染該組件。

對於 `VideoList`，您需要一個包含要顯示影片清單的 prop。定義一個介面來保存所有可以傳遞給 `VideoList` 組件的 props：

1. 在 `VideoList.kt` 檔案中加入以下定義：

   ```kotlin
   external interface VideoListProps : Props {
       var videos: List<Video>
   }
   ```
   [external](js-interop.md#external-modifier) 修飾符告訴編譯器該介面的實作是由外部提供的，因此它不會嘗試從宣告中產生 JavaScript 程式碼。

2. 調整 `VideoList` 的類別定義，以利用作為參數傳遞到 `FC` 區塊中的 props：

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

   `key` 屬性協助 React 渲染器找出當 `props.videos` 的值發生變化時該怎麼做。它使用鍵值來判斷清單的哪些部分需要重新整理，哪些部分保持不變。您可以在 [React 指南](https://reactjs.org/docs/lists-and-keys.html)中找到更多關於清單與鍵值的資訊。

3. 在 `App` 組件中，確保子組件是使用適當的屬性進行具現化的。在 `App.kt` 中，將 `h3` 元素下方的兩個迴圈替換為 `VideoList` 呼叫，並附帶 `unwatchedVideos` 和 `watchedVideos` 的屬性。
   在 Kotlin DSL 中，您在屬於 `VideoList` 組件的區塊內指派它們：

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

重新載入後，瀏覽器將顯示清單現在已正確渲染。

### 讓清單具有互動性

首先，加入一個當使用者點擊清單項目時跳出的警示訊息。在 `VideoList.kt` 中，加入一個 `onClick` 處理常式函式，觸發帶有目前影片資訊的警示：

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

如果您在瀏覽器視窗中點擊其中一個清單項目，您將會在警示視窗中收到有關該影片的資訊，如下所示：

![瀏覽器警示視窗](alert-window.png){width=700}

> 直接將 `onClick` 函式定義為 lambda 非常精簡，且對於原型設計非常有用。然而，由於 Kotlin/JS 中相等性[目前運作](https://youtrack.jetbrains.com/issue/KT-15101)的方式，從效能角度來看，這並非傳遞點擊處理常式的最優化方式。如果您想優化渲染效能，請考慮將您的函式儲存在變數中並傳遞它們。
>
{style="tip"}

### 加入狀態 (State) 以保存值

與其僅僅警示使用者，您可以加入一些功能，使用 ▶ 三角形醒目提示所選的影片。為此，請引入此組件特有的 _狀態 (state)_。

狀態是 React 中的核心概念之一。在現代 React（使用所謂的 _Hooks API_）中，狀態是使用 [`useState` hook](https://reactjs.org/docs/hooks-state.html) 表達的。

1. 在 `VideoList` 宣告的頂端加入以下程式碼：

   ```kotlin
   val VideoList = FC<VideoListProps> { props ->
       var selectedVideo: Video? by useState(null)

   // . . .
   ```
   {validate="false"}

   * `VideoList` 功能組件保存狀態（一個獨立於目前函式呼叫的值）。狀態是可為 null 的，且具有 `Video?` 型別。其預設值為 `null`。
   * React 的 `useState()` 函式指示架構在函式的多次呼叫之間追蹤狀態。例如，儘管您指定了預設值，React 會確保預設值僅在開始時被指派。當狀態改變時，組件將根據新狀態重新渲染。
   * `by` 關鍵字表示 `useState()` 作為[委派屬性](delegated-properties.md)運作。與任何其他變數一樣，您可以讀取和寫入值。`useState()` 背後的實作負責處理讓狀態運作所需的機制。

   要了解更多關於狀態 Hook 的資訊，請參閱 [React 文件](https://reactjs.org/docs/hooks-state.html)。

2. 更改 `VideoList` 組件中的 `onClick` 處理常式和文字，如下所示：

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

   * 當使用者點擊影片時，其值會被指派給 `selectedVideo` 變數。
   * 當渲染選取的清單專案時，會在前面加上三角形。

您可以在 [React 常見問題](https://reactjs.org/docs/faq-state.html)中找到更多關於狀態管理的詳細資訊。

檢查瀏覽器並點擊清單中的項目，確保一切運作正常。

## 組合組件

目前，這兩個影片清單各自獨立運作，這意味著每個清單都追蹤一個選取的影片。使用者可以選取兩個影片，一個在未觀看清單中，另一個在已觀看清單中，儘管只有一個播放器：

![兩個清單中同時選取了兩個影片](two-videos-select.png){width=700}

清單無法同時追蹤其內部以及同級清單中選取了哪個影片。原因是選取的影片不屬於 _清單_ 狀態的一部分，而是屬於 _應用程式_ 狀態。這意味著您需要從個別組件中 _提升 (lift)_ 狀態。

### 提升狀態 (Lift state)

React 確保 props 只能從父組件傳遞給其子組件。這可以防止組件之間被硬連線在一起。

如果一個組件想要更改同級組件的狀態，它必須透過其父組件來實現。屆時，狀態也不再屬於任何子組件，而是屬於整體的父組件。

將狀態從組件遷移到其父組件的過程稱為 _提升狀態 (lifting state)_。對於您的應用程式，將 `currentVideo` 作為狀態加入 `App` 組件中：

1. 在 `App.kt` 中，在 `App` 組件定義的頂端加入以下內容：

   ```kotlin
   val App = FC<Props> {
       var currentVideo: Video? by useState(null)
   
       // . . .
   }
   ```

   `VideoList` 組件不再需要追蹤狀態。它將改為透過 prop 接收目前影片。

2. 移除 `VideoList.kt` 中的 `useState()` 呼叫。
3. 準備讓 `VideoList` 組件接收選取的影片作為 prop。為此，擴充 `VideoListProps` 介面以包含 `selectedVideo`：

   ```kotlin
   external interface VideoListProps : Props {
       var videos: List<Video>
       var selectedVideo: Video?
   }
   ```

4. 更改三角形的條件，使其使用 `props` 而非 `state`：

   ```kotlin
   if (video == props.selectedVideo) {
       +"▶ "
   }
   ```

### 傳遞處理常式

目前，無法為 prop 指派值，因此 `onClick` 函式將無法按照目前的設定運作。要更改父組件的狀態，您需要再次提升狀態。

在 React 中，狀態總是從父級流向子級。因此，要從其中一個子組件更改 _應用程式_ 狀態，您需要將處理使用者互動的邏輯移動到父組件，然後將該邏輯作為 prop 傳入。請記住，在 Kotlin 中，變數可以具有[函式型別](lambdas.md#function-types)。

1. 再次擴充 `VideoListProps` 介面，使其包含一個 `onSelectVideo` 變數，這是一個接收 `Video` 並回傳 `Unit` 的函式：

   ```kotlin
   external interface VideoListProps : Props {
       // ...
       var onSelectVideo: (Video) -> Unit
   }
   ```

2. 在 `VideoList` 組件中，在 `onClick` 處理常式中使用新的 prop：

   ```kotlin
   onClick = {
       props.onSelectVideo(video)
   }
   ```
   
   您現在可以從 `VideoList` 組件中刪除 `selectedVideo` 變數。

3. 回到 `App` 組件，為兩個影片清單分別傳遞 `selectedVideo` 和一個 `onSelectVideo` 處理常式：

   ```kotlin
   VideoList {
       videos = unwatchedVideos // 以及對應的 watchedVideos
       selectedVideo = currentVideo
       onSelectVideo = { video ->
           currentVideo = video
       }
   }
   ```

4. 為已觀看影片清單重複上一個步驟。

切換回瀏覽器，確保在選取影片時，選取狀態會在兩個清單之間跳轉而不會重複。

## 加入更多組件

### 提取影片播放器組件

您現在可以建立另一個獨立的組件：影片播放器，目前它只是一張占位圖片。您的影片播放器需要知道演講標題、演講作者以及影片連結。這些資訊已經包含在每個 `Video` 物件中，因此您可以將其作為 prop 傳遞並存取其屬性。

1. 建立一個新的 `VideoPlayer.kt` 檔案，並為 `VideoPlayer` 組件加入以下實作：

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

2. 由於 `VideoPlayerProps` 介面指定 `VideoPlayer` 組件接收一個不可為 null 的 `Video`，請確保在 `App` 組件中進行相應處理。

   在 `App.kt` 中，將先前影片播放器的 `div` 程式碼片段替換為以下內容：

   ```kotlin
   currentVideo?.let { curr ->
       VideoPlayer {
           video = curr
       }
   }
   ```

   [`let` 作用域函式](scope-functions.md#let) 確保僅當 `state.currentVideo` 不為 null 時才加入 `VideoPlayer` 組件。

現在，點擊清單中的專案將啟動影片播放器，並根據點擊專案的資訊填入內容。

### 加入按鈕並進行連動

為了讓使用者能夠將影片標記為已看過或未看過，並在兩個清單之間移動影片，請在 `VideoPlayer` 組件中加入一個按鈕。

由於此按鈕將在兩個不同的清單之間移動影片，因此處理狀態變化的邏輯需要從 `VideoPlayer` 中 _提升_，並從父組件作為 prop 傳入。按鈕應根據影片是否已觀看而顯示不同內容。這也是您需要作為 prop 傳遞的資訊。

1. 擴充 `VideoPlayer.kt` 中的 `VideoPlayerProps` 介面，以包含這兩種情況的屬性：

   ```kotlin
   external interface VideoPlayerProps : Props {
       var video: Video
       var onWatchedButtonPressed: (Video) -> Unit
       var unwatchedVideo: Boolean
   }
   ```

2. 您現在可以將按鈕加入實際組件中。將以下程式碼片段複製到 `VideoPlayer` 組件的主體中，位於 `h3` 和 `img` 標籤之間：

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

   借助能動態更改樣式的 Kotlin CSS DSL，您可以使用基本的 Kotlin `if` 運算式來更改按鈕的顏色。

### 將影片清單移動到應用程式狀態

現在是調整 `App` 組件中 `VideoPlayer` 使用位置的時候了。當按鈕被點擊時，影片應從未觀看清單移至已觀看清單，反之亦然。由於這些清單現在實際上會發生變化，請將它們移動到應用程式狀態中：

1. 在 `App.kt` 中，將以下帶有 `useState()` 呼叫的屬性加入 `App` 組件的頂端：

   ```kotlin
   val App = FC<Props> {
       var currentVideo: Video? by useState(null)
       var unwatchedVideos: `List<Video>` by useState(listOf(
           Video(1, "Opening Keynote", "Andrey Breslav", "https://youtu.be/PsaFVLr8t4E"),
           Video(2, "Dissecting the stdlib", "Huyen Tue Dao", "https://youtu.be/Fzt_9I733Yg"),
           Video(3, "Kotlin and Spring Boot", "Nicolas Frankel", "https://youtu.be/pSiZVAeReeg")
       ))
       var watchedVideos: `List<Video>` by useState(listOf(
           Video(4, "Creating Internal DSLs in Kotlin", "Venkat Subramaniam", "https://youtu.be/JzTeAM8N1-o")
       ))

       // . . .
   }
   ```

2. 由於所有展示資料都直接包含在 `watchedVideos` 和 `unwatchedVideos` 的預設值中，您不再需要檔案層級的宣告。在 `Main.kt` 中，刪除 `watchedVideos` 和 `unwatchedVideos` 的宣告。
3. 更改 `App` 組件中屬於影片播放器的 `VideoPlayer` 呼叫位置，使其如下所示：

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

回到瀏覽器，選取一段影片，然後按幾次按鈕。影片將在兩個清單之間跳轉。

## 使用來自 npm 的套件

為了讓應用程式實用，您仍然需要一個真正能播放影片的影片播放器，以及一些能幫助人們分享內容的按鈕。

React 擁有豐富的生態系統，其中包含許多現成的組件，您可以使用它們，而無需自己構建這些功能。

### 加入影片播放器組件

要將占位影片組件替換為實際的 YouTube 播放器，請使用 npm 的 `react-player` 套件。它可以播放影片並讓您控制播放器的外觀。

有關組件文件與 API 說明，請參閱其在 GitHub 上的 [README](https://www.npmjs.com/package/react-player)。

1. 檢查 `build.gradle.kts` 檔案。`react-player` 套件應該已經包含在內：

   ```kotlin
   dependencies {
       // ...
       // Video Player
       implementation(npm("react-player", "2.12.0"))
       // ...
   }
   ```

   如您所見，透過在組建檔案的 `dependencies` 區塊中使用 `npm()` 函式，可以將 npm 相依性加入 Kotlin/JS 專案。Gradle 外掛程式隨後會為您處理下載並安裝這些相依性的工作。為此，它使用其內建安裝的 [Yarn](https://yarnpkg.com/) 封裝管理員。

2. 要在 React 應用程式內部使用 JavaScript 套件，必須透過提供 [外部宣告 (external declarations)](js-interop.md) 來告訴 Kotlin 編譯器該預期什麼。

   建立一個新的 `ReactYouTube.kt` 檔案並加入以下內容：

   ```kotlin
   @file:JsModule("react-player")
   @file:JsNonModule
   
   import react.*
   
   @JsName("default")
   external val ReactPlayer: ComponentClass<dynamic>
   ```

   當編譯器看到像 `ReactPlayer` 這樣的外部宣告時，它會假設對應類別的實作是由相依性提供的，而不會為其產生程式碼。

   最後兩行相當於 JavaScript 的匯入，例如 `require("react-player").default;`。它們告訴編譯器，在執行階段組件肯定會符合 `ComponentClass<dynamic>`。

然而，在這種配置下，`ReactPlayer` 接受的 props 的泛型型別被設定為 `dynamic`。這意味著編譯器將接受任何程式碼，但存在於執行階段發生錯誤的風險。

更好的替代方案是建立一個 `external interface`，指定屬於此外部組件的 props 的屬性類型。您可以在組件的 [README](https://www.npmjs.com/package/react-player) 中了解 props 的介面。在這種情況下，使用 `url` 和 `controls` 屬性：

1. 透過將 `dynamic` 替換為外部介面來調整 `ReactYouTube.kt` 的內容：

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

2. 您現在可以使用新的 `ReactPlayer` 替換 `VideoPlayer` 組件中的灰色占位矩形。在 `VideoPlayer.kt` 中，將 `img` 標籤替換為以下程式碼片段：

   ```kotlin
   ReactPlayer {
       url = props.video.videoUrl
       controls = true
   }
   ```

### 加入社群分享按鈕

分享應用程式內容的一種簡單方法是為通訊軟體和電子郵件提供社群分享按鈕。您也可以為此使用現成的 React 組件，例如 [react-share](https://github.com/nygardk/react-share/blob/master/README.md)：

1. 檢查 `build.gradle.kts` 檔案。此 npm 程式庫應該已經包含在內：

   ```kotlin
   dependencies {
       // ...
       // Share Buttons
       implementation(npm("react-share", "4.4.1"))
       // ...
   }
   ```

2. 要在 Kotlin 中使用 `react-share`，您需要撰寫更多基礎的外部宣告。[GitHub 上的範例](https://github.com/nygardk/react-share/blob/master/demo/Demo.tsx#L61) 顯示一個分享按鈕由兩個 React 組件組成：例如 `EmailShareButton` 和 `EmailIcon`。不同類型的分享按鈕和圖示都具有相同類型的介面。
   您將以與處理影片播放器相同的方式，為每個組件建立外部宣告。

   將以下程式碼加入新的 `ReactShare.kt` 檔案中：

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

3. 在應用程式的使用者介面中加入新組件。在 `VideoPlayer.kt` 中，在 `ReactPlayer` 的上方加入一個包含兩個分享按鈕的 `div`：

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

您現在可以檢查瀏覽器，看看按鈕是否真的有效。點擊按鈕時，應該會出現一個帶有影片 URL 的 _分享視窗_。如果按鈕沒有顯示或無法運作，您可能需要停用廣告和社群媒體攔截器。

![分享視窗](social-buttons.png){width=700}

您可以隨意為 [react-share](https://github.com/nygardk/react-share/blob/master/README.md#features) 中提供的其他社群網絡重複此步驟以加入更多分享按鈕。

## 使用外部 REST API

您現在可以將硬編碼的展示資料替換為來自應用程式中 REST API 的真實資料。

在本教學中，有一個[小型 API](https://my-json-server.typicode.com/kotlin-hands-on/kotlinconf-json/videos/1)。它僅提供一個端點 `videos`，並接收一個數字參數來存取清單中的元素。如果您使用瀏覽器造訪該 API，您會發現從 API 回傳的物件與 `Video` 物件具有相同的結構。

### 從 Kotlin 使用 JS 功能

瀏覽器已經配備了多種 [Web API](https://developer.mozilla.org/en-US/docs/Web/API)。您也可以從 Kotlin/JS 使用它們，因為它開箱即用地包含了這些 API 的包裝函式。其中一個例子是用於發送 HTTP 請求的 [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)。

第一個潛在問題是，像 `fetch()` 這樣的瀏覽器 API 使用 [回呼 (callbacks)](https://developer.mozilla.org/en-US/docs/Glossary/Callback_function) 來執行非阻塞操作。當多個回呼需要接連執行時，它們需要被巢狀化。自然地，程式碼會變得縮排非常深，越來越多的功能堆疊在一起，使其難以閱讀。

為了克服這個問題，您可以使用 Kotlin 的協同程式，這對於此類功能是更好的方法。

第二個問題源於 JavaScript 的動態型別本質。無法保證從外部 API 回傳的資料型別。為了解決這個問題，您可以使用 `kotlinx.serialization` 程式庫。

檢查 `build.gradle.kts` 檔案。相關的程式碼片段應該已經存在：

```kotlin
dependencies {
    // . . .

    // Coroutines & serialization
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.6.4")
}
```

### 加入序列化

當您呼叫外部 API 時，您會獲得 JSON 格式的文字，仍需將其轉換為可供操作的 Kotlin 物件。

[`kotlinx.serialization`](https://github.com/Kotlin/kotlinx.serialization) 是一個讓這類從 JSON 字串到 Kotlin 物件的轉換變得可能的程式庫。

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

2. 作為獲取第一段影片的準備，必須告訴序列化程式庫關於 `Video` 類別的資訊。在 `Main.kt` 中，在其定義中加入 `@Serializable` 註解：

   ```kotlin
   @Serializable
   data class Video(
       val id: Int,
       val title: String,
       val speaker: String,
       val videoUrl: String
   )
   ```

### 獲取影片

要從 API 獲取影片，請在 `App.kt`（或新檔案）中加入以下函式：

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

* _暫停函式 (Suspending function)_ `fetch()` 從 API 獲取具有指定 `id` 的影片。此回應可能需要一段時間，因此您需要 `await()` 結果。接下來，使用回呼的 `text()` 從回應中讀取主體。然後您 `await()` 其完成。
* 在回傳函式值之前，將其傳遞給 `Json.decodeFromString`，這是來自 `kotlinx.coroutines` 的函式。它會將您從請求中收到的 JSON 文字轉換為具有適當欄位的 Kotlin 物件。
* `window.fetch` 函式呼叫會回傳一個 `Promise` 物件。您通常必須定義一個回呼處理常式，該處理常式在 `Promise` 被解析且結果可用時被呼叫。然而，使用協同程式，您可以 `await()` 這些 Promise。每當呼叫像 `await()` 這樣的函式時，方法會停止（暫停）執行。一旦 `Promise` 被解析，其執行就會繼續。

為了給使用者提供影片選取，請定義 `fetchVideos()` 函式，它將從上述相同的 API 獲取 25 段影片。要同時執行所有請求，請使用 Kotlin 協同程式提供的 [`async`](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/async.html) 功能：

1. 在您的 `App.kt` 中加入以下實作：

   ```kotlin
   suspend fun fetchVideos(): `List<Video>` = coroutineScope {
       (1..25).map { id ->
           async {
               fetchVideo(id)
           }
       }.awaitAll()
   }
   ```

   遵循 [結構化並行 (structured concurrency)](https://kotlinlang.org/docs/coroutines-basics.html#structured-concurrency) 的原則，該實作被封裝在一個 `coroutineScope` 中。您可以隨後啟動 25 個非同步任務（每個請求一個）並等待所有任務完成。

2. 您現在可以將資料加入應用程式中。加入 `mainScope` 的定義，並更改您的 `App` 組件使其以以下程式碼片段開始。同時，別忘了將展示用的值替換為 `emptyLists` 執行個體：

   ```kotlin
   val mainScope = MainScope()
   
   val App = FC<Props> {
       var currentVideo: Video? by useState(null)
       var unwatchedVideos: `List<Video>` by useState(emptyList())
       var watchedVideos: `List<Video>` by useState(emptyList())
   
       useEffectOnce {
           mainScope.launch {
               unwatchedVideos = fetchVideos()
           }
       }

   // . . .
   ```
   {validate="false"}

   * [`MainScope()`](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-main-scope.html) 是 Kotlin 結構化並行模型的一部分，用於建立非同步任務執行的作用域。
   * `useEffectOnce` 是另一個 React _hook_（具體來說，是 [useEffect](https://reactjs.org/docs/hooks-effect.html) hook 的簡化版本）。它表示該組件執行了 _副作用 (side effect)_。它不僅渲染自身，還透過網路進行通訊。

檢查您的瀏覽器。應用程式現在應顯示實際資料：

![從 API 獲取的資料](website-api-data.png){width=700}

當您載入頁面時：

* `App` 組件的程式碼會被呼叫。這會啟動 `useEffectOnce` 區塊中的程式碼。
* `App` 組件使用空的已觀看和未觀看影片清單進行渲染。
* 當 API 請求完成後，`useEffectOnce` 區塊會將結果指派給 `App` 組件的狀態。這會觸發重新渲染。
* `App` 組件的程式碼將再次被呼叫，但 `useEffectOnce` 區塊 _不會_ 第二次執行。

如果您想深入了解協同程式的工作原理，請查看這篇[關於協同程式的教學](coroutines-and-channels.md)。

## 部署到生產環境與雲端

是時候將應用程式發布到雲端，讓其他人也能存取了。

### 打包生產版本組建

要在生產模式下打包所有資產，請透過 IntelliJ IDEA 中的工具視窗執行 Gradle 中的 `build` 任務，或執行 `./gradlew build`。這會產生優化後的專案組建，並套用各種改進措施，例如 DCE (無效程式碼刪除)。

組建完成後，您可以在 `/build/dist` 中找到部署所需的所有檔案。它們包括執行應用程式所需的 JavaScript 檔案、HTML 檔案和其他資源。您可以將它們放在靜態 HTTP 伺服器上，使用 GitHub Pages 提供服務，或託管在您選擇的雲端供應商上。

### 部署到 Heroku

Heroku 讓啟動可在其自身網域下存取的應用程式變得非常簡單。其免費層級應足以用於開發目的。

1. [建立帳戶](https://signup.heroku.com/)。
2. [安裝並驗證 CLI 用戶端](https://devcenter.heroku.com/articles/heroku-cli)。
3. 在專案根目錄下於終端機執行以下指令，建立 Git 存儲庫並附加 Heroku 應用程式：

   ```bash
   git init
   heroku create
   git add .
   git commit -m "initial commit"
   ```

4. 與在 Heroku 上執行的常規 JVM 應用程式（例如使用 Ktor 或 Spring Boot 編寫的應用程式）不同，您的應用程式會產生需要相應提供服務的靜態 HTML 頁面和 JavaScript 檔案。您可以調整所需的 buildpacks 以正確提供程式服務：

   ```bash
   heroku buildpacks:set heroku/gradle
   heroku buildpacks:add https://github.com/heroku/heroku-buildpack-static.git
   ```

5. 為了讓 `heroku/gradle` buildpack 正常運作，`build.gradle.kts` 檔案中需要有一個 `stage` 任務。此任務等同於 `build` 任務，相應的別名已包含在檔案底部：

   ```kotlin
   // Heroku Deployment
   tasks.register("stage") {
       dependsOn("build")
   }
   ```

6. 在專案根目錄中加入一個新的 `static.json` 檔案以配置 `buildpack-static`。
7. 在檔案中加入 `root` 屬性：

   ```xml
   {
       "root": "build/distributions"
   }
   ```
   {validate="false"}

8. 您現在可以觸發部署，例如執行以下指令：

   ```bash
   git add -A
   git commit -m "add stage task and static content root configuration"
   git push heroku master
   ```

> 如果您是從非主分支進行推送，請調整指令以推送到 `main` 遠端，例如 `git push heroku feature-branch:main`。
>
{style="tip"}

如果部署成功，您將看到人們可以用來在網際網路上存取該應用程式的 URL。

![將 Web 應用程式部署到生產環境](deployment-to-production.png){width=700}

> 您可以在 `finished` 分支的[此處](https://github.com/kotlin-hands-on/web-app-react-kotlin-js-gradle/tree/finished)找到專案的此狀態。
>
{style="note"}

## 下一步

### 加入更多功能 {initial-collapse-state="collapsed" collapsible="true"}

您可以將產生的應用程式作為起點，探索 React、Kotlin/JS 等領域中更進階的主題。

* **搜尋**。您可以加入一個搜尋欄位來過濾演講清單 —— 例如透過標題或作者。了解 [HTML 表單元素在 React 中如何運作](https://reactjs.org/docs/forms.html)。
* **持久化**。目前，每當頁面重新載入時，應用程式就會遺失觀看者的觀看清單。考慮使用適用於 Kotlin 的 Web 架構（例如 [Ktor](https://ktor.io/)）建置您自己的後端。或者，研究在[用戶端儲存資訊](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)的方法。
* **複雜的 API**。有很多資料集和 API 可供使用。您可以將各種資料拉入您的應用程式。例如，您可以為 [貓咪照片](https://thecatapi.com/) 或 [無版權圖庫 API](https://unsplash.com/developers) 建立一個視覺化工具。

### 改進樣式：回應式與網格 {initial-collapse-state="collapsed" collapsible="true"}

應用程式設計仍然非常簡單，在行動裝置或窄視窗中看起來效果不佳。探索更多 CSS DSL，讓應用程式更易於使用。

### 加入社群並尋求幫助 {initial-collapse-state="collapsed" collapsible="true"}

報告問題並尋求協助的最佳方式是 [kotlin-wrappers 問題追蹤器](https://github.com/JetBrains/kotlin-wrappers/issues)。如果您找不到符合您問題的項目，請隨意提交一個新問題。您也可以加入官方 [Kotlin Slack](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)。那裡有 `#javascript` 和 `#react` 頻道。

### 了解更多關於協同程式的資訊 {initial-collapse-state="collapsed" collapsible="true"}

如果您有興趣了解更多關於如何編寫並行程式碼的資訊，請查看關於 [協同程式](coroutines-and-channels.md) 的教學。

### 了解更多關於 React 的資訊 {initial-collapse-state="collapsed" collapsible="true"}

現在您已經了解了基礎的 React 概念以及它們如何轉換為 Kotlin，您可以將 [React 文件](https://react.dev/learn)中概述的其他一些概念轉換為 Kotlin。