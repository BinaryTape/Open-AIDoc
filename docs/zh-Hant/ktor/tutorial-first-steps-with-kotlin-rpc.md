<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       title="Kotlin RPC 入門指南" id="tutorial-first-steps-with-kotlin-rpc">
<show-structure for="chapter" depth="2"/>
<web-summary>
    在這份完整指南中探索 RPC 的基礎知識，並深入比較 RPC 與 REST 之間的差異。了解如何使用 Kotlin RPC 建立你的第一個應用程式。
</web-summary>
<link-summary>
    了解如何使用 Kotlin RPC 與 Ktor 建立你的第一個應用程式。
</link-summary>
<card-summary>
    了解如何使用 Kotlin RPC 與 Ktor 建立你的第一個應用程式。
</card-summary>
<tldr>
    <var name="example_name" value="tutorial-kotlin-rpc-app"/>
    <p>
        <b>程式碼範例</b>：
        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
            %example_name%
        </a>
    </p>
    <p>
        <b>使用的外掛程式</b>：<Links href="/ktor/server-routing" summary="Routing 是伺服器應用程式中用於處理傳入請求的核心外掛程式。">Routing</Links>、
        <a href="https://kotlinlang.org/api/kotlinx.serialization/">kotlinx.serialization</a>、
        <a href="https://kotlin.github.io/kotlinx-rpc/get-started.html">kotlinx.rpc</a>
    </p>
</tldr>
<p>
    Kotlin RPC（遠端程序呼叫）是 Kotlin 生態系統中令人興奮的新成員，它建立在成熟穩固的基礎上，並透過 <code>kotlinx.rpc</code> 程式庫執行。
</p>
<p>
    <code>kotlinx.rpc</code> 程式庫讓你可以僅使用常規的 Kotlin 語言結構，就能跨越網路邊界進行程序呼叫。因此，它提供了除 REST 和 Google RPC (gRPC) 之外的另一種選擇。
</p>
<p>
    在本文中，我們將介紹 Kotlin RPC 的核心概念，並建置一個簡單的應用程式。隨後你就可以在自己的專案中評估並使用該程式庫。
</p>
<chapter title="先決條件" id="prerequisites">
    <p>
        本教學假設你已具備 Kotlin 程式設計的基礎知識。如果你剛接觸 Kotlin，建議先閱讀一些<a href="https://kotlinlang.org/docs/getting-started.html">入門資料</a>。
    </p>
    <p>為了獲得最佳體驗，我們建議使用 <a
            href="https://www.jetbrains.com/idea/download">IntelliJ
        IDEA Ultimate</a> 作為整合開發環境 (IDE)，因為它提供了全面的支援與工具，能大幅提升你的開發效率。
    </p>
