[//]: # (title: JavaScriptモジュール)

Kotlinプロジェクトを、さまざまな主要なモジュールシステム向けのJavaScriptモジュールにコンパイルできます。現在、JavaScriptモジュールに対して以下の構成をサポートしています:

- [ES Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules): JavaScriptでモジュールを宣言するための標準的な方法です（`import/export` JavaScript構文を使用）。`target`が`es2015`に設定されている場合、デフォルトで使用されます。
- [Unified Module Definitions (UMD)](https://github.com/umdjs/umd): *AMD*と*CommonJS*の両方に互換性があります。UMDモジュールは、インポートせずに実行することや、モジュールシステムが存在しない環境で実行することも可能です。これは`browser`および`nodejs`ターゲットのデフォルトのオプションです。
- [Asynchronous Module Definitions (AMD)](https://github.com/amdjs/amdjs-api/wiki/AMD): 特に[RequireJS](https://requirejs.org/)ライブラリで使用されます。
- [CommonJS](http://wiki.commonjs.org/wiki/Modules/1.1): Node.js/npmで広く使用されています（`require`関数と`module.exports`オブジェクト）。
- Plain: どのモジュールシステム向けにもコンパイルしません。グローバルスコープ内の名前でモジュールにアクセスできます。

## ブラウザターゲット {id="browser-targets"}

ウェブブラウザ環境でコードを実行する予定があり、UMD以外のモジュールシステムを使用したい場合は、`webpackTask`構成ブロックで目的のモジュールタイプを指定できます。例えば、CommonJSに切り替えるには以下のように記述します:

```groovy
kotlin {
    js {
        browser {
            webpackTask {
                output.libraryTarget = "commonjs2"
            }
        }
        binaries.executable()
    }
}

```

Webpackは`commonjs`と`commonjs2`という2つの異なるフレーバーのCommonJSを提供しており、これらは宣言を利用可能にする方法に影響します。ほとんどの場合、生成されたライブラリに`module.exports`構文を追加する`commonjs2`が必要になるでしょう。あるいは、CommonJS仕様に厳密に準拠した`commonjs`オプションを選択することもできます。`commonjs`と`commonjs2`の違いについて詳しく知るには、[Webpackのリポジトリ](https://github.com/webpack/webpack/issues/1114)を参照してください。

## JavaScriptライブラリとNode.jsファイル {id="javascript-libraries-and-node-js-files"}

JavaScriptまたはNode.js環境で使用するライブラリを作成しており、別のモジュールシステムを使用したい場合、手順が少し異なります。

### ターゲットモジュールシステムの選択 {id="choose-the-target-module-system"}

ターゲットとなるモジュールシステムを選択するには、Gradleビルドスクリプトで`moduleKind`コンパイラオプションを設定します:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.withType<org.jetbrains.kotlin.gradle.targets.js.ir.KotlinJsIrLink> {
    compilerOptions.moduleKind.set(org.jetbrains.kotlin.gradle.dsl.JsModuleKind.MODULE_COMMONJS)
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
compileKotlinJs.compilerOptions.moduleKind = org.jetbrains.kotlin.gradle.dsl.JsModuleKind.MODULE_COMMONJS
```

</tab>
</tabs>

利用可能な値は、`umd` (デフォルト)、`es`, `commonjs`, `amd`, `plain` です。

> これは `webpackTask.output.libraryTarget` を調整することとは異なります。ライブラリターゲットは（コードがすでにコンパイルされた後に）*webpackによって生成される*出力を変更します。`compilerOptions.moduleKind` は *Kotlinコンパイラによって生成される* 出力を変更します。
>
{style="note"}  

Kotlin Gradle DSLでは、CommonJSおよびESMのモジュール種別を設定するためのショートカットも用意されています:

```kotlin
kotlin {
    js {
        useCommonJs()
        // または
        useEsModules()
        // ...
    }
}
```

## @JsModule アノテーション {id="jsmodule-annotation"}

`external`なクラス、パッケージ、関数、プロパティがJavaScriptモジュールであることをKotlinに伝えるには、`@JsModule` アノテーションを使用できます。例えば、"hello" という名前の次のようなCommonJSモジュールがあるとします:

```javascript
module.exports.sayHello = function (name) { alert("Hello, " + name); }
```

Kotlinでは次のように宣言する必要があります:

```kotlin
@JsModule("hello")
external fun sayHello(name: String)
```

### パッケージへの @JsModule の適用 {id="apply-jsmodule-to-packages"}

JavaScriptライブラリの中には、関数やクラスではなくパッケージ（名前空間）をエクスポートするものがあります。
JavaScriptの観点では、これはクラス、関数、プロパティをメンバとして持つ*オブジェクト*です。
これらのパッケージをKotlinのオブジェクトとしてインポートするのは、不自然に見えることがよくあります。
コンパイラは、以下の記法を使用して、インポートされたJavaScriptパッケージをKotlinのパッケージにマッピングできます:

```kotlin
@file:JsModule("extModule")

package ext.jspackage.name

external fun foo()

external class C
```

これに対応するJavaScriptモジュールは、次のように宣言されているものとします:

```javascript
module.exports = {
  foo: { /* some code here */ },
  C: { /* some code here */ }
}
```

`@file:JsModule` アノテーションが付けられたファイルでは、externalではないメンバを宣言することはできません。
以下の例はコンパイルエラーになります:

```kotlin
@file:JsModule("extModule")

package ext.jspackage.name

external fun foo()

fun bar() = "!" + foo() + "!" // ここでエラーが発生
```

### より深いパッケージ階層のインポート {id="import-deeper-package-hierarchies"}

前の例では、JavaScriptモジュールは単一のパッケージをエクスポートしていました。
しかし、JavaScriptライブラリの中には、1つのモジュール内から複数のパッケージをエクスポートするものもあります。
このケースもKotlinでサポートされていますが、インポートするパッケージごとに新しい `.kt` ファイルを宣言する必要があります。

例えば、先ほどの例を少し複雑にしてみましょう:

```javascript
module.exports = {
  mylib: {
    pkg1: {
      foo: function () { /* some code here */ },
      bar: function () { /* some code here */ }
    },
    pkg2: {
      baz: function () { /* some code here */ }
    }
  }
}
```

このモジュールをKotlinでインポートするには、2つのKotlinソースファイルを書く必要があります:

```kotlin
@file:JsModule("extModule")
@file:JsQualifier("mylib.pkg1")

package extlib.pkg1

external fun foo()

external fun bar()
```

および

```kotlin
@file:JsModule("extModule")
@file:JsQualifier("mylib.pkg2")

package extlib.pkg2

external fun baz()
```

### @JsNonModule アノテーション {id="jsnonmodule-annotation"}

宣言に `@JsModule` が付いている場合、JavaScriptモジュールとしてコンパイルしない環境ではKotlinコードからその宣言を使用できません。
通常、開発者はライブラリをJavaScriptモジュールとしてだけでなく、プロジェクトの静的リソースにコピーして `<script>` タグでインクルードできるダウンロード可能な `.js` ファイルとしても配布します。非モジュール環境から `@JsModule` 宣言を使用しても問題ないことをKotlinに伝えるには、`@JsNonModule` アノテーションを追加します。例えば、次のようなJavaScriptコードを考えてみましょう:

```javascript
function topLevelSayHello (name) { alert("Hello, " + name); }

if (module && module.exports) {
  module.exports = topLevelSayHello;
}
```

Kotlinからは次のように記述できます:

```kotlin
@JsModule("hello")
@JsNonModule
@JsName("topLevelSayHello")
external fun sayHello(name: String)
```

### Kotlin標準ライブラリで使用されているモジュールシステム {id="module-system-used-by-the-kotlin-standard-library"}

Kotlinは、Kotlin/JS標準ライブラリが単一のファイルとして配布されており、それ自体がUMDモジュールとしてコンパイルされているため、上述のどのモジュールシステムとも併用できます。Kotlin/JSのほとんどのユースケースでは、`kotlin-stdlib-js` へのGradle依存関係を使用することをお勧めします。これはNPMでも [`kotlin`](https://www.npmjs.com/package/kotlin) パッケージとして利用可能です。