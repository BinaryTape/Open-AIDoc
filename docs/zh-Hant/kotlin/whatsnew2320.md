[//]: # (title: Kotlin 2.3.20 新功能)

<show-structure depth="1"/>

<web-summary>閱讀 Kotlin 2.3.20 版本資訊，涵蓋新語言特性、Kotlin Multiplatform、JVM、Native、JS 和 Wasm 的更新，以及 Gradle 和 Maven 的建置工具支援。</web-summary>

_[發佈日期：2026 年 3 月 16 日](releases.md#release-history)_

<tldr>
    <p>有關錯誤修正版本 2.3.21 的詳細資訊，請參閱<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.21">變更記錄</a></p>
</tldr>

Kotlin 2.3.20 現已發佈！以下為主要重點：

* **Gradle**：[與 Gradle 9.3.0 相容](#compatibility-with-gradle-9-3-0) 以及 [Kotlin/JVM 編譯預設使用 BTA](#kotlin-jvm-compilation-uses-build-tools-api-by-default)
* **Maven**：[簡化 Kotlin 專案的設定](#simplified-setup-for-kotlin-projects)
* **Kotlin 編譯器外掛程式**：[Lombok 進入 Alpha 階段](#lombok-is-now-alpha) 以及 [改進 `kotlin.plugin.jpa` 外掛程式中的 JPA 支援](#improved-jpa-support-in-the-kotlin-plugin-jpa-plugin)
* **語言**：[支援基於名稱的解構宣告](#name-based-destructuring)
* **標準函式庫**：[用於建立 `Map.Entry` 不可變複本的新 API](#new-api-for-creating-immutable-copies-of-map-entry)
* **Kotlin/Native**：[適用於 C 與 Objective-C 程式庫的新互通模式](#new-interoperability-mode-for-c-or-objective-c-libraries)

> 有關 Kotlin 發佈週期的詳細資訊，請參閱 [Kotlin 發佈流程](releases.md)。
>
{style="tip"}

## 更新至 Kotlin 2.3.20 {id="update-to-kotlin-2-3-20"}

最新版本的 Kotlin 已包含在最新版本的 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 與 [Android Studio](https://developer.android.com/studio) 中。

若要更新至新的 Kotlin 版本，請確保您的 IDE 已更新至最新版本，並在建置指令碼中[將 Kotlin 版本變更](releases.md#update-to-a-new-kotlin-version)為 2.3.20。

## 新功能 {id=new-stable-features}
<primary-label ref="stable"/>

以下功能在此版本中已達到[穩定 (Stable)](components-stability.md#stability-levels-explained) 狀態：

<snippet id="simplified-setup-for-kotlin-projects-content">

<var name="id1" value="simplified-setup-for-kotlin-projects"/>

<var name="id2" value="simplified-setup-for-kotlin-projects-how-to-enable"/>

### 簡化 Kotlin 專案的設定 {id="%id1%"}
<secondary-label ref="maven"/>

Kotlin 2.3.20 讓在 Maven 專案中設定 Kotlin 變得更加容易。現在 Kotlin 支援原始碼根目錄與 Kotlin 標準函式庫的自動設定。

有了這項新設定，當您使用 Maven 建構系統建立新的 Kotlin 專案，或將 Kotlin 引進現有的 Java Maven 專案時，
您無需在 POM 組建檔案中手動指定原始碼根路徑或新增 `kotlin-stdlib` 相依性。

#### 如何啟用 {id="%id2%"}

在您的 `pom.xml` 檔案中，將 `<extensions>true</extensions>` 新增至 Kotlin Maven 外掛程式的 `<build><plugins>` 區段中：

```xml
<build>
    <plugins>
         <plugin>
             <groupId>org.jetbrains.kotlin</groupId>
             <artifactId>kotlin-maven-plugin</artifactId>
             <version>%kotlinVersion%</version>
             <extensions>true</extensions> <!-- 新增此擴充套件 -->
         </plugin>
    </plugins>
</build>
```

此處 `<extensions>` 選項的新功能包括：

* 當 `src/main/kotlin` 與 `src/test/kotlin` 目錄已經存在但未在外掛程式設定中指定時，將它們註冊為原始碼根目錄。
* 在尚未明確定義 `kotlin-stdlib` 相依性的情況下自動新增它。

您也可以選擇退出自動新增 Kotlin 標準函式庫。為此，請在 `<properties>` 區段中新增以下內容：

```xml
<project>
    <properties>
        <!-- 透過屬性停用智慧預設值 -->
        <kotlin.smart.defaults.enabled>false</kotlin.smart.defaults.enabled>         
    </properties>
</project>
```

請注意，此屬性不僅會停用標準函式庫的自動新增，還會停用原始碼根路徑的註冊。
其他 `<extensions>` 功能不受影響。

有關設定 Kotlin Maven 專案的更多資訊，請參閱[設定 Maven 專案](maven-configure-project.md)。

</snippet>

## 新功能 {id=new-experimental-features}
<primary-label ref="experimental-exp"/>

以下預先發佈功能可在此版本中使用。
這包括處於 [Beta](components-stability.md#stability-levels-explained)、[Alpha](components-stability.md#stability-levels-explained) 和 [Experimental](components-stability.md#stability-levels-explained) 狀態的功能：

* [編譯器：Lombok 現已進入 Alpha 階段](#lombok-is-now-alpha)
* [語言：基於名稱的解構](#name-based-destructuring)
* [標準函式庫：用於建立 `Map.Entry` 不可變複本的新 API](#new-api-for-creating-immutable-copies-of-map-entry)
* [Kotlin/Native：適用於 C 或 Objective-C 程式庫的新互通模式](#new-interoperability-mode-for-c-or-objective-c-libraries)

<snippet id="lombok-is-now-alpha-content">

<var name="id3" value="lombok-is-now-alpha"/>

### Lombok 現已進入 Alpha 階段 {id="%id3%"}
<primary-label ref="alpha"/>
<secondary-label ref="compiler"/>

Kotlin 1.5.20 引入了實驗性的 [Lombok 編譯器外掛程式](lombok.md)，可讓您在混合 Kotlin 與 Java 程式碼的模組中產生並使用 [Java 的 Lombok 宣告](https://projectlombok.org/)。

在 2.3.20 中，Lombok 編譯器外掛程式已晉升為 [Alpha](components-stability.md#stability-levels-explained)，因為我們計畫讓此功能達到正式環境就緒水準，但它目前仍在積極開發中。

</snippet>

<snippet id="name-based-destructuring-content">

<var name="id4" value="name-based-destructuring"/>

<var name="id5" value="name-based-destructuring-how-to-enable"/>

### 基於名稱的解構 {id="%id4%"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="language"/>

Kotlin 2.3.20 引入了*基於名稱的解構宣告*，
它透過屬性名稱來配對變數，而不是依賴基於位置的 `componentN()` 函式。

在此之前，[解構宣告](destructuring-declarations.md)使用的是基於位置的解構：

```kotlin
data class User(val username: String, val email: String)

fun main() {
    val user = User("alice", "alice@example.com")

    val (email, username) = user

    println(email)
    // alice

    println(username)
    // alice@example.com
}
```
{kotlin-runnable="true"}

在這個範例中，由於解構依賴 `componentN()` 函式的順序，`email` 會接收到 `username` 的值，而 `username` 則接收到 `email` 的值。

從 Kotlin 2.3.20 開始，您可以使用基於名稱的解構，其中每個變數都依名稱引用屬性：

```kotlin
fun main() {
    val user = User("alice", "alice@example.com")

    // 使用顯式形式的基於名稱的解構
    (val mail = email, val name = username) = user

    println(name)
    // alice

    println(mail)
    // alice@example.com
}
```

基於名稱的解構目前為[實驗性功能 (Experimental)](components-stability.md#stability-levels-explained)。
您可以透過 `-Xname-based-destructuring` 編譯器選項來控制編譯器如何解讀解構宣告。

它具有以下模式：

* `only-syntax`：啟用基於名稱解構的顯式形式，而不改變現有解構宣告的行為。
* `name-mismatch`：當資料類別中的基於位置解構使用了與屬性名稱不相符的變數名稱時發出警告。
* `complete`：啟用帶有圓括號的簡短形式基於名稱解構，並繼續支援使用方括號語法的基於位置解構。

如果您使用 `complete` 模式，帶有圓括號的簡短形式解構語法將會依屬性名稱配對變數，而不是依賴位置：

```kotlin
val (email, username) = user
```
#### 如何啟用 {id="%id5%"}

要在您的專案中使用基於名稱的解構，請在組建組態檔案中新增編譯器選項：

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xname-based-destructuring=only-syntax")
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
                    <arg>-Xname-based-destructuring=only-syntax</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab> 
</tabs>

加入基於名稱的解構同時也引入了一種使用方括號進行基於位置解構的新語法：

```kotlin
// 使用顯式的基於位置解構
val [username, email] = user
```

我們計畫逐步轉向預設使用基於名稱配對的解構宣告，同時透過新的方括號語法保留基於位置的解構。

如需更多資訊，請參閱該特性的 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0438-name-based-destructuring.md)。

歡迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-19627) 中提供您的意見反應。

</snippet>

<snippet id="new-api-for-creating-immutable-copies-of-map-entry-content">

<var name="id6" value="new-api-for-creating-immutable-copies-of-map-entry"/>

### 用於建立 `Map.Entry` 不可變複本的新 API {id="%id6%"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin 2.3.20 引入了 `Map.Entry.copy()` 擴充函式，用於建立 [`Map.Entry`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-map/-entry/) 的不可變複本。
此函式可讓您在修改 Map 後，透過預先複製來重複使用從 [`Map.entries`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-map/entries.html) 獲取的項目。

`Map.Entry.copy()` 目前為[實驗性功能 (Experimental)](components-stability.md#stability-levels-explained)。
若要選擇加入，請使用 `@OptIn(ExperimentalStdlibApi::class)` 註解或編譯器選項：

```bash
-opt-in=kotlin.ExperimentalStdlibApi
```

以下是使用 `Map.Entry.copy()` 從可變 Map 中移除項目的範例：

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
    val map = mutableMapOf(1 to 1, 2 to 2, 3 to 3, 4 to 4)

    val toRemove = map.entries
        .filter { it.key % 2 == 0 }
        .map { it.copy() }

    map.entries.removeAll(toRemove)

    println("map = $map")
    // map = {1=1, 3=3}
}
```

</snippet>

<snippet id="new-interoperability-mode-for-c-or-objective-c-libraries-content">

<var name="id7" value="new-interoperability-mode-for-c-or-objective-c-libraries"/>

<var name="id8" value="new-interoperability-mode-for-c-or-objective-c-libraries-how-to-enable"/>

<var name="id9" value="new-interoperability-mode-for-c-or-objective-c-libraries-report-your-results"/>

### 適用於 C 或 Objective-C 程式庫的新互通模式 {id="%id7%"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="native"/>

如果您在 Kotlin Multiplatform (KMP) 程式庫或應用程式中使用了 C 或 Objective-C 程式庫，我們誠摯邀請您測試新的互通模式並分享結果。

一般而言，Kotlin/Native 支援將 C 和 Objective-C 程式庫匯入 Kotlin。
然而對於 KMP 程式庫，此功能目前會[受到](native-lib-import-stability.md#stability-of-c-and-objective-c-library-import)與舊版編譯器之 KMP 相容性問題的影響。

換言之，如果您發佈了使用特定 Kotlin 版本編譯的 KMP 程式庫，匯入 C 或 Objective-C 程式庫可能會導致該 Kotlin 程式庫無法在採用較早 Kotlin 版本的專案中使用。

為了解決這個問題及其他問題，Kotlin 團隊一直在重新設計底層使用的互通機制。
從 Kotlin 2.3.20 開始，您可以透過編譯器選項嘗試新的模式。

#### 如何啟用 {id="%id8%"}

1. 在您的 Gradle 組建檔案中，檢查是否包含 `cinterops {}` 區塊或 `pod()` 相依性。
   如果存在這些內容，表示您的專案使用了 C 或 Objective-C 程式庫。

2. 確保您的專案使用的是 `2.3.20` 或更新版本。
3. 在同一個組建檔案中，將 `-Xccall-mode` 編譯器選項新增至 cinterop 工具呼叫中：

   ```kotlin
   kotlin {
       targets.withType<org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget>().configureEach {
           compilations.configureEach {
               cinterops.configureEach {
                   extraOpts += listOf("-Xccall-mode", "direct")
               }
           }
       }
   }
   ```

4. 如常透過執行單元測試、應用程式等方式建置並測試您的專案。
   您也可以使用 `--continue` 選項讓 Gradle 在發生失敗後繼續執行工作，這有助於一次發現更多問題。

> 請**勿**發佈使用新互通模式編譯的程式庫，因為它目前仍處於[實驗性 (Experimental)](components-stability.md#stability-levels-explained) 階段。
>
{style="warning"}

#### 回報您的結果 {id="%id9%"}

在大多數情況下，新的互通模式旨在成為一個直接替代方案。
我們計畫最終將其設為預設啟用。但為了實現這一目標，我們需要確保其盡可能穩定運行並在廣泛的專案中進行測試，原因如下：

* 新模式尚不支援某些 C 和 Objective-C 宣告（主要是相容性問題）。我們希望能更清楚了解這在真實環境中的影響，並據此排定後續步驟的優先順序。
* 可能存在我們尚未考慮到的錯誤或情況。測試具有大量相互作用特性的語言極具挑戰性，而測試各具獨特特性集之語言間的互動更是如此。

請協助我們檢驗真實專案並找出具有挑戰性的情況。
無論您是否遇到任何問題，都歡迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-83218) 的留言中分享您的測試結果。

</snippet>

## 語言 {id="language"}

Kotlin 2.3.20 新增了基於名稱的解構宣告，此機制透過屬性名稱配對變數，而非依賴位置。
此外，本版本也調整了帶有上下文參數之宣告的多載解析規則。

### 上下文參數的多載解析變更 {id="changes-to-overload-resolution-for-context-parameters"}
<secondary-label ref="language"/>

Kotlin 2.3.20 調整了帶有上下文參數宣告的多載解析。

在此之前，多載解析會將帶有上下文參數的宣告視為比不帶上下文參數的宣告更具體（more specific）。

從 Kotlin 2.3.20 開始，此規則不再適用，這使得多載選取更加一致。
因此，先前能夠成功解析的呼叫現在會變得模糊不清，當多載之間僅因上下文參數而有所不同時，將會產生編譯錯誤。
在這種情況下，編譯器會針對潛在的模糊性發出警告。

以下為範例：

```kotlin
class Logger {
    fun info(msg: String) = println("INFO: $msg")
}

fun saveUser(id: Int) {
    println("Saving user $id (no logger)")
}

// 回報警告：Contextual declaration is shadowed
context(logger: Logger)
fun saveUser(id: Int) {
    logger.info("Saving user $id")
}

fun main() {
    val logger = Logger()

    context(logger) {
        // 在 2.3.20 中回報模稜兩可（ambiguity）錯誤
        saveUser(1)
    }
}
```

此外，Kotlin 2.3.20 將 `kotlin.context` 多載的數量從 22 個減少到 6 個，以減少解析和程式碼補全期間過多的多載候選項目。

### 基於名稱的解構 {id="language-name-based-destructuring"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="language"/>

Kotlin 2.3.20 引入了*基於名稱的解構宣告*，
它透過屬性名稱來配對變數，而不是依賴基於位置的 `componentN()` 函式。

在此之前，[解構宣告](destructuring-declarations.md)使用的是基於位置的解構：

```kotlin
data class User(val username: String, val email: String)

fun main() {
    val user = User("alice", "alice@example.com")

    val (email, username) = user

    println(email)
    // alice

    println(username)
    // alice@example.com
}
```
{kotlin-runnable="true"}

在這個範例中，由於解構依賴 `componentN()` 函式的順序，`email` 會接收到 `username` 的值，而 `username` 則接收到 `email` 的值。

從 Kotlin 2.3.20 開始，您可以使用基於名稱的解構，其中每個變數都依名稱引用屬性：

```kotlin
fun main() {
    val user = User("alice", "alice@example.com")

    // 使用顯式形式的基於名稱的解構
    (val mail = email, val name = username) = user

    println(name)
    // alice

    println(mail)
    // alice@example.com
}
```

基於名稱的解構目前為[實驗性功能 (Experimental)](components-stability.md#stability-levels-explained)。
您可以透過 `-Xname-based-destructuring` 編譯器選項來控制編譯器如何解讀解構宣告。

它具有以下模式：

* `only-syntax`：啟用基於名稱解構的顯式形式，而不改變現有解構宣告的行為。
* `name-mismatch`：當資料類別中的基於位置解構使用了與屬性名稱不相符的變數名稱時發出警告。
* `complete`：啟用帶有圓括號的簡短形式基於名稱解構，並繼續支援使用方括號語法的基於位置解構。

如果您使用 `complete` 模式，帶有圓括號的簡短形式解構語法將會依屬性名稱配對變數，而不是依賴位置：

```kotlin
val (email, username) = user
```
#### 如何啟用 {id="language-name-based-destructuring-how-to-enable"}

要在您的專案中使用基於名稱的解構，請在組建組態檔案中新增編譯器選項：

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xname-based-destructuring=only-syntax")
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
                    <arg>-Xname-based-destructuring=only-syntax</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab> 
</tabs>

加入基於名稱的解構同時也引入了一種使用方括號進行基於位置解構的新語法：

```kotlin
// 使用顯式的基於位置解構
val [username, email] = user
```

我們計畫逐步轉向預設使用基於名稱配對的解構宣告，同時透過新的方括號語法保留基於位置的解構。

如需更多資訊，請參閱該特性的 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0438-name-based-destructuring.md)。

歡迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-19627) 中提供您的意見反應。

## 標準函式庫 {id="standard-library"}

Kotlin 2.3.20 為標準函式庫包含了一項新的實驗性功能。

### 用於建立 `Map.Entry` 不可變複本的新 API {id="standard-library-new-api-for-creating-immutable-copies-of-map-entry"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin 2.3.20 引入了 `Map.Entry.copy()` 擴充函式，用於建立 [`Map.Entry`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-map/-entry/) 的不可變複本。
此函式可讓您在修改 Map 後，透過預先複製來重複使用從 [`Map.entries`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-map/entries.html) 獲取的項目。

`Map.Entry.copy()` 目前為[實驗性功能 (Experimental)](components-stability.md#stability-levels-explained)。
若要選擇加入，請使用 `@OptIn(ExperimentalStdlibApi::class)` 註解或編譯器選項：

```bash
-opt-in=kotlin.ExperimentalStdlibApi
```

以下是使用 `Map.Entry.copy()` 從可變 Map 中移除項目的範例：

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
    val map = mutableMapOf(1 to 1, 2 to 2, 3 to 3, 4 to 4)

    val toRemove = map.entries
        .filter { it.key % 2 == 0 }
        .map { it.copy() }

    map.entries.removeAll(toRemove)

    println("map = $map")
    // map = {1=1, 3=3}
}
```

## Kotlin 編譯器外掛程式 {id="kotlin-compiler-plugins"}

Kotlin 2.3.20 為 Lombok 與 `kotlin.plugin.jpa` 編譯器外掛程式帶來了重要更新。

### 改進 `kotlin.plugin.jpa` 外掛程式中的 JPA 支援 {id="improved-jpa-support-in-the-kotlin-plugin-jpa-plugin"}
<secondary-label ref="compiler"/>

`kotlin.plugin.jpa` 外掛程式現在除了套用現有的 [`no-arg`](no-arg-plugin.md) 編譯器外掛程式之外，還會自動套用包含新加入內建 JPA 預設設定的 [`all-open`](all-open-plugin.md) 編譯器外掛程式。

此前，使用 `kotlin("plugin.jpa")` 僅會啟用帶有 JPA 預設設定的 `no-arg` 外掛程式。

在此版本中，我們改進了 `kotlin.plugin.jpa` 預設設定，以便自動設定 `all-open` 外掛程式。
這確保了延遲關聯能如預期運作，而不會導致預先載入並觸發額外的查詢。

從 Kotlin 2.3.20 開始：

* `all-open` 編譯器外掛程式提供了 JPA 預設設定。
* Gradle 的 `org.jetbrains.kotlin.plugin.jpa` 外掛程式會自動套用啟用了 JPA 預設設定的 `org.jetbrains.kotlin.plugin.all-open` 外掛程式。
* [Maven JPA 設定](kotlin-jpa-plugin.md#maven)預設啟用帶有 JPA 預設設定的 `all-open`。（IntelliJ IDEA 2026.1 起開始支援。）
* Maven 相依性 `org.jetbrains.kotlin:kotlin-maven-noarg` 現在隱式包含了 `org.jetbrains.kotlin:kotlin-maven-allopen`，因此您不再需要在 `<plugin><dependencies>` 區塊中顯式新增它。

因此，標註有以下註解的 JPA 實體
將自動被視為 `open`，並且無需額外設定即可獲得無引數建構函式：

* `javax.persistence.Entity`
* `javax.persistence.Embeddable`
* `javax.persistence.MappedSuperclass`
* `jakarta.persistence.Entity`
* `jakarta.persistence.Embeddable`
* `jakarta.persistence.MappedSuperclass`

這項變更簡化了組建組態，並改善了在 JPA 架構中使用 Kotlin 時開箱即用的體驗。

> 即將發佈的 [IntelliJ IDEA 2026.1](https://www.jetbrains.com/idea/whatsnew/) 在專案中設定 Kotlin 時會自動設定 `kotlin.plugin.jpa` 外掛程式。IDE 將提供快速修正來新增該外掛程式並移除任何多餘的 `no-arg` 建構函式宣告。
>
{style="tip"}

### Lombok 現已進入 Alpha 階段 {id="compiler-lombok-is-now-alpha"}
<primary-label ref="alpha"/>
<secondary-label ref="compiler"/>

Kotlin 1.5.20 引入了實驗性的 [Lombok 編譯器外掛程式](lombok.md)，可讓您在混合 Kotlin 與 Java 程式碼的模組中產生並使用 [Java 的 Lombok 宣告](https://projectlombok.org/)。

在 2.3.20 中，Lombok 編譯器外掛程式已晉升為 [Alpha](components-stability.md#stability-levels-explained)，因為我們計畫讓此功能達到正式環境就緒水準，但它目前仍在積極開發中。

## Kotlin/JVM {id="kotlin-jvm"}

Kotlin 2.3.20 在 Java 互通性方面帶來了多項改進。編譯器現在能識別 Vert.x 的 `@Nullable` 註解以進行可 null 性檢查。
此版本還新增了對 Java `@Unmodifiable` 和 `@UnmodifiableView` 註解的支援，將標註的集合在 Kotlin 中視為唯讀。

### 支援 Vert.x `@Nullable` 註解 {id="support-for-vert-x-nullable-annotation"}
<secondary-label ref="jvm"/>

Kotlin 2.3.20 新增了對 [`io.vertx.codegen.annotations.Nullable`](https://www.javadoc.io/doc/io.vertx/vertx-codegen/3.5.0/io/vertx/codegen/annotations/Nullable.html) 註解的支援。
編譯器現在可以識別此註解，並在預設情況下將可 null 性不符回報為警告。

若要強制執行嚴格的可 null 性檢查並將這些警告升級為錯誤，請在組建檔案中新增以下編譯器選項：

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
// build.gradle(.kts)
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xnullability-annotations=@io.vertx.codegen.annotations:strict")
    }
}
```
</tab>
<tab title="Maven" group-key="maven">

```xml
<!-- pom.xml -->
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-Xnullability-annotations=@io.vertx.codegen.annotations:strict</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```
</tab>
</tabs>

### 支援 Java 不可修改集合註解 {id="support-for-java-unmodifiable-collection-annotations"}
<secondary-label ref="jvm"/>

Kotlin 2.3.20 新增了對 [`org.jetbrains.annotations.Unmodifiable`](https://javadoc.io/doc/org.jetbrains/annotations/20.1.0/org/jetbrains/annotations/Unmodifiable.html) 與 [`org.jetbrains.annotations.UnmodifiableView`](https://javadoc.io/doc/org.jetbrains/annotations/24.0.1/org/jetbrains/annotations/UnmodifiableView.html) Java 註解的支援。

從 Kotlin 2.3.20 開始，從標有這些註解的 Java 宣告所傳回的集合將在 Kotlin 中被視為唯讀。將它們指派給可變集合型別將會產生型別不符警告。此警告預計將在 Kotlin 2.5.0 中變為錯誤。

以下為範例：

```java
// Java
public class Java {
    public static @UnmodifiableView List<Object> unmodifiableView() {
        return List.of();
    }

    public static @Unmodifiable List<Object> unmodifiable() {
        return List.of();
    }
}
```

```kotlin
// Kotlin

fun main() {
    // 回報警告：Java type mismatch
    val mutableView: MutableList<Any> = Java.unmodifiableView()
    val mutableCopy: MutableList<Any> = Java.unmodifiable()
}
```

## Kotlin/Native {id="kotlin-native"}

Kotlin 2.3.20 引入了一種適用於 C 和 Objective-C 程式庫的新實驗性互通模式、一個交叉編譯檢查器，以及用於在 Kotlin/Native 專案中停用編譯快取的新 DSL。

### 交叉編譯檢查器 {id="cross-compilation-checker"}
<secondary-label ref="native"/>

Kotlin 2.3.20 引入了一種判斷給定目標是否支援交叉編譯的方法。
這對於追蹤編譯工作狀態的第三方外掛程式非常有用。

通常情況下，Kotlin/Native 允許交叉編譯，這表示任何受支援的主機都可以為受支援的目標產生 `.klib` 構件。
但是，如果您的專案使用了 [cinterop 相依性](native-c-interop.md)，Apple 目標的構件產生仍會受到限制。

新的 `crossCompilationSupported` API 現在會檢查是否支援交叉編譯：目標應由主機管理器啟用，且該目標的所有編譯均不得涉及 cinterop 相依性。
此檢查器預設為啟用。

有關受支援目標和主機的更多資訊，請參閱 [Kotlin/Native 文件](native-target-support.md)。

### 用於停用編譯快取的新 DSL {id="new-dsl-for-disabling-compilation-cache"}
<secondary-label ref="native"/>

Kotlin 2.3.20 提供了一個新的 DSL，用於在 Kotlin/Native 專案中停用編譯快取。
其目的是讓停用快取的決定更加深思熟慮且明確。

由於停用快取會大幅減慢 Kotlin/Native 的建置速度，因此應僅在暫時且特殊的情況下使用。
這就是為什麼停用快取現在與特定的 Kotlin 版本綁定，且必須包含一個作為文件記錄的原因。

如果您確實需要在專案中停用編譯快取，請更新 Gradle 組建檔案中的 `binaries {}` 區塊，如下所示：

```kotlin
kotlin {
    listOf(
        iosX64(),
        iosArm64(),
        iosSimulatorArm64()
    ).forEach {
        // 指定您的二進位類型
        it.binaries.framework {
            baseName = "CacheKind"
            isStatic = true

            // 使用新 DSL 停用快取
            disableNativeCache(
                 version = DisableCacheInKotlinVersion.2_3_0, 
                 reason = "Cache bug",
                 issue = URI("https://youtrack.com/YY-1111")
            )
        }
    }
}
```

* `version` – 停用編譯快取的 Kotlin 版本。
* `reason`（必填）– 停用編譯快取的原因。
* `issue`（選填）– 錯誤追蹤器中相應問題的 URL。

這個新的 DSL 取代了已棄用的 `kotlin.native.cacheKind` Gradle 屬性。您可以安全地將其從 `gradle.properties` 檔案中移除。

有關改善編譯時間的更多提示，請參閱 [Kotlin/Native 文件](native-improving-compilation-time.md)。

### 適用於 C 或 Objective-C 程式庫的新互通模式 {id="native-new-interoperability-mode-for-c-or-objective-c-libraries"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="native"/>

如果您在 Kotlin Multiplatform (KMP) 程式庫或應用程式中使用了 C 或 Objective-C 程式庫，我們誠摯邀請您測試新的互通模式並分享結果。

一般而言，Kotlin/Native 支援將 C 和 Objective-C 程式庫匯入 Kotlin。
然而對於 KMP 程式庫，此功能目前會[受到](native-lib-import-stability.md#stability-of-c-and-objective-c-library-import)與舊版編譯器之 KMP 相容性問題的影響。

換言之，如果您發佈了使用特定 Kotlin 版本編譯的 KMP 程式庫，匯入 C 或 Objective-C 程式庫可能會導致該 Kotlin 程式庫無法在採用較早 Kotlin 版本的專案中使用。

為了解決這個問題及其他問題，Kotlin 團隊一直在重新設計底層使用的互通機制。
從 Kotlin 2.3.20 開始，您可以透過編譯器選項嘗試新的模式。

#### 如何啟用 {id="native-new-interoperability-mode-for-c-or-objective-c-libraries-how-to-enable"}

1. 在您的 Gradle 組建檔案中，檢查是否包含 `cinterops {}` 區塊或 `pod()` 相依性。
   如果存在這些內容，表示您的專案使用了 C 或 Objective-C 程式庫。

2. 確保您的專案使用的是 `2.3.20` 或更新版本。
3. 在同一個組建檔案中，將 `-Xccall-mode` 編譯器選項新增至 cinterop 工具呼叫中：

   ```kotlin
   kotlin {
       targets.withType<org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget>().configureEach {
           compilations.configureEach {
               cinterops.configureEach {
                   extraOpts += listOf("-Xccall-mode", "direct")
               }
           }
       }
   }
   ```

4. 如常透過執行單元測試、應用程式等方式建置並測試您的專案。
   您也可以使用 `--continue` 選項讓 Gradle 在發生失敗後繼續執行工作，這有助於一次發現更多問題。

> 請**勿**發佈使用新互通模式編譯的程式庫，因為它目前仍處於[實驗性 (Experimental)](components-stability.md#stability-levels-explained) 階段。
>
{style="warning"}

#### 回報您的結果 {id="native-new-interoperability-mode-for-c-or-objective-c-libraries-report-your-results"}

在大多數情況下，新的互通模式旨在成為一個直接替代方案。
我們計畫最終將其設為預設啟用。但為了實現這一目標，我們需要確保其盡可能穩定運行並在廣泛的專案中進行測試，原因如下：

* 新模式尚不支援某些 C 和 Objective-C 宣告（主要是相容性問題）。我們希望能更清楚了解這在真實環境中的影響，並據此排定後續步驟的優先順序。
* 可能存在我們尚未考慮到的錯誤或情況。測試具有大量相互作用特性的語言極具挑戰性，而測試各具獨特特性集之語言間的互動更是如此。

請協助我們檢驗真實專案並找出具有挑戰性的情況。
無論您是否遇到任何問題，都歡迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-83218) 的留言中分享您的測試結果。

## Kotlin/Wasm {id="kotlin-wasm"}

Kotlin 2.3.20 提升了字串操作效能、編譯時間和記憶體使用量。
它還新增了對實驗性 `@nativeInvoke` 註解的支援，讓您可以像呼叫 JavaScript 函式一樣呼叫 Kotlin 物件或類別。

### 改進字串效能 {id="improved-string-performance"}
<secondary-label ref="wasm"/>

Kotlin/Wasm 現在對 `kotlin.String` 值的操作使用 JS String 內建函式（builtins）。
這使得 Kotlin/Wasm 能夠在瀏覽器和支援該提議的 Wasm 執行階段中受益於 JavaScript 引擎的字串最佳化。
此最佳化適用於連接（concatenation）、插值（interpolation）、`StringBuilder.append()` 以及數字轉字串等操作。

這帶來了以下提升：

* 在針對性效能基準測試中，字串插值速度最高提升 4.6 倍。
* 在 [KotlinConf 應用程式](https://github.com/JetBrains/kotlinconf-app)組建中，Wasm 二進位檔大小減少約 5%。
* 在所有 Wasm 效能基準測試中，中位數改善約 1%。
* 在重度追加（append-heavy）的工作負載中，`StringBuilder.append()` 和 `kotlin.String` 執行個體的連接速度至少提升 20%。

### 改進編譯時間與記憶體最佳化 {id="improved-compilation-time-and-memory-optimizations"}
<secondary-label ref="wasm"/>

Kotlin 2.3.20 加入了編譯器最佳化，顯著降低了編譯期間的記憶體消耗，特別是在大型專案中。
這些最佳化也改善了累加建置的效能。

在我們的測試中，觀察到全新建置時間改善了 65%，累加建置時間改善了 21%。

### 支援 `@nativeInvoke` 註解 {id="support-for-nativeinvoke-annotation"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="wasm"/>

Kotlin 2.3.20 引入了對 `wasmJs` 目標的 `@nativeInvoke` 註解支援。
此註解允許您將 Kotlin 物件或類別視為 JavaScript 中的函式。
它旨在將 `external` 宣告（類別或介面）的成員函式標記為 JavaScript 物件的「呼叫運算子（invoke operator）」。

當您為函式加上註解時，在 Kotlin 中對該函式的每次呼叫都會轉換為對 JavaScript 物件本身的直接呼叫：

```kotlin
import kotlin.js.nativeInvoke

@OptIn(ExperimentalWasmJsInterop::class)
external class JsAction {
    @nativeInvoke
    operator fun invoke(data: String)
}

fun main() {
    val action = JsAction() 
    action("Run task")
}
```

這是在設計出 Kotlin/Wasm 與 JavaScript 之間的穩定互通性之前的臨時解決方案。
它可能會在未來的版本中修改或移除，當您使用它時編譯器會回報警告。

有關 Kotlin/Wasm 與 JavaScript 互通性的更多資訊，請參閱[與 JavaScript 互通](wasm-js-interop.md)。

## Kotlin/JS {id="kotlin-js"}

Kotlin 2.3.20 實現了從 TypeScript 實作 Kotlin 介面的功能，並引入了對 SWC 編譯平台的實驗性支援。

### 從 JavaScript/TypeScript 實作 Kotlin 介面 {id="implementing-kotlin-interfaces-from-javascript-typescript"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="js"/>

Kotlin 2.3.20 解除了在 JavaScript/TypeScript 端實作 Kotlin 介面的限制。在此之前，只能將 Kotlin 介面匯出為 TypeScript 介面；禁止從 TypeScript 實作它們。

現在您可以透過以下方式實作任何 Kotlin 介面：

```kotlin
// Kotlin
@JsExport
interface DataProcessor {
    suspend fun process(): String
}

@JsExport
fun registerProcessor(processor: DataProcessor) { ... }
```

```TypeScript
// TypeScript
import { DataProcessor, registerProcessor } from "my-kmp-library"

class JsonProcessor implements DataProcessor {
    readonly [DataProcessor.Symbol] = true

    async process(): Promise<string> {
        return "processed JSON data"
    }
}

registerProcessor(new JsonProcessor())
```

也可以從 TypeScript 重複使用 Kotlin 的預設實作。
雖然 TypeScript 沒有介面預設實作的概念，但您可以透過委託給 `DefaultImpls` 物件來解決這個問題：

```kotlin
// Kotlin
@JsExport
interface Logger {
    fun log(): String = "[INFO] Default log entry"
    val prefix: String get() = "LOG"
}
```

```TypeScript
// TypeScript
import { Logger, acceptLogger } from "my-kmp-library"

class ConsoleLogger implements Logger {
    readonly [Logger.Symbol] = true

    // 委託給預設方法實作
    log(): string {
        return Logger.DefaultImpls.log(this);
    }

    // 委託給預設屬性實作
    get prefix(): string {
        return Logger.DefaultImpls.prefix.get(this);
    }
}

acceptLogger(new ConsoleLogger())
```

#### 如何啟用 {id="how-to-enable-implementing-interfaces-from-typescript"}

在您的組建檔案中，新增編譯器選項：

```kotlin
kotlin { 
    js {
        // ...
        generateTypeScriptDefinitions()
        compilerOptions {
            freeCompilerArgs.add("-Xenable-implementing-interfaces-from-typescript")
        }
    }
}
```

如需更多資訊，請參閱 [`@JsExport` 註解](js-to-kotlin-interop.md#jsexport-annotation)。

### 支援 SWC 編譯平台 {id="support-for-swc-compilation-platform"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="js"/>

從 Kotlin 2.3.20 開始，Kotlin/JS 支援 [SWC](https://swc.rs/) 編譯平台。
它有助於將較新版本的 JavaScript/TypeScript 程式碼轉譯為較舊且相容性更好的 JavaScript 程式碼。

將程式碼轉換委託給外部工具，使我們能夠減少 Kotlin/JS 編譯器產生的變體數量並加速編譯器現代化，進而專注於支援最新的 JavaScript 特性。
目前，最新支援的 ECMAScript 版本仍為 `es2015`。

此外，委託轉譯工作讓我們能夠改善[內嵌 JavaScript](js-interop.md#inline-javascript) 功能。
目前它僅支援 ES5 語法（這將在 2.4.0 中變更）。
在針對較低版本時支援較新的語法極具挑戰性，因為這需要編譯器轉譯內嵌 JS 區塊本身的 JS 程式碼。
透過 SWC，我們將能夠加入現代 JS 語法，並且該工具會將程式碼轉譯為終端使用者版本所需的語法。

遷移至 SWC 還能讓您有機會在 Kotlin Gradle 外掛程式內部實作基於 [browserlist](https://browsersl.ist/) 的 DSL。
這可讓您宣告目標瀏覽器或環境，而不是特定的 JS 版本。

#### 如何啟用 {id="how-to-enable-swc-compilation"}

在您的 `gradle.properties` 檔案中，新增以下選項：

```properties
kotlin.js.delegated.transpilation=true
```

我們計畫在未來的 Kotlin 版本中穩定透過 SWC 進行的轉譯。
在它成為預設選項後，編譯多個 JS 目標的功能將完全從 Kotlin/JS 編譯器委託給轉譯器。

有關 SWC 平台的更多資訊，請參閱官方[文件](https://swc.rs/docs/getting-started)。

## Gradle {id="gradle"}

Kotlin 2.3.20 與新版本的 Gradle 相容，並包含了 Kotlin Gradle 外掛程式中對 Kotlin/JVM 編譯的變更。

### 與 Gradle 9.3.0 相容 {id="compatibility-with-gradle-9-3-0"}
<secondary-label ref="gradle"/>

Kotlin 2.3.20 完全相容於 Gradle 7.6.3 至 9.3.0 版本。您也可以使用最高至最新發佈版本的 Gradle。
但請注意，這樣做可能會導致棄用警告，且某些 Gradle 新功能可能無法正常運作。

### KGP 中二進位相容性驗證的改進 {id="improvements-to-binary-compatibility-validation-in-kgp"}
<secondary-label ref="gradle"/>

Kotlin 2.2.0 首次在 [Kotlin Gradle 外掛程式中支援二進位相容性驗證](gradle-binary-compatibility-validation.md)。Kotlin 2.3.20 新增了兩項改進。

首先，二進位相容性驗證 Gradle 任務的名稱中不再包含「Legacy」。
我們做出這項變更是因為舊的命名慣例讓 Kotlin 開發人員感到困惑：

| 舊名稱              | 新名稱                    |
|--------------------|--------------------------|
| `checkLegacyAbi`   | `checkKotlinAbi`         |
| `updateLegacyAbi`  | `updateKotlinAbi`        |
| `dumpLegacyAbi`    | `internalDumpKotlinAbi`  |

舊的任務名稱在 Kotlin 2.3.20 中仍然存在，以簡化向新名稱的過渡。

其次，如果您在專案中啟用了二進位相容性驗證，現在當您執行 `check` 任務時，Gradle 會自動執行 `checkKotlinAbi` 任務。
此前，即使 `check` 任務原本應該執行所有驗證任務，Gradle 也不會執行 `checkKotlinAbi` 任務。
這導致了 Gradle 專案中的行為不一致。

### Kotlin/JVM 編譯預設使用 Build Tools API {id="kotlin-jvm-compilation-uses-build-tools-api-by-default"}
<primary-label ref="experimental-general"/>
<secondary-label ref="gradle"/>

在 Kotlin 2.3.20 中，Kotlin Gradle 外掛程式中的 Kotlin/JVM 編譯預設使用 [Build tools API](build-tools-api.md) (BTA)。
這項內部編譯基礎結構的變更使得 Kotlin 編譯器的建置工具支援能夠更快地進行開發。

如果您發現任何問題，請在我們的[問題追蹤器](https://youtrack.jetbrains.com/newIssue?project=KT&summary=Kotlin+Gradle+plugin+BTA+migration+issue&description=Describe+the+problem+you+encountered+here.&c=tag+kgp-bta-migration)中分享您的意見反應。

## Maven {id="maven"}

Kotlin 2.3.20 帶來了一項重要變更，讓設定 Maven 專案變得更加容易。

### 簡化 Kotlin 專案的設定 {id="maven-simplified-setup-for-kotlin-projects"}
<secondary-label ref="maven"/>

Kotlin 2.3.20 讓在 Maven 專案中設定 Kotlin 變得更加容易。現在 Kotlin 支援原始碼根目錄與 Kotlin 標準函式庫的自動設定。

有了這項新設定，當您使用 Maven 建構系統建立新的 Kotlin 專案，或將 Kotlin 引進現有的 Java Maven 專案時，
您無需在 POM 組建檔案中手動指定原始碼根路徑或新增 `kotlin-stdlib` 相依性。

#### 如何啟用 {id="maven-simplified-setup-for-kotlin-projects-how-to-enable"}

在您的 `pom.xml` 檔案中，將 `<extensions>true</extensions>` 新增至 Kotlin Maven 外掛程式的 `<build><plugins>` 區段中：

```xml
<build>
    <plugins>
         <plugin>
             <groupId>org.jetbrains.kotlin</groupId>
             <artifactId>kotlin-maven-plugin</artifactId>
             <version>%kotlinVersion%</version>
             <extensions>true</extensions> <!-- 新增此擴充套件 -->
         </plugin>
    </plugins>
</build>
```

此處 `<extensions>` 選項的新功能包括：

* 當 `src/main/kotlin` 與 `src/test/kotlin` 目錄已經存在但未在外掛程式設定中指定時，將它們註冊為原始碼根目錄。
* 在尚未明確定義 `kotlin-stdlib` 相依性的情況下自動新增它。

您也可以選擇退出自動新增 Kotlin 標準函式庫。為此，請在 `<properties>` 區段中新增以下內容：

```xml
<project>
    <properties>
        <!-- 透過屬性停用智慧預設值 -->
        <kotlin.smart.defaults.enabled>false</kotlin.smart.defaults.enabled>         
    </properties>
</project>
```

請注意，此屬性不僅會停用標準函式庫的自動新增，還會停用原始碼根路徑的註冊。
其他 `<extensions>` 功能不受影響。

有關設定 Kotlin Maven 專案的更多資訊，請參閱[設定 Maven 專案](maven-configure-project.md)。

## Build tools API {id="build-tools-api"}

Kotlin 2.3.20 為希望使用建置工具 API (BTA) 將其建構系統與 Kotlin 編譯器整合的開發人員引入了更多變更。

### 建置操作的改進 {id="improvements-to-build-operations"}
<secondary-label ref="bta"/>

在此版本中，BTA 改進了建置工具管理建置操作的方式。
建置操作允許建置工具與 Kotlin 編譯器進行互動。
每個建置操作都是 [`BuildOperation`](https://github.com/JetBrains/kotlin/blob/v2.3.20/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/BuildOperation.kt#L25) 介面的實作。

您現在可以使用 [`cancel()`](https://github.com/JetBrains/kotlin/blob/v2.3.20/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/BuildOperation.kt#L108) 函式來取消實作了 [`CancellableBuildOperation`](https://github.com/JetBrains/kotlin/blob/v2.3.20/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/BuildOperation.kt#L94) 介面的建置操作。

`cancel()` 函式採「盡力而為（best effort）」原則運作。這表示不保證該操作一定會被取消。

例如：

```kotlin
val operation = toolchains.jvm.jvmCompilationOperationBuilder(sources, destination) {}

toolchains.createBuildSession().use {
    try {
        it.executeOperation(operation.build())
    } catch (e: OperationCancelledException) {
        println("Build operation has been cancelled.")
    }
}

// ...

// 來自另一個執行緒：
operation.cancel()
```

此外，建置操作現在更加穩健，因為您可以將其建立為在啟動後無法更改的形式。為此，建置工具必須使用建構器模式（Builder pattern）：

1. 使用可變建構器設定物件。
2. 呼叫 [`build()`](https://github.com/JetBrains/kotlin/blob/v2.3.20/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/jvm/operations/JvmCompilationOperation.kt#L59) 函式以建立該物件的不可變執行個體。

例如：

```kotlin
fun prepareBuildOperation(toolchains: KotlinToolchains, sources: List<Path>, destination: Path): JvmCompilationOperation {
    val builder = toolchains.jvm.jvmCompilationOperationBuilder(sources, destination)

    // 使用建構器設定操作
    builder.compilerArguments[CommonToolArguments.VERBOSE] = true
    builder[COMPILER_ARGUMENTS_LOG_LEVEL] = CompilerArgumentsLogLevel.ERROR

    // 傳回不可變的操作
    return builder.build()
}
```

### 跨建置工具的一致指標收集 {id="consistent-metric-collection-across-build-tools"}
<secondary-label ref="bta"/>

在 Kotlin 2.3.20 之前，建置指標基礎結構以 Gradle 為核心，這影響了基礎結構的某些部分（例如指標名稱）。
此外，並非所有指標都適用於不同的[編譯器執行策略](compiler-execution-strategy.md)。

在 Kotlin 2.3.20 中，BTA 為 JVM 提供了獨立於建置工具的指標收集。
無論編譯器執行策略為何，BTA 還引入了一組一致的指標。
特定於特定編譯方法或編譯器執行策略的指標僅在適用時才會回報。
例如，累加編譯指標僅在累加建置時可用，而精靈處理序特有的指標僅在使用 Kotlin 精靈（daemon）時可用。

建置工具現在可以為建置操作設定 [`BuildMetricsCollector`](https://github.com/JetBrains/kotlin/blob/v2.3.20/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/trackers/BuildMetricsCollector.kt#L16) 物件，以擷取讓使用者深入了解建置效能的建置指標：

```kotlin
val operation =
    kotlinToolchains.jvm.jvmCompilationOperationBuilder(sources, outputDirectory)
operation[BuildOperation.METRICS_COLLECTOR] = object : BuildMetricsCollector {
    override fun collectMetric(
        name: String,
        type: BuildMetricsCollector.ValueType,
        value: Long
    ) {
        // ...
    }
}
```

### 建置工具更輕鬆設定編譯器外掛程式 {id="easier-configuration-of-compiler-plugins-by-build-tools"}
<secondary-label ref="bta"/>

在 Kotlin 2.3.20 中，BTA 為建置工具提供了一種設定編譯器外掛程式的全新且更簡單的方式。
這種方法允許建置工具直接將設定傳播給其使用者。

建置工具不再需要透過命令列使用實驗性編譯器選項來設定編譯器外掛程式，而是可以使用 `kotlin.buildtools.api.arguments.CommonCompilerArguments.COMPILER_PLUGINS` 選項來設定代表編譯器外掛程式設定的物件清單：

```kotlin
import org.jetbrains.kotlin.buildtools.api.KotlinToolchains
import org.jetbrains.kotlin.buildtools.api.arguments.CompilerPlugin
import org.jetbrains.kotlin.buildtools.api.arguments.CompilerPluginOption
import org.jetbrains.kotlin.buildtools.api.arguments.CommonCompilerArguments.Companion.COMPILER_PLUGINS
import org.jetbrains.kotlin.buildtools.api.arguments.CompilerPlugin
import org.jetbrains.kotlin.buildtools.api.arguments.CompilerPluginOption
import org.jetbrains.kotlin.buildtools.api.jvm.JvmPlatformToolchain
import org.jetbrains.kotlin.buildtools.api.jvm.JvmPlatformToolchain.Companion.jvm
import org.jetbrains.kotlin.buildtools.api.jvm.operations.JvmCompilationOperation
import java.nio.file.Path

...

val toolchains: KotlinToolchains = ...
val jvmToolchain: JvmPlatformToolchain = toolchains.jvm
val operation: JvmCompilationOperation.Builder = jvmToolchain.jvmCompilationOperationBuilder(...)
val noArgPluginClasspath: List<Path> = ...
operation.compilerArguments[COMPILER_PLUGINS] = listOf(
    CompilerPlugin(
        pluginId = "org.jetbrains.kotlin.noarg",
        classpath = noArgPluginClasspath,
        rawArguments = listOf(CompilerPluginOption("annotation", "GenerateNoArgsConstructor")),
        orderingRequirements = emptySet(),
    )
)
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例程式碼"}

## 重大變更與棄用 {id="breaking-changes-and-deprecations"}

本節重點介紹重要的重大變更與棄用。有關 Kotlin 2.3.0 和 2.3.20 中棄用的更多資訊，請參閱[相容性指南](compatibility-guide-23.md)。

* 在 Kotlin 2.3.20 中，Kotlin/Wasm 將模組初始化作為 Wasm 模組具現化的一部分執行，而不是依賴外部 JavaScript 隨後呼叫 `_initialize()` 函式。
  這項變更使 Kotlin/Wasm 更加獨立，並為 [ES 模組整合提議](https://github.com/WebAssembly/esm-integration)做好了準備。

  如果您使用 [`@EagerInitialization`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-eager-initialization/) 註解，相關程式碼如果在模組初始化完成之前執行可能會失敗。我們建議除非您確實需要，否則避免使用 `@EagerInitialization` 註解。
* 實驗性上下文接收者（context receivers）已不再受支援，並由[上下文參數 (context parameters)](context-parameters.md) 取代。
* 此版本在[以 Intel 晶片為基礎的 Apple 目標棄用週期](whatsnew2220.md#deprecation-of-x86-64-apple-targets)中邁出了下一步。從 Kotlin 2.3.20 開始，我們棄用了 `macosX64`、`tvosX64` 和 `watchosX64` 目標。我們計畫在下一個 Kotlin 版本中完全移除對這些目標的支援。

  由於許多第三方程式庫仍依賴 `iosX64` 目標，我們目前將其保留在第 3 級支援層級（Tier 3）。這表示我們不保證 CI 測試，並且可能不會在不同編譯器版本之間提供原始碼和二進位相容性。有關支援層級的更多資訊，請參閱 [Kotlin/Native 目標支援](native-target-support.md)。
* 在 Kotlin 2.3.20 中，當 common 與平台原始碼集之間的相依性解析不同時，Kotlin Multiplatform 中更嚴格的相依性比對可能會導致中繼資料（metadata）編譯失敗。請參閱 [YouTrack](https://youtrack.jetbrains.com/issue/KT-84533#tldr-workaround) 中的問題以獲取詳細資訊和因應措施。

## 文件更新 {id="documentation-updates"}

我們在 Kotlin 生態系統中進行了以下文件變更：

* [Kotlin 路線圖](roadmap.md) – 查看關於語言和生態系統發展的 Kotlin 優先事項最新清單。
* [升級至 AGP 9](https://kotlinlang.org/docs/multiplatform/multiplatform-project-agp-9-migration.html) – 探索將包含 Android 應用程式的多平台專案遷移至 AGP 9 的建議。
* [為 KMP 應用程式設定 CI](https://kotlinlang.org/docs/multiplatform/kmp-ci-tutorial.html) – 按照教學設定 GitHub Actions，在多平台專案中實現持續整合。
* [Compose UI 預覽](https://kotlinlang.org/docs/multiplatform/compose-previews.html) – 了解如何在 IDE 中預覽可組合項（composables）而無需執行模擬器。
* [處理 Web 資源](https://kotlinlang.org/docs/multiplatform/compose-web-resources.html) – 尋找有關如何在 Compose Multiplatform 中處理 Web 資源的資訊。
* [設定視口 (viewport)](https://kotlinlang.org/docs/multiplatform/compose-css-styles.html) – 了解如何使用 `ComposeViewport()` 函式搭配 Compose Multiplatform for web 在 HTML canvas 上呈現您的 UI。
* [自訂編譯器外掛程式](custom-compiler-plugins.md) – 了解編譯器外掛程式的工作原理，以及在找不到適合您使用案例的外掛程式時該怎麼做。
* [應用程式架構](https://ktor.io/docs/server-application-structure.html) – 為您的 Ktor Server 應用程式選擇最佳的應用程式架構。
* [HTTP 請求生命週期](https://ktor.io/docs/server-http-request-lifecycle.html) – 了解當用戶端中斷連線時，如何利用 HTTP 請求生命週期在 Ktor 中取消請求處理。
* [相依注入](https://ktor.io/docs/server-dependency-injection.html) – 了解如何在 Ktor Server 中設定相依注入，包含最新的指引與實用範例。
* [Exposed 的 Spring Boot 整合](https://www.jetbrains.com/help/exposed/spring-boot-integration.html#requirements) – 了解如何搭配 Spring Boot 3 和 4 使用 Exposed。