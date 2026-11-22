[//]: # (title: UUID)
<web-summary>マルチプラットフォームおよびJVMコードでの作成、パース、フォーマット、シリアライズ、UUID値の操作など、KotlinでUUIDを使用する方法を学びます。</web-summary>

[`Uuid`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/) クラスは、Globally Unique Identifier（GUID）としても知られる Universally Unique Identifier（UUID）を表します。

`Uuid` は、IDを割り当てる中央システムに依存することなくエンティティを一意に識別するために使用される128ビットの値です。これにより、UUIDは分散アプリケーション、データベース、クライアント生成のレコード、または [Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform/get-started.html) アプリケーションで役立ちます。

UUID値を扱うには `Uuid` クラスを使用します。単なる文字列とは異なり、専用のUUID型を使用することでコードがより明示的になり、無効な値の誤用を防ぐことができます。

プロジェクトでUUIDを使用するには、`kotlin.uuid` パッケージから `Uuid` クラスをインポートします。

```kotlin
import kotlin.uuid.Uuid
```

## UUIDの生成 {id="generate-uuids"}

ユーザーIDやデータベースIDなどの一般的な識別子用にランダムなバージョン4のUUIDを生成するには、[`Uuid.random()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/-companion/random.html) 関数を使用します。

```kotlin
import kotlin.uuid.Uuid

fun main() {
//sampleStart    
    val id = Uuid.random()
    println(id)
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0"}

また、以下の[試験的（Experimental）](components-stability.md#stability-levels-explained)な関数を使用して、特定のバージョンのUUIDを生成することもできます。

* [`Uuid.generateV4()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/-companion/generate-v4.html) 関数は、`Uuid.random()` 関数と同じタイプのUUIDを生成しますが、値がバージョン4のUUIDであることを明示します。
* [`Uuid.generateV7()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/-companion/generate-v7.html) 関数は、UUIDのソートに使用できるタイムスタンプ付きのバージョン7 UUIDを生成します。
* [`Uuid.generateV7NonMonotonicAt()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/-companion/generate-v7-non-monotonic-at.html) 関数は、特定の時点に対するバージョン7 UUIDを生成します。

これらのUUID生成関数は試験的（Experimental）です。
オプトインするには、`@OptIn(ExperimentalUuidApi::class)` アノテーションを使用するか、ビルドファイルに以下のコンパイラオプションを追加します。

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-opt-in=kotlin.uuid.ExperimentalUuidApi")
    }
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-opt-in=kotlin.uuid.ExperimentalUuidApi</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

以下は、特定のバージョンのUUIDを生成する例です。

```kotlin
import kotlin.time.Instant
import kotlin.time.ExperimentalTime
import kotlin.uuid.Uuid

@OptIn(kotlin.uuid.ExperimentalUuidApi::class, ExperimentalTime::class)
fun main() {
    // バージョン4のUUIDを生成
    val idVersion4 = Uuid.generateV4()
    println(idVersion4)

    // バージョン7のUUIDを生成
    val idVersion7 = Uuid.generateV7()
    println(idVersion7)

    // 指定されたタイムスタンプのバージョン7 UUIDを生成
    val timestamp = Instant.fromEpochMilliseconds(1757440583000L)
    val idVersion7SpecificTime = Uuid.generateV7NonMonotonicAt(timestamp)
    println(idVersion7SpecificTime)
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.3"}

## UUIDのパース {id="parse-uuids"}

UUID値は、URLパラメータやデータベースレコードなど、多くの場合文字列として表現されます。

`String` 値を `Uuid` 値に変換するには、[`Uuid.parse()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/-companion/parse.html) 関数を使用します。

```kotlin
import kotlin.uuid.Uuid

fun main() {
//sampleStart
    val id = Uuid.parse("de2bc56c-ea73-4f3c-8a37-5a46fdb2d79a")
    println(id)
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0"}

`Uuid.parse()` 関数は、標準的なハイフン区切りの16進形式と、ハイフンのない16進形式の両方を受け入れます。

入力が無効な場合、`Uuid.parse()` 関数は `IllegalArgumentException` をスローします。

```kotlin
import kotlin.uuid.Uuid

fun main() { 
//sampleStart    
    val id = Uuid.parse("10")
    println(id)
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0"}

アプリケーションがどちらか一方の表現形式しか受け入れない場合は、フォーマット固有の関数を使用します。

* ハイフン区切りの16進文字列表現には [`Uuid.parseHexDash()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/-companion/parse-hex-dash.html)
* ハイフンなしの16進文字列表現には [`Uuid.parseHex()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/-companion/parse-hex.html)

例えば：

```kotlin
import kotlin.uuid.Uuid

fun main() {
//sampleStart  
    val standard = Uuid.parseHexDash("de2bc56c-ea73-4f3c-8a37-5a46fdb2d79a")
    val compact = Uuid.parseHex("de2bc56cea734f3c8a375a46fdb2d79a")
    
    println(standard)
    println(compact)
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.3"}

外部ソースからのUUIDがあり、無効な入力を安全に処理する必要がある場合は、[`Uuid.parseOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/-companion/parse-or-null.html)、[`Uuid.parseHexDashOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/-companion/parse-hex-dash-or-null.html)、または [`Uuid.parseHexOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/-companion/parse-hex-or-null.html) を使用します。これらの関数は入力が無効な場合に `null` を返します。

```kotlin
fun parseId(input: String): Uuid? { 
    return Uuid.parseOrNull(input) 
}
```

## UUIDから文字列への変換 {id="convert-uuids-to-strings"}

以下の関数を使用して、`Uuid` 値を `String` 値に変換できます。

* 標準的な文字列表現には [`toString()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/to-string.html)
* ハイフン区切りの16進形式には [`toHexDashString()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/to-hex-dash-string.html)
* ハイフンなしの16進形式には [`toHexString()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/to-hex-string.html)

例えば：

```kotlin
import kotlin.uuid.Uuid

fun main() {
//sampleStart    
    val id = Uuid.parse("de2bc56c-ea73-4f3c-8a37-5a46fdb2d79a")
    
    println(id.toString())
    // de2bc56c-ea73-4f3c-8a37-5a46fdb2d79a
    println(id.toHexDashString())
    // de2bc56c-ea73-4f3c-8a37-5a46fdb2d79a
    println(id.toHexString())
    // de2bc56cea734f3c8a375a46fdb2d79a 
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.3"}

## UUIDの比較 {id="compare-uuids"}

`==` 演算子を使用して、`Uuid` 値が等しいかどうかを確認できます。

Kotlinは文字列表現ではなく、UUIDの値に基づいて値を比較します。例えば、異なる形式の2つの値であっても、同じ128ビットの値を表していれば等しいとみなされます。

```kotlin
import kotlin.uuid.Uuid

fun main() {
//sampleStart    
    val first = Uuid.parse("de2bc56c-ea73-4f3c-8a37-5a46fdb2d79a")
    val second = Uuid.parse("de2bc56cea734f3c8a375a46fdb2d79a")

    println(first == second) 
    // true 
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.3"}

これにより、異なる形式の同じ値を異なる値として扱ってしまう文字列の比較に比べて、`Uuid` の比較はより信頼性が高くなります。`Uuid` の比較は実際の識別子の値をチェックします。

`Uuid` は `Comparable<Uuid>` インターフェースを実装しているため、`sorted()` などの標準的なコレクション関数でUUID値をソートできます。その際、Kotlinは値を辞書順（最上位ビットから最下位ビットへ）に比較します。

```kotlin
import kotlin.uuid.Uuid

fun main() {
//sampleStart    
    val first = Uuid.generateV7()
    val second = Uuid.generateV7()

    val sorted = listOf(first, second).sorted()
    println(sorted) 
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.3"}

## バイナリ表現の操作 {id="work-with-binary-representations"}

一部のAPI、ストレージ形式、バイナリプロトコルでは、UUIDを文字列として表現しません。
代わりに、128ビットのUUID値を以下のいずれかとして保存します。

* 16バイトの配列 
* 2つの64ビット値

バイナリUUIDデータを想定しているシステムとUUIDをやり取りする必要がある場合は、これらの表現を使用します。

UUIDと16バイト表現の間で変換を行うには、[`.toByteArray()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/to-byte-array.html) および [`Uuid.fromByteArray()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/-companion/from-byte-array.html) 関数を使用します。

```kotlin
import kotlin.uuid.Uuid

fun main() {
//sampleStart 
    val id = Uuid.random()

    val bytes = id.toByteArray()
    val original = Uuid.fromByteArray(bytes)
  
    println(id)
    
    println(bytes)
    println(original)

    println(id == original) 
    // true
//sampleEnd  
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0"}

同じ128ビットのUUID値を2つの `Long` 値として表すこともできます。Kotlinには組み込みの128ビット整数型が提供されていないため、これは有用です。2つの `Long` 値はUUIDを2つのパートに分けて保持します。

* UUIDの前半64ビットを表す `mostSignificantBits` パラメータ
* UUIDの後半64ビットを表す `leastSignificantBits` パラメータ

2つの `Long` 値から `Uuid` 値を作成するには、[`Uuid.fromLongs()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/-companion/from-longs.html) 関数を使用します。

```kotlin
import kotlin.uuid.Uuid

fun main() {
//sampleStart 
    val id = Uuid.fromLongs(
        mostSignificantBits = -4653685776373167443,
        leastSignificantBits = -6288180676521310383.toLong()
    )
    println(id) 
    // bf6ac971-52fd-4aad-a8bb-e4fdac78c751
//sampleEnd  
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0"}

既存の `Uuid` 値から2つのパートを抽出するには、[`Uuid.toLongs()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/to-longs.html) 関数を使用します。

```kotlin
import kotlin.uuid.Uuid

fun main() {
//sampleStart 
    val id = Uuid.random()
    
    id.toLongs { mostSignificantBits, leastSignificantBits ->
        println(mostSignificantBits)
        println(leastSignificantBits)
    }
//sampleEnd  
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0"}

## UUIDのシリアライズ {id="serialize-uuids"}

Kotlinは `Uuid` 値のシリアライズをサポートしています。
JSON APIや設定ファイルなど、Kotlinコードの外部でUUID値を保存または転送するためにこれを使用します。

アプリケーションが別のフォーマットを要求しない限り、`Uuid` 値をシリアライズするには文字列として表現します。
[`kotlinx.serialization`](https://kotlinlang.org/docs/serialization.html) ライブラリはハイフン区切りの16進形式を使用します。

```kotlin
//sampleStart 
import kotlin.uuid.Uuid
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

@Serializable
data class User(
    val id: Uuid,
    val name: String
)

fun main() {
    val user = User(
        id = Uuid.parse("de2bc56cea734f3c8a375a46fdb2d79a"),
        name = "Kotlin"
    )

    println(Json.encodeToString(user))
    // {"id":"de2bc56c-ea73-4f3c-8a37-5a46fdb2d79a","name":"Kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.3"}

## Java APIでのUUIDの使用 {id="use-uuids-with-java-apis"}

JavaではUUIDを表すために `java.util.UUID` クラスを使用します。JVM上では、Java APIがこの型を受け取ったり返したりする場合があります。`java.util.UUID` と `kotlin.uuid.Uuid` はどちらもUUIDを表しますが、異なる2つの型です。

KotlinとJavaの間でUUIDをやり取りするには、値を明示的に変換します。

* JavaのUUIDをKotlinに変換するには、[`.toKotlinUuid()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/to-kotlin-uuid.html) 拡張関数を使用します。

  ```kotlin
  import kotlin.uuid.toKotlinUuid
  
  val kotlinId: Uuid = javaId.toKotlinUuid()
  ```

* KotlinのUUIDをJavaに変換するには、[`.toJavaUuid()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/to-java-uuid.html) 拡張関数を使用します。

  ```kotlin
  import kotlin.uuid.toJavaUuid
  
  val javaId: java.util.UUID = kotlinId.toJavaUuid()
  ```

これらの関数を使用することで、JVM相互運用の境界でUUID値を `Uuid` を使って表現できるようになります。

> `java.util.UUID` と `kotlin.uuid.Uuid` クラスはいずれも比較可能（comparable）ですが、順序付けが異なる場合があります。
> Java APIからKotlin APIに移行する前に、UUIDの順序に依存しているコードを必ず確認してください。
>
{style="note"}

KotlinはJavaバッファの操作もサポートしています。
`ByteBuffer` 内のUUIDを扱うには、JVM固有の関数を使用します。

* バッファからUUIDを読み取るには、[`.getUuid()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/get-uuid.html) 関数を使用します。
* バッファにUUIDを書き込むには、[`.putUuid()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/put-uuid.html) 関数を使用します。