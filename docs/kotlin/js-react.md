[//]: # (title: 使用 React 和 Kotlin/JS 构建 Web 应用程序 – 教程)

<no-index/>

本教程将教你如何使用 Kotlin/JS 和 [React](https://reactjs.org/) 框架构建浏览器应用程序。你将：

* 完成与构建典型 React 应用程序相关的常见任务。
* 探索如何使用 [Kotlin DSL](type-safe-builders.md) 在不牺牲可读性的前提下简洁且一致地表达各种概念，从而使你能够完全用 Kotlin 编写功能齐备的应用程序。
* 学习如何使用现成的 npm 组件、使用外部库并发布最终的应用程序。

最终成果将是一个专为 [KotlinConf](https://kotlinconf.com/) 活动打造的 _KotlinConf Explorer_ Web 应用，其中包含大会演讲的链接。用户可以在单个页面上观看所有演讲，并将其标记为已看或未看。

本教程假设你已具备 Kotlin 的先验知识以及 HTML 和 CSS 的基础知识。理解 React 背后的基本概念可能有助于你理解某些示例代码，但这不是硬性要求。

> 你可以在[此处](https://github.com/kotlin-hands-on/web-app-react-kotlin-js-gradle/tree/finished)获取最终的应用程序。
>
{style="note"}

## 准备工作 {id="before-you-start"}

1. 下载并安装最新版本的 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/)。
2. 克隆[项目模板](https://github.com/kotlin-hands-on/web-app-react-kotlin-js-gradle)并在 IntelliJ IDEA 中打开。该模板包含一个基本的 Kotlin Multiplatform Gradle 项目，其中已包含所有必需的配置与依赖项

   * `build.gradle.kts` 文件中的依赖项与任务：
   
   ```kotlin
   dependencies {
       // React、React DOM 以及包装器
       implementation(enforcedPlatform("org.jetbrains.kotlin-wrappers:kotlin-wrappers-bom:1.0.0-pre.430"))
       implementation("org.jetbrains.kotlin-wrappers:kotlin-react")
       implementation("org.jetbrains.kotlin-wrappers:kotlin-react-dom")
   
       // Kotlin React Emotion (CSS)
       implementation("org.jetbrains.kotlin-wrappers:kotlin-emotion")
   
       // 视频播放器
       implementation(npm("react-player", "^2.12.0"))
   
       // 分享按钮
       implementation(npm("react-share", "^4.4.1"))
   
       // 协程与序列化
       implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.6.4")
       implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.5.0")
   }
   ```

   * `src/jsMain/resources/index.html` 中的 HTML 模板页面，用于插入你将在本教程中使用的 JavaScript 代码：

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

   在构建 Kotlin/JS 项目时，你的所有代码及其依赖项都会自动打包到与项目同名的单个 JavaScript 文件 `confexplorer.js` 中。按照典型的 [JavaScript 约定](https://faqs.skillcrush.com/article/176-where-should-js-script-tags-be-linked-in-html-documents)，body 的内容（包括 `root` div）会优先加载，以确保浏览器在执行脚本之前已加载所有页面元素。

* `src/jsMain/kotlin/Main.kt` 中的代码片段：

   ```kotlin
   import kotlinx.browser.document
   
   fun main() {
       document.bgColor = "red"
   }
   ```

### 运行开发服务器 {id="run-the-development-server"}

默认情况下，Kotlin Multiplatform Gradle 插件自带对嵌入式 `webpack-dev-server` 的支持，让你可以直接从 IDE 运行应用程序，而无需手动设置任何服务器。

要测试程序能否在浏览器中成功运行，请在 IntelliJ IDEA 内的 Gradle 工具窗口中调用 `run` 或 `browserDevelopmentRun` 任务（位于 `other` 或 `kotlin browser` 目录下）来启动开发服务器：

![Gradle 任务列表](browser-development-run.png){width=700}

若要从终端运行该程序，请改用 `./gradlew run`。

当项目编译并打包完成后，浏览器窗口中将显示一个空白的红色页面：

![空白红色页面](red-page.png){width=700}

### 启用热重载 / 持续模式 {id="enable-hot-reload-continuous-mode"}

配置_[持续编译](dev-server-continuous-compilation.md)_模式，这样在每次进行更改时就不必手动编译和执行项目。在继续之前，请确保停止所有正在运行的开发服务器实例。

1. 编辑 IntelliJ IDEA 在首次运行 Gradle `run` 任务后自动生成的运行配置：

   ![编辑运行配置](edit-configurations-continuous.png){width=700}

2. 在 **运行/调试配置 (Run/Debug Configurations)** 对话框中，将 `--continuous` 选项添加到该运行配置的实参中：

   ![启用持续模式](continuous-mode.png){width=700}

   应用更改后，你可以使用 IntelliJ IDEA 内的 **Run** 按钮重新启动开发服务器。若要从终端运行持续 Gradle 构建，请改用 `./gradlew run --continuous`。

3. 若要测试此功能，可以在 Gradle 任务运行期间将 `Main.kt` 文件中的页面颜色更改为蓝色：

   ```kotlin
   document.bgColor = "blue"
   ```

   随后项目将重新编译，重新加载后浏览器页面将呈现新的颜色。

你可以在开发过程中让开发服务器保持在持续模式下运行。当做出修改时，它会自动重新构建并重新加载页面。

> 你可以在[此处](https://github.com/kotlin-hands-on/web-app-react-kotlin-js-gradle/tree/master)的 `master` 分支上找到该项目的这一状态。
>
{style="note"}

## 创建 Web 应用草稿 {id="create-a-web-app-draft"}

### 使用 React 添加第一个静态页面 {id="add-the-first-static-page-with-react"}

为了让应用显示一条简单的消息，请将 `Main.kt` 文件中的代码替换为以下内容：

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

* `render()` 函数指示 [kotlin-react-dom](https://github.com/JetBrains/kotlin-wrappers/tree/master/kotlin-react-dom) 将 [Fragment](https://reactjs.org/docs/fragments.html) 中的第一个 HTML 元素渲染到 `root` 元素中。该元素是模板中包含的 `src/jsMain/resources/index.html` 内所定义的容器。
* 内容是一个 `<h1>` 标题，并使用类型安全的 DSL 来渲染 HTML。
* `h1` 是一个接受 lambda 形参的函数。当你在字符串文字前面添加 `+` 号时，实际上是通过[运算符重载](operator-overloading.md)调用了 `unaryPlus()` 函数。它会将该字符串追加到所包含的 HTML 元素中。

当项目重新编译后，浏览器将显示此 HTML 页面：

![HTML 页面示例](hello-react-js.png){width=700}

### 将 HTML 转换为 Kotlin 的类型安全 HTML DSL {id="convert-html-to-kotlin-s-typesafe-html-dsl"}

适用于 React 的 Kotlin [包装器](https://github.com/JetBrains/kotlin-wrappers/blob/master/kotlin-react/README.md)自带一个[领域专用语言 (DSL)](type-safe-builders.md)，使我们能够用纯 Kotlin 代码编写 HTML。在这方面，它类似于 JavaScript 中的 [JSX](https://reactjs.org/docs/introducing-jsx.html)。然而，由于这种标记是 Kotlin 代码，你将获得静态类型语言的所有优势，例如自动补全或类型检查。

比较未来 Web 应用的传统 HTML 代码及其在 Kotlin 中的类型安全变体：

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

复制代码，更新 `main()` 函数中的 `Fragment.create()` 函数调用，替换之前的 `h1` 标记。

等待浏览器重新加载。页面现在应该如下所示：

![Web 应用草稿](website-draft.png){width=700}

### 在标记中使用 Kotlin 结构添加视频 {id="add-videos-using-kotlin-constructs-in-markup"}

使用该 DSL 在 Kotlin 中编写 HTML 有一些优势。你可以使用常规的 Kotlin 结构来操作应用，例如循环、条件、集合和字符串插值。

现在可以用 Kotlin 对象列表替换硬编码的视频列表：

1. 在 `Main.kt` 中创建一个 `Video` [数据类](data-classes.md)，将所有视频属性保存在一处：

   ```kotlin
   data class Video(
       val id: Int,
       val title: String,
       val speaker: String,
       val videoUrl: String
   )
   ```

2. 分别填充未看视频和已看视频这两个列表。在 `Main.kt` 中的文件级添加以下声明：

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

3. 若要在页面上使用这些视频，请编写一个 Kotlin `for` 循环来遍历未看 `Video` 对象的集合。将 "Videos to watch" 下的三个 `p` 标记替换为以下代码段：

   ```kotlin
   for (video in unwatchedVideos) {
       p {
           +"${video.speaker}: ${video.title}"
       }
   }
   ```
   
4. 采用相同的流程来修改 "Videos watched" 后面的单个标记的代码：

   ```kotlin
   for (video in watchedVideos) {
       p {
           +"${video.speaker}: ${video.title}"
       }
   }
   ```

等待浏览器重新加载。布局应该与之前保持一致。你可以在列表中添加更多视频，以确保循环正常工作。

### 使用类型安全 CSS 添加样式 {id="add-styles-with-typesafe-css"}

面向 [Emotion](https://emotion.sh/docs/introduction) 库的 [kotlin-emotion](https://github.com/JetBrains/kotlin-wrappers/blob/master/kotlin-emotion/) 包装器使得直接与 HTML 并排指定 CSS 属性（甚至是动态属性）成为可能。从概念上讲，这类似于 [CSS-in-JS](https://reactjs.org/docs/faq-styling.html#what-is-css-in-js)——不过是面向 Kotlin 的。使用 DSL 的好处在于你可以使用 Kotlin 代码结构来表达格式设置规则。

本教程的模板项目已包含使用 `kotlin-emotion` 所需的依赖项：

```kotlin
dependencies {
    // ...
    // Kotlin React Emotion (CSS) (chapter 3)
    implementation("org.jetbrains.kotlin-wrappers:kotlin-emotion")
    // ...
}
```

借助 `kotlin-emotion`，你可以在 HTML 元素 `div` 和 `h3` 内指定一个 `css` 块来定义样式。

若要将视频播放器移动到页面的右上角，请使用 CSS 并调整视频播放器的代码（代码段中的最后一个 `div`）：

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

你可以随意尝试一些其他样式。例如，你可以更改 `fontFamily` 或为 UI 添加一些 `color`。

## 设计应用组件 {id="design-app-components"}

React 中的基本构建块称为_[组件 (components)](https://reactjs.org/docs/components-and-props.html)_。组件本身也可以由其他更小的组件组成。通过组合组件，即可构建出应用程序。如果你将组件构建为通用且可复用的结构，就能在应用的不同部分使用它们，而无需重复编写代码或逻辑。

`render()` 函数的内容通常描述了一个基本组件。应用程序当前的布局如下所示：

![当前布局](current-layout.png){width=700}

如果将应用程序分解为各个独立的组件，最终将获得一个更加结构化的布局，其中每个组件各司其职：

![带有组件的结构化布局](structured-layout.png){width=700}

组件封装了特定功能。使用组件可以缩减源代码，并使其更易于阅读和理解。

### 添加主组件 {id="add-the-main-component"}

若要开始构建应用程序的结构，首先显式指定 `App`，即用于渲染到 `root` 元素的主组件：

1. 在 `src/jsMain/kotlin` 文件夹中新建一个 `App.kt` 文件。
2. 在该文件中添加以下代码段，并将 `Main.kt` 中的类型安全 HTML 移入其中：

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
       // 类型安全的 HTML 放在此处，从第一个 h1 标记开始！
   }
   ```
   
   `FC` 函数用于创建一个[函数组件](https://reactjs.org/docs/components-and-props.html#function-and-class-components)。

3. 在 `Main.kt` 文件中，按如下方式更新 `main()` 函数：

   ```kotlin
   fun main() {
       val container = document.getElementById("root") ?: error("Couldn't find root container!")
       createRoot(container).render(App.create())
   }
   ```

   现在程序会创建 `App` 组件的一个实例，并将其渲染到指定的容器中。

有关 React 概念的更多信息，请参阅[文档和指南](https://reactjs.org/docs/hello-world.html#how-to-read-this-guide)。

### 提取列表组件 {id="extract-a-list-component"}

由于 `watchedVideos` 和 `unwatchedVideos` 列表各自包含一组视频，因此创建一个单一的可复用组件，仅调整列表中显示的内容是合理的。

`VideoList` 组件遵循与 `App` 组件相同的模式。它使用 `FC` 构建器函数，并包含来自 `unwatchedVideos` 列表的代码。

1. 在 `src/jsMain/kotlin` 文件夹中新建一个 `VideoList.kt` 文件，并添加以下代码：

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

2. 在 `App.kt` 中，通过不带实参的调用来使用 `VideoList` 组件：

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

   目前，`App` 组件无法控制 `VideoList` 组件所显示的内容。由于它是硬编码的，因此你会看到相同的列表出现两次。

### 添加 props 以在组件之间传递数据 {id="add-props-to-pass-data-between-components"}

由于你要复用 `VideoList` 组件，因此需要能够为其填充不同的内容。你可以添加将项列表作为属性传递给组件的功能。在 React 中，这些属性被称为 _props_。当 React 中组件的 props 发生更改时，框架会自动重新渲染该组件。

对于 `VideoList`，你需要一个包含要显示的视频列表的 prop。定义一个接口来存放所有可传递给 `VideoList` 组件的 props：

1. 将以下定义添加到 `VideoList.kt` 文件中：

   ```kotlin
   external interface VideoListProps : Props {
       var videos: List<Video>
   }
   ```
   [external](js-interop.md#external-modifier) 修饰符告知编译器该接口的实现由外部提供，因此它不会尝试从该声明生成 JavaScript 代码。

2. 调整 `VideoList` 的定义，利用作为形参传递到 `FC` 块中的 props：

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

   `key` 特性有助于 React 渲染器在 `props.videos` 的值发生变化时确定该如何处理。它利用 key 来判断列表中的哪些部分需要刷新，哪些部分保持不变。你可以在 [React 指南](https://reactjs.org/docs/lists-and-keys.html)中找到有关列表与键的更多信息。

3. 在 `App` 组件中，确保子组件已使用正确的属性进行实例化。在 `App.kt` 中，将 `h3` 元素下方的两个循环替换为对 `VideoList` 的调用，并附带针对 `unwatchedVideos` 和 `watchedVideos` 的属性。
   在 Kotlin DSL 中，你在属于 `VideoList` 组件的代码块内对它们进行赋值：

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

重新加载后，浏览器将显示列表已正确渲染。

### 让列表具备交互性 {id="make-the-list-interactive"}

首先，添加一条当用户点击列表条目时弹出的警告消息。在 `VideoList.kt` 中，添加一个 `onClick` 处理程序函数，用于触发带有当前视频信息的警告提示：

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

如果你在浏览器窗口中点击其中一个列表项，就会在如下的弹出窗口中获取有关该视频的信息：

![浏览器警告弹出窗口](alert-window.png){width=700}

> 直接将 `onClick` 函数定义为 lambda 非常简洁，而且对原型制作很有用。但是，由于 Kotlin/JS 中相等性[目前的工作方式](https://youtrack.jetbrains.com/issue/KT-15101)，从性能角度来看，这并不是传递点击处理程序的最优方式。如果你希望优化渲染性能，可以考虑将函数存储在变量中再进行传递。
>
{style="tip"}

### 添加状态以保存值 {id="add-state-to-keep-values"}

除了仅向用户弹出提示之外，你还可以添加使用 ▶ 三角符号高亮显示所选视频的功能。为此，请引入特定于该组件的某些_状态 (state)_。

状态是 React 中的核心概念之一。在现代 React（使用所谓的 _Hooks API_）中，状态是通过 [`useState` Hook](https://reactjs.org/docs/hooks-state.html) 来表示的。

1. 将以下代码添加到 `VideoList` 声明的顶部：

   ```kotlin
   val VideoList = FC<VideoListProps> { props ->
       var selectedVideo: Video? by useState(null)

   // . . .
   ```
   {validate="false"}

   * `VideoList` 函数式组件保存了状态（一个独立于当前函数调用的值）。状态是可空的，类型为 `Video?`。其默认值为 `null`。
   * React 的 `useState()` 函数指示框架在函数的多次调用之间跟踪状态。例如，即使你指定了默认值，React 也会确保仅在初始时赋予该默认值。当状态发生改变时，组件将根据新状态重新渲染。
   * `by` 关键字表示 `useState()` 用作[委托属性](delegated-properties.md)。就像操作其他变量一样，你可以读取和写入值。`useState()` 背后的实现会处理让状态正常工作所需的机制。

   要了解更多有关 State Hook 的信息，请查看 [React 文档](https://reactjs.org/docs/hooks-state.html)。

2. 将 `VideoList` 组件中的 `onClick` 处理程序和文本更改为如下所示：

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

   * 当用户点击某个视频时，其值会赋给 `selectedVideo` 变量。
   * 当渲染所选的列表条目时，前面会加上三角形符号。

你可以在 [React 常见问题解答](https://reactjs.org/docs/faq-state.html)中找到有关状态管理的更多详细信息。

检查浏览器并点击列表中的某一项，以确保一切正常运行。

## 组合组件 {id="compose-components"}

目前，这两个视频列表是各自独立工作的，这意味着每个列表都在跟踪一个选中的视频。用户可以在未看列表和已看列表中各选择一个视频，尽管只有一个播放器：

![两个列表中同时选中了两个视频](two-videos-select.png){width=700}

列表无法同时跟踪自身内部以及同级列表中选中的视频。原因在于选中的视频不是_列表_状态的一部分，而是_应用程序_状态的一部分。这意味着你需要将状态从各个组件中_提升 (lift)_出来。

### 提升状态 {id="lift-state"}

React 确保 props 只能从父组件传递给其子组件。这可以防止组件之间产生硬编码耦合。

如果一个组件想要改变同级组件的状态，它需要通过它们的父组件来进行。此时，该状态也不再属于任何子组件，而是属于全局的父组件。

将状态从组件迁移到其父组件的过程称为_提升状态 (lifting state)_。对于你的应用，将 `currentVideo` 作为状态添加到 `App` 组件中：

1. 在 `App.kt` 中，将以下内容添加到 `App` 组件定义的顶部：

   ```kotlin
   val App = FC<Props> {
       var currentVideo: Video? by useState(null)
   
       // . . .
   }
   ```

   `VideoList` 组件不再需要跟踪状态。相反，它将通过 prop 接收当前视频。

2. 移除 `VideoList.kt` 中的 `useState()` 调用。
3. 让 `VideoList` 组件准备好将所选视频作为 prop 接收。为此，扩展 `VideoListProps` 接口以包含 `selectedVideo`：

   ```kotlin
   external interface VideoListProps : Props {
       var videos: List<Video>
       var selectedVideo: Video?
   }
   ```

4. 更改三角形符号的显示条件，使其使用 `props` 而不是 `state`：

   ```kotlin
   if (video == props.selectedVideo) {
       +"▶ "
   }
   ```

### 传递处理程序 {id="pass-handlers"}

目前还没有为 prop 赋值的方式，因此 `onClick` 函数无法按当前的设置方式工作。若要更改父组件的状态，你需要再次提升状态。

在 React 中，状态始终自上而下从父级流向子级。因此，若要从某个子组件更改_应用程序_状态，你需要将处理用户交互的逻辑移至父组件，然后将该逻辑作为 prop 传入。请记住，在 Kotlin 中，变量可以具有[函数类型](lambdas.md#function-types)。

1. 再次扩展 `VideoListProps` 接口，使其包含一个变量 `onSelectVideo`，这是一个接受 `Video` 并返回 `Unit` 的函数：

   ```kotlin
   external interface VideoListProps : Props {
       // ...
       var onSelectVideo: (Video) -> Unit
   }
   ```

2. 在 `VideoList` 组件中，在 `onClick` 处理程序中使用新的 prop：

   ```kotlin
   onClick = {
       props.onSelectVideo(video)
   }
   ```
   
   现在你可以从 `VideoList` 组件中删除 `selectedVideo` 变量。

3. 返回 `App` 组件，并为这两个视频列表中的每一个传递 `selectedVideo` 以及 `onSelectVideo` 的处理程序：

   ```kotlin
   VideoList {
       videos = unwatchedVideos // 对于 watchedVideos 同理
       selectedVideo = currentVideo
       onSelectVideo = { video ->
           currentVideo = video
       }
   }
   ```

4. 对已看视频列表重复上一步。

切回浏览器并确保在选择视频时，选中状态会在两个列表之间切换且不会重复。

## 添加更多组件 {id="add-more-components"}

### 提取视频播放器组件 {id="extract-the-video-player-component"}

现在你可以创建另一个独立的组件——视频播放器，它目前是一个占位符图片。你的视频播放器需要知道演讲标题、演讲者以及视频链接。这些信息已包含在每个 `Video` 对象中，因此你可以将其作为 prop 传递并访问其属性。

1. 新建一个 `VideoPlayer.kt` 文件，并为 `VideoPlayer` 组件添加以下实现：

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

2. 由于 `VideoPlayerProps` 接口指定 `VideoPlayer` 组件接受不可空的 `Video`，因此请确保在 `App` 组件中进行相应处理。

   在 `App.kt` 中，将视频播放器之前的 `div` 代码段替换为以下内容：

   ```kotlin
   currentVideo?.let { curr ->
       VideoPlayer {
           video = curr
       }
   }
   ```

   [`let` 作用域函数](scope-functions.md#let)确保仅在 `state.currentVideo` 不为 null 时才添加 `VideoPlayer` 组件。

现在点击列表中的条目将显示视频播放器，并使用所点击条目的信息填充它。

### 添加按钮并进行绑定 {id="add-a-button-and-wire-it"}

为了让用户能够将视频标记为已看或未看，并在两个列表之间移动该视频，请在 `VideoPlayer` 组件中添加一个按钮。

由于此按钮将在两个不同的列表之间移动视频，因此处理状态更改的逻辑需要从 `VideoPlayer` 中_提升_出来，并由父组件作为 prop 传入。按钮应根据视频是否已被观看而呈现不同的外观。这也是需要作为 prop 传入的信息。

1. 扩展 `VideoPlayer.kt` 中的 `VideoPlayerProps` 接口，以包含针对这两种情况的属性：

   ```kotlin
   external interface VideoPlayerProps : Props {
       var video: Video
       var onWatchedButtonPressed: (Video) -> Unit
       var unwatchedVideo: Boolean
   }
   ```

2. 现在你可以将按钮添加到实际组件中。将以下代码段复制到 `VideoPlayer` 组件的主体中，位于 `h3` 和 `img` 标记之间：

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

   借助可以动态更改样式的 Kotlin CSS DSL，你可以使用基本的 Kotlin `if` 表达式来更改按钮的颜色。

### 将视频列表移至应用程序状态 {id="move-video-lists-to-the-application-state"}

现在该调整 `App` 组件中 `VideoPlayer` 的使用位置了。当点击该按钮时，视频应从未看列表移动到已看列表，反之亦然。由于这些列表现在可以发生变化，请将它们移入应用程序状态：

1. 在 `App.kt` 中，将以下带有 `useState()` 调用的属性添加到 `App` 组件的顶部：

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

2. 由于所有演示数据都已直接包含在 `watchedVideos` 和 `unwatchedVideos` 的默认值中，因此你不再需要文件级的声明。在 `Main.kt` 中，删除 `watchedVideos` 和 `unwatchedVideos` 的声明。
3. 将 `App` 组件中属于视频播放器的 `VideoPlayer` 调用处更改为如下所示：

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

返回浏览器，选择一个视频并点击几次该按钮。视频将在两个列表之间来回移动。

## 使用来自 npm 的软件包 {id="use-packages-from-npm"}

为了使该应用具备实用性，你还需要一个真正能够播放视频的视频播放器，以及一些帮助大家分享内容的按钮。

React 拥有丰富的生态系统，提供了大量预制组件，你可以直接使用它们而无需自行构建这些功能。

### 添加视频播放器组件 {id="add-the-video-player-component"}

若要使用真实的 YouTube 播放器替换占位视频组件，可以使用 npm 中的 `react-player` 软件包。它能够播放视频并允许你控制播放器的外观。

关于组件文档和 API 说明，请参阅其在 GitHub 上的 [README](https://www.npmjs.com/package/react-player)。

1. 检查 `build.gradle.kts` 文件。`react-player` 软件包应该已被包含在内：

   ```kotlin
   dependencies {
       // ...
       // Video Player
       implementation(npm("react-player", "^2.12.0"))
       // ...
   }
   ```

   正如你所看到的，通过在构建文件的 `dependencies` 块中使用 `npm()` 函数，可以将 npm 依赖项添加到 Kotlin/JS 项目中。Gradle 插件随后会负责为你下载并安装这些依赖项。为此，它使用了自身捆绑安装的 [Yarn](https://yarnpkg.com/) 软件包管理器。

2. 要在 React 应用程序内部使用 JavaScript 软件包，必须通过提供[外部声明](js-interop.md)来告知 Kotlin 编译器预期内容。

   新建一个 `ReactYouTube.kt` 文件并添加以下内容：

   ```kotlin
   @file:JsModule("react-player")
   @file:JsNonModule
   
   import react.*
   
   @JsName("default")
   external val ReactPlayer: ComponentClass<dynamic>
   ```

   当编译器看到类似 `ReactPlayer` 的外部声明时，它会假定相应类的实现由依赖项提供，因此不会为其生成代码。

   最后两行等效于类似 `require("react-player").default;` 的 JavaScript 导入。它们告知编译器，在运行时该组件必定符合 `ComponentClass<dynamic>`。

但是，在此配置中，`ReactPlayer` 所接受的 props 泛型类型被设为 `dynamic`。这意味着编译器会接受任何代码，但存在运行时出错的风险。

更好的替代方案是创建一个 `external interface`，指定该外部组件的 props 包含哪些属性。你可以在该组件的 [README](https://www.npmjs.com/package/react-player) 中了解 props 的接口。在本例中，请使用 `url` 和 `controls` 属性：

1. 通过将 `dynamic` 替换为外部接口来调整 `ReactYouTube.kt` 的内容：

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

2. 现在你可以使用新的 `ReactPlayer` 替换 `VideoPlayer` 组件中的灰色占位矩形。在 `VideoPlayer.kt` 中，将 `img` 标记替换为以下代码段：

   ```kotlin
   ReactPlayer {
       url = props.video.videoUrl
       controls = true
   }
   ```

### 添加社交分享按钮 {id="add-social-share-buttons"}

分享应用程序内容的一种简单方法是添加用于通讯工具和电子邮件的社交分享按钮。你也可以为此使用现成的 React 组件，例如 [react-share](https://github.com/nygardk/react-share/blob/master/README.md)：

1. 检查 `build.gradle.kts` 文件。此 npm 库应该已被包含在内：

   ```kotlin
   dependencies {
       // ...
       // Share Buttons
       implementation(npm("react-share", "^4.4.1"))
       // ...
   }
   ```

2. 要在 Kotlin 中使用 `react-share`，你需要编写更多基本的外部声明。[GitHub 上的示例](https://github.com/nygardk/react-share/blob/master/demo/Demo.tsx#L61)表明，例如分享按钮由两个 React 组件组成：`EmailShareButton` 和 `EmailIcon`。不同类型的分享按钮和图标都具有相同类型的接口。
   你将像之前为视频播放器所做的那样，为每个组件创建外部声明。

   将以下代码添加到一个新的 `ReactShare.kt` 文件中：

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

3. 将新组件添加到应用程序的用户界面中。在 `VideoPlayer.kt` 中，在调用 `ReactPlayer` 的正上方添加一个包含两个分享按钮的 `div`：

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

现在你可以检查浏览器并查看这些按钮是否真正起作用。点击按钮时，应该会出现一个带有视频 URL 的_分享窗口_。如果按钮没有显示或无法使用，你可能需要禁用广告及社交媒体拦截器。

![分享窗口](social-buttons.png){width=700}

你可以随意针对 [react-share](https://github.com/nygardk/react-share/blob/master/README.md#features) 中支持的其他社交网络分享按钮重复此步骤。

## 使用外部 REST API {id="use-an-external-rest-api"}

现在可以用应用中来自 REST API 的真实数据替换硬编码的演示数据。

对于本教程，有一个[小型的 API](https://my-json-server.typicode.com/kotlin-hands-on/kotlinconf-json/videos/1)。它仅提供单个端点 `videos`，并接受一个数字参数以访问列表中的元素。如果你在浏览器中访问该 API，会发现 API 返回的对象与 `Video` 对象具有相同的结构。

### 在 Kotlin 中使用 JS 功能 {id="use-js-functionality-from-kotlin"}

浏览器本身已经内置了各种各样的 [Web API](https://developer.mozilla.org/en-US/docs/Web/API)。你也可以在 Kotlin/JS 中使用它们，因为它开箱即用提供了针对这些 API 的包装器。其中一个示例是用于发起 HTTP 请求的 [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)。

第一个潜在问题是，类似 `fetch()` 这样的浏览器 API 使用[回调 (callbacks)](https://developer.mozilla.org/en-US/docs/Glossary/Callback_function) 来执行非阻塞操作。当需要先后运行多个回调时，必须将它们进行嵌套。代码自然会出现大量缩进，越来越多的功能片段层叠在一起，使得代码难以阅读。

为了解决这个问题，你可以使用 Kotlin 的协程，这是实现此类功能的一种更优方法。

第二个问题源于 JavaScript 的动态类型特性。对于从外部 API 返回的数据类型没有任何保证。为了解决这个问题，你可以使用 `kotlinx.serialization` 库。

检查 `build.gradle.kts` 文件。相关的代码段应该已经存在：

```kotlin
dependencies {
    // . . .

    // Coroutines & serialization
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.6.4")
}
```

### 添加序列化 {id="add-serialization"}

调用外部 API 时，你将收到 JSON 格式的文本，仍需要将其转换为可供处理的 Kotlin 对象。

[`kotlinx.serialization`](https://github.com/Kotlin/kotlinx.serialization) 是一个能够实现将 JSON 字符串转换为 Kotlin 对象的库。

1. 检查 `build.gradle.kts` 文件。对应的代码段应该已经存在：

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

2. 作为获取第一个视频的准备工作，有必要向序列化库告知 `Video` 类。在 `Main.kt` 中，为其定义添加 `@Serializable` 注解：

   ```kotlin
   @Serializable
   data class Video(
       val id: Int,
       val title: String,
       val speaker: String,
       val videoUrl: String
   )
   ```

### 获取视频 {id="fetch-videos"}

要从 API 获取视频，请在 `App.kt`（或新文件）中添加以下函数：

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

* _挂起函数_ `fetch()` 从 API 获取指定 `id` 的视频。该响应可能需要一些时间，因此使用 `await()` 等待其结果。接着，使用回调的 `text()` 会从响应中读取主体内容。然后你 `await()` 其完成。
* 在返回函数的值之前，将其传递给来自 `kotlinx.coroutines` 的函数 `Json.decodeFromString`。它会将你从请求收到的 JSON 文本转换为具有相应字段的 Kotlin 对象。
* `window.fetch` 函数调用返回一个 `Promise` 对象。通常你必须定义一个回调处理程序，在 `Promise` 得到解决 (resolved) 且结果可用时被调用。然而借助协程，你可以 `await()` 这些 Promise。每当调用像 `await()` 这样的函数时，方法就会停止（挂起）其执行。一旦 `Promise` 得到解决，它的执行就会继续。

为了给用户提供视频选择，定义 `fetchVideos()` 函数，该函数将从上述相同的 API 中获取 25 个视频。为了并发运行所有请求，请使用 Kotlin 协程提供的 [`async`](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/async.html) 功能：

1. 在你的 `App.kt` 中添加以下实现：

   ```kotlin
   suspend fun fetchVideos(): List<Video> = coroutineScope {
       (1..25).map { id ->
           async {
               fetchVideo(id)
           }
       }.awaitAll()
   }
   ```

   遵循[结构化并发](https://kotlinlang.org/docs/coroutines-basics.html#structured-concurrency)原则，该实现被封装在一个 `coroutineScope` 中。然后你可以启动 25 个异步任务（每个请求一个）并等待所有任务完成。

2. 现在你可以向应用程序添加数据了。添加 `mainScope` 的定义，并修改 `App` 组件使其以以下代码段开头。也别忘了将演示值替换为 `emptyList()` 实例：

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

   * [`MainScope()`](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-main-scope.html) 是 Kotlin 结构化并发模型的一部分，它创建了用于运行异步任务的作用域。
   * `useEffectOnce` 是另一个 React _Hook_（具体来说，是 [useEffect](https://reactjs.org/docs/hooks-effect.html) Hook 的简化版本）。它表明组件执行了一个_副作用_。它不仅渲染自身，还通过网络进行通信。

检查你的浏览器。应用程序现在应该显示实际的数据：

![从 API 获取的数据](website-api-data.png){width=700}

加载页面时：

* `App` 组件的代码将被调用。这将启动 `useEffectOnce` 代码块中的代码。
* `App` 组件使用已看和未看视频的空列表进行渲染。
* 当 API 请求完成时，`useEffectOnce` 块将其赋值给 `App` 组件的状态。这将触发重新渲染。
* `App` 组件的代码将再次被调用，但 `useEffectOnce` 块_不会_运行第二次。

如果你希望深入了解协程的工作原理，请查看这篇[协程教程](coroutines-and-channels.md)。

## 部署到生产环境和云端 {id="deploy-to-production-and-the-cloud"}

是时候将应用程序发布到云端并让其他人可以访问了。

### 打包生产构建 {id="package-a-production-build"}

要在生产模式下打包所有资源，请通过 IntelliJ IDEA 中的工具窗口运行 Gradle 中的 `build` 任务，或者运行 `./gradlew build`。这将生成一个经过优化的项目构建产物，应用了各种改进，例如消除无效代码 (DCE)。

构建完成后，你可以在 `/build/dist` 中找到部署所需的所有文件。它们包括运行应用程序所需的 JavaScript 文件、HTML 文件以及其他资源。你可以将它们放置在静态 HTTP 服务器上、使用 GitHub Pages 提供托管服务，或者托管在你选择的云服务提供商处。

### 部署到 Heroku {id="deploy-to-heroku"}

Heroku 让快速搭建一个可以在独立域名下访问的应用程序变得非常简单。其免费层级对于开发目的来说应该足够了。

1. [创建账户](https://signup.heroku.com/)。
2. [安装 CLI 客户端并完成身份验证](https://devcenter.heroku.com/articles/heroku-cli)。
3. 在项目根目录下的终端中运行以下命令，创建 Git 仓库并关联一个 Heroku 应用：

   ```bash
   git init
   heroku create
   git add .
   git commit -m "initial commit"
   ```

4. 与在 Heroku 上运行的普通 JVM 应用程序（例如使用 Ktor 或 Spring Boot 编写的应用）不同，你的应用生成的是静态 HTML 页面和 JavaScript 文件，需要相应地进行托管提供。你可以调整所需的 Buildpack 以正确提供该程序的服务：

   ```bash
   heroku buildpacks:set heroku/gradle
   heroku buildpacks:add https://github.com/heroku/heroku-buildpack-static.git
   ```

5. 为了让 `heroku/gradle` Buildpack 能够正常运行，`build.gradle.kts` 文件中需要包含一个 `stage` 任务。该任务等同于 `build` 任务，文件底部已经包含了对应的别名：

   ```kotlin
   // Heroku Deployment
   tasks.register("stage") {
       dependsOn("build")
   }
   ```

6. 在项目根目录下添加一个新的 `static.json` 文件以配置 `buildpack-static`。
7. 在该文件内添加 `root` 属性：

   ```xml
   {
       "root": "build/distributions"
   }
   ```
   {validate="false"}

8. 现在你可以触发部署，例如运行以下命令：

   ```bash
   git add -A
   git commit -m "add stage task and static content root configuration"
   git push heroku master
   ```

> 如果你是从非 main 分支进行推送，请调整命令以推送到 `main` 远程分支，例如 `git push heroku feature-branch:main`。
>
{style="tip"}

如果部署成功，你将看到可以在互联网上访问该应用程序的 URL。

![将 Web 应用部署到生产环境](deployment-to-production.png){width=700}

> 你可以在[此处](https://github.com/kotlin-hands-on/web-app-react-kotlin-js-gradle/tree/finished)的 `finished` 分支上找到该项目的这一状态。
>
{style="note"}

## 后续步骤 {id="what-s-next"}

### 添加更多功能 {initial-collapse-state="collapsed" collapsible="true" id="add-more-features"}

你可以将生成的应用作为起点，进一步探索 React、Kotlin/JS 以及更多领域的高级主题。

* **搜索**。你可以添加一个搜索输入框来筛选演讲列表——例如按标题或作者进行筛选。了解 [HTML 表单元素在 React 中是如何工作的](https://reactjs.org/docs/forms.html)。
* **持久化**。目前，每当页面重新加载时，应用程序都会丢失观看者的观看列表。可以考虑使用适用于 Kotlin 的 Web 框架（例如 [Ktor](https://ktor.io/)）构建自己的后端。或者，研究在[客户端存储信息](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)的方法。
* **复杂的 API**。有大量的数据集和 API 可用。你可以将各种数据拉取到你的应用程序中。例如，你可以为[猫咪照片](https://thecatapi.com/)或[免版税库存照片 API](https://unsplash.com/developers) 构建一个可视化器。

### 改进样式：响应式与网格 {initial-collapse-state="collapsed" collapsible="true" id="improve-the-style-responsiveness-and-grids"}

该应用程序的设计目前仍然非常简陋，在移动设备或窄窗口中效果欠佳。探索更多 CSS DSL 的用法，让应用更易于使用。

### 加入社区并获取帮助 {initial-collapse-state="collapsed" collapsible="true" id="join-the-community-and-get-help"}

报告问题和获取帮助的最佳途径是 [kotlin-wrappers 问题跟踪器](https://github.com/JetBrains/kotlin-wrappers/issues)。如果你找不到有关你的问题的工单，欢迎随时提交新工单。你还可以加入官方的 [Kotlin Slack](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)。那里有 `#javascript` 和 `#react` 频道。

### 详细了解协程 {initial-collapse-state="collapsed" collapsible="true" id="learn-more-about-coroutines"}

如果你有兴趣进一步了解如何编写并发代码，请查看[协程](coroutines-and-channels.md)教程。

### 详细了解 React {initial-collapse-state="collapsed" collapsible="true" id="learn-more-about-react"}

既然你已经了解了 React 的基本概念及其如何映射到 Kotlin，就可以尝试将 [React 文档](https://react.dev/learn)中概述的其他概念转换为 Kotlin 了。