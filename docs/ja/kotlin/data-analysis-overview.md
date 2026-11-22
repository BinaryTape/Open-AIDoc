[//]: # (title: データ分析のためのKotlin)
<web-summary>Kotlin DataFrameとKandyを使用してデータの取得、変換、分析、可視化を行う、データ分析のためのKotlinの使い方を学びます。</web-summary>

データの探索や分析は、毎日行うことではないかもしれませんが、ソフトウェア開発者として必要な極めて重要なスキルです。 

データ分析が重要となるソフトウェア開発の業務について考えてみましょう。デバッグ時にコレクションの中身を実際に分析することや、メモリダンプやデータベースの調査、REST APIの連携時に大量のデータを含むJSONファイルを受け取ることなどが挙げられます。

[Kotlin DataFrame](#kotlin-dataframe) や [Kandy](#kandy) などのKotlinの探索的データ分析（Exploratory Data Analysis: EDA）ツールを使用すると、分析スキルを向上させ、さまざまなシナリオをサポートする豊富な機能を利用できます。

* **さまざまな形式のデータの読み込み、変換、可視化:** Kotlin EDAツールを使用すると、データのフィルタリング、並べ替え、集計などのタスクを実行できます。これらのツールは、CSV、JSON、SQLデータベース、Parquetファイルなど、さまざまなデータソースからIDE内で直接シームレスにデータを読み取ることができます。
サポートされているすべての形式については、[DataFrameのドキュメント](https://kotlin.github.io/dataframe/data-sources.html)を参照してください。

    プロットツールであるKandyを使用すると、幅広い種類のグラフを作成してデータセットを可視化し、洞察を得ることができます。

* **リレーショナルデータベースに保存されたデータを効率的に分析:** Kotlin DataFrameはデータベースとシームレスに統合され、SQLクエリに類似した機能を提供します。さまざまなデータベースから直接データを取得、操作、可視化できます。

* **Web APIからリアルタイムおよび動的なデータセットを取得して分析:** EDAツールの柔軟性により、OpenAPIなどのプロトコルを介して外部APIと統合できます。この機能により、Web APIからデータを取得し、必要に応じてデータをクリーニングおよび変換できます。

## Kotlin DataFrame {id="kotlin-dataframe"}

[Kotlin DataFrame](https://kotlin.github.io/dataframe/overview.html) ライブラリを使用すると、Kotlinプロジェクトで構造化データを操作できます。データの作成やクリーニングから、詳細な分析、特徴量エンジニアリング（feature engineering）まで、このライブラリが幅広くカバーします。

Kotlin DataFrameライブラリを使用すると、CSV、JSON、XLS、XLSXなどのさまざまなファイル形式を扱うことができます。また、このライブラリはSQLデータベースやAPIに接続する機能も備えており、データ取得プロセスを容易にします。
サポートされているすべての形式については、[DataFrameのドキュメント](https://kotlin.github.io/dataframe/data-sources.html)を参照してください。

![Kotlin DataFrame](data-analysis-dataframe-example.png){width=700}

## Kandy {id="kandy"}

[Kandy](https://kotlin.github.io/kandy/welcome.html) は、さまざまな種類のグラフをプロットするための強力で柔軟なDSLを提供するオープンソースのKotlinライブラリです。このライブラリは、データを可視化するためのシンプルでKotlinらしく（idiomatic）、可読性が高く型安全なツールです。また、KandyとKotlin DataFrameを簡単に組み合わせて、データに関連するさまざまなタスクを行うこともできます。

![Kandy](data-analysis-kandy-example.png){width=700}

## 次のステップ {id="what-s-next"}

* [Kotlin DataFrameライブラリを使用したデータの取得と変換](data-analysis-work-with-data-sources.md)
* [Kandyライブラリを使用したデータの可視化](data-analysis-visualization.md)
* [データ分析のためのKotlinおよびJavaライブラリについての詳細](data-analysis-libraries.md)