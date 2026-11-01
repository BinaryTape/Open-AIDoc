[//]: # (title: HTMXの統合)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:ktor-htmx</code>, <code>io.ktor:ktor-htmx-html</code>,
<code>io.ktor:ktor-server-htmx</code>
</p>
<var name="example_name" value="htmx-integration"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[HTMX](https://htmx.org/) は、HTML属性を使用して動的なクライアント側の動作を可能にする軽量なJavaScriptライブラリです。JavaScriptを記述することなく、AJAX、CSSトランジション、WebSocket、Server-Sent Eventsなどの機能をサポートします。

Ktorは、サーバーとクライアントの両方のコンテキストで統合を簡素化する一連の共有モジュールを通じて、HTMXに対する実験的なファーストクラスのサポートを提供します。これらのモジュールは、HTMXヘッダーの操作、Kotlin DSLを使用したHTML属性の定義、サーバー上でのHTMX固有のルーティングロジックの処理を行うためのツールを提供します。

## モジュールの概要 {id="modules-overview"}

KtorのHTMXサポートは、3つの実験的モジュールで利用できます。

| モジュール | 説明 |
|--------------------|--------------------------------------------|
| `ktor-htmx`        | コア定義とヘッダー定数 |
| `ktor-htmx-html`   | Kotlin HTML DSLとの統合 |
| `ktor-server-htmx` | HTMX固有のリクエストに対するルーティングサポート |

すべてのAPIには `@ExperimentalKtorApi` のマークが付けられており、`@OptIn(ExperimentalKtorApi::class)` によるオプトインが必要です。

## HTMXヘッダー {id="htmx-headers"}

コアの `ktor-htmx` モジュールの定義済み定数を使用して、型安全な方法でHTMXヘッダーにアクセスまたは設定できます。これらの定数を使用することで、トリガー、履歴の復元、コンテンツの置換（スワップ）などのHTMXの動作を検出する際にマジックストリングを回避できます。

### リクエストヘッダー {id="request-headers"}

アプリケーションでHTMXリクエストヘッダーを読み取ったりマッチングしたりするには、`HxRequestHeaders` オブジェクトを使用します。

<deflist type="wide">
<def title="HxRequestHeaders.Request">HTMXリクエストの場合は常に <code>true</code></def>
<def title="HxRequestHeaders.Target">ターゲット要素のID</def>
<def title="HxRequestHeaders.Trigger">トリガーされた要素のID</def>
<def title="HxRequestHeaders.TriggerName">トリガーされた要素の名前</def>
<def title="HxRequestHeaders.Boosted">hx-boost経由のリクエストであることを示す</def>
<def title="HxRequestHeaders.CurrentUrl">現在のブラウザURL</def>
<def title="HxRequestHeaders.HistoryRestoreRequest">履歴の復元用</def>
<def title="HxRequestHeaders.Prompt">hx-promptに対するユーザーの応答</def>
</deflist>

### レスポンスヘッダー {id="response-headers"}

HTMXレスポンスヘッダーの定数にアクセスするには、`HxResponseHeaders` オブジェクトを使用できます。

<deflist type="wide">
<def title="HxResponseHeaders.Location">ページをリロードしないクライアント側のリダイレクト</def>
<def title="HxResponseHeaders.PushUrl">履歴スタックにURLをプッシュ</def>
<def title="HxResponseHeaders.Redirect">クライアント側のリダイレクト</def>
<def title="HxResponseHeaders.Refresh">ページ全体の完全なリフレッシュを強制</def>
<def title="HxResponseHeaders.ReplaceUrl">現在のURLを置換</def>
<def title="HxResponseHeaders.Reswap">レスポンスのスワップ方法を制御</def>
<def title="HxResponseHeaders.Retarget">コンテンツ更新のターゲットを更新</def>
<def title="HxResponseHeaders.Reselect">スワップするレスポンスの一部を選択</def>
<def title="HxResponseHeaders.Trigger">クライアント側のイベントをトリガー</def>
<def title="HxResponseHeaders.TriggerAfterSettle">セトル（整定）後にイベントをトリガー</def>
<def title="HxResponseHeaders.TriggerAfterSwap">スワップ後にイベントをトリガー</def>
</deflist>

## スワップモード {id="swap-modes"}

コアの `ktor-htmx` モジュールの `HxSwap` オブジェクトを使用して、さまざまなHTMXスワップモードの定数にアクセスできます。

<deflist type="medium">
<def title="HxSwap.innerHtml">内部HTMLを置換（デフォルト）</def>
<def title="HxSwap.outerHtml ">要素全体を置換</def>
<def title="HxSwap.textContent">テキストコンテンツのみを置換</def>
<def title="HxSwap.beforeBegin">ターゲット要素の直前に挿入</def>
<def title="HxSwap.afterBegin">最初の子要素として挿入</def>
<def title="HxSwap.beforeEnd">最後の子要素として挿入</def>
<def title="HxSwap.afterEnd">ターゲット要素の直後に挿入</def>
<def title="HxSwap.delete">ターゲット要素を削除</def>
<def title="HxSwap.none">コンテンツを追加しない</def>
</deflist>

## HTML DSL拡張 {id="html-dsl-extensions"}

`ktor-htmx-html` モジュールは、KotlinのHTML DSLに拡張関数を追加し、HTML要素に直接HTMX属性を追加できるようにします。

```kotlin
@OptIn(ExperimentalKtorApi::class)
html {
    body {
        button {
            attributes.hx {
                get = "/data"
                target = "#result"
                swap = HxSwap.outerHtml
                trigger = "click"
            }
            +"Load Data"
        }
    }
}
```

上記の例は、HTMX属性を持つHTMLを生成します。

```html
<button hx-get="/api/data" hx-target="#result-div" hx-swap="outerHTML" hx-trigger="click">Load Data</button>
```

## サーバー側のルーティング {id="server-side-routing"}

`ktor-server-htmx` モジュールは、`hx` DSLブロックを通じてHTMXを認識するルーティングを提供します。

```kotlin
@OptIn(ExperimentalKtorApi::class)
routing {
    route("api") {
        // 通常のルート（HTMXリクエストと非HTMXリクエストの両方）
        get {
            call.respondText("Regular response")
        }
        
        // HTMXリクエストにのみ一致（HX-Requestヘッダーが存在する場合）
        hx.get {
            call.respondText("HTMX response")
        }
        
        // 特定のターゲットを持つHTMXリクエストに一致
        hx {
            target("#result-div") {
                get {
                    call.respondText("Response for #result-div")
                }
            }
            
            // 特定のトリガーを持つHTMXリクエストに一致
            trigger("#load-button") {
                get {
                    call.respondText("Response for #load-button clicks")
                }
            }
        }
    }
}
```

これらの機能により、クライアントから送信されたHTMXヘッダーに応じて、アプリケーションが異なる応答を返すことができるようになります。