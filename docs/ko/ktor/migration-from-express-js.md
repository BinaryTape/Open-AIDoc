<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   title="Express에서 Ktor로 마이그레이션"
   id="migration-from-express-js" help-id="express-js;migrating-from-express-js">
<show-structure for="chapter" depth="2"/>
<link-summary>이 가이드는 간단한 Ktor 애플리케이션을 생성, 실행 및 테스트하는 방법을 보여줍니다.</link-summary>
<tldr>
    <p>
        <b>코드 예시</b>:
        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express">migrating-express</a>
        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor">migrating-express-ktor</a>
    </p>
</tldr>
<p>
    이 가이드에서는 기본적인 시나리오에서 Express 애플리케이션을 Ktor로 마이그레이션하는 방법을 살펴봅니다. 애플리케이션 생성 및 첫 애플리케이션 작성부터 애플리케이션 기능을 확장하기 위한 미들웨어 생성까지 다룹니다.
</p>
<chapter title="앱 생성하기" id="generate">
    <table style="header-column">
        <tr>
            <td>
                <control>Express</control>
            </td>
            <td>
                <p>
                    <control>express-generator</control> 도구를 사용하여 새 Express 애플리케이션을 생성할 수 있습니다:
                </p>
                <code-block lang="shell" code="                        npx express-generator"/>
            </td>
        </tr>
        <tr>
            <td>
                <control>Ktor</control>
            </td>
            <td>
                <p>
                    Ktor는 애플리케이션 스켈레톤을 생성하는 다음 방법을 제공합니다:
                </p>
                <list>
                    <li>
                        <p>
                            <a href="https://start.ktor.io/">Ktor 프로젝트 생성기</a> — 웹 기반 생성기를 사용합니다.
                        </p>
                    </li>
                    <li>
                        <p>
                            <a href="https://github.com/ktorio/ktor-cli">
                                Ktor CLI 도구
                            </a> — 명령줄 인터페이스에서 <code>ktor new</code> 명령을 사용하여 Ktor 프로젝트를 생성합니다:
                        </p>
                        <code-block lang="shell" code="                                ktor new ktor-sample"/>
                    </li>
                    <li>
                        <p>
                            <a href="https://www.npmjs.com/package/generator-ktor">
                                Yeoman 생성기
                            </a>
                            — 프로젝트 설정을 대화식으로 구성하고 필요한 플러그인을 선택합니다:
                        </p>
                        <code-block lang="shell" code="                                yo ktor"/>
                    </li>
                    <li>
                        <p>
                            <a href="https://ktor.io/idea/">IntelliJ IDEA Ultimate</a> — 내장된 Ktor 프로젝트 마법사를 사용합니다.
                        </p>
                    </li>
                </list>
                <p>
                    자세한 지침은 <Links href="/ktor/server-create-a-new-project" summary="Ktor를 사용하여 서버 애플리케이션을 열고, 실행하고, 테스트하는 방법을 알아봅니다.">새 Ktor 프로젝트 생성, 열기 및 실행</Links> 튜토리얼을 참조하십시오.
                </p>
            </td>
        </tr>
    </table>
</chapter>
<chapter title="Hello world" id="hello">
    <p>
        이 섹션에서는 <code>GET</code> 요청을 수신하고 미리 정의된 일반 텍스트로 응답하는 가장 간단한 서버 애플리케이션을 생성하는 방법을 살펴봅니다.
    </p>
    <table style="header-column">
        <tr>
            <td>
                <control>Express</control>
            </td>
            <td>
                <p>
                    아래 예시는 서버를 시작하고 연결을 위해 포트 <control>3000</control>에서 수신 대기하는 Express 애플리케이션을 보여줍니다.
                </p>
                <code-block lang="javascript" code="const express = require('express')&#10;const app = express()&#10;const port = 3000&#10;&#10;app.get('/', (req, res) =&gt; {&#10;    res.send('Hello World!')&#10;})&#10;&#10;app.listen(port, () =&gt; {&#10;    console.log(`Responding at http://0.0.0.0:${port}/`)&#10;})"/>
                <p>
                    전체 예시는 <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/1_hello/app.js">1_hello</a> 프로젝트를 참조하십시오.
                </p>
            </td>
        </tr>
        <tr>
            <td>
                <control>Ktor</control>
            </td>
            <td>
                <p>
                    Ktor에서는 <a href="#embedded-server">embeddedServer</a> 함수를 사용하여 코드에서 서버 파라미터를 구성하고 애플리케이션을 빠르게 실행할 수 있습니다.
                </p>
                <code-block lang="kotlin" code="import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;import io.ktor.server.application.*&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;&#10;fun main() {&#10;    embeddedServer(Netty, port = 8080, host = &quot;0.0.0.0&quot;) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello World!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}"/>
                <p>
                    전체 예시는 <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/1_hello/src/main/kotlin/com/example/Application.kt">1_hello</a> 프로젝트를 참조하십시오.
                </p>
                <p>
                    또한 HOCON 또는 YAML 형식을 사용하는 <a href="#engine-main">외부 설정 파일</a>에서 서버 설정을 지정할 수도 있습니다.
                </p>
            </td>
        </tr>
    </table>
    <p>
        위 Express 애플리케이션이 다음과 같이 표시될 수 있는 <control>Date</control>, <control>X-Powered-By</control>, <control>ETag</control> 응답 헤더를 추가한다는 점에 유의하십시오:
    </p>
    <code-block code="            Date: Fri, 05 Aug 2022 06:30:48 GMT&#10;            X-Powered-By: Express&#10;            ETag: W/&quot;c-Lve95gjOVATpfV8EL5X4nxwjKHE&quot;"/>
    <p>
        Ktor에서 각 응답에 기본 <control>Server</control> 및 <control>Date</control> 헤더를 추가하려면 <Links href="/ktor/server-default-headers" summary="필수 의존성: io.ktor:%artifact_name% 네이티브 서버 지원: ✅">DefaultHeaders</Links> 플러그인을 설치해야 합니다. <Links href="/ktor/server-conditional-headers" summary="필수 의존성: io.ktor:%artifact_name% 코드 예시: %example_name% 네이티브 서버 지원: ✅">ConditionalHeaders</Links> 플러그인은 <control>Etag</control> 응답 헤더를 구성하는 데 사용할 수 있습니다.
    </p>
