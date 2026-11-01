<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       title="Ktor와 Kotlin을 사용하여 HTTP 요청을 처리하고 응답 생성하기" id="server-requests-and-responses">
<show-structure for="chapter,procedure" depth="2"/>
<tldr>
    <var name="example_name" value="tutorial-server-routing-and-requests"/>
    <p>
        <b>코드 예제</b>:
        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
            %example_name%
        </a>
    </p>
</tldr>
<link-summary>
    태스크 관리자(Task Manager) 애플리케이션을 빌드하며 Kotlin 및 Ktor를 통한 라우팅, 요청 처리, 파라미터 기초를 학습합니다.
</link-summary>
<card-summary>
    태스크 관리자 애플리케이션을 만들어 보며 Ktor에서 라우팅과 요청이 작동하는 방식을 알아봅니다.
</card-summary>
<web-summary>
    Kotlin과 Ktor로 생성한 서비스의 유효성 검증, 에러 처리, 단위 테스트 기본 사항을 알아봅니다.
</web-summary>
<p>
    이 튜토리얼에서는 태스크 관리자 애플리케이션을 빌드하면서 Kotlin과 Ktor를 사용한 라우팅, 요청 처리 및 파라미터의 기본 사항을 배웁니다.
</p>
<p>
    이 튜토리얼을 마치면 다음 작업을 수행할 수 있게 됩니다.
</p>
<list type="bullet">
    <li>GET 및 POST 요청 처리하기</li>
    <li>요청에서 정보 추출하기</li>
    <li>데이터 변환 시 에러 처리하기</li>
    <li>단위 테스트를 사용하여 라우팅 검증하기</li>
</list>
<chapter title="사전 준비 사항" id="prerequisites">
    <p>
        이 문서는 Ktor Server 시작하기 가이드의 두 번째 튜토리얼입니다. 이 튜토리얼을 독립적으로 진행할 수도 있지만, 이전 튜토리얼인 <Links href="server-create-a-new-project.topic" summary="Ktor를 사용하여 서버 애플리케이션을 열고, 실행하고, 테스트하는 방법을 알아봅니다.">새 Ktor 프로젝트 생성, 열기 및 실행</Links>을 완료하는 것을 적극 권장합니다.
    </p>
    <p>HTTP 요청 유형, 헤더 및 상태 코드에 대한 기본적인 이해가 있으면 도움이 됩니다.</p>
    <p><a href="https://www.jetbrains.com/help/idea/installation-guide.html">IntelliJ
        IDEA</a> 설치를 권장하지만, 원하는 다른 IDE를 사용해도 무방합니다.
    </p>
</chapter>
<chapter title="태스크 관리자 애플리케이션" id="sample-application">
    <p>이 튜토리얼에서는 다음과 같은 기능을 가진 태스크 관리자 애플리케이션을 점진적으로 빌드합니다.</p>
    <list type="bullet">
        <li>사용 가능한 모든 태스크를 HTML 테이블로 조회</li>
        <li>우선순위 및 이름별로 태스크를 HTML로 조회</li>
        <li>HTML 폼을 제출하여 새로운 태스크 추가</li>
    </list>
    <p>
        우선 기본 기능이 작동하도록 최소한의 작업을 진행한 다음, 7단계의 이터레이션을 거쳐 기능을 개선하고 확장합니다. 이 최소 기능은 모델 타입, 값 목록 및 단일 라우트를 포함하는 프로젝트로 구성됩니다.
    </p>
</chapter>
<chapter title="정적 HTML 콘텐츠 표시하기" id="display-static-html">
    <p>첫 번째 단계에서는 정적 HTML 콘텐츠를 반환하는 새로운 라우트를 애플리케이션에 추가합니다.</p>
    <p><a href="https://start.ktor.io">Ktor Project Generator</a>를 사용하여
        <control>Project artifact</control>
        이름을
        <control>com.example.ktor-task-app</control>으로 설정하고 새 프로젝트를 생성합니다.
    </p>
    <tip>
        새 프로젝트 생성에 대한 자세한 내용은 <Links href="server-create-a-new-project.topic" summary="Ktor를 사용하여 서버 애플리케이션을 열고, 실행하고, 테스트하는 방법을 알아봅니다.">새 Ktor 프로젝트 생성, 열기 및 실행</Links>을 참조하세요. 최근에 해당 튜토리얼을 완료했다면 그곳에서 생성한 프로젝트를 재사용해도 좋습니다.
    </tip>
    <procedure>
        <step>
            <Path>src/main/kotlin</Path>
            폴더 내의
            <Path>Routing.kt</Path>
            파일을 엽니다.
        </step>
        <step>
            <p>기존의 <code>Application.configureRouting()</code> 함수를 아래 구현으로 교체합니다.</p>
            <code-block lang="kotlin" code="                        fun Application.configureRouting() {&#10;                            routing {&#10;                                get(&quot;/tasks&quot;) {&#10;                                    call.respondText(&#10;                                        contentType = ContentType.parse(&quot;text/html&quot;),&#10;                                            text = &quot;&quot;&quot;&#10;                                        &lt;h3&gt;TODO:&lt;/h3&gt;&#10;                                        &lt;ol&gt;&#10;                                            &lt;li&gt;A table of all the tasks&lt;/li&gt;&#10;                                            &lt;li&gt;A form to submit new tasks&lt;/li&gt;&#10;                                        &lt;/ol&gt;&#10;                                        &quot;&quot;&quot;.trimIndent()&#10;                                    )&#10;                                }&#10;                            }&#10;                        }"/>
            <p>이렇게 하면 <code>/tasks</code> URL과 GET 요청 유형에 대한 새로운 라우트가 생성됩니다.
                GET 요청은 HTTP에서 가장 기본적인 요청 유형입니다. 사용자가 브라우저 주소 표시줄에 입력하거나 일반 HTML 링크를 클릭할 때 트리거됩니다. </p>
            <p>
                지금은 정적 콘텐츠만 반환합니다. 클라이언트에 HTML을 전송한다는 것을 알리기 위해 HTTP <code>Content-Type</code> 헤더를 <code>"text/html"</code>로 설정합니다.
            </p>
        </step>
        <step>
            <p>
                <code>ContentType</code> 객체에 접근할 수 있도록 IDE에서 다음 import 문을 자동으로 추가합니다.
            </p>
            <code-block lang="kotlin" code="                    import io.ktor.http.ContentType"/>
        </step>
        <step>
            <p>IntelliJ IDEA에서
                <Path>main.kt</Path>
                파일의 <code>main()</code> 함수 옆에 있는 실행 거터 아이콘(<img alt="IntelliJ IDEA 애플리케이션 실행 아이콘"
                                                                    src="intellij_idea_gutter_icon.svg" height="16"
                                                                    width="16"/>)을 클릭하여 애플리케이션을 시작합니다.
            </p>
        </step>
        <step>
            <p>
                브라우저에서 <a href="http://0.0.0.0:8080/tasks">http://0.0.0.0:8080/tasks</a>로 이동합니다. to-do 목록이 표시되는 것을 확인할 수 있습니다.
            </p>
            <img src="tutorial_routing_and_requests_implementation_1.png"
                 alt="두 개의 항목이 있는 할 일 목록을 표시하는 브라우저 창"
                 border-effect="rounded"
                 width="706"/>
        </step>
    </procedure>
