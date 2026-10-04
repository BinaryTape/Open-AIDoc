[//]: # (title: Kotlin 编译器选项)

<show-structure depth="1"/>

Kotlin 的每个版本都包含适用于受支持目标的编译器：
JVM、JavaScript 以及针对[受支持平台](native-overview.md#target-platforms)的原生二进制文件。

这些编译器用于：
* 当你在 Kotlin 项目中点击 __Compile__ 或 __Run__ 按钮时的 IDE。
* 当你在控制台或 IDE 中调用 `gradle build` 时的 Gradle。
* 当你在控制台或 IDE 中调用 `mvn compile` 或 `mvn test-compile` 时的 Maven。

你也可以按照[使用命令行编译器](command-line.md)教程中的说明，从命令行手动运行 Kotlin 编译器。

## 编译器选项 {id="compiler-options"}

Kotlin 编译器提供了许多选项用于定制编译过程。
本页列出了针对不同目标的编译器选项及其说明。

设置编译器选项及其值（_编译器实参_）的方法有几种：
* 在 IntelliJ IDEA 中，于 **Settings/Preferences** | **Build, Execution, Deployment** | **Compiler** | **Kotlin Compiler** 下的 **Additional command line parameters** 文本框中填入编译器实参。
* 如果你使用的是 Gradle，请在 Kotlin 编译任务的 `compilerOptions` 属性中指定编译器实参。
详细信息请参阅 [Gradle 编译器选项](gradle-compiler-options.md#how-to-define-options)。
* 如果你使用的是 Maven，请在 Maven 插件节点的 `<configuration>` 元素中指定编译器实参。
详细信息请参阅 [Maven](maven-kotlin-compiler.md#specify-compiler-options)。
* 如果你运行命令行编译器，可以直接将编译器实参添加到实用工具调用中，或将它们写入 [argfile](#argfile)。

  例如：

  ```bash
  $ kotlinc hello.kt -include-runtime -d hello.jar
  ```

  > 在 Windows 上，当传递包含分隔符字符（空格、`=`、`;`、`,`）的编译器实参时，
  > 请用双引号（`"`）将这些实参括起来。
  > ```
  > $ kotlinc.bat hello.kt -include-runtime -d "My Folder\hello.jar"
  > ```
  {style="note"}

## 编译器选项规范架构 (Schema) {id="schema-for-compiler-options"}

所有编译器选项的通用架构以 JAR 工件的形式发布在 [`org.jetbrains.kotlin:kotlin-compiler-arguments-description`](https://central.sonatype.com/artifact/org.jetbrains.kotlin/kotlin-compiler-arguments-description) 下。该工件包含所有编译器选项描述的代码表示以及等效的 JSON 表示（适用于非 Kotlin 使用者），还包含诸如每个选项是在哪个版本中引入或稳定化的元数据。

## 通用选项 {id="common-options"}

以下选项适用于所有 Kotlin 编译器。

### -api-version _version_ {id="api-version-version"}

设置 API 版本，以控制你的代码在运行时可以使用哪些 Kotlin API。例如，如果你使用 Kotlin 编译器版本 2.4.0 配合 `-api-version=2.1`，你的代码将保持与 Kotlin 标准库 2.1.0 兼容。

不能将 `-api-version` 的值设置为高于 `-language-version` 的值。

在大多数情况下，API 版本与[语言版本](#language-version-version)应保持相同。一种例外情况是：当你开发的库的使用者必须运行较旧版本的 Kotlin 标准库时。在那种情况下，请设置较旧的 API 版本，以避免意外使用这些使用者无法访问的 API。

要详细了解 API 版本如何影响兼容性，请参阅[面向库创作者的向后兼容性指南](api-guidelines-backward-compatibility.md#choose-compatible-language-and-api-versions)。

### -help (-h) {id="help-h"}

显示用法信息并退出。仅显示标准选项。
要显示高级选项，请使用 `-X`。

### -kotlin-home _path_ {id="kotlin-home-path"}

指定用于发现运行时库的 Kotlin 编译器自定义路径。

### -language-version _version_ {id="language-version-version"}

设置语言版本，以控制编译期间哪些 Kotlin 语言功能可用。

例如，如果你希望在不更改编译器行为的情况下受益于新的编译性能改进，可以使用新的编译器版本配合较旧的语言版本。使用较旧的语言版本时，你无法使用较新的语言功能，但也不会看到该版本之后引入的新错误和弃用项。这种方法对于需要保持与较旧 Kotlin 版本兼容的库创作者特别有用。
要了解更多信息，请参阅[面向库创作者的向后兼容性指南](api-guidelines-backward-compatibility.md#choose-compatible-language-and-api-versions)。

你可以将 Kotlin 最新的三个稳定版本之一配置为语言版本。例如，Kotlin 2.5.0 支持低至 2.2 的语言版本。

如果使用较旧的语言版本，你也需要使用较旧的 API 版本。
要了解更多信息，请参阅 [](#api-version-version)。

> 从技术上讲，你可以配置较新的语言版本，以在即将推出的语言功能稳定之前试用它们。
> 但是，最好按照对应功能的专门说明来单独启用各个功能。
> 
{style="tip"}

### -opt-in _annotation_ {id="opt-in-annotation"}

通过具有指定完全限定名称的准入要求注解，启用[需要选择加入 (opt-in)](opt-in-requirements.md) 的 API 的使用。

### -P plugin:pluginId:optionName=value {id="p-plugin-pluginid-optionname-value"}

向 Kotlin 编译器插件传递选项。
核心插件及其选项列在文档的[核心编译器插件](components-stability.md#core-compiler-plugins)部分中。

### -progressive {id="progressive"}

为编译器启用[渐进模式](whatsnew13.md#progressive-mode)。

在渐进模式下，针对不稳定代码的弃用和错误修复会立即生效，而不是经历平滑迁移周期。在渐进模式下编写的代码是向后兼容的；但是，在非渐进模式下编写的代码可能会在渐进模式下导致编译错误。

### -script {id="script"}

对 Kotlin 脚本文件进行求值。使用此选项调用时，编译器会执行给定实参中的第一个 Kotlin 脚本（`*.kts`）文件。

### -verbose {id="verbose"}

启用详细日志输出，其中包括编译过程的详细信息。

### -version {id="version"}

显示编译器版本。

### -X {id="x"}

<primary-label ref="experimental-general"/>

显示有关高级选项的信息并退出。这些选项目前不稳定：其名称和行为可能会在没有事先通知的情况下发生更改。

### Kotlin 契约选项 {id="kotlin-contract-options"}
<primary-label ref="experimental-general"/>

以下选项用于启用实验性 Kotlin 契约（Contracts）功能。

#### -Xallow-contracts-on-more-functions {id="xallow-contracts-on-more-functions"}

在更多声明中启用契约，包括属性访问器、特定运算符函数以及泛型类型上的类型断言。

#### -Xallow-condition-implies-returns-contracts {id="xallow-condition-implies-returns-contracts"}

允许在契约中使用 `returnsNotNull()` 函数，以在指定条件下假定非 null 返回值。

#### -Xallow-holdsin-contract {id="xallow-holdsin-contract"}

允许在契约中使用 `holdsIn` 关键字，以假定 lambda 内部的布尔条件为 `true`。

#### -Xallow-returns-result-of {id="xallow-returns-result-of"}

允许使用 `returnsResultOf()` 契约，以便未使用的返回值检查器能够区分高阶函数中可忽略的结果与有意义的结果。

### -Xallow-reified-type-in-catch {id="xallow-reified-type-in-catch"}
<primary-label ref="experimental-general"/>

在 `inline` 函数的 `catch` 子句中启用对具体化（reified）`Throwable` 类型形参的支持。

### -Xcollection-literals {id="xcollection-literals"}
<primary-label ref="experimental-general"/>

启用对方括号语法 `[]` 的[集合字面量](whatsnew24.md#support-for-collection-literals)支持。

### -Xcompiler-plugin-order={plugin.before>plugin.after} {id="xcompiler-plugin-order-plugin-before-plugin-after"}
<primary-label ref="experimental-general"/>

配置编译器插件的运行顺序。编译器先运行 `plugin.before`，然后运行 `plugin.after`：

你可以为三个或更多插件定义多个排序规则。例如：

```bash
kotlinc -Xcompiler-plugin-order=plugin.first>plugin.middle
kotlinc -Xcompiler-plugin-order=plugin.middle>plugin.last
```

这将产生以下运行顺序：

1. `plugin.first`
2. `plugin.middle`
3. `plugin.last`

如果某个编译器插件不存在，则忽略对应的规则。

你可以通过以下 ID 配置对应的插件：

| 编译器插件 | 插件 ID |
|-----------------------------|--------------------------------------------|
| `all-open`、`kotlin-spring` | `org.jetbrains.kotlin.allopen` |
| AtomicFU | `org.jetbrains.kotlinx.atomicfu` |
| Compose | `androidx.compose.compiler.plugins.kotlin` |
| `js-plain-objects` | `org.jetbrains.kotlinx.jspo` |
| `jvm-abi-gen` | `org.jetbrains.kotlin.jvm.abi` |
| kapt | `org.jetbrains.kotlin.kapt3` |
| Lombok | `org.jetbrains.kotlin.lombok` |
| `no-arg`、`kotlin-jpa` | `org.jetbrains.kotlin.noarg` |
| Parcelize | `org.jetbrains.kotlin.parcelize` |
| Power-assert | `org.jetbrains.kotlin.powerassert` |
| SAM with receiver | `org.jetbrains.kotlin.samWithReceiver` |
| Serialization | `org.jetbrains.kotlinx.serialization` |

该运行顺序仅控制编译器插件的后端，而不控制前端。

### -Xdata-flow-based-exhaustiveness {id="xdata-flow-based-exhaustiveness"}
<primary-label ref="experimental-general"/>

为 `when` 表达式启用基于数据流的穷尽性检查。

### -Xexplicit-context-arguments {id="xexplicit-context-arguments"}
<primary-label ref="experimental-general"/>

为上下文形参启用显式[上下文实参](context-parameters.md#pass-context-arguments-explicitly)。

这使你能够通过在调用站点传递上下文实参来解决重载歧义。

### -Xklib-ir-inliner {id="xklib-ir-inliner"}
<primary-label ref="experimental-general"/>

配置是否为 Kotlin/Native、Kotlin/JS 和 Kotlin/Wasm 启用[模块内内联](whatsnew24.md#consistent-intra-module-function-inlining-during-klib-compilation)。默认情况下处于启用状态。

该选项支持以下模式：

* `disabled`：禁用针对 Kotlin/Native、Kotlin/JS 和 Kotlin/Wasm 的模块内内联。
* `full`：启用跨模块内联。

### -Xintrinsic-const-evaluation {id="xintrinsic-const-evaluation"}
<primary-label ref="experimental-general"/>

启用[改进的编译时常量](whatsnew24.md#improved-compile-time-constants)。

### -Xname-based-destructuring {id="xname-based-destructuring"}
<primary-label ref="experimental-opt-in"/>

配置编译器如何基于属性名称解释[析构声明](destructuring-declarations.md#name-based-destructuring)。

该选项支持以下模式：

* `only-syntax`：启用基于名称的析构的显式形式，而不更改现有析构声明的行为。
* `name-mismatch`：当数据类中基于位置的析构使用了与属性名称不匹配的变量名时报告警告。
* `complete`：启用带圆括号的短形式基于名称的析构，并继续支持使用方括号语法的基于位置的析构。

### -Xphases-to-dump-before {id="xphases-to-dump-before"}
<primary-label ref="experimental-general"/>

设置为 `ExternalPackageParentPatcherLowering` 以在 IR lowering 编译阶段后创建转储文件。使用 [`-Xdump-directory`](#xdump-directory) 编译器选项为 Kotlin/JVM 配置输出目录。

### -Xrepl {id="xrepl"}
<primary-label ref="experimental-general"/>

启动 Kotlin REPL。

```bash
kotlinc -Xrepl
```

### -Xreturn-value-checker {id="xreturn-value-checker"}
<primary-label ref="experimental-general"/>

配置编译器如何[报告被忽略的结果](unused-return-value-checker.md)：

* `disable`：禁用未使用的返回值检查器（默认）。
* `check`：启用检查器，并针对被标记函数中被忽略的结果报告警告。
* `full`：启用检查器，将项目中的所有函数均视为已标记，并针对被忽略的结果报告警告。

### 警告管理 {id="warning-management"}

#### -nowarn {id="nowarn"}

在编译期间禁止显示所有警告。

#### -Werror {id="werror"}

将所有警告视为编译错误。

#### -Wextra {id="wextra"}

启用[额外的声明、表达式和类型编译器检查](whatsnew21.md#extra-compiler-checks)，若条件满足则发出警告。

#### -Xrender-internal-diagnostic-names {id="xrender-internal-diagnostic-names"}
<primary-label ref="experimental-general"/>

在警告旁输出内部诊断名称。这有助于识别针对 `-Xwarning-level` 选项配置的 `DIAGNOSTIC_NAME`。

#### -Xwarning-level {id="xwarning-level"}
<primary-label ref="experimental-general"/>

配置特定编译器警告的严重级别：

```bash
kotlinc -Xwarning-level=DIAGNOSTIC_NAME:(error|warning|disabled)
```

* `error`：仅将指定的警告提升为错误。
* `warning`：为指定的诊断发出警告（默认启用）。
* `disabled`：仅在模块范围内禁止显示指定的警告。

你可以通过组合模块级规则与特定规则来调整项目中的警告报告：

| 命令 | 说明 |
|----------------------------------------------------|-------------------------------------------------------------|
| `-nowarn -Xwarning-level=DIAGNOSTIC_NAME:warning` | 禁止显示除指定警告之外的所有警告。 |
| `-Werror -Xwarning-level=DIAGNOSTIC_NAME:warning` | 将除指定警告之外的所有警告提升为错误。 |
| `-Wextra -Xwarning-level=DIAGNOSTIC_NAME:disabled` | 启用除指定检查之外的所有额外检查。 |

如果你有大量需要从常规规则中排除的警告，可以使用 [`@argfile`](#argfile) 将它们列在单独的文件中。

你可以使用 [`-Xrender-internal-diagnostic-names`](#xrender-internal-diagnostic-names) 来发现 `DIAGNOSTIC_NAME`。

### @argfile {id="argfile"}

从给定文件中读取编译器选项。此类文件可以包含带有值的编译器选项以及源文件路径。选项和路径之间应以空格分隔。例如：

```
-include-runtime -d hello.jar hello.kt
```

要传递包含空格的值，请用单引号（**'**）或双引号（**"**）将其括起来。如果值中包含引号，请使用反斜杠（**\\**）进行转义。

```
-include-runtime -d 'My folder'
```

你也可以传递多个参数文件，例如用于将编译器选项与源文件分开。

```bash
$ kotlinc @compiler.options @classes
```

如果文件位于不同于当前目录的位置，请使用相对路径。

```bash
$ kotlinc @options/compiler.options hello.kt
```

## Kotlin/JVM 编译器选项 {id="kotlin-jvm-compiler-options"}

针对 JVM 的 Kotlin 编译器将 Kotlin 源文件编译为 Java 类文件。
用于 Kotlin 到 JVM 编译的命令行工具为 `kotlinc` 和 `kotlinc-jvm`。
你也可以使用它们来执行 Kotlin 脚本文件。

除[通用选项](#common-options)外，Kotlin/JVM 编译器还具有下列选项。

### -classpath _path_ (-cp _path_) {id="classpath-path-cp-path"}

在指定路径中搜索类文件。使用系统路径分隔符（Windows 上为 **;**，macOS/Linux 上为 **:**）分隔 classpath 的各个元素。
classpath 可以包含文件和目录路径、ZIP 或 JAR 文件。

### -d _path_ {id="d-path"}

将生成的类文件放置在指定位置。该位置可以是目录、ZIP 或 JAR 文件。

### -include-runtime {id="include-runtime"}

将 Kotlin 运行时包含在生成的 JAR 文件中。使生成的归档文件可以在任何支持 Java 的环境中运行。

### -jdk-home _path_ {id="jdk-home-path"}

如果与默认的 `JAVA_HOME` 不同，可以使用自定义 JDK 主目录将其包含在 classpath 中。

### -Xjdk-release=version {id="xjdk-release-version"}

<primary-label ref="experimental-general"/>

指定生成的 JVM 字节码的目标版本。将 classpath 中 JDK 的 API 限制为指定的 Java 版本。
自动设置 [`-jvm-target version`](#jvm-target-version)。
可能的值为 `1.8`、`9`、`10`、...、`26`。

> 此选项[不能保证](https://youtrack.jetbrains.com/issue/KT-29974)对每种 JDK 发行版都有效。
>
{style="note"}

### -jvm-default _mode_ {id="jvm-default-mode"}

控制接口中声明的函数如何编译为 JVM 上的默认方法。

| 模式 | 说明 |
|--------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| `enable` | 在接口中生成默认实现，并在子类和 `DefaultImpls` 类中包含桥接函数。（默认） |
| `no-compatibility` | 仅在接口中生成默认实现，跳过兼容性桥接和 `DefaultImpls` 类。 |
| `disable` | 仅生成兼容性桥接和 `DefaultImpls` 类，跳过默认方法。 |

### -jvm-target _version_ {id="jvm-target-version"}

指定生成的 JVM 字节码的目标版本。可能的值为 `1.8`、`9`、`10`、...、`26`。
默认值为 `%defaultJvmTargetVersion%`。

### -java-parameters {id="java-parameters"}

为方法形参上的 Java 1.8 反射生成元数据。

### -module-name _name_ (JVM) {id="module-name-name-jvm"}

为生成的 `.kotlin_module` 文件设置自定义名称。
  
### -no-jdk {id="no-jdk"}

不要自动将 Java 运行时包含在 classpath 中。

### -no-reflect {id="no-reflect"}

不要自动将 Kotlin 反射（`kotlin-reflect.jar`）包含在 classpath 中。

### -no-stdlib (JVM) {id="no-stdlib-jvm"}

不要自动将 Kotlin/JVM 标准库（`kotlin-stdlib.jar`）和 Kotlin 反射（`kotlin-reflect.jar`）包含在 classpath 中。
  
### -script-templates _classnames[,]_ {id="script-templates-classnames"}

脚本定义模板类。使用完全限定类名并用逗号（**,**）分隔。

### -Xadd-modules=module[,] {id="xadd-modules-module"}
<primary-label ref="experimental-general"/>

指定除初始模块之外要解析的根模块。设置 `ALL-MODULE-PATH` 值以解析模块路径上的所有模块。多个模块之间用逗号（**,**）分隔。

例如，要解析 incubator 模块：

```bash
kotlinc -Xadd-modules=jdk.incubator.vector
```

### -Xdump-directory {id="xdump-directory"}
<primary-label ref="experimental-general"/>

为 [`-Xphases-to-dump-before`](#xphases-to-dump-before) 编译器选项配置转储文件目录。

### -Xjvm-expose-boxed {id="xjvm-expose-boxed"}
<primary-label ref="experimental-general"/>

为模块中的所有内联值类生成装箱版本，以及使用它们的函数的装箱变体，使两者均可从 Java 访问。有关更多信息，请参阅从 Java 调用 Kotlin 指南中的[内联值类](java-to-kotlin-interop.md#inline-value-classes)。

### -Xnullability-annotations {id="xnullability-annotations"}
<primary-label ref="experimental-general"/>

配置 Kotlin 编译器如何解释来自特定 Java 软件包的为 null 性注解。

有关受支持注解和配置选项的完整列表，请参阅[为 null 性注解](java-interop.md#nullability-annotations)。

## Kotlin/JS 编译器选项 {id="kotlin-js-compiler-options"}

针对 JS 的 Kotlin 编译器将 Kotlin 源文件编译为 JavaScript 代码。
用于 Kotlin 到 JS 编译的命令行工具为 `kotlinc-js`。

除[通用选项](#common-options)外，Kotlin/JS 编译器还具有下列选项。

### -libraries _path_ {id="libraries-path"}

带有 `.meta.js` 和 `.kjsm` 文件的 Kotlin 库的路径，以系统路径分隔符分隔。

### -main _{call|noCall}_ {id="main-call-nocall"}

定义在执行时是否应调用 `main` 函数。

### -meta-info {id="meta-info"}

生成带有元数据的 `.meta.js` 和 `.kjsm` 文件。在创建 JS 库时使用此选项。

### -module-kind {umd|commonjs|amd|plain} {id="module-kind-umd-commonjs-amd-plain"}

编译器生成的 JS 模块类型：

- `umd` - [通用模块定义 (Universal Module Definition)](https://github.com/umdjs/umd) 模块
- `commonjs` - [CommonJS](http://www.commonjs.org/) 模块
- `amd` - [异步模块定义 (Asynchronous Module Definition)](https://en.wikipedia.org/wiki/Asynchronous_module_definition) 模块
- `plain` - 普通 JS 模块
    
要详细了解不同类型的 JS 模块及其区别，请参阅[此文章](https://www.davidbcalhoun.com/2014/what-is-amd-commonjs-and-umd/)。

### -no-stdlib (JS) {id="no-stdlib-js"}

不要自动将默认的 Kotlin/JS 标准库包含在编译依赖项中。

### -output _filepath_ {id="output-filepath"}

设置编译结果的目标文件。该值必须是包含文件名的 `.js` 文件路径。

### -output-postfix _filepath_ {id="output-postfix-filepath"}

将指定文件的内容添加到输出文件的末尾。

### -output-prefix _filepath_ {id="output-prefix-filepath"}

将指定文件的内容添加到输出文件的开头。

### -source-map {id="source-map"}

生成源代码映射。

### -source-map-base-dirs _path_ {id="source-map-base-dirs-path"}

使用指定的路径作为基准目录。基准目录用于计算源代码映射中的相对路径。

### -source-map-embed-sources _{always|never|inlining}_ {id="source-map-embed-sources-always-never-inlining"}

将源文件嵌入到源代码映射中。

### -source-map-names-policy _{simple-names|fully-qualified-names|no}_ {id="source-map-names-policy-simple-names-fully-qualified-names-no"}

将你在 Kotlin 代码中声明的变量名和函数名添加到源代码映射中。

| 设置 | 说明 | 示例输出 |
|-------------------------|---------------------------------------------------------------|-----------------------------------|
| `simple-names` | 添加变量名和简单函数名。（默认） | `main` |
| `fully-qualified-names` | 添加变量名和完全限定函数名。 | `com.example.kjs.playground.main` |
| `no` | 不添加任何变量名或函数名。 | N/A |

### -source-map-prefix {id="source-map-prefix"}

向源代码映射中的路径添加指定前缀。

### -target {es5|es2015|es2020} {id="target-es5-es2015-es2020"}

为指定的 ECMA 版本生成 JS 文件。

### -Xenable-implementing-interfaces-from-typescript {id="xenable-implementing-interfaces-from-typescript"}
<primary-label ref="experimental-general"/>

允许从 JavaScript/TypeScript 中[实现通过 `@JsExport` 注解导出的 Kotlin 接口](whatsnew2320.md#implementing-kotlin-interfaces-from-javascript-typescript)。

### -Xes-long-as-bigint {id="xes-long-as-bigint"}

编译到现代 JavaScript (ES2020) 时，启用对使用 JavaScript `BigInt` 类型表示 Kotlin `Long` 值的支持。
此选项仅对 `es5` 和 `es2015` 目标是必需的。`es2020` 目标默认启用此选项。

### -Xsuspend-lambda-exporting {id="xsuspend-lambda-exporting"}
<primary-label ref="experimental-general"/>

允许将 `@JsExport` 声明中声明的[挂起 lambda 表达式导出](js-to-kotlin-interop.md#export-suspending-lambdas)为 JavaScript `async` 函数。

## Kotlin/Native 编译器选项 {id="kotlin-native-compiler-options"}

Kotlin/Native 编译器将 Kotlin 源文件编译为针对[受支持平台](native-overview.md#target-platforms)的原生二进制文件。
用于 Kotlin/Native 编译的命令行工具为 `kotlinc-native`。

除[通用选项](#common-options)外，Kotlin/Native 编译器还具有下列选项。

### -enable-assertions (-ea) {id="enable-assertions-ea"}

在生成的代码中启用运行时断言。

### -entry _name_ (-e _name_) {id="entry-name-e-name"}

指定限定的入口点名称。

### -g {id="g"}

启用发出调试信息。此选项会降低优化级别，不应与 [`-opt`](#opt) 选项结合使用。
    
### -generate-test-runner (-tr) {id="generate-test-runner-tr"}

生成一个用于运行项目单元测试的应用程序。

### -generate-no-exit-test-runner (-trn) {id="generate-no-exit-test-runner-trn"}

生成一个用于运行单元测试且不显式退出进程的应用程序。

### -include-binary _path_ (-ib _path_) {id="include-binary-path-ib-path"}

将外部二进制文件打包到生成的 klib 文件中。

### -library _path_ (-l _path_) {id="library-path-l-path"}

与库链接。要了解有关在 Kotlin/Native 项目中使用库的信息，请参阅 [Kotlin/Native 库](native-libraries.md)。

### -library-version _version_ (-lv _version_) {id="library-version-version-lv-version"}

设置库版本。

### -linker-option {id="linker-option"}

在二进制文件构建期间向链接器传递实参。这可用于针对某些原生库进行链接。

### -linker-options _args_ {id="linker-options-args"}

在二进制文件构建期间向链接器传递多个实参。各实参之间用空格分隔。
    
### -list-targets {id="list-targets"}

列出可用的硬件目标。

### -manifest _path_ {id="manifest-path"}

提供清单补充文件。

### -module-name _name_ (Native) {id="module-name-name-native"}

指定编译模块的名称。
此选项也可用于为导出到 Objective-C 的声明指定名称前缀：
[如何为我的 Kotlin 框架指定自定义 Objective-C 前缀/名称？](native-faq.md#how-do-i-specify-a-custom-objective-c-prefix-name-for-my-kotlin-framework)

### -native-library _path_ (-nl _path_) {id="native-library-path-nl-path"}

包含原生 bitcode 库。

### -no-default-libs {id="no-default-libs"}

禁用将用户代码与随编译器分发的预构建[平台库](native-platform-libs.md)链接。

### -nomain {id="nomain"}

假定 `main` 入口点由外部库提供。

### -nopack {id="nopack"}

不要将库打包到 klib 文件中。

### -nostdlib {id="nostdlib"}

不要与标准库链接。

### -opt {id="opt"}

启用编译优化并生成具有更佳运行时性能的二进制文件。建议不要将其与会降低优化级别的 [`-g`](#g) 选项结合使用。

### -output _name_ (-o _name_) {id="output-name-o-name"}

设置输出文件的名称。

### -produce _output_ (-p _output_) {id="produce-output-p-output"}

指定输出文件类型：

- `program`
- `static`
- `dynamic`
- `framework`
- `library`
- `bitcode`

### -repo _path_ (-r _path_) {id="repo-path-r-path"}

库搜索路径。更多信息请参阅[库搜索顺序](native-libraries.md#library-search-sequence)。

### -target _target_ {id="target-target"}

设置硬件目标。要查看可用目标的列表，请使用 [`-list-targets`](#list-targets) 选项。

### -Xccall-mode {id="xccall-mode"}
<primary-label ref="experimental-general"/>

为通过 cinterop 导入的 C 或 Objective-C 库启用[新的互操作模式](whatsnew2320.md#new-interoperability-mode-for-c-or-objective-c-libraries)。

### -Xoverride-konan-properties=min.version.* {id="xoverride-konan-properties-min-version"}
<primary-label ref="experimental-general"/>

配置比 Kotlin 默认值更低的受支持 Apple 目标版本。例如：

```bash
kotlinc -Xoverride-konan-properties=minVersion.ios=14.0
kotlinc -Xoverride-konan-properties=minVersion.macos=11.0
kotlinc -Xoverride-konan-properties=minVersion.tvos=14.0
kotlinc -Xoverride-konan-properties=minVersion.watchos=7.0
```