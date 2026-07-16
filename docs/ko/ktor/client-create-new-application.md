<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="클라이언트 애플리케이션 생성"
       id="client-create-new-application"
       help-id="getting_started_ktor_client;client-getting-started;client-get-started;client-create-a-new-application">
<show-structure for="chapter" depth="2"/>
<tldr>
    <var name="example_name" value="tutorial-client-get-started"/>
    <p>
        <b>코드 예시</b>:
        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
            %example_name%
        </a>
    </p>
</tldr>
<link-summary>
    요청을 보내고 응답을 받는 첫 번째 클라이언트 애플리케이션을 생성합니다.
</link-summary>
<p>
    Ktor는 다중 플랫폼 비동기 HTTP 클라이언트를 포함하며, 이를 통해 <Links href="/ktor/client-requests" summary="요청 URL, HTTP 메서드, 헤더, 요청 본문 등 다양한 요청 매개변수를 지정하고 요청을 생성하는 방법을 알아봅니다.">요청을 생성하고</Links> <Links href="/ktor/client-responses" summary="응답을 받고, 응답 본문을 얻고, 응답 매개변수를 얻는 방법을 알아봅니다.">응답을 처리하며</Links>, <Links href="/ktor/client-plugins" summary="로깅, 직렬화, 권한 부여 등 일반적인 기능을 제공하는 플러그인에 대해 알아봅니다.">플러그인</Links>(예: <Links href="/ktor/client-auth" summary="Auth 플러그인은 클라이언트 애플리케이션에서 인증 및 권한 부여를 처리합니다.">인증</Links>, <Links href="/ktor/client-serialization" summary="ContentNegotiation 플러그인은 클라이언트와 서버 간 미디어 타입 협상, 요청 전송 및 응답 수신 시 특정 형식으로 콘텐츠 직렬화/역직렬화라는 두 가지 주요 목적을 제공합니다.">JSON 직렬화</Links> 등)으로 기능을 확장할 수 있습니다.
</p>
<p>
    이 튜토리얼에서는 요청을 보내고 응답을 출력하는 첫 번째 Ktor 클라이언트 애플리케이션을 생성하는 방법을 보여드립니다.
</p>
<chapter title="사전 요구 사항" id="prerequisites">
    <p>
        이 튜토리얼을 시작하기 전에
        <a href="https://www.jetbrains.com/help/idea/installation-guide.html">IntelliJ IDEA Community 또는 Ultimate를 설치</a>하세요.
    </p>
</chapter>
<chapter title="새 프로젝트 생성" id="new-project">
    <p>
        기존 프로젝트에서 Ktor 클라이언트를 수동으로 <Links href="/ktor/client-create-and-configure" summary="Ktor 클라이언트를 생성하고 구성하는 방법을 알아봅니다.">생성하고 구성</Links>할 수 있습니다. 그러나 처음부터 시작하는 편리한 방법은 IntelliJ IDEA에 번들된 Kotlin 플러그인을 사용하여 새 프로젝트를 생성하는 것입니다.
    </p>
    <p>
        새 Kotlin 프로젝트를 생성하려면
        <a href="https://www.jetbrains.com/help/idea/run-for-the-first-time.html">IntelliJ IDEA를 열고</a> 다음 단계를 따르세요:
    </p>
    <procedure>
        <step>
            <p>
                시작 화면에서 <control>New Project</control>를 클릭하세요.
            </p>
            <p>
                또는 주 메뉴에서 <ui-path>File | New | Project</ui-path>를 선택하세요.
            </p>
        </step>
        <step>
            <p>
                <control>New Project</control>
                마법사에서 왼쪽 목록에서
                <control>Kotlin</control>
                을 선택하세요.
            </p>
        </step>
        <step>
            <p>
                오른쪽 창에서 다음 설정을 지정하세요:
            </p>
            <img src="client_get_started_new_project.png" alt="New Kotlin project window in intelliJ IDEA"
                 border-effect="rounded"
                 width="706"/>
            <list id="kotlin_app_settings">
                <li>
                    <p>
                        <control>Name</control>
                        : 프로젝트 이름을 지정하세요.
                    </p>
                </li>
                <li>
                    <p>
                        <control>Location</control>
                        : 프로젝트 디렉터리를 지정하세요.
                    </p>
                </li>
                <li>
                    <p>
                        <control>Build system</control>
                        :
                        <control>Gradle</control>
                        이 선택되었는지 확인하세요.
                    </p>
                </li>
                <li>
                    <p>
                        <control>Gradle DSL</control>
                        :
                        <control>Kotlin</control>
                        을 선택하세요.
                    </p>
                </li>
                <li>
                    <p>
                        <control>Add sample code</control>
                        : 생성된 프로젝트에 샘플 코드를 포함하려면 이 옵션을 선택하세요.
                    </p>
                </li>
            </list>
        </step>
        <step>
            <p>
                <control>Create</control>
                를 클릭하고 IntelliJ IDEA가 프로젝트를 생성하고 의존성을 설치할 때까지 기다리세요.
            </p>
        </step>
    </procedure>
