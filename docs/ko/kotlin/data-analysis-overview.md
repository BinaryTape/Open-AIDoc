[//]: # (title: 데이터 분석을 위한 Kotlin)
<web-summary>Kotlin DataFrame과 Kandy를 사용하여 데이터를 가져오고, 변환하고, 분석하며, 시각화하는 등 데이터 분석에 Kotlin을 활용하는 방법을 알아봅니다.</web-summary>

데이터를 탐색하고 분석하는 일은 매일 하지는 않더라도, 소프트웨어 개발자에게 꼭 필요한 핵심 역량입니다. 

데이터 분석이 핵심이 되는 소프트웨어 개발 업무를 몇 가지 떠올려 보겠습니다. 디버깅 시 컬렉션 내부에 실제로 어떤 데이터가 들어 있는지 분석하거나, 메모리 덤프나 데이터베이스를 자세히 조사하거나, REST API 작업을 진행하며 대량의 데이터가 담긴 JSON 파일을 처리하는 등의 상황이 있습니다.

[Kotlin DataFrame](#kotlin-dataframe) 및 [Kandy](#kandy)와 같은 Kotlin의 탐색적 데이터 분석(Exploratory Data Analysis, EDA) 도구를 사용하면, 분석 역량을 강화하고 다양한 시나리오를 해결할 수 있는 풍부한 기능들을 활용할 수 있습니다.

* **다양한 형식의 데이터 로드, 변환 및 시각화:** Kotlin EDA 도구를 사용하면 데이터 필터링, 정렬, 집계와 같은 작업을 수행할 수 있습니다. 이 도구들을 통해 CSV, JSON, SQL 데이터베이스, Parquet 파일 등 다양한 데이터 소스로부터 IDE 내에서 바로 원활하게 데이터를 읽어올 수 있습니다.
지원되는 모든 형식은 [DataFrame 문서](https://kotlin.github.io/dataframe/data-sources.html)에서 확인할 수 있습니다.

    시각화 도구인 Kandy를 사용하면 다양한 차트를 생성하여 데이터셋을 시각화하고 인사이트를 얻을 수 있습니다.

* **관계형 데이터베이스에 저장된 데이터의 효율적인 분석:** Kotlin DataFrame은 데이터베이스와 원활하게 통합되며, SQL 쿼리와 유사한 기능을 제공합니다.
다양한 데이터베이스에서 직접 데이터를 가져오고, 조작하며, 시각화할 수 있습니다.

* **웹 API를 통한 실시간 및 동적 데이터셋 가져오기 및 분석:** EDA 도구의 유연성 덕분에 OpenAPI와 같은 프로토콜을 통해 외부 API와 연동할 수 있습니다.
이 기능을 사용하면 웹 API에서 데이터를 가져온 다음, 필요에 맞게 데이터를 정제하고 변환할 수 있습니다.

## Kotlin DataFrame {id="kotlin-dataframe"}

[Kotlin DataFrame](https://kotlin.github.io/dataframe/overview.html) 라이브러리를 사용하면 Kotlin 프로젝트에서 구조화된 데이터를 다룰 수 있습니다. 데이터 생성 및 정제부터 심층 분석 및 피처 엔지니어링(feature engineering)에 이르기까지 다양한 작업을 지원합니다.

Kotlin DataFrame 라이브러리를 사용하면 CSV, JSON, XLS, XLSX를 포함한 다양한 파일 형식을 다룰 수 있습니다. 또한 SQL 데이터베이스나 API에 연결하는 기능을 제공하여 데이터 검색 과정을 수월하게 만들어 줍니다. 
지원되는 모든 형식은 [DataFrame 문서](https://kotlin.github.io/dataframe/data-sources.html)에서 확인할 수 있습니다.

![Kotlin DataFrame](data-analysis-dataframe-example.png){width=700}

## Kandy {id="kandy"}

[Kandy](https://kotlin.github.io/kandy/welcome.html)는 다양한 유형의 차트를 그릴 수 있는 강력하고 유연한 DSL을 제공하는 오픈 소스 Kotlin 라이브러리입니다.
이 라이브러리는 데이터를 시각화하기 위한 단순하고 관용적(idiomatic)이며 가독성이 높고 타입 안전(type-safe)한 도구입니다. 또한 Kandy를 Kotlin DataFrame과 손쉽게 결합하여 다양한 데이터 관련 작업을 완료할 수 있습니다.

![Kandy](data-analysis-kandy-example.png){width=700}

## 다음 단계 {id="what-s-next"}

* [Kotlin DataFrame 라이브러리를 사용하여 데이터 가져오기 및 변환하기](data-analysis-work-with-data-sources.md)
* [Kandy 라이브러리를 사용하여 데이터 시각화하기](data-analysis-visualization.md)
* [데이터 분석을 위한 Kotlin 및 Java 라이브러리 자세히 알아보기](data-analysis-libraries.md)