[//]: # (title: 多平台 Gradle DSL 參考)

Kotlin 多平台 Gradle 外掛程式是用於建立 Kotlin 多平台專案的工具。
我們在此提供其內容的參考；在為 Kotlin 多平台專案撰寫 Gradle 建置指令碼時，可將其作為提醒。進一步了解 [Kotlin 多平台專案的概念、如何建立與配置它們](multiplatform-discover-project.md)。

## ID 與版本

Kotlin 多平台 Gradle 外掛程式的完全限定名稱為 `org.jetbrains.kotlin.multiplatform`。
如果您使用 Kotlin Gradle DSL，可以使用 `kotlin("multiplatform")` 套用該外掛程式。
外掛程式版本與 Kotlin 發佈版本相符。最新版本為 %kotlinVersion%。

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("multiplatform") version "%kotlinVersion%"
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
}
```

</TabItem>
</Tabs>

## 最上層區塊

`kotlin {}` 是 Gradle 建置指令碼中用於多平台專案配置的最上層區塊。
在 `kotlin {}` 內部，您可以撰寫以下區塊：

| **區塊**             | **說明**                                                                                                 |
|----------------------|----------------------------------------------------------------------------------------------------------|
| _&lt;targetName&gt;_ | 宣告專案的特定目標。可用目標的名稱列在 [目標](#targets) 區段中。                                         |
| `targets`            | 列出專案的所有目標。                                                                                     |
| `sourceSets`         | 配置預定義的原始碼集並宣告專案的自訂 [原始碼集](#source-sets)。                                          |
| `compilerOptions`    | 指定共用的延伸層級 [編譯器選項](#compiler-options)，這些選項將作為所有目標和共用原始碼集的預設值。       |
| `dependencies`       | 配置 [共用相依性](#configure-dependencies-at-the-top-level)。（實驗性）                                  |

## 目標

「目標」（target）是組建中負責編譯、測試和封裝針對其中一個受支援平台的軟體部分。Kotlin 為每個平台提供目標，因此您可以指示 Kotlin 為該特定目標編譯程式碼。進一步了解 [設定目標](multiplatform-discover-project.md#targets)。

每個目標可以有一個或多個 [編譯](#compilations)。除了用於測試和生產用途的預設編譯外，您還可以 [建立自訂編譯](multiplatform-configure-compilations.md#create-a-custom-compilation)。

多平台專案的目標在 `kotlin {}` 內部的相應區塊中描述，例如 `jvm`、`android`、`iosArm64`。
可用目標的完整清單如下：

<table>
    
<tr>
<th>目標平台</th>
        <th>目標</th>
        <th>註解</th>
</tr>

    
<tr>
<td>Kotlin/JVM</td>
        <td><code>jvm</code></td>
        <td></td>
</tr>

    
<tr>
<td rowspan="2">Kotlin/Wasm</td>
        <td><code>wasmJs</code></td>
        <td>如果您計畫在 JavaScript 執行階段執行專案，請使用此目標。</td>
</tr>

    
<tr>
<td><code>wasmWasi</code></td>
        <td>如果您需要支援 <a href="https://github.com/WebAssembly/WASI">WASI</a> 系統介面，請使用此目標。</td>
</tr>

    
<tr>
<td>Kotlin/JS</td>
        <td><code>js</code></td>
        <td>
            <p>選擇執行環境：</p>
            <list>
                <li><code>browser {}</code> 用於在瀏覽器中執行的應用程式。</li>
                <li><code>nodejs {}</code> 用於在 Node.js 上執行的應用程式。</li>
            </list>
            <p>在 <a href="https://kotlinlang.org/docs/js-project-setup.html#execution-environments">設定 Kotlin/JS 專案</a> 中了解更多資訊。</p>
        </td>
</tr>

    
<tr>
<td>Kotlin/Native</td>
        <td></td>
        <td>
            <p>在 <a href="https://kotlinlang.org/docs/native-target-support.html">Kotlin/Native 目標支援</a> 中了解目前 macOS、Linux 和 Windows 主機受支援的目標。</p>
        </td>
</tr>

    
<tr>
<td>Android 應用程式與程式庫</td>
        <td><code>android</code></td>
        <td>
            <p>手動套用 Android Gradle 外掛程式：<code>com.android.application</code> 或 <code>com.android.kotlin.multiplatform.library</code>。</p>
            <p>每個 Gradle 子專案只能建立一個 Android 目標。</p>
        </td>
</tr>

</table>

> 當前主機不支援的目標在建置期間會被忽略，因此不會發佈。
>
{style="note"}

```groovy
kotlin {
    jvm()
    iosArm64()
    macosArm64()
    js().browser()
}
```

目標的配置可以包含兩個部分：

* 適用於所有目標的 [共用配置](#common-target-configuration)。
* 特定於目標的配置。

每個目標可以有一個或多個 [編譯](#compilations)。

### 共用目標配置

在任何目標區塊中，您可以使用以下宣告：

| **名稱**            | **說明**                                                                                                                                           | 
|---------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| `platformType`      | 此目標的 Kotlin 平台。可用值：`jvm`、`androidJvm`、`js`、`wasm`、`native`、`common`。                                                             |
| `artifactsTaskName` | 建置此目標結果產物（artifacts）的任務名稱。                                                                                                         |
| `components`        | 用於設定 Gradle 發佈的元件。                                                                                                                     |
| `compilerOptions`   | 用於該目標的 [編譯器選項](#compiler-options)。此宣告會覆寫在 [最上層](multiplatform-dsl-reference.md#top-level-blocks) 配置的任何 `compilerOptions {}`。 |

### Web 目標

`js {}` 區塊描述了 Kotlin/JS 目標的配置，而 `wasmJs {}` 區塊描述了與 JavaScript 互通的 Kotlin/Wasm 目標的配置。根據目標執行環境的不同，它們可以包含以下兩個區塊之一：

| **名稱**              | **說明**                      | 
|-----------------------|-------------------------------|
| [`browser`](#browser) | 瀏覽器目標的配置。             |
| [`nodejs`](#node-js)  | Node.js 目標的配置。          |

進一步了解 [配置 Kotlin/JS 專案](https://kotlinlang.org/docs/js-project-setup.html)。

獨立的 `wasmWasi {}` 區塊描述了支援 WASI 系統介面的 Kotlin/Wasm 目標配置。在此處，僅 [`nodejs`](#node-js) 執行環境可用：

```kotlin
kotlin {
    wasmWasi {
        nodejs()
        binaries.executable()
    }
}
```

所有的 Web 目標（`js`、`wasmJs` 和 `wasmWasi`）也支援 `binaries.executable()` 呼叫。它明確指示 Kotlin 編譯器發出可執行檔。如需更多資訊，請參閱 Kotlin/JS 文件中的 [執行環境](https://kotlinlang.org/docs/js-project-setup.html#execution-environments)。

#### 瀏覽器 (Browser)

`browser {}` 可以包含以下配置區塊：

| **名稱**       | **說明**                                                                   | 
|----------------|----------------------------------------------------------------------------|
| `testRuns`     | 測試執行的配置。                                                           |
| `runTask`      | 專案執行的配置。                                                           |
| `webpackTask`  | 使用 [Webpack](https://webpack.js.org/) 進行專案打包的配置。               |
| `distribution` | 輸出檔案的路徑。                                                           |

```kotlin
kotlin {
    js().browser {
        webpackTask { /* ... */ }
        testRuns { /* ... */ }
        distribution {
            directory = File("$projectDir/customdir/")
        }
    }
}
```

#### Node.js

`nodejs {}` 可以包含測試和執行任務的配置：

| **名稱**   | **說明**           | 
|------------|--------------------|
| `testRuns` | 測試執行的配置。   |
| `runTask`  | 專案執行的配置。   |

```kotlin
kotlin {
    js().nodejs {
        runTask { /* ... */ }
        testRuns { /* ... */ }
    }
}
```

### 原生目標 (Native targets)

對於原生目標，提供以下特定區塊：

| **名稱**    | **說明**                                                  | 
|-------------|-----------------------------------------------------------|
| `binaries`  | 要產生的 [二進位檔](#binaries) 配置。                    |
| `cinterops` | 與 [C 程式庫互通性](#cinterops) 的配置。                |

#### 二進位檔 (Binaries)

有以下幾種二進位檔：

| **名稱**     | **說明**               | 
|--------------|------------------------|
| `executable` | 產品可執行檔。         |
| `test`       | 測試可執行檔。         |
| `sharedLib`  | 共用程式庫。           |
| `staticLib`  | 靜態程式庫。           |
| `framework`  | Objective-C 架構。     |

```kotlin
kotlin {
    linuxX64 { // 請改用您的目標。
        binaries {
            executable {
                // 二進位檔配置。
            }
        }
    }
}
```

對於二進位檔配置，可以使用以下參數：

| **名稱**             | **說明**                                                                                                                                                                                                                                              | 
|----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `compilation`        | 建置二進位檔所依據的編譯。預設情況下，`test` 二進位檔基於 `test` 編譯，而其他二進位檔則基於 `main` 編譯。                                                                                                                                            |
| `linkerOpts`         | 在二進位檔建置期間傳遞給系統連結器的選項。                                                                                                                                                                                                                    |
| `baseName`           | 輸出檔案的自訂基本名稱。最終檔案名稱將透過在此基本名稱後加入系統相關的前綴和後綴來形成。                                                                                                                                                                      |
| `entryPoint`         | 可執行二進位檔的入口點函式。預設情況下，它是根套件中的 `main()`。                                                                                                                                                                                            |
| `outputFile`         | 存取輸出檔案。                                                                                                                                                                                                                                                |
| `linkTask`           | 存取連結任務。                                                                                                                                                                                                                                                |
| `runTask`            | 存取可執行二進位檔的執行任務。對於 `linuxX64`、`macosArm64` 或 `mingwX64` 以外的目標，該值為 `null`。                                                                                                                                                          |
| `isStatic`           | 用於 Objective-C 架構。包含靜態程式庫而非動態程式庫。                                                                                                                                                                                                        |
| `disableNativeCache` | <p>停用編譯快取。僅在特殊情況下使用，因為它會增加編譯時間。</p><p>必須包含要停用快取的 Kotlin `version` 以及 `reason`（原因）。您可以選擇性地指定指向錯誤追蹤器中 `issue` 的 URL。</p> |

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
binaries {
    executable("my_executable", listOf(RELEASE)) {
        // 基於 test 編譯建置二進位檔。
        compilation = compilations["test"]

        // 連結器的自訂命令列選項。
        linkerOpts = mutableListOf("-L/lib/search/path", "-L/another/search/path", "-lmylib")

        // 輸出檔案的基本名稱。
        baseName = "foo"

        // 自訂入口點函式。
        entryPoint = "org.example.main"

        // 存取輸出檔案。
        println("Executable path: ${outputFile.absolutePath}")

        // 存取連結任務。
        linkTask.dependsOn(additionalPreprocessingTask)

        // 存取執行任務。
        // 請注意，對於非主機平台，runTask 為 null。
        runTask?.dependsOn(prepareForRun)
    }

    framework("my_framework" listOf(RELEASE)) {
        // 在架構中包含靜態程式庫而非動態程式庫。
        isStatic = true

        // 停用此二進位檔的編譯快取
        disableNativeCache(
            version = DisableCacheInKotlinVersion.2_3_0,
            reason = "Cache bug",
            issue = URI("https://youtrack.com/YY-1111")
        )
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
binaries {
    executable('my_executable', [RELEASE]) {
        // 基於 test 編譯建置二進位檔。
        compilation = compilations.test

        // 連結器的自訂命令列選項。
        linkerOpts = ['-L/lib/search/path', '-L/another/search/path', '-lmylib']

        // 輸出檔案的基本名稱。
        baseName = 'foo'

        // 自訂入口點函式。
        entryPoint = 'org.example.main'

        // 存取輸出檔案。
        println("Executable path: ${outputFile.absolutePath}")

        // 存取連結任務。
        linkTask.dependsOn(additionalPreprocessingTask)

        // 存取執行任務。
        // 請注意，對於非主機平台，runTask 為 null。
        runTask?.dependsOn(prepareForRun)
    }

    framework('my_framework' [RELEASE]) {
        // 在架構中包含靜態程式庫而非動態程式庫。
        isStatic = true

        // 停用此二進位檔的編譯快取
        disableNativeCache(
            version = DisableCacheInKotlinVersion .2_3_0,
            reason = 'Cache bug',
            issue = URI('https://youtrack.com/YY-1111')
        )
    }
}
```

