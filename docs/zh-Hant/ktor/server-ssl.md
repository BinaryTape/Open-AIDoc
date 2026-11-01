[//]: # (title: Ktor Server 中的 SSL 與憑證)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<tldr>
<p>
<b>必要相依性</b>: <code>io.ktor:ktor-network-tls-certificates</code>
</p>
<p>
<b>程式碼範例</b>: 
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/ssl-engine-main">ssl-engine-main</a>, 
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/ssl-embedded-server">ssl-embedded-server</a>
</p>
</tldr>

在大多數情況下，您的 Ktor 服務會部署在 Nginx 或 Apache 等反向代理之後。
這代表反向代理伺服器會處理安全性問題，包括 SSL。

如有需要，您可以透過提供憑證路徑，將 Ktor 配置為直接提供 SSL 服務。
Ktor 使用 [Java KeyStore (JKS)](https://docs.oracle.com/javase/8/docs/api/java/security/KeyStore.html) 作為憑證的儲存機制。
您可以使用 [keytool](https://docs.oracle.com/javase/8/docs/technotes/tools/unix/keytool.html) 來轉換和管理儲存在 KeyStore 中的憑證。
如果您需要將憑證授權單位所核發的 PEM 憑證轉換為 Ktor 支援的 JKS 格式，這將會非常實用。

> 您可以使用 _Let's Encrypt_ 取得免費憑證，以透過 Ktor 處理 `https://` 與 `wss://` 請求。

## 產生自簽憑證 {id="self-signed"}

### 在程式碼中產生憑證 {id="self-signed-code"}

Ktor 提供了透過呼叫 [buildKeyStore](https://api.ktor.io/ktor-network-tls-certificates/io.ktor.network.tls.certificates/build-key-store.html) 函式來產生測試用自簽憑證的功能，該函式會傳回一個 [KeyStore](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/security/KeyStore.html) 執行個體。
若要使用此函式，您需要在建置指令碼中新增 `ktor-network-tls-certificates` 構件：

<var name="artifact_name" value="ktor-network-tls-certificates"/>
<var name="ktor_version_catalog_name" value="ktorLibs.network.tls.certificates"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">Ktor 版本目錄 (version catalog)</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">Ktor 版本目錄 (version catalog)</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

以下程式碼片段展示如何產生憑證並將其儲存至金鑰庫檔案：

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
您可以在此處找到完整範例：[ssl-embedded-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/ssl-embedded-server)。

### 使用 keytool 產生憑證 {id="self-signed-keytool"}

您可以使用 [keytool](https://docs.oracle.com/javase/8/docs/technotes/tools/unix/keytool.html) 產生自簽憑證：

```Bash
keytool -keystore keystore.jks -alias sampleAlias -genkeypair -keyalg RSA -keysize 4096 -validity 3 -dname 'CN=localhost, OU=ktor, O=ktor, L=Unspecified, ST=Unspecified, C=US'
```

執行此指令後，`keytool` 會提示您指定金鑰庫密碼，隨後產生 JKS 檔案。

## 將 PEM 憑證轉換為 JKS {id="convert-certificate"}

如果您的憑證授權單位核發的是 PEM 格式的憑證，您需要在[在 Ktor 中設定 SSL](#configure-ssl-ktor) 之前將其轉換為 JKS 格式。
您可以使用 `openssl` 和 `keytool` 工具來執行此操作。
例如，如果您的私密金鑰位於 `key.pem` 檔案中，而公開憑證位於 `cert.pem` 中，轉換流程可能如下所示：

1. 使用以下指令透過 `openssl` 將 PEM 轉換為 PKCS12 格式：
   ```Bash
   openssl pkcs12 -export -in cert.pem -inkey key.pem -out keystore.p12 -name "sampleAlias"
   ```
   系統將提示您輸入 `key.pem` 的密碼短語 (passphrase) 以及 `keystore.p12` 的新密碼。

2. 使用 `keytool` 將 PKCS12 轉換為 JKS 格式：
   ```Bash
   keytool -importkeystore -srckeystore keystore.p12 -srcstoretype pkcs12 -destkeystore keystore.jks
   ```
   系統將提示您輸入 `keystore.p12` 檔案的密碼以及 `keystore.jks` 的新密碼。
   隨後將產生 `keystore.jks` 檔案。

## 在 Ktor 中設定 SSL {id="configure-ssl-ktor"}

在 Ktor 中指定 SSL 設定取決於[設定 Ktor 伺服器](server-create-and-configure.topic)的方式：透過使用設定檔，或是在程式碼中使用 `embeddedServer` 函式。

### 設定檔 {id="config-file"}

如果您的伺服器是在 `application.conf` 或 `application.yaml` [設定檔](server-configuration-file.topic)中設定，您可以使用以下[屬性](server-configuration-file.topic#predefined-properties)來啟用 SSL：

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

2. 在獨立的 `security` 群組中提供金鑰庫設定：

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
               keyAlias = sampleAlias
               keyStorePassword: foobar
               privateKeyPassword: foobar
               trustStore: truststore.jks
               trustStorePassword: foobar
               enabledProtocols: ["TLSv1.2", "TLSv1.3"]
   ```

   </TabItem>
   </Tabs>

若要查看完整範例，請參閱 [ssl-engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/ssl-engine-main)。

### embeddedServer {id="embedded-server"}

如果您使用 `embeddedServer` 函式來執行伺服器，您需要在 [ApplicationEngine.Configuration](https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-application-engine/-configuration/index.html) 中設定[自訂環境](server-configuration-code.topic#embedded-custom)，並在該處使用 [sslConnector](https://api.ktor.io/ktor-server-core/io.ktor.server.engine/ssl-connector.html) 提供 SSL 設定：

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

若要查看完整範例，請參閱 [ssl-embedded-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/ssl-embedded-server)。