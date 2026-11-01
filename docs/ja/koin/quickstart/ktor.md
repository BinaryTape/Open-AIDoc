---
title: Ktor
---

# Ktor

このチュートリアルでは、リストから取得したユーザーに挨拶を返す `/hello` エンドポイントを持つKtor Webアプリケーションを作成します。Koinモジュールの宣言方法、KtorプラグインとしてKoinをインストールする方法、そしてアプリケーションにサービスをインジェクト（注入）する方法を学びます。所要時間は約10分で、JDK 17とGradleが必要です。

このチュートリアルではCompiler Plugin DSLを使用します。アノテーションを使用した同じアプリケーションについては、[Ktor & Annotations](/docs/quickstart/ktor-annotations)を参照してください。スタイルの比較については、[Choosing your style](/docs/intro/choosing-your-style)を参照してください。

## コードの取得 {id="get-the-code"}

完全なサンプルは [koin-getting-started/ktor](https://github.com/InsertKoinIO/koin-getting-started/tree/main/ktor) にあります。リポジトリをクローンし、`ktor` フォルダから実行してください。

```bash
./gradlew run
```

## Gradleのセットアップ {id="gradle-setup"}

このサンプルではKoin Compiler Pluginを適用し、`koin-ktor` と `koin-logger-slf4j` を追加します。バージョンはバージョンカタログ（version catalog）で管理されています。

```toml
# gradle/libs.versions.toml
[versions]
# Kotlin、Ktor、Logbackのエントリは省略
koin = "<KOIN_VERSION>"
koin-plugin = "<KOIN_PLUGIN_VERSION>"

[libraries]
koin-ktor = { module = "io.insert-koin:koin-ktor", version.ref = "koin" }
koin-logger-slf4j = { module = "io.insert-koin:koin-logger-slf4j", version.ref = "koin" }
koin-test = { module = "io.insert-koin:koin-test", version.ref = "koin" }
koin-test-junit4 = { module = "io.insert-koin:koin-test-junit4", version.ref = "koin" }

[plugins]
koin-compiler = { id = "io.insert-koin.compiler.plugin", version.ref = "koin-plugin" }
```

```kotlin
// app/build.gradle.kts
plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.koin.compiler)
    application
}

dependencies {
    implementation(libs.ktor.server)
    implementation(libs.logback)
    implementation(libs.koin.ktor)
    implementation(libs.koin.logger.slf4j)

    testImplementation(libs.ktor.test)
    testImplementation(libs.koin.test)
    testImplementation(libs.koin.test.junit4)
}
```

Compiler PluginにはKotlin 2.3.20以降が必要です。現在のバージョンとBOMについては、[Gradle setup](/docs/setup/gradle)を参照してください。プラグインのオプションについては、[Compiler Plugin setup](/docs/setup/compiler-plugin)を参照してください。

## アプリケーション {id="the-application"}

`/hello` ルートは `UserService` にユーザーを要求し、`UserService` は `UserRepository` から読み取ります。

```
User -> UserRepository -> UserService -> /hello route
```

## ユーザーデータの作成 {id="let-s-write-the-user-data"}

まず、データクラスとデフォルトのユーザーリストを作成します。

```kotlin
data class User(val name: String, val email: String)

val DEFAULT_USER = User("Alice", "alice@example.com")

val DEFAULT_USERS = listOf(
    DEFAULT_USER,
    User("Bob", "bob@example.com"),
    User("Charlie", "charlie@example.com")
)
```

これらのユーザーが、リポジトリに保存されるデータとなります。

## リポジトリの作成 {id="let-s-write-the-repository"}

リポジトリはメモリ上にユーザーを保持し、名前によってユーザーを検索します。

```kotlin
interface UserRepository {
    fun findUserOrNull(name: String): User?
    fun addUsers(users: List<User>)
}

class UserRepositoryImpl : UserRepository {

    private val _users = arrayListOf<User>()

    override fun findUserOrNull(name: String): User? {
        return _users.firstOrNull { it.name == name }
    }

    override fun addUsers(users: List<User>) {
        _users.addAll(users)
    }
}
```

`UserRepositoryImpl` には依存関係がないため、Koinは追加情報なしでインスタンスを作成できます。

## サービスの作成 {id="let-s-write-the-service"}

`UserService` はユーザーをロードし、挨拶メッセージを準備します。

```kotlin
interface UserService {
    fun getUserOrNull(name: String = DEFAULT_USER.name): User?
    fun loadUsers()
    fun prepareHelloMessage(user: User?): String
}

class UserServiceImpl(
    private val userRepository: UserRepository
) : UserService {

    override fun getUserOrNull(name: String): User? = userRepository.findUserOrNull(name)

    override fun loadUsers() {
        userRepository.addUsers(DEFAULT_USERS)
    }

    override fun prepareHelloMessage(user: User?): String {
        return user?.let { "Hello '${user.name}' (${user.email})!" } ?: "User not found"
    }
}
```

`UserServiceImpl` は `UserRepository` に依存しています。Koinはコンストラクタ経由でそれを渡します。

## Koinモジュールの宣言 {id="let-s-declare-the-koin-module"}

モジュールは、Koinが作成するコンポーネントを宣言する場所です（[Core Concepts](/docs/intro/core-concepts) を参照）。両方のコンポーネントを、それぞれのインターフェースにバインドされたシングルトンとして宣言します。

```kotlin
import org.koin.dsl.bind
import org.koin.dsl.module
import org.koin.plugin.module.dsl.single

val appModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
    single<UserServiceImpl>() bind UserService::class
}
```

これで、`UserService` を要求するコンポーネントはすべて同じ `UserServiceImpl` インスタンスを取得するようになります。`single` と `bind` については [Definitions](/docs/reference/koin-core/definitions) で説明されています。

## Koinのインストールとルートの作成 {id="let-s-install-koin-and-write-the-route"}

モジュールを指定してKtorアプリケーションに `Koin` プラグインをインストールし、`UserService` をインジェクトして `/hello` ルートで使用します。

```kotlin
import org.koin.ktor.ext.inject
import org.koin.ktor.plugin.Koin

fun Application.main() {
    install(Koin) {
        modules(appModule)
    }

    val service by inject<UserService>()
    service.loadUsers()

    routing {
        get("/hello") {
            val userName = call.queryParameters["name"] ?: "Alice"
            val user = service.getUserOrNull(userName)
            val message = service.prepareHelloMessage(user)
            call.respondText(message)
        }
    }
}
```

`install(Koin)` はKtorアプリケーションとともにKoinを起動し、`inject()` は `Application`、`Route`、および `ApplicationCall` で利用可能になります。KoinのログをSLF4Jに出力するには、`install(Koin)` の内部に `slf4jLogger()` を追加します。Ktor固有のAPIについては [Koin for Ktor](/docs/reference/koin-ktor/ktor) を参照してください。

## サーバーの起動 {id="let-s-start-the-server"}

アプリケーションモジュールを実行する組み込みNettyサーバーを起動します。

```kotlin
fun main(args: Array<String>) {
    embeddedServer(Netty, port = 8080) {
        main()
    }.start(wait = true)
}
```

`./gradlew run` を実行し、次のURLを開きます。

- `http://localhost:8080/hello`: デフォルトユーザーであるAliceに挨拶します。
- `http://localhost:8080/hello?name=Bob`: Bobに挨拶します。

## 次のステップ {id="next-steps"}

- [Core Concepts](/docs/intro/core-concepts): モジュール、定義、インジェクションの背景にあるメンタルモデル。
- [Koin for Ktor](/docs/reference/koin-ktor/ktor): インストールオプション、ルート内でのインジェクション、Ktorイベント。
- [Request Scopes](/docs/reference/koin-ktor/ktor-scopes): 1つのHTTPリクエストの間生存するインスタンス。
- [Ktor testing](/docs/reference/koin-ktor/ktor-testing): `testApplication` とKoinを使用してルートをテストする。
- [Tooling](/docs/tooling): Koin用のIDEプラグインと監視ツール。