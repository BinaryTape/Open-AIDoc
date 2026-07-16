<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="自动重载"
       id="server-auto-reload" help-id="Auto_reload">
<tldr>
        <p>
            <b>代码示例</b>:
            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/autoreload-engine-main">autoreload-engine-main</a>,
            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/autoreload-embedded-server">autoreload-embedded-server</a>
        </p>
    </tldr>
<link-summary>
        了解如何使用自动重载在代码更改时重新加载应用程序类。
    </link-summary>
<p>
        <Links href="/ktor/server-run" summary="了解如何运行 Ktor 服务器应用程序。">在开发过程中重启</Links>服务器可能需要一些时间。
        Ktor 允许你通过使用<emphasis>自动重载</emphasis>来克服此限制，它可以在代码更改时重新加载应用程序类，并提供快速反馈循环。
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
                (可选) <a href="#watch-paths">配置监视路径</a>
            </p>
        </li>
        <li>
            <p>
                <a href="#recompile">启用更改时重新编译</a>
            </p>
        </li>
    </list>
<chapter title="启用开发模式" id="enable">
        <p>
            要使用自动重载，你首先需要<a href="#enable">启用</a>开发模式。
            这取决于你<Links href="/ktor/server-create-and-configure" summary="了解如何根据你的应用程序部署需求创建服务器。">创建和运行服务器</Links>的方式：
        </p>
<list>
            <li>
                <p>
                    如果你使用 <code>EngineMain</code> 运行服务器，请在<a href="#application-conf">配置文件</a>中启用开发模式。
                </p>
            </li>
            <li>
                <p>
                    如果你使用 <code>embeddedServer</code> 运行服务器，你可以使用 <a href="#system-property">io.ktor.development</a> 系统属性。
                </p>
            </li>
        </list>
<p>
            启用开发模式后，Ktor 将自动监视工作目录中的输出文件。
            如果需要，你可以通过指定<a href="#watch-paths">监视路径</a>来缩小监视文件夹的范围。
        </p>
</chapter>
<chapter title="配置监视路径" id="watch-paths">
        <p>
            当你<a href="#enable">启用</a>开发模式时，
            Ktor 会开始监视工作目录中的输出文件。
            例如，对于一个使用 Gradle 构建的 <Path>ktor-sample</Path> 项目，将监视以下文件夹：
        </p>
<code-block code="            ktor-sample/build/classes/kotlin/main/META-INF&#10;            ktor-sample/build/classes/kotlin/main/com/example&#10;            ktor-sample/build/classes/kotlin/main/com&#10;            ktor-sample/build/classes/kotlin/main&#10;            ktor-sample/build/resources/main"/>
<p>
            监视路径允许你缩小监视文件夹的范围。
            为此，你可以指定监视路径的一部分。
            例如，要监视 <Path>ktor-sample/build/classes</Path> 子文件夹中的更改，
            请将 <code>classes</code> 作为监视路径传递。
            根据你运行服务器的方式，你可以通过以下方式指定监视路径：
        </p>
<list>
            <li>
                <p>
                    在 <Path>application.conf</Path> 或 <Path>application.yaml</Path> 文件中，指定 <code>watch</code> 选项：
                </p>
<tabs group="config">
                    <tab title="application.conf" group-key="hocon">
                        <code-block code="ktor {&#10;    development = true&#10;    deployment {&#10;        watch = [ classes ]&#10;    }&#10;}"/>
                    </tab>
                    <tab title="application.yaml" group-key="yaml">
                        <code-block lang="yaml" code="ktor:&#10;    development: true&#10;    deployment:&#10;        watch:&#10;            - classes"/>
                    </tab>
                </tabs>
<p>
                    你还可以指定多个监视路径，例如：
                </p>
<tabs group="config">
                    <tab title="application.conf" group-key="hocon">
                        <code-block code="                            watch = [ classes, resources ]"/>
                    </tab>
                    <tab title="application.yaml" group-key="yaml">
                        <code-block lang="yaml" code="                            watch:&#10;                                - classes&#10;                                - resources"/>
                    </tab>
                </tabs>
<p>
                    你可以在这里找到完整示例：<a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/autoreload-engine-main">autoreload-engine-main</a>。
                </p>
            </li>
            <li>
                <p>
                    如果你正在使用 <code>embeddedServer</code>，请将监视路径作为 <code>watchPaths</code> 形参传递：
                </p>
<code-block lang="Kotlin" code="fun main() {&#10;    embeddedServer(Netty, port = 8080, watchPaths = listOf(&quot;classes&quot;), host = &quot;0.0.0.0&quot;, module = Application::module)&#10;        .start(wait = true)&#10;}&#10;&#10;fun Application.module() {&#10;    routing {&#10;        get(&quot;/&quot;) {&#10;            call.respondText(&quot;Hello, world!&quot;)&#10;        }&#10;    }&#10;}"/>
<p>
                    有关完整示例，请参见
                    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/autoreload-embedded-server">
                        autoreload-embedded-server
                    </a>
                    。
                </p>
            </li>
        </list>
</chapter>
<chapter title="更改时重新编译" id="recompile">
        <p>
            由于自动重载会检测输出文件中的更改，
            你需要重新构建项目。
            你可以在 IntelliJ IDEA 中手动执行此操作，或者使用 Gradle 中的 <code>-t</code> 命令行选项启用持续构建执行。
        </p>
<list>
            <li>
                <p>
                    要在 IntelliJ IDEA 中手动重新构建项目，请从主菜单中选择
                    <ui-path>Build | Rebuild Project</ui-path>。
                </p>
            </li>
            <li>
                <p>
                    要使用 Gradle 自动重新构建项目，
                    你可以在终端中运行带有 <code>-t</code> 选项的 <code>build</code> 任务：
                </p>
<code-block code="                    ./gradlew -t build"/>
<tip>
                    <p>
                        要在重新加载项目时跳过运行测试，你可以将 <code>-x</code> 选项传递给 <code>build</code> 任务：
                    </p>
<code-block code="                        ./gradlew -t build -x test -i"/>
</tip>
            </li>
        </list>
</chapter>
</topic>