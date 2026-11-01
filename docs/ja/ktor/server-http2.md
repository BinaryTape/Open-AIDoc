[//]: # (title: HTTP/2)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<b>コード例</b>: <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/http2-netty">http2-netty</a>, <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/http2-jetty">http2-jetty</a>
</p>
</tldr>

[HTTP/2](https://en.wikipedia.org/wiki/HTTP/2) は、HTTP/1.x の代替として設計されたモダンなバイナリ多重化プロトコルです。

Ktor は Jetty および Netty サーバーエンジンで HTTP/2 をサポートしています。ただし、これらには大きな違いがあり、各エンジンで追加の設定が必要です。ホストが一度設定されれば、HTTP/2 のサポートは自動的に有効化されます。

HTTP/2 over TLS の場合、通常以下が必要となります。

* [SSL 証明書](#ssl_certificate)（自己署名証明書でも可）
* 選択したエンジンでサポートされている [ALPN 実装](#apln_implementation)

[HTTP/2 over cleartext (h2c)](#http2-without-tls) は Netty エンジンで利用可能であり、SSL や ALPN の設定は不要です。

## SSL 証明書の設定 {id="ssl_certificate"}

HTTP/2 自体は TLS を必須としませんが、通常ブラウザは暗号化された接続上でのみ HTTP/2 をサポートします。HTTP/2 over TLS を使用するには、サーバーに SSL 証明書を設定する必要があります。

テスト目的であれば、JDK の `keytool` ユーティリティを使用して自己署名証明書を生成できます。

```bash
keytool -keystore test.jks -genkeypair -alias testkey -keyalg RSA -keysize 4096 -validity 5000 -dname 'CN=localhost, OU=ktor, O=ktor, L=Unspecified, ST=Unspecified, C=US'
```

また、[`buildKeyStore()`](server-ssl.md) 関数を使用してプログラムからキーストアを作成することもできます。

その後、<Path>application.conf</Path> または <Path>application.yaml</Path> [設定ファイル](server-configuration-file.topic) でキーストアを使用するように Ktor を設定します。

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

## ALPN の設定 {id="apln_implementation"}

HTTP/2 over TLS は、クライアントとサーバー間のプロトコルネゴシエーションに [Application-Layer Protocol Negotiation (ALPN)](https://en.wikipedia.org/wiki/Application-Layer_Protocol_Negotiation) を使用します。ALPN の設定はサーバーエンジンによって異なります。

### Jetty {id="jetty"}

Jetty エンジンは、Ktor の追加設定なしで ALPN を処理します。
Jetty で HTTP/2 over TLS を使用するには:
1. Jetty エンジンで[サーバーを作成](server-engines.md#choose-create-server)します。
2. [SSL 証明書を設定](#ssl_certificate)します。
3. `sslPort` を設定します。

> Jetty を使用した HTTP/2 の完全な実行可能例については、[http2-jetty](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/http2-jetty) を参照してください。
>
{style="tip"}

### Netty {id="netty"}

Netty で HTTP/2 over TLS を使用するには、[Netty `tcnative`](https://netty.io/wiki/forked-tomcat-native.html) OpenSSL バインディングを追加します。

次の例では、静的リンクされた BoringSSL 実装を <Path>build.gradle.kts</Path> ファイルに追加します。

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

`tc.native.classifier` には、`linux-x86_64`、`osx-x86_64`、または `windows-x86_64` を指定できます。

> Netty を使用した HTTP/2 の完全な実行可能例については、[http2-netty](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/http2-netty) を参照してください。
> 
{style="tip"}

## TLS なしの HTTP/2 {id="http2-without-tls"}

Netty エンジンは、TLS なしでの HTTP/2 通信を可能にする [HTTP/2 over cleartext (h2c)](https://httpwg.org/specs/rfc7540.html#discover-http) をサポートしています。
これは、暗号化が不要なプライベートネットワーク内で役立ちます。

クライアントは h2c を使用して直接接続するか、HTTP/1.1 接続を HTTP/2 にアップグレードできます。

h2c を有効にするには、エンジン設定で `enableH2c` と `enableHttp2` の両方のオプションを `true` に設定します。

```kotlin
embeddedServer(Netty, configure = {
    connector {
        port = 8080
    }
    enableHttp2 = true
    enableH2c = true
})
```

同一サーバー上で h2c と HTTP/2 over TLS の両方を有効にすることも可能です。クリアテキスト（平文）コネクタは h2c 接続を受け付け、SSL コネクタは HTTP/2 over TLS を使用します。