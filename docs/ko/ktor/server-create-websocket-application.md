<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       title="Ktor를 사용하여 Kotlin에서 WebSocket 애플리케이션 만들기" id="server-create-websocket-application">
    <show-structure for="chapter" depth="2"/>
    <tldr>
        <var name="example_name" value="tutorial-server-websockets"/>
        <p>
            <b>코드 예제</b>:
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
                %example_name%
            </a>
        </p>
        <p>
            <b>사용된 플러그인</b>: <Links href="//server-static-content" summary="스타일시트, 스크립트, 이미지 등과 같은 정적 콘텐츠를 제공하는 방법을 알아봅니다.">Static Content</Links>,
            <Links href="//server-serialization" summary="ContentNegotiation 플러그인은 클라이언트와 서버 간의 미디어 유형 협상과 특정 형식으로 콘텐츠를 직렬화/역직렬화하는 두 가지 주요 목적을 수행합니다.">Content Negotiation</Links>, <Links href="//server-websockets" summary="WebSockets 플러그인을 사용하면 서버와 클라이언트 간의 다방향 통신 세션을 만들 수 있습니다.">WebSockets in Ktor Server</Links>,
            <a href="https://kotlinlang.org/api/kotlinx.serialization/">kotlinx.serialization</a>
        </p>
    </tldr>
    <card-summary>
        WebSockets의 강력한 기능을 활용하여 콘텐츠를 주고받는 방법을 알아봅니다.
    </card-summary>
    <link-summary>
        WebSockets의 강력한 기능을 활용하여 콘텐츠를 주고받는 방법을 알아봅니다.
    </link-summary>
    <web-summary>
        Ktor와 Kotlin을 사용하여 WebSocket 애플리케이션을 구축하는 방법을 알아봅니다. 이 튜토리얼은 WebSockets를 통해 백엔드 서비스와 클라이언트를 연결하는 과정을 안내합니다.
    </web-summary>
    <p>
        이 문서는 Ktor와 Kotlin을 사용하여 WebSocket 애플리케이션을 제작하는 과정을 안내합니다. 이 내용은 <Links href="//server-create-restful-apis" summary="Kotlin과 Ktor를 사용하여 JSON 파일을 생성하는 RESTful API 예제를 포함한 백엔드 서비스를 구축하는 방법을 알아봅니다.">RESTful API 만들기</Links> 튜토리얼에서 다룬 내용을 바탕으로 합니다.
    </p>
    <p>이 문서에서는 다음 내용을 학습하게 됩니다:</p>
    <list>
        <li>JSON 직렬화를 사용하는 서비스 만들기.</li>
        <li>WebSocket 연결을 통해 콘텐츠 전송 및 수신.</li>
        <li>여러 클라이언트에 동시에 콘텐츠 브로드캐스트.</li>
    </list>
    <chapter title="사전 준비 사항" id="prerequisites">
        <p>이 튜토리얼을 독립적으로 진행할 수 있지만, <Links href="//server-serialization" summary="ContentNegotiation 플러그인은 클라이언트와 서버 간의 미디어 유형 협상과 특정 형식으로 콘텐츠를 직렬화/역직렬화하는 두 가지 주요 목적을 수행합니다.">콘텐츠 협상(Content Negotiation)</Links> 및 REST에 익숙해지기 위해 <Links href="//server-create-restful-apis" summary="Kotlin과 Ktor를 사용하여 JSON 파일을 생성하는 RESTful API 예제를 포함한 백엔드 서비스를 구축하는 방법을 알아봅니다.">RESTful API 만들기</Links> 튜토리얼을 먼저 완료하는 것을 권장합니다.
        </p>
        <p><a href="https://www.jetbrains.com/help/idea/installation-guide.html">IntelliJ IDEA</a>를 설치하는 것을 권장하지만, 원하는 다른 IDE를 사용해도 좋습니다.
        </p>
    </chapter>
    <chapter title="Hello WebSockets" id="hello-websockets">
        <p>
            이 튜토리얼에서는 WebSocket 연결을 통해 클라이언트와 <code>Task</code> 객체를 주고받는 기능을 추가하여 <Links href="//server-create-restful-apis" summary="Kotlin과 Ktor를 사용하여 JSON 파일을 생성하는 RESTful API 예제를 포함한 백엔드 서비스를 구축하는 방법을 알아봅니다.">RESTful API 만들기</Links> 튜토리얼에서 개발한 작업 관리자 서비스를 확장해 봅니다. 이를 위해 <Links href="//server-websockets" summary="WebSockets 플러그인을 사용하면 서버와 클라이언트 간의 다방향 통신 세션을 만들 수 있습니다.">WebSockets 플러그인</Links>을 추가해야 합니다. 기존 프로젝트에 수동으로 추가할 수도 있지만, 이 튜토리얼에서는 처음부터 새 프로젝트를 만들어 시작하겠습니다.
        </p>
        <chapter title="플러그인을 포함한 초기 프로젝트 생성" id="create=project">
            <procedure>
                <step>
                    <p>
                        <a href="https://start.ktor.io/">Ktor Project Generator</a>로 이동합니다.
                    </p>
                </step>
                <step>
                    <p><control>Project artifact</control> 필드에 프로젝트 아티팩트 이름으로
                        <Path>com.example.ktor-websockets-task-app</Path>를 입력합니다.
                        <img src="tutorial_server_websockets_project_artifact.png"
                             alt="Ktor Project Generator에서 프로젝트 아티팩트 이름 지정"
                             border-effect="line"
                             style="block"
                             width="706"/>
                    </p>
                </step>
                <step>
                    <p>
                        플러그인 섹션에서 <control>Add</control> 버튼을 클릭하여 다음 플러그인들을 검색하고 추가합니다:
                    </p>
                    <list type="bullet">
                        <li>Content Negotiation</li>
                        <li>kotlinx.serialization</li>
                        <li>WebSockets</li>
                        <li>Static Content</li>
                    </list>
                    <p>
                        <img src="ktor_project_generator_add_plugins.gif"
                             alt="Ktor Project Generator에서 플러그인 추가"
                             border-effect="line"
                             style="block"
                             width="706"/>
                    </p>
                </step>
                <step>
                    <p>
                        플러그인을 추가하면 플러그인 섹션의 오른쪽 상단에 표시됩니다.
                    </p>
                    <p>프로젝트에 추가될 모든 플러그인 목록을 확인할 수 있습니다:
                        <img src="tutorial_server_websockets_project_plugins.png"
                             alt="Ktor Project Generator의 플러그인 목록"
                             border-effect="line"
                             style="block"
                             width="706"/>
                    </p>
                </step>
                <step>
                    <p>
                        <control>Download</control> 버튼을 클릭하여 Ktor 프로젝트를 생성하고 다운로드합니다.
                    </p>
                </step>
            </procedure>
        </chapter>
        <chapter title="시작 코드 추가" id="add-starter-code">
            <p>다운로드가 완료되면 IntelliJ IDEA에서 프로젝트를 열고 다음 단계를 따르세요:</p>
            <procedure>
                <step>
                    <Path>src/main/kotlin</Path>으로 이동하여 <Path>model</Path>이라는 새 서브패키지를 만듭니다.
                </step>
                <step>
                    <p>
                        <Path>model</Path> 패키지 안에 새 <Path>Task.kt</Path> 파일을 만듭니다.
                    </p>
                </step>
                <step>
                    <p>
                        <Path>Task.kt</Path> 파일을 열고 우선순위를 나타내는 <code>enum</code>과 작업을 나타내는 <code>data class</code>를 추가합니다:
                    </p>
                    <code-block lang="kotlin" code="package com.example.model&#10;&#10;import kotlinx.serialization.Serializable&#10;&#10;enum class Priority {&#10;    Low, Medium, High, Vital&#10;}&#10;&#10;@Serializable&#10;data class Task(&#10;    val name: String,&#10;    val description: String,&#10;    val priority: Priority&#10;)"/>
                    <p>
                        <code>Task</code> 클래스는 <code>kotlinx.serialization</code> 라이브러리의 <code>@Serializable</code> 어노테이션이 붙어 있습니다. 이는 인스턴스를 JSON으로 상호 변환할 수 있음을 의미하며, 이를 통해 네트워크를 통해 내용을 전송할 수 있습니다.
                    </p>
                    <p>
                        WebSockets 플러그인을 포함했으므로 제너레이터가 <Path>src/main/kotlin</Path> 내의 <Path>Routing.kt</Path> 파일에 <code>webSocket</code> 라우트를, 그리고 <Path>Websockets.kt</Path> 파일을 추가했을 것입니다.
                    </p>
                </step>
                <step>
                    <Path>Websockets.kt</Path> 파일을 열고 기존 <code>.configureWebsockets()</code> 함수를 다음 내용으로 교체합니다:
                    <code-block lang="kotlin" code="                        fun Application.configureWebsockets() {&#10;                            install(WebSockets) {&#10;                                contentConverter = KotlinxWebsocketSerializationConverter(Json)&#10;                                pingPeriod = 15.seconds&#10;                                timeout = 15.seconds&#10;                                maxFrameSize = Long.MAX_VALUE&#10;                                masking = false&#10;                            }&#10;                        }"/>
                    <list>
                        <li>WebSockets 플러그인이 설치되고 표준 설정으로 구성됩니다.</li>
                        <li><code>contentConverter</code> 속성이 설정되어, 플러그인이 <a
                                    href="https://github.com/Kotlin/kotlinx.serialization"><code>kotlinx.serialization</code></a> 라이브러리를 통해 송수신되는 객체를 직렬화할 수 있게 합니다.
                        </li>
                    </list>
                </step>
                <step>
                    <p>
                        <Path>Routing.kt</Path> 파일을 열고 기존 <code>Application.configureRouting()</code> 함수를 아래 구현으로 교체합니다:
                    </p>
                    <code-block lang="kotlin" code="                    fun Application.configureRouting() {&#10;                        routing {&#10;                            webSocket(&quot;/tasks&quot;) {&#10;                                val tasks = listOf(&#10;                                    Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;                                    Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;                                    Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;                                    Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;                                )&#10;&#10;                                for (task in tasks) {&#10;                                    sendSerialized(task)&#10;                                    delay(1000.milliseconds)&#10;                                }&#10;&#10;                                close(CloseReason(CloseReason.Codes.NORMAL, &quot;All done&quot;))&#10;                            }&#10;                            staticResources(&quot;/static&quot;, &quot;static&quot;)&#10;                        }&#10;                    }"/>
                    <list>
                        <li>상대 URL이 <code>/tasks</code>인 단일 엔드포인트로 라우팅이 구성됩니다.</li>
                        <li>요청을 받으면 작업 목록이 WebSocket 연결을 통해 직렬화되어 전송됩니다.</li>
                        <li>모든 항목이 전송되면 서버는 연결을 닫습니다.</li>
                    </list>
                    <p>
                        데모를 위해 작업을 전송하는 사이에 1초의 지연(delay)을 추가했습니다. 이를 통해 클라이언트에서 작업이 점진적으로 나타나는 것을 관찰할 수 있습니다. 이 지연이 없다면 이 예제는 이전 문서에서 개발한 <Links href="//server-create-restful-apis" summary="Kotlin과 Ktor를 사용하여 JSON 파일을 생성하는 RESTful API 예제를 포함한 백엔드 서비스를 구축하는 방법을 알아봅니다.">RESTful 서비스</Links> 및 <Links href="//server-create-website" summary="Kotlin과 Ktor 및 Thymeleaf 템플릿을 사용하여 웹사이트를 구축하는 방법을 알아봅니다.">웹 애플리케이션</Links>과 동일하게 보일 것입니다.
                    </p>
                    <p>
                        이 반복 단계의 마지막 과정은 이 엔드포인트를 위한 클라이언트를 만드는 것입니다. <Links href="//server-static-content" summary="스타일시트, 스크립트, 이미지 등과 같은 정적 콘텐츠를 제공하는 방법을 알아봅니다.">Static Content</Links> 플러그인을 포함했으므로, Ktor 프로젝트 제너레이터가 <Path>src/main/resources/static</Path> 내에 <Path>index.html</Path> 파일을 추가했을 것입니다.
                    </p>
                </step>
                <step>
                    <p>
                        <Path>index.html</Path> 파일을 열고 기존 내용을 다음으로 바꿉니다:
                    </p>
                    <code-block lang="html" code="&lt;html&gt;&#10;&lt;head&gt;&#10;    &lt;title&gt;Using Ktor WebSockets&lt;/title&gt;&#10;    &lt;script&gt;&#10;        function readAndDisplayAllTasks() {&#10;            clearTable();&#10;&#10;            const serverURL = 'ws://0.0.0.0:8080/tasks';&#10;            const socket = new WebSocket(serverURL);&#10;&#10;            socket.onopen = logOpenToConsole;&#10;            socket.onclose = logCloseToConsole;&#10;            socket.onmessage = readAndDisplayTask;&#10;        }&#10;&#10;        function readAndDisplayTask(event) {&#10;            let task = JSON.parse(event.data);&#10;            logTaskToConsole(task);&#10;            addTaskToTable(task);&#10;        }&#10;&#10;        function logTaskToConsole(task) {&#10;            console.log(`Received ${task.name}`);&#10;        }&#10;&#10;        function logCloseToConsole() {&#10;            console.log(&quot;Web socket connection closed&quot;);&#10;        }&#10;&#10;        function logOpenToConsole() {&#10;            console.log(&quot;Web socket connection opened&quot;);&#10;        }&#10;&#10;        function tableBody() {&#10;            return document.getElementById(&quot;tasksTableBody&quot;);&#10;        }&#10;&#10;        function clearTable() {&#10;            tableBody().innerHTML = &quot;&quot;;&#10;        }&#10;&#10;        function addTaskToTable(task) {&#10;            tableBody().appendChild(taskRow(task));&#10;        }&#10;&#10;&#10;        function taskRow(task) {&#10;            return tr([&#10;                td(task.name),&#10;                td(task.description),&#10;                td(task.priority)&#10;            ]);&#10;        }&#10;&#10;&#10;        function tr(children) {&#10;            const node = document.createElement(&quot;tr&quot;);&#10;            children.forEach(child =&gt; node.appendChild(child));&#10;            return node;&#10;        }&#10;&#10;&#10;        function td(text) {&#10;            const node = document.createElement(&quot;td&quot;);&#10;            node.appendChild(document.createTextNode(text));&#10;            return node;&#10;        }&#10;    &lt;/script&gt;&#10;&lt;/head&gt;&#10;&lt;body&gt;&#10;&lt;h1&gt;Viewing Tasks Via WebSockets&lt;/h1&gt;&#10;&lt;form action=&quot;javascript:readAndDisplayAllTasks()&quot;&gt;&#10;    &lt;input type=&quot;submit&quot; value=&quot;View The Tasks&quot;&gt;&#10;&lt;/form&gt;&#10;&lt;table rules=&quot;all&quot;&gt;&#10;    &lt;thead&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Name&lt;/th&gt;&lt;th&gt;Description&lt;/th&gt;&lt;th&gt;Priority&lt;/th&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/thead&gt;&#10;    &lt;tbody id=&quot;tasksTableBody&quot;&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
                    <p>
                        이 페이지는 모든 최신 브라우저에서 사용할 수 있는 <a href="https://websockets.spec.whatwg.org//#websocket"><code>WebSocket</code> 유형</a>을 사용합니다. JavaScript에서 이 객체를 생성하고 생성자에 엔드포인트의 URL을 전달합니다. 그 후 <code>onopen</code>, <code>onclose</code>, <code>onmessage</code> 이벤트에 대한 이벤트 핸들러를 연결합니다. <code>onmessage</code> 이벤트가 트리거되면 문서 객체의 메서드를 사용하여 테이블에 행을 추가합니다.
                    </p>
                </step>
                <step>
                    <p>IntelliJ IDEA에서 실행 버튼
                        (<img src="intellij_idea_gutter_icon.svg"
                              style="inline" height="16" width="16"
                              alt="intelliJ IDEA 실행 아이콘"/>)을 클릭하여 애플리케이션을 시작합니다.</p>
                </step>
                <step>
                    <p>
                        <a href="http://0.0.0.0:8080/static/index.html">http://0.0.0.0:8080/static/index.html</a>로 이동합니다. 버튼이 있는 폼과 빈 테이블이 나타날 것입니다:
                    </p>
                    <img src="tutorial_server_websockets_iteration_1.png"
                         alt="하나의 버튼이 있는 HTML 폼을 표시하는 웹 브라우저 페이지"
                         border-effect="rounded"
                         width="706"/>
                    <p>
                        폼을 클릭하면 서버에서 작업이 로드되어 초당 한 개씩 나타납니다. 결과적으로 테이블이 점진적으로 채워집니다. 브라우저의 <control>개발자 도구</control>에서 <control>JavaScript 콘솔</control>을 열어 기록된 메시지를 확인할 수도 있습니다.
                    </p>
                    <img src="tutorial_server_websockets_iteration_1_click.gif"
                         alt="버튼 클릭 시 리스트 항목을 표시하는 웹 브라우저 페이지"
                         border-effect="rounded"
                         width="706"/>
                    <p>
                        이제 서비스가 예상대로 작동합니다. WebSocket 연결이 열리고, 항목이 클라이언트로 전송된 다음 연결이 닫힙니다. 기저의 네트워킹에는 많은 복잡성이 수반되지만, Ktor가 기본적으로 이 모든 것을 처리해 줍니다.
                    </p>
                </step>
            </procedure>
        </chapter>
    </chapter>
    <chapter title="WebSocket 이해하기" id="understanding-websockets">
        <p>
            다음 단계로 넘어가기 전에 WebSockets의 기본 사항을 복습하는 것이 도움이 될 수 있습니다. 이미 WebSockets에 익숙하다면 바로 <a href="#improve-design">서비스 설계 개선</a> 단계로 넘어가도 좋습니다.
        </p>
        <p>
            이전 튜토리얼에서 클라이언트는 HTTP 요청을 보내고 HTTP 응답을 받았습니다. 이는 잘 작동하며 인터넷이 확장 가능하고 탄력적으로 유지될 수 있게 합니다.
        </p>
        <p>그러나 다음과 같은 시나리오에는 적합하지 않습니다:</p>
        <list>
            <li>콘텐츠가 시간이 지남에 따라 점진적으로 생성되는 경우.</li>
            <li>이벤트에 따라 콘텐츠가 빈번하게 변경되는 경우.</li>
            <li>콘텐츠가 생성되는 동안 클라이언트가 서버와 상호 작용해야 하는 경우.</li>
            <li>한 클라이언트가 보낸 데이터가 다른 클라이언트에 빠르게 전파되어야 하는 경우.</li>
        </list>
        <p>
            이러한 시나리오의 예로는 주식 거래, 영화 및 콘서트 티켓 구매, 온라인 경매 입찰, 소셜 미디어의 채팅 기능 등이 있습니다. WebSockets는 이러한 상황을 처리하기 위해 개발되었습니다.
        </p>
        <p>
            WebSocket 연결은 TCP를 통해 구축되며 장기간 유지될 수 있습니다. 이 연결은 <emphasis>전이중 통신(full duplex communication)</emphasis>을 제공합니다. 즉, 클라이언트가 서버로 메시지를 보내는 동시에 서버로부터 메시지를 받을 수 있습니다.
        </p>
        <p>
            WebSocket API는 네 가지 이벤트(open, message, close, error)와 두 가지 동작(send, close)을 정의합니다. 이러한 기능에 접근하는 방법은 언어와 라이브러리에 따라 다를 수 있습니다. 예를 들어, Kotlin에서는 들어오는 메시지 시퀀스를 <a
                href="https://kotlinlang.org/docs/flow.html"><code>Flow</code></a>로 소비할 수 있습니다.
        </p>
    </chapter>
    <chapter title="설계 개선" id="improve-design">
        <p>다음으로, 더 고급 예제를 구현하기 위해 기존 코드를 리팩토링해 보겠습니다.</p>
        <procedure>
            <step>
                <p>
                    <Path>model</Path> 패키지에 새 <Path>TaskRepository.kt</Path> 파일을 만듭니다.
                </p>
            </step>
            <step>
                <p>
                    <Path>TaskRepository.kt</Path>를 열고 <code>TaskRepository</code> 객체를 추가합니다:
                </p>
                <code-block lang="kotlin" code="package com.example.model&#10;&#10;object TaskRepository {&#10;    private val tasks = mutableListOf(&#10;        Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;        Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;        Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;        Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;    )&#10;&#10;    fun allTasks(): List&lt;Task&gt; = tasks&#10;&#10;    fun tasksByPriority(priority: Priority) = tasks.filter {&#10;        it.priority == priority&#10;    }&#10;&#10;    fun taskByName(name: String) = tasks.find {&#10;        it.name.equals(name, ignoreCase = true)&#10;    }&#10;&#10;    fun addTask(task: Task) {&#10;        if (taskByName(task.name) != null) {&#10;            throw IllegalStateException(&quot;Cannot duplicate task names!&quot;)&#10;        }&#10;        tasks.add(task)&#10;    }&#10;&#10;    fun removeTask(name: String): Boolean {&#10;        return tasks.removeIf { it.name == name }&#10;    }&#10;}"/>
                <p>이 코드는 이전 튜토리얼에서 보았던 것과 비슷할 것입니다.</p>
            </step>
            <step>
                <Path>src/main/kotlin</Path>으로 이동하여 <Path>Routing.kt</Path> 파일을 엽니다.
            </step>
            <step>
                <p>
                    이제 <code>TaskRepository</code>를 활용하여 <code>Application.configureRouting()</code>의 라우팅을 단순화할 수 있습니다:
                </p>
                <code-block lang="kotlin" code="                    routing {&#10;                        webSocket(&quot;/tasks&quot;) {&#10;                            for (task in TaskRepository.allTasks()) {&#10;                                sendSerialized(task)&#10;                                delay(1000.milliseconds)&#10;                            }&#10;                            close(CloseReason(CloseReason.Codes.NORMAL, &quot;All done&quot;))&#10;                        }&#10;                        // ...&#10;                    }"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="WebSocket을 통해 메시지 전송" id="send-messages">
        <p>
            WebSocket의 강력함을 보여주기 위해 다음과 같은 새 엔드포인트를 만들어 보겠습니다:
        </p>
        <list>
            <li>
                클라이언트가 시작할 때 기존의 모든 작업을 수신합니다.
            </li>
            <li>
                클라이언트가 작업을 생성하고 전송할 수 있습니다.
            </li>
            <li>
                한 클라이언트가 작업을 전송하면 다른 모든 클라이언트가 알림을 받습니다.
            </li>
        </list>
        <procedure>
            <step>
                <p>
                    <Path>Routing.kt</Path> 파일에서 현재 <code>.configureRouting()</code> 메서드를 아래 구현으로 교체합니다:
                </p>
                <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    routing {&#10;        val sessions =&#10;            Collections.synchronizedList&lt;WebSocketServerSession&gt;(ArrayList())&#10;&#10;        webSocket(&quot;/tasks&quot;) {&#10;            sendAllTasks()&#10;            close(CloseReason(CloseReason.Codes.NORMAL, &quot;All done&quot;))&#10;        }&#10;&#10;        webSocket(&quot;/tasks2&quot;) {&#10;            sessions.add(this)&#10;            sendAllTasks()&#10;&#10;            while(true) {&#10;                ensureActive()&#10;                val newTask = receiveDeserialized&lt;Task&gt;()&#10;                TaskRepository.addTask(newTask)&#10;                for(session in sessions) {&#10;                    session.sendSerialized(newTask)&#10;                }&#10;            }&#10;        }&#10;        staticResources(&quot;/static&quot;, &quot;static&quot;)&#10;    }&#10;}&#10;&#10;private suspend fun DefaultWebSocketServerSession.sendAllTasks() {&#10;    for (task in TaskRepository.allTasks()) {&#10;        sendSerialized(task)&#10;        delay(1000.milliseconds)&#10;    }&#10;}"/>
                <p>이 코드를 통해 다음 작업을 수행했습니다:</p>
                <list>
                    <li>
                        기존의 모든 작업을 전송하는 기능을 헬퍼 메서드로 리팩토링했습니다.
                    </li>
                    <li>
                        <code>routing {}</code> 블록에서 모든 클라이언트를 추적하기 위해 스레드로부터 안전한 <code>session</code> 객체 리스트를 생성했습니다.
                    </li>
                    <li>
                        상대 URL이 <code>/tasks2</code>인 새 엔드포인트를 추가했습니다. 클라이언트가 이 엔드포인트에 연결하면 해당 <code>session</code> 객체가 리스트에 추가됩니다. 그런 다음 서버는 새 작업을 수신하기 위해 대기하는 무한 루프에 진입합니다. 새 작업을 수신하면 서버는 이를 저장소에 저장하고 현재 클라이언트를 포함한 모든 클라이언트에게 복사본을 보냅니다.
                    </li>
                </list>
                <p>
                    이 기능을 테스트하기 위해 <Path>index.html</Path>의 기능을 확장하는 새 페이지를 만들겠습니다.
                </p>
            </step>
            <step>
                <p>
                    <Path>src/main/resources/static</Path> 내에 <Path>wsClient.html</Path>이라는 새 HTML 파일을 만듭니다.
                </p>
            </step>
            <step>
                <p>
                    <Path>wsClient.html</Path>을 열고 다음 내용을 추가합니다:
                </p>
                <code-block lang="html" code="&lt;html&gt;&#10;&lt;head&gt;&#10;    &lt;title&gt;WebSocket Client&lt;/title&gt;&#10;    &lt;script&gt;&#10;        let serverURL;&#10;        let socket;&#10;&#10;        function setupSocket() {&#10;            serverURL = 'ws://0.0.0.0:8080/tasks2';&#10;            socket = new WebSocket(serverURL);&#10;&#10;            socket.onopen = logOpenToConsole;&#10;            socket.onclose = logCloseToConsole;&#10;            socket.onmessage = readAndDisplayTask;&#10;        }&#10;&#10;        function readAndDisplayTask(event) {&#10;            let task = JSON.parse(event.data);&#10;            logTaskToConsole(task);&#10;            addTaskToTable(task);&#10;        }&#10;&#10;        function logTaskToConsole(task) {&#10;            console.log(`Received ${task.name}`);&#10;        }&#10;&#10;        function logCloseToConsole() {&#10;            console.log(&quot;Web socket connection closed&quot;);&#10;        }&#10;&#10;        function logOpenToConsole() {&#10;            console.log(&quot;Web socket connection opened&quot;);&#10;        }&#10;&#10;        function tableBody() {&#10;            return document.getElementById(&quot;tasksTableBody&quot;);&#10;        }&#10;&#10;        function addTaskToTable(task) {&#10;            tableBody().appendChild(taskRow(task));&#10;        }&#10;&#10;        function taskRow(task) {&#10;            return tr([&#10;                td(task.name),&#10;                td(task.description),&#10;                td(task.priority)&#10;            ]);&#10;        }&#10;&#10;        function tr(children) {&#10;            const node = document.createElement(&quot;tr&quot;);&#10;            children.forEach(child =&gt; node.appendChild(child));&#10;            return node;&#10;        }&#10;&#10;        function td(text) {&#10;            const node = document.createElement(&quot;td&quot;);&#10;            node.appendChild(document.createTextNode(text));&#10;            return node;&#10;        }&#10;&#10;        function getFormValue(name) {&#10;            return document.forms[0][name].value&#10;        }&#10;&#10;        function buildTaskFromForm() {&#10;            return {&#10;                name: getFormValue(&quot;newTaskName&quot;),&#10;                description: getFormValue(&quot;newTaskDescription&quot;),&#10;                priority: getFormValue(&quot;newTaskPriority&quot;)&#10;            }&#10;        }&#10;&#10;        function logSendingToConsole(data) {&#10;            console.log(&quot;About to send&quot;,data);&#10;        }&#10;&#10;        function sendTaskViaSocket(data) {&#10;            socket.send(JSON.stringify(data));&#10;        }&#10;&#10;        function sendTaskToServer() {&#10;            let data = buildTaskFromForm();&#10;            logSendingToConsole(data);&#10;            sendTaskViaSocket(data);&#10;            //prevent form submission&#10;            return false;&#10;        }&#10;    &lt;/script&gt;&#10;&lt;/head&gt;&#10;&lt;body onload=&quot;setupSocket()&quot;&gt;&#10;&lt;h1&gt;Viewing Tasks Via WebSockets&lt;/h1&gt;&#10;&lt;table rules=&quot;all&quot;&gt;&#10;    &lt;thead&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Name&lt;/th&gt;&lt;th&gt;Description&lt;/th&gt;&lt;th&gt;Priority&lt;/th&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/thead&gt;&#10;    &lt;tbody id=&quot;tasksTableBody&quot;&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;div&gt;&#10;    &lt;h3&gt;Create a new task&lt;/h3&gt;&#10;    &lt;form onsubmit=&quot;return sendTaskToServer()&quot;&gt;&#10;        &lt;div&gt;&#10;            &lt;label for=&quot;newTaskName&quot;&gt;Name: &lt;/label&gt;&#10;            &lt;input type=&quot;text&quot; id=&quot;newTaskName&quot;&#10;                   name=&quot;newTaskName&quot; size=&quot;10&quot;&gt;&#10;        &lt;/div&gt;&#10;        &lt;div&gt;&#10;            &lt;label for=&quot;newTaskDescription&quot;&gt;Description: &lt;/label&gt;&#10;            &lt;input type=&quot;text&quot; id=&quot;newTaskDescription&quot;&#10;                   name=&quot;newTaskDescription&quot; size=&quot;20&quot;&gt;&#10;        &lt;/div&gt;&#10;        &lt;div&gt;&#10;            &lt;label for=&quot;newTaskPriority&quot;&gt;Priority: &lt;/label&gt;&#10;            &lt;select id=&quot;newTaskPriority&quot; name=&quot;newTaskPriority&quot;&gt;&#10;                &lt;option name=&quot;Low&quot;&gt;Low&lt;/option&gt;&#10;                &lt;option name=&quot;Medium&quot;&gt;Medium&lt;/option&gt;&#10;                &lt;option name=&quot;High&quot;&gt;High&lt;/option&gt;&#10;                &lt;option name=&quot;Vital&quot;&gt;Vital&lt;/option&gt;&#10;            &lt;/select&gt;&#10;        &lt;/div&gt;&#10;        &lt;input type=&quot;submit&quot;&gt;&#10;    &lt;/form&gt;&#10;&lt;/div&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
                <p>
                    이 새 페이지에는 사용자가 새 작업 정보를 입력할 수 있는 HTML 폼이 도입되었습니다. 폼을 제출하면 <code>sendTaskToServer()</code> 이벤트 핸들러가 호출됩니다. 이는 폼 데이터로 JavaScript 객체를 빌드하고 WebSocket 객체의 <code>.send()</code> 메서드를 사용하여 서버로 전송합니다.
                </p>
            </step>
            <step>
                <p>
                    IntelliJ IDEA에서 재실행 버튼(<img src="intellij_idea_rerun_icon.svg"
                                                                   style="inline" height="16" width="16"
                                                                   alt="intelliJ IDEA 재실행 아이콘"/>)을 클릭하여 애플리케이션을 다시 시작합니다.
                </p>
            </step>
            <step>
                <p>이 기능을 테스트하려면 두 개의 브라우저를 나란히 열고 다음 단계를 따르세요.</p>
                <list type="decimal">
                    <li>
                        브라우저 A에서 <a href="http://0.0.0.0:8080/static/wsClient.html">http://0.0.0.0:8080/static/wsClient.html</a>로 이동합니다. 기본 작업들이 표시되는지 확인합니다.
                    </li>
                    <li>
                        브라우저 A에서 새 작업을 추가합니다. 해당 페이지의 테이블에 새 작업이 나타나야 합니다.
                    </li>
                    <li>
                        브라우저 B에서 <a href="http://0.0.0.0:8080/static/wsClient.html">http://0.0.0.0:8080/static/wsClient.html</a>로 이동합니다. 기본 작업과 브라우저 A에서 추가한 새 작업이 모두 표시되어야 합니다.
                    </li>
                    <li>
                        어느 한 브라우저에서 작업을 추가합니다. 양쪽 페이지 모두에 새 항목이 나타나는지 확인합니다.
                    </li>
                </list>
                <img src="tutorial_server_websockets_iteration_2_test.gif"
                     alt="HTML 폼을 통해 새 작업을 생성하는 것을 보여주는 두 개의 나란히 놓인 웹 브라우저 페이지"
                     border-effect="rounded"
                     width="706"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="자동화된 테스트 추가" id="add-automated-tests">
        <p>
            QA 프로세스를 효율화하고 빠르고 재현 가능하며 자동화하기 위해 Ktor의 내장된 <Links href="//server-testing" summary="특수 테스트 엔진을 사용하여 서버 애플리케이션을 테스트하는 방법을 알아봅니다.">자동화 테스트 지원</Links>을 사용할 수 있습니다. 다음 단계를 따르세요:
        </p>
        <procedure>
            <step>
                <p>
                    Ktor Client 내에서 <Links href="//server-serialization" summary="ContentNegotiation 플러그인은 클라이언트와 서버 간의 미디어 유형 협상과 특정 형식으로 콘텐츠를 직렬화/역직렬화하는 두 가지 주요 목적을 수행합니다.">Content Negotiation</Links> 지원을 구성할 수 있도록 <Path>build.gradle.kts</Path>에 다음 의존성을 추가합니다:
                </p>
                <code-block lang="kotlin" code="    testImplementation(ktorLibs.client.contentNegotiation)"/>
            </step>
            <step>
                <p>
                    <p>IntelliJ IDEA에서 편집기 오른쪽에 있는 Gradle 알림 아이콘
                        (<img alt="intelliJ IDEA gradle 아이콘"
                              src="intellij_idea_gradle_icon.svg" width="16" height="26"/>)을 클릭하여 Gradle 변경 사항을 로드합니다.</p>
                </p>
            </step>
            <step>
                <p>
                    <Path>src/test/kotlin</Path>으로 이동하여 <Path>ServerTest.kt</Path> 파일을 엽니다.
                </p>
            </step>
            <step>
                <p>
                    생성된 테스트 클래스를 아래 구현으로 교체합니다:
                </p>
                <code-block lang="kotlin" code="import com.example.model.Priority&#10;import com.example.model.Task&#10;import io.ktor.client.plugins.contentnegotiation.ContentNegotiation&#10;import io.ktor.client.plugins.websocket.DefaultClientWebSocketSession&#10;import io.ktor.client.plugins.websocket.WebSockets&#10;import io.ktor.client.plugins.websocket.converter&#10;import io.ktor.client.plugins.websocket.webSocket&#10;import io.ktor.serialization.deserialize&#10;import io.ktor.serialization.kotlinx.KotlinxWebsocketSerializationConverter&#10;import io.ktor.serialization.kotlinx.json.json&#10;import io.ktor.server.testing.testApplication&#10;import kotlinx.coroutines.flow.consumeAsFlow&#10;import kotlinx.coroutines.flow.map&#10;import kotlinx.coroutines.flow.scan&#10;import kotlinx.serialization.json.Json&#10;import kotlin.test.Test&#10;import kotlin.test.assertEquals&#10;&#10;class ServerTest {&#10;    @Test&#10;    fun testRoot() = testApplication {&#10;        configure()&#10;&#10;        val client = createClient {&#10;            install(ContentNegotiation) {&#10;                json()&#10;            }&#10;            install(WebSockets) {&#10;                contentConverter =&#10;                    KotlinxWebsocketSerializationConverter(Json)&#10;            }&#10;        }&#10;&#10;        val expectedTasks = listOf(&#10;            Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;            Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;            Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;            Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;        )&#10;        var actualTasks = emptyList&lt;Task&gt;()&#10;&#10;        client.webSocket(&quot;/tasks&quot;) {&#10;            consumeTasksAsFlow().collect { allTasks -&gt;&#10;                actualTasks = allTasks&#10;            }&#10;        }&#10;&#10;        assertEquals(expectedTasks.size, actualTasks.size)&#10;        expectedTasks.forEachIndexed { index, task -&gt;&#10;            assertEquals(task, actualTasks[index])&#10;        }&#10;    }&#10;&#10;    private fun DefaultClientWebSocketSession.consumeTasksAsFlow() = incoming&#10;        .consumeAsFlow()&#10;        .map {&#10;            converter!!.deserialize&lt;Task&gt;(it)&#10;        }&#10;        .scan(emptyList&lt;Task&gt;()) { list, task -&gt;&#10;            list + task&#10;        }&#10;}"/>
                <p>
                    이 설정을 통해 다음을 수행합니다:
                </p>
                <list>
                    <li>
                        서비스가 테스트 환경 내에서 실행되도록 구성하고, JSON 직렬화 및 WebSockets를 포함하여 프로덕션 환경과 동일한 기능을 활성화합니다.
                    </li>
                    <li>
                        <Links href="//client-create-and-configure" summary="Ktor 클라이언트를 생성하고 구성하는 방법을 알아봅니다.">Ktor Client</Links> 내에서 콘텐츠 협상 및 WebSocket 지원을 구성합니다. 이게 없으면 클라이언트는 WebSocket 연결을 사용할 때 객체를 JSON으로 직렬화/역직렬화하는 방법을 알 수 없습니다.
                    </li>
                    <li>
                        서비스가 반환할 것으로 기대하는 <code>Tasks</code> 목록을 선언합니다.
                    </li>
                    <li>
                        <code>client</code> 객체의 <code>.webSocket</code> 함수를 사용하여 <code>/tasks</code>로 요청을 보냅니다.
                    </li>
                    <li>
                        들어오는 작업을 <code>Flow</code>로 소비하여 리스트에 점진적으로 추가합니다.
                    </li>
                    <li>
                        모든 작업을 수신하면 일반적인 방식으로 <code>expectedTasks</code>와 <code>actualTasks</code>를 비교합니다.
                    </li>
                </list>
            </step>
        </procedure>
    </chapter>
    <chapter title="다음 단계" id="next-steps">
        <p>
            수고하셨습니다! WebSocket 통신과 Ktor Client를 사용한 자동화 테스트를 통합함으로써 작업 관리자 서비스를 크게 개선했습니다.
        </p>
        <p>
            <Links href="//server-integrate-database" summary="Exposed SQL 라이브러리를 사용하여 Ktor 서비스를 데이터베이스 저장소에 연결하는 프로세스를 알아봅니다.">다음 튜토리얼</Links>로 이동하여 Exposed 라이브러리를 사용하여 서비스가 관계형 데이터베이스와 원활하게 상호 작용하는 방법을 알아보세요.
        </p>
    </chapter>
</topic>