</chapter>
<chapter title="태스크 모델 구현하기" id="implement-a-task-model">
    <p>
        이제 프로젝트를 생성하고 기본 라우팅을 설정했으므로, 다음 작업을 수행하여 애플리케이션을 확장합니다.
    </p>
    <list type="decimal">
        <li><a href="#create-model-types">태스크를 표현하는 모델 타입 생성</a></li>
        <li><a href="#create-sample-values">샘플 값을 포함하는 태스크 목록 선언</a></li>
        <li><a href="#add-a-route">이 목록을 반환하도록 라우트와 요청 핸들러 수정</a></li>
        <li><a href="#test">브라우저를 사용하여 새 기능이 작동하는지 테스트</a></li>
    </list>
    <procedure title="모델 타입 생성" id="create-model-types">
        <step>
            <p>
                <Path>src/main/kotlin</Path>
                내에
                <Path>model</Path>
                이라는 새 하위 패키지를 생성합니다.
            </p>
        </step>
        <step>
            <p>
                <Path>model</Path>
                디렉터리 내에 새로운
                <Path>Task.kt</Path>
                파일을 생성합니다.
            </p>
        </step>
        <step>
            <p>
                <Path>Task.kt</Path>
                파일을 열고 우선순위를 나타내는 다음 <code>enum</code>과 태스크를 나타내는 <code>class</code>를 추가합니다.
            </p>
            <code-block lang="kotlin" code="package com.example.model&#10;&#10;enum class Priority {&#10;    Low, Medium, High, Vital&#10;}&#10;&#10;data class Task(&#10;    val name: String,&#10;    val description: String,&#10;    val priority: Priority&#10;)"/>
        </step>
        <step>
            <p>태스크 정보는 HTML 테이블 형태로 클라이언트에 전송됩니다.
                동일한 <Path>Task.kt</Path> 파일에 다음 확장 함수들을 추가합니다.</p>
            <code-block lang="kotlin" code="                    fun Task.taskAsRow() = &quot;&quot;&quot;&#10;                        &lt;tr&gt;&#10;                            &lt;td&gt;$name&lt;/td&gt;&lt;td&gt;$description&lt;/td&gt;&lt;td&gt;$priority&lt;/td&gt;&#10;                        &lt;/tr&gt;&#10;                        &quot;&quot;&quot;.trimIndent()&#10;&#10;                    fun List&lt;Task&gt;.tasksAsTable() = this.joinToString(&#10;                        prefix = &quot;&lt;table rules=\&quot;all\&quot;&gt;&quot;,&#10;                        postfix = &quot;&lt;/table&gt;&quot;,&#10;                        separator = &quot;\n&quot;,&#10;                        transform = Task::taskAsRow&#10;                    )"/>
            <list>
                <li><code>Task.taskAsRow()</code> 함수는 <code>Task</code> 객체를 테이블 행으로 렌더링할 수 있도록 합니다.</li>
                <li><code>List&lt;Task&gt;.tasksAsTable()</code> 함수는 태스크 목록을 테이블로 렌더링할 수 있도록 합니다.</li>
            </list>
        </step>
    </procedure>
    <procedure title="샘플 값 생성" id="create-sample-values">
        <step>
            <p>
                <Path>model</Path>
                디렉터리 내에 새로운
                <Path>TaskRepository.kt</Path>
                파일을 생성합니다.
            </p>
        </step>
        <step>
            <p>
                <Path>TaskRepository.kt</Path>를 열고 다음 코드를 추가하여 Task 목록을 정의합니다.
            </p>
            <code-block lang="kotlin" code="package com.example.model&#10;&#10;    private val tasks = mutableListOf(&#10;        Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;        Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;        Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;        Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;    )"/>
        </step>
    </procedure>
    <procedure title="새로운 라우트 추가" id="add-a-route">
        <step>
            <p>
                <Path>Routing.kt</Path>
                파일을 열고 기존 <code>Application.configureRouting()</code> 함수를 아래 구현으로 교체합니다.
            </p>
            <code-block lang="kotlin" code="                    fun Application.configureRouting() {&#10;                        routing {&#10;                            get(&quot;/tasks&quot;) {&#10;                                call.respondText(&#10;                                    contentType = ContentType.parse(&quot;text/html&quot;),&#10;                                    text = tasks.tasksAsTable()&#10;                                )&#10;                            }&#10;                        }&#10;                    }"/>
            <p>
                이제 클라이언트에 정적 콘텐츠를 반환하는 대신 태스크 목록을 제공합니다. 목록을 네트워크를 통해 직접 보낼 수는 없으므로, 클라이언트가 이해할 수 있는 형식으로 변환해야 합니다. 이 경우 태스크는 HTML 테이블로 변환됩니다.
            </p>
        </step>
        <step>
            <p>필요한 import 문을 추가합니다.</p>
            <code-block lang="kotlin" code="                    import com.example.model.*"/>
        </step>
    </procedure>
    <procedure title="새로운 기능 테스트" id="test">
        <step>
            <p>IntelliJ IDEA에서 재실행 버튼(<img alt="IntelliJ IDEA 재실행 버튼 아이콘"
                                                 src="intellij_idea_rerun_icon.svg"
                                                 height="16"
                                                 width="16"/>)을 클릭하여 애플리케이션을 다시 시작합니다.</p>
        </step>
        <step>
            <p>브라우저에서 <a href="http://0.0.0.0:8080/tasks">http://0.0.0.0:8080/tasks</a>로 이동합니다.
                태스크가 포함된 HTML 테이블이 표시되어야 합니다.</p>
            <img src="tutorial_routing_and_requests_implementation_2.png"
                 alt="4개의 행으로 이루어진 표를 표시하는 브라우저 창"
                 border-effect="rounded"
                 width="706"/>
            <p>정상적으로 표시된다면 축하합니다! 애플리케이션의 기본 기능이 올바르게 동작하고 있습니다.</p>
        </step>
    </procedure>
