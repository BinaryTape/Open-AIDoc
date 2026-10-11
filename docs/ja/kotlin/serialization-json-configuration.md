[//]: # (title: Json インスタンスのカスタマイズ)

デフォルトの [`Json`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json/-default/) インスタンスは、JSON 仕様および Kotlin クラスの宣言に厳格に従います。

より柔軟な JSON 機能や型変換を利用したい場合は、[`Json()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json.html) ビルダー関数を使用してカスタム `Json` インスタンスを作成できます：

```kotlin
// デフォルト設定をベースにしつつ、特殊な浮動小数点値を許可する Json インスタンスを作成
val customJson = Json {
    allowSpecialFloatingPointValues = true
}

// デフォルトのものと同じ構文で customJson インスタンスを使用して文字列をエンコード
val jsonString = customJson.encodeToString(Data(Double.NaN))
println(jsonString)
```

この方法で作成された `Json` インスタンスは不変（イミュータブル）かつスレッドセーフであるため、再利用のためにトップレベルプロパティに安全に保存できます。

> カスタム `Json` インスタンスを再利用すると、クラス固有の情報をキャッシュできるようになるため、パフォーマンスが向上します。
>
{style="tip"}

また、同じビルダー構文を使用して、既存の `Json` インスタンスをベースに設定を変更した新しいインスタンスを作成することもできます：

```kotlin
// 既存の Json をベースにして新しいインスタンスを作成
val lenientJson = Json(customJson) {
    isLenient = true
    prettyPrint = true
}
```

## JSON 構造のカスタマイズ {id="customize-json-structure"}

エンコードおよびデコード時に `Json` インスタンスがどのようにデータを構造化するかをカスタマイズできます。
これにより、出力にどの値を含めるかや、特定の型をどのように表現するかを制御できます。

### デフォルト値のエンコード {id="encode-default-values"}

デフォルトでは、デコード時に欠落しているプロパティへ自動的にデフォルト値が適用されるため、JSON エンコーダーはデフォルトのプロパティ値を省略します。
この動作は、不要な `null` 値の出力を防げるため、デフォルト値が null である null 許容プロパティで特に便利です。
詳細については、[デフォルトプロパティのシリアライズの管理](serialization-customization-options.md#manage-the-serialization-of-default-properties-with-encodedefault) セクションを参照してください。

このデフォルトの動作を変更するには、`Json` インスタンスで [`encodeDefaults`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/encode-defaults.html) プロパティを `true` に設定します：

```kotlin
// シリアライズライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// デフォルト値をエンコードするように Json インスタンスを設定
val format = Json { encodeDefaults = true }

@Serializable
class Project(
    val name: String,
    val language: String = "Kotlin",
    val website: String? = null
)

fun main() {
    val data = Project("kotlinx.serialization")

    // デフォルト値を含むすべてのプロパティ値をエンコード
    println(format.encodeToString(data))
    // {"name":"kotlinx.serialization","language":"Kotlin","website":null}
}
//sampleEnd
```
{kotlin-runnable="true" id="encode-default-values-example"}

### 明示的な null の省略 {id="omit-explicit-nulls"}

デフォルトでは、すべての `null` 値が JSON 出力にエンコードされます。
`null` 値を省略するには、`Json` インスタンスで [`explicitNulls`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/explicit-nulls.html) プロパティを `false` に設定します：

```kotlin
// シリアライズライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// シリアライズ中に null 値を省略するように Json インスタンスを設定
val format = Json { explicitNulls = false }

@Serializable
data class Project(
    val name: String,
    val language: String,
    val version: String? = "1.2.2",
    val website: String?,
    val description: String? = null
)

fun main() {
    val data = Project("kotlinx.serialization", "Kotlin", null, null, null)
    val json = format.encodeToString(data)

    // JSON 出力から version、website、description プロパティを省略
    println(json)
    // {"name":"kotlinx.serialization","language":"Kotlin"}

    // デフォルト値を持たない欠落した null 許容プロパティは null として扱う
    // デフォルト値を持つプロパティにはデフォルト値を代入
    println(format.decodeFromString<Project>(json))
    // Project(name=kotlinx.serialization, language=Kotlin, version=1.2.2, website=null, description=null)
}
//sampleEnd
```
{kotlin-runnable="true" id="omit-nulls-example"}

`explicitNulls` を `false` に設定すると、エンコードとデコードが非対称になる場合があります。
この例では、`version` プロパティはエンコード前は `null` でしたが、デコード後は `1.2.2` になります。

> [`coerceInputValues`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/coerce-input-values.html) プロパティを使用すると、特定の無効な入力値を欠落したプロパティとして扱うようにデコーダーを設定できます。
> 詳細については、[入力値の強制変換](#coerce-input-values) セクションを参照してください。
>
{style="tip"}

### 構造化されたマップキーの許可 {id="allow-structured-map-keys"}

JSON のキーはプリミティブまたは enum のみを表す文字列であるため、JSON 形式は構造化されたキーを持つマップをネイティブにはサポートしていません。
ユーザー定義クラスのキーを持つマップをシリアライズおよびデシリアライズするには、[`allowStructuredMapKeys`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/allow-structured-map-keys.html) プロパティを使用します：

```kotlin
// シリアライズライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 構造化されたキーを持つマップをエンコードするように Json インスタンスを設定
val format = Json { allowStructuredMapKeys = true }

@Serializable
data class Project(val name: String)

fun main() {
    val map = mapOf(
        Project("kotlinx.serialization") to "Serialization",
        Project("kotlinx.coroutines") to "Coroutines"
    )
    // 構造化されたキーを持つマップを JSON 配列としてシリアライズ:
    // [key1, value1, key2, value2,...]
    println(format.encodeToString(map))
    // [{"name":"kotlinx.serialization"},"Serialization",{"name":"kotlinx.coroutines"},"Coroutines"]
}
//sampleEnd
```
{kotlin-runnable="true" id="allow-structured-map-keys-example"}

### 特殊な浮動小数点値の許可 {id="allow-special-floating-point-values"}

デフォルトでは、[JSON 仕様](https://datatracker.ietf.org/doc/html/rfc8259#section-6)で禁止されているため、[`Double.NaN`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-double/-na-n.html) や無限大などの特殊な浮動小数点値は JSON でサポートされていません。

これらをエンコードおよびデコードできるようにするには、`Json` インスタンスで [`allowSpecialFloatingPointValues`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/allow-special-floating-point-values.html) プロパティを `true` に設定します：

```kotlin
// シリアライズライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 特殊な浮動小数点値を許可するように Json インスタンスを設定
val format = Json { allowSpecialFloatingPointValues = true }

@Serializable
class Data(
    val value: Double
)

fun main() {
    val data = Data(Double.NaN)
    // 特殊な浮動小数点値を表現するために使用される非標準の JSON 出力を生成
    println(format.encodeToString(data))
    // {"value":NaN}
}
//sampleEnd
```
{kotlin-runnable="true" id="allow-special-float-point-example"}

### ポリモーフィズムのためのクラス識別子の指定 {id="specify-class-discriminator-for-polymorphism"}

[ポリモーフィックなデータ](serialization-polymorphism.md)を扱う場合、[`classDiscriminator`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/class-discriminator.html) プロパティを使用して、シリアライズされたポリモーフィックなオブジェクトの型を識別するキー名を指定できます。
これを [`@SerialName` アノテーションで定義された明示的なシリアル名](serialization-customization-options.md#customize-serial-names)と組み合わせることで、結果として生成される JSON 構造を完全に制御できます：

```kotlin
// シリアライズライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// カスタムクラス識別子を使用するように Json インスタンスを設定
val format = Json { classDiscriminator = "#class" }

@Serializable
sealed class Project {
    abstract val name: String
}

// OwnedProject クラスにカスタムシリアル名を指定
@Serializable
@SerialName("owned")
class OwnedProject(override val name: String, val owner: String) : Project()

// SimpleProject クラスにカスタムシリアル名を指定
@Serializable
@SerialName("simple")
class SimpleProject(override val name: String) : Project()

fun main() {
    val simpleProject: Project = SimpleProject("kotlinx.serialization")
    val ownedProject: Project = OwnedProject("kotlinx.coroutines", "kotlin")

    // #class: "simple" を付与して SimpleProject をシリアライズ
    println(format.encodeToString(simpleProject))
    // {"#class":"simple","name":"kotlinx.serialization"}

    // #class: "owned" を付与して OwnedProject をシリアライズ
    println(format.encodeToString(ownedProject))
    // {"#class":"owned","name":"kotlinx.coroutines","owner":"kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true" id="class-discriminator-example"}

`Json` インスタンスの `classDiscriminator` プロパティではすべてのポリモーフィック型に対して単一の識別子キーしか指定できませんが、[実験的（Experimental）](components-stability.md#stability-levels-explained)な [`@JsonClassDiscriminator`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-class-discriminator/) アノテーションを使用すると、より柔軟な設定が可能です。
これにより、ベースクラス上で直接カスタム識別子を定義でき、すべてのサブクラスに自動的に継承されます。

> 継承可能なシリアルアノテーションの詳細については、[`@InheritableSerialInfo`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-inheritable-serial-info/) を参照してください。
> 
{style="tip"}

以下に例を示します：

```kotlin
// シリアライズライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// @JsonClassDiscriminator アノテーションは継承可能であるため、Base のすべてのサブクラスが同じ識別子を持つ
@Serializable
@OptIn(ExperimentalSerializationApi::class)
@JsonClassDiscriminator("message_type")
sealed class Base

// Base から識別子を継承
@Serializable
sealed class ErrorClass: Base()

// メッセージとオプションのエラーを組み合わせたクラスを定義
@Serializable
data class Message(val message: Base, val error: ErrorClass?)

@Serializable
@SerialName("my.app.BaseMessage")
data class BaseMessage(val message: String) : Base()

@Serializable
@SerialName("my.app.GenericError")
data class GenericError(@SerialName("error_code") val errorCode: Int) : ErrorClass()

val format = Json { classDiscriminator = "#class" }

fun main() {
    val data = Message(BaseMessage("not found"), GenericError(404))
    // すべてのサブクラスに対して Base の識別子を使用
    println(format.encodeToString(data))
    // {"message":{"message_type":"my.app.BaseMessage","message":"not found"},"error":{"message_type":"my.app.GenericError","error_code":404}}
}
//sampleEnd
```
{kotlin-runnable="true" id="jsonclass-discriminator-example"}

> sealed ベースクラスのサブクラスごとに異なるクラス識別子を指定することはできません。
> 独自の識別子を定義できるのは、明確に区別され重複しないサブクラスの階層のみです。
> 
> 両方で識別子が指定されている場合は、`Json` の設定よりも `@JsonClassDiscriminator` が優先されます。
>
{style="note"}

### クラス識別子の出力モードの設定 {id="set-class-discriminator-output-mode"}

クラス識別子を JSON 出力にどのように追加するかを制御するには、[`JsonBuilder.classDiscriminatorMode`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/class-discriminator-mode.html) プロパティを使用します。
デフォルトでは、[識別子はポリモーフィック型に対してのみ追加されます](#specify-class-discriminator-for-polymorphism)。これは [ポリモーフィックなクラス階層](serialization-polymorphism.md) を扱う際に便利です。

この動作を調整するには、[`ClassDiscriminatorMode`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-class-discriminator-mode/) プロパティに以下のいずれかのオプションを設定します：

* [`POLYMORPHIC`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-class-discriminator-mode/-p-o-l-y-m-o-r-p-h-i-c/): （デフォルト）ポリモーフィック型に対してのみクラス識別子を追加します。
* [`ALL_JSON_OBJECTS`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-class-discriminator-mode/-a-l-l_-j-s-o-n_-o-b-j-e-c-t-s/): 可能な限りすべての JSON オブジェクトにクラス識別子を追加します。
* [`NONE`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-class-discriminator-mode/-n-o-n-e/): クラス識別子を完全に省略します。

以下は、`ClassDiscriminatorMode` プロパティを `NONE` に設定した例です：

```kotlin
// シリアライズライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 出力からクラス識別子を省略するように Json インスタンスを設定
val format = Json { classDiscriminatorMode = ClassDiscriminatorMode.NONE }

@Serializable
sealed class Project {
    abstract val name: String
}

@Serializable
class OwnedProject(override val name: String, val owner: String) : Project()

fun main() {
    val data: Project = OwnedProject("kotlinx.coroutines", "kotlin")
    // 識別子なしでシリアライズ
    println(format.encodeToString(data))
    // {"name":"kotlinx.coroutines","owner":"kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true" id="set-classdiscriminatormode-example"}

> 識別子がない場合、ベースクラス用のシリアライザーは出力を適切な型へデシリアライズして復元することができなくなります。
>
{style="note"}

### プリティプリント（整形出力） {id="pretty-printing"}

デフォルトでは、`Json` はコンパクトな単一行の出力を生成します。

出力でプリティプリントを有効にすることで、インデントや改行を追加して可読性を高めることができます。
これを行うには、`Json` インスタンスで [`prettyPrint`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/pretty-print.html) プロパティを `true` に設定します：

```kotlin
// シリアライズライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// カスタム Json フォーマットを作成
val format = Json { prettyPrint = true }

@Serializable
data class Project(val name: String, val language: String)

fun main() {
    val data = Project("kotlinx.serialization", "Kotlin")

    // 改行とインデントを適用して JSON 出力を表示
    println(format.encodeToString(data))
}
//sampleEnd
```
{kotlin-runnable="true" id="pretty-printing-example"}

この例では、以下の結果が出力されます：

```text
{
    "name": "kotlinx.serialization",
    "language": "Kotlin"
}
```

> [`prettyPrintIndent`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/pretty-print-indent.html) オプションを使用すると、プリティプリントされた JSON で使用されるインデントをカスタマイズできます。
>
> 例えば、デフォルトの4つのスペースを、`\t` や `\n` などの許可された空白文字に変更できます。
>
{style="tip"}

## JSON デシリアライゼーションのカスタマイズ {id="customize-json-deserialization"}

Kotlin の `Json` パーサーには、JSON データのパースおよびデシリアライズをカスタマイズできるいくつかの設定が用意されています。

### 未知のキーを無視する {id="ignore-unknown-keys"}

サードパーティのサービスやその他の動的なソースからの JSON データを扱う場合、時間の経過とともに JSON オブジェクトに新しいプロパティが追加されることがあります。

デフォルトでは、未知のキー（JSON 入力内のプロパティ名）が存在するとデシリアライズ中にエラーが発生します。
これを防ぐには、`Json` インスタンスで [`ignoreUnknownKeys`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/ignore-unknown-keys.html) プロパティを `true` に設定します：

```kotlin
// シリアライズライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 未知のキーを無視するように Json インスタンスを作成
val format = Json { ignoreUnknownKeys = true }

@Serializable
data class Project(val name: String)

fun main() {
    val data = format.decodeFromString<Project>("""
        {"name":"kotlinx.serialization","language":"Kotlin"}
    """)
    // language キーは Project クラスに存在しないため無視される
    println(data)
    // Project(name=kotlinx.serialization)
}
//sampleEnd
```
{kotlin-runnable="true" id="ignore-unknown-keys-example"}

#### 特定のクラスに対して未知のキーを無視する {id="ignore-unknown-keys-for-specific-classes"}
<primary-label ref="experimental-opt-in"/>

[すべてのクラスに対して `ignoreUnknownKeys` を有効にする](#ignore-unknown-keys) 代わりに、`@JsonIgnoreUnknownKeys` アノテーションを使用して特定のクラスに対してのみ未知のキーを無視することができます。
これにより、必要な箇所でのみ寛容さを許容しつつ、デフォルトでは厳格なデシリアライズを維持できます。

`@JsonIgnoreUnknownKeys` アノテーションは[実験的（Experimental）](components-stability.md#stability-levels-explained)です。
オプトインするには、`@OptIn(ExperimentalSerializationApi::class)` アノテーションを使用するか、コンパイラオプション `-opt-in=kotlinx.serialization.ExperimentalSerializationApi` を使用してください：

```kotlin
// シリアライズライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@OptIn(ExperimentalSerializationApi::class)
@Serializable
// Outer 内の未知のプロパティはデシリアライズ中に無視される
@JsonIgnoreUnknownKeys
data class Outer(val a: Int, val inner: Inner)

@Serializable
data class Inner(val x: String)

fun main() {
    val outer = Json.decodeFromString<Outer>(
        """{"a":1,"inner":{"x":"value"},"unknownKey":42}"""
    )
    println(outer)
    // Outer(a=1, inner=Inner(x=value))

    // 例外をスローする
    // Inner にはアノテーションが付いていないため、inner 内の unknownKey は無視されない
    println(
        Json.decodeFromString<Outer>(
            """{"a":1,"inner":{"x":"value","unknownKey":"unexpected"}}"""
        )
    )
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.2" validate="false" id="ignore-specific-unknown-keys-example"}

この例では、`Inner` には `@JsonIgnoreUnknownKeys` がアノテーションされていないため、未知のキーに対して `SerializationException` がスローされます。

### 入力値の強制変換 {id="coerce-input-values"}

サードパーティのサービスやその他の動的なソースからの JSON データを扱う場合、フォーマットが変更される可能性があります。
その結果、実際の値が期待される型と一致せず、デコード中に例外が発生することがあります。

デフォルトの `Json` 実装は、[入力の型に関して厳格](serialization-customization-options.md#the-serializable-annotation)です。
この制約を緩和するには、`Json` インスタンスで [`coerceInputValues`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/coerce-input-values.html) プロパティを `true` に設定します：

```kotlin
// シリアライズライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
val format = Json { coerceInputValues = true }

@Serializable
data class Project(val name: String, val language: String = "Kotlin")

fun main() {
    val data = format.decodeFromString<Project>("""
        {"name":"kotlinx.serialization","language":null}
    """)

    // language の無効な null 値をデフォルト値に強制変換
    println(data)
    // Project(name=kotlinx.serialization, language=Kotlin)
}
//sampleEnd
```
{kotlin-runnable="true"}

`coerceInputValues` プロパティはデコードにのみ影響します。これは、特定の無効な入力値を、対応するプロパティが欠落しているかのように扱います。
現在、これは以下に適用されます：

* 非 null 許容型に対する `null` の入力
* enum に対する未知の値

> このリストは将来のバージョンで拡張され、無効な値をデフォルト値または `null` に置き換えることで、このプロパティを持つ `Json` インスタンスがさらに寛容になる可能性があります。
>
{style="note"}

値が欠落している場合、デフォルトのプロパティ値が存在すればそれに置き換えられます。

enum の場合、値が `null` に置き換えられるのは以下の場合のみです：

* デフォルト値が定義されていない。
* [`explicitNulls`](#omit-explicit-nulls) プロパティが `false` に設定されている。
* プロパティが null 許容である。

`coerceInputValues` を `explicitNulls` プロパティと組み合わせて、無効な enum 値を処理できます：

```kotlin
// シリアライズライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
enum class Color { BLACK, WHITE }

@Serializable
data class Brush(val foreground: Color = Color.BLACK, val background: Color?)

val json = Json { 
  coerceInputValues = true
  explicitNulls = false
}

fun main() {

    // 未知の foreground の値をデフォルト値に、background を null に強制変換
    val brush = json.decodeFromString<Brush>("""{"foreground":"pink", "background":"purple"}""")
    println(brush)
    // Brush(foreground=BLACK, background=null)
}
//sampleEnd
```
{kotlin-runnable="true" id="coerce-input-values-example"}

### 末尾のカンマを許可 {id="allow-trailing-commas"}

JSON 入力内の末尾のカンマ（トレイリングコンマ）を許可するには、[`allowTrailingComma`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/allow-trailing-comma.html) プロパティを `true` に設定します：

```kotlin
// シリアライズライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// JSON オブジェクトおよび配列内の末尾のカンマを許可
val format = Json { allowTrailingComma = true }

fun main() {
    val numbers = format.decodeFromString<List<Int>>(
        """
            [1, 2, 3,]
        """
    )
    println(numbers)
    // [1, 2, 3]
}
//sampleEnd
```
{kotlin-runnable="true" id="allow-trailing-commas-example"}

### JSON 内のコメントを許可 {id="allow-comments-in-json"}

JSON 入力内のコメントを許可するには、[`allowComments`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/allow-comments.html) プロパティを使用します。
このプロパティが有効な場合、パーサーは入力内の以下の形式のコメントを受け入れます：

* 改行 `\n` で終了する `//` 行コメント
* `/* */` ブロックコメント

以下に例を示します：

```kotlin
// シリアライズライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// JSON 入力内のコメントを許可
val format = Json { allowComments = true }

fun main() {
    val numbers = format.decodeFromString<List<Int>>(
        """
            [
                // 最初の要素
                1,
                /* 2番目の要素 */
                2
            ]
        """
    )
    println(numbers)
    // [1, 2]
}
//sampleEnd
```
{kotlin-runnable="true" id="allow-comments-example"}

### 寛容なパース（Lenient パース） {id="lenient-parsing"}

デフォルトでは、キーや文字列リテラルを引用符で囲むことを要求する [RFC-8259](https://www.ietf.org/rfc/rfc8259.txt) 仕様への準拠を保証するため、`Json` パーサーは厳格な JSON ルールを適用します。

これらの制約を緩和するには、`Json` インスタンスで [`isLenient`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/is-lenient.html) プロパティを `true` に設定します：

```kotlin
// シリアライズライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
val format = Json { isLenient = true }

enum class Status { SUPPORTED }

@Serializable
data class Project(val name: String, val status: Status, val votes: Int)

fun main() {
    // 寛容なパースで JSON 文字列をデコード
    // 寛容なパースでは引用符で囲まれていないキー、文字列、および enum 値が許可される
    val data = format.decodeFromString<Project>("""
        {
            name   : kotlinx.serialization,
            status : SUPPORTED,
            votes  : "9000"
        }
    """)
    println(data)
    // Project(name=kotlinx.serialization, status=SUPPORTED, votes=9000)
}
//sampleEnd
```
{kotlin-runnable="true" id="lenient-parsing-example"}

## JSON と Kotlin 間の名前マッピングのカスタマイズ {id="customize-name-mapping-between-json-and-kotlin"}

一部の JSON データは、Kotlin の命名規則や期待される形式と完全には一致しない場合があります。
こうした課題に対処するため、Kotlin シリアライゼーションには名前の不一致を管理し、複数の JSON プロパティ名を処理し、シリアライズされたデータ全体で一貫した命名戦略を確保するためのいくつかのツールが用意されています。

### 単一の Kotlin プロパティに対して代替 JSON プロパティ名を受け入れる {id="accept-alternative-json-property-names-for-a-single-kotlin-property"}

スキーマバージョン間で JSON プロパティ名が変更された場合、[`@SerialName` アノテーションを使用して JSON プロパティ名を変更できます](serialization-customization-options.md#customize-serial-names)。

ただし、これを行うと以前のプロパティ名を引き続き使用しているデータのデコードができなくなります。
単一のプロパティに対して代替の JSON プロパティ名を受け入れるには、[`@JsonNames`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-names/) アノテーションを使用します：

```kotlin
// シリアライズライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
// JSON プロパティの name と title の両方を name プロパティにマッピング
data class Project(@JsonNames("title") val name: String)

fun main() {
    val project = Json.decodeFromString<Project>("""{"name":"kotlinx.serialization"}""")
    println(project)
    // Project(name=kotlinx.serialization)

    val oldProject = Json.decodeFromString<Project>("""{"title":"kotlinx.coroutines"}""")
    // name と title の両方の Json プロパティが name プロパティに対応
    println(oldProject)
    // Project(name=kotlinx.coroutines)
}
//sampleEnd
```
{kotlin-runnable="true" id="accept-alternative-json-property-example"}

> [`JsonBuilder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/) の [`useAlternativeNames`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/use-alternative-names.html) プロパティによって `@JsonNames` アノテーションが有効になります。
> このプロパティはデフォルトで `true` に設定されており、`Json` が単一のプロパティに対して複数の名前を認識してデコードできるようにします。
> 
> `@JsonNames` を使用しておらず、特に `ignoreUnknownKeys` で多くの未知のプロパティをスキップする際にパフォーマンスを向上させたい場合は、このプロパティを `false` に設定できます。
>
{style="note"}

### 大文字と小文字を区別しない Enum のデコード {id="decode-enums-in-a-case-insensitive-manner"}

[Kotlin の命名規則](coding-conventions.md#property-names)では、enum 値には大文字とアンダースコア（SCREAMING_SNAKE_CASE）またはアッパーキャメルケース（UpperCamelCase）を使用することを推奨しています。
デフォルトでは、`Json` はデコード時に Kotlin の enum 定数の正確な名前を使用します。

しかし、外部ソースからの JSON データでは、小文字や大文字小文字が混在した名前が使用されている場合があります。
このようなケースを処理するには、[`JsonBuilder.decodeEnumsCaseInsensitive`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/decode-enums-case-insensitive.html) プロパティを使用して、大文字と小文字を区別せずに enum 値をデコードするように `Json` インスタンスを設定します：

```kotlin
// シリアライズライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 大文字と小文字を区別しない方法で enum 値をデコードするように Json インスタンスを設定
val format = Json { decodeEnumsCaseInsensitive = true }

enum class Cases { VALUE_A, @JsonNames("Alternative") VALUE_B }

@Serializable
data class CasesList(val cases: List<Cases>)

fun main() {
    // 代替名を含め、大文字小文字に関係なく enum 値をデコード
    println(format.decodeFromString<CasesList>("""{"cases":["value_A", "alternative"]}""")) 
    // CasesList(cases=[VALUE_A, VALUE_B])
}
//sampleEnd
```
{kotlin-runnable="true" id="decode-enums-caseinsensitive-example"}

> このプロパティは、[シリアル名](serialization-customization-options.md#customize-serial-names) と `@JsonNames` アノテーションで指定された [代替名](#accept-alternative-json-property-names-for-a-single-kotlin-property) の両方に適用され、
> すべての値が正常にデコードされることを保証します。このプロパティはエンコードには影響しません。
>
{style="note"}

### グローバルな命名戦略の適用 {id="apply-a-global-naming-strategy"}

JSON 入力のプロパティ名が Kotlin のプロパティ名と異なる場合、[`@SerialName`](serialization-customization-options.md#customize-serial-names) アノテーションを使用して各プロパティの名前を明示的に指定できます。
しかし、他のフレームワークやレガシーなコードベースから移行する場合、すべてのシリアル名を同じルールで変換する必要がある場合があります。

このようなシナリオでは、`Json` インスタンスの [JsonBuilder.namingStrategy](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/naming-strategy.html) プロパティを使用してグローバルな命名戦略を指定できます。
Kotlin シリアライゼーションには、[JsonNamingStrategy.SnakeCase](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-naming-strategy/-builtins/-snake-case.html) などの組み込み戦略が用意されています：

```kotlin
// シリアライズライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
data class Project(val projectName: String, val projectOwner: String)

// SnakeCase 命名戦略を適用するように Json インスタンスを設定
val format = Json { namingStrategy = JsonNamingStrategy.SnakeCase }

fun main() {
    val project = format.decodeFromString<Project>("""{"project_name":"kotlinx.coroutines", "project_owner":"Kotlin"}""")
    // すべてのシリアル名がキャメルケースからスネークケースに変換されたかのようにシリアライズおよびデシリアライズ
    println(format.encodeToString(project.copy(projectName = "kotlinx.serialization")))
    // {"project_name":"kotlinx.serialization","project_owner":"Kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true" id="global-naming-strategy-example"}

[`JsonNamingStrategy`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-naming-strategy/) でグローバルな命名戦略を使用する場合は、以下の点に注意してください：

* _変換はすべてのプロパティに適用されます_。これは、シリアル名がプロパティ名から派生しているか、[`@SerialName`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serial-name/) アノテーションで明示的に定義されているかに関係ありません。
  シリアル名を指定することによってプロパティを変換から除外することはできません。
  シリアライズ中に特定の名前を変更しないでおくには、代わりに `@JsonNames` アノテーションを使用してください。
* 変換後の名前が他の変換されたプロパティ名や、`@JsonNames` アノテーションで指定された代替名と競合する場合、デシリアライズは例外をスローして失敗します。
* グローバルな命名戦略は暗黙的です。
  そのため、クラス定義を見ただけではシリアライズされる名前を判断するのが難しくなります。
  これにより、IDE での **Find Usages**（使用箇所の検索）や **Rename**（名前の変更）、または `grep` などのツールを使用した全文検索などの作業が困難になり、バグのリスクやメンテナンスコストが増加する可能性があります。

これらの要因を考慮し、アプリケーションにグローバルな命名戦略を導入する前に、トレードオフを慎重に検討してください。

## 次のステップ {id="what-s-next"}

* パースまたはシリアライズされる前の JSON データを操作および処理するための [高度な JSON 要素の取り扱い](serialization-json-elements.md) を確認してください。
* データをより詳細に制御するための [シリアライズおよびデシリアライズ時の JSON の変換](serialization-transform-json.md) について学びましょう。