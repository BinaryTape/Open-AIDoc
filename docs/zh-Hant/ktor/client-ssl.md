[//]: # (title: Ktor Client 中的 SSL)

<show-structure for="chapter" depth="3"/>
<primary-label ref="client-plugin"/>

<tldr>
<var name="example_name" value="client-ssl-config"/>
<p>
    <b>程式碼範例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

若要在 Ktor 用戶端中配置 SSL，您需要自訂用戶端所使用[引擎的配置](client-engines.md#configure)。
在本主題中，我們將向您展示如何為以 [JVM](client-engines.md#jvm) 和 [Android](client-engines.md#jvm-android) 為目標的引擎新增 SSL 憑證。

> 若要了解如何使用 Ktor API 產生自我簽署憑證，請參閱[產生自我簽署憑證](server-ssl.md#self-signed)。

## 載入 SSL 設定 {id="ssl-settings"}

在本主題中，Ktor 用戶端將使用從為伺服器產生的現有 KeyStore 檔案（`keystore.jks`）載入的憑證。
鑒於不同的引擎使用不同的 [JSSE API](https://docs.oracle.com/en/java/javase/17/security/java-secure-socket-extension-jsse-reference-guide.html#GUID-B7AB25FA-7F0C-4EFA-A827-813B2CE7FBDC) 來配置 SSL（例如 Apache 使用 `SSLContext`，而 Jetty 使用 `TrustManager`），我們需要有能力取得對應的 SSL 配置。以下程式碼片段建立了 `SslSettings` 物件，該物件會從現有的 KeyStore 檔案（`keystore.jks`）載入憑證，並提供用於載入 SSL 配置的函式：

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

在本節中，我們將介紹如何為不同的引擎配置 SSL。
您可以在此處找到完整的範例：[client-ssl-config](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-ssl-config)。

### JVM {id="jvm"}

#### Apache {id="apache"}

若要為 Apache 啟用 SSL，您需要傳入 `SSLContext`：

```kotlin
val apacheClient = HttpClient(Apache5) {
    engine {
        sslContext = SslSettings.getSslContext()
    }
}
```

#### Java {id="java"}

對於 Java 用戶端，請在 `config` 區塊內將 `SSLContext` 傳遞給 `sslContext` 函式：

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

對於 Jetty，您需要建立 `SslContextFactory` 的執行個體並傳入 `SSLContext`：

```kotlin
val jettyClient = HttpClient(Jetty) {
    engine {
        sslContextFactory = SslContextFactory.Client().apply {
            sslContext = SslSettings.getSslContext()
        }
    }
}
```

### JVM 與 Android {id="jvm-android"}

> 所有以 Android 為目標的引擎都使用[網路安全性設定](https://developer.android.com/training/articles/security-config)。

#### CIO {id="cio"}

CIO 引擎允許您在 `https` 區塊內配置 HTTPS 設定。
在此區塊內，您可以存取由 [TLSConfigBuilder](https://api.ktor.io/ktor-network-tls/io.ktor.network.tls/-t-l-s-config-builder/index.html) 提供的 TLS 參數。
在我們的範例中，使用了一個 `TrustManager` 執行個體來配置憑證：

```kotlin
val cioClient = HttpClient(CIO) {
    engine {
        https {
            trustManager = SslSettings.getTrustManager()
        }
    }
}
```

> [sockets-client-tls](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/sockets-client-tls) 範例展示了如何信任所有憑證。
> 此方法應僅用於開發目的。

#### Android {id="android"}

Android 引擎使用 `sslManager` 屬性來配置 SSL 設定。
此屬性接受 `HttpsURLConnection` 作為參數，允許您傳入 `SSLSocketFactory`：

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

若要將 OkHttp 配置為使用 SSL，您需要將 `SSLSocketFactory` 和 `X509TrustManager` 傳遞給 `sslSocketFactory` 函式：

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

若要為 Darwin 引擎配置受信任的憑證，請使用 [CertificatePinner](https://api.ktor.io/ktor-client-darwin/io.ktor.client.engine.darwin.certificates/-certificate-pinner/index.html)。