<!--- TOC -->

* [兼容性](#compatibility)
* [公开 API 类型](#public-api-types)
  * [实验性 API](#experimental-api)
  * [Flow 预览 API](#flow-preview-api)
  * [过时 API](#obsolete-api)
  * [内部 API](#internal-api)
  * [稳定 API](#stable-api)
  * [弃用周期](#deprecation-cycle)
* [使用带注解的 API](#using-annotated-api)
  * [通过编程方式](#programmatically)
  * [Gradle](#gradle)
  * [Maven](#maven)

<!--- END -->

## 兼容性 {id="compatibility"}
本文档描述了 `kotlinx.coroutines` 库自 1.0.0 版本以来的兼容性政策以及兼容性特定注解的语义。

## 公开 API 类型 {id="public-api-types"}
`kotlinx.coroutines` 公开 API 分为五种类型：稳定、实验性、过时、内部和已弃用。
除稳定 API 外，所有公开 API 均标有相应的注解。

### 实验性 API {id="experimental-api"}
实验性 API 使用 [@ExperimentalCoroutinesApi][ExperimentalCoroutinesApi] 注解进行标记。
当 API 的设计存在潜在的待定问题，可能最终导致 API 语义变更或被弃用时，该 API 会被标记为实验性。

默认情况下，大多数新 API 都会标记为实验性，如果没有出现新问题，则会在随后的某个主要版本中变为稳定。
否则，要么在不改变 ABI 的情况下修复语义，要么 API 进入弃用周期。

在以下情况下使用实验性 API 可能会有风险：
* 您正在编写一个依赖于 `kotlinx.coroutines` 的库，并希望在稳定的库 API 中使用实验性协程 API。当您的库的终端用户更新其 `kotlinx.coroutines` 版本，而其中的实验性 API 语义发生轻微变化时，可能会导致意外后果。
* 您希望围绕实验性 API 构建应用程序的核心基础架构。

### Flow 预览 API {id="flow-preview-api"}
所有与 [Flow] 相关的 API 均使用 [@FlowPreview][FlowPreview] 注解标记。
此注解表明 Flow API 处于预览状态。
我们不对预览功能提供版本间的兼容性保证，包括二进制、源码和语义兼容性。

在以下情况下使用预览 API 可能会有风险：
* 您正在编写一个库/框架，并希望在稳定版本或稳定 API 中使用 [Flow] API。
* 您希望在应用程序的核心基础架构中使用 [Flow]。
* 您希望将 [Flow] 作为“写完即忘”的解决方案，并且无法承担 `kotlinx.coroutines` 更新时带来的额外维护成本。

### 过时 API {id="obsolete-api"}
过时 API 使用 [@ObsoleteCoroutinesApi][ObsoleteCoroutinesApi] 注解标记。
过时 API 与实验性 API 类似，但已知存在严重的设计缺陷以及潜在的替代方案，只是替代方案尚未实现。

此 API 的语义不会改变，但一旦替代方案准备就绪，它将进入弃用周期。

### 内部 API {id="internal-api"}
内部 API 使用 [@InternalCoroutinesApi][InternalCoroutinesApi] 标记，或者是 `kotlinx.coroutines.internal` 软件包的一部分。
此 API 不保证稳定性，可以在且将会在未来的版本中更改和/或移除。
如果您无法避免使用内部 API，请报告至 [问题跟踪器](https://github.com/Kotlin/kotlinx.coroutines/issues/new)。

### 稳定 API {id="stable-api"}
稳定 API 保证保留其 ABI 和文档化的语义。如果在某个时间点发现了无法修复的设计缺陷，此 API 将进入弃用周期，并尽可能长时间地保持二进制兼容性。

### 弃用周期 {id="deprecation-cycle"}
当某些 API 被弃用时，它会经历多个阶段，各阶段之间至少隔一个主要版本。
* 功能被弃用并带有编译警告。大多数情况下，会提供适当的替代方案（以及相应的 `replaceWith` 声明），以便在 IntelliJ IDEA 的帮助下自动迁移已弃用的用法。
* 弃用级别提升为 `error` 或 `hidden`。此时不再可能针对已弃用的 API 编译新代码，尽管它仍然存在于 ABI 中。
* API 被完全移除。虽然我们尽力不这样做，且没有移除任何 API 的计划，但为了应对诸如安全漏洞等不可预见的问题，我们仍保留此选项。

## 使用带注解的 API {id="using-annotated-api"}
所有 API 注解均为 [kotlin.Experimental](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-experimental/)。
这样做是为了在使用实验性或过时 API 时产生编译警告。
警告可以通过编程方式针对特定调用站点禁用，也可以针对整个模块全局禁用。

### 通过编程方式 {id="programmatically"}
对于特定的调用站点，可以使用 [OptIn](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-opt-in/) 注解禁用警告：
```kotlin
@OptIn(ExperimentalCoroutinesApi::class) // 禁用有关实验性协程 API 的警告 
fun experimentalApiUsage() {
    someKotlinxCoroutinesExperimentalMethod()
}
``` 

### Gradle {id="gradle"}
对于 Gradle 项目，可以通过在 `build.gradle` 文件中传递编译器标志来禁用警告：

```groovy
tasks.withType(org.jetbrains.kotlin.gradle.tasks.AbstractKotlinCompile).all {
    kotlinOptions.freeCompilerArgs += ["-Xuse-experimental=kotlinx.coroutines.ExperimentalCoroutinesApi"]
}

```

### Maven {id="maven"}
对于 Maven 项目，可以通过在 `pom.xml` 文件中传递编译器标志来禁用警告：
```xml
<plugin>
    <artifactId>kotlin-maven-plugin</artifactId>
    <groupId>org.jetbrains.kotlin</groupId>
    ... your configuration ...
    <configuration>
        <args>
            <arg>-Xuse-experimental=kotlinx.coroutines.ExperimentalCoroutinesApi</arg>
        </args>
    </configuration>
</plugin>
```

<!--- MODULE kotlinx-coroutines-core -->
<!--- INDEX kotlinx.coroutines.flow -->

[Flow]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-flow/index.html

<!--- INDEX kotlinx.coroutines -->

[ExperimentalCoroutinesApi]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-experimental-coroutines-api/index.html
[FlowPreview]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-flow-preview/index.html
[ObsoleteCoroutinesApi]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-obsolete-coroutines-api/index.html
[InternalCoroutinesApi]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-internal-coroutines-api/index.html

<!--- END -->