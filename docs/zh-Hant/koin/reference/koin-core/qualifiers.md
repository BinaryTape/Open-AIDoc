---
title: 限定詞
---

# 限定詞

限定詞為定義指定一個名稱，讓你可以宣告同一型別的多個定義，並請求特定的某一個定義。本頁面涵蓋字串、型別與列舉限定詞、自訂限定詞註解以及常見錯誤。本文預設你已知曉如何宣告定義（請參閱 [定義](/docs/reference/koin-core/definitions)）。

## 何時需要限定詞 {id="when-you-need-a-qualifier"}

Koin 透過型別來尋找定義。如果兩個定義提供相同的型別，例如兩個 `Database` 執行個體，單純請求 `Database` 將無法在兩者之間做出選擇。限定詞能區分它們。

如果這兩個物件具有不同的職責，請考慮改為賦予它們不同的型別（將 `LocalDatabase` 與 `RemoteDatabase` 分別作為獨立介面）。型別不符會在編譯期被編譯器捕捉，但錯誤的限定詞字串則不會。

## 具名限定詞 {id="named-qualifiers"}

為每個定義宣告一個名稱，然後在注入時請求該名稱：

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

`single<UserRepository>()` 會讀取建構函式參數上的 `@Named`，並解析具限定詞的定義。你也可以直接在 `LocalDatabase` 類別本身加上 `@Named("local")`：這樣 `single<LocalDatabase>()` 就會以該名稱註冊它。`@Named` 註解來自 `koin-annotations` 構件。

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

`@Named` 可用於類別、提供者函式以及參數。

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

`singleOf(::UserRepository)` 僅依型別解析參數，因此無法傳遞限定詞。請如範例所示，改用 `get(named(...))` 撰寫建構函式呼叫。

在定義之外，請將限定詞傳遞給 `get()` 或 `inject()`：

```kotlin
val localDb: Database by inject(named("local"))
val remoteDb: Database = get(named("remote"))
```

相同的限定詞引數存在於每個注入 API 中，例如 Compose 中的 `koinInject(named("local"))`。請參閱 [注入](/docs/reference/koin-core/injection)。

## 型別限定詞 {id="type-qualifiers"}

型別也可以作為限定詞。打錯字會變成編譯錯誤，而且在 IDE 中重命名該型別時會同步更新每一處使用：

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

`@Qualifier(name = "local")` 是字串形式，等同於 `@Named("local")`。

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

在呼叫點：`get<Database>(named<LocalDb>())`。`qualifier<LocalDb>()` 是 `named<LocalDb>()` 的別名。

## 列舉限定詞 {id="enum-qualifiers"}

列舉項目也可以作為限定詞：

```kotlin
enum class DbType { LOCAL, REMOTE }

val dataModule = module {
    single<Database>(named(DbType.LOCAL)) { LocalDatabase() }
    single<Database>(named(DbType.REMOTE)) { RemoteDatabase() }
}

val localDb: Database = get(named(DbType.LOCAL))
```

`named(DbType.LOCAL)` 是由小寫項目名稱構成的字串限定詞。它與 `named("local")` 是相同的限定詞。

## 自訂限定詞註解 {id="custom-qualifier-annotations"}

透過註解，你可以建立自己的限定詞註解。將其標記為 `@Qualifier`（或 `@Named`），然後像使用 `@Named` 一樣使用它：

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

不帶參數的註解會成為該註解類別的型別限定詞。在程式碼中，可以使用 `get<String>(named<BaseUrl>())` 來取得它。

自訂限定詞可以接受參數，從而透過單一註解定義一系列限定詞：

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

參數值會成為限定詞：

- 字串參數：`@ApiName("users")` 是字串限定詞 `"users"`，等同於 `@Named("users")`。
- 列舉參數：`@Dispatcher(AppDispatchers.IO)` 是由列舉的完整類別名稱與項目所組成的字串限定詞，即 `named("com.myapp.AppDispatchers.IO")`。它與使用小寫項目名稱的 `named(AppDispatchers.IO)` 並不相同。

編譯器外掛程式會在建置期檢查自訂限定詞：若提供者與注入點的限定詞不一致，將會產生建置錯誤。自訂限定詞註解也適用於 Compiler Plugin DSL，可用於建構函式參數以及傳遞給 `single<T>()` 的類別。

自訂限定詞註解無法在 Constructor 或 Classic DSL 中使用。在這些情況下請改用 `named()`。

## JSR-330 限定詞 {id="jsr-330-qualifiers"}

`jakarta.inject.Named`、`javax.inject.Named` 以及標記有 `jakarta.inject.Qualifier` 的註解，其運作方式與 Koin 中的等效功能相同。請參閱 [JSR-330 支援](/docs/reference/koin-android/jsr330)。

## 常見錯誤 {id="common-mistakes"}

- 注入點遺漏限定詞：當每個 `Database` 定義都有限定詞時，`get<Database>()` 將會失敗並擲出 `NoDefinitionFoundException`。帶限定詞的定義只能透過該限定詞找到。
- 拼寫不一致：`named("encrypted")` 和 `named("encrypted_client")` 是兩個不同的限定詞。請使用型別或列舉限定詞，或者將字串保留在常數中，以避免這種情況。
- 對每個定義都加上限定詞：如果型別本來就不同，限定詞就毫無作用。只有在兩個定義共用相同型別時才使用限定詞。

使用編譯器外掛程式時，前兩個錯誤會被視為建置錯誤。當具有限定詞的參數找不到相符項，但存在相同型別的未限定定義時，錯誤訊息會指向該定義。

## 相關內容 {id="related"}

- [定義](/docs/reference/koin-core/definitions)：宣告定義並將其繫結至介面。
- [注入](/docs/reference/koin-core/injection)：將限定詞傳遞給 `get()` 和 `inject()`。
- [注入參數](/docs/reference/koin-core/injection-parameters)：在解析時傳遞值，而不是宣告變體。
- [編譯期安全性](/docs/reference/koin-compiler/compile-safety)：編譯器外掛程式針對限定詞進行的檢查。
- [註解參考](/docs/reference/koin-annotations/annotations-inventory)：`@Named` 與 `@Qualifier` 的參數。