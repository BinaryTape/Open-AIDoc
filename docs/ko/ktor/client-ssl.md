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

Ktor 클라이언트에서 SSL을 구성하려면 클라이언트에서 사용하는 [엔진 구성](client-engines.md#configure)을 사용자 정의해야 합니다.

이 문서에서는 [JVM](client-engines.md#jvm) 및 [Android](client-engines.md#jvm-android)를 대상으로 하는 엔진에 SSL 인증서를 추가하는 방법을 알아봅니다.

> Ktor로 자체 서명 인증서(self-signed certificate)를 생성하는 방법은 [자체 서명 인증서 생성](server-ssl.md#self-signed)을 참고하세요.
> 
{style="tip"}

## SSL 설정 로드 {id="ssl-settings"}

이 문서에서는 Ktor 클라이언트가 서버용으로 생성된 기존 KeyStore 파일(`keystore.jks`)에서 로드한 인증서를 사용합니다.

엔진마다 SSL을 구성하는 데 사용하는 [JSSE API](https://docs.oracle.com/en/java/javase/17/security/java-secure-socket-extension-jsse-reference-guide.html#GUID-B7AB25FA-7F0C-4EFA-A827-813B2CE7FBDC)가 다르므로(예: Apache의 경우 [`SSLContext`](https://docs.oracle.com/javase/8/docs/api/javax/net/ssl/SSLContext.html), Jetty의 경우 [`TrustManager`](https://docs.oracle.com/javase/8/docs/api/javax/net/ssl/TrustManager.html)), 해당 SSL 구성을 가져올 수 있어야 합니다.

아래 코드 스니펫은 기존 KeyStore 파일(`keystore.jks`)에서 인증서를 로드하고 SSL 구성을 로드하는 함수를 제공하는 `SslSettings` 객체를 생성합니다.

동일한 KeyStore가 서버 인증서를 신뢰하는 데 사용되며, [`KeyManagerFactory`](https://docs.oracle.com/javase/8/docs/api/javax/net/ssl/KeyManagerFactory.html)를 통해 트러스트 스토어가 구성된 서버에서 요구하는 클라이언트 인증서를 제시하는 데에도 사용됩니다.

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

    fun getKeyManagerFactory(): KeyManagerFactory? {
        val keyManagerFactory = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm())
        keyManagerFactory.init(getKeyStore(), "foobar".toCharArray())
        return keyManagerFactory
    }

    fun getSslContext(): SSLContext? {
        val sslContext = SSLContext.getInstance("TLS")
        sslContext.init(getKeyManagerFactory()?.keyManagers, getTrustManagerFactory()?.trustManagers, null)
        return sslContext
    }

    fun getTrustManager(): X509TrustManager {
        return getTrustManagerFactory()?.trustManagers?.first { it is X509TrustManager } as X509TrustManager
    }
}
```

## Ktor에서 SSL 구성 {id="configure-ssl"}

SSL 구성은 엔진에 따라 다릅니다. 다음 섹션에서는 각 엔진별로 SSL을 구성하는 방법을 설명합니다.

### JVM {id="jvm"}

#### Apache 및 Apache5 {id="apache"}

Apache 및 Apache 5 클라이언트에서 SSL을 활성화하려면 [`sslContext`](https://api.ktor.io/ktor-client-apache5/io.ktor.client.engine.apache5/-apache5-engine-config/ssl-context.html) 파라미터를 사용하여 `SSLContext`를 구성하세요.

```kotlin
val apacheClient = HttpClient(Apache5) {
    engine {
        sslContext = SslSettings.getSslContext()
    }
}
```

#### Java {id="java"}

Java 클라이언트의 경우, `config {}` 블록 내부에서 `sslContext()` 함수를 사용하여 `SSLContext`를 구성합니다.

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

Jetty 클라이언트의 경우, [`sslContextFactory`](https://api.ktor.io/ktor-client-jetty-jakarta/io.ktor.client.engine.jetty.jakarta/-jetty-engine-config/ssl-context-factory.html) 파라미터를 사용하여 `SslContextFactory` 인스턴스를 생성하고 `SSLContext`를 전달합니다.

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

> Android를 대상으로 하는 모든 엔진은 [네트워크 보안 구성](https://developer.android.com/training/articles/security-config)을 사용합니다.
> 
{style="note"}

#### CIO {id="cio"}

CIO 엔진에서는 `https {}` 블록 내부에서 HTTPS 설정을 구성할 수 있습니다.
이 블록 내에서 [`TLSConfigBuilder`](https://api.ktor.io/ktor-network-tls/io.ktor.network.tls/-t-l-s-config-builder/index.html)가 제공하는 TLS 파라미터에 접근할 수 있습니다.

다음 예제에서는 `TrustManager` 인스턴스를 사용하여 서버 인증서를 신뢰하고, [`addKeyStore()`](https://api.ktor.io/ktor-network-tls/io.ktor.network.tls/add-key-store.html) 함수로 클라이언트 인증서를 추가합니다.

```kotlin
val cioClient = HttpClient(CIO) {
    engine {
        https {
            trustManager = SslSettings.getTrustManager()
            addKeyStore(SslSettings.getKeyStore(), "foobar".toCharArray())
        }
    }
}
```

> [sockets-client-tls](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/sockets-client-tls) 예제에서는 모든 인증서를 신뢰하는 방법을 보여줍니다.
> 이 방식은 개발 목적으로만 사용해야 합니다.
>
{style="tip"}

#### Android {id="android"}

Android 엔진은 SSL 설정을 구성하기 위해 [`sslManager`](https://api.ktor.io/ktor-client-android/io.ktor.client.engine.android/-android-engine-config/ssl-manager.html) 프로퍼티를 사용합니다. 
이 프로퍼티는 `SSLSocketFactory`를 전달할 수 있는 `HttpsURLConnection`을 파라미터로 받습니다.

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

OkHttp 클라이언트 엔진의 SSL을 구성하려면 `config {}` 블록 내의 `sslSocketFactory()` 함수에 `SSLSocketFactory`와 `X509TrustManager`를 전달하세요.

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

Darwin 엔진에서 신뢰할 수 있는 인증서를 구성하려면 [`CertificatePinner`](https://api.ktor.io/ktor-client-darwin/io.ktor.client.engine.darwin.certificates/-certificate-pinner/index.html)를 사용하세요.