[//]: # (title: Kotlin 1.7.20 有什麼新功能)

<web-summary>閱讀 Kotlin 1.7.20 版本發佈說明，涵蓋新的語言特性、Kotlin Multiplatform、JVM、Native、JS 的更新，以及對 Gradle 與 Maven 建置工具的支援。</web-summary>

<tldr>
   <p>Kotlin 1.7.20 的 IDE 支援已適用於 IntelliJ IDEA 2021.3、2022.1 和 2022.2。</p>
</tldr>

_[發佈日期：2022 年 9 月 29 日](releases.md#release-history)_

Kotlin 1.7.20 版本現已正式發佈！以下是此版本的一些亮點：

* [新的 Kotlin K2 編譯器支援 `all-open`、帶接收者的 SAM、Lombok 以及其他編譯器外掛程式](#support-for-kotlin-k2-compiler-plugins)
* [我們引入了用於建立開放式範圍（Open-ended ranges）的 `..<` 運算子預覽](#preview-of-the-operator-for-creating-open-ended-ranges)
* [新的 Kotlin/Native 記憶體管理員現在預設啟用](#the-new-kotlin-native-memory-manager-enabled-by-default)
* [我們為 JVM 引入了一項新的實驗性功能：具有泛型基礎型別的內嵌類別（inline classes）](#generic-inline-classes)

您也可以在此影片中找到變更內容的簡短概述：

<video src="https://www.youtube.com/v/OG9npowJgE8" title="Kotlin 1.7.20 有什麼新功能"/>

> 有關 Kotlin 版本週期的資訊，請參閱 [Kotlin 發佈流程](releases.md)。
>
{style="tip"}

## 支援 Kotlin K2 編譯器外掛程式

Kotlin 團隊持續穩定 K2 編譯器。
K2 目前仍處於 **Alpha** 階段（如 [Kotlin 1.7.0 版本發佈](whatsnew17.md#new-kotlin-k2-compiler-for-the-jvm-in-alpha)中所宣佈），
但它現在已支援數個編譯器外掛程式。您可以追蹤[此 YouTrack 問題](https://youtrack.jetbrains.com/issue/KT-52604)
以獲取 Kotlin 團隊關於新編譯器的最新動態。

從 1.7.20 版本開始，Kotlin K2 編譯器支援以下外掛程式：

* [`all-open`](all-open-plugin.md)
* [`no-arg`](no-arg-plugin.md)
* [帶接收者的 SAM (SAM with receiver)](sam-with-receiver-plugin.md)
* [Lombok](lombok.md)
* AtomicFU
* `jvm-abi-gen`

> 新 K2 編譯器的 Alpha 版本僅適用於 JVM 專案。
> 它不支援 Kotlin/JS、Kotlin/Native 或其他多平台專案。
>
{style="warning"}

在以下影片中進一步了解新編譯器及其優勢：
* [邁向新 Kotlin 編譯器之路 (The Road to the New Kotlin Compiler)](https://www.youtube.com/watch?v=iTdJJq_LyoY)
* [K2 編譯器：由上而下的檢視 (K2 Compiler: a Top-Down View)](https://www.youtube.com/watch?v=db19VFLZqJM)

### 如何啟用 Kotlin K2 編譯器

要啟用 Kotlin K2 編譯器並進行測試，請使用以下編譯器選項：

```bash
-Xuse-k2
```

您可以在 `build.gradle(.kts)` 檔案中指定它：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.withType<KotlinCompile> {
    kotlinOptions.useK2 = true
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
compileKotlin {
    kotlinOptions.useK2 = true
}
```
</tab>
</tabs>

查看您的 JVM 專案效能提升，並將其與舊編譯器的結果進行比較。

### 留下您對新 K2 編譯器的回饋

我們非常感謝您以任何形式提供回饋：
* 在 Kotlin Slack 中直接向 K2 開發人員提供您的回饋：[獲取邀請](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up?_gl=1*ju6cbn*_ga*MTA3MTk5NDkzMC4xNjQ2MDY3MDU4*_ga_9J976DJZ68*MTY1ODMzNzA3OS4xMDAuMS4xNjU4MzQwODEwLjYw)並加入 [#k2-early-adopters](https://kotlinlang.slack.com/archives/C03PK0PE257) 頻道。
* 將您在使用新 K2 編譯器時遇到的任何問題回報至[我們的問題追蹤器](https://kotl.in/issue)。
* [啟用 **傳送使用情況統計資料** 選項](https://www.jetbrains.com/help/idea/settings-usage-statistics.html)以允許 JetBrains 收集有關 K2 使用情況的匿名數據。

## 語言

Kotlin 1.7.20 引入了新語言特性的預覽版本，並對建置器型別推論（builder type inference）施加了限制：

* [用於建立開放式範圍的 ..< 運算子預覽](#preview-of-the-operator-for-creating-open-ended-ranges)
* [新的 data object 宣告](#improved-string-representations-for-singletons-and-sealed-class-hierarchies-with-data-objects)
* [建置器型別推論限制](#new-builder-type-inference-restrictions)

### 預覽用於建立開放式範圍的 ..< 運算子

> 新運算子目前處於[實驗性 (Experimental)](components-stability.md#stability-levels-explained) 階段，且在 IDE 中的支援有限。
>
{style="warning"}

此版本引入了新的 `..<` 運算子。Kotlin 擁有 `..` 運算子來表示值範圍。新的 `..<`
運算子的行為與 `until` 函式類似，可幫助您定義開放式範圍（不包含上限的範圍）。

<video src="https://www.youtube.com/watch?v=v0AHdAIBnbs" title="用於開放式範圍的新運算子"/>

我們的研究表明，這個新運算子能更好地表達開放式範圍，並明確表示不包含上限。

以下是在 `when` 表達式中使用 `..<` 運算子的範例：

```kotlin
when (value) {
    in 0.0..<0.25 -> // 第一個四分之一
    in 0.25..<0.5 -> // 第二個四分之一
    in 0.5..<0.75 -> // 第三個四分之一
    in 0.75..1.0 ->  // 最後一個四分之一 <- 注意這裡使用的是閉鎖範圍
}
```
{validate="false"}

#### 標準函式庫 API 變更

通用的 Kotlin 標準函式庫中的 `kotlin.ranges` 套件將引入以下新類型和操作：

##### 新的 OpenEndRange&lt;T&gt; 介面

用於表示開放式範圍的新介面與現有的 `ClosedRange<T>` 介面非常相似：

```kotlin
interface OpenEndRange<T : Comparable<T>> {
    // 下限
    val start: T
    // 上限，不包含在範圍內
    val endExclusive: T
    operator fun contains(value: T): Boolean = value >= start && value < endExclusive
    fun isEmpty(): Boolean = start >= endExclusive
}
```
{validate="false"}

##### 在現有的可迭代範圍中實作 OpenEndRange

當開發人員需要獲取排除上限的範圍時，目前使用 `until` 函式來有效地產生具有相同值的閉鎖可迭代範圍。為了使這些範圍在接受 `OpenEndRange<T>` 的新 API 中可用，我們希望在現有的可迭代範圍中實作該介面：`IntRange`、`LongRange`、`CharRange`、`UIntRange` 和 `ULongRange`。因此，它們將同時實作 `ClosedRange<T>` 和 `OpenEndRange<T>` 介面。

```kotlin
class IntRange : IntProgression(...), ClosedRange<Int>, OpenEndRange<Int> {
    override val start: Int
    override val endInclusive: Int
    override val endExclusive: Int
}
```
{validate="false"}

##### 標準型別的 rangeUntil 運算子

將為目前由 `rangeTo` 運算子定義的相同型別和組合提供 `rangeUntil` 運算子。我們以擴充函式的形式提供它們以供原型設計使用，但為了保持一致性，我們計劃在穩定開放式範圍 API 之前將其改為成員。

#### 如何啟用 ..&lt; 運算子

要使用 `..<` 運算子或為您自己的型別實作該運算子慣例，請啟用 `-language-version 1.8` 編譯器選項。

為支援標準型別的開放式範圍而引入的新 API 元素需要選擇性加入（opt-in），這在實驗性 stdlib API 中很常見：`@OptIn(ExperimentalStdlibApi::class)`。或者，您可以使用 `-opt-in=kotlin.ExperimentalStdlibApi` 編譯器選項。

[在此 KEEP 文件中閱讀更多關於新運算子的資訊](https://github.com/kotlin/KEEP/blob/open-ended-ranges/proposals/open-ended-ranges.md)。

### 為帶有 data object 的單例和密封類別階層改進字串表示

> Data object 處於[實驗性 (Experimental)](components-stability.md#stability-levels-explained) 階段，目前在 IDE 中的支援有限。
>
{style="warning"}

此版本引入了一種新的 `object` 宣告供您使用：`data object`。[Data object](https://youtrack.jetbrains.com/issue/KT-4107) 在概念上與常規的 `object` 宣告完全相同，但開箱即提供乾淨的 `toString` 表示。

<video src="https://www.youtube.com/v/ovAqcwFhEGc" title="Kotlin 1.7.20 中的 Data object"/>

```kotlin
package org.example
object MyObject
data object MyDataObject

fun main() {
    println(MyObject) // org.example.MyObject@1f32e575
    println(MyDataObject) // MyDataObject
}
```

這使得 `data object` 宣告非常適合用於密封類別階層，您可以將其與 `data class` 宣告一起使用。在此程式碼片段中，將 `EndOfFile` 宣告為 `data object` 而非普通的 `object`，意味著它將獲得漂亮的 `toString` 而無需手動覆寫，從而與隨附的 `data class` 定義保持對稱：

```kotlin
sealed class ReadResult {
    data class Number(val value: Int) : ReadResult()
    data class Text(val value: String) : ReadResult()
    data object EndOfFile : ReadResult()
}

fun main() {
    println(ReadResult.Number(1)) // Number(value=1)
    println(ReadResult.Text("Foo")) // Text(value=Foo)
    println(ReadResult.EndOfFile) // EndOfFile
}
```

#### 如何啟用 data object

要在您的程式碼中使用 data object 宣告，請啟用 `-language-version 1.9` 編譯器選項。在 Gradle 專案中，您可以透過在 `build.gradle(.kts)` 中新增以下內容來達成：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile>().configureEach {
    // ...
    kotlinOptions.languageVersion = "1.9"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
compileKotlin {
    // ...
    kotlinOptions.languageVersion = '1.9'
}
```
</tab>
</tabs>

閱讀更多關於 data object 的資訊，並在[相關 KEEP 文件](https://github.com/Kotlin/KEEP/pull/316)中分享您對其實作的回饋。

### 新的建置器型別推論限制

Kotlin 1.7.20 對[建置器型別推論的使用](using-builders-with-builder-inference.md)施加了一些重大限制，這可能會影響您的程式碼。這些限制適用於包含建置器 Lambda 函式的程式碼，在這些情況下，如果不分析 Lambda 本身，就無法推導出參數。參數被用作引數。現在，編譯器對此類程式碼將一律顯示錯誤，並要求您明確指定型別。

這是一項重大變更（breaking change），但我們的研究顯示這些情況非常罕見，這些限制不應影響您的程式碼。如果受到影響，請考慮以下情況：

* 隱藏成員擴充的建置器推論。

  如果您的程式碼包含一個在建置器推論期間會被使用的同名擴充函式，編譯器將向您顯示錯誤：

    ```kotlin
    class Data {
        fun doSmth() {} // 1
    }
    
    fun <T> T.doSmth() {} // 2
    
    fun test() {
        buildList {
            this.add(Data())
            this.get(0).doSmth() // 解析為 2 並導致錯誤
        }
    }
    ```
    {validate="false"} 
  
  要修復程式碼，您應該明確指定型別：

    ```kotlin
    class Data {
        fun doSmth() {} // 1
    }
    
    fun <T> T.doSmth() {} // 2
    
    fun test() {
        buildList<Data> { // 型別引數！
            this.add(Data())
            this.get(0).doSmth() // 解析為 1
        }
    }
    ```

* 具有多個 Lambda 且未明確指定型別引數的建置器推論。

  如果在建置器推論中有兩個或多個 Lambda 區塊，它們會影響型別。為了防止錯誤，編譯器要求您指定型別：

    ```kotlin
    fun <T: Any> buildList(
        first: MutableList<T>.() -> Unit, 
        second: MutableList<T>.() -> Unit
    ): `List<T>` {
        val list = mutableListOf<T>()
        list.first()
        list.second()
        return list 
    }
    
    fun main() {
        buildList(
            first = { // this: MutableList<String>
                add("")
            },
            second = { // this: MutableList<Int> 
                val i: Int = get(0)
                println(i)
            }
        )
    }
    ```
    {validate="false"}

  要修復錯誤，您應該明確指定型別並修正型別不符：

    ```kotlin
    fun main() {
        buildList<Int>(
            first = { // this: MutableList<Int>
                add(0)
            },
            second = { // this: MutableList<Int>
                val i: Int = get(0)
                println(i)
            }
        )
    }
    ```

如果您沒有找到上述提及的情況，請向我們的團隊[提交問題](https://kotl.in/issue)。

有關此建置器推論更新的更多資訊，請參閱此 [YouTrack 問題](https://youtrack.jetbrains.com/issue/KT-53797)。

## Kotlin/JVM

Kotlin 1.7.20 引入了泛型內嵌類別，為委派屬性增加了更多字節碼優化，並在 kapt 虛設常式（stub）產生任務中支援 IR，使得在 kapt 中使用所有最新的 Kotlin 特性成為可能：

* [泛型內嵌類別](#generic-inline-classes)
* [更多委派屬性的優化案例](#more-optimized-cases-of-delegated-properties)
* [kapt 虛設常式產生任務支援 JVM IR 後端](#support-for-the-jvm-ir-backend-in-kapt-stub-generating-task)

### 泛型內嵌類別

> 泛型內嵌類別是一項[實驗性 (Experimental)](components-stability.md#stability-levels-explained) 功能。
> 它可能隨時被刪除或更改。需要選擇性加入（見下文詳情），且您應僅出於評估目的使用它。
> 我們歡迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-52994) 上提供回饋。
>
{style="warning"}

Kotlin 1.7.20 允許 JVM 內嵌類別的基礎型別為型別參數。編譯器將其映射到 `Any?`，或者通常映射到型別參數的上限。

<video src="https://www.youtube.com/v/0JRPA0tt9og" title="Kotlin 1.7.20 中的泛型內嵌類別"/>

考慮以下範例：

```kotlin
@JvmInline
value class UserId<T>(val value: T)

fun compute(s: UserId<String>) {} // 編譯器產生 fun compute-<hashcode>(s: Any?)
```

該函式接受內嵌類別作為參數。參數被映射到上限，而非型別引數。

要啟用此功能，請使用 `-language-version 1.8` 編譯器選項。

我們歡迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-52994) 上提供關於此功能的回饋。

### 更多委派屬性的優化案例

在 Kotlin 1.6.0 中，我們透過省略 `$delegate` 欄位並[產生對所引用屬性的直接存取](whatsnew16.md#optimize-delegated-properties-which-call-get-set-on-the-given-kproperty-instance)來優化了委派給屬性的情況。在 1.7.20 中，我們為更多情況實作了此項優化。
如果委派是以下情況，現在將省略 `$delegate` 欄位：

* 具名物件：

  ```kotlin
  object NamedObject {
      operator fun getValue(thisRef: Any?, property: KProperty<*>): String = ...
  }
  
  val s: String by NamedObject
  ```
  {validate="false"}

* 在同一模組中具有[支援欄位（backing field）](properties.md#backing-fields)和預設 getter 的 final `val` 屬性：

  ```kotlin
  val impl: ReadOnlyProperty<Any?, String> = ...
  
  class A {
      val s: String by impl
  }
  ```
  {validate="false"}

* 常數運算式、列舉項、`this` 或 `null`。以下是 `this` 的範例：

  ```kotlin
  class A {
      operator fun getValue(thisRef: Any?, property: KProperty<*>) ...
   
      val s by this
  }
  ```
  {validate="false"}

了解更多關於[委派屬性](delegated-properties.md)的資訊。

我們歡迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-23397) 上提供關於此功能的回饋。

### kapt 虛設常式產生任務支援 JVM IR 後端

> kapt 虛設常式產生任務對 JVM IR 後端的支援是一項[實驗性 (Experimental)](components-stability.md) 功能。
> 它可能隨時更改。需要選擇性加入（見下文詳情），且您應僅出於評估目的使用它。
>
{style="warning"}

在 1.7.20 之前，kapt 虛設常式產生任務使用的是舊後端，且[可重複註解](annotations.md#repeatable-annotations)無法與 [kapt](kapt.md) 配合使用。在 Kotlin 1.7.20 中，我們在 kapt 虛設常式產生任務中加入了對 [JVM IR 後端](whatsnew15.md#stable-jvm-ir-backend)的支援。這使得在 kapt 中使用所有最新的 Kotlin 特性成為可能，包括可重複註解。

要在 kapt 中使用 IR 後端，請將以下選項新增至您的 `gradle.properties` 檔案：

```none
kapt.use.jvm.ir=true
```

我們歡迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-49682) 上提供關於此功能的回饋。

## Kotlin/Native

Kotlin 1.7.20 隨附了預設啟用的新 Kotlin/Native 記憶體管理員，並為您提供了自訂 `Info.plist` 檔案的選項：

* [新的預設記憶體管理員](#the-new-kotlin-native-memory-manager-enabled-by-default)
* [自訂 Info.plist 檔案](#customizing-the-info-plist-file)

### 新的 Kotlin/Native 記憶體管理員預設啟用

此版本為新的記憶體管理員帶來了進一步的穩定性和效能改進，使我們能夠將新的記憶體管理員晉升至 [Beta](components-stability.md) 階段。

之前的記憶體管理員使得編寫並行和非同步程式碼變得複雜，包括實作 `kotlinx.coroutines` 程式庫時的問題。這阻礙了 Kotlin Multiplatform Mobile 的採用，因為並行限制在 iOS 和 Android 平台之間共享 Kotlin 程式碼時產生了問題。新的記憶體管理員終於為[將 Kotlin Multiplatform Mobile 晉升至 Beta](https://blog.jetbrains.com/kotlin/2022/05/kotlin-multiplatform-mobile-beta-roadmap-update/) 鋪平了道路。

新的記憶體管理員還支援編譯器快取，使編譯時間與之前的版本相當。
有關新記憶體管理員優點的更多資訊，請參閱我們針對預覽版本的原始[部落格文章](https://blog.jetbrains.com/kotlin/2021/08/try-the-new-kotlin-native-memory-manager-development-preview/)。您可以在[文件](native-memory-manager.md)中找到更多技術細節。

#### 配置與設定

從 Kotlin 1.7.20 開始，新的記憶體管理員是預設值。不需要太多的額外設定。

如果您已經手動開啟了它，可以從 `gradle.properties` 中移除 `kotlin.native.binary.memoryModel=experimental` 選項，或者從 `build.gradle(.kts)` 檔案中移除 `binaryOptions["memoryModel"] = "experimental"`。

如有必要，您可以使用 `gradle.properties` 中的 `kotlin.native.binary.memoryModel=strict` 選項切換回舊版記憶體管理員。但是，舊版記憶體管理員不再支援編譯器快取，因此編譯時間可能會變差。

#### 凍結 (Freezing)

在新的記憶體管理員中，凍結（freezing）已被棄用。除非您需要程式碼與舊版管理員配合使用（舊版仍需要凍結），否則請不要使用它。這對於需要維持對舊版記憶體管理員支援的程式庫作者，或者希望在遇到新記憶體管理員問題時擁有備援方案的開發者來說可能會有幫助。

在這種情況下，您可以暫時支援新舊兩種記憶體管理員的程式碼。要忽略棄用警告，請執行以下操作之一：

* 使用 `@OptIn(FreezingIsDeprecated::class)` 註解被棄用 API 的使用處。
* 在 Gradle 中將 `languageSettings.optIn("kotlin.native.FreezingIsDeprecated")` 套用至所有的 Kotlin 原始碼集（source sets）。
* 傳遞編譯器旗標 `-opt-in=kotlin.native.FreezingIsDeprecated`。

#### 從 Swift/Objective-C 呼叫 Kotlin 暫停函式

新的記憶體管理員仍然限制從主執行緒以外的執行緒從 Swift 和 Objective-C 呼叫 Kotlin `suspend` 函式，但您可以使用新的 Gradle 選項來解除此限制。

此限制最初是在舊版記憶體管理員中引入的，原因是某些情況下程式碼會派發一個延續（continuation）以在原始執行緒上恢復。如果該執行緒沒有支援的事件迴圈（event loop），任務將永遠不會執行，協同程式也永遠不會恢復。

在某些情況下，此限制不再是必要的，但很難輕易實作對所有必要條件的檢查。因此，我們決定在新的記憶體管理員中保留它，同時為您提供一個停用它的選項。為此，請在您的 `gradle.properties` 中新增以下選項：

```none
kotlin.native.binary.objcExportSuspendFunctionLaunchThreadRestriction=none
```

> 如果您使用 `native-mt` 版本的 `kotlinx.coroutines` 或其他具有相同「派發至原始執行緒」方法的程式庫，請不要新增此選項。
>
{style="warning"}

Kotlin 團隊非常感謝 [Ahmed El-Helw](https://github.com/ahmedre) 實作了這個選項。

#### 留下您的回饋

這是對我們生態系統的一個重大變更。我們非常感謝您的回饋，以幫助我們做得更好。

請在您的專案中嘗試新的記憶體管理員，並在[我們的問題追蹤器 YouTrack 中分享回饋](https://youtrack.jetbrains.com/issue/KT-48525)。

### 自訂 Info.plist 檔案

產生架構（framework）時，Kotlin/Native 編譯器會產生資訊內容列表檔案 `Info.plist`。
以前，自訂其內容非常繁瑣。在 Kotlin 1.7.20 中，您可以直接設定以下屬性：

| 屬性                         | 二進位選項 (Binary option) |
|------------------------------|----------------------------|
| `CFBundleIdentifier`         | `bundleId`                 |
| `CFBundleShortVersionString` | `bundleShortVersionString` |
| `CFBundleVersion`            | `bundleVersion`            |

為此，請使用對應的二進位選項。傳遞 `-Xbinary=$option=$value` 編譯器旗標，或為必要的架構設定 `binaryOption(option, value)` Gradle DSL。

Kotlin 團隊非常感謝 Mads Ager 實作了這個功能。

## Kotlin/JS

Kotlin/JS 獲得了一些增強功能，改進了開發者體驗並提升了效能：

* 由於改進了相依性載入的效率，Klib 的產生在增量建置和全新建置中都變得更快。
* [開發用二進位檔的增量編譯](js-ir-compiler.md#incremental-compilation-for-development-binaries) 已經過重構，在全新建置場景、更快的增量建置以及穩定性修復方面帶來了重大改進。
* 我們改進了針對巢狀物件、密封類別以及建構函式中具有預設值的參數的 `.d.ts` 產生。

## Gradle

Kotlin Gradle 外掛程式的更新專注於與新的 Gradle 特性以及最新 Gradle 版本的相容性。

Kotlin 1.7.20 包含支援 Gradle 7.1 的變更。被棄用的方法和屬性已被移除或替換，減少了 Kotlin Gradle 外掛程式產生的棄用警告數量，並為未來支援 Gradle 8.0 掃清了障礙。

然而，有一些潛在的重大變更可能需要您的注意：

### 目標組態 (Target configuration)

* `org.jetbrains.kotlin.gradle.dsl.SingleTargetExtension` 現在具有泛型參數 `SingleTargetExtension<T : KotlinTarget>`。
* `kotlin.targets.fromPreset()` 慣例已被棄用。您仍然可以使用 `kotlin.targets { fromPreset() }`，但我們建議[明確設定目標](https://kotlinlang.org/docs/multiplatform/multiplatform-discover-project.html#targets)。
* 由 Gradle 自動產生的目標存取子（target accessors）在 `kotlin.targets { }` 區塊內不再可用。請改用 `findByName("targetName")` 方法。

  請注意，此類存取子在 `kotlin.targets` 的情況下仍然可用，例如 `kotlin.targets.linuxX64`。

### 原始碼目錄組態

Kotlin Gradle 外掛程式現在將 Kotlin `SourceDirectorySet` 作為 `kotlin` 擴充新增至 Java 的 `SourceSet` 群組中。
這使得在 `build.gradle.kts` 檔案中配置原始碼目錄的方式，可以類似於在 [Java、Groovy 和 Scala](https://docs.gradle.org/7.1/release-notes.html#easier-source-set-configuration-in-kotlin-dsl) 中的配置方式：

```kotlin
sourceSets {
    main {
        kotlin {
            java.setSrcDirs(listOf("src/java"))
            kotlin.setSrcDirs(listOf("src/kotlin"))
        }
    }
}
```

您不再需要使用被棄用的 Gradle 慣例來指定 Kotlin 的原始碼目錄。

請記住，您仍然可以使用 `kotlin` 擴充來存取 `KotlinSourceSet`：

```kotlin
kotlin {
    sourceSets {
        main {
        // ...
        }
    }
}
```

### 用於 JVM 工具鏈組態的新方法

此版本提供了一個新的 `jvmToolchain()` 方法，用於啟用 [JVM 工具鏈功能](gradle-configure-project.md#gradle-java-toolchains-support)。
如果您不需要任何額外的[組態欄位](https://docs.gradle.org/current/javadoc/org/gradle/jvm/toolchain/JavaToolchainSpec.html)（例如 `implementation` 或 `vendor`），您可以使用 Kotlin 擴充中的此方法：

```kotlin
kotlin {
    jvmToolchain(17)
}
```

這簡化了 Kotlin 專案的設定流程，無需任何額外配置。
在此版本之前，您只能透過以下方式指定 JDK 版本：

```kotlin
kotlin {
    jvmToolchain {
        languageVersion.set(JavaLanguageVersion.of(17))
    }
}
```

## 標準函式庫

Kotlin 1.7.20 為 `java.nio.file.Path` 類別提供了新的[擴充函式](extensions.md#extension-functions)，允許您遍歷檔案樹：

* `walk()` 延遲遍歷以指定路徑為根的檔案樹。
* `fileVisitor()` 使得可以單獨建立 `FileVisitor`。`FileVisitor` 定義了遍歷時對目錄和檔案的操作。
* `visitFileTree(fileVisitor: FileVisitor, ...)` 接收一個現成的 `FileVisitor` 並在底層使用 `java.nio.file.Files.walkFileTree()`。
* `visitFileTree(..., builderAction: FileVisitorBuilder.() -> Unit)` 透過 `builderAction` 建立一個 `FileVisitor` 並呼叫 `visitFileTree(fileVisitor, ...)` 函式。
* `FileVisitResult` 是 `FileVisitor` 的傳回型別，具有預設值 `CONTINUE`，表示繼續處理檔案。

> `java.nio.file.Path` 的新擴充函式處於[實驗性 (Experimental)](components-stability.md) 階段。
> 它們可能隨時更改。需要選擇性加入（見下文詳情），且您應僅出於評估目的使用它們。
>
{style="warning"}

以下是您可以使用這些新擴充函式執行的一些操作：

* 明確建立一個 `FileVisitor` 然後使用：

  ```kotlin
  val cleanVisitor = fileVisitor {
      onPreVisitDirectory { directory, attributes ->
          // 訪問目錄時的一些邏輯
          FileVisitResult.CONTINUE
      }
  
      onVisitFile { file, attributes ->
          // 訪問檔案時的一些邏輯
          FileVisitResult.CONTINUE
      }
  }
  
  // 這裡可能有一些邏輯
  
  projectDirectory.visitFileTree(cleanVisitor)
  ```

* 使用 `builderAction` 建立一個 `FileVisitor` 並立即使用：

  ```kotlin
  projectDirectory.visitFileTree {
  // builderAction 的定義：
      onPreVisitDirectory { directory, attributes ->
          // 訪問目錄時的一些邏輯
          FileVisitResult.CONTINUE
      }
  
      onVisitFile { file, attributes ->
          // 訪問檔案時的一些邏輯
          FileVisitResult.CONTINUE
      }
  }
  ```

* 使用 `walk()` 函式遍歷以指定路徑為根的檔案樹：

  ```kotlin
  @OptIn(kotlin.io.path.ExperimentalPathApi::class)
  fun traverseFileTree() {
      val cleanVisitor = fileVisitor {
          onPreVisitDirectory { directory, _ ->
              if (directory.name == "build") {
                  directory.toFile().deleteRecursively()
                  FileVisitResult.SKIP_SUBTREE
              } else {
                  FileVisitResult.CONTINUE
              }
          }
  
          onVisitFile { file, _ ->
              if (file.extension == "class") {
                  file.deleteExisting()
              }
              FileVisitResult.CONTINUE
          }
      }
  
      val rootDirectory = createTempDirectory("Project")
  
      rootDirectory.resolve("src").let { srcDirectory ->
          srcDirectory.createDirectory()
          srcDirectory.resolve("A.kt").createFile()
          srcDirectory.resolve("A.class").createFile()
      }
  
      rootDirectory.resolve("build").let { buildDirectory ->
          buildDirectory.createDirectory()
          buildDirectory.resolve("Project.jar").createFile()
      }
  
   
  // 使用 walk 函式：
      val directoryStructure = rootDirectory.walk(PathWalkOption.INCLUDE_DIRECTORIES)
          .map { it.relativeTo(rootDirectory).toString() }
          .toList().sorted()
      assertPrints(directoryStructure, "[, build, build/Project.jar, src, src/A.class, src/A.kt]")
  
      rootDirectory.visitFileTree(cleanVisitor)
  
      val directoryStructureAfterClean = rootDirectory.walk(PathWalkOption.INCLUDE_DIRECTORIES)
          .map { it.relativeTo(rootDirectory).toString() }
          .toList().sorted()
      assertPrints(directoryStructureAfterClean, "[, src, src/A.kt]")
  //sampleEnd
  }
  ```

與實驗性 API 的慣例一樣，新的擴充功能需要選擇性加入：`@OptIn(kotlin.io.path.ExperimentalPathApi::class)` 或 `@kotlin.io.path.ExperimentalPathApi`。或者，您可以使用編譯器選項：`-opt-in=kotlin.io.path.ExperimentalPathApi`。

我們歡迎您在 YouTrack 上提供關於 [`walk()` 函式](https://youtrack.jetbrains.com/issue/KT-52909) 和 [visit 擴充函式](https://youtrack.jetbrains.com/issue/KT-52910) 的回饋。

## 文件更新

自上一版本以來，Kotlin 文件進行了一些值得注意的變更：

### 翻新並改進的頁面

* [基本型別概覽 (Basic types overview)](types-overview.md) – 了解 Kotlin 中使用的基本型別：數值、布林值、字元、字串、陣列和無符號整數。
* [用於 Kotlin 開發的 IDE (IDEs for Kotlin development)](kotlin-ide.md) – 查看具有官方 Kotlin 支援的 IDE 列表，以及擁有社群支援外掛程式的工具。

### Kotlin Multiplatform 期刊中的新文章

* [原生與跨平台應用程式開發：如何選擇？](https://kotlinlang.org/docs/multiplatform/native-and-cross-platform.html) – 查看我們對跨平台應用程式開發和原生方法的概述及優勢。
* [六大最佳跨平台應用程式開發架構](https://kotlinlang.org/docs/multiplatform/cross-platform-frameworks.html) – 閱讀關鍵面向，幫助您為跨平台專案選擇合適的架構。

### 新增及更新的教學

* [Kotlin Multiplatform 入門](https://kotlinlang.org/docs/multiplatform/multiplatform-create-first-app.html) – 了解使用 Kotlin 進行跨平台行動開發，並建立一個可在 Android 和 iOS 上運行的應用程式。
* [使用 React 和 Kotlin/JS 建置 Web 應用程式](js-react.md) – 建立一個瀏覽器應用程式，探索 Kotlin 的 DSL 以及典型 React 程式的特性。

### 發佈文件的變更

我們不再為每個版本提供推薦的 kotlinx 程式庫列表。該列表僅包含與 Kotlin 本身一起推薦並測試過的版本。它沒有考慮到某些程式庫彼此相依且需要特定的 kotlinx 版本，這可能與推薦的 Kotlin 版本不同。

我們正致力於尋找一種方式，提供有關程式庫如何相互關聯和相依的資訊，以便在您升級專案中的 Kotlin 版本時，能清楚知道應該使用哪個 kotlinx 程式庫版本。

## 安裝 Kotlin 1.7.20

[IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 2021.3、2022.1 和 2022.2 會自動建議將 Kotlin 外掛程式更新至 1.7.20。

> 對於 Android Studio Dolphin (213)、Electric Eel (221) 和 Flamingo (222)，Kotlin 外掛程式 1.7.20 將隨即將推出的 Android Studio 更新一起提供。
>
{style="note"}

新的命令列編譯器可在 [GitHub 發佈頁面](https://github.com/JetBrains/kotlin/releases/tag/v1.7.20)下載。

### Kotlin 1.7.20 相容性指南

儘管 Kotlin 1.7.20 是一個增量版本，我們仍然不得不做出一些不相容的變更，以限制 Kotlin 1.7.0 中引入的問題擴散。

請在 [Kotlin 1.7.20 相容性指南](compatibility-guide-1720.md)中找到此類變更的詳細列表。