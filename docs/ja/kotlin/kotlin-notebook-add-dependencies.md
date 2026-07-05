[//]: # (title: Kotlin Notebook に依存関係を追加する)

> IntelliJ IDEA 2026.2 以降、Kotlin Notebook は IDE にバンドルされなくなり、JetBrains による公式サポートも終了します。
> ソースコードは引き続き [GitHub](https://github.com/Kotlin/kotlin-notebook) で公開されます。
>
> 詳細は [ブログ記事](https://blog.jetbrains.com/idea/2026/06/kotlin-notebook-sunset/) をご確認ください。
>
{style="note"}

<tldr>
   <p>これは <strong>Kotlin Notebook を使ってみる</strong> チュートリアルの第 3 部です。先に進む前に、前のステップを完了していることを確認してください。</p>
   <p><img src="icon-1-done.svg" width="20" alt="第 1 ステップ"/> <a href="kotlin-notebook-set-up-env.md">環境をセットアップする</a><br/>
      <img src="icon-2-done.svg" width="20" alt="第 2 ステップ"/> <a href="kotlin-notebook-create.md">Kotlin Notebook を作成する</a><br/>
      <img src="icon-3.svg" width="20" alt="第 3 ステップ"/> <strong>Kotlin Notebook に依存関係を追加する</strong><br/>
  </p>
</tldr>

最初の [Kotlin Notebook](kotlin-notebook-overview.md) を作成できましたね！次に、高度な機能を利用するために必要な、ライブラリへの依存関係を追加する方法を学びましょう。

> Kotlin 標準ライブラリはそのまま使用できるため、インポートする必要はありません。
> 
{style="note"}

任意のコードセルで Gradle スタイルの構文を使用して座標を指定することで、Maven リポジトリから任意のライブラリをロードできます。
ただし、Kotlin Notebook には、[`%use` ステートメント](https://www.jetbrains.com/help/idea/kotlin-notebook.html#import-libraries) という形式で、一般的なライブラリをロードするための簡略化された方法が用意されています。

```kotlin
// libraryName を追加したいライブラリの依存関係に置き換えます
%use libraryName
// 必要に応じてバージョンを指定します
%use libraryName(version)
// v= を追加すると自動補完がトリガーされます
%use libraryName(v=version)
// 例: kotlinx.datetime:0.7.1
%use datetime(v=0.7.1)
```

Kotlin Notebook の自動補完機能を使用して、利用可能なライブラリに素早くアクセスすることもできます。

![Kotlin Notebook の自動補完機能](autocompletion-feature-notebook.png){width=700}

> Kotlin Notebook には、ディープラーニングから HTTP ネットワーキングまで、さまざまなタスクを実行するための一連の統合ライブラリが用意されています。
> [サポートされているライブラリのインポート](https://www.jetbrains.com/help/idea/kotlin-notebook.html#import-libraries) を参照してください。
> 
> Kotlin Notebook にまだ統合されていないライブラリを追加して使用することもできます。[新しいライブラリの統合](https://www.jetbrains.com/help/idea/kotlin-notebook.html#integrate-new-libraries) を参照してください。
>
{style="note"}

## Kotlin DataFrame および Kandy ライブラリを Kotlin Notebook に追加する

2 つの一般的な Kotlin ライブラリの依存関係を Kotlin Notebook に追加してみましょう。
* [Kotlin DataFrame ライブラリ](https://kotlin.github.io/dataframe/home.html) を使用すると、Kotlin プロジェクトでデータを自在に操作できます。
これを使用して、[API](data-analysis-work-with-api.md)、[SQL データベース](data-analysis-connect-to-db.md)、および CSV や JSON などの [さまざまなファイル形式](data-analysis-work-with-data-sources.md) からデータを取得できます。
* [Kandy ライブラリ](https://kotlin.github.io/kandy/welcome.html) は、[チャートを作成する](data-analysis-visualization.md) ための強力で柔軟な DSL を提供します。

これらのライブラリを追加するには:

1. **Add Code Cell** をクリックして、新しいコードセルを作成します。
2. コードセルに次のコードを入力します。

    ```kotlin
    // 利用可能な最新のライブラリバージョンが使用されるようにします
    %useLatestDescriptors
    
    // Kotlin DataFrame ライブラリをインポートします
    %use dataframe
    
    // Kotlin Kandy ライブラリをインポートします
    %use kandy
    ```

3. コードセルを実行します。

   `%use` ステートメントを実行すると、ライブラリの依存関係がダウンロードされ、ノートブックにデフォルトのインポートが追加されます。

   > ライブラリに依存する他のコードセルを実行する前に、`%use libraryName` の行が含まれるコードセルを実行するようにしてください。
   >
   {style="note"}

4. Kotlin DataFrame ライブラリを使用して CSV ファイルからデータをインポートするには、新しいコードセルで `.read()` 関数を使用します。

    ```kotlin
    // "netflix_titles.csv" ファイルからデータをインポートして DataFrame を作成します。
    val rawDf = DataFrame.read("netflix_titles.csv")
    
    // 生の DataFrame データを表示します
    rawDf
    ```

   > このサンプルの CSV は [Kotlin DataFrame の例の GitHub リポジトリ](https://github.com/Kotlin/dataframe/blob/master/examples/notebooks/netflix/netflix_titles.csv) からダウンロードできます。
   > プロジェクトディレクトリに追加してください。
   >
   {style="tip"}

   ![DataFrame を使用してデータを表示する](add-dataframe-dependency.png){width=700}

5. 新しいコードセルで `.plot` メソッドを使用して、DataFrame 内の TV 番組と映画の分布を視覚的に表現します。

    ```kotlin
    rawDf
        // "type" という名前の列の各ユニークな値の出現回数をカウントします
        .valueCounts(sort = false) { type }
        // 色を指定して棒グラフでデータを視覚化します
        .plot {
            bars {
                x(type)
                y("count")
                fillColor(type) {
                    scale = categorical(range = listOf(Color.hex("#00BCD4"), Color.hex("#009688")))
                }
            }
    
            // チャートのレイアウトを設定し、タイトルを設定します
            layout {
                title = "Count of TV Shows and Movies"
                size = 900 to 550
            }
        }
    ```

作成されたチャート:

![Kandy ライブラリを使用した視覚化](kandy-library.png){width=700}

Kotlin Notebook でのこれらのライブラリの追加と活用、おめでとうございます！
これは Kotlin Notebook とその [サポートされているライブラリ](data-analysis-libraries.md) で実現できることのほんの一部にすぎません。

## 次のステップ

* [Kotlin Notebook を共有する](kotlin-notebook-share.md) 方法を学ぶ
* [Kotlin Notebook への依存関係の追加](https://www.jetbrains.com/help/idea/kotlin-notebook.html#add-dependencies) に関する詳細を見る
* Kotlin DataFrame ライブラリを使用したより広範なガイドについては、[ファイルからのデータの取得](data-analysis-work-with-data-sources.md) を参照してください。
* Kotlin でのデータサイエンスとデータ分析に利用可能なツールとリソースの広範な概要については、[データ分析用の Kotlin および Java ライブラリ](data-analysis-libraries.md) を参照してください。