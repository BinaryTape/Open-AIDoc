---
title: 多模块应用
---

# 多模块应用

本页面介绍了如何在拆分为 Gradle 模块（`:app`、`:feature:*`、`:core:*）的 Android 应用中组织 Koin。内容涵盖每个 Koin 模块的位置、应用如何加载它们、功能之间如何共享类型以及动态功能模块。模块组合（`includes()`、公开与私有模块、`@Configuration`）已在[模块](/docs/reference/koin-core/modules)中进行了说明。

## 项目布局 {id="project-layout"}

```
:app                  Application 类、startKoin、appModule
:feature:login        LoginViewModel、LoginUseCase、loginModule
:feature:profile      ProfileViewModel、profileModule
:core:data            仓库、Retrofit、Room、dataModule
:core:domain          功能间共享的接口 (UserRepository)
```

每个 Gradle 模块都会为其自身的类声明 Koin 模块。这样类就可以对其所在的 Gradle 模块保持 `internal`：仅 Koin 模块是公开的。`:app` 模块是唯一知晓所有功能的模块，因此它也是启动 Koin 的地方。

## 声明并加载功能模块 {id="declaring-and-loading-feature-modules"}

**编译器插件 DSL**
```kotlin
// Gradle 模块 ":feature:login"
internal class LoginUseCase(private val auth: AuthService)
internal class LoginViewModel(private val login: LoginUseCase) : ViewModel()

val loginModule = module {
    factory<LoginUseCase>()
    viewModel<LoginViewModel>()
}
```

```kotlin
// Gradle 模块 ":app"
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

**注解**
```kotlin
// Gradle 模块 ":feature:login"
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
// Gradle 模块 ":app"
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

`startKoin<MainApplication>()` 会在应用的类路径上查找每个 `@Configuration` 模块，包括来自功能 Gradle 模块的模块。添加新功能只需添加 Gradle 依赖项即可，无需额外操作。如果希望显式列出模块，请使用 `@KoinApplication(modules = [LoginModule::class, ProfileModule::class])`。

**构造函数 / 经典 DSL**
```kotlin
// Gradle 模块 ":feature:login"
internal class LoginUseCase(private val auth: AuthService)
internal class LoginViewModel(private val login: LoginUseCase) : ViewModel()

val loginModule = module {
    factoryOf(::LoginUseCase)
    viewModelOf(::LoginViewModel)
}
```

```kotlin
// Gradle 模块 ":app"
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

## 在功能之间共享类型 {id="sharing-types-between-features"}

一个功能模块不应依赖另一个功能模块。当 `:feature:profile` 需要当前用户时，它会依赖核心模块中的某个接口，而实现则绑定在其定义所在的位置：

```kotlin
// Gradle 模块 ":core:domain"
interface UserRepository {
    suspend fun currentUser(): User
}
```

**编译器插件 DSL**
```kotlin
// Gradle 模块 ":core:data"
internal class UserRepositoryImpl(private val api: ApiService) : UserRepository

val dataModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
}
```

**注解**
```kotlin
// Gradle 模块 ":core:data"
@Singleton
internal class UserRepositoryImpl(private val api: ApiService) : UserRepository
```

**构造函数 / 经典 DSL**
```kotlin
// Gradle 模块 ":core:data"
internal class UserRepositoryImpl(private val api: ApiService) : UserRepository

val dataModule = module {
    singleOf(::UserRepositoryImpl) bind UserRepository::class
}
```

随后，`:feature:profile` 中的 `ProfileViewModel(private val users: UserRepository)` 即可在运行时解析出 `UserRepositoryImpl`。只要每个 Koin 模块都已加载，Koin 就能跨 Gradle 模块进行解析：功能模块只需要能够引用该接口类型。你不需要为每个功能模块额外定义入口点接口或组件。

使用编译器插件时，功能模块本身没有 `startKoin`，因此其依赖项会在 `:app` 编译并组装完整依赖图时进行检查。请参阅[编译期安全性](/docs/reference/koin-compiler/compile-safety)。

## 动态功能模块 {id="dynamic-feature-modules"}

使用 Play Feature Delivery 时，基础应用无法引用动态功能模块中的代码：依赖关系是从功能指向应用的。请在功能模块自身的入口 Activity 中使用 `loadKoinModules()` 来加载该功能的 Koin 模块：

```kotlin
// 动态功能模块 ":feature:premium"
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

`lazy` 可确保模块在每个进程中仅在 `super.onCreate()` 之前加载一次。有关两者为何至关重要以及如何卸载模块，请参阅[在 Android 上启动 Koin](/docs/reference/koin-android/start#loading-modules-after-start)。

编译器插件无法检测以这种方式加载的模块。基础应用中使用的、且仅由该模块提供的类型必须标记为 `@Provided`（请参阅[编译期安全性](/docs/reference/koin-compiler/compile-safety)）。

## 测试功能模块 {id="testing-feature-modules"}

对每个功能模块进行独立测试，对于其他模块提供的内容使用 Fake（虚构对象）替代。使用编译器插件时，完整的依赖图会在构建时进行检查。如果不使用编译器插件，可以使用 `verify()` 检查每个模块（请参阅[验证你的配置](/docs/reference/koin-test/verify)）。有关使用 Koin 进行单元测试的内容请参阅[单元测试](/docs/reference/koin-test/testing)，设备端测试请参阅[插桩测试](/docs/reference/koin-android/instrumented-testing)。

## 相关内容 {id="related"}

- [模块](/docs/reference/koin-core/modules)：`includes()`、模块可见性和 `@Configuration` 发现。
- [在 Android 上启动 Koin](/docs/reference/koin-android/start)：`startKoin` 以及在运行时加载模块。
- [编译期安全性](/docs/reference/koin-compiler/compile-safety)：如何跨 Gradle 模块检查依赖图。
- [延迟加载模块](/docs/reference/koin-core/lazy-modules)：在启动时于后台加载功能模块。
- [Android 库集成](/docs/reference/koin-android/binding-patterns)：数据层、领域层和 UI 层。