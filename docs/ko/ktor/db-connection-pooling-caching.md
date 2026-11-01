[//]: # (title: 커넥션 풀링 및 캐싱)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="tutorial-website-interactive-persistence-advanced"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
<b>사용된 라이브러리</b>: <a href="https://github.com/brettwooldridge/HikariCP">HikariCP</a>, <a href="https://www.ehcache.org/">Ehcache</a>
</p>
</tldr>

<link-summary>데이터베이스 커넥션 풀링 및 캐싱을 구현하는 방법을 알아봅니다.</link-summary>

[이전 튜토리얼](db-persistence.md)에서는 Exposed 프레임워크를 사용하여 웹사이트에 영속성(persistence)을 추가했습니다.
이번 튜토리얼에서는 HikariCP와 Ehcache 라이브러리를 각각 사용하여 데이터베이스 커넥션 풀링과 캐싱을 구현하는 방법을 살펴보겠습니다.

## 의존성 추가 {id="add-dependencies"}

먼저 HikariCP와 Ehcache 라이브러리의 의존성을 추가해야 합니다.
`gradle/libs.versions.toml` 파일을 열고 라이브러리 버전과 별칭(alias)을 정의합니다.

```toml
[versions]
ehcache = "3.10.8"
hikaricp = "5.1.0"
[libraries]
ehcache = { module = "org.ehcache:ehcache", version.ref = "ehcache" }
hikaricp = { module = "com.zaxxer:HikariCP", version.ref = "hikaricp" }
```

그런 다음 `build.gradle.kts`를 열고 다음 의존성을 추가합니다.

```kotlin
dependencies {
    implementation(libs.hikaricp)
    implementation(libs.ehcache)
}
```

`build.gradle.kts` 파일의 오른쪽 상단에 있는 **Load Gradle Changes** 아이콘을 클릭하여 새로 추가된 의존성을 설치합니다.

## 커넥션 풀링 {id="connection-pooling"}

Exposed는 각 `transaction` 호출 내에서 해당 `transaction` 범위의 데이터베이스 첫 번째 작업을 수행할 때 새로운 JDBC 커넥션을 시작합니다.
하지만 여러 JDBC 커넥션을 수립하는 것은 리소스 비용이 많이 듭니다. 기존 커넥션을 재사용하면 성능을 향상시킬 수 있습니다.
_커넥션 풀링(connection pooling)_ 메커니즘이 바로 이 문제를 해결합니다.

이 섹션에서는 HikariCP 프레임워크를 사용하여 애플리케이션에서 JDBC 커넥션 풀링을 관리해 보겠습니다.

### 연결 설정을 구성 파일로 추출하기 {id="connection-settings-config"}

[이전 튜토리얼](db-persistence.md#connect_db)에서는 데이터베이스 연결을 설정하기 위해 `com/example/dao/DatabaseSingleton.kt` 파일에 하드코딩된 `driverClassName`과 `jdbcURL`을 사용했습니다.

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DatabaseSingleton.kt" include-lines="10-12,17"}

데이터베이스 연결 설정을 [커스텀 구성 그룹](server-configuration-file.topic)으로 추출해 보겠습니다.

1. `src/main/resources/application.conf` 파일을 열고 `ktor` 그룹 외부에 다음과 같이 `storage` 그룹을 추가합니다.

   ```kotlin
   ```
   {src="snippets/tutorial-website-interactive-persistence-advanced/src/main/resources/application.conf" include-lines="11-14,16"}

2. `com/example/dao/DatabaseSingleton.kt`를 열고 구성 파일에서 저장소 설정을 로드하도록 `init` 함수를 업데이트합니다.

   ```kotlin
   ```
   {src="snippets/tutorial-website-interactive-persistence-advanced/src/main/kotlin/com/example/dao/DatabaseSingleton.kt" include-lines="5,10-18,23,39"}
   
   이제 `init` 함수는 `ApplicationConfig`를 받아 `config.property`를 사용하여 커스텀 설정을 로드합니다.

3. 마지막으로 `com/example/Application.kt`를 열고 `environment.config`를 `DatabaseSingleton.init`에 전달하여 애플리케이션 시작 시 연결 설정을 로드합니다.

   ```kotlin
   ```
   {src="snippets/tutorial-website-interactive-persistence-advanced/src/main/kotlin/com/example/Application.kt" include-lines="9-13"}

### 커넥션 풀링 활성화하기 {id="enable-connection-pooling"}

Exposed에서 커넥션 풀링을 활성화하려면 `Database.connect` 함수의 파라미터로 [DataSource](https://docs.oracle.com/en/java/javase/19/docs/api/java.sql/javax/sql/DataSource.html)를 제공해야 합니다.
HikariCP는 `DataSource` 인터페이스를 구현하는 `HikariDataSource` 클래스를 제공합니다.

1. `HikariDataSource`를 생성하기 위해 `com/example/dao/DatabaseSingleton.kt`를 열고 `DatabaseSingleton` 객체에 `createHikariDataSource` 함수를 추가합니다.

   ```kotlin
   ```
   {src="snippets/tutorial-website-interactive-persistence-advanced/src/main/kotlin/com/example/dao/DatabaseSingleton.kt" include-lines="4,11-12,25-35,39"}

   다음은 데이터 소스 설정에 대한 몇 가지 참고 사항입니다.
     - `createHikariDataSource` 함수는 드라이버 클래스 이름과 데이터베이스 URL을 파라미터로 받습니다.
     - `maximumPoolSize` 속성은 커넥션 풀이 도달할 수 있는 최대 크기를 지정합니다.
     - `isAutoCommit`과 `transactionIsolation`은 Exposed에서 사용하는 기본 설정과 일치하도록 설정됩니다.

2. `HikariDataSource`를 사용하려면 이를 `Database.connect` 함수에 전달합니다.

   ```kotlin
   ```
   {src="snippets/tutorial-website-interactive-persistence-advanced/src/main/kotlin/com/example/dao/DatabaseSingleton.kt" include-lines="12-13,19,23,39"}

   이제 [애플리케이션을 실행](db-persistence.md#run_app)하여 모든 것이 이전과 동일하게 작동하는지 확인할 수 있습니다.

## 캐싱 {id="caching"}

데이터베이스에 데이터베이스 캐시를 보완하여 사용할 수 있습니다.
캐싱은 자주 사용되는 데이터를 임시 메모리에 저장할 수 있게 해주는 기술로, 데이터베이스의 부하를 줄이고 빈번하게 필요한 데이터를 읽는 시간을 단축할 수 있습니다.

이 튜토리얼에서는 Ehcache 라이브러리를 사용하여 캐시를 파일 형태로 구성해 보겠습니다.

### 구성에 캐시 파일 경로 추가하기 {id="cache-file-path"}

`src/main/resources/application.conf` 파일을 열고 `storage` 그룹에 `ehcacheFilePath` 속성을 추가합니다.

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence-advanced/src/main/resources/application.conf" include-lines="11,15-16"}

이 속성은 캐시 데이터를 저장하는 데 사용되는 파일 경로를 지정합니다.
이 속성은 나중에 캐시와 연동하기 위한 `DAOFacade` 구현체를 구성할 때 사용합니다.

### 캐싱 구현하기 {id="implement-caching"}

캐싱을 구현하려면, 캐시에서 값을 반환하고 캐시된 값이 없는 경우 데이터베이스 인터페이스로 위임하는 또 다른 `DAOFacade` 구현체를 제공해야 합니다.

1. `com.example.dao` 패키지에 새 `DAOFacadeCacheImpl.kt` 파일을 생성하고 다음 구현을 추가합니다.

   ```kotlin
   ```
   {src="snippets/tutorial-website-interactive-persistence-advanced/src/main/kotlin/com/example/dao/DAOFacadeCacheImpl.kt" include-lines="1-28,51"}

   다음은 이 코드 예제에 대한 간략한 개요입니다.
     - 캐시를 초기화하고 구성하기 위해 Ehcache의 `CacheManager` 인스턴스를 정의합니다. 디스크 스토리지로 사용할 루트 디렉터리로 `storagePath`를 제공합니다.
     - 기사(article)를 ID별로 저장하는 엔트리 캐시를 생성합니다. `articlesCache`는 `Int` 키를 `Article` 값에 매핑합니다.
     - 그런 다음 로컬 메모리 및 디스크 리소스에 대한 크기 제약 조건을 제공합니다. 이러한 파라미터에 대한 자세한 내용은 [Ehcache 문서](https://www.ehcache.org/documentation/2.8/configuration/cache-size.html)에서 확인할 수 있습니다.
     - 마지막으로 제공된 이름, 키 및 값 유형을 사용하여 `cacheManager.getCache()`를 호출함으로써 생성된 캐시를 가져옵니다.

2. 캐시에서 사용하려면 `Article` 클래스가 직렬화 가능해야 하며 `java.io.Serializable`을 구현해야 합니다.
   `com/example/models/Article.kt`를 열고 다음과 같이 코드를 업데이트합니다.

   ```kotlin
   ```
   {src="snippets/tutorial-website-interactive-persistence-advanced/src/main/kotlin/com/example/models/Article.kt" include-lines="4-6"}

3. 이제 `DAOFacade`의 멤버들을 구현할 준비가 되었습니다.
   `DAOFacadeCacheImpl.kt`로 돌아가 다음 메서드들을 추가합니다.

   ```kotlin
   ```
   {src="snippets/tutorial-website-interactive-persistence-advanced/src/main/kotlin/com/example/dao/DAOFacadeCacheImpl.kt" include-lines="30-50"}

   - `allArticles`: 모든 기사를 캐시하려고 하지는 않으며, 메인 데이터베이스로 이를 위임합니다.
   - `article`: 기사를 가져올 때 먼저 캐시에 존재하는지 확인하고, 없는 경우에만 메인 `DAOFacade`로 위임하는 동시에 해당 기사를 캐시에 추가합니다.
   - `addNewArticle`: 새 기사를 추가할 때 메인 `DAOFacade`로 위임하지만, 해당 기사를 캐시에도 추가합니다.
   - `editArticle`: 기존 기사를 수정할 때 캐시와 데이터베이스를 모두 업데이트합니다.
   - `deleteArticle`: 삭제 시 캐시와 메인 데이터베이스 양쪽 모두에서 기사를 삭제해야 합니다.

### DAOFacadeCacheImpl 초기화하기 {id="init-dao-facade"}

`DAOFacadeCacheImpl`의 인스턴스를 생성하고, 애플리케이션이 시작되기 전에 데이터베이스에 삽입될 샘플 기사를 추가해 보겠습니다.

1. 먼저 `DAOFacadeImpl.kt` 파일을 열고 파일 하단에 있는 `dao` 변수 초기화 코드를 제거합니다.

2. 그런 다음 `com/example/plugins/Routing.kt`를 열고 `configureRouting` 블록 내부에서 `dao` 변수를 초기화합니다.

   ```kotlin
   ```
   {src="snippets/tutorial-website-interactive-persistence-advanced/src/main/kotlin/com/example/plugins/Routing.kt" include-lines="11-24,73"}

   이제 모든 설정이 끝났습니다.
   [애플리케이션을 실행](db-persistence.md#run_app)하여 모든 것이 이전과 동일하게 작동하는지 확인할 수 있습니다.

> 커넥션 풀링과 캐싱이 적용된 전체 예제는 여기에서 확인할 수 있습니다: [tutorial-website-interactive-persistence-advanced](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/tutorial-website-interactive-persistence-advanced).