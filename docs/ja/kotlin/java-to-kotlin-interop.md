[//]: # (title: JavaからKotlinを呼び出す)

KotlinのコードはJavaから簡単に呼び出すことができます。
例えば、Kotlinクラスのインスタンスは、Javaのメソッド内でシームレスに作成して操作できます。
ただし、KotlinのコードをJavaに統合する際には、JavaとKotlinの間の特定の相違点に注意する必要があります。
このページでは、KotlinコードとJavaクライアントとの相互運用性（interop）を調整する方法について説明します。

## プロパティ (Properties)

Kotlinのプロパティは、以下のJava要素にコンパイルされます：

 * `get` プレフィックスを付けて算出された名前を持つゲッターメソッド。
 * `set` プレフィックスを付けて算出された名前を持つセッターメソッド（`var` プロパティの場合のみ）。
 * プロパティ名と同じ名前を持つ非公開（private）フィールド（バッキングフィールドを持つプロパティの場合のみ）。

例えば、`var firstName: String` は、以下のJava宣言にコンパイルされます：

```java
private String firstName;

public String getFirstName() {
    return firstName;
}

public void setFirstName(String firstName) {
    this.firstName = firstName;
}
```

プロパティ名が `is` で始まる場合、別の名前マッピング規則が使用されます。ゲッターの名前はプロパティ名と同じになり、セッターの名前は `is` を `set` に置き換えたものになります。
例えば、プロパティ `isOpen` の場合、ゲッターは `isOpen()` と呼ばれ、セッターは `setOpen()` と呼ばれます。
この規則は、`Boolean` だけでなく、あらゆる型のプロパティに適用されます。

## パッケージレベルの関数 (Package-level functions)

パッケージ `org.example` 内のファイル `app.kt` で宣言されたすべての関数とプロパティ（拡張関数を含む）は、`org.example.AppKt` という名前のJavaクラスの静的メソッドにコンパイルされます。

```kotlin
// app.kt
package org.example

class Util

fun getTime() { /*...*/ }

```

```java
// Java
new org.example.Util();
org.example.AppKt.getTime();
```

生成されるJavaクラスにカスタム名を指定するには、`@JvmName` アノテーションを使用します：

```kotlin
@file:JvmName("DemoUtils")

package org.example

class Util

fun getTime() { /*...*/ }

```

```java
// Java
new org.example.Util();
org.example.DemoUtils.getTime();
```

生成されるJavaクラス名が同じ（同じパッケージで同じ名前、または同じ [`@JvmName`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-name/index.html) アノテーションを持つ）複数のファイルが存在することは、通常はエラーになります。
しかし、コンパイラは、指定された名前を持ち、その名前を持つすべてのファイルからのすべての宣言を含む単一のJavaファサード（facade）クラスを生成できます。
このようなファサードの生成を有効にするには、該当するすべてのファイルで [`@JvmMultifileClass`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-multifile-class/index.html) アノテーションを使用します。

```kotlin
// oldutils.kt
@file:JvmName("Utils")
@file:JvmMultifileClass

package org.example

fun getTime() { /*...*/ }
```

```kotlin
// newutils.kt
@file:JvmName("Utils")
@file:JvmMultifileClass

package org.example

fun getDate() { /*...*/ }
```

```java
// Java
org.example.Utils.getTime();
org.example.Utils.getDate();
```

## インスタンスフィールド (Instance fields)

KotlinのプロパティをJavaのフィールドとして公開する必要がある場合は、[`@JvmField`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-field/index.html) アノテーションを付加します。
フィールドは、基になるプロパティと同じ可視性を持ちます。以下の条件を満たす場合、プロパティに `@JvmField` を付加できます：
* バッキングフィールドを持っている
* privateではない
* `open`、`override`、`const` 修飾子を持っていない
* 委譲プロパティ（delegated property）ではない

```kotlin
class User(id: String) {
    @JvmField val ID = id
}
```

```java

// Java
class JavaClient {
    public String getID(User user) {
        return user.ID;
    }
}
```

[遅延初期化](properties.md#late-initialized-properties-and-variables)（Late-Initialized）プロパティもフィールドとして公開されます。
フィールドの可視性は、`lateinit` プロパティのセッターの可視性と同じになります。

## 静的フィールド (Static fields)

名前付きオブジェクト（named object）またはコンパニオンオブジェクト（companion object）で宣言されたKotlinのプロパティは、その名前付きオブジェクト内、またはコンパニオンオブジェクトを含むクラス内に静的なバッキングフィールドを持ちます。

通常、これらのフィールドはprivateですが、以下のいずれかの方法で公開できます：

 - [`@JvmField`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-field/index.html) アノテーション
 - `lateinit` 修飾子
 - `const` 修飾子
 
このようなプロパティに `@JvmField` を付加すると、プロパティ自体と同じ可視性を持つ静的フィールドになります。

```kotlin
class Key(val value: Int) {
    companion object {
        @JvmField
        val COMPARATOR: Comparator<Key> = compareBy<Key> { it.value }
    }
}
```

```java
// Java
Key.COMPARATOR.compare(key1, key2);
// Keyクラス内の public static final フィールド
```

オブジェクトまたはコンパニオンオブジェクト内の [遅延初期化](properties.md#late-initialized-properties-and-variables) プロパティは、プロパティのセッターと同じ可視性を持つ静的なバッキングフィールドを持ちます。

```kotlin
object Singleton {
    lateinit var provider: Provider
}
```

```java

// Java
Singleton.provider = new Provider();
// Singletonクラス内の public static non-final フィールド
```

`const` として宣言されたプロパティ（クラス内およびトップレベル）は、Javaでは静的フィールドに変換されます：

```kotlin
// ファイル example.kt

object Obj {
    const val CONST = 1
}

class C {
    companion object {
        const val VERSION = 9
    }
}

const val MAX = 239
```

Javaの場合：

```java

int constant = Obj.CONST;
int max = ExampleKt.MAX;
int version = C.VERSION;
```

## 静的メソッド (Static methods)

前述のように、Kotlinはパッケージレベルの関数を静的メソッドとして表現します。
また、名前付きオブジェクトまたはコンパニオンオブジェクトで定義された関数を [`@JvmStatic`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-static/index.html) としてアノテートすると、その関数に対して静的メソッドを生成できます。
このアノテーションを使用すると、コンパイラはオブジェクトを囲むクラスの静的メソッドと、オブジェクト自体のインスタンスメソッドの両方を生成します。例：

```kotlin
class C {
    companion object {
        @JvmStatic fun callStatic() {}
        fun callNonStatic() {}
    }
}
```

これで、Javaでは `callStatic()` は静的になりますが、`callNonStatic()` はそうなりません：

```java

C.callStatic(); // 正常に動作
C.callNonStatic(); // エラー: 静的メソッドではありません
C.Companion.callStatic(); // インスタンスメソッドは残る
C.Companion.callNonStatic(); // 唯一動作する方法
```

名前付きオブジェクトの場合も同様です：

```kotlin
object Obj {
    @JvmStatic fun callStatic() {}
    fun callNonStatic() {}
}
```

Javaの場合：

```java

Obj.callStatic(); // 正常に動作
Obj.callNonStatic(); // エラー
Obj.INSTANCE.callNonStatic(); // 動作する。シングルトンインスタンスを経由した呼び出し
Obj.INSTANCE.callStatic(); // これも動作する
```

Kotlin 1.3以降、`@JvmStatic` はインターフェースのコンパニオンオブジェクトで定義された関数にも適用されます。
そのような関数は、インターフェース内の静的メソッドにコンパイルされます。インターフェースの静的メソッドはJava 1.8で導入されたため、対応するターゲットを使用するようにしてください。

```kotlin
interface ChatBot {
    companion object {
        @JvmStatic fun greet(username: String) {
            println("Hello, $username")
        }
    }
}
```

`@JvmStatic` アノテーションをオブジェクトまたはコンパニオンオブジェクトのプロパティに適用して、そのゲッターおよびセッターメソッドをそのオブジェクトまたはコンパニオンオブジェクトを含むクラスの静的メンバーにすることもできます。

## インターフェースのデフォルトメソッド (Default methods in interfaces)

JVMをターゲットにする場合、Kotlinは、[別の設定](#compatibility-modes-for-default-methods)がされていない限り、インターフェースで宣言された関数を[デフォルトメソッド](https://docs.oracle.com/javase/tutorial/java/IandI/defaultmethods.html)にコンパイルします。
これらはインターフェース内の具体的なメソッドであり、Javaクラスは再実装することなく直接継承できます。

以下は、デフォルトメソッドを持つKotlinインターフェースの例です：

```kotlin
interface Robot {
    fun move() { println("~walking~") }  // Javaインターフェースではデフォルトになります
    fun speak(): Unit
}
```

デフォルトの実装は、インターフェースを実装するJavaクラスで利用可能です。

```java
// Javaの実装
public class C3PO implements Robot {
    // Robotからの move() の実装は暗黙的に利用可能
    @Override
    public void speak() {
        System.out.println("I beg your pardon, sir");
    }
}
```

```java
C3PO c3po = new C3PO();
c3po.move(); // Robotインターフェースからのデフォルト実装
c3po.speak();
```

インターフェースの実装側でデフォルトメソッドをオーバーライドすることもできます。

```java
// Java
public class BB8 implements Robot {
    // デフォルトメソッドの独自の実装
    @Override
    public void move() {
        System.out.println("~rolling~");
    }

    @Override
    public void speak() {
        System.out.println("Beep-beep");
    }
}
```

### デフォルトメソッドの互換モード

Kotlinは、インターフェース内の関数をJVMのデフォルトメソッドにコンパイルする方法を制御するための3つのモードを提供しています。
これらのモードは、コンパイラが互換性のためのブリッジ（compatibility bridges）や `DefaultImpls` クラス内の静的メソッドを生成するかどうかを決定します。

この動作は `-jvm-default` コンパイラオプションを使用して制御できます。

> `-jvm-default` コンパイラオプションは、非推奨となった `-Xjvm-default` オプションを置き換えるものです。
>
{style="note"}

互換モードの詳細：

#### enable {initial-collapse-state="collapsed" collapsible="true"}

デフォルトの動作です。
インターフェースにデフォルト実装を生成し、互換ブリッジと `DefaultImpls` クラスを含めます。
このモードは、以前にコンパイルされたKotlinコードとの互換性を維持します。

#### no-compatibility {initial-collapse-state="collapsed" collapsible="true"}

インターフェースにデフォルト実装のみを生成します。
互換ブリッジと `DefaultImpls` クラスをスキップします。
`DefaultImpls` クラスに依存するコードと相互作用しない新しいコードベースにこのモードを使用してください。
これは、古いKotlinコードとのバイナリ互換性を壊す可能性があります。

> インターフェースの委譲（interface delegation）が使用されている場合、すべてのインターフェースメソッドが委譲されます。
>
{style="note"}

#### disable {initial-collapse-state="collapsed" collapsible="true"}

インターフェースのデフォルト実装を無効にします。
互換ブリッジと `DefaultImpls` クラスのみが生成されます。

## 可視性 (Visibility)

Kotlinの可視性修飾子は、以下のようにJavaにマッピングされます：

* `private` メンバーは `private` メンバーにコンパイルされます。
* `private` トップレベル宣言は `private` トップレベル宣言にコンパイルされます。クラス内からアクセスされる場合は、パッケージプライベートなアクセサも含まれます。
* `protected` は `protected` のままです。（Javaは同じパッケージ内の他のクラスからのprotectedメンバーへのアクセスを許可しますが、Kotlinは許可しないため、Javaクラスの方がコードへのアクセス範囲が広くなることに注意してください。）
* `internal` 宣言はJavaでは `public` になります。`internal` クラスのメンバーは、Javaから誤って使用されるのを防ぎ、Kotlinの規則に従って互いに見えない同じシグネチャを持つメンバーのオーバーロードを可能にするために、名前のマングリング（name mangling）が行われます。
* `public` は `public` のままです。

## KClass

`KClass` 型のパラメータを持つKotlinメソッドを呼び出す必要がある場合があります。
`Class` から `KClass` への自動変換はないため、`Class<T>.kotlin` 拡張プロパティに相当するものを呼び出して手動で行う必要があります。

```kotlin
kotlin.jvm.JvmClassMappingKt.getKotlinClass(MainView.class)
```

## @JvmName によるシグネチャ衝突の処理

Kotlinで名前を付けた関数が、バイトコードにおいて異なるJVM名を必要とする場合があります。
最も顕著な例は、*型消去*（type erasure）によって発生します：

```kotlin
fun List<String>.filterValid(): List<String>
fun List<Int>.filterValid(): List<Int>
```

これら2つの関数は、JVMシグネチャが同じ `filterValid(Ljava/util/List;)Ljava/util/List;` であるため、並べて定義することはできません。
Kotlinでどうしても同じ名前にしたい場合は、一方（または両方）を [`@JvmName`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-name/index.html) でアノテートし、引数として別の名前を指定します：

```kotlin
fun List<String>.filterValid(): List<String>

@JvmName("filterValidInt")
fun List<Int>.filterValid(): List<Int>
```

Kotlinからは同じ名前 `filterValid` でアクセスできますが、Javaからは `filterValid` と `filterValidInt` になります。

同じトリックは、プロパティ `x` と同時に関数 `getX()` を持たせる必要がある場合にも適用できます：

```kotlin
val x: Int
    @JvmName("getX_prop")
    get() = 15

fun getX() = 10
```

明示的に実装されたゲッターやセッターを持たないプロパティに対して、生成されるアクセサメソッドの名前を変更するには、`@get:JvmName` および `@set:JvmName` を使用できます：

```kotlin
@get:JvmName("x")
@set:JvmName("changeX")
var x: Int = 23
```

## オーバーロードの生成 (Overloads generation)

通常、デフォルトの引数値を持つKotlin関数を作成すると、Javaからはすべての引数が存在するフルシグネチャとしてのみ見えます。Javaの呼び出し元に複数のオーバーロードを公開したい場合は、[`@JvmOverloads`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-overloads/index.html) アノテーションを使用できます。

このアノテーションは、コンストラクタや静的メソッドなどにも機能します。インターフェースで定義されたメソッドを含む抽象メソッドには使用できません。

```kotlin
class Circle @JvmOverloads constructor(centerX: Int, centerY: Int, radius: Double = 1.0) {
    @JvmOverloads fun draw(label: String, lineWidth: Int = 1, color: String = "red") { /*...*/ }
}
```

デフォルト値を持つ各パラメータに対して、このパラメータと、パラメータリスト内のその右側にあるすべてのパラメータを削除した追加のオーバーロードが1つ生成されます。この例では、以下が生成されます：

```java
// コンストラクタ:
Circle(int centerX, int centerY, double radius)
Circle(int centerX, int centerY)

// メソッド
void draw(String label, int lineWidth, String color) { }
void draw(String label, int lineWidth) { }
void draw(String label) { }
```

[セカンダリコンストラクタ](classes.md#secondary-constructors)で説明されているように、クラスのすべてのコンストラクタパラメータにデフォルト値がある場合、そのクラスに対して引数なしのパブリックコンストラクタが生成されます。これは、`@JvmOverloads` アノテーションが指定されていない場合でも機能します。

## 検査例外 (Checked exceptions)

Kotlinには検査例外がありません。
そのため、通常、Kotlin関数のJavaシグネチャはスローされる例外を宣言しません。
したがって、次のようなKotlinの関数があるとします：

```kotlin
// example.kt
package demo

fun writeToFile() {
    /*...*/
    throw IOException()
}
```

これをJavaから呼び出して例外をキャッチしようとすると：

```java

// Java
try {
    demo.Example.writeToFile();
} catch (IOException e) { 
    // エラー: writeToFile() は throws リストに IOException を宣言していません
    // ...
}
```

`writeToFile()` が `IOException` を宣言していないため、Javaコンパイラからエラーメッセージが表示されます。
この問題を回避するには、Kotlinで [`@Throws`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-throws/index.html) アノテーションを使用します：

```kotlin
@Throws(IOException::class)
fun writeToFile() {
    /*...*/
    throw IOException()
}
```

## Null安全性 (Null-safety)

JavaからKotlin関数を呼び出す際、非Null（non-nullable）パラメータとして `null` を渡すことを防ぐものはありません。
そのため、Kotlinは非Nullを期待するすべてのパブリック関数に対してランタイムチェックを生成します。
これにより、Javaコードで即座に `NullPointerException` が発生するようになります。

## ジェネリクスの変異 (Variant generics)

Kotlinクラスが[宣言区変異](generics.md#declaration-site-variance)（declaration-site variance）を使用している場合、それらがJavaコードからどのように見えるかについて2つのオプションがあります。例えば、次のクラスとそれを使用する2つの関数があるとします：

```kotlin
class Box<out T>(val value: T)

interface Base
class Derived : Base

fun boxDerived(value: Derived): Box<Derived> = Box(value)
fun unboxBase(box: Box<Base>): Base = box.value
```

これらの関数をJavaに翻訳する素直な方法は次のようになります：

```java
Box<Derived> boxDerived(Derived value) { ... }
Base unboxBase(Box<Base> box) { ... }
```

問題は、Kotlinでは `unboxBase(boxDerived(Derived()))` と書けますが、Javaではクラス `Box` がそのパラメータ `T` に対して *不変*（invariant）であり、したがって `Box<Derived>` は `Box<Base>` のサブタイプではないため、それが不可能であることです。
これをJavaで動作させるには、`unboxBase` を次のように定義する必要があります：

```java
Base unboxBase(Box<? extends Base> box) { ... }  
```

この宣言は、Javaの *ワイルドカード型*（wildcards types: `? extends Base`）を使用して、使用区変異を通じて宣言区変異をエミュレートしています。

Kotlin APIをJavaで動作させるために、共変（covariant）に定義された `Box`（または反変（contravariant）に定義された `Foo`）が *パラメータとして* 現れるとき、コンパイラは `Box<Super>` を `Box<? extends Super>`（または `Foo<? super Bar>`）として生成します。戻り値の場合はワイルドカードは生成されません。そうしないとJavaクライアントがそれらを処理しなければならなくなるためです（そしてそれは一般的なJavaのコーディングスタイルに反します）。したがって、この例の関数は実際には次のように翻訳されます：

```java

// 戻り値の型 - ワイルドカードなし
Box<Derived> boxDerived(Derived value) { ... }
 
// パラメータ - ワイルドカードあり 
Base unboxBase(Box<? extends Base> box) { ... }
```

> 引数の型が final である場合、通常ワイルドカードを生成する意味がないため、`Box<String>` はどの位置にあっても常に `Box<String>` になります。
>
{style="note"}

デフォルトでワイルドカードが生成されない場所にワイルドカードが必要な場合は、`@JvmWildcard` アノテーションを使用します：

```kotlin
fun boxDerived(value: Derived): Box<@JvmWildcard Derived> = Box(value)
// 次のように翻訳されます
// Box<? extends Derived> boxDerived(Derived value) { ... }
```

逆に、ワイルドカードが生成される場所でワイルドカードが不要な場合は、`@JvmSuppressWildcards` を使用します：

```kotlin
fun unboxBase(box: Box<@JvmSuppressWildcards Base>): Base = box.value
// 次のように翻訳されます
// Base unboxBase(Box<Base> box) { ... }
```

>`@JvmSuppressWildcards` は個別の型引数だけでなく、関数やクラスなどの宣言全体に使用でき、その中のすべてのワイルドカードを抑制できます。
>
{style="note"}

### Nothing型の翻訳
 
[`Nothing`](exceptions.md#the-nothing-type) 型は、Javaに自然な対応物がないため特殊です。実際、`java.lang.Void` を含むすべてのJavaの参照型は値として `null` を受け入れますが、`Nothing` はそれさえ受け入れません。したがって、この型をJavaの世界で正確に表現することはできません。これが、Kotlinが `Nothing` 型の引数が使用される場所に raw 型を生成する理由です：

```kotlin
fun emptyList(): `List<Nothing>` = listOf()
// 次のように翻訳されます
// List emptyList() { ... }
```

## インライン値クラス (Inline value classes)

<primary-label ref="experimental-general"/>

JavaコードをKotlinの[インライン値クラス](inline-classes.md)（inline value classes）とスムーズに連携させたい場合は、[`@JvmExposeBoxed`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.jvm/-jvm-expose-boxed/) アノテーションまたは `-Xjvm-expose-boxed` コンパイラオプションを使用できます。これらのアプローチにより、KotlinはJavaとの相互運用のために必要なボックス化された表現（boxed representations）を生成します。

デフォルトでは、Kotlinはインライン値クラスを、Javaからはアクセスできないことが多い **ボックス化されていない表現**（unboxed representations）を使用するようにコンパイルします。
例えば、Javaから `MyInt` クラスのコンストラクタを呼び出すことはできません：

```kotlin
@JvmInline
value class MyInt(val value: Int)
```

そのため、次のJavaコードは失敗します：

```java
MyInt input = new MyInt(5);
```

`@JvmExposeBoxed` アノテーションを使用すると、KotlinはJavaから直接呼び出すことができるパブリックコンストラクタを生成します。
このアノテーションを以下のレベルで適用して、Javaに公開するものをきめ細かく制御できます：

* クラス
* コンストラクタ
* 関数

コードで `@JvmExposeBoxed` アノテーションを使用する前に、`@OptIn(ExperimentalStdlibApi::class)` を使用してオプトインする必要があります。
例：

```kotlin
@OptIn(ExperimentalStdlibApi::class)
@JvmExposeBoxed
@JvmInline
value class MyInt(val value: Int)

@OptIn(ExperimentalStdlibApi::class)
@JvmExposeBoxed
fun MyInt.timesTwoBoxed(): MyInt = MyInt(this.value * 2)
```

これらのアノテーションにより、Kotlinは `MyInt` クラスに対してJavaからアクセス可能なコンストラクタを生成し、**さらに**値クラスのボックス化された形式を使用する拡張関数のバリアントも生成します。これにより、次のJavaコードが正常に実行されます：

```java
MyInt input = new MyInt(5);
MyInt output = ExampleKt.timesTwoBoxed(input);
```

この動作をモジュール内のすべてのインライン値クラスおよびそれらを使用する関数に適用するには、`-Xjvm-expose-boxed` オプションを使用してコンパイルします。
このオプションを使用してコンパイルすることは、モジュール内のすべての宣言に `@JvmExposeBoxed` アノテーションが付いているのと同じ効果があります。

### 継承された関数

`@JvmExposeBoxed` アノテーションは、継承された関数に対して自動的にボックス化された表現を生成しません。
 
継承された関数に対して必要な表現を生成するには、実装クラスまたは拡張クラスでその関数をオーバーライドしてください：
 
```kotlin
interface IdTransformer {
    fun transformId(rawId: UInt): UInt = rawId
}

// transformId() 関数に対してボックス化された表現を生成しません
@OptIn(ExperimentalStdlibApi::class)
@JvmExposeBoxed
class LightweightTransformer : IdTransformer

// transformId() 関数に対してボックス化された表現を生成します
@OptIn(ExperimentalStdlibApi::class)
@JvmExposeBoxed
class DefaultTransformer : IdTransformer {
    override fun transformId(rawId: UInt): UInt = super.transformId(rawId)
}
```

Kotlinでの継承の仕組みや、`super` キーワードを使用してスーパークラスの実装を呼び出す方法については、[継承](inheritance.md#calling-the-superclass-implementation)を参照してください。