[//]: # (title: Kotlin 2.3.20 最新变化)

<show-structure depth="1"/>

<web-summary>阅读 Kotlin 2.3.20 发行说明，涵盖新语言功能、Kotlin Multiplatform、JVM、Native、JS 和 Wasm 的更新，以及对 Gradle 和 Maven 的构建工具支持。</web-summary>

_[发布日期：2026 年 3 月 16 日](releases.md#release-history)_

<tldr>
    <p>有关问题修复版本 2.3.21 的详细信息，请参阅<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.21">更新日志</a></p>
</tldr>

Kotlin 2.3.20 现已发布！以下是本次发布的主要亮点：

* **Gradle**：[与 Gradle 9.3.0 的兼容性](#compatibility-with-gradle-9-3-0)以及 [Kotlin/JVM 编译默认使用 BTA](#kotlin-jvm-compilation-uses-build-tools-api-by-default)
* **Maven**：[简化 Kotlin 项目的设置](#simplified-setup-for-kotlin-projects)
* **Kotlin 编译器插件**：[Lombok 现已进入 Alpha 阶段](#lombok-is-now-alpha)，以及 [`kotlin.plugin.jpa` 插件中对 JPA 支持的改进](#improved-jpa-support-in-the-kotlin-plugin-jpa-plugin)
* **语言**：[支持基于名称的析构声明](#name-based-destructuring)
* **标准库**：[用于创建 `Map.Entry` 不可变副本的新 API](#new-api-for-creating-immutable-copies-of-map-entry)
* **Kotlin/Native**：[针对 C 和 Objective-C 库的新互操作模式](#new-interoperability-mode-for-c-or-objective-c-libraries)

> 有关 Kotlin 发布周期的信息，请参阅 [Kotlin 发布流程](releases.md)。
>
{style="tip"}

## 更新到 Kotlin 2.3.20 {id="update-to-kotlin-2-3-20"}

最新版本的 Kotlin 已包含在最新版本的 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 和 [Android Studio](https://developer.android.com/studio) 中。

要更新到新的 Kotlin 版本，请确保将您的 IDE 更新到最新版本，并在构建脚本中[将 Kotlin 版本更改](releases.md#update-to-a-new-kotlin-version)为 2.3.20。

## 新功能 {id=new-stable-features}
<primary-label ref="stable"/>

以下功能在本次发布中达到[稳定 (Stable)](components-stability.md#stability-levels-explained)状态：

<snippet id="simplified-setup-for-kotlin-projects-content">

<var name="id1" value="simplified-setup-for-kotlin-projects"/>

<var name="id2" value="simplified-setup-for-kotlin-projects-how-to-enable"/>

### 简化 Kotlin 项目的设置 {id="%id1%"}
<secondary-label ref="maven"/>

Kotlin 2.3.20 让在 Maven 项目中设置 Kotlin 变得更加容易。现在 Kotlin 支持自动配置源码根目录和 Kotlin 标准库。

使用新的配置后，当您使用 Maven 构建系统创建新的 Kotlin 项目或将 Kotlin 引入现有的 Java Maven 项目时，
无需在 POM 构建文件中手动指定源码根路径或添加 `kotlin-stdlib` 依赖项。

#### 如何启用 {id="%id2%"}

在您的 `pom.xml` 文件中，将 `<extensions>true</extensions>` 添加到 Kotlin Maven 插件的 `<build><plugins>` 部分：

```xml
<build>
    <plugins>
         <plugin>
             <groupId>org.jetbrains.kotlin</groupId>
             <artifactId>kotlin-maven-plugin</artifactId>
             <version>%kotlinVersion%</version>
             <extensions>true</extensions> <!-- Add this extension  -->
         </plugin>
    </plugins>
</build>
```

此处 `<extensions>` 选项的新特性包括：

* 如果 `src/main/kotlin` 和 `src/test/kotlin` 目录已存在但未在插件配置中指定，则将其注册为源码根目录。
* 如果尚未显式定义，则自动添加 `kotlin-stdlib` 依赖项。

您也可以选择停用自动添加 Kotlin 标准库的功能。为此，请在 `<properties>` 部分添加以下内容：

```xml
<project>
    <properties>
        <!-- Disable smart defaults via property -->
        <kotlin.smart.defaults.enabled>false</kotlin.smart.defaults.enabled>         
    </properties>
</project>
```

请注意，该属性不仅会禁用标准库的自动添加，还会禁用源码根路径的注册。
其他 `<extensions>` 功能不受影响。

有关配置 Kotlin Maven 项目的更多信息，请参阅[配置 Maven 项目](maven-configure-project.md)。

</snippet>

## 新功能 {id=new-experimental-features}
<primary-label ref="experimental-exp"/>

以下预览阶段功能在本次发布中提供。
这包括处于 [Beta](components-stability.md#stability-levels-explained)、[Alpha](components-stability.md#stability-levels-explained) 和[实验性 (Experimental)](components-stability.md#stability-levels-explained) 状态的功能：

* [编译器：Lombok 现已进入 Alpha 阶段](#lombok-is-now-alpha)
* [语言：基于名称的析构](#name-based-destructuring)
* [标准库：用于创建 `Map.Entry` 不可变副本的新 API](#new-api-for-creating-immutable-copies-of-map-entry)
* [Kotlin/Native：针对 C 或 Objective-C 库的新互操作模式](#new-interoperability-mode-for-c-or-objective-c-libraries)

<snippet id="lombok-is-now-alpha-content">

<var name="id3" value="lombok-is-now-alpha"/>

### Lombok 现已进入 Alpha 阶段 {id="%id3%"}
<primary-label ref="alpha"/>
<secondary-label ref="compiler"/>

Kotlin 1.5.20 引入了实验性的 [Lombok 编译器插件](lombok.md)，让您可以在混合使用 Kotlin 和 Java 代码的模块中生成并使用 [Java 的 Lombok 声明](https://projectlombok.org/)。

在 2.3.20 中，Lombok 编译器插件已晋升至 [Alpha](components-stability.md#stability-levels-explained) 阶段，因为我们计划让该功能达到生产就绪状态，但目前它仍处于开发阶段。

</snippet>

<snippet id="name-based-destructuring-content">

<var name="id4" value="name-based-destructuring"/>

<var name="id5" value="name-based-destructuring-how-to-enable"/>

### 基于名称的析构 {id="%id4%"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="language"/>

Kotlin 2.3.20 引入了*基于名称的析构声明*，
它将变量与属性名称进行匹配，而不是依赖基于位置的 `componentN()` 函数。

此前，[析构声明](destructuring-declarations.md)使用的是基于位置的析构：

```kotlin
data class User(val username: String, val email: String)

fun main() {
    val user = User("alice", "alice@example.com")

    val (email, username) = user

    println(email)
    // alice

    println(username)
    // alice@example.com
}
```
{kotlin-runnable="true"}

在此示例中，由于析构依赖于 `componentN()` 函数的顺序，`email` 接收了 `username` 的值，而 `username` 接收了 `email` 的值。

从 Kotlin 2.3.20 开始，您可以使用基于名称的析构，其中每个变量均按名称引用属性：

```kotlin
fun main() {
    val user = User("alice", "alice@example.com")

    // Uses name-based destructuring with explicit form
    (val mail = email, val name = username) = user

    println(name)
    // alice

    println(mail)
    // alice@example.com
}
```

基于名称的析构是[实验性的](components-stability.md#stability-levels-explained)。
您可以使用 `-Xname-based-destructuring` 编译器选项来控制编译器如何解释析构声明。

它具有以下模式：

* `only-syntax`：启用显式形式的基于名称的析构，而不改变现有析构声明的行为。
* `name-mismatch`：当数据类中的基于位置的析构使用的变量名称与属性名称不匹配时报告警告。
* `complete`：启用带圆括号的简写形式基于名称的析构，并继续通过方括号语法支持基于位置的析构。

如果使用 `complete` 模式，带圆括号的简写析构语法会将变量与属性名称进行匹配，而不再依赖位置：

```kotlin
val (email, username) = user
```
#### 如何启用 {id="%id5%"}

要在项目中使用基于名称的析构，请将编译器选项添加到您的构建配置文件中：

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xname-based-destructuring=only-syntax")
    }
}
```

</tab> 
<tab title="Maven" group-key="maven">

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-Xname-based-destructuring=only-syntax</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab> 
</tabs>

选择加入基于名称的析构还会引入使用方括号进行基于位置析构的新语法：

```kotlin
// Uses explicit position-based destructuring
val [username, email] = user
```

我们计划逐步过渡到默认使用基于名称匹配的析构声明，同时通过新的方括号语法保留基于位置的析构。

有关更多信息，请参阅该功能的 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0438-name-based-destructuring.md)。

欢迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-19627) 中向我们提供反馈。

</snippet>

<snippet id="new-api-for-creating-immutable-copies-of-map-entry-content">

<var name="id6" value="new-api-for-creating-immutable-copies-of-map-entry"/>

### 用于创建 `Map.Entry` 不可变副本的新 API {id="%id6%"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin 2.3.20 引入了 `Map.Entry.copy()` 扩展函数，用于创建 [`Map.Entry`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-map/-entry/) 的不可变副本。
该函数允许您在修改 Map 之后，通过先复制条目来复用从 [`Map.entries`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-map/entries.html) 获取的条目。

`Map.Entry.copy()` 处于[实验性](components-stability.md#stability-levels-explained)阶段。
如需选用，请使用 `@OptIn(ExperimentalStdlibApi::class)` 注解或编译器选项：

```bash
-opt-in=kotlin.ExperimentalStdlibApi
```

以下是使用 `Map.Entry.copy()` 从可变 Map 中移除条目的示例：

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
    val map = mutableMapOf(1 to 1, 2 to 2, 3 to 3, 4 to 4)

    val toRemove = map.entries
        .filter { it.key % 2 == 0 }
        .map { it.copy() }

    map.entries.removeAll(toRemove)

    println("map = $map")
    // map = {1=1, 3=3}
}
```

</snippet>

<snippet id="new-interoperability-mode-for-c-or-objective-c-libraries-content">

<var name="id7" value="new-interoperability-mode-for-c-or-objective-c-libraries"/>

<var name="id8" value="new-interoperability-mode-for-c-or-objective-c-libraries-how-to-enable"/>

<var name="id9" value="new-interoperability-mode-for-c-or-objective-c-libraries-report-your-results"/>

### 针对 C 或 Objective-C 库的新互操作模式 {id="%id7%"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="native"/>

如果您在 Kotlin Multiplatform (KMP) 库或应用程序中使用了 C 或 Objective-C 库，我们邀请您测试新的互操作模式并分享测试结果。

通常情况下，Kotlin/Native 支持将 C 和 Objective-C 库导入 Kotlin。
然而，对于 KMP 库，此功能目前[受到](native-lib-import-stability.md#stability-of-c-and-objective-c-library-import)与较旧编译器版本之间的 KMP 兼容性问题的影响。

换句话说，如果您发布了使用某个 Kotlin 版本编译的 KMP 库，导入 C 或 Objective-C 库可能会导致无法在采用较早 Kotlin 版本的项目中使用该 Kotlin 库。

为了解决这一问题以及其他问题，Kotlin 团队一直在重构底层使用的互操作机制。
从 Kotlin 2.3.20 开始，您可以通过编译器选项试用新模式。

#### 如何启用 {id="%id8%"}

1. 在您的 Gradle 构建文件中，检查是否存在 `cinterops {}` 块或 `pod()` 依赖项。
   如果存在，则表示您的项目使用了 C 或 Objective-C 库。

2. 确保您的项目使用 `2.3.20` 或更高版本。
3. 在同一个构建文件中，将 `-Xccall-mode` 编译器选项添加到 cinterop 工具调用中：

   ```kotlin
   kotlin {
       targets.withType<org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget>().configureEach {
           compilations.configureEach {
               cinterops.configureEach {
                   extraOpts += listOf("-Xccall-mode", "direct")
               }
           }
       }
   }
   ```

4. 像往常一样通过运行单元测试、应用等来构建和测试您的项目。
   您还可以使用 `--continue` 选项允许 Gradle 在失败后继续执行任务，有助于一次性发现更多问题。

> **切勿**发布使用新互操作模式编译的库，因为该功能仍处于[实验性](components-stability.md#stability-levels-explained)阶段。
>
{style="warning"}

#### 反馈您的测试结果 {id="%id9%"}

在大多数情况下，新的互操作模式应可作为直接替代方案。
我们计划最终将其默认启用。但为了实现这一目标，我们需要确保它尽可能良好地工作，并在广泛的项目中进行测试，因为：

* 某些 C 和 Objective-C 声明在新的模式下尚不受支持（主要是由于兼容性问题）。我们希望更好地了解这对实际项目造成的影响，并据此安排后续步骤的优先级。
* 可能存在错误或我们尚未考虑到的情况。测试包含大量相互交互特性的语言本身就极具挑战性，而测试语言之间的交互（且每种语言都拥有一套独特的特性集）则更是如此。

请协助我们检验实际项目并找出有挑战性的用例。
无论您是否遇到任何问题，欢迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-83218) 的评论中分享您的测试结果。

</snippet>

## 语言 {id="language"}

Kotlin 2.3.20 添加了基于名称的析构声明，它将变量与属性名称进行匹配，而不是依赖位置。
它还对带有上下文形参的声明的重载解析进行了更改。

### 上下文形参的重载解析变更 {id="changes-to-overload-resolution-for-context-parameters"}
<secondary-label ref="language"/>

Kotlin 2.3.20 对带有上下文形参的声明的重载解析引入了变更。

此前，重载解析将带有上下文形参的声明视为比不带上下文形参的声明更具体（more specific）。

从 Kotlin 2.3.20 开始，该规则不再适用，从而使重载选择更加一致。
因此，当重载仅因上下文形参而异时，先前可以解析的调用现在会变得模棱两可，从而导致编译错误。
在这些情况下，编译器会针对潜在的歧义发出警告。

示例如下：

```kotlin
class Logger {
    fun info(msg: String) = println("INFO: $msg")
}

fun saveUser(id: Int) {
    println("Saving user $id (no logger)")
}

// Reports a warning: Contextual declaration is shadowed
context(logger: Logger)
fun saveUser(id: Int) {
    logger.info("Saving user $id")
}

fun main() {
    val logger = Logger()

    context(logger) {
        // Reports an ambiguity error in 2.3.20
        saveUser(1)
    }
}
```

此外，Kotlin 2.3.20 将 `kotlin.context` 重载的数量从 22 个减少到 6 个，以减少在解析和代码补全过程中过多的重载候选。

### 基于名称的析构 {id="language-name-based-destructuring"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="language"/>

Kotlin 2.3.20 引入了*基于名称的析构声明*，
它将变量与属性名称进行匹配，而不是依赖基于位置的 `componentN()` 函数。

此前，[析构声明](destructuring-declarations.md)使用的是基于位置的析构：

```kotlin
data class User(val username: String, val email: String)

fun main() {
    val user = User("alice", "alice@example.com")

    val (email, username) = user

    println(email)
    // alice

    println(username)
    // alice@example.com
}
```
{kotlin-runnable="true"}

在此示例中，由于析构依赖于 `componentN()` 函数的顺序，`email` 接收了 `username` 的值，而 `username` 接收了 `email` 的值。

从 Kotlin 2.3.20 开始，您可以使用基于名称的析构，其中每个变量均按名称引用属性：

```kotlin
fun main() {
    val user = User("alice", "alice@example.com")

    // Uses name-based destructuring with explicit form
    (val mail = email, val name = username) = user

    println(name)
    // alice

    println(mail)
    // alice@example.com
}
```

基于名称的析构是[实验性的](components-stability.md#stability-levels-explained)。
您可以使用 `-Xname-based-destructuring` 编译器选项来控制编译器如何解释析构声明。

它具有以下模式：

* `only-syntax`：启用显式形式的基于名称的析构，而不改变现有析构声明的行为。
* `name-mismatch`：当数据类中的基于位置的析构使用的变量名称与属性名称不匹配时报告警告。
* `complete`：启用带圆括号的简写形式基于名称的析构，并继续通过方括号语法支持基于位置的析构。

如果使用 `complete` 模式，带圆括号的简写析构语法会将变量与属性名称进行匹配，而不再依赖位置：

```kotlin
val (email, username) = user
```
#### 如何启用 {id="language-name-based-destructuring-how-to-enable"}

要在项目中使用基于名称的析构，请将编译器选项添加到您的构建配置文件中：

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xname-based-destructuring=only-syntax")
    }
}
```

</tab> 
<tab title="Maven" group-key="maven">

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-Xname-based-destructuring=only-syntax</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab> 
</tabs>

选择加入基于名称的析构还会引入使用方括号进行基于位置析构的新语法：

```kotlin
// Uses explicit position-based destructuring
val [username, email] = user
```

我们计划逐步过渡到默认使用基于名称匹配的析构声明，同时通过新的方括号语法保留基于位置的析构。

有关更多信息，请参阅该功能的 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0438-name-based-destructuring.md)。

欢迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-19627) 中向我们提供反馈。

## 标准库 {id="standard-library"}

Kotlin 2.3.20 包含了针对标准库的新实验性功能。

### 用于创建 `Map.Entry` 不可变副本的新 API {id="standard-library-new-api-for-creating-immutable-copies-of-map-entry"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin 2.3.20 引入了 `Map.Entry.copy()` 扩展函数，用于创建 [`Map.Entry`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-map/-entry/) 的不可变副本。
该函数允许您在修改 Map 之后，通过先复制条目来复用从 [`Map.entries`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-map/entries.html) 获取的条目。

`Map.Entry.copy()` 处于[实验性](components-stability.md#stability-levels-explained)阶段。
如需选用，请使用 `@OptIn(ExperimentalStdlibApi::class)` 注解或编译器选项：

```bash
-opt-in=kotlin.ExperimentalStdlibApi
```

以下是使用 `Map.Entry.copy()` 从可变 Map 中移除条目的示例：

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
    val map = mutableMapOf(1 to 1, 2 to 2, 3 to 3, 4 to 4)

    val toRemove = map.entries
        .filter { it.key % 2 == 0 }
        .map { it.copy() }

    map.entries.removeAll(toRemove)

    println("map = $map")
    // map = {1=1, 3=3}
}
```

## Kotlin 编译器插件 {id="kotlin-compiler-plugins"}

Kotlin 2.3.20 为 Lombok 和 `kotlin.plugin.jpa` 编译器插件带来了重要更新。

### `kotlin.plugin.jpa` 插件中对 JPA 支持的改进 {id="improved-jpa-support-in-the-kotlin-plugin-jpa-plugin"}
<secondary-label ref="compiler"/>

除了应用现有的 [`no-arg`](no-arg-plugin.md) 编译器插件外，`kotlin.plugin.jpa` 插件现在还会自动应用带有新增内置 JPA 预设的 [`all-open`](all-open-plugin.md) 编译器插件。

此前，使用 `kotlin("plugin.jpa")` 仅会启用带有 JPA 预设的 `no-arg` 插件。

在此版本中，我们改进了 `kotlin.plugin.jpa` 预设，以便自动配置 `all-open` 插件。
这确保了延迟关联能够按预期工作，而不会导致预加载并触发额外的查询。

从 Kotlin 2.3.20 开始：

* `all-open` 编译器插件提供了 JPA 预设。
* Gradle `org.jetbrains.kotlin.plugin.jpa` 插件会自动应用启用了 JPA 预设的 `org.jetbrains.kotlin.plugin.all-open` 插件。
* [Maven JPA 设置](kotlin-jpa-plugin.md#maven)默认启用带有 JPA 预设的 `all-open`。（IntelliJ IDEA 从 2026.1 版本开始提供支持。）
* Maven 依赖项 `org.jetbrains.kotlin:kotlin-maven-noarg` 现在隐式包含 `org.jetbrains.kotlin:kotlin-maven-allopen`，因此您不再需要在 `<plugin><dependencies>` 块中显式添加它。

因此，使用以下注解标记的 JPA 实体会自动被视为 `open`，并在无需额外配置的情况下获得无参构造函数：

* `javax.persistence.Entity`
* `javax.persistence.Embeddable`
* `javax.persistence.MappedSuperclass`
* `jakarta.persistence.Entity`
* `jakarta.persistence.Embeddable`
* `jakarta.persistence.MappedSuperclass`

这一变更简化了构建配置，并改善了将 Kotlin 与 JPA 框架结合使用时的开箱即用体验。

> 即将发布的 [IntelliJ IDEA 2026.1](https://www.jetbrains.com/idea/whatsnew/) 会在项目中设置 Kotlin 时自动配置 `kotlin.plugin.jpa` 插件。IDE 会提供快速修复，用于添加该插件并移除所有冗余的 `no-arg` 构造函数声明。
>
{style="tip"}

### Lombok 现已进入 Alpha 阶段 {id="compiler-lombok-is-now-alpha"}
<primary-label ref="alpha"/>
<secondary-label ref="compiler"/>

Kotlin 1.5.20 引入了实验性的 [Lombok 编译器插件](lombok.md)，让您可以在混合使用 Kotlin 和 Java 代码的模块中生成并使用 [Java 的 Lombok 声明](https://projectlombok.org/)。

在 2.3.20 中，Lombok 编译器插件已晋升至 [Alpha](components-stability.md#stability-levels-explained) 阶段，因为我们计划让该功能达到生产就绪状态，但目前它仍处于开发阶段。

## Kotlin/JVM {id="kotlin-jvm"}

Kotlin 2.3.20 对 Java 互操作性引入了多项改进。编译器现在可以识别 Vert.x 的 `@Nullable` 注解以进行为 null 性检查。
此版本还增加了对 Java `@Unmodifiable` 和 `@UnmodifiableView` 注解的支持，以便在 Kotlin 中将带有注解的集合视为只读。

### 支持 Vert.x `@Nullable` 注解 {id="support-for-vert-x-nullable-annotation"}
<secondary-label ref="jvm"/>

Kotlin 2.3.20 增加了对 [`io.vertx.codegen.annotations.Nullable`](https://www.javadoc.io/doc/io.vertx/vertx-codegen/3.5.0/io/vertx/codegen/annotations/Nullable.html) 注解的支持。
编译器现在可以识别该注解，并在默认情况下将为 null 性不匹配报告为警告。

如需强制执行严格的为 null 性检查并将这些警告升级为错误，请将以下编译器选项添加到您的构建文件中：

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
// build.gradle(.kts)
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xnullability-annotations=@io.vertx.codegen.annotations:strict")
    }
}
```
</tab>
<tab title="Maven" group-key="maven">

```xml
<!-- pom.xml -->
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-Xnullability-annotations=@io.vertx.codegen.annotations:strict</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```
</tab>
</tabs>

### 支持 Java 不可修改集合注解 {id="support-for-java-unmodifiable-collection-annotations"}
<secondary-label ref="jvm"/>

Kotlin 2.3.20 增加了对 [`org.jetbrains.annotations.Unmodifiable`](https://javadoc.io/doc/org.jetbrains/annotations/20.1.0/org/jetbrains/annotations/Unmodifiable.html) 和 [`org.jetbrains.annotations.UnmodifiableView`](https://javadoc.io/doc/org.jetbrains/annotations/24.0.1/org/jetbrains/annotations/UnmodifiableView.html) Java 注解的支持。

从 Kotlin 2.3.20 开始，从带有这些注解的 Java 声明返回的集合在 Kotlin 中将被视为只读。将其赋值给可变集合类型将导致类型不匹配警告。该警告计划在 Kotlin 2.5.0 中升级为错误。

示例如下：

```java
// Java
public class Java {
    public static @UnmodifiableView List<Object> unmodifiableView() {
        return List.of();
    }

    public static @Unmodifiable List<Object> unmodifiable() {
        return List.of();
    }
}
```

```kotlin
// Kotlin

fun main() {
    // Reports a warning: Java type mismatch
    val mutableView: MutableList<Any> = Java.unmodifiableView()
    val mutableCopy: MutableList<Any> = Java.unmodifiable()
}
```

## Kotlin/Native {id="kotlin-native"}

Kotlin 2.3.20 引入了针对 C 和 Objective-C 库的新实验性互操作模式、交叉编译检查器，以及用于在 Kotlin/Native 项目中禁用编译缓存的新 DSL。

### 交叉编译检查器 {id="cross-compilation-checker"}
<secondary-label ref="native"/>

Kotlin 2.3.20 引入了一种用于确定给定目标是否支持交叉编译的方法。
这对于跟踪编译任务状态的第三方插件非常有用。

通常，Kotlin/Native 允许交叉编译，这意味着任何受支持的主机都可以为受支持的目标生成 `.klib` 工件。
但是，如果您的项目使用了 [cinterop 依赖项](native-c-interop.md)，则针对 Apple 目标的工件生成仍会受到限制。

新的 `crossCompilationSupported` API 现在可以检查是否支持交叉编译：目标应由主机管理器启用，且目标的任何编译均不得涉及 cinterop 依赖项。
该检查器默认启用。

有关受支持目标和主机的更多信息，请参阅 [Kotlin/Native 文档](native-target-support.md)。

### 用于禁用编译缓存的新 DSL {id="new-dsl-for-disabling-compilation-cache"}
<secondary-label ref="native"/>

Kotlin 2.3.20 附带了一个新的 DSL，用于在 Kotlin/Native 项目中禁用编译缓存。
其目的是让禁用缓存的决策更加审慎且明确。

由于禁用缓存会显著降低 Kotlin/Native 的构建速度，因此它应仅作为临时措施在特殊情况下使用。
这就是为什么禁用缓存现在与特定的 Kotlin 版本绑定，并且必须包含一个作为文档记录的原因说明。

如果您确实需要在项目中禁用编译缓存，请按如下方式更新 Gradle 构建文件中的 `binaries {}` 块：

```kotlin
kotlin {
    listOf(
        iosX64(),
        iosArm64(),
        iosSimulatorArm64()
    ).forEach {
        // Specify your binary kind
        it.binaries.framework {
            baseName = "CacheKind"
            isStatic = true

            // Disable cache with the new DSL
            disableNativeCache(
                 version = DisableCacheInKotlinVersion.2_3_0, 
                 reason = "Cache bug",
                 issue = URI("https://youtrack.com/YY-1111")
            )
        }
    }
}
```

* `version` – 禁用编译缓存所对应的 Kotlin 版本。
* `reason`（必填）– 禁用编译缓存的原因。
* `issue`（可选）– 指向问题跟踪器中相应问题的 URL。

新的 DSL 取代了已弃用的 `kotlin.native.cacheKind` Gradle 属性。您可以放心地将其从 `gradle.properties` 文件中移除。

有关提高编译时间的更多技巧，请参阅 [Kotlin/Native 文档](native-improving-compilation-time.md)。

### 针对 C 或 Objective-C 库的新互操作模式 {id="native-new-interoperability-mode-for-c-or-objective-c-libraries"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="native"/>

如果您在 Kotlin Multiplatform (KMP) 库或应用程序中使用了 C 或 Objective-C 库，我们邀请您测试新的互操作模式并分享测试结果。

通常情况下，Kotlin/Native 支持将 C 和 Objective-C 库导入 Kotlin。
然而，对于 KMP 库，此功能目前[受到](native-lib-import-stability.md#stability-of-c-and-objective-c-library-import)与较旧编译器版本之间的 KMP 兼容性问题的影响。

换句话说，如果您发布了使用某个 Kotlin 版本编译的 KMP 库，导入 C 或 Objective-C 库可能会导致无法在采用较早 Kotlin 版本的项目中使用该 Kotlin 库。

为了解决这一问题以及其他问题，Kotlin 团队一直在重构底层使用的互操作机制。
从 Kotlin 2.3.20 开始，您可以通过编译器选项试用新模式。

#### 如何启用 {id="native-new-interoperability-mode-for-c-or-objective-c-libraries-how-to-enable"}

1. 在您的 Gradle 构建文件中，检查是否存在 `cinterops {}` 块或 `pod()` 依赖项。
   如果存在，则表示您的项目使用了 C 或 Objective-C 库。

2. 确保您的项目使用 `2.3.20` 或更高版本。
3. 在同一个构建文件中，将 `-Xccall-mode` 编译器选项添加到 cinterop 工具调用中：

   ```kotlin
   kotlin {
       targets.withType<org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget>().configureEach {
           compilations.configureEach {
               cinterops.configureEach {
                   extraOpts += listOf("-Xccall-mode", "direct")
               }
           }
       }
   }
   ```

4. 像往常一样通过运行单元测试、应用等来构建和测试您的项目。
   您还可以使用 `--continue` 选项允许 Gradle 在失败后继续执行任务，有助于一次性发现更多问题。

> **切勿**发布使用新互操作模式编译的库，因为该功能仍处于[实验性](components-stability.md#stability-levels-explained)阶段。
>
{style="warning"}

#### 反馈您的测试结果 {id="native-new-interoperability-mode-for-c-or-objective-c-libraries-report-your-results"}

在大多数情况下，新的互操作模式应可作为直接替代方案。
我们计划最终将其默认启用。但为了实现这一目标，我们需要确保它尽可能良好地工作，并在广泛的项目中进行测试，因为：

* 某些 C 和 Objective-C 声明在新的模式下尚不受支持（主要是由于兼容性问题）。我们希望更好地了解这对实际项目造成的影响，并据此安排后续步骤的优先级。
* 可能存在错误或我们尚未考虑到的情况。测试包含大量相互交互特性的语言本身就极具挑战性，而测试语言之间的交互（且每种语言都拥有一套独特的特性集）则更是如此。

请协助我们检验实际项目并找出有挑战性的用例。
无论您是否遇到任何问题，欢迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-83218) 的评论中分享您的测试结果。

## Kotlin/Wasm {id="kotlin-wasm"}

Kotlin 2.3.20 提高了字符串操作的性能、编译时间并优化了内存使用情况。
它还添加了对实验性 `@nativeInvoke` 注解的支持，该注解允许您像调用 JavaScript 函数一样调用 Kotlin 对象或类。

### 提升字符串性能 {id="improved-string-performance"}
<secondary-label ref="wasm"/>

Kotlin/Wasm 现在针对 `kotlin.String` 值的操作使用 JS String 内置函数。
这使得 Kotlin/Wasm 能够从支持该提案的浏览器和 Wasm 运行时中的 JavaScript 引擎字符串优化中获益。
该优化适用于字符串拼接、字符串插值、`StringBuilder.append()` 以及数字到字符串的转换等操作。

它带来了以下提升：

* 在针对性基准测试中，字符串插值速度最高提升 4.6 倍。
* 在 [KotlinConf 应用程序](https://github.com/JetBrains/kotlinconf-app)构建中，Wasm 二进制文件大小缩减约 5%。
* 在所有 Wasm 基准测试中，中位数性能提升约 1%。
* 在大量使用追加操作的负载下，`StringBuilder.append()` 以及 `kotlin.String` 实例的拼接速度提升至少 20%。

### 改进编译时间并优化内存 {id="improved-compilation-time-and-memory-optimizations"}
<secondary-label ref="wasm"/>

Kotlin 2.3.20 添加了编译器优化，显著降低了编译期间的内存消耗，尤其是在大型项目中。
这些优化还改善了增量构建的性能。

在我们的测试中，观察到全新构建时间缩减了 65%，增量构建时间缩减了 21%。

### 支持 `@nativeInvoke` 注解 {id="support-for-nativeinvoke-annotation"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="wasm"/>

Kotlin 2.3.20 引入了针对 `wasmJs` 目标的 `@nativeInvoke` 注解支持。
此注解允许您将 Kotlin 对象或类视为 JavaScript 中的函数。
它旨在将 `external` 声明（类或接口）的成员函数标记为 JavaScript 对象的“调用运算符 (invoke operator)”。

当您对某个函数添加注解后，在 Kotlin 中对该函数的每次调用都将转换为对 JavaScript 对象本身的直接调用：

```kotlin
import kotlin.js.nativeInvoke

@OptIn(ExperimentalWasmJsInterop::class)
external class JsAction {
    @nativeInvoke
    operator fun invoke(data: String)
}

fun main() {
    val action = JsAction() 
    action("Run task")
}
```

这是在 Kotlin/Wasm 与 JavaScript 之间设计出稳定的互操作性之前的临时解决方案。
它可能会在未来的版本中被修改或移除，并且当您使用它时编译器会报告警告。

有关 Kotlin/Wasm 与 JavaScript 互操作性的更多信息，请参阅[与 JavaScript 的互操作性](wasm-js-interop.md)。

## Kotlin/JS {id="kotlin-js"}

Kotlin 2.3.20 使得从 TypeScript 实现 Kotlin 接口成为可能，并引入了对 SWC 编译平台的实验性支持。

### 从 JavaScript/TypeScript 实现 Kotlin 接口 {id="implementing-kotlin-interfaces-from-javascript-typescript"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="js"/>

Kotlin 2.3.20 解除了在 JavaScript/TypeScript 端实现 Kotlin 接口的限制。此前，只能将 Kotlin 接口作为 TypeScript 接口导出到 TypeScript；禁止从 TypeScript 实现它们。

现在，您可以按以下方式实现任何 Kotlin 接口：

```kotlin
// Kotlin
@JsExport
interface DataProcessor {
    suspend fun process(): String
}

@JsExport
fun registerProcessor(processor: DataProcessor) { ... }
```

```TypeScript
// TypeScript
import { DataProcessor, registerProcessor } from "my-kmp-library"

class JsonProcessor implements DataProcessor {
    readonly [DataProcessor.Symbol] = true

    async process(): Promise<string> {
        return "processed JSON data"
    }
}

registerProcessor(new JsonProcessor())
```

也可以从 TypeScript 复用 Kotlin 的默认实现。
即使 TypeScript 没有接口默认实现的概念，您也可以通过委托给 `DefaultImpls` 对象来解决该问题：

```kotlin
// Kotlin
@JsExport
interface Logger {
    fun log(): String = "[INFO] Default log entry"
    val prefix: String get() = "LOG"
}
```

```TypeScript
// TypeScript
import { Logger, acceptLogger } from "my-kmp-library"

class ConsoleLogger implements Logger {
    readonly [Logger.Symbol] = true

    // Delegates to the default method implementation
    log(): string {
        return Logger.DefaultImpls.log(this);
    }

    // Delegates to the default property implementation
    get prefix(): string {
        return Logger.DefaultImpls.prefix.get(this);
    }
}

acceptLogger(new ConsoleLogger())
```

#### 如何启用 {id="how-to-enable-implementing-interfaces-from-typescript"}

在您的构建文件中，添加新的编译器选项：

```kotlin
kotlin { 
    js {
        // ...
        generateTypeScriptDefinitions()
        compilerOptions {
            freeCompilerArgs.add("-Xenable-implementing-interfaces-from-typescript")
        }
    }
}
```

有关更多信息，请参阅 [`@JsExport` 注解](js-to-kotlin-interop.md#jsexport-annotation)。

### 支持 SWC 编译平台 {id="support-for-swc-compilation-platform"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="js"/>

从 Kotlin 2.3.20 开始，Kotlin/JS 支持 [SWC](https://swc.rs/) 编译平台。
它有助于将较新版本的 JavaScript/TypeScript 代码转译为更旧且更兼容的 JavaScript 代码。

将代码转换工作委托给外部工具使我们能够减少 Kotlin/JS 编译器生成的变体数量，并加快编译器现代化进程，仅专注于支持最新的 JavaScript 功能。
目前，最新支持的 ECMAScript 版本仍为 `es2015`。

此外，委托转译工作使我们能够改进[内联 JavaScript](js-interop.md#inline-javascript) 功能。
目前，它仅支持 ES5 语法（这将在 2.4.0 中更改）。
在以较低版本为目标的同时支持较新语法将极具挑战性，因为这需要编译器转译内联 JS 块本身的 JS 代码。
借助 SWC，我们将能够添加现代 JS 语法，并且该工具会将代码转译为最终用户版本所需的语法。

迁移到 SWC 还让您有机会在 Kotlin Gradle 插件内部实现基于 [browserlist](https://browsersl.ist/) 的 DSL。
这允许您声明目标浏览器或环境，而不是特定的 JS 版本。

#### 如何启用 {id="how-to-enable-swc-compilation"}

在您的 `gradle.properties` 文件中，添加以下选项：

```properties
kotlin.js.delegated.transpilation=true
```

我们计划在未来的 Kotlin 版本中使通过 SWC 进行转译达到稳定状态。
在其成为默认设置后，编译多个 JS 目标的功能将完全从 Kotlin/JS 编译器委托给转译器。

有关 SWC 平台的更多信息，请参阅官方[文档](https://swc.rs/docs/getting-started)。

## Gradle {id="gradle"}

Kotlin 2.3.20 兼容新版本的 Gradle，并包含对 Kotlin Gradle 插件中 Kotlin/JVM 编译的更改。

### 与 Gradle 9.3.0 的兼容性 {id="compatibility-with-gradle-9-3-0"}
<secondary-label ref="gradle"/>

Kotlin 2.3.20 完全兼容 Gradle 7.6.3 至 9.3.0。您也可以使用截至最新的 Gradle 发行版。
但请注意，这样做可能会导致弃用警告，并且某些新的 Gradle 功能可能无法正常工作。

### KGP 中二进制兼容性验证的改进 {id="improvements-to-binary-compatibility-validation-in-kgp"}
<secondary-label ref="gradle"/>

Kotlin 2.2.0 首次在 [Kotlin Gradle 插件中支持二进制兼容性验证](gradle-binary-compatibility-validation.md)。Kotlin 2.3.20 增加了两项改进。

首先，二进制兼容性验证的 Gradle 任务名称中不再包含 "Legacy"。
我们做出这一变更的原因是旧的命名约定让 Kotlin 开发者感到困惑：

| 旧名称 | 新名称 |
|--------------------|--------------------------|
| `checkLegacyAbi` | `checkKotlinAbi` |
| `updateLegacyAbi` | `updateKotlinAbi` |
| `dumpLegacyAbi` | `internalDumpKotlinAbi` |

旧的任务名称在 Kotlin 2.3.20 中仍然存在，以方便过渡到新名称。

其次，如果在项目中启用了二进制兼容性验证，现在当您运行 `check` 任务时，Gradle 会自动运行 `checkKotlinAbi` 任务。
此前，尽管 `check` 任务应该运行所有验证任务，但 Gradle 并不会运行 `checkKotlinAbi` 任务。
这导致了 Gradle 项目中的行为不一致。

### Kotlin/JVM 编译默认使用构建工具 API {id="kotlin-jvm-compilation-uses-build-tools-api-by-default"}
<primary-label ref="experimental-general"/>
<secondary-label ref="gradle"/>

在 Kotlin 2.3.20 中，Kotlin Gradle 插件中的 Kotlin/JVM 编译默认使用[构建工具 API](build-tools-api.md)
(BTA)。内部编译基础架构的这一变更使得能够更快地为 Kotlin 编译器开发构建工具支持。

如果您发现任何问题，请在我们的[问题跟踪器](https://youtrack.jetbrains.com/newIssue?project=KT&summary=Kotlin+Gradle+plugin+BTA+migration+issue&description=Describe+the+problem+you+encountered+here.&c=tag+kgp-bta-migration)中分享您的反馈。

## Maven {id="maven"}

Kotlin 2.3.20 带来了一项重要更改，让设置 Maven 项目变得更加容易。

### 简化 Kotlin 项目的设置 {id="maven-simplified-setup-for-kotlin-projects"}
<secondary-label ref="maven"/>

Kotlin 2.3.20 让在 Maven 项目中设置 Kotlin 变得更加容易。现在 Kotlin 支持自动配置源码根目录和 Kotlin 标准库。

使用新的配置后，当您使用 Maven 构建系统创建新的 Kotlin 项目或将 Kotlin 引入现有的 Java Maven 项目时，
无需在 POM 构建文件中手动指定源码根路径或添加 `kotlin-stdlib` 依赖项。

#### 如何启用 {id="maven-simplified-setup-for-kotlin-projects-how-to-enable"}

在您的 `pom.xml` 文件中，将 `<extensions>true</extensions>` 添加到 Kotlin Maven 插件的 `<build><plugins>` 部分：

```xml
<build>
    <plugins>
         <plugin>
             <groupId>org.jetbrains.kotlin</groupId>
             <artifactId>kotlin-maven-plugin</artifactId>
             <version>%kotlinVersion%</version>
             <extensions>true</extensions> <!-- Add this extension  -->
         </plugin>
    </plugins>
</build>
```

此处 `<extensions>` 选项的新特性包括：

* 如果 `src/main/kotlin` 和 `src/test/kotlin` 目录已存在但未在插件配置中指定，则将其注册为源码根目录。
* 如果尚未显式定义，则自动添加 `kotlin-stdlib` 依赖项。

您也可以选择停用自动添加 Kotlin 标准库的功能。为此，请在 `<properties>` 部分添加以下内容：

```xml
<project>
    <properties>
        <!-- Disable smart defaults via property -->
        <kotlin.smart.defaults.enabled>false</kotlin.smart.defaults.enabled>         
    </properties>
</project>
```

请注意，该属性不仅会禁用标准库的自动添加，还会禁用源码根路径的注册。
其他 `<extensions>` 功能不受影响。

有关配置 Kotlin Maven 项目的更多信息，请参阅[配置 Maven 项目](maven-configure-project.md)。

## 构建工具 API {id="build-tools-api"}

Kotlin 2.3.20 为希望使用构建工具 API (BTA) 将其构建系统与 Kotlin 编译器集成的开发者引入了更多变更。

### 构建操作的改进 {id="improvements-to-build-operations"}
<secondary-label ref="bta"/>

在此版本中，BTA 改进了构建工具管理构建操作的方式。
构建操作允许构建工具与 Kotlin 编译器进行交互。
每个构建操作都是 [`BuildOperation`](https://github.com/JetBrains/kotlin/blob/v2.3.20/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/BuildOperation.kt#L25) 接口的实现。

现在，您可以使用 [`cancel()`](https://github.com/JetBrains/kotlin/blob/v2.3.20/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/BuildOperation.kt#L108) 函数取消实现了 [`CancellableBuildOperation`](https://github.com/JetBrains/kotlin/blob/v2.3.20/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/BuildOperation.kt#L94) 接口的构建操作。

`cancel()` 函数按“尽力而为 (best effort)”原则工作。这意味着该操作不保证一定会被取消。

例如：

```kotlin
val operation = toolchains.jvm.jvmCompilationOperationBuilder(sources, destination) {}

toolchains.createBuildSession().use {
    try {
        it.executeOperation(operation.build())
    } catch (e: OperationCancelledException) {
        println("Build operation has been cancelled.")
    }
}

// ...

// From another thread:
operation.cancel()
```

此外，构建操作现在更加稳健，因为您可以将其创建为一旦启动就无法更改的形式。为此，构建工具必须使用构建器模式：

1. 使用可变构建器配置对象。
2. 调用 [`build()`](https://github.com/JetBrains/kotlin/blob/v2.3.20/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/jvm/operations/JvmCompilationOperation.kt#L59) 函数创建该对象的不可变实例。

例如：

```kotlin
fun prepareBuildOperation(toolchains: KotlinToolchains, sources: List<Path>, destination: Path): JvmCompilationOperation {
    val builder = toolchains.jvm.jvmCompilationOperationBuilder(sources, destination)

    // Configure the operation using the builder
    builder.compilerArguments[CommonToolArguments.VERBOSE] = true
    builder[COMPILER_ARGUMENTS_LOG_LEVEL] = CompilerArgumentsLogLevel.ERROR

    // Return an immutable operation
    return builder.build()
}
```

### 跨构建工具的一致指标收集 {id="consistent-metric-collection-across-build-tools"}
<secondary-label ref="bta"/>

在 Kotlin 2.3.20 之前，构建指标基础设施主要围绕 Gradle 构建，这影响了基础设施的部分内容，例如指标名称。
此外，并非所有指标都适用于不同的[编译器执行策略](compiler-execution-strategy.md)。

在 Kotlin 2.3.20 中，BTA 为 JVM 提供了与构建工具无关的指标收集。
BTA 还引入了一套一致的指标，无论采用何种编译器执行策略。
特定于特定编译方法或编译器执行策略的指标仅在适用时报告。
例如，增量编译指标仅适用于增量构建，而守护进程特定的指标仅在使用 Kotlin 守护进程时可用。

构建工具现在可以为构建操作配置 [`BuildMetricsCollector`](https://github.com/JetBrains/kotlin/blob/v2.3.20/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/trackers/BuildMetricsCollector.kt#L16) 对象，以捕获构建指标，从而让用户深入了解构建性能：

```kotlin
val operation =
    kotlinToolchains.jvm.jvmCompilationOperationBuilder(sources, outputDirectory)
operation[BuildOperation.METRICS_COLLECTOR] = object : BuildMetricsCollector {
    override fun collectMetric(
        name: String,
        type: BuildMetricsCollector.ValueType,
        value: Long
    ) {
        // ...
    }
}
```

### 构建工具更轻松地配置编译器插件 {id="easier-configuration-of-compiler-plugins-by-build-tools"}
<secondary-label ref="bta"/>

在 Kotlin 2.3.20 中，BTA 为构建工具提供了一种新的、更简单的方式来配置编译器插件。
该方法允许构建工具将配置直接传播给其用户。

构建工具无需通过命令行使用实验性编译器选项来配置编译器插件，
而是可以使用 `kotlin.buildtools.api.arguments.CommonCompilerArguments.COMPILER_PLUGINS` 选项来配置表示编译器插件配置的对象列表：

```kotlin
import org.jetbrains.kotlin.buildtools.api.KotlinToolchains
import org.jetbrains.kotlin.buildtools.api.arguments.CompilerPlugin
import org.jetbrains.kotlin.buildtools.api.arguments.CompilerPluginOption
import org.jetbrains.kotlin.buildtools.api.arguments.CommonCompilerArguments.Companion.COMPILER_PLUGINS
import org.jetbrains.kotlin.buildtools.api.arguments.CompilerPlugin
import org.jetbrains.kotlin.buildtools.api.arguments.CompilerPluginOption
import org.jetbrains.kotlin.buildtools.api.jvm.JvmPlatformToolchain
import org.jetbrains.kotlin.buildtools.api.jvm.JvmPlatformToolchain.Companion.jvm
import org.jetbrains.kotlin.buildtools.api.jvm.operations.JvmCompilationOperation
import java.nio.file.Path

...

val toolchains: KotlinToolchains = ...
val jvmToolchain: JvmPlatformToolchain = toolchains.jvm
val operation: JvmCompilationOperation.Builder = jvmToolchain.jvmCompilationOperationBuilder(...)
val noArgPluginClasspath: List<Path> = ...
operation.compilerArguments[COMPILER_PLUGINS] = listOf(
    CompilerPlugin(
        pluginId = "org.jetbrains.kotlin.noarg",
        classpath = noArgPluginClasspath,
        rawArguments = listOf(CompilerPluginOption("annotation", "GenerateNoArgsConstructor")),
        orderingRequirements = emptySet(),
    )
)
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="Example code"}

## 破坏性变更与弃用 {id="breaking-changes-and-deprecations"}

本节重点介绍重要的破坏性变更和弃用。有关 Kotlin 2.3.0 和 2.3.20 中弃用的更多信息，请参阅[兼容性指南](compatibility-guide-23.md)。

* 在 Kotlin 2.3.20 中，Kotlin/Wasm 将模块初始化作为 Wasm 模块实例化的一部分来执行，而不是依赖外部 JavaScript 在随后调用 `_initialize()` 函数。
  这一变更使得 Kotlin/Wasm 更加独立，并为 [ES 模块集成提案](https://github.com/WebAssembly/esm-integration)做好了准备。

  如果您使用 [`@EagerInitialization`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-eager-initialization/) 注解，相关代码如果是在模块初始化完成之前运行，可能会失败。我们建议避免使用 `@EagerInitialization` 注解，除非您确实需要它。
* 实验性的上下文接收者 (context receivers) 不再受支持，已被[上下文形参](context-parameters.md)取代。
* 此版本推进了[基于 Intel 芯片的 Apple 目标的弃用周期](whatsnew2220.md#deprecation-of-x86-64-apple-targets)的下一步。从 Kotlin 2.3.20 开始，我们将弃用 `macosX64`、`tvosX64` 和 `watchosX64` 目标。我们计划在下一个 Kotlin 版本中完全移除对这些目标的支持。

  由于许多第三方库仍依赖于 `iosX64` 目标，我们暂时将其保留在第 3 支持层级。这意味着我们不保证 CI 测试，并且可能不会在不同编译器版本之间提供源代码和二进制兼容性。有关支持层级的更多信息，请参阅 [Kotlin/Native 目标支持](native-target-support.md)。
* 在 Kotlin 2.3.20 中，当通用源集和平台源集之间的依赖项解析存在差异时，Kotlin Multiplatform 中更严格的依赖项匹配可能会导致元数据编译失败。有关详细信息和变通方法，请参阅 [YouTrack](https://youtrack.jetbrains.com/issue/KT-84533#tldr-workaround) 中的问题。

## 文档更新 {id="documentation-updates"}

我们在 Kotlin 生态系统中进行了以下文档更新：

* [Kotlin 路线图](roadmap.md) – 查看更新后的 Kotlin 在语言和生态系统演进方面的优先级列表。
* [升级到 AGP 9](https://kotlinlang.org/docs/multiplatform/multiplatform-project-agp-9-migration.html) – 探索将包含 Android 应用的多平台项目迁移到 AGP 9 的建议。
* [为 KMP 应用配置 CI](https://kotlinlang.org/docs/multiplatform/kmp-ci-tutorial.html) – 按照教程在多平台项目中为持续集成配置 GitHub Actions。
* [Compose UI 预览](https://kotlinlang.org/docs/multiplatform/compose-previews.html) – 了解如何在不运行模拟器的情况下在 IDE 中预览可组合项。
* [处理 Web 资源](https://kotlinlang.org/docs/multiplatform/compose-web-resources.html) – 了解如何在 Compose Multiplatform 中处理 Web 资源。
* [设置视口](https://kotlinlang.org/docs/multiplatform/compose-css-styles.html) – 了解如何使用 `ComposeViewport()` 函数在 Web 的 Compose Multiplatform 中于 HTML 画布上呈现 UI。
* [自定义编译器插件](custom-compiler-plugins.md) – 了解编译器插件的工作原理，以及在找不到适合您用例的插件时该怎么做。
* [应用程序结构](https://ktor.io/docs/server-application-structure.html) – 为您的 Ktor Server 应用选择最佳的应用程序结构。
* [HTTP 请求生命周期](https://ktor.io/docs/server-http-request-lifecycle.html) – 了解当客户端断开连接时，如何利用 HTTP 请求生命周期取消 Ktor 中的请求处理。
* [SQL 注入](https://ktor.io/docs/server-dependency-injection.html) – 了解如何在 Ktor Server 中配置 SQL 注入，其中包含更新的指导和实用示例。
* [Exposed 的 Spring Boot 集成](https://www.jetbrains.com/help/exposed/spring-boot-integration.html#requirements) – 了解如何将 Exposed 与 Spring Boot 3 和 4 结合使用。