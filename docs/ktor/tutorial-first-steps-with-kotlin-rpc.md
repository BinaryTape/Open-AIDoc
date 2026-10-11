<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       title="Kotlin RPC 入门" id="tutorial-first-steps-with-kotlin-rpc">
<show-structure for="chapter" depth="2"/>
<web-summary>
    在这篇详尽的指南中了解 RPC 的基础知识，并深入探索 RPC 与 REST 之间的详细对比。学习如何使用 Kotlin RPC 构建您的第一个应用程序。
</web-summary>
<link-summary>
    了解如何使用 Kotlin RPC 和 Ktor 构建您的第一个应用程序。
</link-summary>
<card-summary>
    了解如何使用 Kotlin RPC 和 Ktor 构建您的第一个应用程序。
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
        <b>使用的插件</b>：<Links href="/ktor/server-routing" summary="Routing 是在服务器应用程序中处理传入请求的核心插件。">Routing</Links>、
        <a href="https://kotlinlang.org/api/kotlinx.serialization/">kotlinx.serialization</a>、
        <a href="https://kotlin.github.io/kotlinx-rpc/get-started.html">kotlinx.rpc</a>
    </p>
</tldr>
<p>
    Kotlin RPC（远程过程调用）是 Kotlin 生态系统令人兴奋的一项新扩展，它建立在成熟的基础之上，并在 <code>kotlinx.rpc</code> 库上运行。
</p>
<p>
    <code>kotlinx.rpc</code> 库允许你仅使用常规的 Kotlin 语言结构跨越网络边界进行过程调用。因此，它提供了替代 REST 和 Google RPC (gRPC) 的另一种选择。
</p>
<p>
    在本文中，我们将介绍 Kotlin RPC 的核心概念并构建一个简单的应用程序。随后你便可以在自己的项目中对其进行评估。
</p>
<chapter title="先决条件" id="prerequisites">
    <p>
        本教程假设你对 Kotlin 编程有基本的了解。如果你刚接触 Kotlin，建议先阅读一些<a href="https://kotlinlang.org/docs/getting-started.html">入门资料</a>。
    </p>
    <p>为了获得最佳体验，我们推荐使用 <a
            href="https://www.jetbrains.com/idea/download">IntelliJ
        IDEA Ultimate</a> 作为集成开发环境 (IDE)，因为它提供了全面的支持和工具，能够提升你的开发效率。
    </p>
</chapter>
<chapter title="什么是 RPC？" id="what-is-rpc">
    <chapter title="本地过程调用 vs. 远程过程调用" id="local-vs-remote">
        <p>
            任何有编程经验的人都会熟悉过程调用的概念。这是任何编程语言中的基本概念。严格来说，这些都是本地过程调用，因为它们始终在同一个程序内执行。
        </p>
        <p>
            远程过程调用是指函数调用和形参通过某种方式在网络上传输，以便在单独的虚拟机/可执行文件中执行实现。返回值则按相反路径传回发起调用的计算机。
        </p>
        <p>
            最简单的方式是将发起调用的计算机视为客户端，而将实现所在的计算机视为服务器。不过情况并非绝对如此。作为对等（peer）架构的一部分，RPC 调用可以在两个方向上进行。但为了简单起见，我们假定采用客户端/服务器部署。
        </p>
    </chapter>
    <chapter title="RPC 框架基础" id="rpc-framework-fundamentals">
        <p>
            任何 RPC 框架都必须提供某些基础功能。在传统的 IT 基础架构中实现远程过程调用时，这些是不可或缺的。术语可能有所不同，职责分工也可能各有差异，但每个 RPC 框架都必须提供：
        </p>
        <list type="decimal">
            <li>
                一种声明将被远程调用的过程的方法。在面向对象编程中，接口是自然的选择。这可以是当前语言提供的接口结构，也可以是某种语言中立的标准，例如 <a
                    href="https://webidl.spec.whatwg.org/">W3C 使用的 Web IDL</a>。
            </li>
            <li>
                一种指定形参和返回值所用类型的方式。同样，你可以使用语言中立的标准。然而，直接在当前语言的标准数据类型声明上添加注解可能更简单。
            </li>
            <li>
                被称为<format style="italic">客户端存根 (client stubs)</format>的帮助程序类，用于将过程调用转换为可以通过网络发送的格式，并解包返回的结果值。这些存根可以在编译过程中生成，也可以在运行时动态创建。
            </li>
            <li>
                一个底层 <format style="italic">RPC 运行时</format>，用于管理帮助程序类并监管远程过程调用的生命周期。在服务器端，该运行时需要嵌入在某种服务器中，以便能够持续处理请求。
            </li>
            <li>
                需要选择（或定义）协议来表示被调用的过程、序列化要发送的数据，并在网络上传输信息。过去，某些技术从零开始定义了新协议（如 CORBA 中的 IIOP），而另一些技术则专注于复用现有协议（如 SOAP 中的 HTTP POST）。
            </li>
        </list>
    </chapter>
    <chapter title="编组 vs. 序列化" id="marshaling-vs-serialization">
        <p>
            在 RPC 框架中，我们会提到<format style="italic">编组 (marshaling)</format>和<format style="italic">解组 (unmarshaling)</format>。这是打包和解包要通过网络发送的信息的过程。它可以被视为序列化的超集。在编组中，我们不仅在序列化对象，还需要打包有关被调用过程以及该调用发生上下文的信息。
        </p>
    </chapter>
    <p>
        介绍了 RPC 的核心概念后，让我们通过构建一个示例应用程序来看看它们在 <code>kotlinx.rpc</code> 中是如何应用的。
    </p>
