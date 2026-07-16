---
title: 为什么选择 Koin？
---

Koin 提供了一种简单且高效的方式，将依赖项注入集成到任何 Kotlin 应用程序中（多平台、Android、后端等）。

## Koin 的目标

Koin 的目标是：
- 通过智能 API **简化**您的依赖项注入基础架构
- 提供易读、易用的 **Kotlin DSL**，助您编写各类应用程序
- **生态系统集成** - 提供从 Android 生态系统到 Ktor 等后端需求的各种集成
- **灵活性** - 支持配合或不配合注解使用

---

## Koin 简而言之

### 让您的 Kotlin 开发变得简单且高效

Koin 是一款智能的 Kotlin 依赖项注入库，让您专注于应用本身，而非工具。

```kotlin
class MyRepository()
class MyPresenter(val repository : MyRepository)

// 声明即可
val myModule = module {
  singleOf(::MyPresenter)
  singleOf(::MyRepository)
}
```

Koin 为您提供简单的工具和 API，让您能够构建、并将 Kotlin 相关技术组装到您的应用程序中，并轻松扩展您的业务。

```kotlin
fun main() {

  // 启动 Koin 
  startKoin {
    modules(myModule)
  }
}
```

---

## 平台支持

### 适配 Android

得益于 Kotlin 语言，Koin 扩展了 Android 平台，并作为原始平台的一部分提供了新功能。

```kotlin
class MyApplication : Application() {
  override fun onCreate() {
    super.onCreate()

    startKoin {
      androidLogger()
      androidContext(this@MyApplication)
      modules(myModule)
    }
  }
}
```

Koin 提供了简单且强大的 API，只需使用 `by inject()` 或 `by viewModel()`，即可在 Android 组件的任何位置检索您的依赖项。

```kotlin
class MyActivity : AppCompatActivity() {

  val myPresenter : MyPresenter by inject()

}
```

:::info
**了解详情**：[在 Android 上启动 Koin](/docs/reference/koin-android/start)
:::

### 助力 Kotlin Multiplatform

在移动平台之间共享代码是 Kotlin Multiplatform 的主要用例之一。通过 Kotlin Multiplatform Mobile，您可以构建跨平台移动应用程序，并在 Android 和 iOS 之间共享通用代码。

Koin 提供多平台依赖项注入，并帮助您在原生移动应用程序以及 Web/后端应用程序中构建组件。

:::info
**了解详情**：[在 Kotlin Multiplatform 中使用 Koin](/docs/reference/koin-mp/kmp)
:::

### 性能与生产力

Koin 是一个纯 Kotlin 框架，在用法和执行方面设计得非常直观。它易于使用，且不会影响您的编译时间，也不需要任何额外的插件配置。

---

## Koin：一个依赖项注入框架

Koin 是一个流行的 Kotlin 依赖项注入 (DI) 框架，为管理应用程序的依赖项提供了一种现代且轻量级的解决方案，且只需极少的模板代码。

### 依赖项注入 vs 服务定位器

虽然 Koin 看起来可能类似于服务定位器 (Service Locator) 模式，但它们之间存在关键区别：

| 维度 | 服务定位器 | 依赖项注入 (Koin) |
|--------|----------------|----------------------------|
| **注册表** | 静态、全局注册表 | 模块化、有作用域的容器 |
| **访问方式** | 显式请求服务 | 依赖项自动传递 |
| **可测试性** | 较难进行模拟/测试 | 易于替换依赖项 |
| **耦合度** | 与框架耦合较紧 | 耦合度较低，依赖项显式化 |
| **最佳实践** | 在现代应用中不推荐使用 | 行业标准模式 |

:::note
**服务定位器**：服务定位器本质上是可用服务的注册表，您可以根据需要请求服务实例。它负责创建和管理这些实例，通常使用静态的全局注册表。

**依赖项注入**：相比之下，Koin 是一个纯粹的依赖项注入框架。使用 Koin，您在模块中声明依赖项，并由 Koin 处理对象的创建和装配。它允许创建多个带有各自作用域的独立模块，使依赖项管理更加模块化，并避免潜在的冲突。
:::

### Koin 的方法：灵活性与最佳实践的结合

Koin 同时支持 DI 和服务定位器模式，为开发者提供了灵活性。然而，它**强烈建议使用 DI**，特别是**构造函数注入**，即通过构造函数参数传递依赖项。这种方法可以提高可测试性，并使您的代码更易于理解。

```kotlin
// ✅ 推荐：构造函数注入
class UserViewModel(
    private val repository: UserRepository,
    private val analytics: Analytics
) : ViewModel() {
    // 依赖关系清晰且可测试
}

// ⚠️ 允许但不推荐：服务定位器模式
class UserViewModel : ViewModel(), KoinComponent {
    private val repository: UserRepository by inject()
    private val analytics: Analytics by inject()
    // 依赖关系被隐藏
}
```

