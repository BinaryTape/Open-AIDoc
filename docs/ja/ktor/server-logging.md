[//]: # (title: Ktor Server でのロギング)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="logging"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
Ktor は、さまざまなロギングフレームワーク（Logback や Log4j など）のファサードとして SLF4J API を使用し、アプリケーションイベントをログに記録できるようにします。
</link-summary>

Ktor は、使用するプラットフォームに応じて、アプリケーションをロギングするためのさまざまな手段を提供します。

- JVM では、Ktor はさまざまなロギングフレームワーク（[Logback](https://logback.qos.ch/) や [Log4j](https://logging.apache.org/log4j) など）のファサードとして [SLF4J API](http://www.slf4j.org/) を使用し、アプリケーションイベントをログに記録できるようにします。
ロギングを有効にするには、目的のフレームワークの[依存関係](#add_dependencies)を追加し、そのフレームワーク固有の[設定](#configure-logger)を行う必要があります。
  > クライアントのリクエストをログに記録するために、[CallLogging](server-call-logging.md) プラグインをインストールして設定することもできます。
- [Native サーバー](server-native.md)の場合、Ktor はすべてを標準出力にプリントするロガーを提供します。

## JVM {id="jvm"}
### ロガーの依存関係の追加 {id="add_dependencies"}
ロギングを有効にするには、目的のロギングフレームワークのアーティファクトを含める必要があります。
例えば、Logback には以下の依存関係が必要です。

<var name="group_id" value="ch.qos.logback"/>
<var name="artifact_name" value="logback-classic"/>
<var name="version" value="logback_version"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;%group_id%:%artifact_name%:$%version%&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;%group_id%:%artifact_name%:$%version%&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;%group_id%&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%&lt;/artifactId&gt;&#10;                &lt;version&gt;${%version%}&lt;/version&gt;&#10;            &lt;/dependency&gt;"></code-block>
    </TabItem>
</Tabs>

Log4j を使用するには、`org.apache.logging.log4j:log4j-core` と `org.apache.logging.log4j:log4j-slf4j-impl` アーティファクトを追加する必要があります。

### ロガーの設定 {id="configure-logger"}

選択したロギングフレームワークの設定方法については、そのドキュメントを参照してください。例：
- [Logback configuration](http://logback.qos.ch/manual/configuration.html)
- [Log4j configuration](https://logging.apache.org/log4j/2.x/manual/configuration.html)

例えば、Logback を設定するには、クラスパスのルート（`src/main/resources` など）に `logback.xml` ファイルを配置する必要があります。
以下の例は、ログをコンソールに出力する `STDOUT` アペンダーを使用した Logback 設定のサンプルです。

```xml
<configuration>
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{YYYY-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    <root level="trace">
        <appender-ref ref="STDOUT"/>
    </root>
    <logger name="io.netty" level="INFO"/>
</configuration>
```

ログをファイルに出力したい場合は、`FILE` アペンダーを使用できます。

```xml
<configuration>
    <appender name="FILE" class="ch.qos.logback.core.FileAppender">
        <file>testFile.log</file>
        <append>true</append>
        <encoder>
            <pattern>%d{YYYY-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    <root level="trace">
        <appender-ref ref="FILE"/>
    </root>
    <logger name="io.netty" level="INFO"/>
</configuration>
```

完全な例はこちらにあります：[logging](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/logging)

## Native {id="native"}

Native サーバーのログレベルを設定するには、アプリケーションの[実行](server-run.md)時に `KTOR_LOG_LEVEL` 環境変数に以下のいずれかの値を割り当てます。
- _TRACE_
- _DEBUG_
- _INFO_
- _WARN_
- _ERROR_

例えば、_TRACE_ レベルを有効にすると、一部のルートが実行されない理由を特定するのに役立つ[ルートトレース](server-routing.md#trace_routes)が有効になります。

## コード内でのロガーへのアクセス {id="access_logger"}
Logger インスタンスは、[Logger](https://api.ktor.io/ktor-utils/io.ktor.util.logging/-logger/index.html) インターフェースを実装するクラスによって表されます。[Application.log](https://api.ktor.io/ktor-server-core/io.ktor.server.application/log.html) プロパティを使用して、`Application` 内で Logger インスタンスにアクセスできます。例えば、以下のコードスニペットは、[モジュール](server-modules.md)内でログにメッセージを追加する方法を示しています。

```kotlin
import io.ktor.server.application.*

fun Application.module() {
    log.info("Hello from module!")
}
```

また、`call.application.environment.log` プロパティを使用して、[ApplicationCall](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-call/index.html) から Logger にアクセスすることもできます。

```kotlin
routing {
    get("/api/v1") {
        call.application.environment.log.info("Hello from /api/v1!")
    }
}
```

## プラグインおよびファイルでのロギング {id="plugins_and_files"}

プラグインやファイル内でアプリケーションログを使用することは推奨されません。プラグインやファイルごとに個別のロガーを使用することをお勧めします。これを行うには、任意のロギングライブラリを使用できます。

マルチプラットフォームプロジェクトの場合は、[KtorSimpleLogger](https://api.ktor.io/ktor-utils/io.ktor.util.logging/-ktor-simple-logger.html) クラスを使用できます。

```kotlin
package com.example

import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.util.logging.*

internal val LOGGER = KtorSimpleLogger("com.example.RequestTracePlugin")

val RequestTracePlugin = createRouteScopedPlugin("RequestTracePlugin", { }) {
    onCall { call ->
        LOGGER.trace("Processing call: ${call.request.uri}")
    }
}