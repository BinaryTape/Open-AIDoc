<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="添加服务器依赖项"
       id="server-dependencies" help-id="Gradle">
    <show-structure for="chapter" depth="2"/>
    <link-summary>了解如何向现有的 Gradle/Maven 项目中添加 Ktor Server 依赖项。</link-summary>
    <p>
        在本主题中，我们将向您展示如何向现有的 Gradle/Maven 项目中添加 Ktor Server 所需的依赖项。
    </p>
    <chapter title="配置仓库" id="repositories">
        <p>
            在添加 Ktor 依赖项之前，您需要为该项目配置仓库：
        </p>
        <list>
            <li>
                <p>
                    <control>生产版</control>
                </p>
                <p>
                    Ktor 的生产版本可在 Maven 中央仓库中获取。
                    您可以按如下方式在构建脚本中声明此仓库：
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
                                您不需要在 <Path>pom.xml</Path> 文件中添加 Maven 中央仓库，因为您的项目会从 <a href="https://maven.apache.org/guides/introduction/introduction-to-the-pom.html#super-pom">Super POM</a> 继承该中央仓库。
                            </p>
                        </note>
                    </TabItem>
                </Tabs>
            </li>
            <li>
                <p>
                    <control>抢先体验计划 (EAP)</control>
                </p>
                <p>
                    要访问 Ktor 的 <a href="https://ktor.io/eap/">EAP</a> 版本，您需要引用 <a href="https://redirector.kotlinlang.org/maven/ktor-eap/io/ktor/">Space 仓库</a>：
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
                    请注意，Ktor EAP 可能需要 <a href="https://redirector.kotlinlang.org/maven/dev">Kotlin 开发仓库</a>：
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
    <chapter title="添加依赖项" id="add-ktor-dependencies">
        <chapter title="核心依赖项" id="core-dependencies">
            <p>
                每个 Ktor 应用程序至少需要以下依赖项：
            </p>
            <list>
                <li>
                    <p>
                        <code>ktor-server-core</code>：包含 Ktor 核心功能。
                    </p>
                </li>
                <li>
                    <p>
                        一个<Links href="//server-engines" summary="了解处理网络请求的引擎。">引擎</Links>（例如 <code>ktor-server-netty</code>）的依赖项。
                    </p>
                </li>
            </list>
            <p>
                针对不同的平台，Ktor 提供了带有后缀（如 <code>-jvm</code>）的平台特定构件，例如 <code>ktor-server-core-jvm</code> 或 <code>ktor-server-netty-jvm</code>。
                请注意，Gradle 会解析适用于给定平台的构件，而 Maven 则不支持此功能。
                这意味着对于 Maven，您需要手动添加平台特定后缀。
                一个基础 Ktor 应用程序的 <code>dependencies</code> 块可能如下所示：
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
        <chapter title="日志依赖项" id="logging-dependency">
            <p>
                Ktor 使用 SLF4J API 作为各种日志框架（例如 Logback 或 Log4j）的门面，并允许您记录应用程序事件。
                要了解如何添加所需的构件，请参阅<a href="server-logging.md#add_dependencies">添加记录器依赖项</a>。
            </p>
        </chapter>
        <chapter title="插件依赖项" id="plugin-dependencies">
            <p>
                扩展 Ktor 功能的<Links href="//server-plugins" summary="插件提供了通用功能，例如序列化、内容编码、压缩等。">插件</Links>可能需要额外的依赖项。
                您可以从相应主题中了解更多信息。
            </p>
        </chapter>
    </chapter>
    <var name="target_module" value="server"/>
    <chapter title="确保 Ktor 版本一致性" id="ensure-version-consistency">
        <chapter id="using-gradle-plugin" title="使用 Ktor Gradle 插件">
            <p>
                应用 <a href="https://github.com/ktorio/ktor-build-plugins">Ktor Gradle 插件</a>会隐式添加 Ktor BOM 依赖项，并允许您确保所有 Ktor 依赖项的版本一致。在这种情况下，在依赖 Ktor 构件时，您不再需要指定版本：
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
        <chapter id="using-version-catalog" title="使用发布的版本目录">
            <p>
                您还可以通过使用发布的版本目录来集中管理 Ktor 依赖项声明。
                此方法具有以下优点：
            </p>
            <list id="published-version-catalog-benefits">
                <li>
                    无需在您自己的目录中手动声明 Ktor 版本。
                </li>
                <li>
                    在单个命名空间下公开每个 Ktor 模块。
                </li>
            </list>
            <p>
                要声明目录，请在 <Path>settings.gradle.kts</Path> 中创建一个具有您所选名称的版本目录：
            </p>
            <code-block lang="kotlin" code="                dependencyResolutionManagement {&#10;                    versionCatalogs {&#10;                        create(&quot;ktorLibs&quot;) {&#10;                            from(&quot;io.ktor:ktor-version-catalog:%ktor_version%&quot;)&#10;                        }&#10;                    }&#10;                }"/>
            <p>
                然后，您可以通过引用目录名称在模块的 <Path>build.gradle.kts</Path> 中添加依赖项：
            </p>
            <code-block lang="kotlin" code="                dependencies {&#10;                    implementation(ktorLibs.%target_module%.core)&#10;                    // ...&#10;                }"/>
        </chapter>
    </chapter>
    <chapter title="创建运行应用程序的入口点" id="create-entry-point">
        <p>
            使用 Gradle/Maven <Links href="//server-run" summary="了解如何运行服务器 Ktor 应用程序。">运行</Links> Ktor 服务器取决于<Links href="//server-create-and-configure" summary="了解如何根据您的应用程序部署需求创建服务器。">创建服务器</Links>的方式。
            您可以通过以下方式之一指定应用程序主类：
        </p>
        <list>
            <li>
                <p>
                    如果您使用 <a href="#embedded-server">embeddedServer</a>，请按如下方式指定主类：
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
                    如果您使用 <a href="#engine-main">EngineMain</a>，则需要将其配置为主类。
                    对于 Netty，它将如下所示：
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
                如果您打算将应用程序打包为 Fat JAR，那么在配置相应插件时，您还需要考虑创建服务器的方式。
                请通过以下主题了解更多信息：
            </p>
            <list>
                <li>
                    <p>
                        <Links href="//server-fatjar" summary="了解如何使用 Ktor Gradle 插件创建和运行可执行的 Fat JAR。">使用 Ktor Gradle 插件创建 Fat JAR</Links>
                    </p>
                </li>
                <li>
                    <p>
                        <Links href="//maven-assembly-plugin" summary="示例项目：tutorial-server-get-started-maven">使用 Maven Assembly 插件创建 Fat JAR</Links>
                    </p>
                </li>
            </list>
        </note>
    </chapter>
</topic>