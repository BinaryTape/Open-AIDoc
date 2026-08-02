[//]: # (title: コマンドラインから KSP を実行する)

ほとんどのプロジェクトでは、コンパイル中に KSP を自動的に実行する Gradle プラグインを介して KSP を使用します。コマンドラインから KSP を使用することもできますが、通常は他のビルドシステムとの統合、プロセッサの開発、テスト、またはデバッグの際にのみ使用されます。

KSP は JVM アプリケーションであるため、`java` コマンドを使用してコマンドラインから KSP を起動します。クラスパスと必要な引数を指定してください。

```bash
java -cp <classpath> <mainclass> <options> <processor>
```

| 引数            | 説明                                             |
|---------------|--------------------------------------------------|
| `<classpath>` | KSP ランタイム JAR とその依存関係へのパス。         |
| `<mainclass>` | プラットフォーム固有の KSP エントリポイントのいずれか。 |
| `<options>`   | KSP のコマンドラインオプション。                   |
| `<processor>` | プロセッサ JAR へのパス。                          |

## クラスパス

Gradle プラグインとは異なり、`java` コマンドは依存関係を自動的に解決しません。KSP ランタイム JAR とその依存関係をクラスパスに指定する必要があります。

[KSP リリースページ](https://github.com/google/ksp/releases/tag/%kspVersion%)から `artifacts.zip` をダウンロードしてください。このアーカイブには、必要な KSP JAR ファイルが含まれています。

* `symbol-processing-aa-%kspVersion%.jar`

* `symbol-processing-common-deps-%kspVersion%.jar`

* `symbol-processing-api-%kspVersion%.jar`

また、Maven リポジトリから以下のランタイム依存関係も含める必要があります。

* [`kotlin-stdlib-%kotlinVersion%.jar`](https://mvnrepository.com/artifact/org.jetbrains.kotlin/kotlin-stdlib)

* [`kotlinx-coroutines-core-jvm-%coroutinesVersion%.jar`](https://mvnrepository.com/artifact/org.jetbrains.kotlinx/kotlinx-coroutines-core-jvm)

## メインクラス

KSP は JVM アプリケーションであるため、起動するメインクラスを指定する必要があります。KSP は、サポートされているプラットフォームごとに異なるエントリポイントを提供しています。

| エントリポイント     | プラットフォーム                                                         |
|-----------------|----------------------------------------------------------------------|
| `KSPJvmMain`    | Kotlin/JVM および Android                                            |
| `KSPJsMain`     | Kotlin/JS                                                            |
| `KSPNativeMain` | iOS、macOS、Linux、Windows などの Kotlin/Native ターゲット。           |
| `KSPCommonMain` | Kotlin Multiplatform プロジェクトにおける共通（Common）のコンパイル。 |

`java` で KSP を起動する場合、完全修飾クラス名を指定します。例：

```bash
java -cp <classpath> com.google.devtools.ksp.cmdline.KSPJvmMain <options> <processor>
```

次の例では、`KSPJvmMain` を使用して JVM ターゲットに対して KSP を実行しています。

```bash
java -cp \
symbol-processing-aa-%kspVersion%.jar:symbol-processing-common-deps-%kspVersion%.jar:symbol-processing-api-%kspVersion%.jar:kotlin-stdlib-2.3.20.jar:kotlinx-coroutines-core-jvm-1.10.2.jar \
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

## オプション

コマンドラインから実行する場合、KSP には以下のオプションが必要です。

| オプション                        | 説明                                                                                                                               |
|-------------------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| `-language-version=<version>` | プロジェクトで使用される [Kotlin 言語バージョン](https://kotlinlang.org/docs/compiler-reference.html#language-version-version)。 |
| `-api-version=<version>`      | [Kotlin API バージョン](https://kotlinlang.org/docs/compiler-reference.html#api-version-version)。                                |
| `-jvm-target=<version>`       | ターゲット JVM バージョン。                                                                                                         |
| `-module-name=<name>`         | モジュール名。                                                                                                                     |
| `-source-roots=<paths>`       | ソースルートディレクトリ。複数のディレクトリを指定する場合は、コロンで区切られたリストを使用します。                                 |
| `-project-base-dir=<path>`    | プロジェクトのルートディレクトリ。                                                                                                   |
| `-output-base-dir=<path>`     | KSP 出力のベースディレクトリ。                                                                                                      |
| `-caches-dir=<path>`          | KSP キャッシュ用のディレクトリ。                                                                                                     |
| `-java-output-dir=<path>`     | 生成された Java ファイル用のディレクトリ。                                                                                           |
| `-class-output-dir=<path>`    | 生成されたクラスファイル用のディレクトリ。                                                                                           |
| `-kotlin-output-dir=<path>`   | 生成された Kotlin ファイル用のディレクトリ。                                                                                         |
| `-resource-output-dir=<path>` | 生成されたリソース用のディレクトリ。                                                                                                 |
| `<processor>`                 | プロセッサのクラスパス。                                                                                                             |

### その他の便利なオプション

* `-libraries=<path>`: ソースファイルによって参照される依存関係を解決するために使用されるクラスパス。通常はモジュールのコンパイルクラスパスです。

* `-jdk-home=<path>`: JDK のホームディレクトリ。プロセッサが Java シンボルを解決し、Java 標準ライブラリへのアクセスが必要な場合に使用します。

* `-friends=<path>`: 現在のモジュールのフレンドモジュールのクラスパス。これは通常、モジュールのフレンドクラスパスです。詳細については、[フレンドモジュール](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.tasks/-base-kotlin-compile/friend-paths.html)を参照してください。

> KSP は、ロギングレベルを設定する JVM システムプロパティ `-Dksp.logging` もサポートしています。有効な値は `error`、`warn` または `warning`、`info`、および `debug` です。デフォルト値は `warn` です。KSP はサポートされていない値を `warn` として扱います。
>
{style="tip"}

オプションの完全なリストを表示するには、次のコマンドを実行してください。

```bash
java -cp <classpath> <mainclass> -h