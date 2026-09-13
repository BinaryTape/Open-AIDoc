[//]: # (title: EAPに向けたビルドの構成)

<tldr>
    <p>現在、プレビューバージョンは利用できません。</p>
    <!--<p>最新の Kotlin EAP リリース: <strong>%kotlinEapVersion%</strong></p>
    <p><a href="eap.md#build-details">Kotlin EAP リリースの詳細を確認する</a></p> -->
</tldr>

Kotlin の EAP バージョンを使用するようにビルドを構成するには、以下を行う必要があります。 

* Kotlin の EAP バージョンを指定する。[利用可能な EAP バージョンはこちらに記載されています](eap.md#build-details)。
* 依存関係のバージョンを EAP 用のものに変更する。
Kotlin の EAP バージョンは、以前にリリースされたバージョンのライブラリとは動作しない可能性があります。 

以下の手順では、Gradle と Maven でビルドを構成する方法を説明します。

* [Gradle で構成する](#configure-in-gradle)
* [Maven で構成する](#configure-in-maven)

## Gradle で構成する {id="configure-in-gradle"}

このセクションでは、以下を行う方法について説明します。

* [Kotlin バージョンの調整](#adjust-the-kotlin-version)
* [依存関係のバージョンの調整](#adjust-versions-in-dependencies)

### Kotlin バージョンの調整 {id="adjust-the-kotlin-version"}

`build.gradle(.kts)` 内の `plugins` ブロックで、`KOTLIN-EAP-VERSION` を `%kotlinEapVersion%` などの実際の EAP バージョンに変更します。[利用可能な EAP バージョンはこちらに記載されています](eap.md#build-details)。

または、`settings.gradle(.kts)` の `pluginManagement` ブロックで EAP バージョンを指定することもできます。詳細は [Gradle のドキュメント](https://docs.gradle.org/current/userguide/plugins.html#sec:plugin_version_management)を参照してください。

以下はマルチプラットフォームプロジェクトの例です。

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

### 依存関係のバージョンの調整 {id="adjust-versions-in-dependencies"}

プロジェクトで kotlinx ライブラリを使用している場合、ライブラリのバージョンが Kotlin の EAP バージョンと互換性がない可能性があります。

この問題を解決するには、依存関係で互換性のあるライブラリのバージョンを指定する必要があります。互換性のあるライブラリのリストについては、[EAP ビルドの詳細](eap.md#build-details)を参照してください。 

> ほとんどの場合、特定のリリースの最初の EAP バージョンに対してのみライブラリを作成しており、これらのライブラリはそのリリースの以降の EAP バージョンでも動作します。
> 
> 次の EAP バージョンで互換性のない変更がある場合は、ライブラリの新しいバージョンをリリースします。
>
{style="note"}

以下に例を示します。

**kotlinx.coroutines** ライブラリの場合、`%kotlinEapVersion%` と互換性のあるバージョン番号 `%coroutinesEapVersion%` を追加します。 

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

## Maven で構成する {id="configure-in-maven"}

サンプルの Maven プロジェクト定義で、`KOTLIN-EAP-VERSION` を `%kotlinEapVersion%` などの実際のバージョンに置き換えます。
[利用可能な EAP バージョンはこちらに記載されています](eap.md#build-details)。

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

## 何らかの問題が発生した場合 {id="if-you-run-into-any-problems"}

* [問題トラッカーである YouTrack](https://kotl.in/issue) に問題を報告してください。
* [Kotlin Slack の #eap チャンネル](https://app.slack.com/client/T09229ZC6/C0KLZSCHF)でヘルプを求めてください（[招待を受ける](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)）。
* 最新の安定バージョンにロールバックする：[ビルドスクリプトファイルで変更します](#adjust-the-kotlin-version)。