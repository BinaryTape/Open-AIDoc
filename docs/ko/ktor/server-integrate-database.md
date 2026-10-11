<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       title="Integrate a database with Kotlin, Ktor, and Exposed" id="server-integrate-database">
<show-structure for="chapter" depth="2"/>
<tldr>
        <var name="example_name" value="tutorial-server-db-integration"/>
        <p>
            <b>코드 예제</b>:
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
                %example_name%
            </a>
        </p>
        <p>
            <b>사용된 플러그인</b>: <Links href="/ktor/server-static-content" summary="스타일시트, 스크립트, 이미지 등과 같은 정적 콘텐츠를 제공하는 방법을 알아봅니다.">Static Content</Links>,
            <Links href="/ktor/server-serialization" summary="ContentNegotiation 플러그인은 클라이언트와 서버 간 미디어 타입 협상과 특정 형식으로 콘텐츠를 직렬화/역직렬화하는 두 가지 주요 목적을 가집니다.">Content Negotiation</Links>, <Links href="/ktor/server-status-pages" summary="%plugin_name%을 사용하면 Ktor 애플리케이션이 발생한 예외 또는 상태 코드를 기반으로 모든 실패 상태에 적절히 응답할 수 있습니다.">Status pages</Links>,
            <Links href="/ktor/server-serialization" summary="ContentNegotiation 플러그인은 클라이언트와 서버 간 미디어 타입 협상과 특정 형식으로 콘텐츠를 직렬화/역직렬화하는 두 가지 주요 목적을 가집니다.">kotlinx.serialization</Links>,
            <Links href="/ktor/server-dependency-injection" summary="필수 종속성: io.ktor:ktor-server-di 코드 예제: %example_name%">Dependency Injection</Links>
            <a href="https://github.com/ktorio/ktor-plugin-registry/tree/main/repository/org.jetbrains/server-exposed">Exposed</a>,
            <a href="https://github.com/ktorio/ktor-plugin-registry/tree/main/repository/org.jetbrains/server-postgres">PostgreSQL</a>
        </p>
    </tldr>
    <card-summary>
        Exposed SQL 라이브러리를 사용하여 Ktor 서비스를 데이터베이스 리포지토리에 연결하는 과정을 알아봅니다.
    </card-summary>
    <link-summary>
        Exposed SQL 라이브러리를 사용하여 Ktor 서비스를 데이터베이스 리포지토리에 연결하는 과정을 알아봅니다.
    </link-summary>
    <web-summary>
        Kotlin과 Ktor를 사용하여 RESTful 서비스가 데이터베이스 리포지토리에 연결되는 단일 페이지 애플리케이션(SPA)을 구축하는 방법을 알아봅니다. Exposed SQL 라이브러리를 사용하며 테스트를 위해 리포지토리를 모킹(fake)할 수도 있습니다.
    </web-summary>
    <p>
        이 문서에서는 Kotlin용 SQL 라이브러리인 <a
            href="https://www.jetbrains.com/exposed/">Exposed</a>를 사용하여 Ktor 서비스를 관계형 데이터베이스와 연동하는 방법을 배웁니다.
    </p>
    <p>이 튜토리얼을 마치면 다음 작업을 수행하는 방법을 배우게 됩니다:</p>
    <list>
        <li>JSON 직렬화를 사용하는 RESTful 서비스 생성.</li>
        <li>이러한 서비스에 서로 다른 리포지토리 주입.</li>
        <li>인메모리 리포지토리를 사용하여 서비스에 대한 단위 테스트 작성.</li>
        <li>Exposed 및 의존성 주입(DI)을 사용하여 실제로 동작하는 리포지토리 구축.</li>
        <li>외부 데이터베이스에 접근하는 서비스 배포.</li>
    </list>
    <p>
        이전 튜토리얼에서는 작업 관리자(Task Manager) 예제를 사용하여 <Links href="/ktor/server-requests-and-responses" summary="Ktor와 함께 Kotlin으로 작업 관리자 애플리케이션을 구축하면서 라우팅, 요청 처리 및 매개변수의 기본 사항을 알아봅니다.">요청 처리</Links>,
        <Links href="/ktor/server-create-restful-apis" summary="JSON 파일을 생성하는 RESTful API 예제를 통해 Kotlin과 Ktor를 사용하여 백엔드 서비스를 구축하는 방법을 알아봅니다.">RESTful API 생성</Links>,
        <Links href="/ktor/server-create-website" summary="Kotlin에서 Ktor와 Thymeleaf 템플릿을 사용하여 웹사이트를 구축하는 방법을 알아봅니다.">Thymeleaf 템플릿을 사용한 웹 앱 구축</Links>과 같은 기본 사항을 다루었습니다.
    </p>
    <p>
        이전 튜토리얼들이 단순한 인메모리 <code>TaskRepository</code>를 사용하여 프론트엔드 기능에 중점을 두었다면, 이번 가이드는 Ktor 서비스가 Exposed SQL 라이브러리를 통해 관계형 데이터베이스와 상호작용하는 방법을 보여주는 것으로 초점을 전환합니다.
    </p>
    <p>
        이번 가이드는 내용이 더 길고 복잡하지만, 동작하는 코드를 빠르게 작성하고 점진적으로 새로운 기능을 도입해 나갈 수 있습니다.
    </p>
    <p>이 가이드는 두 부분으로 구성됩니다:</p>
    <list type="decimal">
        <li>
            <a href="#create-restful-service-and-repository">인메모리 리포지토리를 사용하는 애플리케이션 생성.</a>
        </li>
        <li>
            <a href="#add-postgresql-repository">인메모리 리포지토리를 PostgreSQL을 사용하는 리포지토리로 교체.</a>
        </li>
    </list>
    <chapter title="사전 준비 사항" id="prerequisites">
        <p>
            이 튜토리얼을 단독으로 진행할 수도 있지만, 콘텐츠 협상(Content Negotiation)과 REST에 익숙해지기 위해 <Links href="/ktor/server-create-restful-apis" summary="JSON 파일을 생성하는 RESTful API 예제를 통해 Kotlin과 Ktor를 사용하여 백엔드 서비스를 구축하는 방법을 알아봅니다.">RESTful API 생성</Links> 튜토리얼을 먼저 완료하는 것을 권장합니다.
        </p>
        <p><a href="https://www.jetbrains.com/help/idea/installation-guide.html">IntelliJ
            IDEA</a>를 설치하는 것을 권장하지만, 원하는 다른 IDE를 사용할 수도 있습니다.
        </p>
    </chapter>
    <chapter title="RESTful 서비스 및 인메모리 리포지토리 생성" id="create-restful-service-and-repository">
        <p>
            먼저 작업 관리자의 RESTful 서비스를 다시 생성합니다. 초기에는 인메모리 리포지토리를 사용하지만, 최소한의 노력으로 교체할 수 있는 구조로 설계합니다.
        </p>
        <p>다음 6단계로 진행됩니다:</p>
        <list type="decimal">
            <li>
                <a href="#create-project">초기 프로젝트 생성.</a>
            </li>
            <li>
                <a href="#add-starter-code">스타터 코드 추가.</a>
            </li>
            <li>
                <a href="#add-routes">CRUD 라우트 추가.</a>
            </li>
            <li>
                <a href="#add-client-page">단일 페이지 애플리케이션(SPA) 추가.</a>
            </li>
            <li>
                <a href="#test-manually">애플리케이션 수동 테스트.</a>
            </li>
            <li>
                <a href="#add-automated-tests">자동화된 테스트 추가.</a>
            </li>
        </list>
        <chapter title="플러그인이 포함된 새 프로젝트 생성" id="create-project">
            <p>
                Ktor Project Generator로 새 프로젝트를 생성하려면 다음 단계를 따르세요:
            </p>
            <procedure id="create-project-procedure">
                <step>
                    <p>
                        <a href="https://start.ktor.io/">Ktor Project Generator</a>로 이동합니다.
                    </p>
                </step>
                <step>
                    <p>
                        <control>Project artifact</control>
                        필드에 프로젝트 아티팩트 이름으로
                        <Path>com.example.ktor-exposed-task-app</Path>
                        을 입력합니다.
                        <img src="tutorial_server_db_integration_project_artifact.png"
                             alt="Ktor Project Generator에서 프로젝트 아티팩트 이름 지정"
                             border-effect="line"
                             style="block"
                             width="706"/>
                    </p>
                </step>
                <step>
                    <p>
                        플러그인 섹션에서 다음 플러그인을 검색하고
                        <control>Add</control>
                        버튼을 클릭하여 추가합니다:
                    </p>
                    <list type="bullet">
                        <li>Content Negotiation</li>
                        <li>kotlinx.serialization</li>
                        <li>Static Content</li>
                        <li>Status Pages</li>
                        <li>Dependency Injection</li>
                        <li>Exposed</li>
                        <li>PostgreSQL</li>
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
                        플러그인을 추가한 후, 플러그인 섹션 오른쪽 상단에 있는
                        <control>7 plugins</control>
                        버튼을 클릭하여 추가된 플러그인을 확인합니다.
                    </p>
                    <p>프로젝트에 추가될 모든 플러그인 목록이 표시됩니다:
                        <img src="tutorial_server_db_integration_plugin_list.png"
                             alt="Ktor Project Generator의 플러그인 드롭다운"
                             border-effect="line"
                             style="block"
                             width="706"/>
                    </p>
                </step>
                <step>
                    <p>
                        <control>Download</control>
                        버튼을 클릭하여 Ktor 프로젝트를 생성하고 다운로드합니다.
                    </p>
                </step>
                <step>
                    <p>
                        생성된 프로젝트를
                        <a href="https://www.jetbrains.com/help/idea/installation-guide.html">IntelliJ
                            IDEA</a> 또는 선택한 다른 IDE에서 엽니다.
                    </p>
                </step>
                <step>
                    <p>
                        <Path>src/main/kotlin</Path>
                        으로 이동하여
                        <Path>CitySchema.kt</Path>,
                        <Path>UsersService.kt</Path>,
                        <Path>GreetingService.kt</Path>,
                        <Path>Postgres.kt</Path>
                        파일을 삭제합니다.
                    </p>
                </step>
                <step id="delete-function">
                    <p>
                        <Path>Exposed.kt</Path>
                        파일을 열고 <code>.configureExposed()</code> 함수의 내용을 제거합니다.
                    </p>
                    <code-block lang="kotlin" code="                        suspend fun Application.configureExposed() {&#10;                        }"/>
                    <p>
                        이 기능을 제거하는 이유는 Ktor Project Generator가 HSQLDB 또는 PostgreSQL에 사용자 및 도시 데이터를 유지하는 방법을 보여주기 위해 샘플 코드를 추가했기 때문입니다. 이 튜토리얼에서는 해당 샘플 코드가 필요하지 않습니다.
                    </p>
                </step>
                <step>
                    <Path>gradle/libs.versions.toml</Path> 파일을 열고 최신 Exposed 버전이 지정되어 있는지 확인합니다:
                    <code-block lang="kotlin" code="                        [versions]&#10;                        #...&#10;                        exposed = %exposed_version%"/>
                </step>
            </procedure>
        </chapter>
        <chapter title="스타터 코드 추가" id="add-starter-code">
            <procedure id="add-starter-code-procedure">
                <step>
                    <Path>src/main/kotlin</Path>
                    으로 이동하여
                    <Path>model</Path>
                    이라는 하위 패키지를 생성합니다.
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
                        를 열고 우선순위를 나타내는 enum과 작업을 나타내는 클래스를 추가합니다.
                    </p>
                    <code-block lang="kotlin" code="package com.example.model&#10;&#10;import kotlinx.serialization.Serializable&#10;&#10;enum class Priority {&#10;    Low, Medium, High, Vital&#10;}&#10;&#10;@Serializable&#10;data class Task(&#10;    val name: String,&#10;    val description: String,&#10;    val priority: Priority&#10;)"/>
                    <p>
                        <code>Task</code> 클래스는 <Links href="/ktor/server-serialization" summary="ContentNegotiation 플러그인은 클라이언트와 서버 간 미디어 타입 협상과 특정 형식으로 콘텐츠를 직렬화/역직렬화하는 두 가지 주요 목적을 가집니다."><code>kotlinx.serialization</code></Links> 라이브러리의 <code>Serializable</code> 타입으로 어노테이션이 지정되어 있습니다.
                    </p>
                    <p>
                        이전 튜토리얼에서와 마찬가지로 인메모리 리포지토리를 생성합니다. 하지만 이번에는 나중에 쉽게 교체할 수 있도록 리포지토리가 인터페이스를 구현하도록 만듭니다.
                    </p>
                </step>
                <step>
                    <Path>model</Path>
                    하위 패키지에 새
                    <Path>TaskRepository.kt</Path>
                    파일을 생성합니다.
                </step>
                <step>
                    <p>
                        <Path>TaskRepository.kt</Path>
                        를 열고 다음 인터페이스를 추가합니다:
                    </p>
                    <code-block lang="kotlin" code="                        package com.example.model&#10;&#10;                        interface TaskRepository {&#10;                            fun allTasks(): List&lt;Task&gt;&#10;                            fun tasksByPriority(priority: Priority): List&lt;Task&gt;&#10;                            fun taskByName(name: String): Task?&#10;                            fun addTask(task: Task)&#10;                            fun removeTask(name: String): Boolean&#10;                        }"/>
                </step>
                <step>
                    동일한 디렉터리 내에 새
                    <Path>FakeTaskRepository.kt</Path>
                    파일을 생성합니다.
                </step>
                <step>
                    <p>
                        <Path>FakeTaskRepository.kt</Path>
                        를 열고 다음 클래스를 추가합니다:
                    </p>
                    <code-block lang="kotlin" code="                        package com.example.model&#10;&#10;                        class FakeTaskRepository : TaskRepository {&#10;                            private val tasks = mutableListOf(&#10;                                Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;                                Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;                                Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;                                Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;                            )&#10;&#10;                            override fun allTasks(): List&lt;Task&gt; = tasks&#10;&#10;                            override fun tasksByPriority(priority: Priority) = tasks.filter {&#10;                                it.priority == priority&#10;                            }&#10;&#10;                            override fun taskByName(name: String) = tasks.find {&#10;                                it.name.equals(name, ignoreCase = true)&#10;                            }&#10;&#10;                            override fun addTask(task: Task) {&#10;                                if (taskByName(task.name) != null) {&#10;                                    throw IllegalStateException(&quot;Cannot duplicate task names!&quot;)&#10;                                }&#10;                                tasks.add(task)&#10;                            }&#10;&#10;                            override fun removeTask(name: String): Boolean {&#10;                                return tasks.removeIf { it.name == name }&#10;                            }&#10;                        }"/>
                </step>
            </procedure>
        </chapter>
        <chapter title="라우트 추가" id="add-routes">
            <procedure id="add-routes-procedure">
                <step>
                    <Path>src/main/kotlin</Path>
                    에서
                    <Path>Serialization.kt</Path>
                    파일을 엽니다.
                </step>
                <step>
                    <p>
                        기존의 <code>Application.configureSerialization()</code> 함수를 아래 구현으로 교체합니다:
                    </p>
                    <code-block lang="kotlin" code="package com.example&#10;&#10;import com.example.model.Priority&#10;import com.example.model.Task&#10;import com.example.model.TaskRepository&#10;import io.ktor.http.*&#10;import io.ktor.serialization.*&#10;import io.ktor.serialization.kotlinx.json.*&#10;import io.ktor.server.application.*&#10;import io.ktor.server.plugins.contentnegotiation.*&#10;import io.ktor.server.plugins.di.dependencies&#10;import io.ktor.server.request.*&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;&#10;suspend fun Application.configureSerialization() {&#10;    val repository = dependencies.resolve&lt;TaskRepository&gt;()&#10;&#10;    install(ContentNegotiation) {&#10;        json()&#10;    }&#10;    routing {&#10;        route(&quot;/tasks&quot;) {&#10;            get {&#10;                val tasks = repository.allTasks()&#10;                call.respond(tasks)&#10;            }&#10;&#10;            get(&quot;/byName/{taskName}&quot;) {&#10;                val name = call.parameters[&quot;taskName&quot;]&#10;                if (name == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@get&#10;                }&#10;                val task = repository.taskByName(name)&#10;                if (task == null) {&#10;                    call.respond(HttpStatusCode.NotFound)&#10;                    return@get&#10;                }&#10;                call.respond(task)&#10;            }&#10;&#10;            get(&quot;/byPriority/{priority}&quot;) {&#10;                val priorityAsText = call.parameters[&quot;priority&quot;]&#10;                if (priorityAsText == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@get&#10;                }&#10;                try {&#10;                    val priority = Priority.valueOf(priorityAsText)&#10;                    val tasks = repository.tasksByPriority(priority)&#10;&#10;&#10;                    if (tasks.isEmpty()) {&#10;                        call.respond(HttpStatusCode.NotFound)&#10;                        return@get&#10;                    }&#10;                    call.respond(tasks)&#10;                } catch (ex: IllegalArgumentException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                }&#10;            }&#10;&#10;            post {&#10;                try {&#10;                    val task = call.receive&lt;Task&gt;()&#10;                    repository.addTask(task)&#10;                    call.respond(HttpStatusCode.NoContent)&#10;                } catch (ex: IllegalStateException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                } catch (ex: JsonConvertException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                }&#10;            }&#10;&#10;            delete(&quot;/{taskName}&quot;) {&#10;                val name = call.parameters[&quot;taskName&quot;]&#10;                if (name == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@delete&#10;                }&#10;                if (repository.removeTask(name)) {&#10;                    call.respond(HttpStatusCode.NoContent)&#10;                } else {&#10;                    call.respond(HttpStatusCode.NotFound)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
                    <p>
                        이는 Ktor의 의존성 주입 컨테이너에서 리포지토리를 확인(resolve)한다는 점을 제외하면, <Links href="/ktor/server-create-restful-apis" summary="JSON 파일을 생성하는 RESTful API 예제를 통해 Kotlin과 Ktor를 사용하여 백엔드 서비스를 구축하는 방법을 알아봅니다.">RESTful API 생성</Links> 튜토리얼에서 구현한 것과 동일한 라우팅입니다. 의존성의 타입이 <code>interface</code>이므로 다양한 구현체를 주입할 수 있습니다.
                    </p>
                    <p>
                        <code>dependencies.resolve()</code>가 suspend 함수이므로, <code>.configureSerialization()</code> 역시 suspend로 선언되어야 합니다.
                    </p>
                    <p>
                        이제 <code>.configureSerialization()</code>에 의존성을 추가했으므로 기존 호출 코드는 더 이상 컴파일되지 않습니다. 다행히 이 함수는 한 번만 호출됩니다.
                    </p>
                </step>
                <step>
                    <Path>src/main/kotlin</Path>
                    내의
                    <Path>DI.kt</Path>
                    파일을 엽니다.
                </step>
                <step>
                    <p>
                        <code>.configureDependencyInjection()</code> 함수의 내용을 아래 구현으로 교체합니다:
                    </p>
                    <code-block lang="kotlin" code="                    import com.example.model.FakeTaskRepository&#10;                    import com.example.model.TaskRepository&#10;                    // ...&#10;&#10;                    fun Application.configureDependencyInjection() {&#10;                        dependencies {&#10;                            provide&lt;TaskRepository&gt; {&#10;                                FakeTaskRepository()&#10;                            }&#10;                        }&#10;                    }"/>
                    <p>
                        이제 <code>TaskRepository</code>에 대한 구현체로 <code>FakeTaskRepository</code>를 등록했습니다.
                        장기적인 목표는 이를 <code>PostgresTaskRepository</code>로 교체할 수 있도록 하는 것입니다.
                    </p>
                </step>
                <step>
                    <Path>src/main/resources</Path> 폴더에 있는 <Path>application.yaml</Path> 파일을 열고, <code>.configureDependencyInjection()</code> 함수가 <code>.configureSerialization()</code>보다 먼저 나열되어 있는지 확인합니다:
                    <code-block lang="yaml" code="                        ktor:&#10;                        deployment:&#10;                            port: 8080&#10;                        application:&#10;                            modules:&#10;                                - com.example.DIKt.configureDependencyInjection&#10;                                - com.example.SerializationKt.configureSerialization&#10;                                - com.example.ExposedKt.configureExposed&#10;                                - com.example.StatusPagesKt.configureStatusPages&#10;                                - com.example.RoutingKt.configureRouting"/>
                </step>
            </procedure>
        </chapter>
        <chapter title="클라이언트 페이지 추가" id="add-client-page">
            <procedure id="add-client-page-procedure">
                <step>
                    <Path>src/main/resources/static</Path>
                    에서
                    <Path>index.html</Path>
                    파일을 엽니다.
                </step>
                <step>
                    <p>
                        현재 내용을 아래 구현으로 교체합니다:
                    </p>
                    <code-block lang="html" code="&lt;html&gt;&#10;&lt;head&gt;&#10;    &lt;title&gt;A Simple SPA For Tasks&lt;/title&gt;&#10;    &lt;script type=&quot;application/javascript&quot;&gt;&#10;        function displayAllTasks() {&#10;            clearTasksTable();&#10;            fetchAllTasks().then(displayTasks)&#10;        }&#10;&#10;        function displayTasksWithPriority() {&#10;            clearTasksTable();&#10;            const priority = readTaskPriority();&#10;            fetchTasksWithPriority(priority).then(displayTasks)&#10;        }&#10;&#10;        function displayTask(name) {&#10;            fetchTaskWithName(name).then(t =&gt;&#10;                taskDisplay().innerHTML&#10;                    = `${t.priority} priority task ${t.name} with description &quot;${t.description}&quot;`&#10;            )&#10;        }&#10;&#10;        function deleteTask(name) {&#10;            deleteTaskWithName(name).then(() =&gt; {&#10;                clearTaskDisplay();&#10;                displayAllTasks();&#10;            })&#10;        }&#10;&#10;        function deleteTaskWithName(name) {&#10;            return sendDELETE(`/tasks/${name}`)&#10;        }&#10;&#10;        function addNewTask() {&#10;            const task = buildTaskFromForm();&#10;            sendPOST(&quot;/tasks&quot;, task).then(displayAllTasks);&#10;        }&#10;&#10;        function buildTaskFromForm() {&#10;            return {&#10;                name: getTaskFormValue(&quot;newTaskName&quot;),&#10;                description: getTaskFormValue(&quot;newTaskDescription&quot;),&#10;                priority: getTaskFormValue(&quot;newTaskPriority&quot;)&#10;            }&#10;        }&#10;&#10;        function getTaskFormValue(controlName) {&#10;            return document.addTaskForm[controlName].value;&#10;        }&#10;&#10;        function taskDisplay() {&#10;            return document.getElementById(&quot;currentTaskDisplay&quot;);&#10;        }&#10;&#10;        function readTaskPriority() {&#10;            return document.priorityForm.priority.value&#10;        }&#10;&#10;        function fetchTasksWithPriority(priority) {&#10;            return sendGET(`/tasks/byPriority/${priority}`);&#10;        }&#10;&#10;        function fetchTaskWithName(name) {&#10;            return sendGET(`/tasks/byName/${name}`);&#10;        }&#10;&#10;        function fetchAllTasks() {&#10;            return sendGET(&quot;/tasks&quot;)&#10;        }&#10;&#10;        function sendGET(url) {&#10;            return fetch(&#10;                url,&#10;                {headers: {'Accept': 'application/json'}}&#10;            ).then(response =&gt; {&#10;                if (response.ok) {&#10;                    return response.json()&#10;                }&#10;                return [];&#10;            });&#10;        }&#10;&#10;        function sendPOST(url, data) {&#10;            return fetch(url, {&#10;                method: 'POST',&#10;                headers: {'Content-Type': 'application/json'},&#10;                body: JSON.stringify(data)&#10;            });&#10;        }&#10;&#10;        function sendDELETE(url) {&#10;            return fetch(url, {&#10;                method: &quot;DELETE&quot;&#10;            });&#10;        }&#10;&#10;        function tasksTable() {&#10;            return document.getElementById(&quot;tasksTableBody&quot;);&#10;        }&#10;&#10;        function clearTasksTable() {&#10;            tasksTable().innerHTML = &quot;&quot;;&#10;        }&#10;&#10;        function clearTaskDisplay() {&#10;            taskDisplay().innerText = &quot;None&quot;;&#10;        }&#10;&#10;        function displayTasks(tasks) {&#10;            const tasksTableBody = tasksTable()&#10;            tasks.forEach(task =&gt; {&#10;                const newRow = taskRow(task);&#10;                tasksTableBody.appendChild(newRow);&#10;            });&#10;        }&#10;&#10;        function taskRow(task) {&#10;            return tr([&#10;                td(task.name),&#10;                td(task.priority),&#10;                td(viewLink(task.name)),&#10;                td(deleteLink(task.name)),&#10;            ]);&#10;        }&#10;&#10;        function tr(children) {&#10;            const node = document.createElement(&quot;tr&quot;);&#10;            children.forEach(child =&gt; node.appendChild(child));&#10;            return node;&#10;        }&#10;&#10;        function td(content) {&#10;            const node = document.createElement(&quot;td&quot;);&#10;            if (content instanceof Element) {&#10;                node.appendChild(content)&#10;            } else {&#10;                node.appendChild(document.createTextNode(content));&#10;            }&#10;            return node;&#10;        }&#10;&#10;        function viewLink(taskName) {&#10;            const node = document.createElement(&quot;a&quot;);&#10;            node.setAttribute(&#10;                &quot;href&quot;, `javascript:displayTask(&quot;${taskName}&quot;)`&#10;            )&#10;            node.appendChild(document.createTextNode(&quot;view&quot;));&#10;            return node;&#10;        }&#10;&#10;        function deleteLink(taskName) {&#10;            const node = document.createElement(&quot;a&quot;);&#10;            node.setAttribute(&#10;                &quot;href&quot;, `javascript:deleteTask(&quot;${taskName}&quot;)`&#10;            )&#10;            node.appendChild(document.createTextNode(&quot;delete&quot;));&#10;            return node;&#10;        }&#10;    &lt;/script&gt;&#10;&lt;/head&gt;&#10;&lt;body onload=&quot;displayAllTasks()&quot;&gt;&#10;&lt;h1&gt;Task Manager Client&lt;/h1&gt;&#10;&lt;form action=&quot;javascript:displayAllTasks()&quot;&gt;&#10;    &lt;span&gt;View all the tasks&lt;/span&gt;&#10;    &lt;input type=&quot;submit&quot; value=&quot;Go&quot;&gt;&#10;&lt;/form&gt;&#10;&lt;form name=&quot;priorityForm&quot; action=&quot;javascript:displayTasksWithPriority()&quot;&gt;&#10;    &lt;span&gt;View tasks with priority&lt;/span&gt;&#10;    &lt;select name=&quot;priority&quot;&gt;&#10;        &lt;option name=&quot;Low&quot;&gt;Low&lt;/option&gt;&#10;        &lt;option name=&quot;Medium&quot;&gt;Medium&lt;/option&gt;&#10;        &lt;option name=&quot;High&quot;&gt;High&lt;/option&gt;&#10;        &lt;option name=&quot;Vital&quot;&gt;Vital&lt;/option&gt;&#10;    &lt;/select&gt;&#10;    &lt;input type=&quot;submit&quot; value=&quot;Go&quot;&gt;&#10;&lt;/form&gt;&#10;&lt;form name=&quot;addTaskForm&quot; action=&quot;javascript:addNewTask()&quot;&gt;&#10;    &lt;span&gt;Create new task with&lt;/span&gt;&#10;    &lt;label for=&quot;newTaskName&quot;&gt;name&lt;/label&gt;&#10;    &lt;input type=&quot;text&quot; id=&quot;newTaskName&quot; name=&quot;newTaskName&quot; size=&quot;10&quot;&gt;&#10;    &lt;label for=&quot;newTaskDescription&quot;&gt;description&lt;/label&gt;&#10;    &lt;input type=&quot;text&quot; id=&quot;newTaskDescription&quot; name=&quot;newTaskDescription&quot; size=&quot;20&quot;&gt;&#10;    &lt;label for=&quot;newTaskPriority&quot;&gt;priority&lt;/label&gt;&#10;    &lt;select id=&quot;newTaskPriority&quot; name=&quot;newTaskPriority&quot;&gt;&#10;        &lt;option name=&quot;Low&quot;&gt;Low&lt;/option&gt;&#10;        &lt;option name=&quot;Medium&quot;&gt;Medium&lt;/option&gt;&#10;        &lt;option name=&quot;High&quot;&gt;High&lt;/option&gt;&#10;        &lt;option name=&quot;Vital&quot;&gt;Vital&lt;/option&gt;&#10;    &lt;/select&gt;&#10;    &lt;input type=&quot;submit&quot; value=&quot;Go&quot;&gt;&#10;&lt;/form&gt;&#10;&lt;hr&gt;&#10;&lt;div&gt;&#10;    Current task is &lt;em id=&quot;currentTaskDisplay&quot;&gt;None&lt;/em&gt;&#10;&lt;/div&gt;&#10;&lt;hr&gt;&#10;&lt;table&gt;&#10;    &lt;thead&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Name&lt;/th&gt;&#10;        &lt;th&gt;Priority&lt;/th&gt;&#10;        &lt;th&gt;&lt;/th&gt;&#10;        &lt;th&gt;&lt;/th&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/thead&gt;&#10;    &lt;tbody id=&quot;tasksTableBody&quot;&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
                    <p>
                        이는 이전 튜토리얼에서 사용된 것과 동일한 SPA입니다. JavaScript로 작성되었으며 브라우저 내에서 사용 가능한 라이브러리만 사용하므로 클라이언트 측 종속성에 대해 걱정할 필요가 없습니다.
                    </p>
                </step>
            </procedure>
        </chapter>
        <chapter title="애플리케이션 수동 테스트" id="test-manually">
            <procedure id="test-manually-procedure">
                <step>
                    <p>IntelliJ IDEA에서 실행 버튼(<img src="intellij_idea_gutter_icon.svg"
                              style="inline" height="16" width="16"
                              alt="intelliJ IDEA run icon"/>)을 클릭하여 애플리케이션을 시작합니다.</p>
                </step>
                <step>
                    <p>
                        브라우저에서 <a
                            href="http://0.0.0.0:8080/static/index.html">http://0.0.0.0:8080/static/index.html</a>로 이동합니다. 세 개의 폼과 필터링된 결과를 표시하는 테이블로 구성된 클라이언트 페이지가 표시되어야 합니다.
                    </p>
                    <img src="tutorial_server_db_integration_index_page.png"
                         alt="Task Manager Client를 표시하는 브라우저 창"
                         border-effect="rounded"
                         width="706"/>
                </step>
                <step>
                    <p>
                        폼을 작성하고 <control>Go</control> 버튼을 사용하여 전송하여 애플리케이션을 테스트합니다. 테이블 항목의 <control>View</control> 및 <control>Delete</control> 버튼을 사용해 보세요.
                    </p>
                    <img src="tutorial_server_db_integration_manual_test.gif"
                         alt="Task Manager Client를 표시하는 브라우저 창"
                         border-effect="rounded"
                         width="706"/>
                </step>
            </procedure>
        </chapter>
        <chapter title="자동화된 단위 테스트 추가" id="add-automated-tests">
            <procedure id="add-automated-tests-procedure">
                <step>
                    <p>
                        <Path>src/test/kotlin</Path>
                        의
                        <Path>ServerTest.kt</Path>
                        파일을 열고 다음 테스트를 추가합니다:
                    </p>
                    <code-block lang="kotlin" code="package com.example&#10;&#10;import com.example.model.Priority&#10;import com.example.model.Task&#10;import com.example.model.TaskRepository&#10;import io.ktor.client.call.*&#10;import io.ktor.client.plugins.contentnegotiation.*&#10;import io.ktor.server.plugins.di.dependencies&#10;import io.ktor.client.request.*&#10;import io.ktor.http.*&#10;import io.ktor.serialization.kotlinx.json.*&#10;import io.ktor.server.application.*&#10;import io.ktor.server.testing.*&#10;import kotlin.test.*&#10;&#10;suspend fun Application.configureTestApp() {&#10;    dependencies {&#10;        provide&lt;TaskRepository&gt; {&#10;            FakeTaskRepository()&#10;        }&#10;    }&#10;    configureSerialization()&#10;    configureStatusPages()&#10;    configureRouting()&#10;}&#10;&#10;class ServerTest {&#10;    @Test&#10;    fun tasksCanBeFoundByPriority() = testApplication {&#10;        application {&#10;            configureTestApp()&#10;        }&#10;&#10;        val client = createClient {&#10;            install(ContentNegotiation) {&#10;                json()&#10;            }&#10;        }&#10;&#10;        val response = client.get(&quot;/tasks/byPriority/Medium&quot;)&#10;        val results = response.body&lt;List&lt;Task&gt;&gt;()&#10;&#10;        assertEquals(HttpStatusCode.OK, response.status)&#10;&#10;        val expectedTaskNames = listOf(&quot;gardening&quot;, &quot;painting&quot;)&#10;        val actualTaskNames = results.map(Task::name)&#10;        assertContentEquals(expectedTaskNames, actualTaskNames)&#10;    }&#10;&#10;    @Test&#10;    fun invalidPriorityProduces400() = testApplication {&#10;        application {&#10;            configureTestApp()&#10;        }&#10;        val response = client.get(&quot;/tasks/byPriority/Invalid&quot;)&#10;        assertEquals(HttpStatusCode.BadRequest, response.status)&#10;    }&#10;&#10;    @Test&#10;    fun unusedPriorityProduces404() = testApplication {&#10;        application {&#10;            configureTestApp()&#10;        }&#10;        val response = client.get(&quot;/tasks/byPriority/Vital&quot;)&#10;        assertEquals(HttpStatusCode.NotFound, response.status)&#10;    }&#10;&#10;    @Test&#10;    fun newTasksCanBeAdded() = testApplication {&#10;        application {&#10;            configureTestApp()&#10;        }&#10;&#10;        val client = createClient {&#10;            install(ContentNegotiation) {&#10;                json()&#10;            }&#10;        }&#10;&#10;        val task = Task(&quot;swimming&quot;, &quot;Go to the beach&quot;, Priority.Low)&#10;        val response1 = client.post(&quot;/tasks&quot;) {&#10;            header(&#10;                HttpHeaders.ContentType,&#10;                ContentType.Application.Json&#10;            )&#10;&#10;            setBody(task)&#10;        }&#10;        assertEquals(HttpStatusCode.NoContent, response1.status)&#10;&#10;        val response2 = client.get(&quot;/tasks&quot;)&#10;        assertEquals(HttpStatusCode.OK, response2.status)&#10;&#10;        val taskNames = response2&#10;            .body&lt;List&lt;Task&gt;&gt;()&#10;            .map { it.name }&#10;&#10;        assertContains(taskNames, &quot;swimming&quot;)&#10;    }&#10;}"/>
                    <p>
                        이러한 테스트가 컴파일되고 실행되려면 Ktor Client용 <a
                            href="https://api.ktor.io/ktor-server-content-negotiation/io.ktor.server.plugins.contentnegotiation/-content-negotiation.html">Content
                        Negotiation</a> 플러그인에 대한 종속성을 추가해야 합니다.
                    </p>
                </step>
                <step>
                    <p>
                        <Path>build.gradle.kts</Path>
                        를 열고 다음 종속성을 추가합니다:
                    </p>
                    <code-block lang="kotlin" code="                        dependencies {&#10;                            //...&#10;                            testImplementation(ktorLibs.client.contentNegotiation)&#10;                        }"/>
                </step>
                <step>
                    <p>IntelliJ IDEA에서 에디터 오른쪽의 Gradle 알림 아이콘(<img alt="intelliJ IDEA gradle icon"
                              src="intellij_idea_gradle_icon.svg" width="16" height="26"/>)을 클릭하여 Gradle 변경 사항을 로드합니다.</p>
                </step>
                <step>
                    <p>IntelliJ IDEA에서 테스트 클래스 정의 옆에 있는 실행 버튼(<img src="intellij_idea_gutter_icon.svg"
                              style="inline" height="16" width="16"
                              alt="intelliJ IDEA run icon"/>)을 클릭하여 테스트를 실행합니다.</p>
                    <p>그런 다음 <control>Run</control> 창에서 테스트가 성공적으로 실행된 것을 확인할 수 있습니다.
                    </p>
                    <img src="tutorial_server_db_integration_test_results.png"
                         alt="IntelliJ IDEA의 Run 창에 표시된 성공적인 테스트 결과"
                         border-effect="line"
                         width="706"/>
                </step>
            </procedure>
        </chapter>
    </chapter>
    <chapter title="PostgreSQL 리포지토리 추가" id="add-postgresql-repository">
        <p>
            인메모리 데이터를 사용하는 애플리케이션이 작동하므로, 다음 단계는 데이터 스토리지를 외부 PostgreSQL 데이터베이스로 전환하는 것입니다.
        </p>
        <p>
            다음 작업을 통해 이를 수행합니다:
        </p>
        <list type="decimal">
            <li><a href="#create-schema">PostgreSQL 내에 데이터베이스 스키마 생성.</a></li>
            <li><a href="#adapt-repo">비동기 접근을 위해 <code>TaskRepository</code> 조정.</a></li>
            <li><a href="#config-db-connection">애플리케이션 내에서 데이터베이스 연결 구성.</a></li>
            <li><a href="#create-mapping">연관된 데이터베이스 테이블에 <code>Task</code> 타입 매핑.</a></li>
            <li><a href="#create-new-repo">매핑을 기반으로 새 리포지토리 생성.</a></li>
            <li><a href="#switch-repo">시작 코드에서 새 리포지토리로 전환.</a></li>
        </list>
        <chapter title="데이터베이스 스키마 생성" id="create-schema">
            <procedure id="create-schema-procedure">
                <step>
                    <p>
                        원하는 데이터베이스 관리 도구를 사용하여 PostgreSQL 내에 새 데이터베이스를 생성합니다.
                        이름은 기억할 수만 있다면 무엇이든 상관없습니다. 이 예제에서는
                        <Path>ktor_tutorial_db</Path>
                        를 사용합니다.
                    </p>
                    <tip>
                        <p>
                            PostgreSQL에 대한 자세한 정보는 <a
                                href="https://www.postgresql.org/docs/current/">공식 문서</a>를 참조하세요.
                        </p>
                        <p>
                            IntelliJ IDEA에서는 Database Tools를 활용하여 <a
                                href="https://www.jetbrains.com/help/idea/postgresql.html">PostgreSQL 데이터베이스에 연결하고 관리</a>할 수 있습니다.
                        </p>
                    </tip>
                </step>
                <step>
                    <p>
                        데이터베이스에 대해 아래 SQL 명령을 실행합니다. 이 명령은 데이터베이스 스키마를 생성하고 데이터를 채웁니다:
                    </p>
                    <code-block lang="sql" code="                        DROP TABLE IF EXISTS task;&#10;                        CREATE TABLE task(id SERIAL PRIMARY KEY, name VARCHAR(50), description VARCHAR(50), priority VARCHAR(50));&#10;&#10;                        INSERT INTO task (name, description, priority) VALUES ('cleaning', 'Clean the house', 'Low');&#10;                        INSERT INTO task (name, description, priority) VALUES ('gardening', 'Mow the lawn', 'Medium');&#10;                        INSERT INTO task (name, description, priority) VALUES ('shopping', 'Buy the groceries', 'High');&#10;                        INSERT INTO task (name, description, priority) VALUES ('painting', 'Paint the fence', 'Medium');&#10;                        INSERT INTO task (name, description, priority) VALUES ('exercising', 'Walk the dog', 'Medium');&#10;                        INSERT INTO task (name, description, priority) VALUES ('meditating', 'Contemplate the infinite', 'High');"/>
                    <p>
                        다음에 유의하세요:
                    </p>
                    <list>
                        <li>
                            <code>name</code>, <code>description</code>, <code>priority</code> 컬럼을 가진 <code>task</code>라는 단일 테이블을 생성합니다. 이 컬럼들은 <code>Task</code> 클래스의 프로퍼티에 매핑되어야 합니다.
                        </li>
                        <li>
                            테이블이 이미 존재하는 경우 다시 생성하므로 스크립트를 반복해서 실행할 수 있습니다.
                        </li>
                        <li>
                            <code>SERIAL</code> 타입인 <code>id</code>라는 추가 컬럼이 있습니다. 이 컬럼은 각 행에 기본 키(Primary Key)를 부여하는 데 사용되는 정수 값입니다. 이러한 값은 데이터베이스에 의해 자동으로 할당됩니다.
                        </li>
                    </list>
                </step>
            </procedure>
        </chapter>
        <chapter title="기존 리포지토리 조정" id="adapt-repo">
            <procedure id="adapt-repo-procedure">
                <p>
                    데이터베이스에 대해 쿼리를 실행할 때는 HTTP 요청을 처리하는 스레드가 차단(blocking)되지 않도록 비동기식으로 실행하는 것이 좋습니다. Kotlin에서는 <a
                        href="https://kotlinlang.org/docs/coroutines-overview.html">코루틴(coroutines)</a>을 통해 이를 가장 효과적으로 관리할 수 있습니다.
                </p>
                <step>
                    <p>
                        <Path>src/main/kotlin/model</Path>
                        에서
                        <Path>TaskRepository.kt</Path>
                        파일을 엽니다.
                    </p>
                </step>
                <step>
                    <p>
                        모든 인터페이스 메서드에 <code>suspend</code> 키워드를 추가합니다:
                    </p>
                    <code-block lang="kotlin" code="                    interface TaskRepository {&#10;                        suspend fun allTasks(): List&lt;Task&gt;&#10;                        suspend fun tasksByPriority(priority: Priority): List&lt;Task&gt;&#10;                        suspend fun taskByName(name: String): Task?&#10;                        suspend fun addTask(task: Task)&#10;                        suspend fun removeTask(name: String): Boolean&#10;                    }"/>
                    <p>
                        이렇게 하면 인터페이스 메서드의 구현체에서 다른 코루틴 디스패처로 작업을 시작할 수 있습니다.
                    </p>
                    <p>
                        이제 이에 맞게 <code>FakeTaskRepository</code>의 메서드도 수정해야 합니다. 단, 해당 구현에서는 디스패처를 전환할 필요가 없습니다.
                    </p>
                </step>
                <step>
                    <p>
                        <Path>FakeTaskRepository.kt</Path>
                        파일을 열고 모든 메서드에 <code>suspend</code> 키워드를 추가합니다:
                    </p>
                    <code-block lang="kotlin" code="                    class FakeTaskRepository : TaskRepository {&#10;                        //...&#10;&#10;                        override suspend fun allTasks(): List&lt;Task&gt; = tasks&#10;&#10;                        override suspend fun tasksByPriority(priority: Priority) = tasks.filter {&#10;                            //...&#10;                        }&#10;&#10;                        override suspend fun taskByName(name: String) = tasks.find {&#10;                            //...&#10;                        }&#10;&#10;                        override suspend fun addTask(task: Task) {&#10;                            //...&#10;                        }&#10;&#10;                        override suspend fun removeTask(name: String): Boolean {&#10;                            //...&#10;                        }&#10;                    }"/>
                    <p>
                        여기까지는 새로운 기능을 추가하지 않았습니다. 대신 데이터베이스에 대해 비동기적으로 쿼리를 실행할 <code>PostgresTaskRepository</code> 생성을 위한 기반을 마련했습니다.
                    </p>
                </step>
            </procedure>
        </chapter>
        <chapter title="데이터베이스 연결 구성" id="config-db-connection">
            <procedure id="config-db-connection-procedure">
                <p>
                    <a href="#delete-function">이 튜토리얼의 첫 번째 파트</a>에서 <Path>Exposed.kt</Path> 내의 <code>.configureExposed()</code> 함수에 있던 샘플 코드를 삭제했습니다. 이제 직접 구현을 추가할 준비가 되었습니다.
                </p>
                <p>
                    Ktor Project Generator에 의해 DAO 타입에 대한 지원이 추가되지 않았으므로, 먼저 Gradle 빌드 파일에 관련 종속성을 추가해야 합니다.
                </p>
                <step>
                    <Path>gradle/libs.versions.toml</Path> 파일에 <code>exposed-jdbc</code> 및 <code>exposed-dao</code> 라이브러리를 추가합니다:
                    <code-block lang="kotlin" code="                        [libraries]&#10;                        exposed-jdbc = { module = &quot;org.jetbrains.exposed:exposed-jdbc&quot;, version.ref = &quot;exposed&quot; }&#10;                        exposed-dao = { module = &quot;org.jetbrains.exposed:exposed-dao&quot;, version.ref = &quot;exposed&quot; }"/>
                    이를 통해 Exposed DAO(Data Access Object) 패턴을 사용할 수 있게 됩니다.
                </step>
                <step>
                    <Path>build.gradle.kts</Path> 파일에 다음 종속성을 추가합니다:
                    <code-block lang="kotlin" code="                    dependencies {&#10;                        // ...&#10;                        implementation(libs.exposed.jdbc)&#10;                        implementation(libs.exposed.dao)&#10;                    }"/>
                </step>
                <step>
                    <p>IntelliJ IDEA에서 에디터 오른쪽의 Gradle 알림 아이콘(<img alt="intelliJ IDEA gradle icon"
                              src="intellij_idea_gradle_icon.svg" width="16" height="26"/>)을 클릭하여 Gradle 변경 사항을 로드합니다.</p>
                </step>
                <step>
                    <Path>src/main/kotlin</Path>
                    에서
                    <Path>Exposed.kt</Path>
                    파일을 엽니다.
                </step>
                <step>
                    <p>
                        <code>Database.connect()</code> 함수를 사용하여 데이터베이스에 연결하고, 설정 값을 본인의 환경에 맞게 조정합니다:
                    </p>
                    <code-block lang="kotlin" code="                        suspend fun Application.configureExposed() {&#10;                            Database.connect(&#10;                                &quot;jdbc:postgresql://localhost:5432/ktor_tutorial_db&quot;,&#10;                                user = &quot;postgres&quot;,&#10;                                password = &quot;password&quot;&#10;                            )&#10;                        }"/>
                    <p><code>url</code>에는 다음 구성 요소가 포함되어 있음에 유의하세요:</p>
                    <list>
                        <li>
                            <code>localhost:5432</code>는 PostgreSQL 데이터베이스가 실행 중인 호스트 및 포트입니다.
                        </li>
                        <li>
                            <code>ktor_tutorial_db</code>는 서비스를 실행할 때 생성된 데이터베이스의 이름입니다.
                        </li>
                    </list>
                    <tip>
                        자세한 내용은 <a href="https://www.jetbrains.com/help/exposed/working-with-database.html">Working with Databases in Exposed</a>를 참조하세요.
                    </tip>
                </step>
            </procedure>
        </chapter>
        <chapter title="객체/관계형 매핑(ORM) 생성" id="create-mapping">
            <procedure id="create-mapping-procedure">
                <step>
                    <Path>src/main/kotlin</Path>
                    으로 이동하여
                    <Path>db</Path>
                    라는 새 패키지를 생성합니다.
                </step>
                <step>
                    <Path>db</Path>
                    패키지 안에 새
                    <Path>mapping.kt</Path>
                    파일을 생성합니다.
                </step>
                <step>
                    <p>
                        <Path>mapping.kt</Path>
                        를 열고 <code>TaskTable</code> 및 <code>TaskDAO</code> 타입을 추가합니다:
                    </p>
                    <code-block lang="kotlin" code="package com.example.db&#10;&#10;import org.jetbrains.exposed.v1.core.dao.id.EntityID&#10;import org.jetbrains.exposed.v1.core.dao.id.IntIdTable&#10;import org.jetbrains.exposed.v1.dao.IntEntity&#10;import org.jetbrains.exposed.v1.dao.IntEntityClass&#10;&#10;object TaskTable : IntIdTable(&quot;task&quot;) {&#10;    val name = varchar(&quot;name&quot;, 50)&#10;    val description = varchar(&quot;description&quot;, 50)&#10;    val priority = varchar(&quot;priority&quot;, 50)&#10;}&#10;&#10;class TaskDAO(id: EntityID&lt;Int&gt;) : IntEntity(id) {&#10;    companion object : IntEntityClass&lt;TaskDAO&gt;(TaskTable)&#10;&#10;    var name by TaskTable.name&#10;    var description by TaskTable.description&#10;    var priority by TaskTable.priority&#10;}"/>
                    <p>
                        이러한 타입은 Exposed 라이브러리를 사용하여 <code>Task</code> 타입의 프로퍼티를 데이터베이스의 <code>task</code> 테이블 컬럼에 매핑합니다. <code>TaskTable</code> 타입은 기본 매핑을 정의하고, <code>TaskDAO</code> 타입은 작업을 생성, 검색, 업데이트 및 삭제하는 도우미 메서드를 추가합니다.
                    </p>
                </step>
                <step>
                    <p>
                        동일한
                        <Path>mapping.kt</Path>
                        파일에 다음 도우미 함수들을 추가합니다:
                    </p>
                    <code-block include-symbol="withTransaction, daoToModel"
                            lang="kotlin" code="package com.example.db&#10;&#10;import com.example.model.Priority&#10;import com.example.model.Task&#10;import kotlinx.coroutines.Dispatchers&#10;import kotlinx.coroutines.withContext&#10;import org.jetbrains.exposed.v1.core.dao.id.EntityID&#10;import org.jetbrains.exposed.v1.core.dao.id.IntIdTable&#10;import org.jetbrains.exposed.v1.dao.IntEntity&#10;import org.jetbrains.exposed.v1.dao.IntEntityClass&#10;import org.jetbrains.exposed.v1.jdbc.JdbcTransaction&#10;import org.jetbrains.exposed.v1.jdbc.transactions.inTopLevelSuspendTransaction&#10;&#10;object TaskTable : IntIdTable(&quot;task&quot;) {&#10;    val name = varchar(&quot;name&quot;, 50)&#10;    val description = varchar(&quot;description&quot;, 50)&#10;    val priority = varchar(&quot;priority&quot;, 50)&#10;}&#10;&#10;class TaskDAO(id: EntityID&lt;Int&gt;) : IntEntity(id) {&#10;    companion object : IntEntityClass&lt;TaskDAO&gt;(TaskTable)&#10;&#10;    var name by TaskTable.name&#10;    var description by TaskTable.description&#10;    var priority by TaskTable.priority&#10;}&#10;&#10;suspend fun &lt;T&gt; withTransaction(block: suspend JdbcTransaction.() -&gt; T): T = withContext(Dispatchers.IO) {&#10;    inTopLevelSuspendTransaction { block() }&#10;}&#10;&#10;fun daoToModel(dao: TaskDAO) = Task(&#10;    dao.name,&#10;    dao.description,&#10;    Priority.valueOf(dao.priority)&#10;)"/>
                    <list>
                        <li>
                            <code>withTransaction()</code> 함수는 새로운 최상위 데이터베이스 트랜잭션 내에서 중단(suspending) 블록을 실행합니다. 차단 방식의 JDBC 작업이 IO 작업에 최적화된 스레드 풀에서 실행되도록 코루틴 컨텍스트가 <code>Dispatchers.IO</code>로 전환됩니다.
                        </li>
                        <li>
                            <code>daoToModel()</code> 함수는 <code>TaskDAO</code> 타입의 인스턴스를 <code>Task</code> 객체로 변환합니다.
                        </li>
                    </list>
                </step>
                <step>
                    <p>
                        누락된 다음 import 문을 추가합니다:
                    </p>
                    <code-block lang="kotlin" code="import com.example.model.Priority&#10;import com.example.model.Task&#10;import kotlinx.coroutines.Dispatchers&#10;import kotlinx.coroutines.withContext&#10;import org.jetbrains.exposed.v1.jdbc.JdbcTransaction&#10;import org.jetbrains.exposed.v1.jdbc.transactions.inTopLevelSuspendTransaction"/>
                </step>
            </procedure>
        </chapter>
        <chapter title="새 리포지토리 작성" id="create-new-repo">
            <procedure id="create-new-repo-procedure">
                <p>이제 데이터베이스 전용 리포지토리를 생성하는 데 필요한 모든 리소스가 준비되었습니다.</p>
                <step>
                    <Path>src/main/kotlin/model</Path>
                    으로 이동하여 새
                    <Path>PostgresTaskRepository.kt</Path>
                    파일을 생성합니다.
                </step>
                <step>
                    <p>
                        <Path>PostgresTaskRepository.kt</Path>
                        파일을 열고 다음 구현으로 새 타입을 만듭니다:
                    </p>
                    <code-block lang="kotlin" code="package com.example.model&#10;&#10;import com.example.db.TaskDAO&#10;import com.example.db.TaskTable&#10;import com.example.db.daoToModel&#10;import com.example.db.withTransaction&#10;import org.jetbrains.exposed.v1.core.eq&#10;import org.jetbrains.exposed.v1.jdbc.deleteWhere&#10;&#10;class PostgresTaskRepository : TaskRepository {&#10;    override suspend fun allTasks(): List&lt;Task&gt; = withTransaction {&#10;        TaskDAO.all().map(::daoToModel)&#10;    }&#10;&#10;    override suspend fun tasksByPriority(priority: Priority): List&lt;Task&gt; = withTransaction {&#10;        TaskDAO&#10;            .find { (TaskTable.priority eq priority.toString()) }&#10;            .map(::daoToModel)&#10;    }&#10;&#10;    override suspend fun taskByName(name: String): Task? = withTransaction {&#10;        TaskDAO&#10;            .find { (TaskTable.name eq name) }&#10;            .limit(1)&#10;            .map(::daoToModel)&#10;            .firstOrNull()&#10;    }&#10;&#10;    override suspend fun addTask(task: Task): Unit = withTransaction {&#10;        TaskDAO.new {&#10;            name = task.name&#10;            description = task.description&#10;            priority = task.priority.toString()&#10;        }&#10;    }&#10;&#10;    override suspend fun removeTask(name: String): Boolean = withTransaction {&#10;        val rowsDeleted = TaskTable.deleteWhere {&#10;            TaskTable.name eq name&#10;        }&#10;        rowsDeleted == 1&#10;    }&#10;}"/>
                    <p>
                        이 구현에서는 <code>TaskDAO</code> 및 <code>TaskTable</code> 타입의 도우미 메서드를 사용하여 데이터베이스와 상호작용합니다. 이 새로운 리포지토리를 만들었으므로 남은 작업은 라우트 내에서 이를 사용하도록 전환하는 것뿐입니다.
                    </p>
                </step>
            </procedure>
        </chapter>
        <chapter title="새 리포지토리로 전환" id="switch-repo">
            <procedure id="switch-repo-procedure">
                <p>외부 데이터베이스로 전환하려면 리포지토리 타입만 변경하면 됩니다.</p>
                <step>
                    <Path>src/main/kotlin</Path>
                    에서
                    <Path>main.kt</Path>
                    파일을 엽니다.
                </step>
                <step>
                    <p>
                        <code>Application.configureDependencies()</code> 함수에서 <code>FakeTaskRepository</code>를 <code>PostgresTaskRepository</code>로 교체합니다:
                    </p>
                    <code-block lang="kotlin" code="                    //...&#10;                    import com.example.model.PostgresTaskRepository&#10;&#10;                    //...&#10;&#10;                    fun Application.configureDependencies() {&#10;                        dependencies {&#10;                            provide&lt;TaskRepository&gt; {&#10;                                PostgresTaskRepository()&#10;                            }&#10;                        }&#10;                    }"/>
                    <p>
                        인터페이스를 통해 의존성을 주입하고 있으므로, 구현체 변경은 라우트를 관리하는 코드에 완전히 투명하게(영향을 주지 않고) 이루어집니다.
                    </p>
                </step>
                <step>
                    <p>
                        IntelliJ IDEA에서 재실행 버튼(<img src="intellij_idea_rerun_icon.svg"
                                                                       style="inline" height="16" width="16"
                                                                       alt="intelliJ IDEA rerun icon"/>)을 클릭하여 애플리케이션을 다시 시작합니다.
                    </p>
                </step>
                <step>
                    <a href="http://0.0.0.0:8080/static/index.html">http://0.0.0.0:8080/static/index.html</a>로 이동합니다.
                    UI는 변경되지 않았지만 이제 데이터베이스에서 데이터를 가져옵니다.
                </step>
                <step>
                    <p>
                        이를 확인하기 위해 폼을 사용하여 새 작업을 추가하고 PostgreSQL의 tasks 테이블에 저장된 데이터를 쿼리해 봅니다.
                    </p>
                    <tip>
                        <p>
                            IntelliJ IDEA에서는 <a href="https://www.jetbrains.com/help/idea/query-consoles.html#create_console">Query console</a>과 <code>SELECT</code> SQL 문을 사용하여 테이블 데이터를 조회할 수 있습니다:
                        </p>
                        <code-block lang="SQL" code="                            SELECT * FROM task;"/>
                        <p>
                            쿼리를 실행하면 새 작업을 포함한 데이터가 <ui-path>Service</ui-path> 창에 표시되어야 합니다:
                        </p>
                        <img src="tutorial_server_db_integration_task_table.png"
                             alt="IntelliJ IDEA의 Service 창에 표시된 작업 테이블"
                             border-effect="line"
                             width="706"/>
                    </tip>
                </step>
            </procedure>
        </chapter>
        <p>
            이것으로 애플리케이션에 데이터베이스를 성공적으로 연동했습니다.
        </p>
        <p>
            <code>FakeTaskRepository</code> 타입은 프로덕션 코드에서 더 이상 필요하지 않으므로 <Path>src/test</Path>의 테스트 소스 세트로 이동할 수 있습니다.
        </p>
        <p>
            최종 프로젝트 구조는 대략 다음과 같아야 합니다:
        </p>
        <img src="tutorial_server_db_integration_src_folder.png"
             alt="IntelliJ IDEA의 Project View 내에 표시된 src 폴더"
             border-effect="line"
             width="400"/>
    </chapter>
    <chapter title="다음 단계" id="next-steps">
        <p>
            이제 Ktor RESTful 서비스와 통신하는 애플리케이션이 완성되었습니다. 이 서비스는 <a href="https://github.com/JetBrains/Exposed">Exposed</a>로 작성된 리포지토리를 사용하여 <a href="https://www.postgresql.org/docs/">PostgreSQL</a>에 접근합니다. 또한 웹 서버나 데이터베이스가 필요하지 않은 상태에서 핵심 기능을 검증하는 <a href="#add-automated-tests">테스트 스위트</a>도 갖추었습니다.
        </p>
        <p>
            이 구조는 필요에 따라 임의의 기능을 지원하도록 확장할 수 있지만, 내결함성(fault-tolerance), 보안, 확장성(scalability)과 같은 설계의 비기능적 측면을 먼저 고려해 보는 것이 좋습니다. <a href="docker-compose.topic#extract-db-settings">데이터베이스 연결 설정을 <Links href="/ktor/server-configuration-file" summary="구성 파일에서 다양한 서버 매개변수를 구성하는 방법을 알아봅니다.">구성 파일</Links>로 추출</a>하는 것부터 시작할 수 있습니다.
        </p>
    </chapter>
</topic>