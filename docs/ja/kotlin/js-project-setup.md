[//]: # (title: Kotlin/JSプロジェクトのセットアップ)

Kotlin/JSプロジェクトでは、ビルドシステムとしてGradleを使用します。開発者がKotlin/JSプロジェクトを簡単に管理できるように、JavaScript開発で一般的なルーティン作業を自動化するヘルパータスクと、プロジェクト設定ツールを提供する`kotlin.multiplatform` Gradleプラグインが用意されています。

このプラグインは、[npm](https://www.npmjs.com/)または[Yarn](https://yarnpkg.com/)パッケージマネージャーを使用してバックグラウンドでnpm依存関係をダウンロードし、[webpack](https://webpack.js.org/)を使用してKotlinプロジェクトからJavaScriptバンドルをビルドします。依存関係の管理や設定の調整は、その大部分をGradleビルドファイルから直接行うことができ、完全な制御が必要な場合は自動生成された設定をオーバーライドすることも可能です。

`build.gradle(.kts)`ファイル内で`org.jetbrains.kotlin.multiplatform`プラグインを手動でGradleプロジェクトに適用できます。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("multiplatform") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
}
```

</tab>
</tabs>

Kotlin Multiplatform Gradleプラグインを使用すると、ビルドスクリプトの`kotlin {}`ブロック内でプロジェクトのさまざまな側面を管理できます。

```groovy
kotlin {
    // ...
}
```

`kotlin {}`ブロック内では、以下の項目を設定・管理できます。

* [ターゲット実行環境](#execution-environments): ブラウザまたはNode.js
* [ECMAScriptターゲットの設定](#set-an-ecmascript-target): ES5、ES2015、またはES2020
* [出力粒度の設定](#configure-output-granularity)
* [TypeScript型定義ファイルの生成](#generation-of-typescript-declaration-files-d-ts)
* [プロジェクトの依存関係](#dependencies): Mavenおよびnpm
* [実行設定](#run-task)
* [テスト設定](#test-task)
* ブラウザプロジェクト向けの[バンドル](#webpack-bundling)と[CSSサポート](#css)
* [ターゲットディレクトリ](#distribution-target-directory)と[モジュール名](#module-name)
* [プロジェクトの`package.json`ファイル](#package-json-customization)

## 実行環境 {id="execution-environments"}

Kotlin/JSプロジェクトは、2つの異なる実行環境をターゲットにできます。

* ブラウザ: ブラウザ内でのクライアントサイドスクリプティング用
* [Node.js](https://nodejs.org/): サーバーサイドスクリプティングなど、ブラウザ外でJavaScriptコードを実行するため用

Kotlin/JSプロジェクトのターゲット実行環境を定義するには、内部に`browser {}`または`nodejs {}`を含んだ`js {}`ブロックを追加します。

```kotlin
kotlin {
    js {
        browser {
        }
        binaries.executable()
    }
}
```

`binaries.executable()`命令は、実行可能な`.js`ファイルを出力するようKotlinコンパイラに明示的に指示します。`binaries.executable()`を省略した場合、コンパイラはKotlin内部ライブラリファイルのみを生成します。これは他のプロジェクトからは使用できますが、単体で実行することはできません。

> これは通常、実行可能ファイルを作成するよりも高速であり、プロジェクトの非末端（リーフ以外）モジュールを扱う際の最適化となる場合があります。
>
{style="tip"}

Kotlin Multiplatformプラグインは、選択された環境で動作するようにタスクを自動的に設定します。これには、アプリケーションの実行およびテストに必要な環境と依存関係のダウンロードおよびインストールが含まれます。これにより、開発者は追加の設定なしでシンプルなプロジェクトをビルド、実行、テストできます。また、既存のインストール環境を使用するオプションもあります。詳細は[インストール済みNode.jsの使用](#use-pre-installed-node-js)を参照してください。

## ECMAScriptターゲットの設定 {id="set-an-ecmascript-target"}

Kotlin/JSは、ECMAScript標準のES5、ES2015、およびES2020バージョン用のJavaScriptを生成できます。ターゲット環境でサポートされている最新のバージョンを選択してください。

* `es5`は、古いJavaScript環境との互換性を提供し、デフォルトのターゲットです。
* `es2015`は、以下を含むES2015機能のサポートを有効にします。
    * コードベースをシンプルにし、保守性を向上させるモジュール。
    * OOP原則を取り入れ、よりクリーンで直感的なコードを実現するクラス。
    * 最終的なバンドルサイズを改善し、デバッグを容易にする[suspend関数](https://kotlinlang.org/docs/composing-suspending-functions.html)のコンパイル用ジェネレーター。
    * [JavaScriptコードのインライン化](js-interop.md#inline-javascript)。
* `es2020`には、サポートされているすべてのES2015機能が含まれ、コンパイラが生成されたJavaScriptコードでECMAScript 2020機能を使用できるようになります。例えば、Kotlinの`Long`値をJavaScriptの`BigInt`値にコンパイルします。

ECMAScriptターゲットを設定するには、`build.gradle(.kts)`ファイルで`target`プロパティを設定します。例えば、ES2020をターゲットにするには次のようにします。

```kotlin
tasks.withType<KotlinJsCompile>().configureEach {
    compilerOptions {
        target = "es2020"
    }
}
```

詳細は、[ES5](https://262.ecma-international.org/5.1/)、[ES2015](https://262.ecma-international.org/6.0/)、および[ES2020](https://262.ecma-international.org/11.0/)の各標準仕様を参照してください。

## 出力粒度の設定 {id="configure-output-granularity"}

プロジェクト内でコンパイラが`.js`ファイルを出力する方法を選択できます。

* **モジュールごと（One per module）**: デフォルトでは、JSコンパイラはコンパイル結果としてプロジェクトのモジュールごとに別々の`.js`ファイルを出力します。
* **プロジェクトごと（One per project）**: `gradle.properties`ファイルに次の行を追加することで、プロジェクト全体を単一の`.js`ファイルにコンパイルできます。

  ```properties
  # Default: per-module
  kotlin.js.ir.output.granularity=whole-program
  ```

* **ファイルごと（One per file）**: Kotlinファイルごとに1つ（ファイルにエクスポートされた宣言が含まれている場合は2つ）のJavaScriptファイルを生成する、より細かい粒度の出力を設定できます。ファイルごとのコンパイルモードを有効にするには、次のようにします。
  1. プロジェクトでES2015機能をサポートするために、[コンパイルターゲット](#set-an-ecmascript-target)として`es2015`または`es2020`を設定します。
  2. `gradle.properties`ファイルに次の行を追加します。
  
     ```properties
     # Default: per-module
     kotlin.js.ir.output.granularity=per-file
     ```

## TypeScript型定義ファイル（`d.ts`）の生成 {id="generation-of-typescript-declaration-files-d-ts"}
<primary-label ref="experimental-opt-in"/>

Kotlin/JSコンパイラは、KotlinコードからTypeScript定義を生成できます。これらの定義は、ハイブリッドアプリケーションで作業する際に、JavaScriptツールやIDEによって次のような目的で使用されます。

* オートコンプリートの提供
* 静的解析ツールのサポート
* JavaScriptおよびTypeScriptプロジェクトへのKotlinコード追加の簡素化

TypeScript定義の生成は、特に[ビジネスロジックを共有するユースケース](js-overview.md#use-cases-for-kotlin-js)において価値があります。

コンパイラは、[`@JsExport`](js-to-kotlin-interop.md#jsexport-annotation)でマークされたトップレベルの宣言を収集し、`.d.ts`ファイルにTypeScript定義を自動生成します。

TypeScript定義を生成するには、Gradleビルドファイルで明示的に設定する必要があります。`build.gradle.kts`ファイルの[`js {}`ブロック](js-project-setup.md#execution-environments)内に`generateTypeScriptDefinitions()`関数を追加します。

```kotlin
kotlin {
    js {
        binaries.executable()
        browser {
        }
        generateTypeScriptDefinitions()
    }
}
```

生成された定義は、対応する未webpackのJavaScriptコードと共に`build/js/packages/<package_name>/kotlin`ディレクトリに出力されます。

## 依存関係 {id="dependencies"}

依存関係を宣言するには、`build.gradle(.kts)`ファイルの`jsMain`ソースセット内にある`dependencies {}`ブロックを使用します。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        jsMain {
            dependencies {
                implementation("org.example.myproject:1.1.0")
            }
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets {
        jsMain {
            dependencies {
                implementation 'org.example.myproject:1.1.0'
            }
        }
    }
}
```

</tab>
</tabs>

依存関係として使用できるのは、Kotlin/JS用のアーティファクトを含むライブラリのみです。依存関係を解決するには、`build.gradle(.kts)`ファイルの`repositories {}`ブロックで、Gradleがそれらを検索するリポジトリを宣言します。例えば次のようになります。

```kotlin
repositories {
    mavenCentral()
}
```

追加するライブラリが[npmのパッケージ](#npm-dependencies)に依存している場合、Gradleはそれらの推移的依存関係も自動的に解決します。

### Kotlin標準ライブラリ {id="kotlin-standard-libraries"}

[標準ライブラリ](https://kotlinlang.org/api/latest/jvm/stdlib/index.html)への依存関係は自動的に追加されます。標準ライブラリのバージョンは、Kotlin Multiplatformプラグインのバージョンと同じになります。

マルチプラットフォームテスト用には、[`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) APIが利用可能です。マルチプラットフォームプロジェクトを作成する場合、`commonTest`に単一の依存関係を追加することで、すべてのソースセットにテスト依存関係を追加できます。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        commonTest.dependencies {
            implementation(kotlin("test")) // プラットフォーム固有の依存関係をすべて自動的に導入します
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets {
        commonTest {
            dependencies {
                implementation kotlin("test") // プラットフォーム固有の依存関係をすべて自動的に導入します
            }
        }
    }
}
```

</tab>
</tabs>

### npm依存関係 {id="npm-dependencies"}

JavaScriptの世界において、依存関係を管理する最も一般的な方法は[npm](https://www.npmjs.com/)です。npmはJavaScriptモジュールの最大のパブリックリポジトリを提供しています。

Kotlin Multiplatform Gradleプラグインを使用すると、他の依存関係を宣言するのとまったく同じように、Gradleビルドスクリプト内でnpm依存関係を宣言できます。

npm依存関係を宣言するには、依存関係宣言内の`npm()`関数にその名前とバージョンを渡します。[npmのセマンティックバージョニング（semver）構文](https://docs.npmjs.com/about-semantic-versioning)に基づいて、1つまたは複数のバージョン範囲を指定することもできます。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        jsMain {
            dependencies {
                implementation(npm("core-js", "^3.38.1"))
            }
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets {
        jsMain {
            dependencies {
                implementation npm('core-js', '^3.38.1')
            }
        }
    }
}
```

</tab>
</tabs>

デフォルトでは、プラグインは[Yarn](https://yarnpkg.com/lang/en/)パッケージマネージャーの独立したインスタンスを使用して、npm依存関係をダウンロードおよびインストールします。追加設定なしでそのまま動作しますが、[特定のニーズに合わせて調整する](#yarn)ことも可能です。

Yarnの代わりに、[npm](https://www.npmjs.com/)パッケージマネージャーを直接使用してnpm依存関係を扱うこともできます。パッケージマネージャーとしてnpmを使用するには、`gradle.properties`ファイルで次のプロパティを設定します。

```none
kotlin.js.yarn=false
```

通常の依存関係の他に、Gradle DSLから使用できる依存関係の種類がさらに3つあります。各種類の依存関係をどのような場合に使用するのが最適かについての詳細は、npmの公式ドキュメントを参照してください。

* `devNpm(...)`による[devDependencies](https://docs.npmjs.com/files/package.json#devdependencies)
* `optionalNpm(...)`による[optionalDependencies](https://docs.npmjs.com/files/package.json#optionaldependencies)
* `peerNpm(...)`による[peerDependencies](https://docs.npmjs.com/files/package.json#peerdependencies)

npm依存関係がインストールされたら、[KotlinからJSを呼び出す](js-interop.md)で説明されているように、コード内でそのAPIを使用できます。

## runタスク {id="run-task"}

Kotlin Multiplatform Gradleプラグインは、追加の設定なしで純粋なKotlin/JSプロジェクトを実行できる`jsBrowserDevelopmentRun`タスクを提供します。

ブラウザでKotlin/JSプロジェクトを実行する場合、このタスクは`browserDevelopmentRun`タスク（Kotlinマルチプラットフォームプロジェクトでも使用可能）のエイリアスとなります。これは、JavaScriptアーティファクトを提供（serve）するために[webpack-dev-server](https://webpack.js.org/configuration/dev-server/)を使用します。
サーバーが実行されるポートの調整など、`webpack-dev-server`で使用される設定をカスタマイズしたい場合は、[webpack設定ファイル](#webpack-bundling)を使用してください。

Node.jsをターゲットとするKotlin/JSプロジェクトを実行する場合は、`nodeRun`タスクのエイリアスである`jsNodeDevelopmentRun`タスクを使用します。

プロジェクトを実行するには、標準ライフサイクルの`jsBrowserDevelopmentRun`タスク、またはそれが対応するエイリアスを実行します。

```bash
./gradlew jsBrowserDevelopmentRun
```

ソースファイルに変更を加えた後にアプリケーションの再ビルドを自動的にトリガーするには、Gradleの[継続的ビルド（continuous build）](https://docs.gradle.org/current/userguide/command_line_interface.html#sec:continuous_build)機能を使用します。

```bash
./gradlew jsBrowserDevelopmentRun --continuous
```

または

```bash
./gradlew jsBrowserDevelopmentRun -t
```

プロジェクトのビルドが成功すると、`webpack-dev-server`は自動的にブラウザページをリフレッシュします。

## testタスク {id="test-task"}

Kotlin Multiplatform Gradleプラグインは、プロジェクトのテストインフラストラクチャを自動的にセットアップします。必要なテストランナーやその他の依存関係をダウンロードしてインストールします。

ブラウザプロジェクトの場合、[Karma](#karma)テストランナーと新しい[ブラウザテスト用DSL](#dsl-for-browser-testing)のいずれかを選択できます。Node.jsプロジェクトの場合は、[Mocha](#node-js)テストフレームワークが利用可能です。

プラグインは、次のような便利なテスト機能も提供します。

* ソースマップの生成
* テストレポートの生成
* コンソールでのテスト実行結果の表示

### Karma {id="karma"}

> Karmaプロジェクトは[非推奨（deprecated）](https://github.com/karma-runner/karma#karma)となりました。新機能の追加やバグ修正は予定されていません。ブラウザテストの代替手段として、新しい[ブラウザテスト用DSL](#dsl-for-browser-testing)をお試しください。
> 
{style="warning"}

[Karma](https://karma-runner.github.io/)テストランナーを設定するには、`build.gradle(.kts)`ファイルのブラウザの`testTask`内に`useKarma {}`ブロックを追加します。例えば、特定のブラウザに対してテストを実行するには、次のように記述します。

```kotlin
kotlin {
    js {
        browser {
            testTask {
                useKarma {
                    useIe()
                    useSafari()
                    useFirefox()
                    useChrome()
                    useChromeCanary()
                    useChromeHeadless()
                    usePhantomJS()
                    useOpera()
                }
            }
        }
        binaries.executable()
        // ...
    }
}
```

または、`gradle.properties`ファイルでブラウザのテストターゲットを追加することもできます。

```text
kotlin.js.browser.karma.browsers=firefox,safari
```

これにより、すべてのモジュールに対するブラウザのリストを定義した上で、特定のモジュールのビルドファイルで個別のブラウザを追加することができます。

Kotlin Multiplatform Gradleプラグインは、ビルド時に`build/js/packages/projectName-test/karma.conf.js`にKarma設定ファイルを自動生成します。このファイルには、ビルドファイルの`useKarma {}`ブロックで設定した内容が含まれます。

プロジェクトのルートにある`karma.config.d`ディレクトリ内に追加の設定ファイルを配置することもできます。このディレクトリ内のすべての`.js`設定ファイルは読み込まれ、ビルド時に生成された`karma.conf.js`に自動的にマージされます。

Karmaの設定の詳細については、[Karmaのドキュメント](https://karma-runner.github.io/6.4/config/configuration-file.html)を参照してください。

### ブラウザテスト用DSL {id="dsl-for-browser-testing"}
<primary-label ref="experimental-opt-in"/>

Kotlinは、ブラウザ環境でKotlin/JSテストを実行するための実験的なDSLを提供しています。これは特定の技術に依存しない（technology-agnostic）ように設計されています。現在の実装では、内部で以下のツールが使用されています。

* [Playwright](https://playwright.dev/): ブラウザドライバおよび配布マネージャーとして機能し、Chromium、Firefox、およびWebKit（Safari）ブラウザエンジンをサポートします。
* [Mocha](https://mochajs.org/): テストランナーとして機能します。
* [webpack](https://webpack.js.org/): バンドラーとして機能します（[今後のリリース](https://youtrack.jetbrains.com/issue/KT-48308/)で[Vite](https://vite.dev/)に置き換えられる予定です）。

新しいブラウザテスト用DSLを試すには、Kotlin/JSターゲットの`browser {}`内にオプトインの`test {}`ブロックを追加します。

```kotlin
import org.jetbrains.kotlin.gradle.ExperimentalJsTestDsl
import kotlin.time.Duration.Companion.seconds

kotlin {
    js {
        browser {
            @OptIn(ExperimentalJsTestDsl::class)
            test {
                // kotlin.Durationを使用してすべてのランナーのデフォルトタイムアウトを設定
                timeout = 30.seconds
                // Gradleプロバイダーを使用してヘッドレスモードを設定
                headless = providers
                    .environmentVariable("IS_IN_CI")
                    .map { it.toBoolean() }
                    .orElse(false)
                // カスタムChromiumランナーを有効化して設定
                chromium("chromium-no-webgl2") {
                    // このランナーのデフォルトタイムアウトをオーバーライド
                    timeout = 10.seconds

                    // Chromium固有の追加起動引数
                    launchArgs.add("--disable-webgl2")
                }
                // Firefoxランナーを有効化
                firefox()
                // WebKit (Safari) テストランナーを有効化
                webkit()
                // カスタムWebKitランナーを有効化して設定
                webkit("headful") {
                    headless = false
                }
            }
        }
    }
}
```

新しいブラウザテスト用DSLの設定の詳細については、[Kotlin/JSでのテストの実行](js-running-tests.md#advanced-configuration)を参照してください。

### Node.js {id="node-js-test-task"}

Node.jsプロジェクトの場合、Kotlin Multiplatform Gradleプラグインは[Mocha](https://mochajs.org/)テストフレームワークを自動的にセットアップします。

Node.jsテストランナーで使用される環境変数を指定するには（例えば、テストに外部情報を渡したり、パッケージ解決を微調整したりするため）、ビルドファイル内の`testTask {}`ブロック内でキーと値のペアを指定して`environment()`関数を使用します。

```kotlin
kotlin {
    js {
        nodejs {
            testTask {
                environment("key", "value")
            }
        }
    }
}
```

### テストの実行 {id="run-tests"}

デフォルトでは、Kotlin Multiplatform Gradleプラグインはブラウザテストの実行に[Headless Chrome](https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md)を使用します。ブラウザはプラグインにバンドルされていないため、テストランナーによってブラウザが見つからない場合の処理が異なります。

* [Karma](#karma)の場合、プラグインがテストを実行できるように、テスト対象のブラウザがマシンにすでにインストールされている必要があります。CI（継続的インテグレーション）サーバー上でKotlin/JSテストを実行する場合は、テスト対象のブラウザがそこにもインストールされていることを確認してください。
* 新しい[ブラウザテスト用DSL](#dsl-for-browser-testing)の場合、プラグインは初回実行時に[`playwright install`](https://playwright.dev/docs/browsers#install-browsers)コマンドを使用して必要なブラウザをインストールします。Playwrightがこれらのブラウザの配置場所を管理し、ローカルにインストールされているブラウザは使用しません。

テストを実行するには、標準ライフサイクルの`check`タスクを実行します。

```bash
./gradlew check
```

テストをスキップしたい場合は、ビルドファイル内の`testTask {}`ブロックでテストを無効にします。

```kotlin
kotlin {
    js {
        browser {
            testTask {
                enabled.set(false)
            }
        }
        binaries.executable()
        // ...
    }
}
```

## webpackバンドル {id="webpack-bundling"}

ブラウザターゲットに対して、Kotlin Multiplatform Gradleプラグインは広く知られている[webpack](https://webpack.js.org/)モジュールバンドラーを使用します。

### webpackタスク {id="webpack-task"}

最も一般的なwebpackの調整は、Gradleビルドファイルの`kotlin.js.browser.webpackTask {}`設定ブロックから直接行うことができます。
* `mainOutputFileName` − webpackでバンドルされた出力ファイルの名前。webpackタスクの実行後、`<projectDir>/build/kotlin-webpack/<targetName>/<binaryName>`に生成されます。デフォルト値はプロジェクト名です。
* `output.libraryTarget` − webpackで出力されるモジュールシステム。[Kotlin/JSプロジェクトで利用可能なモジュールシステム](js-modules.md)の詳細を参照してください。デフォルト値は`umd`です。
  
```groovy
webpackTask {
    mainOutputFileName = "mycustomfilename.js"
    output.libraryTarget = "commonjs2"
}
```

また、バンドル、実行、テストタスクで使用する共通のwebpack設定を`commonWebpackConfig {}`ブロックで構成することもできます。

### webpack設定ファイル {id="webpack-configuration-file"}

Kotlin Multiplatform Gradleプラグインは、ビルド時に標準のwebpack設定ファイルを自動的に生成します。これは`build/js/packages/projectName/webpack.config.js`に配置されます。

webpack設定をさらに調整したい場合は、プロジェクトのルートにある`webpack.config.d`というディレクトリ内に追加の設定ファイルを配置します。プロジェクトのビルド時に、すべての`.js`設定ファイルが`build/js/packages/projectName/webpack.config.js`ファイルに自動的にマージされます。
例えば、新しい[webpackローダー](https://webpack.js.org/loaders/)を追加するには、`webpack.config.d`ディレクトリ内の`.js`ファイルに次のように記述します。

> この場合、設定オブジェクトはグローバルオブジェクトの`config`になります。スクリプト内でこれを変更する必要があります。
>
{style="note"}

```groovy
config.module.rules.push({
    test: /\.extension$/,
    loader: 'loader-name'
});
```

webpackのすべての設定機能については、その[公式ドキュメント](https://webpack.js.org/concepts/configuration/)で詳しく説明されています。

### 実行可能ファイルのビルド {id="building-executables"}

webpackを介して実行可能なJavaScriptアーティファクトをビルドするために、Kotlin Multiplatform Gradleプラグインには`jsBrowserDevelopmentWebpack`および`jsBrowserProductionWebpack` Gradleタスクが含まれています。

* `jsBrowserDevelopmentWebpack`は、サイズは大きくなりますが短時間で作成できる開発用アーティファクトを作成します。そのため、アクティブな開発中は`jsBrowserDevelopmentWebpack`タスクを使用してください。
* `jsBrowserProductionWebpack`は、生成されたアーティファクトにデッドコード削除（DCE: dead code elimination）を適用し、結果のJavaScriptファイルを軽量化（minify）します。時間はかかりますが、より小さなサイズの実行可能ファイルが生成されます。そのため、本番環境用にプロジェクトを準備する際は`jsBrowserProductionWebpack`タスクを使用してください。
 
 開発用または本番用の各アーティファクトを取得するには、これらのタスクのいずれかを実行します。[別途指定](#distribution-target-directory)しない限り、生成されたファイルは`build/kotlin-webpack`に出力されます。

```bash
./gradlew jsBrowserProductionWebpack
```

これらのタスクは、ターゲットが（`binaries.executable()`によって）実行可能ファイルを生成するように設定されている場合にのみ使用可能である点に注意してください。

`build/dist/<targetName>/<binaryName>`ディレクトリにディストリビューション（配布用成果物）を生成するには、代わりに`jsBrowserDistribution`タスクを実行します。

```bash
./gradlew jsBrowserDistribution
```

このタスクは、プロジェクトのリソースを含むすぐに使用可能なディストリビューションを生成します。

## CSS {id="css"}

Kotlin Multiplatform Gradleプラグインは、webpackの[CSS](https://webpack.js.org/loaders/css-loader/)ローダーおよび[style](https://webpack.js.org/loaders/style-loader/)ローダーもサポートしています。すべてのオプションは、プロジェクトのビルドに使用される[webpack設定ファイル](#webpack-bundling)を直接変更することで変更できますが、最も一般的に使用される設定は`build.gradle(.kts)`ファイルから直接利用できます。

プロジェクトでCSSサポートを有効にするには、Gradleビルドファイルの`commonWebpackConfig {}`ブロックで`cssSupport.enabled`オプションを設定します。この設定は、ウィザードを使用して新しいプロジェクトを作成した場合、デフォルトでも有効になっています。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
browser {
    commonWebpackConfig {
        cssSupport {
            enabled.set(true)
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
browser {
    commonWebpackConfig {
        cssSupport {
            it.enabled = true
        }
    }
}
```

</tab>
</tabs>

あるいは、`webpackTask {}`、`runTask {}`、および`testTask {}`に対して個別にCSSサポートを追加することもできます。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
browser {
    webpackTask {
        cssSupport {
            enabled.set(true)
        }
    }
    runTask {
        cssSupport {
            enabled.set(true)
        }
    }
    testTask {
        useKarma {
            // ...
            webpackConfig.cssSupport {
                enabled.set(true)
            }
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
browser {
    webpackTask {
        cssSupport {
            it.enabled = true
        }
    }
    runTask {
        cssSupport {
            it.enabled = true
        }
    }
    testTask {
        useKarma {
            // ...
            webpackConfig.cssSupport {
                it.enabled = true
            }
        }
    }
}
```

</tab>
</tabs>

プロジェクトでCSSサポートを有効にすると、設定されていないプロジェクトからスタイルシートを使用しようとしたときに発生する`Module parse failed: Unexpected character '@' (14:0)`などの一般的なエラーを防ぐのに役立ちます。

`cssSupport.mode`を使用して、検出されたCSSの処理方法を指定できます。以下の値が使用可能です。

* `"inline"`（デフォルト）: スタイルはグローバルの`<style>`タグに追加されます。
* `"extract"`: スタイルは別ファイルに抽出されます。その後、HTMLページから読み込むことができます。
* `"import"`: スタイルは文字列として処理されます。これは、コードからCSSにアクセスする必要がある場合（`val styles = require("main.css")`など）に便利です。

同じプロジェクトで異なるモードを使用するには、`cssSupport.rules`を使用します。ここでは、各ルールがモード、ならびに[include](https://webpack.js.org/configuration/module/#ruleinclude)および[exclude](https://webpack.js.org/configuration/module/#ruleexclude)パターンを定義する`KotlinWebpackCssRules`のリストを指定できます。

## Node.js {id="node-js"}

Node.jsをターゲットとするKotlin/JSプロジェクトの場合、プラグインはホスト上にNode.js環境を自動的にダウンロードしてインストールします。既存のNode.jsインスタンスがある場合は、それを使用することもできます。

サブプロジェクトごとにNode.js設定を構成することも、プロジェクト全体に対して設定することもできます。

### Node.jsバージョンの変更 {id="change-node-js-version"}

現在のデフォルトのNode.jsバージョンは24.16.0ですが、特定のサブプロジェクトで別のバージョンを使用することもできます。サブプロジェクトの`build.gradle(.kts)`ファイルに次の行を追加します。例えば次のようになります。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
project.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin> {
    project.the<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec>().version = "26.2.0"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
project.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin) {
    project.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec).version = "26.2.0"
}
```

</tab>
</tabs>

すべてのサブプロジェクトを含むプロジェクト全体に対してバージョンを設定するには、同じコードを`allprojects {}`ブロックに適用します。例えば次のようになります。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
allprojects {
    project.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin> {
        project.the<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec>().version = "26.2.0"
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
allprojects {
    project.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin) {
        project.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec).version = "26.2.0"
    }
}
```

</tab>
</tabs>

### インストール済みNode.jsの使用 {id="use-pre-installed-node-js"}

Kotlin/JSプロジェクトをビルドするホストにNode.jsがすでにインストールされている場合、独自のNode.jsインスタンスをインストールする代わりに、それを使用するようにKotlin Multiplatform Gradleプラグインを設定できます。

インストール済みのNode.jsインスタンスを使用するには、`build.gradle(.kts)`ファイルに次の行を追加します。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
project.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin> {
    // デフォルトの動作にするには `true` に設定
    project.the<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec>().download = false
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
project.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin) {
    // デフォルトの動作にするには `true` に設定
    project.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec).download = false
}
```

</tab>
</tabs>

## Yarn {id="yarn"}

デフォルトでは、ビルド時に宣言された依存関係をダウンロードしてインストールするために、プラグインは[Yarn](https://yarnpkg.com/lang/en/)パッケージマネージャーの独自のインスタンスを管理します。追加設定なしでそのまま動作しますが、設定を調整したり、ホストにすでにインストールされているYarnを使用したりすることもできます。

### 追加のYarn機能: .yarnrc {id="additional-yarn-features-yarnrc"}

追加のYarn機能を設定するには、プロジェクトのルートに`.yarnrc`ファイルを配置します。ビルド時に自動的に読み込まれます。

例えば、npmパッケージにカスタムレジストリを使用するには、プロジェクトルートの`.yarnrc`という名前のファイルに次の行を追加します。

```text
registry "http://my.registry/api/npm/"
```

`.yarnrc`の詳細については、[Yarn公式ドキュメント](https://classic.yarnpkg.com/en/docs/yarnrc/)を参照してください。

### インストール済みYarnの使用 {id="use-pre-installed-yarn"}

Kotlin/JSプロジェクトをビルドするホストにYarnがすでにインストールされている場合、独自のYarnインスタンスをインストールする代わりに、それを使用するようにKotlin Multiplatform Gradleプラグインを設定できます。

インストール済みのYarnインスタンスを使用するには、`build.gradle(.kts)`に次の行を追加します。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
rootProject.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin> {
    rootProject.the<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootEnvSpec>().download = false
    // デフォルトの動作にするには "true"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
rootProject.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin) {
    rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootEnvSpec).download = false
}
 
```

</tab>
</tabs>

### kotlin-js-storeによるバージョンロック {id="version-locking-via-kotlin-js-store"}

プロジェクトルートの`kotlin-js-store`ディレクトリは、バージョンロックに必要な`yarn.lock`ファイルを保持するために、Kotlin Multiplatform Gradleプラグインによって自動的に生成されます。ロックファイルは完全にYarnプラグインによって管理され、`kotlinNpmInstall` Gradleタスクの実行中に更新されます。

[推奨されるプラクティス](https://classic.yarnpkg.com/blog/2016/11/24/lockfiles-for-all/)に従い、`kotlin-js-store`とその内容をバージョン管理システムにコミットしてください。これにより、すべてのマシンでまったく同じ依存関係ツリーを使用してアプリケーションがビルドされることが保証されます。

必要に応じて、`build.gradle(.kts)`でディレクトリ名とロックファイル名の両方を変更できます。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
rootProject.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin> {
    rootProject.the<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension>().lockFileDirectory =
        project.rootDir.resolve("my-kotlin-js-store")
    rootProject.the<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension>().lockFileName = "my-yarn.lock"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
rootProject.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin) {
    rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension).lockFileDirectory =
        file("my-kotlin-js-store")
    rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension).lockFileName = 'my-yarn.lock'
}
```

</tab>
</tabs>

> ロックファイルの名前を変更すると、依存関係検査ツールがファイルを認識しなくなる場合があります。
> 
{style="warning"}

`yarn.lock`の詳細については、[Yarn公式ドキュメント](https://classic.yarnpkg.com/lang/en/docs/yarn-lock/)を参照してください。

### yarn.lockが更新されたことのレポート {id="reporting-that-yarn-lock-has-been-updated"}

Kotlin/JSには、`yarn.lock`ファイルが更新された場合に通知できるGradle設定が用意されています。CIビルドプロセス中に`yarn.lock`がサイレントに変更された場合に通知を受け取りたい場合に、これらの設定を使用できます。

* `YarnLockMismatchReport`: `yarn.lock`ファイルの変更をどのようにレポートするかを指定します。以下のいずれかの値を使用できます。
    * `FAIL`: 対応するGradleタスクを失敗させます。これがデフォルトです。
    * `WARNING`: 変更に関する情報を警告ログに出力します。
    * `NONE`: レポートを無効にします。
* `reportNewYarnLock`: 最近作成された`yarn.lock`ファイルについて明示的にレポートします。初回起動時に新しい`yarn.lock`ファイルを生成するのが一般的な慣例であるため、デフォルトではこのオプションは無効になっています。このオプションを使用すると、ファイルがリポジトリにコミットされていることを確認できます。
* `yarnLockAutoReplace`: Gradleタスクが実行されるたびに、`yarn.lock`を自動的に置き換えます。

これらのオプションを使用するには、`build.gradle(.kts)`を次のように更新します。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.targets.js.yarn.YarnLockMismatchReport
import org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension

rootProject.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin> {
    rootProject.the<YarnRootExtension>().yarnLockMismatchReport =
        YarnLockMismatchReport.WARNING // NONE | FAIL
    rootProject.the<YarnRootExtension>().reportNewYarnLock = false // true
    rootProject.the<YarnRootExtension>().yarnLockAutoReplace = false // true
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.targets.js.yarn.YarnLockMismatchReport
import org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension

rootProject.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin) {
    rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension).yarnLockMismatchReport =
        YarnLockMismatchReport.WARNING // NONE | FAIL
    rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension).reportNewYarnLock = false // true
    rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension).yarnLockAutoReplace = false // true
}
```

</tab>
</tabs>

### デフォルトでの--ignore-scriptsを使用したnpm依存関係のインストール {id="installing-npm-dependencies-with-ignore-scripts-by-default"}

侵害されたnpmパッケージからの悪意のあるコードの実行リスクを低減するために、Kotlin Multiplatform Gradleプラグインは、デフォルトでnpm依存関係のインストール中に[ライフサイクルスクリプト](https://docs.npmjs.com/cli/v8/using-npm/scripts#life-cycle-scripts)を実行しないようにしています。

`build.gradle(.kts)`に次の行を追加することで、ライフサイクルスクリプトの実行を明示的に有効にできます。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
rootProject.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin> { 
    rootProject.the<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension>().ignoreScripts = false
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
rootProject.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin) {
    rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension).ignoreScripts = false
}
```

</tab>
</tabs>

## ディストリビューションターゲットディレクトリ {id="distribution-target-directory"}

デフォルトでは、Kotlin/JSプロジェクトのビルド結果はプロジェクトルート内の`/build/dist/<targetName>/<binaryName>`ディレクトリに配置されます。

プロジェクトの配布ファイルの場所を別の場所に変更するには、ビルドスクリプトの`browser {}`ブロック内に`distribution {}`ブロックを追加し、`set()`メソッドを使用して`outputDirectory`プロパティに値を設定します。プロジェクトのビルドタスクを実行すると、Gradleはプロジェクトのリソースと共に出力バンドルをこの場所に保存します。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    js {
        browser {
            distribution {
                outputDirectory.set(projectDir.resolve("output"))
            }
        }
        binaries.executable()
        // ...
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    js {
        browser {
            distribution {
                outputDirectory = file("$projectDir/output")
            }
        }
        binaries.executable()
        // ...
    }
}
```

</tab>
</tabs>

## モジュール名 {id="module-name"}

対応する`.js`および`.d.ts`ファイルを含む、JavaScript *モジュール*（`build/js/packages/myModuleName`に生成されます）の名前を調整するには、`outputModuleName`オプションを使用します。

```kotlin
kotlin {
    js {
        outputModuleName = "myModuleName"
    }
}
```

これは`build/dist`内のwebpackの出力には影響しないことに注意してください。

## package.jsonのカスタマイズ {id="package-json-customization"}

`package.json`ファイルは、JavaScriptパッケージのメタデータを保持します。npmなどの一般的なパッケージレジストリでは、公開されるすべてのパッケージにこのようなファイルが含まれていることが求められます。これらはパッケージの公開を追跡および管理するために使用されます。

Kotlin Multiplatform Gradleプラグインは、ビルド時にKotlin/JSプロジェクト用の`package.json`を自動的に生成します。デフォルトでは、このファイルには名前、バージョン、ライセンス、依存関係、およびその他のパッケージ属性などの基本データが含まれています。

基本的なパッケージ属性だけでなく、`package.json`は実行可能なスクリプトの特定など、JavaScriptプロジェクトがどのように動作すべきかを定義することもできます。

Gradle DSLを介してプロジェクトの`package.json`にカスタムエントリを追加できます。`package.json`にカスタムフィールドを追加するには、コンパイルの`packageJson`ブロック内で`customField()`関数を使用します。

```kotlin
kotlin {
    js {
        compilations["main"].packageJson {
            customField("hello", mapOf("one" to 1, "two" to 2))
        }
    }
}
```

プロジェクトをビルドすると、このコードによって`package.json`ファイルに次のブロックが追加されます。

```json
"hello": {
    "one": 1,
    "two": 2
}
```

npmレジストリ向けの`package.json`ファイルの記述の詳細については、[npmのドキュメント](https://docs.npmjs.com/cli/v6/configuring-npm/package-json)を参照してください。