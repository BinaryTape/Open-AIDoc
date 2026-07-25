<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="自动重载 (Auto-reload)"
       id="server-auto-reload" help-id="Auto_reload">
    <tldr>
        <p>
            <b>代码示例</b>：
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/autoreload-engine-main">autoreload-engine-main</a>，
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/autoreload-embedded-server">autoreload-embedded-server</a>
        </p>
    </tldr>
    <link-summary>
        了解如何使用自动重载 (Auto-reload) 在代码更改时重载应用类。
    </link-summary>
    <p>
        在开发过程中<Links href="//server-run" summary="了解如何运行服务器 Ktor 应用程序。">重新启动</Links>服务器可能需要一些时间。
        Ktor 允许您通过使用<emphasis>自动重载 (Auto-reload)</emphasis>来克服这一限制，它可以在代码更改时重载应用类并提供快速的反馈循环。
        要使用自动重载，请遵循以下步骤：
    </p>
    <list style="decimal">
        <li>
            <p>
                <a href="#enable">启用开发模式</a>
            </p>
        </li>
        <li>
            <p>
                （可选）<a href="#watch-paths">配置监视路径</a>
            </p>
        </li>
        <li>
            <p>
                <a href="#recompile">启用更改时重新编译</a>
            </p>
        </li>
    </list>
    <chapter title="限制" id="limitations">
        自动重载仅适用于特定的模块声明。下表显示了跨版本的支持情况：
        <table>
            
<tr>
<td>模块类型</td>
                <td>&lt;= 3.2</td>
                <td>&gt; 3.2</td>
</tr>

            
<tr>
<td>Lambda 初始值设定项</td>
                <td>❌ 不支持</td>
                <td>❌ 不支持</td>
</tr>

            
<tr>
<td>阻塞函数引用</td>
                <td>✅ 支持</td>
                <td>❌ 不支持</td>
</tr>

            
<tr>
<td>挂起函数引用</td>
                <td>❌ 不支持</td>
                <td>✅ 支持</td>
</tr>

            
<tr>
<td>配置引用</td>
                <td>✅ 支持</td>
                <td>✅ 支持</td>
