<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="文件中的配置"
       id="server-configuration-file" help-id="Configuration-file;server-configuration-in-file">
<show-structure for="chapter" depth="2"/>
<link-summary>
    了解如何在配置文件中配置各种服务器参数。
</link-summary>
<p>
    Ktor 允许你配置各种服务器参数，例如主机地址和端口、
    <Links href="/ktor/server-modules" summary="模块允许你通过路由分组来组织应用程序。">模块</Links>
    加载等。
    配置方式取决于你创建服务器的方式，即
    <Links href="/ktor/server-create-and-configure" summary="了解如何根据应用程序部署需求创建服务器。">
        embeddedServer 或 EngineMain
    </Links>
    。
</p>
<p>
    对于 <code>EngineMain</code>，Ktor 从使用
    <a href="https://github.com/lightbend/config/blob/master/HOCON.md">
        HOCON
    </a>
    或 YAML 格式的配置文件加载其配置。这种方式提供了更大的灵活性来配置服务器，并允许你在不重新编译应用程序的情况下更改配置。此外，你可以从命令行运行应用程序，并通过传递相应的
    <a href="#command-line">
        命令行
    </a>
    实参来覆盖所需的服务器参数。
</p>
<chapter title="概述" id="configuration-file-overview">
    <p>
        如果你使用
        <a href="#engine-main">
            EngineMain
        </a>
        启动服务器，Ktor 会自动从位于
        <Path>resources</Path>
        目录中的名为
        <Path>application.*</Path>
        的文件加载配置设置。支持两种配置格式：
    </p>
    <list>
        <li>
            <p>
                HOCON (
                <Path>application.conf</Path>
                )
            </p>
        </li>
        <li>
            <p>
                YAML (
                <Path>application.yaml</Path>
                )
            </p>
            <note>
                <p>
                    要使用 YAML 配置文件，你需要添加 <code>ktor-server-config-yaml</code>
                    <Links href="/ktor/server-dependencies" summary="了解如何向现有的 Gradle/Maven 项目添加 Ktor Server 依赖项。">
                        依赖项
                    </Links>
                    。
                </p>
            </note>
        </li>
    </list>
    <p>
        配置文件中应至少包含使用 <code>ktor.application.modules</code> 属性指定的
        <Links href="/ktor/server-modules" summary="模块允许你通过路由分组来组织应用程序。">
            要加载的模块
        </Links>
        ，例如：
    </p>
    <tabs group="config">
        <tab title="application.conf" group-key="hocon" id="application-conf-2">
            <code-block lang="shell" code="ktor {&#10;    application {&#10;        modules = [ com.example.ApplicationKt.module ]&#10;    }&#10;}"/>
        </tab>
        <tab title="application.yaml" group-key="yaml" id="application-yaml-2">
            <code-block lang="yaml" code="ktor:&#10;    application:&#10;        modules:&#10;            - com.example.ApplicationKt.module"/>
        </tab>
    </tabs>
    <p>
        在这种情况下，Ktor 会调用以下
        <Path>Application.kt</Path>
        文件中的 <code>Application.module</code> 函数：
    </p>
    <code-block lang="kotlin" code="package com.example&#10;&#10;import io.ktor.server.application.*&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;&#10;fun main(args: Array&lt;String&gt;): Unit = io.ktor.server.netty.EngineMain.main(args)&#10;&#10;fun Application.module() {&#10;    routing {&#10;        get(&quot;/&quot;) {&#10;            call.respondText(&quot;Hello, world!&quot;)&#10;        }&#10;    }&#10;}"/>
    <p>
        除了要加载的模块之外，你还可以配置各种服务器设置，包括
        <a href="#predefined-properties">预定义的</a>
        （例如端口或主机、SSL 设置等）和自定义设置。
        让我们看几个例子。
    </p>
    <chapter title="基本配置" id="config-basic">
        <p>
            在下面的示例中，服务器侦听端口使用 <code>ktor.deployment.port</code> 属性设置为 <code>8080</code>。
        </p>
        <tabs group="config">
            <tab title="application.conf" group-key="hocon" id="application-conf-3">
                <code-block lang="shell" code="ktor {&#10;    deployment {&#10;        port = 8080&#10;    }&#10;    application {&#10;        modules = [ com.example.ApplicationKt.module ]&#10;    }&#10;}"/>
            </tab>
            <tab title="application.yaml" group-key="yaml" id="application-yaml-3">
                <code-block lang="yaml" code="ktor:&#10;    deployment:&#10;        port: 8080&#10;    application:&#10;        modules:&#10;            - com.example.ApplicationKt.module"/>
            </tab>
        </tabs>
    </chapter>
    <chapter title="引擎配置" id="config-engine">
        <snippet id="engine-main-configuration">
            <p>
                如果你使用 <code>EngineMain</code>，可以在 <code>ktor.deployment</code> 组中指定所有引擎通用的选项。
            </p>
            <tabs group="config">
                <tab title="application.conf" group-key="hocon" id="engine-main-conf">
                    <code-block lang="shell" code="                            ktor {&#10;                                deployment {&#10;                                    connectionGroupSize = 2&#10;                                    workerGroupSize = 5&#10;                                    callGroupSize = 10&#10;                                    shutdownGracePeriod = 2000&#10;                                    shutdownTimeout = 3000&#10;                                }&#10;                            }"/>
                </tab>
                <tab title="application.yaml" group-key="yaml" id="engine-main-yaml">
                    <code-block lang="yaml" code="                           ktor:&#10;                               deployment:&#10;                                   connectionGroupSize: 2&#10;                                   workerGroupSize: 5&#10;                                   callGroupSize: 10&#10;                                   shutdownGracePeriod: 2000&#10;                                   shutdownTimeout: 3000"/>
                </tab>
            </tabs>
            <chapter title="Netty" id="netty-file">
                <p>
                    你还可以在配置文件中 <code>ktor.deployment</code> 组内配置 Netty 特有的选项：
                </p>
                <tabs group="config">
                    <tab title="application.conf" group-key="hocon" id="application-conf-1">
                        <code-block lang="shell" code="                               ktor {&#10;                                   deployment {&#10;                                       maxInitialLineLength = 2048&#10;                                       maxHeaderSize = 1024&#10;                                       maxChunkSize = 42&#10;                                   }&#10;                               }"/>
                    </tab>
                    <tab title="application.yaml" group-key="yaml" id="application-yaml-1">
                        <code-block lang="yaml" code="                               ktor:&#10;                                   deployment:&#10;                                       maxInitialLineLength: 2048&#10;                                       maxHeaderSize: 1024&#10;                                       maxChunkSize: 42"/>
                    </tab>
                </tabs>
            </chapter>
        </snippet>
    </chapter>
    <chapter title="SSL 配置" id="config-ssl">
        <p>
            下面的示例使 Ktor 能够侦听 <code>8443</code> SSL 端口，并在单独的 <code>security</code> 代码块中指定所需的
            <Links href="/ktor/server-ssl" summary="所需依赖项：io.ktor:ktor-network-tls-certificates 代码示例：ssl-engine-main, ssl-embedded-server">
                SSL 设置
            </Links>
            。
        </p>
        <tabs group="config">
            <tab title="application.conf" group-key="hocon" id="application-conf">
                <code-block lang="shell" code="ktor {&#10;    deployment {&#10;        port = 8080&#10;        sslPort = 8443&#10;    }&#10;    application {&#10;        modules = [ com.example.ApplicationKt.module ]&#10;    }&#10;&#10;    security {&#10;        ssl {&#10;            keyStore = keystore.jks&#10;            keyAlias = sampleAlias&#10;            keyStorePassword = foobar&#10;            privateKeyPassword = foobar&#10;        }&#10;    }&#10;}"/>
            </tab>
            <tab title="application.yaml" group-key="yaml" id="application-yaml">
                <code-block lang="yaml" code="ktor:&#10;    deployment:&#10;        port: 8080&#10;        sslPort: 8443&#10;    application:&#10;        modules:&#10;            - com.example.ApplicationKt.module&#10;&#10;    security:&#10;        ssl:&#10;            keyStore: keystore.jks&#10;            keyAlias: sampleAlias&#10;            keyStorePassword: foobar&#10;            privateKeyPassword: foobar"/>
            </tab>
        </tabs>
    </chapter>
    <chapter title="自定义配置" id="config-custom">
        <p>
            除了指定<a href="#predefined-properties">预定义属性</a>之外，
            Ktor 允许你在配置文件中保留自定义设置。
            下面的配置文件包含一个用于保存
            <a href="#jwt-settings">JWT</a>
            设置的自定义 <code>jwt</code> 组。
        </p>
        <tabs group="config">
            <tab title="application.conf" group-key="hocon" id="application-conf-4">
                <code-block lang="shell" code="ktor {&#10;    deployment {&#10;        port = 8080&#10;    }&#10;&#10;    application {&#10;        modules = [ com.example.ApplicationKt.main ]&#10;    }&#10;}&#10;&#10;jwt {&#10;    secret = &quot;secret&quot;&#10;    issuer = &quot;http://0.0.0.0:8080/&quot;&#10;    audience = &quot;http://0.0.0.0:8080/hello&quot;&#10;    realm = &quot;Access to 'hello'&quot;&#10;}"/>
            </tab>
            <tab title="application.yaml" group-key="yaml" id="application-yaml-4">
                <code-block lang="yaml" code="ktor:&#10;    deployment:&#10;        port: 8080&#10;    application:&#10;        modules:&#10;            - com.example.ApplicationKt.main&#10;&#10;jwt:&#10;    secret: &quot;secret&quot;&#10;    issuer: &quot;http://0.0.0.0:8080/&quot;&#10;    audience: &quot;http://0.0.0.0:8080/hello&quot;&#10;    realm: &quot;Access to 'hello'&quot;"/>
            </tab>
        </tabs>
        <p>
            你可以在代码中<a href="#read-configuration-in-code">读取和处理此类设置</a>。
        </p>
        <warning>
            <p>
                请注意，敏感数据（如密钥、数据库连接设置等）不应以纯文本形式存储在配置文件中。请考虑使用
                <a href="#environment-variables">
                    环境变量
                </a>
                来指定此类参数。
            </p>
        </warning>
    </chapter>
