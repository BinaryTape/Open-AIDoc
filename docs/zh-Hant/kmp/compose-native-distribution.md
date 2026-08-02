[//]: # (title: 原生發行版本)

在這裡，你將了解原生發行版本：如何為所有支援的系統建立安裝程式和軟件包，以及如何以與發行版本相同的設定在本機執行應用程式。

請繼續閱讀以下主題的詳細資訊：

* [什麼是 Compose Multiplatform Gradle 外掛程式](#gradle-plugin)？
* [基本任務的詳細資訊](#basic-tasks)，例如在本機執行應用程式，以及[進階任務](#minification-and-obfuscation)（如縮減與混淆）。
* [如何包含 JDK 模組](#including-jdk-modules)以及如何處理 `ClassNotFoundException`。
* [如何指定發行屬性](#specifying-distribution-properties)：軟體包版本、JDK 版本、輸出目錄、啟動器屬性與元資料。
* [如何管理資源](#managing-resources)：使用資源程式庫、JVM 資源載入或將檔案加入封裝後的應用程式。
* [如何自訂原始碼集](#custom-source-sets)：使用 Gradle 原始碼集、Kotlin JVM 目標或手動配置。
* [如何指定應用程式圖示](#application-icon)：為每個作業系統指定圖示。
* [特定平台選項](#platform-specific-options)，例如 Linux 上的軟體包維護者電子郵件，以及 macOS 上 Apple App Store 的應用程式類別。
* [macOS 特定配置](#macos-specific-configuration)：簽名、公證與 `Info.plist`。

## Gradle plugin

本指南主要關注於使用 Compose Multiplatform Gradle 外掛程式來封裝 Compose 應用程式。`org.jetbrains.compose` 外掛程式提供了用於基本封裝、混淆和 macOS 程式碼簽名的任務。

該外掛程式簡化了使用 `jpackage` 將應用程式封裝為原生發行版本並在本機執行應用程式的過程。可發行的應用程式是自包含且可安裝的二進位檔案，其中包含了所有必要的 Java 執行階段元件，不需要在目標系統上安裝 JDK。

為了最小化軟體包大小，Gradle 外掛程式使用 [jlink](https://openjdk.org/jeps/282) 工具，以確保在可發行軟體包中僅綑綁必要的 Java 模組。但是，你仍必須配置 Gradle 外掛程式以指定所需的模組。如需詳細資訊，請參閱 [包含 JDK 模組](#including-jdk-modules)部分。

作為另一種選擇，你可以使用 [Conveyor](https://www.hydraulic.software)，這是一個非 JetBrains 開發的外部工具。Conveyor 支援線上更新、跨平台編譯以及各種其他功能，但對於非開源專案需要[授權](https://hydraulic.software/pricing.html)。如需詳細資訊，請參閱 [Conveyor 文件](https://conveyor.hydraulic.dev/latest/tutorial/hare/jvm)。

## Basic tasks

Compose Multiplatform Gradle 外掛程式中的基本可配置單元是 `application`（請勿與已棄用的 [Gradle application](https://docs.gradle.org/current/userguide/application_plugin.html) 外掛程式混淆）。

`application` DSL 方法為一組最終二進位檔案定義了共享配置，這意味著它允許你將檔案集合與 JDK 發行版本一起封裝成各種格式的壓縮二進位安裝程式。

以下格式可用於支援的作業系統：

* **macOS**：`.dmg` (`TargetFormat.Dmg`)、`.pkg` (`TargetFormat.Pkg`)
* **Windows**：`.exe` (`TargetFormat.Exe`)、`.msi` (`TargetFormat.Msi`)
* **Linux**：`.deb` (`TargetFormat.Deb`)、`.rpm` (`TargetFormat.Rpm`)

以下是具有基本桌面組態的 `build.gradle.kts` 檔案範例：

```kotlin
import org.jetbrains.compose.desktop.application.dsl.TargetFormat

plugins {
    kotlin("jvm")
    id("org.jetbrains.compose")
}

dependencies {
    implementation(compose.desktop.currentOs)
}

compose.desktop {
    application {
        mainClass = "example.MainKt"

        nativeDistributions {
            targetFormats(TargetFormat.Dmg, TargetFormat.Msi, TargetFormat.Exe)
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="compose.desktop { application { mainClass = "}

當你組建專案時，外掛程式會建立以下任務：

<table>
    
<tr>
<td>Gradle 任務</td>
        <td>描述</td>
</tr>

    
<tr>
<td><code>package&lt;FormatName&gt;</code></td> 
        <td>將應用程式封裝為對應的 <code>FormatName</code> 二進位檔案。目前不支援跨平台編譯，這意味著你只能使用對應的相容作業系統來組建特定格式。例如，要組建 <code>.dmg</code> 二進位檔案，你必須在 macOS 上執行 <code>packageDmg</code> 任務。如果有任何任務與當前作業系統不相容，它們預設會被跳過。</td>
</tr>

    
<tr>
<td><code>packageDistributionForCurrentOS</code></td>
        <td>聚合應用程式的所有封裝任務。這是一個<a href="https://docs.gradle.org/current/userguide/more_about_tasks.html#sec:task_categories">生命週期任務</a>。</td>
</tr>

    
<tr>
<td><code>packageUberJarForCurrentOS</code></td>
        <td>建立一個包含當前作業系統所有相依性的單一 jar 檔案。該任務預期將 <code>compose.desktop.currentOS</code> 作為 <code>compile</code>、<code>implementation</code> 或 <code>runtime</code> 相依性使用。</td>
</tr>

    
<tr>
<td><code>run</code></td>
        <td>在本機從 <code>mainClass</code> 中指定的入口點執行應用程式。<code>run</code> 任務會啟動一個具有完整執行階段且未封裝的 JVM 應用程式。與建立具有縮減執行階段的精簡二進位映像檔相比，此方法更快且更易於偵錯。若要執行最終的二進位映像檔，請改用 <code>runDistributable</code> 任務。</td>
</tr>

    
<tr>
<td><code>createDistributable</code></td>
        <td>建立最終的應用程式映像檔而不建立安裝程式。</td>
</tr>

    
<tr>
<td><code>runDistributable</code></td>
        <td>執行預先封裝的應用程式映像檔。</td>
</tr>

</table>

所有可用的任務都列在 Gradle 工具視窗中。執行任務後，Gradle 會在 `${project.buildDir}/compose/binaries` 目錄中產生輸出二進位檔案。

## Including JDK modules

為了減小可發行版本的大小，Gradle 外掛程式使用 [jlink](https://openjdk.org/jeps/282)，這有助於僅綑綁必要的 JDK 模組。

目前 Gradle 外掛程式不會自動確定必要的 JDK 模組。雖然這不會導致編譯問題，但未能提供必要的模組可能會導致在執行時出現 `ClassNotFoundException`。

如果在執行封裝後的應用程式或 `runDistributable` 任務時遇到 `ClassNotFoundException`，你可以使用 `modules` DSL 方法包含額外的 JDK 模組：

```kotlin
compose.desktop {
    application {
        nativeDistributions {
            modules("java.sql")
            // 或者：includeAllModules = true
        }
    }
}
```

你可以手動指定所需的模組，或執行 `suggestModules`。`suggestModules` 任務使用 [jdeps](https://docs.oracle.com/javase/9/tools/jdeps.htm) 靜態分析工具來確定可能缺失的模組。請注意，該工具的輸出可能不完整或列出不必要的模組。

如果可發行版本的大小不是關鍵因素且可以忽略，你可以選擇使用 `includeAllModules` DSL 屬性來包含所有執行階段模組。

## Specifying distribution properties

### Package version

原生發行軟體包必須具有特定的軟體包版本。若要指定軟體包版本，你可以使用以下 DSL 屬性，按優先級從高到低排列：

* `nativeDistributions.<os>.<packageFormat>PackageVersion` 為單一軟體包格式指定版本。
* `nativeDistributions.<os>.packageVersion` 為單一目標作業系統指定版本。
* `nativeDistributions.packageVersion` 為所有軟體包指定版本。

在 macOS 上，你還可以使用以下 DSL 屬性指定組建版本，同樣按優先級從高到低排列：

* `nativeDistributions.macOS.<packageFormat>PackageBuildVersion` 為單一軟體包格式指定組建版本。
* `nativeDistributions.macOS.packageBuildVersion` 為所有 macOS 軟體包指定組建版本。

如果你不指定組建版本，Gradle 將使用軟體包版本。如需了解有關 macOS 版本控制的更多資訊，請參閱 [`CFBundleShortVersionString`](https://developer.apple.com/documentation/bundleresources/information_property_list/cfbundleshortversionstring) 和 [`CFBundleVersion`](https://developer.apple.com/documentation/bundleresources/information_property_list/cfbundleversion) 文件。

以下是按優先級順序指定軟體包版本的範本：

```kotlin
compose.desktop {
    application {
        nativeDistributions {
            // 所有軟體包的版本
            packageVersion = "..." 
          
            macOS {
              // 所有 macOS 軟體包的版本
              packageVersion = "..."
              // 僅限 dmg 軟體包的版本
              dmgPackageVersion = "..." 
              // 僅限 pkg 軟體包的版本
              pkgPackageVersion = "..." 
              
              // 所有 macOS 軟體包的組建版本
              packageBuildVersion = "..."
              // 僅限 dmg 軟體包的組建版本
              dmgPackageBuildVersion = "..." 
              // 僅限 pkg 軟體包的組建版本
              pkgPackageBuildVersion = "..." 
            }
            windows {
              // 所有 Windows 軟體包的版本
              packageVersion = "..."  
              // 僅限 msi 軟體包的版本
              msiPackageVersion = "..."
              // 僅限 exe 軟體包的版本
              exePackageVersion = "..." 
            }
            linux {
              // 所有 Linux 軟體包的版本
              packageVersion = "..."
              // 僅限 deb 軟體包的版本
              debPackageVersion = "..."
              // 僅限 rpm 軟體包的版本
              rpmPackageVersion = "..."
            }
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="compose.desktop { application { nativeDistributions { packageVersion ="}

要定義軟體包版本，請遵循以下規則：

<table>
    
<tr>
<td>檔案類型</td>
        <td>版本格式</td>
        <td>詳細資訊</td>
</tr>

    
<tr>
<td><code>dmg</code>, <code>pkg</code></td>
        <td><code>MAJOR[.MINOR][.PATCH]</code></td>
        <td>
            <ul>
                <li><code>MAJOR</code> 為非負整數</li>
                <li><code>MINOR</code> 為選用的非負整數</li>
                <li><code>PATCH</code> 為選用的非負整數</li>
            </ul>
        </td>
</tr>

    
<tr>
<td><code>msi</code>, <code>exe</code></td>
        <td><code>MAJOR.MINOR.BUILD</code></td>
        <td>
            <ul>
                <li><code>MAJOR</code> 是最大值為 255 的非負整數</li>
                <li><code>MINOR</code> 是最大值為 255 的非負整數</li>
                <li><code>BUILD</code> 是最大值為 65535 的非負整數</li>
            </ul>
        </td>
</tr>

    
<tr>
<td><code>deb</code></td>
        <td><code>[EPOCH:]UPSTREAM_VERSION[-DEBIAN_REVISION]</code></td>
        <td>
            <ul>
                <li><code>EPOCH</code> 為選用的非負整數</li>
                <li><code>UPSTREAM_VERSION</code>:
                    <ul>
                        <li>只能包含英數字和 <code>.</code>, <code>+</code>, <code>-</code>, <code>~</code> 字元</li>
                        <li>必須以數字開頭</li>
                    </ul>
                </li>
                <li><code>DEBIAN_REVISION</code>:
                    <ul>
                        <li>選用項目</li>
                        <li>只能包含英數字和 <code>.</code>, <code>+</code>, <code>~</code> 字元</li>
                    </ul>
                </li>
            </ul>
            如需更多詳細資訊，請參閱 <a href="https://www.debian.org/doc/debian-policy/ch-controlfields.html#version">Debian 文件</a>。
        </td>
</tr>

    
<tr>
<td><code>rpm</code></td>
        <td>任何格式</td>
        <td>版本不得包含 <code>-</code>（連字號）字元。</td>
</tr>

</table>

### JDK version

該外掛程式使用 `jpackage`，其要求的 JDK 版本不得低於 [JDK 17](https://openjdk.java.net/projects/jdk/17/)。指定 JDK 版本時，請確保符合以下至少一項要求：

* `JAVA_HOME` 環境變數指向相容的 JDK 版本。
* 透過 DSL 設定 `javaHome` 屬性：

  ```kotlin
  compose.desktop {
      application {
          javaHome = System.getenv("JDK_17")
      }
  }
  ```

### Output directory

若要為原生發行版本使用自訂輸出目錄，請配置 `outputBaseDir` 屬性，如下所示：

```kotlin
compose.desktop {
    application {
        nativeDistributions {
            outputBaseDir.set(project.layout.buildDirectory.dir("customOutputDir"))
        }
    }
}
```

### Launcher properties

若要調整應用程式啟動流程，你可以自訂以下屬性：

<table>
  
<tr>
<td>屬性</td>
    <td>描述</td>
</tr>

  
<tr>
<td><code>mainClass</code></td>
    <td>包含 <code>main</code> 方法的類別完全限定名稱。</td>
</tr>

  
<tr>
<td><code>args</code></td>
    <td>應用程式 <code>main</code> 方法的引數。</td>
</tr>

  
<tr>
<td><code>jvmArgs</code></td>
    <td>應用程式 JVM 的引數。</td>
</tr>

</table>

以下是配置範例：

```kotlin
compose.desktop {
    application {
        mainClass = "MainKt"
        args += listOf("-customArgument")
        jvmArgs += listOf("-Xmx2G")
    }
}
```

### Metadata

在 `nativeDistributions` DSL 區塊中，你可以配置以下屬性：

<table>
  
<tr>
<td>屬性</td>
    <td>描述</td>
    <td>預設值</td>
</tr>

  
<tr>
<td><code>packageName</code></td>
    <td>應用程式名稱。</td>
    <td>Gradle 專案的 <a href="https://docs.gradle.org/current/javadoc/org/gradle/api/Project.html#getName--">名稱 (name)</a></td>
</tr>

  
<tr>
<td><code>packageVersion</code></td>
    <td>應用程式版本。</td>
    <td>Gradle 專案的 <a href="https://docs.gradle.org/current/javadoc/org/gradle/api/Project.html#getVersion--">版本 (version)</a></td>
</tr>

  
<tr>
<td><code>description</code></td>
    <td>應用程式描述。</td>
    <td>無</td>
</tr>

  
<tr>
<td><code>copyright</code></td>
    <td>應用程式的版權資訊。</td>
    <td>無</td>
</tr>

  
<tr>
<td><code>vendor</code></td>
    <td>應用程式廠商。</td>
    <td>無</td>
</tr>

  
<tr>
<td><code>licenseFile</code></td>
    <td>應用程式的授權檔案。</td>
    <td>無</td>
</tr>

</table> 

以下是配置範例：

```kotlin
compose.desktop {
    application {
        nativeDistributions {
            packageName = "ExampleApp"
            packageVersion = "0.1-SNAPSHOT"
            description = "Compose Multiplatform App"
            copyright = "© 2024 My Name. All rights reserved."
            vendor = "Example vendor"
            licenseFile.set(project.file("LICENSE.txt"))
        }
    }
}
```

## Managing resources

若要封裝並載入資源，你可以使用 Compose Multiplatform 資源程式庫、JVM 資源載入，或將檔案加入封裝後的應用程式。

### Resources library

為專案設置資源最直接的方法是使用資源程式庫。透過資源程式庫，你可以在所有支援平台的共通程式碼中存取資源。有關詳細資訊，請參閱[多平台資源](compose-multiplatform-resources.md)。

### JVM resource loading

用於桌面的 Compose Multiplatform 在 JVM 平台上運作，這意味著你可以使用 `java.lang.Class` API 從 `.jar` 檔案中載入資源。你可以透過 [`Class::getResource`](https://docs.oracle.com/en/java/javase/15/docs/api/java.base/java/lang/Class.html#getResource(java.lang.String)) 或 [`Class::getResourceAsStream`](https://docs.oracle.com/en/java/javase/15/docs/api/java.base/java/lang/Class.html#getResourceAsStream(java.lang.String)) 存取 `src/main/resources` 目錄中的檔案。

### Adding files to packaged application

在某些情況下，從 `.jar` 檔案載入資源可能不太切合實際，例如當你擁有特定平台的資產，且只需要在 macOS 軟體包中包含檔案，而不需要在 Windows 中包含時。

在這些情況下，你可以配置 Gradle 外掛程式以在安裝目錄中包含額外的資源檔案。使用 DSL 指定資源根目錄，如下所示：

```kotlin
compose.desktop {
    application {
        mainClass = "MainKt"
        nativeDistributions {
            targetFormats(TargetFormat.Dmg, TargetFormat.Msi, TargetFormat.Deb)
            packageVersion = "1.0.0"

            appResourcesRootDir.set(project.layout.projectDirectory.dir("resources"))
        }
    }
}
```

在上面的範例中，資源根目錄被定義為 `<PROJECT_DIR>/resources`。

Gradle 外掛程式將按以下方式包含來自資源子目錄的檔案：

1. **通用資源：**
位於 `<RESOURCES_ROOT_DIR>/common` 中的檔案將包含在所有軟體包中，無論目標作業系統或架構為何。

2. **作業系統特定資源：**
位於 `<RESOURCES_ROOT_DIR>/<OS_NAME>` 中的檔案將僅包含在為特定作業系統組建的軟體包中。`<OS_NAME>` 的有效值為：`windows`、`macos` 和 `linux`。

3. **作業系統與架構特定資源：**
位於 `<RESOURCES_ROOT_DIR>/<OS_NAME>-<ARCH_NAME>` 中的檔案將僅包含在為作業系統和 CPU 架構特定組合組建的軟體包中。`<ARCH_NAME>` 的有效值為：`x64` 和 `arm64`。例如，`<RESOURCES_ROOT_DIR>/macos-arm64` 中的檔案將僅包含在專為 Apple 晶片 Mac 設計的軟體包中。

你可以使用 `compose.application.resources.dir` 系統屬性存取包含的資源：

```kotlin
import java.io.File

val resourcesDir = File(System.getProperty("compose.application.resources.dir"))

fun main() {
    println(resourcesDir.resolve("resource.txt").readText())
}
```

## Custom source sets

如果你使用 `org.jetbrains.kotlin.jvm` 或 `org.jetbrains.kotlin.multiplatform` 外掛程式，則可以依賴預設組態：

* 使用 `org.jetbrains.kotlin.jvm` 的配置包含來自 `main` [原始碼集](https://docs.gradle.org/current/userguide/java_plugin.html#source_sets)的內容。
* 使用 `org.jetbrains.kotlin.multiplatform` 的配置包含來自單一 [JVM 目標](multiplatform-dsl-reference.md#targets)的內容。如果你定義了多個 JVM 目標，預設配置將被停用。在這種情況下，你需要手動配置外掛程式，或指定單一目標（見下文）。

如果預設配置不明確或不足，你可以透過多種方式進行自訂：

使用 Gradle [原始碼集](https://docs.gradle.org/current/userguide/java_plugin.html#source_sets)：

``` kotlin
plugins {
    kotlin("jvm")
    id("org.jetbrains.compose")
}
val customSourceSet = sourceSets.create("customSourceSet")
compose.desktop {
    application {
        from(customSourceSet)
    }
}
``` 

使用 Kotlin [JVM 目標](multiplatform-dsl-reference.md#targets)：

``` kotlin
plugins {
    kotlin("multiplatform")
    id("org.jetbrains.compose")
} 
kotlin {
    jvm("customJvmTarget") {}
}
compose.desktop {
    application {
        from(kotlin.targets["customJvmTarget"])
    }
}
```

手動配置：

* 使用 `disableDefaultConfiguration` 停用預設設定。
* 使用 `fromFiles` 指定要包含的檔案。
* 指定 `mainJar` 檔案屬性以指向包含主類別的 `.jar` 檔案。
* 使用 `dependsOn` 將任務相依性加入所有外掛程式任務。
``` kotlin
compose.desktop {
    application {
        disableDefaultConfiguration()
        fromFiles(project.fileTree("libs/") { include("**/*.jar") })
        mainJar.set(project.file("main.jar"))
        dependsOn("mainJarTask")
    }
}
```

## Application icon

請確保你的應用程式圖示具有以下作業系統特定的格式：

* macOS 使用 `.icns`
* Windows 使用 `.ico`
* Linux 使用 `.png`

```kotlin
compose.desktop {
    application {
        nativeDistributions {
            macOS {
                iconFile.set(project.file("icon.icns"))
            }
            windows {
                iconFile.set(project.file("icon.ico"))
            }
            linux {
                iconFile.set(project.file("icon.png"))
            }
        }
    }
}
```

## Platform-specific options

特定平台設定可以使用對應的 DSL 區塊進行配置：

``` kotlin
compose.desktop {
    application {
        nativeDistributions {
            macOS {
                // macOS 選項
            }
            windows {
                // Windows 選項
            }
            linux {
                // Linux 選項
            }
        }
    }
}
```

下表描述了所有受支援的特定平台選項。**不建議**使用未記錄的屬性。

<table>
    
<tr>
<td>平台</td>
        <td>選項</td>
        <td width="500">描述</td>
</tr>

    
<tr>
<td rowspan="3">所有平台</td>
        <td><code>iconFile.set(File("PATH_TO_ICON"))</code></td>
        <td>指定應用程式特定平台圖示的路徑。詳情請參閱<a href="#application-icon">應用程式圖示</a>部分。</td>
</tr>

    
<tr>
<td><code>packageVersion = "1.0.0"</code></td>
        <td>設定特定平台的軟體包版本。詳情請參閱<a href="#package-version">軟體包版本</a>部分。</td>
</tr>

    
<tr>
<td><code>installationPath = "PATH_TO_INST_DIR"</code></td>
        <td>指定預設安裝目錄的絕對路徑或相對路徑。在 Windows 上，你還可以使用 <code>dirChooser = true</code> 以在安裝期間啟用路徑自訂。</td>
</tr>

    
<tr>
<td rowspan="8">Linux</td>
        <td><code>packageName = "custom-package-name"</code></td>
        <td>覆寫預設應用程式名稱。</td>
</tr>

    
<tr>
<td><code>debMaintainer = "maintainer@example.com"</code></td>
        <td>指定軟體包維護者的電子郵件。</td>
</tr>

    
<tr>
<td><code>menuGroup = "my-example-menu-group"</code></td>
        <td>為應用程式定義選單群組。</td>
</tr>

    
<tr>
<td><code>appRelease = "1"</code></td>
        <td>為 rpm 軟體包設定發佈 (release) 值，或為 deb 軟體包設定修訂 (revision) 值。</td>
</tr>

    
<tr>
<td><code>appCategory = "CATEGORY"</code></td>
        <td>為 rpm 軟體包分配群組值，或為 deb 軟體包分配區段值。</td>
</tr>

    
<tr>
<td><code>rpmLicenseType = "TYPE_OF_LICENSE"</code></td>
        <td>指示 rpm 軟體包的授權類型。</td>
</tr>

    
<tr>
<td><code>debPackageVersion = "DEB_VERSION"</code></td>
        <td>設定 deb 特定的軟體包版本。詳情請參閱<a href="#package-version">軟體包版本</a>部分。</td>
</tr>

    
<tr>
<td><code>rpmPackageVersion = "RPM_VERSION"</code></td>
        <td>設定 rpm 特定的軟體包版本。詳情請參閱<a href="#package-version">軟體包版本</a>部分。</td>
</tr>

    
<tr>
<td rowspan="15">macOS</td>
        <td><code>bundleID</code></td>
        <td>
            指定唯一的應用程式識別碼，只能包含英數字元 (<code>A-Z</code>, <code>a-z</code>, <code>0-9</code>)、連字號 (<code>-</code>) 和句點 (<code>.</code>)。建議使用反向 DNS 表示法 (<code>com.mycompany.myapp</code>)。
        </td>
</tr>

    
<tr>
<td><code>packageName</code></td>
        <td>應用程式名稱。</td>
</tr>

    
<tr>
<td><code>dockName</code></td>
        <td>
            應用程式在選單列、「關於 &lt;App&gt;」選單項目和 Dock 中顯示的名稱。預設值為 <code>packageName</code>。
        </td>
</tr>

    
<tr>
<td><code>minimumSystemVersion</code></td>
        <td>
            執行應用程式所需的最基本 macOS 版本。詳情請參閱 <a href="https://developer.apple.com/documentation/bundleresources/information_property_list/lsminimumsystemversion"><code>LSMinimumSystemVersion</code></a>。
        </td>
</tr>

    
<tr>
<td><code>signing</code>, <code>notarization</code>, <code>provisioningProfile</code>, <code>runtimeProvisioningProfile</code></td>
        <td>
            請參閱 <a href="https://github.com/JetBrains/compose-multiplatform/tree/master/tutorials/Signing_and_notarization_on_macOS">macOS 發行版本的簽名與公證</a>教學。
        </td>
</tr>

    
<tr>
<td><code>appStore = true</code></td>
        <td>指定是否為 Apple App Store 組建並簽名應用程式。至少需要 JDK 17。</td>
</tr>

    
<tr>
<td><code>appCategory</code></td>
        <td>
            Apple App Store 的應用程式類別。為 App Store 組建時，預設值為 <code>public.app-category.utilities</code>，否則為 <code>Unknown</code>。有關有效類別的清單，請參閱 <a href="https://developer.apple.com/documentation/bundleresources/information_property_list/lsapplicationcategorytype"><code>LSApplicationCategoryType</code></a>。
        </td>
</tr>

    
<tr>
<td><code>entitlementsFile.set(File("PATH_ENT"))</code></td>
        <td>
            指定簽名時使用的權利 (entitlements) 檔案路徑。提供自訂檔案時，請確保添加 Java 應用程式所需的權利。有關為 App Store 組建時使用的預設檔案，請參閱 <a href="https://github.com/openjdk/jdk/blob/master/src/jdk.jpackage/macosx/classes/jdk/jpackage/internal/resources/sandbox.plist">sandbox.plist</a>。請注意，此預設檔案可能因 JDK 版本而異。如果未指定檔案，外掛程式將使用 <code>jpackage</code> 提供的預設權利。詳情請參閱 <a href="https://github.com/JetBrains/compose-multiplatform/tree/master/tutorials/Signing_and_notarization_on_macOS">macOS 發行版本的簽名與公證</a>教學。
        </td>
</tr>

    
<tr>
<td><code>runtimeEntitlementsFile.set(File("PATH_R_ENT"))</code></td>
        <td>
            指定簽名 JVM 執行階段時使用的權利檔案路徑。提供自訂檔案時，請確保添加 Java 應用程式所需的權利。有關為 App Store 組建時使用的預設檔案，請參閱 <a href="https://github.com/openjdk/jdk/blob/master/src/jdk.jpackage/macosx/classes/jdk/jpackage/internal/resources/sandbox.plist">sandbox.plist</a>。請注意，此預設檔案可能因 JDK 版本而異。如果未指定檔案，外掛程式將使用 <code>jpackage</code> 提供的預設權利。詳情請參閱 <a href="https://github.com/JetBrains/compose-multiplatform/tree/master/tutorials/Signing_and_notarization_on_macOS">macOS 發行版本的簽名與公證</a>教學。
        </td>
</tr>

    
<tr>
<td><code>dmgPackageVersion = "DMG_VERSION"</code></td>
        <td>
            設定 DMG 特定的軟體包版本。詳情請參閱<a href="#package-version">軟體包版本</a>部分。
        </td>
</tr>

    
<tr>
<td><code>pkgPackageVersion = "PKG_VERSION"</code></td>
        <td>
            設定 PKG 特定的軟體包版本。詳情請參閱<a href="#package-version">軟體包版本</a>部分。
        </td>
</tr>

    
<tr>
<td><code>packageBuildVersion = "DMG_VERSION"</code></td>
        <td>
            設定軟體包組建版本。詳情請參閱<a href="#package-version">軟體包版本</a>部分。
        </td>
</tr>

    
<tr>
<td><code>dmgPackageBuildVersion = "DMG_VERSION"</code></td>
        <td>
            設定 DMG 特定的軟體包組建版本。詳情請參閱<a href="#package-version">軟體包版本</a>部分。
        </td>
</tr>

    
<tr>
<td><code>pkgPackageBuildVersion = "PKG_VERSION"</code></td>
        <td>
            設定 PKG 特定的軟體包組建版本。詳情請參閱<a href="#package-version">軟體包版本</a>部分。
        </td>
</tr>

    
<tr>
<td><code>infoPlist</code></td>
        <td>請參閱 <a href="#information-property-list-on-macos">macOS 上的 <code>Info.plist</code></a>部分。</td>
</tr>

        
<tr>
<td rowspan="7">Windows</td>
            <td><code>console = true</code></td>
            <td>為應用程式添加主控台啟動器。</td>
</tr>

        
<tr>
<td><code>dirChooser = true</code></td>
            <td>允許在安裝期間自訂安裝路徑。</td>
</tr>

        
<tr>
<td><code>perUserInstall = true</code></td>
            <td>允許按使用者 (per-user) 安裝應用程式。</td>
</tr>

        
<tr>
<td><code>menuGroup = "start-menu-group"</code></td>
            <td>將應用程式加入指定的「開始」功能表群組。</td>
</tr>

        
<tr>
<td><code>upgradeUuid = "UUID"</code></td>
            <td>指定一個唯一的 ID，當版本高於已安裝版本時，允許使用者透過安裝程式更新應用程式。單一應用程式的此值必須保持不變。詳情請參閱 <a href="https://wixtoolset.org/documentation/manual/v3/howtos/general/generate_guids.html">How To: Generate a GUID</a>。</td>
</tr>

        
<tr>
<td><code>msiPackageVersion = "MSI_VERSION"</code></td>
            <td>設定 MSI 特定的軟體包版本。詳情請參閱<a href="#package-version">軟體包版本</a>部分。</td>
</tr>

        
<tr>
<td><code>exePackageVersion = "EXE_VERSION"</code></td>
            <td>設定 EXE 特定的軟體包版本。詳情請參閱<a href="#package-version">軟體包版本</a>部分。</td>
</tr>

</table>

## macOS-specific configuration

### Signing and notarization on macOS

現代 macOS 版本不允許使用者執行從網際網路下載的未簽名應用程式。如果你嘗試執行此類應用程式，將會遇到以下錯誤：「YourApp 已損壞，無法開啟。你應該退出磁碟映像檔」。

若要了解如何簽名並公證你的應用程式，請參閱我們的[教學](https://github.com/JetBrains/compose-multiplatform/blob/master/tutorials/Signing_and_notarization_on_macOS/README.md)。

### Information property list on macOS

雖然 DSL 支援基本的特定平台自訂，但仍可能存在超出所提供功能的情況。如果你需要指定 DSL 中未表示的 `Info.plist` 值，可以包含一段原始 XML 作為暫時解決方法。此 XML 將被附加到應用程式發行的 `Info.plist` 中。

#### Example: Deep linking

1. 在 `build.gradle.kts` 檔案中定義自訂 URL 配置 (scheme)：

    ``` kotlin
    compose.desktop {
      application {
          mainClass = "MainKt"
          nativeDistributions {
              targetFormats(TargetFormat.Dmg)
              packageName = "Deep Linking Example App"
              macOS {
                  bundleID = "org.jetbrains.compose.examples.deeplinking"
                  infoPlist {
                      extraKeysRawXml = macExtraPlistKeys
                  }
              }
          }
      }
    }
    
    val macExtraPlistKeys: String
      get() = """
        <key>CFBundleURLTypes</key>
        <array>
          <dict>
            <key>CFBundleURLName</key>
            <string>Example deep link</string>
            <key>CFBundleURLSchemes</key>
            <array>
              <string>compose</string>
            </array>
          </dict>
        </array>
      """
    ```
    {initial-collapse-state="collapsed" collapsible="true" collapsed-title="infoPlist { extraKeysRawXml = macExtraPlistKeys"}

2. 在 `src/main/main.kt` 檔案中使用 `java.awt.Desktop` 類別設置 URI 處理常式：

    ``` kotlin 
    import androidx.compose.material.MaterialTheme
    import androidx.compose.material.Text
    import androidx.compose.runtime.getValue
    import androidx.compose.runtime.mutableStateOf
    import androidx.compose.runtime.setValue
    import androidx.compose.ui.window.singleWindowApplication
    import java.awt.Desktop
    
    fun main() {
      var text by mutableStateOf("Hello, World!")
    
      try {
          Desktop.getDesktop().setOpenURIHandler { event ->
              text = "Open URI: " + event.uri
          }
      } catch (e: UnsupportedOperationException) {
          println("setOpenURIHandler is unsupported")
      }
    
      singleWindowApplication {
          MaterialTheme {
              Text(text)
          }
      }
    }
    ```
    {initial-collapse-state="collapsed" collapsible="true" collapsed-title="Desktop.getDesktop().setOpenURIHandler { event ->"}

3. 執行 `runDistributable` 任務：`./gradlew runDistributable`。

結果，像 `compose://foo/bar` 這樣的連結現在可以從瀏覽器重新導向到你的應用程式。

## Minification and obfuscation

Compose Multiplatform Gradle 外掛程式包含對 [ProGuard](https://www.guardsquare.com/proguard) 的內建支援。ProGuard 是一套用於程式碼縮減與混淆的[開源工具](https://github.com/Guardsquare/proguard)。

對於每個 *預設* 封裝任務（不含 ProGuard），Gradle 外掛程式都提供了一個 *發佈 (release)* 任務（含 ProGuard）：

<table>
  
<tr>
<td width="400">Gradle 任務</td>
    <td>描述</td>
</tr>

  
<tr>
<td>
        <p>預設：<code>createDistributable</code></p>
        <p>發佈：<code>createReleaseDistributable</code></p>
    </td>
    <td>建立一個綑綁了 JDK 和資源的應用程式映像檔。</td>
</tr>

  
<tr>
<td>
        <p>預設：<code>runDistributable</code></p>
        <p>發佈：<code>runReleaseDistributable</code></p>
    </td>
    <td>執行一個綑綁了 JDK 和資源的應用程式映像檔。</td>
</tr>

  
<tr>
<td>
        <p>預設：<code>run</code></p>
        <p>發佈：<code>runRelease</code></p>
    </td>
    <td>使用 Gradle JDK 執行未封裝的應用程式 <code>.jar</code>。</td>
</tr>

  
<tr>
<td>
        <p>預設：<code>package&lt;FORMAT_NAME&gt;</code></p>
        <p>發佈：<code>packageRelease&lt;FORMAT_NAME&gt;</code></p>
    </td>
    <td>將應用程式映像檔封裝到 <code>&lt;FORMAT_NAME&gt;</code> 檔案中。</td>
</tr>

  
<tr>
<td>
        <p>預設：<code>packageDistributionForCurrentOS</code></p>
        <p>發佈：<code>packageReleaseDistributionForCurrentOS</code></p>
    </td>
    <td>將應用程式映像檔封裝成與當前作業系統相容的格式。</td>
</tr>

  
<tr>
<td>
        <p>預設：<code>packageUberJarForCurrentOS</code></p>
        <p>發佈：<code>packageReleaseUberJarForCurrentOS</code></p>
    </td>
    <td>將應用程式映像檔封裝到 Uber (fat) `.jar` 中。</td>
</tr>

  
<tr>
<td>
        <p>預設：<code>notarize&lt;FORMAT_NAME&gt;</code></p>
        <p>發佈：<code>notarizeRelease&lt;FORMAT_NAME&gt;</code></p>
    </td>
    <td>上傳 <code>&lt;FORMAT_NAME&gt;</code> 應用程式映像檔以進行公證（僅限 macOS）。</td>
</tr>

  
<tr>
<td>
        <p>預設：<code>checkNotarizationStatus</code></p>
        <p>發佈：<code>checkReleaseNotarizationStatus</code></p>
    </td>
    <td>檢查公證是否成功（僅限 macOS）。</td>
</tr>

</table>

預設配置會啟用一些預先定義的 ProGuard 規則：

* 應用程式映像檔會被縮減，這意味著未使用的類別將被移除。
* `compose.desktop.application.mainClass` 被用作入口點。
* 包含多條 `keep` 規則以確保 Compose 執行階段保持功能正常。

在大多數情況下，你不需要任何額外的配置即可獲得縮減後的應用程式。然而，ProGuard 可能無法追蹤位元組碼中的某些用法，例如，當一個類別透過反射使用時。如果你遇到僅在 ProGuard 處理後才發生的問題，你可能需要添加自訂規則。

你可以使用 Gradle DSL 在 `buildTypes.release.proguard` 區塊中配置 ProGuard，選項如下：

* `configurationFiles` 指定自訂的 ProGuard 組態檔案。
    ```kotlin
    compose.desktop {
        application {
            buildTypes.release.proguard {
                configurationFiles.from(project.file("compose-desktop.pro"))
            }
        }
    }
    ```
    {initial-collapse-state="collapsed" collapsible="true" collapsed-title='configurationFiles.from(project.file("compose-desktop.pro"))'}

* `obfuscate` 啟用程式碼混淆。混淆功能預設是停用的。
    ```kotlin
    compose.desktop {
        application {
            buildTypes.release.proguard {
                obfuscate.set(true)
            }
        }
    }
    ```
    {initial-collapse-state="collapsed" collapsible="true" collapsed-title="obfuscate.set(true)"}

* `optimize` 控制 ProGuard 優化。優化功能預設是啟用的。
    ```kotlin
    compose.desktop {
        application {
            buildTypes.release.proguard {
                optimize.set(false)
            }
        }
    }
    ```
    {initial-collapse-state="collapsed" collapsible="true" collapsed-title="optimize.set(false)"}

* `joinOutputJars` 產生單一的 Uber JAR。預設情況下，ProGuard 會為每個輸入的 `.jar` 產生一個對應的 `.jar` 檔案。
    ```kotlin
    compose.desktop {
        application {
            buildTypes.release.proguard {
                joinOutputJars.set(true)
            }
        }
    }
    ```
    {initial-collapse-state="collapsed" collapsible="true" collapsed-title="joinOutputJars.set(true)"}

[//]: # (TODO update version for stable release)

* `version` 設定特定的 ProGuard 版本。JDK 25 至少需要 ProGuard 7.8.0，這是從 Compose Multiplatform 1.12.0-beta01 開始的預設版本。如果你使用較早版本的 Compose Multiplatform 並使用 JDK 25 進行建置，請明確將此屬性設為 `7.8.0`：
    ```kotlin
    compose.desktop {
        application {
            buildTypes.release.proguard {
                version.set("7.8.0")
            }
        }
    }
    ```
    {initial-collapse-state="collapsed" collapsible="true" collapsed-title='version.set("7.8.0")'}

有關 ProGuard 規則和配置選項的完整清單，請參閱 Guardsquare 的 [ProGuard 手冊](https://www.guardsquare.com/manual/configuration/usage)。

## What's next?

探索關於[桌面組件](https://github.com/JetBrains/compose-multiplatform/tree/master/tutorials#desktop)的教學。