</chapter>
<chapter title="모델 리팩터링" id="refactor-the-model">
    <p>
        애플리케이션의 기능을 확장하기 전에, 값 목록을 리포지토리 내에 캡슐화하여 설계를 리팩터링하겠습니다. 이렇게 하면 데이터 관리를 중앙 집중화할 수 있어 Ktor 전용 코드에 집중할 수 있게 됩니다.
    </p>
    <procedure>
        <step>
            <p>
                <Path>TaskRepository.kt</Path>
                파일로 돌아가 기존 태스크 목록을 아래 코드로 교체합니다.
            </p>
            <code-block lang="kotlin" code="package com.example.model&#10;&#10;object TaskRepository {&#10;&#10;    private val tasks = mutableListOf(&#10;        Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;        Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;        Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;        Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;    )&#10;    fun allTasks(): List&lt;Task&gt; = tasks.toList()&#10;&#10;    fun tasksByPriority(priority: Priority) = tasks.filter {&#10;        it.priority == priority&#10;    }&#10;&#10;    fun taskByName(name: String) = tasks.find {&#10;        it.name.equals(name, ignoreCase = true)&#10;    }&#10;&#10;    fun addTask(task: Task) {&#10;        if(taskByName(task.name) != null) {&#10;            throw IllegalStateException(&quot;Cannot duplicate task names!&quot;)&#10;        }&#10;        tasks.add(task)&#10;    }&#10;}"/>
            <p>
                이 코드는 리스트를 기반으로 태스크를 위한 기본적인 데이터 저장소를 구현합니다. 예시를 위해 태스크가 추가된 순서는 보존되지만, 예외를 던짐으로써 중복은 허용되지 않습니다.</p>
            <p>이후 튜토리얼에서는 <a href="https://github.com/JetBrains/Exposed">Exposed 라이브러리</a>를 통해 관계형 데이터베이스에 연결하는 리포지토리를 구현하는 방법을 배웁니다.
            </p>
            <p>
                지금은 라우트 내부에서 이 리포지토리를 사용하겠습니다.
            </p>
        </step>
        <step>
            <p>
                <Path>Routing.kt</Path>
                파일을 열고 기존의 <code>Application.configureRouting()</code> 함수를 아래 구현으로 교체합니다.
            </p>
            <code-block lang="Kotlin" code="                    fun Application.configureRouting() {&#10;                        routing {&#10;                            get(&quot;/tasks&quot;) {&#10;                                val tasks = TaskRepository.allTasks()&#10;                                call.respondText(&#10;                                    contentType = ContentType.parse(&quot;text/html&quot;),&#10;                                    text = tasks.tasksAsTable()&#10;                                )&#10;                            }&#10;                        }&#10;                    }"/>
            <p>
                요청이 들어오면 리포지토리를 사용하여 현재 태스크 목록을 가져옵니다. 그런 다음 이 태스크들을 포함하는 HTTP 응답을 작성합니다.
            </p>
        </step>
    </procedure>
    <procedure title="리팩터링된 코드 테스트">
        <step>
            <p>IntelliJ IDEA에서 재실행 버튼(<img alt="IntelliJ IDEA 재실행 버튼 아이콘"
                                                 src="intellij_idea_rerun_icon.svg" height="16"
                                                 width="16"/>)을 클릭하여 애플리케이션을 다시 시작합니다.</p>
        </step>
        <step>
            <p>
                브라우저에서 <a href="http://0.0.0.0:8080/tasks">http://0.0.0.0:8080/tasks</a>로 이동합니다. HTML 테이블이 표시된 상태로 결과는 이전과 동일해야 합니다.
            </p>
            <img src="tutorial_routing_and_requests_implementation_2.png"
                 alt="4개의 행으로 이루어진 표를 표시하는 브라우저 창"
                 border-effect="rounded"
                 width="706"/>
        </step>
    </procedure>
