[//]: # (title: 用於資料分析的 Kotlin 與 Java 程式庫)

從資料收集到模型建立，Kotlin 提供了強大的程式庫，協助簡化資料流水線中的各種任務。

除了自身的程式庫外，Kotlin 與 Java 100% 互通。這種互通性有助於利用整個經受過考驗且效能優異的 Java 程式庫生態系統。有了這項優勢，您在進行 [Kotlin 資料專案](data-analysis-overview.md) 時，可以輕鬆地使用 Kotlin 或 Java 程式庫。

## Kotlin 程式庫

<table>
  <tr>
    <td><strong>程式庫</strong></td>
    <td><strong>用途</strong></td>
    <td><strong>特性</strong></td>
  </tr>
  <tr>
    <td>
      <a href="https://github.com/Kotlin/dataframe"><strong>Kotlin DataFrame</strong></a>
    </td>
    <td>
      <list>
        <li>資料收集</li>
        <li>資料清理與處理</li>
      </list>
    </td>
    <td>
      <list>
        <li>用於建立、排序與清理資料框、特徵工程等操作</li>
        <li>結構化資料處理</li>
        <li>支援 CSV、JSON 與其他輸入格式</li>
        <li>從 SQL 資料庫讀取</li>
        <li>與不同的 API 連線以存取資料並增加型別安全性</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://kotlin.github.io/kandy/welcome.html"><strong>Kandy</strong></a>
    </td>
    <td>
      <list>
        <li>資料探索與視覺化</li>
      </list>
    </td>
    <td>
      <list>
        <li>強大、易讀且型別安全的 DSL，用於繪製各種類型的圖表</li>
        <li>為 JVM 編寫的 Kotlin 開源程式庫</li>
        <li>支援 <a href="https://kotlin.github.io/kandy/kandy-in-datalore.html">Datalore</a></li>
        <li>與 <a href="https://kotlin.github.io/dataframe/overview.html">Kotlin DataFrame</a> 無縫整合</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://github.com/jetbrains/kotlindl"><strong>KotlinDL</strong></a>
    </td>
    <td>
      <list>
        <li>模型建立</li>
      </list>
    </td>
    <td>
      <list>
        <li>受 <a href="https://keras.io/">Keras</a> 啟發並以 Kotlin 編寫的深度學習 API</li>
        <li>從頭開始訓練深度學習模型，或匯入現有的 Keras 和 ONNX 模型進行推論</li>
        <li>遷移學習，用於針對您的任務調整現有的預訓練模型</li>
        <li>支援 <a href="https://developer.android.com/about">Android 平台</a></li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://github.com/Kotlin/multik"><strong>Multik</strong></a>
    </td>
    <td>
      <list>
        <li>資料清理與處理</li>
        <li>模型建立</li>
      </list>
    </td>
    <td>
      <list>
        <li>針對多維陣列的數學運算（線性代數、統計、算術與其他計算）</li>
        <li>建立、複製、索引、切片與其他陣列操作</li>
        <li>符合 Kotlin 慣例的程式庫，具有型別與維度安全性以及可換置的計算引擎等優點，可在 JVM 上執行或作為原生程式碼執行</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://github.com/JetBrains/kotlin-spark-api"><strong>Kotlin for Apache Spark</strong></a>
    </td>
    <td>
      <list>
        <li>資料收集</li>
        <li>資料清理與處理</li>
        <li>資料探索與視覺化</li>
        <li>模型建立</li>
      </list>
    </td>
    <td>
      <list>
        <li><a href="https://spark.apache.org/">Apache Spark</a> 與 Kotlin 之間的相容層</li>
        <li>以符合 Kotlin 慣例的程式碼進行 Apache Spark 資料轉換操作</li>
        <li>在花括號或方法參考中簡單使用 Kotlin 特性，例如 `data class` 與 Lambda 運算式</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://lets-plot.org/kotlin/get-started.html"><strong>Lets-Plot</strong></a>
    </td>
    <td>
      <list>
        <li>資料探索與視覺化</li>
      </list>
    </td>
    <td>
      <list>
        <li>以 Kotlin 編寫的統計資料繪圖</li>
        <li>支援 <a href="https://datalore.jetbrains.com/">Datalore</a></li>
        <li>相容於 JVM、JS 與 Python</li>
        <li>在 <a href="https://www.jetbrains.com/lp/compose-multiplatform/">Compose Multiplatform</a> 應用程式中嵌入圖表</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://github.com/mipt-npm/kmath"><strong>KMath</strong></a>
    </td>
    <td>
      <list>
        <li>資料清理與處理</li>
        <li>資料探索與視覺化</li>
        <li>模型建立</li>
      </list>
    </td>
    <td>
      <list>
        <li>用於在 <a href="https://kotlinlang.org/multiplatform/">Kotlin Multiplatform</a>（JVM、JS、Native 與 Wasm）中處理數學抽象的模組化程式庫</li>
        <li>代數結構、數學運算式、直方圖與串流操作的 API</li>
        <li>現有 Java 與 Kotlin 程式庫的可互換包裝函式，包括 <a href="https://github.com/eclipse/deeplearning4j/tree/master/nd4j">ND4J</a>、<a href="https://commons.apache.org/proper/commons-math/">Apache Commons Math</a> 與 <a href="https://github.com/Kotlin/multik">Multik</a></li>
        <li>受 Python 的 <a href="https://numpy.org/">NumPy</a> 啟發，但具有型別安全性等其他額外特性</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://github.com/holgerbrandl/kravis"><strong>kravis</strong></a>
    </td>
    <td>
      <list>
        <li>資料探索與視覺化</li>
      </list>
    </td>
    <td>
      <list>
        <li>表格資料視覺化</li>
        <li>受 R 的 <a href="https://ggplot2.tidyverse.org/">ggplot</a> 啟發</li>
      </list>
    </td>
  </tr>
</table>

## Java 程式庫

由於 Kotlin 提供了一流的 Java 互通性，您可以在 Kotlin 程式碼中使用 Java 程式庫來執行資料任務。以下是此類程式庫的一些範例：

<table>
  <tr>
    <td><strong>程式庫</strong></td>
    <td><strong>用途</strong></td>
    <td><strong>特性</strong></td>
  </tr>
  <tr>
    <td>
      <a href="https://github.com/jtablesaw/tablesaw"><strong>Tablesaw</strong></a>
    </td>
    <td>
      <list>
        <li>資料收集</li>
        <li>資料清理與處理</li>
        <li>資料探索與視覺化</li>
      </list>
    </td>
    <td>
      <list>
        <li>用於載入、清理、轉換、篩選與總結資料的工具</li>
        <li>受 <a href="https://plotly.com/">Plot.ly</a> 啟發</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://stanfordnlp.github.io/CoreNLP/"><strong>CoreNLP</strong></a>
    </td>
    <td>
      <list>
        <li>資料清理與處理</li>
      </list>
    </td>
    <td>
      <list>
        <li>自然語言處理工具套件</li>
        <li>文本的語言註解，例如情緒分析與引語歸屬</li>
        <li>支援八種語言</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://github.com/haifengl/smile"><strong>Smile</strong></a>
    </td>
    <td>
      <list>
        <li>資料清理與處理</li>
        <li>資料探索與視覺化</li>
        <li>模型建立</li>
      </list>
    </td>
    <td>
      <list>
        <li>現成的機器學習與自然語言處理演算法</li>
        <li>線性代數、圖形、內插與視覺化工具</li>
        <li>提供函式式 <a href="https://github.com/haifengl/smile/tree/master/kotlin">Kotlin API</a>、<a href="https://github.com/haifengl/smile/tree/master/scala">Scala API</a>、<a href="https://github.com/haifengl/smile/tree/master/clojure">Clojure API</a> 等</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://github.com/londogard/smile-nlp-kt"><strong>Smile-NLP-kt</strong></a>
    </td>
    <td>
      <list>
        <li>資料清理與處理</li>
      </list>
    </td>
    <td>
      <list>
        <li>針對 Smile 自然語言處理部分的 <a href="https://www.scala-lang.org/api/current/">Scala</a> 隱式轉換的 Kotlin 重寫</li>
        <li>以 Kotlin 擴充函式與介面形式提供的操作</li>
        <li>斷句、詞幹提取、詞袋模型與其他任務</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://github.com/eclipse/deeplearning4j/tree/master/nd4j"><strong>ND4J</strong></a>
    </td>
    <td>
      <list>
        <li>資料清理與處理</li>
        <li>模型建立</li>
      </list>
    </td>
    <td>
      <list>
        <li>用於 JVM 的矩陣數學程式庫</li>
        <li>超過 500 種數學、線性代數與深度學習操作</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://commons.apache.org/proper/commons-math/"><strong>Apache Commons Math</strong></a>
    </td>
    <td>
      <list>
        <li>資料清理與處理</li>
        <li>模型建立</li>
      </list>
    </td>
    <td>
      <list>
        <li>用於 Java 的數學與統計操作</li>
        <li>相關性、分佈、線性代數、幾何與其他操作</li>
        <li>機器學習模型</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://nm.dev/"><strong>NM Dev</strong></a>
    </td>
    <td>
      <list>
        <li>資料清理與處理</li>
        <li>模型建立</li>
      </list>
    </td>
    <td>
      <list>
        <li>數值演算法的 Java 數學程式庫</li>
        <li>物件導向的數值方法</li>
        <li>線性代數、最佳化、統計、微積分與更多操作</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://opennlp.apache.org/"><strong>Apache OpenNLP</strong></a>
    </td>
    <td>
      <list>
        <li>資料清理與處理</li>
        <li>模型建立</li>
      </list>
    </td>
    <td>
      <list>
        <li>基於機器學習的自然語言文本處理工具套件</li>
        <li>分詞、句子切割、詞性標記與其他任務</li>
        <li>內建用於資料建模與模型驗證的工具</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://github.com/HanSolo/charts"><strong>Charts</strong></a>
    </td>
    <td>
      <list>
        <li>資料探索與視覺化</li>
      </list>
    </td>
    <td>
      <list>
        <li>用於科學圖表的 <a href="https://openjfx.io/">JavaFX</a> 程式庫</li>
        <li>複雜圖表，如對數圖、熱圖與力導向圖</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://deeplearning4j.konduit.ai"><strong>DeepLearning4J</strong></a>
    </td>
    <td>
      <list>
        <li>模型建立</li>
      </list>
    </td>
    <td>
      <list>
        <li>用於 Java 的深度學習程式庫</li>
        <li>匯入並重新訓練模型（<a href="https://pytorch.org/">Pytorch</a>、<a href="https://www.tensorflow.org/">Tensorflow</a>、<a href="https://keras.io/">Keras</a>）</li>
        <li>部署在 JVM 微服務環境、行動裝置、IoT 與 <a href="https://spark.apache.org/">Apache Spark</a> 中</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://github.com/TimefoldAI/"><strong>Timefold</strong></a>
    </td>
    <td>
      <list>
        <li>模型建立</li>
      </list>
    </td>
    <td>
      <list>
        <li>用於最佳化規劃問題的求解器公用程式</li>
        <li>相容於物件導向與函式式程式設計</li>
      </list>
    </td>
  </tr>
</table>