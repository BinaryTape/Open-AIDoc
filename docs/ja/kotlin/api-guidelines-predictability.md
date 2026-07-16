[//]: # (title: 予測可能性)

堅牢でユーザーフレンドリーなKotlinライブラリを設計するには、一般的なユースケースを想定し、拡張性を考慮し、適切な使用方法を強制することが不可欠です。
デフォルト設定、エラーハンドリング、および状態管理に関するベストプラクティスに従うことで、ライブラリの整合性と品質を維持しながら、ユーザーにシームレスな体験を提供できます。

## デフォルトで正しい動作をするようにする

ライブラリは、各ユースケースの「ハッピーパス（正常系）」を想定し、それに応じたデフォルト設定を提供する必要があります。
ユーザーがライブラリを正しく機能させるために、デフォルト値をわざわざ指定する必要があってはなりません。

例えば、[Ktor `HttpClient`](https://ktor.io/docs/client-create-new-application.html) を使用する場合、最も一般的なユースケースはサーバーへの GET リクエストの送信です。
これは、以下のコードのように、必須の情報のみを指定するだけで実現できます。

```kotlin
val client = HttpClient(CIO)
val response: HttpResponse = client.get("https://ktor.io/")
```

必須の HTTP ヘッダーや、レスポンスで返される可能性のあるステータスコードに対するカスタムイベントハンドラーの値を指定する必要はありません。

ユースケースに明らかな「ハッピーパス」がない場合や、パラメータにデフォルト値が必要なのに議論の余地のない選択肢がない場合は、要件分析に不備がある可能性が高いです。

## 拡張の機会を提供する

正しい選択を予測できない場合は、ユーザーが好みの方法を指定できるようにします。
また、ライブラリはユーザーが独自のアプローチを提供したり、サードパーティの拡張機能を使用したりできるようにすべきです。

例えば、[Ktor `HttpClient`](https://ktor.io/docs/client-serialization.html) では、クライアントの設定時にコンテントネゴシエーション（Content Negotiation）のサポートをインストールし、好みのシリアル化形式を指定することが推奨されています。

```kotlin
val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        json(Json {
            prettyPrint = true
            isLenient = true
        })
    }
}
```

ユーザーは、どのプラグインをインストールするかを選択したり、[クライアントプラグインを定義するための独立したAPI](https://ktor.io/docs/client-custom-plugins.html) を使用して独自のプラグインを作成したりできます。

さらに、ユーザーはライブラリ内の型に対して拡張関数やプロパティを定義できます。
ライブラリの作者として、[拡張を念頭に置いた設計](api-guidelines-readability.md#use-extension-functions-and-properties)を行い、ライブラリの型に明確なコアコンセプトを持たせることで、これを容易にすることができます。

## 不要または無効な拡張を防止する

ユーザーが、ライブラリの元の設計に違反する方法や、問題ドメインのルール上不可能な方法で拡張できないようにすべきです。

例えば、データを JSON 形式に、または JSON 形式からマーシャリングする場合、出力形式では `object`、`array`、`number`、`string`、`boolean`、`null` の 6 つの型のみがサポートされます。

もし `JsonElement` という名前のオープンクラスやインターフェースを作成すると、ユーザーは `JsonDate` のような無効な派生型を作成できてしまいます。
代わりに、`JsonElement` インターフェースを `sealed`（シールド）にし、各型に対して実装を提供することができます。

```kotlin
sealed interface JsonElement

class JsonNumber(val value: Number) : JsonElement
class JsonObject(val values: Map<String, JsonElement>) : JsonElement
class JsonArray(val values: List<JsonElement>) : JsonElement
class JsonBoolean(val value: Boolean) : JsonElement
class JsonString(val value: String) : JsonElement
object JsonNull : JsonElement
```

シールド型を使用すると、コンパイラが `when` 式が網羅的（exhaustive）であることを保証できるため、`else` ステートメントが不要になり、可読性と一貫性が向上します。

## 可変状態の露出を避ける

複数の値を管理する場合、API は可能な限り読み取り専用コレクションを受け取る、または返すべきです。
可変（mutable）なコレクションはスレッドセーフではなく、ライブラリに複雑さと予測不能さをもたらします。

例えば、API のエントリポイントから返された可変コレクションをユーザーが変更した場合、その実装の内部構造を直接変更しているのか、それとも単なるコピーを変更しているのかが不明確になります。
同様に、ユーザーがコレクションをライブラリに渡した後にその中の値を変更できる場合、それが内部実装に影響を与えるかどうかも不明確になります。

配列は可変コレクションであるため、API での使用は避けてください。
配列を使用せざるを得ない場合は、データをユーザーと共有する前に防御的コピー（defensive copy）を作成してください。これにより、データ構造が変更されないことが保証されます。

この防御的コピーを作成するポリシーは、`vararg` 引数に対してコンパイラによって自動的に実行されます。
`vararg` 引数が期待される場所にスプレッド演算子（`*`）を使用して既存の配列を渡すと、その配列のコピーが自動的に作成されます。

この動作を次の例に示します。

```kotlin
fun main() {
    fun demo(vararg input: String): `Array<out String>` = input

    val originalArray = arrayOf("one", "two", "three", "four")
    val newArray = demo(*originalArray)

    originalArray[1] = "ten"

    // "one, ten, three, four" を出力
    println(originalArray.joinToString())

    // "one, two, three, four" を出力
    println(newArray.joinToString())
}
```

## 入力と状態を検証する

実装が進む前に、入力と既存の状態を検証して、ライブラリが正しく使用されていることを確認してください。
入力の検証には [`require`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/require.html) 関数を、既存の状態の検証には [`check`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/check.html) 関数を使用します。

`require` 関数は、条件が `false` の場合に [`IllegalArgumentException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-illegal-argument-exception/#kotlin.IllegalArgumentException) をスローし、適切なエラーメッセージを表示して即座に失敗させます。

```kotlin
fun saveUser(username: String, password: String) {
    require(username.isNotBlank()) { "Username should not be blank" }
    require(username.all { it.isLetterOrDigit() }) {
        "Username can only contain letters and digits, was: $username"
    }
    require(password.isNotBlank()) { "Password should not be blank" }
    require(password.length >= 7) {
        "Password must contain at least 7 characters"
    }

    /* 実装を進めることができる */
}

```

上記のように、無効な文字を含むユーザー名に対するエラーメッセージにその不適切なユーザー名を含めているのと同様に、エラーメッセージにはユーザーが失敗の原因を特定しやすくするための関連する入力を含めるべきです。
ただし、パスワードの長さのエラーメッセージに入力されたパスワード自体を含めないように、エラーメッセージに値を含めることでセキュリティ上の脆弱性として悪用される可能性がある場合は例外です。

同様に、`check` 関数は条件が `false` の場合に [`IllegalStateException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-illegal-state-exception/#kotlin.IllegalStateException) をスローします。
以下の例のように、この関数を使用してインスタンスの状態を検証します。

```kotlin
class ShoppingCart {
    private val contents = mutableListOf<Item>()

    fun addItem(item: Item) {
       contents.add(item)
    }

    fun purchase(): Amount {
       check(contents.isNotEmpty()) {
           "Cannot purchase an empty cart"
       }
       // 金額を計算して返す
    }
}
```

## 次のステップ

ガイドの次のパートでは、デバッグのしやすさ（Debuggability）について学びます。

[次のパートに進む](api-guidelines-debuggability.md)