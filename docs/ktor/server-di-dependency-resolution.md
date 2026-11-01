[//]: # (title: 依赖项解析)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:ktor-server-di</code>
</p>
<var name="example_name" value="server-di"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

在[注册依赖项](server-di-dependency-registration.md)后，你可以从依赖注入 (DI) 容器中解析它们，并将其注入到应用程序代码中。

你可以通过[属性委托](#property-delegation)或[直接解析](#direct-resolution)从 DI 容器中显式解析依赖项。

### 使用属性委托 {id="property-delegation"}

使用属性委托时，依赖项仅在启动验证阶段被解析：

```kotlin
val service: GreetingService by dependencies
```

### 使用直接解析 {id="direct-resolution"}

直接解析会立即返回依赖项，或者挂起直到其可用：

```kotlin
val service = dependencies.resolve<GreetingService>()
```

### 形参解析 {id="parameter-resolution"}

在解析构造函数或函数时，Ktor 会使用 DI 容器解析形参。默认情况下，形参按类型进行解析。

如果基于类型的解析无法满足需求，你可以使用注解来显式绑定形参。

#### 使用命名依赖项 {id="resolve-named"}

使用 `@Named` 注解来解析[以指定名称注册](server-di-dependency-registration.md#named-registration)的依赖项：

```kotlin
fun Application.userRepository(@Named("mongo") database: Database) {
    // 使用名为 "mongo" 的依赖项
}
```

#### 使用配置属性 {id="use-configuration-properties"}

使用 `@Property` 注解从应用程序配置中注入值：

```kotlin
package com.example

import io.ktor.server.plugins.di.annotations.Property

fun provideDatabase(
    @Property("database.connectionUrl") connectionUrl: String
): Database = PostgresDatabase(connectionUrl)

open class UserRepository(val db: Database)

```

在上述示例中，`database.connectionUrl` 属性是从应用程序配置中解析出来的：

<Tabs>
<TabItem title="application.yaml">

```yaml
database:
  connectionUrl: postgres://localhost:5432/admin
```

</TabItem>
</Tabs>

### 异步依赖项解析 {id="async-dependency-resolution"}

为支持异步加载，你可以使用挂起函数：

```kotlin
data class EventsConnection(val connected: Boolean)

suspend fun Application.installEvents() {
    val conn: EventsConnection = dependencies.resolve()
    log.info("Events connection ready: $conn")
}

suspend fun Application.loadEventsConnection() {
    dependencies.provide {
        delay(200) // 模拟异步操作
        EventsConnection(true)
    }
}
```

DI 插件会自动挂起 `resolve()` 调用，直到所有依赖项准备就绪。

### 将依赖项注入到应用程序模块中 {id="inject-into-modules"}

你可以通过在模块函数中指定形参，直接将依赖项注入到应用程序模块中。Ktor 将根据类型匹配从 DI 容器中解析这些依赖项。

首先，在配置文件中的 `ktor.application.dependencies` 组下注册你的依赖项提供程序：

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

定义依赖项提供程序和模块函数，并为要注入的依赖项指定形参。随后你便可以直接在模块函数中使用注入的依赖项：

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

## 高级依赖项解析 {id="advanced-dependency-resolution"}

### 可选与可空依赖项 {id="optional-dependencies"}

使用可空类型从容处理可选依赖项：

```kotlin
// 使用属性委托
val config: Config? by dependencies

// 使用直接解析
val config = dependencies.resolve<Config?>()
```

### 协变泛型 {id="covariant-generics"}

Ktor 的 DI 系统支持类型协变，当类型形参是协变的时，允许将值作为其超类型之一注入。这对于与子类型一起使用的集合和接口特别有用。

```kotlin
dependencies {
  provide<List<String>> { listOf("one", "two") }
}

// 由于支持类型形参协变，这可以正常工作
val stringList: List<CharSequence> by dependencies
// 这也可以正常工作
val stringCollection: Collection<CharSequence> by dependencies
```

协变也适用于非泛型超类型：

```kotlin
dependencies {
    provide<BufferedOutputStream> { BufferedOutputStream(System.out) }
}

// 这可以正常工作，因为 BufferedOutputStream 是 OutputStream 的子类型
val outputStream: OutputStream by dependencies
```

#### 局限性 {id="limitations"}

虽然 DI 系统支持泛型类型的协变，但目前不支持跨类型实参子类型解析参数化类型。这意味着你无法使用比已注册类型更具体或更宽泛的类型来获取依赖项。

例如，以下代码将无法解析：

```kotlin
dependencies {
    provide<Sink<CharSequence>> { CsqSink() }
}

// 无法解析
val charSequenceSink: Sink<String> by dependencies
```