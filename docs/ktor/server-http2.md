[//]: # (title: HTTP/2)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<b>代码示例</b>：<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/http2-netty">http2-netty</a>, <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/http2-jetty">http2-jetty</a>
</p>
</tldr>

[HTTP/2](https://en.wikipedia.org/wiki/HTTP/2) 是一种现代的二进制多路复用协议，旨在作为 HTTP/1.x 的替代方案。

Ktor 支持在 Jetty 和 Netty 服务器引擎中使用 HTTP/2。然而，它们之间存在显著差异，且每个引擎都需要额外的配置。一旦您的主机配置完成，HTTP/2 支持将自动激活。

对于基于 TLS 的 HTTP/2，您通常需要：

* [SSL 证书](#ssl_certificate)（可以是自签名的）。
* 所选引擎支持的 [ALPN 实现](#apln_implementation)。

Netty 引擎提供了[明文 HTTP/2 (h2c)](#http2-without-tls) 支持，且不需要 SSL 或 ALPN 配置。

## 配置 SSL 证书 {id="ssl_certificate"}

HTTP/2 并不强制要求 TLS，但浏览器通常仅支持通过加密连接使用 HTTP/2。要在 TLS 上使用 HTTP/2，您需要为服务器配置 SSL 证书。

出于测试目的，可以使用 JDK 中的 `keytool` 工具生成自签名证书：

```bash
keytool -keystore test.jks -genkeypair -alias testkey -keyalg RSA -keysize 4096 -validity 5000 -dname 'CN=localhost, OU=ktor, O=ktor, L=Unspecified, ST=Unspecified, C=US'
```

您还可以通过代码使用 [`buildKeyStore()`](server-ssl.md) 函数创建密钥库。

然后，在 <Path>application.conf</Path> 或 <Path>application.yaml</Path> [配置文件](server-configuration-file.topic) 中配置 Ktor 使用该密钥库：

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

## 配置 ALPN {id="apln_implementation"}

基于 TLS 的 HTTP/2 使用[应用层协议协商 (ALPN)](https://en.wikipedia.org/wiki/Application-Layer_Protocol_Negotiation) 在客户端与服务器之间协商协议。ALPN 配置取决于服务器引擎。

### Jetty {id="jetty"}

Jetty 引擎无需额外的 Ktor 配置即可处理 ALPN。
要在 Jetty 中使用基于 TLS 的 HTTP/2：
1. 使用 Jetty 引擎[创建服务器](server-engines.md#choose-create-server)。
2. [配置 SSL 证书](#ssl_certificate)。
3. 配置 `sslPort`。

> 有关 Jetty 配合 HTTP/2 的完整可运行示例，请参阅 [http2-jetty](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/http2-jetty)。
>
{style="tip"}

### Netty {id="netty"}

要在 Netty 中使用基于 TLS 的 HTTP/2，请添加 [Netty `tcnative`](https://netty.io/wiki/forked-tomcat-native.html) OpenSSL 绑定。

以下示例演示了如何将静态链接的 BoringSSL 实现添加到 <Path>build.gradle.kts</Path> 文件中：

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

> 有关 Netty 配合 HTTP/2 的完整可运行示例，请参阅 [http2-netty](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/http2-netty)。
> 
{style="tip"}

## 不带 TLS 的 HTTP/2 {id="http2-without-tls"}

Netty 引擎支持[明文 HTTP/2 (h2c)](https://httpwg.org/specs/rfc7540.html#discover-http)，允许在不使用 TLS 的情况下进行 HTTP/2 通信。
这在不需要加密的私有网络中非常有用。

客户端可以直接使用 h2c 连接，也可以将 HTTP/1.1 连接升级为 HTTP/2。

要启用 h2c，请在引擎配置中将 `enableH2c` 和 `enableHttp2` 选项都设置为 `true`：

```kotlin
embeddedServer(Netty, configure = {
    connector {
        port = 8080
    }
    enableHttp2 = true
    enableH2c = true
})
```

您可以在同一台服务器上同时启用 h2c 和基于 TLS 的 HTTP/2。明文连接器接受 h2c 连接，而 SSL 连接器使用基于 TLS 的 HTTP/2。