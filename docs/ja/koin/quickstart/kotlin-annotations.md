---
title: Kotlin & アノテーション
---

# Kotlin & アノテーション

このチュートリアルでは、ユーザーのリストを読み込んで挨拶を出力する Kotlin コンソールアプリケーションを作成します。クラスにアノテーションを付与し、それらをモジュールにスキャンして、`@KoinApplication` オブジェクトから Koin を起動する方法を学びます。所要時間は約10分で、JDK 17 と Gradle が必要です。

このチュートリアルではアノテーションを使用します。Compiler Plugin DSL を使用した同じアプリについては、[Kotlin](/docs/quickstart/kotlin) を参照してください。スタイルの比較については、[スタイルの選択](/docs/intro/choosing-your-style) を参照してください。

## コードの取得 {id="get-the-code"}

完全なサンプルは [koin-getting-started/kotlin-annotations](https://github.com/InsertKoinIO/koin-getting-started/tree/main/kotlin-annotations) にあります。リポジトリをクローンし、`kotlin-annotations` フォルダーから実行してください。

```bash
./gradlew run
```

## Gradle のセットアップ {id="gradle-setup"}

このサンプルでは Koin Compiler Plugin を適用し、`koin-core` と `koin-annotations` を追加します。バージョンはバージョンカタログで管理されています。

```toml
# gradle/libs.versions.toml
[versions]
kotlin = "<KOTLIN_VERSION>"
koin = "<KOIN_VERSION>"
koin-plugin = "<KOIN_PLUGIN_VERSION>"

[libraries]
koin-core = { module = "io.insert-koin:koin-core", version.ref = "koin" }
koin-annotations = { module = "io.insert-koin:koin-annotations", version.ref = "koin" }
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
    implementation(libs.koin.annotations)

    testImplementation(libs.koin.test)
    testImplementation(libs.koin.test.junit4)
}
```

Compiler Plugin はアノテーションを処理し、Kotlin 2.3.20 以降を必要とします。`koin-annotations` は Koin のバージョンと共通です。詳細については、[Gradle のセットアップ](/docs/setup/gradle) および [Compiler Plugin のセットアップ](/docs/setup/compiler-plugin) を参照してください。

## アプリケーションの構成 {id="the-application"}

このアプリは3つのコンポーネントを連携させます。`UserApplication` が `UserService` にユーザーを要求し、`UserService` が `UserRepository` から読み取ります。

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

これらのユーザーが、リポジトリに保存されるデータとなります。

## リポジトリの作成 {id="let-s-write-the-repository"}

リポジトリはメモリ内にユーザーを保持します。実装に `@Singleton` アノテーションを付与して、シングルトンとして宣言します。

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

Koin は `UserRepositoryImpl` をそのスーパータイプにバインドするため、`UserRepository` のリクエストに対してこのインスタンスが提供されます。`@Singleton` は `org.koin.core.annotation` のもので、`@Single` と同等です（[定義](/docs/reference/koin-core/definitions) を参照）。

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

Compiler Plugin がコンストラクタを読み取り、`UserRepository` インスタンスを自動的に渡してくれます。

## アプリケーションクラスの作成 {id="let-s-write-the-application-class"}

`UserApplication` はコンストラクタを介して `UserService` を受け取り、ユーザーを読み込んで挨拶を出力します。

```kotlin
@Singleton
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

これで3つのコンポーネントすべてにアノテーションが付与されました。次に、これらをモジュールにまとめます。

## Koin モジュールの宣言 {id="let-s-declare-the-koin-module"}

モジュールは定義をグループ化します（[コアコンセプト](/docs/intro/core-concepts) を参照）。サンプルパッケージをスキャンするモジュールクラスを宣言します。

```kotlin
import org.koin.core.annotation.ComponentScan
import org.koin.core.annotation.Configuration
import org.koin.core.annotation.Module

@Module
@ComponentScan("org.koin.sample")
@Configuration
class AppModule
```

`@ComponentScan` は、`org.koin.sample` とそのサブパッケージ内のすべてのアノテーション付きクラスを登録します。`@Configuration` は、モジュールを `@KoinApplication` エントリポイントから検出可能にします。どちらについても [モジュール](/docs/reference/koin-core/modules) で解説されています。

## Koin の起動 {id="let-s-start-koin"}

`@KoinApplication` オブジェクトを宣言し、型指定された `startKoin<T>()` を使って Koin を起動します。

```kotlin
import org.koin.core.annotation.KoinApplication
import org.koin.mp.KoinPlatform
import org.koin.plugin.module.dsl.startKoin

@KoinApplication
object KoinUserApplication

fun main() {
    startKoin<KoinUserApplication>()

    val userApplication = KoinPlatform.getKoin().get<UserApplication>()
    userApplication.sayHello("Alice")
}
```

`startKoin<KoinUserApplication>()` はすべての `@Configuration` モジュールをロードするため、手動で `modules()` を呼び出す必要はありません。プラグインはビルド時に完全な依存関係グラフを検証し、`./gradlew run` を実行すると `Hello 'Alice' (alice@example.com)!` と出力されます。その他のオプションについては [Koin の起動](/docs/reference/koin-core/starting-koin) を参照してください。

## 次のステップ {id="next-steps"}

- [コアコンセプト](/docs/intro/core-concepts): モジュール、定義、インジェクションの背景にあるメンタルモデル。
- [モジュール](/docs/reference/koin-core/modules): `@Module`、`@ComponentScan`、`@Configuration`、およびモジュールのインクルード。
- [アノテーションリファレンス](/docs/reference/koin-annotations/annotations-inventory): すべてのアノテーションとそのパラメータの一覧。
- [テスト](/docs/reference/koin-test/testing): Koin Test を使用したテストの作成。
- [ツール](/docs/tooling): Koin 向けの IDE プラグインとモニタリングツール。