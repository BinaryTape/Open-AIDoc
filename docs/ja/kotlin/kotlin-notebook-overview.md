[//]: # (title: Kotlin Notebook)
[//]: # (description: IntelliJ IDEA内でインタラクティブなKotlinノートブックを作成・編集し、コードの実行、データの視覚化、アイデアのプロトタイピング、結果の共有を行うことができます。)

> IntelliJ IDEA 2026.2以降、Kotlin NotebookはIDEに同梱されなくなり、JetBrainsによる公式サポートも終了します。
> ソースコードは引き続き[GitHub](https://github.com/Kotlin/kotlin-notebook)で利用可能です。
>
> 詳細は[ブログ記事](https://blog.jetbrains.com/idea/2026/06/kotlin-notebook-sunset/)をご覧ください。
>
{style="note"}

Kotlin Notebookは、Kotlinの能力を最大限に活用し、ノートブックを作成・編集するためのインタラクティブな環境を提供します。

ノートブックとは、実行可能なKotlinコードとテキスト、実行結果、視覚化資料を混在させることができるインタラクティブなドキュメントです。
コードをセル（cell）に整理し、Markdownでドキュメント化し、テキストからプロット（plot）に至るまでの出力を、それらを生成したコードのすぐ横に即座に表示できる機能を備えた、Kotlin REPLの拡張版だと考えてください。

IntelliJ IDEAのエコシステム内で、Kotlinコードの開発と実験を行い、即座に出力を受け取り、コード、ビジュアル、テキストを統合できるシームレスなコーディング体験の準備をしましょう。

![Kotlin Notebook](data-analysis-notebook.gif){width=700}

Kotlin Notebookプラグインには、開発プロセスを促進するための[様々な機能](https://www.jetbrains.com/help/idea/kotlin-notebook.html)が備わっています。

* セル内でのAPIへのアクセス
* 数クリックでのファイルのインポートとエクスポート
* プロジェクトを素早く探索するためのREPLコマンドの使用
* 豊富な出力形式の取得
* アノテーションやGradle風の構文による直感的な依存関係管理
* 1行のコードでの様々なライブラリのインポート、またはプロジェクトへの新しいライブラリの追加
* エラーメッセージやトレースバック（traceback）によるデバッグのためのインサイト取得

Kotlin Notebookは、当社の[Jupyter Notebook向けKotlinカーネル（Kotlin Kernel for Jupyter Notebooks）](https://github.com/Kotlin/kotlin-jupyter?tab=readme-ov-file#kotlin-kernel-for-ipythonjupyter)をベースにしており、他の[Kotlinノートブックソリューション](data-analysis-overview.md#notebooks)との統合が容易です。
互換性の問題を心配することなく、Kotlin Notebook、[Datalore](https://datalore.jetbrains.com/)、[Kotlin-Jupyter Notebook](https://github.com/Kotlin/kotlin-jupyter)の間で作業を簡単に共有できます。

これらの機能により、単純なコードの実験から包括的なデータプロジェクトまで、幅広いタスクに取り組むことができます。

## データ分析と視覚化

予備的なデータ探索を行っている場合でも、エンドツーエンドのデータ分析プロジェクトを完了させる場合でも、Kotlin Notebookには最適なツールが揃っています。

Kotlin Notebook内では、データの取得、変換、プロット、モデリングを可能にする[ライブラリ](data-analysis-libraries.md)を直感的に統合でき、操作の結果を即座に確認できます。

分析関連のタスクには、[Kotlin DataFrame](https://kotlin.github.io/dataframe/overview.html)ライブラリが強力なソリューションを提供します。このライブラリは、構造化データの読み込み、作成、フィルタリング、クリーニングを容易にします。

また、Kotlin DataFrameはSQLデータベースとのシームレスな接続をサポートしており、CSV、JSON、TXTなどの様々なファイル形式からIDE内で直接データを読み取ることができます。
サポートされているすべての形式については、[DataFrameのドキュメント](https://kotlin.github.io/dataframe/data-sources.html)を参照してください。

オープンソースのKotlinライブラリである[Kandy](https://kotlin.github.io/kandy/welcome.html)を使用すると、様々な種類のチャートを作成できます。
KandyのKotlinらしい慣用的な（idiomatic）記述、読みやすさ、そして型安全（type-safe）という特徴により、データを効果的に視覚化し、価値のあるインサイトを得ることができます。

![data-analytics-and-visualization](data-analysis-kandy-example.png){width=700}

## プロトタイピング

Kotlin Notebookは、コードを小さな断片（チャンク）で実行し、その結果をリアルタイムで確認できるインタラクティブな環境を提供します。
この実践的なアプローチにより、プロトタイピング（試作）段階での迅速な実験と反復が可能になります。

Kotlin Notebookを活用することで、構想段階の早い時期にソリューションのコンセプトをテストできます。さらに、Kotlin Notebookは共同作業と再現性の両方をサポートしており、新しいアイデアの創出と評価を可能にします。

![kotlin-notebook-prototyping](kotlin-notebook-prototyping.png){width=700}

## バックエンド開発

Kotlin Notebookでは、セル内でAPIを呼び出したり、OpenAPIのようなプロトコルを扱ったりすることができます。
外部サービスやAPIとのやり取りが可能であるため、ノートブック環境内で直接情報を取得したりJSONファイルを読み取ったりするなど、特定のバックエンド開発シナリオにおいて有用です。

![kotlin-notebook-backend-development](kotlin-notebook-backend-development.png){width=700}

## コードのドキュメント化

Kotlin Notebookでは、コードセル内にインラインコメントやテキストアノテーションを含めることで、コードスニペットに関連する追加のコンテキスト、説明、指示を提供できます。

また、Markdownセルにテキストを記述することもできます。これには、ヘッダー、リスト、リンク、画像などの豊富な書式設定オプションがサポートされています。
Markdownセルをレンダリングしてフォーマットされたテキストを表示するには、コードセルと同様に実行するだけです。

![kotlin-notebook-documenting](kotlin-notebook-documentation.png){width=700}

## コードと出力の共有

Kotlin Notebookは汎用的なJupyter形式に準拠しているため、異なるノートブック間でコードや出力を共有することが可能です。
[Jupyter Notebook](https://jupyter.org/)や[Jupyter Lab](https://jupyterlab.readthedocs.io/en/latest/)などの任意のJupyterクライアントで、Kotlin Notebookを開き、編集し、実行できます。

また、`.ipynb`ノートブックファイルを任意のノートブックウェブビューアで共有することで、成果物を配布できます。1つの選択肢は、この形式をネイティブにレンダリングする[GitHub](https://github.com/)です。もう1つの選択肢は、JetBrainsの[Datalore](https://datalore.jetbrains.com/)プラットフォームです。これを使用すると、ノートブックの定期実行などの高度な機能を利用して、ノートブックの共有、実行、編集を容易に行えます。

![kotlin-notebook-sharing-datalore](kotlin-notebook-sharing-datalore.png){width=700}

あるいは、現在のノートブックを[GitHub Gist](https://gist.github.com/)として素早く共有することもできます。
ツールバーの **Create Gist** ボタンをクリックしてください。

![notebook-github-gist](notebook-github-gist.png){width=400}

IntelliJ IDEAは、お客様のGitHubアカウントのGistにノートブックをエクスポートし、ノートブックの共有、表示、ダウンロードのためのURLを提供します。

Gistは、ノートブックのすべてのコード、出力、MarkdownをJSON形式で保存し、GitHubはこれをプレビュー用にレンダリングできます。

## 次のステップ

* [Kotlin Notebookの使用方法と主要な機能について学ぶ。](https://www.jetbrains.com/help/idea/kotlin-notebook.html)
* [Kotlin Notebookを試してみる。](get-started-with-kotlin-notebooks.md)
* [データ分析のためのKotlinを深く掘り下げる。](data-analysis-overview.md)