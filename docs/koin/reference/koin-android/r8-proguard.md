---
title: R8 / ProGuard
---

# R8 / ProGuard

本文介绍了 Koin 在代码缩减与混淆（R8 / ProGuard）下的行为表现、Koin 为你保留的内容，以及**你**需要在自己的应用中保留的内容。

## TL;DR {id="tl-dr"}

- **Koin 的核心解析对 R8 是安全的。** `get<T>()`、`inject<T>()` 以及 `*Of` 构建器（`singleOf`、`factoryOf`、`viewModelOf`……）均在**编译时**解析依赖项——它们使用具体化类型（reified types），并且在 Android/JVM 上使用 `Class.getName()` 作为注册表的键。**不会在运行时对你的构造函数进行反射**，因此你**不需要**为了 Koin 而保留你的定义、ViewModel 或它们的构造函数。
- Koin 在其 Android AAR（`koin-android`、`koin-core-viewmodel`、`koin-compose-viewmodel`、`koin-androidx-workmanager`、`koin-androidx-startup`）中附带了 `consumer-rules.pro`，因此下列规则会自动应用——通常无需你手动添加任何规则。
- 你仍然需要保留**其他组件**通过反射加载的类（见下文）。

## Koin 为你保留的内容（附带的 consumer rules） {id="what-koin-keeps-for-you-shipped-consumer-rules"}

AAR 会屏蔽有关 Koin 内部代码的 R8 警告：

```proguard
-dontwarn org.koin.**
```

`koin-androidx-startup` 还会额外保留其在清单（manifest）中引用的初始化程序。这些规则都不会保留你的应用程序类——Koin 并不需要保留它们。

## 你必须保留的内容 {id="what-you-must-keep"}

这些规则源自平台/依赖库本身，而非来自 Koin 的解析机制：

- **由 `KoinFragmentFactory` 创建的 Fragment** 是通过类名进行实例化的。请保留你的 Fragment 子类（通常它们已经通过 `@Keep`、布局引用或 AndroidX 规则保留了）。
- **WorkManager `ListenableWorker` 子类**由 `androidx.work` 自身的 consumer rules 保留。
- **针对进程终止的已保存状态（Saved state）。** `SavedStateHandle` 是由 androidx 的 `CreationExtras` 提供的，而不是由 Koin 提供的。你放入其中的值必须像其他已保存状态一样在经过 R8 处理后仍然保留——请保留你自己的 `@Parcelize` / `Serializable` 状态类：

```proguard
# 示例 — 保留你自己的已保存状态有效负载 (payload)
-keep class com.example.** implements android.os.Parcelable { *; }
```

## ViewModel 与 SavedStateHandle (#2044) {id="viewmodels-savedstatehandle-2044"}

一种常见的误解是，间歇性出现的 `No definition found for SavedStateHandle` 崩溃是由 R8 剥离了 Koin 的 ViewModel 反射所致。**事实并非如此**——`viewModelOf(::MyViewModel)` 是在编译时确定的，因此在你的 ViewModel 上添加 `-keep` 并不会改变 Koin 的解析方式。

`SavedStateHandle` 仅**在创建 ViewModel 的过程中**可用（它是根据传递给工厂的 `CreationExtras` 构建的）。请**直接在 ViewModel 构造函数中**解析它——不要延迟解析或在构造完成后解析：

```kotlin
// ✅ 在创建期间解析
class MyViewModel(val handle: SavedStateHandle) : ViewModel()

// ❌ 稍后解析 — 届时 CreationExtras 已不复存在
class MyViewModel(koin: Koin) : ViewModel() {
    val handle by lazy { koin.get<SavedStateHandle>() } // 失败
}
```

如果你在 `viewModelScope { }` 内声明 ViewModel，请启用相应的选项以允许创建作用域：

```kotlin
startKoin {
    options(viewModelScopeFactory())
    modules(appModule)
}
```

## 非 Android 目标平台 (JS / WASM / Native) {id="non-android-targets-js-wasm-native"}

在 Android/JVM 上，Koin 使用 `Class.getName()` 作为注册表的键，这在 R8 下是稳定的。在 **Kotlin/JS、WASM 和 Native** 上，Koin 使用来自 Kotlin 反射的 `qualifiedName` / `simpleName`。在这些目标平台上进行激进的代码压缩混淆可能会影响类型标识——在压缩非 Android 目标平台时，建议优先使用**命名限定符**（`named("...")`），而非依赖类名。