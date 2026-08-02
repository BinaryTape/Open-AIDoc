[//]: # (title: kapt コンパイラプラグイン)

<tldr>

* 以下の場合には **kapt** を使用してください：
   * Maven プロジェクトを使用している場合。
   * Gradle プロジェクトを使用しているが、必要な Java アノテーションプロセッサがまだ KSP をサポートしていない場合。[サポートされているライブラリのリストを確認してください](ksp-overview.md#supported-libraries)。
* 以下の場合には **[KSP](ksp-overview.md)** を使用してください：
   * Gradle プロジェクトを使用しており、必要な Java アノテーションプロセッサが KSP をサポートしている場合。
   * 独自のアノテーションプロセッサを作成したい場合。

</tldr>

kapt コンパイラプラグインを使用すると、Kotlin で既存の Java アノテーションプロセッサを使用でき、Maven と Gradle の両方で動作します。
これは Kotlin ソースコードからスタブファイルを生成し、それらのスタブに対して Java アノテーションプロセッサを実行します。

これにより、[MapStruct](https://mapstruct.org/) や [データバインディング](https://developer.android.com/topic/libraries/data-binding/index.html) などのライブラリに対して、Kotlin プロジェクトで Java ベースのアノテーション処理が可能になります。

> kapt は IntelliJ のビルドシステムではサポートされていません。IntelliJ IDEA でアノテーション処理を再実行するには、**Maven** ツールウィンドウからビルドを起動してください。
>
{style="warning"}

## プラグインの設定

kapt プラグインは、[Gradle](#set-up-in-gradle)、[Maven](#set-up-in-maven) で構成するか、[コマンドライン](#cli) から使用できます。

### Gradle {id="set-up-in-gradle"}

Gradle で kapt を使用するには、以下の手順に従ってください：

1. ビルドスクリプトファイル `build.gradle(.kts)` に `kapt` Gradle プラグインを適用します：

   <tabs group="build-script">
   <tab title="Kotlin" group-key="kotlin">

   ```kotlin
   plugins {
       kotlin("kapt") version "%kotlinVersion%"
   }
   ```

   </tab>
   <tab title="Groovy" group-key="groovy">

   ```groovy
   plugins {
       id "org.jetbrains.kotlin.kapt" version "%kotlinVersion%"
   }
   ```

   </tab>
   </tabs>

2. `dependencies {}` ブロックで `kapt` 構成を使用して、それぞれの依存関係を追加します：

   <tabs group="build-script">
   <tab title="Kotlin" group-key="kotlin">

   ```kotlin
   dependencies {
       kapt("groupId:artifactId:version")
   }
   ```

   </tab>
   <tab title="Groovy" group-key="groovy">

   ```groovy
   dependencies {
       kapt 'groupId:artifactId:version'
   }
   ```

   </tab>
   </tabs>

3. 以前にアノテーションプロセッサに [Android サポート](https://developer.android.com/build/annotation-processors) を使用していた場合は、`annotationProcessor` 構成の使用を `kapt` に置き換えてください。プロジェクトに Java クラスが含まれている場合、kapt プラグインはそれらも処理します。

   `androidTest` または `test` ソースに対してアノテーションプロセッサを使用する場合、それぞれの `kapt` 構成は `kaptAndroidTest` および `kaptTest` という名前になります。`kaptAndroidTest` と `kaptTest` は `kapt` を継承しているため、`kapt` 依存関係を提供すれば、本番ソースとテストの両方で利用可能になります。

### Maven {id="set-up-in-maven"}

設定を簡略化するための [`<extensions>` オプション](#automatic-configuration) を使用するか、kapt の実行を完全に制御するために [手動](#manual-configuration) で設定できます。

#### 自動設定

Kotlin Maven プラグインの `<extensions>` オプションを有効にすることで、kapt の設定を簡略化できます。この場合、ゴールやソースディレクトリを含む kapt の `<execution>` セクションを手動で設定する必要はありません。

kapt を自動的に設定するには、`pom.xml` ビルドファイルで `kotlin-maven-plugin` の `<extensions>` オプションを `true` に設定します：

```xml
<plugin>
    <groupId>org.jetbrains.kotlin</groupId>
    <artifactId>kotlin-maven-plugin</artifactId>
    <version>${kotlin.version}</version>
    <extensions>true</extensions>
    <configuration>
        <annotationProcessorPaths>
            <!-- ここでアノテーションプロセッサを指定します -->
            <annotationProcessorPath>
                <groupId>org.mapstruct</groupId>
                <artifactId>mapstruct-processor</artifactId>
                <version>1.6.3</version>
            </annotationProcessorPath>
        </annotationProcessorPaths>
    </configuration>
</plugin>
```

`<extensions>` オプションの詳細については、[自動設定](maven-configure-project.md#automatic-configuration) を参照してください。

#### 手動設定

Kotlin Maven プロジェクトで kapt を手動で設定するには、`compile` 実行の前に `kotlin-maven-plugin` の `kapt` ゴールの実行を追加します：

```xml
<execution>
    <id>kapt</id>
    <goals>
        <goal>kapt</goal>
    </goals>
    <configuration>
        <sourceDirs>
            <sourceDir>src/main/kotlin</sourceDir>
            <sourceDir>src/main/java</sourceDir>
        </sourceDirs>
        <annotationProcessorPaths>
            <!-- ここでアノテーションプロセッサを指定します -->
            <annotationProcessorPath>
                <groupId>org.mapstruct</groupId>
                <artifactId>mapstruct-processor</artifactId>
                <version>1.6.3</version>
            </annotationProcessorPath>
        </annotationProcessorPaths>
    </configuration>
</execution>
```

アノテーション処理のモードを設定するには、`<configuration>` ブロックで [`aptMode`](#annotation-processor-configuration) オプションを設定します。例：

```xml
<configuration>
   ...
   <aptMode>stubs</aptMode>
</configuration>
```

### CLI

kapt は、Kotlin コンパイラのバイナリ配布物に含まれるスタンドアロンの CLI ツールとして利用可能です。

コマンドラインから kapt を実行するには、次のようにします：

```bash
kapt <options> <source files>
```

例：

```bash
kapt -Kapt-mode=stubsAndApt \
  -Kapt-sources=build/kapt/sources \
  -Kapt-classes=build/kapt/classes \
  -Kapt-stubs=build/kapt/stubs \
  -Kapt-classpath=lib/ap.jar \
  -Kapt-classpath=lib/anotherAp.jar \
  src/main/kotlin
```

* [kapt 固有のコンパイラオプション](#compiler-options) の全リストを参照してください。
* すべての有効な [Kotlin コンパイラオプション](compiler-reference.md) を渡すこともできます。それらを確認するには `kotlinc -help` を実行してください。

## アノテーションプロセッサの構成

kapt には、プロセッサのクラスパスの管理、共有構成からのプロセッサの継承、javac 固有のプロセッサのアクティブ維持など、アノテーションプロセッサの検出、編成、および実行を制御するためのオプションが用意されています。

アノテーションプロセッサや javac へのオプションの受け渡しなど、その他の構成オプションについては、[アノテーションプロセッサの構成](#annotation-processor-configuration) を参照してください。

### プロセッサのクラスパスと検出の設定

kapt のプロセッサパスに含まれていないアノテーションプロセッサの検出を無効にすることができます。これにより、不要なアノテーションプロセッサをコンパイルクラスパスから除外できます。

#### Gradle {id="classpath-discovery-gradle"}

Gradle は [コンパイル回避（compile avoidance）](https://docs.gradle.org/current/userguide/java_plugin.html#sec:java_compile_avoidance) を使用して、プロジェクトの再ビルド時にアノテーション処理をスキップし、kapt を使用したインクリメンタルビルドの時間を短縮します。特に、次の場合にアノテーション処理がスキップされます：

* プロジェクトのソースファイルが変更されていない場合。
* 依存関係の変更が [ABI](https://en.wikipedia.org/wiki/Application_binary_interface) 互換である場合。例えば、関数の本体のみが変更された場合。

ただし、コンパイルクラスパスで見つかったアノテーションプロセッサに対してはコンパイル回避を使用できません。それらの内部実装に変更があると、たとえプロセッサの ABI が変更されていなくても、アノテーション処理タスクを実行する必要があるためです。

そのため、コンパイルクラスパスからのアノテーションプロセッサの使用は推奨されません。これらのプロセッサを kapt の処理から除外するには、`gradle.properties` ファイルに `kapt.include.compile.classpath` プロパティを追加します：

```none
# gradle.properties
kapt.include.compile.classpath=false
```

このオプションを `false` に設定すると、プロセッサパス（`kapt*` 構成）に含まれていないアノテーションプロセッサの依存関係は、kapt の処理から除外されます。

#### Maven {id="classpath-discovery-maven"}

kapt のプロセッサパスに含まれていないアノテーションプロセッサを除外するには、kapt プラグインの `<execution>` セクションで `includeCompileClasspath` オプションを `false` に設定します：

```xml
<execution>
    <id>kapt</id>
    <goals>
        <goal>kapt</goal>
    </goals>
    <configuration>
        <includeCompileClasspath>false</includeCompileClasspath>
        <sourceDirs>...</sourceDirs>
        <annotationProcessorPaths>...</annotationProcessorPaths>
    </configuration>
</execution>
```

あるいは、`pom.xml` の `<properties>` セクションで `kapt.include.compile.classpath` プロパティを使用することもできます：

```xml
<properties>
    <kapt.include.compile.classpath>false</kapt.include.compile.classpath>
</properties>
```

このオプションを `false` に設定すると、`<annotationProcessorPaths>` セクションに含まれていないアノテーションプロセッサは kapt の処理から除外されます。

`includeCompileClasspath` オプションが設定されておらず、kapt がプロセッサパスで明示的に定義されていないアノテーションプロセッサをコンパイルクラスパス上で検出した場合、非推奨の警告が表示されます：

```none
[WARNING] Annotation processors discovery from compile classpath is deprecated.
Set 'kapt.include.compile.classpath=false' to disable discovery.
```

> kapt クラスパスに存在しないアノテーションプロセッサの一覧を確認するには、ビルドを `--info` ログレベルオプションを付けて実行してください。
>
{style="tip"}

### 親構成からのアノテーションプロセッサの継承

共通のアノテーションプロセッサのセットを別の Gradle 構成で親構成（superconfiguration）として定義し、それをサブプロジェクトの kapt 固有の構成でさらに拡張できます。

例として、[MapStruct](https://mapstruct.org/) を使用するサブプロジェクトの場合、`build.gradle(.kts)` ファイルで次の構成を使用します：

```kotlin
val commonAnnotationProcessors by configurations.creating
configurations.named("kapt") { extendsFrom(commonAnnotationProcessors) }

dependencies {
    implementation("org.mapstruct:mapstruct:1.6.3")
    commonAnnotationProcessors("org.mapstruct:mapstruct-processor:1.6.3")
}
```

この例では、`commonAnnotationProcessors` Gradle 構成は、すべてのプロジェクトで使用したいアノテーション処理用の共通親構成です。[`extendsFrom()`](https://docs.gradle.org/current/dsl/org.gradle.api.artifacts.Configuration.html#org.gradle.api.artifacts.Configuration:extendsFrom) メソッドを使用して、`commonAnnotationProcessors` を親構成として追加します。kapt は、`commonAnnotationProcessors` Gradle 構成が MapStruct アノテーションプロセッサに依存していることを認識します。そのため、kapt はアノテーション処理のための自身の構成に MapStruct アノテーションプロセッサを含めます。

### Java コンパイラのアノテーションプロセッサを保持する

デフォルトでは、kapt はすべてのアノテーションプロセッサを実行し、javac によるアノテーション処理を無効にします。
しかし、javac のアノテーションプロセッサの一部を動作させる必要がある場合があります（例えば [Lombok](https://projectlombok.org/) など）。

Gradle ビルドファイルで、`keepJavacAnnotationProcessors` オプションを使用します：

```groovy
kapt {
    keepJavacAnnotationProcessors = true
}
```

Maven を使用する場合は、プラグインを明示的に構成してください。
[Lombok コンパイラプラグインの設定例](lombok.md#using-with-kapt) を参照してください。

## kapt ビルドの最適化

kapt は、タスクの並列実行、ビルドキャッシュの活用、プロセッサクラスローダーのキャッシュ、インクリメンタルアノテーション処理の使用など、アノテーション処理時間を短縮するための Gradle 固有の戦略をいくつか提供しています。

エラー型の補正、スタブメタデータの削除、コンパイルクラスパスのスキャンなど、ビルドの動作に影響を与えるその他のオプションについては、[動作オプション](#behavioral-options) を参照してください。

### kapt タスクを並列で実行する

kapt は [Gradle Worker API](https://docs.gradle.org/current/userguide/worker_api.html) を使用してアノテーション処理タスクを実行します。Worker API を使用すると、Gradle は単一のプロジェクトから独立したアノテーション処理タスクを並列で実行でき、場合によっては実行時間を大幅に短縮できます。

Kotlin Gradle プラグインで [カスタム JDK バージョン](gradle-configure-project.md#gradle-java-toolchains-support) を設定する場合、kapt タスクのワーカーは [`processIsolation()`](https://docs.gradle.org/current/userguide/worker_api.html#step_3_change_the_isolation_mode) モードのみを使用します。

kapt ワーカープロセスに追加の JVM 引数を提供したい場合は、`KaptWithoutKotlincTask` の入力 `kaptProcessJvmArgs` を使用します：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.withType<org.jetbrains.kotlin.gradle.internal.KaptWithoutKotlincTask>()
    .configureEach {
        kaptProcessJvmArgs.add("-Xmx512m")
    }
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
tasks.withType(org.jetbrains.kotlin.gradle.internal.KaptWithoutKotlincTask.class)
    .configureEach {
        kaptProcessJvmArgs.add('-Xmx512m')
    }
```

</tab>
</tabs>

### Gradle ビルドキャッシュの安全な使用

Gradle は [デフォルトで](https://docs.gradle.org/current/userguide/build_cache_use_cases.html) kapt のアノテーション処理タスクをキャッシュします。
しかし、アノテーションプロセッサは任意のコードを実行できるため、タスクの入力を出力に不必要に変換したり、Gradle が追跡していないファイルにアクセスして変更したりする場合があります。

ビルドで使用されるアノテーションプロセッサを適切にキャッシュできない場合は、kapt タスクに対する誤ったキャッシュヒットを防ぐためにキャッシュを無効にできます。これを行うには、ビルドスクリプトで `useBuildCache` プロパティを使用します：

```groovy
kapt {
    useBuildCache = false
}
```

### アノテーションプロセッサのクラスローダーのキャッシュ

<primary-label ref="experimental-general"/>

アノテーションプロセッサのクラスローダーをキャッシュすることで、多くの Gradle タスクを連続して実行する場合に kapt のパフォーマンスが向上します。

この機能を有効にするには、`gradle.properties` ファイルで以下のプロパティを使用します：

```none
# gradle.properties
#
# 正の値を指定するとキャッシュが有効になります
# kapt を使用するモジュール数と同じ値を使用してください
kapt.classloaders.cache.size=5

# キャッシュを機能させるために false に設定します
kapt.include.compile.classpath=false
```

アノテーションプロセッサのキャッシュで問題が発生した場合は、それらのキャッシュを無効にしてください：

```none
# キャッシュを無効にするアノテーションプロセッサのフルネームを指定します
kapt.classloaders.cache.disableForProcessors=[annotation processors full names]
```

> この機能に関する問題が発生した場合は、[YouTrack](https://youtrack.jetbrains.com/issue/KT-28901) までフィードバックをお寄せください。
>
{style="note"}

### インクリメンタルアノテーション処理の使用

Gradle では、kapt はデフォルトでインクリメンタルアノテーション処理をサポートしており、変更されたファイルのみが再処理されます。

現在、インクリメンタルアノテーション処理が機能するのは、次の場合のみです：

* [インクリメンタルコンパイル](gradle-compilation-and-caches.md#incremental-compilation) が有効である。
* ビルド内のすべてのアノテーションプロセッサがインクリメンタルである。

インクリメンタルアノテーション処理を無効にするには、`gradle.properties` ファイルに次の行を追加します：

```none
kapt.incremental.apt=false
```

> 現在、Maven や CLI では kapt のインクリメンタルアノテーション処理はサポートされていません。
> 
{style="note"}

## パフォーマンスの分析

kapt には、プロセッサごとの実行時間レポートや、未使用のプロセッサを特定するための生成ファイル数など、アノテーション処理のパフォーマンスを把握するのに役立つ組み込みの診断機能が用意されています。

インクリメンタル処理をデバッグするためのファイル読み取り履歴やメモリリーク検出など、その他の診断オプションについては、[診断および統計オプション](#diagnostics-and-statistics-options) を参照してください。

### アノテーションプロセッサのパフォーマンス測定

アノテーションプロセッサの実行に関するパフォーマンス統計を取得するには、[`showProcessorStats`](#diagnostics-and-statistics-options) オプションを使用します。出力例：

```text
Kapt Annotation Processing performance report:
com.example.processor.TestingProcessor: total: 133 ms, init: 36 ms, 2 round(s): 97 ms, 0 ms
com.example.processor.AnotherProcessor: total: 100 ms, init: 6 ms, 1 round(s): 93 ms
```

このレポートは [`dumpProcessorStats`](#diagnostics-and-statistics-options) オプションを使用してファイルにダンプできます。
例えば、次の CLI コマンドは kapt を実行し、統計を `ap-perf-report.file` ファイルにダンプします：

```bash
kapt -Kapt-mode=stubsAndApt \
  -Kapt-classpath=processor/build/libs/processor.jar \
  -Kapt-dump-processor-stats=ap-perf-report.file \
  sample/src/main/
```

### 生成されたファイル数の追跡

kapt プラグインは、各アノテーションプロセッサによって生成されたファイル数に関する統計を報告できます。

これにより、未使用のアノテーションプロセッサがビルドに含まれていないかどうかを追跡できます。
生成されたレポートを使用して、不要なアノテーションプロセッサをトリガーしているモジュールを見つけ、それを回避するようにモジュールを更新できます。

統計レポートを有効にするには：

1. Gradle ビルドファイルで、`showProcessorStats` オプションを `true` に設定します：

   ```kotlin
   // build.gradle(.kts)
   kapt {
       showProcessorStats = true
   }
   ```

2. `gradle.properties` ファイルで、`verbose` コンパイラオプションを `true` に設定します：

   ```
   # gradle.properties
   kapt.verbose=true
   ```

統計は `info` レベルでログに表示されます。
`Annotation processor stats:` 行に続いて、各アノテーションプロセッサの実行時間に関する統計が表示されます。
それらの行の後に `Generated files report:` 行があり、各アノテーションプロセッサによって生成されたファイル数に関する統計が表示されます。例：

```text
[INFO] Annotation processor stats:
[INFO] org.mapstruct.ap.MappingProcessor: total: 290 ms, init: 1 ms, 3 round(s): 289 ms, 0 ms, 0 ms
[INFO] Generated files report:
[INFO] org.mapstruct.ap.MappingProcessor: total sources: 2, sources per round: 2, 0, 0
```

> 現在、Maven や CLI では `showProcessorStats` および `verbose` コンパイラオプションを使用した生成ファイル数の追跡はサポートされていません。
>
{style="note"}

## Kotlin ソースの生成

kapt は Kotlin ソースを生成できます。そのためには、生成された Kotlin ソースファイルを `processingEnv.options["kapt.kotlin.generated"]` を使用して指定されたディレクトリに書き込みます。生成された Kotlin ソースファイルは、メインソースと一緒にコンパイルされます。

> kapt は、生成された Kotlin ファイルに対して複数ラウンドのアノテーション処理をサポートしていません。
> 
{style="note"}

## コンパイラオプション

### アノテーションプロセッサの構成

<table>
    <tr>
        <td>オプション</td>
        <td>説明</td>
        <td>設定方法</td>
    </tr>
    <tr>
        <td><code>aptMode</code></td>
        <td>
            kapt ワークフローの各段階の実行を制御します：
            <list>
                <li><code>stubsAndApt</code>: スタブを生成し、アノテーション処理を実行します（デフォルト）</li>
                <li><code>stubs</code>: Kotlin から Java スタブのみを生成します</li>
                <li><code>apt</code>: アノテーション処理のみを実行します（スタブがすでに存在することを前提とします）</li>
            </list>
        </td>
        <td>
            <p><b>Gradle:</b> 直接利用できません。Gradle は stubs と apt を別々のタスクとして実行します</p>
            <p><b>Maven:</b></p>
                <code-block lang="xml">
                    <![CDATA[
<aptMode>stubsAndApt</aptMode>
                    ]]>
                </code-block>
            <p><b>CLI:</b> <code>-Kapt-mode=stubsAndApt</code></p>
        </td>
    </tr>
    <tr>
        <td><code>classpath</code></td>
        <td>アノテーションプロセッサが検出されるクラスパスエントリ。</td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    dependencies {
                        kapt("com.example:processor:1.0")
                    }
                </code-block>
            <p><b>Maven:</b></p>
                <code-block lang="xml">
                    <![CDATA[
<annotationProcessorPaths>
    <annotationProcessorPath>...</annotationProcessorPath>
</annotationProcessorPaths>
                    ]]>
                </code-block>
            <p><b>CLI:</b> <code>-Kapt-classpath=lib/my-processor.jar</code></p>
        </td>
    </tr>
    <tr>
        <td><code>processors</code></td>
        <td>検出をバイパスして実行するプロセッサの完全修飾クラス名をカンマ区切りで指定します。</td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        annotationProcessor("com.example.MyProcessor")
                    }
                </code-block>
            <p><b>Maven:</b></p>
                <code-block lang="xml">
                    <![CDATA[
<annotationProcessors>
    <annotationProcessor>com.example.MyProcessor</annotationProcessor>
</annotationProcessors>
                    ]]>
                </code-block>
            <p><b>CLI:</b> <code>-Kapt-processors=com.example.MyProcessor</code></p>
        </td>
    </tr>
    <tr>
        <td><code>apOption</code></td>
        <td>アノテーションプロセッサに渡されるキーと値のオプション。</td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        arguments {
                            arg("room.schemaLocation", "$projectDir/schemas")
                        }
                    }
                </code-block>
            <p><b>Maven:</b></p>
                <code-block lang="xml">
                    <![CDATA[
<annotationProcessorArgs>
    <annotationProcessorArg>room.schemaLocation=/schemas</annotationProcessorArg>
</annotationProcessorArgs>
                    ]]>
                </code-block>
            <p><b>CLI:</b> <code>-Kapt-options:room.schemaLocation=/schemas</code></p>
        </td>
    </tr>
    <tr>
        <td><code>javacOption</code></td>
        <td>Java コンパイラに渡されるキーと値のオプション。</td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        javacOptions {
                            option("-source", "11")
                        }
                    }
                </code-block>
            <p><b>Maven:</b></p>
                <code-block lang="xml">
                    <![CDATA[
<javacOptions>
    <javacOption>-source=11</javacOption>
</javacOptions>
                    ]]>
                </code-block>
            <p><b>CLI:</b> <code>-Kapt-javac-option:-source=11</code></p>
        </td>
    </tr>
    <tr>
        <td><code>processIncrementally</code></td>
        <td>インクリメンタルアノテーション処理を有効にします。変更の影響を受けるファイルのみを再処理します。</td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    # gradle.properties
                    kapt.incremental.apt=true
                </code-block>
            <p><b>Maven:</b> 現在サポートされていません</p>
            <p><b>CLI:</b> 現在サポートされていません</p>
        </td>
    </tr>
</table>

### 出力ディレクトリオプション

<table>
    <tr>
        <td>オプション</td>
        <td>説明</td>
        <td>設定方法</td>
    </tr>
    <tr>
        <td><code>sources</code></td>
        <td>アノテーションプロセッサが <code>.java</code> ソースファイルを生成するディレクトリ。</td>
        <td>
            <p><b>Gradle:</b> <code>build/generated/source/kapt/main</code> に自動的に設定されます</p>
            <p><b>Maven:</b> <code>target/generated-sources/kapt/</code> に自動的に設定されます</p>
            <p><b>CLI:</b> <code>-Kapt-sources=build/kapt/sources</code></p>
        </td>
    </tr>
    <tr>
        <td><code>classes</code></td>
        <td>生成されたソースからコンパイルされた <code>.class</code> ファイルのディレクトリ。</td>
        <td>
            <p><b>Gradle:</b> 自動的に管理されます</p>
            <p><b>Maven:</b> 自動的に管理されます</p>
            <p><b>CLI:</b> <code>-Kapt-classes=build/kapt/classes</code></p>
        </td>
    </tr>
    <tr>
        <td><code>stubs</code></td>
        <td>アノテーションプロセッサの入力として使用される、Kotlin ソースから生成された Java スタブファイルのディレクトリ。</td>
        <td>
            <p><b>Gradle:</b> 自動的に管理されます</p>
            <p><b>Maven:</b> 自動的に管理されます</p>
            <p><b>CLI:</b> <code>-Kapt-stubs=build/kapt/stubs</code></p>
        </td>
    </tr>
    <tr>
        <td><code>incrementalData</code></td>
        <td>インクリメンタルビルドの状態を保存します。</td>
        <td>
            <p><b>Gradle:</b> 自動的に管理されます</p>
            <p><b>Maven:</b> 現在サポートされていません</p>
            <p><b>CLI:</b> 現在サポートされていません</p>
        </td>
    </tr>
</table>

### 動作オプション

<table>
    <tr>
        <td>オプション</td>
        <td>説明</td>
        <td>設定方法</td>
    </tr>
    <tr>
        <td><code>correctErrorTypes</code></td>
        <td>
            デフォルトでは、kapt はすべての未知の型（生成されたクラスの型を含む）を <code>NonExistentClass</code> に置き換えます。
            スタブ内でのエラー型の推論を有効にして、未解決のエラー型を生成されたソースからの型に置き換えることができます。
            <p>デフォルトは <code>false</code> です</p>
        </td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        correctErrorTypes = true
                    }
                </code-block>
            <p><b>Maven:</b></p>
                <code-block lang="xml">
                    <![CDATA[
<correctErrorTypes>true</correctErrorTypes>
                    ]]>
                </code-block>
            <p><b>CLI:</b> <code>-Kapt-correct-error-types=true</code></p>
        </td>
    </tr>
    <tr>
        <td><code>dumpDefaultParameterValues</code></td>
        <td>
            生成されたスタブにフィールド値としてデフォルトパラメータの初期化子を含めます。
            <p>デフォルトは <code>false</code> です</p>
        </td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        dumpDefaultParameterValues = true
                    }
                </code-block>
            <p><b>Maven:</b> 利用できません</p>
            <p><b>CLI:</b> <code>-Kapt-dump-default-parameter-values=true</code></p>
        </td>
    </tr>
    <tr>
        <td><code>mapDiagnosticLocations</code></td>
        <td>
            スタブファイルからのエラーメッセージを、元の Kotlin ソースの場所にマッピングし直します。
            <p>デフォルトは <code>false</code> です</p>
        </td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        mapDiagnosticLocations = true
                    }
                </code-block>
            <p><b>Maven:</b></p>
                <code-block lang="xml">
                    <![CDATA[
<mapDiagnosticLocations>true</mapDiagnosticLocations>
                    ]]>
                </code-block>
            <p><b>CLI:</b> <code>-Kapt-map-diagnostic-locations=true</code></p>
        </td>
    </tr>
    <tr>
        <td><code>strict</code></td>
        <td>
            スタブ生成の非互換性を、警告ではなくエラーとして扱います。
            <p>デフォルトは <code>false</code> です</p>
        </td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        strictMode = true
                    }
                </code-block>
            <p><b>Maven:</b> 利用できません</p>
            <p><b>CLI:</b> <code>-Kapt-strict=true</code></p>
        </td>
    </tr>
    <tr>
        <td><code>stripMetadata</code></td>
        <td>
            生成されたスタブから <code>@kotlin.Metadata</code> アノテーションを削除し、スタブのサイズを縮小してプロセッサから Kotlin 固有の情報を隠します。
            <p>デフォルトは <code>false</code> です</p>
        </td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        stripMetadata = true
                    }
                </code-block>
            <p><b>Maven:</b> 利用できません</p>
            <p><b>CLI:</b> <code>-Kapt-strip-metadata=true</code></p>
        </td>
    </tr>
    <tr>
        <td><code>verbose</code></td>
        <td>
            kapt の詳細ログを有効にします。
            <p>デフォルトは <code>false</code> です</p>
        </td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    # gradle.properties
                    kapt.verbose=true
                </code-block>
            <p><b>Maven:</b> 現在サポートされていません</p>
            <p><b>CLI:</b> 現在サポートされていません</p>
        </td>
    </tr>
    <tr>
        <td><code>infoAsWarnings</code></td>
        <td>
            情報（info）レベルの kapt メッセージを警告（warning）に昇格させます。
            <p>デフォルトは <code>false</code> です</p>
        </td>
        <td>
            <p><b>Gradle:</b> 直接利用できません</p>
            <p><b>Maven:</b> 現在サポートされていません</p>
            <p><b>CLI:</b> 現在サポートされていません</p>
        </td>
    </tr>
    <tr>
        <td><code>includeCompileClasspath</code></td>
        <td>
            コンパイルクラスパスをスキャンしてアノテーションプロセッサを探します。再現性のために <code>false</code> に設定することをお勧めします。
            <p>デフォルトは <code>true</code> です</p>
        </td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        includeCompileClasspath = false
                    }
                </code-block>
            <p><b>Maven:</b></p>
                <code-block lang="xml">
                    <![CDATA[
<includeCompileClasspath>false</includeCompileClasspath>
                    ]]>
                </code-block>
            <p><b>CLI:</b> 現在サポートされていません</p>
        </td>
    </tr>
</table>

### 診断および統計オプション

<table>
    <tr>
        <td>オプション</td>
        <td>説明</td>
        <td>設定方法</td>
    </tr>
    <tr>
        <td><code>showProcessorStats</code></td>
        <td>プロセッサごとの実行時間を標準出力（stdout）に印刷します。</td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        showProcessorStats = true
                    }
                </code-block>
            <p><b>Maven:</b> 利用できません</p>
            <p><b>CLI:</b> <code>-Kapt-show-processor-stats=true</code></p>
        </td>
    </tr>
    <tr>
        <td><code>dumpProcessorStats</code></td>
        <td>プロセッサのタイミング統計をファイルに書き込みます。</td>
        <td>
            <p><b>Gradle:</b> 利用できません</p>
            <p><b>Maven:</b> 利用できません</p>
            <p><b>CLI:</b> <code>-Kapt-dump-processor-stats=build/kapt-stats.txt</code></p>
        </td>
    </tr>
    <tr>
        <td><code>dumpFileReadHistory</code></td>
        <td>プロセッサによって読み取られたファイルのリストをファイルに書き込みます。インクリメンタルアノテーションプロセッサのデバッグに役立ちます。</td>
        <td>
            <p><b>Gradle:</b> 利用できません</p>
            <p><b>Maven:</b> 利用できません</p>
            <p><b>CLI:</b> <code>-Kapt-dump-file-read-history=build/kapt-reads.txt</code></p>
        </td>
    </tr>
    <tr>
        <td><code>detectMemoryLeaks</code></td>
        <td>メモリリーク検出モード：<code>none</code>、<code>default</code>、または <code>paranoid</code>。</td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        detectMemoryLeaks = "paranoid"
                    }
                </code-block>
            <p><b>Maven:</b> 現在サポートされていません</p>
            <p><b>CLI:</b> 現在サポートされていません</p>
        </td>
    </tr>
</table>

## 次のステップ

* [MapStruct アノテーションプロセッサで kapt を使用する](jvm-annotation-processors.md#use-kapt-with-java-annotation-processors)
* [kapt から KSP への移行方法を確認する](ksp-kapt-migration.md)