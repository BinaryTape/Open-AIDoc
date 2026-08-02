[//]: # (title: Kotlin/Native 常见问题解答)

## 如何运行我的程序？

定义一个顶层函数 `fun main(args: Array<String>)`，或者如果您对传入的实参不感兴趣，只需定义 `fun main()`，并请确保它不在软件包中。
此外，编译器开关 `-entry` 可用于将任何接收 `Array<String>` 或不接收实参且返回 `Unit` 的函数作为入口点。

## Kotlin/Native 的内存管理模型是什么？

Kotlin/Native 使用一种自动内存管理方案，类似于 Java 或 Swift 提供的方案。

[了解 Kotlin/Native 内存管理器](native-memory-manager.md)

## 如何创建共享库？

在您的 Gradle 构建文件中使用 `-produce dynamic` 编译器选项或 `binaries.sharedLib()`：

```kotlin
kotlin {
    iosArm64("mylib") {
        binaries.sharedLib()
    }
}
```

它会生成一个特定于平台的共享对象（Linux 上为 `.so`，macOS 上为 `.dylib`，Windows 目标平台上为 `.dll`）以及一个 C 语言头文件，允许从 C/C++ 代码中使用 Kotlin/Native 程序中所有可用的公开 API。

[完成 Kotlin/Native 作为动态库教程](native-dynamic-libraries.md)

## 如何创建静态库或对象文件？

在您的 Gradle 构建文件中使用 `-produce static` 编译器选项或 `binaries.staticLib()`：

```kotlin
kotlin {
    iosArm64("mylib") {
        binaries.staticLib()
    }
}
```

它会生成一个特定于平台的静态对象（`.a` 库格式）以及一个 C 语言头文件，允许您从 C/C++ 代码中使用 Kotlin/Native 程序中所有可用的公开 API。

## 如何在公司代理后运行 Kotlin/Native？

由于 Kotlin/Native 需要下载特定于平台的工具链，您需要指定 `-Dhttp.proxyHost=xxx -Dhttp.proxyPort=xxx` 作为编译器或 `gradlew` 的实参，或者通过 `JAVA_OPTS` 环境变量进行设置。

## 如何为我的 Kotlin 框架指定自定义 Objective-C 前缀/名称？

使用 `-module-name` 编译器选项或匹配的 Gradle DSL 语句。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    iosArm64("myapp") {
        binaries.framework {
            freeCompilerArgs += listOf("-module-name", "TheName")
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    iosArm64("myapp") {
        binaries.framework {
            freeCompilerArgs += ["-module-name", "TheName"]
        }
    }
}
```

</tab>
</tabs>

## 如何重命名 iOS 框架？

iOS 框架的默认名称为 `<项目名称>.framework`。
要设置自定义名称，请使用 `baseName` option。这也会同时设置模块名称。

```kotlin
kotlin {
    iosArm64("myapp") {
       binaries {
          framework {
              baseName = "TheName"
          }
       }
    }
}
```

## 如何为我的 Kotlin 框架启用 bitcode？

Bitcode 嵌入在 Xcode 14 中被弃用，并在 Xcode 15 中针对所有 Apple 目标被移除。
自 Kotlin 2.0.20 起，Kotlin/Native 编译器不再支持 bitcode 嵌入。

如果您正在使用较早版本的 Xcode 但希望升级到 Kotlin 2.0.20 或更高版本，请在您的 Xcode 项目中禁用 bitcode 嵌入。

## 如何在 iOS 上获取更好的崩溃报告？

当一个未处理的 Kotlin 异常到达 iOS 代码时，崩溃报告工具可能会显示一个模糊的报告，指出是 Kotlin/Native 内部问题，而不是抛出异常的实际代码行。发生这种情况是因为在记录崩溃时原始的 Kotlin 堆栈跟踪已经丢失。

您可以通过第三方解决方案（例如 [NSExceptionKt](https://github.com/rickclephas/NSExceptionKt)）来解决此问题，它将未捕获的 Kotlin 异常转换为 `NSException` 实例，以便您的崩溃报告工具捕获正确的堆栈跟踪。它为流行的崩溃报告工具提供了专门的集成：

* [Bugsnag](https://github.com/rickclephas/NSExceptionKt/blob/master/NSExceptionKtBugsnag/README.md)
* [Firebase Crashlytics](https://github.com/rickclephas/NSExceptionKt/blob/master/NSExceptionKtCrashlytics/README.md)

## 如何从不同协程安全地引用对象？

要在 Kotlin/Native 的多个协程之间安全地访问或更新对象，请考虑使用并发安全结构，例如 `@Volatile` 和 `AtomicReference`。

使用 [`@Volatile`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent/-volatile/) 注解一个 `var` 属性。
这会使该属性支持字段的所有读写操作都具有原子性。此外，写入操作会立即对其他线程可见。当另一个线程访问此属性时，它不仅能观察到更新后的值，还能观察到更新之前发生的更改。

或者，使用 [AtomicReference](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent.atomics/-atomic-reference/)，它支持原子读取和更新。在 Kotlin/Native 上，它包装了一个 volatile 变量并执行原子操作。
Kotlin 还为针对特定数据类型定制的原子操作提供了一系列类型。您可以使用 `AtomicInt`、`AtomicLong`、`AtomicBoolean`、`AtomicArray`，以及 `AtomicIntArray` 和 `AtomicLongArray`。

有关访问共享可变状态的更多信息，请参阅[协程文档](shared-mutable-state-and-concurrency.md)。

## 如何使用未发布版本的 Kotlin/Native 编译我的项目？

首先，请考虑尝试[预览版本](eap.md)。

如果您需要更近期的开发版本，可以从源代码构建 Kotlin/Native：
克隆 [Kotlin 仓库](https://github.com/JetBrains/kotlin)并遵循[这些步骤](https://github.com/JetBrains/kotlin/blob/master/kotlin-native/README.md#building-from-source)。