[//]: # (title: データ分析のための Kotlin および Java ライブラリ)

データ収集からモデル構築まで、Kotlin はデータパイプラインにおけるさまざまなタスクを容易にする強力なライブラリを提供しています。

独自のライブラリに加えて、Kotlin は Java と 100% の相互運用性を備えています。この相互運用性により、優れたパフォーマンスを持つ実証済みの Java ライブラリのエコシステム全体を活用できます。この利点により、[Kotlin データプロジェクト](data-analysis-overview.md)に取り組む際、Kotlin または Java のライブラリを簡単に使い分けることができます。

## Kotlin ライブラリ

<table>
  <tr>
    <td><strong>ライブラリ</strong></td>
    <td><strong>目的</strong></td>
    <td><strong>特徴</strong></td>
  </tr>
  <tr>
    <td>
      <a href="https://github.com/Kotlin/dataframe"><strong>Kotlin DataFrame</strong></a>
    </td>
    <td>
      <list>
        <li>データ収集</li>
        <li>データのクリーニングと処理</li>
      </list>
    </td>
    <td>
      <list>
        <li>データフレームの作成、ソート、クリーニング、特徴量エンジニアリング（feature engineering）などの操作</li>
        <li>構造化データの処理</li>
        <li>CSV、JSON、その他の入力形式のサポート</li>
        <li>SQL データベースからの読み取り</li>
        <li>データへのアクセスと型安全性を向上させるためのさまざまな API との接続</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://kotlin.github.io/kandy/welcome.html"><strong>Kandy</strong></a>
    </td>
    <td>
      <list>
        <li>データの探索と可視化</li>
      </list>
    </td>
    <td>
      <list>
        <li>さまざまなタイプのチャートをプロットするための、強力で読みやすく型安全な DSL</li>
        <li>JVM 向けに Kotlin で書かれたオープンソースライブラリ</li>
        <li><a href="https://kotlin.github.io/kandy/kandy-in-datalore.html">Datalore</a> のサポート</li>
        <li><a href="https://kotlin.github.io/dataframe/overview.html">Kotlin DataFrame</a> とのシームレスな統合</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://github.com/jetbrains/kotlindl"><strong>KotlinDL</strong></a>
    </td>
    <td>
      <list>
        <li>モデル構築</li>
      </list>
    </td>
    <td>
      <list>
        <li><a href="https://keras.io/">Keras</a> にインスパイアされた、Kotlin で書かれたディープラーニング API</li>
        <li>ディープラーニングモデルをゼロからトレーニング、または既存の Keras および ONNX モデルを推論用にインポート</li>
        <li>既存の学習済みモデルをタスクに合わせて調整するための転移学習（transfer learning）</li>
        <li><a href="https://developer.android.com/about">Android プラットフォーム</a> のサポート</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://github.com/Kotlin/multik"><strong>Multik</strong></a>
    </td>
    <td>
      <list>
        <li>データのクリーニングと処理</li>
        <li>モデル構築</li>
      </list>
    </td>
    <td>
      <list>
        <li>多次元配列に対する数学的演算（線形代数、統計、算術、その他の計算）</li>
        <li>配列の作成、コピー、インデックス作成、スライス、その他の配列操作</li>
        <li>型や次元の安全性、交換可能な計算エンジンなどの利点を備えた Kotlin 慣用的な（idiomatic）ライブラリ。JVM またはネイティブコードとして実行可能</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://github.com/JetBrains/kotlin-spark-api"><strong>Kotlin for Apache Spark</strong></a>
    </td>
    <td>
      <list>
        <li>データ収集</li>
        <li>データのクリーニングと処理</li>
        <li>データの探索と可視化</li>
        <li>モデル構築</li>
      </list>
    </td>
    <td>
      <list>
        <li><a href="https://spark.apache.org/">Apache Spark</a> と Kotlin の間の互換性レイヤー</li>
        <li>Kotlin 慣用的なコードでの Apache Spark データ変換操作</li>
        <li>データクラスやラムダ式などの Kotlin の機能を、波括弧内やメソッド参照で簡単に使用可能</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://lets-plot.org/kotlin/get-started.html"><strong>Lets-Plot</strong></a>
    </td>
    <td>
      <list>
        <li>データの探索と可視化</li>
      </list>
    </td>
    <td>
      <list>
        <li>Kotlin で書かれた統計データプロット用ライブラリ</li>
        <li><a href="https://datalore.jetbrains.com/">Datalore</a> のサポート</li>
        <li>JVM、JS、Python との互換性</li>
        <li><a href="https://www.jetbrains.com/lp/compose-multiplatform/">Compose Multiplatform</a> アプリケーションへのチャートの埋め込み</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://github.com/mipt-npm/kmath"><strong>KMath</strong></a>
    </td>
    <td>
      <list>
        <li>データのクリーニングと処理</li>
        <li>データの探索と可視化</li>
        <li>モデル構築</li>
      </list>
    </td>
    <td>
      <list>
        <li><a href="https://kotlinlang.org/multiplatform/">Kotlin Multiplatform</a>（JVM、JS、Native、Wasm）で数学的抽象化を扱うためのモジュール式ライブラリ</li>
        <li>代数構造、数式、ヒストグラム、ストリーミング操作のための API</li>
        <li><a href="https://github.com/eclipse/deeplearning4j/tree/master/nd4j">ND4J</a>、<a href="https://commons.apache.org/proper/commons-math/">Apache Commons Math</a>、<a href="https://github.com/Kotlin/multik">Multik</a> を含む、既存の Java および Kotlin ライブラリに対する交換可能なラッパー</li>
        <li>Python の <a href="https://numpy.org/">NumPy</a> に触発されているが、型安全性などの追加機能を備える</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://github.com/holgerbrandl/kravis"><strong>kravis</strong></a>
    </td>
    <td>
      <list>
        <li>データの探索と可視化</li>
      </list>
    </td>
    <td>
      <list>
        <li>表形式データの可視化</li>
        <li>R の <a href="https://ggplot2.tidyverse.org/">ggplot</a> にインスパイアされている</li>
      </list>
    </td>
  </tr>
</table>

## Java ライブラリ

Kotlin は Java との第一級の相互運用性を提供しているため、Kotlin コード内でデータタスクに Java ライブラリを使用できます。以下にそのようなライブラリの例をいくつか挙げます。

<table>
  <tr>
    <td><strong>ライブラリ</strong></td>
    <td><strong>目的</strong></td>
    <td><strong>特徴</strong></td>
  </tr>
  <tr>
    <td>
      <a href="https://github.com/jtablesaw/tablesaw"><strong>Tablesaw</strong></a>
    </td>
    <td>
      <list>
        <li>データ収集</li>
        <li>データのクリーニングと処理</li>
        <li>データの探索と可視化</li>
      </list>
    </td>
    <td>
      <list>
        <li>データの読み込み、クリーニング、変換、フィルタリング、要約のためのツール</li>
        <li><a href="https://plotly.com/">Plot.ly</a> にインスパイアされている</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://stanfordnlp.github.io/CoreNLP/"><strong>CoreNLP</strong></a>
    </td>
    <td>
      <list>
        <li>データのクリーニングと処理</li>
      </list>
    </td>
    <td>
      <list>
        <li>自然言語処理ツールキット</li>
        <li>感情分析や引用の帰属など、テキストに対する言語学的アノテーション</li>
        <li>8 言語のサポート</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://github.com/haifengl/smile"><strong>Smile</strong></a>
    </td>
    <td>
      <list>
        <li>データのクリーニングと処理</li>
        <li>データの探索と可視化</li>
        <li>モデル構築</li>
      </list>
    </td>
    <td>
      <list>
        <li>機械学習と自然言語処理のための既製のアルゴリズム</li>
        <li>線形代数、グラフ、補間、可視化ツール</li>
        <li>関数型の <a href="https://github.com/haifengl/smile/tree/master/kotlin">Kotlin API</a>、<a href="https://github.com/haifengl/smile/tree/master/scala">Scala API</a>、<a href="https://github.com/haifengl/smile/tree/master/clojure">Clojure API</a> などを提供</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://github.com/londogard/smile-nlp-kt"><strong>Smile-NLP-kt</strong></a>
    </td>
    <td>
      <list>
        <li>データのクリーニングと処理</li>
      </list>
    </td>
    <td>
      <list>
        <li>Smile の自然言語処理部分における <a href="https://www.scala-lang.org/api/current/">Scala</a> インプリシット（implicits）の Kotlin による書き直し</li>
        <li>Kotlin の拡張関数やインターフェースの形式での操作</li>
        <li>文分割、ステミング、Bag-of-words、その他のタスク</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://github.com/eclipse/deeplearning4j/tree/master/nd4j"><strong>ND4J</strong></a>
    </td>
    <td>
      <list>
        <li>データのクリーニングと処理</li>
        <li>モデル構築</li>
      </list>
    </td>
    <td>
      <list>
        <li>JVM 用の行列数学ライブラリ</li>
        <li>500 以上の数学、線形代数、ディープラーニング操作</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://commons.apache.org/proper/commons-math/"><strong>Apache Commons Math</strong></a>
    </td>
    <td>
      <list>
        <li>データのクリーニングと処理</li>
        <li>モデル構築</li>
      </list>
    </td>
    <td>
      <list>
        <li>Java 用の数学および統計演算</li>
        <li>相関、分布、線形代数、幾何学、その他の操作</li>
        <li>機械学習モデル</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://nm.dev/"><strong>NM Dev</strong></a>
    </td>
    <td>
      <list>
        <li>データクリーニングと処理</li>
        <li>モデル構築</li>
      </list>
    </td>
    <td>
      <list>
        <li>数値アルゴリズムの Java 数学ライブラリ</li>
        <li>オブジェクト指向の数値解法</li>
        <li>線形代数、最適化、統計、微積分、その他の操作</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://opennlp.apache.org/"><strong>Apache OpenNLP</strong></a>
    </td>
    <td>
      <list>
        <li>データのクリーニングと処理</li>
        <li>モデル構築</li>
      </list>
    </td>
    <td>
      <list>
        <li>自然言語テキスト処理のための機械学習ベースのツールキット</li>
        <li>トークン化、文のセグメンテーション、品詞タグ付け、その他のタスク</li>
        <li>データモデリングとモデル検証のための組み込みツール</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://github.com/HanSolo/charts"><strong>Charts</strong></a>
    </td>
    <td>
      <list>
        <li>データの探索と可視化</li>
      </list>
    </td>
    <td>
      <list>
        <li><a href="https://openjfx.io/">JavaFX</a> ライブラリによる科学チャート</li>
        <li>対数グラフ、ヒートマップ、力学モデルグラフなどの複雑なチャート</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://deeplearning4j.konduit.ai"><strong>DeepLearning4J</strong></a>
    </td>
    <td>
      <list>
        <li>モデル構築</li>
      </list>
    </td>
    <td>
      <list>
        <li>Java 用ディープラーニングライブラリ</li>
        <li>モデル（<a href="https://pytorch.org/">Pytorch</a>、<a href="https://www.tensorflow.org/">Tensorflow</a>、<a href="https://keras.io/">Keras</a>）のインポートと再トレーニング</li>
        <li>JVM マイクロサービス環境、モバイルデバイス、IoT、<a href="https://spark.apache.org/">Apache Spark</a> へのデプロイ</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://github.com/TimefoldAI/"><strong>Timefold</strong></a>
    </td>
    <td>
      <list>
        <li>モデル構築</li>
      </list>
    </td>
    <td>
      <list>
        <li>最適化計画問題のためのソルバーユーティリティ</li>
        <li>オブジェクト指向および関数型プログラミングに対応</li>
      </list>
    </td>
  </tr>
</table>