---
title: Android & Annotations
---

# Android & Annotations

このチュートリアルでは、リストから選択したユーザーに挨拶を表示するAndroidアプリを作成します。クラスへのアノテーションの付与、モジュールへのスキャン、ViewModelへの独自のスコープ付き依存関係の付与、そして`@KoinApplication`クラスからのKoinの起動方法を学びます。所要時間は約10分で、Android Studioが必要です。

このチュートリアルではアノテーションを使用します。Compiler Plugin DSLを使用した同じアプリについては、[Android](/docs/quickstart/android)および[Android ViewModel](/docs/quickstart/android-viewmodel)を参照してください。スタイルの比較については、[Choosing your style](/docs/intro/choosing-your-style)を参照してください。

## コードの取得 {id="get-the-code"}

完全なサンプルコードは [koin-getting-started/android-annotations](https://github.com/InsertKoinIO/koin-getting-started/tree/main/android-annotations) にあります。リポジトリをクローンし、Android Studioで`android-annotations`フォルダを開いてください。

## Gradleのセットアップ {id="gradle-setup"}

このサンプルでは、Koin Compiler Pluginを適用し、`koin-android`と`koin-annotations`を追加します。バージョンはバージョンカタログで管理されます。

```toml
# gradle/libs.versions.toml
[versions]
# Kotlin、Android Gradle Plugin、AndroidXのエントリは省略
koin = "<KOIN_VERSION>"
koin-plugin = "<KOIN_PLUGIN_VERSION>"

[libraries]
koin-android = { module = "io.insert-koin:koin-android", version.ref = "koin" }
koin-annotations = { module = "io.insert-koin:koin-annotations", version.ref = "koin" }
koin-test-junit4 = { module = "io.insert-koin:koin-test-junit4", version.ref = "koin" }

[plugins]
koin-compiler = { id = "io.insert-koin.compiler.plugin", version.ref = "koin-plugin" }
```

```kotlin
// app/build.gradle.kts
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.koin.compiler)
}

dependencies {
    implementation(libs.android.appcompat)
    implementation(libs.koin.android)
    implementation(libs.koin.annotations)

    testImplementation(libs.koin.test.junit4)
}
```

Compiler Pluginはアノテーションを処理し、Kotlin 2.3.20以降が必要です。`koin-annotations`はKoinと同じバージョンを使用します。コンパイル時の安全性（Compile-time safety）はデフォルトで有効になっています。詳細については、[Gradle setup](/docs/setup/gradle)および[Compiler Plugin setup](/docs/setup/compiler-plugin)を参照してください。

## アプリケーションの概要 {id="the-application"}

ActivityはViewModelに挨拶を要求します。ViewModelは`UserRepository`からデータを読み取る`UserService`を使用し、自身のライフサイクルにスコープが限定された`UserPresenter`を保持します。

```
User -> UserRepository -> UserService -> UserViewModel (+ UserPresenter) -> MainActivity
```

## ユーザーデータの作成 {id="let-s-write-the-user-data"}

まずはデータクラスとデフォルトのユーザーリストを作成します。

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

リポジトリはユーザーをメモリ内に保持します。実装クラスに`@Singleton`アノテーションを付与します。

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

Koinは`UserRepositoryImpl`をそのスーパータイプにバインドするため、`UserRepository`のリクエストに対してこのインスタンスが提供されます。`@Singleton`は`@Single`と同等です（[Definitions](/docs/reference/koin-core/definitions)を参照）。

## サービスの作成 {id="let-s-write-the-service"}

`UserService`は作成時にユーザーを読み込み、挨拶メッセージを準備します。

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

    init {
        loadUsers()
    }

    override fun getUserOrNull(name: String): User? = userRepository.findUserOrNull(name)

    override fun loadUsers() {
        userRepository.addUsers(DEFAULT_USERS)
    }

    override fun prepareHelloMessage(user: User?): String {
        return user?.let { "Hello '${user.name}' (${user.email})!" } ?: "User not found"
    }
}
```

Compiler Pluginがコンストラクタを読み取り、`UserRepository`インスタンスを自動で渡します。

## PresenterとViewModelの作成 {id="let-s-write-the-presenter-and-the-viewmodel"}

Presenterは挨拶をフォーマットします。各ViewModelが独自のインスタンスを取得できるように、`@ViewModelScope`アノテーションを付与します。

```kotlin
import org.koin.core.annotation.ViewModelScope

@ViewModelScope
class UserPresenter(
    private val userService: UserService
) {

    fun sayHello(name: String): String {
        val user = userService.getUserOrNull(name)
        val message = userService.prepareHelloMessage(user)
        return "[UserPresenter] $message"
    }
}
```

ViewModelには`@KoinViewModel`を付与し、さらにスコープ付きPresenterを受け取れるように`@ViewModelScope`を付与します。

```kotlin
import org.koin.core.annotation.KoinViewModel
import org.koin.core.annotation.ViewModelScope

