[//]: # (title: サポートされているバージョンと構成)

<primary-label ref="beta"/> 

このページでは、[WebAssembly プロポーザル (WebAssembly proposals)](https://webassembly.org/roadmap/)、サポートされているブラウザ、および Kotlin/Wasm を使用して効率的に開発を行うための構成に関する推奨事項について詳しく説明します。

## ブラウザのバージョン {id="browser-versions"}

Kotlin/Wasm は、WebAssembly 内での改善や新機能の導入のために、[ガーベッジコレクション (WasmGC)](#garbage-collection-proposal) や [例外処理](#exception-handling-proposal) といった最新の WebAssembly プロポーザルに依存しています。

これらの機能が正しく動作するように、最新のプロポーザルをサポートする環境を用意してください。お使いのブラウザのバージョンがデフォルトで新しい WasmGC をサポートしているか、あるいは環境に変更を加える必要があるかを確認してください。

### Chrome {id="chrome"}

* **バージョン 119 以降の場合:**

  デフォルトで動作します。

* **それより古いバージョンの場合:**

  > 古いブラウザでアプリケーションを実行するには、1.9.20 より前の Kotlin バージョンが必要です。
  >
  {style="note"}

  1. ブラウザで `chrome://flags/#enable-webassembly-garbage-collection` に移動します。
  2. **WebAssembly Garbage Collection** を有効にします。
  3. ブラウザを再起動します。

### Chromium ベースのブラウザ {id="chromium-based"}

Edge、Brave、Opera、Samsung Internet などの Chromium ベースのブラウザを含みます。

* **バージョン 119 以降の場合:**

  デフォルトで動作します。

* **それより古いバージョンの場合:**

   > 古いブラウザでアプリケーションを実行するには、1.9.20 より前の Kotlin バージョンが必要です。
   >
   {style="note"}

  `--js-flags=--experimental-wasm-gc` コマンドライン引数を指定してアプリケーションを実行してください。

### Firefox {id="firefox"}

* **バージョン 120 以降の場合:**

  デフォルトで動作します。

* **バージョン 119 の場合:**

  1. ブラウザで `about:config` に移動します。
  2. `javascript.options.wasm_gc` オプションを有効にします。
  3. ページをリフレッシュします。

### Safari/WebKit {id="safari-webkit"}

* **バージョン 18.2 以降の場合:**

  デフォルトで動作します。

* **それより古いバージョンの場合:**

   サポートされていません。

> Safari 18.2 は、iOS 18.2、iPadOS 18.2、visionOS 2.2、macOS 15.2、macOS Sonoma、および macOS Ventura で利用可能です。
> iOS および iPadOS では、Safari 18.2 はオペレーティングシステムに同梱されています。入手するには、デバイスをバージョン 18.2 以降にアップデートしてください。
>
> 詳細については、[Safari リリースノート](https://developer.apple.com/documentation/safari-release-notes/safari-18_2-release-notes#Overview) を参照してください。
>
{style="note"}

## Wasm プロポーザルのサポート {id="wasm-proposals-support"}

Kotlin/Wasm の改善は [WebAssembly プロポーザル](https://webassembly.org/roadmap/) に基づいています。ここでは、WebAssembly のガーベッジコレクションおよび (レガシーな) 例外処理プロポーザルのサポート状況について説明します。

### ガーベッジコレクション・プロポーザル {id="garbage-collection-proposal"}

Kotlin 1.9.20 以降、Kotlin ツールチェーンは最新バージョンの [Wasm ガーベッジコレクション (WasmGC)](https://github.com/WebAssembly/gc) プロポーザルを使用しています。

このため、Wasm プロジェクトを最新バージョンの Kotlin にアップデートすることを強くお勧めします。また、Wasm 環境を備えた最新バージョンのブラウザを使用することもお勧めします。

### 例外処理プロポーザル {id="exception-handling-proposal"}

Kotlin ツールチェーンは、例外処理プロポーザルの [レガシー](https://github.com/WebAssembly/exception-handling/blob/master/proposals/exception-handling/legacy/Exceptions.md) バージョンと [新しい](https://github.com/WebAssembly/exception-handling/blob/main/proposals/exception-handling/Exceptions.md) バージョンの両方をサポートしています。これにより、Kotlin で生成された Wasm バイナリをより幅広い環境で実行できるようになります。

[`wasmJs` ターゲット](wasm-overview.md#kotlin-wasm-and-compose-multiplatform) は、デフォルトでレガシーな例外処理プロポーザルを使用します。`wasmJs` ターゲットで新しい例外処理プロポーザルを有効にするには、`-Xwasm-use-new-exception-proposal` コンパイラオプションを使用します。

対照的に、[`wasmWasi` ターゲット](wasm-overview.md#kotlin-wasm-and-wasi) はデフォルトで新しいプロポーザルを使用し、最新の WebAssembly ランタイムとの互換性を高めています。レガシーなプロポーザルに切り替えるには、`-Xwasm-use-new-exception-proposal=false` コンパイラオプションを使用します。

`wasmWasi` ターゲットについては、新しい例外処理プロポーザルを採用しても安全です。この環境をターゲットとするアプリケーションは通常、ユーザーによって制御される（多くの場合、単一の特定の VM 上で動作する）多様性の低いランタイム環境で実行されるため、互換性の問題が発生するリスクが低くなります。

> プロジェクトのセットアップ、依存関係の使用、およびその他のタスクの詳細については、[Kotlin/Wasm の例 (examples)](https://github.com/Kotlin/kotlin-wasm-examples#readme) を参照してください。
>
{style="tip"}

## デフォルトインポートの使用 {id="use-default-import"}

[Kotlin/Wasm コードの JavaScript へのインポート](wasm-js-interop.md) は、デフォルトエクスポート (default exports) から名前付きエクスポート (named exports) に移行しました。

引き続きデフォルトインポート (default import) を使用したい場合は、新しい JavaScript ラッパーモジュールを生成してください。以下のスニペットを含む `.mjs` ファイルを作成します。

```Javascript
// メインの .mjs ファイルへのパスを指定します
import * as moduleExports from "./wasm-test.mjs";

export { moduleExports as default };
```

新しい `.mjs` ファイルを resources フォルダに配置すると、ビルドプロセス中に自動的にメインの `.mjs` ファイルの隣に配置されます。

また、`.mjs` ファイルをカスタムの場所に配置することもできます。その場合は、手動でメインの `.mjs` ファイルの隣に移動するか、インポートステートメントのパスをその場所に合わせて調整する必要があります。

## Kotlin/Wasm のインクリメンタルコンパイル {id="kotlin-wasm-incremental-compilation"}

Kotlin/Wasm ターゲットはインクリメンタルコンパイル (incremental compilation) をサポートしています。これにより、コンパイラは前回のコンパイルからの変更に関連するファイルのみを再コンパイルできるようになり、コンパイル時間の短縮に役立ちます。

Wasm ターゲットのインクリメンタルコンパイルはデフォルトで有効になっています。無効にするには、プロジェクトの `local.properties` または `gradle.properties` ファイルに以下の行を追加してください。

```text
kotlin.incremental.wasm=false
```

## 完全修飾クラス名に関する診断 {id="diagnostics-in-fully-qualified-class-names"}

Kotlin/Wasm では、アプリケーションのサイズが増大するのを避けるため、コンパイラはデフォルトで生成されたバイナリにクラスの完全修飾名 (fully qualified names, FQN) を保存しません。

このため、完全修飾名機能を明示的に有効にしない限り、Kotlin/Wasm プロジェクトで `KClass::qualifiedName` プロパティを呼び出すとコンパイラがエラーを報告します。

この診断はデフォルトで有効になっており、エラーは自動的に報告されます。診断を無効にして Kotlin/Wasm で `qualifiedName` を許可するには、`build.gradle.kts` ファイルに以下のオプションを追加して、すべてのクラスの完全修飾名を保存するようにコンパイラに指示します。

```kotlin
// build.gradle.kts
kotlin {
   wasmJs {
       ...
       compilerOptions {
           freeCompilerArgs.add("-Xwasm-kclass-fqn")
       }
   }
}
```

このオプションを有効にすると、アプリケーションのサイズが大きくなることに注意してください。

### 完全修飾名 {id="fully-qualified-names"}

Kotlin/Wasm ターゲットでは、追加の構成なしで実行時に完全修飾名 (FQN) を利用できます。つまり、`KClass.qualifiedName` プロパティはデフォルトで有効になっています。

FQN を使用すると、JVM から Wasm ターゲットへのコードのポータビリティが向上し、完全修飾名が表示されることで実行時エラーの情報量が増えます。

## 配列の範囲外アクセスとトラップ {id="array-out-of-bounds-access-and-traps"}

Kotlin/Wasm では、配列の境界外のインデックスで配列にアクセスすると、通常の Kotlin の例外ではなく WebAssembly のトラップ (trap) が発生します。トラップは現在の実行スタックを即座に停止させます。

JavaScript 環境で実行している場合、これらのトラップは `WebAssembly.RuntimeError` として現れ、JavaScript 側でキャッチできます。

実行ファイルをリンクする際にコマンドラインで以下のコンパイラオプションを使用することで、Kotlin/Wasm 環境でのこのようなトラップを回避できます。

```
-Xwasm-enable-array-range-checks
```

または、Gradle ビルドファイルの `compilerOptions {}` ブロックに追加します。

```kotlin
// build.gradle.kts
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xwasm-enable-array-range-checks")
    }
}
```

このコンパイラオプションを有効にすると、トラップの代わりに `IndexOutOfBoundsException` がスローされます。

詳細の確認およびフィードバックの共有は、こちらの [YouTrack イシュー](https://youtrack.jetbrains.com/issue/KT-73452/K-Wasm-turning-on-range-checks-by-default) で行ってください。

## 実験的アノテーション {id="experimental-annotations"}

Kotlin/Wasm は、一般的な WebAssembly 相互運用性のためのいくつかの実験的アノテーションを提供しています。

[`@WasmImport`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.wasm/-wasm-import/) と [`@WasmExport`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.wasm/-wasm-export/) を使用すると、それぞれ Kotlin/Wasm モジュールの外部で定義された関数を呼び出したり、Kotlin 関数をホストや他の Wasm モジュールに公開したりできます。

これらのメカニズムはまだ進化の過程にあるため、すべてのアノテーションは実験的 (experimental) としてマークされています。これらを使用するには明示的に [オプトイン](opt-in-requirements.md) する必要があり、将来の Kotlin バージョンで設計や動作が変更される可能性があります。

## デバッグ中のリロード {id="reloads-during-debugging"}

[最新のブラウザ](#browser-versions) でのアプリケーションの [デバッグ](wasm-debugging.md) は、特に追加の設定なしで動作します。開発用の Gradle タスク (`*DevRun`) を実行すると、Kotlin は自動的にソースファイルをブラウザに提供します。

しかし、デフォルトでソースを提供すると、[Kotlin のコンパイルとバンドルが完了する前に、ブラウザでアプリケーションのリロードが繰り返される](https://youtrack.jetbrains.com/issue/KT-80582/Multiple-reloads-when-using-webpack-dev-server-after-2.2.20-Beta2#focus=Comments-27-12596427.0-0) 原因になることがあります。回避策として、Kotlin ソースファイルを無視し、提供される静的ファイルの監視を無効にするように webpack の構成を調整してください。プロジェクトのルートにある `webpack.config.d` ディレクトリに、以下の内容の `.js` ファイルを追加します。

```kotlin
config.watchOptions = config.watchOptions || {
    ignored: ["**/*.kt", "**/node_modules"]
}

if (config.devServer) {
    config.devServer.static = config.devServer.static.map(file => {
        if (typeof file === "string") {
            return {
                directory: file,
                watch: false,
            }
        } else {
            return file
        }
    })
}
```
