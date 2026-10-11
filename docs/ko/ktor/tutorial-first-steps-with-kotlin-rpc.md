<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       title="Kotlin RPC 시작하기" id="tutorial-first-steps-with-kotlin-rpc">
<show-structure for="chapter" depth="2"/>
<web-summary>
    이 포괄적인 가이드를 통해 RPC의 기본 개념을 알아보고 RPC와 REST 간의 상세한 비교를 살펴보세요. Kotlin RPC로 첫 번째 애플리케이션을 빌드하는 방법을 배워봅니다.
</web-summary>
<link-summary>
    Kotlin RPC와 Ktor를 사용하여 첫 번째 애플리케이션을 만드는 방법을 알아보세요.
</link-summary>
<card-summary>
    Kotlin RPC와 Ktor를 사용하여 첫 번째 애플리케이션을 만드는 방법을 알아보세요.
</card-summary>
<tldr>
    <var name="example_name" value="tutorial-kotlin-rpc-app"/>
    <p>
        <b>코드 예제</b>:
        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
            %example_name%
        </a>
    </p>
    <p>
        <b>사용된 플러그인</b>: <Links href="/ktor/server-routing" summary="Routing is a core plugin for handling incoming requests in a server application.">Routing</Links>,
        <a href="https://kotlinlang.org/api/kotlinx.serialization/">kotlinx.serialization</a>,
        <a href="https://kotlin.github.io/kotlinx-rpc/get-started.html">kotlinx.rpc</a>
    </p>
</tldr>
<p>
    Kotlin RPC(원격 프로시저 호출, Remote Procedure Call)는 견고하게 확립된 기반 위에 구축되어 <code>kotlinx.rpc</code> 라이브러리를 통해 실행되는, Kotlin 생태계의 새롭고 흥미로운 추가 기능입니다.
</p>
<p>
    <code>kotlinx.rpc</code> 라이브러리를 사용하면 일반적인 Kotlin 언어 구문만을 사용하여 네트워크 경계를 넘어 프로시저 호출을 수행할 수 있습니다. 따라서 REST 및 Google RPC(gRPC) 모두에 대한 대안을 제공합니다.
</p>
<p>
    이 문서에서는 Kotlin RPC의 핵심 개념을 소개하고 간단한 애플리케이션을 빌드해 봅니다. 그런 다음 자신의 프로젝트에서 이 라이브러리를 평가해 볼 수 있습니다.
</p>
<chapter title="사전 요구 사항" id="prerequisites">
    <p>
        이 튜토리얼은 독자가 Kotlin 프로그래밍에 대한 기본적인 이해를 갖추고 있다고 가정합니다. Kotlin이 처음이라면 몇 가지 <a href="https://kotlinlang.org/docs/getting-started.html">소개 자료</a>를 살펴보는 것을 권장합니다.
    </p>
    <p>최상의 경험을 위해 생산성을 향상시킬 수 있는 포괄적인 지원과 도구를 제공하는 <a
            href="https://www.jetbrains.com/idea/download">IntelliJ
        IDEA Ultimate</a>를 통합 개발 환경(IDE)으로 사용하는 것을 권장합니다.
    </p>
