[//]: # (title: Kotlin 2.3.20 的新功能)

<show-structure depth="1"/>

<web-summary>閱讀 Kotlin 2.3.20 版本說明，涵蓋新的語言特性、Kotlin Multiplatform、JVM、Native、JS 和 Wasm 的更新，以及 Gradle 和 Maven 的建置工具支援。</web-summary>

_[發佈日期：2026 年 3 月 16 日](releases.md#release-history)_

<tldr>
    <p>關於修復錯誤版本 2.3.21 的詳細資訊，請參閱 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.21">變更日誌</a></p>
</tldr>

Kotlin 2.3.20 正式發佈！以下是主要亮點：

* **Gradle**：[相容於 Gradle 9.3.0](#compatibility-with-gradle-9-3-0) 且 [Kotlin/JVM 編譯預設使用 BTA](#kotlin-jvm-compilation-uses-build-tools-api-by-default)
* **Maven**：[簡化 Kotlin 專案的設定](#simplified-setup-for-kotlin-projects)
* **Kotlin 編譯器外掛程式**：[Lombok 進入 Alpha 階段](#lombok-is-now-alpha) 且 [提升了 `kotlin.plugin.jpa` 外掛程式中的 JPA 支援](#improved-jpa-support-in-the-kotlin-plugin-jpa-plugin)
* **語言**：[支援以名稱為基礎的解構宣告](#name-based-destructuring)
* **標準程式庫**：[用於建立 `Map.Entry` 不可變複本的新 API](#new-api-for-creating-immutable-copies-of-map-entry)
* **Kotlin/Native**：[用於 C 和 Objective-C 程式庫的新互通模式](#new-interoperability-mode-for-c-or-objective-c-libraries)

> 如需了解關於 Kotlin 發佈週期的資訊，請參閱 [Kotlin 發佈流程](releases.md)。
>
{style="tip"}

## 更新至 Kotlin 2.3.20

最新版本的 Kotlin 已包含在最新版本的 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 和 [Android Studio](https://developer.android.com/studio) 中。

若要更新至新的 Kotlin 版本，請確保您的 IDE 已更新至最新版本，並在您的建置指令碼中[將 Kotlin 版本更改](releases.md#update-to-a-new-kotlin-version)為 2.3.20。

## 新功能 {id=new-stable-features}
<primary-label ref="stable"/>

以下特性在此版本中已達到[穩定 (Stable)](components-stability.md#stability-levels-explained) 階段：

<snippet id="simplified-setup-for-kotlin-projects-content">

<var name="id1" value="simplified-setup-for-kotlin-projects"/>

<var name="id2" value="simplified-setup-for-kotlin-projects-how-to-enable"/>

### 簡化 Kotlin 專案的設定 {id="%id1%"}
<secondary-label ref="maven"/>

Kotlin 2.3.20 讓在 Maven 專案中設定 Kotlin 變得更簡單。現在 Kotlin 支援自動設定原始碼根目錄和 Kotlin 標準程式庫。

透過新的設定，當您使用 Maven 建置系統建立新的 Kotlin 專案，或將 Kotlin 引入現有的 Java Maven 專案時，您不再需要手動指定原始碼根目錄路徑，也不需要在 POM 建置檔案中手動添加 `kotlin-stdlib` 相依性。

#### 如何啟用 {id="%id2%"}

在您的 `pom.xml` 檔案中，將 `<extensions>true</extensions>` 添加到 Kotlin Maven 外掛程式的 `<build><plugins>` 區段：

```xml
<build>
    <plugins>
         <plugin>
             <groupId>org.jetbrains.kotlin</groupId>
             <artifactId>kotlin-maven-plugin</artifactId>
             <version>%kotlinVersion%</version>
             <extensions>true</extensions> <!-- 加入此擴充功能 -->
         </plugin>
    </plugins>
</build>
```

此處 `<extensions>` 選項的新功能包括：

* 如果 `src/main/kotlin` 和 `src/test/kotlin` 目錄已經存在但未在外掛程式配置中指定，則會將其註冊為原始碼根目錄。
* 在尚未明確定義 `kotlin-stdlib` 相依性的情況下自動添加該相依性。

您也可以選擇停用自動添加 Kotlin 標準程式庫的功能。為此，請在 `<properties>` 區段中添加以下內容：

```xml
<project>
    <properties>
        <!-- 透過屬性停用智慧預設值 -->
        <kotlin.smart.defaults.enabled>false</kotlin.smart.defaults.enabled>         
    </properties>
</project>
```

請注意，該屬性不僅會停用自動添加標準程式庫的功能，還會停用原始碼根目錄路徑的註冊。其他 `<extensions>` 功能不受影響。

如需更多關於設定 Kotlin Maven 專案的資訊，請參閱[設定 Maven 專案](maven-configure-project.md)。

</snippet>

## 新功能 {id=new-experimental-features}
<primary-label ref="experimental-exp"/>

此版本提供以下預備穩定 (pre-stable) 特性。這包括處於 [Beta](components-stability.md#stability-levels-explained)、[Alpha](components-stability.md#stability-levels-explained) 和 [實驗性 (Experimental)](components-stability.md#stability-levels-explained) 狀態的特性：

* [編譯器：Lombok 現在進入 Alpha 階段](#lombok-is-now-alpha)
* [語言：以名稱為基礎的解構](#name-based-destructuring)
* [標準程式庫：用於建立 `Map.Entry` 不可變複本的新 API](#new-api-for-creating-immutable-copies-of-map-entry)
* [Kotlin/Native：用於 C 或 Objective-C 程式庫的新互通模式](#new-interoperability-mode-for-c-or-objective-c-libraries)

<snippet id="lombok-is-now-alpha-content">

<var name="id3" value="lombok-is-now-alpha"/>

### Lombok 現在進入 Alpha 階段 {id="%id3%"}
<primary-label ref="alpha"/>
<secondary-label ref="compiler"/>

Kotlin 1.5.20 引入了實驗性的 [Lombok 編譯器外掛程式](lombok.md)，讓您可以在混合使用 Kotlin 和 Java 程式碼的模組中產生並使用 [Java 的 Lombok 宣告](https://projectlombok.org/)。

在 2.3.20 中，Lombok 編譯器外掛程式已晉升為 [Alpha](components-stability.md#stability-levels-explained) 階段，因為我們計畫讓此功能達到生產就緒水準，但目前它仍在開發中。

</snippet>

<snippet id="name-based-destructuring-content">

<var name="id4" value="name-based-destructuring"/>

<var name="id5" value="name-based-destructuring-how-to-enable"/>

### 以名稱為基礎的解構 {id="%id4%"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="language"/>

Kotlin 2.3.20 引入了 *以名稱為基礎的解構宣告 (name-based destructuring declarations)*，它將變數與屬性名稱配對，而不是依賴以位置為基礎的 `componentN()` 函式。

先前，[解構宣告](destructuring-declarations.md) 使用以位置為基礎的解構：

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

在此範例中，由於解構依賴於 `componentN()` 函式的順序，`email` 會接收 `username` 的值，而 `username` 會接收 `email` 的值。

從 Kotlin 2.3.20 開始，您可以使用以名稱為基礎的解構，其中每個變數按名稱參照屬性：

```kotlin
fun main() {
    val user = User("alice", "alice@example.com")

    // 使用顯式形式的按名稱解構
    (val mail = email, val name = username) = user

    println(name)
    // alice

    println(mail)
    // alice@example.com
}
```

以名稱為基礎的解構目前處於 [實驗性 (Experimental)](components-stability.md#stability-levels-explained) 階段。您可以使用 `-Xname-based-destructuring` 編譯器選項來控制編譯器如何解釋解構宣告。

它具有以下模式：

* `only-syntax` 啟用顯式形式的按名稱解構，而不更改現有解構宣告的行為。
* `name-mismatch` 當資料類別中的以位置為基礎的解構使用的變數名稱與屬性名稱不符時，報告警告。
* `complete` 啟用使用圓括號的短形式按名稱解構，並繼續支援使用方括號語法的以位置為基礎的解構。

如果您使用 `complete` 模式，使用圓括號的短形式解構語法會將變數與屬性名稱配對，而不是依賴位置：

```kotlin
val (email, username) = user
```
#### 如何啟用 {id="%id5%"}

要在您的專案中使用以名稱為基礎的解構，請將編譯器選項添加到您的組建組態檔案中：

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

選擇啟用以名稱為基礎的解構後，還會引入一種使用方括號進行以位置為基礎的解構的新語法：

```kotlin
// 使用顯式的以位置為基礎的解構
val [username, email] = user
```

我們計畫逐步過渡到預設使用以名稱為基礎配對的解構宣告，同時保留使用新方括號語法的以位置為基礎的解構。

如需更多資訊，請參閱該特性的 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0438-name-based-destructuring.md)。

我們非常歡迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-19627) 提供回饋。

</snippet>

<snippet id="new-api-for-creating-immutable-copies-of-map-entry-content">

<var name="id6" value="new-api-for-creating-immutable-copies-of-map-entry"/>

### 用於建立 `Map.Entry` 不可變複本的新 API {id="%id6%"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin 2.3.20 引入了 `Map.Entry.copy()` 擴充函式，用於建立 [`Map.Entry`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-map/-entry/) 的不可變複本。此函式允許您在修改 Map 後，透過先複製條目的方式來重複使用從 [`Map.entries`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-map/entries.html) 取得的條目。

`Map.Entry.copy()` 目前處於 [實驗性 (Experimental)](components-stability.md#stability-levels-explained) 階段。要選擇啟用，請使用 `@OptIn(ExperimentalStdlibApi::class)` 註解或編譯器選項：

```bash
-opt-in=kotlin.ExperimentalStdlibApi
```

以下是使用 `Map.Entry.copy()` 從可變 Map 中移除條目的範例：

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

### 用於 C 或 Objective-C 程式庫的新互通模式 {id="%id7%"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="native"/>

如果您在 Kotlin Multiplatform (KMP) 程式庫或應用程式中使用 C 或 Objective-C 程式庫，我們邀請您測試新的互通模式並分享結果。

一般而言，Kotlin/Native 支援將 C 和 Objective-C 程式庫匯入 Kotlin。然而，對於 KMP 程式庫，此功能目前受限於 KMP 與舊版編譯器的相容性[問題](native-lib-import-stability.md#stability-of-c-and-objective-c-library-import)。

換句話說，如果您發佈了一個使用特定 Kotlin 版本編譯的 KMP 程式庫，匯入 C 或 Objective-C 程式庫可能會導致該 Kotlin 程式庫無法在早期 Kotlin 版本的專案中使用。

為了解決這個問題和其他問題，Kotlin 團隊一直在修訂底層使用的互通機制。從 Kotlin 2.3.20 開始，您可以透過編譯器選項嘗試新的模式。

#### 如何啟用 {id="%id8%"}

1. 在您的 Gradle 建置檔案中，檢查是否有 `cinterops {}` 區塊或 `pod()` 相依性。如果存在這些內容，表示您的專案使用了 C 或 Objective-C 程式庫。
2. 確保您的專案使用 `2.3.20` 或更新版本。
3. 在同一個建置檔案中，將 `-Xccall-mode` 編譯器選項添加到 cinterop 工具呼叫中：

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

4. 照常執行單元測試、啟動應用程式等方式來建置並測試您的專案。您也可以使用 `--continue` 選項允許 Gradle 在發生失敗後繼續執行任務，這有助於一次發現更多問題。

> 請**不要**發佈使用新互通模式編譯的程式庫，因為它仍處於 [實驗性 (Experimental)](components-stability.md#stability-levels-explained) 階段。
>
{style="warning"}

#### 報告您的結果 {id="%id9%"}

在大多數情況下，新的互通模式應該可以作為直接替換。我們計畫最終將其設為預設啟用。但為了實現這一點，我們需要確保它能盡可能良好地運作，並在廣泛的專案上進行測試，因為：

* 某些 C 和 Objective-C 宣告在新模式中尚未受支援（主要是因為相容性問題）。我們希望更深入地了解這對實際環境的影響，並據此排定後續步驟的優先順序。
* 可能存在我們尚未考慮到的錯誤或情況。測試具有眾多交互特性的語言具有挑戰性，而測試語言間（每種語言都有一套獨特的特性）的交互更是如此。

請協助我們檢查實際專案並識別具挑戰性的案例。無論您是否遇到問題，請在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-83218) 的評論中分享您的結果。

</snippet>

## 語言

Kotlin 2.3.20 添加了以名稱為基礎的解構宣告，將變數與屬性名稱配對，而不是依賴位置。此外還引入了針對具有上下文參數 (context parameters) 的宣告的多載解析變動。

### 上下文參數多載解析的變動
<secondary-label ref="language"/>

Kotlin 2.3.20 引入了針對具有上下文參數的宣告的多載解析 (overload resolution) 變動。

先前，多載解析會將具有上下文參數的宣告視為比不具備這些參數的宣告更具體。

從 Kotlin 2.3.20 開始，此規則不再適用，使多載選取更加統一。因此，先前可以解析的呼叫現在可能變得具有歧義，當多載僅因上下文參數而異時，會導致編譯錯誤。在此類情況下，編譯器會發出潛在歧義的警告。

以下是一個範例：

```kotlin
class Logger {
    fun info(msg: String) = println("INFO: $msg")
}

fun saveUser(id: Int) {
    println("Saving user $id (no logger)")
}

// 報告警告：Contextual declaration is shadowed
context(logger: Logger)
fun saveUser(id: Int) {
    logger.info("Saving user $id")
}

fun main() {
    val logger = Logger()

    context(logger) {
        // 在 2.3.20 中報告歧義錯誤
        saveUser(1)
    }
}
```

此外，Kotlin 2.3.20 將 `kotlin.context` 的多載數量從 22 個減少到 6 個，以減少解析和程式碼補全過程中過多的多載候選項。

<include from="whatsnew2320.md" element-id="name-based-destructuring-content">
<var name="id4" value="language-name-based-destructuring"/>
<var name="id5" value="language-name-based-destructuring-how-to-enable"/>
</include>

## 標準程式庫

Kotlin 2.3.20 為標準程式庫包含了一個新的實驗性特性。

<include from="whatsnew2320.md" element-id="new-api-for-creating-immutable-copies-of-map-entry-content">
<var name="id6" value="standard-library-new-api-for-creating-immutable-copies-of-map-entry"/>
</include>

## Kotlin 編譯器外掛程式

Kotlin 2.3.20 為 Lombok 和 `kotlin.plugin.jpa` 編譯器外掛程式帶來了重要的更新。

### 提升了 `kotlin.plugin.jpa` 外掛程式中的 JPA 支援
<secondary-label ref="compiler"/>

`kotlin.plugin.jpa` 外掛程式現在除了套用現有的 [`no-arg`](no-arg-plugin.md) 編譯器外掛程式外，還會透過新加入的內建 JPA 預設自動套用 [`all-open`](all-open-plugin.md) 編譯器外掛程式。

先前，使用 `kotlin("plugin.jpa")` 僅啟用了具有 JPA 預設的 `no-arg` 外掛程式。

在此版本中，我們改進了 `kotlin.plugin.jpa` 預設，以便自動配置 `all-open` 外掛程式。這能確保延遲關聯 (lazy associations) 如預期運作，而不會導致預先載入 (eager loading) 並觸發額外的查詢。

從 Kotlin 2.3.20 開始：

* `all-open` 編譯器外掛程式提供 JPA 預設。
* Gradle `org.jetbrains.kotlin.plugin.jpa` 外掛程式會自動套用啟用 JPA 預設的 `org.jetbrains.kotlin.plugin.all-open` 外掛程式。
* [Maven JPA 設定](no-arg-plugin.md#jpa-support) 預設啟用帶有 JPA 預設的 `all-open`。 (IntelliJ IDEA 支援自 2026.1 起提供。)
* Maven 相依性 `org.jetbrains.kotlin:kotlin-maven-noarg` 現在隱含包含 `org.jetbrains.kotlin:kotlin-maven-allopen`，因此您不再需要在 `<plugin><dependencies>` 區塊中明確添加它。

因此，標註有以下註解的 JPA 實體會自動被視為 `open`，並在無需額外配置的情況下獲得無引數建構函式：

* `javax.persistence.Entity`
* `javax.persistence.Embeddable`
* `javax.persistence.MappedSuperclass`
* `jakarta.persistence.Entity`
* `jakarta.persistence.Embeddable`
* `jakarta.persistence.MappedSuperclass`

此項變動簡化了組建組態，並提升了在搭配 JPA 架構使用 Kotlin 時的開箱即用體驗。

> 即將發佈的 [IntelliJ IDEA 2026.1](https://www.jetbrains.com/idea/whatsnew/) 在專案中設定 Kotlin 時會自動配置 `kotlin.plugin.jpa` 外掛程式。IDE 會提供快速修正來添加該外掛程式，並移除任何冗餘的無引數建構函式宣告。
>
{style="tip"}

<include from="whatsnew2320.md" element-id="lombok-is-now-alpha-content">
<var name="id3" value="compiler-lombok-is-now-alpha"/>
</include>

## Kotlin/JVM

Kotlin 2.3.20 引入了多項 Java 互通性的改進。編譯器現在能辨識用於可 null 性檢查的 Vert.x `@Nullable` 註解。
此版本還增加了對 Java `@Unmodifiable` 和 `@UnmodifiableView` 註解的支援，以便在 Kotlin 中將標註的集合視為唯讀。

### 支援 Vert.x `@Nullable` 註解
<secondary-label ref="jvm"/>

Kotlin 2.3.20 增加了對 [`io.vertx.codegen.annotations.Nullable`](https://www.javadoc.io/doc/io.vertx/vertx-codegen/3.5.0/io/vertx/codegen/annotations/Nullable.html) 註解的支援。
編譯器現在能辨識此註解，並在預設情況下將可 null 性不符報告為警告。

若要強制執行嚴格的可 null 性檢查並將這些警告升級為錯誤，請將以下編譯器選項添加到您的建置檔案中：

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

### 支援 Java 不可變集合註解
<secondary-label ref="jvm"/>

Kotlin 2.3.20 增加了對 [`org.jetbrains.annotations.Unmodifiable`](https://javadoc.io/doc/org.jetbrains/annotations/20.1.0/org/jetbrains/annotations/Unmodifiable.html) 和 [`org.jetbrains.annotations.UnmodifiableView`](https://javadoc.io/doc/org.jetbrains/annotations/24.0.1/org/jetbrains/annotations/UnmodifiableView.html) Java 註解的支援。

從 Kotlin 2.3.20 開始，標有這些註解的 Java 宣告所傳回的集合在 Kotlin 中將被視為唯讀。將其指派給可變集合型別會導致型別不相符警告。此警告預計將在 Kotlin 2.5.0 中變為錯誤。

以下是一個範例：

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
    // 報告警告：Java type mismatch
    val mutableView: MutableList<Any> = Java.unmodifiableView()
    val mutableCopy: MutableList<Any> = Java.unmodifiable()
}
```

## Kotlin/Native

Kotlin 2.3.20 引入了用於 C 和 Objective-C 程式庫的新實驗性互通模式、交叉編譯檢查器，以及用於在 Kotlin/Native 專案中停用編譯快取的新 DSL。

### 交叉編譯檢查器
<secondary-label ref="native"/>

Kotlin 2.3.20 引入了一種方法來確定給定目標是否支援交叉編譯 (cross-compilation)。
這對於關注編譯任務狀態的第三方外掛程式非常有用。

一般而言，Kotlin/Native 允許交叉編譯，這意味著任何受支援的主機能為受支援的目標產出 `.klib` 構件。
然而，如果您的專案使用 [cinterop 相依性](native-c-interop.md)，Apple 目標的構件產出仍然受到限制。

新的 `crossCompilationSupported` API 現在會檢查是否支援交叉編譯：目標應該由主機管理員啟用，且該目標的所有編譯都不應涉及 cinterop 相依性。
該檢查器預設為啟用。

如需更多關於受支援目標與主機的資訊，請參閱 [Kotlin/Native 文件](native-target-support.md)。

### 停用編譯快取的新 DSL
<secondary-label ref="native"/>

Kotlin 2.3.20 提供了一個新的 DSL，用於在 Kotlin/Native 專案中停用編譯快取。
這旨在使停用快取的決定更加深思熟慮且明確。

由於停用快取會顯著降低 Kotlin/Native 的建置速度，因此應僅在例外情況下暫時使用。
這就是為什麼停用快取現在與特定的 Kotlin 版本綁定，並且必須包含一個原因作為說明文件。

如果您確實需要在專案中停用編譯快取，請按照以下方式更新 Gradle 建置檔案中的 `binaries {}` 區塊：

```kotlin
kotlin {
    listOf(
        iosX64(),
        iosArm64(),
        iosSimulatorArm64()
    ).forEach {
        // 指定您的二進制檔類型
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
* `reason` (必填) – 停用編譯快取的原因。
* `issue` (選填) – 指向您的問題追蹤器中對應問題的 URL。

新的 DSL 取代了已棄用的 `kotlin.native.cacheKind` Gradle 屬性。您可以安全地從 `gradle.properties` 檔案中將其移除。

如需更多提升編譯速度的技巧，請參閱 [Kotlin/Native 文件](native-improving-compilation-time.md)。

<include from="whatsnew2320.md" element-id="new-interoperability-mode-for-c-or-objective-c-libraries-content">
<var name="id7" value="native-new-interoperability-mode-for-c-or-objective-c-libraries"/>
<var name="id8" value="native-new-interoperability-mode-for-c-or-objective-c-libraries-how-to-enable"/>
<var name="id9" value="native-new-interoperability-mode-for-c-or-objective-c-libraries-report-your-results"/>
</include>

## Kotlin/Wasm

Kotlin 2.3.20 提升了字串操作的效能、編譯時間和記憶體使用量。
它還增加了對實驗性 `@nativeInvoke` 註解的支援，讓您可以像呼叫 JavaScript 函式一樣呼叫 Kotlin 物件或類別。

### 提升字串效能
<secondary-label ref="wasm"/>

Kotlin/Wasm 現在針對 `kotlin.String` 值的操作使用 JS 字串內建功能 (JS String builtins)。
這讓 Kotlin/Wasm 能從瀏覽器和支援該提案的 Wasm 執行環境中的 JavaScript 引擎字串優化中受益。
此優化適用於連接 (concatenation)、插值 (interpolation)、`StringBuilder.append()` 以及數字轉字串等操作。

其結果包括：

* 在定向基準測試中，字串插值速度提升高達 4.6 倍。
* 在 [KotlinConf 應用程式](https://github.com/JetBrains/kotlinconf-app) 建置中，Wasm 二進制檔大小減少約 5%。
* 在所有 Wasm 基準測試中，中位數提升約 1%。
* 在重度使用附加的工作負載中，`StringBuilder.append()` 和 `kotlin.String` 實例的連接速度提升至少 20%。

### 提升編譯時間與記憶體優化
<secondary-label ref="wasm"/>

Kotlin 2.3.20 加入了編譯器優化，可顯著降低編譯期間的記憶體消耗，特別是在大型專案中。
這些優化也提升了增量建置效能。

在我們的測試中，我們觀察到全新建置 (clean build) 時間提升了 65%，增量建置時間提升了 21%。

### 支援 `@nativeInvoke` 註解
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="wasm"/>

Kotlin 2.3.20 引入了對 `wasmJs` 目標的 `@nativeInvoke` 註解支援。
此註解允許您將 Kotlin 物件或類別視為 JavaScript 中的函式。
它旨在將 `external` 宣告（類別或介面）的成員函式標記為 JavaScript 物件的「invoke 運算子」。

當您標註一個函式時，Kotlin 中對該函式的每次呼叫都會被轉換為對 JavaScript 物件本身的直接呼叫：

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
它可能會在未來的發佈版本中被修改或移除，且當您使用它時編譯器會報告警告。

如需更多關於 Kotlin/Wasm 與 JavaScript 互通性的資訊，請參閱[與 JavaScript 的互通性](wasm-js-interop.md)。

## Kotlin/JS

Kotlin 2.3.20 實現了從 TypeScript 實作 Kotlin 介面的可能性，並引入了對 SWC 編譯平台的實驗性支援。

### 從 JavaScript/TypeScript 實作 Kotlin 介面
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="js"/>

Kotlin 2.3.20 解除了在 JavaScript/TypeScript 端實作 Kotlin 介面的限制。先前，只能將 Kotlin 介面作為 TypeScript 介面匯出到 TypeScript；禁止從 TypeScript 實作它們。

現在您可以按照以下方式實作任何 Kotlin 介面：

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

在您的建置檔案中，添加新的編譯器選項：

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

### 支援 SWC 編譯平台
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="js"/>

從 Kotlin 2.3.20 開始，Kotlin/JS 支援 [SWC](https://swc.rs/) 編譯平台。
它有助於將較新版本的 JavaScript/TypeScript 程式碼轉譯 (transpile) 為舊版且更具相容性的 JavaScript 程式碼。

將程式碼轉換委託給外部工具，讓我們能減少 Kotlin/JS 編譯器產出的變體數量，並加快編譯器現代化的腳步，僅專注於支援最新的 JavaScript 特性。
目前最新支援的 ECMAScript 版本仍為 `es2015`。

此外，委託轉譯工作讓我們能改進[內嵌 JavaScript (inlined JavaScript)](js-interop.md#inline-javascript) 功能。
目前它僅支援 ES5 語法（這將在 2.4.0 中更改）。
針對較舊版本時支援較新語法會具有挑戰性，因為這需要編譯器轉譯內嵌 JS 區塊本身的 JS 程式碼。
有了 SWC，我們將能添加現代 JS 語法，工具會將程式碼轉譯為終端用戶版本所需的語法。

遷移到 SWC 還讓您有機會在 Kotlin Gradle 外掛程式中實作基於 [browserlist](https://browsersl.ist/) 的 DSL。
這允許您宣告目標瀏覽器或環境，而不是特定的 JS 版本。

#### 如何啟用 {id="how-to-enable-swc-compilation"}

在您的 `gradle.properties` 檔案中，添加以下選項：

```properties
kotlin.js.delegated.transpilation=true
```

我們計畫在未來的 Kotlin 版本中穩定透過 SWC 進行的轉譯。
在它成為預設值後，編譯多個 JS 目標的功能將完全從 Kotlin/JS 編譯器委託給轉譯器。

如需更多關於 SWC 平台的資訊，請參閱官方 [文件](https://swc.rs/docs/getting-started)。

## Gradle

Kotlin 2.3.20 相容於新版本的 Gradle，並包含 Kotlin Gradle 外掛程式中對 Kotlin/JVM 編譯的更動。

### 相容於 Gradle 9.3.0
<secondary-label ref="gradle"/>

Kotlin 2.3.20 完全相容於 Gradle 7.6.3 至 9.3.0。您也可以使用到最新發佈版本為止的 Gradle 版本。
然而請注意，這樣做可能會導致棄用警告，且某些新的 Gradle 功能可能無法運作。

### 提升 KGP 中的二進制相容性驗證
<secondary-label ref="gradle"/>

Kotlin 2.2.0 首次帶來了 [Kotlin Gradle 外掛程式中的二進制相容性驗證](gradle-binary-compatibility-validation.md) 支援。Kotlin 2.3.20 則加入了兩項改進。

首先，二進制相容性驗證 Gradle 任務的名稱中不再包含 "Legacy"。
我們做出此更改是因為舊的命名慣例困擾了 Kotlin 開發人員：

| 舊名稱           | 新名稱                 |
|--------------------|--------------------------|
| `checkLegacyAbi`   | `checkKotlinAbi`         |
| `updateLegacyAbi`  | `updateKotlinAbi`        |
| `dumpLegacyAbi`    | `internalDumpKotlinAbi`  |

舊的任務名稱在 Kotlin 2.3.20 中仍然存在，以簡化過渡到新名稱的過程。

其次，如果您在專案中啟用了二進制相容性驗證，現在當您執行 `check` 任務時，Gradle 會自動執行 `checkKotlinAbi` 任務。
先前即使 `check` 任務應該執行所有驗證任務，Gradle 也不會執行 `checkKotlinAbi` 任務。
這導致了 Gradle 專案中的行為不一致。

### Kotlin/JVM 編譯預設使用建置工具 API
<primary-label ref="experimental-general"/>
<secondary-label ref="gradle"/>

在 Kotlin 2.3.20 中，Kotlin/JVM 編譯在 Kotlin Gradle 外掛程式中預設使用[建置工具 API](build-tools-api.md) (BTA)。這項內部編譯基礎設施的更動讓 Kotlin 編譯器的建置工具支援開發速度更快。

如果您發現任何問題，請在我們的 [問題追蹤器](https://youtrack.jetbrains.com/newIssue?project=KT&summary=Kotlin+Gradle+plugin+BTA+migration+issue&description=Describe+the+problem+you+encountered+here.&c=tag+kgp-bta-migration) 中分享您的回饋。

## Maven

Kotlin 2.3.20 帶來了一項重要變動，讓您的 Maven 專案設定更簡單。

<include from="whatsnew2320.md" element-id="simplified-setup-for-kotlin-projects-content">
<var name="id1" value="maven-simplified-setup-for-kotlin-projects"/>
<var name="id2" value="maven-simplified-setup-for-kotlin-projects-how-to-enable"/>
</include>

## 建置工具 API

Kotlin 2.3.20 為希望使用建置工具 API (BTA) 將其建置系統與 Kotlin 編譯器整合的開發人員引入了更多變動。

### 建置操作的改進
<secondary-label ref="bta"/>

在此版本中，BTA 改進了建置工具管理建置操作的方式。
建置操作讓建置工具能與 Kotlin 編譯器互動。
每個建置操作都是 [`BuildOperation`](https://github.com/JetBrains/kotlin/blob/v2.3.20/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/BuildOperation.kt#L25) 介面的實作。

您現在可以使用 [`cancel()`](https://github.com/JetBrains/kotlin/blob/v2.3.20/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/BuildOperation.kt#L108) 函式來取消實作了 [`CancellableBuildOperation`](https://github.com/JetBrains/kotlin/blob/v2.3.20/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/BuildOperation.kt#L94) 介面的建置操作。

`cancel()` 函式以「盡力而為 (best effort)」原則運作。這意味著不保證操作一定會被取消。

例如：

```kotlin
val operation = toolchains.jvm.jvmCompilationOperationBuilder(sources, destination) {}

toolchains.createBuildSession().use {
    try {
        it.executeOperation(operation.build())
    } catch (e: OperationCancelledException) {
        println("建置操作已被取消。")
    }
}

// ...

// 從另一個執行緒呼叫：
operation.cancel()
```

此外，建置操作現在更加穩健，因為您可以建立它們使其在啟動後無法更改。為此，建置工具必須使用產生器模式 (builder pattern)：

1. 使用可變的產生器 (builder) 配置物件。
2. 呼叫 [`build()`](https://github.com/JetBrains/kotlin/blob/v2.3.20/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/jvm/operations/JvmCompilationOperation.kt#L59) 函式來建立物件的不可變實例。

例如：

```kotlin
fun prepareBuildOperation(toolchains: KotlinToolchains, sources: List<Path>, destination: Path): JvmCompilationOperation {
    val builder = toolchains.jvm.jvmCompilationOperationBuilder(sources, destination)

    // 使用 builder 配置操作
    builder.compilerArguments[CommonToolArguments.VERBOSE] = true
    builder[COMPILER_ARGUMENTS_LOG_LEVEL] = CompilerArgumentsLogLevel.ERROR

    // 回傳不可變的操作
    return builder.build()
}
```

### 各建置工具間一致的指標收集
<secondary-label ref="bta"/>

在 Kotlin 2.3.20 之前，建置指標 (build metrics) 基礎設施是以 Gradle 為中心的，這影響了部分基礎設施，例如指標名稱。
此外，並非所有指標都適用於不同的[編譯器執行策略](compiler-execution-strategy.md)。

在 Kotlin 2.3.20 中，BTA 為 JVM 提供了與建置工具無關的指標收集。
BTA 還引入了一套一致的指標，無論採用哪種編譯器執行策略。
僅在適用時報告特定於某種編譯方法或編譯器執行策略的指標。
例如，增量編譯指標僅在增量建置時可用，而守護程序特定的指標僅在啟用 Kotlin 守護程序時可用。

建置工具現在可以為建置操作配置 [`BuildMetricsCollector`](https://github.com/JetBrains/kotlin/blob/v2.3.20/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/trackers/BuildMetricsCollector.kt#L16) 物件，以擷取能讓用戶了解建置效能的指標：

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

### 建置工具更容易配置編譯器外掛程式
<secondary-label ref="bta"/>

在 Kotlin 2.3.20 中，BTA 提供了一種全新且更簡單的方式供建置工具配置編譯器外掛程式。
此方法允許建置工具直接將配置傳遞給其用戶。

建置工具不再需要透過命令列使用實驗性編譯器選項配置編譯器外掛程式，而是可以使用 `kotlin.buildtools.api.arguments.CommonCompilerArguments.COMPILER_PLUGINS` 選項來配置代表編譯器外掛程式組態的物件列表：

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

## 重大變更與棄用

本節重點介紹重要的重大變更和棄用。如需更多關於 Kotlin 2.3.0 和 2.3.20 中棄用的資訊，請參閱 [相容性指南](compatibility-guide-23.md)。

* 在 Kotlin 2.3.20 中，Kotlin/Wasm 會在 Wasm 模組具現化過程中執行模組初始化，而不是依靠外部 JavaScript 隨後呼叫 `_initialize()` 函式。
  此變動使 Kotlin/Wasm 更加獨立，並為 [ES 模組整合提案](https://github.com/WebAssembly/esm-integration) 做好準備。

  如果您使用 [`@EagerInitialization`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-eager-initialization/) 註解，相關程式碼如果在模組初始化完成前執行可能會失敗。我們建議除非確有需要，否則應避免使用 `@EagerInitialization` 註解。
* 實驗性的上下文接收者 (context receivers) 不再受支援，並由 [上下文參數 (context parameters)](context-parameters.md) 取代。
* 此版本在[基於 Intel 晶片的 Apple 目標棄用週期](whatsnew2220.md#deprecation-of-x86-64-apple-targets)中邁出了下一步。從 Kotlin 2.3.20 開始，我們棄用了 `macosX64`、`tvosX64` 和 `watchosX64` 目標。我們計畫在下一個 Kotlin 版本中完全移除對這些目標的支援。

  由於許多第三方程式庫仍依賴 `iosX64` 目標，我們目前將其保留在第 3 級支援 (support tier 3) 中。這意味著我們不保證 CI 測試，且可能不提供不同編譯器版本間的原始碼和二進制相容性。如需更多關於支援分級的資訊，請參閱 [Kotlin/Native 目標支援](native-target-support.md)。
* 在 Kotlin 2.3.20 中，Kotlin Multiplatform 中更嚴格的相依性配對可能會在通用 (common) 與平台 (platform) 原始碼集間的相依性解析不同時，導致元資料編譯失敗。詳情及解決方法請參閱 [YouTrack](https://youtrack.jetbrains.com/issue/KT-84533#tldr-workaround) 中的問題。

## 文件更新

我們對 Kotlin 生態系統中的文件進行了以下更改：

* [Kotlin 路線圖](roadmap.md) – 查看更新後的 Kotlin 語言和生態系統發展優先順序列表。
* [升級至 AGP 9](https://kotlinlang.org/docs/multiplatform/multiplatform-project-agp-9-migration.html) – 探索我們對於將包含 Android App 的多平台專案遷移至 AGP 9 的建議。
* [為 KMP App 配置 CI](https://kotlinlang.org/docs/multiplatform/kmp-ci-tutorial.html) – 按照教學為多平台專案中的持續整合配置 GitHub Actions。
* [Compose UI 預覽](https://kotlinlang.org/docs/multiplatform/compose-previews.html) – 了解如何在不執行模擬器的情況下在 IDE 中預覽可組合項 (composables)。
* [處理 Web 資源](https://kotlinlang.org/docs/multiplatform/compose-web-resources.html) – 查找如何在 Compose Multiplatform 中處理 Web 資源的資訊。
* [設定視區 (viewport)](https://kotlinlang.org/docs/multiplatform/compose-css-styles.html) – 了解如何使用 `ComposeViewport()` 函式在 HTML 畫布上使用 Compose Multiplatform for web 渲染您的 UI。
* [自訂編譯器外掛程式](custom-compiler-plugins.md) – 了解編譯器外掛程式的工作原理，以及在找不到適合您使用案例的外掛程式時該怎麼辦。
* [應用程式結構](https://ktor.io/docs/server-application-structure.html) – 為您的 Ktor Server 應用程式選擇最佳的應用程式結構。
* [HTTP 請求生命週期](https://ktor.io/docs/server-http-request-lifecycle.html) – 了解如何在 Ktor 中使用 HTTP 請求生命週期，在用戶端斷開連線時取消請求處理。
* [相依注入](https://ktor.io/docs/server-dependency-injection.html) – 了解如何在 Ktor Server 中配置相依注入，並附有更新的指引和實例。
* [Exposed 的 Spring Boot 整合](https://www.jetbrains.com/help/exposed/spring-boot-integration.html#requirements) – 了解如何將 Exposed 與 Spring Boot 3 和 4 搭配使用。