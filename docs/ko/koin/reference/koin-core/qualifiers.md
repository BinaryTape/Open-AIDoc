---
title: Qualifiers
---

# 한정자 (Qualifiers)

한정자(Qualifier)는 정의(Definition)에 이름을 부여하여, 동일한 타입의 정의를 여러 개 선언하고 특정한 것을 요청할 수 있도록 해줍니다. 이 페이지에서는 문자열, 타입, enum 한정자, 커스텀 한정자 어노테이션, 그리고 흔히 발생하는 실수를 다룹니다. 이 문서는 독자가 정의 선언 방법을 이미 알고 있다고 가정합니다([정의 (Definitions)](/docs/reference/koin-core/definitions) 참조).

## 한정자가 필요한 경우 {id="when-you-need-a-qualifier"}

Koin은 타입을 기반으로 정의를 찾습니다. 만약 두 개의 `Database` 인스턴스처럼 두 정의가 동일한 타입을 제공한다면, 단순히 `Database`를 요청하는 것만으로는 둘 중 하나를 선택할 수 없습니다. 한정자는 이 둘을 구분해 줍니다.

두 객체가 서로 다른 역할을 수행한다면, 대신 서로 다른 타입을 부여하는 것을 고려해 보세요(각각 자체 인터페이스인 `LocalDatabase`와 `RemoteDatabase`로 분리). 타입 불일치는 컴파일러가 잡아내지만, 잘못된 한정자 문자열은 잡아내지 못합니다.

## 이름 기반 한정자 (Named qualifiers) {id="named-qualifiers"}

각 정의를 이름과 함께 선언한 다음, 주입받는 위치에서 해당 이름을 요청합니다:

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

`single<UserRepository>()`는 생성자 매개변수의 `@Named`를 읽고 한정자가 지정된 정의를 해결합니다. 또한 `LocalDatabase` 클래스 자체에 `@Named("local")`을 추가할 수도 있습니다. 이 경우 `single<LocalDatabase>()`는 해당 이름으로 클래스를 등록합니다. `@Named` 어노테이션은 `koin-annotations` 아티팩트에서 제공됩니다.

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

`@Named`는 클래스, 프로바이더 함수 및 매개변수에 사용할 수 있습니다.

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

`singleOf(::UserRepository)`는 오직 타입으로만 매개변수를 해결하므로 한정자를 전달할 수 없습니다. 코드 예제처럼 `get(named(...))`을 사용하여 생성자 호출을 직접 작성하세요.

정의 외부에서는 `get()` 또는 `inject()`에 한정자를 전달합니다:

```kotlin
val localDb: Database by inject(named("local"))
val remoteDb: Database = get(named("remote"))
```

동일한 한정자 인자가 Compose의 `koinInject(named("local"))`와 같은 모든 주입 API에 존재합니다. 자세한 내용은 [주입 (Injection)](/docs/reference/koin-core/injection)을 참조하세요.

## 타입 한정자 (Type qualifiers) {id="type-qualifiers"}

타입을 한정자로 사용할 수 있습니다. 이 경우 오타는 컴파일 에러가 되며, IDE에서 타입 이름을 변경하면 사용된 모든 곳에 자동으로 업데이트됩니다:

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

`@Qualifier(name = "local")`은 문자열 형태이며, `@Named("local")`과 동일합니다.

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

호출 위치에서는 `get<Database>(named<LocalDb>())`와 같이 사용합니다. `qualifier<LocalDb>()`는 `named<LocalDb>()`의 별칭입니다.

## Enum 한정자 (Enum qualifiers) {id="enum-qualifiers"}

Enum 항목도 한정자가 될 수 있습니다:

```kotlin
enum class DbType { LOCAL, REMOTE }

val dataModule = module {
    single<Database>(named(DbType.LOCAL)) { LocalDatabase() }
    single<Database>(named(DbType.REMOTE)) { RemoteDatabase() }
}

val localDb: Database = get(named(DbType.LOCAL))
```

`named(DbType.LOCAL)`은 소문자로 변환된 항목 이름으로 생성된 문자열 한정자입니다. 이는 `named("local")`과 동일한 한정자입니다.