</chapter>
<chapter title="什麼是 RPC？" id="what-is-rpc">
    <chapter title="本機程序呼叫 vs. 遠端程序呼叫" id="local-vs-remote">
        <p>
            任何有程式設計經驗的人都熟悉程序呼叫的概念。這是任何程式語言中的基本概念。從技術上講，這些都屬於本機程序呼叫，因為它們始終在同一個程式內執行。
        </p>
        <p>
            遠端程序呼叫是指函式呼叫與參數透過某種方式在網路上傳輸，從而使其能在獨立的虛擬機／可執行檔中執行實作。傳回值則循相反路徑返回發起呼叫的電腦。
        </p>
        <p>
            最簡單的理解方式是將發起呼叫的電腦視為用戶端，將存放實作的電腦視為伺服器。然而，情況並不一定總是如此。RPC 呼叫可以在兩個方向上進行，作為點對點架構的一部分。但為了簡化說明，我們先假設為用戶端／伺服器部署。
        </p>
    </chapter>
    <chapter title="RPC 架構基礎" id="rpc-framework-fundamentals">
        <p>
            任何 RPC 架構都必須提供某些基礎功能。在傳統的 IT 基礎結構中實作遠端程序呼叫時，這些是不可或缺的。術語可能會有所不同，責任的劃分方式也可能不同，但每個 RPC 架構都必須提供：
        </p>
        <list type="decimal">
            <li>
                一種宣告將被遠端叫用程序的方式。在物件導向程式設計中，介面是合理的選擇。這可以是目前語言提供的介面結構，或者是某種與語言無關的標準，例如 <a
                    href="https://webidl.spec.whatwg.org/">W3C 使用的 Web IDL</a>。
            </li>
            <li>
                一種指定用於參數和傳回值之型別的方法。同樣地，你可以使用與語言無關的標準。然而，在目前語言中直接為標準資料型別宣告加上註解可能更簡單。
            </li>
            <li>
                稱為<format style="italic">客戶端虛設常式 (client stubs)</format>的幫助程式類別，用於將程序叫用轉換為可透過網路傳送的格式，並解包傳回的結果值。這些虛設常式既可以在編譯過程中建立，也可以在執行階段動態產生。
            </li>
            <li>
                管理這些幫助程式類別並監督遠端程序呼叫生命週期的底層<format style="italic">RPC 執行時期 (RPC Runtime)</format>。在伺服器端，該執行時期需要嵌入在某種伺服器中，以便持續處理請求。
            </li>
            <li>
                需要選擇（或定義）協定來表示被呼叫的程序、序列化正在傳送的資料，並在網路上轉換資訊。過去，某些技術從頭開始定義了新協定（CORBA 中的 IIOP），而另一些技術則側重於重複使用（SOAP 中的 HTTP POST）。
            </li>
        </list>
    </chapter>
    <chapter title="編組 (Marshaling) vs. 序列化 (Serialization)" id="marshaling-vs-serialization">
        <p>
            在 RPC 架構中，我們常說<format style="italic">編組 (marshaling)</format>與<format style="italic">解組 (unmarshaling)</format>。這是打包與解包要透過網路傳送之資訊的過程。它可以被視為序列化的超集。在編組過程中，我們不僅序列化物件，還需要打包有關被呼叫程序以及該呼叫所在上下文的資訊。
        </p>
    </chapter>
    <p>
        介紹了 RPC 的核心概念後，讓我們透過建置一個範例應用程式，來看看它們如何在 <code>kotlinx.rpc</code> 中發揮作用。
    </p>