</chapter>
<chapter title="预定义属性" id="predefined-properties">
    <p>
        以下是可以在<a href="#configuration-file-overview">配置文件</a>中使用的预定义设置列表。
    </p>
    <deflist type="wide">
        <def title="ktor.deployment.host" id="ktor-deployment-host">
            <p>
                主机地址。
            </p>
            <p>
                <emphasis>示例</emphasis>
                : <code>0.0.0.0</code>
            </p>
        </def>
        <def title="ktor.deployment.port" id="ktor-deployment-port">
            <p>
                侦听端口。你可以将此属性设置为 <code>0</code>，以便在随机端口上运行服务器。
            </p>
            <p>
                <emphasis>示例</emphasis>
                : <code>8080</code>, <code>0</code>
            </p>
        </def>
        <def title="ktor.deployment.sslPort" id="ktor-deployment-ssl-port">
            <p>
                侦听 SSL 端口。你可以将此属性设置为 <code>0</code>，以便在随机端口上运行服务器。
            </p>
            <p>
                <emphasis>示例</emphasis>
                : <code>8443</code>, <code>0</code>
            </p>
            <note>
                <p>
                    请注意，SSL 需要<a href="#ssl">下面列出的</a>额外选项。
                </p>
            </note>
        </def>
        <def title="ktor.deployment.watch" id="ktor-deployment-watch">
            <p>
                用于<a href="#watch-paths">自动重新加载</a>的监听路径。
            </p>
        </def>
        <def title="ktor.deployment.rootPath" id="ktor-deployment-root-path">
            <p>
                一个<Links href="/ktor/server-war" summary="了解如何使用 WAR 归档在 Servlet 容器中运行和部署 Ktor 应用程序。">servlet</Links>上下文路径。
            </p>
            <p>
                <emphasis>示例</emphasis>
                : <code>/</code>
            </p>
        </def>
        <def title="ktor.deployment.shutdown.url" id="ktor-deployment-shutdown-url">
            <p>
                一个关闭 URL。
                请注意，此选项使用<Links href="/ktor/server-shutdown-url" summary="代码示例： %example_name%">关闭 URL</Links> 插件。
            </p>
        </def>
        <def title="ktor.deployment.shutdownGracePeriod" id="ktor-deployment-shutdown-grace-period">
            <p>
                服务器停止接受新请求的最长时间（以毫秒为单位）。
            </p>
        </def>
        <def title="ktor.deployment.shutdownTimeout" id="ktor-deployment-shutdown-timeout">
            <p>
                等待服务器完全停止的最长时间（以毫秒为单位）。
            </p>
        </def>
        <def title="ktor.deployment.callGroupSize" id="ktor-deployment-call-group-size">
            <p>
                用于处理应用程序调用的线程池的最小大小。
            </p>
        </def>
        <def title="ktor.deployment.connectionGroupSize" id="ktor-deployment-connection-group-size">
            <p>
                用于接受新连接并启动调用处理的线程数。
            </p>
        </def>
        <def title="ktor.deployment.workerGroupSize" id="ktor-deployment-worker-group-size">
            <p>
                用于处理连接、解析消息和执行引擎内部工作的事件组的大小。
            </p>
        </def>
    </deflist>
    <p id="ssl">
        如果你设置了 <code>ktor.deployment.sslPort</code>，则需要指定以下
        <Links href="/ktor/server-ssl" summary="所需依赖项：io.ktor:ktor-network-tls-certificates 代码示例：ssl-engine-main, ssl-embedded-server">
            SSL 特有的
        </Links>
        属性：
    </p>
    <deflist type="wide">
        <def title="ktor.security.ssl.keyStore" id="ktor-security-ssl-keystore">
            <p>
                一个 SSL 密钥库。
            </p>
        </def>
        <def title="ktor.security.ssl.keyAlias" id="ktor-security-ssl-key-alias">
            <p>
                SSL 密钥库的别名。
            </p>
        </def>
        <def title="ktor.security.ssl.keyStorePassword" id="ktor-security-ssl-keystore-password">
            <p>
                SSL 密钥库的密码。
            </p>
        </def>
        <def title="ktor.security.ssl.privateKeyPassword" id="ktor-security-ssl-private-key-password">
            <p>
                SSL 私钥的密码。
            </p>
        </def>
    </deflist>