</tr>

        </table>
        <chapter title="支持" id="supported">
            <code-block lang="kotlin" code="                // 挂起函数引用&#10;                embeddedServer(Netty, port = 8080, module = Application::mySuspendModule)&#10;&#10;                // 配置引用&#10;                ktor {&#10;                    application {&#10;                        modules = [ com.example.ApplicationKt.mySuspendModule ]&#10;                    }&#10;                }"/>
        </chapter>
        <chapter title="不支持" id="not-supported">
            <code-block lang="kotlin" code="                // Lambda&#10;                embeddedServer(Netty, port = 8080) { configureServer() }&#10;&#10;                // 阻塞函数引用&#10;                embeddedServer(Netty, port = 8080, module = Application::myBlockingModule)"/>
        </chapter>
    </chapter>
    <chapter title="启用开发模式" id="enable">
        <p>
            要使用自动重载，您需要先启用
            <a href="#enable">开发模式</a>。
            这取决于您用于<Links href="//server-create-and-configure" summary="了解如何根据应用部署需求创建服务器。">创建和运行服务器</Links>的方式：
        </p>
        <list>
            <li>
                <p>
                    如果您使用 <code>EngineMain</code> 运行服务器，请在<a href="#application-conf">配置文件</a>中启用开发模式。
                </p>
            </li>
            <li>
                <p>
                    如果您使用 <code>embeddedServer</code> 运行服务器，可以使用
                    <a href="#system-property"><code>io.ktor.development</code></a>
                    系统属性。
                </p>
            </li>
        </list>
        <p>
            启用开发模式后，Ktor 将自动监视工作目录中的输出文件。
            如有需要，您可以通过指定<a href="#watch-paths">监视路径</a>来缩小监视文件夹的范围。
        </p>
    </chapter>
    <chapter title="配置监视路径" id="watch-paths">
        <p>
            当您<a href="#enable">启用</a>开发模式时，
            Ktor 开始监视工作目录中的输出文件。
            例如，对于使用 Gradle 构建的 <Path>ktor-sample</Path> 项目，将监视以下文件夹：
        </p>
        <code-block code="            ktor-sample/build/classes/kotlin/main/META-INF&#10;            ktor-sample/build/classes/kotlin/main/com/example&#10;            ktor-sample/build/classes/kotlin/main/com&#10;            ktor-sample/build/classes/kotlin/main&#10;            ktor-sample/build/resources/main"/>
        <p>
            监视路径允许您缩小监视文件夹的范围。
            为此，您可以指定监视路径的一部分。
            例如，要监控 <Path>ktor-sample/build/classes</Path> 子文件夹中的更改，
            请将 <code>classes</code> 作为监视路径传递。
            根据您运行服务器的方式，您可以通过以下方式指定监视路径：
        </p>
        <list>
            <li>
                <p>
                    在 <Path>application.conf</Path> 或 <Path>application.yaml</Path> 文件中，指定 <code>watch</code> 选项：
                </p>
                <Tabs group="config">
                    <TabItem title="application.conf" group-key="hocon">
                        <code-block code="ktor {&#10;    development = true&#10;    deployment {&#10;        watch = [ classes ]&#10;    }&#10;}"/>
                    </TabItem>
                    <TabItem title="application.yaml" group-key="yaml">
                        <code-block lang="yaml" code="ktor:&#10;    development: true&#10;    deployment:&#10;        watch:&#10;            - classes"/>
                    </TabItem>
                </Tabs>
                <p>
                    您还可以指定多个监视路径，例如：
                </p>
                <Tabs group="config">
                    <TabItem title="application.conf" group-key="hocon">
                        <code-block code="                            watch = [ classes, resources ]"/>
                    </TabItem>
                    <TabItem title="application.yaml" group-key="yaml">
                        <code-block lang="yaml" code="                            watch:&#10;                                - classes&#10;                                - resources"/>
                    </TabItem>
                </Tabs>
                <p>
                    您可以在此处找到完整示例：<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/autoreload-engine-main">autoreload-engine-main</a>。
                </p>
            </li>
            <li>
                <p>
                    如果您使用的是 <code>embeddedServer</code>，请将监视路径作为 <code>watchPaths</code>
                    形参传递：
                </p>
                <code-block lang="Kotlin" code="fun main() {&#10;    embeddedServer(Netty, port = 8080, watchPaths = listOf(&quot;classes&quot;), host = &quot;0.0.0.0&quot;, module = Application::module)&#10;        .start(wait = true)&#10;}&#10;&#10;fun Application.module() {&#10;    routing {&#10;        get(&quot;/&quot;) {&#10;            call.respondText(&quot;Hello, world!&quot;)&#10;        }&#10;    }&#10;}"/>
                <p>
                    有关完整示例，请参阅
                    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/autoreload-embedded-server">
                        autoreload-embedded-server
                    </a>
                    。
                </p>
            </li>
        </list>
    </chapter>
    <chapter title="启用更改时重新编译" id="recompile">
        <p>
            由于自动重载检测的是输出文件中的更改，
            因此您需要重新构建项目。
            您可以在 IntelliJ IDEA 中手动执行此操作，或者
            使用 <code>-t</code> 命令行选项在 Gradle 中启用持续构建执行。
        </p>
        <list>
            <li>
                <p>
                    要在 IntelliJ IDEA 中手动重新构建项目，请从主菜单选择
                    <ui-path>Build | Rebuild Project</ui-path>。
                </p>
            </li>
            <li>
                <p>
                    要使用 Gradle 自动重新构建项目，
                    您可以在终端中使用 <code>-t</code> 选项运行 <code>build</code> 任务：
                </p>
                <code-block lang="Bash" code="                    ./gradlew -t build"/>
                <tip>
                    <p>
                        要在重载项目时跳过运行测试，可以将 <code>-x</code> 选项传递给 <code>build</code> 任务：
                    </p>
                    <code-block lang="Bash" code="                        ./gradlew -t build -x test -i"/>
                </tip>
            </li>
        </list>
    </chapter>
</topic>