</chapter>
<chapter title="의존성 추가" id="add-dependencies">
    <p>
        Ktor 클라이언트에 필요한 의존성을 추가해 보겠습니다.
    </p>
    <procedure>
        <step>
            <p>
                <Path>gradle.properties</Path>
                파일을 열고 Ktor 버전을 지정하기 위해 다음 줄을 추가하세요:
            </p>
            <code-block lang="kotlin" code="                    ktor_version=%ktor_version%"/>
            <note id="eap-note">
                <p>
                    Ktor의 EAP 버전을 사용하려면 <a href="#repositories">Space 저장소</a>를 추가해야 합니다.
                </p>
            </note>
        </step>
        <step>
            <p>
                <Path>build.gradle.kts</Path>
                파일을 열고 다음 아티팩트를 의존성 블록에 추가하세요:
            </p>
            <code-block lang="kotlin" code="val ktor_version: String by project&#10;&#10;dependencies {&#10;    implementation(&quot;io.ktor:ktor-client-core:$ktor_version&quot;)&#10;    implementation(&quot;io.ktor:ktor-client-cio:$ktor_version&quot;)&#10;}"/>
            <list>
                <li><code>ktor-client-core</code>는 주요 클라이언트 기능을 제공하는 핵심 의존성입니다.
                </li>
                <li>
                    <code>ktor-client-cio</code>는 네트워크 요청을 처리하는 <Links href="/ktor/client-engines" summary="네트워크 요청을 처리하는 엔진에 대해 알아봅니다.">엔진</Links>을 위한 의존성입니다.
                </li>
            </list>
        </step>
        <step>
            <p>
                <Path>build.gradle.kts</Path>
                파일의 오른쪽 상단 모서리에 있는
                <control>Load Gradle Changes</control>
                아이콘을 클릭하여 새로 추가된 의존성을 설치하세요.
            </p>
            <img src="client_get_started_load_gradle_changes_name.png" alt="Load Gradle Changes" width="706"/>
        </step>
    </procedure>
