[//]: # (title: 組建最終原生二進位檔)

預設情況下，Kotlin/Native 目標會編譯為 `*.klib` 程式庫構件，它可以被 Kotlin/Native 本身作為相依性使用，但無法直接執行或作為原生程式庫使用。

若要宣告最終原生二進位檔（例如可執行檔或共享程式庫），請使用原生目標的 `binaries` 屬性。此屬性表示除了預設的 `*.klib` 構件之外，為此目標組建的原生二進位檔集合，並提供了一組用於宣告和設定它們的方法。

> `kotlin-multiplatform` 外掛程式預設不會建立任何正式版二進位檔。預設唯一可用的二進位檔是偵錯測試可執行檔，它可讓您執行來自 `test` 編譯的單元測試。
>
{style="note"}

Kotlin/Native 編譯器產生的二進位檔可能包含第三方程式碼、資料或衍生作品。這表示如果您發佈經 Kotlin/Native 編譯的最終二進位檔，應一律在二進位檔發佈版本中包含必要的[授權檔案](https://kotlinlang.org/docs/native-binary-licenses.html)。

## 宣告二進位檔 {id="declare-binaries"}

使用以下工廠方法宣告 `binaries` 集合的元素。

| 工廠方法 | 二進位檔種類 | 適用於 |
|----------------|-----------------------|--------------------------------------------|
| `executable`   | 產品可執行檔 | 所有原生目標 |
| `test`         | 測試可執行檔 | 所有原生目標 |
| `sharedLib`    | 共享原生程式庫 | 所有原生目標 |
| `staticLib`    | 靜態原生程式庫 | 所有原生目標 |
| `framework`    | Objective-C 架構 | 僅適用於 macOS、iOS、watchOS 與 tvOS 目標 |

最簡單的版本不需要任何額外參數，並為每種組建類型建立一個二進位檔。目前有兩種組建類型可用：

* `DEBUG` – 產生未最佳化的二進位檔，並帶有在使用[偵錯工具](https://kotlinlang.org/docs/native-debugging.html)時很有幫助的額外元資料
* `RELEASE` – 產生沒有偵錯資訊的最佳化二進位檔

以下程式碼片段會建立 debug 與 release 兩個可執行二進位檔：

```kotlin
kotlin {
    linuxX64 { // 改為定義你的目標。
        binaries {
            executable {
                // 二進位檔設定。
            }
        }
    }
}
```

如果不需要[額外設定](multiplatform-dsl-reference.md#native-targets)，您可以省略 Lambda 運算式：

```kotlin
binaries {
    executable()
}
```

您可以指定要為哪些組建類型建立二進位檔。在以下範例中，僅會建立 `debug` 可執行檔：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
binaries {
    executable(listOf(DEBUG)) {
        // 二進位檔設定。
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
binaries {
    executable([DEBUG]) {
        // 二進位檔設定。
    }
}
```

</TabItem>
</Tabs>

您也可以宣告具有自訂名稱的二進位檔：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
binaries {
    executable("foo", listOf(DEBUG)) {
        // 二進位檔設定。
    }

    // 也可以省略組建類型清單
    // （在這種情況下，將使用所有可用的組建類型）。
    executable("bar") {
        // 二進位檔設定。
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
binaries {
    executable('foo', [DEBUG]) {
        // 二進位檔設定。
    }

    // 也可以省略組建類型清單
    // （在這種情況下，將使用所有可用的組建類型）。
    executable('bar') {
        // 二進位檔設定。
    }
}
```

</TabItem>
</Tabs>

第一個引數設定名稱前綴，它是二進位檔案的預設名稱。例如，對於 Windows，該程式碼會產生 `foo.exe` 和 `bar.exe` 檔案。您也可以使用該名稱前綴在[組建指令碼中存取二進位檔](#access-binaries)。

## 存取二進位檔 {id="access-binaries"}

您可以存取二進位檔以[對其進行設定](multiplatform-dsl-reference.md#native-targets)或取得其屬性（例如輸出檔案的路徑）。

您可以透過其唯一名稱取得二進位檔。該名稱基於名稱前綴（如果已指定）、組建類型和二進位檔種類，遵循以下模式：`<optional-name-prefix><build-type><binary-kind>`，例如 `releaseFramework` 或 `testDebugExecutable`。

> 靜態程式庫和共享程式庫分別帶有後綴 static 和 shared，例如 `fooDebugStatic` 或 `barReleaseShared`。
>
{style="note"}

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
// 如果沒有此二進位檔則失敗。
binaries["fooDebugExecutable"]
binaries.getByName("fooDebugExecutable")

// 如果沒有此二進位檔則傳回 null。
binaries.findByName("fooDebugExecutable")
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
// 如果沒有此二進位檔則失敗。
binaries['fooDebugExecutable']
binaries.fooDebugExecutable
binaries.getByName('fooDebugExecutable')

// 如果沒有此二進位檔則傳回 null。
binaries.findByName('fooDebugExecutable')
```

</TabItem>
</Tabs>

或者，您可以使用具型別的 getter 透過名稱前綴和組建類型存取二進位檔。

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
// 如果沒有此二進位檔則失敗。
binaries.getExecutable("foo", DEBUG)
binaries.getExecutable(DEBUG)          // 如果未設定名稱前綴，可略過第一個引數。
binaries.getExecutable("bar", "DEBUG") // 您也可以使用字串表示組建類型。

// 其他二進位檔種類也有類似的 getter：
// getFramework、getStaticLib 與 getSharedLib。

// 如果沒有此二進位檔則傳回 null。
binaries.findExecutable("foo", DEBUG)

// 其他二進位檔種類也有類似的 getter：
// findFramework、findStaticLib 與 findSharedLib。
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
// 如果沒有此二進位檔則失敗。
binaries.getExecutable('foo', DEBUG)
binaries.getExecutable(DEBUG)          // 如果未設定名稱前綴，可略過第一個引數。
binaries.getExecutable('bar', 'DEBUG') // 您也可以使用字串表示組建類型。

// 其他二進位檔種類也有類似的 getter：
// getFramework、getStaticLib 與 getSharedLib。

// 如果沒有此二進位檔則傳回 null。
binaries.findExecutable('foo', DEBUG)

// 其他二進位檔種類也有類似的 getter：
// findFramework、findStaticLib 與 findSharedLib。
```

</TabItem>
</Tabs>

## 將相依性匯出至二進位檔 {id="export-dependencies-to-binaries"}

在組建 Objective-C 架構或原生程式庫（共享或靜態）時，您可能不僅需要打包目前專案的類別，還需要打包其相依項的類別。請使用 `export` 方法指定要匯出至二進位檔的相依性。

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        macosMain.dependencies {
            // 將會被匯出。
            api(project(":dependency"))
            api("org.example:exported-library:1.0")
            // 不會被匯出。
            api("org.example:not-exported-library:1.0")
        }
    }
    macosArm64("macos").binaries {
        framework {
            export(project(":dependency"))
            export("org.example:exported-library:1.0")
        }
        sharedLib {
            // 可以將不同的相依性集合匯出至不同的二進位檔。
            export(project(':dependency'))
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets {
        macosMain.dependencies {
            // 將會被匯出。
            api project(':dependency')
            api 'org.example:exported-library:1.0'
            // 不會被匯出。
            api 'org.example:not-exported-library:1.0'
        }
    }
    macosArm64("macos").binaries {
        framework {
            export project(':dependency')
            export 'org.example:exported-library:1.0'
        }
        sharedLib {
            // 可以將不同的相依性集合匯出至不同的二進位檔。
            export project(':dependency')
        }
    }
}
```

</TabItem>
</Tabs>

例如，您在 Kotlin 中實作了數個模組，並希望從 Swift 存取它們。在 Swift 應用程式中使用多個 Kotlin/Native 架構受到限制，但您可以建立一個保護傘架構（umbrella framework），並將所有這些模組匯出至其中。

> 您只能匯出對應原始碼集的 [`api` 相依性](https://kotlinlang.org/docs/gradle-configure-project.html#dependency-types)。
>
{style="note"}

當您匯出相依性時，它會將其所有的 API 包含在架構 API 中。編譯器會將此相依性的程式碼加入架構中，即使您只使用了其中極小的一部分。這會對匯出的相依項（以及在一定程度上對其相依項）停用無效程式碼消除。

預設情況下，匯出是非遞移（non-transitively）運作的。這表示如果您匯出相依於程式庫 `bar` 的程式庫 `foo`，則只有 `foo` 的方法會被加入輸出架構中。

您可以使用 `transitiveExport` 選項更改此行為。如果設為 `true`，程式庫 `bar` 的宣告也會一併被匯出。

> 不建議使用 `transitiveExport`：它會將已匯出相依項的所有遞移相依性加入架構中。這可能會同時增加編譯時間與二進位檔大小。
>
> 在大多數情況下，您不需要將所有這些相依性加入架構 API 中。對於需要從 Swift 或 Objective-C 程式碼直接存取的相依項，請明確使用 `export`。
>
{style="warning"}

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
binaries {
    framework {
        export(project(":dependency"))
        // 遞移匯出。
        transitiveExport = true
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
binaries {
    framework {
        export project(':dependency')
        // 遞移匯出。
        transitiveExport = true
    }
}
```

</TabItem>
</Tabs>

## 組建通用架構 {id="build-universal-frameworks"}

預設情況下，Kotlin/Native 產生的 Objective-C 架構僅支援單一平台。但是，您可以使用 [`lipo` 工具](https://llvm.org/docs/CommandGuide/llvm-lipo.html)將此類架構合併為單一通用（fat）二進位檔。此操作對於 32 位元和 64 位元的 iOS 架構尤其有意義。在此情況下，您可以在 32 位元和 64 位元裝置上使用產生的通用架構。

> fat 架構必須與初始架構具有相同的基本名稱（base name）。否則會發生錯誤。
>
{style="warning"}

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.tasks.FatFrameworkTask

kotlin {
    // 建立並設定目標。
    val watchos32 = watchosArm32("watchos32")
    val watchos64 = watchosArm64("watchos64")
    configure(listOf(watchos32, watchos64)) {
        binaries.framework {
            baseName = "MyFramework"
        }
    }
    // 建立用於組建 fat 架構的任務。
    tasks.register<FatFrameworkTask>("debugFatFramework") {
        // fat 架構必須與初始架構具有相同的基本名稱。
        baseName = "MyFramework"
        // 預設目的地目錄為 "<組建目錄>/fat-framework"。
        destinationDirProperty.set(layout.buildDirectory.dir("fat-framework/debug"))
        // 指定要合併的架構。
        from(
            watchos32.binaries.getFramework("DEBUG"),
            watchos64.binaries.getFramework("DEBUG")
        )
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.tasks.FatFrameworkTask

kotlin {
    // 建立並設定目標。
    targets {
        watchosArm32("watchos32")
        watchosArm64("watchos64")
        configure([watchos32, watchos64]) {
            binaries.framework {
                baseName = "MyFramework"
            }
        }
    }
    // 建立用於組建 fat 架構的任務。
    tasks.register("debugFatFramework", FatFrameworkTask) {
        // fat 架構必須與初始架構具有相同的基本名稱。
        baseName = "MyFramework"
        // 預設目的地目錄為 "<組建目錄>/fat-framework"。
        destinationDirProperty.set(layout.buildDirectory.dir("fat-framework/debug"))
        // 指定要合併的架構。
        from(
            targets.watchos32.binaries.getFramework("DEBUG"),
            targets.watchos64.binaries.getFramework("DEBUG")
        )
    }
}
```

</TabItem>
</Tabs>

## 組建 XCFramework {id="build-xcframeworks"}

所有 Kotlin Multiplatform 專案都可以使用 XCFramework 作為輸出，將所有目標平台與架構的邏輯聚集在單一套件組合（bundle）中。與[通用（fat）架構](#build-universal-frameworks)不同，您在將應用程式發佈到 App Store 之前，無需移除所有不必要的架構。

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.plugin.mpp.apple.XCFramework

plugins {
    kotlin("multiplatform") version "%kotlinVersion%"
}

kotlin {
    val xcf = XCFramework()
    val iosTargets = listOf(iosArm64(), iosSimulatorArm64())
    
    iosTargets.forEach {
        it.binaries.framework {
            baseName = "shared"
            xcf.add(this)
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.plugin.mpp.apple.XCFrameworkConfig

plugins {
    id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
}

kotlin {
    def xcf = new XCFrameworkConfig(project)
    def iosTargets = [iosArm64(), iosSimulatorArm64()]
    
    iosTargets.forEach {
        it.binaries.framework {
            baseName = 'shared'
            xcf.add(it)
        }
    }
}
```

</TabItem>
</Tabs>

宣告 XCFramework 時，Kotlin Gradle 外掛程式會註冊數個 Gradle 任務：

* `assembleXCFramework`
* `assemble<Framework name>DebugXCFramework`
* `assemble<Framework name>ReleaseXCFramework`

<a id="build-frameworks"></a>

如果您在專案中使用 [CocoaPods 整合](multiplatform-cocoapods-overview.md)，可以使用 Kotlin CocoaPods Gradle 外掛程式組建 XCFramework。它包含以下任務，可使用所有已註冊的目標組建 XCFramework 並產生 podspec 檔案：

* `podPublishReleaseXCFramework`：產生 release XCFramework 以及 podspec 檔案。
* `podPublishDebugXCFramework`：產生 debug XCFramework 以及 podspec 檔案。
* `podPublishXCFramework`：同時產生 debug 與 release XCFramework 以及 podspec 檔案。

這有助於您透過 CocoaPods 將專案的共享部分與行動應用程式分開發佈。您也可以使用 XCFramework 發佈至私有或公用 podspec 存儲庫。

> 如果 Kotlin 架構是針對不同版本的 Kotlin 所組建的，則不建議將其發佈到公用存儲庫。這樣做可能會導致終端使用者的專案發生衝突。
>
{style="warning"}

## 自訂 Info.plist 檔案 {id="customize-the-info-plist-file"}

產生架構時，Kotlin/Native 編譯器會產生資訊屬性清單檔案 `Info.plist`。您可以使用相應的二進位檔選項自訂其屬性：

| 屬性 | 二進位檔選項 |
|------------------------------|----------------------------|
| `CFBundleIdentifier`         | `bundleId`                 |
| `CFBundleShortVersionString` | `bundleShortVersionString` |
| `CFBundleVersion`            | `bundleVersion`            |

若要啟用此功能，請傳遞編譯器旗標 `-Xbinary=$option=$value`，或針對特定架構設定 Gradle DSL `binaryOption("option", "value")`：

```kotlin
binaries {
    framework {
        binaryOption("bundleId", "com.example.app")
        binaryOption("bundleVersion", "2")
    }
}
```