</chapter>
<chapter title="Hello, kotlinx.rpc" id="hello-kotlinx-rpc">
    <p>
        讓我們建立一個透過網路訂購披薩的應用程式。為了讓程式碼盡可能保持簡潔，我們將使用基於主控台的用戶端。
    </p>
    <chapter title="建立專案" id="create-project">
        <p>首先，你將建立一個同時包含用戶端與伺服器端實作的專案。</p>
        <p>
            在較複雜的應用程式中，最佳實務是為用戶端和伺服器端使用獨立的模組。然而，為了本教學的簡潔起見，我們將對兩者使用單一模組。
        </p>
        <procedure id="create-project-procedure">
            <step>
                啟動 <a href="https://www.jetbrains.com/idea/download/">IntelliJ IDEA</a>。
            </step>
            <step>
                <p>
                    在歡迎畫面中，點擊 <control>New Project</control>。
                </p>
                <p>
                    或者，從主選單中選擇 <ui-path>File | New | Project</ui-path>。
                </p>
            </step>
            <step>
                在
                <control>Name</control>
                欄位中，輸入
                <Path>KotlinRpcPizzaApp</Path>
                作為你的專案名稱。
                <img src="tutorial_kotlin_rpc_intellij_project.png" alt="IntelliJ New Kotlin Project window"
                     style="block" width="706" border-effect="rounded"/>
            </step>
            <step>
                保留其餘預設設定，然後點擊
                <control>Create</control>
                。
            </step>
        </procedure>
        <p>
            通常情況下，你會立即設定專案的建置檔案。然而，那屬於實作細節，並不會增加你對該技術的理解，因此我們將在最後回到該步驟。
        </p>
    </chapter>
    <chapter title="新增共用型別" id="shared-types">
        <p>
            任何 RPC 專案的核心都是定義遠端呼叫程序的介面，以及定義這些程序時所使用的型別。
        </p>
        <p>
            在多模組專案中，這些型別需要共用。不過在當前範例中，並不需要額外進行這個步驟。
        </p>
        <procedure id="shared-types-procedure">
            <step>
                瀏覽至
                <Path>src/main/kotlin</Path>
                資料夾，並建立一個名為
                <Path>model</Path>
                的新子套件。
            </step>
            <step>
                在
                <Path>model</Path>
                套件內，建立一個具有以下實作的新
                <Path>PizzaShop.kt</Path>
                檔案：
                <code-block lang="kotlin" code="package com.example.model&#10;&#10;import kotlinx.coroutines.flow.Flow&#10;import kotlinx.serialization.Serializable&#10;import kotlinx.rpc.annotations.Rpc&#10;&#10;@Rpc&#10;interface PizzaShop {&#10;    suspend fun orderPizza(pizza: Pizza): Receipt&#10;}&#10;&#10;@Serializable&#10;class Pizza(val name: String)&#10;&#10;@Serializable&#10;class Receipt(val amount: Double)"/>
                <p>
                    該介面需要具有來自 <code>kotlinx.rpc</code> 程式庫的 <code>@Rpc</code> 註解。
                </p>
                <p>
                    因為你正在使用 <a href="https://github.com/Kotlin/kotlinx.serialization"><code>kotlinx.serialization</code></a>
                    來協助在網路上傳輸資訊，所以參數中使用的型別必須標記 <code>Serializable</code> 註解。
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="實作用戶端" id="client-implementation">
        <procedure id="client-impl-procedure">
            <step>
                瀏覽至
                <Path>src/main/kotlin</Path>
                並建立一個新的
                <Path>Client.kt</Path>
                檔案。
            </step>
            <step>
                開啟
                <Path>Client.kt</Path>
                並新增以下實作：
                <code-block lang="kotlin" code="package com.example&#10;&#10;import com.example.model.Pizza&#10;import com.example.model.PizzaShop&#10;import io.ktor.client.*&#10;import io.ktor.http.*&#10;import kotlinx.coroutines.runBlocking&#10;import kotlinx.rpc.withService&#10;import kotlinx.rpc.krpc.serialization.json.json&#10;import kotlinx.rpc.krpc.ktor.client.KtorRpcClient&#10;import kotlinx.rpc.krpc.ktor.client.installKrpc&#10;import kotlinx.rpc.krpc.ktor.client.rpc&#10;import kotlinx.rpc.krpc.ktor.client.rpcConfig&#10;import kotlinx.rpc.krpc.serialization.json.json&#10;&#10;fun main() = runBlocking {&#10;    val ktorClient = HttpClient {&#10;        installKrpc {&#10;            serialization { json() }&#10;        }&#10;    }&#10;&#10;    val client: KtorRpcClient = ktorClient.rpc {&#10;        url {&#10;            host = &quot;localhost&quot;&#10;            port = 8080&#10;            encodedPath = &quot;pizza&quot;&#10;        }&#10;&#10;        rpcConfig {&#10;            serialization {&#10;                json()&#10;            }&#10;        }&#10;    }&#10;&#10;    val pizzaShop: PizzaShop = client.withService&lt;PizzaShop&gt;()&#10;&#10;    val receipt = pizzaShop.orderPizza(Pizza(&quot;Pepperoni&quot;))&#10;    println(&quot;Your pizza cost ${receipt.amount}&quot;)&#10;    ktorClient.close()&#10;}"/>
            </step>
        </procedure>
        <p>
            只需 25 行程式碼即可準備並執行 RPC 呼叫。顯然這裡面包含了許多處理，讓我們將程式碼拆解分段說明。
        </p>
        <p>
            <code>kotlinx.rpc</code> 程式庫使用 <Links href="/ktor/client-create-new-application" summary="建立你的第一個用於發送請求和接收回應的用戶端應用程式。">Ktor 用戶端</Links> 在用戶端裝載其執行時期。該執行時期並未與 Ktor 強綁定，也可以選擇其他方案，但這樣做能促進重複使用，並讓 <code>kotlinx.rpc</code> 能夠輕鬆整合至現有的 KMP 應用程式中。
        </p>
        <p>
            Ktor 用戶端與 Kotlin RPC 都是圍繞協同程式建構的，因此你可以使用 <code>runBlocking</code> 來建立初始協同程式，並在其中執行用戶端的其餘程式碼：
        </p>
        <code-block lang="kotlin" code="fun main() = runBlocking {&#10;}"/>
        <tip>
            請注意，<code>runBlocking</code> 是為探針測試 (spike) 與測試而設計的，而非用於正式環境的生產程式碼。
        </tip>
        <p>
            接下來，你以標準方式建立 Ktor 用戶端執行個體。<code>kotlinx.rpc</code> 在底層使用 <Links href="/ktor/client-websockets" summary="WebSockets 外掛程式可讓你在伺服器與用戶端之間建立多向通訊工作階段。">WebSockets</Links> 外掛程式來傳輸資訊。你只需使用 <code>installKrpc()</code> 函式確保它已被載入：
        </p>
        <code-block lang="kotlin" code="    val ktorClient = HttpClient {&#10;        installKrpc {&#10;            serialization { json() }&#10;        }&#10;    }"/>
        <p>
            建立此 Ktor 用戶端後，接著建立用於叫用遠端程序的 <code>KtorRpcClient</code> 物件。你將需要設定伺服器的位置以及用於傳輸資訊的機制：
        </p>
        <code-block lang="kotlin" code="    val client: KtorRpcClient = ktorClient.rpc {&#10;        url {&#10;            host = &quot;localhost&quot;&#10;            port = 8080&#10;            encodedPath = &quot;pizza&quot;&#10;        }&#10;&#10;        rpcConfig {&#10;            serialization {&#10;                json()&#10;            }&#10;        }&#10;    }"/>
        <p>
            至此，標準設定已完成，你已準備好使用該問題領域專屬的功能。你可以使用該用戶端建立實作 <code>PizzaShop</code> 介面方法的客戶端代理物件：
        </p>
        <code-block lang="kotlin"
                    include-symbol="pizzaShop" code="package com.example&#10;&#10;import com.example.model.Pizza&#10;import com.example.model.PizzaShop&#10;import io.ktor.client.*&#10;import io.ktor.http.*&#10;import kotlinx.coroutines.runBlocking&#10;import kotlinx.rpc.withService&#10;import kotlinx.rpc.krpc.serialization.json.json&#10;import kotlinx.rpc.krpc.ktor.client.KtorRpcClient&#10;import kotlinx.rpc.krpc.ktor.client.installKrpc&#10;import kotlinx.rpc.krpc.ktor.client.rpc&#10;import kotlinx.rpc.krpc.ktor.client.rpcConfig&#10;import kotlinx.rpc.krpc.serialization.json.json&#10;&#10;fun main() = runBlocking {&#10;    val ktorClient = HttpClient {&#10;        installKrpc {&#10;            serialization { json() }&#10;        }&#10;    }&#10;&#10;    val client: KtorRpcClient = ktorClient.rpc {&#10;        url {&#10;            host = &quot;localhost&quot;&#10;            port = 8080&#10;            encodedPath = &quot;pizza&quot;&#10;        }&#10;&#10;        rpcConfig {&#10;            serialization {&#10;                json()&#10;            }&#10;        }&#10;    }&#10;&#10;    val pizzaShop: PizzaShop = client.withService&lt;PizzaShop&gt;()&#10;&#10;    /*&#10;    val receipt = pizzaShop.orderPizza(Pizza(&quot;Pepperoni&quot;))&#10;    println(&quot;Your pizza cost ${receipt.amount}&quot;)&#10;    */&#10;&#10;    pizzaShop.orderPizza(&quot;AB12&quot;, Pizza(&quot;Pepperoni&quot;))&#10;    pizzaShop.orderPizza(&quot;AB12&quot;, Pizza(&quot;Hawaiian&quot;))&#10;    pizzaShop.orderPizza(&quot;AB12&quot;, Pizza(&quot;Calzone&quot;))&#10;&#10;    pizzaShop.orderPizza(&quot;CD34&quot;, Pizza(&quot;Margherita&quot;))&#10;    pizzaShop.orderPizza(&quot;CD34&quot;, Pizza(&quot;Sicilian&quot;))&#10;    pizzaShop.orderPizza(&quot;CD34&quot;, Pizza(&quot;California&quot;))&#10;&#10;    pizzaShop.viewOrders(&quot;AB12&quot;).collect {&#10;        println(&quot;AB12 ordered ${it.name}&quot;)&#10;    }&#10;&#10;    pizzaShop.viewOrders(&quot;CD34&quot;).collect {&#10;        println(&quot;CD34 ordered ${it.name}&quot;)&#10;    }&#10;&#10;    ktorClient.close()&#10;}"/>
        <p>
            接著你便可以發起遠端程序呼叫並使用結果：
        </p>
        <code-block lang="kotlin" code="    val receipt = pizzaShop.orderPizza(Pizza(&quot;Pepperoni&quot;))&#10;    println(&quot;Your pizza cost ${receipt.amount}&quot;)"/>
        <p>
            請注意，此時系統已在後台為你完成了龐大的工作。呼叫的詳細資訊以及所有參數都必須轉換為訊息並透過網路傳送，然後接收並解碼傳回值。這一切能夠以透明的方式進行，就是前期設定帶來的回報。
        </p>
        <p>
            最後，我們需要像平常一樣關閉用戶端：
        </p>
        <code-block lang="kotlin" code="    ktorClient.close()"/>
    </chapter>
    <chapter title="實作伺服器端" id="server-implementation">
        <p>
            伺服器端的實作分為兩部分。首先，你需要建立介面的實作；其次，你需要將其裝載於伺服器中。
        </p>
        <procedure id="create-interface">
            <step>
                瀏覽至
                <Path>src/main/kotlin</Path>
                並建立一個新的
                <Path>Server.kt</Path>
                檔案。
            </step>
            <step>
                開啟
                <Path>Server.kt</Path>
                並新增以下介面實作：
                <code-block lang="kotlin" code="package com.example&#10;&#10;import com.example.model.*&#10;import io.ktor.server.application.*&#10;import io.ktor.server.netty.*&#10;import io.ktor.server.engine.*&#10;import io.ktor.server.routing.*&#10;import kotlinx.rpc.krpc.ktor.server.Krpc&#10;import kotlinx.rpc.krpc.ktor.server.rpc&#10;import kotlinx.rpc.krpc.serialization.json.json&#10;&#10;class PizzaShopImpl : PizzaShop {&#10;    override suspend fun orderPizza(pizza: Pizza): Receipt {&#10;        return Receipt(7.89)&#10;    }&#10;}"/>
                <p>
                    顯然，這不是真實環境的實作，但足以讓我們的範例順利運作。
                </p>
                <p>
                    實作的第二部分建置在 Ktor 之上。
                </p>
            </step>
            <step>
                <p>
                    在同一個檔案中新增以下程式碼：
                </p>
                <code-block lang="kotlin" code="fun main() {&#10;    embeddedServer(Netty, port = 8080) {&#10;        module()&#10;        println(&quot;Server running&quot;)&#10;    }.start(wait = true)&#10;}&#10;&#10;fun Application.module() {&#10;    install(Krpc)&#10;&#10;    routing {&#10;        rpc(&quot;/pizza&quot;) {&#10;            rpcConfig {&#10;                serialization {&#10;                    json()&#10;                }&#10;            }&#10;&#10;            registerService&lt;PizzaShop&gt; { PizzaShopImpl() }&#10;        }&#10;    }&#10;}"/>
                <p>以下是程式碼分析：</p>
                <p>
                    首先，你建立一個 Ktor/Netty 執行個體，並使用指定的擴充函式進行配置：
                </p>
                <code-block lang="kotlin" code="    embeddedServer(Netty, port = 8080) {&#10;        module()&#10;        println(&quot;Server running&quot;)&#10;    }.start(wait = true)"/>
                <p>
                    接著，你宣告一個擴充自 Ktor Application 型別的設定函式。這會安裝 <code>kotlinx.rpc</code> 外掛程式並宣告一個或多個路由：
                </p>
                <code-block lang="kotlin" code="fun Application.module() {&#10;    install(Krpc)&#10;&#10;    routing {&#10;    }&#10;}"/>
                <p>
                    在 routing 區塊內部，你使用 <code>kotlinx.rpc</code> 對 Ktor Routing DSL 的擴充來宣告一個端點。與用戶端一樣，你指定 URL 並設定序列化。但在這種情況下，我們的實作將在該 URL 監聽傳入的請求：
                </p>
                <code-block lang="kotlin" code="        rpc(&quot;/pizza&quot;) {&#10;            rpcConfig {&#10;                serialization {&#10;                    json()&#10;                }&#10;            }&#10;&#10;            registerService&lt;PizzaShop&gt; { PizzaShopImpl() }&#10;        }"/>
                <p>
                    請注意，你使用 <code>registerService</code> 向 RPC 執行時期提供介面的實作。你可能會希望有多個執行個體，但那是後續文章要探討的主題。
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="新增相依性" id="add-dependencies">
        <p>
            現在你已經具備執行應用程式所需的所有程式碼，但目前它甚至無法編譯，更不用說執行了。
            你可以使用搭配 <a href="https://kotlin.github.io/kotlinx-rpc/get-started.html">kotlinx.rpc</a> 外掛程式的 Ktor Project Generator，也可以手動設定建置檔案。
            這其實也不太複雜。
        </p>
        <procedure id="configure-build-files">
            <step>
                在
                <Path>build.gradle.kts</Path>
                檔案中，新增以下外掛程式：
                <code-block lang="kotlin" code="plugins {&#10;    kotlin(&quot;jvm&quot;) version &quot;2.3.0&quot;&#10;    kotlin(&quot;plugin.serialization&quot;) version &quot;2.3.0&quot;&#10;    id(&quot;io.ktor.plugin&quot;) version &quot;3.6.0&quot;&#10;    id(&quot;org.jetbrains.kotlinx.rpc.plugin&quot;) version &quot;0.10.1&quot;&#10;}"/>
                <p>
                    使用 Kotlin 外掛程式的原因不言而喻。其他外掛程式說明如下：
                </p>
                <list>
                    <li>
                        需要 <code>kotlinx.serialization</code> 外掛程式來產生用於將 Kotlin 物件轉換為 JSON 的幫助程式型別。請記住，<code>kotlinx.serialization</code> 完全不使用反射。
                    </li>
                    <li>
                        Ktor 外掛程式用於建置包含應用程式及其所有相依性的 fat JAR。
                    </li>
                    <li>
                        RPC 外掛程式是用於產生用戶端虛設常式所必需的。
                    </li>
                </list>
            </step>
            <step>
                新增以下相依性：
                <code-block lang="kotlin" code="    implementation(&quot;io.ktor:ktor-client-cio-jvm&quot;)&#10;    implementation(&quot;org.jetbrains.kotlinx:kotlinx-rpc-krpc-client:0.10.1&quot;)&#10;    implementation(&quot;org.jetbrains.kotlinx:kotlinx-rpc-krpc-ktor-client:0.10.1&quot;)&#10;    implementation(&quot;io.ktor:ktor-server-netty-jvm&quot;)&#10;    implementation(&quot;org.jetbrains.kotlinx:kotlinx-rpc-krpc-server:0.10.1&quot;)&#10;    implementation(&quot;org.jetbrains.kotlinx:kotlinx-rpc-krpc-ktor-server:0.10.1&quot;)&#10;    implementation(&quot;org.jetbrains.kotlinx:kotlinx-rpc-krpc-serialization-json:0.10.1&quot;)&#10;    implementation(&quot;ch.qos.logback:logback-classic:1.5.33&quot;)&#10;    testImplementation(kotlin(&quot;test&quot;))&#10;}"/>
                <p>
                    這會新增 Ktor 用戶端與伺服器端、<code>kotlinx.rpc</code> 執行時期的用戶端和伺服器端部分，以及用於整合 <code>kotlinx.rpc</code> 和 <code>kotlinx-serialization</code> 的程式庫。
                </p>
                <p>
                    完成這些之後，你現在可以執行專案並開始發起 RPC 呼叫。
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="執行應用程式" id="run-application">
        <p>
            若要執行示範，請依照下列步驟操作：
        </p>
        <procedure id="run-app-procedure">
            <step>
                瀏覽至
                <Path>Server.kt</Path>
                檔案。
            </step>
            <step>
                <p>在 IntelliJ IDEA 中，點擊 <code>main()</code> 函式旁的執行按鈕
                    (<img src="intellij_idea_gutter_icon.svg"
                          style="inline" height="16" width="16"
                          alt="intelliJ IDEA run icon"/>)
                    來啟動應用程式。</p>
                <p>
                    你應該會在
                    <control>Run</control>
                    工具視窗中看到輸出：
                </p>
                <img src="tutorial_kotlin_rpc_run_server.png" alt="Run server output in intelliJ IDEA"
                     style="block" width="706" border-effect="line"/>
            </step>
            <step>
                瀏覽至
                <Path>Client.kt</Path>
                檔案並執行應用程式。你應該會在主控台中看到以下輸出：
                <code-block lang="shell" code="                        Your pizza cost 7.89&#10;&#10;                        Process finished with exit code 0"/>
            </step>
        </procedure>
    </chapter>
