<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       title="Kotlin Multiplatform로 풀스택 애플리케이션 구축하기" id="full-stack-development-with-kotlin-multiplatform">
<show-structure for="chapter, procedure" depth="2"/>
<web-summary>
    Kotlin과 Ktor를 사용하여 크로스 플랫폼 풀스택 애플리케이션을 개발하는 방법을 배우세요. 이 튜토리얼에서는 Kotlin Multiplatform를 사용하여 안드로이드, iOS, 데스크톱용 애플리케이션을 빌드하고 Ktor를 통해 데이터를 손쉽게 처리하는 방법을 알아봅니다.
</web-summary>
<link-summary>
    Kotlin과 Ktor를 사용하여 크로스 플랫폼 풀스택 애플리케이션을 개발하는 방법을 배우세요.
</link-summary>
<card-summary>
    Kotlin과 Ktor를 사용하여 크로스 플랫폼 풀스택 애플리케이션을 개발하는 방법을 배우세요.
</card-summary>
<tldr>
    <var name="example_name" value="full-stack-task-manager"/>
    <p>
        <b>코드 예제</b>:
        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
            %example_name%
        </a>
    </p>
    <p>
        <b>사용된 플러그인</b>: <Links href="/ktor/server-routing" summary="라우팅은 서버 애플리케이션에서 수신 요청을 처리하기 위한 핵심 플러그인입니다.">Routing</Links>,
        <a href="https://kotlinlang.org/api/kotlinx.serialization/">kotlinx.serialization</a>,
        <Links href="/ktor/server-serialization" summary="ContentNegotiation 플러그인은 클라이언트와 서버 간 미디어 타입 협상 및 특정 형식으로 콘텐츠를 직렬화/역직렬화하는 두 가지 주요 목적을 수행합니다.">Content Negotiation</Links>,
        <a href="https://www.jetbrains.com/lp/compose-multiplatform/">Compose Multiplatform</a>,
        <a href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/get-started.html">Kotlin Multiplatform</a>
    </p>
</tldr>
<p>
    이 문서에서는 안드로이드, iOS, 데스크톱 플랫폼에서 실행되는 Kotlin 풀스택 애플리케이션을 개발하는 방법을 Ktor를 활용하여 원활한 데이터 처리를 수행하는 방법을 배우게 됩니다.
</p>
<p>이 튜토리얼이 끝나면 다음을 수행하는 방법을 알게 될 것입니다:</p>
<list>
    <li><a
            href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/get-started.html">
        Kotlin Multiplatform</a>을(를) 사용하여 풀스택 애플리케이션을 생성합니다.
    </li>
    <li>IntelliJ IDEA로 생성된 프로젝트를 이해합니다.</li>
    <li>Ktor 서비스를 호출하는 <a href="https://www.jetbrains.com/lp/compose-multiplatform/">Compose Multiplatform</a> 클라이언트를 생성합니다.
    </li>
    <li>설계의 다양한 계층에서 공유 타입을 재사용합니다.</li>
    <li>멀티플랫폼 라이브러리를 올바르게 포함하고 구성합니다.</li>
</list>
<p>
    이전 튜토리얼에서는 작업 관리자 예제를 사용하여
    <Links href="/ktor/server-requests-and-responses" summary="작업 관리자 애플리케이션을 빌드하여 Ktor와 Kotlin에서 라우팅, 요청 처리 및 매개변수의 기본 사항을 배웁니다.">요청을 처리하고</Links>,
    <Links href="/ktor/server-create-restful-apis" summary="Kotlin과 Ktor를 사용하여 백엔드 서비스를 구축하는 방법을 배우세요. JSON 파일을 생성하는 RESTful API 예제가 포함되어 있습니다.">RESTful API를 생성하고</Links>,
    <Links href="/ktor/server-integrate-database" summary="Exposed SQL 라이브러리를 사용하여 Ktor 서비스를 데이터베이스 리포지토리와 연결하는 프로세스를 배웁니다.">Exposed와 데이터베이스를 통합</Links>했습니다.
    클라이언트 애플리케이션은 Ktor의 기본 사항을 배우는 데 집중할 수 있도록 가능한 한 최소한으로 유지되었습니다.
</p>
<p>
    이 튜토리얼에서는 Ktor 서비스를 사용하여 표시될 데이터를 가져오고 안드로이드, iOS, 데스크톱 플랫폼을 대상으로 하는 클라이언트를 생성합니다. 가능한 모든 곳에서 클라이언트와 서버 간에 데이터 타입을 공유하여 개발 속도를 높이고 오류 발생 가능성을 줄일 것입니다.
</p>
<chapter title="사전 요구 사항" id="prerequisites">
    <p>
        이전 문서와 마찬가지로 IntelliJ IDEA를 IDE로 사용할 것입니다. 환경을 설치하고 구성하려면 다음
        <a href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/quickstart.html">
            Kotlin Multiplatform 빠른 시작
        </a> 가이드를 참조하세요.
    </p>
    <p>
        Compose Multiplatform를 처음 사용하는 경우, 이 튜토리얼을 시작하기 전에
        <a href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/compose-multiplatform-getting-started.html">
            Compose Multiplatform 시작하기
        </a>
        튜토리얼을 완료하는 것이 좋습니다. 작업의 복잡성을 줄이기 위해 단일 클라이언트 플랫폼에 집중할 수 있습니다. 예를 들어, iOS를 사용해 본 적이 없다면 데스크톱 또는 안드로이드 개발에 집중하는 것이 현명할 수 있습니다.
    </p>
</chapter>
<chapter title="새 프로젝트 생성" id="create-project">
    <p>
        Ktor 프로젝트 제너레이터 대신 IntelliJ IDEA의 Kotlin Multiplatform 프로젝트 마법사를 사용하세요.
        이는 클라이언트 및 서비스로 확장할 수 있는 기본 멀티플랫폼 프로젝트를 생성합니다. 클라이언트는 SwiftUI와 같은 네이티브 UI 라이브러리를 사용할 수도 있지만, 이 튜토리얼에서는
        <a href="https://www.jetbrains.com/lp/compose-multiplatform/">Compose Multiplatform</a>을(를) 사용하여 모든 플랫폼에 대한 공유 UI를 생성할 것입니다.
    </p>
    <procedure id="generate-project">
        <step>
            IntelliJ IDEA를 시작합니다.
        </step>
        <step>
            IntelliJ IDEA에서 <ui-path>File | New | Project</ui-path>를 선택합니다.
        </step>
        <step>
            왼쪽 패널에서 <ui-path>Kotlin Multiplatform</ui-path>를 선택합니다.
        </step>
        <step>
            <ui-path>New Project</ui-path> 창에서 다음 필드를 지정합니다:
            <list>
                <li>
                    <ui-path>Name</ui-path>
                    : full-stack-task-manager
                </li>
                <li>
                    <ui-path>Group</ui-path>
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
                <ui-path>Server</ui-path>를 선택합니다.
            </p>
        </step>
        <step>
            <p>
                Mac을 사용 중이라면
                <ui-path>iOS</ui-path>도 선택하세요.
                <ui-path>Share UI</ui-path> 옵션이 선택되어 있는지 확인합니다.
                <img style="block" src="full_stack_development_tutorial_create_project.png"
                     alt="Kotlin Multiplatform 마법사 설정" width="706" border-effect="rounded"/>
            </p>
        </step>
        <step>
            <p>
                <control>Create</control>
                버튼을 클릭하고 IDE가 프로젝트를 생성하고 임포트할 때까지 기다립니다.
            </p>
        </step>
    </procedure>
