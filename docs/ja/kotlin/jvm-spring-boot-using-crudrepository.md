[//]: # (title: データベースアクセスに Spring Data CrudRepository を使用する)

<web-summary>Kotlin で記述された Spring Boot プロジェクトで Spring Data インターフェースを使用します。</web-summary>

<tldr>
    <p>これは <strong>Spring Boot と Kotlin を使ってみる</strong> チュートリアルの最終パートです。先に進む前に、前の手順を完了していることを確認してください：</p><br/>
    <p><img src="icon-1-done.svg" width="20" alt="First step"/> <a href="jvm-create-project-with-spring-boot.md">Kotlin で Spring Boot プロジェクトを作成する</a><br/><img src="icon-2-done.svg" width="20" alt="Second step"/> <a href="jvm-spring-boot-add-data-class.md">Spring Boot プロジェクトにデータクラスを追加する</a><br/><img src="icon-3-done.svg" width="20" alt="Third step"/> <a href="jvm-spring-boot-add-db-support.md">Spring Boot プロジェクトにデータベースサポートを追加する</a><br/><img src="icon-4.svg" width="20" alt="Fourth step"/> <strong>データベースアクセスに Spring Data CrudRepository を使用する</strong></p>
</tldr>

このパートでは、データベースアクセスに `JdbcTemplate` の代わりに [Spring Data](https://docs.spring.io/spring-data/commons/docs/current/api/org/springframework/data/repository/CrudRepository.html) の `CrudRepository` を使用するようにサービスレイヤーを移行します。
`CrudRepository` は、特定の型のリポジトリに対して一般的な [CRUD](https://ja.wikipedia.org/wiki/CRUD) 操作を行うための Spring Data インターフェースです。
データベースを操作するためのいくつかのメソッドを標準で提供しています。

## アプリケーションの更新

まず、`CrudRepository` API で動作するように `Message` クラスを調整する必要があります。

1. `Message` クラスに `@Table` アノテーションを追加して、データベーステーブルへのマッピングを宣言します。  
   `id` フィールドの前に `@Id` アノテーションを追加します。

    > これらのアノテーションには、追加のインポートも必要です。
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

    さらに、`Message` クラスの使用をより Kotlin らしく（idiomatic）するために、`id` プロパティのデフォルト値を null に設定し、データクラスのプロパティの順序を入れ替えることができます。

    ```kotlin
    @Table("MESSAGES")
    data class Message(val text: String, @Id val id: String? = null)
    ```
 
    これで、`Message` クラスの新しいインスタンスを作成する必要がある場合、パラメータとして `text` プロパティのみを指定できるようになります。

    ```kotlin
    val message = Message("Hello") // id は null
    ```

2. `Message` データクラスを扱う `CrudRepository` のインターフェースを宣言します。`MessageRepository.kt` ファイルを作成し、以下のコードを追加します。

    ```kotlin
    // MessageRepository.kt
    package com.example.demo
   
    import org.springframework.data.repository.CrudRepository
    
    interface MessageRepository : CrudRepository<Message, String>
    ```

3. `MessageService` クラスを更新します。SQL クエリを直接実行する代わりに `MessageRepository` を使用するようになります。

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
       <def title="拡張関数">
          <p><code>findByIdOrNull()</code> 関数は、Spring Data JDBC における <code>CrudRepository</code> インターフェースの<a href="extensions.md#extension-functions">拡張関数</a>です。</p>
       </def>
       <def title="CrudRepository の save() 関数">
          <p><a href="https://docs.spring.io/spring-data/relational/reference/#jdbc.entity-persistence">この関数は</a>、新しいオブジェクトがデータベース内に ID を持っていないという前提で動作します。そのため、挿入時には ID が <b>null である必要</b>があります。</p>
          <p> ID が <i>null</i> でない場合、<code>CrudRepository</code> はオブジェクトが既にデータベースに存在するとみなし、<i>insert</i> 操作ではなく <i>update</i> 操作であると判断します。挿入操作の後、<code>id</code> はデータストアによって生成され、<code>Message</code> インスタンスに割り当てられます。</p>
          <p></p>
       </def>
    </deflist>

4. 挿入されたオブジェクトの ID を生成するようにメッセージテーブルの定義を更新します。`id` は文字列であるため、デフォルトで ID 値を生成するために `RANDOM_UUID()` 関数を使用できます。

    ```sql
    -- schema.sql 
    CREATE TABLE IF NOT EXISTS messages (
        id      VARCHAR(60)  DEFAULT RANDOM_UUID() PRIMARY KEY,
        text    VARCHAR      NOT NULL
    );
    ```

5. `src/main/resources` フォルダにある `application.properties` ファイル内のデータベース名を更新します。

   ```none
   spring.application.name=demo
   spring.datasource.driver-class-name=org.h2.Driver
   spring.datasource.url=jdbc:h2:file:./data/testdb2
   spring.datasource.username=name
   spring.datasource.password=password
   spring.sql.init.schema-locations=classpath:schema.sql
   spring.sql.init.mode=always
   ```

以下はアプリケーションの完全なコードです：

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
        // メッセージが null（見つからない）の場合、レスポンスコードを 404 に設定
        this?.let { ResponseEntity.ok(it) } ?: ResponseEntity.notFound().build()
}
```
{initial-collapse-state="collapsed" collapsible="true"}

## アプリケーションの実行

おめでとうございます！アプリケーションを再度実行する準備が整いました。
`JdbcTemplate` を `CrudRepository` に置き換えた後も機能は変わらないため、アプリケーションは以前と同じように動作します。

これで、`requests.http` ファイルから [POST および GET HTTP リクエストを実行](jvm-spring-boot-add-db-support.md#add-messages-to-database-via-http-request)して、同じ結果を得ることができます。

## 次のステップ

Kotlin の機能を把握し、言語の学習進捗を追跡するのに役立つ、あなた専用の言語マップを入手してください：

<a href="https://resources.jetbrains.com/storage/products/kotlin/docs/Kotlin_Language_Features_Map.pdf">
   <img src="get-kotlin-language-map.png" width="700" alt="Kotlin 言語マップを入手する" style="block"/>
</a>

* [Spring Framework](https://docs.spring.io/spring-framework/reference/) のドキュメントを確認してください。
* [Securing a web application](https://spring.io/guides/gs/securing-web) チュートリアルで、保護されたリソースを持つシンプルな Web アプリケーションを作成します。
* [Building web applications with Spring Boot and Kotlin](https://spring.io/guides/tutorials/spring-boot-kotlin) チュートリアルを完了してください。