</chapter>
<chapter title="擴充範例" id="extend-the-example">
    <p>
        最後，讓我們增加範例應用程式的複雜度，為未來的開發奠定堅實的基礎。
    </p>
    <procedure id="extend-server">
        <step>
            在
            <Path>PizzaShop.kt</Path>
            檔案中，透過加入用戶端的 ID 來擴充 <code>orderPizza</code> 方法，並新增一個 <code>viewOrders</code> 方法以傳回指定用戶端的所有待處理訂單：
            <code-block lang="kotlin" code="package com.example.model&#10;&#10;import kotlinx.coroutines.flow.Flow&#10;import kotlinx.serialization.Serializable&#10;import kotlinx.rpc.annotations.Rpc&#10;&#10;@Rpc&#10;interface PizzaShop {&#10;    suspend fun orderPizza(clientID: String, pizza: Pizza): Receipt&#10;    fun viewOrders(clientID: String): Flow&lt;Pizza&gt;&#10;}"/>
            <p>
                你可以透過傳回 <code>Flow</code> 而不是 <code>List</code> 或 <code>Set</code> 來充分利用協同程式程式庫。這將使你能夠將披薩資訊逐一串流傳輸給用戶端。
            </p>
        </step>
        <step>
            瀏覽至
            <Path>Server.kt</Path>
            檔案，並透過將當前訂單儲存在列表對應表 (map of lists) 中來實作此功能：
            <code-block lang="kotlin" code="class PizzaShopImpl : PizzaShop {&#10;    private val openOrders = mutableMapOf&lt;String, MutableList&lt;Pizza&gt;&gt;()&#10;&#10;    override suspend fun orderPizza(clientID: String, pizza: Pizza): Receipt {&#10;        if(openOrders.containsKey(clientID)) {&#10;            openOrders[clientID]?.add(pizza)&#10;        } else {&#10;            openOrders[clientID] = mutableListOf(pizza)&#10;        }&#10;        return Receipt(3.45)&#10;    }&#10;&#10;    override fun viewOrders(clientID: String): Flow&lt;Pizza&gt; {&#10;        val orders = openOrders[clientID]&#10;        if (orders != null) {&#10;            return flow {&#10;                for (order in orders) {&#10;                    emit(order)&#10;                    delay(1000)&#10;                }&#10;            }&#10;        }&#10;        return flow {}&#10;    }&#10;}"/>
            <p>
                請注意，系統會為每個用戶端執行個體建立一個新的 <code>PizzaShopImpl</code> 執行個體。這透過隔離它們的狀態來避免用戶端之間的衝突。然而，這並不能解決單一伺服器執行個體內部的執行緒安全性問題，特別是在同一個執行個體被多個服務同時並行存取的情況下。
            </p>
        </step>
        <step>
            在
            <Path>Client.kt</Path>
            檔案中，使用兩個不同的客戶端 ID 提交多個訂單：
            <code-block lang="kotlin" code="    val pizzaShop: PizzaShop = client.withService&lt;PizzaShop&gt;()&#10;&#10;    pizzaShop.orderPizza(&quot;AB12&quot;, Pizza(&quot;Pepperoni&quot;))&#10;    pizzaShop.orderPizza(&quot;AB12&quot;, Pizza(&quot;Hawaiian&quot;))&#10;    pizzaShop.orderPizza(&quot;AB12&quot;, Pizza(&quot;Calzone&quot;))&#10;&#10;    pizzaShop.orderPizza(&quot;CD34&quot;, Pizza(&quot;Margherita&quot;))&#10;    pizzaShop.orderPizza(&quot;CD34&quot;, Pizza(&quot;Sicilian&quot;))&#10;    pizzaShop.orderPizza(&quot;CD34&quot;, Pizza(&quot;California&quot;))"/>
            <p>
                接著你使用 <code>Coroutines</code> 程式庫和 <code>collect</code> 方法反覆運算結果：
            </p>
            <code-block lang="kotlin" code="    pizzaShop.viewOrders(&quot;AB12&quot;).collect {&#10;        println(&quot;AB12 ordered ${it.name}&quot;)&#10;    }&#10;&#10;    pizzaShop.viewOrders(&quot;CD34&quot;).collect {&#10;        println(&quot;CD34 ordered ${it.name}&quot;)&#10;    }"/>
        </step>
        <step>
            執行伺服器和用戶端。當你執行用戶端時，你將看到結果以遞增方式顯示：
            <img src="tutorial_kotlin_rpc_run_client.gif" alt="Client output incrementally displaying results"
                 style="block" width="706" border-effect="line"/>
        </step>
    </procedure>
    <p>
        在建立了這個運作正常的範例後，讓我們深入了解所有元件是如何協同運作的。特別是，讓我們將 Kotlin RPC 與兩個主要的替代方案——REST 和 gRPC 進行比較與對照。
    </p>
