[//]: # (title: Gradle)

> 本指南適用於 Dokka Gradle 外掛程式 (DGP) v2 模式。之前的 DGP v1 模式已不再受支援。
> 如果您正從 v1 升級到 v2 模式，請參閱[遷移指南](dokka-migration.md)。
>
{style="note"}

若要為基於 Gradle 的專案產生文件，您可以使用 
[Dokka 的 Gradle 外掛程式](https://plugins.gradle.org/plugin/org.jetbrains.dokka)。

Dokka Gradle 外掛程式 (DGP) 附帶專案的基本自動組態，
包含用於產生文件的 [Gradle 任務](#產生文件)，並提供[組態選項](dokka-gradle-configuration-options.md)來
自訂輸出。

您可以在我們的 [Gradle 範例專案](https://github.com/Kotlin/dokka/tree/2.0.0/examples/gradle-v2)中
嘗試使用 Dokka 並探索如何為各種專案進行配置。

## 支援的版本 {id="supported-versions"}

確保您的專案符合最低版本需求：

| **工具**                                                                          | **版本**      |
|-----------------------------------------------------------------------------------|---------------|
| [Gradle](https://docs.gradle.org/current/userguide/upgrading_version_8.html)      | 7.6 或更高     |
| [Android Gradle 外掛程式](https://developer.android.com/build/agp-upgrade-assistant) | 7.0 或更高     |
| [Kotlin Gradle 外掛程式](https://kotlinlang.org/docs/gradle-configure-project.html) | 1.9 或更高     |

## 套用 Dokka {id="apply-dokka"}

套用 Dokka 的 Gradle 外掛程式的建議方式是使用 
[plugins 區塊](https://docs.gradle.org/current/userguide/plugins.html#sec:plugins_block)。
將其新增至專案 `build.gradle.kts` 檔案的 `plugins {}` 區塊中：

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
plugins {
    id("org.jetbrains.dokka") version "%dokkaVersion%"
}
```

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.dokka' version '%dokkaVersion%'
}
```

</tab>
</tabs>

在為多專案組建編寫文件時，您需要將外掛程式明確套用到每個想要編寫文件的子專案中。
您可以直接在每個子專案中配置 Dokka，或使用慣例外掛程式在子專案之間共用 Dokka 組態。
如需詳細資訊，請參閱 
如何配置[單一專案](#單一專案組態)和[多專案](#多專案組態)組建。

> * 在底層，
> Dokka 使用 [Kotlin Gradle 外掛程式](https://kotlinlang.org/docs/gradle-configure-project.html#apply-the-plugin) 
> 來自動配置為其產生文件的[原始碼集](https://kotlinlang.org/docs/multiplatform-discover-project.html#source-sets)。請確保套用 Kotlin Gradle 外掛程式或
> 手動[配置原始碼集](dokka-gradle-configuration-options.md#source-set-configuration)。
>
> * 如果您在[預先編譯的指令碼外掛程式](https://docs.gradle.org/current/userguide/custom_plugins.html#sec:precompiled_plugins)中使用 Dokka，
> 請將 [Kotlin Gradle 外掛程式](https://kotlinlang.org/docs/gradle-configure-project.html#apply-the-plugin) 
> 新增為相依性，以確保其正常運作。
>
{style="tip"}

## 啟用組建快取和組態快取 {id="enable-build-cache-and-configuration-cache"}

DGP 支援 Gradle 組建快取和組態快取，可提高組建效能。

* 若要啟用組建快取，請遵循 [Gradle 組建快取文件](https://docs.gradle.org/current/userguide/build_cache.html#sec:build_cache_enable)中的說明。
* 若要啟用組態快取，請遵循 [Gradle 組態快取文件](https://docs.gradle.org/current/userguide/configuration_cache.html#config_cache:usage:enable)中的說明。

## 產生文件 {id="generate-documentation"}

Dokka Gradle 外掛程式內建了 [HTML](dokka-html.md) 和 [Javadoc](dokka-javadoc.md) 輸出格式。

使用以下 Gradle 任務來產生文件：

```shell
./gradlew :dokkaGenerate
```

`dokkaGenerate` Gradle 任務的主要行為是：

* 此任務會同時為[單一](#單一專案組態)
  和[多專案](#多專案組態)組建產生文件。
* 預設情況下，文件輸出格式為 HTML。
  您也可以透過[新增適當的外掛程式](#配置文件輸出格式)來產生 Javadoc 或同時產生 HTML 和 Javadoc 格式。
* 對於單一和多專案組建，產生的文件都會自動放置在 `build/dokka/html` 
  目錄中。
  您可以[更改位置 (`outputDirectory`)](dokka-gradle-configuration-options.md#general-configuration)。

### 配置文件輸出格式 {id="configure-documentation-output-format"}

> Javadoc 輸出格式目前處於 [Alpha](https://kotlinlang.org/docs/components-stability.html#stability-levels-explained) 階段。
> 使用時可能會遇到錯誤和遷移問題。
> 不保證能與接受 Javadoc 作為輸入的工具成功整合。
> 請自行承擔使用風險。
>
{style="warning"}

您可以選擇產生 HTML、Javadoc 格式的 API 文件，
或同時產生這兩種格式：

1. 在專案 `build.gradle.kts` 檔案的 `plugins {}` 區塊中放置對應的外掛程式 `id`：

   ```kotlin
   plugins {
       // 產生 HTML 文件
       id("org.jetbrains.dokka") version "%dokkaVersion%"

       // 產生 Javadoc 文件
       id("org.jetbrains.dokka-javadoc") version "%dokkaVersion%"

       // 同時保留兩個外掛程式 ID 會產生兩種格式
   }
   ```

2. 執行對應的 Gradle 任務。

   以下是對應於每種格式的外掛程式 `id` 和 Gradle 任務列表：

   |             | **HTML**                                  | **Javadoc**                                  | **兩者皆有**                          |
   |-------------|-------------------------------------------|----------------------------------------------|-----------------------------------|
   | 外掛程式 `id` | `id("org.jetbrains.dokka")`               | `id("org.jetbrains.dokka-javadoc")`          | 同時使用 HTML 和 Javadoc 外掛程式 |
   | Gradle 任務 | `./gradlew :dokkaGeneratePublicationHtml` | `./gradlew :dokkaGeneratePublicationJavadoc` | `./gradlew :dokkaGenerate`        |

    > * `dokkaGenerate` 任務會根據套用的外掛程式產生所有可用格式的文件。
    > 如果同時套用了 HTML 和 Javadoc 外掛程式，
    > 您可以選擇僅執行 `dokkaGeneratePublicationHtml` 任務來產生 HTML，
    > 或僅執行 `dokkaGeneratePublicationJavadoc` 任務來產生 Javadoc。
    > 
    {style="tip"}

如果您使用 IntelliJ IDEA，可能會看到 `dokkaGenerateHtml` Gradle 任務。
此任務僅是 `dokkaGeneratePublicationHtml` 的別名。這兩個任務執行的操作完全相同。

### 彙總多專案組建的文件輸出 {id="aggregate-documentation-output-in-multi-project-builds"}

Dokka 可以將多個子專案的文件彙總到單一輸出或發布中。

您必須在彙總文件之前將 [Dokka 外掛程式套用](#將慣例外掛程式套用到您的子專案)至 
所有可編寫文件的子專案。

若要彙總多個子專案的文件，請在根專案的 `build.gradle.kts` 檔案中新增 `dependencies {}` 
區塊：

```kotlin
dependencies {
    dokka(project(":childProjectA:"))
    dokka(project(":childProjectB:"))
}
```

假設專案結構如下：

```text
.
└── parentProject/
    ├── childProjectA/
    │   └── demo/
    │       └── ChildProjectAClass.kt
    └── childProjectB/
        └── demo/
            └── ChildProjectBClass.kt
```

產生的文件彙總如下：

![dokkaHtmlMultiModule 任務輸出的螢幕截圖](dokkaHtmlMultiModule-example.png){width=600}

如需詳細資訊，請參閱我們的[多專案範例](https://github.com/Kotlin/dokka/tree/2.0.0/examples/gradle-v2/multimodule-example)。

#### 彙總文件的目錄 {id="directory-of-aggregated-documentation"}

當 DGP 彙總子專案時，每個子專案在彙總文件中都有其專屬的子目錄。
DGP 透過保留完整的專案結構來確保每個子專案都有唯一的目錄。

例如，假設一個專案在 `:turbo-lib` 中進行彙總，並且有一個巢狀子專案 `:turbo-lib:maths`， 
產生的文件將放置在：

```text
turbo-lib/build/dokka/html/turbo-lib/maths/
```

您可以透過手動指定子專案目錄來還原此行為。
在每個子專案的 `build.gradle.kts` 檔案中新增以下配置：

```kotlin
// /turbo-lib/maths/build.gradle.kts

plugins {
    id("org.jetbrains.dokka")
}

dokka {
    // 覆寫子專案目錄
    modulePath.set("maths")
}
```

此配置會將 `:turbo-lib:maths` 模組產生的文件更改為 
產生至 `turbo-lib/build/dokka/html/maths/`。

## 組建 javadoc.jar {id="build-javadoc-jar"}

如果您想將程式庫發布到儲存庫，您可能需要提供一個包含 
程式庫 API 參考文件的 `javadoc.jar` 檔案。

例如，如果您想發布到 [Maven Central](https://central.sonatype.org/)，您 
[必須](https://central.sonatype.org/publish/requirements/)隨專案提供 `javadoc.jar`。然而，
並非所有儲存庫都有此規則。

Dokka 的 Gradle 外掛程式並未提供任何現成的方法來執行此操作，但可以透過自訂 Gradle
任務來實現。一個用於產生 [HTML](dokka-html.md) 格式文件，另一個用於產生 [Javadoc](dokka-javadoc.md) 格式文件：

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
// 產生 HTML 格式文件
val dokkaHtmlJar by tasks.registering(Jar::class) {
    description = "A HTML Documentation JAR containing Dokka HTML"
    from(tasks.dokkaGeneratePublicationHtml.flatMap { it.outputDirectory })
    archiveClassifier.set("html-doc")
}

// 產生 Javadoc 格式文件
val dokkaJavadocJar by tasks.registering(Jar::class) {
    description = "A Javadoc JAR containing Dokka Javadoc"
    from(tasks.dokkaGeneratePublicationJavadoc.flatMap { it.outputDirectory })
    archiveClassifier.set("javadoc")
}
```

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

```groovy
// 產生 HTML 格式文件
tasks.register('dokkaHtmlJar', Jar) {
    description = 'A HTML Documentation JAR containing Dokka HTML'
    from(tasks.named('dokkaGeneratePublicationHtml').flatMap { it.outputDirectory })
    archiveClassifier.set('html-doc')
}

// 產生 Javadoc 格式文件
tasks.register('dokkaJavadocJar', Jar) {
    description = 'A Javadoc JAR containing Dokka Javadoc'
    from(tasks.named('dokkaGeneratePublicationJavadoc').flatMap { it.outputDirectory })
    archiveClassifier.set('javadoc')
}
```

</tab>
</tabs>

> 如果您將程式庫發布到 Maven Central，您可以使用像 [javadoc.io](https://javadoc.io/) 這樣的服務來
> 免費且無需任何設定地託管程式庫的 API 文件。它會直接從 `javadoc.jar` 中提取文件頁面。
> 它與 HTML 格式配合良好，如[此範例](https://javadoc.io/doc/com.trib3/server/latest/index.html)所示。
>
{style="tip"}

## 組態範例 {id="configuration-examples"}

根據您專案的類型，套用和配置 Dokka 的方式會略有不同。然而，
不論您的專案類型為何，[組態選項](dokka-gradle-configuration-options.md)本身都是相同的。

對於在專案根目錄中只有單一 `build.gradle.kts` 或 `build.gradle` 檔案的簡單且扁平的專案，
請參閱[單一專案組態](#單一專案組態)。

對於具有子專案和多個巢狀 `build.gradle.kts` 或 `build.gradle` 檔案的更複雜組建，
請參閱[多專案組態](#多專案組態)。

### 單一專案組態 {id="single-project-configuration"}

單一專案組建通常在專案根目錄中只有一個 `build.gradle.kts` 
或 `build.gradle` 檔案。
它們可以是單平台或多平台，通常具有以下結構：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

單平台：

```text
.
├── build.gradle.kts
└── src/
    └── main/
        └── kotlin/
            └── HelloWorld.kt
```

多平台：

```text
.
├── build.gradle.kts
└── src/
    ├── commonMain/
    │   └── kotlin/
    │       └── Common.kt
    ├── jvmMain/
    │   └── kotlin/
    │       └── JvmUtils.kt
    └── nativeMain/
        └── kotlin/
            └── NativeUtils.kt
```

</tab>
<tab title="Groovy" group-key="groovy">

單平台：

```text
.
├── build.gradle
└── src/
    └── main/
        └── kotlin/
            └── HelloWorld.kt
```

多平台：

```text
.
├── build.gradle
└── src/
    ├── commonMain/
    │   └── kotlin/
    │       └── Common.kt
    ├── jvmMain/
    │   └── kotlin/
    │       └── JvmUtils.kt
    └── nativeMain/
        └── kotlin/
            └── NativeUtils.kt
```

</tab>
</tabs>

在根目錄的 `build.gradle.kts` 檔案中套用 Dokka Gradle 外掛程式，並使用頂層的 `dokka {}` DSL 進行配置：

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
plugins {
    id("org.jetbrains.dokka") version "%dokkaVersion%"
}

dokka {
    dokkaPublications.html {
        moduleName.set("MyProject")
        outputDirectory.set(layout.buildDirectory.dir("documentation/html"))
        includes.from("README.md")
   }

    dokkaSourceSets.main {
        sourceLink {
            localDirectory.set(file("src/main/kotlin"))
            remoteUrl.set(URI("https://github.com/your-repo"))
            remoteLineSuffix.set("#L")
        }
    }
}
```

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

在 `./build.gradle` 內部：

```groovy
plugins {
    id 'org.jetbrains.dokka' version '%dokkaVersion%'
}

dokka {
    dokkaPublications {
        html {
            moduleName.set("MyProject")
            outputDirectory.set(layout.buildDirectory.dir("documentation/html"))
            includes.from("README.md")
        }
    }

    dokkaSourceSets {
        named("main") {
            sourceLink {
                localDirectory.set(file("src/main/kotlin"))
                remoteUrl.set(new URI("https://github.com/your-repo"))
                remoteLineSuffix.set("#L")
            }
        }
    }
}
```

</tab>
</tabs>

此配置會將 Dokka 套用到您的專案， 
設定文件輸出目錄，並定義主原始碼集。
您可以透過在同一個 `dokka {}` 區塊中新增自訂資產、可見性篩選器 
或外掛程式配置來進一步擴充它。
如需詳細資訊，請參閱[組態選項](dokka-gradle-configuration-options.md)。

### 多專案組態 {id="multi-project-configuration"}

[多專案組建](https://docs.gradle.org/current/userguide/multi_project_builds.html) 
通常包含數個 
巢狀的 `build.gradle.kts` 檔案，且具有類似以下的結構：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```text
.
├── build.gradle.kts
├── settings.gradle.kts
├── subproject-A/
│   ├── build.gradle.kts
│   └── src/
│       └── main/
│           └── kotlin/
│               └── HelloFromA.kt
└── subproject-B/
    ├── build.gradle.kts
    └── src/
        └── main/
            └── kotlin/
                └── HelloFromB.kt
```

</tab>
<tab title="Groovy" group-key="groovy">

```text
.
├── build.gradle
├── settings.gradle
├── subproject-A/
│   ├── build.gradle
│   └── src/
│       └── main/
│           └── kotlin/
│               └── HelloFromA.kt
└── subproject-B/
    ├── build.gradle
    └── src/
        └── main/
            └── kotlin/
                └── HelloFromB.kt
```

</tab>
</tabs>

單一專案和多專案文件共用相同的 
[使用頂層 `dokka {}` DSL 的組態模型](#單一專案組態)。

在多專案組建中配置 Dokka 有兩種方式：

* **[透過慣例外掛程式共用組態](#透過慣例外掛程式共用組態)（偏好方式）**：定義一個慣例外掛程式並將其套用到所有子專案。
  這可以集中管理您的 Dokka 設定。

* **[手動配置](#手動配置)**：套用 Dokka 外掛程式並在每個子專案中重複相同的 `dokka {}` 區塊。
  您不需要慣例外掛程式。

在配置子專案後，您可以將來自多個子專案的文件彙總至單一輸出。
如需詳細資訊，請參閱
[彙總多專案組建的文件輸出](#彙總多專案組建的文件輸出)。

> 如需多專案範例，請參閱 [Dokka GitHub 儲存庫](https://github.com/Kotlin/dokka/tree/master/examples/gradle-v2/multimodule-example)。
>
{style="tip"}

#### 透過慣例外掛程式共用組態 {id="shared-configuration-via-a-convention-plugin"}

遵循下列步驟來設定慣例外掛程式並將其套用到您的子專案。

##### 設定 buildSrc 目錄 {id="set-up-the-buildsrc-directory"}

1. 在專案根目錄中，建立一個包含兩個檔案的 `buildSrc` 目錄：

    * `settings.gradle.kts`
    * `build.gradle.kts`

2. 在 `buildSrc/settings.gradle.kts` 檔案中，新增以下片段：

   ```kotlin
   rootProject.name = "buildSrc"
   ```

3. 在 `buildSrc/build.gradle.kts` 檔案中，新增以下片段：

    ```kotlin
    plugins {
        `kotlin-dsl`
    }
    
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
    
    dependencies {
        implementation("org.jetbrains.dokka:dokka-gradle-plugin:%dokkaVersion%")
    }   
    ```

##### 設定 Dokka 慣例外掛程式 {id="set-up-the-dokka-convention-plugin"}

設定 `buildSrc` 目錄後，設定 Dokka 慣例外掛程式：

1. 建立 `buildSrc/src/main/kotlin/dokka-convention.gradle.kts` 檔案以裝載[慣例外掛程式](https://docs.gradle.org/current/userguide/custom_plugins.html#sec:convention_plugins)。
2. 在 `dokka-convention.gradle.kts` 檔案中，新增以下片段：

    ```kotlin
    plugins {
        id("org.jetbrains.dokka") 
    }

    dokka {
        // 共用組態放在這裡
    }
    ```

   您需要在 `dokka {}` 
   區塊中新增所有子專案通用的共用 Dokka [組態](dokka-gradle-configuration-options.md)。
   此外，您不需要指定 Dokka 版本。
   版本已在 `buildSrc/build.gradle.kts` 檔案中設定。

##### 將慣例外掛程式套用到您的子專案 {id="apply-the-convention-plugin-to-your-subprojects"}

透過將 Dokka 慣例外掛程式新增到每個子專案的 `build.gradle.kts` 
檔案中，來將其套用到您的子專案：

```kotlin
plugins {
    id("dokka-convention")
}
```

#### 手動配置 {id="manual-configuration"}

如果您的專案不使用慣例外掛程式，您可以透過手動 
將相同的 `dokka {}` 區塊複製到每個子專案中來重複使用相同的 Dokka 配置模式：

1. 在每個子專案的 `build.gradle.kts` 檔案中套用 Dokka 外掛程式：

   ```kotlin
   plugins {
       id("org.jetbrains.dokka") version "%dokkaVersion%"
   }
   ```

2. 在每個子專案的 `dokka {}` 區塊中宣告共用組態。因為沒有集中配置的慣例外掛程式，所以您需要跨子專案重複任何您想要的配置。如需詳細資訊，
   請參閱[組態選項](dokka-gradle-configuration-options.md)。

#### 根專案組態 {id="parent-project-configuration"}

在多專案組建中，您可以在根專案中配置適用於整份文件的設定。
這可以包括定義輸出格式、輸出目錄、文件子專案名稱、 
從所有子專案彙總文件，以及其他[組態選項](dokka-gradle-configuration-options.md)：

```kotlin
plugins {
    id("org.jetbrains.dokka") version "%dokkaVersion%"
}

dokka {
    // 為整個專案設定屬性
    dokkaPublications.html {
        moduleName.set("My Project")
        outputDirectory.set(layout.buildDirectory.dir("docs/html"))
        includes.from("README.md")
    }

    dokkaSourceSets.configureEach {
        documentedVisibilities.set(setOf(VisibilityModifier.Public)) // 或 documentedVisibilities(VisibilityModifier.Public)    
    }
}

// 彙總子專案文件
dependencies {
    dokka(project(":childProjectA"))
    dokka(project(":childProjectB"))
}
```

此外，如果子專案需要自訂組態，每個子專案都可以有自己的 `dokka {}` 區塊。
在以下範例中，子專案套用了 Dokka 外掛程式，設定了自訂子專案名稱， 
並包含來自其 `README.md` 檔案的其他文件：

```kotlin
// subproject/build.gradle.kts
plugins {
    id("org.jetbrains.dokka")
}

dokka {
    dokkaPublications.html {
        moduleName.set("Child Project A")
        includes.from("README.md")
    }
}
```