</chapter>
<chapter title="정적 콘텐츠 제공" id="static">
    <p>
        이 섹션에서는 Express와 Ktor에서 이미지, CSS 파일, JavaScript 파일과 같은 정적 파일을 제공하는 방법을 살펴봅니다.
        메인 <Path>index.html</Path> 페이지와 연결된 자산(assets) 세트가 있는 <Path>public</Path> 폴더가 있다고 가정해 봅시다.
    </p>
    <code-block code="            public&#10;            ├── index.html&#10;            ├── ktor_logo.png&#10;            ├── css&#10;            │   └──styles.css&#10;            └── js&#10;                └── script.js"/>
    <table style="header-column">
        <tr>
            <td>
                <control>Express</control>
            </td>
            <td>
                <p>
                    Express에서 폴더 이름을 <control>express.static</control> 함수에 전달합니다.
                </p>
                <code-block lang="javascript" code="const express = require('express')&#10;const app = express()&#10;const port = 3000&#10;&#10;app.use(express.static('public'))&#10;&#10;app.listen(port, () =&gt; {&#10;    console.log(`Responding at http://0.0.0.0:${port}/`)&#10;})"/>
                <p>
                    전체 예시는 <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/2_static/app.js">2_static</a> 프로젝트를 참조하십시오.
                </p>
            </td>
        </tr>
        <tr>
            <td>
                <control>Ktor</control>
            </td>
            <td>
                <p>
                    Ktor에서는 <a href="#folders"><code>staticFiles()</code></a> 함수를 사용하여 <Path>/</Path> 경로로 이루어진 모든 요청을 <Path>public</Path> 물리적 폴더에 매핑합니다.
                    이 함수를 사용하면 <Path>public</Path> 폴더의 모든 파일을 재귀적으로 제공할 수 있습니다.
                </p>
                <code-block lang="kotlin" code="import io.ktor.server.application.*&#10;import io.ktor.server.http.content.*&#10;import io.ktor.server.routing.*&#10;import java.io.*&#10;&#10;fun main(args: Array&lt;String&gt;): Unit =&#10;    io.ktor.server.netty.EngineMain.main(args)&#10;&#10;fun Application.module() {&#10;    routing {&#10;        staticFiles(&quot;&quot;, File(&quot;public&quot;), &quot;index.html&quot;)&#10;    }&#10;}"/>
                <p>
                    전체 예시는 <a
                        href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/2_static/src/main/kotlin/com/example/Application.kt">2_static</a> 프로젝트를 참조하십시오.
                </p>
            </td>
        </tr>
    </table>
    <p>
        정적 콘텐츠를 제공할 때 Express는 다음과 같이 보이는 여러 응답 헤더를 추가합니다:
    </p>
    <code-block code="            Accept-Ranges: bytes&#10;            Cache-Control: public, max-age=0&#10;            ETag: W/&quot;181-1823feafeb1&quot;&#10;            Last-Modified: Wed, 27 Jul 2022 13:49:01 GMT"/>
    <p>
        Ktor에서 이러한 헤더를 관리하려면 다음 플러그인을 설치해야 합니다:
    </p>
    <list>
        <li>
            <p>
                <control>Accept-Ranges</control>
                : <Links href="/ktor/server-partial-content" summary="필수 의존성: io.ktor:%artifact_name% 서버 예시: download-file, 클라이언트 예시: client-download-file-range 네이티브 서버 지원: ✅">PartialContent</Links>
            </p>
        </li>
        <li>
            <p>
                <control>Cache-Control</control>
                : <Links href="/ktor/server-caching-headers" summary="필수 의존성: io.ktor:%artifact_name% 코드 예시: %example_name% 네이티브 서버 지원: ✅">CachingHeaders</Links>
            </p>
        </li>
        <li>
            <p>
                <control>ETag</control>
                및
                <control>Last-Modified</control>
                :
                <Links href="/ktor/server-conditional-headers" summary="필수 의존성: io.ktor:%artifact_name% 코드 예시: %example_name% 네이티브 서버 지원: ✅">ConditionalHeaders</Links>
            </p>
        </li>
    </list>
