[//]: # (title: マルチプラットフォーム)

<tldr>
<p>
コード例: <a href="https://github.com/ktorio/ktor-samples/tree/main/client-mpp">client-mpp</a>
</p>
</tldr>

<link-summary>
Ktorクライアントはマルチプラットフォームプロジェクトで使用でき、Android、JavaScript、およびNativeプラットフォームをサポートしています。
</link-summary>

[Ktor HTTPクライアント](client-create-and-configure.md)は[マルチプラットフォームプロジェクト](https://kotlinlang.org/docs/multiplatform.html)で使用でき、以下のプラットフォームをサポートしています：
* JVM
* [Android](https://kotlinlang.org/docs/android-overview.html)
* [JavaScript](https://kotlinlang.org/docs/js-overview.html)
* [Native](https://kotlinlang.org/docs/native-overview.html)

## 依存関係の追加 {id="add-dependencies"}
プロジェクトでKtor HTTPクライアントを使用するには、少なくとも2つの依存関係を追加する必要があります：クライアントの依存関係と[エンジン](client-engines.md)の依存関係です。マルチプラットフォームプロジェクトの場合、これらの依存関係を以下のように追加します：
1. 共通コードでKtorクライアントを使用するには、`build.gradle`または`build.gradle.kts`ファイルの`commonMain`ソースセットに`ktor-client-core`への依存関係を追加します：
   <var name="platform_name" value="common"/>
   <var name="artifact_name" value="ktor-client-core"/>
   <Tabs group="languages">
       <TabItem title="Gradle (Kotlin)" group-key="kotlin">
           <code-block lang="Kotlin" code="               val %platform_name%Main by getting {&#10;                   dependencies {&#10;                       implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)&#10;                   }&#10;               }"></code-block>
       </TabItem>
       <TabItem title="Gradle (Groovy)" group-key="groovy">
           <code-block lang="Groovy" code="               %platform_name%Main {&#10;                   dependencies {&#10;                       implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;&#10;                   }&#10;               }"></code-block>
       </TabItem>
   </Tabs>
2. 必要なプラットフォームの[エンジンの依存関係](client-engines.md#dependencies)を、対応するソースセットに追加します。Androidの場合、[Android](client-engines.md#android)エンジンへの依存関係を`androidMain`ソースセットに追加できます：
   <var name="platform_name" value="android"/>
   <var name="artifact_name" value="ktor-client-android"/>
   <Tabs group="languages">
       <TabItem title="Gradle (Kotlin)" group-key="kotlin">
           <code-block lang="Kotlin" code="               val %platform_name%Main by getting {&#10;                   dependencies {&#10;                       implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)&#10;                   }&#10;               }"></code-block>
       </TabItem>
       <TabItem title="Gradle (Groovy)" group-key="groovy">
           <code-block lang="Groovy" code="               %platform_name%Main {&#10;                   dependencies {&#10;                       implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;&#10;                   }&#10;               }"></code-block>
       </TabItem>
   </Tabs>
   
   iOSの場合、`iosMain`に[Darwin](client-engines.md#darwin)エンジンの依存関係を追加する必要があります：
   <var name="platform_name" value="ios"/>
   <var name="artifact_name" value="ktor-client-darwin"/>
   <Tabs group="languages">
       <TabItem title="Gradle (Kotlin)" group-key="kotlin">
           <code-block lang="Kotlin" code="               val %platform_name%Main by getting {&#10;                   dependencies {&#10;                       implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)&#10;                   }&#10;               }"></code-block>
       </TabItem>
       <TabItem title="Gradle (Groovy)" group-key="groovy">
           <code-block lang="Groovy" code="               %platform_name%Main {&#10;                   dependencies {&#10;                       implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;&#10;                   }&#10;               }"></code-block>
       </TabItem>
   </Tabs>
   
   各プラットフォームでサポートされているエンジンを確認するには、[エンジンの依存関係を追加する](client-engines.md#dependencies)を参照してください。

## クライアントの作成 {id="create-client"}
マルチプラットフォームプロジェクトでクライアントを作成するには、プロジェクトの[共通コード](https://kotlinlang.org/docs/mpp-discover-project.html#source-sets)で[HttpClient](https://api.ktor.io/ktor-client-core/io.ktor.client/-http-client/index.html)コンストラクタを呼び出します：

```kotlin
import io.ktor.client.*

val client = HttpClient()
```

このコードスニペットでは、`HttpClient`コンストラクタはパラメータとしてエンジンを受け取りません。クライアントは、[ビルドスクリプトで追加された](#add-dependencies)アーティファクトに応じて、必要なプラットフォーム用のエンジンを選択します。 

特定のプラットフォーム用にエンジン構成を調整する必要がある場合は、対応するエンジンクラスを`HttpClient`コンストラクタの引数として渡し、`engine`メソッドを使用してエンジンを構成します。例：
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

すべてのエンジンタイプの構成方法については、[クライアントエンジン](client-engines.md)から確認できます。

## コード例 {id="code-example"}

[mpp/client-mpp](https://github.com/ktorio/ktor-samples/tree/main/client-mpp)プロジェクトは、マルチプラットフォームアプリケーションでKtorクライアントを使用する方法を示しています。このアプリケーションは、`Android`、`iOS`、`JavaScript`、および`macosX64`の各プラットフォームで動作します。