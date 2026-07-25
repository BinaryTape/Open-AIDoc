<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   title="サーバーの依存関係の追加"
   id="server-dependencies" help-id="Gradle">
<show-structure for="chapter" depth="2"/>
<link-summary>既存のGradle/MavenプロジェクトにKtorサーバーの依存関係を追加する方法を学びます。</link-summary>
<p>
    このトピックでは、既存のGradle/MavenプロジェクトにKtorサーバーに必要な依存関係を追加する方法を説明します。
</p>
<chapter title="リポジトリの設定" id="repositories">
    <p>
        Ktorの依存関係を追加する前に、このプロジェクトのリポジトリを設定する必要があります。
    </p>
    <list>
        <li>
            <p>
                <control>プロダクション</control>
            </p>
            <p>
                KtorのプロダクションリリースはMaven Centralリポジトリで利用可能です。
                ビルドスクリプトで以下のようにこのリポジトリを宣言できます。
            </p>
            <Tabs group="languages">
                <TabItem title="Gradle (Kotlin)" group-key="kotlin">
                    <code-block lang="Kotlin" code="                            repositories {&#10;                                mavenCentral()&#10;                            }"/>
                </TabItem>
                <TabItem title="Gradle (Groovy)" group-key="groovy">
                    <code-block lang="Groovy" code="                            repositories {&#10;                                mavenCentral()&#10;                            }"/>
                </TabItem>
                <TabItem title="Maven" group-key="maven">
                    <note>
                        <p>
                            プロジェクトは<a href="https://maven.apache.org/guides/introduction/introduction-to-the-pom.html#super-pom">Super POM</a>からCentralリポジトリを継承しているため、<Path>pom.xml</Path>ファイルにMaven Centralリポジトリを追加する必要はありません。
                        </p>
                    </note>
                </TabItem>
            </Tabs>
        </li>
        <li>
            <p>
                <control>早期アクセスプログラム (EAP)</control>
            </p>
            <p>
                Ktorの<a href="https://ktor.io/eap/">EAP</a>バージョンにアクセスするには、<a href="https://redirector.kotlinlang.org/maven/ktor-eap/io/ktor/">Spaceリポジトリ</a>を参照する必要があります。
            </p>
            <Tabs group="languages">
                <TabItem title="Gradle (Kotlin)" group-key="kotlin">
                    <code-block lang="Kotlin" code="                            repositories {&#10;                                maven {&#10;                                    url = uri(&quot;https://redirector.kotlinlang.org/maven/ktor-eap&quot;)&#10;                                }&#10;                            }"/>
                </TabItem>
                <TabItem title="Gradle (Groovy)" group-key="groovy">
                    <code-block lang="Groovy" code="                            repositories {&#10;                                maven {&#10;                                    url &quot;https://redirector.kotlinlang.org/maven/ktor-eap&quot;&#10;                                }&#10;                            }"/>
                </TabItem>
                <TabItem title="Maven" group-key="maven">
                    <code-block lang="XML" code="                            &lt;repositories&gt;&#10;                                &lt;repository&gt;&#10;                                    &lt;id&gt;ktor-eap&lt;/id&gt;&#10;                                    &lt;url&gt;https://redirector.kotlinlang.org/maven/ktor-eap&lt;/url&gt;&#10;                                &lt;/repository&gt;&#10;                            &lt;/repositories&gt;"/>
                </TabItem>
            </Tabs>
            <p>
                KtorのEAPには<a href="https://redirector.kotlinlang.org/maven/dev">Kotlin devリポジトリ</a>が必要になる場合があることに注意してください。
            </p>
            <Tabs group="languages">
                <TabItem title="Gradle (Kotlin)" group-key="kotlin">
                    <code-block lang="Kotlin" code="                            repositories {&#10;                                maven {&#10;                                    url = uri(&quot;https://redirector.kotlinlang.org/maven/dev&quot;)&#10;                                }&#10;                            }"/>
                </TabItem>
                <TabItem title="Gradle (Groovy)" group-key="groovy">
                    <code-block lang="Groovy" code="                            repositories {&#10;                                maven {&#10;                                    url &quot;https://redirector.kotlinlang.org/maven/dev&quot;&#10;                                }&#10;                            }"/>
                </TabItem>
                <TabItem title="Maven" group-key="maven">
                    <code-block lang="XML" code="                            &lt;repositories&gt;&#10;                                &lt;repository&gt;&#10;                                    &lt;id&gt;ktor-eap&lt;/id&gt;&#10;                                    &lt;url&gt;https://redirector.kotlinlang.org/maven/dev&lt;/url&gt;&#10;                                &lt;/repository&gt;&#10;                            &lt;/repositories&gt;"/>
                </TabItem>
            </Tabs>
        </li>
    </list>
