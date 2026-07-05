[//]: # (title: 데이터 분석을 위한 코틀린 및 자바 라이브러리)

데이터 수집부터 모델 빌드까지, 코틀린은 데이터 파이프라인의 다양한 작업을 용이하게 하는 강력한 라이브러리를 제공합니다.

자체 라이브러리 외에도, 코틀린은 자바와 100% 상호 운용이 가능합니다. 이러한 상호 운용성은 뛰어난 성능을 갖춘 검증된 자바 라이브러리 생태계 전체를 활용하는 데 도움이 됩니다. 이 장점 덕분에 [코틀린 데이터 프로젝트](data-analysis-overview.md)를 수행할 때 코틀린 또는 자바 라이브러리를 쉽게 사용할 수 있습니다. 

## 코틀린 라이브러리

<table>
  <tr>
    <td><strong>라이브러리</strong></td>
    <td><strong>용도</strong></td>
    <td><strong>기능</strong></td>
  </tr>
  <tr>
    <td>
      <a href="https://github.com/Kotlin/dataframe"><strong>Kotlin DataFrame</strong></a>
    </td>
    <td>
      <list>
        <li>데이터 수집</li>
        <li>데이터 정제 및 처리</li>
      </list>
    </td>
    <td>
      <list>
        <li>데이터 프레임 생성, 정렬, 정제, 피처 엔지니어링(feature engineering) 등을 위한 연산</li>
        <li>구조화된 데이터 처리</li>
        <li>CSV, JSON 및 기타 입력 형식 지원</li>
        <li>SQL 데이터베이스에서 읽기</li>
        <li>데이터에 액세스하고 타입 안전성을 높이기 위해 다양한 API와 연결</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://kotlin.github.io/kandy/welcome.html"><strong>Kandy</strong></a>
    </td>
    <td>
      <list>
        <li>데이터 탐색 및 시각화</li>
      </list>
    </td>
    <td>
      <list>
        <li>다양한 유형의 차트를 그리기 위한 강력하고 가독성 좋으며 타입 안전한 DSL</li>
        <li>JVM용 코틀린으로 작성된 오픈 소스 라이브러리</li>
        <li><a href="https://kotlin.github.io/kandy/kandy-in-datalore.html">Datalore</a> 지원</li>
        <li><a href="https://kotlin.github.io/dataframe/overview.html">Kotlin DataFrame</a>과의 원활한 통합</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://github.com/jetbrains/kotlindl"><strong>KotlinDL</strong></a>
    </td>
    <td>
      <list>
        <li>모델 빌드</li>
      </list>
    </td>
    <td>
      <list>
        <li><a href="https://keras.io/">Keras</a>에서 영감을 받아 코틀린으로 작성된 딥러닝 API</li>
        <li>처음부터 딥러닝 모델을 학습시키거나 기존 Keras 및 ONNX 모델을 가져와 추론에 사용</li>
        <li>기존의 사전 학습된 모델을 작업에 맞게 조정하기 위한 전이 학습</li>
        <li><a href="https://developer.android.com/about">안드로이드(Android) 플랫폼</a> 지원</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://github.com/Kotlin/multik"><strong>Multik</strong></a>
    </td>
    <td>
      <list>
        <li>데이터 정제 및 처리</li>
        <li>모델 빌드</li>
      </list>
    </td>
    <td>
      <list>
        <li>다차원 배열에 대한 수학적 연산(선형 대수, 통계, 산술 및 기타 계산)</li>
        <li>배열 생성, 복사, 인덱싱, 슬라이싱 및 기타 배열 작업</li>
        <li>타입 및 차원 안전성, 교체 가능한 컴퓨팅 엔진 등의 이점을 가진 코틀린 관용적 라이브러리로, JVM 또는 네이티브 코드로 실행됨</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://github.com/JetBrains/kotlin-spark-api"><strong>Kotlin for Apache Spark</strong></a>
    </td>
    <td>
      <list>
        <li>데이터 수집</li>
        <li>데이터 정제 및 처리</li>
        <li>데이터 탐색 및 시각화</li>
        <li>모델 빌드</li>
      </list>
    </td>
    <td>
      <list>
        <li><a href="https://spark.apache.org/">Apache Spark</a>와 코틀린 간의 호환성 레이어</li>
        <li>코틀린 관용적 코드로 작성된 Apache Spark 데이터 변환 작업</li>
        <li>중괄호나 메서드 참조 내에서 데이터 클래스 및 람다 식과 같은 코틀린 기능을 간단하게 사용</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://lets-plot.org/kotlin/get-started.html"><strong>Lets-Plot</strong></a>
    </td>
    <td>
      <list>
        <li>데이터 탐색 및 시각화</li>
      </list>
    </td>
    <td>
      <list>
        <li>코틀린으로 작성된 통계 데이터 플로팅</li>
        <li><a href="https://datalore.jetbrains.com/">Datalore</a> 지원</li>
        <li>JVM, JS 및 Python과 호환</li>
        <li>차트를 <a href="https://www.jetbrains.com/lp/compose-multiplatform/">Compose Multiplatform</a> 애플리케이션에 삽입</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://github.com/mipt-npm/kmath"><strong>KMath</strong></a>
    </td>
    <td>
      <list>
        <li>데이터 정제 및 처리</li>
        <li>데이터 탐색 및 시각화</li>
        <li>모델 빌드</li>
      </list>
    </td>
    <td>
      <list>
        <li><a href="https://kotlinlang.org/multiplatform/">Kotlin Multiplatform</a>(JVM, JS, Native, Wasm)에서 수학적 추상화를 작업하기 위한 모듈형 라이브러리</li>
        <li>대수 구조, 수학 공식, 히스토그램 및 스트리밍 연산을 위한 API</li>
        <li><a href="https://github.com/eclipse/deeplearning4j/tree/master/nd4j">ND4J</a>, <a href="https://commons.apache.org/proper/commons-math/">Apache Commons Math</a>, <a href="https://github.com/Kotlin/multik">Multik</a>을 포함한 기존 자바 및 코틀린 라이브러리에 대한 교체 가능한 래퍼</li>
        <li>파이썬의 <a href="https://numpy.org/">NumPy</a>에서 영감을 받았으나 타입 안전성과 같은 추가 기능 제공</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://github.com/holgerbrandl/kravis"><strong>kravis</strong></a>
    </td>
    <td>
      <list>
        <li>데이터 탐색 및 시각화</li>
      </list>
    </td>
    <td>
      <list>
        <li>표 형식 데이터의 시각화</li>
        <li>R의 <a href="https://ggplot2.tidyverse.org/">ggplot</a>에서 영감을 받음</li>
      </list>
    </td>
  </tr>
</table>

## 자바 라이브러리

코틀린은 자바와 뛰어난 상호 운용성을 제공하므로, 코틀린 코드에서 데이터 작업을 위해 자바 라이브러리를 사용할 수 있습니다. 다음은 그러한 라이브러리의 몇 가지 예입니다.

<table>
  <tr>
    <td><strong>라이브러리</strong></td>
    <td><strong>용도</strong></td>
    <td><strong>기능</strong></td>
  </tr>
  <tr>
    <td>
      <a href="https://github.com/jtablesaw/tablesaw"><strong>Tablesaw</strong></a>
    </td>
    <td>
      <list>
        <li>데이터 수집</li>
        <li>데이터 정제 및 처리</li>
        <li>데이터 탐색 및 시각화</li>
      </list>
    </td>
    <td>
      <list>
        <li>데이터 로드, 정제, 변환, 필터링 및 요약을 위한 도구</li>
        <li><a href="https://plotly.com/">Plot.ly</a>에서 영감을 받음</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://stanfordnlp.github.io/CoreNLP/"><strong>CoreNLP</strong></a>
    </td>
    <td>
      <list>
        <li>데이터 정제 및 처리</li>
      </list>
    </td>
    <td>
      <list>
        <li>자연어 처리 툴킷</li>
        <li>감성 분석 및 인용문 속성 부여와 같은 텍스트에 대한 언어적 주석(annotation)</li>
        <li>8개 언어 지원</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://github.com/haifengl/smile"><strong>Smile</strong></a>
    </td>
    <td>
      <list>
        <li>데이터 정제 및 처리</li>
        <li>데이터 탐색 및 시각화</li>
        <li>모델 빌드</li>
      </list>
    </td>
    <td>
      <list>
        <li>머신 러닝 및 자연어 처리를 위한 기성 알고리즘</li>
        <li>선형 대수, 그래프, 보간 및 시각화 도구</li>
        <li>함수형 <a href="https://github.com/haifengl/smile/tree/master/kotlin">Kotlin API</a>, <a href="https://github.com/haifengl/smile/tree/master/scala">Scala API</a>, <a href="https://github.com/haifengl/smile/tree/master/clojure">Clojure API</a> 등 제공</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://github.com/londogard/smile-nlp-kt"><strong>Smile-NLP-kt</strong></a>
    </td>
    <td>
      <list>
        <li>데이터 정제 및 처리</li>
      </list>
    </td>
    <td>
      <list>
        <li>Smile의 자연어 처리 부분에 대한 <a href="https://www.scala-lang.org/api/current/">Scala</a> implicit를 코틀린으로 재작성</li>
        <li>코틀린 확장 함수 및 인터페이스 형식의 연산</li>
        <li>문장 분리, 어간 추출, BoW(bag of words) 및 기타 작업</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://github.com/eclipse/deeplearning4j/tree/master/nd4j"><strong>ND4J</strong></a>
    </td>
    <td>
      <list>
        <li>데이터 정제 및 처리</li>
        <li>모델 빌드</li>
      </list>
    </td>
    <td>
      <list>
        <li>JVM용 행렬 수학 라이브러리</li>
        <li>500개 이상의 수학, 선형 대수 및 딥러닝 연산</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://commons.apache.org/proper/commons-math/"><strong>Apache Commons Math</strong></a>
    </td>
    <td>
      <list>
        <li>데이터 정제 및 처리</li>
        <li>모델 빌드</li>
      </list>
    </td>
    <td>
      <list>
        <li>자바용 수학 및 통계 연산</li>
        <li>상관관계, 분포, 선형 대수, 기하학 및 기타 연산</li>
        <li>머신 러닝 모델</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://nm.dev/"><strong>NM Dev</strong></a>
    </td>
    <td>
      <list>
        <li>데이터 정제 및 처리</li>
        <li>모델 빌드</li>
      </list>
    </td>
    <td>
      <list>
        <li>수치 알고리즘의 자바 수학 라이브러리</li>
        <li>객체 지향 수치 메서드</li>
        <li>선형 대수, 최적화, 통계, 미적분 및 기타 연산</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://opennlp.apache.org/"><strong>Apache OpenNLP</strong></a>
    </td>
    <td>
      <list>
        <li>데이터 정제 및 처리</li>
        <li>모델 빌드</li>
      </list>
    </td>
    <td>
      <list>
        <li>자연어 텍스트 처리를 위한 머신 러닝 기반 툴킷</li>
        <li>토큰화, 문장 분할, 품사 태깅 및 기타 작업</li>
        <li>데이터 모델링 및 모델 검증을 위한 내장 도구</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://github.com/HanSolo/charts"><strong>Charts</strong></a>
    </td>
    <td>
      <list>
        <li>데이터 탐색 및 시각화</li>
      </list>
    </td>
    <td>
      <list>
        <li>과학적 차트를 위한 <a href="https://openjfx.io/">JavaFX</a> 라이브러리</li>
        <li>로그, 히트맵, 힘 지향 그래프(force-directed graph)와 같은 복잡한 차트</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://deeplearning4j.konduit.ai"><strong>DeepLearning4J</strong></a>
    </td>
    <td>
      <list>
        <li>모델 빌드</li>
      </list>
    </td>
    <td>
      <list>
        <li>자바용 딥러닝 라이브러리</li>
        <li>모델(<a href="https://pytorch.org/">Pytorch</a>, <a href="https://www.tensorflow.org/">Tensorflow</a>, <a href="https://keras.io/">Keras</a>) 가져오기 및 재학습</li>
        <li>JVM 마이크로서비스 환경, 모바일 장치, IoT 및 <a href="https://spark.apache.org/">Apache Spark</a>에 배포</li>
      </list>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://github.com/TimefoldAI/"><strong>Timefold</strong></a>
    </td>
    <td>
      <list>
        <li>모델 빌드</li>
      </list>
    </td>
    <td>
      <list>
        <li>최적화 계획 문제(optimization planning problems)를 위한 솔버 유틸리티</li>
        <li>객체 지향 및 함수형 프로그래밍과 호환</li>
      </list>
    </td>
  </tr>
</table>