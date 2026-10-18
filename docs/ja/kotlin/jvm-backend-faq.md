[//]: # (title: Kotlinバックエンド開発に関するFAQ)

このページでは、Mavenを使用したKotlinバックエンドアプリケーションのビルド、テスト、およびデプロイに関するよくある質問に回答します。
各回答には、Kotlinまたは外部のドキュメントにある詳細な説明へのリンクが含まれています。

## マルチモジュールビルド、BOM、およびバージョン管理 {id="multi-module-builds-bom-and-version-management"}

### マルチモジュールビルド全体で単一のKotlinバージョンに固定するにはどうすればよいですか？ {id="how-to-pin-a-single-kotlin-version-across-a-multi-module-build"}

親POMファイルで単一の `kotlin.version` プロパティを宣言し、それをすべての場所で再利用します。

* 親 `pom.xml` ファイルで `kotlin-maven-plugin` のバージョンを一度だけ設定します。これを行うには、`<properties>` セクションでKotlinのバージョンを設定し、`<build><plugins>` または `<build><pluginManagement>` セクションで `${kotlin.version}` として参照します。
  詳細については、[プロジェクト構成](mixing-java-kotlin-intellij.md#maven)を参照してください。
* Kotlin BOMファイルを使用してKotlinライブラリのバージョンを揃え、`kotlin-stdlib`、`kotlin-reflect`、`kotlin-test`、およびその他のアーティファクトが常に同じリリースに解決され、モジュールごとに異ならないようにします。
  詳細については、[BOMを使用した依存関係の管理](maven-set-dependencies.md#manage-dependencies-with-a-bom)を参照してください。

### Kotlin BOMとは何ですか？またどのように使用しますか？ {id="what-is-the-kotlin-bom-and-how-to-use-it"}

Kotlin BOM（`org.jetbrains.kotlin:kotlin-bom`）は、関連するアーティファクトが推移的依存関係として取り込まれる場合でも、同じKotlinリリースに揃うようにKotlinライブラリのバージョンを管理する特別なPOMファイルです。

`pom.xml` の `<dependencyManagement>` セクションで `<type>pom</type>` および `<scope>import</scope>` を指定してインポートします。
その後、`<version>` を指定せずにKotlinの依存関係を宣言できます。バージョンはBOMファイルから自動的に取得されます。

詳細については、[BOMを使用した依存関係の管理](maven-set-dependencies.md#manage-dependencies-with-a-bom)を参照してください。

### Kotlin MavenプラグインのバージョンとKotlinライブラリのバージョンを揃える必要がありますか？ {id="do-i-need-to-keep-the-kotlin-maven-plugin-version-aligned-with-kotlin-library-versions"}

はい。コンパイラのバージョンと互換性のないKotlinライブラリを混在させると、「Mixed Kotlin versions」エラーやメタデータの非互換性が発生する可能性があります。一貫性を保つ最も簡単な方法は、一度定義した同じKotlinバージョンを使用することです。例えば：

* 親 `pom.xml` ファイルで [`kotlin-maven-plugin`](maven-kotlin-compiler.md) のバージョンを一度設定し、すべての場所で `${kotlin.version}` として参照します。
* すべてのKotlinライブラリが同じリリースに従うように、[Kotlin BOM](maven-set-dependencies.md#manage-dependencies-with-a-bom) をインポートします。

### すべてのモジュールでKotlinコンパイラオプションを設定するにはどうすればよいですか？ {id="how-to-configure-kotlin-compiler-options-across-all-modules"}

すべてのMavenモジュールでKotlinコンパイラを設定するには、親 `pom.xml` ファイルの1箇所で次のいずれかの方法を使用してオプションを設定します。

* 親の `<properties>` セクションで、`kotlin.compiler.languageVersion`、`kotlin.compiler.apiVersion`、`kotlin.compiler.jvmTarget` などのコンパイラオプションを設定します。
* 親 `pom.xml` ファイルで単一の `kotlin-maven-plugin` の `<configuration>`（追加の `<args>` など）を共有し、すべてのモジュールが同じ設定でコンパイルされるようにします。

モジュール固有のオーバーライドも可能ですが、避けるべきです。オプションとそのプロパティ名の完全なリストについては、[コンパイラオプション](maven-kotlin-compiler.md)を参照してください。

### マルチモジュールビルドでバイトコードレベルの不一致が発生するのはなぜですか？ {id="why-do-i-get-bytecode-level-mismatches-in-a-multi-module-build"}

コードを実行しているJVMバージョンよりも新しいJVMバージョン向けにバイトコードが生成されたことを意味する、`UnsupportedClassVersionError` や同様のエラーが発生する場合があります。このような問題を回避するには、モジュール間およびCI全体で以下の一貫性を保ちます。

* Mavenを実行するJDK。
* Javaコンパイラのターゲット。
* Kotlinの `jvmTarget` オプション。

プロジェクトで `<extensions>` オプションが有効になっている場合、KotlinとJavaのコンパイラは自動的に同じバイトコードバージョンをターゲットにします。ビルドファイルのさまざまなオプションに基づいてKotlin MavenプラグインがJVMターゲットバージョンを解決する方法の詳細については、[JVMターゲットバージョン](maven-configure-project.md#jvm-target-version)を参照してください。

手動で設定する場合は、`maven-toolchains-plugin` を使用して、ビルド内のすべてのプラグインにわたるJDKバージョンを制御する単一のツールチェーンを設定します。詳細については、[JDKバージョンの設定](maven-configure-project.md#set-jdk-version)を参照してください。

## テスト: Surefire、Failsafe、JUnit {id="testing-surefire-failsafe-and-junit"}

### `mvn test` でKotlinテストがスキップされるのはなぜですか？ {id="why-does-mvn-test-skip-kotlin-tests"}

`mvn test` コマンドを実行しようとしたときに、「Tests run: 0」というエラーが発生することがあります。最も一般的な原因は以下の通りです。

* **テストの検出**: Surefireは `*Test` という命名パターンに従うテストを実行します。Failsafeプラグインは、`mvn verify` コマンドで `*IT` サフィックスが付いた名前の統合テストを実行します。詳細については、[テストの実行](jvm-test-maven.md#run-tests)を参照してください。
* **クラスパス上のエンジン不足**: JUnitがテストを検出して実行できるように、JUnitテストの依存関係を追加します。最も簡単な方法は、必要なJUnitアーティファクトを取り込む [`kotlin-test-junit5`](jvm-test-maven.md#junit-5-and-later) を使用することです。詳細については、[テストライブラリへの依存関係](maven-set-dependencies.md#dependencies-on-test-libraries)を参照してください。
* **テストソースがコンパイルされていない**: テストが実行される前にKotlinテストソースがコンパイルされるよう、Kotlinの `test-compile` ゴールが実行されていることを確認してください。

### JUnitテストを実行するようにSurefireプラグインを設定するにはどうすればよいですか？ {id="how-to-configure-the-surefire-plugin-to-run-junit-tests"}

JUnitテストを実行するようにSurefireプラグインを設定するには：

1. テストクラスパスにJUnitを含めるため、`<scope>test</scope>` を指定して [`kotlin-test-junit5`](jvm-test-maven.md#junit-5-and-later) などのJUnitテスト依存関係を追加します。
2. `pom.xml` ファイルに [Surefireプラグイン](jvm-test-maven.md#with-surefire-plugin) を追加します。
3. 「missing engine / wrong provider」エラーの原因となる、クラスパス上の競合するテストプロバイダーがないか確認します。

完全なセットアップとサンプルプロジェクトについては、[Mavenを使用したKotlinプロジェクトのテスト](jvm-test-maven.md)を参照してください。

### MavenのKotlinバックエンドをJUnit 6にアップグレードするにはどうすればよいですか？ {id="how-to-upgrade-a-maven-kotlin-backend-to-junit-6"}

Kotlin/JVMは、JUnit 6を含む最新の安定したJUnitバージョンをサポートしています。
JUnit 6の場合も、`pom.xml` で同じ [`kotlin-test-junit5`](jvm-test-maven.md#junit-5-and-later) の依存関係を維持します。

アップグレードの際は、以下を確認してください。

* 新しいJUnitリリースで必要とされるベースラインJavaバージョンが正しく設定されていること。
* すべてのJUnit関連の依存関係のバージョンが揃っていること。
* テストコードに非推奨のコンポーネントが含まれていないこと。

詳細については、[JUnitを使用したテストの作成](jvm-test-maven.md#create-tests-with-junit)を参照してください。

### 単体テストと統合テストを分離するにはどうすればよいですか？ {id="how-to-split-unit-and-integration-tests"}

実行を2つのプラグインに分割します。単体テストには、`test` フェーズで [Surefireプラグイン](jvm-test-maven.md#with-surefire-plugin) を使用します。
単体テストには `*Test` の命名規則を使用してください。

統合テストには、`integration-test` および `verify` フェーズで [Failsafeプラグイン](jvm-test-maven.md#with-failsafe-plugin) を使用します。統合テストには `*IT` の命名規則を使用してください。

単体テストのみを実行する場合は `mvn test` を、両方を実行する場合は `mvn verify` を実行します。

詳細については、[Mavenを使用したKotlinプロジェクトのテスト](jvm-test-maven.md)を参照してください。

## アノテーション処理: kaptとKSP {id="annotation-processing-kapt-and-ksp"}

### MavenでKSPを使用できますか？ {id="can-i-use-ksp-with-maven"}

現在KSPが公式にサポートしているのはGradleのみであるため、Mavenプロジェクトには [kapt](kapt.md) を使用することをお勧めします。
KSP用のコミュニティ製Mavenプラグインを試すこともできますが、それらには独自のリソースサポートおよびメンテナンス体制が伴います。

Mavenにおけるもう1つの選択肢は、ビルドフェーズでKSPの[コマンドライン](ksp-command-line.md)エントリポイントを実行することです。これは、KSPのコード生成をMavenのライフサイクルに組み込むことを意味します。`generate-sources` などの初期フェーズでKSPを実行し、生成されたコードを固定のディレクトリに出力します。その後、そのディレクトリをコンパイルソースルートに追加し、コードがコンパイルされるまでに生成されたソースが存在するように、Kotlinコンパイルの**前**にコード生成が実行されるようにします。

詳細については、[Kotlinプロジェクトでのアノテーションプロセッサの使用](jvm-annotation-processors.md)を参照してください。

### GradleベースのKotlinバックエンドでkaptとKSPのどちらを使用すべきですか？ {id="when-should-i-use-kapt-versus-ksp-in-a-gradle-based-kotlin-backend"}

KotlinのGradleプロジェクトで既存のJavaアノテーションプロセッサを使用したい場合は、まず [KSPがすでにそれらをサポートしているか](ksp-overview.md#supported-libraries) を確認してください。
サポートされていないプロセッサには [kapt](kapt.md) を使用します。

独自のアノテーションプロセッサを作成したい場合は、[KSP](ksp-quickstart.md#create-your-own-processor) を使用してください。

詳細については、[Kotlinプロジェクトのアノテーションプロセッサ](jvm-annotation-processors.md)を参照してください。

### kaptを設定するにはどうすればよいですか？ {id="how-to-configure-kapt"}

Kotlin Mavenプロジェクトでkaptを設定するには、`compile` の実行の**前**に `kotlin-maven-plugin` の `kapt` ゴールの実行を追加し、`<annotationProcessorPaths>` の下にアノテーションプロセッサを明示的にリストします。これにより、生成されたソースを参照するコードがコンパイルされる前に、ソースが確実に生成されます。

詳細については、[Mavenでのkaptのセットアップ](kapt.md#set-up-in-maven)および[MapStructでkaptを使用する](jvm-annotation-processors.md#use-kapt-with-java-annotation-processors)例を参照してください。

### 新しいJDKでkaptが失敗するのはなぜですか？ {id="why-does-kapt-fail-on-newer-jdks"}

kaptを統合したKotlinプロジェクトで最近のJDKを使用すると、「IllegalAccessError」または「InaccessibleObjectException」エラーが発生する場合があります。これは、アノテーション処理のためにkaptがアクセスする必要がある内部パッケージが強力にカプセル化（Strong Encapsulation）されていることが原因である可能性があります。

これを解決するには、Kotlinを最新バージョンに更新し、Mavenを実行するJVMに必要な `--add-opens` 引数を追加します。

`--add-opens` 引数は、強力なカプセル化によってデフォルトでブロックされている内部JDKパッケージへのディープリフレクションアクセスを許可するようJVMに指示します。これは `--add-opens <module>/<package>=<target-module>` の形式を使用し、クラスパスから実行されるコード（ビルドツールなど）の場合、`<target-module>` には通常 `ALL-UNNAMED` を指定します。例えば、kaptに必要なコンパイラ内部へのアクセスを許可するには次のようにします。

```bash
--add-opens jdk.compiler/com.sun.tools.javac.util=ALL-UNNAMED
```

これらの引数を適用する最も簡単な方法は、プロジェクトのルートにあるリポジトリレベルの `.mvn/jvm.config` ファイルに、1行に1つのJVM引数を記述して追加することです。Mavenはこのファイルからビルドを実行するJVMにすべてのオプションを自動的に渡すため、すべての開発者とCIランナーが同じ設定を使用できます。

kaptの設定の詳細については、[kaptコンパイラプラグイン](kapt.md)を参照してください。

### kaptはどこにソースを生成しますか？また、IDEのインポートを修正するにはどうすればよいですか？ {id="where-does-kapt-generate-sources-and-how-to-fix-their-ide-imports"}

kaptはモジュールの `target/` ディレクトリにソースを生成し、それらをソースルートとして追加することでビルドの一部としてコンパイルされるようにします。

IDEでインポートが「赤く」表示される場合は、Kotlin Mavenプロジェクトを再インポートして、生成されたソース用のディレクトリをIDEが認識できるようにしてください。

kaptの設定の詳細については、[kaptコンパイラプラグイン](kapt.md)を参照してください。

## 品質ゲート: フォーマットとカバレッジ {id="quality-gates-formatting-and-coverage"}

### Kotlinのフォーマットチェックを強制するにはどうすればよいですか？ {id="how-to-enforce-kotlin-formatting-checks"}

`pom.xml` ビルドファイルでktlintの `check` ゴールを `verify` フェーズにバインドし、フォーマットルールに違反した場合にCIが失敗するようにします。
`format` は開発者が明示的に実行するアクションとして残しておきます。フォーマットルールは `.editorconfig` ファイルで調整できます。

詳細については、[ktlintによるコードフォーマット](jvm-code-analysis.md#code-formatting-with-ktlint)を参照してください。
また、プロジェクトの品質ゲートに [detekt](jvm-code-analysis.md#code-analysis-with-detekt) による静的解析を追加することもできます。

### Java 17以降でKotlinのリンターやフォーマッターが失敗するのはなぜですか？ {id="why-do-kotlin-linters-or-formatters-fail-on-java-17"}

Java 17以降のバージョンでKotlinリンターまたはフォーマッターを使用すると、モジュールアクセスエラーが発生する場合があります。

これらのツールはMavenのJVM内で実行されるため、新しいJDKでは追加の `--add-opens` 引数が必要になる場合があります。各引数は、リフレクションアクセスのために内部JDKパッケージを開く `--add-opens <module>/<package>=ALL-UNNAMED` 形式を使用します。これらの引数をリポジトリレベルの `.mvn/jvm.config` ファイルに1行に1つずつ記述することで、同じ設定がリポジトリにチェックインされ、ローカルとCIの両方で使用されるようになります。詳細については、[新しいJDKでkaptが失敗するのはなぜですか？](#why-does-kapt-fail-on-newer-jdks)を参照してください。

### 推奨されるコードカバレッジツールは何ですか？ {id="which-code-coverage-tools-are-recommended"}

[Kover](https://github.com/Kotlin/kotlinx-kover) は、JetBrainsによるKotlin公式のカバレッジツールです。Kotlin固有の構造を理解し、組み込みの検証ルールを備えたMavenプラグインを提供するため、Kotlinファーストのプロジェクトに推奨される選択肢です。

もう1つの選択肢は、すでに確立されたJavaカバレッジパイプラインとレポーティング環境がある場合に [JaCoCo](https://github.com/jacoco/jacoco) を使用することです。

詳細については、[Koverによるコードカバレッジ](jvm-code-analysis.md#code-coverage-with-kover)を参照してください。

### マルチモジュールプロジェクトで集約されたカバレッジレポートを生成するにはどうすればよいですか？ {id="how-to-generate-an-aggregated-coverage-report-for-a-multi-module-project"}

Mavenプロジェクト内のすべてのモジュールのカバレッジレポートを生成するには、すべてのモジュールからカバレッジデータを収集し、他のモジュールに依存する専用のレポート用モジュールでそれを集約します。これにより、個々のモジュールが実行データを生成した後に集約処理が実行されます。このワークフローの実装には [`kover-maven-plugin`](https://kotlin.github.io/kotlinx-kover/maven-plugin/) を使用できます。

詳細については、[Koverによるコードカバレッジ](jvm-code-analysis.md#code-coverage-with-kover)を参照してください。

## アプリケーションのビルド: パッケージングとランタイム {id="building-applications-packaging-and-runtime"}

### 実行可能JARをビルドし、エントリポイントを設定するにはどうすればよいですか？ {id="how-to-build-a-runnable-jar-and-set-the-entry-point"}

実行可能JARをビルドするには、`Main-Class` エントリポイントを設定する必要があります。これは、トップレベルの `main()` 関数を持つKotlinファイルからコンパイルされたJVMクラスの名前である必要があります。例えば、`Main.kt` ファイル内の `main()` 関数は `MainKt` クラスにコンパイルされます。

`maven-jar-plugin` のマニフェスト設定を通じて、そのクラス名を `Main-Class` エントリポイントとして設定します。

詳細については、[JARファイルの作成](maven-compile-package.md#create-jar-files)を参照してください。

### パッケージ化されたアプリケーションがメインクラスのエラーで失敗するのはなぜですか？ {id="why-does-the-packaged-application-fail-with-main-class-errors"}

アプリケーションをビルドする際、特にコンテナ内で「Could not find or load main class（メイン・クラス...が見つからなかったかロードできませんでした）」というエラーが発生する場合があります。問題をデバッグするには、以下のチェックリストを確認してください。

* マニフェスト内の `Main-Class` が[正しいコンパイル済みクラス](#how-to-build-a-runnable-jar-and-set-the-entry-point)を指しているか確認します。
* 正しいアーティファクトを実行していることを確認します。薄い（thin）[JAR](maven-compile-package.md#create-jar-files) はクラスパス上にその依存関係が必要ですが、[自己完結型JAR](maven-compile-package.md#create-self-contained-jar-files) は依存関係をバンドルしています。
* コンテナのエントリポイントが正しい `java -jar` コマンドとクラスパスを使用しているか確認します。

### KotlinランタイムクラスとともにファットJARをビルドするにはどうすればよいですか？ {id="how-to-build-a-fat-jar-together-with-kotlin-runtime-classes"}

ファット（uber）JARをビルドし、Kotlinランタイムクラスの不足を防ぐには、依存関係をバンドルし、Kotlin標準ライブラリがランタイムクラスパスに確実に含まれるようにする自己完結型JARをビルドします。ファットJARには依存関係が含まれるため、[`kotlin-stdlib`](maven-set-dependencies.md#dependency-on-the-standard-library) を依存関係として宣言しておくことで、Kotlinランタイムが確実にパッケージ化されます。

詳細については、[自己完結型JARファイルの作成](maven-compile-package.md#create-self-contained-jar-files)を参照してください。

### JVM引数はどこに配置すべきですか？ {id="where-should-jvm-arguments-be"}

Mavenビルドプロセス用、テストJVM用、およびランタイム用のJVM引数は、次の3つに明確に分けて管理してください。

* **MavenビルドJVM**: 共有する引数をリポジトリレベルの `.mvn/jvm.config` ファイルに配置します。
* **テストJVM**: [Surefire](jvm-test-maven.md#with-surefire-plugin) および [Failsafe](jvm-test-maven.md#with-failsafe-plugin) プラグインの設定セクションに配置します。
* **ランタイム**: [パッケージ化されたアプリケーション](maven-compile-package.md) を起動するコンテナコマンドまたはデプロイ設定で設定します。

## ライブラリの公開: ソースと署名 {id="publishing-libraries-sources-and-signing"}

### Maven Centralに公開するための要件は何ですか？ {id="what-are-the-requirements-to-publish-to-maven-central"}

Kotlinライブラリを [Maven Central](https://central.sonatype.com/) に公開するには：

1. **アーティファクトの準備**: メインアーティファクト、[ソースJAR](#how-to-attach-and-deploy-a-source-jar)、およびドキュメント（Javadoc）JARをビルドします。
2. **POMメタデータの完成**: 名前、説明、ライセンス、開発者、SCM情報を入力します。
3. **アーティファクトの署名**: [CIに適した方法](#how-to-sign-artifacts-for-maven-central-in-a-ci-friendly-way)ですべてのアーティファクトのGPG署名を生成します。
4. **アーティファクトのデプロイ**: [`central-publishing-maven-plugin`](https://central.sonatype.org/publish/publish-portal-maven/) を使用して `mvn deploy` を実行し、デプロイバンドルを生成して、検証のためにMaven Centralにアップロードします。

   このプラグインはソースJAR、Javadoc JAR、またはGPG署名を自動生成しないため、これらの前提条件は個別に設定します。

Maven Centralのリリースはイミュータブル（不変）であることに注意してください。一度バージョンが公開されると、置き換えることはできません。

ドキュメントJARの生成に関する詳細については、[Dokkaドキュメントエンジン](dokka-maven.md)を参照してください。
完全な公開手順と要件については、公式の [Sonatypeドキュメント](https://central.sonatype.org/publish/publish-portal-maven/) を参照してください。

### ソースJARを添付してデプロイするにはどうすればよいですか？ {id="how-to-attach-and-deploy-a-source-jar"}

MavenベースのKotlinライブラリにソースJARを添付してデプロイするには、[`maven-source-plugin`](https://maven.apache.org/plugins/maven-source-plugin/) をビルドライフサイクルにバインドして、ソースアーティファクトが自動的に添付され、メインアーティファクトと一緒にデプロイされるようにします。

プロジェクトが一緒にリリースされる複数のライブラリを公開する場合は、Kotlinアーティファクトを揃えるのと同じ方法で利用者がバージョンを揃えられるよう、独自の [BOM](maven-set-dependencies.md#manage-dependencies-with-a-bom) ファイルを提供することを検討してください。

### CIに適した方法でMaven Central向けアーティファクトに署名するにはどうすればよいですか？ {id="how-to-sign-artifacts-for-maven-central-in-a-ci-friendly-way"}

CIに適した方法でMaven Centralのアーティファクトを設定するには、以下をお勧めします。

* プロジェクトの添付されたすべてのアーティファクトに署名するために [`maven-gpg-plugin`](https://maven.apache.org/plugins/maven-gpg-plugin/) を使用します。
* 鍵データとパスフレーズはコミットせず、CIシークレットまたは環境変数を通じて提供します。
* ソースJARやJavadoc JARを含むすべての公開アーティファクトに署名されるよう、署名がデプロイステップの前に実行されるようにします。

## トラブルシューティング {id="troubleshooting"}

### JDK 17でのプラグインエラーを修正するにはどうすればよいですか？ {id="how-to-fix-the-plugin-failure-on-jdk-17"}

JDK 17でKotlin Mavenプラグインのエラーが発生し、Mavenを実行するJVMに `--add-opens` 引数を追加するよう推奨される場合があります。

プロジェクトレベルでこれを修正するには、必要なJVM引数をリポジトリレベルの `.mvn/jvm.config` ファイルに1行に1引数ずつ記述して配置し、すべての開発者とCIランナーが同じ設定を使用するようにした上で、[Kotlinのバージョン](maven-kotlin-compiler.md) を最新に保ちます。これにより、ローカルとCIの挙動の一貫性が保たれます。

各 `--add-opens` 引数は、内部JDKパッケージをリフレクションアクセスのために開く `--add-opens <module>/<package>=ALL-UNNAMED` 形式に従います。詳細については、[新しいJDKでkaptが失敗するのはなぜですか？](#why-does-kapt-fail-on-newer-jdks)を参照してください。

### KotlinまたはAPIバージョンの不一致エラーが発生するのはなぜですか？ {id="why-do-i-get-mismatch-errors-for-kotlin-or-api-versions"}

「API version X is no longer supported」または「module was compiled with an incompatible version of Kotlin」というエラーが発生する場合があります。これらは、Kotlinコンパイラとクラスパス上のKotlinライブラリとの間の不一致を示しています。修正するには：

* コンパイラとすべてのKotlinライブラリで使用されるバージョンを揃えます。`<properties>` セクションでKotlinのバージョンを一度宣言して `${kotlin.version}` で参照し、[Kotlin BOM](maven-set-dependencies.md#manage-dependencies-with-a-bom) ファイルを使用します。
* 互換性のないバージョンを使用している古い推移的なKotlinアーティファクトを削除します。
* ターゲットにするKotlinバージョンに対して [`languageVersion` および `apiVersion`](maven-kotlin-compiler.md#attributes-specific-to-jvm) を確認します。