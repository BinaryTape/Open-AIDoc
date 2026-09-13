[//]: # (title: 為 EAP 設定您的組建)

<tldr>
    <p>目前沒有可用的預覽版本。</p>
    <!--<p>最新 Kotlin EAP 版本：<strong>%kotlinEapVersion%</strong></p>
    <p><a href="eap.md#build-details">探索 Kotlin EAP 版本詳細資訊</a></p> -->
</tldr>

若要將您的組建設定為使用 Kotlin 的 EAP 版本，您需要： 

* 指定 Kotlin 的 EAP 版本。[此處列出了可用的 EAP 版本](eap.md#build-details)。
* 將相依性的版本變更為 EAP 版本。
Kotlin 的 EAP 版本可能無法與先前發佈版本的程式庫搭配運作。 

以下程序說明如何在 Gradle 和 Maven 中設定您的組建：

* [在 Gradle 中設定](#configure-in-gradle)
* [在 Maven 中設定](#configure-in-maven)

## 在 Gradle 中設定 {id="configure-in-gradle"}

此章節說明您可以如何：

* [調整 Kotlin 版本](#adjust-the-kotlin-version)
* [調整相依性中的版本](#adjust-versions-in-dependencies)

### 調整 Kotlin 版本 {id="adjust-the-kotlin-version"}

在 `build.gradle(.kts)` 內的 `plugins` 區塊中，將 `KOTLIN-EAP-VERSION` 變更為實際的 EAP 版本，例如 `%kotlinEapVersion%`。[此處列出了可用的 EAP 版本](eap.md#build-details)。

或者，您也可以在 `settings.gradle(.kts)` 的 `pluginManagement` 區塊中指定 EAP 版本 —— 詳情請參閱 [Gradle 文件](https://docs.gradle.org/current/userguide/plugins.html#sec:plugin_version_management)。

以下是多平台專案的範例。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    java
    kotlin("multiplatform") version "KOTLIN-EAP-VERSION"
}

repositories {
    mavenCentral()
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id 'java'
    id 'org.jetbrains.kotlin.multiplatform' version 'KOTLIN-EAP-VERSION'
}

repositories {
    mavenCentral()
}
```

</tab>
</tabs>

### 調整相依性中的版本 {id="adjust-versions-in-dependencies"}

如果您在專案中使用 kotlinx 程式庫，您的程式庫版本可能與 Kotlin 的 EAP 版本不相容。

若要解決此問題，您需要在相依性中指定相容程式庫的版本。如需相容程式庫的清單，請參閱 [EAP 組建詳細資訊](eap.md#build-details)。 

> 在大多數情況下，我們僅針對特定版本的第一個 EAP 版本建立程式庫，且這些程式庫可與該版本的後續 EAP 版本搭配使用。
> 
> 如果後續 EAP 版本中存在不相容的變更，我們將發佈程式庫的新版本。
>
{style="note"}

以下是一個範例。

對於 **kotlinx.coroutines** 程式庫，請加入與 `%kotlinEapVersion%` 相容的版本號碼 —— `%coroutinesEapVersion%`。 

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesEapVersion%")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
dependencies {
    implementation "org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesEapVersion%"
}
```

</tab>
</tabs>

## 在 Maven 中設定 {id="configure-in-maven"}

在 Maven 專案定義範例中，將 `KOTLIN-EAP-VERSION` 替換為實際版本，例如 `%kotlinEapVersion%`。[此處列出了可用的 EAP 版本](eap.md#build-details)。

```xml
<project ...>
    <properties>
        <kotlin.version>KOTLIN-EAP-VERSION</kotlin.version>
    </properties>

    <repositories>
        <repository>
           <id>mavenCentral</id>
           <url>https://repo1.maven.org/maven2/</url>
        </repository>
    </repositories>

    <pluginRepositories>
       <pluginRepository>
          <id>mavenCentral</id>
          <url>https://repo1.maven.org/maven2/</url>
       </pluginRepository>
    </pluginRepositories>

    <dependencies>
        <dependency>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-stdlib</artifactId>
            <version>${kotlin.version}</version>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.jetbrains.kotlin</groupId>
                <artifactId>kotlin-maven-plugin</artifactId>
                <version>${kotlin.version}</version>
                ...
            </plugin>
        </plugins>
    </build>
</project>
```

## 如果您遇到任何問題 {id="if-you-run-into-any-problems"}

* 將問題回報至 [我們的問題追蹤器 YouTrack](https://kotl.in/issue)。
* 在 [Kotlin Slack 的 #eap 頻道](https://app.slack.com/client/T09229ZC6/C0KLZSCHF)尋求協助（[取得邀請](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)）。
* 回復至最新的穩定版本：[在您的組建指令碼檔案中進行變更](#adjust-the-kotlin-version)。