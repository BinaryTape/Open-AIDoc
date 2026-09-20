[//]: # (title: タイプセーフなセッション認証)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>, <code>io.ktor:ktor-server-sessions</code>
</p>
</tldr>

<link-summary>
タイプセーフ認証スキームAPIのsessionスキームは、ルートに非nullのプリンシパルを提供し、保存されたセッションへの読み書きアクセスを可能にします。
</link-summary>

`session` スキームは、[タイプセーフ認証スキームAPI](server-typed-auth.md)の一部です。これは、名前付きプロバイダーの[セッション認証](server-session-auth.md)では一体として扱われていた2つの要素を分離します:

* **セッション**は、アクセストークンやユーザーIDなど、呼び出し元のために保存する値です。
* **プリンシパル**は、完全なユーザーレコードなど、ルートハンドラーが実際に処理で使用する対象です。

保護されたルート内では、`call.session` から保存されたセッションが、`call.principal` からプリンシパルが取得できます。どちらも非nullであり、正しく型付けされています。

<note>
    <p>
        タイプセーフ認証スキームAPIは実験的な機能です。予告なしに廃止または変更される可能性があります。
        利用にはオプトインが必要です。詳細については、
        <a href="server-typed-auth.md#prerequisites">APIの有効化</a>を参照してください。
    </p>
</note>

## セッションスキームの作成 {id="create-scheme"}

`session<S, P>()` ファクトリは、第1型引数にセッション型を、第2型引数にプリンシパル型を取ります。`validate` ブロックは、セッションをプリンシパルに変換するか、セッションを拒否するために `null` を返します。

デフォルトでは、有効なセッションがないリクエストには `401 Unauthorized` が返されます。ブラウザアプリケーションの場合は、代わりに呼び出し元をサインインページにリダイレクトできます。レスポンスを変更するには `onUnauthorized` ハンドラーを設定します:

```kotlin
data class UserSession(val userId: String)
data class User(val id: String, val email: String)

val sessionAuth = session<UserSession, User>("auth-session") {
    validate { session ->
        userRepository.findById(session.userId)
    }
    onUnauthorized = {
        call.respondRedirect("/login")
    }
}
```

`authenticateWith()` に渡されたハンドラーは、そのルートにおいてこの設定を上書きします。処理の優先順位の詳細については、[失敗の処理](server-typed-auth.md#failures)を参照してください。

## トランスポートの選択 {id="transport"}

`transport` プロパティは、セッションがクライアントとサーバー間でどのようにやり取りされるかを制御します:

| トランスポート | クライアントが保持するもの | セッションデータの保持場所 |
|---------------------------------|------------------------------------|--------------------------------------|
| `SessionTransportType.CookieId` | Cookie内のセッションID | サーバー上の `SessionStorage` |
| `SessionTransportType.HeaderId` | ヘッダー内のセッションID | サーバー上の `SessionStorage` |
| `SessionTransportType.Cookie` | Cookie内のシリアライズされたセッション | クライアント上 |
| `SessionTransportType.Header` | ヘッダー内のシリアライズされたセッション | クライアント上 |

デフォルトはインメモリストレージに基づく `CookieId` であり、セッションデータをサーバー上に保持します:

```kotlin
val storage = SessionStorageMemory()

val sessionAuth = session<UserSession, User>("auth-session") {
    transport = SessionTransportType.CookieId(storage) {
        cookie.path = "/"
        cookie.maxAgeInSeconds = 3600
        cookie.httpOnly = true
    }
    validate { session ->
        userRepository.findById(session.userId)
    }
}
```

`SessionStorageMemory` は再起動時にすべてのデータが失われ、インスタンス間でも共有されないため、ローカル開発に適しています。
本番環境では、`directorySessionStorage()` などの永続ストレージや、独自の `SessionStorage` 実装を使用してください。

> `Cookie` および `Header` トランスポートは、セッションの値を直接クライアントに送信します。この値は呼び出し元の身元そのものであるため、保護がないとクライアントが値を偽造して任意のユーザーとしてサインインできてしまいます。値渡し（by-value）のトランスポートを使用する場合は、`SessionTransportTransformerEncrypt` などのトランスフォーマーを追加してください:
> ```kotlin
> val transformer = SessionTransportTransformerEncrypt(
>     encryptKey, 
>     signKey
> )
> transport = SessionTransportType.Cookie {
>     transform(transformer)
> }
> ```
>
{style="warning"}

## Sessionsプラグインのインストール {id="install-sessions"}

セッションスキームは [Sessions](server-sessions.md) プラグインを介してセッションを読み取るため、ルートでスキームを使用する前にプラグインをインストールしておく必要があります。スキームを `install()` に渡すと、Ktorによって設定済みのトランスポートが適用されます:

```kotlin
fun Application.module() {
    install(sessionAuth)

    routing {
        authenticateWith(sessionAuth) {
            get("/profile") {
                call.respondText(call.principal.email)
            }
        }
    }
}
```

単一のルートサブツリーにインストールすることも可能です:

```kotlin
routing {
    route("/app") {
        install(sessionAuth)

        authenticateWith(sessionAuth) {
            get("/profile") { /* ... */ }
        }
    }
}
```

`Sessions` を自身で設定する場合は、スキームとプラグイン間で名前、型、トランスポートを一致させるために、設定ブロック内で `applyTransport()` を呼び出してください:

```kotlin
install(Sessions) {
    sessionAuth.applyTransport()
    cookie<OtherSession>("other-session")
}
```

プラグインが存在しない場合や、スキームの名前およびセッション型に一致するプロバイダーがない場合、スキームは起動時に失敗します。

## セッションの読み取りと変更 {id="read-write"}

セッションスキームで保護されたルート内では、`call.session` は読み書き可能なプロパティになります:

```kotlin
routing {
    authenticateWith(sessionAuth) {
        get("/profile") {
            val session = call.session
            call.respondText("Signed in as ${session.userId}")
        }

        post("/switch-team") {
            val teamId = call.receiveText()
            call.session = call.session.copy(teamId = teamId)
            call.respondText("Switched")
        }
    }
}
```

同じブロック内で以下のアクセサーが利用可能です:

| アクセサー | 目的 |
|--------------------------|----------------------------------------------------------------------------|
| `call.session` | セッションの読み取りまたは置き換えを行います。 |
| `call.updateSession { }` | セッションを読み取り、変更を適用し、結果を保存してそれを返します。 |
| `call.clearSession()` | セッションを削除し、呼び出し元をサインアウトします。 |

新しい値が古い値に依存する場合は、`updateSession` を使用してください:

```kotlin
post("/increment") {
    val updated = call.updateSession {
        it.copy(visits = it.visits + 1)
    }
    call.respondText("Visits: ${updated.visits}")
}
```

`authenticateWithOptional()` の内部ではセッションがまったく存在しない可能性があるため、`call.session` は利用できません。代わりに `call.sessionOrNull` を使用してください:

```kotlin
routing {
    authenticateWithOptional(sessionAuth) {
        get("/greeting") {
            val message = when (call.sessionOrNull) {
                null -> "Hello, guest"
                else -> "Welcome back"
            }
            call.respondText(message)
        }
    }
}
```

## ユーザーのサインインとサインアウト {id="login-logout"}

スキーム上の `setSession()` および `clearSession()` は、そのスキームで保護されているかどうかに関係なく、任意のルートで動作します。

サインインは、スキームによって保護されていないルートに配置する必要があります。呼び出し元はまだセッションを持っていないため、保護されたルートではハンドラーが実行される前にリクエストが拒否されてしまいます:

```kotlin
routing {
    post("/login") {
        val credentials = call.receive<LoginRequest>()
        val user = userRepository.authenticate(credentials)
            ?: return@post call.respond(
                HttpStatusCode.Unauthorized
            )

        sessionAuth.setSession(UserSession(userId = user.id))
        call.respondText("Signed in")
    }

    post("/logout") {
        sessionAuth.clearSession()
        call.respondText("Signed out")
    }
}
```

## 認証中のセッション更新 {id="transform-session"}

認証の一環として `validate` が実行される前に保存されているセッションを変更するには、`transformSession` を使用します。これは、有効期限付きのトークンを保持するセッションに役立ちます。

このリクエストで使用するセッションを返すか、拒否する場合は `null` を返します。Ktorは、返された値が受け取った値と異なる場合にのみセッションを書き戻します:

```kotlin
val sessionAuth = session<UserSession, User>("auth-session") {
    transformSession { session ->
        if (session.expiresAt > Clock.System.now()) {
            session
        } else {
            tokenService.refresh(session.refreshToken)
        }
    }
    validate { session ->
        userRepository.findById(session.userId)
    }
}
```

## CSRF保護の追加 {id="csrf"}

Cookieトランスポートは、他のサイトから開始されたリクエストも含め、すべてのリクエストでセッションを自動的に送信します。このスキームで保護されたルートに [CSRF](https://api.ktor.io/ktor-server/ktor-server-plugins/ktor-server-csrf/io.ktor.server.plugins.csrf/-c-s-r-f.html) プラグインをインストールするには、`csrfProtection {}` ブロックを使用します:

```kotlin
val sessionAuth = session<UserSession, User>("auth-session") {
    csrfProtection {
        allowOrigin("https://app.example.com")
        originMatchesHost()
    }
    validate { session ->
        userRepository.findById(session.userId)
    }
}
```

> ロール、オプショナル認証、およびその他のAPIの詳細については、[タイプセーフ認証](server-typed-auth.md)を参照してください。
> 
> `Sessions` プラグインの使い方の詳細については、[Sessions](server-sessions.md)を参照してください。
> 
{style="tip"}