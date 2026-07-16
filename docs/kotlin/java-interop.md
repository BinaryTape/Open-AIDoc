[//]: # (title: 在 Kotlin 中调用 Java 代码)

Kotlin 的设计充分考虑了与 Java 的互操作性。既有的 Java 代码可以自然地在 Kotlin 中调用，Kotlin 代码也可以相当顺畅地在 Java 中使用。在本节中，我们将详细介绍在 Kotlin 中调用 Java 代码的一些细节。

几乎所有的 Java 代码都可以无障碍地使用：

```kotlin
import java.util.*

fun demo(source: List<Int>) {
    val list = ArrayList<Int>()
    // 'for' 循环适用于 Java 集合：
    for (item in source) {
        list.add(item)
    }
    // 运算符约定也同样适用：
    for (i in 0..source.size - 1) {
        list[i] = source[i] // 调用了 get 和 set
    }
}
```

## Getter 与 Setter

符合 Java 的 Getter 和 Setter 约定（名称以 `get` 开头的无参方法和以 `set` 开头的单参数方法）的方法在 Kotlin 中被表示为属性。此类属性也被称为“合成属性”（synthetic properties）。
`Boolean` 访问器方法（Getter 名称以 `is` 开头且 Setter 名称以 `set` 开头）被表示为与 Getter 方法同名的属性。

```kotlin
import java.util.Calendar

fun calendarDemo() {
    val calendar = Calendar.getInstance()
    if (calendar.firstDayOfWeek == Calendar.SUNDAY) { // 调用 getFirstDayOfWeek()
        calendar.firstDayOfWeek = Calendar.MONDAY // 调用 setFirstDayOfWeek()
    }
    if (!calendar.isLenient) { // 调用 isLenient()
        calendar.isLenient = true // 调用 setLenient()
    }
}
```

上例中的 `calendar.firstDayOfWeek` 就是合成属性的一个例子。

请注意，如果 Java 类仅包含 Setter，则它在 Kotlin 中作为属性是不可见的，因为 Kotlin 不支持仅限 set（set-only）的属性。

## Java 合成属性引用

> 此功能是[实验性的](components-stability.md#stability-levels-explained)。它可能随时被删除或更改。我们建议你仅出于评估目的使用它。
>
{style="warning"}

从 Kotlin 1.8.20 开始，你可以创建对 Java 合成属性的引用。考虑以下 Java 代码：

```java
public class Person {
    private String name;
    private int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() {
        return name;
    }

    public int getAge() {
        return age;
    }
}
```

Kotlin 一直允许你编写 `person.age`，其中 `age` 是一个合成属性。现在，你还可以创建对 `Person::age` 和 `person::age` 的引用。这对于 `name` 同样适用。

```kotlin
val persons = listOf(Person("Jack", 11), Person("Sofie", 12), Person("Peter", 11))
    persons
         // 调用对 Java 合成属性的引用：
        .sortedBy(Person::age)
         // 通过 Kotlin 属性语法调用 Java Getter：
        .forEach { person -> println(person.name) }
```

### 如何启用 Java 合成属性引用 {initial-collapse-state="collapsed" collapsible="true"}

要启用此功能，请设置 `-language-version 2.1` 编译器选项。在 Gradle 项目中，你可以通过在 `build.gradle(.kts)` 中添加以下内容来实现：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks
    .withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask<*>>()
    .configureEach {
        compilerOptions
            .languageVersion
            .set(
                org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_2_1
            )
    }
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
tasks
    .withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask.class)
    .configureEach {
        compilerOptions.languageVersion
            = org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_2_1
}
```

</tab>
</tabs>

> 在 Kotlin 1.9.0 之前，要启用此功能，你需要设置 `-language-version 1.9` 编译器选项。
> 
{style="note"}

## 返回 void 的方法

如果一个 Java 方法返回 `void`，则在 Kotlin 中调用该方法时它将返回 `Unit`。
如果有人碰巧使用了该返回值，它将在调用站点由 Kotlin 编译器进行赋值，因为值本身是预先确定的（即 `Unit`）。

## 对作为 Kotlin 关键字的 Java 标识符进行转义

一些 Kotlin 关键字在 Java 中是有效的标识符，例如：`in`、`object`、`is` 等。
如果 Java 库对方法使用了 Kotlin 关键字，你仍然可以使用反引号（`）字符进行转义来调用该方法：

```kotlin
foo.`is`(bar)
```

## 空安全与平台类型

Java 中的任何引用都可能为 `null`，这使得 Kotlin 的严格空安全要求对于来自 Java 的对象来说变得不切实际。
Java 声明的类型在 Kotlin 中以特定方式处理，被称为“平台类型”（platform types）。对于此类类型，null 检查被放宽，因此其安全保证与 Java 中相同（详见[下文](#mapped-types)）。

考虑以下示例：

```kotlin
val list = ArrayList<String>() // 非 null (构造函数结果)
list.add("Item")
val size = list.size // 非 null (原生 int)
val item = list[0] // 推断为平台类型 (普通 Java 对象)
```

当你对平台类型的变量调用方法时，Kotlin 在编译时不会报告为 null 性错误，但调用可能会在运行时失败，原因可能是空指针异常，或者是 Kotlin 为了防止 null 传播而生成的断言：

```kotlin
item.substring(1) // 允许，如果 item == null 则抛出异常
```

平台类型是“不可表示的”（non-denotable），这意味着你不能在语言中显式写出它们。
当平台值被赋值给 Kotlin 变量时，你可以依靠类型推断（此时变量将具有推断出的平台类型，如上例中的 `item`），也可以选择你期望的类型（允许使用可空类型和非空类型）：

```kotlin
val nullable: String? = item // 允许，始终有效
val notNull: String = item // 允许，可能在运行时失败
```

如果你选择非空类型，编译器会在赋值时发出断言。这可以防止 Kotlin 的非空变量持有 null。当你将平台值传递给期望非空值的 Kotlin 函数时，以及在其他情况下，也会发出断言。
总的来说，编译器会尽力防止 null 在程序中远距离传播，尽管由于泛型的原因，有时无法完全消除。

### 平台类型的表示法

如上所述，平台类型不能在程序中显式提及，因此语言中没有相应的语法。
尽管如此，编译器和 IDE 有时需要显示它们（例如，在错误消息或形参提示中），因此有一种助记表示法：

* `T!` 表示“`T` 或 `T?`”，
* `(Mutable)Collection<T>!` 表示“`T` 的 Java 集合可能是可变的也可能不是，可能可空也可能不可空”，
* `Array<(out) T>!` 表示“`T`（或 `T` 的子类型）的 Java 数组，可能可空也可能不可空”

### 为 null 性注解

具有为 null 性注解的 Java 类型不被表示为平台类型，而是表示为实际的可空或非空 Kotlin 类型。编译器支持多种风格的为 null 性注解，包括：

  * [JetBrains](https://www.jetbrains.com/idea/help/nullable-and-notnull-annotations.html)
（来自 `org.jetbrains.annotations` 软件包的 `@Nullable` 和 `@NotNull`）
  * [JSpecify](#jspecify-support) (`org.jspecify.annotations`)
  * Android (`com.android.annotations` 和 `android.support.annotations`)
  * [JSR-305](#jsr-305-support) (`javax.annotation`)
  * FindBugs (`edu.umd.cs.findbugs.annotations`)
  * Eclipse (`org.eclipse.jdt.annotation`)
  * [Lombok](lombok.md) (`lombok.NonNull`)
  * RxJava 3 (`io.reactivex.rxjava3.annotations`)
  * [Vert.x](https://vertx.io/) (`io.vertx.codegen.annotations`)

你可以通过以下编译器选项，指示编译器针对特定的为 null 性注解报告为 null 性不匹配：

```bash
-Xnullability-annotations=@<package-name>:<report-level>
``` 

指定完全限定为 null 性注解的软件包名称，并指定以下报告级别之一：

* `ignore` 忽略为 null 性不匹配
* `warn` 报告警告
* `strict` 报告错误。

> [JSpecify](#jspecify-support) 是唯一默认使用 `strict` 报告级别的支持风格。使用它可以对为 null 性注解报告错误，而无需额外配置。
>
{style="note"}

在 [Kotlin 编译器源代码](https://github.com/JetBrains/kotlin/blob/master/core/compiler.common.jvm/src/org/jetbrains/kotlin/load/java/JvmAnnotationNames.kt)中查看受支持的为 null 性注解的完整列表。

### 可变性注解

你可以使用可变性注解来标记 Java 声明，以指定返回的集合在 Kotlin 中是只读的还是可变的。
如果你将该值赋值给具有不同可变性的集合类型，编译器将报告类型不匹配。诊断的严重程度取决于特定的可变性注解。

编译器支持多种可变性注解，包括：

* `kotlin.annotations.jvm.ReadOnly`
* `kotlin.annotations.jvm.Mutable`
* `org.jetbrains.annotations.Unmodifiable`
* `org.jetbrains.annotations.UnmodifiableView`

在 [Kotlin 编译器源代码](https://github.com/JetBrains/kotlin/blob/master/core/compiler.common.jvm/src/org/jetbrains/kotlin/load/java/JvmAnnotationNames.kt)中查看受支持的可变性注解的完整列表。

### 对类型实参与类型形参进行注解

你还可以对泛型类型的类型实参和类型形参进行注解，以为其提供为 null 性信息。 

> 本节中的所有示例都使用了来自 `org.jetbrains.annotations` 软件包的 JetBrains 为 null 性注解。
>
{style="note"}

#### 类型实参

考虑 Java 声明中的这些注解：

```java
@NotNull
Set<@NotNull String> toSet(@NotNull Collection<@NotNull String> elements) { ... }
```

它们在 Kotlin 中会产生以下签名：

```kotlin
fun toSet(elements: (Mutable)Collection<String>) : (Mutable)Set<String> { ... }
```

当类型实参缺失 `@NotNull` 注解时，你会得到一个平台类型：

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

在 Kotlin 代码中，将 `Derived` 实例传递给假定为 `Base<String>` 的地方会产生警告。

```kotlin
fun takeBaseOfNotNullStrings(x: Base<String>) {}

fun main() {
    takeBaseOfNotNullStrings(Derived()) // 警告：为 null 性不匹配
}
```

`Derived` 的上界被设置为 `Base<String?>`，这与 `Base<String>` 不同。

详细了解 [Kotlin 中的 Java 泛型](#java-generics-in-kotlin)。

#### 类型形参

默认情况下，Kotlin 和 Java 中普通类型形参的为 null 性都是未定义的。在 Java 中，你可以使用为 null 性注解来指定它。让我们对 `Base` 类的类型形参进行注解：

```java
public class Base<@NotNull T> {}
```

当继承 `Base` 时，Kotlin 期望一个非空的类型实参或类型形参。因此，以下 Kotlin 代码会产生警告：

```kotlin
class Derived<K> : Base<K> {} // 警告：K 具有未定义的为 null 性
```

你可以通过指定上界 `K : Any` 来修复它。

Kotlin 还支持对 Java 类型形参的边界进行为 null 性注解。让我们给 `Base` 添加边界：

```java
public class BaseWithBound<T extends @NotNull Number> {}
```

Kotlin 将此翻译如下：

```kotlin
class BaseWithBound<T : Number> {}
```

因此，传递可空类型作为类型实参或类型形参会产生警告。

对类型实参和类型形参进行注解适用于 Java 8 或更高目标。该功能要求为 null 性注解支持 `TYPE_USE` 目标（`org.jetbrains.annotations` 在 15 及以上版本中支持此功能）。

> 如果为一个为 null 性注解除了 `TYPE_USE` 目标外还支持其他适用于该类型的目标，则 `TYPE_USE` 优先。例如，如果 `@Nullable` 同时具有 `TYPE_USE` 和 `METHOD` 目标，那么 Java 方法签名 `@Nullable String[] f()` 在 Kotlin 中会变为 `fun f(): Array<String?>!`。
>
{style="note"}

### JSpecify 支持

Kotlin 支持 [JSpecify](https://jspecify.dev/) 为 null 性注解，它为 Java 为 null 性提供了一套统一的注解。JSpecify 允许你为 Java 声明提供详细的为 null 性信息，帮助 Kotlin 在处理 Java 代码时保持空安全。

Kotlin 支持 `org.jspecify.annotations` 软件包中的以下注解：

* `@Nullable` 将类型标记为可空。
* `@NonNull` 将类型标记为非空。
* `@NullMarked` 默认将作用域内（例如类或软件包）的所有类型标记为非空，除非另有注解。

  此注解不适用于局部变量和[类型变量（泛型）](https://jspecify.dev/docs/user-guide/#using-type-variables-in-generic-types)。类型变量在提供特定的可空或非空类型之前，保持“null 不可知”。

* `@NullUnmarked` 撤销 `@NullMarked` 的效果，将作用域内的所有类型设为[平台类型](#null-safety-and-platform-types)。

考虑以下带有 JSpecify 注解的 Java 类：
 
```java
// Java
import org.jspecify.annotations.*;

@NullMarked
public class InventoryService {
    public String notNull() { return ""; }
    public @Nullable String nullable() { return null; }
}
```
 
在 Kotlin 中，这些被视为常规的可空和非空类型，而不是[平台类型](#null-safety-and-platform-types)：
 
```kotlin
// Kotlin
fun test(inventory: InventoryService) {
   inventory.notNull().length // OK
   inventory.nullable().length // 错误：仅允许安全调用 (?.) 或非空断言 (!!) 调用
}
```

默认情况下，对于 JSpecify 注解导致的为 null 性不匹配，Kotlin 编译器会报告为错误。你可以使用以下编译器选项自定义 JSpecify 为 null 性诊断的严重级别：

```bash
-Xjspecify-annotations=<report-level>
```

可用的报告级别为：

| 级别 | 描述 |
|----------|------------------------------------------------------|
| `strict` | 对为 null 性不匹配报告错误（默认）。 |
| `warn`   | 报告警告。 |
| `ignore` | 忽略为 null 性不匹配。 |

> 有关 JSpecify 注解的更多信息，请参阅 [JSpecify 用户指南](https://jspecify.dev/docs/user-guide)。
> 
{type="tip"}

### JSR-305 支持

支持 [JSR-305](https://jcp.org/en/jsr/detail?id=305) 中定义的 [`@Nonnull`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/Nonnull.html) 注解来表示 Java 类型的为 null 性。

如果 `@Nonnull(when = ...)` 的值是 `When.ALWAYS`，则注解类型被视为非空；`When.MAYBE` 和 `When.NEVER` 表示可空类型；而 `When.UNKNOWN` 则强制该类型成为[平台类型](#null-safety-and-platform-types)。

库可以针对 JSR-305 注解进行编译，但无需将注解构件（例如 `jsr305.jar`）作为库使用者的编译依赖项。Kotlin 编译器可以从库中读取 JSR-305 注解，而无需在类路径中存在这些注解。

还支持[自定义为 null 性限定符 (KEEP-79)](https://github.com/Kotlin/KEEP/blob/master/proposals/jsr-305-custom-nullability-qualifiers.md)（见下文）。

#### 类型限定符别名

如果一个注解类型同时被 [`@TypeQualifierNickname`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/meta/TypeQualifierNickname.html) 和 JSR-305 `@Nonnull`（或其另一个别名，如 `@CheckForNull`）注解，那么该注解类型本身将被用于检索精确的为 null 性，且具有与该为 null 性注解相同的含义：

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
    // 在 Kotlin (strict 模式) 中: `fun foo(x: String): String?`

    String bar(List<@MyNonnull String> x);
    // 在 Kotlin (strict 模式) 中: `fun bar(x: List<String>!): String!`
}
```

#### 类型限定符默认值

[`@TypeQualifierDefault`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/meta/TypeQualifierDefault.html) 允许引入在应用时定义所注解元素作用域内默认为 null 性的注解。

此类注解类型本身应同时被 `@Nonnull`（或其别名）和具有一个或多个 `ElementType` 值的 `@TypeQualifierDefault(...)` 注解：

* `ElementType.METHOD` 用于方法的返回值类型
* `ElementType.PARAMETER` 用于值形参
* `ElementType.FIELD` 用于字段
* `ElementType.TYPE_USE` 用于任何类型，包括类型实参、类型形参的上界和通配符类型

当类型本身没有被为 null 性注解修饰时，将使用默认为 null 性，默认值由最内层包裹该元素且带有一个类型限定符默认值注解（其 `ElementType` 与该类型用法匹配）的元素确定。

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
    String foo(String x); // fun foo(x: String?): String?

    @NotNullApi // 重写来自接口的默认设置
    String bar(String x, @Nullable String y); // fun bar(x: String, y: String?): String

    // `List<String>` 类型实参被视为可空，因为 `@NullableApi`
    // 具有 `TYPE_USE` 元素类型：
    String baz(List<String> x); // fun baz(List<String?>?): String?

    // x 形参的类型仍为平台类型，因为存在显式的
    // 标记为 UNKNOWN 的为 null 性注解：
    String qux(@Nonnull(when = When.UNKNOWN) String x); // fun baz(x: String!): String?
}
```

> 本示例中的类型仅在启用 strict 模式时生效；否则将保留平台类型。请参阅 [`@UnderMigration` 注解](#undermigration-annotation)和[编译器配置](#compiler-configuration)章节。
>
{style="note"}

还支持软件包级别的默认为 null 性：

```java
// 文件: test/package-info.java
@NonNullApi // 声明软件包 'test' 中的所有类型默认为非空
package test;
```

#### @UnderMigration 注解

库维护者可以使用 `@UnderMigration` 注解（由独立构件 `kotlin-annotations-jvm` 提供）来定义为 null 性类型限定符的迁移状态。

`@UnderMigration(status = ...)` 中的状态值指定了编译器如何处理 Kotlin 中对注解类型的不当使用（例如将 `@MyNullable` 注解的类型值当作非空使用）：

* `MigrationStatus.STRICT` 使注解像任何普通为 null 性注解一样工作，即报告不当使用的错误，并影响 Kotlin 中看到的注解声明中的类型
* `MigrationStatus.WARN`：不当使用被报告为编译警告而不是错误，但注解声明中的类型仍保持为平台类型
* `MigrationStatus.IGNORE` 使编译器完全忽略该为 null 性注解

库维护者可以将 `@UnderMigration` 状态添加到类型限定符别名和类型限定符默认值中：

```java
@Nonnull(when = When.ALWAYS)
@TypeQualifierDefault({ElementType.METHOD, ElementType.PARAMETER})
@UnderMigration(status = MigrationStatus.WARN)
public @interface NonNullApi {
}

// 类中的类型为非空，但仅报告警告
// 因为 `@NonNullApi` 被标注为 `@UnderMigration(status = MigrationStatus.WARN)`
@NonNullApi
public class Test {}
```

> 为 null 性注解的迁移状态不会被其类型限定符别名继承，但会应用于其在默认类型限定符中的用法。
>
{style="note"}

如果默认类型限定符使用了类型限定符别名，且它们都被标注为 `@UnderMigration`，则使用默认类型限定符的状态。

#### 编译器配置

可以通过添加带有以下选项（及其组合）的 `-Xjsr305` 编译器标志来配置 JSR-305 检查：

* `-Xjsr305={strict|warn|ignore}` 用于设置非 `@UnderMigration` 注解的行为。自定义为 null 性限定符，尤其是 `@TypeQualifierDefault`，已经广泛存在于许多知名库中，用户在更新到包含 JSR-305 支持的 Kotlin 版本时可能需要平滑迁移。自 Kotlin 1.1.60 起，此标志仅影响非 `@UnderMigration` 注解。

* `-Xjsr305=under-migration:{strict|warn|ignore}` 用于重写 `@UnderMigration` 注解的行为。用户对库的迁移状态可能有不同的看法：他们可能希望在官方迁移状态为 `WARN` 时就报错，反之亦然，他们可能希望推迟某些错误的报告，直到完成迁移。

* `-Xjsr305=@<fq.name>:{strict|warn|ignore}` 用于重写单个注解的行为，其中 `<fq.name>` 是注解的完全限定类名。可以为不同的注解多次出现。这对于管理特定库的迁移状态非常有用。

`strict`、`warn` 和 `ignore` 值与 `MigrationStatus` 中的含义相同，且只有 `strict` 模式会影响 Kotlin 中看到的注解声明中的类型。

> 注意：内置的 JSR-305 注解 [`@Nonnull`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/Nonnull.html)、[`@Nullable`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/3.0.1/javax/annotation/Nullable.html) 和 [`@CheckForNull`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/CheckForNull.html) 始终处于启用状态，并影响 Kotlin 中注解声明的类型，无论 `-Xjsr305` 标志的编译器配置如何。
>
{style="note"}

例如，将 `-Xjsr305=ignore -Xjsr305=under-migration:ignore -Xjsr305=@org.library.MyNullable:warn` 添加到编译器参数中，将使编译器对被 `@org.library.MyNullable` 注解的类型的不当使用生成警告，并忽略所有其他 JSR-305 注解。

默认行为与 `-Xjsr305=warn` 相同。`strict` 值应被视为实验性的（将来可能会向其添加更多检查）。

## 映射类型

Kotlin 会对某些 Java 类型进行特殊处理。此类类型不会“照原样”从 Java 加载，而是被“映射”到对应的 Kotlin 类型。映射仅在编译时起作用，运行时表示形式保持不变。
 Java 的原生类型被映射到对应的 Kotlin 类型（同时考虑到[平台类型](#null-safety-and-platform-types)）：

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

一些非原生的内置类也会被映射：

| **Java 类型** | **Kotlin 类型**  |
|---------------|------------------|
| `java.lang.Object`       | `kotlin.Any!`    |
| `java.lang.Cloneable`    | `kotlin.Cloneable!`    |
| `java.lang.Comparable`   | `kotlin.Comparable!`    |
| `java.lang.Enum`         | `kotlin.Enum!`    |
| `java.lang.annotation.Annotation`   | `kotlin.Annotation!`    |
| `java.lang.CharSequence` | `kotlin.CharSequence!`   |
| `java.lang.String`       | `kotlin.String!`   |
| `java.lang.Number`       | `kotlin.Number!`     |
| `java.lang.Throwable`    | `kotlin.Throwable!`    |

Java 的装箱原生类型被映射到可空的 Kotlin 类型：

| **Java 类型**           | **Kotlin 类型**  |
|-------------------------|------------------|
| `java.lang.Byte`        | `kotlin.Byte?`   |
| `java.lang.Short`       | `kotlin.Short?`  |
| `java.lang.Integer`     | `kotlin.Int?`    |
| `java.lang.Long`        | `kotlin.Long?`   |
| `java.lang.Character`   | `kotlin.Char?`   |
| `java.lang.Float`       | `kotlin.Float?`  |
| `java.lang.Double`      | `kotlin.Double?`  |
| `java.lang.Boolean`     | `kotlin.Boolean?` |

请注意，用作类型形参的装箱原生类型会被映射为平台类型：例如，`List<java.lang.Integer>` 在 Kotlin 中变为 `List<Int!>`。

集合类型在 Kotlin 中可以是只读的或可变的，因此 Java 的集合映射如下（下表中的所有 Kotlin 类型都位于 `kotlin.collections` 软件包中）：

| **Java 类型** | **Kotlin 只读类型**  | **Kotlin 可变类型** | **加载的平台类型** |
|---------------|----------------------------|-------------------------|--------------------------|
| `Iterator<T>`        | `Iterator<T>`        | `MutableIterator<T>`            | `(Mutable)Iterator<T>!`            |
| `Iterable<T>`        | `Iterable<T>`        | `MutableIterable<T>`            | `(Mutable)Iterable<T>!`            |
| `Collection<T>`      | `Collection<T>`      | `MutableCollection<T>`          | `(Mutable)Collection<T>!`          |
| `Set<T>`             | `Set<T>`             | `MutableSet<T>`                 | `(Mutable)Set<T>!`                 |
| `List<T>`            | `List<T>`            | `MutableList<T>`                | `(Mutable)List<T>!`                |
| `ListIterator<T>`    | `ListIterator<T>`    | `MutableListIterator<T>`        | `(Mutable)ListIterator<T>!`        |
| `Map<K, V>`          | `Map<K, V>`          | `MutableMap<K, V>`              | `(Mutable)Map<K, V>!`              |
| `Map.Entry<K, V>`    | `Map.Entry<K, V>`    | `MutableMap.MutableEntry<K,V>` | `(Mutable)Map.(Mutable)Entry<K, V>!` |

Java 数组的映射如下面[下文](#java-arrays)所述：

| **Java 类型** | **Kotlin 类型**                |
|---------------|--------------------------------|
| `int[]`       | `kotlin.IntArray!`             |
| `String[]`    | `kotlin.Array<(out) String!>!` |

> 这些 Java 类型的静态成员无法直接在 Kotlin 类型的[伴生对象](object-declarations.md#companion-objects)上访问。要调用它们，请使用 Java 类型的完全限定名称，例如 `java.lang.Integer.toHexString(foo)`。
>
{style="note"}

## Kotlin 中的 Java 泛型

Kotlin 的泛型与 Java 的略有不同（请参阅[泛型](generics.md)）。将 Java 类型导入 Kotlin 时，会进行以下转换：

* Java 的通配符被转换为类型投影：
  * `Foo<? extends Bar>` 变为 `Foo<out Bar!>!`
  * `Foo<? super Bar>` 变为 `Foo<in Bar!>!`

* Java 的原始类型被转换为星投影：
  * `List` 变为 `List<*>!`，即 `List<out Any?>!`

与 Java 一样，Kotlin 的泛型在运行时不会保留：对象不会携带传递给其构造函数的实际类型实参的信息。例如，`ArrayList<Integer>()` 与 `ArrayList<Character>()` 是无法区分的。这使得执行考虑泛型的 `is` 检查变得不可能。Kotlin 仅允许对星投影的泛型类型进行 `is` 检查：

```kotlin
if (a is List<Int>) // 错误：无法检查它是否真的是 Int 列表
// 但是
if (a is List<*>) // OK：对列表内容不作保证
```

## Java 数组

与 Java 不同，Kotlin 中的数组是不变的（invariant）。这意味着 Kotlin 不允许你将 `Array<String>` 赋值给 `Array<Any>`，从而防止了潜在的运行时失败。同样，禁止将子类的数组作为超类的数组传递给 Kotlin 方法，但对于 Java 方法，通过 `Array<(out) String>!` 形式的[平台类型](#null-safety-and-platform-types)是允许的。

在 Java 平台上，数组与原生数据类型配合使用，以避免装箱/拆箱操作的开销。由于 Kotlin 隐藏了这些实现细节，因此需要一种变通方法来与 Java 代码接口。每种原生数组类型（`IntArray`、`DoubleArray`、`CharArray` 等）都有专门的类来处理这种情况。它们与 `Array` 类无关，并被编译成 Java 的原生数组，以获得最高性能。

假设有一个 Java 方法接受一个原生 int 类型的索引数组：

``` java
public class JavaArrayExample {
    public void removeIndices(int[] indices) {
        // 代码在此...
    }
}
```

要在 Kotlin 中传递原生值数组，你可以这样做：

```kotlin
val javaObj = JavaArrayExample()
val array = intArrayOf(0, 1, 2, 3)
javaObj.removeIndices(array)  // 将 int[] 传递给方法
```

编译为 JVM 字节码时，编译器会优化对数组的访问，因此不会引入额外开销：

```kotlin
val array = arrayOf(1, 2, 3, 4)
array[1] = array[1] * 2 // 不会生成对 get() 和 set() 的实际调用
for (x in array) { // 不会创建迭代器
    print(x)
}
```

即使你通过索引进行遍历，也不会引入任何开销：

```kotlin
for (i in array.indices) { // 不会创建迭代器
    array[i] += 2
}
```

最后，`in` 检查同样没有开销：

```kotlin
if (i in array.indices) { // 相当于 (i >= 0 && i < array.size)
    print(array[i])
}
```

## Java 可变参数

Java 类有时会对索引使用带有可变数量参数（varargs）的方法声明：

``` java
public class JavaArrayExample {

    public void removeIndicesVarArg(int... indices) {
        // 代码在此...
    }
}
```

在这种情况下，你需要使用扩展运算符 `*` 来传递 `IntArray`：

```kotlin
val javaObj = JavaArrayExample()
val array = intArrayOf(0, 1, 2, 3)
javaObj.removeIndicesVarArg(*array)
```

## 运算符

由于 Java 无法标记适用于运算符语法的方法，Kotlin 允许将任何具有正确名称和签名的 Java 方法用作运算符重载和其他约定（`invoke()` 等）。不允许使用中缀调用语法调用 Java 方法。

## 受检异常

在 Kotlin 中，所有[异常都是非受检的](exceptions.md)，这意味着编译器不会强制你捕获其中的任何一个。因此，当你调用声明了受检异常的 Java 方法时，Kotlin 不会强制你执行任何操作：

```kotlin
fun render(list: List<*>, to: Appendable) {
    for (item in list) {
        to.append(item.toString()) // Java 会要求我们在这里捕获 IOException
    }
}
```

## Object 方法

当 Java 类型被导入 Kotlin 时，所有 `java.lang.Object` 类型的引用都会变成 `Any`。由于 `Any` 是平台无关的，它仅声明了 `toString()`、`hashCode()` 和 `equals()` 作为其成员，因此为了使 `java.lang.Object` 的其他成员可用，Kotlin 使用了[扩展函数](extensions.md)。

### `wait()` 和 `notify()`

`wait()` 和 `notify()` 方法在 `Any` 类型的引用上不可用。通常不建议使用它们，而应优先使用 `java.util.concurrent`。

如果你必须调用这些方法，请通过 Java 对象访问它们，并抑制 `PLATFORM_CLASS_MAPPED_TO_KOTLIN` 警告：

```kotlin
import java.util.LinkedList

class SimpleBlockingQueue<T>(private val capacity: Int) {
    private val queue = LinkedList<T>()

    // 特别使用 java.lang.Object 来访问 wait() 和 notify()
    // 在 Kotlin 中，标准的 'Any' 类型不暴露这些方法。
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
(foo as java.lang.Object).wait()
```

### `getClass()`

要获取对象的 Java 类，请在[类引用](reflection.md#class-references)上使用 `java` 扩展属性：

```kotlin
val fooClass = foo::class.java
```

上面的代码使用了[绑定的类引用](reflection.md#bound-class-references)。你还可以使用 `javaClass` 扩展属性：

```kotlin
val fooClass = foo.javaClass
```

### `clone()`

要重写 `clone()`，你的类需要继承 `kotlin.Cloneable`：

```kotlin
class Example : Cloneable {
    override fun clone(): Any { ... }
}
```

不要忘记《Effective Java, 第 3 版》，第 13 条：*谨慎地重写 clone*。

### `finalize()`

要重写 `finalize()`，你只需声明它即可，无需使用 `override` 关键字：

```kotlin
class C {
    protected fun finalize() {
        // 终结逻辑
    }
}
```

根据 Java 的规则，`finalize()` 不得为 `private`。

## 继承 Java 类

在 Kotlin 中，一个类最多可以有一个 Java 类（以及任意数量的 Java 接口）作为超类型。

## 访问静态成员

Java 类的静态成员构成了这些类的“伴生对象”。你不能将这种“伴生对象”作为值传递，但可以显式访问其成员，例如：

```kotlin
if (Character.isLetter(a)) { ... }
```

要访问[映射](#mapped-types)为 Kotlin 类型的 Java 类型的静态成员，请使用 Java 类型的完全限定名称：`java.lang.Integer.bitCount(foo)`。

## Java 反射

Java 反射适用于 Kotlin 类，反之亦然。如上所述，你可以使用 `instance::class.java`、`ClassName::class.java` 或 `instance.javaClass` 通过 `java.lang.Class` 进入 Java 反射。
不要为了这个目的使用 `ClassName.javaClass`，因为它指的是 `ClassName` 的伴生对象类，这与 `ClassName.Companion::class.java` 相同，而不是 `ClassName::class.java`。

对于每种原生类型，都有两个不同的 Java 类，Kotlin 提供了获取这两者的方法。例如，`Int::class.java` 将返回表示原生类型本身的类实例，对应于 Java 中的 `Integer.TYPE`。要获取对应包装类型的类，请使用 `Int::class.javaObjectType`，它相当于 Java 的 `Integer.class`。

其他受支持的情况包括获取 Java 的 Getter/Setter 方法或 Kotlin 属性的支持字段、Java 字段的 `KProperty`、`KFunction` 的 Java 方法或构造函数，反之亦然。

## SAM 转换

Kotlin 支持 Java 和 [Kotlin 接口](fun-interfaces.md)的 SAM 转换。对 Java 的这种支持意味着 Kotlin 函数字面量可以自动转换为具有单个非默认方法的 Java 接口的实现，只要接口方法的形参类型与 Kotlin 函数的形参类型匹配即可。

你可以将其用于创建 SAM 接口的实例：

```kotlin
val runnable = Runnable { println("This runs in a runnable") }
```

……以及在方法调用中：

```kotlin
val executor = ThreadPoolExecutor()
// Java 签名: void execute(Runnable command)
executor.execute { println("This runs in a thread pool") }
```

如果 Java 类具有多个接受函数式接口的方法，你可以通过使用将 lambda 转换为特定 SAM 类型的适配器函数来选择需要调用的方法。这些适配器函数也会在需要时由编译器生成：

```kotlin
executor.execute(Runnable { println("This runs in a thread pool") })
```

> SAM 转换仅适用于接口，不适用于抽象类，即使这些抽象类也只有一个抽象方法。
>
{style="note"}

## 在 Kotlin 中使用 JNI

要声明一个由原生代码（C 或 C++）实现的函数，你需要使用 `external` 修饰符对其进行标记：

```kotlin
external fun foo(x: Int): Double
```

其余过程与 Java 中的工作方式完全相同。

你还可以将属性的 Getter 和 Setter 标记为 `external`：

```kotlin
var myProperty: String
    external get
    external set
```

在后台，这将创建两个函数 `getMyProperty` 和 `setMyProperty` ，它们都被标记为 `external`。

## 在 Kotlin 中使用 Lombok 生成的声明

你可以在 Kotlin 代码中使用 Java 的 Lombok 生成的声明。如果你需要在同一个 Java/Kotlin 混合模块中生成并使用这些声明，可以前往 [Lombok 编译器插件页面](lombok.md)了解操作方法。如果你是从另一个模块调用此类声明，则无需使用该插件来编译该模块。