</chapter>
<chapter title="클라이언트 생성" id="create-client">
    <p>
        클라이언트 구현을 추가하려면
        <Path>src/main/kotlin</Path>
        으로 이동하여 다음 단계를 따르세요:
    </p>
    <procedure>
        <step>
            <p>
                <Path>Main.kt</Path>
                파일을 열고 기존 코드를 다음 구현으로 교체하세요:
            </p>
            <code-block lang="kotlin" code="                    import io.ktor.client.*&#10;                    import io.ktor.client.engine.cio.*&#10;&#10;                    fun main() {&#10;                        val client = HttpClient(CIO)&#10;                    }"/>
            <p>
                Ktor에서 클라이언트는 <a
                    href="https://api.ktor.io/ktor-client/ktor-client-core/io.ktor.client/-http-client/index.html">HttpClient</a>
                클래스로 표현됩니다.
            </p>
        </step>
        <step>
            <p>
                <a href="https://api.ktor.io/ktor-client/ktor-client-core/io.ktor.client.request/get.html"><code>HttpClient.get()</code></a> 메서드를 사용하여 <Links href="/ktor/client-requests" summary="요청 URL, HTTP 메서드, 헤더, 요청 본문 등 다양한 요청 매개변수를 지정하고 요청을 생성하는 방법을 알아봅니다.">GET 요청을 생성</Links>하세요. <Links href="/ktor/client-responses" summary="응답을 받고, 응답 본문을 얻고, 응답 매개변수를 얻는 방법을 알아봅니다.">응답</Links>은 <code>HttpResponse</code> 클래스 객체로 수신됩니다.
            </p>
            <code-block lang="kotlin" code="                    import io.ktor.client.*&#10;                    import io.ktor.client.engine.cio.*&#10;                    import io.ktor.client.request.*&#10;                    import io.ktor.client.statement.*&#10;&#10;                    fun main() {&#10;                        val client = HttpClient(CIO)&#10;                        val response: HttpResponse = client.get(&quot;https://ktor.io/&quot;)&#10;                    }"/>
            <p>
                위 코드를 추가하면 IDE는 <code>get()</code> 함수에 대해 다음 오류를 표시합니다:
                <emphasis>suspend 함수 'get'은 코루틴 또는 다른 suspend 함수에서만 호출되어야 합니다.</emphasis>
            </p>
            <img src="client_get_started_suspend_error.png" alt="Suspend function error" width="706"/>
            <p>
                이를 해결하려면 <code>main()</code> 함수를 suspend 함수로 만들어야 합니다.
            </p>
            <tip>
                <code>suspend</code> 함수 호출에 대한 자세한 내용은 <a
                    href="https://kotlinlang.org/docs/coroutines-basics.html">코루틴 기본 사항</a>을 참조하세요.
            </tip>
        </step>
        <step>
            <p>
                IntelliJ IDEA에서 정의 옆의 빨간 전구를 클릭하고
                <control>Make main suspend</control>
                를 선택하세요.
            </p>
            <img src="client_get_started_suspend_error_fix.png" alt="Make main suspend" width="706"/>
        </step>
        <step>
            <p>
                <code>println()</code> 함수를 사용하여 서버에서 반환된 <a href="#status">상태 코드</a>를 출력하고, <code>close()</code> 함수를 사용하여 스트림을 닫고 연결된 모든 리소스를 해제합니다.
                <Path>Main.kt</Path>
                파일은 다음과 같아야 합니다:
            </p>
            <code-block lang="kotlin" code="import io.ktor.client.*&#10;import io.ktor.client.engine.cio.*&#10;import io.ktor.client.request.*&#10;import io.ktor.client.statement.*&#10;&#10;suspend fun main() {&#10;    val client = HttpClient(CIO)&#10;    val response: HttpResponse = client.get(&quot;https://ktor.io/&quot;)&#10;    println(response.status)&#10;    client.close()&#10;}"/>
        </step>
    </procedure>
</chapter>
<chapter title="애플리케이션 실행" id="make-request">
    <p>
        애플리케이션을 실행하려면
        <Path>Main.kt</Path>
        파일로 이동하여 다음 단계를 따르세요:
    </p>
    <procedure>
        <step>
            <p>
                IntelliJ IDEA에서 <code>main()</code> 함수 옆의 거터 아이콘을 클릭하고
                <control>Run 'MainKt'</control>
                를 선택하세요.
            </p>
            <img src="client_get_started_run_main.png" alt="Run app" width="706"/>
        </step>
        <step>
            IntelliJ IDEA가 애플리케이션을 실행할 때까지 기다리세요.
        </step>
        <step>
            <p>
                IDE 하단의
                <control>Run</control>
                창에 출력이 표시됩니다.
            </p>
            <img src="client_get_started_run_output_with_warning.png" alt="Server response" width="706"/>
            <p>
                서버가 <code>200 OK</code> 메시지로 응답하더라도, SLF4J가 <code>StaticLoggerBinder</code> 클래스를 찾지 못해 no-operation (NOP) 로거 구현으로 기본 설정되었다는 오류 메시지가 표시됩니다. 이는 로깅이 비활성화되었음을 의미합니다.
            </p>
            <p>
                이제 작동하는 클라이언트 애플리케이션이 있습니다. 그러나 이 경고를 수정하고 로깅을 통해 HTTP 호출을 디버그하려면 <a href="#enable-logging">추가 단계</a>가 필요합니다.
            </p>
        </step>
    </procedure>
