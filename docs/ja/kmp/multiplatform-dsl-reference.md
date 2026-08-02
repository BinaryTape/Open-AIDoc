[//]: # (title: Multiplatform Gradle DSL リファレンス)

Kotlin Multiplatform Gradle プラグインは、Kotlin Multiplatform プロジェクトを作成するためのツールです。
ここでは、その内容のリファレンスを提供します。Kotlin Multiplatform プロジェクトの Gradle ビルドスクリプトを記述する際の備忘録として活用してください。[Kotlin Multiplatform プロジェクトの概念、作成および設定方法](multiplatform-discover-project.md)については、リンク先で学習できます。

## ID とバージョン

Kotlin Multiplatform Gradle プラグインの完全修飾名は `org.jetbrains.kotlin.multiplatform` です。
Kotlin Gradle DSL を使用する場合、`kotlin("multiplatform")` でプラグインを適用できます。
プラグインのバージョンは Kotlin のリリースバージョンと一致します。最新バージョンは %kotlinVersion% です。

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("multiplatform") version "%kotlinVersion%"
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
}
```

</TabItem>
</Tabs>

## トップレベルブロック

`kotlin {}` は、Gradle ビルドスクリプトにおけるマルチプラットフォームプロジェクト設定のトップレベルブロックです。
`kotlin {}` 内には、以下のブロックを記述できます。

| **ブロック**          | **説明**                                                                                                                         |
|----------------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| _&lt;targetName&gt;_ | プロジェクトの特定のターゲットを宣言します。利用可能なターゲットの名前は [ターゲット](#ターゲット) セクションにリストされています。                |
| `targets`            | プロジェクトのすべてのターゲットをリストします。                                                                                                       |
| `sourceSets`         | プロジェクトの定義済み [ソースセット](#ソースセット) の設定、およびカスタムソースセットの宣言を行います。                                                   |
| `compilerOptions`    | すべてのターゲットおよび共有ソースセットのデフォルトとして使用される、共通の拡張レベル [コンパイラオプション](#コンパイラオプション) を指定します。 |
| `dependencies`       | [共通の依存関係](#トップレベルでの依存関係の設定) を設定します。（実験的機能）                                              |

## ターゲット

*ターゲット（target）* は、サポートされているプラットフォームのいずれかに向けたソフトウェアのコンパイル、テスト、およびパッケージ化を担当するビルドの一部です。Kotlin は各プラットフォーム向けのターゲットを提供しており、特定のターゲット向けにコードをコンパイルするよう Kotlin に指示できます。[ターゲットの設定](multiplatform-discover-project.md#targets)についての詳細をご覧ください。

各ターゲットは、1 つ以上の [コンパイル](#コンパイル) を持つことができます。テスト用および製品用のデフォルトのコンパイルに加えて、[カスタムコンパイルを作成](multiplatform-configure-compilations.md#create-a-custom-compilation) することもできます。

マルチプラットフォームプロジェクトのターゲットは、`kotlin {}` 内の対応するブロック（例：`jvm`、`android`、`iosArm64`）で記述されます。
利用可能なターゲットの完全なリストは以下の通りです。

<table>
    
<tr>
<th>ターゲットプラットフォーム</th>
        <th>ターゲット</th>
        <th>コメント</th>
</tr>

    
<tr>
<td>Kotlin/JVM</td>
        <td><code>jvm</code></td>
        <td></td>
</tr>

    
<tr>
<td rowspan="2">Kotlin/Wasm</td>
        <td><code>wasmJs</code></td>
        <td>プロジェクトを JavaScript ランタイムで実行する予定がある場合に使用します。</td>
</tr>

    
<tr>
<td><code>wasmWasi</code></td>
        <td><a href="https://github.com/WebAssembly/WASI">WASI</a> システムインターフェースのサポートが必要な場合に使用します。</td>
</tr>

    
<tr>
<td>Kotlin/JS</td>
        <td><code>js</code></td>
        <td>
            <p>実行環境を選択してください：</p>
            <list>
                <li>ブラウザで実行されるアプリケーションの場合は <code>browser {}</code>。</li>
                <li>Node.js で実行されるアプリケーションの場合は <code>nodejs {}</code>。</li>
            </list>
            <p>詳細は <a href="https://kotlinlang.org/docs/js-project-setup.html#execution-environments">Kotlin/JS プロジェクトの設定</a> をご覧ください。</p>
        </td>
</tr>

    
<tr>
<td>Kotlin/Native</td>
        <td></td>
        <td>
            <p>macOS、Linux、および Windows ホストで現在サポートされているターゲットについては、<a href="https://kotlinlang.org/docs/native-target-support.html">Kotlin/Native ターゲットのサポート</a> をご覧ください。</p>
        </td>
</tr>

    
<tr>
<td>Android アプリケーションおよびライブラリ</td>
        <td><code>android</code></td>
        <td>
            <p>Android Gradle プラグイン（<code>com.android.application</code> または <code>com.android.kotlin.multiplatform.library</code>）を手動で適用してください。</p>
            <p>Gradle サブプロジェクトごとに作成できる Android ターゲットは 1 つだけです。</p>
        </td>
</tr>

</table>

> 現在のホストでサポートされていないターゲットはビルド中に無視されるため、パブリッシュ（公開）されません。
>
{style="note"}

```groovy
kotlin {
    jvm()
    iosArm64()
    macosArm64()
    js().browser()
}
```

ターゲットの設定には、以下の 2 つのパートを含めることができます。

* すべてのターゲットで利用可能な [共通ターゲット設定](#共通ターゲット設定)。
* ターゲット固有の設定。

各ターゲットは、1 つ以上の [コンパイル](#コンパイル) を持つことができます。

### 共通ターゲット設定

どのターゲットブロック内でも、以下の宣言を使用できます。

| **名前**            | **説明**                                                                                                                                                                            | 
|---------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `platformType`      | このターゲットの Kotlin プラットフォーム。利用可能な値：`jvm`, `androidJvm`, `js`, `wasm`, `native`, `common`。                                                                              |
| `artifactsTaskName` | このターゲットの成果物（artifact）をビルドするタスクの名前。                                                                                                                   |
| `components`        | Gradle パブリケーションの設定に使用されるコンポーネント。                                                                                                                                             |
| `compilerOptions`   | ターゲットに使用される [コンパイラオプション](#コンパイラオプション)。この宣言は、[トップレベル](multiplatform-dsl-reference.md#top-level-blocks) で設定された `compilerOptions {}` を上書きします。 |

### Web ターゲット

`js {}` ブロックは Kotlin/JS ターゲットの設定を記述し、`wasmJs {}` ブロックは JavaScript と相互運用可能な Kotlin/Wasm ターゲットの設定を記述します。ターゲットの実行環境に応じて、以下の 2 つのブロックのいずれかを含めることができます。

| **名前**              | **説明**                      | 
|-----------------------|--------------------------------------|
| [`browser`](#browser) | ブラウザターゲットの設定。 |
| [`nodejs`](#node-js)  | Node.js ターゲットの設定。 |

[Kotlin/JS プロジェクトの設定](https://kotlinlang.org/docs/js-project-setup.html) についての詳細をご覧ください。

独立した `wasmWasi {}` ブロックは、WASI システムインターフェースをサポートする Kotlin/Wasm ターゲットの設定を記述します。ここでは、[`nodejs`](#node-js) 実行環境のみが利用可能です。

```kotlin
kotlin {
    wasmWasi {
        nodejs()
        binaries.executable()
    }
}
```

すべての Web ターゲット（`js`、`wasmJs`、`wasmWasi`）は、`binaries.executable()` 呼び出しもサポートしています。これは、実行可能ファイルを生成するように Kotlin コンパイラに明示的に指示するものです。詳細については、Kotlin/JS ドキュメントの [実行環境](https://kotlinlang.org/docs/js-project-setup.html#execution-environments) を参照してください。

#### Browser

`browser {}` には、以下の設定ブロックを含めることができます。

| **名前**       | **説明**                                                            | 
|----------------|----------------------------------------------------------------------------|
| `testRuns`     | テスト実行の設定。                                           |
| `runTask`      | プロジェクト実行の設定。                                          |
| `webpackTask`  | [Webpack](https://webpack.js.org/) によるプロジェクトのバンドル設定。 |
| `distribution` | 出力ファイルへのパス。                                                      |

```kotlin
kotlin {
    js().browser {
        webpackTask { /* ... */ }
        testRuns { /* ... */ }
        distribution {
            directory = File("$projectDir/customdir/")
        }
    }
}
```

#### Node.js

`nodejs {}` には、テストおよび実行タスクの設定を含めることができます。

| **名前**   | **説明**                   | 
|------------|-----------------------------------|
| `testRuns` | テスト実行の設定。  |
| `runTask`  | プロジェクト実行の設定。 |

```kotlin
kotlin {
    js().nodejs {
        runTask { /* ... */ }
        testRuns { /* ... */ }
    }
}
```

### Native ターゲット

Native ターゲットでは、以下の特定のブロックが利用可能です。

| **名前**    | **説明**                                          | 
|-------------|----------------------------------------------------------|
| `binaries`  | 生成する [バイナリ](#バイナリ) の設定。       |
| `cinterops` | [C ライブラリとのインターオペラビリティ（相互運用）](#cinterops) の設定。 |

#### バイナリ

以下の種類のバイナリがあります。

| **名前**     | **説明**        | 
|--------------|------------------------|
| `executable` | 製品の実行可能ファイル。    |
| `test`       | テストの実行可能ファイル。       |
| `sharedLib`  | 共有ライブラリ。        |
| `staticLib`  | 静的ライブラリ。        |
| `framework`  | Objective-C フレームワーク。 |

```kotlin
kotlin {
    linuxX64 { // 代わりに自身のターゲットを使用してください。
        binaries {
            executable {
                // バイナリの設定。
            }
        }
    }
}
```

バイナリ設定には、以下のパラメータが利用可能です。

| **名前**             | **説明**                                                                                                                                                                                                                                              | 
|----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `compilation`        | バイナリがビルドされる元のコンパイル。デフォルトでは、`test` バイナリは `test` コンパイルに基づき、その他のバイナリは `main` コンパイルに基づきます。                                                                                            |
| `linkerOpts`         | バイナリのビルド中にシステムリンカーに渡されるオプション。                                                                                                                                                                                                    |
| `baseName`           | 出力ファイルのカスタムベース名。最終的なファイル名は、このベース名にシステム依存のプレフィックスとポスフィックスを追加して形成されます。                                                                                     |
| `entryPoint`         | 実行可能バイナリのエントリポイント関数。デフォルトではルートパッケージの `main()` です。                                                                                                                                                             |
| `outputFile`         | 出力ファイルへのアクセス。                                                                                                                                                                                                                                   |
| `linkTask`           | リンクタスクへのアクセス。                                                                                                                                                                                                                                     |
| `runTask`            | 実行可能バイナリの実行タスクへのアクセス。`linuxX64`、`macosArm64`、`mingwX64` 以外のターゲットの場合、値は `null` です。                                                                                                                            |
| `isStatic`           | Objective-C フレームワーク用. 動的ライブラリの代わりに静的ライブラリを含めます。                                                                                                                                                                              |
| `disableNativeCache` | <p>コンパイルキャッシュを無効にします。コンパイル時間が増加するため、例外的な場合にのみ使用してください。</p><p>キャッシュを無効にする Kotlin の `version` と `reason`（理由）を含める必要があります。オプションで、バグトラッカーの `issue`（課題）への URL を指定できます。</p> |

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
binaries {
    executable("my_executable", listOf(RELEASE)) {
        // test コンパイルをベースにバイナリをビルドする。
        compilation = compilations["test"]

        // リンカー用のカスタムコマンドラインオプション。
        linkerOpts = mutableListOf("-L/lib/search/path", "-L/another/search/path", "-lmylib")

        // 出力ファイルのベース名。
        baseName = "foo"

        // カスタムエントリポイント関数。
        entryPoint = "org.example.main"

        // 出力ファイルへのアクセス。
        println("Executable path: ${outputFile.absolutePath}")

        // リンクタスクへのアクセス。
        linkTask.dependsOn(additionalPreprocessingTask)

        // 実行タスクへのアクセス。
        // ホストプラットフォーム以外の場合、runTask は null になることに注意。
        runTask?.dependsOn(prepareForRun)
    }

    framework("my_framework" listOf(RELEASE)) {
        // フレームワークに動的ライブラリの代わりに静的ライブラリを含める。
        isStatic = true

        // このバイナリのコンパイルキャッシュを無効にする
        disableNativeCache(
            version = DisableCacheInKotlinVersion.2_3_0,
            reason = "Cache bug",
            issue = URI("https://youtrack.com/YY-1111")
        )
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
binaries {
    executable('my_executable', [RELEASE]) {
        // test コンパイルをベースにバイナリをビルドする。
        compilation = compilations.test

        // リンカー用のカスタムコマンドラインオプション。
        linkerOpts = ['-L/lib/search/path', '-L/another/search/path', '-lmylib']

        // 出力ファイルのベース名。
        baseName = 'foo'

        // カスタムエントリポイント関数。
        entryPoint = 'org.example.main'

        // 出力ファイルへのアクセス。
        println("Executable path: ${outputFile.absolutePath}")

        // リンクタスクへのアクセス。
        linkTask.dependsOn(additionalPreprocessingTask)

        // 実行タスクへのアクセス。
        // ホストプラットフォーム以外の場合、runTask は null になることに注意。
        runTask?.dependsOn(prepareForRun)
    }

    framework('my_framework' [RELEASE]) {
        // フレームワークに動的ライブラリの代わりに静的ライブラリを含める。
        isStatic = true

        // このバイナリのコンパイルキャッシュを無効にする
        disableNativeCache(
            version = DisableCacheInKotlinVersion .2_3_0,
            reason = 'Cache bug',
            issue = URI('https://youtrack.com/YY-1111')
        )
    }
}
```

