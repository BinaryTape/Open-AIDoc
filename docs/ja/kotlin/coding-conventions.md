[//]: # (title: コーディング規則)

広く知られ、従いやすいコーディング規則は、あらゆるプログラミング言語にとって不可欠です。
ここでは、Kotlinを使用するプロジェクトのための、コードスタイルとコード構成に関するガイドラインを提供します。

## IDEでのスタイル設定

Kotlinで最も人気のある2つのIDEである[IntelliJ IDEA](https://www.jetbrains.com/idea/)と[Android Studio](https://developer.android.com/studio/)は、コードスタイリングのための強力なサポートを提供しています。これらのIDEを構成して、指定されたコードスタイルに従ってコードを自動的にフォーマットするように設定できます。

### スタイルガイドを適用する

1. **Settings/Preferences | Editor | Code Style | Kotlin** に移動します。
2. **Set from...** をクリックします。
3. **Kotlin style guide** を選択します。

### コードがスタイルガイドに従っているか確認する

1. **Settings/Preferences | Editor | Inspections | General** に移動します。
2. **Incorrect formatting** インスペクションをオンにします。
スタイルガイドに記載されているその他の問題（命名規則など）を検証する追加のインスペクションは、デフォルトで有効になっています。

<!-- Replace with an external link when the guide is moved -->

詳細については、[Migrate to Kotlin code style with IntelliJ IDEA](code-style-migration-guide.md) ガイドを参照してください。

## ソースコードの構成

### ディレクトリ構造

純粋なKotlinプロジェクトでは、推奨されるディレクトリ構造は、共通のルートパッケージを省略したパッケージ構造に従います。例えば、プロジェクト内のすべてのコードが `org.example.kotlin` パッケージとそのサブパッケージにある場合、`org.example.kotlin` パッケージのファイルはソースルートの直下に配置し、`org.example.kotlin.network.socket` のファイルはソースルートの `network/socket` サブディレクトリに配置する必要があります。

> JVMの場合: KotlinがJavaと一緒に使用されるプロジェクトでは、KotlinのソースファイルはJavaのソースファイルと同じソースルートに配置し、同じディレクトリ構造に従う必要があります。つまり、各ファイルはそれぞれのパッケージ宣言に対応するディレクトリに保存される必要があります。
>
{style="note"}

### ソースファイル名

Kotlinファイルに単一のクラスまたはインターフェース（および関連するトップレベル宣言）が含まれている場合、その名前はクラス名と同じにし、拡張子 `.kt` を付けます。これはすべての種類のクラスとインターフェースに適用されます。
ファイルに複数のクラスが含まれている場合、またはトップレベル宣言のみが含まれている場合は、ファイルの内容を説明する名前を選択し、それに応じてファイルに名前を付けます。
各単語の最初の文字を大文字にする[アッパーキャメルケース](https://en.wikipedia.org/wiki/Camel_case)（Upper Camel Case）を使用してください。
例えば、 `ProcessDeclarations.kt` のようになります。

ファイル名は、そのファイル内のコードが何をするかを説明するものである必要があります。したがって、ファイル名に `Util` のような意味のない単語を使用することは避けてください。

#### マルチプラットフォームプロジェクト

マルチプラットフォームプロジェクトでは、プラットフォーム固有のソースセットにあるトップレベル宣言を持つファイルには、ソースセットの名前に関連付けられたサフィックスを付ける必要があります。例えば：

* **jvm**Main/kotlin/Platform.**jvm**.kt
* **android**Main/kotlin/Platform.**android**.kt
* **ios**Main/kotlin/Platform.**ios**.kt

共通（common）ソースセットについては、トップレベル宣言を持つファイルにサフィックスを付けてはいけません。例えば、 `commonMain/kotlin/Platform.kt` です。

##### 技術的な詳細 {initial-collapse-state="collapsed" collapsible="true"}

JVMの制限により、マルチプラットフォームプロジェクトではこのファイル命名スキームに従うことをお勧めします。JVMはトップレベルのメンバー（関数、プロパティ）を許可していません。

これを回避するために、Kotlin JVMコンパイラはトップレベルメンバーの宣言を含むラッパークラス（いわゆる「ファイルファサード」）を作成します。ファイルファサードには、ファイル名から派生した内部名が付けられます。

一方で、JVMは同じ完全修飾名（FQN）を持つ複数のクラスを許可しません。これにより、KotlinプロジェクトがJVM向けにコンパイルできない状況が発生する可能性があります。

```none
root
|- commonMain/kotlin/myPackage/Platform.kt // 'fun count() { }' を含む
|- jvmMain/kotlin/myPackage/Platform.kt // 'fun multiply() { }' を含む
```

ここで、両方の `Platform.kt` ファイルが同じパッケージ内にあるため、Kotlin JVMコンパイラは2つのファイルファサードを生成し、どちらもFQNが `myPackage.PlatformKt` になります。これにより「Duplicate JVM classes（重複したJVMクラス）」エラーが発生します。

これを回避する最も簡単な方法は、上記のガイドラインに従ってファイルの一方の名前を変更することです。この命名スキームは、コードの可読性を維持しながら衝突を回避するのに役立ちます。

> これらの推奨事項が冗長に思えるシナリオが2つありますが、それでも従うことをお勧めします。
> 
> * 非JVMプラットフォームには、ファイルファサードの重複に関する問題はありません。ただし、この命名スキームはファイル命名の一貫性を保つのに役立ちます。
> * JVMでは、ソースファイルにトップレベル宣言がない場合、ファイルファサードは生成されないため、命名の衝突に直面することはありません。
> 
>   しかし、この命名スキームを使用することで、単純なリファクタリングや追加によってトップレベル関数が含まれるようになり、同じ「Duplicate JVM classes」エラーが発生するという状況を避けることができます。
> 
{style="tip"}

### ソースファイルの構成

複数の宣言（クラス、トップレベル関数、またはプロパティ）を同じKotlinソースファイルに配置することは、それらの宣言が意味的に互いに密接に関連しており、ファイルサイズが妥当な範囲（数百行を超えない程度）であれば推奨されます。

特に、あるクラスのすべてのクライアントに関連する拡張関数を定義する場合は、そのクラス自体と同じファイルに配置してください。特定のクライアントに対してのみ意味をなす拡張関数を定義する場合は、そのクライアントのコードの隣に配置してください。あるクラスのすべての拡張を保持するためだけのファイルを作成することは避けてください。

### クラスのレイアウト

クラスの内容は、次の順序で配置する必要があります。

1. プロパティ宣言と初期化ブロック
2. 二次コンストラクタ
3. メソッド宣言
4. コンパニオンオブジェクト

メソッド宣言をアルファベット順や可視性順に並べ替えないでください。また、通常のメソッドと拡張メソッドを分離しないでください。代わりに、関連するものをまとめて配置し、クラスを上から下に読む人が何が起きているかのロジックを追えるようにします。（高レベルなものを先に置くか、その逆か）順序を選択し、それに固執してください。

ネストされたクラスは、それらのクラスを使用するコードの隣に配置します。クラスが外部で使用されることを意図しており、クラス内で参照されていない場合は、コンパニオンオブジェクトの後の最後に配置します。

### インターフェース実装のレイアウト

インターフェースを実装する場合、実装するメンバーをインターフェースのメンバーと同じ順序に保ちます（必要に応じて、実装に使用される追加のプライベートメソッドを間に挟みます）。

### オーバーロードのレイアウト

クラス内では常にオーバーロードを隣同士に配置してください。

## 命名規則

Kotlinにおけるパッケージとクラスの命名規則は非常に単純です。

* パッケージの名前は常に小文字で、アンダースコアを使用しません（`org.example.project`）。複数の単語からなる名前の使用は一般的に推奨されませんが、複数の単語を使用する必要がある場合は、単にそれらを連結するか、キャメルケースを使用します（`org.example.myProject`）。

* クラスとオブジェクトの名前はアッパーキャメルケースを使用します。

```kotlin
open class DeclarationProcessor { /*...*/ }

object EmptyDeclarationProcessor : DeclarationProcessor() { /*...*/ }
```

### 関数名
 
関数、プロパティ、ローカル変数の名前は小文字で始まり、アンダースコアなしのキャメルケースを使用します。

```kotlin
fun processDeclarations() { /*...*/ }
var declarationCount = 1
```

例外：クラスのインスタンスを作成するために使用されるファクトリ関数は、抽象的な戻り値の型と同じ名前にすることができます。

```kotlin
interface Foo { /*...*/ }

class FooImpl : Foo { /*...*/ }

fun Foo(): Foo { return FooImpl() }
```

### テストメソッドの名前

テストにおいてのみ（**のみ**）、バッククォートで囲まれたスペースを含むメソッド名を使用できます。なお、このようなメソッド名はAndroidランタイムではAPIレベル30からのみサポートされています。テストコードでは、メソッド名にアンダースコアを使用することも許可されています。

```kotlin
class MyTestCase {
    @Test fun `ensure everything works`() { /*...*/ }

    @Test fun ensureEverythingWorks_onAndroid() { /*...*/ }
}
```

### プロパティ名

定数（`const` でマークされたプロパティ、またはカスタム `get` 関数を持たず、深く不変なデータを保持するトップレベルまたはオブジェクトの `val` プロパティ）の名前は、[スクリーミングスネークケース](https://en.wikipedia.org/wiki/Snake_case)（すべて大文字、アンダースコア区切り）を使用する必要があります。

```kotlin
const val MAX_COUNT = 8
val USER_NAME_FIELD = "UserName"
```

振る舞いを持つオブジェクトや可変データを保持するトップレベルまたはオブジェクトのプロパティの名前は、キャメルケースを使用する必要があります。

```kotlin
val mutableCollection: MutableSet<String> = HashSet()
```

シングルトンオブジェクトへの参照を保持するプロパティの名前は、`object` 宣言と同じ命名スタイルを使用できます。

```kotlin
val PersonComparator: Comparator<Person> = /*...*/
```

列挙型の定数（enum constants）については、使用状況に応じて、すべて大文字のアンダースコア区切り（[スクリーミングスネークケース](https://en.wikipedia.org/wiki/Snake_case)）の名前（`enum class Color { RED, GREEN }`）か、アッパーキャメルケースの名前のどちらを使用しても構いません。
   
### バッキングプロパティの名前

概念的には同じであるが、一方がパブリックAPIの一部であり、もう一方が実装の詳細である2つのプロパティをクラスが持つ場合、プライベートプロパティの名前の接頭辞としてアンダースコアを使用します。

```kotlin
class C {
    private val _elementList = mutableListOf<Element>()

    val elementList: List<Element>
        get() = _elementList
}
```

### 良い名前を選ぶ

クラスの名前は通常、そのクラスが何であるかを説明する名詞または名詞句にします： `List`、`PersonReader`。

メソッドの名前は通常、そのメソッドが何をするかを表す動詞または動詞句にします： `close`、`readPersons`。
また、名前はそのメソッドがオブジェクトを変更するのか、それとも新しいオブジェクトを返すのかを示唆する必要があります。例えば、 `sort` はコレクションをその場でソートし、 `sorted` はコレクションのソートされたコピーを返します。

名前はそのエンティティの目的を明確にする必要があるため、名前の中に意味のない単語（`Manager`、`Wrapper`）を使用することは避けるのが最善です。

頭字語（アクロニム）を宣言名の一部として使用する場合は、次の規則に従ってください：

* 2文字の頭字語の場合は、両方の文字を大文字にします。例： `IOStream`。
* 2文字より長い頭字語の場合は、最初の文字のみを大文字にします。例： `XmlFormatter` や `HttpInputStream`。

## フォーマット

### インデント

インデントには4つのスペースを使用します。タブは使用しないでください。

波括弧については、開き括弧を開始行の末尾に置き、閉じ括弧は開始構造と垂直方向に揃えて別の行に置きます。

```kotlin
if (elements != null) {
    for (element in elements) {
        // ...
    }
}
```

> Kotlinではセミコロンはオプションであるため、改行は重要な意味を持ちます。言語設計はJavaスタイルの波括弧を前提としており、異なるフォーマットスタイルを使用しようとすると驚くような挙動に遭遇する可能性があります。
>
{style="note"}

### 水平方向の空白

* 二項演算子の前後にはスペースを入れます（`a + b`）。例外：レンジ演算子（`0..i`）の前後にはスペースを入れないでください。
* 単項演算子の前後にはスペースを入れません（`a++`）。
* 制御フローのキーワード（`if`、`when`、`for`、`while`）と対応する開き括弧の間にはスペースを入れます。
* プライマリコンストラクタ宣言、メソッド宣言、またはメソッド呼び出しの開き括弧の前にはスペースを入れません。

```kotlin
class A(val x: Int)

fun foo(x: Int) { ... }

fun bar() {
    foo(1)
}
```

* `(`、`[` の後、または `]`、`)` の前にスペースを入れないでください。
* `.` や `?.` の前後にスペースを入れないでください： `foo.bar().filter { it > 2 }.joinToString()`、`foo?.bar()`。
* `//` の後にスペースを入れます： `// これはコメントです`。
* 型パラメータを指定するために使用される山括弧の前後にはスペースを入れないでください： `class Map<K, V> { ... }`。
* `::` の前後にはスペースを入れないでください： `Foo::class`、`String::length`。
* ヌル許容型（nullable type）を示すために使用される `?` の前にスペースを入れないでください： `String?`。

一般的な規則として、いかなる種類の水平方向の配置（整列）も避けてください。識別子の名前を異なる長さの名前に変更しても、宣言や使用箇所のフォーマットに影響を与えないようにする必要があります。

### コロン

次の場合には、`:` の前にスペースを入れます。

* 型とスーパータイプを区切るために使用される場合。
* スーパークラスのコンストラクタや同じクラスの別のコンストラクタに委譲する場合。
* `object` キーワードの後。
    
宣言とその型を区切る場合には、`:` の前にスペースを入れないでください。
 
`:` の後には常にスペースを入れます。

```kotlin
abstract class Foo<out T : Any> : IFoo {
    abstract fun foo(a: Int): T
}

class FooImpl : Foo() {
    constructor(x: String) : this(x) { /*...*/ }

    val x = object : IFoo { /*...*/ } 
}
```

### クラスヘッダー

プライマリコンストラクタのパラメータが少ないクラスは、1行で書くことができます。

```kotlin
class Person(id: Int, name: String)
```

より長いヘッダーを持つクラスは、各プライマリコンストラクタのパラメータがインデントされて個別の行になるようにフォーマットする必要があります。また、閉じ括弧は新しい行に置く必要があります。継承を使用する場合、スーパークラスのコンストラクタ呼び出しや実装されたインターフェースのリストは、閉じ括弧と同じ行に配置する必要があります。

```kotlin
class Person(
    id: Int,
    name: String,
    surname: String
) : Human(id, name) { /*...*/ }
```

複数のインターフェースがある場合、スーパークラスのコンストラクタ呼び出しを最初に配置し、その後各インターフェースを異なる行に配置する必要があります。

```kotlin
class Person(
    id: Int,
    name: String,
    surname: String
) : Human(id, name),
    KotlinMaker { /*...*/ }
```

スーパータイプのリストが長いクラスの場合は、コロンの後に改行を入れ、すべてのスーパータイプ名を垂直方向に揃えます。

```kotlin
class MyFavouriteVeryLongClassHolder :
    MyLongHolder<MyFavouriteVeryLongClass>(),
    SomeOtherInterface,
    AndAnotherOne {

    fun foo() { /*...*/ }
}
```

クラスヘッダーが長い場合にクラスヘッダーとボディを明確に区切るには、クラスヘッダーの後に空行を入れるか（上記の例のように）、開き波括弧を別の行に置きます。

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

### 修飾子の順序

宣言に複数の修飾子がある場合は、常に次の順序で配置してください。

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
enum / annotation / fun // `fun interface` 内の修飾子として 
companion
inline / value
infix
operator
data
```

すべてのアノテーションを修飾子の前に置きます。

```kotlin
@Named("Foo")
private val foo: Foo
```

ライブラリを作成しているのでない限り、冗長な修飾子（例えば `public`）は省略してください。

### アノテーション

アノテーションは、それが付加される宣言の前の別の行に、同じインデントで配置します。

```kotlin
@Target(AnnotationTarget.PROPERTY)
annotation class JsonExclude
```

引数のないアノテーションは、同じ行に配置しても構いません。

```kotlin
@JsonExclude @JvmField
var x: String
```

引数のない単一のアノテーションは、対応する宣言と同じ行に配置できます。

```kotlin
@Test fun foo() { /*...*/ }
```

### ファイルアノテーション

ファイルアノテーションは、ファイルコメント（ある場合）の後、 `package` 文の前に配置し、 `package` とは空行で区切ります（パッケージではなくファイルを対象としていることを強調するため）。

```kotlin
/** License, copyright and whatever */
@file:JvmName("FooBar")

package foo.bar
```

### 関数

関数のシグネチャが1行に収まらない場合は、次の構文を使用してください。

```kotlin
fun longMethodName(
    argument: ArgumentType = defaultValue,
    argument2: AnotherArgumentType,
): ReturnType {
    // ボディ
}
```

関数のパラメータには通常のインデント（4つのスペース）を使用します。これにより、コンストラクタパラメータとの一貫性が保たれます。

ボディが単一の式で構成される関数の場合は、式本体（expression body）を使用することを好みます。

```kotlin
fun foo(): Int {     // 推奨されない
    return 1 
}

fun foo() = 1        // 推奨される
```

### 式本体

関数が式本体を持ち、その最初の行が宣言と同じ行に収まらない場合は、 `=` 記号を最初の行に置き、式本体を4つのスペースでインデントします。

```kotlin
fun f(x: String, y: String, z: String) =
    veryLongFunctionCallWithManyWords(andLongParametersToo(), x, y, z)
```

### プロパティ

非常に単純な読み取り専用プロパティの場合は、1行のフォーマットを検討してください。

```kotlin
val isEmpty: Boolean get() = size == 0
```

より複雑なプロパティの場合は、常に `get` と `set` キーワードを別の行に置きます。

```kotlin
val foo: String
    get() { /*...*/ }
```

初期化子（initializer）を持つプロパティで、その初期化子が長い場合は、 `=` 記号の後に改行を入れ、初期化子を4つのスペースでインデントします。

```kotlin
private val defaultCharset: Charset? =
    EncodingRegistry.getInstance().getDefaultCharsetForPropertiesFiles(file)
```

### 制御フロー文

`if` または `when` 文の条件が複数行にわたる場合は、常に文のボディを波括弧で囲みます。
条件の各後続行は、文の開始に対して4つのスペースでインデントします。
条件の閉じ括弧を、開き波括弧と一緒に別の行に置きます。

```kotlin
if (!component.isSyncing &&
    !hasAnyKotlinRuntimeInScope(module)
) {
    return createKotlinNotConfiguredPanel(module)
}
```

これにより、条件と文のボディを整列させやすくなります。

`else`、`catch`、`finally` キーワード、および `do-while` ループの `while` キーワードは、前の波括弧と同じ行に置きます。

```kotlin
if (condition) {
    // ボディ
} else {
    // else部分
}

try {
    // ボディ
} finally {
    // クリーンアップ
}
```

`when` 文において、分岐が1行を超える場合は、隣接するケースブロックと空行で区切ることを検討してください。

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

短い分岐は、波括弧なしで条件と同じ行に置きます。

```kotlin
when (foo) {
    true -> bar() // 推奨される
    false -> { baz() } // 推奨されない
}
```

### メソッド呼び出し

引数リストが長い場合は、開き括弧の後に改行を入れます。引数は4つのスペースでインデントします。
密接に関連する複数の引数は同じ行にまとめます。

```kotlin
drawSquare(
    x = 10, y = 10,
    width = 100, height = 100,
    fill = true
)
```

引数名と値を区切る `=` 記号の前後にはスペースを入れます。

### チェイン呼び出しのラッピング

チェイン呼び出し（連鎖呼び出し）をラッピングする場合、 `.` 文字または `?.` 演算子を次の行に置き、1段階インデントします。

```kotlin
val anchor = owner
    ?.firstChild!!
    .siblings(forward = true)
    .dropWhile { it is PsiComment || it is PsiWhiteSpace }
```

チェインの最初の呼び出しの前には通常、改行を入れるべきですが、その方がコードの意味が通りやすい場合は省略しても構いません。

### ラムダ

ラムダ式では、波括弧の前後、およびパラメータとボディを区切る矢印の前後にスペースを使用する必要があります。呼び出しが単一のラムダを受け取る場合は、可能な限り括弧の外側に渡します。

```kotlin
list.filter { it > 10 }
```

ラムダにラベルを割り当てる場合、ラベルと開き波括弧の間にスペースを入れないでください。

```kotlin
fun foo() {
    ints.forEach lit@{
        // ...
    }
}
```

複数行のラムダでパラメータ名を宣言する場合、名前を最初の行に置き、その後に矢印と改行を置きます。

```kotlin
appendCommaSeparated(properties) { prop ->
    val propertyValue = prop.get(obj)  // ...
}
```

パラメータリストが1行に収まらないほど長い場合は、矢印を別の行に置きます。

```kotlin
foo {
    context: Context,
    environment: Env
    ->
    context.configureEnv(environment)
}
```

### 末尾のカンマ

末尾のカンマ（trailing comma）とは、要素の羅列の最後の項目の後にあるカンマ記号のことです。

```kotlin
class Person(
    val firstName: String,
    val lastName: String,
    val age: Int, // 末尾のカンマ
)
```

末尾のカンマを使用することにはいくつかの利点があります。

* バージョン管理の差分（diff）がより明確になります。すべての注目が変更された値に向けられるためです。
* 要素の追加や並べ替えが簡単になります。要素を操作する際にカンマを追加したり削除したりする必要がありません。
* オブジェクトの初期化子などのコード生成を簡素化します。最後の要素にもカンマを付けることができるためです。

末尾のカンマは完全にオプションであり、なくてもコードは動作します。Kotlinスタイルガイドでは、宣言側での末尾のカンマの使用を推奨しており、呼び出し側で使用するかどうかは個人の裁量に任せています。

IntelliJ IDEAのフォーマッタで末尾のカンマを有効にするには、 **Settings/Preferences | Editor | Code Style | Kotlin** に移動し、 **Other** タブを開いて **Use trailing comma** オプションを選択してください。

#### 列挙型（Enumerations） {initial-collapse-state="collapsed" collapsible="true"}

```kotlin
enum class Direction {
    NORTH,
    SOUTH,
    WEST,
    EAST, // 末尾のカンマ
}
```

#### 値引数（Value arguments） {initial-collapse-state="collapsed" collapsible="true"}

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

#### クラスのプロパティとパラメータ {initial-collapse-state="collapsed" collapsible="true"}

```kotlin
class Customer(
    val name: String,
    val lastName: String, // 末尾のカンマ
)
class Customer(
    val name: String,
    lastName: String, // 末尾의カンマ
)
```

#### 関数の値パラメータ {initial-collapse-state="collapsed" collapsible="true"}

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

#### 型がオプションのパラメータ（セッターを含む） {initial-collapse-state="collapsed" collapsible="true"}

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

#### インデックスサフィックス {initial-collapse-state="collapsed" collapsible="true"}

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

#### ラムダ内のパラメータ {initial-collapse-state="collapsed" collapsible="true"}

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

#### whenのエントリ {initial-collapse-state="collapsed" collapsible="true"}

```kotlin
fun isReferenceApplicable(myReference: `KClass<*>`) = when (myReference) {
    Comparable::class,
    Iterable::class,
    String::class, // 末尾のカンマ
        -> true
    else -> false
}
```

#### コレクションリテラル（アノテーション内） {initial-collapse-state="collapsed" collapsible="true"}

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

#### 型引数（Type arguments） {initial-collapse-state="collapsed" collapsible="true"}

```kotlin
fun <T1, T2> foo() {}
fun main() {
    foo<
            Comparable<Number>,
            Iterable<Number>, // 末尾のカンマ
            >()
}
```

#### 型パラメータ（Type parameters） {initial-collapse-state="collapsed" collapsible="true"}

```kotlin
class MyMap<
        MyKey,
        MyValue, // 末尾のカンマ
        > {}
```

#### 分解宣言（Destructuring declarations） {initial-collapse-state="collapsed" collapsible="true"}

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

## ドキュメントコメント

長いドキュメントコメントの場合は、開始の `/**` を別の行に置き、その後の各行をアスタリスクで始めます。

```kotlin
/**
 * これは複数行にわたる
 * ドキュメントコメントです。
 */
```

短いコメントは1行に置くことができます。

```kotlin
/** これは短いドキュメントコメントです。 */
```

一般的に、 `@param` や `@return` タグの使用は避けてください。代わりに、パラメータや戻り値の説明をドキュメントコメントの中に直接組み込み、パラメータに言及するたびにリンクを追加してください。 `@param` や `@return` は、本文の流れに収まらない長い説明が必要な場合にのみ使用してください。

```kotlin
// 推奨されない例：

/**
 * 与えられた数値の絶対値を返します。
 * @param number 絶対値を返すための数値。
 * @return 絶対値。
 */
fun abs(number: Int): Int { /*...*/ }

// 推奨される例：

/**
 * 与えられた [number] の絶対値を返します。
 */
fun abs(number: Int): Int { /*...*/ }
```

## 冗長な構文を避ける

一般的に、Kotlinの特定の構文がオプションであり、IDEによって冗長（redundant）としてハイライトされている場合は、コードからそれを省略すべきです。「明確にするためだけ」に不要な構文要素をコードに残さないでください。

### Unit戻り値の型

関数が Unit を返す場合、戻り値の型は省略すべきです。

```kotlin
fun foo() { // ここでは ": Unit" が省略されている

}
```

### セミコロン

可能な限りセミコロンを省略してください。

### 文字列テンプレート

文字列テンプレートに単純な変数を挿入する場合、波括弧を使用しないでください。波括弧はより長い式にのみ使用してください。

```kotlin
println("$name has ${children.size} children")
```

ドル記号 `$` を文字列リテラルとして扱うには、[マルチドル文字列補間（multi-dollar string interpolation）](strings.md#multi-dollar-string-interpolation) を使用してください。

```kotlin
val `KClass<*>`.jsonSchema : String
    get() = $"""
        {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "$id": "https://example.com/product.schema.json",
            "$dynamicAnchor": "meta",
            "title": "${simpleName ?: qualifiedName ?: "unknown"}",
            "type": "object"
        }
        """
```

## 言語機能の慣用的な使用

### 不変性（Immutability）

可変データよりも不変データを使用することを好みます。ローカル変数やプロパティが初期化後に変更されない場合は、常に `var` ではなく `val` として宣言してください。

変更されないコレクションを宣言する場合は、常に不変なコレクションインターフェース（`Collection`、`List`、`Set`、`Map`）を使用してください。ファクトリ関数を使用してコレクションインスタンスを作成する場合、可能な限り不変なコレクション型を返す関数を常に使用してください。

```kotlin
// 悪い例：変更されない値に対して可変コレクション型を使用している
fun validateValue(actualValue: String, allowedValues: HashSet<String>) { ... }

// 良い例：代わりに不変コレクション型が使用されている
fun validateValue(actualValue: String, allowedValues: Set<String>) { ... }

// 悪い例：arrayListOf() は可変コレクション型である ArrayList<T> を返す
val allowedValues = arrayListOf("a", "b", "c")

// 良い例：listOf() は `List<T>` を返す
val allowedValues = listOf("a", "b", "c")
```

### デフォルトパラメータ値

オーバーロードされた関数を宣言するよりも、デフォルトパラメータ値を持つ関数を宣言することを好みます。

```kotlin
// 悪い例
fun foo() = foo("a")
fun foo(a: String) { /*...*/ }

// 良い例
fun foo(a: String = "a") { /*...*/ }
```

### 型エイリアス（Type aliases）

コードベースで複数回使用される関数型や型パラメータを持つ型がある場合は、それに対して型エイリアスを定義することを好みます。

```kotlin
typealias MouseClickHandler = (Any, MouseEvent) -> Unit
typealias PersonIndex = Map<String, Person>
```
名前の衝突を避けるためにプライベートまたは内部の型エイリアスを使用する場合は、[パッケージとインポート](packages.md)で言及されている `import ... as ...` を好みます。

### ラムダパラメータ

短く、ネストされていないラムダでは、パラメータを明示的に宣言する代わりに `it` 慣習を使用することが推奨されます。パラメータを持つネストされたラムダでは、常にパラメータを明示的に宣言してください。

### ラムダ内でのリターン

ラムダ内で複数のラベル付きリターンを使用することは避けてください。単一の出口点を持つようにラムダを再構成することを検討してください。それが不可能な場合や十分に明確でない場合は、ラムダを匿名関数に変換することを検討してください。

ラムダの最後の文にラベル付きリターンを使用しないでください。

### 名前付き引数

メソッドが同じ基本データ型（プリミティブ型）の複数のパラメータを取る場合、または `Boolean` 型のパラメータの場合、すべてのパラメータの意味が文脈から完全に明確でない限り、名前付き引数構文を使用してください。

```kotlin
drawSquare(x = 10, y = 10, width = 100, height = 100, fill = true)
```

### 条件文

`try`、`if`、`when` の式形式（expression form）を使用することを好みます。

```kotlin
return if (x) foo() else bar()
```

```kotlin
return when(x) {
    0 -> "zero"
    else -> "nonzero"
}
```

上記は、以下よりも好ましいです：

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

### if と when の使い分け

二値の条件には `when` ではなく `if` を使用することを好みます。
例えば、 `if` を使用して次のように書きます：

```kotlin
if (x == null) ... else ...
```

次のように `when` を使用する代わりに：

```kotlin
when (x) {
    null -> // ...
    else -> // ...
}
```

選択肢が3つ以上ある場合は、 `when` を使用することを好みます。

### when式におけるガード条件

`when` 式や文で [ガード条件](control-flow.md#guard-conditions-in-when-expressions) を使用し、複数の論理式を組み合わせる場合は、括弧を使用してください。

```kotlin
when (status) {
    is Status.Ok if (status.info.isEmpty() || status.info.id == null) -> "no information"
}
```

次のように書く代わりに：

```kotlin
when (status) {
    is Status.Ok if status.info.isEmpty() || status.info.id == null -> "no information"
}
```

### 条件文におけるヌル許容 Boolean 値

条件文でヌル許容な（nullable） `Boolean` を使用する必要がある場合は、 `if (value == true)` または `if (value == false)` によるチェックを使用してください。

### ループ

ループよりも高階関数（`filter`、`map` など）を使用することを好みます。例外： `forEach` （`forEach` のレシーバーがヌル許容である場合や、 `forEach` が長い呼び出しチェインの一部として使用されている場合を除き、通常の `for` ループを使用することを好みます）。

複数の高階関数を使用した複雑な式とループのどちらかを選択する場合、それぞれのケースで実行される操作のコストを理解し、パフォーマンスへの考慮を忘れないでください。

### レンジ（範囲）におけるループ

開いた範囲（open-ended range）でループするには、 `..<` 演算子を使用してください。

```kotlin
for (i in 0..n - 1) { /*...*/ }  // 悪い例
for (i in 0..<n) { /*...*/ }  // 良い例
```

### 文字列

文字列の連結よりも文字列テンプレートを好みます。

通常の文字列リテラルの中に `
` エスケープシーケンスを埋め込むよりも、複数行文字列を好みます。

複数行文字列でインデントを維持するには、結果の文字列に内部的なインデントが必要ない場合は `trimIndent` を使用し、内部的なインデントが必要な場合は `trimMargin` を使用してください。

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

[JavaとKotlinの複数行文字列の違い](java-to-kotlin-idioms-strings.md#use-multiline-strings)についても学んでください。

### 関数 vs プロパティ

いくつかのシナリオでは、引数のない関数と読み取り専用プロパティが交換可能である場合があります。意味は似ていますが、どちらを優先すべきかについてのスタイル上の慣習があります。

基礎となるアルゴリズムが以下の条件を満たす場合は、関数よりもプロパティを好みます。

* 例外をスローしない。
* 計算コストが低い（または初回実行時にキャッシュされる）。
* オブジェクトの状態が変わらなければ、呼び出しごとに同じ結果を返す。

### 拡張関数

拡張関数を積極的に使用してください。主にあるオブジェクトに対して動作する関数がある場合は、常にそのオブジェクトをレシーバーとして受け取る拡張関数にすることを検討してください。APIの汚染を最小限に抑えるために、拡張関数の可視性は妥当な範囲で制限してください。必要に応じて、ローカル拡張関数、メンバー拡張関数、またはプライベートな可視性を持つトップレベル拡張関数を使用してください。

### 中置関数（Infix functions）

同様の役割を果たす2つのオブジェクトに対して動作する場合にのみ、関数を `infix` として宣言してください。良い例： `and`、`to`、`zip`。悪い例： `add`。

レシーバーオブジェクトを変更するメソッドを `infix` として宣言しないでください。

### ファクトリ関数

クラスのためにファクトリ関数を宣言する場合、クラス自体と同じ名前を付けることは避けてください。ファクトリ関数の動作がなぜ特別なのかを明確にするために、別の名前を使用することを好みます。特別なセマンティクスが本当にない場合にのみ、クラスと同じ名前を使用できます。

```kotlin
class Point(val x: Double, val y: Double) {
    companion object {
        fun fromPolar(angle: Double, radius: Double) = Point(...)
    }
}
```

異なるスーパークラスのコンストラクタを呼び出さず、デフォルト値を持つパラメータを含む単一のコンストラクタに集約できない複数のオーバーロードされたコンストラクタを持つオブジェクトがある場合は、オーバーロードされたコンストラクタをファクトリ関数に置き換えることを好みます。

### プラットフォーム型

プラットフォーム型の式を返すパブリックな関数/メソッドは、Kotlinの型を明示的に宣言する必要があります。

```kotlin
fun apiCall(): String = MyJavaApi.getProperty("name")
```

プラットフォーム型の式で初期化されるプロパティ（パッケージレベルまたはクラスレベル）は、Kotlinの型を明示的に宣言する必要があります。

```kotlin
class Person {
    val name: String = MyJavaApi.getProperty("name")
}
```

プラットフォーム型の式で初期化されるローカル値は、型宣言を持っていても持っていなくても構いません。

```kotlin
fun main() {
    val name = MyJavaApi.getProperty("name")
    println(name)
}
```

### スコープ関数 apply/with/run/also/let

Kotlinは、特定のオブジェクトのコンテキストでコードブロックを実行するための関数セットを提供しています： `let`、`run`、`with`、`apply`、および `also`。
ケースに合わせた適切なスコープ関数の選択については、 [スコープ関数（Scope Functions）](scope-functions.md) を参照してください。

## ライブラリのコーディング規則

ライブラリを作成する際には、APIの安定性を確保するために、追加の一連の規則に従うことが推奨されます。

 * 常にメンバーの可視性を明示的に指定してください（誤って宣言をパブリックAPIとして公開することを避けるため）。
 * 常に関数の戻り値の型とプロパティの型を明示的に指定してください（実装が変更されたときに誤って戻り値の型が変更されるのを避けるため）。
 * 新しいドキュメントを必要としないオーバーライドを除き、すべてのパブリックメンバーに [KDoc](kotlin-doc.md) コメントを提供してください（ライブラリのドキュメント生成をサポートするため）。

ライブラリのAPIを設計する際に考慮すべきベストプラクティスやアイデアの詳細については、 [Library authors' guidelines](api-guidelines-introduction.md) を参照してください。