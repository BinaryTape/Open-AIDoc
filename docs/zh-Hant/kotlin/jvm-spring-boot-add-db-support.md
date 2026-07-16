[//]: # (title: 為 Spring Boot 專案新增資料庫支援)

<web-summary>為使用 Kotlin 編寫並採用 JDBC 範本的 Spring Boot 專案新增資料庫支援。</web-summary>

<tldr>
    <p>這是 <strong>開始使用 Spring Boot 與 Kotlin</strong> 教學的第三部分。在繼續之前，請確保你已完成之前的步驟：</p><br/>
    <p><img src="icon-1-done.svg" width="20" alt="第一步"/> <a href="jvm-create-project-with-spring-boot.md">使用 Kotlin 建立 Spring Boot 專案</a><br/><img src="icon-2-done.svg" width="20" alt="第二步"/> <a href="jvm-spring-boot-add-data-class.md">為 Spring Boot 專案新增資料類別</a><br/><img src="icon-3.svg" width="20" alt="第三步"/> <strong>為 Spring Boot 專案新增資料庫支援</strong><br/><img src="icon-4-todo.svg" width="20" alt="第四步"/> 使用 Spring Data CrudRepository 進行資料庫存取</p>
</tldr>

在本部分教學中，你將使用 _Java Database Connectivity_ (JDBC) 為專案新增並配置資料庫。
在 JVM 應用程式中，你會使用 JDBC 與資料庫進行互動。
為了方便起見，Spring Framework 提供了 `JdbcTemplate` 類別，可簡化 JDBC 的使用並協助避免常見錯誤。

## 新增資料庫支援

在基於 Spring Framework 的應用程式中，常見的做法是在所謂的 _服務 (service)_ 層中實作資料庫存取邏輯 —— 這是商業邏輯所在之處。
在 Spring 中，你應該使用 `@Service` 註解標記類別，以表示該類別屬於應用程式的服務層。
在此應用程式中，你將為此目的建立 `MessageService` 類別。

在同一個套件中，建立 `MessageService.kt` 檔案與 `MessageService` 類別，內容如下：

```kotlin
// MessageService.kt
package com.example.demo

import org.springframework.stereotype.Service
import org.springframework.jdbc.core.JdbcTemplate

@Service
class MessageService(private val db: JdbcTemplate) {
    fun findMessages(): `List<Message>` = db.query("select * from messages") { response, _ ->
        Message(response.getString("id"), response.getString("text"))
    }

    fun save(message: Message): Message {
        db.update(
            "insert into messages values ( ?, ? )",
            message.id, message.text
        )
        return message
    }
}
```

<deflist collapsible="true">
   <def title="建構函式引數與相依注入 – (private val db: JdbcTemplate)">
      <p>Kotlin 中的類別具有一個主建構函數。它也可以有一個或多個 <a href="classes.md#secondary-constructors">次要建構函數</a>。
      <i>主建構函數</i> 是類別標頭的一部分，位於類別名稱和選用的型別參數之後。在我們的案例中，建構函式為 <code>(val db: JdbcTemplate)</code>。</p>
      <p><code>val db: JdbcTemplate</code> 是建構函式的引數：</p>
      <code-block lang="kotlin">
      @Service
      class MessageService(private val db: JdbcTemplate)
      </code-block>
  </def>
   <def title="尾隨 Lambda 與 SAM 轉換">
      <p><code>findMessages()</code> 函式呼叫了 <code>JdbcTemplate</code> 類別的 <code>query()</code> 函式。<code>query()</code> 函式接受兩個引數：作為 String 執行個體的 SQL 查詢，以及一個將每一列映射到一個物件的回呼 (callback)：</p>
      <code-block lang="sql">
      db.query("...", RowMapper { ... } )
      </code-block><br/>
      <p><code>RowMapper</code> 介面僅宣告了一個方法，因此可以透過省略介面名稱的 Lambda 運算式來實作它。Kotlin 編譯器知道 Lambda 運算式需要轉換成的介面，因為你將其用作函式呼叫的參數。這被稱為 <a href="java-interop.md#sam-conversions">Kotlin 中的 SAM 轉換</a>：</p>
      <code-block lang="sql">
      db.query("...", { ... } )
      </code-block><br/>
      <p>在 SAM 轉換之後，查詢函式最終會有兩個引數：第一個位置的 String，以及最後一個位置的 Lambda 運算式。根據 Kotlin 慣例，如果函式的最後一個參數是函式，那麼作為對應引數傳遞的 Lambda 運算式可以放置在括號之外。這種語法也被稱為 <a href="lambdas.md#passing-trailing-lambdas">尾隨 Lambda</a>：</p>
      <code-block lang="sql">
      db.query("...") { ... }
      </code-block>
   </def>
   <def title="用於未使用的 Lambda 引數的底線">
      <p>對於具有多個參數的 Lambda，你可以使用底線 <code>_</code> 字元來替換你未使用的參數名稱。</p>
      <p>因此，查詢函式呼叫的最終語法如下所示：</p>
      <code-block lang="kotlin">
      db.query("select * from messages") { response, _ ->
          Message(response.getString("id"), response.getString("text"))
      }
      </code-block>
   </def>
</deflist>

## 更新 MessageController 類別

更新 `MessageController.kt` 以使用新的 `MessageService` 類別：

```kotlin
// MessageController.kt
package com.example.demo

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.net.URI

@RestController
@RequestMapping("/")
class MessageController(private val service: MessageService) {
    @GetMapping
    fun listMessages() = service.findMessages()

    @PostMapping
    fun post(@RequestBody message: Message): ResponseEntity<Message> {
        val savedMessage = service.save(message)
        return ResponseEntity.created(URI("/${savedMessage.id}")).body(savedMessage)
    }
}
```

<deflist collapsible="true">
   <def title="@PostMapping 註解">
      <p>負責處理 HTTP POST 請求的方法需要加上 <code>@PostMapping</code> 註解。為了能夠將作為 HTTP Body 內容傳送的 JSON 轉換為物件，你需要為方法引數使用 <code>@RequestBody</code> 註解。由於應用程式的 classpath 中包含 Jackson 程式庫，轉換會自動進行。</p>
   </def>
   <def title="ResponseEntity">
      <p><code>ResponseEntity</code> 代表整個 HTTP 回應：狀態碼、標頭和主體。</p>
      <p> 使用 <code>created()</code> 方法，你可以配置回應狀態碼 (201) 並設定位置標頭，指出所建立資源的 context 路徑。</p>
   </def>
</deflist>

## 更新 MessageService 類別

`Message` 類別的 `id` 被宣告為可 null 的 String：

```kotlin
data class Message(val id: String?, val text: String)
```

然而，將 `null` 作為 `id` 值儲存在資料庫中是不正確的：你需要優雅地處理這種情況。

更新 `MessageService.kt` 檔案的程式碼，以便在將訊息儲存到資料庫時，如果 `id` 為 `null`，則產生一個新值：

```kotlin
// MessageService.kt
package com.example.demo

import org.springframework.stereotype.Service
import org.springframework.jdbc.core.JdbcTemplate
import java.util.UUID

@Service
class MessageService(private val db: JdbcTemplate) {
    fun findMessages(): `List<Message>` = db.query("select * from messages") { response, _ ->
        Message(response.getString("id"), response.getString("text"))
    }

    fun save(message: Message): Message {
        val id = message.id ?: UUID.randomUUID().toString() // 如果 id 為 null，則產生新的 id
        db.update(
            "insert into messages values ( ?, ? )",
            id, message.text
        )
        return message.copy(id = id) // 傳回包含新 id 的訊息副本
    }
}
```

<deflist collapsible="true">
   <def title="Elvis 運算子 – ?:">
      <p>程式碼 <code>message.id ?: UUID.randomUUID().toString()</code> 使用了 <a href="null-safety.md#elvis-operator">Elvis 運算子 (if-not-null-else 簡寫) <code>?:</code></a>。如果 <code>?:</code> 左側的運算式不為 <code>null</code>，Elvis 運算子會傳回它；否則，它會傳回右側的運算式。請注意，只有在左側為 <code>null</code> 時，才會計算右側的運算式。</p>
   </def>
</deflist>

應用程式程式碼已準備好與資料庫配合使用。現在需要配置資料來源。

## 配置資料庫

在應用程式中配置資料庫：

1. 在 `src/main/resources` 目錄中建立 `schema.sql` 檔案。它將儲存資料庫物件定義：

   ![建立資料庫結構](create-database-schema.png){width=350}

2. 使用以下程式碼更新 `src/main/resources/schema.sql` 檔案：

   ```sql
   -- schema.sql
   CREATE TABLE IF NOT EXISTS messages (
   id       VARCHAR(60)  PRIMARY KEY,
   text     VARCHAR      NOT NULL
   );
   ```

   這會建立具有兩欄的 `messages` 表格：`id` 和 `text`。表格結構與 `Message` 類別的結構相符。

3. 開啟位於 `src/main/resources` 資料夾中的 `application.properties` 檔案，並新增以下應用程式屬性：

   ```none
   spring.application.name=demo
   spring.datasource.driver-class-name=org.h2.Driver
   spring.datasource.url=jdbc:h2:file:./data/testdb
   spring.datasource.username=name
   spring.datasource.password=password
   spring.sql.init.schema-locations=classpath:schema.sql
   spring.sql.init.mode=always
   ```

   這些設定為 Spring Boot 應用程式啟用了資料庫。
   請參閱 [Spring 文件](https://docs.spring.io/spring-boot/appendix/application-properties/index.html) 以取得常用應用程式屬性的完整清單。

## 透過 HTTP 請求將訊息新增至資料庫

你應該使用 HTTP 用戶端來操作先前建立的端點。在 IntelliJ IDEA 中，使用內建的 HTTP 用戶端：

1. 執行應用程式。應用程式啟動並執行後，你可以執行 POST 請求將訊息儲存在資料庫中。

2. 在專案根資料夾中建立 `requests.http` 檔案，並新增以下 HTTP 請求：

   ```http request
   ### Post "Hello!"
   POST http://localhost:8080/
   Content-Type: application/json
   
   {
     "text": "Hello!"
   }
   
   ### Post "Bonjour!"
   
   POST http://localhost:8080/
   Content-Type: application/json
   
   {
     "text": "Bonjour!"
   }
   
   ### Post "Privet!"
   
   POST http://localhost:8080/
   Content-Type: application/json
   
   {
     "text": "Privet!"
   }
   
   ### Get all the messages
   GET http://localhost:8080/
   ```

3. 執行所有 POST 請求。使用請求宣告旁裝訂邊上的綠色 **執行** 圖示。
   這些請求會將文字訊息寫入資料庫：

   ![執行 POST 請求](execute-post-requests.png){width=700}

4. 執行 GET 請求並在 **執行** 工具視窗中查看結果：

   ![執行 GET 請求](execute-get-requests.png){width=700}

### 執行請求的替代方式 {initial-collapse-state="collapsed" collapsible="true"}

你也可以使用任何其他 HTTP 用戶端或 cURL 命令列工具。例如，在終端中執行以下指令以獲得相同的結果：

```bash
curl -X POST --location "http://localhost:8080" -H "Content-Type: application/json" -d "{ \"text\": \"Hello!\" }"

curl -X POST --location "http://localhost:8080" -H "Content-Type: application/json" -d "{ \"text\": \"Bonjour!\" }"

curl -X POST --location "http://localhost:8080" -H "Content-Type: application/json" -d "{ \"text\": \"Privet!\" }"

curl -X GET --location "http://localhost:8080"
```

## 依識別碼檢索訊息

擴充應用程式的功能，以便依 id 檢索個別訊息。

1. 在 `MessageService` 類別中，新增函式 `findMessageById(id: String)` 以依 id 檢索個別訊息：

    ```kotlin
    // MessageService.kt
    package com.example.demo

    import org.springframework.stereotype.Service
    import org.springframework.jdbc.core.JdbcTemplate
    import org.springframework.jdbc.core.query
    import java.util.*
    
    @Service
    class MessageService(private val db: JdbcTemplate) {
        fun findMessages(): `List<Message>` = db.query("select * from messages") { response, _ ->
            Message(response.getString("id"), response.getString("text"))
        }
    
        fun findMessageById(id: String): Message? = db.query("select * from messages where id = ?", id) { response, _ ->
            Message(response.getString("id"), response.getString("text"))
        }.singleOrNull()
    
        fun save(message: Message): Message {
            val id = message.id ?: UUID.randomUUID().toString() // 如果 id 為 null，則產生新的 id
            db.update(
                "insert into messages values ( ?, ? )",
                id, message.text
            )
            return message.copy(id = id) // 傳回包含新 id 的訊息副本
        }
    }
    ```
    
    <deflist collapsible="true">
    <def title="參數清單中的 vararg 引數位置">
        <p><code>query()</code> 函式接受三個引數：</p>
        <list>
            <li>執行時需要參數的 SQL 查詢字串</li>
            <li><code>id</code>，這是一個 String 型別的參數</li>
            <li><code>RowMapper</code> 執行個體，由 Lambda 運算式實作</li>
        </list>
        <p><code>query()</code> 函式的第二個參數被宣告為<i>可變參數</i> (<code>vararg</code>)。在 Kotlin 中，可變參數不一定要放在參數清單的最後一個位置。</p>
    </def>
    <def title="singleOrNull() 函式">
       <p><a href="https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/single-or-null.html"><code>singleOrNull()</code></a> 函式會傳回單一元素，如果陣列為空或具有多個相同值的元素，則傳回 <code>null</code>。</p>
    </def>
   </deflist>
    
    > 用於依 id 獲取訊息的 `.query()` 函式是由 Spring Framework 提供的 [Kotlin 擴充函式](extensions.md#extension-functions)。如上面的程式碼所示，它需要額外的匯入 `import org.springframework.jdbc.core.query`。
    >
    {style="warning"}

2. 在 `MessageController` 類別中新增帶有 `id` 參數的新 `index(...)` 函式：

    ```kotlin
    // MessageController.kt
    package com.example.demo

    import org.springframework.http.ResponseEntity
    import org.springframework.web.bind.annotation.GetMapping
    import org.springframework.web.bind.annotation.PathVariable
    import org.springframework.web.bind.annotation.PostMapping
    import org.springframework.web.bind.annotation.RequestBody
    import org.springframework.web.bind.annotation.RequestMapping
    import org.springframework.web.bind.annotation.RestController
    import java.net.URI
    
    @RestController
    @RequestMapping("/")
    class MessageController(private val service: MessageService) {
        @GetMapping
        fun listMessages() = ResponseEntity.ok(service.findMessages())
        
        @PostMapping
        fun post(@RequestBody message: Message): ResponseEntity<Message> {
            val savedMessage = service.save(message)
            return ResponseEntity.created(URI("/${savedMessage.id}")).body(savedMessage)
        }
        
        @GetMapping("/{id}")
        fun getMessage(@PathVariable id: String): ResponseEntity<Message> =
            service.findMessageById(id).toResponseEntity()
        
        private fun Message?.toResponseEntity(): ResponseEntity<Message> =
            // 如果訊息為 null（未找到），將回應代碼設定為 404
            this?.let { ResponseEntity.ok(it) } ?: ResponseEntity.notFound().build() 
    }
    ```

    <deflist collapsible="true">
    <def title="從 context 路徑檢索值">
       <p>當你為新函式加上 <code>@GetMapping(&quot;/{id}&quot;)</code> 註解時，Spring Framework 會從 context 路徑中檢索訊息 <code>id</code>。透過為函式引數加上 <code>@PathVariable</code> 註解，你告訴框架將檢索到的值用作函式引數。新函式會呼叫 <code>MessageService</code> 以依 id 檢索個別訊息。</p>
    </def>
    <def title="具有可 null 接收者的擴充函式">
         <p>擴充功能可以定義為可 null 的接收者型別。如果接收者為 <code>null</code>，那麼 <code>this</code> 也會是 <code>null</code>。因此，在定義具有可 null 接收者型別的擴充功能時，建議在函式體內進行 <code>this == null</code> 檢查。</p>
         <p>你也可以像上面的 <code>toResponseEntity()</code> 函式那樣，使用虛無安全調用運算子 (<code>?.</code>) 來執行 null 檢查：</p>
         <code-block lang="kotlin">
         this?.let { ResponseEntity.ok(it) }
         </code-block>
    </def>
    <def title="ResponseEntity">
        <p><code>ResponseEntity</code> 代表 HTTP 回應，包括狀態碼、標頭和主體。它是一個泛型包裝器，可讓你更精確地控制內容，並將自訂的 HTTP 回應傳回給用戶端。</p>
    </def>
    </deflist>

以下是應用程式的完整程式碼：

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
// Message.kt
package com.example.demo

data class Message(val id: String?, val text: String)
```
{initial-collapse-state="collapsed" collapsible="true"}

```kotlin
// MessageService.kt
package com.example.demo

import org.springframework.stereotype.Service
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.query
import java.util.*

@Service
class MessageService(private val db: JdbcTemplate) {
    fun findMessages(): `List<Message>` = db.query("select * from messages") { response, _ ->
        Message(response.getString("id"), response.getString("text"))
    }

    fun findMessageById(id: String): Message? = db.query("select * from messages where id = ?", id) { response, _ ->
        Message(response.getString("id"), response.getString("text"))
    }.singleOrNull()

    fun save(message: Message): Message {
        val id = message.id ?: UUID.randomUUID().toString()
        db.update(
            "insert into messages values ( ?, ? )",
            id, message.text
        )
        return message.copy(id = id)
    }
}
```
{initial-collapse-state="collapsed" collapsible="true"}

```kotlin
// MessageController.kt
package com.example.demo

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.net.URI

@RestController
@RequestMapping("/")
class MessageController(private val service: MessageService) {
    @GetMapping
    fun listMessages() = ResponseEntity.ok(service.findMessages())

    @PostMapping
    fun post(@RequestBody message: Message): ResponseEntity<Message> {
        val savedMessage = service.save(message)
        return ResponseEntity.created(URI("/${savedMessage.id}")).body(savedMessage)
    }

    @GetMapping("/{id}")
    fun getMessage(@PathVariable id: String): ResponseEntity<Message> =
        service.findMessageById(id).toResponseEntity()

    private fun Message?.toResponseEntity(): ResponseEntity<Message> =
        this?.let { ResponseEntity.ok(it) } ?: ResponseEntity.notFound().build()
}
```
{initial-collapse-state="collapsed" collapsible="true"}

## 執行應用程式

Spring 應用程式已準備好執行：

1. 再次執行應用程式。

2. 開啟 `requests.http` 檔案並新增新的 GET 請求：

    ```http request
    ### Get the message by its id
    GET http://localhost:8080/id
    ```

3. 執行 GET 請求以從資料庫中檢索所有訊息。

4. 在 **執行** 工具視窗中，複製其中一個 id 並將其新增到請求中，如下所示：

    ```http request
    ### Get the message by its id
    GET http://localhost:8080/f910aa7e-11ee-4215-93ed-1aeeac822707
    ```
    
    > 請使用你自己的訊息 id 替換上述 id。
    >
    {style="note"}

5. 執行 GET 請求並在 **執行** 工具視窗中查看結果：

    ![依識別碼檢索訊息](retrieve-message-by-its-id.png){width=700}

## 下一步

最後一個步驟將向你展示如何使用 Spring Data 與資料庫進行更常見的連線。

**[繼續閱讀下一章節](jvm-spring-boot-using-crudrepository.md)**