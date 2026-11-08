[//]: # (title: Kotlin/JSコンパイラの機能)

Kotlin/JSコンパイラは、JavaScriptコードを生成する前にKotlinコードを中間表現（IR）へと変換します。
この中間ステップにより、コンパイラはパフォーマンス、サイズ、開発速度の面で出力を最適化できるほか、ターゲットとするJavaScriptバージョン、モジュールシステム、TypeScript宣言ファイル、出力の粒度など、生成されるJavaScriptを細かく制御できるようになります。

## ターゲットJavaScriptバージョンの設定 {id="set-the-target-javascript-version"}

Kotlin/JSコンパイラは、ECMAScript標準のES5、ES2015、ES2020バージョン向けのJavaScriptを生成できます。
ターゲット環境でサポートされている最新のバージョンを選択してください。
`build.gradle.kts`ファイルで`target`プロパティを設定します。例えば、ES2020をターゲットにするには次のように記述します。

```kotlin
tasks.withType<KotlinJsCompile>().configureEach {
    compilerOptions {
        target = "es2020"
    }
}
```

各ターゲットで利用可能な機能については、[ECMAScriptターゲットの設定](js-project-setup.md#set-an-ecmascript-target)を参照してください。

## モジュールシステムの設定 {id="configure-the-module-system"}

Kotlin/JSコンパイラは、UMD、CommonJS、AMD、ES modulesなどのさまざまなモジュールシステム用のコードを生成できます。
ターゲットのモジュールシステムを選択するには、`build.gradle.kts`ファイルで`moduleKind`コンパイラオプションを設定します。

```kotlin
tasks.withType<org.jetbrains.kotlin.gradle.targets.js.ir.KotlinJsIrLink> {
    compilerOptions.moduleKind.set(org.jetbrains.kotlin.gradle.dsl.JsModuleKind.MODULE_COMMONJS)
}
```

サポートされている`moduleKind`の値や設定の詳細については、[JavaScriptモジュール](js-modules.md)を参照してください。

## TypeScript宣言ファイル（`d.ts`）の生成 {id="generate-typescript-declaration-files-d-ts"}
<primary-label ref="experimental-opt-in"/>

Kotlin/JSコンパイラは、KotlinコードからTypeScript定義を生成できます。これらの定義は、JavaScriptツールやIDEでのコード補完や静的解析のための型情報を提供し、JavaScriptおよびTypeScriptプロジェクトでKotlin APIを利用しやすくします。

定義ファイルを生成するには、Kotlinの宣言に[`@JsExport`](js-to-kotlin-interop.md#jsexport-annotation)アノテーションを付与し、`build.gradle.kts`ファイルの`js {}`ブロックに`generateTypeScriptDefinitions()`関数を追加します。

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

コンパイラは`@JsExport`でマークされたトップレベル宣言を収集し、`.d.ts`ファイル内にTypeScript定義を生成します。

詳細については、[TypeScript宣言ファイル（`d.ts`）の生成](js-project-setup.md#generation-of-typescript-declaration-files-d-ts)を参照してください。

## 出力の粒度の設定 {id="configure-output-granularity"}

コンパイラがプロジェクト内の`.js`ファイルをどのように出力するかを選択できます。

* **モジュールごと（Per module）**: プロジェクトのモジュールごとに個別の`.js`ファイルを生成します（デフォルト）。
* **プログラム全体（Whole program）**: プログラム全体に対して単一の`.js`ファイルを生成します。
* **ファイルごと（Per file）**: Kotlinファイルごとに1つの`.js`ファイルを生成します。エクスポートされた宣言がファイルに含まれる場合は2つのファイルを生成します（ターゲットJavaScriptバージョンが`es2015`および`es2020`の場合に利用可能）。

粒度を変更するには、`gradle.properties`ファイルで`kotlin.js.ir.output.granularity`プロパティを設定します。

```properties
# デフォルト: per-module
kotlin.js.ir.output.granularity=whole-program
```

ファイルごとの要件を含む設定の詳細については、[出力の粒度の設定](js-project-setup.md#configure-output-granularity)を参照してください。

## トップレベルプロパティの遅延初期化 {id="lazy-initialization-of-top-level-properties"}

アプリケーションの起動パフォーマンスを向上させるため、Kotlin/JSコンパイラはトップレベルプロパティを遅延初期化（lazy initialization）します。これにより、コード内で使用されているすべてのトップレベルプロパティを初期化することなくアプリケーションを読み込むことができます。起動時に必要なものだけが初期化され、その他のプロパティはそれらを使用するコードが実際に実行されたときに値を受け取ります。

```kotlin
val a = run {
    val result = // 重い計算処理
    println(result)
    result
} // 初回使用時に値が計算される
```

何らかの理由でプロパティを即時初期化（アプリケーション起動時に初期化）する必要がある場合は、[`@EagerInitialization`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/-eager-initialization/){nullable="true"}アノテーションを付与してください。

## 開発用バイナリのインクリメンタルコンパイル {id="incremental-compilation-for-development-binaries"}

Kotlin/JSコンパイラには、開発プロセスを高速化する「開発用バイナリのインクリメンタルコンパイルモード」が用意されています。
このモードでは、コンパイラはモジュールレベルで`compileDevelopmentExecutableKotlinJs` Gradleタスクの結果をキャッシュします。
その後のコンパイルでは、変更されていないソースファイルに対してキャッシュされたコンパイル結果が再利用されるため、特に小さな変更を加えた場合のコンパイルがより高速に完了します。

インクリメンタルコンパイルはデフォルトで有効になっています。開発用バイナリのインクリメンタルコンパイルを無効にするには、プロジェクトの`gradle.properties`または`local.properties`に以下の行を追加してください。

```none
# デフォルト: true
kotlin.incremental.js.ir=false
```

> キャッシュを作成して格納する必要があるため、インクリメンタルコンパイルモードでのクリーンビルドは通常よりも遅くなります。
>
{style="note"}

## 本番環境におけるメンバー名の最小化 {id="minification-of-member-names-in-production"}

Kotlin/JSコンパイラは、Kotlinのクラスや関数に関する内部的な関係情報を利用してより効率的な最小化（minification）を適用し、関数、プロパティ、クラスの名前を短縮します。これにより、結果として生成されるバンドルアプリケーションのサイズを削減できます。

このメンバー名の最小化は、Kotlin/JSアプリケーションを[本番（production）](js-project-setup.md#building-executables)モードでビルドする際に自動的に適用され、デフォルトで有効になっています。メンバー名の最小化を無効にするには、`-Xir-minimized-member-names`コンパイラオプションを使用します。

```kotlin
kotlin {
    js {
        compilations.all {
            compileTaskProvider.configure {
                compilerOptions.freeCompilerArgs.add("-Xir-minimized-member-names=false")
            }
        }
    }
}
```

## デッドコード削除 {id="dead-code-elimination"}

[デッドコード削除](https://wikipedia.org/wiki/Dead_code_elimination)（DCE: Dead code elimination）は、使用されていないプロパティ、関数、クラスを削除することで、生成されるJavaScriptコードのサイズを削減します。

未使用の宣言は、以下のようなケースで発生します。

* 関数がインライン化され、直接呼び出されることがない場合（ごく一部のケースを除き、常に発生します）。
* モジュールが共有ライブラリを使用している場合。DCEがないと、使用していないライブラリの部分もバンドル結果に含まれたままになります。例えば、Kotlin標準ライブラリにはリスト、配列、文字列操作用の関数やDOM用のアダプターなどが含まれています。この全機能はJavaScriptファイルとして約1.3 MBを占めます。単純な「Hello, world」アプリケーションが必要とするのはコンソールルーチンだけであり、ファイル全体でもわずか数キロバイトで済みます。

Kotlin/JSコンパイラでは、DCEは自動的に処理されます。

* 以下のGradleタスクに対応する「開発（development）」バンドルタスクでは、DCEが無効になります。

  * `jsBrowserDevelopmentRun`
  * `jsBrowserDevelopmentWebpack`
  * `jsNodeDevelopmentRun`
  * `compileDevelopmentExecutableKotlinJs`
  * `compileDevelopmentLibraryKotlinJs`
  * 名前に「development」が含まれるその他のGradleタスク

* 以下のGradleタスクに対応する「本番（production）」バンドルをビルドする場合、DCEが有効になります。

  * `jsBrowserProductionRun`
  * `jsBrowserProductionWebpack`
  * `compileProductionExecutableKotlinJs`
  * `compileProductionLibraryKotlinJs`
  * 名前に「production」が含まれるその他のGradleタスク

[`@JsExport`](js-to-kotlin-interop.md#jsexport-annotation)アノテーションを使用すると、DCEにルート（削除対象外の基点）として扱わせたい宣言を指定できます。