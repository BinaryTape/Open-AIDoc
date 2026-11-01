<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       title="Kotlin과 Ktor로 웹사이트 만들기" id="server-create-website">
<show-structure for="chapter,procedure" depth="3"/>
<tldr>
    <var name="example_name" value="tutorial-server-web-application"/>
    <p>
        <b>코드 예제</b>:
        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
            %example_name%
        </a>
    </p>
    <p>
        <b>사용된 플러그인</b>: <Links href="server-static-content.md" summary="스타일시트, 스크립트, 이미지 등과 같은 정적 콘텐츠를 제공하는 방법을 알아봅니다.">Static Content</Links>,
        <Links href="server-thymeleaf.md" summary="필수 의존성: io.ktor:%artifact_name% 코드 예제: %example_name% 네이티브 서버 지원: ✖️">Thymeleaf</Links>
    </p>
</tldr>
<web-summary>
    Ktor와 Kotlin으로 웹사이트를 구축하는 방법을 알아봅니다. 이 튜토리얼에서는 Thymeleaf 템플릿과 Ktor 라우트를 결합하여 서버 측에서 HTML 기반 사용자 인터페이스를 생성하는 방법을 보여줍니다.
</web-summary>
<card-summary>
    Kotlin, Ktor 및 Thymeleaf 템플릿을 사용하여 웹사이트를 구축하는 방법을 알아봅니다.
</card-summary>
<link-summary>
    Kotlin, Ktor 및 Thymeleaf 템플릿을 사용하여 웹사이트를 구축하는 방법을 알아봅니다.
</link-summary>
<p>
    이 튜토리얼에서는 Kotlin과 Ktor, 그리고 <a href="https://www.thymeleaf.org/">Thymeleaf</a> 템플릿을 사용하여 대화형 웹사이트를 구축하는 방법을 알아봅니다.
</p>
<p>
    <Links href="server-create-restful-apis.topic" summary="JSON 파일을 생성하는 RESTful API 예제를 통해 Kotlin과 Ktor를 사용한 백엔드 서비스 구축 방법을 알아봅니다.">이전 튜토리얼</Links>에서는 JavaScript로 작성된 싱글 페이지 애플리케이션(SPA)에서 사용할 RESTful 서비스를 만드는 방법을 배웠습니다. 이는 매우 인기 있는 아키텍처이지만 모든 프로젝트에 적합한 것은 아닙니다.
</p>
<p>
    다음과 같이 모든 구현을 서버에 유지하고 클라이언트에는 마크업만 전송하고자 하는 데에는 여러 이유가 있습니다.
</p>
<list>
    <li>단순성 – 단일 코드베이스를 유지 관리할 수 있습니다.</li>
    <li>보안성 – 공격자에게 힌트를 줄 수 있는 데이터나 코드가 브라우저에 배치되는 것을 방지합니다.
    </li>
    <li>
        지원 범위 – 구형 브라우저 및 JavaScript가 비활성화된 환경을 포함하여 가능한 한 폭넓은 클라이언트를 지원할 수 있습니다.
    </li>
</list>
<p>
    Ktor는 <Links href="server-templating.md" summary="HTML/CSS 또는 JVM 템플릿 엔진으로 빌드된 뷰를 사용하는 방법을 알아봅니다.">여러 서버 페이지 기술</Links>과의 연동을 통해 이러한 방식을 지원합니다.
</p>
<chapter title="사전 준비 사항" id="prerequisites">
    <p>
        이 튜토리얼을 독립적으로 진행할 수도 있지만, RESTful API 생성 방법을 다룬 <Links href="server-create-restful-apis.topic" summary="JSON 파일을 생성하는 RESTful API 예제를 통해 Kotlin과 Ktor를 사용한 백엔드 서비스 구축 방법을 알아봅니다.">이전 튜토리얼</Links>을 먼저 완료하는 것을 강력히 권장합니다.
    </p>
    <p><a href="https://www.jetbrains.com/help/idea/installation-guide.html">IntelliJ IDEA</a>를 설치하는 것을 권장하지만, 원하는 다른 IDE를 사용해도 좋습니다.
    </p>