</chapter>
<chapter title="RPC vs. REST" id="rpc-vs-rest">
    <p>
        RPC 的概念比 REST 早得多，<a
            href="https://en.wikipedia.org/wiki/Remote_procedure_call">至少可以追溯到 1981 年</a>。與 REST 相比，基於 RPC 的方法不會將你限制在統一介面（例如 HTTP 請求類型）內，在程式碼中使用起來更加簡單，並且得益於二進制傳訊，效能可能更高。
    </p>
    <p>
        然而，REST 擁有三大優勢：
    </p>
    <list type="decimal">
        <li>
            它可以直接被瀏覽器中的 JavaScript 客戶端使用，從而可作為單頁應用程式的一部分。由於 RPC 架構依賴產生的虛設常式和二進制傳訊，因此它們不太適合 JavaScript 生態系統。
        </li>
        <li>
            REST 使得某項功能何時涉及網路變得一目了然。這有助於避免 Martin Fowler 所指出的<a
                href="https://martinfowler.com/articles/distributed-objects-microservices.html">分散式物件反模式 (distributed objects antipattern)</a>。當團隊將其物件導向設計拆分為兩個或多個部分，卻未考慮將本機程序呼叫轉為遠端呼叫時所帶來的效能與可靠性影響，就會發生這種情況。
        </li>
        <li>
            REST API 建立在一系列慣例之上，這使得它們相對容易建立、編寫文件、監控、偵錯以及測試。目前有龐大的工具生態系統來為此提供支援。
        </li>
    </list>
    <p>
        這些取捨意味著 Kotlin RPC 最適合在兩種情境下使用：首先，在使用 <a
            href="https://www.jetbrains.com/lp/compose-multiplatform/">Compose Multiplatform</a> 的 KMP 客戶端中；其次，在雲端中相互協作的微服務之間。未來在 <a
            href="https://kotlinlang.org/docs/wasm-overview.html">Kotlin/Wasm</a> 上的發展可能會讓 <code>kotlinx.rpc</code> 更加適用於基於瀏覽器的應用程式。
    </p>
