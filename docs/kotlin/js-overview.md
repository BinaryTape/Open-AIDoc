[//]: # (title: Kotlin/JavaScript)

Kotlin/JavaScript (Kotlin/JS) 允许你将 Kotlin 代码、Kotlin 标准库以及任何兼容的依赖项转译为 JavaScript。这样，你的 Kotlin 应用程序就可以在任何支持 JavaScript 的环境中运行。

通过 [Kotlin Multiplatform Gradle 插件](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html) (`kotlin.multiplatform`) 在一个位置配置和管理面向 JavaScript 的 Kotlin 项目。

Kotlin Multiplatform Gradle 插件使你能够使用诸如控制应用程序打包以及直接从 npm 添加 JavaScript 依赖项等功能。要了解可用配置选项的概览，请参阅[设置 Kotlin/JS 项目](js-project-setup.md)。

> Kotlin/JS 的当前实现面向 [ES5](https://www.ecma-international.org/ecma-262/5.1/)、[ES2015](https://262.ecma-international.org/6.0/) 和 [ES2020](https://262.ecma-international.org/11.0/) 标准。
>
{style="tip"}

## Kotlin/JS 的用例 {id="use-cases-for-kotlin-js"}

以下是使用 Kotlin/JS 的一些常见方式：

* **在前端与 JVM 后端之间共享通用逻辑**

  如果你的后端是使用 Kotlin 或另一种 JVM 兼容语言编写的，你可以在 Web 应用程序与后端之间共享通用代码。这包括数据传输对象 (DTO)、验证和身份验证规则、REST API 端点抽象等。

* **在 Android、iOS 和 Web 客户端之间共享通用逻辑**

  你可以在 Web 界面与 Android 及 iOS 移动应用程序之间共享业务逻辑，同时保持原生用户界面。这避免了重复编写通用功能，例如 REST API 抽象、用户身份验证、表单验证和领域模型。

* **使用 Kotlin/JS 构建前端 Web 应用程序**

  使用 Kotlin 开发传统的 Web 前端，同时集成现有的工具和库：

    * 如果你熟悉 Android 开发，可以使用基于 Compose 的框架构建 Web 应用程序，例如 [Kobweb](https://kobweb.varabyte.com/) 或 [Kilua](https://kilua.dev/)。
    * 使用 JetBrains 提供的[针对常见 JavaScript 库的 Kotlin 包装器](https://github.com/JetBrains/kotlin-wrappers)，通过 Kotlin/JS 构建完全类型安全的 React 应用程序。Kotlin 包装器 (`kotlin-wrappers`) 为 React 和其他 JavaScript 框架提供了抽象和集成。

      这些包装器还支持补充库，如 [React Redux](https://react-redux.js.org/)、[React Router](https://reactrouter.com/) 和 [styled-components](https://styled-components.com/)。你还可以通过与 JavaScript 生态系统的互操作性来使用第三方 React 组件和组件库。

    * 使用 [Kotlin/JS 框架](js-frameworks.md)，这些框架与 Kotlin 生态系统集成，并支持简洁且具有表现力的代码。

* **构建支持旧版浏览器的多平台应用程序**

  通过 Compose Multiplatform，你可以使用 Kotlin 构建应用程序，并在 Web 项目中复用移动和桌面用户界面。虽然 [Kotlin/Wasm](wasm-overview.md) 是此用途的主要目标，但你也可以通过同时面向 Kotlin/JS 来扩展对旧版浏览器的支持。

* **使用 Kotlin/JS 构建服务器端和无服务器应用程序**

  Kotlin/JS 中的 Node.js 目标允许你在 JavaScript 运行时为服务器端或无服务器环境创建应用程序。这提供了快速启动和低内存使用情况。[`kotlinx-nodejs`](https://github.com/Kotlin/kotlinx-nodejs) 库提供了从 Kotlin 对 [Node.js API](https://nodejs.org/docs/latest/api/) 的类型安全访问。

根据你的用例，Kotlin/JS 项目可以使用来自 Kotlin 生态系统的兼容库，以及来自 JavaScript 和 TypeScript 生态系统的第三方库。

要从 Kotlin 代码中使用第三方库，你可以创建自己的类型安全包装器或使用社区维护的包装器。此外，你还可以使用 Kotlin/JS 的[动态类型](dynamic-type.md)，这允许你跳过严格的类型检查和库包装器，但代价是失去类型安全性。

Kotlin/JS 还兼容最常见的模块系统：[ESM](https://tc39.es/ecma262/#sec-modules)、[CommonJS](https://nodejs.org/api/modules.html#modules-commonjs-modules)、[UMD](https://github.com/umdjs/umd) 和 [AMD](https://github.com/amdjs/amdjs-api)。这允许你以结构化的方式[生产和使用模块](js-modules.md)，并与 JavaScript 生态系统集成。

### 分享你的用例 {id="share-your-use-cases"}

[Kotlin/JS 的用例](#use-cases-for-kotlin-js)中的列表并未列举详尽。欢迎尝试不同的方法，并找到最适合你项目的方案。

欢迎在 [Kotlin Slack](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up) 的 [#javascript](https://kotlinlang.slack.com/archives/C0B8L3U69) 频道中与 Kotlin/JS 社区分享你的用例、经验和问题。

## 开始使用 Kotlin/JS {id="get-started-with-kotlin-js"}

探索开始使用 Kotlin/JS 的基础知识和初步步骤：

* 如果你是 Kotlin 新手，请先查看[基本语法](basic-syntax.md)并探索 [Kotlin 游览](kotlin-tour-welcome.md)。
* 查看 [Kotlin/JS 示例项目](#sample-projects-for-kotlin-js)列表以获取灵感。这些示例包含有用的代码片段和模式，可以帮助你开始自己的项目。
* 如果你是 Kotlin/JS 新手，请在探索更高级的主题之前，先阅读[设置指南](js-project-setup.md)。

想要亲自尝试 Kotlin/JS 吗？

<a href="js-get-started.md" as="button" mode="rock" icon="arrow-right" icon-position="right">开始使用 Kotlin/JS</a>

## Kotlin/JS 示例项目 {id="sample-projects-for-kotlin-js"}

下表列出了一组示例项目，演示了各种 Kotlin/JS 用例、架构和代码共享策略：

| 项目 | 描述 |
|-----------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [在 Spring 与 Angular 之间共享代码的 Petclinic](https://github.com/Kotlin/kmp-spring-petclinic/#readme) | 演示了如何通过共享数据传输对象、验证和身份验证规则以及 REST API 端点抽象，来避免企业级应用程序中的代码重复。代码在 [Spring Boot](https://spring.io/projects/spring-boot) 后端和 [Angular](https://angular.dev/) 前端之间共享。 |
| [全栈会议 CMS](https://github.com/Kotlin/kmp-fullstack-conference-cms/#readme) | 展示了多种代码共享方案，涵盖了从最简单的代码共享到在 [Ktor](https://ktor.io/)、[Jetpack Compose](https://developer.android.com/compose) 和 [Vue.js](https://vuejs.org/) 应用程序之间进行全方位代码共享的各种方案。 |
| [基于 Compose-HTML 的 Kobweb 框架的 Todo 应用](https://github.com/varabyte/kobweb-templates/tree/main/examples/todo/#readme) | 展示了如何通过复用 Android 开发者熟悉的方案来创建一个待办事项列表应用程序。它构建了一个由 [Kobweb 框架](https://kobweb.varabyte.com/)驱动的客户端 UI 应用程序。 |
| [在 Android、iOS 和 Web 之间共享简单逻辑](https://github.com/Kotlin/kmp-logic-sharing-simple-example/#readme) | 包含一个使用 Kotlin 构建具有通用逻辑的项目模板，该逻辑可在 Android ([Jetpack Compose](https://developer.android.com/compose))、iOS ([SwiftUI](https://developer.apple.com/tutorials/swiftui/)) 和 Web ([React](https://react.dev/)) 的平台原生 UI 应用程序中使用。 |
| [全栈协作待办事项列表](https://github.com/kotlin-hands-on/jvm-js-fullstack/#readme) | 展示了如何使用带有 JS 和 JVM 目标的 Kotlin Multiplatform 创建一个用于协作工作的待办事项列表应用程序。后端使用 [Ktor](https://ktor.io/)，前端使用 Kotlin/JS 和 React。 |

## Kotlin/JS 框架 {id="kotlin-js-frameworks"}

Kotlin/JS 框架通过提供现成的组件、路由、状态管理和其他工具来构建现代 Web 应用程序，从而简化了 Web 开发。

[查看由不同作者编写的 Kotlin/JS 可用框架](js-frameworks.md)。

## 加入 Kotlin/JS 社区 {id="join-the-kotlin-js-community"}

你可以加入官方 [Kotlin Slack](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up) 中的 [#javascript](https://kotlinlang.slack.com/archives/C0B8L3U69) 频道，与社区和 Kotlin/JS 团队交流。

## 后续步骤 {id="what-s-next"}

* [设置 Kotlin/JS 项目](js-project-setup.md)
* [运行 Kotlin/JS 项目](running-kotlin-js.md)
* [调试 Kotlin/JS 代码](js-debugging.md)
* [在 Kotlin/JS 中运行测试](js-running-tests.md)