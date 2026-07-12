[//]: # (title: Compose Multiplatform 中的 Navigation 3)

[Android 的 Navigation 库](https://developer.android.com/guide/navigation)已升级到 Navigation 3，引入了一种专为 Compose 设计并考虑了对该库先前版本反馈的重新设计的导航方式。
从 1.10 版本开始，Compose Multiplatform 支持在所有支持平台（Android、iOS、桌面和 Web）的多平台项目中采用 Navigation 3。

> 有关核心导航概念，请参阅 [Compose 中的 Navigation](compose-navigation.md)。
>
{style="tip"}

## 关键变化

Navigation 3 不仅仅是该库的一个新版本——在许多方面，它完全是一个全新的库。
要了解此次重新设计背后的理念，请参阅 [Android 开发者博客文章](https://android-developers.googleblog.com/2025/05/announcing-jetpack-navigation-3-for-compose.html)。

Navigation 3 的关键变化包括：

* **用户拥有的返回栈**。不再操作单一的库返回栈，而是创建并管理一个由 UI 直接观察的状态 `SnapshotStateList`。
* **低层级构建块**。得益于与 Compose 更紧密的集成，该库在实现自定义导航组件和行为方面提供了更高的灵活性。
* **自适应布局系统**。通过自适应设计，您可以同时显示多个目的地，并在布局之间无缝切换。 

在 [Android 文档](https://developer.android.com/guide/navigation/navigation-3)中详细了解 Navigation 3 的通用设计。

## 依赖项设置

要试用 Navigation 3 的多平台实现，请将以下依赖项添加到您的版本编目（version catalog）中：

```toml
[versions]
multiplatform-nav3-ui = "1.1.1"

[libraries]
jetbrains-navigation3-ui = { module = "org.jetbrains.androidx.navigation3:navigation3-ui", version.ref = "multiplatform-nav3-ui" }
```

> 虽然 Navigation 3 发布为两个构件：`navigation3:navigation3-ui` 和 `navigation3:navigation3-common`，但只有 `navigation3-ui` 拥有独立的 Compose Multiplatform 实现。
> 对 `navigation3-common` 的依赖项会通过传递方式添加。
>
{style="note"}

对于使用 Material 3 Adaptive 和 ViewModel 库的项目，还需添加以下导航支持构件：
```toml
[versions]
compose-multiplatform-adaptive = "1.3.0-beta02"
compose-multiplatform-lifecycle = "2.10.0"

[libraries]
jetbrains-material3-adaptiveNavigation3 = { module = "org.jetbrains.compose.material3.adaptive:adaptive-navigation3", version.ref = "compose-multiplatform-adaptive" }
jetbrains-lifecycle-viewmodelNavigation3 = { module = "org.jetbrains.androidx.lifecycle:lifecycle-viewmodel-navigation3", version.ref = "compose-multiplatform-lifecycle" }
```

最后，您可以试用由 JetBrains 工程师创建的[概念验证库](https://github.com/terrakok/navigation3-browser)。该库将多平台 Navigation 3 与 Web 上的浏览器历史记录导航集成在一起：

```toml
[versions]
compose-multiplatform-navigation3-browser = "1.1.0"

[libraries]
navigation3-browser = { module = "com.github.terrakok:navigation3-browser", version.ref = "compose-multiplatform-navigation3-browser" }
```

计划在未来的版本中为基础多平台 Navigation 3 库提供浏览器历史记录导航支持。
请在 [CMP-8924](https://youtrack.jetbrains.com/projects/CMP/issues/CMP-8924/Integrate-Browser-History-with-Nav3) 中跟踪进度。

## 多平台支持

Navigation 3 与 Compose 紧密对齐，允许 Android 导航实现只需极少的改动即可在通用的 Compose Multiplatform 代码中运行。
为了支持 Web 和 iOS 等非 JVM 平台，您唯一需要做的就是实现[目的地键的多态序列化](#目的地键的多态序列化)。 

您可以在 GitHub 上对比使用 Navigation 3 的纯 Android 应用与多平台应用的详尽示例：
* [包含 Navigation 3 方案的原始 Android 仓库](https://github.com/android/nav3-recipes)
* [包含大部分相同方案的 Compose Multiplatform 项目](https://github.com/terrakok/nav3-recipes)

### 目的地键的多态序列化

在 Android 上，Navigation 3 依赖于基于反射的序列化，这在针对 iOS 等非 JVM 平台时不可用。
考虑到这一点，该库为 `rememberNavBackStack()` 函数提供了两个重载：

* [第一个重载](https://developer.android.com/reference/kotlin/androidx/navigation3/runtime/package-summary#rememberNavBackStack(kotlin.Array))仅接收一组 `NavKey` 引用，且需要基于反射的序列化程序。
* [第二个重载](https://developer.android.com/reference/kotlin/androidx/navigation3/runtime/package-summary#rememberNavBackStack(androidx.savedstate.serialization.SavedStateConfiguration,kotlin.Array))还接收一个 `SavedStateConfiguration` 参数，允许您提供 `SerializersModule` 并跨所有平台正确处理开放多态性。

Navigation 3 [多平台示例](https://github.com/terrakok/nav3-recipes/blob/8ff455499877225b638d5fcd82b232834f819422/sharedUI/src/commonMain/kotlin/com/example/nav3recipes/basicdsl/BasicDslActivity.kt#L40) 定义了路由并使用 `SavedStateConfiguration` 对其进行注册，如下所示：

```kotlin
@Serializable
private data object RouteA : NavKey

@Serializable
private data class RouteB(val id: String) : NavKey

// 为开放多态性创建所需的序列化配置
private val config = SavedStateConfiguration {
    serializersModule = SerializersModule {
        polymorphic(NavKey::class) {
            subclass(RouteA::class, RouteA.serializer())
            subclass(RouteB::class, RouteB.serializer())
        }
    }
}

@Composable
fun BasicDslActivity() {
    // 使用序列化配置
    val backStack = rememberNavBackStack(config, RouteA)

    NavDisplay(
        backStack = backStack,
        //...
    )
}
```

### 建议的序列化方法

在实现多平台导航时，您需要选择如何组织和序列化您的路由定义。
根据项目的复杂程度和模块化程度，请使用以下三种模式之一。

#### 带有密封类型的单一模块

对于所有路由都存在于一个模块中的小型项目，请使用 `sealed interface`。 
这是最直接的方法，因为 Kotlin 序列化会自动处理层次结构：

```kotlin
@Serializable
sealed interface Route : NavKey

@Serializable
data object RouteA : Route

@Serializable
data class RouteB(val id: String) : Route

// 使用默认序列化程序的返回栈
val backStack: MutableList<Route> =
    rememberSerializable(serializer = SnapshotStateListSerializer()) {
        mutableStateListOf(RouteA)
    }
```

或者，如果您想显式使用 `rememberNavBackStack()` 函数， 
这里有一个略有不同的配置：

```kotlin
private val config = SavedStateConfiguration {
    serializersModule = SerializersModule {
        polymorphic(NavKey::class) {
            subclassesOfSealed<Route>()
        }
    }
}
val backStack = rememberNavBackStack(config, RouteA)
```

#### 带有聚合密封类型的多模块

对于在多个模块中定义路由的更复杂项目，您可以为每个模块定义一个密封类型。 
然后，使用 `subclassesOfSealed()` 函数在 `app` 模块中聚合它们的序列化程序。

```kotlin
// 模块 A
@Serializable sealed interface FeatureA : NavKey
@Serializable data object RouteA1 : FeatureA
@Serializable data object RouteA2 : FeatureA

// 模块 B
@Serializable sealed interface FeatureB : NavKey
@Serializable data class RouteB1(val id: String) : FeatureB
@Serializable data class RouteB2(val id: String) : FeatureB

// app 模块
private val config = SavedStateConfiguration {
    serializersModule = SerializersModule {
        polymorphic(NavKey::class) {
            subclassesOfSealed<FeatureA>()
            subclassesOfSealed<FeatureB>()
        }
    }
}
val backStack = rememberNavBackStack(config, RouteA1)
```

通过依赖注入 (DI)，您还可以使用 DI 容器动态地将每个模块中密封类型的序列化程序收集到 `Set<KSerializer>` 中。

#### 带有独立路由注册的多模块

如果您的路由无法分组为密封类型， 
您可以手动组合来自不同模块的 `SerializersModule` 实例。

```kotlin
// 模块 A
@Serializable data object RouteA1 : NavKey
@Serializable data object RouteA2 : NavKey

val serializerModuleA = SerializersModule {
    polymorphic(NavKey::class) {
        subclass(RouteA1::class, RouteA1.serializer())
        subclass(RouteA2::class, RouteA2.serializer())
    }
}

// 模块 B
@Serializable data class RouteB1(val id: String) : NavKey
@Serializable data class RouteB2(val id: String) : NavKey

val serializerModuleB = SerializersModule {
    polymorphic(NavKey::class) {
        subclass(RouteB1::class, RouteB1.serializer())
        subclass(RouteB2::class, RouteB2.serializer())
    }
}

// app 模块
private val config = SavedStateConfiguration {
    serializersModule = serializerModuleA + serializerModuleB
}
val backStack = rememberNavBackStack(config, RouteA1)
```

这种方法提供了高度的灵活性和解耦，但需要更多的手动维护。
与[带有聚合密封类型的多模块](#带有聚合密封类型的多模块)方法类似， 
您可以使用 DI 动态组装序列化程序列表， 
这可以提高灵活性。

## 后续步骤

Android 开发者门户对 Navigation 3 进行了深入介绍。
虽然某些文档使用了 Android 特有的示例，
但其核心概念和导航原则在所有平台上保持一致：

* [Navigation 3 概览](https://developer.android.com/guide/navigation/navigation-3)，包含关于管理状态、导航代码模块化以及动画的建议。
* [从 Navigation 2 迁移到 Navigation 3](https://developer.android.com/guide/navigation/navigation-3/migration-guide)。
  将 Navigation 3 视为一个全新的库比将其视为现有库的新版本更容易，
  因此这与其说是迁移，不如说是重写。
  但该指南指出了应采取的常规步骤。