---
title: アノテーションリファレンス
---

# アノテーションリファレンス

このページでは、すべてのKoinアノテーションについて、所属パッケージ、付与可能な場所、パラメータ、および使用例を網羅しています。各項目には、その概念を説明するページへのリンクが含まれています。アノテーションのセットアップ方法については[Compiler Plugin Setup](/docs/setup/compiler-plugin)を、DSLとの比較については[Choosing your style](/docs/intro/choosing-your-style)を参照してください。

これらのアノテーションは `io.insert-koin:koin-annotations` アーティファクト（Koinと同じバージョン）から提供されます。Koin Compiler Pluginはビルド時にこれらを読み取り、定義を生成します。ほとんどのアノテーションは `org.koin.core.annotation` にあり、Android専用のものは `org.koin.android.annotation` に配置されています。

## 早見表 {id="at-a-glance"}

| アノテーション | パッケージ | 宣言内容 |
|------------|---------|----------|
| [`@Singleton` / `@Single`](#singleton--single) | `org.koin.core.annotation` | `single` 定義 |
| [`@Factory`](#factory) | `org.koin.core.annotation` | `factory` 定義 |
| [`@Scoped`](#scoped) | `org.koin.core.annotation` | `scoped` 定義 |
| [`@KoinViewModel`](#koinviewmodel) | `org.koin.core.annotation` | `viewModel` 定義 |
| [`@KoinWorker`](#koinworker) | `org.koin.android.annotation` | WorkManager の `worker` 定義 |
| [`@Scope`](#scope) | `org.koin.core.annotation` | 定義が属するスコープ |
| [`@ViewModelScope`](#viewmodelscope) | `org.koin.core.annotation` | ViewModel スコープ内の定義 |
| [`@ActivityScope`](#activityscope) | `org.koin.android.annotation` | Activity スコープ内の定義 |
| [`@ActivityRetainedScope`](#activityretainedscope) | `org.koin.android.annotation` | 保持される（retained）Activity スコープ内の定義 |
| [`@FragmentScope`](#fragmentscope) | `org.koin.android.annotation` | Fragment スコープ内の定義 |
| [`@ScopeId`](#scopeid) | `org.koin.core.annotation` | 指定されたスコープから解決されるパラメータ |
| [`@Named`](#named) | `org.koin.core.annotation` | 文字列クオリファイア |
| [`@Qualifier`](#qualifier) | `org.koin.core.annotation` | 型または文字列クオリファイア |
| [`@InjectedParam`](#injectedparam) | `org.koin.core.annotation` | 呼び出し元から渡されるパラメータ |
| [`@Property`](#property) | `org.koin.core.annotation` | Koin プロパティから読み取られるパラメータ |
| [`@PropertyValue`](#propertyvalue) | `org.koin.core.annotation` | プロパティのデフォルト値 |
| [`@Provided`](#provided) | `org.koin.core.annotation` | チェック対象グラフの外部から提供される型 |
| [`@Module`](#module) | `org.koin.core.annotation` | モジュールクラス |
| [`@ComponentScan`](#componentscan) | `org.koin.core.annotation` | 定義をスキャンするパッケージ |
| [`@Configuration`](#configuration) | `org.koin.core.annotation` | モジュールの構成ラベル |
| [`@KoinApplication`](#koinapplication) | `org.koin.core.annotation` | アプリケーションのエントリポイント |
| [`@Monitor`](#monitor) | `org.koin.core.annotation` | Kotzilla SDK によってトレースされる関数 |

## 定義（Definitions） {id="definitions"}

定義アノテーションは、クラス（Koinがそのコンストラクタを呼び出します）または関数（Koinがトップレベルまたは `@Module` クラス内のその関数を呼び出します）に付与します。コンストラクタおよび関数のパラメータはコンテナから解決されます。各パラメータ型の解決方法については、[Definitions](/docs/reference/koin-core/definitions#constructor-parameters)を参照してください。

`binds` が空の場合、定義はそのクラス自身およびそのすべてのスーパータイプにバインドされます。特定の型のみにバインドしたい場合は、`binds` に型をリストします。

### @Singleton / @Single {id="singleton-single"}

ターゲット: `CLASS`, `FUNCTION`

| パラメータ | 型 | デフォルト値 | 説明 |
|-----------|------|---------|-------------|
| `binds` | `Array<KClass<*>>` | `[]` | バインドする型。空の場合はすべてのスーパータイプをバインドします |
| `createdAtStart` | `Boolean` | `false` | Koin起動時にインスタンスを生成します |

```kotlin
@Singleton(binds = [UserRepository::class])
class UserRepositoryImpl(private val api: ApiService) : UserRepository
```

`@Singleton` と `@Single` は等価です。JSR-330 の名称である `@Singleton` の使用が推奨されます。コンテナのライフタイム中に1つのインスタンスのみが保持されます。概念については [Definitions](/docs/reference/koin-core/definitions) を参照してください。

### @Factory {id="factory"}

ターゲット: `CLASS`, `FUNCTION`

| パラメータ | 型 | デフォルト値 | 説明 |
|-----------|------|---------|-------------|
| `binds` | `Array<KClass<*>>` | `[]` | バインドする型。空の場合はすべてのスーパータイプをバインドします |

```kotlin
@Factory
class UserPresenter(private val repository: UserRepository)
```

リクエストごとに新しいインスタンスが作成されます。概念については [Definitions](/docs/reference/koin-core/definitions) を参照してください。

### @Scoped {id="scoped"}

ターゲット: `CLASS`, `FUNCTION`

| パラメータ | 型 | デフォルト値 | 説明 |
|-----------|------|---------|-------------|
| `binds` | `Array<KClass<*>>` | `[]` | バインドする型。空の場合はすべてのスーパータイプをバインドします |

```kotlin
@Scope(UserSession::class)
@Scoped
class SessionCache(private val repository: UserRepository)
```

スコープごとに1つのインスタンスが作成され、そのスコープが閉じられると解放されます。`@Scope` またはスコープアーキタイプ（`@ViewModelScope`、`@ActivityScope` など）と一緒に使用します。概念については [Scopes](/docs/reference/koin-core/scopes) を参照してください。

### @KoinViewModel {id="koinviewmodel"}

ターゲット: `CLASS`, `FUNCTION`

| パラメータ | 型 | デフォルト値 | 説明 |
|-----------|------|---------|-------------|
| `binds` | `Array<KClass<*>>` | `[]` | バインドする型。空の場合はすべてのスーパータイプをバインドします |

```kotlin
@KoinViewModel
class UserViewModel(private val repository: UserRepository) : ViewModel()
```

Android および Compose Multiplatform ターゲットで動作します。クラスパスに `io.insert-koin:koin-core-viewmodel` が必要です（存在しない場合、ビルドは `KOIN-A001` で失敗します）。概念については [ViewModel](/docs/reference/koin-core/viewmodel) を参照してください。

:::note
Compiler Plugin では、`@KoinViewModel` は `org.koin.core.annotation` に配置されています。KSPプロセッサでは `org.koin.android.annotation.KoinViewModel` が使用されていたため、移行時にはインポートを更新してください（[Migrating from KSP](/docs/migration/from-ksp-to-compiler-plugin) を参照）。
:::

### @KoinWorker {id="koinworker"}

パッケージ: `org.koin.android.annotation`（Android のみ）。ターゲット: `CLASS`, `FUNCTION`

| パラメータ | 型 | デフォルト値 | 説明 |
|-----------|------|---------|-------------|
| `binds` | `Array<KClass<*>>` | `[]` | バインドする型 |

```kotlin
@KoinWorker
class SyncWorker(
    context: Context,
    params: WorkerParameters,
    private val repository: UserRepository,
) : CoroutineWorker(context, params)
```

`io.insert-koin:koin-android-workmanager` が必要です（存在しない場合、ビルドは `KOIN-A002` で失敗します）。概念については [WorkManager](/docs/reference/koin-android/workmanager) を参照してください。

## スコープ（Scopes） {id="scopes"}

### @Scope {id="scope"}

ターゲット: `CLASS`, `FUNCTION`

| パラメータ | 型 | デフォルト値 | 説明 |
|-----------|------|---------|-------------|
| `value` | `KClass<*>` | `Unit::class` | スコープの型 |
| `name` | `String` | `""` | 型の代わりに使用するスコープ名 |

```kotlin
@Scope(UserSession::class)
class SessionCache(private val repository: UserRepository)

@Scope(name = "checkout")
class CheckoutState
```

定義を指定されたスコープに配置します。単体で使用した場合、`@Scope` は `scoped` 定義を宣言します。別の種類の定義を選択する場合や `binds` を設定する場合は、`@Scoped`、`@Factory`、または `@KoinViewModel` を追加してください。概念については [Scopes](/docs/reference/koin-core/scopes) を参照してください。

### @ViewModelScope {id="viewmodelscope"}

ターゲット: `CLASS`, `FUNCTION`。パラメータなし。

```kotlin
@ViewModelScope
class UserSessionCache(private val repository: UserRepository)
```

ViewModel のスコープ内に scoped 定義を宣言します。ViewModel と共に作成され、ViewModel が破棄（クリア）されるときに閉じられます。概念については [Scopes](/docs/reference/koin-core/scopes) を参照してください。

### @ActivityScope {id="activityscope"}

パッケージ: `org.koin.android.annotation`（Android のみ）。ターゲット: `CLASS`, `FUNCTION`。パラメータなし。

```kotlin
@ActivityScope
class ScreenTracker(private val analytics: Analytics)
```

Activity スコープ内に scoped 定義を宣言します。Activity はそのスコープを提供する必要があります（[Android Scopes](/docs/reference/koin-android/scope) を参照）。

### @ActivityRetainedScope {id="activityretainedscope"}

パッケージ: `org.koin.android.annotation`（Android のみ）。ターゲット: `CLASS`, `FUNCTION`。パラメータなし。

```kotlin
@ActivityRetainedScope
class FormState
```

構成変更（Configuration Changes）後も維持される、保持された Activity スコープ内に scoped 定義を宣言します。[Android Scopes](/docs/reference/koin-android/scope) を参照してください。

### @FragmentScope {id="fragmentscope"}

パッケージ: `org.koin.android.annotation`（Android のみ）。ターゲット: `CLASS`, `FUNCTION`。パラメータなし。

```kotlin
@FragmentScope
class ListAdapterFactory
```

Fragment スコープ内に scoped 定義を宣言します。[Android Scopes](/docs/reference/koin-android/scope) を参照してください。

### @ScopeId {id="scopeid"}

ターゲット: `VALUE_PARAMETER`

| パラメータ | 型 | デフォルト値 | 説明 |
|-----------|------|---------|-------------|
| `value` | `KClass<*>` | `Unit::class` | スコープの型。スコープIDはクラスの完全修飾名になります |
| `name` | `String` | `""` | スコープID |

```kotlin
@Factory
class ProfileService(@ScopeId(name = "user_session") val session: UserSession)
```

現在のスコープではなく、該当するIDを持つスコープからパラメータを解決します（`getScope("user_session").get()` として生成されます）。スコープは実行時にしか存在しないため、コンパイル時安全性チェックの対象外となります。概念については [Scopes](/docs/reference/koin-core/scopes) を参照してください。

## クオリファイア（Qualifiers） {id="qualifiers"}

### @Named {id="named"}

ターゲット: `CLASS`, `FUNCTION`, `VALUE_PARAMETER`

| パラメータ | 型 | デフォルト値 | 説明 |
|-----------|------|---------|-------------|
| `value` | `String` | `""` | 文字列クオリファイア |
| `type` | `KClass<*>` | `Unit::class` | 型クオリファイア。Compiler Plugin では代わりに `@Qualifier(Type::class)` を使用してください |

```kotlin
@Singleton
@Named("local")
class LocalDatabase : Database

@Singleton
class UserRepository(@Named("local") private val database: Database)
```

定義とパラメータに同じ文字列を付けることで、それらが関連付けられます。`jakarta.inject.Named` および `javax.inject.Named` も同様に解釈されます。概念については [Qualifiers](/docs/reference/koin-core/qualifiers) を参照してください。

### @Qualifier {id="qualifier"}

ターゲット: `CLASS`, `FUNCTION`, `VALUE_PARAMETER`

| パラメータ | 型 | デフォルト値 | 説明 |
|-----------|------|---------|-------------|
| `value` | `KClass<*>` | `Unit::class` | 型クオリファイア |
| `name` | `String` | `""` | 文字列クオリファイア |

```kotlin
@Singleton
@Qualifier(Remote::class)
class RemoteDataSource : DataSource

@Singleton
class UserRepository(@Qualifier(Remote::class) private val source: DataSource)
```

`@Qualifier` は、カスタムクオリファイアアノテーションをマークするためにも使用できます。`@Qualifier` または `@Named`（あるいは `jakarta.inject.Qualifier`、`javax.inject.Qualifier`）が付与されたアノテーションクラスは、すべてクオリファイアになります。

```kotlin
@Qualifier
annotation class IoDispatcher

@Singleton
@IoDispatcher
fun ioDispatcher(): CoroutineDispatcher = Dispatchers.IO
```

引数のないカスタムクオリファイアは、アノテーションクラスに対する型クオリファイアとなります。文字列またはenum引数を持つ場合（`@Dispatcher(AppDispatchers.IO)` など）、その引数の値がクオリファイアとなります。概念については [Qualifiers](/docs/reference/koin-core/qualifiers) を参照してください。

## パラメータ（Parameters） {id="parameters"}

### @InjectedParam {id="injectedparam"}

ターゲット: `VALUE_PARAMETER`。パラメータなし。

```kotlin
@Factory
class UserPresenter(@InjectedParam val userId: String, private val repository: UserRepository)

// 呼び出し側
val presenter: UserPresenter = get { parametersOf("user-42") }
```

値はコンテナからではなく、呼び出し元の `parametersOf(...)` から渡されます。コンパイル時安全性チェックにより、呼び出し側が正しい個数と型の値を渡しているかが検証されます（`KOIN-D005`、`KOIN-D006`）。概念については [Injected Parameters](/docs/reference/koin-core/injection-parameters) を参照してください。

### @Property {id="property"}

ターゲット: `VALUE_PARAMETER`

| パラメータ | 型 | デフォルト値 | 説明 |
|-----------|------|---------|-------------|
| `value` | `String` | 必須 | プロパティキー |

```kotlin
@Factory
class ApiClient(@Property("api_url") val url: String)
```

`getProperty("api_url")` を使用してパラメータを解決します。同じキーを持つ `@PropertyValue` が存在する場合、それがフォールバック値となります。存在しない場合、ビルド時に警告 `KOIN-P001` が表示され、起動時にプロパティを設定する必要があります。概念については [Properties](/docs/reference/koin-core/starting-koin#properties) を参照してください。

### @PropertyValue {id="propertyvalue"}

ターゲット: `FIELD`

| パラメータ | 型 | デフォルト値 | 説明 |
|-----------|------|---------|-------------|
| `value` | `String` | 必須 | プロパティキー |

```kotlin
@PropertyValue("api_url")
val defaultApiUrl = "https://api.example.com"

@Factory
class ApiClient(@Property("api_url") val url: String)
```

プロパティが設定されていない場合に使用されるデフォルト値を宣言します（`getProperty("api_url", defaultApiUrl)` として生成されます）。

### @Provided {id="provided"}

ターゲット: `CLASS`, `FUNCTION`, `VALUE_PARAMETER`。パラメータなし。

```kotlin
@Singleton
class AnalyticsService(@Provided val firebase: FirebaseAnalytics)
```

コンパイラプラグインが見通せる宣言が存在しない場合でも、その型が実行時に利用可能であることをコンパイル時安全性チェックに伝えます（プラットフォームオブジェクト、SDK、後からロードされるモジュールなど）。クラスに付与した場合はその型のすべての使用箇所のチェックがスキップされ、パラメータに付与した場合はそのパラメータのみがスキップされます。実行時の解決ロジックに変更はありません。一般的な Android の型（`Context`、`Activity`、`Fragment`、`SavedStateHandle`、`WorkerParameters` など）には付与する必要はありません。概念については [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety#external-types-provided) を参照してください。

## モジュールとアプリケーション（Modules and application） {id="modules-and-application"}

### @Module {id="module"}

ターゲット: `CLASS`

| パラメータ | 型 | デフォルト値 | 説明 |
|-----------|------|---------|-------------|
| `includes` | `Array<KClass<*>>` | `[]` | インクルードする他の `@Module` クラス |
| `createdAtStart` | `Boolean` | `false` | Koin起動時にモジュールの `single` 定義を生成します |

```kotlin
@Module(includes = [NetworkModule::class])
class DataModule {

    @Singleton
    fun database(context: Context): AppDatabase =
        Room.databaseBuilder(context, AppDatabase::class.java, "app-db").build()
}
```

定義をグループ化します。クラス内のアノテーション付き関数に加え、`@ComponentScan` によって検出されたアノテーション付きクラスが含まれます。概念については [Modules](/docs/reference/koin-core/modules) を参照してください。

### @ComponentScan {id="componentscan"}

ターゲット: `CLASS`, `FIELD`

| パラメータ | 型 | デフォルト値 | 説明 |
|-----------|------|---------|-------------|
| `value` | `vararg String` | 空 | スキャンするパッケージ。空の場合はアノテーション付きクラスのパッケージをスキャンします |

```kotlin
@Module
@ComponentScan("com.myapp.data", "com.myapp.domain")
class AppModule
```

指定されたパッケージおよびそのサブパッケージ内のすべてのアノテーション付きクラスとトップレベル関数を、Gradleモジュールを横断してモジュールに追加します。概念については [Modules](/docs/reference/koin-core/modules) を参照してください。

:::note
Compiler Plugin はパッケージ名とそのサブパッケージにマッチします。KSPプロセッサの glob パターン（`com.example.**`、`com.*.service`）はサポートされていないため、代わりにパッケージを明示的にリストしてください。
:::

### @Configuration {id="configuration"}

ターゲット: `CLASS`, `FIELD`

| パラメータ | 型 | デフォルト値 | 説明 |
|-----------|------|---------|-------------|
| `value` | `vararg String` | 空 | 構成ラベル。空の場合は `"default"` を意味します |

```kotlin
@Module
@ComponentScan
@Configuration
class CoreModule            // ラベル "default"

@Module
@Configuration("default", "test")
class FakeDataModule        // ラベル "default" および "test"
```

`@KoinApplication` は、自身の構成ラベルのいずれかを持つすべてのモジュール（他の Gradle モジュールからのモジュールを含む）を、明示的にリストすることなく読み込みます。`@Configuration("default")` は `@Configuration` と同等です。概念については [Modules](/docs/reference/koin-core/modules) を参照してください。

### @KoinApplication {id="koinapplication"}

ターゲット: `CLASS`

| パラメータ | 型 | デフォルト値 | 説明 |
|-----------|------|---------|-------------|
| `configurations` | `Array<String>` | `[]` | 読み込む構成ラベル。空の場合は `"default"` を読み込みます |
| `modules` | `Array<KClass<*>>` | `[Unit::class]`（なし） | 追加で読み込む `@Module` クラス |

```kotlin
@KoinApplication(modules = [AppModule::class])
object MyApp

fun main() {
    startKoin<MyApp> {
        printLogger()
    }
}
```

エントリポイントをマークします。`startKoin<MyApp>()`、`koinApplication<MyApp>()`、または `koinConfiguration<MyApp>()`（`org.koin.plugin.module.dsl` パッケージ）を使用して開始します。ここで、コンパイル時安全性チェックによってグラフ全体が検証されます。`@Configuration` によるモジュールが最初にロードされ、その後に `modules` リストがその順序でロードされるため、上書き（オーバーライド）が発生した場合は明示的なリストが優先されます。概念については [Starting Koin](/docs/reference/koin-core/starting-koin) を参照してください。

## モニタリング（Monitoring） {id="monitoring"}

### @Monitor {id="monitor"}

ターゲット: `CLASS`, `FUNCTION`。パラメータなし。

```kotlin
@Monitor
class UserService(private val repository: UserRepository) {
    fun findUser(id: String): User? = repository.findById(id)
}
```

Compiler Plugin は関数の本体（またはクラスのすべての public 関数）を Kotzilla SDK のトレースでラップします。クラスパスに Kotzilla SDK（`io.kotzilla:kotzilla-core`）が必要です。存在しない場合、ビルド時に警告 `KOIN-M001` が表示され、トレースは行われません。セットアップと収集されるデータについては [Monitor](/docs/tooling/monitor) を参照してください。

## JSR-330 アノテーション {id="jsr-330-annotations"}

Compiler Plugin は、`jakarta.inject` および `javax.inject` のアノテーション（`@Singleton`、`@Named`、`@Inject`、`@Qualifier`）も解釈します。[JSR-330](/docs/reference/koin-android/jsr330) を参照してください。

## 削除されたアノテーション {id="removed-annotations"}

`@ExternalDefinition`、`@MetaDefinition`、`@MetaModule`、および `@MetaApplication`（`org.koin.meta.annotations` パッケージ）は、KSPプロセッサが自身の用途のために生成していたものです。Compiler Plugin ではこれらを使用しておらず、手動で記述することもありません。

## 関連情報 {id="related"}

- [Definitions](/docs/reference/koin-core/definitions): 定義の種類、バインディング、コンストラクタパラメータ。
- [Modules](/docs/reference/koin-core/modules): 実践における `@Module`、`@ComponentScan`、および `@Configuration`。
- [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety): プラグインがこれらのアノテーションから検証する内容。
- [Compiler Plugin Options](/docs/reference/koin-annotations/options): プラグインの Gradle オプション。
- [DSL Reference](/docs/reference/koin-core/dsl): 各アノテーションに対応する DSL の同等機能。