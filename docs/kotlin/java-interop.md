[//]: # (title: 在 Kotlin 中调用 Java)
[//]: # (description: 了解如何在 Kotlin 中调用 Java 代码，包括 getter 和 setter、空安全与平台类型、为 null 性注解、映射类型以及 SAM 转换。)

Kotlin 在设计时就充分考虑了与 Java 的互操作性。既可以以自然的方式在 Kotlin 中调用现有的 Java 代码，也可以在 Java 中使用 Kotlin 代码。

大多数 Java 代码无需额外配置即可直接使用：

```kotlin
import java.util.*

fun demo(source: List<Int>) {
    val list = ArrayList<Int>()
    // 'for' 循环适用于 Java 集合：
    for (item in source) {
        list.add(item)
    }
    // 运算符约定同样有效：
    for (i in 0..<source.size) {
        list[i] = source[i] // 调用了 get 和 set
    }
}
```

## Getter 与 Setter {id="getters-and-setters"}

遵循 Java 中 getter 与 setter 约定（以 `get` 开头的无参方法和以 `set` 开头的单实参方法）的方法在 Kotlin 中表示为属性。此类属性也称为*合成属性*（synthetic properties）。
`Boolean` 访问器方法（其中 getter 名称以 `is` 开头且 setter 名称以 `set` 开头）表示为与 getter 方法同名的属性。

```kotlin
import java.util.Calendar

fun calendarDemo() {
    val calendar = Calendar.getInstance()
    if (calendar.firstDayOfWeek == Calendar.SUNDAY) { // 调用 getFirstDayOfWeek()
        calendar.firstDayOfWeek = Calendar.MONDAY     // 调用 setFirstDayOfWeek()
    }
    if (!calendar.isLenient) {    // 调用 isLenient()
        calendar.isLenient = true // 调用 setLenient()
    }
}
```

上面的 `calendar.firstDayOfWeek` 就是合成属性的一个示例。

请注意，如果 Java 类只有 setter，它在 Kotlin 中将不会显示为属性，因为 Kotlin 不支持只写属性（set-only properties）。

只有无参 getter 才会表示为合成属性。如果 getter 存在带实参的重载，该重载不会暴露为属性，在大多数情况下你需要使用其完整方法名进行调用。请考虑以下 Java 类：

```java
// Java
public class Greeting {
    public String getMessage() {
        return "Hello!";
    }

    public String getMessage(String name) {
        return "Hello, " + name + "!";
    }
}
```

无参的 `getMessage()` 方法可通过合成属性 `message` 访问。若要使用重载的 `getMessage(String)` 方法，请将其作为函数调用：

```kotlin
// Kotlin
fun main() {
    val greeting = Greeting()
    println(greeting.message)              // 通过合成属性访问 getMessage()
    println(greeting.getMessage("Kotlin")) // 调用重载的 getMessage(String) 方法
}
```

调用 `greeting.message("Kotlin")` 无法通过编译，并会产生未解析的引用错误（接收者类型不匹配），因为 `message` 属性不接受实参。

然而，在某些情况下，当带形参的 Java 方法重写了 Kotlin [成员扩展属性](extensions.md#declaring-extensions-as-members)的 getter 时，Kotlin 会将该方法视为属性。因此，你只能在接收者的作用域内将其作为属性调用，而不能通过其方法名调用：

```java
// Java
public class Greeter implements Message {
    public String getText(String name) {
        return "Hello, " + name + "!";
    }
}
```

```kotlin
// Kotlin
interface Message {
    val String.text: String
}

fun demo(greeter: Greeter) {
    greeter.getText("Kotlin")       // 错误：未解析的引用
    with(greeter) { "Kotlin".text } // 通过成员扩展属性访问 getText(String)
}
```

## 返回 `void` 的方法 {id="methods-returning-void"}

如果 Java 方法返回 `void`，在 Kotlin 中调用时其返回值类型将变为 `Unit`。如果你使用该返回值，由于该值预先已知，Kotlin 编译器会在调用站点赋值 `Unit`。

## 转义 Kotlin 关键字对应的 Java 标识符 {id="escaping-for-java-identifiers-that-are-keywords-in-kotlin"}

某些 Kotlin 关键字在 Java 中是有效标识符：`in`、`object`、`is` 等。如果 Java 库对某个方法使用了 Kotlin 关键字，你仍然可以通过反引号（`）字符对其进行转义并调用：

```kotlin
matcher.`is`(expected)
```

## 空安全与平台类型 {id="null-safety-and-platform-types"}

Java 中的任何引用都可能为 `null`，这使得 Kotlin 对严格空安全的要求对于来自 Java 的对象变得不切实际。Java 声明的类型在 Kotlin 中被视为不可显式表述的类型，称为[_平台类型_](https://kotlinlang.org/spec/type-system.html#platform-types)（platform types）。你不能在代码中显式编写这种不可表述的类型。因此，当将平台类型的值赋给 Kotlin 变量时，你可以：

* 依赖类型推断。在此情况下，该变量具有推断出的平台类型。
* 选择你期望的类型。Kotlin 允许可空类型和不可空类型。

针对平台类型的 null 检查放宽了限制，因此它们与[映射的 Java 类型](#mapped-types)具有相同的安全保证。请考虑以下示例：

```kotlin
val list = ArrayList<String>() // 非空（构造函数结果）
list.add("Item")
val size = list.size // 非空（原生 int）
val item = list[0] // 推断为平台类型（普通 Java 对象）
```

当你在平台类型的变量上调用方法时，Kotlin 在编译时不会报告为 null 性错误，但由于空指针异常或 Kotlin 为防止 null 传播而生成的断言，该调用可能会在运行时失败：

```kotlin
item.substring(1) // 允许，如果 item == null 则抛出异常
```

你可以将平台类型的值赋给可空或不可空的 Kotlin 类型变量。但是，如果你将此类值赋给不可空类型的变量，而该值在运行时实际上为 `null`，Kotlin 会抛出 `NullPointerException`。为了避免这种情况，请在 Kotlin 代码中添加显式的为 null 性：

```kotlin
val nullable: String? = item // 允许，始终有效
val notNull: String = item // 允许，可能在运行时失败
```

如果选择不可空类型，编译器将在赋值时生成一个断言。这可以防止 Kotlin 的不可空变量持有 null。当你将平台值传递给期望非空值的 Kotlin 函数时，以及在其他情况下，也会生成断言。总体而言，编译器会尽最大努力防止 null 在程序中广泛传播，尽管有时由于泛型的存在，这无法彻底杜绝。

### 平台类型的表示法 {id="notation-for-platform-types"}

如前一节所述，平台类型无法在程序中显式提及，因此语言中没有针对它们的语法。不过，编译器和 IDE 有时需要显示它们（例如在错误消息或形参信息中），因此有一种助记表示法：

* `T!` 表示“`T` 或 `T?`”
* `(Mutable)Collection<T>!` 表示“`T` 的 Java 集合可能是可变的或不可变的，可能是可空的或不可空的”
* `Array<(out) T>!` 表示“`T`（或 `T` 的子类型）的 Java 数组，可空或不可空”

当你在错误消息或 IDE 工具提示中看到此表示法时，可以为 Kotlin 变量添加显式类型注解以恢复空安全检查，或者使用为 null 性注解在源头上消除平台类型。

### 为 null 性注解 {id="nullability-annotations"}

带有为 null 性注解的 Java 类型不会表示为平台类型，而是表示为实际的可空或不可空 Kotlin 类型。编译器支持多种风格的为 null 性注解，包括：

* [JetBrains](https://www.jetbrains.com/idea/help/nullable-and-notnull-annotations.html)
  （来自 `org.jetbrains.annotations` 软件包的 `@Nullable` 和 `@NotNull`）
* [JSpecify](#jspecify-support) (`org.jspecify.annotations`)
* Android (`com.android.annotations`, `android.support.annotation`, `androidx.annotation`, `android.annotation`)
* [JSR-305](#jsr-305-support) (`javax.annotation`)
* FindBugs (`edu.umd.cs.findbugs.annotations`)
* Eclipse (`org.eclipse.jdt.annotation`)
* [Lombok](lombok.md) (`lombok.NonNull`)
* RxJava 3 (`io.reactivex.rxjava3.annotations`)
* [Vert.x](https://vertx.io/) (`io.vertx.codegen.annotations`)

你可以使用以下编译器选项指示编译器针对特定的为 null 性注解报告为 null 性不匹配：

```bash
-Xnullability-annotations=@<package-name>:<report-level>
``` 

为完全限定的为 null 性注解指定包名，并指定以下报告级别之一：

* `ignore` 忽略为 null 性不匹配
* `warn` 报告警告
* `strict` 报告错误。

> [JSpecify](#jspecify-support) 是唯一默认使用 `strict` 报告级别的受支持风格。
> 无需额外配置即可使用它来针对为 null 性注解报告错误。
>
{style="note"}

请在 [Kotlin 编译器源代码](https://github.com/JetBrains/kotlin/blob/master/core/compiler.common.jvm/src/org/jetbrains/kotlin/load/java/JvmAnnotationNames.kt)中查看受支持的为 null 性注解的完整列表。

### 可变性注解 {id="mutability-annotations"}

你可以使用可变性注解来为 Java 声明添加注解，以指定返回的集合在 Kotlin 中是只读的还是可变的。如果将该值赋给具有不同可变性的集合类型，编译器会报告类型不匹配。诊断严重级别取决于具体的唯可变性注解。

编译器支持多种可变性注解，包括：

* `kotlin.annotations.jvm.ReadOnly`
* `kotlin.annotations.jvm.Mutable`
* `org.jetbrains.annotations.Unmodifiable`
* `org.jetbrains.annotations.UnmodifiableView`

请在 [Kotlin 编译器源代码](https://github.com/JetBrains/kotlin/blob/master/core/compiler.common.jvm/src/org/jetbrains/kotlin/load/java/JvmAnnotationNames.kt)中查看受支持的可变性注解的完整列表。

### 为类型实参与类型形参添加注解 {id="annotating-type-arguments-and-type-parameters"}

你还可以为泛型类型的类型实参与类型形参添加注解，为其提供为 null 性信息。

> 本节中的所有示例均使用来自 `org.jetbrains.annotations` 包的 JetBrains 为 null 性注解。
>
{style="note"}

#### 类型实参 {id="type-arguments"}

请考虑 Java 声明中的这些注解：

```java
@NotNull
Set<@NotNull String> toSet(@NotNull Collection<@NotNull String> elements) { ... }
```

它们在 Kotlin 中对应以下签名：

```kotlin
fun toSet(elements: (Mutable)Collection<String>) : (Mutable)Set<String> { ... }
```

当类型实参缺少 `@NotNull` 注解时，将得到平台类型：

```kotlin
fun toSet(elements: (Mutable)Collection<String!>) : (Mutable)Set<String!> { ... }
```

Kotlin 还会考虑基类和接口的类型实参上的为 null 性注解。例如，有两个具有如下签名的 Java 类：

```java
public class Base<T> {}
```

```java
public class Derived extends Base<@Nullable String> {}
```

在 Kotlin 代码中，在假定需要 `Base<String>` 的地方传递 `Derived` 的实例会产生警告。

```kotlin
fun takeBaseOfNotNullStrings(x: Base<String>) {}

fun main() {
    takeBaseOfNotNullStrings(Derived()) // 警告：为 null 性不匹配
}
```

`Derived` 的上界设置为 `Base<String?>`，这与 `Base<String>` 不同。

详细了解 [Kotlin 中的 Java 泛型](#java-generics-in-kotlin)。

#### 类型形参 {id="type-parameters"}

默认情况下，Kotlin 和 Java 中普通类型形参的为 null 性都是未定义的。在 Java 中，可以使用为 null 性注解来指定它。我们来为 `Base` 类的类型形参添加注解：

```java
public class Base<@NotNull T> {}
```

从 `Base` 继承时，Kotlin 期望一个不可空的类型实参或类型形参。因此，以下 Kotlin 代码会产生警告：

```kotlin
class Derived<K> : Base<K> {} // 警告：K 具有未定义的为 null 性
```

你可以通过指定上界 `K : Any` 来修复此问题。

Kotlin 还支持对 Java 类型形参的界限添加为 null 性注解。我们来为 `Base` 添加界限：

```java
public class BaseWithBound<T extends @NotNull Number> {}
```

Kotlin 将其转换为如下内容：

```kotlin
class BaseWithBound<T : Number> {}
```

因此，传递可空类型作为类型实参或类型形参会产生警告。

为类型实参与类型形参添加注解适用于 Java 8 及更高版本的目标平台。此功能要求为 null 性注解支持 `TYPE_USE` 目标（`org.jetbrains.annotations` 在 15 及以上版本中支持此特性）。

> 如果为 null 性注解除了 `TYPE_USE` 目标之外还支持适用于类型的其他目标，则 `TYPE_USE` 优先。例如，如果 `@Nullable` 同时具有 `TYPE_USE` 和 `METHOD` 目标，则 Java 方法签名 `@Nullable String[] f()` 在 Kotlin 中将变为 `fun f(): Array<String?>!`。
>
{style="note"}

### JSpecify 支持 {id="jspecify-support"}

Kotlin 支持 [JSpecify](https://jspecify.dev/) 为 null 性注解，它为 Java 为 null 性提供了一套统一的注解。JSpecify 允许你为 Java 声明提供详细的为 null 性信息，帮助 Kotlin 在与 Java 代码交互时保持空安全。

Kotlin 支持 `org.jspecify.annotations` 包中的以下注解：

* `@Nullable` 将类型标记为可空。
* `@NonNull` 将类型标记为不可空。
* `@NullMarked` 将某个作用域（例如类或包）内的所有类型默认标记为不可空，除非另有注解。

  此注解不适用于局部变量和[类型变量（泛型）](https://jspecify.dev/docs/user-guide/#using-type-variables-in-generic-types)。在提供特定的可空或不可空类型之前，类型变量保持“null 无感知”（null-agnostic）。

* `@NullUnmarked` 反转 `@NullMarked` 的效果，使该作用域内的所有类型变为[平台类型](#null-safety-and-platform-types)。

请考虑以下带有 JSpecify 注解的 Java 类：
 
```java
// Java
import org.jspecify.annotations.*;

@NullMarked
public class InventoryService {
    public String notNull() { return ""; }
    public @Nullable String nullable() { return null; }
}
```
 
在 Kotlin 中，它们会被视为常规的可空和不可空类型，而不是[平台类型](#null-safety-and-platform-types)：
 
```kotlin
// Kotlin
fun test(inventory: InventoryService) {
    inventory.notNull().length  // 正常
    inventory.nullable().length // 错误：只允许安全调用（?.）或非空断言调用（!!）
}
```

默认情况下，Kotlin 编译器将 JSpecify 注解的为 null 性不匹配报告为错误。你可以使用以下编译器选项自定义 JSpecify 为 null 性诊断的严重级别：

```bash
-Xjspecify-annotations=<report-level>
```

可用的报告级别包括：

| 级别     | 描述                                                 |
|----------|------------------------------------------------------|
| `strict` | 针对为 null 性不匹配报告错误（默认）。               |
| `warn`   | 报告警告。                                           |
| `ignore` | 忽略为 null 性不匹配。                               |

> 有关 JSpecify 注解的更多信息，请参阅 [JSpecify 用户指南](https://jspecify.dev/docs/user-guide)。
> 
{type="tip"}

### JSR-305 支持 {id="jsr-305-support"}

支持使用在 [JSR-305](https://jcp.org/en/jsr/detail?id=305) 中定义的 [`@Nonnull`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/Nonnull.html) 注解来表示 Java 类型的为 null 性。

如果 `@Nonnull(when = ...)` 的值为 `When.ALWAYS`，则被注解的类型将被视为不可空；`When.MAYBE` 和 `When.NEVER` 表示可空类型；而 `When.UNKNOWN` 则强制该类型为[平台类型](#null-safety-and-platform-types)。

库可以针对 JSR-305 注解进行编译，但无需让带有注解的构件（例如 `jsr305.jar`）成为库使用者的编译依赖项。即使类路径上不存在这些注解，Kotlin 编译器也可以从库中读取 JSR-305 注解。

还支持[自定义为 null 性限定符 (KEEP-79)](https://github.com/Kotlin/KEEP/blob/master/proposals/jsr-305-custom-nullability-qualifiers.md)（见下文）。

#### 类型限定符别名 {id="type-qualifier-nicknames"}

如果某个注解类型同时被 [`@TypeQualifierNickname`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/meta/TypeQualifierNickname.html) 和 JSR-305 `@Nonnull`（或其另一个别名，例如 `@CheckForNull`）注解，则该注解类型本身将用于检索精确的为 null 性，并且具有与该为 null 性注解相同的含义：

```java
@TypeQualifierNickname
@Nonnull(when = When.ALWAYS)
@Retention(RetentionPolicy.RUNTIME)
public @interface MyNonnull {
}

@TypeQualifierNickname
@CheckForNull // 另一个类型限定符别名的别名
@Retention(RetentionPolicy.RUNTIME)
public @interface MyNullable {
}

interface A {
    @MyNullable String foo(@MyNonnull String x);
    // 在 Kotlin（strict 模式）中：`fun foo(x: String): String?`

    String bar(List<@MyNonnull String> x);
    // 在 Kotlin（strict 模式）中：`fun bar(x: List<String>!): String!`
}
```

#### 类型限定符默认值 {id="type-qualifier-defaults"}

[`@TypeQualifierDefault`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/meta/TypeQualifierDefault.html) 允许引入在应用时定义被注解元素作用域内默认为 null 性的注解。

此类注解类型本身应同时被 `@Nonnull`（或其别名）和包含一个或多个 `ElementType` 值的 `@TypeQualifierDefault(...)` 注解：

* `ElementType.METHOD` 用于方法的返回值类型
* `ElementType.PARAMETER` 用于值形参
* `ElementType.FIELD` 用于字段
* `ElementType.TYPE_USE` 用于任何类型，包括类型实参、类型形参的上界和通配符类型

当类型本身未被为 null 性注解所注解时，将使用默认的为 null 性，且默认值由最内层外围元素决定，该外围元素需要被带有与类型用途相匹配的 `ElementType` 的类型限定符默认值注解所注解。

```java
@Nonnull
@TypeQualifierDefault({ElementType.METHOD, ElementType.PARAMETER})
public @interface NonNullApi {
}

@Nonnull(when = When.MAYBE)
@TypeQualifierDefault({ElementType.METHOD, ElementType.PARAMETER, ElementType.TYPE_USE})
public @interface NullableApi {
}

@NullableApi
interface A {
    String foo(String x); // 在 Kotlin 中：fun foo(x: String?): String?

    @NonNullApi // 重写接口中的默认值
    String bar(String x, @Nullable String y); // 在 Kotlin 中：fun bar(x: String, y: String?): String

    // List<String> 的类型实参被视为可空，因为 `@NullableApi`
    // 具有 `TYPE_USE` 元素类型：
    String baz(List<String> x); // 在 Kotlin 中：fun baz(List<String?>?): String?

    // `x` 形参的类型仍为平台类型，因为存在显式
    // 标记为 UNKNOWN 的为 null 性注解：
    String qux(@Nonnull(when = When.UNKNOWN) String x); // 在 Kotlin 中：fun qux(x: String!): String?
}
```

> 此示例中的类型仅在启用 strict 模式时生效；否则，平台类型仍将保留。请参阅 [`@UnderMigration` 注解](#undermigration-annotation) 与[编译器配置](#compiler-configuration)部分。
>
{style="note"}

还支持包级别的默认为 null 性：

```java
// FILE: test/package-info.java
@NonNullApi // 声明包 'test' 中的所有类型默认不可空
package test;
```

#### @UnderMigration 注解 {id="undermigration-annotation"}

库维护者可以使用 `@UnderMigration` 注解（在独立的构件 `kotlin-annotations-jvm` 中提供）来定义为 null 性类型限定符的迁移状态。

`@UnderMigration(status = ...)` 中的状态值指定了编译器如何处理 Kotlin 中被注解类型的不当使用（例如将带有 `@MyNullable` 注解的类型值当作非空使用）：

* `MigrationStatus.STRICT` 让注解像任何常规为 null 性注解一样工作，即针对不当用法报告错误，并影响被注解声明在 Kotlin 中所见的类型
* `MigrationStatus.WARN`：不当用法将报告为编译警告而不是错误，但被注解声明中的类型仍保留为平台类型
* `MigrationStatus.IGNORE` 让编译器完全忽略该为 null 性注解

库维护者可以为类型限定符别名和类型限定符默认值添加 `@UnderMigration` 状态：

```java
@Nonnull(when = When.ALWAYS)
@TypeQualifierDefault({ElementType.METHOD, ElementType.PARAMETER})
@UnderMigration(status = MigrationStatus.WARN)
public @interface NonNullApi {
}

// 该类中的类型是不可空的，但由于 `@NonNullApi` 被标记为
// `@UnderMigration(status = MigrationStatus.WARN)`，因此仅报告警告
@NonNullApi
public class Test {}
```

> 为 null 性注解的迁移状态不会被其类型限定符别名继承，但会应用于其在默认类型限定符中的使用。
>
{style="note"}

如果默认类型限定符使用了类型限定符别名，且两者都带有 `@UnderMigration`，则使用默认类型限定符的状态。

#### 编译器配置 {id="compiler-configuration"}

可以通过添加带有以下值（及其组合）的 `-Xjsr305` 编译器选项来配置 JSR-305 检查：

* `-Xjsr305={strict|warn|ignore}` 用于设置非 `@UnderMigration` 注解的行为。自定义为 null 性限定符（尤其是 `@TypeQualifierDefault`）已经在许多知名库中广泛使用，用户在更新到包含 JSR-305 支持的 Kotlin 版本时可能需要平滑迁移。此选项仅影响非 `@UnderMigration` 注解。
* `-Xjsr305=under-migration:{strict|warn|ignore}` 用于替换 `@UnderMigration` 注解的行为。用户对库的迁移状态可能有不同的看法：他们可能希望在官方迁移状态为 `WARN` 时将其视为错误，反之亦然，他们可能希望推迟报告某些库的错误，直到完成迁移。
* `-Xjsr305=@<fq.name>:{strict|warn|ignore}` 用于替换单个注解的行为，其中 `<fq.name>` 是注解的完全限定类名。可以多次出现以针对不同的注解。这对于管理特定库的迁移状态非常有用。

`strict`、`warn` 和 `ignore` 值的含义与 `MigrationStatus` 中的相同，并且只有 `strict` 模式会影响被注解声明在 Kotlin 中所见的类型。

> 内置的 JSR-305 注解 [`@Nonnull`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/Nonnull.html)、[`@Nullable`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/3.0.1/javax/annotation/Nullable.html) 和 [`@CheckForNull`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/CheckForNull.html) 始终处于启用状态，并且无论是否使用 `-Xjsr305` 选项进行编译器配置，都会影响被注解声明在 Kotlin 中的类型。
>
{style="note"}

例如，将 `-Xjsr305=ignore -Xjsr305=under-migration:ignore -Xjsr305=@org.library.MyNullable:warn` 添加到编译器实参中，会使编译器仅针对带有 `@org.library.MyNullable` 注解的类型的不当使用生成警告，并忽略所有其他 JSR-305 注解。

默认行为与 `-Xjsr305=warn` 相同。`strict` 值应被视为实验性的（将来可能会为其添加更多检查）。

## 映射类型 {id="mapped-types"}

Kotlin 会专门处理某些 Java 类型。此类类型不是从 Java 中“按原样”加载的，而是*映射*（mapped）到相应的 Kotlin 类型。这种映射仅在编译时起作用，运行时表示保持不变。Java 的原生类型映射到相应的 Kotlin 类型（请注意[平台类型](#null-safety-and-platform-types)）：

| **Java 类型** | **Kotlin 类型**  |
|---------------|------------------|
| `byte`        | `kotlin.Byte`    |
| `short`       | `kotlin.Short`   |
| `int`         | `kotlin.Int`     |
| `long`        | `kotlin.Long`    |
| `char`        | `kotlin.Char`    |
| `float`       | `kotlin.Float`   |
| `double`      | `kotlin.Double`  |
| `boolean`     | `kotlin.Boolean` |

某些非原生的内置类也会进行映射：

| **Java 类型**                     | **Kotlin 类型**        |
|-----------------------------------|------------------------|
| `java.lang.Object`                | `kotlin.Any!`          |
| `java.lang.Cloneable`             | `kotlin.Cloneable!`    |
| `java.lang.Comparable`            | `kotlin.Comparable!`   |
| `java.lang.Enum`                  | `kotlin.Enum!`         |
| `java.lang.annotation.Annotation` | `kotlin.Annotation!`   |
| `java.lang.CharSequence`          | `kotlin.CharSequence!` |
| `java.lang.String`                | `kotlin.String!`       |
| `java.lang.Number`                | `kotlin.Number!`       |
| `java.lang.Throwable`             | `kotlin.Throwable!`    |

Java 的装箱原生类型映射为可空的 Kotlin 类型：

| **Java 类型**         | **Kotlin 类型**   |
|-----------------------|-------------------|
| `java.lang.Byte`      | `kotlin.Byte?`    |
| `java.lang.Short`     | `kotlin.Short?`   |
| `java.lang.Integer`   | `kotlin.Int?`     |
| `java.lang.Long`      | `kotlin.Long?`    |
| `java.lang.Character` | `kotlin.Char?`    |
| `java.lang.Float`     | `kotlin.Float?`   |
| `java.lang.Double`    | `kotlin.Double?`  |
| `java.lang.Boolean`   | `kotlin.Boolean?` |

请注意，用作类型形参的装箱原生类型会映射为平台类型：例如，`List<java.lang.Integer>` 在 Kotlin 中会变为 `List<Int!>`。

在 Kotlin 中集合类型可以是只读的或可变的，因此 Java 集合的映射如下（下表中的所有 Kotlin 类型均位于 `kotlin.collections` 包中）：

| **Java 类型**     | **Kotlin 只读类型**       | **Kotlin 可变类型**            | **加载的平台类型**                   |
|-------------------|---------------------------|--------------------------------|--------------------------------------|
| `Iterator<T>`     | `Iterator<T>`             | `MutableIterator<T>`           | `(Mutable)Iterator<T>!`              |
| `Iterable<T>`     | `Iterable<T>`             | `MutableIterable<T>`           | `(Mutable)Iterable<T>!`              |
| `Collection<T>`   | `Collection<T>`           | `MutableCollection<T>`         | `(Mutable)Collection<T>!`            |
| `Set<T>`          | `Set<T>`                  | `MutableSet<T>`                | `(Mutable)Set<T>!`                   |
| `List<T>`         | `List<T>`                 | `MutableList<T>`               | `(Mutable)List<T>!`                  |
| `ListIterator<T>` | `ListIterator<T>`         | `MutableListIterator<T>`       | `(Mutable)ListIterator<T>!`          |
| `Map<K, V>`       | `Map<K, V>`               | `MutableMap<K, V>`             | `(Mutable)Map<K, V>!`                |
| `Map.Entry<K, V>` | `Map.Entry<K, V>`         | `MutableMap.MutableEntry<K,V>` | `(Mutable)Map.(Mutable)Entry<K, V>!` |

Java 数组按[下文](#java-arrays)所述进行映射：

| **Java 类型** | **Kotlin 类型**                |
|---------------|--------------------------------|
| `int[]`       | `kotlin.IntArray!`             |
| `String[]`    | `kotlin.Array<(out) String!>!` |

> 这些 Java 类型的 static 成员无法在对应 Kotlin 类型的[伴生对象](object-declarations.md#companion-objects)上直接访问。若要调用它们，请[使用 Java 类型的完全限定名称](#accessing-static-members)，例如 `java.lang.Integer.toHexString(255)`。
>
{style="note"}

## Kotlin 中的 Java 泛型 {id="java-generics-in-kotlin"}

Kotlin 的泛型与 Java 的略有不同（参见[泛型](generics.md)）。在将 Java 类型导入 Kotlin 时，会进行以下转换：

* Java 的通配符转换为类型投影：
  * `Foo<? extends Bar>` 变为 `Foo<out Bar!>!`
  * `Foo<? super Bar>` 变为 `Foo<in Bar!>!`

* Java 的原始类型转换为星投影：
  * `List` 变为 `List<*>!`，即 `List<out Any?>!`

与 Java 一样，Kotlin 的泛型在运行时不会保留：对象不携带传递给其构造函数的实际类型实参的信息。例如，`ArrayList<Integer>()` 与 `ArrayList<Character>()` 在运行时是无法区分的。这使得考虑泛型的 `is` 检查变得不可行。Kotlin 仅允许对星投影的泛型类型进行 `is` 检查：

```kotlin
if (a is List<Int>) // 错误：无法检查它是否确实是 List<Int>
// 但
if (a is List<*>)   // 正确：不对列表的内容做出保证
```

## Java 数组 {id="java-arrays"}

与 Java 不同，Kotlin 中的数组是不型变的（invariant）。这意味着 Kotlin 不允许将 `Array<String>` 赋值给 `Array<Any>`，从而避免了可能发生的运行时故障。向 Kotlin 方法传递子类的数组作为超类的数组也是被禁止的，但对于 Java 方法，通过形如 `Array<(out) String>!` 的[平台类型](#null-safety-and-platform-types)是允许这样做的。

在 Java 平台上，数组与原生数据类型一起使用以避免装箱/拆箱操作的开销。由于 Kotlin 隐藏了这些实现细节，因此需要一种变通方案来与 Java 代码对接。针对每种原生类型数组都有专门的类（`IntArray`、`DoubleArray`、`CharArray` 等）来处理这种情况。它们与 `Array` 类无关，并且会被编译为 Java 的原生数组以实现最佳性能。

假设有一个接受 int 索引数组的 Java 方法：

``` java
public class JavaArrayExample {
    public void removeIndices(int[] indices) {
        // 你的代码
    }
}
```

要传递原生类型的值数组，可以在 Kotlin 中执行以下操作：

```kotlin
val javaObj = JavaArrayExample()
val array = intArrayOf(0, 1, 2, 3)
javaObj.removeIndices(array) // 将 int[] 传递给方法
```

当编译为 JVM 字节码时，编译器会优化对数组的访问，因此不会引入任何开销：

```kotlin
val array = arrayOf(1, 2, 3, 4)
array[1] = array[1] * 2 // 不会生成对 get() 和 set() 的实际调用
for (x in array) {      // 不会创建迭代器
    print(x)
}
```

即使使用索引进行遍历，也不会引入任何开销：

```kotlin
for (i in array.indices) { // 不会创建迭代器
    array[i] += 2
}
```

最后，`in` 检查同样没有开销：

```kotlin
if (i in array.indices) { // 等同于 (i >= 0 && i < array.size)
    print(array[i])
}
```

## Java 可变参数 {id="java-varargs"}

Java 类有时会使用带有可变数量实参（varargs）的方法声明来接收索引：

``` java
public class JavaArrayExample {

    public void removeIndicesVarArg(int... indices) {
        // 你的代码
    }
}
```

在这种情况下，你需要使用扩展运算符 `*` 来传递 `IntArray`：

```kotlin
val javaObj = JavaArrayExample()
val array = intArrayOf(0, 1, 2, 3)
javaObj.removeIndicesVarArg(*array)
```

## 运算符 {id="operators"}

由于 Java 无法标记哪些方法适合使用运算符语法，因此 Kotlin 允许将任何具有正确名称和签名的 Java 方法用作运算符重载及其他约定（如 `invoke()` 等）。不允许使用中缀调用语法调用 Java 方法。

例如，对于声明了 `get(int)` 和 `set(int, T)` 方法的 Java 类，你可以在 Kotlin 中将其与索引访问运算符配合使用：

```java
public class IntContainer {
    private final int[] values = new int[10];

    public int get(int index) {
        return values[index];
    }

    public void set(int index, int value) {
        values[index] = value;
    }
}
```

```kotlin
fun main() {
    val container = IntContainer()
    container[0] = 42     // 调用 set(0, 42)
    println(container[0]) // 调用 get(0)
}
```

## 受检异常 {id="checked-exceptions"}

在 Kotlin 中，所有[异常都是非受检的](exceptions.md)，这意味着编译器不会强制你捕获其中的任何异常。因此，当你调用声明了受检异常的 Java 方法时，Kotlin 不会强迫你执行任何操作：

```kotlin
fun render(list: List<*>, to: Appendable) {
    for (item in list) {
        to.append(item.toString()) // 在 Java 中，你需要捕获 Appendable.append() 抛出的 IOException
    }
}
```

## Object 的方法 {id="object-methods"}

当 Java 类型被导入 Kotlin 时，所有类型为 `java.lang.Object` 的引用都会转换为 `Any`。由于 `Any` 不是平台专有的，它仅声明了 `toString()`、`hashCode()` 和 `equals()` 作为其成员，因此为了使 `java.lang.Object` 的其他成员可用，Kotlin 使用了[扩展函数](extensions.md)。

### `wait()` 与 `notify()` {id="wait-and-notify"}

`Any` 类型的引用上没有提供 `wait()` 和 `notify()` 方法。通常不建议使用它们，而建议改用 `java.util.concurrent`。

如果必须调用这些方法，可以通过 Java 对象访问它们，并抑制 `PLATFORM_CLASS_MAPPED_TO_KOTLIN` 警告：

```kotlin
import java.util.LinkedList

class SimpleBlockingQueue<T>(private val capacity: Int) {
    private val queue = LinkedList<T>()

    // 使用 java.lang.Object 实例来访问 wait() 和 notify()
    // 在 Kotlin 中，标准的 'Any' 类型没有暴露这些方法
    @Suppress("PLATFORM_CLASS_MAPPED_TO_KOTLIN")
    private val lock = Object()

    fun put(item: T) {
        synchronized(lock) {
            while (queue.size >= capacity) {
                lock.wait()
            }
            queue.add(item)
            println("Produced: $item")

            lock.notifyAll()
        }
    }

    fun take(): T {
        synchronized(lock) {
            while (queue.isEmpty()) {
                lock.wait()
            }
            val item = queue.removeFirst()
            println("Consumed: $item")

            lock.notifyAll()
            return item
        }
    }
}
```

或者显式转换为 `java.lang.Object` 并抑制 `PLATFORM_CLASS_MAPPED_TO_KOTLIN` 警告：

```kotlin
@Suppress("PLATFORM_CLASS_MAPPED_TO_KOTLIN")
(instance as java.lang.Object).wait()
```

### `getClass()` {id="getclass"}

要检索对象的 Java 类，请在[类引用](reflection.md#obtain-a-runtime-class)上使用 `java` 扩展属性：

```kotlin
val instanceClass = instance::class.java
```

上述代码使用了[绑定的类引用](lambdas.md#bound-and-unbound-references)。你还可以使用 `javaClass` 扩展属性：

```kotlin
val instanceClass = instance.javaClass
```

### `clone()` {id="clone"}

要重写 `clone()`，你的类需要继承 `kotlin.Cloneable`：

```kotlin
class Example : Cloneable {
    override fun clone(): Any { ... }
}
```

不要忘记《[Effective Java（第 3 版）](https://www.oracle.com/technetwork/java/effectivejava-136174.html)》第 13 条：*谨慎地重写 clone*。

### `finalize()` {id="finalize"}

要重写 `finalize()`，在声明时不要使用 `override` 关键字：

```kotlin
class C {
    protected fun finalize() {
        // 终结逻辑
    }
}
```

根据 Java 规则，`finalize()` 不能是 `private` 的。

> `finalize()` 方法在现代 Java 版本中已被弃用。请考虑改用 [`java.lang.ref.Cleaner`](https://docs.oracle.com/javase/9/docs/api/java/lang/ref/Cleaner.html) 或 [try-with-resources](https://docs.oracle.com/javase/tutorial/essential/exceptions/tryResourceClose.html) 等替代方案。
>
{style="note"}

## 继承 Java 类 {id="inheritance-from-java-classes"}

Kotlin 中的类最多只能将一个 Java 类（以及任意数量的 Java 接口）作为超类型。

## 访问 static 成员 {id="accessing-static-members"}

Java 类的 static 成员会构成这些类的“伴生对象”。你不能将此类“伴生对象”作为值到处传递，但可以显式访问其成员，例如：

```kotlin
if (Character.isLetter(a)) { ... }
```

要调用已导入 Java 类的 static 方法，直接使用类名即可，就像在 Java 中一样。请考虑以下 Java 类：

```java
package org.example;

public class MathUtils {
    public static int triple(int value) {
        return value * 3;
    }
}
```

导入该类并通过类名调用其 static 方法：

```kotlin
import org.example.MathUtils

fun main() {
    println(MathUtils.triple(5)) // 调用 static triple() 方法
}
```

要访问[映射](#mapped-types)到 Kotlin 类型的 Java 类型的 static 成员，请使用该 Java 类型的完全限定名称：`java.lang.Integer.bitCount(5)`。

## Java 反射 {id="java-reflection"}

Java 反射可用于 Kotlin 类，反之亦然。如前所述，你可以使用 `instance::class.java`、`ClassName::class.java` 或 `instance.javaClass` 通过 `java.lang.Class` 进入 Java 反射。不要为此目的使用 `ClassName.javaClass`，因为它引用的是 `ClassName` 的[伴生对象](object-declarations.md#companion-objects)类，相当于 `ClassName.Companion::class.java`，而不是 `ClassName::class.java`。

对于每种原生类型，都有两种不同的 Java 类，Kotlin 提供了获取这两者的方法。例如，`Int::class.java` 将返回表示原生类型本身的类实例，对应于 Java 中的 `Integer.TYPE`。要获取对应包装类型的类，请使用 `Int::class.javaObjectType`，它相当于 Java 的 `Integer.class`。

其他受支持的用例包括：为 Kotlin 属性获取 Java getter/setter 方法或支持字段、为 Java 字段获取 `KProperty`、为 `KFunction` 获取 Java 方法或构造函数，反之亦然。

## SAM 转换 {id="sam-conversions"}

Kotlin 同时支持对 Java 和 [Kotlin 接口](fun-interfaces.md)进行 SAM 转换。针对 Java 的此支持意味着，只要接口方法的形参类型与 Kotlin 函数的形参类型相匹配，Kotlin 函数字面量就可以自动转换为具有单个非默认方法的 Java 接口的实现。

你可以使用它来创建 SAM 接口的实例：

```kotlin
val runnable = Runnable { println("This runs in a runnable") }
```

以及在方法调用中使用：

```kotlin
val executor = Executors.newSingleThreadExecutor()
// Java 签名：void execute(Runnable command)
executor.execute { println("This runs in a thread pool") }
```

如果 Java 类具有多个接受函数式接口的方法，你可以通过使用将 lambda 转换为特定 SAM 类型的适配器函数来选择需要调用的方法。这些适配器函数在需要时也会由编译器生成：

```kotlin
executor.execute(Runnable { println("This runs in a thread pool") })
```

> SAM 转换仅适用于接口。它们不适用于抽象类，即使这些类只有一个抽象方法。
>
{style="note"}

## 在 Kotlin 中使用 JNI {id="using-jni-with-kotlin"}

要声明在原生代码（C 或 C++）中实现的函数，需要使用 `external` 修饰符对其进行标记：

```kotlin
external fun calculateSum(x: Int): Double
```

其余过程与 Java 中的完全相同。

你还可以将属性的 getter 和 setter 标记为 `external`：

```kotlin
var myProperty: String
    external get
    external set
```

在底层，这将创建两个函数 `getMyProperty` 和 `setMyProperty`，两者均被标记为 `external`。

## 在 Kotlin 中使用 Lombok 生成的声明 {id="using-lombok-generated-declarations-in-kotlin"}

你可以在 Kotlin 代码中使用 Java 的 Lombok 生成的声明。如果你需要在同一个 Java/Kotlin 混合模块中生成并使用这些声明，可以在 [Lombok 编译器插件页面](lombok.md)了解操作方法。如果你从另一个模块调用此类声明，则无需使用该插件来编译该模块。