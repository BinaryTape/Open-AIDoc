[//]: # (title: 從命令列執行 KSP)

<web-summary>了解如何在沒有適用於 Gradle 的 KSP 外掛程式的情況下，從命令列執行 KSP。</web-summary>

大多數專案都透過 [Gradle 的 KSP 外掛程式](https://central.sonatype.com/artifact/com.google.devtools.ksp/com.google.devtools.ksp.gradle.plugin)來使用 KSP，該外掛程式會在編譯期間自動執行 KSP。作為另一種選擇，你也可以從命令列執行 KSP。如果你要將 KSP 與其他建構系統整合、開發處理器，或是測試與偵錯程式碼，這會非常有用。

由於 KSP 是一個 JVM 應用程式，請使用 `java` 指令從命令列啟動 KSP。提供 classpath 以及任何必要的引數：

```bash
java -cp <classpath> <mainclass> <options> <processor>
```

| 引數            | 說明                                                                        |
|---------------|---------------------------------------------------------------------------|
| `<classpath>` | 通往 [KSP 執行時期 JAR 檔案](#classpath) 及其相依性的路徑。                           |
| `<mainclass>` | 特定平台的 KSP [入口點](#main-class)。                                       |
| `<options>`   | KSP 的命令列[選項](#options)。                                                 |
| `<processor>` | 通往處理器 JAR 的路徑。                                                        |

## Classpath {id="classpath"}

與 Gradle 的 KSP 外掛程式不同，`java` 指令不會自動解析相依性。你必須在 classpath 上提供 KSP 執行時期 JAR 檔案及其相依性。

從 GitHub 上的 [KSP 發佈頁面](https://github.com/google/ksp/releases/tag/%kspVersion%)下載 `artifacts.zip`。該封存檔包含所需的 KSP JAR 檔案：

* `symbol-processing-aa-%kspVersion%.jar`
* `symbol-processing-common-deps-%kspVersion%.jar`
* `symbol-processing-api-%kspVersion%.jar`

你還必須納入來自 Maven 存儲庫的以下執行時期相依性：

* [`kotlin-stdlib-%kotlinVersion%.jar`](https://mvnrepository.com/artifact/org.jetbrains.kotlin/kotlin-stdlib)
* [`kotlinx-coroutines-core-jvm-%coroutinesVersion%.jar`](https://mvnrepository.com/artifact/org.jetbrains.kotlinx/kotlinx-coroutines-core-jvm)

## Main class {id="main-class"}

因為 KSP 是一個 JVM 應用程式，所以你必須指定要啟動的 main 類別。KSP 為每個受支援的平台提供了不同的入口點：

| 入口點               | 平台                                                              |
| ----------------- | --------------------------------------------------------------- |
| `KSPJvmMain`      | Kotlin/JVM 與 Android                                           |
| `KSPJsMain`       | Kotlin/JS                                                       |
| `KSPNativeMain`   | Kotlin/Native 目標，例如 iOS、macOS、Linux 與 Windows                 |
| `KSPCommonMain`   | Kotlin Multiplatform 專案中的通用編譯                             |

使用 `java` 啟動 KSP 時，請指定完全限定類名。例如：

```bash
java -cp <classpath> com.google.devtools.ksp.cmdline.KSPJvmMain <options> <processor>
```

以下範例使用 `KSPJvmMain` 為 JVM 目標執行 KSP：

```bash
java -cp \
symbol-processing-aa-%kspVersion%.jar:\
symbol-processing-common-deps-%kspVersion%.jar:\
symbol-processing-api-%kspVersion%.jar:\
kotlin-stdlib-%kotlinVersion%.jar:\
kotlinx-coroutines-core-jvm-%coroutinesVersion%.jar \
com.google.devtools.ksp.cmdline.KSPJvmMain \
-language-version=2.0 \
-api-version=2.0 \
-jvm-target=11 \
-module-name=main \
-source-roots=project_dir/src/kotlin/main \
-project-base-dir=project_dir/ \
-output-base-dir=project_dir/build/ \
-caches-dir=project_dir/build/caches/ \
-class-output-dir=project_dir/build/out/main/classes \
-kotlin-output-dir=project_dir/build/out/main/kotlin/ \
-java-output-dir=project_dir/build/out/main/java/ \
-resource-output-dir=project_dir/build/out/main/res/ \
path/to/processor.jar
```

## Options {id="options"}

`KSPJvmMain` 入口點需要以下選項：

| 選項                            | 說明                                                                                            |
|-------------------------------|-----------------------------------------------------------------------------------------------|
| `-language-version=<version>` | 專案中使用的 [Kotlin 語言版本](compiler-reference.md#language-version-version)。                     |
| `-api-version=<version>`      | [Kotlin API 版本](compiler-reference.md#api-version-version)。                                |
| `-jvm-target=<version>`       | 目標 JVM 版本。                                                                                    |
| `-module-name=<name>`         | 模組名稱。                                                                                         |
| `-source-roots=<paths>`       | 原始碼根目錄。多個目錄請使用冒號分隔的清單。                                                                        |
| `-project-base-dir=<path>`    | 專案根目錄。                                                                                        |
| `-output-base-dir=<path>`     | KSP 輸出的基礎目錄。                                                                                  |
| `-caches-dir=<path>`          | KSP 快取目錄。                                                                                     |
| `-java-output-dir=<path>`     | 產生的 Java 檔案目錄。                                                                                |
| `-class-output-dir=<path>`    | 產生的 class 檔案目錄。                                                                               |
| `-kotlin-output-dir=<path>`   | 產生的 Kotlin 檔案目錄。                                                                              |
| `-resource-output-dir=<path>` | 產生的資源目錄。                                                                                      |
| `<processor>`                 | 處理器 classpath。                                                                               |

其他入口點使用不同的選項集。若要查看特定入口點的完整選項清單，請執行以下指令：

```bash
java -cp <classpath> <mainclass> -h
```

### 其他選項 {id="other-options"}

* `-libraries=<path>`：用於解析原始碼檔案所參照相依性的 classpath。這通常是模組的編譯 classpath。
* `-jdk-home=<path>`：JDK 主目錄。在處理器解析 Java 符號且需要存取 Java 標準程式庫時使用。
* `-friends=<path>`：目前模組的好友模組（friend modules）的 classpath。若要了解更多資訊，請參閱 Kotlin Gradle 外掛程式 API 參考中的 [`friendPaths` 屬性](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.tasks/-base-kotlin-compile/friend-paths.html)。

> 你也可以使用 `-Dksp.logging` JVM 系統屬性來設定記錄層級。有效值為 `error`、`warn`（或 `warning`）、`info` 和 `debug`。任何其他值都會被視為 `warn`。預設值為 `warn`。
>
{style="note"}

## 另請參閱 {id="see-also"}

* 了解[增量處理](ksp-incremental.md)的運作方式以及如何從命令列對其進行偵錯。
* 了解如何搭配 Gradle [在 Kotlin Multiplatform 專案中使用 KSP](ksp-multiplatform.md)。