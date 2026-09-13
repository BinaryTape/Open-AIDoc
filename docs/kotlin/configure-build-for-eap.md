[//]: # (title: 为抢先体验计划 (EAP) 配置构建)

<tldr>
    <p>目前没有可用的预览版本。</p>
    <!--<p>最新 Kotlin EAP 版本：<strong>%kotlinEapVersion%</strong></p>
    <p><a href="eap.md#build-details">探索 Kotlin EAP 发布详情</a></p> -->
</tldr>

要将构建配置为使用 Kotlin 的抢先体验计划 (EAP) 版本，您需要： 

* 指定 Kotlin 的 EAP 版本。[此处列出了可用的 EAP 版本](eap.md#build-details)。
* 将依赖项的版本更改为 EAP 版本。
Kotlin 的 EAP 版本可能无法与之前发布的版本的库配合使用。 

以下步骤说明了如何在 Gradle 和 Maven 中配置您的构建：

* [在 Gradle 中配置](#configure-in-gradle)
* [在 Maven 中配置](#configure-in-maven)

## 在 Gradle 中配置 {id="configure-in-gradle"}

本节说明如何：

* [调整 Kotlin 版本](#adjust-the-kotlin-version)
* [调整依赖项中的版本](#adjust-versions-in-dependencies)

### 调整 Kotlin 版本 {id="adjust-the-kotlin-version"}

在 `build.gradle(.kts)` 的 `plugins` 代码块中，将 `KOTLIN-EAP-VERSION` 更改为实际的 EAP 版本，例如 `%kotlinEapVersion%`。[此处列出了可用的 EAP 版本](eap.md#build-details)。

或者，您也可以在 `settings.gradle(.kts)` 的 `pluginManagement` 代码块中指定 EAP 版本——详见 [Gradle 文档](https://docs.gradle.org/current/userguide/plugins.html#sec:plugin_version_management)。

以下是多平台项目的一个示例。

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

### 调整依赖项中的版本 {id="adjust-versions-in-dependencies"}

如果您在项目中使用 kotlinx 库，您的库版本可能与 Kotlin 的 EAP 版本不兼容。

要解决此问题，您需要在依赖项中指定兼容库的版本。有关兼容库的列表，请参阅 [EAP 构建详情](eap.md#build-details)。 

> 在大多数情况下，我们仅针对特定发布版本的第一个 EAP 版本创建库，这些库可与该版本的后续 EAP 版本配合使用。
> 
> 如果后续 EAP 版本中存在不兼容的变更，我们将发布库的新版本。
>
{style="note"}

以下是一个示例。

对于 **kotlinx.coroutines** 库，请添加与 `%kotlinEapVersion%` 兼容的版本号——`%coroutinesEapVersion%`。 

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

## 在 Maven 中配置 {id="configure-in-maven"}

在 Maven 项目定义示例中，将 `KOTLIN-EAP-VERSION` 替换为实际版本，例如 `%kotlinEapVersion%`。[此处列出了可用的 EAP 版本](eap.md#build-details)。

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

## 如果遇到任何问题 {id="if-you-run-into-any-problems"}

* 向 [我们的问题跟踪器 YouTrack](https://kotl.in/issue) 报告问题。
* 在 [Kotlin Slack 的 #eap 频道](https://app.slack.com/client/T09229ZC6/C0KLZSCHF) 寻求帮助 ([获取邀请](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up))。
* 回滚到最新的稳定版本：[在构建脚本文件中进行更改](#adjust-the-kotlin-version)。