</chapter>
<chapter title="Kotlin RPC vs. Google RPC" id="kotlin-rpc-vs-google-rpc">
    <p>
        Google RPC 是目前軟體產業中佔主導地位的 RPC 技術。它使用名為 Protocol Buffers (protobuf) 的標準，透過與語言無關的介面定義語言 (IDL) 來定義資料結構和訊息有效負載。這些 IDL 定義可以轉換為多種程式語言，並使用緊湊且高效的二進制格式進行序列化。諸如 Quarkus 和 Micronaut 之類的微框架已經具備對 gRPC 的支援。
    </p>
    <p>
        Kotlin RPC 很難與 gRPC 競爭，而且這對 Kotlin 社群也沒有任何好處。值得慶幸的是，官方並沒有打算這樣做。相反地，目標是讓 kotlinx.rpc 能與 gRPC 相容並互通。未來將支援 kotlinx.rpc 服務使用 gRPC 作為其網路通訊協定，以及支援 kotlinx.rpc 用戶端呼叫 gRPC 服務。<code>kotlinx.rpc</code> 將使用<a
            href="https://kotlin.github.io/kotlinx-rpc/transport.html">其自有的 kRPC 協定</a>作為預設選項（如我們目前的範例所示），但這不會妨礙你選擇使用 gRPC。
    </p>
