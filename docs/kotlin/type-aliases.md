[//]: # (title: 类型别名)

类型别名为现有类型提供备用名称。它们可以缩短较长或常用的类型表达式，使其更易于理解。

例如，你可以为泛型类型、函数类型以及嵌套类或内部类创建别名：

```kotlin
// 泛型类型
typealias UserIndex = Map<Long, User>
typealias FileTable<K> = MutableMap<K, MutableList<File>>

// 函数类型
typealias RequestHandler = (Request) -> Response
typealias Predicate<T> = (T) -> Boolean

// 内部类和嵌套类
class Database {
    inner class Transaction
}
typealias DatabaseTransaction = Database.Transaction
```

类型别名不会创建新类型。它为现有类型引入了备用名称。别名及其底层类型可以互换。例如，当你添加 `typealias Predicate<T>` 并使用 `Predicate<Int>` 时，编译器会将其扩展为 `(Int) -> Boolean`。你可以在任何需要底层类型的地方使用通过别名声明的值，反之亦然：

```kotlin
typealias Predicate<T> = (T) -> Boolean

fun evaluate(predicate: Predicate<Int>) = predicate(42)

fun main() {
    val isPositive: (Int) -> Boolean = { it > 0 }
    println(evaluate(isPositive))
    // true

    val isValid: Predicate<Int> = { it > 0 }
    println(listOf(1, -2).filter(isValid))
    // [1]
}
```
{kotlin-runnable="true"}

## 声明类型别名

你可以声明类型别名：

* 在 Kotlin 文件的顶级，作为[顶级类型别名](#top-level-type-aliases)。
* 在类、接口或对象内部，作为[嵌套类型别名](#nested-type-aliases)。

你不能在局部作用域内声明类型别名，例如在函数或 [lambda表达式](lambdas.md#lambda-expressions-and-anonymous-functions)内部。

声明位置决定了类型别名的作用域，而其可见性决定了哪些代码可以访问它。默认情况下，类型别名为 `public`。[嵌套类型别名](#nested-type-aliases)仅在可以访问其包含类、接口或对象的地方才可访问。例如，`internal` 类内部的 `public` 别名无法从模块外部访问。

类型别名公开的底层类型的[可见性](visibility-modifiers.md)不能比别名自身更严格。例如，`public` 类型别名不能引用 `private` 类。

### 顶级类型别名

顶级类型别名是软件包级别的声明。在同一个软件包中，你可以通过其非限定名称引用别名。要在另一个软件包中使用别名，请导入该别名或通过其限定名称引用它：

```kotlin
// UserId.kt
package org.example.users

typealias UserId = Long

// 在同一个软件包中通过其非限定名称引用别名
fun createUser(id: UserId) {
    // ...
}

// UserService.kt
package org.example.services

import org.example.users.UserId

// 通过其非限定名称使用导入的别名
fun findUser(id: UserId) {
    // ...
}

// 使用完全限定名称
fun deleteUser(id: org.example.users.UserId) {
    // ...
}
```

### 嵌套类型别名

嵌套类型别名通过改进封装、减少软件包级别的混乱以及简化内部实现，使代码更加简洁且更易于维护。嵌套类型别名遵循与[嵌套类](nested-classes.md)相同的作用域和名称解析规则。

当备用名称仅在声明的上下文中相关时，请在类、接口或对象内部声明类型别名。这使别名靠近使用它的代码，并避免在软件包作用域内添加另一个名称。

在包含它的声明内部，你可以通过其非限定名称引用该别名。在声明外部，请使用其包含声明的名称来限定该别名：

```kotlin
class UserRepository {
    typealias UserIndex = Map<UserId, User>

    // 在 UserRepository 内部通过其非限定名称引用别名
    fun saveAll(users: UserIndex) {
        // ...
    }
}

// 在 UserRepository 外部通过其限定名称引用别名
fun synchronizeUsers(users: UserRepository.UserIndex) {
    // ...
}
```

> 嵌套类型别名在 Kotlin 多平台的 [`expect/actual` 声明](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)中不受支持。
>
{style="note"}

#### 类型形参

要在嵌套类型别名中使用类型形参，请将它们添加到别名声明中：

```kotlin
class Graph<Node> {
    typealias Path<T> = List<T>
}

val cityPath: Graph.Path<String> = listOf("London", "Berlin")
```

在这个示例中，`Path` 声明了其类型形参 `T`。在 `Graph.Path<String>` 中，`String` 是 `T` 的类型实参，并且独立于 `Graph` 声明的 `Node` 类型形参。

如果你引用了由其包含类或接口声明的类型形参，编译器将报错：

```kotlin
class Graph<Node> {
    typealias Path = List<Node>
    // 未解析的引用 'Node'。
}
```

此处，`Path` 引用了来自 `Graph` 的 `Node`，而不是声明自己的类型形参。