[//]: # (title: コードスニペットの実行)

Kotlinコードは通常、IDEやテキストエディタ、その他のツールで作業するプロジェクトにまとめられます。しかし、関数の動作を素早く確認したい場合や、式の値を知りたいだけの場合は、新しいプロジェクトを作成してビルドする必要はありません。さまざまな環境でKotlinコードを即座に実行できる、これら3つの便利な方法を確認してください：

* IDEでの [スクラッチファイル](#ide-scratches-and-worksheets)
* ブラウザでの [Kotlin Playground](#browser-kotlin-playground)
* コマンドラインでの [ki shell](#command-line-ki-shell)

## IDE: スクラッチ (scratches) {id="ide-scratches-and-worksheets"}

IntelliJ IDEAとAndroid Studioは、Kotlinの [スクラッチファイル](https://www.jetbrains.com/help/idea/kotlin-repl.html#efb8fb32) をサポートしています。

*スクラッチファイル*（または単に*スクラッチ*）を使用すると、プロジェクトと同じIDEウィンドウ内でコードの下書きを作成し、その場ですぐに実行できます。スクラッチはプロジェクトに紐付けられていません。OS上のどのIntelliJ IDEAウィンドウからでも、すべてのスクラッチにアクセスして実行できます。

Kotlinスクラッチを作成するには、**File** | **New** | **Scratch File** をクリックし、**Kotlin** タイプを選択します。

スクラッチでは、構文ハイライト、コード補完、その他のIntelliJ IDEAコード編集機能がサポートされています。`main()` 関数を宣言する必要はありません。記述したすべてのコードは、`main()` のボディ内にあるかのように実行されます。

スクラッチでコードを書き終えたら、**Run** をクリックします。実行結果は、コードの向かい側の行に表示されます。

![Run scratch](scratch-run.png){width=700}

### インタラクティブモード (Interactive mode)

IDEはスクラッチのコードを自動的に実行できます。タイピングを止めたらすぐに実行結果を確認するには、**Interactive mode** をオンにします。

![Scratch interactive mode](scratch-interactive.png){width=700}

### モジュールの使用

スクラッチでは、Kotlinプロジェクトのクラスや関数を使用できます。

プロジェクトのクラスや関数をスクラッチで使用するには、通常通り `import` 文を使ってスクラッチファイルにインポートします。次に、コードを記述し、**Use classpath of module** リストで適切なモジュールを選択して実行します。

スクラッチは、接続されたモジュールのコンパイル済みバージョンを使用します。そのため、モジュールのソースファイルを変更した場合、モジュールを再ビルドするとその変更がスクラッチに反映されます。
スクラッチを実行するたびにモジュールを自動的に再ビルドするには、**Make module before Run** を選択します。

![Scratch select module](scratch-select-module.png){width=700}

## ブラウザ: Kotlin Playground

[Kotlin Playground](https://play.kotlinlang.org/) は、ブラウザ上でKotlinコードを記述、実行、共有するためのオンラインアプリケーションです。

### コードの記述と編集

Playgroundのエディタ領域では、ソースファイルと同じようにコードを記述できます：
* 自身のクラス、関数、トップレベルの宣言を任意の順序で追加できます。
* 実行部分は `main()` 関数のボディ内に記述します。

一般的なKotlinプロジェクトと同様に、Playgroundの `main()` 関数は `args` パラメータを持つことも、パラメータを全く持たないことも可能です。実行時にプログラム引数を渡すには、**Program arguments** フィールドに記述します。

![Playground: code completion](playground-completion.png){width=700}

Playgroundはコードをハイライトし、入力に合わせてコード補完の候補を表示します。標準ライブラリおよび [`kotlinx.coroutines`](coroutines-overview.md) からの宣言を自動的にインポートします。

### 実行環境の選択

Playgroundでは、実行環境をカスタマイズする方法が用意されています：
* 利用可能な [将来のバージョンのプレビュー](eap.md) を含む、複数のKotlinバージョン。
* コードを実行するための複数のバックエンド：JVM、JS（レガシー、[IRコンパイラ](js-ir-compiler.md)、またはCanvas）、JUnit。

![Playground: environment setup](playground-env-setup.png){width=700}

JSバックエンドの場合、生成されたJSコードを確認することもできます。

![Playground: generated JS](playground-generated-js.png){width=700}

### オンラインでのコード共有

Playgroundを使用してコードを他の人と共有できます。**Copy link** をクリックして、コードを見せたい相手に送信してください。

Playgroundのコードスニペットを他のWebサイトに埋め込んだり、実行可能にしたりすることもできます。**Share code** をクリックして、任意のWebページや [Medium](https://medium.com/) の記事にサンプルを埋め込みます。

![Playground: share code](playground-share.png){width=700}

## コマンドライン: ki shell

[ki shell](https://github.com/Kotlin/kotlin-interactive-shell) (*Kotlin Interactive Shell*) は、ターミナルでKotlinコードを実行するためのコマンドラインユーティリティです。Linux、macOS、Windowsで利用可能です。

ki shellは、基本的なコード評価機能に加えて、以下のような高度な機能を提供します：
* コード補完
* 型チェック
* 外部依存関係
* コードスニペット用のペーストモード
* スクリプティングのサポート

詳細については、[ki shellのGitHubリポジトリ](https://github.com/Kotlin/kotlin-interactive-shell) を参照してください。

### ki shellのインストールと実行

ki shellをインストールするには、[GitHub](https://github.com/Kotlin/kotlin-interactive-shell) から最新バージョンをダウンロードし、任意のディレクトリに解凍します。

macOSでは、次のコマンドを実行してHomebrewでki shellをインストールすることもできます：

```shell
brew install ki
```

ki shellを起動するには、LinuxおよびmacOSでは `bin/ki.sh`（Homebrewでインストールした場合は単に `ki`）、Windowsでは `bin\ki.bat` を実行します。

シェルが起動したら、すぐにターミナルでKotlinコードの記述を開始できます。`:help`（または `:h`）と入力すると、ki shellで使用可能なコマンドが表示されます。

### コード補完とハイライト

ki shellは、**Tab** キーを押すとコード補完の候補を表示します。また、入力中に構文ハイライトも提供します。この機能は `:syntax off` と入力することで無効にできます。

![ki shell highlighting and completion](ki-shell-highlight-completion.png){width=700}

**Enter** キーを押すと、ki shellは入力された行を評価し、結果を出力します。式の値は、`res*` のような自動生成された名前を持つ変数として出力されます。これらの変数は、後で実行するコードで使用できます。入力された構文が不完全な場合（例：条件はあるがボディがない `if`）、シェルは3つのドットを表示し、残りの部分の入力を待ちます。

![ki shell results](ki-shell-results.png){width=700}

### 式の型の確認

複雑な式やよく知らないAPIの場合、ki shellは式の型を表示する `:type`（または `:t`）コマンドを提供します：

![ki shell type](ki-shell-type.png){width=700}

### コードの読み込み

必要なコードが別の場所に保存されている場合、それを読み込んでki shellで使用する方法が2つあります：
* `:load`（または `:l`）コマンドでソースファイルを読み込む。
* ペーストモードで `:paste`（または `:p`）コマンドを使用してコードスニペットをコピー＆ペーストする。

![ki shell load file](ki-shell-load.png){width=700}

`ls` コマンドは、使用可能なシンボル（変数と関数）を表示します。

### 外部依存関係の追加

標準ライブラリに加えて、ki shellは外部依存関係もサポートしています。これにより、プロジェクト全体を作成することなく、サードパーティのライブラリを試すことができます。

ki shellでサードパーティのライブラリを追加するには、`:dependsOn` コマンドを使用します。デフォルトでは、ki shellはMaven Centralを使用しますが、`:repository` コマンドを使用して他のリポジトリを接続することもできます：

![ki shell external dependency](ki-shell-dependency.png){width=700}