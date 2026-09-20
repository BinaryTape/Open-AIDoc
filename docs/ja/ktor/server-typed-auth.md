[//]: # (title: 型安全な認証)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
</tldr>

<link-summary>
型安全な認証スキームAPIはプリンシパルの型をルートにバインドするため、キャストやnullチェックを行わずに非nullのプリンシパルを読み取ることができます。
</link-summary>

Ktorは、認証スキームをプリンシパルの型にバインドする型安全な認証スキームAPIを提供しています。スキームを一度作成してルートに渡すだけで、キャストやnullチェックを行わずにプリンシパルを読み取ることができます。

> このAPIは、[`install(Authentication)`](server-auth.md) アプローチの代替手段です。両方のAPIを同じアプリケーション内で使用でき、一方のAPIを使用するルートをもう一方のAPIを使用するルートの内側にネストすることも可能です。
> 
{style="tip"}

## 依存関係の追加 {id="add_dependencies"}

型安全な認証を使用するには、ビルドスクリプトに `ktor-server-auth` アーティファクトを追加します。

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

`jwt` スキームを使用する場合は、`ktor-server-auth-jwt` アーティファクトを追加します。

<var name="artifact_name" value="ktor-server-auth-jwt"/>
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

`apiKey` スキームを使用する場合は、`ktor-server-auth-api-key` アーティファクトを追加します。

<var name="artifact_name" value="ktor-server-auth-api-key"/>
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

## APIを有効化する {id="prerequisites"}

このAPIには `@ExperimentalKtorApi` のアノテーションが付与されているため、オプトインする必要があります。

```kotlin
@OptIn(ExperimentalKtorApi::class)
fun Application.module() {
    // ...
}
```

ルートビルダーはKotlinの[コンテキストパラメータ](https://kotlinlang.org/docs/context-parameters.html)（context parameters）を使用します。Kotlin 2.4.0ではコンテキストパラメータがデフォルトで有効になっています。Kotlin 2.2.xまたは2.3.xを使用している場合は、ビルドスクリプトで有効化してください。

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xcontext-parameters")
    }
}
```

## プリンシパルの定義 {id="principal"}

プリンシパル（Principal）は、アプリケーションが認証された呼び出し元に関連付けるアイデンティティやその他の情報を表します。プリンシパルの型は非nullでなければなりません。

```kotlin
data class User(
    val id: String,
    val email: String
)
```

## スキームの作成 {id="create-scheme"}

各認証方式には、プリンシパルの型、名前、および設定ブロックを受け取るファクトリ関数が用意されています。`validate {}` ブロックはプリンシパル型を返し、クレデンシャルが拒否された場合は `null` を返します。

```kotlin
val jwtAuth = jwt<User>("my-jwt") {
    realm = "my-app"
    verifier(jwkProvider, issuer)
    validate { credential ->
        val payload = credential.payload
        User(
            id = payload.subject,
            email = payload.getClaim("email").asString()
        )
    }
}
```

ファクトリは値を返します。それを保持し、必要とするルートに渡します。

| Factory                             | Artifact                   | Notes                                   |
|-------------------------------------|----------------------------|-----------------------------------------|
| `basic<P>()`                        | `ktor-server-auth`         | [Ktor ServerでのBasic認証](server-basic-auth.md)を参照            |
| `digest<P>()`                       | `ktor-server-auth`         | JVMのみ。[Ktor ServerでのDigest認証](server-digest-auth.md)を参照 |
| `bearer<P>()`                       | `ktor-server-auth`         | [Ktor ServerでのBearer認証](server-bearer-auth.md)を参照           |
| `form<P>()`                         | `ktor-server-auth`         | [Ktor Serverでのフォームベース認証](server-form-based-auth.md)を参照       |
| `session<S, P>()`                   | `ktor-server-auth`         | [型安全なセッション認証](server-typed-session-auth.md)を参照    |
| `apiKey<P>()`                       | `ktor-server-auth-api-key` | [APIキー認証](server-api-key-auth.md)を参照          |
| `jwt<P>()`                          | `ktor-server-auth-jwt`     | JVMのみ。[JSON Web Token](server-jwt.md)を参照         |
| `oauth2()`, `oauth2Session<P, S>()` | `ktor-server-auth`         | [OAuth 2.0フロー](server-oauth2-flows.md)を参照          |

スキーム名は一意である必要があります。同じ名前で異なる2つのスキームを作成した場合、ルートがそれを使用しようとした際に2つ目のスキームが失敗します。

## ルートの保護 {id="protect-routes"}

ルートを保護するには、`authenticateWith()` 関数にスキームを渡します。ブロック内では、`call.principal` はスキームで定義されたプリンシパル型を持ち、非nullであることが保証されます。

```kotlin
routing {
    authenticateWith(jwtAuth) {
        get("/profile") {
            val user: User = call.principal
            call.respondText(user.email)
        }
    }
}
```

## 認証をオプショナルにする {id="optional"}

サインイン済みの呼び出し元と匿名の呼び出し元の両方を処理するルートには、`authenticateWithOptional()` 関数を使用します。ブロック内では、`call.principalOrNull` を使用してプリンシパルにアクセスします。

```kotlin
routing {
    authenticateWithOptional(jwtAuth) {
        get("/me") {
            val user = call.principalOrNull
            call.respondText(user?.email ?: "anonymous")
        }
    }
}
```

クレデンシャルのないリクエストは成功し、`call.principalOrNull` は `null` のままになります。無効なクレデンシャルを含むリクエストは引き続き失敗します。

## 複数のスキームを受け付ける {id="any-of"}

同じルートで複数のスキームを受け付けるには、`authenticateWithAnyOf()` 関数を使用します。Ktorは指定された順序でスキームを試行し、最初に成功したスキームがプリンシパルを提供します。

すべてのスキームは共通の型に適合するプリンシパルを生成する必要があり、その共通の型を呼び出し時に宣言します。

```kotlin
interface AppUser {
    val email: String
}

