[//]: # (title: Ktor Client 中的 SSL)

<show-structure for="chapter" depth="3"/>
<primary-label ref="client-plugin"/>

<tldr>
<var name="example_name" value="client-ssl-config"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

要在 Ktor 客户端中配置 SSL，你需要自定义客户端所使用[引擎的配置](client-engines.md#configure)。

在本主题中，你将学习如何为针对 [JVM](client-engines.md#jvm) 和 [Android](client-engines.md#jvm-android) 的引擎添加 SSL 证书。

> 要了解如何使用 Ktor 生成自签名证书，请参阅[生成自签名证书](server-ssl.md#self-signed)。
> 
{style="tip"}

## 加载 SSL 设置 {id="ssl-settings"}

在本主题中，Ktor 客户端使用从为服务器生成的现有 KeyStore 文件（`keystore.jks`）中加载的证书。

鉴于每个引擎使用不同的 [JSSE API](https://docs.oracle.com/en/java/javase/17/security/java-secure-socket-extension-jsse-reference-guide.html#GUID-B7AB25FA-7F0C-4EFA-A827-813B2CE7FBDC) 来配置 SSL（例如 Apache 使用 [`SSLContext`](https://docs.oracle.com/javase/8/docs/api/javax/net/ssl/SSLContext.html)，而 Jetty 使用 [`TrustManager`](https://docs.oracle.com/javase/8/docs/api/javax/net/ssl/TrustManager.html)），你需要具备获取相应 SSL 配置的能力。

以下代码段创建了 `SslSettings` 对象，该对象从现有的 KeyStore 文件（`keystore.jks`）中加载证书，并提供用于加载 SSL 配置的函数。

同一个 KeyStore 既用于信任服务器证书，也通过 [`KeyManagerFactory`](https://docs.oracle.com/javase/8/docs/api/javax/net/ssl/KeyManagerFactory.html) 提供客户端证书，这对于配置了信任存储库（trust store）的服务器是必需的：

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

## 在 Ktor 中配置 SSL {id="configure-ssl"}

SSL 配置因引擎而异。以下各节介绍了如何为各个引擎配置 SSL。

### JVM {id="jvm"}

#### Apache 和 Apache5 {id="apache"}

要为 Apache 和 Apache 5 客户端启用 SSL，请使用 [`sslContext`](https://api.ktor.io/ktor-client-apache5/io.ktor.client.engine.apache5/-apache5-engine-config/ssl-context.html) 形参配置 `SSLContext`：

```kotlin
val apacheClient = HttpClient(Apache5) {
    engine {
        sslContext = SslSettings.getSslContext()
    }
}
```

#### Java {id="java"}

对于 Java 客户端，请在 `config {}` 块中使用 `sslContext()` 函数配置 `SSLContext`：

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

对于 Jetty 客户端，请使用 [`sslContextFactory`](https://api.ktor.io/ktor-client-jetty-jakarta/io.ktor.client.engine.jetty.jakarta/-jetty-engine-config/ssl-context-factory.html) 形参创建 `SslContextFactory` 实例并传入 `SSLContext`：

```kotlin
val jettyClient = HttpClient(Jetty) {
    engine {
        sslContextFactory = SslContextFactory.Client().apply {
            sslContext = SslSettings.getSslContext()
        }
    }
}
```

### JVM 与 Android {id="jvm-android"}

> 所有面向 Android 的引擎均使用[网络安全配置](https://developer.android.com/training/articles/security-config)。
> 
{style="note"}

#### CIO {id="cio"}

CIO 引擎允许你在 `https {}` 块内配置 HTTPS 设置。在该块内，你可以访问 [`TLSConfigBuilder`](https://api.ktor.io/ktor-network-tls/io.ktor.network.tls/-t-l-s-config-builder/index.html) 提供的 TLS 形参。

在以下示例中，使用 `TrustManager` 实例来信任服务器证书，并通过 [`addKeyStore()`](https://api.ktor.io/ktor-network-tls/io.ktor.network.tls/add-key-store.html) 函数添加客户端证书：

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

> [sockets-client-tls](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/sockets-client-tls) 示例展示了如何信任所有证书。该方法应仅用于开发目的。
>
{style="tip"}

#### Android {id="android"}

Android 引擎使用 [`sslManager`](https://api.ktor.io/ktor-client-android/io.ktor.client.engine.android/-android-engine-config/ssl-manager.html) 属性来配置 SSL 设置。该属性接受 `HttpsURLConnection` 作为形参，允许你传入 `SSLSocketFactory`：

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

要为 OkHttp 客户端引擎配置 SSL，请在 `config {}` 块内将 `SSLSocketFactory` 和 `X509TrustManager` 传递给 `sslSocketFactory()` 函数：

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

要为 Darwin 引擎配置受信任的证书，请使用 [`CertificatePinner`](https://api.ktor.io/ktor-client-darwin/io.ktor.client.engine.darwin.certificates/-certificate-pinner/index.html)。