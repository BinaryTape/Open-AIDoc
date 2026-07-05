[//]: # (title: Kotlin Notebookの共有)

> IntelliJ IDEA 2026.2 以降、Kotlin Notebook は IDE に同梱されなくなり、JetBrains による公式サポートも終了します。
> ソースコードは引き続き [GitHub](https://github.com/Kotlin/kotlin-notebook) で公開されます。
>
> 詳細は[こちらのブログ投稿](https://blog.jetbrains.com/idea/2026/06/kotlin-notebook-sunset/)をご覧ください。
>
{style="note"}

[Kotlin Notebook](kotlin-notebook-overview.md)を共有するには、Kotlinノートブックが汎用的なJupyter形式に準拠しているため、任意のノートブックWebビューアにアップロードするだけで共有できます。

Kotlinノートブックを共有するために、以下のプラットフォームを推奨します：

* **JetBrains Datalore:** このプラットフォームは、Kotlinノートブックの共有を容易にするだけでなく、その利便性も向上させます。
  [Datalore](https://datalore.jetbrains.com/)では、ノートブックの実行や編集が可能で、インタラクティブなレポートの作成やノートブック実行のスケジューリングといった高度な機能が組み込まれています。
  実際の動作については、[DataFrameを使用したKotlin Dataloreの例](https://datalore.jetbrains.com/report/static/KQKedA4jDrKu63O53gEN0z/B5YeMMONSAR78FgKQ9yJyW)をご覧ください。
  ![Datalore Notebook example](datalore-example.png){width=700}
* **GitHub**: GitHubはKotlinノートブックをネイティブにレンダリングするため、簡単な共有とコラボレーションが可能です。
  例については、[Kotlin DataFrameのサンプルGitHubリポジトリ](https://github.com/Kotlin/dataframe/blob/master/examples/notebooks/titanic/Titanic.ipynb)を参照してください。
  ![GitHub Notebook example](github-notebook.png){width=700}

## 次のステップ

* [Kandyライブラリ](data-analysis-visualization.md)を使用したデータの可視化を探索する
* [データソースの操作](data-analysis-work-with-data-sources.md)で、ファイル、Webソース、またはデータベースからのデータ取得について学ぶ
* Kotlinにおけるデータサイエンスおよび分析に利用可能なツールやリソースの広範な概要については、[データ分析用のKotlinおよびJavaライブラリ](data-analysis-libraries.md)を参照する