</chapter>
<chapter title="라우팅" id="routing">
    <p>
        <Links href="/ktor/server-routing" summary="라우팅은 서버 애플리케이션에서 들어오는 요청을 처리하기 위한 핵심 플러그인입니다.">라우팅</Links>은 특정 HTTP 요청 메서드(<code>GET</code>, <code>POST</code> 등)와 경로로 정의된 특정 엔드포인트로 들어오는 요청을 처리할 수 있도록 합니다.
        아래 예시는 <Path>/</Path> 경로로 이루어진 <code>GET</code> 및 <code>POST</code> 요청을 처리하는 방법을 보여줍니다.
    </p>
    <table style="header-column">
        <tr>
            <td>
                <control>Express</control>
            </td>
            <td>
                <code-block lang="javascript" code="app.get('/', (req, res) =&gt; {&#10;    res.send('GET request to the homepage')&#10;})&#10;&#10;app.post('/', (req, res) =&gt; {&#10;    res.send('POST request to the homepage')&#10;})"/>
                <p>
                    전체 예시는 <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/3_router/app.js">3_router</a> 프로젝트를 참조하십시오.
                </p>
            </td>
        </tr>
        <tr>
            <td>
                <control>Ktor</control>
            </td>
            <td>
                <code-block lang="kotlin" code="    routing {&#10;        get(&quot;/&quot;) {&#10;            call.respondText(&quot;GET request to the homepage&quot;)&#10;        }&#10;        post(&quot;/&quot;) {&#10;            call.respondText(&quot;POST request to the homepage&quot;)&#10;        }&#10;    }"/>
                <tip>
                    <p>
                        <code>POST</code>, <code>PUT</code> 또는 <code>PATCH</code> 요청에 대한 요청 본문을 수신하는 방법을 알아보려면 <a href="#receive-request">요청 수신</a>을 참조하십시오.
                    </p>
                </tip>
                <p>
                    전체 예시는 <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/3_router/src/main/kotlin/com/example/Application.kt">3_router</a> 프로젝트를 참조하십시오.
                </p>
            </td>
        </tr>
    </table>
    <p>
        다음 예시는 경로 핸들러를 경로별로 그룹화하는 방법을 보여줍니다.
    </p>
    <table style="header-column">
        <tr>
            <td>
                <control>Express</control>
            </td>
            <td>
                <p>
                    Express에서는 <code>app.route()</code>를 사용하여 경로에 대한 체인 가능한 경로 핸들러를 생성할 수 있습니다.
                </p>
                <code-block lang="javascript" code="app.route('/book')&#10;    .get((req, res) =&gt; {&#10;        res.send('Get a random book')&#10;    })&#10;    .post((req, res) =&gt; {&#10;        res.send('Add a book')&#10;    })&#10;    .put((req, res) =&gt; {&#10;        res.send('Update the book')&#10;    })"/>
                <p>
                    전체 예시는 <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/3_router/app.js">3_router</a> 프로젝트를 참조하십시오.
                </p>
            </td>
        </tr>
        <tr>
            <td>
                <control>Ktor</control>
            </td>
            <td>
                <p>
                    Ktor는 <code>route</code> 함수를 제공하여 경로를 정의한 다음 해당 경로에 대한 동사를 중첩 함수로 배치할 수 있습니다.
                </p>
                <code-block lang="kotlin" code="    routing {&#10;        route(&quot;book&quot;) {&#10;            get {&#10;                call.respondText(&quot;Get a random book&quot;)&#10;            }&#10;            post {&#10;                call.respondText(&quot;Add a book&quot;)&#10;            }&#10;            put {&#10;                call.respondText(&quot;Update the book&quot;)&#10;            }&#10;        }&#10;    }"/>
                <p>
                    전체 예시는 <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/3_router/src/main/kotlin/com/example/Application.kt">3_router</a> 프로젝트를 참조하십시오.
                </p>
            </td>
        </tr>
    </table>
    <p>
        두 프레임워크 모두 관련 경로를 단일 파일로 그룹화할 수 있도록 합니다.
    </p>
    <table style="header-column">
        <tr>
            <td>
                <control>Express</control>
            </td>
            <td>
                <p>
                    Express는 마운트 가능한 경로 핸들러를 생성하기 위해 <code>express.Router</code> 클래스를 제공합니다.
                    애플리케이션 디렉토리에 <Path>birds.js</Path> 라우터 파일이 있다고 가정해 봅시다.
                    이 라우터 모듈은 <Path>app.js</Path>에 표시된 대로 애플리케이션에 로드할 수 있습니다:
                </p>
                <tabs>
                    <tab title="birds.js">
                        <code-block lang="javascript" code="const express = require('express')&#10;const router = express.Router()&#10;&#10;router.get('/', (req, res) =&gt; {&#10;    res.send('Birds home page')&#10;})&#10;&#10;router.get('/about', (req, res) =&gt; {&#10;    res.send('About birds')&#10;})&#10;&#10;module.exports = router"/>
                    </tab>
                    <tab title="app.js">
                        <code-block lang="javascript" code="const express = require('express')&#10;const app = express()&#10;const birds = require('./birds')&#10;const port = 3000&#10;&#10;app.use('/birds', birds)&#10;&#10;app.listen(port, () =&gt; {&#10;    console.log(`Responding at http://0.0.0.0:${port}/`)&#10;})"/>
                    </tab>
                </tabs>
                <p>
                    전체 예시는 <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/3_router/app.js">3_router</a> 프로젝트를 참조하십시오.
                </p>
            </td>
        </tr>
        <tr>
            <td>
                <control>Ktor</control>
            </td>
            <td>
                <p>
                    Ktor에서 일반적인 패턴은 <code>Routing</code> 유형에 대한 확장 함수를 사용하여 실제 경로를 정의하는 것입니다.
                    아래 샘플(<Path>Birds.kt</Path>)은 <code>birdsRoutes</code> 확장 함수를 정의합니다.
                    이 함수를 <code>routing</code> 블록 내에서 호출하여 해당 경로를 애플리케이션(<Path>Application.kt</Path>)에 포함할 수 있습니다:
                </p>
                <tabs>
                    <tab title="Birds.kt" id="birds-kt">
                        <code-block lang="kotlin" code="import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;&#10;fun Routing.birdsRoutes() {&#10;    route(&quot;/birds&quot;) {&#10;        get {&#10;            call.respondText(&quot;Birds home page&quot;)&#10;        }&#10;        get(&quot;/about&quot;) {&#10;            call.respondText(&quot;About birds&quot;)&#10;        }&#10;    }&#10;}"/>
                    </tab>
                    <tab title="Application.kt" id="application-kt">
                        <code-block lang="kotlin" code="import com.example.routes.*&#10;import io.ktor.server.application.*&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;&#10;fun main(args: Array&lt;String&gt;): Unit =&#10;    io.ktor.server.netty.EngineMain.main(args)&#10;&#10;fun Application.module() {&#10;    routing {&#10;        birdsRoutes()&#10;    }&#10;}"/>
                    </tab>
                </tabs>
                <p>
                    전체 예시는 <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/3_router/src/main/kotlin/com/example/Application.kt">3_router</a> 프로젝트를 참조하십시오.
                </p>
            </td>
        </tr>
    </table>
    <p>
        Ktor는 URL 경로를 문자열로 지정하는 것 외에도 <Links href="/ktor/server-resources" summary="Resources 플러그인을 사용하면 타입-세이프 라우팅을 구현할 수 있습니다.">타입-세이프 라우트</Links>를 구현하는 기능을 포함합니다.
    </p>
