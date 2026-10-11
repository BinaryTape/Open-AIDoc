[//]: # (title: Kotlin Gradleプラグインにおけるコンパイルとキャッシュ)

このページでは、以下のトピックについて学ぶことができます。
* [インクリメンタルコンパイル](#incremental-compilation)
* [Gradleビルドキャッシュのサポート](#gradle-build-cache-support)
* [Gradleコンフィグレーションキャッシュのサポート](#gradle-configuration-cache-support)
* [KotlinデーモンとGradleでの使用方法](#the-kotlin-daemon-and-how-to-use-it-with-gradle)
* [以前のコンパイラへのロールバック](#rolling-back-to-the-previous-compiler)
* [Kotlinコンパイラ実行戦略の定義](compiler-execution-strategy.md)
* [Kotlinコンパイラのフォールバック戦略](compiler-execution-strategy.md#fallback-strategy)
* [最新の言語バージョンの試用](#trying-the-latest-language-version)
* [ビルドレポート](#build-reports)

## インクリメンタルコンパイル {id="incremental-compilation"}

Kotlin Gradleプラグインはインクリメンタルコンパイル（増分コンパイル）をサポートしており、Kotlin/JVMおよびKotlin/JSプロジェクトではデフォルトで有効になっています。
インクリメンタルコンパイルはビルド間でクラスパス内のファイルへの変更を追跡し、これらの変更によって影響を受けるファイルのみが
コンパイルされるようにします。
このアプローチは[Gradleのビルドキャッシュ](#gradle-build-cache-support)と連携し、[コンパイル回避（compilation avoidance）](https://docs.gradle.org/current/userguide/java_plugin.html#sec:java_compile_avoidance)をサポートします。

Kotlin/JVMの場合、インクリメンタルコンパイルはクラスパスのスナップショットに依存しており、
モジュールのAPI構造をキャプチャして再コンパイルが必要なタイミングを判断します。
パイプライン全体を最適化するために、Kotlinコンパイラは2種類のクラスパススナップショットを使用します。

* **きめ細かなスナップショット（Fine-grained snapshots）:** プロパティや関数などのクラスメンバーに関する詳細情報を含みます。
メンバーレベルの変更が検出されると、Kotlinコンパイラは変更されたメンバーに依存するクラスのみを再コンパイルします。
パフォーマンスを維持するため、Kotlin GradleプラグインはGradleキャッシュ内の`.jar`ファイルに対して粗粒度のスナップショットを作成します。
* **粗粒度のスナップショット（Coarse-grained snapshots）:** クラスの[ABI](https://en.wikipedia.org/wiki/Application_binary_interface)ハッシュのみを含みます。
ABIの一部が変更されると、Kotlinコンパイラは変更されたクラスに依存するすべてのクラスを再コンパイルします。
これは、外部ライブラリのように頻繁に変更されないクラスに役立ちます。

> Kotlin/JSプロジェクトでは、履歴ファイルに基づいた異なるインクリメンタルコンパイルアプローチが使用されます。
>
{style="note"}

インクリメンタルコンパイルを無効にする方法はいくつかあります。

* Kotlin/JVMの場合は`kotlin.incremental=false`を設定します。
* Kotlin/JSプロジェクトの場合は`kotlin.incremental.js=false`を設定します。
* コマンドラインパラメータとして`-Pkotlin.incremental=false`または`-Pkotlin.incremental.js=false`を使用します。

  このパラメータは、それ以降の各ビルドに追加する必要があります。

インクリメンタルコンパイルを無効にすると、ビルド後に増分キャッシュが無効になります。最初のビルドは決して増分（インクリメンタル）にはなりません。

> インクリメンタルコンパイルの問題は、障害が発生してから数回のビルドが経過した後に顕在化することがあります。[ビルドレポート](#build-reports)
> を使用して変更とコンパイルの履歴を追跡してください。これにより、再現性のあるバグレポートを提供するのに役立ちます。
>
{style="tip"}

現在のインクリメンタルコンパイルのアプローチがどのように機能し、以前のアプローチとどう異なるかについての詳細は、
[ブログ記事](https://blog.jetbrains.com/kotlin/2022/07/a-new-approach-to-incremental-compilation-in-kotlin/)を参照してください。

## Gradleビルドキャッシュのサポート {id="gradle-build-cache-support"}

Kotlinプラグインは、将来のビルドで再利用するためにビルド出力を保存する[Gradleビルドキャッシュ](https://docs.gradle.org/current/userguide/build_cache.html)を使用します。

すべてのKotlinタスクでキャッシュを無効にするには、システムプロパティ`kotlin.caching.enabled`を`false`に設定します
（`-Dkotlin.caching.enabled=false`の引数を指定してビルドを実行します）。

## Gradleコンフィグレーションキャッシュのサポート {id="gradle-configuration-cache-support"}

Kotlinプラグインは、設定フェーズの結果を後続のビルドで再利用することでビルドプロセスを高速化する[Gradleコンフィグレーションキャッシュ](https://docs.gradle.org/current/userguide/configuration_cache.html)を使用します。

コンフィグレーションキャッシュを有効にする方法については、[Gradleドキュメント](https://docs.gradle.org/current/userguide/configuration_cache.html#config_cache:usage)
を参照してください。この機能を有効にすると、Kotlin Gradleプラグインは自動的にこれを使用し始めます。

## KotlinデーモンとGradleでの使用方法 {id="the-kotlin-daemon-and-how-to-use-it-with-gradle"}

[Kotlinデーモン](kotlin-daemon.md):
* Gradleデーモンと一緒に実行され、プロジェクトをコンパイルします。
* IntelliJ IDEA組み込みのビルドシステムでプロジェクトをコンパイルする場合、Gradleデーモンとは別に実行されます。

Kotlinデーモンは、Kotlinコンパイルタスクの1つがソースのコンパイルを開始した際、Gradleの[実行フェーズ](https://docs.gradle.org/current/userguide/build_lifecycle.html#sec:build_phases)
で起動します。
Kotlinデーモンは、Gradleデーモンが停止したとき、またはKotlinのコンパイルが行われないままアイドル状態が2時間続いたときのいずれかで停止します。

Kotlinデーモンは、Gradleデーモンと同じJDKを使用します。

### KotlinデーモンのJVM引数の設定 {id="setting-kotlin-daemon-s-jvm-arguments"}

引数を設定する以下の各方法は、前に指定されたものを上書きします。
* [Gradleデーモン引数の継承](#gradle-daemon-arguments-inheritance)
* [`kotlin.daemon.jvm.options`システムプロパティ](#kotlin-daemon-jvm-options-system-property)
* [`kotlin.daemon.jvmargs`プロパティ](#kotlin-daemon-jvmargs-property)
* [`kotlin`拡張](#kotlin-extension)
* [特定のタスク定義](#specific-task-definition)

#### Gradleデーモン引数の継承 {id="gradle-daemon-arguments-inheritance"}

デフォルトでは、KotlinデーモンはGradleデーモンから特定の引数セットを継承しますが、Kotlinデーモンに直接指定されたJVM引数があればそれらで上書きします。たとえば、`gradle.properties`ファイルに以下のJVM引数を追加した場合:

```none
org.gradle.jvmargs=-Xmx1500m -Xms500m -XX:MaxMetaspaceSize=1g
```

これらの引数は、KotlinデーモンのJVM引数に追加されます。

```none
-Xmx1500m -XX:ReservedCodeCacheSize=320m -XX:MaxMetaspaceSize=1g -XX:UseParallelGC -ea -XX:+UseCodeCacheFlushing -XX:+HeapDumpOnOutOfMemoryError -Djava.awt.headless=true -Djava.rmi.server.hostname=127.0.0.1 --add-exports=java.base/sun.nio.ch=ALL-UNNAMED
```

> JVM引数に関するKotlinデーモンのデフォルト動作の詳細については、[JVM引数に関するKotlinデーモンの動作](#kotlin-daemon-s-behavior-with-jvm-arguments)を参照してください。
>
{style="note"}

#### kotlin.daemon.jvm.optionsシステムプロパティ {id="kotlin-daemon-jvm-options-system-property"}

GradleデーモンのJVM引数に`kotlin.daemon.jvm.options`システムプロパティが含まれている場合は、`gradle.properties`ファイルでそれを使用します。

```none
org.gradle.jvmargs=-Dkotlin.daemon.jvm.options=-Xmx1500m,Xms500m
```

引数を渡す際は、以下のルールに従ってください。
* マイナス記号`-`は、`Xmx`、`XX:MaxMetaspaceSize`、および`XX:ReservedCodeCacheSize`の引数の前に**のみ**使用してください。
* 引数はスペースを含め**ずに**カンマ（`,`）で区切ってください。スペースの後にある引数は、KotlinデーモンではなくGradleデーモン用に使用されます。

> 以下の条件がすべて満たされる場合、Gradleはこれらのプロパティを無視します。
> * GradleがJDK 1.9以上を使用している。
> * Gradleのバージョンが7.0以上7.1.1以下である。
> * GradleがKotlin DSLスクリプトをコンパイルしている。
> * Kotlinデーモンが実行されていない。
>
> これを解決するには、Gradleをバージョン7.2（またはそれ以上）にアップグレードするか、`kotlin.daemon.jvmargs`プロパティを使用してください（次のセクションを参照）。
>
{style="warning"}

#### kotlin.daemon.jvmargsプロパティ {id="kotlin-daemon-jvmargs-property"}

`gradle.properties`ファイルに`kotlin.daemon.jvmargs`プロパティを追加できます。

```none
kotlin.daemon.jvmargs=-Xmx1500m -Xms500m
```

ここで、またはGradleのJVM引数で`ReservedCodeCacheSize`引数を指定しない場合、Kotlin Gradleプラグインはデフォルト値の`320m`を適用することに注意してください。

```none
-Xmx1500m -XX:ReservedCodeCacheSize=320m -Xms500m
```

#### kotlin拡張 {id="kotlin-extension"}

`kotlin`拡張で引数を指定できます。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    kotlinDaemonJvmArgs = listOf("-Xmx486m", "-Xms256m", "-XX:+UseParallelGC")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    kotlinDaemonJvmArgs = ["-Xmx486m", "-Xms256m", "-XX:+UseParallelGC"]
}
```

</tab>
</tabs>

#### 特定のタスク定義 {id="specific-task-definition"}

特定のタスクに対して引数を指定できます。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.withType<CompileUsingKotlinDaemon>().configureEach {
    kotlinDaemonJvmArguments.set(listOf("-Xmx486m", "-Xms256m", "-XX:+UseParallelGC"))
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
tasks.withType(CompileUsingKotlinDaemon).configureEach { task ->
    task.kotlinDaemonJvmArguments = ["-Xmx1g", "-Xms512m"]
}
```

</tab>
</tabs>

> この場合、タスクの実行時に新しいKotlinデーモンインスタンスが起動する可能性があります。詳細については、[JVM引数に関するKotlinデーモンの動作](#kotlin-daemon-s-behavior-with-jvm-arguments)を参照してください。
>
{style="note"}

### JVM引数に関するKotlinデーモンの動作 {id="kotlin-daemon-s-behavior-with-jvm-arguments"}

KotlinデーモンのJVM引数を設定する際は、以下の点に注意してください。

* 異なるサブプロジェクトやタスクが異なるJVM引数セットを持っている場合、複数のKotlinデーモンインスタンスが同時に実行されることが想定されています。
* 新しいKotlinデーモンインスタンスは、Gradleが関連するコンパイルタスクを実行し、既存のKotlinデーモンが同じJVM引数セットを持っていない場合にのみ起動します。
  たとえば、プロジェクトに多数のサブプロジェクトがあるとします。その大半はKotlinデーモンにある程度のヒープメモリしか必要としませんが、1つのモジュールだけが（滅多にコンパイルされないものの）大量のヒープメモリを必要とします。
  このような場合は、そのモジュールに異なるJVM引数セットを提供することで、この特定のモジュールを触る開発者に対してのみ、より大きなヒープサイズを持つKotlinデーモンが起動するようにできます。
  > コンパイルリクエストを処理するのに十分なヒープサイズを持つKotlinデーモンがすでに実行されている場合、
  > 要求された他のJVM引数が異なっていても、新しいデーモンを起動せずにそのデーモンが再利用されます。
  >
  {style="note"}

以下の引数が指定されていない場合、KotlinデーモンはGradleデーモンからそれらを継承します。

* `-Xmx`
* `-XX:MaxMetaspaceSize`
* `-XX:ReservedCodeCacheSize`。指定も継承もされていない場合、デフォルト値は`320m`です。

Kotlinデーモンには、以下のデフォルトJVM引数があります。
* `-XX:UseParallelGC`。この引数は、他のガベージコレクタが指定されていない場合にのみ適用されます。
* `-ea`
* `-XX:+UseCodeCacheFlushing`
* `-Djava.awt.headless=true`
* `-D{java.servername.property}={localhostip}`
* `--add-exports=java.base/sun.nio.ch=ALL-UNNAMED`。この引数はJDKバージョン16以降にのみ適用されます。

> KotlinデーモンのデフォルトJVM引数のリストはバージョンによって異なる場合があります。[VisualVM](https://visualvm.github.io/)などのツールを使用して、Kotlinデーモンのような実行中のJVMプロセスの実際の設定を確認できます。
>
{style="note"}

## 以前のコンパイラへのロールバック {id="rolling-back-to-the-previous-compiler"}

Kotlin 2.0.0以降、K2コンパイラがデフォルトで使用されます。

Kotlin 2.0.0～2.3.21で以前のコンパイラを使用するには、以下のいずれかを行います。

* `build.gradle.kts`ファイルで、[言語バージョンを1.9に設定](gradle-compiler-options.md#example-of-setting-languageversion)します。

  または
* コンパイラオプション`-language-version 1.9`を使用します。

Kotlin 2.4.0以降は、以前のコンパイラにロールバックすることはできません。

K2コンパイラの利点についての詳細は、[K2コンパイラ移行ガイド](k2-compiler-migration-guide.md)を参照してください。

## 最新の言語バージョンの試用 {id="trying-the-latest-language-version"}

Kotlin 2.0.0以降では、最新の言語バージョンを試すために、`gradle.properties`ファイルで`kotlin.experimental.tryNext`プロパティを設定します。
このプロパティを使用すると、Kotlin Gradleプラグインは言語バージョンをお使いのKotlinバージョンのデフォルト値より1つ上のバージョンに引き上げます。
たとえばKotlin 2.0.0では、デフォルトの言語バージョンは2.0であるため、このプロパティによって言語バージョン2.1が設定されます。

あるいは、以下のコマンドを実行することもできます。

```shell
./gradlew assemble -Pkotlin.experimental.tryNext=true
``` 

[ビルドレポート](#build-reports)では、各タスクのコンパイルに使用された言語バージョンを確認できます。

## ビルドレポート {id="build-reports"}

ビルドレポートには、各コンパイルフェーズの所要時間や、コンパイルが増分（インクリメンタル）にならなかった理由が含まれます。
コンパイル時間が長すぎる場合や、同じプロジェクトでコンパイル時間が変動する場合のパフォーマンス問題の調査にビルドレポートを活用してください。

Kotlinビルドレポートは、個々のGradleタスクを粒度単位とする[Gradle build scans](https://scans.gradle.com/)よりも効率的に、ビルドパフォーマンスの問題を調査するのに役立ちます。

コンパイル時間が長い場合に、ビルドレポートを分析することで解決できる一般的なケースが2つあります。
* ビルドがインクリメンタルでなかった場合。理由を分析し、根本的な問題を修正します。
* ビルドはインクリメンタルだったが時間がかかりすぎた場合。ソースファイルを再編成してみてください（大きなファイルを分割する、個別のクラスを別々のファイルに保存する、大きなクラスをリファクタリングする、トップレベル関数を別々のファイルで宣言するなど）。

ビルドレポートには、プロジェクトで使用されているKotlinバージョンも表示されます。さらに、Kotlin 1.9.0以降では、
コードのコンパイルにどのコンパイラが使用されたかを[Gradle build scans](https://scans.gradle.com/)で確認できます。

[ビルドレポートの読み方](https://blog.jetbrains.com/kotlin/2022/06/introducing-kotlin-build-reports/#how_to_read_build_reports)
および[JetBrainsでのビルドレポートの活用方法](https://blog.jetbrains.com/kotlin/2022/06/introducing-kotlin-build-reports/#how_we_use_build_reports_in_jetbrains)について学ぶことができます。

### ビルドレポートの有効化 {id="enabling-build-reports"}

ビルドレポートを有効にするには、`gradle.properties`でビルドレポートの出力先を宣言します。

```none
kotlin.build.report.output=file
```

出力には以下の値およびその組み合わせを使用できます。

| オプション        | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
|---------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `file`        | 人間が読める形式でローカルファイルにビルドレポートを保存します。デフォルトは`${project_folder}/build/reports/kotlin-build/${project_name}-timestamp.txt`です。                                                                                                                                                                                                                                                                                                                                             |
| `single_file` | 指定したローカルファイルにオブジェクト形式でビルドレポートを保存します。                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `build_scan`  | [ビルドスキャン（build scan）](https://scans.gradle.com/)の`custom values`セクションにビルドレポートを保存します。Gradle Enterpriseプラグインにはカスタム値の数と長さに制限があることに注意してください。大規模なプロジェクトでは、一部の値が失われる可能性があります。                                                                                                                                                                                                                                                                |
| `http`        | HTTP(S)を使用してビルドレポートを送信します。POSTメソッドはJSON形式でメトリクスを送信します。送信されるデータの現在のバージョンは、[Kotlinリポジトリ](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-plugin/src/common/kotlin/org/jetbrains/kotlin/gradle/report/data/GradleCompileStatisticsData.kt)で確認できます。HTTPエンドポイントのサンプルは[こちらのブログ記事](https://blog.jetbrains.com/kotlin/2022/06/introducing-kotlin-build-reports/#enable_build_reports)にあります。 |
| `json`        | JSON形式でローカルファイルにビルドレポートを保存します。デフォルトは`${project_folder}/build/reports/kotlin-build/${project_name}-build-<date-time>-<index>.json`です。                                                                                                                                                                                                                                                                                                                                       |

`kotlin.build.report`で使用可能なオプションの一覧は以下のとおりです。

```none
# 必須の出力形式。任意の組み合わせが可能です
kotlin.build.report.output=file,single_file,http,build_scan,json

# single_file 出力を使用する場合は必須。レポートの配置場所
# 非推奨の `kotlin.internal.single.build.metrics.file` プロパティの代わりに使用してください
kotlin.build.report.single_file=my/directory/path/some_filename

# 任意。ファイルベースまたはJSONレポートの出力ディレクトリ。デフォルト: build/reports/kotlin-build/
kotlin.build.report.file.output_dir=kotlin-reports

# 任意。ビルドレポートをマーキングするためのラベル（デバッグパラメータなど）
kotlin.build.report.label=some_label
```

HTTPにのみ適用可能なオプション:

```none
# 必須。HTTP(S)ベースのレポートの送信先
kotlin.build.report.http.url=http://127.0.0.1:8080

# 任意。HTTPエンドポイントで認証が必要な場合のユーザー名とパスワード
kotlin.build.report.http.user=someUser
kotlin.build.report.http.password=somePassword

# 任意。ビルドのGitブランチ名をビルドレポートに追加
kotlin.build.report.http.include_git_branch.name=true|false

# 任意。コンパイラ引数をビルドレポートに追加
# プロジェクトに多数のモジュールが含まれている場合、レポート内のコンパイラ引数は非常に肥大化し、あまり役に立たない場合があります
kotlin.build.report.include_compiler_arguments=true|false
```

### カスタム値の制限 {id="limit-of-custom-values"}

ビルドスキャンの統計情報を収集するために、Kotlinビルドレポートは[Gradleのカスタム値（custom values）](https://docs.gradle.com/enterprise/tutorials/extending-build-scans/)を使用します。
ユーザー自身とさまざまなGradleプラグインの両方がカスタム値にデータを書き込むことができます。カスタム値の数には制限があります。
現在の最大カスタム値数については、[Build scanプラグインドキュメント](https://docs.gradle.com/enterprise/gradle-plugin/#adding_custom_values)を参照してください。

大規模なプロジェクトの場合、そのようなカスタム値の数が非常に多くなることがあります。この数が制限を超えると、
ログに次のメッセージが表示されることがあります。

```text
Maximum number of custom values (1,000) exceeded
```

Kotlinプラグインが生成するカスタム値の数を減らすには、`gradle.properties`で次のプロパティを使用できます。

```none
kotlin.build.report.build_scan.custom_values_limit=500
```

### プロジェクトおよびシステムプロパティの収集の無効化 {id="switching-off-collecting-project-and-system-properties"}

HTTPビルド統計ログには、一部のプロジェクトおよびシステムプロパティが含まれる場合があります。これらのプロパティはビルドの動作を変更する可能性があるため、
ビルド統計にログとして記録しておくと便利です。
ただし、これらのプロパティにはパスワードやプロジェクトのフルパスなどの機密データが保存されている可能性があります。

`gradle.properties`に`kotlin.build.report.http.verbose_environment`プロパティを追加することで、
これらの統計の収集を無効にできます。

> JetBrainsがこれらの統計を収集することはありません。[レポートの保存場所](#enabling-build-reports)はユーザー自身が選択します。
> 
{style="note"}

## 次のステップ {id="what-s-next"}

以下の詳細についても参照してください。
* [Gradleの基本と固有の仕様](https://docs.gradle.org/current/userguide/userguide.html)
* [Gradleプラグインバリアントのサポート](gradle-plugin-variants.md)
* [コンパイラ実行戦略](compiler-execution-strategy.md)