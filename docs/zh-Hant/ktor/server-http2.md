[//]: # (title: HTTP/2)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<b>程式碼範例</b>：<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/http2-netty">http2-netty</a>、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/http2-jetty">http2-jetty</a>
</p>
</tldr>

[HTTP/2](https://en.wikipedia.org/wiki/HTTP/2) 是一種現代的二進制多工傳輸通訊協定，旨在作為 HTTP/1.x 的替代方案。

Ktor 透過 Jetty 和 Netty 伺服器引擎支援 HTTP/2。不過兩者之間存在顯著差異，且每個引擎都需要額外的配置。一旦主機配置完成，HTTP/2 支援就會自動地啟用。

對於基於 TLS 的 HTTP/2，通常需要：

* [SSL 憑證](#ssl_certificate)，可以是自我簽署的。
* 所選引擎支援的 [ALPN 實作](#apln_implementation)。

Netty 引擎支援[基於明文的 HTTP/2 (h2c)](#http2-without-tls)，且不需要 SSL 或 ALPN 配置。

## 配置 SSL 憑證 {id="ssl_certificate"}

HTTP/2 並不強制要求 TLS，但瀏覽器通常僅支援加密連線上的 HTTP/2。若要使用基於 TLS 的 HTTP/2，你需要為伺服器配置 SSL 憑證。

為了進行測試，你可以使用 JDK 的 `keytool` 工具產生自我簽署憑證：

```bash
keytool -keystore test.jks -genkeypair -alias testkey -keyalg RSA -keysize 4096 -validity 5000 -dname 'CN=localhost, OU=ktor, O=ktor, L=Unspecified, ST=Unspecified, C=US'
```

你也可以使用 [`buildKeyStore()`](server-ssl.md) 函式以程式化方式建立 keystore。

接著，在你的 <Path>application.conf</Path> 或 <Path>application.yaml</Path> [設定檔](server-configuration-file.topic)中配置 Ktor 以使用該 keystore：

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
        port = 8080
        sslPort = 8443
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

## 配置 ALPN {id="apln_implementation"}

基於 TLS 的 HTTP/2 使用[應用層通訊協定協商 (ALPN)](https://en.wikipedia.org/wiki/Application-Layer_Protocol_Negotiation) 在用戶端與伺服器之間協商通訊協定。ALPN 的配置取決於伺服器引擎。

### Jetty {id="jetty"}

Jetty 引擎無需額外的 Ktor 配置即可處理 ALPN。
若要在 Jetty 上使用基於 TLS 的 HTTP/2：
1. 使用 Jetty 引擎[建立伺服器](server-engines.md#choose-create-server)。
2. [配置 SSL 憑證](#ssl_certificate)。
3. 配置 `sslPort`。

> 若要查看在 Jetty 上使用 HTTP/2 的完整可執行範例，請參閱 [http2-jetty](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/http2-jetty)
>
{style="tip"}

### Netty {id="netty"}

若要在 Netty 上使用基於 TLS 的 HTTP/2，請新增 [Netty `tcnative`](https://netty.io/wiki/forked-tomcat-native.html) OpenSSL 繫結。

以下範例將靜態連結的 BoringSSL 實作新增至 <Path>build.gradle.kts</Path> 檔案：

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
        implementation(variantOf(libs.netty.tcnative.boringssl.static) { classifier(tcnative_classifier) })
    } else {
        implementation(libs.netty.tcnative.boringssl.static)
    }
}
```

`tc.native.classifier` 可以是 `linux-x86_64`、`osx-x86_64` 或 `windows-x86_64`。

> 若要查看在 Netty 上使用 HTTP/2 的完整可執行範例，請參閱 [http2-netty](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/http2-netty)。
> 
{style="tip"}

## 不使用 TLS 的 HTTP/2 {id="http2-without-tls"}

Netty 引擎支援[基於明文的 HTTP/2 (h2c)](https://httpwg.org/specs/rfc7540.html#discover-http)，允許在不使用 TLS 的情況下進行 HTTP/2 通訊。
這在不需要加密的內部私有網路中非常實用。

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

你可以在同一台伺服器上同時啟用 h2c 與基於 TLS 的 HTTP/2。明文連接器接受 h2c 連線，而 SSL 連接器則使用基於 TLS 的 HTTP/2。