[//]: # (title: 組建最終原生二進位檔)

預設情況下，Kotlin/Native 目標會被編譯為 `*.klib` 程式庫構件，其可由 Kotlin/Native 本身作為相依性取用，但無法被執行或作為原生程式庫使用。

若要宣告最終原生二進位檔（例如可執行檔或共享程式庫），請使用原生目標的 `binaries` 屬性。此屬性代表除了預設的 `*.klib` 構件外，為此目標組建的原生二進位檔集合，並提供一組用於宣告與配置它們的方法。

> `kotlin-multiplatform` 外掛程式預設不會建立任何生產環境二進位檔。預設唯一可用的二進位檔是偵錯測試可執行檔，讓您可以從 `test` 編譯中執行單元測試。
>
{style="note"}

Kotlin/Native 編譯器產生的二進位檔可能包含第三方程式碼、資料或衍生著作。這意味著如果您散佈 Kotlin/Native 編譯的最終二進位檔，應始終在您的二進位檔散佈套件中包含必要的[授權檔案](https://kotlinlang.org/docs/native-binary-licenses.html)。

## 宣告二進位檔 {id="declare-binaries"}

使用以下工廠方法來宣告 `binaries` 集合的元素。

| 工廠方法 | 二進位檔種類 | 可用於 |
|----------------|-----------------------|--------------------------------------------|
| `executable`   | 產品可執行檔 | 所有原生目標 |
| `test`         | 測試可執行檔 | 所有原生目標 |
| `sharedLib`    | 共享原生程式庫 | 所有原生目標 |
| `staticLib`    | 靜態原生程式庫 | 所有原生目標 |
| `framework`    | Objective-C 架構 | 僅限 macOS、iOS、watchOS 與 tvOS 目標 |

最簡單的版本不需要任何額外參數，並為每種組建類型建立一個二進位檔。目前有兩種組建類型可用：

* `DEBUG` – 產生帶有額外元資料的非最佳化二進位檔，在使用[偵錯工具](https://kotlinlang.org/docs/native-debugging.html)時很有幫助
* `RELEASE` – 產生不含偵錯資訊的最佳化二進位檔

以下程式碼片段建立了兩個可執行二進位檔，分別為 debug 與 release：

```kotlin
kotlin {
    linuxX64 { // 請改為定義您的目標。
        binaries {
            executable {
                // 二進位檔配置。
            }
        }
    }
}
```

如果不需要[額外配置](multiplatform-dsl-reference.md#native-targets)，您可以省略 Lambda：

```kotlin
binaries {
    executable()
}
```

您可以指定要為哪些組建類型建立二進位檔。在以下範例中，僅建立了 `debug` 可執行檔：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
binaries {
    executable(listOf(DEBUG)) {
        // 二進位檔配置。
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
binaries {
    executable([DEBUG]) {
        // 二進位檔配置。
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
        // 二進位檔配置。
    }

    // 可以省略組建類型列表
    //（在這種情況下，將使用所有可用的組建類型）。
    executable("bar") {
        // 二進位檔配置。
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
binaries {
    executable('foo', [DEBUG]) {
        // 二進位檔配置。
    }

    // 可以省略組建類型列表
    //（在這種情況下，將使用所有可用的組建類型）。
    executable('bar') {
        // 二進位檔配置。
    }
}
```

</TabItem>
</Tabs>

第一個引數設定名稱字首，這是二進位檔的預設名稱。例如，對於 Windows，程式碼會產生 `foo.exe` 與 `bar.exe` 檔案。您也可以使用名稱字首來[在組建指令碼中存取二進位檔](#access-binaries)。

## 存取二進位檔 {id="access-binaries"}

您可以存取二進位檔以[配置它們](multiplatform-dsl-reference.md#native-targets)或獲取其屬性（例如輸出檔案的路徑）。

您可以透過唯一名稱獲取二進位檔。此名稱基於名稱字首（如果已指定）、組建類型與二進位檔種類，遵循以下模式：`<optional-name-prefix><build-type><binary-kind>`，例如 `releaseFramework` 或 `testDebugExecutable`。

> 靜態與共享程式庫分別具有後綴 static 與 shared，例如 `fooDebugStatic` 或 `barReleaseShared`。
>
{style="note"}

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
// 如果不存在該二進位檔則失敗。
binaries["fooDebugExecutable"]
binaries.getByName("fooDebugExecutable")

// 如果不存在該二進位檔則傳回 null。
binaries.findByName("fooDebugExecutable")
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
// 如果不存在該二進位檔則失敗。
binaries['fooDebugExecutable']
binaries.fooDebugExecutable
binaries.getByName('fooDebugExecutable')

// 如果不存在該二進位檔則傳回 null。
binaries.findByName('fooDebugExecutable')
```

</TabItem>
</Tabs>

或者，您可以使用具型別的 Getter 透過其名稱字首與組建類型來存取二進位檔。

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
// 如果不存在該二進位檔則失敗。
binaries.getExecutable("foo", DEBUG)
binaries.getExecutable(DEBUG)          // 如果未設定名稱字首，請跳過第一個引數。
binaries.getExecutable("bar", "DEBUG") // 您也可以為組建類型使用字串。

// 類似的 Getter 也可用於其他二進位檔種類：
// getFramework、getStaticLib 與 getSharedLib。

// 如果不存在該二進位檔則傳回 null。
binaries.findExecutable("foo", DEBUG)

// 類似的 Getter 也可用於其他二進位檔種類：
// findFramework、findStaticLib 與 findSharedLib。
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
// 如果不存在該二進位檔則失敗。
binaries.getExecutable('foo', DEBUG)
binaries.getExecutable(DEBUG)          // 如果未設定名稱字首，請跳過第一個引數。
binaries.getExecutable('bar', 'DEBUG') // 您也可以為組建類型使用字串。

// 類似的 Getter 也可用於其他二進位檔種類：
// getFramework、getStaticLib 與 getSharedLib。

// 如果不存在該二進位檔則傳回 null。
binaries.findExecutable('foo', DEBUG)

// 類似的 Getter 也可用於其他二進位檔種類：
// findFramework、findStaticLib 與 findSharedLib。
```

</TabItem>
</Tabs>

## 匯出相依性至二進位檔 {id="export-dependencies-to-binaries"}

組建 Objective-C 架構或原生程式庫（共享或靜態）時，您可能不僅需要封裝當前專案的類別，還需要封裝其相依性的類別。使用 `export` 方法指定要匯出至二進位檔的相依性。

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        macosMain.dependencies {
            // 將被匯出。
            api(project(":dependency"))
            api("org.example:exported-library:1.0")
            // 將不會被匯出。
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
            // 將被匯出。
            api project(':dependency')
            api 'org.example:exported-library:1.0'
            // 將不會被匯出。
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

例如，您在 Kotlin 中實作了多個模組，並希望從 Swift 存取它們。在 Swift 應用程式中使用多個 Kotlin/Native 架構是有限制的，但您可以建立一個傘式架構 (umbrella framework) 並將所有這些模組匯出至其中。

> 您只能匯出對應原始碼集的 [`api` 相依性](https://kotlinlang.org/docs/gradle-configure-project.html#dependency-types)。
>
{style="note"}

當您匯出相依性時，它會將其所有的 API 包含到該架構的 API 中。編譯器會將此相依性的程式碼加入到架構中，即使您只使用了其中極小部分。這會針對匯出的相依性（以及在某種程度上對其相依項）停用無效程式碼刪除。

預設情況下，匯出是非遞移運行的。這意味著如果您匯出相依於程式庫 `bar` 的程式庫 `foo`，則只有 `foo` 的方法會被加入到輸出架構中。

您可以使用 `transitiveExport` 選項更改此行為。如果設定為 `true`，則程式庫 `bar` 的宣告也會被匯出。

> 不建議使用 `transitiveExport`：它會將匯出相依性的所有遞移相依性都加入到架構中。這可能會增加編譯時間與二進位檔大小。
>
> 在大多數情況下，您不需要將所有這些相依性加入到架構 API。對於需要從 Swift 或 Objective-C 程式碼直接存取的相依性，請明確使用 `export`。
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

預設情況下，Kotlin/Native 產生的 Objective-C 架構僅支援一個平台。然而，您可以使用 [`lipo` 工具](https://llvm.org/docs/CommandGuide/llvm-lipo.html)將此類架構合併為單一通用 (fat) 二進位檔。此操作對於 32 位元與 64 位元 iOS 架構特別有意義。在這種情況下，您可以在 32 位元與 64 位元裝置上同時使用產生的通用架構。

> 胖架構 (fat framework) 必須與初始架構具有相同的基本名稱 (base name)。否則，您將收到錯誤。
>
{style="warning"}

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.tasks.FatFrameworkTask

kotlin {
    // 建立並配置目標。
    val watchos32 = watchosArm32("watchos32")
    val watchos64 = watchosArm64("watchos64")
    configure(listOf(watchos32, watchos64)) {
        binaries.framework {
            baseName = "MyFramework"
        }
    }
    // 建立一個任務來組建胖架構。
    tasks.register<FatFrameworkTask>("debugFatFramework") {
        // 胖架構必須與初始架構具有相同的基本名稱。
        baseName = "MyFramework"
        // 預設目的地目錄為 "<build directory>/fat-framework"。
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
    // 建立並配置目標。
    targets {
        watchosArm32("watchos32")
        watchosArm64("watchos64")
        configure([watchos32, watchos64]) {
            binaries.framework {
                baseName = "MyFramework"
            }
        }
    }
    // 建立一個任務來組建胖架構。
    tasks.register("debugFatFramework", FatFrameworkTask) {
        // 胖架構必須與初始架構具有相同的基本名稱。
        baseName = "MyFramework"
        // 預設目的地目錄為 "<build directory>/fat-framework"。
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

## 組建 XCFrameworks {id="build-xcframeworks"}

所有 Kotlin 多平台專案都可以使用 XCFrameworks 作為輸出，將所有目標平台與架構的邏輯收集到單一套件 (bundle) 中。與[通用 (fat) 架構](#build-universal-frameworks)不同，在將應用程式發佈到 App Store 之前，您不需要移除所有不必要的架構。

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

當您宣告 XCFrameworks 時，Kotlin Gradle 外掛程式將註冊多個 Gradle 任務：

* `assembleXCFramework`
* `assemble<Framework name>DebugXCFramework`
* `assemble<Framework name>ReleaseXCFramework`

undefined

如果您在專案中使用 [CocoaPods 整合](multiplatform-cocoapods-overview.md)，可以使用 Kotlin CocoaPods Gradle 外掛程式組建 XCFrameworks。它包含以下任務，可組建包含所有已註冊目標的 XCFrameworks 並產生 podspec 檔案：

* `podPublishReleaseXCFramework`，產生 Release XCFramework 以及 podspec 檔案。
* `podPublishDebugXCFramework`，產生 Debug XCFramework 以及 podspec 檔案。
* `podPublishXCFramework`，同時產生 Debug 與 Release XCFrameworks 以及 podspec 檔案。

這可以幫助您透過 CocoaPods 將專案的共享部分與行動應用程式分開散佈。您也可以使用 XCFrameworks 發佈到私有或公共 podspec 存儲庫。

> 如果 Kotlin 架構是針對不同版本的 Kotlin 組建的，不建議將其發佈到公共存儲庫。這樣做可能會導致終端使用者的專案出現衝突。
>
{style="warning"}

## 自訂 Info.plist 檔案 {id="customize-the-info-plist-file"}

產生架構時，Kotlin/Native 編譯器會產生資訊屬性清單檔案 `Info.plist`。您可以使用對應的二進位檔選項自訂其屬性：

| 屬性 | 二進位檔選項 |
|------------------------------|----------------------------|
| `CFBundleIdentifier`         | `bundleId`                 |
| `CFBundleShortVersionString` | `bundleShortVersionString` |
| `CFBundleVersion`            | `bundleVersion`            |

若要啟用此功能，請傳遞 `-Xbinary=$option=$value` 編譯器旗標，或在特定架構的 Gradle DSL 中設定 `binaryOption("option", "value")`：

```kotlin
binaries {
    framework {
        binaryOption("bundleId", "com.example.app")
        binaryOption("bundleVersion", "2")
    }
}
```
