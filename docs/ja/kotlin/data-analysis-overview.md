[//]: # (title: データ分析のための Kotlin)
[//]: # (description: Kotlin DataFrame や Kandy を使用して、データを取得、変換、分析、視覚化するための Kotlin の使用方法について学びます。)

データの探索や分析は、毎日行うことではないかもしれませんが、ソフトウェア開発者として必要な極めて重要なスキルです。

データ分析が鍵となるソフトウェア開発の業務について考えてみましょう。デバッグ時にコレクションの中身を分析したり、メモリダンプやデータベースを徹底的に調査したり、REST API を使用する際に大量のデータを含む JSON ファイルを受け取ったりする場合などが挙げられます。

[Kotlin DataFrame](#kotlin-dataframe) や [Kandy](#kandy) などの Kotlin の探索的データ解析（EDA: Exploratory Data Analysis）ツールを使用することで、分析スキルを向上させ、さまざまなシナリオで役立つ豊富な機能を利用できます。

* **さまざまな形式のデータの読み込み、変換、視覚化:** Kotlin EDA ツールを使用すると、データのフィルタリング、ソート、集計などのタスクを実行できます。これらのツールは、CSV、JSON、SQL データベース、Parquet ファイルなど、さまざまなデータソースからのデータを IDE 内でシームレスに読み取ることができます。
サポートされているすべての形式については、[DataFrame のドキュメント](https://kotlin.github.io/dataframe/data-sources.html)を参照してください。

    プロットツールの Kandy を使用すると、幅広い種類のチャートを作成して、データセットを視覚化し、インサイトを得ることができます。

* **リレーショナルデータベースに保存されたデータの効率的な分析:** Kotlin DataFrame はデータベースとシームレスに統合され、SQL クエリと同様の機能を提供します。さまざまなデータベースから直接データを取得、操作、視覚化できます。

* **Web API からのリアルタイムおよび動的なデータセットの取得と分析:** EDA ツールの柔軟性により、OpenAPI などのプロトコルを介して外部 API と統合できます。この機能により、Web API からデータを取得し、必要に応じてデータをクリーニングおよび変換できます。

## Kotlin DataFrame

[Kotlin DataFrame](https://kotlin.github.io/dataframe/overview.html) ライブラリを使用すると、Kotlin プロジェクトで構造化データを操作できます。データの作成やクリーニングから、詳細な分析や特徴量エンジニアリングまで、このライブラリがカバーします。

Kotlin DataFrame ライブラリを使用すると、CSV、JSON、XLS、XLSX を含むさまざまなファイル形式を扱うことができます。また、このライブラリは SQL データベースや API と接続する機能も備えており、データ取得プロセスを容易にします。
サポートされているすべての形式については、[DataFrame のドキュメント](https://kotlin.github.io/dataframe/data-sources.html)を参照してください。

![Kotlin DataFrame](data-analysis-dataframe-example.png){width=700}

## Kandy

[Kandy](https://kotlin.github.io/kandy/welcome.html) は、さまざまな種類のチャートをプロットするための強力で柔軟な DSL を提供するオープンソースの Kotlin ライブラリです。このライブラリは、データを視覚化するためのシンプルで慣用的（イディオマティック）、読みやすく、かつ型安全（type-safe）なツールです。また、Kandy と Kotlin DataFrame ライブラリを簡単に組み合わせて、さまざまなデータ関連のタスクを完了させることもできます。

![Kandy](data-analysis-kandy-example.png){width=700}

## 次のステップ

* [Kotlin DataFrame ライブラリを使用したデータの取得と変換](data-analysis-work-with-data-sources.md)
* [Kandy ライブラリを使用したデータの視覚化](data-analysis-visualization.md)
* [データ分析のための Kotlin および Java ライブラリの詳細](data-analysis-libraries.md)