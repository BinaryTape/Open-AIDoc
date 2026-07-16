[//]: # (title: Ktor Server 中的 SSL 与证书)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:ktor-network-tls-certificates</code>
</p>
<p>
<b>代码示例</b>： 
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/ssl-engine-main">ssl-engine-main</a>, 
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/ssl-embedded-server">ssl-embedded-server</a>
</p>
</tldr>

在大多数情况下，您的 Ktor 服务会部署在 Nginx 或 Apache 等反向代理之后。
这意味着反向代理服务器负责处理安全事务，包括 SSL。

如有必要，您可以通过提供证书路径将 Ktor 配置为直接提供 SSL 服务。
Ktor 使用 [Java KeyStore (JKS)](https://docs.oracle.com/javase/8/docs/api/java/security/KeyStore.html) 作为证书的存储设施。
您可以使用 [keytool](https://docs.oracle.com/javase/8/docs/technotes/tools/unix/keytool.html) 来转换和管理存储在密钥库中的证书。
如果您需要将证书颁发机构颁发的 PEM 证书转换为 Ktor 支持的 JKS 格式，这可能会非常有用。

> 您可以使用 _Let's Encrypt_ 获取免费证书，以便在 Ktor 中处理 `https://` 和 `wss://` 请求。

## 生成自签名证书 {id="self-signed"}

### 在代码中生成证书 {id="self-signed-code"}

Ktor 提供了通过调用 [buildKeyStore](https://api.ktor.io/ktor-network-tls-certificates/io.ktor.network.tls.certificates/build-key-store.html) 函数生成用于测试目的的自签名证书的能力，该函数会返回一个 [KeyStore](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/security/KeyStore.html) 实例。
要使用此函数，您需要在构建脚本中添加 `ktor-network-tls-certificates` 构件：

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

下面的代码片段展示了如何生成证书并将其保存到密钥库文件中：

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

由于 Ktor 在启动时需要证书，因此您必须在启动服务器之前创建证书。
您可以在此处找到完整的示例：[ssl-embedded-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/ssl-embedded-server)。

### 使用 keytool 生成证书 {id="self-signed-keytool"}

您可以使用 [keytool](https://docs.oracle.com/javase/8/docs/technotes/tools/unix/keytool.html) 生成自签名证书：

```Bash
keytool -keystore keystore.jks -alias sampleAlias -genkeypair -keyalg RSA -keysize 4096 -validity 3 -dname 'CN=localhost, OU=ktor, O=ktor, L=Unspecified, ST=Unspecified, C=US'
```

执行此命令后，`keytool` 会提示您指定密钥库密码，然后生成一个 JKS 文件。

## 将 PEM 证书转换为 JKS {id="convert-certificate"}

如果您的证书颁发机构以 PEM 格式颁发证书，您需要在[在 Ktor 中配置 SSL](#configure-ssl-ktor) 之前将其转换为 JKS 格式。
您可以使用 `openssl` 和 `keytool` 工具来完成此操作。
例如，如果您的私钥位于 `key.pem` 文件中，公钥证书位于 `cert.pem` 中，转换过程如下所示：

1. 使用 `openssl` 通过以下命令将 PEM 转换为 PKCS12 格式：
   ```Bash
   openssl pkcs12 -export -in cert.pem -inkey key.pem -out keystore.p12 -name "sampleAlias"
   ```
   系统将提示您输入 `key.pem` 的密码短语以及 `keystore.p12` 的新密码。

2. 使用 `keytool` 将 PKCS12 转换为 JKS 格式：
   ```Bash
   keytool -importkeystore -srckeystore keystore.p12 -srcstoretype pkcs12 -destkeystore keystore.jks
   ```
   系统将提示您输入 `keystore.p12` 文件的密码以及 `keystore.jks` 的新密码。
   随后将生成 `keystore.jks`。

## 在 Ktor 中配置 SSL {id="configure-ssl-ktor"}

在 Ktor 中指定 SSL 设置取决于[配置 Ktor 服务器](server-create-and-configure.topic)的方式：是通过配置文件配置，还是在代码中使用 `embeddedServer` 函数配置。

### 配置文件 {id="config-file"}

如果您的服务器是在 `application.conf` 或 `application.yaml` [配置文件](server-configuration-file.topic)中配置的，您可以使用以下[属性](server-configuration-file.topic#predefined-properties)启用 SSL：

1. 使用 `ktor.deployment.sslPort` 属性指定 SSL 端口：

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

2. 在单独的 `security` 组中提供密钥库设置：

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

有关完整示例，请参阅 [ssl-engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/ssl-engine-main)。

### embeddedServer {id="embedded-server"}

如果您使用 `embeddedServer` 函数运行服务器，则需要在 [ApplicationEngine.Configuration](https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-application-engine/-configuration/index.html) 中配置[自定义环境](server-configuration-code.topic#embedded-custom)，并使用 [sslConnector](https://api.ktor.io/ktor-server-core/io.ktor.server.engine/ssl-connector.html) 在该处提供 SSL 设置：

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

有关完整示例，请参阅 [ssl-embedded-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/ssl-embedded-server)。