[//]: # (title: Ktor ServerにおけるSSLと証明書)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:ktor-network-tls-certificates</code>
</p>
<p>
<b>コード例</b>: 
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/ssl-engine-main">ssl-engine-main</a>, 
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/ssl-embedded-server">ssl-embedded-server</a>
</p>
</tldr>

多くの場合、KtorサービスはNginxやApacheなどのリバースプロキシの背後に配置されます。
これは、リバースプロキシサーバーがSSLを含むセキュリティに関する事項を処理することを意味します。

必要に応じて、証明書へのパスを指定することで、Ktorが直接SSLを提供できるように設定することも可能です。
Ktorは、証明書の保存機能として [Java KeyStore (JKS)](https://docs.oracle.com/javase/8/docs/api/java/security/KeyStore.html) を使用します。
KeyStoreに保存された証明書の管理や変換には、[keytool](https://docs.oracle.com/javase/8/docs/technotes/tools/unix/keytool.html) を使用できます。
これは、認証局から発行されたPEM証明書を、KtorがサポートするJKS形式に変換する必要がある場合に便利です。

> _Let's Encrypt_を使用して、Ktorで`https://`および`wss://`リクエストを処理するための無料の証明書を取得できます。

## 自己署名証明書の生成 {id="self-signed"}

### コード内での証明書の生成 {id="self-signed-code"}

Ktorは、[buildKeyStore](https://api.ktor.io/ktor-network-tls-certificates/io.ktor.network.tls.certificates/build-key-store.html) 関数を呼び出すことで、テスト目的の自己署名証明書を生成する機能を提供しています。この関数は [KeyStore](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/security/KeyStore.html) インスタンスを返します。
この関数を使用するには、ビルドスクリプトに `ktor-network-tls-certificates` アーティファクトを追加する必要があります。

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

以下のコードスニペットは、証明書を生成してキーストアファイルに保存する方法を示しています。

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

Ktorは起動時に証明書を必要とするため、サーバーを起動する前に証明書を作成する必要があります。
完全な例はこちらで確認できます: [ssl-embedded-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/ssl-embedded-server)

### keytoolを使用した証明書の生成 {id="self-signed-keytool"}

[keytool](https://docs.oracle.com/javase/8/docs/technotes/tools/unix/keytool.html) を使用して自己署名証明書を生成できます。

```Bash
keytool -keystore keystore.jks -alias sampleAlias -genkeypair -keyalg RSA -keysize 4096 -validity 3 -dname 'CN=localhost, OU=ktor, O=ktor, L=Unspecified, ST=Unspecified, C=US'
```

このコマンドを実行すると、`keytool` はキーストアのパスワードを指定するよう求め、その後JKSファイルを生成します。

## PEM証明書からJKSへの変換 {id="convert-certificate"}

認証局がPEM形式で証明書を発行している場合、[KtorでSSLを設定](#configure-ssl-ktor)する前にJKS形式に変換する必要があります。
これを行うには、`openssl` および `keytool` ユーティリティを使用できます。
例えば、`key.pem` ファイルに秘密鍵があり、`cert.pem` に公開証明書がある場合、変換プロセスは次のようになります。

1. 次のコマンドを使用して、`openssl` でPEMをPKCS12形式に変換します。
   ```Bash
   openssl pkcs12 -export -in cert.pem -inkey key.pem -out keystore.p12 -name "sampleAlias"
   ```
   `key.pem` のパスフレーズと、`keystore.p12` の新しいパスワードの入力を求められます。

2. `keytool` を使用してPKCS12をJKS形式に変換します。
   ```Bash
   keytool -importkeystore -srckeystore keystore.p12 -srcstoretype pkcs12 -destkeystore keystore.jks
   ```
   `keystore.p12` ファイルのパスワードと、`keystore.jks` の新しいパスワードの入力を求められます。
   これで `keystore.jks` が生成されます。

## KtorでのSSL設定 {id="configure-ssl-ktor"}

KtorでのSSL設定の指定は、[Ktorサーバーの設定方法](server-create-and-configure.topic)（設定ファイルを使用するか、`embeddedServer` 関数を使用してコード内で行うか）によって異なります。

### 設定ファイル {id="config-file"}

サーバーが `application.conf` または `application.yaml` [設定ファイル](server-configuration-file.topic)で設定されている場合、以下の [プロパティ](server-configuration-file.topic#predefined-properties) を使用してSSLを有効にできます。

1. `ktor.deployment.sslPort` プロパティを使用してSSLポートを指定します。

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

2. 別の `security` グループでキーストアの設定を提供します。

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

完全な例については、[ssl-engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/ssl-engine-main) を参照してください。

### embeddedServer {id="embedded-server"}

サーバーの実行に `embeddedServer` 関数を使用する場合、[ApplicationEngine.Configuration](https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-application-engine/-configuration/index.html) で [カスタム環境](server-configuration-code.topic#embedded-custom) を設定し、[sslConnector](https://api.ktor.io/ktor-server-core/io.ktor.server.engine/ssl-connector.html) を使用してそこでSSL設定を提供する必要があります。

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

完全な例については、[ssl-embedded-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/ssl-embedded-server) を参照してください。