</chapter>
<chapter title="环境变量" id="environment-variables">
    <p>
        在配置文件中，你可以使用 <code>${ENV}</code> / <code>$ENV</code> 语法将参数替换为环境变量。
        例如，你可以通过以下方式将 <code>PORT</code> 环境变量赋值给 <code>ktor.deployment.port</code> 属性：
    </p>
    <tabs group="config">
        <tab title="application.conf" group-key="hocon" id="env-var-conf">
            <code-block lang="shell" code="                    ktor {&#10;                        deployment {&#10;                            port = ${PORT}&#10;                        }&#10;                    }"/>
        </tab>
        <tab title="application.yaml" group-key="yaml" id="env-var-yaml">
            <code-block lang="yaml" code="                    ktor:&#10;                        deployment:&#10;                            port: $PORT"/>
        </tab>
    </tabs>
    <p>
        在这种情况下，环境变量值将用于指定侦听端口。
        如果 <code>PORT</code> 环境变量在运行时不存在，你可以按如下方式提供默认端口值：
    </p>
    <tabs group="config">
        <tab title="application.conf" group-key="hocon" id="config-conf">
            <code-block lang="shell" code="                    ktor {&#10;                        deployment {&#10;                            port = 8080&#10;                            port = ${?PORT}&#10;                        }&#10;                    }"/>
        </tab>
        <tab title="application.yaml" group-key="yaml" id="config-yaml">
            <code-block lang="yaml" code="                    ktor:&#10;                        deployment:&#10;                            port: &quot;$PORT:8080&quot;"/>
        </tab>
    </tabs>