</chapter>
<chapter title="파라미터 다루기" id="work-with-parameters">
    <p>
        이번 단계에서는 사용자가 우선순위별로 태스크를 볼 수 있도록 합니다. 이를 위해 애플리케이션은 다음 URL에 대한 GET 요청을 허용해야 합니다.
    </p>
    <list type="bullet">
        <li><a href="http://0.0.0.0:8080/tasks/byPriority/Low"><code>/tasks/byPriority/Low</code></a></li>
        <li><a href="http://0.0.0.0:8080/tasks/byPriority/Medium"><code>/tasks/byPriority/Medium</code></a></li>
        <li><a href="http://0.0.0.0:8080/tasks/byPriority/High"><code>/tasks/byPriority/High</code></a></li>
        <li><a href="http://0.0.0.0:8080/tasks/byPriority/Vital"><code>/tasks/byPriority/Vital</code></a></li>
    </list>
    <p>
        추가할 라우트는 <code>/tasks/byPriority/{priority?}</code>입니다.
        여기서 <code>{priority?}</code>는 런타임에 추출해야 하는 경로 파라미터(path parameter)를 나타내며, 물음표는 파라미터가 선택 사항임을 나타내는 데 사용됩니다. 경로 파라미터 이름은 원하는 대로 지정할 수 있지만, <code>priority</code>가 가장 명확한 선택입니다.
    </p>
    <p>
        요청을 처리하는 프로세스는 다음과 같이 요약할 수 있습니다.
    </p>
    <list type="decimal">
        <li>요청에서 <code>priority</code>라는 경로 파라미터를 추출합니다.</li>
        <li>이 파라미터가 없으면 <code>400 Bad Request</code> 상태를 반환합니다.</li>
        <li>파라미터의 텍스트 값을 <code>Priority</code> 열거형(enum) 값으로 변환합니다.</li>
        <li>변환에 실패하면 <code>400</code> 상태 코드가 포함된 응답을 반환합니다.</li>
        <li>리포지토리를 사용하여 지정된 우선순위를 가진 모든 태스크를 찾습니다.</li>
        <li>일치하는 태스크가 없으면 <code>404 Not Found</code> 상태를 반환합니다.</li>
        <li>일치하는 태스크를 HTML 테이블 형식으로 반환합니다.</li>
    </list>
    <p>
        먼저 이 기능을 구현한 다음, 정상적으로 작동하는지 확인하는 최선의 방법을 알아보겠습니다.
    </p>
    <procedure title="새로운 라우트 추가">
        <p>
            <Path>Routing.kt</Path>
            파일을 열고 코드에 다음 라우트를 추가합니다.
        </p>
        <code-block lang="kotlin" code="                routing {&#10;                    get(&quot;/tasks&quot;) {&#10;                        //...&#10;                    }&#10;&#10;                    // 다음 라우트 추가&#10;                    get(&quot;/tasks/byPriority/{priority?}&quot;) {&#10;                        val priorityAsText = call.parameters[&quot;priority&quot;]&#10;                        if (priorityAsText == null) {&#10;                            call.respond(HttpStatusCode.BadRequest)&#10;                            return@get&#10;                        }&#10;&#10;                        try {&#10;                            val priority = Priority.valueOf(priorityAsText)&#10;                            val tasks = TaskRepository.tasksByPriority(priority)&#10;&#10;                            if (tasks.isEmpty()) {&#10;                                call.respond(HttpStatusCode.NotFound)&#10;                                return@get&#10;                            }&#10;&#10;                            call.respondText(&#10;                                contentType = ContentType.parse(&quot;text/html&quot;),&#10;                                text = tasks.tasksAsTable()&#10;                            )&#10;                        } catch(ex: IllegalArgumentException) {&#10;                            call.respond(HttpStatusCode.BadRequest)&#10;                        }&#10;                    }&#10;                }"/>
        <p>
            위 코드를 통해 <code>/tasks/byPriority/{priority?}</code> URL에 대한 핸들러를 작성했습니다.
            심볼 <code>priority</code>는 사용자가 전달한 경로 파라미터를 나타냅니다. 안타깝게도 서버 측에서는 이 값이 해당 Kotlin enum의 4가지 값 중 하나임을 보장할 방법이 없으므로 수동으로 확인해야 합니다.
        </p>
        <p>
            경로 파라미터가 없으면 서버는 클라이언트에 <code>400</code> 상태 코드를 반환합니다. 파라미터가 있는 경우 값을 추출하여 열거형의 멤버로 변환을 시도합니다. 이 작업이 실패하면 예외가 발생하며, 서버는 이를 포착하여 <code>400</code> 상태 코드를 반환합니다.
        </p>
        <p>
            변환에 성공하면 리포지토리를 사용하여 일치하는 <code>Task</code>를 찾습니다. 지정된 우선순위의 태스크가 없으면 서버는 <code>404</code> 상태 코드를 반환하고, 태스크가 있으면 일치하는 항목을 HTML 테이블에 담아 다시 전송합니다.
        </p>
    </procedure>
    <procedure title="새로운 라우트 테스트">
        <p>
            브라우저에서 여러 URL을 요청하여 이 기능을 테스트할 수 있습니다.
        </p>
        <step>
            <p>IntelliJ IDEA에서 재실행 버튼(<img alt="IntelliJ IDEA 재실행 버튼 아이콘"
                                                 src="intellij_idea_rerun_icon.svg"
                                                 height="16"
                                                 width="16"/>)을 클릭하여 애플리케이션을 다시 시작합니다.</p>
        </step>
        <step>
            <p>
                보통(Medium) 우선순위 태스크를 모두 조회하려면 <a
                    href="http://0.0.0.0:8080/tasks/byPriority/Medium">http://0.0.0.0:8080/tasks/byPriority/Medium</a>으로 이동합니다.
            </p>
            <img src="tutorial_routing_and_requests_implementation_4.png"
                 alt="Medium 우선순위 태스크 표를 표시하는 브라우저 창"
                 border-effect="rounded"
                 width="706"/>
        </step>
        <step>
            <p>
                그러나 에러가 발생하는 경우 브라우저를 통한 테스트에는 한계가 있습니다. 개발자 도구 확장을 사용하지 않는 한 브라우저는 실패한 응답의 세부 정보를 보여주지 않습니다. 더 간단한 대안은 <a
                    href="https://learning.postman.com/docs/sending-requests/requests/">Postman</a>과 같은 전문 도구를 사용하는 것입니다.
            </p>
        </step>
        <step>
            <p>
                Postman에서 동일한 URL인
                <code>http://0.0.0.0:8080/tasks/byPriority/Medium</code>
                으로 GET 요청을 보냅니다.
            </p>
            <img src="tutorial_routing_and_requests_postman.png"
                 alt="응답 세부 정보를 보여주는 Postman의 GET 요청"
                 border-effect="rounded"
                 width="706"/>
            <p>
                여기에는 서버의 원시 출력과 함께 요청 및 응답의 모든 세부 정보가 표시됩니다.
            </p>
        </step>
        <step>
            <p>
                Vital 태스크 요청 시 <code>404</code> 상태 코드가 반환되는지 확인하려면,
                <code>http://0.0.0.0:8080/tasks/byPriority/Vital</code>
                로 새 GET 요청을 전송합니다. 그러면
                <control>Response</control>
                패널의 오른쪽 상단에 상태 코드가 표시됩니다.
            </p>
            <img src="tutorial_routing_and_requests_postman_vital.png"
                 alt="상태 코드를 보여주는 Postman의 GET 요청"
                 border-effect="rounded"
                 width="706"/>
        </step>
        <step>
            <p>
                잘못된 우선순위를 지정했을 때 <code>400</code> 상태 코드가 반환되는지 확인하려면, 유효하지 않은 프로퍼티 값으로 다른 GET 요청을 생성합니다.
            </p>
            <img src="tutorial_routing_and_requests_postman_bad_request.png"
                 alt="Bad Request 상태 코드를 보여주는 Postman의 GET 요청"
                 border-effect="rounded"
                 width="706"/>
        </step>
    </procedure>
