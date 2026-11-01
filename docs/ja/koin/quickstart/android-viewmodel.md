---
title: Android ViewModel
---

# Android ViewModel

このチュートリアルでは、リストから選択したユーザーに挨拶するAndroidアプリを構築します。KoinモジュールでViewModelを宣言し、それをActivityに注入（インジェクト）して、`Application`クラスからKoinを開始する方法を学びます。所要時間は約10分で、Android Studioが必要です。

このチュートリアルではCompiler Plugin DSLを使用します。アノテーションを使用した同じアプリの実装については、[Android & Annotations](/docs/quickstart/android-annotations)を参照してください。スタイルの比較については、[Choosing your style](/docs/intro/choosing-your-style)を参照してください。

## コードの取得 {id="get-the-code"}

完全なサンプルコードは [koin-getting-started/android](https://github.com/InsertKoinIO/koin-getting-started/tree/main/android) にあります。リポジトリをクローンし、Android Studioで`android`フォルダを開いてください。

## Gradleのセットアップ {id="gradle-setup"}

サンプルではKoin Compiler Pluginを適用し、ViewModelのサポートを含む`koin-android`を追加しています。バージョンはバージョンカタログ（version catalog）で管理されています。

```toml
# gradle/libs.versions.toml
[versions]
# Kotlin、Android Gradle Plugin、AndroidXのエントリは省略
koin = "<KOIN_VERSION>"
koin-plugin = "<KOIN_PLUGIN_VERSION>"

[libraries]
koin-android = { module = "io.insert-koin:koin-android", version.ref = "koin" }
koin-test-junit4 = { module = "io.insert-koin:koin-test-junit4", version.ref = "koin" }
koin-android-test = { module = "io.insert-koin:koin-android-test", version.ref = "koin" }

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

    testImplementation(libs.koin.test.junit4)
    testImplementation(libs.koin.android.test)
}
```

Compiler PluginにはKotlin 2.3.20以降が必要です。最新バージョンやBOMについては、[Gradle setup](/docs/setup/gradle)を参照してください。プラグインのオプションについては、[Compiler Plugin setup](/docs/setup/compiler-plugin)を参照してください。

## アプリケーションの構成 {id="the-application"}

ActivityはViewModelに挨拶メッセージを要求します。ViewModelは`UserRepository`からデータを読み取る`UserService`を使用します。

```
User -> UserRepository -> UserService -> UserViewModel -> MainActivity
```

## ユーザーデータの作成 {id="let-s-write-the-user-data"}

まずはデータクラスとユーザーのデフォルトリストから作成します。

```kotlin
data class User(val name: String, val email: String)

val DEFAULT_USER = User("Alice", "alice@example.com")

val DEFAULT_USERS = listOf(
    DEFAULT_USER,
    User("Bob", "bob@example.com"),
    User("Charlie", "charlie@example.com")
)
```

これらのユーザーデータが、リポジトリに保存される対象となります。

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

`UserRepositoryImpl`には依存関係がないため、Koinは追加情報なしでインスタンスを作成できます。

## サービスの作成 {id="let-s-write-the-service"}

`UserService`は作成時にユーザーを読み込み、挨拶メッセージを準備します。

```kotlin
interface UserService {
    fun getUserOrNull(name: String = DEFAULT_USER.name): User?
    fun loadUsers()
    fun prepareHelloMessage(user: User?): String
}

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

`UserServiceImpl`は`UserRepository`に依存しています。Koinはコンストラクタ経由でこの依存関係を注入します。

## Koinモジュールの宣言 {id="let-s-declare-the-koin-module"}

モジュールは、Koinが作成するコンポーネントを宣言する場所です（[Core Concepts](/docs/intro/core-concepts)を参照）。両方のコンポーネントをそれぞれのインターフェースにバインドされたシングルトンとして宣言します。

```kotlin
import org.koin.dsl.bind
import org.koin.dsl.module
import org.koin.plugin.module.dsl.single

val appModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
    single<UserServiceImpl>() bind UserService::class
}
```

これで、`UserService`を要求するコンポーネントは常に同じ`UserServiceImpl`インスタンスを取得するようになります。`single`と`bind`の詳細については、[Definitions](/docs/reference/koin-core/definitions)を参照してください。

## ViewModelの作成 {id="let-s-write-the-viewmodel"}

ViewModelは名前を受け取って挨拶メッセージに変換します。

```kotlin
class UserViewModel(
    private val userService: UserService
) : ViewModel() {

    fun sayHello(name: String): String {
        val user = userService.getUserOrNull(name)
        val message = userService.prepareHelloMessage(user)
        return "[UserViewModel] $message"
    }
}
```

これを`viewModel`を使って宣言します。

```kotlin
import org.koin.plugin.module.dsl.viewModel

val appModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
    single<UserServiceImpl>() bind UserService::class
    viewModel<UserViewModel>()
}
```

これで、AndroidのViewModel機構がインスタンスを管理するようになります。画面回転などの設定変更（configuration changes）をまたいでインスタンスが保持され、オーナーが破棄されると同時にクリアされます。パラメータや`SavedStateHandle`の扱いについては、[ViewModel](/docs/reference/koin-core/viewmodel)を参照してください。

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

`by viewModel()`は内部でViewModelファクトリを生成し、インスタンスをActivityのライフサイクルにバインドします。Fragment向けの`activityViewModel()`など、その他のデリゲートについては[Android ViewModel](/docs/reference/koin-android/viewmodel)を参照してください。

## Koinの開始 {id="let-s-start-koin"}

`Application`クラスでKoinを開始し、そのクラスを`AndroidManifest.xml`に登録します。

```kotlin
import org.koin.android.ext.koin.androidContext
import org.koin.android.ext.koin.androidLogger
import org.koin.core.context.startKoin
import org.koin.core.logger.Level

class MainApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        startKoin {
            androidLogger(Level.DEBUG)
            androidContext(this@MainApplication)
            modules(appModule)
        }
    }
}
```

`androidContext()`によって定義内でAndroidの`Context`が利用可能になり、`androidLogger()`によってKoinのログがLogcatに出力されます。アプリを実行し、名前を入力してボタンをタップすると、挨拶が表示されます。その他のオプションについては[Starting Koin on Android](/docs/reference/koin-android/start)を参照してください。

## 次のステップ {id="next-steps"}

- [Core Concepts](/docs/intro/core-concepts): モジュール、定義、注入の基本概念。
- [Android ViewModel](/docs/reference/koin-android/viewmodel): すべてのViewModelデリゲート、共有ViewModel、ナビゲーショングラフ。
- [Android Jetpack Compose](/docs/quickstart/android-compose): Compose UIを使用した同じアプリの実装。
- [Instrumented testing](/docs/reference/koin-android/instrumented-testing): Koinを使用したAndroidアプリのインストルメンテーションテスト。
- [Tooling](/docs/tooling): Koin用のIDEプラグインおよびモニタリングツール。