Koin 的设计理念以**简单和易于设置**为中心，同时允许在必要时进行复杂的配置。通过使用 Koin，开发者可以有效地管理依赖项，在大多数场景下，DI 是推荐且首选的方法。

:::info
**了解详情**：请参阅 [依赖项注入基础](/docs/setup/why) 以获取 DI 概念的完整指南。
:::

---

## 透明度与设计概览

Koin 被设计为一个通用的控制反转 (IoC) 容器，支持依赖项注入 (DI) 和服务定位器 (SL) 模式。为了让您清楚地了解 Koin 的运作方式并指导您有效地使用它，让我们探讨以下几个方面：

### Koin 如何平衡 DI 和 SL

Koin 结合了 DI 和 SL 的元素，这可能会影响您使用框架的方式：

1. **全局上下文用法：** 默认情况下，Koin 提供了一个全局可访问的组件，其行为类似于服务定位器。这允许您使用 `KoinComponent` 或 `inject` 函数从中央注册表中检索依赖项。

2. **隔离组件：** 尽管 Koin 鼓励使用依赖项注入（特别是构造函数注入），但它也允许使用隔离组件。这种灵活性意味着您可以将应用程序配置为在最有意义的地方使用 DI，同时在特定情况下仍然利用 SL 的优势。

3. **Android 组件中的 SL：** 在 Android 开发中，Koin 经常在 `Application` 和 `Activity` 等组件内部使用 SL 以简化设置。从此以后，Koin 建议使用 DI（尤其是构造函数注入）以更结构化的方式管理依赖项。然而，这并不是强制性的，开发者可以根据需要灵活使用 SL。

### 为什么这很重要

了解 DI 和 SL 之间的区别有助于有效地管理应用程序的依赖项：

**依赖项注入（推荐）：**
- ✅ 更好的可测试性
- ✅ 显式依赖关系
- ✅ 更清晰的代码结构
- ✅ 行业最佳实践

**服务定位器：**
- ⚠️ 便于设置
- ⚠️ 可能导致更紧密的耦合
- ⚠️ 隐藏的依赖关系
- ⚠️ 较难测试

:::warning
虽然 Koin 为了方便（特别是在 Android 组件中）支持 SL，但**完全依赖 SL 可能会导致更紧密的耦合和可测试性的降低**。Koin 的设计提供了一种平衡的方法，允许您在实用的地方使用 SL，但**将 DI 作为最佳实践进行推广**。
:::

---

## 充分利用 Koin

要有效地使用 Koin：

### 1. 遵循最佳实践

尽可能使用**构造函数注入**，以符合依赖项管理的最佳实践。这种方法可以提高可测试性和可维护性。

```kotlin
// ✅ 优秀
class UserService(private val api: UserApi, private val db: UserDatabase)

module {
    singleOf(::UserService)
}

// ❌ 避免
class UserService : KoinComponent {
    private val api: UserApi by inject()
    private val db: UserDatabase by inject()
}
```

### 2. 利用 Koin 的灵活性

在可以简化设置的场景中利用 Koin 对 SL 的支持，但目标是依靠 DI 来管理核心应用程序依赖项。

### 3. 参考文档和示例

查看 Koin 的文档和示例，了解如何根据您的项目需求适当配置和使用 DI 与 SL。

### 4. 明智地使用作用域

Koin 的作用域功能允许您为应用程序的特定部分隔离依赖项：

```kotlin
module {
    scope<MyActivity> {
        scoped { MyActivityDependency() }
    }
}
```

:::info
**了解详情**：请参阅 [作用域](/docs/reference/koin-core/scopes) 以获取详细的作用域模式。
:::

---

## 后续步骤

准备好开始了吗？请选择您的平台：

### 设置指南
- [Koin 设置](/docs/setup/koin) - 适用于所有平台的 Gradle 配置
- [Koin 注解设置](/docs/setup/annotations) - 适用于基于注解的 DI 的 KSP 设置

### 入门教程
- [Android 与 ViewModel](/docs/quickstart/android-viewmodel) - 开始使用 Koin 构建 Android 应用
- [Jetpack Compose](/docs/quickstart/android-compose) - Koin 与 Compose UI
- [Kotlin Multiplatform](/docs/reference/koin-mp/kmp) - 跨平台共享代码
- [Ktor 后端](/docs/quickstart/ktor) - 构建服务器应用程序

### 核心概念
- [依赖项注入基础](/docs/setup/why) - 基础 DI 概念
- [核心功能](/docs/reference/koin-core/dsl) - Koin DSL 与模块系统
- [Android 集成](/docs/reference/koin-android/start) - Android 特定功能

---

> 通过提供这些指导，我们旨在帮助您有效地掌握 Koin 的功能和设计选择，确保您在遵循依赖项管理最佳实践的同时，能够充分发挥其潜力。