data class JwtUser(
    override val email: String,
    val id: String
) : AppUser

data class ApiUser(override val email: String) : AppUser

val jwtScheme = jwt<JwtUser>("my-jwt") { /* ... */ }
val apiKeyScheme = apiKey<ApiUser>("my-api-key") { /* ... */ }

routing {
    // AppUser is 
    authenticateWithAnyOf<AppUser>(jwtScheme, apiKeyScheme) {
        get("/profile") {
            call.respondText(call.principal.email)
        }
    }
}
```

> `authenticateWithAnyOf()` の内部では、`call.principal` のみを利用できます。[セッションスキーム](server-typed-session-auth.md)の `call.session` など、単一のスキームに固有の追加プロパティは利用できません。
>
{style="note"}

## 匿名呼び出し元を許可する {id="anonymous"}

クレデンシャルのない呼び出し元を処理するスキームを構築するには、`orAnonymous()` 関数を使用します。クレデンシャルのないリクエストは、指定したブロックが返すプリンシパルを取得します。無効なクレデンシャルを含むリクエストは引き続き失敗します。

その結果、プリンシパルの型が両者の共通スーパータイプであるスキームが得られます。

```kotlin
interface Identity

data class AuthenticatedUser(val id: String) : Identity
data class GuestUser(val label: String = "guest") : Identity

val feedAuth = jwt<AuthenticatedUser>("my-jwt") {
    verifier(jwkProvider, issuer)
    validate { credential ->
        AuthenticatedUser(credential.payload.subject)
    }
}.orAnonymous { GuestUser() }

routing {
    authenticateWith(feedAuth) {
        get("/feed") {
            when (val user = call.principal) {
                is AuthenticatedUser ->
                    call.respondText(user.id)
                is GuestUser ->
                    call.respondText(user.label)
            }
        }
    }
}
```

## プリンシパルの変換 {id="map-principal"}

`mapPrincipal()` 関数を使用して、データベースからユーザーレコードを読み込むなどして、プリンシパルを別の型に変換します。

```kotlin
data class AppUser(val id: String, val email: String)

val appAuth = jwtAuth.mapPrincipal { jwtUser ->
    userDirectory.find(jwtUser.id)?.let { row ->
        AppUser(id = row.id, email = row.email)
    }
}
```

この変換処理は、スキームがプリンシパルを生成した後にのみ実行されます。変換が `null` を返した場合、リクエストは `401 Unauthorized` で拒否されます。

## ロールのチェック {id="roles"}

ロールチェックはオプトインです。`AuthenticationRole` を実装するロール型を定義し、`withRoles()` を使用してロールを認識するスキームを構築します。

```kotlin
enum class Role : AuthenticationRole {
    User, Admin, Moderator
}

