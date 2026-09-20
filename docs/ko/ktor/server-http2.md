[//]: # (title: HTTP/2)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<b>코드 예제</b>: <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/http2-netty">http2-netty</a>, <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/http2-jetty">http2-jetty</a>
</p>
</tldr>

[HTTP/2](https://en.wikipedia.org/wiki/HTTP/2)는 HTTP/1.x를 대체하기 위해 설계된 최신 바이너리 멀티플렉싱(multiplexing) 프로토콜입니다.

Ktor는 Jetty 및 Netty 서버 엔진을 통해 HTTP/2를 지원합니다. 그러나 두 엔진 간에는 중요한 차이점이 있으며, 각 엔진마다 추가 설정이 필요합니다. 호스트가 구성되면 HTTP/2 지원이 자동으로 활성화됩니다.

HTTP/2 over TLS의 경우 일반적으로 다음이 필요합니다.

* 자가 서명 인증서일 수 있는 [SSL 인증서](#ssl_certificate).
* 선택한 엔진에서 지원하는 [ALPN 구현체](#apln_implementation).

[HTTP/2 over cleartext (h2c)](#http2-without-tls)는 Netty 엔진에서 사용할 수 있으며 SSL이나 ALPN 설정이 필요하지 않습니다.

## SSL 인증서 구성 {id="ssl_certificate"}

HTTP/2 명세 자체는 TLS를 요구하지 않지만, 브라우저는 일반적으로 암호화된 연결을 통해서만 HTTP/2를 지원합니다. TLS 기반의 HTTP/2를 사용하려면 서버에 SSL 인증서를 구성해야 합니다.

테스트 목적으로 JDK의 `keytool` 유틸리티를 사용하여 자가 서명 인증서를 생성할 수 있습니다.

```bash
keytool -keystore test.jks -genkeypair -alias testkey -keyalg RSA -keysize 4096 -validity 5000 -dname 'CN=localhost, OU=ktor, O=ktor, L=Unspecified, ST=Unspecified, C=US'
```

[`buildKeyStore()`](server-ssl.md) 함수를 사용하여 프로그래밍 방식으로 키스토어(keystore)를 생성할 수도 있습니다.

그런 다음, <Path>application.conf</Path> 또는 <Path>application.yaml</Path> [설정 파일](server-configuration-file.topic)에서 키스토어를 사용하도록 Ktor를 구성합니다.

<Tabs group="config">
<TabItem title="application.conf" group-key="hocon">

```shell
ktor {
    deployment {
        port = 8080
        sslPort = 8443
    }

    application {
        modules = [ com.example.ApplicationKt.main ]
    }

    security {
        ssl {
            keyStore = test.jks
            keyAlias = testkey
            keyStorePassword = foobar
            privateKeyPassword = foobar
        }
    }
}

```

</TabItem>
<TabItem title="application.yaml" group-key="yaml">

```yaml
ktor:
    deployment:
        port: 8080
        sslPort: 8443
    application:
        modules:
            - com.example.ApplicationKt.main

    security:
        ssl:
            keyStore: test.jks
            keyAlias: testkey
            keyStorePassword: foobar
            privateKeyPassword: foobar
```

</TabItem>
</Tabs>

## ALPN 구성 {id="apln_implementation"}

HTTP/2 over TLS는 클라이언트와 서버 간의 프로토콜 협상을 위해 [ALPN (Application-Layer Protocol Negotiation)](https://en.wikipedia.org/wiki/Application-Layer_Protocol_Negotiation)을 사용합니다. ALPN 설정은 서버 엔진에 따라 다릅니다.

### Jetty {id="jetty"}

Jetty 엔진은 추가적인 Ktor 설정 없이도 ALPN을 처리합니다.
Jetty에서 HTTP/2 over TLS를 사용하려면 다음 단계를 따릅니다.
1. Jetty 엔진으로 [서버를 생성](server-engines.md#choose-create-server)합니다.
2. [SSL 인증서를 구성](#ssl_certificate)합니다.
3. `sslPort`를 설정합니다.

> Jetty를 사용한 HTTP/2의 전체 실행 예제는 [http2-jetty](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/http2-jetty)를 참조하십시오.
>
{style="tip"}

### Netty {id="netty"}

Netty에서 HTTP/2 over TLS를 사용하려면 [Netty `tcnative`](https://netty.io/wiki/forked-tomcat-native.html) OpenSSL 바인딩을 추가해야 합니다.

다음 예제는 <Path>build.gradle.kts</Path> 파일에 정적으로 링크된 BoringSSL 구현체를 추가하는 방법을 보여줍니다.

```kotlin
val osName = System.getProperty("os.name").lowercase()
val tcnative_classifier = when {
    osName.contains("win") -> "windows-x86_64"
    osName.contains("linux") -> "linux-x86_64"
    osName.contains("mac") -> "osx-x86_64"
    else -> null
}

dependencies {
    if (tcnative_classifier != null) {
        implementation("io.netty:netty-tcnative-boringssl-static:$tcnative_version:$tcnative_classifier")
    } else {
        implementation("io.netty:netty-tcnative-boringssl-static:$tcnative_version")
    }
}
```

`tc.native.classifier`는 `linux-x86_64`, `osx-x86_64`, 또는 `windows-x86_64` 중 하나일 수 있습니다.

> Netty를 사용한 HTTP/2의 전체 실행 예제는 [http2-netty](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/http2-netty)를 참조하십시오.
> 
{style="tip"}

## TLS 없는 HTTP/2 {id="http2-without-tls"}

Netty 엔진은 TLS 없이도 HTTP/2 통신을 지원하는 [HTTP/2 over cleartext (h2c)](https://httpwg.org/specs/rfc7540.html#discover-http)를 지원합니다.
이는 암호화가 필요하지 않은 사설 네트워크 환경에서 유용할 수 있습니다.

클라이언트는 h2c를 사용하여 직접 연결하거나 HTTP/1.1 연결을 HTTP/2로 업그레이드할 수 있습니다.

h2c를 활성화하려면 엔진 설정에서 `enableH2c`와 `enableHttp2` 옵션을 모두 `true`로 설정하십시오.

```kotlin
embeddedServer(Netty, configure = {
    connector {
        port = 8080
    }
    enableHttp2 = true
    enableH2c = true
})
```

동일한 서버에서 h2c와 HTTP/2 over TLS를 동시에 활성화할 수도 있습니다. 일반 텍스트(Cleartext) 커넥터는 h2c 연결을 수락하고, SSL 커넥터는 HTTP/2 over TLS를 사용합니다.