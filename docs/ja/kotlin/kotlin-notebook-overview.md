[//]: # (title: Kotlin Notebook)
<web-summary>IntelliJ IDEA でインタラクティブな Kotlin ノートブックを作成・編集し、コードの実行、データの可視化、アイデアのプロトタイピング、結果の共有を行います。</web-summary>

> IntelliJ IDEA 2026.2 以降、Kotlin Notebook は IDE にバンドルされなくなり、JetBrains による公式サポートも終了します。
> ソースコードは引き続き [GitHub](https://github.com/Kotlin/kotlin-notebook) で利用可能です。
>
> 詳細は[ブログ投稿](https://blog.jetbrains.com/idea/2026/06/kotlin-notebook-sunset/)をご覧ください。
>
{style="note"}

Kotlin Notebook は、Kotlin の機能を最大限に活用しながらノートブックを作成および編集できるインタラクティブな環境を提供します。

ノートブックは、実行可能な Kotlin コードとテキスト、実行結果、可視化を組み合わせることができるインタラクティブなドキュメントです。
コードをセルに整理し、Markdown でドキュメント化して、テキストからプロットに至るまでの出力をそれを生成したコードのすぐ横に表示できる、Kotlin REPL の拡張版のようなものと考えてください。

IntelliJ IDEA エコシステム内で、Kotlin コードの開発と実験、即座の結果取得、コードやビジュアル、テキストの統合を行えるシームレスなコーディング体験をお楽しみください。

![Kotlin Notebook](data-analysis-notebook.gif){width=700}

Kotlin Notebook プラグインには、開発プロセスを促進する[さまざまな機能](https://www.jetbrains.com/help/idea/kotlin-notebook.html)が備わっています。

* セル内からの API アクセス
* 数クリックでのファイルのインポートおよびエクスポート
* プロジェクトを素早く探索するための REPL コマンドの利用
* 豊富な出力形式の取得
* アノテーションや Gradle 風の構文による直感的な依存関係管理
* 1 行のコードでさまざまなライブラリをインポートしたり、プロジェクトに新しいライブラリを追加したりする機能
* エラーメッセージやトレースバック（traceback）によるデバッグのための洞察の取得

Kotlin Notebook は [Jupyter Notebook 向け Kotlin カーネル](https://github.com/Kotlin/kotlin-jupyter?tab=readme-ov-file#kotlin-kernel-for-ipythonjupyter)をベースにしているため、他の Kotlin ノートブックソリューションと簡単に統合できます。
互換性の問題を心配することなく、Kotlin Notebook、[Datalore](https://datalore.jetbrains.com/)、[Kotlin-Jupyter Notebook](https://github.com/Kotlin/kotlin-jupyter) の間で成果物を容易に共有できます。

これらの機能により、単純なコード実験から包括的なデータプロジェクトまで、幅広いタスクに着手できます。

## データの分析と可視化 {id="data-analytics-and-visualization"}

予備的なデータ探索を行う場合でも、エンドツーエンドのデータ分析プロジェクトを完遂する場合でも、Kotlin Notebook には適切なツールが揃っています。

Kotlin Notebook では、データの取得、変換、プロット、モデリングを行える[ライブラリ](data-analysis-libraries.md)を直感的に統合し、操作の結果を即座に確認できます。

分析関連のタスクには、[Kotlin DataFrame](https://kotlin.github.io/dataframe/overview.html) ライブラリが堅牢なソリューションを提供します。このライブラリは、構造化データの読み込み、作成、フィルタリング、クリーニングを容易にします。

Kotlin DataFrame は SQL データベースとのシームレスな接続もサポートしており、CSV、JSON、TXT を含むさまざまなデータソースから IDE 内で直接データを読み込むことができます。
サポートされているすべての形式については、[DataFrame のドキュメント](https://kotlin.github.io/dataframe/data-sources.html)を参照してください。

オープンソースの Kotlin ライブラリである [Kandy](https://kotlin.github.io/kandy/welcome.html) を使用すると、さまざまな種類のグラフを作成できます。
Kandy のイディオマティック（Kotlin らしい）で可読性が高く、型安全な機能により、データを効果的に可視化して価値ある洞察を得ることができます。

![data-analytics-and-visualization](data-analysis-kandy-example.png){width=700}

## プロトタイピング {id="prototyping"}

Kotlin Notebook は、コードを小さな塊単位で実行し、その結果をリアルタイムで確認できるインタラクティブな環境を提供します。
この実践的なアプローチにより、プロトタイピングの段階で迅速な実験と反復が可能になります。

Kotlin Notebook を活用することで、アイデアの発想段階の早い時期にソリューションの概念をテストできます。さらに、Kotlin Notebook は共同作業と再現性のある作業の両方をサポートし、新しいアイデアの創出と評価を可能にします。

![kotlin-notebook-prototyping](kotlin-notebook-prototyping.png){width=700}

## バックエンド開発 {id="backend-development"}

Kotlin Notebook は、セル内から API を呼び出したり、OpenAPI などのプロトコルを扱ったりする機能を提供します。外部サービスや API と連携できる機能により、ノートブック環境内で直接情報を取得したり JSON ファイルを読み込んだりするなど、特定のバックエンド開発シナリオで役立ちます。

![kotlin-notebook-backend-development](kotlin-notebook-backend-development.png){width=700}

## コードのドキュメント化 {id="code-documentation"}

Kotlin Notebook では、コードセル内にインラインコメントやテキストのアノテーションを含めることで、コードスニペットに関連する追加のコンテキスト、説明、指示を提供できます。

また、Markdown セルにテキストを記述することもできます。これには見出し、リスト、リンク、画像などのリッチな書式設定オプションがサポートされています。
Markdown セルをレンダリングして書式設定されたテキストを表示するには、コードセルと同じように実行するだけです。

![kotlin-notebook-documenting](kotlin-notebook-documentation.png){width=700}

## コードと出力の共有 {id="sharing-code-and-outputs"}

Kotlin Notebook はユニバーサルな Jupyter 形式に準拠しているため、異なるノートブック間でコードや出力を共有することが可能です。
[Jupyter Notebook](https://jupyter.org/) や [Jupyter Lab](https://jupyterlab.readthedocs.io/en/latest/) などの任意の Jupyter クライアントで Kotlin Notebook を開いて編集し、実行できます。

また、`.ipynb` ノートブックファイルを任意のノートブック Web ビューアと共有して、成果物を配布することもできます。1 つの選択肢は、この形式をネイティブにレンダリングする [GitHub](https://github.com/) です。もう 1 つの選択肢は [JetBrains の Datalore](https://datalore.jetbrains.com/) プラットフォームで、ノートブックのスケジュール実行などの高度な機能により、ノートブックの共有、実行、編集を容易にします。

![kotlin-notebook-sharing-datalore](kotlin-notebook-sharing-datalore.png){width=700}

あるいは、現在のノートブックを [GitHub Gist](https://gist.github.com/) として素早く共有することもできます。
ツールバーの **Create Gist** ボタンをクリックしてください。

![notebook-github-gist](notebook-github-gist.png){width=400}

IntelliJ IDEA はノートブックを GitHub アカウントの Gist にエクスポートし、ノートブックの共有、表示、ダウンロードを行うための URL を提供します。

Gist はノートブックのすべてのコード、出力、Markdown を JSON 形式で保持し、GitHub はこれをプレビューとしてレンダリングできます。

## 次のステップ {id="what-s-next"}

* [Kotlin Notebook の使い方と主な機能について学ぶ](https://www.jetbrains.com/help/idea/kotlin-notebook.html)
* [Kotlin Notebook を試す](get-started-with-kotlin-notebooks.md)
* [データ分析向け Kotlin をさらに詳しく学ぶ](data-analysis-overview.md)