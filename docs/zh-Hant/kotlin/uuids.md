[//]: # (title: UUID)
<web-summary>了解如何在 Kotlin 中使用 UUID，包括在多平台和 JVM 程式碼中建立、剖析、格式化、序列化以及處理 UUID 值。</web-summary>

[`Uuid`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/)
類別代表通用唯一辨識碼（Universally Unique Identifier，UUID），
也稱為全域唯一識別碼（Globally Unique Identifier，GUID）。

`Uuid` 是一個 128 位元的值，用於唯一識別實體，而無需依賴指派 ID 的中心系統。這使得 UUID 在分散式應用程式、資料庫、客戶端產生的記錄或 [Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform/get-started.html) 應用程式中非常有用。

請使用 `Uuid` 類別來處理 UUID 值。與純字串不同，專用的 UUID 型別能讓你的程式碼更加明確，並防止意外使用無效值。

要在專案中使用 UUID，請從 `kotlin.uuid` 套件匯入 `Uuid` 類別：

```kotlin
import kotlin.uuid.Uuid
```

## 產生 UUID {id="generate-uuids"}

若要為一般識別碼（例如使用者或資料庫 ID）產生隨機的版本 4 UUID，請使用 [`Uuid.random()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/-companion/random.html) 函式：

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

你也可以使用以下[實驗性（Experimental）](components-stability.md#stability-levels-explained)函式來產生特定版本的 UUID：

* [`Uuid.generateV4()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/-companion/generate-v4.html) 函式產生的 UUID 型別與 `Uuid.random()` 函式相同，但明確宣告該值為版本 4 UUID。
* [`Uuid.generateV7()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/-companion/generate-v7.html) 函式會產生帶有時間戳記的版本 7 UUID，可用於 UUID 排序。
* [`Uuid.generateV7NonMonotonicAt()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/-companion/generate-v7-non-monotonic-at.html) 函式會針對特定時間點產生版本 7 UUID。

這些 UUID 產生函式目前處於實驗性階段。
若要選擇加入（opt-in），請使用 `@OptIn(ExperimentalUuidApi::class)` 註解，或在建置檔中新增以下編譯器選項：

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

以下是產生特定版本 UUID 的範例：

```kotlin
import kotlin.time.Instant
import kotlin.time.ExperimentalTime
import kotlin.uuid.Uuid

@OptIn(kotlin.uuid.ExperimentalUuidApi::class, ExperimentalTime::class)
fun main() {
    // 產生版本 4 UUID
    val idVersion4 = Uuid.generateV4()
    println(idVersion4)

    // 產生版本 7 UUID
    val idVersion7 = Uuid.generateV7()
    println(idVersion7)

    // 為指定的時間戳記產生版本 7 UUID
    val timestamp = Instant.fromEpochMilliseconds(1757440583000L)
    val idVersion7SpecificTime = Uuid.generateV7NonMonotonicAt(timestamp)
    println(idVersion7SpecificTime)
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.3"}

## 剖析 UUID {id="parse-uuids"}

UUID 值通常表示為字串，
例如在 URL 參數或資料庫記錄中。

若要將 `String` 值轉換為 `Uuid` 值，
請使用 [`Uuid.parse()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/-companion/parse.html) 函式：

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

`Uuid.parse()` 函式同時接受標準的十六進位加破折號（hex-and-dash）格式，以及不含破折號的十六進位格式。

如果輸入無效，`Uuid.parse()` 函式會擲出 `IllegalArgumentException`：

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

如果你的應用程式僅接受其中一種表示法，請使用專屬格式的函式：

* [`Uuid.parseHexDash()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/-companion/parse-hex-dash.html) 用於十六進位加破折號的字串表示法。
* [`Uuid.parseHex()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/-companion/parse-hex.html) 用於不含破折號的十六進位字串表示法。

例如：

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

如果你從外部來源獲取 UUID，且必須安全地處理無效輸入，請使用 [`Uuid.parseOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/-companion/parse-or-null.html)、[`Uuid.parseHexDashOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/-companion/parse-hex-dash-or-null.html) 或 [`Uuid.parseHexOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/-companion/parse-hex-or-null.html)。
如果輸入無效，這些函式將回傳 `null`：

```kotlin
fun parseId(input: String): Uuid? { 
    return Uuid.parseOrNull(input) 
}
```

## 將 UUID 轉換為字串 {id="convert-uuids-to-strings"}

你可以使用以下函式將 `Uuid` 值轉換為 `String` 值：

* [`toString()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/to-string.html) 用於標準字串表示法
* [`toHexDashString()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/to-hex-dash-string.html) 用於十六進位加破折號格式
* [`toHexString()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/to-hex-string.html) 用於不含破折號的十六進位格式