## 커스텀 한정자 어노테이션 (Custom qualifier annotations) {id="custom-qualifier-annotations"}

어노테이션을 사용할 때 자신만의 한정자 어노테이션을 만들 수 있습니다. `@Qualifier`(또는 `@Named`)를 부여한 후 `@Named`처럼 사용하면 됩니다:

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

매개변수가 없는 어노테이션은 해당 어노테이션 클래스에 대한 타입 한정자가 됩니다. 코드에서는 `get<String>(named<BaseUrl>())`을 통해 이를 가져올 수 있습니다.

커스텀 한정자는 하나의 어노테이션으로 한정자 그룹을 정의할 수 있도록 매개변수를 받을 수 있습니다:

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

매개변수 값이 한정자가 됩니다:

- 문자열 매개변수: `@ApiName("users")`는 문자열 한정자 `"users"`가 되며, 이는 `@Named("users")`와 동일합니다.
- Enum 매개변수: `@Dispatcher(AppDispatchers.IO)`는 enum의 전체 클래스 이름과 항목으로 구성된 문자열 한정자 `named("com.myapp.AppDispatchers.IO")`가 됩니다. 이는 소문자 항목 이름을 사용하는 `named(AppDispatchers.IO)`와 같지 않습니다.

Compiler Plugin은 빌드 시점에 커스텀 한정자를 검사합니다. 프로바이더와 주입 지점의 한정자가 일치하지 않으면 빌드 에러가 발생합니다. 커스텀 한정자 어노테이션은 생성자 매개변수 및 `single<T>()`에 전달되는 클래스에서 Compiler Plugin DSL과 함께 동작합니다.

커스텀 한정자 어노테이션은 Constructor 또는 Classic DSL에서는 사용할 수 없습니다. 해당 환경에서는 `named()`를 사용하세요.

## JSR-330 한정자 {id="jsr-330-qualifiers"}

`jakarta.inject.Named`, `javax.inject.Named` 및 `jakarta.inject.Qualifier`가 지정된 어노테이션은 Koin의 해당 기능들과 동일하게 동작합니다. 자세한 내용은 [JSR-330 지원](/docs/reference/koin-android/jsr330)을 참조하세요.

## 흔히 발생하는 실수 {id="common-mistakes"}

- 주입 지점에서 한정자 누락: 모든 `Database` 정의에 한정자가 지정되어 있을 때 `get<Database>()`를 호출하면 `NoDefinitionFoundException`이 발생합니다. 한정자가 있는 정의는 해당 한정자를 통해서만 찾을 수 있습니다.
- 철자 불일치: `named("encrypted")`와 `named("encrypted_client")`는 서로 다른 한정자입니다. 이를 방지하려면 타입 한정자나 enum 한정자를 사용하거나, 문자열을 상수로 관리하세요.
- 모든 정의에 한정자 적용: 타입이 이미 서로 다르다면 한정자는 아무런 의미가 없습니다. 두 정의가 동일한 타입을 공유하는 경우에만 사용하세요.

Compiler Plugin을 사용하면 처음 두 가지 실수는 빌드 에러로 처리됩니다. 한정자가 지정된 매개변수와 일치하는 대상이 없지만 동일한 타입의 한정되지 않은 정의가 존재하는 경우, 에러 메시지가 해당 정의를 가리켜 알려줍니다.

## 관련 문서 {id="related"}

- [정의 (Definitions)](/docs/reference/koin-core/definitions): 정의 선언 및 인터페이스 바인딩.
- [주입 (Injection)](/docs/reference/koin-core/injection): `get()` 및 `inject()`에 한정자 전달.
- [주입 매개변수 (Injected Parameters)](/docs/reference/koin-core/injection-parameters): 변형(variants)을 선언하는 대신 객체 확인 시점에 값 전달.
- [컴파일 타임 안전성 (Compile-Time Safety)](/docs/reference/koin-compiler/compile-safety): Compiler Plugin이 한정자에 대해 검사하는 항목.
- [어노테이션 레퍼런스 (Annotations Reference)](/docs/reference/koin-annotations/annotations-inventory): `@Named` 및 `@Qualifier`의 매개변수.