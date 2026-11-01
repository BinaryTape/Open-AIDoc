---
title: 版本发布与升级指南
---

# 版本发布与升级指南

本页面列出了 Koin 的所有主要版本发布，方便您规划升级并检查兼容性。每个版本均遵循相同的结构：

- **Kotlin**：构建 Koin 所使用的 Kotlin 版本。
- **New**：新功能与改进。
- **Experimental**：标记为 `@KoinExperimentalAPI` 的 API，未来仍可能变动。
- **Deprecated**：标记为计划移除的 API 及其替代方案。
- **Breaking**：升级时需要在代码中进行调整的破坏性变更。
- **Bug fixes**、**Improvements**、**Library updates**：在该版本包含对应内容时呈现。

有关实验性和弃用的具体含义，请参阅 [API 稳定性](/docs/support/api-stability)。

## 版本列表 {id="versions"}

| 版本 | Kotlin | 状态 | 主要变更 |
|---------|--------|--------|--------------|
| [4.2.2](#422) | 2.3.20 | 稳定版 | 解析器回归修复、ViewModel 与作用域修复、tvOS、R8/ProGuard 规则 |
| [4.2.1](#421) | 2.3.20 | 上个稳定版 | 作用域解析修复、ABI 恢复、性能提升 |
| [4.2.0](#420) | 2.3.20 | 上个稳定版 | `@KoinApplication` 与 `@Configuration`、Ktor 3.4 DI 桥接、Navigation 3、Dagger 桥接 |
| [4.1.1](#411) | 2.1.21 | 上个稳定版 | Navigation 改进、解析器性能提升 |
| [4.1.0](#410) | 2.1.20 | 上个稳定版 | 作用域原型（Scope archetypes）、特性选项、Ktor KMP |
| [4.0.4](#404) | 2.0.21 | 上个稳定版 | 稳定版 ViewModel API、UUID 生成 |
| [3.5.6](#356) | 1.9.22 | LTS | 适用于 Kotlin 1.x 的长期支持分支、隔离上下文 |
| [3.4.3](#343) | 1.8.21 | 旧版 | 验证 API、ExtensionManager |

当前版本：Koin 4.2.2 与 Koin 编译器插件 1.2.1（参见 [Koin 编译器插件](#koin-compiler-plugin)）。

:::note
两条 LTS 分支保持并行维护：面向 Kotlin 1.x 项目的 Koin 3.5.6 以及面向 Kotlin 2.x 项目的 Koin 4.2.x。请选择与您的 Kotlin 基线相匹配的分支。有关支持策略，请参阅[长期支持 (LTS)](/docs/support/#long-term-support-lts)。
:::

## 4.2.2 {id="4-2-2"}

Kotlin `2.3.20`。

4.2.x 分支的维护版本：修复了 4.2.0 中重写 `CoreResolverV2` 引入的解析器回归问题、ViewModel 与作用域修复、Ktor 请求作用域修复、tvOS 支持以及 R8/ProGuard 规则。

:::warning
如果您在 4.2.0 或 4.2.1 中遇到了解析器问题，请升级至 4.2.2。
:::

### 新增 {id="new"}

`koin-core-viewmodel`
- tvOS 目标（`tvosArm64`、`tvosX64`、`tvosSimulatorArm64`），使 ViewModel 可以在 tvOS 上使用。

`koin-android` / `koin-core-viewmodel`
- 使用方 R8/ProGuard 规则现已打包在 AAR 中发布，并附带全新的 R8/ProGuard 指南。

### 错误修复 {id="bug-fixes"}

`koin-core`
- 修复 #2370、#2408：堆叠形参（`parametersOf`）可能会遮蔽带限定符的 `get(named(...))` 请求。现在带限定符的查找仅读取注册表，绝不读取形参栈。
- 修复 #2379：在根作用域中定义的非 `single` 工厂，当从子作用域进行解析时，其作用域依赖项会针对 `_root_` 而不是请求的作用域进行解析。现在，链接作用域解析会针对发起请求的作用域运行工厂。
- 修复 #2299：通过 `viewModelScopeFactory()` 创建的作用域未与其源作用域建立链接，导致无法解析父级中声明的依赖项。现在创建的作用域已与其父级链接（父级为根作用域时除外）。
- 修复 #2348：由于未经检查的 Map 转换，加载具有非 `String` 值的环境变量或系统属性时会抛出 `ClassCastException`。非 `String` 值现在保留为 `Any`。
- 修复 #2044、#2417：在缺少合适 Extras 的情况下解析 `SavedStateHandle`，或在未启用 `viewModelScopeFactory()` 选项的情况下使用 `viewModelScope { }`，现在会提供可操作的错误提示信息。

`koin-ktor`
- 修复 #2410：并发请求可能会在请求作用域 ID 上发生冲突。现在 ID 由启动时仅播种一次的单调计数器生成（由 @lfavreli-betclic 贡献）。

### 改进 {id="improvements"}

`koin-core`
- `bind()` 和 `binds()` 现在以 O(1) 的时间复杂度追加次要类型，而不是为每个绑定重新分配类型列表。这消除了定义声明大量绑定时的二次方开销。

### 文档 {id="documentation"}

- 在 [Navigation 3 参考指南](/docs/reference/koin-compose/navigation3) 中新增了关于如何将 Koin 与类型化 `entryProvider` 配合使用的指引 (#2336)。

## 4.2.1 {id="4-2-1"}

Kotlin `2.3.20`。

基于 4.2.0 的补丁版本：作用域解析修复、ABI 恢复以及更完善的诊断信息。

### 新增

`koin-core`
- 更清晰的作用域解析错误信息。

### 错误修复

`koin-core`
- 修复 #2387：`CoreResolverV2` 在链接作用域上丢失了堆叠形参查找的问题。
- 恢复了 `runOnKoinStarted` 的 ABI 兼容性。现在在 CI 中运行 API 检查以防止回归。
- 修复了已关闭作用域上的并发问题（volatile 标志），由 @inemtsev 贡献。
- 为作用域 `ViewModel` 以及带有 `SavedStateHandle` 的 ViewModel 添加了测试。

## 4.2.0 {id="4-2-0"}

Kotlin `2.3.20`。所有库版本请见 [libs.versions.toml](https://github.com/InsertKoinIO/koin/blob/4.2.0/projects/gradle/libs.versions.toml)。

### 新增

`koin-core`
- 全新 `CoreResolverV2`：更快地访问堆叠形参、子作用域与 ViewModel 作用域解析、针对每个作用域优化了 `ThreadLocal` 加载。
- `KoinApplication.withConfiguration<T>()` 扩展：将 `KoinApplication` 与由 [Koin 编译器插件](#koin-compiler-plugin) 从 `@KoinApplication` 类中发现的模块连接起来。
- `koinConfiguration<T>()` DSL：从带有注解的类构建 `KoinConfiguration` 的编译器插件入口点。
- 作用域解析和线程安全方面的性能优化。

`koin-android`
- `koinActivityInject`：从当前 `Activity` 作用域中检索依赖项。

`koin-androidx-startup`
- `onKoinStartup { }`：通过 AndroidX Startup 的 `Initializer` API 启动 Koin。
- `KoinConfiguration` 类型与 `KoinStartup` 更新（`KoinInitializer` 保持实验性）。

`koin-ktor`：Ktor 3.4 集成
- 全新的 Koin 与 Ktor DI 桥接，构建于官方 Ktor 3.4 DI API 之上。
- `KoinDependencyMap`：Koin 直接通过 Ktor DI 解析实例。
- `KoinKtorApplication`：提供明确选项的 DSL 桥接，用于 Ktor 到 Koin 以及 Koin 到 Ktor 的装配。
- 现推荐使用 `Application.koinModule` 和 `Application.koinModules` 扩展来声明模块。

`koin-compose-navigation3`（新模块）
- 支持 Jetpack Navigation 3（稳定版 1.0.0）。
- 通用 `EntryProvider`：向导航条目传递元数据形参（动画等）。
- 适用于 Compose Navigation 2 的导航作用域帮助程序。

`koin-dagger-bridge`（新模块）
- 从 Dagger 端注入 Koin 组件，以便从 Dagger 平滑迁移到 Koin。

`koin-core-annotations`（供编译器插件使用）
- `@KoinApplication`：将类标记为 Koin 应用程序的入口点。`startKoin<MyApp>()` 随后会组装所有发现的 `@Configuration` 模块。
- `@Configuration("name")`：将 `@Module` 类分组到配置中（例如 `prod`、`test`、`default`）。具有相同配置标签的模块可以互相看到彼此的定义。
- `@PropertyValue("key")`：用于 `@Property` 注入的默认值。
- `@ScopeId(name = "...")` 与 `@ScopeId(MyScope::class)`：从命名 Koin 作用域中注入值。
- `@Monitor`：使用 Kotzilla SDK 跟踪（执行时间）包装带注解的函数。参见 [@Monitor](/docs/tooling/monitor)。
- 整个安全性关系图均能识别 `@Provided`：它会对从外部提供的类型跳过编译时验证。

### 实验性功能 {id="experimental"}

`koin-core`
- `@KoinApplication(modules = [...])`：显式的 `modules` 数组允许入口点绕过自动发现并使用固定的模块列表。

`koin-androidx-startup`
- 整个 `koin-androidx-startup` API 保持实验性。`KoinInitializer` 标记为 `@KoinExperimentalAPI`。

### 弃用 {id="deprecated"}

`koin-android` / `koin-android-annotation`
- `org.koin.android.annotation.KoinViewModel` 已弃用。请使用 `org.koin.core.annotation.KoinViewModel`。

`koin-ktor`
- `koin-ktor3` 构件已合并至 `koin-ktor` 中（在 4.1.0 中弃用，在 4.2.0 中完全合并）。

### 破坏性变更 {id="breaking"}

`koin-android`
- 最低 SDK 版本从 21 提升至 23，以与 Koin 所使用的 AndroidX 库保持一致。

`koin-compose-navigation3`
- 最低 API 级别为 23。

`koin-core`
- `Module.getAll(...)` 不再对结果进行排序。实例将按声明顺序返回。如果您依赖特定的顺序，请显式排序。

## Koin 编译器插件 {id="koin-compiler-plugin"}

当前版本：`1.2.1`。需要 Koin `4.2.0` 或更高版本以及 Kotlin K2 编译器（已在 `2.3.20`、`2.4.0`、`2.4.10`、`2.4.20` 上完成验证）。

Koin 编译器插件是一个原生的 Kotlin 编译器插件。它取代了基于 KSP 的 Koin Annotations 处理器，并作为 Kotlin 编译的一部分运行，无需 KSP 步骤。安装方法与 Gradle 选项请参阅[编译器插件安装](/docs/setup/compiler-plugin)和[编译器插件选项](/docs/reference/koin-annotations/options)。其验证内容请参阅[编译时安全性](/docs/reference/koin-compiler/compile-safety)。它支持所有 Kotlin 多平台目标：JVM、JS、Wasm、iOS、macOS、watchOS、tvOS、Linux 和 Windows。

如需从 `koin-ksp-compiler` 迁移，请参阅[从 KSP 迁移至编译器插件](/docs/migration/from-ksp-to-compiler-plugin)。

### 1.2.1 {id="1-2-1"}

支持 Kotlin 2.4.20，并修复了在真实 KMP 应用程序中发现的两个问题。

- **Kotlin 2.4.20**：在 1.2.0 上，任何使用 Kotlin 2.4.20 的项目在 IR 生成期间都会因 `NoSuchMethodError` 而失败（#89、#99）。Kotlin 2.4.20 移除或修改了该插件所使用的 4 个编译器 API 的签名。这 4 个问题现已全部修复。
- **KLIB 修复**：当通过依赖项中继传递 `@Configuration` 模块时，wasmJs、JS 和 Kotlin/Native 构建会在 `componentscan_*` 提示上失败，提示 `Different declarations with the same signatures were detected`。JVM 和 Android 不受影响。
- **限定符修复**：在跨模块读取时，同一类型的两个 `@Named` 提供程序合并为了一个，导致产生虚假的 `KOIN-D001` 错误。如果您因虚假的 D001 错误关闭了 `compileSafety`，请重新开启并再次检查。
- **严格的 Kotlin 版本检查**：现在只有经过验证的确切版本才被视为已验证。未验证的版本会给出警告并继续执行，绝不造成构建阻塞。

参见 [1.2.1 版本说明](https://github.com/InsertKoinIO/koin-compiler-plugin/releases/tag/1.2.1)。

### 1.2.0 {id="1-2-0"}

编译时安全性现已覆盖整个 Koin DSL，且跨模块 `includes` 不再隐藏定义。

- **构造函数 DSL 验证**：`singleOf(::T)`、`factoryOf(::T)`、`scopedOf(::T)`、`viewModelOf(::T)` 和 `Scope.new(::T)` 获得了与 `single<T>()` 相同的缺失依赖项和限定符检查。此前依赖于此处未经检查的缺失依赖项的代码现在将编译失败。这是补齐了以往的安全空缺，而非功能回归。
- **新入口点**：`KoinApplication.withConfiguration<T>()` 和 Ktor 的 `install(Koin) { modules(...) }`。
- **模块列表**：`startKoin { modules(myList) }` 可解析 `listOf`、`+`、`.toList()` 以及返回 `List<Module>` 的函数。在运行时产生分支的列表保持未解析状态，并且 `KOIN-W003` 会指出该调用。
- **模块函数**：`fun myModule(): Module = module { ... }` 会像顶层 `val` 一样被跟踪。
- **跨模块修复**：相距两个或更多 `implementation` 跳步的定义在通过 `@Module(includes)`（#82）、`@Configuration` 自动发现以及 DSL `includes(...)` 时曾经不可见。复数形式的 `binds(...)` 现已被识别，并且 `@Module(includes)` 不再合并仅限定符不同的提供程序（#94）。
- **手写 Lambda**：`single { X(get()) }` 通过其自身的 `get()` 调用进行验证，而不是根据构造函数进行推测。这消除了虚假的 `KOIN-D004` 循环依赖错误。

参见 [1.2.0 版本说明](https://github.com/InsertKoinIO/koin-compiler-plugin/releases/tag/1.2.0)。

### 1.1.0 {id="1-1-0"}

仅支持完整关系图验证。移除了按模块验证，改为在每个 Koin 入口点（`startKoin`、`koinApplication`、`@KoinApplication`）执行一次完整关系图检查。这消除了真实的跨模块误报。相应权衡是：在其编译期内自身不含入口点的叶模块或库模块，在有其他模块围绕它组装出真实关系图之前，将不会获得编译时安全性诊断。

参见 [1.1.0 版本说明](https://github.com/InsertKoinIO/koin-compiler-plugin/releases/tag/1.1.0)。

## 4.1.1 {id="4-1-1"}

Kotlin `2.1.21`。

### 新增

`koin-compose-viewmodel-navigation`
- `sharedKoinViewModel` 增加了可选的 `navGraphRoute` 形参，适用于 Compose Navigation。

`koin-core`
- 核心解析器优化：在单个作用域内解析时不再进行不必要的扁平化。
- 作用域调试会显示链接的作用域 ID。

### 库更新 {id="library-updates"}

- Kotlin：2.1.21（升级自 2.1.20）
- Ktor：3.2.3（升级自 3.1.3）
- JetBrains Compose：1.8.2（升级自 1.8.0）
- AndroidX：Fragment 1.8.9、WorkManager 2.10.3、Lifecycle 2.9.3、Navigation 2.9.3
- 测试：Robolectric 4.15.1、Benchmark 0.4.14
- 构建：Binary Validator 0.18.1、NMCP 1.1.0

### 错误修复

`koin-core`
- 还原了导致兼容性错误的日志记录器约束。
- 修复了 Compose 作用域解析，优化了 `LocalKoinApplication` 与 `LocalKoinScope` 上下文处理。

`koin-build`
- 修复了 Maven Central 发布问题。

## 4.1.0 {id="4-1-0"}

Kotlin `2.1.20`。

### 新增

`koin-core`
- `KoinConfiguration` API，用于包装 Koin 配置。
- 作用域原型（Scope archetypes）：针对某类作用域的专用作用域类型限定符。现在可以针对某个作用域类别（即原型）来解析实例。
- 特性选项：用于控制 Koin 内部新行为的特性标志。可在 Koin 配置的 `options` 代码块中激活选项：
```kotlin
startKoin {
    options(
        // 激活新特性
        viewModelScopeFactory()
    )
}
```
- 全新 `CoreResolver`，包含 `ResolutionExtension`，允许 Koin 从外部系统或资源中进行解析（用于装配 Ktor DI）。

`koin-android`
- 升级的依赖库（`androidx.appcompat:appcompat:1.7.0`、`androidx.activity:activity-ktx:1.10.1`）将最低 SDK 从 14 提高到 21。
- 模块 DSL 扩展 `activityScope`、`activityRetainedScope` 和 `fragmentScope`，用于为 Activity 或 Fragment 声明作用域。
- `activityScope()`、`activityRetainedScope()` 和 `fragmentScope()` 函数现已使用作用域原型。

`koin-androidx-compose`
- 与 Koin Compose Multiplatform、Compose 1.8 以及 Lifecycle 2.9 保持一致。

`koin-compose`
- 与 Compose 1.8 以及 Lifecycle 2.9 保持一致。
- `KoinApplicationPreview`：在 Android Studio 和 IntelliJ IDEA 中并行渲染预览。

`koin-compose-viewmodel`
- `koinActivityViewModel`：使用父级 Activity 作为 ViewModel 的宿主。

`koin-ktor`
- 多平台：该模块现在面向 Kotlin 多平台构建。您可以在多平台项目中使用 `koin-ktor`。
- 原有的 `koin-ktor3` 模块合并至 `koin-ktor` 中。
- `Application.koinModule { }` 与 `Application.koinModules()`，用于直接在 Ktor 模块中声明 Koin 模块：
```kotlin
fun Application.customerDataModule() {
    koinModule {
        singleOf(::CustomerRepositoryImpl) bind CustomerRepository::class
    }
}
```
- `Module.requestScope`：在 Ktor 请求作用域内声明定义，无需手动声明 `scope<RequestScope>`。该请求作用域还可以在构造函数中注入 `ApplicationCall`。

`koin-core-coroutines`
- `ModuleConfiguration`：将模块配置汇总在一个结构中，以便后续验证。
```kotlin
val m1 = module {
    single { Simple.ComponentA() }
}
val lm1 = lazyModule {
    single { Simple.ComponentB(get()) }
}
val conf = moduleConfiguration {
    modules(m1)
    lazyModules(lm1)
}
```
- Koin 配置可以从 `ModuleConfiguration` 中加载模块：
```kotlin
startKoin {
    moduleConfiguration {
        modules(m1)
        lazyModules(lm1)
    }
}

// 甚至可以这样
val conf = moduleConfiguration {
    modules(m1)
    lazyModules(lm1)
}

startKoin {
    moduleConfiguration(conf)
}
```

`koin-test-coroutines`
- 新增 `koin-test-coroutines` 模块，提供与协程相关的测试 API。
- Verify API 可以检查混合了普通模块和延迟模块的 `moduleConfiguration`：
```kotlin
val conf = moduleConfiguration {
    modules(m1)
    lazyModules(lm1)
}

conf.verify()

// 如果需要 Android 类型 (koin-android-test)
conf.verify(extraTypes = androidTypes)
```

`koin-core-annotations`
- `@InjectedParam` 和 `@Provided` 将属性标记为注入形参或动态提供的依赖项。目前供 `Verify` API 使用。

### 实验性功能

`koin-core`
- Wasm：使用 Kotlin 2.1.20 的 UUID 生成。

`koin-core-viewmodel`
- 模块 DSL 扩展 `viewModelScope`，用于声明限定在 ViewModel 作用域原型中的组件。
- `viewModelScope()` 函数：创建绑定到 ViewModel 类生命周期的作用域。它使用 `ViewModelScopeAutoCloseable`（`AutoCloseable` API）关闭作用域，因此无需手动关闭 ViewModel 作用域。
- 更新了 `ScopeViewModel` 类：开箱即用的 ViewModel 作用域类，负责处理作用域的创建与关闭。
- 通过 `viewModelScopeFactory` 选项支持从 ViewModel 的作用域进行构造函数注入：
```kotlin
startKoin {
    options(
        // 激活新的 ViewModel 作用域创建方式
        viewModelScopeFactory()
    )
}

// 将从 MyScopeViewModel 的作用域中注入 Session
class MyScopeViewModel(val session: Session) : ViewModel()

module {
    viewModelOf(::MyScopeViewModel)
    viewModelScope {
        scopedOf(::Session)
    }
}
```

`koin-compose`
- `KoinMultiplatformApplication` 函数：Compose Multiplatform 入口点。

`koin-core-viewmodel-navigation`
- `sharedViewModel` 扩展：复用来自导航 `NavBackStackEntry` 的 ViewModel 实例。

`koin-test`
- `Verify` API 现已支持检查可空形参、延迟形参和列表形参。使用 `@InjectedParam` 或 `@Provided` 标记属性，可将其声明为注入形参或动态提供项，而无需在 Verify 调用中显式声明。
```kotlin
// 现在可在 Verify 中被检测到
class ComponentB(val a: ComponentA? = null)
class ComponentBParam(@InjectedParam val a: ComponentA)
class ComponentBProvided(@Provided val a: ComponentA)
```

### 弃用

`koin-android`
- `ScopeViewModel` 已弃用。请使用来自 `koin-core-viewmodel` 的 `ScopeViewModel` 类。

`koin-compose`
- `KoinContext` 已弃用且可被移除：Koin 上下文现已在当前的默认上下文上准备就绪。

`koin-androidx-compose`
- `KoinAndroidContext` 已弃用且可被移除：Koin 上下文现已在当前的默认上下文上准备就绪。

`koin-androidx-compose-navigation`
- 在 Lifecycle 库更新后，不再需要 `koinNavViewModel`。请将其替换为 `koinViewModel`。

`koin-core-viewmodel-navigation`
- 在 Lifecycle 库更新后，不再需要 `koinNavViewModel`。请将其替换为 `koinViewModel`。

`koin-ktor`
- `Application.koin` 已弃用，推荐使用 `Application.koinModules` 和 `Application.koinModule`。

### 破坏性变更

`koin-android`
- 移除了旧的状态 ViewModel API：
  - `stateViewModel()`、`getStateViewModel()`：请改用 `viewModel()`。
  - `getSharedStateViewModel()`、`sharedStateViewModel()`：对于共享实例，请改用 `viewModel()` 或 `activityViewModel()`。

`koin-compose`
- 移除了旧的 Compose API 函数：
  - `inject()`：请改用 `koinInject()`。
  - `getViewModel()`：请改用 `koinViewModel()`。
  - `rememberKoinInject()`：合并至 `koinInject()`。
- `rememberKoinApplication` 标记为 `@KoinInternalApi`。

## 4.0.4 {id="4-0-4"}

Kotlin `2.0.21`。

所有库版本请见 [libs.versions.toml](https://github.com/InsertKoinIO/koin/blob/4.0.4/projects/gradle/libs.versions.toml)。

### 新增

`koin-core`
- `KoinPlatformTools.generateId()` 现在使用 Kotlin 的 `kotlin.uuid` API，可在所有平台上生成真实的 UUID。

`koin-viewmodel`
- Koin 4.0 引入了在 Google 与 JetBrains KMP API 之间共享的 ViewModel DSL 和 API。为了避免重复，ViewModel API 现在位于 `koin-core-viewmodel` 和 `koin-core-viewmodel-navigation` 中。
- ViewModel DSL 的导入路径为 `org.koin.core.module.dsl.*`。

`koin-core-coroutines`：整个 API 现已稳定
- 所有 `lazyModules`
- `awaitAllStartJobs`、`onKoinStarted`、`isAllStartedJobsDone`
- `waitAllStartJobs`、`runOnKoinStarted`
- `KoinApplication.coroutinesEngine`
- `Module.includes(lazy)`
- `lazyModule()`
- `KoinPlatformCoroutinesTools`

### 实验性功能

`koin-test`
- `ParameterTypeInjection`：为 `Verify` API 声明动态形参注入。

`koin-androidx-startup`
- 通过 `androidx.startup.Initializer` API 使用 AndroidX Startup 启动 Koin。整个 `koin-androidx-startup` API 目前为实验性。

`koin-compose`
- `rememberKoinModules`：通过 `@Composable` 加载和卸载 Koin 模块。
- `rememberKoinScope`：通过 `@Composable` 加载和卸载 Koin 作用域。
- `KoinScope`：为所有子可组合项加载 Koin 作用域。

### 弃用

`koin-test`
- 整个 `checkModules` API。请迁移至 `Verify` API。

`koin-android`
- Android ViewModel DSL 已弃用，推荐使用 `koin-core` 中的共享 DSL。
- 状态 ViewModel API 调整为 Error 级别：
  - `stateViewModel()`、`getStateViewModel()`：请改用 `viewModel()`。
  - `getSharedStateViewModel()`、`sharedStateViewModel()`：对于共享实例，请改用 `viewModel()` 或 `activityViewModel()`。

`koin-compose`
- 旧的 Compose API 函数调整为 Error 级别：
  - `inject()`：请改用 `koinInject()`。
  - `getViewModel()`：请改用 `koinViewModel()`。
  - `rememberKoinInject()`：请改用 `koinInject()`。

`koin-compose-viewmodel`
- ViewModel DSL 已弃用，推荐使用 `koin-core` 中的共享 DSL。
- `koinNavViewModel` 已弃用，推荐使用 `koinViewModel`。

### 破坏性变更

在上一里程碑中弃用后，以下 API 现已移除。所有带有 `@KoinReflectAPI` 注解的 API 也已移除。

`koin-core`
- `ApplicationAlreadyStartedException` 重命名为 `KoinApplicationAlreadyStartedException`。
- 移除了 `KoinScopeComponent.closeScope()`（内部不再使用）。
- 内部 `ResolutionContext` 取代了 `InstanceContext`。
- 移除了 `KoinPlatformTimeTools`、`Timer` 和 `measureDuration`。请使用 Kotlin Time API。
- 移除了 `KoinContextHandler`，推荐使用 `GlobalContext`。

`koin-android`
- 移除了 `Fragment.createScope()`。
- 为适应新的内部机制，重构了 ViewModel 工厂 API（主要是内部 API）。

`koin-compose`
- 移除了 `StableParametersDefinition`（内部不再使用）。
- 移除了延迟 ViewModel API（旧版 `viewModel()`）。
- 移除了 `rememberStableParametersDefinition()`（内部不再使用）。

## 3.5.6 {id="3-5-6"}

Kotlin `1.9.22`。

所有库版本请见 [libs.versions.toml](https://github.com/InsertKoinIO/koin/blob/3.5.6/projects/gradle/libs.versions.toml)。

### 新增

`koin-core`
- `KoinContext` 新增了以下函数：
  - `fun loadKoinModules(module: Module, createEagerInstances: Boolean = false)`
  - `fun loadKoinModules(modules: List<Module>, createEagerInstances: Boolean = false)`
- `koinApplication()` 提供了多种重载签名：
  - `koinApplication(createEagerInstances: Boolean = true, appDeclaration: KoinAppDeclaration? = null)`
  - `koinApplication(appDeclaration: KoinAppDeclaration?)`
  - `koinApplication(createEagerInstances: Boolean)`
- `KoinAppDeclaration`，用于支持更多声明风格。
- `KoinPlatformTimeTools`，以便在 JS 上使用 Time API。
- iOS：`synchronized` API 使用了 Touchlab Lockable API。

`koin-androidx-compose`
- `KoinAndroidContext`：用于从 Android 环境绑定到当前的 Koin 上下文。

`koin-compose`
- `KoinContext`：用于从当前的默认上下文开始运行。

`koin-ktor`
- 为 Ktor 实例使用隔离上下文（使用 `Application.getKoin()` 代替默认上下文）。
- Koin Ktor 插件中新增了监控功能。
- `RequestScope`：用于将实例的作用域限定在 Ktor 请求中。

### 实验性功能

`koin-android`
- `ViewModelScope`：用于 ViewModel 作用域的实验性 API。

`koin-core-coroutines`
- 用于在后台加载模块的新 API。

### 弃用

`koin-android`
- `getLazyViewModelForClass()`：使用复杂且会调用默认全局上下文。请使用 Activity 和 Fragment API。
- `resolveViewModelCompat()` 已弃用，推荐使用 `resolveViewModel()`。

`koin-compose`
- `get()` 与 `inject()` 已弃用，推荐使用 `koinInject()`。
- `getViewModel()` 已弃用，推荐使用 `koinViewModel()`。
- `rememberKoinInject()` 已弃用，推荐使用 `koinInject()`。

### 破坏性变更

`koin-core`
- 由 `Koin.loadModules(modules: List<Module>, allowOverride: Boolean = true, createEagerInstances: Boolean = false)` 取代 `Koin.loadModules(modules: List<Module>, allowOverride: Boolean = true)`。
- `KoinExtension.koin` 属性替换为 `KoinExtension.onRegister()` 函数。
- iOS：`internal fun globalContextByMemoryModel(): KoinContext` 使用了 `MutableGlobalContext`。

`koin-compose`
- 移除了 `KoinApplication(moduleList: () -> List<Module>, content: @Composable () -> Unit)`，推荐使用 `KoinContext` 和 `KoinAndroidContext`。

## 3.4.3 {id="3-4-3"}

Kotlin `1.8.21`。

### 新增

`koin-core`
- `ExtensionManager` API：用于为 Koin 编写扩展引擎（`ExtensionManager` 和 `KoinExtension`）。
- 形参 API：`parameterArrayOf` 与 `parameterSetOf`。

`koin-test`
- `Verification` API：用于在模块上运行 `verify()`。

`koin-android`
- 重构了 ViewModel 注入的内部机制。
- `AndroidScopeComponent.onCloseScope()` 回调。

`koin-android-test`
- `Verification` API：用于在模块上运行 `androidVerify()`。

`koin-androidx-compose`
- `get()`。
- `getViewModel()`。
- 作用域 `KoinActivityScope` 与 `KoinFragmentScope`。

`koin-androidx-compose-navigation`（新模块）
- `koinNavViewModel()`。

`koin-compose`（面向 Compose 的全新多平台 API）
- `koinInject` 与 `rememberKoinInject`。
- `KoinApplication`。

### 实验性功能

`koin-compose`
- `rememberKoinModules`。
- `KoinScope` 与 `rememberKoinScope`。

### 弃用

`koin-compose`
- `inject()` 已弃用，推荐使用 `get()`，以避免使用延迟函数。
- `viewModel()` 已弃用，推荐使用 `getViewModel()`，以避免使用延迟函数。

### 破坏性变更

`koin-android`
- 移除了 `LifecycleScopeDelegate`。

`koin-androidx-compose`
- 移除了 `getStateViewModel`，推荐使用 `koinViewModel`。

## 相关链接 {id="related"}

- [API 稳定性](/docs/support/api-stability)：实验性、弃用与内部 API 的定义。
- [版本、路线图与支持](/docs/support/)：发布周期与 LTS 分支。
- [编译器插件安装](/docs/setup/compiler-plugin)：安装或升级 Koin 编译器插件。
- [从 KSP 迁移至编译器插件](/docs/migration/from-ksp-to-compiler-plugin)：停用 KSP 处理器。
- [Gradle 安装配置](/docs/setup/gradle)：Koin 构件与 BOM。