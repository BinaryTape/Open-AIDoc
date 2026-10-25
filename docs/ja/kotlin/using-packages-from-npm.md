[//]: # (title: npm からの依存関係を使用する)

Kotlin/JSプロジェクトでは、すべての依存関係をGradleプラグインを通じて管理できます。これには、`kotlinx.coroutines`、`kotlinx.serialization`、`ktor-client` などのKotlin/Multiplatformライブラリが含まれます。

[npm](https://www.npmjs.com/) からJavaScriptパッケージに依存する場合、Gradle DSLはnpmからインポートしたいパッケージを指定できる `npm` 関数を提供しています。ここでは、[`is-sorted`](https://www.npmjs.com/package/is-sorted) というNPMパッケージのインポートについて考えてみましょう。

Gradleビルドファイル内の対応する部分は次のようになります：

```kotlin
dependencies {
    // ...
    implementation(npm("is-sorted", "^1.0.5"))
}
```

JavaScriptモジュールは通常動的型付けであるのに対し、Kotlinは静的型付け言語であるため、ある種のアダプターを提供する必要があります。Kotlinでは、このようなアダプターを*外部宣言（external declaration）*と呼びます。1つの関数しか提供しない `is-sorted` パッケージの場合、この宣言の記述はわずかで済みます。ソースフォルダ内に `is-sorted.kt` という新しいファイルを作成し、以下の内容を記述します：

```kotlin
@JsModule("is-sorted")
@JsNonModule
external fun <T> sorted(a: Array<T>): Boolean
```

CommonJSをターゲットとして使用している場合、`@JsModule` および `@JsNonModule` アノテーションをそれに応じて調整する必要がある点にご注意ください。

これで、このJavaScript関数を通常のKotlin関数とまったく同じように使用できるようになります。（パラメータや戻り値の型を単に `dynamic` と定義するのではなく）ヘッダーファイルで型情報を提供したため、適切なコンパイラサポートや型チェックも利用できます。

```kotlin
console.log("Hello, Kotlin/JS!")
console.log(sorted(arrayOf(1,2,3)))
console.log(sorted(arrayOf(3,1,2)))
```

ブラウザまたはNode.jsのいずれかでこれら3行を実行すると、`sorted` の呼び出しが `is-sorted` パッケージからエクスポートされた関数に正しくマッピングされたことが出力から確認できます：

```kotlin
Hello, Kotlin/JS!
true
false
```

JavaScriptエコシステムにはパッケージ内の関数を公開する方法が複数あるため（例えば、名前付きエクスポートやデフォルトエクスポートなど）、他のnpmパッケージでは外部宣言の構造を少し変更する必要がある場合があります。

宣言の書き方の詳細については、[KotlinからJavaScriptを呼び出す](js-interop.md) を参照してください。