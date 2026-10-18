[//]: # (title: サーバプラグイン)

<show-structure for="chapter" depth="2"/>

<link-summary>
プラグインは、シリアライゼーション、コンテンツエンコーディング、圧縮などの一般的な機能を提供します。
</link-summary>

Ktor における典型的なリクエスト/レスポンスパイプラインは次のようになります。

![Request Response Pipeline](request-response-pipeline.png){width="600"}

リクエストはサーバによって受信され、リクエストパイプラインを通じて処理されます。Ktor はリクエストを適切なハンドラにルーティングし、そこでアプリケーションロジックがリクエストを処理します。その後、レスポンスはレスポンスパイプラインを通過してからクライアントに送信されます。

## プラグインによる機能の追加 {id="add_functionality"}

多くのアプリケーションでは、アプリケーションロジックとは切り離された機能が必要になります。これには、認証、シリアライゼーション、コンテンツエンコーディング、圧縮、ヘッダー、Cookie などが含まれます。Ktor では、これらの機能は_プラグイン_によって提供されます。

プラグインは、リクエストおよびレスポンス処理のさまざまなステージをインターセプトできます。そのため、リクエスト/レスポンスパイプライン内のさまざまなポイントで適用できます。

![Plugin pipeline](plugin-pipeline.png){width="600"}

プラグインが実行される正確なステージは、プラグイン自体や、それが使用するフックまたはパイプラインフェーズによって異なります。一般的に、リクエストは次のように処理されます。

* ルーティングメカニズムが、どのハンドラがリクエストを処理すべきかを決定します。
* ハンドラに渡される前に、リクエストは1つ以上のプラグインによって処理されます。
* ハンドラがアプリケーションロジックを使用してレスポンスを生成します。
* レスポンスがクライアントに送信される前に、レスポンスは1つ以上のプラグインによって処理されます。

## ルーティングもプラグインの1つ {id="routing"}

プラグインは最大限の柔軟性を提供し、リクエスト/レスポンスパイプラインの任意のセグメントに存在できるように設計されています。Ktor では、`routing` 自体もプラグインとして実装されています。

![Routing as a Plugin](plugin-pipeline-routing.png){width="600"}

## プラグインの依存関係の追加 {id="dependency"}

ほとんどのプラグインには、個別の依存関係が必要です。たとえば、[`CORS`](server-cors.md) プラグインを使用するには、ビルドスクリプトに `ktor-server-cors` アーティファクトが必要です。

<var name="artifact_name" value="ktor-server-cors"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"/>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"/>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

> 利用可能なプラグインの完全なリストについては、[Ktor Project Generator](https://start.ktor.io/settings) を参照してください。特定のプラグインに必要な依存関係については、該当するプラグインのドキュメントを参照してください。
> 
{style="tip"}

## プラグインのインストール {id="install"}

プラグインは通常、サーバの初期化フェーズ中に `install()` 関数を使用して設定されます。[サーバの作成方法](server-create-and-configure.topic)に応じて、`embeddedServer()` 関数の内部または[アプリケーションモジュール](server-modules.md)内でプラグインをインストールできます。

<Tabs>
<TabItem title="embeddedServer()">

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

</TabItem>
<TabItem title="Application.module()">

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

</TabItem>
</Tabs>

プラグインをインストールする際、`install()` 関数に設定ブロックを渡すことで設定を行うことができます。

たとえば、[`Sessions` プラグイン](server-sessions.md)をインストールする場合、セッションタイプと Cookie 名を指定することで Cookie ベースのセッションを設定できます。

```kotlin
install(Sessions) {
    cookie<MyCookie>("MY_COOKIE")
} 
```

### 特定のルートへのプラグインのインストール {id="install-route"}

Ktor では、グローバルだけでなく特定の[ルート](server-routing.md)にもプラグインをインストールできます。これは、リソースごとに異なるプラグイン設定が必要な場合に便利です。

たとえば、次のコードは `/index` ルートに [`CachingHeaders` プラグイン](server-caching-headers.md)をインストールし、キャッシュヘッダーを追加するように設定します。

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

同じプラグインが複数のレベルでインストールされている場合、Ktor は次のルールを適用します。

* 特定のルートにインストールされたプラグインの設定は、対応する[グローバルプラグイン設定](#install)をオーバーライドします。
* 同じルートが複数回定義され、同じプラグインのインストールが複数含まれている場合、ルーティングはそのルートのインストールをマージします。この際、最後のインストールが優先されます。

次の例では、`/index/a` と `/index/b` への呼び出しは両方とも、2番目の `CachingHeaders` のインストールによってのみ処理されます。
   
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

## デフォルトプラグイン、利用可能なプラグイン、カスタムプラグイン {id="default_available_custom"}

Ktor はデフォルトではアプリケーションプラグインをインストールしません。アプリケーションに必要な機能を提供するプラグインをインストールしてください。

Ktor は幅広いプラグインを提供しています。利用可能なプラグインの完全なリストは、[Ktor Project Generator](https://start.ktor.io/settings) で確認できます。

また、アプリケーション全体で再利用したり、他のアプリケーションと共有したりできる機能をカプセル化するために、独自の[カスタムプラグイン](server-custom-plugins.md)を作成することもできます。