</chapter>
<chapter title="Hello, kotlinx.rpc" id="hello-kotlinx-rpc">
    <p>
        让我们创建一个通过网络订购披萨的应用程序。为了使代码尽可能简单，我们将使用基于控制台的客户端。
    </p>
    <chapter title="创建项目" id="create-project">
        <p>首先，你将创建一个包含客户端和服务器实现的项目。</p>
        <p>
            在更复杂的应用程序中，最佳做法是为客户端和服务器使用单独的模块。然而，为了本教程的简单起见，我们将两者使用同一个模块。
        </p>
        <procedure id="create-project-procedure">
            <step>
                启动 <a href="https://www.jetbrains.com/idea/download/">IntelliJ IDEA</a>。
            </step>
            <step>
                <p>
                    在欢迎屏幕上，点击 <control>New Project</control>。
                </p>
                <p>
                    或者，从主菜单中选择 <ui-path>File | New | Project</ui-path>。
                </p>
            </step>
            <step>
                在
                <control>Name</control>
                字段中，输入
                <Path>KotlinRpcPizzaApp</Path>
                作为项目名称。
                <img src="tutorial_kotlin_rpc_intellij_project.png" alt="IntelliJ New Kotlin Project window"
                     style="block" width="706" border-effect="rounded"/>
            </step>
            <step>
                保留其余默认设置，然后点击
                <control>Create</control>。
            </step>
        </procedure>
        <p>
            通常情况下，你需要立即配置项目的构建文件。但是，由于这是一个不会加深你对该技术理解的实现细节，因此我们将在最后再返回执行该步骤。
        </p>
    </chapter>
    <chapter title="添加共享类型" id="shared-types">
        <p>
            任何 RPC 项目的核心都是用于定义将要远程调用的过程的接口，以及在这些过程定义中使用的类型。
        </p>
        <p>
            在多模块项目中，这些类型需要共享。但在本示例中，这一步不是必需的。
        </p>
        <procedure id="shared-types-procedure">
            <step>
                导航至
                <Path>src/main/kotlin</Path>
                文件夹，并创建一个名为
                <Path>model</Path>
                的新子包。
            </step>
            <step>
                在
                <Path>model</Path>
                包中，创建具有以下实现的新
                <Path>PizzaShop.kt</Path>
                文件：
                <code-block lang="kotlin" code="package com.example.model&#10;&#10;import kotlinx.coroutines.flow.Flow&#10;import kotlinx.serialization.Serializable&#10;import kotlinx.rpc.annotations.Rpc&#10;&#10;@Rpc&#10;interface PizzaShop {&#10;    suspend fun orderPizza(pizza: Pizza): Receipt&#10;}&#10;&#10;@Serializable&#10;class Pizza(val name: String)&#10;&#10;@Serializable&#10;class Receipt(val amount: Double)"/>
                <p>
                    该接口需要带有来自 <code>kotlinx.rpc</code> 库的 <code>@Rpc</code> 注解。
                </p>
                <p>
                    因为你使用 <a href="https://github.com/Kotlin/kotlinx.serialization"><code>kotlinx.serialization</code></a>
                    来协助在网络上传输信息，所以形参中使用的类型必须标有 <code>Serializable</code> 注解。
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="实现客户端" id="client-implementation">
        <procedure id="client-impl-procedure">
            <step>
                导航至
                <Path>src/main/kotlin</Path>
                并创建一个新的
                <Path>Client.kt</Path>
                文件。
            </step>
            <step>
                打开
                <Path>Client.kt</Path>
                并添加以下实现：
                <code-block lang="kotlin" code="package com.example&#10;&#10;import com.example.model.Pizza&#10;import com.example.model.PizzaShop&#10;import io.ktor.client.*&#10;import io.ktor.http.*&#10;import kotlinx.coroutines.runBlocking&#10;import kotlinx.rpc.withService&#10;import kotlinx.rpc.krpc.serialization.json.json&#10;import kotlinx.rpc.krpc.ktor.client.KtorRpcClient&#10;import kotlinx.rpc.krpc.ktor.client.installKrpc&#10;import kotlinx.rpc.krpc.ktor.client.rpc&#10;import kotlinx.rpc.krpc.ktor.client.rpcConfig&#10;import kotlinx.rpc.krpc.serialization.json.json&#10;&#10;fun main() = runBlocking {&#10;    val ktorClient = HttpClient {&#10;        installKrpc {&#10;            serialization { json() }&#10;        }&#10;    }&#10;&#10;    val client: KtorRpcClient = ktorClient.rpc {&#10;        url {&#10;            host = &quot;localhost&quot;&#10;            port = 8080&#10;            encodedPath = &quot;pizza&quot;&#10;        }&#10;&#10;        rpcConfig {&#10;            serialization {&#10;                json()&#10;            }&#10;        }&#10;    }&#10;&#10;    val pizzaShop: PizzaShop = client.withService&lt;PizzaShop&gt;()&#10;&#10;    val receipt = pizzaShop.orderPizza(Pizza(&quot;Pepperoni&quot;))&#10;    println(&quot;Your pizza cost ${receipt.amount}&quot;)&#10;    ktorClient.close()&#10;}"/>
            </step>
        </procedure>
        <p>
            只需 25 行代码即可准备并执行 RPC 调用。显然这背后发生了很多事情，让我们将代码分解为各个部分。
        </p>
        <p>
            <code>kotlinx.rpc</code> 库使用 <Links href="/ktor/client-create-new-application" summary="创建第一个用于发送请求和接收响应的客户端应用程序。">Ktor 客户端</Links>在客户端托管其运行时。该运行时并未与 Ktor 强绑定，也可以选择其他方案，但这促进了复用，并使得将 <code>kotlinx.rpc</code> 集成到现有的 KMP 应用程序中变得非常容易。
        </p>
        <p>
            Ktor 客户端和 Kotlin RPC 均围绕协程构建，因此你可以使用 <code>runBlocking</code> 来创建初始协程，并在其中执行客户端的其余部分：
        </p>
        <code-block lang="kotlin" code="fun main() = runBlocking {&#10;}"/>
        <tip>
            请注意，<code>runBlocking</code> 是为探索性测试和测试设计的，而不是用于生产代码。
        </tip>
        <p>
            接下来，你以标准方式创建 Ktor 客户端的实例。<code>kotlinx.rpc</code> 在底层使用 <Links href="/ktor/client-websockets" summary="Websockets 插件允许你在服务器和客户端之间创建多路通信会话。">WebSockets</Links> 插件来传输信息。你只需使用 <code>installKrpc()</code> 函数确保其已加载：
        </p>
        <code-block lang="kotlin" code="    val ktorClient = HttpClient {&#10;        installKrpc {&#10;            serialization { json() }&#10;        }&#10;    }"/>
        <p>
            创建好这个 Ktor 客户端后，你接着创建一个用于调用远程过程的 <code>KtorRpcClient</code> 对象。你需要配置服务器的位置以及用于传输信息的机制：
        </p>
        <code-block lang="kotlin" code="    val client: KtorRpcClient = ktorClient.rpc {&#10;        url {&#10;            host = &quot;localhost&quot;&#10;            port = 8080&#10;            encodedPath = &quot;pizza&quot;&#10;        }&#10;&#10;        rpcConfig {&#10;            serialization {&#10;                json()&#10;            }&#10;        }&#10;    }"/>
        <p>
            此时，标准设置已完成，你已准备好使用特定于问题领域的功能。你可以使用该客户端创建一个客户端代理对象，该对象实现了 <code>PizzaShop</code> 接口的方法：
        </p>
        <code-block lang="kotlin"
                    include-symbol="pizzaShop" code="package com.example&#10;&#10;import com.example.model.Pizza&#10;import com.example.model.PizzaShop&#10;import io.ktor.client.*&#10;import io.ktor.http.*&#10;import kotlinx.coroutines.runBlocking&#10;import kotlinx.rpc.withService&#10;import kotlinx.rpc.krpc.serialization.json.json&#10;import kotlinx.rpc.krpc.ktor.client.KtorRpcClient&#10;import kotlinx.rpc.krpc.ktor.client.installKrpc&#10;import kotlinx.rpc.krpc.ktor.client.rpc&#10;import kotlinx.rpc.krpc.ktor.client.rpcConfig&#10;import kotlinx.rpc.krpc.serialization.json.json&#10;&#10;fun main() = runBlocking {&#10;    val ktorClient = HttpClient {&#10;        installKrpc {&#10;            serialization { json() }&#10;        }&#10;    }&#10;&#10;    val client: KtorRpcClient = ktorClient.rpc {&#10;        url {&#10;            host = &quot;localhost&quot;&#10;            port = 8080&#10;            encodedPath = &quot;pizza&quot;&#10;        }&#10;&#10;        rpcConfig {&#10;            serialization {&#10;                json()&#10;            }&#10;        }&#10;    }&#10;&#10;    val pizzaShop: PizzaShop = client.withService&lt;PizzaShop&gt;()&#10;&#10;    /*&#10;    val receipt = pizzaShop.orderPizza(Pizza(&quot;Pepperoni&quot;))&#10;    println(&quot;Your pizza cost ${receipt.amount}&quot;)&#10;    */&#10;&#10;    pizzaShop.orderPizza(&quot;AB12&quot;, Pizza(&quot;Pepperoni&quot;))&#10;    pizzaShop.orderPizza(&quot;AB12&quot;, Pizza(&quot;Hawaiian&quot;))&#10;    pizzaShop.orderPizza(&quot;AB12&quot;, Pizza(&quot;Calzone&quot;))&#10;&#10;    pizzaShop.orderPizza(&quot;CD34&quot;, Pizza(&quot;Margherita&quot;))&#10;    pizzaShop.orderPizza(&quot;CD34&quot;, Pizza(&quot;Sicilian&quot;))&#10;    pizzaShop.orderPizza(&quot;CD34&quot;, Pizza(&quot;California&quot;))&#10;&#10;    pizzaShop.viewOrders(&quot;AB12&quot;).collect {&#10;        println(&quot;AB12 ordered ${it.name}&quot;)&#10;    }&#10;&#10;    pizzaShop.viewOrders(&quot;CD34&quot;).collect {&#10;        println(&quot;CD34 ordered ${it.name}&quot;)&#10;    }&#10;&#10;    ktorClient.close()&#10;}"/>
        <p>
            随后即可进行远程过程调用并使用其结果：
        </p>
        <code-block lang="kotlin" code="    val receipt = pizzaShop.orderPizza(Pizza(&quot;Pepperoni&quot;))&#10;    println(&quot;Your pizza cost ${receipt.amount}&quot;)"/>
        <p>
            请注意，此时底层已经为你处理了大量繁重的工作。调用的详细信息和所有实参都必须转换为消息并跨网络发送，然后接收并解码返回值。这种对调用方完全透明的过程正是初始设置的回报。
        </p>
        <p>
            最后，我们照常关闭客户端：
        </p>
        <code-block lang="kotlin" code="    ktorClient.close()"/>
    </chapter>
    <chapter title="实现服务器" id="server-implementation">
        <p>
            服务器端的实现分为两部分。首先，你需要创建接口的实现；其次，你需要将其托管在服务器中。
        </p>
        <procedure id="create-interface">
            <step>
                导航至
                <Path>src/main/kotlin</Path>
                并创建一个新的
                <Path>Server.kt</Path>
                文件。
            </step>
            <step>
                打开
                <Path>Server.kt</Path>
                并添加以下接口实现：
                <code-block lang="kotlin" code="package com.example&#10;&#10;import com.example.model.*&#10;import io.ktor.server.application.*&#10;class PizzaShopImpl : PizzaShop {&#10;    override suspend fun orderPizza(pizza: Pizza): Receipt {&#10;        return Receipt(7.89)&#10;    }&#10;}"/>
                <p>
                    显而易见，这并不是实际生产中的实现，但足以让我们的演示运行起来。
                </p>
                <p>
                    实现的第二部分构建在 Ktor 之上。
                </p>
            </step>
            <step>
                <p>
                    将以下代码添加到同一个文件中：
                </p>
                <code-block lang="kotlin" code="fun main() {&#10;    embeddedServer(Netty, port = 8080) {&#10;        module()&#10;        println(&quot;Server running&quot;)&#10;    }.start(wait = true)&#10;}&#10;&#10;fun Application.module() {&#10;    install(Krpc)&#10;&#10;    routing {&#10;        rpc(&quot;/pizza&quot;) {&#10;            rpcConfig {&#10;                serialization {&#10;                    json()&#10;                }&#10;            }&#10;&#10;            registerService&lt;PizzaShop&gt; { PizzaShopImpl() }&#10;        }&#10;    }&#10;}"/>
                <p>以下是代码分解：</p>
                <p>
                    首先，你创建了一个 Ktor/Netty 实例，并使用指定的扩展函数进行配置：
                </p>
                <code-block lang="kotlin" code="    embeddedServer(Netty, port = 8080) {&#10;        module()&#10;        println(&quot;Server running&quot;)&#10;    }.start(wait = true)"/>
                <p>
                    然后，你声明了一个扩展 Ktor Application 类型的安装函数。它安装了 <code>kotlinx.rpc</code> 插件并声明了一个或多个路由：
                </p>
                <code-block lang="kotlin" code="fun Application.module() {&#10;    install(Krpc)&#10;&#10;    routing {&#10;    }&#10;}"/>
                <p>
                    在 routing 区域内，使用 <code>kotlinx.rpc</code> 对 Ktor Routing DSL 的扩展来声明一个端点。与客户端一样，你指定了 URL 并配置了序列化。但在本例中，我们的实现将侦听该 URL 上的传入请求：
                </p>
                <code-block lang="kotlin" code="        rpc(&quot;/pizza&quot;) {&#10;            rpcConfig {&#10;                serialization {&#10;                    json()&#10;                }&#10;            }&#10;&#10;            registerService&lt;PizzaShop&gt; { PizzaShopImpl() }&#10;        }"/>
                <p>
                    请注意，你使用 <code>registerService</code> 向 RPC 运行时提供接口的实现。你可能希望有多个实例，但这将是后续文章讨论的主题。
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="添加依赖项" id="add-dependencies">
        <p>
            现在你已经拥有运行该应用程序所需的所有代码，但目前它甚至无法编译，更不用说执行了。
            你可以使用带有 <a href="https://kotlin.github.io/kotlinx-rpc/get-started.html">kotlinx.rpc</a> 插件的 Ktor 项目生成器，也可以手动配置构建文件。
            这也不算太复杂。
        </p>
        <procedure id="configure-build-files">
            <step>
                在
                <Path>build.gradle.kts</Path>
                文件中，添加以下插件：
                <code-block lang="kotlin" code="plugins {&#10;    kotlin(&quot;jvm&quot;) version &quot;2.3.0&quot;&#10;    kotlin(&quot;plugin.serialization&quot;) version &quot;2.3.0&quot;&#10;    id(&quot;io.ktor.plugin&quot;) version &quot;3.6.0&quot;&#10;    id(&quot;org.jetbrains.kotlinx.rpc.plugin&quot;) version &quot;0.10.1&quot;&#10;}"/>
                <p>
                    添加 Kotlin 插件的原因不言而喻。至于其他插件的说明如下：
                </p>
                <list>
                    <li>
                        需要 <code>kotlinx.serialization</code> 插件来生成将 Kotlin 对象转换为 JSON 的帮助程序类型。请记住，<code>kotlinx.serialization</code> 不使用反射。
                    </li>
                    <li>
                        Ktor 插件用于构建将应用与其所有依赖项打包在一起的 fat JAR。
                    </li>
                    <li>
                        需要 RPC 插件来为客户端生成存根。
                    </li>
                </list>
            </step>
            <step>
                添加以下依赖项：
                <code-block lang="kotlin" code="    implementation(&quot;io.ktor:ktor-client-cio-jvm&quot;)&#10;    implementation(&quot;org.jetbrains.kotlinx:kotlinx-rpc-krpc-client:0.10.1&quot;)&#10;    implementation(&quot;org.jetbrains.kotlinx:kotlinx-rpc-krpc-ktor-client:0.10.1&quot;)&#10;    implementation(&quot;io.ktor:ktor-server-netty-jvm&quot;)&#10;    implementation(&quot;org.jetbrains.kotlinx:kotlinx-rpc-krpc-server:0.10.1&quot;)&#10;    implementation(&quot;org.jetbrains.kotlinx:kotlinx-rpc-krpc-ktor-server:0.10.1&quot;)&#10;    implementation(&quot;org.jetbrains.kotlinx:kotlinx-rpc-krpc-serialization-json:0.10.1&quot;)&#10;    implementation(&quot;ch.qos.logback:logback-classic:1.5.33&quot;)&#10;    testImplementation(kotlin(&quot;test&quot;))&#10;}"/>
                <p>
                    这将添加 Ktor 客户端和服务器、<code>kotlinx.rpc</code> 运行时的客户端和服务器部分，以及用于集成 <code>kotlinx.rpc</code> 和 <code>kotlinx-serialization</code> 的库。
                </p>
                <p>
                    完成这些后，你现在可以运行项目并开始进行 RPC 调用了。
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="运行应用程序" id="run-application">
        <p>
            要运行演示，请按照以下步骤操作：
        </p>
        <procedure id="run-app-procedure">
            <step>
                导航至
                <Path>Server.kt</Path>
                文件。
            </step>
            <step>
                <p>在 IntelliJ IDEA 中，点击 <code>main()</code> 函数旁边的运行按钮
                    （<img src="intellij_idea_gutter_icon.svg"
                          style="inline" height="16" width="16"
                          alt="intelliJ IDEA run icon"/>）
                    以启动应用程序。</p>
                <p>
                    你应该会在
                    <control>Run</control>
                    工具面板中看到输出：
                </p>
                <img src="tutorial_kotlin_rpc_run_server.png" alt="Run server output in intelliJ IDEA"
                     style="block" width="706" border-effect="line"/>
            </step>
            <step>
                导航至
                <Path>Client.kt</Path>
                文件并运行应用程序。你应该会在控制台中看到以下输出：
                <code-block lang="shell" code="                        Your pizza cost 7.89&#10;&#10;                        Process finished with exit code 0"/>
            </step>
        </procedure>
    </chapter>
