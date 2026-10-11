[//]: # (title: JSONシリアライゼーションの概要)

Kotlinシリアライゼーションを使用すると、KotlinオブジェクトとJSONを相互に簡単に変換できます。
[`Json`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json/) クラスはそのための主要なツールであり、JSONの生成やパースの方法に柔軟性を提供します。
`Json` インスタンスを設定して特定のJSONの振る舞いを処理することも、基本的なタスク向けにデフォルトのインスタンスを使用することもできます。

`Json` クラスを使用すると、以下のことが行えます。

* [`encodeToString()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json/encode-to-string.html) 関数を使用して、KotlinオブジェクトをJSON文字列にシリアライズする。
* [`decodeFromString()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json/decode-from-string.html) 関数を使用して、JSON文字列をKotlinオブジェクトにデシリアライズする。
* [`encodeToJsonElement()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/encode-to-json-element.html) 関数および [`decodeFromJsonElement()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/decode-from-json-element.html) 関数を使用して、複雑なJSON構造を扱う際に [`JsonElement` を直接操作する](serialization-json-elements.md)。
* [Experimental（実験的）](components-stability.md#stability-levels-explained) な拡張関数を使用して、JVMストリームや [`kotlinx-io`](https://github.com/Kotlin/kotlinx-io)、[Okio](https://square.github.io/okio/) 型を含む [I/Oソースを中間文字列を作成せずにシリアライズおよびデシリアライズする](serialization-json-io-sources.md)。

始める前に、シリアライゼーションライブラリから以下の宣言をインポートしてください。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*
```

以下は、デフォルトの `Json` インスタンスを使用して、KotlinでJSONシリアライゼーションがどのように動作するかを示す簡単な例です。

```kotlin
// シリアライゼーションライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
data class User(val name: String, val age: Int)

fun main() {
    // デフォルトのJsonインスタンスを使用
    val json = Json

    // Userオブジェクトを作成
    val user = User("Alice", 30)

    // UserオブジェクトをJSON文字列に変換
    val jsonString = json.encodeToString(user)
    println(jsonString)
    // {"name":"Alice","age":30}

    // JSON文字列をUserオブジェクトに逆変換
    val deserializedUser = json.decodeFromString<User>(jsonString)
    println(deserializedUser)
    // User(name=Alice, age=30)
}
//sampleEnd
```
{kotlin-runnable="true" id="first-json-example"}

デフォルトの設定を使用するだけでなく、未知のキーを無視するなど、特定のユースケースに合わせて [`Json` インスタンスをカスタマイズする](serialization-json-configuration.md) こともできます。

```kotlin
// シリアライゼーションライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
data class Project(val name: String)

// 未知のキーを無視するようにJsonインスタンスを設定
val customJson = Json {
    ignoreUnknownKeys = true
}

fun main() {
    val data = customJson.decodeFromString<Project>("""
        {"name":"kotlinx.serialization","language":"Kotlin"}
    """)
    println(data)
    // Project(name=kotlinx.serialization)
}
//sampleEnd
```
{kotlin-runnable="true" id="first-json-instance-example"}

## 次のステップ {id="what-s-next"}

* シリアライゼーションおよびデシリアライゼーションのさまざまなユースケースに対応するために、[`Json` インスタンスをカスタマイズする](serialization-json-configuration.md) 方法を学ぶ。
* JSONデータがパースまたはシリアライズされる前に操作・処理するための、[高度なJSON要素の扱い](serialization-json-elements.md) について確認する。
* データをより詳細に制御するために、[シリアライゼーションおよびデシリアライゼーション中にJSONを変換する](serialization-transform-json.md) 方法を確認する。