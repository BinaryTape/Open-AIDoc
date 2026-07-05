[//]: # (title: Kandy を使用したデータ視覚化)
[//]: # (description: Kandy と Kotlin DataFrame を使用して、折れ線グラフ、ポイントチャート、棒グラフを作成し、データを視覚化する方法を学びます。)

Kotlin は、強力で柔軟なデータ視覚化のためのオールインワン・ソリューションを提供しており、複雑なモデルに取り組む前にデータを直感的に提示し、探索するための方法を提供します。

このチュートリアルでは、[Kandy](https://kotlin.github.io/kandy/welcome.html) および [Kotlin DataFrame](https://kotlin.github.io/dataframe/home.html) ライブラリを使用して、IntelliJ IDEA でさまざまなチャートタイプを作成する方法を説明します。

## 始める前に

> IntelliJ IDEA 2026.2 以降、Kotlin Notebook は IDE にバンドルされなくなり、JetBrains による公式サポートも終了します。
> ソースコードは引き続き [GitHub](https://github.com/Kotlin/kotlin-notebook) で入手可能です。
>
> 詳細については、[ブログ記事](https://blog.jetbrains.com/idea/2026/06/kotlin-notebook-sunset/)を参照してください。
>
{style="note"}

このチュートリアルを進めるには：

1. **File** | **New** | **Kotlin Notebook** を選択します。
2. ノートブックで、[Kandy](https://kotlin.github.io/kandy/welcome.html) と [Kotlin DataFrame](https://kotlin.github.io/dataframe/home.html) をインポートします：

   ```kotlin
   %use kandy
   %use dataframe
   ```

   他のどのコードセルよりも前に `%use dataframe` 行を含むコードセルを実行して、DataFrame ライブラリとその API がノートブックで利用可能であることを確認してください。

このチュートリアルを進めるには、DataFrame を [Gradle](https://kotlin.github.io/dataframe/setupgradle.html) または [Maven](https://kotlin.github.io/dataframe/setupmaven.html) の依存関係として使用することもできます。

## DataFrame の作成

まず、視覚化するデータを含む DataFrame を作成しましょう。この DataFrame には、ベルリン、マドリード、カラカスの 3 都市における月間平均気温のシミュレーション数値が格納されます：

```kotlin
// months 変数は、1 年の 12 か月を含むリストを格納します
val months = listOf(
    "January", "February",
    "March", "April", "May",
    "June", "July", "August",
    "September", "October", "November",
    "December"
)
// tempBerlin、tempMadrid、tempCaracas 変数は、各月の気温値をリストで格納します
val tempBerlin =
    listOf(-0.5, 0.0, 4.8, 9.0, 14.3, 17.5, 19.2, 18.9, 14.5, 9.7, 4.7, 1.0)
val tempMadrid =
    listOf(6.3, 7.9, 11.2, 12.9, 16.7, 21.1, 24.7, 24.2, 20.3, 15.4, 9.9, 6.6)
val tempCaracas =
    listOf(27.5, 28.9, 29.6, 30.9, 31.7, 35.1, 33.8, 32.2, 31.3, 29.4, 28.9, 27.6)
```

次に、新しい変数 (`df`) を作成し、[`dataFrameOf()`](https://kotlin.github.io/dataframe/createdataframe.html#dataframeof) 関数を使用して、3 つの列 (Month、Temperature、City) を持つ DataFrame を生成します：

```kotlin
val df = dataFrameOf(
    "Month" to months + months + months,
    "Temperature" to tempBerlin + tempMadrid + tempCaracas,
    "City" to List(12) { "Berlin" } + List(12) { "Madrid" } + List(12) { "Caracas" }
)
```
データをプレビューするには、[`.head()`](https://kotlin.github.io/dataframe/head.html) 関数を使用します：

```kotlin
df.head(4) // 最初の 4 行を返します
```

このデータセットでは、最初の 4 行には 1 月から 4 月までのベルリンの気温が格納されています：

![Dataframe exploration](visualization-dataframe-temperature.png){width=600}

> Kandy と Kotlin DataFrame ライブラリを組み合わせて使用する際、型安全性を高めるのに役立つ、カラムのレコードにアクセスするためのさまざまなオプションがあります。
> 詳細については、[Access APIs](https://kotlin.github.io/dataframe/apilevels.html) を参照してください。
>
{style="tip"}

## 折れ線グラフの作成

前のセクションの `df` DataFrame を使用して、折れ線グラフ（line chart）を作成しましょう：

1. Kandy ライブラリの `.plot()` 関数を呼び出します。 
2. `line()` レイヤーを適用します。 
3. `Month` 列と `Temperature` 列をそれぞれ `X` 軸と `Y` 軸にマッピングします。
4. (任意) 色やサイズをカスタマイズします。

```kotlin
df.plot {
   line {
      x(Month)
      y(Temperature)

      color(City) {
         scale = categorical(
            "Berlin" to Color.hex("#6F4E37"),
            "Madrid" to Color.hex("#C2D4AB"),
            "Caracas" to Color.hex("#B5651D")
         )
      }
      width = 1.5
   }
   layout {
      size = 1000 to 450
   }
}
```

結果は以下の通りです：

![Line chart](visualization-line-chart.svg){width=600}

## ポイントチャートの作成

次に、`df` DataFrame をポイント（散布図）チャートで視覚化してみましょう：

1. Kandy ライブラリの `.plot()` 関数を呼び出します。 
2. `points()` レイヤーを適用します。 
3. `Month` 列と `Temperature` 列をそれぞれ `X` 軸と `Y` 軸にマッピングします。
4. (任意) 色、軸ラベル、ポイントのサイズ、チャートのタイトルをカスタマイズします。

```kotlin
df.plot {
   points {
      x(Month) {
         axis.name = "Month"
      }
      y(Temperature) {
         axis.name = "Temperature"
      }

      color(City) {
         scale = categorical(
            "Berlin" to Color.hex("#6F4E37"),
            "Madrid" to Color.hex("#C2D4AB"),
            "Caracas" to Color.hex("#B5651D")
         )
      }
      size = 5.5
   }
   layout {
      title = "Temperature per month"
   }
}

```

結果は以下の通りです：

![Points chart](visualization-points-chart.svg){width=600}

## 棒グラフの作成

最後に、各都市の棒グラフを作成しましょう：

1. `.groupBy()` 関数を使用して、DataFrame を `City` 列でグループ化します。 
2. Kandy ライブラリの `plot()` 関数を呼び出します。 
3. `bars()` レイヤーを適用します。
4. (任意) チャートのタイトルを追加し、色をカスタマイズします。

```kotlin
df.groupBy { City }.plot {
    bars {
        x(Month)
        y(Temperature)
        
        fillColor(City) {
            scale = categorical(
                "Berlin" to Color.hex("#6F4E37"),
                "Madrid" to Color.hex("#C2D4AB"),
                "Caracas" to Color.hex("#B5651D")
            )
        }
    }
    layout.title {
       title = "Temperature per month"
    }
}
```

結果は以下の通りです：

![Bar chart](visualization-bar-chart.svg){width=600}

## 次のステップ

* [Kandy ライブラリのドキュメント](https://kotlin.github.io/kandy/examples.html)で、より多くのチャート例を探索する
* [Lets-Plot ライブラリのドキュメント](lets-plot.md)で、より高度なプロットオプションを探索する
* [Kotlin DataFrame ライブラリのドキュメント](https://kotlin.github.io/dataframe/info.html)で、データフレームの作成、探索、管理に関する追加情報を見つける