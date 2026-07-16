[//]: # (title: 使用 Spring Data CrudRepository 進行資料庫存取)

<web-summary>在以 Kotlin 編寫的 Spring Boot 專案中處理 Spring Data 介面。</web-summary>

<tldr>
    <p>這是<strong>開始使用 Spring Boot 與 Kotlin</strong> 教學的最後一部分。在繼續之前，請確保您已完成先前的步驟：</p><br/>
    <p><img src="icon-1-done.svg" width="20" alt="第一步"/> <a href="jvm-create-project-with-spring-boot.md">使用 Kotlin 建立 Spring Boot 專案</a><br/><img src="icon-2-done.svg" width="20" alt="第二步"/> <a href="jvm-spring-boot-add-data-class.md">為 Spring Boot 專案加入資料類別</a><br/><img src="icon-3-done.svg" width="20" alt="第三步"/> <a href="jvm-spring-boot-add-db-support.md">為 Spring Boot 專案加入資料庫支援</a><br/><img src="icon-4.svg" width="20" alt="第四步"/> <strong>使用 Spring Data CrudRepository 進行資料庫存取</strong></p>
</tldr>

在這一部分中，您將遷移服務層，改為使用 [Spring Data](https://docs.spring.io/spring-data/commons/docs/current/api/org/springframework/data/repository/CrudRepository.html) `CrudRepository` 而非 `JdbcTemplate` 進行資料庫存取。
`CrudRepository` 是一個 Spring Data 介面，用於對特定類型的存儲庫進行通用的 [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) 操作。
它隨附提供了多個用於與資料庫互動的現成方法。

## 更新您的應用程式

首先，您需要調整 `Message` 類別以搭配 `CrudRepository` API 使用：

1. 為 `Message` 類別加入 `@Table` 註解，以宣告與資料庫資料表的對應。  
   在 `id` 欄位前加入 `@Id` 註解。

    > 這些註解還需要額外的匯入。
    >  
    {style="note"}

    ```kotlin
    // Message.kt
    package com.example.demo
   
    import org.springframework.data.annotation.Id
    import org.springframework.data.relational.core.mapping.Table
    
    @Table("MESSAGES")
    data class Message(@Id val id: String?, val text: String)
    ```

    此外，為了讓 `Message` 類別的使用更符合慣例（idiomatic），
    您可以將 `id` 屬性的預設值設定為 null，並翻轉資料類別屬性的順序： 

    ```kotlin
    @Table("MESSAGES")
    data class Message(val text: String, @Id val id: String? = null)
    ```
 
    現在，如果您需要建立 `Message` 類別的新執行個體，可以僅指定 `text` 屬性作為參數：

    ```kotlin
    val message = Message("Hello") // id 為 null
    ```

2. 為將與 `Message` 資料類別配合使用的 `CrudRepository` 宣告一個介面。建立 `MessageRepository.kt` 檔案並加入以下程式碼：

    ```kotlin
    // MessageRepository.kt
    package com.example.demo
   
    import org.springframework.data.repository.CrudRepository
    
    interface MessageRepository : CrudRepository<Message, String>
    ```

3. 更新 `MessageService` 類別。它現在將使用 `MessageRepository` 而非執行 SQL 查詢：

    ```kotlin
    // MessageService.kt
    package com.example.demo

    import org.springframework.data.repository.findByIdOrNull
    import org.springframework.stereotype.Service
    
    @Service
    class MessageService(private val db: MessageRepository) {
        fun findMessages(): `List<Message>` = db.findAll().toList()
    
        fun findMessageById(id: String): Message? = db.findByIdOrNull(id)
    
        fun save(message: Message): Message = db.save(message)
    }
    ```

    <deflist collapsible="true">
       <def title="擴充函式">
          <p><code>findByIdOrNull()</code> 函式是 Spring Data JDBC 中 <code>CrudRepository</code> 介面的<a href="extensions.md#extension-functions">擴充函式</a>。</p>
       </def>
       <def title="CrudRepository save() 函式">
          <p><a href="https://docs.spring.io/spring-data/relational/reference/#jdbc.entity-persistence">此函式的工作</a>前提是新物件在資料庫中沒有 id。因此，對於插入操作，id <b>應為 null</b>。</p>
          <p> 如果 id 不是 <i>null</i>，<code>CrudRepository</code> 會假設該物件已存在於資料庫中，並將其視為<i>更新（update）</i>操作而非<i>插入（insert）</i>操作。在插入操作之後，<code>id</code> 將由資料存儲產生並回填至 <code>Message</code> 執行個體中。</p>
          <p></p>
       </def>
    </deflist>

4. 更新 messages 資料表定義，以便為插入的物件產生 id。由於 `id` 是字串，您可以使用 `RANDOM_UUID()` 函式作為預設值來產生 id 值：

    ```sql
    -- schema.sql 
    CREATE TABLE IF NOT EXISTS messages (
        id      VARCHAR(60)  DEFAULT RANDOM_UUID() PRIMARY KEY,
        text    VARCHAR      NOT NULL
    );
    ```

5. 更新位於 `src/main/resources` 資料夾中 `application.properties` 檔案內的資料庫名稱：

   ```none
   spring.application.name=demo
   spring.datasource.driver-class-name=org.h2.Driver
   spring.datasource.url=jdbc:h2:file:./data/testdb2
   spring.datasource.username=name
   spring.datasource.password=password
   spring.sql.init.schema-locations=classpath:schema.sql
   spring.sql.init.mode=always
   ```

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

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table

@Table("MESSAGES")
data class Message(val text: String, @Id val id: String? = null)
```
{initial-collapse-state="collapsed" collapsible="true"}

```kotlin
// MessageRepository.kt
package com.example.demo

import org.springframework.data.repository.CrudRepository

interface MessageRepository : CrudRepository<Message, String>
```
{initial-collapse-state="collapsed" collapsible="true"}

```kotlin
// MessageService.kt
package com.example.demo

import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service

@Service
class MessageService(private val db: MessageRepository) {
    fun findMessages(): `List<Message>` = db.findAll().toList()

    fun findMessageById(id: String): Message? = db.findByIdOrNull(id)

    fun save(message: Message): Message = db.save(message)
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
        // 如果訊息為 null（找不到），將回應代碼設為 404
        this?.let { ResponseEntity.ok(it) } ?: ResponseEntity.notFound().build()
}
```
{initial-collapse-state="collapsed" collapsible="true"}

## 執行應用程式

恭喜！應用程式已準備好再次執行。
在將 `JdbcTemplate` 替換為 `CrudRepository` 之後，功能性保持不變，因此應用程式的運作方式與之前完全相同。

您現在可以從 `requests.http` 檔案中[執行 POST 與 GET HTTP 請求](jvm-spring-boot-add-db-support.md#add-messages-to-database-via-http-request)，並獲得相同的結果。

## 下一步

獲取您的個人語言地圖，協助您探索 Kotlin 特性並追蹤學習進度：

<a href="https://resources.jetbrains.com/storage/products/kotlin/docs/Kotlin_Language_Features_Map.pdf">
   <img src="get-kotlin-language-map.png" width="700" alt="獲取 Kotlin 語言地圖" style="block"/>
</a>

* 參閱 [Spring 架構](https://docs.spring.io/spring-framework/reference/)文件。
* 在[保護 Web 應用程式](https://spring.io/guides/gs/securing-web)教學中建立一個具有受保護資源的簡單 Web 應用程式。
* 完成[使用 Spring Boot 與 Kotlin 建置 Web 應用程式](https://spring.io/guides/tutorials/spring-boot-kotlin)教學。