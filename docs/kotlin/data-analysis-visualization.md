[//]: # (title: 使用 Kandy 进行数据可视化)
[//]: # (description: 了解如何通过创建折线图、点图和柱状图，使用 Kandy 和 Kotlin 数据帧实现数据可视化。)

Kotlin 提供了一站式的高效且灵活的数据可视化解决方案，在深入研究复杂模型之前，为您提供了一种直观的方式来展示和探索数据。

本教程演示了如何在 IntelliJ IDEA 中使用 [Kandy](https://kotlin.github.io/kandy/welcome.html) 和 [Kotlin 数据帧](https://kotlin.github.io/dataframe/home.html)库创建不同的图表类型。

## 开始之前

> 从 IntelliJ IDEA 2026.2 开始，Kotlin Notebook 将不再随 IDE 内置，也不再由 JetBrains 提供官方支持。
> 源代码将继续在 [GitHub](https://github.com/Kotlin/kotlin-notebook) 上提供。
>
> 欲了解更多信息，请参阅[博客文章](https://blog.jetbrains.com/idea/2026/06/kotlin-notebook-sunset/)。
>
{style="note"}

要按照本教程操作：

1. 选择 **文件** | **新建** | **Kotlin Notebook**。
2. 在您的笔记本中，导入 [Kandy](https://kotlin.github.io/kandy/welcome.html) 和 [Kotlin 数据帧](https://kotlin.github.io/dataframe/home.html)：

   ```kotlin
   %use kandy
   %use dataframe
   ```

   在运行任何其他代码单元之前，请先运行包含 `%use dataframe` 行的代码单元，以确保数据帧库及其 API 在笔记本中可用。

要按照本教程操作，您也可以将数据帧作为 [Gradle](https://kotlin.github.io/dataframe/setupgradle.html) 或 [Maven](https://kotlin.github.io/dataframe/setupmaven.html) 依赖项使用。

## 创建数据帧

首先，让我们创建一个包含要可视化数据的数据帧。此数据帧存储了柏林、马德里和加拉加斯三个城市的模拟月平均气温：

```kotlin
// months 变量存储了一个包含一年 12 个月的列表
val months = listOf(
    "January", "February",
    "March", "April", "May",
    "June", "July", "August",
    "September", "October", "November",
    "December"
)
// tempBerlin、tempMadrid 和 tempCaracas 变量存储了
// 每个月的温度值列表
val tempBerlin =
    listOf(-0.5, 0.0, 4.8, 9.0, 14.3, 17.5, 19.2, 18.9, 14.5, 9.7, 4.7, 1.0)
val tempMadrid =
    listOf(6.3, 7.9, 11.2, 12.9, 16.7, 21.1, 24.7, 24.2, 20.3, 15.4, 9.9, 6.6)
val tempCaracas =
    listOf(27.5, 28.9, 29.6, 30.9, 31.7, 35.1, 33.8, 32.2, 31.3, 29.4, 28.9, 27.6)
```

现在，让我们创建一个新变量 (`df`) 并使用 [`dataFrameOf()`](https://kotlin.github.io/dataframe/createdataframe.html#dataframeof) 函数生成一个包含三列（Month、Temperature 和 City）的数据帧：

```kotlin
val df = dataFrameOf(
    "Month" to months + months + months,
    "Temperature" to tempBerlin + tempMadrid + tempCaracas,
    "City" to List(12) { "Berlin" } + List(12) { "Madrid" } + List(12) { "Caracas" }
)
```
要预览数据，请使用 [`.head()`](https://kotlin.github.io/dataframe/head.html) 函数：

```kotlin
df.head(4) // 返回前四行
```

在我们的数据集中，前四行存储了柏林从 1 月到 4 月的温度：

![探索数据帧](visualization-dataframe-temperature.png){width=600}

> 使用 Kandy 和 Kotlin 数据帧库时，有多种访问列记录的方法可以帮助您提高类型安全性。欲了解更多信息，请参阅[访问 API](https://kotlin.github.io/dataframe/apilevels.html)。
>
{style="tip"}

## 创建折线图

让我们使用上一节中的 `df` 数据帧创建一张折线图：

1. 调用 Kandy 库中的 `.plot()` 函数。
2. 应用 `line()` 图层。
3. 将 `Month` 和 `Temperature` 列分别映射到 `X` 轴和 `Y` 轴。
4. (可选) 自定义颜色和大小。

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

结果如下：

![折线图](visualization-line-chart.svg){width=600}

## 创建点图

现在，让我们在点图（散点图）中可视化 `df` 数据帧：

1. 调用 Kandy 库中的 `.plot()` 函数。
2. 应用 `points()` 图层。
3. 将 `Month` 和 `Temperature` 列分别映射到 `X` 轴和 `Y` 轴。
4. (可选) 自定义颜色、轴标签、点的大小和图表标题。

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

结果如下：

![点图](visualization-points-chart.svg){width=600}

## 创建柱状图

最后，让我们为每个城市创建一张柱状图：

1. 使用 `.groupBy()` 函数按 `City` 列对数据帧进行分组。
2. 调用 Kandy 库中的 `plot()` 函数。
3. 应用 `bars()` 图层。
4. (可选) 为图表添加标题，自定义颜色。

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

结果如下：

![柱状图](visualization-bar-chart.svg){width=600}

## 下一步

* 在 [Kandy 库文档](https://kotlin.github.io/kandy/examples.html)中探索更多图表示例
* 在 [Lets-Plot 库文档](lets-plot.md)中探索更高级的绘图选项
* 在 [Kotlin 数据帧库文档](https://kotlin.github.io/dataframe/info.html)中查找有关创建、探索和管理数据帧的更多信息