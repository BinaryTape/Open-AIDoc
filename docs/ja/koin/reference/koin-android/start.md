---
title: AndroidでKoinを開始する
---

# AndroidでKoinを開始する

このページでは、AndroidアプリでKoinを開始する方法について説明します：`Application` クラス、Android `Context`、Logcatロガー、assetsからのプロパティ、起動後のモジュール読み込み、およびAndroidX App Startup。ビルドに `io.insert-koin:koin-android` の依存関係が含まれていることを前提としています（[Gradle Setup](/docs/setup/gradle)を参照）。各プラットフォームでの `startKoin` の動作については、[Starting Koin](/docs/reference/koin-core/starting-koin)を参照してください。

## ApplicationクラスでKoinを開始する {id="start-koin-in-your-application-class"}

`Application.onCreate()` 内で、Koinを1回だけ開始します：

**Compiler Plugin DSL**
```kotlin
import org.koin.android.ext.koin.androidContext
import org.koin.android.ext.koin.androidLogger
import org.koin.core.context.startKoin

class MainApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        startKoin {
            androidLogger()
            androidContext(this@MainApplication)
            modules(appModule)
        }
    }
}
```

`appModule` は、Compiler Plugin DSL（`single<UserRepository>()`、`viewModel<UserViewModel>()`）で宣言された `module { }` です。

**Annotations**
```kotlin
import org.koin.android.ext.koin.androidContext
import org.koin.android.ext.koin.androidLogger
import org.koin.core.annotation.KoinApplication
import org.koin.plugin.module.dsl.startKoin

@KoinApplication
class MainApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        startKoin<MainApplication> {
            androidLogger()
            androidContext(this@MainApplication)
        }
    }
}
```

`startKoin<MainApplication>()` は、`@Configuration` でタグ付けされたすべての `@Module` クラスを読み込みます。モジュールを手動で列挙する必要はありません。明示的にモジュールを選択するには、`@KoinApplication(modules = [AppModule::class])` を使用します。モジュールの検出については [Modules](/docs/reference/koin-core/modules) で説明されています。

**Constructor / Classic DSL**
```kotlin
import org.koin.android.ext.koin.androidContext
import org.koin.android.ext.koin.androidLogger
import org.koin.core.context.startKoin

class MainApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        startKoin {
            androidLogger()
            androidContext(this@MainApplication)
            modules(appModule)
        }
    }
}
```

`<application>` タグに `android:name=".MainApplication"` を指定して `AndroidManifest.xml` にこのクラスを登録してください。登録しない場合、Androidはこれを実行しません。

`androidContext()` は、`Application` インスタンスをKoinに追加し、`Application` と `Context` の両方にバインドします。`androidFileProperties()` や `workManagerFactory()` など、`Context` を必要とするオプションの前に呼び出してください。

## 定義内でのAndroid Context {id="android-context-in-definitions"}

`Context` を必要とするクラスは、コンストラクタでそれを宣言します。修飾子（qualifier）は不要です。Koinは `Context` を `androidContext()` に渡されたインスタンスに解決します。

**Compiler Plugin DSL**
```kotlin
class PreferencesStore(private val context: Context)
class NotificationHelper(private val application: Application)

val androidModule = module {
    single<PreferencesStore>()
    single<NotificationHelper>()
}
```

**Annotations**
```kotlin
@Singleton
class PreferencesStore(private val context: Context)

@Singleton
class NotificationHelper(private val application: Application)
```

**Constructor / Classic DSL**
```kotlin
val androidModule = module {
    singleOf(::PreferencesStore)
    singleOf(::NotificationHelper)
}
```

ラムダ定義内では、`androidContext()` および `androidApplication()` を使って取得します：`single { PreferencesStore(androidContext()) }`。

| 関数 | 戻り値 | 失敗するケース |
|----------|---------|------------|
| `androidContext()` | 最も近い `Context`：`Application`、またはActivityスコープ内のActivity | 開始時に `androidContext()` が渡されなかった場合（`MissingAndroidContextException`） |
| `androidApplication()` | 常に `Application` インスタンス | `androidContext()` に `Application` が渡されなかった場合 |

どちらの関数も、`org.koin.android.ext.koin` の `get<Context>()` および `get<Application>()` へのショートカットです。

### どちらのContextが取得されるか {id="which-context-you-get"}

`single`、またはルートスコープから解決される定義では、`Context` は `Application` になります。これは、アプリと同じライフサイクルを持つオブジェクトに対して安全です。

Activityスコープから解決される定義では、Activityがそのスコープのソースであるため、`Context` はまずActivityに解決されます。これにより、スコープ付きのPresenterがActivityを取得できるようになります。[Android Scopes](/docs/reference/koin-android/scope)を参照してください。

