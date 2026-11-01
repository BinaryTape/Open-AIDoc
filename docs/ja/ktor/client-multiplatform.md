[//]: # (title: マルチプラットフォーム)

<tldr>
<p>
コード例: <a href="https://github.com/ktorio/ktor-samples/tree/main/client-mpp">client-mpp</a>
</p>
</tldr>

<link-summary>
Ktor クライアントはマルチプラットフォームプロジェクトで使用でき、Android、JavaScript、および Native プラットフォームをサポートしています。
</link-summary>

[Ktor HTTP クライアント](client-create-and-configure.md)は[マルチプラットフォームプロジェクト](https://kotlinlang.org/docs/multiplatform.html)で使用でき、以下のプラットフォームをサポートしています。
* JVM
* [Android](https://kotlinlang.org/docs/android-overview.html)
* [JavaScript](https://kotlinlang.org/docs/js-overview.html)
* [Native](https://kotlinlang.org/docs/native-overview.html)

## 依存関係の追加 {id="add-dependencies"}
プロジェクトで Ktor HTTP クライアントを使用するには、少なくとも 2 つの依存関係を追加する必要があります。クライアントの依存関係と[エンジン](client-engines.md)の依存関係です。マルチプラットフォームプロジェクトの場合は、以下のようにこれらの依存関係を追加します。
1. 共通コードで Ktor クライアントを使用するには、`build.gradle` または `build.gradle.kts` ファイルの `commonMain` ソースセットに `ktor-client-core` への依存関係を追加します。
   <var name="platform_name" value="common"/>
   <var name="artifact_name" value="ktor-client-core"/>
   <Tabs group="languages">
       <TabItem title="Gradle (Kotlin)" group-key="kotlin">
           <code-block lang="Kotlin" code="               val %platform_name%Main by getting {&#10;                   dependencies {&#10;                       implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)&#10;                   }&#10;               }"/>
       </TabItem>
       <TabItem title="Gradle (Groovy)" group-key="groovy">
           <code-block lang="Groovy" code="               %platform_name%Main {&#10;                   dependencies {&#10;                       implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;&#10;                   }&#10;               }"/>
       </TabItem>
   </Tabs>
2. 必要なプラットフォーム用の[エンジン依存関係](client-engines.md#dependencies)を、対応するソースセットに追加します。Android の場合は、`androidMain` ソースセットに [Android](client-engines.md#android) エンジンの依存関係を追加できます。
   <var name="platform_name" value="android"/>
   <var name="artifact_name" value="ktor-client-android"/>
   <Tabs group="languages">
       <TabItem title="Gradle (Kotlin)" group-key="kotlin">
           <code-block lang="Kotlin" code="               val %platform_name%Main by getting {&#10;                   dependencies {&#10;                       implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)&#10;                   }&#10;               }"/>
       </TabItem>
       <TabItem title="Gradle (Groovy)" group-key="groovy">
           <code-block lang="Groovy" code="               %platform_name%Main {&#10;                   dependencies {&#10;                       implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;&#10;                   }&#10;               }"/>
       </TabItem>
   </Tabs>
   
   iOS の場合は、`iosMain` に [Darwin](client-engines.md#darwin) エンジンの依存関係を追加する必要があります。
   <var name="platform_name" value="ios"/>
   <var name="artifact_name" value="ktor-client-darwin"/>
   <Tabs group="languages">
       <TabItem title="Gradle (Kotlin)" group-key="kotlin">
           <code-block lang="Kotlin" code="               val %platform_name%Main by getting {&#10;                   dependencies {&#10;                       implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)&#10;                   }&#10;               }"/>
       </TabItem>
       <TabItem title="Gradle (Groovy)" group-key="groovy">
           <code-block lang="Groovy" code="               %platform_name%Main {&#10;                   dependencies {&#10;                       implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;&#10;                   }&#10;               }"/>
       </TabItem>
   </Tabs>
   
   各プラットフォームでサポートされているエンジンを確認するには、[エンジン依存関係の追加](client-engines.md#dependencies)を参照してください。

## クライアントの作成 {id="create-client"}
マルチプラットフォームプロジェクトでクライアントを作成するには、プロジェクトの[共通コード](https://kotlinlang.org/docs/mpp-discover-project.html#source-sets)で [HttpClient](https://api.ktor.io/ktor-client-core/io.ktor.client/-http-client/index.html) コンストラクターを呼び出します。

```kotlin
import io.ktor.client.*

val client = HttpClient()
```

このコードスニペットでは、`HttpClient` コンストラクターはパラメーターとしてエンジンを受け取りません。クライアントは、[ビルドスクリプトに追加された](#add-dependencies)アーティファクトに応じて、必要なプラットフォーム用のエンジンを選択します。

特定のプラットフォーム向けにエンジン構成を調整する必要がある場合は、対応するエンジンクラスを `HttpClient` コンストラクターの引数として渡し、`engine` メソッドを使用してエンジンを設定します。例えば以下のようになります。
```kotlin
import io.ktor.client.*
import io.ktor.client.engine.android.*
import java.net.Proxy
import java.net.InetSocketAddress

val client = HttpClient(Android) {
    engine {
        // this: AndroidEngineConfig
        connectTimeout = 100_000
        socketTimeout = 100_000
        proxy = Proxy(Proxy.Type.HTTP, InetSocketAddress("localhost", 8080))
    }
}
```

すべてのエンジンタイプの設定方法については、[クライアントエンジン](client-engines.md)を参照してください。

## コード例 {id="code-example"}

[mpp/client-mpp](https://github.com/ktorio/ktor-samples/tree/main/client-mpp) プロジェクトでは、マルチプラットフォームアプリケーションで Ktor クライアントを使用する方法を示しています。このアプリケーションは、`Android`、`iOS`、`JavaScript`、`macosX64` の各プラットフォームで動作します。