</chapter>
<chapter title="在代码中读取配置" id="read-configuration-in-code">
    <p>
        Ktor 允许你访问配置文件中指定的属性值。
        例如，如果你指定了 <code>ktor.deployment.port</code> 属性，...
    </p>
    <tabs group="config">
        <tab title="application.conf" group-key="hocon" id="config-conf-1">
            <code-block lang="shell" code="                    ktor {&#10;                        deployment {&#10;                            port = 8080&#10;                        }&#10;                    }"/>
        </tab>
        <tab title="application.yaml" group-key="yaml" id="config-yaml-1">
            <code-block lang="yaml" code="                    ktor:&#10;                        deployment:&#10;                            port: 8080"/>
        </tab>
    </tabs>
    <p>
        ... 你可以使用
        <a href="https://api.ktor.io/ktor-server/ktor-server-core/io.ktor.server.application/-application-environment/config.html">
            ApplicationEnvironment.config
        </a>
        访问应用程序的配置，并按以下方式获取所需的属性值：
    </p>
    <code-block lang="kotlin" code="            import io.ktor.server.application.*&#10;            import io.ktor.server.response.*&#10;            import io.ktor.server.routing.*&#10;&#10;            fun Application.module() {&#10;                val port = environment.config.propertyOrNull(&quot;ktor.deployment.port&quot;)?.getString() ?: &quot;8080&quot;&#10;                routing {&#10;                    get {&#10;                        call.respondText(&quot;Listening on port $port&quot;)&#10;                    }&#10;                }&#10;            }"/>
    <p>
        当你将<a href="#custom-property">自定义设置</a>保存在配置文件中并需要访问其值时，这尤其有用。
    </p>
