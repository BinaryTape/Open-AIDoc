<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="오토 리로드(Auto-reload)"
       id="server-auto-reload" help-id="Auto_reload">
    <tldr>
        <p>
            <b>코드 예제</b>:
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/autoreload-engine-main">autoreload-engine-main</a>,
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/autoreload-embedded-server">autoreload-embedded-server</a>
        </p>
    </tldr>
    <link-summary>
        코드 변경 시 애플리케이션 클래스를 다시 로드하기 위해 오토 리로드(Auto-reload)를 사용하는 방법을 알아봅니다.
    </link-summary>
    <p>
        개발 중에 서버를 <Links href="//server-run" summary="Learn how to run a server Ktor application.">재시작</Links>하는 것은 다소 시간이 걸릴 수 있습니다.
        Ktor는 코드 변경 시 애플리케이션 클래스를 다시 로드하고 빠른 피드백 루프를 제공하는 <emphasis>오토 리로드(Auto-reload)</emphasis>를 통해 이러한 제한을 극복할 수 있게 해줍니다.
        오토 리로드를 사용하려면 다음 단계를 따르세요.
    </p>
    <list style="decimal">
        <li>
            <p>
                <a href="#enable">개발 모드 활성화</a>
            </p>
        </li>
        <li>
            <p>
                (선택 사항) <a href="#watch-paths">감시 경로(watch paths) 구성</a>
            </p>
        </li>
        <li>
            <p>
                <a href="#recompile">변경 시 재컴파일 활성화</a>
            </p>
        </li>
    </list>
    <chapter title="제한 사항" id="limitations">
        오토 리로드는 특정 모듈 선언에서만 작동합니다. 다음 표는 버전별 지원 여부를 보여줍니다.
        <table>
            
<tr>
<td>모듈 유형</td>
                <td>&lt;= 3.2</td>
                <td>&gt; 3.2</td>
</tr>

            
<tr>
<td>람다 초기화(Lambda initializer)</td>
                <td>❌ 지원되지 않음</td>
                <td>❌ 지원되지 않음</td>
</tr>

            
<tr>
<td>블로킹 함수 참조(Blocking function reference)</td>
                <td>✅ 지원됨</td>
                <td>❌ 지원되지 않음</td>
</tr>

            
<tr>
<td>서스펜드 함수 참조(Suspend function reference)</td>
                <td>❌ 지원되지 않음</td>
                <td>✅ 지원됨</td>
</tr>

            
<tr>
<td>설정 참조(Config reference)</td>
                <td>✅ 지원됨</td>
                <td>✅ 지원됨</td>
