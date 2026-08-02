[//]: # (title: Kotlin/JSプロジェクトのセットアップ)

Kotlin/JSプロジェクトはビルドシステムとしてGradleを使用します。開発者がKotlin/JSプロジェクトを簡単に管理できるように、JavaScript開発に特有のルーチンを自動化するヘルパータスクとプロジェクト構成ツールを提供する`kotlin.multiplatform` Gradleプラグインを用意しています。

このプラグインは、[npm](https://www.npmjs.com/)または[Yarn](https://yarnpkg.com/)パッケージマネージャーを使用してバックグラウンドでnpm依存関係をダウンロードし、[webpack](https://webpack.js.org/)を使用してKotlinプロジェクトからJavaScriptバンドルをビルドします。依存関係の管理や構成の調整は、大部分をGradleビルドファイルから直接行うことができ、完全に制御するために自動生成された構成をオーバーライドするオプションも備えています。

Gradleプロジェクトに`org.jetbrains.kotlin.multiplatform`プラグインを手動で適用するには、`build.gradle(.kts)`ファイルに以下を記述します。

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

Kotlin Multiplatform Gradleプラグインを使用すると、ビルドスクリプトの`kotlin {}`ブロックでプロジェクトのさまざまな側面を管理できます。

```groovy
kotlin {
    // ...
}
```

`kotlin {}`ブロック内では、以下の側面を管理できます。

* [ターゲット実行環境](#execution-environments): ブラウザまたはNode.js 
* [ES2015機能のサポート](#support-for-es2015-features): クラス、モジュール、ジェネレーター
* [出力の粒度の設定](#configure-output-granularity)
* [TypeScript宣言ファイルの生成](#generation-of-typescript-declaration-files-d-ts)
* [プロジェクトの依存関係](#dependencies): Mavenおよびnpm
* [実行構成](#run-task)
* [テスト構成](#test-task)
* ブラウザプロジェクト用の[バンドル](#webpack-bundling)および[CSSサポート](#css)
* [ターゲットディレクトリ](#distribution-target-directory)および[モジュール名](#module-name)
* プロジェクトの[`package.json`ファイル](#package-json-customization)

## 実行環境

Kotlin/JSプロジェクトは、2つの異なる実行環境をターゲットにできます。

* ブラウザ：ブラウザでのクライアントサイドスクリプト用
* [Node.js](https://nodejs.org/)：ブラウザ外でJavaScriptコードを実行するため（例：サーバーサイドスクリプト）

Kotlin/JSプロジェクトのターゲット実行環境を定義するには、`js {}`ブロックの中に`browser {}`または`nodejs {}`を追加します。

```kotlin
kotlin {
    js {
        browser {
        }
        binaries.executable()
    }
}
```

`binaries.executable()`命令は、実行可能な`.js`ファイルを出力するようにKotlinコンパイラに明示的に指示します。`binaries.executable()`を省略すると、コンパイラはKotlin内部のライブラリファイルのみを生成します。これらは他のプロジェクトから使用できますが、単独で実行することはできません。

> これは通常、実行可能ファイルを作成するよりも高速であり、プロジェクトの末端ではない（non-leaf）モジュールを扱う際の最適化として利用できます。
>
{style="tip"}

Kotlin Multiplatformプラグインは、選択した環境で動作するようにタスクを自動的に構成します。これには、アプリケーションの実行とテストに必要な環境と依存関係のダウンロードとインストールが含まれます。これにより、開発者は追加の構成なしでシンプルなプロジェクトをビルド、実行、およびテストできます。既存のインストールを使用するオプションもあります。[プリインストールされたNode.jsの使用](#use-pre-installed-node-js)方法を確認してください。

## ES2015機能のサポート

Kotlinは、以下を含むES2015機能のサポートを提供しています。

* モジュール：コードベースを簡素化し、メンテナンス性を向上させます。
* クラス：OOPの原則を取り入れることができ、よりクリーンで直感的なコードになります。
* ジェネレーター：[サスペンド関数](https://kotlinlang.org/docs/composing-suspending-functions.html)のコンパイルに使用され、最終的なバンドルサイズを改善し、デバッグを容易にします。
* [JavaScriptコードのインライン化](js-interop.md#inline-javascript)。

`build.gradle(.kts)`ファイルに`es2015`コンパイルターゲットを追加することで、サポートされているすべてのES2015機能を一度に有効にできます。

```kotlin
tasks.withType<KotlinJsCompile>().configureEach {
    compilerOptions {
        target = "es2015"
    }
}
```

[ES2015 (ECMAScript 2015, ES6) の詳細については、公式ドキュメントを参照してください](https://262.ecma-international.org/6.0/)。

## 出力の粒度の設定

コンパイラがプロジェクト内の`.js`ファイルをどのように出力するかを選択できます。

* **モジュールごとに1つ（One per module）**。デフォルトでは、JSコンパイラはコンパイル結果として、プロジェクトのモジュールごとに個別の`.js`ファイルを出力します。
* **プロジェクトごとに1つ（One per project）**。`gradle.properties`ファイルに以下の行を追加することで、プロジェクト全体を単一の`.js`ファイルにコンパイルできます。

  ```none
  kotlin.js.ir.output.granularity=whole-program // デフォルトは 'per-module'
  ```

* **ファイルごとに1つ（One per file）**。Kotlinファイルごとに1つ（ファイルにエクスポートされた宣言が含まれている場合は2つ）のJavaScriptファイルを生成する、よりきめ細かい出力を設定できます。ファイルごとのコンパイルモードを有効にするには：
  1. プロジェクトでES2015機能をサポートするために、`es2015`を[コンパイルターゲット](#support-for-es2015-features)として設定します。
  2. `gradle.properties`ファイルに以下の行を追加します。
     ```none
     kotlin.js.ir.output.granularity=per-file // デフォルトは 'per-module'
     ```

## TypeScript宣言ファイル（`d.ts`）の生成
<primary-label ref="experimental-opt-in"/>

Kotlin/JSコンパイラは、KotlinコードからTypeScript定義を生成できます。これらの定義は、ハイブリッドアプリケーションを開発する際にJavaScriptツールやIDEによって以下のように使用されます。

* オートコンプリートの提供
* 静的解析ツールのサポート
* JavaScriptおよびTypeScriptプロジェクトへのKotlinコード追加の簡素化

TypeScript定義の生成は、特に[ビジネスロジックの共有ユースケース](js-overview.md#use-cases-for-kotlin-js)において価値があります。

コンパイラは、[`@JsExport`](js-to-kotlin-interop.md#jsexport-annotation)でマークされたトップレベルの宣言を収集し、`.d.ts`ファイルにTypeScript定義を自動的に生成します。

TypeScript定義を生成するには、Gradleビルドファイルで明示的に構成します。`build.gradle.kts`ファイルの[`js {}`ブロック](js-project-setup.md#execution-environments)に`generateTypeScriptDefinitions()`関数を追加します。

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

定義ファイルは、`build/js/packages/<package_name>/kotlin`ディレクトリに、対応するwebpack前のJavaScriptコードと一緒に生成されます。

## 依存関係

依存関係を宣言するには、`build.gradle(.kts)`ファイルの`jsMain`ソースセットにある`dependencies {}`ブロックを使用します。

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

Kotlin/JS用のアーティファクトを含むライブラリのみが依存関係として使用可能です。依存関係を解決するには、`build.gradle(.kts)`ファイルの`repositories {}`ブロックで、Gradleがそれらを探すリポジトリを宣言します。例：

```kotlin
repositories {
    mavenCentral()
}
```

追加するライブラリが[npmパッケージ](#npm-dependencies)に依存している場合、Gradleはそれらの推移的依存関係も自動的に解決します。

### Kotlin標準ライブラリ

[標準ライブラリ（standard library）](https://kotlinlang.org/api/latest/jvm/stdlib/index.html)への依存関係は自動的に追加されます。標準ライブラリのバージョンは、Kotlin Multiplatformプラグインのバージョンと同じになります。

マルチプラットフォームテストでは、[`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) APIが利用可能です。マルチプラットフォームプロジェクトを作成する場合、`commonTest`で単一の依存関係を使用することで、すべてのソースセットにテスト依存関係を追加できます。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        commonTest.dependencies {
            implementation(kotlin("test")) // すべてのプラットフォーム依存関係を自動的に取り込みます
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
                implementation kotlin("test") // すべてのプラットフォーム依存関係を自動的に取り込みます
            }
        }
    }
}
```

</tab>
</tabs>

### npm依存関係

JavaScriptの世界で依存関係を管理する最も一般的な方法は[npm](https://www.npmjs.com/)です。これはJavaScriptモジュールの最大のパブリックリポジトリを提供しています。

Kotlin Multiplatform Gradleプラグインを使用すると、他の依存関係を宣言するのと同様に、Gradleビルドスクリプトでnpm依存関係を宣言できます。

npm依存関係を宣言するには、依存関係宣言内の`npm()`関数に名前とバージョンを渡します。[npmのsemver構文](https://docs.npmjs.com/about-semantic-versioning)に基づいて、1つまたは複数のバージョン範囲を指定することもできます。

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

デフォルトでは、プラグインは[Yarn](https://yarnpkg.com/lang/en/)パッケージマネージャーの個別のインスタンスを使用して、npm依存関係をダウンロードおよびインストールします。これは追加の構成なしですぐに動作しますが、[特定のニーズに合わせて調整](#yarn)することもできます。

代わりに、[npm](https://www.npmjs.com/)パッケージマネージャーを直接使用してnpm依存関係を操作することもできます。パッケージマネージャーとしてnpmを使用するには、`gradle.properties`ファイルで以下のプロパティを設定します。

```none
kotlin.js.yarn=false
```

通常の依存関係以外に、Gradle DSLから使用できる3つの依存関係タイプがあります。それぞれの依存関係タイプをいつ使用するのが最適かについては、npmからリンクされている公式ドキュメントを参照してください。

* [devDependencies](https://docs.npmjs.com/files/package.json#devdependencies): `devNpm(...)` 経由
* [optionalDependencies](https://docs.npmjs.com/files/package.json#optionaldependencies): `optionalNpm(...)` 経由
* [peerDependencies](https://docs.npmjs.com/files/package.json#peerdependencies): `peerNpm(...)` 経由

npm依存関係がインストールされると、[KotlinからJSを呼び出す](js-interop.md)で説明されているように、そのAPIをコード内で使用できるようになります。

## runタスク

Kotlin Multiplatform Gradleプラグインは、追加の構成なしで純粋なKotlin/JSプロジェクトを実行できる`jsBrowserDevelopmentRun`タスクを提供します。

ブラウザでKotlin/JSプロジェクトを実行する場合、このタスクは`browserDevelopmentRun`タスク（Kotlinマルチプラットフォームプロジェクトでも利用可能）のエイリアスです。これは、JavaScriptアーティファクトを提供するために[webpack-dev-server](https://webpack.js.org/configuration/dev-server/)を使用します。
`webpack-dev-server`が使用する構成をカスタマイズしたい場合（例：サーバーが動作するポートの調整）、[webpack構成ファイル](#webpack-bundling)を使用してください。

Node.jsをターゲットとするKotlin/JSプロジェクトを実行するには、`nodeRun`タスクのエイリアスである`jsNodeDevelopmentRun`タスクを使用します。

プロジェクトを実行するには、標準ライフサイクルの`jsBrowserDevelopmentRun`タスク、またはそれが対応するエイリアスを実行します。

```bash
./gradlew jsBrowserDevelopmentRun
```

ソースファイルを変更した後にアプリケーションの再ビルドを自動的にトリガーするには、Gradleの[継続的ビルド（continuous build）](https://docs.gradle.org/current/userguide/command_line_interface.html#sec:continuous_build)機能を使用します。

```bash
./gradlew jsBrowserDevelopmentRun --continuous
```

または 

```bash
./gradlew jsBrowserDevelopmentRun -t
```

プロジェクトのビルドが成功すると、`webpack-dev-server`がブラウザページを自動的にリフレッシュします。

## testタスク

Kotlin Multiplatform Gradleプラグインは、プロジェクトのテストインフラストラクチャを自動的にセットアップします。ブラウザプロジェクトの場合、[Karma](https://karma-runner.github.io/)テストランナーとその他の必要な依存関係をダウンロードしてインストールします。Node.jsプロジェクトの場合、[Mocha](https://mochajs.org/)テストフレームワークが使用されます。 

このプラグインは、以下のような便利なテスト機能も提供します。

* ソースマップの生成
* テストレポートの生成
* コンソールでのテスト実行結果の表示

ブラウザテストを実行するために、プラグインはデフォルトで[Headless Chrome](https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md)を使用します。ビルドスクリプトの`useKarma {}`ブロック内に対応するエントリを追加することで、テストを実行する別のブラウザを選択することもできます。

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

あるいは、`gradle.properties`ファイルでブラウザのテストターゲットを追加することもできます。

```text
kotlin.js.browser.karma.browsers=firefox,safari
```

このアプローチにより、すべてのモジュールに対してブラウザのリストを定義し、特定のモジュールのビルドスクリプトで特定のブラウザを追加することができます。 

Kotlin Multiplatform Gradleプラグインは、これらのブラウザを自動的にインストールするわけではなく、実行環境で利用可能なブラウザのみを使用することに注意してください。例えば、継続的インテグレーション（CI）サーバーでKotlin/JSテストを実行している場合は、テスト対象のブラウザがインストールされていることを確認してください。

テストをスキップしたい場合は、`testTask {}`に`enabled = false`という行を追加します。

```kotlin
kotlin {
    js {
        browser {
            testTask {
                enabled = false
            }
        }
        binaries.executable()
        // ...
    }
}
```

テストを実行するには、標準ライフサイクルの`check`タスクを実行します。

```bash
./gradlew check
```

Node.jsテストランナーが使用する環境変数を指定するには（例：テストに外部情報を渡す、またはパッケージ解決を微調整するため）、ビルドスクリプトの`testTask {}`ブロック内で`environment()`関数をキーと値のペアで使用します。

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

### Karma構成

Kotlin Multiplatform Gradleプラグインは、ビルド時にKarma構成ファイルを自動的に生成します。これには、`build.gradle(.kts)`の[`kotlin.js.browser.testTask.useKarma {}`ブロック](#test-task)からの設定が含まれます。ファイルは`build/js/packages/projectName-test/karma.conf.js`にあります。 
Karmaが使用する構成を調整するには、プロジェクトのルートにある`karma.config.d`というディレクトリ内に追加の構成ファイルを配置します。このディレクトリ内のすべての`.js`構成ファイルが取得され、ビルド時に生成された`karma.conf.js`に自動的にマージされます。

Karmaのすべての構成機能は、Karmaの[ドキュメント](https://karma-runner.github.io/5.0/config/configuration-file.html)で詳しく説明されています。

## webpackによるバンドル

ブラウザターゲットの場合、Kotlin Multiplatform Gradleプラグインは広く知られた[webpack](https://webpack.js.org/)モジュールバンドラーを使用します。

### webpackタスク

最も一般的なwebpackの調整は、Gradleビルドファイルの`kotlin.js.browser.webpackTask {}`構成ブロックを介して直接行うことができます。
* `mainOutputFileName` - webpack出力ファイルの名前。webpackタスクの実行後、`<projectDir>/build/kotlin-webpack/<targetName>/<binaryName>`に生成されます。デフォルト値はプロジェクト名です。
* `output.libraryTarget` - webpack出力のモジュールシステム。 [Kotlin/JSプロジェクトで利用可能なモジュールシステム](js-modules.md)の詳細を確認してください。デフォルト値は`umd`です。
  
```groovy
webpackTask {
    mainOutputFileName = "mycustomfilename.js"
    output.libraryTarget = "commonjs2"
}
```

また、`commonWebpackConfig {}`ブロックで、バンドル、実行、およびテストタスクで使用する共通のwebpack設定を構成することもできます。

### webpack構成ファイル 

Kotlin Multiplatform Gradleプラグインは、ビルド時に標準のwebpack構成ファイルを自動的に生成します。これは`build/js/packages/projectName/webpack.config.js`にあります。

webpack構成をさらに調整したい場合は、プロジェクトのルートにある`webpack.config.d`というディレクトリ内に追加の構成ファイルを配置します。プロジェクトをビルドする際、すべての`.js`構成ファイルは自動的に`build/js/packages/projectName/webpack.config.js`ファイルにマージされます。
例えば、新しい[webpackローダー](https://webpack.js.org/loaders/)を追加するには、`webpack.config.d`ディレクトリ内の`.js`ファイルに以下を追加します。

> この場合、構成オブジェクトは`config`グローバルオブジェクトです。スクリプト内でこれを変更する必要があります。
>
{style="note"}

```groovy
config.module.rules.push({
    test: /\.extension$/,
    loader: 'loader-name'
});
```

webpackのすべての構成機能は、その[ドキュメント](https://webpack.js.org/concepts/configuration/)で詳しく説明されています。

### 実行可能ファイルのビルド

webpackを通じて実行可能なJavaScriptアーティファクトをビルドするために、Kotlin Multiplatform Gradleプラグインには`jsBrowserDevelopmentWebpack`および`jsBrowserProductionWebpack` Gradleタスクが含まれています。

* `jsBrowserDevelopmentWebpack`は開発用アーティファクトを作成します。これらはサイズは大きいですが、作成にかかる時間は短いです。そのため、活発な開発中には`jsBrowserDevelopmentWebpack`タスクを使用してください。
* `jsBrowserProductionWebpack`は、生成されたアーティファクトにデッドコード削除（Dead Code Elimination）を適用し、結果のJavaScriptファイルを最小化（minify）します。これには時間がかかりますが、サイズがより小さい実行可能ファイルが生成されます。そのため、本番環境での使用に向けてプロジェクトを準備する際には`jsBrowserProductionWebpack`タスクを使用してください。
 
 開発用または本番用のそれぞれのアーティファクトを取得するには、これらのタスクのいずれかを実行します。生成されたファイルは、[別途指定](#distribution-target-directory)しない限り、`build/kotlin-webpack`で利用可能になります。

```bash
./gradlew jsBrowserProductionWebpack
```

これらのタスクは、ターゲットが実行可能ファイルを生成するように構成されている（`binaries.executable()`経由）場合にのみ利用可能であることに注意してください。

`build/dist/<targetName>/<binaryName>`ディレクトリに配布物を生成するには、代わりに`jsBrowserDistribution`タスクを実行します。

```bash
./gradlew jsBrowserDistribution
```

このタスクは、プロジェクトのリソースを含む、すぐに使用可能な配布物を生成します。

## CSS

Kotlin Multiplatform Gradleプラグインは、webpackの[CSS](https://webpack.js.org/loaders/css-loader/)および[style](https://webpack.js.org/loaders/style-loader/)ローダーのサポートも提供します。すべてのオプションは、プロジェクトのビルドに使用される[webpack構成ファイル](#webpack-bundling)を直接変更することで変更できますが、最も頻繁に使用される設定は`build.gradle(.kts)`ファイルから直接利用できます。

プロジェクトでCSSサポートを有効にするには、Gradleビルドファイルの`commonWebpackConfig {}`ブロックで`cssSupport.enabled`オプションを設定します。この構成は、ウィザードを使用して新しいプロジェクトを作成する際にもデフォルトで有効になっています。

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

プロジェクトでCSSサポートを有効にすると、構成されていないプロジェクトからスタイルシートを使用しようとしたときに発生する一般的なエラー（`Module parse failed: Unexpected character '@' (14:0)`など）を防ぐのに役立ちます。

`cssSupport.mode`を使用して、検出されたCSSの処理方法を指定できます。以下の値が利用可能です。

* `"inline"` (デフォルト): スタイルがグローバルな`<style>`タグに追加されます。
* `"extract"`: スタイルが別のファイルに抽出されます。その後、HTMLページからインクルードできます。
* `"import"`: スタイルが文字列として処理されます。これは、コードからCSSにアクセスする必要がある場合に役立ちます（例：`val styles = require("main.css")`）。

同じプロジェクトで異なるモードを使用するには、`cssSupport.rules`を使用します。ここでは、モードを定義する`KotlinWebpackCssRules`のリストと、[include](https://webpack.js.org/configuration/module/#ruleinclude)および[exclude](https://webpack.js.org/configuration/module/#ruleexclude)パターンを指定できます。

## Node.js

Node.jsをターゲットとするKotlin/JSプロジェクトの場合、プラグインはホスト上にNode.js環境を自動的にダウンロードしてインストールします。既存のNode.jsインスタンスがある場合は、それを使用することもできます。

各サブプロジェクトに対してNode.js設定を構成したり、プロジェクト全体に対して設定したりできます。

### Node.jsバージョンの変更

デフォルトのNode.jsバージョンは現在24.16.0ですが、特定のサブプロジェクトで別のバージョンを使用できます。サブプロジェクトの`build.gradle(.kts)`ファイルに以下の行を追加します。例：

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

すべてのサブプロジェクトを含むプロジェクト全体に対してバージョンを設定するには、`allprojects {}`ブロックに同じコードを適用します。例：

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

### プリインストールされたNode.jsの使用

Kotlin/JSプロジェクトをビルドするホストにすでにNode.jsがインストールされている場合は、独自のNode.jsインスタンスをインストールする代わりにそれを使用するようにKotlin Multiplatform Gradleプラグインを構成できます。

プリインストールされたNode.jsインスタンスを使用するには、`build.gradle(.kts)`ファイルに以下の行を追加します。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
project.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin> {
    // デフォルトの動作にするには `true` に設定します
    project.the<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec>().download = false
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
project.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin) {
    // デフォルトの動作にするには `true` に設定します
    project.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec).download = false
}
```

</tab>
</tabs>

## Yarn

デフォルトでは、ビルド時に宣言された依存関係をダウンロードしてインストールするために、プラグインは独自の[Yarn](https://yarnpkg.com/lang/en/)パッケージマネージャーのインスタンスを管理します。これは追加の構成なしですぐに動作しますが、調整したり、ホストにすでにインストールされているYarnを使用したりすることもできます。

### Yarnの追加機能：.yarnrc

追加のYarn機能を構成するには、プロジェクトのルートに`.yarnrc`ファイルを配置します。
ビルド時に自動的に取得されます。

例えば、npmパッケージにカスタムレジストリを使用するには、プロジェクトルートの`.yarnrc`という名前のファイルに以下の行を追加します。

```text
registry "http://my.registry/api/npm/"
```

`.yarnrc`の詳細については、[公式のYarnドキュメント](https://classic.yarnpkg.com/en/docs/yarnrc/)を参照してください。

### プリインストールされたYarnの使用

Kotlin/JSプロジェクトをビルドするホストにすでにYarnがインストールされている場合は、独自のYarnインスタンスをインストールする代わりにそれを使用するようにKotlin Multiplatform Gradleプラグインを構成できます。

プリインストールされたYarnインスタンスを使用するには、`build.gradle(.kts)`に以下の行を追加します。

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

### kotlin-js-storeによるバージョンロック

プロジェクトルートの`kotlin-js-store`ディレクトリは、バージョンロックに必要な`yarn.lock`ファイルを保持するために、Kotlin Multiplatform Gradleプラグインによって自動的に生成されます。ロックファイルはYarnプラグインによって完全に管理され、`kotlinNpmInstall` Gradleタスクの実行中に更新されます。

[推奨されるプラクティス](https://classic.yarnpkg.com/blog/2016/11/24/lockfiles-for-all/)に従って、`kotlin-js-store`とその内容をバージョン管理システムにコミットしてください。これにより、すべてのマシンでまったく同じ依存関係ツリーを使用してアプリケーションがビルドされることが保証されます。

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

> ロックファイルの名前を変更すると、依存関係の検査ツールがファイルを認識できなくなる可能性があります。
> 
{style="warning"}

`yarn.lock`の詳細については、[公式のYarnドキュメント](https://classic.yarnpkg.com/lang/en/docs/yarn-lock/)を参照してください。

### yarn.lockが更新されたことの報告

Kotlin/JSは、`yarn.lock`ファイルが更新された場合に通知するGradle設定を提供しています。CIビルドプロセス中に`yarn.lock`が密かに変更された場合に通知を受け取りたいときに、これらの設定を使用できます。

* `YarnLockMismatchReport`：`yarn.lock`ファイルへの変更をどのように報告するかを指定します。以下のいずれかの値を使用できます。
    * `FAIL`：対応する Gradle タスクを失敗させます。これがデフォルトです。
    * `WARNING`：変更に関する情報を警告ログに書き込みます。
    * `NONE`：報告を無効にします。
* `reportNewYarnLock`：新しく作成された`yarn.lock`ファイルについて明示的に報告します。デフォルトでは、このオプションは無効になっています。初回起動時に新しい`yarn.lock`ファイルを生成するのが一般的だからです。このオプションを使用して、ファイルがリポジトリにコミットされていることを確認できます。
* `yarnLockAutoReplace`：Gradleタスクが実行されるたびに`yarn.lock`を自動的に置き換えます。

これらのオプションを使用するには、`build.gradle(.kts)`を以下のように更新します。

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

### デフォルトで --ignore-scripts を使用してnpm依存関係をインストールする

侵害されたnpmパッケージからの悪意のあるコード実行の可能性を減らすために、Kotlin Multiplatform Gradleプラグインは、デフォルトでnpm依存関係のインストール中の[ライフサイクルスクリプト](https://docs.npmjs.com/cli/v8/using-npm/scripts#life-cycle-scripts)の実行を阻止します。

`build.gradle(.kts)`に以下の行を追加することで、ライフサイクルスクリプトの実行を明示的に有効にできます。

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

## 配信ターゲットディレクトリ

デフォルトでは、Kotlin/JSプロジェクトのビルド結果はプロジェクトルート内の`/build/dist/<targetName>/<binaryName>`ディレクトリに置かれます。

プロジェクトの配布ファイルの別の場所を設定するには、ビルドスクリプトの`browser {}`ブロック内に`distribution {}`ブロックを追加し、`set()`メソッドを使用して`outputDirectory`プロパティに値を割り当てます。
プロジェクトのビルドタスクを実行すると、Gradleはプロジェクトリソースとともに出力バンドルをこの場所に保存します。

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

## モジュール名

対応する`.js`および`.d.ts`ファイルを含むJavaScript _モジュール_ （`build/js/packages/myModuleName`に生成される）の名前を調整するには、`outputModuleName`オプションを使用します。

```kotlin
kotlin {
    js {
        outputModuleName = "myModuleName"
    }
}
```

これは`build/dist`内のwebpack出力には影響しないことに注意してください。

## package.jsonのカスタマイズ

`package.json`ファイルは、JavaScriptパッケージのメタデータを保持します。npmなどの一般的なパッケージレジストリでは、公開されるすべてのパッケージにこのようなファイルが必要です。これを使用してパッケージの公開を追跡および管理します。

Kotlin Multiplatform Gradleプラグインは、ビルド中にKotlin/JSプロジェクトの`package.json`を自動的に生成します。デフォルトでは、このファイルには名前、バージョン、ライセンス、依存関係、およびその他のいくつかのパッケージ属性といった必須データが含まれています。

基本的なパッケージ属性以外に、`package.json`は、実行可能なスクリプトの特定など、JavaScriptプロジェクトの動作方法を定義できます。

Gradle DSLを介してプロジェクトの`package.json`にカスタムエントリを追加できます。`package.json`にカスタムフィールドを追加するには、`jsMain`ソースセットの`packageJson`ブロック内で`customField()`関数を使用します。

```kotlin
kotlin {
    sourceSets {
        jsMain {
            packageJson {
                customField("hello", mapOf("one" to 1, "two" to 2))
            }
        }
    }
}
```

プロジェクトをビルドすると、このコードは以下のブロックを`package.json`ファイルに追加します。

```json
"hello": {
    "one": 1,
    "two": 2
}
```

npmレジストリ用の`package.json`ファイルの作成についての詳細は、[npmドキュメント](https://docs.npmjs.com/cli/v6/configuring-npm/package-json)を参照してください。