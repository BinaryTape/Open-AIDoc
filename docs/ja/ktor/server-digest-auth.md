[//]: # (title: Ktor ServerにおけるDigest認証)

<show-structure for="chapter" depth="2"/>

<var name="artifact_name" value="ktor-server-auth"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.auth"/>

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
    <b><Links href="server-native.md" summary="KtorはKotlin/Nativeをサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。">Nativeサーバー</Links>のサポート</b>: ✖️
</p>
</tldr>

Digest認証スキームは、アクセス制御と認証に使用される[HTTPフレームワーク](https://developer.mozilla.org/ja/docs/Web/HTTP/Authentication)の一部です。このスキームでは、ユーザー名とパスワードをネットワーク経由で送信する前にハッシュ関数が適用されます。

Ktorは[RFC 7616](https://datatracker.ietf.org/doc/html/rfc7616)（HTTP Digest Access Authentication）をサポートしており、より強力なハッシュアルゴリズム、QoP（Quality of Protection）オプション、プライバシー保護のためのユーザー名ハッシュ化などの最新のセキュリティ機能によって従来のRFC 2617を強化しています。

Ktorでは、Digest認証を使用してユーザーをログインさせ、特定の[ルート](server-routing.md)を保護できます。Ktorにおける認証に関する一般的な情報は、[Ktor Serverにおける認証と認可](server-auth.md)セクションを参照してください。

> Digest認証は、パスワードが平文で送信されることがないため、[Basic認証](server-basic-auth.md)よりも強力なセキュリティを提供します。ただし、トランスポートレベルのセキュリティを強化するため、本番環境では[HTTPS/TLS](server-ssl.md)を使用することをお勧めします。

## 依存関係の追加 {id="add_dependencies"}

`digest`認証を有効にするには、ビルドスクリプトに`%artifact_name%`アーティファクトを含める必要があります。

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上記のコードスニペットでは、Ktorの依存関係を指定するために<a href="server-dependencies.topic#using-version-catalog">
            Ktorバージョンカタログ</a>を使用しています。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上記のコードスニペットでは、Ktorの依存関係を指定するために<a href="server-dependencies.topic#using-version-catalog">
            Ktorバージョンカタログ</a>を使用しています。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## Digest認証のフロー {id="flow"}

Digest認証のフローは以下のようになります。

1. クライアントが、サーバーアプリケーション内の特定の[ルート](server-routing.md)に対して`Authorization`ヘッダーなしでリクエストを送信します。
2. サーバーはクライアントに`401`（Unauthorized）レスポンスステータスで応答し、`WWW-Authenticate`レスポンスヘッダーを使用して、ルートの保護にDigest認証スキームが使用されているという情報を提供します。典型的な`WWW-Authenticate`ヘッダーは次のようになります。

   ```
   WWW-Authenticate: Digest
           realm="Access to the '/' path",
           nonce="e4549c0548886bc2",
           algorithm=SHA-512-256,
           qop="auth"
   ```
   {style="block"}

   Ktorでは、`digest`認証プロバイダーを[設定](#configure-provider)する際に、レルム（realm）、サポートするアルゴリズム、QoP（Quality of Protection）、およびnonce値の生成方法を指定できます。

3. 通常、クライアントはユーザーが認証情報を入力できるログインダイアログを表示します。その後、クライアントは次の`Authorization`ヘッダーを付与してリクエストを送信します。

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

   `response`の値は次のように生成されます。

    * `HA1 = H(username:realm:password)`。ここで`H`は設定されたハッシュアルゴリズム（例: SHA-512-256）です。
   > この部分はサーバー上に[保存され](#digest-table)、Ktorがユーザーの認証情報を検証するために使用できます。

    * `HA2 = H(method:digestURI)`（`qop=auth`の場合）、または`HA2 = H(method:digestURI:H(entityBody))`（`qop=auth-int`の場合）

    * `response = H(HA1:nonce:nc:cnonce:qop:HA2)`

4. サーバーはクライアントから送信された認証情報を[検証](#configure-provider)し、要求されたコンテンツで応答します。QoPを使用した認証に成功すると、サーバーは相互認証のために`Authentication-Info`ヘッダーも返します。

## Digest認証のインストール {id="install"}

`digest`認証プロバイダーをインストールするには、`install`ブロック内で[digest](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/digest.html)関数を呼び出します。

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
// ...
install(Authentication) {
    digest {
        // Digest認証を設定
    }
}
```

オプションで、[指定したルートを認証](#authenticate-route)するために使用できる[プロバイダー名](server-auth.md#provider-name)を指定することもできます。

## Digest認証の設定 {id="configure"}

Ktorでさまざまな認証プロバイダーを設定する一般的な方法については、[認証の設定](server-auth.md#configure)を参照してください。このセクションでは、`digest`認証プロバイダー固有の設定について説明します。

### ステップ1: ハッシュアルゴリズムの選択 {id="choose-algorithms"}

KtorはDigest認証向けに複数のハッシュアルゴリズムをサポートしています。サーバーが受け入れるアルゴリズムは、`algorithms`プロパティを使用して設定できます。

| アルゴリズム | 定数 | セキュリティレベル | 備考 |
|------------------|------------------------------------|-----------------|-------------------------------------------------|
| SHA-512-256      | `DigestAlgorithm.SHA_512_256`      | **推奨** | 最も強力なセキュリティ、新規実装で使用 |
| SHA-512-256-sess | `DigestAlgorithm.SHA_512_256_SESS` | **推奨** | セッションバリアント - HA1にクライアントnonceを含む |
| SHA-256          | `DigestAlgorithm.SHA_256`          | 良好 | 本番環境における最低推奨 |
| SHA-256-sess     | `DigestAlgorithm.SHA_256_SESS`     | 良好 | セッションバリアント - HA1にクライアントnonceを含む |
| MD5              | `DigestAlgorithm.MD5`              | **非推奨** | 下位互換性のためのみ |
| MD5-sess         | `DigestAlgorithm.MD5_SESS`         | **非推奨** | セッションバリアント - レガシーな互換性のためのみ |

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

複数のアルゴリズムが設定されている場合、サーバーは複数の`WWW-Authenticate`ヘッダーを送信し、クライアントがサポートする最も強力なアルゴリズムを選択できるようにします。

> デフォルトのアルゴリズムは`SHA-512-256`および`MD5`（古いクライアントとの下位互換性のため）です。

#### セッションアルゴリズム（-sessバリアント） {id="sess-algorithms"}

`-sess`アルゴリズムのバリアント（例: `SHA-512-256-sess`、`SHA-256-sess`、`MD5-sess`）は、`HA1`ハッシュの計算方法を変更します。`H(username:realm:password)`を保存する代わりに、セッションアルゴリズムは`H(H(username:realm:password):nonce:cnonce)`を計算します（`cnonce`はクライアントが提供するnonce）。

**メリット:**

- セッション固有のハッシュにより、事前計算された辞書攻撃を防ぎます
- 1つのセッションのハッシュが侵害されても、パスワードが漏洩したり他のセッションが悪用されたりすることはありません

**デメリット:**

- サーバーは認証リクエストごとにハッシュを計算する必要があります（事前計算された値を使用できません）

ほとんどのアプリケーションでは、特にSHA-512-256のような強力なハッシュ関数と組み合わせて使用する場合、標準の（非セッション）アルゴリズムで十分です。

### ステップ2: ダイジェストを含むユーザーテーブルの提供 {id="digest-table"}

`digest`認証プロバイダーは、ダイジェストメッセージの`HA1`部分を使用してユーザーの認証情報を検証するため、ユーザー名とそれに対応する`HA1`ハッシュを含むユーザーテーブルを提供できます。

アルゴリズムが異なれば生成されるハッシュ値も異なるため、サポートする各アルゴリズムに応じた適切なハッシュを保存するか、クライアントから要求されたアルゴリズムに基づいて動的にハッシュを計算する必要があります。

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

### ステップ3: Digestプロバイダーの設定 {id="configure-provider"}

<Tabs group="auth-dsl">
<TabItem title="クラシック" group-key="classic">

`digest`認証プロバイダーは、[DigestAuthenticationProvider.Config](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-digest-authentication-provider/-config/index.html)クラスを介して設定を公開しています。以下の例では、次の設定が指定されています。

* `realm`プロパティは、`WWW-Authenticate`ヘッダーで渡されるレルムを設定します。
* `algorithms`プロパティは、受け入れるハッシュアルゴリズムを指定します。
* `digestProvider`関数は、指定されたユーザー名とアルゴリズムに対応するダイジェストの`HA1`部分を取得します。
* （オプション）`validate`関数を使用すると、認証情報をカスタムプリンシパルにマッピングできます。

```kotlin
install(Authentication) {
    digest("auth-digest") {
        realm = myRealm
        // 最新のSHA-512-256と
        // レガシーなMD5クライアントの両方をサポート
        algorithms = listOf(
            DigestAlgorithm.SHA_512_256,
            DigestAlgorithm.MD5
        )
        digestProvider { userName, realm, algorithm ->
            // 要求されたアルゴリズムを使用して
            // H(username:realm:password)を計算
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
<TabItem title="型安全" group-key="typed">

<note>
    <p>
        型安全な認証スキームAPIは実験的（experimental）です。予告なしに削除または変更される可能性があります。
        オプトインが必要です。詳細については、
        <a href="server-typed-auth.md#prerequisites">型安全な認証のドキュメント</a>を参照してください。
    </p>
</note>

`digest()`関数は、選択したプリンシパル型のスキームを作成します。`install(Authentication)`ステップは不要です。スキームは、それを必要とするルートに渡す値となります。

```kotlin
data class CustomPrincipal(
    val userName: String,
    val realm: String
)

val digestAuth = digest<CustomPrincipal>("auth-digest") {
    realm = myRealm
    // 最新のSHA-512-256と
    // レガシーなMD5クライアントの両方をサポート
    algorithms = listOf(
        DigestAlgorithm.SHA_512_256,
        DigestAlgorithm.MD5
    )
    digestProvider { userName, realm, algorithm ->
        // 要求されたアルゴリズムを使用して
        // H(username:realm:password)を計算
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

型安全な`digest()`関数はJVMでのみ利用可能です。完全なAPIについては、[型安全な認証](server-typed-auth.md)を参照してください。

</TabItem>
</Tabs>

`digestProvider`関数は3つのパラメータを受け取ります。

- `userName` – クライアントのリクエストからのユーザー名
- `realm` - 設定されたレルム
- `algorithm` – クライアントが使用しているハッシュアルゴリズム

指定されたアルゴリズムで計算された`HA1`ハッシュを返す必要があります。ユーザーが見つからない場合は`null`を返します。

また、[nonceManager](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-digest-authentication-provider/-config/nonce-manager.html)プロパティを使用して、nonce値の生成方法を指定することもできます。

### ステップ4: Quality of Protection（QoP）の設定 {id="configure-qop"}

Quality of Protection（QoP）は、ダイジェスト計算に何を含めるかを決定します。

- `DigestQop.AUTH` – 認証のみ（デフォルト）。ダイジェストにはリクエストメソッドとURIが含まれます。
- `DigestQop.AUTH_INT` – 改ざん防止保護付きの認証。ダイジェストにはリクエストボディも含まれ、改ざんに対する保護を提供します。

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

> `auth-int`を使用する場合、認証中にリクエストボディが消費されます。ルートハンドラー内でボディにアクセスする必要がある場合は、[DoubleReceive](server-double-receive.md)プラグインをインストールしてください。

### ステップ5: 特定のリソースの保護 {id="authenticate-route"}

<Tabs group="auth-dsl">
<TabItem title="クラシック" group-key="classic">

`digest`プロバイダーを設定した後、**[authenticate](server-auth.md#authenticate-route)**関数を使用してアプリケーション内の特定のリソースを保護できます。認証が成功した場合は、ルートハンドラー内で`call.principal`関数を使用して認証済みの[Principal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-principal/index.html)を取得し、認証されたユーザーの名前を取得できます。

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
<TabItem title="型安全" group-key="typed">

スキームを`authenticateWith()`に渡します。ブロック内では、`call.principal`が指定したプリンシパル型となり、決して`null`にならないため、キャストやnullチェックは不要です。

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

### ユーザーハッシュのサポート {id="userhash"}

RFC 7616では、プライバシー保護のためにユーザー名のハッシュ化（`userhash`）が導入されました。これを有効にすると、クライアントは平文のユーザー名の代わりにハッシュ化されたユーザー名を送信できます。

ユーザー名ハッシュをサポートするには、`userHashResolver`を設定します。

```kotlin
val users = listOf("alice", "bob", "charlie")

install(Authentication) {
    digest("auth-digest") {
        realm = "Private API"
        userHashResolver { userhash, realm, algorithm ->
            // ハッシュから実際のユーザー名を検索
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

`userHashResolver`が設定されている場合、サーバーは`WWW-Authenticate`チャレンジヘッダーで`userhash=true`を通知します。

### 厳格なRFC 7616モード {id="strict-mode"}

レガシーなクライアント要件のない新規アプリケーションで最大限のセキュリティを確保するには、`strictRfc7616Mode()`を使用します。

```kotlin
install(Authentication) {
    digest("auth-digest") {
        realm = "Secure Zone"
        strictRfc7616Mode()
        digestProvider { userName, realm, algorithm ->
            // 厳格モードではアルゴリズムがMD5になることはありません
        }
    }
}
```

厳格モードの動作:

- MD5アルゴリズムを削除（SHA-256、SHA-512-256、およびそれらのセッションバリアントのみを許可）
- UTF-8文字セットを強制

### UTF-8文字セットのサポート {id="charset"}

`digest`認証プロバイダーは、非ASCII文字を含むユーザー名とパスワードに対してUTF-8文字セットをサポートしています。

```kotlin
install(Authentication) {
    digest("auth-digest") {
        realm = "My App"
        charset = Charsets.UTF_8  // これがデフォルトです
        // ...
    }
}
```

### Authentication-Infoヘッダー {id="auth-info"}

QoPを使用した認証に成功すると、サーバーは自動的に以下を含む`Authentication-Info`ヘッダーを返します。

- `rspauth` - 相互認証のためのレスポンス認証値
- `nextnonce` - クライアントが次に使用するnonce
- `qop`、`nc`、`cnonce` - 認証パラメータのエコー

これにより、クライアントはサーバーの身元を検証できます（相互認証）。

## セキュリティに関する推奨事項 {id="security"}

1. **SHA-512-256またはSHA-256を使用する** - 本番環境ではMD5を避けてください。これはレガシーな互換性のためだけに含まれています。

2. **`strictRfc7616Mode()`を使用する** - レガシーなクライアント要件のない新規アプリケーション向け。

3. **適切なnonce管理を実装する** – 分散環境でのリプレイ攻撃を防ぐために、カスタムの`NonceManager`を使用してください。

4. **`auth-int`を検討する** - アプリケーションにとってリクエストボディの整合性が重要な場合。

5. **`userhash`を有効にする** - ユーザー名のプライバシーを保護するため。

6. **常にHTTPSを使用する** – Digest認証単体ではトラフィックは暗号化されません。本番環境では常にTLSを使用してください。