</chapter>
<chapter title="단위 테스트 추가하기" id="add-unit-tests">
    <p>
        지금까지 두 개의 라우트(모든 태스크를 조회하는 라우트와 우선순위별로 태스크를 조회하는 라우트)를 추가했습니다. Postman과 같은 도구를 사용하면 이러한 라우트를 완벽하게 테스트할 수 있지만, 수동으로 확인해야 하고 Ktor 외부에서 실행된다는 점이 있습니다.
    </p>
    <p>
        프로토타입을 제작하거나 소규모 애플리케이션을 개발할 때는 이러한 방식도 괜찮습니다. 하지만 자주 실행해야 하는 수천 개의 테스트가 있을 수 있는 대규모 애플리케이션에는 적합하지 않습니다. 더 나은 해결책은 테스트를 완전히 자동화하는 것입니다.
    </p>
    <p>
        Ktor는 라우트의 자동화된 검증을 지원하기 위해 자체 <Links href="server-testing.md" summary="전용 테스트 엔진을 사용하여 서버 애플리케이션을 테스트하는 방법을 알아봅니다.">테스트 프레임워크</Links>를 제공합니다.
        이제 앱의 기존 기능에 대한 테스트를 작성해 보겠습니다.
    </p>
    <procedure>
        <step>
            <p>
                <Path>src/test/kotlin</Path>
                폴더로 이동하여
                <Path>ServerTest.kt</Path>
                파일을 엽니다.
            </p>
        </step>
        <step>
            <p>
                <Path>ServerTest.kt</Path>
                파일에 다음 코드를 추가합니다.
            </p>
            <code-block lang="kotlin" code="package com.example&#10;&#10;import io.ktor.client.request.get&#10;import io.ktor.client.request.header&#10;import io.ktor.client.request.post&#10;import io.ktor.client.request.setBody&#10;import io.ktor.client.statement.bodyAsText&#10;import io.ktor.http.ContentType&#10;import io.ktor.http.HttpHeaders&#10;import io.ktor.http.HttpStatusCode&#10;import io.ktor.http.formUrlEncode&#10;import io.ktor.server.testing.testApplication&#10;import kotlin.test.*&#10;&#10;class ServerTest {&#10;    @Test&#10;    fun tasksCanBeFoundByPriority() = testApplication {&#10;        configure()&#10;&#10;        val response = client.get(&quot;/tasks/byPriority/Medium&quot;)&#10;        val body = response.bodyAsText()&#10;&#10;        assertEquals(HttpStatusCode.OK, response.status)&#10;        assertContains(body, &quot;Mow the lawn&quot;)&#10;        assertContains(body, &quot;Paint the fence&quot;)&#10;    }&#10;&#10;    @Test&#10;    fun invalidPriorityProduces400() = testApplication {&#10;        configure()&#10;&#10;        val response = client.get(&quot;/tasks/byPriority/Invalid&quot;)&#10;        assertEquals(HttpStatusCode.BadRequest, response.status)&#10;    }&#10;&#10;    @Test&#10;    fun unusedPriorityProduces404() = testApplication {&#10;        configure()&#10;&#10;        val response = client.get(&quot;/tasks/byPriority/Vital&quot;)&#10;        assertEquals(HttpStatusCode.NotFound, response.status)&#10;    }&#10;}"/>
            <p>
                이 테스트들 각각에서는 Ktor의 새 인스턴스가 생성됩니다. 이는 Netty와 같은 웹 서버 대신 테스트 환경 내부에서 실행됩니다. Project Generator가 작성한 모듈이 로드되고, 이어서 라우팅 함수가 호출됩니다. 그런 다음 내장된 <code>client</code> 객체를 사용하여 애플리케이션에 요청을 보내고, 반환된 응답을 검증할 수 있습니다.
            </p>
            <p>
                테스트는 IDE 내부에서 실행하거나 CI/CD 파이프라인의 일부로 실행할 수 있습니다.
            </p>
        </step>
        <step>
            <p>IntelliJ IDEA 내에서 테스트를 실행하려면 각 테스트 함수 옆에 있는 거터 아이콘(<img
                    alt="IntelliJ IDEA 거터 아이콘"
                    src="intellij_idea_gutter_icon.svg"
                    width="16" height="26"/>)을 클릭합니다.</p>
            <tip>
                IntelliJ IDEA에서 단위 테스트를 실행하는 방법에 대한 자세한 내용은 <a
                    href="https://www.jetbrains.com/help/idea/performing-tests.html">IntelliJ IDEA 문서</a>를 참조하세요.
            </tip>
        </step>
    </procedure>
