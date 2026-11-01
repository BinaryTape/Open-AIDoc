---
title: クオリファイア
---

# クオリファイア

クオリファイア（qualifier）は定義に名前を付与するため、同じ型の定義を複数宣言し、特定の定義を要求できるようにします。このページでは、文字列、型、enum によるクオリファイア、カスタムクオリファイアアノテーション、およびよくある間違いについて説明します。定義の宣言方法を理解していることを前提としています（[Definitions](/docs/reference/koin-core/definitions) を参照）。

## クオリファイアが必要になる場合 {id="when-you-need-a-qualifier"}

Koin は型によって定義を検索します。2つの定義が同じ型を提供する場合（例えば2つの `Database` インスタンス）、単に `Database` を要求するだけではどちらか一方を選択できません。クオリファイアによってそれらを区別します。

2つのオブジェクトが異なる役割を持つ場合は、代わりに異なる型を与えること（個別のインターフェースとして `LocalDatabase` と `RemoteDatabase` を作成するなど）を検討してください。型の不一致はコンパイラによって検出されますが、誤ったクオリファイア文字列は検出されません。

## 名前付きクオリファイア {id="named-qualifiers"}

各定義を名前付きで宣言し、インジェクションする場所でその名前を指定して要求します：

**Compiler Plugin DSL**
```kotlin
import org.koin.core.annotation.Named
import org.koin.core.qualifier.named
import org.koin.plugin.module.dsl.*

class UserRepository(
    @Named("local") private val localDb: Database,
    @Named("remote") private val remoteDb: Database,
)

val dataModule = module {
    single<Database>(named("local")) { create(::LocalDatabase) }
    single<Database>(named("remote")) { create(::RemoteDatabase) }
    single<UserRepository>()
}
```

`single<UserRepository>()` はコンストラクタパラメータの `@Named` を読み取り、修飾された定義を解決します。`LocalDatabase` クラス自体に `@Named("local")` を付与することもできます。その場合、`single<LocalDatabase>()` はその名前で登録します。`@Named` アノテーションは `koin-annotations` アーティファクトから提供されます。

**Annotations**
```kotlin
import org.koin.core.annotation.Named
import org.koin.core.annotation.Singleton

@Singleton
@Named("local")
class LocalDatabase : Database

@Singleton
@Named("remote")
class RemoteDatabase : Database

@Singleton
class UserRepository(
    @Named("local") private val localDb: Database,
    @Named("remote") private val remoteDb: Database,
)
```

`@Named` はクラス、プロバイダ関数、パラメータで使用できます。

**Constructor / Classic DSL**
```kotlin
import org.koin.core.qualifier.named

val dataModule = module {
    single<Database>(named("local")) { LocalDatabase() }
    single<Database>(named("remote")) { RemoteDatabase() }
    single {
        UserRepository(
            localDb = get(named("local")),
            remoteDb = get(named("remote")),
        )
    }
}
```

`singleOf(::UserRepository)` は型のみによってパラメータを解決するため、クオリファイアを渡すことができません。上記のように `get(named(...))` を使用してコンストラクタ呼び出しを記述してください。

定義の外部では、`get()` や `inject()` にクオリファイアを渡します：

```kotlin
val localDb: Database by inject(named("local"))
val remoteDb: Database = get(named("remote"))
```

Compose の `koinInject(named("local"))` など、すべてのインジェクション API に同様のクオリファイア引数が存在します。[Injection](/docs/reference/koin-core/injection) を参照してください。

## 型クオリファイア {id="type-qualifiers"}

型をクオリファイアとして使用できます。タイポはコンパイルエラーになり、IDE で型名を変更すれば使用箇所がすべて更新されます：

**Compiler Plugin DSL**
```kotlin
import org.koin.core.annotation.Qualifier

object LocalDb
object RemoteDb

class UserRepository(
    @Qualifier(LocalDb::class) private val localDb: Database,
    @Qualifier(RemoteDb::class) private val remoteDb: Database,
)

val dataModule = module {
    single<Database>(named<LocalDb>()) { create(::LocalDatabase) }
    single<Database>(named<RemoteDb>()) { create(::RemoteDatabase) }
    single<UserRepository>()
}
```

**Annotations**
```kotlin
object LocalDb
object RemoteDb

@Singleton
@Qualifier(LocalDb::class)
class LocalDatabase : Database

@Singleton
@Qualifier(RemoteDb::class)
class RemoteDatabase : Database

@Singleton
class UserRepository(
    @Qualifier(LocalDb::class) private val localDb: Database,
    @Qualifier(RemoteDb::class) private val remoteDb: Database,
)
```

`@Qualifier(name = "local")` は文字列形式であり、`@Named("local")` と同等です。

**Constructor / Classic DSL**
```kotlin
object LocalDb
object RemoteDb

val dataModule = module {
    single<Database>(named<LocalDb>()) { LocalDatabase() }
    single<Database>(named<RemoteDb>()) { RemoteDatabase() }
    single { UserRepository(get(named<LocalDb>()), get(named<RemoteDb>())) }
}
```

呼び出し側では `get<Database>(named<LocalDb>())` とします。`qualifier<LocalDb>()` は `named<LocalDb>()` のエイリアスです。

