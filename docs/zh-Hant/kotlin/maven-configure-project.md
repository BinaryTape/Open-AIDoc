[//]: # (title: 設定 Maven 專案)

當你將 Kotlin 引進現有的 Java Maven 專案，或是建立新的 Kotlin Maven 專案時，需要新增用於編譯 Kotlin 原始碼與模組的 Kotlin Maven 外掛程式。

目前僅支援 Maven v3。

> 如果你打算將專案遷移至 Maven 4，請使用 [`mvnup`](https://maven.apache.org/tools/mvnup.html) Maven 升級工具來自動遷移你的建置。若要深入了解遷移作業，請參閱 [Starting with Maven 4](https://maven.apache.org/guides/mini/guide-migration-to-mvn4.html) 指南。
>
{style="note"}

## 自動配置 {id="automatic-configuration"}

無論是在 Java 與 Kotlin 混合專案還是純 Kotlin 專案中，你都可以使用 `<extensions>` 選項來簡化 Maven 配置。這種方法可以為你節省時間，因為你不需要配置 Maven compiler 外掛程式。

若要套用帶有 `<extensions>` 的 Kotlin Maven 外掛程式，請依照以下方式更新你的 `pom.xml` 組建檔案：

1. 在 `<properties>` 區段中，定義 Kotlin 和 JVM 的目標版本：

   ```xml
   <properties>
       <maven.compiler.release>17</maven.compiler.release>
       <kotlin.version>%kotlinVersion%</kotlin.version>
   </properties>
   ```

2. 在 `<build><plugins>` 區段中，新增啟用了 `<extensions>` 選項的 Kotlin Maven 外掛程式：

   ```xml
   <build>
       <plugins>
           <!-- Kotlin 編譯器外掛程式配置 -->
           <plugin>
               <groupId>org.jetbrains.kotlin</groupId>
               <artifactId>kotlin-maven-plugin</artifactId>
               <version>${kotlin.version}</version>
               <extensions>true</extensions> <!-- 啟用擴充功能 -->
           </plugin>
           <!-- 使用 extensions 時無需配置 Maven compiler 外掛程式 -->
       </plugins>
   </build>
   ```

`<extensions>` 選項會：

* 若 `src/main/kotlin` 和 `src/test/kotlin` 目錄已經存在但未在外掛程式配置中指定，則將其註冊為原始碼根目錄。
* 若專案中尚未定義，則新增 [`kotlin-stdlib` 相依性](maven-set-dependencies.md#dependency-on-the-standard-library)。
* 將 `compile`、`test-compile`、`kapt` 及 `test-kapt` 執行項目新增至你的建置中，並繫結至其適當的[生命週期階段](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)。
  因此，你不需要手動設定帶有 `<id>` 和 `<goals>` 的 `<executions>` 區段來配置 `kapt`、Kotlin 的 `compile` 以及 Java 的 `compile` 執行項目，以確保它們依正確順序執行。
* [自動將 JVM 目標版本與專案中配置的 Java 編譯器版本對齊。](#jvm-target-version)
   
如果你有 Java 和 Kotlin 混合專案，此配置可確保：

* Kotlin 程式碼優先編譯。
* Java 程式碼在 Kotlin 之後編譯，並且可以參照 Kotlin 類別。
* 預設的 Maven 行為不會覆寫外掛程式的順序。

擴充功能配置會取代整個 `<executions>` 區段。如果你需要自訂執行項目，請參閱[編譯 Kotlin 與 Java 原始碼](#compile-kotlin-and-java-sources)中的範例。

> 如果有多個組建外掛程式覆寫了預設生命週期，且你同時啟用了 `<extensions>` 選項，則 `<build>` 區段中的最後一個外掛程式在生命週期設定上擁有最高優先順序。先前對生命週期設定的所有變更都將被忽略。
>
{style="note"}

<anchor name="maven-compiler-extensions-version"/>

目前，搭配 `<extensions>` 使用的 Maven compiler 外掛程式預設版本為 **%mavenExtensionsVersion%**。
你可以單獨設定不同的版本：

```xml
<build>
    <plugins>
        <!-- Kotlin 編譯器外掛程式配置 -->
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <version>${kotlin.version}</version>
            <extensions>true</extensions>
        </plugin>
        <!-- 用於 Java 類別的 Maven compiler 外掛程式配置 -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>%mavenPluginVersion%</version>
        </plugin>
    </plugins>
</build>
```

### JVM 目標版本 {id="jvm-target-version"}

`<extensions>` 選項可確保 Kotlin 和 Maven 編譯器以相同的位元組碼版本為目標。

Kotlin Maven 外掛程式會依照以下順序自動解析 JVM 目標版本：

```mermaid
graph TD
    A["<b>優先順序 1</b><br/>kotlin.compiler.jdkRelease</br>或 kotlin.compiler.jvmTarget"]
    B["<b>優先順序 2</b><br/>maven.compiler.release"]
    C["<b>優先順序 3</b><br/>maven.compiler.target"]

    A --> B
    B --> C
```

#### Kotlin 編譯器版本 {id="kotlin-compiler-versions"}

若專案中定義了 `kotlin.compiler.jdkRelease` 或 `kotlin.compiler.jvmTarget` 屬性，則以其中設定的版本優先。

請記住，這些 Kotlin 編譯器選項的行為有所不同：

| Kotlin 編譯器選項 | 控制輸出位元組碼版本 | 將 API 限制在指定的 JDK |
|------------------------------|-----------------------------------------|-----------------------------------------------------------------------------------------------|
| `kotlin.compiler.jvmTarget`  | 是 | 程式碼中的 JDK API 無限制 |
| `kotlin.compiler.jdkRelease` | 是 | 是 − 僅允許特定 API 版本（相當於 Java 的 `--release` 編譯器選項） |

> 請勿同時為 `kotlin.compiler.jdkRelease` 與 `kotlin.compiler.jvmTarget` 設定不同的 JDK 選項。
> 否則將會產生錯誤。
>
{style="note"}

#### Maven 編譯器版本 {id="maven-compiler-versions"}

* 若未設定 `kotlin.compiler.jdkRelease` 或 `kotlin.compiler.jvmTarget` 選項，外掛程式將採用 `maven.compiler.release` 版本。

  `maven.compiler.release` 版本可以定義為專案屬性，也可以在 `maven-compiler-plugin` 配置中定義。
* 若未設定 Maven release 版本，外掛程式將採用 `maven.compiler.target` 版本。

  它可以定義為專案屬性，也可以在 `maven-compiler-plugin` 配置中定義。

請記住，Maven 編譯器的 `target` 與 `release` 選項行為有所不同：

| Maven 編譯器選項 | 設定 Kotlin 的 `jvmTarget` | 設定 Kotlin 的 `jdkRelease` | 將 API 限制在指定的 JDK |
|--------------------------|---------------------------|----------------------------|----------------------------------------------|
| `maven.compiler.target`  | 是 | 否 | 否 − 建置的 JDK classpath 保持可見 |
| `maven.compiler.release` | 是 | 是 | 是 − 僅限特定的 API 版本 |

> `<extensions>` 選項僅檢查專案層級的屬性以及全域 `maven-compiler-plugin` 配置。
> 它不會檢查外掛程式 `<executions>` 區段中定義的配置。
>
{style="note"}

## 手動配置 {id="manual-configuration"}

若未在 Kotlin Maven 外掛程式中啟用 `<extensions>`，你需要手動配置專案以確保原始碼能夠正確編譯。

你可以設定 Maven 專案來編譯 [Java 與 Kotlin 混合原始碼](#compile-kotlin-and-java-sources)或[純 Kotlin 原始碼](#compile-kotlin-only-sources)。

### 編譯 Kotlin 與 Java 原始碼 {id="compile-kotlin-and-java-sources"}

若要編譯同時包含 Kotlin 與 Java 原始碼檔案的專案，請確保 Kotlin 編譯器在 Java 編譯器之前執行。

在編譯為 `.class` 檔案之前，Java 編譯器無法看到 Kotlin 的宣告。
如果你的 Java 程式碼使用了 Kotlin 類別，則必須先編譯這些類別以避免出現 `cannot find symbol` 錯誤。

Maven 根據兩個主要因素來決定外掛程式的執行順序：

* 外掛程式在 `pom.xml` 檔案中的宣告順序。
* 內建的預設執行項目（例如 `default-compile` 和 `default-testCompile`），無論其在 `pom.xml` 檔案中的位置為何，它們始終會在使用者定義的執行項目之前執行。

若要控制執行順序：

* 在 `maven-compiler-plugin` 之前宣告 `kotlin-maven-plugin`。
* 停用 Java compiler 外掛程式的預設執行項目。
* 新增自訂執行項目以明確控制編譯階段。

> 你可以使用 Maven 中特殊的 `none` 階段來停用預設執行項目。
>
{style="note"}

若要套用 Kotlin Maven 外掛程式，請依照以下方式更新你的 `pom.xml` 組建檔案：

```xml
<build>
    <plugins>
        <!-- Kotlin 編譯器外掛程式配置 -->
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <version>${kotlin.version}</version>
            <executions>
                <execution>
                    <id>kotlin-compile</id>
                    <phase>compile</phase>
                    <goals>
                        <goal>compile</goal>
                    </goals>
                    <configuration>
                        <sourceDirs>
                            <sourceDir>${project.basedir}/src/main/kotlin</sourceDir>
                            <!-- 確保 Kotlin 程式碼可以參照 Java 程式碼 -->
                            <sourceDir>${project.basedir}/src/main/java</sourceDir>
                        </sourceDirs>
                    </configuration>
                </execution>
                <execution>
                    <id>kotlin-test-compile</id>
                    <phase>test-compile</phase>
                    <goals>
                        <goal>test-compile</goal>
                    </goals>
                    <configuration>
                        <sourceDirs>
                            <sourceDir>${project.basedir}/src/test/kotlin</sourceDir>
                            <sourceDir>${project.basedir}/src/test/java</sourceDir>
                        </sourceDirs>
                    </configuration>
                </execution>
            </executions>
        </plugin>

        <!-- Maven 編譯器外掛程式配置 -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.15.0</version>
            <executions>
                <!-- 停用預設執行項目 -->
                <execution>
                    <id>default-compile</id>
                    <phase>none</phase>
                </execution>
                <execution>
                    <id>default-testCompile</id>
                    <phase>none</phase>
                </execution>

                <!-- 定義自訂執行項目 -->
                <execution>
                    <id>java-compile</id>
                    <phase>compile</phase>
                    <goals>
                        <goal>compile</goal>
                    </goals>
                </execution>
                <execution>
                    <id>java-test-compile</id>
                    <phase>test-compile</phase>
                    <goals>
                        <goal>testCompile</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

此配置可確保：

* Kotlin 程式碼優先編譯。
* Java 程式碼在 Kotlin 之後編譯，並且可以參照 Kotlin 類別。
* 預設的 Maven 行為不會覆寫外掛程式的順序。

關於 Maven 如何處理外掛程式執行的詳細資訊，請參閱 Maven 官方文件中的 [Guide to default plugin execution IDs](https://maven.apache.org/guides/mini/guide-default-execution-ids.html)。

### 編譯純 Kotlin 原始碼 {id="compile-kotlin-only-sources"}

若要編譯僅包含 Kotlin 原始碼檔案的專案，請宣告原始碼根目錄並配置 Kotlin Maven 外掛程式：

1. 在 `<build>` 區段中指定原始碼目錄：

    ```xml
    <build>
        <sourceDirectory>src/main/kotlin</sourceDirectory>
        <testSourceDirectory>src/test/kotlin</testSourceDirectory>
    </build>
    ```

2. 確保已套用 Kotlin Maven 外掛程式：

    ```xml
    <build>
        <plugins>
            <plugin>
                <groupId>org.jetbrains.kotlin</groupId>
                <artifactId>kotlin-maven-plugin</artifactId>
                <version>${kotlin.version}</version>
                <executions>
                    <execution>
                        <id>compile</id>
                        <goals>
                            <goal>compile</goal>
                        </goals>
                    </execution>
                    <execution>
                        <id>test-compile</id>
                        <goals>
                            <goal>test-compile</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
    ```

### 設定 JDK 版本 {id="set-jdk-version"}

Kotlin 支援 [Maven Toolchains](https://maven.apache.org/guides/mini/guide-using-toolchains.html)，有助於你管理建置中的 JDK 版本。

如果你在建置中配置了 `maven-toolchains-plugin`，則可以指定用於 Kotlin 編譯的 JDK 版本，該版本獨立於執行 Maven 的 JVM 版本（於 `JAVA_HOME` 路徑中設定）。接著 Kotlin Maven 外掛程式會自動採用所選取的 JDK 工具鏈。

這使你可以配置單一工具鏈，藉此控制組建中所有外掛程式（包含 Kotlin 編譯）所使用的 JDK。例如：

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-toolchains-plugin</artifactId>
    <version>3.2.0</version>
    <executions>
        <execution>
            <goals>
                <goal>toolchain</goal>
            </goals>
        </execution>
    </executions>
    <configuration>
        <toolchains>
            <jdk>
                <version>21</version>
            </jdk>
        </toolchains>
    </configuration>
</plugin>
```

請留意設定 JDK 版本之不同方式的優先順序：

```Mermaid
graph TD
    A["<b>優先順序 1</b><br/>kotlin-maven-plugin 的 jdkHome 選項"]
    B["<b>優先順序 2</b><br/>maven-toolchains-plugin 中<br/>設定的 JDK 版本"]
    C["<b>優先順序 3</b><br/>JAVA_HOME 版本"]

    A --> B
    B --> C
```

* 在 `kotlin-maven-plugin` 配置的 `jdkHome` 選項中所設定的 JDK 版本，優先順序始終高於工具鏈版本。
* `maven-toolchains-plugin` 中的 JDK 版本會覆寫在 `JAVA_HOME` 路徑中設定的 JDK 版本。

你也可以使用外掛程式專屬的 `<jdkToolchain>` 選項，直接在 `kotlin-maven-plugin` 的工具鏈中設定 JDK 版本。與使用 `maven-toolchains-plugin` 相比，此參數僅影響 Kotlin 編譯，對建置中的其他外掛程式沒有任何影響。

> 目前，將 `maven-toolchains-plugin` 設定為使用特定 JDK 版本[不會影響 `kotlin-maven-plugin` 的 `kapt` 和 `test-kapt` goals](https://youtrack.jetbrains.com/issue/KT-79897)。此時請改為在 `JAVA_HOME` 路徑中設定所需的版本。
>
{style="note"}

## 配置 Java 模組 (JPMS) {id="configure-java-modules-jpms"}

Kotlin Maven 外掛程式支援 [Java 平台模組系統 (JPMS)](https://dev.java/learn/modules/)，因此你可以將 Kotlin 程式碼與 `module-info.java` 描述元一起編譯，並像其他 Java 模組一樣使用產生的模組。

你不需要在組建檔案中設定任何額外的 JPMS 專屬選項。
只需將 Kotlin 編譯器配置在 Maven 之前執行即可。

當存在 `module-info.java` 描述元時，Kotlin 編譯器會將其作為來源檔案，並針對其模組路徑而非類別路徑進行編譯。Kotlin 編譯器會讀取描述元以解析模組圖，隨後 Maven 編譯器會將其編譯為 `module-info.class` 檔案。

若要配置 Java 模組，請在 `${project.basedir}/src/main/java` 目錄中建立 `module-info.java` 檔案。
在模組描述元中，宣告模組所需的所有相依性以及其匯出的套件。例如：

```java
module org.example.myapp {
    requires transitive kotlin.stdlib;
    requires java.net.http;
    
    exports org.example.myapp;
}
```

請記住：

* 你的 Java 模組只能使用你宣告的內容。由於編譯使用的是模組路徑而非類別路徑，因此描述元應包含 Kotlin 程式碼所使用的所有相依項：標準函式庫、JDK 模組（`java.base` 除外）以及其他程式庫。否則可能會遇到 `Unresolved reference` 錯誤。
* 對於模組，Kotlin 檔案中的套件名稱必須與 `module-info.java` 中的套件名稱相符，以避免出現 `Package is empty or does not exist` 建置失敗。
* `pom.xml` 組建檔案應配置為[在編譯 Java 之前先編譯 Kotlin](#compile-kotlin-and-java-sources)。如果你使用[自動專案配置](#automatic-configuration)，`<extensions>` 選項已經確保了這一點。 

## 下一步 {id="what-s-next"}

[在你的 Kotlin Maven 專案中設定相依性](maven-set-dependencies.md)