</chapter>
<chapter title="경로 및 쿼리 파라미터" id="route-query-param">
    <p>
        이 섹션에서는 경로 및 쿼리 파라미터에 접근하는 방법을 보여줍니다.
    </p>
    <p>
        경로(또는 패스) 파라미터는 URL에서 해당 위치에 지정된 값을 캡처하는 데 사용되는 명명된 URL 세그먼트입니다.
    </p>
    <table style="header-column">
        <tr>
            <td>
                <control>Express</control>
            </td>
            <td>
                <p>
                    Express에서 경로 파라미터에 접근하려면 <code>Request.params</code>를 사용할 수 있습니다.
                    예를 들어, 아래 코드 스니펫에서 <code>req.parameters["login"]</code>은 <Path>/user/admin</Path> 경로에 대해 <emphasis>admin</emphasis>을 반환합니다:
                </p>
                <code-block lang="javascript" code="app.get('/user/:login', (req, res) =&gt; {&#10;    if (req.params['login'] === 'admin') {&#10;        res.send('You are logged in as Admin')&#10;    } else {&#10;        res.send('You are logged in as Guest')&#10;    }&#10;})"/>
                <p>
                    전체 예시는 <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/4_parameters/app.js">4_parameters</a> 프로젝트를 참조하십시오.
                </p>
            </td>
        </tr>
        <tr>
            <td>
                <control>Ktor</control>
            </td>
            <td>
                <p>
                    Ktor에서 경로 파라미터는 <code>{param}</code> 구문을 사용하여 정의됩니다.
                    경로 핸들러에서 <code>call.parameters</code>를 사용하여 경로 파라미터에 접근할 수 있습니다:
                </p>
                <code-block lang="kotlin" code="    routing {&#10;        get(&quot;/user/{login}&quot;) {&#10;            if (call.parameters[&quot;login&quot;] == &quot;admin&quot;) {&#10;                call.respondText(&quot;You are logged in as Admin&quot;)&#10;            } else {&#10;                call.respondText(&quot;You are logged in as Guest&quot;)&#10;            }&#10;        }&#10;    }"/>
                <p>
                    전체 예시는 <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/4_parameters/src/main/kotlin/com/example/Application.kt">4_parameters</a> 프로젝트를 참조하십시오.
                </p>
            </td>
        </tr>
    </table>
    <p>
        아래 표는 쿼리 문자열의 파라미터에 접근하는 방법을 비교합니다.
    </p>
    <table style="header-column">
        <tr>
            <td>
                <control>Express</control>
            </td>
            <td>
                <p>
                    Express에서 경로 파라미터에 접근하려면 <code>Request.params</code>를 사용할 수 있습니다.
                    예를 들어, 아래 코드 스니펫에서 <code>req.parameters["login"]</code>은 <Path>/user/admin</Path> 경로에 대해 <emphasis>admin</emphasis>을 반환합니다:
                </p>
                <code-block lang="javascript" code="app.get('/products', (req, res) =&gt; {&#10;    if (req.query['price'] === 'asc') {&#10;        res.send('Products from the lowest price to the highest')&#10;    }&#10;})"/>
                <p>
                    전체 예시는 <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/4_parameters/app.js">4_parameters</a> 프로젝트를 참조하십시오.
                </p>
            </td>
        </tr>
        <tr>
            <td>
                <control>Ktor</control>
            </td>
            <td>
                <p>
                    Ktor에서 경로 파라미터는 <code>{param}</code> 구문을 사용하여 정의됩니다.
                    경로 핸들러에서 <code>call.parameters</code>를 사용하여 경로 파라미터에 접근할 수 있습니다:
                </p>
                <code-block lang="kotlin" code="    routing {&#10;        get(&quot;/products&quot;) {&#10;            if (call.request.queryParameters[&quot;price&quot;] == &quot;asc&quot;) {&#10;                call.respondText(&quot;Products from the lowest price to the highest&quot;)&#10;            }&#10;        }&#10;    }"/>
                <p>
                    전체 예시는 <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/4_parameters/src/main/kotlin/com/example/Application.kt">4_parameters</a> 프로젝트를 참조하십시오.
                </p>
            </td>
        </tr>
    </table>
