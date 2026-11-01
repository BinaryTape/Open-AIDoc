---
title: Ktor とアノテーション
---

# Ktor とアノテーション

このチュートリアルでは、リストから選択されたユーザーに挨拶する `/hello` エンドポイントを持つ Ktor Web アプリケーションを構築します。クラスにアノテーションを付与し、それらをスキャンしてモジュールに登録し、`@KoinApplication` オブジェクトから Koin Ktor プラグインに読み込む方法を学びます。所要時間は約10分で、JDK 17 と Gradle が必要です。

このチュートリアルではアノテーションを使用します。Compiler Plugin DSL を使用した同じアプリケーションについては、[Ktor](/docs/quickstart/ktor) を参照してください。スタイルの比較については、[スタイルの選択 (Choosing your style)](/docs/intro/choosing-your-style) を参照してください。

## コードの取得 {id="get-the-code"}

完全なサンプルコードは [koin-getting-started/ktor-annotations](https://github.com/InsertKoinIO/koin-getting-started/tree/main/ktor-annotations) にあります。リポジトリをクローンし、`ktor-annotations` フォルダから `app` モジュールを実行してください。

## Gradle のセットアップ {id="gradle-setup"}

このサンプルでは Koin Compiler Plugin を適用し、`koin-ktor`、`koin-annotations`、`koin-logger-slf4j` を追加します。バージョンはバージョンカタログ (Version Catalog) で管理されています。

```toml
# gradle/libs.versions.toml
[versions]
# Kotlin、Ktor、Logback のエントリは省略
koin = "<KOIN_VERSION>"
koin-plugin = "<KOIN_PLUGIN_VERSION>"

[libraries]
koin-ktor = { module = "io.insert-koin:koin-ktor", version.ref = "koin" }
koin-annotations = { module = "io.insert-koin:koin-annotations", version.ref = "koin" }
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
    implementation(libs.koin.annotations)
    implementation(libs.koin.logger.slf4j)

    testImplementation(libs.ktor.test)
    testImplementation(libs.koin.test)
    testImplementation(libs.koin.test.junit4)
}
```

Compiler Plugin はアノテーションを処理するため、Kotlin 2.3.20 以降が必要です。`koin-annotations` は Koin と同じバージョンを使用します。詳細については、[Gradle のセットアップ](/docs/setup/gradle) および [Compiler Plugin のセットアップ](/docs/setup/compiler-plugin) を参照してください。

## アプリケーションの構成 {id="the-application"}

`/hello` ルートは `UserService` にユーザーを要求し、`UserService` は `UserRepository` からデータを読み取ります。

```
User -> UserRepository -> UserService -> /hello route
```

## ユーザーデータの作成 {id="let-s-write-the-user-data"}

まずはデータクラスとデフォルトのユーザーリストの定義から始めます。

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

リポジトリはユーザーをメモリ内に保持します。実装クラスに `@Singleton` アノテーションを付与します。

```kotlin
import org.koin.core.annotation.Singleton

interface UserRepository {
    fun findUserOrNull(name: String): User?
    fun addUsers(users: List<User>)
}

@Singleton
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

Koin は `UserRepositoryImpl` をそのスーパータイプにバインドするため、`UserRepository` が要求されるとこのインスタンスが注入されます。`@Singleton` は `org.koin.core.annotation` パッケージのものであり、`@Single` と同等です（[定義 (Definitions)](/docs/reference/koin-core/definitions) を参照）。

## サービスの作成 {id="let-s-write-the-service"}

`UserService` はユーザーを読み込み、挨拶メッセージを準備します。これも `@Singleton` です。

```kotlin
interface UserService {
    fun getUserOrNull(name: String = DEFAULT_USER.name): User?
    fun loadUsers()
    fun prepareHelloMessage(user: User?): String
}

@Singleton
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

Compiler Plugin がコンストラクタを解析し、`UserRepository` インスタンスを自動的に渡します。

## Koin モジュールの宣言 {id="let-s-declare-the-koin-module"}

モジュールは定義をグループ化します（[主要な概念 (Core Concepts)](/docs/intro/core-concepts) を参照）。サンプルのパッケージをスキャンするモジュールクラスを宣言します。

```kotlin
import org.koin.core.annotation.ComponentScan
import org.koin.core.annotation.Configuration
import org.koin.core.annotation.Module

@Module
@ComponentScan("org.koin.sample")
@Configuration
class AppModule
```

`@ComponentScan` は、`org.koin.sample` およびそのサブパッケージ内のすべてのアノテーション付きクラスを登録します。`@Configuration` は、このモジュールを `@KoinApplication` エントリポイントから検出可能にします。どちらの詳細も [モジュール (Modules)](/docs/reference/koin-core/modules) で解説されています。

## Koin のインストールとルートの作成 {id="let-s-install-koin-and-write-the-route"}

`@KoinApplication` オブジェクトを宣言します。`Koin` プラグインをインストールし、`withConfiguration<T>()` で設定を読み込んだ後、`/hello` ルートで `UserService` をインジェクトします。

```kotlin
import org.koin.core.annotation.KoinApplication
import org.koin.ktor.ext.inject
import org.koin.ktor.plugin.Koin
import org.koin.logger.slf4jLogger
import org.koin.plugin.module.dsl.withConfiguration

@KoinApplication
object KoinUserApplication

fun Application.main() {
    install(Koin) {
        slf4jLogger()
        withConfiguration<KoinUserApplication>()
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

`withConfiguration<KoinUserApplication>()` はすべての `@Configuration` モジュールを読み込むため、手動で `modules()` を呼び出す必要はありません。また、プラグインはビルド時に依存関係グラフ全体を検証します。`slf4jLogger()` は Koin のログを SLF4J に送信します。Ktor 固有の API については、[Koin for Ktor](/docs/reference/koin-ktor/ktor) を参照してください。

## サーバーの起動 {id="let-s-start-the-server"}

アプリケーションモジュールを実行する組み込み Netty サーバーを起動します。

```kotlin
fun main(args: Array<String>) {
    embeddedServer(Netty, port = 8080) {
        main()
    }.start(wait = true)
}
```

アプリケーションを実行し、次の URL を開きます。

- `http://localhost:8080/hello`: デフォルトユーザーである Alice への挨拶が表示されます。
- `http://localhost:8080/hello?name=Bob`: Bob への挨拶が表示されます。

## 次のステップ {id="next-steps"}

- [コアコンセプト (Core Concepts)](/docs/intro/core-concepts): モジュール、定義、インジェクションの背景にあるメンタルモデル。
- [Koin for Ktor](/docs/reference/koin-ktor/ktor): インストールオプション、ルートでのインジェクション、および Ktor イベント。
- [アノテーションリファレンス (Annotations Reference)](/docs/reference/koin-annotations/annotations-inventory): 各アノテーションとそのパラメータ。
- [Ktor テスト (Ktor testing)](/docs/reference/koin-ktor/ktor-testing): `testApplication` と Koin を使用したルートのテスト。
- [ツーリング (Tooling)](/docs/tooling): Koin 用の IDE プラグインおよびモニタリングツール。