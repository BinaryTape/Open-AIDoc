[//]: # (title: コマンドラインからのKSPの実行)

<web-summary>Gradle用のKSPプラグインを使用せずに、コマンドラインからKSPを実行する方法を学びます。</web-summary>

ほとんどのプロジェクトでは、コンパイル中に自動的にKSPを実行する[Gradle用KSPプラグイン](https://central.sonatype.com/artifact/com.google.devtools.ksp/com.google.devtools.ksp.gradle.plugin)を介してKSPを使用します。別の方法として、コマンドラインからKSPを実行することも可能です。これは、KSPを他のビルドシステムと統合したり、プロセッサを開発したり、コードのテストやデバッグを行ったりする場合に役立ちます。

KSPはJVMアプリケーションであるため、コマンドラインからKSPを起動するには `java` コマンドを使用します。クラスパスと必要な引数を指定してください。

```bash
java -cp <classpath> <mainclass> <options> <processor>
```

| 引数            | 説明                                                                     |
|-----------------|--------------------------------------------------------------------------|
| `<classpath>`   | [KSPランタイムJARファイル](#classpath)およびその依存関係へのパス。         |
| `<mainclass>`   | プラットフォーム固有のKSP[エントリーポイント](#main-class)。              |
| `<options>`     | KSPのコマンドライン[オプション](#options)。                             |
| `<processor>`   | プロセッサのJARへのパス。                                                 |

## クラスパス {id="classpath"}

Gradle用のKSPプラグインとは異なり、`java` コマンドは自動的に依存関係を解決しません。クラスパス上にKSPランタイムJARファイルとその依存関係を指定する必要があります。

GitHubの[KSPリリースページ](https://github.com/google/ksp/releases/tag/%kspVersion%)から `artifacts.zip` をダウンロードしてください。このアーカイブには、必要なKSP JARファイルが含まれています。

* `symbol-processing-aa-%kspVersion%.jar`
* `symbol-processing-common-deps-%kspVersion%.jar`
* `symbol-processing-api-%kspVersion%.jar`

また、Mavenリポジトリから以下のランタイム依存関係も含める必要があります。

* [`kotlin-stdlib-%kotlinVersion%.jar`](https://mvnrepository.com/artifact/org.jetbrains.kotlin/kotlin-stdlib)
* [`kotlinx-coroutines-core-jvm-%coroutinesVersion%.jar`](https://mvnrepository.com/artifact/org.jetbrains.kotlinx/kotlinx-coroutines-core-jvm)

## メインクラス {id="main-class"}

KSPはJVMアプリケーションであるため、起動するメインクラスを指定する必要があります。KSPはサポートされているプラットフォームごとに異なるエントリーポイントを提供します。

| エントリーポイント | プラットフォーム                                                |
| ------------------ | --------------------------------------------------------------- |
| `KSPJvmMain`       | Kotlin/JVMおよびAndroid                                         |
| `KSPJsMain`        | Kotlin/JS                                                       |
| `KSPNativeMain`    | iOS、macOS、Linux、WindowsなどのKotlin/Nativeターゲット        |
| `KSPCommonMain`    | Kotlin Multiplatformプロジェクトにおけるコモン（共通）コンパイル |

`java` でKSPを起動する際は、完全修飾クラス名（FQCN）を指定してください。例：

```bash
java -cp <classpath> com.google.devtools.ksp.cmdline.KSPJvmMain <options> <processor>
```

次の例では、`KSPJvmMain` を使用してJVMターゲット向けにKSPを実行しています。

```bash
java -cp \
symbol-processing-aa-%kspVersion%.jar:\
symbol-processing-common-deps-%kspVersion%.jar:\
symbol-processing-api-%kspVersion%.jar:\
kotlin-stdlib-%kotlinVersion%.jar:\
kotlinx-coroutines-core-jvm-%coroutinesVersion%.jar \
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

`KSPJvmMain` エントリーポイントには、以下のオプションが必要です。

| オプション                    | 説明                                                                                           |
|-------------------------------|------------------------------------------------------------------------------------------------|
| `-language-version=<version>` | プロジェクトで使用されている[Kotlin言語バージョン](compiler-reference.md#language-version-version)。 |
| `-api-version=<version>`      | [Kotlin APIバージョン](compiler-reference.md#api-version-version)。                            |
| `-jvm-target=<version>`       | ターゲットJVMバージョン。                                                                       |
| `-module-name=<name>`         | モジュール名。                                                                                 |
| `-source-roots=<paths>`       | ソースルートディレクトリ。複数のディレクトリを指定する場合はコロン区切りのリストを使用します。    |
| `-project-base-dir=<path>`    | プロジェクトのルートディレクトリ。                                                             |
| `-output-base-dir=<path>`     | KSP出力用のベースディレクトリ。                                                                |
| `-caches-dir=<path>`          | KSPキャッシュ用のディレクトリ。                                                                |
| `-java-output-dir=<path>`     | 生成されたJavaファイル用のディレクトリ。                                                        |
| `-class-output-dir=<path>`    | 生成されたクラスファイル用のディレクトリ。                                                      |
| `-kotlin-output-dir=<path>`   | 生成されたKotlinファイル用のディレクトリ。                                                     |
| `-resource-output-dir=<path>` | 生成されたリソース用のディレクトリ。                                                           |
| `<processor>`                 | プロセッサのクラスパス。                                                                       |

他のエントリーポイントでは、異なるオプションのセットが使用されます。特定のエントリーポイントのオプションの完全なリストを確認するには、次のコマンドを実行してください。

```bash
java -cp <classpath> <mainclass> -h
```

### その他のオプション {id="other-options"}

* `-libraries=<path>`: ソースファイルから参照される依存関係を解決するために使用されるクラスパス。通常はモジュールのコンパイルクラスパスです。
* `-jdk-home=<path>`: JDKのホームディレクトリ。プロセッサがJavaシンボルを解決し、Java標準ライブラリへのアクセスが必要な場合に使用します。
* `-friends=<path>`: 現在のモジュールのフレンドモジュールのクラスパス。詳細については、Kotlin GradleプラグインAPIリファレンスの[`friendPaths` プロパティ](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.tasks/-base-kotlin-compile/friend-paths.html)を参照してください。

> `-Dksp.logging` JVMシステムプロパティを使用してログレベルを設定することもできます。有効な値は `error`、`warn`（または `warning`）、`info`、`debug` です。その他の値は `warn` として扱われます。デフォルト値は `warn` です。
>
{style="note"}

## 関連項目 {id="see-also"}

* [インクリメンタル処理](ksp-incremental.md)の仕組みと、それをコマンドラインからデバッグする方法について学ぶ。
* Gradleを使用して[Kotlin MultiplatformプロジェクトでKSPを使用する](ksp-multiplatform.md)方法について学ぶ。