</chapter>
<chapter title="응답 보내기" id="send-response">
    <p>
        이전 섹션에서 일반 텍스트 콘텐츠로 응답하는 방법을 이미 살펴보았습니다.
        이제 JSON, 파일 및 리다이렉션 응답을 보내는 방법을 살펴보겠습니다.
    </p>
    <chapter title="JSON" id="send-json">
        <table style="header-column">
            <tr>
                <td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        Express에서 적절한 콘텐츠 유형으로 JSON 응답을 보내려면 <code>res.json</code> 함수를 호출하십시오:
                    </p>
                    <code-block lang="javascript" code="const car = {type:&quot;Fiat&quot;, model:&quot;500&quot;, color:&quot;white&quot;};&#10;app.get('/json', (req, res) =&gt; {&#10;    res.json(car)&#10;})"/>
                    <p>
                        전체 예시는 <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/5_send_response/app.js">5_send_response</a> 프로젝트를 참조하십시오.
                    </p>
                </td>
            </tr>
            <tr>
                <td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        Ktor에서는 <Links href="/ktor/server-serialization" summary="ContentNegotiation 플러그인은 클라이언트와 서버 간의 미디어 유형 협상 및 특정 형식으로 콘텐츠 직렬화/역직렬화라는 두 가지 주요 목적을 제공합니다.">ContentNegotiation</Links> 플러그인을 설치하고 JSON 직렬 변환기를 구성해야 합니다:
                    </p>
                    <code-block lang="kotlin" code="    install(ContentNegotiation) {&#10;        json()&#10;    }"/>
                    <p>
                        데이터를 JSON으로 직렬화하려면 <code>@Serializable</code> 어노테이션이 있는 데이터 클래스를 생성해야 합니다:
                    </p>
                    <code-block lang="kotlin" code="@Serializable&#10;data class Car(val type: String, val model: String, val color: String)"/>
                    <p>
                        그런 다음 <code>call.respond</code>를 사용하여 이 클래스의 객체를 응답으로 보낼 수 있습니다:
                    </p>
                    <code-block lang="kotlin" code="        get(&quot;/json&quot;) {&#10;            call.respond(Car(&quot;Fiat&quot;, &quot;500&quot;, &quot;white&quot;))&#10;        }"/>
                    <p>
                        전체 예시는 <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/5_send_response/src/main/kotlin/com/example/Application.kt">5_send_response</a> 프로젝트를 참조하십시오.
                    </p>
                </td>
            </tr>
        </table>
    </chapter>
    <chapter title="파일" id="send-file">
        <table style="header-column">
            <tr>
                <td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        Express에서 파일로 응답하려면 <code>res.sendFile</code>을 사용하십시오:
                    </p>
                    <code-block lang="javascript" code="const path = require(&quot;path&quot;)&#10;&#10;app.get('/file', (req, res) =&gt; {&#10;    res.sendFile(path.join(__dirname, 'ktor_logo.png'))&#10;})"/>
                    <p>
                        전체 예시는 <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/5_send_response/app.js">5_send_response</a> 프로젝트를 참조하십시오.
                    </p>
                </td>
            </tr>
            <tr>
                <td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        Ktor는 클라이언트에 파일을 전송하기 위한 <code>call.respondFile</code> 함수를 제공합니다:
                    </p>
                    <code-block lang="kotlin" code="        get(&quot;/file&quot;) {&#10;            val file = File(&quot;public/ktor_logo.png&quot;)&#10;            call.respondFile(file)&#10;        }"/>
                    <p>
                        전체 예시는 <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/5_send_response/src/main/kotlin/com/example/Application.kt">5_send_response</a> 프로젝트를 참조하십시오.
                    </p>
                </td>
            </tr>
        </table>
        <p>
            Express 애플리케이션은 파일로 응답할 때 <control>Accept-Ranges</control> HTTP 응답 헤더를 추가합니다.
            서버는 이 헤더를 사용하여 파일 다운로드에 대한 클라이언트의 부분 요청 지원을 광고합니다.
            Ktor에서는 부분 요청을 지원하기 위해 <Links href="/ktor/server-partial-content" summary="필수 의존성: io.ktor:%artifact_name% 서버 예시: download-file, 클라이언트 예시: client-download-file-range 네이티브 서버 지원: ✅">PartialContent</Links> 플러그인을 설치해야 합니다.
        </p>
    </chapter>
    <chapter title="파일 첨부" id="send-file-attachment">
        <table style="header-column">
            <tr>
                <td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        <code>res.download</code> 함수는 지정된 파일을 첨부 파일로 전송합니다:
                    </p>
                    <code-block lang="javascript" code="app.get('/file-attachment', (req, res) =&gt; {&#10;    res.download(&quot;ktor_logo.png&quot;)&#10;})"/>
                    <p>
                        전체 예시는 <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/5_send_response/app.js">5_send_response</a> 프로젝트를 참조하십시오.
                    </p>
                </td>
            </tr>
            <tr>
                <td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        Ktor에서는 파일을 첨부 파일로 전송하기 위해 <control>Content-Disposition</control> 헤더를 수동으로 구성해야 합니다:
                    </p>
                    <code-block lang="kotlin" code="        get(&quot;/file-attachment&quot;) {&#10;            val file = File(&quot;public/ktor_logo.png&quot;)&#10;            call.response.header(&#10;                HttpHeaders.ContentDisposition,&#10;                ContentDisposition.Attachment.withParameter(ContentDisposition.Parameters.FileName, &quot;ktor_logo.png&quot;)&#10;                    .toString()&#10;            )&#10;            call.respondFile(file)&#10;        }"/>
                    <p>
                        전체 예시는 <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/5_send_response/src/main/kotlin/com/example/Application.kt">5_send_response</a> 프로젝트를 참조하십시오.
                    </p>
                </td>
            </tr>
        </table>
    </chapter>
    <chapter title="리다이렉션" id="redirect">
        <table style="header-column">
            <tr>
                <td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        Express에서 리다이렉션 응답을 생성하려면 <code>redirect</code> 함수를 호출하십시오:
                    </p>
                    <code-block lang="javascript" code="app.get('/old', (req, res) =&gt; {&#10;    res.redirect(301, &quot;moved&quot;)&#10;})&#10;&#10;app.get('/moved', (req, res) =&gt; {&#10;    res.send('Moved resource')&#10;})"/>
                    <p>
                        전체 예시는 <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/5_send_response/app.js">5_send_response</a> 프로젝트를 참조하십시오.
                    </p>
                </td>
            </tr>
            <tr>
                <td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        Ktor에서 리다이렉션 응답을 보내려면 <code>respondRedirect</code>를 사용하십시오:
                    </p>
                    <code-block lang="kotlin" code="        get(&quot;/old&quot;) {&#10;            call.respondRedirect(&quot;/moved&quot;, permanent = true)&#10;        }&#10;        get(&quot;/moved&quot;) {&#10;            call.respondText(&quot;Moved resource&quot;)&#10;        }"/>
                    <p>
                        전체 예시는 <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/5_send_response/src/main/kotlin/com/example/Application.kt">5_send_response</a> 프로젝트를 참조하십시오.
                    </p>
                </td>
            </tr>
        </table>
    </chapter>
