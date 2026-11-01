---
title: 定義
---

# 定義

定義（definition）は、ある型をどのように作成し、そのインスタンスをどのくらいの期間保持するかをKoinに伝えます。このページでは、定義の種類、インターフェースのバインディング、コンストラクタパラメータの解決方法、および自身が所有していないクラスの定義について説明します。なお、モジュールとは何かを理解していることを前提としています（[Core Concepts](/docs/intro/core-concepts) を参照）。

コードサンプルは「Compiler Plugin DSL」「Annotations」「Constructor / Classic DSL」の3つのタブで提供されています。ご自身のスタイルを選択してください。この選択はすべてのページに適用されます。どのスタイルを使用すべきか迷った場合は、[Choosing your style](/docs/intro/choosing-your-style) をお読みください。

## 定義の種類 {id="definition-types"}

| 種類 | インスタンス | 主な用途 |
|------|----------|-------------|
| `single` | Koinコンテナの存続期間中保持される単一のインスタンス | リポジトリ、APIクライアント、データベース |
| `factory` | リクエストされるたびに生成される新しいインスタンス | プレゼンター、ユースケース、短命なオブジェクト |
| `scoped` | スコープごとに1つのインスタンス（スコープが閉じられると破棄） | Activity、セッション、リクエストにバインドされるオブジェクト |
| `viewModel` | ViewModelのライフサイクルによって管理 | ViewModel（AndroidおよびCompose Multiplatform） |
| `worker` | WorkManagerによって作成 | Androidの `ListenableWorker` |

定義の宣言方法:

**Compiler Plugin DSL**
```kotlin
import org.koin.dsl.module
import org.koin.plugin.module.dsl.*

val appModule = module {
    single<Database>()
    single<UserRepository>()
    factory<UserPresenter>()
    viewModel<UserViewModel>()
}
```

**Annotations**
```kotlin
@Singleton
class Database

@Singleton
class UserRepository(private val database: Database)

@Factory
class UserPresenter(private val repository: UserRepository)

@KoinViewModel
class UserViewModel(private val repository: UserRepository) : ViewModel()
```

`@Singleton` と `@Single` は同等です。JSR-330の名称である `@Singleton` の使用を推奨します。

**Constructor / Classic DSL**
```kotlin
import org.koin.dsl.module
import org.koin.core.module.dsl.*

val appModule = module {
    singleOf(::Database)
    singleOf(::UserRepository)
    factoryOf(::UserPresenter)
    viewModelOf(::UserViewModel)
}
```

各依存関係に対して `get()` を使用し、コンストラクタ呼び出しを自身で記述することもできます。

```kotlin
val appModule = module {
    single { Database() }
    single { UserRepository(get()) }
    factory { UserPresenter(get()) }
    viewModel { UserViewModel(get()) }
}
```

Compiler Plugin DSLとアノテーションでは、`get()` を記述する必要はありません。[Koin Compiler Plugin](/docs/intro/koin-compiler-plugin) がコンストラクタを読み取り、呼び出しコードを自動生成した上で、ビルド時にすべての依存関係が宣言されているかを検証します。

`single` と `factory` については上記で説明しました。`scoped` にはスコープ宣言が必要です（[Scopes](/docs/reference/koin-core/scopes) を参照）。`viewModel` には専用のページがあります（[ViewModel](/docs/reference/koin-core/viewmodel) を参照）。`worker` については [WorkManager](/docs/reference/koin-android/workmanager) で解説しています。

### SingleかFactoryか？ {id="single-or-factory"}

呼び出し元ごとの状態を持たず、生成コストが高いオブジェクト（データベース、HTTPクライアントなど）には `single` を使用します。各呼び出し元が独自のインスタンスを必要とする場合や、共有してはならない状態をオブジェクトが保持する場合は `factory` を使用します。ファクトリよりは長く、アプリケーション全体よりは短い生存期間が必要なインスタンスには、[スコープ（Scopes）](/docs/reference/koin-core/scopes) が必要です。

## インターフェースのバインディング {id="interface-binding"}

ほとんどの場合、利用側（コンシューマ）は実装ではなくインターフェースに依存します。実装をインターフェースにバインドします。

**Compiler Plugin DSL**
```kotlin
val dataModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class

    // 一度に複数の型を指定
    single<MyServiceImpl>() binds arrayOf(ServiceA::class, ServiceB::class)
}
```

