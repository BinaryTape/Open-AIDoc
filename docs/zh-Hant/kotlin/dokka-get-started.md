[//]: # (title: 開始使用 Dokka)

以下提供簡單的說明，協助你開始使用 Dokka。

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

> 本指南適用於 Dokka Gradle 外掛程式（DGP）v2 模式。DGP v1 模式已不再受支援。
> 若要從 v1 升級至 v2 模式，請遵循[遷移指南](dokka-migration.md)。
>
{style="note"}

**套用 Gradle Dokka 外掛程式** 

在專案的根建置指令碼中套用 Dokka Gradle 外掛程式（DGP）：

```kotlin
plugins {
    id("org.jetbrains.dokka") version "%dokkaVersion%"
}
```

**為多專案建置產生文件**

當為[多專案建置](https://docs.gradle.org/current/userguide/multi_project_builds.html)產生文件時，你需要將外掛程式套用至每個想要產生文件的子專案。你可以使用以下其中一種方式在子專案之間共用 Dokka 設定：

* 慣例外掛程式 (Convention plugin)
* 若未使用慣例外掛程式，則在各個子專案中直接進行設定

若要了解更多關於在多專案建置中共用 Dokka 設定的資訊，請參閱[多專案設定](dokka-gradle.md#multi-project-configuration)。

**產生文件**

若要產生文件，請執行以下 Gradle 任務：

```bash
./gradlew :dokkaGenerate
```

此任務適用於單一專案與多專案建置。

在任務名稱前加上其專案路徑（`:`），即可從聚合專案中執行 `dokkaGenerate` 任務。例如：

```bash
./gradlew :dokkaGenerate

// 或

./gradlew :aggregatingProject:dokkaGenerate
```

請避免使用 `./gradlew dokkaGenerate` 來代替 `./gradlew :dokkaGenerate` 或 `./gradlew :aggregatingProject:dokkaGenerate`。若任務沒有前置專案路徑（`:`），Gradle 會嘗試在整個建置中執行所有的 `dokkaGenerate` 任務，這可能會觸發不必要的工作。

你可以使用不同的任務來產生 [HTML](dokka-html.md)、[Javadoc](dokka-javadoc.md) 或同時產生 [HTML 與 Javadoc](dokka-gradle.md#configure-documentation-output-format) 的輸出。

> 若要了解更多關於在 Gradle 中使用 Dokka 的資訊，請參閱 [Gradle](dokka-gradle.md)。
{style="tip"}

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

> 本指南適用於 Dokka Gradle 外掛程式（DGP）v2 模式。DGP v1 模式已不再受支援。
> 若要從 v1 升級至 v2 模式，請遵循[遷移指南](dokka-migration.md)。
>
{style="note"}

**套用 Gradle Dokka 外掛程式**

在專案的根建置指令碼中套用 Dokka Gradle 外掛程式（DGP）：

```groovy
plugins {
    id 'org.jetbrains.dokka' version '%dokkaVersion%'
}
```

**為多專案建置產生文件**

當為[多專案建置](https://docs.gradle.org/current/userguide/multi_project_builds.html)產生文件時，你需要將外掛程式套用至每個想要產生文件的子專案。你可以使用以下其中一種方式在子專案之間共用 Dokka 設定：

* 慣例外掛程式 (Convention plugin)
* 若未使用慣例外掛程式，則在各個子專案中直接進行設定

若要了解更多關於在多專案建置中共用 Dokka 設定的資訊，請參閱[多專案設定](dokka-gradle.md#multi-project-configuration)。

**產生文件**

若要產生文件，請執行以下 Gradle 任務：

```bash
./gradlew :dokkaGenerate
```

此任務適用於單一專案與多專案建置。

在任務名稱前加上其專案路徑（`:`），即可從聚合專案中執行 `dokkaGenerate` 任務。例如：

```bash
./gradlew :dokkaGenerate

// 或

./gradlew :aggregatingProject:dokkaGenerate
```

請避免使用 `./gradlew dokkaGenerate` 來代替 `./gradlew :dokkaGenerate` 或 `./gradlew :aggregatingProject:dokkaGenerate`。若任務沒有前置專案路徑（`:`），Gradle 會嘗試在整個建置中執行所有的 `dokkaGenerate` 任務，這可能會觸發不必要的工作。

你可以使用不同的任務來產生 [HTML](dokka-html.md)、[Javadoc](dokka-javadoc.md) 或同時產生 [HTML 與 Javadoc](dokka-gradle.md#configure-documentation-output-format) 的輸出。

> 若要了解更多關於在 Gradle 中使用 Dokka 的資訊，請參閱 [Gradle](dokka-gradle.md)。
{style="tip"}

</tab>
<tab title="Maven" group-key="mvn">

將 Dokka 的 Maven 外掛程式新增至 POM 檔案的 `plugins` 區段中：

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.dokka</groupId>
            <artifactId>dokka-maven-plugin</artifactId>
            <version>%dokkaVersion%</version>
            <executions>
                <execution>
                    <phase>pre-site</phase>
                    <goals>
                        <goal>dokka</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

若要產生文件，請執行 `dokka:dokka` goal。

預設情況下，輸出目錄會設定為 `target/dokka`。

若要了解更多關於在 Maven 中使用 Dokka 的資訊，請參閱 [Maven](dokka-maven.md)。

</tab>
</tabs>