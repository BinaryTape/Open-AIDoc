[//]: # (title: Kotlin RPC 入門)

<show-structure for="chapter" depth="2"/>

<web-summary>
在這份完整的指南中，發掘 RPC 的基本概念，並探索 RPC 與 REST 之間的詳細比較。學習如何使用 Kotlin RPC 建立你的第一個應用程式。
</web-summary>

<link-summary>
學習如何使用 Kotlin RPC 和 Ktor 建立你的第一個應用程式。
</link-summary>

<card-summary>
學習如何使用 Kotlin RPC 和 Ktor 建立你的第一個應用程式。
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
<b>使用的外掛程式</b>：<Links href="server-routing.md" summary="Routing is a core plugin for handling incoming requests in a server application.">Routing</Links>、
<a href="https://kotlinlang.org/api/kotlinx.serialization/">kotlinx.serialization</a>、
<a href="https://kotlin.github.io/kotlinx-rpc/get-started.html">kotlinx.rpc</a>
</p>
</tldr>

Kotlin RPC（遠端程序呼叫）建立在成熟的基礎之上，並執行於 [`kotlinx.rpc`](https://kotlin.github.io/kotlinx-rpc/get-started.html) 程式庫。

`kotlinx.rpc` 程式庫讓你能使用一般的 Kotlin 語言結構進行跨網路邊界的程序呼叫。因此，它提供了 REST 和 Google RPC (gRPC) 之外的另一種選擇。

在本文中，你將學習 Kotlin RPC 的核心概念並建置一個簡單的應用程式。隨後你便可以在自己的專案中評估使用此程式庫。

## 先決條件 {id="prerequisites"}

本教學假設你對 Kotlin 程式設計已有基本了解。如果你剛接觸 Kotlin，建議先閱讀一些[入門資料](https://kotlinlang.org/docs/getting-started.html)。

為了獲得最佳體驗，我們建議使用 [IntelliJ IDEA Ultimate](https://www.jetbrains.com/idea/download) 作為你的整合開發環境 (IDE)，因為它提供了全面的支援和工具來提升你的生產力。

## 什麼是 RPC？ {id="what-is-rpc"}

### 本機與遠端程序呼叫 {id="local-vs-remote"}

程序呼叫是任何程式語言中的基本概念。從技術上來說，它們都是本機程序呼叫，因為它們一律在同一個程式內部進行。

遠端程序呼叫是指將函式呼叫及其參數以某種方式透過網路傳輸，以便在獨立的虛擬機或可執行檔中執行實作。傳回值則循相反路徑傳回發起叫用的機器。

最簡單的理解方式是將發起叫用的機器視為用戶端，將實作所在的機器視為伺服器。然而，情況不一定總是如此。RPC 呼叫可以在對等架構中雙向進行。為了讓本教學保持簡單，你可以假設採用用戶端／伺服器的部署架構。

### RPC 架構基礎概念 {id="rpc-framework-fundamentals"}

任何 RPC 架構都必須提供某些基礎功能。在傳統 IT 基礎結構中實作遠端程序呼叫時，這些都是不可或缺的。雖然術語可能有所不同，職責劃分的方式也各異，但每個 RPC 架構都必須提供：

1. 一種宣告將在遠端叫用的程序的方法。在物件導向程式設計中，介面是順理成章的選擇。這可以是當前語言提供的介面建構，也可以是某種與語言無關的標準，例如 [W3C 使用的 Web IDL](https://webidl.spec.whatwg.org/)。
2. 一種指定用於參數和傳回值之型別的方法。同樣地，你可以使用與語言無關的標準。不過，更簡單的方式可能是在當前語言中為標準資料型別宣告加上註解。
3. 被稱為「用戶端虛設常式 (client stubs)」的幫助程式類別，用於將程序叫用轉換為可透過網路傳送的格式，並解包傳回的結果值。這些虛設常式可以在編譯過程中建立，也可以在執行時期動態建立。
4. 一個底層的「RPC 執行時期 (RPC Runtime)」，用來管理幫助程式類別並監督遠端程序呼叫的生命週期。在伺服器端，該執行時期需要嵌入在某種伺服器中，以便持續處理連入的請求。
5. 需要選擇（或定義）通訊協定，用來表示被呼叫的程序、將傳送的資料序列化，以及在網路中傳輸資訊。過去，某些技術從頭定義了全新的協定（如 CORBA 中的 IIOP），而其他技術則專注於重複利用現有協定（如 SOAP 中的 HTTP POST）。

### 編組 (Marshaling) 與序列化 (Serialization) {id="marshaling-vs-serialization"}

在 RPC 架構中，我們會提到「編組 (marshaling)」與「解組 (unmarshaling)」。這是將要透過網路傳送的資訊進行打包與解包的過程。它可以被視為序列化的超集。在編組中，你不僅要序列化物件，還需要封裝有關被呼叫程序以及進行該呼叫之上下文的資訊。

介紹完 RPC 的核心概念後，讓我們透過建置一個範例應用程式，來看看它們如何應用在 `kotlinx.rpc` 中。

## Hello, kotlinx.rpc {id="hello-kotlinx-rpc"}

你現在將建立一個用於透過網路訂購披薩的應用程式。為了盡可能讓程式碼保持簡單，你將使用以主控台為基礎的用戶端。

### 建立專案 {id="create-project"}

首先，你將建立一個包含用戶端與伺服器端實作的專案。

在較複雜的應用程式中，最佳實務是為用戶端和伺服器使用獨立的模組。然而，為了簡化本教學，我們將在單一模組中同時實作兩者。

<procedure id="create-project-procedure">

1. 啟動 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/)。
2. <p>
       在歡迎畫面中，點擊 <control>New Project</control>。
   </p>
   <p>
       或者，從主選單中選取 <ui-path>File | New | Project</ui-path>。
   </p>
3. 在 **Name** 欄位中，輸入 <Path>KotlinRpcPizzaApp</Path> 作為專案名稱。

   ![IntelliJ New Kotlin Project 視窗](tutorial_kotlin_rpc_intellij_project.png){style="block" width="706" border-effect="rounded"}
4. 保留其餘預設設定，然後點擊 **Create**。

</procedure>

一般情況下，你會立即設定專案建置檔。不過，這屬於實作細節，並不會增加你對這項技術的理解，因此我們留到最後再來進行該步驟。

### 新增共享型別 {id="shared-types"}

任何 RPC 專案的核心都是定義遠端呼叫程序的介面，以及在這些程序定義中使用的型別。

在多模組專案中，這些型別需要共享。但在本範例中，並不需要額外處理這個步驟。

<procedure id="shared-types-procedure">

1. 導覽至 <Path>src/main/kotlin</Path> 資料夾並建立名為 <Path>model</Path> 的新子套件。
2. 在 <Path>model</Path> 套件內，建立一個新的 <Path>PizzaShop.kt</Path> 檔案，內容如下：

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

   該介面必須包含來自 `kotlinx.rpc` 程式庫的 `@Rpc` 註解。

   因為你使用的是 [`kotlinx.serialization`](https://github.com/Kotlin/kotlinx.serialization) 來協助透過網路傳輸資訊，所以參數中使用的型別必須標記 `@Serializable` 註解。

</procedure>

### 實作用戶端 {id="client-implementation"}

<procedure id="client-impl-procedure">

1. 導覽至 <Path>src/main/kotlin</Path> 並建立新的 <Path>Client.kt</Path> 檔案。
2. 開啟 <Path>Client.kt</Path> 並新增以下實作：

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

透過上述程式碼，你已準備好並執行了一次 RPC 呼叫。

`kotlinx.rpc` 程式庫使用 [Ktor 用戶端](client-create-new-application.topic) 在用戶端裝載其執行時期。該執行時期並未與 Ktor 緊密耦合，也可以選擇其他方案，但這樣做有助於重複利用現有架構，並讓 `kotlinx.rpc` 能輕鬆整合到現有的 Kotlin Multiplatform 應用程式中。

Ktor 用戶端與 Kotlin RPC 都是圍繞協同程式 (coroutines) 建構的，因此你使用 `runBlocking {}` 區塊來建立初始協同程式，並在其中執行用戶端的其餘程式碼：

```kotlin
fun main() = runBlocking {
}
```

> 請注意，`runBlocking {}` 是專為探索實驗 (spikes) 與測試設計的，不建議用於正式生產環境程式碼。
>
{style="tip"}

接著，你以標準方式建立 Ktor 用戶端的執行個體。`kotlinx.rpc` 使用 [WebSockets](client-websockets.topic) 外掛程式來傳輸資訊。你可以使用 `installKrpc()` 函式來確保該外掛程式已載入：

```kotlin
val ktorClient = HttpClient {
    installKrpc {
        serialization { json() }
    }
}
```

建立 Ktor 用戶端後，接著建立用於叫用遠端程序的 `KtorRpcClient` 物件。你需要設定伺服器的位置以及用於傳輸資訊的機制：

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

至此，標準設定已完成，你隨時可以使用特定於問題領域的功能。你可以使用該用戶端建立實作 `PizzaShop` 介面方法的用戶端代理物件：

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

接著你便可以發起遠端程序呼叫並使用傳回的結果：

```kotlin
val receipt = pizzaShop.orderPizza(Pizza("Pepperoni"))
println("Your pizza cost ${receipt.amount}")
```

在此步驟中，底層執行了大量工作。呼叫的詳細資訊和所有參數都會被轉換為訊息，透過網路傳送，然後接收並解碼傳回值。

最後，關閉用戶端：

```kotlin
ktorClient.close()
```

### 實作伺服器端 {id="server-implementation"}

伺服器端的實作分為兩個部分。首先，建立介面的實作，然後將其裝載於伺服器中。

<procedure id="create-interface">

1. 導覽至 <Path>src/main/kotlin</Path> 並建立新的 <Path>Server.kt</Path> 檔案。
2. 開啟 <Path>Server.kt</Path> 並新增以下介面實作：

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

   雖然這不是一個功能完備的實作，但已足夠讓我們的示範程式順利運作。

   第二部分的實作則建立在 Ktor 之上。
3. 將以下程式碼新增至同一個檔案中：

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

   各部分細節如下：

   首先，使用 Netty 建立 Ktor 伺服器的執行個體，並使用指定的擴充函式進行設定：

   ```kotlin
   embeddedServer(Netty, port = 8080) {
       module()
       println("Server running")
   }.start(wait = true)
   ```

   然後，宣告一個擴充 Ktor `Application` 型別的設定函式。這會安裝 `kotlinx.rpc` 外掛程式並宣告一或多個路由：

   ```kotlin
   fun Application.module() {
       install(Krpc)
   
       routing {
       }
   }
   ```

   在路由區段內，你使用 `kotlinx.rpc` 對 Ktor Routing DSL 的擴充功能來宣告端點。就像在用戶端上一樣，你需要指定 URL 並設定序列化。但在這裡，我們的實作將在該 URL 監聽傳入的請求：

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

   你使用 `registerService {}` 將介面的實作提供給 RPC 執行時期。

</procedure>

### 新增相依性 {id="add-dependencies"}

現在你已經具備執行應用程式所需的所有程式碼，但此時它甚至還無法編譯。

雖然你可以使用帶有 [`kotlinx.rpc`](https://kotlin.github.io/kotlinx-rpc/get-started.html) 外掛程式的 Ktor Project Generator，但也可以手動設定建置檔：

<procedure id="configure-build-files">

1. 開啟或建立 <Path>gradle/libs.versions.toml</Path> 檔案，並定義 Kotlin、`kotlinx.rpc` 和 Logback 的版本，以及程式庫與外掛程式別名：

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

   Gradle 會自動在建置檔中透過 `libs` 提供這些別名。
2. 開啟 <Path>settings.gradle.kts</Path> 檔案並匯入 Ktor 版本目錄 (version catalog)：

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

   此目錄會透過 `ktorLibs` 提供 Ktor 外掛程式和相依性別名。目錄座標中的版本決定了這些別名所使用的 Ktor 版本。
3. 在 <Path>build.gradle.kts</Path> 檔案中，新增下列外掛程式：

   ```kotlin
   plugins {
       alias(libs.plugins.kotlin.jvm)
       alias(libs.plugins.kotlin.serialization)
       alias(ktorLibs.plugins.ktor)
       alias(libs.plugins.kotlinx.rpc)
   }
   ```

   * 需要 `kotlinx.serialization` 外掛程式來產生將 Kotlin 物件轉換為 JSON 的幫助程式型別。請記住，`kotlinx.serialization` 完全不使用反射。
   * Ktor 外掛程式用於建置將應用程式及其所有相依性打包在一起的 fat JAR。
   * 需要 RPC 外掛程式來產生用戶端虛設常式。
4. 新增下列相依性：

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

   這會新增 Ktor 用戶端與伺服器端、`kotlinx.rpc` 執行時期的用戶端與伺服器端元件，以及用於整合 `kotlinx.rpc` 與 `kotlinx-serialization` 的程式庫。

   完成這些後，你現在就可以執行專案並開始進行 RPC 呼叫了。

</procedure>

### 執行應用程式 {id="run-application"}

若要執行應用程式，請遵循以下步驟：

<procedure id="run-app-procedure">

1. 導覽至 <Path>Server.kt</Path> 檔案。
2. 在 IntelliJ IDEA 中，點擊 `main()` 函式旁邊的執行按鈕
   (![IntelliJ IDEA 執行圖示](intellij_idea_gutter_icon.svg){style="inline" height="16" width="16"})
   以啟動應用程式。

   你應該會在 **Run** 工具面板中看到輸出：

   ![IntelliJ IDEA 中的執行伺服器輸出](tutorial_kotlin_rpc_run_server.png){style="block" width="706" border-effect="line"}
3. 導覽至 <Path>Client.kt</Path> 檔案並執行應用程式。你應該會在主控台中看到以下輸出：

   ```shell
   Your pizza cost 7.89

   Process finished with exit code 0
   ```

</procedure>

## 擴充範例 {id="extend-the-example"}

最後，你可以增加範例應用程式的複雜度，為未來的開發奠定堅實的基礎。

<procedure id="extend-server">

1. 在 <Path>PizzaShop.kt</Path> 檔案中，擴充 `orderPizza` 方法以納入用戶端 ID，並新增一個傳回指定用戶端所有待處理訂單的 `viewOrders()` 方法：

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

   你可以傳回 `Flow` 而不是 `List` 或 `Set`，藉此利用協同程式程式庫的優勢。這將允許你一次一份披薩訂單將資訊串流傳輸到用戶端。
2. 導覽至 <Path>Server.kt</Path> 檔案，並透過將目前的訂單儲存在列表的映射（map of lists）中來實作此功能：

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

   伺服器會為每個連線的用戶端建立一個新的 `PizzaShopImpl` 執行個體。這能藉由隔離個別用戶端的狀態來避免衝突。
   > 此實作並非執行緒安全 (thread-safe)。如果同一個 `PizzaShopImpl` 執行個體接收到並行呼叫，它們可能會同時修改 `openOrders` 並造成資料損毀。在正式生產環境程式碼中，請使用執行緒安全的結構。
   > 
   {style="warning"}
3. 在 <Path>Client.kt</Path> 檔案中，使用兩個不同的用戶端 ID 提交多筆訂單：

   ```kotlin
       val pizzaShop: PizzaShop = client.withService<PizzaShop>()
   
       pizzaShop.orderPizza("AB12", Pizza("Pepperoni"))
       pizzaShop.orderPizza("AB12", Pizza("Hawaiian"))
       pizzaShop.orderPizza("AB12", Pizza("Calzone"))
   
       pizzaShop.orderPizza("CD34", Pizza("Margherita"))
       pizzaShop.orderPizza("CD34", Pizza("Sicilian"))
       pizzaShop.orderPizza("CD34", Pizza("California"))
   ```

   然後使用 `Coroutines` 程式庫和 `collect` 方法對結果進行反覆運算：

   ```kotlin
       pizzaShop.viewOrders("AB12").collect {
           println("AB12 ordered ${it.name}")
       }
   
       pizzaShop.viewOrders("CD34").collect {
           println("CD34 ordered ${it.name}")
       }
   ```
4. 執行伺服器和用戶端。當你執行用戶端時，將會看到結果以遞增方式顯示：

   ![用戶端輸出以遞增方式顯示結果](tutorial_kotlin_rpc_run_client.gif){style="block" width="706" border-effect="line"}

</procedure>

建立好可運作的範例後，現在讓我們深入探討背後的運作機制。特別是，讓我們比較並對照 Kotlin RPC 與兩大主流替代方案——REST 和 gRPC。

## RPC vs. REST {id="rpc-vs-rest"}

RPC 的概念比 REST 早得多，[至少可以追溯至 1981 年](https://en.wikipedia.org/wiki/Remote_procedure_call)。與 REST 相比，採用 RPC 的方法不受限於統一介面（例如 HTTP 請求類型），在程式碼中使用起來簡單得多，且得益於二進位傳訊，效能也可能更佳。

然而，REST 具備三大優勢：

1. 它可以直接供瀏覽器中的 JavaScript 用戶端使用，進而作為單頁應用程式 (SPA) 的一部分。由於 RPC 架構仰賴產生的虛設常式和二進位傳訊，因此不太容易與 JavaScript 生態系統良好契合。
2. REST 能讓人一眼看出某項功能涉及網路傳輸。這有助於避免 Martin Fowler 所指出的[分散式物件反模式 (distributed objects antipattern)](https://martinfowler.com/articles/distributed-objects-microservices.html)。當團隊將其物件導向設計拆分為兩個或多個部分，卻沒有考量將本機程序呼叫轉變為遠端呼叫對效能與可靠性造成的影響時，就會發生這種情況。
3. REST API 建構於一系列慣例之上，這讓它們相對容易建立、編寫文件、監控、偵錯與測試。並且有龐大的工具生態系統來提供支援。

這些權衡取捨意味著 Kotlin RPC 最適合在兩種情境下使用：第一，在採用 [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/) 的 KMP 用戶端中；第二，在雲端中協作的微服務之間。未來 [Kotlin/Wasm](https://kotlinlang.org/docs/wasm-overview.html) 的發展可能會讓 `kotlinx.rpc` 更適合應用於瀏覽器架構的應用程式。

## Kotlin RPC vs. Google RPC {id="kotlin-rpc-vs-google-rpc"}

Google RPC 是目前軟體產業中佔主導地位的 RPC 技術。它使用名為 Protocol Buffers (protobuf) 的標準，透過與語言無關的介面定義語言 (IDL) 來定義資料結構與訊息酬載。這些 IDL 定義可以轉換成各種程式語言，並使用緊湊且高效的二進位格式進行序列化。Quarkus 和 Micronaut 等微服務架構已經支援 gRPC。

對 Kotlin RPC 來說，與 gRPC 競爭是困難的，且這對 Kotlin 社群也沒有任何好處。慶幸的是，團隊並無此打算。相反地，其目標是讓 kotlinx.rpc 與 gRPC 相容並具備互通性。未來 kotlinx.rpc 服務將可以使用 gRPC 作為其網路通訊協定，而 kotlinx.rpc 用戶端也可以呼叫 gRPC 服務。`kotlinx.rpc` 將使用[其自有的 kRPC 協定](https://kotlin.github.io/kotlinx-rpc/transport.html)作為預設選項（就像我們目前的範例一樣），但沒有任何限制妨礙你選擇改用 gRPC。

## 後續步驟 {id="next-steps"}

Kotlin RPC 將 Kotlin 生態系統擴展到一個新的方向，為建立與取用服務提供了 REST 和 GraphQL 之外的替代選擇。它建立在成熟的程式庫與架構之上，例如 Ktor、Coroutines 以及 `kotlinx-serialization`。對於尋求利用 Kotlin Multiplatform 和 Compose Multiplatform 的團隊來說，它將為分散式傳訊提供簡單且高效的選擇。

如果本篇介紹引起了你的興趣，請務必參閱[官方 `kotlinx.rpc` 文件](https://kotlin.github.io/kotlinx-rpc/get-started.html)與[範例](https://github.com/Kotlin/kotlinx-rpc/tree/main/samples)。

`kotlinx.rpc` 程式庫仍處於早期階段，因此我們鼓勵你探索並分享你的回饋。問題回報與功能請求可以在 [YouTrack](https://youtrack.jetbrains.com/issues/KRPC) 上找到，而一般的討論則在 [Slack](https://kotlinlang.slack.com/archives/C072YJ3Q91V) 上進行（[申請加入權限](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)）。