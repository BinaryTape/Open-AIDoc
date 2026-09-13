[//]: # (title: Kotlin 2.3.x 兼容性指南)

_[保持语言现代性](kotlin-evolution-principles.md)_与_[舒适更新](kotlin-evolution-principles.md)_是 Kotlin 语言设计的基本原则。前者指出应当移除阻碍语言演进的构造，后者则强调这种移除应当事先进行良好的沟通，以使代码迁移尽可能顺畅。

虽然大多数语言变更已经通过其他渠道（如更新日志或编译器警告）宣布，但本文档对这些变更进行了汇总，为从 Kotlin 2.2 迁移到 Kotlin 2.3 提供完整参考。本文档还包含有关工具相关变更的信息。

## 基本术语 {id="basic-terms"}

在本文档中，我们引入了几种兼容性：

- _源码_：源码不兼容的变更会使以前编译正常（没有错误或警告）的代码不再能够编译
- _二进制_：如果两个二进制构件相互替换后不会导致加载或链接错误，则称它们是二进制兼容的
- _行为_：如果在应用变更前后，同一个程序的表现行为不同，则称该变更为行为不兼容

请记住，这些定义仅适用于纯 Kotlin。从其他语言（例如 Java）的角度来看 Kotlin 代码的兼容性不在本文档的讨论范围内。

## 语言 {id="language"}

### 在 `-language-version` 中停止对 1.8 和 1.9 的支持 {id="drop-support-in-language-version-for-1-8-and-1-9"}

> **问题**：[KT-76343](https://youtrack.jetbrains.com/issue/KT-76343)，[KT-76344](https://youtrack.jetbrains.com/issue/KT-76344)。
>
> **组件**：编译器
>
> **不兼容变更类型**：源码
>
> **简要摘要**：从 Kotlin 2.3 开始，编译器不再支持 [`-language-version=1.8`](compiler-reference.md#language-version-version)。对于非 JVM 平台，对 `-language-version=1.9` 的支持也被移除。
>
> **弃用周期**：
>
> - 2.2.0：在使用版本 1.8 和 1.9 的 `-language-version` 时报告警告
> - 2.3.0：在所有平台上将版本 1.8 的 `-language-version` 警告提升为错误，在非 JVM 平台上将版本 1.9 的警告提升为错误

### 报告带有类型别名的推断类型的上界约束冲突错误 {id="report-upper-bound-constraint-violation-errors-for-inferred-types-with-typealiases"}

> **问题**：[KTLC-287](https://youtrack.jetbrains.com/issue/KTLC-287)
>
> **组件**：核心语言
>
> **不兼容变更类型**：源码
>
> **简要摘要**：以前，编译器从未报告有关推断类型的上界冲突约束的错误。这已在 Kotlin 2.3.0 中修复，以便在所有类型形参中一致地报告错误。
>
> **弃用周期**：
>
> - 2.2.20：对隐式类型实参的边界冲突报告弃用警告
> - 2.3.0：对隐式类型实参上的 `UPPER_BOUND_VIOLATED` 将警告提升为错误

### 禁止在 `inline` 和 `crossinline` lambda表达式上使用 `@JvmSerializableLambda` 注解 {id="prohibit-jvmserializablelambda-annotation-on-inline-and-crossinline-lambdas"}

> **问题**：[KTLC-9](https://youtrack.jetbrains.com/issue/KTLC-9)
>
> **组件**：核心语言
>
> **不兼容变更类型**：源码
>
> **简要摘要**：你不能再将 `@JvmSerializableLambda` 注解应用于 `inline` 或 `crossinline` lambda表达式。这些 lambda表达式是不可序列化的，因此应用 `@JvmSerializableLambda` 没有效果。
>
> **弃用周期**：
>
> - 2.1.20：当 `@JvmSerializableLambda` 应用于 `inline` 和 `crossinline` lambda表达式时报告警告
> - 2.3.0：将警告提升为错误；此变更可以在渐进模式下启用

### 当泛型签名不匹配时，禁止将 Kotlin 接口委托给 Java 类 {id="prohibit-delegating-a-kotlin-interface-to-a-java-class-when-the-generic-signatures-don-t-match"}

> **问题**：[KTLC-267](https://youtrack.jetbrains.com/issue/KTLC-267)
>
> **组件**：核心语言
>
> **不兼容变更类型**：源码
>
> **简要摘要**：Kotlin 2.3.0 禁止委托给使用非泛型重写实现泛型接口方法的 Java 类。以前，允许这种行为会导致运行时报告类型不匹配和 `ClassCastException`。此变更将错误从运行时提前到了编译时。
>
> **弃用周期**：
>
> - 2.1.20：报告警告
> - 2.3.0：将警告提升为错误

### 弃用在没有显式返回值类型的表达式体函数中使用 `return` {id="deprecate-use-of-return-in-expression-bodied-functions-without-explicit-return-type"}

> **问题**：[KTLC-288](https://youtrack.jetbrains.com/issue/KTLC-288)
>
> **组件**：核心语言
>
> **不兼容变更类型**：源码
>
> **简要摘要**：Kotlin 现在弃用在未显式声明函数返回值类型时，在表达式体内部使用 `return`。
>
> **弃用周期**：
>
> - 2.3.0：报告警告
> - 2.4.0：将警告提升为错误

### 禁止继承通过类型别名引入的可为 null 的超类型 {id="prohibit-inheritance-from-nullable-supertypes-introduced-via-typealias"}

> **问题**：[KTLC-279](https://youtrack.jetbrains.com/issue/KTLC-279)
>
> **组件**：核心语言
>
> **不兼容变更类型**：源码
>
> **简要摘要**：Kotlin 现在在尝试继承自可为 null 的类型别名时报告错误，这与它处理直接可为 null 超类型的方式保持一致。
>
> **弃用周期**：
>
> - 2.2.0：报告警告
> - 2.3.0：将警告提升为错误

### 统一顶层 lambda表达式和调用实参的泛型签名生成 {id="unify-generic-signature-generation-for-top-level-lambdas-and-call-arguments"}

> **问题**：[KTLC-277](https://youtrack.jetbrains.com/issue/KTLC-277)
>
> **组件**：反射
>
> **不兼容变更类型**：行为
>
> **简要摘要**：Kotlin 2.3.0 对顶层 lambda表达式使用与作为调用实参传递的 lambda表达式相同的类型检查逻辑，确保在两种情况下生成的泛型签名一致。
>
> **弃用周期**：
>
> - 2.3.0：引入新行为；不适用于渐进模式

### 禁止将 reified 类型形参推断为相交类型 {id="prohibit-reified-type-parameters-from-being-inferred-as-intersection-types"}

> **问题**：[KTLC-13](https://youtrack.jetbrains.com/issue/KTLC-13)
>
> **组件**：核心语言
>
> **不兼容变更类型**：源码
>
> **简要摘要**：Kotlin 2.3.0 禁止将 reified 类型形参推断为相交类型的情况，因为这可能导致错误的运行时行为。
>
> **弃用周期**：
>
> - 2.1.0：当 reified 类型形参被推断为相交类型时报告警告
> - 2.3.0：将警告提升为错误

### 禁止通过类型形参边界暴露可见性较低的类型 {id="prohibit-exposing-less-visible-types-through-type-parameter-bounds"}

> **问题**：[KTLC-275](https://youtrack.jetbrains.com/issue/KTLC-275)
>
> **组件**：核心语言
>
> **不兼容变更类型**：源码
>
> **简要摘要**：Kotlin 2.3.0 禁止使用暴露比函数或声明本身更具限制性可见性的类型的类型形参边界，使函数的规则与已应用于类的规则保持一致。
>
> **弃用周期**：
>
> - 2.1.0：在有问题的类型形参边界上报告警告
> - 2.3.0：将警告提升为错误

## 标准库 {id="standard-library"}

### 弃用 Char 到数字的转换，并引入显式的 digit 和 code API {id="deprecate-char-to-number-conversions-and-introduce-explicit-digit-and-code-apis"}

> **问题**：[KTLC-321](https://youtrack.jetbrains.com/issue/KTLC-321)
>
> **组件**：kotlin-stdlib
>
> **不兼容变更类型**：源码
>
> **简要摘要**：Kotlin 2.3.0 弃用了数字类型的 `Char.toX()` 和 `X.toChar()` 转换，并引入了用于访问字符代码和数字值的新显式 API。
>
> **弃用周期**：
>
> - 1.4.30：引入新函数作为实验性
> - 1.5.0：将新函数提升为稳定；对旧函数报告警告并提供替换建议
> - 2.3.0：将警告提升为错误

### 弃用 `Number.toChar()` 函数 {id="deprecate-number-tochar-function"}

> **问题**：[KT-56822](https://youtrack.jetbrains.com/issue/KT-56822)
>
> **组件**：kotlin-stdlib
>
> **不兼容变更类型**：源码
>
> **简要摘要**：`Number.toChar()` 函数已弃用。请改用 `toInt().toChar()` 或 `Char` 构造函数。
>
> **弃用周期**：
>
> - 1.9.0：在使用 `Number.toChar()` 函数时报告警告
> - 2.3.0：将警告提升为错误

### 弃用 `String.subSequence(start, end)` 函数 {id="deprecate-string-subsequence-start-end-function"}

> **问题**：[KTLC-282](https://youtrack.jetbrains.com/issue/KTLC-282)
>
> **组件**：kotlin-stdlib
>
> **不兼容变更类型**：源码
>
> **简要摘要**：`String.subSequence(start, end)` 函数已弃用。请改用 [`String.subSequence(startIndex, endIndex)`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/sub-sequence.html) 函数。
>
> **弃用周期**：
>
> - 1.0：在使用 `String.subSequence(start, end)` 时报告警告
> - 2.3.0：将警告提升为错误

### 弃用 `kotlin.io.createTempDirectory()` 和 `kotlin.io.createTempFile()` 函数 {id="deprecate-kotlin-io-createtempdirectory-and-kotlin-io-createtempfile-functions"}

> **问题**：[KTLC-281](https://youtrack.jetbrains.com/issue/KTLC-281)
>
> **组件**：kotlin-stdlib
>
> **不兼容变更类型**：源码
>
> **简要摘要**：`kotlin.io.createTempDirectory()` 和 `kotlin.io.createTempFile()` 函数已弃用。请改用 [`kotlin.io.path.createTempDirectory()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.io.path/create-temp-directory.html) 和 [`kotlin.io.path.createTempFile()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.io.path/create-temp-file.html) 函数。
>
> **弃用周期**：
>
> - 1.4.20：在使用 `kotlin.io.createTempDirectory()` 和 `kotlin.io.createTempFile()` 函数时报告警告
> - 2.3.0：将警告提升为错误

### 隐藏 `InputStream.readBytes(Int)` 函数 {id="hide-inputstream-readbytes-int-function"}

> **问题**：[KTLC-280](https://youtrack.jetbrains.com/issue/KTLC-280)
>
> **组件**：kotlin-stdlib
>
> **不兼容变更类型**：源码
>
> **简要摘要**：在被弃用很长时间后，`InputStream.readBytes(estimatedSize: Int = DEFAULT_BUFFER_SIZE): ByteArray` 函数现在被隐藏。
>
> **弃用周期**：
>
> - 1.3.0：报告警告
> - 1.5.0：将警告提升为错误
> - 2.3.0：隐藏该函数

### 统一 Kotlin/Native 与其他平台的堆栈跟踪打印 {id="unify-kotlin-native-stack-trace-printing-with-other-platforms"}

> **问题**：[KT-81431](https://youtrack.jetbrains.com/issue/KT-81431)
>
> **组件**：Kotlin/Native
>
> **不兼容变更类型**：行为
>
> **简要摘要**：在格式化异常堆栈跟踪时，如果已经打印了相同的异常原因，则不再打印额外的异常原因。
>
> **弃用周期**：
>
> - 2.3.20：统一 Kotlin/Native 异常堆栈跟踪格式与其他 Kotlin 平台

### 修正 `Iterable<T>.intersect()` 和 `Iterable<T>.subtract()` 的行为 {id="correct-iterable-t-intersect-and-iterable-t-subtract-behavior"}

> **问题**：[KTLC-268](https://youtrack.jetbrains.com/issue/KTLC-268)
>
> **组件**：kotlin-stdlib
>
> **不兼容变更类型**：行为
>
> **简要摘要**：[`Iterable<T>.intersect()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/intersect.html) 和 [`Iterable<T>.subtract()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/subtract.html) 函数现在在将每个接收者元素添加到结果集之前测试其成员资格。结果集使用 `Any::equals` 比较元素，确保即使实参集合使用引用相等性（例如 `IdentityHashMap.keys`）也能获得正确的结果。
>
> **弃用周期**：
>
> - 2.3.0：启用新行为

## 工具 {id="tools"}

### 使用 `kotlin-dsl` 和 `kotlin("jvm")` 插件时出现不支持的 KGP 版本警告 {id="unsupported-kgp-version-warning-when-using-kotlin-dsl-and-kotlin-jvm-plugins"}

> **问题**：[KT-79851](https://youtrack.jetbrains.com/issue/KT-79851)
>
> **组件**：Gradle
>
> **不兼容变更类型**：行为
>
> **简要摘要**：在 Kotlin 2.3 中，如果你在 Gradle 项目中同时使用 `kotlin-dsl` **和** `kotlin("jvm")` 插件，你可能会看到关于不支持的 Kotlin Gradle 插件 (KGP) 版本的 Gradle 警告。
>
> **迁移步骤**：
> 
> 通常，我们不建议在同一个 Gradle 项目中同时使用 `kotlin-dsl` 和 `kotlin("jvm")` 插件。此设置不受支持。
> 
> 对于约定插件、预编译脚本插件或任何其他形式的未发布构建逻辑，你有三个选项：
> 
> 1. 不要显式应用 `kotlin("jvm")` 插件。相反，让 `kotlin-dsl` 插件自动提供兼容的 KGP 版本。
> 2. 如果你想显式应用 `kotlin("jvm")` 插件，请使用 [`embeddedKotlinVersion`](https://docs.gradle.org/current/kotlin-dsl/gradle/org.gradle.kotlin.dsl/embedded-kotlin-version.html) 常量来指定嵌入式 Kotlin 版本。
>
>     要升级嵌入式 Kotlin 和语言版本，请更新你的 Gradle 版本。你可以在 Gradle 的 [Kotlin 兼容性说明](https://docs.gradle.org/current/userguide/compatibility.html#kotlin)中找到兼容的 Gradle 版本。
> 
> 3. 不要使用 `kotlin-dsl` 插件。这可能更适合不与特定 Gradle 版本绑定的二进制插件。
>
> 作为最后的手段，你可以将项目配置为使用语言版本 2.1 或更高版本，这将重写 `kotlin-dsl` 插件的冲突行为。但是，我们强烈建议不要这样做。
> 
> 如果你在迁移过程中遇到困难，请在我们的 [Slack](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up) 的 #gradle 频道寻求支持。
> 
> **弃用周期**：
>
> - 2.3.0：引入一项诊断，检测 `kotlin-dsl` 插件是否与编译器的不兼容语言或 API 版本一起使用

### 针对 AGP 9.0.0 及更高版本弃用 `kotlin-android` 插件 {id="deprecate-kotlin-android-plugin-for-agp-versions-9-0-0-and-later"}

> **问题**：[KT-81199](https://youtrack.jetbrains.com/issue/KT-81199)
>
> **组件**：Gradle
>
> **不兼容变更类型**：源码
>
> **简要摘要**：在 Kotlin 2.3.0 中，当使用 Android Gradle 插件 (AGP) 9.0.0 或更高版本时，`org.jetbrains.kotlin.android` 插件已被弃用。从 AGP 9.0.0 开始，[AGP 提供了对 Kotlin 的内置支持](https://kotl.in/gradle/agp-built-in-kotlin)，因此不再需要 `kotlin-android` 插件。
>
> **弃用周期**：
>
> - 2.3.0：当 `kotlin-android` 插件与 AGP 版本 9.0.0 或更高版本一起使用，且 `android.builtInKotlin` 和 `android.newDsl=false` Gradle 属性均设置为 `false` 时报告警告

### 弃用 `testApi` 配置 {id="deprecate-testapi-configuration"}

> **问题**：[KT-63285](https://youtrack.jetbrains.com/issue/KT-63285)
>
> **组件**：Gradle
>
> **不兼容变更类型**：源码
>
> **简要摘要**：Kotlin 2.3.0 弃用了 `testApi` 配置。此配置会将测试依赖项和源码暴露给其他模块，但 Gradle 不支持此行为。
> 
> **迁移选项**：
> 将任何 `testApi()` 实例替换为 `testImplementation()`，并对其他变体执行相同操作。例如，将 `kotlin.sourceSets.commonTest.dependencies.api()` 替换为 `kotlin.sourceSets.commonTest.dependencies.implementation()`。
> 
> 对于 Kotlin/JVM 项目，请考虑改用 Gradle 的 [测试固定例程](https://docs.gradle.org/current/userguide/java_testing.html#sec:java_test_fixtures)。如果你希望看到多平台项目中对测试固定例程的支持，请在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-63142) 中分享你的用例。
> 
> **弃用周期**：
>
> - 2.3.0：报告警告

### 弃用 `createTestExecutionSpec()` 函数 {id="deprecate-createtestexecutionspec-function"}

> **问题**：[KT-75449](https://youtrack.jetbrains.com/issue/KT-75449)
>
> **组件**：Gradle
>
> **不兼容变更类型**：源码
>
> **简要摘要**：Kotlin 2.3.0 弃用了 `KotlinJsTestFramework` 接口中的 `createTestExecutionSpec()` 函数，因为它不再被使用。
>
> **弃用周期**：
>
> - 2.2.20：报告警告
> - 2.3.0：将警告提升为错误
> - 2.4.0：移除该函数

### 移除 `closureTo()`、`createResultSet()` 和 `KotlinToolingVersionOrNull()` 函数 {id="remove-closureto-createresultset-and-kotlintoolingversionornull-functions"}

> **问题**：[KT-64273](https://youtrack.jetbrains.com/issue/KT-64273)
>
> **组件**：Gradle
>
> **不兼容变更类型**：源码
>
> **简要摘要**：Kotlin 2.3.0 移除了 `closure` DSL 中的 `closureTo()`、`createResultSet()` 函数，因为它们不再被使用。此外，`KotlinToolingVersionOrNull()` 函数也被移除。请改用 `KotlinToolingVersion()` 函数。
>
> **弃用周期**：
> 
> - 1.7.20：报告错误
> - 2.3.0：移除这些函数

### 弃用 `ExtrasProperty` API {id="deprecate-the-extrasproperty-api"}

> **问题**：[KT-74915](https://youtrack.jetbrains.com/issue/KT-74915)
>
> **组件**：Gradle
>
> **不兼容变更类型**：源码
>
> **简要摘要**：`ExtrasProperty` API 自 Kotlin 2.0.0 起已被弃用，现在在 Kotlin 2.3.0 中已变为内部。请改用 Gradle 的 [`ExtraPropertiesExtension`](https://docs.gradle.org/current/dsl/org.gradle.api.plugins.ExtraPropertiesExtension.html) API 作为替代方案。
> 
> **弃用周期**：
>
> - 2.0.0：报告警告
> - 2.1.0：将警告提升为错误
> - 2.3.0：将 API 设为 internal

### 弃用 `KotlinCompilation` 中的 `HasKotlinDependencies` {id="deprecate-haskotlindependencies-in-kotlincompilation"}

> **问题**：[KT-67290](https://youtrack.jetbrains.com/issue/KT-67290)
>
> **组件**：Gradle
>
> **不兼容变更类型**：源码
>
> **简要摘要**：Kotlin 2.3.0 弃用了 [`KotlinCompilation`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-compilation/) 中的 `HasKotlinDependencies` 接口。依赖相关的 API 现在改为通过 [`KotlinSourceSet`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/) 接口暴露。
>
> **弃用周期**：
>
> - 2.3.0：报告警告

### 弃用 npm 和 Yarn 软件包管理器内部函数和属性 {id="deprecate-npm-and-yarn-package-manager-internal-functions-and-properties"}

> **问题**：[KT-81009](https://youtrack.jetbrains.com/issue/KT-81009)
>
> **组件**：Gradle
>
> **不兼容变更类型**：源码
>
> **简要摘要**：以下与 npm 和 Yarn 软件包管理器相关的函数和属性已弃用：
> 
> * `CompositeDependency.dependencyName`、`CompositeDependency.dependencyVersion`、`CompositeDependency.includedBuildDir`。
> * `KotlinNpmInstallTask.Companion.NAME`。
> * `LockCopyTask.Companion.STORE_PACKAGE_LOCK_NAME`、`LockCopyTask.Companion.RESTORE_PACKAGE_LOCK_NAME`、`LockCopyTask.Companion.UPGRADE_PACKAGE_LOCK`。
> * `Npm.npmExec()`。
> * `NpmProject.require()`、`NpmProject.useTool()`。
> * `PublicPackageJsonTask.jsIrCompilation`。
> * `YarnBasics.yarnExec()`。
> * `YarnPlugin.Companion.STORE_YARN_LOCK_NAME`、`YarnPlugin.Companion.RESTORE_YARN_LOCK_NAME`、`YarnPlugin.Companion.UPGRADE_YARN_LOCK`。
> * `YarnSetupTask.Companion.NAME`。
>
> **弃用周期**：
>
> - 2.2.0 和 2.2.20：在使用这些函数或属性时报告警告
> - 2.3.0：将警告提升为错误
> - 2.4.0：移除这些函数和属性

### 弃用对 PhantomJS 的支持 {id="deprecate-support-for-phantomjs"}

> **问题**：[KT-76019](https://youtrack.jetbrains.com/issue/KT-76019)
>
> **组件**：Gradle
>
> **不兼容变更类型**：源码
>
> **简要摘要**：由于 PhantomJS 不再维护，Kotlin 2.3.0 弃用了 `NpmVersions` API 中的 `karmaPhantomjsLauncher` 属性。
> 
> **弃用周期**：
>
> - 2.3.0：报告警告

### 禁止继承用于设置测试运行或 JavaScript 运行时的类 {id="prohibit-subclassing-of-classes-that-set-up-test-runs-or-javascript-runtime"}

> **问题**：[KT-75869](https://youtrack.jetbrains.com/issue/KT-75869)，[KT-81007](https://youtrack.jetbrains.com/issue/KT-81007)
>
> **组件**：Gradle
>
> **不兼容变更类型**：源码
>
> **简要摘要**：Kotlin 2.3.0 禁止继承以下类：
> * `KotlinTest`
> * `KotlinNativeTest`
> * `KotlinJsTest`
> * `KotlinJsIrTarget`
> * `KotlinNodeJsIr`
> * `KotlinD8Ir`
> * `KotlinKarma`
> * `KotlinMocha`
> * `KotlinWebpack`
> * `TypeScriptValidationTask`
> * `YarnRootExtension`
> 
> 这些类从未打算被继承。所有继承的用例现在都应该由 Kotlin Gradle 插件 DSL 提供的配置块涵盖。
> 如果这些任务的现有 API 无法满足你设置测试运行或 JavaScript 运行时的需求，请在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-75869) 中分享你的反馈。
>
> **弃用周期**：
>
> - 2.2.0：对从这些类创建子类的代码报告警告
> - 2.3.0：将警告提升为错误
> - 2.4.0：移除这些 API

### 弃用 `ExperimentalWasmDsl` 注解类 {id="deprecate-experimentalwasmdsl-annotation-class"}

> **问题**：[KT-81005](https://youtrack.jetbrains.com/issue/KT-81005)
>
> **组件**：Gradle
>
> **不兼容变更类型**：源码
>
> **简要摘要**：`ExperimentalWasmDsl` 注解类已弃用，因为功能已移至 `kotlin-plugin-annotations` 模块。
>
> **弃用周期**：
>
> - 2.0.20：报告警告
> - 2.3.0：将警告提升为错误
> - 2.4.0：移除该注解类

### 弃用 `ExperimentalDceDsl` 注解类 {id="deprecate-experimentaldcedsl-annotation-class"}

> **问题**：[KT-81008](https://youtrack.jetbrains.com/issue/KT-81008)
>
> **组件**：Gradle
>
> **不兼容变更类型**：源码
>
> **简要摘要**：`ExperimentalDceDsl` 注解类不再使用，因此已被弃用。
>
> **弃用周期**：
>
> - 2.2.0：报告警告
> - 2.3.0：将警告提升为错误
> - 2.4.0：移除该注解类

### 弃用 JavaScript 实用工具 {id="deprecate-javascript-utilities"}

> **问题**：[KT-81010](https://youtrack.jetbrains.com/issue/KT-81010)
>
> **组件**：Gradle
>
> **不兼容变更类型**：源码
>
> **简要摘要**：以下函数和属性仅在内部使用，因此已被弃用：
> * `JsIrBinary.generateTs`
> * `KotlinJsIrLink.mode`
> * `NodeJsSetupTask.Companion.NAME`
> * `Appendable.appendConfigsFromDir()`
> * `ByteArray.toHex()`
> * `FileHasher.calculateDirHash()`
> * `String.jsQuoted()`
>
> **弃用周期**：
>
> - 2.2.0：在使用 `KotlinJsIrLink.mode` 属性时报告警告
> - 2.2.0：在使用 `NodeJsSetupTask.Companion.NAME` 属性和函数时报告警告
> - 2.2.20：在使用 `JsIrBinary.generateTs` 属性时报告警告
> - 2.3.0：将警告提升为错误
> - 2.4.0：移除这些 API

### 弃用迁移后的 D8 和 Binaryen 属性 {id="deprecate-migrated-d8-and-binaryen-properties"}

> **问题**：[KT-81006](https://youtrack.jetbrains.com/issue/KT-81006)
>
> **组件**：Gradle
>
> **不兼容变更类型**：源码
>
> **简要摘要**：以下属性已弃用，因为它们已从 `org.jetbrains.kotlin.gradle.targets.js` 软件包迁移到 `org.jetbrains.kotlin.gradle.targets.wasm` 软件包：
> 
> * `binaryen.BinaryenEnvSpec`
> * `binaryen.BinaryenExtension`
> * `binaryen.BinaryenPlugin`
> * `binaryen.BinaryenRootPlugin`
> * `BinaryenSetupTask.Companion.NAME`
> * `d8.D8EnvSpec`
> * `d8.D8Plugin`
> * `D8SetupTask.Companion.NAME`
>
> **弃用周期**：
>
> - 2.2.0：报告警告
> - 2.3.0：将警告提升为错误
> - 2.4.0：移除这些属性

### 弃用 `NodeJsExec` DSL 中的 `create()` 函数 {id="deprecate-create-function-in-nodejsexec-dsl"}

> **问题**：[KT-81004](https://youtrack.jetbrains.com/issue/KT-81004)
>
> **组件**：Gradle
>
> **不兼容变更类型**：源码
>
> **简要摘要**：`NodeJsExec` DSL 伴生对象中的 `create()` 函数已弃用。请改用 `register()` 函数。
>
> **弃用周期**：
>
> - 2.1.20：报告警告
> - 2.3.0：将警告提升为错误
> - 2.4.0：移除该函数

### 弃用 `kotlinOptions` DSL 中的属性 {id="deprecate-properties-in-kotlinoptions-dsl"}

> **问题**：[KT-76720](https://youtrack.jetbrains.com/issue/KT-76720)
>
> **组件**：Gradle
>
> **不兼容变更类型**：源码
>
> **简要摘要**：自 Kotlin 2.2.0 起，通过 `kotlinOptions` DSL 和相关的 `KotlinCompile<KotlinOptions>` 任务接口配置编译器选项的能力已被弃用，转而使用新的 `compilerOptions` DSL。
> Kotlin 2.3.0 继续对 `kotlinOptions` 接口中的所有属性进行弃用周期。
> 要进行迁移，请使用 `compilerOptions` DSL 配置编译器选项。有关迁移指导，请参阅[从 `kotlinOptions {}` 迁移到 `compilerOptions {}`](gradle-compiler-options.md#migrate-from-kotlinoptions-to-compileroptions)。
>
> **弃用周期**：
>
> - 2.0.0：对 `kotlinOptions` DSL 报告警告
> - 2.2.0：将警告提升为错误，并弃用 `kotlinOptions` 中的所有属性
> - 2.3.0：对 `kotlinOptions` 中的所有属性将警告提升为错误

### 弃用 `kotlinArtifacts` API {id="deprecate-kotlinartifacts-api"}

> **问题**：[KT-77066](https://youtrack.jetbrains.com/issue/KT-77066)
>
> **组件**：Gradle
>
> **不兼容变更类型**：源码
>
> **简要摘要**：实验性的 `kotlinArtifacts` API 已弃用。请使用 Kotlin Gradle 插件中当前的 DSL 来[构建最终的原生二进制文件](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html)。
> 如果这不足以完成迁移，请在[此 YouTrack 问题](https://youtrack.jetbrains.com/issue/KT-74953)中留下评论。
>
> **弃用周期**：
>
> - 2.2.0：在使用 `kotlinArtifacts` API 时报告警告
> - 2.3.0：将此警告提升为错误
> - 2.4.0：移除该 API

### 移除 `kotlin.mpp.resourcesResolutionStrategy` Gradle 属性 {id="remove-kotlin-mpp-resourcesresolutionstrategy-gradle-property"}

> **问题**：[KT-74955](https://youtrack.jetbrains.com/issue/KT-74955)
>
> **组件**：Gradle
>
> **不兼容变更类型**：源码
>
> **简要摘要**：以前，`kotlin.mpp.resourcesResolutionStrategy` Gradle 属性因为未使用而被弃用。在 Kotlin 2.3.0 中，该 Gradle 属性已被完全移除。
>
> **弃用周期**：
>
> - 2.2.0：报告配置时诊断
> - 2.3.0：移除该 Gradle 属性

### 弃用旧模式的多平台 IDE 导入 {id="deprecated-old-mode-of-multiplatform-ide-import"}

> **问题**：[KT-61127](https://youtrack.jetbrains.com/issue/KT-61127)
>
> **组件**：Gradle
>
> **不兼容变更类型**：源码
>
> **简要摘要**：在 Kotlin 2.3.0 之前，我们支持多种模式的多平台 IDE 导入。现在，旧模式已被弃用，仅保留一种可用模式。以前，旧模式是通过使用 `kotlin.mpp.import.enableKgpDependencyResolution=false` Gradle 属性启用的。现在使用此属性会触发弃用警告。
>
> **弃用周期**：
>
> - 2.3.0：在使用 `kotlin.mpp.import.enableKgpDependencyResolution=false` Gradle 属性时报告警告

### 移除用于禁用精确编译备份的属性 {id="remove-properties-to-disable-precise-compilation-backup"}

> **问题**：[KT-81038](https://youtrack.jetbrains.com/issue/KT-81038)
>
> **组件**：Gradle
>
> **不兼容变更类型**：源码
>
> **简要摘要**：Kotlin 1.9.0 为增量编译引入了一种名为“精确编译备份”的实验性优化。经过成功测试后，此优化在 Kotlin 2.0.0 中默认启用。Kotlin 2.3.0 移除了用于退出此优化的 `kotlin.compiler.preciseCompilationResultsBackup` 和 `kotlin.compiler.keepIncrementalCompilationCachesInMemory` Gradle 属性。
>
> **弃用周期**：
>
> - 2.1.20：报告警告
> - 2.3.0：移除这些属性

### 弃用 `CInteropProcess` 中的 `destinationDir` {id="deprecate-destinationdir-in-cinteropprocess"}

> **问题**：[KT-74910](https://youtrack.jetbrains.com/issue/KT-74910)
>
> **组件**：Gradle
>
> **不兼容变更类型**：源码
>
> **简要摘要**：`CInteropProcess` 任务中的 `destinationDir` 属性已弃用。
> 请改用 `CInteropProcess.destinationDirectory.set()` 函数。
>
> **弃用周期**：
>
> - 2.1.0：在使用 `destinationDir` 属性时报告警告
> - 2.2.0：将此警告提升为错误
> - 2.3.0：隐藏 `destinationDir` 属性

### 弃用 `CInteropProcess` 中的 `konanVersion` {id="deprecate-konanversion-in-cinteropprocess"}

> **问题**：[KT-74911](https://youtrack.jetbrains.com/issue/KT-74911)
>
> **组件**：Gradle
>
> **不兼容变更类型**：源码
>
> **简要摘要**：`CInteropProcess` 任务中的 `konanVersion` 属性已弃用。
> 请改用 `CInteropProcess.kotlinNativeVersion`。
>
> **弃用周期**：
>
> - 2.1.0：在使用 `konanVersion` 属性时报告警告
> - 2.2.0：将此警告提升为错误
> - 2.3.0：隐藏 `konanVersion` 属性

### 移除 `KotlinCompile.classpathSnapshotProperties` 属性 {id="remove-kotlincompile-classpathsnapshotproperties-properties"}

> **问题**：[KT-76177](https://youtrack.jetbrains.com/issue/KT-76177)
>
> **组件**：Gradle
>
> **不兼容变更类型**：源码
>
> **简要摘要**：`kotlin.incremental.useClasspathSnapshot` Gradle 属性已在 Kotlin 2.2.0 中移除。
> 在 Kotlin 2.3.0 中，以下属性也被移除：
> * `KotlinCompile.classpathSnapshotProperties.useClasspathSnapshot`
> * `KotlinCompile.classpathSnapshotProperties.classpath`
>
> **弃用周期**：
>
> - 2.0.20：对 `kotlin.incremental.useClasspathSnapshot` 属性报告警告弃用
> - 2.2.0：移除 `kotlin.incremental.useClasspathSnapshot` 属性
> - 2.3.0：移除 `KotlinCompile.classpathSnapshotProperties.useClasspathSnapshot` 和 `KotlinCompile.classpathSnapshotProperties.classpath` 属性

### 弃用 `getPluginArtifactForNative()` 函数 {id="deprecate-getpluginartifactfornative-function"}

> **问题**：[KT-78870](https://youtrack.jetbrains.com/issue/KT-78870)
>
> **组件**：Gradle
>
> **不兼容变更类型**：源码
>
> **简要摘要**：在 Kotlin 2.2.20 中，[`getPluginArtifactForNative()` 函数已被弃用](whatsnew2220.md#reduced-size-of-kotlin-native-distribution)。 
> 请改用 [`getPluginArtifact()`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-compiler-plugin-support-plugin/get-plugin-artifact.html) 函数。
>
> **弃用周期**：
>
> - 2.2.20：报告警告
> - 2.3.0：将警告提升为错误
> - 2.4.0：移除该函数

### 更改注册所有生成源码的方法 {id="change-the-approach-to-registering-all-generated-sources"}

> **问题**：[KT-45161](https://youtrack.jetbrains.com/issue/KT-45161)
>
> **组件**：Gradle
>
> **不兼容变更类型**：源码
>
> **简要摘要**：Kotlin 2.3.0 在 [`KotlinSourceSet`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/) 接口中引入了一个新的[实验性](components-stability.md#stability-levels-explained) API，可让你在 Gradle 项目中[注册生成的源码](gradle-configure-project.md#register-generated-sources)。以前，你可以使用 [`kotlin`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/kotlin.html) 属性来访问所有生成的源码。从 Kotlin 2.3.0 开始，如果你的插件或构建逻辑需要访问所有生成的源码，请改用 [`allKotlinSources`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/all-kotlin-sources.html) 属性。
>
> **迁移建议**：
> * 要注册生成的源码，请使用 [`generatedKotlin`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/generated-kotlin.html) 属性。
> * 要访问所有源码（包括非生成的源码），请使用 [`allKotlinSources`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/all-kotlin-sources.html) 属性。

### 弃用 `kotlin.publishJvmEnvironmentAttribute` 属性 {id="deprecate-kotlin-publishjvmenvironmentattribute-property"}

> **问题**：[KT-83678](https://youtrack.jetbrains.com/issue/KT-83678)
>
> **组件**：Gradle
>
> **不兼容变更类型**：源码
>
> **简要摘要**：在 Kotlin 2.3.20 中，`kotlin.publishJvmEnvironmentAttribute` 属性已被弃用。
> 此属性允许禁用多平台库发布时的 `org.gradle.jvm.environment` 特性。
> 从 Kotlin 2.0.20 开始，默认发布 `org.gradle.jvm.environment` 以确保常规依赖项解析。
>
> **弃用周期**：
>
> - 2.3.20：报告警告
> - 2.4.0：移除该属性

### 弃用 `CleanableStore` 接口和 `CleanDataTask` 类 {id="deprecate-cleanablestore-interface-and-cleandatatask-class"}

> **问题**：[KT-78104](https://youtrack.jetbrains.com/issue/KT-78104)
>
> **组件**：Gradle
>
> **不兼容变更类型**：源码
>
> **简要摘要**：`CleanableStore` 接口和 `CleanDataTask` 类已被弃用，因为它们不再被使用。
>
> **弃用周期**：
>
> - 2.3.20：报告警告
> - 2.4.20：将警告提升为错误

### 弃用 `kotlin.kmp.isolated-projects.support` Gradle 属性 {id="deprecate-kotlin-kmp-isolated-projects-support-gradle-property"}

> **问题**：[KT-79257](https://youtrack.jetbrains.com/issue/KT-79257)
>
> **组件**：Gradle
>
> **不兼容变更类型**：源码
>
> **简要摘要**：由于多平台项目默认与隔离项目兼容，且没有其他选项，因此 `kotlin.kmp.isolated-projects.support` Gradle 属性已被弃用。
>
> **弃用周期**：
>
> - 2.3.20：报告警告

### 弃用 `kotlin.mpp.enableKotlinToolingMetadataArtifact` Gradle 属性 {id="deprecate-kotlin-mpp-enablekotlintoolingmetadataartifact-gradle-property"}

> **问题**：[KT-79924](https://youtrack.jetbrains.com/issue/KT-79924)
>
> **组件**：Gradle
>
> **不兼容变更类型**：源码
>
> **简要摘要**：由于多平台项目现在始终生成 `kotlin-tooling-metadata.json` 构件，因此 `kotlin.mpp.enableKotlinToolingMetadataArtifact` Gradle 属性已被弃用。
>
> **弃用周期**：
>
> - 2.3.20：报告警告
> - 2.4.0：移除支持

### 弃用 `LanguageSettings.enableLanguageFeature` DSL {id="deprecate-languagesettings-enablelanguagefeature-dsl"}

> **问题**：[KT-82323](https://youtrack.jetbrains.com/issue/KT-82323)，[KT-82847](https://youtrack.jetbrains.com/issue/KT-82847)
>
> **组件**：Gradle
>
> **不兼容变更类型**：源码
>
> **简要摘要**：`LanguageSettings.enableLanguageFeature` DSL 暴露了一个仅用于 Kotlin 编译器测试的内部编译器配置。因此，该 DSL 已被弃用。
>
> **弃用周期**：
>
> - 2.3.20：在使用 `LanguageSettings.enableLanguageFeature` 时报告警告
> - 2.4.0：将警告提升为错误

### 弃用“进程外”编译器执行策略 {id="deprecate-out-of-process-compiler-execution-strategy"}

> **问题**：[KT-83125](https://youtrack.jetbrains.com/issue/KT-83125)
>
> **组件**：Gradle
>
> **不兼容变更类型**：源码
>
> **简要摘要**：“进程外”[编译器执行策略](compiler-execution-strategy.md)不受[构建工具 API](build-tools-api.md) 支持，且是当前可用的最慢策略。在 Kotlin 2.3.20 中，该策略已被弃用，建议改用“守护进程”和“进程内”编译器执行策略。
>
> **弃用周期**：
>
> - 2.3.20：报告警告
> - 2.4.0：移除“进程外”编译器执行策略

## 构建工具移除 {id="build-tool-removal"}

### 移除对 Ant 的支持 {id="remove-support-for-ant"}

> **问题**：[KT-75875](https://youtrack.jetbrains.com/issue/KT-75875)
>
> **组件**：Ant
>
> **简要摘要**：Kotlin 2.3.0 移除了对 Ant 作为构建工具的支持。请改用 [Gradle](gradle.md) 或 [Maven](maven.md)。
>
> **弃用周期**：
>
> - 2.2.0：报告警告
> - 2.3.0：移除支持