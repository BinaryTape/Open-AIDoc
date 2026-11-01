<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       title="Kotlin Multiplatform으로 풀스택 애플리케이션 구축하기" id="full-stack-development-with-kotlin-multiplatform">
<show-structure for="chapter, procedure" depth="2"/>
<web-summary>
    Kotlin과 Ktor를 사용하여 크로스 플랫폼 풀스택 애플리케이션을 개발하는 방법을 배워보세요. 이 튜토리얼에서는
    Kotlin Multiplatform을 활용하여 Android, iOS 및 데스크톱용 앱을 빌드하고, Ktor를 사용해 데이터를 손쉽게
    처리하는 방법을 알아봅니다.
</web-summary>
<link-summary>
    Kotlin과 Ktor를 사용하여 크로스 플랫폼 풀스택 애플리케이션을 개발하는 방법을 배워보세요.
</link-summary>
<card-summary>
    Kotlin과 Ktor를 사용하여 크로스 플랫폼 풀스택 애플리케이션을 개발하는 방법을 배워보세요.
</card-summary>
<tldr>
    <var name="example_name" value="full-stack-task-manager"/>
    <p>
        <b>코드 예제</b>:
        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
            %example_name%
        </a>
    </p>
    <p>
        <b>사용된 플러그인</b>: <Links href="server-routing.md" summary="Routing은 서버 애플리케이션에서 수신 요청을 처리하기 위한 핵심 플러그인입니다.">Routing</Links>,
        <a href="https://kotlinlang.org/api/kotlinx.serialization/">kotlinx.serialization</a>,
        <Links href="server-serialization.md" summary="ContentNegotiation 플러그인은 클라이언트와 서버 간의 미디어 타입 협상과 특정 형식으로 콘텐츠를 직렬화/역직렬화하는 두 가지 주요 목적을 수행합니다.">Content Negotiation</Links>,
        <a href="https://www.jetbrains.com/lp/compose-multiplatform/">Compose Multiplatform</a>,
        <a href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/get-started.html">Kotlin Multiplatform</a>
    </p>
</tldr>
<p>
    이 문서에서는 매끄러운 데이터 처리를 위해 Ktor를 활용하면서 Android, iOS,
    웹(Web), 데스크톱(Desktop) 플랫폼에서 실행되는 Kotlin 풀스택 애플리케이션을 개발하는 방법을 알아봅니다.
</p>
<p>이 튜토리얼을 마치면 다음 작업을 수행할 수 있게 됩니다:</p>
<list>
    <li><a
            href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/get-started.html">
        Kotlin Multiplatform</a>을 사용해 풀스택 애플리케이션을 생성합니다.
    </li>
    <li>IntelliJ IDEA로 생성된 프로젝트의 구조를 이해합니다.</li>
    <li>Ktor 서비스를 호출하는 <a href="https://www.jetbrains.com/lp/compose-multiplatform/">Compose Multiplatform</a> 클라이언트를
        생성합니다.
    </li>
    <li>설계의 여러 계층에 걸쳐 공통 타입을 재사용합니다.</li>
    <li>멀티플랫폼 라이브러리를 올바르게 포함하고 구성합니다.</li>
</list>
<p>
    이전 튜토리얼들에서는 작업 관리자(Task Manager) 예제를 사용하여
    <Links href="server-requests-and-responses.topic" summary="작업 관리자 애플리케이션을 빌드하며 Kotlin과 Ktor에서 라우팅, 요청 처리, 매개변수 사용의 기초를 배워보세요.">요청을 처리하고</Links>,
    <Links href="server-create-restful-apis.topic" summary="JSON 파일을 생성하는 RESTful API 예제를 통해 Kotlin과 Ktor를 사용하여 백엔드 서비스를 구축하는 방법을 배워보세요.">RESTful API를 생성하고</Links>,
    <Links href="server-integrate-database.md" summary="Exposed SQL 라이브러리를 사용하여 Ktor 서비스를 데이터베이스 리포지토리에 연결하는 프로세스를 배워보세요.">Exposed를 사용해 데이터베이스를 통합</Links>했습니다.
    이때는 Ktor의 기본 개념 학습에 집중할 수 있도록 클라이언트 애플리케이션을 최대한 단순하게 유지했습니다.
</p>
<p>
    이제 표시할 데이터를 가져오기 위해 Ktor 서비스를 사용하면서 Android, iOS, 웹, 데스크톱 플랫폼을 대상으로 하는 클라이언트를 빌드하게 됩니다.
    가능한 한 클라이언트와 서버 간에 데이터 타입을 공유하여 개발 속도를 높이고 오류 발생 가능성을 줄일 것입니다.
</p>
<chapter title="사전 요구 사항" id="prerequisites">
    <p>
        이전 문서들과 마찬가지로 IntelliJ IDEA를 IDE로 사용합니다. 환경을 설치하고 구성하려면
        <a href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/quickstart.html">
            Kotlin Multiplatform 빠른 시작(quickstart)
        </a>
        을 참고하세요.
    </p>
    <p>
        Compose Multiplatform을 처음 사용하는 경우, 이 튜토리얼을 시작하기 전에
        <a href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/compose-multiplatform-getting-started.html">
            Compose Multiplatform 시작하기
        </a>
        튜토리얼을 먼저 완료하는 것을 권장합니다. 작업의 복잡도를 낮추기 위해
        단일 클라이언트 플랫폼에만 집중해도 좋습니다. 예를 들어 iOS를 사용해 본 적이 없다면 데스크톱이나 Android 개발에 집중하는 것이 현명할 수 있습니다.
    </p>
</chapter>
<chapter title="새 프로젝트 생성" id="create-project">
    <p>
        Ktor 프로젝트 생성기 대신 IntelliJ IDEA의 Kotlin Multiplatform 프로젝트 마법사를 사용합니다.
        이를 통해 클라이언트와 서비스로 확장할 수 있는 기본 멀티플랫폼 프로젝트가 생성됩니다. 클라이언트는 SwiftUI와 같은 네이티브 UI 라이브러리를 사용할 수도 있지만, 이 튜토리얼에서는
        <a href="https://www.jetbrains.com/lp/compose-multiplatform/">Compose Multiplatform</a>을 사용하여
        모든 플랫폼을 위한 공유 UI를 생성합니다.
    </p>
    <procedure id="generate-project">
        <step>
            IntelliJ IDEA를 실행합니다.
        </step>
        <step>
            IntelliJ IDEA에서
            <ui-path>File | New | Project</ui-path>
            를 선택합니다.
        </step>
        <step>
            왼쪽 패널에서
            <ui-path>Kotlin Multiplatform</ui-path>
            을 선택합니다.
        </step>
        <step>
            <ui-path>New Project</ui-path>
            창에서 다음 필드를 지정합니다:
            <list>
                <li>
                    <ui-path>Name</ui-path>
                    : full-stack-task-manager
                </li>
                <li>
                    <ui-path>Project ID</ui-path>
                    : com.example.ktor
                </li>
            </list>
        </step>
        <step>
            <p>
                대상 플랫폼으로
                <ui-path>Android</ui-path>
                ,
                <ui-path>Desktop</ui-path>
                ,
                <ui-path>Web</ui-path>
                ,
                <ui-path>Server</ui-path>
                를 선택합니다.
            </p>
        </step>
        <step>
            <p>
                Mac을 사용하는 경우
                <ui-path>iOS</ui-path>
                도 함께 선택합니다. 이때
                <ui-path>Share UI</ui-path>
                옵션이 선택되어 있는지 확인하세요.
                <img style="block" src="full_stack_development_tutorial_create_project.png"
                     alt="Kotlin Multiplatform 마법사 설정" width="706" border-effect="rounded"/>
            </p>
        </step>
        <step>
            <p>
                <control>Create</control>
                버튼을 클릭하고 IDE가 프로젝트를 생성하고 가져올 때까지 기다립니다.
            </p>
        </step>
    </procedure>