val roleAuth = jwtAuth.withRoles { user ->
    roleService.resolveRoles(user.id)
}
```

`withRoles {}` ブロックは、認証が成功した後にすべてのリクエストで実行されます。データベース、キャッシュ、またはプリンシパル自体からロールを読み込むために使用します。

ルートが必要とするロールを `roles` パラメータで宣言します。

```kotlin
routing {
    authenticateWith(roleAuth, roles = setOf(Role.Admin)) {
        get("/admin") {
            val userRoles: Set<Role> = call.principal.roles
            call.respondText(userRoles.joinToString { it.name })
        }
    }
}
```

認証されたものの必要なロールを持たない呼び出し元は、`403 Forbidden` を受け取ります。呼び出し元は、いずれか1つだけでなく、セットに含まれるすべてのロールを持っている必要があります。

特定のロールを必須とせずにロールを解決するには、`roles = null` を渡します。これはハンドラー自身が判断を下す場合に便利です。

```kotlin
authenticateWith(roleAuth, roles = null) {
    get("/dashboard") {
        if (Role.Admin in call.principal.roles) {
            call.respondText("admin view")
        } else {
            call.respondText("user view")
        }
    }
}
```

`roles` プロパティは、ロール対応ルートの内部にのみ存在します。通常のスキームで保護されたルート上ではコンパイルエラーになります。

## 失敗の処理 {id="failures"}

エラーが発生するケースは2つあり、それぞれ個別に処理されます。

* `onUnauthorized` は認証が失敗したときに実行されます。デフォルトのレスポンスは `401 Unauthorized` です。
* `onForbidden` は認証には成功したものの、呼び出し元に必要なロールがない場合に実行されます。デフォルトのレスポンスは `403 Forbidden` です。

スキームにハンドラーを設定して、そのスキームを使用するすべてのルートをカバーします。

```kotlin
val jwtAuth = jwt<User>("my-jwt") {
    verifier(jwkProvider, issuer)
    validate { credential -> /* ... */ }
    onUnauthorized = { cause ->
        val message = cause.toString()
        call.respond(HttpStatusCode.Unauthorized, message)
    }
}

val roleAuth = jwtAuth.withRoles(
    onForbidden = {
        val forbidden = HttpStatusCode.Forbidden
        call.respondText("Not allowed", status = forbidden)
    }
) { user ->
    roleService.resolveRoles(user.id)
}
```

または、個別のルートにハンドラーを設定して、スキームレベルのハンドラーをオーバーライドします。

```kotlin
authenticateWith(
    roleAuth,
    roles = setOf(Role.Admin),
    onUnauthorized = { call.respondRedirect("/login") },
    onForbidden = {
        val forbidden = HttpStatusCode.Forbidden
        call.respondText("Admins only", status = forbidden)
    },
) {
    get("/admin") {
        call.respondText(call.principal.email)
    }
}
```

Ktorは以下の順序でunauthorizedハンドラーを検索します。

1. `authenticateWith()` に渡されたハンドラー。
2. スキームに設定された `onUnauthorized` ハンドラー。
3. プロバイダーのデフォルトのチャレンジ。

いずれも応答しない場合、リクエストは `401 Unauthorized` で失敗します。

`authenticateWithAnyOf()` の場合、ハンドラーはスキーム名と失敗原因のマップを受け取るため、各スキームがなぜ失敗したかを報告できます。

```kotlin
authenticateWithAnyOf<AppUser>(
    jwtScheme,
    apiKeyScheme,
    onUnauthorized = { failures ->
        val schemes = failures.keys.joinToString()
        call.respond(HttpStatusCode.Unauthorized, schemes)
    }
) {
    get("/profile") { /* ... */ }
}
```

## クラシックAPIとの組み合わせ {id="mixing"}

両方の認証APIを同じアプリケーション内で使用できます。名前付きプロバイダーAPIによって保護されたルートの内側に型安全なルートをネストしたり、型安全なルートの内側にプロバイダーベースのルートをネストしたりできます。

```kotlin
routing {
    authenticate("auth-session") {
        authenticateWith(basicAuth) {
            get("/admin") {
                val basicUser = call.principal
                val sessionUser = 
                    checkNotNull(call.principal<SessionUser>())
                if (basicUser.name == sessionUser.name) {
                    call.respondText("You are ${basicUser.name}!")
                } else {
                    call.respondText("Who are you?")
                }
            }
        }
    }

    authenticate(basicAuth.name) {
        get("/hello") {
            val user = checkNotNull(call.principal<BasicUser>())
            call.respondText("Hello ${user.name}!")
        }
    }
}
```

ネストされた認証レイヤーは順番に適用されます。

## 制限事項 {id="limitations"}

* このAPIは実験的（Experimental）です。マイナーリリースで変更される可能性があります。
* このAPIはKotlinのコンテキストパラメータを使用しており、Kotlin 2.4.0または `-Xcontext-parameters` コンパイラオプションが必要です。
* `authenticateWithAnyOf()` 関数は `call.principal` のみを提供します。その内部では、`call.session` などのスキーム固有のプロパティは利用できません。
* LDAPプロバイダーに相当する型安全な実装はありません。代わりに型付きの `validate {}` ブロック内で [`ldapAuthenticate()`](server-ldap.md) を呼び出してください。