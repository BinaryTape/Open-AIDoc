[//]: # (title: 接口)

Kotlin 中的接口可以包含抽象方法的声明，以及方法的实现。接口与抽象类的不同之处在于接口不能存储状态。接口可以有属性，但这些属性需要是抽象的或提供访问器实现。

接口使用关键字 `interface` 定义：

```kotlin
interface MyInterface {
    fun bar()
    fun foo() {
      // 可选的方法体
    }
}
```

## 实现接口 {id="implementing-interfaces"}

类或对象可以实现一个或多个接口：

```kotlin
class Child : MyInterface {
    override fun bar() {
        // 方法体
    }
}
```

## 接口中的属性 {id="properties-in-interfaces"}

你可以在接口中声明属性。接口中声明的属性要么是抽象的，要么提供访问器的实现。在接口中声明的属性不能有支持字段，因此在接口中声明的访问器不能引用它们：

```kotlin
interface MyInterface {
    val prop: Int // 抽象

    val propertyWithImplementation: String
        get() = "foo"

    fun foo() {
        print(prop)
    }
}

class Child : MyInterface {
    override val prop: Int = 29
}
```

## 接口继承 {id="interfaces-inheritance"}

接口可以派生自其他接口，这意味着它既可以为这些接口的成员提供实现，也可以声明新的函数和属性。很自然地，实现此类接口的类只需定义缺失的实现即可：

```kotlin
interface Named {
    val name: String
}

interface Person : Named {
    val firstName: String
    val lastName: String
    
    override val name: String get() = "$firstName $lastName"
}

data class Employee(
    // 不需要实现 'name'
    override val firstName: String,
    override val lastName: String,
    val position: Position
) : Person
```

## 解决重写冲突 {id="resolving-overriding-conflicts"}

当你在超类型列表中声明多个类型时，你可能会继承同一个方法的多个实现：

```kotlin
interface A {
    fun foo() { print("A") }
    fun bar()
}

interface B {
    fun foo() { print("B") }
    fun bar() { print("bar") }
}

class C : A {
    override fun bar() { print("bar") }
}

class D : A, B {
    override fun foo() {
        super<A>.foo()
        super<B>.foo()
    }

    override fun bar() {
        super<B>.bar()
    }
}
```

接口 *A* 和 *B* 都声明了函数 *foo()* 和 *bar()*。它们都实现了 *foo()*，但只有 *B* 实现了 *bar()*（在 *A* 中 *bar()* 没有被标记为抽象，因为如果函数没有主体，这是接口的默认行为）。现在，如果你从 *A* 派生出一个具体的类 *C*，你必须重写 *bar()* 并提供一个实现。

然而，如果你从 *A* 和 *B* 派生出 *D*，你需要实现从多个接口继承的所有方法，并且需要指定 *D* 应该如何实现它们。这条规则既适用于你继承了单个实现的方法 (*bar()*)，也适用于你继承了多个实现的方法 (*foo()*)。

## 为接口函数生成 JVM 默认方法 {id="jvm-default-method-generation-for-interface-functions"}

在 JVM 上，接口中声明的函数会被编译为默认方法。你可以使用 `-jvm-default` 编译器选项并通过以下值来控制此行为：

* `enable` (默认): 在接口中生成默认实现，并在子类和 `DefaultImpls` 类中包含桥接函数。使用此模式可以保持与旧版本 Kotlin 的二进制兼容性。
* `no-compatibility`: 仅在接口中生成默认实现。此模式跳过兼容性桥接函数和 `DefaultImpls` 类，使其适用于新的 Kotlin 代码。
* `disable`: 跳过默认方法，仅生成兼容性桥接函数和 `DefaultImpls` 类。

要配置 `-jvm-default` 编译器选项，请在 Gradle Kotlin DSL 中设置 `jvmDefault` 属性：

```kotlin
kotlin {
    compilerOptions {
        jvmDefault = JvmDefaultMode.NO_COMPATIBILITY
    }
}
```