</chapter>
<chapter title="서비스 실행" id="run-service">
    <procedure id="run-service-procedure">
        <step>
            IntelliJ IDEA에서
            <Path>ApplicationKt</Path>
            실행 구성을 선택합니다.
            <img src="full_stack_development_tutorial_server_run_configuration.png"
                 alt="Run &amp; Debug 창" width="300"
                 border-effect="line" style="block"/>
        </step>
        <step>
            <ui-path>Run</ui-path>
            버튼
            (<img src="intellij_idea_run_icon.svg"
                  style="inline" height="16" width="16"
                  alt="IntelliJ IDEA 실행 아이콘"/>)
            을 클릭하여 구성을 실행합니다.
            <p>
                <ui-path>Run</ui-path>
                도구 창에 새 탭이 열립니다.
            </p>
        </step>
        <step>
            <p>
                <a href="http://0.0.0.0:8080/">http://0.0.0.0:8080/</a>으로 이동하여 애플리케이션을 엽니다.
                브라우저에 Ktor가 보낸 메시지가 표시되어야 합니다.
                <img src="full_stack_development_tutorial_run.png"
                     alt="Ktor 서버 브라우저 응답" width="706"
                     border-effect="rounded" style="block"/>
            </p>
        </step>
    </procedure>
</chapter>
<chapter title="프로젝트 살펴보기" id="examine-project">
    <p>
        <Path>server</Path>
        폴더는 프로젝트 내 3개의 Kotlin 모듈 중 하나입니다. 나머지 둘은
        <Path>core</Path>
        와
        <Path>app</Path>
        입니다.
    </p>
    <p>
        <Path>server</Path>
        모듈의 구조는 <a href="https://start.ktor.io/">Ktor Project
        Generator</a>에서 생성된 구조와 매우 유사합니다.
        플러그인 및 의존성을 선언하는 전용 빌드 파일과 Ktor 서비스를 빌드하고 시작하는 코드가 포함된 소스 세트가 있습니다:
    </p>
    <img src="full_stack_development_tutorial_server_folder.png"
         alt="Kotlin Multiplatform 프로젝트의 server 폴더 내용" width="300"
         border-effect="line"/>
    <p>
        <Path>Application.kt</Path>
         파일의 라우팅 명령을 살펴보면 <code>sayHello()</code> 함수가 호출되는 것을 볼 수 있습니다:
    </p>
    <code-block lang="kotlin" code="            fun Application.module() {&#10;                routing {&#10;                    get(&quot;/&quot;) {&#10;                        call.respondText(sayHello(&quot;Ktor&quot;))&#10;                    }&#10;                }&#10;            }"/>
    <p>
        <code>sayHello()</code> 함수는
        <Path>core</Path>
        모듈에 정의되어 있습니다. 이곳은 서버와 모든 다양한 클라이언트 플랫폼 간에 공유될 공통 코드를 두는 곳입니다.
    </p>
    <p>
       <Path>app/shared/src/commonMain</Path> 모듈 내의 <Path>Greeting.kt</Path> 파일을 열어보면 그곳에서도
        <code>sayHello()</code> 함수가 사용되고 있음을 확인할 수 있습니다:
    </p>
    <code-block lang="kotlin" code="            class Greeting {&#10;                private val platform = getPlatform()&#10;&#10;                fun greet(): String {&#10;                    return sayHello(platform.name)&#10;                }&#10;            }"/>
    <p>
        <Path>app</Path> 모듈에는 다음 서브모듈들이 포함되어 있습니다:
    </p>
    <list>
        <li>
            <Path>androidApp</Path>, <Path>desktopApp</Path>, <Path>iosApp</Path>, <Path>webApp</Path> 서브모듈은
            각각 Android, 데스크톱, iOS, 웹 클라이언트 앱을 위한 플랫폼별 코드를 포함합니다. 현재는
            이 클라이언트 앱들 중 어느 것도 Ktor 서비스에 연결되어 있지 않습니다.
        </li>
        <li>
            <p>
                <Path>shared</Path>
                서브모듈에는 클라이언트를 제공하고자 하는 각 플랫폼에 대한 소스 세트가 포함되어 있습니다. 이는
                <Path>commonMain</Path>
                내에 선언된 타입들이 대상 플랫폼마다 달라지는 기능을 필요로 하기 때문입니다.
            </p>
            <p>
                예를 들어 <code>Greeting</code> 타입에서 현재 플랫폼의 이름은 <a
                    href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-connect-to-apis.html">expect
                및 actual 선언</a>을 통해 플랫폼별 API를 사용하여 검색됩니다.
            </p>
            <p>
                <Path>shared</Path>
                서브모듈의
                <Path>commonMain</Path>
                소스 세트에서는 <code>getPlatform()</code> 함수가 <code>expect</code> 키워드로 선언되어 있습니다:
            </p>
            <tabs>
                <tab title="commonMain/Platform.kt" id="commonMain">
            <code-block lang="kotlin" code="package com.example.ktor&#10;&#10;interface Platform {&#10;    val name: String&#10;}&#10;&#10;expect fun getPlatform(): Platform"/>
                </tab>
            </tabs>
            <p>
                그런 다음 각 대상 플랫폼은 아래와 같이 <code>getPlatform()</code> 함수의 <code>actual</code> 선언을
                제공합니다:
            </p>
            <tabs>
                <tab title="Platform.ios.kt" id="iosMain">
            <code-block lang="kotlin" code="package com.example.ktor&#10;&#10;import platform.UIKit.UIDevice&#10;&#10;class IOSPlatform : Platform {&#10;    override val name: String = UIDevice.currentDevice.systemName() + &quot; &quot; + UIDevice.currentDevice.systemVersion&#10;}&#10;&#10;actual fun getPlatform(): Platform = IOSPlatform()"/>
                </tab>
                <tab title="Platform.android.kt" id="androidMain">
            <code-block lang="kotlin" code="package com.example.ktor&#10;&#10;import android.os.Build&#10;&#10;class AndroidPlatform : Platform {&#10;    override val name: String = &quot;Android ${Build.VERSION.SDK_INT}&quot;&#10;}&#10;&#10;actual fun getPlatform(): Platform = AndroidPlatform()"/>
                </tab>
                <tab title="Platform.jvm.kt" id="jvmMain">
            <code-block lang="kotlin" code="package com.example.ktor&#10;&#10;class JVMPlatform : Platform {&#10;    override val name: String = &quot;Java ${System.getProperty(&quot;java.version&quot;)}&quot;&#10;}&#10;&#10;actual fun getPlatform(): Platform = JVMPlatform()"/>
                </tab>
                <tab title="Platform.wasmJs.kt" id="wasmJsMain">
            <code-block lang="kotlin" code="package com.example.ktor&#10;&#10;class WasmPlatform : Platform {&#10;    override val name: String = &quot;Web with Kotlin/Wasm&quot;&#10;}&#10;&#10;actual fun getPlatform(): Platform = WasmPlatform()"/>
                </tab>
            </tabs>
        </li>
    </list>
