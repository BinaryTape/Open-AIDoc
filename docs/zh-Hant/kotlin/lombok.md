[//]: # (title: Lombok 編譯器外掛程式)
<primary-label ref="alpha"/>

Kotlin Lombok 編譯器外掛程式允許在同一個 Java/Kotlin 混合模組中，讓 Kotlin 程式碼產生並使用 Java 的 Lombok 宣告。
如果您從另一個模組呼叫這些宣告，則不需要在該模組的編譯過程中使用此外掛程式。

Lombok 編譯器外掛程式無法取代 [Lombok](https://projectlombok.org/)，但它能幫助 Lombok 在 Java/Kotlin 混合模組中運作。
因此，使用此外掛程式時，您仍需照常配置 Lombok。
進一步了解[如何配置 Lombok 編譯器外掛程式](#using-the-lombok-configuration-file)。

## 支援的註解 {id="supported-annotations"}

此外掛程式支援以下註解：
* `@Getter`, `@Setter`
* `@Builder`, `@SuperBuilder`
* `@NoArgsConstructor`, `@RequiredArgsConstructor`, 以及 `@AllArgsConstructor`
* `@Data`
* `@With`
* `@Value`

我們正持續開發此外掛程式。若要了解詳細的目前狀態，請造訪 [Lombok 編譯器外掛程式的 README](https://github.com/JetBrains/kotlin/tree/master/plugins/lombok)。

目前我們沒有支援 `@Tolerate` 註解的計畫。然而，如果您在 YouTrack 中為 [@Tolerate 問題](https://youtrack.jetbrains.com/issue/KT-53564/Kotlin-Lombok-Support-Tolerate)投票，我們可以考慮。

> 如果您在 Kotlin 程式碼中使用 Lombok 註解，Kotlin 編譯器會忽略它們。
>
{style="note"}

## Gradle {id="gradle"}

在 `build.gradle(.kts)` 檔案中套用 `kotlin-plugin-lombok` Gradle 外掛程式：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("plugin.lombok") version "%kotlinVersion%"
    id("io.freefair.lombok") version "%lombokVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.kotlin.plugin.lombok' version '%kotlinVersion%'
    id 'io.freefair.lombok' version '%lombokVersion%'
}
```

</tab>
</tabs>

請參閱此[包含 Lombok 編譯器外掛程式使用範例的測試專案](https://github.com/kotlin-hands-on/kotlin-lombok-examples/tree/master/kotlin_lombok_gradle/nokapt)。

### 使用 Lombok 配置檔案 {id="using-the-lombok-configuration-file"}

如果您使用 [Lombok 配置檔案](https://projectlombok.org/features/configuration) `lombok.config`，則需要設定檔案路徑，以便外掛程式能找到它。
路徑必須相對於模組目錄。
例如，將以下程式碼新增至您的 `build.gradle(.kts)` 檔案中：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlinLombok {
    lombokConfigurationFile(file("lombok.config"))
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlinLombok {
    lombokConfigurationFile file("lombok.config")
}
```

</tab>
</tabs>

請參閱此[包含 Lombok 編譯器外掛程式與 `lombok.config` 使用範例的測試專案](https://github.com/kotlin-hands-on/kotlin-lombok-examples/tree/master/kotlin_lombok_gradle/withconfig)。

## Maven {id="maven"}

若要使用 Lombok 編譯器外掛程式，請將 `lombok` 外掛程式新增至 `compilerPlugins` 區段，並將 `kotlin-maven-lombok` 相依性新增至 `dependencies` 區段。
如果您使用 [Lombok 配置檔案](https://projectlombok.org/features/configuration) `lombok.config`，請在 `pluginOptions` 中為外掛程式提供其路徑。將以下行新增至 `pom.xml` 檔案：

```xml
<plugin>
    <groupId>org.jetbrains.kotlin</groupId>
    <artifactId>kotlin-maven-plugin</artifactId>
    <version>${kotlin.version}</version>
    <configuration>
        <compilerPlugins>
            <plugin>lombok</plugin>
        </compilerPlugins>
        <pluginOptions>
            <option>lombok:config=${project.basedir}/lombok.config</option>
        </pluginOptions>
    </configuration>
    <dependencies>
        <dependency>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-lombok</artifactId>
            <version>${kotlin.version}</version>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.20</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>
</plugin>
```

請參閱此[包含 Lombok 編譯器外掛程式與 `lombok.config` 使用範例的測試專案範例](https://github.com/kotlin-hands-on/kotlin-lombok-examples/tree/master/kotlin_lombok_maven/nokapt)。

## 與 kapt 搭配使用 {id="using-with-kapt"}

預設情況下，[kapt](kapt.md) 編譯器外掛程式會執行所有註解處理器，並停用 javac 的註解處理功能。
若要讓 [Lombok](https://projectlombok.org/) 與 kapt 一起執行，請設定 kapt 以保持 javac 的註解處理器正常運作。

如果您使用 Gradle，請將此選項新增至 `build.gradle(.kts)` 檔案中：

```groovy
kapt {
    keepJavacAnnotationProcessors = true
}
```

在 Maven 中，使用以下設定搭配 Java 編譯器啟動 Lombok：

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.5.1</version>
    <configuration>
        <source>1.8</source>
        <target>1.8</target>
        <annotationProcessorPaths>
            <annotationProcessorPath>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
                <version>${lombok.version}</version>
            </annotationProcessorPath>
        </annotationProcessorPaths>
    </configuration>
</plugin>    
```

如果註解處理器不依賴 Lombok 產生的程式碼，Lombok 編譯器外掛程式即可與 [kapt](kapt.md) 正常運作。

查看 kapt 與 Lombok 編譯器外掛程式搭配使用的測試專案範例：
* 使用 [Gradle](https://github.com/JetBrains/kotlin/tree/master/libraries/tools/kotlin-gradle-plugin-integration-tests/src/test/resources/testProject/lombokProject/yeskapt)。
* 使用 [Maven](https://github.com/kotlin-hands-on/kotlin-lombok-examples/tree/master/kotlin_lombok_maven/yeskapt)

## 命令列編譯器 {id="command-line-compiler"}

Lombok 編譯器外掛程式的 JAR 檔可在 Kotlin 編譯器的二進位發行版本中取得。您可以透過 `kotlinc` 的 `Xplugin` 選項提供其 JAR 檔案路徑來附加此外掛程式：

```bash
-Xplugin=$KOTLIN_HOME/lib/lombok-compiler-plugin.jar
```

如果您想使用 `lombok.config` 檔案，請將 `<PATH_TO_CONFIG_FILE>` 取代為您的 `lombok.config` 路徑：

```bash
# 外掛程式選項格式為："-P plugin:<plugin id>:<key>=<value>"。
# 選項可以重複。

-P plugin:org.jetbrains.kotlin.lombok:config=<PATH_TO_CONFIG_FILE>
```
