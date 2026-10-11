[//]: # (title: クラスのシリアライズ)

[`@Serializable`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serializable/) アノテーションは、[バッキングフィールド](properties.md#backing-fields)を持つすべてのクラスプロパティのデフォルトのシリアライズを有効にします。
この動作は、特定のニーズに合わせてカスタマイズできます。
このページでは、さまざまなシリアライズ技術を取り上げ、どのプロパティをシリアライズするかを指定する方法や、シリアライズ処理を管理する方法について説明します。

始める前に、[必要なライブラリの依存関係](serialization-get-started.md)をインポートしていることを確認してください。

## @Serializable アノテーション {id="the-serializable-annotation"}

`@Serializable` アノテーションを使用すると、クラスプロパティの自動シリアライズが可能になり、JSON などのフォーマットとの間でクラスを相互に変換できるようになります。

Kotlin では、バッキングフィールドを持つプロパティのみがシリアライズされます：

```kotlin
// シリアライズライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Project(
    // バッキングフィールドを持つプロパティ – シリアライズされる
    var name: String
) {
    // バッキングフィールドを持つプロパティ – シリアライズされる
    var stars: Int = 0

    // バッキングフィールドを持たないゲッターのみのプロパティ - シリアライズされない
    val path: String
        get() = "kotlin/$name"

    // 委譲プロパティ - シリアライズされない
    var id by ::name
}

fun main() {
    val data = Project("kotlinx.serialization").apply { stars = 9000 }
    // name プロパティと stars プロパティのみを出力
    println(Json.encodeToString(data))
    // {"name":"kotlinx.serialization","stars":9000}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-annotation-example"}

### クラス参照のシリアライズ {id="serialize-class-references"}

`@Serializable` でアノテーションが付けられたクラスは、他のクラスを参照するプロパティを含めることができます。
参照される側のクラスも、`@Serializable` でアノテーションが付けられている必要があります。
JSON にエンコードすると、ネストされた JSON オブジェクトになります：

```kotlin
// シリアライズライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
// owner プロパティは別のシリアライズ可能なクラス User を参照
class Project(val name: String, val owner: User)

// 参照されるクラスにも @Serializable アノテーションが必要
@Serializable
class User(val name: String)

fun main() {
    val owner = User("kotlin")
    val data = Project("kotlinx.serialization", owner)
    println(Json.encodeToString(data))
    // {"name":"kotlinx.serialization","owner":{"name":"kotlin"}}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-class-references-example"}

> シリアライズ可能でないクラスを参照するには、対応するプロパティに [`@Transient`](#exclude-properties-with-the-transient-annotation) アノテーションを付与するか、それらのクラス用の[カスタムシリアライザー](serialization-create-and-use-serializers.md)を提供してください。
>
{style="tip"}

### 重複するオブジェクト参照のシリアライズ {id="serialization-of-repeated-object-references"}

Kotlin のシリアライズは、プレーンなデータのエンコードおよびデコードを目的として設計されています。重複したオブジェクト参照を含む任意のオブジェクトグラフの再構築はサポートしていません。
例えば、同じインスタンスを 2 回参照するオブジェクトをシリアライズすると、そのインスタンスは 2 回エンコードされます：

```kotlin
// シリアライズライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Project(val name: String, val owner: User, val maintainer: User)

@Serializable
class User(val name: String)

fun main() {
    val owner = User("kotlin")
    // owner を 2 回参照
    val data = Project("kotlinx.serialization", owner, owner)
    println(Json.encodeToString(data))
    // {"name":"kotlinx.serialization","owner":{"name":"kotlin"},"maintainer":{"name":"kotlin"}}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-repeated-references"}

> 循環構造をシリアライズしようとすると、スタックオーバーフローが発生します。
> 参照をシリアライズから除外するには、[@Transient アノテーション](#exclude-properties-with-the-transient-annotation)を使用してください。
>
{style="tip"}

### ジェネリッククラスのシリアライズ {id="serialize-generic-classes"}

Kotlin のジェネリッククラスは型の多態性（型ポリモーフィズム）をサポートしており、これはコンパイル時に Kotlin のシリアライズによって強制されます。例えば、シリアライズ可能なジェネリッククラス `Payload<T>` を考えてみましょう：

```kotlin
// シリアライズライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
// Payload<T> クラスは、Int のような組み込み型や、
// Repository のような @Serializable が付いたユーザー定義型で使用できます
class Payload<T>(val value: T)

@Serializable
data class Repository(val name: String, val language: String)

@Serializable
class BackupData(
    val issueCount: Payload<Int>,
    val mainRepo: Payload<Repository>
)

fun main() {
    val backup = BackupData(
        Payload(42),
        Payload(Repository("kotlinx.serialization", "Kotlin"))
    )
    println(Json.encodeToString(backup))
    // {"issueCount":{"value":42},"mainRepo":{"value":{"name":"kotlinx.serialization","language":"Kotlin"}}}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-generic-classes-example"}

`Box<T>` のようなジェネリッククラスをシリアライズする場合、JSON の出力はコンパイル時に `T` に指定した実際の型に依存します。
その型がシリアライズ可能でない場合、コンパイルエラーが発生します。

## オプショナルなプロパティ {id="optional-properties"}

_デフォルト値_を持つプロパティは、デシリアライズ時にはオプショナル（省略可能）となり、フォーマットの設定によってはシリアライズ時にスキップできます。
例えば、デフォルトの JSON 設定では、デフォルト値のエンコードがスキップされます。

### オプショナルなプロパティにデフォルト値を設定する {id="set-default-values-for-optional-properties"}

Kotlin では、入力内にすべてのプロパティが存在する場合にのみオブジェクトをデシリアライズできます。
シリアライズにおいてプロパティをオプショナルにするには、入力に値が指定されていない場合に使用されるデフォルト値を設定します：

```kotlin
// シリアライズライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
// オプショナルな language プロパティにデフォルト値を設定
data class Project(val name: String, val language: String = "Kotlin")

fun main() {
    val data = Json.decodeFromString<Project>("""
        {"name":"kotlinx.serialization"}
    """)
    println(data)
    // Project(name=kotlinx.serialization, language=Kotlin)
}
//sampleEnd
```
{kotlin-runnable="true" id="deserialize-optional-properties"}

### null 許容プロパティのシリアライズ {id="serialize-nullable-properties"}

Kotlin のシリアライズは、null 許容プロパティをネイティブにサポートしています。
[他のデフォルト値と同様に](#manage-the-serialization-of-default-properties-with-encodedefault)、`null` 値は JSON 出力にエンコードされません：

```kotlin
// シリアライズライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
// null のデフォルト値を持つ null 許容プロパティ renamedTo を備えたクラスを定義
class Project(val name: String, val renamedTo: String? = null)

fun main() {
    val data = Project("kotlinx.serialization")
    // 値が null であるため、renamedTo プロパティはエンコードされない
    println(Json.encodeToString(data))
    // {"name":"kotlinx.serialization"}
}
//sampleEnd
```
{kotlin-runnable="true" id="nullable-properties-example"}

さらに、Kotlin の [null 安全性](null-safety.md)はデシリアライズ時にも強力に適用されます。
JSON オブジェクトに非 null プロパティに対する `null` 値が含まれている場合、そのプロパティにデフォルト値があったとしても例外がスローされます：

```kotlin
// シリアライズライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
data class Project(val name: String, val language: String = "Kotlin")

fun main() {
    val data = Json.decodeFromString<Project>("""
        {"name":"kotlinx.serialization","language":null}
    """)
    println(data)
    // JsonDecodingException
}
//sampleEnd
```
{kotlin-runnable="true" validate="false" id="deserialize-nullable-exception-example"}

> サードパーティの JSON からの `null` 値を処理する必要がある場合は、それらを[デフォルト値に強制変換（coerce）](serialization-json-configuration.md#coerce-input-values)できます。
> 
> また、`explicitNulls` プロパティを使用して、エンコードされた JSON から[明示的な `null` 値を省略](serialization-json-configuration.md#omit-explicit-nulls)することもできます。
>
{style="tip"}

### オプショナルなプロパティのイニシャライザ {id="initializers-in-optional-properties"}

シリアライズの入力にオプショナルなプロパティの値が含まれている場合、そのプロパティのイニシャライザは呼び出されません。
そのため、プロパティのイニシャライザ内で副作用を持つコードを使用することは避けてください。

例を以下に示します：

```kotlin
// シリアライズライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
fun computeLanguage(): String {
    println("Computing")
    return "Kotlin"
}

@Serializable
// 入力に language が含まれている場合はイニシャライザをスキップ
data class Project(val name: String, val language: String = computeLanguage())

fun main() {
    val data = Json.decodeFromString<Project>("""
        {"name":"kotlinx.serialization","language":"Java"}
    """)
    println(data)
    // Project(name=kotlinx.serialization, language=Java)
}
//sampleEnd
```
{kotlin-runnable="true" id="deserialize-initializer-example"}

この例では、入力で `language` プロパティが指定されているため、出力に `Computing` という文字列は出力されません。

### `@EncodeDefault` でデフォルトプロパティのシリアライズを管理する {id="manage-the-serialization-of-default-properties-with-encodedefault"}

デフォルトでは、JSON シリアライズはデフォルト値を持つプロパティを除外します。
これにより、シリアライズされるデータのサイズが削減され、余計な煩雑さを回避できます。

以下は、`language` プロパティの値がデフォルト値と等しいために出力から除外される例です：

```kotlin
// シリアライズライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
data class Project(val name: String, val language: String = "Kotlin")

fun main() {
    val data = Project("kotlinx.serialization")
    println(Json.encodeToString(data))
    // {"name":"kotlinx.serialization"}
}
//sampleEnd
```
{kotlin-runnable="true" id="default-properties-example"}

> デフォルトですべてのプロパティの[デフォルト値をエンコードする](serialization-json-configuration.md#encode-default-values)ように `Json` インスタンスを設定できます。
>
{style="tip"}

値やフォーマット設定に関係なく、プロパティを常にシリアライズするには、[`@EncodeDefault`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-encode-default/) アノテーションを使用します。
あるいは、[`EncodeDefault.Mode`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-encode-default/-mode/) パラメータを設定してこの動作を変更することもできます。

`language` プロパティがシリアライズされた出力に常に含まれ、一方で `projects` プロパティが空のリストである場合に除外される例を見てみましょう：

```kotlin
// シリアライズライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.EncodeDefault.Mode.NEVER

//sampleStart
@Serializable
data class Project(
    val name: String,
    // デフォルト値 "Kotlin" を持っている場合でも、
    // シリアライズされた出力に language プロパティを常に含める
    @EncodeDefault val language: String = "Kotlin"
)

@Serializable
data class User(
    val name: String,
    // デフォルト値がある場合でも、空のリストのときは projects を除外する
    @EncodeDefault(NEVER) val projects: List<Project> = emptyList()
)

fun main() {
    val adminUser = User("Alice", listOf(Project("kotlinx.serialization")))
    val guestUser = User("Bob")
    // projects に値が含まれているためシリアライズされる
    // language は常にシリアライズされる
    println(Json.encodeToString(adminUser))
    // {"name":"Alice","projects":[{"name":"kotlinx.serialization","language":"Kotlin"}]}

    // projects は空のリストであり、EncodeDefault.Mode が NEVER に
    // 設定されているため除外され、シリアライズされない
    println(Json.encodeToString(guestUser))
    // {"name":"Bob"}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-encode-default"}

### `@Required` アノテーションでプロパティを必須にする {id="make-properties-required-with-the-required-annotation"}

プロパティに [`@Required`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-required/) アノテーションを付けると、入力内でそのプロパティが必須になります。
これにより、プロパティに[デフォルト値](#set-default-values-for-optional-properties)がある場合であっても、入力にそのプロパティが含まれていることが強制されます：

```kotlin
// シリアライズライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.Required

//sampleStart
@Serializable
// language プロパティを必須としてマーク
data class Project(val name: String, @Required val language: String = "Kotlin")

fun main() {
    val data = Json.decodeFromString<Project>("""
        {"name":"kotlinx.serialization"}
    """)
    println(data)
    // MissingFieldException
}
//sampleEnd
```
{kotlin-runnable="true" id="required-annotation-example"}

## クラスのシリアライズをカスタマイズする {id="customize-class-serialization"}

Kotlin のシリアライズには、クラスがどのようにシリアライズされるかを変更するための方法がいくつか用意されています。
このセクションでは、プロパティ名のカスタマイズや、プロパティのシリアライズ対象の制御などのテクニックを取り上げます。

### シリアル名のカスタマイズ {id="customize-serial-names"}

デフォルトでは、JSON などのシリアライズ出力におけるプロパティ名は、ソースコード内の名前と一致します。

_シリアル名_と呼ばれるこれらの名前は、[`@SerialName`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serial-name/) アノテーションを使ってカスタマイズできます。
シリアライズされた出力でプロパティ名をよりわかりやすく表現したい場合などに使用します：

```kotlin
// シリアライズライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
// @SerialName を使用して lang プロパティの名前を language に変更
class Project(val name: String, @SerialName("language") val lang: String)

fun main() {
    val data = Project("kotlinx.serialization", "Kotlin")
    // JSON 出力によりわかりやすいプロパティ名を出力
    println(Json.encodeToString(data))
    // {"name":"kotlinx.serialization","language":"Kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true" id="serial-names"}

### シリアライズ用のコンストラクタプロパティを定義する {id="define-constructor-properties-for-serialization"}

`@Serializable` でアノテーションが付けられたクラスは、プライマリコンストラクタのすべてのパラメータをプロパティとして宣言する必要があります。

プロパティに値を代入する前に追加の初期化ロジックを実行する必要がある場合は、[セカンダリコンストラクタ](classes.md#secondary-constructors)を使用します。
プライマリコンストラクタは `private` のままにしてプロパティの初期化を処理させることができます。

セカンダリコンストラクタが文字列を 2 つの値にパースし、それがシリアライズのためにプライマリコンストラクタに渡される例を以下に示します：

```kotlin
// シリアライズライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Project private constructor(val owner: String, val name: String) {
    // path 文字列を使用して Project オブジェクトを作成
    constructor(path: String) : this(
        owner = path.substringBefore('/'),
        name = path.substringAfter('/')
    )

    val path: String
        get() = "$owner/$name"
}
fun main() {
    println(Json.encodeToString(Project("kotlin/kotlinx.serialization")))
    // {"owner":"kotlin","name":"kotlinx.serialization"}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-constructor-properties"}

### プライマリコンストラクタでデータを検証する {id="validate-data-in-the-primary-constructor"}

デシリアライズ後、`kotlinx.serialization` プラグインは、通常のインスタンス生成時と同様にクラスの[イニシャライザブロック](classes.md#initializer-blocks)を実行します。
これにより、コンストラクタパラメータを検証し、デシリアライズ時に無効なデータを拒否できます。

例を以下に示します：

```kotlin
// シリアライズライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Project(val name: String) {
    // name が空でないことを検証
    init {
        require(name.isNotEmpty()) { "name cannot be empty" }
    }
}

fun main() {
    val data = Json.decodeFromString<Project>("""
        {"name":""}
    """)
    println(data)
    // Exception in thread "main" java.lang.IllegalArgumentException: name cannot be empty
}
//sampleEnd
```
{kotlin-runnable="true" id="validate-constructor-example"}

### `@Transient` アノテーションでプロパティを除外する {id="exclude-properties-with-the-transient-annotation"}

[`@Transient`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-transient/) アノテーションを使用すると、プロパティをシリアライズから除外できます。
トランジェントなプロパティにはデフォルト値が必要です。

入力内でトランジェントなプロパティの値を明示的に指定した場合、それがデフォルト値と一致していたとしても `JsonDecodingException` がスローされます：

```kotlin
// シリアライズライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.Transient
import kotlinx.serialization.json.*

//sampleStart
@Serializable
// language プロパティをシリアライズから除外
data class Project(val name: String, @Transient val language: String = "Kotlin")

fun main() {
    // 入力がデフォルト値と一致していても例外をスローする
    val data = Json.decodeFromString<Project>("""
        {"name":"kotlinx.serialization","language":"Kotlin"}
    """)
    println(data)
    // JsonDecodingException
}
//sampleEnd
```
{kotlin-runnable="true" validate="false" id="transient-annotation-example"}

> `@Transient` アノテーションが付けられたものを含む、JSON 内の未知のキーによる例外を回避するには、[`ignoreUnknownKeys`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/ignore-unknown-keys.html) 設定プロパティを有効にします。
> 詳細については、[未知のキーを無視する](serialization-json-configuration.md#ignore-unknown-keys)のセクションを参照してください。
>
{style="tip"}

## 次のステップ {id="what-s-next"}

* より複雑な JSON シリアライズのシナリオについては、[JSON シリアライズの概要](serialization-configure-json-serialization.md)を参照してください。
* 生成されたシリアライザーの取得、カスタムシリアライザーの作成、およびシリアライザーの適用方法については、[シリアライザーの作成と使用](serialization-create-and-use-serializers.md)を参照してください。