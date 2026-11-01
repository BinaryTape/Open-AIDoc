[//]: # (title: Ktor Client의 SSL)

<show-structure for="chapter" depth="3"/>
<primary-label ref="client-plugin"/>

<tldr>
<var name="example_name" value="client-ssl-config"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

Ktor 클라이언트에서 SSL을 구성하려면 클라이언트에서 사용하는 [엔진 설정](client-engines.md#configure)을 커스터마이즈해야 합니다.
이 문서에서는 [JVM](client-engines.md#jvm) 및 [Android](client-engines.md#jvm-android)를 타깃으로 하는 엔진에 SSL 인증서를 추가하는 방법을 알아봅니다.

> Ktor API를 사용하여 자체 서명 인증서를 생성하는 방법은 [자체 서명 인증서 생성](server-ssl.md#self-signed)을 참조하세요.

## SSL 설정 로드 {id="ssl-settings"}

이 문서에서 Ktor 클라이언트는 서버용으로 생성된 기존 KeyStore 파일(`keystore.jks`)에서 로드한 인증서를 사용합니다.
각 엔진마다 SSL을 구성하는 데 사용하는 [JSSE API](https://docs.oracle.com/en/java/javase/17/security/java-secure-socket-extension-jsse-reference-guide.html#GUID-B7AB25FA-7F0C-4EFA-A827-813B2CE7FBDC)가 다르므로(예: Apache의 경우 `SSLContext`, Jetty의 경우 `TrustManager`), 각 엔진에 맞는 SSL 구성을 가져올 수 있어야 합니다. 아래 코드 스니펫은 기존 KeyStore 파일(`keystore.jks`)에서 인증서를 로드하고 SSL 구성을 로드하는 함수를 제공하는 `SslSettings` 객체를 생성합니다:

```kotlin
object SslSettings {
    fun getKeyStore(): KeyStore {
        val keyStoreFile = FileInputStream("keystore.jks")
        val keyStorePassword = "foobar".toCharArray()
        val keyStore: KeyStore = KeyStore.getInstance(KeyStore.getDefaultType())
        keyStore.load(keyStoreFile, keyStorePassword)
        return keyStore
    }

    fun getTrustManagerFactory(): TrustManagerFactory? {
        val trustManagerFactory = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm())
        trustManagerFactory.init(getKeyStore())
        return trustManagerFactory
    }

    fun getSslContext(): SSLContext? {
        val sslContext = SSLContext.getInstance("TLS")
        sslContext.init(null, getTrustManagerFactory()?.trustManagers, null)
        return sslContext
    }

    fun getTrustManager(): X509TrustManager {
        return getTrustManagerFactory()?.trustManagers?.first { it is X509TrustManager } as X509TrustManager
    }
}
```

## Ktor에서 SSL 구성 {id="configure-ssl"}

이 섹션에서는 다양한 엔진에 대해 SSL을 구성하는 방법을 살펴봅니다.
전체 예제는 여기에서 확인할 수 있습니다: [client-ssl-config](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-ssl-config).

### JVM {id="jvm"}

#### Apache {id="apache"}

Apache에서 SSL을 활성화하려면 `SSLContext`를 전달해야 합니다:

```kotlin
val apacheClient = HttpClient(Apache5) {
    engine {
        sslContext = SslSettings.getSslContext()
    }
}
```

#### Java {id="java"}

Java 클라이언트의 경우, `config` 블록 내부의 `sslContext` 함수에 `SSLContext`를 전달합니다:

```kotlin
val javaClient = HttpClient(Java) {
    engine {
        config {
            sslContext(SslSettings.getSslContext())
        }
    }
}
```

#### Jetty {id="jetty"}

Jetty의 경우, `SslContextFactory` 인스턴스를 생성하고 `SSLContext`를 전달해야 합니다:

```kotlin
val jettyClient = HttpClient(Jetty) {
    engine {
        sslContextFactory = SslContextFactory.Client().apply {
            sslContext = SslSettings.getSslContext()
        }
    }
}
```

### JVM 및 Android {id="jvm-android"}

> Android를 타깃으로 하는 모든 엔진은 [네트워크 보안 구성](https://developer.android.com/training/articles/security-config)을 사용합니다.

#### CIO {id="cio"}

CIO 엔진을 사용하면 `https` 블록 내에서 HTTPS 설정을 구성할 수 있습니다.
이 블록 내에서 [TLSConfigBuilder](https://api.ktor.io/ktor-network-tls/io.ktor.network.tls/-t-l-s-config-builder/index.html)가 제공하는 TLS 파라미터에 접근할 수 있습니다.
이 예제에서는 `TrustManager` 인스턴스를 사용하여 인증서를 구성합니다:

```kotlin
val cioClient = HttpClient(CIO) {
    engine {
        https {
            trustManager = SslSettings.getTrustManager()
        }
    }
}
```

> [sockets-client-tls](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/sockets-client-tls) 예제는 모든 인증서를 신뢰하도록 설정하는 방법을 보여줍니다.
> 이 방식은 개발 목적으로만 사용해야 합니다.

#### Android {id="android"}

Android 엔진은 `sslManager` 프로퍼티를 사용하여 SSL 설정을 구성합니다. 
이 프로퍼티는 `SSLSocketFactory`를 전달할 수 있도록 `HttpsURLConnection`을 파라미터로 받습니다:

```kotlin
val androidClient = HttpClient(Android) {
    engine {
        sslManager = { httpsURLConnection ->
            httpsURLConnection.sslSocketFactory = SslSettings.getSslContext()?.socketFactory
        }
    }
}
```

#### OkHttp {id="okhttp"}

SSL을 사용하도록 OkHttp를 구성하려면 `sslSocketFactory` 함수에 `SSLSocketFactory`와 `X509TrustManager`를 전달해야 합니다:

```kotlin
val okHttpClient = HttpClient(OkHttp) {
    engine {
        config {
            sslSocketFactory(SslSettings.getSslContext()!!.socketFactory, SslSettings.getTrustManager())
        }
    }
}
```

### Darwin {id="darwin"}

Darwin 엔진에서 신뢰할 수 있는 인증서를 구성하려면 [CertificatePinner](https://api.ktor.io/ktor-client-darwin/io.ktor.client.engine.darwin.certificates/-certificate-pinner/index.html)를 사용하세요.