[//]: # (title: Kotlin RPC 시작하기)

<show-structure for="chapter" depth="2"/>

<web-summary>
이 종합 가이드를 통해 RPC의 기본 개념을 알아보고 RPC와 REST 간의 상세한 비교를 살펴보세요. Kotlin RPC로 첫 애플리케이션을 만드는 방법을 배워보세요.
</web-summary>

<link-summary>
Kotlin RPC와 Ktor를 사용하여 첫 애플리케이션을 만드는 방법을 배워보세요.
</link-summary>

<card-summary>
Kotlin RPC와 Ktor를 사용하여 첫 애플리케이션을 만드는 방법을 배워보세요.
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
<b>사용된 플러그인</b>: <Links href="server-routing.md" summary="Routing is a core plugin for handling incoming requests in a server application.">Routing</Links>,
<a href="https://kotlinlang.org/api/kotlinx.serialization/">kotlinx.serialization</a>,
<a href="https://kotlin.github.io/kotlinx-rpc/get-started.html">kotlinx.rpc</a>
</p>
</tldr>

Kotlin RPC(원격 프로시저 호출, Remote Procedure Call)는 확고하게 입증된 토대 위에 구축되었으며 [`kotlinx.rpc`](https://kotlin.github.io/kotlinx-rpc/get-started.html) 라이브러리를 기반으로 실행됩니다.

`kotlinx.rpc` 라이브러리를 사용하면 일반적인 Kotlin 언어 구문을 활용하여 네트워크 경계를 넘어 프로시저를 호출할 수 있습니다. 따라서 REST와 Google RPC(gRPC) 모두에 대한 대안을 제공합니다.

이 글에서는 Kotlin RPC의 핵심 개념을 알아보고 간단한 애플리케이션을 구축해 봅니다. 그런 다음 자신의 프로젝트에 이 라이브러리를 도입하여 검토해 볼 수 있습니다.

## 사전 준비 사항 {id="prerequisites"}

이 튜토리얼은 독자가 Kotlin 프로그래밍에 대한 기본적인 이해가 있다고 가정합니다. Kotlin을 처음 접한다면 [입문 자료](https://kotlinlang.org/docs/getting-started.html)를 먼저 살펴보는 것을 권장합니다.

최상의 개발 환경을 위해 통합 개발 환경(IDE)으로 [IntelliJ IDEA Ultimate](https://www.jetbrains.com/idea/download)를 사용하는 것을 권장하며, 생산성을 향상시키는 포괄적인 지원과 도구를 제공합니다.

## RPC란 무엇인가요? {id="what-is-rpc"}

### 로컬 프로시저 호출 vs. 원격 프로시저 호출 {id="local-vs-remote"}

프로시저 호출은 모든 프로그래밍 언어의 기본 개념입니다. 기술적으로는 항상 동일한 프로그램 내에서 실행되므로 로컬 프로시저 호출(Local Procedure Call)입니다.

원격 프로시저 호출(Remote Procedure Call)은 함수 호출 및 매개변수가 네트워크를 통해 전송되어 별도의 가상 머신이나 실행 파일 내에서 구현이 실행되도록 하는 방식입니다. 반환값은 호출이 이루어진 머신으로 반대 경로를 통해 돌아옵니다.

호출이 발생한 머신을 클라이언트로, 구현이 위치한 머신을 서버로 생각하면 이해하기 가장 쉽습니다. 하지만 반드시 이 구조여야 하는 것은 아닙니다. RPC 호출은 피어(peer) 아키텍처의 일부로서 양방향 모두에서 발생할 수 있습니다. 본 튜토리얼에서는 단순화를 위해 클라이언트/서버 배포 방식을 가정합니다.

### RPC 프레임워크의 기본 원리 {id="rpc-framework-fundamentals"}

모든 RPC 프레임워크는 몇 가지 기본 요소를 반드시 제공해야 합니다. 이는 기존 IT 인프라 내에서 원격 프로시저 호출을 구현할 때 필연적으로 수반되는 요소들입니다. 용어는 다를 수 있고 책임 분담 방식도 다양할 수 있지만, 모든 RPC 프레임워크는 다음을 제공해야 합니다.

1. 원격으로 호출될 프로시저를 선언하는 방법. 객체 지향 프로그래밍에서는 인터페이스가 가장 논리적인 선택입니다. 이는 현재 언어에서 제공하는 인터페이스 구문일 수도 있고, [W3C에서 사용하는 Web IDL](https://webidl.spec.whatwg.org/)과 같은 일종의 언어 중립적인 표준일 수도 있습니다.
2. 매개변수와 반환값에 사용되는 타입을 지정하는 수단. 이번에도 언어 중립적인 표준을 사용할 수 있습니다. 그러나 현재 언어의 표준 데이터 타입 선언에 어노테이션을 추가하는 것이 더 간단할 수 있습니다.
3. 프로시저 호출을 네트워크를 통해 전송할 수 있는 형식으로 변환하고 결과 반환값을 언팩(unpack)하는 데 사용되는 _클라이언트 스텁(client stub)_이라 불리는 헬퍼 클래스. 이러한 스텁은 컴파일 프로세스 중에 생성되거나 런타임에 동적으로 생성될 수 있습니다.
4. 헬퍼 클래스를 관리하고 원격 프로시저 호출의 수명 주기를 감독하는 기본 _RPC 런타임(RPC Runtime)_. 서버 측에서는 지속적으로 요청을 처리할 수 있도록 이 런타임이 특정 유형의 서버에 내장되어 있어야 합니다.
5. 호출되는 프로시저를 나타내고, 전송되는 데이터를 직렬화하며, 네트워크를 통해 정보를 변환하기 위해 프로토콜을 선택(또는 정의)해야 합니다. 과거에는 몇몇 기술이 프로토콜을 처음부터 새로 정의(CORBA의 IIOP)하기도 했고, 다른 기술들은 재사용(SOAP의 HTTP POST)에 집중하기도 했습니다.

### 마샬링 vs. 직렬화 {id="marshaling-vs-serialization"}

RPC 프레임워크에서는 _마샬링(marshaling)_과 _언마샬링(unmarshaling)_이라는 용어를 사용합니다. 이는 네트워크를 통해 전송할 정보를 패킹하고 언패킹하는 과정입니다. 이는 직렬화(serialization)의 상위 집합으로 볼 수 있습니다. 마샬링에서는 객체를 직렬화할 뿐만 아니라, 호출되는 프로시저에 대한 정보 및 해당 호출이 이루어진 컨텍스트까지 패키징해야 합니다.

RPC의 핵심 개념을 소개했으니, 이제 샘플 애플리케이션을 구축하면서 `kotlinx.rpc`에 이러한 개념들이 어떻게 적용되는지 살펴보겠습니다.

## Hello, kotlinx.rpc {id="hello-kotlinx-rpc"}

이제 네트워크를 통해 피자를 주문하는 애플리케이션을 만들어 보겠습니다. 코드를 가능한 한 단순하게 유지하기 위해 콘솔 기반 클라이언트를 사용합니다.

### 프로젝트 생성 {id="create-project"}

먼저 클라이언트와 서버 구현을 모두 포함하는 프로젝트를 생성합니다.

더 복잡한 애플리케이션에서는 클라이언트와 서버에 별도의 모듈을 사용하는 것이 모범 사례입니다. 그러나 본 튜토리얼에서는 단순성을 위해 둘 다 단일 모듈을 사용합니다.

<procedure id="create-project-procedure">

1. [IntelliJ IDEA](https://www.jetbrains.com/idea/download/)를 실행합니다.
2. <p>
       시작 화면에서 <control>New Project</control>를 클릭합니다.
   </p>
   <p>
       또는 메인 메뉴에서 <ui-path>File | New | Project</ui-path>를 선택합니다.
   </p>
3. **Name** 필드에 프로젝트 이름으로 <Path>KotlinRpcPizzaApp</Path>을 입력합니다.

   ![IntelliJ 새 Kotlin 프로젝트 창](tutorial_kotlin_rpc_intellij_project.png){style="block" width="706" border-effect="rounded"}
4. 나머지 기본 설정을 그대로 두고 **Create**를 클릭합니다.

</procedure>

일반적으로는 즉시 프로젝트 빌드 파일을 구성하겠지만, 이는 기술에 대한 이해를 높이는 구현 세부사항이 아니므로 마지막 단계에서 다시 다루겠습니다.

### 공유 타입 추가 {id="shared-types"}

모든 RPC 프로젝트의 핵심은 원격으로 호출될 프로시저를 정의하는 인터페이스와 해당 프로시저의 정의에 사용되는 타입들입니다.

다중 모듈 프로젝트에서는 이러한 타입들을 공유해야 합니다. 그러나 본 예제에서는 이 과정이 필요하지 않습니다.

<procedure id="shared-types-procedure">

1. <Path>src/main/kotlin</Path> 폴더로 이동하여 <Path>model</Path>이라는 새 하위 패키지를 생성합니다.
2. <Path>model</Path> 패키지 안에 다음 구현을 포함한 새 <Path>PizzaShop.kt</Path> 파일을 생성합니다.

   ```kotlin
   package com.example.model
   
   import kotlinx.coroutines.flow.Flow
   import kotlinx.serialization.Serializable
   import kotlinx.rpc.annotations.Rpc
   
   @Rpc
   interface PizzaShop {
       suspend fun orderPizza(pizza: Pizza): Receipt
   }
   
   @Serializable
   class Pizza(val name: String)
   
   @Serializable
   class Receipt(val amount: Double)
   ```

   인터페이스에는 `kotlinx.rpc` 라이브러리의 `@Rpc` 어노테이션이 있어야 합니다.

   네트워크를 통해 정보를 전송하는 데 도움을 주는 [`kotlinx.serialization`](https://github.com/Kotlin/kotlinx.serialization)을 사용하고 있으므로, 매개변수에 사용되는 타입들은 `Serializable` 어노테이션이 표시되어야 합니다.

</procedure>

### 클라이언트 구현 {id="client-implementation"}

<procedure id="client-impl-procedure">

1. <Path>src/main/kotlin</Path>으로 이동하여 새 <Path>Client.kt</Path> 파일을 생성합니다.
2. <Path>Client.kt</Path>를 열고 다음 구현을 추가합니다.

   ```kotlin
   package com.example
   
   import com.example.model.Pizza
   import com.example.model.PizzaShop
   import io.ktor.client.*
   import io.ktor.http.*
   import kotlinx.coroutines.runBlocking
   import kotlinx.rpc.withService
   import kotlinx.rpc.krpc.serialization.json.json
   import kotlinx.rpc.krpc.ktor.client.KtorRpcClient
   import kotlinx.rpc.krpc.ktor.client.installKrpc
   import kotlinx.rpc.krpc.ktor.client.rpc
   import kotlinx.rpc.krpc.ktor.client.rpcConfig
   import kotlinx.rpc.krpc.serialization.json.json
   
   fun main() = runBlocking {
       val ktorClient = HttpClient {
           installKrpc {
               serialization { json() }
           }
       }
   
       val client: KtorRpcClient = ktorClient.rpc {
           url {
               host = "localhost"
               port = 8080
               encodedPath = "pizza"
           }
   
           rpcConfig {
               serialization {
                   json()
               }
           }
       }
   
       val pizzaShop: PizzaShop = client.withService<PizzaShop>()
   
       val receipt = pizzaShop.orderPizza(Pizza("Pepperoni"))
       println("Your pizza cost ${receipt.amount}")
       ktorClient.close()
   }
   ```

</procedure>

위 코드를 통해 RPC 호출을 준비하고 실행했습니다.

`kotlinx.rpc` 라이브러리는 클라이언트 측에서 런타임을 호스팅하기 위해 [Ktor 클라이언트](client-create-new-application.topic)를 사용합니다. 런타임이 Ktor에 종속되어 있는 것은 아니며 다른 선택지도 가능하지만, Ktor를 사용하면 재사용성을 높이고 기존 Kotlin Multiplatform 애플리케이션에 `kotlinx.rpc`를 쉽게 통합할 수 있습니다.

Ktor 클라이언트와 Kotlin RPC는 모두 코루틴을 기반으로 구축되었으므로, `runBlocking {}` 블록을 사용하여 초기 코루틴을 생성하고 그 안에서 클라이언트의 나머지 부분을 실행합니다.

```kotlin
fun main() = runBlocking {
}
```

> `runBlocking {}`은 프로덕션 코드가 아닌 스파이크(spike) 및 테스트용으로 설계되었습니다.
>
{style="tip"}

다음으로, 표준적인 방식으로 Ktor 클라이언트 인스턴스를 생성합니다. `kotlinx.rpc`는 정보를 전송하기 위해 [WebSockets](client-websockets.topic) 플러그인을 사용합니다. `installKrpc()` 함수를 사용하여 플러그인이 로드되도록 합니다.

```kotlin
val ktorClient = HttpClient {
    installKrpc {
        serialization { json() }
    }
}
```

Ktor 클라이언트를 생성한 후, 원격 프로시저를 호출하기 위한 `KtorRpcClient` 객체를 생성합니다. 서버의 위치와 정보 전송에 사용되는 메커니즘을 구성합니다.

```kotlin
    val client: KtorRpcClient = ktorClient.rpc {
        url {
            host = "localhost"
            port = 8080
            encodedPath = "pizza"
        }

        rpcConfig {
            serialization {
                json()
            }
        }
    }
```

이 시점에서 표준 설정이 완료되었으며, 해당 문제 도메인에 특화된 기능을 사용할 준비가 되었습니다. 클라이언트를 사용하여 `PizzaShop` 인터페이스의 메서드를 구현하는 클라이언트 프록시 객체를 생성할 수 있습니다.

```kotlin
package com.example

import com.example.model.Pizza
import com.example.model.PizzaShop
import io.ktor.client.*
import io.ktor.http.*
import kotlinx.coroutines.runBlocking
import kotlinx.rpc.withService
import kotlinx.rpc.krpc.serialization.json.json
import kotlinx.rpc.krpc.ktor.client.KtorRpcClient
import kotlinx.rpc.krpc.ktor.client.installKrpc
import kotlinx.rpc.krpc.ktor.client.rpc
import kotlinx.rpc.krpc.ktor.client.rpcConfig
import kotlinx.rpc.krpc.serialization.json.json

fun main() = runBlocking {
    val ktorClient = HttpClient {
        installKrpc {
            serialization { json() }
        }
    }

    val client: KtorRpcClient = ktorClient.rpc {
        url {
            host = "localhost"
            port = 8080
            encodedPath = "pizza"
        }

        rpcConfig {
            serialization {
                json()
            }
        }
    }

    val pizzaShop: PizzaShop = client.withService<PizzaShop>()

    /*
    val receipt = pizzaShop.orderPizza(Pizza("Pepperoni"))
    println("Your pizza cost ${receipt.amount}")
    */

    pizzaShop.orderPizza("AB12", Pizza("Pepperoni"))
    pizzaShop.orderPizza("AB12", Pizza("Hawaiian"))
    pizzaShop.orderPizza("AB12", Pizza("Calzone"))

    pizzaShop.orderPizza("CD34", Pizza("Margherita"))
    pizzaShop.orderPizza("CD34", Pizza("Sicilian"))
    pizzaShop.orderPizza("CD34", Pizza("California"))

    pizzaShop.viewOrders("AB12").collect {
        println("AB12 ordered ${it.name}")
    }

    pizzaShop.viewOrders("CD34").collect {
        println("CD34 ordered ${it.name}")
    }

    ktorClient.close()
}

```

그런 다음 원격 프로시저 호출을 수행하고 결과를 사용할 수 있습니다.

```kotlin
val receipt = pizzaShop.orderPizza(Pizza("Pepperoni"))
println("Your pizza cost ${receipt.amount}")
```

이 시점에서 많은 작업이 처리됩니다. 호출 세부 정보와 모든 매개변수가 메시지로 변환되어 네트워크를 통해 전송된 다음, 반환값이 수신되어 디코딩됩니다.

마지막으로 클라이언트를 닫습니다.

```kotlin
ktorClient.close()
```

### 서버 구현 {id="server-implementation"}

서버 측 구현은 두 부분으로 나뉩니다. 먼저 인터페이스의 구현체를 생성한 다음, 서버 내에서 이를 호스팅합니다.

<procedure id="create-interface">

1. <Path>src/main/kotlin</Path>으로 이동하여 새 <Path>Server.kt</Path> 파일을 생성합니다.
2. <Path>Server.kt</Path>를 열고 다음 인터페이스를 추가합니다.

   ```kotlin
   package com.example
   
   import com.example.model.*
   import io.ktor.server.application.*
   
   class PizzaShopImpl : PizzaShop {
       override suspend fun orderPizza(pizza: Pizza): Receipt {
           return Receipt(7.89)
       }
   }
   ```

   완전한 기능을 갖춘 구현은 아니지만 데모를 구동하기에는 충분합니다.

   구현의 두 번째 부분은 Ktor를 기반으로 구축됩니다.
3. 동일한 파일에 다음 코드를 추가합니다.

   ```kotlin
   fun main() {
       embeddedServer(Netty, port = 8080) {
           module()
           println("Server running")
       }.start(wait = true)
   }
   
   fun Application.module() {
       install(Krpc)
   
       routing {
           rpc("/pizza") {
               rpcConfig {
                   serialization {
                       json()
                   }
               }
   
               registerService<PizzaShop> { PizzaShopImpl() }
           }
       }
   }
   ```

   동작 방식은 다음과 같습니다.

   먼저 구성을 위해 지정된 확장 함수와 함께 Netty를 사용하는 Ktor 서버 인스턴스를 생성합니다.

   ```kotlin
   embeddedServer(Netty, port = 8080) {
       module()
       println("Server running")
   }.start(wait = true)
   ```

   그런 다음 Ktor `Application` 타입을 확장하는 설정 함수를 선언합니다. 이 함수는 `kotlinx.rpc` 플러그인을 설치하고 하나 이상의 라우트를 선언합니다.

   ```kotlin
   fun Application.module() {
       install(Krpc)
   
       routing {
       }
   }
   ```

   라우팅 섹션 내부에서는 Ktor Routing DSL의 `kotlinx.rpc` 확장을 사용하여 엔드포인트를 선언합니다. 클라이언트에서와 마찬가지로 URL을 지정하고 직렬화를 구성합니다. 그러나 이 경우에는 우리 구현체가 해당 URL에서 수신 대기하며 들어오는 요청을 처리합니다.

   ```kotlin
           rpc("/pizza") {
               rpcConfig {
                   serialization {
                       json()
                   }
               }
   
               registerService<PizzaShop> { PizzaShopImpl() }
           }
   ```

   `registerService {}`를 사용하여 인터페이스의 구현체를 RPC 런타임에 제공합니다.

</procedure>

### 종속성 추가 {id="add-dependencies"}

이제 애플리케이션을 실행하는 데 필요한 모든 코드를 작성했지만, 현재로서는 컴파일조차 되지 않습니다.

[`kotlinx.rpc`](https://kotlin.github.io/kotlinx-rpc/get-started.html) 플러그인이 포함된 Ktor Project Generator를 사용할 수도 있지만, 빌드 파일을 수동으로 구성할 수도 있습니다.

<procedure id="configure-build-files">

1. <Path>gradle/libs.versions.toml</Path> 파일을 열거나 생성하고 Kotlin, `kotlinx.rpc`, Logback 버전과 함께 라이브러리 및 플러그인 별칭(alias)을 정의합니다.

   ```toml
   [versions]
   kotlin = "2.4.20"
   kotlinx-rpc = "0.10.4"
   logback = "1.6.3"
   
   [libraries]
   kotlin-test = { module = "org.jetbrains.kotlin:kotlin-test", version.ref = "kotlin" }
   kotlinx-rpc-krpc-client = { module = "org.jetbrains.kotlinx:kotlinx-rpc-krpc-client", version.ref = "kotlinx-rpc" }
   kotlinx-rpc-krpc-ktor-client = { module = "org.jetbrains.kotlinx:kotlinx-rpc-krpc-ktor-client", version.ref = "kotlinx-rpc" }
   kotlinx-rpc-krpc-ktor-server = { module = "org.jetbrains.kotlinx:kotlinx-rpc-krpc-ktor-server", version.ref = "kotlinx-rpc" }
   kotlinx-rpc-krpc-serialization-json = { module = "org.jetbrains.kotlinx:kotlinx-rpc-krpc-serialization-json", version.ref = "kotlinx-rpc" }
   kotlinx-rpc-krpc-server = { module = "org.jetbrains.kotlinx:kotlinx-rpc-krpc-server", version.ref = "kotlinx-rpc" }
   logback-classic = { module = "ch.qos.logback:logback-classic", version.ref = "logback" }
   
   [plugins]
   kotlin-jvm = { id = "org.jetbrains.kotlin.jvm", version.ref = "kotlin" }
   kotlin-serialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
   kotlinx-rpc = { id = "org.jetbrains.kotlinx.rpc.plugin", version.ref = "kotlinx-rpc" }
   
   ```

   Gradle은 빌드 파일의 `libs`를 통해 이러한 별칭을 자동으로 사용할 수 있도록 만듭니다.
2. <Path>settings.gradle.kts</Path> 파일을 열고 Ktor 버전 카탈로그를 가져옵니다.

   ```kotlin
   dependencyResolutionManagement {
       repositories {
           mavenCentral()
       }
       versionCatalogs {
           create("ktorLibs").from("io.ktor:ktor-version-catalog:3.6.1")
       }
   }
   ```

   이 카탈로그는 `ktorLibs`를 통해 Ktor 플러그인과 종속성 별칭을 제공합니다. 카탈로그 좌표의 버전이 이러한 별칭에서 사용하는 Ktor 버전을 결정합니다.
3. <Path>build.gradle.kts</Path> 파일에 다음 플러그인을 추가합니다.

   ```kotlin
   plugins {
       alias(libs.plugins.kotlin.jvm)
       alias(libs.plugins.kotlin.serialization)
       alias(ktorLibs.plugins.ktor)
       alias(libs.plugins.kotlinx.rpc)
   }
   ```

   * `kotlinx.serialization` 플러그인은 Kotlin 객체를 JSON으로 변환하기 위한 헬퍼 타입을 생성하는 데 필요합니다. `kotlinx.serialization`은 리플렉션을 전혀 사용하지 않는다는 점을 기억하세요.
   * Ktor 플러그인은 앱을 모든 종속성과 함께 번들링하는 fat JAR을 빌드하는 데 사용됩니다.
   * RPC 플러그인은 클라이언트 측 스텁을 생성하는 데 필요합니다.
4. 다음 종속성을 추가합니다.

   ```kotlin
   dependencies {
       implementation(ktorLibs.client.cio)
       implementation(libs.kotlinx.rpc.krpc.client)
       implementation(libs.kotlinx.rpc.krpc.ktor.client)
       implementation(ktorLibs.server.netty)
       implementation(libs.kotlinx.rpc.krpc.server)
       implementation(libs.kotlinx.rpc.krpc.ktor.server)
       implementation(libs.kotlinx.rpc.krpc.serialization.json)
       implementation(libs.logback.classic)
       testImplementation(libs.kotlin.test)
   }
   ```

   이렇게 하면 Ktor 클라이언트 및 서버, `kotlinx.rpc` 런타임의 클라이언트 및 서버 부분, 그리고 `kotlinx.rpc`와 `kotlinx-serialization`을 통합하기 위한 라이브러리가 추가됩니다.

   이제 프로젝트를 실행하고 RPC 호출을 시작할 수 있습니다.

</procedure>

### 애플리케이션 실행 {id="run-application"}

애플리케이션을 실행하려면 다음 단계를 따르세요.

<procedure id="run-app-procedure">

1. <Path>Server.kt</Path> 파일로 이동합니다.
2. IntelliJ IDEA에서 `main()` 함수 옆의 실행 버튼(![intelliJ IDEA run icon](intellij_idea_gutter_icon.svg){style="inline" height="16" width="16"})을 클릭하여 애플리케이션을 시작합니다.

   **Run** 도구 창에 다음과 같은 출력이 표시됩니다.

   ![IntelliJ IDEA에서 서버 실행 출력](tutorial_kotlin_rpc_run_server.png){style="block" width="706" border-effect="line"}
3. <Path>Client.kt</Path> 파일로 이동하여 애플리케이션을 실행합니다. 콘솔에 다음과 같은 출력이 표시됩니다.

   ```shell
   Your pizza cost 7.89

   Process finished with exit code 0
   ```

</procedure>

## 예제 확장하기 {id="extend-the-example"}

마지막으로, 향후 개발을 위한 탄탄한 토대를 마련하기 위해 예제 애플리케이션의 복잡도를 한층 높여보겠습니다.

<procedure id="extend-server">

1. <Path>PizzaShop.kt</Path> 파일에서 클라이언트 ID를 포함하도록 `orderPizza` 메서드를 확장하고, 지정된 클라이언트의 모든 대기 중인 주문을 반환하는 `viewOrders()` 메서드를 추가합니다.

   ```kotlin
   package com.example.model
   
   import kotlinx.coroutines.flow.Flow
   import kotlinx.serialization.Serializable
   import kotlinx.rpc.annotations.Rpc
   
   @Rpc
   interface PizzaShop {
       suspend fun orderPizza(clientID: String, pizza: Pizza): Receipt
       fun viewOrders(clientID: String): Flow<Pizza>
   }
   ```

   `List`나 `Set` 대신 `Flow`를 반환하여 코루틴 라이브러리를 활용할 수 있습니다. 이를 통해 클라이언트에 피자 주문을 한 번에 하나씩 스트리밍할 수 있습니다.
2. <Path>Server.kt</Path> 파일로 이동하여 현재 주문을 리스트의 맵(map of lists)에 저장하여 이 기능을 구현합니다.

   ```kotlin
   class PizzaShopImpl : PizzaShop {
       private val openOrders = mutableMapOf<String, MutableList<Pizza>>()
   
       override suspend fun orderPizza(clientID: String, pizza: Pizza): Receipt {
           if(openOrders.containsKey(clientID)) {
               openOrders[clientID]?.add(pizza)
           } else {
               openOrders[clientID] = mutableListOf(pizza)
           }
           return Receipt(3.45)
       }
   
       override fun viewOrders(clientID: String): Flow<Pizza> {
           val orders = openOrders[clientID]
           if (orders != null) {
               return flow {
                   for (order in orders) {
                       emit(order)
                       delay(1000)
                   }
               }
           }
           return flow {}
       }
   }
   ```

   서버는 연결된 각 클라이언트에 대해 새 `PizzaShopImpl` 인스턴스를 생성합니다. 이는 클라이언트의 상태를 격리하여 클라이언트 간의 충돌을 방지합니다.
   > 이 구현은 스레드 안전(thread-safe)하지 않습니다. 동일한 `PizzaShopImpl` 인스턴스가 동시 호출을 수신하면 `openOrders`를 동시에 수정하여 데이터가 손상될 수 있습니다. 프로덕션 코드에서는 스레드 안전한 구조를 사용하세요.
   > 
   {style="warning"}
3. <Path>Client.kt</Path> 파일에서 서로 다른 두 개의 클라이언트 ID를 사용하여 여러 주문을 제출합니다.

   ```kotlin
       val pizzaShop: PizzaShop = client.withService<PizzaShop>()
   
       pizzaShop.orderPizza("AB12", Pizza("Pepperoni"))
       pizzaShop.orderPizza("AB12", Pizza("Hawaiian"))
       pizzaShop.orderPizza("AB12", Pizza("Calzone"))
   
       pizzaShop.orderPizza("CD34", Pizza("Margherita"))
       pizzaShop.orderPizza("CD34", Pizza("Sicilian"))
       pizzaShop.orderPizza("CD34", Pizza("California"))
   ```

   그런 다음 `Coroutines` 라이브러리와 `collect` 메서드를 사용하여 결과를 순회합니다.

   ```kotlin
       pizzaShop.viewOrders("AB12").collect {
           println("AB12 ordered ${it.name}")
       }
   
       pizzaShop.viewOrders("CD34").collect {
           println("CD34 ordered ${it.name}")
       }
   ```
4. 서버와 클라이언트를 실행합니다. 클라이언트를 실행하면 결과가 점진적으로 표시되는 것을 확인할 수 있습니다.

   ![결과가 점진적으로 표시되는 클라이언트 출력](tutorial_kotlin_rpc_run_client.gif){style="block" width="706" border-effect="line"}

</procedure>

작동하는 예제를 만들어 보았으니, 이제 모든 것이 어떻게 동작하는지 더 깊이 파헤쳐 보겠습니다. 특히 Kotlin RPC와 두 가지 주요 대안인 REST 및 gRPC를 비교해 보겠습니다.

## RPC vs. REST {id="rpc-vs-rest"}

RPC의 개념은 [최소 1981년으로 거슬러 올라갈 만큼](https://en.wikipedia.org/wiki/Remote_procedure_call) REST보다 훨씬 오래되었습니다. REST와 비교할 때 RPC 기반 접근 방식은 통일된 인터페이스(예: HTTP 요청 메서드 타입)에 구속되지 않고, 코드 작성이 훨씬 간단하며, 바이너리 메시징 덕분에 더 높은 성능을 낼 수 있습니다.

하지만 REST에는 세 가지 주요 장점이 있습니다.

1. 브라우저의 JavaScript 클라이언트에서 직접 사용할 수 있으므로 단일 페이지 애플리케이션(SPA)의 일부로 활용될 수 있습니다. RPC 프레임워크는 생성된 스텁과 바이너리 메시징에 의존하기 때문에 JavaScript 생태계와 잘 어울리지 않습니다.
2. REST는 기능이 네트워킹을 수반한다는 점을 명확히 드러냅니다. 이는 마틴 파울러(Martin Fowler)가 지적한 [분산 객체 안티패턴(distributed objects antipattern)](https://martinfowler.com/articles/distributed-objects-microservices.html)을 방지하는 데 도움이 됩니다. 이 안티패턴은 로컬 프로시저 호출을 원격으로 변경할 때 발생하는 성능 및 안정성 영향을 고려하지 않고 팀이 객체 지향 설계를 둘 이상의 조각으로 분할할 때 발생합니다.
3. REST API는 생성, 문서화, 모니터링, 디버깅 및 테스트를 비교적 쉽게 만들어 주는 일련의 규칙을 기반으로 구축되었습니다. 이를 지원하는 방대한 도구 생태계가 존재합니다.

이러한 트레이드오프는 Kotlin RPC가 두 가지 시나리오에서 가장 유용함을 의미합니다. 첫째는 [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/)을 사용하는 KMP 클라이언트 내부이고, 둘째는 클라우드에서 서로 협력하는 마이크로서비스 간의 통신입니다. 향후 [Kotlin/Wasm](https://kotlinlang.org/docs/wasm-overview.html)의 발전으로 브라우저 기반 애플리케이션에도 `kotlinx.rpc`를 더 효과적으로 적용할 수 있게 될 것입니다.

## Kotlin RPC vs. Google RPC {id="kotlin-rpc-vs-google-rpc"}

Google RPC(gRPC)는 현재 소프트웨어 업계에서 지배적인 RPC 기술입니다. 언어 중립적인 인터페이스 정의 언어(IDL)를 사용하여 데이터 구조와 메시지 페이로드를 정의하는 프로토콜 버퍼(Protocol Buffers, protobuf)라는 표준을 사용합니다. 이러한 IDL 정의는 다양한 프로그래밍 언어로 변환될 수 있으며 간결하고 효율적인 바이너리 형식을 사용하여 직렬화됩니다. Quarkus 및 Micronaut과 같은 마이크로서비스 프레임워크는 이미 gRPC를 지원합니다.

Kotlin RPC가 gRPC와 경쟁하기는 어려울 것이며, 이는 Kotlin 커뮤니티에도 아무런 이점이 되지 않습니다. 다행히도 경쟁할 계획은 없습니다. 대신 kotlinx.rpc를 gRPC와 호환되고 상호 운용 가능하도록 만드는 것이 목표입니다. kotlinx.rpc 서비스가 네트워킹 프로토콜로 gRPC를 사용하고, kotlinx.rpc 클라이언트가 gRPC 서비스를 호출할 수 있게 될 것입니다. `kotlinx.rpc`는 기본 옵션으로 [자체 kRPC 프로토콜](https://kotlin.github.io/kotlinx-rpc/transport.html)을 사용하지만(현재 예제처럼), 대신 gRPC를 선택하는 것을 막는 제약은 없을 것입니다.

## 다음 단계 {id="next-steps"}

Kotlin RPC는 Kotlin 생태계를 새로운 방향으로 확장하여 서비스를 생성하고 사용하는 데 있어 REST 및 GraphQL에 대한 대안을 제공합니다. 이는 Ktor, 코루틴, `kotlinx-serialization`과 같이 검증된 라이브러리 및 프레임워크를 기반으로 구축되었습니다. Kotlin Multiplatform과 Compose Multiplatform을 활용하려는 팀에게 분산 메시징을 위한 간단하고 효율적인 선택지를 제공할 것입니다.

이번 소개를 통해 관심이 생기셨다면 [공식 `kotlinx.rpc` 문서](https://kotlin.github.io/kotlinx-rpc/get-started.html)와 [예제](https://github.com/Kotlin/kotlinx-rpc/tree/main/samples)를 꼭 확인해 보세요.

`kotlinx.rpc` 라이브러리는 아직 초기 단계이므로 직접 살펴보고 피드백을 공유해 주시기를 권장합니다. 버그 및 기능 요청은 [YouTrack](https://youtrack.jetbrains.com/issues/KRPC)에서 확인할 수 있으며, 일반적인 논의는 [Slack](https://kotlinlang.slack.com/archives/C072YJ3Q91V) ([액세스 요청](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up))에서 진행됩니다.