</chapter>
<chapter title="RPC란 무엇인가요?" id="what-is-rpc">
    <chapter title="로컬 프로시저 호출 vs. 원격 프로시저 호출" id="local-vs-remote">
        <p>
            프로그래밍 경험이 있는 사람이라면 누구나 프로시저 호출이라는 개념에 익숙할 것입니다. 이는 모든 프로그래밍 언어의 기본 개념입니다. 기술적으로 이러한 호출은 항상 동일한 프로그램 내에서 발생하므로 로컬 프로시저 호출(Local procedure call)입니다.
        </p>
        <p>
            원격 프로시저 호출(Remote procedure call)은 함수 호출 및 매개변수가 네트워크를 통해 전달되어 별도의 VM/실행 파일 내에서 구현이 실행되는 경우를 의미합니다. 반환값은 호출이 시작된 머신으로 역방향 경로를 거쳐 돌아옵니다.
        </p>
        <p>
            호출이 일어난 머신을 클라이언트, 구현이 위치한 머신을 서버로 생각하면 가장 이해하기 쉽습니다. 그러나 반드시 이 구조일 필요는 없습니다. 피어(peer) 아키텍처의 일부로서 RPC 호출이 양방향으로 발생할 수도 있습니다. 하지만 단순함을 위해 여기서는 클라이언트/서버 배포 모델을 가정하겠습니다.
        </p>
    </chapter>
    <chapter title="RPC 프레임워크의 기초" id="rpc-framework-fundamentals">
        <p>
            모든 RPC 프레임워크는 몇 가지 기본 요소를 반드시 제공해야 합니다. 이는 기존 IT 인프라 내에서 원격 프로시저 호출을 구현할 때 불가피하게 요구되는 사항입니다. 용어는 다를 수 있고 책임 분담 방식도 다양할 수 있지만, 모든 RPC 프레임워크는 다음을 제공해야 합니다.
        </p>
        <list type="decimal">
            <li>
                원격으로 호출될 프로시저를 선언하는 방법입니다. 객체 지향 프로그래밍에서는 인터페이스가 논리적인 선택입니다. 이는 현재 언어에서 제공하는 인터페이스 구문일 수도 있고, <a
                    href="https://webidl.spec.whatwg.org/">W3C에서 사용하는 Web IDL</a>과 같은 언어 중립적인 표준일 수도 있습니다.
            </li>
            <li>
                매개변수 및 반환값에 사용되는 타입을 지정하는 수단입니다. 마찬가지로 언어 중립적인 표준을 사용할 수도 있지만, 현재 언어의 표준 데이터 타입 선언에 어노테이션을 지정하는 것이 더 간단할 수 있습니다.
            </li>
            <li>
                <format style="italic">클라이언트 스텁(client stubs)</format>
                으로 알려진 도우미 클래스입니다. 이들은 프로시저 호출을 네트워크를 통해 전송 가능한 형식으로 변환하고 수신된 반환값을 언패킹하는 데 사용됩니다. 이러한 스텁은 컴파일 프로세스 중에 생성되거나 런타임에 동적으로 생성될 수 있습니다.
            </li>
            <li>
                도우미 클래스를 관리하고 원격 프로시저 호출의 수명 주기를 감독하는 기본
                <format style="italic">RPC 런타임(RPC Runtime)</format>
                입니다. 서버 측에서는 요청을 지속적으로 처리할 수 있도록 이 런타임이 특정 서버 내에 임베드되어 있어야 합니다.
            </li>
            <li>
                호출되는 프로시저를 나타내고, 전송되는 데이터를 직렬화하며, 네트워크를 통해 정보를 변환하기 위한 프로토콜을 선택(또는 정의)해야 합니다. 과거에는 몇몇 기술이 처음부터 새 프로토콜을 정의하기도 했고(CORBA의 IIOP), 재사용에 집중하기도 했습니다(SOAP의 HTTP POST).
            </li>
        </list>
    </chapter>
    <chapter title="마셜링 vs. 직렬화" id="marshaling-vs-serialization">
        <p>
            RPC 프레임워크에서는
            <format style="italic">마셜링(marshaling)</format>
            과
            <format style="italic">언마셜링(unmarshaling)</format>
            이라는 표현을 사용합니다. 이는 네트워크를 통해 전송할 정보를 패킹하고 언패킹하는 프로세스입니다. 직렬화(Serialization)의 상위 집합으로 볼 수 있습니다. 마셜링에서는 객체를 직렬화하지만, 호출되는 프로시저 및 해당 호출이 수행된 컨텍스트에 대한 정보도 함께 패키징해야 합니다.
        </p>
    </chapter>
    <p>
        RPC의 핵심 개념을 살펴보았으니, 샘플 애플리케이션을 구축하면서 이러한 개념이 <code>kotlinx.rpc</code>에 어떻게 적용되는지 확인해 보겠습니다.
    </p>