例如：

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

## 比較 UUID {id="compare-uuids"}

你可以使用 `==` 運算子檢查 `Uuid` 值是否相等。

Kotlin 是根據 UUID 的數值而非文字表示法來比較。
例如，兩個不同格式的值如果代表相同的 128 位元數值，則它們是相等的：

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

這使得 `Uuid` 比較比字串比較更可靠，因為字串比較會將不同格式的相同值視為不同值。
`Uuid` 比較則是檢查實際的識別碼值。

`Uuid` 實作了 `Comparable<Uuid>` 介面，因此可以使用標準集合函式（例如 `sorted()`）對 UUID 值進行排序。在這種情況下，
Kotlin 會依字典序（從最高有效位元到最低有效位元）比較數值：

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

## 處理二進位表示法 {id="work-with-binary-representations"}

某些 API、儲存格式與二進位協定不會將 UUID 表示為字串。
相反地，它們會將 128 位元的 UUID 值儲存為以下形式之一：

* 16 位元組陣列
* 兩個 64 位元值

當你需要與預期接收二進位 UUID 資料的系統交換 UUID 時，請使用這些表示法。

若要在 UUID 與 16 位元組表示法之間進行轉換，請使用 [`.toByteArray()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/to-byte-array.html) 和 [`Uuid.fromByteArray()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/-companion/from-byte-array.html) 函式：

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

你也可以將相同的 128 位元 UUID 值表示為兩個 `Long` 值。
這非常實用，因為 Kotlin 沒有提供內建的 128 位元整數型別。
這兩個 `Long` 值將 UUID 分為兩個部分儲存：

* `mostSignificantBits` 參數用於 UUID 的前 64 位元。
* `leastSignificantBits` 參數用於 UUID 的後 64 位元。

若要從兩個 `Long` 值建立 `Uuid` 值，請使用 [`Uuid.fromLongs()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/-companion/from-longs.html) 函式：

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

若要從現有的 `Uuid` 值中擷取這兩個部分，請使用 [`Uuid.toLongs()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/to-longs.html) 函式：

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

## 序列化 UUID {id="serialize-uuids"}

Kotlin 支援 `Uuid` 值的序列化。
可用於在 Kotlin 程式碼外部儲存或傳輸 UUID 值，例如在 JSON API 或設定檔中。

若要序列化 `Uuid` 值，除非應用程式需要其他格式，否則請將其表示為字串。
[`kotlinx.serialization`](https://kotlinlang.org/docs/serialization.html) 程式庫使用十六進位加破折號格式：

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

## 搭配 Java API 使用 UUID {id="use-uuids-with-java-apis"}

Java 使用 `java.util.UUID` 類別來表示 UUID。在 JVM 上，Java API 可能會接受或回傳此型別。雖然 `java.util.UUID` 和 `kotlin.uuid.Uuid` 都代表 UUID，但它們是兩種不同的型別。

在 Kotlin 與 Java 之間傳遞 UUID 時，請明確轉換數值：

* 使用 [`.toKotlinUuid()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/to-kotlin-uuid.html) 擴充函式將 Java UUID 轉換為 Kotlin：

  ```kotlin
  import kotlin.uuid.toKotlinUuid
  
  val kotlinId: Uuid = javaId.toKotlinUuid()
  ```

* 使用 [`.toJavaUuid()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/to-java-uuid.html) 擴充函式將 Kotlin UUID 轉換為 Java：

  ```kotlin
  import kotlin.uuid.toJavaUuid
  
  val javaId: java.util.UUID = kotlinId.toJavaUuid()
  ```

這些函式允許你在 JVM 互通性邊界上使用 `Uuid` 來表示 UUID 值。

> `java.util.UUID` 與 `kotlin.uuid.Uuid` 類別皆可比較，但排序方式可能有所不同。
> 從 Java API 遷移至 Kotlin API 之前，請務必檢查依賴 UUID 排序的程式碼。
>
{style="note"}

Kotlin 還提供了對 Java 緩衝區（buffer）的支援。
在 `ByteBuffer` 中使用 JVM 專屬函式來處理 UUID：

* 使用 [`.getUuid()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/get-uuid.html) 函式從緩衝區讀取 UUID。
* 使用 [`.putUuid()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/put-uuid.html) 函式將 UUID 寫入緩衝區。