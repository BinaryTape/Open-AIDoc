---
title: Kotlin
---

# Kotlin

このチュートリアルでは、ユーザーのリストを読み込んで挨拶を出力するKotlinコンソールアプリを作成します。Koinモジュールの宣言方法、実装のインターフェースへのバインド、およびKoinの起動方法を学びます。所要時間は約10分で、JDK 17とGradleが必要です。

このチュートリアルではCompiler Plugin DSLを使用します。アノテーションを使用した同じアプリについては、[Kotlin & Annotations](/docs/quickstart/kotlin-annotations)を参照してください。スタイルの比較については、[Choosing your style](/docs/intro/choosing-your-style)を参照してください。

## コードの取得 {id="get-the-code"}

完全なサンプルは [koin-getting-started/kotlin](https://github.com/InsertKoinIO/koin-getting-started/tree/main/kotlin) にあります。リポジトリをクローンし、`kotlin` フォルダから実行してください。

```bash
./gradlew run
```

## Gradleのセットアップ {id="gradle-setup"}

このサンプルではKoin Compiler Pluginを適用し、`koin-core` を追加します。バージョンはバージョンカタログで管理されています。

```toml
# gradle/libs.versions.toml
[versions]
kotlin = "<KOTLIN_VERSION>"
koin = "<KOIN_VERSION>"
koin-plugin = "<KOIN_PLUGIN_VERSION>"

[libraries]
koin-core = { module = "io.insert-koin:koin-core", version.ref = "koin" }
koin-test = { module = "io.insert-koin:koin-test", version.ref = "koin" }
koin-test-junit4 = { module = "io.insert-koin:koin-test-junit4", version.ref = "koin" }

[plugins]
kotlin-jvm = { id = "org.jetbrains.kotlin.jvm", version.ref = "kotlin" }
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
    implementation(libs.koin.core)

    testImplementation(libs.koin.test)
    testImplementation(libs.koin.test.junit4)
}
```

Compiler PluginにはKotlin 2.3.20以降が必要です。最新のバージョンやBOMについては、[Gradle setup](/docs/setup/gradle)を参照してください。プラグインのオプションについては、[Compiler Plugin setup](/docs/setup/compiler-plugin)を参照してください。

## アプリケーション {id="the-application"}

このアプリは3つのコンポーネントを連携させます。`UserApplication` は `UserService` にユーザーを要求し、`UserService` は `UserRepository` から読み取ります。

```
User -> UserRepository -> UserService -> UserApplication
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

これらのユーザーがリポジトリに保存されるデータとなります。

## リポジトリの作成 {id="let-s-write-the-repository"}

リポジトリはメモリ上にユーザーを保持し、名前でユーザーを検索します。

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

`UserRepositoryImpl` には依存関係がないため、Koinは追加情報なしで作成できます。

## Koinモジュールの宣言 {id="let-s-declare-the-koin-module"}

モジュールは、Koinが作成するコンポーネントを宣言する場所です（[Core Concepts](/docs/intro/core-concepts)を参照）。`UserRepositoryImpl` をシングルトンとして宣言し、`UserRepository` として利用できるようにします。

```kotlin
import org.koin.dsl.bind
import org.koin.dsl.module
import org.koin.plugin.module.dsl.single

val appModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
}
```

これで、`UserRepository` を要求するコンポーネントは同じ `UserRepositoryImpl` インスタンスを取得するようになります。`single` と `bind` については [Definitions](/docs/reference/koin-core/definitions) で解説されています。

## サービスの作成 {id="let-s-write-the-service"}

`UserService` はユーザーを読み込み、挨拶メッセージを準備します。

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

これをモジュールに追加します。

```kotlin
val appModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
    single<UserServiceImpl>() bind UserService::class
}
```

`UserServiceImpl` はコンストラクタで `UserRepository` を受け取ります。Compiler Pluginがそのコンストラクタを読み取り、`UserRepositoryImpl` のインスタンスを自動的に渡します。

## アプリケーションクラスの作成 {id="let-s-write-the-application-class"}

`UserApplication` はコンストラクタ経由で `UserService` を受け取り、ユーザーを読み込んで挨拶を出力します。

```kotlin
class UserApplication(
    private val userService: UserService
) {

    init {
        userService.loadUsers()
    }

    fun sayHello(name: String) {
        val user = userService.getUserOrNull(name)
        val message = userService.prepareHelloMessage(user)
        println(message)
    }
}
```

これもモジュールで宣言します。

```kotlin
val appModule = module {
    single<UserApplication>()
    single<UserRepositoryImpl>() bind UserRepository::class
    single<UserServiceImpl>() bind UserService::class
}
```

これで3つのコンポーネントがすべてモジュールに含まれました。プラグインは、各コンストラクタのパラメータに対応する定義が存在することをビルド時に検証します。

## Koinの起動 {id="let-s-start-koin"}

`main()` 内でモジュールを指定してKoinを起動し、コンテナから `UserApplication` を取得します。

```kotlin
import org.koin.core.context.startKoin
import org.koin.mp.KoinPlatform

fun main() {
    startKoin {
        modules(appModule)
    }

    val userApplication = KoinPlatform.getKoin().get<UserApplication>()
    userApplication.sayHello("Alice")
}
```

`./gradlew run` を実行すると、アプリは `Hello 'Alice' (alice@example.com)!` と出力します。`startKoin` とそのオプションについては、[Starting Koin](/docs/reference/koin-core/starting-koin) で解説されています。

## 次のステップ {id="next-steps"}

- [Core Concepts](/docs/intro/core-concepts): モジュール、定義、インジェクションの背景にあるメンタルモデル。
- [Definitions](/docs/reference/koin-core/definitions): すべての定義タイプとバインディングオプション。
- [JUnit Tests](/docs/quickstart/junit-test): Koin Testを使用してこのアプリをテストします。
- [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety): Compiler Pluginがグラフ内で検証する内容。
- [Tooling](/docs/tooling): Koin用のIDEプラグインおよび監視ツール。