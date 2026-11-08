[//]: # (title: Kotlin RPC 入门)

<show-structure for="chapter" depth="2"/>

<web-summary>
在这份详尽的指南中，探索 RPC 的基本原理并深入了解 RPC 与 REST 之间的详细对比。学习如何使用 Kotlin RPC 创建你的第一个应用程序。
</web-summary>

<link-summary>
学习如何使用 Kotlin RPC 和 Ktor 创建你的第一个应用程序。
</link-summary>

<card-summary>
学习如何使用 Kotlin RPC 和 Ktor 创建你的第一个应用程序。
</card-summary>

<tldr>
<var name="example_name" value="tutorial-kotlin-rpc-app"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
<b>所用插件</b>：<Links href="server-routing.md" summary="Routing 是在服务器端应用程序中处理传入请求的核心插件。">Routing</Links>、
<a href="https://kotlinlang.org/api/kotlinx.serialization/">kotlinx.serialization</a>、
<a href="https://kotlin.github.io/kotlinx-rpc/get-started.html">kotlinx.rpc</a>
</p>
</tldr>

Kotlin RPC（远程过程调用，Remote Procedure Call）建立在成熟的基础之上，并在 [`kotlinx.rpc`](https://kotlin.github.io/kotlinx-rpc/get-started.html) 库上运行。

`kotlinx.rpc` 库使你能够使用常规的 Kotlin 语言结构跨越网络边界进行过程调用。因此，它提供了替代 REST 和 Google RPC (gRPC) 的选择。

在本文中，你将了解 Kotlin RPC 的核心概念并构建一个简单的应用程序。随后你便可以在自己的项目中评估该库。

## 前提条件 {id="prerequisites"}

本教程假定你对 Kotlin 编程有基本的了解。如果你刚接触 Kotlin，建议阅读一些[入门资料](https://kotlinlang.org/docs/getting-started.html)。

为了获得最佳体验，我们建议使用 [IntelliJ IDEA Ultimate](https://www.jetbrains.com/idea/download) 作为集成开发环境（IDE），因为它提供了全面的支持与工具，有助于提升你的生产力。

## 什么是 RPC？ {id="what-is-rpc"}

### 本地过程调用与远程过程调用 {id="local-vs-remote"}

过程调用是任何编程语言中的基本概念。严格来说，它们都是本地过程调用，因为它们始终发生在同一个程序内部。

远程过程调用是指函数调用及其形参通过某种方式在网络上传输，以便在单独的虚拟机或可执行文件中执行具体的实现。返回值则沿相反的路径返回到发起调用的计算机。

最简单的理解方式是将发起调用的计算机视为客户端，而将实现所在的计算机视为服务器。不过情况并不一定总是如此。作为对等架构的一部分，RPC 调用可以在两个方向上进行。为了使本教程保持简单，你可以假定采用客户端/服务器部署模式。

### RPC 框架基本原理 {id="rpc-framework-fundamentals"}

任何 RPC 框架都必须提供某些基础要素。在传统 IT 基础架构中实现远程过程调用时，这些要素是必不可少的。术语可能会有所不同，职责划分也可能有所区别，但每个 RPC 框架都必须提供：

1. 一种声明将要被远程调用的过程的方法。在面向对象编程中，接口是合乎逻辑的选择。这可以是当前语言提供的接口结构，也可以是某种与语言无关的标准，例如 [W3C 使用的 Web IDL](https://webidl.spec.whatwg.org/)。
2. 一种指定形参和返回值类型的方法。同样，你可以使用与语言无关的标准。不过，在当前语言中为标准数据类型声明添加注解可能会更简单。
3. 称为*客户端存根 (client stubs)*的帮助程序类，用于将过程调用转换为可以通过网络发送的格式，并解包返回的结果值。这些存根既可以在编译过程中创建，也可以在运行时动态生成。
4. 一个底层的 *RPC Runtime*（RPC 运行时），用于管理帮助程序类并监督远程过程调用的生命周期。在服务器端，该运行时需要嵌入到某种服务器中，以便能够持续处理请求。
5. 需要选择（或定义）协议来表示所调用的过程、序列化要发送的数据，并在网络中传输信息。在过去，某些技术从零开始定义了全新的协议（如 CORBA 中的 IIOP），而另一些技术则侧重于复用现有协议（如 SOAP 中的 HTTP POST）。

### 编组与序列化 {id="marshaling-vs-serialization"}

在 RPC 框架中，我们会谈到*编组 (marshaling)*和*解组 (unmarshaling)*。这是打包和解包要通过网络发送的信息的过程。它可以被视为序列化的超集。在编组过程中，你不仅在序列化对象，还需要打包有关正在调用的过程以及发起该调用的上下文的信息。

介绍完 RPC 的核心概念后，让我们通过构建一个示例应用程序来看看它们是如何在 `kotlinx.rpc` 中应用的。

## 你好，kotlinx.rpc {id="hello-kotlinx-rpc"}

你现在将创建一个用于在线订购披萨的应用程序。为了使代码尽可能简单，你将使用基于控制台的客户端。

### 创建项目 {id="create-project"}

首先，你将创建一个同时包含客户端和服务器实现的项目。

在更复杂的应用程序中，最佳做法是为客户端和服务器使用单独的模块。但是，为了让本教程更简单，你将使用单个模块来同时承载两者。

<procedure id="create-project-procedure">

1. 启动 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/)。
2. <p>
       在欢迎界面上，点击 <control>New Project</control>。
   </p>
   <p>
       或者，从主菜单中选择 <ui-path>File | New | Project</ui-path>。
   </p>
3. 在 **Name** 字段中，输入 <Path>KotlinRpcPizzaApp</Path> 作为项目名称。

   ![IntelliJ 新建 Kotlin 项目窗口](tutorial_kotlin_rpc_intellij_project.png){style="block" width="706" border-effect="rounded"}
4. 保留其余默认设置，然后点击 **Create**。

</procedure>

通常，你会立即配置项目构建文件。但是，由于这是一个无助于加深你对该技术理解的实现细节，因此我们将在最后再回到该步骤。

### 添加共享类型 {id="shared-types"}

任何 RPC 项目的核心都是定义要远程调用的过程的接口，以及在这些过程的定义中使用的类型。

在多模块项目中，这些类型需要进行共享。不过在此示例中，这一步不是必需的。

<procedure id="shared-types-procedure">

1. 导航到 <Path>src/main/kotlin</Path> 文件夹并创建一个名为 <Path>model</Path> 的新子包。
2. 在 <Path>model</Path> 包内，创建一个新的 <Path>PizzaShop.kt</Path> 文件，并包含以下实现：

   ```kotlin
   package com.example.model
   
   import kotlinx.coroutines.flow.Flow
   import kotlinx.serialization.Serializable
   import kotlinx.rpc.annotations.Rpc
   
   @Rpc
   interface PizzaShop {
       suspend fun orderPizza(pizza: Pizza): Receipt
   }
   
   @Serializable
   class Pizza(val name: String)
   
   @Serializable
   class Receipt(val amount: Double)
   ```

   该接口需要包含来自 `kotlinx.rpc` 库的 `@Rpc` 注解。

   由于你使用 [`kotlinx.serialization`](https://github.com/Kotlin/kotlinx.serialization) 来帮助在网络上传输信息，因此形参中使用的类型必须使用 `Serializable` 注解进行标记。

</procedure>

### 实现客户端 {id="client-implementation"}

<procedure id="client-impl-procedure">

1. 导航到 <Path>src/main/kotlin</Path> 并创建一个新的 <Path>Client.kt</Path> 文件。
2. 打开 <Path>Client.kt</Path> 并添加以下实现：

   ```kotlin
   package com.example
   
   import com.example.model.Pizza
   import com.example.model.PizzaShop
   import io.ktor.client.*
   import io.ktor.http.*
   import kotlinx.coroutines.runBlocking
   import kotlinx.rpc.withService
   import kotlinx.rpc.krpc.serialization.json.json
   import kotlinx.rpc.krpc.ktor.client.KtorRpcClient
   import kotlinx.rpc.krpc.ktor.client.installKrpc
   import kotlinx.rpc.krpc.ktor.client.rpc
   import kotlinx.rpc.krpc.ktor.client.rpcConfig
   import kotlinx.rpc.krpc.serialization.json.json
   
   fun main() = runBlocking {
       val ktorClient = HttpClient {
           installKrpc {
               serialization { json() }
           }
       }
   
       val client: KtorRpcClient = ktorClient.rpc {
           url {
               host = "localhost"
               port = 8080
               encodedPath = "pizza"
           }
   
           rpcConfig {
               serialization {
                   json()
               }
           }
       }
   
       val pizzaShop: PizzaShop = client.withService<PizzaShop>()
   
       val receipt = pizzaShop.orderPizza(Pizza("Pepperoni"))
       println("Your pizza cost ${receipt.amount}")
       ktorClient.close()
   }
   ```

</procedure>

通过上述代码，你准备并执行了一次 RPC 调用。

`kotlinx.rpc` 库使用 [Ktor 客户端](client-create-new-application.topic)在客户端托管其运行时。该运行时并未与 Ktor 强绑定，也可以选择其他方案，但这促进了复用，并使将 `kotlinx.rpc` 集成到现有的 Kotlin Multiplatform 应用程序中变得更加容易。

Ktor 客户端和 Kotlin RPC 均围绕协程构建，因此你使用 `runBlocking {}` 代码块来创建初始协程，并在其中执行客户端的其余部分：

```kotlin
fun main() = runBlocking {
}
```

> 请注意，`runBlocking {}` 是为概念验证（spike）和测试而设计的，不建议在生产代码中使用。
>
{style="tip"}

接下来，以标准方式创建 Ktor 客户端实例。`kotlinx.rpc` 使用 [WebSockets](client-websockets.topic) 插件来传输信息。通过使用 `installKrpc()` 函数，你可以确保该插件已加载：

```kotlin
val ktorClient = HttpClient {
    installKrpc {
        serialization { json() }
    }
}
```

创建 Ktor 客户端后，接着创建一个用于调用远程过程的 `KtorRpcClient` 对象。你配置了服务器的位置以及用于传输信息的机制：

```kotlin
    val client: KtorRpcClient = ktorClient.rpc {
        url {
            host = "localhost"
            port = 8080
            encodedPath = "pizza"
        }

        rpcConfig {
            serialization {
                json()
            }
        }
    }
```

至此，标准设置已完成，你可以开始使用特定于业务领域的功能了。你可以使用该客户端创建一个实现了 `PizzaShop` 接口方法的客户端代理对象：

```kotlin
package com.example

import com.example.model.Pizza
import com.example.model.PizzaShop
import io.ktor.client.*
import io.ktor.http.*
import kotlinx.coroutines.runBlocking
import kotlinx.rpc.withService
import kotlinx.rpc.krpc.serialization.json.json
import kotlinx.rpc.krpc.ktor.client.KtorRpcClient
import kotlinx.rpc.krpc.ktor.client.installKrpc
import kotlinx.rpc.krpc.ktor.client.rpc
import kotlinx.rpc.krpc.ktor.client.rpcConfig
import kotlinx.rpc.krpc.serialization.json.json

fun main() = runBlocking {
    val ktorClient = HttpClient {
        installKrpc {
            serialization { json() }
        }
    }

    val client: KtorRpcClient = ktorClient.rpc {
        url {
            host = "localhost"
            port = 8080
            encodedPath = "pizza"
        }

        rpcConfig {
            serialization {
                json()
            }
        }
    }

    val pizzaShop: PizzaShop = client.withService<PizzaShop>()

    /*
    val receipt = pizzaShop.orderPizza(Pizza("Pepperoni"))
    println("Your pizza cost ${receipt.amount}")
    */

    pizzaShop.orderPizza("AB12", Pizza("Pepperoni"))
    pizzaShop.orderPizza("AB12", Pizza("Hawaiian"))
    pizzaShop.orderPizza("AB12", Pizza("Calzone"))

    pizzaShop.orderPizza("CD34", Pizza("Margherita"))
    pizzaShop.orderPizza("CD34", Pizza("Sicilian"))
    pizzaShop.orderPizza("CD34", Pizza("California"))

    pizzaShop.viewOrders("AB12").collect {
        println("AB12 ordered ${it.name}")
    }

    pizzaShop.viewOrders("CD34").collect {
        println("CD34 ordered ${it.name}")
    }

    ktorClient.close()
}

```

然后你便可以发起远程过程调用并使用其结果：

```kotlin
val receipt = pizzaShop.orderPizza(Pizza("Pepperoni"))
println("Your pizza cost ${receipt.amount}")
```

在此步骤中，后台完成了大量工作。调用的详细信息和所有形参都被转换成一条消息，通过网络发送，然后接收并解码返回值。

最后，关闭客户端：

```kotlin
ktorClient.close()
```

### 实现服务器 {id="server-implementation"}

服务器端的实现分为两部分。首先，创建接口的实现，然后将其托管在服务器中。

<procedure id="create-interface">

1. 导航到 <Path>src/main/kotlin</Path> 并创建一个新的 <Path>Server.kt</Path> 文件。
2. 打开 <Path>Server.kt</Path> 并添加以下接口实现：

   ```kotlin
   package com.example
   
   import com.example.model.*
   import io.ktor.server.application.*
   
   class PizzaShopImpl : PizzaShop {
       override suspend fun orderPizza(pizza: Pizza): Receipt {
           return Receipt(7.89)
       }
   }
   ```

   虽然这不是一个功能完备的实现，但足以让我们的演示程序运行起来。

   实现的第二部分基于 Ktor 构建。
3. 将以下代码添加到同一文件中：

   ```kotlin
   fun main() {
       embeddedServer(Netty, port = 8080) {
           module()
           println("Server running")
       }.start(wait = true)
   }
   
   fun Application.module() {
       install(Krpc)
   
       routing {
           rpc("/pizza") {
               rpcConfig {
                   serialization {
                       json()
                   }
               }
   
               registerService<PizzaShop> { PizzaShopImpl() }
           }
       }
   }
   ```

   下面是代码解析：

   首先，使用 Netty 创建一个 Ktor 服务器实例，并使用指定的扩展函数进行配置：

   ```kotlin
   embeddedServer(Netty, port = 8080) {
       module()
       println("Server running")
   }.start(wait = true)
   ```

   然后，声明一个扩展 Ktor `Application` 类型的设置函数。这会安装 `kotlinx.rpc` 插件并声明一个或多个路由：

   ```kotlin
   fun Application.module() {
       install(Krpc)
   
       routing {
       }
   }
   ```

   在 routing 部分中，你使用 Ktor Routing DSL 的 `kotlinx.rpc` 扩展来声明一个端点。与在客户端一样，你需要指定 URL 并配置序列化。但在此处，我们的实现将监听该 URL 以接收传入请求：

   ```kotlin
           rpc("/pizza") {
               rpcConfig {
                   serialization {
                       json()
                   }
               }
   
               registerService<PizzaShop> { PizzaShopImpl() }
           }
   ```

   使用 `registerService {}` 将接口的实现提供给 RPC 运行时。

</procedure>

### 添加依赖项 {id="add-dependencies"}

现在你已经拥有运行该应用程序所需的全部代码，但目前它甚至无法编译。

虽然你可以使用带有 [`kotlinx.rpc`](https://kotlin.github.io/kotlinx-rpc/get-started.html) 插件的 Ktor 项目生成器，但你也可以手动配置构建文件：

<procedure id="configure-build-files">

1. 打开或创建 <Path>gradle/libs.versions.toml</Path> 文件，定义 Kotlin、`kotlinx.rpc` 和 Logback 的版本，以及库和插件别名：

   ```toml
   [versions]
   kotlin = "2.4.20"
   kotlinx-rpc = "0.10.4"
   logback = "1.6.3"
   
   [libraries]
   kotlin-test = { module = "org.jetbrains.kotlin:kotlin-test", version.ref = "kotlin" }
   kotlinx-rpc-krpc-client = { module = "org.jetbrains.kotlinx:kotlinx-rpc-krpc-client", version.ref = "kotlinx-rpc" }
   kotlinx-rpc-krpc-ktor-client = { module = "org.jetbrains.kotlinx:kotlinx-rpc-krpc-ktor-client", version.ref = "kotlinx-rpc" }
   kotlinx-rpc-krpc-ktor-server = { module = "org.jetbrains.kotlinx:kotlinx-rpc-krpc-ktor-server", version.ref = "kotlinx-rpc" }
   kotlinx-rpc-krpc-serialization-json = { module = "org.jetbrains.kotlinx:kotlinx-rpc-krpc-serialization-json", version.ref = "kotlinx-rpc" }
   kotlinx-rpc-krpc-server = { module = "org.jetbrains.kotlinx:kotlinx-rpc-krpc-server", version.ref = "kotlinx-rpc" }
   logback-classic = { module = "ch.qos.logback:logback-classic", version.ref = "logback" }
   
   [plugins]
   kotlin-jvm = { id = "org.jetbrains.kotlin.jvm", version.ref = "kotlin" }
   kotlin-serialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
   kotlinx-rpc = { id = "org.jetbrains.kotlinx.rpc.plugin", version.ref = "kotlinx-rpc" }
   
   ```

   Gradle 会通过构建文件中的 `libs` 自动使这些别名可用。
2. 打开 <Path>settings.gradle.kts</Path> 文件并导入 Ktor 版本目录（version catalog）：

   ```kotlin
   dependencyResolutionManagement {
       repositories {
           mavenCentral()
       }
       versionCatalogs {
           create("ktorLibs").from("io.ktor:ktor-version-catalog:3.6.1")
       }
   }
   ```

   此目录通过 `ktorLibs` 提供 Ktor 插件和依赖项别名。目录坐标中的版本决定了这些别名所使用的 Ktor 版本。
3. 在 <Path>build.gradle.kts</Path> 文件中，添加以下插件：

   ```kotlin
   plugins {
       alias(libs.plugins.kotlin.jvm)
       alias(libs.plugins.kotlin.serialization)
       alias(ktorLibs.plugins.ktor)
       alias(libs.plugins.kotlinx.rpc)
   }
   ```

   * `kotlinx.serialization` 插件用于生成将 Kotlin 对象转换为 JSON 的帮助程序类型。请记住，`kotlinx.serialization` 完全不使用反射。
   * Ktor 插件用于构建将应用与其所有依赖项打包在一起的 fat JAR。
   * RPC 插件用于生成客户端存根。
4. 添加以下依赖项：

   ```kotlin
   dependencies {
       implementation(ktorLibs.client.cio)
       implementation(libs.kotlinx.rpc.krpc.client)
       implementation(libs.kotlinx.rpc.krpc.ktor.client)
       implementation(ktorLibs.server.netty)
       implementation(libs.kotlinx.rpc.krpc.server)
       implementation(libs.kotlinx.rpc.krpc.ktor.server)
       implementation(libs.kotlinx.rpc.krpc.serialization.json)
       implementation(libs.logback.classic)
       testImplementation(libs.kotlin.test)
   }
   ```

   这将添加 Ktor 客户端与服务器、`kotlinx.rpc` 运行时的客户端和服务器部分，以及用于集成 `kotlinx.rpc` 和 `kotlinx-serialization` 的库。

   至此，你现在可以运行项目并开始进行 RPC 调用了。

</procedure>

### 运行应用程序 {id="run-application"}

要运行应用程序，请按照以下步骤操作：

<procedure id="run-app-procedure">

1. 导航到 <Path>Server.kt</Path> 文件。
2. 在 IntelliJ IDEA 中，点击 `main()` 函数旁的运行按钮
   (![IntelliJ IDEA 运行图标](intellij_idea_gutter_icon.svg){style="inline" height="16" width="16"})
   以启动应用程序。

   你应当会在 **Run** 工具面板中看到输出：

   ![IntelliJ IDEA 中的服务器运行输出](tutorial_kotlin_rpc_run_server.png){style="block" width="706" border-effect="line"}
3. 导航到 <Path>Client.kt</Path> 文件并运行应用程序。你应该会在控制台中看到以下输出：

   ```shell
   Your pizza cost 7.89

   Process finished with exit code 0
   ```

</procedure>

## 扩展此示例 {id="extend-the-example"}

最后，你可以增加示例应用程序的复杂度，为未来的开发打下坚实的基础。

<procedure id="extend-server">

1. 在 <Path>PizzaShop.kt</Path> 文件中，通过包含客户端 ID 来扩展 `orderPizza` 方法，并添加一个返回指定客户端所有待处理订单的 `viewOrders()` 方法：

   ```kotlin
   package com.example.model
   
   import kotlinx.coroutines.flow.Flow
   import kotlinx.serialization.Serializable
   import kotlinx.rpc.annotations.Rpc
   
   @Rpc
   interface PizzaShop {
       suspend fun orderPizza(clientID: String, pizza: Pizza): Receipt
       fun viewOrders(clientID: String): Flow<Pizza>
   }
   ```

   你可以利用协程库的优势，返回一个 `Flow` 而不是 `List` 或 `Set`。这将允许你一次一条披萨订单地将信息流式传输给客户端。
2. 导航到 <Path>Server.kt</Path> 文件，并通过在 Map 映射的 List 中存储当前订单来实现此功能：

   ```kotlin
   class PizzaShopImpl : PizzaShop {
       private val openOrders = mutableMapOf<String, MutableList<Pizza>>()
   
       override suspend fun orderPizza(clientID: String, pizza: Pizza): Receipt {
           if(openOrders.containsKey(clientID)) {
               openOrders[clientID]?.add(pizza)
           } else {
               openOrders[clientID] = mutableListOf(pizza)
           }
           return Receipt(3.45)
       }
   
       override fun viewOrders(clientID: String): Flow<Pizza> {
           val orders = openOrders[clientID]
           if (orders != null) {
               return flow {
                   for (order in orders) {
                       emit(order)
                       delay(1000)
                   }
               }
           }
           return flow {}
       }
   }
   ```

   服务器会为每个连接的客户端创建一个新的 `PizzaShopImpl` 实例。这通过隔离客户端的状态来避免彼此冲突。
   > 此实现不是线程安全的。如果同一个 `PizzaShopImpl` 实例接收并发调用，它们可能会同时修改 `openOrders` 并导致数据损坏。在生产代码中，请使用线程安全的数据结构。
   > 
   {style="warning"}
3. 在 <Path>Client.kt</Path> 文件中，使用两个不同的客户端 ID 提交多个订单：

   ```kotlin
       val pizzaShop: PizzaShop = client.withService<PizzaShop>()
   
       pizzaShop.orderPizza("AB12", Pizza("Pepperoni"))
       pizzaShop.orderPizza("AB12", Pizza("Hawaiian"))
       pizzaShop.orderPizza("AB12", Pizza("Calzone"))
   
       pizzaShop.orderPizza("CD34", Pizza("Margherita"))
       pizzaShop.orderPizza("CD34", Pizza("Sicilian"))
       pizzaShop.orderPizza("CD34", Pizza("California"))
   ```

   然后，你使用 `Coroutines` 库和 `collect` 方法遍历结果：

   ```kotlin
       pizzaShop.viewOrders("AB12").collect {
           println("AB12 ordered ${it.name}")
       }
   
       pizzaShop.viewOrders("CD34").collect {
           println("CD34 ordered ${it.name}")
       }
   ```
4. 运行服务器和客户端。运行客户端时，你将看到结果逐步显示：

   ![逐步显示结果的客户端输出](tutorial_kotlin_rpc_run_client.gif){style="block" width="706" border-effect="line"}

</procedure>

创建了一个可运行的示例之后，现在让我们深入探讨其工作原理。特别是，我们将 Kotlin RPC 与两大主流替代方案——REST 和 gRPC 进行比较与对照。

## RPC 与 REST 对比 {id="rpc-vs-rest"}

RPC 的概念比 REST 要早得多，[至少可以追溯到 1981 年](https://en.wikipedia.org/wiki/Remote_procedure_call)。与 REST 相比，基于 RPC 的方法不会限制你使用统一接口（例如 HTTP 请求类型），在代码中使用起来要简单得多，并且得益于二进制消息传输，性能表现可能更高。

然而，REST 具有三大主要优势：

1. 它可以在浏览器中直接被 JavaScript 客户端使用，从而作为单页应用程序的一部分。由于 RPC 框架依赖于生成的存根和二进制消息传输，因此它们与 JavaScript 生态系统的契合度不高。
2. REST 能够明确体现某项功能何时涉及网络通信。这有助于避免 Martin Fowler 所指出的[分布式对象反模式 (distributed objects antipattern)](https://martinfowler.com/articles/distributed-objects-microservices.html)。当团队将其面向对象设计拆分为两个或多个部分，却没有考虑到将本地过程调用转变为远程调用所带来的性能和可靠性影响时，就会发生这种情况。
3. REST API 建立在一系列约定之上，这使得它们相对易于创建、编写文档、监控、调试和测试。并且有一个庞大的工具生态系统来为此提供支持。

这些权衡意味着 Kotlin RPC 最适合在两种场景中使用：第一，在使用 [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/) 的 KMP 客户端中；第二，在云端协同工作的微服务之间。未来 [Kotlin/Wasm](https://kotlinlang.org/docs/wasm-overview.html) 的发展可能会使 `kotlinx.rpc` 更加适用于基于浏览器的应用程序。

## Kotlin RPC 与 Google RPC 对比 {id="kotlin-rpc-vs-google-rpc"}

Google RPC 是目前软件行业中占主导地位的 RPC 技术。它使用名为 Protocol Buffers (protobuf) 的标准，通过与语言无关的接口定义语言（IDL）来定义数据结构和消息负载。这些 IDL 定义可以转换为各种各样的编程语言代码，并使用紧凑高效的二进制格式进行序列化。Quarkus 和 Micronaut 等微服务框架已经对 gRPC 提供了支持。

Kotlin RPC 很难与 gRPC 竞争，而且这样做对 Kotlin 社区没有任何好处。值得庆幸的是，目前并没有这样的计划。相反，kotlinx.rpc 的目标是与 gRPC 保持兼容并实现互操作。kotlinx.rpc 服务将可以使用 gRPC 作为其网络协议，kotlinx.rpc 客户端也能够调用 gRPC 服务。`kotlinx.rpc` 将使用[其自有的 kRPC 协议](https://kotlin.github.io/kotlinx-rpc/transport.html)作为默认选项（正如我们当前示例中的情况），但没有什么能阻止你选择使用 gRPC。

## 后续步骤 {id="next-steps"}

Kotlin RPC 将 Kotlin 生态系统拓展到了新的方向，为创建和使用服务提供了不同于 REST 和 GraphQL 的替代方案。它构建在经过验证的库和框架之上，例如 Ktor、Coroutines 以及 `kotlinx-serialization`。对于希望利用 Kotlin Multiplatform 和 Compose Multiplatform 的团队而言，它将为分布式消息传递提供一个简单而高效的选项。

如果这篇入门介绍激发了你的兴趣，请务必查看 [官方 `kotlinx.rpc` 文档](https://kotlin.github.io/kotlinx-rpc/get-started.html) 和 [示例](https://github.com/Kotlin/kotlinx-rpc/tree/main/samples)。

`kotlinx.rpc` 库仍处于早期阶段，因此我们鼓励你探索它并分享你的反馈。可以在 [YouTrack](https://youtrack.jetbrains.com/issues/KRPC) 上查看错误报告和功能请求，而日常讨论则在 [Slack](https://kotlinlang.slack.com/archives/C072YJ3Q91V)（[申请访问权限](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)）中进行。