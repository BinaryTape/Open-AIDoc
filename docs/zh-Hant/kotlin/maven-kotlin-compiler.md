[//]: # (title: 為你的 Maven 專案設定 Kotlin 編譯器)

`kotlin-maven-plugin` 允許你為 Maven 專案設定 Kotlin 編譯器。
你可以指定編譯器選項、選擇執行策略，並啟用增量編譯。

## 指定編譯器選項 {id="specify-compiler-options"}

你可以在 Kotlin Maven 外掛程式節點的 `<configuration>` 區段中，將編譯器的其他選項與引數指定為元素：

```xml
<plugin>
    <groupId>org.jetbrains.kotlin</groupId>
    <artifactId>kotlin-maven-plugin</artifactId>
    <version>${kotlin.version}</version>
    <extensions>true</extensions> <!-- 如果你想在組建中啟用自動新增 executions -->
    <executions>...</executions>
    <configuration>
        <nowarn>true</nowarn> <!-- 停用警告 -->
        <args>
            <arg>-Xjsr305=strict</arg> <!-- 為 JSR-305 註解啟用嚴格模式 -->
            ...
        </args>
    </configuration>
</plugin>
```

許多選項也可以透過屬性進行設定：

```xml
<project>
    <properties>
        <kotlin.compiler.languageVersion>%languageVersion%</kotlin.compiler.languageVersion>
    </properties>
</project>
```

支援以下屬性：

### JVM 專屬屬性 {id="attributes-specific-to-jvm"}

| 名稱 | 屬性名稱 | 說明 | 可能的值 | 預設值 |
|-------------------|-----------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------|-----------------------------|
| `nowarn`          |                                   | 不產生警告                                                                                                                                                                                               | true, false                                                              | false                       |
| `languageVersion` | `kotlin.compiler.languageVersion` | 提供與指定 Kotlin 版本的原始碼相容性                                                                                                                                                                     | "2.0", "2.1", "2.2", "2.3", "2.4", "2.5" (EXPERIMENTAL)                  |                             |
| `apiVersion`      | `kotlin.compiler.apiVersion`      | 僅允許使用來自指定版本配套程式庫的宣告                                                                                                                                                                   | "2.0", "2.1", "2.2", "2.3", "2.4", "2.5" (EXPERIMENTAL)                  |                             |
| `sourceDirs`      |                                   | 包含要編譯之原始碼檔案的目錄                                                                                                                                                                             |                                                                          | 專案原始碼根目錄             |
| `compilerPlugins` |                                   | 已啟用的編譯器外掛程式                                                                                                                                                                                   |                                                                          | []                          |
| `pluginOptions`   |                                   | 編譯器外掛程式的選項                                                                                                                                                                                     |                                                                          | []                          |
| `args`            |                                   | 其他編譯器引數                                                                                                                                                                                           |                                                                          | []                          |
| `jvmTarget`       | `kotlin.compiler.jvmTarget`       | 產生的位元組碼的目標 JVM 版本。僅控制輸出的位元組碼版本，並不限制你的程式碼可以使用哪些 JDK API。                                                                                                        | "1.8", "9", "10", ..., "26"                                              | "%defaultJvmTargetVersion%" |
| `jdkRelease`      | `kotlin.compiler.jdkRelease`      | 目標 JVM 版本。控制位元組碼版本，並將可用的 API 限制為指定的 JDK 版本，防止意外使用較新的 API。相當於 Java 的 `--release` 編譯器選項。                                                                 | "1.8", "9", "10", ..., "26"                                              |                             |
| `jdkHome`         | `kotlin.compiler.jdkHome`         | 將來自指定位置的自訂 JDK 納入類別路徑（classpath），而非預設的 `JAVA_HOME`                                                                                                                               |                                                                          |                             |
| `jdkToolchain`    | `kotlin.compiler.jdkToolchain`    | 設定從工具鏈中使用的 JDK 版本。僅影響 Kotlin 編譯                                                                                                                                                        |                                                                          |                             |
| `-Xadd-modules`   |                                   | （實驗性）除初始模組外，解析指定的根模組。將值設為 `ALL-MODULE-PATH` 以解析模組路徑上的所有模組。                                                                                                         | 以逗號分隔的模組名稱，或透過 `<arg>` 傳遞的 `ALL-MODULE-PATH`             |                             |

請注意 JVM 專用選項之間是如何相互影響的：

* 如果你未明確設定 `jvmTarget`，Kotlin Maven 外掛程式將使用 `jdkRelease` 的值；若 `jdkRelease` 也未設定，則使用預設的 `%defaultJvmTargetVersion%` 版本。
* 編譯器使用的 JDK 由 `jdkHome` 選項定義。如果你未明確設定 `jdkHome`，Kotlin Maven 外掛程式會將工具鏈的 JDK 作為 `jdkHome` 傳遞給編譯器。你可以在 `maven-toolchains-plugin` 或 `jdkToolchain` 選項中指定[工具鏈的 JDK](maven-configure-project.md#set-jdk-version)。明確的 `jdkHome` 值一律優先於工具鏈。
* `jdkHome` 選項與工具鏈均不會影響 `jvmTarget` 選項。

## 選擇執行策略 {id="choose-execution-strategy"}

<snippet id="maven-configure-execution-strategy">

預設情況下，Maven 使用 Kotlin daemon 編譯器執行策略。若要切換到「in process」策略，請在你的 `pom.xml` 檔案中設定以下屬性：

```xml
<properties>
    <kotlin.compiler.daemon>false</kotlin.compiler.daemon>
</properties>
```

</snippet>

關於不同策略的詳細資訊，請參閱[編譯器執行策略](compiler-execution-strategy.md)。

## 啟用增量編譯 {id="enable-incremental-compilation"}

若要加快組建速度，你可以透過新增 `kotlin.compiler.incremental` 屬性來啟用增量編譯：

```xml
<properties>
    <kotlin.compiler.incremental>true</kotlin.compiler.incremental>
</properties>
```

或者，也可以使用 `-Dkotlin.compiler.incremental=true` 選項來執行組建。

## 探索可用的 goal 與參數 {id="explore-available-goals-and-parameters"}

在你的 IDE 中，你可以從 `pom.xml` 檔案中的 Kotlin Maven 外掛程式宣告跳轉到產生的外掛程式描述項，其中包含有關可用 goal 及其參數的資訊。

你也可以在命令列中使用標準的 Maven Help 外掛程式來獲取這些資訊。
在包含專案 `pom.xml` 檔案的目錄中，執行：

```bash
mvn help:describe \
  -Dplugin=org.jetbrains.kotlin:kotlin-maven-plugin \
  -Ddetail=true
```

輸出將列出每個可用的 goal 及其參數的詳細資訊。

若要獲取特定 goal 的說明，請加入 `-Dgoal` 選項。例如，對於 `compile` goal，請執行：

```bash
mvn help:describe \
  -Dplugin=org.jetbrains.kotlin:kotlin-maven-plugin \
  -Ddetail=true \
  -Dgoal=compile
```

## 下一步 {id="what-s-next"}

[封裝你的專案](maven-compile-package.md)