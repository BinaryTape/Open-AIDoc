[//]: # (title: 의존성 해결)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<b>필요한 의존성</b>: <code>io.ktor:ktor-server-di</code>
</p>
<var name="example_name" value="server-di"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[의존성을 등록](server-di-dependency-registration.md)한 후에는 의존성 주입(DI) 컨테이너에서 이를 해결(resolve)하여 애플리케이션 코드에 주입할 수 있습니다.

[프로퍼티 위임](#property-delegation)이나 [직접 해결](#direct-resolution)을 사용하여 DI 컨테이너에서 명시적으로 의존성을 해결할 수 있습니다.

### 프로퍼티 위임 사용 {id="property-delegation"}

프로퍼티 위임을 사용하는 경우, 의존성은 시작 유효성 검증(startup validation) 단계에서만 해결됩니다:

```kotlin
val service: GreetingService by dependencies
```

### 직접 해결 사용 {id="direct-resolution"}

직접 해결은 의존성을 즉시 반환하거나 의존성을 사용할 수 있을 때까지 일시 중단(suspend)합니다:

```kotlin
val service = dependencies.resolve<GreetingService>()
```

### 매개변수 해결 {id="parameter-resolution"}

생성자나 함수를 해결할 때 Ktor는 DI 컨테이너를 사용하여 매개변수를 해결합니다. 매개변수는 기본적으로 타입을 기준으로 해결됩니다.

타입 기반 해결만으로 충분하지 않은 경우, 애너테이션을 사용하여 매개변수를 명시적으로 바인딩할 수 있습니다.

#### 명명된 의존성 사용 {id="resolve-named"}

`@Named` 애너테이션을 사용하여 [지정된 이름으로 등록된](server-di-dependency-registration.md#named-registration) 의존성을 해결할 수 있습니다:

```kotlin
fun Application.userRepository(@Named("mongo") database: Database) {
    // "mongo"라는 이름의 의존성을 사용합니다
}
```

#### 구성 프로퍼티 사용 {id="use-configuration-properties"}

`@Property` 애너테이션을 사용하여 애플리케이션 구성(configuration)에서 값을 주입할 수 있습니다:

```kotlin
package com.example

import io.ktor.server.plugins.di.annotations.Property

fun provideDatabase(
    @Property("database.connectionUrl") connectionUrl: String
): Database = PostgresDatabase(connectionUrl)

open class UserRepository(val db: Database)

```

위 예제에서 `database.connectionUrl` 프로퍼티는 애플리케이션 구성에서 해결됩니다:

<Tabs>
<TabItem title="application.yaml">

```yaml
database:
  connectionUrl: postgres://localhost:5432/admin
```

</TabItem>
</Tabs>

### 비동기 의존성 해결 {id="async-dependency-resolution"}

비동기 로딩을 지원하기 위해 일시 중단 함수(suspending function)를 사용할 수 있습니다:

```kotlin
data class EventsConnection(val connected: Boolean)

suspend fun Application.installEvents() {
    val conn: EventsConnection = dependencies.resolve()
    log.info("Events connection ready: $conn")
}

suspend fun Application.loadEventsConnection() {
    dependencies.provide {
        delay(200) // 비동기 작업 시뮬레이션
        EventsConnection(true)
    }
}
```

DI 플러그인은 모든 의존성이 준비될 때까지 `resolve()` 호출을 자동으로 일시 중단합니다.

### 애플리케이션 모듈에 의존성 주입 {id="inject-into-modules"}

모듈 함수에 매개변수를 지정하여 애플리케이션 모듈에 의존성을 직접 주입할 수 있습니다. Ktor는 타입 일치를 기반으로 DI 컨테이너에서 이러한 의존성을 해결합니다.

먼저 구성 파일의 `ktor.application.dependencies` 그룹에 의존성 프로바이더를 등록합니다:

<Tabs>
<TabItem title="application.yaml">

```yaml
ktor:
  application:
    dependencies:
      - com.example.PrintStreamProviderKt.stdout
    modules:
      - com.example.LoggingKt.logging
```

</TabItem>
</Tabs>

주입하려는 의존성에 대한 매개변수를 갖는 의존성 프로바이더 및 모듈 함수를 정의합니다. 그런 다음 모듈 함수 내에서 주입된 의존성을 직접 사용할 수 있습니다:

<Tabs>
<TabItem title="PrintStreamProvider.kt">

```kotlin
package com.example

import java.io.PrintStream

fun stdout(): () -> PrintStream = { System.out }
```

</TabItem>
<TabItem title="Logging.kt">

```kotlin
package com.example

import io.ktor.server.application.*
import io.ktor.server.plugins.di.dependencies
import java.io.PrintStream

class Logger(private val out: PrintStream) {
     fun log(message: String) {
        out.println("[LOG] $message")
    }
}

fun Application.logging(printStreamProvider: () -> PrintStream) {
    dependencies {
        provide<Logger> {
            Logger(printStreamProvider())
        }
    }
}

```

</TabItem>
</Tabs>

## 고급 의존성 해결 {id="advanced-dependency-resolution"}

### 선택적 및 널 허용 의존성 {id="optional-dependencies"}

선택적 의존성을 유연하게 처리하려면 널 허용(nullable) 타입을 사용합니다:

```kotlin
// 프로퍼티 위임 사용
val config: Config? by dependencies

// 직접 해결 사용
val config = dependencies.resolve<Config?>()
```

### 공변성 제네릭 {id="covariant-generics"}

Ktor의 DI 시스템은 타입 공변성(covariance)을 지원하므로, 타입 매개변수가 공변적인 경우 해당 값을 상위 타입(supertype) 중 하나로 주입할 수 있습니다. 이는 하위 타입과 함께 동작하는 컬렉션 및 인터페이스에 특히 유용합니다.

```kotlin
dependencies {
  provide<List<String>> { listOf("one", "two") }
}

// 타입 매개변수 공변성 지원 덕분에 정상 작동합니다
val stringList: List<CharSequence> by dependencies
// 이 역시 정상 작동합니다
val stringCollection: Collection<CharSequence> by dependencies
```

공변성은 제네릭이 아닌 상위 타입에서도 동작합니다:

```kotlin
dependencies {
    provide<BufferedOutputStream> { BufferedOutputStream(System.out) }
}

// BufferedOutputStream이 OutputStream의 하위 타입이므로 정상 작동합니다
val outputStream: OutputStream by dependencies
```

#### 제한 사항 {id="limitations"}

DI 시스템이 제네릭 타입에 대한 공변성을 지원하지만, 현재 타입 인자의 하위 타입에 걸친 매개변수화된 타입(parameterized types)의 해결은 지원하지 않습니다. 즉, 등록된 것보다 더 구체적이거나 더 일반적인 타입을 사용하여 의존성을 가져올 수 없습니다.

예를 들어, 다음 코드는 해결되지 않습니다:

```kotlin
dependencies {
    provide<Sink<CharSequence>> { CsqSink() }
}

// 해결되지 않음
val charSequenceSink: Sink<String> by dependencies
```