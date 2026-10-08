[//]: # (title: リフレクション)

リフレクション（Reflection）とは、実行時にプログラムの構造をイントロスペクト（自叙的に解析）できるようにする、言語およびライブラリの機能セットのことです。
Kotlinでは関数とプロパティが第一級オブジェクト（First-class citizens）であり、それらをイントロスペクトすること（例えば、実行時に関数やプロパティの名前や型を知ること）は、関数型スタイルやリアクティブスタイルを使用する際に不可欠です。

> Kotlin/JSにおけるリフレクション機能のサポートは限定的です。[Kotlin/JSにおけるリフレクションの詳細](js-reflection.md)をご覧ください。
>
{style="note"}

## JVMの依存関係 {id="jvm-dependency"}

JVMプラットフォームでは、リフレクション機能を使用するために必要なランタイムコンポーネントは、Kotlinコンパイラの配布物の中に `kotlin-reflect.jar` という別のアーティファクトとして含まれています。これは、リフレクション機能を使用しないアプリケーションに対して、ランタイムライブラリに必要なサイズを削減するために行われています。

GradleまたはMavenプロジェクトでリフレクションを使用するには、`kotlin-reflect` への依存関係を追加してください：

* Gradleの場合：

    <tabs group="build-script">
    <tab title="Kotlin" group-key="kotlin">

    ```kotlin
    dependencies {
        implementation(kotlin("reflect"))
    }
    ```

    </tab>
    <tab title="Groovy" group-key="groovy">
    
    ```groovy
    dependencies {
        implementation "org.jetbrains.kotlin:kotlin-reflect:%kotlinVersion%"
    }
    ```

    </tab>
    </tabs>

* Mavenの場合：
    
    ```xml
    <dependencies>
        <dependency>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-reflect</artifactId>
        </dependency>
    </dependencies>
    ```

GradleやMavenを使用していない場合は、プロジェクトのクラスパスに `kotlin-reflect.jar` が含まれていることを確認してください。
その他のサポートされているケース（コマンドラインコンパイラを使用するIntelliJ IDEAプロジェクトなど）では、デフォルトで追加されます。コマンドラインコンパイラでは、`-no-reflect` コンパイラオプションを使用してクラスパスから `kotlin-reflect.jar` を除外することができます。

## クラス参照 {id="class-references"}

最も基本的なリフレクション機能は、Kotlinクラスの実行時参照を取得することです。
静的に既知のKotlinクラスの参照を取得するには、クラスリテラル（class literal）構文を使用します：

```kotlin
val c = MyClass::class
```

この参照は [KClass](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-class/index.html) 型の値です。

>JVMにおいて：Kotlinのクラス参照はJavaのクラス参照とは異なります。Javaのクラス参照を取得するには、`KClass` インスタンスの `.java` プロパティを使用してください。
>
{style="note"}

### バインドされたクラス参照 {id="bound-class-references"}

特定のオブジェクトのクラスへの参照を取得するには、同じ `::class` 構文を使用して、そのオブジェクトをレシーバーとして指定します：

```kotlin
val widget: Widget = ...
assert(widget is GoodWidget) { "Bad widget: ${widget::class.qualifiedName}" }
```

レシーバー式の型（`Widget`）に関わらず、オブジェクトの正確なクラス（例：`GoodWidget` や `BadWidget`）の参照を取得できます。

## 呼び出し可能参照 {id="callable-references"}

関数、プロパティ、コンストラクタへの参照は、呼び出すことも、[関数型](lambdas.md#function-types)のインスタンスとして使用することもできます。

すべての呼び出し可能参照に共通するスーパータイプは [`KCallable<out R>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-callable/index.html) です。ここで `R` は戻り値の型です。これはプロパティの場合はプロパティの型であり、コンストラクタの場合は構築される型です。

### 関数参照 {id="function-references"}

以下のように宣言された名前付き関数がある場合、それを直接呼び出すことができます（`isOdd(5)`）：

```kotlin
fun isOdd(x: Int) = x % 2 != 0
```

代わりに、その関数を関数型の値として使用する、つまり別の関数に渡すこともできます。そのためには、`::` 演算子を使用します：

```kotlin
fun isOdd(x: Int) = x % 2 != 0

fun main() {
//sampleStart
    val numbers = listOf(1, 2, 3)
    println(numbers.filter(::isOdd))
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

ここで `::isOdd` は関数型 `(Int) -> Boolean` の値です。

関数参照は、パラメータの数に応じて [`KFunction<out R>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-function/index.html) のサブタイプのいずれかに属します。例えば、`KFunction3<T1, T2, T3, R>` などです。

期待される型がコンテキストから判明している場合は、オーバーロードされた関数に対して `::` を使用できます。
例えば：

```kotlin
fun main() {
//sampleStart
    fun isOdd(x: Int) = x % 2 != 0
    fun isOdd(s: String) = s == "brillig" || s == "slithy" || s == "tove"
    
    val numbers = listOf(1, 2, 3)
    println(numbers.filter(::isOdd)) // isOdd(x: Int) を参照
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

あるいは、明示的に型を指定した変数にメソッド参照を格納することで、必要なコンテキストを提供することもできます：

```kotlin
val predicate: (String) -> Boolean = ::isOdd   // isOdd(x: String) を参照
```

クラスのメンバや拡張関数を使用する必要がある場合は、`String::toCharArray` のように修飾する必要があります。

拡張関数への参照で変数を初期化する場合でも、推論される関数型はレシーバーを持ちませんが、レシーバーオブジェクトを受け取る追加のパラメータを持つことになります。代わりにレシーバーを持つ関数型にするには、型を明示的に指定してください：

```kotlin
val isEmptyStringList: List<String>.() -> Boolean = List<String>::isEmpty
```

#### 例：関数の合成 {id="example-function-composition"}

以下の関数を考えてみましょう：

```kotlin
fun <A, B, C> compose(f: (B) -> C, g: (A) -> B): (A) -> C {
    return { x -> f(g(x)) }
}
```

これは、渡された2つの関数の合成 `compose(f, g) = f(g(*))` を返します。
この関数を呼び出し可能参照に適用できます：

```kotlin
fun <A, B, C> compose(f: (B) -> C, g: (A) -> B): (A) -> C {
    return { x -> f(g(x)) }
}

fun isOdd(x: Int) = x % 2 != 0

fun main() {
//sampleStart
    fun length(s: String) = s.length
    
    val oddLength = compose(::isOdd, ::length)
    val strings = listOf("a", "ab", "abc")
    
    println(strings.filter(oddLength))
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### プロパティ参照 {id="property-references"}

Kotlinでプロパティを第一級オブジェクトとして扱うには、`::` 演算子を使用します：

```kotlin
val x = 1

fun main() {
    println(::x.get())
    println(::x.name) 
}
```

式 `::x` は `KProperty0<Int>` 型のプロパティオブジェクトになります。`get()` を使用してその値を読み取ったり、`name` プロパティを使用してプロパティ名を取得したりできます。詳細については、[`KProperty` クラスのドキュメント](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-property/index.html)を参照してください。

`var y = 1` のような可変（mutable）プロパティの場合、`::y` は [`KMutableProperty0<Int>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-mutable-property/index.html) 型の値を返し、これには `set()` メソッドがあります：

```kotlin
var y = 1

fun main() {
    ::y.set(2)
    println(y)
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

プロパティ参照は、1つのジェネリックパラメータを持つ関数が期待される場所で使用できます：

```kotlin
fun main() {
//sampleStart
    val strs = listOf("a", "bc", "def")
    println(strs.map(String::length))
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

クラスのメンバであるプロパティにアクセスするには、次のように修飾します：

```kotlin
fun main() {
//sampleStart
    class A(val p: Int)
    val prop = A::p
    println(prop.get(A(1)))
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

拡張プロパティの場合：

```kotlin
val String.lastChar: Char
    get() = this[length - 1]

fun main() {
    println(String::lastChar.get("abc"))
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### Javaリフレクションとの相互運用性 {id="interoperability-with-java-reflection"}

JVMプラットフォームでは、標準ライブラリにJavaリフレクションオブジェクトとのマッピングを提供するリフレクションクラスの拡張が含まれています（`kotlin.reflect.jvm` パッケージを参照）。
例えば、Kotlinプロパティのゲッターとして機能するバッキングフィールドやJavaメソッドを見つけるには、次のように記述できます：

```kotlin
import kotlin.reflect.jvm.*
 
class A(val p: Int)
 
fun main() {
    println(A::p.javaGetter) // "public final int A.getP()" を出力
    println(A::p.javaField)  // "private final int A.p" を出力
}
```

Javaクラスに対応するKotlinクラスを取得するには、`.kotlin` 拡張プロパティを使用します：

```kotlin
fun getKClass(o: Any): KClass<Any> = o.javaClass.kotlin
```

### コンストラクタ参照 {id="constructor-references"}

コンストラクタは、メソッドやプロパティと同じように参照できます。コンストラクタと同じパラメータを受け取り、適切な型のオブジェクトを返す関数型オブジェクトが期待される場所であれば、どこでもコンストラクタ参照を使用できます。
コンストラクタは、`::` 演算子を使用し、クラス名を追加することで参照されます。引数なしで戻り値の型が `Foo` である関数パラメータを期待する、以下の関数を考えてみましょう：

```kotlin
class Foo

fun function(factory: () -> Foo) {
    val x: Foo = factory()
}
```

クラス `Foo` の引数ゼロのコンストラクタである `::Foo` を使用して、次のように呼び出すことができます：

```kotlin
function(::Foo)
```

コンストラクタへの呼び出し可能参照は、パラメータの数に応じて [`KFunction<out R>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-function/index.html) のサブタイプのいずれかとして型付けされます。

### バインドされた関数およびプロパティ参照 {id="bound-function-and-property-references"}

特定のオブジェクトのインスタンスメソッドを参照できます：

```kotlin
fun main() {
//sampleStart
    val numberRegex = "\\d+".toRegex()
    println(numberRegex.matches("29"))
     
    val isNumber = numberRegex::matches
    println(isNumber("29"))
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

メソッド `matches` を直接呼び出す代わりに、この例ではそれへの参照を使用しています。
このような参照はそのレシーバーにバインド（固定）されています。
それは（上記の例のように）直接呼び出すことも、関数型式が期待される場所で使用することもできます：

```kotlin
fun main() {
//sampleStart
    val numberRegex = "\\d+".toRegex()
    val strings = listOf("abc", "124", "a70")
    println(strings.filter(numberRegex::matches))
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

バインドされた参照とバインドされていない参照の型を比較してみましょう。
バインドされた呼び出し可能参照はレシーバーが「アタッチ」されているため、レシーバーの型はもはやパラメータではありません：

```kotlin
val isNumber: (CharSequence) -> Boolean = numberRegex::matches

val matches: (Regex, CharSequence) -> Boolean = Regex::matches
```

プロパティ参照も同様にバインドできます：

```kotlin
fun main() {
//sampleStart
    val prop = "abc"::length
    println(prop.get())
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

レシーバーとして `this` を指定する必要はありません。`this::foo` と `::foo` は等価です。

### バインドされたコンストラクタ参照 {id="bound-constructor-references"}

[内部クラス（inner class）](nested-classes.md#inner-classes)のコンストラクタへのバインドされた呼び出し可能参照は、外部クラスのインスタンスを提供することで取得できます：

```kotlin
class Outer {
    inner class Inner
}

val o = Outer()
val boundInnerCtor = o::Inner
```