</chapter>
<chapter title="클라이언트 애플리케이션 실행" id="run-client-app">
    <p>
        대상 플랫폼의 실행 구성을 실행하여 클라이언트 애플리케이션을 구동할 수 있습니다.
        iOS Simulator에서 애플리케이션을 실행하려면 아래 단계를 따르세요:
    </p>
    <procedure id="run-ios-app-procedure">
        <step>
            IntelliJ IDEA에서
            <Path>iosApp</Path>
            실행 구성과 시뮬레이션 디바이스를 선택합니다.
            <img src="full_stack_development_tutorial_run_configurations.png"
                 alt="Run &amp; Debug 창" width="400"
                 border-effect="line" style="block"/>
        </step>
        <step>
            <ui-path>Run</ui-path>
            버튼
            (<img src="intellij_idea_run_icon.svg"
                  style="inline" height="16" width="16"
                  alt="IntelliJ IDEA 실행 아이콘"/>)
            을 클릭하여 구성을 실행합니다.
        </step>
        <step>
            <p>
                iOS 앱을 실행하면 내부적으로 Xcode로 빌드된 후 iOS Simulator에서 실행됩니다.
                앱에는 클릭 시 이미지를 토글하는 버튼이 표시됩니다.
                <img style="block" src="full_stack_development_tutorial_run_ios.gif"
                     alt="iOS Simulator에서 앱 실행하기" width="300" border-effect="rounded"/>
            </p>
            <p>
                버튼을 처음 누르면 버튼 텍스트에 현재 플랫폼의 세부 정보가 추가됩니다. 이를 구현한 코드는
                <Path>app/shared/src/commonMain/kotlin/com/example/ktor/App.kt</Path>
                에서 찾을 수 있습니다:
            </p>
            <code-block lang="kotlin" code="                @Composable&#10;                @Preview&#10;                fun App() {&#10;                    MaterialTheme {&#10;                        var showContent by remember { mutableStateOf(false) }&#10;                        Column(&#10;                            modifier = Modifier&#10;                                .background(MaterialTheme.colorScheme.primaryContainer)&#10;                                .safeContentPadding()&#10;                                .fillMaxSize(),&#10;                            horizontalAlignment = Alignment.CenterHorizontally,&#10;                        ) {&#10;                            Button(onClick = { showContent = !showContent }) {&#10;                                Text(&quot;Click me!&quot;)&#10;                            }&#10;                            AnimatedVisibility(showContent) {&#10;                                val greeting = remember { Greeting().greet() }&#10;                                Column(&#10;                                    modifier = Modifier.fillMaxWidth(),&#10;                                    horizontalAlignment = Alignment.CenterHorizontally,&#10;                                ) {&#10;                                    Image(painterResource(Res.drawable.compose_multiplatform), null)&#10;                                    Text(&quot;Compose: $greeting&quot;)&#10;                                }&#10;                            }&#10;                        }&#10;                    }&#10;                }"/>
            <p>
                이것은 컴포저블(composable) 함수이며, 이 문서의 뒷부분에서 수정할 예정입니다. 지금은 이 함수가 UI를 표시하고 공통 <code>Platform</code> 인터페이스를 구현한 플랫폼별 클래스를 사용하는
                공유 <code>Greeting</code> 타입을 활용하고 있다는 점만 이해하면 충분합니다.
            </p>
        </step>
    </procedure>
    <p>
        이제 생성된 프로젝트의 구조를 이해했으므로, 작업 관리자 기능을 단계적으로 추가할 수 있습니다.
    </p>
</chapter>
<chapter title="모델 타입 추가" id="add-model-types">
    <p>
        먼저 모델 타입을 추가하고 클라이언트와 서버 모두에서 접근할 수 있도록 설정합니다.
    </p>
    <procedure id="add-model-types-procedure">
        <step>
            <Path>gradle/libs.versions.toml</Path>
            로 이동하여 다음 <code>kotlinx.serialization</code> 의존성을 정의합니다:
            <code-block lang="toml" code="[versions]&#10;kotlinx-serialization-json = &quot;1.11.0&quot;&#10;&#10;[libraries]&#10;kotlinx-serialization-json = { module = &quot;org.jetbrains.kotlinx:kotlinx-serialization-json&quot;, version.ref = &quot;kotlinx-serialization-json&quot; }&#10;&#10;[plugins]&#10;kotlinSerialization = { id = &quot;org.jetbrains.kotlin.plugin.serialization&quot;, version.ref = &quot;kotlin&quot; }"/>
        </step>
        <step>
            <p>
                <Path>core/build.gradle.kts</Path>
                로 이동하여 serialization 플러그인을 추가합니다:
            </p>
            <code-block lang="kotlin" code="plugins {&#10;    //...&#10;    alias(libs.plugins.kotlinSerialization)&#10;}"/>
        </step>
        <step>
            <p>
                동일한 파일에서
                <Path>commonMain</Path>
                소스 세트에 새 의존성을 추가합니다:
            </p>
            <code-block lang="kotlin" code="    sourceSets {&#10;        commonMain.dependencies {&#10;            // put your Multiplatform dependencies here&#10;            implementation(libs.kotlinx.serialization.json)&#10;        }&#10;        //...&#10;    }"/>
        </step>
        <step>
            IntelliJ IDEA에서
            <ui-path>Build | Sync Project with Gradle Files</ui-path>
            를 선택하여 변경 사항을 적용합니다. Gradle import가 완료되면
            <Path>Task.kt</Path>
            파일이 정상적으로 컴파일될 것입니다.
        </step>
        <step>
            <Path>core/src/commonMain/kotlin/com/example/ktor</Path>
            로 이동하여
            <Path>model</Path>
            이라는 새 패키지를 만듭니다.
        </step>
        <step>
            새 패키지 안에
            <Path>Task.kt</Path>
            라는 새 파일을 만듭니다.
        </step>
        <step>
            <p>
                우선순위를 나타내는 enum과 작업을 나타내는 클래스를 추가합니다.
                <code>Task</code>
                클래스에는 <code>kotlinx.serialization</code> 라이브러리의
                <code>Serializable</code>
                타입으로 어노테이션을 추가합니다:
            </p>
            <code-block lang="kotlin" code="package com.example.ktor.model&#10;&#10;import kotlinx.serialization.Serializable&#10;&#10;enum class Priority {&#10;    Low, Medium, High, Vital&#10;}&#10;&#10;@Serializable&#10;data class Task(&#10;    val name: String,&#10;    val description: String,&#10;    val priority: Priority&#10;)"/>
        </step>
    </procedure>
