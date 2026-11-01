---
title: Android Jetpack Compose
---

# Android Jetpack Compose

このチュートリアルでは、リストから選択したユーザーに挨拶を表示するJetpack Compose UIを備えたAndroidアプリを作成します。KoinモジュールでViewModelを宣言する方法、`koinViewModel()` を使用してコンポーザブル（composable）にそれを注入（inject）する方法、そして `Application` クラスからKoinを開始する方法を学びます。所要時間は約10分で、Android Studioが必要です。

このチュートリアルではCompiler Plugin DSLを使用します。アノテーションを使用したAndroidアプリについては、[Android & Annotations](/docs/quickstart/android-annotations) を参照してください。スタイルの比較については、[Choosing your style](/docs/intro/choosing-your-style) を参照してください。

## コードの取得 {id="get-the-code"}

完全なサンプルコードは [koin-getting-started/android-compose](https://github.com/InsertKoinIO/koin-getting-started/tree/main/android-compose) にあります。リポジトリをクローンし、Android Studioで `android-compose` フォルダを開いてください。

## Gradleの設定 {id="gradle-setup"}

このサンプルでは、Koin Compiler Pluginを適用し、`koin-android` と `koin-androidx-compose` を追加します。バージョンはバージョンカタログ（Version Catalog）で管理されています。

```toml
# gradle/libs.versions.toml
[versions]
# Kotlin、Android Gradle Plugin、AndroidX、Composeのエントリは省略されています
koin = "<KOIN_VERSION>"
koin-plugin = "<KOIN_PLUGIN_VERSION>"

[libraries]
koin-android = { module = "io.insert-koin:koin-android", version.ref = "koin" }
koin-androidx-compose = { module = "io.insert-koin:koin-androidx-compose", version.ref = "koin" }
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
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.koin.compiler)
}

android {
    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(libs.koin.android)
    implementation(libs.koin.androidx-compose)

    // Compose BOM, ui, material3, activity-compose, lifecycle-viewmodel-compose
    implementation(platform(libs.compose.bom))
    ...

    testImplementation(libs.koin.test.junit4)
    testImplementation(libs.koin.android.test)
}
```

Compiler PluginにはKotlin 2.3.20以降が必要です。最新バージョンやBOMについては、[Gradle setup](/docs/setup/gradle) を参照してください。プラグインのオプションについては、[Compiler Plugin setup](/docs/setup/compiler-plugin) を参照してください。

## アプリケーションの構成 {id="the-application"}

メイン画面はViewModelに挨拶メッセージを要求します。ViewModelは `UserRepository` からデータを読み取る `UserService` を使用します。

```
User -> UserRepository -> UserService -> UserViewModel -> MainScreen
```

## ユーザーデータの作成 {id="let-s-write-the-user-data"}

まずはデータクラスとデフォルトのユーザーリストから作成します。

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

リポジトリはユーザーをメモリ上に保持し、名前でユーザーを検索します。

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

`UserService` は作成時にユーザーを読み込み、挨拶メッセージを準備します。

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

`UserServiceImpl` は `UserRepository` に依存しています。Koinはコンストラクタ経由でそれを渡します。

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

他のコンポーネントと同様に、コンストラクタを通じて `UserService` を受け取ります。

## Koinモジュールの宣言 {id="let-s-declare-the-koin-module"}

モジュールは、Koinが作成するコンポーネントを宣言する場所です（[Core Concepts](/docs/intro/core-concepts) を参照）。リポジトリとサービスをそれぞれのインターフェースにバインドされたシングルトンとして宣言し、ViewModelは `viewModel` で宣言します。

```kotlin
import org.koin.dsl.bind
import org.koin.dsl.module
import org.koin.plugin.module.dsl.single
import org.koin.plugin.module.dsl.viewModel

val appModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
    single<UserServiceImpl>() bind UserService::class
    viewModel<UserViewModel>()
}
```

Compiler Pluginは各コンストラクタを読み取り、すべての依存関係が宣言されているかをビルド時に検証します。定義のタイプについては、[Definitions](/docs/reference/koin-core/definitions) で説明されています。

## コンポーザブルへのViewModelの注入 {id="let-s-inject-the-viewmodel-in-a-composable"}

`ComponentActivity` 内でComposeコンテンツを設定し、`MainScreen` のデフォルトパラメータとして `koinViewModel()` を使用してViewModelを取得します。

```kotlin
import org.koin.androidx.compose.koinViewModel

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                MainScreen()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
    viewModel: UserViewModel = koinViewModel()
) {
    var nameInput by remember { mutableStateOf("") }
    var greetingMessage by remember { mutableStateOf("") }

    Scaffold(
        topBar = { TopAppBar(title = { Text("Koin Sample") }) }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            OutlinedTextField(
                value = nameInput,
                onValueChange = { nameInput = it },
                label = { Text("Enter name") },
                modifier = Modifier.fillMaxWidth()
            )

            Button(
                onClick = {
                    val userName = nameInput.trim().ifEmpty { "Alice" }
                    greetingMessage = viewModel.sayHello(userName)
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Say Hello")
            }

            if (greetingMessage.isNotEmpty()) {
                Text(
                    text = greetingMessage,
                    style = MaterialTheme.typography.bodyLarge,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }
    }
}
```

`koinViewModel()` はKoinからViewModelを取得し、最も近い `ViewModelStoreOwner`（ここではActivity）に紐付けます。デフォルトパラメータとして設定することで、プレビューやテストで別のインスタンスを渡すことが可能になります。`koinInject()` などのその他のCompose APIについては、[Compose ViewModel](/docs/reference/koin-compose/compose-viewmodel) および [Koin for Compose](/docs/reference/koin-compose/compose) を参照してください。

## Koinの開始 {id="let-s-start-koin"}

`Application` クラスでKoinを開始し、そのクラスを `AndroidManifest.xml` に登録します。

```kotlin
import org.koin.android.ext.koin.androidContext
import org.koin.core.context.startKoin

class MainApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        startKoin {
            androidContext(this@MainApplication)
            modules(appModule)
        }
    }
}
```

`androidContext()` を使用すると、Androidの `Context` を定義内で利用できるようになります。アプリを実行し、名前を入力してボタンをタップすると挨拶が表示されます。その他のオプションについては、[Starting Koin on Android](/docs/reference/koin-android/start) を参照してください。

## 次のステップ {id="next-steps"}

- [Core Concepts](/docs/intro/core-concepts): モジュール、定義、インジェクション（依存性注入）の基礎概念。
- [Koin for Compose](/docs/reference/koin-compose/compose): `koinInject()`、`KoinApplication`、およびComposeのセットアップ。
- [Compose Multiplatform](/docs/quickstart/cmp): Compose UIとKoinモジュールをiOSと共有。
- [Compose testing](/docs/reference/koin-compose/compose-testing): Koinを使用するコンポーザブルのテスト。
- [Tooling](/docs/tooling): Koin向けのIDEプラグインと監視ツール。