</chapter>
<chapter title="扩展示例" id="extend-the-example">
    <p>
        最后，让我们增加示例应用程序的复杂度，为未来的开发打下坚实的基础。
    </p>
    <procedure id="extend-server">
        <step>
            在
            <Path>PizzaShop.kt</Path>
            文件中，通过加入客户端 ID 扩展 <code>orderPizza</code> 方法，并添加一个 <code>viewOrders</code> 方法以返回指定客户端的所有挂起订单：
            <code-block lang="kotlin" code="package com.example.model&#10;&#10;import kotlinx.coroutines.flow.Flow&#10;import kotlinx.serialization.Serializable&#10;import kotlinx.rpc.annotations.Rpc&#10;&#10;@Rpc&#10;interface PizzaShop {&#10;    suspend fun orderPizza(clientID: String, pizza: Pizza): Receipt&#10;    fun viewOrders(clientID: String): Flow&lt;Pizza&gt;&#10;}"/>
            <p>
                你可以通过返回 <code>Flow</code> 而不是 <code>List</code> 或 <code>Set</code> 来充分利用协程库。这将使你能够逐个将披萨信息以流式传输给客户端。
            </p>
        </step>
        <step>
            导航至
            <Path>Server.kt</Path>
            文件，并通过将当前订单存储在列表映射（map of lists）中来实现此功能：
            <code-block lang="kotlin" code="class PizzaShopImpl : PizzaShop {&#10;    private val openOrders = mutableMapOf&lt;String, MutableList&lt;Pizza&gt;&gt;()&#10;&#10;    override suspend fun orderPizza(clientID: String, pizza: Pizza): Receipt {&#10;        if(openOrders.containsKey(clientID)) {&#10;            openOrders[clientID]?.add(pizza)&#10;        } else {&#10;            openOrders[clientID] = mutableListOf(pizza)&#10;        }&#10;        return Receipt(3.45)&#10;    }&#10;&#10;    override fun viewOrders(clientID: String): Flow&lt;Pizza&gt; {&#10;        val orders = openOrders[clientID]&#10;        if (orders != null) {&#10;            return flow {&#10;                for (order in orders) {&#10;                    emit(order)&#10;                    delay(1000)&#10;                }&#10;            }&#10;        }&#10;        return flow {}&#10;    }&#10;}"/>
            <p>
                请注意，系统会为每个客户端实例创建一个新的 <code>PizzaShopImpl</code> 实例。通过隔离它们的状态，这避免了客户端之间的冲突。但是，它并没有解决单个服务器实例内的线程安全问题，尤其是当同一个实例被多个服务并发访问时。
            </p>
        </step>
        <step>
            在
            <Path>Client.kt</Path>
            文件中，使用两个不同的客户端 ID 提交多个订单：
            <code-block lang="kotlin" code="    val pizzaShop: PizzaShop = client.withService&lt;PizzaShop&gt;()&#10;&#10;    pizzaShop.orderPizza(&quot;AB12&quot;, Pizza(&quot;Pepperoni&quot;))&#10;    pizzaShop.orderPizza(&quot;AB12&quot;, Pizza(&quot;Hawaiian&quot;))&#10;    pizzaShop.orderPizza(&quot;AB12&quot;, Pizza(&quot;Calzone&quot;))&#10;&#10;    pizzaShop.orderPizza(&quot;CD34&quot;, Pizza(&quot;Margherita&quot;))&#10;    pizzaShop.orderPizza(&quot;CD34&quot;, Pizza(&quot;Sicilian&quot;))&#10;    pizzaShop.orderPizza(&quot;CD34&quot;, Pizza(&quot;California&quot;))"/>
            <p>
                然后，使用 <code>Coroutines</code> 库和 <code>collect</code> 方法遍历结果：
            </p>
            <code-block lang="kotlin" code="    pizzaShop.viewOrders(&quot;AB12&quot;).collect {&#10;        println(&quot;AB12 ordered ${it.name}&quot;)&#10;    }&#10;&#10;    pizzaShop.viewOrders(&quot;CD34&quot;).collect {&#10;        println(&quot;CD34 ordered ${it.name}&quot;)&#10;    }"/>
        </step>
        <step>
            运行服务器和客户端。运行客户端时，你将看到结果逐一显示：
            <img src="tutorial_kotlin_rpc_run_client.gif" alt="Client output incrementally displaying results"
                 style="block" width="706" border-effect="line"/>
        </step>
    </procedure>
    <p>
        创建好工作示例后，现在让我们深入探讨一切是如何运作的。特别是将 Kotlin RPC 与两大主要替代方案 —— REST 和 gRPC 进行对比。
    </p>