</chapter>
<chapter title="서버 생성" id="create-server">
    <p>
        다음 단계는 작업 관리자를 위한 서버 구현을 작성하는 것입니다.
    </p>
    <procedure id="create-server-procedure">
        <step>
            <Path>server/src/main/kotlin/com/example/ktor</Path>
            폴더로 이동하여
            <Path>model</Path>
            이라는 하위 패키지를 만듭니다.
        </step>
        <step>
            <p>
                이 패키지 안에 새
                <Path>TaskRepository.kt</Path>
                파일을 만들고 리포지토리를 위한 다음 인터페이스를 추가합니다:
            </p>
            <code-block lang="kotlin" code="package com.example.ktor.model&#10;&#10;interface TaskRepository {&#10;    fun allTasks(): List&lt;Task&gt;&#10;    fun tasksByPriority(priority: Priority): List&lt;Task&gt;&#10;    fun taskByName(name: String): Task?&#10;    fun addOrUpdateTask(task: Task)&#10;    fun removeTask(name: String): Boolean&#10;}"/>
        </step>
        <step>
            <p>
                동일한 패키지에 다음 클래스가 포함된 새 파일
                <Path>InMemoryTaskRepository.kt</Path>
                를 생성합니다:
            </p>
            <code-block lang="kotlin" code="package com.example.ktor.model&#10;&#10;class InMemoryTaskRepository : TaskRepository {&#10;    private var tasks = listOf(&#10;        Task(&quot;Cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;        Task(&quot;Gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;        Task(&quot;Shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;        Task(&quot;Painting&quot;, &quot;Paint the fence&quot;, Priority.Low),&#10;        Task(&quot;Cooking&quot;, &quot;Cook the dinner&quot;, Priority.Medium),&#10;        Task(&quot;Relaxing&quot;, &quot;Take a walk&quot;, Priority.High),&#10;        Task(&quot;Exercising&quot;, &quot;Go to the gym&quot;, Priority.Low),&#10;        Task(&quot;Learning&quot;, &quot;Read a book&quot;, Priority.Medium),&#10;        Task(&quot;Snoozing&quot;, &quot;Go for a nap&quot;, Priority.High),&#10;        Task(&quot;Socializing&quot;, &quot;Go to a party&quot;, Priority.High)&#10;    )&#10;&#10;    override fun allTasks(): List&lt;Task&gt; = tasks&#10;&#10;    override fun tasksByPriority(priority: Priority) = tasks.filter {&#10;        it.priority == priority&#10;    }&#10;&#10;    override fun taskByName(name: String) = tasks.find {&#10;        it.name.equals(name, ignoreCase = true)&#10;    }&#10;&#10;    override fun addOrUpdateTask(task: Task) {&#10;        var notFound = true&#10;&#10;        tasks = tasks.map {&#10;            if (it.name == task.name) {&#10;                notFound = false&#10;                task&#10;            } else {&#10;                it&#10;            }&#10;        }&#10;        if (notFound) {&#10;            tasks = tasks.plus(task)&#10;        }&#10;    }&#10;&#10;    override fun removeTask(name: String): Boolean {&#10;        val oldTasks = tasks&#10;        tasks = tasks.filterNot { it.name == name }&#10;        return oldTasks.size &gt; tasks.size&#10;    }&#10;}"/>
        </step>
        <step>
            <p>
                <Path>server/src/main/kotlin/.../Application.kt</Path>
                로 이동하여 기존 코드를 아래 구현으로 바꿉니다:
            </p>
            <code-block lang="kotlin" code="package com.example.ktor&#10;&#10;import com.example.ktor.model.InMemoryTaskRepository&#10;import com.example.ktor.model.Priority&#10;import com.example.ktor.model.Task&#10;import io.ktor.http.*&#10;import io.ktor.serialization.*&#10;import io.ktor.serialization.kotlinx.json.*&#10;import io.ktor.server.application.*&#10;import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;import io.ktor.server.plugins.contentnegotiation.*&#10;import io.ktor.server.plugins.cors.routing.*&#10;import io.ktor.server.request.*&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;&#10;fun main() {&#10;    embeddedServer(Netty, port = 8080, host = &quot;0.0.0.0&quot;, module = Application::module)&#10;        .start(wait = true)&#10;}&#10;&#10;fun Application.module() {&#10;    install(ContentNegotiation) {&#10;        json()&#10;    }&#10;    install(CORS) {&#10;        allowHeader(HttpHeaders.ContentType)&#10;        allowMethod(HttpMethod.Delete)&#10;        // For ease of demonstration we allow any connections.&#10;        // Don't do this in production.&#10;        anyHost()&#10;    }&#10;    val repository = InMemoryTaskRepository()&#10;&#10;    routing {&#10;        route(&quot;/tasks&quot;) {&#10;            get {&#10;                val tasks = repository.allTasks()&#10;                call.respond(tasks)&#10;            }&#10;            get(&quot;/byName/{taskName}&quot;) {&#10;                val name = call.parameters[&quot;taskName&quot;]&#10;                if (name == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@get&#10;                }&#10;                val task = repository.taskByName(name)&#10;                if (task == null) {&#10;                    call.respond(HttpStatusCode.NotFound)&#10;                    return@get&#10;                }&#10;                call.respond(task)&#10;            }&#10;            get(&quot;/byPriority/{priority}&quot;) {&#10;                val priorityAsText = call.parameters[&quot;priority&quot;]&#10;                if (priorityAsText == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@get&#10;                }&#10;                try {&#10;                    val priority = Priority.valueOf(priorityAsText)&#10;                    val tasks = repository.tasksByPriority(priority)&#10;&#10;&#10;                    if (tasks.isEmpty()) {&#10;                        call.respond(HttpStatusCode.NotFound)&#10;                        return@get&#10;                    }&#10;                    call.respond(tasks)&#10;                } catch (ex: IllegalArgumentException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                }&#10;            }&#10;            post {&#10;                try {&#10;                    val task = call.receive&lt;Task&gt;()&#10;                    repository.addOrUpdateTask(task)&#10;                    call.respond(HttpStatusCode.NoContent)&#10;                } catch (ex: IllegalStateException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                } catch (ex: JsonConvertException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                }&#10;            }&#10;            delete(&quot;/{taskName}&quot;) {&#10;                val name = call.parameters[&quot;taskName&quot;]&#10;                if (name == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@delete&#10;                }&#10;                if (repository.removeTask(name)) {&#10;                    call.respond(HttpStatusCode.NoContent)&#10;                } else {&#10;                    call.respond(HttpStatusCode.NotFound)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
            <p>
                이 구현은 단순성을 위해 모든 라우팅 코드를 <code>Application.module()</code> 함수 안에 배치했다는 점을 제외하면 이전 튜토리얼과 매우 유사합니다.
            </p>
            <p>
                이 코드를 입력하고 import를 추가하면 여러 컴파일러 오류가 발생하는데, 이는 웹 클라이언트와의 통신을 위한 <Links href="server-cors.md" summary="필수 의존성: io.ktor:%artifact_name% 코드 예제: %example_name% 네이티브 서버 지원: ✅">CORS</Links> 플러그인을 포함하여 의존성으로 추가해야 하는 여러 Ktor 플러그인을 코드가 사용하고 있기 때문입니다.
            </p>
        </step>
        <step>
            <Path>settings.gradle.kts</Path>를 열고 Ktor 버전 카탈로그를 가져옵니다:
            <code-block lang="kotlin" code="dependencyResolutionManagement {&#10;    versionCatalogs {&#10;        create(&quot;ktorLibs&quot;).from(&quot;io.ktor:ktor-version-catalog:3.6.1&quot;)&#10;    }&#10;}"/>
        </step>
        <step>
            <p>
                서버 모듈 빌드 파일(
                <Path>server/build.gradle.kts</Path>
                )을 열고 다음 의존성을 추가합니다:
            </p>
            <code-block lang="kotlin" code="dependencies {&#10;    //...&#10;    implementation(ktorLibs.serialization.kotlinx.json)&#10;    implementation(ktorLibs.server.contentNegotiation)&#10;    implementation(ktorLibs.server.cors)&#10;}"/>
        </step>
        <step>
            다시 한 번 메인 메뉴에서 <ui-path>Build | Sync Project with Gradle Files</ui-path>를 선택합니다.
            가져오기가 완료되면 <code>ContentNegotiation</code> 타입과 <code>json()</code> 함수에 대한 import가 올바르게 작동하는 것을 확인할 수 있습니다.
        </step>
        <step>
            서버를 다시 실행합니다. 브라우저에서 해당 라우트에 접근할 수 있어야 합니다.
        </step>
        <step>
            <p>
                <a href="http://0.0.0.0:8080/tasks"></a>
                및 <a href="http://0.0.0.0:8080/tasks/byPriority/Medium"></a>
                으로 이동하여 JSON 형식의 작업 데이터가 포함된 서버 응답을 확인합니다.
                <img style="block" src="full_stack_development_tutorial_run_server.gif"
                     width="707" border-effect="rounded" alt="브라우저에서의 서버 응답"/>
            </p>
        </step>
    </procedure>
