---
title: Android
---

# Android

このチュートリアルでは、リストから選択したユーザーに挨拶するAndroidアプリを構築します。Koinモジュールの宣言方法、ActivityへのPresenterのインジェクト方法、そして`Application`クラスからのKoinの起動方法を学びます。所要時間は約10分で、Android Studioが必要です。

このチュートリアルではCompiler Plugin DSLを使用します。アノテーションを使用した同じアプリの実装については、[Android & Annotations](/docs/quickstart/android-annotations)を参照してください。スタイルの比較については、[Choosing your style](/docs/intro/choosing-your-style)を参照してください。[Android ViewModel](/docs/quickstart/android-viewmodel)チュートリアルでは、Presenterの代わりにViewModelを使用して同じアプリを構築します。

## コードの取得 {id="get-the-code"}

完全なサンプルは[koin-getting-started/android](https://github.com/InsertKoinIO/koin-getting-started/tree/main/android)にあります。リポジトリをクローンし、Android Studioで`android`フォルダーを開いてください。

## Gradleのセットアップ {id="gradle-setup"}

サンプルではKoin Compiler Pluginを適用し、`koin-android`を追加しています。バージョンはバージョンカタログ（Version Catalog）で管理されています。

```toml
# gradle/libs.versions.toml
[versions]
# Kotlin、Android Gradle Plugin、AndroidXのエントリは省略されています
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

Compiler PluginにはKotlin 2.3.20以降が必要です。現在のバージョンおよびBOMについては、[Gradle setup](/docs/setup/gradle)を参照してください。プラグインのオプションについては、[Compiler Plugin setup](/docs/setup/compiler-plugin)を参照してください。

## アプリケーションの構成 {id="the-application"}

ActivityはPresenterに挨拶メッセージを要求します。Presenterは`UserRepository`から読み取りを行う`UserService`を使用します。

```
User -> UserRepository -> UserService -> UserPresenter -> MainActivity
```

## ユーザーデータの作成 {id="let-s-write-the-user-data"}

まずはデータクラスとユーザーのデフォルトリストの作成から始めます。

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

リポジトリはユーザーをメモリ内に保持し、名前で検索します。

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

`UserRepositoryImpl`には依存関係がないため、Koinは追加情報なしでこれを生成できます。

## サービスの作成 {id="let-s-write-the-service"}

`UserService`は生成時にユーザーを読み込み、挨拶メッセージを準備します。

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

`UserServiceImpl`は`UserRepository`に依存しています。Koinはこれをコンストラクタ経由で渡します。

## Koinモジュールの宣言 {id="let-s-declare-the-koin-module"}

モジュールは、Koinが生成するコンポーネントを宣言する場所です（[Core Concepts](/docs/intro/core-concepts)を参照）。両方のコンポーネントをシングルトンとして宣言し、それぞれのインターフェースにバインドします。

```kotlin
import org.koin.dsl.bind
import org.koin.dsl.module
import org.koin.plugin.module.dsl.single

val appModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
    single<UserServiceImpl>() bind UserService::class
}
```

これで、`UserService`を要求するコンポーネントはすべて同じ`UserServiceImpl`インスタンスを取得するようになります。`single`と`bind`の詳細については、[Definitions](/docs/reference/koin-core/definitions)で解説されています。

## Presenterの作成 {id="let-s-write-the-presenter"}

Presenterは名前を挨拶メッセージに変換します。

```kotlin
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

リクエストごとに新しいインスタンスが生成され、Koinがその参照を保持しないように、`factory`を使って宣言します。

```kotlin
import org.koin.plugin.module.dsl.factory

val appModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
    single<UserServiceImpl>() bind UserService::class
    factory<UserPresenter>()
}
```

`factory`のPresenterは、それを使用するActivityのライフサイクルを超えて生存することはないため、Activityのリークを防ぐことができます。

## ActivityへのPresenterのインジェクト {id="let-s-inject-the-presenter-in-the-activity"}

`MainActivity`でPresenterを取得するには、`by inject()`デリゲートを使用します。

```kotlin
import org.koin.android.ext.android.inject

class MainActivity : AppCompatActivity() {

    private val presenter: UserPresenter by inject()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_simple)

        val nameInput = findViewById<EditText>(R.id.nameInput)
        val sayHelloButton = findViewById<Button>(R.id.sayHelloButton)
        val textField = findViewById<TextView>(R.id.text)

        sayHelloButton.setOnClickListener {
            val userName = nameInput.text.toString().trim().ifEmpty { "Alice" }
            textField.text = presenter.sayHello(userName)
        }
    }
}
```

`by inject()`は、最初に使用されるタイミングでPresenterを遅延解決（Lazy Resolve）します。これをサポートしている他のAndroidコンポーネントについては、[Android Entry Points](/docs/reference/koin-android/entry-points)に記載されています。

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

`androidContext()`によってAndroidの`Context`が定義から利用可能になり、`androidLogger()`によってKoinのログがLogcatに出力されます。アプリを実行し、名前を入力してボタンをタップすると、挨拶メッセージが表示されます。その他のオプションについては、[Starting Koin on Android](/docs/reference/koin-android/start)を参照してください。

## 次のステップ {id="next-steps"}

- [Core Concepts](/docs/intro/core-concepts): モジュール、定義、インジェクションの背景にあるメンタルモデル。
- [Android ViewModel](/docs/quickstart/android-viewmodel): ViewModelを使用した同じアプリの構築。
- [Android Entry Points](/docs/reference/koin-android/entry-points): Fragment、Service、Receiverなどへのインジェクト。
- [Instrumented testing](/docs/reference/koin-android/instrumented-testing): Koinを使用したAndroidアプリのテスト。
- [Tooling](/docs/tooling): Koin向けのIDEプラグインとモニタリングツール。