<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="新增伺服器相依性"
       id="server-dependencies" help-id="Gradle">
    <show-structure for="chapter" depth="2"/>
    <link-summary>了解如何將 Ktor Server 相依性新增至現有的 Gradle/Maven 專案。</link-summary>
    <p>
        在本主題中，我們將向您展示如何將 Ktor Server 所需的相依性新增至現有的
        Gradle/Maven 專案。
    </p>
    <chapter title="設定存儲庫" id="repositories">
        <p>
            在新增 Ktor 相依性之前，您需要為此專案設定存儲庫：
        </p>
        <list>
            <li>
                <p>
                    <control>生產版本</control>
                </p>
                <p>
                    Ktor 的生產版本可在 Maven 中央存儲庫中取得。
                    您可以在建置指令碼中宣告此存儲庫，如下所示：
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
                                您不需要在 <Path>pom.xml</Path> 檔案中新增 Maven 中央存儲庫，因為您的專案會從
                                <a href="https://maven.apache.org/guides/introduction/introduction-to-the-pom.html#super-pom">Super POM</a> 繼承中央存儲庫。
                            </p>
                        </note>
                    </TabItem>
                </Tabs>
            </li>
            <li>
                <p>
                    <control>早期體驗體計劃 (EAP)</control>
                </p>
                <p>
                    要存取 Ktor 的 <a href="https://ktor.io/eap/">EAP</a> 版本，您需要參照 <a href="https://redirector.kotlinlang.org/maven/ktor-eap/io/ktor/">Space 存儲庫</a>：
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
                    請注意，Ktor EAP 可能需要 <a href="https://redirector.kotlinlang.org/maven/dev">Kotlin 開發存儲庫</a>：
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
    <chapter title="新增相依性" id="add-ktor-dependencies">
        <chapter title="核心相依性" id="core-dependencies">
            <p>
                每個 Ktor 應用程式至少需要以下相依性：
            </p>
            <list>
                <li>
                    <p>
                        <code>ktor-server-core</code>：包含核心 Ktor 功能。
                    </p>
                </li>
                <li>
                    <p>
                        一個<Links href="//server-engines" summary="了解處理網路請求的引擎。">引擎</Links>的相依性（例如 <code>ktor-server-netty</code>）。
                    </p>
                </li>
            </list>
            <p>
                對於不同的平台，Ktor 提供特定平台的成品 (artifacts)，並帶有 <code>-jvm</code> 等後綴，例如 <code>ktor-server-core-jvm</code> 或 <code>ktor-server-netty-jvm</code>。
                請注意，Gradle 會解析適合特定平台的成品，而 Maven 不支援此功能。
                這意味著對於 Maven，您需要手動新增特定平台的後綴。
                一個基礎 Ktor 應用程式的 <code>dependencies</code> 區塊可能如下所示：
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
        <chapter title="記錄相依性" id="logging-dependency">
            <p>
                Ktor 使用 SLF4J API 作為各種記錄架構（例如 Logback 或 Log4j）的介面，並允許您記錄應用程式事件。
                要了解如何新增所需的成品，請參閱<a href="server-logging.md#add_dependencies">新增記錄器相依性</a>。
            </p>
        </chapter>
        <chapter title="外掛程式相依性" id="plugin-dependencies">
            <p>
                擴充 Ktor 功能的<Links href="//server-plugins" summary="外掛程式提供常見功能，例如序列化、內容編碼、壓縮等。">外掛程式</Links>可能需要額外的相依性。
                您可以從相應的主題中了解更多資訊。
            </p>
        </chapter>
    </chapter>
    <var name="target_module" value="server"/>
    <chapter title="確保 Ktor 版本一致性" id="ensure-version-consistency">
        <chapter id="using-gradle-plugin" title="使用 Ktor Gradle 外掛程式">
            <p>
                套用 <a href="https://github.com/ktorio/ktor-build-plugins">Ktor Gradle 外掛程式</a>
                會隱含地新增 Ktor BOM 相依性，並允許您確保所有 Ktor 相依性都處於
                相同版本。在這種情況下，當相依於 Ktor
                成品時，您不再需要指定版本：
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
        <chapter id="using-version-catalog" title="使用發佈的版本目錄">
            <p>
                您也可以透過使用發佈的版本目錄 (version catalog) 來集中 Ktor 相依性宣告。
                此方法具有以下優點：
            </p>
            <list id="published-version-catalog-benefits">
                <li>
                    消除在您自己的目錄中手動宣告 Ktor 版本的需求。
                </li>
                <li>
                    在單一命名空間下公開每個 Ktor 模組。
                </li>
            </list>
            <p>
                要宣告目錄，請在
                <Path>settings.gradle.kts</Path>
                建立一個具有您所選名稱的版本目錄：
            </p>
            <code-block lang="kotlin" code="                dependencyResolutionManagement {&#10;                    versionCatalogs {&#10;                        create(&quot;ktorLibs&quot;) {&#10;                            from(&quot;io.ktor:ktor-version-catalog:%ktor_version%&quot;)&#10;                        }&#10;                    }&#10;                }"/>
            <p>
                然後，您可以透過參照目錄名稱，在模組的
                <Path>build.gradle.kts</Path>
                中新增相依性：
            </p>
            <code-block lang="kotlin" code="                dependencies {&#10;                    implementation(ktorLibs.%target_module%.core)&#10;                    // ...&#10;                }"/>
        </chapter>
    </chapter>
    <chapter title="為執行應用程式建立進入點" id="create-entry-point">
        <p>
            使用 Gradle/Maven <Links href="//server-run" summary="了解如何執行伺服器 Ktor 應用程式。">執行</Links> Ktor 伺服器取決於<Links href="//server-create-and-configure" summary="了解如何根據您的應用程式部署需求建立伺服器。">建立伺服器</Links>的方式。
            您可以透過以下方式之一指定應用程式主類別 (main class)：
        </p>
        <list>
            <li>
                <p>
                    如果您使用 <a href="#embedded-server">embeddedServer</a>，請按如下方式指定主類別：
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
                    如果您使用 <a href="#engine-main">EngineMain</a>，您需要將其配置為主類別。
                    對於 Netty，它將如下所示：
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
                如果您打算將應用程式封裝為 Fat JAR，則在配置相應的外掛程式時，還需要考慮建立伺服器的方式。
                請從以下主題中了解更多資訊：
            </p>
            <list>
                <li>
                    <p>
                        <Links href="//server-fatjar" summary="了解如何使用 Ktor Gradle 外掛程式建立並執行可執行的 fat JAR。">使用 Ktor Gradle 外掛程式建立 fat JAR</Links>
                    </p>
                </li>
                <li>
                    <p>
                        <Links href="//maven-assembly-plugin" summary="範例專案：tutorial-server-get-started-maven">使用 Maven Assembly 外掛程式建立 fat JAR</Links>
                    </p>
                </li>
            </list>
        </note>
    </chapter>
</topic>