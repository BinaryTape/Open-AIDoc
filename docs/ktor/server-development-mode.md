<topic xmlns="" xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="server-development-mode" title="开发模式"
   help-id="development_mode;development-mode">
<show-structure for="chapter" depth="2"/>
<p>
    Ktor 提供了一种专门用于开发的模式。此模式支持以下功能：
</p>
<list>
    <li><Links href="/ktor/server-auto-reload" summary="了解如何使用自动重载在代码更改时重新加载应用程序类。">自动重载</Links>，用于在不重启服务器的情况下重新加载应用程序类。
    </li>
    <li>用于调试 <a href="#pipelines">管道</a> 的扩展信息（附带堆栈跟踪）。
    </li>
    <li>在发生 <emphasis>5**</emphasis> 服务器错误时，在 <Links href="/ktor/server-status-pages" summary="%plugin_name% 允许 Ktor 应用程序根据抛出的异常或状态码适当地响应任何失败状态。">响应页面</Links> 上显示扩展调试信息。
    </li>
</list>
<note>
    <p>
        请注意，开发模式会影响性能，不应在生产环境中使用。
    </p>
</note>
<chapter title="启用开发模式" id="enable">
    <p>
        您可以通过多种方式启用开发模式：在应用程序配置文件中、使用专用系统属性或环境变量。
    </p>
    <chapter title="配置文件" id="application-conf">
        <p>
            要在
            <Links href="/ktor/server-configuration-file" summary="了解如何在配置文件中配置各种服务器参数。">配置文件</Links> 中启用开发模式，
            请将 <code>development</code> 选项设置为 <code>true</code>：
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
    <chapter title="'io.ktor.development' 系统属性" id="system-property">
        <p>
            <control>io.ktor.development</control>
            <a href="https://docs.oracle.com/javase/tutorial/essential/environment/sysprop.html">系统属性</a>
            允许您在运行应用程序时启用开发模式。
        </p>
        <p>
            要在 IntelliJ IDEA 中使用开发模式运行应用程序，
            请将带有 <code>-D</code> 标志的 <code>io.ktor.development</code> 传递给
            <a href="https://www.jetbrains.com/help/idea/run-debug-configuration-kotlin.html#1">VM options</a>：
        </p>
        <code-block code="                -Dio.ktor.development=true"/>
        <p>
            如果您使用 <Links href="/ktor/server-dependencies" summary="了解如何将 Ktor 服务器依赖项添加到现有 Gradle/Maven 项目。">Gradle</Links> 任务运行应用程序，
            可以通过两种方式启用开发模式：
        </p>
        <list>
            <li>
                <p>
                    在您的 <Path>build.gradle.kts</Path> 文件中配置 <code>ktor</code> 块：
                </p>
                <code-block lang="Kotlin" code="                        ktor {&#10;                            development = true&#10;                        }"/>
            </li>
            <li>
                <p>
                    通过传递 Gradle CLI 标志，为单次运行启用开发模式：
                </p>
                <code-block lang="bash" code="                          ./gradlew run -Pio.ktor.development=true"/>
                </li>
        </list>
        <tip>
            <p>
                您还可以使用 <code>-ea</code> 标志来启用开发模式。
                请注意，通过 <code>-D</code> 标志传递的 <code>io.ktor.development</code> 系统属性优先于 <code>-ea</code>。
            </p>
        </tip>
    </chapter>
    <chapter title="'io.ktor.development' 环境变量" id="environment-variable">
        <p>
            要为 <a href="#native">原生客户端</a> 启用开发模式，
            请使用 <code>io.ktor.development</code> 环境变量。
        </p>
    </chapter>
</chapter>
</topic>