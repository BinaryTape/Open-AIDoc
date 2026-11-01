---
aside: false
---
<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="ようこそ"
       id="welcome">
    <section-starting-page>
        <title>Ktor ドキュメント</title>
        <description>
            Ktor は、非同期のサーバーサイドおよびクライアントサイドアプリケーションを容易に構築するためのフレームワークです。
        </description>
        <spotlight>
            <card href="server-create-a-new-project.topic" summary="Ktor を使用してサーバーアプリケーションを作成、実行、テストする方法を学びます。">
                Ktor Server の使用を開始する
            </card>
            <card href="client-create-new-application.topic" summary="Ktor を使用してクライアントアプリケーションを作成、実行、テストする方法を学びます。">
                Ktor Client の使用を開始する
            </card>
        </spotlight>
        <primary>
            <title>Ktor Server</title>
            <card href="server-requests-and-responses.topic" summary="タスクマネージャーアプリケーションを作成しながら、Ktor でルーティングとリクエストがどのように機能するかを学びます。">
                リクエストの処理とレスポンスの生成
            </card>
            <card href="server-create-restful-apis.topic" summary="Ktor を使用して RESTful API を構築する方法を学びます。このチュートリアルでは、実際の例をベースにセットアップ、ルーティング、テストを網羅します。">RESTful API の作成</card>
            <card href="server-create-website.topic" summary="Ktor と Thymeleaf テンプレートを使用して Kotlin でウェブサイトを構築する方法を学びます。">ウェブサイトの作成</card>
            <card href="server-create-websocket-application.topic" summary="WebSocket の力を活用してコンテンツを送受信する方法を学びます。">
                WebSocket アプリケーションの作成
            </card>
            <card href="server-integrate-database.md" summary="Exposed SQL ライブラリを使用して Ktor サービスをデータベースリポジトリに接続する手順を学びます。">データベースの統合</card>
        </primary>
        <misc>
            <links narrow="true">
                <group>
                    <title>サーバーの設定</title>
                    <Links href="server-create-a-new-project.topic" summary="Ktor を使用してサーバーアプリケーションを開き、実行し、テストする方法を学びます。">新規 Ktor プロジェクトの作成、オープン、実行</Links>
                    <Links href="server-dependencies.topic" summary="既存の Gradle/Maven プロジェクトに Ktor Server の依存関係を追加する方法を学びます。">サーバーの依存関係の追加</Links>
                    <Links href="server-create-and-configure.topic" summary="アプリケーションのデプロイ要件に応じたサーバーの作成方法を学びます。">サーバーの作成</Links>
                    <Links href="server-configuration-code.topic" summary="コード内でさまざまなサーバーパラメーターを設定する方法を学びます。">コードでの設定</Links>
                    <Links href="server-configuration-file.topic" summary="設定ファイルでさまざまなサーバーパラメーターを設定する方法を学びます。">ファイルでの設定</Links>
                    <Links href="server-plugins.md" summary="プラグインは、シリアライズ、コンテンツエンコーディング、圧縮などの一般的な機能を提供します。">サーバープラグイン</Links>
                </group>
                <group>
                    <title>ルーティング</title>
                    <Links href="server-routing.md" summary="ルーティングは、サーバーアプリケーションで受信リクエストを処理するためのコアプラグインです。">ルーティング</Links>
                    <Links href="server-resources.md" summary="Resources プラグインを使用すると、型安全なルーティングを実装できます。">型安全なルーティング</Links>
                    <Links href="server-routing-organization.md" summary="Ktor アプリケーションの拡張に合わせてルーティングロジックを整理し、構造化する方法を学びます。">ルーティングの構成</Links>
                    <Links href="server-requests.md" summary="ルートハンドラー内で受信リクエストを処理する方法を学びます。">リクエストの処理</Links>
                    <Links href="server-responses.md" summary="さまざまなタイプのレスポンスを送信する方法を学びます。">レスポンスの送信</Links>
                    <Links href="server-static-content.md" summary="スタイルシート、スクリプト、画像などの静的コンテンツを配信する方法を学びます。">静的コンテンツの配信</Links>
                </group>
                <group>
                    <title>プラグイン</title>
                    <Links href="server-serialization.md" summary="ContentNegotiation プラグインには、クライアントとサーバー間のメディアタイプのネゴシエーションと、特定のフォーマットでのコンテンツのシリアライズ/デシリアライズという 2 つの主な目的があります。">Ktor Server でのコンテンツネゴシエーションとシリアライズ</Links>
                    <Links href="server-templating.md" summary="HTML/CSS または JVM テンプレートエンジンで構築されたビューを操作する方法を学びます。">テンプレート</Links>
                    <Links href="server-auth.md" summary="Authentication プラグインは、Ktor での認証と認可を処理します。">Ktor Server での認証と認可</Links>
                    <Links href="server-sessions.md" summary="Sessions プラグインは、異なる HTTP リクエスト間でデータを保持するメカニズムを提供します。">セッション</Links>
                    <Links href="server-websockets.md" summary="Websockets プラグインを使用すると、サーバーとクライアント間で双方向の通信セッションを作成できます。">Ktor Server での WebSocket</Links>
                    <Links href="server-server-sent-events.topic" summary="SSE プラグインを使用すると、サーバーは HTTP 接続経由でイベントベースの更新をクライアントに送信できます。">Ktor Server での Server-Sent Events</Links>
                    <Links href="server-swagger-ui.md" summary="SwaggerUI プラグインを使用すると、プロジェクト用の Swagger UI を生成できます。">Swagger UI</Links> / <Links href="server-openapi.md" summary="OpenAPI プラグインを使用すると、プロジェクト用の OpenAPI ドキュメントを生成できます。">OpenAPI</Links>
                    <Links href="server-custom-plugins.md" summary="独自のカスタムプラグインを作成する方法を学びます。">カスタムサーバープラグイン</Links>
                </group>
                <group>
                    <title>実行、デバッグ、テスト</title>
                    <Links href="server-run.md" summary="サーバー Ktor アプリケーションを実行する方法を学びます。">実行</Links>
                    <Links href="server-auto-reload.topic" summary="コードの変更時に Auto-reload を使用してアプリケーションクラスを再読み込みする方法を学びます。">自動リロード</Links>
                    <Links href="server-testing.md" summary="特別なテストエンジンを使用してサーバーアプリケーションをテストする方法を学びます。">Ktor Server でのテスト</Links>
                </group>
                <group>
                    <title>デプロイ</title>
                    <Links href="server-fatjar.md" summary="Ktor Gradle プラグインを使用して実行可能な Fat JAR を作成および実行する方法を学びます。">Fat JAR の作成</Links>
                    <Links href="server-war.md" summary="WAR アーカイブを使用してサーブレットコンテナ内で Ktor アプリケーションを実行およびデプロイする方法を学びます。">WAR</Links>
                    <Links href="graalvm.md" summary="さまざまなプラットフォーム向けに GraalVM をネイティブイメージに使用する方法を学びます。">GraalVM</Links>
                    <Links href="docker.md" summary="Docker コンテナにアプリケーションをデプロイする方法を学びます。">Docker</Links>
                    <Links href="google-app-engine.md" summary="Google App Engine スタンダード環境にプロジェクトをデプロイする方法を学びます。">Ktor アプリを Google App Engine にデプロイ</Links>
                    <Links href="heroku.md" summary="Ktor アプリケーションを準備して Heroku にデプロイする方法を学びます。">Heroku</Links>
                    <Links href="sevalla.md" summary="Ktor アプリケーションを準備して Sevalla にデプロイする方法を学びます。">Sevalla</Links>
                </group>
            </links>
            <cards>
                <title>Ktor Client</title>
                <card href="client-create-new-application.topic" summary="Ktor でクライアントアプリケーションを作成します。">
                    クライアントアプリケーションの作成
                </card>
                <card href="client-create-multiplatform-application.md" summary="Kotlin Multiplatform Mobile アプリケーションを作成し、Ktor Client を使用してリクエストを送信し、レスポンスを受信する方法を学びます。">
                    クロスプラットフォームモバイルアプリケーションの作成
                </card>
            </cards>
            <links narrow="true">
                <group>
                    <title>クライアントのセットアップ</title>
                    <Links href="client-create-new-application.topic" summary="リクエストの送信とレスポンスの受信を行う最初のクライアントアプリケーションを作成します。">クライアントアプリケーションの作成</Links>
                    <Links href="client-dependencies.md" summary="既存のプロジェクトにクライアントの依存関係を追加する方法を学びます。">クライアントの依存関係の追加</Links>
                    <Links href="client-create-and-configure.md" summary="Ktor クライアントを作成および設定する方法を学びます。">クライアントの作成と設定</Links>
                    <Links href="client-engines.md" summary="ネットワークリクエストを処理するエンジンについて学びます。">クライアントエンジン</Links>
                    <Links href="client-plugins.md" summary="クライアントプラグインを使用して、ロギング、シリアライズ、認可などの一般的な機能を追加する方法を学びます。">クライアントプラグイン</Links>
                </group>
                <group>
                    <title>リクエスト</title>
                    <Links href="client-requests.md" summary="リクエストを作成し、リクエスト URL、HTTP メソッド、ヘッダー、リクエストボディなどのさまざまなリクエストパラメーターを指定する方法を学びます。">リクエストの作成</Links>
                    <Links href="client-resources.md" summary="Resources プラグインを使用して型安全なリクエストを作成する方法を学びます。">型安全なリクエスト</Links>
                    <Links href="client-default-request.md" summary="DefaultRequest プラグインを使用すると、すべてのリクエストに対するデフォルトのパラメーターを設定できます。">デフォルトリクエスト</Links>
                    <Links href="client-request-retry.md" summary="HttpRequestRetry プラグインを使用すると、失敗したリクエストに対する再試行ポリシーを設定できます。">失敗したリクエストの再試行</Links>
                </group>
                <group>
                    <title>レスポンス</title>
                    <Links href="client-responses.md" summary="レスポンスの受信、レスポンスボディの取得、およびレスポンスパラメーターの取得方法を学びます。">レスポンスの受信</Links>
                    <Links href="client-response-validation.md" summary="ステータスコードに応じてレスポンスを検証する方法を学びます。">レスポンスの検証</Links>
                </group>
                <group>
                    <title>プラグイン</title>
                    <Links href="client-auth.md" summary="Auth プラグインは、クライアントアプリケーションでの認証と認可を処理します。">Ktor Client での認証と認可</Links>
                    <Links href="client-cookies.md" summary="HttpCookies プラグインは Cookie を自動的に処理し、呼び出し間でストレージに保持します。">Cookie</Links>
                    <Links href="client-content-encoding.md" summary="ContentEncoding プラグインを使用すると、指定した圧縮アルゴリズム（'gzip' や 'deflate' など）を有効にし、その設定を構成できます。">コンテンツエンコーディング</Links>
                    <Links href="client-bom-remover.md" summary="BOMRemover プラグインを使用すると、レスポンスボディからバイト順マーク（BOM）を削除できます。">BOM リムーバー</Links>
                    <Links href="client-caching.md" summary="HttpCache プラグインを使用すると、以前に取得したリソースをインメモリまたは永続キャッシュに保存できます。">キャッシュ</Links>
                    <Links href="client-websockets.topic" summary="Websockets プラグインを使用すると、サーバーとクライアント間で双方向の通信セッションを作成できます。">Ktor Client での WebSocket</Links>
                    <Links href="client-server-sent-events.topic" summary="SSE プラグインを使用すると、クライアントは HTTP 接続経由でサーバーからイベントベースの更新を受信できます。">Ktor Client での Server-Sent Events</Links>
                    <Links href="client-custom-plugins.md" summary="独自のカスタムクライアントプラグインを作成する方法を学びます。">カスタムクライアントプラグイン</Links>
                </group>
                <group>
                    <title>テスト</title>
                    <Links href="client-testing.md" summary="MockEngine を使用して HTTP 呼び出しをシミュレートし、クライアントをテストする方法を学びます。">Ktor Client でのテスト</Links>
                </group>
            </links>
            <cards>
                <title>統合</title>
                <card href="full-stack-development-with-kotlin-multiplatform.topic" summary="Kotlin と Ktor でクロスプラットフォームのフルスタックアプリケーションを開発する方法を学びます。">Kotlin Multiplatform でフルスタックアプリケーションを構築する</card>
                <card href="tutorial-first-steps-with-kotlin-rpc.md" summary="Kotlin RPC と Ktor を使用して最初のアプリケーションを作成する方法を学びます。">Kotlin RPC 入門</card>
            </cards>
        </misc>
    </section-starting-page>
</topic>