</chapter>
<chapter title="클라이언트 생성" id="create-client">
    <p>
        클라이언트가 서버에 접근할 수 있도록 하려면 Ktor Client를 포함해야 합니다. 여기에는 세 가지 유형의 의존성이 필요합니다:
    </p>
    <list>
        <li>Ktor Client의 핵심 기능.</li>
        <li>네트워킹을 처리하기 위한 플랫폼별 엔진.</li>
        <li>콘텐츠 협상 및 직렬화 지원.</li>
    </list>
    <procedure id="create-client-procedure">
        <step>
            <Path>app/shared/build.gradle.kts</Path>
            로 이동하여 다음 의존성을 추가합니다:
            <code-block lang="kotlin" code="kotlin {&#10;    //...&#10;    sourceSets {&#10;        androidMain.dependencies {&#10;            //...&#10;            implementation(ktorLibs.client.android)&#10;        }&#10;        commonMain.dependencies {&#10;            //...&#10;            implementation(ktorLibs.client.core)&#10;            implementation(ktorLibs.client.contentNegotiation)&#10;            implementation(ktorLibs.serialization.kotlinx.json)&#10;        }&#10;        jvmMain.dependencies {&#10;            implementation(ktorLibs.client.cio)&#10;        }&#10;        iosMain.dependencies {&#10;            implementation(ktorLibs.client.darwin)&#10;        }&#10;        wasmJsMain.dependencies {&#10;            implementation(ktorLibs.client.js)&#10;        }&#10;    }&#10;}"/>
            <p>
                이 작업이 완료되면 클라이언트가 Ktor Client를 감싸는 얇은 래퍼 역할을 할 <code>TaskApi</code> 타입을 추가할 수 있습니다.
            </p>
        </step>
        <step>
            메인 메뉴에서
            <ui-path>Build | Sync Project with Gradle Files</ui-path>를 선택하여
            빌드 파일의 변경 사항을 반영합니다.
        </step>
        <step>
            <Path>app/shared/src/commonMain/kotlin/com/example/ktor</Path>
            로 이동하여
            <Path>network</Path>
            라는 새 패키지를 만듭니다.
        </step>
        <step>
            <p>
                새 패키지 안에 클라이언트 구성을 위한 새
                <Path>HttpClientManager.kt</Path>
                파일을 만듭니다:
            </p>
            <code-block lang="kotlin" code="package com.example.ktor.network&#10;&#10;import io.ktor.client.HttpClient&#10;import io.ktor.client.plugins.contentnegotiation.ContentNegotiation&#10;import io.ktor.client.plugins.defaultRequest&#10;import io.ktor.serialization.kotlinx.json.json&#10;import kotlinx.serialization.json.Json&#10;&#10;fun createHttpClient() = HttpClient {&#10;    install(ContentNegotiation) {&#10;        json(Json {&#10;            encodeDefaults = true&#10;            isLenient = true&#10;            coerceInputValues = true&#10;            ignoreUnknownKeys = true&#10;        })&#10;    }&#10;    defaultRequest {&#10;        host = &quot;1.2.3.4&quot; // Replace with the IP address of your current machine.&#10;        port = 8080&#10;    }&#10;}"/>
            <p>
                <code>1.2.3.4</code>를 현재 컴퓨터의 IP 주소로 바꿉니다. Android 가상 기기(AVD)나
                iOS Simulator에서 실행되는 코드에서는 <code>0.0.0.0</code> 또는 <code>localhost</code>로의
                호출이 불가능합니다.
            </p>
            <tip>
                <p><b>IP 주소 확인 방법:</b></p>
                <p>
                    모바일 시뮬레이터는 <code>localhost</code>에 접근할 수 없으므로 실제 컴퓨터의 IP 주소가 필요합니다.
                    IP 주소를 확인하려면 다음 명령 중 하나를 실행하세요:
                </p>
                <list>
                    <li><b>macOS:</b> <code>ifconfig | grep "inet " | grep -v 127.0.0.1</code></li>
                    <li><b>Linux:</b> <code>hostname -I | awk '{print $1}'</code></li>
                    <li><b>Windows:</b> <code>ipconfig</code> 실행 후 "IPv4 주소" 확인</li>
                </list>
            </tip>
        </step>
        <step>
            <p>
                동일한
                <Path>app/shared/.../network</Path>
                패키지 안에 다음 구현을 포함하는 새
                <Path>TaskApi.kt</Path>
                파일을 만듭니다:
            </p>
            <code-block lang="kotlin" code="package com.example.ktor.network&#10;&#10;import com.example.ktor.model.Task&#10;import io.ktor.client.HttpClient&#10;import io.ktor.client.call.body&#10;import io.ktor.client.request.delete&#10;import io.ktor.client.request.get&#10;import io.ktor.client.request.post&#10;import io.ktor.client.request.setBody&#10;import io.ktor.http.ContentType&#10;import io.ktor.http.contentType&#10;&#10;class TaskApi(private val httpClient: HttpClient) {&#10;&#10;    suspend fun getAllTasks(): List&lt;Task&gt; {&#10;        return httpClient.get(&quot;tasks&quot;).body()&#10;    }&#10;&#10;    suspend fun removeTask(task: Task) {&#10;        httpClient.delete(&quot;tasks/${task.name}&quot;)&#10;    }&#10;&#10;    suspend fun updateTask(task: Task) {&#10;        httpClient.post(&quot;tasks&quot;) {&#10;            contentType(ContentType.Application.Json)&#10;            setBody(task)&#10;        }&#10;    }&#10;}"/>
        </step>
        <step>
            <p>
                <Path>app/shared/.../App.kt</Path>
                로 이동하여 코드를 아래 구현으로 교체합니다.
                이 코드는 <code>TaskApi</code> 타입을 사용하여 서버에서 작업 목록을 가져온 다음,
                각 작업의 이름을 컬럼에 표시합니다:
            </p>
            <code-block lang="kotlin" code="package com.example.ktor&#10;&#10;import com.example.ktor.network.TaskApi&#10;import com.example.ktor.network.createHttpClient&#10;import com.example.ktor.model.Task&#10;import androidx.compose.foundation.layout.Column&#10;import androidx.compose.foundation.layout.fillMaxSize&#10;import androidx.compose.foundation.layout.safeContentPadding&#10;import androidx.compose.material3.Button&#10;import androidx.compose.material3.MaterialTheme&#10;import androidx.compose.material3.Text&#10;import androidx.compose.runtime.*&#10;import androidx.compose.ui.Alignment&#10;import androidx.compose.ui.Modifier&#10;import kotlinx.coroutines.launch&#10;&#10;@Composable&#10;fun App() {&#10;    MaterialTheme {&#10;        val httpClient = createHttpClient()&#10;        val taskApi = remember { TaskApi(httpClient) }&#10;        val tasks = remember { mutableStateOf(emptyList&lt;Task&gt;()) }&#10;        val scope = rememberCoroutineScope()&#10;&#10;        Column(&#10;            modifier = Modifier&#10;                .safeContentPadding()&#10;                .fillMaxSize(),&#10;            horizontalAlignment = Alignment.CenterHorizontally,&#10;        ) {&#10;            Button(onClick = {&#10;                scope.launch {&#10;                    tasks.value = taskApi.getAllTasks()&#10;                }&#10;            }) {&#10;                Text(&quot;Fetch Tasks&quot;)&#10;            }&#10;            for (task in tasks.value) {&#10;                Text(task.name)&#10;            }&#10;        }&#10;    }&#10;}"/>
        </step>
        <step>
            <p>
                서버가 실행 중인 상태에서 <ui-path>iosApp</ui-path> 실행 구성을 실행하여 iOS 애플리케이션을 테스트합니다.
            </p>
        </step>
        <step>
            <p>
                <control>Fetch Tasks</control>
                버튼을 클릭하여 작업 목록을 표시합니다:
                <img style="block" src="full_stack_development_tutorial_run_iOS.png"
                     alt="iOS에서 실행 중인 앱" width="363" border-effect="rounded"/>
            </p>
            <note>
                이 데모에서는 명확한 설명을 위해 과정을 단순화했습니다. 실제 애플리케이션에서는 암호화되지 않은 데이터를 네트워크를 통해 전송하지 않도록 주의해야 합니다.
            </note>
        </step>
        <step>
            <p>
                Android 플랫폼에서는 애플리케이션에 명시적으로 네트워킹 권한을 부여하고 일반 텍스트(cleartext) 송수신을 허용해야 합니다. 이러한 권한을 활성화하려면
                <Path>app/androidApp/src/main/AndroidManifest.xml</Path>
                을 열고 다음 설정을 추가합니다:
            </p>
            <code-block lang="xml" code="                    &lt;manifest&gt;&#10;                        ...&#10;                        &lt;application&#10;                                android:usesCleartextTraffic=&quot;true&quot;&gt;&#10;                        ...&#10;                        ...&#10;                        &lt;/application&gt;&#10;                        &lt;uses-permission android:name=&quot;android.permission.INTERNET&quot;/&gt;&#10;                    &lt;/manifest&gt;"/>
        </step>
        <step>
            <p>
                <ui-path>app.androidApp</ui-path> 실행 구성을 사용하여 Android 애플리케이션을 실행합니다.
                이제 Android 클라이언트도 정상적으로 실행되는 것을 확인할 수 있습니다:
                <img style="block" src="full_stack_development_tutorial_run_android.png"
                     alt="Android에서 실행 중인 앱" width="350" />
            </p>
        </step>
        <step>
            <p>
                데스크톱 클라이언트의 경우, 창의 크기와 제목을 지정합니다.
                <Path>app/desktopApp/src/.../main.kt</Path>
                파일을 열고 <code>title</code>을 변경하고 <code>state</code> 프로퍼티를 설정하여 코드를 수정합니다:
            </p>
            <code-block lang="kotlin" code="package com.example.ktor&#10;&#10;import androidx.compose.ui.unit.DpSize&#10;import androidx.compose.ui.unit.dp&#10;import androidx.compose.ui.window.Window&#10;import androidx.compose.ui.window.WindowPosition&#10;import androidx.compose.ui.window.WindowState&#10;import androidx.compose.ui.window.application&#10;&#10;fun main() = application {&#10;    val state = WindowState(&#10;        size = DpSize(400.dp, 600.dp),&#10;        position = WindowPosition(200.dp, 100.dp)&#10;    )&#10;    Window(&#10;        title = &quot;Task Manager (Desktop)&quot;,&#10;        state = state,&#10;        onCloseRequest = ::exitApplication,&#10;    ) {&#10;        App()&#10;    }&#10;}"/>
        </step>
        <step>
            <p>
                <ui-path>app [hot] 🔥</ui-path> 실행 구성을 사용하여 데스크톱 애플리케이션을 실행합니다:
                <img style="block" src="full_stack_development_tutorial_run_desktop_resized.png"
                     alt="데스크톱에서 실행 중인 앱" width="400" border-effect="rounded"/>
            </p>
        </step>
        <step>
            <p>
                다음 실행 구성 중 하나를 사용하여 웹 클라이언트를 실행합니다:
            </p>
            <list>
                <li>
                    <ui-path>app [js]</ui-path>: Kotlin/JS 애플리케이션을 실행합니다.
                </li>
                <li>
                    <ui-path>app [wasmJs]</ui-path>: Kotlin/Wasm 애플리케이션을 실행합니다.
                </li>
            </list>
            <img style="block" src="full_stack_development_tutorial_run_web.png"
                 alt="웹에서 실행 중인 앱" width="400" border-effect="rounded"/>
        </step>
    </procedure>
