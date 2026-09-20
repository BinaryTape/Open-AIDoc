[//]: # (title: HTTP/2)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<b>程式碼範例</b>：<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/http2-netty">http2-netty</a>、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/http2-jetty">http2-jetty</a>
</p>
</tldr>

[HTTP/2](https://en.wikipedia.org/wiki/HTTP/2) 是一種現代的二進制多路複用協定，旨在取代 HTTP/1.x。

Ktor 透過 Jetty 和 Netty 伺服器引擎支援 HTTP/2。然而，兩者之間存在顯著差異，且每個引擎都需要額外的配置。一旦您的主機配置妥當，HTTP/2 支援將會自動啟用。

針對基於 TLS 的 HTTP/2，您通常需要：

* [一份 SSL 憑證](#ssl_certificate)（可以是自我簽署憑證）。
* 所選引擎支援的 [ALPN 實作](#apln_implementation)。

[基於純文字的 HTTP/2 (h2c)](#http2-without-tls) 可在 Netty 引擎中使用，且不需要 SSL 或 ALPN 配置。

## 配置 SSL 憑證 {id="ssl_certificate"}

HTTP/2 不需要 TLS，但瀏覽器通常僅支援透過加密連線使用 HTTP/2。若要在 TLS 上使用 HTTP/2，您需要為伺服器配置 SSL 憑證。

出於測試目的，您可以使用 JDK `keytool` 工具產生自我簽署憑證：

```bash
keytool -keystore test.jks -genkeypair -alias testkey -keyalg RSA -keysize 4096 -validity 5000 -dname 'CN=localhost, OU=ktor, O=ktor, L=Unspecified, ST=Unspecified, C=US'
```

您也可以使用 [`buildKeyStore()`](server-ssl.md) 函式以程式化方式建立金鑰庫。

接著，在您的 <Path>application.conf</Path> 或 <Path>application.yaml</Path> [配置檔案](server-configuration-file.topic) 中配置 Ktor 以使用該金鑰庫：

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
            keyStore = test.jks
            keyAlias = testkey
            keyStorePassword = foobar
            privateKeyPassword = foobar
```

</TabItem>
</Tabs>

## 配置 ALPN {id="apln_implementation"}

基於 TLS 的 HTTP/2 使用 [應用層協定協商 (ALPN)](https://en.wikipedia.org/wiki/Application-Layer_Protocol_Negotiation) 在用戶端與伺服器之間協商協定。ALPN 的配置方式取決於所使用的伺服器引擎。

### Jetty {id="jetty"}

Jetty 引擎無需額外的 Ktor 配置即可處理 ALPN。
若要在 Jetty 上使用基於 TLS 的 HTTP/2：
1. 使用 Jetty 引擎[建立伺服器](server-engines.md#choose-create-server)。
2. [配置 SSL 憑證](#ssl_certificate)。
3. 配置 `sslPort`。

> 關於 Jetty 搭配 HTTP/2 的完整可執行範例，請參閱 [http2-jetty](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/http2-jetty)。
>
{style="tip"}

### Netty {id="netty"}

若要在 Netty 上使用基於 TLS 的 HTTP/2，請新增 [Netty `tcnative`](https://netty.io/wiki/forked-tomcat-native.html) OpenSSL 繫結。

以下範例展示如何將靜態連結的 BoringSSL 實作新增至 <Path>build.gradle.kts</Path> 檔案中：

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

`tc.native.classifier` 可以是 `linux-x86_64`、`osx-x86_64` 或 `windows-x86_64`。

> 關於 Netty 搭配 HTTP/2 的完整可執行範例，請參閱 [http2-netty](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/http2-netty)。
> 
{style="tip"}

## 不具備 TLS 的 HTTP/2 {id="http2-without-tls"}

Netty 引擎支援 [基於純文字的 HTTP/2 (h2c)](https://httpwg.org/specs/rfc7540.html#discover-http)，允許在不使用 TLS 的情況下進行 HTTP/2 通訊。
這在不需要加密的私有網路內非常實用。

用戶端可以直接使用 h2c 進行連線，或是將 HTTP/1.1 連線升級為 HTTP/2。

若要啟用 h2c，請在引擎配置中將 `enableH2c` 和 `enableHttp2` 選項皆設定為 `true`：

```kotlin
embeddedServer(Netty, configure = {
    connector {
        port = 8080
    }
    enableHttp2 = true
    enableH2c = true
})
```

您可以在同一台伺服器上同時啟用 h2c 與基於 TLS 的 HTTP/2。純文字連接器會接受 h2c 連線，而 SSL 連接器則會使用基於 TLS 的 HTTP/2。