</chapter>
<chapter title="後續步驟" id="next-steps">
    <p>
        Kotlin RPC 將 Kotlin 生態系統拓展到了新的方向，為建立和取用服務提供了 REST 和 GraphQL 之外的另一種選擇。它建置在經過驗證的程式庫和架構之上，例如 Ktor、Coroutines 以及 <code>kotlinx-serialization</code>。對於尋求利用 Kotlin Multiplatform 和 Compose Multiplatform 的團隊來說，它將為分散式傳訊提供一個簡單且高效的選項。
    </p>
    <p>
        如果這篇簡介激起了你的興趣，請務必查看 <a href="https://kotlin.github.io/kotlinx-rpc/get-started.html">官方 <code>kotlinx.rpc</code> 文件</a> 與 <a
            href="https://github.com/Kotlin/kotlinx-rpc/tree/main/samples">範例</a>。
    </p>
    <p>
        <code>kotlinx.rpc</code> 程式庫目前處於早期階段，因此我們鼓勵你探索並分享你的回饋。
        錯誤與功能需求可在 <a href="https://youtrack.jetbrains.com/issues/KRPC">YouTrack</a> 上提出，一般討論則在 <a
            href="https://kotlinlang.slack.com/archives/C072YJ3Q91V">Slack</a> 上進行（<a
            href="https://surveys.jetbrains.com/s3/kotlin-slack-sign-up">申請加入</a>）。
    </p>
</chapter>
</topic>