</chapter>
<chapter title="UI 개선" id="improve-ui">
    <p>
        이제 클라이언트가 서버와 통신하고 있지만, 아직 UI가 미흡합니다.
    </p>
    <procedure id="improve-ui-procedure">
        <step>
            <p>
                <Path>app/shared/src/commonMain/.../ktor</Path>
                에 있는
                <Path>App.kt</Path>
                파일을 열고 기존 <code>App</code>을 아래의 <code>App</code> 및 <code>TaskCard</code>
                컴포저블로 교체합니다:
            </p>
            <code-block lang="kotlin" collapsed-title-line-number="31" collapsible="true" code="package com.example.ktor&#10;&#10;import com.example.ktor.network.TaskApi&#10;import com.example.ktor.model.Priority&#10;import com.example.ktor.model.Task&#10;import androidx.compose.foundation.layout.Column&#10;import androidx.compose.foundation.layout.Row&#10;import androidx.compose.foundation.layout.Spacer&#10;import androidx.compose.foundation.layout.fillMaxSize&#10;import androidx.compose.foundation.layout.fillMaxWidth&#10;import androidx.compose.foundation.layout.padding&#10;import androidx.compose.foundation.layout.safeContentPadding&#10;import androidx.compose.foundation.layout.width&#10;import androidx.compose.foundation.lazy.LazyColumn&#10;import androidx.compose.foundation.lazy.items&#10;import androidx.compose.foundation.shape.CornerSize&#10;import androidx.compose.foundation.shape.RoundedCornerShape&#10;import androidx.compose.material3.Card&#10;import androidx.compose.material3.MaterialTheme&#10;import androidx.compose.material3.OutlinedButton&#10;import androidx.compose.material3.Text&#10;import androidx.compose.runtime.*&#10;import androidx.compose.ui.Modifier&#10;import androidx.compose.ui.text.font.FontWeight&#10;import androidx.compose.ui.unit.dp&#10;import androidx.compose.ui.unit.sp&#10;import com.example.ktor.network.createHttpClient&#10;import kotlinx.coroutines.launch&#10;&#10;@Composable&#10;fun App() {&#10;    MaterialTheme {&#10;        val httpClient = createHttpClient()&#10;        val taskApi = remember { TaskApi(httpClient) }&#10;        var tasks by remember { mutableStateOf(emptyList&lt;Task&gt;()) }&#10;        val scope = rememberCoroutineScope()&#10;&#10;        LaunchedEffect(Unit) {&#10;            tasks = taskApi.getAllTasks()&#10;        }&#10;&#10;        LazyColumn(&#10;            modifier = Modifier&#10;                .safeContentPadding()&#10;                .fillMaxSize()&#10;        ) {&#10;            items(tasks) { task -&gt;&#10;                TaskCard(&#10;                    task,&#10;                    onDelete = {&#10;                        scope.launch {&#10;                            taskApi.removeTask(it)&#10;                            tasks = taskApi.getAllTasks()&#10;                        }&#10;                    },&#10;                    onUpdate = {&#10;                    }&#10;                )&#10;            }&#10;        }&#10;    }&#10;}&#10;&#10;@Composable&#10;fun TaskCard(&#10;    task: Task,&#10;    onDelete: (Task) -&gt; Unit,&#10;    onUpdate: (Task) -&gt; Unit&#10;) {&#10;    fun pickWeight(priority: Priority) = when (priority) {&#10;        Priority.Low -&gt; FontWeight.SemiBold&#10;        Priority.Medium -&gt; FontWeight.Bold&#10;        Priority.High, Priority.Vital -&gt; FontWeight.ExtraBold&#10;    }&#10;&#10;    Card(&#10;        modifier = Modifier.fillMaxWidth().padding(4.dp),&#10;        shape = RoundedCornerShape(CornerSize(4.dp))&#10;    ) {&#10;        Column(modifier = Modifier.padding(10.dp)) {&#10;            Text(&#10;                &quot;${task.name}: ${task.description}&quot;,&#10;                fontSize = 20.sp,&#10;                fontWeight = pickWeight(task.priority)&#10;            )&#10;&#10;            Row {&#10;                OutlinedButton(onClick = { onDelete(task) }) {&#10;                    Text(&quot;Delete&quot;)&#10;                }&#10;                Spacer(Modifier.width(8.dp))&#10;                OutlinedButton(onClick = { onUpdate(task) }) {&#10;                    Text(&quot;Update&quot;)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
            <p>
                이 구현을 통해 클라이언트는 이제 기본적인 기능을 갖추게 됩니다.
            </p>
            <p>
                <code>LaunchedEffect</code> 타입을 사용하여 시작 시 모든 작업을 로드하고, <code>LazyColumn</code>
                컴포저블을 통해 사용자가 작업을 스크롤하여 볼 수 있도록 합니다.
            </p>
            <p>
                마지막으로 별도의 <code>TaskCard</code> 컴포저블을 작성했으며, 이는 내부적으로 <code>Card</code>를
                사용하여 각 <code>Task</code>의 세부 정보를 표시합니다. 작업을 삭제하고 업데이트할 수 있는 버튼도 추가되었습니다.
            </p>
        </step>
        <step>
            <p>
                클라이언트 애플리케이션(예: Android 앱)을 다시 실행합니다.
                이제 작업을 스크롤하고, 세부 정보를 확인하고, 삭제할 수 있습니다:
                <img style="block" src="full_stack_development_tutorial_improved_ui.gif"
                     alt="개선된 UI로 Android에서 실행 중인 앱" width="350" border-effect="rounded"/>
            </p>
        </step>
    </procedure>
