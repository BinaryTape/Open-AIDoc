[//]: # (title: クライアントプラグイン)

<link-summary>
ロギング、シリアライゼーション、認可などの共通機能を追加するためのクライアントプラグインの使用方法について説明します。
</link-summary>

多くのアプリケーションでは、[ロギング](client-logging.md)、[シリアライゼーション](client-serialization.md)、[認可](client-auth.md)など、コアとなるアプリケーションロジックには含まれない共通の機能が必要になります。Ktorでは、これらの機能はクライアントの*プラグイン*によって提供されます。

## プラグインの依存関係を追加する {id="plugin-dependency"}

一部のプラグインでは、追加の[依存関係](client-dependencies.md)が必要です。例えば、[Logging](client-logging.md)プラグインを使用するには、ビルドスクリプトに`ktor-client-logging`アーティファクトを追加する必要があります。

<var name="artifact_name" value="ktor-client-logging"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"></code-block>
    </TabItem>
</Tabs>

各プラグインのドキュメントに、必要な依存関係が記載されています。

## プラグインをインストールする {id="install"}

プラグインをインストールするには、[クライアント構成ブロック](client-create-and-configure.md#configure-client)内の`install()`関数にプラグインを渡します。

例えば、`Logging`プラグインのインストールは以下のようになります。

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.logging.*

val client = HttpClient(CIO) {
    install(Logging)
}
```

### プラグインをインストールまたは置換する {id="install_or_replace"}

共有のクライアント構成コードなどによって、プラグインが既にインストールされている場合があります。そのような場合、`installOrReplace()`関数を使用してその構成を置き換えることができます。

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*

val client = HttpClient(CIO) {
    installOrReplace(ContentNegotiation) {
        // ...
    }
}
```

この関数は、プラグインが存在しない場合はインストールし、既にインストールされている場合はその構成を置き換えます。

## プラグインを構成する {id="configure_plugin"}

ほとんどのプラグインは、`install`ブロック内で設定可能な構成オプションを提供しています。

例えば、[`Logging`](client-logging.md)プラグインでは、ロガー、ログレベル、およびログメッセージをフィルタリングするための条件を指定できます。

```kotlin
package com.example

import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.logging.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import kotlinx.coroutines.runBlocking

fun main() {
    runBlocking {
        val client = HttpClient(CIO) {
            install(Logging) {
                logger = Logger.DEFAULT
                level = LogLevel.HEADERS
                filter { request ->
                    request.url.host.contains("ktor.io")
                }
                sanitizeHeader { header -> header == HttpHeaders.Authorization }
            }
        }

        val response1: HttpResponse = client.get("https://ktor.io/")
        val response2: HttpResponse = client.get("https://jetbrains.com/")
    }
}
```

## カスタムプラグインを作成する {id="custom"}

既存のプラグインでニーズを満たせない場合は、独自のカスタムクライアントプラグインを作成できます。カスタムプラグインを使用すると、リクエストとレスポンスをインターセプトし、再利用可能な動作を実装できます。

詳細については、[カスタムクライアントプラグイン](client-custom-plugins.md)を参照してください。