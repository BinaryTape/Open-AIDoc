[//]: # (title: Kotlin/JS を始める)

このチュートリアルでは、Kotlin/JavaScript (Kotlin/JS) を使用してブラウザ向けの Web アプリケーションを作成する方法を説明します。
アプリケーションを作成するには、ご自身のワークフローに最適なツールを選択してください:

* **[IntelliJ IDEA](#create-your-application-in-intellij-idea)**: バージョン管理システムからプロジェクトテンプレートをクローンし、IntelliJ IDEA で作業します。
* **[Gradle ビルドシステム](#create-your-application-using-gradle)**: プロジェクトのビルドファイルを手動で作成し、内部でセットアップがどのように機能しているかをより深く理解します。

> ブラウザをターゲットにするだけでなく、Kotlin/JS を使って他の環境向けにコンパイルすることもできます。
> 詳細については、[実行環境](js-project-setup.md#execution-environments)を参照してください。
> 
{style="tip"}

## IntelliJ IDEA でアプリケーションを作成する {id="create-your-application-in-intellij-idea"}

Kotlin/JS Web アプリケーションを作成するには、[IntelliJ IDEA](https://www.jetbrains.com/idea/download/) を使用できます。

### 環境のセットアップ {id="set-up-the-environment"}

1. 最新バージョンの [IntelliJ IDEA](https://www.jetbrains.com/idea/) をダウンロードしてインストールします。
2. [Kotlin Multiplatform IDE プラグイン](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform) をインストールします（Kotlin Multiplatform Gradle プラグインと混同しないでください）。

### プロジェクトの作成 {id="create-your-project"}

1. IntelliJ IDEA で、**File** | **New** | **Project from Version Control** を選択します。
2. [Kotlin/JS テンプレートプロジェクト](https://github.com/Kotlin/kmp-js-wizard) の URL を入力します:

   ```text
   https://github.com/Kotlin/kmp-js-wizard
   ```   
   
3. **Clone** をクリックします。

### プロジェクトの設定 {id="configure-your-project"}

1. `kmp-js-wizard/gradle/libs.versions.toml` ファイルを開きます。これにはプロジェクトの依存関係のバージョンカタログが含まれています。
2. Kotlin のバージョンが、Kotlin/JS をターゲットとする Web アプリケーションの作成に必要な Kotlin Multiplatform Gradle プラグインのバージョンと一致していることを確認します:

   ```toml
   [versions]
   kotlin = "%kotlinVersion%"
   
   [plugins]
   kotlin-multiplatform = { id = "org.jetbrains.kotlin.multiplatform", version.ref = "kotlin" }
   ```

3. Gradle ファイルを同期します（`libs.versions.toml` ファイルを更新した場合）。ビルドファイルに表示される **Load Gradle Changes** アイコンをクリックします。

   ![Load the Gradle changes ボタン](load-gradle-changes.png){width=300}

   または、Gradle ツールウィンドウの更新ボタンをクリックします。

マルチプラットフォームプロジェクトの Gradle 設定の詳細については、[Multiplatform Gradle DSL リファレンス](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html) を参照してください。

### アプリケーションのビルドと実行 {id="build-and-run-the-application"}

1. `src/jsMain/kotlin/Main.kt` ファイルを開きます。

   * `src/jsMain/kotlin/` ディレクトリには、プロジェクトの JavaScript ターゲット向けのメインの Kotlin ソースファイルが含まれています。
   * `Main.kt` ファイルには、[`kotlinx.browser`](https://github.com/Kotlin/kotlinx-browser) API を使用してブラウザページ上に「Hello, Kotlin/JS!」を描画するコードが含まれています。

2. `main()` 関数にある **Run** アイコンをクリックして、コードを実行します。

   ![アプリケーションを実行](js-run-gutter.png){width=500}

ブラウザで Web アプリケーションが自動的に開きます。
あるいは、実行が完了した後にブラウザで次の URL を開くこともできます:

```text
   http://localhost:8080/
```

Web アプリケーションが表示されます:

![アプリケーションの出力](js-output-gutter-1.png){width=600}

アプリケーションを初めて実行すると、IntelliJ IDEA は上部バーに対応する実行構成（**jsMain [js]**）を作成します:

![Gradle 実行構成](js-run-config.png){width=500}

> Ultimate サブスクリプション付きの IntelliJ IDEA では、[JS Debugger](https://www.jetbrains.com/help/idea/configuring-javascript-debugger.html) を使用して IDE から直接コードをデバッグできます。
> 
> {style="tip"}

### 継続的ビルド（Continuous Build）を有効にする {id="enable-continuous-build"}

Gradle は、変更を加えるたびにプロジェクトを自動的にリビルドできます:

1. 実行構成のリストで **jsMain [js]** を選択し、**More Actions** | **Edit** をクリックします。

    ![Gradle 実行構成の編集](js-edit-run-config.png){width=500}

2. **Run/Debug Configurations** ダイアログの **Run** フィールドに、`jsBrowserDevelopmentRun --continuous` と入力します。

    ![継続的実行の構成](js-continuous-run-config.png){width=500}

3. **OK** をクリックします。

これで、アプリケーションを実行して何らかの変更を加えると、クラスファイルを保存（<shortcut>Ctrl + S</shortcut> / <shortcut>Cmd + S</shortcut>）または変更するたびに、Gradle がプロジェクトの増分ビルドを自動的に実行し、ブラウザをホットリロードします。

### アプリケーションを変更する {id="modify-the-application"}

単語内の文字数をカウントする機能を追加して、アプリケーションを変更してみましょう。

#### 入力要素の追加 {id="add-an-input-element"}

1. `src/jsMain/kotlin/Main.kt` ファイルで、[拡張関数](extensions.md#extension-functions) を使用してユーザー入力を読み取る [HTML input 要素](https://developer.mozilla.org/ja/docs/Web/HTML/Reference/Elements/input) を追加します:

   ```kotlin
   // Element.appendMessage() 関数を置き換えます
   fun Element.appendInput() {
       val input = document.createElement("input")
       appendChild(input)
   }
   ```

2. `main()` 内で `appendInput()` 関数を呼び出します。これによりページに入力要素が表示されます:

   ```kotlin
   fun main() {
       // document.body!!.appendMessage(message) を置き換えます
       document.body?.appendInput()
   }
   ```

3. [アプリケーションを再度実行](#build-and-run-the-application)します。

    アプリケーションは次のようになります:

   ![入力要素を追加したアプリケーション](js-added-input-element.png){width=600}

#### 入力イベント処理の追加 {id="add-an-input-event-handling"}

1. `appendInput()` 関数の内部にリスナーを追加して、入力値を読み取り、変更に反応するようにします:

    ```kotlin
   // 現在の appendInput() 関数を置き換えます
    fun Element.appendInput(onChange: (String) -> Unit = {}) {
        val input = document.createElement("input").apply {
            addEventListener("change") { event ->
                onChange(event.target.unsafeCast<HTMLInputElement>().value)
            }
        }
        appendChild(input)
    }
    ```

2. IDE のサジェストに従って、`HTMLInputElement` の依存関係をインポートします。

   ![依存関係のインポート](js-import-dependency.png){width=600}

3. `main()` で `onChange` コールバックを呼び出します。これにより、入力値が読み取られて処理されます:

    ```kotlin
    fun main() {
        // document.body?.appendInput() を置き換えます
        document.body?.appendInput(onChange = { println(it) })
    }
   ```

#### 出力要素の追加 {id="add-an-output-element"}

1. 段落を作成する[拡張関数](extensions.md#extension-functions)を定義して、出力を表示するためのテキスト要素を追加します:

   ```kotlin
    fun Element.appendTextContainer(): Element {
        return document.createElement("p").also(::appendChild)
    }
   ```
   
2. `main()` で `appendTextContainer()` 関数を呼び出します。これにより出力要素が作成されます:

   ```kotlin
    fun main() {
        // 出力用のテキストコンテナを作成します
        // val message = Message(topic = "Kotlin/JS", content = "Hello!") を置き換えます
        val output = document.body?.appendTextContainer()
   
        // 入力値を読み取ります
        document.body?.appendInput(onChange = { println(it) })
    }
   ```
   
#### 入力を処理して文字数をカウントする {id="process-the-input-to-count-the-letters"}

空白を削除し、文字数をカウントして出力を表示するように入力を処理します。

`main()` 関数内の `appendInput()` 関数に次のコードを追加します:

```kotlin
fun main() {
    // 出力用のテキストコンテナを作成します
    val output = document.body?.appendTextContainer()

    // 入力値を読み取ります
    // 現在の appendInput() 関数を置き換えます
    document.body?.appendInput(onChange = { name ->
        name.replace(" ", "").let {
            output?.textContent = "Your name contains ${it.length} letters"
        }
    })
}
```

上記のコードについて:

* [`replace()` 関数](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/replace.html) は名前から空白文字を削除します。
* [`let{}` スコープ関数](scope-functions.md#let) は、オブジェクトのコンテキスト内で関数を実行します。
* [文字列テンプレート](strings.md#string-templates) (`${it.length}`) は、先頭にドル記号 (`$`) を付け、中括弧 (`{}`) で囲むことで、単語の長さを文字列に挿入します。
  なお、`it` は [ラムダパラメーター](coding-conventions.md#lambda-parameters) のデフォルトの名前です。

#### アプリケーションの実行 {id="run-the-application"}

1. [アプリケーションを実行](#build-and-run-the-application)します。
2. ご自身の名前を入力します。
3. <shortcut>Enter</shortcut> を押します。

結果を確認できます:

![アプリケーションの出力](js-output-gutter-2.png){width=600}

#### 入力を処理して一意な（重複を除いた）文字数をカウントする {id="process-the-input-to-count-unique-letters"}

追加の演習として、入力を処理して単語内の一意な（ユニークな）文字数を計算し、表示してみましょう:

1. `src/jsMain/kotlin/Main.kt` ファイルで、`String` に対する `.countDistinctCharacters()` [拡張関数](extensions.md#extension-functions) を追加します:

   ```kotlin
   fun String.countDistinctCharacters() = lowercase().toList().distinct().count()
   ```

   上記のコードについて:

   * [`.lowercase()` 関数](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/lowercase.html) は名前を小文字に変換します。
   * [`toList()` 関数](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/to-list.html) は入力文字列を文字のリストに変換します。
   * [`distinct()` 関数](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/distinct.html) は単語から重複のない文字のみを選択します。
   * [`count()` 関数](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/count.html) は一意な文字の数をカウントします。

2. `main()` で `.countDistinctCharacters()` 関数を呼び出します。これにより、名前の一意な文字数がカウントされます:

   ```kotlin
    fun main() {
        // 出力用のテキストコンテナを作成します
        val output = document.body?.appendTextContainer()
   
        // 入力値を読み取ります
        document.body?.appendInput(onChange = { name ->
            name.replace(" ", "").let {
                // 一意な文字数を出力します
                // output?.textContent = "Your name contains ${it.length} letters" を置き換えます
                output?.textContent = "Your name contains ${it.countDistinctCharacters()} unique letters"
            }
        })
   }
   ```

3. 手順に従って [アプリケーションを実行し、名前を入力](#run-the-application) します。

結果を確認できます:

![アプリケーションの出力](js-output-gutter-3.png){width=600}

## Gradle を使用してアプリケーションを作成する {id="create-your-application-using-gradle"}

このセクションでは、[Gradle](https://gradle.org) を使用して Kotlin/JS アプリケーションを手動で作成する方法を学びます。

Gradle は、Kotlin/JS および Kotlin Multiplatform プロジェクトのデフォルトのビルドシステムです。
また、Java、Android、およびその他のエコシステムでも広く使用されています。

### プロジェクトファイルの作成 {id="create-project-files"}

1. Kotlin Gradle プラグイン (KGP) と互換性のある Gradle バージョンを使用していることを確認してください。
   詳細については、[互換性テーブル](gradle-configure-project.md#apply-the-plugin) を参照してください。
2. ファイルエクスプローラー、コマンドライン、またはお好みのツールを使用して、プロジェクト用の空のディレクトリを作成します。
3. プロジェクトディレクトリ内に、次の内容の `build.gradle.kts` ファイルを作成します:

   <tabs group="build-script">
   <tab title="Kotlin" group-key="kotlin">

   ```kotlin
   // build.gradle.kts
   plugins {
       kotlin("multiplatform") version "%kotlinVersion%"
   }

   repositories {
       mavenCentral()
   }

   kotlin {
       js {
           // ブラウザで実行する場合は browser()、Node.js で実行する場合は nodejs() を使用します
           browser() 
           binaries.executable()
       }
   }
   ```

   </tab>
   <tab title="Groovy" group-key="groovy">

   ```groovy
   // build.gradle
   plugins {
       id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
   }

   repositories {
       mavenCentral()
   }

   kotlin {
       js {
           // ブラウザで実行する場合は browser()、Node.js で実行する場合は nodejs() を使用します
           browser() 
           binaries.executable()
       }
   }
   ```

   </tab>
   </tabs>

   > `browser()` や `nodejs()` など、さまざまな [実行環境](js-project-setup.md#execution-environments) を使用できます。
   > 各環境はコードが実行される場所を定義し、Gradle がプロジェクト内でタスク名を生成する方法を決定します。
   >
   > {style="note"}

4. プロジェクトディレクトリ内に、空の `settings.gradle.kts` ファイルを作成します。
5. プロジェクトディレクトリ内に、`src/jsMain/kotlin` ディレクトリを作成します。
6. `src/jsMain/kotlin` ディレクトリ内に、次の内容の `hello.kt` ファイルを追加します:

   ```kotlin
   fun main() {
       println("Hello, Kotlin/JS!")
   }
   ```

   慣例として、すべてのソースコードは `src/<ターゲット名>[Main|Test]/kotlin` ディレクトリに配置されます:
   * `Main` はソースコードの配置場所です。
   * `Test` はテストの配置場所です。
   * `<ターゲット名>` はターゲットプラットフォームに対応します（この場合は `js`）。

**`browser` 環境の場合**

> `browser` 環境を使用している場合は、次の手順に従ってください。
> `nodejs` 環境を使用している場合は、[プロジェクトのビルドと実行](#build-and-run-the-project) セクションに進んでください。
> 
> {style="note"}

1. プロジェクトディレクトリ内に、`src/jsMain/resources` ディレクトリを作成します。
2. `src/jsMain/resources` ディレクトリ内に、次の内容の `index.html` ファイルを作成します:

   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <title>Application title</title>
   </head>
   <body>
       <script src="$NAME_OF_YOUR_PROJECT_DIRECTORY.js"></script>
   </body>
   </html>
   ```

3. `<$NAME_OF_YOUR_PROJECT_DIRECTORY>` プレースホルダーを、ご自身のプロジェクトディレクトリの名前に置き換えます。

### プロジェクトのビルドと実行 {id="build-and-run-the-project"}

プロジェクトをビルドするには、ルートプロジェクトディレクトリから次のコマンドを実行します:

```bash
# ブラウザの場合
gradle jsBrowserDevelopmentRun

# または

# Node.js の場合
gradle jsNodeDevelopmentRun 
```

`browser` 環境を使用している場合、ブラウザが `index.html` ファイルを開き、ブラウザコンソールに `"Hello, Kotlin/JS!"` と出力されるのを確認できます。
コンソールは、<shortcut>Ctrl + Shift + J</shortcut> / <shortcut>Cmd + Option + J</shortcut> コマンドを使用して開くことができます。

![アプリケーションの出力](js-output-gutter-4.png){width=600}

`nodejs` 環境を使用している場合は、ターミナルに `"Hello, Kotlin/JS!"` と出力されるのが確認できます。

![アプリケーションの出力](js-output-gutter-5.png){width=500}

### IDE でプロジェクトを開く {id="open-the-project-in-an-ide"}

Gradle をサポートする任意の IDE でプロジェクトを開くことができます。

IntelliJ IDEA を使用する場合:

1. **File** | **Open** を選択します。
2. プロジェクトディレクトリを見つけます。
3. **Open** をクリックします。

IntelliJ IDEA は、それが Kotlin/JS プロジェクトであるかどうかを自動的に検出します。
プロジェクトに問題が発生した場合、IntelliJ IDEA は **Build** ペインにエラーメッセージを表示します。

## 次のステップ {id="what-s-next"}

<!-- * Complete the [Create a multiplatform app targeting Web](native-app-with-c-and-libcurl.md) tutorial that explains how
  to share your Kotlin code with a JavaScript/TypeScript application.]: -->

* [Kotlin/JS プロジェクトのセットアップ](js-project-setup.md)
* [Kotlin/JS アプリケーションをデバッグする](js-debugging.md) 方法を学ぶ
* [Kotlin/JS でテストを作成して実行する](js-running-tests.md) 方法を学ぶ
* [実際の Kotlin/JS プロジェクト向けの Gradle ビルドスクリプトの書き方](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html) を学ぶ
* [Gradle ビルドシステム](gradle.md) についてさらに詳しく読む