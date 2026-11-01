[//]: # (title: Exposed를 사용한 데이터베이스 영속성)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="tutorial-website-interactive-persistence"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
<b>사용된 라이브러리</b>: <a href="https://github.com/JetBrains/Exposed">Exposed</a>, <a href="https://github.com/h2database/h2database">h2database</a>
</p>
</tldr>

<link-summary>Exposed ORM 프레임워크를 사용하여 웹사이트에 데이터 영속성을 추가하는 방법을 알아봅니다.</link-summary>

이 튜토리얼 시리즈에서는 Ktor로 간단한 블로그 애플리케이션을 구축하는 방법을 설명합니다.
- 첫 번째 튜토리얼에서는 이미지 및 HTML 페이지와 같은 정적 콘텐츠를 호스팅하는 방법을 살펴보았습니다.
- 두 번째 튜토리얼에서는 FreeMarker 템플릿 엔진을 사용하여 애플리케이션에 상호작용 기능을 추가했습니다.
- **이번 튜토리얼**에서는 Exposed 프레임워크를 사용하여 웹사이트에 영속성(persistence)을 추가합니다. 기사를 저장하기 위해 로컬 H2 데이터베이스를 사용할 것입니다.
- [다음 튜토리얼](db-connection-pooling-caching.md)에서는 HikariCP 및 Ehcache 라이브러리를 각각 사용하여 데이터베이스 커넥션 풀링과 캐싱을 구현하는 방법을 살펴봅니다.

## 의존성 추가 {id="add-dependencies"}

먼저 Exposed 및 H2 라이브러리에 대한 의존성을 추가해야 합니다. `gradle/libs.versions.toml` 파일을 열고 라이브러리 버전과 별칭(alias)을 정의합니다.

```toml
[versions]
exposed = "1.6.0"
h2 = "2.4.240"
[libraries]
exposed-core = { module = "org.jetbrains.exposed:exposed-core", version.ref = "exposed" }
exposed-dao = { module = "org.jetbrains.exposed:exposed-dao", version.ref = "exposed" }
exposed-jdbc = { module = "org.jetbrains.exposed:exposed-jdbc", version.ref = "exposed" }
h2 = { module = "com.h2database:h2", version.ref = "h2" }
```

그런 다음 `build.gradle.kts`를 열고 다음 의존성을 추가합니다.

```kotlin
dependencies {
    implementation(libs.exposed.core)
    implementation(libs.exposed.dao)
    implementation(libs.exposed.jdbc)
    implementation(libs.h2)
}
```

새로 추가된 의존성을 설치하려면 `build.gradle.kts` 파일의 오른쪽 상단에 있는 **Load Gradle Changes** 아이콘을 클릭합니다.

## 모델 업데이트 {id="model"}

Exposed는 데이터베이스 테이블로 `org.jetbrains.exposed.sql.Table` 클래스를 사용합니다. `Article` 모델을 업데이트하려면 `models/Article.kt` 파일을 열고 기존 코드를 다음과 같이 교체합니다.

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/models/Article.kt"}

`id`, `title`, `body` 컬럼에는 기사에 대한 정보가 저장됩니다. `id` 컬럼은 기본 키(primary key) 역할을 합니다. 

> `Articles` 객체의 프로퍼티 [타입을 살펴보면](https://www.jetbrains.com/help/idea/viewing-reference-information.html#type-info), 필요한 타입 인자가 지정된 `Column` 타입임을 확인할 수 있습니다. `id`는 `Column<Int>` 타입이고, `title`과 `body`는 모두 `Column<String>` 타입입니다.
> 
{type="tip"}

## 데이터베이스 연결 {id="connect_db"}

[데이터 접근 객체](https://en.wikipedia.org/wiki/Data_access_object)(Data Access Object, DAO)는 특정 데이터베이스의 세부 구현을 노출하지 않고 데이터베이스에 대한 인터페이스를 제공하는 패턴입니다. 나중에 데이터베이스에 대한 구체적인 요청을 추상화하기 위해 `DAOFacade` 인터페이스를 정의할 것입니다.

Exposed를 사용하는 모든 데이터베이스 작업은 데이터베이스 연결을 얻는 것으로 시작합니다. 이를 위해 JDBC URL과 드라이버 클래스 이름을 `Database.connect` 함수에 전달합니다. `com.example` 내에 `dao` 패키지를 생성하고 새 `DatabaseSingleton.kt` 파일을 추가합니다. 그런 다음 아래 코드를 삽입합니다.

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DatabaseSingleton.kt" include-lines="1-13,17,21"}

> 여기서는 `driverClassName`과 `jdbcURL`이 하드코딩되어 있습니다. Ktor를 사용하면 이러한 설정을 [커스텀 구성 그룹](server-configuration-file.topic)으로 추출할 수 있습니다.

### 테이블 생성 {id="create_table"}

연결을 얻은 후에는 모든 SQL 문을 트랜잭션 내에 배치해야 합니다. 

```kotlin
fun init() {
    // ...
    val database = Database.connect(jdbcURL, driverClassName)
    transaction(database) {
        // 여기에 구문 작성
    }
}
```

이 코드 예제에서는 기본 데이터베이스가 `transaction` 함수에 명시적으로 전달됩니다. 데이터베이스가 하나만 있는 경우에는 생략할 수 있습니다. 이 경우 Exposed는 트랜잭션에 마지막으로 연결된 데이터베이스를 자동으로 사용합니다.

> `Database.connect` 함수는 트랜잭션을 호출하기 전까지는 실제 데이터베이스 연결을 설정하지 않으며, 향후 연결을 위한 디스크립터(descriptor)만 생성한다는 점에 유의하세요.

`Articles` 테이블이 이미 선언되어 있으므로, `init` 함수 하단에서 `transaction` 호출로 감싼 `SchemaUtils.create(Articles)`를 호출하여 테이블이 아직 없는 경우 데이터베이스에 이 테이블을 생성하도록 지시할 수 있습니다.

```kotlin
fun init() {
    // ...
    val database = Database.connect(jdbcURL, driverClassName)
    transaction(database) {
        SchemaUtils.create(Articles)
    }
}
```

### 쿼리 실행 {id="queries"}

편의를 위해 향후 모든 데이터베이스 요청에 사용할 유틸리티 함수 `dbQuery`를 `DatabaseSingleton` 객체 내에 만들어 보겠습니다. 트랜잭션을 블로킹 방식으로 접근하는 대신, 코루틴의 이점을 활용하여 각 쿼리를 자체 코루틴에서 시작합니다.

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DatabaseSingleton.kt" include-lines="19-20"}

완성된 `DatabaseSingleton.kt` 파일은 다음과 같습니다.

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DatabaseSingleton.kt"}

### 시작 시 데이터베이스 설정 로드 {id="startup"}

마지막으로, 애플리케이션 시작 시 생성한 설정을 로드해야 합니다. `Application.kt`를 열고 `Application.module` 본문에서 `DatabaseSingleton.init`을 호출합니다.

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/Application.kt" include-lines="3,8-13"}

## 영속성 로직 구현 {id="persistence_logic"}

이제 기사를 업데이트하는 데 필요한 작업을 추상화할 인터페이스를 만들어 보겠습니다. `dao` 패키지 안에 `DAOFacade.kt` 파일을 생성하고 다음 코드를 입력합니다.

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DAOFacade.kt"}

모든 기사 목록 조회, ID로 특정 기사 조회, 새 기사 추가, 수정 및 삭제 작업이 필요합니다. 이러한 모든 함수는 내부적으로 데이터베이스 쿼리를 수행하므로 일시 중단 함수(suspending functions)로 정의됩니다.

`DAOFacade` 인터페이스를 구현하려면 인터페이스 이름에 커서를 두고 옆에 표시되는 노란색 전구 아이콘을 클릭한 다음 **Implement interface**를 선택합니다. 나타나는 대화 상자에서 기본 설정을 유지하고 **OK**를 클릭합니다. 

**Implement Members** 대화 상자에서 모든 함수를 선택하고 **OK**를 클릭합니다. 

![Implement Members](tutorial_persistence_implement_members.png){width="451"}

IntelliJ IDEA가 `dao` 패키지 안에 `DAOFacadeImpl.kt` 파일을 생성합니다. 이제 Exposed DSL을 사용하여 모든 함수를 구현해 보겠습니다.

### 모든 기사 가져오기 {id="get_all"}

모든 항목을 반환하는 함수부터 시작하겠습니다. 요청은 `dbQuery` 호출로 래핑됩니다. 데이터베이스에서 모든 데이터를 가져오기 위해 `Table.selectAll` 확장 함수를 호출합니다. `Articles` 객체는 `Table`의 하위 클래스이므로 Exposed DSL 메서드를 사용하여 작업할 수 있습니다.

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DAOFacadeImpl.kt" include-lines="1-18,45"}

`Table.selectAll`은 `Query` 인스턴스를 반환하므로, `Article` 인스턴스 목록을 얻으려면 각 행의 데이터를 수동으로 추출하여 데이터 클래스로 변환해야 합니다. 이는 `ResultRow`로부터 `Article`을 생성하는 헬퍼 함수 `resultRowToArticle`을 사용하여 수행합니다.

`ResultRow`는 간결한 `get` 연산자를 사용하여 지정된 `Column`에 저장된 데이터를 가져오는 방법을 제공하므로 배열이나 맵과 유사하게 대괄호 구문을 사용할 수 있습니다.

> `Articles.id`의 타입은 `Column<Int>`이며, 이는 `Expression` 인터페이스를 구현합니다. 따라서 모든 컬럼을 표현식으로 전달할 수 있습니다.

### 특정 기사 가져오기 {id="get_article"}

이제 기사 하나를 반환하는 함수를 구현해 보겠습니다.

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DAOFacadeImpl.kt" include-lines="20-25"}

`select` 함수는 확장 람다를 인자로 받습니다. 이 람다 내부의 암시적 수신 객체(implicit receiver)는 `SqlExpressionBuilder` 타입입니다. 이 타입을 직접 사용할 일은 없지만, 쿼리를 빌드하는 데 유용한 다양한 컬럼 연산을 정의하고 있습니다. 비교 연산(`eq`, `less`, `greater`), 산술 연산(`plus`, `times`), 제공된 값 목록에 값이 포함되는지 여부 확인(`inList`, `notInList`), 값이 null인지 아닌지 확인하는 등의 작업을 사용할 수 있습니다.

`select`는 `Query` 값의 목록을 반환합니다. 이전과 마찬가지로 이를 기사로 변환합니다. 여기서는 기사가 하나여야 하므로 결과로 하나만 반환합니다.

### 새 기사 추가 {id="add_article"}

테이블에 새 기사를 삽입하려면 람다 인자를 받는 `Table.insert` 함수를 사용합니다.

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DAOFacadeImpl.kt" include-lines="27-33"}

이 람다 내부에서 어떤 컬럼에 어떤 값을 설정할지 지정합니다. `it` 인자는 `InsertStatement` 타입이며, 컬럼과 값을 인자로 받는 `set` 연산자를 호출할 수 있습니다.

### 기사 수정 {id="edit_article"}

기존 기사를 업데이트하려면 `Table.update`를 사용합니다.

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DAOFacadeImpl.kt" include-lines="35-40"}

### 기사 삭제 {id="delete_article"}

마지막으로, 데이터베이스에서 기사를 제거하려면 `Table.deleteWhere`를 사용합니다.

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DAOFacadeImpl.kt" include-lines="42-44"}

### DAOFacade 초기화 {id="init-dao-facade"}

애플리케이션이 시작되기 전에 `DAOFacade`의 인스턴스를 생성하고 데이터베이스에 삽입될 샘플 기사를 추가해 보겠습니다.
`DAOFacadeImpl.kt` 하단에 다음 코드를 추가합니다.

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DAOFacadeImpl.kt" include-lines="47-53"}

## 라우트 업데이트 {id="update_routes"}

이제 라우트 핸들러 내에서 구현된 데이터베이스 작업을 사용할 준비가 되었습니다.
`plugins/Routing.kt` 파일을 엽니다.
모든 기사를 표시하려면 `get` 핸들러 내부에서 `dao.allArticles`를 호출합니다.

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/plugins/Routing.kt" include-lines="22-24"}

새 기사를 게시하려면 `post` 내부에서 `dao.addNewArticle` 함수를 호출합니다.

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/plugins/Routing.kt" include-lines="28-34"}

조회 및 수정을 위한 기사를 가져오려면 각각 `get("{id}")` 및 `get("{id}/edit")` 내부에서 `dao.article`을 사용합니다.

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/plugins/Routing.kt" include-lines="35-42"}

마지막으로 `post("{id}")` 핸들러로 이동하여 기사를 업데이트하려면 `dao.editArticle`을, 삭제하려면 `dao.deleteArticle`을 사용합니다.

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/plugins/Routing.kt" include-lines="43-58"}

> 이 튜토리얼의 최종 완성 프로젝트는 [tutorial-website-interactive-persistence](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/tutorial-website-interactive-persistence)에서 확인할 수 있습니다.

## 애플리케이션 실행 {id="run_app"}

저널 애플리케이션이 예상대로 동작하는지 확인해 보겠습니다. `Application.kt`의 `fun main(...)` 옆에 있는 **Run** 버튼을 눌러 애플리케이션을 실행할 수 있습니다.

![Run Server](run-app.png){width="706"}

IntelliJ IDEA가 애플리케이션을 시작하고, 몇 초 후에 앱이 실행 중임을 알리는 메시지가 표시됩니다.

```Bash
[main] INFO  Application - Responding at http://0.0.0.0:8080
```

브라우저에서 [`http://localhost:8080/`](http://localhost:8080/)을 열고 기사를 작성, 수정 및 삭제해 보세요. 기사는 `build/db.mv.db` 파일에 저장됩니다. IntelliJ IDEA에서는 [Database 도구 창](https://www.jetbrains.com/help/idea/database-tool-window.html)에서 이 파일의 내용을 확인할 수 있습니다.

![Database tool window](tutorial_persistence_database_tool_window.png){width="706"}