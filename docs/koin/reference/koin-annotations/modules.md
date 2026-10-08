---
title: 应用、配置与模块
---

## 使用 @KoinApplication 进行应用引导 (Bootstrap) {id="application-bootstrap-with-koinapplication"}

使用 `@KoinApplication` 来定义您的应用程序入口点：

```kotlin
@KoinApplication(modules = [MyModule::class])
class MyApp
```

使用类型化 API 启动 Koin：

```kotlin
fun main() {
    startKoin<MyApp>()

    // 或者使用配置
    startKoin<MyApp> {
        printLogger()
    }
}
```

### 可用的类型化 API {id="available-typed-apis"}

| API | 描述 |
|-----|-------------|
| `startKoin<T>()` | 全局启动 Koin |
| `startKoin<T> { }` | 使用配置块启动 |
| `koinApplication<T>()` | 创建隔离的 KoinApplication |
| `koinConfiguration<T>()` | 创建配置（适用于 Compose、Ktor） |
| `module<T>()` | 加载单个 `@Module` 类 |
| `modules(A::class, B::class)` | 加载多个 `@Module` 类 |

### 加载单个模块 {id="loading-individual-modules"}

使用 `module<T>()` 或 `modules(vararg KClass)` 直接加载 `@Module` 类，无需 `@KoinApplication`：

```kotlin
startKoin {
    module<NetworkModule>()
    modules(DataModule::class, CacheModule::class)
}
```

这对于测试或将注解模块与 DSL 配置混合使用时非常有用：

```kotlin
// 在测试中 —— 仅加载您需要的模块
@get:Rule
val koinTestRule = KoinTestRule.create {
    module<NetworkModule>()
}
```

:::info
`module<T>()` 和 `modules(vararg KClass)` 是存根函数，编译器插件会在编译时对其进行拦截并转换。它们需要应用 Koin 编译器插件。
:::

### @KoinApplication 参数 {id="koinapplication-parameters"}

- `modules`：要包含的模块类数组
- `configurations`：要加载的配置标签数组

```kotlin
@KoinApplication(
    modules = [CoreModule::class],
    configurations = ["production"]
)
class ProdApp
```

:::info
未指定配置时，会自动加载标记有 `@Configuration`（默认标签）的模块。
:::

### 模块加载顺序与重写 {id="module-load-order-and-overrides"}

Koin 在运行时遵循 **最后胜出 (last-wins)** 原则：当两个模块定义了相同的类型时，最后加载的模块具有优先级。编译器插件按照以下顺序从 `@KoinApplication` 组装模块列表：

1. **自动发现的 `@Configuration` 模块**（本地 + 依赖 JAR 包）—— 最先加载
2. **显式的 `@KoinApplication(modules = [A, B, C])`** —— 最后加载，且遵循**声明顺序**

因此，应用级重写总是优先于依赖默认值：

```kotlin
// 在依赖库模块中
@Module @Configuration
class CoreModule {
    @Singleton fun feature(): Feature = DefaultFeature()
}

// 在您的应用模块中
@Module
class AppModule {
    @Singleton fun feature(): Feature = AppFeature()  // 自定义重写
}

@KoinApplication(modules = [AppModule::class])
class MyApp
// 加载顺序：CoreModule (DefaultFeature) → AppModule (AppFeature 胜出)
// 运行时 get<Feature>() 返回 AppFeature。
```

在显式列表中，声明的顺序会被保留 —— 因此 `@KoinApplication(modules = [A, B, C])` 会依次加载 A、B、C，在这三者中 C 胜出。每个条目的 `@Module(includes = [...])` 链保持与该条目归类在一起。

如果一个模块既出现在显式列表中，又通过 `@Configuration` 被发现，它只会加载一次 —— 在其**显式位置**加载 —— 因此 `modules = [...]` 中的声明顺序始终控制重写优先级。

:::tip
如果您需要在多个 `@Configuration` 模块之间指定特定的加载顺序（而不是类路径扫描顺序），请在 `@KoinApplication(modules = [Core::class, Feature::class, App::class])` 中显式列出它们 —— 显式列表遵循声明顺序。
:::

## 使用 @Configuration 进行配置管理 {id="configuration-management-with-configuration"}

`@Configuration` 注解允许您将模块组织到不同的配置（环境、变体等）中。这对于按部署环境或功能集组织模块非常有用。

