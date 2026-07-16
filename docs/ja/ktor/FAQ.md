<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="よくある質問"
       id="FAQ">
    <chapter title="Ktor の適切な発音方法は何ですか？" id="pronounce">
        <p>
            <emphasis>/keɪ-tor/</emphasis>
        </p>
    </chapter>
    <chapter title='"Ktor"という名前は何を意味しますか？' id="name-meaning">
        <p>
            Ktorという名前は、Kotlinの「K」に置き換えられた略語の<code>ctor</code>（constructor）に由来します。
        </p>
    </chapter>
    <chapter title="質問、バグ報告、連絡、貢献、フィードバックなどはどうすればよいですか？" id="feedback">
        <p>
            利用可能なサポートチャネルの詳細については、<a href="https://ktor.io/support/">サポート</a>ページをご覧ください。
            <a href="https://github.com/ktorio/ktor/blob/main/CONTRIBUTING.md">貢献方法</a>ガイドでは、Ktorに貢献できる方法について説明しています。
        </p>
    </chapter>
    <chapter title="CIOとは何を意味しますか？" id="cio">
        <p>
            CIOは
            <emphasis>コルーチンベースI/O</emphasis>
            の略です。
            通常、Kotlinとコルーチンを使用してIETF RFCまたは別のプロトコルを実装するロジックを、外部のJVMベースのライブラリに依存せずに実装するエンジンを指します。
        </p>
    </chapter>
    <chapter title="未解決（赤色）のKtorインポートを修正するには？" id="ktor-artifact">
        <p>
            対応する<Links href="/ktor/server-dependencies" summary="既存のGradle/MavenプロジェクトにKtorサーバーの依存関係を追加する方法を学びます。">Ktorアーティファクト</Links>がビルドスクリプトに追加されていることを確認してください。
        </p>
    </chapter>
    <chapter
            title="KtorはIPCシグナル（例：SIGTERMやSIGINT）を捕捉し、サーバーシャットダウンを適切に処理する方法を提供しますか？"
            id="sigterm">
        <p>
            <a href="#engine-main">EngineMain</a>を実行している場合、自動的に処理されます。
            それ以外の場合は、<a
                href="https://github.com/ktorio/ktor/blob/main/ktor-server/ktor-server-cio/jvmAndNix/src/io/ktor/server/cio/EngineMain.kt#L21">手動で処理</a>する必要があります。
            <code>Runtime.getRuntime().addShutdownHook</code>というJVMの機能を使用できます。
        </p>
    </chapter>
    <chapter title="プロキシの背後にあるクライアントIPを取得するには？" id="proxy-ip">
        <p>
            プロキシが適切なヘッダーを提供し、<Links href="/ktor/server-forward-headers" summary="必須の依存関係: io.ktor:%artifact_name% コード例: %example_name% ネイティブサーバーサポート: ✅">ForwardedHeader</Links>プラグインがインストールされている場合、<code>call.request.origin</code>プロパティは元の呼び出し元（プロキシ）に関する<a href="#request_information">接続情報</a>を提供します。
        </p>
    </chapter>
    <chapter title="mainブランチの最新コミットをテストするにはどうすればよいですか？" id="bleeding-edge">
        <p>
            <code>jetbrains.space</code>からKtorのナイトリービルドを取得できます。
            詳細は<a href="https://ktor.io/eap/">早期アクセスプログラム</a>をご覧ください。
        </p>
    </chapter>
    <chapter title="現在使用しているKtorのバージョンを確認するには？" id="ktor-version-used">
        <p>
            <Links href="/ktor/server-default-headers" summary="必須の依存関係: io.ktor:%artifact_name% ネイティブサーバーサポート: ✅">DefaultHeaders</Links>プラグインを使用すると、Ktorのバージョンを含む<code>Server</code>レスポンスヘッダーを送信できます。例：
        </p>
        <code-block code="            Server: ktor-server-core/%ktor_version%"/>
    </chapter>
    <chapter title="ルートが実行されません。デバッグするにはどうすればよいですか？" id="route-not-executing">
        <p>
            Ktorはルーティングの決定のトラブルシューティングに役立つトレースメカニズムを提供します。
            <a href="#trace_routes">ルーティングのトレース</a>セクションを確認してください。
        </p>
    </chapter>
    <chapter title="'Response has already been sent'を解決するには？" id="response-already-sent">
        <p>
            これは、あなた、またはプラグイン、あるいはインターセプターがすでに<code>call.respond* </code>関数を呼び出しており、再度呼び出していることを意味します。
        </p>
    </chapter>
    <chapter title="Ktorイベントを購読するには？" id="ktor-events">
        <p>
            詳細については、<Links href="/ktor/server-events" summary="コード例: %example_name%">アプリケーション監視</Links>ページをご覧ください。
        </p>
    </chapter>
    <chapter title="'No configuration setting found for key ktor'を解決するには？" id="cannot-find-application-conf">
        <p>
            これは、Ktorが<Links href="/ktor/server-configuration-file" summary="設定ファイルでさまざまなサーバーパラメータを設定する方法を学びます。">設定ファイル</Links>を見つけられなかったことを意味します。
            <code>resources</code>フォルダーに設定ファイルがあり、その<code>resources</code>フォルダーがそのようにマークされていることを確認してください。
            ベースとなる動作するプロジェクトを持つために、<a href="https://start.ktor.io/">Ktorプロジェクトジェネレーター</a>
            または
            <a href="https://plugins.jetbrains.com/plugin/16008-ktor">IntelliJ IDEA Ultimate用Ktorプラグイン</a>を使用してプロジェクトをセットアップすることを検討してください。詳細については、<Links href="/ktor/server-create-a-new-project" summary="Ktorでサーバーアプリケーションを開き、実行し、テストする方法を学びます。">新しいKtorプロジェクトを作成、開いて実行する</Links>を参照してください。
        </p>
    </chapter>
    <chapter title="AndroidでKtorを使用できますか？" id="android-support">
        <p>
            はい、Ktorサーバーとクライアントは、少なくともNettyエンジンではAndroid 5（API 21）以降で動作することが知られています。
        </p>
    </chapter>
    <chapter title="'CURL -I'が'404 Not Found'を返すのはなぜですか？" id="curl-head-not-found">
        <p>
            <code>CURL -I</code>は、<code>HEAD</code>リクエストを実行する<code>CURL --head</code>のエイリアスです。
            デフォルトでは、Ktorは<code>GET</code>ハンドラーの<code>HEAD</code>リクエストを処理しません。
            この機能を有効にするには、<Links href="/ktor/server-autoheadresponse" summary="%plugin_name%は、GETが定義されているすべてのルートに対してHEADリクエストに自動的に応答する機能を提供します。">AutoHeadResponse</Links>プラグインをインストールしてください。
        </p>
    </chapter>
    <chapter title="'HttpsRedirect'プラグイン使用時の無限リダイレクトを解決するには？" id="infinite-redirect">
        <p>
            最も可能性の高い原因は、バックエンドがリバースプロキシまたはロードバランサーの背後にあり、その仲介者がバックエンドに通常のHTTPリクエストを行っているため、Ktorバックエンド内の<code>HttpsRedirect</code>プラグインが通常のHTTPリクエストであると認識し、リダイレクトで応答してしまうことです。
        </p>
        <p>
            通常、リバースプロキシは元のリクエスト（HTTPSであったか、元のIPアドレスなど）を記述するいくつかのヘッダーを送信し、それらのヘッダーを解析するための<Links href="/ktor/server-forward-headers" summary="必須の依存関係: io.ktor:%artifact_name% コード例: %example_name% ネイティブサーバーサポート: ✅">ForwardedHeader</Links>プラグインがあります。これにより、<Links href="/ktor/server-https-redirect" summary="必須の依存関係: io.ktor:%artifact_name% コード例: %example_name% ネイティブサーバーサポート: ✅">HttpsRedirect</Links>プラグインは元のリクエストがHTTPSであったことを認識します。
        </p>
    </chapter>
    <chapter title="Kotlin/Nativeで対応するエンジンを使用するためにWindowsに「curl」をインストールするには？" id="native-curl">
        <p>
            <a href="#curl">Curl</a>クライアントエンジンには、<code>curl</code>ライブラリのインストールが必要です。
            Windowsでは、MinGW/MSYS2 <code>curl</code>バイナリを検討するとよいでしょう。
        </p>
        <procedure>
            <step>
                <p>
                    <a href="https://www.msys2.org/">MinGW/MSYS2</a>に記載されているとおりにMinGW/MSYS2をインストールします。
                </p>
            </step>
            <step>
                <p>
                    次のコマンドを使用して<code>libcurl</code>をインストールします。
                </p>
                <code-block lang="shell" code="                    pacman -S mingw-w64-x86_64-curl"/>
            </step>
            <step>
                <p>
                    MinGW/MSYS2をデフォルトの場所にインストールした場合は、
                    <Path>C:\\msys64\\mingw64\\bin\\</Path>
                    を<code>PATH</code>環境変数に追加します。
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="'NoTransformationFoundException'を解決するには？" id="no-transformation-found-exception">
        <p>
            <a href="https://api.ktor.io/ktor-client/ktor-client-core/io.ktor.client.call/-no-transformation-found-exception/index.html">NoTransformationFoundException</a>は、<b>結果</b>タイプからクライアントが<b>期待する</b>タイプへの<i>受信したボディ</i>に対する適切な変換を見つけられないことを表します。
        </p>
        <procedure>
            <step>
                <p>
                    リクエストの<code>Accept</code>ヘッダーが目的のコンテンツタイプを指定していること、およびサーバーのレスポンスの<code>Content-Type</code>ヘッダーがクライアント側の期待するタイプと一致していることを確認してください。
                </p>
            </step>
            <step>
                <p>
                    作業している特定のコンテンツタイプに必要なコンテンツ変換を登録します。
                </p>
                <p>
                    クライアント側では<a href="https://ktor.io/docs/serialization-client.html">ContentNegotiation</a>プラグインを使用できます。
                    このプラグインを使用すると、さまざまなコンテンツタイプに対してデータをシリアライズおよびデシリアライズする方法を指定できます。
                </p>
                <code-block lang="kotlin" code="                    val client = HttpClient(CIO) {&#10;                        install(ContentNegotiation) {&#10;                            json() // Example: Register JSON content transformation&#10;                            // Add more transformations as needed for other content types&#10;                        }&#10;                    }"/>
            </step>
            <step>
                <p>
                    必要なすべてのプラグインをインストールしていることを確認してください。不足している可能性のある機能:
                </p>
                <list type="bullet">
                    <li>クライアント<a href="https://ktor.io/docs/websocket-client.html">WebSockets</a>および
                        サーバー<a href="https://ktor.io/docs/websocket.html">WebSockets</a></li>
                    <li>クライアント<a href="https://ktor.io/docs/serialization-client.html">ContentNegotiation</a>および
                        サーバー<a href="https://ktor.io/docs/serialization.html">ContentNegotiation</a></li>
                    <li><a href="https://ktor.io/docs/compression.html">Compression</a></li>
                </list>
            </step>
        </procedure>
    </chapter>
</topic>