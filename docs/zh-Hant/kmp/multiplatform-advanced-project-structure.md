[//]: # (title: 多平台專案結構的進階概念)

本文將說明 Kotlin Multiplatform 專案結構的進階概念，以及它們如何對應到 Gradle 的實作。如果你需要處理 Gradle 組建的低階抽象概念（組態、任務、發佈等），或正在為 Kotlin Multiplatform 組建建立 Gradle 外掛程式，這些資訊將非常有用。

本頁面在以下情況對你有所幫助：

* 需要在一組 Kotlin 未為其建立原始碼集的目標之間共享程式碼。
* 想要為 Kotlin Multiplatform 組建建立 Gradle 外掛程式，或需要處理 Gradle 組建的低階抽象概念，例如組態、任務、發佈等。

> 在深入研究進階概念之前，建議先了解[多平台專案結構的基礎知識](multiplatform-discover-project.md)。
>
{style="tip"}

在多平台專案中，了解相依性管理最關鍵的事情之一，就是 Gradle 風格的專案或程式庫相依性，與 Kotlin 特有的原始碼集之間 `dependsOn` 關聯之間的差異：

* `dependsOn` 是通用原始碼集與特定平台原始碼集之間的關聯，它支援[原始碼集階層結構](#dependson-and-source-set-hierarchies)，並在多平台專案中實現通用的程式碼共享。對於預設的原始碼集，其階層結構是自動管理的，但你可能需要在特定情況下對其進行修改。
* 程式庫和專案相依性通常照常運作，但若要在多平台專案中妥善管理它們，你應該了解 [Gradle 相依性如何解析](#dependencies-on-other-libraries-or-projects)為用於編譯的細部 **原始碼集 → 原始碼集** 相依性。

## dependsOn 與原始碼集階層結構 {id="dependson-and-source-set-hierarchies"}

通常，你會處理的是 *相依性*，而不是 *`dependsOn`* 關聯。然而，檢視 `dependsOn` 對於深入理解 Kotlin Multiplatform 專案的運作原理至關重要。

`dependsOn` 是兩個 Kotlin 原始碼集之間特有的 Kotlin 關聯。這可以是通用與特定平台原始碼集之間的連結，例如當 `jvmMain` 原始碼集相依於 `commonMain`、`iosArm64Main` 相依於 `iosMain` 等等。

以 Kotlin 原始碼集 `A` 和 `B` 的一般範例為例。運算式 `A.dependsOn(B)` 指示 Kotlin：

1. `A` 可以觀察到來自 `B` 的 API，包含內部宣告。
2. `A` 可以為來自 `B` 的預期宣告（`expect`）提供實際實作（`actual`）。這是充分必要條件，因為若且唯若 `A.dependsOn(B)` 直接或間接成立時，`A` 才能為 `B` 提供 `actuals`。
3. 除了自己的目標外，`B` 還應該編譯至 `A` 所編譯到的所有目標。
4. `A` 繼承 `B` 的所有常規相依性。

`dependsOn` 關聯會建立一種樹狀結構，稱為原始碼集階層結構。以下是適用於行動開發的典型專案範例，包含 `android`、`iosArm64`（iPhone 裝置）和 `iosSimulatorArm64`（適用於 Apple 晶片 Mac 的 iPhone 模擬器）：

![DependsOn 樹狀結構](dependson-tree-diagram.svg){width=700}

箭頭代表 `dependsOn` 關聯。
這些關聯會在編譯平台二進位檔期間保留。這就是 Kotlin 如何理解 `iosMain` 應該看到來自 `commonMain` 的 API，而不是來自 `iosArm64Main` 的 API：

![編譯期間的 DependsOn 關聯](dependson-relations-diagram.svg){width=700}

`dependsOn` 關聯是透過 `KotlinSourceSet.dependsOn(KotlinSourceSet)` 呼叫來設定的，例如：

```kotlin
kotlin {
    // 目標宣告
    sourceSets {
        // 設定 dependsOn 關聯的範例 
        iosArm64Main.dependsOn(commonMain)
    }
}
```

* 此範例展示了如何在建置指令碼中定義 `dependsOn` 關聯。然而，Kotlin Gradle 外掛程式預設會建立原始碼集並設定這些關聯，因此你不需要手動進行。
* `dependsOn` 關聯在建置指令碼中與 `dependencies {}` 區塊分開宣告。這是因為 `dependsOn` 不是一般的相依性；相反地，它是 Kotlin 原始碼集之間的一種特定關聯，用於跨不同目標共享程式碼。

你不能使用 `dependsOn` 來宣告對已發佈程式庫或其他 Gradle 專案的常規相依性。例如，你不能將 `commonMain` 設定為相依於 `kotlinx-coroutines-core` 程式庫的 `commonMain`，也不能呼叫 `commonTest.dependsOn(commonMain)`。

### 宣告自訂原始碼集 {id="declaring-custom-source-sets"}

在某些情況下，你可能需要在專案中建立自訂的中介原始碼集。
考慮一個編譯至 JVM、JS 和 Linux 的專案，且你只想在 JVM 和 JS 之間共享部分原始碼。
在這種情況下，你應該為這對目標找到一個特定的原始碼集，如[多平台專案結構的基礎知識](multiplatform-discover-project.md)中所述。

Kotlin 不會自動建立這樣的原始碼集。這表示你應該使用 `by creating` 結構手動建立它：

```kotlin
kotlin {
    jvm()
    js()
    linuxX64()

    sourceSets {
        // 建立名為 "jvmAndJs" 的原始碼集
        val jvmAndJsMain by creating {
            // …
        }
    }
}
```

然而，Kotlin 仍然不知道如何處理或編譯此原始碼集。如果你畫出一張圖表，這個原始碼集將會是孤立的，並且沒有任何目標標籤：

![遺失 dependsOn 關聯](missing-dependson-diagram.svg){width=700}

若要解決此問題，請透過新增數個 `dependsOn` 關聯將 `jvmAndJsMain` 納入階層結構中：

```kotlin
kotlin {
    jvm()
    js()
    linuxX64()

    sourceSets {
        val jvmAndJsMain by creating {
            // 別忘了為 commonMain 新增 dependsOn
            dependsOn(commonMain.get())
        }

        jvmMain {
            dependsOn(jvmAndJsMain)
        }

        jsMain {
            dependsOn(jvmAndJsMain)
        }
    }
}
```

在此，`jvmMain.dependsOn(jvmAndJsMain)` 將 JVM 目標新增到 `jvmAndJsMain`，而 `jsMain.dependsOn(jvmAndJsMain)` 將 JS 目標新增到 `jvmAndJsMain`。

最終的專案結構將如下所示：

![最終專案結構](final-structure-diagram.svg){width=700}

> 手動設定 `dependsOn` 關聯會停用預設階層範本的自動套用。
> 請參閱[其他組態](multiplatform-hierarchy.md#additional-configuration)以深入了解此類情況及其處理方式。
>
{style="note"}

## 對其他程式庫或專案的相依性 {id="dependencies-on-other-libraries-or-projects"}

在多平台專案中，你可以設定對已發佈程式庫或其他 Gradle 專案的常規相依性。

Kotlin Multiplatform 通常以典型的 Gradle 方式宣告相依性。類似於 Gradle，你可以：

* 在建置指令碼中使用 `dependencies {}` 區塊。
* 為相依性選擇適當的作用域，例如 `implementation` 或 `api`。
* 若相依項已發佈在儲存庫中，則透過指定其座標來參照相依項，例如 `"com.google.guava:guava:32.1.2-jre"`；若為同一個組建中的 Gradle 專案，則指定其路徑，例如 `project(":utils:concurrency")`。

多平台專案中的相依性設定具有一些特殊功能。每個 Kotlin 原始碼集都有自己的 `dependencies {}` 區塊。這允許你在特定平台原始碼集中宣告特定平台的相依性：

```kotlin
kotlin {
    // 目標宣告
    sourceSets {
        jvmMain.dependencies {
            // 這是 jvmMain 的相依性，因此可以新增特定於 JVM 的相依性
            implementation("com.google.guava:guava:32.1.2-jre")
        }
    }
}
```

通用相依性則較為複雜。考慮一個宣告對多平台程式庫（例如 `kotlinx.coroutines`）相依性的多平台專案：

```kotlin
kotlin {
    android()     // Android
    iosArm64()          // iPhone 裝置 
    iosSimulatorArm64() // 適用於 Apple 晶片 Mac 的 iPhone 模擬器

    sourceSets {
        commonMain.dependencies {
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
        }
    }
}
```

相依性解析中有三個重要概念：

1. 多平台相依性會沿著 `dependsOn` 結構向下傳播。當你將相依性新增至 `commonMain` 時，它會自動新增至直接或間接宣告與 `commonMain` 具有 `dependsOn` 關聯的所有原始碼集。

   在這種情況下，該相依性確實會自動新增至所有 `*Main` 原始碼集：`iosMain`、`jvmMain`、`iosSimulatorArm64Main` 和 `iosArm64Main`。所有這些原始碼集都從 `commonMain` 原始碼集繼承了 `kotlin-coroutines-core` 相依性，因此你不需要手動將其複製並貼上到所有原始碼集中：

   ![多平台相依性的傳播](dependency-propagation-diagram.svg){width=700}

   > 傳播機制允許你透過選取特定的原始碼集，來選擇接收所宣告相依性的作用域。
   > 例如，如果你想在 iOS 上使用 `kotlinx.coroutines` 但不在 Android 上使用，你可以僅將此相依性新增至 `iosMain`。
   >
   {style="tip"}

2. *原始碼集 → 多平台程式庫* 的相依性（例如上述 `commonMain` 到 `org.jetbrians.kotlinx:kotlinx-coroutines-core:1.7.3`）代表相依性解析的中介狀態。解析的最終狀態始終由 *原始碼集 → 原始碼集* 的相依性表示。

   > 最終的 *原始碼集 → 原始碼集* 相依性並非 `dependsOn` 關聯。
   >
   {style="note"}

   為了推斷出細部的 *原始碼集 → 原始碼集* 相依性，Kotlin 會讀取與每個多平台程式庫一起發佈的原始碼集結構。在此步驟之後，每個程式庫在內部將不再以一個整體表示，而是以其原始碼集的集合來表示。請參閱 `kotlinx-coroutines-core` 的這個範例：

   ![原始碼集結構的序列化](structure-serialization-diagram.svg){width=700}

3. Kotlin 會獲取每個相依性關聯，並將其解析為來自相依項的原始碼集集合。該集合中的每個相依原始碼集都必須具有 *相容的目標*。如果相依原始碼集編譯至 *至少與取用者原始碼集相同* 的目標，則它具有相容的目標。

   以範例專案中的 `commonMain` 為例，它編譯至 `android`、`iosArm64` 和 `iosSimulatorArm64`：

    * 首先，它會解析對 `kotlinx-coroutines-core.commonMain` 的相依性。這是因為 `kotlinx-coroutines-core` 編譯至所有可能的 Kotlin 目標。因此，其 `commonMain` 會編譯至所有可能的目標，包含所需的 `android`、`iosArm64` 和 `iosSimulatorArm64`。
    * 其次，`commonMain` 相依於 `kotlinx-coroutines-core.concurrentMain`。由於 `kotlinx-coroutines-core` 中的 `concurrentMain` 編譯至除 JS 之外的所有目標，因此它符合取用者專案之 `commonMain` 的目標。

   然而，協同程式中如 `iosArm64Main` 等原始碼集與取用者的 `commonMain` 不相容。儘管 `iosArm64Main` 編譯至 `commonMain` 的其中一個目標（即 `iosArm64`），但它既無法編譯至 `android`，也無法編譯至 `iosSimulatorArm64`。

   相依性解析的結果會直接影響 `kotlinx-coroutines-core` 中的哪些程式碼是可見的：

   ![通用程式碼中特定於 JVM 之 API 的錯誤](dependency-resolution-error.png){width=700}

### 跨原始碼集對齊通用相依性的版本 {id="aligning-versions-of-common-dependencies-across-source-sets"}

在 Kotlin Multiplatform 專案中，通用原始碼集會編譯多次以產出 klib，並作為每個已設定的[編譯](multiplatform-configure-compilations.md)的一部分。為了產出一致的二進位檔，通用程式碼每次都應根據相同版本之多平台相依性進行編譯。Kotlin Gradle 外掛程式有助於對齊這些相依性，確保每個原始碼集的有效相依性版本皆相同。

在上述範例中，假設你想將 `androidx.navigation:navigation-compose:2.7.7` 相依性新增至你的 `androidMain` 原始碼集。你的專案明確為 `commonMain` 原始碼集宣告了 `kotlinx-coroutines-core:1.7.3` 相依性，但版本為 2.7.7 的 Compose Navigation 程式庫需要 Kotlin 協同程式 1.8.0 或更高版本。

由於 `commonMain` 與 `androidMain` 是一起編譯的，Kotlin Gradle 外掛程式會在兩個版本的協同程式庫之間進行選擇，並將 `kotlinx-coroutines-core:1.8.0` 套用至 `commonMain` 原始碼集。但為了使通用程式碼在所有設定的目標上一致地編譯，iOS 原始碼集也需要被約束在相同的相依性版本上。因此 Gradle 也會將 `kotlinx.coroutines-*:1.8.0` 相依性傳播至 `iosMain` 原始碼集。

![各 *Main 原始碼集之間的相依性對齊](multiplatform-source-set-dependency-alignment.svg){width=700}

相依性在 `*Main` 原始碼集與 [`*Test` 原始碼集](multiplatform-discover-project.md#integration-with-tests)之間是分開對齊的。適用於 `*Test` 原始碼集的 Gradle 組態包含 `*Main` 原始碼集的所有相依性，但反之則不然。因此你可以使用較新的程式庫版本測試專案，而不會影響你的主要程式碼。

例如，你在 `*Main` 原始碼集中擁有 Kotlin 協同程式 1.7.3 相依性，並傳播到專案中的每個原始碼集。然而，在 `iosTest` 原始碼集中，你決定將版本升級至 1.8.0 以測試新的程式庫版本。根據相同的演算法，該相依性將會傳播到整個 `*Test` 原始碼集樹狀結構中，因此每個 `*Test` 原始碼集都將使用 `kotlinx.coroutines-*:1.8.0` 相依性進行編譯。

![測試原始碼集與主要原始碼集分開解析相依性](test-main-source-set-dependency-alignment.svg)

## 編譯 {id="compilations"}

與單一平台專案不同，Kotlin Multiplatform 專案需要多次啟動編譯器才能建置所有的產物。每次啟動編譯器都是一次 *Kotlin 編譯*。

例如，以下是前面提到的 Kotlin 編譯期間如何產生 iPhone 裝置的二進位檔：

![適用於 iOS 的 Kotlin 編譯](ios-compilation-diagram.svg){width=700}

Kotlin 編譯按目標分組。預設情況下，Kotlin 會為每個目標建立兩次編譯：用於正式環境原始碼的 `main` 編譯，以及用於測試原始碼的 `test` 編譯。

建置指令碼中的編譯也以類似的方式存取。你先選取一個 Kotlin 目標，接著存取內部的 `compilations` 容器，最後依名稱選擇所需的編譯：

```kotlin
kotlin {
    // 宣告並設定 JVM 目標
    jvm {
        val mainCompilation: KotlinJvmCompilation = compilations.getByName("main")
    }
}
```