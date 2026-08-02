[//]: # (title: Kotlin Multiplatform 專案結構基礎)

透過 Kotlin Multiplatform，您可以在不同平台之間共享程式碼。本文將說明共享程式碼的限制、如何區分程式碼中的共享部分與平台特定部分，以及如何指定這些共享程式碼運作的平台。

您還將學習 Kotlin Multiplatform 專案設定的核心概念，例如通用程式碼、目標 (targets)、平台特定原始碼集 (source sets) 與中間原始碼集，以及測試整合。這將有助於您日後設定自己的多平台專案。

此處呈現的模型與 Kotlin 實際使用的模型相比有所簡化。然而，這個基礎模型對於大多數情況應該已經足夠。

## 通用程式碼 (Common code)

「通用程式碼」是在不同平台之間共享的 Kotlin 程式碼。

請考慮這個簡單的 "Hello, World" 範例：

```kotlin
fun greeting() {
    println("Hello, Kotlin Multiplatform!")
}
```

在平台間共享的 Kotlin 程式碼通常位於 `commonMain` 目錄中。程式碼檔案的位置非常重要，因為它會影響該程式碼被編譯到的平台列表。

Kotlin 編譯器將原始碼作為輸入，並產生一組平台特定的二進位檔作為結果。在編譯多平台專案時，它可以從相同的程式碼中產生多個二進位檔。例如，編譯器可以從同一個 Kotlin 檔案產生 JVM `.class` 檔案和原生可執行檔：

![通用程式碼](common-code-diagram.svg){width=700}

並非每一段 Kotlin 程式碼都能編譯到所有平台。如果程式碼無法編譯到其他平台，Kotlin 編譯器會阻止您在通用程式碼中使用平台特定的函式或類別。

例如，您不能在通用程式碼中使用 `java.io.File` 相依性。它是 JDK 的一部分，而通用程式碼也會被編譯為原生程式碼，但在原生程式碼中並無 JDK 類別可用：

![未解決的 Java 參考](unresolved-java-reference.png){width=500}

在通用程式碼中，您可以使用 Kotlin Multiplatform 程式庫。這些程式庫提供了一個通用 API，可以在不同平台上以不同方式實作。在這種情況下，平台特定的 API 作為額外部分，嘗試在通用程式碼中使用此類 API 將導致錯誤。

例如， `kotlinx.coroutines` 是一個支援所有目標的 Kotlin Multiplatform 程式庫，但它也有一個平台特定部分，可將 `kotlinx.coroutines` 的並行原語轉換為 JDK 的並行原語，例如 `fun CoroutinesDispatcher.asExecutor(): Executor`。API 的這個額外部分在 `commonMain` 中是不可用的。

若要探索可用的 Kotlin Multiplatform 程式庫，請參閱 [klibs.io](https://klibs.io)。

## 目標 (Targets)

目標定義了 Kotlin 編譯通用程式碼所指向的平台。這些平台可以是 JVM、JS、Android、iOS 或 Linux 等。之前的範例將通用程式碼編譯到了 JVM 和原生目標。

「Kotlin 目標」是一個描述編譯目標的識別碼。它定義了產生的二進位檔格式、可用的語言結構以及允許的相依性。

> 目標也可以被稱為平台。請參閱
> 完整的 [支援目標列表](multiplatform-dsl-reference.md#targets)。
>
> {style="note"}

您應該先「宣告」一個目標，以指示 Kotlin 為該特定目標編譯程式碼。在 Gradle 中，您可以在 `kotlin {}` 區塊內使用預定義的 DSL 呼叫來宣告目標：

```kotlin
kotlin {
    jvm() // 宣告 JVM 目標
    iosArm64() // 宣告對應於 64 位元 iPhone 的目標
}
```

透過這種方式，每個多平台專案都會定義一組支援的目標。請參閱 [階層式專案結構](multiplatform-hierarchy.md) 章節，以進一步了解如何在建置指令碼中宣告目標。

宣告 `jvm` 和 `iosArm64` 目標後， `commonMain` 中的通用程式碼將被編譯到這些目標：

![目標](target-diagram.svg){width=700}

要了解哪些程式碼將被編譯到特定目標，您可以將目標視為附加在 Kotlin 原始檔上的標籤。Kotlin 使用這些標籤來決定如何編譯您的程式碼、產生哪些二進位檔，以及該程式碼中允許哪些語言結構和相依性。

> 如果您的專案只有單一目標（例如 JVM），
> 您可以從通用程式碼存取具有適當可見性的目標特定符號。
> 然而，一旦您加入第二個目標，
> 目標特定符號在通用程式碼中就會變得不可用。
> 在遷移和其他中間專案狀態期間，請記住此限制。
> 
{style="note"}

如果您也想將 `greeting.kt` 檔案編譯為 `.js`，您只需要宣告 JS 目標即可。接著， `commonMain` 中的程式碼會收到一個額外的 `js` 標籤（對應於 JS 目標），這會指示 Kotlin 產生 `.js` 檔案：

![目標標籤](target-labels-diagram.svg){width=700}

這就是 Kotlin 編譯器如何處理編譯到所有已宣告目標的通用程式碼。
請參閱 [原始碼集](#source-sets) 以了解如何編寫平台特定程式碼。

## 原始碼集 (Source sets)

「Kotlin 原始碼集」是一組具有自己目標、相依性與編譯器選項的原始碼檔案。這是多平台專案中共享程式碼的主要方式。

多平台專案中的每個原始碼集：

* 具有在給定專案中唯一的名稱。
* 包含一組原始檔和資源，通常儲存在與原始碼集同名的目錄中。
* 指定該原始碼集中的程式碼編譯到的目標。這些目標會影響該原始碼集中可用的語言結構和相依性。
* 定義自己的相依性與編譯器選項。

Kotlin 提供了一系列預定義的原始碼集。其中之一是 `commonMain`，它存在於所有多平台專案中，並編譯到所有宣告的目標。

在 Kotlin Multiplatform 專案中，您將原始碼集視為 `src` 內部的目錄進行操作。
例如，一個具有 `commonMain`、`iosMain` 和 `jvmMain` 原始碼集的專案結構如下：

![共享原始碼](src-directory-diagram.png){width=350}

在 Gradle 指令碼中，您可以在 `kotlin.sourceSets {}` 區塊內按名稱存取原始碼集：

```kotlin
kotlin {
    // 目標宣告：
    // …

    // 原始碼集宣告：
    sourceSets {
        commonMain {
            // 配置 commonMain 原始碼集
        }
    }
}
```

除了 `commonMain` 之外，其他原始碼集可以是平台特定或中間的。

### 平台特定原始碼集

雖然只編寫通用程式碼很方便，但並不總是可行。`commonMain` 中的程式碼會編譯到所有宣告的目標，且 Kotlin 不允許在該處使用任何 platform-specific APIs。

在具有原生和 JS 目標的多平台專案中， `commonMain` 中的以下程式碼將無法編譯：

```kotlin
// commonMain/kotlin/common.kt
// 無法在通用程式碼中編譯
fun greeting() {
    java.io.File("greeting.txt").writeText("Hello, Multiplatform!")
}
```

作為解決方案，Kotlin 會建立平台特定原始碼集，也稱為平台原始碼集。每個目標都有一個對應的平台原始碼集，僅針對該目標進行編譯。例如， `jvm` 目標具有對應的 `jvmMain` 原始碼集，僅編譯到 JVM。Kotlin 允許在這些原始碼集中使用平台特定的相依性，例如在 `jvmMain` 中使用 JDK：

```kotlin
// jvmMain/kotlin/jvm.kt
// 您可以在 `jvmMain` 原始碼集中使用 Java 相依性
fun jvmGreeting() {
    java.io.File("greeting.txt").writeText("Hello, Multiplatform!")
}
```

### 編譯到特定目標

編譯到特定目標需要配合多個原始碼集。當 Kotlin 將多平台專案編譯到特定目標時，它會收集所有標有該目標的原始碼集，並從中產生二進位檔。

考慮一個具有 `jvm`、`iosArm64` 和 `js` 目標的範例。Kotlin 會為通用程式碼建立 `commonMain` 原始碼集，並為特定目標建立對應的 `jvmMain`、`iosArm64Main` 和 `jsMain` 原始碼集：

![編譯到特定目標](specific-target-diagram.svg){width=700}

在編譯到 JVM 期間，Kotlin 會選取所有標有「JVM」的原始碼集，即 `jvmMain` 和 `commonMain`。然後，它將它們一起編譯為 JVM 類別檔案：

![編譯到 JVM](compilation-jvm-diagram.svg){width=700}

因為 Kotlin 將 `commonMain` 和 `jvmMain` 一起編譯，所以產生的二進位檔包含來自 `commonMain` 和 `jvmMain` 的宣告。

使用多平台專案時，請記住：

* 如果您希望 Kotlin 將程式碼編譯到特定平台，請宣告對應的目標。
* 若要選擇儲存程式碼的目錄或原始檔，請先決定要在哪些目標之間共享程式碼：

    * 如果程式碼在所有目標之間共享，則應在 `commonMain` 中宣告。
    * 如果程式碼僅用於單一目標，則應在該目標的平台特定原始碼集中定義（例如 JVM 的 `jvmMain`）。
* 在平台特定原始碼集中編寫的程式碼可以存取通用原始碼集中的宣告。例如， `jvmMain` 中的程式碼可以使用 `commonMain` 中的程式碼。然而，反之則不然： `commonMain` 不能使用來自 `jvmMain` 的程式碼。
* 在平台特定原始碼集中編寫的程式碼可以使用對應的平台相依性。例如， `jvmMain` 中的程式碼可以使用僅限 Java 的程式庫，如 [Guava](https://github.com/google/guava) 或 [Spring](https://spring.io/)。

### 中間原始碼集

簡單的多平台專案通常只有通用程式碼和平台特定程式碼。
`commonMain` 原始碼集代表在所有宣告的目標之間共享的通用程式碼。平台特定原始碼集（如 `jvmMain`）代表僅編譯到相應目標的平台特定程式碼。

在實務中，您通常需要更細粒度的程式碼共享。

考慮一個範例，您需要針對所有現代 Apple 裝置和 Android 裝置：

```kotlin
kotlin {
    android()
    iosArm64()   // 64 位元 iPhone 裝置
    macosArm64() // 現代基於 Apple 晶片的 Mac
    watchosArm64() // 現代 64 位元 Apple Watch 裝置
    tvosArm64()  // 現代 Apple TV 裝置  
}
```

並且您需要一個原始碼集來加入一個為所有 Apple 裝置產生 UUID 的函式：

```kotlin
import platform.Foundation.NSUUID

fun randomUuidString(): String {
    // 您想要存取 Apple 特定的 API
    return NSUUID().UUIDString()
}
```

您不能將此函式加入 `commonMain`。`commonMain` 會編譯到所有宣告的目標（包括 Android），但 `platform.Foundation.NSUUID` 是 Apple 特定的 API，在 Android 上無法使用。如果您嘗試在 `commonMain` 中引用 `NSUUID`，Kotlin 會顯示錯誤。

您可以將此程式碼複製並貼上到每個 Apple 特定的原始碼集中：`iosArm64Main`、`macosArm64Main`、`watchosArm64Main` 和 `tvosArm64Main`。但不建議這樣做，因為像這樣重複程式碼很容易出錯。

為了縮小此問題，您可以使用「中間原始碼集」。中間原始碼集是編譯到專案中部分（而非全部）目標的 Kotlin 原始碼集。您也可以看到中間原始碼集被稱為階層式原始碼集或簡稱為階層。

Kotlin 預設會建立一些中間原始碼集。在這種特殊情況下，產生的專案結構如下所示：

![中間原始碼集](intermediate-source-sets-diagram.svg){width=700}

在這裡，底部的彩色方塊是平台特定的原始碼集。為了清晰起見，省略了目標標籤。

`appleMain` 區塊是 Kotlin 建立的中間原始碼集，用於共享編譯到 Apple 特定目標的程式碼。`appleMain` 原始碼集僅編譯到 Apple 目標。因此，Kotlin 允許在 `appleMain` 中使用 Apple 特定的 API，您可以在此處加入 `randomUUID()` 函式。

> 請參閱 [階層式專案結構](multiplatform-hierarchy.md) 以找到
> Kotlin 預設建立並設定的所有中間原始碼集，並了解如果 Kotlin 預設沒有提供您需要的中間原始碼集，您應該怎麼做。
>
{style="tip"}

在編譯到特定目標期間，Kotlin 會取得標有該目標的所有原始碼集，包括中間原始碼集。因此，在編譯到 `iosArm64` 平台目標時，編寫在 `commonMain`、`appleMain` 和 `iosArm64Main` 原始碼集中的所有程式碼都會被合併：

![原生可執行檔](multiplatform-executables-diagram.svg){width=700}

> 即使某些原始碼集沒有原始檔也沒關係。例如，在 iOS 開發中，通常不需要提供專門針對 iOS 裝置而非 iOS 模擬器的程式碼。因此 `iosArm64Main` 很少被使用。
>
{style="tip"}

#### Apple 裝置與模擬器目標 {initial-collapse-state="collapsed" collapsible="true"}

當您使用 Kotlin Multiplatform 開發 iOS 行動應用程式時，通常會使用 `iosMain` 原始碼集。
雖然您可能認為它是針對 `ios` 目標的平台特定原始碼集，但實際上並沒有單一的 `ios` 目標。大多數行動專案至少需要兩個目標：

* **裝置目標 (Device target)** 用於產生可在 iOS 裝置上執行的二進位檔。目前 iOS 只有一個裝置目標：`iosArm64`。
* **模擬器目標 (Simulator target)** 用於產生可在您電腦上啟動的 iOS 模擬器的二進位檔。如果您使用 Apple 晶片的 Mac 電腦，請選擇 `iosSimulatorArm64` 作為模擬器目標。

如果您僅宣告 `iosArm64` 裝置目標，您將無法在本地電腦上執行與偵錯您的應用程式與測試。

平台特定原始碼集如 `iosArm64Main` 和 `iosSimulatorArm64Main` 通常是空的，因為 iOS 裝置與模擬器的 Kotlin 程式碼通常是相同的。您可以只使用 `iosMain` 中間原始碼集來在所有這些目標之間共享程式碼。

這也適用於其他非 Mac 的 Apple 目標。例如，如果您有用於 Apple TV 的 `tvosArm64` 裝置目標，以及用於 Apple 晶片裝置上 Apple TV 模擬器的 `tvosSimulatorArm64` 模擬器目標，您可以對所有這些目標使用 `tvosMain` 中間原始碼集。

## 測試整合

現實生活中的專案除了主要的生產程式碼外，還需要測試。這就是為什麼預設建立的所有原始碼集都具有 `Main` 和 `Test` 後綴。`Main` 包含生產程式碼，而 `Test` 包含該程式碼的測試。
它們之間的連結是自動建立的，測試可以使用 `Main` 程式碼提供的 API，而無需額外配置。

`Test` 對應部分也是類似於 `Main` 的原始碼集。例如， `commonTest` 是 `commonMain` 的對應部分，並編譯到所有宣告的目標，允許您編寫通用測試。平台特定測試原始碼集（例如 `jvmTest`）用於編寫平台特定測試，例如 JVM 特定測試或需要 JVM API 的測試。

除了擁有一個撰寫通用測試的原始碼集外，您還需要一個多平台測試框架。Kotlin 提供了一個預設的 [`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) 程式庫，它帶有 `@kotlin.Test` 註解以及各種斷言方法，如 `assertEquals` 和 `assertTrue`。

您可以為每個平台在各自的原始碼集中編寫像一般測試一樣的平台特定測試。與主程式碼一樣，您可以為每個原始碼集設定平台特定的相依性，例如 JVM 的 `JUnit` 和 iOS 的 `XCTest`。若要執行特定目標的測試，請使用 `<targetName>Test` 任務。

了解如何在 [測試您的多平台應用程式教學](multiplatform-run-tests.md) 中建立並執行多平台測試。

## 下一步

* [進一步了解如何在 Gradle 指令碼中宣告與使用預定義的原始碼集](multiplatform-hierarchy.md)
* [探索多平台專案結構的進階概念](multiplatform-advanced-project-structure.md)
* [進一步了解目標編譯與建立自訂編譯](multiplatform-configure-compilations.md)