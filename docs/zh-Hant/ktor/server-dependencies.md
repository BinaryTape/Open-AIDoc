<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="新增伺服器依賴項"
       id="server-dependencies" help-id="Gradle">
<show-structure for="chapter" depth="2"/>
<link-summary>學習如何將 Ktor 伺服器依賴項新增至現有的 Gradle/Maven 專案。</link-summary>
<p>
    在本主題中，我們將向您展示如何將 Ktor 伺服器所需的依賴項新增至現有的 Gradle/Maven 專案。
</p>
<chapter title="配置儲存庫" id="repositories">
    <p>
        在新增 Ktor 依賴項之前，您需要為此專案配置儲存庫：
    </p>
    <list>
        <li>
            <p>
                <control>生產版本</control>
            </p>
            <p>
                Ktor 的生產版本可在 Maven 中央儲存庫中找到。
                您可以在建置腳本中如此聲明此儲存庫：
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
                            您無需在 <Path>pom.xml</Path> 檔案中新增 Maven 中央儲存庫，因為您的專案會從
                            <a href="https://maven.apache.org/guides/introduction/introduction-to-the-pom.html#super-pom">Super POM</a> 繼承中央儲存庫。
                        </p>
                    </note>
                </tab>
            </tabs>
        </li>
        <li>
            <p>
                <control>搶先體驗計畫 (EAP)</control>
            </p>
            <p>
                若要存取 Ktor 的 <a href="https://ktor.io/eap/">EAP</a> 版本，您需要引用 <a href="https://maven.pkg.jetbrains.space/public/p/ktor/eap/io/ktor/">Space 儲存庫</a>：
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
                請注意，Ktor EAP 可能需要 <a href="https://maven.pkg.jetbrains.space/kotlin/p/kotlin/dev">Kotlin 開發儲存庫</a>：
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
<chapter title="新增依賴項" id="add-ktor-dependencies">
    <chapter title="核心依賴項" id="core-dependencies">
        <p>
            每個 Ktor 應用程式至少需要以下依賴項：
        </p>
        <list>
            <li>
                <p>
                    <code>ktor-server-core</code>：包含 Ktor 核心功能。
                </p>
            </li>
            <li>
                <p>
                    一個用於<Links href="/ktor/server-engines" summary="了解處理網路請求的引擎。">引擎</Links>的依賴項（例如，<code>ktor-server-netty</code>）。
                </p>
            </li>
        </list>
        <p>
            針對不同的平台，Ktor 提供了帶有 <code>-jvm</code> 等字尾的平台特定構件 (artifacts)，例如 <code>ktor-server-core-jvm</code> 或 <code>ktor-server-netty-jvm</code>。
            請注意，Gradle 會解析適合指定平台的構件，而 Maven 不支援此功能。
            這表示對於 Maven，您需要手動新增平台特定字尾。
            基本 Ktor 應用程式的 <code>dependencies</code> 區塊可能如下所示：
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
    <chapter title="記錄依賴項" id="logging-dependency">
        <p>
            Ktor 使用 SLF4J API 作為各種記錄框架（例如 Logback 或 Log4j）的門面 (facade)，並允許您記錄應用程式事件。
            若要了解如何新增所需的構件，請參閱<a href="server-logging.md#add_dependencies">新增記錄器依賴項</a>。
        </p>
    </chapter>
    <chapter title="插件依賴項" id="plugin-dependencies">
        <p>
            擴展 Ktor 功能的<Links href="/ktor/server-plugins" summary="插件提供常見功能，例如序列化、內容編碼、壓縮等等。">插件</Links>可能需要額外的依賴項。
            您可以從相應的主題中了解更多資訊。
        </p>
    </chapter>