</chapter>
<chapter title="RPC vs. REST" id="rpc-vs-rest">
    <p>
        RPC 的构想比 REST 悠久得多，<a
            href="https://en.wikipedia.org/wiki/Remote_procedure_call">至少可以追溯到 1981 年</a>。与 REST 相比，基于 RPC 的方法不会限制你使用统一接口（例如 HTTP 请求类型），在代码中使用起来要简单得多，并且借助二进制消息传递，性能可以更高。
    </p>
    <p>
        然而，REST 具有三大主要优势：
    </p>
    <list type="decimal">
        <li>
            它可以直接由浏览器中的 JavaScript 客户端使用，因此可用作单页应用程序的一部分。由于 RPC 框架依赖于生成的存根和二进制消息传递，因此它们不太适合 JavaScript 生态系统。
        </li>
        <li>
            REST 明确指出了功能何时涉及网络。这有助于避免 Martin Fowler 指出的<a
                href="https://martinfowler.com/articles/distributed-objects-microservices.html">分布式对象反模式</a>。当团队将其面向对象设计拆分为两个或多个部分，而未考虑将本地过程调用变为远程调用对性能和可靠性的影响时，就会出现这种反模式。
        </li>
        <li>
            REST API 建立在一系列约定之上，使得它们相对容易创建、编写文档、监控、调试和测试。有庞大的工具生态系统为此提供支持。
        </li>
    </list>
    <p>
        这些权衡意味着 Kotlin RPC 最适合在两种场景中使用。首先是在使用 <a
            href="https://www.jetbrains.com/lp/compose-multiplatform/">Compose Multiplatform</a> 的 KMP 客户端中；其次是在云端协同工作的微服务之间。<a
            href="https://kotlinlang.org/docs/wasm-overview.html">Kotlin/Wasm</a> 的未来发展可能会使 <code>kotlinx.rpc</code> 更加适用于基于浏览器的应用程序。
    </p>
