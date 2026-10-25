[//]: # (title: ReactとKotlin/JSでWebアプリケーションを構築する — チュートリアル)

<no-index/>

このチュートリアルでは、Kotlin/JSと[React](https://reactjs.org/)フレームワークを使用してブラウザアプリケーションを構築する方法を学びます。内容は以下の通りです：

* 一般的なReactアプリケーションの構築に伴う典型的なタスクを完了する。
* 可読性を損なうことなく概念を簡潔かつ統一的に表現できる[KotlinのDSL](type-safe-builders.md)の活用法を探究し、完全にKotlinだけで本格的なアプリケーションを作成できるようにする。
* 既存のnpmコンポーネントの利用方法、外部ライブラリの使い方、そして完成したアプリケーションの公開方法を学ぶ。

成果物は、[KotlinConf](https://kotlinconf.com/)カンファレンスのトークへのリンクを備えた専用のWebアプリ「_KotlinConf Explorer_」です。ユーザーは1つのページですべてのトークを視聴し、視聴済みか未視聴かをマークできます。

このチュートリアルは、Kotlinの既有知識、およびHTMLとCSSの基本的な知識があることを前提としています。Reactの基本概念を理解していると一部のサンプルコードを理解しやすくなりますが、必須ではありません。

> 完成したアプリケーションは[こちら](https://github.com/kotlin-hands-on/web-app-react-kotlin-js-gradle/tree/finished)から入手できます。
>
{style="note"}

## 始める前に {id="before-you-start"}

1. 最新バージョンの[IntelliJ IDEA](https://www.jetbrains.com/idea/download/)をダウンロードしてインストールします。
2. [プロジェクトテンプレート](https://github.com/kotlin-hands-on/web-app-react-kotlin-js-gradle)をクローンし、IntelliJ IDEAで開きます。テンプレートには、必要なすべての設定と依存関係が含まれた基本的なKotlin Multiplatform Gradleプロジェクトが含まれています。

   * `build.gradle.kts`ファイル内の依存関係とタスク：
   
   ```kotlin
   dependencies {
       // React, React DOM + Wrappers
       implementation(enforcedPlatform("org.jetbrains.kotlin-wrappers:kotlin-wrappers-bom:1.0.0-pre.430"))
       implementation("org.jetbrains.kotlin-wrappers:kotlin-react")
       implementation("org.jetbrains.kotlin-wrappers:kotlin-react-dom")
   
       // Kotlin React Emotion (CSS)
       implementation("org.jetbrains.kotlin-wrappers:kotlin-emotion")
   
       // Video Player
       implementation(npm("react-player", "^2.12.0"))
   
       // Share Buttons
       implementation(npm("react-share", "^4.4.1"))
   
       // Coroutines & serialization
       implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.6.4")
       implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.5.0")
   }
   ```

   * このチュートリアルで使用するJavaScriptコードを挿入するための、`src/jsMain/resources/index.html`にあるHTMLテンプレートページ：

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

   Kotlin/JSプロジェクトをビルドすると、すべてのコードとその依存関係が、プロジェクトと同じ名前を持つ単一のJavaScriptファイル（`confexplorer.js`）に自動的にバンドルされます。一般的な[JavaScriptの慣例](https://faqs.skillcrush.com/article/176-where-should-js-script-tags-be-linked-in-html-documents)に従い、スクリプトの前にブラウザがすべてのページ要素を読み込めるよう、bodyのコンテンツ（`root` divを含む）が最初に読み込まれます。

* `src/jsMain/kotlin/Main.kt`のコードスニペット：

   ```kotlin
   import kotlinx.browser.document
   
   fun main() {
       document.bgColor = "red"
   }
   ```

### 開発サーバーの実行 {id="run-the-development-server"}

デフォルトで、Kotlin Multiplatform Gradleプラグインには組み込みの`webpack-dev-server`のサポートが付属しているため、サーバーを手動で設定することなくIDEからアプリケーションを実行できます。

プログラムがブラウザで正常に動作することをテストするには、IntelliJ IDEA内のGradleツールウィンドウから`run`または`browserDevelopmentRun`タスク（`other`または`kotlin browser`ディレクトリ内にあります）を呼び出して開発サーバーを起動します：

![Gradleタスク一覧](browser-development-run.png){width=700}

ターミナルからプログラムを実行する場合は、代わりに`./gradlew run`を使用します。

プロジェクトがコンパイルおよびバンドルされると、ブラウザウィンドウに空白の赤いページが表示されます：

![空白の赤いページ](red-page.png){width=700}

### ホットリロード／継続モードの有効化 {id="enable-hot-reload-continuous-mode"}

変更を加えるたびに手動でプロジェクトをコンパイルして実行しなくても済むように、_[継続的コンパイル（continuous compilation）](dev-server-continuous-compilation.md)_モードを設定します。作業を進める前に、実行中の開発サーバーインスタンスをすべて停止してください。

1. 初回にGradleの`run`タスクを実行した後にIntelliJ IDEAが自動生成した実行構成（Run configuration）を編集します：

   ![実行構成の編集](edit-configurations-continuous.png){width=700}

2. **Run/Debug Configurations**ダイアログで、実行構成の引数（arguments）に`--continuous`オプションを追加します：

   ![継続モードの有効化](continuous-mode.png){width=700}

   変更を適用した後、IntelliJ IDEA内の**Run**ボタンを使用して開発サーバーを再起動できます。ターミナルから継続的なGradleビルドを実行する場合は、代わりに`./gradlew run --continuous`を使用します。

3. この機能をテストするために、Gradleタスクが実行されている状態で`Main.kt`ファイル内のページの色を青に変更します：

   ```kotlin
   document.bgColor = "blue"
   ```

   プロジェクトが再コンパイルされ、リロード後にブラウザページが新しい色になります。

開発プロセス中は、開発サーバーを継続モードで実行したままにしておくことができます。変更を加えると、自動的にページがリビルドおよびリロードされます。

> この時点のプロジェクトの状態は、`master`ブランチの[こちら](https://github.com/kotlin-hands-on/web-app-react-kotlin-js-gradle/tree/master)で確認できます。
>
{style="note"}

## Webアプリの下書きを作成する {id="create-a-web-app-draft"}

### Reactで最初の静的ページを追加する {id="add-the-first-static-page-with-react"}

アプリにシンプルなメッセージを表示させるには、`Main.kt`ファイルのコードを以下のように置き換えます：

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

* `render()`関数は、[kotlin-react-dom](https://github.com/JetBrains/kotlin-wrappers/tree/master/kotlin-react-dom)に対して、[フラグメント（fragment）](https://reactjs.org/docs/fragments.html)内の最初のHTML要素を`root`要素にレンダリングするよう指示します。この要素は、テンプレートに含まれている`src/jsMain/resources/index.html`で定義されたコンテナです。
* コンテンツは`<h1>`ヘッダーであり、HTMLをレンダリングするために型安全なDSLを使用しています。
* `h1`はラムダパラメータを受け取る関数です。文字列リテラルの前に`+`記号を追加すると、実際には[演算子オーバーロード](operator-overloading.md)を使用して`unaryPlus()`関数が呼び出されます。これにより、囲んでいるHTML要素に文字列が追加されます。

プロジェクトが再コンパイルされると、ブラウザに次のHTMLページが表示されます：

![HTMLページの例](hello-react-js.png){width=700}

### HTMLをKotlinの型安全なHTML DSLに変換する {id="convert-html-to-kotlin-s-typesafe-html-dsl"}

React用のKotlin [ラッパー（wrappers）](https://github.com/JetBrains/kotlin-wrappers/blob/master/kotlin-react/README.md)には、純粋なKotlinコードでHTMLを記述できるようにする[ドメイン特化言語（DSL）](type-safe-builders.md)が付属しています。この点において、JavaScriptの[JSX](https://reactjs.org/docs/introducing-jsx.html)に似ています。ただし、マークアップがKotlinであるため、自動補完や型チェックなど、静的型付け言語のすべての利点が得られます。

将来のWebアプリ用のクラシックなHTMLコードと、それに対応するKotlinの型安全なバリアントを比較してみてください：

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

Kotlinコードをコピーし、`main()`関数内の`Fragment.create()`関数呼び出しを更新して、先ほどの`h1`タグを置き換えます。

ブラウザがリロードされるのを待ちます。ページは以下のようになるはずです：

![Webアプリのドラフト](website-draft.png){width=700}

### マークアップ内でKotlin構文を使用して動画を追加する {id="add-videos-using-kotlin-constructs-in-markup"}

このDSLを使用してKotlinでHTMLを記述することには、いくつかの利点があります。ループ、条件分岐、コレクション、文字列補間などの通常のKotlin構文を使用してアプリを操作できます。

これで、ハードコードされた動画リストをKotlinオブジェクトのリストに置き換えることができます：

1. `Main.kt`に、すべての動画属性を1か所に保持するための`Video` [データクラス](data-classes.md)を作成します：

   ```kotlin
   data class Video(
       val id: Int,
       val title: String,
       val speaker: String,
       val videoUrl: String
   )
   ```

2. 未視聴の動画用と視聴済みの動画用の2つのリストをそれぞれ作成します。`Main.kt`のファイルレベルにこれらの宣言を追加します：

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

3. ページ上でこれらの動画を使用するために、Kotlinの`for`ループを記述して未視聴の`Video`オブジェクトのコレクションを反復処理します。「Videos to watch」の下にある3つの`p`タグを次のスニペットに置き換えます：

   ```kotlin
   for (video in unwatchedVideos) {
       p {
           +"${video.speaker}: ${video.title}"
       }
   }
   ```
   
4. 同様の手順で、「Videos watched」に続く単一のタグのコードも変更します：

   ```kotlin
   for (video in watchedVideos) {
       p {
           +"${video.speaker}: ${video.title}"
       }
   }
   ```

ブラウザがリロードされるのを待ちます。レイアウトは以前と同じままのはずです。リストに動画をさらに追加して、ループが機能していることを確認できます。

### 型安全なCSSでスタイルを追加する {id="add-styles-with-typesafe-css"}

[Emotion](https://emotion.sh/docs/introduction)ライブラリ用の[kotlin-emotion](https://github.com/JetBrains/kotlin-wrappers/blob/master/kotlin-emotion/)ラッパーを使用すると、HTMLとJavaScriptのすぐ隣でCSS属性（動的な属性も含む）を指定できます。概念的には、[CSS-in-JS](https://reactjs.org/docs/faq-styling.html#what-is-css-in-js)のKotlin版のようなものです。DSLを使用する利点は、Kotlinコードの構文を使用してフォーマットルールを表現できる点です。

このチュートリアルのテンプレートプロジェクトには、`kotlin-emotion`を使用するために必要な依存関係がすでに含まれています：

```kotlin
dependencies {
    // ...
    // Kotlin React Emotion (CSS) (chapter 3)
    implementation("org.jetbrains.kotlin-wrappers:kotlin-emotion")
    // ...
}
```

`kotlin-emotion`を使用すると、HTML要素の`div`や`h3`の中に`css`ブロックを指定し、そこでスタイルを定義できます。

動画プレーヤーをページの右上隅に移動するには、CSSを使用して動画プレーヤーのコード（スニペット内の最後の`div`）を調整します：

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

他のスタイルも自由に試してみてください。例えば、`fontFamily`を変更したり、UIに`color`を追加したりできます。

## アプリコンポーネントを設計する {id="design-app-components"}

Reactの基本的な構成要素は_[コンポーネント（components）](https://reactjs.org/docs/components-and-props.html)_と呼ばれます。コンポーネント自体を他のより小さなコンポーネントで構成することもできます。コンポーネントを組み合わせることで、アプリケーションを構築します。汎用的で再利用可能なようにコンポーネントを構造化すれば、コードやロジックを重複させることなく、アプリの複数の部分でそれらを再利用できます。

通常、`render()`関数の内容は基本的なコンポーネントを表します。現在のアプリケーションのレイアウトは次のようになっています：

![現在のレイアウト](current-layout.png){width=700}

アプリケーションを個別のコンポーネントに分解すると、各コンポーネントが自身の責任を処理する、より構造化されたレイアウトになります：

![コンポーネントによる構造化されたレイアウト](structured-layout.png){width=700}

コンポーネントは特定の機能をカプセル化します。コンポーネントを使用することでソースコードが短くなり、読みやすく理解しやすくなります。

### メインコンポーネントを追加する {id="add-the-main-component"}

アプリケーションの構造を作成し始めるために、まずは`root`要素にレンダリングするためのメインコンポーネントである`App`を明示的に指定します：

1. `src/jsMain/kotlin`フォルダに新しい`App.kt`ファイルを作成します。
2. このファイル内に次のスニペットを追加し、`Main.kt`から型安全なHTMLをその中に移動します：

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
       // 最初のh1タグから始まる型安全なHTMLをここに配置します！
   }
   ```
   
   `FC`関数は[関数コンポーネント（function component）](https://reactjs.org/docs/components-and-props.html#function-and-class-components)を作成します。

3. `Main.kt`ファイルで、`main()`関数を以下のように更新します：

   ```kotlin
   fun main() {
       val container = document.getElementById("root") ?: error("Couldn't find root container!")
       createRoot(container).render(App.create())
   }
   ```

   これで、プログラムは`App`コンポーネントのインスタンスを作成し、指定されたコンテナにレンダリングします。

Reactの概念の詳細については、[ドキュメントとガイド](https://reactjs.org/docs/hello-world.html#how-to-read-this-guide)を参照してください。

### リストコンポーネントを抽出する {id="extract-a-list-component"}

`watchedVideos`と`unwatchedVideos`のリストにはそれぞれ動画のリストが含まれているため、単一の再利用可能なコンポーネントを作成し、リストに表示されるコンテンツのみを調整するのが合理的です。

`VideoList`コンポーネントは`App`コンポーネントと同じパターンに従います。`FC`ビルダー関数を使用し、`unwatchedVideos`リストのコードを含めます。

1. `src/jsMain/kotlin`フォルダに新しい`VideoList.kt`ファイルを作成し、次のコードを追加します：

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

2. `App.kt`で、パラメータなしで呼び出すことで`VideoList`コンポーネントを使用します：

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

   現時点では、`App`コンポーネントは`VideoList`コンポーネントによって表示されるコンテンツを制御できません。ハードコードされているため、同じリストが2回表示されます。

### コンポーネント間でデータを渡すためのpropsを追加する {id="add-props-to-pass-data-between-components"}

`VideoList`コンポーネントを再利用するため、異なるコンテンツを渡せるようにする必要があります。コンポーネントへの属性としてアイテムのリストを渡す機能を追加できます。Reactでは、これらの属性は_props_と呼ばれます。Reactでコンポーネントのpropsが変更されると、フレームワークは自動的にそのコンポーネントを再レンダリングします。

`VideoList`には、表示する動画のリストを含むpropが必要です。`VideoList`コンポーネントに渡すことができるすべてのpropsを保持するインターフェースを定義します：

1. `VideoList.kt`ファイルに次の定義を追加します：

   ```kotlin
   external interface VideoListProps : Props {
       var videos: List<Video>
   }
   ```
   [external](js-interop.md#external-modifier)修飾子は、インターフェースの実装が外部から提供されることをコンパイラに伝えるため、宣言からJavaScriptコードを生成しようとしません。

2. `FC`ブロックにパラメータとして渡されるpropsを使用するように、`VideoList`のクラス定義を調整します：

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

   `key`属性は、`props.videos`の値が変更されたときに何をすべきかをReactレンダラーが判断するのに役立ちます。リストのどの部分を更新する必要があり、どの部分がそのまま残るかを決定するためにキーを使用します。リストとキーの詳細については、[Reactガイド](https://reactjs.org/docs/lists-and-keys.html)を参照してください。

3. `App`コンポーネントで、子コンポーネントが適切な属性でインスタンス化されていることを確認します。`App.kt`で、`h3`要素の下にある2つのループを、`unwatchedVideos`および`watchedVideos`の属性を付けた`VideoList`の呼び出しに置き換えます。
   Kotlin DSLでは、`VideoList`コンポーネントに属するブロック内でそれらを割り当てます：

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

リロード後、ブラウザでリストが正しくレンダリングされていることが確認できます。

### リストに対話性を持たせる {id="make-the-list-interactive"}

まず、ユーザーがリストのエントリをクリックしたときにポップアップするアラートメッセージを追加します。`VideoList.kt`で、現在の動画でアラートをトリガーする`onClick`ハンドラー関数を追加します：

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

ブラウザウィンドウでリストアイテムの1つをクリックすると、次のようなアラートウィンドウで動画に関する情報が表示されます：

![ブラウザのアラートウィンドウ](alert-window.png){width=700}

> `onClick`関数をラムダとして直接定義することは簡潔であり、プロトタイピングに非常に便利です。ただし、Kotlin/JSにおける同等性（equality）の[現在の仕組み](https://youtrack.jetbrains.com/issue/KT-15101)のため、パフォーマンスの観点からはクリックハンドラーを渡す最適な方法ではありません。レンダリングパフォーマンスを最適化したい場合は、関数を変数に格納して渡すことを検討してください。
>
{style="tip"}

### 値を保持するためのstateを追加する {id="add-state-to-keep-values"}

単にユーザーにアラートを出すだけでなく、選択された動画を▶の三角形でハイライトする機能を追加できます。それを行うには、このコンポーネント固有の_state（状態）_を導入します。

StateはReactのコアコンセプトの1つです。モダンReact（いわゆる_Hooks API_を使用するもの）では、stateは[`useState`フック](https://reactjs.org/docs/hooks-state.html)を使用して表現されます。

1. `VideoList`の宣言の先頭に次のコードを追加します：

   ```kotlin
   val VideoList = FC<VideoListProps> { props ->
       var selectedVideo: Video? by useState(null)

   // . . .
   ```
   {validate="false"}

   * `VideoList`関数コンポーネントはstate（現在の関数呼び出しから独立した値）を保持します。Stateはnull許容であり、`Video?`型を持ちます。デフォルト値は`null`です。
   * Reactの`useState()`関数は、関数の複数の呼び出しにわたってstateを追跡するようフレームワークに指示します。例えば、デフォルト値を指定した場合でも、Reactはそのデフォルト値が最初にのみ割り当てられるようにします。stateが変化すると、コンポーネントは新しいstateに基づいて再レンダリングされます。
   * `by`キーワードは、`useState()`が[委譲プロパティ（delegated property）](delegated-properties.md)として機能することを示します。他の変数と同様に、値の読み取りと書き込みが可能です。`useState()`の背後にある実装が、stateを機能させるために必要な仕組みを処理します。

   Stateフックの詳細については、[Reactドキュメント](https://reactjs.org/docs/hooks-state.html)を確認してください。

2. `VideoList`コンポーネント内の`onClick`ハンドラーとテキストを次のように変更します：

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

   * ユーザーが動画をクリックすると、その値が`selectedVideo`変数に割り当てられます。
   * 選択されたリストエントリがレンダリングされる際、先頭に三角形が付加されます。

状態管理の詳細については、[React FAQ](https://reactjs.org/docs/faq-state.html)を参照してください。

ブラウザを確認し、リスト内のアイテムをクリックして、すべてが正しく機能していることを確認します。

## コンポーネントを合成する {id="compose-components"}

現在のところ、2つの動画リストはそれぞれ独立して動作しており、各リストが選択された動画を追跡しています。プレーヤーは1つしかないにもかかわらず、未視聴リストで1つ、視聴済みリストで1つの計2つの動画を選択できてしまいます：

![両方のリストで同時に2つの動画が選択されている](two-videos-select.png){width=700}

リスト自身の中と兄弟（sibling）リストの中の両方でどの動画が選択されているかを、単一のリスト側で追跡することはできません。選択された動画は_リスト_のstateではなく、_アプリケーション_のstateの一部であるためです。つまり、個々のコンポーネントからstateを_リフトアップ（引き上げ）_する必要があります。

### Stateのリフトアップ {id="lift-state"}

Reactでは、propsは親コンポーネントからその子コンポーネントにのみ渡せるようになっています。これにより、コンポーネント同士が密結合することを防ぎます。

コンポーネントが兄弟コンポーネントのstateを変更したい場合は、親コンポーネントを経由して行う必要があります。その時点で、stateはいずれの子コンポーネントにも属さず、それらを統括する親コンポーネントに属するようになります。

コンポーネントからその親へとstateを移行するプロセスは、_stateのリフトアップ（lifting state / 状態の引き上げ）_と呼ばれます。このアプリのために、`App`コンポーネントにstateとして`currentVideo`を追加します：

1. `App.kt`で、`App`コンポーネントの定義の先頭に以下を追加します：

   ```kotlin
   val App = FC<Props> {
       var currentVideo: Video? by useState(null)
   
       // . . .
   }
   ```

   `VideoList`コンポーネントは、stateを追跡する必要がなくなりました。代わりに現在の動画をpropとして受け取ります。

2. `VideoList.kt`内の`useState()`呼び出しを削除します。
3. `VideoList`コンポーネントが選択された動画をpropとして受け取れるように準備します。そのために、`VideoListProps`インターフェースを拡張して`selectedVideo`を含めます：

   ```kotlin
   external interface VideoListProps : Props {
       var videos: List<Video>
       var selectedVideo: Video?
   }
   ```

4. 三角形の条件を変更し、`state`の代わりに`props`を使用するようにします：

   ```kotlin
   if (video == props.selectedVideo) {
       +"▶ "
   }
   ```

### ハンドラーを渡す {id="pass-handlers"}

現時点ではpropに値を代入する方法がないため、`onClick`関数は現在の設定のままでは機能しません。親コンポーネントのstateを変更するには、再度stateをリフトアップする必要があります。

Reactでは、stateは常に親から子へと流れます。そのため、子コンポーネントの1つから_アプリケーション_のstateを変更するには、ユーザー操作を処理するロジックを親コンポーネントに移動し、そのロジックをpropとして渡す必要があります。Kotlinでは、変数が[関数型](lambdas.md#function-types)を持つことができることを思い出してください。

1. `VideoListProps`インターフェースを再度拡張し、`Video`を受け取って`Unit`を返す関数である変数`onSelectVideo`を含めます：

   ```kotlin
   external interface VideoListProps : Props {
       // ...
       var onSelectVideo: (Video) -> Unit
   }
   ```

2. `VideoList`コンポーネントで、`onClick`ハンドラー内で新しいpropを使用します：

   ```kotlin
   onClick = {
       props.onSelectVideo(video)
   }
   ```
   
   これで、`VideoList`コンポーネントから`selectedVideo`変数を削除できます。

3. `App`コンポーネントに戻り、2つの動画リストのそれぞれに対して`selectedVideo`と`onSelectVideo`のハンドラーを渡します：

   ```kotlin
   VideoList {
       videos = unwatchedVideos // および watchedVideos
       selectedVideo = currentVideo
       onSelectVideo = { video ->
           currentVideo = video
       }
   }
   ```

4. 視聴済み動画リストに対しても前の手順を繰り返します。

ブラウザに戻り、動画を選択したときに、選択が重複することなく2つのリスト間を移動することを確認します。

## コンポーネントを追加する {id="add-more-components"}

### 動画プレーヤーコンポーネントを抽出する {id="extract-the-video-player-component"}

これで、現在はプレースホルダー画像となっている動画プレーヤーという、別の自己完結型コンポーネントを作成できます。動画プレーヤーは、トークのタイトル、トークの著者、および動画へのリンクを把握する必要があります。この情報は各`Video`オブジェクトにすでに含まれているため、propとして渡してその属性にアクセスできます。

1. 新しい`VideoPlayer.kt`ファイルを作成し、`VideoPlayer`コンポーネントの次の実装を追加します：

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

2. `VideoPlayerProps`インターフェースは`VideoPlayer`コンポーネントがnull非許容の`Video`を受け取ることを指定しているため、`App`コンポーネントでこれに応じた処理を行うようにします。

   `App.kt`で、動画プレーヤー用の以前の`div`スニペットを次のように置き換えます：

   ```kotlin
   currentVideo?.let { curr ->
       VideoPlayer {
           video = curr
       }
   }
   ```

   [`let`スコープ関数](scope-functions.md#let)により、`state.currentVideo`がnullでない場合にのみ`VideoPlayer`コンポーネントが追加されるようになります。

これで、リスト内のエントリをクリックすると動画プレーヤーが表示され、クリックされたエントリの情報が設定されます。

### ボタンを追加して接続する {id="add-a-button-and-wire-it"}

ユーザーが動画を視聴済みまたは未視聴としてマークし、2つのリスト間で移動できるようにするために、`VideoPlayer`コンポーネントにボタンを追加します。

このボタンは2つの異なるリスト間で動画を移動させるため、状態変更を処理するロジックを`VideoPlayer`から_リフトアップ_し、親からpropとして渡す必要があります。動画が視聴済みかどうかに基づいてボタンの見た目を変える必要があります。これもpropとして渡す必要がある情報です。

1. `VideoPlayer.kt`の`VideoPlayerProps`インターフェースを拡張して、これら2つのケース用のプロパティを含めます：

   ```kotlin
   external interface VideoPlayerProps : Props {
       var video: Video
       var onWatchedButtonPressed: (Video) -> Unit
       var unwatchedVideo: Boolean
   }
   ```

2. これで、実際のコンポーネントにボタンを追加できます。`VideoPlayer`コンポーネントの本文（body）の`h3`タグと`img`タグの間に、次のスニペットをコピーします：

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

   スタイルを動的に変更できるKotlin CSS DSLを利用して、基本的なKotlinの`if`式を使用することでボタンの色を変更できます。

### 動画リストをアプリケーションのstateに移動する {id="move-video-lists-to-the-application-state"}

次に、`App`コンポーネントにおける`VideoPlayer`の使用箇所を調整します。ボタンがクリックされたら、未視聴リストから視聴済みリストへ、またはその逆へと動画を移動させる必要があります。これらのリストが実際に変更可能になったため、それらをアプリケーションのstateに移動します：

1. `App.kt`で、`App`コンポーネントの先頭に`useState()`呼び出しを含む以下のプロパティを追加します：

   ```kotlin
   val App = FC<Props> {
       var currentVideo: Video? by useState(null)
       var unwatchedVideos: List<Video> by useState(listOf(
           Video(1, "Opening Keynote", "Andrey Breslav", "https://youtu.be/PsaFVLr8t4E"),
           Video(2, "Dissecting the stdlib", "Huyen Tue Dao", "https://youtu.be/Fzt_9I733Yg"),
           Video(3, "Kotlin and Spring Boot", "Nicolas Frankel", "https://youtu.be/pSiZVAeReeg")
       ))
       var watchedVideos: List<Video> by useState(listOf(
           Video(4, "Creating Internal DSLs in Kotlin", "Venkat Subramaniam", "https://youtu.be/JzTeAM8N1-o")
       ))

       // . . .
   }
   ```

2. すべてのデモデータが`watchedVideos`および`unwatchedVideos`のデフォルト値に直接含まれるようになったため、ファイルレベルの宣言は不要になりました。`Main.kt`から、`watchedVideos`および`unwatchedVideos`の宣言を削除します。
3. 動画プレーヤーに属する`App`コンポーネント内の`VideoPlayer`の呼び出し箇所を次のように変更します：

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

ブラウザに戻り、動画を選択してボタンを数回押してみてください。動画が2つのリスト間を行き来します。

## npmパッケージを使用する {id="use-packages-from-npm"}

アプリを実用的なものにするには、実際に動画を再生する動画プレーヤーと、コンテンツを共有するためのボタンがまだ必要です。

Reactには豊富なエコシステムがあり、この機能を自作する代わりに使用できる既製のコンポーネントが多数存在します。

### 動画プレーヤーコンポーネントを追加する {id="add-the-video-player-component"}

プレースホルダーの動画コンポーネントを実際のYouTubeプレーヤーに置き換えるには、npmの`react-player`パッケージを使用します。動画を再生でき、プレーヤーの外観を制御できます。

コンポーネントのドキュメントとAPIの説明については、GitHubの[README](https://www.npmjs.com/package/react-player)を参照してください。

1. `build.gradle.kts`ファイルを確認します。`react-player`パッケージはすでに含まれているはずです：

   ```kotlin
   dependencies {
       // ...
       // Video Player
       implementation(npm("react-player", "^2.12.0"))
       // ...
   }
   ```

   このように、ビルドファイルの`dependencies`ブロックで`npm()`関数を使用することにより、Kotlin/JSプロジェクトにnpm依存関係を追加できます。その後、Gradleプラグインがこれらの依存関係のダウンロードとインストールを自動的に処理します。その際、バンドルされている独自の[Yarn](https://yarnpkg.com/)パッケージマネージャーのインストール環境が使用されます。

2. Reactアプリケーション内からJavaScriptパッケージを使用するには、[外部宣言（external declarations）](js-interop.md)を提供して、コンパイラに何を期待すべきかを伝える必要があります。

   新しい`ReactYouTube.kt`ファイルを作成し、次のコンテンツを追加します：

   ```kotlin
   @file:JsModule("react-player")
   @file:JsNonModule
   
   import react.*
   
   @JsName("default")
   external val ReactPlayer: ComponentClass<dynamic>
   ```

   コンパイラは`ReactPlayer`のような外部宣言を見つけると、対応するクラスの実装が依存関係によって提供されていると見なし、そのためのコードを生成しません。

   最後の2行は、JavaScriptの`require("react-player").default;`のようなインポートと同等です。これらは、コンポーネントが実行時に`ComponentClass<dynamic>`に適合することを確信しているとコンパイラに伝えます。

ただし、この構成では、`ReactPlayer`が受け入れるpropsのジェネリック型が`dynamic`に設定されています。これは、コンパイラがあらゆるコードを受け入れることを意味し、実行時にエラーが発生するリスクがあります。

より良い代替手段は、この外部コンポーネントのpropsにどのようなプロパティが属するかを指定する`external interface`を作成することです。propsのインターフェースについては、コンポーネントの[README](https://www.npmjs.com/package/react-player)で確認できます。この場合、`url`と`controls`プロパティを使用します：

1. `ReactYouTube.kt`の内容を調整し、`dynamic`を外部インターフェースに置き換えます：

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

2. これで、新しい`ReactPlayer`を使用して`VideoPlayer`コンポーネント内の灰色のプレースホルダーの長方形を置き換えることができます。`VideoPlayer.kt`で、`img`タグを次のスニペットに置き換えます：

   ```kotlin
   ReactPlayer {
       url = props.video.videoUrl
       controls = true
   }
   ```

### ソーシャル共有ボタンを追加する {id="add-social-share-buttons"}

アプリケーションのコンテンツを簡単に共有する方法は、メッセンジャーやメール用のソーシャル共有ボタンを配置することです。これにも既製のReactコンポーネント（例えば[react-share](https://github.com/nygardk/react-share/blob/master/README.md)など）を使用できます：

1. `build.gradle.kts`ファイルを確認します。このnpmライブラリはすでに含まれているはずです：

   ```kotlin
   dependencies {
       // ...
       // Share Buttons
       implementation(npm("react-share", "^4.4.1"))
       // ...
   }
   ```

2. Kotlinから`react-share`を使用するには、さらに基本的な外部宣言を記述する必要があります。[GitHub上のサンプル](https://github.com/nygardk/react-share/blob/master/demo/Demo.tsx#L61)を見ると、共有ボタンは例えば`EmailShareButton`と`EmailIcon`という2つのReactコンポーネントで構成されていることがわかります。異なる種類の共有ボタンとアイコンも、すべて同じ種類のインターフェースを持っています。
   動画プレーヤーに対して既に行ったのと同様の方法で、各コンポーネントの外部宣言を作成します。

   新しい`ReactShare.kt`ファイルに次のコードを追加します：

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

3. アプリケーションのユーザーインターフェースに新しいコンポーネントを追加します。`VideoPlayer.kt`で、`ReactPlayer`の使用箇所のすぐ上にある`div`内に2つの共有ボタンを追加します：

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

これでブラウザを確認し、ボタンが実際に機能するかどうかを確認できます。ボタンをクリックすると、動画のURLを含む_共有ウィンドウ_が表示されるはずです。ボタンが表示されない、または機能しない場合は、広告ブロッカーやソーシャルメディアブロッカーを無効にする必要があるかもしれません。

![共有ウィンドウ](social-buttons.png){width=700}

[react-share](https://github.com/nygardk/react-share/blob/master/README.md#features)で利用可能な他のソーシャルネットワーク用の共有ボタンを使って、この手順を自由に試してみてください。

## 外部のREST APIを使用する {id="use-an-external-rest-api"}

これで、アプリ内のハードコードされたデモデータをREST APIからの実際のデータに置き換えることができます。

このチュートリアル用には、[小規模なAPI](https://my-json-server.typicode.com/kotlin-hands-on/kotlinconf-json/videos/1)が用意されています。このAPIは単一のエンドポイント`videos`のみを提供し、数値パラメータを受け取ってリストから要素にアクセスします。ブラウザでこのAPIにアクセスすると、APIから返されるオブジェクトが`Video`オブジェクトと同じ構造を持っていることがわかります。

### KotlinからJS機能を使用する {id="use-js-functionality-from-kotlin"}

ブラウザには、すでに多様な[Web API](https://developer.mozilla.org/en-US/docs/Web/API)が備わっています。Kotlin/JSにはこれらのAPI用のラッパーが標準で含まれているため、Kotlin/JSからも使用できます。一例として、HTTPリクエストを行うために使用される[fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)があります。

最初の潜在的な問題は、`fetch()`のようなブラウザAPIがノンブロッキング処理を実行するために[コールバック（callbacks）](https://developer.mozilla.org/en-US/docs/Glossary/Callback_function)を使用することです。複数のコールバックを連続して実行する必要がある場合、それらをネストする必要があります。当然ながらコードのインデントが深くなり、機能が互いに積み重なっていくため、可読性が低下します。

これを克服するために、このような機能に対するより優れたアプローチであるKotlinのコルーチンを使用できます。

2つ目の問題は、JavaScriptの動的型付けの性質から生じます。外部APIから返されるデータの型については何の保証もありません。これを解決するために、`kotlinx.serialization`ライブラリを使用できます。

`build.gradle.kts`ファイルを確認します。関連するスニペットはすでに存在するはずです：

```kotlin
dependencies {
    // . . .

    // Coroutines & serialization
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.6.4")
}
```

### シリアライズの追加 {id="add-serialization"}

外部APIを呼び出すと、JSON形式のテキストが返されますが、これを操作可能なKotlinオブジェクトに変換する必要があります。

[`kotlinx.serialization`](https://github.com/Kotlin/kotlinx.serialization)は、JSON文字列からKotlinオブジェクトへのこのような変換を記述できるようにするライブラリです。

1. `build.gradle.kts`ファイルを確認します。対応するスニペットはすでに存在するはずです：

   ```kotlin
   plugins {
       // . . .
       kotlin("plugin.serialization") version "%kotlinVersion%"
   }
   
   dependencies {
       // . . .

       // Serialization
       implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.5.0")
   }
   ```

2. 最初の動画を取得するための準備として、シリアライズライブラリに`Video`クラスについて認識させる必要があります。`Main.kt`で、その定義に`@Serializable`アノテーションを追加します：

   ```kotlin
   @Serializable
   data class Video(
       val id: Int,
       val title: String,
       val speaker: String,
       val videoUrl: String
   )
   ```

### 動画の取得 {id="fetch-videos"}

APIから動画を取得するには、`App.kt`（または新しいファイル）に次の関数を追加します：

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

* _中断関数（Suspending function）_である`fetch()`は、APIから特定の`id`を持つ動画を取得します。このレスポンスには時間がかかる可能性があるため、結果を`await()`します。次に、コールバックを使用する`text()`がレスポンスから本文を読み取ります。その後、その完了を`await()`します。
* 関数の値を返す前に、それを`kotlinx.coroutines`の関数である`Json.decodeFromString`に渡します。これにより、リクエストから受け取ったJSONテキストが適切なフィールドを持つKotlinオブジェクトに変換されます。
* `window.fetch`関数の呼び出しは`Promise`オブジェクトを返します。通常であれば、`Promise`が解決（resolve）されて結果が利用可能になった時点で呼び出されるコールバックハンドラーを定義する必要があります。しかし、コルーチンを使用すれば、それらのPromiseを`await()`できます。`await()`のような関数が呼び出されると、メソッドはその実行を一時停止（中断）します。`Promise`が解決されると、実行が再開されます。

ユーザーに動画の選択肢を提供するために、上記と同じAPIから25本の動画を取得する`fetchVideos()`関数を定義します。すべてのリクエストを並行して実行するために、Kotlinのコルーチンによって提供される[`async`](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/async.html)機能を使用します：

1. `App.kt`に次の実装を追加します：

   ```kotlin
   suspend fun fetchVideos(): List<Video> = coroutineScope {
       (1..25).map { id ->
           async {
               fetchVideo(id)
           }
       }.awaitAll()
   }
   ```

   [構造化並行性（structured concurrency）](https://kotlinlang.org/docs/coroutines-basics.html#structured-concurrency)の原則に従い、実装は`coroutineScope`内にラップされています。これにより、25個の非同期タスク（リクエストごとに1つ）を開始し、それらすべてが完了するのを待機できます。

2. これで、アプリケーションにデータを追加できるようになりました。`mainScope`の定義を追加し、次のスニペットで始まるように`App`コンポーネントを変更します。デモ値を`emptyList()`インスタンスに置き換えることも忘れないでください：

   ```kotlin
   val mainScope = MainScope()
   
   val App = FC<Props> {
       var currentVideo: Video? by useState(null)
       var unwatchedVideos: List<Video> by useState(emptyList())
       var watchedVideos: List<Video> by useState(emptyList())
   
       useEffectOnce {
           mainScope.launch {
               unwatchedVideos = fetchVideos()
           }
       }

   // . . .
   ```
   {validate="false"}

   * [`MainScope()`](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-main-scope.html)はKotlinの構造化並行性モデルの一部であり、非同期タスクを実行するためのスコープを作成します。
   * `useEffectOnce`は別のReact _フック（hook）_です（具体的には、[useEffect](https://reactjs.org/docs/hooks-effect.html)フックの簡略版です）。これは、コンポーネントが_副作用（side effect）_を実行することを示します。自身をレンダリングするだけでなく、ネットワーク経由の通信も行います。

ブラウザを確認します。アプリケーションに実際のデータが表示されているはずです：

![APIから取得したデータ](website-api-data.png){width=700}

ページを読み込むと：

* `App`コンポーネントのコードが呼び出されます。これにより、`useEffectOnce`ブロック内のコードが開始されます。
* `App`コンポーネントは、視聴済みおよび未視聴の動画用の空のリストでレンダリングされます。
* APIリクエストが完了すると、`useEffectOnce`ブロックがそれを`App`コンポーネントのstateに割り当てます。これにより、再レンダリングがトリガーされます。
* `App`コンポーネントのコードが再度呼び出されますが、`useEffectOnce`ブロックは2回目は実行_されません_。

コルーチンの仕組みについて深く理解したい場合は、こちらの[コルーチンに関するチュートリアル](coroutines-and-channels.md)を参照してください。

## 本番環境およびクラウドへのデプロイ {id="deploy-to-production-and-the-cloud"}

いよいよアプリケーションをクラウドに公開し、他のユーザーがアクセスできるようにします。

### 本番ビルドのパッケージ化 {id="package-a-production-build"}

本番モードですべてのアセットをパッケージ化するには、IntelliJ IDEAのツールウィンドウから、または`./gradlew build`を実行して、Gradleの`build`タスクを実行します。これにより、DCE（デッドコード削除）などのさまざまな改善が適用され、最適化されたプロジェクトビルドが生成されます。

ビルドが完了すると、デプロイに必要なすべてのファイルが`/build/dist`に見つかります。これらには、アプリケーションの実行に必要なJavaScriptファイル、HTMLファイル、およびその他のリソースが含まれています。これらを静的HTTPサーバーに配置したり、GitHub Pagesを使用して配信したり、好みのクラウドプロバイダーでホストしたりできます。

### Herokuへのデプロイ {id="deploy-to-heroku"}

Herokuを使用すると、独自のドメインでアクセス可能なアプリケーションを非常に簡単に立ち上げることができます。開発目的であれば、無料枠で十分です。

1. [アカウントを作成](https://signup.heroku.com/)します。
2. [CLIクライアントをインストールして認証](https://devcenter.heroku.com/articles/heroku-cli)します。
3. プロジェクトのルートディレクトリでターミナルから次のコマンドを実行して、Gitリポジトリを作成し、Herokuアプリを紐付けます：

   ```bash
   git init
   heroku create
   git add .
   git commit -m "initial commit"
   ```

4. Heroku上で動作する通常のJVMアプリケーション（例えばKtorやSpring Bootで書かれたものなど）とは異なり、このアプリは適切に配信される必要がある静的HTMLページとJavaScriptファイルを生成します。プログラムを適切に配信するために、必要なbuildpackを調整できます：

   ```bash
   heroku buildpacks:set heroku/gradle
   heroku buildpacks:add https://github.com/heroku/heroku-buildpack-static.git
   ```

5. `heroku/gradle` buildpackが正常に実行されるためには、`build.gradle.kts`ファイル内に`stage`タスクが存在する必要があります。このタスクは`build`タスクと同等であり、対応するエイリアスがすでにファイルの末尾に含まれています：

   ```kotlin
   // Heroku Deployment
   tasks.register("stage") {
       dependsOn("build")
   }
   ```

6. プロジェクトルートに新しい`static.json`ファイルを追加して、`buildpack-static`を設定します。
7. ファイル内に`root`プロパティを追加します：

   ```xml
   {
       "root": "build/distributions"
   }
   ```
   {validate="false"}

8. これで、例えば次のコマンドを実行してデプロイをトリガーできます：

   ```bash
   git add -A
   git commit -m "add stage task and static content root configuration"
   git push heroku master
   ```

> main以外のブランチからプッシュする場合は、`git push heroku feature-branch:main`のように、`main`リモートへプッシュするようにコマンドを調整してください。
>
{style="tip"}

デプロイが成功すると、インターネット上でアプリケーションにアクセスするためのURLが表示されます。

![本番環境へのWebアプリのデプロイ](deployment-to-production.png){width=700}

> この時点のプロジェクトの状態は、`finished`ブランチの[こちら](https://github.com/kotlin-hands-on/web-app-react-kotlin-js-gradle/tree/finished)で確認できます。
>
{style="note"}

## 次のステップ {id="what-s-next"}

### さらなる機能の追加 {initial-collapse-state="collapsed" collapsible="true" id="add-more-features"}

完成したアプリを出発点として、React、Kotlin/JSなどの領域におけるより高度なトピックを探求できます。

* **検索**。検索フィールドを追加して、タイトルや著者などでトークのリストを絞り込めるようにします。[ReactでのHTMLフォーム要素の動作](https://reactjs.org/docs/forms.html)について学びましょう。
* **永続化**。現在のところ、ページがリロードされるたびにアプリケーションは視聴者のウォッチリストを見失ってしまいます。Kotlinで利用可能なWebフレームワーク（[Ktor](https://ktor.io/)など）の1つを使用して、独自のバックエンドを構築することを検討してみてください。あるいは、[クライアント側に情報を保存する](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)方法を調べてみてください。
* **複雑なAPI**。多数のデータセットやAPIが利用可能です。あらゆる種類のデータをアプリケーションに取り込むことができます。例えば、[猫の写真](https://thecatapi.com/)のビジュアライザーや、[ロイヤリティフリーのストックフォトAPI](https://unsplash.com/developers)を構築できます。

### スタイルの改善：レスポンシブとグリッド {initial-collapse-state="collapsed" collapsible="true" id="improve-the-style-responsiveness-and-grids"}

アプリケーションのデザインはまだ非常にシンプルで、モバイルデバイスや狭いウィンドウでは見栄えが良くありません。CSS DSLをさらに探求して、アプリのアクセシビリティを向上させてみてください。

### コミュニティに参加してサポートを受ける {initial-collapse-state="collapsed" collapsible="true" id="join-the-community-and-get-help"}

問題を報告したり支援を受けたりするための最良の方法は、[kotlin-wrappers課題トラッカー](https://github.com/JetBrains/kotlin-wrappers/issues)です。問題に関するチケットが見つからない場合は、お気軽に新しいチケットを作成してください。また、公式の[Kotlin Slack](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)に参加することもできます。`#javascript`や`#react`のチャンネルがあります。

### コルーチンについて詳しく学ぶ {initial-collapse-state="collapsed" collapsible="true" id="learn-more-about-coroutines"}

並行コードの作成方法について詳しく知りたい場合は、[コルーチンに関するチュートリアル](coroutines-and-channels.md)を参照してください。

### Reactについて詳しく学ぶ {initial-collapse-state="collapsed" collapsible="true" id="learn-more-about-react"}

基本的なReactの概念と、それらがKotlinにどのように変換されるかを理解したところで、[Reactのドキュメント](https://react.dev/learn)で説明されている他の概念をKotlinに置き換えて試してみることができます。