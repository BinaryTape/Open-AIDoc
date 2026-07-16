[//]: # (title: サーバープラグイン)

<show-structure for="chapter" depth="2"/>

<link-summary>
プラグインは、シリアライズ、コンテンツエンコーディング、圧縮などの共通機能を提供します。
</link-summary>

Ktorにおける典型的なリクエスト/レスポンスパイプラインは以下のようになります：

![Request Response Pipeline](request-response-pipeline.png){width="600"}

これはリクエストから始まり、特定のハンドラーにルーティングされ、アプリケーションロジックによって処理され、最終的にレスポンスが返されます。 

## プラグインによる機能の追加 {id="add_functionality"}

多くのアプリケーションでは、アプリケーションロジックの範囲外にある共通の機能を必要とします。これには、シリアライズやコンテンツエンコーディング、圧縮、ヘッダー、クッキーのサポートなどが含まれます。これらすべては、Ktorでは**プラグイン (Plugins)**と呼ばれるものによって提供されます。 

先ほどのパイプライン図を見ると、プラグインはリクエスト/レスポンスとアプリケーションロジックの間に位置しています：

![Plugin pipeline](plugin-pipeline.png){width="600"}

リクエストが入ってくると：

*   ルーティングメカニズムを介して正しいハンドラーにルーティングされます 
*   ハンドラーに渡される前に、1つ以上のプラグインを通過します
*   ハンドラー（アプリケーションロジック）がリクエストを処理します
*   レスポンスがクライアントに送信される前に、1つ以上のプラグインを通過します

## ルーティングはプラグインの一種です {id="routing"}

プラグインは最大限の柔軟性を提供するように設計されており、リクエスト/レスポンスパイプラインの任意のセグメントに存在させることができます。
実際、これまで私たちが`routing`と呼んできたものは、プラグインに他なりません。 

![Routing as a Plugin](plugin-pipeline-routing.png){width="600"}

## プラグインの依存関係の追加 {id="dependency"}
ほとんどのプラグインは、特定の依存関係を必要とします。例えば、`CORS`プラグインを使用するには、ビルドスクリプトに`ktor-server-cors`アーティファクトを追加する必要があります。

<var name="artifact_name" value="ktor-server-cors"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"></code-block>
    </TabItem>
</Tabs>

## プラグインのインストール {id="install"}

プラグインは通常、サーバーの初期化フェーズにおいて、プラグインをパラメータとして受け取る`install`関数を使用して設定されます。[サーバーの作成と設定](server-create-and-configure.topic)方法に応じて、`embeddedServer`呼び出し内でプラグインをインストールするか...

```kotlin
import io.ktor.server.application.*
import io.ktor.server.plugins.cors.*
import io.ktor.server.plugins.compression.*
// ...
fun main() {
    embeddedServer(Netty, port = 8080) {
        install(CORS)
        install(Compression)
        // ...
    }.start(wait = true)
}
```

... または、指定された[モジュール](server-modules.md)内でインストールできます：

```kotlin
import io.ktor.server.application.*
import io.ktor.server.plugins.cors.*
import io.ktor.server.plugins.compression.*
// ...
fun Application.module() {
    install(CORS)
    install(Compression)
    // ...
}
```

リクエストやレスポンスのインターセプトに加えて、プラグインはこのステップで設定されるオプションの設定セクションを持つことができます。

例えば、[クッキー](server-sessions.md#cookie)をインストールする場合、クッキーの保存先や名前などの特定のパラメータを設定できます。

```kotlin
install(Sessions) {
    cookie<MyCookie>("MY_COOKIE")
} 
```

### 特定のルートへのプラグインのインストール {id="install-route"}

Ktorでは、プラグインをグローバルだけでなく、特定の[ルート](server-routing.md)にインストールすることもできます。これは、アプリケーションのリソースごとに異なるプラグイン設定が必要な場合に便利です。例えば、以下の[例](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/caching-headers-routes)は、`/index`ルートに対して指定された[キャッシュヘッダー](server-caching-headers.md)を追加する方法を示しています。

```kotlin
route("/index") {
    install(CachingHeaders) {
        options { call, content -> CachingOptions(CacheControl.MaxAge(maxAgeSeconds = 1800)) }
    }
    get {
        call.respondText("Index page")
    }
}
```

同じプラグインを複数回インストールする場合、以下のルールが適用されることに注意してください。
* 特定のルートにインストールされたプラグインの設定は、その[グローバル設定](#install)を上書きします。
* ルーティングは同じルートに対するインストールをマージし、最後のインストールが優先されます。例えば、以下のようなアプリケーションの場合... 
   
   ```kotlin
   routing {
       route("index") {
           install(CachingHeaders) { /* First configuration */ }
           get("a") {
               // ...
           }
       }
       route("index") {
           install(CachingHeaders) { /* Second configuration */ }
           get("b") {
               // ...
           }
       }
   }
   ```
   {initial-collapse-state="collapsed" collapsed-title="install(CachingHeaders) { // First configuration }"}
   
   ... `/index/a` と `/index/b` への呼び出しは両方とも、2番目のプラグインのインストールによってのみ処理されます。

## デフォルト、利用可能、およびカスタムプラグイン {id="default_available_custom"}

デフォルトでは、Ktorはいかなるプラグインも有効にしません。そのため、アプリケーションが必要とする機能に合わせてプラグインをインストールするのは開発者次第です。

ただし、Ktorは標準で提供される多様なプラグインを備えています。これらの完全なリストは、[Ktor Plugin Registry](https://github.com/ktorio/ktor-plugin-registry/tree/main/plugins/server)で確認できます。

さらに、独自の[カスタムプラグイン](server-custom-plugins.md)を作成することもできます。