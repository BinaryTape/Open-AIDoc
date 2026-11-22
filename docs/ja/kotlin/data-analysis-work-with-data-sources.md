[//]: # (title: ファイルからデータを取得する)
<web-summary>CSV、JSON、SQL、Excel、Apache Arrowファイルなど、Kotlin DataFrameを使用してファイルからデータを読み込む方法を学びます。</web-summary>

[Kotlin DataFrameライブラリ](https://kotlin.github.io/dataframe/home.html)を使用すると、非構造化データと構造化データの両方を扱うことができます。
データの変換には、[`.add()`](https://kotlin.github.io/dataframe/adddf.html)、[`.split()`](https://kotlin.github.io/dataframe/split.html)、[`.convert()`](https://kotlin.github.io/dataframe/convert.html)、[`.parse()`](https://kotlin.github.io/dataframe/parse.html) などのメソッドを使用できます。
さらに、このツールセットにより、CSV、JSON、XLS、Parquet、Apache Arrowなど、さまざまな構造化ファイル形式からのデータの取得や操作が可能になります。
サポートされているすべての形式については、[DataFrameのドキュメント](https://kotlin.github.io/dataframe/data-sources.html)を参照してください。

このガイドでは、複数の例を通じてデータの取得、加工、処理を行う方法を学びます。

## 開始する前に {id="before-you-start"}

> IntelliJ IDEA 2026.2以降、Kotlin NotebookはIDEにバンドルされなくなり、JetBrainsによる公式サポートも終了します。
> ソースコードは引き続き[GitHub](https://github.com/Kotlin/kotlin-notebook)で入手可能です。
>
> 詳細は[ブログ投稿](https://blog.jetbrains.com/idea/2026/06/kotlin-notebook-sunset/)をご覧ください。
>
{style="note"}

このチュートリアルに沿って進めるには：

1. **File** | **New** | **Kotlin Notebook** を選択します。
2. Kotlin DataFrameをインポートします：

   ```kotlin
   %use dataframe
   ```

   ノートブック内でDataFrameライブラリとそのAPIを確実に利用できるようにするため、他のコードセルよりも先に `%use dataframe` の行を含むコードセルを実行してください。

このチュートリアルは、DataFrameを [Gradle](https://kotlin.github.io/dataframe/setupgradle.html) または [Maven](https://kotlin.github.io/dataframe/setupmaven.html) の依存関係として使用して進めることもできます。

## データの取得 {id="retrieve-data"}

ファイルからデータを取得するには、`DataFrame.read()` 関数を使用します：

```kotlin
val movies = DataFrame.read("movies.csv")
```

`DataFrame.read()` 関数は、ファイルの拡張子と内容に基づいて入力形式を自動検出します。

また、追加の引数を渡して、DataFrameライブラリによる入力データの読み込み方法を制御することもできます。
例えば、次のコードはCSVファイルに対してカスタム区切り文字（`;`）を指定しています：

```kotlin
val movies = DataFrame.read("movies.csv", delimiter = ';')
```

> その他の対応ファイル形式やさまざまな読み込み関数の包括的な概要については、[Kotlin DataFrameライブラリのドキュメント](https://kotlin.github.io/dataframe/read.html)を参照してください。
> 
{style="tip"}

## データの表示 {id="display-data"}

データを取得したら、それを表示できます。最も簡単な方法は、データを変数に格納してからそれを返すことです：

```kotlin
val jsonDf = DataFrame.read("jsonFile.json")
jsonDf
```

このコードを実行すると、ファイルからのデータがインタラクティブなテーブルとして表示されます：

![Display data](display-data.png){width=700}

このビューを使用して、値の確認、列名のチェック、データセットの状態の把握を簡単に行うことができます。

## データ構造の確認 {id="inspect-data-structure"}

データの構造やスキーマについての詳細を把握するには、DataFrame変数に対して [`.schema()`](https://kotlin.github.io/dataframe/schema.html) 関数を使用します。

例えば、`jsonDf.schema()` を実行して、JSONデータセット内の各列の型を一覧表示します：

![Schema example](schema-data-analysis.png){width=700}

オートコンプリート機能を使用することもできます。これにより、DataFrameのプロパティに素早くアクセスして操作することができます。データを読み込んだ後、DataFrame変数の後ろにピリオド（`.`）を入力するだけで、利用可能な列とその型の一覧が表示されます。

![Available properties](auto-completion-data-analysis.png){width=700}

## データの加工 {id="refine-data"}

Kotlin DataFrameは、データセットを加工するためのさまざまな操作を提供しています。
例えば、[グループ化](https://kotlin.github.io/dataframe/group.html)、[フィルタリング](https://kotlin.github.io/dataframe/filter.html)、[更新](https://kotlin.github.io/dataframe/update.html)、[新しい列の追加](https://kotlin.github.io/dataframe/add.html)などです。これらの機能はデータ分析に不可欠であり、データを効率的に整理、クレンジング、変換できます。

例として、`movies.csv` データセットを見てみましょう。このデータセットでは、同じセル内に映画のタイトルと公開年が格納されています。ここでの目的は、分析しやすくするためにこのデータセットを加工することです：

1. **データの読み込み**

   `.read()` 関数を使用してファイルを `DataFrame` に読み込みます：

   ```kotlin
   val movies = DataFrame.read("movies.csv")
   ```

2. **列の追加** 

   `title` 列から公開年を抽出するために、新しい `year` 列を追加します：

   ```kotlin
   val moviesWithYear = movies
       .add("year") { 
           "\\d{4}".toRegex()
               .findAll(title)
               .lastOrNull()
               ?.value
               ?.toInt()
               ?: -1
       }
   
   moviesWithYear
   ```

3. **値の更新**

   映画のタイトルから公開年を削除するために、`title` 列を更新します：

   ```kotlin
   val moviesTitle = moviesWithYear
       .update("title") {
           "\\s*\\(\\d{4}\\)\\s*$".toRegex().replace(title, "") 
   }
   
   moviesTitle
   ```

   このコードにより、映画のタイトルが1つの列に保持され、公開年が別の列に移動されます。

4. **行のフィルタリング**

   特定のデータに絞り込むには、`.filter()` 関数を使用します。例えば、1986年より後に公開された映画のみを残すには、次を実行します：

   ```kotlin
   val newMovies = moviesTitle.filter { 
       year >= 1996 
   }
   
   newMovies
   ```

5. **列の削除**

   不要な列を削除するには、`.remove()` 関数を使用します：

   ```kotlin
   val refinedMovies = newMovies.remove { 
       movieID 
   }
   
   refinedMovies
   ```

比較のために、加工前のデータセットを以下に示します：

![Original dataset](original-dataset.png){width=700}

加工後のデータセット：

![Data refinement result](refined-data.png){width=700}

> その他のユースケースや詳細な例については、[Kotlin Dataframeのサンプルコード](https://github.com/Kotlin/dataframe/tree/master/examples)を参照してください。
> 
{style="tip"}

## データのエクスポート {id="export-data"}

データを加工した後は、簡単にエクスポートできます。

この目的のために、さまざまな [`.write()`](https://kotlin.github.io/dataframe/write.html) 関数を利用できます。CSV、JSON、XLS、XLSX、Apache Arrow、さらにはHTMLテーブルなど、複数の形式での保存がサポートされています。
サポートされているすべての形式については、[DataFrameのドキュメント](https://kotlin.github.io/dataframe/data-sources.html)を参照してください。
これは、分析結果の共有、レポートの作成、さらなる分析のためのデータ提供に特に役立ちます。

例えば、結果を次のように保存してみましょう：

* [`.writeJson()`](https://kotlin.github.io/dataframe/write.html#writing-to-json) 関数を使用したJSONファイル形式：

  ```kotlin
  refinedMovies.writeJson("movies.json")
  ```
* [`.writeCsv()`](https://kotlin.github.io/dataframe/write.html#writing-to-csv) 関数を使用したCSVファイル形式： 

  ```kotlin
  refinedMovies.writeCsv("movies.csv")
  ```

* `.writeArrorIPC()` および `.writeArrorFeather()` 関数を使用した [Apache Arrowファイル形式](https://kotlin.github.io/dataframe/write.html#writing-to-apache-arrow-formats)：

  ```kotlin
  refinedMovies.writeArrowIPC("movies.arrow")
  refinedMovies.writeArrowFeather("movies.feather")
  ```

[`.toStandaloneHTML()`](https://kotlin.github.io/dataframe/tohtml.html) 関数を使用して、ブラウザでスタンドアロンのHTMLテーブルを開くこともできます：

```kotlin
refinedMoviesDf
    .toStandaloneHTML(DisplayConfiguration(rowsLimit = null))
    .openInBrowser()
```

## 次のステップ {id="what-s-next"}

* [Kandyライブラリ](https://kotlin.github.io/kandy/examples.html)を使用したデータの可視化を試す
* [Kandyを使用したデータの可視化](data-analysis-visualization.md)でデータ可視化の詳細を確認する
* Kotlinでのデータサイエンスおよび分析に利用可能なツールやリソースの包括的な概要については、[データ分析のためのKotlinおよびJavaライブラリ](data-analysis-libraries.md)を参照してください