## Enum クオリファイア {id="enum-qualifiers"}

enum エントリもクオリファイアとして使用できます：

```kotlin
enum class DbType { LOCAL, REMOTE }

val dataModule = module {
    single<Database>(named(DbType.LOCAL)) { LocalDatabase() }
    single<Database>(named(DbType.REMOTE)) { RemoteDatabase() }
}

val localDb: Database = get(named(DbType.LOCAL))
```

`named(DbType.LOCAL)` は、小文字のエントリ名から生成された文字列クオリファイアです。これは `named("local")` と同じクオリファイアになります。

## カスタムクオリファイアアノテーション {id="custom-qualifier-annotations"}

アノテーションを使用すると、独自のクオリファイアアノテーションを作成できます。`@Qualifier`（または `@Named`）でアノテーションを付与し、`@Named` のように使用します：

```kotlin
import org.koin.core.annotation.Qualifier

@Qualifier
annotation class BaseUrl

@Qualifier
annotation class AuthUrl

@Singleton
@BaseUrl
fun baseUrl(): String = "https://api.example.com"

@Singleton
@AuthUrl
fun authUrl(): String = "https://auth.example.com"

@Singleton
class ApiClient(
    @BaseUrl private val baseUrl: String,
    @AuthUrl private val authUrl: String,
)
```

パラメータのないアノテーションは、アノテーションクラスを対象とする型クオリファイアになります。コードから取得する場合は `get<String>(named<BaseUrl>())` を使用します。

カスタムクオリファイアはパラメータを受け取ることができ、1つのアノテーションで一連のクオリファイアを定義できます：

```kotlin
enum class AppDispatchers { Default, IO }

@Qualifier
annotation class Dispatcher(val dispatcher: AppDispatchers)

@Module
class DispatchersModule {

    @Singleton
    @Dispatcher(AppDispatchers.IO)
    fun ioDispatcher(): CoroutineDispatcher = Dispatchers.IO

    @Singleton
    @Dispatcher(AppDispatchers.Default)
    fun defaultDispatcher(): CoroutineDispatcher = Dispatchers.Default

    @Singleton
    fun applicationScope(
        @Dispatcher(AppDispatchers.Default) dispatcher: CoroutineDispatcher,
    ): CoroutineScope = CoroutineScope(SupervisorJob() + dispatcher)
}
```

パラメータの値がクオリファイアになります：

- 文字列パラメータ: `@ApiName("users")` は文字列クオリファイア `"users"` であり、`@Named("users")` と同じです。
- Enum パラメータ: `@Dispatcher(AppDispatchers.IO)` は、enum の完全修飾クラス名とエントリから構成される文字列クオリファイア `named("com.myapp.AppDispatchers.IO")` になります。これは小文字のエントリ名を使用する `named(AppDispatchers.IO)` とは異なります。

Compiler Plugin はビルド時にカスタムクオリファイアを検証します。プロバイダとインジェクションポイントのクオリファイアが異なる場合はビルドエラーになります。カスタムクオリファイアアノテーションは Compiler Plugin DSL でも機能し、コンストラクタパラメータや `single<T>()` に渡されるクラスで使用できます。

カスタムクオリファイアアノテーションは Constructor DSL や Classic DSL では利用できません。それらでは `named()` を使用してください。

## JSR-330 クオリファイア {id="jsr-330-qualifiers"}

`jakarta.inject.Named`、`javax.inject.Named`、および `jakarta.inject.Qualifier` でマークされたアノテーションは、Koin の対応するものと同様に動作します。[JSR-330 Support](/docs/reference/koin-android/jsr330) を参照してください。

## よくある間違い {id="common-mistakes"}

- インジェクションポイントでのクオリファイアの指定漏れ: すべての `Database` 定義にクオリファイアが付与されている場合、`get<Database>()` は `NoDefinitionFoundException` で失敗します。クオリファイアを持つ定義は、そのクオリファイアを指定することによってのみ見つけることができます。
- スペルの不一致: `named("encrypted")` と `named("encrypted_client")` は2つの異なるクオリファイアです。これを防ぐには、型や enum のクオリファイアを使用するか、文字列を定数として保持してください。
- すべての定義へのクオリファイア付与: 型がすでに異なっている場合、クオリファイアを追加してもメリットはありません。2つの定義が同じ型を共有している場合にのみ使用してください。

Compiler Plugin を使用すると、最初の2つの間違いはビルドエラーになります。修飾されたパラメータに一致するものがないものの、同じ型で修飾されていない定義が存在する場合、エラーメッセージでそれが指摘されます。

## 関連情報 {id="related"}

- [Definitions](/docs/reference/koin-core/definitions): 定義を宣言し、インターフェースにバインドする。
- [Injection](/docs/reference/koin-core/injection): `get()` や `inject()` にクオリファイアを渡す。
- [Injected Parameters](/docs/reference/koin-core/injection-parameters): バリアントを宣言する代わりに、解決時に値を渡す。
- [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety): Compiler Plugin がクオリファイアに関してチェックする内容。
- [Annotations Reference](/docs/reference/koin-annotations/annotations-inventory): `@Named` および `@Qualifier` のパラメータ。