</chapter>
<chapter title="로깅 활성화" id="enable-logging">
    <p>
        Ktor는 JVM 로깅을 위해 SLF4J 추상화 계층을 사용하므로, 로깅을 활성화하려면 <a href="#jvm">로깅 프레임워크</a>(예: <a href="https://logback.qos.ch/">Logback</a>)를 제공해야 합니다.
    </p>
    <procedure id="enable-logging-procedure">
        <step>
            <p>
                <Path>gradle.properties</Path>
                파일에서 로깅 프레임워크의 버전을 지정하세요:
            </p>
            <code-block lang="kotlin" code="                    logback_version=%logback_version%"/>
        </step>
        <step>
            <p>
                <Path>build.gradle.kts</Path>
                파일을 열고 다음 아티팩트를 의존성 블록에 추가하세요:
            </p>
            <code-block lang="kotlin" code="                    //...&#10;                    val logback_version: String by project&#10;&#10;                    dependencies {&#10;                        //...&#10;                        implementation(&quot;ch.qos.logback:logback-classic:$logback_version&quot;)&#10;                    }"/>
        </step>
        <step>
            <control>Load Gradle Changes</control>
            아이콘을 클릭하여 새로 추가된 의존성을 설치하세요.
        </step>
        <step>
            <p>
                IntelliJ IDEA에서 다시 실행 버튼(<img src="intellij_idea_rerun_icon.svg"
                                                       style="inline" height="16" width="16"
                                                       alt="intelliJ IDEA rerun icon"/>)을 클릭하여 애플리케이션을 다시 시작하세요.
            </p>
        </step>
        <step>
            <p>
                더 이상 오류가 표시되지 않지만, IDE 하단의
                <control>Run</control>
                창에는 동일한 <code>200 OK</code> 메시지가 표시됩니다.
            </p>
            <img src="client_get_started_run_output.png" alt="Server response" width="706"/>
            <p>
                이로써 로깅을 활성화했습니다. 로그를 확인하려면 로깅 구성을 추가해야 합니다.
            </p>
        </step>
        <step>
            <p>
                <Path>src/main/resources</Path>
                로 이동하여 다음 구현으로 새
                <Path>logback.xml</Path>
                파일을 생성하세요:
            </p>
            <code-block lang="xml" ignore-vars="true" code="                    &lt;configuration&gt;&#10;                        &lt;appender name=&quot;APPENDER&quot; class=&quot;ch.qos.logback.core.ConsoleAppender&quot;&gt;&#10;                            &lt;encoder&gt;&#10;                                &lt;pattern&gt;%d{YYYY-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n&lt;/pattern&gt;&#10;                            &lt;/encoder&gt;&#10;                        &lt;/appender&gt;&#10;                        &lt;root level=&quot;trace&quot;&gt;&#10;                            undefined&#10;                        &lt;/root&gt;&#10;                    &lt;/configuration&gt;"/>
        </step>
        <step>
            <p>
                IntelliJ IDEA에서 다시 실행 버튼(<img src="intellij_idea_rerun_icon.svg"
                                                       style="inline" height="16" width="16"
                                                       alt="intelliJ IDEA rerun icon"/>)을 클릭하여 애플리케이션을 다시 시작하세요.
            </p>
        </step>
        <step>
            <p>
                이제
                <control>Run</control>
                창에서 출력된 응답 위에 트레이스 로그가 표시될 것입니다:
            </p>
            <img src="client_get_started_run_output_with_logs.png" alt="Server response" width="706"/>
        </step>
    </procedure>
    <tip>
        Ktor는 <Links href="/ktor/client-logging" summary="필수 의존성: io.ktor:ktor-client-logging 코드 예시: %example_name%">로깅</Links> 플러그인을 통해 HTTP 호출에 대한 로그를 추가하는 간단하고 직접적인 방법을 제공하는 반면, 구성 파일을 추가하면 복잡한 애플리케이션에서 로깅 동작을 세밀하게 조정할 수 있습니다.
    </tip>
</chapter>
<chapter title="다음 단계" id="next-steps">
    <p>
        이 구성을 더 잘 이해하고 확장하려면 <Links href="/ktor/client-create-and-configure" summary="Ktor 클라이언트를 생성하고 구성하는 방법을 알아봅니다.">Ktor 클라이언트를 생성하고 구성하는 방법</Links>을 살펴보세요.
    </p>
</chapter>
</topic>