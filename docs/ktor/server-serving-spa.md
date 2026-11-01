[//]: # (title: 托管单页应用程序)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="single-page-application"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
Ktor 提供了托管单页应用程序的能力，包括 React、Angular、Vue 等。
</link-summary>

Ktor 提供了托管单页应用程序的能力，包括 React、Angular 或 Vue。

## 添加依赖项 {id="add_dependencies"}

要托管单页应用程序，你只需要 [ktor-server-core](server-dependencies.topic#add-ktor-dependencies) 依赖项。
不需要任何特定的依赖项。

## 托管应用程序 {id="configure"}

要托管单页应用程序，你需要定义要从何处提供内容：本地文件系统还是类路径（classpath）。
你至少需要指定包含单页应用程序的文件夹/资源包。

### 托管特定框架的应用程序 {id="serve-framework"}

你可以托管使用特定框架（如 React、Angular、Vue 等）构建的单页应用程序。
假设项目根目录中有一个包含 React 应用程序的 `react-app` 文件夹。
该应用程序具有以下结构，并将 `index.html` 文件作为主页面：

```text
react-app
├── index.html
├── ...
└── static
    └── ...
```

要托管此应用程序，请在 [routing](server-routing.md) 块内调用 [singlePageApplication](https://api.ktor.io/ktor-server-core/io.ktor.server.http.content/single-page-application.html)，并将文件夹名称传递给 `react` 函数：

```kotlin
import io.ktor.server.application.*
import io.ktor.server.http.content.*
import io.ktor.server.routing.*

fun Application.module() {
    routing {
        singlePageApplication {
            react("react-app")
        }
    }
}
```

Ktor 会自动查找 `index.html`。
要了解如何自定义默认页面，请参阅[自定义托管设置](#serve-customize)。

> 对于其他框架，请使用相应的函数，例如 `angular`、`vue`、`ember` 等。

### 自定义托管设置 {id="serve-customize"}

为了演示如何从资源中托管单页应用程序，假设我们的应用程序放置在 `sample-web-app` 资源包中，其结构如下：

```text
sample-web-app
├── main.html
├── ktor_logo.png
├── css
│   └──styles.css
└── js
    └── script.js
```

要托管此应用程序，可以使用以下配置：

```kotlin
import io.ktor.server.application.*
import io.ktor.server.http.content.*
import io.ktor.server.routing.*

fun Application.module() {
    routing {
        singlePageApplication {
            useResources = true
            filesPath = "sample-web-app"
            defaultPage = "main.html"
            ignoreFiles { it.endsWith(".txt") }
        }
    }
}
```

- `useResources`：启用从资源包托管应用程序。
- `filesPath`：指定应用程序所在的路径。
- `defaultPage`：指定 `main.html` 作为默认提供的资源。
- `ignoreFiles`：忽略末尾包含 `.txt` 的路径。

你可以在此处找到完整示例：[single-page-application](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/single-page-application)。