### Activityコンテキスト {id="activity-context"}

`Activity` を `single` の依存関係として宣言しないでください。シングルトンはActivityが破棄された後もActivityを存続させ、Activityのメモリリークを引き起こします。クラスがActivity（画面のメトリクス、ダイアログなど）を必要とする場合は、Activity内で作成するか、Activityを[注入パラメータ（injected parameter）](/docs/reference/koin-core/injection-parameters)として渡すか、あるいはActivityスコープで宣言してください：

```kotlin
class ScreenMetrics(private val activity: Activity) {
    fun screenWidth(): Int = activity.resources.displayMetrics.widthPixels
}

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val metrics = ScreenMetrics(this)
    }
}
```

### 同じAndroid型の複数のインスタンス {id="several-instances-of-the-same-android-type"}

2つの `SharedPreferences` ファイルのように、2つの定義が同じ型を共有している場合は、[修飾子（qualifier）](/docs/reference/koin-core/qualifiers)を使用して区別します：

**Compiler Plugin DSL**
```kotlin
val preferencesModule = module {
    single(named("settings")) {
        androidContext().getSharedPreferences("settings", Context.MODE_PRIVATE)
    }
    single(named("session")) {
        androidContext().getSharedPreferences("session", Context.MODE_PRIVATE)
    }
}
```

**Annotations**
```kotlin
@Module
class PreferencesModule {

    @Singleton
    @Named("settings")
    fun settings(context: Context): SharedPreferences =
        context.getSharedPreferences("settings", Context.MODE_PRIVATE)

    @Singleton
    @Named("session")
    fun session(context: Context): SharedPreferences =
        context.getSharedPreferences("session", Context.MODE_PRIVATE)
}
```

**Constructor / Classic DSL**
```kotlin
val preferencesModule = module {
    single(named("settings")) {
        androidContext().getSharedPreferences("settings", Context.MODE_PRIVATE)
    }
    single(named("session")) {
        androidContext().getSharedPreferences("session", Context.MODE_PRIVATE)
    }
}
```

## ロギング {id="logging"}

`androidLogger()` はKoinのログをLogcatに出力します。デフォルトのログレベルは `Level.INFO` です：

```kotlin
startKoin {
    androidLogger(Level.DEBUG)
    androidContext(this@MainApplication)
    modules(appModule)
}
```

`Level.DEBUG` は、すべての解決処理とその所要時間をログ出力するため、不足している定義のデバッグに役立ちます。ただし解決速度が低下するため、デバッグビルド用として使用してください：`androidLogger(if (BuildConfig.DEBUG) Level.DEBUG else Level.ERROR)`。その他のロガーについては [Starting Koin](/docs/reference/koin-core/starting-koin) に記載されています。

## assetsからのプロパティ {id="properties-from-assets"}

`androidFileProperties()` は、`src/main/assets` 内のファイルからKoinプロパティを読み込みます。デフォルトのファイル名は `koin.properties` です：

```kotlin
startKoin {
    androidContext(this@MainApplication)
    androidFileProperties()                  // assets/koin.properties
    // androidFileProperties("app.properties")
    modules(appModule)
}
```

ファイルの読み込みには `Context` を使用するため、`androidContext()` の後に呼び出してください。ファイルが存在しない場合、Koinはその旨をログに出力して処理を続行します。定義内でプロパティを読み込む方法については、[Starting Koin](/docs/reference/koin-core/starting-koin) を参照してください。

## 開始後のモジュールの読み込み {id="loading-modules-after-start"}

`loadKoinModules()` と `unloadKoinModules()` は、アプリの実行中にモジュールを追加または削除します。Androidでは、特定の少数の画面からしか使用されない機能に適しています：

```kotlin
private val premiumModules = lazy { loadKoinModules(premiumModule) }

class PremiumActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        premiumModules.value
        super.onCreate(savedInstanceState)
    }
}
```

- `super.onCreate()` の前に読み込む：これにより、システムによって復元されたFragmentがその依存関係を見つけることができます。
- プロセスごとに1回だけ読み込む：同じモジュールを再度読み込むと、その定義が再登録され、オーバーライドの警告がログに出力され、Koinが `allowOverride(false)` で実行されている場合は失敗します。
- 慎重にアンロードする：`unloadKoinModules(premiumModule)` はモジュールの定義とそのインスタンスを破棄します。アンロードはその機能が完全に不要になったときにのみ行い、設定変更（configuration change）時には絶対に行わないでください。また、後で再読み込みする場合は、読み込み状態を自身で追跡してください。

## 遅延モジュール {id="lazy-modules"}

