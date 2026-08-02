[//]: # (title: 從命令列執行 KSP)

大多數專案透過 Gradle 外掛程式使用 KSP，它會在編譯期間自動執行 KSP。您可以從命令列使用 KSP，但通常僅在與其他建置系統整合、開發處理器、測試或偵錯時才使用。

由於 KSP 是一個 JVM 應用程式，請使用 `java` 指令從命令列啟動 KSP。提供 classpath 和任何必要的引數：

```bash
java -cp <classpath> <mainclass> <options> <processor>
```

| 引數            | 說明                                           |
|---------------|----------------------------------------------|
| `<classpath>` | KSP 執行時 JAR 檔案及其相依性的路徑。                      |
| `<mainclass>` | 其中一個平台特定的 KSP 入口點。                            |
| `<options>`   | KSP 的命令列選項。                                   |
| `<processor>` | 處理器 JAR 檔案的路徑。                              |

## Classpath

與 Gradle 外掛程式不同，`java` 指令不會自動解析相依性。您必須在 classpath 中提供 KSP 執行時 JAR 檔案及其相依性。

從 [KSP 發佈頁面](https://github.com/google/ksp/releases/tag/%kspVersion%) 下載 `artifacts.zip`。該壓縮檔包含所需的 KSP JAR 檔案：

* `symbol-processing-aa-%kspVersion%.jar`

* `symbol-processing-common-deps-%kspVersion%.jar`

* `symbol-processing-api-%kspVersion%.jar`

您還必須包含來自 Maven 儲存庫的以下執行時相依性：

* [`kotlin-stdlib-%kotlinVersion%.jar`](https://mvnrepository.com/artifact/org.jetbrains.kotlin/kotlin-stdlib)

* [`kotlinx-coroutines-core-jvm-%coroutinesVersion%.jar`](https://mvnrepository.com/artifact/org.jetbrains.kotlinx/kotlinx-coroutines-core-jvm)

## Main class

因為 KSP 是 JVM 應用程式，所以您必須指定要啟動的 main class。KSP 為每個受支援的平台提供不同的入口點：

| 入口點             | 平台                                                             |
|-----------------|----------------------------------------------------------------|
| `KSPJvmMain`    | Kotlin/JVM 與 Android                                           |
| `KSPJsMain`     | Kotlin/JS                                                      |
| `KSPNativeMain` | Kotlin/Native 目標，例如 iOS、macOS、Linux 與 Windows。                 |
| `KSPCommonMain` | Kotlin 多平台專案中的通用編譯。                                             |

使用 `java` 啟動 KSP 時，請指定完全限定類名。例如：

```bash
java -cp <classpath> com.google.devtools.ksp.cmdline.KSPJvmMain <options> <processor>
```

以下範例使用 `KSPJvmMain` 為 JVM 目標執行 KSP：

```bash
java -cp \
symbol-processing-aa-%kspVersion%.jar:symbol-processing-common-deps-%kspVersion%.jar:symbol-processing-api-%kspVersion%.jar:kotlin-stdlib-2.3.20.jar:kotlinx-coroutines-core-jvm-1.10.2.jar \
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

## 選項

從命令列執行時，KSP 需要以下選項：

| 選項                            | 說明                                                                                                                              |
|-------------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| `-language-version=<version>` | 專案中使用的 [Kotlin 語言版本](https://kotlinlang.org/docs/compiler-reference.html#language-version-version)。                              |
| `-api-version=<version>`      | [Kotlin API 版本](https://kotlinlang.org/docs/compiler-reference.html#api-version-version)。                                       |
| `-jvm-target=<version>`       | 目標 JVM 版本。                                                                                                                       |
| `-module-name=<name>`         | 模組名稱。                                                                                                                           |
| `-source-roots=<paths>`       | 原始碼根目錄。若有多個目錄，請使用冒號分隔。                                                                                                          |
| `-project-base-dir=<path>`    | 專案根目錄。                                                                                                                          |
| `-output-base-dir=<path>`     | KSP 輸出的基準目錄。                                                                                                                    |
| `-caches-dir=<path>`          | KSP 快取的目錄。                                                                                                                       |
| `-java-output-dir=<path>`     | 產生的 Java 檔案目錄。                                                                                                                  |
| `-class-output-dir=<path>`    | 產生的 class 檔案目錄。                                                                                                                 |
| `-kotlin-output-dir=<path>`   | 產生的 Kotlin 檔案目錄。                                                                                                                |
| `-resource-output-dir=<path>` | 產生的資源目錄。                                                                                                                        |
| `<processor>`                 | 處理器 classpath。                                                                                                                   |

### 其他有用選項

* `-libraries=<path>`：用於解析原始碼檔案所引用之相依性的 classpath。通常是模組的編譯 classpath。

* `-jdk-home=<path>`：JDK 首頁目錄。當處理器解析 Java 符號並需要存取 Java 標準程式庫時使用。

* `-friends=<path>`：目前模組之 friend 模組的 classpath。這通常是模組的 friend classpath。若要了解更多資訊，請參閱 [Friend 模組](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.tasks/-base-kotlin-compile/friend-paths.html)。

> KSP 還支援 `-Dksp.logging` JVM 系統屬性，用於設定記錄層級。有效值為 `error`、`warn` 或 `warning`、`info` 及 `debug`。預設值為 `warn`。KSP 將不支援的值視為 `warn`。
>
{style="tip"}

若要查看選項的完整清單，請執行以下指令：

```bash
java -cp <classpath> <mainclass> -h