</tr>

        </table>
        <chapter title="지원됨" id="supported">
            <code-block lang="kotlin" code="                // Suspend function reference&#10;                embeddedServer(Netty, port = 8080, module = Application::mySuspendModule)&#10;&#10;                // Configuration reference&#10;                ktor {&#10;                    application {&#10;                        modules = [ com.example.ApplicationKt.mySuspendModule ]&#10;                    }&#10;                }"/>
        </chapter>
        <chapter title="지원되지 않음" id="not-supported">
            <code-block lang="kotlin" code="                // Lambda&#10;                embeddedServer(Netty, port = 8080) { configureServer() }&#10;&#10;                // Blocking function reference&#10;                embeddedServer(Netty, port = 8080, module = Application::myBlockingModule)"/>
        </chapter>
    </chapter>
    <chapter title="개발 모드 활성화" id="enable">
        <p>
            오토 리로드를 사용하려면 먼저 <a href="#enable">개발 모드</a>를 활성화해야 합니다.
            이는 <Links href="//server-create-and-configure" summary="Learn how to create a server depending on your application deployment needs.">서버를 생성하고 실행</Links>하는 방식에 따라 달라집니다.
        </p>
        <list>
            <li>
                <p>
                    <code>EngineMain</code>을 사용하여 서버를 실행하는 경우, <a href="#application-conf">설정 파일</a>에서 개발 모드를 활성화하세요.
                </p>
            </li>
            <li>
                <p>
                    <code>embeddedServer</code>를 사용하여 서버를 실행하는 경우, <a href="#system-property"><code>io.ktor.development</code></a> 시스템 속성을 사용할 수 있습니다.
                </p>
            </li>
        </list>
        <p>
            개발 모드가 활성화되면 Ktor는 작업 디렉터리의 출력 파일을 자동으로 감시합니다.
            필요한 경우, <a href="#watch-paths">감시 경로</a>를 지정하여 감시할 폴더 세트를 좁힐 수 있습니다.
        </p>
    </chapter>
    <chapter title="감시 경로 구성" id="watch-paths">
        <p>
            개발 모드를 <a href="#enable">활성화</a>하면 Ktor는 작업 디렉터리의 출력 파일을 감시하기 시작합니다.
            예를 들어, Gradle로 빌드된 <Path>ktor-sample</Path> 프로젝트의 경우 다음 폴더들이 감시됩니다.
        </p>
        <code-block code="            ktor-sample/build/classes/kotlin/main/META-INF&#10;            ktor-sample/build/classes/kotlin/main/com/example&#10;            ktor-sample/build/classes/kotlin/main/com&#10;            ktor-sample/build/classes/kotlin/main&#10;            ktor-sample/build/resources/main"/>
        <p>
            감시 경로(Watch paths)를 사용하면 감시할 폴더 세트를 좁힐 수 있습니다.
            이를 위해 감시할 경로의 일부를 지정할 수 있습니다.
            예를 들어, <Path>ktor-sample/build/classes</Path> 하위 폴더의 변경 사항을 모니터링하려면
            감시 경로로 <code>classes</code>를 전달합니다.
            서버를 실행하는 방식에 따라 다음과 같은 방법으로 감시 경로를 지정할 수 있습니다.
        </p>
        <list>
            <li>
                <p>
                    <Path>application.conf</Path> 또는 <Path>application.yaml</Path> 파일에서 <code>watch</code> 옵션을 지정합니다.
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
                    다음과 같이 여러 감시 경로를 지정할 수도 있습니다.
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
                    전체 예제는 여기에서 확인할 수 있습니다: <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/autoreload-engine-main">autoreload-engine-main</a>.
                </p>
            </li>
            <li>
                <p>
                    <code>embeddedServer</code>를 사용하는 경우, <code>watchPaths</code> 매개변수로 감시 경로를 전달합니다.
                </p>
                <code-block lang="Kotlin" code="fun main() {&#10;    embeddedServer(Netty, port = 8080, watchPaths = listOf(&quot;classes&quot;), host = &quot;0.0.0.0&quot;, module = Application::module)&#10;        .start(wait = true)&#10;}&#10;&#10;fun Application.module() {&#10;    routing {&#10;        get(&quot;/&quot;) {&#10;            call.respondText(&quot;Hello, world!&quot;)&#10;        }&#10;    }&#10;}"/>
                <p>
                    전체 예제는 <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/autoreload-embedded-server">autoreload-embedded-server</a>를 참조하세요.
                </p>
            </li>
        </list>
    </chapter>
    <chapter title="변경 시 재컴파일" id="recompile">
        <p>
            오토 리로드는 출력 파일의 변경 사항을 감지하므로, 프로젝트를 다시 빌드해야 합니다.
            IntelliJ IDEA에서 수동으로 다시 빌드하거나 Gradle의 <code>-t</code> 명령줄 옵션을 사용하여 연속 빌드 실행(continuous build execution)을 활성화할 수 있습니다.
        </p>
        <list>
            <li>
                <p>
                    IntelliJ IDEA에서 프로젝트를 수동으로 다시 빌드하려면 메인 메뉴에서 <ui-path>Build | Rebuild Project</ui-path>를 선택하세요.
                </p>
            </li>
            <li>
                <p>
                    Gradle을 사용하여 프로젝트를 자동으로 다시 빌드하려면 터미널에서 <code>-t</code> 옵션과 함께 <code>build</code> 태스크를 실행하면 됩니다.
                </p>
                <code-block lang="Bash" code="                    ./gradlew -t build"/>
                <tip>
                    <p>
                        프로젝트를 다시 로드할 때 테스트 실행을 건너뛰려면 <code>build</code> 태스크에 <code>-x</code> 옵션을 전달할 수 있습니다.
                    </p>
                    <code-block lang="Bash" code="                        ./gradlew -t build -x test -i"/>
                </tip>
            </li>
        </list>
    </chapter>
</topic>