[//]: # (title: 型安全なセッション認証)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>, <code>io.ktor:ktor-server-sessions</code>
</p>
</tldr>

<link-summary>
型安全な認証スキームAPIのセッションスキームは、ルートに非nullのプリンシパルと、保存されたセッションへの読み書きアクセスを提供します。
</link-summary>

`session` スキームは、[型安全な認証スキームAPI](server-typed-auth.md) の一部です。これは、名前付きプロバイダーによる [セッション認証](server-session-auth.md) が一体として扱っていた2つの要素を分離します:

* **セッション** は、アクセストークンやユーザーIDなど、呼び出し元のために保存する値です。
* **プリンシパル** は、完全なユーザーレコードなど、ルートハンドラーが処理で使用する対象です。

保護されたルート内では、`call.session` から保存されたセッションを、`call.principal` からプリンシパルを取得できます。どちらも非nullであり、正しく型付けされています。

<note>
    <p>
        型安全な認証スキームAPIは実験的（experimental）です。いつでも廃止または変更される可能性があります。
        オプトインが必要です。詳細については、
        <a href="server-typed-auth.md#prerequisites">型安全な認証のドキュメント</a>を参照してください。
    </p>
</note>

## セッションスキームを作成する {id="create-scheme"}

`session<S, P>()` ファクトリは、第1型引数にセッション型を、第2型引数にプリンシパル型を取ります。`validate` ブロックはセッションをプリンシパルに変換するか、セッションを拒否するために `null` を返します。

デフォルトでは、有効なセッションを持たないリクエストは `401 Unauthorized` を受け取ります。ブラウザアプリケーションの場合、代わりに呼び出し元をサインインページにリダイレクトできます。レスポンスを変更するには、`onUnauthorized` ハンドラーを設定します:

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

`authenticateWith()` に渡されたハンドラーは、そのルートにおいてこの設定をオーバーライドします。完全な優先順位については、[障害の処理](server-typed-auth.md#failures) を参照してください。

## トランスポートを選択する {id="transport"}

`transport` プロパティは、クライアントとサーバー間でセッションがどのようにやり取りされるかを制御します:

| トランスポート                       | クライアントが保持するもの              | セッションデータの保持場所             |
|---------------------------------|------------------------------------|--------------------------------------|
| `SessionTransportType.CookieId` | Cookie内のセッションID           | サーバー上（`SessionStorage` 内） |
| `SessionTransportType.HeaderId` | ヘッダー内のセッションID           | サーバー上（`SessionStorage` 内） |
| `SessionTransportType.Cookie`   | Cookie内のシリアライズされたセッション | クライアント上                        |
| `SessionTransportType.Header`   | ヘッダー内のシリアライズされたセッション | クライアント上                        |

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

`SessionStorageMemory` は再起動時にすべてが失われ、インスタンス間で共有されないため、ローカル開発に適しています。本番環境では、`directorySessionStorage()` などの永続ストレージや、独自の `SessionStorage` 実装を使用してください。

> `Cookie` および `Header` トランスポートはセッションの値をクライアントに送信します。その値は呼び出し元の身元情報（アイデンティティ）であるため、保護がなければクライアントがそれを偽造して誰にでもなりすましてサインインできてしまいます。値渡し（by-value）のトランスポートを使用する場合は、`SessionTransportTransformerEncrypt` などのトランスフォーマーを追加してください:
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

## Sessions プラグインをインストールする {id="install-sessions"}

セッションスキームは [Sessions](server-sessions.md) プラグインを通じてセッションを読み取るため、ルートがスキームを使用する前にこのプラグインをインストールしておく必要があります。`install()` にスキームを渡すと、Ktor は設定したトランスポートを適用します:

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

単一のルートサブツリーにインストールすることもできます:

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

`Sessions` を独自に設定する場合は、設定ブロック内で `applyTransport()` を呼び出し、スキームとプラグインの間で名前、型、トランスポートが一致するようにします:

```kotlin
install(Sessions) {
    sessionAuth.applyTransport()
    cookie<OtherSession>("other-session")
}
```

プラグインが存在しない場合、あるいはスキームの名前とセッション型に一致するプロバイダーがない場合、スキームは起動時に失敗します。

## セッションの読み取りと変更 {id="read-write"}

セッションスキームで保護されたルート内では、`call.session` は読み書き可能なプロパティです:

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

同じブロック内では以下のアクセサーが利用できます:

| アクセサー                 | 目的                                                                    |
|--------------------------|----------------------------------------------------------------------------|
| `call.session`           | セッションの読み取りまたは置換を行います。                                             |
| `call.updateSession { }` | セッションを読み取り、変更を適用し、結果を保存してそれを返します。 |
| `call.clearSession()`    | セッションを削除し、呼び出し元をサインアウトさせます。                           |

新しい値が古い値に依存する場合は `updateSession` を使用します:

```kotlin
post("/increment") {
    val updated = call.updateSession {
        it.copy(visits = it.visits + 1)
    }
    call.respondText("Visits: ${updated.visits}")
}
```

`authenticateWithOptional()` の内部では、セッションがまったく存在しない可能性があるため、`call.session` は利用できません。代わりに `call.sessionOrNull` を使用してください:

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

スキームの `setSession()` と `clearSession()` は、スキームによって保護されているかどうかに関係なく、任意のルートで動作します。

サインインは、スキームによって保護されていないルートに配置すべきです。呼び出し元はまだセッションを持っていないため、保護されたルートではハンドラーが実行される前にリクエストが拒否されてしまいます:

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

## 認証中にセッションを更新する {id="transform-session"}

`validate` が実行される前の認証の一環として、保存されたセッションを変更するには `transformSession` を使用します。これは、有効期限のあるトークンを保持するセッションで役立ちます。

このリクエストで使用するセッションを返すか、拒否する場合は `null` を返します。Ktor は、返された値が受信した値と異なる場合にのみセッションを書き戻します:

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

## CSRF 保護を追加する {id="csrf"}

Cookie トランスポートは、他のサイトから開始されたリクエストも含め、すべてのリクエストで自動的にセッションを送信します。このスキームが保護するルートに [CSRF](https://api.ktor.io/ktor-server/ktor-server-plugins/ktor-server-csrf/io.ktor.server.plugins.csrf/-c-s-r-f.html) プラグインをインストールするには、`csrfProtection {}` ブロックを使用します:

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

> ロール、オプション認証、およびその他のAPIの詳細については、[型安全な認証](server-typed-auth.md) を参照してください。
> 
> `Sessions` プラグインの操作に関する詳細については、[Sessions](server-sessions.md) を参照してください。
> 
{style="tip"}