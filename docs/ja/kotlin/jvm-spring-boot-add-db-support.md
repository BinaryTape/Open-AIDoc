[//]: # (title: Spring Bootプロジェクトにデータベース・サポートを追加する)

<web-summary>JDBCテンプレートを使用して、Kotlinで記述されたSpring Bootプロジェクトにデータベース・サポートを追加します。</web-summary>

<tldr>
    <p>これは、『KotlinによるSpring Boot入門』チュートリアルの第3パートです。続行する前に、前の手順を完了していることを確認してください：</p><br/>
    <p><img src="icon-1-done.svg" width="20" alt="First step"/> <a href="jvm-create-project-with-spring-boot.md">KotlinでSpring Bootプロジェクトを作成する</a><br/><img src="icon-2-done.svg" width="20" alt="Second step"/> <a href="jvm-spring-boot-add-data-class.md">Spring Bootプロジェクトにデータ・クラスを追加する</a><br/><img src="icon-3.svg" width="20" alt="Third step"/> <strong>Spring Bootプロジェクトにデータベース・サポートを追加する</strong><br/><img src="icon-4-todo.svg" width="20" alt="Fourth step"/> データベース・アクセスにSpring Data CrudRepositoryを使用する</p>
</tldr>

チュートリアルのこのパートでは、_Java Database Connectivity_ (JDBC) を使用して、プロジェクトにデータベースを追加および構成します。
JVMアプリケーションでは、JDBCを使用してデータベースとやり取りします。
便宜上、Spring FrameworkはJDBCの使用を簡素化し、一般的なエラーの回避に役立つ `JdbcTemplate` クラスを提供しています。

## データベース・サポートの追加

Spring Frameworkベースのアプリケーションにおける一般的な慣行は、いわゆる _サービス (service)_ レイヤー内にデータベース・アクセス・ロジックを実装することです。ここはビジネス・ロジックが存在する場所です。
Springでは、クラスがアプリケーションのサービス・レイヤーに属することを示すために、クラスに `@Service` アノテーションを付加する必要があります。
このアプリケーションでは、この目的のために `MessageService` クラスを作成します。

同じパッケージ内に、`MessageService.kt` ファイルと `MessageService` クラスを次のように作成します：

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
   <def title="コンストラクタ引数と依存性の注入 – (private val db: JdbcTemplate)">
      <p>Kotlinのクラスにはプライマリコンストラクタがあります。また、1つ以上の<a href="classes.md#secondary-constructors">セカンダリコンストラクタ</a>を持つこともできます。
      <i>プライマリコンストラクタ</i>はクラスヘッダーの一部であり、クラス名とオプションの型パラメータの後に続きます。この例では、コンストラクタは <code>(val db: JdbcTemplate)</code> です。</p>
      <p><code>val db: JdbcTemplate</code> はコンストラクタの引数です：</p>
      <code-block lang="kotlin">
      @Service
      class MessageService(private val db: JdbcTemplate)
      </code-block>
  </def>
   <def title="末尾のラムダ (Trailing lambda) と SAM変換">
      <p><code>findMessages()</code> 関数は <code>JdbcTemplate</code> クラスの <code>query()</code> 関数を呼び出します。<code>query()</code> 関数は、StringインスタンスとしてのSQLクエリと、各行を1つのオブジェクトにマッピングするコールバックの2つの引数を取ります：</p>
      <code-block lang="sql">
      db.query("...", RowMapper { ... } )
      </code-block><br/>
      <p><code>RowMapper</code> インターフェースはメソッドを1つしか宣言していないため、インターフェース名を省略してラムダ式で実装することが可能です。Kotlinコンパイラは、ラムダ式を変換する必要のあるインターフェースを認識しています。これは関数のパラメータとして使用されているためです。これは<a href="java-interop.md#sam-conversions">KotlinにおけるSAM変換</a>として知られています：</p>
      <code-block lang="sql">
      db.query("...", { ... } )
      </code-block><br/>
      <p>SAM変換後、query関数は、最初の位置にString、最後の位置にラムダ式という2つの引数を持つことになります。Kotlinの慣習に従い、関数の最後のパラメータが関数である場合、対応する引数として渡されるラムダ式を括弧の外側に配置できます。このような構文は、<a href="lambdas.md#passing-trailing-lambdas">末尾のラムダ (trailing lambda)</a> としても知られています：</p>
      <code-block lang="sql">
      db.query("...") { ... }
      </code-block>
   </def>
   <def title="未使用のラムダ引数のためのアンダースコア">
      <p>複数のパラメータを持つラムダの場合、使用しないパラメータの名前をアンダースコア <code>_</code> 文字で置き換えることができます。</p>
      <p>したがって、query関数の呼び出しの最終的な構文は次のようになります：</p>
      <code-block lang="kotlin">
      db.query("select * from messages") { response, _ ->
          Message(response.getString("id"), response.getString("text"))
      }
      </code-block>
   </def>
</deflist>

## MessageControllerクラスの更新

新しい `MessageService` クラスを使用するように `MessageController.kt` を更新します：

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
   <def title="@PostMapping アノテーション">
      <p>HTTP POSTリクエストの処理を担当するメソッドには、<code>@PostMapping</code> アノテーションを付加する必要があります。HTTP Bodyコンテンツとして送信されたJSONをオブジェクトに変換できるようにするには、メソッド引数に <code>@RequestBody</code> アノテーションを使用する必要があります。アプリケーションのクラスパスにJacksonライブラリがあるため、変換は自動的に行われます。</p>
   </def>
   <def title="ResponseEntity">
      <p><code>ResponseEntity</code> は、ステータスコード、ヘッダー、ボディを含むHTTPレスポンス全体を表します。</p>
      <p> <code>created()</code> メソッドを使用して、レスポンス・ステータスコード (201) を構成し、作成されたリソースのコンテキストパスを示すlocationヘッダーを設定します。</p>
   </def>
</deflist>

## MessageServiceクラスの更新

`Message` クラスの `id` は、NULL許容 (nullable) の String として宣言されていました：

```kotlin
data class Message(val id: String?, val text: String)
```

しかし、データベースに `id` 値として `null` を保存するのは正しくありません。この状況を適切に処理する必要があります。

データベースにメッセージを保存する際、`id` が `null` の場合に新しい値を生成するように `MessageService.kt` ファイルのコードを更新します：

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
        val id = message.id ?: UUID.randomUUID().toString() // idがnullの場合は新しいidを生成する
        db.update(
            "insert into messages values ( ?, ? )",
            id, message.text
        )
        return message.copy(id = id) // 新しいidを持つメッセージのコピーを返す
    }
}
```

<deflist collapsible="true">
   <def title="エルビス演算子 – ?:">
      <p>コード <code>message.id ?: UUID.randomUUID().toString()</code> は、<a href="null-safety.md#elvis-operator">エルビス演算子（if-not-null-elseの省略形）<code>?:</code></a> を使用しています。<code>?:</code> の左側の式が <code>null</code> でない場合、エルビス演算子はそれを返します。そうでなければ、右側の式を返します。右側の式は、左側が <code>null</code> の場合にのみ評価されることに注意してください。</p>
   </def>
</deflist>

アプリケーションコードのデータベース対応が完了しました。次はデータソースを構成する必要があります。

## データベースの構成

アプリケーションでデータベースを構成します：

1. `src/main/resources` ディレクトリに `schema.sql` ファイルを作成します。これにはデータベース・オブジェクトの定義を保存します：

   ![データベース・スキーマの作成](create-database-schema.png){width=350}

2. `src/main/resources/schema.sql` ファイルを以下のコードで更新します：

   ```sql
   -- schema.sql
   CREATE TABLE IF NOT EXISTS messages (
   id       VARCHAR(60)  PRIMARY KEY,
   text     VARCHAR      NOT NULL
   );
   ```

   これにより、`id` と `text` の2つの列を持つ `messages` テーブルが作成されます。テーブル構造は `Message` クラスの構造と一致しています。

3. `src/main/resources` フォルダにある `application.properties` ファイルを開き、以下のアプリケーション・プロパティを追加します：

   ```none
   spring.application.name=demo
   spring.datasource.driver-class-name=org.h2.Driver
   spring.datasource.url=jdbc:h2:file:./data/testdb
   spring.datasource.username=name
   spring.datasource.password=password
   spring.sql.init.schema-locations=classpath:schema.sql
   spring.sql.init.mode=always
   ```

   これらの設定により、Spring Bootアプリケーションのデータベースが有効になります。  
   一般的なアプリケーション・プロパティの完全なリストについては、[Springのドキュメント](https://docs.spring.io/spring-boot/appendix/application-properties/index.html)を参照してください。

## HTTPリクエスト経由でデータベースにメッセージを追加する

作成済みのエンドポイントを操作するには、HTTPクライアントを使用する必要があります。IntelliJ IDEAでは、組み込みのHTTPクライアントを使用します：

1. アプリケーションを実行します。アプリケーションが起動して実行されたら、POSTリクエストを実行してデータベースにメッセージを保存できます。

2. プロジェクトのルート・フォルダに `requests.http` ファイルを作成し、以下のHTTPリクエストを追加します：

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

3. すべてのPOSTリクエストを実行します。ガターにある緑色の **実行 (Run)** アイコンを使用します。
   これらのリクエストは、テキスト・メッセージをデータベースに書き込みます：

   ![POSTリクエストの実行](execute-post-requests.png){width=700}

4. GETリクエストを実行し、**実行 (Run)** ツール・ウィンドウで結果を確認します：

   ![GETリクエストの実行](execute-get-requests.png){width=700}

### リクエストを実行する別の方法 {initial-collapse-state="collapsed" collapsible="true"}

他のHTTPクライアントやcURLコマンドライン・ツールを使用することもできます。たとえば、ターミナルで次のコマンドを実行すると同じ結果が得られます：

```bash
curl -X POST --location "http://localhost:8080" -H "Content-Type: application/json" -d "{ \"text\": \"Hello!\" }"

