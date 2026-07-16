[//]: # (title: Ktor 伺服器中的 SSL 與憑證)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:ktor-network-tls-certificates</code>
</p>
<p>
<b>程式碼範例</b>： 
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/ssl-engine-main">ssl-engine-main</a>, 
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/ssl-embedded-server">ssl-embedded-server</a>
</p>
</tldr>

在大多數情況下，您的 Ktor 服務會置於反向代理（例如 Nginx 或 Apache）之後。
這意味著反向代理伺服器會處理安全考量，包括 SSL。

如果有需要，您可以透過提供憑證路徑，配置 Ktor 直接提供 SSL 服務。
Ktor 使用 [Java KeyStore (JKS)](https://docs.oracle.com/javase/8/docs/api/java/security/KeyStore.html) 作為憑證的儲存設施。
您可以使用 [keytool](https://docs.oracle.com/javase/8/docs/technotes/tools/unix/keytool.html) 來轉換與管理儲存在 KeyStore 中的憑證。
如果您需要將憑證授權單位發行的 PEM 憑證轉換為 Ktor 支援的 JKS 格式，這會非常有用。

> 您可以使用 _Let's Encrypt_ 取得免費憑證，以透過 Ktor 處理 `https://` 與 `wss://` 請求。

## 產生自簽章憑證 {id="self-signed"}

### 在程式碼中產生憑證 {id="self-signed-code"}

Ktor 提供了在測試時產生自簽章憑證的能力，透過呼叫 [buildKeyStore](https://api.ktor.io/ktor-network-tls-certificates/io.ktor.network.tls.certificates/build-key-store.html) 函式，該函式會回傳一個 [KeyStore](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/security/KeyStore.html) 執行個體。
要使用此函式，您需要在建置指令碼中新增 `ktor-network-tls-certificates` 構件：

<var name="artifact_name" value="ktor-network-tls-certificates"/>
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

下方的程式碼片段展示了如何產生憑證並將其儲存到 keystore 檔案中：

```kotlin
private fun ApplicationEngine.Configuration.envConfig() {

    val keyStoreFile = File("build/keystore.jks")
    val keyStore = buildKeyStore {
        certificate("sampleAlias") {
            password = "foobar"
            domains = listOf("127.0.0.1", "0.0.0.0", "localhost")
        }
    }
    keyStore.saveToFile(keyStoreFile, "123456")
}
```

由於 Ktor 在啟動時需要憑證，因此您必須在啟動伺服器之前建立憑證。
您可以在此處找到完整的範例：[ssl-embedded-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/ssl-embedded-server)。

### 使用 keytool 產生憑證 {id="self-signed-keytool"}

您可以使用 [keytool](https://docs.oracle.com/javase/8/docs/technotes/tools/unix/keytool.html) 來產生自簽章憑證：

```Bash
keytool -keystore keystore.jks -alias sampleAlias -genkeypair -keyalg RSA -keysize 4096 -validity 3 -dname 'CN=localhost, OU=ktor, O=ktor, L=Unspecified, ST=Unspecified, C=US'
```

執行此指令後，`keytool` 會建議您指定一個 keystore 密碼，接著便會產生一個 JKS 檔案。

## 將 PEM 憑證轉換為 JKS {id="convert-certificate"}

如果您的憑證授權單位發行的是 PEM 格式的憑證，則在 [於 Ktor 中配置 SSL](#configure-ssl-ktor) 之前，您需要將其轉換為 JKS 格式。
您可以使用 `openssl` 和 `keytool` 工具來完成此操作。
例如，如果您在 `key.pem` 檔案中有私鑰，且在 `cert.pem` 中有公開憑證，則轉換過程可能如下所示：

1. 使用 `openssl` 透過以下指令將 PEM 轉換為 PKCS12 格式：
   ```Bash
   openssl pkcs12 -export -in cert.pem -inkey key.pem -out keystore.p12 -name "sampleAlias"
   ```
   系統會提示您輸入 `key.pem` 的密碼短語以及 `keystore.p12` 的新密碼。

2. 使用 `keytool` 將 PKCS12 轉換為 JKS 格式：
   ```Bash
   keytool -importkeystore -srckeystore keystore.p12 -srcstoretype pkcs12 -destkeystore keystore.jks
   ```
   系統會提示您輸入 `keystore.p12` 檔案的密碼以及 `keystore.jks` 的新密碼。
   隨後將產生 `keystore.jks`。

## 於 Ktor 中配置 SSL {id="configure-ssl-ktor"}

在 Ktor 中指定 SSL 設定取決於 [配置 Ktor 伺服器](server-create-and-configure.topic) 的方式：使用配置檔案或在程式碼中使用 `embeddedServer` 函式。

### 配置檔案 {id="config-file"}

如果您的伺服器是在 `application.conf` 或 `application.yaml` [配置檔案](server-configuration-file.topic) 中配置的，您可以使用以下 [屬性](server-configuration-file.topic#predefined-properties) 來啟用 SSL：

1. 使用 `ktor.deployment.sslPort` 屬性指定 SSL 連接埠：

   <Tabs group="config">
   <TabItem title="application.conf" group-key="hocon">

   ```shell
   ktor {
       deployment {
           sslPort = 8443
       }
   }
   ```

   </TabItem>
   <TabItem title="application.yaml" group-key="yaml">

   ```yaml
   ktor:
       deployment:
           sslPort: 8443
   ```

   </TabItem>
   </Tabs>

2. 在獨立的 `security` 群組中提供 keystore 設定：

   <Tabs group="config">
   <TabItem title="application.conf" group-key="hocon">

   ```shell
   ktor {
       security {
           ssl {
               keyStore = keystore.jks
               keyAlias = sampleAlias
               keyStorePassword = foobar
               privateKeyPassword = foobar
               trustStore = truststore.jks
               trustStorePassword = foobar
               enabledProtocols = ["TLSv1.2", "TLSv1.3"]
           }
       }
   }
   ```

   </TabItem>
   <TabItem title="application.yaml" group-key="yaml">

   ```yaml
   ktor:
       security:
           ssl:
               keyStore: keystore.jks
               keyAlias: sampleAlias
               keyStorePassword: foobar
               privateKeyPassword: foobar
               trustStore: truststore.jks
               trustStorePassword: foobar
               enabledProtocols: ["TLSv1.2", "TLSv1.3"]
   ```

   </TabItem>
   </Tabs>

如需完整範例，請參閱 [ssl-engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/ssl-engine-main)。

### embeddedServer {id="embedded-server"}

如果您使用 `embeddedServer` 函式來執行伺服器，您需要在 [ApplicationEngine.Configuration](https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-application-engine/-configuration/index.html) 中配置 [自訂環境](server-configuration-code.topic#embedded-custom)，並使用 [sslConnector](https://api.ktor.io/ktor-server-core/io.ktor.server.engine/ssl-connector.html) 在該處提供 SSL 設定：

```kotlin
import io.ktor.network.tls.certificates.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.slf4j.*
import java.io.*
import java.security.KeyStore

fun main() {
    embeddedServer(Netty, applicationEnvironment { log = LoggerFactory.getLogger("ktor.application") }, {
        envConfig()
    }, module = Application::module).start(wait = true)
}

private fun ApplicationEngine.Configuration.envConfig() {

    val keyStoreFile = File("build/keystore.jks")
    val keyStore = buildKeyStore {
        certificate("sampleAlias") {
            password = "foobar"
            domains = listOf("127.0.0.1", "0.0.0.0", "localhost")
        }
    }
    keyStore.saveToFile(keyStoreFile, "123456")

    connector {
        port = 8080
    }
    sslConnector(
        keyStore = keyStore,
        keyAlias = "sampleAlias",
        keyStorePassword = { "123456".toCharArray() },
        privateKeyPassword = { "foobar".toCharArray() }) {
        port = 8443
        keyStorePath = keyStoreFile
    }
}
```

如需完整範例，請參閱 [ssl-embedded-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/ssl-embedded-server)。