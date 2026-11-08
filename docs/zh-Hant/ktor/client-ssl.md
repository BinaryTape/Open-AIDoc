[//]: # (title: Ktor Client 中的 SSL)

<show-structure for="chapter" depth="3"/>
<primary-label ref="client-plugin"/>

<tldr>
<var name="example_name" value="client-ssl-config"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

若要在 Ktor 用戶端中設定 SSL，你需要自訂用戶端所使用[引擎的配置](client-engines.md#configure)。

在本文中，你將學習如何為以 [JVM](client-engines.md#jvm) 和 [Android](client-engines.md#jvm-android) 為目標的引擎新增 SSL 憑證。

> 若要了解如何使用 Ktor 產生自簽署憑證，請參閱[產生自簽署憑證](server-ssl.md#self-signed)。
> 
{style="tip"}

## 載入 SSL 設定 {id="ssl-settings"}

在本文中，Ktor 用戶端使用從為伺服器產生的現有 KeyStore 檔案 (`keystore.jks`) 載入的憑證。

鑑於每個引擎使用不同的 [JSSE API](https://docs.oracle.com/en/java/javase/17/security/java-secure-socket-extension-jsse-reference-guide.html#GUID-B7AB25FA-7F0C-4EFA-A827-813B2CE7FBDC) 來設定 SSL（例如，Apache 使用 [`SSLContext`](https://docs.oracle.com/javase/8/docs/api/javax/net/ssl/SSLContext.html)，Jetty 使用 [`TrustManager`](https://docs.oracle.com/javase/8/docs/api/javax/net/ssl/TrustManager.html)），你需要具備取得相應 SSL 配置的能力。

下方的程式碼片段建立了 `SslSettings` 物件，該物件從現有的 KeyStore 檔案 (`keystore.jks`) 載入憑證，並提供用於載入 SSL 配置的函式。

同一個 KeyStore 用於信任伺服器憑證，並透過 [`KeyManagerFactory`](https://docs.oracle.com/javase/8/docs/api/javax/net/ssl/KeyManagerFactory.html) 提供用戶端憑證，這在設定了信任存放區（trust store）的伺服器中是必要的：

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

## 在 Ktor 中設定 SSL {id="configure-ssl"}

SSL 配置因引擎而異。以下各節將介紹如何為各個引擎設定 SSL。

### JVM {id="jvm"}

#### Apache 與 Apache5 {id="apache"}

若要為 Apache 和 Apache 5 用戶端啟用 SSL，請使用 [`sslContext`](https://api.ktor.io/ktor-client-apache5/io.ktor.client.engine.apache5/-apache5-engine-config/ssl-context.html) 參數來配置 `SSLContext`：

```kotlin
val apacheClient = HttpClient(Apache5) {
    engine {
        sslContext = SslSettings.getSslContext()
    }
}
```

#### Java {id="java"}

對於 Java 用戶端，請在 `config {}` 區塊內使用 `sslContext()` 函式來配置 `SSLContext`：

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

對於 Jetty 用戶端，請使用 [`sslContextFactory`](https://api.ktor.io/ktor-client-jetty-jakarta/io.ktor.client.engine.jetty.jakarta/-jetty-engine-config/ssl-context-factory.html) 參數建立 `SslContextFactory` 的執行個體並傳入 `SSLContext`：

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

> 所有以 Android 為目標的引擎皆使用[網路安全性設定](https://developer.android.com/training/articles/security-config)。
> 
{style="note"}

#### CIO {id="cio"}

CIO 引擎允許你在 `https {}` 區塊內設定 HTTPS 設定。
在此區塊內，你可以存取 [`TLSConfigBuilder`](https://api.ktor.io/ktor-network-tls/io.ktor.network.tls/-t-l-s-config-builder/index.html) 提供的 TLS 參數。

在以下範例中，使用 `TrustManager` 執行個體來信任伺服器憑證，並透過 [`addKeyStore()`](https://api.ktor.io/ktor-network-tls/io.ktor.network.tls/add-key-store.html) 函式新增用戶端憑證：

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

> [sockets-client-tls](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/sockets-client-tls) 範例展示了如何信任所有憑證。
> 此方法應僅用於開發目的。
>
{style="tip"}

#### Android {id="android"}

Android 引擎使用 [`sslManager`](https://api.ktor.io/ktor-client-android/io.ktor.client.engine.android/-android-engine-config/ssl-manager.html) 屬性來配置 SSL 設定。
此屬性接受 `HttpsURLConnection` 作為參數，讓你可以傳入 `SSLSocketFactory`：

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

若要為 OkHttp 用戶端引擎配置 SSL，請在 `config {}` 區塊內的 `sslSocketFactory()` 函式中傳入 `SSLSocketFactory` 與 `X509TrustManager`：

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

若要為 Darwin 引擎設定信任的憑證，請使用 [`CertificatePinner`](https://api.ktor.io/ktor-client-darwin/io.ktor.client.engine.darwin.certificates/-certificate-pinner/index.html)。