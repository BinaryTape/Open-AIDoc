[//]: # (title: 依存関係の解決)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:ktor-server-di</code>
</p>
<var name="example_name" value="server-di"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[依存関係を登録](server-di-dependency-registration.md)した後、DI（依存性注入）コンテナからそれらを解決し、アプリケーションコードに注入できます。

DIコンテナからの明示的な依存関係の解決には、[プロパティ委譲](#property-delegation)または[直接解決](#direct-resolution)のいずれかを使用できます。

### プロパティ委譲の使用 {id="property-delegation"}

プロパティ委譲を使用すると、依存関係は起動時の検証フェーズ中にのみ解決されます。

```kotlin
val service: GreetingService by dependencies
```

### 直接解決の使用 {id="direct-resolution"}

直接解決は、依存関係を即座に返すか、利用可能になるまでサスペンド（中断）します。

```kotlin
val service = dependencies.resolve<GreetingService>()
```

### パラメータの解決 {id="parameter-resolution"}

コンストラクタや関数を解決する際、KtorはDIコンテナを使用してパラメータを解決します。デフォルトでは、パラメータは型によって解決されます。

型ベースの解決では不十分な場合、アノテーションを使用してパラメータを明示的にバインドできます。

#### 名前付き依存関係の使用 {id="resolve-named"}

[指定された名前で登録された](server-di-dependency-registration.md#named-registration)依存関係を解決するには、`@Named` アノテーションを使用します。

```kotlin
fun Application.userRepository(@Named("mongo") database: Database) {
    // "mongo" という名前の依存関係を使用
}
```

#### 設定プロパティの使用 {id="use-configuration-properties"}

アプリケーション設定から値を注入するには、`@Property` アノテーションを使用します。

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

### 非同期の依存関係の解決 {id="async-dependency-resolution"}

非同期読み込みをサポートするために、suspend関数を使用できます。

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

DIプラグインは、すべての依存関係の準備が整うまで、`resolve()` の呼び出しを自動的にサスペンドします。

### アプリケーションモジュールへの依存関係の注入 {id="inject-into-modules"}

モジュール関数にパラメータを指定することで、アプリケーションモジュールに直接依存関係を注入できます。Ktorは型の一致に基づいて、DIコンテナからこれらの依存関係を解決します。

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

注入したい依存関係のパラメータを持つ依存関係プロバイダーとモジュール関数を定義します。これにより、注入された依存関係をモジュール関数内で直接使用できます。

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

## 高度な依存関係の解決 {id="advanced-dependency-resolution"}

### オプションおよびnull許容の依存関係 {id="optional-dependencies"}

オプション（任意）の依存関係を適切に処理するには、null許容型（nullable types）を使用します。

```kotlin
// プロパティ委譲を使用
val config: Config? by dependencies

// 直接解決を使用
val config = dependencies.resolve<Config?>()
```

### 共変ジェネリクス {id="covariant-generics"}

KtorのDIシステムは型の共変性（covariance）をサポートしており、型パラメータが共変である場合、値をそのスーパータイプの1つとして注入できます。これは、コレクションやサブタイプを扱うインターフェースで特に便利です。

```kotlin
dependencies {
  provide<List<String>> { listOf("one", "two") }
}

// 型パラメータの共変性サポートにより機能する
val stringList: List<CharSequence> by dependencies
// これも機能する
val stringCollection: Collection<CharSequence> by dependencies
```

共変性は非ジェネリックなスーパータイプでも機能します。

```kotlin
dependencies {
    provide<BufferedOutputStream> { BufferedOutputStream(System.out) }
}

// BufferedOutputStreamはOutputStreamのサブタイプであるため機能する
val outputStream: OutputStream by dependencies
```

#### 制限事項 {id="limitations"}

DIシステムはジェネリック型の共変性をサポートしていますが、現在のところ型引数のサブタイプをまたぐパラメータ化された型の解決はサポートしていません。つまり、登録されたものよりも具体的または一般的な型を使用して依存関係を取得することはできません。

例えば、次のコードは解決されません。

```kotlin
dependencies {
    provide<Sink<CharSequence>> { CsqSink() }
}

// 解決されない
val charSequenceSink: Sink<String> by dependencies
```