[//]: # (title: Ktor ServerにおけるDigest認証)

<show-structure for="chapter" depth="2"/>

<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="auth-digest"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">Nativeサーバー</Links>のサポート</b>: ✖️
</p>
</tldr>

Digest認証スキームは、アクセス制御と認証に使用される[HTTPフレームワーク](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)の一部です。このスキームでは、ユーザー名とパスワードをネットワーク経由で送信する前に、ハッシュ関数が適用されます。

Ktorは[RFC 7616](https://datatracker.ietf.org/doc/html/rfc7616) (HTTP Digest Access Authentication) をサポートしています。これは、より強力なハッシュアルゴリズム、保護品質（QoP）のオプション、プライバシーのためのユーザー名ハッシュなどの現代的なセキュリティ機能により、古いRFC 2617を強化したものです。

Ktorでは、ユーザーのログインや特定の[ルート](server-routing.md)を保護するためにDigest認証を使用できます。Ktorにおける認証全般に関する情報は、[Ktor Serverにおける認証と認可](server-auth.md)セクションで確認できます。

> Digest認証は、パスワードがプレーンテキストで送信されないため、[Basic認証](server-basic-auth.md)よりも強力なセキュリティを提供します。ただし、トランスポート層のセキュリティを強化するために、本番環境では[HTTPS/TLS](server-ssl.md)を使用することをお勧めします。

## 依存関係の追加 {id="add_dependencies"}

`digest`認証を有効にするには、ビルドスクリプトに`%artifact_name%`アーティファクトを含める必要があります。

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"/>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"/>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## Digest認証のフロー {id="flow"}

Digest認証のフローは以下の通りです。

1. クライアントが、サーバーアプリケーション内の特定の[ルート](server-routing.md)に対して、`Authorization`ヘッダーなしでリクエストを送信します。
2. サーバーはクライアントに対して`401` (Unauthorized) レスポンスステータスを返し、`WWW-Authenticate`レスポンスヘッダーを使用して、ルートの保護にDigest認証スキームが使用されているという情報を提供します。典型的な`WWW-Authenticate`ヘッダーは以下のようになります。

   ```
   WWW-Authenticate: Digest
           realm="Access to the '/' path",
           nonce="e4549c0548886bc2",
           algorithm=SHA-512-256,
           qop="auth"
   ```
   {style="block"}

   Ktorでは、`digest`認証プロバイダーを[設定](#configure-provider)する際に、レルム、サポートされるアルゴリズム、保護品質、およびノンス（nonce）値の生成方法を指定できます。

3. 通常、クライアントはユーザーが認証情報を入力できるログインダイアログを表示します。その後、クライアントは以下の`Authorization`ヘッダーを含むリクエストを送信します。

   ```
   Authorization: Digest username="jetbrains",
           realm="Access to the '/' path",
           nonce="e4549c0548886bc2",
           uri="/",
           algorithm=SHA-512-256,
           qop=auth,
           nc=00000001,
           cnonce="0a4f113b",
           response="6629fae49393a05397450978507c4ef1"
   ```
   {style="block"}

   `response`値は以下のように生成されます。

    * `HA1 = H(username:realm:password)`。ここで `H` は設定されたハッシュアルゴリズム（例：SHA-512-256）です。
   > この部分はサーバーに[保存され](#digest-table)、Ktorがユーザーの認証情報を検証するために使用されます。

    * `HA2 = H(method:digestURI)` (`qop=auth`の場合) または `HA2 = H(method:digestURI:H(entityBody))` (`qop=auth-int`の場合)

    * `response = H(HA1:nonce:nc:cnonce:qop:HA2)`

4. サーバーはクライアントから送信された認証情報を[検証](#configure-provider)し、要求されたコンテンツを返します。QoPを使用した認証に成功すると、サーバーは相互認証のために`Authentication-Info`ヘッダーも返します。

## Digest認証のインストール {id="install"}

`digest`認証プロバイダーをインストールするには、`install`ブロック内で[digest](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/digest.html)関数を呼び出します。

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
// ...
install(Authentication) {
    digest {
        // Digest認証の設定
    }
}
```

オプションで、[特定のルートの認証](#authenticate-route)に使用できる[プロバイダー名](server-auth.md#provider-name)を指定することもできます。

## Digest認証の設定 {id="configure"}

Ktorでさまざまな認証プロバイダーを設定する方法の概要については、[認証の設定](server-auth.md#configure)を参照してください。このセクションでは、`digest`認証プロバイダー固有の設定について説明します。

### ステップ 1: ハッシュアルゴリズムの選択 {id="choose-algorithms"}

KtorはDigest認証のために複数のハッシュアルゴリズムをサポートしています。サーバーが受け入れるアルゴリズムは `algorithms` プロパティを使用して設定できます。

| アルゴリズム | 定数 | セキュリティレベル | 備考 |
|------------------|------------------------------------|-----------------|-------------------------------------------------|
| SHA-512-256      | `DigestAlgorithm.SHA_512_256`      | **推奨** | 最も強力なセキュリティ、新規実装に使用 |
| SHA-512-256-sess | `DigestAlgorithm.SHA_512_256_SESS` | **推奨** | セッションバリアント - HA1にクライアントノンスを含む |
| SHA-256          | `DigestAlgorithm.SHA_256`          | 良好 | 本番環境での最小推奨設定 |
| SHA-256-sess     | `DigestAlgorithm.SHA_256_SESS`     | 良好 | セッションバリアント - HA1にクライアントノンスを含む |
| MD5              | `DigestAlgorithm.MD5`              | **非推奨** | 後方互換性のためのみ |
| MD5-sess         | `DigestAlgorithm.MD5_SESS`         | **非推奨** | セッションバリアント - レガシー互換性のためのみ |

```kotlin
install(Authentication) {
    digest("auth-digest") {
        realm = "Access to the '/' path"
        algorithms = listOf(
            DigestAlgorithm.SHA_512_256,
            DigestAlgorithm.MD5
        )
        // ...
    }
}
```

複数のアルゴリズムが設定されている場合、サーバーは複数の `WWW-Authenticate` ヘッダーを送信し、クライアントがサポートする最も強力なアルゴリズムを選択できるようにします。

> デフォルトのアルゴリズムは `SHA-512-256` と `MD5`（古いクライアントとの後方互換性のため）です。

#### セッションアルゴリズム (-sess バリアント) {id="sess-algorithms"}

`-sess` アルゴリズムバリアント（例：`SHA-512-256-sess`、`SHA-256-sess`、`MD5-sess`）は、`HA1` ハッシュの計算方法を変更します。`H(username:realm:password)` を保存する代わりに、セッションアルゴリズムは `H(H(username:realm:password):nonce:cnonce)` を計算します。ここで `cnonce` はクライアントから提供されるノンスです。

**利点:**

- セッション固有のハッシュにより、事前計算された辞書攻撃を防ぎます
- 1つのセッションのハッシュが漏洩しても、パスワードが明らかになったり、他のセッションに影響を与えたりすることはありません

**欠点:**

- サーバーは認証リクエストごとにハッシュを計算する必要があります（事前計算された値を使用できません）

ほとんどのアプリケーションでは、特に SHA-512-256 のような強力なハッシュ関数を使用する場合、標準（非セッション）アルゴリズムで十分です。

### ステップ 2: Digestを含むユーザーテーブルを提供する {id="digest-table"}

`digest`認証プロバイダーは、Digestメッセージの `HA1` 部分を使用してユーザー認証情報を検証します。そのため、ユーザー名と対応する `HA1` ハッシュを含むユーザーテーブルを提供できます。

アルゴリズムが異なれば生成されるハッシュ値も異なるため、サポートする各アルゴリズムに対応する適切なハッシュを保存するか、クライアントから要求されたアルゴリズムに基づいて動的にハッシュを計算する必要があります。

```kotlin
val userPasswords: Map<String, String> = mapOf(
    "jetbrains" to "foobar",
    "admin" to "password"
)

fun computeHash(
    userName: String,
    realm: String,
    password: String,
    algorithm: DigestAlgorithm
): ByteArray =
    algorithm.toDigester()
        .digest("$userName:$realm:$password".toByteArray(UTF_8))
```

### ステップ 3: Digestプロバイダーを設定する {id="configure-provider"}

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

`digest`認証プロバイダーは、[DigestAuthenticationProvider.Config](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-digest-authentication-provider/-config/index.html)クラスを通じて設定を公開します。以下の例では、次の設定が指定されています。

* `realm` プロパティは、`WWW-Authenticate` ヘッダーに渡されるレルムを設定します。
* `algorithms` プロパティは、受け入れるハッシュアルゴリズムを指定します。
* `digestProvider` 関数は、指定されたユーザー名とアルゴリズムに対する Digest の `HA1` 部分を取得します。
* （オプション）`validate` 関数を使用すると、認証情報をカスタムプリンシパルにマッピングできます。

```kotlin
install(Authentication) {
    digest("auth-digest") {
        realm = myRealm
        // 現代的な SHA-512-256 とレガシーな MD5 クライアントの両方をサポート
        algorithms = listOf(
            DigestAlgorithm.SHA_512_256,
            DigestAlgorithm.MD5
        )
        digestProvider { userName, realm, algorithm ->
            // 要求されたアルゴリズムを使用して H(username:realm:password) を計算
            userPasswords[userName]?.let { password ->
                computeHash(
                    userName, realm, password, algorithm
                )
            }
        }
        validate { credentials ->
            if (credentials.userName.isNotEmpty()) {
                CustomPrincipal(
                    credentials.userName,
                    credentials.realm
                )
            } else {
                null
            }
        }
    }
}
```

</TabItem>
<TabItem title="Type-safe" group-key="typed">

<note>
    <p>
        型安全な認証スキームAPIは実験的（Experimental）です。いつでも廃止または変更される可能性があります。オプトインが必要です。詳細については、<a href="server-typed-auth.md#prerequisites">APIの有効化</a>を参照してください。
    </p>
</note>

`digest()` 関数は、選択したプリンシパル型のスキームを作成します。`install(Authentication)` ステップは不要で、スキームはそれを必要とするルートに渡す値となります。

```kotlin
data class CustomPrincipal(
    val userName: String,
    val realm: String
)

val digestAuth = digest<CustomPrincipal>("auth-digest") {
    realm = myRealm
    // 現代的な SHA-512-256 とレガシーな MD5 クライアントの両方をサポート
    algorithms = listOf(
        DigestAlgorithm.SHA_512_256,
        DigestAlgorithm.MD5
    )
    digestProvider { userName, realm, algorithm ->
        // 要求されたアルゴリズムを使用して H(username:realm:password) を計算
        userPasswords[userName]?.let { password ->
            computeHash(userName, realm, password, algorithm)
        }
    }
    validate { credentials ->
        if (credentials.userName.isNotEmpty()) {
            CustomPrincipal(
                credentials.userName,
                credentials.realm
            )
        } else {
            null
        }
    }
}
```

型安全な `digest()` 関数はJVMでのみ利用可能です。完全なAPIについては、[型安全な認証](server-typed-auth.md)を参照してください。

</TabItem>
</Tabs>

`digestProvider` 関数は3つのパラメータを受け取ります。

- `userName` – クライアントのリクエストからのユーザー名
- `realm` - 設定されたレルム
- `algorithm` – クライアントが使用しているハッシュアルゴリズム

指定されたアルゴリズムで計算された `HA1` ハッシュを返す必要があります。ユーザーが見つからない場合は `null` を返します。

また、[nonceManager](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-digest-authentication-provider/-config/nonce-manager.html)プロパティを使用して、ノンス値の生成方法を指定することもできます。

### ステップ 4: 保護品質 (QoP) の設定 {id="configure-qop"}

保護品質 (QoP) は、Digest計算に何が含まれるかを決定します。

- `DigestQop.AUTH` – 認証のみ (デフォルト)。DigestにはリクエストメソッドとURIが含まれます。
- `DigestQop.AUTH_INT` – 完全性保護付きの認証。Digestにはリクエストボディも含まれ、改ざんに対する保護を提供します。

```kotlin
install(Authentication) {
    digest("auth-digest") {
        realm = "Secure API"
        supportedQop = listOf(
            DigestQop.AUTH,
            DigestQop.AUTH_INT
        )
        // ...
    }
}
```

> `auth-int` を使用する場合、リクエストボディは認証中に消費されます。ルートハンドラーでボディにアクセスする必要がある場合は、[DoubleReceive](server-double-receive.md)プラグインをインストールしてください。

### ステップ 5: 特定のリソースを保護する {id="authenticate-route"}

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

`digest`プロバイダーを設定した後、**[authenticate](server-auth.md#authenticate-route)**関数を使用してアプリケーション内の特定のリソースを保護できます。認証に成功した場合、ルートハンドラー内で `call.principal` 関数を使用して認証済みの[Principal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-principal/index.html)を取得し、認証されたユーザーの名前を取得できます。

```kotlin
routing {
    authenticate("auth-digest") {
        get("/") {
            val user = call.principal<CustomPrincipal>()
            call.respondText("Hello, ${user?.userName}!")
        }
    }
}
```

</TabItem>
<TabItem title="Type-safe" group-key="typed">

スキームを `authenticateWith()` に渡します。ブロック内では、`call.principal` は指定したプリンシパル型となり、`null` になることはないため、キャストやnullチェックは不要です。

```kotlin
routing {
    authenticateWith(digestAuth) {
        get("/") {
            val user = call.principal
            call.respondText("Hello, ${user.userName}!")
        }
    }
}
```

</TabItem>
</Tabs>

## 高度な設定 {id="advanced"}

### ユーザー名ハッシュのサポート {id="userhash"}

RFC 7616 では、プライバシー保護のためにユーザー名ハッシュ (`userhash`) が導入されました。これが有効な場合、クライアントは平文のユーザー名の代わりに、ハッシュ化されたバージョンのユーザー名を送信できます。

ユーザー名ハッシュをサポートするには、`userHashResolver` を設定します。

```kotlin
val users = listOf("alice", "bob", "charlie")

install(Authentication) {
    digest("auth-digest") {
        realm = "Private API"
        userHashResolver { userhash, realm, algorithm ->
            // ハッシュから実際のユーザー名を見つける
            users.find { username ->
                val digester = algorithm.toDigester()
                val bytes = "$username:$realm".toByteArray()
                hex(digester.digest(bytes)) == userhash
            }
        }
        digestProvider { userName, realm, algorithm ->
            // ...
        }
    }
}
```

`userHashResolver` が設定されている場合、サーバーは `WWW-Authenticate` チャレンジヘッダーで `userhash=true` を通知します。

### 厳格な RFC 7616 モード {id="strict-mode"}

レガシークライアントの要件がない新しいアプリケーションで最大限のセキュリティを確保するには、`strictRfc7616Mode()` を使用します。

```kotlin
install(Authentication) {
    digest("auth-digest") {
        realm = "Secure Zone"
        strictRfc7616Mode()
        digestProvider { userName, realm, algorithm ->
            // 厳格モードではアルゴリズムが MD5 になることはありません
        }
    }
}
```

厳格モードの内容:

- MD5 アルゴリズムを削除します（SHA-256、SHA-512-256、およびそれらのセッションバリアントのみを許可します）
- UTF-8 文字セットを強制します

### UTF-8 文字セットのサポート {id="charset"}

`digest`認証プロバイダーは、非 ASCII 文字を含むユーザー名とパスワードに対して UTF-8 文字セットをサポートしています。

```kotlin
install(Authentication) {
    digest("auth-digest") {
        realm = "My App"
        charset = Charsets.UTF_8  // これがデフォルトです
        // ...
    }
}
```

### Authentication-Info ヘッダー {id="auth-info"}

QoP を使用した認証に成功すると、サーバーは自動的に以下の内容を含む `Authentication-Info` ヘッダーを返します。

- `rspauth` - 相互認証のためのレスポンス認証値
- `nextnonce` - クライアントが次に使用するノンス
- `qop`, `nc`, `cnonce` - 認証パラメータのエコー

これにより、クライアントはサーバーの身元を確認できます（相互認証）。

## セキュリティの推奨事項 {id="security"}

1. **SHA-512-256 または SHA-256 を使用する** – 本番環境での MD5 は避けてください。これはレガシー互換性のためにのみ含まれています。

2. **`strictRfc7616Mode()` を使用する** – レガシークライアントの要件がない新しいアプリケーションの場合。

3. **適切なノンス管理を実装する** – 分散環境でのリプレイ攻撃を防ぐために、カスタムの `NonceManager` を使用してください。

4. **`auth-int` を検討する** – アプリケーションにとってリクエストボディの完全性が重要な場合。

5. **`userhash` を有効にする** – ユーザー名のプライバシー保護のため。

6. **常に HTTPS を使用する** – Digest認証だけではトラフィックを暗号化しません。本番環境では常に TLS を使用してください。