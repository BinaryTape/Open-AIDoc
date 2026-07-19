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

##### kapt アノテーション処理の設定

アノテーション処理のモードを設定するには、`<configuration>` ブロックで `<aptMode>` オプションを設定します：

* `stubs` – アノテーション処理に必要なスタブのみを生成します。
* `apt` – アノテーション処理のみを実行します。
* `stubsAndApt` – (デフォルト) スタブを生成し、アノテーション処理を実行します。

例：

```xml
<configuration>
   ...
   <aptMode>stubs</aptMode>
</configuration>
```

### CLI

kapt コンパイラプラグインは、Kotlin コンパイラのバイナリ配布物に含まれています。

Kotlin コンパイラの `-Xplugin` オプションを使用して JAR ファイルへのパスを指定することで、プラグインをアタッチできます：

```bash
-Xplugin=$KOTLIN_HOME/lib/kotlin-annotation-processing.jar
```

利用可能なオプションの一覧は次のとおりです：

* `sources` (*必須*): 生成されたファイルの出力パス。
* `classes` (*必須*): 生成されたクラスファイルとリソースの出力パス。
* `stubs` (*必須*): スタブファイルの一時出力パス。
* `incrementalData`: バイナリスタブの出力パス。
* `apclasspath` (*繰り返し可能*): アノテーションプロセッサ JAR へのパス。JAR ごとに `apclasspath` オプションを 1 つずつ渡します。
* `apoptions`: アノテーションプロセッサオプションの Base64 エンコードされたリスト。詳細は [AP/javac オプションのエンコーディング](#ap-javac-options-encoding) を参照してください。
* `javacArguments`: javac に渡されるオプションの Base64 エンコードされたリスト。詳細は [AP/javac オプションのエンコーディング](#ap-javac-options-encoding) を参照してください。
* `processors`: アノテーションプロセッサの完全修飾クラス名のカンマ区切りリスト。指定された場合、kapt は `apclasspath` 内のアノテーションプロセッサを検索しません。
* `verbose`: 詳細な出力を有効にします。
* `aptMode` (*必須*)
    * `stubs` – アノテーション処理に必要なスタブのみを生成します。
    * `apt` – アノテーション処理のみを実行します。
    * `stubsAndApt` – スタブを生成し、アノテーション処理を実行します。
* `correctErrorTypes`: 詳細は [存在しない型の補正](#non-existent-type-correction) を参照してください。デフォルトでは無効です。
* `dumpFileReadHistory`: アノテーション処理中に使用されたクラスのリストをファイルごとにダンプする出力パス。

プラグインオプションの形式は `-P plugin:<plugin id>:<key>=<value>` です。オプションは繰り返すことができます。

例：

```bash
-P plugin:org.jetbrains.kotlin.kapt3:sources=build/kapt/sources
-P plugin:org.jetbrains.kotlin.kapt3:classes=build/kapt/classes
-P plugin:org.jetbrains.kotlin.kapt3:stubs=build/kapt/stubs

-P plugin:org.jetbrains.kotlin.kapt3:apclasspath=lib/ap.jar
-P plugin:org.jetbrains.kotlin.kapt3:apclasspath=lib/anotherAp.jar

-P plugin:org.jetbrains.kotlin.kapt3:correctErrorTypes=true
```

## アノテーションプロセッサの構成

### アノテーションプロセッサに引数を渡す

ビルドスクリプトファイル `build.gradle(.kts)` の `arguments {}` ブロックを使用して、アノテーションプロセッサに引数を渡します：

```kotlin
kapt {
    arguments {
        arg("key", "value")
    }
}
```

### プロセッサのクラスパスと検出の設定

kapt のプロセッサパスに含まれていないアノテーションプロセッサの検出（discovery）を無効にすることができます。これにより、不要なアノテーションプロセッサをコンパイルクラスパスから除外できます。

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

`includeCompileClasspath` オプションが設定されておらず、kapt がプロセッサパスで明示的に定義されていないアノテーションプロセッサをコンパイルクラスパス上で検出した場合、非推奨の警告（deprecation warning）が表示されます：

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
[Lombok コンパイラプラグインの設定例](lombok.md#using-with-kapt)を参照してください。

## kapt ビルドの最適化

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

kapt はデフォルトでインクリメンタルアノテーション処理をサポートしています。

現在、インクリメンタルアノテーション処理が機能するのは、次の場合のみです：

* [インクリメンタルコンパイル](gradle-compilation-and-caches.md#incremental-compilation) が有効である。
* ビルド内のすべてのアノテーションプロセッサがインクリメンタルである。

インクリメンタルアノテーション処理を無効にするには、`gradle.properties` ファイルに次の行を追加します：

```none
kapt.incremental.apt=false
```

## パフォーマンスの分析

### アノテーションプロセッサのパフォーマンス測定

アノテーションプロセッサの実行に関するパフォーマンス統計を取得するには、`-Kapt-show-processor-timings` プラグインオプションを使用します。
出力例：

```text
Kapt Annotation Processing performance report:
com.example.processor.TestingProcessor: total: 133 ms, init: 36 ms, 2 round(s): 97 ms, 0 ms
com.example.processor.AnotherProcessor: total: 100 ms, init: 6 ms, 1 round(s): 93 ms
```

このレポートは、プラグインオプション [`-Kapt-dump-processor-timings` (`org.jetbrains.kotlin.kapt3:dumpProcessorTimings`)](https://github.com/JetBrains/kotlin/pull/4280) を使用してファイルにダンプできます。
次のコマンドは、kapt を実行し、統計を `ap-perf-report.file` ファイルにダンプします：

```bash
kotlinc -cp $MY_CLASSPATH \
-Xplugin=kotlin-annotation-processing-SNAPSHOT.jar -P \
plugin:org.jetbrains.kotlin.kapt3:aptMode=stubsAndApt,\
plugin:org.jetbrains.kotlin.kapt3:apclasspath=processor/build/libs/processor.jar,\
plugin:org.jetbrains.kotlin.kapt3:dumpProcessorTimings=ap-perf-report.file \
-Xplugin=$JAVA_HOME/lib/tools.jar \
-d cli-tests/out \
-no-jdk -no-reflect -no-stdlib -verbose \
sample/src/main/
```

### 生成されたファイル数の追跡

`kapt` Gradle プラグインは、各アノテーションプロセッサによって生成されたファイル数に関する統計を報告できます。

これにより、未使用のアノテーションプロセッサがビルドに含まれていないかどうかを追跡できます。
生成されたレポートを使用して、不要なアノテーションプロセッサをトリガーしているモジュールを見つけ、それを回避するようにモジュールを更新できます。

統計レポートを有効にするには：

1. `build.gradle(.kts)` で `showProcessorStats` プロパティの値を `true` に設定します：

   ```kotlin
   // build.gradle.kts
   kapt {
       showProcessorStats = true
   }
   ```

2. `gradle.properties` で `kapt.verbose` Gradle プロパティを `true` に設定します：

   ```none
   # gradle.properties
   kapt.verbose=true
   ```

> [コマンドラインオプション `verbose`](#cli) を使用して詳細な出力を有効にすることもできます。
>
{style="note"}

統計は `info` レベルでログに表示されます。
`Annotation processor stats:` 行に続いて、各アノテーションプロセッサの実行時間に関する統計が表示されます。
それらの行の後に `Generated files report:` 行があり、各アノテーションプロセッサによって生成されたファイル数に関する統計が表示されます。例：

```text
[INFO] Annotation processor stats:
[INFO] org.mapstruct.ap.MappingProcessor: total: 290 ms, init: 1 ms, 3 round(s): 289 ms, 0 ms, 0 ms
[INFO] Generated files report:
[INFO] org.mapstruct.ap.MappingProcessor: total sources: 2, sources per round: 2, 0, 0
```

## Java コンパイラオプション

kapt はアノテーションプロセッサの実行に Java コンパイラを使用します。
javac に任意のオプションを渡す方法は次のとおりです：

```groovy
kapt {
    javacOptions {
        // アノテーションプロセッサからのエラーの最大数を増やす。
        // デフォルトは 100。
        option("-Xmaxerrs", 500)
    }
}
```

## 存在しない型の補正

一部のアノテーションプロセッサ（`AutoFactory` など）は、宣言シグネチャ内の正確な型に依存します。
デフォルトでは、kapt は未知の型（生成されたクラスの型を含む）をすべて `NonExistentClass` に置き換えますが、この動作を変更できます。スタブ内でのエラー型の推論を有効にするには、`build.gradle(.kts)` ファイルにオプションを追加します：

```groovy
kapt {
    correctErrorTypes = true
}
```

## Kotlin ソースの生成

kapt は Kotlin ソースを生成できます。生成された Kotlin ソースファイルを `processingEnv.options["kapt.kotlin.generated"]` で指定されたディレクトリに書き込むだけで、これらのファイルはメインソースと一緒にコンパイルされます。

kapt は、生成された Kotlin ファイルに対して複数ラウンドの処理をサポートしていないことに注意してください。

## AP/Javac オプションのエンコーディング

`apoptions` および `javacArguments` CLI オプションは、エンコードされたオプションのマップを受け取ります。
自分でオプションをエンコードする方法は次のとおりです：

```kotlin
fun encodeList(options: Map<String, String>): String {
    val os = ByteArrayOutputStream()
    val oos = ObjectOutputStream(os)

    oos.writeInt(options.size)
    for ((key, value) in options.entries) {
        oos.writeUTF(key)
        oos.writeUTF(value)
    }

    oos.flush()
    return Base64.getEncoder().encodeToString(os.toByteArray())
}
```

## 次のステップ

* [kapt から KSP への移行方法を確認する](ksp-kapt-migration.md)