</chapter>
<chapter title="依存関係の追加" id="add-ktor-dependencies">
    <chapter title="コアの依存関係" id="core-dependencies">
        <p>
            すべてのKtorアプリケーションには、少なくとも以下の依存関係が必要です。
        </p>
        <list>
            <li>
                <p>
                    <code>ktor-server-core</code>: Ktorのコア機能が含まれています。
                </p>
            </li>
            <li>
                <p>
                    <Links href="//server-engines" summary="ネットワークリクエストを処理するエンジンについて学びます。">エンジン</Links>（例: <code>ktor-server-netty</code>）の依存関係。
                </p>
            </li>
        </list>
        <p>
            プラットフォームごとに、Ktorは<code>-jvm</code>などのサフィックスを持つプラットフォーム固有のアーティファクトを提供しています（例: <code>ktor-server-core-jvm</code>、<code>ktor-server-netty-jvm</code>）。
            Gradleは指定されたプラットフォームに適したアーティファクトを解決しますが、Mavenはこの機能をサポートしていないことに注意してください。
            つまり、Mavenの場合はプラットフォーム固有のサフィックスを手動で追加する必要があります。
            基本的なKtorアプリケーションの<code>dependencies</code>ブロックは以下のようになります。
        </p>
        <Tabs group="languages">
            <TabItem title="Gradle (Kotlin)" group-key="kotlin">
                <code-block lang="Kotlin" code="                        dependencies {&#10;                            implementation(&quot;io.ktor:ktor-server-core:%ktor_version%&quot;)&#10;                            implementation(&quot;io.ktor:ktor-server-netty:%ktor_version%&quot;)&#10;                        }"/>
            </TabItem>
            <TabItem title="Gradle (Groovy)" group-key="groovy">
                <code-block lang="Groovy" code="                        dependencies {&#10;                            implementation &quot;io.ktor:ktor-server-core:%ktor_version%&quot;&#10;                            implementation &quot;io.ktor:ktor-server-netty:%ktor_version%&quot;&#10;                        }"/>
            </TabItem>
            <TabItem title="Maven" group-key="maven">
                <code-block lang="XML" code="                        &lt;dependencies&gt;&#10;                            &lt;dependency&gt;&#10;                                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                                &lt;artifactId&gt;ktor-server-core-jvm&lt;/artifactId&gt;&#10;                                &lt;version&gt;%ktor_version%&lt;/version&gt;&#10;                            &lt;/dependency&gt;&#10;                            &lt;dependency&gt;&#10;                                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                                &lt;artifactId&gt;ktor-server-netty-jvm&lt;/artifactId&gt;&#10;                                &lt;version&gt;%ktor_version%&lt;/version&gt;&#10;                            &lt;/dependency&gt;&#10;                        &lt;/dependencies&gt;"/>
            </TabItem>
        </Tabs>
    </chapter>
    <chapter title="ロギングの依存関係" id="logging-dependency">
        <p>
            Ktorは、さまざまなロギングフレームワーク（例: LogbackやLog4j）のファサードとしてSLF4J APIを使用し、アプリケーションイベントをログに記録できるようにします。
            必要なアーティファクトの追加方法については、<a href="server-logging.md#add_dependencies">ロガーの依存関係の追加</a>を参照してください。
        </p>
    </chapter>
    <chapter title="プラグインの依存関係" id="plugin-dependencies">
        <p>
            Ktorの機能を拡張する<Links href="//server-plugins" summary="プラグインは、シリアライゼーション、コンテンツエンコーディング、圧縮などの共通機能を提供します。">プラグイン</Links>には、追加の依存関係が必要になる場合があります。
            詳細については、対応するトピックを参照してください。
        </p>
    </chapter>
