[//]: # (title: 介面)

Kotlin 中的介面可以包含抽象方法的宣告，也可以包含方法的實作。它們與抽象類別的不同之處在於介面無法儲存狀態。它們可以擁有屬性，但這些屬性必須是抽象的，或者提供存取子實作。

使用關鍵字 `interface` 來定義介面：

```kotlin
interface MyInterface {
    fun bar()
    fun foo() {
      // 選用的主體
    }
}
```

## 實作介面 {id="implementing-interfaces"}

類別或物件可以實作一或多個介面：

```kotlin
class Child : MyInterface {
    override fun bar() {
        // 主體
    }
}
```

## 介面中的屬性 {id="properties-in-interfaces"}

您可以在介面中宣告屬性。在介面中宣告的屬性可以是抽象的，或者提供存取子的實作。在介面中宣告的屬性不能有支援欄位，因此在介面中宣告的存取子不能參照它們：

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

## 介面繼承 {id="interfaces-inheritance"}

介面可以衍生自其他介面，這代表它既可以為其成員提供實作，也可以宣告新的函式與屬性。自然地，實作此類介面的類別只需要定義缺失的實作：

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
    // 不需要實作 'name'
    override val firstName: String,
    override val lastName: String,
    val position: Position
) : Person
```

## 解決覆寫衝突 {id="resolving-overriding-conflicts"}

當您在超型別列表中宣告多個型別時，您可能會繼承同一個方法的多個實作：

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

介面 *A* 和 *B* 都宣告了函式 *foo()* 和 *bar()*。它們兩者都實作了 *foo()*，但只有 *B* 實作了 *bar()*（*bar()* 在 *A* 中未標記為抽象，因為如果函式沒有主體，這是介面的預設行為）。現在，如果您從 *A* 衍生出一個具體類別 *C*，您必須覆寫 *bar()* 並提供實作。

然而，如果您從 *A* 和 *B* 衍生出 *D*，您需要實作從多個介面繼承的所有方法，並且需要指定 *D* 應該如何實作它們。這條規則既適用於您繼承了單一實作的方法（*bar()*），也適用於您繼承了多個實作的方法（*foo()*）。

## 介面函式的 JVM 預設方法產生 {id="jvm-default-method-generation-for-interface-functions"}

在 JVM 上，介面中宣告的函式會編譯為預設方法（default methods）。您可以使用 `-jvm-default` 編譯器選項來控制此行為，其可設定的值如下：

* `enable`（預設）：在介面中產生預設實作，並在子類別和 `DefaultImpls` 類別中包含橋接函式。使用此模式可以保持與舊版 Kotlin 版本的二進制相容性。
* `no-compatibility`：僅在介面中產生預設實作。此模式會跳過相容性橋接函式和 `DefaultImpls` 類別，適合新的 Kotlin 程式碼。
* `disable`：跳過預設方法，僅產生相容性橋接函式和 `DefaultImpls` 類別。

要配置 `-jvm-default` 編譯器選項，請在您的 Gradle Kotlin DSL 中設定 `jvmDefault` 屬性：

```kotlin
kotlin {
    compilerOptions {
        jvmDefault = JvmDefaultMode.NO_COMPATIBILITY
    }
}
```