</TabItem>
</Tabs>

[Native バイナリのビルド](multiplatform-build-native-binaries.md) についての詳細をご覧ください。

#### Cinterops

`cinterops` は、Native ライブラリとのインターオペラビリティに関する記述のコレクションです。
ライブラリとのインターオペラビリティを提供するには、`cinterops` にエントリを追加し、そのパラメータを定義します。

| **名前**         | **説明**                                       | 
|------------------|-------------------------------------------------------|
| `definitionFile` | Native API を記述した `.def` ファイル。            |
| `packageName`    | 生成される Kotlin API のパッケージプレフィックス。          |
| `compilerOpts`   | cinterop ツールによってコンパイラに渡されるオプション。 |
| `includeDirs`    | ヘッダーを検索するディレクトリ。                      |
| `header`         | バインディングに含めるヘッダー。                |
| `headers`        | バインディングに含めるヘッダーのリスト。   |

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    linuxX64 { // 必要なターゲットに置き換えてください。
        compilations.getByName("main") {
            val myInterop by cinterops.creating {
                // Native API を記述する定義ファイル。
                // デフォルトのパスは src/nativeInterop/cinterop/<interop-name>.def です。
                definitionFile.set(project.file("def-file.def"))

                // 生成された Kotlin API を配置するパッケージ。
                packageName("org.sample")

                // cinterop ツールによってコンパイラに渡されるオプション。
                compilerOpts("-Ipath/to/headers")

                // ヘッダー検索用のディレクトリ（コンパイラオプションの -I<path> と同等）。
                includeDirs.allHeaders("path1", "path2")

                // includeDirs.allHeaders のショートカット。
                includeDirs("include/directory", "another/directory")

                // バインディングに含めるヘッダーファイル。
                header("path/to/header.h")
                headers("path/to/header1.h", "path/to/header2.h")
            }

            val anotherInterop by cinterops.creating { /* ... */ }
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    linuxX64 { // 必要なターゲットに置き換えてください。
        compilations.main {
            cinterops {
                myInterop {
                    // Native API を記述する定義ファイル。
                    // デフォルトのパスは src/nativeInterop/cinterop/<interop-name>.def です。
                    definitionFile = project.file("def-file.def")

                    // 生成された Kotlin API を配置するパッケージ。
                    packageName 'org.sample'

                    // cinterop ツールによってコンパイラに渡されるオプション。
                    compilerOpts '-Ipath/to/headers'

                    // ヘッダー検索用のディレクトリ（コンパイラオプションの -I<path> と同等）。
                    includeDirs.allHeaders("path1", "path2")

                    // includeDirs.allHeaders のショートカット。
                    includeDirs("include/directory", "another/directory")

                    // バインディングに含めるヘッダーファイル。
                    header("path/to/header.h")
                    headers("path/to/header1.h", "path/to/header2.h")
                }

                anotherInterop { /* ... */ }
            }
        }
    }
}
```

</TabItem>
</Tabs>

cinterop のその他のプロパティについては、[定義ファイル（Definition file）](https://kotlinlang.org/docs/native-definition-file.html#properties) を参照してください。

### Android ターゲット

Kotlin Multiplatform Gradle プラグインには、Android ターゲットの [ビルドバリアント（build variants）](https://developer.android.com/studio/build/build-variants) を設定するのに役立つ特定の関数があります。

| **名前**                      | **説明**                                                                                                                                      | 
|-------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| `publishLibraryVariants()`    | パブリッシュするビルドバリアントを指定します。[Android ライブラリのパブリッシュ](multiplatform-publish-lib-setup.md#publish-an-android-library) についての詳細をご覧ください。 |

```kotlin
kotlin {
    android {
        publishLibraryVariants("release")
    }
}
```

[Android 向けのコンパイル](multiplatform-configure-compilations.md#compilation-for-android) についての詳細をご覧ください。

> `kotlin {}` ブロック内の `android` 設定は、Android プロジェクトのビルド設定を置き換えるものではありません。
> Android プロジェクトのビルドスクリプトの作成については、[Android 開発者ドキュメント](https://developer.android.com/studio/build) をご覧ください。
>
{style="note"}

## ソースセット

`sourceSets {}` ブロックはプロジェクトのソースセットを記述します。ソースセットには、リソースや依存関係とともに、一緒にコンパイルされる Kotlin ソースファイルが含まれます。

マルチプラットフォームプロジェクトには、そのターゲットのための [定義済み](#定義済みソースセット) ソースセットが含まれています。また、開発者は必要に応じて [カスタム](#カスタムソースセット) ソースセットを作成することもできます。

### 定義済みソースセット

定義済みソースセットは、マルチプラットフォームプロジェクトの作成時に自動的に設定されます。
利用可能な定義済みソースセットは以下の通りです。

| **名前**                                    | **説明**                                                                                                                                                                                               | 
|---------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `commonMain`                                | すべてのプラットフォーム間で共有されるコードとリソース。すべてのマルチプラットフォームプロジェクトで利用可能です。プロジェクトのすべてのメイン [コンパイル](#コンパイル) で使用されます。                                                        |
| `commonTest`                                | すべてのプラットフォーム間で共有されるテストコードとリソース。すべてのマルチプラットフォームプロジェクトで利用可能です。プロジェクトのすべてのテストコンパイルで使用されます。                                                                    |
| _&lt;targetName&gt;&lt;compilationName&gt;_ | コンパイルのためのターゲット固有のソース。_&lt;targetName&gt;_ は定義済みターゲットの名前、_&lt;compilationName&gt;_ はこのターゲットのコンパイルの名前です。例：`jsTest`、`jvmMain`。 |

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        commonMain { /* ... */ }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets { 
        commonMain { /* ... */ }
    }
}
```

</TabItem>
</Tabs>

[ソースセット](multiplatform-discover-project.md#source-sets) についての詳細をご覧ください。

### カスタムソースセット

カスタムソースセットは、プロジェクトの開発者が手動で作成します。
カスタムソースセットを作成するには、`sourceSets` セクション内にその名前のセクションを追加します。
Kotlin Gradle DSL を使用している場合は、カスタムソースセットに `by creating` を付けます。

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets { 
        val myMain by creating { /* ... */ } // 'myMain' という名前で新しいソースセットを作成
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets { 
        myMain { /* ... */ } // 'myMain' という名前でソースセットを作成または設定
    }
}
```

</TabItem>
</Tabs>

新しく作成されたソースセットは、他のソースセットと接続されていないことに注意してください。プロジェクトのコンパイルで使用するには、[他のソースセットと接続](multiplatform-hierarchy.md#manual-configuration) する必要があります。

### ソースセットパラメータ

ソースセットの設定は、`sourceSets {}` 内の対応するブロックに保存されます。ソースセットには以下のパラメータがあります。

| **名前**           | **説明**                                                                        | 
|--------------------|----------------------------------------------------------------------------------------|
| `kotlin.srcDir`    | ソースセットディレクトリ内の Kotlin ソースファイルの場所。                       |
| `resources.srcDir` | ソースセットディレクトリ内のリソースの場所。                                 |
| `dependsOn`        | [別のソースセットとの接続](multiplatform-hierarchy.md#manual-configuration)。 |
| `dependencies`     | ソースセットの [依存関係](#依存関係)。                                       |
| `languageSettings` | 共有ソースセットに適用される [言語設定](#言語設定)。              |

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin { 
    //...
    sourceSets { 
        commonMain {
            kotlin.srcDir("src")
            resources.srcDir("res")

            dependencies {
                /* ... */
            }
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin { 
    //...
    sourceSets { 
        commonMain {
            kotlin.srcDir('src')
            resources.srcDir('res')

            dependencies {
                /* ... */
            }
        }
    }
}
``` 

</TabItem>
</Tabs>

## コンパイル

ターゲットは、製品用やテスト用など、1 つ以上のコンパイルを持つことができます。ターゲットの作成時に自動的に追加される [定義済みコンパイル](#定義済みコンパイル) があります。さらに [カスタムコンパイル](#カスタムコンパイル) を作成することもできます。

ターゲットのすべてまたは一部の特定のコンパイルを参照するには、`compilations` オブジェクトコレクションを使用します。
`compilations` から、名前によってコンパイルを参照できます。

[コンパイルの設定](multiplatform-configure-compilations.md) についての詳細をご覧ください。

### 定義済みコンパイル

定義済みコンパイルは、Android ターゲットを除くプロジェクトの各ターゲットに対して自動的に作成されます。
利用可能な定義済みコンパイルは以下の通りです。

| **名前** | **説明**                     | 
|----------|-------------------------------------|
| `main`   | 製品ソース用のコンパイル。 |
| `test`   | テスト用のコンパイル。              |

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    jvm {
        val main by compilations.getting {
            output // メインコンパイルの出力を取得
        }

        compilations["test"].runtimeDependencyFiles // テストのランタイムクラスパスを取得
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    jvm {
        compilations.main.output // メインコンパイルの出力を取得
        compilations.test.runtimeDependencyFiles // テストのランタイムクラスパスを取得
    }
}
```

</TabItem>
</Tabs>

### カスタムコンパイル

定義済みコンパイルに加えて、独自のカスタムコンパイルを作成できます。
そのためには、新しいコンパイルと `main` コンパイルの間に [`associateWith`](https://kotlinlang.org/docs/gradle-configure-project.html#associate-compiler-tasks) 関係を設定します。Kotlin Gradle DSL を使用している場合は、カスタムコンパイルに `by creating` を付けます。

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    jvm {
        compilations {
            val main by getting
            val integrationTest by creating {
                // main とそのクラスパスを依存関係としてインポートし、internal 可視性を確立する
                associateWith(main)
                defaultSourceSet {
                    dependencies {
                        implementation(kotlin("test-junit"))
                        /* ... */
                    }
                }

                // このコンパイルによって生成されたテストを実行するためのテストタスクを作成する
                testRuns.create("integration") {
                    // テストタスクの設定
                    setExecutionSourceFrom(integrationTest)
                }
            }
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    jvm {
        compilations.create('integrationTest') {
            def main = compilations.main
            // main とそのクラスパスを依存関係としてインポートし、internal 可視性を確立する
            associateWith(main)
            defaultSourceSet {
                dependencies {
                    implementation kotlin('test-junit')
                    /* ... */
                }
            }

            // このコンパイルによって生成されたテストを実行するためのテストタスクを作成する
            testRuns.create('integration') {
                // テストタスクの設定
                setExecutionSourceFrom(compilations.integrationTest)
            }
        }
    }
}
```

</TabItem>
</Tabs>

コンパイルを関連付けることで、メインコンパイルの出力を依存関係として追加し、コンパイル間の `internal` 可視性を確立します。

[カスタムコンパイルを作成](multiplatform-configure-compilations.md#create-a-custom-compilation) する方法についての詳細をご覧ください。

### コンパイルパラメータ

コンパイルには以下のパラメータがあります。

| **名前**                 | **説明**                                                                                                                                                           | 
|--------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `defaultSourceSet`       | コンパイルのデフォルトソースセット。                                                                                                                                     |
| `kotlinSourceSets`       | コンパイルに参加するソースセット。                                                                                                                             |
| `allKotlinSourceSets`    | コンパイルに参加するソースセットおよび `dependsOn()` を介したそれらの接続。                                                                                     |
| `compilerOptions`        | コンパイルに適用されるコンパイラオプション。利用可能なオプションのリストについては、[コンパイラオプション](https://kotlinlang.org/docs/gradle-compiler-options.html) を参照してください。         |
| `compileKotlinTask`      | Kotlin ソースをコンパイルするための Gradle タスク。                                                                                                                                 |
| `compileKotlinTaskName`  | `compileKotlinTask` の名前。                                                                                                                                              |
| `compileAllTaskName`     | コンパイルのすべてのソースをコンパイルするための Gradle タスクの名前。                                                                                                       |
| `output`                 | コンパイルの出力。                                                                                                                                                   |
| `compileDependencyFiles` | コンパイルのコンパイル時依存関係ファイル（クラスパス）。すべての Kotlin/Native コンパイルにおいて、これには標準ライブラリとプラットフォーム依存関係が自動的に含まれます。 |
| `runtimeDependencyFiles` | コンパイルのランタイム依存関係ファイル（クラスパス）。                                                                                                                  |

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    jvm {
        val main by compilations.getting {
            compileTaskProvider.configure {
                compilerOptions {
                    // 'main' コンパイル用の Kotlin コンパイラオプションを設定：
                    jvmTarget.set(JvmTarget.JVM_1_8)
                }
            }
        
            compileKotlinTask // Kotlin タスク 'compileKotlinJvm' を取得 
            output // メインコンパイルの出力を取得
        }
        
        compilations["test"].runtimeDependencyFiles // テストのランタイムクラスパスを取得
    }

    // すべてのターゲットのすべてのコンパイルを設定：
    compilerOptions {
        allWarningsAsErrors.set(true)
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    jvm {
        compilations.main {
            compileTaskProvider.configure {
                compilerOptions {
                    // 'main' コンパイル用の Kotlin コンパイラオプションを設定：
                    jvmTarget = JvmTarget.JVM_1_8
                }
            }
        }

        compilations.main.compileKotlinTask // Kotlin タスク 'compileKotlinJvm' を取得 
        compilations.main.output // メインコンパイルの出力を取得
        compilations.test.runtimeDependencyFiles // テストのランタイムクラスパスを取得
    }

    // すべてのターゲットのすべてのコンパイルを設定：
    compilerOptions {
        allWarningsAsErrors = true
    }
}
```

</TabItem>
</Tabs>

## コンパイラオプション

プロジェクトのコンパイラオプションは、3 つの異なるレベルで設定できます。

* **拡張（Extension）レベル**: `kotlin {}` ブロック内。
* **ターゲット（Target）レベル**: 各ターゲットブロック内。
* **コンパイル単位（Compilation unit）レベル**: 通常、特定のコンパイルタスク内。

![Kotlin コンパイラオプションのレベル](compiler-options-levels.svg){width=700}

上位レベルの設定は、下位レベルのデフォルトとして機能します。

* 拡張レベルで設定されたコンパイラオプションは、ターゲットレベルのオプションのデフォルトになります。これには、`commonMain`、`nativeMain`、`commonTest` などの共有ソースセットも含まれます。
* ターゲットレベルで設定されたコンパイラオプションは、`compileKotlinJvm` や `compileTestKotlinJvm` タスクなどのコンパイル単位（タスク）レベルのオプションのデフォルトになります。

下位レベルで行われた設定は、上位レベルの同様の設定を上書きします。

* タスクレベルのコンパイラオプションは、ターゲットまたは拡張レベルの同様の設定を上書きします。
* ターゲットレベルのコンパイラオプションは、拡張レベルの同様の設定を上書きします。

利用可能なコンパイラオプションのリストについては、[すべてのコンパイラオプション](https://kotlinlang.org/docs/gradle-compiler-options.html#all-compiler-options) を参照してください。

### 拡張レベル

プロジェクト内のすべてのターゲットに対してコンパイラオプションを設定するには、トップレベルの `compilerOptions {}` ブロックを使用します。

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    // すべてのターゲットのすべてのコンパイルを設定
    compilerOptions {
        allWarningsAsErrors.set(true)
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    // すべてのターゲットのすべてのコンパイルを設定：
    compilerOptions {
        allWarningsAsErrors = true
    }
}
```

</TabItem>
</Tabs>

### ターゲットレベル

プロジェクト内の特定のターゲットに対してコンパイラオプションを設定するには、ターゲットブロック内の `compilerOptions {}` ブロックを使用します。

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    jvm {
        // JVM ターゲットのすべてのコンパイルを設定
        compilerOptions {
            allWarningsAsErrors.set(true)
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    jvm {
        // JVM ターゲット의 모든 컴파일을 설정합니다
        compilerOptions {
            allWarningsAsErrors = true
        }
    }
}
```

</TabItem>
</Tabs>

### コンパイル単位レベル

特定のタスクに対してコンパイラオプションを設定するには、タスク内の `compilerOptions {}` ブロックを使用します。

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
task.named<KotlinJvmCompile>("compileKotlinJvm") {
    compilerOptions {
        allWarningsAsErrors.set(true)
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
task.named<KotlinJvmCompile>("compileKotlinJvm") {
    compilerOptions {
        allWarningsAsErrors = true
    }
}
```

</TabItem>
</Tabs>

特定のコンパイルに対してコンパイラオプションを設定するには、コンパイルのタスクプロバイダー内で `compilerOptions {}` ブロックを使用します。

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    jvm {
        compilations.named(KotlinCompilation.MAIN_COMPILATION_NAME) {
            compileTaskProvider.configure {
                // 'main' コンパイルを設定：
                compilerOptions {
                    allWarningsAsErrors.set(true)
                }
            }
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    jvm {
        compilations.named(KotlinCompilation.MAIN_COMPILATION_NAME) {
            compileTaskProvider.configure {
                // 'main' コンパイルを設定：
                compilerOptions {
                    allWarningsAsErrors = true
                }
            }
        }
    }
}
```

</TabItem>
</Tabs>

### `kotlinOptions {}` から `compilerOptions {}` への移行 {collapsible="true"}

Kotlin 2.2.0 より前は、`kotlinOptions {}` ブロックを使用してコンパイラオプションを設定できました。Kotlin 2.2.0 で `kotlinOptions {}` ブロックが非推奨になったため、代わりにビルドスクリプトで `compilerOptions {}` ブロックを使用する必要があります。詳細については、[`kotlinOptions{}` から `compilerOptions{}` への移行](https://kotlinlang.org/docs/gradle-compiler-options.html#migrate-from-kotlinoptions-to-compileroptions) を参照してください。

## 依存関係

ソースセット宣言の `dependencies {}` ブロックには、そのソースセットの依存関係が含まれます。

[依存関係の設定](https://kotlinlang.org/docs/gradle-configure-project.html) についての詳細をご覧ください。

依存関係には 4 つのタイプがあります。

| **名前**         | **説明**                                                                     | 
|------------------|-------------------------------------------------------------------------------------|
| `api`            | 現在のモジュールの API で使用される依存関係。                                 |
| `implementation` | モジュール内で使用されるが、モジュール外部には公開されない依存関係。                         |
| `compileOnly`    | 現在のモジュールのコンパイルにのみ使用される依存関係。                       |
| `runtimeOnly`    | 実行時に利用可能だが、どのモジュールのコンパイル時にも表示されない依存関係。 |

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        commonMain {
            dependencies {
                api("com.example:foo-metadata:1.0")
            }
        }
        jvmMain {
            dependencies {
                implementation("com.example:foo-jvm:1.0")
            }
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets {
        commonMain {
            dependencies {
                api 'com.example:foo-metadata:1.0'
            }
        }
        jvmMain {
            dependencies {
                implementation 'com.example:foo-jvm:1.0'
            }
        }
    }
}
```

</TabItem>
</Tabs>

さらに、ソースセットは互いに依存して階層を形成することができます。
この場合、[`dependsOn()`](#ソースセットパラメータ) 関係が使用されます。

### トップレベルでの依存関係の設定
<primary-label ref="Experimental"/>

トップレベルの `dependencies {}` ブロックを使用して、共通の依存関係を設定できます。ここで宣言された依存関係は、`commonMain` または `commonTest` ソースセットに追加された場合と同様に動作します。

トップレベルの `dependencies {}` ブロックを使用するには、ブロックの前に `@OptIn(ExperimentalKotlinGradlePluginApi::class)` アノテーションを追加してオプトインしてください。

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    @OptIn(ExperimentalKotlinGradlePluginApi::class)
    dependencies {
        implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    dependencies {
        implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%'
    }
}
```

</TabItem>
</Tabs>

プラットフォーム固有の依存関係は、対応するターゲットの `sourceSets {}` ブロック内に追加してください。

この機能に関するフィードバックは [YouTrack](https://youtrack.jetbrains.com/issue/KT-76446) で共有できます。

## 言語設定

ソースセット内の `languageSettings {}` ブロックは、プロジェクトの解析とコンパイルの特定の側面を定義します。`languageSettings {}` ブロックは、特に共有ソースセットに適用される設定を構成する場合にのみ使用してください。それ以外のすべてのケースでは、拡張またはターゲットレベルで [コンパイラオプションを設定](#コンパイラオプション) するために `compilerOptions {}` ブロックを使用してください。

以下の言語設定が利用可能です。

| **名前**                | **説明**                                                                                                                                                                 | 
|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `languageVersion`       | 指定されたバージョンの Kotlin とのソース互換性を提供します。                                                                                                             |
| `apiVersion`            | 指定されたバージョンの Kotlin バンドルライブラリの宣言のみを使用できるようにします。                                                                                          |
| `enableLanguageFeature` | 指定された言語機能を有効にします。利用可能な値は、現在実験的な、あるいはかつて実験的として導入された言語機能に対応しています。 |
| `optIn`                 | 指定された [オプトインアノテーション](https://kotlinlang.org/docs/opt-in-requirements.html) の使用を許可します。                                                                           |
| `progressiveMode`       | [プログレッシブモード](https://kotlinlang.org/docs/whatsnew13.html#progressive-mode) を有効にします。                                                                                   |

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets.all {
        languageSettings.apply {
            languageVersion = "%languageVersion%" // 指定可能な値: "2.0", "2.1", "2.2", "2.3", "2.4", "2.5" (EXPERIMENTAL)
            apiVersion = "%apiVersion%" // 指定可能な値: "2.0", "2.1", "2.2", "2.3", "2.4", "2.5" (EXPERIMENTAL)
            enableLanguageFeature("InlineClasses") // 言語機能名
            optIn("kotlin.ExperimentalUnsignedTypes") // アノテーションの完全修飾名
            progressiveMode = true // デフォルトは false
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets.all {
        languageSettings {
            languageVersion = '%languageVersion%' // 指定可能な値: '2.0', '2.1', '2.2', '2.3', '2.4', '2.5' (EXPERIMENTAL)
            apiVersion = '%apiVersion%' // 指定可能な値: '2.0', '2.1', '2.2', '2.3', '2.4', '2.5' (EXPERIMENTAL)
            enableLanguageFeature('InlineClasses') // 言語機能名
            optIn('kotlin.ExperimentalUnsignedTypes') // アノテーションの完全修飾名
            progressiveMode = true // デフォルトは false
        }
    }
}
```

</TabItem>
</Tabs>