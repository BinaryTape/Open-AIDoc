<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="檔案中的組態"
       id="server-configuration-file" help-id="Configuration-file;server-configuration-in-file">
    <show-structure for="chapter" depth="2"/>
    <link-summary>
        了解如何在組態檔案中配置各種伺服器參數。
    </link-summary>
    <p>
        Ktor 允許您配置各種伺服器參數，例如主機位址與連接埠、要載入的
        <Links href="/ktor/server-modules" summary="模組允許您透過分組路由來建構應用程式。">模組</Links>
        等等。
        組態取決於您建立伺服器的方式 —— 
        <Links href="/ktor/server-create-and-configure" summary="了解如何根據您的應用程式部署需求建立伺服器。">
            embeddedServer 或 EngineMain
        </Links>
        。
    </p>
    <p>
        對於 <code>EngineMain</code>，Ktor 會從使用 
        <a href="https://github.com/lightbend/config/blob/master/HOCON.md">
            HOCON
        </a>
        或 YAML 格式的組態檔案中載入其組態。這種方式為配置伺服器提供了更大的靈活性，並允許您在不重新編譯應用程式的情況下更改組態。此外，您可以從命令列執行應用程式，並透過傳遞對應的
        <a href="#command-line">
            命令列
        </a>
        引數來覆寫所需的伺服器參數。
    </p>
    <chapter title="概覽" id="configuration-file-overview">
        <p>
            如果您使用 
            <a href="#engine-main">
                EngineMain
            </a>
            來啟動伺服器，Ktor 會自動從位於 
            <Path>resources</Path>
            目錄中名為 
            <Path>application.*</Path>
            的檔案載入組態設定。支援兩種組態格式：
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
                        要使用 YAML 組態檔案，您需要新增 <code>ktor-server-config-yaml</code> 
                        <Links href="/ktor/server-dependencies" summary="了解如何將 Ktor 伺服器相依性新增至現有的 Gradle/Maven 專案。">
                            相依性
                        </Links>
                        。
                    </p>
                </note>
                <warning>
                    目前 Maven 型 Ktor 專案不支援 YAML 組態。
                </warning>
            </li>
        </list>
        <p>
            組態檔案應至少包含使用 <code>ktor.application.modules</code> 屬性指定的
            <Links href="/ktor/server-modules" summary="模組允許您透過分組路由來建構應用程式。">
                要載入的模組
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
            在這種情況下，Ktor 會呼叫下方 
            <Path>Application.kt</Path>
            檔案中的 <code>Application.module</code> 函式：
        </p>
        <code-block lang="kotlin" code="package com.example&#10;&#10;import io.ktor.server.application.*&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;&#10;fun main(args: Array&lt;String&gt;): Unit = io.ktor.server.netty.EngineMain.main(args)&#10;&#10;fun Application.module() {&#10;    routing {&#10;        get(&quot;/&quot;) {&#10;            call.respondText(&quot;Hello, world!&quot;)&#10;        }&#10;    }&#10;}"/>
        <p>
            除了要載入的模組外，您還可以配置各種伺服器設定，包括
            <a href="#predefined-properties">預定義</a>
            （例如連接埠或主機、SSL 設定等）以及自訂設定。
            讓我們來看看幾個範例。
        </p>
        <chapter title="基本組態" id="config-basic">
            <p>
                在下面的範例中，使用 <code>ktor.deployment.port</code> 屬性將伺服器接聽連接埠設定為 <code>8080</code>。
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
        <chapter title="引擎組態" id="config-engine">
            <snippet id="engine-main-configuration">
                <p>
                    如果您使用 <code>EngineMain</code>，您可以在 <code>ktor.deployment</code> 群組中指定適用於所有引擎的選項。
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
                        您也可以在 <code>ktor.deployment</code> 群組內的組態檔案中配置 Netty 特定的選項：
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
        <chapter title="SSL 組態" id="config-ssl">
            <p>
                下面的範例使 Ktor 能夠在 <code>8443</code> SSL 連接埠上進行監聽，並在獨立的 <code>security</code> 區塊中指定所需的
                <Links href="/ktor/server-ssl" summary="需要的相依性：io.ktor:ktor-network-tls-certificates 程式碼範例：ssl-engine-main、ssl-embedded-server">
                    SSL 設定
                </Links>
                。
            </p>
            <tabs group="config">
                <tab title="application.conf" group-key="hocon" id="application-conf">
                    <code-block lang="shell" code="ktor {&#10;    deployment {&#10;        port = 8080&#10;        sslPort = 8443&#10;    }&#10;    application {&#10;        modules = [ com.example.ApplicationKt.module ]&#10;    }&#10;&#10;    security {&#10;        ssl {&#10;            keyStore = keystore.jks&#10;            keyAlias = sampleAlias&#10;            keyStorePassword = foobar&#10;            privateKeyPassword = foobar&#10;            trustStore = truststore.jks&#10;            trustStorePassword = foobar&#10;            enabledProtocols = [&quot;TLSv1.2&quot;, &quot;TLSv1.3&quot;]&#10;        }&#10;    }&#10;}"/>
                </tab>
                <tab title="application.yaml" group-key="yaml" id="application-yaml">
                    <code-block lang="yaml" code="ktor:&#10;    deployment:&#10;        port: 8080&#10;        sslPort: 8443&#10;    application:&#10;        modules:&#10;            - com.example.ApplicationKt.module&#10;&#10;    security:&#10;        ssl:&#10;            keyStore: keystore.jks&#10;            keyAlias: sampleAlias&#10;            keyStorePassword: foobar&#10;            privateKeyPassword: foobar&#10;            trustStore: truststore.jks&#10;            trustStorePassword: foobar&#10;            enabledProtocols: [&quot;TLSv1.2&quot;, &quot;TLSv1.3&quot;]"/>
                </tab>
            </tabs>
        </chapter>
        <chapter title="自訂組態" id="config-custom">
            <p>
                除了指定 <a href="#predefined-properties">預定義屬性</a> 外，
                Ktor 還允許您在組態檔案中保留自訂設定。
                下方的組態檔案包含一個用於保留 
                <a href="#jwt-settings">JWT</a>
                設定的自訂 <code>jwt</code> 群組。
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
                您可以在程式碼中 <a href="#read-configuration-in-code">讀取並處理此類設定</a>。
            </p>
            <warning>
                <p>
                    請注意，敏感資料（如私鑰、資料庫連線設定等）不應以純文字形式儲存在組態檔案中。請考慮使用
                    <a href="#environment-variables">
                        環境變數
                    </a>
                    來指定這些參數。
                </p>
            </warning>
        </chapter>
    </chapter>
    <chapter title="預定義屬性" id="predefined-properties">
        <p>
            以下是可以在
            <a href="#configuration-file-overview">
                組態檔案
            </a> 中使用的預定義設定清單。
        </p>
        <deflist type="wide">
            <def title="ktor.deployment.host" id="ktor-deployment-host">
                <p>
                    主機位址。
                </p>
                <p>
                    <emphasis>範例</emphasis>
                    ：<code>0.0.0.0</code>
                </p>
            </def>
            <def title="ktor.deployment.port" id="ktor-deployment-port">
                <p>
                    接聽連接埠。您可以將此屬性設為 <code>0</code> 以在隨機連接埠上執行伺服器。
                </p>
                <p>
                    <emphasis>範例</emphasis>
                    ：<code>8080</code>、<code>0</code>
                </p>
            </def>
            <def title="ktor.deployment.sslPort" id="ktor-deployment-ssl-port">
                <p>
                    接聽 SSL 連接埠。您可以將此屬性設為 <code>0</code> 以在隨機連接埠上執行伺服器。
                </p>
                <p>
                    <emphasis>範例</emphasis>
                    ：<code>8443</code>、<code>0</code>
                </p>
                <note>
                    <p>
                        請注意，SSL 需要額外的選項，<a href="#ssl">列於下方</a>。
                    </p>
                </note>
            </def>
            <def title="ktor.deployment.watch" id="ktor-deployment-watch">
                <p>
                    用於 <a href="#watch-paths">自動重新載入</a> 的監看路徑。
                </p>
            </def>
            <def title="ktor.deployment.rootPath" id="ktor-deployment-root-path">
                <p>
                    <Links href="/ktor/server-war" summary="了解如何使用 WAR 封存檔在 Servlet 容器中執行和部署 Ktor 應用程式。">Servlet</Links> 內容路徑。
                </p>
                <p>
                    <emphasis>範例</emphasis>
                    ：<code>/</code>
                </p>
            </def>
            <def title="ktor.deployment.shutdown.url" id="ktor-deployment-shutdown-url">
                <p>
                    關閉 URL。
                    請注意，此選項使用 <Links href="/ktor/server-shutdown-url" summary="程式碼範例：%example_name%">Shutdown URL</Links> 外掛程式。
                </p>
            </def>
            <def title="ktor.deployment.shutdownGracePeriod" id="ktor-deployment-shutdown-grace-period">
                <p>
                    伺服器停止接受新請求前的最長時間（以毫秒為單位）。
                </p>
            </def>
            <def title="ktor.deployment.shutdownTimeout" id="ktor-deployment-shutdown-timeout">
                <p>
                    等待伺服器完全停止的最長時間（以毫秒為單位）。
                </p>
            </def>
            <def title="ktor.deployment.callGroupSize" id="ktor-deployment-call-group-size">
                <p>
                    用於處理應用程式呼叫的執行緒池最小大小。
                </p>
            </def>
            <def title="ktor.deployment.connectionGroupSize" id="ktor-deployment-connection-group-size">
                <p>
                    用於接受新連線並開始呼叫處理的執行緒計數。
                </p>
            </def>
            <def title="ktor.deployment.workerGroupSize" id="ktor-deployment-worker-group-size">
                <p>
                    用於處理連線、剖析訊息以及執行引擎內部工作的事件群組大小。
                </p>
            </def>
        </deflist>
        <p id="ssl">
            如果您已設定 <code>ktor.deployment.sslPort</code>，則需要指定下列 
            <Links href="/ktor/server-ssl" summary="需要的相依性：io.ktor:ktor-network-tls-certificates 程式碼範例：ssl-engine-main、ssl-embedded-server">
                SSL 特定
            </Links>
            屬性：
        </p>
        <deflist type="wide">
            <def title="ktor.security.ssl.keyStore" id="ktor-security-ssl-keystore">
                <p>
                    SSL 金鑰庫。
                </p>
            </def>
            <def title="ktor.security.ssl.keyAlias" id="ktor-security-ssl-key-alias">
                <p>
                    SSL 金鑰庫的別名。
                </p>
            </def>
            <def title="ktor.security.ssl.keyStorePassword" id="ktor-security-ssl-keystore-password">
                <p>
                    SSL 金鑰庫的密碼。
                </p>
            </def>
            <def title="ktor.security.ssl.privateKeyPassword" id="ktor-security-ssl-private-key-password">
                <p>
                    SSL 私鑰的密碼。
                </p>
            </def>
        </deflist>
    </chapter>
    <chapter title="環境變數" id="environment-variables">
        <p>
            在組態檔案中，您可以使用環境變數來替換參數。
        </p>
        <list>
            <li>
                在 HOCON (<Path>application.conf</Path>) 中，僅支援 <code>${ENV}</code> 語法。
            </li>
            <li>
                在 YAML (<Path>application.yaml</Path>) 中，支援 <code>${ENV}</code> 和 <code>$ENV</code> 兩種語法。
            </li>
        </list>
        <p>
            例如，您可以透過以下方式將 <code>PORT</code> 環境變數指派給 <code>ktor.deployment.port</code> 屬性：
        </p>
        <tabs group="config">
            <tab title="application.conf" group-key="hocon" id="env-var-conf">
                <code-block lang="shell" code="                    ktor {&#10;                        deployment {&#10;                            port = ${PORT}&#10;                        }&#10;                    }"/>
            </tab>
            <tab title="application.yaml" group-key="yaml" id="env-var-yaml">
                <code-block lang="yaml" code="                    ktor:&#10;                        deployment:&#10;                            port: ${PORT} # or $PORT"/>
            </tab>
        </tabs>
        <p>
            在這種情況下，將使用環境變數值來指定接聽連接埠。
            如果 <code>PORT</code> 環境變數在執行時不存在，您可以按如下方式提供預設連接埠值：
        </p>
        <tabs group="config">
            <tab title="application.conf" group-key="hocon" id="config-conf">
                <code-block lang="shell" code="                    ktor {&#10;                        deployment {&#10;                            port = 8080&#10;                            port = ${?PORT}&#10;                        }&#10;                    }"/>
            </tab>
            <tab title="application.yaml" group-key="yaml" id="config-yaml">
                <code-block lang="yaml" code="                    ktor:&#10;                        deployment:&#10;                            port: ${PORT:8080} # or &quot;$PORT:8080&quot;"/>
            </tab>
        </tabs>
    </chapter>
    <chapter title="在程式碼中讀取組態" id="read-configuration-in-code">
        <p>
            Ktor 允許您從應用程式程式碼中存取組態檔案中指定的屬性值。
            在以下範例中，您指定了 <code>ktor.deployment.port</code> 屬性：
        </p>
        <tabs group="config">
            <tab title="application.conf" group-key="hocon" id="config-conf-2">
                <code-block lang="shell" code="                    ktor {&#10;                        deployment {&#10;                            port = 8080&#10;                        }&#10;                    }"/>
            </tab>
            <tab title="application.yaml" group-key="yaml" id="config-yaml-2">
                <code-block lang="yaml" code="                    ktor:&#10;                        deployment:&#10;                            port: 8080"/>
            </tab>
        </tabs>
        <p>
            您可以使用 
            <a href="https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-environment/config.html">
                <code>ApplicationEnvironment.config()</code>
            </a>
            函式存取應用程式的組態並擷取屬性值。使用 <code>.property()</code> 函式存取必要的值，或使用 <code>.propertyOrNull()</code> 存取選填值：
        </p>
        <code-block lang="kotlin" code="            fun Application.module() {&#10;                val port = environment.config.propertyOrNull(&quot;ktor.deployment.port&quot;)?.getString() ?: &quot;8080&quot;&#10;                routing {&#10;                    get {&#10;                        call.respondText(&quot;Listening on port $port&quot;)&#10;                    }&#10;                }&#10;            }"/>
        <chapter title="將組態還原序列化為資料類別" id="deserialize-config">
            <p>
                您可以將組態還原序列化為 Kotlin 類別，以實現對組態值的型別安全存取。
            </p>
            <p>
                下面的範例定義了 <code>app</code> 和 <code>security</code> 組態區段，並將它們映射到可序列化的 Kotlin 資料類別。
            </p>
            <tabs group="config">
                <tab title="application.conf" group-key="hocon" id="config-conf-1">
                <code-block lang="shell" code="                    app {&#10;                        port = 8080&#10;                        host = &quot;0.0.0.0&quot;&#10;                    }&#10;&#10;                    security {&#10;                        clientId = ${?CLIENT_ID}&#10;                        clientSecret = ${?CLIENT_SECRET}&#10;                    }"/>
                </tab>
                <tab title="application.yaml" group-key="yaml" id="config-yaml-1">
                <code-block lang="yaml" code="                    app:&#10;                        port: 8080&#10;                        host: &quot;0.0.0.0&quot;&#10;                    security:&#10;                        clientId: $CLIENT_ID&#10;                        clientSecret: $CLIENT_SECRET"/>
                </tab>
            </tabs>
            <p>
                使用 <code>Application.property()</code> 或 <code>Application.propertyOrNull()</code> 函式來還原序列化特定的組態區段：
            </p>
            <code-block lang="kotlin" code="            @Serializable&#10;            data class Security(val clientId: String, val clientSecret: String)&#10;&#10;            fun Application.module() {&#10;                val securityConfig: Security = property(&quot;security&quot;)&#10;&#10;                println(&quot;Authorization header: ${securityConfig.clientId}:${securityConfig.clientSecret}&quot;)&#10;            }"/>
            <p>
                如果您需要還原序列化整個 <code>ApplicationConfig</code>，請使用
                <code>ApplicationConfig.getAs()</code> 函式：
            </p>
            <code-block lang="kotlin" code="            @Serializable&#10;            data class App(val port: Int, val host: String)&#10;            @Serializable&#10;            data class Security(val clientId: String, val clientSecret: String)&#10;            @Serializable&#10;            data class Config(val app: App, val security: Security)&#10;&#10;            fun Application.module() {&#10;                val config = environment.config.getAs&lt;Config&gt;()&#10;&#10;                val clientId = config.security.clientId&#10;                val clientSecret = config.security.clientSecret&#10;&#10;                println(&quot;Authorization header: $clientId:$clientSecret&quot;)&#10;            }"/>
        </chapter>
    </chapter>
    <chapter title="命令列" id="command-line">
        <p>
            如果您使用 <a href="#engine-main">EngineMain</a> 建立伺服器，您可以從命令列執行 <Links href="/ktor/server-fatjar" summary="了解如何使用 Ktor Gradle 外掛程式建立並執行可執行 Fat JAR。">封裝好的應用程式</Links>，並透過傳遞對應的命令列引數來覆寫所需的伺服器參數。例如，您可以按以下方式覆寫組態檔案中指定的連接埠：
        </p>
        <code-block lang="shell" code="            java -jar sample-app.jar -port=8080"/>
        <p>
            可用的命令列選項列於下方：
        </p>
        <deflist type="narrow">
            <def title="-jar" id="jar">
                <p>
                    JAR 檔案路徑。
                </p>
            </def>
            <def title="-config" id="config">
                <p>
                    自訂組態檔案的路徑，用於替代 resources 中的 
                    <Path>application.conf</Path>
                    /
                    <Path>application.yaml</Path>
                    。
                </p>
                <p>
                    <emphasis>範例</emphasis>
                    ：<code>java -jar sample-app.jar -config=anotherfile.conf</code>
                </p>
                <p>
                    <emphasis>注意</emphasis>
                    ：您可以傳遞多個值。<code>java -jar sample-app.jar -config=config-base.conf -config=config-dev.conf</code>。在這種情況下，所有組態都將合併，且右側組態中的值具有優先權。
                </p>
            </def>
            <def title="-host" id="host">
                <p>
                    主機位址。
                </p>
            </def>
            <def title="-port" id="port">
                <p>
                    接聽連接埠。
                </p>
            </def>
            <def title="-watch" id="watch">
                <p>
                    用於 <a href="#watch-paths">自動重新載入</a> 的監看路徑。
                </p>
            </def>
        </deflist>
        <p>
            <Links href="/ktor/server-ssl" summary="需要的相依性：io.ktor:ktor-network-tls-certificates 程式碼範例：ssl-engine-main、ssl-embedded-server">SSL 特定</Links> 選項：
        </p>
        <deflist type="narrow">
            <def title="-sslPort" id="ssl-port">
                <p>
                    接聽 SSL 連接埠。
                </p>
            </def>
            <def title="-sslKeyStore" id="ssl-keystore">
                <p>
                    SSL 金鑰庫。
                </p>
            </def>
        </deflist>
        <p>
            如果您需要覆寫沒有對應命令列選項的 <a href="#predefined-properties">預定義屬性</a>，請使用 <code>-P</code> 旗標，例如：
        </p>
        <code-block code="            java -jar sample-app.jar -P:ktor.deployment.callGroupSize=7"/>
        <p>
            您也可以使用 <code>-P</code> 旗標來覆寫 <a href="#config-custom">自訂屬性</a>。
        </p>
    </chapter>
    <chapter title="範例：使用自訂屬性指定環境" id="custom-property">
        <p>
            您可以使用自訂組態屬性，根據伺服器執行的環境（例如本機開發或生產環境）來更改應用程式行為。
        </p>
        <p>
            為此，請在 
            <Path>application.conf</Path>
            或 
            <Path>application.yaml</Path>
            中定義自訂屬性，並從 <a href="#environment-variables">環境變數</a> 中指派其值。在下面的範例中，<code>KTOR_ENV</code> 環境變數被指派給自訂的 <code>ktor.environment</code> 屬性。隨後可以針對本機和生產環境為 <code>KTOR_ENV</code> 設定不同的值。
        </p>
        <tabs group="config">
            <tab title="application.conf" group-key="hocon" id="application-conf-5">
                <code-block code="ktor {&#10;    environment = ${?KTOR_ENV}&#10;}"/>
            </tab>
            <tab title="application.yaml" group-key="yaml" id="application-yaml-5">
                <code-block lang="yaml" code="ktor:&#10;    environment: $?KTOR_ENV"/>
            </tab>
        </tabs>
        <p>
            您可以在執行時透過 
            <a href="#read-configuration-in-code">
                在程式碼中讀取組態
            </a>
            來存取 <code>ktor.environment</code> 的值，並執行所需的操作：
        </p>
        <code-block lang="kotlin" code="import io.ktor.server.application.*&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;&#10;fun Application.module() {&#10;    val env = environment.config.propertyOrNull(&quot;ktor.environment&quot;)?.getString()&#10;    routing {&#10;        get {&#10;            call.respondText(when (env) {&#10;                &quot;dev&quot; -&gt; &quot;Development&quot;&#10;                &quot;prod&quot; -&gt; &quot;Production&quot;&#10;                else -&gt; &quot;...&quot;&#10;            })&#10;        }&#10;    }&#10;}"/>
        <p>
            如需完整程式碼範例，請參閱 
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main-custom-environment">
                engine-main-custom-environment
            </a>。
        </p>
    </chapter>
</topic>