</chapter>
    <chapter title="Hello, kotlinx.rpc" id="hello-kotlinx-rpc">
        <p>
            네트워크를 통해 피자를 주문하는 애플리케이션을 만들어 보겠습니다. 코드를 최대한 단순하게 유지하기 위해 콘솔 기반 클라이언트를 사용합니다.
        </p>
        <chapter title="프로젝트 생성" id="create-project">
            <p>먼저 클라이언트와 서버 구현을 모두 포함하는 프로젝트를 생성합니다.</p>
            <p>
                더 복잡한 애플리케이션에서는 클라이언트와 서버에 별도의 모듈을 사용하는 것이 모범 사례입니다. 그러나 이 튜토리얼에서는 단순함을 위해 둘 다 단일 모듈을 사용합니다.
            </p>
            <procedure id="create-project-procedure">
                <step>
                    <a href="https://www.jetbrains.com/idea/download/">IntelliJ IDEA</a>를 실행합니다.
                </step>
                <step>
                    <p>
                        시작 화면에서 <control>New Project</control>를 클릭합니다.
                    </p>
                    <p>
                        또는 메인 메뉴에서 <ui-path>File | New | Project</ui-path>를 선택합니다.
                    </p>
                </step>
                <step>
                    <control>Name</control>
                    필드에 프로젝트 이름으로
                    <Path>KotlinRpcPizzaApp</Path>
                    을 입력합니다.
                    <img src="tutorial_kotlin_rpc_intellij_project.png" alt="IntelliJ New Kotlin Project window"
                         style="block" width="706" border-effect="rounded"/>
                </step>
                <step>
                    나머지 기본 설정을 그대로 두고
                    <control>Create</control>
                    를 클릭합니다.
                </step>
            </procedure>
            <p>
                보통은 프로젝트 빌드 파일을 즉시 구성하지만, 이는 기술을 이해하는 데 큰 도움이 되지 않는 구현 세부 사항이므로 마지막에 다루겠습니다.
            </p>
        </chapter>
        <chapter title="공유 타입 추가" id="shared-types">
            <p>
                모든 RPC 프로젝트의 핵심은 원격으로 호출될 프로시저를 정의하는 인터페이스와 해당 프로시저 정의에 사용되는 타입입니다.
            </p>
            <p>
                멀티모듈 프로젝트에서는 이러한 타입을 공유해야 하지만, 이 예제에서는 그 단계가 필요하지 않습니다.
            </p>
            <procedure id="shared-types-procedure">
                <step>
                    <Path>src/main/kotlin</Path>
                    폴더로 이동하여
                    <Path>model</Path>
                    이라는 새 하위 패키지를 생성합니다.
                </step>
                <step>
                    <Path>model</Path>
                    패키지 내에 다음과 같은 구현으로 새
                    <Path>PizzaShop.kt</Path>
                    파일을 생성합니다.
                    <code-block lang="kotlin" code="package com.example.model&#10;&#10;import kotlinx.coroutines.flow.Flow&#10;import kotlinx.serialization.Serializable&#10;import kotlinx.rpc.annotations.Rpc&#10;&#10;@Rpc&#10;interface PizzaShop {&#10;    suspend fun orderPizza(pizza: Pizza): Receipt&#10;}&#10;&#10;@Serializable&#10;class Pizza(val name: String)&#10;&#10;@Serializable&#10;class Receipt(val amount: Double)"/>
                    <p>
                        인터페이스에는 <code>kotlinx.rpc</code> 라이브러리의 <code>@Rpc</code> 어노테이션이 있어야 합니다.
                    </p>
                    <p>
                        네트워크를 통해 정보를 전송하는 데 도움을 주는 <a href="https://github.com/Kotlin/kotlinx.serialization"><code>kotlinx.serialization</code></a>을 사용하므로, 매개변수에 사용되는 타입에는 <code>Serializable</code> 어노테이션을 표시해야 합니다.
                    </p>
                </step>
            </procedure>
        </chapter>
        <chapter title="클라이언트 구현" id="client-implementation">
            <procedure id="client-impl-procedure">
                <step>
                    <Path>src/main/kotlin</Path>
                    으로 이동하여 새
                    <Path>Client.kt</Path>
                    파일을 생성합니다.
                </step>
                <step>
                    <Path>Client.kt</Path>
                    를 열고 다음 구현을 추가합니다.
                    <code-block lang="kotlin" code="package com.example&#10;&#10;import com.example.model.Pizza&#10;import com.example.model.PizzaShop&#10;import io.ktor.client.*&#10;import io.ktor.http.*&#10;import kotlinx.coroutines.runBlocking&#10;import kotlinx.rpc.withService&#10;import kotlinx.rpc.krpc.serialization.json.json&#10;import kotlinx.rpc.krpc.ktor.client.KtorRpcClient&#10;import kotlinx.rpc.krpc.ktor.client.installKrpc&#10;import kotlinx.rpc.krpc.ktor.client.rpc&#10;import kotlinx.rpc.krpc.ktor.client.rpcConfig&#10;import kotlinx.rpc.krpc.serialization.json.json&#10;&#10;fun main() = runBlocking {&#10;    val ktorClient = HttpClient {&#10;        installKrpc {&#10;            serialization { json() }&#10;        }&#10;    }&#10;&#10;    val client: KtorRpcClient = ktorClient.rpc {&#10;        url {&#10;            host = &quot;localhost&quot;&#10;            port = 8080&#10;            encodedPath = &quot;pizza&quot;&#10;        }&#10;&#10;        rpcConfig {&#10;            serialization {&#10;                json()&#10;            }&#10;        }&#10;    }&#10;&#10;    val pizzaShop: PizzaShop = client.withService&lt;PizzaShop&gt;()&#10;&#10;    val receipt = pizzaShop.orderPizza(Pizza(&quot;Pepperoni&quot;))&#10;    println(&quot;Your pizza cost ${receipt.amount}&quot;)&#10;    ktorClient.close()&#10;}"/>
                </step>
            </procedure>
            <p>
                RPC 호출을 준비하고 실행하는 데 단 25줄의 코드만 필요합니다. 분명 많은 작업이 진행되고 있으므로 코드를 여러 부분으로 나누어 살펴보겠습니다.
            </p>
            <p>
                <code>kotlinx.rpc</code> 라이브러리는 클라이언트 측에서 런타임을 호스팅하기 위해 <Links href="/ktor/client-create-new-application" summary="Create your first client application for sending a request and receiving a response.">Ktor 클라이언트</Links>를 사용합니다. 런타임이 Ktor에 결합되어 있지는 않으며 다른 선택도 가능하지만, 이는 재사용성을 높이고 <code>kotlinx.rpc</code>를 기존 KMP 애플리케이션에 쉽게 통합할 수 있도록 해줍니다.
            </p>
            <p>
                Ktor 클라이언트와 Kotlin RPC는 모두 코루틴을 기반으로 구축되었으므로, <code>runBlocking</code>을 사용하여 초기 코루틴을 생성하고 그 내부에서 나머지 클라이언트를 실행합니다.
            </p>
            <code-block lang="kotlin" code="fun main() = runBlocking {&#10;}"/>
            <tip>
                <code>runBlocking</code>은 프로덕션 코드가 아닌 스파이크(spike) 조사 및 테스트를 위해 설계된 것임에 유의하세요.
            </tip>
            <p>
                다음으로 표준적인 방식으로 Ktor 클라이언트 인스턴스를 생성합니다. <code>kotlinx.rpc</code>는 내부적으로 정보를 전송하기 위해 <Links href="/ktor/client-websockets" summary="The Websockets plugin allows you to create a multi-way communication session between a server and a client.">WebSockets</Links> 플러그인을 사용합니다. <code>installKrpc()</code> 함수를 사용하여 로드되기만 하면 됩니다.
            </p>
            <code-block lang="kotlin" code="    val ktorClient = HttpClient {&#10;        installKrpc {&#10;            serialization { json() }&#10;        }&#10;    }"/>
            <p>
                Ktor 클라이언트를 생성한 후 원격 프로시저를 호출하기 위한 <code>KtorRpcClient</code> 객체를 만듭니다. 서버의 위치와 정보를 전송하는 데 사용되는 메커니즘을 구성해야 합니다.
            </p>
            <code-block lang="kotlin" code="    val client: KtorRpcClient = ktorClient.rpc {&#10;        url {&#10;            host = &quot;localhost&quot;&#10;            port = 8080&#10;            encodedPath = &quot;pizza&quot;&#10;        }&#10;&#10;        rpcConfig {&#10;            serialization {&#10;                json()&#10;            }&#10;        }&#10;    }"/>
            <p>
                이 시점에서 표준 설정이 완료되었으며 문제 도메인과 관련된 기능을 사용할 준비가 되었습니다. 클라이언트를 사용하여 <code>PizzaShop</code> 인터페이스의 메서드를 구현하는 클라이언트 프록시 객체를 생성할 수 있습니다.
            </p>
            <code-block lang="kotlin"
                        include-symbol="pizzaShop" code="package com.example&#10;&#10;import com.example.model.Pizza&#10;import com.example.model.PizzaShop&#10;import io.ktor.client.*&#10;import io.ktor.http.*&#10;import kotlinx.coroutines.runBlocking&#10;import kotlinx.rpc.withService&#10;import kotlinx.rpc.krpc.serialization.json.json&#10;import kotlinx.rpc.krpc.ktor.client.KtorRpcClient&#10;import kotlinx.rpc.krpc.ktor.client.installKrpc&#10;import kotlinx.rpc.krpc.ktor.client.rpc&#10;import kotlinx.rpc.krpc.ktor.client.rpcConfig&#10;import kotlinx.rpc.krpc.serialization.json.json&#10;&#10;fun main() = runBlocking {&#10;    val ktorClient = HttpClient {&#10;        installKrpc {&#10;            serialization { json() }&#10;        }&#10;    }&#10;&#10;    val client: KtorRpcClient = ktorClient.rpc {&#10;        url {&#10;            host = &quot;localhost&quot;&#10;            port = 8080&#10;            encodedPath = &quot;pizza&quot;&#10;        }&#10;&#10;        rpcConfig {&#10;            serialization {&#10;                json()&#10;            }&#10;        }&#10;    }&#10;&#10;    val pizzaShop: PizzaShop = client.withService&lt;PizzaShop&gt;()&#10;&#10;    /*&#10;    val receipt = pizzaShop.orderPizza(Pizza(&quot;Pepperoni&quot;))&#10;    println(&quot;Your pizza cost ${receipt.amount}&quot;)&#10;    */&#10;&#10;    pizzaShop.orderPizza(&quot;AB12&quot;, Pizza(&quot;Pepperoni&quot;))&#10;    pizzaShop.orderPizza(&quot;AB12&quot;, Pizza(&quot;Hawaiian&quot;))&#10;    pizzaShop.orderPizza(&quot;AB12&quot;, Pizza(&quot;Calzone&quot;))&#10;&#10;    pizzaShop.orderPizza(&quot;CD34&quot;, Pizza(&quot;Margherita&quot;))&#10;    pizzaShop.orderPizza(&quot;CD34&quot;, Pizza(&quot;Sicilian&quot;))&#10;    pizzaShop.orderPizza(&quot;CD34&quot;, Pizza(&quot;California&quot;))&#10;&#10;    pizzaShop.viewOrders(&quot;AB12&quot;).collect {&#10;        println(&quot;AB12 ordered ${it.name}&quot;)&#10;    }&#10;&#10;    pizzaShop.viewOrders(&quot;CD34&quot;).collect {&#10;        println(&quot;CD34 ordered ${it.name}&quot;)&#10;    }&#10;&#10;    ktorClient.close()&#10;}"/>
            <p>
                이제 원격 프로시저 호출을 수행하고 결과를 사용할 수 있습니다.
            </p>
            <code-block lang="kotlin" code="    val receipt = pizzaShop.orderPizza(Pizza(&quot;Pepperoni&quot;))&#10;    println(&quot;Your pizza cost ${receipt.amount}&quot;)"/>
            <p>
                이 시점에서 엄청난 양의 작업이 대신 처리되고 있음에 유의하세요. 호출의 세부 정보와 모든 매개변수가 메시지로 변환되어 네트워크를 통해 전송된 다음, 반환값을 수신하고 디코딩해야 합니다. 이 작업이 투명하게 이루어진다는 점이 초기 설정에 대한 보상입니다.
            </p>
            <p>
                마지막으로 평소처럼 클라이언트를 종료해야 합니다.
            </p>
            <code-block lang="kotlin" code="    ktorClient.close()"/>
        </chapter>
        <chapter title="서버 구현" id="server-implementation">
            <p>
                서버 측 구현은 두 부분으로 나뉩니다. 첫째로 인터페이스의 구현체를 생성해야 하며, 둘째로 이를 서버 내에서 호스팅해야 합니다.
            </p>
            <procedure id="create-interface">
                <step>
                    <Path>src/main/kotlin</Path>
                    으로 이동하여 새
                    <Path>Server.kt</Path>
                    파일을 생성합니다.
                </step>
                <step>
                    <Path>Server.kt</Path>
                    를 열고 다음 인터페이스를 추가합니다.
                    <code-block lang="kotlin" code="package com.example&#10;&#10;import com.example.model.*&#10;import io.ktor.server.application.*&#10;&#10;class PizzaShopImpl : PizzaShop {&#10;    override suspend fun orderPizza(pizza: Pizza): Receipt {&#10;        return Receipt(7.89)&#10;    }&#10;}"/>
                    <p>
                        당연히 이것은 실제 프로덕션 구현은 아니지만, 데모를 실행하기에는 충분합니다.
                    </p>
                    <p>
                        구현의 두 번째 부분은 Ktor를 기반으로 합니다.
                    </p>
                </step>
                <step>
                    <p>
                        동일한 파일에 다음 코드를 추가합니다.
                    </p>
                    <code-block lang="kotlin" code="fun main() {&#10;    embeddedServer(Netty, port = 8080) {&#10;        module()&#10;        println(&quot;Server running&quot;)&#10;    }.start(wait = true)&#10;}&#10;&#10;fun Application.module() {&#10;    install(Krpc)&#10;&#10;    routing {&#10;        rpc(&quot;/pizza&quot;) {&#10;            rpcConfig {&#10;                serialization {&#10;                    json()&#10;                }&#10;            }&#10;&#10;            registerService&lt;PizzaShop&gt; { PizzaShopImpl() }&#10;        }&#10;    }&#10;}"/>
                    <p>자세한 내용은 다음과 같습니다.</p>
                    <p>
                        먼저 구성에 사용할 지정된 확장 함수와 함께 Ktor/Netty 인스턴스를 생성합니다.
                    </p>
                    <code-block lang="kotlin" code="    embeddedServer(Netty, port = 8080) {&#10;        module()&#10;        println(&quot;Server running&quot;)&#10;    }.start(wait = true)"/>
                    <p>
                        그런 다음 Ktor Application 타입을 확장하는 설정 함수를 선언합니다. 이는 <code>kotlinx.rpc</code> 플러그인을 설치하고 하나 이상의 라우트를 선언합니다.
                    </p>
                    <code-block lang="kotlin" code="fun Application.module() {&#10;    install(Krpc)&#10;&#10;    routing {&#10;    }&#10;}"/>
                    <p>
                        routing 섹션 내에서 Ktor Routing DSL에 대한 <code>kotlinx.rpc</code> 확장 기능을 사용하여 엔드포인트를 선언합니다. 클라이언트에서와 마찬가지로 URL을 지정하고 직렬화를 구성합니다. 하지만 이 경우 구현체는 수신되는 요청을 처리하기 위해 해당 URL에서 수신 대기하게 됩니다.
                    </p>
                    <code-block lang="kotlin" code="        rpc(&quot;/pizza&quot;) {&#10;            rpcConfig {&#10;                serialization {&#10;                    json()&#10;                }&#10;            }&#10;&#10;            registerService&lt;PizzaShop&gt; { PizzaShopImpl() }&#10;        }"/>
                    <p>
                        RPC 런타임에 인터페이스의 구현체를 제공하기 위해 <code>registerService</code>를 사용한다는 점에 주목하세요. 단일 인스턴스 이상이 필요할 수도 있지만, 이는 후속 문서에서 다룰 주제입니다.
                    </p>
                </step>
            </procedure>
        </chapter>
        <chapter title="종속성 추가" id="add-dependencies">
            <p>
                이제 애플리케이션을 실행하는 데 필요한 모든 코드가 준비되었지만, 현재 상태로는 실행은커녕 컴파일조차 되지 않습니다.
                <a href="https://kotlin.github.io/kotlinx-rpc/get-started.html">kotlinx.rpc</a> 플러그인이 포함된 Ktor Project Generator를 사용할 수도 있고, 빌드 파일을 수동으로 구성할 수도 있습니다.
                수동 구성 역시 그리 복잡하지 않습니다.
            </p>
            <procedure id="configure-build-files">
                <step>
                    <Path>build.gradle.kts</Path>
                    파일에 다음 플러그인을 추가합니다.
                    <code-block lang="kotlin" code="plugins {&#10;    kotlin(&quot;jvm&quot;) version &quot;2.3.0&quot;&#10;    kotlin(&quot;plugin.serialization&quot;) version &quot;2.3.0&quot;&#10;    id(&quot;io.ktor.plugin&quot;) version &quot;3.6.0&quot;&#10;    id(&quot;org.jetbrains.kotlinx.rpc.plugin&quot;) version &quot;0.10.1&quot;&#10;}"/>
                    <p>
                        Kotlin 플러그인의 필요성은 자명합니다. 다른 플러그인에 대해 설명하자면 다음과 같습니다.
                    </p>
                    <list>
                        <li>
                            <code>kotlinx.serialization</code> 플러그인은 Kotlin 객체를 JSON으로 변환하기 위한 도우미 타입을 생성하는 데 필요합니다. <code>kotlinx.serialization</code>은 리플렉션을 전혀 사용하지 않는다는 점을 기억하세요.
                        </li>
                        <li>
                            Ktor 플러그인은 모든 종속성과 함께 앱을 번들링하는 fat JAR를 빌드하는 데 사용됩니다.
                        </li>
                        <li>
                            RPC 플러그인은 클라이언트 측 스텁을 생성하는 데 필요합니다.
                        </li>
                    </list>
                </step>
                <step>
                    다음 종속성을 추가합니다.
                    <code-block lang="kotlin" code="    implementation(&quot;io.ktor:ktor-client-cio-jvm&quot;)&#10;    implementation(&quot;org.jetbrains.kotlinx:kotlinx-rpc-krpc-client:0.10.1&quot;)&#10;    implementation(&quot;org.jetbrains.kotlinx:kotlinx-rpc-krpc-ktor-client:0.10.1&quot;)&#10;    implementation(&quot;io.ktor:ktor-server-netty-jvm&quot;)&#10;    implementation(&quot;org.jetbrains.kotlinx:kotlinx-rpc-krpc-server:0.10.1&quot;)&#10;    implementation(&quot;org.jetbrains.kotlinx:kotlinx-rpc-krpc-ktor-server:0.10.1&quot;)&#10;    implementation(&quot;org.jetbrains.kotlinx:kotlinx-rpc-krpc-serialization-json:0.10.1&quot;)&#10;    implementation(&quot;ch.qos.logback:logback-classic:1.5.33&quot;)&#10;    testImplementation(kotlin(&quot;test&quot;))&#10;}"/>
                    <p>
                        이를 통해 Ktor 클라이언트 및 서버, <code>kotlinx.rpc</code> 런타임의 클라이언트 및 서버 부분, 그리고 <code>kotlinx.rpc</code>와 <code>kotlinx-serialization</code>을 통합하기 위한 라이브러리가 추가됩니다.
                    </p>
                    <p>
                        이제 프로젝트를 실행하고 RPC 호출을 시작할 수 있습니다.
                    </p>
                </step>
            </procedure>
        </chapter>
        <chapter title="애플리케이션 실행" id="run-application">
            <p>
                데모를 실행하려면 아래 단계를 따르세요.
            </p>
            <procedure id="run-app-procedure">
                <step>
                    <Path>Server.kt</Path>
                    파일로 이동합니다.
                </step>
                <step>
                    <p>IntelliJ IDEA에서 <code>main()</code> 함수 옆에 있는 실행 버튼
                        (<img src="intellij_idea_gutter_icon.svg"
                              style="inline" height="16" width="16"
                              alt="intelliJ IDEA run icon"/>)
                        을 클릭하여 애플리케이션을 시작합니다.</p>
                    <p>
                        <control>Run</control>
                        도구 패널에 출력이 표시됩니다.
                    </p>
                    <img src="tutorial_kotlin_rpc_run_server.png" alt="Run server output in intelliJ IDEA"
                         style="block" width="706" border-effect="line"/>
                </step>
                <step>
                    <Path>Client.kt</Path>
                    파일로 이동하여 애플리케이션을 실행합니다. 콘솔에 다음과 같은 출력이 표시됩니다.
                    <code-block lang="shell" code="                        Your pizza cost 7.89&#10;&#10;                        Process finished with exit code 0"/>
                </step>
            </procedure>
        </chapter>
    </chapter>
    <chapter title="예제 확장하기" id="extend-the-example">
        <p>
            마지막으로, 향후 개발을 위한 탄탄한 기반을 마련할 수 있도록 예제 애플리케이션의 복잡도를 높여보겠습니다.
        </p>
        <procedure id="extend-server">
            <step>
                <Path>PizzaShop.kt</Path>
                파일에서 클라이언트 ID를 포함하도록 <code>orderPizza</code> 메서드를 확장하고, 지정된 클라이언트의 대기 중인 모든 주문을 반환하는 <code>viewOrders</code> 메서드를 추가합니다.
                <code-block lang="kotlin" code="package com.example.model&#10;&#10;import kotlinx.coroutines.flow.Flow&#10;import kotlinx.serialization.Serializable&#10;import kotlinx.rpc.annotations.Rpc&#10;&#10;@Rpc&#10;interface PizzaShop {&#10;    suspend fun orderPizza(clientID: String, pizza: Pizza): Receipt&#10;    fun viewOrders(clientID: String): Flow&lt;Pizza&gt;&#10;}"/>
                <p>
                    <code>List</code> 또는 <code>Set</code> 대신 <code>Flow</code>를 반환하여 코루틴 라이브러리를 활용할 수 있습니다. 이를 통해 클라이언트에 피자 정보를 한 번에 하나씩 스트리밍할 수 있습니다.
                </p>
            </step>
            <step>
                <Path>Server.kt</Path>
                파일로 이동하여 현재 주문을 리스트 맵(map of lists)에 저장하도록 이 기능을 구현합니다.
                <code-block lang="kotlin" code="class PizzaShopImpl : PizzaShop {&#10;    private val openOrders = mutableMapOf&lt;String, MutableList&lt;Pizza&gt;&gt;()&#10;&#10;    override suspend fun orderPizza(clientID: String, pizza: Pizza): Receipt {&#10;        if(openOrders.containsKey(clientID)) {&#10;            openOrders[clientID]?.add(pizza)&#10;        } else {&#10;            openOrders[clientID] = mutableListOf(pizza)&#10;        }&#10;        return Receipt(3.45)&#10;    }&#10;&#10;    override fun viewOrders(clientID: String): Flow&lt;Pizza&gt; {&#10;        val orders = openOrders[clientID]&#10;        if (orders != null) {&#10;            return flow {&#10;                for (order in orders) {&#10;                    emit(order)&#10;                    delay(1000)&#10;                }&#10;            }&#10;        }&#10;        return flow {}&#10;    }&#10;}"/>
                <p>
                    각 클라이언트 인스턴스마다 <code>PizzaShopImpl</code>의 새 인스턴스가 생성된다는 점에 유의하세요.
                    이렇게 하면 상태를 격리하여 클라이언트 간의 충돌을 방지합니다. 그러나 단일 서버 인스턴스 내에서의 스레드 안전성(thread safety)은 해결되지 않으며, 특히 동일한 인스턴스에 여러 서비스가 동시에 액세스하는 경우에는 더욱 그렇습니다.
                </p>
            </step>
            <step>
                <Path>Client.kt</Path>
                파일에서 서로 다른 두 개의 클라이언트 ID를 사용하여 여러 주문을 제출합니다.
                <code-block lang="kotlin" code="    val pizzaShop: PizzaShop = client.withService&lt;PizzaShop&gt;()&#10;&#10;    pizzaShop.orderPizza(&quot;AB12&quot;, Pizza(&quot;Pepperoni&quot;))&#10;    pizzaShop.orderPizza(&quot;AB12&quot;, Pizza(&quot;Hawaiian&quot;))&#10;    pizzaShop.orderPizza(&quot;AB12&quot;, Pizza(&quot;Calzone&quot;))&#10;&#10;    pizzaShop.orderPizza(&quot;CD34&quot;, Pizza(&quot;Margherita&quot;))&#10;    pizzaShop.orderPizza(&quot;CD34&quot;, Pizza(&quot;Sicilian&quot;))&#10;    pizzaShop.orderPizza(&quot;CD34&quot;, Pizza(&quot;California&quot;))"/>
                <p>
                    그런 다음 <code>Coroutines</code> 라이브러리와 <code>collect</code> 메서드를 사용하여 결과를 반복 처리합니다.
                </p>
                <code-block lang="kotlin" code="    pizzaShop.viewOrders(&quot;AB12&quot;).collect {&#10;        println(&quot;AB12 ordered ${it.name}&quot;)&#10;    }&#10;&#10;    pizzaShop.viewOrders(&quot;CD34&quot;).collect {&#10;        println(&quot;CD34 ordered ${it.name}&quot;)&#10;    }"/>
            </step>
            <step>
                서버와 클라이언트를 실행합니다. 클라이언트를 실행하면 결과가 점진적으로 표시되는 것을 확인할 수 있습니다.
                <img src="tutorial_kotlin_rpc_run_client.gif" alt="Client output incrementally displaying results"
                     style="block" width="706" border-effect="line"/>
            </step>
        </procedure>
        <p>
            작동하는 예제를 만들어 보았으니, 이제 모든 것이 내부적으로 어떻게 작동하는지 자세히 살펴보겠습니다. 특히 Kotlin RPC와 주요 대안인 REST 및 gRPC를 비교 분석해 보겠습니다.
        </p>
    </chapter>
    <chapter title="RPC vs. REST" id="rpc-vs-rest">
        <p>
            RPC의 개념은 <a
                href="https://en.wikipedia.org/wiki/Remote_procedure_call">최소 1981년으로 거슬러 올라가며</a> REST보다 훨씬 오래되었습니다. REST와 비교할 때 RPC 기반 접근 방식은 균일한 인터페이스(예: HTTP 요청 메서드)에 얽매이지 않으며, 코드에서 다루기가 훨씬 간단하고 바이너리 메시징 덕분에 더 높은 성능을 발휘할 수 있습니다.
        </p>
        <p>
            그러나 REST에는 세 가지 주요 장점이 있습니다.
        </p>
        <list type="decimal">
            <li>
                브라우저의 JavaScript 클라이언트에서 직접 사용할 수 있으므로 단일 페이지 애플리케이션(SPA)의 일부로 활용될 수 있습니다. RPC 프레임워크는 생성된 스텁과 바이너리 메시징에 의존하기 때문에 JavaScript 생태계와는 잘 어울리지 않습니다.
            </li>
            <li>
                REST는 특정 기능이 네트워킹과 관련되어 있음을 명확하게 드러냅니다. 이는 Martin Fowler가 지적한 <a
                    href="https://martinfowler.com/articles/distributed-objects-microservices.html">분산 객체 안티패턴(distributed objects antipattern)</a>을 방지하는 데 도움이 됩니다. 이 안티패턴은 팀이 로컬 프로시저 호출을 원격으로 전환할 때 발생하는 성능 및 안정성 영향을 고려하지 않고 객체 지향 설계를 둘 이상의 조각으로 나눌 때 발생합니다.
            </li>
            <li>
                REST API는 생성, 문서화, 모니터링, 디버깅 및 테스트를 비교적 쉽게 만들어 주는 일련의 규칙을 기반으로 구축됩니다. 이를 지원하는 거대한 도구 생태계가 존재합니다.
            </li>
        </list>
        <p>
            이러한 트레이드오프(trade-off)는 Kotlin RPC가 두 가지 시나리오에서 가장 적합함을 의미합니다. 첫째는 <a
                href="https://www.jetbrains.com/lp/compose-multiplatform/">Compose Multiplatform</a>을 사용하는 KMP 클라이언트 환경이며, 둘째는 클라우드에서 서로 협력하는 마이크로서비스 간의 통신입니다. 향후 <a
                href="https://kotlinlang.org/docs/wasm-overview.html">Kotlin/Wasm</a>의 발전으로 브라우저 기반 애플리케이션에서도 <code>kotlinx.rpc</code>의 활용도가 높아질 수 있습니다.
        </p>
    </chapter>
    <chapter title="Kotlin RPC vs. Google RPC" id="kotlin-rpc-vs-google-rpc">
        <p>
            Google RPC는 현재 소프트웨어 업계에서 가장 지배적인 RPC 기술입니다. 언어 중립적인 인터페이스 정의 언어(IDL)를 사용하여 데이터 구조와 메시지 페이로드를 정의하는 Protocol Buffers(protobuf)라는 표준을 사용합니다. 이러한 IDL 정의는 다양한 프로그래밍 언어로 변환될 수 있으며, 컴팩트하고 효율적인 바이너리 형식을 사용하여 직렬화됩니다. Quarkus 및 Micronaut와 같은 마이크로서비스 프레임워크는 이미 gRPC를 지원합니다.
        </p>
        <p>
            Kotlin RPC가 gRPC와 경쟁하기는 어려울 것이며, Kotlin 커뮤니티 입장에서도 그러한 경쟁으로 얻을 이점이 없습니다. 다행히도 경쟁할 계획은 없습니다. 대신 kotlinx.rpc를 gRPC와 호환 및 상호 운용 가능하도록 만드는 것이 목표입니다. kotlinx.rpc 서비스가 네트워킹 프로토콜로 gRPC를 사용하고, kotlinx.rpc 클라이언트가 gRPC 서비스를 호출할 수 있게 될 것입니다. <code>kotlinx.rpc</code>는 기본 옵션으로 <a
                href="https://kotlin.github.io/kotlinx-rpc/transport.html">자체 kRPC 프로토콜</a>을 사용하지만(현재 예제의 경우처럼), gRPC를 대신 선택하는 것을 막는 제약은 없습니다.
        </p>
    </chapter>
    <chapter title="다음 단계" id="next-steps">
        <p>
            Kotlin RPC는 Kotlin 생태계를 새로운 방향으로 확장하여 서비스를 만들고 소비하기 위한 REST 및 GraphQL의 대안을 제공합니다. Ktor, Coroutines, <code>kotlinx-serialization</code>과 같이 이미 검증된 라이브러리와 프레임워크를 기반으로 구축되었습니다. Kotlin Multiplatform 및 Compose Multiplatform을 활용하려는 팀에게 분산 메시징을 위한 간단하고 효율적인 선택지를 제공할 것입니다.
        </p>
        <p>
            이 소개를 통해 관심이 생기셨다면 <a href="https://kotlin.github.io/kotlinx-rpc/get-started.html">공식 <code>kotlinx.rpc</code> 문서</a>와 <a
                href="https://github.com/Kotlin/kotlinx-rpc/tree/main/samples">예제</a>를 꼭 확인해 보세요.
        </p>
        <p>
            <code>kotlinx.rpc</code> 라이브러리는 아직 초기 단계이므로 직접 살펴보시고 피드백을 공유해 주시길 권장합니다.
            버그 보고 및 기능 요청은 <a href="https://youtrack.jetbrains.com/issues/KRPC">YouTrack</a>에서 확인할 수 있으며, 일반적인 논의는 <a
                href="https://kotlinlang.slack.com/archives/C072YJ3Q91V">Slack</a>(<a
                href="https://surveys.jetbrains.com/s3/kotlin-slack-sign-up">액세스 요청</a>)에서 진행됩니다.
        </p>
    </chapter>
</topic>