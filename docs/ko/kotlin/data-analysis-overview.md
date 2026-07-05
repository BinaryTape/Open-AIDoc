[//]: # (title: 데이터 분석을 위한 Kotlin)
[//]: # (description: Kotlin DataFrame 및 Kandy를 사용하여 데이터를 검색, 변환, 분석 및 시각화하는 등 데이터 분석을 위해 Kotlin을 사용하는 방법을 알아보세요.)

데이터를 탐색하고 분석하는 일은 매일 수행하는 업무는 아닐 수 있지만, 소프트웨어 개발자로서 갖추어야 할 중요한 기술입니다. 

데이터 분석이 핵심이 되는 소프트웨어 개발 업무를 생각해 보세요. 디버깅 시 컬렉션 내부의 실제 내용 분석, 메모리 덤프 또는 데이터베이스 조사, REST API 작업 시 대량의 데이터가 포함된 JSON 파일 처리 등을 예로 들 수 있습니다.

[Kotlin DataFrame](#kotlin-dataframe) 및 [Kandy](#kandy)와 같은 Kotlin의 탐색적 데이터 분석(EDA, Exploratory Data Analysis) 도구를 사용하면 분석 기술을 향상하고 다양한 시나리오에서 도움을 받을 수 있는 풍부한 기능을 활용할 수 있습니다.

* **다양한 형식의 데이터 로드, 변환 및 시각화:** Kotlin EDA 도구를 사용하여 데이터 필터링, 정렬, 집계(aggregating) 등의 작업을 수행할 수 있습니다. 이 도구들은 CSV, JSON, SQL 데이터베이스, Parquet 파일을 포함한 다양한 데이터 소스의 데이터를 IDE에서 바로 매끄럽게 읽어올 수 있습니다. 지원되는 모든 형식은 [DataFrame 문서](https://kotlin.github.io/dataframe/data-sources.html)에서 확인하세요.

    플로팅(plotting) 도구인 Kandy를 사용하면 다양한 종류의 차트를 생성하여 데이터셋을 시각화하고 통찰을 얻을 수 있습니다.

* **관계형 데이터베이스에 저장된 데이터의 효율적인 분석:** Kotlin DataFrame은 데이터베이스와 매끄럽게 통합되며 SQL 쿼리와 유사한 기능을 제공합니다. 다양한 데이터베이스에서 직접 데이터를 가져오고, 조작하고, 시각화할 수 있습니다.

* **웹 API로부터 실시간 및 동적 데이터셋 가져오기 및 분석:** EDA 도구의 유연성 덕분에 OpenAPI와 같은 프로토콜을 통해 외부 API와 연동할 수 있습니다. 이 기능을 통해 웹 API에서 데이터를 가져온 다음, 필요에 맞게 데이터를 정제하고 변환할 수 있습니다.

## Kotlin DataFrame

[Kotlin DataFrame](https://kotlin.github.io/dataframe/overview.html) 라이브러리를 사용하면 Kotlin 프로젝트에서 구조화된 데이터를 조작할 수 있습니다. 데이터 생성 및 정제부터 심층 분석 및 피처 엔지니어링(feature engineering)까지, 이 라이브러리가 모든 과정을 지원합니다.

Kotlin DataFrame 라이브러리를 사용하면 CSV, JSON, XLS, XLSX를 포함한 다양한 파일 형식을 작업할 수 있습니다. 또한 SQL 데이터베이스나 API에 연결하는 기능도 제공하여 데이터 검색 프로세스를 용이하게 해줍니다. 지원되는 모든 형식은 [DataFrame 문서](https://kotlin.github.io/dataframe/data-sources.html)에서 확인하세요.

![Kotlin DataFrame](data-analysis-dataframe-example.png){width=700}

## Kandy

[Kandy](https://kotlin.github.io/kandy/welcome.html)는 다양한 유형의 차트를 그리기 위한 강력하고 유연한 DSL을 제공하는 오픈 소스 Kotlin 라이브러리입니다. 이 라이브러리는 데이터를 시각화하기 위한 단순하고, 관용적(idiomatic), 읽기 쉽고, 타입 안전한(type-safe) 도구입니다. 또한 Kandy와 Kotlin DataFrame 라이브러리를 쉽게 결합하여 다양한 데이터 관련 작업을 완료할 수 있습니다.

![Kandy](data-analysis-kandy-example.png){width=700}

## 다음 단계

* [Kotlin DataFrame 라이브러리를 사용하여 데이터 검색 및 변환하기](data-analysis-work-with-data-sources.md)
* [Kandy 라이브러리를 사용하여 데이터 시각화하기](data-analysis-visualization.md)
* [데이터 분석을 위한 Kotlin 및 Java 라이브러리에 대해 더 알아보기](data-analysis-libraries.md)