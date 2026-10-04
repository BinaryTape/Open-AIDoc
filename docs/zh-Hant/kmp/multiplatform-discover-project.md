[//]: # (title: Kotlin Multiplatform 專案結構基礎)

透過 Kotlin Multiplatform，您可以在不同平台之間共用程式碼。本文將說明共用程式碼的限制、如何區分程式碼中的共用部分與平台專屬部分，以及如何指定此共用程式碼可在哪些平台上運作。

您還將了解 Kotlin Multiplatform 專案設定的核心概念，例如通用程式碼、目標 (target)、平台專屬與中介原始碼集 (intermediate source set)，以及測試整合。這將有助於您日後設定自己的多平台專案。

與 Kotlin 實際使用的模型相比，這裡介紹的模型經過了簡化。然而，這個基本模型對於絕大多數情況來說已足夠。

## 通用程式碼 {id="common-code"}

_通用程式碼 (Common code)_ 是在不同平台之間共用的 Kotlin 程式碼。

請參考簡單的「Hello, World」範例：

```kotlin
fun greeting() {
    println("Hello, Kotlin Multiplatform!")
}
```

跨平台共用的 Kotlin 程式碼通常位於 `commonMain` 目錄中。程式碼檔案的位置非常重要，因為它會影響此程式碼編譯至哪些平台的清單。

Kotlin 編譯器接收原始碼作為輸入，並產生一組平台專屬的二進制檔案作為結果。編譯多平台專案時，它可以從相同的程式碼產生多個二進制檔案。例如，編譯器可以從同一個 Kotlin 檔案產生 JVM `.class` 檔案以及原生可執行檔：

![Common code](common-code-diagram.svg){width=700}

並非每段 Kotlin 程式碼都能編譯到所有平台。如果程式碼無法編譯到其他平台，Kotlin 編譯器會阻止您在通用程式碼中使用特定於平台的函式或類別。

例如，您無法在通用程式碼中使用 `java.io.File` 相依性。它是 JDK 的一部分，而通用程式碼也會編譯為原生程式碼，但在原生環境中 JDK 類別是無法使用的：

![Unresolved Java reference](unresolved-java-reference.png){width=500}

在通用程式碼中，您可以使用 Kotlin Multiplatform 程式庫。這些程式庫提供通用 API，可以在不同平台上以不同方式實作。在這種情況下，平台專屬的 API 作為額外擴充的部分，若嘗試在通用程式碼中使用此類 API 會導致錯誤。

例如，`kotlinx.coroutines` 是一個支援所有目標的 Kotlin Multiplatform 程式庫，但它也有平台專屬的部分，可將 `kotlinx.coroutines` 並行原語轉換為 JDK 並行原語，例如 `fun CoroutinesDispatcher.asExecutor(): Executor`。這個額外的 API 部分在 `commonMain` 中是無法使用的。

若要探索現有的 Kotlin Multiplatform 程式庫，請參閱 [klibs.io](https://klibs.io)。

## 目標 {id="targets"}

目標定義了 Kotlin 將通用程式碼編譯到的平台。這些目標可以是例如 JVM、JS、Android、iOS 或 Linux。前面的範例就是將通用程式碼編譯為 JVM 與原生目標。

_Kotlin 目標 (Kotlin target)_ 是一個描述編譯目標的識別符號。它定義了所產生的二進制檔案格式、可用的語言結構以及允許的相依性。

> 目標也可以被稱為平台。請參閱完整的[支援目標清單](multiplatform-dsl-reference.md#targets)。
>
{style="note"}

您應先_宣告_目標，以指示 Kotlin 為該特定目標編譯程式碼。在 Gradle 中，您可以在 `kotlin {}` 區塊中使用預定義的 DSL 呼叫來宣告目標：

```kotlin
kotlin {
    jvm() // 宣告 JVM 目標
    iosArm64() // 宣告對應於 64 位元 iPhone 的目標
}
```

透過這種方式，每個多平台專案都會定義一組支援的目標。請參閱[階層式專案結構](multiplatform-hierarchy.md)章節，以深入了解如何在組建指令碼中宣告目標。

宣告 `jvm` 和 `iosArm64` 目標後，`commonMain` 中的通用程式碼將會編譯到這些目標：

![Targets](target-diagram.svg){width=700}

若要了解哪些程式碼會編譯到特定目標，您可以將目標視為附加在 Kotlin 原始碼檔案上的標籤。Kotlin 使用這些標籤來決定如何編譯您的程式碼、產生哪些二進制檔案，以及該程式碼中允許使用哪些語言結構與相依性。

> 如果您的專案只有單一目標（例如 JVM），
> 您可以從通用程式碼存取具有適當可見性的目標專屬符號。
> 但是，一旦新增第二個目標，
> 目標專屬符號在通用程式碼中就會變得無法存取。
> 在進行遷移和其他專案過渡狀態期間，請牢記此限制。
> 
{style="note"}

如果您也想將 `greeting.kt` 檔案編譯為 `.js`，只需宣告 JS 目標即可。`commonMain` 中的程式碼隨後會獲得一個對應於 JS 目標的額外 `js` 標籤，這會指示 Kotlin 產生 `.js` 檔案：

![Target labels](target-labels-diagram.svg){width=700}

這就是 Kotlin 編譯器處理編譯至所有已宣告目標的通用程式碼的方式。
請參閱[原始碼集](#source-sets)以了解如何撰寫平台專屬程式碼。

## 原始碼集 {id="source-sets"}

_Gradle 原始碼集 (Gradle source set)_ 是一組擁有自己的目標、相依性以及編譯器選項的原始碼檔案。它是多平台專案中共用程式碼的主要方式。

多平台專案中的每個原始碼集：

* 在給定專案中具有唯一的名稱。
* 包含一組原始碼檔案與資源，通常儲存在以該原始碼集命名的目錄中。
* 指定此原始碼集中的程式碼所編譯到的一組目標。這些目標會影響此原始碼集中可用的語言結構與相依性。
* 定義自己的相依性與編譯器選項。

Kotlin Multiplatform 提供了許多預定義的原始碼集。其中之一是 `commonMain`，它存在於所有多平台專案中，並編譯至所有宣告的目標。

在 Kotlin Multiplatform 專案中，原始碼集以 `src` 內部的目錄形式呈現並進行操作。
例如，包含 `commonMain`、`iosMain` 和 `androidMain` 原始碼集的 `shared` 模組具有以下結構：

![Shared sources](src-directory-diagram.png){width=350}

當 `shared` 模組建置為 Android 程式庫時，通用的 Kotlin 程式碼會被視為 Kotlin/JVM。
當它建置為 iOS 架構時，通用的 Kotlin 程式碼則被視為 Kotlin/Native：

![Common Kotlin, Kotlin/JVM, and Kotlin/Native](modules-structure.png)

在 Gradle 指令碼中，您可以在 `kotlin.sourceSets {}` 區塊內依名稱存取原始碼集：

```kotlin
kotlin {
    // 目標宣告：
    // …

    // 原始碼集宣告：
    sourceSets {
        commonMain {
            // 設定 commonMain 原始碼集
        }
    }
}
```

除了 `commonMain` 之外，其他原始碼集可以是平台專屬的，也可以是中介原始碼集。

### 平台專屬原始碼集 {id="platform-specific-source-sets"}

雖然僅使用通用程式碼非常方便，但這並非總是可行。`commonMain` 中的程式碼會編譯至所有宣告的目標，且 Kotlin 不允許在該處使用任何平台專屬的 API。

在具有原生與 JS 目標的多平台專案中，`commonMain` 中的以下程式碼將無法編譯：

```kotlin
// commonMain/kotlin/common.kt
// 在通用程式碼中無法編譯
fun greeting() {
    java.io.File("greeting.txt").writeText("Hello, Multiplatform!")
}
```

為了解決這個問題，Kotlin 會建立平台專屬原始碼集（也稱為平台原始碼集）。每個目標都有一個對應的平台原始碼集，僅針對該目標進行編譯。例如，`jvm` 目標具有對應的 `jvmMain` 原始碼集，該原始碼集僅編譯至 JVM。Kotlin 允許在這些原始碼集中使用平台專屬的相依性，例如在 `jvmMain` 中使用 JDK：

```kotlin
// jvmMain/kotlin/jvm.kt
// 您可以在 `jvmMain` 原始碼集中使用 Java 相依性
fun jvmGreeting() {
    java.io.File("greeting.txt").writeText("Hello, Multiplatform!")
}
```

### 編譯至特定目標 {id="compilation-to-a-specific-target"}

編譯至特定目標涉及多個原始碼集。當 Kotlin 將多平台專案編譯至特定目標時，它會收集所有標記有此目標的原始碼集，並從中產生二進制檔案。

請參考包含 `jvm`、`iosArm64` 和 `js` 目標的範例。Kotlin 為通用程式碼建立了 `commonMain` 原始碼集，並為特定目標建立了對應的 `jvmMain`、`iosArm64Main` 與 `jsMain` 原始碼集：

![Compilation to a specific target](specific-target-diagram.svg){width=700}

在編譯至 JVM 期間，Kotlin 會選取所有標記為「JVM」的原始碼集，即 `jvmMain` 和 `commonMain`。然後將它們一起編譯為 JVM class 檔案：

![Compilation to JVM](compilation-jvm-diagram.svg){width=700}

因為 Kotlin 將 `commonMain` 和 `jvmMain` 一起編譯，所以產生的二進制檔案會包含來自 `commonMain` 和 `jvmMain` 的宣告。

開發多平台專案時，請記住：

* 如果希望 Kotlin 將程式碼編譯至特定平台，請宣告對應的目標。
* 若要選擇儲存程式碼的目錄或原始碼檔案，請先決定要在哪些目標之間共用您的程式碼：

    * 如果程式碼在所有目標之間共用，則應在 `commonMain` 中宣告。
    * 如果程式碼僅用於單一目標，則應在該目標的平台專屬原始碼集中定義（例如 JVM 對應的 `jvmMain`）。
* 在平台專屬原始碼集中撰寫的程式碼可以存取通用原始碼集的宣告。例如，`jvmMain` 中的程式碼可以使用來自 `commonMain` 的程式碼。然而，反過來則不行：`commonMain` 不能使用來自 `jvmMain` 的程式碼。
* 在平台專屬原始碼集中撰寫的程式碼可以使用對應的平台相依性。例如，`jvmMain` 中的程式碼可以使用僅限 Java 的程式庫，例如 [Guava](https://github.com/google/guava) 或 [Spring](https://spring.io/)。

### 中介原始碼集 {id="intermediate-source-sets"}

簡單的多平台專案通常只包含通用程式碼與平台專屬程式碼。
`commonMain` 原始碼集代表在所有已宣告目標之間共用的通用程式碼。平台專屬原始碼集（如 `jvmMain`）則代表僅編譯至相應目標的平台專屬程式碼。

在實務上，您通常需要更精細的程式碼共用。

假設您需要以所有現代 Apple 裝置與 Android 裝置為目標：

```kotlin
kotlin {
    android()
    iosArm64()   // 64 位元 iPhone 裝置
    macosArm64() // 現代採用 Apple 晶片的 Mac
    watchosArm64() // 現代 64 位元 Apple Watch 裝置
    tvosArm64()  // 現代 Apple TV 裝置  
}
```

並且您需要一個原始碼集來新增為所有 Apple 裝置產生 UUID 的函式：

```kotlin
import platform.Foundation.NSUUID

fun randomUuidString(): String {
    // 您想要存取 Apple 專屬的 API
    return NSUUID().UUIDString()
}
```

您無法將此函式新增至 `commonMain`。因為 `commonMain` 會編譯至所有宣告的目標（包括 Android），但 `platform.Foundation.NSUUID` 是 Apple 專屬的 API，在 Android 上不可用。如果您嘗試在 `commonMain` 中參照 `NSUUID`，Kotlin 會顯示錯誤。

您可以將此程式碼複製並貼到每個 Apple 專屬的原始碼集中：`iosArm64Main`、`macosArm64Main`、`watchosArm64Main` 和 `tvosArm64Main`。但不建議使用此方法，因為像這樣複製程式碼很容易出錯。

為了解決此問題，您可以使用_中介原始碼集 (intermediate source sets)_。中介原始碼集是一種 Kotlin 原始碼集，它會編譯至專案中的部分（但非全部）目標。您也可能會看到中介原始碼集被稱為階層式原始碼集或簡稱為階層。

Kotlin 預設會建立一些中介原始碼集。在此具體範例中，產生的專案結構如下所示：

![Intermediate source sets](intermediate-source-sets-diagram.svg){width=700}

在此圖中，底部的彩色區塊是平台專屬原始碼集。為了清楚起見，省略了目標標籤。

`appleMain` 區塊是由 Kotlin 建立的中介原始碼集，用於共用編譯至 Apple 專屬目標的程式碼。`appleMain` 原始碼集僅編譯至 Apple 目標。因此，Kotlin 允許在 `appleMain` 中使用 Apple 專屬 API，您可以將 `randomUUID()` 函式新增於此。

> 請參閱[階層式專案結構](multiplatform-hierarchy.md)，以尋找 Kotlin 預設建立與設定的所有中介原始碼集，
> 並了解當 Kotlin 預設未提供所需的中介原始碼集時該如何處理。
>
{style="tip"}

在編譯至特定目標時，Kotlin 會獲取標記有該目標的所有原始碼集（包含中介原始碼集）。因此，在編譯至 `iosArm64` 平台目標時，撰寫在 `commonMain`、`appleMain` 和 `iosArm64Main` 原始碼集中的所有程式碼都會合併在一起：

![Native executables](multiplatform-executables-diagram.svg){width=700}

> 某些原始碼集中沒有原始碼是完全正常的。例如，在 iOS 開發中，通常不需要提供僅適用於 iOS 裝置而不適用於 iOS 模擬器的程式碼。因此 `iosArm64Main` 很少被使用。
>
{style="tip"}

#### Apple 裝置與模擬器目標 {initial-collapse-state="collapsed" collapsible="true" id="apple-device-and-simulator-targets"}

當您使用 Kotlin Multiplatform 開發 iOS 行動應用程式時，通常會使用 `iosMain` 原始碼集。雖然您可能會認為它是針對 `ios` 目標的平台專屬原始碼集，但實際上並不存在單一的 `ios` 目標。大多數行動專案至少需要兩個目標：

* **裝置目標 (Device target)** 用於產生可在 iOS 裝置上執行的二進制檔案。目前 iOS 只有一個裝置目標：`iosArm64`。
* **模擬器目標 (Simulator target)** 用於產生在您的電腦上啟動的 iOS 模擬器所使用的二進制檔案。如果您使用的是搭載 Apple 晶片的 Mac 電腦，請選擇 `iosSimulatorArm64` 作為模擬器目標。

如果您只宣告 `iosArm64` 裝置目標，您將無法在本機電腦上執行和偵錯應用程式與測試。

平台專屬原始碼集（例如 `iosArm64Main` 和 `iosSimulatorArm64Main`）通常是空的，因為適用於 iOS 裝置和模擬器的 Kotlin 程式碼通常是相同的。您可以僅使用 `iosMain` 中介原始碼集在它們之間共用程式碼。

這同樣適用於其他非 Mac 的 Apple 目標。例如，如果您擁有針對 Apple TV 的 `tvosArm64` 裝置目標，以及針對 Apple 晶片裝置上 Apple TV 模擬器的 `tvosSimulatorArm64` 模擬器目標，您可以使用 `tvosMain` 中介原始碼集來共用所有程式碼。

## 測試整合 {id="integration-with-tests"}

實際專案除了主要的正式環境程式碼之外，還需要測試。這就是為什麼預設建立的所有原始碼集都帶有 `Main` 和 `Test` 後綴的原因。`Main` 包含正式程式碼，而 `Test` 則包含該程式碼的測試。兩者之間的關聯是自動建立的，測試可以在不需要額外設定的情況下使用 `Main` 程式碼提供的 API。

對應的 `Test` 也是類似於 `Main` 的原始碼集。例如，`commonTest` 是 `commonMain` 的對應項，並會編譯至所有已宣告的目標，讓您可以撰寫通用測試。平台專屬的測試原始碼集（例如 `jvmTest`）則用於撰寫平台專屬的測試，例如 JVM 專屬測試或需要 JVM API 的測試。

除了擁有用於撰寫通用測試的原始碼集之外，您還需要一個多平台測試架構。Kotlin 提供了一個預設的 [`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) 程式庫，其中包含 `@kotlin.Test` 註解以及各種斷言方法（例如 `assertEquals` 和 `assertTrue`）。

您可以在各自的原始碼集中撰寫平台專屬測試，就像各平台的常規測試一樣。與主要程式碼類似，您可以為每個原始碼集配置平台專屬的相依性，例如 JVM 使用 `JUnit`，iOS 使用 `XCTest`。若要執行特定目標的測試，請使用 `<targetName>Test` 任務。

在[測試您的多平台應用程式教學](multiplatform-run-tests.md)中了解如何建立與執行多平台測試。

## 後續步驟 {id="what-s-next"}

* [進一步了解在 Gradle 指令碼中宣告與使用預定義原始碼集](multiplatform-hierarchy.md)
* [探索多平台專案結構的進階概念](multiplatform-advanced-project-structure.md)
* [進一步了解目標編譯與建立自訂編譯](multiplatform-configure-compilations.md)