### 基础配置用法 {id="basic-configuration-usage"}

```kotlin
// 将模块放入默认配置中
@Module
@Configuration
class CoreModule
```

:::info
默认配置名为 "default"，可以配合 `@Configuration` 或 `@Configuration("default")` 使用
:::

您需要使用 `@KoinApplication` 才能从配置中扫描模块：

```kotlin
// 模块 A
@Module
@Configuration
class ModuleA

// 模块 B
@Module
@Configuration
class ModuleB

// 模块 App，扫描所有 @Configuration 模块
@KoinApplication
object MyApp
```

### 多配置支持 {id="multiple-configuration-support"}

一个模块可以与多个配置关联：

```kotlin
// 此模块在 "prod" 和 "test" 配置中均可用
@Module
@Configuration("prod", "test")
class DatabaseModule {
    @Single
    fun database() = PostgreSQLDatabase()
}

// 此模块在 default、test 和 development 中均可用
@Module
@Configuration("default", "test", "development") 
class LoggingModule {
    @Single
    fun logger() = Logger()
}
```

### 特定环境的配置 {id="environment-specific-configurations"}

```kotlin
// 仅限开发环境的配置
@Module
@Configuration("development")
class DevDatabaseModule {
    @Single
    fun database() = InMemoryDatabase()
}

// 仅限生产环境的配置  
@Module
@Configuration("production")
class ProdDatabaseModule {
    @Single
    fun database() = PostgreSQLDatabase()
}

// 在多个环境中可用
@Module
@Configuration("default", "production", "development")
class CoreModule {
    @Single
    fun logger() = Logger()
}
```

### 在 @KoinApplication 中使用配置 {id="using-configurations-with-koinapplication"}

默认情况下，`@KoinApplication` 会加载所有默认配置（标记有 `@Configuration` 的模块）。

您也可以在应用引导中引用这些配置：

```kotlin
@KoinApplication(configurations = ["default", "production"])
class ProductionApp

@KoinApplication(configurations = ["default", "development"])  
class DevelopmentApp

// 仅加载默认配置（与不带参数的 @KoinApplication 相同）
@KoinApplication
class SimpleApp
```

:::info
- 空的 `@Configuration` 等同于 `@Configuration("default")`
- 未指定具体配置时，会自动加载 "default" 配置
- 模块可以通过在注解中列出配置来属于多个配置
:::

## 使用模块进行组织 {id="organizing-with-modules"}

始终使用 `@Module` 在显式模块中组织您的定义：

## 使用 @Module 的类模块 {id="class-module-with-module"}

要声明一个模块，只需在类上标记 `@Module` 注解：

```kotlin
@Module
class MyModule
```

在您的 `@KoinApplication` 中引用模块：

```kotlin
@KoinApplication(modules = [MyModule::class])
class MyApp

fun main() {
    startKoin<MyApp>()
}
```

## 使用 @ComponentScan 进行组件扫描 {id="components-scan-with-componentscan"}

使用 `@ComponentScan` 自动发现带注解的组件：

```kotlin
@Module
@ComponentScan
class MyModule
```

这将扫描当前软件包及其子软件包中的带注解组件。也可以显式指定软件包：

```kotlin
@Module
@ComponentScan("com.myapp.features")
class FeatureModule
```

:::info
`@ComponentScan` 会遍历同一软件包下的所有 Gradle 模块。
:::

## 类模块中的定义 {id="definitions-in-class-modules"}

要直接在代码中定义一个定义 (definition)，您可以使用定义注解来标注函数：

```kotlin
// 假设有 
// class MyComponent(val myDependency : MyDependency)

@Module
class MyModule {

  @Single
  fun myComponent(myDependency : MyDependency) = MyComponent(myDependency)
}
```

> **注意**：`@InjectedParam`（用于来自 startKoin 的注入参数）和 `@Property`（用于属性注入）也可用于函数成员。有关这些注解的更多详细信息，请参阅定义文档。

## 包含模块 {id="including-modules"}

使用 `includes` 属性来组合模块：

```kotlin
@Module
class ModuleA

@Module(includes = [ModuleA::class])
class ModuleB
```

在您的应用程序中引用根模块：

```kotlin
@KoinApplication(modules = [ModuleB::class])  // 自动包含 ModuleA
class MyApp

fun main() {
    startKoin<MyApp>()
}
```
