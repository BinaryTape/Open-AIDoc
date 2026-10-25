[//]: # (title: 编译器插件)

<snippet id="compiler-plugin-description">
编译器插件可挂钩到编译流程中，在代码编译期间对其进行分析或修改，而无需修改编译器本身。例如，它们可以为代码添加注解或生成新代码，以使其与其他框架或 API 兼容。
</snippet>

本页面介绍了可用的 Kotlin 编译器插件，以及在它们都不适合你的用例时你可以采取的操作。

Kotlin 团队维护着以下编译器插件：

| 插件 | 说明 |
|------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| [All-open](all-open-plugin.md)                                                                 | 自动将带有注解的类及其成员设为 `open`，以便框架在运行时扩展它们。 |
| [AtomicFU](https://github.com/Kotlin/kotlinx-atomicfu)                                         | 将原子操作转换为高效的、平台特定的实现，以实现无锁并发。 |
| [DataFrame](https://kotlin.github.io/dataframe/compiler-plugin.html)                           | 生成类型化 API，让你能够以安全且契合 Kotlin 风格的方式使用 [`DataFrame`](https://kotlin.github.io/dataframe/home.html)。 |
| [JPA](kotlin-jpa-plugin.md)                                                                    | 将带有 JPA 注解的实体设为 `open` 并为其生成无参构造函数；包装了 `all-open` 和 `no-arg`。 |
| [`js-plain-objects`](https://github.com/JetBrains/kotlin/tree/master/plugins/js-plain-objects) | 将 Kotlin 类公开为普通 JavaScript 对象，以改进与 JS 工具链和库的互操作性。 |
| [`jvm-abi-gen`](https://github.com/JetBrains/kotlin/tree/master/plugins/jvm-abi-gen)           | 生成应用程序二进制接口 (ABI) JAR。 |
| [kapt](kapt.md)                                                                                | 对 Kotlin 代码运行 Java 注解处理器并生成额外的源文件。 |
| [Lombok](lombok.md)                                                                            | 使 Kotlin 代码能够识别并使用 Java 源码中由 Lombok 注解生成的代码。 |
| [`no-arg`](no-arg-plugin.md)                                                                   | 为带有注解的类生成无参构造函数，以支持需要此类构造函数的框架。 |
| [Power-assert](power-assert.md)                                                                | 通过显示表达式各部分的详细值来增强断言失败信息。 |
| [SAM with receiver](sam-with-receiver-plugin.md)                                               | 允许 SAM 接口使用带接收者的 lambda 表达式，以获得更具 DSL 风格的语法。 |
| [Serialization](serialization.md)                                                              | 生成无需反射即可序列化和反序列化 Kotlin 对象的代码。 |
| [Spring](kotlin-spring-plugin.md)                                                              | 将带有 Spring 注解的类和成员设为 `open`；它是针对 `all-open` 预配置的包装器。 |

Google 的 Android 团队维护着：

| 插件 | 说明 |
|---------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------|
| [Compose compiler Gradle plugin](https://developer.android.com/develop/ui/compose/compiler) | 将 Compose 编译器与 Gradle 集成，以启用声明式 UI 功能和 Compose 专用的优化。 |
| [Parcelize plugin](https://plugins.gradle.org/plugin/org.jetbrains.kotlin.plugin.parcelize) | 自动生成 `Parcelable` 实现，以便你可以在 Android 组件之间传递 Kotlin 对象。 |

如果你需要以这些插件未涵盖的方式调整编译过程，请首先检查是否可以使用 [Kotlin Symbol Processing (KSP) API](https://kotlinlang.org/docs/ksp-overview.html) 或外部 linter（例如 [Android lint](https://developer.android.com/studio/write/lint)）。
你可以浏览我们的 [Kotlin Slack](https://slack-chats.kotlinlang.org/c/compiler) 或[与我们联系](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)，针对你的用例寻求建议。

如果你_仍然_找不到满足需求的方式，可以[创建自定义编译器插件](custom-compiler-plugins.md)。请仅将此方式作为最后的手段，
因为 Kotlin 编译器插件 API **并不稳定**。如果创建自定义编译器插件，你需要投入大量持续的精力来维护它，
因为每个新的编译器版本都会引入破坏性变更。