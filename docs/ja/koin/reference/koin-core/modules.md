---
title: モジュール
---

# モジュール

モジュールは、機能ごとまたはレイヤーごとに関連する定義をグループ化します。このページでは、モジュールの宣言方法、モジュールの合成、アノテーションが付与されたクラスをパッケージからスキャンする方法、Gradleモジュールをまたいでモジュールを検出する方法、およびモジュールがロードされる順序について説明します。モジュール内の定義については、[Definitions](/docs/reference/koin-core/definitions) を参照してください。

## モジュールの宣言 {id="declare-a-module"}

**Compiler Plugin DSL**
```kotlin
import org.koin.dsl.module
import org.koin.plugin.module.dsl.*

val networkModule = module {
    single<ApiClient>()
    single<TokenManager>()
}

val dataModule = module {
    single<Database>()
    single<UserRepository>()
}
```

**Annotations**
```kotlin
@Module
@ComponentScan("com.myapp.network")
class NetworkModule

@Module
@ComponentScan("com.myapp.data")
class DataModule
```

`@Module` クラスは、`@ComponentScan` によって検出されたアノテーション付きクラスと、その内部で宣言されたプロバイダー関数をまとめます（[Classes you don't own](/docs/reference/koin-core/definitions#classes-you-dont-own) を参照）。

**Constructor / Classic DSL**
```kotlin
import org.koin.dsl.module
import org.koin.core.module.dsl.*

val networkModule = module {
    singleOf(::ApiClient)
    singleOf(::TokenManager)
}

val dataModule = module {
    singleOf(::Database)
    singleOf(::UserRepository)
}
```

ある定義が別のモジュールの定義に依存することも可能です。Koinはロードされたすべてのモジュールを横断して解決を行うため、`dataModule` 内の `UserRepository` はモジュール間のインポートなしに `networkModule` の `ApiClient` を使用できます。両方のモジュールがロードされている必要があります。詳細については [Starting Koin](/docs/reference/koin-core/starting-koin) を参照してください。

## `includes()` によるモジュールの合成 {id="module-composition-with-includes"}

モジュールは他のモジュールを含める（インクルードする）ことができます。親モジュールをロードすると、ツリー全体がロードされます。

**Compiler Plugin DSL**
```kotlin
val networkModule = module {
    single<ApiClient>()
}

val storageModule = module {
    single<Database>()
}

val dataModule = module {
    includes(networkModule, storageModule)
    single<UserRepository>()
}

startKoin {
    modules(dataModule)
}
```

**Annotations**
```kotlin
@Module
class NetworkModule

@Module
class StorageModule

@Module(includes = [NetworkModule::class, StorageModule::class])
@ComponentScan("com.myapp.data")
class DataModule

@KoinApplication(modules = [DataModule::class])
class MyApp
```

**Constructor / Classic DSL**
```kotlin
val networkModule = module {
    singleOf(::ApiClient)
}

val storageModule = module {
    singleOf(::Database)
}

val dataModule = module {
    includes(networkModule, storageModule)
    singleOf(::UserRepository)
}

startKoin {
    modules(dataModule)
}
```

`startKoin` 内でフラットな長いリストを記述するよりも、1つのルートモジュールを持つ `includes()` のツリー構造を優先してください。そうすることでモジュールの構造がコードの構造と一致し、スタートアップの呼び出しも簡潔に保たれます。

Koinはツリーをフラット化し、複数の親がインクルードしている場合でも、各モジュールを1回だけロードします。

```kotlin
val commonModule = module {
    single<Logger>()
}

val featureAModule = module {
    includes(commonModule)
    single<FeatureA>()
}

val featureBModule = module {
    includes(commonModule)
    single<FeatureB>()
}

val appModule = module {
    includes(featureAModule, featureBModule) // commonModule は1回だけロードされる
}
```

### マルチモジュールプロジェクトにおける可視性 {id="visibility-in-multi-module-projects"}

Gradleのマルチモジュールプロジェクトでは、機能ごとに1つの公開モジュールを公開し、その他は `private` または `internal` に保ちます。

```kotlin
// Gradleモジュール "feature-user"
private val userDataModule = module {
    single<UserDao>()
    single<UserCache>()
}

val userFeatureModule = module {
    includes(userDataModule)
    viewModel<UserViewModel>()
}
```

アプリモジュールは `userFeatureModule` をロードし、内部モジュールを参照することはありません。Gradleモジュールに分割されたAndroidアプリの全体的な構成については、[Multi-Module Apps](/docs/reference/koin-android/multi-module) を参照してください。

## @ComponentScan によるパッケージのスキャン {id="scan-packages-with-componentscan"}

`@ComponentScan` はアノテーション専用です。パッケージおよびそのサブパッケージ内のすべてのアノテーション付きクラスとトップレベル関数を収集します。

```kotlin
@Module
@ComponentScan
class AppModule // AppModule のパッケージをスキャン

@Module
@ComponentScan("com.myapp.features")
class FeatureModule

@Module
@ComponentScan("com.myapp.data", "com.myapp.network")
class InfraModule
```

値を指定しない場合、アノテーションが付与されたクラスのパッケージをスキャンします。このスキャンはGradleモジュールをまたいで行われるため、同一パッケージ内にある別のGradleモジュールのクラスも検出されます。

DSLスタイルを使用する場合、モジュール内の各定義は自分で記述して列挙します。両方を混在させるには、アノテーション付きモジュールの横にあるスタートブロックにDSLモジュールを含めます（[Typed startup with @KoinApplication](/docs/reference/koin-core/starting-koin#typed-startup-with-koinapplication) を参照）。

## @Configuration による自動検出 {id="auto-discovery-with-configuration"}

`@Configuration` は `@Module` に付与することで、リストに明示的に記述しなくても `@KoinApplication` がそのモジュールを検出できるようにします。モジュールはクラスパス上の任意のGradleモジュール内に配置できます。

```kotlin
// Gradleモジュール "feature-user"
@Module
@Configuration
@ComponentScan("com.myapp.feature.user")
class UserFeatureModule

// Gradleモジュール "app"
@KoinApplication
class MyApp

fun main() {
    startKoin<MyApp>() // UserFeatureModule をロード
}
```

これにより、機能の追加は単にGradleの依存関係を追加することを意味し、アプリのモジュールリストを変更する必要がなくなります。その反面、ロードされるモジュールのリストが1か所に明記されなくなるというトレードオフがあります。明示的にしたい場合は、代わりに `@KoinApplication(modules = [...])` にモジュールを列挙してください。

`@Configuration` はラベルを受け取ることができるため、環境やフレーバー（flavor）ごとに異なるモジュールをロードできます。詳細なルールは [Configuration labels](/docs/reference/koin-core/starting-koin#configuration-labels) にあります。

`@Configuration` はアノテーション専用であり、型指定されたスタートアップ（`startKoin<MyApp>()`）を伴う `@KoinApplication` が必要です。

## ロード順序とオーバーライド {id="load-order-and-overrides"}

ロードされた2つのモジュールが同じ型を宣言している場合、最後にロードされたモジュールが優先されます。DSLのスタートブロックでは、これは `modules(...)` の順序になります。

```kotlin
startKoin {
    modules(productionModule, debugModule) // debugModule の ApiService が優先される
}
```

`@KoinApplication` を使用する場合、Compiler Plugin は次の順序でモジュールリストを構築します。

1. コードおよび依存関係から検出された `@Configuration` モジュール。
2. `@KoinApplication(modules = [...])` にリストされているモジュール（宣言順）。

そのため、アプリのモジュールはライブラリのデフォルトをオーバーライドします。

```kotlin
// ライブラリ内
@Module
@Configuration
class CoreModule {
    @Singleton
    fun feature(): Feature = DefaultFeature()
}

// アプリ内
@Module
class AppModule {
    @Singleton
    fun feature(): Feature = AppFeature()
}

@KoinApplication(modules = [AppModule::class])
class MyApp // get<Feature>() は AppFeature を返す
```

明示的なリスト内では、`modules = [A::class, B::class, C::class]` は A、B、C の順にロードされ、各モジュールの `includes` はそのモジュールと一緒にグループ化されたままになります。明示的にリストされていると同時に `@Configuration` によっても検出されるモジュールは、明示的なリスト内の位置で1回だけロードされます。複数の `@Configuration` モジュール間の順序を制御したい場合は、それらを明示的にリストしてください。

意図しないオーバーライドが発生した場合に起動時に失敗させるには、`allowOverride(false)` を使用します。単一の定義をオーバーライドする際のルールについては、[Overriding a definition](/docs/reference/koin-core/definitions#overriding-a-definition) を参照してください。

## Eager モジュール {id="eager-modules"}

モジュール全体をマークして、Koinの起動時にそのすべての `single` 定義を生成するようにできます。

**Compiler Plugin DSL**
```kotlin
val coreModule = module(createdAtStart = true) {
    single<ConfigManager>()
    single<CrashReporter>()
}
```

**Annotations**
```kotlin
@Module(createdAtStart = true)
@ComponentScan("com.myapp.core")
class CoreModule
```

**Constructor / Classic DSL**
```kotlin
val coreModule = module(createdAtStart = true) {
    singleOf(::ConfigManager)
    singleOf(::CrashReporter)
}
```

先行生成される各定義は起動時間を増加させます。定義ごとのフラグとその影響については、[Eager creation](/docs/reference/koin-core/definitions#eager-creation) を参照してください。

## パラメータ化されたモジュール {id="parameterized-modules"}

DSLモジュールは値であるため、関数が引数からモジュールを構築できます。

**Compiler Plugin DSL**
```kotlin
fun loggingModule(debug: Boolean) = module {
    if (debug) {
        single<DebugLogger>() bind Logger::class
    } else {
        single<ReleaseLogger>() bind Logger::class
    }
}

startKoin {
    modules(loggingModule(debug = BuildConfig.DEBUG))
}
```

**Annotations**
`@Module` クラスは引数を取ることができません。このような場合はDSLモジュールを使用するか、[configuration labels](/docs/reference/koin-core/starting-koin#configuration-labels) で選択されるバリアントごとに1つの `@Module` を用意してください。

**Constructor / Classic DSL**
```kotlin
fun loggingModule(debug: Boolean) = module {
    single<Logger> {
        if (debug) DebugLogger() else ReleaseLogger()
    }
}

startKoin {
    modules(loggingModule(debug = BuildConfig.DEBUG))
}
```

同じ考え方で実装の切り替えも可能です。`repositoryModule` は固定したまま、その横でそれぞれ `Datasource` を宣言する `localDatasourceModule` または `remoteDatasourceModule` のいずれかをロードします。条件付きモジュールリストはランタイム時に解決されるため、Compiler Plugin はビルド時にすべての組み合わせを検証することはできません。

## 関連情報 {id="related"}

- [Definitions](/docs/reference/koin-core/definitions): モジュールの中身について。
- [Starting Koin](/docs/reference/koin-core/starting-koin): モジュールのロード、型指定されたスタートアップ、および configuration labels（設定ラベル）。
- [Lazy Modules](/docs/reference/koin-core/lazy-modules): バックグラウンドでのモジュールのロード。
- [KMP Shared Modules](/docs/reference/koin-core/kmp-shared-modules): プラットフォーム間でのモジュールの共有。
- [Multi-Module Apps](/docs/reference/koin-android/multi-module): AndroidにおけるGradleモジュールをまたいだモジュールの整理。
- [Annotations Reference](/docs/reference/koin-annotations/annotations-inventory): `@Module`、`@ComponentScan`、および `@Configuration` のすべてのパラメータ。