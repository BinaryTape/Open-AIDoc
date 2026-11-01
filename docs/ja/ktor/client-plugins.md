[//]: # (title: クライアントプラグイン)

<link-summary>
クライアントプラグインを使用して、ロギング、シリアライズ、認可などの共通機能を追加する方法を学びます。
</link-summary>

多くのアプリケーションでは、[ロギング](client-logging.md)、[シリアライズ](client-serialization.md)、[認可](client-auth.md)など、アプリケーションのコアロジックには含まれない共通機能が必要になります。Ktorでは、このような機能はクライアント*プラグイン*によって提供されます。

## プラグインの依存関係を追加する {id="plugin-dependency"}

一部のプラグインには追加の[依存関係](client-dependencies.md)が必要です。たとえば、[Logging](client-logging.md) プラグインを使用するには、ビルドスクリプトに `ktor-client-logging` アーティファクトを追加する必要があります。

<var name="artifact_name" value="ktor-client-logging"/>
<var name="ktor_version_catalog_name" value="ktorLibs.client.logging"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上記のコードスニペットでは、Ktorの依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">Ktor バージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上記のコードスニペットでは、Ktorの依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">Ktor バージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

各プラグインのドキュメントには、必要な依存関係が記載されています。

## プラグインをインストールする {id="install"}

プラグインをインストールするには、[クライアント設定ブロック](client-create-and-configure.md#configure-client)内でそれを `install()` 関数に渡します。

たとえば、`Logging` プラグインのインストールは次のようになります。

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.logging.*

val client = HttpClient(CIO) {
    install(Logging)
}
```

### プラグインをインストールまたは置換する {id="install_or_replace"}

共有クライアント設定コードなどによって、プラグインがすでにインストールされている場合があります。そのような場合、`installOrReplace()` 関数を使用してその設定を置き換えることができます。

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*

val client = HttpClient(CIO) {
    installOrReplace(ContentNegotiation) {
        // ...
    }
}
```

この関数は、プラグインが存在しない場合はインストールし、すでにインストールされている場合は既存の設定を置き換えます。

## プラグインを設定する {id="configure_plugin"}

ほとんどのプラグインには、`install` ブロック内で設定できるオプションが用意されています。

たとえば、[`Logging`](client-logging.md) プラグインでは、ロガー、ログレベル、およびログメッセージをフィルタリングする条件を指定できます。

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

既存のプラグインでニーズを満たせない場合は、独自のカスタムクライアントプラグインを作成できます。カスタムプラグインを使用すると、リクエストやレスポンスをインターセプトし、再利用可能な動作を実装できます。

詳細については、[カスタムクライアントプラグイン](client-custom-plugins.md)を参照してください。