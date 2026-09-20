[//]: # (title: APIキー認証)

<show-structure for="chapter" depth="2"/>

<var name="artifact_name" value="ktor-server-auth-api-key"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:ktor-server-auth</code>, <code>io.ktor:%artifact_name%</code>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">Nativeサーバー</Links>のサポート</b>: ✅
</p>
</tldr>

APIキー認証は、クライアントがリクエストの一部（通常はヘッダー）として秘密鍵を渡す、シンプルな認証方法です。このキーは識別子と認証メカニズムの両方の役割を果たします。

Ktorでは、[ルート](server-routing.md)を保護し、クライアントのリクエストを検証するためにAPIキー認証を使用できます。

> Ktorにおける認証の全般的な情報は、[Ktor Serverでの認証と認可](server-auth.md)セクションで確認できます。

> APIキーは機密として扱い、安全に送信する必要があります。転送中のAPIキーを保護するために、[HTTPS/TLS](server-ssl.md)を使用することをお勧めします。
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

## APIキー認証のフロー {id="flow"}

APIキー認証のフローは以下の通りです。

1. クライアントが、サーバーアプリケーションの特定の[ルート](server-routing.md)に対して、ヘッダー（通常は `X-API-Key`）にAPIキーを含めてリクエストを送信します。
2. サーバーはカスタムの検証ロジックを使用してAPIキーを検証します。
3. キーが有効な場合、サーバーはリクエストされたコンテンツを応答します。キーが無効または欠落している場合、サーバーは `401 Unauthorized` ステータスを応答します。

## APIキー認証のインストール {id="install"}

`apiKey` 認証プロバイダーをインストールするには、`install(Authentication)` ブロック内で [`apiKey`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/api-key.html) 関数を呼び出します。

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
// ...
install(Authentication) {
    apiKey {
        // APIキー認証を設定する
    }
}
```

オプションで、[プロバイダー名](server-auth.md#provider-name)を指定して、[特定のルートを認証](#authenticate-route)するために使用することもできます。

## APIキー認証の設定 {id="configure"}

このセクションでは、`apiKey` 認証プロバイダーの具体的な設定について説明します。

> Ktorでさまざまな認証プロバイダーを設定する方法については、[認証の設定](server-auth.md#configure)を参照してください。

### ステップ 1: APIキープロバイダーの設定 {id="configure-provider"}

<Tabs group="auth-dsl">
<TabItem title="クラシック" group-key="classic">

`apiKey` 認証プロバイダーの設定は、[`ApiKeyAuthenticationProvider.Config`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-api-key-authentication-provider/-config/index.html) クラスを通じて公開されます。以下の例では、次の設定が指定されています。

* `validate` 関数はリクエストから抽出されたAPIキーを受け取り、認証に成功した場合は `Principal` を返し、失敗した場合は `null` を返します。

最小限の例を次に示します。

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
<TabItem title="型安全" group-key="typed">

<note>
    <p>
        型安全な認証スキームAPIは実験的（Experimental）です。予告なく削除または変更される可能性があります。
        オプトインが必要です。詳細については、
        <a href="server-typed-auth.md#prerequisites">APIの有効化</a>を参照してください。
    </p>
</note>

`apiKey()` 関数は、選択したプリンシパル型のスキームを作成します。`install(Authentication)` のステップは不要です。スキームは、それを必要とするルートに渡す値となります。

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

クラシックプロバイダーとは異なり、名前の指定が必須です。完全なAPIについては、[型安全な認証](server-typed-auth.md)を参照してください。

</TabItem>
</Tabs>

#### キーの場所のカスタマイズ {id="key-location"}

デフォルトでは、`apiKey` プロバイダーは `X-API-Key` ヘッダーからAPIキーを探します。

`headerName` を使用してカスタムヘッダーを指定できます。

<Tabs group="auth-dsl">
<TabItem title="クラシック" group-key="classic">

```kotlin
apiKey("api-key-header") {
    headerName = "X-Secret-Key"
    validate { key ->
        // ...
    }
}
```

</TabItem>
<TabItem title="型安全" group-key="typed">

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

### ステップ 2: APIキーの検証 {id="validate"}

検証ロジックはアプリケーションの要件によって異なります。一般的なアプローチは以下の通りです。

#### 静的なキーの比較 {id="static-key"}

単純なケースでは、定義済みのキーと比較できます。

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

> 機密性の高いAPIキーは、ソースコードではなく設定ファイルや環境変数に保存してください。
>
{style="note"}

#### データベースでの検索 {id="database-lookup"}

複数のAPIキーがある場合は、データベースに対して検証します。

```kotlin
apiKey {
    validate { keyFromHeader ->
        // データベースでキーを検索する
        val user = database.findUserByApiKey(keyFromHeader)
        user?.let { UserIdPrincipal(it.username) }
    }
}
```

#### 複数の検証基準 {id="multiple-criteria"}

複雑な検証ロジックを実装できます。

```kotlin
apiKey {
    validate { keyFromHeader ->
        val apiKey = database.findApiKey(keyFromHeader)

        // キーが存在し、アクティブで、期限切れでないかを確認する
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

`challenge` 関数を使用して、認証が失敗したときに送信されるレスポンスをカスタマイズできます。

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

### ステップ 4: 特定のリソースの保護 {id="authenticate-route"}

<Tabs group="auth-dsl">
<TabItem title="クラシック" group-key="classic">

`apiKey` プロバイダーを設定した後、[`authenticate`](server-auth.md#authenticate-route) 関数を使用してアプリケーション内の特定のリソースを保護できます。認証に成功した場合、ルートハンドラー内で `call.principal` 関数を使用して認証済みのプリンシパルを取得できます。

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
<TabItem title="型安全" group-key="typed">

スキームを `authenticateWith()` に渡します。ブロック内では、`call.principal` は指定したプリンシパル型となり、`null` になることはないため、`!!` は不要です。

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

APIキー認証の完全な最小構成の例は以下の通りです。

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

1. **HTTPSを使用する**: 傍受を防ぐため、APIキーは常にHTTPS経由で送信してください。
2. **安全に保存する**: APIキーをソースコードにハードコードしないでください。環境変数または安全な設定管理を使用してください。
3. **キーのローテーション**: APIキーを定期的にローテーションするためのメカニズムを実装してください。
4. **レート制限**: 悪用を防ぐために、APIキー認証をレート制限（Rate limiting）と組み合わせてください。
5. **ロギング**: セキュリティ監視のために認証の失敗をログに記録しますが、実際のAPIキーは決してログに記録しないでください。
6. **キーの形式**: APIキーには暗号学的に安全なランダム文字列（例：UUIDやBase64エンコードされたランダムバイト）を使用してください。
7. **複数のキー**: アプリケーションや目的ごとに、ユーザーあたり複数のAPIキーをサポートすることを検討してください。
8. **有効期限**: セキュリティを強化するために、キーの有効期限を実装してください。