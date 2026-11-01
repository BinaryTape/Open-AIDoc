[//]: # (title: コーディング規約)

広く知られ、従いやすいコーディング規約は、どのようなプログラミング言語にとっても極めて重要です。
ここでは、Kotlin を使用するプロジェクトのためのコードスタイルおよびコード構成に関するガイドラインを提供します。

## IDE でのスタイルの設定 {id="configure-style-in-ide"}

Kotlin 向けの最も人気のある2つの IDE である [IntelliJ IDEA](https://www.jetbrains.com/idea/) と [Android Studio](https://developer.android.com/studio/) は、コードスタイルに関する強力なサポートを提供しています。指定されたコードスタイルに従って自動的にコードをフォーマットするように設定できます。
 
### スタイルガイドの適用 {id="apply-the-style-guide"}

1. **Settings/Preferences | Editor | Code Style | Kotlin** に移動します。
2. **Set from...** をクリックします。
3. **Kotlin style guide** を選択します。

### コードがスタイルガイドに従っていることの確認 {id="verify-that-your-code-follows-the-style-guide"}

1. **Settings/Preferences | Editor | Inspections | General** に移動します。
2. **Incorrect formatting** インスペクションをオンにします。
スタイルガイドに記載されているその他の問題（命名規則など）を検証する追加のインスペクションは、デフォルトで有効になっています。

<!-- Replace with an external link when the guide is moved -->

詳細については、[IntelliJ IDEA での Kotlin コードスタイルへの移行](code-style-migration-guide.md) ガイドを参照してください。

## ソースコードの構成 {id="source-code-organization"}

### ディレクトリ構造 {id="directory-structure"}

純粋な Kotlin プロジェクトでは、共通のルートパッケージを省略したパッケージ構造に従うディレクトリ構造を推奨します。たとえば、プロジェクト内のすべてのコードが `org.example.kotlin` パッケージとそのサブパッケージにある場合、`org.example.kotlin` パッケージのファイルはソースルート直下に配置し、`org.example.kotlin.network.socket` のファイルはソースルートの `network/socket` サブディレクトリに配置します。

>JVM 上: Kotlin を Java と併用するプロジェクトでは、Kotlin ソースファイルは Java ソースファイルと同じソースルートに配置し、同じディレクトリ構造に従う必要があります。つまり、各ファイルはそれぞれの package 文に対応するディレクトリに格納される必要があります。
>
{style="note"}

### ソースファイル名 {id="source-file-names"}

Kotlin ファイルに単一のクラスまたはインターフェース（および関連する可能性のあるトップレベル宣言）が含まれている場合、その名前はクラス名に `.kt` 拡張子を付けたものと同じにする必要があります。これはすべての種類のクラスおよびインターフェースに適用されます。
ファイルに複数のクラスが含まれている場合、またはトップレベル宣言のみが含まれている場合は、ファイルに含まれる内容を説明する名前を選択し、それに応じてファイル名を付けます。
各単語の先頭を大文字にする[アッパーキャメルケース（Upper camel case）](https://en.wikipedia.org/wiki/Camel_case)を使用してください。
たとえば、`ProcessDeclarations.kt` などです。

ファイル名は、ファイル内のコードが何を行うかを説明するものである必要があります。したがって、ファイル名に `Util` などの意味のない単語を使用することは避けるべきです。

#### マルチプラットフォームプロジェクト {id="multiplatform-projects"}

マルチプラットフォームプロジェクトでは、プラットフォーム固有のソースセット内にあるトップレベル宣言を持つファイルには、そのソースセットの名前に応じたサフィックスを付ける必要があります。たとえば:

* **jvm**Main/kotlin/Platform.**jvm**.kt
* **android**Main/kotlin/Platform.**android**.kt
* **ios**Main/kotlin/Platform.**ios**.kt

共通（common）ソースセットについては、トップレベル宣言を持つファイルにサフィックスを付けるべきではありません。たとえば、`commonMain/kotlin/Platform.kt` です。

##### 技術的な詳細 {initial-collapse-state="collapsed" collapsible="true" id="technical-details"}

マルチプラットフォームプロジェクトでこのファイル命名スキームを推奨するのは、JVM の制限によるものです。JVM ではトップレベルのメンバー（関数、プロパティ）が許可されていません。

これを回避するために、Kotlin JVM コンパイラはトップレベルメンバー宣言を含むラッパークラス（いわゆる「ファイルファサード」）を作成します。ファイルファサードは、ファイル名から派生した内部名を持ちます。

一方、JVM では同じ完全修飾名（FQN: Fully Qualified Name）を持つ複数のクラスが存在することは許可されません。これにより、Kotlin プロジェクトを JVM 向けにコンパイルできなくなる状況が発生する可能性があります:

```none
root
|- commonMain/kotlin/myPackage/Platform.kt // 'fun count() { }' を含む
|- jvmMain/kotlin/myPackage/Platform.kt // 'fun multiply() { }' を含む
```

ここで、両方の `Platform.kt` ファイルは同じパッケージにあるため、Kotlin JVM コンパイラは2つのファイルファサードを生成し、その両方が `myPackage.PlatformKt` という FQN を持ちます。これにより、「Duplicate JVM classes」エラーが発生します。

これを回避する最も簡単な方法は、上記のガイドラインに従ってファイルの一方の名前を変更することです。この命名スキームは、コードの可読性を維持しながら衝突を防ぐのに役立ちます。

> この推奨事項が冗長に思えるシナリオが2つありますが、それでも従うことを推奨します:
> 
> * 非 JVM プラットフォームには、ファイルファサードの重複に関する問題はありません。しかし、この命名スキームによりファイル命名の一貫性を保つことができます。
> * JVM 上で、ソースファイルにトップレベル宣言がない場合、ファイルファサードは生成されないため、名前の衝突に直面することはありません。
> 
>   ただし、この命名スキームに従うことで、単純なリファクタリングやコード追加によってトップレベル関数が含まれるようになり、同じ「Duplicate JVM classes」エラーが発生してしまう状況を回避できます。
> 
{style="tip"}

### ソースファイルの構成 {id="source-file-organization"}

同じ Kotlin ソースファイル内に複数の宣言（クラス、トップレベル関数、またはプロパティ）を配置することは、これらの宣言が意味的に互いに密接に関連しており、ファイルサイズが妥当な範囲内（数百行を超えない程度）にとどまる限り推奨されます。

特に、あるクラスのすべてのクライアントに関連する拡張関数を定義する場合は、そのクラス自体と同じファイルに配置します。特定のクライアントにのみ意味のある拡張関数を定義する場合は、そのクライアントのコードの隣に配置します。単にあるクラスのすべての拡張を保持するためだけのファイルを作成することは避けてください。

### クラスのレイアウト {id="class-layout"}

クラスの内容は、次の順序で並べる必要があります:

1. プロパティ宣言と初期化子ブロック（initializer block）
2. セカンダリコンストラクタ
3. メソッド宣言
4. コンパニオンオブジェクト（Companion object）

メソッド宣言をアルファベット順や可視性によってソートしたり、通常のメソッドと拡張メソッドを分離したりしないでください。代わりに、クラスを上から下へと読む人が何が起きているのかのロジックを追えるように、関連するものをまとめて配置します。順序（高レベルのものを先に置くか、その逆か）を決めたら、それを一貫して維持してください。

ネストしたクラスは、それらのクラスを使用するコードの隣に配置します。それらのクラスが外部で使用されることを意図しており、クラス内部で参照されていない場合は、コンパニオンオブジェクトの後の末尾に配置します。

### インターフェース実装のレイアウト {id="interface-implementation-layout"}

インターフェースを実装するときは、実装メンバーをインターフェースのメンバーと同じ順序で維持します（必要に応じて、実装に使用される追加のプライベートメソッドを間に挟みます）。

### オーバーロードのレイアウト {id="overload-layout"}

クラス内では、常にオーバーロードを隣同士に配置してください。

## 命名規則 {id="naming-rules"}

Kotlin におけるパッケージとクラスの命名規則は非常にシンプルです:

* パッケージの名前は常に小文字で、アンダースコアは使用しません（`org.example.project`）。一般的に複数単語からなる名前の使用は推奨されませんが、複数の単語を使用する必要がある場合は、単に結合するかキャメルケースを使用できます（`org.example.myProject`）。

* クラスおよびオブジェクトの名前にはアッパーキャメルケースを使用します:

```kotlin
open class DeclarationProcessor { /*...*/ }

object EmptyDeclarationProcessor : DeclarationProcessor() { /*...*/ }
```

### 関数名 {id="function-names"}
 
関数、プロパティ、ローカル変数の名前は小文字で始まり、アンダースコアを使用しないキャメルケースを使用します:

```kotlin
fun processDeclarations() { /*...*/ }
var declarationCount = 1
```

### クラスライクな関数の名前 {id="names-for-class-like-functions"}

例外として、関数名がクラスの命名規則に従うべきケースが2つあります。この種の関数は通常、トップレベルで定義されます。

* クラスのインスタンスを作成するファクトリ関数は、抽象戻り値の型と同じ名前にすることができます:

   ```kotlin
   interface Foo { /*...*/ }

   class FooImpl : Foo { /*...*/ }

   fun Foo(): Foo { return FooImpl() }
   ```

* `Unit` を返す `@Composable` 関数:

   ```kotlin
   @Composable fun TabHeader { /*...*/ }
   ```

### テストメソッドの名前 {id="names-for-test-methods"}

テスト内（および**テスト内のみ**）では、バッククォートで囲んだスペース入りのメソッド名を使用できます。なお、このようなメソッド名は API レベル 30 以降の Android ランタイムでのみサポートされています。テストコードでは、メソッド名にアンダースコアを使用することも許可されています。

```kotlin
class MyTestCase {
    @Test fun `ensure everything works`() { /*...*/ }

    @Test fun ensureEverythingWorks_onAndroid() { /*...*/ }
}
```

### プロパティ名 {id="property-names"}

定数の名前（`const` でマークされたプロパティ、またはカスタム `get` 関数を持たず完全に不変なデータを保持するトップレベルもしくはオブジェクトの `val` プロパティ）には、[スクリーミングスネークケース（Screaming snake case）](https://en.wikipedia.org/wiki/Snake_case)の慣例に従い、すべて大文字のアンダースコア区切りの名前を使用する必要があります:

```kotlin
const val MAX_COUNT = 8
val USER_NAME_FIELD = "UserName"
```

振る舞いを持つオブジェクトや可変データを保持するトップレベルまたはオブジェクトのプロパティ名には、キャメルケースの名前を使用する必要があります:

```kotlin
val mutableCollection: MutableSet<String> = HashSet()
```

シングルトンオブジェクトへの参照を保持するプロパティの名前には、`object` 宣言と同じ命名スタイルを使用できます:

```kotlin
val PersonComparator: Comparator<Person> = /*...*/
```

enum 定数には、用途に応じて、すべて大文字のアンダースコア区切り（[スクリーミングスネークケース](https://en.wikipedia.org/wiki/Snake_case)）の名前（`enum class Color { RED, GREEN }`）またはアッパーキャメルケースの名前のいずれを使用しても構いません。
   
### バッキングプロパティの名前 {id="names-for-backing-properties"}

クラスに概念的には同じである2つのプロパティがあり、一方がパブリック API の一部で、もう一方が実装の詳細である場合は、プライベートプロパティの名前のプレフィックスとしてアンダースコアを使用します:

```kotlin
class C {
    private val _elementList = mutableListOf<Element>()

    val elementList: List<Element>
        get() = _elementList
}
```

### 適切な名前の選択 {id="choose-good-names"}

クラスの名前は通常、そのクラスが何で_ある_かを説明する名詞または名詞句です: `List`、`PersonReader`。

メソッドの名前は通常、そのメソッドが何を_行う_かを示す動詞または動詞句です: `close`、`readPersons`。
名前は、メソッドがオブジェクトを変更（mutate）しているのか、それとも新しいオブジェクトを返しているのかも示唆する必要があります。たとえば、`sort` はコレクションをその場でソートするのに対し、`sorted` はコレクションのソートされたコピーを返します。

名前はエンティティの目的を明確にする必要があるため、名前に意味のない単語（`Manager`、`Wrapper`）を使用することは避けるのが最善です。

宣言名の一部として頭字語（アクロニム）を使用する場合は、次のルールに従ってください:

* 2文字の頭字語の場合は、両方の文字を大文字にします。たとえば、`IOStream` です。
* 2文字を超える頭字語の場合は、最初の文字のみを大文字にします。たとえば、`XmlFormatter` や `HttpInputStream` です。

## フォーマット {id="formatting"}

### インデント {id="indentation"}

インデントには4つのスペースを使用します。タブは使用しないでください。

波括弧（ブレース）については、構文が始まる行の末尾に開始ブレースを置き、開始構文と水平方向に揃えた個別の行に終了ブレースを配置します。

```kotlin
if (elements != null) {
    for (element in elements) {
        // ...
    }
}
```

>Kotlin ではセミコロンはオプションであるため、改行には重要な意味があります。言語設計は Java スタイルの波括弧を前提としており、別のフォーマットスタイルを使用しようとすると予期しない動作に遭遇する可能性があります。
>
{style="note"}

### 水平方向の空白（スペース） {id="horizontal-whitespace"}

* 二項演算子の前後にはスペースを置きます（`a + b`）。例外:「range to」演算子（`0..i`）の前後にはスペースを置きません。
* 単項演算子の前後にはスペースを置きません（`a++`）。
* 制御フローキーワード（`if`、`when`、`for`、`while`）と対応する開き括弧の間にはスペースを置きます。
* プライマリコンストラクタ宣言、メソッド宣言、またはメソッド呼び出しの開き括弧の前にはスペースを置きません。

```kotlin
class A(val x: Int)

fun foo(x: Int) { ... }

fun bar() {
    foo(1)
}
```

* `(`、`[` の直後、または `]`、`)` の直前には決してスペースを置かないでください。
* `.` や `?.` の前後には決してスペースを置かないでください: `foo.bar().filter { it > 2 }.joinToString()`、`foo?.bar()`。
* `//` の後にはスペースを置きます: `// This is a comment`。
* 型パラメータを指定するために使用される山括弧の前後にスペースを置かないでください: `class Map<K, V> { ... }`。
* `::` の前後にスペースを置かないでください: `Foo::class`、`String::length`。
* null許容型をマークするために使用される `?` の前にスペースを置かないでください: `String?`。

一般的なルールとして、いかなる種類の水平方向の位置揃え（アライメント）も避けてください。識別子の名前を異なる長さの名前に変更しても、宣言や使用箇所のフォーマットに影響を与えるべきではありません。

### コロン {id="colon"}

次のようなシナリオでは、`:` の前にスペースを置きます:

* 型とスーパータイプを区切るために使用される場合。
* スーパークラスのコンストラクタまたは同じクラスの別のコンストラクタに委任する場合。
* `object` キーワードの後。
    
宣言とその型を区切る場合は、`:` の前にスペースを置かないでください。
 
`:` の後には常にスペースを置きます。

```kotlin
abstract class Foo<out T : Any> : IFoo {
    abstract fun foo(a: Int): T
}

class FooImpl : Foo() {
    constructor(x: String) : this(x) { /*...*/ }

    val x = object : IFoo { /*...*/ } 
}
```

### クラスヘッダー {id="class-headers"}

プライマリコンストラクタのパラメータが少ないクラスは、1行で記述できます:

```kotlin
class Person(id: Int, name: String)
```

ヘッダーが長いクラスは、各プライマリコンストラクタのパラメータがインデントされた個別の行になるようにフォーマットする必要があります。
また、閉じ括弧は新しい行に配置する必要があります。継承を使用する場合、スーパークラスのコンストラクタ呼び出しや実装されたインターフェースのリストは、括弧と同じ行に配置する必要があります:

```kotlin
class Person(
    id: Int,
    name: String,
    surname: String
) : Human(id, name) { /*...*/ }
```

複数のインターフェースがある場合、スーパークラスのコンストラクタ呼び出しを最初に配置し、各インターフェースを異なる行に配置する必要があります:

```kotlin
class Person(
    id: Int,
    name: String,
    surname: String
) : Human(id, name),
    KotlinMaker { /*...*/ }
```

スーパータイプリストが長いクラスの場合は、コロンの後に改行を入れ、すべてのスーパータイプ名を水平方向に揃えます:

```kotlin
class MyFavouriteVeryLongClassHolder :
    MyLongHolder<MyFavouriteVeryLongClass>(),
    SomeOtherInterface,
    AndAnotherOne {

    fun foo() { /*...*/ }
}
```

クラスヘッダーが長い場合にクラスヘッダーとボディを明確に分離するには、（上記の例のように）クラスヘッダーの後に空行を置くか、開始波括弧を個別の行に配置します:

```kotlin
class MyFavouriteVeryLongClassHolder :
    MyLongHolder<MyFavouriteVeryLongClass>(),
    SomeOtherInterface,
    AndAnotherOne 
{
    fun foo() { /*...*/ }
}
```

コンストラクタパラメータには通常のインデント（4つのスペース）を使用します。これにより、プライマリコンストラクタで宣言されたプロパティが、クラスのボディで宣言されたプロパティと同じインデントを持つようになります。

### 修飾子の順序 {id="modifiers-order"}

宣言に複数の修飾子がある場合は、常に次の順序で配置します:

```kotlin
public / protected / private / internal
expect / actual
final / open / abstract / sealed / const
external
override
lateinit
tailrec
vararg
suspend
inner
enum / annotation / fun // `fun interface` の修飾子として
companion
inline / value
infix
operator
data
```

修飾子の前にすべての注釈（アノテーション）を配置します:

```kotlin
@Named("Foo")
private val foo: Foo
```

ライブラリを作成しているのでない限り、冗長な修飾子（たとえば `public`）は省略してください。

### アノテーション {id="annotations"}

アノテーションは、アタッチされる宣言の前の個別の行に、同じインデントで配置します:

```kotlin
@Target(AnnotationTarget.PROPERTY)
annotation class JsonExclude
```

引数のないアノテーションは、同じ行に配置できます:

```kotlin
@JsonExclude @JvmField
var x: String
```

引数のない単一のアノテーションは、対応する宣言と同じ行に配置できます:

```kotlin
@Test fun foo() { /*...*/ }
```

### ファイルアノテーション {id="file-annotations"}

ファイルアノテーションは、ファイルコメント（存在する場合）の後、`package` 文の前に配置し、`package` との間を空行で区切ります（パッケージではなくファイルを対象としているという事実を強調するためです）。

```kotlin
/** License, copyright and whatever */
@file:JvmName("FooBar")

package foo.bar
```

### 関数 {id="functions"}

関数のシグネチャが1行に収まらない場合は、次の構文を使用します:

```kotlin
fun longMethodName(
    argument: ArgumentType = defaultValue,
    argument2: AnotherArgumentType,
): ReturnType {
    // body
}
```

関数パラメータには通常のインデント（4つのスペース）を使用します。これにより、コンストラクタパラメータとの一貫性が確保されます。

ボディが単一の式で構成される関数の場合は、式ボディ（expression body）の使用を優先してください。

```kotlin
fun foo(): Int {     // 悪い例
    return 1 
}

fun foo() = 1        // 良い例
```

### 式ボディ {id="expression-bodies"}

関数が式ボディを持ち、その最初の行が宣言と同じ行に収まらない場合は、最初の行に `=` 記号を置き、式ボディを4つのスペースでインデントします。

```kotlin
fun f(x: String, y: String, z: String) =
    veryLongFunctionCallWithManyWords(andLongParametersToo(), x, y, z)
```

### プロパティ {id="properties"}

非常に単純な読み取り専用プロパティの場合は、1行のフォーマットを検討してください:

```kotlin
val isEmpty: Boolean get() = size == 0
```

より複雑なプロパティの場合は、常に `get` および `set` キーワードを個別の行に配置します:

```kotlin
val foo: String
    get() { /*...*/ }
```

初期化子を持つプロパティで、初期化子が長い場合は、`=` 記号の後に改行を追加し、初期化子を4つのスペースでインデントします:

```kotlin
private val defaultCharset: Charset? =
    EncodingRegistry.getInstance().getDefaultCharsetForPropertiesFiles(file)
```

### 制御フロー文 {id="control-flow-statements"}

`if` または `when` 文の条件が複数行にわたる場合は、常に文のボディの周りに波括弧を使用します。
文の開始位置を基準にして、条件の各後続行を4つのスペースでインデントします。
条件の閉じ括弧を開始波括弧と一緒に個別の行に配置します:

```kotlin
if (!component.isSyncing &&
    !hasAnyKotlinRuntimeInScope(module)
) {
    return createKotlinNotConfiguredPanel(module)
}
```

これにより、条件と文のボディを揃えやすくなります。

`else`、`catch`、`finally` キーワード、および `do-while` ループの `while` キーワードは、直前の波括弧と同じ行に配置します:

```kotlin
if (condition) {
    // body
} else {
    // else part
}

try {
    // body
} finally {
    // cleanup
}
```

`when` 文において、分岐が単一行を超える場合は、隣接する case ブロックと空行で区切ることを検討してください:

```kotlin
private fun parsePropertyValue(propName: String, token: Token) {
    when (token) {
        is Token.ValueToken ->
            callback.visitValue(propName, token.value)

        Token.LBRACE -> { // ...
        }
    }
}
```

短い分岐は、波括弧なしで条件と同じ行に配置します。

```kotlin
when (foo) {
    true -> bar() // 良い例
    false -> { baz() } // 悪い例
}
```

### メソッド呼び出し {id="method-calls"}

長い引数リストでは、開き括弧の後に改行を入れます。引数は4つのスペースでインデントします。
密接に関連する複数の引数は同じ行にグループ化します。

```kotlin
drawSquare(
    x = 10, y = 10,
    width = 100, height = 100,
    fill = true
)
```

引数名と値を区切る `=` 記号の前後にはスペースを置きます。

### メソッドチェーン呼び出しの折り返し {id="wrap-chained-calls"}

チェーン呼び出し（chained calls）を折り返すときは、`.` 文字または `?.` 演算子を次の行に配置し、1段階インデントします:

```kotlin
val anchor = owner
    ?.firstChild!!
    .siblings(forward = true)
    .dropWhile { it is PsiComment || it is PsiWhiteSpace }
```

チェーンの最初の呼び出しの前には通常改行を入れるべきですが、その方がコードの意味が通りやすい場合は省略しても構いません。

### ラムダ {id="lambdas"}

ラムダ式では、波括弧の前後、およびパラメータとボディを区切る矢印の前後にスペースを使用する必要があります。呼び出しが単一のラムダを受け取る場合は、可能な限り括弧の外側に渡します。

```kotlin
list.filter { it > 10 }
```

ラムダにラベルを割り当てる場合は、ラベルと開き波括弧の間にスペースを置かないでください:

```kotlin
fun foo() {
    ints.forEach lit@{
        // ...
    }
}
```

複数行のラムダでパラメータ名を宣言する場合は、最初の行に名前を置き、その後に矢印と改行を配置します:

```kotlin
appendCommaSeparated(properties) { prop ->
    val propertyValue = prop.get(obj)  // ...
}
```

パラメータリストが長すぎて1行に収まらない場合は、矢印を個別の行に配置します:

```kotlin
foo {
    context: Context,
    environment: Env
    ->
    context.configureEnv(environment)
}
```

### 末尾のカンマ（Trailing commas） {id="trailing-commas"}

末尾のカンマとは、一連の要素の最後の項目の後にあるカンマ記号のことです:

```kotlin
class Person(
    val firstName: String,
    val lastName: String,
    val age: Int, // 末尾のカンマ
)
```

末尾のカンマを使用することには、いくつかの利点があります:

* 変更された値だけに焦点が当たるため、バージョン管理の差分（diff）が明確になります。
* 要素の追加や並べ替えが簡単になります。要素を操作する際にカンマを追加または削除する必要がありません。
* たとえばオブジェクト初期化子などのコード生成を簡素化します。最後の要素にもカンマを付けることができます。

末尾のカンマは完全にオプションであり、それらがなくてもコードは正常に動作します。Kotlin スタイルガイドでは、宣言側での末尾のカンマの使用を推奨しており、呼び出し側での使用は各自の裁量に委ねています。

IntelliJ IDEA のフォーマッタで末尾のカンマを有効にするには、**Settings/Preferences | Editor | Code Style | Kotlin** に移動し、**Other** タブを開いて **Use trailing comma** オプションを選択します。

#### 列挙型（Enum） {initial-collapse-state="collapsed" collapsible="true" id="enumerations"}

```kotlin
enum class Direction {
    NORTH,
    SOUTH,
    WEST,
    EAST, // 末尾のカンマ
}
```

#### 値引数 {initial-collapse-state="collapsed" collapsible="true" id="value-arguments"}

```kotlin
fun shift(x: Int, y: Int) { /*...*/ }
shift(
    25,
    20, // 末尾のカンマ
)
val colors = listOf(
    "red",
    "green",
    "blue", // 末尾のカンマ
)
```

#### クラスプロパティとパラメータ {initial-collapse-state="collapsed" collapsible="true" id="class-properties-and-parameters"}

```kotlin
class Customer(
    val name: String,
    val lastName: String, // 末尾のカンマ
)
class Customer(
    val name: String,
    lastName: String, // 末尾のカンマ
)
```

#### 関数の値パラメータ {initial-collapse-state="collapsed" collapsible="true" id="function-value-parameters"}

```kotlin
fun powerOf(
    number: Int, 
    exponent: Int, // 末尾のカンマ
) { /*...*/ }
constructor(
    x: Comparable<Number>,
    y: Iterable<Number>, // 末尾のカンマ
) {}
fun print(
    vararg quantity: Int,
    description: String, // 末尾のカンマ
) {}
```

#### オプションの型を持つパラメータ（セッターを含む） {initial-collapse-state="collapsed" collapsible="true" id="parameters-with-optional-type-including-setters"}

```kotlin
val sum: (Int, Int, Int) -> Int = fun(
    x,
    y,
    z, // 末尾のカンマ
): Int {
    return x + y + x
}
println(sum(8, 8, 8))
```

#### インデックス付けサフィックス {initial-collapse-state="collapsed" collapsible="true" id="indexing-suffix"}

```kotlin
class Surface {
    operator fun get(x: Int, y: Int) = 2 * x + 4 * y - 10
}
fun getZValue(mySurface: Surface, xValue: Int, yValue: Int) =
    mySurface[
        xValue,
        yValue, // 末尾のカンマ
    ]
```

#### ラムダ内のパラメータ {initial-collapse-state="collapsed" collapsible="true" id="parameters-in-lambdas"}

```kotlin
fun main() {
    val x = {
            x: Comparable<Number>,
            y: Iterable<Number>, // 末尾のカンマ
        ->
        println("1")
    }
    println(x)
}
```

#### when エントリ {initial-collapse-state="collapsed" collapsible="true" id="when-entry"}

```kotlin
fun isReferenceApplicable(myReference: KClass<*>) = when (myReference) {
    Comparable::class,
    Iterable::class,
    String::class, // 末尾のカンマ
        -> true
    else -> false
}
```

#### コレクションリテラル（アノテーション内） {initial-collapse-state="collapsed" collapsible="true" id="collection-literals-in-annotations"}

```kotlin
annotation class ApplicableFor(val services: Array<String>)
@ApplicableFor([
    "serializer",
    "balancer",
    "database",
    "inMemoryCache", // 末尾のカンマ
])
fun run() {}
```

#### 型引数 {initial-collapse-state="collapsed" collapsible="true" id="type-arguments"}

```kotlin
fun <T1, T2> foo() {}
fun main() {
    foo<
            Comparable<Number>,
            Iterable<Number>, // 末尾のカンマ
            >()
}
```

#### 型パラメータ {initial-collapse-state="collapsed" collapsible="true" id="type-parameters"}

```kotlin
class MyMap<
        MyKey,
        MyValue, // 末尾のカンマ
        > {}
```

#### 分解宣言 {initial-collapse-state="collapsed" collapsible="true" id="destructuring-declarations"}

```kotlin
data class Car(val manufacturer: String, val model: String, val year: Int)
val myCar = Car("Tesla", "Y", 2019)
val (
    manufacturer,
    model,
    year, // 末尾のカンマ
) = myCar
val cars = listOf<Car>()
fun printMeanValue() {
    var meanValue: Int = 0
    for ((
        _,
        _,
        year, // 末尾のカンマ
    ) in cars) {
        meanValue += year
    }
    println(meanValue/cars.size)
}
printMeanValue()
```

## ドキュメントコメント {id="documentation-comments"}

長めのドキュメントコメントでは、開始の `/**` を個別の行に配置し、その後の各行をアスタリスクで始めます:

```kotlin
/**
 * This is a documentation comment
 * on multiple lines.
 */
```

短いコメントは1行に配置できます:

```kotlin
/** This is a short documentation comment. */
```

通常、`@param` タグや `@return` タグの使用は避けてください。代わりに、パラメータや戻り値の説明をドキュメントコメントに直接組み込み、パラメータが言及されている場所にはリンクを追加します。`@param` や `@return` は、本文の流れに収まらない長い説明が必要な場合にのみ使用してください。

```kotlin
// これは避けてください:

/**
 * Returns the absolute value of the given number.
 * @param number The number to return the absolute value for.
 * @return The absolute value.
 */
fun abs(number: Int): Int { /*...*/ }

// 代わりにこのようにしてください:

/**
 * Returns the absolute value of the given [number].
 */
fun abs(number: Int): Int { /*...*/ }
```

## 冗長な構文構造の回避 {id="avoid-redundant-constructs"}

一般的に、Kotlin の特定の構文構造がオプションであり、IDE によって冗長としてハイライトされる場合は、コード内でそれを省略すべきです。単に「明確にするため」だけに、不要な構文要素をコードに残さないでください。

### Unit 戻り値の型 {id="unit-return-type"}

関数が Unit を返す場合、戻り値の型は省略する必要があります:

```kotlin
fun foo() { // ここでは ": Unit" が省略されている

}
```

### セミコロン {id="semicolons"}

可能な限りセミコロンは省略してください。

### 文字列テンプレート {id="string-templates"}

文字列テンプレートに単純な変数を挿入する場合は、波括弧を使用しないでください。波括弧は、より長い式に対してのみ使用してください:

```kotlin
println("$name has ${children.size} children")
```

ドル記号文字 `$` を文字列リテラルとして扱うには、[複数ドル文字列補間（Multi-dollar string interpolation）](strings.md#multi-dollar-string-interpolation)を使用します:

```kotlin
val KClass<*>.jsonSchema : String
    get() = $$"""
        {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "$id": "https://example.com/product.schema.json",
            "$dynamicAnchor": "meta",
            "title": "$${simpleName ?: qualifiedName ?: "unknown"}",
            "type": "object"
        }
        """
```

## 言語機能の慣用的な使用法 {id="idiomatic-use-of-language-features"}

### 不変性（Immutability） {id="immutability"}

可変データよりも不変データを使用することを推奨します。ローカル変数やプロパティが初期化後に変更されない場合は、常に `var` ではなく `val` として宣言してください。

変更されないコレクションを宣言する場合は、常に不変コレクションインターフェース（`Collection`、`List`、`Set`、`Map`）を使用してください。ファクトリ関数を使用してコレクションインスタンスを作成する場合は、可能な限り不変コレクション型を返す関数を常に使用してください:

```kotlin
// 悪い例: 変更されない値に対して可変コレクション型を使用している
fun validateValue(actualValue: String, allowedValues: HashSet<String>) { ... }

// 良い例: 代わりに不変コレクション型を使用している
fun validateValue(actualValue: String, allowedValues: Set<String>) { ... }

// 悪い例: arrayListOf() は可変コレクション型である ArrayList<T> を返す
val allowedValues = arrayListOf("a", "b", "c")

// 良い例: listOf() は List<T> を返す
val allowedValues = listOf("a", "b", "c")
```

### デフォルト引数値 {id="default-parameter-values"}

オーバーロードされた関数を宣言するよりも、デフォルト引数値を持つ関数を宣言することを推奨します。

```kotlin
// 悪い例
fun foo() = foo("a")
fun foo(a: String) { /*...*/ }

// 良い例
fun foo(a: String = "a") { /*...*/ }
```

### 型エイリアス {id="type-aliases"}

コードベース内で複数回使用される関数型や型パラメータを持つ型がある場合は、それに対する型エイリアスを定義することを推奨します:

```kotlin
typealias MouseClickHandler = (Any, MouseEvent) -> Unit
typealias PersonIndex = Map<String, Person>
```
名前の衝突を避けるために private または internal な型エイリアスを使用する場合は、[パッケージとインポート](packages.md)で言及されている `import ... as ...` を優先してください。

### ラムダのパラメータ {id="lambda-parameters"}

短くネストされていないラムダでは、パラメータを明示的に宣言する代わりに `it` の慣例を使用することが推奨されます。パラメータを持つネストされたラムダでは、常にパラメータを明示的に宣言してください。

### ラムダでの return {id="returns-in-a-lambda"}

ラムダで複数のラベル付き return を使用することは避けてください。単一の脱出ポイントを持つようにラムダを再構成することを検討してください。
それが不可能であるか十分に明確でない場合は、ラムダを匿名関数に変換することを検討してください。

ラムダの最後の文にはラベル付き return を使用しないでください。

### 名前付き引数 {id="named-arguments"}

メソッドが同じプリミティブ型の複数のパラメータを受け取る場合、または文脈からすべてのパラメータの意味が完全に明確でない限り `Boolean` 型のパラメータに対しては、名前付き引数構文を使用してください。

```kotlin
drawSquare(x = 10, y = 10, width = 100, height = 100, fill = true)
```

### 条件文 {id="conditional-statements"}

`try`、`if`、`when` の式形式を使用することを推奨します。

```kotlin
return if (x) foo() else bar()
```

```kotlin
return when(x) {
    0 -> "zero"
    else -> "nonzero"
}
```

上記は以下よりも好ましいです:

```kotlin
if (x)
    return foo()
else
    return bar()
```

```kotlin
when(x) {
    0 -> return "zero"
    else -> return "nonzero"
}
```

### if 対 when {id="if-versus-when"}

二者択一の条件には、`when` の代わりに `if` を使用することを推奨します。
たとえば、`when` による以下の構文ではなく:

```kotlin
when (x) {
    null -> // ...
    else -> // ...
}
```

`if` によるこちらの構文を使用します:

```kotlin
if (x == null) ... else ...
```

選択肢が3つ以上ある場合は、`when` を使用することを推奨します。

### when 式でのガード条件 {id="guard-conditions-in-when-expression"}

[ガード条件](control-flow.md#guard-conditions-in-when-expressions)を持つ `when` 式または文で複数のブール式を組み合わせる場合は、括弧を使用します:

```kotlin
when (status) {
    is Status.Ok if (status.info.isEmpty() || status.info.id == null) -> "no information"
}
```

以下のように書くことは避けてください:

```kotlin
when (status) {
    is Status.Ok if status.info.isEmpty() || status.info.id == null -> "no information"
}
```

### 条件における null 許容 Boolean 値 {id="nullable-boolean-values-in-conditions"}

条件文で null 許容の `Boolean` を使用する必要がある場合は、`if (value == true)` または `if (value == false)` によるチェックを使用してください。

### ループ {id="loops"}

ループよりも高階関数（`filter`、`map` など）を使用することを推奨します。例外: `forEach`（`forEach` のレシーバが null 許容であるか、`forEach` がより長い呼び出しチェーンの一部として使用されている場合を除き、通常の `for` ループの使用を推奨します）。

複数の高階関数を使用した複雑な式とループのどちらかを選択する場合は、それぞれの場合に実行される操作のコストを理解し、パフォーマンスへの配慮を念頭に置いてください。

### 範囲（Range）に対するループ {id="loops-on-ranges"}

排他的な上限を持つ範囲に対してループするには、`..<` 演算子を使用します:

```kotlin
for (i in 0..n - 1) { /*...*/ }  // 悪い例
for (i in 0..<n) { /*...*/ }  // 良い例
```

### 文字列 {id="strings"}

文字列の連結よりも文字列テンプレートを推奨します。

通常の文字列リテラルに `\n` エスケープシーケンスを埋め込むよりも、複数行文字列を推奨します。

複数行文字列でインデントを維持するには、結果の文字列に内部的なインデントが必要ない場合は `trimIndent` を使用し、内部的なインデントが必要な場合は `trimMargin` を使用します:

```kotlin
fun main() {
//sampleStart
    println("""
     Not
     trimmed
     text
     """
    )

    println("""
     Trimmed
     text
     """.trimIndent()
    )

    println()

    val a = """Trimmed to margin text:
            |if(a > 1) {
            |    return a
            |}""".trimMargin()

   println(a)
//sampleEnd
}
```
{kotlin-runnable="true"}

[Java と Kotlin の複数行文字列](java-to-kotlin-idioms-strings.md#use-multiline-strings)の違いについても学んでください。

### 関数 vs プロパティ {id="functions-vs-properties"}

一部のシナリオでは、引数のない関数と読み取り専用プロパティが互換可能な場合があります。
セマンティクスは似ていますが、どちらを優先すべきかについてのスタイル上の規約がいくつかあります。

背後にあるアルゴリズムが以下を満たす場合は、関数よりもプロパティを優先してください:

* 例外をスローしない。
* 計算コストが低い（または初回実行時にキャッシュされる）。
* オブジェクトの状態が変更されていない場合、何回呼び出しても同じ結果を返す。

### 拡張関数 {id="extension-functions"}

拡張関数は自由に使用してください。あるオブジェクトを主に対象として動作する関数がある場合は常に、そのオブジェクトをレシーバとして受け取る拡張関数にすることを検討してください。API の汚染を最小限に抑えるために、拡張関数の可視性は意味のある範囲でできる限り制限してください。必要に応じて、ローカル拡張関数、メンバー拡張関数、または private な可視性を持つトップレベル拡張関数を使用します。

### 中置関数（Infix functions） {id="infix-functions"}

関数が同様の役割を果たす2つのオブジェクトに対して動作する場合にのみ、その関数を `infix` として宣言してください。良い例: `and`、`to`、`zip`。
悪い例: `add`。

レシーバオブジェクトを変更（mutate）する場合は、メソッドを `infix` として宣言しないでください。

### ファクトリ関数 {id="factory-functions"}

あるクラスのファクトリ関数を宣言する場合、そのクラス自体と同じ名前を付けることは避けてください。ファクトリ関数の動作が特別である理由を明確にする別個の名前を使用することを推奨します。特別なセマンティクスが本当に存在しない場合にのみ、クラスと同じ名前を使用できます。

```kotlin
class Point(val x: Double, val y: Double) {
    companion object {
        fun fromPolar(angle: Double, radius: Double) = Point(...)
    }
}
```

異なるスーパークラスのコンストラクタを呼び出しておらず、デフォルト値を持つパラメータを含む単一のコンストラクタに統合できない、複数のオーバーロードされたコンストラクタを持つオブジェクトがある場合は、それらのオーバーロードされたコンストラクタをファクトリ関数に置き換えることを推奨します。

### プラットフォーム型 {id="platform-types"}

プラットフォーム型の式を返すパブリックな関数/メソッドは、その Kotlin の型を明示的に宣言しなければなりません:

```kotlin
fun apiCall(): String = MyJavaApi.getProperty("name")
```

プラットフォーム型の式で初期化されるプロパティ（パッケージレベルまたはクラスレベル）は、その Kotlin の型を明示的に宣言しなければなりません:

```kotlin
class Person {
    val name: String = MyJavaApi.getProperty("name")
}
```

プラットフォーム型の式で初期化されるローカル変数は、型宣言を持っても持たなくても構いません:

```kotlin
fun main() {
    val name = MyJavaApi.getProperty("name")
    println(name)
}
```

### スコープ関数 apply/with/run/also/let {id="scope-functions-apply-with-run-also-let"}

Kotlin は、指定されたオブジェクトのコンテキスト内でコードブロックを実行するための一連の関数を提供しています: `let`、`run`、`with`、`apply`、`also`。
ケースに応じた適切なスコープ関数の選択に関するガイダンスについては、[スコープ関数](scope-functions.md)を参照してください。

## ライブラリのコーディング規約 {id="coding-conventions-for-libraries"}

ライブラリを作成する際には、API の安定性を確保するために追加の一連のルールに従うことが推奨されます:

 * メンバーの可視性は常に明示的に指定してください（意図せず宣言をパブリック API として公開してしまうのを防ぐため）。
 * 関数の戻り値の型およびプロパティの型は常に明示的に指定してください（実装が変更されたときに意図せず戻り値の型が変わってしまうのを防ぐため）。
 * 新しいドキュメントを必要としないオーバーライドを除き、すべてのパブリックメンバーに [KDoc](kotlin-doc.md) コメントを提供してください（ライブラリのドキュメント生成をサポートするため）。

ライブラリ向けの API を作成する際に考慮すべきベストプラクティスやアイデアの詳細については、[ライブラリ作成者のためのガイドライン](api-guidelines-introduction.md)を参照してください。