</TabItem>
</Tabs>

進一步了解 [建置原生二進位檔](multiplatform-build-native-binaries.md)。

#### Cinterops

`cinterops` 是與原生程式庫互通的說明集合。
要提供與程式庫的互通性，請在 `cinterops` 中加入一個項目並定義其參數：

| **名稱**         | **說明**                                               | 
|------------------|--------------------------------------------------------|
| `definitionFile` | 描述原生 API 的 `.def` 檔案。                          |
| `packageName`    | 產生的 Kotlin API 的套件前綴。                         |
| `compilerOpts`   | cinterop 工具要傳遞給編譯器的選項。                    |
| `includeDirs`    | 尋找標頭檔的目錄。                                     |
| `header`         | 要包含在繫結中的標頭檔。                               |
| `headers`        | 要包含在繫結中的標頭檔清單。                           |

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    linuxX64 { // 替換為您需要的目標。
        compilations.getByName("main") {
            val myInterop by cinterops.creating {
                // 描述原生 API 的定義檔案。
                // 預設路徑為 src/nativeInterop/cinterop/<interop-name>.def
                definitionFile.set(project.file("def-file.def"))

                // 放置產生的 Kotlin API 的套件。
                packageName("org.sample")

                // cinterop 工具要傳遞給編譯器的選項。
                compilerOpts("-Ipath/to/headers")

                // 標頭檔搜尋目錄（類似於 -I<path> 編譯器選項）。
                includeDirs.allHeaders("path1", "path2")

                // includeDirs.allHeaders 的捷徑。
                includeDirs("include/directory", "another/directory")

                // 要包含在繫結中的標頭檔。
                header("path/to/header.h")
                headers("path/to/header1.h", "path/to/header2.h")
            }

            val anotherInterop by cinterops.creating { /* ... */ }
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    linuxX64 { // 替換為您需要的目標。
        compilations.main {
            cinterops {
                myInterop {
                    // 描述原生 API 的定義檔案。
                    // 預設路徑為 src/nativeInterop/cinterop/<interop-name>.def
                    definitionFile = project.file("def-file.def")

                    // 放置產生的 Kotlin API 的套件。
                    packageName 'org.sample'

                    // cinterop 工具要傳遞給編譯器的選項。
                    compilerOpts '-Ipath/to/headers'

                    // 標頭檔搜尋目錄（類似於 -I<path> 編譯器選項）。
                    includeDirs.allHeaders("path1", "path2")

                    // includeDirs.allHeaders 的捷徑。
                    includeDirs("include/directory", "another/directory")

                    // 要包含在繫結中的標頭檔。
                    header("path/to/header.h")
                    headers("path/to/header1.h", "path/to/header2.h")
                }

                anotherInterop { /* ... */ }
            }
        }
    }
}
```

</TabItem>
</Tabs>

如需更多 cinterop 屬性，請參閱 [定義檔案](https://kotlinlang.org/docs/native-definition-file.html#properties)。

### Android 目標

Kotlin 多平台 Gradle 外掛程式具有特定函式，可協助您為 Android 目標配置 [建置變體](https://developer.android.com/studio/build/build-variants)：

| **名稱**                      | **說明**                                                                                                                                              | 
|-------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| `publishLibraryVariants()`    | 指定要發佈的建置變體。進一步了解 [發佈 Android 程式庫](multiplatform-publish-lib-setup.md#publish-an-android-library)。 |

```kotlin
kotlin {
    android {
        publishLibraryVariants("release")
    }
}
```

進一步了解 [Android 編譯](multiplatform-configure-compilations.md#compilation-for-android)。

> `kotlin {}` 區塊內的 `android` 配置不會取代任何 Android 專案的組建組態。
> 在 [Android 開發者文件](https://developer.android.com/studio/build) 中了解更多關於撰寫 Android 專案建置指令碼的資訊。
>
{style="note"}

## 原始碼集 (Source sets)

`sourceSets {}` 區塊描述了專案的原始碼集。一個原始碼集包含一起參與編譯的 Kotlin 原始碼檔案，以及它們的資源和相依性。

多平台專案包含其目標的 [預定義](#predefined-source-sets) 原始碼集；開發人員也可以根據需要建立 [自訂](#custom-source-sets) 原始碼集。

### 預定義原始碼集

預定義原始碼集在建立多平台專案時會自動設定。
可用的預定義原始碼集如下：

| **名稱**                                     | **說明**                                                                                                                                                                          | 
|----------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `commonMain`                                 | 所有平台之間共用的程式碼和資源。在所有多平台專案中均可用。用於專案的所有主 [編譯](#compilations)。                                                                               |
| `commonTest`                                 | 所有平台之間共用的測試程式碼和資源。在所有多平台專案中均可用。用於專案的所有測試編譯。                                                                                           |
| _&lt;targetName&gt;&lt;compilationName&gt;_ | 編譯的特定目標原始碼。_&lt;targetName&gt;_ 是預定義目標的名稱，而 _&lt;compilationName&gt;_ 是該目標的編譯名稱。範例：`jsTest`、`jvmMain`。                                      |

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        commonMain { /* ... */ }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets { 
        commonMain { /* ... */ }
    }
}
```

</TabItem>
</Tabs>

進一步了解 [原始碼集](multiplatform-discover-project.md#source-sets)。

### 自訂原始碼集

自訂原始碼集由專案開發人員手動建立。
要建立自訂原始碼集，請在 `sourceSets` 區塊內加入一個帶有其名稱的區段。
如果使用 Kotlin Gradle DSL，請將自訂原始碼集標記為 `by creating`。

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets { 
        val myMain by creating { /* ... */ } // 建立一個名為 'MyMain' 的新原始碼集
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets { 
        myMain { /* ... */ } // 建立或配置一個名為 'myMain' 的原始碼集
    }
}
```

</TabItem>
</Tabs>

請注意，新建立的原始碼集未與其他原始碼集連接。要在專案的編譯中使用它，請將其 [與其他原始碼集連接](multiplatform-hierarchy.md#manual-configuration)。

### 原始碼集參數

原始碼集的配置存儲在 `sourceSets {}` 的相應區塊內。一個原始碼集具有以下參數：

| **名稱**           | **說明**                                                                           | 
|--------------------|-----------------------------------------------------------------------------------|
| `kotlin.srcDir`    | 原始碼集目錄中 Kotlin 原始碼檔案的位置。                                           |
| `resources.srcDir` | 原始碼集目錄中資源的位置。                                                         |
| `dependsOn`        | [與另一個原始碼集的連接](multiplatform-hierarchy.md#manual-configuration)。        |
| `dependencies`     | 原始碼集的 [相依性](#dependencies)。                                               |
| `languageSettings` | 應用於共用原始碼集的 [語言設定](#language-settings)。                              |

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin { 
    //...
    sourceSets { 
        commonMain {
            kotlin.srcDir("src")
            resources.srcDir("res")

            dependencies {
                /* ... */
            }
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
        commonMain {
            kotlin.srcDir('src')
            resources.srcDir('res')

            dependencies {
                /* ... */
            }
        }
    }
}
``` 

</TabItem>
</Tabs>

## 編譯 (Compilations)

一個目標可以有一個 or 多個編譯，例如用於生產或測試。有一些 [預定義編譯](#predefined-compilations) 會在目標建立時自動加入。您還可以額外建立 [自訂編譯](#custom-compilations)。

要參考目標的所有或某些特定編譯，請使用 `compilations` 物件集合。
從 `compilations` 中，您可以透過名稱參考編譯。

進一步了解 [配置編譯](multiplatform-configure-compilations.md)。

### 預定義編譯

預定義編譯會為專案的每個目標（Android 目標除外）自動建立。
可用的預定義編譯如下：

| **名稱** | **說明**                 | 
|----------|--------------------------|
| `main`   | 生產原始碼的編譯。       |
| `test`   | 測試的編譯。             |

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    jvm {
        val main by compilations.getting {
            output // 獲取主編譯輸出
        }

        compilations["test"].runtimeDependencyFiles // 獲取測試執行階段類別路徑 (classpath)
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    jvm {
        compilations.main.output // 獲取主編譯輸出
        compilations.test.runtimeDependencyFiles // 獲取測試執行階段類別路徑 (classpath)
    }
}
```

</TabItem>
</Tabs>

### 自訂編譯

除了預定義編譯外，您還可以建立自己的自訂編譯。
為此，請在新的編譯與 `main` 編譯之間設定 [`associateWith`](https://kotlinlang.org/docs/gradle-configure-project.html#associate-compiler-tasks) 關係。如果您使用的是 Kotlin Gradle DSL，請將自訂編譯標記為 `by creating`：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    jvm {
        compilations {
            val main by getting
            val integrationTest by creating {
                // 匯入 main 及其類別路徑作為相依性並建立 internal 可見性
                associateWith(main)
                defaultSourceSet {
                    dependencies {
                        implementation(kotlin("test-junit"))
                        /* ... */
                    }
                }

                // 建立一個測試任務來執行此編譯產生的測試
                testRuns.create("integration") {
                    // 配置測試任務
                    setExecutionSourceFrom(integrationTest)
                }
            }
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    jvm {
        compilations.create('integrationTest') {
            def main = compilations.main
            // 匯入 main 及其類別路徑作為相依性並建立 internal 可見性
            associateWith(main)
            defaultSourceSet {
                dependencies {
                    implementation kotlin('test-junit')
                    /* ... */
                }
            }

            // 建立一個測試任務來執行此編譯產生的測試
            testRuns.create('integration') {
                // 配置測試任務
                setExecutionSourceFrom(compilations.integrationTest)
            }
        }
    }
}
```

</TabItem>
</Tabs>

透過關聯編譯，您可以將主編譯輸出加入為相依性，並建立編譯之間的 `internal` 可見性。

進一步了解建立 [自訂編譯](multiplatform-configure-compilations.md#create-a-custom-compilation)。

### 編譯參數

編譯具有以下參數：

| **名稱**                 | **說明**                                                                                                                                                            | 
|--------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `defaultSourceSet`       | 編譯的預設原始碼集。                                                                                                                                              |
| `kotlinSourceSets`       | 參與編譯的原始碼集。                                                                                                                                              |
| `allKotlinSourceSets`    | 參與編譯的原始碼集及其透過 `dependsOn()` 建立的連接。                                                                                                              |
| `compilerOptions`        | 應用於編譯的編譯器選項。有關可用選項的清單，請參閱 [編譯器選項](https://kotlinlang.org/docs/gradle-compiler-options.html)。                                         |
| `compileKotlinTask`      | 用於編譯 Kotlin 原始碼的 Gradle 任務。                                                                                                                             |
| `compileKotlinTaskName`  | `compileKotlinTask` 的名稱。                                                                                                                                       |
| `compileAllTaskName`     | 編譯編譯中所有原始碼的 Gradle 任務名稱。                                                                                                                           |
| `output`                 | 編譯輸出。                                                                                                                                                         |
| `compileDependencyFiles` | 編譯的編譯時期相依檔案（類別路徑）。對於所有 Kotlin/Native 編譯，這會自動包含標準函式庫和平台相依性。                                                             |
| `runtimeDependencyFiles` | 編譯的執行階段相依檔案（類別路徑）。                                                                                                                               |

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    jvm {
        val main by compilations.getting {
            compileTaskProvider.configure {
                compilerOptions {
                    // 為 'main' 編譯設定 Kotlin 編譯器選項：
                    jvmTarget.set(JvmTarget.JVM_1_8)
                }
            }
        
            compileKotlinTask // 獲取 Kotlin 任務 'compileKotlinJvm' 
            output // 獲取主編譯輸出
        }
        
        compilations["test"].runtimeDependencyFiles // 獲取測試執行階段類別路徑
    }

    // 配置所有目標的所有編譯：
    compilerOptions {
        allWarningsAsErrors.set(true)
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    jvm {
        compilations.main {
            compileTaskProvider.configure {
                compilerOptions {
                    // 設定 'main' 編譯的 Kotlin 編譯器選項：
                    jvmTarget = JvmTarget.JVM_1_8
                }
            }
        }

        compilations.main.compileKotlinTask // 獲取 Kotlin 任務 'compileKotlinJvm' 
        compilations.main.output // 獲取主編譯輸出
        compilations.test.runtimeDependencyFiles // 獲取測試執行階段類別路徑
    }

    // 配置所有目標的所有編譯：
    compilerOptions {
        allWarningsAsErrors = true
    }
}
```

</TabItem>
</Tabs>

## 編譯器選項

您可以在專案的三個不同層級配置編譯器選項：

* **延伸層級**，在 `kotlin {}` 區塊中。
* **目標層級**，在目標區塊中。
* **編譯單元層級**，通常在特定的編譯任務中。

![Kotlin 編譯器選項層級](compiler-options-levels.svg){width=700}

較高層級的設定將作為其下層級的預設值：

* 在延伸層級設定的編譯器選項是目標層級選項的預設值，包括共用原始碼集，如 `commonMain`、`nativeMain` 和 `commonTest`。
* 在目標層級設定的編譯器選項是編譯單元（任務）層級選項的預設值，例如 `compileKotlinJvm` 和 `compileTestKotlinJvm` 任務。

在較低層級進行的配置會覆寫較高層級的類似設定：

* 任務層級的編譯器選項會覆寫目標或延伸層級的類似設定。
* 目標層級的編譯器選項會覆寫延伸層級的類似設定。

如需可能的編譯器選項清單，請參閱 [所有編譯器選項](https://kotlinlang.org/docs/gradle-compiler-options.html#all-compiler-options)。

### 延伸層級

要為專案中的所有目標配置編譯器選項，請在最上層使用 `compilerOptions {}` 區塊：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    // 配置所有目標的所有編譯
    compilerOptions {
        allWarningsAsErrors.set(true)
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    // 配置所有目標的所有編譯：
    compilerOptions {
        allWarningsAsErrors = true
    }
}
```

</TabItem>
</Tabs>

### 目標層級

要為專案中的特定目標配置編譯器選項，請在目標區塊內部使用 `compilerOptions {}` 區塊：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    jvm {
        // 配置 JVM 目標的所有編譯
        compilerOptions {
            allWarningsAsErrors.set(true)
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    jvm {
        // 配置 JVM 目標的所有編譯
        compilerOptions {
            allWarningsAsErrors = true
        }
    }
}
```

</TabItem>
</Tabs>

### 編譯單元層級

要為特定任務配置編譯器選項，請在任務內部使用 `compilerOptions {}` 區塊：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
task.named<KotlinJvmCompile>("compileKotlinJvm") {
    compilerOptions {
        allWarningsAsErrors.set(true)
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
task.named<KotlinJvmCompile>("compileKotlinJvm") {
    compilerOptions {
        allWarningsAsErrors = true
    }
}
```

</TabItem>
</Tabs>

要為特定編譯配置編譯器選項，請在編譯的任務提供者中使用 `compilerOptions {}` 區塊：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    jvm {
        compilations.named(KotlinCompilation.MAIN_COMPILATION_NAME) {
            compileTaskProvider.configure {
                // 配置 'main' 編譯：
                compilerOptions {
                    allWarningsAsErrors.set(true)
                }
            }
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    jvm {
        compilations.named(KotlinCompilation.MAIN_COMPILATION_NAME) {
            compileTaskProvider.configure {
                // 配置 'main' 編譯：
                compilerOptions {
                    allWarningsAsErrors = true
                }
            }
        }
    }
}
```

</TabItem>
</Tabs>

### 從 `kotlinOptions {}` 遷移至 `compilerOptions {}` {collapsible="true"}

在 Kotlin 2.2.0 之前，您可以使用 `kotlinOptions {}` 區塊配置編譯器選項。由於 `kotlinOptions {}` 區塊在 Kotlin 2.2.0 中已被棄用，您需要在建置指令碼中改用 `compilerOptions {}` 區塊。如需更多資訊，請參閱 [從 `kotlinOptions{}` 遷移至 `compilerOptions{}`](https://kotlinlang.org/docs/gradle-compiler-options.html#migrate-from-kotlinoptions-to-compileroptions)。

## 相依性 (Dependencies)

原始碼集宣告的 `dependencies {}` 區塊包含該原始碼集的相依性。

進一步了解 [配置相依性](https://kotlinlang.org/docs/gradle-configure-project.html)。

共有四種類型的相依性：

| **名稱**         | **說明**                                                                           | 
|------------------|-----------------------------------------------------------------------------------|
| `api`            | 在目前模組的 API 中使用的相依性。                                                 |
| `implementation` | 在模組中使用但未暴露在模組之外的相依性。                                           |
| `compileOnly`    | 僅用於編譯目前模組的相依性。                                                       |
| `runtimeOnly`    | 在執行階段可用，但在任何模組編譯期間不可見的相依性。                             |

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        commonMain {
            dependencies {
                api("com.example:foo-metadata:1.0")
            }
        }
        jvmMain {
            dependencies {
                implementation("com.example:foo-jvm:1.0")
            }
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
        commonMain {
            dependencies {
                api 'com.example:foo-metadata:1.0'
            }
        }
        jvmMain {
            dependencies {
                implementation 'com.example:foo-jvm:1.0'
            }
        }
    }
}
```

</TabItem>
</Tabs>

此外，原始碼集可以相互依賴並形成階層。
在這種情況下，會使用 [`dependsOn()`](#source-set-parameters) 關係。

### 在最上層配置相依性
<primary-label ref="Experimental"/>

您可以使用最上層的 `dependencies {}` 區塊配置共用相依性。在此處宣告的相依性，其行為就像被加入到 `commonMain` 或 `commonTest` 原始碼集中一樣。

要使用最上層的 `dependencies {}` 區塊，請在該區塊前加入 `@OptIn(ExperimentalKotlinGradlePluginApi::class)` 註解以選擇加入：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    @OptIn(ExperimentalKotlinGradlePluginApi::class)
    dependencies {
        implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    dependencies {
        implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%'
    }
}
```

</TabItem>
</Tabs>

在對應目標的 `sourceSets {}` 區塊內加入特定平台的相依性。

您可以在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-76446) 上分享對此功能的意見回饋。

## 語言設定 (Language settings)

原始碼集中的 `languageSettings {}` 區塊定義了專案分析和編譯的某些方面。僅當要配置專門應用於共用原始碼集的設定時，才使用 `languageSettings {}` 區塊。對於所有其他情況，請使用 `compilerOptions {}` 區塊在延伸或目標層級 [配置編譯器選項](#compiler-options)。

提供以下語言設定：

| **名稱**                | **說明**                                                                                                                               | 
|-------------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| `languageVersion`       | 提供與指定 Kotlin 版本的原始碼相容性。                                                                                                 |
| `apiVersion`            | 僅允許使用來自指定版本的 Kotlin 隨附程式庫的宣告。                                                                                      |
| `enableLanguageFeature` | 啟用指定的語言特性。可用值對應於目前為實驗性或曾在某個時間點作為實驗性引入的語言特性。                                                 |
| `optIn`                 | 允許使用指定的 [選擇加入註解 (opt-in annotation)](https://kotlinlang.org/docs/opt-in-requirements.html)。                             |
| `progressiveMode`       | 啟用 [漸進模式 (progressive mode)](https://kotlinlang.org/docs/whatsnew13.html#progressive-mode)。                                     |

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets.all {
        languageSettings.apply {
            languageVersion = "%languageVersion%" // 可能的值："2.0", "2.1", "2.2", "2.3", "2.4", "2.5"（實驗性）
            apiVersion = "%apiVersion%" // 可能的值："2.0", "2.1", "2.2", "2.3", "2.4", "2.5"（實驗性）
            enableLanguageFeature("InlineClasses") // 語言特性名稱
            optIn("kotlin.ExperimentalUnsignedTypes") // 註解的完全限定名稱 (FQ-name)
            progressiveMode = true // 預設為 false
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets.all {
        languageSettings {
            languageVersion = '%languageVersion%' // 可能的值：'2.0', '2.1', '2.2', '2.3', '2.4', '2.5'（實驗性）
            apiVersion = '%apiVersion%' // 可能的值：'2.0', '2.1', '2.2', '2.3', '2.4', '2.5'（實驗性）
            enableLanguageFeature('InlineClasses') // 語言特性名稱
            optIn('kotlin.ExperimentalUnsignedTypes') // 註解的完全限定名稱 (FQ-name)
            progressiveMode = true // 預設為 false
        }
    }
}
```

</TabItem>
</Tabs>