</chapter>
<chapter title="템플릿" id="templates">
    <p>
        Express와 Ktor 모두 뷰 작업을 위한 템플릿 엔진을 사용할 수 있습니다.
    </p>
    <table style="header-column">
        <tr>
            <td>
                <control>Express</control>
            </td>
            <td>
                <p>
                    <Path>views</Path> 폴더에 다음 Pug 템플릿이 있다고 가정해 봅시다:
                </p>
                <code-block code="html&#10;  head&#10;    title= title&#10;  body&#10;    h1= message"/>
                <p>
                    이 템플릿으로 응답하려면 <code>res.render</code>를 호출하십시오:
                </p>
                <code-block lang="javascript" code="app.set('views', './views')&#10;app.set('view engine', 'pug')&#10;&#10;app.get('/', (req, res) =&gt; {&#10;    res.render('index', { title: 'Hey', message: 'Hello there!' })&#10;})"/>
                <p>
                    전체 예시는 <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/6_templates/app.js">6_templates</a> 프로젝트를 참조하십시오.
                </p>
            </td>
        </tr>
        <tr>
            <td>
                <control>Ktor</control>
            </td>
            <td>
                <p>
                    Ktor는 FreeMarker, Velocity 등 여러 <Links href="/ktor/server-templating" summary="HTML/CSS 또는 JVM 템플릿 엔진으로 빌드된 뷰를 사용하는 방법을 알아봅니다.">JVM 템플릿 엔진</Links>을 지원합니다.
                    예를 들어, 애플리케이션 리소스에 배치된 FreeMarker 템플릿으로 응답해야 하는 경우, <code>FreeMarker</code> 플러그인을 설치 및 구성한 다음 <code>call.respond</code>를 사용하여 템플릿을 보냅니다:
                </p>
                <code-block lang="kotlin" code="fun Application.module() {&#10;    install(FreeMarker) {&#10;        templateLoader = ClassTemplateLoader(this::class.java.classLoader, &quot;views&quot;)&#10;    }&#10;    routing {&#10;        get(&quot;/&quot;) {&#10;            val article = Article(&quot;Hey&quot;, &quot;Hello there!&quot;)&#10;            call.respond(FreeMarkerContent(&quot;index.ftl&quot;, mapOf(&quot;article&quot; to article)))&#10;        }&#10;    }&#10;}&#10;&#10;data class Article(val title: String, val message: String)"/>
                <p>
                    전체 예시는 <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/6_templates/src/main/kotlin/com/example/Application.kt">6_templates</a> 프로젝트를 참조하십시오.
                </p>
            </td>
        </tr>
    </table>
