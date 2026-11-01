[//]: # (title: Ktor 客户端中的 SSL)

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

要在 Ktor 客户端中配置 SSL，你需要自定义客户端所用[引擎的配置](client-engines.md#configure)。
在本主题中，我们将向你展示如何为面向 [JVM](client-engines.md#jvm) 和 [Android](client-engines.md#jvm-android) 的引擎添加 SSL 证书。

> 要了解如何使用 Ktor API 生成自签名证书，请参阅[生成自签名证书](server-ssl.md#self-signed)。

## 加载 SSL 设置 {id="ssl-settings"}

在本主题中，Ktor 客户端将使用从为服务器生成的现有 KeyStore 文件（`keystore.jks`）中加载的证书。
鉴于不同的引擎使用不同的 [JSSE API](https://docs.oracle.com/en/java/javase/17/security/java-secure-socket-extension-jsse-reference-guide.html#GUID-B7AB25FA-7F0C-4EFA-A827-813B2CE7FBDC) 来配置 SSL（例如 Apache 使用 `SSLContext`，Jetty 使用 `TrustManager`），我们需要具备获取相应 SSL 配置的能力。以下代码段创建了 `SslSettings` 对象，该对象从现有的 KeyStore 文件（`keystore.jks`）中加载证书，并提供了用于加载 SSL 配置的函数：

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

## 在 Ktor 中配置 SSL {id="configure-ssl"}

在本节中，我们将了解如何为不同的引擎配置 SSL。
你可以在此处找到完整示例：[client-ssl-config](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-ssl-config)。

### JVM {id="jvm"}

#### Apache {id="apache"}

要为 Apache 启用 SSL，你需要传递 `SSLContext`：

```kotlin
val apacheClient = HttpClient(Apache5) {
    engine {
        sslContext = SslSettings.getSslContext()
    }
}
```

#### Java {id="java"}

对于 Java 客户端，在 `config` 块内将 `SSLContext` 传递给 `sslContext` 函数：

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

对于 Jetty，你需要创建 `SslContextFactory` 的实例并传递 `SSLContext`：

```kotlin
val jettyClient = HttpClient(Jetty) {
    engine {
        sslContextFactory = SslContextFactory.Client().apply {
            sslContext = SslSettings.getSslContext()
        }
    }
}
```

### JVM 和 Android {id="jvm-android"}

> 所有面向 Android 的引擎均使用[网络安全配置](https://developer.android.com/training/articles/security-config)。

#### CIO {id="cio"}

CIO 引擎允许你在 `https` 块内配置 HTTPS 设置。
在此块内，你可以访问 [TLSConfigBuilder](https://api.ktor.io/ktor-network-tls/io.ktor.network.tls/-t-l-s-config-builder/index.html) 提供的 TLS 形参。
在我们的示例中，使用了一个 `TrustManager` 实例来配置证书：

```kotlin
val cioClient = HttpClient(CIO) {
    engine {
        https {
            trustManager = SslSettings.getTrustManager()
        }
    }
}
```

> [sockets-client-tls](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/sockets-client-tls) 示例展示了如何信任所有证书。
> 此方法应仅用于开发目的。

#### Android {id="android"}

Android 引擎使用 `sslManager` 属性来配置 SSL 设置。 
该属性接受 `HttpsURLConnection` 作为形参，允许你传递 `SSLSocketFactory`：

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

要配置 OkHttp 使用 SSL，你需要将 `SSLSocketFactory` 和 `X509TrustManager` 传递给 `sslSocketFactory` 函数：

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

要为 Darwin 引擎配置受信任证书，请使用 [CertificatePinner](https://api.ktor.io/ktor-client-darwin/io.ktor.client.engine.darwin.certificates/-certificate-pinner/index.html)。