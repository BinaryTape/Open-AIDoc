[//]: # (title: Ktor 서버의 SSL 및 인증서)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:ktor-network-tls-certificates</code>
</p>
<p>
<b>코드 예제</b>: 
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/ssl-engine-main">ssl-engine-main</a>, 
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/ssl-embedded-server">ssl-embedded-server</a>
</p>
</tldr>

대부분의 경우 Ktor 서비스는 Nginx나 Apache와 같은 역방향 프록시(reverse proxy) 뒤에 배치됩니다.
이는 역방향 프록시 서버가 SSL을 포함한 보안 관련 사항을 처리함을 의미합니다.

필요한 경우, 인증서 경로를 제공하여 Ktor가 직접 SSL을 서비스하도록 구성할 수 있습니다.
Ktor는 인증서 저장 시설로 [Java KeyStore (JKS)](https://docs.oracle.com/javase/8/docs/api/java/security/KeyStore.html)를 사용합니다.
KeyStore에 저장된 인증서를 관리하고 변환하려면 [keytool](https://docs.oracle.com/javase/8/docs/technotes/tools/unix/keytool.html)을 사용할 수 있습니다.
이는 인증 기관(CA)에서 발급한 PEM 인증서를 Ktor에서 지원하는 JKS 형식으로 변환해야 할 때 유용할 수 있습니다.

> _Let's Encrypt_를 사용하여 Ktor에서 `https://` 및 `wss://` 요청을 서비스하기 위한 무료 인증서를 얻을 수 있습니다.

## 자가 서명 인증서 생성 {id="self-signed"}

### 코드에서 인증서 생성 {id="self-signed-code"}

Ktor는 [buildKeyStore](https://api.ktor.io/ktor-network-tls-certificates/io.ktor.network.tls.certificates/build-key-store.html) 함수를 호출하여 테스트 목적으로 자가 서명 인증서(self-signed certificates)를 생성하는 기능을 제공하며, 이 함수는 [KeyStore](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/security/KeyStore.html) 인스턴스를 반환합니다.
이 함수를 사용하려면 빌드 스크립트에 `ktor-network-tls-certificates` 아티팩트를 추가해야 합니다:

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

아래의 코드 스니펫은 인증서를 생성하고 이를 키스토어 파일로 저장하는 방법을 보여줍니다:

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

Ktor는 시작할 때 인증서가 필요하므로, 서버를 시작하기 전에 인증서를 생성해야 합니다.
전체 예제는 여기에서 확인할 수 있습니다: [ssl-embedded-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/ssl-embedded-server).

### keytool을 사용하여 인증서 생성 {id="self-signed-keytool"}

[keytool](https://docs.oracle.com/javase/8/docs/technotes/tools/unix/keytool.html)을 사용하여 자가 서명 인증서를 생성할 수 있습니다:

```Bash
keytool -keystore keystore.jks -alias sampleAlias -genkeypair -keyalg RSA -keysize 4096 -validity 3 -dname 'CN=localhost, OU=ktor, O=ktor, L=Unspecified, ST=Unspecified, C=US'
```

이 명령을 실행한 후, `keytool`은 키스토어 비밀번호를 지정하도록 안내하며 JKS 파일을 생성합니다.

## PEM 인증서를 JKS로 변환 {id="convert-certificate"}

인증 기관에서 PEM 형식으로 인증서를 발급한 경우, [Ktor에서 SSL을 구성](#configure-ssl-ktor)하기 전에 이를 JKS 형식으로 변환해야 합니다.
이를 위해 `openssl` 및 `keytool` 유틸리티를 사용할 수 있습니다.
예를 들어, `key.pem` 파일에 개인 키가 있고 `cert.pem`에 공개 인증서가 있는 경우 변환 프로세스는 다음과 같습니다:

1. 다음 명령어를 사용하여 `openssl`로 PEM을 PKCS12 형식으로 변환합니다:
   ```Bash
   openssl pkcs12 -export -in cert.pem -inkey key.pem -out keystore.p12 -name "sampleAlias"
   ```
   `key.pem`의 패스프레이즈와 `keystore.p12`에 사용할 새 비밀번호를 입력하라는 메시지가 표시됩니다.

2. `keytool`을 사용하여 PKCS12를 JKS 형식으로 변환합니다:
   ```Bash
   keytool -importkeystore -srckeystore keystore.p12 -srcstoretype pkcs12 -destkeystore keystore.jks
   ```
   `keystore.p12` 파일의 비밀번호와 `keystore.jks`에 사용할 새 비밀번호를 입력하라는 메시지가 표시됩니다.
   `keystore.jks` 파일이 생성됩니다.

## Ktor에서 SSL 구성 {id="configure-ssl-ktor"}

Ktor에서 SSL 설정을 지정하는 방법은 [Ktor 서버를 구성](server-create-and-configure.topic)하는 방식(설정 파일을 사용하거나 코드에서 `embeddedServer` 함수를 사용하는 방식)에 따라 달라집니다.

### 설정 파일 {id="config-file"}

서버가 `application.conf` 또는 `application.yaml` [설정 파일](server-configuration-file.topic)에서 구성된 경우, 다음 [속성](server-configuration-file.topic#predefined-properties)을 사용하여 SSL을 활성화할 수 있습니다:

1. `ktor.deployment.sslPort` 속성을 사용하여 SSL 포트를 지정합니다:

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

2. 별도의 `security` 그룹에서 키스토어 설정을 제공합니다:

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

전체 예제는 [ssl-engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/ssl-engine-main)을 참조하세요.

### embeddedServer {id="embedded-server"}

서버를 실행하기 위해 `embeddedServer` 함수를 사용하는 경우, [ApplicationEngine.Configuration](https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-application-engine/-configuration/index.html)에서 [사용자 정의 환경](server-configuration-code.topic#embedded-custom)을 구성하고 [sslConnector](https://api.ktor.io/ktor-server-core/io.ktor.server.engine/ssl-connector.html)를 사용하여 SSL 설정을 제공해야 합니다:

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

전체 예제는 [ssl-embedded-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/ssl-embedded-server)를 참조하세요.