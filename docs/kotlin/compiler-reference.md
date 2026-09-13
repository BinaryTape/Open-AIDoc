[//]: # (title: Kotlin 编译器选项)

<show-structure depth="1"/>

每个版本的 Kotlin 都包含适用于受支持目标的编译器： 
JVM、JavaScript，以及针对[受支持平台](native-overview.md#target-platforms)的原生二进制文件。

这些编译器被用于：
* IDE，当您为 Kotlin 项目点击 **编译** 或 **运行** 按钮时。
* Gradle，当您在控制台或 IDE 中调用 `gradle build` 时。
* Maven，当您在控制台或 IDE 中调用 `mvn compile` 或 `mvn test-compile` 时。

您也可以按照[使用命令行编译器](command-line.md)教程中的说明，手动运行 Kotlin 编译器。

## 编译器选项 {id="compiler-options"}

Kotlin 编译器具有许多用于定制编译过程的选项。
本页列出了针对不同目标的编译器选项以及每个选项的说明。

有几种方法可以设置编译器选项及其值（*编译器实参*）：
* 在 IntelliJ IDEA 中，在 **Settings/Preferences** | **Build, Execution, Deployment** | **Compiler** | **Kotlin Compiler** 的 **Additional command line parameters** 文本框中输入编译器实参。
* 如果您使用 Gradle，请在 Kotlin 编译任务的 `compilerOptions` 属性中指定编译器实参。
有关详细信息，请参阅 [Gradle 编译器选项](gradle-compiler-options.md#how-to-define-options)。
* 如果您使用 Maven，请在 Maven 插件节点的 `<configuration>` 元素中指定编译器实参。 
有关详细信息，请参阅 [Maven](maven-kotlin-compiler.md#specify-compiler-options)。
* 如果运行命令行编译器，请直接在实用工具调用中添加编译器实参，或将其写入 [实参文件 (argfile)](#argfile)。

  例如：

  ```bash
  $ kotlinc hello.kt -include-runtime -d hello.jar
  ```

  > 在 Windows 上，当您传递包含分隔符（空格、`=`、`;`、`,`）的编译器实参时，
  > 请用双引号 (`"`) 包围这些实参。
  > ```
  > $ kotlinc.bat hello.kt -include-runtime -d "My Folder\hello.jar"
  > ```
  {style="note"}

## 编译器选项架构 {id="schema-for-compiler-options"}

所有编译器选项的通用架构以 JAR 构件的形式发布在 [`org.jetbrains.kotlin:kotlin-compiler-arguments-description`](https://central.sonatype.com/artifact/org.jetbrains.kotlin/kotlin-compiler-arguments-description) 下。该构件包括所有编译器选项说明的代码表示形式和 JSON 等效形式（供非 Kotlin 使用者使用）。此外还包含元数据，例如每个选项引入或稳定的版本。

## 通用选项 {id="common-options"}

以下选项对所有 Kotlin 编译器通用。

### -api-version _版本_ {id="api-version-version"}

设置 API 版本以控制您的代码在运行时可以使用哪些 Kotlin API。例如，如果您使用 Kotlin 编译器版本 2.4.0 并配合 `-api-version=2.1`，您的代码将保持与 Kotlin 标准库 2.1.0 的兼容。

您不能将 `-api-version` 的值设置为高于 [`-language-version`](#language-version-version) 的值。

在大多数情况下，API 版本和[语言版本](#language-version-version)应当相同。一个例外情况是：当您为必须运行旧版本 Kotlin 标准库的使用者开发库时。在这种情况下，请设置较旧的 API 版本，以避免意外使用这些使用者无法获取的 API。

有关 API 版本如何影响兼容性的更多信息，请参阅[库作者的向后兼容性指南](api-guidelines-backward-compatibility.md#choose-compatible-language-and-api-versions)。

### -help (-h) {id="help-h"}

显示用法信息并退出。仅显示标准选项。
要显示高级选项，请使用 `-X`。

### -kotlin-home _路径_ {id="kotlin-home-path"}

为用于发现运行时库的 Kotlin 编译器指定自定义路径。

### -language-version _版本_ {id="language-version-version"}

设置语言版本以控制在编译期间哪些 Kotlin 语言功能可用。

例如，如果您希望在不改变编译器行为的情况下受益于新的编译性能改进，可以使用较新的编译器版本配合较旧的语言版本。使用较旧的语言版本时，您无法使用较新的语言功能，但也不会看到该版本之后引入的新错误和弃用。这种方法对于需要保持与旧版本 Kotlin 兼容性的库作者特别有用。欲了解更多信息，请参阅[库作者的向后兼容性指南](api-guidelines-backward-compatibility.md#choose-compatible-language-and-api-versions)。

您可以将最近的三个稳定版本之一配置为语言版本。例如，Kotlin 2.5.0 支持低至 2.2 的语言版本。

如果您使用较旧的语言版本，还需要使用较旧的 API 版本。
有关详细信息，请参阅 [api-version](#api-version-version)。

> 从技术上讲，您可以配置较新的语言版本，以便在即将推出的语言功能稳定之前进行尝试。
> 但是，我们建议按照各功能的专门说明来启用各个功能。
> 
{style="tip"}

### -opt-in _注解_ {id="opt-in-annotation"}

通过给定完全限定名称的需求注解，启用[需要选择性加入 (opt-in)](opt-in-requirements.md) 的 API 的使用。

### -P plugin:pluginId:optionName=value {id="p-plugin-pluginid-optionname-value"}

向 Kotlin 编译器插件传递选项。
核心插件及其选项列在文档的[核心编译器插件](components-stability.md#core-compiler-plugins)部分。

### -progressive {id="progressive"}

为编译器启用[渐进模式](whatsnew13.md#progressive-mode)。

在渐进模式下，不稳定代码的弃用和错误修复将立即生效，而不是经过平滑的迁移周期。
在渐进模式下编写的代码是向后兼容的；然而，在非渐进模式下编写的代码可能会在渐进模式下导致编译错误。

### -script {id="script"}

运行 Kotlin 脚本文件。使用此选项调用时，编译器将执行给定实参中的第一个 Kotlin 脚本 (`*.kts`) 文件。

### -verbose {id="verbose"}

启用详细日志输出，其中包括编译过程的详细信息。

### -version {id="version"}

显示编译器版本。

### -X {id="x"}

<primary-label ref="experimental-general"/>

显示有关高级选项的信息并退出。这些选项目前不稳定： 
其名称和行为可能会在不另行通知的情况下发生更改。

### Kotlin 契约选项 {id="kotlin-contract-options"}
<primary-label ref="experimental-general"/>

以下选项启用实验性的 Kotlin 契约功能。

#### -Xallow-contracts-on-more-functions {id="xallow-contracts-on-more-functions"}

在额外的声明中启用契约，包括属性访问器、特定的运算符函数以及针对泛型类型的类型断言。

#### -Xallow-condition-implies-returns-contracts {id="xallow-condition-implies-returns-contracts"}

允许在契约中使用 `returnsNotNull()` 函数，以便在指定条件下假设返回值为非 null。

#### -Xallow-holdsin-contract {id="xallow-holdsin-contract"}

允许在契约中使用 `holdsIn` 关键字，以假设布尔条件在 lambda 内部为 `true`。

#### -Xallow-returns-result-of {id="xallow-returns-result-of"}

允许使用 `returnsResultOf()` 契约，以便未使用的返回值检查器可以区分可以忽略的结果和来自高阶函数的有意义结果。

### -Xallow-reified-type-in-catch {id="xallow-reified-type-in-catch"}
<primary-label ref="experimental-general"/>

在 `inline` 函数的 `catch` 子句中启用对具体化 (reified) `Throwable` 类型参数的支持。

### -Xcollection-literals {id="xcollection-literals"}
<primary-label ref="experimental-general"/>

启用对使用方括号语法 `[]` 的[集合字面量](whatsnew24.md#support-for-collection-literals)的支持。

### -Xcompiler-plugin-order= {plugin.before>plugin.after id="xcompiler-plugin-order"}
<primary-label ref="experimental-general"/>

配置编译器插件的运行顺序。编译器先运行 `plugin.before`，然后运行 `plugin.after`：

您可以为三个或更多插件定义多个排序规则。例如：

```bash
kotlinc -Xcompiler-plugin-order=plugin.first>plugin.middle
kotlinc -Xcompiler-plugin-order=plugin.middle>plugin.last
```

这将导致以下运行顺序：

1. `plugin.first`
2. `plugin.middle`
3. `plugin.last`

如果某个编译器插件不存在，则忽略相应的规则。

您可以通过以下 ID 配置插件：

| 编译器插件 | 插件 ID |
|-----------------------------|--------------------------------------------|
| `all-open`, `kotlin-spring` | `org.jetbrains.kotlin.allopen`             |
| AtomicFU                    | `org.jetbrains.kotlinx.atomicfu`           |
| Compose                     | `androidx.compose.compiler.plugins.kotlin` |
| `js-plain-objects`          | `org.jetbrains.kotlinx.jspo`               |
| `jvm-abi-gen`               | `org.jetbrains.kotlin.jvm.abi`             |
| kapt                        | `org.jetbrains.kotlin.kapt3`               |
| Lombok                      | `org.jetbrains.kotlin.lombok`              |
| `no-arg`, `kotlin-jpa`      | `org.jetbrains.kotlin.noarg`               |
| Parcelize                   | `org.jetbrains.kotlin.parcelize`           |
| Power-assert                | `org.jetbrains.kotlin.powerassert`         |
| SAM with receiver           | `org.jetbrains.kotlin.samWithReceiver`     |
| Serialization               | `org.jetbrains.kotlinx.serialization`      |

此运行顺序仅控制编译器插件的后端，不控制前端。

### -Xdata-flow-based-exhaustiveness {id="xdata-flow-based-exhaustiveness"}
<primary-label ref="experimental-general"/>

为 `when` 表达式启用基于数据流的详尽性检查。

### -Xexplicit-context-arguments {id="xexplicit-context-arguments"}
<primary-label ref="experimental-general"/>

为上下文参数启用显式[上下文参数](context-parameters.md#pass-context-arguments-explicitly)。

这让您可以通过在调用站点传递上下文参数来解决重载歧义。

### -Xklib-ir-inliner {id="xklib-ir-inliner"}
<primary-label ref="experimental-general"/>

配置是否为 Kotlin/Native、Kotlin/JS 和 Kotlin/Wasm 启用[模块内内联](whatsnew24.md#consistent-intra-module-function-inlining-during-klib-compilation)。默认情况下，它是启用的。

该选项支持以下模式：

* `disabled`：禁用 Kotlin/Native、Kotlin/JS 和 Kotlin/Wasm 的模块内内联。
* `full`：启用跨模块内联。

### -Xintrinsic-const-evaluation {id="xintrinsic-const-evaluation"}
<primary-label ref="experimental-general"/>

启用[改进的编译时常量](whatsnew24.md#improved-compile-time-constants)。

### -Xname-based-destructuring {id="xname-based-destructuring"}
<primary-label ref="experimental-opt-in"/>

配置编译器如何根据属性名称解释[析构声明](destructuring-declarations.md#name-based-destructuring)。

该选项支持以下模式：

* `only-syntax`：启用基于名称的析构的显式形式，而不改变现有析构声明的行为。
* `name-mismatch`：当数据类中基于位置的析构使用的变量名称与属性名称不匹配时报告警告。
* `complete`：启用带圆括号的短形式基于名称的析构，并继续支持带方括号语法的基于位置的析构。

### -Xphases-to-dump-before {id="xphases-to-dump-before"}
<primary-label ref="experimental-general"/>

设置为 `ExternalPackageParentPatcherLowering` 以在 IR lowering 编译阶段后创建转储文件。使用 [`-Xdump-directory`](#xdump-directory) 编译器选项配置 Kotlin/JVM 的输出目录。

### -Xrepl {id="xrepl"}
<primary-label ref="experimental-general"/>

激活 Kotlin REPL。

```bash
kotlinc -Xrepl
```

### -Xreturn-value-checker {id="xreturn-value-checker"}
<primary-label ref="experimental-general"/>

配置编译器如何[报告被忽略的结果](unused-return-value-checker.md)：

* `disable`：禁用未使用的返回值检查器（默认）。
* `check`：启用检查器，并针对来自标记函数的被忽略结果报告警告。
* `full`：启用检查器，将项目中的所有函数都视为已标记，并针对被忽略的结果报告警告。

### 警告管理 {id="warning-management"}

#### -nowarn {id="nowarn"}

在编译期间禁止显示所有警告。

#### -Werror {id="werror"}

将所有警告视为编译错误。

#### -Wextra {id="wextra"}

启用[额外的编译器声明、表达式和类型检查](whatsnew21.md#extra-compiler-checks)，如果检查结果为 true，则发出警告。

#### -Xrender-internal-diagnostic-names {id="xrender-internal-diagnostic-names"}
<primary-label ref="experimental-general"/>

在警告旁边打印内部诊断名称。这对于识别为 `-Xwarning-level` 选项配置的 `DIAGNOSTIC_NAME` 非常有用。

#### -Xwarning-level {id="xwarning-level"}
<primary-label ref="experimental-general"/>

配置特定编译器警告的严重级别：

```bash
kotlinc -Xwarning-level=DIAGNOSTIC_NAME:(error|warning|disabled)
```

* `error`：仅将指定的警告提升为错误。
* `warning`：为指定的诊断发出警告，默认启用。
* `disabled`：在整个模块范围内仅禁止显示指定的警告。

您可以通过将模块级规则与特定规则相结合来调整项目中的警告报告：

| 命令 | 描述 |
|----------------------------------------------------|-------------------------------------------------------------|
| `-nowarn -Xwarning-level=DIAGNOSTIC_NAME:warning`  | 禁止显示除指定警告以外的所有警告。 |
| `-Werror -Xwarning-level=DIAGNOSTIC_NAME:warning`  | 将除指定警告以外的所有警告提升为错误。 |
| `-Wextra -Xwarning-level=DIAGNOSTIC_NAME:disabled` | 启用除指定检查以外的所有额外检查。 |

如果您有许多要从一般规则中排除的警告，可以使用 [`@argfile`](#argfile) 将其列在单独的文件中。

您可以使用 [`-Xrender-internal-diagnostic-names`](#xrender-internal-diagnostic-names) 来发现 `DIAGNOSTIC_NAME`。

### @argfile {id="argfile"}

从给定文件中读取编译器选项。此类文件可以包含编译器选项及其值，以及源文件的路径。选项和路径应以空格分隔。例如：

```
-include-runtime -d hello.jar hello.kt
```

要传递包含空格的值，请用单引号 (**'**) 或双引号 (**"**) 包围它们。如果值中包含引号，请使用反斜杠 (**\\**) 对其进行转义。

```
-include-runtime -d 'My folder'
```

您还可以传递多个实参文件，例如，将编译器选项与源文件分开。

```bash
$ kotlinc @compiler.options @classes
```

如果文件位于与当前目录不同的位置，请使用相对路径。

```bash
$ kotlinc @options/compiler.options hello.kt
```

## Kotlin/JVM 编译器选项 {id="kotlin-jvm-compiler-options"}

适用于 JVM 的 Kotlin 编译器将 Kotlin 源文件编译为 Java 类文件。 
用于 Kotlin 到 JVM 编译的命令行工具是 `kotlinc` 和 `kotlinc-jvm`。
您也可以使用它们来执行 Kotlin 脚本文件。

除了[通用选项](#common-options)外，Kotlin/JVM 编译器还具有下列选项。

### -classpath _路径_ (-cp _路径_) {id="classpath-path-cp-path"}

在指定路径中搜索类文件。使用系统路径分隔符（Windows 上为 **;**，macOS/Linux 上为 **:**）分隔类路径元素。
类路径可以包含文件和目录路径、ZIP 或 JAR 文件。

### -d _路径_ {id="d-path"}

将生成的 class 文件放置在指定位置。该位置可以是目录、ZIP 或 JAR 文件。

### -include-runtime {id="include-runtime"}

将 Kotlin 运行时包含在生成的 JAR 文件中。使生成的归档文件可在任何启用 Java 的环境中运行。

### -jdk-home _路径_ {id="jdk-home-path"}

如果要包含在类路径中的自定义 JDK 根目录与默认的 `JAVA_HOME` 不同，请使用此选项。

### -Xjdk-release=version {id="xjdk-release-version"}

<primary-label ref="experimental-general"/>

指定生成的 JVM 字节码的目标版本。将类路径中 JDK 的 API 限制为指定的 Java 版本。 
自动设置 [`-jvm-target version`](#jvm-target-version)。
可选值为 `1.8`、`9`、`10`、……、`26`。

> 此选项[不保证](https://youtrack.jetbrains.com/issue/KT-29974)对每个 JDK 发行版都有效。
>
{style="note"}

### -jvm-default _模式_ {id="jvm-default-mode"}

控制如何将接口中声明的函数编译为 JVM 上的默认方法。

| 模式 | 描述 |
|--------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| `enable`           | 在接口中生成默认实现，并在子类和 `DefaultImpls` 类中包含桥接函数。（默认） |
| `no-compatibility` | 仅在接口中生成默认实现，跳过兼容性桥接和 `DefaultImpls` 类。 |
| `disable`          | 仅生成兼容性桥接和 `DefaultImpls` 类，跳过默认方法。 |

### -jvm-target _版本_ {id="jvm-target-version"}

指定生成的 JVM 字节码的目标版本。可选值为 `1.8`、`9`、`10`、……、`26`。
默认值为 `%defaultJvmTargetVersion%`。

### -java-parameters {id="java-parameters"}

为方法形参上的 Java 1.8 反射生成元数据。

### -module-name _名称_ (JVM) {id="module-name-name-jvm"}

为生成的 `.kotlin_module` 文件设置自定义名称。
  
### -no-jdk {id="no-jdk"}

不自动将 Java 运行时包含在类路径中。

### -no-reflect {id="no-reflect"}

不自动将 Kotlin 反射 (`kotlin-reflect.jar`) 包含在类路径中。

### -no-stdlib (JVM) {id="no-stdlib-jvm"}

不自动将 Kotlin/JVM 标准库 (`kotlin-stdlib.jar`) 和 Kotlin 反射 (`kotlin-reflect.jar`) 包含在类路径中。
  
### -script-templates _类名[,]_ {id="script-templates-classnames"}

脚本定义模板类。使用完全限定类名并以逗号 (**,**) 分隔。

### -Xdump-directory {id="xdump-directory"}
<primary-label ref="experimental-general"/>

为 [-Xphases-to-dump-before`](#xphases-to-dump-before) 编译器选项配置转储文件目录。

### -Xjvm-expose-boxed {id="xjvm-expose-boxed"}
<primary-label ref="experimental-general"/>

生成模块中所有内联值类的装箱版本，以及使用它们的函数的装箱变体，使两者都可以从 Java 访问。有关更多信息，请参阅从 Java 调用 Kotlin 指南中的[内联值类](java-to-kotlin-interop.md#inline-value-classes)。

### -Xnullability-annotations {id="xnullability-annotations"}
<primary-label ref="experimental-general"/>

配置 Kotlin 编译器如何解释来自特定 Java 软件包的为 null 性注解。

有关受支持注解和配置选项的完整列表，请参阅[为 null 性注解](java-interop.md#nullability-annotations)。

## Kotlin/JS 编译器选项 {id="kotlin-js-compiler-options"}

适用于 JS 的 Kotlin 编译器将 Kotlin 源文件编译为 JavaScript 代码。 
用于 Kotlin 到 JS 编译的命令行工具是 `kotlinc-js`。

除了[通用选项](#common-options)外，Kotlin/JS 编译器还具有下列选项。

### -libraries _路径_ {id="libraries-path"}

包含 `.meta.js` 和 `.kjsm` 文件的 Kotlin 库路径，由系统路径分隔符分隔。

### -main _{call|noCall}_ {id="main-call-nocall"}

定义是否应在执行时调用 `main` 函数。

### -meta-info {id="meta-info"}

生成带有元数据的 `.meta.js` 和 `.kjsm` 文件。创建 JS 库时请使用此选项。

### -module-kind {umd|commonjs|amd|plain id="module-kind"}

编译器生成的 JS 模块种类：

- `umd` - 一个 [Universal Module Definition](https://github.com/umdjs/umd) 模块
- `commonjs` - 一个 [CommonJS](http://www.commonjs.org/) 模块
- `amd` - 一个 [Asynchronous Module Definition](https://en.wikipedia.org/wiki/Asynchronous_module_definition) 模块
- `plain` - 一个普通的 JS 模块
    
要了解有关不同种类的 JS 模块及其区别的更多信息，
请参阅[这篇文章](https://www.davidbcalhoun.com/2014/what-is-amd-commonjs-and-umd/)。

### -no-stdlib (JS) {id="no-stdlib-js"}

不自动将默认的 Kotlin/JS 标准库包含在编译依赖项中。

### -output _文件路径_ {id="output-filepath"}

设置编译结果的目标文件。该值必须是包含文件名的 `.js` 文件路径。

### -output-postfix _文件路径_ {id="output-postfix-filepath"}

将指定文件的内容添加到输出文件的末尾。

### -output-prefix _文件路径_ {id="output-prefix-filepath"}

将指定文件的内容添加到输出文件的开头。

### -source-map {id="source-map"}

生成源代码映射。

### -source-map-base-dirs _路径_ {id="source-map-base-dirs-path"}

将指定路径用作基目录。基目录用于计算源代码映射中的相对路径。

### -source-map-embed-sources _{always|never|inlining}_ {id="source-map-embed-sources-always-never-inlining"}

将源文件嵌入到源代码映射中。

### -source-map-names-policy _{simple-names|fully-qualified-names|no}_ {id="source-map-names-policy-simple-names-fully-qualified-names-no"}

将您在 Kotlin 代码中声明的变量和函数名称添加到源代码映射中。

| 设置 | 描述 | 输出示例 |
|---|---|---|
| `simple-names` | 添加变量名和简单函数名。（默认） | `main` |
| `fully-qualified-names` | 添加变量名和完全限定函数名。 | `com.example.kjs.playground.main` |
| `no` | 不添加变量或函数名称。 | N/A |

### -source-map-prefix {id="source-map-prefix"}

向源代码映射中的路径添加指定的前缀。

### -target {es5|es2015 id="target"}

为指定的 ECMA 版本生成 JS 文件。

### -Xenable-implementing-interfaces-from-typescript {id="xenable-implementing-interfaces-from-typescript"}
<primary-label ref="experimental-general"/>

允许从 JavaScript/TypeScript 中[实现 Kotlin 接口](whatsnew2320.md#implementing-kotlin-interfaces-from-javascript-typescript)，这些接口需使用 `@JsExport` 注解导出。

### -Xes-long-as-bigint {id="xes-long-as-bigint"}
<primary-label ref="experimental-general"/>

在编译为现代 JavaScript (ES2020) 时，启用对 JavaScript `BigInt` 类型的支持以表示 Kotlin `Long` 值。

### -Xsuspend-lambda-exporting {id="xsuspend-lambda-exporting"}
<primary-label ref="experimental-general"/>

允许将 `@JsExport` 声明中声明的[挂起 lambda 表达式导出](js-to-kotlin-interop.md#export-suspending-lambdas)为 JavaScript `async` 函数。

## Kotlin/Native 编译器选项 {id="kotlin-native-compiler-options"}

Kotlin/Native 编译器将 Kotlin 源文件编译为针对[受支持平台](native-overview.md#target-platforms)的原生二进制文件。 
用于 Kotlin/Native 编译的命令行工具是 `kotlinc-native`。

除了[通用选项](#common-options)外，Kotlin/Native 编译器还具有下列选项。

### -enable-assertions (-ea) {id="enable-assertions-ea"}

在生成的代码中启用运行时断言。

### -entry _名称_ (-e _名称_) {id="entry-name-e-name"}

指定限定的入口点名称。

### -g {id="g"}

启用发射调试信息。此选项会降低优化级别，不应与 [`-opt`](#opt) 选项结合使用。
    
### -generate-test-runner (-tr) {id="generate-test-runner-tr"}

生成一个用于运行项目中单元测试的应用程序。

### -generate-no-exit-test-runner (-trn) {id="generate-no-exit-test-runner-trn"}

生成一个用于在没有显式进程退出的情况下运行单元测试的应用程序。

### -include-binary _路径_ (-ib _路径_) {id="include-binary-path-ib-path"}

在生成的 klib 文件中打包外部二进制文件。

### -library _路径_ (-l _路径_) {id="library-path-l-path"}

与库链接。要了解在 Kotlin/native 项目中使用库的信息，请参阅 
[Kotlin/Native 库](native-libraries.md)。

### -library-version _版本_ (-lv _版本_) {id="library-version-version-lv-version"}

设置库版本。

### -linker-option {id="linker-option"}

在构建二进制文件期间向链接器传递一个实参。这可用于与某些原生库链接。

### -linker-options _实参_ {id="linker-options-args"}

在构建二进制文件期间向链接器传递多个实参。实参之间以空格分隔。
    
### -list-targets {id="list-targets"}

列出可用的 hardware 目标。

### -manifest _路径_ {id="manifest-path"}

提供一个清单附加文件。

### -module-name _名称_ (Native) {id="module-name-name-native"}

指定编译模块的名称。
此选项还可用于为导出到 Objective-C 的声明指定名称前缀：
[如何为我的 Kotlin 框架指定自定义 Objective-C 前缀/名称？](native-faq.md#how-do-i-specify-a-custom-objective-c-prefix-name-for-my-kotlin-framework)

### -native-library _路径_ (-nl _路径_) {id="native-library-path-nl-path"}

包含原生 bitcode 库。

### -no-default-libs {id="no-default-libs"}

禁用将用户代码与编译器随附的预构建[平台库](native-platform-libs.md)链接。

### -nomain {id="nomain"}

假设 `main` 入口点由外部库提供。

### -nopack {id="nopack"}

不将库打包到 klib 文件中。

### -nostdlib {id="nostdlib"}

不与标准库链接。

### -opt {id="opt"}

启用编译优化并生成运行时性能更好的二进制文件。不建议将其与 [`-g`](#g) 选项结合使用，因为后者会降低优化级别。

### -output _名称_ (-o _名称_) {id="output-name-o-name"}

设置输出文件的名称。

### -produce _输出_ (-p _输出_) {id="produce-output-p-output"}

指定输出文件种类：

- `program`
- `static`
- `dynamic`
- `framework`
- `library`
- `bitcode`

### -repo _路径_ (-r _路径_) {id="repo-path-r-path"}

库搜索路径。有关更多信息，请参阅[库搜索序列](native-libraries.md#library-search-sequence)。

### -target _目标_ {id="target-target"}

设置硬件目标。要查看可用目标列表，请使用 [`-list-targets`](#list-targets) 选项。

### -Xccall-mode {id="xccall-mode"}
<primary-label ref="experimental-general"/>

为通过 cinterop 导入的 C 或 Objective-C 库启用[新的互操作模式](whatsnew2320.md#new-interoperability-mode-for-c-or-objective-c-libraries)。

### -Xoverride-konan-properties=min.version.* {id="xoverride-konan-properties-min-version"}
<primary-label ref="experimental-general"/>

配置比 Kotlin 默认版本更低的 Apple 目标受支持版本。例如：

```bash
kotlinc -Xoverride-konan-properties=minVersion.ios=14.0
kotlinc -Xoverride-konan-properties=minVersion.macos=11.0
kotlinc -Xoverride-konan-properties=minVersion.tvos=14.0
kotlinc -Xoverride-konan-properties=minVersion.watchos=7.0