[//]: # (title: インターフェース)

Kotlin のインターフェースは、抽象メソッドの宣言だけでなく、メソッドの実装も含めることができます。抽象クラスとの違いは、インターフェースは状態（state）を保持できないことです。プロパティを持つことはできますが、それらは抽象であるか、アクセサの実装を提供する必要があります。

インターフェースはキーワード `interface` を使用して定義されます：

```kotlin
interface MyInterface {
    fun bar()
    fun foo() {
      // オプションでボディ（実装）を持てる
    }
}
```

## インターフェースの実装 {id="implementing-interfaces"}

クラスやオブジェクトは、1つ以上のインターフェースを実装できます：

```kotlin
class Child : MyInterface {
    override fun bar() {
        // ボディ
    }
}
```

## インターフェース内のプロパティ {id="properties-in-interfaces"}

インターフェースでプロパティを宣言できます。インターフェースで宣言されたプロパティは、抽象にするか、アクセサの実装を提供することができます。インターフェースで宣言されたプロパティはバッキングフィールド（backing fields）を持つことができないため、インターフェース内で宣言されたアクセサはそれらを参照することはできません：

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

## インターフェースの継承 {id="interfaces-inheritance"}

インターフェースは他のインターフェースから派生（継承）できます。つまり、親インターフェースのメンバーに対して実装を提供したり、新しい関数やプロパティを宣言したりできます。当然ながら、そのようなインターフェースを実装するクラスは、不足している実装のみを定義するだけで済みます：

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
    // 'name' の実装は必須ではありません
    override val firstName: String,
    override val lastName: String,
    val position: Position
) : Person
```

## オーバーライドの競合の解決 {id="resolving-overriding-conflicts"}

スーパータイプのリストに多くの型を宣言すると、同じメソッドの複数の実装を継承する場合があります：

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

インターフェース *A* と *B* はどちらも関数 *foo()* と *bar()* を宣言しています。両方とも *foo()* を実装していますが、*bar()* を実装しているのは *B* だけです（*A* では *bar()* に abstract とマークされていませんが、これは関数に本体がない場合のインターフェースのデフォルトだからです）。さて、*A* から具象クラス *C* を派生させる場合は、*bar()* をオーバーライドして実装を提供する必要があります。

しかし、*A* と *B* から *D* を派生させる場合は、複数のインターフェースから継承したすべてのメソッドを実装する必要があり、*D* がそれらを具体的にどのように実装するかを指定する必要があります。このルールは、単一の実装を継承したメソッド（*bar()*）と、複数の実装を継承したメソッド（*foo()*）の両方に適用されます。

## インターフェース関数に対する JVM デフォルトメソッドの生成 {id="jvm-default-method-generation-for-interface-functions"}

JVM では、インターフェースで宣言された関数はデフォルトメソッド（default methods）にコンパイルされます。
`-jvm-default` コンパイラオプションを使用して、次の値でこの動作を制御できます：

* `enable` (デフォルト): インターフェースにデフォルト実装を生成し、サブクラスと `DefaultImpls` クラスにブリッジ関数を含めます。古い Kotlin バージョンとのバイナリ互換性を維持するためにこのモードを使用します。
* `no-compatibility`: インターフェースにデフォルト実装のみを生成します。このモードは互換性ブリッジと `DefaultImpls` クラスをスキップするため、新しい Kotlin コードに適しています。
* `disable`: デフォルトメソッドをスキップし、互換性ブリッジと `DefaultImpls` クラスのみを生成します。

`-jvm-default` コンパイラオプションを設定するには、Gradle Kotlin DSL で `jvmDefault` プロパティを設定します：

```kotlin
kotlin {
    compilerOptions {
        jvmDefault = JvmDefaultMode.NO_COMPATIBILITY
    }
}
```
