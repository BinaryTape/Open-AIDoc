[//]: # (title: 為 Spring Boot 專案新增 data class)

<web-summary>為 Spring Boot 專案新增 Kotlin data class。</web-summary>

在此部分教學中，您將為應用程式新增更多功能，並探索更多 Kotlin 語言特性，例如 data class。
這需要修改 `MessageController` 類別，使其回傳包含序列化物件集合的 JSON 文件。

## 更新您的應用程式 {id="update-your-application"}

1. 在同一個套件中，於 `DemoApplication.kt` 檔案旁邊建立 `Message.kt` 檔案。
2. 在 `Message.kt` 檔案中，建立一個具有兩個屬性的 data class：`id` 與 `text`：

    ```kotlin
    // Message.kt
    package com.example.demo
   
    data class Message(val id: String?, val text: String)
    ```

   `Message` 類別將用於資料傳輸：序列化的 `Message` 物件清單將構成控制器回應瀏覽器請求的 JSON 文件。

   <deflist collapsible="true">
       <def title="Data classes – data class Message">
          <p>Kotlin 中 <a href="data-classes.md">data class</a> 的主要目的是持有資料。這類類別會標註 <code>data</code> 關鍵字，且通常可以從類別結構中機械地推導出一些標準功能和工具函式。</p>
          <p>在此範例中，您將 <code>Message</code> 宣告為 data class，因為它的主要目的是儲存資料。</p>
       </def>
       <def title="val 與 var 屬性">
          <p><a href="properties.md">Kotlin 類別中的屬性</a>可以宣告為：</p>
          <list>
             <li><i>可變</i>，使用 <code>var</code> 關鍵字</li>
             <li><i>唯讀</i>，使用 <code>val</code> 關鍵字</li>
          </list>
          <p><code>Message</code> 類別使用 <code>val</code> 關鍵字宣告了兩個屬性：<code>id</code> 與 <code>text</code>。
          編譯器將自動為這兩個屬性產生 getter。
          在 <code>Message</code> 類別的執行個體建立後，將無法重新指派這些屬性的值。
          </p>
       </def>
       <def title="可 null 型別 – String?">
          <p>Kotlin 提供<a href="null-safety.md#nullable-types-and-non-nullable-types">對可 null 型別的內建支援</a>。在 Kotlin 中，型別系統區分了可以持有 <code>null</code> 的參照（<i>可 null 參照</i>）與不能持有 <code>null</code> 的參照（<i>不可 null 參照</i>）。<br/>
          例如，<code>String</code> 型別的一般變數不能持有 <code>null</code>。若要允許 null，您可以透過撰寫 <code>String?</code> 將變數宣告為可 null 字串。
          </p>
          <p>這次將 <code>Message</code> 類別的 <code>id</code> 屬性宣告為可 null 型別。
          因此，可以在建立 <code>Message</code> 類別的執行個體時將 <code>null</code> 作為 <code>id</code> 的值傳遞：
          </p>
          <code-block lang="kotlin">
          Message(null, "Hello!")
          </code-block>
       </def>
   </deflist>
3. 在 `MessageController.kt` 檔案中，將 `index()` 函式替換為回傳 `Message` 物件清單的 `listMessages()` 函式：

    ```kotlin
    // MessageController.kt
    package com.example.demo
   
    import org.springframework.web.bind.annotation.GetMapping
    import org.springframework.web.bind.annotation.RequestMapping
    import org.springframework.web.bind.annotation.RestController

    @RestController
    @RequestMapping("/")
    class MessageController {
        @GetMapping
        fun listMessages() = listOf(
            Message("1", "Hello!"),
            Message("2", "Bonjour!"),
            Message("3", "Privet!"),
        )
    }
    ```

    <deflist collapsible="true">
       <def title="集合 – listOf()">
          <p>Kotlin 標準函式庫提供了基本集合型別的實作：set、list 與 map。<br/>
          每種集合型別可以是<i>唯讀</i>或<i>可變</i>的：</p>
          <list>
              <li><i>唯讀</i>集合提供存取集合元素的操作。</li>
              <li><i>可變</i>集合還提供用於新增、移除與更新其元素的寫入操作。</li>
          </list>
          <p>Kotlin 標準函式庫也提供了相應的工廠函式來建立這些集合的執行個體。
          </p>
          <p>在此教學中，您使用 <a href="https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/list-of.html"><code>listOf()</code></a> 函式來建立一個 <code>Message</code> 物件清單。
          這是建立<i>唯讀</i>物件清單的工廠函式：您無法從清單中新增或移除元素。<br/>
          如果需要對清單執行寫入操作，請呼叫 <a href="https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/mutable-list-of.html"><code>mutableListOf()</code></a> 函式來建立可變清單執行個體。
          </p>
       </def>
       <def title="尾隨逗號">
          <p><a href="coding-conventions.md#trailing-commas">尾隨逗號</a>是指在一系列元素的<b>最後一個項目</b>之後的逗號符號：</p>
            <code-block lang="kotlin">
            Message("3", "Privet!"),
            </code-block>
          <p>這是 Kotlin 語法的一項便利特性，且完全是選用的——即使沒有它們，您的程式碼仍可正常運作。
          </p>
          <p>在上述範例中，建立 <code>Message</code> 物件清單時，在最後一個 <code>listOf()</code> 函式引數後包含了尾隨逗號。</p>
       </def>
    </deflist>

`MessageController` 的回應現在將是一個包含 `Message` 物件集合的 JSON 文件。

> 如果類別路徑中包含 Jackson 函式庫，Spring 應用程式中的任何控制器預設都會呈現 JSON 回應。
> 由於您[在 `build.gradle.kts` 檔案中指定了 `spring-boot-starter-webmvc` 相依性](jvm-create-project-with-spring-boot.md#explore-the-project-gradle-build-file)，Jackson 會作為 *遞移* 相依性被引入。
> 因此，如果端點回傳一個可以序列化為 JSON 的資料結構，應用程式就會以 JSON 文件進行回應。
>
{style="note"}

以下是 `DemoApplication.kt`、`MessageController.kt` 與 `Message.kt` 檔案的完整程式碼：

```kotlin
// DemoApplication.kt
package com.example.demo

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class DemoApplication

fun main(args: Array<String>) {
    runApplication<DemoApplication>(*args)
}
```
{initial-collapse-state="collapsed" collapsible="true"}

```kotlin
// MessageController.kt
package com.example.demo

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/")
class MessageController {
    @GetMapping
    fun listMessages() = listOf(
        Message("1", "Hello!"),
        Message("2", "Bonjour!"),
        Message("3", "Privet!"),
    )
}
```
{initial-collapse-state="collapsed" collapsible="true"}

```kotlin
// Message.kt
package com.example.demo

data class Message(val id: String?, val text: String)
```
{initial-collapse-state="collapsed" collapsible="true"}

## 執行應用程式 {id="run-the-application"}

Spring 應用程式已準備好執行：

1. 再次執行應用程式。

2. 應用程式啟動後，開啟以下網址：

    ```text
    http://localhost:8080
    ```

    您將看到一個以 JSON 格式顯示訊息集合的頁面：

    ![執行應用程式](messages-in-json-format.png){width=700}

## 下一步 {id="next-step"}

在教學的下一部分中，您將為專案新增並配置資料庫，並發送 HTTP 請求。

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="jvm-create-project-with-spring-boot.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
  <li>
    <a as="button" href="jvm-spring-boot-add-db-support.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>
  </li>
</list>