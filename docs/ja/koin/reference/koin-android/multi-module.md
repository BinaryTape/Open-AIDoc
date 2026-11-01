---
title: マルチモジュールアプリ
---

# マルチモジュールアプリ

このページでは、Gradleモジュール（`:app`、`:feature:*`、`:core:*）に分割されたAndroidアプリでKoinを構成する方法について説明します。各Koinモジュールの配置場所、アプリによるモジュールの読み込み方法、機能間で型を共有する方法、およびDynamic Featureモジュールについて扱います。モジュールの合成（`includes()`、パブリックおよびプライベートモジュール、`@Configuration`）については、[モジュール](/docs/reference/koin-core/modules)で説明しています。

## プロジェクト構成 {id="project-layout"}

```
:app                  Application class, startKoin, appModule
:feature:login        LoginViewModel, LoginUseCase, loginModule
:feature:profile      ProfileViewModel, profileModule
:core:data            repositories, Retrofit, Room, dataModule
:core:domain          interfaces shared by features (UserRepository)
```

各Gradleモジュールは、自身のクラスに対応するKoinモジュールを宣言します。これにより、クラスをそのGradleモジュールに対して`internal`のままに維持でき、Koinモジュールのみを公開（public）にすることができます。`:app`モジュールだけがすべての機能（feature）を認識しているため、Koinの開始処理はここで行われます。

## 機能モジュールの宣言とロード {id="declaring-and-loading-feature-modules"}

**Compiler Plugin DSL**
```kotlin
// Gradle module ":feature:login"
internal class LoginUseCase(private val auth: AuthService)
internal class LoginViewModel(private val login: LoginUseCase) : ViewModel()

val loginModule = module {
    factory<LoginUseCase>()
    viewModel<LoginViewModel>()
}
```

```kotlin
// Gradle module ":app"
val appModule = module {
    includes(dataModule, loginModule, profileModule)
}

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

**Annotations**
```kotlin
// Gradle module ":feature:login"
@Module
@ComponentScan("com.app.feature.login")
@Configuration
class LoginModule

@Factory
internal class LoginUseCase(private val auth: AuthService)

@KoinViewModel
internal class LoginViewModel(private val login: LoginUseCase) : ViewModel()
```

```kotlin
// Gradle module ":app"
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

`startKoin<MainApplication>()`は、機能のGradleモジュールからのものを含め、アプリのクラスパス上にあるすべての`@Configuration`モジュールを検出します。機能を追加する作業は、Gradleの依存関係を追加するだけで済み、それ以外の作業は不要です。代わりにモジュールを明示的に指定してリストアップするには、`@KoinApplication(modules = [LoginModule::class, ProfileModule::class])`を使用します。

**Constructor / Classic DSL**
```kotlin
// Gradle module ":feature:login"
internal class LoginUseCase(private val auth: AuthService)
internal class LoginViewModel(private val login: LoginUseCase) : ViewModel()

val loginModule = module {
    factoryOf(::LoginUseCase)
    viewModelOf(::LoginViewModel)
}
```

```kotlin
// Gradle module ":app"
val appModule = module {
    includes(dataModule, loginModule, profileModule)
}

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

## 機能間での型の共有 {id="sharing-types-between-features"}

機能が別の機能に依存するべきではありません。`:feature:profile`が現在のユーザー（current user）を必要とする場合、coreモジュール内のインターフェースに依存し、その実装はそのクラスが存在する場所でバインドされます。

```kotlin
// Gradle module ":core:domain"
interface UserRepository {
    suspend fun currentUser(): User
}
```

**Compiler Plugin DSL**
```kotlin
// Gradle module ":core:data"
internal class UserRepositoryImpl(private val api: ApiService) : UserRepository

val dataModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
}
```

**Annotations**
```kotlin
// Gradle module ":core:data"
@Singleton
internal class UserRepositoryImpl(private val api: ApiService) : UserRepository
```

**Constructor / Classic DSL**
```kotlin
// Gradle module ":core:data"
internal class UserRepositoryImpl(private val api: ApiService) : UserRepository

val dataModule = module {
    singleOf(::UserRepositoryImpl) bind UserRepository::class
}
```

これにより、`:feature:profile`内の`ProfileViewModel(private val users: UserRepository)`は、実行時に`UserRepositoryImpl`を解決します。すべてのKoinモジュールがロードされている限り、KoinはGradleモジュールをまたいで解決するため、機能側はインターフェース型を参照できるだけで十分です。機能ごとに追加のエントリポイントインターフェースやコンポーネントを用意する必要はありません。

Compiler Pluginを使用する場合、機能モジュール自身には`startKoin`がないため、`:app`がコンパイルされて完全なグラフを組み立てる際に依存関係がチェックされます。[コンパイル時の安全性](/docs/reference/koin-compiler/compile-safety)を参照してください。

## Dynamic Featureモジュール {id="dynamic-feature-modules"}

Play Feature Deliveryでは、ベースアプリからDynamic Featureモジュールのコードを参照することはできません。依存関係は機能からアプリに向かうためです。機能のエントリActivity内で、`loadKoinModules()`を使用して機能自身のKoinモジュールを機能自身からロードします。

```kotlin
// Dynamic feature module ":feature:premium"
internal object PremiumKoin {
    private val modules = lazy { loadKoinModules(premiumModule) }
    fun load() = modules.value
}

class PremiumActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        PremiumKoin.load()
        super.onCreate(savedInstanceState)
    }
}
```

`lazy`により、モジュールがプロセスごとに1回、`super.onCreate()`の前に確実にロードされます。これら双方が重要である理由やアンロード方法については、[AndroidでのKoinの開始](/docs/reference/koin-android/start#loading-modules-after-start)で説明しています。

Compiler Pluginはこの方法でロードされたモジュールを認識できません。ベースアプリで使用される型で、このようなモジュールからのみ提供されるものには、`@Provided`を付与する必要があります（[コンパイル時の安全性](/docs/reference/koin-compiler/compile-safety)を参照）。

## 機能モジュールのテスト {id="testing-feature-modules"}

他のモジュールが提供するものに対してフェイク（Fake）を使用し、各機能モジュールを単独でテストします。Compiler Pluginを使用すると、ビルド時にグラフ全体がチェックされます。使用しない場合は、`verify()`を使用して各モジュールをチェックします（[設定の検証](/docs/reference/koin-test/verify)を参照）。Koinを使用した単体テストについては[ユニットテスト](/docs/reference/koin-test/testing)で、実機（オンデバイス）テストについては[インストゥルメンテッドテスト](/docs/reference/koin-android/instrumented-testing)で解説しています。

## 関連情報 {id="related"}

- [モジュール](/docs/reference/koin-core/modules): `includes()`、モジュールの可視性、および`@Configuration`の検出。
- [AndroidでのKoinの開始](/docs/reference/koin-android/start): `startKoin`と実行時におけるモジュールのロード。
- [コンパイル時の安全性](/docs/reference/koin-compiler/compile-safety): Gradleモジュールをまたいでグラフをチェックする方法。
- [遅延モジュール](/docs/reference/koin-core/lazy-modules): 起動時にバックグラウンドで機能モジュールをロードする。
- [Androidライブラリの統合](/docs/reference/koin-android/binding-patterns): データ層、ドメイン層、UI層。