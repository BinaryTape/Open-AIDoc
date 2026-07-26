<topic xmlns="" xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="server-development-mode" title="開発モード"
   help-id="development_mode;development-mode">
<show-structure for="chapter" depth="2"/>
<p>
    Ktorは、開発向けに特化した特別なモードを提供しています。このモードでは、以下の機能が有効になります：
</p>
<list>
    <li>サーバーを再起動せずにアプリケーションクラスをリロードするための<Links href="//server-auto-reload" summary="コードの変更時にアプリケーションクラスをリロードするためのオートリロードの使用方法について説明します。">オートリロード</Links>。
    </li>
    <li><a href="#pipelines">パイプライン</a>をデバッグするための拡張情報（スタックトレースを含む）。
    </li>
    <li><emphasis>5**</emphasis>サーバーエラーが発生した場合の<Links href="//server-status-pages" summary="%plugin_name%を使用すると、Ktorアプリケーションは、スローされた例外やステータスコードに基づいて、あらゆる失敗状態に対して適切に応答できるようになります。">レスポンスページ</Links>における拡張デバッグ情報。
    </li>
</list>
<note>
    <p>
        開発モードはパフォーマンスに影響を与えるため、本番環境では使用しないでください。
    </p>
</note>
<chapter title="開発モードを有効にする" id="enable">
    <p>
        開発モードは、アプリケーションの設定ファイル、専用のシステムプロパティ、または環境変数を使用して、さまざまな方法で有効にできます。
    </p>
    <chapter title="設定ファイル" id="application-conf">
        <p>
            <Links href="//server-configuration-file" summary="設定ファイルでさまざまなサーバーパラメータを構成する方法について説明します。">設定ファイル</Links>で開発モードを有効にするには、<code>development</code>オプションを<code>true</code>に設定します：
        </p>
        <Tabs group="config">
            <TabItem title="application.conf" group-key="hocon">
                <code-block code="                        ktor {&#10;                            development = true&#10;                        }"/>
            </TabItem>
            <TabItem title="application.yaml" group-key="yaml">
                <code-block lang="yaml" code="                        ktor:&#10;                            development: true"/>
            </TabItem>
        </Tabs>
    </chapter>
    <chapter title="'io.ktor.development' システムプロパティ" id="system-property">
        <p>
            <control>io.ktor.development</control>
            <a href="https://docs.oracle.com/javase/tutorial/essential/environment/sysprop.html">システムプロパティ</a>を使用すると、アプリケーションの実行時に開発モードを有効にできます。
        </p>
        <p>
            IntelliJ IDEAを使用して開発モードでアプリケーションを実行するには、<code>-D</code>フラグを付けて<code>io.ktor.development</code>を<a href="https://www.jetbrains.com/help/idea/run-debug-configuration-kotlin.html#1">VMオプション</a>に渡します：
        </p>
        <code-block code="                -Dio.ktor.development=true"/>
        <p>
            <Links href="//server-dependencies" summary="既存のGradle/MavenプロジェクトにKtorサーバーの依存関係を追加する方法について説明します。">Gradle</Links>タスクを使用してアプリケーションを実行する場合、次の2つのいずれかの方法で開発モードを有効にできます：
        </p>
        <list>
            <li>
                <p>
                    <Path>build.gradle.kts</Path>ファイルの<code>ktor</code>ブロックを設定します：
                </p>
                <code-block lang="Kotlin" code="                        ktor {&#10;                            development = true&#10;                        }"/>
            </li>
            <li>
                <p>
                    Gradle CLIフラグを渡して、1回の実行に対して開発モードを有効にします：
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
            <a href="#native">Nativeクライアント</a>で開発モードを有効にするには、<code>io.ktor.development</code>環境変数を使用します。
        </p>
    </chapter>
</chapter>
</topic>