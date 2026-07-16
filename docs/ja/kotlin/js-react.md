[//]: # (title: ReactとKotlin/JSでWebアプリケーションを構築する — チュートリアル)

<no-index/>

このチュートリアルでは、Kotlin/JSと[React](https://reactjs.org/)フレームワークを使用して、ブラウザアプリケーションを構築する方法を学びます。具体的には以下の内容を行います：

* 一般的なReactアプリケーションの構築に関連する共通タスクを完了する。
* [KotlinのDSL](type-safe-builders.md)を使用して、可読性を損なうことなく概念を簡潔かつ統一的に表現する方法を探索し、本格的なアプリケーションを完全にKotlinで記述できるようにする。
* 既製のnpmコンポーネントの使用方法、外部ライブラリの使用方法、および最終的なアプリケーションの公開方法を学ぶ。

最終的な成果物は、[KotlinConf](https://kotlinconf.com/)イベント専用の、カンファレンストークへのリンクを備えたWebアプリ「_KotlinConf Explorer_」です。ユーザーは1つのページですべてのトークを視聴し、それらを視聴済み（seen）または未視聴（unseen）としてマークできます。

このチュートリアルでは、Kotlinに関する予備知識と、HTMLおよびCSSに関する基本的な知識があることを前提としています。Reactの背後にある基本概念を理解していると、サンプルコードの理解に役立つ場合がありますが、必須ではありません。

> 最終的なアプリケーションは[こちら](https://github.com/kotlin-hands-on/web-app-react-kotlin-js-gradle/tree/finished)で入手できます。
>
{style="note"}

## 始める前に

1. 最新バージョンの [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) をダウンロードしてインストールします。
2. [プロジェクトテンプレート](https://github.com/kotlin-hands-on/web-app-react-kotlin-js-gradle)をクローンし、IntelliJ IDEAで開きます。テンプレートには、必要なすべての構成と依存関係が含まれた基本的なKotlinマルチプラットフォームGradleプロジェクトが含まれています。

   * `build.gradle.kts` ファイル内の依存関係とタスク：
   
   ```kotlin
   dependencies {
       // React, React DOM + ラッパー
       implementation(enforcedPlatform("org.jetbrains.kotlin-wrappers:kotlin-wrappers-bom:1.0.0-pre.430"))
       implementation("org.jetbrains.kotlin-wrappers:kotlin-react")
       implementation("org.jetbrains.kotlin-wrappers:kotlin-react-dom")
   
       // Kotlin React Emotion (CSS)
       implementation("org.jetbrains.kotlin-wrappers:kotlin-emotion")
   
       // ビデオプレーヤー
       implementation(npm("react-player", "2.12.0"))
   
       // シェアボタン
       implementation(npm("react-share", "4.4.1"))
   
       // コルーチン & シリアル化
       implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.6.4")
       implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.5.0")
   }
   ```

   * このチュートリアルで使用するJavaScriptコードを挿入するための、`src/jsMain/resources/index.html` にあるHTMLテンプレートページ：

   ```html
   <!doctype html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <title>Hello, Kotlin/JS!</title>
   </head>
   <body>
       <div id="root"></div>
       <script src="confexplorer.js"></script>
   </body>
   </html>
   ```
   {validate="false"}

   Kotlin/JSプロジェクトをビルドすると、すべてのコードとその依存関係が、プロジェクトと同じ名前（`confexplorer.js`）の単一のJavaScriptファイルに自動的にバンドルされます。一般的な[JavaScriptの慣習](https://faqs.skillcrush.com/article/176-where-should-js-script-tags-be-linked-in-html-documents)に従い、スクリプトの前にブラウザがすべてのページ要素を読み込むように、bodyの内容（`root` divを含む）が先にロードされます。

* `src/jsMain/kotlin/Main.kt` 内のコードスニペット：

   ```kotlin
   import kotlinx.browser.document
   
   fun main() {
       document.bgColor = "red"
   }
   ```

### 開発サーバーの実行

デフォルトでは、KotlinマルチプラットフォームGradleプラグインには組み込みの `webpack-dev-server` のサポートが付属しており、サーバーを手動でセットアップすることなくIDEからアプリケーションを実行できます。

プログラムがブラウザで正常に動作することをテストするには、IntelliJ IDEA内のGradleツールウィンドウから、`run` または `browserDevelopmentRun` タスク（`other` または `kotlin browser` ディレクトリにあります）を呼び出して開発サーバーを起動します。

![Gradleタスクリスト](browser-development-run.png){width=700}

ターミナルからプログラムを実行するには、代わりに `./gradlew run` を使用します。

プロジェクトがコンパイルおよびバンドルされると、ブラウザウィンドウに空白の赤いページが表示されます。

![空白の赤いページ](red-page.png){width=700}

### ホットリロード / 継続モードを有効にする

変更を加えるたびにプロジェクトを手動でコンパイルして実行する必要がないように、_[継続的コンパイル](dev-server-continuous-compilation.md)_モードを構成します。続行する前に、実行中のすべての開発サーバーインスタンスを必ず停止してください。

1. IntelliJ IDEAがGradleの `run` タスクを初めて実行した後に自動的に生成する実行構成を編集します。

   ![実行構成の編集](edit-configurations-continuous.png){width=700}

2. **Run/Debug Configurations** ダイアログで、実行構成の引数に `--continuous` オプションを追加します。

   ![継続モードを有効にする](continuous-mode.png){width=700}

   変更を適用した後、IntelliJ IDEA内の **Run** ボタンを使用して開発サーバーを再起動できます。ターミナルから継続的なGradleビルドを実行するには、代わりに `./gradlew run --continuous` を使用します。

3. この機能をテストするには、Gradleタスクが実行されている間に `Main.kt` ファイルでページの色を青に変更します。

   ```kotlin
   document.bgColor = "blue"
   ```

   プロジェクトが再コンパイルされ、リロード後にブラウザページが新しい色になります。

開発プロセス中、開発サーバーを継続モードで実行し続けることができます。変更を加えると、自動的にページがリビルドおよびリロードされます。

> この時点のプロジェクトの状態は、[こちら](https://github.com/kotlin-hands-on/web-app-react-kotlin-js-gradle/tree/master)の `master` ブランチで見つけることができます。
>
{style="note"}

## Webアプリのドラフトを作成する

### Reactを使用して最初の静的ページを追加する

アプリに簡単なメッセージを表示させるには、`Main.kt` ファイルのコードを以下に置き換えます。

```kotlin
import kotlinx.browser.document
import react.*
import emotion.react.css
import csstype.Position
import csstype.px
import react.dom.html.ReactHTML.h1
import react.dom.html.ReactHTML.h3
import react.dom.html.ReactHTML.div
import react.dom.html.ReactHTML.p
import react.dom.html.ReactHTML.img
import react.dom.client.createRoot
import kotlinx.serialization.Serializable

fun main() {
    val container = document.getElementById("root") ?: error("Couldn't find root container!")
    createRoot(container).render(Fragment.create {
        h1 {
            +"Hello, React+Kotlin/JS!"
        }
    })
}
```
{validate="false"}

* `render()` 関数は、[kotlin-react-dom](https://github.com/JetBrains/kotlin-wrappers/tree/master/kotlin-react-dom) に対して、[フラグメント（fragment）](https://reactjs.org/docs/fragments.html) 内の最初のHTML要素を `root` 要素にレンダリングするように指示します。この要素は、テンプレートに含まれていた `src/jsMain/resources/index.html` で定義されているコンテナです。
* コンテンツは `<h1>` ヘッダーであり、HTMLをレンダリングするために型安全なDSLを使用しています。
* `h1` はラムダパラメータを受け取る関数です。文字列リテラルの前に `+` 記号を付けると、実際には[演算子オーバーロード](operator-overloading.md)を使用して `unaryPlus()` 関数が呼び出されます。これにより、囲まれたHTML要素に文字列が追加されます。

プロジェクトが再コンパイルされると、ブラウザにこのHTMLページが表示されます。

![HTMLページの例](hello-react-js.png){width=700}

### HTMLをKotlinの型安全なHTML DSLに変換する

React用のKotlin[ラッパー](https://github.com/JetBrains/kotlin-wrappers/blob/master/kotlin-react/README.md)には、純粋なKotlinコードでHTMLを記述できるようにする[ドメイン固有言語 (DSL)](type-safe-builders.md)が付属しています。この点において、JavaScriptの[JSX](https://reactjs.org/docs/introducing-jsx.html)に似ています。しかし、このマークアップはKotlinであるため、オートコンプリートや型チェックなど、静的型付け言語のすべての利点を得ることができます。

将来のWebアプリの従来のHTMLコードと、Kotlinでの型安全なバリアントを比較してみましょう：

<tabs>
<tab title="HTML">

```html
<h1>KotlinConf Explorer</h1>
<div>
    <h3>Videos to watch</h3>
    <p>John Doe: Building and breaking things</p>
    <p>Jane Smith: The development process</p>
    <p>Matt Miller: The Web 7.0</p>
    <h3>Videos watched</h3>
    <p>Tom Jerry: Mouseless development</p>
</div>
<div>
    <h3>John Doe: Building and breaking things</h3>
    <img src="https://via.placeholder.com/640x360.png?text=Video+Player+Placeholder">
</div>
```

</tab>
<tab title="Kotlin">

```kotlin
h1 {
    +"KotlinConf Explorer"
}
div {
    h3 {
        +"Videos to watch"
    }
    p {
        + "John Doe: Building and breaking things"
    }
    p {
        +"Jane Smith: The development process"
    }
    p {
        +"Matt Miller: The Web 7.0"
    }
    h3 {
        +"Videos watched"
    }
    p {
        +"Tom Jerry: Mouseless development"
    }
}
div {
    h3 {
        +"John Doe: Building and breaking things"
    }
    img {
       src = "https://via.placeholder.com/640x360.png?text=Video+Player+Placeholder"
    }
}
```

</tab>
</tabs>

Kotlinコードをコピーし、`main()` 関数内の `Fragment.create()` 関数呼び出しを更新して、以前の `h1` タグを置き換えます。

ブラウザがリロードされるのを待ちます。ページは以下のようになるはずです：

![Webアプリのドラフト](website-draft.png){width=700}

### マークアップでKotlinの構文を使用してビデオを追加する

このDSLを使用してKotlinでHTMLを記述することには、いくつかの利点があります。ループ、条件、コレクション、文字列補完などの通常のKotlin構文を使用して、アプリを操作できます。

ハードコードされたビデオのリストを、Kotlinオブジェクトのリストに置き換えることができます。

1. `Main.kt` で、すべてのビデオ属性を1か所に保持するための `Video` [データクラス](data-classes.md)を作成します。

   ```kotlin
   data class Video(
       val id: Int,
       val title: String,
       val speaker: String,
       val videoUrl: String
   )
   ```

2. 未視聴のビデオと視聴済みのビデオの2つのリストをそれぞれ作成します。`Main.kt` のファイルレベルに以下の宣言を追加します。

   ```kotlin
   val unwatchedVideos = listOf(
       Video(1, "Opening Keynote", "Andrey Breslav", "https://youtu.be/PsaFVLr8t4E"),
       Video(2, "Dissecting the stdlib", "Huyen Tue Dao", "https://youtu.be/Fzt_9I733Yg"),
       Video(3, "Kotlin and Spring Boot", "Nicolas Frankel", "https://youtu.be/pSiZVAeReeg")
   )
   
   val watchedVideos = listOf(
       Video(4, "Creating Internal DSLs in Kotlin", "Venkat Subramaniam", "https://youtu.be/JzTeAM8N1-o")
   )
   ```

3. ページでこれらのビデオを使用するには、Kotlinの `for` ループを記述して、未視聴の `Video` オブジェクトのコレクションを反復処理します。"Videos to watch" の下にある3つの `p` タグを、次のスニペットに置き換えます。

   ```kotlin
   for (video in unwatchedVideos) {
       p {
           +"${video.speaker}: ${video.title}"
       }
   }
   ```
   
4. 同じプロセスを適用して、"Videos watched" に続く単一のタグのコードも変更します。

   ```kotlin
   for (video in watchedVideos) {
       p {
           +"${video.speaker}: ${video.title}"
       }
   }
   ```

ブラウザがリロードされるのを待ちます。レイアウトは以前と同じままのはずです。リストにビデオをさらに追加して、ループが動作していることを確認できます。

### 型安全なCSSでスタイルを追加する

[Emotion](https://emotion.sh/docs/introduction)ライブラリ用の [kotlin-emotion](https://github.com/JetBrains/kotlin-wrappers/blob/master/kotlin-emotion/) ラッパーを使用すると、JavaScriptと並んでHTMLのすぐ隣でCSS属性（動的なものも含めて）を指定できます。概念的には、[CSS-in-JS](https://reactjs.org/docs/faq-styling.html#what-is-css-in-js)に似ていますが、Kotlin用です。DSLを使用する利点は、Kotlinのコード構文を使用して書式設定ルールを表現できることです。

このチュートリアルのテンプレートプロジェクトには、`kotlin-emotion` を使用するために必要な依存関係が既に含まれています。

```kotlin
dependencies {
    // ...
    // Kotlin React Emotion (CSS) (chapter 3)
    implementation("org.jetbrains.kotlin-wrappers:kotlin-emotion")
    // ...
}
```

`kotlin-emotion` を使用すると、HTML要素 `div` や `h3` の内側に `css` ブロックを指定し、そこでスタイルを定義できます。

ビデオプレーヤーをページの右上隅に移動するには、CSSを使用してビデオプレーヤーのコード（スニペット内の最後の `div`）を調整します。

```kotlin
div {
    css {
        position = Position.absolute
        top = 10.px
        right = 10.px
    }
    h3 {
        +"John Doe: Building and breaking things"
    }
    img {
        src = "https://via.placeholder.com/640x360.png?text=Video+Player+Placeholder"
    }
}
```

他のスタイルも自由に試してみてください。たとえば、`fontFamily` を変更したり、UIに `color` を追加したりできます。

## アプリコンポーネントの設計

Reactにおける基本的な構成要素は、_[コンポーネント](https://reactjs.org/docs/components-and-props.html)_と呼ばれます。コンポーネント自体も、他のより小さなコンポーネントで構成できます。コンポーネントを組み合わせることで、アプリケーションを構築します。コンポーネントを汎用的で再利用可能になるように構造化すれば、コードやロジックを重複させることなく、アプリの複数の部分で使用できるようになります。

`render()` 関数の内容は、一般的に基本的なコンポーネントを表しています。アプリケーションの現在のレイアウトは以下のようになっています：

![現在のレイアウト](current-layout.png){width=700}

アプリケーションを個別のコンポーネントに分解すると、各コンポーネントがそれぞれの責任を処理する、より構造化されたレイアウトになります：

![コンポーネントを使用した構造化レイアウト](structured-layout.png){width=700}

コンポーネントは特定の機能をカプセル化します。コンポーネントを使用すると、ソースコードが短くなり、読みやすく理解しやすくなります。

### メインコンポーネントを追加する

アプリケーションの構造の作成を開始するには、まず、`root` 要素にレンダリングするためのメインコンポーネントである `App` を明示的に指定します。

1. `src/jsMain/kotlin` フォルダに新しい `App.kt` ファイルを作成します。
2. このファイル内に次のスニペットを追加し、`Main.kt` から型安全なHTMLをその中に移動します。

   ```kotlin
   import kotlinx.coroutines.async
   import react.*
   import react.dom.*
   import kotlinx.browser.window
   import kotlinx.coroutines.*
   import kotlinx.serialization.decodeFromString
   import kotlinx.serialization.json.Json
   import emotion.react.css
   import csstype.Position
   import csstype.px
   import react.dom.html.ReactHTML.h1
   import react.dom.html.ReactHTML.h3
   import react.dom.html.ReactHTML.div
   import react.dom.html.ReactHTML.p
   import react.dom.html.ReactHTML.img
   
   val App = FC<Props> {
       // 型安全なHTMLはここに入ります。最初のh1タグから開始してください。
   }
   ```
   
   `FC` 関数は、[関数コンポーネント](https://reactjs.org/docs/components-and-props.html#function-and-class-components)を作成します。

3. `Main.kt` ファイルで、`main()` 関数を次のように更新します。

   ```kotlin
   fun main() {
       val container = document.getElementById("root") ?: error("Couldn't find root container!")
       createRoot(container).render(App.create())
   }
   ```

   これで、プログラムは `App` コンポーネントのインスタンスを作成し、指定されたコンテナにレンダリングするようになります。

Reactの概念の詳細については、[ドキュメントとガイド](https://reactjs.org/docs/hello-world.html#how-to-read-this-guide)を参照してください。

### リストコンポーネントを抽出する

`watchedVideos` リストと `unwatchedVideos` リストはそれぞれビデオのリストを含んでいるため、単一の再利用可能なコンポーネントを作成し、リストに表示される内容のみを調整するのが合理的です。

`VideoList` コンポーネントは `App` コンポーネントと同じパターンに従います。`FC` ビルダー関数を使用し、`unwatchedVideos` リストのコードを含みます。

1. `src/jsMain/kotlin` フォルダに新しい `VideoList.kt` ファイルを作成し、次のコードを追加します。

   ```kotlin
   import kotlinx.browser.window
   import react.*
   import react.dom.*
   import react.dom.html.ReactHTML.p
   
   val VideoList = FC<Props> {
       for (video in unwatchedVideos) {
           p {
               +"${video.speaker}: ${video.title}"
           }
       }
   }
   ```

2. `App.kt` で、パラメータなしで `VideoList` コンポーネントを呼び出して使用します。

   ```kotlin
   // . . .

   div {
       h3 {
           +"Videos to watch"
       }
       VideoList()
   
       h3 {
           +"Videos watched"
       }
       VideoList()
   }

   // . . .
   ```

   現在のところ、`App` コンポーネントは `VideoList` コンポーネントによって表示されるコンテンツを制御できません。ハードコードされているため、同じリストが2回表示されます。

### コンポーネント間でデータを渡すためのpropsを追加する

`VideoList` コンポーネントを再利用するためには、異なるコンテンツで埋めることができる必要があります。コンポーネントの属性としてアイテムのリストを渡す機能を追加できます。Reactでは、これらの属性は _props_ と呼ばれます。Reactでコンポーネントの props が変更されると、フレームワークは自動的にコンポーネントを再レンダリングします。

`VideoList` の場合、表示するビデオのリストを含む prop が必要になります。`VideoList` コンポーネントに渡すことができるすべての props を保持するインターフェースを定義します。

1. `VideoList.kt` ファイルに次の定義を追加します。

   ```kotlin
   external interface VideoListProps : Props {
       var videos: List<Video>
   }
   ```
   [external](js-interop.md#external-modifier) 修飾子は、インターフェースの実装が外部で提供されることをコンパイラに伝えます。これにより、コンパイラは宣言からJavaScriptコードを生成しようとしません。

2. `VideoList` のクラス定義を調整して、`FC` ブロックにパラメータとして渡される props を利用するようにします。

   ```kotlin
   val VideoList = FC<VideoListProps> { props ->
       for (video in props.videos) {
           p {
               key = video.id.toString()
               +"${video.speaker}: ${video.title}"
           }
       }
   }
   ```

   `key` 属性は、`props.videos` の値が変更されたときにReactレンダラーが何をすべきかを判断するのに役立ちます。Reactはキーを使用して、リストのどの部分を更新する必要があり、どの部分をそのまま維持するかを決定します。リストとキーの詳細については、[Reactガイド](https://reactjs.org/docs/lists-and-keys.html)を参照してください。

3. `App` コンポーネントで、子コンポーネントが適切な属性でインスタンス化されていることを確認します。`App.kt` で、`h3` 要素の下にある2つのループを、`unwatchedVideos` と `watchedVideos` の属性を伴う `VideoList` の呼び出しに置き換えます。
   Kotlin DSLでは、`VideoList` コンポーネントに属するブロック内でそれらを割り当てます。

   ```kotlin
   h3 {
       +"Videos to watch"
   }
   VideoList {
       videos = unwatchedVideos
   }
   h3 {
       +"Videos watched"
   }
   VideoList {
       videos = watchedVideos
   }
   ```

リロード後、ブラウザにはリストが正しくレンダリングされていることが表示されます。

### リストをインタラクティブにする

まず、ユーザーがリストエントリをクリックしたときに表示されるアラートメッセージを追加します。`VideoList.kt` で、現在のビデオのアラートをトリガーする `onClick` ハンドラー関数を追加します。

```kotlin
// . . .

p {
    key = video.id.toString()
    onClick = {
        window.alert("Clicked $video!")
    }
    +"${video.speaker}: ${video.title}"
}

// . . .
```

ブラウザウィンドウでリストアイテムの1つをクリックすると、次のようなアラートウィンドウにビデオに関する情報が表示されます。

![ブラウザのアラートウィンドウ](alert-window.png){width=700}

> `onClick` 関数をラムダとして直接定義することは簡潔で、プロトタイピングに非常に便利です。しかし、Kotlin/JSにおける等価性の[現在の動作](https://youtrack.jetbrains.com/issue/KT-15101)のため、パフォーマンスの観点からは、クリックハンドラーを渡すための最も最適化された方法ではありません。レンダリングパフォーマンスを最適化したい場合は、関数を変数に格納して渡すことを検討してください。
>
{style="tip"}

### 値を保持するためのstateを追加する

単にユーザーにアラートを出す代わりに、選択されたビデオを ▶ の三角形で強調表示する機能を追加しましょう。これを行うには、このコンポーネントに固有の _state（状態）_ を導入します。

stateはReactの核となる概念の1つです。最新のReact（いわゆる _Hooks API_ を使用するもの）では、stateは [`useState` フック](https://reactjs.org/docs/hooks-state.html)を使用して表現されます。

1. `VideoList` 宣言の先頭に次のコードを追加します。

   ```kotlin
   val VideoList = FC<VideoListProps> { props ->
       var selectedVideo: Video? by useState(null)

   // . . .
   ```
   {validate="false"}

   * `VideoList` 関数コンポーネントは、state（現在の関数の呼び出しから独立した値）を保持します。stateはnull許容で、`Video?` 型を持ちます。デフォルト値は `null` です。
   * Reactの `useState()` 関数は、関数の複数の呼び出しにわたってstateを追跡するようにフレームワークに指示します。たとえば、デフォルト値を指定しても、Reactはデフォルト値が最初だけに割り当てられるようにします。stateが変更されると、コンポーネントは新しいstateに基づいて再レンダリングされます。
   * `by` キーワードは、`useState()` が[委譲プロパティ（delegated property）](delegated-properties.md)として機能することを示します。他の変数と同様に、値を読み書きします。`useState()` の背後の実装が、stateを機能させるために必要なメカニズムを処理します。

   Stateフックの詳細については、[Reactドキュメント](https://reactjs.org/docs/hooks-state.html)を確認してください。

2. `VideoList` コンポーネントの `onClick` ハンドラーとテキストを次のように変更します。

   ```kotlin
   val VideoList = FC<VideoListProps> { props ->
       var selectedVideo: Video? by useState(null)
       for (video in props.videos) {
           p {
               key = video.id.toString()
               onClick = {
                   selectedVideo = video
               }
               if (video == selectedVideo) {
                   +"▶ "
               }
               +"${video.speaker}: ${video.title}"
           }
       }
   }
   ```

   * ユーザーがビデオをクリックすると、その値が `selectedVideo` 変数に代入されます。
   * 選択されたリストエントリがレンダリングされるときに、三角形が先頭に追加されます。

state管理の詳細については、[React FAQ](https://reactjs.org/docs/faq-state.html)で見つけることができます。

ブラウザを確認し、リスト内のアイテムをクリックして、すべてが正しく動作していることを確認してください。

## コンポーネントを合成する

現在、2つのビデオリストはそれぞれ独自に機能しています。つまり、各リストが選択されたビデオを個別に追跡しています。プレーヤーは1つしかないにもかかわらず、ユーザーは未視聴リストと視聴済みリストで2つのビデオを選択できてしまいます。

![両方のリストで同時に2つのビデオが選択されている](two-videos-select.png){width=700}

リストは、自分自身の内部と、兄弟リストの内部の両方でどのビデオが選択されているかを追跡することはできません。その理由は、選択されたビデオが _リスト_ のstateではなく、_アプリケーション_ のstateの一部だからです。これは、個々のコンポーネントからstateを _引き上げる（lift）_ 必要があることを意味します。

### Stateの引き上げ

Reactでは、propsは親コンポーネントからその子コンポーネントへと一方向にしか渡せません。これにより、コンポーネント同士が密結合になるのを防ぎます。

コンポーネントが兄弟コンポーネントのstateを変更したい場合は、親を介して行う必要があります。その時点で、stateも子コンポーネントのいずれかに属するのではなく、それらを統括する親コンポーネントに属することになります。

stateをコンポーネントからその親に移行するプロセスは、_stateの引き上げ（lifting state）_ と呼ばれます。今回のアプリでは、`App` コンポーネントに `currentVideo` をstateとして追加します。

1. `App.kt` で、`App` コンポーネントの定義の先頭に次を追加します。

   ```kotlin
   val App = FC<Props> {
       var currentVideo: Video? by useState(null)
   
       // . . .
   }
   ```

   `VideoList` コンポーネントはもはやstateを追跡する必要がありません。代わりに、現在のビデオを prop として受け取ります。

2. `VideoList.kt` 内の `useState()` 呼び出しを削除します。
3. `VideoList` コンポーネントが選択されたビデオを prop として受け取れるように準備します。これを行うには、`VideoListProps` インターフェースを拡張して `selectedVideo` を含めます。

   ```kotlin
   external interface VideoListProps : Props {
       var videos: List<Video>
       var selectedVideo: Video?
   }
   ```

4. 三角形の条件を、`state` の代わりに `props` を使用するように変更します。

   ```kotlin
   if (video == props.selectedVideo) {
       +"▶ "
   }
   ```

### ハンドラーを渡す

現時点では、prop に値を代入する方法がないため、`onClick` 関数は現在の設定のままでは動作しません。親コンポーネントのstateを変更するには、ここでもstateを引き上げる必要があります。

Reactでは、stateは常に親から子へと流れます。そのため、子コンポーネントの1つから _アプリケーション_ のstateを変更するには、ユーザーインタラクションを処理するためのロジックを親コンポーネントに移動し、そのロジックを prop として渡す必要があります。Kotlinでは、変数は[関数の型](lambdas.md#function-types)を持つことができることを思い出してください。

1. `VideoListProps` インターフェースを再度拡張し、`Video` を受け取って `Unit` を返す関数である `onSelectVideo` 変数を含めます。

   ```kotlin
   external interface VideoListProps : Props {
       // ...
       var onSelectVideo: (Video) -> Unit
   }
   ```

2. `VideoList` コンポーネントで、`onClick` ハンドラーに新しい prop を使用します。

   ```kotlin
   onClick = {
       props.onSelectVideo(video)
   }
   ```
   
   これで、`VideoList` コンポーネントから `selectedVideo` 変数を削除できます。

3. `App` コンポーネントに戻り、2つのビデオリストのそれぞれに対して `selectedVideo` と `onSelectVideo` のハンドラーを渡します。
   Kotlin DSLでは、`VideoList` コンポーネントに属するブロック内でそれらを割り当てます。

   ```kotlin
   VideoList {
       videos = unwatchedVideos // および watchedVideos をそれぞれ指定
       selectedVideo = currentVideo
       onSelectVideo = { video ->
           currentVideo = video
       }
   }
   ```

4. 視聴済みビデオリストについても、前の手順を繰り返します。

ブラウザに戻り、ビデオを選択したときに、選択が重複することなく2つのリスト間をジャンプすることを確認してください。

## コンポーネントをさらに追加する

### ビデオプレーヤーコンポーネントを抽出する

現在プレースホルダー画像となっているビデオプレーヤーを、別の独立したコンポーネントとして作成できます。ビデオプレーヤーは、トークのタイトル、トークの著者、およびビデオへのリンクを知る必要があります。この情報は各 `Video` オブジェクトに既に含まれているため、それを prop として渡し、その属性にアクセスできます。

1. 新しい `VideoPlayer.kt` ファイルを作成し、`VideoPlayer` コンポーネントの次の実装を追加します。

   ```kotlin
   import csstype.*
   import react.*
   import emotion.react.css
   import react.dom.html.ReactHTML.button
   import react.dom.html.ReactHTML.div
   import react.dom.html.ReactHTML.h3
   import react.dom.html.ReactHTML.img
   
   external interface VideoPlayerProps : Props {
       var video: Video
   }
   
   val VideoPlayer = FC<VideoPlayerProps> { props ->
       div {
           css {
               position = Position.absolute
               top = 10.px
               right = 10.px
           }
           h3 {
               +"${props.video.speaker}: ${props.video.title}"
           }
           img {
               src = "https://via.placeholder.com/640x360.png?text=Video+Player+Placeholder"              
           }
       }
   }
   ```

2. `VideoPlayerProps` インターフェースは `VideoPlayer` コンポーネントがnull非許容の `Video` を受け取ることを指定しているため、`App` コンポーネントでそれに応じた処理を行うようにしてください。

   `App.kt` で、ビデオプレーヤーの以前の `div` スニペットを次のように置き換えます。

   ```kotlin
   currentVideo?.let { curr ->
       VideoPlayer {
           video = curr
       }
   }
   ```

   [`let` スコープ関数](scope-functions.md#let)により、`state.currentVideo` が null でない場合にのみ `VideoPlayer` コンポーネントが追加されるようになります。

これで、リスト内のエントリをクリックするとビデオプレーヤーが表示され、クリックされたエントリの情報が入力されるようになります。

### ボタンを追加して連携させる

ユーザーがビデオを視聴済みまたは未視聴としてマークし、2つのリスト間で移動できるようにするために、`VideoPlayer` コンポーネントにボタンを追加します。

このボタンは2つの異なるリスト間でビデオを移動させるため、stateの変更を処理するロジックは `VideoPlayer` から _引き上げられ_、親から prop として渡される必要があります。ボタンの見た目は、ビデオが視聴済みかどうかによって変わる必要があります。これも prop として渡す必要がある情報です。

1. `VideoPlayer.kt` の `VideoPlayerProps` インターフェースを拡張して、これら2つのケースのプロパティを含めます。

   ```kotlin
   external interface VideoPlayerProps : Props {
       var video: Video
       var onWatchedButtonPressed: (Video) -> Unit
       var unwatchedVideo: Boolean
   }
   ```

2. これで、実際のコンポーネントにボタンを追加できます。次のスニペットを、`VideoPlayer` コンポーネントのボディ内の `h3` タグと `img` タグの間にコピーします。

   ```kotlin
   button {
       css {
           display = Display.block
           backgroundColor = if (props.unwatchedVideo) NamedColor.lightgreen else NamedColor.red
       }
       onClick = {
           props.onWatchedButtonPressed(props.video)
       }
       if (props.unwatchedVideo) {
           +"Mark as watched"
       } else {
           +"Mark as unwatched"
       }
   }
   ```

   スタイルを動的に変更できる Kotlin CSS DSL の助けを借りて、基本的な Kotlin `if` 式を使用してボタンの色を変更できます。

### ビデオリストをアプリケーションstateに移動する

次に、`App` コンポーネント内の `VideoPlayer` の使用箇所を調整します。ボタンがクリックされたときに、ビデオが未視聴リストから視聴済みリストへ、またはその逆へと移動される必要があります。これらのリストは実際に変更される可能性があるため、これらをアプリケーションstateに移動します。

1. `App.kt` で、`App` コンポーネントの先頭に `useState()` 呼び出しを伴う次のプロパティを追加します。

   ```kotlin
   val App = FC<Props> {
       var currentVideo: Video? by useState(null)
       var unwatchedVideos: `List<Video>` by useState(listOf(
           Video(1, "Opening Keynote", "Andrey Breslav", "https://youtu.be/PsaFVLr8t4E"),
           Video(2, "Dissecting the stdlib", "Huyen Tue Dao", "https://youtu.be/Fzt_9I733Yg"),
           Video(3, "Kotlin and Spring Boot", "Nicolas Frankel", "https://youtu.be/pSiZVAeReeg")
       ))
       var watchedVideos: `List<Video>` by useState(listOf(
           Video(4, "Creating Internal DSLs in Kotlin", "Venkat Subramaniam", "https://youtu.be/JzTeAM8N1-o")
       ))

       // . . .
   }
   ```

2. すべてのデモデータが `watchedVideos` と `unwatchedVideos` のデフォルト値に直接含まれるようになったため、ファイルレベルの宣言はもはや必要ありません。`Main.kt` で、`watchedVideos` と `unwatchedVideos` の宣言を削除します。
3. ビデオプレーヤーに属する `App` コンポーネント内の `VideoPlayer` の呼び出し箇所を次のように変更します。

   ```kotlin
   VideoPlayer {
       video = curr
       unwatchedVideo = curr in unwatchedVideos
       onWatchedButtonPressed = {
           if (video in unwatchedVideos) {
               unwatchedVideos = unwatchedVideos - video
               watchedVideos = watchedVideos + video
           } else {
               watchedVideos = watchedVideos - video
               unwatchedVideos = unwatchedVideos + video
           }
       }
   }
   ```

ブラウザに戻り、ビデオを選択してボタンを数回押してみてください。ビデオが2つのリスト間をジャンプします。

## npmのパッケージを使用する

アプリを実用的にするために、実際にビデオを再生するビデオプレーヤーと、コンテンツの共有に役立つボタンが必要です。

Reactには、これらの機能を自分で構築する代わりに使用できる、既製のコンポーネントが多数含まれた豊かなエコシステムがあります。

### ビデオプレーヤーコンポーネントを追加する

プレースホルダーのビデオコンポーネントを実際のYouTubeプレーヤーに置き換えるには、npm の `react-player` パッケージを使用します。これはビデオを再生でき、プレーヤーの外観を制御することもできます。

コンポーネントのドキュメントとAPIの説明については、GitHubの [README](https://www.npmjs.com/package/react-player) を参照してください。

1. `build.gradle.kts` ファイルを確認します。`react-player` パッケージが既に含まれているはずです。

   ```kotlin
   dependencies {
       // ...
       // ビデオプレーヤー
       implementation(npm("react-player", "2.12.0"))
       // ...
   }
   ```

   ご覧のとおり、npmの依存関係は、ビルドファイルの `dependencies` ブロックで `npm()` 関数を使用することでKotlin/JSプロジェクトに追加できます。Gradleプラグインは、これらの依存関係のダウンロードとインストールを自動的に行います。その際、プラグインに同梱されている [Yarn](https://yarnpkg.com/) パッケージマネージャーを使用します。

2. Reactアプリケーション内からJavaScriptパッケージを使用するには、[外部宣言（external declarations）](js-interop.md)を提供して、何を期待すべきかをKotlinコンパイラに伝える必要があります。

   新しい `ReactYouTube.kt` ファイルを作成し、次のコンテンツを追加します。

   ```kotlin
   @file:JsModule("react-player")
   @file:JsNonModule
   
   import react.*
   
   @JsName("default")
   external val ReactPlayer: ComponentClass<dynamic>
   ```

   コンパイラは `ReactPlayer` のような外部宣言を見ると、対応するクラスの実装が依存関係によって提供されるものと見なし、そのためのコードを生成しません。

   最後の2行は、`require("react-player").default;` のようなJavaScriptのインポートに相当します。これらは、実行時にコンポーネントが `ComponentClass<dynamic>` に準拠していることが確実であることをコンパイラに伝えます。

しかし、この構成では、`ReactPlayer` が受け入れる props のジェネリック型が `dynamic` に設定されています。これはコンパイラがいかなるコードも受け入れることを意味し、実行時にエラーが発生するリスクがあります。

より良い代替案は、この外部コンポーネントの props にどのようなプロパティが属するかを指定する `external interface` を作成することです。props のインターフェースについては、コンポーネントの [README](https://www.npmjs.com/package/react-player) で確認できます。この場合、`url` と `controls` props を使用します。

1. `dynamic` を外部インターフェースに置き換えて、`ReactYouTube.kt` の内容を調整します。

   ```kotlin
   @file:JsModule("react-player")
   @file:JsNonModule
   
   import react.*
   
   @JsName("default")
   external val ReactPlayer: ComponentClass<ReactPlayerProps>
   
   external interface ReactPlayerProps : Props {
       var url: String
       var controls: Boolean
   }
   ```

2. これで、新しい `ReactPlayer` を使用して、`VideoPlayer` コンポーネント内の灰色のプレースホルダーの長方形を置き換えることができます。`VideoPlayer.kt` で、`img` タグを次のスニペットに置き換えます。

   ```kotlin
   ReactPlayer {
       url = props.video.videoUrl
       controls = true
   }
   ```

### ソーシャルシェアボタンを追加する

アプリケーションのコンテンツを共有する簡単な方法は、メッセンジャーやメール用のソーシャルシェアボタンを用意することです。これにも既製のReactコンポーネント（例：[react-share](https://github.com/nygardk/react-share/blob/master/README.md)）を使用できます。

1. `build.gradle.kts` ファイルを確認します。このnpmライブラリが既に含まれているはずです。

   ```kotlin
   dependencies {
       // ...
       // シェアボタン
       implementation(npm("react-share", "4.4.1"))
       // ...
   }
   ```

2. Kotlinから `react-share` を使用するには、さらに基本的な外部宣言を記述する必要があります。[GitHubの例](https://github.com/nygardk/react-share/blob/master/demo/Demo.tsx#L61)を見ると、シェアボタンはたとえば `EmailShareButton` と `EmailIcon` の2つのReactコンポーネントで構成されていることがわかります。異なるタイプのシェアボタンやアイコンはすべて同じ種類のインターフェースを持っています。
   ビデオプレーヤーですでに行ったのと同じ方法で、各コンポーネントの外部宣言を作成します。

   新しい `ReactShare.kt` ファイルに次のコードを追加します。

   ```kotlin
   @file:JsModule("react-share")
   @file:JsNonModule
   
   import react.ComponentClass
   import react.Props
   
   @JsName("EmailIcon")
   external val EmailIcon: ComponentClass<IconProps>
   
   @JsName("EmailShareButton")
   external val EmailShareButton: ComponentClass<ShareButtonProps>
   
   @JsName("TelegramIcon")
   external val TelegramIcon: ComponentClass<IconProps>
   
   @JsName("TelegramShareButton")
   external val TelegramShareButton: ComponentClass<ShareButtonProps>
   
   external interface ShareButtonProps : Props {
       var url: String
   }
   
   external interface IconProps : Props {
       var size: Int
       var round: Boolean
   }
   ```

3. アプリケーションのユーザーインターフェースに新しいコンポーネントを追加します。`VideoPlayer.kt` で、`ReactPlayer` の使用箇所のすぐ上の `div` に、2つのシェアボタンを追加します。

   ```kotlin
   // . . .

   div {
       css {
            position = Position.absolute
            top = 10.px
            right = 10.px
        }
       EmailShareButton {
           url = props.video.videoUrl
           EmailIcon {
               size = 32
               round = true
           }
       }
       TelegramShareButton {
           url = props.video.videoUrl
           TelegramIcon {
               size = 32
               round = true
           }
       }
   }

   // . . .
   ```

これで、ブラウザを確認してボタンが実際に動作するかどうかを確認できます。ボタンをクリックすると、ビデオのURLが含まれた「共有ウィンドウ」が表示されるはずです。ボタンが表示されない、または機能しない場合は、広告ブロッカーやソーシャルメディアブロッカーを無効にする必要があるかもしれません。

![共有ウィンドウ](social-buttons.png){width=700}

[react-share](https://github.com/nygardk/react-share/blob/master/README.md#features) で利用可能な他のソーシャルネットワークのシェアボタンについても、この手順を自由に繰り返してみてください。

## 外部REST APIを使用する

ハードコードされたデモデータを、アプリ内のREST APIからの実際のデータに置き換えることができます。

このチュートリアルでは、[小さなAPI](https://my-json-server.typicode.com/kotlin-hands-on/kotlinconf-json/videos/1)を用意しています。これは `videos` という単一のエンドポイントのみを提供し、数値パラメータを受け取ってリストから要素にアクセスします。ブラウザでAPIにアクセスすると、APIから返されるオブジェクトが `Video` オブジェクトと同じ構造を持っていることがわかります。

### KotlinからJSの機能を使用する

ブラウザには、すでに多種多様な [Web API](https://developer.mozilla.org/en-US/docs/Web/API) が備わっています。Kotlin/JSにはこれらのAPI用のラッパーが標準で含まれているため、Kotlin/JSからこれらを使用することもできます。一例として、HTTPリクエストを作成するために使用される [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) があります。

最初に考えられる問題は、`fetch()` のようなブラウザAPIが非ブロッキング操作を実行するために [コールバック](https://developer.mozilla.org/en-US/docs/Glossary/Callback_function) を使用することです。複数のコールバックを次々に実行する必要がある場合、それらをネストする必要があります。当然、コードは深くインデントされ、より多くの機能が互いに積み重なり、読みづらくなります。

これを克服するために、このような機能に対する優れたアプローチであるKotlin의 コルーチンを使用できます。

2つ目の問題は、JavaScriptの動的型付けの性質から生じます。外部APIから返されるデータの型に関する保証はありません。これを解決するために、`kotlinx.serialization` ライブラリを使用できます。

`build.gradle.kts` ファイルを確認してください。関連するスニペットが既に存在しているはずです。

```kotlin
dependencies {
    // . . .

    // コルーチン & シリアル化
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.6.4")
}
```

### シリアル化を追加する

外部APIを呼び出すと、JSON形式のテキストが返されます。これを、操作可能なKotlinオブジェクトに変換する必要があります。

[`kotlinx.serialization`](https://github.com/Kotlin/kotlinx.serialization) は、JSON文字列からKotlinオブジェクトへのこのような変換を記述できるようにするライブラリです。

1. `build.gradle.kts` ファイルを確認します。対応するスニペットが既に存在しているはずです。

   ```kotlin
   plugins {
       // . . .
       kotlin("plugin.serialization") version "%kotlinVersion%"
   }
   
   dependencies {
       // . . .

       // シリアル化
       implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.5.0")
   }
   ```

2. 最初のビデオを取得するための準備として、シリアル化ライブラリに `Video` クラスについて教える必要があります。`Main.kt` で、その定義に `@Serializable` アノテーションを追加します。

   ```kotlin
   @Serializable
   data class Video(
       val id: Int,
       val title: String,
       val speaker: String,
       val videoUrl: String
   )
   ```

### ビデオを取得する

APIからビデオを取得するには、`App.kt`（または新しいファイル）に次の関数を追加します。

```kotlin
suspend fun fetchVideo(id: Int): Video {
    val response = window
        .fetch("https://my-json-server.typicode.com/kotlin-hands-on/kotlinconf-json/videos/$id")
        .await()
        .text()
        .await()
    return Json.decodeFromString(response)
}
```

* _中断関数（Suspending function）_ `fetch()` は、APIから指定された `id` のビデオを取得します。この応答には時間がかかる場合があるため、結果を `await()` します。次に、コールバックを使用する `text()` が応答からボディを読み取ります。その後、その完了を `await()` します。
* 関数の値を返す前に、それを `kotlinx.coroutines` の関数である `Json.decodeFromString` に渡します。これにより、リクエストから受け取ったJSONテキストが適切なフィールドを持つKotlinオブジェクトに変換されます。
* `window.fetch` 関数の呼び出しは `Promise` オブジェクトを返します。通常は、`Promise` が解決されて結果が利用可能になったときに呼び出されるコールバックハンドラーを定義する必要があります。しかし、コルーチンを使用すると、それらの Promise を `await()` できます。`await()` のような関数が呼び出されるたびに、メソッドはその実行を停止（中断）します。Promise が解決されると実行が再開されます。

ユーザーにビデオの選択肢を提供するために、上記と同じAPIから25個のビデオを取得する `fetchVideos()` 関数を定義します。すべてのリクエストを並行して実行するために、Kotlinのコルーチンによって提供される [`async`](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/async.html) 機能を使用します。

1. `App.kt` に次の実装を追加します。

   ```kotlin
   suspend fun fetchVideos(): `List<Video>` = coroutineScope {
       (1..25).map { id ->
           async {
               fetchVideo(id)
           }
       }.awaitAll()
   }
   ```

   [構造化された並行性（structured concurrency）](https://kotlinlang.org/docs/coroutines-basics.html#structured-concurrency)の原則に従い、実装は `coroutineScope` でラップされます。これにより、25個の非同期タスク（リクエストごとに1つ）を開始し、それらすべてが完了するのを待つことができます。

2. これで、アプリケーションにデータを追加できます。`mainScope` の定義を追加し、`App` コンポーネントが次のスニペットで始まるように変更します。デモ値を `emptyList()` インスタンスに置き換えることも忘れないでください。

   ```kotlin
   val mainScope = MainScope()
   
   val App = FC<Props> {
       var currentVideo: Video? by useState(null)
       var unwatchedVideos: `List<Video>` by useState(emptyList())
       var watchedVideos: `List<Video>` by useState(emptyList())
   
       useEffectOnce {
           mainScope.launch {
               unwatchedVideos = fetchVideos()
           }
       }

   // . . .
   ```
   {validate="false"}

   * [`MainScope()`](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-main-scope.html) は、Kotlinの構造化並行性モデルの一部であり、非同期タスクを実行するためのスコープを作成します。
   * `useEffectOnce` は別のReact _フック_（具体的には、[useEffect](https://reactjs.org/docs/hooks-effect.html) フックの簡略版）です。これはコンポーネントが _副作用（side effect）_ を実行することを示します。単に自分自身をレンダリングするだけでなく、ネットワーク経由で通信も行います。

ブラウザを確認してください。アプリケーションに実際のデータが表示されているはずです：

![APIから取得されたデータ](website-api-data.png){width=700}

ページをロードすると：

* `App` コンポーネントのコードが呼び出されます。これにより、`useEffectOnce` ブロック内のコードが開始されます。
* `App` コンポーネントは、視聴済みおよび未視聴ビデオの空のリストでレンダリングされます。
* APIリクエストが終了すると、`useEffectOnce` ブロックがその結果を `App` コンポーネントのstateに割り当てます。これにより再レンダリングがトリガーされます。
* `App` コンポーネントのコードが再度呼び出されますが、`useEffectOnce` ブロックは2回目は _実行されません_。

コルーチンの仕組みについて深く理解したい場合は、この [コルーチンに関するチュートリアル](coroutines-and-channels.md) を確認してください。

## 本番環境とクラウドへのデプロイ

アプリケーションをクラウドに公開して、他の人がアクセスできるようにしましょう。

### 本番ビルドのパッケージ化

すべての資産を本番モードでパッケージ化するには、IntelliJ IDEAのツールウィンドウから、または `./gradlew build` を実行して、Gradleで `build` タスクを実行します。これにより、DCE（デッドコード削除）などのさまざまな改善が適用された、最適化されたプロジェクトビルドが生成されます。

ビルドが完了すると、デプロイに必要なすべてのファイルが `/build/dist` に配置されます。これらには、JavaScriptファイル、HTMLファイル、およびアプリケーションの実行に必要なその他のリソースが含まれます。これらを静的HTTPサーバーに配置したり、GitHub Pagesを使用して提供したり、お好みのクラウドプロバイダーでホストしたりできます。

### Herokuへのデプロイ

Herokuを使用すると、独自のドメインでアクセス可能なアプリケーションを非常に簡単に立ち上げることができます。無料枠でも開発目的には十分なはずです。

1. [アカウントを作成](https://signup.heroku.com/)します。
2. [CLIクライアントをインストールして認証](https://devcenter.heroku.com/articles/heroku-cli)します。
3. プロジェクトのルートでターミナルから次のコマンドを実行して、Gitリポジトリを作成し、Herokuアプリをアタッチします。

   ```bash
   git init
   heroku create
   git add .
   git commit -m "initial commit"
   ```

4. Herokuで動作する通常のJVMアプリケーション（たとえば、KtorやSpring Bootで書かれたもの）とは異なり、このアプリは適切に提供される必要がある静的なHTMLページとJavaScriptファイルを生成します。プログラムを適切に提供するように、必要なビルドパックを調整できます。

   ```bash
   heroku buildpacks:set heroku/gradle
   heroku buildpacks:add https://github.com/heroku/heroku-buildpack-static.git
   ```

5. `heroku/gradle` ビルドパックが正常に動作するように、`build.gradle.kts` ファイルに `stage` タスクが必要です。このタスクは `build` タスクと同等であり、対応するエイリアスは既にファイルの最後に含まれています。

   ```kotlin
   // Herokuへのデプロイ
   tasks.register("stage") {
       dependsOn("build")
   }
   ```

6. `buildpack-static` を構成するために、プロジェクトルートに新しい `static.json` ファイルを追加します。
7. ファイル内に `root` プロパティを追加します。

   ```xml
   {
       "root": "build/distributions"
   }
   ```
   {validate="false"}

8. たとえば、次のコマンドを実行してデプロイをトリガーできます。

   ```bash
   git add -A
   git commit -m "add stage task and static content root configuration"
   git push heroku master
   ```

> main 以外のブランチからプッシュする場合は、コマンドを調整して `main` リモートにプッシュしてください（例：`git push heroku feature-branch:main`）。
>
{style="tip"}

デプロイが成功すると、インターネット上でアプリケーションにアクセスするためのURLが表示されます。

![Webアプリの本番環境へのデプロイ](deployment-to-production.png){width=700}

> この時点のプロジェクトの状態は、[こちら](https://github.com/kotlin-hands-on/web-app-react-kotlin-js-gradle/tree/finished)の `finished` ブランチで見つけることができます。
>
{style="note"}

## 次のステップ

### さらに機能を追加する {initial-collapse-state="collapsed" collapsible="true"}

出来上がったアプリを出発点として、React、Kotlin/JSなどの分野におけるより高度なトピックを探索できます。

* **検索**。トークのリストをタイトルや著者などでフィルタリングするための検索フィールドを追加できます。[ReactにおけるHTMLフォーム要素の仕組み](https://reactjs.org/docs/forms.html)について学びましょう。
* **永続化**。現在、アプリケーションはページがリロードされるたびに視聴者の視聴リストを失います。Kotlinで利用可能なWebフレームワーク（[Ktor](https://ktor.io/) など）のいずれかを使用して、独自のバックエンドを構築することを検討してください。あるいは、[クライアントに情報を保存する](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)方法を調べてください。
* **複雑なAPI**。多数のデータセットやAPIが利用可能です。あらゆる種類のデータをアプリケーションに取り込むことができます。たとえば、[猫の写真](https://thecatapi.com/)のビジュアライザーや、[著作権フリーのストックフォトAPI](https://unsplash.com/developers)を構築できます。

### スタイルの改善：レスポンシブとグリッド {initial-collapse-state="collapsed" collapsible="true"}

アプリケーションのデザインはまだ非常にシンプルで、モバイルデバイスや狭いウィンドウではあまり良く見えません。アプリをよりアクセシブルにするために、CSS DSLをさらに探索してください。

### コミュニティに参加して助けを得る {initial-collapse-state="collapsed" collapsible="true"}

問題を報告したり助けを得たりするための最良の方法は、[kotlin-wrappersの問題トラッカー](https://github.com/JetBrains/kotlin-wrappers/issues)です。自分の問題に関するチケットが見つからない場合は、お気軽に新しいチケットを作成してください。公式の [Kotlin Slack](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up) に参加することもできます。`#javascript` や `#react` のチャンネルがあります。

### コルーチンについてもっと学ぶ {initial-collapse-state="collapsed" collapsible="true"}

並行コードの記述方法について詳しく知りたい場合は、[コルーチンに関するチュートリアル](coroutines-and-channels.md)を確認してください。

### Reactについてもっと学ぶ {initial-collapse-state="collapsed" collapsible="true"}

基本的なReactの概念と、それらがKotlinでどのように変換されるかを学んだので、[Reactのドキュメント](https://react.dev/learn)で概説されている他の概念をKotlinに変換してみることができます。