</chapter>
<chapter title="업데이트 기능 추가" id="add-update-functionality">
    <p>
        클라이언트를 완성하기 위해 작업 세부 정보를 업데이트할 수 있는 기능을 추가합니다.
    </p>
    <procedure id="add-update-func-procedure">
        <step>
            <Path>app/shared/src/commonMain/.../ktor</Path>
            에 있는
            <Path>App.kt</Path>
            파일로 이동합니다.
        </step>
        <step>
            <p>
                아래와 같이 <code>UpdateTaskDialog</code> 컴포저블과 필요한 import 문을 추가합니다:
            </p>
            <code-block lang="kotlin" code="import androidx.compose.material3.TextField&#10;import androidx.compose.material3.TextFieldDefaults&#10;import androidx.compose.ui.graphics.Color&#10;import androidx.compose.ui.window.Dialog&#10;&#10;@Composable&#10;fun UpdateTaskDialog(&#10;    task: Task,&#10;    onConfirm: (Task) -&gt; Unit&#10;) {&#10;    var description by remember { mutableStateOf(task.description) }&#10;    var priorityText by remember { mutableStateOf(task.priority.toString()) }&#10;    val colors = TextFieldDefaults.colors(&#10;        focusedTextColor = Color.Blue,&#10;        focusedContainerColor = Color.White,&#10;    )&#10;&#10;    Dialog(onDismissRequest = {}) {&#10;        Card(&#10;            modifier = Modifier.fillMaxWidth().padding(4.dp),&#10;            shape = RoundedCornerShape(CornerSize(4.dp))&#10;        ) {&#10;            Column(modifier = Modifier.padding(10.dp)) {&#10;                Text(&quot;Update ${task.name}&quot;, fontSize = 20.sp)&#10;                TextField(&#10;                    value = description,&#10;                    onValueChange = { description = it },&#10;                    label = { Text(&quot;Description&quot;) },&#10;                    colors = colors&#10;                )&#10;                TextField(&#10;                    value = priorityText,&#10;                    onValueChange = { priorityText = it },&#10;                    label = { Text(&quot;Priority&quot;) },&#10;                    colors = colors&#10;                )&#10;                OutlinedButton(onClick = {&#10;                    val newTask = Task(&#10;                        task.name,&#10;                        description,&#10;                        try {&#10;                            Priority.valueOf(priorityText)&#10;                        } catch (e: IllegalArgumentException) {&#10;                            Priority.Low&#10;                        }&#10;                    )&#10;                    onConfirm(newTask)&#10;                }) {&#10;                    Text(&quot;Update&quot;)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
            <p>
                이 컴포저블은 대화상자(dialog box)로 <code>Task</code>의 세부 정보를 표시합니다. <code>description</code>과
                <code>priority</code>는 수정할 수 있도록 <code>TextField</code> 컴포저블 내에 배치됩니다. 사용자가 업데이트 버튼을 누르면 <code>onConfirm()</code> 콜백이 트리거됩니다.
            </p>
        </step>
        <step>
            <p>
                동일한 파일에서 <code>App</code> 컴포저블을 업데이트합니다:
            </p>
            <code-block lang="kotlin" code="@Composable&#10;fun App() {&#10;    MaterialTheme {&#10;        val httpClient = createHttpClient()&#10;        val taskApi = remember { TaskApi(httpClient) }&#10;        var tasks by remember { mutableStateOf(emptyList&lt;Task&gt;()) }&#10;        val scope = rememberCoroutineScope()&#10;        var currentTask by remember { mutableStateOf&lt;Task?&gt;(null) }&#10;&#10;        LaunchedEffect(Unit) {&#10;            tasks = taskApi.getAllTasks()&#10;        }&#10;&#10;        if (currentTask != null) {&#10;            UpdateTaskDialog(&#10;                currentTask!!,&#10;                onConfirm = {&#10;                    scope.launch {&#10;                        taskApi.updateTask(it)&#10;                        tasks = taskApi.getAllTasks()&#10;                    }&#10;                    currentTask = null&#10;                }&#10;            )&#10;        }&#10;&#10;        LazyColumn(modifier = Modifier&#10;            .safeContentPadding()&#10;            .fillMaxSize()&#10;        ) {&#10;            items(tasks) { task -&gt;&#10;                TaskCard(&#10;                    task,&#10;                    onDelete = {&#10;                        scope.launch {&#10;                            taskApi.removeTask(it)&#10;                            tasks = taskApi.getAllTasks()&#10;                        }&#10;                    },&#10;                    onUpdate = {&#10;                        currentTask = task&#10;                    }&#10;                )&#10;            }&#10;        }&#10;    }&#10;}"/>
            <p>
                선택된 현재 작업을 나타내는 추가 상태를 저장합니다. 이 값이 null이 아니면 <code>UpdateTaskDialog</code> 컴포저블을 호출하며, 이때 <code>onConfirm()</code> 콜백은
                <code>TaskApi</code>를 사용하여 서버에 POST 요청을 보내도록 설정됩니다.
            </p>
            <p>
                마지막으로 <code>TaskCard</code> 컴포저블을 생성할 때 <code>onUpdate()</code> 콜백을 사용하여 <code>currentTask</code> 상태 변수를 설정합니다.
            </p>
        </step>
        <step>
            클라이언트 애플리케이션을 다시 실행합니다. 이제 버튼을 사용하여 각 작업의 세부 정보를 업데이트할 수 있습니다.
            <img style="block" src="full_stack_development_tutorial_update_task.gif"
                 alt="Android에서 작업 삭제하기" width="350" border-effect="rounded"/>
        </step>
    </procedure>