</chapter>
<chapter title="서비스 실행" id="run-service">
    <procedure id="run-service-procedure">
        <step>
            <ui-path>Project</ui-path> 보기에서
            <Path>server/src/main/kotlin/com/example/ktor/full_stack_task_manager</Path>
            로 이동하여
            <Path>Application.kt</Path>
            파일을 엽니다.
        </step>
        <step>
            애플리케이션을 시작하려면 <code>main()</code> 함수 옆에 있는
            <ui-path>Run</ui-path>
            버튼
            (<img src="intellij_idea_run_icon.svg"
                  style="inline" height="16" width="16"
                  alt="IntelliJ IDEA 실행 아이콘"/>)을 클릭합니다.
            <p>
                <ui-path>Run</ui-path>
                도구 창에 "Responding at http://0.0.0.0:8080" 메시지로 끝나는 새 탭이 열릴 것입니다.
            </p>
        </step>
        <step>
            <p>
                애플리케이션을 열려면 [http://0.0.0.0:8080/](http://0.0.0.0:8080/)로 이동합니다.
                브라우저에 Ktor의 메시지가 표시될 것입니다.
                <img src="full_stack_development_tutorial_run.png"
                     alt="Ktor 서버 브라우저 응답" width="706"
                     border-effect="rounded" style="block"/>
            </p>
        </step>
    </procedure>
</chapter>
<chapter title="프로젝트 검사" id="examine-project">
    <p>
        <Path>server</Path>
        폴더는 프로젝트 내 세 개의 Kotlin 모듈 중 하나입니다. 나머지 두 개는
        <Path>shared</Path>
        와
        <Path>composeApp</Path>
        입니다.
    </p>
    <p>
        <Path>server</Path>
        모듈의 구조는 <a href="https://start.ktor.io/">Ktor Project
        Generator</a>로 생성된 것과 매우 유사합니다.
        플러그인 및 의존성을 선언하는 전용 빌드 파일과 Ktor 서비스를 빌드하고 시작하는 코드를 포함하는 소스 세트가 있습니다:
    </p>
    <img src="full_stack_development_tutorial_server_folder.png"
         alt="Kotlin Multiplatform 프로젝트의 서버 폴더 내용" width="300"
         border-effect="line"/>
    <p>
        <Path>Application.kt</Path>
        파일의 라우팅 지침을 보면 <code>greet()</code> 함수 호출을 볼 수 있습니다:
    </p>
    <code-block lang="kotlin" code="            fun Application.module() {&#10;                routing {&#10;                    get(&quot;/&quot;) {&#10;                        call.respondText(&quot;Ktor: ${Greeting().greet()}&quot;)&#10;                    }&#10;                }&#10;            }"/>
    <p>
        이는 <code>Greeting</code> 타입의 인스턴스를 생성하고 <code>greet()</code> 메서드를 호출합니다.
        <code>Greeting</code> 클래스는 <Path>shared</Path> 모듈에 정의되어 있습니다:
        <img src="full_stack_development_tutorial_shared_module.png"
             alt="IntelliJ IDEA에서 열린 Greeting.kt 및 Platform.kt" width="706"
             border-effect="line" style="block"/>
    </p>
    <p>
        <Path>shared</Path>
        모듈은 다양한 대상 플랫폼에서 사용될 코드를 포함합니다.
    </p>
    <p>
        <Path>shared</Path>
        모듈 세트의
        <Path>commonMain</Path>
        소스는 모든 플랫폼에서 사용될 타입을 보유합니다.
        보시다시피, <code>Greeting</code> 타입이 정의된 곳입니다.
        이것은 또한 서버와 모든 다른 클라이언트 플랫폼 간에 공유될 공통 코드를 넣을 곳이기도 합니다.
    </p>
    <p>
        <Path>shared</Path>
        모듈은 또한 클라이언트를 제공하고자 하는 각 플랫폼에 대한 소스 세트를 포함합니다. 이는
        <Path>commonMain</Path>
        내에 선언된 타입이 대상 플랫폼에 따라 달라지는 기능이 필요할 수 있기 때문입니다. <code>Greeting</code> 타입의 경우, 플랫폼별 API를 사용하여 현재 플랫폼의 이름을 가져오려고 합니다.
        이는 <a
            href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-connect-to-apis.html">expect 및 actual 선언</a>을 통해 달성됩니다.
    </p>
    <p>
        <Path>shared</Path>
        모듈의
        <Path>commonMain</Path>
        소스 세트에서 <code>expect</code> 키워드로 <code>getPlatform()</code> 함수를 선언합니다:
    </p>
    <tabs>
        <tab title="commonMain/Platform.kt" id="commonMain">
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager&#10;&#10;interface Platform {&#10;    val name: String&#10;}&#10;&#10;expect fun getPlatform(): Platform"/>
        </tab>
    </tabs>
    <p>그러면 각 대상 플랫폼은 아래와 같이 <code>getPlatform()</code> 함수의 <code>actual</code> 선언을 제공해야 합니다:
    </p>
    <tabs>
        <tab title="Platform.ios.kt" id="iosMain">
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager&#10;&#10;import platform.UIKit.UIDevice&#10;&#10;class IOSPlatform: Platform {&#10;    override val name: String = UIDevice.currentDevice.systemName() + &quot; &quot; + UIDevice.currentDevice.systemVersion&#10;}&#10;&#10;actual fun getPlatform(): Platform = IOSPlatform()"/>
        </tab>
        <tab title="Platform.android.kt" id="androidMain">
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager&#10;&#10;import android.os.Build&#10;&#10;class AndroidPlatform : Platform {&#10;    override val name: String = &quot;Android ${Build.VERSION.SDK_INT}&quot;&#10;}&#10;&#10;actual fun getPlatform(): Platform = AndroidPlatform()"/>
        </tab>
        <tab title="Platform.jvm.kt" id="jvmMain">
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager&#10;&#10;class JVMPlatform: Platform {&#10;    override val name: String = &quot;Java ${System.getProperty(&quot;java.version&quot;)}&quot;&#10;}&#10;&#10;actual fun getPlatform(): Platform = JVMPlatform()"/>
        </tab>
        <tab title="Platform.wasmJs.kt" id="wasmJsMain">
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager&#10;&#10;class WasmPlatform : Platform {&#10;    override val name: String = &quot;Web with Kotlin/Wasm&quot;&#10;}&#10;&#10;actual fun getPlatform(): Platform = WasmPlatform()"/>
        </tab>
    </tabs>
    <p>
        프로젝트에는 하나의 추가 모듈인
        <Path>composeApp</Path>
        모듈이 있습니다.
        이는 안드로이드, iOS, 데스크톱 및 웹 클라이언트 앱의 코드를 포함합니다.
        이 앱들은 현재 Ktor 서비스에 연결되어 있지 않지만, 공유된
        <code>Greeting</code> 클래스를 사용합니다.
    </p>
</chapter>
<chapter title="클라이언트 애플리케이션 실행" id="run-client-app">
    <p>
        대상에 대한 실행 구성을 실행하여 클라이언트 애플리케이션을 실행할 수 있습니다. iOS 시뮬레이터에서 애플리케이션을 실행하려면 아래 단계를 따르세요:
    </p>
    <procedure id="run-ios-app-procedure">
        <step>
            IntelliJ IDEA에서
            <Path>iosApp</Path>
            실행 구성과 시뮬레이션된 장치를 선택합니다.
            <img src="full_stack_development_tutorial_run_configurations.png"
                 alt="실행 및 디버그 창" width="400"
                 border-effect="line" style="block"/>
        </step>
        <step>
            <ui-path>Run</ui-path>
            버튼
            (<img src="intellij_idea_run_icon.svg"
                  style="inline" height="16" width="16"
                  alt="IntelliJ IDEA 실행 아이콘"/>)을 클릭하여 구성을 실행합니다.
        </step>
        <step>
            <p>
                iOS 앱을 실행하면 내부적으로 Xcode로 빌드되고 iOS 시뮬레이터에서 시작됩니다.
                이 앱은 클릭 시 이미지를 토글하는 버튼을 표시합니다.
                <img style="block" src="full_stack_development_tutorial_run_ios.gif"
                     alt="iOS 시뮬레이터에서 앱 실행" width="300" border-effect="rounded"/>
            </p>
            <p>
                버튼을 처음 누르면 현재 플랫폼의 세부 정보가 텍스트에 추가됩니다. 이를 달성하는 코드는
                <Path>composeApp/src/commonMain/kotlin/com/example/ktor/full_stack_task_manager/App.kt</Path>에서
                찾을 수 있습니다:
            </p>
            <code-block lang="kotlin" code="            @Composable&#10;            fun App() {&#10;                MaterialTheme {&#10;                    var greetingText by remember { mutableStateOf(&quot;Hello World!&quot;) }&#10;                    var showImage by remember { mutableStateOf(false) }&#10;                    Column(&#10;                        Modifier.fillMaxWidth(),&#10;                        horizontalAlignment = Alignment.CenterHorizontally&#10;                    ) {&#10;                        Button(onClick = {&#10;                            greetingText = &quot;Compose: ${Greeting().greet()}&quot;&#10;                            showImage = !showImage&#10;                        }) {&#10;                            Text(greetingText)&#10;                        }&#10;                        AnimatedVisibility(showImage) {&#10;                            Image(&#10;                                painterResource(Res.drawable.compose_multiplatform),&#10;                                null&#10;                            )&#10;                        }&#10;                    }&#10;                }&#10;            }"/>
            <p>
                이는 이 문서의 뒷부분에서 수정할 컴포저블 함수입니다. 현재 중요한 것은 UI를 표시하고 공유 <code>Greeting</code> 타입을 사용하며, 이는 다시 공통 <code>Platform</code> 인터페이스를 구현하는 플랫폼별 클래스를 사용한다는 점입니다.
            </p>
        </step>
    </procedure>
    <p>
        이제 생성된 프로젝트의 구조를 이해했으니 작업 관리자 기능을 점진적으로 추가할 수 있습니다.
    </p>
</chapter>
<chapter title="모델 타입 추가" id="add-model-types">
    <p>
        먼저 모델 타입을 추가하고 클라이언트와 서버 모두에서 접근 가능한지 확인합니다.
    </p>
    <procedure id="add-model-types-procedure">
        <step>
            <Path>shared/src/commonMain/kotlin/com/example/ktor/full_stack_task_manager</Path>
            로 이동하여
            <Path>model</Path>이라는 새 패키지를 생성합니다.
        </step>
        <step>
            새 패키지 내에
            <Path>Task.kt</Path>라는 새 파일을 생성합니다.
        </step>
        <step>
            <p>
                우선순위를 나타내는 <code>enum</code>과 작업을 나타내는 <code>class</code>를 추가합니다. <code>Task</code>
                클래스는 <code>kotlinx.serialization</code>
                라이브러리의 <code>Serializable</code> 타입으로 어노테이션됩니다:
            </p>
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager.model&#10;&#10;import kotlinx.serialization.Serializable&#10;&#10;enum class Priority {&#10;    Low, Medium, High, Vital&#10;}&#10;&#10;@Serializable&#10;data class Task(&#10;    val name: String,&#10;    val description: String,&#10;    val priority: Priority&#10;)"/>
            <p>
                임포트와 어노테이션 모두 컴파일되지 않는 것을 알 수 있습니다. 이는 프로젝트가 아직
                <code>kotlinx.serialization</code>
                라이브러리에 대한 의존성을 가지고 있지 않기 때문입니다.
            </p>
        </step>
        <step>
            <p>
                <Path>shared/build.gradle.kts</Path>
                로 이동하여 직렬화 플러그인을 추가합니다:
            </p>
            <code-block lang="kotlin" code="plugins {&#10;    //...&#10;    kotlin(&quot;plugin.serialization&quot;) version &quot;2.1.21&quot;&#10;}"/>
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
            <Path>gradle/libs.versions.toml</Path>
            로 이동하여 다음을 정의합니다:
            <code-block lang="toml" code="[versions]&#10;kotlinxSerializationJson = &quot;1.8.1&quot;&#10;&#10;[libraries]&#10;kotlinx-serialization-json = { module = &quot;org.jetbrains.kotlinx:kotlinx-serialization-json&quot;, version.ref = &quot;kotlinxSerializationJson&quot; }"/>
        </step>
        <!-- the plugin version can also be set in the version catalog -->
        <step>
            IntelliJ IDEA에서 <ui-path>Build | Sync Project with Gradle Files</ui-path>를 선택하여 업데이트를 적용합니다. Gradle 임포트가 완료되면
            <Path>Task.kt</Path>
            파일이 성공적으로 컴파일되는 것을 확인할 수 있습니다.
        </step>
    </procedure>
    <!-- The following seems like a lot of nuance to cover for this newbie-oriented tutorial.
     I think at this point it's enough to know that the serialization library requires a Gradle plugin.
     If it's important, it would be nice to make the terminology more precise: earlier we said it won't compile, and now
     we're saying it would, so I'm not sure what's going on in the end.
     -->
    <p>
        직렬화 플러그인을 포함하지 않아도 코드는 컴파일되었을 수 있지만, 네트워크를 통해 <code>Task</code> 객체를 직렬화하는 데 필요한 타입은 생성되지 않았을 것입니다. 이는 서비스를 호출하려고 할 때 런타임 오류로 이어질 수 있습니다.
    </p>
    <p>
        직렬화 플러그인을 다른 모듈(예:
        <Path>server</Path>
        또는
        <Path>composeApp</Path>
        )에 배치해도 빌드 시점에는 오류가 발생하지 않았을 것입니다. 하지만 다시 말하지만, 직렬화에 필요한 추가 타입은 생성되지 않아 런타임 오류로 이어질 것입니다.
    </p>
</chapter>
<chapter title="서버 생성" id="create-server">
    <p>
        다음 단계는 작업 관리자를 위한 서버 구현을 생성하는 것입니다.
    </p>
    <procedure id="create-server-procedure">
        <step>
            <Path>server/src/main/kotlin/com/example/ktor/full_stack_task_manager</Path>
            폴더로 이동하여
            <Path>model</Path>이라는 하위 패키지를 생성합니다.
        </step>
        <step>
            <p>
                이 패키지 내에 새
                <Path>TaskRepository.kt</Path>
                파일을 생성하고 리포지토리에 대한 다음 인터페이스를 추가합니다:
            </p>
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager.model&#10;&#10;interface TaskRepository {&#10;    fun allTasks(): List&lt;Task&gt;&#10;    fun tasksByPriority(priority: Priority): List&lt;Task&gt;&#10;    fun taskByName(name: String): Task?&#10;    fun addOrUpdateTask(task: Task)&#10;    fun removeTask(name: String): Boolean&#10;}"/>
        </step>
        <step>
            <p>
                동일한 패키지에 다음 클래스를 포함하는 새 파일
                <Path>InMemoryTaskRepository.kt</Path>를 생성합니다:
            </p>
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager.model&#10;&#10;class InMemoryTaskRepository : TaskRepository {&#10;    private var tasks = listOf(&#10;        Task(&quot;Cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;        Task(&quot;Gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;        Task(&quot;Shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;        Task(&quot;Painting&quot;, &quot;Paint the fence&quot;, Priority.Low),&#10;        Task(&quot;Cooking&quot;, &quot;Cook the dinner&quot;, Priority.Medium),&#10;        Task(&quot;Relaxing&quot;, &quot;Take a walk&quot;, Priority.High),&#10;        Task(&quot;Exercising&quot;, &quot;Go to the gym&quot;, Priority.Low),&#10;        Task(&quot;Learning&quot;, &quot;Read a book&quot;, Priority.Medium),&#10;        Task(&quot;Snoozing&quot;, &quot;Go for a nap&quot;, Priority.High),&#10;        Task(&quot;Socializing&quot;, &quot;Go to a party&quot;, Priority.High)&#10;    )&#10;&#10;    override fun allTasks(): List&lt;Task&gt; = tasks&#10;&#10;    override fun tasksByPriority(priority: Priority) = tasks.filter {&#10;        it.priority == priority&#10;    }&#10;&#10;    override fun taskByName(name: String) = tasks.find {&#10;        it.name.equals(name, ignoreCase = true)&#10;    }&#10;&#10;    override fun addOrUpdateTask(task: Task) {&#10;        var notFound = true&#10;&#10;        tasks = tasks.map {&#10;            if (it.name == task.name) {&#10;                notFound = false&#10;                task&#10;            } else {&#10;                it&#10;            }&#10;        }&#10;        if (notFound) {&#10;            tasks = tasks.plus(task)&#10;        }&#10;    }&#10;&#10;    override fun removeTask(name: String): Boolean {&#10;        val oldTasks = tasks&#10;        tasks = tasks.filterNot { it.name == name }&#10;        return oldTasks.size &gt; tasks.size&#10;    }&#10;}"/>
        </step>
        <step>
            <p>
                <Path>server/src/main/kotlin/.../Application.kt</Path>
                로 이동하여 기존 코드를 다음 구현으로 대체합니다:
            </p>
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager&#10;&#10;import com.example.ktor.full_stack_task_manager.model.InMemoryTaskRepository&#10;import com.example.ktor.full_stack_task_manager.model.Priority&#10;import com.example.ktor.full_stack_task_manager.model.Task&#10;import io.ktor.http.*&#10;import io.ktor.serialization.*&#10;import io.ktor.serialization.kotlinx.json.*&#10;import io.ktor.server.application.*&#10;import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;import io.ktor.server.plugins.contentnegotiation.*&#10;import io.ktor.server.plugins.cors.routing.*&#10;import io.ktor.server.request.*&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;&#10;fun main() {&#10;    embeddedServer(Netty, port = SERVER_PORT, host = &quot;0.0.0.0&quot;, module = Application::module)&#10;        .start(wait = true)&#10;}&#10;&#10;fun Application.module() {&#10;    install(ContentNegotiation) {&#10;        json()&#10;    }&#10;    install(CORS) {&#10;        allowHeader(HttpHeaders.ContentType)&#10;        allowMethod(HttpMethod.Delete)&#10;        // For ease of demonstration we allow any connections.&#10;        // Don't do this in production.&#10;        anyHost()&#10;    }&#10;    val repository = InMemoryTaskRepository()&#10;&#10;    routing {&#10;        route(&quot;/tasks&quot;) {&#10;            get {&#10;                val tasks = repository.allTasks()&#10;                call.respond(tasks)&#10;            }&#10;            get(&quot;/byName/{taskName}&quot;) {&#10;                val name = call.parameters[&quot;taskName&quot;]&#10;                if (name == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@get&#10;                }&#10;                val task = repository.taskByName(name)&#10;                if (task == null) {&#10;                    call.respond(HttpStatusCode.NotFound)&#10;                    return@get&#10;                }&#10;                call.respond(task)&#10;            }&#10;            get(&quot;/byPriority/{priority}&quot;) {&#10;                val priorityAsText = call.parameters[&quot;priority&quot;]&#10;                if (priorityAsText == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@get&#10;                }&#10;                try {&#10;                    val priority = Priority.valueOf(priorityAsText)&#10;                    val tasks = repository.tasksByPriority(priority)&#10;&#10;&#10;                    if (tasks.isEmpty()) {&#10;                        call.respond(HttpStatusCode.NotFound)&#10;                        return@get&#10;                    }&#10;                    call.respond(tasks)&#10;                } catch (ex: IllegalArgumentException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                }&#10;            }&#10;            post {&#10;                try {&#10;                    val task = call.receive&lt;Task&gt;()&#10;                    repository.addOrUpdateTask(task)&#10;                    call.respond(HttpStatusCode.NoContent)&#10;                } catch (ex: IllegalStateException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                } catch (ex: JsonConvertException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                }&#10;            }&#10;            delete(&quot;/{taskName}&quot;) {&#10;                val name = call.parameters[&quot;taskName&quot;]&#10;                if (name == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@delete&#10;                }&#10;                if (repository.removeTask(name)) {&#10;                    call.respond(HttpStatusCode.NoContent)&#10;                } else {&#10;                    call.respond(HttpStatusCode.NotFound)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
            <p>
                이 구현은 이전 튜토리얼과 매우 유사하지만, 단순화를 위해 모든 라우팅 코드를 <code>Application.module()</code> 함수 내에 배치했다는 점이 다릅니다.
            </p>
            <p>
                이 코드를 입력하고 임포트를 추가하면, 코드가 웹 클라이언트와 상호 작용하기 위한 <Links href="/ktor/server-cors" summary="필수 의존성: io.ktor:%artifact_name% 코드 예제: %example_name% 네이티브 서버 지원: ✅">CORS</Links> 플러그인을 포함하여 의존성으로 포함되어야 하는 여러 Ktor 플러그인을 사용하므로 여러 컴파일 오류가 발생할 것입니다.
            </p>
        </step>
        <step>
            <Path>gradle/libs.versions.toml</Path>
            파일을 열고 다음 라이브러리를 정의합니다:
            <code-block lang="toml" code="[libraries]&#10;ktor-serialization-kotlinx-json-jvm = { module = &quot;io.ktor:ktor-serialization-kotlinx-json-jvm&quot;, version.ref = &quot;ktor&quot; }&#10;ktor-server-content-negotiation-jvm = { module = &quot;io.ktor:ktor-server-content-negotiation-jvm&quot;, version.ref = &quot;ktor&quot; }&#10;ktor-server-cors-jvm = { module = &quot;io.ktor:ktor-server-cors-jvm&quot;, version.ref = &quot;ktor&quot; }"/>
        </step>
        <step>
            <p>
                서버 모듈 빌드 파일(
                <Path>server/build.gradle.kts</Path>
                )을 열고 다음 의존성을 추가합니다:
            </p>
            <code-block lang="kotlin" code="dependencies {&#10;    //...&#10;    implementation(libs.ktor.serialization.kotlinx.json.jvm)&#10;    implementation(libs.ktor.server.content.negotiation.jvm)&#10;    implementation(libs.ktor.server.cors.jvm)&#10;}"/>
        </step>
        <step>
            다시 한번, 메인 메뉴에서 <ui-path>Build | Sync Project with Gradle Files</ui-path>를 선택합니다.
            임포트가 완료되면 <code>ContentNegotiation</code> 타입과 <code>json()</code> 함수의 임포트가 제대로 작동하는 것을 확인할 수 있습니다.
        </step>
        <step>
            서버를 재실행합니다. 브라우저에서 경로에 도달할 수 있음을 확인할 수 있습니다.
        </step>
        <step>
            <p>
                <a href="http://0.0.0.0:8080/tasks"></a>
                와 <a href="http://0.0.0.0:8080/tasks/byPriority/Medium"></a>
                로 이동하여 JSON 형식의 작업이 포함된 서버 응답을 확인합니다.
                <img style="block" src="full_stack_development_tutorial_run_server.gif"
                     width="707" border-effect="rounded" alt="브라우저의 서버 응답"/>
            </p>
        </step>
    </procedure>
</chapter>
<chapter title="클라이언트 생성" id="create-client">
    <p>
        클라이언트가 서버에 접근할 수 있도록 Ktor 클라이언트를 포함해야 합니다. 여기에는 세 가지 유형의 의존성이 관련됩니다:
    </p>
    <list>
        <li>Ktor 클라이언트의 핵심 기능.</li>
        <li>네트워킹을 처리하는 플랫폼별 엔진.</li>
        <li>콘텐츠 협상 및 직렬화 지원.</li>
    </list>
    <procedure id="create-client-procedure">
        <step>
            <Path>gradle/libs.versions.toml</Path>
            파일에 다음 라이브러리를 추가합니다:
            <code-block lang="toml" code="[libraries]&#10;ktor-client-android = { module = &quot;io.ktor:ktor-client-android&quot;, version.ref = &quot;ktor&quot; }&#10;ktor-client-cio = { module = &quot;io.ktor:ktor-client-cio&quot;, version.ref = &quot;ktor&quot; }&#10;ktor-client-content-negotiation = { module = &quot;io.ktor:ktor-client-content-negotiation&quot;, version.ref = &quot;ktor&quot; }&#10;ktor-client-core = { module = &quot;io.ktor:ktor-client-core&quot;, version.ref = &quot;ktor&quot; }&#10;ktor-client-darwin = { module = &quot;io.ktor:ktor-client-darwin&quot;, version.ref = &quot;ktor&quot; }&#10;ktor-client-wasm = { module = &quot;io.ktor:ktor-client-js-wasm-js&quot;, version.ref = &quot;ktor&quot;}&#10;ktor-serialization-kotlinx-json = { module = &quot;io.ktor:ktor-serialization-kotlinx-json&quot;, version.ref = &quot;ktor&quot; }"/>
        </step>
        <step>
            <Path>composeApp/build.gradle.kts</Path>
            로 이동하여 다음 의존성을 추가합니다:
            <code-block lang="kotlin" code="kotlin {&#10;&#10;    //...&#10;    sourceSets {&#10;        val desktopMain by getting&#10;        &#10;        androidMain.dependencies {&#10;            //...&#10;            implementation(libs.ktor.client.android)&#10;        }&#10;        commonMain.dependencies {&#10;            //...&#10;            implementation(libs.ktor.client.core)&#10;            implementation(libs.ktor.client.content.negotiation)&#10;            implementation(libs.ktor.serialization.kotlinx.json)&#10;        }&#10;        desktopMain.dependencies {&#10;            //...&#10;            implementation(libs.ktor.client.cio)&#10;        }&#10;        iosMain.dependencies {&#10;            implementation(libs.ktor.client.darwin)&#10;        }&#10;        wasmJsMain.dependencies {&#10;            implementation(libs.ktor.client.wasm)&#10;        }&#10;    }&#10;}"/>
            <p>
                이 작업이 완료되면 클라이언트가 Ktor 클라이언트를 감싸는 얇은 래퍼 역할을 할 <code>TaskApi</code> 타입을 추가할 수 있습니다.
            </p>
        </step>
        <step>
            빌드 파일의 변경 사항을 임포트하려면 메인 메뉴에서 <ui-path>Build | Sync Project with Gradle Files</ui-path>를 선택합니다.
        </step>
        <step>
            <Path>composeApp/src/commonMain/kotlin/com/example/ktor/full_stack_task_manager</Path>
            로 이동하여
            <Path>network</Path>라는 새 패키지를 생성합니다.
        </step>
        <step>
            <p>
                새 패키지 내에 클라이언트 구성을 위한 새
                <Path>HttpClientManager.kt</Path>
                를 생성합니다:
            </p>
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager.network&#10;&#10;import io.ktor.client.HttpClient&#10;import io.ktor.client.plugins.contentnegotiation.ContentNegotiation&#10;import io.ktor.client.plugins.defaultRequest&#10;import io.ktor.serialization.kotlinx.json.json&#10;import kotlinx.serialization.json.Json&#10;&#10;fun createHttpClient() = HttpClient {&#10;    install(ContentNegotiation) {&#10;        json(Json {&#10;            encodeDefaults = true&#10;            isLenient = true&#10;            coerceInputValues = true&#10;            ignoreUnknownKeys = true&#10;        })&#10;    }&#10;    defaultRequest {&#10;        host = &quot;1.2.3.4&quot;&#10;        port = 8080&#10;    }&#10;}"/>
            <p>
                <code>1.2.3.4</code>를 현재 머신의 IP 주소로 대체해야 합니다. 안드로이드 가상 장치(Android Virtual Device) 또는
                iOS 시뮬레이터에서 실행되는 코드에서는 <code>0.0.0.0</code> 또는 <code>localhost</code>로 호출할 수 없습니다.
                <!-- should we include instructions on finding out the IP address?
                     `ipconfig getifaddr en0`or something -->
            </p>
        </step>
        <step>
            <p>
                동일한
                <Path>composeApp/.../full_stack_task_manager/network</Path>
                패키지에 다음 구현이 포함된 새
                <Path>TaskApi.kt</Path>
                파일을 생성합니다:
            </p>
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager.network&#10;&#10;import com.example.ktor.full_stack_task_manager.model.Task&#10;import io.ktor.client.HttpClient&#10;import io.ktor.client.call.body&#10;import io.ktor.client.request.delete&#10;import io.ktor.client.request.get&#10;import io.ktor.client.request.post&#10;import io.ktor.client.request.setBody&#10;import io.ktor.http.ContentType&#10;import io.ktor.http.contentType&#10;&#10;class TaskApi(private val httpClient: HttpClient) {&#10;&#10;    suspend fun getAllTasks(): List&lt;Task&gt; {&#10;        return httpClient.get(&quot;tasks&quot;).body()&#10;    }&#10;&#10;    suspend fun removeTask(task: Task) {&#10;        httpClient.delete(&quot;tasks/${task.name}&quot;)&#10;    }&#10;&#10;    suspend fun updateTask(task: Task) {&#10;        httpClient.post(&quot;tasks&quot;) {&#10;            contentType(ContentType.Application.Json)&#10;            setBody(task)&#10;        }&#10;    }&#10;}"/>
        </step>
        <step>
            <p>
                <Path>commonMain/.../App.kt</Path>
                로 이동하여 App 컴포저블을 아래 구현으로 대체합니다.
                이는 <code>TaskApi</code> 타입을 사용하여 서버에서 작업 목록을 검색한 다음 각 작업의 이름을 열에 표시합니다:
            </p>
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager&#10;&#10;import com.example.ktor.full_stack_task_manager.network.TaskApi&#10;import com.example.ktor.full_stack_task_manager.network.createHttpClient&#10;import com.example.ktor.full_stack_task_manager.model.Task&#10;import androidx.compose.foundation.layout.Column&#10;import androidx.compose.foundation.layout.fillMaxSize&#10;import androidx.compose.foundation.layout.safeContentPadding&#10;import androidx.compose.material3.Button&#10;import androidx.compose.material3.MaterialTheme&#10;import androidx.compose.material3.Text&#10;import androidx.compose.runtime.*&#10;import androidx.compose.ui.Alignment&#10;import androidx.compose.ui.Modifier&#10;import kotlinx.coroutines.launch&#10;&#10;@Composable&#10;fun App() {&#10;    MaterialTheme {&#10;        val httpClient = createHttpClient()&#10;        val taskApi = remember { TaskApi(httpClient) }&#10;        val tasks = remember { mutableStateOf(emptyList&lt;Task&gt;()) }&#10;        val scope = rememberCoroutineScope()&#10;&#10;        Column(&#10;            modifier = Modifier&#10;                .safeContentPadding()&#10;                .fillMaxSize(),&#10;            horizontalAlignment = Alignment.CenterHorizontally,&#10;        ) {&#10;            Button(onClick = {&#10;                scope.launch {&#10;                    tasks.value = taskApi.getAllTasks()&#10;                }&#10;            }) {&#10;                Text(&quot;Fetch Tasks&quot;)&#10;            }&#10;            for (task in tasks.value) {&#10;                Text(task.name)&#10;            }&#10;        }&#10;    }&#10;}"/>
        </step>
        <step>
            <p>
                서버가 실행 중인 동안, <ui-path>iosApp</ui-path> 실행 구성을 사용하여 iOS 애플리케이션을 테스트합니다.
            </p>
        </step>
        <step>
            <p>
                <control>Fetch Tasks</control>
                버튼을 클릭하여 작업 목록을 표시합니다:
                <img style="block" src="full_stack_development_tutorial_run_iOS.png"
                     alt="iOS에서 실행되는 앱" width="363" border-effect="rounded"/>
            </p>
            <note>
                이 데모에서는 명확성을 위해 프로세스를 단순화하고 있습니다. 실제 애플리케이션에서는 네트워크를 통해 암호화되지 않은 데이터를 전송하는 것을 피하는 것이 중요합니다.
            </note>
        </step>
        <step>
            <p>
                안드로이드 플랫폼에서는 애플리케이션에 네트워킹 권한을 명시적으로 부여하고 평문(cleartext)으로 데이터를 송수신할 수 있도록 허용해야 합니다. 이러한 권한을 활성화하려면
                <Path>composeApp/src/androidMain/AndroidManifest.xml</Path>
                를 열고 다음 설정을 추가합니다:
            </p>
            <code-block lang="xml" code="                    &lt;manifest&gt;&#10;                        ...&#10;                        &lt;application&#10;                                android:usesCleartextTraffic=&quot;true&quot;&gt;&#10;                        ...&#10;                        ...&#10;                        &lt;/application&gt;&#10;                        &lt;uses-permission android:name=&quot;android.permission.INTERNET&quot;/&gt;&#10;                    &lt;/manifest&gt;"/>
        </step>
        <step>
            <p>
                <ui-path>composeApp</ui-path> 실행 구성을 사용하여 안드로이드 애플리케이션을 실행합니다.
                이제 안드로이드 클라이언트도 실행되는 것을 확인할 수 있습니다:
                <img style="block" src="full_stack_development_tutorial_run_android.png"
                     alt="안드로이드에서 실행되는 앱" width="350" border-effect="rounded"/>
            </p>
        </step>
        <step>
            <p>
                데스크톱 클라이언트의 경우, 컨테이너 창에 크기와 제목을 할당해야 합니다.
                <Path>composeApp/src/desktopMain/.../main.kt</Path>
                파일을 열고 <code>title</code>을 변경하고 <code>state</code> 속성을 설정하여 코드를 수정합니다:
            </p>
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager&#10;&#10;import androidx.compose.ui.unit.DpSize&#10;import androidx.compose.ui.unit.dp&#10;import androidx.compose.ui.window.Window&#10;import androidx.compose.ui.window.WindowPosition&#10;import androidx.compose.ui.window.WindowState&#10;import androidx.compose.ui.window.application&#10;&#10;fun main() = application {&#10;    val state = WindowState(&#10;        size = DpSize(400.dp, 600.dp),&#10;        position = WindowPosition(200.dp, 100.dp)&#10;    )&#10;    Window(&#10;        title = &quot;Task Manager (Desktop)&quot;,&#10;        state = state,&#10;        onCloseRequest = ::exitApplication&#10;    ) {&#10;        App()&#10;    }&#10;}"/>
        </step>
        <step>
            <p>
                <ui-path>composeApp [desktop]</ui-path> 실행 구성을 사용하여 데스크톱 애플리케이션을 실행합니다:
                <img style="block" src="full_stack_development_tutorial_run_desktop_resized.png"
                     alt="데스크톱에서 실행되는 앱" width="400" border-effect="rounded"/>
            </p>
        </step>
        <step>
            <p>
                <ui-path>composeApp [wasmJs]</ui-path> 실행 구성을 사용하여 웹 클라이언트를 실행합니다:
            </p>
            <img style="block" src="full_stack_development_tutorial_run_web.png"
                 alt="데스크톱에서 실행되는 앱" width="400" border-effect="rounded"/>
        </step>
    </procedure>
</chapter>
<chapter title="UI 개선" id="improve-ui">
    <p>
        이제 클라이언트가 서버와 통신하지만, 이는 전혀 매력적인 UI가 아닙니다.
    </p>
    <procedure id="improve-ui-procedure">
        <step>
            <p>
                <Path>composeApp/src/commonMain/.../full_stack_task_manager</Path>
                에 있는
                <Path>App.kt</Path>
                파일을 열고 기존 <code>App</code>을 아래의 <code>App</code> 및 <code>TaskCard</code> 컴포저블로 대체합니다:
            </p>
            <code-block lang="kotlin" collapsed-title-line-number="31" collapsible="true" code="package com.example.ktor.full_stack_task_manager&#10;&#10;import com.example.ktor.full_stack_task_manager.network.TaskApi&#10;import com.example.ktor.full_stack_task_manager.model.Priority&#10;import com.example.ktor.full_stack_task_manager.model.Task&#10;import androidx.compose.foundation.layout.Column&#10;import androidx.compose.foundation.layout.Row&#10;import androidx.compose.foundation.layout.Spacer&#10;import androidx.compose.foundation.layout.fillMaxSize&#10;import androidx.compose.foundation.layout.fillMaxWidth&#10;import androidx.compose.foundation.layout.padding&#10;import androidx.compose.foundation.layout.safeContentPadding&#10;import androidx.compose.foundation.layout.width&#10;import androidx.compose.foundation.lazy.LazyColumn&#10;import androidx.compose.foundation.lazy.items&#10;import androidx.compose.foundation.shape.CornerSize&#10;import androidx.compose.foundation.shape.RoundedCornerShape&#10;import androidx.compose.material3.Card&#10;import androidx.compose.material3.MaterialTheme&#10;import androidx.compose.material3.OutlinedButton&#10;import androidx.compose.material3.Text&#10;import androidx.compose.runtime.*&#10;import androidx.compose.ui.Modifier&#10;import androidx.compose.ui.text.font.FontWeight&#10;import androidx.compose.ui.unit.dp&#10;import androidx.compose.ui.unit.sp&#10;import com.example.ktor.full_stack_task_manager.network.createHttpClient&#10;import kotlinx.coroutines.launch&#10;&#10;@Composable&#10;fun App() {&#10;    MaterialTheme {&#10;        val httpClient = createHttpClient()&#10;        val taskApi = remember { TaskApi(httpClient) }&#10;        var tasks by remember { mutableStateOf(emptyList&lt;Task&gt;()) }&#10;        val scope = rememberCoroutineScope()&#10;&#10;        LaunchedEffect(Unit) {&#10;            tasks = taskApi.getAllTasks()&#10;        }&#10;&#10;        LazyColumn(&#10;            modifier = Modifier&#10;                .safeContentPadding()&#10;                .fillMaxSize()&#10;        ) {&#10;            items(tasks) { task -&gt;&#10;                TaskCard(&#10;                    task,&#10;                    onDelete = {&#10;                        scope.launch {&#10;                            taskApi.removeTask(it)&#10;                            tasks = taskApi.getAllTasks()&#10;                        }&#10;                    },&#10;                    onUpdate = {&#10;                    }&#10;                )&#10;            }&#10;        }&#10;    }&#10;}&#10;&#10;@Composable&#10;fun TaskCard(&#10;    task: Task,&#10;    onDelete: (Task) -&gt; Unit,&#10;    onUpdate: (Task) -&gt; Unit&#10;) {&#10;    fun pickWeight(priority: Priority) = when (priority) {&#10;        Priority.Low -&gt; FontWeight.SemiBold&#10;        Priority.Medium -&gt; FontWeight.Bold&#10;        Priority.High, Priority.Vital -&gt; FontWeight.ExtraBold&#10;    }&#10;&#10;    Card(&#10;        modifier = Modifier.fillMaxWidth().padding(4.dp),&#10;        shape = RoundedCornerShape(CornerSize(4.dp))&#10;    ) {&#10;        Column(modifier = Modifier.padding(10.dp)) {&#10;            Text(&#10;                &quot;${task.name}: ${task.description}&quot;,&#10;                fontSize = 20.sp,&#10;                fontWeight = pickWeight(task.priority)&#10;            )&#10;&#10;            Row {&#10;                OutlinedButton(onClick = { onDelete(task) }) {&#10;                    Text(&quot;Delete&quot;)&#10;                }&#10;                Spacer(Modifier.width(8.dp))&#10;                OutlinedButton(onClick = { onUpdate(task) }) {&#10;                    Text(&quot;Update&quot;)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
            <p>
                이 구현으로 클라이언트는 이제 몇 가지 기본 기능을 갖게 됩니다.
            </p>
            <p>
                <code>LaunchedEffect</code> 타입을 사용하면 모든 작업이 시작 시 로드되며, <code>LazyColumn</code>
                컴포저블을 통해 사용자는 작업을 스크롤할 수 있습니다.
            </p>
            <p>
                마지막으로, 별도의 <code>TaskCard</code> 컴포저블이 생성되며, 이는 다시 <code>Card</code>를 사용하여 각 <code>Task</code>의 세부 정보를 표시합니다. 작업을 삭제하고 업데이트하기 위한 버튼이 추가되었습니다.
            </p>
        </step>
        <step>
            <p>
                클라이언트 애플리케이션을 다시 실행합니다. 예를 들어 안드로이드 앱을 실행합니다.
                이제 작업을 스크롤하고, 세부 정보를 보고, 삭제할 수 있습니다:
                <img style="block" src="full_stack_development_tutorial_improved_ui.gif"
                     alt="개선된 UI로 안드로이드에서 실행되는 앱" width="350" border-effect="rounded"/>
            </p>
        </step>
    </procedure>
</chapter>
<chapter title="업데이트 기능 추가" id="add-update-functionality">
    <p>
        클라이언트를 완성하려면 작업 세부 정보를 업데이트할 수 있는 기능을 통합합니다.
    </p>
    <procedure id="add-update-func-procedure">
        <step>
            <Path>composeApp/src/commonMain/.../full_stack_task_manager</Path>
            의
            <Path>App.kt</Path>
            파일로 이동합니다.
        </step>
        <step>
            <p>
                아래와 같이 <code>UpdateTaskDialog</code> 컴포저블과 필요한 임포트를 추가합니다:
            </p>
            <code-block lang="kotlin" code="import androidx.compose.material3.TextField&#10;import androidx.compose.material3.TextFieldDefaults&#10;import androidx.compose.ui.graphics.Color&#10;import androidx.compose.ui.window.Dialog&#10;&#10;@Composable&#10;fun UpdateTaskDialog(&#10;    task: Task,&#10;    onConfirm: (Task) -&gt; Unit&#10;) {&#10;    var description by remember { mutableStateOf(task.description) }&#10;    var priorityText by remember { mutableStateOf(task.priority.toString()) }&#10;    val colors = TextFieldDefaults.colors(&#10;        focusedTextColor = Color.Blue,&#10;        focusedContainerColor = Color.White,&#10;    )&#10;&#10;    Dialog(onDismissRequest = {}) {&#10;        Card(&#10;            modifier = Modifier.fillMaxWidth().padding(4.dp),&#10;            shape = RoundedCornerShape(CornerSize(4.dp))&#10;        ) {&#10;            Column(modifier = Modifier.padding(10.dp)) {&#10;                Text(&quot;Update ${task.name}&quot;, fontSize = 20.sp)&#10;                TextField(&#10;                    value = description,&#10;                    onValueChange = { description = it },&#10;                    label = { Text(&quot;Description&quot;) },&#10;                    colors = colors&#10;                )&#10;                TextField(&#10;                    value = priorityText,&#10;                    onValueChange = { priorityText = it },&#10;                    label = { Text(&quot;Priority&quot;) },&#10;                    colors = colors&#10;                )&#10;                OutlinedButton(onClick = {&#10;                    val newTask = Task(&#10;                        task.name,&#10;                        description,&#10;                        try {&#10;                            Priority.valueOf(priorityText)&#10;                        } catch (e: IllegalArgumentException) {&#10;                            Priority.Low&#10;                        }&#10;                    )&#10;                    onConfirm(newTask)&#10;                }) {&#10;                    Text(&quot;Update&quot;)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
                <p>
                    이는 대화 상자로 <code>Task</code>의 세부 정보를 표시하는 컴포저블입니다. <code>description</code>
                    과 <code>priority</code>는 <code>TextField</code> 컴포저블 내에 배치되어 업데이트될 수 있습니다. 사용자가 업데이트 버튼을 누르면 <code>onConfirm()</code> 콜백이 트리거됩니다.
                </p>
            </step>
            <step>
                <p>
                    동일한 파일에서 <code>App</code> 컴포저블을 업데이트합니다:
                </p>
                <code-block lang="kotlin" code="@Composable&#10;fun App() {&#10;    MaterialTheme {&#10;        val httpClient = createHttpClient()&#10;        val taskApi = remember { TaskApi(httpClient) }&#10;        var tasks by remember { mutableStateOf(emptyList&lt;Task&gt;()) }&#10;        val scope = rememberCoroutineScope()&#10;        var currentTask by remember { mutableStateOf&lt;Task?&gt;(null) }&#10;&#10;        LaunchedEffect(Unit) {&#10;            tasks = taskApi.getAllTasks()&#10;        }&#10;&#10;        if (currentTask != null) {&#10;            UpdateTaskDialog(&#10;                currentTask!!,&#10;                onConfirm = {&#10;                    scope.launch {&#10;                        taskApi.updateTask(it)&#10;                        tasks = taskApi.getAllTasks()&#10;                    }&#10;                    currentTask = null&#10;                }&#10;            )&#10;        }&#10;&#10;        LazyColumn(modifier = Modifier&#10;            .safeContentPadding()&#10;            .fillMaxSize()&#10;        ) {&#10;            items(tasks) { task -&gt;&#10;                TaskCard(&#10;                    task,&#10;                    onDelete = {&#10;                        scope.launch {&#10;                            taskApi.removeTask(it)&#10;                            tasks = taskApi.getAllTasks()&#10;                        }&#10;                    },&#10;                    onUpdate = {&#10;                        currentTask = task&#10;                    }&#10;                )&#10;            }&#10;        }&#10;    }&#10;}"/>
                <p>
                    선택된 현재 작업이라는 추가적인 상태를 저장하고 있습니다. 이 값이 null이 아니면 <code>UpdateTaskDialog</code> 컴포저블을 호출하며, <code>onConfirm()</code> 콜백은 <code>TaskApi</code>를 사용하여 서버에 POST 요청을 보내도록 설정됩니다.
                </p>
                <p>
                    마지막으로, <code>TaskCard</code> 컴포저블을 생성할 때 <code>onUpdate()</code> 콜백을 사용하여 <code>currentTask</code> 상태 변수를 설정합니다.
                </p>
            </step>
            <step>
                클라이언트 애플리케이션을 다시 실행합니다. 이제 버튼을 사용하여 각 작업의 세부 정보를 업데이트할 수 있어야 합니다.
                <img style="block" src="full_stack_development_tutorial_update_task.gif"
                     alt="안드로이드에서 작업 삭제" width="350" border-effect="rounded"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="다음 단계" id="next-steps">
        <p>
            이 문서에서는 Kotlin Multiplatform 애플리케이션의 맥락에서 Ktor를 사용했습니다. 이제 여러 서비스와 클라이언트를 포함하는 프로젝트를 생성하고 다양한 플랫폼을 대상으로 할 수 있습니다.
        </p>
        <p>
            보시다시피, 코드 중복이나 불필요한 부분 없이 기능을 구축하는 것이 가능합니다. 프로젝트의 모든 계층에 필요한 타입은
            <Path>shared</Path>
            멀티플랫폼 모듈 내에 배치될 수 있습니다. 서비스에만 필요한 기능은
            <Path>server</Path>
            모듈에 들어가고, 클라이언트에만 필요한 기능은
            <Path>composeApp</Path>
            에 배치됩니다.
        </p>
        <p>
            이러한 종류의 개발은 필연적으로 클라이언트 및 서버 기술에 대한 지식을 요구합니다. 그러나 <a href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/get-started.html">Kotlin
            Multiplatform</a> 라이브러리와 <a href="https://www.jetbrains.com/lp/compose-multiplatform/">
            Compose Multiplatform</a>을(를) 사용하여 배워야 할 새로운 자료의 양을 최소화할 수 있습니다. 초기에는 단일 플랫폼에만 집중하더라도, 애플리케이션 수요가 증가함에 따라 다른 플랫폼을 쉽게 추가할 수 있습니다.
        </p>
    </chapter>
</topic>