[//]: # (title: Kandyによるデータ可視化)
<web-summary>KandyとKotlin DataFrameを使用して折れ線グラフ、ポイントチャート（散布図）、棒グラフを作成し、データを可視化する方法を学びます。</web-summary>

Kotlinは、強力かつ柔軟なデータ可視化のためのオールインワンソリューションを提供し、複雑なモデルに取り掛かる前に直感的な方法でデータを提示および探索できるようにします。

このチュートリアルでは、[Kandy](https://kotlin.github.io/kandy/welcome.html)および[Kotlin DataFrame](https://kotlin.github.io/dataframe/home.html)ライブラリを使用して、IntelliJ IDEAでさまざまな種類のチャートを作成する方法を説明します。

## 始める前に {id="before-you-start"}

> IntelliJ IDEA 2026.2以降、Kotlin NotebookはIDEにバンドルされなくなり、JetBrainsによる公式サポートも終了します。
> ソースコードは引き続き[GitHub](https://github.com/Kotlin/kotlin-notebook)で利用可能です。
>
> 詳細については、[ブログ投稿](https://blog.jetbrains.com/idea/2026/06/kotlin-notebook-sunset/)をご覧ください。
>
{style="note"}

このチュートリアルを進めるには：

1. **File** | **New** | **Kotlin Notebook** を選択します。
2. ノートブックで、[Kandy](https://kotlin.github.io/kandy/welcome.html)と[Kotlin DataFrame](https://kotlin.github.io/dataframe/home.html)をインポートします：

   ```kotlin
   %use kandy
   %use dataframe
   ```

   ノートブック内でDataFrameライブラリとそのAPIを確実に利用できるようにするため、他のコードセルを実行する前に`%use dataframe`の行を含むコードセルを実行してください。

チュートリアルを進めるために、DataFrameを[Gradle](https://kotlin.github.io/dataframe/setupgradle.html)または[Maven](https://kotlin.github.io/dataframe/setupmaven.html)の依存関係として使用することもできます。

## DataFrameの作成 {id="create-a-dataframe"}

まず、可視化するデータを含むDataFrameを作成しましょう。このDataFrameには、ベルリン、マドリード、カラカスのシミュレートされた月平均気温が格納されます：

```kotlin
// months変数には、年の12か月を含むリストが格納されます
val months = listOf(
    "January", "February",
    "March", "April", "May",
    "June", "July", "August",
    "September", "October", "November",
    "December"
)
// tempBerlin、tempMadrid、tempCaracas変数には、
// 各月の気温値を格納したリストが保持されます
val tempBerlin =
    listOf(-0.5, 0.0, 4.8, 9.0, 14.3, 17.5, 19.2, 18.9, 14.5, 9.7, 4.7, 1.0)
val tempMadrid =
    listOf(6.3, 7.9, 11.2, 12.9, 16.7, 21.1, 24.7, 24.2, 20.3, 15.4, 9.9, 6.6)
val tempCaracas =
    listOf(27.5, 28.9, 29.6, 30.9, 31.7, 35.1, 33.8, 32.2, 31.3, 29.4, 28.9, 27.6)
```

次に、新しい変数（`df`）を作成し、[`dataFrameOf()`](https://kotlin.github.io/dataframe/createdataframe.html#dataframeof)関数を使用して3つの列（Month、Temperature、City）を持つDataFrameを生成します：

```kotlin
val df = dataFrameOf(
    "Month" to months + months + months,
    "Temperature" to tempBerlin + tempMadrid + tempCaracas,
    "City" to List(12) { "Berlin" } + List(12) { "Madrid" } + List(12) { "Caracas" }
)
```
データをプレビューするには、[`.head()`](https://kotlin.github.io/dataframe/head.html)関数を使用します：

```kotlin
df.head(4) // 最初の4行を返す
```

このデータセットでは、最初の4行に1月から4月までのベルリンの気温が格納されています：

![Dataframe exploration](visualization-dataframe-temperature.png){width=600}

> KandyとKotlin DataFrameライブラリを組み合わせて使用する際に、型の安全性を高めるのに役立つ、列のレコードにアクセスするためのさまざまなオプションが用意されています。
> 詳細については、[Access APIs](https://kotlin.github.io/dataframe/apilevels.html)を参照してください。
>
{style="tip"}

## 折れ線グラフの作成 {id="create-a-line-chart"}

前のセクションの`df` DataFrameを使用して、折れ線グラフを作成しましょう：

1. Kandyライブラリの`.plot()`関数を呼び出します。
2. `line()`レイヤーを適用します。
3. `Month`列と`Temperature`列をそれぞれ`X`軸と`Y`軸にマッピングします。
4. （オプション）色とサイズをカスタマイズします。

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

結果は以下のようになります：

![Line chart](visualization-line-chart.svg){width=600}

## ポイントチャートの作成 {id="create-a-points-chart"}

次に、`df` DataFrameをポイント（散布図）チャートで可視化してみましょう：

1. Kandyライブラリの`.plot()`関数を呼び出します。
2. `points()`レイヤーを適用します。
3. `Month`列と`Temperature`列をそれぞれ`X`軸と`Y`軸にマッピングします。
4. （オプション）色、軸ラベル、ポイントサイズ、チャートタイトルをカスタマイズします。

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

結果は以下のようになります：

![Points chart](visualization-points-chart.svg){width=600}

## 棒グラフの作成 {id="create-a-bar-chart"}

最後に、都市ごとの棒グラフを作成しましょう：

1. `.groupBy()`関数を使用して、DataFrameを`City`列でグループ化します。
2. Kandyライブラリの`plot()`関数を呼び出します。
3. `bars()`レイヤーを適用します。
4. （オプション）チャートのタイトルを追加し、色をカスタマイズします。

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

結果は以下のようになります：

![Bar chart](visualization-bar-chart.svg){width=600}

## 次のステップ {id="what-s-next"}

* [Kandyライブラリのドキュメント](https://kotlin.github.io/kandy/examples.html)で、その他のチャート例を確認する
* [Lets-Plotライブラリのドキュメント](lets-plot.md)で、より高度な描画オプションを確認する
* [Kotlin DataFrameライブラリのドキュメント](https://kotlin.github.io/dataframe/info.html)で、データフレームの作成、探索、管理に関する追加情報を確認する