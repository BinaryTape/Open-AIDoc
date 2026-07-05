[//]: # (title: 程式庫作者的向後相容性指引)

建立程式庫最常見的動機是將功能公開給更廣泛的社群。
這個社群可能是一個團隊、一家公司、一個特定的產業或一個技術平台。
在任何情況下，向後相容性都是一個重要的考量因素。
社群越廣泛，向後相容性就越重要，因為你對使用者是誰以及他們在什麼約束下工作了解較少。

向後相容性不是一個單一術語，可以在二進制、原始碼和行為層級上定義。
本節提供了有關這些類型的更多資訊。

請注意：

* 有可能在不破壞原始碼相容性的情況下破壞二進制相容性，反之亦然。
* 保證原始碼相容性是理想的，但非常困難。身為程式庫作者，你必須考慮程式庫的使用者叫用或具現化函式或型別的每一種可能方式。
原始碼相容性通常是一個願景，而非承諾。

本節的其餘部分介紹了你可以採取的行動，以及可以用來協助確保不同類型相容性的工具。

## 相容性類型 {initial-collapse-state="collapsed" collapsible="true"}

**二進制相容性**意味著程式庫的新版本可以替換先前編譯的程式庫版本。
任何針對程式庫的先前版本編譯的軟體都應繼續正確執行。

> 若要進一步了解二進制相容性，請參閱 [二進制相容性驗證器的 README](https://github.com/Kotlin/binary-compatibility-validator?tab=readme-ov-file#what-makes-an-incompatible-change-to-the-public-binary-api) 或 [Evolving Java-based APIs](https://github.com/eclipse-platform/eclipse.platform/blob/master/docs/Evolving-Java-based-APIs-2.md) 文件。
>
{style="tip"}

**原始碼相容性**意味著程式庫的新版本可以在不修改任何使用該程式庫的原始碼的情況下替換舊版本。然而，編譯此用戶端程式碼的輸出可能不再與編譯該程式庫的輸出相容，因此必須針對新版本的程式庫重新組建用戶端程式碼以保證相容性。

**行為相容性**意味著程式庫的新版本不會修改現有功能（修復錯誤除外）。涉及相同的特性，且它們具有相同的語意。

## 使用二進制相容性驗證器

JetBrains 提供了一個 [二進制相容性驗證器](https://github.com/Kotlin/binary-compatibility-validator) 工具，可用於確保 API 不同版本之間的二進制相容性。

此工具實作為一個 Gradle 外掛程式，它會為你的組建新增兩個任務：

* `apiDump` 任務會建立一個人類可讀的 `.api` 檔案來描述你的 API。
* `apiCheck` 任務會將儲存的 API 描述與目前組建中編譯的類別進行比較。

`apiCheck` 任務在組建期間由標準的 Gradle `check` 任務叫用。
當相容性被破壞時，組建會失敗。此時，你應該手動執行 `apiDump` 任務並比較新舊版本之間的差異。
如果你對變更感到滿意，可以更新位於版本控制系統中的現有 `.api` 檔案。

該驗證器對多平台程式庫產生的 [KLib 驗證具有實驗性支援](https://github.com/Kotlin/binary-compatibility-validator?tab=readme-ov-file#experimental-klib-abi-validation-support)。

### Kotlin Gradle 外掛程式中的二進制相容性驗證

<primary-label ref="experimental-general"/>

從 2.2.0 版本開始，Kotlin Gradle 外掛程式支援二進制相容性驗證。欲了解更多資訊，請參閱 [Kotlin Gradle 外掛程式中的二進制相容性驗證](gradle-binary-compatibility-validation.md)。

## 明確指定傳回型別

正如 [Kotlin 編碼準則](coding-conventions.md#coding-conventions-for-libraries) 中所討論的，你應始終在 API 中明確指定函式傳回型別和屬性型別。另請參閱有關 [顯式 API 模式](api-guidelines-simplicity.md#use-explicit-api-mode) 的章節。

考慮以下範例，程式庫作者建立了一個 `JsonDeserializer`，並為了方便起見，使用擴充方法將其與 `Int` 型別關聯：

```kotlin
class JsonDeserializer<T>(private val fromJson: (String) -> T) {
    fun deserialize(input: String): T {
        ...
    }
}

fun Int.defaultDeserializer() = JsonDeserializer { ... }
```

假設作者將此實作替換為 `JsonOrXmlDeserializer`：

```kotlin
class JsonOrXmlDeserializer<T>(
    private val fromJson: (String) -> T,
    private val fromXML: (String) -> T
) {
    fun deserialize(input: String): T {
        ...
    }
}

fun Int.defaultDeserializer() = JsonOrXmlDeserializer({ ... }, { ... })
```

現有功能將繼續運作，並增加了反序列化 XML 的能力。然而，這破壞了二進制相容性。

## 避免向現有 API 函式新增引數

向公用 API 新增非預設引數會破壞二進制和原始碼相容性，因為使用者在叫用時需要比以前提供更多的資訊。然而，即使是新增 [預設引數](functions.md#parameters-with-default-values) 也會破壞相容性。

例如，假設你在 `lib.kt` 中有以下函式：

```kotlin
fun fib() = … // 傳回零
```

以及在 `client.kt` 中的以下函式：

```kotlin
fun main() {
    println(fib()) // 列印零
}
```
在 JVM 上編譯這兩個檔案將產生輸出 `LibKt.class` 和 `ClientKt.class`。

假設你重新實作並編譯 `fib` 函式以表示費氏數列，使得 `fib(3)` 傳回 2，`fib(4)` 傳回 3，依此類推。你新增了一個參數，但給它一個預設值零以保留現有行為：

```kotlin
fun fib(input: Int = 0) = … // 傳回費氏數列成員
```

現在你需要重新編譯 `lib.kt` 檔案。你可能預期 `client.kt` 檔案不需要重新編譯，並且關聯的類別檔案可以按如下方式叫用：

```shell
$ kotlin ClientKt.class
```

但如果你嘗試這樣做，會發生 `NoSuchMethodError`：

```text
Exception in thread "main" java.lang.NoSuchMethodError: 'int LibKt.fib()'
       at LibKt.main(fib.kt:2)
       at LibKt.main(fib.kt)
       …
```

這是因為 Kotlin/JVM 編譯器產生的位元組碼中方法的簽章發生了變化，破壞了二進制相容性。

然而，原始碼相容性得到了保留。如果你重新編譯這兩個檔案，程式將像以前一樣執行。

### 使用多載以保留二進制相容性 {initial-collapse-state="collapsed" collapsible="true"}

向已發布的 API 新增選填參數時，你可以使用 [實驗性](components-stability.md#stability-levels-explained) 的 [`@IntroducedAt`](java-to-kotlin-interop.md#overloads-generation) 註解來保留二進制相容性。

在每個新的選填參數上新增該註解，並註明其引入的版本。例如：

```kotlin
@OptIn(ExperimentalVersionOverloading::class)
fun fib(@IntroducedAt("1.1") input: Int = 0) = …
```

編譯器會使用此資訊來產生對應的隱藏多載。

在為 JVM 編寫 Kotlin 程式碼時，你也可以在具有預設引數的函式上使用 [`@JvmOverloads`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-overloads/) 註解來產生多載。

> `@JvmOverloads` 註解不會為 Kotlin 呼叫端保留二進制相容性。
> 相反地，在變更已發布的 API 時，請使用 `@IntroducedAt` 註解或手動新增多載。
>
{style="warning"}

你也可以手動建立多載，而不是使用單個具有預設引數的函式。
例如，如果你想讓 `fib()` 函式接受一個 `Int` 參數，請建立一個單獨的多載：

```kotlin
fun fib() = … 
fun fib(input: Int) = …
```

## 避免加寬或縮窄傳回型別

在演進 API 時，通常會想要加寬或縮窄函式的傳回型別。例如，在 API 的未來版本中，你可能希望將傳回型別從 `List` 切換為 `Collection` 或從 `Collection` 切換為 `List`。

你可能希望將型別縮窄為 `List` 以滿足使用者對索引支援的需求。相反，你可能希望將型別加寬為 `Collection`，因為你意識到正在處理的資料沒有自然順序。

顯而易見，加寬傳回型別會破壞相容性。例如，從 `List` 轉換為 `Collection` 會破壞所有使用索引的程式碼。

你可能認為縮窄傳回型別（例如從 `Collection` 縮窄到 `List`）會保留相容性。不幸的是，雖然原始碼相容性得到了保留，但二進制相容性卻被破壞了。

假設你在 `Library.kt` 檔案中中有一個示範函式：

```kotlin
public fun demo(): Number = 3
```

以及在 `Client.kt` 中該函式的用戶端：

```kotlin
fun main() {
    println(demo()) // 列印 3
}
```

讓我們想像一個場景，你更改了 demo 的傳回型別並僅重新編譯 `Library.kt`：

```kotlin
fun demo(): Int = 3
```

當你重新執行用戶端時，會發生以下錯誤（在 JVM 上）：

```text
Exception in thread "main" java.lang.NoSuchMethodError: 'java.lang.Number Library.demo()'
        at ClientKt.main(call.kt:2)
        at ClientKt.main(call.kt)
        …
```

發生這種情況是因為從 `main` 方法產生的位元組碼中有以下指令：

```text
0: invokestatic  #12 // Method Library.demo:()Ljava/lang/Number;
```

JVM 正在嘗試叫用一個名為 demo 且傳回 `Number` 的 static 方法。然而，由於此方法已不再存在，你破壞了二進制相容性。

## 避免在 API 中使用資料類別

在一般開發中，資料類別的優勢在於為你產生的額外函式。在 API 設計中，這種優勢變成了弱點。

例如，假設你在 API 中使用以下資料類別：

```kotlin
data class User(
    val name: String,
    val email: String
)
```

稍後，你可能想要新增一個名為 `active` 的屬性：

```kotlin
data class User(
    val name: String,
    val email: String,
    val active: Boolean = true
)
```

這將以兩種方式破壞二進制相容性。首先，產生的建構函式將具有不同的簽章。此外，產生的 `copy` 方法簽章也會發生變化。

原始簽章（在 Kotlin/JVM 上）將是：

```text
public final User copy(java.lang.String, java.lang.String)
```

新增 `active` 屬性後，簽章變為：

```text
public final User copy(java.lang.String, java.lang.String, boolean)
```

與建構函式一樣，這破壞了二進制相容性。

可以透過手動編寫次要建構函式並覆寫 `copy` 方法來解決這些問題。然而，所涉及的努力抵消了使用資料類別的便利性。

資料類別的另一個問題是，更改建構函式引數的順序會影響產生的 `componentX` 方法，這些方法用於解構。即使它不破壞二進制相容性，更改順序也絕對會破壞行為相容性。

## 避免更改註解目標

當你公開一個註解時，避免在發布程式庫後更改其允許的目標。更改目標可能會影響使用者重新編譯現有程式碼時套用相同註解的方式。

例如，如果一個註解僅宣告了 `AnnotationTarget.FIELD`，則對屬性使用不具限定符的註解會套用於其支援欄位：

```kotlin
@Target(AnnotationTarget.FIELD)
annotation class Example

class User {
    @Example
    val name: String = ""
}
```

如果你稍後新增了 `AnnotationTarget.PROPERTY`，則相同的不具限定符註解會改為套用於屬性：

```kotlin
@Target(AnnotationTarget.PROPERTY, AnnotationTarget.FIELD)
annotation class Example

class User {
    @Example
    val name: String = ""
}
```

發生這種情況是因為 [Kotlin 編譯器會優先選擇 `property` 目標而非 `field` 目標](annotations.md#defaults-when-no-use-site-targets-are-specified)。僅當 `property` 不適用時才會使用 `field` 目標。

這可能會破壞預期在特定產生的元素上使用註解的工具和框架的相容性。特別是，`property` 目標對 Java 是不可見的。如果 Java 反射或 Java 註解處理器需要在支援欄位上尋找註解，使用者必須明確指定 `field` 使用位置目標：

```kotlin
class User {
    @field:Example
    val name: String = ""
}
```

## 使用 PublishedApi 註解的考量因素

Kotlin 允許內聯函式成為程式庫 API 的一部分。對這些函式的呼叫將內聯到使用者編寫的用戶端程式碼中。這可能會引入相容性問題，因此不允許這些函式呼叫非公用 API 宣告。

如果你需要從內聯的公用函式呼叫程式庫的內部 API，可以透過使用 [`@PublishedApi`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-published-api/) 對其進行標記來實現。這使得內部宣告實際上變成公用的，因為對它的引用將最終出現在編譯後的用戶端程式碼中。因此，在對其進行更改時，必須將其視為與公用宣告相同，因為這些更改可能會影響二進制相容性。

## 務實地演進 API

有時你需要隨時間推移透過移除或更改現有宣告來對程式庫的 API 進行重大變更。在本節中，我們將討論如何務實地處理此類情況。

當使用者升級到程式庫的較新版本時，他們不應在專案原始碼中出現對程式庫 API 的未解決引用。與其立即從程式庫的公用 API 中移除某些內容，不如遵循棄用週期。這樣，你就可以讓使用者有時間遷移到替代方案。

在舊宣告上使用 [`@Deprecated`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-deprecated/) 註解以表示它正被替換。此註解的參數提供了有關棄用的重要細節：

* `message` 應說明更改了什麼以及原因。
* 應盡可能使用 `replaceWith` 參數來提供到新 API 的自動遷移。
* 應使用棄用級別來逐步棄用 API。欲了解更多資訊，請參閱 [Kotlin 文件中的棄用頁面](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-deprecated/)。

通常，棄用應首先產生警告，然後是錯誤，最後隱藏宣告。此過程應跨越多個次要版本發生，讓使用者有時間在他們的專案中進行任何必要的更改。重大變更（例如移除 API）應僅在主要版本中發生。程式庫可以採用不同的版本控制和棄用策略，但必須將其傳達給使用者以建立正確的預期。

你可以在 [Kotlin 演進原則文件](kotlin-evolution-principles.md#libraries) 或 KotlinConf 2023 中由 Leonid Startsev 主講的 [Evolving your Kotlin API painlessly for clients 演講](https://www.youtube.com/watch?v=cCgXtpVPO-o&t=1468s) 中了解更多資訊。

## 使用 RequiresOptIn 機制 

Kotlin 標準庫 [提供了選擇加入機制](opt-in-requirements.md)，要求使用者在呼叫 API 的一部分之前提供明確同意。這是基於建立標記註解，這些註解本身標記有 [`@RequiresOptIn`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-requires-opt-in/)。你應該使用此機制來管理有關原始碼和行為相容性的預期，尤其是在向程式庫引入新 API 時。

如果你選擇使用此機制，我們建議遵循以下最佳實務：

* 使用選擇加入機制為 API 的不同部分提供不同的保證。例如，你可以將特性標記為 _Preview_、_Experimental_ 和 _Delicate_。每個類別都應在文件和 [KDoc 註解](kotlin-doc.md) 中明確說明，並附帶適當的警告訊息。
* If your library uses an experimental API, [將註解傳播](opt-in-requirements.md#propagate-opt-in-requirements) 給你自己的使用者。這可確保你的使用者意識到你擁有仍在演進中的相依性。
* 避免使用選擇加入機制來棄用程式庫中已存在的宣告。請改用 `@Deprecated`，如 [務實地演進 API](#evolve-apis-pragmatically) 一節所述。

## 下一步

如果你還沒有看過，請考慮查看這些頁面：

* 在 [盡量減少心智複雜度](api-guidelines-minimizing-mental-complexity.md) 頁面中探索最小化心智複雜度的策略。
* 有關有效文件實踐的廣泛概覽，請參閱 [資訊豐富的文件](api-guidelines-informative-documentation.md)。