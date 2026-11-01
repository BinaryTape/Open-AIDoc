[//]: # (title: Ktor Client における SSL)

<show-structure for="chapter" depth="3"/>
<primary-label ref="client-plugin"/>

<tldr>
<var name="example_name" value="client-ssl-config"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

Ktor クライアントで SSL を設定するには、クライアントで使用される[エンジンの設定](client-engines.md#configure)をカスタマイズする必要があります。
このトピックでは、[JVM](client-engines.md#jvm) および [Android](client-engines.md#jvm-android) をターゲットとするエンジンに SSL 証明書を追加する方法について説明します。

> Ktor API を使用して自己署名証明書を生成する方法については、[自己署名証明書の生成](server-ssl.md#self-signed)を参照してください。

## SSL 設定の読み込み {id="ssl-settings"}

このトピックでは、Ktor クライアントはサーバー用に生成された既存の KeyStore ファイル（`keystore.jks`）から読み込まれた証明書を使用します。
異なるエンジンは SSL を設定するために異なる [JSSE API](https://docs.oracle.com/en/java/javase/17/security/java-secure-socket-extension-jsse-reference-guide.html#GUID-B7AB25FA-7F0C-4EFA-A827-813B2CE7FBDC) を使用するため（例: Apache の場合は `SSLContext`、Jetty の場合は `TrustManager`）、対応する SSL 設定を取得する機能を用意する必要があります。以下のコードスニペットは、既存の KeyStore ファイル（`keystore.jks`）から証明書を読み込み、SSL 設定を取得するための関数を提供する `SslSettings` オブジェクトを作成します。

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

## Ktor での SSL の設定 {id="configure-ssl"}

このセクションでは、さまざまなエンジンで SSL を設定する方法を見ていきます。
完全なサンプルはこちらで確認できます: [client-ssl-config](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-ssl-config)。

### JVM {id="jvm"}

#### Apache {id="apache"}

Apache で SSL を有効にするには、`SSLContext` を渡す必要があります。

```kotlin
val apacheClient = HttpClient(Apache5) {
    engine {
        sslContext = SslSettings.getSslContext()
    }
}
```

#### Java {id="java"}

Java クライアントの場合は、`config` ブロック内の `sslContext` 関数に `SSLContext` を渡します。

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

Jetty の場合は、`SslContextFactory` のインスタンスを作成し、`SSLContext` を渡す必要があります。

```kotlin
val jettyClient = HttpClient(Jetty) {
    engine {
        sslContextFactory = SslContextFactory.Client().apply {
            sslContext = SslSettings.getSslContext()
        }
    }
}
```

### JVM および Android {id="jvm-android"}

> Android 向けのすべてのエンジンは [ネットワーク セキュリティ構成](https://developer.android.com/training/articles/security-config) を使用します。

#### CIO {id="cio"}

CIO エンジンでは、`https` ブロック内で HTTPS 設定を構成できます。
このブロック内では、[TLSConfigBuilder](https://api.ktor.io/ktor-network-tls/io.ktor.network.tls/-t-l-s-config-builder/index.html) によって提供される TLS パラメーターにアクセスできます。
この例では、証明書を設定するために `TrustManager` インスタンスが使用されています。

```kotlin
val cioClient = HttpClient(CIO) {
    engine {
        https {
            trustManager = SslSettings.getTrustManager()
        }
    }
}
```

> [sockets-client-tls](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/sockets-client-tls) の例では、すべての証明書を信頼する方法を示しています。
> この方法は開発目的でのみ使用してください。

#### Android {id="android"}

Android エンジンは SSL 設定を構成するために `sslManager` プロパティを使用します。
このプロパティは `HttpsURLConnection` をパラメーターとして受け取り、これにより `SSLSocketFactory` を渡すことができます。

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

SSL を使用するように OkHttp を設定するには、`sslSocketFactory` 関数に `SSLSocketFactory` と `X509TrustManager` を渡す必要があります。

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

Darwin エンジンで信頼済み証明書を設定するには、[CertificatePinner](https://api.ktor.io/ktor-client-darwin/io.ktor.client.engine.darwin.certificates/-certificate-pinner/index.html) を使用します。