</chapter>
<chapter title="다음 단계" id="next-steps">
    <p>
        이 문서에서는 Kotlin Multiplatform 애플리케이션의 맥락에서 Ktor를 사용하는 방법을 배웠습니다. 이제 다양한 플랫폼을 대상으로 하는 여러 서비스와 클라이언트가 포함된 프로젝트를 생성할 수 있습니다.
    </p>
    <p>
        살펴본 바와 같이 코드 중복이나 낭비 없이 기능을 구축할 수 있습니다. 프로젝트의 모든 계층에서 필요한 타입은
        <Path>core</Path>
        멀티플랫폼 모듈에 둘 수 있습니다. 서비스에서만 필요한 기능은
        <Path>server</Path>
        모듈에 배치하고, 클라이언트에서만 필요한 기능은
        <Path>app</Path>
        모듈에 배치합니다.
    </p>
    <p>
        이러한 형태의 개발에는 클라이언트와 서버 기술 모두에 대한 지식이 불가피하게 요구됩니다. 하지만 <a href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/get-started.html">Kotlin
        Multiplatform</a> 라이브러리와 <a href="https://www.jetbrains.com/lp/compose-multiplatform/">
        Compose Multiplatform</a>을 활용하면 새로 배워야 할 학습량을 최소화할 수 있습니다. 처음에는 단일 플랫폼에만 집중하더라도 애플리케이션에 대한 수요가 늘어남에 따라 다른 플랫폼을 쉽게 추가할 수 있습니다.
    </p>
</chapter>
</topic>