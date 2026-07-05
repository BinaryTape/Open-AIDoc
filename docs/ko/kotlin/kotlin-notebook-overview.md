[//]: # (title: Kotlin 노트북)
[//]: # (description: IntelliJ IDEA에서 대화형 Kotlin 노트북을 생성 및 편집하여 코드를 실행하고, 데이터를 시각화하며, 아이디어를 프로토타이핑하고, 결과를 공유하세요.)

> IntelliJ IDEA 2026.2부터 Kotlin 노트북은 더 이상 IDE에 번들로 포함되지 않으며 JetBrains에서 공식적으로 지원하지 않습니다.
> 소스 코드는 [GitHub](https://github.com/Kotlin/kotlin-notebook)에서 계속 확인할 수 있습니다.
>
> [블로그 포스트](https://blog.jetbrains.com/idea/2026/06/kotlin-notebook-sunset/)에서 더 자세히 알아보세요.
>
{style="note"}

Kotlin 노트북(Kotlin Notebook)은 Kotlin의 모든 기능을 활용하여 노트북을 생성하고 편집할 수 있는 대화형 환경을 제공합니다.

노트북은 실행 가능한 Kotlin 코드와 텍스트, 결과, 시각화 자료를 혼합할 수 있는 대화형 문서입니다. 
코드를 셀(cell) 단위로 구성하고, 마크다운(Markdown)으로 문서화하며, 텍스트부터 차트(plot)까지의 출력을 코드를 실행한 즉시 나란히 표시할 수 있는 기능이 확장된 Kotlin REPL이라고 생각하면 됩니다.

IntelliJ IDEA 에코시스템 내에서 Kotlin 코드를 개발 및 실험하고, 즉각적인 출력을 확인하며, 코드, 시각화 자료, 텍스트를 통합할 수 있는 원활한 코딩 환경을 경험해 보세요.

![Kotlin Notebook](data-analysis-notebook.gif){width=700}

Kotlin Notebook 플러그인은 다음과 같이 개발 프로세스를 향상시키는 [다양한 기능](https://www.jetbrains.com/help/idea/kotlin-notebook.html)을 제공합니다.

* 셀 내에서 API 접근
* 몇 번의 클릭만으로 파일 가져오기 및 내보내기
* 빠른 프로젝트 탐색을 위한 REPL 명령 사용
* 풍부한 출력 형식 세트 제공
* 애노테이션 또는 Gradle과 유사한 구문을 사용한 직관적인 의존성 관리
* 한 줄의 코드로 다양한 라이브러리를 가져오거나 프로젝트에 새 라이브러리 추가
* 오류 메시지 및 트레이스백(traceback)을 통한 디버깅 인사이트 확보

Kotlin 노트북은 [Jupyter 노트북용 Kotlin 커널(Kotlin Kernel for Jupyter Notebooks)](https://github.com/Kotlin/kotlin-jupyter?tab=readme-ov-file#kotlin-kernel-for-ipythonjupyter)을 기반으로 하므로, 다른 Kotlin 노트북 솔루션과 쉽게 통합할 수 있습니다. 
호환성 문제 없이 Kotlin 노트북, [Datalore](https://datalore.jetbrains.com/), 그리고 [Kotlin-Jupyter 노트북](https://github.com/Kotlin/kotlin-jupyter) 간에 작업을 손쉽게 공유할 수 있습니다.

이러한 기능을 통해 간단한 코드 실험부터 포괄적인 데이터 프로젝트에 이르기까지 폭넓은 작업을 시작할 수 있습니다. 

## 데이터 분석 및 시각화

예비 데이터 탐색을 수행하든, 엔드 투 엔드(end-to-end) 데이터 분석 프로젝트를 완료하든, Kotlin 노트북은 여러분에게 적합한 도구를 갖추고 있습니다.

Kotlin 노트북 내에서는 데이터를 검색, 변환, 시각화 및 모델링할 수 있는 [라이브러리](data-analysis-libraries.md)를 직관적으로 통합하고 작업 결과를 즉시 확인할 수 있습니다.

분석 관련 작업의 경우, [Kotlin DataFrame](https://kotlin.github.io/dataframe/overview.html) 라이브러리가 강력한 솔루션을 제공합니다. 이 라이브러리는 구조화된 데이터를 로드, 생성, 필터링 및 정제하는 과정을 용이하게 해줍니다.

또한 Kotlin DataFrame은 SQL 데이터베이스와의 원활한 연결을 지원하며 CSV, JSON, TXT 등 다양한 파일 형식의 데이터를 IDE에서 바로 읽어올 수 있습니다. 
지원되는 모든 형식은 [DataFrame 문서](https://kotlin.github.io/dataframe/data-sources.html)에서 확인하세요.

오픈 소스 Kotlin 라이브러리인 [Kandy](https://kotlin.github.io/kandy/welcome.html)를 사용하면 다양한 유형의 차트를 생성할 수 있습니다. 
Kandy의 관용적(idiomatic)이고 가독성이 높으며 타입 안정성(type-safe)을 갖춘 기능들을 통해 데이터를 효과적으로 시각화하고 가치 있는 인사이트를 얻을 수 있습니다.

![data-analytics-and-visualization](data-analysis-kandy-example.png){width=700}

## 프로토타이핑

Kotlin 노트북은 코드를 작은 단위로 실행하고 결과를 실시간으로 확인할 수 있는 대화형 환경을 제공합니다. 
이러한 실무적인 접근 방식은 프로토타이핑 단계에서 빠른 실험과 반복을 가능하게 합니다.

Kotlin 노트북의 도움을 받아 아이디어 구상 초기 단계에서 솔루션의 개념을 테스트할 수 있습니다. 또한 Kotlin 노트북은 협업 및 재현 가능한 작업을 지원하여 새로운 아이디어의 생성과 평가를 가능하게 합니다.

![kotlin-notebook-prototyping](kotlin-notebook-prototyping.png){width=700}

## 백엔드 개발

Kotlin 노트북은 셀 내에서 API를 호출하고 OpenAPI와 같은 프로토콜을 사용하는 기능을 제공합니다. 
외부 서비스 및 API와 상호작용하는 이러한 기능은 노트북 환경 내에서 직접 정보를 검색하고 JSON 파일을 읽는 것과 같은 특정 백엔드 개발 시나리오에서 유용하게 활용될 수 있습니다.

![kotlin-notebook-backend-development](kotlin-notebook-backend-development.png){width=700}

## 코드 문서화

Kotlin 노트북에서는 코드 셀 내에 인라인 주석과 텍스트 애노테이션을 포함하여 코드 스니펫과 관련된 추가 컨텍스트, 설명 및 지침을 제공할 수 있습니다.

또한 헤더, 목록, 링크, 이미지 등 풍부한 서식 옵션을 지원하는 마크다운 셀에 텍스트를 작성할 수 있습니다. 
마크다운 셀을 렌더링하고 형식이 지정된 텍스트를 보려면 코드 셀과 마찬가지로 해당 셀을 실행하기만 하면 됩니다.

![kotlin-notebook-documenting](kotlin-notebook-documentation.png){width=700}

## 코드 및 출력 공유

Kotlin 노트북은 보편적인 Jupyter 형식을 따르므로, 서로 다른 노트북 간에 코드와 출력을 공유할 수 있습니다. 
[Jupyter Notebook](https://jupyter.org/) 또는 [Jupyter Lab](https://jupyterlab.readthedocs.io/en/latest/)과 같은 모든 Jupyter 클라이언트에서 Kotlin 노트북을 열고 편집하고 실행할 수 있습니다.

또한 `.ipynb` 노트북 파일을 노트북 웹 뷰어와 공유하여 작업을 배포할 수 있습니다. 한 가지 옵션은 이 형식을 기본적으로 렌더링하는 [GitHub](https://github.com/)입니다. 
또 다른 옵션은 [JetBrains의 Datalore](https://datalore.jetbrains.com/) 플랫폼으로, 예약된 노트북 실행과 같은 고급 기능을 통해 노트북을 공유, 실행 및 편집하는 데 도움을 줍니다.

![kotlin-notebook-sharing-datalore](kotlin-notebook-sharing-datalore.png){width=700}

또는 현재 노트북을 [GitHub Gist](https://gist.github.com/)로 빠르게 공유할 수도 있습니다. 
툴바에서 **Create Gist** 버튼을 클릭하세요.

![notebook-github-gist](notebook-github-gist.png){width=400}

IntelliJ IDEA는 노트북을 사용자의 GitHub 계정에 Gist로 내보내고, 노트북을 공유, 확인 및 다운로드할 수 있는 URL을 제공합니다. 

Gist는 노트북의 모든 코드, 출력 및 마크다운을 JSON 형식으로 보존하며, GitHub은 이를 미리 보기로 렌더링할 수 있습니다. 

## 다음 단계

* [Kotlin 노트북의 사용법과 주요 기능에 대해 알아보세요.](https://www.jetbrains.com/help/idea/kotlin-notebook.html)
* [Kotlin 노트북을 직접 시도해 보세요.](get-started-with-kotlin-notebooks.md)
* [데이터 분석을 위한 Kotlin에 대해 자세히 알아보세요.](data-analysis-overview.md)