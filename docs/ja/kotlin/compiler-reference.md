[//]: # (title: Kotlinコンパイラオプション)

<show-structure depth="1"/>

Kotlinの各リリースには、サポートされているターゲット用のコンパイラが含まれています：
JVM、JavaScript、および[サポートされているプラットフォーム](native-overview.md#target-platforms)向けのネイティブバイナリ。

これらのコンパイラは、以下によって使用されます：
* Kotlinプロジェクトで __Compile__ または __Run__ ボタンをクリックしたときのIDE。
* コンソールまたはIDEで `gradle build` を呼び出したときのGradle。
* コンソールまたはIDEで `mvn compile` や `mvn test-compile` を呼び出したときのMaven。

また、[コマンドラインコンパイラの使用](command-line.md)チュートリアルで説明されているように、
コマンドラインからKotlinコンパイラを手動で実行することもできます。

## コンパイラオプション {id="compiler-options"}

Kotlinコンパイラには、コンパイルプロセスをカスタマイズするための多数のオプションが用意されています。
さまざまなターゲットに対応するコンパイラオプションとそれぞれの説明がこのページにまとめられています。

コンパイラオプションとその値（*コンパイラ引数*）を設定するには、いくつかの方法があります：
* IntelliJ IDEAでは、**Settings/Preferences** | **Build, Execution, Deployment** | **Compiler** | **Kotlin Compiler** の **Additional command line parameters** テキストボックスにコンパイラ引数を入力します。
* Gradleを使用している場合は、Kotlinコンパイルタスクの `compilerOptions` プロパティでコンパイラ引数を指定します。
詳細は[Gradleコンパイラオプション](gradle-compiler-options.md#how-to-define-options)を参照してください。
* Mavenを使用している場合は、Mavenプラグインノードの `<configuration>` 要素内でコンパイラ引数を指定します。
詳細は[Maven](maven-kotlin-compiler.md#specify-compiler-options)を参照してください。
* コマンドラインコンパイラを実行する場合は、ユーティリティ呼び出しに直接コンパイラ引数を追加するか、[argfile](#argfile)に記述します。

  例：

  ```bash
  $ kotlinc hello.kt -include-runtime -d hello.jar
  ```

  > Windowsでは、区切り文字（空白、`=`、`;`、`,`）を含むコンパイラ引数を渡す場合、
  > それらの引数をダブルクォーテーション（`"`）で囲んでください。
  > ```
  > $ kotlinc.bat hello.kt -include-runtime -d "My Folder\hello.jar"
  > ```
  {style="note"}

## コンパイラオプションのスキーマ {id="schema-for-compiler-options"}

すべてのコンパイラオプションに共通するスキーマは、JARアーティファクトとして[`org.jetbrains.kotlin:kotlin-compiler-arguments-description`](https://central.sonatype.com/artifact/org.jetbrains.kotlin/kotlin-compiler-arguments-description)で公開されています。このアーティファクトには、（Kotlin以外の利用者のための）すべてのコンパイラオプション説明のコード表現とJSON相当表現の両方が含まれています。また、各オプションが導入または安定化されたバージョンなどのメタデータも含まれています。

## 共通オプション {id="common-options"}

以下のオプションは、すべてのKotlinコンパイラに共通です。

### -api-version _version_ {id="api-version-version"}

コードが実行時に使用できるKotlin APIを制御するためのAPIバージョンを設定します。たとえば、Kotlinコンパイラバージョン2.4.0で `-api-version=2.1` を使用すると、コードはKotlin標準ライブラリ2.1.0との互換性を維持します。

`-api-version` の値を `-language-version` の値より高く設定することはできません。

ほとんどの場合、APIバージョンと[言語バージョン](#language-version-version)は同じにする必要があります。例外の1つは、古いバージョンのKotlin標準ライブラリを実行しなければならない利用者のためにライブラリを開発する場合です。その場合は、それらの利用者が利用できないAPIを誤って使用しないよう、古いAPIバージョンを設定してください。

APIバージョンが互換性に与える影響の詳細については、[ライブラリ作成者のための後方互換性ガイドライン](api-guidelines-backward-compatibility.md#choose-compatible-language-and-api-versions)を参照してください。

### -help (-h) {id="help-h"}

使用方法の情報を表示して終了します。標準オプションのみが表示されます。
高度なオプションを表示するには、`-X` を使用してください。

### -kotlin-home _path_ {id="kotlin-home-path"}

ランタイムライブラリの検出に使用されるKotlinコンパイラへのカスタムパスを指定します。

### -language-version _version_ {id="language-version-version"}

コンパイル中に利用可能なKotlin言語機能を制御するための言語バージョンを設定します。

たとえば、コンパイラの動作を変更せずに新しいコンパイルパフォーマンスの向上の恩恵を受けたい場合、
新しいコンパイラバージョンで古い言語バージョンを使用できます。古い言語バージョンを使用すると、
新しい言語機能は使用できなくなりますが、そのバージョン以降に導入された新しいエラーや非推奨（deprecation）も発生しません。
このアプローチは、古いKotlinバージョンとの互換性を維持する必要があるライブラリ作成者に特に役立ちます。
詳細については、[ライブラリ作成者のための後方互換性ガイドライン](api-guidelines-backward-compatibility.md#choose-compatible-language-and-api-versions)を参照してください。

言語バージョンとしては、最新の3つの安定版Kotlinバージョンのいずれかを設定できます。たとえば、Kotlin 2.5.0は2.2までの古い言語バージョンをサポートしています。

古い言語バージョンを使用する場合は、古いAPIバージョンも使用する必要があります。
詳細については、[](#api-version-version)を参照してください。

> 技術的には、安定化される前に今後の言語機能を試すために、より新しい言語バージョンを設定することも可能です。
> ただし、個々の機能については、専用の手順に従って有効にすることをお勧めします。
> 
{style="tip"}

### -opt-in _annotation_ {id="opt-in-annotation"}

指定された完全修飾名を持つ要求アノテーションによって、[オプトインを必要とする](opt-in-requirements.md)APIの使用を有効にします。

### -P plugin:pluginId:optionName=value {id="p-plugin-pluginid-optionname-value"}

Kotlinコンパイラプラグインにオプションを渡します。
コアプラグインとそのオプションは、ドキュメントの[コアコンパイラプラグイン](components-stability.md#core-compiler-plugins)セクションに記載されています。

### -progressive {id="progressive"}

コンパイラの[プログレッシブモード](whatsnew13.md#progressive-mode)を有効にします。

プログレッシブモードでは、不安定なコードに対する非推奨化やバグ修正が、段階的な移行サイクルを経ることなく即座に適用されます。
プログレッシブモードで記述されたコードには後方互換性がありますが、
非プログレッシブモードで記述されたコードは、プログレッシブモードでコンパイルエラーを引き起こす可能性があります。

### -script {id="script"}

Kotlinスクリプトファイルを評価します。このオプションを指定して呼び出されると、コンパイラは渡された引数の中で最初のKotlinスクリプト（`*.kts`）ファイルを実行します。

### -verbose {id="verbose"}

コンパイルプロセスの詳細を含む詳細ログ出力を有効にします。

### -version {id="version"}

コンパイラのバージョンを表示します。

### -X {id="x"}

<primary-label ref="experimental-general"/>

高度なオプションに関する情報を表示して終了します。これらのオプションは現在不安定です。
それらの名前や動作は予告なしに変更される可能性があります。

### Kotlinコントラクトオプション {id="kotlin-contract-options"}
<primary-label ref="experimental-general"/>

以下のオプションは、実験的なKotlinコントラクト（Kotlin contracts）機能を有効にします。

#### -Xallow-contracts-on-more-functions {id="xallow-contracts-on-more-functions"}

プロパティアクセサ、特定の演算子関数、ジェネリック型に対する型アサーションなど、追加の宣言でコントラクトを有効にします。

#### -Xallow-condition-implies-returns-contracts {id="xallow-condition-implies-returns-contracts"}

コントラクト内で `returnsNotNull()` 関数を使用して、指定された条件に対して戻り値が非nullであるとみなすことを許可します。

#### -Xallow-holdsin-contract {id="xallow-holdsin-contract"}

コントラクト内で `holdsIn` キーワードを使用して、ラムダの内部でブール条件が `true` であるとみなすことを許可します。

#### -Xallow-returns-result-of {id="xallow-returns-result-of"}

`returnsResultOf()` コントラクトの使用を許可し、未使用の戻り値チェッカー（unused return value checker）が、無視できる結果と高階関数からの意味のある結果を区別できるようにします。

### -Xallow-reified-type-in-catch {id="xallow-reified-type-in-catch"}
<primary-label ref="experimental-general"/>

`inline` 関数の `catch` 節で、具現化された（reified）`Throwable` 型パラメータのサポートを有効にします。

### -Xcollection-literals {id="xcollection-literals"}
<primary-label ref="experimental-general"/>

ブラケット構文 `[]` による[コレクションリテラル](whatsnew24.md#support-for-collection-literals)のサポートを有効にします。

### -Xcompiler-plugin-order={plugin.before>plugin.after} {id="xcompiler-plugin-order-plugin-before-plugin-after"}
<primary-label ref="experimental-general"/>

コンパイラプラグインの実行順序を設定します。コンパイラは `plugin.before` を先に実行し、その後に `plugin.after` を実行します。

3つ以上のプラグインに対して複数の順序ルールを定義できます。例：

```bash
kotlinc -Xcompiler-plugin-order=plugin.first>plugin.middle
kotlinc -Xcompiler-plugin-order=plugin.middle>plugin.last
```

これにより、以下の実行順序になります：

1. `plugin.first`
2. `plugin.middle`
3. `plugin.last`

コンパイラプラグインが存在しない場合、対応するルールは無視されます。

以下のプラグインをそのIDで設定できます：

| コンパイラプラグイン | プラグインID |
|-----------------------------|--------------------------------------------|
| `all-open`, `kotlin-spring` | `org.jetbrains.kotlin.allopen`             |
| AtomicFU                    | `org.jetbrains.kotlinx.atomicfu`           |
| Compose                     | `androidx.compose.compiler.plugins.kotlin` |
| `js-plain-objects`          | `org.jetbrains.kotlinx.jspo`               |
| `jvm-abi-gen`               | `org.jetbrains.kotlin.jvm.abi`             |
| kapt                        | `org.jetbrains.kotlin.kapt3`               |
| Lombok                      | `org.jetbrains.kotlin.lombok`              |
| `no-arg`, `kotlin-jpa`      | `org.jetbrains.kotlin.noarg`               |
| Parcelize                   | `org.jetbrains.kotlin.parcelize`           |
| Power-assert                | `org.jetbrains.kotlin.powerassert`         |
| SAM with receiver           | `org.jetbrains.kotlin.samWithReceiver`     |
| Serialization               | `org.jetbrains.kotlinx.serialization`      |

この実行順序はコンパイラプラグインのバックエンドのみを制御し、フロントエンドは制御しません。

### -Xdata-flow-based-exhaustiveness {id="xdata-flow-based-exhaustiveness"}
<primary-label ref="experimental-general"/>

`when` 式に対するデータフローベースの網羅性チェックを有効にします。

### -Xexplicit-context-arguments {id="xexplicit-context-arguments"}
<primary-label ref="experimental-general"/>

コンテキストパラメータに対する明示的な[コンテキスト引数](context-parameters.md#pass-context-arguments-explicitly)を有効にします。

これにより、呼び出し側でコンテキスト引数を渡すことでオーバーロードの曖昧さを解決できます。

### -Xklib-ir-inliner {id="xklib-ir-inliner"}
<primary-label ref="experimental-general"/>

Kotlin/Native、Kotlin/JS、およびKotlin/Wasmで[モジュール内インライン化（intra-module inlining）](whatsnew24.md#consistent-intra-module-function-inlining-during-klib-compilation)を有効にするかどうかを設定します。デフォルトでは有効です。

このオプションは以下のモードをサポートしています：

* `disabled`: Kotlin/Native、Kotlin/JS、およびKotlin/Wasmのモジュール内インライン化を無効にします。
* `full`: モジュール間インライン化を有効にします。

### -Xintrinsic-const-evaluation {id="xintrinsic-const-evaluation"}
<primary-label ref="experimental-general"/>

[改良されたコンパイル時定数](whatsnew24.md#improved-compile-time-constants)を有効にします。

### -Xname-based-destructuring {id="xname-based-destructuring"}
<primary-label ref="experimental-opt-in"/>

コンパイラがプロパティ名に基づいて[分解宣言](destructuring-declarations.md#name-based-destructuring)をどのように解釈するかを設定します。

このオプションは以下のモードをサポートしています：

* `only-syntax`: 既存の分解宣言の動作を変更することなく、名前ベースの分解宣言の明示的な形式を有効にします。
* `name-mismatch`: データクラスにおける位置ベースの分解宣言がプロパティ名と一致しない変数名を使用している場合に警告を報告します。
* `complete`: 括弧を使用した短縮形式の名前ベースの分解宣言を有効にし、角括弧構文による位置ベースの分解宣言も引き続きサポートします。

### -Xphases-to-dump-before {id="xphases-to-dump-before"}
<primary-label ref="experimental-general"/>

IRローワリング（lowering）のコンパイルステージ後にダンプファイルを作成するには、`ExternalPackageParentPatcherLowering` に設定します。Kotlin/JVMの出力ディレクトリは、[`-Xdump-directory`](#xdump-directory) コンパイラオプションで設定します。

### -Xrepl {id="xrepl"}
<primary-label ref="experimental-general"/>

Kotlin REPLを起動します。

```bash
kotlinc -Xrepl
```

### -Xreturn-value-checker {id="xreturn-value-checker"}
<primary-label ref="experimental-general"/>

コンパイラが[無視された結果をどのように報告するか](unused-return-value-checker.md)を設定します：

* `disable`: 未使用の戻り値チェッカーを無効にします（デフォルト）。
* `check`: チェッカーを有効にし、マークされた関数からの無視された結果に対して警告を報告します。
* `full`: チェッカーを有効にし、プロジェクト内のすべての関数をマークされたものとして扱い、無視された結果に対して警告を報告します。

### 警告の管理 {id="warning-management"}

#### -nowarn {id="nowarn"}

コンパイル中のすべての警告を抑制します。

#### -Werror {id="werror"}

すべての警告をコンパイルエラーとして扱います。

#### -Wextra {id="wextra"}

該当する場合に警告を発する[追加の宣言、式、および型のコンパイラチェック](whatsnew21.md#extra-compiler-checks)を有効にします。

#### -Xrender-internal-diagnostic-names {id="xrender-internal-diagnostic-names"}
<primary-label ref="experimental-general"/>

警告とともに関係する内部診断名を出力します。これは、`-Xwarning-level` オプション用に設定する `DIAGNOSTIC_NAME` を特定するのに役立ちます。

#### -Xwarning-level {id="xwarning-level"}
<primary-label ref="experimental-general"/>

特定のコンパイラ警告の重大度レベルを設定します：

```bash
kotlinc -Xwarning-level=DIAGNOSTIC_NAME:(error|warning|disabled)
```

* `error`: 指定された警告のみをエラーに引き上げます。
* `warning`: 指定された診断に対して警告を発します（デフォルトで有効）。
* `disabled`: 指定された警告のみをモジュール全体で抑制します。

モジュール全体のルールと特定のルールを組み合わせることで、プロジェクト内の警告レポートを調整できます：

| コマンド | 説明 |
|----------------------------------------------------|-------------------------------------------------------------|
| `-nowarn -Xwarning-level=DIAGNOSTIC_NAME:warning`  | 指定されたものを除き、すべての警告を抑制します。 |
| `-Werror -Xwarning-level=DIAGNOSTIC_NAME:warning`  | 指定されたものを除き、すべての警告をエラーに引き上げます。 |
| `-Wextra -Xwarning-level=DIAGNOSTIC_NAME:disabled` | 指定されたものを除き、すべての追加チェックを有効にします。 |

一般的なルールから除外したい警告が多数ある場合は、[`@argfile`](#argfile) を使用して別のファイルにリストすることができます。

`DIAGNOSTIC_NAME` を調べるには、[`-Xrender-internal-diagnostic-names`](#xrender-internal-diagnostic-names) を使用できます。

### @argfile {id="argfile"}

指定されたファイルからコンパイラオプションを読み込みます。このようなファイルには、値付きのコンパイラオプションやソースファイルへのパスを含めることができます。オプションとパスは空白で区切る必要があります。例：

```
-include-runtime -d hello.jar hello.kt
```

空白を含む値を渡すには、シングルクォーテーション（**'**）またはダブルクォーテーション（**"**）で囲みます。値の中に引用符が含まれている場合は、バックスラッシュ（**\\**）でエスケープします。

```
-include-runtime -d 'My folder'
```

たとえば、コンパイラオプションとソースファイルを分けるために、複数の引数ファイルを渡すこともできます。

```bash
$ kotlinc @compiler.options @classes
```

ファイルが現在のディレクトリと異なる場所にある場合は、相対パスを使用してください。

```bash
$ kotlinc @options/compiler.options hello.kt
```

## Kotlin/JVMコンパイラオプション {id="kotlin-jvm-compiler-options"}

Kotlin/JVMコンパイラは、KotlinソースファイルをJavaクラスファイルにコンパイルします。
KotlinからJVMへのコンパイルを行うコマンドラインツールは `kotlinc` および `kotlinc-jvm` です。
これらを使用してKotlinスクリプトファイルを実行することもできます。

[共通オプション](#common-options)に加えて、Kotlin/JVMコンパイラには以下に挙げるオプションがあります。

### -classpath _path_ (-cp _path_) {id="classpath-path-cp-path"}

指定されたパスでクラスファイルを検索します。クラスパスの要素は、システムのパス区切り文字（Windowsでは **;**、macOS/Linuxでは **:**）で区切ります。
クラスパスには、ファイルやディレクトリのパス、ZIPファイル、またはJARファイルを含めることができます。

### -d _path_ {id="d-path"}

生成されたクラスファイルを指定された場所に配置します。場所にはディレクトリ、ZIP、またはJARファイルを指定できます。

### -include-runtime {id="include-runtime"}

結果のJARファイルにKotlinランタイムを含めます。これにより、生成されたアーカイブをJavaが有効な任意の環境で実行できるようになります。

### -jdk-home _path_ {id="jdk-home-path"}

デフォルトの `JAVA_HOME` と異なる場合に、クラスパスに含めるカスタムJDKホームディレクトリを使用します。

### -Xjdk-release=version {id="xjdk-release-version"}

<primary-label ref="experimental-general"/>

生成されるJVMバイトコードのターゲットバージョンを指定します。クラスパス内のJDKのAPIを指定されたJavaバージョンに制限します。
自動的に [`-jvm-target version`](#jvm-target-version) も設定されます。
指定可能な値は `1.8`、`9`、`10`、...、`26` です。

> このオプションは、すべてのJDKディストリビューションで有効であることが[保証されているわけではありません](https://youtrack.jetbrains.com/issue/KT-29974)。
>
{style="note"}

### -jvm-default _mode_ {id="jvm-default-mode"}

インターフェース内で宣言された関数をJVM上のデフォルトメソッドにコンパイルする方法を制御します。

| モード | 説明 |
|--------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| `enable`           | インターフェース内にデフォルト実装を生成し、サブクラスおよび `DefaultImpls` クラスにブリッジ関数を含めます。（デフォルト） |
| `no-compatibility` | 互換性ブリッジおよび `DefaultImpls` クラスを省略し、インターフェース内にデフォルト実装のみを生成します。 |
| `disable`          | デフォルトメソッドを省略し、互換性ブリッジおよび `DefaultImpls` クラスのみを生成します。 |

### -jvm-target _version_ {id="jvm-target-version"}

生成されるJVMバイトコードのターゲットバージョンを指定します。指定可能な値は `1.8`、`9`、`10`、...、`26` です。
デフォルト値は `%defaultJvmTargetVersion%` です。

### -java-parameters {id="java-parameters"}

メソッドパラメータのJava 1.8リフレクション用のメタデータを生成します。

### -module-name _name_ (JVM) {id="module-name-name-jvm"}

生成される `.kotlin_module` ファイルのカスタム名を設定します。
  
### -no-jdk {id="no-jdk"}

Javaランタイムをクラスパスに自動的に含めないようにします。

### -no-reflect {id="no-reflect"}

Kotlinリフレクション（`kotlin-reflect.jar`）をクラスパスに自動的に含めないようにします。

### -no-stdlib (JVM) {id="no-stdlib-jvm"}

Kotlin/JVM stdlib（`kotlin-stdlib.jar`）およびKotlinリフレクション（`kotlin-reflect.jar`）をクラスパスに自動的に含めないようにします。
  
### -script-templates _classnames[,]_ {id="script-templates-classnames"}

スクリプト定義テンプレートクラスです。完全修飾クラス名を使用し、カンマ（**,**）で区切ります。

### -Xadd-modules=module[,] {id="xadd-modules-module"}
<primary-label ref="experimental-general"/>

初期モジュールに加えて解決するルートモジュールを指定します。モジュールパス上のすべてのモジュールを解決するには、値に `ALL-MODULE-PATH` を設定します。複数のモジュールはカンマ（**,**）で区切ります。

たとえば、incubatorモジュールを解決する場合：

```bash
kotlinc -Xadd-modules=jdk.incubator.vector
```

### -Xdump-directory {id="xdump-directory"}
<primary-label ref="experimental-general"/>

[`-Xphases-to-dump-before`](#xphases-to-dump-before) コンパイラオプションのダンプファイルディレクトリを設定します。

### -Xjvm-expose-boxed {id="xjvm-expose-boxed"}
<primary-label ref="experimental-general"/>

モジュール内のすべてのインライン値クラス（inline value classes）のボックス化バージョンと、それらを使用する関数のボックス化バリアントを生成し、両方をJavaからアクセスできるようにします。詳細については、JavaからKotlinを呼び出すガイドの[インライン値クラス](java-to-kotlin-interop.md#inline-value-classes)を参照してください。

### -Xnullability-annotations {id="xnullability-annotations"}
<primary-label ref="experimental-general"/>

特定のJavaパッケージからのNull可能性アノテーション（nullability annotations）をKotlinコンパイラがどのように解釈するかを設定します。

サポートされているアノテーションと設定オプションの完全なリストについては、[Nullability annotations](java-interop.md#nullability-annotations)を参照してください。

## Kotlin/JSコンパイラオプション {id="kotlin-js-compiler-options"}

Kotlin/JSコンパイラは、KotlinソースファイルをJavaScriptコードにコンパイルします。
KotlinからJSへのコンパイルを行うコマンドラインツールは `kotlinc-js` です。

[共通オプション](#common-options)に加えて、Kotlin/JSコンパイラには以下に挙げるオプションがあります。

### -libraries _path_ {id="libraries-path"}

`.meta.js` および `.kjsm` ファイルを含むKotlinライブラリへのパス（システムのパス区切り文字で区切る）。

### -main _{call|noCall}_ {id="main-call-nocall"}

実行時に `main` 関数を呼び出すかどうかを定義します。

### -meta-info {id="meta-info"}

メタデータを含む `.meta.js` および `.kjsm` ファイルを生成します。JSライブラリを作成するときにこのオプションを使用します。

### -module-kind {umd|commonjs|amd|plain} {id="module-kind-umd-commonjs-amd-plain"}

コンパイラによって生成されるJSモジュールの種類：

- `umd` - [Universal Module Definition](https://github.com/umdjs/umd) モジュール
- `commonjs` - [CommonJS](http://www.commonjs.org/) モジュール
- `amd` - [Asynchronous Module Definition](https://en.wikipedia.org/wiki/Asynchronous_module_definition) モジュール
- `plain` - プレーンなJSモジュール
    
さまざまな種類のJSモジュールおよびそれらの違いの詳細については、[こちらの記事](https://www.davidbcalhoun.com/2014/what-is-amd-commonjs-and-umd/)を参照してください。

### -no-stdlib (JS) {id="no-stdlib-js"}

デフォルトのKotlin/JS stdlibをコンパイル依存関係に自動的に含めないようにします。

### -output _filepath_ {id="output-filepath"}

コンパイル結果の出力先ファイルを設定します。値には、ファイル名を含む `.js` ファイルへのパスを指定する必要があります。

### -output-postfix _filepath_ {id="output-postfix-filepath"}

指定されたファイルの内容を出力ファイルの末尾に追加します。

### -output-prefix _filepath_ {id="output-prefix-filepath"}

指定されたファイルの内容を出力ファイルの先頭に追加します。

### -source-map {id="source-map"}

ソースマップを生成します。

### -source-map-base-dirs _path_ {id="source-map-base-dirs-path"}

指定されたパスをベースディレクトリとして使用します。ベースディレクトリは、ソースマップ内の相対パスを計算するために使用されます。

### -source-map-embed-sources _{always|never|inlining}_ {id="source-map-embed-sources-always-never-inlining"}

ソースファイルをソースマップ内に埋め込みます。

### -source-map-names-policy _{simple-names|fully-qualified-names|no}_ {id="source-map-names-policy-simple-names-fully-qualified-names-no"}

Kotlinコードで宣言した変数名と関数名をソースマップに追加します。

| 設定 | 説明 | 出力例 |
|-------------------------|---------------------------------------------------------------|-----------------------------------|
| `simple-names`          | 変数名と単純な関数名が追加されます。（デフォルト） | `main`                            |
| `fully-qualified-names` | 変数名と完全修飾関数名が追加されます。 | `com.example.kjs.playground.main` |
| `no`                    | 変数名や関数名は追加されません。 | N/A                               |

### -source-map-prefix {id="source-map-prefix"}

ソースマップ内のパスに指定されたプレフィックスを追加します。

### -target {es5|es2015|es2020} {id="target-es5-es2015-es2020"}

指定されたECMAバージョン向けのJSファイルを生成します。

### -Xenable-implementing-interfaces-from-typescript {id="xenable-implementing-interfaces-from-typescript"}
<primary-label ref="experimental-general"/>

JavaScript/TypeScriptから、`@JsExport` アノテーションを付けてエクスポートされた[Kotlinインターフェースの実装](whatsnew2320.md#implementing-kotlin-interfaces-from-javascript-typescript)を許可します。

### -Xes-long-as-bigint {id="xes-long-as-bigint"}

モダンJavaScript（ES2020）へのコンパイル時に、Kotlinの `Long` 値を表すためにJavaScriptの `BigInt` 型のサポートを有効にします。
このオプションは `es5` および `es2015` ターゲットにのみ必要です。`es2020` ターゲットでは、このオプションがデフォルトで有効になっています。

### -Xsuspend-lambda-exporting {id="xsuspend-lambda-exporting"}
<primary-label ref="experimental-general"/>

`@JsExport` 宣言内で宣言された[suspendラムダ式のエクスポート](js-to-kotlin-interop.md#export-suspending-lambdas)を、JavaScriptの `async` 関数として許可します。

## Kotlin/Nativeコンパイラオプション {id="kotlin-native-compiler-options"}

Kotlin/Nativeコンパイラは、Kotlinソースファイルを[サポートされているプラットフォーム](native-overview.md#target-platforms)向けのネイティブバイナリにコンパイルします。
Kotlin/Nativeコンパイルのコマンドラインツールは `kotlinc-native` です。

[共通オプション](#common-options)に加えて、Kotlin/Nativeコンパイラには以下に挙げるオプションがあります。

### -enable-assertions (-ea) {id="enable-assertions-ea"}

生成されたコードで実行時アサーションを有効にします。

### -entry _name_ (-e _name_) {id="entry-name-e-name"}

修飾されたエントリポイント名を指定します。

### -g {id="g"}

デバッグ情報の出力を有効にします。このオプションは最適化レベルを低下させるため、[`-opt`](#opt) オプションと組み合わせるべきではありません。
    
### -generate-test-runner (-tr) {id="generate-test-runner-tr"}

プロジェクトからユニットテストを実行するためのアプリケーションを生成します。

### -generate-no-exit-test-runner (-trn) {id="generate-no-exit-test-runner-trn"}

明示的なプロセス終了（exit）を行わずにユニットテストを実行するアプリケーションを生成します。

### -include-binary _path_ (-ib _path_) {id="include-binary-path-ib-path"}

生成されたklibファイル内に外部バイナリをパックします。

### -library _path_ (-l _path_) {id="library-path-l-path"}

ライブラリとリンクします。Kotlin/Nativeプロジェクトでのライブラリの使用方法については、[Kotlin/Nativeライブラリ](native-libraries.md)を参照してください。

### -library-version _version_ (-lv _version_) {id="library-version-version-lv-version"}

ライブラリのバージョンを設定します。

### -linker-option {id="linker-option"}

バイナリのビルド中にリンカーに引数を渡します。これは、何らかのネイティブライブラリに対してリンクを行う場合に使用できます。

### -linker-options _args_ {id="linker-options-args"}

バイナリのビルド中にリンカーに複数の引数を渡します。引数は空白で区切ります。
    
### -list-targets {id="list-targets"}

利用可能なハードウェアターゲットを一覧表示します。

### -manifest _path_ {id="manifest-path"}

マニフェスト付加（addend）ファイルを提供します。

### -module-name _name_ (Native) {id="module-name-name-native"}

コンパイルモジュールの名前を指定します。
このオプションは、Objective-Cにエクスポートされる宣言の名前プレフィックスを指定するためにも使用できます：
[KotlinフレームワークにカスタムのObjective-Cプレフィックス/名前を指定するにはどうすればよいですか？](native-faq.md#how-do-i-specify-a-custom-objective-c-prefix-name-for-my-kotlin-framework)

### -native-library _path_ (-nl _path_) {id="native-library-path-nl-path"}

ネイティブビットコードライブラリを含めます。

### -no-default-libs {id="no-default-libs"}

コンパイラとともに配布されるビルド済みの[プラットフォームライブラリ](native-platform-libs.md)とユーザーコードのリンクを無効にします。

### -nomain {id="nomain"}

`main` エントリポイントが外部ライブラリによって提供されることを前提とします。

### -nopack {id="nopack"}

ライブラリをklibファイルにパックしません。

### -nostdlib {id="nostdlib"}

stdlibとリンクしません。

### -opt {id="opt"}

コンパイルの最適化を有効にし、実行時パフォーマンスが向上したバイナリを生成します。最適化レベルを低下させる [`-g`](#g) オプションと組み合わせることは推奨されません。

### -output _name_ (-o _name_) {id="output-name-o-name"}

出力ファイルの名前を設定します。

### -produce _output_ (-p _output_) {id="produce-output-p-output"}

出力ファイルの種類を指定します：

- `program`
- `static`
- `dynamic`
- `framework`
- `library`
- `bitcode`

### -repo _path_ (-r _path_) {id="repo-path-r-path"}

ライブラリの検索パス。詳細については、[ライブラリ検索シーケンス](native-libraries.md#library-search-sequence)を参照してください。

### -target _target_ {id="target-target"}

ハードウェアターゲットを設定します。利用可能なターゲットのリストを表示するには、[`-list-targets`](#list-targets) オプションを使用します。

### -Xccall-mode {id="xccall-mode"}
<primary-label ref="experimental-general"/>

cinterop経由でインポートされたCまたはObjective-Cライブラリ向けの[新しい相互運用モード](whatsnew2320.md#new-interoperability-mode-for-c-or-objective-c-libraries)を有効にします。

### -Xoverride-konan-properties=min.version.* {id="xoverride-konan-properties-min-version"}
<primary-label ref="experimental-general"/>

Kotlinのデフォルトよりも低いサポート対象のAppleターゲットバージョンを設定します。例：

```bash
kotlinc -Xoverride-konan-properties=minVersion.ios=14.0
kotlinc -Xoverride-konan-properties=minVersion.macos=11.0
kotlinc -Xoverride-konan-properties=minVersion.tvos=14.0
kotlinc -Xoverride-konan-properties=minVersion.watchos=7.0
```