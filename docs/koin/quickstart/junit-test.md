---
title: JUnit 测试
---

# JUnit 测试

在本教程中，你将为来自 [Kotlin 教程](/docs/quickstart/kotlin) 的应用编写 JUnit 4 测试。你将学习如何通过 `KoinTestRule` 为每个测试启动 Koin、使用 `verify()` 检查模块，以及使用 Mockito mock 替换依赖项。整个过程大约需要 10 分钟。请先完成 Kotlin 教程，或者直接从其示例代码开始。

本教程基于编译器插件 DSL 应用。所有测试 API 均在[单元测试](/docs/reference/koin-test/testing)中进行了说明。

## 获取代码 {id="get-the-code"}

测试位于 [koin-getting-started/kotlin](https://github.com/InsertKoinIO/koin-getting-started/tree/main/kotlin) 示例的 `app/src/test` 目录下。克隆仓库并在 `kotlin` 文件夹中运行它们：

```bash
./gradlew test
```

## Gradle 配置 {id="gradle-setup"}

该示例将 `koin-test`、`koin-test-junit4` 以及 Mockito 添加为测试依赖项：

```toml
# gradle/libs.versions.toml
[versions]
koin = "<KOIN_VERSION>"
mockito = "<MOCKITO_VERSION>"

[libraries]
koin-test = { module = "io.insert-koin:koin-test", version.ref = "koin" }
koin-test-junit4 = { module = "io.insert-koin:koin-test-junit4", version.ref = "koin" }
mockito = { module = "org.mockito:mockito-inline", version.ref = "mockito" }
```

```kotlin
// app/build.gradle.kts
dependencies {
    testImplementation(libs.koin.test)
    testImplementation(libs.koin.test.junit4)
    testImplementation(libs.mockito)
}
```

`koin-test` 不依赖于任何 mock 库，因此你需要自行添加所使用的库。对于 JUnit 5，请改用 `koin-test-junit5`（参见[单元测试](/docs/reference/koin-test/testing)）。

## 被测模块 {id="the-module-under-test"}

测试将加载来自 Kotlin 教程中的模块：

```kotlin
val appModule = module {
    single<UserApplication>()
    single<UserRepositoryImpl>() bind UserRepository::class
    single<UserServiceImpl>() bind UserService::class
}
```

每个测试都会使用此模块启动 Koin，因此它运行在与应用相同的图（graph）之上。

## 验证模块 {id="let-s-verify-the-module"}

`verify()` 会检查模块中的每个构造函数形参是否都具有对应的定义，而无需创建任何实例：

```kotlin
import org.koin.test.AutoCloseKoinTest
import org.koin.test.verify.verify

class ModuleVerificationTest : AutoCloseKoinTest() {

    @Test
    fun verifyModules() {
        appModule.verify()
    }
}
```

如果存在缺失或无效的定义，测试将会失败。编译器插件已在构建时运行此检查，因此 `verify()` 对插件未覆盖的模块最为关键。请参阅[验证配置](/docs/reference/koin-test/verify)以决定是否需要使用它。

## 在测试中启动 Koin {id="let-s-start-koin-in-a-test"}

实现 `KoinTest` 并添加 `KoinTestRule`。该规则会在每个测试执行前启动 Koin，并在测试结束后将其停止：

```kotlin
import org.koin.test.KoinTest
import org.koin.test.KoinTestRule

class HelloMockTest : KoinTest {

    @get:Rule
    val koinTestRule = KoinTestRule.create {
        modules(appModule)
    }
}
```

`KoinTest` 为测试类提供了 `get()` 和 `by inject()`，例如 `val userService: UserService by inject()`。每个测试启动全新的容器可以防止实例在测试之间发生泄漏。

## Mock 依赖项 {id="let-s-mock-a-dependency"}

添加 `MockProviderRule` 以告知 Koin 如何构建 mock，然后使用 `declareMock` 替换 `UserRepository`：

```kotlin
import org.koin.test.mock.MockProviderRule
import org.koin.test.mock.declareMock
import org.mockito.ArgumentMatchers.anyString
import org.mockito.BDDMockito.given
import org.mockito.Mockito
import org.mockito.Mockito.times

class HelloMockTest : KoinTest {

    @get:Rule
    val koinTestRule = KoinTestRule.create {
        modules(appModule)
    }

    @get:Rule
    val mockProvider = MockProviderRule.create { clazz -> Mockito.mock(clazz.java) }

    @Test
    fun `mock test`() {
        val service = declareMock<UserRepository> {
            given(findUserOrNull(anyString())).willReturn(User("Mock", "mock@example.com"))
        }

        getKoin().get<UserApplication>().sayHello("Mock")
        Mockito.verify(service, times(1)).findUserOrNull(anyString())
    }
}
```

`declareMock` 仅针对当前测试替换 `UserRepository` 的定义。`UserApplication` 和 `UserService` 依然是真实的，因此该测试会验证调用是否通过 `UserService` 传递至仓库一次。

## 后续步骤 {id="next-steps"}

- [单元测试](/docs/reference/koin-test/testing)：所有测试 API、JUnit 5 以及覆盖定义。
- [验证配置](/docs/reference/koin-test/verify)：`verify()` 选项以及编译器插件何时可以替代它。
- [插桩测试](/docs/reference/koin-android/instrumented-testing)：测试使用 Koin 的 Android 应用。
- [Ktor 测试](/docs/reference/koin-ktor/ktor-testing)：使用 Koin 测试 Ktor 路由。
- [工具](/docs/tooling)：适用于 Koin 的 IDE 插件与监控工具。