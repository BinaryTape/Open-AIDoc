[//]: # (title: サーバープラグイン)

<show-structure for="chapter" depth="2"/>

<link-summary>
プラグインは、シリアライゼーション、コンテンツエンコーディング、圧縮などの一般的な機能を提供します。
</link-summary>

Ktorにおける一般的なリクエスト/レスポンスパイプラインは次のようになります。

![Request Response Pipeline](request-response-pipeline.png){width="600"}

リクエストはサーバーによって受信され、リクエストパイプラインを通じて処理されます。Ktorはリクエストを適切なハンドラーにルーティングし、アプリケーションロジックがそれを処理します。その後、レスポンスはクライアントに送信される前にレスポンスパイプラインを通過します。

## プラグインによる機能の追加 {id="add_functionality"}

多くのアプリケーションでは、アプリケーションロジックとは切り離された機能が必要になります。これには認証、シリアライゼーションやコンテンツエンコーディング、圧縮、ヘッダー、Cookieなどが含まれます。Ktorでは、このような機能は _プラグイン_ によって提供されます。

プラグインは、リクエストおよびレスポンス処理のさまざまなステージをインターセプトできます。そのため、リクエスト/レスポンスパイプラインのさまざまなポイントに適用できます。

![Plugin pipeline](plugin-pipeline.png){width="600"}

プラグインが実行される正確なステージは、プラグイン自体、およびそれが使用するフックやパイプラインフェーズによって異なります。一般的に、リクエストは次のように処理されます。

* ルーティング機構が、どのハンドラーがリクエストを処理すべきかを決定します。
* ハンドラーに渡される前に、リクエストは1つ以上のプラグインによって処理されます。
* ハンドラーはアプリケーションロジックを使用してレスポンスを生成します。
* レスポンスがクライアントに送信される前に、1つ以上のプラグインによって処理されます。

## ルーティングもプラグイン {id="routing"}

プラグインは最大限の柔軟性を提供し、リクエスト/レスポンスパイプラインの任意のセグメントに存在できるように設計されています。Ktorでは、`routing` 自体もプラグインとして実装されています。

![Routing as a Plugin](plugin-pipeline-routing.png){width="600"}

## プラグインの依存関係を追加する {id="dependency"}

ほとんどのプラグインには個別の依存関係が必要です。たとえば、[`CORS`](server-cors.md) プラグインを使用するには、ビルドスクリプトに `ktor-server-cors` アーティファクトが必要です。

<var name="artifact_name" value="ktor-server-cors"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.cors"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上記のスニペットでは、Ktorの依存関係を指定するために<a href="server-dependencies.topic#using-version-catalog">
            Ktorバージョンカタログ</a>を使用しています。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上記のスニペットでは、Ktorの依存関係を指定するために<a href="server-dependencies.topic#using-version-catalog">
            Ktorバージョンカタログ</a>を使用しています。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

> 利用可能なプラグインの完全なリストについては、[Ktor Project Generator](https://start.ktor.io/settings)を参照してください。特定のプラグインに必要な依存関係については、該当するプラグインのドキュメントを参照してください。
> 
{style="tip"}

## プラグインのインストール {id="install"}

プラグインは通常、サーバーの初期化フェーズで `install()` 関数を使用して設定されます。[サーバーの作成](server-create-and-configure.topic)方法に応じて、`embeddedServer()` 関数内または[アプリケーションモジュール](server-modules.md)内でプラグインをインストールできます。

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

`install()` 関数に設定ブロックを渡すことで、プラグインのインストール時に設定を行えます。

たとえば、[`Sessions` プラグイン](server-sessions.md)をインストールする際、セッションタイプとCookie名を指定することでCookieベースのセッションを設定できます。

```kotlin
install(Sessions) {
    cookie<MyCookie>("MY_COOKIE")
} 
```

### 特定のルートにプラグインをインストールする {id="install-route"}

Ktorでは、プラグインをグローバルだけでなく特定の[ルート](server-routing.md)にインストールすることもできます。これは、リソースごとに異なるプラグイン設定が必要な場合に便利です。

たとえば、次のコードは `/index` ルートに [`CachingHeader` プラグイン](server-caching-headers.md)をインストールし、キャッシュヘッダーを追加するように設定する例を示しています。

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

同じプラグインが複数のレベルでインストールされている場合、Ktorは次のルールを適用します。

* 特定のルートにインストールされたプラグインの設定は、対応する[グローバルなプラグイン設定](#install)をオーバーライドします。
* 同じルートが複数回定義され、同じプラグインのインストールが複数含まれている場合、ルーティングはそのルートに対するインストールをマージします。その際、最後のインストールが優先されます。

次の例では、`/index/a` と `/index/b` への呼び出しは両方とも、2番目の `CachingHeaders` インストールによってのみ処理されます。
   
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

## デフォルト、利用可能、およびカスタムプラグイン {id="default_available_custom"}

Ktorはデフォルトではアプリケーションプラグインをインストールしません。アプリケーションに必要な機能を提供するプラグインをインストールしてください。

Ktorは幅広いプラグインを提供しています。利用可能なプラグインの完全なリストは、[Ktor Project Generator](https://start.ktor.io/settings)で確認できます。

また、独自の[カスタムプラグイン](server-custom-plugins.md)を作成して、アプリケーション全体で再利用したり、他のアプリケーションと共有したりできる機能をカプセル化することもできます。