</chapter>
<chapter title="요청 수신" id="receive-request">
    <p>
        이 섹션에서는 다양한 형식으로 요청 본문을 수신하는 방법을 보여줍니다.
    </p>
    <chapter title="원시 텍스트" id="receive-raw-text">
        <p>
            아래 <code>POST</code> 요청은 텍스트 데이터를 서버로 전송합니다:
        </p>
        <code-block lang="http" code="POST http://0.0.0.0:3000/text&#10;Content-Type: text/plain&#10;&#10;Hello, world!"/>
        <p>
            서버 측에서 이 요청의 본문을 일반 텍스트로 수신하는 방법을 살펴보겠습니다.
        </p>
        <table style="header-column">
            <tr>
                <td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        Express에서 들어오는 요청 본문을 파싱하려면 <code>body-parser</code>를 추가해야 합니다:
                    </p>
                    <code-block lang="javascript" code="const bodyParser = require('body-parser')"/>
                    <p>
                        <code>post</code> 핸들러에서 텍스트 파서(<code>bodyParser.text</code>)를 전달해야 합니다.
                        요청 본문은 <code>req.body</code> 속성에서 사용할 수 있습니다:
                    </p>
                    <code-block lang="javascript" code="app.post('/text', bodyParser.text(), (req, res) =&gt; {&#10;    let text = req.body&#10;    res.send(text)&#10;})"/>
                    <p>
                        전체 예시는 <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/7_receive_request/app.js">7_receive_request</a> 프로젝트를 참조하십시오.
                    </p>
                </td>
            </tr>
            <tr>
                <td>
                    <control>Ktor</control>
                </td>
            <td>
                <p>
                    Ktor에서는 <code>call.receiveText</code>를 사용하여 본문을 텍스트로 수신할 수 있습니다:
                </p>
                <code-block lang="kotlin" code="    routing {&#10;        post(&quot;/text&quot;) {&#10;            val text = call.receiveText()&#10;            call.respondText(text)"/>
                <p>
                    전체 예시는 <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/7_receive_request/src/main/kotlin/com/example/Application.kt">7_receive_request</a> 프로젝트를 참조하십시오.
                </p>
            </td>
        </tr>
    </table>
    </chapter>
    <chapter title="JSON" id="receive-json">
        <p>
            이 섹션에서는 JSON 본문을 수신하는 방법을 살펴보겠습니다.
            아래 샘플은 본문에 JSON 객체가 있는 <code>POST</code> 요청을 보여줍니다:
        </p>
        <code-block lang="http" code="POST http://0.0.0.0:3000/json&#10;Content-Type: application/json&#10;&#10;{&#10;  &quot;type&quot;: &quot;Fiat&quot;,&#10;  &quot;model&quot; : &quot;500&quot;,&#10;  &quot;color&quot;: &quot;white&quot;&#10;}"/>
        <table style="header-column">
            <tr>
                <td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        Express에서 JSON을 수신하려면 <code>bodyParser.json</code>을 사용하십시오:
                    </p>
                    <code-block lang="javascript" code="const bodyParser = require('body-parser')&#10;&#10;app.post('/json', bodyParser.json(), (req, res) =&gt; {&#10;    let car = req.body&#10;    res.send(car)&#10;})"/>
                    <p>
                        전체 예시는 <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/7_receive_request/app.js">7_receive_request</a> 프로젝트를 참조하십시오.
                    </p>
                </td>
            </tr>
            <tr>
                <td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        Ktor에서는 <Links href="/ktor/server-serialization" summary="ContentNegotiation 플러그인은 클라이언트와 서버 간의 미디어 유형 협상 및 특정 형식으로 콘텐츠 직렬화/역직렬화라는 두 가지 주요 목적을 제공합니다.">ContentNegotiation</Links> 플러그인을 설치하고 <code>Json</code> 직렬 변환기를 구성해야 합니다:
                    </p>
                    <code-block lang="kotlin" code="fun Application.module() {&#10;    install(ContentNegotiation) {&#10;        json(Json {&#10;            prettyPrint = true&#10;            isLenient = true&#10;        })"/>
                    <p>
                        수신된 데이터를 객체로 역직렬화하려면 데이터 클래스를 생성해야 합니다:
                    </p>
                    <code-block lang="kotlin" code="@Serializable"/>
                    <p>
                        그런 다음 이 데이터 클래스를 파라미터로 받는 <code>receive</code> 메서드를 사용하십시오:
                    </p>
                    <code-block lang="kotlin" code="        }&#10;        post(&quot;/json&quot;) {&#10;            val car = call.receive&lt;Car&gt;()&#10;            call.respond(car)"/>
                    <p>
                        전체 예시는 <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/7_receive_request/src/main/kotlin/com/example/Application.kt">7_receive_request</a> 프로젝트를 참조하십시오.
                    </p>
                </td>
            </tr>
        </table>
    </chapter>
    <chapter title="URL 인코딩" id="receive-url-encoded">
        <p>
            이제 <control>application/x-www-form-urlencoded</control> 유형을 사용하여 전송된 폼 데이터를 수신하는 방법을 살펴보겠습니다.
            아래 코드 스니펫은 폼 데이터가 있는 샘플 <code>POST</code> 요청을 보여줍니다:
        </p>
        <code-block lang="http" code="POST http://localhost:3000/urlencoded&#10;Content-Type: application/x-www-form-urlencoded&#10;&#10;username=JetBrains&amp;email=example@jetbrains.com&amp;password=foobar&amp;confirmation=foobar"/>
        <table style="header-column">
            <tr>
                <td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        일반 텍스트 및 JSON과 마찬가지로 Express는 <code>body-parser</code>를 필요로 합니다.
                        파서 유형을 <code>bodyParser.urlencoded</code>로 설정해야 합니다:
                    </p>
                    <code-block lang="javascript" code="const bodyParser = require('body-parser')&#10;&#10;app.post('/urlencoded', bodyParser.urlencoded({extended: true}), (req, res) =&gt; {&#10;    let user = req.body&#10;    res.send(`The ${user[&quot;username&quot;]} account is created`)&#10;})"/>
                    <p>
                        전체 예시는 <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/7_receive_request/app.js">7_receive_request</a> 프로젝트를 참조하십시오.
                    </p>
                </td>
            </tr>
            <tr>
                <td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        Ktor에서는 <code>call.receiveParameters</code> 함수를 사용하십시오:
                    </p>
                    <code-block lang="kotlin" code="        }&#10;        post(&quot;/urlencoded&quot;) {&#10;            val formParameters = call.receiveParameters()&#10;            val username = formParameters[&quot;username&quot;].toString()&#10;            call.respondText(&quot;The '$username' account is created&quot;)"/>
                    <p>
                        전체 예시는 <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/7_receive_request/src/main/kotlin/com/example/Application.kt">7_receive_request</a> 프로젝트를 참조하십시오.
                    </p>
                </td>
            </tr>
        </table>
    </chapter>
    <chapter title="원시 데이터" id="receive-raw-data">
        <p>
            다음 사용 사례는 바이너리 데이터 처리입니다.
            아래 요청은 <control>application/octet-stream</control>을 사용하여 PNG 이미지를 서버로 전송합니다:
        </p>
        <code-block lang="http" code="POST http://localhost:3000/raw&#10;Content-Type: application/octet-stream&#10;&#10;&lt; ./ktor_logo.png"/>
        <table style="header-column">
            <tr>
                <td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        Express에서 바이너리 데이터를 처리하려면 파서 유형을 <code>raw</code>로 설정하십시오:
                    </p>
                    <code-block lang="javascript" code="const bodyParser = require('body-parser')&#10;const fs = require('fs')&#10;&#10;app.post('/raw', bodyParser.raw({type: () =&gt; true}), (req, res) =&gt; {&#10;    let rawBody = req.body&#10;    fs.createWriteStream('./uploads/ktor_logo.png').write(rawBody)&#10;    res.send('A file is uploaded')&#10;})"/>
                    <p>
                        전체 예시는 <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/7_receive_request/app.js">7_receive_request</a> 프로젝트를 참조하십시오.
                    </p>
                </td>
            </tr>
            <tr>
                <td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        Ktor는 비동기식으로 바이트 시퀀스를 읽고/쓰기 위해 <code>ByteReadChannel</code> 및 <code>ByteWriteChannel</code>을 제공합니다:
                    </p>
                    <code-block lang="kotlin" code="        }&#10;        post(&quot;/raw&quot;) {&#10;            val file = File(&quot;uploads/ktor_logo.png&quot;)&#10;            call.receiveChannel().copyAndClose(file.writeChannel())&#10;            call.respondText(&quot;A file is uploaded&quot;)"/>
                    <p>
                        전체 예시는 <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/7_receive_request/src/main/kotlin/com/example/Application.kt">7_receive
                            request</a> 프로젝트를 참조하십시오.
                    </p>
                </td>
            </tr>
        </table>
    </chapter>
    <chapter title="멀티파트" id="receive-multipart">
        <p>
            마지막 섹션에서는 <emphasis>멀티파트</emphasis> 본문을 처리하는 방법을 살펴보겠습니다.
            아래 <code>POST</code> 요청은 <control>multipart/form-data</control> 유형을 사용하여 설명과 함께 PNG 이미지를 전송합니다:
        </p>
        <code-block lang="http" code="POST http://localhost:3000/multipart&#10;Content-Type: multipart/form-data; boundary=WebAppBoundary&#10;&#10;--WebAppBoundary&#10;Content-Disposition: form-data; name=&quot;description&quot;&#10;Content-Type: text/plain&#10;&#10;Ktor logo&#10;--WebAppBoundary&#10;Content-Disposition: form-data; name=&quot;image&quot;; filename=&quot;ktor_logo.png&quot;&#10;Content-Type: image/png&#10;&#10;&lt; ./ktor_logo.png&#10;--WebAppBoundary--"/>
        <table style="header-column">
            <tr>
                <td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        Express는 멀티파트 데이터를 파싱하기 위해 별도의 모듈이 필요합니다.
                        아래 예시에서는 <control>multer</control>를 사용하여 서버에 파일을 업로드합니다:
                    </p>
                    <code-block lang="javascript" code="const multer = require('multer')&#10;&#10;const storage = multer.diskStorage({&#10;    destination: './uploads/',&#10;    filename: function (req, file, cb) {&#10;        cb(null, file.originalname);&#10;    }&#10;})&#10;const upload = multer({storage: storage});&#10;app.post('/multipart', upload.single('image'), function (req, res, next) {&#10;    let fileDescription = req.body[&quot;description&quot;]&#10;    let fileName = req.file.filename&#10;    res.send(`${fileDescription} is uploaded to uploads/${fileName}`)&#10;})"/>
                    <p>
                        전체 예시는 <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/7_receive_request/app.js">7_receive_request</a> 프로젝트를 참조하십시오.
                    </p>
                </td>
            </tr>
            <tr>
                <td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        Ktor에서 멀티파트 요청의 일부로 전송된 파일을 수신해야 하는 경우, <code>receiveMultipart</code> 함수를 호출한 다음 필요에 따라 각 부분을 반복 처리합니다.
                        아래 예시에서는 <code>PartData.FileItem</code>을 사용하여 파일을 바이트 스트림으로 수신합니다:
                    </p>
                    <code-block lang="kotlin" code="        }&#10;        post(&quot;/multipart&quot;) {&#10;            var fileDescription = &quot;&quot;&#10;            var fileName = &quot;&quot;&#10;            val multipartData = call.receiveMultipart()&#10;            multipartData.forEachPart { part -&gt;&#10;                when (part) {&#10;                    is PartData.FormItem -&gt; {&#10;                        fileDescription = part.value&#10;                    }&#10;&#10;                    is PartData.FileItem -&gt; {&#10;                        fileName = part.originalFileName as String&#10;                        val fileBytes = part.provider().readRemaining().readByteArray()&#10;                        File(&quot;uploads/$fileName&quot;).writeBytes(fileBytes)&#10;                    }&#10;&#10;                    else -&gt; {}&#10;                }&#10;                part.dispose()&#10;            }"/>
                    <p>
                        전체 예시는 <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/7_receive_request/src/main/kotlin/com/example/Application.kt">7_receive_request</a> 프로젝트를 참조하십시오.
                    </p>
                </td>
            </tr>
        </table>
    </chapter>