</chapter>
<chapter title="Hello Task Manager 웹 애플리케이션" id="hello-task-manager">
    <p>
        이 튜토리얼에서는 <Links href="server-create-restful-apis.topic" summary="JSON 파일을 생성하는 RESTful API 예제를 통해 Kotlin과 Ktor를 사용한 백엔드 서비스 구축 방법을 알아봅니다.">이전 튜토리얼</Links>에서 빌드한 태스크 관리 애플리케이션을 웹 애플리케이션으로 전환해 봅니다. 이를 위해 몇 가지 Ktor <Links href="server-plugins.md" summary="플러그인은 직렬화, 콘텐츠 인코딩, 압축 등의 공통 기능을 제공합니다.">플러그인</Links>을 사용합니다.
    </p>
    <p>
        기존 프로젝트에 이러한 플러그인을 직접 추가할 수도 있지만, 새 프로젝트를 생성한 후 이전 튜토리얼의 코드를 점진적으로 가져오는 것이 더 수월합니다. 필요한 코드는 진행 과정에서 모두 제공되므로 이전 프로젝트를 바로 준비해 두지 않아도 됩니다.
    </p>
    <procedure title="플러그인을 포함한 초기 프로젝트 생성" id="create-project">
        <step>
            <p>
                <a href="https://start.ktor.io/">Ktor Project Generator</a>로 이동합니다.
            </p>
        </step>
        <step>
            <p>
                <control>Project artifact</control>
                필드에 프로젝트 아티팩트 이름으로
                <Path>com.example.ktor-task-web-app</Path>
                을 입력합니다.
                <img src="server_create_web_app_generator_project_artifact.png"
                     alt="Ktor Project Generator 프로젝트 아티팩트 이름"
                     style="block"
                     border-effect="line" width="706"/>
            </p>
        </step>
        <step>
            <p> 다음 화면에서 <control>Add</control> 버튼을 클릭하여 아래 플러그인을 검색하고 추가합니다.
            </p>
            <list>
                <li>Static Content</li>
                <li>Thymeleaf</li>
            </list>
            <p>
                <img src="ktor_project_generator_add_plugins.gif"
                     alt="Ktor Project Generator에서 플러그인 추가"
                     border-effect="line"
                     style="block"
                     width="706"/>
                플러그인을 추가하고 나면 프로젝트 설정 아래에 세 개의 플러그인이 모두 나열된 것을 확인할 수 있습니다.
                <img src="server_create_web_app_generator_plugins.png"
                     alt="Ktor Project Generator 플러그인 목록"
                     style="block"
                     border-effect="line" width="706"/>
            </p>
        </step>
        <step>
            <p>
                <control>Download</control>
                버튼을 클릭하여 Ktor 프로젝트를 생성하고 다운로드합니다.
            </p>
        </step>
    </procedure>
    <procedure title="스타터 코드 추가" id="add-starter-code">
        <step>
            IntelliJ IDEA 또는 원하는 다른 IDE에서 프로젝트를 엽니다.
        </step>
        <step>
            <Path>src/main/kotlin</Path>
            으로 이동하여
            <Path>model</Path>
            이라는 하위 패키지를 만듭니다.
        </step>
        <step>
            <Path>model</Path>
            패키지 안에 새
            <Path>Task.kt</Path>
            파일을 생성합니다.
        </step>
        <step>
            <p>
                <Path>Task.kt</Path>
                파일에 우선순위를 나타내는 <code>enum</code>과 작업을 나타내는 <code>data class</code>를 추가합니다.
            </p>
            <code-block lang="kotlin" code="package com.example.model&#10;&#10;enum class Priority {&#10;    Low, Medium, High, Vital&#10;}&#10;&#10;data class Task(&#10;    val name: String,&#10;    val description: String,&#10;    val priority: Priority&#10;)"/>
            <p>
                이번에도 <code>Task</code> 객체를 생성하여 화면에 표시할 수 있는 형태로 클라이언트에 전송하고자 합니다.
            </p>
            <p>
                이전 단계를 되짚어 보면 다음과 같습니다.
            </p>
            <list>
                <li>
                    <Links href="server-requests-and-responses.topic" summary="태스크 관리자 애플리케이션을 구축하며 Kotlin과 Ktor의 라우팅, 요청 처리 및 매개변수 기초를 알아봅니다.">요청 처리 및 응답 생성</Links>
                    튜토리얼에서는 태스크를 HTML로 변환하는 확장 함수를 직접 작성하여 추가했습니다.
                </li>
                <li>
                    <Links href="server-create-restful-apis.topic" summary="JSON 파일을 생성하는 RESTful API 예제를 통해 Kotlin과 Ktor를 사용한 백엔드 서비스 구축 방법을 알아봅니다.">RESTful API 생성</Links> 튜토리얼에서는
                    <code>Task</code> 클래스에 <code>kotlinx.serialization</code> 라이브러리의 <code>Serializable</code> 어노테이션을 지정했습니다.
                </li>
            </list>
            <p>
                이 튜토리얼의 목표는 태스크의 내용을 브라우저에 출력하는 서버 페이지를 만드는 것입니다.
            </p>
        </step>
        <step>
            <Path>src/main/kotlin</Path>
            에 있는
            <Path>Routing.kt</Path>
            파일을 엽니다.
        </step>
        <step>
            <p>
                <code>.configureRouting()</code> 함수에 아래와 같이 <code>/tasks</code> 라우트를 추가합니다.
            </p>
            <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    routing {&#10;        get(&quot;/&quot;) {&#10;            call.respondText(&quot;Hello, World!&quot;)&#10;        }&#10;        get(&quot;/html-thymeleaf&quot;) {&#10;            call.respond(ThymeleafContent(&quot;index&quot;, mapOf(&quot;user&quot; to ThymeleafUser(1, &quot;user1&quot;))))&#10;        }&#10;        // Add this additional route&#10;        get(&quot;/tasks&quot;) {&#10;            val tasks = listOf(&#10;                Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;                Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;                Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;                Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;            )&#10;            call.respond(ThymeleafContent(&quot;all-tasks&quot;, mapOf(&quot;tasks&quot; to tasks)))&#10;        }&#10;        staticResources(&quot;/static&quot;, &quot;static&quot;)&#10;    }&#10;}"/>
            <p>
                서버가 <code>/tasks</code>에 대한 요청을 받으면 태스크 목록을 생성한 다음 Thymeleaf 템플릿에 전달합니다. <code>ThymeleafContent</code> 타입은 실행할 템플릿의 이름과 페이지에서 접근할 값들의 테이블(Map)을 매개변수로 받습니다.
            </p>
        </step>
        <step>
            <Path>src/main/kotlin</Path>
            에 있는
            <Path>Thymeleaf.kt</Path>
            파일을 엽니다.
        </step>
        <step>
            <p>다음과 같은 <code>.configureThymeleaf</code> 함수가 표시되어 있어야 합니다.</p>
            <code-block lang="kotlin" code="fun Application.configureThymeleaf() {&#10;    install(Thymeleaf) {&#10;        setTemplateResolver(ClassLoaderTemplateResolver().apply {&#10;            prefix = &quot;templates/thymeleaf/&quot;&#10;            suffix = &quot;.html&quot;&#10;            characterEncoding = &quot;utf-8&quot;&#10;        })&#10;    }&#10;}"/>
            <p>
                Thymeleaf 플러그인 초기화 설정에서 Ktor는 서버 페이지를 찾기 위해
                <Path>templates/thymeleaf</Path>
                폴더를 탐색합니다. 정적 콘텐츠와 마찬가지로, 이 폴더는
                <Path>resources</Path>
                디렉터리 내에 위치해야 합니다. 또한 파일 접미사로
                <Path>.html</Path>
                을 기대합니다.
            </p>
            <p>
                이 경우 <code>all-tasks</code>라는 이름은
                <code>src/main/resources/templates/thymeleaf/all-tasks.html</code> 경로와 매핑됩니다.
            </p>
        </step>
        <step>
            <Path>src/main/resources</Path>
            로 이동하여 새 <Path>templates/thymeleaf</Path>
            디렉터리를 만듭니다.
        </step>
        <step>
            <Path>src/main/resources/templates/thymeleaf</Path>
            안에 새
            <Path>all-tasks.html</Path>
            파일을 생성합니다.
        </step>
        <step>
            <p>
                <Path>all-tasks.html</Path>
                파일을 열고 아래 내용을 추가합니다.
            </p>
            <code-block lang="html" code="&lt;!DOCTYPE html &gt;&#10;&lt;html xmlns:th=&quot;http://www.thymeleaf.org&quot;&gt;&#10;&lt;head&gt;&#10;    &lt;meta charset=&quot;UTF-8&quot;&gt;&#10;    &lt;title&gt;All Current Tasks&lt;/title&gt;&#10;&lt;/head&gt;&#10;&lt;body&gt;&#10;&lt;h1&gt;All Current Tasks&lt;/h1&gt;&#10;&lt;table&gt;&#10;    &lt;thead&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Name&lt;/th&gt;&lt;th&gt;Description&lt;/th&gt;&lt;th&gt;Priority&lt;/th&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/thead&gt;&#10;    &lt;tbody&gt;&#10;    &lt;tr th:each=&quot;task: ${tasks}&quot;&gt;&#10;        &lt;td th:text=&quot;${task.name}&quot;&gt;&lt;/td&gt;&#10;        &lt;td th:text=&quot;${task.description}&quot;&gt;&lt;/td&gt;&#10;        &lt;td th:text=&quot;${task.priority}&quot;&gt;&lt;/td&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
        </step>
        <step>
            <p>IntelliJ IDEA에서 실행 버튼
                (<img src="intellij_idea_gutter_icon.svg"
                      style="inline" height="16" width="16"
                      alt="IntelliJ IDEA 실행 아이콘"/>)
                을 클릭하여 애플리케이션을 시작합니다.</p>
        </step>
        <step>
            <p>
                브라우저에서 <a href="http://0.0.0.0:8080/tasks">http://0.0.0.0:8080/tasks</a>로 이동합니다. 아래와 같이 모든 현재 작업이 테이블 형식으로 표시됩니다.
            </p>
            <img src="server_create_web_app_all_tasks.png"
                 alt="태스크 목록을 표시하는 웹 브라우저 창" border-effect="rounded" width="706"/>
            <p>
                모든 서버 페이지 프레임워크와 마찬가지로, Thymeleaf 템플릿은 정적 콘텐츠(브라우저로 전송됨)와 동적 콘텐츠(서버에서 실행됨)를 혼합하여 사용합니다. <a href="https://freemarker.apache.org/">Freemarker</a>와 같은 다른 대체 프레임워크를 선택했더라도 약간 다른 구문으로 동일한 기능을 구현할 수 있습니다.
            </p>
        </step>
    </procedure>
</chapter>
<chapter title="GET 라우트 추가" id="add-get-routes">
    <p>서버 페이지를 요청하는 과정에 익숙해졌으므로, 이제 이전 튜토리얼의 기능들을 이 프로젝트로 옮겨오는 작업을 계속 진행합니다.</p>
    <p><control>Static Content</control>
        플러그인을 포함했기 때문에
        <Path>Routing.kt</Path>
        파일에 다음 코드가 포함되어 있을 것입니다.
    </p>
    <code-block lang="kotlin" code="            staticResources(&quot;/static&quot;, &quot;static&quot;)"/>
    <p>
        이는 예를 들어 <code>/static/index.html</code>에 대한 요청이 발생하면 다음 경로에서 콘텐츠를 제공함을 의미합니다.
    </p>
    <code>src/main/resources/static/index.html</code>
    <p>
        이 파일은 이미 생성된 프로젝트의 일부로 포함되어 있으므로, 앞으로 추가할 기능들을 위한 홈 페이지로 활용할 수 있습니다.
    </p>
    <procedure title="index 페이지 재사용">
        <step>
            <p>
                <Path>src/main/resources/static</Path>
                내에 있는
                <Path>index.html</Path>
                파일을 열고 해당 내용을 아래 구현으로 바꿉니다.
            </p>
            <code-block lang="html" code="&lt;html&gt;&#10;&lt;head&gt;&#10;&lt;/head&gt;&#10;&lt;body&gt;&#10;&lt;h1&gt;Task Manager Web Application&lt;/h1&gt;&#10;&lt;div&gt;&#10;    &lt;h3&gt;&lt;a href=&quot;/tasks&quot;&gt;View all the tasks&lt;/a&gt;&lt;/h3&gt;&#10;&lt;/div&gt;&#10;&lt;div&gt;&#10;    &lt;h3&gt;View tasks by priority&lt;/h3&gt;&#10;    &lt;form method=&quot;get&quot; action=&quot;/tasks/byPriority&quot;&gt;&#10;        &lt;select name=&quot;priority&quot;&gt;&#10;            &lt;option name=&quot;Low&quot;&gt;Low&lt;/option&gt;&#10;            &lt;option name=&quot;Medium&quot;&gt;Medium&lt;/option&gt;&#10;            &lt;option name=&quot;High&quot;&gt;High&lt;/option&gt;&#10;            &lt;option name=&quot;Vital&quot;&gt;Vital&lt;/option&gt;&#10;        &lt;/select&gt;&#10;        &lt;input type=&quot;submit&quot;&gt;&#10;    &lt;/form&gt;&#10;&lt;/div&gt;&#10;&lt;div&gt;&#10;    &lt;h3&gt;View a task by name&lt;/h3&gt;&#10;    &lt;form method=&quot;get&quot; action=&quot;/tasks/byName&quot;&gt;&#10;        &lt;input type=&quot;text&quot; name=&quot;name&quot; width=&quot;10&quot;&gt;&#10;        &lt;input type=&quot;submit&quot;&gt;&#10;    &lt;/form&gt;&#10;&lt;/div&gt;&#10;&lt;div&gt;&#10;    &lt;h3&gt;Create or edit a task&lt;/h3&gt;&#10;    &lt;form method=&quot;post&quot; action=&quot;/tasks&quot;&gt;&#10;        &lt;div&gt;&#10;            &lt;label for=&quot;name&quot;&gt;Name: &lt;/label&gt;&#10;            &lt;input type=&quot;text&quot; id=&quot;name&quot; name=&quot;name&quot; size=&quot;10&quot;&gt;&#10;        &lt;/div&gt;&#10;        &lt;div&gt;&#10;            &lt;label for=&quot;description&quot;&gt;Description: &lt;/label&gt;&#10;            &lt;input type=&quot;text&quot; id=&quot;description&quot;&#10;                   name=&quot;description&quot; size=&quot;20&quot;&gt;&#10;        &lt;/div&gt;&#10;        &lt;div&gt;&#10;            &lt;label for=&quot;priority&quot;&gt;Priority: &lt;/label&gt;&#10;            &lt;select id=&quot;priority&quot; name=&quot;priority&quot;&gt;&#10;                &lt;option name=&quot;Low&quot;&gt;Low&lt;/option&gt;&#10;                &lt;option name=&quot;Medium&quot;&gt;Medium&lt;/option&gt;&#10;                &lt;option name=&quot;High&quot;&gt;High&lt;/option&gt;&#10;                &lt;option name=&quot;Vital&quot;&gt;Vital&lt;/option&gt;&#10;            &lt;/select&gt;&#10;        &lt;/div&gt;&#10;        &lt;input type=&quot;submit&quot;&gt;&#10;    &lt;/form&gt;&#10;&lt;/div&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
        </step>
        <step>
            <p>
                IntelliJ IDEA에서 재실행 버튼(<img src="intellij_idea_rerun_icon.svg"
                                               style="inline" height="16" width="16"
                                               alt="IntelliJ IDEA 재실행 아이콘"/>)을 클릭하여 애플리케이션을 다시 시작합니다.
            </p>
        </step>
        <step>
            <p>
                브라우저에서 <a href="http://localhost:8080/static/index.html">http://localhost:8080/static/index.html</a>로 이동합니다. 링크 버튼과 작업을 조회, 필터링, 생성할 수 있는 세 개의 HTML 폼이 표시됩니다.
            </p>
            <img src="server_create_web_app_tasks_form.png"
                 alt="HTML 폼을 표시하는 웹 브라우저" border-effect="rounded" width="706"/>
            <p>
                <code>name</code> 또는 <code>priority</code>별로 태스크를 필터링할 때는 GET 요청을 통해 HTML 폼을 제출한다는 점에 유의하세요. 즉, 매개변수가 URL 뒤의 쿼리 스트링(query string)에 추가됩니다.
            </p>
            <p>
                예를 들어 <code>Medium</code> 우선순위의 작업을 검색하는 경우, 서버로 전송되는 요청은 다음과 같습니다.
            </p>
            <code>http://localhost:8080/tasks/byPriority?priority=Medium</code>
        </step>
    </procedure>
    <procedure title="태스크 리포지토리 재사용" id="task-repository">
        <p>
            태스크용 리포지토리는 이전 튜토리얼의 코드와 완전히 동일하게 유지할 수 있습니다.
        </p>
        <p>
            <Path>model</Path>
            패키지 안에 새
            <Path>TaskRepository.kt</Path>
            파일을 만들고 아래 코드를 추가합니다.
        </p>
        <code-block lang="kotlin" code="package com.example.model&#10;&#10;object TaskRepository {&#10;    private val tasks = mutableListOf(&#10;        Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;        Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;        Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;        Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;    )&#10;&#10;    fun allTasks(): List&lt;Task&gt; = tasks&#10;&#10;    fun tasksByPriority(priority: Priority) = tasks.filter {&#10;        it.priority == priority&#10;    }&#10;&#10;    fun taskByName(name: String) = tasks.find {&#10;        it.name.equals(name, ignoreCase = true)&#10;    }&#10;&#10;    fun addTask(task: Task) {&#10;        if (taskByName(task.name) != null) {&#10;            throw IllegalStateException(&quot;Cannot duplicate task names!&quot;)&#10;        }&#10;        tasks.add(task)&#10;    }&#10;}"/>
    </procedure>
    <procedure title="GET 요청을 위한 라우트 재사용" id="reuse-routes">
        <p>
            리포지토리를 만들었으므로 이제 GET 요청을 처리할 라우트를 구현할 수 있습니다.
        </p>
        <step>
            <Path>src/main/kotlin</Path>
            에 있는
            <Path>Routing.kt</Path>
            파일로 이동합니다.
        </step>
        <step>
            <p>
                현재의 <code>.configureRouting()</code> 버전을 아래 구현으로 대체합니다.
            </p>
            <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    routing {&#10;        get(&quot;/&quot;) {&#10;            call.respondText(&quot;Hello, World!&quot;)&#10;        }&#10;        get(&quot;/html-thymeleaf&quot;) {&#10;            call.respond(ThymeleafContent(&quot;index&quot;, mapOf(&quot;user&quot; to ThymeleafUser(1, &quot;user1&quot;))))&#10;        }&#10;        staticResources(&quot;/static&quot;, &quot;static&quot;)&#10;&#10;        route(&quot;/tasks&quot;) {&#10;            get {&#10;                val tasks = TaskRepository.allTasks()&#10;                call.respond(&#10;                    ThymeleafContent(&quot;all-tasks&quot;, mapOf(&quot;tasks&quot; to tasks))&#10;                )&#10;            }&#10;            get(&quot;/byName&quot;) {&#10;                val name = call.request.queryParameters[&quot;name&quot;]&#10;                if (name == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@get&#10;                }&#10;                val task = TaskRepository.taskByName(name)&#10;                if (task == null) {&#10;                    call.respond(HttpStatusCode.NotFound)&#10;                    return@get&#10;                }&#10;                call.respond(&#10;                    ThymeleafContent(&quot;single-task&quot;, mapOf(&quot;task&quot; to task))&#10;                )&#10;            }&#10;            get(&quot;/byPriority&quot;) {&#10;                val priorityAsText = call.request.queryParameters[&quot;priority&quot;]&#10;                if (priorityAsText == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@get&#10;                }&#10;                try {&#10;                    val priority = Priority.valueOf(priorityAsText)&#10;                    val tasks = TaskRepository.tasksByPriority(priority)&#10;&#10;&#10;                    if (tasks.isEmpty()) {&#10;                        call.respond(HttpStatusCode.NotFound)&#10;                        return@get&#10;                    }&#10;                    val data = mapOf(&#10;                        &quot;priority&quot; to priority,&#10;                        &quot;tasks&quot; to tasks&#10;                    )&#10;                    call.respond(ThymeleafContent(&quot;tasks-by-priority&quot;, data))&#10;                } catch (ex: IllegalArgumentException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
            <p>
                위 코드는 다음과 같이 요약할 수 있습니다.
            </p>
            <list>
                <li>
                    <code>/tasks</code>로의 GET 요청 시, 서버는 리포지토리에서 모든 작업을 가져와
                    <Path>all-tasks</Path>
                    템플릿을 사용하여 브라우저로 전송될 다음 뷰를 생성합니다.
                </li>
                <li>
                    <code>/tasks/byName</code>으로의 GET 요청 시, 서버는 <code>queryString</code>에서 <code>name</code> 매개변수를 가져와 일치하는 태스크를 찾고,
                    <Path>single-task</Path>
                    템플릿을 사용하여 브라우저로 전송될 다음 뷰를 생성합니다.
                </li>
                <li>
                    <code>/tasks/byPriority</code>로의 GET 요청 시, 서버는 <code>queryString</code>에서
                    <code>priority</code> 매개변수를 가져와 일치하는 태스크들을 찾고,
                    <Path>tasks-by-priority</Path>
                    템플릿을 사용하여 브라우저로 전송될 다음 뷰를 생성합니다.
                </li>
            </list>
            <p>이 모든 것이 정상 작동하려면 추가 템플릿을 생성해야 합니다.</p>
        </step>
        <step>
            <Path>src/main/resources/templates/thymeleaf</Path>
            로 이동하여 새
            <Path>single-task.html</Path>
            파일을 만듭니다.
        </step>
        <step>
            <p>
                <Path>single-task.html</Path>
                파일을 열고 다음 내용을 추가합니다.
            </p>
            <code-block lang="html" code="&lt;!DOCTYPE html &gt;&#10;&lt;html xmlns:th=&quot;http://www.thymeleaf.org&quot;&gt;&#10;&lt;head&gt;&#10;    &lt;meta charset=&quot;UTF-8&quot;&gt;&#10;    &lt;title&gt;All Current Tasks&lt;/title&gt;&#10;&lt;/head&gt;&#10;&lt;body&gt;&#10;&lt;h1&gt;The Selected Task&lt;/h1&gt;&#10;&lt;table&gt;&#10;    &lt;tbody&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Name&lt;/th&gt;&#10;        &lt;td th:text=&quot;${task.name}&quot;&gt;&lt;/td&gt;&#10;    &lt;/tr&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Description&lt;/th&gt;&#10;        &lt;td th:text=&quot;${task.description}&quot;&gt;&lt;/td&gt;&#10;    &lt;/tr&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Priority&lt;/th&gt;&#10;        &lt;td th:text=&quot;${task.priority}&quot;&gt;&lt;/td&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
        </step>
        <step>
            <p>동일한 폴더에
                <Path>tasks-by-priority.html</Path>
                이라는 새 파일을 만듭니다.
            </p>
        </step>
        <step>
            <p>
                <Path>tasks-by-priority.html</Path>
                파일을 열고 다음 내용을 추가합니다.
            </p>
            <code-block lang="html" code="&lt;!DOCTYPE html&gt;&#10;&lt;html xmlns:th=&quot;http://www.thymeleaf.org&quot;&gt;&#10;&lt;head&gt;&#10;    &lt;meta charset=&quot;UTF-8&quot;&gt;&#10;    &lt;title&gt;Tasks By Priority &lt;/title&gt;&#10;&lt;/head&gt;&#10;&lt;body&gt;&#10;&lt;h1&gt;Tasks With Priority &lt;span th:text=&quot;${priority}&quot;&gt;&lt;/span&gt;&lt;/h1&gt;&#10;&lt;table&gt;&#10;    &lt;thead&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Name&lt;/th&gt;&#10;        &lt;th&gt;Description&lt;/th&gt;&#10;        &lt;th&gt;Priority&lt;/th&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/thead&gt;&#10;    &lt;tbody&gt;&#10;    &lt;tr th:each=&quot;task: ${tasks}&quot;&gt;&#10;        &lt;td th:text=&quot;${task.name}&quot;&gt;&lt;/td&gt;&#10;        &lt;td th:text=&quot;${task.description}&quot;&gt;&lt;/td&gt;&#10;        &lt;td th:text=&quot;${task.priority}&quot;&gt;&lt;/td&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
        </step>
    </procedure>
</chapter>
<chapter title="POST 요청 지원 추가" id="add-post-requests">
    <p>
        다음으로, 아래 작업을 수행할 수 있도록 <code>/tasks</code>에 POST 요청 핸들러를 추가합니다.
    </p>
    <list>
        <li>폼 매개변수에서 정보를 추출합니다.</li>
        <li>리포지토리를 사용하여 새 태스크를 추가합니다.</li>
        <li>
            <control>all-tasks</control>
            템플릿을 재사용하여 태스크 목록을 표시합니다.
        </li>
    </list>
    <procedure>
        <step>
            <Path>src/main/kotlin</Path>
            에 있는
            <Path>Routing.kt</Path>
            파일로 이동합니다.
        </step>
        <step>
            <p>
                <code>.configureRouting()</code> 메서드 내에 다음 <code>post</code> 요청 라우트를 추가합니다.
            </p>
            <code-block lang="kotlin" code="            post {&#10;                val formContent = call.receiveParameters()&#10;                val params = Triple(&#10;                    formContent[&quot;name&quot;] ?: &quot;&quot;,&#10;                    formContent[&quot;description&quot;] ?: &quot;&quot;,&#10;                    formContent[&quot;priority&quot;] ?: &quot;&quot;&#10;                )&#10;                if (params.toList().any { it.isEmpty() }) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@post&#10;                }&#10;                try {&#10;                    val priority = Priority.valueOf(params.third)&#10;                    TaskRepository.addTask(&#10;                        Task(&#10;                            params.first,&#10;                            params.second,&#10;                            priority&#10;                        )&#10;                    )&#10;                    val tasks = TaskRepository.allTasks()&#10;                    call.respond(&#10;                        ThymeleafContent(&quot;all-tasks&quot;, mapOf(&quot;tasks&quot; to tasks))&#10;                    )&#10;                } catch (ex: IllegalArgumentException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                } catch (ex: IllegalStateException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                }&#10;            }"/>
        </step>
        <step>
            <p>
                IntelliJ IDEA에서 재실행 버튼(<img src="intellij_idea_rerun_icon.svg"
                                               style="inline" height="16" width="16"
                                               alt="IntelliJ IDEA 재실행 아이콘"/>)을 클릭하여 애플리케이션을 다시 시작합니다.
            </p>
        </step>
        <step>
            브라우저에서 <a href="http://0.0.0.0:8080/static/index.html">http://0.0.0.0:8080/static/index.html</a>로 이동합니다.
        </step>
        <step>
            <p>
                <control>Create or edit a task</control>
                폼에 새 태스크 세부 정보를 입력합니다.
            </p>
            <img src="server_create_web_app_new_task.png"
                 alt="HTML 폼을 표시하는 웹 브라우저" border-effect="rounded" width="706"/>
        </step>
        <step>
            <p><control>Submit</control>
                버튼을 클릭하여 폼을 제출합니다.
                그러면 전체 태스크 목록에 새 태스크가 추가되어 표시되는 것을 확인할 수 있습니다.
            </p>
            <img src="server_create_web_app_new_task_added.png"
                 alt="태스크 목록을 표시하는 웹 브라우저" border-effect="rounded" width="706"/>
        </step>
    </procedure>
</chapter>
<chapter title="다음 단계" id="next-steps">
    <p>
        축하합니다! Task Manager를 웹 애플리케이션으로 성공적으로 다시 구축하고 Thymeleaf 템플릿을 사용하는 방법을 배웠습니다.</p>
    <p>
        WebSocket을 다루는 방법을 알아보려면 <Links href="server-create-websocket-application.topic" summary="WebSocket의 강력한 기능을 활용하여 콘텐츠를 주고받는 방법을 알아봅니다.">다음 튜토리얼</Links>로 진행하세요.
    </p>
</chapter>
</topic>