[//]: # (title: Kotlin Notebook)
<web-summary>IntelliJ IDEA에서 대화형 Kotlin 노트북을 생성 및 편집하여 코드를 실행하고, 데이터를 시각화하며, 아이디어를 프로토타이핑하고, 결과를 공유하세요.</web-summary>

> IntelliJ IDEA 2026.2부터 Kotlin Notebook은 더 이상 IDE에 번들로 제공되지 않으며 JetBrains에서 공식적으로 지원하지 않습니다.
> 소스 코드는 [GitHub](https://github.com/Kotlin/kotlin-notebook)에서 계속 이용할 수 있습니다.
>
> 자세한 내용은 [블로그 게시물](https://blog.jetbrains.com/idea/2026/06/kotlin-notebook-sunset/)에서 확인하세요.
>
{style="note"}

Kotlin Notebook은 Kotlin의 역량을 최대한 활용하여 노트북을 생성하고 편집할 수 있는 대화형(interactive) 환경을 제공합니다.

노트북은 실행 가능한 Kotlin 코드와 텍스트, 결과물, 시각화 자료를 함께 구성할 수 있는 대화형 문서입니다.
코드를 셀(cell) 단위로 구성하고, Markdown으로 문서를 작성하며, 텍스트부터 도표까지의 출력 결과를 코드를 생성한 위치 바로 옆에 즉시 표시할 수 있는 기능이 확장된 Kotlin REPL이라고 생각할 수 있습니다.

IntelliJ IDEA 에코시스템 내에서 Kotlin 코드를 개발 및 실험하고, 즉각적인 결과를 확인하며, 코드, 시각 자료, 텍스트를 원활하게 통합하는 매끄러운 코딩 환경을 경험해 보세요.

![Kotlin Notebook](data-analysis-notebook.gif){width=700}

Kotlin Notebook 플러그인은 다음과 같이 개발 프로세스를 향상시키는 [다양한 기능](https://www.jetbrains.com/help/idea/kotlin-notebook.html)을 제공합니다.

* 셀 내에서 API 접근
* 몇 번의 클릭만으로 파일 가져오기 및 내보내기
* 빠른 프로젝트 탐색을 위한 REPL 명령어 사용
* 풍부한 출력 포맷 세트 지원
* 애너테이션 또는 Gradle과 유사한 구문을 통해 직관적으로 종속성 관리
* 한 줄의 코드로 다양한 라이브러리를 가져오거나 프로젝트에 새 라이브러리 추가
* 오류 메시지 및 트레이스백(traceback)을 통한 디버깅 인사이트 획득

Kotlin Notebook은 [Jupyter Notebook용 Kotlin Kernel](https://github.com/Kotlin/kotlin-jupyter?tab=readme-ov-file#kotlin-kernel-for-ipythonjupyter)을 기반으로 하므로 다른 Kotlin 노트북 솔루션과 쉽게 통합할 수 있습니다.
호환성 문제 없이 Kotlin Notebook, [Datalore](https://datalore.jetbrains.com/), [Kotlin-Jupyter Notebook](https://github.com/Kotlin/kotlin-jupyter) 간에 작업 내용을 손쉽게 공유할 수 있습니다.

이러한 기능들을 활용하여 간단한 코드 실험부터 포괄적인 데이터 프로젝트에 이르기까지 폭넓은 작업을 수행할 수 있습니다.

## 데이터 분석 및 시각화 {id="data-analytics-and-visualization"}

예비 데이터 탐색을 수행하든, 엔드투엔드(end-to-end) 데이터 분석 프로젝트를 완료하든, Kotlin Notebook에는 필요한 적절한 도구가 갖추어져 있습니다.

Kotlin Notebook 내에서 작업을 수행하면서 즉각적인 결과를 확인하는 동시에, 데이터를 가져오고, 변환하고, 시각화하며, 모델링할 수 있는 [라이브러리](data-analysis-libraries.md)를 직관적으로 통합할 수 있습니다.

분석 관련 작업의 경우 [Kotlin DataFrame](https://kotlin.github.io/dataframe/overview.html) 라이브러리가 강력한 솔루션을 제공합니다. 이 라이브러리는 구조화된 데이터를 쉽게 로드하고 생성하며 필터링 및 정제할 수 있도록 지원합니다.

또한 Kotlin DataFrame은 SQL 데이터베이스와의 원활한 연결을 지원하며 CSV, JSON, TXT 등 다양한 데이터 소스로부터 IDE 내에서 직접 데이터를 읽어옵니다.
지원되는 모든 형식은 [DataFrame 문서](https://kotlin.github.io/dataframe/data-sources.html)에서 확인하세요.

오픈 소스 Kotlin 라이브러리인 [Kandy](https://kotlin.github.io/kandy/welcome.html)를 사용하면 다양한 유형의 차트를 생성할 수 있습니다.
Kandy의 관용적(idiomatic)이고 가독성이 높으며 타입 안전한(type-safe) 특성을 통해 데이터를 효과적으로 시각화하고 유의미한 인사이트를 얻을 수 있습니다.

![data-analytics-and-visualization](data-analysis-kandy-example.png){width=700}

## 프로토타이핑 {id="prototyping"}

Kotlin Notebook은 코드를 작은 단위로 실행하고 결과를 실시간으로 확인할 수 있는 대화형 환경을 제공합니다.
이러한 실습 중심의 접근 방식은 프로토타이핑 단계에서 빠른 실험과 반복을 가능하게 합니다.

Kotlin Notebook을 활용하면 아이디어 구상 초기 단계에서 솔루션의 개념을 검증할 수 있습니다. 또한 Kotlin Notebook은 협업 가능하고 재현 가능한 작업을 지원하여 새로운 아이디어를 창출하고 평가할 수 있도록 돕습니다.

![kotlin-notebook-prototyping](kotlin-notebook-prototyping.png){width=700}

## 백엔드 개발 {id="backend-development"}

Kotlin Notebook은 셀 내에서 API를 호출하고 OpenAPI와 같은 프로토콜을 다룰 수 있는 기능을 제공합니다.
외부 서비스 및 API와 상호 작용할 수 있는 기능 덕분에 노트북 환경 내에서 직접 정보를 검색하고 JSON 파일을 읽는 등 특정 백엔드 개발 시나리오에서 유용하게 활용할 수 있습니다.

![kotlin-notebook-backend-development](kotlin-notebook-backend-development.png){width=700}

## 코드 문서화 {id="code-documentation"}

Kotlin Notebook에서는 코드 셀 내에 인라인 주석과 텍스트 설명을 추가하여 코드 스니펫과 관련된 추가 컨텍스트, 설명, 지침을 제공할 수 있습니다.

또한 제목, 목록, 링크, 이미지 등 풍부한 서식 옵션을 지원하는 Markdown 셀에 텍스트를 작성할 수도 있습니다.
Markdown 셀을 렌더링하여 서식이 지정된 텍스트를 확인하려면 코드 셀을 실행하듯이 실행하기만 하면 됩니다.

![kotlin-notebook-documenting](kotlin-notebook-documentation.png){width=700}

## 코드 및 결과 공유 {id="sharing-code-and-outputs"}

Kotlin Notebook은 범용 Jupyter 형식을 준수하므로 다른 노트북 간에 코드와 결과를 공유할 수 있습니다.
[Jupyter Notebook](https://jupyter.org/) 또는 [Jupyter Lab](https://jupyterlab.readthedocs.io/en/latest/)과 같은 모든 Jupyter 클라이언트에서 Kotlin Notebook을 열고 편집하며 실행할 수 있습니다.

또한 `.ipynb` 노트북 파일을 모든 노트북 웹 뷰어에 공유하여 작업물을 배포할 수도 있습니다. 한 가지 옵션은 이 형식을 기본적으로 렌더링하는 [GitHub](https://github.com/)입니다. 또 다른 옵션은 예약된 노트북 실행과 같은 고급 기능을 통해 노트북의 공유, 실행 및 편집을 용이하게 해주는 [JetBrains의 Datalore](https://datalore.jetbrains.com/) 플랫폼입니다.

![kotlin-notebook-sharing-datalore](kotlin-notebook-sharing-datalore.png){width=700}

또는 현재 노트북을 [GitHub Gist](https://gist.github.com/)로 빠르게 공유할 수도 있습니다.
툴바에서 **Create Gist** 버튼을 클릭하세요.

![notebook-github-gist](notebook-github-gist.png){width=400}

IntelliJ IDEA가 사용자의 GitHub 계정에 있는 Gist로 노트북을 내보내고, 노트북을 공유, 확인 및 다운로드할 수 있는 URL을 제공합니다.

Gist는 노트북의 모든 코드, 출력 및 Markdown을 JSON 형식으로 보존하며, GitHub에서 이를 미리보기로 렌더링할 수 있습니다.

## 다음 단계 {id="what-s-next"}

* [Kotlin Notebook 사용법 및 주요 기능 알아보기](https://www.jetbrains.com/help/idea/kotlin-notebook.html)
* [Kotlin Notebook 시작해 보기](get-started-with-kotlin-notebooks.md)
* [데이터 분석을 위한 Kotlin 심층 탐구](data-analysis-overview.md)