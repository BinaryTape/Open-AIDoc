[//]: # (title: 相依性解析)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<b>必要的相依性</b>：<code>io.ktor:ktor-server-di</code>
</p>
<var name="example_name" value="server-di"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

在您[註冊相依性](server-di-dependency-registration.md)之後，您可以從相依性注入 (DI) 容器中解析它們並將其注入應用程式程式碼中。

您可以使用[屬性委託](#property-delegation)或[直接解析](#direct-resolution)從 DI 容器明確地解析相依性。

### 使用屬性委託 {id="property-delegation"}

使用屬性委託時，當屬性首次被存取時，相依性會以延遲方式解析：

```kotlin
val service: GreetingService by dependencies
```

### 使用直接解析 {id="direct-resolution"}

直接解析會立即傳回相依性，或者掛起直到其可用為止：

```kotlin
val service = dependencies.resolve<GreetingService>()
```

### 參數解析

當解析建構函式或函式時，Ktor 會使用 DI 容器解析參數。預設情況下，參數是依型別解析的。

如果基於型別的解析不足，您可以使用註解來明確綁定參數。

#### 使用具名相依性 {id="resolve-named"}

使用 `@Named` 註解來解析[以指定名稱註冊](server-di-dependency-registration.md#named-registration)的相依性：

```kotlin
fun Application.userRepository(@Named("mongo") database: Database) {
    // 使用名為 "mongo" 的相依性
}
```

#### 使用配置屬性

使用 `@Property` 註解從應用程式配置中注入一個值：

```kotlin
package com.example

import io.ktor.server.plugins.di.annotations.Property

fun provideDatabase(
    @Property("database.connectionUrl") connectionUrl: String
): Database = PostgresDatabase(connectionUrl)

open class UserRepository(val db: Database)

```

在上述範例中，`database.connectionUrl` 屬性是從應用程式配置中解析的：

<Tabs>
<TabItem title="application.yaml">

```yaml
database:
  connectionUrl: postgres://localhost:5432/admin
```

</TabItem>
</Tabs>

### 非同步相依性解析 {id="async-dependency-resolution"}

為了支援非同步載入，您可以使用掛起函式：

```kotlin
data class EventsConnection(val connected: Boolean)

suspend fun Application.installEvents() {
    val conn: EventsConnection = dependencies.resolve()
    log.info("Events connection ready: $conn")
}

suspend fun Application.loadEventsConnection() {
    dependencies.provide {
        delay(200) // 模擬非同步工作
        EventsConnection(true)
    }
}
```

DI 外掛程式會自動掛起 `resolve()` 呼叫，直到所有相依性都就緒。

### 將相依性注入應用程式模組 {id="inject-into-modules"}

您可以透過在模組函式中指定參數，將相依性直接注入應用程式模組。Ktor 會根據型別比對從 DI 容器中解析這些相依性。

首先，在配置檔案中的 `ktor.application.dependencies` 群組中註冊您的相依性提供者：

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

為您想要注入的相依性定義具有參數的相依性提供者和模組函式。然後，您可以直接在模組函式中使用注入的相依性：

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

## 進階相依性解析

### 選填與可為 null 的相依性 {id="optional-dependencies"}

使用可為 null 的型別來優雅地處理選填相依性：

```kotlin
// 使用屬性委託
val config: Config? by dependencies

// 使用直接解析
val config = dependencies.resolve<Config?>()
```

### 協變泛型 {id="covariant-generics"}

Ktor 的 DI 系統支援型別協變，當型別參數是協變時，這允許將值作為其超型別之一注入。這對於處理子型別的集合和介面特別有用。

```kotlin
dependencies {
  provide<List<String>> { listOf("one", "two") }
}

// 由於支援型別參數協變，這將可行
val stringList: `List<CharSequence>` by dependencies
// 這也將可行
val stringCollection: Collection<CharSequence> by dependencies
```

協變也適用於非泛型超型別：

```kotlin
dependencies {
    provide<BufferedOutputStream> { BufferedOutputStream(System.out) }
}

// 這可行，因為 BufferedOutputStream 是 OutputStream 的子型別
val outputStream: OutputStream by dependencies
```

#### 限制

雖然 DI 系統支援泛型型別的協變，但目前不支援跨型別引數子型別解析參數化型別。這意味著您無法使用比註冊時更具體或更通用的型別來擷取相依性。

例如，以下程式碼將無法解析：

```kotlin
dependencies {
    provide<Sink<CharSequence>> { CsqSink() }
}

// 將無法解析
val charSequenceSink: Sink<String> by dependencies