</chapter>
<chapter title="POST 요청 처리하기" id="handle-post-requests">
    <p>
        위에서 설명한 과정을 따라 원하는 수만큼 GET 요청에 대한 라우트를 추가할 수 있습니다. 이를 통해 사용자는 원하는 검색 기준을 사용하여 태스크를 조회할 수 있습니다. 하지만 사용자가 새 태스크를 생성할 수 있기를 원할 수도 있습니다.
    </p>
    <p>
        이러한 경우에 적합한 HTTP 요청 유형은 POST입니다. POST 요청은 일반적으로 사용자가 HTML 폼을 작성하고 제출할 때 트리거됩니다.
    </p>
    <p>
        GET 요청과 달리 POST 요청에는 폼에 있는 모든 입력 요소의 이름과 값을 포함하는 <code>body</code>가 있습니다. 이 정보는 각 입력 필드의 데이터를 구분하고 잘못된 문자를 이스케이프하도록 인코딩됩니다. 브라우저와 Ktor가 이를 대신 처리하므로 이 과정의 세부 사항에 대해 신경 쓸 필요는 없습니다.
    </p>
    <p>
        이제 다음 단계에 따라 새 태스크 생성을 허용하도록 기존 애플리케이션을 확장해 보겠습니다.
    </p>
    <list type="decimal">
        <li><a href="#create-static-content">HTML 폼을 포함하는 정적 콘텐츠 폴더 생성</a></li>
        <li><a href="#register-folder">콘텐츠를 서빙할 수 있도록 Ktor에 해당 폴더 등록</a></li>
        <li><a href="#add-form-handler">폼 제출을 처리할 새로운 요청 핸들러 추가</a></li>
        <li><a href="#test-functionality">완성된 기능 테스트</a></li>
    </list>
    <procedure title="정적 콘텐츠 생성" id="create-static-content">
        <step>
            <p>
                <Path>src/main/resources</Path>
                내에 <Path>task-ui</Path>라는 새 디렉터리를 생성합니다.
                이곳이 정적 콘텐츠를 저장할 폴더가 됩니다.
            </p>
        </step>
        <step>
            <p>
                <Path>task-ui</Path>
                폴더 내에 새로운
                <Path>task-form.html</Path>
                파일을 생성합니다.
            </p>
        </step>
        <step>
            <p>새로 생성한
                <Path>task-form.html</Path>
                파일을 열고 다음 내용을 추가합니다.
            </p>
            <code-block lang="html" code="&lt;!DOCTYPE html&gt;&#10;&lt;html lang=&quot;en&quot;&gt;&#10;&lt;head&gt;&#10;    &lt;meta charset=&quot;UTF-8&quot;&gt;&#10;    &lt;title&gt;Adding a new task&lt;/title&gt;&#10;&lt;/head&gt;&#10;&lt;body&gt;&#10;&lt;h1&gt;Adding a new task&lt;/h1&gt;&#10;&lt;form method=&quot;post&quot; action=&quot;/tasks&quot;&gt;&#10;    &lt;div&gt;&#10;        &lt;label for=&quot;name&quot;&gt;Name: &lt;/label&gt;&#10;        &lt;input type=&quot;text&quot; id=&quot;name&quot; name=&quot;name&quot; size=&quot;10&quot;&gt;&#10;    &lt;/div&gt;&#10;    &lt;div&gt;&#10;        &lt;label for=&quot;description&quot;&gt;Description: &lt;/label&gt;&#10;        &lt;input type=&quot;text&quot; id=&quot;description&quot; name=&quot;description&quot; size=&quot;20&quot;&gt;&#10;    &lt;/div&gt;&#10;    &lt;div&gt;&#10;        &lt;label for=&quot;priority&quot;&gt;Priority: &lt;/label&gt;&#10;        &lt;select id=&quot;priority&quot; name=&quot;priority&quot;&gt;&#10;            &lt;option name=&quot;Low&quot;&gt;Low&lt;/option&gt;&#10;            &lt;option name=&quot;Medium&quot;&gt;Medium&lt;/option&gt;&#10;            &lt;option name=&quot;High&quot;&gt;High&lt;/option&gt;&#10;            &lt;option name=&quot;Vital&quot;&gt;Vital&lt;/option&gt;&#10;        &lt;/select&gt;&#10;    &lt;/div&gt;&#10;    &lt;input type=&quot;submit&quot;&gt;&#10;&lt;/form&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
        </step>
    </procedure>
    <procedure title="Ktor에 폴더 등록" id="register-folder">
        <step>
            <p>
                <Path>src/main/kotlin</Path>
                내의
                <Path>Routing.kt</Path>
                파일로 이동합니다.
            </p>
        </step>
        <step>
            <p>
                <code>Application.configureRouting()</code> 함수 내에 다음과 같이 <code>staticResources()</code> 호출을 추가합니다.
            </p>
            <code-block lang="kotlin" code="                    fun Application.configureRouting() {&#10;                        routing {&#10;                            // 다음 라인 추가&#10;                            staticResources(&quot;/task-ui&quot;, &quot;task-ui&quot;)&#10;&#10;                            get(&quot;/tasks&quot;) {&#10;                                // ...&#10;                            }&#10;&#10;                            get(&quot;/tasks/byPriority/{priority?}&quot;) {&#10;                                //...&#10;                            }&#10;                        }&#10;                    }"/>
            <p>그러면 IDE가 다음 import 문을 자동으로 추가합니다.</p>
            <code-block lang="kotlin" code="                    import io.ktor.server.http.content.staticResources"/>
        </step>
        <step>
            <p>애플리케이션을 다시 시작합니다. </p>
        </step>
        <step>
            <p>
                브라우저에서 <a href="http://0.0.0.0:8080/task-ui/task-form.html">http://0.0.0.0:8080/task-ui/task-form.html</a>로 이동합니다. HTML 폼이 표시되어야 합니다.
            </p>
            <img src="tutorial_routing_and_requests_implementation_6.png"
                 alt="HTML 폼을 표시하는 브라우저 창"
                 border-effect="rounded"
                 width="706"/>
        </step>
    </procedure>
    <procedure title="폼 핸들러 추가" id="add-form-handler">
        <p>
            <Path>Routing.kt</Path> 파일에서 <code>.configureRouting()</code> 함수에 다음 라우트를 추가합니다.
        </p>
        <code-block lang="kotlin" code="                fun Application.configureRouting() {&#10;                    routing {&#10;                        //...&#10;&#10;                        // 다음 라우트 추가&#10;                        post(&quot;/tasks&quot;) {&#10;                            val formContent = call.receiveParameters()&#10;&#10;                            val params = Triple(&#10;                                formContent[&quot;name&quot;] ?: &quot;&quot;,&#10;                                formContent[&quot;description&quot;] ?: &quot;&quot;,&#10;                                formContent[&quot;priority&quot;] ?: &quot;&quot;&#10;                            )&#10;&#10;                            if (params.toList().any { it.isEmpty() }) {&#10;                                call.respond(HttpStatusCode.BadRequest)&#10;                                return@post&#10;                            }&#10;&#10;                            try {&#10;                                val priority = Priority.valueOf(params.third)&#10;                                TaskRepository.addTask(&#10;                                    Task(&#10;                                        params.first,&#10;                                        params.second,&#10;                                        priority&#10;                                    )&#10;                                )&#10;&#10;                                call.respond(HttpStatusCode.NoContent)&#10;                            } catch (ex: IllegalArgumentException) {&#10;                                call.respond(HttpStatusCode.BadRequest)&#10;                            } catch (ex: IllegalStateException) {&#10;                                call.respond(HttpStatusCode.BadRequest)&#10;                            }&#10;                        }&#10;                    }&#10;                }"/>
        <p>
            새 라우트는 GET 요청이 아닌 POST 요청에 매핑됩니다. Ktor는 <code>.receiveParameters()</code> 호출을 통해 요청 본문을 처리합니다. 이는 요청 본문에 있던 파라미터 컬렉션을 반환합니다.
        </p>
        <p>
            파라미터가 세 개이므로 연결된 값을 <a
                href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-triple/"><code>Triple</code></a>에 저장할 수 있습니다. 파라미터가 없으면 빈 문자열이 대신 저장됩니다.
        </p>
        <p>
            값 중 하나라도 비어 있으면 서버는 <code>400</code> 상태 코드의 응답을 반환합니다. 그런 다음 세 번째 파라미터를 <code>Priority</code>로 변환을 시도하고, 성공하면 새로운 <code>Task</code>에 담아 리포지토리에 정보를 추가합니다. 두 작업 모두 예외가 발생할 수 있으며, 이 경우 다시 한 번 <code>400</code> 상태 코드를 반환합니다.
        </p>
        <p>
            모든 처리가 성공하면 서버는 클라이언트에 <code>204 No Content</code> 상태 코드를 반환합니다. 이는 요청이 성공했지만 결과로 돌려보낼 새로운 정보가 없음을 의미합니다.
        </p>
    </procedure>
    <procedure title="완성된 기능 테스트" id="test-functionality">
        <step>
            <p>
                애플리케이션을 다시 시작합니다.
            </p>
        </step>
        <step>
            <p>브라우저에서 <a href="http://0.0.0.0:8080/task-ui/task-form.html">http://0.0.0.0:8080/task-ui/task-form.html</a>로 이동합니다.
            </p>
        </step>
        <step>
            <p>
                폼에 샘플 데이터를 입력하고
                <control>Submit</control>을 클릭합니다.
            </p>
            <img src="tutorial_routing_and_requests_iteration_6_test_1.png"
                 alt="샘플 데이터가 입력된 HTML 폼을 표시하는 브라우저 창"
                 border-effect="rounded"
                 width="706"/>
            <p>폼을 제출해도 새 페이지로 이동하지 않아야 합니다.</p>
        </step>
        <step>
            <p>
                URL <a href="http://0.0.0.0:8080/tasks">http://0.0.0.0:8080/tasks</a>로 이동합니다. 새로운 태스크가 추가된 것을 확인할 수 있습니다.
            </p>
            <img src="tutorial_routing_and_requests_iteration_6_test_2.png"
                 alt="태스크 표를 표시하는 브라우저 창"
                 border-effect="rounded"
                 width="706"/>
        </step>
        <step>
            <p>
                기능을 검증하기 위해 <Path>ServerTest.kt</Path> 파일에 다음 테스트를 추가합니다.
            </p>
            <code-block lang="kotlin"
                        include-symbol="newTasksCanBeAdded" code="package com.example&#10;&#10;import io.ktor.client.request.get&#10;import io.ktor.client.request.header&#10;import io.ktor.client.request.post&#10;import io.ktor.client.request.setBody&#10;import io.ktor.client.statement.bodyAsText&#10;import io.ktor.http.ContentType&#10;import io.ktor.http.HttpHeaders&#10;import io.ktor.http.HttpStatusCode&#10;import io.ktor.http.formUrlEncode&#10;import io.ktor.server.testing.testApplication&#10;import kotlin.test.*&#10;&#10;class ServerTest {&#10;    @Test&#10;    fun tasksCanBeFoundByPriority() = testApplication {&#10;        configure()&#10;&#10;        val response = client.get(&quot;/tasks/byPriority/Medium&quot;)&#10;        val body = response.bodyAsText()&#10;&#10;        assertEquals(HttpStatusCode.OK, response.status)&#10;        assertContains(body, &quot;Mow the lawn&quot;)&#10;        assertContains(body, &quot;Paint the fence&quot;)&#10;    }&#10;&#10;    @Test&#10;    fun invalidPriorityProduces400() = testApplication {&#10;        configure()&#10;&#10;        val response = client.get(&quot;/tasks/byPriority/Invalid&quot;)&#10;        assertEquals(HttpStatusCode.BadRequest, response.status)&#10;    }&#10;&#10;    @Test&#10;    fun unusedPriorityProduces404() = testApplication {&#10;        configure()&#10;&#10;        val response = client.get(&quot;/tasks/byPriority/Vital&quot;)&#10;        assertEquals(HttpStatusCode.NotFound, response.status)&#10;    }&#10;&#10;    @Test&#10;    fun newTasksCanBeAdded() = testApplication {&#10;        configure()&#10;&#10;        val response1 = client.post(&quot;/tasks&quot;) {&#10;            header(&#10;                HttpHeaders.ContentType,&#10;                ContentType.Application.FormUrlEncoded.toString()&#10;            )&#10;            setBody(&#10;                listOf(&#10;                    &quot;name&quot; to &quot;swimming&quot;,&#10;                    &quot;description&quot; to &quot;Go to the beach&quot;,&#10;                    &quot;priority&quot; to &quot;Low&quot;&#10;                ).formUrlEncode()&#10;            )&#10;        }&#10;        assertEquals(HttpStatusCode.NoContent, response1.status)&#10;&#10;        val response2 = client.get(&quot;/tasks&quot;)&#10;        assertEquals(HttpStatusCode.OK, response2.status)&#10;        val body = response2.bodyAsText()&#10;&#10;        assertContains(body, &quot;swimming&quot;)&#10;        assertContains(body, &quot;Go to the beach&quot;)&#10;    }&#10;}"/>
            <p>
                이 테스트에서는 새 태스크를 생성하기 위한 POST 요청과 새 태스크가 추가되었는지 확인하기 위한 GET 요청이라는 두 개의 요청을 서버에 보냅니다. 첫 번째 요청을 보낼 때 <code>setBody()</code> 함수를 사용하여 요청 본문에 콘텐츠를 삽입합니다. 테스트 프레임워크는 컬렉션에 대한 <code>.formUrlEncode()</code> 확장 함수를 제공하여 브라우저에서 데이터를 포맷하는 과정을 추상화해 줍니다.
            </p>
        </step>
    </procedure>