</chapter>
<var name="target_module" value="server"/>
<chapter title="Ktorバージョンの整合性の確保" id="ensure-version-consistency">
    <chapter id="using-gradle-plugin" title="Ktor Gradleプラグインの使用">
        <p>
            <a href="https://github.com/ktorio/ktor-build-plugins">Ktor Gradleプラグイン</a>を適用すると、暗黙的にKtor BOMの依存関係が追加され、すべてのKtorの依存関係が同じバージョンであることを保証できます。
            この場合、Ktorアーティファクトに依存する際にバージョンを指定する必要がなくなります。
        </p>
        <Tabs group="languages">
            <TabItem title="Gradle (Kotlin)" group-key="kotlin">
                <code-block lang="Kotlin" code="                        plugins {&#10;                            // ...&#10;                            id(&quot;io.ktor.plugin&quot;) version &quot;%ktor_version%&quot;&#10;                        }&#10;                        dependencies {&#10;                            implementation(&quot;io.ktor:ktor-%target_module%-core&quot;)&#10;                            // ...&#10;                        }"/>
            </TabItem>
            <TabItem title="Gradle (Groovy)" group-key="groovy">
                <code-block lang="Groovy" code="                        plugins {&#10;                            // ...&#10;                            id &quot;io.ktor.plugin&quot; version &quot;%ktor_version%&quot;&#10;                        }&#10;                        dependencies {&#10;                            implementation &quot;io.ktor:ktor-%target_module%-core&quot;&#10;                            // ...&#10;                        }"/>
            </TabItem>
        </Tabs>
    </chapter>
    <chapter id="using-version-catalog" title="公開されたバージョンカタログの使用">
        <p>
            公開されたバージョンカタログを使用して、Ktorの依存関係の宣言を一元化することもできます。
            このアプローチには以下の利点があります。
        </p>
        <list id="published-version-catalog-benefits">
            <li>
                独自のカタログでKtorのバージョンを手動で宣言する必要がなくなります。
            </li>
            <li>
                すべてのKtorモジュールを単一の名前空間で公開します。
            </li>
        </list>
        <p>
            カタログを宣言するには、<Path>settings.gradle.kts</Path>で任意の名前のバージョンカタログを作成します。
        </p>
        <code-block lang="kotlin" code="                dependencyResolutionManagement {&#10;                    versionCatalogs {&#10;                        create(&quot;ktorLibs&quot;) {&#10;                            from(&quot;io.ktor:ktor-version-catalog:%ktor_version%&quot;)&#10;                        }&#10;                    }&#10;                }"/>
        <p>
            その後、カタログ名を参照してモジュールの<Path>build.gradle.kts</Path>に依存関係を追加できます。
        </p>
        <code-block lang="kotlin" code="                dependencies {&#10;                    implementation(ktorLibs.%target_module%.core)&#10;                    // ...&#10;                }"/>
    </chapter>
</chapter>
<chapter title="アプリケーション実行用のエントリポイントの作成" id="create-entry-point">
    <p>
        Gradle/Mavenを使用したKtorサーバーの<Links href="//server-run" summary="サーバーKtorアプリケーションを実行する方法を学びます。">実行</Links>は、<Links href="//server-create-and-configure" summary="アプリケーションのデプロイニーズに応じてサーバーを作成する方法を学びます。">サーバーの作成</Links>方法に依存します。
        アプリケーションのメインクラスは、次のいずれかの方法で指定できます。
    </p>
    <list>
        <li>
            <p>
                <a href="#embedded-server">embeddedServer</a>を使用する場合、メインクラスを次のように指定します。
            </p>
            <Tabs group="languages">
                <TabItem title="Gradle (Kotlin)" group-key="kotlin">
                    <code-block lang="Kotlin" code="                            application {&#10;                                mainClass.set(&quot;com.example.ApplicationKt&quot;)&#10;                            }"/>
                </TabItem>
                <TabItem title="Gradle (Groovy)" group-key="groovy">
                    <code-block lang="Groovy" code="                            application {&#10;                                mainClass = &quot;com.example.ApplicationKt&quot;&#10;                            }"/>
                </TabItem>
                <TabItem title="Maven" group-key="maven">
                    <code-block lang="XML" code="                            &lt;properties&gt;&#10;                                &lt;main.class&gt;com.example.ApplicationKt&lt;/main.class&gt;&#10;                            &lt;/properties&gt;"/>
                </TabItem>
            </Tabs>
        </li>
        <li>
            <p>
                <a href="#engine-main">EngineMain</a>を使用する場合、それをメインクラスとして設定する必要があります。
                Nettyの場合、以下のようになります。
            </p>
            <Tabs group="languages">
                <TabItem title="Gradle (Kotlin)" group-key="kotlin">
                    <code-block lang="Kotlin" code="                            application {&#10;                                mainClass.set(&quot;io.ktor.server.netty.EngineMain&quot;)&#10;                            }"/>
                </TabItem>
                <TabItem title="Gradle (Groovy)" group-key="groovy">
                    <code-block lang="Groovy" code="                            application {&#10;                                mainClass = &quot;io.ktor.server.netty.EngineMain&quot;&#10;                            }"/>
                </TabItem>
                <TabItem title="Maven" group-key="maven">
                    <code-block lang="XML" code="                            &lt;properties&gt;&#10;                                &lt;main.class&gt;io.ktor.server.netty.EngineMain&lt;/main.class&gt;&#10;                            &lt;/properties&gt;"/>
                </TabItem>
            </Tabs>
        </li>
    </list>
    <note>
        <p>
            アプリケーションをFat JARとしてパッケージ化する場合は、対応するプラグインを設定する際にサーバーの作成方法も考慮する必要があります。
            詳細については、以下のトピックを参照してください。
        </p>
        <list>
            <li>
                <p>
                    <Links href="//server-fatjar" summary="Ktor Gradleプラグインを使用して、実行可能なFat JARを作成し実行する方法を学びます。">Ktor Gradleプラグインを使用したFat JARの作成</Links>
                </p>
            </li>
            <li>
                <p>
                    <Links href="//maven-assembly-plugin" summary="サンプルプロジェクト: tutorial-server-get-started-maven">Maven Assemblyプラグインを使用したFat JARの作成</Links>
                </p>
            </li>
        </list>
    </note>
</chapter>
</topic>