**Annotations**
```kotlin
@Singleton
class UserRepositoryImpl(private val database: Database) : UserRepository
```

バインディングは自動的に行われます。Koinはクラスをそのすべてのスーパータイプにバインドします。一部のスーパータイプのみをバインドしたい場合は、それらをリストで指定します。

```kotlin
@Singleton(binds = [UserRepository::class])
class UserRepositoryImpl(private val database: Database) : UserRepository, Closeable
```

**Constructor / Classic DSL**
```kotlin
val dataModule = module {
    singleOf(::UserRepositoryImpl) bind UserRepository::class

    // またはインターフェースの型を直接宣言
    single<UserRepository> { UserRepositoryImpl(get()) }
}
```

これにより、利用側が `UserRepository` を要求した際に `UserRepositoryImpl` のインスタンスが取得されます。2つの定義が同じ型にバインドされている場合は、それらを区別するために[クォリファイア（Qualifiers）](/docs/reference/koin-core/qualifiers) が必要になります。

## コンストラクタパラメータ {id="constructor-parameters"}

Koinはコンストラクタの各パラメータをコンテナから解決します。パラメータの型によって解決方法が決まります。

| パラメータ | 解決内容 | 詳細 |
|-----------|-------------|--------|
| `repository: UserRepository` | `UserRepository` の定義。存在しない場合は失敗します | |
| `logger: Logger?` | 定義が存在すればその定義、存在しなければ `null` | |
| `heavy: Lazy<HeavyService>` | `heavy.value` への初回アクセス時に生成 | [Injection](/docs/reference/koin-core/injection) |
| `loggers: List<Logger>` | `Logger` にバインドされているすべての定義 | [Advanced Patterns](/docs/reference/koin-core/advanced-patterns#collections-of-dependencies) |
| `@Named("local") db: Database` | そのクォリファイアを持つ定義 | [Qualifiers](/docs/reference/koin-core/qualifiers) |
| `@InjectedParam userId: String` | 解決時に呼び出し元から渡される値 | [Injected Parameters](/docs/reference/koin-core/injection-parameters) |
| `@Property("api_url") url: String` | Koinプロパティ | [Starting Koin](/docs/reference/koin-core/starting-koin#properties) |

Compiler Plugin DSLとアノテーションでは、コンストラクタのシグネチャのみでこれが機能します。

**Compiler Plugin DSL**
```kotlin
class SyncService(
    private val repository: UserRepository,
    private val analytics: Analytics?,
    private val uploader: Lazy<Uploader>,
)

val appModule = module {
    single<SyncService>()
}
```

**Annotations**
```kotlin
@Singleton
class SyncService(
    private val repository: UserRepository,
    private val analytics: Analytics?,
    private val uploader: Lazy<Uploader>,
)
```

**Constructor / Classic DSL**
`singleOf(::SyncService)` はすべてのパラメータを `get()` で解決します。nullable、lazy、またはリスト型のパラメータの場合は、対応する関数を使用して呼び出しを自身で記述します。

```kotlin
val appModule = module {
    single {
        SyncService(
            repository = get(),
            analytics = getOrNull(),
            uploader = inject(),
        )
    }
}
```

`getAll()` は `List` を返し、`getProperty("key")` はプロパティを読み取り、`params.get()` は注入されたパラメータを読み取ります。

## 自身が所有していないクラス {id="classes-you-don-t-own"}

ライブラリのクラス（Room、Retrofit、OkHttpなど）にはアノテーションを付与できず、多くはビルダーから生成されます。これらは、Koinがパラメータを解決する関数を使用して宣言します。

**Compiler Plugin DSL**
```kotlin
import org.koin.plugin.module.dsl.create

fun database(context: Context): AppDatabase =
    Room.databaseBuilder(context, AppDatabase::class.java, "app-db").build()

fun topicDao(db: AppDatabase): TopicDao = db.topicDao()

val databaseModule = module {
    single { create(::database) }
    single { create(::topicDao) }
}
```

`create(::function)` はコンストラクタと同様に関数のパラメータを解決し、同じコンパイル時チェックが行われます。関数やそのパラメータに付与されたクォリファイアのアノテーションも同様に機能します。

**Annotations**
トップレベル関数にアノテーションを付与します。`@ComponentScan` はクラスと同様にそれを見つけ出します。

```kotlin
@Singleton
fun database(context: Context): AppDatabase =
    Room.databaseBuilder(context, AppDatabase::class.java, "app-db").build()

@Singleton
fun topicDao(db: AppDatabase): TopicDao = db.topicDao()
```

または、プロバイダ関数を `@Module` クラスにグループ化します。

```kotlin
@Module
class DatabaseModule {

    @Singleton
    fun database(context: Context): AppDatabase =
        Room.databaseBuilder(context, AppDatabase::class.java, "app-db").build()

    @Singleton
    fun topicDao(db: AppDatabase): TopicDao = db.topicDao()
}
```

**Constructor / Classic DSL**
```kotlin
val databaseModule = module {
    single {
        Room.databaseBuilder(androidContext(), AppDatabase::class.java, "app-db").build()
    }
    single { get<AppDatabase>().topicDao() }
}
```

AndroidでのRetrofit、Room、シリアライゼーションの完全なセットアップについては、[Android Library Integration](/docs/reference/koin-android/binding-patterns) を参照してください。

## 即時生成（Eager creation） {id="eager-creation"}

Koinは通常、最初に要求されたタイミングで `single` を生成します。代わりにKoinの起動時に生成したい場合は、`createdAtStart` を指定します。

**Compiler Plugin DSL**
```kotlin
val appModule = module {
    single<ConfigManager>() withOptions {
        createdAtStart()
    }
}
```

**Annotations**
```kotlin
@Singleton(createdAtStart = true)
class ConfigManager
```

**Constructor / Classic DSL**
```kotlin
val appModule = module {
    single(createdAtStart = true) { ConfigManager() }
}
```

即時生成は、Koinを起動したスレッド上で実行されます。Androidではこれは `Application.onCreate()` 中のメインスレッドとなるため、即時生成される定義が増えるごとにアプリの起動時間に影響します。最初の画面が表示される前に必ず存在していなければならないオブジェクトに限定して使用してください。起動時の負荷を分散させる方法については、[Lazy Modules](/docs/reference/koin-core/lazy-modules) を参照してください。

## 解放時のコールバック {id="release-callback"}

`onClose` は、インスタンスが解放されたときに実行されます。`single` の場合はKoin停止時、`scoped` の場合はそのスコープが閉じられた時です。

**Compiler Plugin DSL**
```kotlin
val appModule = module {
    single<Database>() onClose { it?.close() }
}
```

**Annotations**
アノテーションには `onClose` パラメータがありません。この定義はDSLモジュールで宣言してください。

**Constructor / Classic DSL**
```kotlin
val appModule = module {
    single { Database() } onClose { it?.close() }
}
```

`onClose` は `factory` に対して呼び出されることはありません。Koinはファクトリインスタンスを保持しないためです。

## 定義のオーバーライド {id="overriding-a-definition"}

2つのモジュールが同じ型を宣言している場合、最後にロードされたモジュールが優先されます。

```kotlin
val prodModule = module {
    single<ApiService> { ProductionApi() }
}

val testModule = module {
    single<ApiService> { FakeApi() }
}

startKoin {
    modules(prodModule, testModule) // ApiService は FakeApi に解決される
}
```

これはテストでは便利ですが、意図せず発生した場合はバグの原因になります。オーバーライドを明示的にするには、グローバルでオーバーライドを無効化し、許可したい定義に明示的にマークを付けます。

```kotlin
val testModule = module {
    single<ApiService> { FakeApi() }.override()
}

startKoin {
    allowOverride(false)
    modules(prodModule, testModule)
}
```

`allowOverride(false)` を設定すると、マークされていない重複は起動時に失敗（エラー）となります。

## 関連情報 {id="related"}

- [Modules](/docs/reference/koin-core/modules): 定義のグループ化と `includes()` によるモジュールの合成。
- [Qualifiers](/docs/reference/koin-core/qualifiers): 同じ型の複数の定義。
- [Injection](/docs/reference/koin-core/injection): コンストラクタ外部でのインスタンス取得。
- [Scopes](/docs/reference/koin-core/scopes): ライフサイクルにバインドされたインスタンス。
- [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety): Compiler Plugin が定義内でチェックする内容。
- [DSL Reference](/docs/reference/koin-core/dsl) および [Annotations Reference](/docs/reference/koin-annotations/annotations-inventory): すべてのキーワードとアノテーションの一覧。