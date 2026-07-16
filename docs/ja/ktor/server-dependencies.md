```xml
<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   title="サーバーの依存関係を追加する"
   id="server-dependencies" help-id="Gradle">
<show-structure for="chapter" depth="2"/>
<link-summary>既存のGradle/MavenプロジェクトにKtorサーバーの依存関係を追加する方法を学びます。</link-summary>
<p>
    このトピックでは、Ktorサーバーに必要な依存関係を既存のGradle/Mavenプロジェクトに追加する方法について説明します。
</p>
<chapter title="リポジトリを構成する" id="repositories">
    <p>
        Ktorの依存関係を追加する前に、このプロジェクトのリポジトリを構成する必要があります:
    </p>
    <list>
        <li>
            <p>
                <control>プロダクション</control>
            </p>
            <p>
                KtorのプロダクションリリースはMavenセントラルリポジトリで入手可能です。
                このリポジトリはビルドスクリプトで次のように宣言できます:
            </p>
            <tabs group="languages">
                <tab title="Gradle (Kotlin)" group-key="kotlin">
                    <code-block lang="Kotlin" code="                            repositories {&#10;                                mavenCentral()&#10;                            }"/>
                </tab>
                <tab title="Gradle (Groovy)" group-key="groovy">
                    <code-block lang="Groovy" code="                            repositories {&#10;                                mavenCentral()&#10;                            }"/>
                </tab>
                <tab title="Maven" group-key="maven">
                    <note>
                        <p>
                            プロジェクトは<a href="https://maven.apache.org/guides/introduction/introduction-to-the-pom.html#super-pom">Super POM</a>からセントラルリポジトリを継承しているため、<Path>pom.xml</Path>ファイルにMavenセントラルリポジトリを追加する必要はありません。
                        </p>
                    </note>
                </tab>
            </tabs>
        </li>
        <li>
            <p>
                <control>早期アクセスプログラム (EAP)</control>
            </p>
            <p>
                Ktorの<a href="https://ktor.io/eap/">EAP</a>バージョンにアクセスするには、<a href="https://maven.pkg.jetbrains.space/public/p/ktor/eap/io/ktor/">Spaceリポジトリ</a>を参照する必要があります:
            </p>
            <tabs group="languages">
                <tab title="Gradle (Kotlin)" group-key="kotlin">
                    <code-block lang="Kotlin" code="                            repositories {&#10;                                maven {&#10;                                    url = uri(&quot;https://maven.pkg.jetbrains.space/public/p/ktor/eap&quot;)&#10;                                }&#10;                            }"/>
                </tab>
                <tab title="Gradle (Groovy)" group-key="groovy">
                    <code-block lang="Groovy" code="                            repositories {&#10;                                maven {&#10;                                    url &quot;https://maven.pkg.jetbrains.space/public/p/ktor/eap&quot;&#10;                                }&#10;                            }"/>
                </tab>
                <tab title="Maven" group-key="maven">
                    <code-block lang="XML" code="                            &lt;repositories&gt;&#10;                                &lt;repository&gt;&#10;                                    &lt;id&gt;ktor-eap&lt;/id&gt;&#10;                                    &lt;url&gt;https://maven.pkg.jetbrains.space/public/p/ktor/eap&lt;/url&gt;&#10;                                &lt;/repository&gt;&#10;                            &lt;/repositories&gt;"/>
                </tab>
            </tabs>
            <p>
                Ktor EAPは、<a href="https://maven.pkg.jetbrains.space/kotlin/p/kotlin/dev">Kotlin開発リポジトリ</a>を必要とする場合があることに注意してください:
            </p>
            <tabs group="languages">
                <tab title="Gradle (Kotlin)" group-key="kotlin">
                    <code-block lang="Kotlin" code="                            repositories {&#10;                                maven {&#10;                                    url = uri(&quot;https://maven.pkg.jetbrains.space/kotlin/p/kotlin/dev&quot;)&#10;                                }&#10;                            }"/>
                </tab>
                <tab title="Gradle (Groovy)" group-key="groovy">
                    <code-block lang="Groovy" code="                            repositories {&#10;                                maven {&#10;                                    url &quot;https://maven.pkg.jetbrains.space/kotlin/p/kotlin/dev&quot;&#10;                                }&#10;                            }"/>
                </tab>
                <tab title="Maven" group-key="maven">
                    <code-block lang="XML" code="                            &lt;repositories&gt;&#10;                                &lt;repository&gt;&#10;                                    &lt;id&gt;ktor-eap&lt;/id&gt;&#10;                                    &lt;url&gt;https://maven.pkg.jetbrains.space/kotlin/p/kotlin/dev&lt;/url&gt;&#10;                                &lt;/repository&gt;&#10;                            &lt;/repositories&gt;"/>
                </tab>
            </tabs>
        </li>
    </list>
</chapter>
<chapter title="依存関係を追加する" id="add-ktor-dependencies">
    <chapter title="コア依存関係" id="core-dependencies">
        <p>
            すべてのKtorアプリケーションには、少なくとも以下の依存関係が必要です:
        </p>
        <list>
            <li>
                <p>
                    <code>ktor-server-core</code>: Ktorのコア機能を含みます。
                </p>
            </li>
            <li>
                <p>
                    ネットワークリクエストを処理する<Links href="/ktor/server-engines" summary="ネットワークリクエストを処理するエンジンについて学ぶ">エンジン</Links>の依存関係 (例: <code>ktor-server-netty</code>)。
                </p>
            </li>
        </list>
        <p>
            異なるプラットフォーム向けに、Ktorは<code>-jvm</code>のようなサフィックスを持つプラットフォーム固有のアーティファクト（例: <code>ktor-server-core-jvm</code>や<code>ktor-server-netty-jvm</code>）を提供しています。
            Gradleは特定のプラットフォームに適したアーティファクトを解決しますが、Mavenはこの機能をサポートしていません。
            つまり、Mavenの場合はプラットフォーム固有のサフィックスを手動で追加する必要があります。
            基本的なKtorアプリケーションの<code>dependencies</code>ブロックは次のようになります:
        </p>
        <tabs group="languages">
            <tab title="Gradle (Kotlin)" group-key="kotlin">
                <code-block lang="Kotlin" code="                        dependencies {&#10;                            implementation(&quot;io.ktor:ktor-server-core:%ktor_version%&quot;)&#10;                            implementation(&quot;io.ktor:ktor-server-netty:%ktor_version%&quot;)&#10;                        }"/>
            </tab>
            <tab title="Gradle (Groovy)" group-key="groovy">
                <code-block lang="Groovy" code="                        dependencies {&#10;                            implementation &quot;io.ktor:ktor-server-core:%ktor_version%&quot;&#10;                            implementation &quot;io.ktor:ktor-server-netty:%ktor_version%&quot;&#10;                        }"/>
            </tab>
            <tab title="Maven" group-key="maven">
                <code-block lang="XML" code="                        &lt;dependencies&gt;&#10;                            &lt;dependency&gt;&#10;                                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                                &lt;artifactId&gt;ktor-server-core-jvm&lt;/artifactId&gt;&#10;                                &lt;version&gt;%ktor_version%&lt;/version&gt;&#10;                            &lt;/dependency&gt;&#10;                            &lt;dependency&gt;&#10;                                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                                &lt;artifactId&gt;ktor-server-netty-jvm&lt;/artifactId&gt;&#10;                                &lt;version&gt;%ktor_version%&lt;/version&gt;&#10;                            &lt;/dependency&gt;&#10;                        &lt;/dependencies&gt;"/>
            </tab>
        </tabs>
    </chapter>
    <chapter title="ロギング依存関係" id="logging-dependency">
        <p>
            Ktorは、さまざまなロギングフレームワーク（例: LogbackやLog4j）のファサードとしてSLF4J APIを使用し、アプリケーションイベントをログに記録できます。
            必要なアーティファクトの追加方法については、<a href="server-logging.md#add_dependencies">ロガーの依存関係を追加する</a>を参照してください。
        </p>
    </chapter>
    <chapter title="プラグイン依存関係" id="plugin-dependencies">
        <p>
            プラグインは、シリアライゼーション、コンテンツエンコーディング、圧縮などの共通機能を提供します。<Links href="/ktor/server-plugins" summary="プラグインは、シリアライゼーション、コンテンツエンコーディング、圧縮などの共通機能を提供します。">プラグイン</Links>は、追加の依存関係を必要とする場合があります。
            詳細については、関連トピックを参照してください。
        </p>
    </chapter>
</chapter>
<var name="target_module" value="server"/>
<chapter title="Ktorのバージョン整合性を確保する" id="ensure-version-consistency">
    <chapter id="using-gradle-plugin" title="Ktor Gradleプラグインを使用する">
        <p>
            <a href="https://github.com/ktorio/ktor-build-plugins">Ktor Gradleプラグイン</a>を適用すると、Ktor BOM（Bill Of Materials）の依存関係が暗黙的に追加され、すべてのKtor依存関係が同じバージョンであることを保証できます。この場合、Ktorアーティファクトに依存する際にバージョンを指定する必要がなくなります:
        </p>
        <tabs group="languages">
            <tab title="Gradle (Kotlin)" group-key="kotlin">
                <code-block lang="Kotlin" code="                        plugins {&#10;                            // ...&#10;                            id(&quot;io.ktor.plugin&quot;) version &quot;%ktor_version%&quot;&#10;                        }&#10;                        dependencies {&#10;                            implementation(&quot;io.ktor:ktor-%target_module%-core&quot;)&#10;                            // ...&#10;                        }"/>
            </tab>
            <tab title="Gradle (Groovy)" group-key="groovy">
                <code-block lang="Groovy" code="                        plugins {&#10;                            // ...&#10;                            id &quot;io.ktor.plugin&quot; version &quot;%ktor_version%&quot;&#10;                        }&#10;                        dependencies {&#10;                            implementation &quot;io.ktor:ktor-%target_module%-core&quot;&#10;                            // ...&#10;                        }"/>
            </tab>
        </tabs>
    </chapter>
    <chapter id="using-version-catalog" title="公開されたバージョンカタログを使用する">
        <p>
            公開されたバージョンカタログを使用することで、Ktorの依存関係の宣言を一元化することもできます。
            このアプローチには以下の利点があります:
        </p>
        <list id="published-version-catalog-benefits">
            <li>
                Ktorのバージョンを独自のカタログで手動で宣言する必要がなくなります。
            </li>
            <li>
                すべてのKtorモジュールを単一の名前空間の下に公開します。
            </li>
        </list>
        <p>
            カタログを宣言するには、<Path>settings.gradle.kts</Path>で選択した名前でバージョンカタログを作成します:
        </p>
        <code-block lang="kotlin" code="                dependencyResolutionManagement {&#10;                    versionCatalogs {&#10;                        create(&quot;ktorLibs&quot;) {&#10;                            from(&quot;io.ktor:ktor-version-catalog:%ktor_version%&quot;)&#10;                        }&#10;                    }&#10;                }"/>
        <p>
            その後、モジュールの<Path>build.gradle.kts</Path>でカタログ名を参照して依存関係を追加できます:
        </p>
        <code-block lang="kotlin" code="                dependencies {&#10;                    implementation(ktorLibs.%target_module%.core)&#10;                    // ...&#10;                }"/>
    </chapter>
</chapter>
<chapter title="アプリケーションを実行するためのエントリポイントを作成する" id="create-entry-point">
    <p>
        Gradle/Mavenを使用してKtorサーバーを<Links href="/ktor/server-run" summary="サーバーKtorアプリケーションを実行する方法を学ぶ。">実行する</Links>方法は、<Links href="/ktor/server-create-and-configure" summary="アプリケーションのデプロイ要件に応じてサーバーを作成する方法を学ぶ。">サーバーを作成する</Links>ために使用する方法に依存します。
        アプリケーションのメインクラスを以下のいずれかの方法で指定できます:
    </p>
    <list>
        <li>
            <p>
                <a href="#embedded-server">embeddedServer</a>を使用する場合、メインクラスを次のように指定します:
            </p>
            <tabs group="languages">
                <tab title="Gradle (Kotlin)" group-key="kotlin">
                    <code-block lang="Kotlin" code="                            application {&#10;                                mainClass.set(&quot;com.example.ApplicationKt&quot;)&#10;                            }"/>
                </tab>
                <tab title="Gradle (Groovy)" group-key="groovy">
                    <code-block lang="Groovy" code="                            application {&#10;                                mainClass = &quot;com.example.ApplicationKt&quot;&#10;                            }"/>
                </tab>
                <tab title="Maven" group-key="maven">
                    <code-block lang="XML" code="                            &lt;properties&gt;&#10;                                &lt;main.class&gt;com.example.ApplicationKt&lt;/main.class&gt;&#10;                            &lt;/properties&gt;"/>
                </tab>
            </tabs>
        </li>
        <li>
            <p>
                <a href="#engine-main">EngineMain</a>を使用する場合、それをメインクラスとして構成する必要があります。
                Nettyの場合は次のようになります:
            </p>
            <tabs group="languages">
                <tab title="Gradle (Kotlin)" group-key="kotlin">
                    <code-block lang="Kotlin" code="                            application {&#10;                                mainClass.set(&quot;io.ktor.server.netty.EngineMain&quot;)&#10;                            }"/>
                </tab>
                <tab title="Gradle (Groovy)" group-key="groovy">
                    <code-block lang="Groovy" code="                            application {&#10;                                mainClass = &quot;com.example.ApplicationKt&quot;&#10;                            }"/>
                </tab>
                <tab title="Maven" group-key="maven">
                    <code-block lang="XML" code="                            &lt;properties&gt;&#10;                                &lt;main.class&gt;io.ktor.server.netty.EngineMain&lt;/main.class&gt;&#10;                            &lt;/properties&gt;"/>
                </tab>
            </tabs>
        </li>
    </list>
    <note>
        <p>
            アプリケーションをFat JARとしてパッケージ化する場合、対応するプラグインを構成する際に、サーバーの作成方法も考慮に入れる必要があります。
            詳細については、以下のトピックを参照してください:
        </p>
        <list>
            <li>
                <p>
                    Ktor Gradleプラグインを使用して<Links href="/ktor/server-fatjar" summary="Ktor Gradleプラグインを使用して実行可能なFat JARを作成し、実行する方法を学ぶ。">Fat JARを作成する</Links>
                </p>
            </li>
            <li>
                <p>
                    Maven Assemblyプラグインを使用して<Links href="/ktor/maven-assembly-plugin" summary="サンプルプロジェクト: tutorial-server-get-started-maven">Fat JARを作成する</Links>
                </p>
            </li>
        </list>
    </note>
</chapter>
</topic>