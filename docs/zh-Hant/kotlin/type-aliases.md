[//]: # (title: 型別別名)

型別別名（Type aliases）為現有型別提供替代名稱。它們可以讓冗長或頻繁使用的型別運算式變得更短且更易於理解。

例如，你可以為泛型型別、函式型別以及巢狀類別或內部類別建立別名：

```kotlin
// 泛型型別
typealias UserIndex = Map<Long, User>
typealias FileTable<K> = MutableMap<K, MutableList<File>>

// 函式型別
typealias RequestHandler = (Request) -> Response
typealias Predicate<T> = (T) -> Boolean

// 內部類別與巢狀類別
class Database {
    inner class Transaction
}
typealias DatabaseTransaction = Database.Transaction
```

型別別名不會建立新型別。它為現有型別引入了一個替代名稱。別名與其底層型別是可以互換的。例如，當你加入 `typealias Predicate<T>` 並使用 `Predicate<Int>` 時，編譯器會將其展開為 `(Int) -> Boolean`。只要在需要底層型別的地方，你都可以使用以別名宣告的值，反之亦然：

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

## 宣告型別別名

你可以宣告型別別名：

* 在 Kotlin 檔案的最上層，作為 [最上層型別別名](#top-level-type-aliases)。
* 在類別、介面或物件內部，作為 [巢狀型別別名](#nested-type-aliases)。

你不能在區域作用域中宣告型別別名，例如在函式或 [Lambda 運算式](lambdas.md#lambda-expressions-and-anonymous-functions) 內部。

宣告位置決定了型別別名的作用域，而其可見性則決定了哪些程式碼可以存取它。預設情況下，型別別名為 `public`。 [巢狀型別別名](#nested-type-aliases) 僅在可存取其所屬類別、介面或物件的地方才能存取。例如，`internal` 類別內部的 `public` 別名無法從模組外部存取。

型別別名不能暴露比自身具有更嚴格 [可見性](visibility-modifiers.md) 的底層型別。例如，`public` 型別別名不能引用 `private` 類別。

### 最上層型別別名

最上層型別別名是套件層級的宣告。在同一個套件中，你可以透過其不合格名稱來引用別名。要從另一個套件使用該別名，請匯入該別名或透過其合格名稱來引用它：

```kotlin
// UserId.kt
package org.example.users

typealias UserId = Long

// 在同一個套件中透過其不合格名稱引用別名
fun createUser(id: UserId) {
    // ...
}

// UserService.kt
package org.example.services

import org.example.users.UserId

// 透過其不合格名稱使用匯入的別名
fun findUser(id: UserId) {
    // ...
}

// 使用完全限定名稱
fun deleteUser(id: org.example.users.UserId) {
    // ...
}
```

### 巢狀型別別名

巢狀型別別名透過改進封裝、減少套件層級的混亂並簡化內部實作，讓程式碼更簡潔、更易於維護。巢狀型別別名遵循與 [巢狀類別](nested-classes.md) 相同的作用域與名稱解析規則。

當替代名稱僅在該宣告的上下文中有意義時，請在類別、介面或物件內部宣告型別別名。這能讓別名靠近使用它的程式碼，並避免在套件作用域中增加另一個名稱。

在所屬宣告內部，你可以透過不合格名稱來引用別名。在宣告外部，請使用其所屬宣告的名稱來限定該別名：

```kotlin
class UserRepository {
    typealias UserIndex = Map<UserId, User>

    // 在 UserRepository 內部透過其不合格名稱引用別名
    fun saveAll(users: UserIndex) {
        // ...
    }
}

// 在 UserRepository 外部透過其合格名稱引用別名
fun synchronizeUsers(users: UserRepository.UserIndex) {
    // ...
}
```

> Kotlin 多平台的 [`expect/actual` 宣告](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html) 不支援巢狀型別別名。
>
{style="note"}

#### 型別參數

要在巢狀型別別名中使用型別參數，請將其加入別名宣告中：

```kotlin
class Graph<Node> {
    typealias Path<T> = List<T>
}

val cityPath: Graph.Path<String> = listOf("London", "Berlin")
```

在此範例中，`Path` 宣告了其型別參數 `T`。在 `Graph.Path<String>` 中，`String` 是 `T` 的型別引數，且獨立於 `Graph` 所宣告的 `Node` 型別參數。

如果你引用了其所屬類別或介面所宣告的型別參數，編譯器會回報錯誤：

```kotlin
class Graph<Node> {
    typealias Path = List<Node>
    // 未解決的參照 'Node'。
}
```

在這裡，`Path` 引用了來自 `Graph` 的 `Node`，而不是宣告自己的型別參數。