</chapter>
<var name="target_module" value="server"/>
<chapter title="確保 Ktor 版本一致性" id="ensure-version-consistency">
    <chapter id="using-gradle-plugin" title="使用 Ktor Gradle 插件">
        <p>
            套用 <a href="https://github.com/ktorio/ktor-build-plugins">Ktor Gradle 插件</a>
            會隱式新增 Ktor BOM 依賴項，並讓您確保所有 Ktor 依賴項都處於
            相同版本。在這種情況下，您在依賴 Ktor
            構件時不再需要指定版本：
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
    <chapter id="using-version-catalog" title="使用已發佈的版本目錄">
        <p>
            您也可以透過使用已發佈的版本目錄來集中管理 Ktor 依賴項聲明。
            這種方法提供以下好處：
        </p>
        <list id="published-version-catalog-benefits">
            <li>
                無需在您自己的目錄中手動聲明 Ktor 版本。
            </li>
            <li>
                將每個 Ktor 模組公開在單一命名空間下。
            </li>
        </list>
        <p>
            若要聲明此目錄，請在
            <Path>settings.gradle.kts</Path>
            中建立一個您選擇名稱的版本目錄：
        </p>
        <code-block lang="kotlin" code="                dependencyResolutionManagement {&#10;                    versionCatalogs {&#10;                        create(&quot;ktorLibs&quot;) {&#10;                            from(&quot;io.ktor:ktor-version-catalog:%ktor_version%&quot;)&#10;                        }&#10;                    }&#10;                }"/>
        <p>
            然後，您可以透過引用目錄名稱，在模組的
            <Path>build.gradle.kts</Path>
            中新增依賴項：
        </p>
        <code-block lang="kotlin" code="                dependencies {&#10;                    implementation(ktorLibs.%target_module%.core)&#10;                    // ...&#10;                }"/>
    </chapter>
</chapter>
<chapter title="建立應用程式執行入口點" id="create-entry-point">
    <p>
        使用 Gradle/Maven <Links href="/ktor/server-run" summary="了解如何執行伺服器 Ktor 應用程式。">執行</Links> Ktor 伺服器取決於<Links href="/ktor/server-create-and-configure" summary="了解如何根據您的應用程式部署需求建立伺服器。">建立伺服器</Links>的方式。
        您可以透過以下方式之一指定應用程式主類別：
    </p>
    <list>
        <li>
            <p>
                如果您使用 <a href="#embedded-server">embeddedServer</a>，請如此指定主類別：
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
                如果您使用 <a href="#engine-main">EngineMain</a>，則需要將其配置為主類別。
                對於 Netty，它將如下所示：
            </p>
            <tabs group="languages">
                <tab title="Gradle (Kotlin)" group-key="kotlin">
                    <code-block lang="Kotlin" code="                            application {&#10;                                mainClass.set(&quot;io.ktor.server.netty.EngineMain&quot;)&#10;                            }"/>
                </tab>
                <tab title="Gradle (Groovy)" group-key="groovy">
                    <code-block lang="Groovy" code="                            application {&#10;                                mainClass = &quot;io.ktor.server.netty.EngineMain&quot;&#10;                            }"/>
                </tab>
                <tab title="Maven" group-key="maven">
                    <code-block lang="XML" code="                            &lt;properties&gt;&#10;                                &lt;main.class&gt;io.ktor.server.netty.EngineMain&lt;/main.class&gt;&#10;                            &lt;/properties&gt;"/>
                </tab>
            </tabs>
        </li>
    </list>
    <note>
        <p>
            如果您打算將應用程式打包為 Fat JAR，則在配置相應插件時，還需要考慮建立伺服器的方式。
            從以下主題了解更多資訊：
        </p>
        <list>
            <li>
                <p>
                    <Links href="/ktor/server-fatjar" summary="了解如何使用 Ktor Gradle 插件建立並執行可執行 Fat JAR。">使用 Ktor Gradle 插件建立 Fat JAR</Links>
                </p>
            </li>
            <li>
                <p>
                    <Links href="/ktor/maven-assembly-plugin" summary="範例專案：tutorial-server-get-started-maven">使用 Maven Assembly 插件建立 Fat JAR</Links>
                </p>
            </li>
        </list>
    </note>
</chapter>
</topic>