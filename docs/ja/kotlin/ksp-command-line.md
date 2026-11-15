[//]: # (title: コマンドラインからのKSPの実行)

ほとんどのプロジェクトでは、コンパイル時にKSPを自動的に実行するGradleプラグイン経由でKSPを使用します。コマンドラインからKSPを使用することもできますが、通常は他のビルドシステムとの統合、プロセッサの開発、テスト、またはデバッグを行う場合にのみ使用されます。

KSPはJVMアプリケーションであるため、コマンドラインからKSPを起動するには `java` コマンドを使用します。クラスパスと必要な引数を指定してください。

```bash
java -cp <classpath> <mainclass> <options> <processor>
```

| 引数 | 説明 |
|---------------|--------------------------------------------------|
| `<classpath>` | KSPランタイムJARおよびその依存関係へのパス。 |
| `<mainclass>` | プラットフォーム固有のKSPエントリポイントのいずれか。 |
| `<options>` | KSPのコマンドラインオプション。 |
| `<processor>` | プロセッサJARへのパス。 |

## クラスパス {id="classpath"}

Gradleプラグインとは異なり、`java` コマンドは依存関係を自動的に解決しません。クラスパス上にKSPランタイムJARとその依存関係を指定する必要があります。

[KSPリリース直ページ](https://github.com/google/ksp/releases/tag/%kspVersion%)から `artifacts.zip` をダウンロードしてください。このアーカイブには、必要なKSPのJARファイルが含まれています。

* `symbol-processing-aa-%kspVersion%.jar`

* `symbol-processing-common-deps-%kspVersion%.jar`

* `symbol-processing-api-%kspVersion%.jar`

また、Maven Repositoryから以下のランタイム依存関係も含める必要があります。

* [`kotlin-stdlib-%kotlinVersion%.jar`](https://mvnrepository.com/artifact/org.jetbrains.kotlin/kotlin-stdlib)

* [`kotlinx-coroutines-core-jvm-%coroutinesVersion%.jar`](https://mvnrepository.com/artifact/org.jetbrains.kotlinx/kotlinx-coroutines-core-jvm)

## メインクラス {id="main-class"}

KSPはJVMアプリケーションであるため、起動するメインクラスを指定する必要があります。KSPは、サポートされているプラットフォームごとに異なるエントリポイントを提供しています。

| エントリポイント | プラットフォーム |
|-----------------|----------------------------------------------------------------|
| `KSPJvmMain` | Kotlin/JVMおよびAndroid |
| `KSPJsMain` | Kotlin/JS |
| `KSPNativeMain` | iOS、macOS、Linux、WindowsなどのKotlin/Nativeターゲット |
| `KSPCommonMain` | Kotlin Multiplatformプロジェクトにおける共通コンパイル（Common compilations） |

`java` でKSPを起動する際は、完全修飾クラス名（FQCN）を指定します。例：

```bash
java -cp <classpath> com.google.devtools.ksp.cmdline.KSPJvmMain <options> <processor>
```

次の例では、`KSPJvmMain` を使用してJVMターゲット向けにKSPを実行します。

```bash
java -cp \
symbol-processing-aa-%kspVersion%.jar:symbol-processing-common-deps-%kspVersion%.jar:symbol-processing-api-%kspVersion%.jar:kotlin-stdlib-%kotlinVersion%.jar:kotlinx-coroutines-core-jvm-%coroutinesVersion%.jar \
com.google.devtools.ksp.cmdline.KSPJvmMain \
-language-version=2.0 \
-api-version=2.0 \
-jvm-target=11 \
-module-name=main \
-source-roots=project_dir/src/kotlin/main \
-project-base-dir=project_dir/ \
-output-base-dir=project_dir/build/ \
-caches-dir=project_dir/build/caches/ \
-class-output-dir=project_dir/build/out/main/classes \
-kotlin-output-dir=project_dir/build/out/main/kotlin/ \
-java-output-dir=project_dir/build/out/main/java/ \
-resource-output-dir=project_dir/build/out/main/res/ \
path/to/processor.jar
```

## オプション {id="options"}

コマンドラインから実行する場合、KSPには以下のオプションが必要です。

| オプション | 説明 |
|-------------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| `-language-version=<version>` | プロジェクトで使用されている[Kotlin言語バージョン](https://kotlinlang.org/docs/compiler-reference.html#language-version-version)。 |
| `-api-version=<version>` | [Kotlin APIバージョン](https://kotlinlang.org/docs/compiler-reference.html#api-version-version)。 |
| `-jvm-target=<version>` | ターゲットJVMバージョン。 |
| `-module-name=<name>` | モジュール名。 |
| `-source-roots=<paths>` | ソースルートディレクトリ。複数のディレクトリを指定する場合はコロン区切りのリストを使用します。 |
| `-project-base-dir=<path>` | プロジェクトルートディレクトリ。 |
| `-output-base-dir=<path>` | KSP出力のベースディレクトリ。 |
| `-caches-dir=<path>` | KSPキャッシュ用のディレクトリ。 |
| `-java-output-dir=<path>` | 生成されたJavaファイル用のディレクトリ。 |
| `-class-output-dir=<path>` | 生成されたクラスファイル用のディレクトリ。 |
| `-kotlin-output-dir=<path>` | 生成されたKotlinファイル用のディレクトリ。 |
| `-resource-output-dir=<path>` | 生成されたリソース用のディレクトリ。 |
| `<processor>` | プロセッサのクラスパス。 |

### その他の便利なオプション {id="other-useful-options"}

* `-libraries=<path>`: ソースファイルによって参照される依存関係を解決するために使用されるクラスパス。通常はモジュールのコンパイルクラスパスです。

* `-jdk-home=<path>`: JDKホームディレクトリ。プロセッサがJavaシンボルを解決し、Java標準ライブラリへのアクセスが必要な場合に使用します。

* `-friends=<path>`: 現在のモジュールのフレンドモジュールのクラスパス。通常はモジュールのフレンドクラスパスです。詳細については、[Friend modules](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.tasks/-base-kotlin-compile/friend-paths.html)を参照してください。

> KSPはログレベルを設定するJVMシステムプロパティ `-Dksp.logging` もサポートしています。有効な値は `error`、`warn` または `warning`、`info`、`debug` です。デフォルト値は `warn` です。KSPはサポートされていない値を `warn` として扱います。
>
{style="tip"}

オプションの完全なリストを確認するには、次のコマンドを実行します。

```bash
java -cp <classpath> <mainclass> -h
```