</chapter>
<chapter title="미들웨어 생성" id="middleware">
    <p>
        마지막으로 살펴볼 내용은 서버 기능을 확장할 수 있는 미들웨어 생성 방법입니다.
        아래 예시는 Express와 Ktor를 사용하여 요청 로깅을 구현하는 방법을 보여줍니다.
    </p>
    <table style="header-column">
        <tr>
            <td>
                <control>Express</control>
            </td>
            <td>
                <p>
                    Express에서 미들웨어는 <code>app.use</code>를 사용하여 애플리케이션에 바인딩된 함수입니다:
                </p>
                <code-block lang="javascript" code="const express = require('express')&#10;const app = express()&#10;const port = 3000&#10;&#10;const requestLogging = function (req, res, next) {&#10;    let scheme = req.protocol&#10;    let host = req.headers.host&#10;    let url = req.url&#10;    console.log(`Request URL: ${scheme}://${host}${url}`)&#10;    next()&#10;}&#10;&#10;app.use(requestLogging)"/>
                <p>
                    전체 예시는 <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/8_middleware/app.js">8_middleware</a> 프로젝트를 참조하십시오.
                </p>
            </td>
        </tr>
        <tr>
            <td>
                <control>Ktor</control>
            </td>
            <td>
                <p>
                    Ktor는 <Links href="/ktor/server-custom-plugins" summary="자신만의 사용자 지정 플러그인을 만드는 방법을 알아봅니다.">사용자 지정 플러그인</Links>을 사용하여 기능을 확장할 수 있도록 합니다.
                    아래 코드 예시는 요청 로깅을 구현하기 위해 <code>onCall</code>을 처리하는 방법을 보여줍니다:
                </p>
                <code-block lang="kotlin" code="val RequestLoggingPlugin = createApplicationPlugin(name = &quot;RequestLoggingPlugin&quot;) {&#10;    onCall { call -&gt;&#10;        call.request.origin.apply {&#10;            println(&quot;Request URL: $scheme://$localHost:$localPort$uri&quot;)&#10;        }&#10;    }&#10;}"/>
                <p>
                    전체 예시는 <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/8_middleware/src/main/kotlin/com/example/Application.kt">8_middleware</a> 프로젝트를 참조하십시오.
                </p>
            </td>
        </tr>
    </table>
</chapter>
<chapter title="다음 단계" id="next">
    <p>
        세션 관리, 권한 부여, 데이터베이스 통합 등 이 가이드에서 다루지 않은 많은 사용 사례가 여전히 있습니다.
        이러한 기능 대부분에 대해 Ktor는 애플리케이션에 설치하고 필요에 따라 구성할 수 있는 전용 플러그인을 제공합니다.
        Ktor 여정을 계속하려면 일련의 단계별 가이드와 바로 사용할 수 있는 샘플을 제공하는 <control><a href="https://ktor.io/learn/">학습 페이지</a></control>를 방문하십시오.
    </p>
</chapter>