curl -X POST --location "http://localhost:8080" -H "Content-Type: application/json" -d "{ \"text\": \"Bonjour!\" }"

curl -X POST --location "http://localhost:8080" -H "Content-Type: application/json" -d "{ \"text\": \"Privet!\" }"

curl -X GET --location "http://localhost:8080"
```

## IDによるメッセージの取得

個々のメッセージをIDで取得できるように、アプリケーションの機能を拡張します。

1. `MessageService` クラスに、個々のメッセージをIDで取得するための新しい関数 `findMessageById(id: String)` を追加します：

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
            val id = message.id ?: UUID.randomUUID().toString() // idがnullの場合は新しいidを生成する
            db.update(
                "insert into messages values ( ?, ? )",
                id, message.text
            )
            return message.copy(id = id) // 新しいidを持つメッセージのコピーを返す
        }
    }
    ```
    
    <deflist collapsible="true">
    <def title="引数リスト内での vararg 引数の位置">
        <p><code>query()</code> 関数は3つの引数を取ります：</p>
        <list>
            <li>実行にパラメータを必要とするSQLクエリ文字列</li>
            <li>String型のパラメータである <code>id</code></li>
            <li>ラムダ式で実装された <code>RowMapper</code> インスタンス</li>
        </list>
        <p><code>query()</code> 関数の2番目のパラメータは<i>可変長引数</i> (<code>vararg</code>) として宣言されています。Kotlinでは、可変長引数パラメータの位置は引数リストの最後である必要はありません。</p>
    </def>
    <def title="singleOrNull() 関数">
       <p><a href="https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/single-or-null.html"><code>singleOrNull()</code></a> 関数は、要素が1つの場合はその要素を返し、配列が空であるか、同じ値を持つ要素が複数ある場合は <code>null</code> を返します。</p>
    </def>
   </deflist>
    
    > メッセージをIDで取得するために使用される `.query()` 関数は、Spring Frameworkによって提供される [Kotlin拡張関数](extensions.md#extension-functions) です。上記のコードに示すように、追加のインポート `import org.springframework.jdbc.core.query` が必要です。
    >
    {style="warning"}

2. `MessageController` クラスに `id` パラメータを持つ新しい `index(...)` 関数を追加します：

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
            // メッセージがnull（見つからない）の場合、レスポンスコードを404に設定する
            this?.let { ResponseEntity.ok(it) } ?: ResponseEntity.notFound().build() 
    }
    ```

    <deflist collapsible="true">
    <def title="コンテキストパスからの値の取得">
       <p>新しい関数に <code>@GetMapping(&quot;/{id}&quot;)</code> をアノテーションしたことで、メッセージの <code>id</code> がSpring Frameworkによってコンテキストパスから取得されます。関数の引数に <code>@PathVariable</code> をアノテーションすることで、取得した値を関数の引数として使用するようにフレームワークに指示します。新しい関数は <code>MessageService</code> を呼び出して、IDによって個々のメッセージを取得します。</p>
    </def>
    <def title="NULL許容レシーバを持つ拡張関数">
         <p>拡張関数は、NULL許容 (nullable) なレシーバ型で定義できます。レシーバが <code>null</code> の場合、<code>this</code> も <code>null</code> になります。そのため、NULL許容なレシーバ型で拡張を定義する場合は、関数本体の中で <code>this == null</code> チェックを行うことが推奨されます。</p>
         <p>上記の <code>toResponseEntity()</code> 関数のように、安全呼び出し演算子 (<code>?.</code>) を使用してNULLチェックを行うこともできます：</p>
         <code-block lang="kotlin">
         this?.let { ResponseEntity.ok(it) }
         </code-block>
    </def>
    <def title="ResponseEntity">
        <p><code>ResponseEntity</code> は、ステータスコード、ヘッダー、ボディを含むHTTPレスポンスを表します。これは、コンテンツをより細かく制御して、カスタマイズされたHTTPレスポンスをクライアントに返送できるようにする汎用的なラッパーです。</p>
    </def>
    </deflist>

以下は、アプリケーションの完全なコードです：

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

## アプリケーションの実行

Springアプリケーションの実行準備が整いました：

1. アプリケーションを再度実行します。

2. `requests.http` ファイルを開き、新しいGETリクエストを追加します：

    ```http request
    ### Get the message by its id
    GET http://localhost:8080/id
    ```

3. GETリクエストを実行して、データベースからすべてのメッセージを取得します。

4. **実行 (Run)** ツール・ウィンドウで、IDの1つをコピーして、次のようにリクエストに追加します：

    ```http request
    ### Get the message by its id
    GET http://localhost:8080/f910aa7e-11ee-4215-93ed-1aeeac822707
    ```
    
    > 上記の代わりに、実際のメッセージIDを入力してください。
    >
    {style="note"}

5. GETリクエストを実行し、**実行 (Run)** ツール・ウィンドウで結果を確認します：

    ![IDによるメッセージの取得](retrieve-message-by-its-id.png){width=700}

## 次の手順

最後の手順では、Spring Dataを使用して、より一般的なデータベース接続方法を使用する方法について説明します。 

**[次の章へ進む](jvm-spring-boot-using-crudrepository.md)**