[//]: # (title: セッション)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="Sessions"/>
<var name="package_name" value="io.ktor.server.sessions"/>
<var name="artifact_name" value="ktor-server-sessions"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.sessions"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<p><b>コード例</b>:
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-cookie-client">session-cookie-client</a>,
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-cookie-server">session-cookie-server</a>,
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-header-server">session-header-server</a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">Native サーバー</Links>のサポート</b>: ✅
</p>
</tldr>

<link-summary>
Sessions プラグインは、異なる HTTP リクエスト間でデータを永続化するメカニズムを提供します。
</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-server-sessions/io.ktor.server.sessions/-sessions.html) プラグインは、異なる HTTP リクエスト間でデータを永続化するメカニズムを提供します。典型的なユースケースとしては、ログインしたユーザーの ID の保存、ショッピングカートの内容、またはクライアント上でのユーザー設定の保持などが挙げられます。Ktor では、Cookie またはカスタムヘッダーを使用してセッションを実装したり、セッションデータをサーバー側に保存するかクライアントへ渡すかを選択したり、セッションデータの署名や暗号化などを行うことができます。

このトピックでは、`%plugin_name%` プラグインのインストール方法、設定方法、および[ルートハンドラー](server-routing.md#define_route)内でのセッションデータへのアクセス方法について説明します。

## 依存関係の追加 {id="add_dependencies"}
セッションのサポートを有効にするには、ビルドスクリプトに `%artifact_name%` アーティファクトを含める必要があります。

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">Ktor バージョンカタログ</a>を使用しています。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">Ktor バージョンカタログ</a>を使用しています。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## Sessions のインストール {id="install_plugin"}

<p>
    <code>%plugin_name%</code> プラグインをアプリケーションに<a href="server-plugins.md#install">インストール</a>するには、指定された<Links href="server-modules.md" summary="モジュールを使用すると、ルートをグループ化してアプリケーションを構造化できます。">モジュール</Links>内の <code>install</code> 関数に渡します。
    以下の例は、<code>%plugin_name%</code> をインストールする方法を示しています。
</p>
<list>
    <li>
        <code>embeddedServer()</code> 関数の呼び出し内。
    </li>
    <li>
        <code>Application</code> クラスに明示的に定義された <code>module()</code> 拡張関数内。
    </li>
</list>
<Tabs>
    <TabItem title="embeddedServer">
        <code-block lang="kotlin" code="            import io.ktor.server.engine.*&#10;            import io.ktor.server.netty.*&#10;            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;&#10;            fun main() {&#10;                embeddedServer(Netty, port = 8080) {&#10;                    install(%plugin_name%)&#10;                    // ...&#10;                }.start(wait = true)&#10;            }"/>
    </TabItem>
    <TabItem title="module">
        <code-block lang="kotlin" code="            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;            // ...&#10;            fun Application.module() {&#10;                install(%plugin_name%)&#10;                // ...&#10;            }"/>
    </TabItem>
</Tabs>
<p>
    <code>%plugin_name%</code> プラグインは、<a href="server-plugins.md#install-route">特定のルートにインストール</a>することもできます。
    これは、アプリケーションの異なるリソースに対して異なる <code>%plugin_name%</code> 設定が必要な場合に役立ちます。
</p>

## セッション設定の概要 {id="configuration_overview"}
`%plugin_name%` プラグインを設定するには、以下の手順を実行する必要があります。
1. *[データクラスの作成](#data_class)*: セッションを設定する前に、セッションデータを保存するための[データクラス](https://kotlinlang.org/docs/data-classes.html)を作成する必要があります。
2. *[サーバーとクライアント間でのデータ受け渡し方法の選択](#cookie_header)*: Cookie またはカスタムヘッダーのいずれを使用するか選択します。Cookie はプレーンな HTML アプリケーションに適しており、カスタムヘッダーは API 向けです。
3. *[セッションペイロードの保存場所の選択](#client_server)*: クライアント側かサーバー側かを選択します。シリアライズされたセッションデータを Cookie/ヘッダー値としてクライアントに渡すか、ペイロードをサーバーに保存してセッション識別子のみを渡すことができます。

   セッションペイロードをサーバーに保存する場合は、*[保存方法の選択](#storages)*が可能です。サーバーメモリ内またはフォルダー内に保存できます。また、セッションデータを保持するためのカスタムストレージを実装することもできます。
4. *[セッションデータの保護](#protect_session)*: クライアントに渡される機密性の高いセッションデータを保護するために、セッションのペイロードに署名および暗号化を行う必要があります。

`%plugin_name%` を設定した後は、[ルートハンドラー](server-routing.md#define_route)内で[セッションデータの取得および設定](#use_sessions)が行えます。

## データクラスの作成 {id="data_class"}

セッションを設定する前に、セッションデータを保存するための[データクラス](https://kotlinlang.org/docs/data-classes.html)を作成する必要があります。
例えば、以下の `UserSession` クラスは、セッション ID とページビュー数を保存するために使用されます。

```kotlin
@Serializable
data class UserSession(val id: String, val count: Int)
```

複数のセッションを使用する場合は、複数のデータクラスを作成する必要があります。

## セッションデータの受け渡し: Cookie vs ヘッダー {id="cookie_header"}

### Cookie {id="cookie"}
Cookie を使用してセッションデータを渡すには、`install(Sessions)` ブロック内で指定された名前とデータクラスを指定して `cookie` 関数を呼び出します。
```kotlin
install(Sessions) {
    cookie<UserSession>("user_session")
}
```
上記の例では、セッションデータは `Set-Cookie` ヘッダーに追加された `user_session` 属性を使用してクライアントに渡されます。`cookie` ブロック内で渡すことにより、他の Cookie 属性を設定できます。例えば、以下のコードスニペットは Cookie のパスと有効期限を指定する方法を示しています。

```kotlin
install(Sessions) {
    cookie<UserSession>("user_session") {
        cookie.path = "/"
        cookie.maxAgeInSeconds = 10
    }
}
```

必要な属性が明示的に公開されていない場合は、`extensions` プロパティを使用します。例えば、`SameSite` 属性は以下のように渡すことができます。
```kotlin
install(Sessions) {
    cookie<UserSession>("user_session") {
        cookie.extensions["SameSite"] = "lax"
    }
}
```
利用可能な設定項目についての詳細は、[CookieConfiguration](https://api.ktor.io/ktor-server-sessions/io.ktor.server.sessions/-cookie-configuration/index.html) を参照してください。

> アプリケーションを本番環境に[デプロイ](server-deployment.md)する前に、`secure` プロパティが `true` に設定されていることを確認してください。これにより、[安全な接続（SSL）](server-ssl.md)経由でのみ Cookie が転送されるようになり、HTTPS ダウングレード攻撃からセッションデータを保護できます。
>
{type="warning"}

### ヘッダー {id="header"}
カスタムヘッダーを使用してセッションデータを渡すには、`install(Sessions)` ブロック内で指定された名前とデータクラスを指定して `header` 関数を呼び出します。

```kotlin
install(Sessions) {
    header<CartSession>("cart_session")
}
```

上記の例では、セッションデータは `cart_session` カスタムヘッダーを使用してクライアントに渡されます。
クライアント側では、セッションデータを取得するために各リクエストにこのヘッダーを追加する必要があります。

> [CORS](server-cors.md) プラグインを使用してクロスオリジンリクエストを処理する場合は、次のように `CORS` 設定にカスタムヘッダーを追加してください。
> ```kotlin
> install(CORS) {
>     allowHeader("cart_session")
>     exposeHeader("cart_session")
> }
> ```

### 変更時のみセッションデータを送信 {id="send_only_if_modified"}

デフォルトでは、Ktor は変更されていない場合でも、すべてのレスポンスでセッションデータを送信します。

セッションデータが変更された場合にのみ送信するには、セッション設定で `sendOnlyIfModified` フラグを有効にします。

```kotlin
install(Sessions) {
    cookie<MySession>("SESSION") {
        sendOnlyIfModified = true
    }
}
```

このオプションは、[Cookie](#cookie) と[ヘッダーベース](#header)のどちらのセッションでも利用できます。

## セッションペイロードの保存場所: クライアント vs サーバー {id="client_server"}

Ktor では、セッションデータを2つの方法で管理できます。
- _クライアントとサーバー間でセッションデータをやり取りする_。
   
  [Cookie またはヘッダー](#cookie_header)関数にセッション名のみを渡した場合、セッションデータはクライアントとサーバー間でやり取りされます。この場合、クライアントに渡される機密性の高いセッションデータを保護するために、セッションのペイロードに[署名と暗号化](#protect_session)を行う必要があります。
- _サーバー上にセッションデータを保存し、クライアントとサーバー間ではセッション ID のみをやり取りする_。
   
  この場合、サーバー上の[ペイロードの保存場所](#storages)を選択できます。例えば、メモリ内や指定されたフォルダー内にセッションデータを保存したり、独自のカスタムストレージを実装したりできます。

## サーバー上にセッションペイロードを保存 {id="storages"}

Ktor では、セッションデータを[サーバー上](#client_server)に保存し、サーバーとクライアント間ではセッション ID のみをやり取りすることができます。この場合、サーバー上のどこにペイロードを保持するかを選択できます。

### インメモリストレージ {id="in_memory_storage"}
[SessionStorageMemory](https://api.ktor.io/ktor-server-sessions/io.ktor.server.sessions/-session-storage-memory/index.html) を使用すると、セッションの内容をメモリに保存できます。このストレージはサーバーの実行中にデータを保持し、サーバーが停止すると情報は破棄されます。例えば、以下のようにして Cookie をサーバーメモリに保存できます。

```kotlin
cookie<CartSession>("cart_session", SessionStorageMemory()) {
}
```

完全なサンプルはこちらで確認できます: [session-cookie-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-cookie-server)。

> `SessionStorageMemory` は開発用途のみを想定していることに注意してください。

### ディレクトリストレージ {id="directory_storage"}

[directorySessionStorage](https://api.ktor.io/ktor-server-sessions/io.ktor.server.sessions/directory-session-storage.html) を使用すると、指定したディレクトリ下のファイルにセッションデータを保存できます。例えば、`build/.sessions` ディレクトリ配下のファイルにセッションデータを保存するには、次のように `directorySessionStorage` を作成します。
```kotlin
header<CartSession>("cart_session", directorySessionStorage(File("build/.sessions"))) {
}
```

完全なサンプルはこちらで確認できます: [session-header-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-header-server)。

### カスタムストレージ {id="custom_storage"}

Ktor は、カスタムストレージを実装できる [SessionStorage](https://api.ktor.io/ktor-server-sessions/io.ktor.server.sessions/-session-storage/index.html) インターフェースを提供しています。
```kotlin
interface SessionStorage {
    suspend fun invalidate(id: String)
    suspend fun write(id: String, value: String)
    suspend fun read(id: String): String
}
```
3つの関数はすべて[サスペンド関数](https://kotlinlang.org/docs/composing-suspending-functions.html)です。[SessionStorageMemory](https://github.com/ktorio/ktor/blob/main/ktor-server/ktor-server-plugins/ktor-server-sessions/common/src/io/ktor/server/sessions/SessionStorageMemory.kt) を参考にすることができます。

## セッションデータの保護 {id="protect_session"}

### セッションデータの署名 {id="sign_session"}

セッションデータに署名すると、セッション内容の改ざんを防ぐことができますが、ユーザーがその内容を閲覧することは可能です。
セッションに署名するには、署名キーを `SessionTransportTransformerMessageAuthentication` コンストラクターに渡し、そのインスタンスを `transform` 関数に渡します。

```kotlin
install(Sessions) {
    val secretSignKey = "6819b57a326945c1968f45236589".hexToByteArray()
    cookie<CartSession>("cart_session", SessionStorageMemory()) {
        cookie.path = "/"
        transform(SessionTransportTransformerMessageAuthentication(secretSignKey))
    }
}
```

`SessionTransportTransformerMessageAuthentication` はデフォルトの認証アルゴリズムとして `HmacSHA256` を使用しますが、これは変更可能です。

### セッションデータの署名と暗号化 {id="sign_encrypt_session"}

セッションデータを署名および暗号化すると、セッション内容の読み取りと改ざんの両方を防ぐことができます。
セッションの署名と暗号化を行うには、署名/暗号化キーを `SessionTransportTransformerEncrypt` コンストラクターに渡し、そのインスタンスを `transform` 関数に渡します。

```kotlin
install(Sessions) {
    val secretEncryptKey = "00112233445566778899aabbccddeeff".hexToByteArray()
    val secretSignKey = "6819b57a326945c1968f45236589".hexToByteArray()
    cookie<UserSession>("user_session") {
        cookie.path = "/"
        cookie.maxAgeInSeconds = 10
        transform(SessionTransportTransformerEncrypt(secretEncryptKey, secretSignKey))
    }
}
```

> Ktor バージョン `3.0.0` で[暗号化方式がアップデート](migrating-3.md#session-encryption-method-update)されたことに注意してください。以前のバージョンから移行する場合は、既存のセッションとの互換性を確保するために、`SessionTransportTransformerEncrypt` のコンストラクターで `backwardCompatibleRead` プロパティを使用してください。
>
{style="note"}

デフォルトでは、`SessionTransportTransformerEncrypt` は `AES` および `HmacSHA256` アルゴリズムを使用しますが、これらは変更可能です。

> 署名/暗号化キーはコード内に直接記述すべきではないことに注意してください。[設定ファイル](server-configuration-file.topic#configuration-file-overview)のカスタムグループを使用して署名/暗号化キーを保持し、[環境変数](server-configuration-file.topic#environment-variables)を使用して初期化することができます。
>
{type="warning"}

## セッション内容の取得と設定 {id="use_sessions"}
特定の[ルート](server-routing.md)に対してセッション内容を設定するには、`call.sessions` プロパティを使用します。`set` メソッドを使用すると、新しいセッションインスタンスを作成できます。

```kotlin
get("/login") {
    call.sessions.set(UserSession(id = "123abc", count = 0))
    call.respondRedirect("/user")
}
```

セッション内容を取得するには、登録されているセッション型のいずれかを型パラメーターとして受け取る `get` を呼び出します。

```kotlin
get("/user") {
    val userSession = call.sessions.get<UserSession>()
    if (userSession != null) {
}
```

セッションを変更する（例えばカウンターをインクリメントする）には、データクラスの `copy` メソッドを呼び出す必要があります。

```kotlin
get("/user") {
    val userSession = call.sessions.get<UserSession>()
    if (userSession != null) {
        call.sessions.set(userSession.copy(count = userSession.count + 1))
        call.respondText("Session ID is ${userSession.id}. Reload count is ${userSession.count}.")
    } else {
        call.respondText("Session doesn't exist or is expired.")
    }
}
```

何らかの理由でセッションをクリアする必要がある場合（例えばユーザーがログアウトしたときなど）は、`clear` 関数を呼び出します。

```kotlin
get("/logout") {
    call.sessions.clear<UserSession>()
    call.respondRedirect("/user")
}
```

完全なサンプルはこちらで確認できます: [session-cookie-client](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-cookie-client)。

## セッションの遅延取得 {id="deferred-session-retrieval"}

デフォルトでは、Ktor はルートが実際にセッションを必要としているかどうかにかかわらず、セッションを含むすべてのリクエストに対してストレージからセッションを読み込もうとします。この動作は、特にカスタムセッションストレージを使用しているアプリケーションにおいて、不要なオーバーヘッドを引き起こす可能性があります。

`io.ktor.server.sessions.deferred` システムプロパティを有効にすることで、セッションの読み込みを遅延させることができます。

```kotlin
System.setProperty("io.ktor.server.sessions.deferred", "true")
```

## サンプル {id="examples"}

以下の実行可能なサンプルでは、`%plugin_name%` プラグインの使用方法を示しています。

- [session-cookie-client](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-cookie-client): [Cookie](#cookie) を使用して、[署名および暗号化された](#sign_encrypt_session)セッションペイロードを[クライアント](#client_server)に渡す方法を示しています。
- [session-cookie-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-cookie-server): セッションペイロードを[サーバーメモリ](#in_memory_storage)に保持し、[署名された](#sign_session)セッション ID を [Cookie](#cookie) を使用してクライアントに渡す方法を示しています。
- [session-header-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-header-server): サーバー上の[ディレクトリストレージ](#directory_storage)にセッションペイロードを保持し、[カスタムヘッダー](#header)を使用して[署名された](#sign_session)セッション ID をクライアントに渡す方法を示しています。