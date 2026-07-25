<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="FAQ"
       id="FAQ">
    <chapter title="Ktorの正しい発音を教えてください。" id="pronounce">
        <p>
            <emphasis>/keɪ-tor/</emphasis> （ケイ・ター）です。
        </p>
    </chapter>
    <chapter title='"Ktor"という名前にはどのような意味がありますか？' id="name-meaning">
        <p>
            Ktorという名前は、略語の <code>ctor</code> (constructor: コンストラクタ) に由来しており、最初の文字をKotlinの「K」に置き換えたものです。
        </p>
    </chapter>
    <chapter title="質問、バグ報告、連絡、貢献、フィードバックなどはどのようにすればよいですか？" id="feedback">
        <p>
            利用可能なサポートチャネルの詳細については、<a href="https://ktor.io/support/">Support</a>ページをご覧ください。
            Ktorへの貢献方法については、<a href="https://github.com/ktorio/ktor/blob/main/CONTRIBUTING.md">How to contribute</a>ガイドに記載されています。
        </p>
    </chapter>
    <chapter title="CIOとはどういう意味ですか？" id="cio">
        <p>
            CIOは <emphasis>Coroutine-based I/O</emphasis> （コルーチンベースのI/O）の略です。
            通常、外部のJVMベースのライブラリに依存せず、Kotlinとコルーチンを使用してIETF RFCやその他のプロトコルを実装したロジックを持つエンジンのことを指します。
        </p>
    </chapter>
    <chapter title="解決されない（赤字の）Ktorのインポートを修正するにはどうすればよいですか？" id="ktor-artifact">
        <p>
            対応する <Links href="//server-dependencies" summary="既存のGradle/MavenプロジェクトにKtorサーバーの依存関係を追加する方法を学びます。">Ktorアーティファクト</Links> がビルドスクリプトに追加されていることを確認してください。
        </p>
    </chapter>
    <chapter
            title="Ktorは、サーバーのシャットダウンを正常に処理できるように、IPCシグナル（SIGTERMやSIGINTなど）をキャッチする方法を提供していますか？"
            id="sigterm">
        <p>
            <a href="#engine-main">EngineMain</a> を使用して実行している場合は、自動的に処理されます。
            それ以外の場合は、手動で処理する必要があります。JVMの機能である <code>Runtime.getRuntime().addShutdownHook</code> を使用できます。
        </p>
    </chapter>
    <chapter title="プロキシ経由でクライアントのIPを取得するにはどうすればよいですか？" id="proxy-ip">
        <p>
            プロキシが適切なヘッダーを提供し、<Links href="//server-forward-headers" summary="必要な依存関係: io.ktor:%artifact_name%">ForwardedHeader</Links> プラグインがインストールされている場合、<code>call.request.origin</code> プロパティから元の呼び出し元（プロキシ）に関する <a href="#request_information">接続情報</a> を取得できます。
        </p>
    </chapter>
    <chapter title="mainブランチの最新コミットをテストするにはどうすればよいですか？" id="bleeding-edge">
        <p>
            <code>jetbrains.space</code> からKtorのナイトリービルドを取得できます。
            詳細は <a href="https://ktor.io/eap/">Early Access Program</a> をご確認ください。
        </p>
    </chapter>
    <chapter title="使用しているKtorのバージョンを確実に確認するにはどうすればよいですか？" id="ktor-version-used">
        <p>
            <Links href="//server-default-headers" summary="必要な依存関係: io.ktor:%artifact_name%">DefaultHeaders</Links> プラグインを使用すると、以下のようにKtorのバージョンを含む <code>Server</code> レスポンスヘッダーを送信できます。
        </p>
        <code-block code="            Server: ktor-server-core/%ktor_version%"/>
    </chapter>
    <chapter title="ルートが実行されません。どのようにデバッグすればよいですか？" id="route-not-executing">
        <p>
            Ktorはルーティングの決定に関するトラブルシューティングを支援するトレースメカニズムを提供しています。
            <a href="#trace_routes">Tracing routes</a> セクションを確認してください。
        </p>
    </chapter>
    <chapter title="'Response has already been sent' を解決するにはどうすればよいですか？" id="response-already-sent">
        <p>
            これは、あなた自身、あるいはプラグインやインターセプターがすでに <code>call.respond&#42;</code> 関数を呼び出しているにもかかわらず、再度それを呼び出そうとしていることを意味します。
        </p>
    </chapter>
    <chapter title="Ktorのイベントを購読するにはどうすればよいですか？" id="ktor-events">
        <p>
            詳細は <Links href="//server-events" summary="">Application monitoring</Links> ページをご覧ください。
        </p>
    </chapter>
    <chapter title="'No configuration setting found for key ktor' を解決するにはどうすればよいですか？" id="cannot-find-application-conf">
        <p>
            これは、Ktorが <Links href="//server-configuration-file" summary="設定ファイルでさまざまなサーバーパラメータを設定する方法を学びます。">設定ファイル</Links> を見つけられなかったことを意味します。
            <code>resources</code> フォルダに設定ファイルが存在し、その <code>resources</code> フォルダがリソースフォルダとして正しくマークされていることを確認してください。
            ベースとなる動作プロジェクトを作成するために、<a href="https://start.ktor.io/">Ktorプロジェクトジェネレーター</a> や <a href="https://plugins.jetbrains.com/plugin/16008-ktor">IntelliJ IDEA Ultimate用のKtorプラグイン</a> の使用を検討してください。詳細については、<Links href="//server-create-a-new-project" summary="Ktorでサーバーアプリケーションを作成、開き、実行、テストする方法を学びます。">Ktorプロジェクトの作成、開封、実行</Links> を参照してください。
        </p>
    </chapter>
    <chapter title="AndroidでKtorを使用できますか？" id="android-support">
        <p>
            はい、Ktorのサーバーとクライアントは、少なくともNettyエンジンを使用する場合、Android 5 (API 21) 以上で動作することが確認されています。
        </p>
    </chapter>
    <chapter title="なぜ 'CURL -I' が '404 Not Found' を返すのですか？" id="curl-head-not-found">
        <p>
            <code>CURL -I</code> は <code>HEAD</code> リクエストを実行する <code>CURL --head</code> のエイリアスです。
            デフォルトでは、Ktorは <code>GET</code> ハンドラーに対する <code>HEAD</code> リクエストを処理しません。
            この機能を有効にするには、<Links href="//server-autoheadresponse" summary="%plugin_name% は、GETが定義されているすべてのルートに対してHEADリクエストに自動的に応答する機能を提供します。">AutoHeadResponse</Links> プラグインをインストールしてください。
        </p>
    </chapter>
    <chapter title="'HttpsRedirect' プラグイン使用時の無限リダイレクトを解決するにはどうすればよいですか？" id="infinite-redirect">
        <p>
            最も可能性の高い原因は、バックエンドがリバースプロキシやロードバランサーの背後にあり、その中間機器がバックエンドに対して通常のHTTPリクエストを行っていることです。そのため、Ktorバックエンド内の <code>HttpsRedirect</code> プラグインがそれを通常のHTTPリクエストであると判断し、リダイレクトを返してしまいます。
        </p>
        <p>
            通常、リバースプロキシは元のリクエストに関する情報を記述するヘッダー（HTTPSであったかどうかや元のIPアドレスなど）を送信します。それらのヘッダーを解析するための <Links href="//server-forward-headers" summary="必要な依存関係: io.ktor:%artifact_name%">ForwardedHeader</Links> プラグインを使用することで、<Links href="//server-https-redirect" summary="必要な依存関係: io.ktor:%artifact_name%">HttpsRedirect</Links> プラグインは元のリクエストがHTTPSであったことを認識できるようになります。
        </p>
    </chapter>
    <chapter title="Kotlin/Nativeで対応するエンジンを使用するために、Windowsに 'curl' をインストールするにはどうすればよいですか？" id="native-curl">
        <p>
            <a href="#curl">Curl</a> クライアントエンジンには <code>curl</code> ライブラリのインストールが必要です。
            Windowsでは、MinGW/MSYS2の <code>curl</code> バイナリの利用を検討してください。
        </p>
        <procedure>
            <step>
                <p>
                    <a href="https://www.msys2.org/">MinGW/MSYS2</a> の説明に従ってインストールします。
                </p>
            </step>
            <step>
                <p>
                    以下のコマンドを使用して <code>libcurl</code> をインストールします。
                </p>
                <code-block lang="shell" code="                    pacman -S mingw-w64-x86_64-curl"/>
            </step>
            <step>
                <p>
                    MinGW/MSYS2をデフォルトの場所にインストールした場合は、環境変数 <code>PATH</code> に <Path>C:\\msys64\\mingw64\\bin\\</Path> を追加します。
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="'NoTransformationFoundException' を解決するにはどうすればよいですか？" id="no-transformation-found-exception">
        <p>
            <a href="https://api.ktor.io/ktor-client-core/io.ktor.client.call/-no-transformation-found-exception/index.html">NoTransformationFoundException</a> は、<i>受信したボディ</i> に対して、<b>結果の</b> 型からクライアントが <b>期待する</b> 型への適切な変換が見つからないことを表します。
        </p>
        <procedure>
            <step>
                <p>
                    リクエストの <code>Accept</code> ヘッダーが目的のコンテンツタイプを指定していること、およびサーバーのレスポンスの <code>Content-Type</code> ヘッダーがクライアント側の期待する型と一致していることを確認してください。
                </p>
            </step>
            <step>
                <p>
                    使用している特定のコンテンツタイプに対して、必要なコンテンツ変換を登録してください。
                </p>
                <p>
                    クライアント側では <a href="https://ktor.io/docs/serialization-client.html">ContentNegotiation</a> プラグインを使用できます。
                    このプラグインを使用すると、異なるコンテンツタイプに対してデータをシリアライズおよびデシリアライズする方法を指定できます。
                </p>
                <code-block lang="kotlin" code="                    val client = HttpClient(CIO) {&#10;                        install(ContentNegotiation) {&#10;                            json() // 例: JSONコンテンツ変換を登録&#10;                            // 必要に応じて他のコンテンツタイプの変換を追加&#10;                        }&#10;                    }"/>
            </step>
            <step>
                <p>
                    必要なプラグインがすべてインストールされていることを確認してください。不足している可能性がある機能：
                </p>
                <list type="bullet">
                    <li>クライアントの <a href="https://ktor.io/docs/websocket-client.html">WebSockets</a> および サーバーの <a href="https://ktor.io/docs/websocket.html">WebSockets</a></li>
                    <li>クライアントの <a href="https://ktor.io/docs/serialization-client.html">ContentNegotiation</a> および サーバーの <a href="https://ktor.io/docs/server-serialization.html">ContentNegotiation</a></li>
                    <li><a href="https://ktor.io/docs/compression.html">Compression</a></li>
                </list>
            </step>
        </procedure>
    </chapter>
</topic>