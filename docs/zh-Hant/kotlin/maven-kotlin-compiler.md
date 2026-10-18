[//]: # (title: 為你的 Maven 專案設定 Kotlin 編譯器)

`kotlin-maven-plugin` 允許你為 Maven 專案設定 Kotlin 編譯器。
你可以指定編譯器選項、選擇執行策略，並啟用增量編譯。

## 指定編譯器選項 {id="specify-compiler-options"}

你可以在 Kotlin Maven 外掛程式節點的 `<configuration>` 區段中，以元素的形式為編譯器指定額外的選項和引數：

```xml
<plugin>
    <groupId>org.jetbrains.kotlin</groupId>
    <artifactId>kotlin-maven-plugin</artifactId>
    <version>${kotlin.version}</version>
    <extensions>true</extensions> <!-- 如果你想在建置中啟用自動新增 executions -->
    <executions>...</executions>
    <configuration>
        <nowarn>true</nowarn> <!-- 停用警告 -->
        <args>
            <arg>-Xjsr305=strict</arg> <!-- 為 JSR-305 註解啟用 strict 模式 -->
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

### JVM 專用屬性 {id="attributes-specific-to-jvm"}

| 名稱 | 屬性名稱 | 描述 | 可能的值 | 預設值 |
|---|---|---|---|---|
| `nowarn` | | 不產生警告 | true, false | false |
| `languageVersion` | `kotlin.compiler.languageVersion` | 提供與指定 Kotlin 版本的原始碼相容性 | "2.0", "2.1", "2.2", "2.3", "2.4", "2.5" (實驗功能) | |
| `apiVersion` | `kotlin.compiler.apiVersion` | 僅允許使用指定版本的搭售程式庫宣告 | "2.0", "2.1", "2.2", "2.3", "2.4", "2.5" (實驗功能) | |
| `sourceDirs` | | 包含要編譯之原始碼檔案的目錄 | | 專案原始碼根目錄 |
| `compilerPlugins` | | 已啟用的編譯器外掛程式 | | [] |
| `pluginOptions` | | 編譯器外掛程式的選項 | | [] |
| `args` | | 額外的編譯器引數 | | [] |
| `jvmTarget` | `kotlin.compiler.jvmTarget` | 產生位元組碼的目標 JVM 版本。僅控制輸出位元組碼版本，不會限制你的程式碼可使用哪些 JDK API。 | "1.8", "9", "10", ..., "26" | "%defaultJvmTargetVersion%" |
| `jdkRelease` | `kotlin.compiler.jdkRelease` | 目標 JVM 版本。控制位元組碼版本，並將可用的 API 限制在指定的 JDK 版本，防止意外使用較新的 API。等同於 Java 的 `--release` 編譯器選項。 | "1.8", "9", "10", ..., "26" | |
| `jdkHome` | `kotlin.compiler.jdkHome` | 從指定位置將自訂 JDK 包含至 classpath 中，以取代預設的 `JAVA_HOME` | | |
| `jdkToolchain` | `kotlin.compiler.jdkToolchain` | 設定從工具鏈中使用的 JDK 版本。僅影響 Kotlin 編譯 | | |
| `-Xadd-modules` | | （實驗性）除初始模組外，解析指定的根模組。設定 `ALL-MODULE-PATH` 值以解析模組路徑上的所有模組。 | 以逗號分隔的模組名稱，或透過 `<arg>` 傳遞的 `ALL-MODULE-PATH` | |

## 選擇執行策略 {id="choose-execution-strategy"}

<snippet id="maven-configure-execution-strategy">

預設情況下，Maven 使用 Kotlin daemon 編譯器執行策略。若要切換為「in process」策略，請在你的 `pom.xml` 檔案中設定以下屬性：

```xml
<properties>
    <kotlin.compiler.daemon>false</kotlin.compiler.daemon>
</properties>
```

</snippet>

有關不同策略的更多資訊，請參閱[編譯器執行策略](compiler-execution-strategy.md)。

## 啟用增量編譯 {id="enable-incremental-compilation"}

為了加速建置，你可以透過新增 `kotlin.compiler.incremental` 屬性來啟用增量編譯：

```xml
<properties>
    <kotlin.compiler.incremental>true</kotlin.compiler.incremental>
</properties>
```

或者，也可以在執行建置時帶入 `-Dkotlin.compiler.incremental=true` 選項。

## 探索可用的目標 (goals) 與參數 {id="explore-available-goals-and-parameters"}

在你的 IDE 中，你可以從 `pom.xml` 檔案中的 Kotlin Maven 外掛程式宣告跳轉到產生的外掛描述元，其中包含有關可用目標 (goals) 及其參數的資訊。

你也可以從命令列使用標準的 Maven Help 外掛程式來獲取這些資訊。
在包含專案 `pom.xml` 檔案的目錄中，執行：

```bash
mvn help:describe \
  -Dplugin=org.jetbrains.kotlin:kotlin-maven-plugin \
  -Ddetail=true
```

輸出將列出每個可用的目標，以及其參數的詳細資訊。

若要取得特定目標的說明，請新增 `-Dgoal` 選項。例如，對於 `compile` 目標，執行：

```bash
mvn help:describe \
  -Dplugin=org.jetbrains.kotlin:kotlin-maven-plugin \
  -Ddetail=true \
  -Dgoal=compile
```

## 後續步驟 {id="what-s-next"}

[封裝你的專案](maven-compile-package.md)