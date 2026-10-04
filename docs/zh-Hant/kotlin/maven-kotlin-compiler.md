[//]: # (title: 為你的 Maven 專案配置 Kotlin 編譯器)

`kotlin-maven-plugin` 可讓你為 Maven 專案配置 Kotlin 編譯器。
你可以指定編譯器選項、選擇執行策略，並啟用增量編譯。

## 指定編譯器選項 {id="specify-compiler-options"}

你可以在 Kotlin Maven 外掛程式節點的 `<configuration>` 區段中，將編譯器的額外選項和引數指定為元素：

```xml
<plugin>
    <groupId>org.jetbrains.kotlin</groupId>
    <artifactId>kotlin-maven-plugin</artifactId>
    <version>${kotlin.version}</version>
    <extensions>true</extensions> <!-- 若你想啟用自動向組建新增 execution -->
    <executions>...</executions>
    <configuration>
        <nowarn>true</nowarn> <!-- 停用警告 -->
        <args>
            <arg>-Xjsr305=strict</arg> <!-- 啟用 JSR-305 註解的嚴格模式 -->
            ...
        </args>
    </configuration>
</plugin>
```

許多選項也可以透過屬性進行配置：

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
|---|---|---|---|---|
| `nowarn` | | 不產生任何警告 | true, false | false |
| `languageVersion` | `kotlin.compiler.languageVersion` | 提供與指定 Kotlin 版本的原始碼相容性 | "2.0", "2.1", "2.2", "2.3", "2.4", "2.5" (EXPERIMENTAL) | |
| `apiVersion` | `kotlin.compiler.apiVersion` | 僅允許使用來自指定版本配套程式庫的宣告 | "2.0", "2.1", "2.2", "2.3", "2.4", "2.5" (EXPERIMENTAL) | |
| `sourceDirs` | | 包含要編譯之原始碼檔案的目錄 | | 專案原始碼根目錄 |
| `compilerPlugins` | | 已啟用的編譯器外掛程式 | | [] |
| `pluginOptions` | | 編譯器外掛程式的選項 | | [] |
| `args` | | 額外的編譯器引數 | | [] |
| `jvmTarget` | `kotlin.compiler.jvmTarget` | 產生的位元組碼的目標 JVM 版本。僅控制輸出的位元組碼版本，不會限制你的程式碼可使用的 JDK API。 | "1.8", "9", "10", ..., "26" | "%defaultJvmTargetVersion%" |
| `jdkRelease` | `kotlin.compiler.jdkRelease` | 目標 JVM 版本。控制位元組碼版本並將可用 API 限制在指定的 JDK 版本，防止意外使用較新的 API。等同於 Java 的 `--release` 編譯器選項。 | "1.8", "9", "10", ..., "26" | |
| `jdkHome` | `kotlin.compiler.jdkHome` | 將指定位置的自訂 JDK 包含至 classpath 中，而非使用預設的 `JAVA_HOME` | | |
| `jdkToolchain` | `kotlin.compiler.jdkToolchain` | 設定從工具鏈中使用的 JDK 版本。僅影響 Kotlin 編譯 | | |
| `-Xadd-modules` | | (實驗性) 除初始模組外，解析指定的根模組。設定 `ALL-MODULE-PATH` 值以解析模組路徑上的所有模組。 | 透過 `<arg>` 傳遞的以逗號分隔的模組名稱或 `ALL-MODULE-PATH` | |

## 選擇執行策略 {id="choose-execution-strategy"}

<snippet id="maven-configure-execution-strategy">

預設情況下，Maven 使用 Kotlin daemon 編譯器執行策略。若要切換為「in process」（同處理程序內）策略，請在你的 `pom.xml` 檔案中設定以下屬性：

```xml
<properties>
    <kotlin.compiler.daemon>false</kotlin.compiler.daemon>
</properties>
```

</snippet>

若要了解更多關於不同策略的資訊，請參閱[編譯器執行策略](compiler-execution-strategy.md)。

## 啟用增量編譯 {id="enable-incremental-compilation"}

為了加快組建速度，你可以透過新增 `kotlin.compiler.incremental` 屬性來啟用增量編譯：

```xml
<properties>
    <kotlin.compiler.incremental>true</kotlin.compiler.incremental>
</properties>
```

或者，也可以使用 `-Dkotlin.compiler.incremental=true` 選項來執行組建。

## 後續步驟 {id="what-s-next"}

[打包你的專案](maven-compile-package.md)