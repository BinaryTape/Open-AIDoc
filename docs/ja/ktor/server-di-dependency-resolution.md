[//]: # (title: 依存関係の解決)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<b>必須の依存関係</b>: <code>io.ktor:ktor-server-di</code>
</p>
<var name="example_name" value="server-di"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[依存関係を登録](server-di-dependency-registration.md)した後、それらを依存関係注入（DI）コンテナから解決し、アプリケーションコードに注入できます。

DIコンテナから依存関係を明示的に解決するには、[プロパティ委譲](#property-delegation)または[直接解決](#direct-resolution)のいずれかを使用できます。

### プロパティ委譲を使用する {id="property-delegation"}

プロパティ委譲を使用する場合、プロパティに初めてアクセスしたときに依存関係が遅延解決されます。

```kotlin
val service: GreetingService by dependencies
```

### 直接解決を使用する {id="direct-resolution"}

直接解決は、依存関係を即座に返すか、利用可能になるまでサスペンドします。

```kotlin
val service = dependencies.resolve<GreetingService>()
```

### パラメータの解決

コンストラクタまたは関数を解決する際、KtorはDIコンテナを使用してパラメータを解決します。デフォルトでは、パラメータは型によって解決されます。

型ベースの解決では不十分な場合、アノテーションを使用して明示的にパラメータをバインドできます。

#### 名前付き依存関係を使用する {id="resolve-named"}

`@Named` アノテーションを使用して、[指定された名前で登録された](server-di-dependency-registration.md#named-registration)依存関係を解決します。

```kotlin
fun Application.userRepository(@Named("mongo") database: Database) {
    // "mongo" という名前の依存関係を使用します
}
```

#### 設定プロパティを使用する

`@Property` アノテーションを使用して、アプリケーション設定から値を注入します。

```kotlin
package com.example

import io.ktor.server.plugins.di.annotations.Property

fun provideDatabase(
    @Property("database.connectionUrl") connectionUrl: String
): Database = PostgresDatabase(connectionUrl)

open class UserRepository(val db: Database)

```

上記の例では、`database.connectionUrl` プロパティがアプリケーション設定から解決されます。

<Tabs>
<TabItem title="application.yaml">

```yaml
database:
  connectionUrl: postgres://localhost:5432/admin
```

</TabItem>
</Tabs>

### 非同期の依存関係解決 {id="async-dependency-resolution"}

非同期読み込みをサポートするために、サスペンド関数を使用できます。

```kotlin
data class EventsConnection(val connected: Boolean)

suspend fun Application.installEvents() {
    val conn: EventsConnection = dependencies.resolve()
    log.info("Events connection ready: $conn")
}

suspend fun Application.loadEventsConnection() {
    dependencies.provide {
        delay(200) // 非同期処理をシミュレート
        EventsConnection(true)
    }
}
```

DIプラグインは、すべての依存関係の準備ができるまで、`resolve()` の呼び出しを自動的にサスペンドします。

### アプリケーションモジュールへの依存関係の注入 {id="inject-into-modules"}

モジュール関数でパラメータを指定することで、アプリケーションモジュールに依存関係を直接注入できます。Ktorは型の一致に基づいて、DIコンテナからこれらの依存関係を解決します。

まず、設定ファイルの `ktor.application.dependencies` グループに依存関係プロバイダーを登録します。

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

注入したい依存関係をパラメータとして持つ依存関係プロバイダーとモジュール関数を定義します。その後、注入された依存関係をモジュール関数内で直接使用できます。

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

## 高度な依存関係解決

### オプションおよび Null 許容の依存関係 {id="optional-dependencies"}

オプションの依存関係を適切に処理するために、Null 許容型を使用します。

```kotlin
// プロパティ委譲を使用する場合
val config: Config? by dependencies

// 直接解決を使用する場合
val config = dependencies.resolve<Config?>()
```

### 共変ジェネリクス {id="covariant-generics"}

KtorのDIシステムは型の共変性（covariance）をサポートしており、型パラメータが共変である場合、値をそのスーパータイプの1つとして注入できます。これは、サブタイプを扱うコレクションやインターフェースにおいて特に便利です。

```kotlin
dependencies {
  provide<List<String>> { listOf("one", "two") }
}

// 型パラメータの共変性サポートにより、これは動作します
val stringList: `List<CharSequence>` by dependencies
// これも動作します
val stringCollection: Collection<CharSequence> by dependencies
```

共変性は、非ジェネリックなスーパータイプでも機能します。

```kotlin
dependencies {
    provide<BufferedOutputStream> { BufferedOutputStream(System.out) }
}

// BufferedOutputStream は OutputStream のサブタイプであるため、これは動作します
val outputStream: OutputStream by dependencies
```

#### 制限事項

DIシステムはジェネリック型の共変性をサポートしていますが、現在は型引数のサブタイプを跨いだパラメータ化された型の解決はサポートしていません。つまり、登録されたものよりも特定の型、あるいはより一般的な型を使用して依存関係を取得することはできません。

例えば、以下のコードは解決されません。

```kotlin
dependencies {
    provide<Sink<CharSequence>> { CsqSink() }
}

// 解決されません
val charSequenceSink: Sink<String> by dependencies