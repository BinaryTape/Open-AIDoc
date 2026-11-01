[//]: # (title: APIキー認証)

<show-structure for="chapter" depth="2"/>

<var name="artifact_name" value="ktor-server-auth-api-key"/>

<tldr>
<p>
<b>必須の依存関係</b>: <code>io.ktor:ktor-server-auth</code>, <code>io.ktor:%artifact_name%</code>
</p>
<p>
    <b><Links href="server-native.md" summary="KtorはKotlin/Nativeをサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。">ネイティブサーバー</Links>のサポート</b>: ✅
</p>
</tldr>

APIキー認証は、クライアントがリクエストの一部（通常はヘッダー内）として秘密キーを送信するシンプルな認証方式です。このキーは、識別子と認証メカニズムの両方として機能します。

Ktorでは、[ルート](server-routing.md)を保護しクライアントリクエストを検証するためにAPIキー認証を使用できます。

> Ktorにおける認証に関する一般的な情報は、[Ktor Serverでの認証と認可](server-auth.md)セクションを参照してください。

> APIキーは秘密として保持し、安全に送信する必要があります。転送中のAPIキーを保護するために[HTTPS/TLS](server-ssl.md)を使用することをお勧めします。
>
{style="note"}

## 依存関係の追加 {id="add_dependencies"}

APIキー認証を有効にするには、ビルドスクリプトに `ktor-server-auth` と `%artifact_name%` アーティファクトを追加します。

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">

```kotlin
implementation("io.ktor:%artifact_name%:$ktor_version")
implementation("io.ktor:ktor-server-auth:$ktor_version")
```
</TabItem>
<TabItem title="Gradle (Groovy)" group-key="groovy">

```Groovy
implementation "io.ktor:%artifact_name%:$ktor_version"
implementation "io.ktor:ktor-server-auth:$ktor_version"

```
</TabItem>

<TabItem title="Maven" group-key="maven">

```xml
<dependency>
    <groupId>io.ktor</groupId>
    <artifactId>%artifact_name%-jvm</artifactId>
    <version>${ktor_version}</version>
</dependency>
<dependency>
    <groupId>io.ktor</groupId>
    <artifactId>ktor-server-auth</artifactId>
    <version>${ktor_version}</version>
</dependency>
```

</TabItem>
</Tabs>

## APIキー認証フロー {id="flow"}

APIキー認証のフローは以下のようになります。

1. クライアントがサーバーアプリケーションの特定の[ルート](server-routing.md)に対して、ヘッダー（通常は `X-API-Key`）にAPIキーを含めてリクエストを送信します。
2. サーバーはカスタム検証ロジックを使用してAPIキーを検証します。
3. キーが有効な場合、サーバーは要求されたコンテンツを返します。キーが無効または不足している場合、サーバーは `401 Unauthorized` ステータスを返します。

## APIキー認証のインストール {id="install"}

`apiKey` 認証プロバイダーをインストールするには、`install(Authentication)` ブロック内で [`apiKey`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/api-key.html) 関数を呼び出します。

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
// ...
install(Authentication) {
    apiKey {
        // APIキー認証の設定
    }
}
```

オプションで、[特定のルートを認証する](#authenticate-route)ために使用できる[プロバイダー名](server-auth.md#provider-name)を指定することもできます。

## APIキー認証の設定 {id="configure"}

このセクションでは、`apiKey` 認証プロバイダーの具体的な設定について説明します。

> Ktorでさまざまな認証プロバイダーを設定する方法については、[認証の設定](server-auth.md#configure)を参照してください。

### ステップ 1: APIキープロバイダーを設定する {id="configure-provider"}

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

`apiKey` 認証プロバイダーは、[`ApiKeyAuthenticationProvider.Config`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-api-key-authentication-provider/-config/index.html) クラスを介して設定を公開します。以下の例では、次の設定が指定されています。

* `validate` 関数はリクエストから抽出されたAPIキーを受け取り、認証に成功した場合は `Principal` を返し、失敗した場合は `null` を返します。

最小限の例を以下に示します。

```kotlin
data class AppPrincipal(val key: String) : Principal

install(Authentication) {
    apiKey {
        validate { keyFromHeader ->
            val expectedApiKey = "this-is-expected-key"
            keyFromHeader
                .takeIf { it == expectedApiKey }
                ?.let { AppPrincipal(it) }
        }
    }
}
```

</TabItem>
<TabItem title="Type-safe" group-key="typed">

<note>
    <p>
        タイプセーフ認証スキームAPIは実験的（experimental）です。いつでも削除または変更される可能性があります。オプトインが必要です。詳細については、<a href="server-typed-auth.md#prerequisites">タイプセーフ認証のドキュメント</a>を参照してください。
    </p>
</note>

`apiKey()` 関数は、選択したプリンシパルタイプのスキームを作成します。`install(Authentication)` ステップはありません。スキームは、それを必要とするルートに渡す値となります。

```kotlin
data class AppPrincipal(val key: String)

val apiKeyAuth = apiKey<AppPrincipal>("api-key") {
    validate { keyFromHeader ->
        val expectedApiKey = "this-is-expected-key"
        keyFromHeader
            .takeIf { it == expectedApiKey }
            ?.let { AppPrincipal(it) }
    }
}
```

クラシックプロバイダーとは異なり、名前が必須です。完全なAPIについては、[タイプセーフ認証](server-typed-auth.md)を参照してください。

</TabItem>
</Tabs>

#### キーの場所のカスタマイズ {id="key-location"}

デフォルトでは、`apiKey` プロバイダーは `X-API-Key` ヘッダーからAPIキーを探します。

`headerName` を使用してカスタムヘッダーを指定できます。

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

```kotlin
apiKey("api-key-header") {
    headerName = "X-Secret-Key"
    validate { key ->
        // ...
    }
}
```

</TabItem>
<TabItem title="Type-safe" group-key="typed">

```kotlin
val apiKeyAuth = apiKey<AppPrincipal>("api-key-header") {
    headerName = "X-Secret-Key"
    validate { key ->
        // ...
    }
}
```

</TabItem>
</Tabs>

### ステップ 2: APIキーを検証する {id="validate"}

検証ロジックはアプリケーションの要件によって異なります。一般的なアプローチを以下に示します。

#### 静的キーの比較 {id="static-key"}

単純なケースでは、事前定義されたキーと比較できます。

```kotlin
apiKey {
    validate { keyFromHeader ->
        val expectedApiKey = 
            environment.config.property("api.key").getString()
        keyFromHeader
            .takeIf { it == expectedApiKey }
            ?.let { AppPrincipal(it) }
    }
}
```

> 機密性の高いAPIキーは、ソースコード内ではなく、設定ファイルや環境変数に保存してください。
>
{style="note"}

#### データベース検索 {id="database-lookup"}

複数のAPIキーを扱う場合は、データベースと照合して検証します。

```kotlin
apiKey {
    validate { keyFromHeader ->
        // データベースでキーを検索
        val user = database.findUserByApiKey(keyFromHeader)
        user?.let { UserIdPrincipal(it.username) }
    }
}
```

#### 複数の検証基準 {id="multiple-criteria"}

複雑な検証ロジックを実装することもできます。

```kotlin
apiKey {
    validate { keyFromHeader ->
        val apiKey = database.findApiKey(keyFromHeader)

        // キーが存在し、アクティブで、有効期限が切れていないか確認
        if (apiKey != null &&
            apiKey.isActive &&
            apiKey.expiresAt > Clock.System.now()
        ) {
            UserIdPrincipal(apiKey.userId)
        } else {
            null
        }
    }
}
```

### ステップ 3: チャレンジの設定 {id="challenge"}

`challenge` 関数を使用すると、認証に失敗したときに送信されるレスポンスをカスタマイズできます。

```kotlin
apiKey {
    validate { key ->
        // 検証ロジック
    }
    challenge { defaultScheme, realm ->
        call.respond(
            HttpStatusCode.Unauthorized,
            "Invalid or missing API key"
        )
    }
}
```

### ステップ 4: 特定のリソースを保護する {id="authenticate-route"}

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

`apiKey` プロバイダーを設定した後、[`authenticate`](server-auth.md#authenticate-route) 関数を使用してアプリケーション内の特定のリソースを保護できます。認証に成功した場合、ルートハンドラー内で `call.principal` 関数を使用して認証されたプリンシパルを取得できます。

```kotlin
routing {
    authenticate {
        get("/") {
            val principal = call.principal<AppPrincipal>()!!
            val key = principal.key
            call.respondText("Hello! Your key: $key")
        }
    }
}
```

</TabItem>
<TabItem title="Type-safe" group-key="typed">

スキームを `authenticateWith()` に渡します。ブロック内では、`call.principal` は指定したプリンシパルタイプになり、決して `null` にはならないため、`!!` は不要です。

```kotlin
routing {
    authenticateWith(apiKeyAuth) {
        get("/") {
            val key = call.principal.key
            call.respondText("Hello! Your key: $key")
        }
    }
}
```

</TabItem>
</Tabs>

## APIキー認証の例 {id="complete-example"}

以下は、APIキー認証の完全な最小限の例です。

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

data class AppPrincipal(val key: String) : Principal

fun Application.module() {
    val expectedApiKey = "this-is-expected-key"

    install(Authentication) {
        apiKey {
            validate { keyFromHeader ->
                keyFromHeader
                    .takeIf { it == expectedApiKey }
                    ?.let { AppPrincipal(it) }
            }
        }
    }

    routing {
        authenticate {
            get("/") {
                val principal = call.principal<AppPrincipal>()!!
                call.respondText("Key: ${principal.key}")
            }
        }
    }
}
```

## ベストプラクティス {id="best-practices"}

APIキー認証を実装する際は、以下のベストプラクティスを考慮してください。

1. **HTTPSを使用する**: 傍受を防ぐため、常にHTTPS経由でAPIキーを送信してください。
2. **安全に保存する**: APIキーをソースコード内に直接ハードコードしないでください。環境変数や安全な設定管理機能を使用してください。
3. **キーのローテーション**: APIキーを定期的にローテーションするメカニズムを実装してください。
4. **レート制限**: 悪用を防ぐために、APIキー認証とレート制限（Rate limiting）を組み合わせてください。
5. **ロギング**: セキュリティ監視のために認証失敗をログに記録しますが、実際のAPIキー自体は決してログ出力しないでください。
6. **キーの形式**: APIキーには暗号学的に安全なランダム文字列を使用してください（例: UUIDやBase64エンコードされたランダムバイト列）。
7. **複数のキー**: 用途やアプリケーションごとに、ユーザー1人あたり複数のAPIキーをサポートすることを検討してください。
8. **有効期限**: セキュリティを強化するために、キーの有効期限を実装してください。