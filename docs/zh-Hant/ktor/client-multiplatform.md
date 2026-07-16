[//]: # (title: 多平台)

<tldr>
<p>
程式碼範例：<a href="https://github.com/ktorio/ktor-samples/tree/main/client-mpp">client-mpp</a>
</p>
</tldr>

<link-summary>
Ktor 用戶端可用於多平台專案，並支援 Android、JavaScript 及 Native 平台。
</link-summary>

[Ktor HTTP 用戶端](client-create-and-configure.md)可用於[多平台專案](https://kotlinlang.org/docs/multiplatform.html)，並支援以下平台：
* JVM
* [Android](https://kotlinlang.org/docs/android-overview.html)
* [JavaScript](https://kotlinlang.org/docs/js-overview.html)
* [Native](https://kotlinlang.org/docs/native-overview.html)

## 新增相依性 {id="add-dependencies"}
要在您的專案中使用 Ktor HTTP 用戶端，您至少需要新增兩個相依性：用戶端相依性與[引擎](client-engines.md)相依性。對於多平台專案，您需要按照以下方式新增這些相依性：
1. 要在通用程式碼中使用 Ktor 用戶端，請將 `ktor-client-core` 相依性新增至 `build.gradle` 或 `build.gradle.kts` 檔案中的 `commonMain` 原始碼集：
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
2. 將所需平台的[引擎相依性](client-engines.md#dependencies)新增至對應的原始碼集。對於 Android，您可以將 [Android](client-engines.md#android) 引擎相依性新增至 `androidMain` 原始碼集：
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
   
   對於 iOS，您需要將 [Darwin](client-engines.md#darwin) 引擎相依性新增至 `iosMain`：
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
   
   若要了解各平台支援哪些引擎，請參閱[新增引擎相依性](client-engines.md#dependencies)。

## 建立用戶端 {id="create-client"}
要在多平台專案中建立用戶端，請在專案的[通用程式碼](https://kotlinlang.org/docs/mpp-discover-project.html#source-sets)中呼叫 [HttpClient](https://api.ktor.io/ktor-client-core/io.ktor.client/-http-client/index.html) 建構函式：

```kotlin
import io.ktor.client.*

val client = HttpClient()
```

在此程式碼片段中，`HttpClient` 建構函式不接受引擎作為參數：用戶端將根據[建置指令碼](#add-dependencies)中新增的構件為所需平台選擇引擎。

如果您需要針對特定平台調整引擎配置，請將對應的引擎類別作為引數傳遞給 `HttpClient` 建構函式，並使用 `engine` 方法配置引擎，例如：
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

您可以從[用戶端引擎](client-engines.md)中了解如何配置所有引擎類型。

## 程式碼範例 {id="code-example"}

[mpp/client-mpp](https://github.com/ktorio/ktor-samples/tree/main/client-mpp) 專案展示了如何在多平台應用程式中使用 Ktor 用戶端。此應用程式可在以下平台執行：`Android`、`iOS`、`JavaScript` 與 `macosX64`。