</chapter>
<chapter title="라우팅 리팩터링" id="refactor-the-routing">
    <p>
        지금까지 작성한 라우팅을 살펴보면 모든 라우트가 <code>/tasks</code>로 시작하는 것을 알 수 있습니다. 이 라우트들을 전용 하위 라우트에 배치하여 이러한 중복을 제거할 수 있습니다.
    </p>
    <code-block lang="kotlin" code="            fun Application.configureRouting() {&#10;                routing {&#10;                    staticResources(&quot;/task-ui&quot;, &quot;task-ui&quot;)&#10;&#10;                    route(&quot;/tasks&quot;) {&#10;                        get {&#10;                            // 코드는 동일하게 유지&#10;                        }&#10;&#10;                        get(&quot;/byPriority/{priority?}&quot;) {&#10;                            // 코드는 동일하게 유지&#10;                        }&#10;&#10;                        post {&#10;                            // 코드는 동일하게 유지&#10;                        }&#10;                    }&#10;                }&#10;            }"/>
    <p>
        애플리케이션이 여러 하위 라우트가 생길 정도로 커진다면 각각을 별도의 헬퍼 함수로 분리하는 것이 적절할 것입니다. 하지만 현재로서는 그럴 필요가 없습니다.
    </p>
    <p>
        라우트가 잘 정리되어 있을수록 확장이 더 쉬워집니다. 예를 들어 이름별로 태스크를 찾는 라우트를 다음과 같이 추가할 수 있습니다.
    </p>
    <code-block lang="kotlin" code="            fun Application.configureRouting() {&#10;                routing {&#10;                    staticResources(&quot;/task-ui&quot;, &quot;task-ui&quot;)&#10;&#10;                    route(&quot;/tasks&quot;) {&#10;                        get {&#10;                            // 코드는 동일하게 유지&#10;                        }&#10;                        get(&quot;/byName/{taskName}&quot;) {&#10;                            val name = call.parameters[&quot;taskName&quot;]&#10;                            if (name == null) {&#10;                                call.respond(HttpStatusCode.BadRequest)&#10;                                return@get&#10;                            }&#10;&#10;                            val task = TaskRepository.taskByName(name)&#10;                            if (task == null) {&#10;                                call.respond(HttpStatusCode.NotFound)&#10;                                return@get&#10;                            }&#10;&#10;                            call.respondText(&#10;                                contentType = ContentType.parse(&quot;text/html&quot;),&#10;                                text = listOf(task).tasksAsTable()&#10;                            )&#10;                        }&#10;&#10;                        get(&quot;/byPriority/{priority?}&quot;) {&#10;                            // 코드는 동일하게 유지&#10;                        }&#10;&#10;                        post {&#10;                            // 코드는 동일하게 유지&#10;                        }&#10;                    }&#10;                }&#10;            }"/>
</chapter>
<chapter title="다음 단계" id="next-steps">
    <p>
        지금까지 기본적인 라우팅 및 요청 처리 기능을 구현했습니다. 또한 유효성 검증, 에러 처리, 단위 테스트에 대해서도 알아보았습니다. 이러한 모든 주제는 이후 튜토리얼에서 더 자세히 다룰 예정입니다.
    </p>
    <p>
        <Links href="server-create-restful-apis.topic" summary="JSON을 생성하는 RESTful API 예제를 통해 Kotlin과 Ktor로 백엔드 서비스를 구축하는 방법을 알아봅니다.">다음 튜토리얼</Links>로 이동하여 태스크 관리자용 JSON 파일을 생성하는 RESTful API를 빌드하는 방법을 알아보세요.
    </p>
</chapter>
</topic>