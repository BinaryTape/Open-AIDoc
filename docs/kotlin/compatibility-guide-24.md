[//]: # (title: Kotlin 2.4.x 兼容性指南)

_[保持语言现代性](kotlin-evolution-principles.md)_和_[舒适更新](kotlin-evolution-principles.md)_是 Kotlin 语言设计的基本原则。前者指出应当移除阻碍语言演进的结构，后者则强调这种移除应当事先进行充分沟通，以使代码迁移尽可能顺畅。

虽然大多数语言变更已经通过其他渠道（如更新日志或编译器警告）发布，但本文档对这些变更进行了汇总，为从 Kotlin 2.3 迁移到 Kotlin 2.4 提供完整的参考。本文档还包含了与工具相关的变更信息。

## 基本术语 {id="basic-terms"}

在本文档中，我们引入了几种兼容性：

- _源码 (source)_：源码不兼容的变更会导致以前可以正常编译（没有错误或警告）的代码不再能够编译
- _二进制 (binary)_：如果交换两个二进制构件不会导致加载或链接错误，则称它们为二进制兼容
- _行为 (behavioral)_：如果在应用变更前后，同一个程序表现出不同的行为，则称该变更为行为不兼容

请记住，这些定义仅适用于纯 Kotlin。从其他语言（例如 Java）的角度来看 Kotlin 代码的兼容性不在本文档的讨论范围内。

## 语言 {id="language"}

### 停止支持 `-language-version=1.9` 和 K1 编译器 {id="drop-support-for-language-version-1-9-and-the-k1-compiler"}

> **问题**：[KT-80590](https://youtrack.jetbrains.com/issue/KT-80590)
>
> **组件**：编译器
>
> **不兼容变更类型**：源码
>
> **简要总结**：从 Kotlin 2.4 开始，编译器不再支持 [`-language-version=1.9`](compiler-reference.md#language-version-version)。因此，K1 编译器也不再受支持。
>
> **弃用周期**：
>
> - 2.2.0：使用 1.9 版本的 `-language-version` 时报告警告
> - 2.4.0：将该警告提升为错误

### 禁止 Java 类型的灵活显式可空类型实参 {id="prohibit-flexible-explicit-nullable-type-arguments-for-java-types"}

> **问题**：[KTLC-284](https://youtrack.jetbrains.com/issue/KTLC-284)
>
> **组件**：核心语言
>
> **不兼容变更类型**：源码
>
> **简要总结**：以前，从 Kotlin 调用 Java API 时，编译器可能会将显式指定的可空类型实参视为灵活类型实参。Kotlin 2.4.0 不再对可空类型实参应用此行为，因此编译器现在会对可能破坏类型安全或在运行时失败的代码报告错误。
>
> **弃用周期**：
>
> - 2.2.0：对于被视为灵活类型的显式指定可空类型实参报告警告
> - 2.4.0：将该警告提升为错误

### 禁止对绝对不兼容的类型进行始终为假的 `is` 检查 {id="prohibit-always-false-is-checks-for-definitely-incompatible-types"}

> **问题**：[KTLC-365](https://youtrack.jetbrains.com/issue/KTLC-365)
>
> **组件**：核心语言
>
> **不兼容变更类型**：源码
>
> **简要总结**：编译器现在会阻止因检查类型绝对不兼容而导致始终为假的无意义 `is` 检查。这保持了与其他涉及不兼容类型操作的一致行为。
>
> **弃用周期**：
>
> - 2.0.0：对绝对不兼容类型的 `is` 检查报告警告
> - 2.4.0：将该警告提升为错误

### 禁止在内联函数中暴露具有较低可见性的类型和声明 {id="prohibit-exposing-types-and-declarations-with-lower-visibility-in-inline-functions"}

> **问题**：[KTLC-283](https://youtrack.jetbrains.com/issue/KTLC-283)
>
> **组件**：核心语言
>
> **不兼容变更类型**：源码
>
> **简要总结**：编译器现在会阻止内联函数暴露可见性低于内联函数本身的类型和声明。
>
> **弃用周期**：
>
> - 2.3.0：对在内联函数中暴露具有较低可见性的类型和声明报告警告
> - 2.4.0：将该警告提升为错误

### 更改注解的默认使用点目标选择 {id="change-default-use-site-target-selection-for-annotations"}

> **问题**：[KTLC-391](https://youtrack.jetbrains.com/issue/KTLC-391)
>
> **组件**：核心语言
>
> **不兼容变更类型**：二进制
>
> **简要总结**：Kotlin 2.4.0 更新了将注解传播到形参、属性和字段的默认规则。这可能会影响重新编译后的注解处理、反射和二进制元数据。当您未指定使用点目标时，编译器现在会优先使用 `param` 和 `property`（如果适用），并且仅在 `property` 不适用时才使用 `field`。
>
> 您可以显式指定使用点目标，例如使用 `@param:Annotation` 代替 `@Annotation`。要在整个项目中使用之前的默认规则，请在构建文件中添加 `-Xannotation-default-target=first-only`。
>  
> **弃用周期**：
>
> - 2.2.0：当新的默认规则改变所选的使用点目标时报告警告
> - 2.4.0：启用新的默认规则

### 禁止对不可访问类型的隐式引用 {id="forbid-implicit-references-to-inaccessible-types"}

> **问题**：[KTLC-384](https://youtrack.jetbrains.com/issue/KTLC-384)
>
> **组件**：核心语言
>
> **不兼容变更类型**：源码
>
> **简要总结**：使用隐式引用间接依赖项中不可访问类型的声明现在会导致错误。
> 
> 要进行迁移，请对声明该不可访问类型的模块添加显式依赖项，或者更新中间 API 以使其不再暴露该类型。
> 
> **弃用周期**：
>
> - 2.3.0：对不可访问类型的隐式引用报告警告
> - 2.4.0：将该警告提升为错误

### 强制执行 Jakarta 为 null 性注解 {id="enforce-jakarta-nullability-annotations"}

> **问题**：[KTLC-285](https://youtrack.jetbrains.com/issue/KTLC-285)
>
> **组件**：核心语言
>
> **不兼容变更类型**：源码
>
> **简要总结**：对于使用 [`jakarta.annotation.Nullable`](https://jakarta.ee/specifications/annotations/2.1/apidocs/jakarta.annotation/jakarta/annotation/nullable) 或 [`jakarta.annotation.Nonnull`](https://jakarta.ee/specifications/annotations/2.1/apidocs/jakarta.annotation/jakarta/annotation/nonnull) 的 Java 声明，编译器现在会在 Kotlin 中强制执行声明的为 null 性。如果您将这些注解标记为可空的 Java 声明赋值给非空 Kotlin 类型，编译器会报告错误。
>
> **弃用周期**：
>
> - 2.2.0：对于带有 Jakarta 为 null 性注解的 Java 声明中的为 null 性不匹配报告警告
> - 2.4.0：将该警告提升为错误

### 报告可调用引用限定符中位置错误的类型实参 {id="report-misplaced-type-arguments-in-callable-reference-qualifiers"}

> **问题**：[KTLC-388](https://youtrack.jetbrains.com/issue/KTLC-388)
>
> **组件**：核心语言
>
> **不兼容变更类型**：源码
>
> **简要总结**：编译器现在会检查可调用引用的左侧，如果内部类在限定符的错误部分包含类型实参，则会报告警告。
> 
> 要进行迁移，请更新引用，使每个类型实参属于声明它的类。例如，编写完整类型 `Outer<Int>.Inner<String>::toString` 而不是 `Inner<String, Int>::toString`。
>
> **弃用周期**：
>
> - 2.4.0：当可调用引用左侧的类型实参属于限定符的另一部分时报告警告

### 对于具有可空上界的具体化类型形参的类文字报告错误 {id="report-errors-for-class-literals-from-reified-type-parameters-with-nullable-upper-bounds"}

> **问题**：[KTLC-370](https://youtrack.jetbrains.com/issue/KTLC-370)
>
> **组件**：核心语言
>
> **不兼容变更类型**：源码
>
> **简要总结**：当您对类型源自具有可空上界的具体化类型形参的表达式使用 `::class` 时，编译器现在会报告错误。如果您在此类表达式上使用 `::class`，请先通过显式 null 检查或 `!!` 运算符使值变为非空。
>
> **弃用周期**：
>
> - 2.3.0：当对类型源自具有可空上界的具体化类型形参的表达式使用 `::class` 时报告警告
> - 2.4.0：将该警告提升为错误

### 禁止在匿名对象声明之前进行初始化 {id="prohibit-initialization-before-declarations-in-anonymous-objects"}

> **问题**：[KTLC-290](https://youtrack.jetbrains.com/issue/KTLC-290)
>
> **组件**：核心语言
>
> **不兼容变更类型**：源码
>
> **简要总结**：如果在声明属性之前，在匿名对象的 `init` 块中初始化该属性，Kotlin 现在会报告错误。
> 
> **弃用周期**：
>
> - 2.2.20：当匿名对象中的 `init` 块在属性声明之前初始化属性时报告警告
> - 2.4.0：将该警告提升为错误

### 对包含非抽象 Java 密封类的 `when` 表达式强制执行完备性 {id="enforce-exhaustiveness-for-when-expressions-with-non-abstract-java-sealed-classes"}

> **问题**：[KTLC-366](https://youtrack.jetbrains.com/issue/KTLC-366)
>
> **组件**：核心语言
>
> **不兼容变更类型**：源码
>
> **简要总结**：Kotlin 现在更严格地检查完备性。当您对非抽象 Java 密封类使用 `when` 表达式时，要求提供 `else` 分支或匹配密封类本身的分支。以前，即使 Java 密封类本身可以直接实例化，Kotlin 也可能将此类 `when` 表达式视为完备的。
>
> **弃用周期**：
>
> - 2.3.0：对包含非抽象 Java 密封类的非完备 `when` 表达式报告警告
> - 2.4.0：将该警告提升为错误

### 禁止在参数过多的 `getValue()` 和 `setValue()` 函数上使用 `operator` 修饰符 {id="prohibit-operator-modifier-on-getvalue-and-setvalue-functions-with-too-many-parameters"}

> **问题**：[KTLC-289](https://youtrack.jetbrains.com/issue/KTLC-289)
>
> **组件**：核心语言
>
> **不兼容变更类型**：源码
>
> **简要总结**：当您使用 `operator` 修饰符标记 [`getValue()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.properties/-read-only-property/get-value.html) 或 [`setValue()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.properties/-read-write-property/set-value.html) 函数时，编译器现在会检查它们是否具有所需数量的数值实参。`getValue()` 函数必须恰好有两个数值实参，而 `setValue()` 函数必须恰好有三个。要进行迁移，请移除 `operator` 修饰符或更改方法签名。
>
> **弃用周期**：
>
> - 2.2.20：对数值实参过多的 `operator` `getValue()` 和 `setValue()` 函数报告警告
> - 2.4.0：将该警告提升为错误

### 禁止泛型调用中不一致的类型实参 {id="prohibit-inconsistent-type-arguments-in-generic-calls"}

> **问题**：[KTLC-373](https://youtrack.jetbrains.com/issue/KTLC-373)
>
> **组件**：核心语言
>
> **不兼容变更类型**：源码
>
> **简要总结**：在泛型调用中指定类型实参时，如果一个类型实参违反了依赖于另一个类型实参的上界约束，编译器现在会报告错误。如果类型形参相互依赖，请使用符合这些约束的类型实参，例如使用 `Container<Alpha, AlphaKey>()` 而不是 `Container<Alpha, BetaKey>()`。
>
> **弃用周期**：
>
> - 2.3.0：当泛型调用中的显式类型实参违反类型形参之间的上界约束时报告警告
> - 2.4.0：将该警告提升为错误

### 弃用对 `javaClass` 属性的引用 {id="deprecate-references-to-the-javaclass-property"}

> **问题**：[KTLC-375](https://youtrack.jetbrains.com/issue/KTLC-375)
>
> **组件**：Kotlin/JVM
>
> **不兼容变更类型**：源码
>
> **简要总结**：Kotlin 2.4.0 弃用了对 [`javaClass`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.jvm/java-class.html) 属性的属性引用，以减少与 `::class.java` 的混淆。使用 `.javaClass` 获取对象的运行时 Java 类，或使用 `::class.java` 获取 Java 类引用。
>
> **弃用周期**：
>
> - 2.4.0：对 `javaClass` 属性的属性引用报告警告

### 对于需要选择性加入的隐式枚举构造函数调用报告错误 {id="report-errors-for-implicit-enum-constructor-calls-that-require-opt-in"}

> **问题**：[KTLC-359](https://youtrack.jetbrains.com/issue/KTLC-359)
>
> **组件**：核心语言
>
> **不兼容变更类型**：源码
>
> **简要总结**：当枚举项隐式调用需要选择性加入的枚举主构造函数时，Kotlin 现在会报告错误。要进行迁移，请在枚举类或每个调用该构造函数的枚举项上添加 `@OptIn`。
>
> **弃用周期**：
>
> - 2.2.20：当枚举项隐式调用需要选择性加入的枚举主构造函数时报告警告
> - 2.4.0：将该警告提升为错误

### 禁止在枚举项上使用 `inline` 修饰符 {id="forbid-inline-modifier-on-enum-entries"}

> **问题**：[KTLC-361](https://youtrack.jetbrains.com/issue/KTLC-361)
>
> **组件**：核心语言
>
> **不兼容变更类型**：源码
>
> **简要总结**：如果您在枚举项上使用 `inline` 修饰符，Kotlin 现在会报告错误。
>
> **弃用周期**：
>
> - 2.3.0：在枚举项上使用 `inline` 修饰符时报告警告
> - 2.4.0：将该警告提升为错误

### 禁止在注解调用和参数默认值之外使用数组字面量 {id="prohibit-array-literals-outside-annotation-calls-and-parameter-defaults"}

> **问题**：[KTLC-369](https://youtrack.jetbrains.com/issue/KTLC-369)
>
> **组件**：核心语言
>
> **不兼容变更类型**：源码
>
> **简要总结**：在注解调用和注解参数默认值之外使用数组字面量现在会导致错误。要进行迁移，请使用 `arrayOf(...)`，例如使用 `Roles(arrayOf("admin", "user"))` 而不是 `Roles(["admin", "user"])`。
> 
> **弃用周期**：
>
> - 2.3.0：对注解调用和注解参数默认值之外的数组字面量报告警告
> - 2.4.0：将该警告提升为错误

### 在 CLI 编译器模式下禁止使用 `_root_ide_package_` {id="prohibit-rootidepackage-in-cli-compiler-mode"}

> **问题**：[KTLC-378](https://youtrack.jetbrains.com/issue/KTLC-378)
>
> **组件**：编译器
>
> **不兼容变更类型**：源码
>
> **简要总结**：在 CLI 编译器模式下使用仅限 IDE 的 `_root_ide_package_` 限定符现在会导致错误。
>
> **弃用周期**：
>
> - 2.3.20：对 CLI 编译器模式下的 `_root_ide_package_` 引用报告警告
> - 2.4.0：将该警告提升为错误

### 修正带有可变数量实参转换的函数引用的相等性 {id="correct-equality-for-function-references-with-vararg-conversions"}

> **问题**：[KTLC-385](https://youtrack.jetbrains.com/issue/KTLC-385)
>
> **组件**：Kotlin/JVM
>
> **不兼容变更类型**：行为
>
> **简要总结**：Kotlin/JVM 现在将具有不同转换的函数引用视为不相等。以前，当同一个函数引用还使用另一种转换时，Kotlin/JVM 在相等性检查中会忽略可变数量实参转换，因此即使只有一侧使用了可变数量实参转换，`getDefault(::foo) == getDefaultAndVararg(::foo)` 也可能返回 `true`。
>
> **弃用周期**：
>
> - 2.4.0：引入新行为

### 强制对伴生对象访问进行选择性加入 {id="enforce-opt-in-for-companion-object-access"}

> **问题**：[KTLC-386](https://youtrack.jetbrains.com/issue/KTLC-386)
>
> **组件**：核心语言
>
> **不兼容变更类型**：源码
>
> **简要总结**：当类名引用解析为需要选择性加入的伴生对象时，Kotlin 现在会报告选择性加入错误。例如，如果 `C` 解析为标记有选择性加入注解的伴生对象，则 `val p = C` 需要选择性加入。
>
> **弃用周期**：
>
> - 2.3.20：当伴生对象访问需要选择性加入时报告警告
> - 2.4.0：对于 `ERROR` 级别的选择性加入要求，将其提升为错误

### 报告来自带有嵌套泛型实参的超类型的类型不匹配 {id="report-type-mismatches-from-supertypes-with-nested-generic-arguments"}

> **问题**：[KTLC-372](https://youtrack.jetbrains.com/issue/KTLC-372)
>
> **组件**：核心语言
>
> **不兼容变更类型**：源码
>
> **简要总结**：当编译器检测到涉及带有嵌套泛型实参的超类型的类型不匹配时，现在会报告错误。以前，编译器可能会漏掉这种不匹配，从而导致稍后出现 `ClassCastException` 失败。要进行迁移，请使用与接收者的泛型类型匹配的类型实参，或移除显式类型实参以便编译器可以进行推断。
>
> **弃用周期**：
>
> - 2.4.0：对涉及带有嵌套泛型实参的超类型的类型不匹配报告错误

### 禁止包含不可访问声明的推断类型 {id="prohibit-inferred-types-with-inaccessible-declarations"}

> **问题**：[KTLC-363](https://youtrack.jetbrains.com/issue/KTLC-363)
>
> **组件**：核心语言
>
> **不兼容变更类型**：源码
>
> **简要总结**：使用包含在当前作用域内不可访问的声明的推断类型现在会导致错误。
>
> **弃用周期**：
>
> - 2.3.0：当推断类型包含在当前作用域内不可访问的声明时报告警告
> - 2.4.0：将该警告提升为错误

## 标准库 {id="standard-library"}

### 弃用 `kotlin.io.readLine()` 函数 {id="deprecate-kotlin-io-readline-function"}

> **问题**：[KTLC-394](https://youtrack.jetbrains.com/issue/KTLC-394)
>
> **组件**：kotlin-stdlib
>
> **不兼容变更类型**：源码
>
> **简要总结**：[`kotlin.io.readLine()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.io/read-line.html) 函数已弃用。请使用 [`readln()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.io/readln.html) 函数代替 `readLine()!!`，并使用 [`readlnOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.io/readln-or-null.html) 函数代替 `readLine()`。
>
> **弃用周期**：
>
> - 2.4.0：使用 `kotlin.io.readLine()` 时报告警告

### 弃用 `AbstractCoroutineContextKey` 及相关 API {id="deprecate-abstractcoroutinecontextkey-and-related-apis"}

> **问题**：[KT-84970](https://youtrack.jetbrains.com/issue/KT-84970)
>
> **组件**：kotlin-stdlib
>
> **不兼容变更类型**：源码
>
> **简要总结**：[`AbstractCoroutineContextKey`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines/-abstract-coroutine-context-key/) 类及其相关 API 自 Kotlin 1.3 以来一直处于实验性阶段，且已被证明容易出错。因此，该类以及相关的 [`getPolymorphicElement()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines/get-polymorphic-element.html) 和 [`minusPolymorphicKey()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines/minus-polymorphic-key.html) 函数已被弃用。
>
> **弃用周期**：
>
> - 2.4.0：使用已弃用的 API 时报告警告

### 更改 `Random.nextDouble()` 处理无限边界的契约 {id="change-random-nextdouble-contract-for-infinite-bounds"}

> **问题**：[KT-84368](https://youtrack.jetbrains.com/issue/KT-84368)
>
> **组件**：kotlin-stdlib
>
> **不兼容变更类型**：行为
>
> **简要总结**：[`Random.nextDouble(until)`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.random/-random/next-double.html) 的文档契约现在要求 `until` 边界必须是有限的。请改用有限边界。
>
> **弃用周期**：
>
> - 2.4.0：启用新行为

## 工具 {id="tools"}

### 弃用旧版 Kotlin/JS 编译器类型选择 API {id="deprecate-legacy-kotlin-js-compiler-type-selection-apis"}

> **问题**：[KT-64275](https://youtrack.jetbrains.com/issue/KT-64275), [KT-84753](https://youtrack.jetbrains.com/issue/KT-84753)
>
> **组件**：Gradle
>
> **不兼容变更类型**：源码
>
> **简要总结**：Kotlin 2.4.0 移除了与选择旧版 Kotlin/JS 编译器类型相关的已弃用 Gradle API。
> 
> 此外，`KotlinJsCompilerType` 枚举和带有编译器类型形参的 `KotlinProjectExtension.js()` 重载已被弃用。要进行迁移，请从 `js()` 目标声明中移除编译器类型实参，并改用 `js {}` 块。
>
> **弃用周期**：
>
> - 1.8.0：弃用旧版 Kotlin/JS 编译器类型常量
> - 2.4.0：移除已弃用的旧版编译器类型 API，并在使用 `KotlinJsCompilerType` 或带有编译器类型形参的 `KotlinProjectExtension.js()` 重载时报告警告

### 弃用 Kotlin Android 扩展中的 `sourceSets` {id="deprecate-sourcesets-in-the-kotlin-android-extension"}

> **问题**：[KT-74451](https://youtrack.jetbrains.com/issue/KT-74451)
>
> **组件**：Gradle
>
> **不兼容变更类型**：源码
>
> **简要总结**：`KotlinAndroidProjectExtension` 中的 `sourceSets` 属性已弃用。要进行迁移，请改为通过 Android Gradle 插件的 `android { sourceSets { ... } }` 块配置源集。
>
> **弃用周期**：
>
> - 2.4.0：从 `KotlinAndroidProjectExtension` 访问 `sourceSets` 时报告警告

### 移除 Kotlin/Native Apple 框架的可消耗配置 {id="remove-consumable-configurations-for-kotlin-native-apple-frameworks"}

> **问题**：[KT-74503](https://youtrack.jetbrains.com/issue/KT-74503), [KT-82230](https://youtrack.jetbrains.com/issue/KT-82230)
>
> **组件**：Gradle
>
> **不兼容变更类型**：源码
>
> **简要总结**：Kotlin 2.4.0 移除了将 Kotlin/Native Apple 框架作为外发构件暴露的已生成的 Gradle 可消耗配置。
>
> **弃用周期**：
>
> - 2.4.0：移除 Kotlin/Native Apple 框架的可消耗配置

### 从 Kotlin Gradle 插件中移除已弃用的任务、编译和 DSL API {id="remove-deprecated-task-compilation-and-dsl-apis-from-the-kotlin-gradle-plugin"}

> **问题**：[KT-85509](https://youtrack.jetbrains.com/issue/KT-85509)
>
> **组件**：Gradle
>
> **不兼容变更类型**：源码
>
> **简要总结**：Kotlin 2.4.0 移除了以下已弃用的 Kotlin Gradle 插件 API：
>
> 编译任务配置 API：
>   * `KotlinJvmCompile.parentKotlinOptions`
>   * `KotlinJvmCompile.moduleName`
>   * `KotlinJvmFactory.createKotlinJvmOptions()`
>   * `KotlinCompile` 和 `Kotlin2JsCompile` 任务中的 `BaseKotlinCompile.moduleName`
> 
> Kotlin 多平台层次结构和目标 API：
>   * `DeprecatedKotlinTargetHierarchyDsl`
>   * `KotlinMultiplatformExtension.targetHierarchy`
>   * `KotlinTargetComponent.sourcesArtifacts`
>   * `KotlinTarget.sourceSets`
>   * `KotlinHierarchyBuilder.withoutCompilations()`
>   * `KotlinHierarchyBuilder.filterCompilations()`
>   * `KotlinHierarchyBuilder.withWasm()`
>   * `KotlinCompilation.defaultSourceSetName`
> 
> Kotlin 编译任务 API：
>   * `KotlinCompilation.compileKotlinTaskProvider`
>   * `KotlinCompilation.compileKotlinTask`
>
> Kotlin 依赖项处理程序 API：
>   * `KotlinDependencyHandler.enforcedPlatform()`
>   * `KotlinDependencyHandler.platform()`
> 其他已弃用的任务和扩展 API：
>   * `KaptExtension.processors`
>   * `KotlinTest.excludes`
>   * `KotlinTest.fileResolver`
>   * `KotlinTest.execHandleFactory`
>   * `IncrementalSyncTask.destinationDir`
>
> 要进行迁移，请停止使用这些 API，并改用弃用诊断信息中建议的替代方案。
>
> **弃用周期**：
>
> - 2.4.0：移除已弃用的 API

### 弃用显式缩减的类路径快照配置 {id="deprecate-explicit-shrunk-classpath-snapshot-configuration"}

> **问题**：[KT-75837](https://youtrack.jetbrains.com/issue/KT-75837)
>
> **组件**：构建工具 API 
>
> **不兼容变更类型**：源码
>
> **简要总结**：`ClasspathSnapshotBasedIncrementalCompilationApproachParameters` 中的 `shrunkClasspathSnapshot` 配置参数已弃用。缩减的类路径快照是内部增量编译缓存，因此编译器现在会在增量编译器元数据 `workingDirectory` 下自动创建并管理它。要进行迁移，请使用自动管理的快照文件，而不是向 `shrunkClasspathSnapshot` 传递值。
>
> **弃用周期**：
>
> - 2.4.0：使用 `shrunkClasspathSnapshot` 时报告警告

### 移除冗余的 ABI 验证 Gradle DSL 元素 {id="remove-redundant-abi-validation-gradle-dsl-elements"}

> **问题**：[KT-80685](https://youtrack.jetbrains.com/issue/KT-80685)
>
> **组件**：Gradle
>
> **不兼容变更类型**：源码
>
> **简要总结**：Kotlin 2.4.0 简化了 [ABI 验证](gradle-binary-compatibility-validation.md) Gradle DSL 并移除了冗余的配置项。要进行迁移，请直接在 `abiValidation {}` 而不是 `abiValidation { legacyDump { ... } }` 中配置报告设置，移除 `abiValidation { klib { enabled = ... } }`，并使用 `keepLocallyUnsupportedTargets` 代替 `klib.keepUnsupportedTargets`。
>
> **弃用周期**：
>
> - 2.4.0：移除冗余的 ABI 验证 DSL 元素

### 弃用过时的 Compose 编译器 Gradle 插件选项 {id="deprecate-obsolete-compose-compiler-gradle-plugin-options"}

> **问题**：[KT-85343](https://youtrack.jetbrains.com/issue/KT-85343)
>
> **组件**：Gradle
>
> **不兼容变更类型**：源码
>
> **简要总结**：在 Kotlin 2.4.0 中，以下已弃用的 Compose 编译器 Gradle 插件选项在使用时现在会报告错误：
>
> * `generateFunctionKeyMetaClasses`
> * `enableIntrinsicRemember`
> * `enableNonSkippingGroupOptimization`
> * `enableStrongSkippingMode`
> * `stabilityConfigurationFile`
> * `ComposeFeatureFlag.StrongSkipping`
> * `ComposeFeatureFlag.IntrinsicRemember`
>
> 请使用 `featureFlags` 代替已弃用的功能选项，并使用 `stabilityConfigurationFiles` 代替 `stabilityConfigurationFile`。
>
> **弃用周期**：
>
> - 2.0.20：对 `enableIntrinsicRemember`、`enableNonSkippingGroupOptimization` 和 `enableStrongSkippingMode` 报告警告
> - 2.1.0：对 `stabilityConfigurationFile` 报告警告
> - 2.4.0：将这些警告提升为错误

### 对过时的 Kotlin/Native Gradle 任务 API 报告错误 {id="report-errors-for-obsolete-kotlin-native-gradle-task-apis"}

> **问题**：[KT-85510](https://youtrack.jetbrains.com/issue/KT-85510)
>
> **组件**：Gradle
>
> **不兼容变更类型**：源码
>
> **简要总结**：以下已弃用的 Kotlin/Native Gradle 任务 API 在使用时现在会报告错误：
>
> `AbstractKotlinNativeCompile` 属性：
>
> * `additionalCompilerOptions`
> * `languageSettings`
> * `progressiveMode`
>
> `KotlinNativeCompile` 属性：
>
> * `moduleName`
> * `konanDataDir`
> * `konanHome`
> * `languageVersion`
> * `apiVersion`
> * `enabledLanguageFeatures`
> * `optInAnnotationsInUse`
> * `additionalCompilerOptions`
>
> `CInteropProcess` 属性：
>
> * `outputFile`
> * `konanDataDir`
> * `konanHome`
> * `defFile`
>
> `KotlinNativeLink` 属性：
>
> * `languageSettings`
> * `additionalCompilerOptions`
> * `konanDataDir`
> * `konanHome`
>
> 此外，`KotlinNativeLink.compilation` 属性已被移除。
>
> **弃用周期**：
>
> - 2.4.0：对已弃用的 Kotlin/Native Gradle 任务 API 报告错误，移除 `KotlinNativeLink.compilation` 属性

### 对编译器实参值的大小写不匹配报告警告 {id="report-warnings-for-case-mismatches-in-compiler-argument-values"}

> **问题**：[KT-86059](https://youtrack.jetbrains.com/issue/KT-86059)
>
> **组件**：构建工具 API
>
> **不兼容变更类型**：源码
>
> **简要总结**：接受固定值集合的编译器实参以前对字母大小写的处理并不一致：部分实参接受任意字母大小写，而其他实参则要求完全匹配。[构建工具 API](build-tools-api.md) 现在对这些值接受任意字母大小写但会报告警告，例如 `Case mismatch for -module-kind: expected 'commonjs', got 'CommonJS'`。要进行迁移，请使用[编译器参考](compiler-reference.md)中为该实参列出的字母大小写。
>
> **弃用周期**：
>
> - 2.4.20：当编译器实参值的字母大小写与预期值不匹配时报告警告