</chapter>
<chapter title="Kotlin RPC vs. Google RPC" id="kotlin-rpc-vs-google-rpc">
    <p>
        Google RPC 是目前软件行业中占主导地位的 RPC 技术。一种名为 Protocol Buffers (protobuf) 的标准被用来使用语言中立的接口定义语言 (IDL) 来定义数据结构和消息有效载荷。这些 IDL 定义可以转换为各种编程语言，并使用紧凑高效的二进制格式进行序列化。像 Quarkus 和 Micronaut 这样的微服务框架已经支持 gRPC。
    </p>
    <p>
        Kotlin RPC 很难与 gRPC 竞争，而且这对 Kotlin 社区没有任何好处。值得庆幸的是，并没有这样的计划。相反，其意图是让 kotlinx.rpc 与 gRPC 兼容并互操作。未来将允许 kotlinx.rpc 服务使用 gRPC 作为其网络协议，并允许 kotlinx.rpc 客户端调用 gRPC 服务。<code>kotlinx.rpc</code> 将使用<a
            href="https://kotlin.github.io/kotlinx-rpc/transport.html">其自有的 kRPC 协议</a>作为默认选项（就像我们当前的示例一样），但不会阻止你选择 gRPC。
    </p>
</chapter>
<chapter title="后续步骤" id="next-steps">
    <p>
        Kotlin RPC 将 Kotlin 生态系统扩展到了一个新方向，为创建和使用服务提供了 REST 和 GraphQL 之外的替代方案。它构建在经过验证的库和框架之上，例如 Ktor、Coroutines 和 <code>kotlinx-serialization</code>。对于寻求使用 Kotlin Multiplatform 和 Compose Multiplatform 的团队，它将为分布式消息传递提供一个简单而高效的选项。
    </p>
    <p>
        如果这个入门介绍引起了你的兴趣，请务必查看 <a href="https://kotlin.github.io/kotlinx-rpc/get-started.html"><code>kotlinx.rpc</code> 官方文档</a> 和 <a
            href="https://github.com/Kotlin/kotlinx-rpc/tree/main/samples">示例</a>。
    </p>
    <p>
        <code>kotlinx.rpc</code> 库尚处于早期阶段，因此我们鼓励你探索它并分享你的反馈。错误和功能请求可以在 <a href="https://youtrack.jetbrains.com/issues/KRPC">YouTrack</a> 上提出，一般讨论则在 <a
            href="https://kotlinlang.slack.com/archives/C072YJ3Q91V">Slack</a> 上进行（<a
            href="https://surveys.jetbrains.com/s3/kotlin-slack-sign-up">申请访问权限</a>）。
    </p>
</chapter>
</topic>