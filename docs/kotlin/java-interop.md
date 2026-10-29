[//]: # (title: 在 Kotlin 中调用 Java)

Kotlin 在设计时就充分考虑了与 Java 的互操作性。现有的 Java 代码可以非常自然地在 Kotlin 中被调用，而 Kotlin 代码同样也能相当顺畅地在 Java 中使用。在本节中，我们将详细介绍在 Kotlin 中调用 Java 代码的一些细节。

几乎所有的 Java 代码都可以直接使用，没有任何问题：

```kotlin
import java.util.*

fun demo(source: List<Int>) {
    val list = ArrayList<Int>()
    // 'for' 循环适用于 Java 集合：
    for (item in source) {
        list.add(item)
    }
    // 运算符约定同样有效：
    for (i in 0..source.size - 1) {
        list[i] = source[i] // 调用了 get 和 set
    }
}
```

## Getter 和 Setter {id="getters-and-setters"}

遵循 Java 规范中 getter 与 setter 命名约定的方法（以 `get` 开头的无参方法和以 `set` 开头的单参方法）在 Kotlin 中会表示为属性。此类属性也被称为*合成属性*（synthetic properties）。
`Boolean` 访问器方法（getter 方法名以 `is` 开头且 setter 方法名以 `set` 开头）会表示为与 getter 方法同名的属性。

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

上面的 `calendar.firstDayOfWeek` 就是一个合成属性的示例。

注意，如果 Java 类中仅定义了 setter，由于 Kotlin 不支持只写属性（set-only property），因此它在 Kotlin 中不会以属性的形式可见。

## Java 合成属性引用 {id="java-synthetic-property-references"}

> 该功能是[实验性的](components-stability.md#stability-levels-explained)。它可能随时被删除或更改。
> 建议您仅将其用于评估目的。
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

Kotlin 一直允许你编写形如 `person.age` 的代码，其中 `age` 是一个合成属性。现在，你还可以创建对 `Person::age` 和 `person::age` 的引用。同样，这也适用于 `name`。

```kotlin
val persons = listOf(Person("Jack", 11), Person("Sofie", 12), Person("Peter", 11))
    persons
         // 调用对 Java 合成属性的引用：
        .sortedBy(Person::age)
         // 通过 Kotlin 属性语法调用 Java getter：
        .forEach { person -> println(person.name) }
```

### 如何启用 Java 合成属性引用 {initial-collapse-state="collapsed" collapsible="true" id="how-to-enable-java-synthetic-property-references"}

要启用此功能，请设置编译器选项 `-language-version 2.1`。在 Gradle 项目中，可以通过在 `build.gradle(.kts)` 中添加以下内容来实现：

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

> 在 Kotlin 1.9.0 之前，若要启用此功能，必须设置编译器选项 `-language-version 1.9`。
> 
{style="note"}

## 返回 void 的方法 {id="methods-returning-void"}

如果 Java 方法返回 `void`，在 Kotlin 中调用时它将返回 `Unit`。
即使有人使用了该返回值，Kotlin 编译器也会在调用站点直接对其进行赋值，因为该值本身是预先确定的（即 `Unit`）。

## 转义作为 Kotlin 关键字的 Java 标识符 {id="escaping-for-java-identifiers-that-are-keywords-in-kotlin"}

部分 Kotlin 关键字在 Java 中是合法的标识符：如 `in`、`object`、`is` 等。
如果 Java 库中的某个方法名恰好是 Kotlin 关键字，你仍然可以通过使用反引号（`）字符对其进行转义来调用该方法：

```kotlin
foo.`is`(bar)
```

## 空安全与平台类型 {id="null-safety-and-platform-types"}

Java 中的任何引用都可能为 `null`，这使得 Kotlin 严格的空安全要求在面对来自 Java 的对象时不切实际。
Java 声明的类型在 Kotlin 中会被视为不可显式指明的类型，并被称为[*平台类型*](https://kotlinlang.org/spec/type-system.html#platform-types)。
你不能在代码中显式编写这些不可指明的类型。因此，当将平台类型的值赋给 Kotlin 变量时，你可以：

* 依赖类型推断。在这种情况下，变量将具有推断出的平台类型。
* 明确指定你所期望的类型。Kotlin 允许使用可空类型和不可空类型。

针对此类类型的 null 检查有所放宽，其安全保证与 Java 中相同（详见[下文](#mapped-types)）。
请参阅以下示例：

```kotlin
val list = ArrayList<String>() // 非 null（构造函数结果）
list.add("Item")
val size = list.size // 非 null（基本类型 int）
val item = list[0] // 推断为平台类型（普通 Java 对象）
```

当调用平台类型变量的方法时，Kotlin 不会在编译时发出为 null 性错误，但由于空指针异常或 Kotlin 为防止 null 传播而生成的断言，该调用可能会在运行时失败：

```kotlin
item.substring(1) // 允许，若 item == null 则抛出异常
```

你可以将平台类型的值赋给可空或不可空的 Kotlin 类型变量。但是，如果你将此类值赋给不可空类型的变量，而该值在运行时实际上为 `null`，Kotlin 将抛出 `NullPointerException`。为避免这种情况，请在 Kotlin 代码中添加显式的为 null 性：

```kotlin
val nullable: String? = item // 允许，始终有效
val notNull: String = item // 允许，但在运行时可能会失败
```

如果你选择了不可空类型，编译器会在赋值时生成一个断言。这可以防止 Kotlin 的不可空变量持有 null。当你将平台值传递给期望非 null 值的 Kotlin 函数时，以及其他某些情况下，编译器同样会生成断言。
总的来说，编译器会竭尽全力防止 null 在程序中广泛传播，但由于泛型的存在，有时无法完全消除这种情况。

### 平台类型的表示法 {id="notation-for-platform-types"}

正如上一节所述，平台类型无法在程序中显式提及，因此语言中没有针对它们的语法。尽管如此，编译器和 IDE 有时仍需要展示它们（例如在错误消息或形参提示中），因此存在一种助记表示法：

* `T!` 表示“`T` 或 `T?`”
* `(Mutable)Collection<T>!` 表示“`T` 的 Java 集合可能是可变的，也可能是不可变的；可能是可空的，也可能是不可空的”
* `Array<(out) T>!` 表示“`T`（或 `T` 的子类型）的 Java 数组，可能是可空的，也可能是不可空的”

当你在错误消息或 IDE 工具提示中看到此表示法时，可以为 Kotlin 变量添加显式类型注解以恢复空安全检查，或者使用为 null 性注解在源头消除平台类型。

### 为 null 性注解 {id="nullability-annotations"}

带有为 null 性注解的 Java 类型不会表示为平台类型，而是表示为实际可空或不可空的 Kotlin 类型。编译器支持多种形式的为 null 性注解，包括：

  * [JetBrains](https://www.jetbrains.com/idea/help/nullable-and-notnull-annotations.html)
（来自 `org.jetbrains.annotations` 包的 `@Nullable` 和 `@NotNull`）
  * [JSpecify](#jspecify-support) (`org.jspecify.annotations`)
  * Android (`com.android.annotations` 与 `android.support.annotations`)
  * [JSR-305](#jsr-305-support) (`javax.annotation`)
  * FindBugs (`edu.umd.cs.findbugs.annotations`)
  * Eclipse (`org.eclipse.jdt.annotation`)
  * [Lombok](lombok.md) (`lombok.NonNull`)
  * RxJava 3 (`io.reactivex.rxjava3.annotations`)
  * [Vert.x](https://vertx.io/) (`io.vertx.codegen.annotations`)

你可以通过以下编译器选项指示编译器对特定的为 null 性注解报告为 null 性不匹配问题：

```bash
-Xnullability-annotations=@<package-name>:<report-level>
``` 

指定完全限定的为 null 性注解的包名以及以下报告级别之一：

* `ignore`：忽略为 null 性不匹配
* `warn`：报告警告
* `strict`：报告错误。

> [JSpecify](#jspecify-support) 是唯一默认使用 `strict` 报告级别受支持的注解类型。
> 使用它可以无需额外配置即可针对为 null 性注解报告错误。
>
{style="note"}

如需查看受支持的为 null 性注解的完整列表，请参阅
[Kotlin 编译器源代码](https://github.com/JetBrains/kotlin/blob/master/core/compiler.common.jvm/src/org/jetbrains/kotlin/load/java/JvmAnnotationNames.kt)。

### 可变性注解 {id="mutability-annotations"}

你可以使用可变性注解来修饰 Java 声明，以指明返回的集合在 Kotlin 中是只读的还是可变的。
如果你将该值赋给具有不同可变性的集合类型，编译器将报告类型不匹配。
诊断严重级别取决于具体的可变性注解。

编译器支持多种可变性注解，包括：

* `kotlin.annotations.jvm.ReadOnly`
* `kotlin.annotations.jvm.Mutable`
* `org.jetbrains.annotations.Unmodifiable`
* `org.jetbrains.annotations.UnmodifiableView`

如需查看受支持的可变性注解的完整列表，请参阅 [Kotlin 编译器源代码](https://github.com/JetBrains/kotlin/blob/master/core/compiler.common.jvm/src/org/jetbrains/kotlin/load/java/JvmAnnotationNames.kt)。

### 为类型实参与类型形参添加注解 {id="annotating-type-arguments-and-type-parameters"}

你还可以为泛型类型的类型实参和类型形参添加注解，以便同时为它们提供为 null 性信息。

> 本节中的所有示例均使用来自 `org.jetbrains.annotations` 包的 JetBrains 为 null 性注解。
>
{style="note"}

#### 类型实参 {id="type-arguments"}

考虑 Java 声明上的这些注解：

```java
@NotNull
Set<@NotNull String> toSet(@NotNull Collection<@NotNull String> elements) { ... }
```

它们在 Kotlin 中会产生以下签名：

```kotlin
fun toSet(elements: (Mutable)Collection<String>) : (Mutable)Set<String> { ... }
```

当类型实参缺少 `@NotNull` 注解时，你将得到一个平台类型：

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

在 Kotlin 代码中，如果将 `Derived` 的实例传递给期望 `Base<String>` 的地方，将会产生警告。

```kotlin
fun takeBaseOfNotNullStrings(x: Base<String>) {}

fun main() {
    takeBaseOfNotNullStrings(Derived()) // 警告：为 null 性不匹配
}
```

`Derived` 的上限被设置为 `Base<String?>`，这与 `Base<String>` 不同。

详细了解 [Kotlin 中的 Java 泛型](#java-generics-in-kotlin)。

#### 类型形参 {id="type-parameters"}

默认情况下，普通类型形参在 Kotlin 和 Java 中的为 null 性都是未定义的。在 Java 中，你可以使用为 null 性注解来指定它。让我们为 `Base` 类的类型形参添加注解：

```java
public class Base<@NotNull T> {}
```

继承自 `Base` 时，Kotlin 期望一个不可空的类型实参或类型形参。
因此，以下 Kotlin 代码将生成警告：

```kotlin
class Derived<K> : Base<K> {} // 警告：K 具有未定义的为 null 性
```

你可以通过指定上限 `K : Any` 来修复此问题。

Kotlin 还支持在 Java 类型形参的界限上添加为 null 性注解。让我们为 `Base` 添加界限：

```java
public class BaseWithBound<T extends @NotNull Number> {}
```

Kotlin 会将其转换如下：

```kotlin
class BaseWithBound<T : Number> {}
```

因此，传递可空类型作为类型实参或类型形参将产生警告。

为类型实参和类型形参添加注解适用于 Java 8 或更高的目标平台。该功能要求为 null 性注解支持 `TYPE_USE` 目标（`org.jetbrains.annotations` 从版本 15 及以上开始支持）。

> 如果一个为 null 性注解除了支持 `TYPE_USE` 目标外，还支持其他适用于类型的目标，则优先使用 `TYPE_USE`。例如，如果 `@Nullable` 同时具有 `TYPE_USE` 和 `METHOD` 目标，则 Java 方法签名 `@Nullable String[] f()` 在 Kotlin 中将变为 `fun f(): Array<String?>!`。
>
{style="note"}

### JSpecify 支持 {id="jspecify-support"}

Kotlin 支持 [JSpecify](https://jspecify.dev/) 为 null 性注解，它为 Java 的为 null 性提供了一套统一的注解。JSpecify 允许你为 Java 声明提供详细的为 null 性信息，帮助 Kotlin 在与 Java 代码交互时保持空安全。

Kotlin 支持 `org.jspecify.annotations` 包中的以下注解：

* `@Nullable` 将类型标记为可空。
* `@NonNull` 将类型标记为不可空。
* `@NullMarked` 将某个作用域（例如类或包）内的所有类型默认标记为不可空，除非另有注解。

  该注解不适用于局部变量和[类型变量（泛型）](https://jspecify.dev/docs/user-guide/#using-type-variables-in-generic-types)。
  在提供特定的可空或不可空类型之前，类型变量始终保持“null 无感知”（null-agnostic）状态。

* `@NullUnmarked` 反转 `@NullMarked` 的效果，使该作用域内的所有类型均成为[平台类型](#null-safety-and-platform-types)。

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
 
在 Kotlin 中，这些类型会被视为常规的可空和不可空类型，而不是[平台类型](#null-safety-and-platform-types)：
 
```kotlin
// Kotlin
fun test(inventory: InventoryService) {
   inventory.notNull().length // 正常
   inventory.nullable().length // 错误：仅允许安全调用 (?.) 或非空断言调用 (!!)
}
```

默认情况下，Kotlin 编译器会将 JSpecify 注解引起的为 null 性不匹配报告为错误。
你可以使用以下编译器选项自定义 JSpecify 为 null 性诊断的严重级别：

```bash
-Xjspecify-annotations=<report-level>
```

可用的报告级别包括：

| 级别     | 描述                                     |
|----------|------------------------------------------|
| `strict` | 对为 null 性不匹配报告错误（默认）。      |
| `warn`   | 报告警告。                               |
| `ignore` | 忽略为 null 性不匹配。                   |

> 有关 JSpecify 注解的更多信息，请参阅 [JSpecify 用户指南](https://jspecify.dev/docs/user-guide)。
> 
{type="tip"}

### JSR-305 支持 {id="jsr-305-support"}

Kotlin 支持使用在 [JSR-305](https://jcp.org/en/jsr/detail?id=305) 中定义的 [`@Nonnull`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/Nonnull.html) 注解来表示 Java 类型的为 null 性。

如果 `@Nonnull(when = ...)` 的值为 `When.ALWAYS`，则被注解的类型将被视为不可空；`When.MAYBE` 和 `When.NEVER` 表示可空类型；而 `When.UNKNOWN` 则强制该类型成为[平台类型](#null-safety-and-platform-types)。

库可以针对 JSR-305 注解进行编译，但无需让库的使用者将注解构件（例如 `jsr305.jar`）作为编译依赖项。即使类路径上不存在这些注解，Kotlin 编译器也可以直接从库中读取 JSR-305 注解。

同时也支持[自定义为 null 性限定符 (KEEP-79)](https://github.com/Kotlin/KEEP/blob/master/proposals/jsr-305-custom-nullability-qualifiers.md)（见下文）。

#### 类型限定符别名 {id="type-qualifier-nicknames"}

如果一个注解类型同时被 [`@TypeQualifierNickname`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/meta/TypeQualifierNickname.html) 和 JSR-305 的 `@Nonnull`（或其另一个别名，如 `@CheckForNull`）注解，则该注解类型本身即可用于获取精确的为 null 性，并且具有与该为 null 性注解相同的含义：

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
    // 在 Kotlin 中（严格模式）：`fun foo(x: String): String?`

    String bar(List<@MyNonnull String> x);
    // 在 Kotlin 中（严格模式）：`fun bar(x: List<String>!): String!`
}
```

#### 默认类型限定符 {id="type-qualifier-defaults"}

[`@TypeQualifierDefault`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/meta/TypeQualifierDefault.html) 允许引入在应用时定义被注解元素作用域内默认为 null 性的注解。

此类注解类型本身应同时被 `@Nonnull`（或其别名）以及带有包含一个或多个 `ElementType` 值的 `@TypeQualifierDefault(...)` 注解：

* `ElementType.METHOD`：用于方法的返回值类型
* `ElementType.PARAMETER`：用于值参数
* `ElementType.FIELD`：用于字段
* `ElementType.TYPE_USE`：用于任何类型，包括类型实参、类型形参的上限以及通配符类型

当类型本身未被为 null 性注解修饰时，将使用默认为 null 性；默认值由最内层的封闭元素决定，该元素由带有与类型用法匹配的 `ElementType` 的默认类型限定符注解修饰。

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

    // 由于 `@NullableApi` 具有 `TYPE_USE` 元素类型，
    // List<String> 的类型实参被视为可空：
    String baz(List<String> x); // fun baz(List<String?>?): String?

    // 由于存在显式标记为 UNKNOWN 的为 null 性注解，
    // `x` 形参的类型仍保持为平台类型：
    String qux(@Nonnull(when = When.UNKNOWN) String x); // fun baz(x: String!): String?
}
```

> 本例中的类型仅在启用严格模式时生效；否则平台类型依然保留。
> 请参阅 [`@UnderMigration` 注解](#undermigration-annotation)和[编译器配置](#compiler-configuration)章节。
>
{style="note"}

同样支持包级别的默认为 null 性：

```java
// 文件：test/package-info.java
@NonNullApi // 默认声明 'test' 包中的所有类型为不可空
package test;
```

#### @UnderMigration 注解 {id="undermigration-annotation"}

库维护者可以使用 `@UnderMigration` 注解（在独立的构件 `kotlin-annotations-jvm` 中提供）来定义为 null 性类型限定符的迁移状态。

`@UnderMigration(status = ...)` 中的状态值指定了编译器如何处理被注解类型在 Kotlin 中的不当用法（例如，将 `@MyNullable` 注解的类型值当作非 null 使用）：

* `MigrationStatus.STRICT`：使注解像任何普通的为 null 性注解一样工作，即对不当用法报告错误，并影响被注解声明在 Kotlin 中的可见类型
* `MigrationStatus.WARN`：不当用法会被报告为编译警告而不是错误，但被注解声明中的类型仍保持为平台类型
* `MigrationStatus.IGNORE`：使编译器完全忽略该为 null 性注解

库维护者可以将 `@UnderMigration` 状态同时添加到类型限定符别名和默认类型限定符上：

```java
@Nonnull(when = When.ALWAYS)
@TypeQualifierDefault({ElementType.METHOD, ElementType.PARAMETER})
@UnderMigration(status = MigrationStatus.WARN)
public @interface NonNullApi {
}

// 该类中的类型是不可空的，但只报告警告，
// 因为 `@NonNullApi` 被注解为 `@UnderMigration(status = MigrationStatus.WARN)`
@NonNullApi
public class Test {}
```

> 为 null 性注解的迁移状态不会由其类型限定符别名继承，但会应用于其在默认类型限定符中的用法。
>
{style="note"}

如果默认类型限定符使用了类型限定符别名，并且它们都处于 `@UnderMigration` 状态，则优先使用默认类型限定符的状态。

#### 编译器配置 {id="compiler-configuration"}

可以通过添加带有以下选项（及其组合）的 `-Xjsr305` 编译器标记来配置 JSR-305 检查：

* `-Xjsr305={strict|warn|ignore}`：用于设置非 `@UnderMigration` 注解的行为。自定义为 null 性限定符（尤其是 `@TypeQualifierDefault`）已经在许多知名库中广泛使用，用户在更新到包含 JSR-305 支持的 Kotlin 版本时可能需要平滑迁移。自 Kotlin 1.1.60 起，此标记仅影响非 `@UnderMigration` 注解。

* `-Xjsr305=under-migration:{strict|warn|ignore}`：用于覆盖 `@UnderMigration` 注解的行为。用户对库的迁移状态可能有不同的看法：他们可能希望在官方迁移状态为 `WARN` 时将其视为错误，反之亦然，他们可能希望推迟某些库的错误报告，直到他们完成迁移。

* `-Xjsr305=@<fq.name>:{strict|warn|ignore}`：用于覆盖单个注解的行为，其中 `<fq.name>` 是注解的完全限定类名。可以针对不同的注解出现多次。这对于管理特定库的迁移状态非常有用。

`strict`、`warn` 和 `ignore` 值的含义与 `MigrationStatus` 中的相同，且只有 `strict` 模式会影响被注解声明在 Kotlin 中的可见类型。

> 注意：内置的 JSR-305 注解 [`@Nonnull`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/Nonnull.html)、[`@Nullable`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/3.0.1/javax/annotation/Nullable.html) 以及 [`@CheckForNull`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/CheckForNull.html) 始终处于启用状态，并且无论 `-Xjsr305` 标记的编译器配置如何，都会影响被注解声明在 Kotlin 中的类型。
>
{style="note"}

例如，将 `-Xjsr305=ignore -Xjsr305=under-migration:ignore -Xjsr305=@org.library.MyNullable:warn` 添加到编译器实参中，会使编译器针对 `@org.library.MyNullable` 注解类型的不当用法生成警告，并忽略所有其他 JSR-305 注解。

默认行为与 `-Xjsr305=warn` 相同。`strict` 值应被视为实验性的（未来可能会向其添加更多检查）。

## 映射的类型 {id="mapped-types"}

Kotlin 对某些 Java 类型进行了特殊处理。这些类型并不是从 Java 中“照原样”加载的，而是被*映射*到相应的 Kotlin 类型。
这种映射仅在编译时有效，运行时表示保持不变。
Java 的基本类型被映射到相应的 Kotlin 类型（同时考虑[平台类型](#null-safety-and-platform-types)）：

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

一些非基本类型的内置类也会被映射：

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

Java 的基本类型包装类会被映射为可空的 Kotlin 类型：

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

请注意，用作类型形参的基本类型包装类会被映射为平台类型：
例如，`List<java.lang.Integer>` 在 Kotlin 中会变为 `List<Int!>`。

Kotlin 中的集合类型可以是只读的或可变的，因此 Java 的集合映射如下
（本表中的所有 Kotlin 类型均位于 `kotlin.collections` 包中）：

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

Java 的数组映射如[下文](#java-arrays)所述：

| **Java 类型** | **Kotlin 类型**                |
|---------------|--------------------------------|
| `int[]`       | `kotlin.IntArray!`             |
| `String[]`    | `kotlin.Array<(out) String!>!` |

>这些 Java 类型的 static 成员无法直接在 Kotlin 类型的[伴生对象](object-declarations.md#companion-objects)上访问。要调用它们，请使用 Java 类型的完全限定名称，例如 `java.lang.Integer.toHexString(foo)`。
>
{style="note"}

## Kotlin 中的 Java 泛型 {id="java-generics-in-kotlin"}

Kotlin 的泛型与 Java 的泛型略有不同（参见[泛型](generics.md)）。
将 Java 类型导入 Kotlin 时，会进行以下转换：

* Java 的通配符被转换为类型投影：
  * `Foo<? extends Bar>` 转换为 `Foo<out Bar!>!`
  * `Foo<? super Bar>` 转换为 `Foo<in Bar!>!`

* Java 的原始类型（raw types）被转换为星号投影：
  * `List` 转换为 `List<*>!`，即 `List<out Any?>!`

与 Java 一样，Kotlin 的泛型在运行时不会被保留：对象不会携带传递给其构造函数的实际类型实参的信息。例如，`ArrayList<Integer>()` 与 `ArrayList<Character>()` 在运行时是无法区分的。
这使得无法执行考虑泛型的 `is` 检查。
Kotlin 仅允许对星号投影的泛型类型进行 `is` 检查：

```kotlin
if (a is List<Int>) // 错误：无法检查它是否真的是 Int 列表
// 但是
if (a is List<*>) // 正常：不对列表的内容作任何保证
```

## Java 数组 {id="java-arrays"}

与 Java 不同，Kotlin 中的数组是不型变的（invariant）。这意味着 Kotlin 不允许你将 `Array<String>` 赋值给 `Array<Any>`，从而避免了潜在的运行时故障。将子类的数组作为超类的数组传递给 Kotlin 方法也是被禁止的，但对于 Java 方法，这可以通过形如 `Array<(out) String>!` 的[平台类型](#null-safety-and-platform-types)来允许。

Java 平台上的数组配合基本数据类型使用，以避免装箱/拆箱操作的开销。
由于 Kotlin 隐藏了这些实现细节，因此需要一种变通方案来与 Java 代码对接。
针对每种基本类型数组都有专门的类（`IntArray`、`DoubleArray`、`CharArray` 等）来处理这种情况。
它们与 `Array` 类无关，并且会被编译为 Java 的基本类型数组，以获得最大性能。

假设有一个接受表示索引的 int 数组的 Java 方法：

``` java
public class JavaArrayExample {
    public void removeIndices(int[] indices) {
        // 此处为代码...
    }
}
```

要传递基本类型的值数组，你可以在 Kotlin 中执行以下操作：

```kotlin
val javaObj = JavaArrayExample()
val array = intArrayOf(0, 1, 2, 3)
javaObj.removeIndices(array)  // 将 int[] 传递给方法
```

在编译为 JVM 字节码时，编译器会优化对数组的访问，因此不会引入任何额外开销：

```kotlin
val array = arrayOf(1, 2, 3, 4)
array[1] = array[1] * 2 // 不会生成对 get() 和 set() 的实际调用
for (x in array) { // 不会创建迭代器
    print(x)
}
```

即使使用索引进行遍历，也不会引入任何开销：

```kotlin
for (i in array.indices) { // 不会创建迭代器
    array[i] += 2
}
```

最后，`in` 检查同样没有额外开销：

```kotlin
if (i in array.indices) { // 等同于 (i >= 0 && i < array.size)
    print(array[i])
}
```

## Java 可变实参数量 (varargs) {id="java-varargs"}

Java 类有时会使用带有可变实参数量（varargs）的方法声明来传递索引：

``` java
public class JavaArrayExample {

    public void removeIndicesVarArg(int... indices) {
        // 此处为代码...
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

由于 Java 没有提供标记适用于运算符语法的方法的手段，Kotlin 允许将任何具有正确名称和签名的 Java 方法用作运算符重载及其他约定（`invoke()` 等）。
不允许使用中缀调用语法来调用 Java 方法。

## 受检异常 {id="checked-exceptions"}

在 Kotlin 中，所有[异常都是非受检异常](exceptions.md)，这意味着编译器不会强制你捕获任何异常。
因此，当你调用声明了受检异常的 Java 方法时，Kotlin 不会强制你执行任何操作：

```kotlin
fun render(list: List<*>, to: Appendable) {
    for (item in list) {
        to.append(item.toString()) // Java 会要求我们在此处捕获 IOException
    }
}
```

## Object 方法 {id="object-methods"}

当 Java 类型被导入 Kotlin 时，所有 `java.lang.Object` 类型的引用都会转换为 `Any`。
由于 `Any` 是平台无关的，它仅声明了 `toString()`、`hashCode()` 和 `equals()` 作为其成员，因此为了使 `java.lang.Object` 的其他成员可用，Kotlin 使用了[扩展函数](extensions.md)。

### `wait()` 和 `notify()` {id="wait-and-notify"}

方法 `wait()` 和 `notify()` 在 `Any` 类型的引用上不可用。通常不建议使用它们，而是优先推荐使用 `java.util.concurrent`。

如果必须调用这些方法，请通过 Java 对象访问它们，并抑制 `PLATFORM_CLASS_MAPPED_TO_KOTLIN` 警告：

```kotlin
import java.util.LinkedList

class SimpleBlockingQueue<T>(private val capacity: Int) {
    private val queue = LinkedList<T>()

    // 明确使用 java.lang.Object 来访问 wait() 和 notify()
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

### `getClass()` {id="getclass"}

要获取对象的 Java 类，请在[类引用](reflection.md#obtain-a-runtime-class)上使用 `java` 扩展属性：

```kotlin
val fooClass = foo::class.java
```

上面的代码使用了[绑定类引用](lambdas.md#bound-and-unbound-references)。你也可以使用 `javaClass` 扩展属性：

```kotlin
val fooClass = foo.javaClass
```

### `clone()` {id="clone"}

要重写 `clone()`，你的类需要继承 `kotlin.Cloneable`：

```kotlin
class Example : Cloneable {
    override fun clone(): Any { ... }
}
```

不要忘记阅读《Effective Java（第 3 版）》第 13 条：*谨慎地重写 clone*。

### `finalize()` {id="finalize"}

要重写 `finalize()`，你只需要声明它即可，无需使用 `override` 关键字：

```kotlin
class C {
    protected fun finalize() {
        // 终结化逻辑
    }
}
```

根据 Java 的规则，`finalize()` 不得为 `private`。

## 继承 Java 类 {id="inheritance-from-java-classes"}

在 Kotlin 中，最多只能有一个 Java 类（以及任意数量的 Java 接口）作为某个类的超类型。

## 访问 static 成员 {id="accessing-static-members"}

Java 类的 static 成员构成了这些类的“伴生对象”。你不能将此类“伴生对象”作为值传递，但可以显式访问其成员，例如：

```kotlin
if (Character.isLetter(a)) { ... }
```

要访问[映射](#mapped-types)到 Kotlin 类型的 Java 类型的 static 成员，请使用该 Java 类型的完全限定名称：`java.lang.Integer.bitCount(foo)`。

## Java 反射 {id="java-reflection"}

Java 反射适用于 Kotlin 类，反之亦然。如上文所述，你可以使用 `instance::class.java`、`ClassName::class.java` 或 `instance.javaClass` 通过 `java.lang.Class` 进入 Java 反射。
不要为此目的使用 `ClassName.javaClass`，因为它引用的是 `ClassName` 伴生对象的类，这与 `ClassName.Companion::class.java` 相同，而不是 `ClassName::class.java`。

对于每种基本类型，都有两个不同的 Java 类，Kotlin 提供了获取这两者的方法。例如，`Int::class.java` 将返回表示基本类型本身的类实例，对应于 Java 中的 `Integer.TYPE`。要获取相应包装类型的类，请使用 `Int::class.javaObjectType`，它等效于 Java 的 `Integer.class`。

其他受支持的情况包括：为 Kotlin 属性获取 Java getter/setter 方法或支持字段，为 Java 字段获取 `KProperty`，为 `KFunction` 获取 Java 方法或构造函数，反之亦然。

## SAM 转换 {id="sam-conversions"}

Kotlin 同时支持 Java 与 [Kotlin 接口](fun-interfaces.md)的 SAM 转换。
对 Java 的这种支持意味着，只要接口方法的形参类型与 Kotlin 函数的形参类型相匹配，Kotlin 函数字面量就可以自动转换为具有单个非默认方法的 Java 接口的实现。

你可以将其用于创建 SAM 接口的实例：

```kotlin
val runnable = Runnable { println("This runs in a runnable") }
```

……以及在方法调用中使用：

```kotlin
val executor = ThreadPoolExecutor()
// Java 签名：void execute(Runnable command)
executor.execute { println("This runs in a thread pool") }
```

如果 Java 类有多个接受函数式接口的方法，你可以通过使用将 lambda 转换为特定 SAM 类型的适配器函数，来选择需要调用的方法。需要时，编译器也会自动生成这些适配器函数：

```kotlin
executor.execute(Runnable { println("This runs in a thread pool") })
```

> SAM 转换仅适用于接口，不适用于抽象类，即使抽象类也只有一个抽象方法。
>
{style="note"}

## 在 Kotlin 中使用 JNI {id="using-jni-with-kotlin"}

要声明一个在原生代码（C 或 C++）中实现的函数，你需要使用 `external` 修饰符对其进行标记：

```kotlin
external fun foo(x: Int): Double
```

其余步骤与 Java 中的完全相同。

你还可以将属性的 getter 和 setter 标记为 `external`：

```kotlin
var myProperty: String
    external get
    external set
```

在后台，这将创建两个均标记为 `external` 的函数：`getMyProperty` 和 `setMyProperty`。

## 在 Kotlin 中使用 Lombok 生成的声明 {id="using-lombok-generated-declarations-in-kotlin"}

你可以在 Kotlin 代码中使用 Java 的 Lombok 生成的声明。
如果需要在同一个混合的 Java/Kotlin 模块中生成并使用这些声明，你可以在 [Lombok 编译器插件页面](lombok.md)了解操作方法。
如果是从另一个模块调用此类声明，则无需使用该插件来编译该模块。