大規模なアプリでは、`Application.onCreate()` ですべてのモジュールを読み込むと、メインスレッドでの起動時間が増加します。`lazyModules()` は `lazyModule { }` でマークしたモジュールをバックグラウンドスレッドで読み込み、最初の画面に必要なモジュールは `modules()` で読み込みます。セットアップ、完了待機、および制限事項については、[Lazy Modules](/docs/reference/koin-core/lazy-modules) を参照してください。

## AndroidX App Startupでの開始 {id="start-with-androidx-app-startup"}

[AndroidX App Startup](https://developer.android.com/topic/libraries/app-startup) は、`Application.onCreate()` の前に1つのContentProviderからイニシャライザを実行します。`io.insert-koin:koin-androidx-startup` アーティファクトは、それらのイニシャライザの1つとしてKoinを開始します。`Application` で `KoinStartup` を実装し、`onKoinStartup()` から設定を返します：

**Compiler Plugin DSL**
```kotlin
import org.koin.androix.startup.KoinStartup
import org.koin.dsl.koinConfiguration

@OptIn(KoinExperimentalAPI::class)
class MainApplication : Application(), KoinStartup {

    override fun onKoinStartup() = koinConfiguration {
        androidContext(this@MainApplication)
        modules(appModule)
    }
}
```

**Annotations**
```kotlin
import org.koin.androix.startup.KoinStartup
import org.koin.plugin.module.dsl.koinConfiguration

@KoinApplication
@OptIn(KoinExperimentalAPI::class)
class MainApplication : Application(), KoinStartup {

    override fun onKoinStartup() = koinConfiguration<MainApplication> {
        androidContext(this@MainApplication)
    }
}
```

**Constructor / Classic DSL**
```kotlin
import org.koin.androix.startup.KoinStartup
import org.koin.dsl.koinConfiguration

@OptIn(KoinExperimentalAPI::class)
class MainApplication : Application(), KoinStartup {

    override fun onKoinStartup() = koinConfiguration {
        androidContext(this@MainApplication)
        modules(appModule)
    }
}
```

`KoinStartup` は `onCreate()` 内の `startKoin` 呼び出しを置き換えるため、両方を呼び出さないでください。パッケージ名は `org.koin.androix.startup`（この綴りの通り）であり、APIには `@KoinExperimentalAPI` が付けられています。

別のイニシャライザがKoinを必要とする場合は、それを `KoinInitializer` に依存させてください。App Startupはイニシャライザ自身を生成するため、イニシャライザはエントリポイントとなります。依存関係を取得するために `KoinComponent` を実装します。

```kotlin
class CrashTrackerInitializer : Initializer<Unit>, KoinComponent {

    private val crashTracker: CrashTracker by inject()

    override fun create(context: Context) {
        crashTracker.configure(context)
    }

    override fun dependencies(): List<Class<out Initializer<*>>> =
        listOf(KoinInitializer::class.java)
}
```

:::warning
`KoinStartup` はアプリ起動時にメインスレッドで実行されることに変わりはありません。Koinの起動が速くなるわけではありません。他のApp Startupイニシャライザとの順序制御にのみ使用してください。モジュールの読み込みをメインスレッド外に移動するには、[Lazy Modules](/docs/reference/koin-core/lazy-modules) を使用してください。
:::

## Applicationクラス以外でKoinを開始する {id="starting-koin-outside-the-application-class"}

プロセスごとに1回だけ、かつ最初の注入の前に行われる限り、別のクラスから `startKoin` を呼び出すことができます。ActivityではなくApplicationコンテキストを渡してください：

```kotlin
startKoin {
    androidContext(context.applicationContext)
    modules(appModule)
}
```

`startKoin` はグローバルインスタンスを登録します。独自のKoinセットアップを同梱するライブラリやSDKは、ホストアプリと競合する可能性があるため、これを使用すべきではありません。代わりに分離されたコンテキスト（isolated context）を使用してください（[Context Isolation](/docs/reference/koin-core/context-isolation)を参照）。

## 関連情報 {id="related"}

- [Starting Koin](/docs/reference/koin-core/starting-koin): 各プラットフォームでの `startKoin` オプション、ロガー、プロパティ。
- [Android Entry Points](/docs/reference/koin-android/entry-points): Activity、Fragment、Service、その他のコンポーネントでの注入。
- [Android Scopes](/docs/reference/koin-android/scope): インスタンスをActivityまたはFragmentのライフサイクルにバインドする。
- [Modules](/docs/reference/koin-core/modules): 定義を整理し、`@Configuration` による検出を使用する。
- [Lazy Modules](/docs/reference/koin-core/lazy-modules): バックグラウンドでモジュールを読み込む。
- [Multi-Module Apps](/docs/reference/koin-android/multi-module): Gradleモジュール間でKoinモジュールを整理する。