</chapter>
<chapter title="命令行" id="command-line">
    <p>
        如果你使用<a href="#engine-main">EngineMain</a>创建服务器，你可以从命令行运行<Links href="/ktor/server-fatjar" summary="了解如何使用 Ktor Gradle 插件创建和运行可执行 fat JAR。">打包好的应用程序</Links>，并通过传递相应的命令行实参来覆盖所需的服务器参数。例如，你可以通过以下方式覆盖配置文件中指定的端口：
    </p>
    <code-block lang="shell" code="            java -jar sample-app.jar -port=8080"/>
    <p>
        可用命令行选项如下：
    </p>
    <deflist type="narrow">
        <def title="-jar" id="jar">
            <p>
                JAR 文件的路径。
            </p>
        </def>
        <def title="-config" id="config">
            <p>
                自定义配置文件的路径，用于替代 resources 中的
                <Path>application.conf</Path>
                /
                <Path>application.yaml</Path>
                。
            </p>
            <p>
                <emphasis>示例</emphasis>
                : <code>java -jar sample-app.jar -config=anotherfile.conf</code>
            </p>
            <p>
                <emphasis>注意</emphasis>
                : 你可以传递多个值。 <code>java -jar sample-app.jar -config=config-base.conf
                -config=config-dev.conf</code>。在这种情况下，所有配置都将合并，其中右侧配置中的值具有更高优先级。
            </p>
        </def>
        <def title="-host" id="host">
            <p>
                主机地址。
            </p>
        </def>
        <def title="-port" id="port">
            <p>
                侦听端口。
            </p>
        </def>
        <def title="-watch" id="watch">
            <p>
                用于<a href="#watch-paths">自动重新加载</a>的监听路径。
            </p>
        </def>
    </deflist>
    <p>
        <Links href="/ktor/server-ssl" summary="所需依赖项：io.ktor:ktor-network-tls-certificates 代码示例：ssl-engine-main, ssl-embedded-server">SSL 特有的</Links>选项：
    </p>
    <deflist type="narrow">
        <def title="-sslPort" id="ssl-port">
            <p>
                侦听 SSL 端口。
            </p>
        </def>
        <def title="-sslKeyStore" id="ssl-keystore">
            <p>
                一个 SSL 密钥库。
            </p>
        </def>
    </deflist>
    <p>
        如果你需要覆盖没有相应命令行选项的<a href="#predefined-properties">预定义属性</a>，请使用 <code>-P</code> 标志，例如：
    </p>
    <code-block code="            java -jar sample-app.jar -P:ktor.deployment.callGroupSize=7"/>
    <p>
        你还可以使用 <code>-P</code> 标志来覆盖<a href="#config-custom">自定义属性</a>。
    </p>
</chapter>
<chapter title="示例：如何使用自定义属性指定环境" id="custom-property">
    <p>
        你可能希望根据服务器是在本地运行还是在生产机器上运行来执行不同的操作。为此，你可以在
        <Path>application.conf</Path>
        /
        <Path>application.yaml</Path>
        中添加一个自定义属性，并使用一个专用<a href="#environment-variables">环境变量</a>对其进行初始化，该变量的值取决于服务器是在本地运行还是在生产环境中运行。在下面的示例中，<code>KTOR_ENV</code> 环境变量被赋值给自定义的 <code>ktor.environment</code> 属性。
    </p>
    <tabs group="config">
        <tab title="application.conf" group-key="hocon" id="application-conf-5">
            <code-block code="ktor {&#10;    environment = ${?KTOR_ENV}&#10;}"/>
        </tab>
        <tab title="application.yaml" group-key="yaml" id="application-yaml-5">
            <code-block lang="yaml" code="ktor:&#10;                environment: $?KTOR_ENV"/>
        </tab>
    </tabs>
    <p>
        你可以在运行时通过<a href="#read-configuration-in-code">在代码中读取配置</a>来访问 <code>ktor.environment</code> 值并执行所需操作：
    </p>
    <code-block lang="kotlin" code="import io.ktor.server.application.*&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;&#10;fun Application.module() {&#10;    val env = environment.config.propertyOrNull(&quot;ktor.environment&quot;)?.getString()&#10;    routing {&#10;        get {&#10;            call.respondText(when (env) {&#10;                &quot;dev&quot; -&gt; &quot;Development&quot;&#10;                &quot;prod&quot; -&gt; &quot;Production&quot;&#10;                else -&gt; &quot;...&quot;&#10;            })&#10;        }&#10;    }&#10;}"/>
    <p>
        你可以在此处找到完整示例：
        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/engine-main-custom-environment">
            engine-main-custom-environment
        </a>。
    </p>
</chapter>
</topic>