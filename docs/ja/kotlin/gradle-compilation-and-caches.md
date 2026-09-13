[//]: # (title: Kotlin Gradle プラグインにおけるコンパイルとキャッシュ)

このページでは、以下のトピックについて学ぶことができます：
* [増分コンパイル](#incremental-compilation)
* [Gradle ビルドキャッシュのサポート](#gradle-build-cache-support)
* [Gradle コンフィギュレーションキャッシュのサポート](#gradle-configuration-cache-support)
* [Kotlin デーモンと Gradle での使用方法](#the-kotlin-daemon-and-how-to-use-it-with-gradle)
* [以前のコンパイラへのロールバック](#rolling-back-to-the-previous-compiler)
* [Kotlin コンパイラの実行戦略の定義](compiler-execution-strategy.md)
* [Kotlin コンパイラのフォールバック戦略](compiler-execution-strategy.md#fallback-strategy)
* [最新の言語バージョンの試行](#trying-the-latest-language-version)
* [ビルドレポート](#build-reports)

## 増分コンパイル {id="incremental-compilation"}

Kotlin Gradle プラグインは増分コンパイル（incremental compilation）をサポートしており、Kotlin/JVM および Kotlin/JS プロジェクトではデフォルトで有効になっています。
増分コンパイルは、ビルド間でクラスパス内のファイルの変更を追跡し、それらの変更によって影響を受けるファイルのみをコンパイルします。
このアプローチは [Gradle のビルドキャッシュ](#gradle-build-cache-support)と連携し、[コンパイル回避（compilation avoidance）](https://docs.gradle.org/current/userguide/java_plugin.html#sec:java_compile_avoidance)をサポートします。

Kotlin/JVM の場合、増分コンパイルはクラスパスのスナップショットに依存しています。
これはモジュールの API 構造をキャプチャし、いつ再コンパイルが必要かを判断します。
パイプライン全体を最適化するために、Kotlin コンパイラは 2 種類のクラスパススナップショットを使用します：

* **細粒度スナップショット（Fine-grained snapshots）：** プロパティや関数などのクラスメンバーに関する詳細な情報が含まれます。
メンバーレベルの変更が検出されると、Kotlin コンパイラは変更されたメンバーに依存するクラスのみを再コンパイルします。
パフォーマンスを維持するため、Kotlin Gradle プラグインは Gradle キャッシュ内の `.jar` ファイルに対しては粗粒度のスナップショットを作成します。
* **粗粒度スナップショット（Coarse-grained snapshots）：** クラスの [ABI](https://en.wikipedia.org/wiki/Application_binary_interface) ハッシュのみが含まれます。
ABI の一部が変更されると、Kotlin コンパイラは変更されたクラスに依存するすべてのクラスを再コンパイルします。
これは、外部ライブラリのように頻繁に変更されないクラスに有用です。

> Kotlin/JS プロジェクトでは、履歴ファイルに基づいた異なる増分コンパイルアプローチを使用します。
>
{style="note"}

増分コンパイルを無効にするには、いくつかの方法があります：

* Kotlin/JVM の場合は `kotlin.incremental=false` を設定します。
* Kotlin/JS プロジェクトの場合は `kotlin.incremental.js=false` を設定します。
* コマンドラインパラメータとして `-Pkotlin.incremental=false` または `-Pkotlin.incremental.js=false` を使用します。

  このパラメータは、その後の各ビルドに追加する必要があります。

増分コンパイルを無効にすると、ビルド後に増分キャッシュが無効になります。最初のビルドが増分ビルドになることはありません。

> 増分コンパイルの問題は、失敗が発生してから数ラウンド後に明らかになることがあります。[ビルドレポート](#build-reports)を使用して、変更とコンパイルの履歴を追跡してください。これにより、再現可能なバグレポートを提供するのに役立ちます。
>
{style="tip"}

現在の増分コンパイルアプローチの仕組みや以前のアプローチとの比較についての詳細は、こちらの[ブログ記事](https://blog.jetbrains.com/kotlin/2022/07/a-new-approach-to-incremental-compilation-in-kotlin/)を参照してください。

## Gradle ビルドキャッシュのサポート {id="gradle-build-cache-support"}

Kotlin プラグインは [Gradle ビルドキャッシュ](https://docs.gradle.org/current/userguide/build_cache.html)を使用します。これは、将来のビルドで再利用するためにビルド出力を保存するものです。

すべての Kotlin タスクでキャッシュを無効にするには、システムプロパティ `kotlin.caching.enabled` を `false` に設定します（引数 `-Dkotlin.caching.enabled=false` を付けてビルドを実行します）。

## Gradle コンフィギュレーションキャッシュのサポート {id="gradle-configuration-cache-support"}

Kotlin プラグインは [Gradle コンフィギュレーションキャッシュ](https://docs.gradle.org/current/userguide/configuration_cache.html)を使用します。
これにより、以降のビルドでコンフィギュレーションフェーズの結果を再利用することで、ビルドプロセスを高速化します。

コンフィギュレーションキャッシュを有効にする方法については、[Gradle のドキュメント](https://docs.gradle.org/current/userguide/configuration_cache.html#config_cache:usage)を参照してください。この機能を有効にすると、Kotlin Gradle プラグインは自動的にそれを使用し始めます。

## Kotlin デーモンと Gradle での使用方法 {id="the-kotlin-daemon-and-how-to-use-it-with-gradle"}

[Kotlin デーモン](kotlin-daemon.md)は以下の通り動作します：
* プロジェクトをコンパイルするために、Gradle デーモンと共に実行されます。
* IntelliJ IDEA の内蔵ビルドシステムでプロジェクトをコンパイルする場合は、Gradle デーモンとは別に実行されます。

Kotlin デーモンは、Kotlin コンパイルタスクのいずれかがソースのコンパイルを開始した際、Gradle の[実行ステージ](https://docs.gradle.org/current/userguide/build_lifecycle.html#sec:build_phases)で起動します。
Kotlin デーモンは、Gradle デーモンが停止したとき、または Kotlin のコンパイルが行われないまま 2 時間経過した後に停止します。

Kotlin デーモンは、Gradle デーモンと同じ JDK を使用します。

### Kotlin デーモンの JVM 引数の設定 {id="setting-kotlin-daemon-s-jvm-arguments"}

引数を設定する以下の各方法は、それより前に設定されたものを上書きします：
* [Gradle デーモン引数の継承](#gradle-daemon-arguments-inheritance)
* [`kotlin.daemon.jvm.options` システムプロパティ](#kotlin-daemon-jvm-options-system-property)
* [`kotlin.daemon.jvmargs` プロパティ](#kotlin-daemon-jvmargs-property)
* [`kotlin` 拡張](#kotlin-extension)
* [特定のタスク定義](#specific-task-definition)

#### Gradle デーモン引数の継承 {id="gradle-daemon-arguments-inheritance"}

デフォルトでは、Kotlin デーモンは Gradle デーモンから特定の引数セットを継承しますが、Kotlin デーモンに直接指定された JVM 引数がある場合はそれで上書きします。例えば、`gradle.properties` ファイルに以下の JVM 引数を追加した場合：

```none
org.gradle.jvmargs=-Xmx1500m -Xms500m -XX:MaxMetaspaceSize=1g
```

これらの引数は、Kotlin デーモンの JVM 引数に追加されます：

```none
-Xmx1500m -XX:ReservedCodeCacheSize=320m -XX:MaxMetaspaceSize=1g -XX:UseParallelGC -ea -XX:+UseCodeCacheFlushing -XX:+HeapDumpOnOutOfMemoryError -Djava.awt.headless=true -Djava.rmi.server.hostname=127.0.0.1 --add-exports=java.base/sun.nio.ch=ALL-UNNAMED
```

> Kotlin デーモンの JVM 引数に関するデフォルトの動作についての詳細は、[Kotlin デーモンの JVM 引数に関する動作](#kotlin-daemon-s-behavior-with-jvm-arguments)を参照してください。
>
{style="note"}

#### kotlin.daemon.jvm.options システムプロパティ {id="kotlin-daemon-jvm-options-system-property"}

Gradle デーモンの JVM 引数に `kotlin.daemon.jvm.options` システムプロパティがある場合は、`gradle.properties` ファイルでそれを使用します：

```none
org.gradle.jvmargs=-Dkotlin.daemon.jvm.options=-Xmx1500m,Xms500m
```

引数を渡す際は、以下のルールに従ってください：
* 引数 `Xmx`、`XX:MaxMetaspaceSize`、`XX:ReservedCodeCacheSize` の前に**のみ**マイナス記号 `-` を使用してください。
* 引数はカンマ（`,`）で区切り、スペースは入れないでください。スペースの後に続く引数は、Kotlin デーモンではなく Gradle デーモン用として扱われます。

> 以下の条件がすべて満たされる場合、Gradle はこれらのプロパティを無視します：
> * Gradle が JDK 1.9 以上を使用している。
> * Gradle のバージョンが 7.0 から 7.1.1（両端を含む）の間である。
> * Gradle が Kotlin DSL スクリプトをコンパイルしている。
> * Kotlin デーモンが実行されていない。
>
> これを回避するには、Gradle をバージョン 7.2（またはそれ以上）にアップグレードするか、次のセクションで説明する `kotlin.daemon.jvmargs` プロパティを使用してください。
>
{style="warning"}

#### kotlin.daemon.jvmargs プロパティ {id="kotlin-daemon-jvmargs-property"}

`gradle.properties` ファイルに `kotlin.daemon.jvmargs` プロパティを追加できます：

```none
kotlin.daemon.jvmargs=-Xmx1500m -Xms500m
```

ここで、または Gradle の JVM 引数で `ReservedCodeCacheSize` 引数を指定しない場合、Kotlin Gradle プラグインはデフォルト値の `320m` を適用することに注意してください：

```none
-Xmx1500m -XX:ReservedCodeCacheSize=320m -Xms500m
```

#### kotlin 拡張 {id="kotlin-extension"}

`kotlin` 拡張で引数を指定できます：

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

特定のタスクに対して引数を指定できます：

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

> この場合、タスクの実行時に新しい Kotlin デーモンインスタンスが起動する可能性があります。詳細は [Kotlin デーモンの JVM 引数に関する動作](#kotlin-daemon-s-behavior-with-jvm-arguments)を参照してください。
>
{style="note"}

### Kotlin デーモンの JVM 引数に関する動作 {id="kotlin-daemon-s-behavior-with-jvm-arguments"}

Kotlin デーモンの JVM 引数を設定する際は、以下の点に注意してください：

* サブプロジェクトやタスクごとに異なる JVM 引数セットが指定されている場合、複数の Kotlin デーモンインスタンスが同時に実行されることが想定されています。
* 新しい Kotlin デーモンインスタンスは、Gradle が関連するコンパイルタスクを実行し、かつ既存の Kotlin デーモンの中に同じ JVM 引数セットを持つものがない場合にのみ起動します。
  プロジェクトに多くのサブプロジェクトがあると想像してください。そのほとんどは Kotlin デーモンに一定のヒープメモリを必要としますが、ある一つのモジュールだけが非常に多くのメモリを必要とする（ただし、めったにコンパイルされない）とします。
  この場合、そのモジュールに対して異なる JVM 引数セットを提供することで、大きなヒープサイズを持つ Kotlin デーモンを、その特定のモジュールを触る開発者の環境でのみ起動させることができます。
  > すでに実行中の Kotlin デーモンがコンパイルリクエストを処理するのに十分なヒープサイズを持っている場合、他の要求された JVM 引数が異なっていても、新しいものを起動する代わりにそのデーモンが再利用されます。
  >
  {style="note"}

以下の引数が指定されていない場合、Kotlin デーモンは Gradle デーモンからそれらを継承します：

* `-Xmx`
* `-XX:MaxMetaspaceSize`
* `-XX:ReservedCodeCacheSize`。指定も継承もされない場合、デフォルト値は `320m` です。

Kotlin デーモンには、以下のデフォルト JVM 引数があります：
* `-XX:UseParallelGC`。この引数は、他のガベージコレクタが指定されていない場合にのみ適用されます。
* `-ea`
* `-XX:+UseCodeCacheFlushing`
* `-Djava.awt.headless=true`
* `-D{java.servername.property}={localhostip}`
* `--add-exports=java.base/sun.nio.ch=ALL-UNNAMED`。この引数は JDK バージョン 16 以上の場合にのみ適用されます。

> Kotlin デーモンのデフォルト JVM 引数のリストは、バージョンによって異なる場合があります。[VisualVM](https://visualvm.github.io/) のようなツールを使用して、Kotlin デーモンのような実行中の JVM プロセスの実際の設定を確認できます。
>
{style="note"}

## 以前のコンパイラへのロールバック {id="rolling-back-to-the-previous-compiler"}

Kotlin 2.0.0 以降、K2 コンパイラがデフォルトで使用されます。

Kotlin 2.0.0 以降で以前のコンパイラを使用するには、以下のいずれかを行います：

* `build.gradle.kts` ファイルで、[言語バージョンを 1.9 に設定](gradle-compiler-options.md#example-of-setting-languageversion)します。

  または
* コンパイラオプション `-language-version 1.9` を使用します。

K2 コンパイラの利点についての詳細は、[K2 コンパイラ移行ガイド](k2-compiler-migration-guide.md)を参照してください。

## 最新の言語バージョンの試行 {id="trying-the-latest-language-version"}

Kotlin 2.0.0 以降、最新の言語バージョンを試すには、`gradle.properties` ファイルで `kotlin.experimental.tryNext` プロパティを設定してください。
このプロパティを使用すると、Kotlin Gradle プラグインは言語バージョンを、お使いの Kotlin バージョンのデフォルト値より一つ上のものに引き上げます。
例えば、Kotlin 2.0.0 ではデフォルトの言語バージョンは 2.0 なので、このプロパティは言語バージョン 2.1 を設定します。

あるいは、以下のコマンドを実行することもできます：

```shell
./gradlew assemble -Pkotlin.experimental.tryNext=true
``` 

[ビルドレポート](#build-reports)で、各タスクのコンパイルに使用された言語バージョンを確認できます。

## ビルドレポート {id="build-reports"}

ビルドレポートには、さまざまなコンパイルフェーズの所要時間や、コンパイルが増分にならなかった理由が含まれます。
コンパイル時間が長すぎる場合や、同じプロジェクトでも時間が異なる場合など、パフォーマンスの問題を調査するためにビルドレポートを使用してください。

Kotlin ビルドレポートは、単一の Gradle タスクを最小単位とする [Gradle build scans](https://scans.gradle.com/) よりも効率的に、ビルドパフォーマンスの問題を調査するのに役立ちます。

実行時間の長いコンパイルにおいて、ビルドレポートを分析することで解決できる一般的なケースが 2 つあります：
* ビルドが増分ではなかった。理由を分析し、根本的な問題を修正してください。
* ビルドは増分だったが、時間がかかりすぎた。ソースファイルの再編成（大きなファイルの分割、個別のクラスを異なるファイルに保存、巨大なクラスのリファクタリング、トップレベル関数を異なるファイルで宣言するなど）を試みてください。

ビルドレポートには、プロジェクトで使用されている Kotlin バージョンも表示されます。さらに、Kotlin 1.9.0 以降では、[Gradle build scans](https://scans.gradle.com/) でコードのコンパイルにどのコンパイラが使用されたかを確認できるようになりました。

[ビルドレポートの読み方](https://blog.jetbrains.com/kotlin/2022/06/introducing-kotlin-build-reports/#how_to_read_build_reports)および [JetBrains におけるビルドレポートの活用方法](https://blog.jetbrains.com/kotlin/2022/06/introducing-kotlin-build-reports/#how_we_use_build_reports_in_jetbrains)について詳細を確認してください。

### ビルドレポートの有効化 {id="enabling-build-reports"}

ビルドレポートを有効にするには、`gradle.properties` でビルドレポートの出力先を宣言します：

```none
kotlin.build.report.output=file
```

出力先には、以下の値とその組み合わせが使用可能です：

| オプション | 説明 |
|---|---|
| `file` | ビルドレポートを人間が読みやすい形式でローカルファイルに保存します。デフォルトでは `${project_folder}/build/reports/kotlin-build/${project_name}-timestamp.txt` です。 |
| `single_file` | ビルドレポートをオブジェクトの形式で指定されたローカルファイルに保存します。 |
| `build_scan` | ビルドレポートを [build scan](https://scans.gradle.com/) の `custom values` セクションに保存します。Gradle Enterprise プラグインは、カスタム値の数とその長さを制限していることに注意してください。大規模なプロジェクトでは、一部の値が失われる可能性があります。 |
| `http` | HTTP(S) を使用してビルドレポートを投稿します。POST メソッドでメトリクスを JSON 形式で送信します。送信データの現在のバージョンは [Kotlin リポジトリ](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-plugin/src/common/kotlin/org/jetbrains/kotlin/gradle/report/data/GradleCompileStatisticsData.kt)で確認できます。HTTP エンドポイントのサンプルは、[こちらのブログ記事](https://blog.jetbrains.com/kotlin/2022/06/introducing-kotlin-build-reports/#enable_build_reports)にあります。 |
| `json` | ビルドレポートを JSON 形式でローカルファイルに保存します。デフォルトでは `${project_folder}/build/reports/kotlin-build/${project_name}-build-<date-time>-<index>.json` です。 |

`kotlin.build.report` で使用可能なオプションのリストは以下の通りです：

```none
# 必須の出力先。任意の組み合わせが可能です
kotlin.build.report.output=file,single_file,http,build_scan,json

# single_file 出力を使用する場合は必須。レポートの保存場所
# 非推奨の `kotlin.internal.single.build.metrics.file` プロパティの代わりに使用してください
kotlin.build.report.single_file=my/directory/path/some_filename

# オプション。ファイルベースまたは JSON レポートの出力ディレクトリ。デフォルト：build/reports/kotlin-build/
kotlin.build.report.file.output_dir=kotlin-reports

# オプション。ビルドレポートを識別するためのラベル（例：デバッグパラメータなど）
kotlin.build.report.label=some_label
```

HTTP にのみ適用されるオプション：

```none
# 必須。HTTP(S) ベースのレポートの投稿先
kotlin.build.report.http.url=http://127.0.0.1:8080

# オプション。HTTP エンドポイントが認証を必要とする場合のユーザー名とパスワード
kotlin.build.report.http.user=someUser
kotlin.build.report.http.password=somePassword

# オプション。ビルドレポートにビルドの Git ブランチ名を追加する
kotlin.build.report.http.include_git_branch.name=true|false

# オプション。ビルドレポートにコンパイラ引数を追加する
# プロジェクトに多くのモジュールが含まれている場合、レポート内のコンパイラ引数が非常に重くなり、あまり役立たない場合があります
kotlin.build.report.include_compiler_arguments=true|false
```

### カスタム値の制限 {id="limit-of-custom-values"}

ビルドスキャンの統計情報を収集するために、Kotlin ビルドレポートは [Gradle のカスタム値](https://docs.gradle.com/enterprise/tutorials/extending-build-scans/)を使用します。
ユーザー自身と、さまざまな Gradle プラグインの両方がカスタム値にデータを書き込むことができます。カスタム値の数には制限があります。
現在の最大カスタム値数は、[Build scan プラグインのドキュメント](https://docs.gradle.com/enterprise/gradle-plugin/#adding_custom_values)で確認してください。

大規模なプロジェクトの場合、このようなカスタム値の数が非常に多くなることがあります。この数が制限を超えると、ログに以下のメッセージが表示されることがあります：

```text
Maximum number of custom values (1,000) exceeded
```

Kotlin プラグインが生成するカスタム値の数を減らすには、`gradle.properties` で以下のプロパティを使用できます：

```none
kotlin.build.report.build_scan.custom_values_limit=500
```

### プロジェクトおよびシステムプロパティの収集の停止 {id="switching-off-collecting-project-and-system-properties"}

HTTP ビルド統計ログには、一部のプロジェクトおよびシステムプロパティが含まれる場合があります。これらのプロパティはビルドの動作を変更する可能性があるため、ビルド統計にログを記録しておくと便利です。
ただし、これらのプロパティにはパスワードやプロジェクトのフルパスなどの機密データが含まれている可能性があります。

`gradle.properties` に `kotlin.build.report.http.verbose_environment` プロパティを追加することで、これらの統計情報の収集を無効にできます。

> JetBrains はこれらの統計情報を収集しません。ユーザーが[レポートの保存場所](#enabling-build-reports)を選択します。
> 
{style="note"}

## 次に学ぶこと {id="what-s-next"}

以下について詳細を確認してください：
* [Gradle の基本と詳細](https://docs.gradle.org/current/userguide/userguide.html)
* [Gradle プラグインバリアントのサポート](gradle-plugin-variants.md)
* [コンパイラ実行戦略](compiler-execution-strategy.md)