@ViewModelScope
@KoinViewModel
class UserViewModel(
    private val userService: UserService,
    private val userPresenter: UserPresenter
) : ViewModel() {

    fun sayHello(name: String): String {
        val user = userService.getUserOrNull(name)
        val message = userService.prepareHelloMessage(user)
        return "[UserViewModel] $message"
    }
}
```

PresenterはViewModelと同じ期間生存し、ViewModelが破棄（クリア）されると解放されます。ViewModelスコープについては[ViewModel](/docs/reference/koin-core/viewmodel)で、スコープ全般については[Scopes](/docs/reference/koin-core/scopes)で解説されています。

## Koinモジュールの宣言 {id="let-s-declare-the-koin-module"}

モジュールは定義をグループ化します（[Core Concepts](/docs/intro/core-concepts)を参照）。サンプルのパッケージをスキャンするモジュールクラスを宣言します。

```kotlin
import org.koin.core.annotation.ComponentScan
import org.koin.core.annotation.Configuration
import org.koin.core.annotation.Module

@Module
@ComponentScan("org.koin.sample")
@Configuration
class AppModule
```

`@ComponentScan`は、`org.koin.sample`とそのサブパッケージ内のすべてのアノテーション付きクラスを登録します。`@Configuration`は、モジュールを`@KoinApplication`エントリポイントから検出可能にします。どちらについても[Modules](/docs/reference/koin-core/modules)で説明されています。

## ActivityへのViewModelの注入 {id="let-s-inject-the-viewmodel-in-the-activity"}

`MainActivity`で`by viewModel()`デリゲートを使用します。

```kotlin
import org.koin.androidx.viewmodel.ext.android.viewModel

class MainActivity : AppCompatActivity() {

    private val viewModel: UserViewModel by viewModel()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_simple)

        val nameInput = findViewById<EditText>(R.id.nameInput)
        val sayHelloButton = findViewById<Button>(R.id.sayHelloButton)
        val textField = findViewById<TextView>(R.id.text)

        sayHelloButton.setOnClickListener {
            val userName = nameInput.text.toString().trim().ifEmpty { "Alice" }
            textField.text = viewModel.sayHello(userName)
        }
    }
}
```

`by viewModel()`はViewModelファクトリを自動生成し、インスタンスをActivityのライフサイクルにバインドします。その他のデリゲートについては[Android ViewModel](/docs/reference/koin-android/viewmodel)を参照してください。

## Koinの起動 {id="let-s-start-koin"}

`Application`クラスに`@KoinApplication`アノテーションを付与し、型付きの`startKoin<T>()`でKoinを起動します。このクラスを`AndroidManifest.xml`に登録してください。

```kotlin
import org.koin.android.ext.koin.androidContext
import org.koin.android.ext.koin.androidLogger
import org.koin.core.annotation.KoinApplication
import org.koin.core.annotation.KoinViewModelScopeApi
import org.koin.core.logger.Level
import org.koin.core.option.viewModelScopeFactory
import org.koin.plugin.module.dsl.startKoin

@OptIn(KoinViewModelScopeApi::class)
@KoinApplication
class MainApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        startKoin<MainApplication> {
            androidContext(this@MainApplication)
            androidLogger(level = Level.DEBUG)
            options(viewModelScopeFactory())
        }
    }
}
```

`startKoin<MainApplication>`はすべての`@Configuration`モジュールを読み込むため、`modules()`を呼び出す必要はありません。`viewModelScopeFactory()`は、`@ViewModelScope`に必要なスコープをViewModelごとに作成するようKoinに指示します。これはオプトインAPI（`@KoinViewModelScopeApi`）です。その他のオプションについては[Starting Koin on Android](/docs/reference/koin-android/start)を参照してください。

## ビルド時のグラフ検証 {id="let-s-check-the-graph-at-build-time"}

プロジェクトをビルドします。Compiler Pluginがグラフ全体を検証します。依存関係の不足、クォリファイアの不一致、あるいは未宣言のViewModelに対する`by viewModel()`の呼び出しがある場合、該当するファイルと行番号とともにビルドが失敗します。

アプリを実行し、名前を入力してボタンをタップすると、挨拶が表示されます。プラグインがチェックする内容については[Compile-Time Safety](/docs/reference/koin-compiler/compile-safety)に記載されています。

## 次のステップ {id="next-steps"}

- [Core Concepts](/docs/intro/core-concepts): モジュール、定義、注入の背後にあるメンタルモデル。
- [Android scopes](/docs/reference/koin-android/scope): AndroidにおけるActivity、Fragment、ViewModelのスコープ。
- [Annotations Reference](/docs/reference/koin-annotations/annotations-inventory): 各アノテーションとそのパラメータの一覧。
- [Instrumented testing](/docs/reference/koin-android/instrumented-testing): Koinを使用したAndroidアプリのインストルメンテーションテスト。
- [Tooling](/docs/tooling): Koin向けのIDEプラグインと監視ツール。