```xml
<topic xmlns="" xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="server-development-mode" title="Development mode"
   help-id="development_mode;development-mode">
<show-structure for="chapter" depth="2"/>
<p>
    Ktorは開発を目的とした特別なモードを提供します。このモードでは、以下の機能が有効になります。
</p>
<list>
    <li><Links href="/ktor/server-auto-reload" summary="コードの変更時にアプリケーションクラスをリロードするオートリロードの使用方法について学習します。">オートリロード</Links>により、サーバーを再起動せずにアプリケーションクラスをリロードします。
    </li>
    <li><a href="#pipelines">パイプライン</a>のデバッグ用拡張情報（スタックトレース付き）。
    </li>
    <li><emphasis>5**</emphasis>サーバーエラーの場合、<Links href="/ktor/server-status-pages" summary="%plugin_name% を使用すると、Ktorアプリケーションは、スローされた例外やステータスコードに基づいて、あらゆる失敗状態に適切に応答できます。">レスポンスページ</Links>に拡張されたデバッグ情報が表示されます。
    </li>
</list>
<note>
    <p>
        開発モードはパフォーマンスに影響するため、本番環境では使用しないでください。
    </p>
</note>
<chapter title="開発モードを有効にする" id="enable">
    <p>
        開発モードは、アプリケーション設定ファイル、専用のシステムプロパティ、または環境変数を使用するなど、さまざまな方法で有効にできます。
    </p>
    <chapter title="設定ファイル" id="application-conf">
        <p>
            <Links href="/ktor/server-configuration-file" summary="設定ファイルでさまざまなサーバーパラメータを構成する方法を学習します。">設定ファイル</Links>で開発モードを有効にするには、<code>development</code>オプションを<code>true</code>に設定します。
        </p>
        <tabs group="config">
            <tab title="application.conf" group-key="hocon">
                <code-block code="                        ktor {&#10;                            development = true&#10;                        }"/>
            </tab>
            <tab title="application.yaml" group-key="yaml">
                <code-block lang="yaml" code="                        ktor:&#10;                            development: true"/>
            </tab>
        </tabs>
    </chapter>
    <chapter title="'io.ktor.development' システムプロパティ" id="system-property">
        <p>
            <control>io.ktor.development</control>
            <a href="https://docs.oracle.com/javase/tutorial/essential/environment/sysprop.html">システムプロパティ</a>を使用すると、アプリケーションの実行時に開発モードを有効にできます。
        </p>
        <p>
            IntelliJ IDEAを使用してアプリケーションを開発モードで実行するには、<code>-D</code>フラグで<code>io.ktor.development</code>を<a href="https://www.jetbrains.com/help/idea/run-debug-configuration-kotlin.html#1">VMオプション</a>に渡します。
        </p>
        <code-block code="                -Dio.ktor.development=true"/>
        <p>
            <Links href="/ktor/server-dependencies" summary="既存のGradle/MavenプロジェクトにKtorサーバーの依存関係を追加する方法を学習します。">Gradle</Links>タスクを使用してアプリケーションを実行する場合、開発モードを有効にする方法は2つあります。
        </p>
        <list>
            <li>
                <p>
                    <Path>build.gradle.kts</Path>ファイルで<code>ktor</code>ブロックを設定します。
                </p>
                <code-block lang="Kotlin" code="                        ktor {&#10;                            development = true&#10;                        }"/>
            </li>
            <li>
                <p>
                    Gradle CLIフラグを渡すことで、単一の実行に対して開発モードを有効にします。
                </p>
                <code-block lang="bash" code="                          ./gradlew run -Pio.ktor.development=true"/>
            </li>
        </list>
        <tip>
            <p>
                <code>-ea</code>フラグを使用して開発モードを有効にすることもできます。
                <code>-D</code>フラグで渡される<code>io.ktor.development</code>システムプロパティは、<code>-ea</code>よりも優先されることに注意してください。
            </p>
        </tip>
    </chapter>
    <chapter title="'io.ktor.development' 環境変数" id="environment-variable">
        <p>
            <a href="#native">ネイティブクライアント</a>の開発モードを有効にするには、<code>io.ktor.development</code>環境変数を使用します。
        </p>
    </chapter>
</chapter>
</topic>