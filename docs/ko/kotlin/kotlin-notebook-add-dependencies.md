[//]: # (title: Kotlin Notebook에 종속성 추가하기)

> IntelliJ IDEA 2026.2부터 Kotlin Notebook은 더 이상 IDE에 번들로 제공되지 않으며 JetBrains에서 공식적으로 지원하지 않습니다.
> 소스 코드는 [GitHub](https://github.com/Kotlin/kotlin-notebook)에서 계속 확인할 수 있습니다.
>
> 자세한 내용은 [블로그 포스트](https://blog.jetbrains.com/idea/2026/06/kotlin-notebook-sunset/)를 확인하세요.
>
{style="note"}

<tldr>
   <p>이것은 <strong>Kotlin Notebook 시작하기</strong> 튜토리얼의 세 번째 파트입니다. 계속 진행하기 전에 이전 단계를 완료했는지 확인하세요.</p>
   <p><img src="icon-1-done.svg" width="20" alt="First step"/> <a href="kotlin-notebook-set-up-env.md">환경 설정</a><br/>
      <img src="icon-2-done.svg" width="20" alt="Second step"/> <a href="kotlin-notebook-create.md">Kotlin Notebook 만들기</a><br/>
      <img src="icon-3.svg" width="20" alt="Third step"/> <strong>Kotlin Notebook에 종속성 추가하기</strong><br/>
  </p>
</tldr>

첫 번째 [Kotlin Notebook](kotlin-notebook-overview.md)을 이미 만드셨군요! 이제 고급 기능을 활용하는 데 필요한 라이브러리 종속성(dependency)을 추가하는 방법을 배워보겠습니다.

> Kotlin 표준 라이브러리는 별도의 설정 없이 즉시 사용할 수 있으므로 따로 임포트할 필요가 없습니다.
> 
{style="note"}

임의의 코드 셀에 Gradle 방식의 구문을 사용하여 Maven 저장소의 라이브러리를 로드할 수 있습니다. 
하지만 Kotlin Notebook은 [`%use` 문](https://www.jetbrains.com/help/idea/kotlin-notebook.html#import-libraries)을 통해 인기 라이브러리를 로드하는 더 간편한 방법을 제공합니다:

```kotlin
// 추가하려는 라이브러리 종속성으로 libraryName을 대체하세요
%use libraryName
// 필요한 경우 버전을 지정하세요
%use libraryName(version)
// 자동 완성을 활성화하려면 v=를 추가하세요
%use libraryName(v=version)
// 예시: kotlinx.datetime:0.7.1
%use datetime(v=0.7.1)
```

Kotlin Notebook의 자동 완성 기능을 사용하면 사용 가능한 라이브러리에 빠르게 접근할 수 있습니다:

![Kotlin Notebook의 자동 완성 기능](autocompletion-feature-notebook.png){width=700}

> Kotlin Notebook에는 딥러닝부터 HTTP 네트워킹에 이르기까지 다양한 작업을 수행하기 위한 통합 라이브러리 세트가 포함되어 있습니다.
> [지원되는 라이브러리 가져오기](https://www.jetbrains.com/help/idea/kotlin-notebook.html#import-libraries)를 참조하세요.
> 
> 또한 아직 Kotlin Notebook에 통합되지 않은 라이브러리를 추가하여 사용할 수도 있습니다. [새 라이브러리 통합](https://www.jetbrains.com/help/idea/kotlin-notebook.html#integrate-new-libraries)을 참조하세요.
>
{style="note"}

## Kotlin Notebook에 Kotlin DataFrame 및 Kandy 라이브러리 추가하기

Kotlin Notebook에 두 개의 인기 있는 Kotlin 라이브러리 종속성을 추가해 보겠습니다:
* [Kotlin DataFrame 라이브러리](https://kotlin.github.io/dataframe/home.html)는 Kotlin 프로젝트에서 데이터를 조작할 수 있는 기능을 제공합니다. 이를 사용하여 [API](data-analysis-work-with-api.md), [SQL 데이터베이스](data-analysis-connect-to-db.md), CSV나 JSON과 같은 [다양한 파일 형식](data-analysis-work-with-data-sources.md)에서 데이터를 가져올 수 있습니다.
* [Kandy 라이브러리](https://kotlin.github.io/kandy/welcome.html)는 [차트 생성](data-analysis-visualization.md)을 위한 강력하고 유연한 DSL을 제공합니다.

이 라이브러리들을 추가하려면:

1. **Add Code Cell**을 클릭하여 새 코드 셀을 만듭니다.
2. 코드 셀에 다음 코드를 입력합니다:

    ```kotlin
    // 사용 가능한 최신 라이브러리 버전이 사용되도록 보장합니다
    %useLatestDescriptors
    
    // Kotlin DataFrame 라이브러리를 가져옵니다
    %use dataframe
    
    // Kotlin Kandy 라이브러리를 가져옵니다
    %use kandy
    ```

3. 코드 셀을 실행합니다.

   `%use` 문이 실행되면 라이브러리 종속성을 다운로드하고 노트북에 기본 임포트(import)를 추가합니다.

   > 라이브러리에 의존하는 다른 코드 셀을 실행하기 전에 `%use libraryName` 줄이 포함된 코드 셀을 먼저 실행해야 합니다.
   >
   {style="note"}

4. Kotlin DataFrame 라이브러리를 사용하여 CSV 파일에서 데이터를 가져오려면 새 코드 셀에서 `.read()` 함수를 사용합니다:

    ```kotlin
    // "netflix_titles.csv" 파일에서 데이터를 가져와 DataFrame을 생성합니다.
    val rawDf = DataFrame.read("netflix_titles.csv")
    
    // 원시 DataFrame 데이터를 표시합니다
    rawDf
    ```

   > 이 예제 CSV는 [Kotlin DataFrame 예제 GitHub 저장소](https://github.com/Kotlin/dataframe/blob/master/examples/notebooks/netflix/netflix_titles.csv)에서 다운로드할 수 있습니다. 프로젝트 디렉터리에 추가하세요.
   >
   {style="tip"}

   ![DataFrame을 사용하여 데이터 표시하기](add-dataframe-dependency.png){width=700}

5. 새 코드 셀에서 `.plot` 메서드를 사용하여 DataFrame에 있는 TV 프로그램(TV Shows)과 영화(Movies)의 분포를 시각적으로 표현해 보겠습니다:

    ```kotlin
    rawDf
        // "type" 열의 각 고유 값의 발생 횟수를 계산합니다
        .valueCounts(sort = false) { type }
        // 색상을 지정하여 데이터를 막대 차트로 시각화합니다
        .plot {
            bars {
                x(type)
                y("count")
                fillColor(type) {
                    scale = categorical(range = listOf(Color.hex("#00BCD4"), Color.hex("#009688")))
                }
            }
    
            // 차트의 레이아웃을 구성하고 제목을 설정합니다
            layout {
                title = "Count of TV Shows and Movies"
                size = 900 to 550
            }
        }
    ```

결과 차트:

![Kandy 라이브러리를 사용한 시각화](kandy-library.png){width=700}

Kotlin Notebook에서 이러한 라이브러리들을 성공적으로 추가하고 활용하신 것을 축하합니다!
이것은 Kotlin Notebook과 [지원되는 라이브러리](data-analysis-libraries.md)로 달성할 수 있는 것들의 일부에 불과합니다.

## 다음 단계

* [Kotlin Notebook 공유 방법](kotlin-notebook-share.md) 알아보기
* [Kotlin Notebook에 종속성 추가](https://www.jetbrains.com/help/idea/kotlin-notebook.html#add-dependencies)에 대한 자세한 내용 보기
* Kotlin DataFrame 라이브러리를 사용하는 더 광범위한 가이드는 [파일에서 데이터 가져오기](data-analysis-work-with-data-sources.md) 참조
* Kotlin 데이터 과학 및 분석에 사용할 수 있는 도구와 리소스에 대한 광범위한 개요는 [데이터 분석을 위한 Kotlin 및 Java 라이브러리](data-analysis-libraries.md) 참조