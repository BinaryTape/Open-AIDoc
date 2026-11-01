[//]: # (title: HTTPリクエストのライフサイクル)

<primary-label ref="server-plugin"/>

<var name="plugin_name" value="HttpRequestLifecycle"/>
<var name="example_name" value="server-http-request-lifecycle"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:ktor-server-core</code>
</p>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
<b>サポートされているエンジン</b>: <code>Netty</code>, <code>CIO</code>
</p>
<p>
    <b><Links href="server-native.md" summary="KtorはKotlin/Nativeをサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。">Nativeサーバー</Links>のサポート</b>: ✖️
</p>
</tldr>

デフォルトでは、Ktorはクライアントが切断した場合でもリクエストの処理を継続します。[`%plugin_name%`](https://api.ktor.io/ktor-http/io.ktor.http/-http-request-lifecycle.html)プラグインを使用すると、クライアントが切断された直後にリクエストの処理をキャンセルできます。

これは、クライアントがレスポンスを待たなくなった時点で処理を停止すべき、長時間実行されるリクエストやリソース集約型のリクエストに役立ちます。

## %plugin_name% のインストールと設定 {id="install_plugin"}

`HttpRequestLifecycle` プラグインを有効にするには、`install` 関数を使用してアプリケーションモジュールにインストールし、`cancelCallOnClose` プロパティを設定します。

```kotlin
import io.ktor.server.application.*
import io.ktor.server.http.HttpRequestLifecycle

fun Application.module() {
    install(HttpRequestLifecycle) {
        cancelCallOnClose = true
    }
}
```

`cancelCallOnClose` プロパティが有効になっている場合、`%plugin_name%` プラグインはリクエストごとにキャンセルハンドラーをインストールします。クライアントが切断されると、その特定のルートを処理しているコルーチンのみがキャンセルされます。

キャンセルは構造化並行性（structured concurrency）を通じて伝播するため、リクエストコルーチンから開始された子コルーチン（たとえば `launch` や `async` を使用して開始されたもの）もすべてキャンセルされます。次のサスペンションポイント（中断点）で `CancellationException` がスローされます。

## キャンセルの処理 {id="handle_cancellation"}

`CancellationException` をキャッチして、リソースの解放やバックグラウンド処理の停止などのクリーンアップ操作を実行できます。

```kotlin
fun Application.module() {
    install(HttpRequestLifecycle) {
        cancelCallOnClose = true
    }

    routing {
        get("/long-process") {
            try {
                while (isActive) {
                    delay(10_000)
                    log.info("Very important work.")
                }
                call.respond("Completed")
            } catch (e: CancellationException) {
                log.info("Cleaning up resources.")
            }
        }
    }
}
```

> コルーチンのキャンセルは協調的（cooperative）です。ブロッキングコードやCPUバウンドなコードは自動的には中断されません。
> リクエスト処理で長時間実行される処理を行う場合は、`call.coroutineContext.ensureActive()` を呼び出してキャンセルに対応してください。
>
> 詳細については、[コルーチンのキャンセル](https://kotlinlang.org/docs/cancellation-and-timeouts.html)を参照してください。
{style="note"}

> 完全な例については、[%example_name%](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%) を参照してください。

## 制限事項 {id="limitations"}

このプラグインは、`CIO` および `Netty` エンジンでのみ完全にサポートされています。サーブレットベースのエンジン（またはその他のサポートされていないエンジン）では、クライアントの切断を確実に検出できません。キャンセルは、サーバーがレスポンスの書き込みを試行したときにのみ検出できます。