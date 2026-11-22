[//]: # (title: Dokka の使用を開始する)

以下に、Dokka を使い始めるための簡単な手順を示します。

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

> このガイドは Dokka Gradle プラグイン (DGP) v2 モードに適用されます。DGP v1 モードはサポートされなくなりました。
> v1 から v2 モードへアップグレードするには、[マイグレーションガイド](dokka-migration.md)に従ってください。
>
{style="note"}

**Gradle Dokka プラグインの適用** 

プロジェクトのルートビルドスクリプトで Dokka Gradle プラグイン (DGP) を適用します:

```kotlin
plugins {
    id("org.jetbrains.dokka") version "%dokkaVersion%"
}
```

**マルチプロジェクトビルドのドキュメント作成**

[マルチプロジェクトビルド](https://docs.gradle.org/current/userguide/multi_project_builds.html)をドキュメント化する場合、ドキュメントを作成したいすべてのサブプロジェクトにプラグインを適用する必要があります。次のいずれかのアプローチを使用して、サブプロジェクト間で Dokka の設定を共有します:

* 規約プラグイン (Convention plugin)
* 規約プラグインを使用していない場合は、各サブプロジェクトでの直接設定

マルチプロジェクトビルドでの Dokka 設定の共有に関する詳細については、[マルチプロジェクトの設定](dokka-gradle.md#multi-project-configuration)を参照してください。

**ドキュメントの生成**

ドキュメントを生成するには、次の Gradle タスクを実行します:

```bash
./gradlew :dokkaGenerate
```

このタスクは、単一プロジェクトビルドとマルチプロジェクトビルドの両方で機能します。

タスクの前にプロジェクトパス (`:`) を付けることで、集約プロジェクトから `dokkaGenerate` タスクを実行します。例:

```bash
./gradlew :dokkaGenerate

// OR

./gradlew :aggregatingProject:dokkaGenerate
```

`./gradlew :dokkaGenerate` や `./gradlew :aggregatingProject:dokkaGenerate` の代わりに `./gradlew dokkaGenerate` を実行することは避けてください。タスクの前にプロジェクトパス (`:`) が付いていない場合、Gradle はビルド全体にわたるすべての `dokkaGenerate` タスクを実行しようとするため、不要な処理がトリガーされる可能性があります。

さまざまなタスクを使用して、[HTML](dokka-html.md)、[Javadoc](dokka-javadoc.md)、または [HTML と Javadoc の両方](dokka-gradle.md#configure-documentation-output-format)で出力を生成できます。

> Gradle での Dokka の使用についての詳細は、[Gradle](dokka-gradle.md) を参照してください。
{style="tip"}

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

> このガイドは Dokka Gradle プラグイン (DGP) v2 モードに適用されます。DGP v1 モードはサポートされなくなりました。
> v1 から v2 モードへアップグレードするには、[マイグレーションガイド](dokka-migration.md)に従ってください。
>
{style="note"}

**Gradle Dokka プラグインの適用**

プロジェクトのルートビルドスクリプトで Dokka Gradle プラグイン (DGP) を適用します:

```groovy
plugins {
    id 'org.jetbrains.dokka' version '%dokkaVersion%'
}
```

**マルチプロジェクトビルドのドキュメント作成**

[マルチプロジェクトビルド](https://docs.gradle.org/current/userguide/multi_project_builds.html)をドキュメント化する場合、ドキュメントを作成したいすべてのサブプロジェクトにプラグインを適用する必要があります。次のいずれかのアプローチを使用して、サブプロジェクト間で Dokka の設定を共有します:

* 規約プラグイン (Convention plugin)
* 規約プラグインを使用していない場合は、各サブプロジェクトでの直接設定

マルチプロジェクトビルドでの Dokka 設定の共有に関する詳細については、[マルチプロジェクトの設定](dokka-gradle.md#multi-project-configuration)を参照してください。

**ドキュメントの生成**

ドキュメントを生成するには、次の Gradle タスクを実行します:

```bash
./gradlew :dokkaGenerate
```

このタスクは、単一プロジェクトビルドとマルチプロジェクトビルドの両方で機能します。

タスクの前にプロジェクトパス (`:`) を付けることで、集約プロジェクトから `dokkaGenerate` タスクを実行します。例:

```bash
./gradlew :dokkaGenerate

// OR

./gradlew :aggregatingProject:dokkaGenerate
```

`./gradlew :dokkaGenerate` や `./gradlew :aggregatingProject:dokkaGenerate` の代わりに `./gradlew dokkaGenerate` を実行することは避けてください。タスクの前にプロジェクトパス (`:`) が付いていない場合、Gradle はビルド全体にわたるすべての `dokkaGenerate` タスクを実行しようとするため、不要な処理がトリガーされる可能性があります。

さまざまなタスクを使用して、[HTML](dokka-html.md)、[Javadoc](dokka-javadoc.md)、または [HTML と Javadoc の両方](dokka-gradle.md#configure-documentation-output-format)で出力を生成できます。

> Gradle での Dokka の使用についての詳細は、[Gradle](dokka-gradle.md) を参照してください。
{style="tip"}

</tab>
<tab title="Maven" group-key="mvn">

POM ファイルの `plugins` セクションに Dokka の Maven プラグインを追加します:

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

ドキュメントを生成するには、`dokka:dokka` ゴールを実行します。

デフォルトでは、出力ディレクトリは `target/dokka` に設定されています。

Maven での Dokka の使用についての詳細は、[Maven](dokka-maven.md) を参照してください。

</tab>
</tabs>