# 변경 로그

## 미출시(Unreleased)

### 추가됨
- [Native 드라이버] `inMemoryDriver`에 `extendedConfig` 파라미터 추가 (#5539 by @GuilhE)
- [PostgreSQL 다이얼렉트] 암시적으로 정의된 시스템 컬럼(implicitly defined System Columns)에 대한 쿼리 지원 추가 (#5834 by @griffio)
- [PostgreSQL 다이얼렉트] 기본적인 배열 리터럴(Array literal) 지원 추가 (#5997 by @griffio)
- [PostgreSQL 다이얼렉트] 기본적인 LTREE 지원 추가 (#5880 by @yesitskev @griffio)
- [MySQL 다이얼렉트] INET 함수 지원 추가 (#5072 by @mcxinyu)
- [PostgreSQL 다이얼렉트] `ALTER INDEX` 지원 추가 (#6224 by @griffio)
- [SQLite 다이얼렉트] SQLite 3.44 집계 함수 `DISTINCT`, `ORDER BY`, `FILTER` 지원 추가 (#6236 by @griffio)
- [SQLite 다이얼렉트] SQLite 3.37 `STRICT` 테이블 지원 추가 (#6230 by @griffio)
- [Gradle 플러그인] `codegenExcludedColumns`를 사용하여 생성된 모델에서 컬럼을 제외하는 지원 추가 (#6243 by @sokolikp)
- [컴파일러] 스키마에 `allTableNames` 함수 추가 (#6245 by @edenman)
- [PostgreSQL 다이얼렉트] `ANY` 연산자 지원 추가 (#6253 by @griffio)
- [SQLite 다이얼렉트] SQLite 3.39 `RIGHT JOIN` 및 `FULL JOIN` 지원 추가 (#6273 by @griffio)

### 변경됨
- [PostgreSQL 다이얼렉트] `arrayIntermediateType` 가시성을 public으로 변경 (#5835 by @griffio)
- [Gradle 플러그인] 더 엄격한 `MigrationFile` 버전 관리(versioning) 구현 (#5730 by @madisp)
- [Gradle 플러그인] 최소 지원 Gradle 버전을 8.2.1로 상향 (#6217 by @maxsav)
- [Gradle 플러그인] Gradle 격리된 프로젝트(isolated projects) 지원 (#6217 by @maxsav)

### 수정됨
- [컴파일러] 생성된 코드에서 Kotlin 추가 경고(extra warnings) 억제 (#6208 by @eyupcanakman)
- [컴파일러] 그룹화되지 않은 집계 결과 집합(non-grouped aggregate result set)의 다른 컬럼들은 항상 널 허용(nullable)임
- [PostgreSQL 다이얼렉트] `coalesce` 및 `ifnull`에 대한 널 허용 여부(nullability)를 올바르게 해결
- [PostgreSQL 다이얼렉트] PostgreSQL 다이얼렉트의 IDE 통합 수정
- [PostgreSQL 다이얼렉트] PostgreSQL 다이얼렉트용 IDE 플러그인 개선 (#6209 by @griffio)
- [Intellij 플러그인] IDE 플러그인이 모든 다이얼렉트에 대해 코드 완성(code completions)을 수행할 수 있음 (#6210 by @griffio)
- [Gradle 플러그인] 데이터베이스 검증(verify database) 태스크 실행 중 발생하는 순환 의존성(circular dependency) 에러 수정 (#6221 by @griffio)
- [컴파일러] 다중 행 업데이트(multirow update)에 대한 낙관적 락(optimistic lock) 수정 (#6240 by @griffio)
- [Intellij 플러그인] IDEA 2026.2에서 크래시를 유발하는 지원 중단(deprecations) 관련 수정 (#6247 by @griffio)
- [Gradle 플러그인] AGP 8.9에서 8.11 버전까지 Kotlin 컴파일 시 생성된 소스(generated sources)를 인식하지 못하던 문제 수정
- [PostgreSQL 다이얼렉트] Primitive 바운드 인자를 사용할 때 `lower` 및 `upper` 함수의 기본값을 `TEXT`로 설정하도록 수정 (#6262 by @griffio)
- [컴파일러] 어댑터를 사용한 데이터 클래스 바인딩 및 널 허용 여부(nullability)를 변경하는 마이그레이션이 포함된 insert values 수정 (#6269 by griffio)
- [컴파일러] 널 안전 연산자(null safe operators, `IS` 및 `IS DISTINCT FROM`)와 함께 널 허용(nullable) 바인드 인자 사용 (#6265 by @griffio)
- [Gradle 플러그인] 프로젝트 의존성에 대해 AGP의 변형 해결(variant resolution) 사용 (#6217 by @maxsav)
- [Gradle 플러그인] 빌드 간에 AGP 변형 목록이 다를 때 `generateDatabaseInterface`의 빌드 캐시 미스 수정
- [Gradle 플러그인] 데이터베이스를 구성하지 않고 플러그인을 적용했을 때 발생하는 IDE 동기화 크래시 수정 (#6088)
- [PostgreSQL 다이얼렉트] 중첩된 함수 호출을 사용할 때의 JSON 집계 함수 수정 (#6281 by @griffio)
- [Paging3 확장] 빈 데이터베이스에서 `KeyedQueryPagingSource`가 크래시되는 현상 수정 (#6284 by @woods-marshes)
- [컴파일러] `COALESCE`와 같은 캡슐화 함수(encapsulating functions)와 함께 뮤테이터 문(mutator statements)을 사용할 때 발생하는 Java 타입 어댑터 문제 수정 (#6292 by @griffio)

## [2.3.2] - 2026-03-16
[2.3.2]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.2

### 추가됨
- [PostgreSQL 다이얼렉트] `ALTER TABLE ALTER TYPE USING` 표현식 지원 개선 (#6116 by @griffio)
- [PostgreSQL 다이얼렉트] `DROP COLUMN IF EXISTS` 지원 추가 (#6112 by @griffio)
- [Gradle 플러그인] `SELECT` 와일드카드 확장(wildcard expansions)을 비활성화하기 위한 `expandSelectStar` 플래그 추가 (#5813 by @griffio)
- [MySQL 다이얼렉트] 윈도우 함수(Window Functions) 지원 추가 (#6086 by @griffio)
- [Gradle 플러그인] 시작 스키마 버전이 1이 아니고 `verifyMigrations`가 true일 때 발생하는 빌드 실패 수정 (#6017 by @neilgmiller)
- [Gradle 플러그인] `SqlDelightWorkerTask`를 더 유연하게 설정 가능하도록 변경하고, Windows에서의 개발을 지원하도록 기본 설정을 업데이트 (#5215 by @MSDarwish2000)
- [SQLite 다이얼렉트] FTS5 가상 테이블의 합성 컬럼(synthesized columns) 지원 추가 (#5986 by @watbe)
- [PostgreSQL 다이얼렉트] Postgres 행 수준 보안(row level security) 지원 추가 (#6087 by @shellderp)
- [PostgreSQL 다이얼렉트] `FOR UPDATE`가 `OF table`, `NO KEY UPDATE`, `NO WAIT`를 지원하도록 확장 (#6104 by @shellderp)
- [PostgreSQL 다이얼렉트] Postgis Point 타입 및 관련 함수 지원 (#5602 by @vanniktech)
- [런타임] 트랜잭션의 `CoroutineContext`를 제어하는 메커니즘을 제공하는 `SuspendingTransacter.TransactionDispatcher` 추가 (#5967 by @eygraber)
- [Gradle 플러그인] Android Gradle Plugin 9.0의 새로운 DSL과 완전히 호환됨. (#6140)
- [PostgreSQL 다이얼렉트] PostgreSql `CREATE TABLE` 저장 파라미터(storage parameters) 지원 (#6148 by @griffio)
- [PostgreSQL 다이얼렉트] PostgreSql 유니크 테이블 제약 조건의 널 허용 결과 컬럼 수정 (#6167 by @griffio)

### 변경됨
- [컴파일러] 컴파일러 출력 타입을 `java.lang.Void`에서 `kotlin.Nothing`으로 변경 (#6099 by @griffio)
- [컴파일러] 패키지 이름에 언더스코어(_) 사용 허용. 이전에는 언더스코어가 제거되어 예기치 않은 동작이 발생했음 (#6027 by @BierDav)
- [페이징 확장] AndroidX Paging으로 전환 (#5910 by @jeffdgr8)
- [Android 드라이버] Android `minSdk`를 23으로 상향. (#6141)
- [페이징 확장] Paging 3.4.1로 업그레이드 및 X64 Apple 타겟 삭제. (#6166)

### 수정됨
- [IntelliJ 플러그인] VFS 새로고침 이벤트 중 EDT에서 파일 유형 감지를 차단하여 발생하는 IDE 프리징 수정.
- [SQLite 다이얼렉트] Json 경로 연산자 사용 시 SQLite 3.38 컴파일 오류 수정 (#6070 by @griffio)
- [SQLite 다이얼렉트] 커스텀 컬럼 타입을 사용할 때 `group_concat` 함수에 String 타입 사용 (#6082 by @griffio)
- [Gradle 플러그인] 복잡한 스키마에서 중단되지 않도록 `VerifyMigrationTask` 성능 개선 (#6073 by @Lightwood13)
- [Intellij 플러그인] 플러그인 초기화 예외 수정 및 지원 중단된 메서드 업데이트 (#6040 by @griffio)
- [Gradle 플러그인] Android Gradle Plugin의 내장 Kotlin과의 호환성 수정 (#6139)

## [2.3.1] - 2025-03-12
[2.3.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.1

실패한 릴리스입니다. 2.3.2를 사용하세요!

## [2.3.0] - 2025-03-12
[2.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.0

실패한 릴리스입니다. 2.3.2를 사용하세요!

## [2.2.1] - 2025-11-13
[2.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.2.1

### 추가됨
- [PostgreSQL 다이얼렉트] Postgres numeric/integer/biginteger 타입 매핑 수정 (#5994 by @griffio)
- [컴파일러] `CAST`가 필요할 때 소스 파일 위치를 포함하도록 컴파일러 에러 메시지 개선 (#5979 by @griffio)
- [PostgreSQL 다이얼렉트] Postgres JSON 연산자 경로 추출 지원 추가 (#5971 by @griffio)
- [SQLite 다이얼렉트] 공통 테이블 식(Common Table Expressions)을 사용하는 `MATERIALIZED` 쿼리 플래너 힌트에 대한 SQLite 3.35 지원 추가 (#5961 by @griffio)
- [PostgreSQL 다이얼렉트] 공통 테이블 식(Common Table Expressions)을 사용하는 `MATERIALIZED` 쿼리 플래너 힌트 지원 추가 (#5961 by @griffio)
- [PostgreSQL 다이얼렉트] Postgres JSON Aggregate `FILTER` 지원 추가 (#5957 by @griffio)
- [PostgreSQL 다이얼렉트] Postgres Enum 지원 추가 (#5935 by @griffio)
- [PostgreSQL 다이얼렉트] Postgres 트리거(Triggers) 제한적 지원 추가 (#5932 by @griffio)
- [PostgreSQL 다이얼렉트] SQL 표현식을 JSON으로 파싱할 수 있는지 확인하는 조건자(predicate) 추가 (#5843 by @griffio)
- [PostgreSQL 다이얼렉트] PostgreSql `Comment On` 문 제한적 지원 추가 (#5808 by @griffio)
- [MySQL 다이얼렉트] 인덱스 가시성 옵션 지원 추가 (#5785 by @orenkislev-faire)
- [PostgreSql 다이얼렉트] `TSQUERY` 데이터 타입 지원 추가 (#5779 by @griffio)
- [Gradle 플러그인] 모듈 추가 시 버전 카탈로그(version catalogs) 지원 추가 (#5755 by @DRSchlaubi)

### 변경됨
- 개발 중인 스냅샷이 이제 [https://central.sonatype.com/repository/maven-snapshots/](https://central.sonatype.com/repository/maven-snapshots/) 의 Central Portal Snapshots 저장소에 게시됩니다.
- [컴파일러] 생성자 참조(constructor references)를 사용하여 기본 생성 쿼리 단순화 (#5814 by @jonapoul)

### 수정됨
- [컴파일러] 공통 테이블 식(Common Table Expression)을 포함하는 View 사용 시 스택 오버플로(stack overflow) 수정 (#5928 by @griffio)
- [Gradle 플러그인] "New Connection"을 추가하기 위해 SqlDelight 도구 창을 열 때 발생하는 크래시 수정 (#5906 by @griffio)
- [IntelliJ Plugin] copy-to-sqlite 거터 액션(gutter action)에서 스레딩 관련 크래시 방지 (#5901 by @griffio)
- [IntelliJ Plugin] `CREATE INDEX` 및 `CREATE VIEW` 스키마 문 사용 시 PostgreSQL 다이얼렉트 수정 (#5772 by @griffio)
- [컴파일러] 컬럼 참조 시 FTS 스택 오버플로(stack overflow) 수정 (#5896 by @griffio)
- [컴파일러] `With Recursive` 스택 오버플로(stack overflow) 수정 (#5892 by @griffio)
- [컴파일러] `Insert|Update|Delete Returning` 문에 대한 Notify 수정 (#5851 by @griffio)
- [컴파일러] `Long`을 반환하는 트랜잭션 블록의 비동기 결과 타입 수정 (#5836 by @griffio)
- [컴파일러] SQL 파라미터 바인딩 복잡도를 O(n²)에서 O(n)으로 최적화 (#5898 by @chenf7)
- [SQLite 다이얼렉트] SQLite 3.18의 누락된 함수 수정 (#5759 by @griffio)

## [2.2.0] - 2025-11-13
[2.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.2.0

일부 아티팩트만 게시되어 실패한 릴리스입니다. 2.2.1을 사용하세요!

## [2.1.0] - 2025-05-16
[2.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.1.0

### 추가됨
- [WASM 드라이버] 웹 워커 드라이버에 `wasmJs` 지원 추가 (#5534 by @IlyaGulya)
- [PostgreSQL 다이얼렉트] PostgreSQL `UnNest` Array to rows 지원 (#5673 by @griffio)
- [PostgreSQL 다이얼렉트] PostgreSQL `TSRANGE`/`TSTZRANGE` 지원 (#5297 by @griffio)
- [PostgreSQL 다이얼렉트] PostgreSQL `Right Full Join` 지원 (#5086 by @griffio)
- [PostgreSQL 다이얼렉트] PostgreSQL 시간(temporal) 타입에서의 extract 지원 (#5273 by @griffio)
- [PostgreSQL 다이얼렉트] PostgreSQL 배열 포함(contains) 연산자 지원 (#4933 by @griffio)
- [PostgreSQL 다이얼렉트] PostgreSQL `drop constraint` 지원 (#5288 by @griffio)
- [PostgreSQL 다이얼렉트] PostgreSQL 타입 캐스팅 지원 (#5089 by @griffio)
- [PostgreSQL 다이얼렉트] 서브쿼리에 대한 PostgreSQL `lateral join` 연산자 지원 (#5122 by @griffio)
- [PostgreSQL 다이얼렉트] PostgreSQL `ILIKE` 연산자 지원 (#5330 by @griffio)
- [PostgreSQL 다이얼렉트] PostgreSQL `XML` 타입 지원 (#5331 by @griffio)
- [PostgreSQL 다이얼렉트] PostgreSQL `AT TIME ZONE` 지원 (#5243 by @griffio)
- [PostgreSQL 다이얼렉트] PostgreSQL `order by nulls` 지원 (#5199 by @griffio)
- [PostgreSQL 다이얼렉트] PostgreSQL 현재 날짜/시간 함수 지원 추가 (#5226 by @drewd)
- [PostgreSQL 다이얼렉트] PostgreSQL 정규식(Regex) 연산자 지원 (#5137 by @griffio)
- [PostgreSQL 다이얼렉트] brin, gist 추가 (#5059 by @griffio)
- [MySQL 다이얼렉트] MySQL 다이얼렉트에 `RENAME INDEX` 지원 (#5212 by @orenkislev-faire)
- [JSON 확장] json 테이블 함수에 에일리어스(alias) 추가 (#5372 by @griffio)

### 변경됨
- [컴파일러] 생성된 쿼리 파일이 단순 뮤테이터(mutator)에 대해 행 수(row counts)를 반환함 (#4578 by @MariusVolkhart)
- [Native 드라이버] `DELETE`, `INSERT`, `UPDATE` 문에 대한 readonly 플래그를 변경하기 위해 `NativeSqlDatabase.kt` 업데이트 (#5680 by @griffio)
- [PostgreSQL 다이얼렉트] `PgInterval`을 String으로 변경 (#5403 by @griffio)
- [PostgreSQL 다이얼렉트] PostgreSQL 확장을 구현하기 위한 SqlDelight 모듈 지원 (#5677 by @griffio)

### 수정됨
- [컴파일러] 결과가 있는 그룹 문을 실행할 때 쿼리 알림(notify) 수정 (#5006 by @vitorhugods)
- [컴파일러] `SqlDelightModule` 타입 리졸버 수정 (#5625 by @griffio)
- [컴파일러] 5501 insert 객체 이스케이프 컬럼 수정 (#5503 by @griffio)
- [컴파일러] 컴파일러: 경로 링크가 올바른 행 및 문자 위치로 클릭 가능하도록 에러 메시지 개선 (#5604 by @vanniktech)
- [컴파일러] 이슈 5298 수정: 키워드를 테이블 이름으로 사용할 수 있도록 허용
- [컴파일러] 명명된 실행(named executes) 수정 및 테스트 추가
- [컴파일러] 초기화 문을 정렬할 때 외래 키 테이블 제약 조건 고려 (#5325 by @TheMrMilchmann)
- [컴파일러] 탭이 포함된 경우 에러 밑줄을 올바르게 정렬 (#5224 by @drewd)
- [JDBC 드라이버] 트랜잭션 종료 시 `connectionManager`의 메모리 누수 수정
- [JDBC 드라이버] 문서에 명시된 대로 트랜잭션 내에서 SQLite 마이그레이션 실행 (#5218 by @morki)
- [JDBC 드라이버] 트랜잭션 커밋 / 롤백 후 커넥션 누수 수정 (#5205 by @morki)
- [Gradle 플러그인] `GenerateSchemaTask` 전에 `DriverInitializer` 실행 (#5562 by @nwagu)
- [런타임] 실제 드라이버가 Async일 때 `LogSqliteDriver`에서 발생하는 크래시 수정 (#5723 by @edenman)
- [런타임] `StringBuilder` 용량 수정 (#5192 by @janbina)
- [PostgreSQL 다이얼렉트] PostgreSQL `create or replace view` 수정 (#5407 by @griffio)
- [PostgreSQL 다이얼렉트] PostgreSQL `to_json` 수정 (#5606 by @griffio)
- [PostgreSQL 다이얼렉트] PostgreSQL numeric 리졸버 수정 (#5399 by @griffio)
- [PostgreSQL 다이얼렉트] sqlite 윈도우 함수 수정 (#2799 by @griffio)
- [PostgreSQL 다이얼렉트] PostgreSQL `SELECT DISTINCT ON` 수정 (#5345 by @griffio)
- [PostgreSQL 다이얼렉트] `alter table add column if not exists` 수정 (#5309 by @griffio)
- [PostgreSQL 다이얼렉트] PostgreSQL 비동기 바인드 파라미터 수정 (#5313 by @griffio)
- [PostgreSQL 다이얼렉트] PostgreSQL 불리언 리터럴 수정 (#5262 by @griffio)
- [PostgreSQL 다이얼렉트] PostgreSQL 윈도우 함수 수정 (#5155 by @griffio)
- [PostgreSQL 다이얼렉트] PostgreSQL `isNull`, `isNotNull` 타입 수정 (#5173 by @griffio)
- [PostgreSQL 다이얼렉트] PostgreSQL `select distinct` 수정 (#5172 by @griffio)
- [페이징 확장] 페이징 새로고침 시 초기 로드 수정 (#5615 by @evant)
- [페이징 확장] MacOS 네이티브 타겟 추가 (#5324 by @vitorhugods)
- [IntelliJ 플러그인] K2 지원

## [2.0.2] - 2024-04-05
[2.0.2]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.2

### 추가됨
- [PostgreSQL 다이얼렉트] PostgreSQL `STRING_AGG` 함수 추가 (#4950 by @anddani)
- [PostgreSQL 다이얼렉트] PostgreSQL 다이얼렉트에 `SET` 문 추가 (#4927 by @de-luca)
- [PostgreSQL 다이얼렉트] PostgreSQL `alter column` 시퀀스 파라미터 추가 (#4916 by @griffio)
- [PostgreSQL 다이얼렉트] insert 문에 대한 PostgreSQL `alter column default` 지원 추가 (#4912 by @griffio)
- [PostgreSQL 다이얼렉트] PostgreSQL `alter sequence` 및 `drop sequence` 추가 (#4920 by @griffio)
- [PostgreSQL 다이얼렉트] Postgres 정규식(Regex) 함수 정의 추가 (#5025 by @MariusVolkhart)
- [PostgreSQL 다이얼렉트] GIN 그래머(grammar) 추가 (#5027 by @griffio)

### 변경됨
- [IDE 플러그인] 최소 버전 2023.1 / Android Studio Iguana
- [컴파일러] `encapsulatingType`에서 타입 널 허용 여부 재정의 허용 (#4882 by @eygraber)
- [컴파일러] `SELECT *`에 대해 컬럼 이름을 인라인화
- [Gradle 플러그인] `processIsolation`으로 전환 (#5068 by @nwagu)
- [Android 런타임] Android `minSDK`를 21로 상향 (#5094 by @hfhbd)
- [드라이버] 다이얼렉트 작성자를 위해 더 많은 JDBC/R2DBC 문 메서드 노출 (#5098 by @hfhbd)

### 수정됨
- [PostgreSQL 다이얼렉트] PostgreSQL `alter table alter column` 수정 (#4868 by @griffio)
- [PostgreSQL 다이얼렉트] 4448 테이블 모델의 누락된 임포트 수정 (#4885 by @griffio)
- [PostgreSQL 다이얼렉트] 4932 PostgreSQL 기본 제약 조건 함수 수정 (#4934 by @griffio)
- [PostgreSQL 다이얼렉트] 4879 마이그레이션 중 PostgreSQL `alter table rename column`에서의 class-cast 에러 수정 (#4880 by @griffio)
- [PostgreSQL 다이얼렉트] 4474 PostgreSQL `create extension` 수정 (#4541 by @griffio)
- [PostgreSQL 다이얼렉트] 5018 PostgreSQL Primary Key 추가 시 널 불가 타입 수정 (#5020 by @griffio)
- [PostgreSQL 다이얼렉트] 4703 집계 표현식 수정 (#5071 by @griffio)
- [PostgreSQL 다이얼렉트] 5028 PostgreSQL json 수정 (#5030 by @griffio)
- [PostgreSQL 다이얼렉트] 5040 PostgreSQL json 연산자 수정 (#5041 by @griffio)
- [PostgreSQL 다이얼렉트] 5040에 대한 json 연산자 바인딩 수정 (#5100 by @griffio)
- [PostgreSQL 다이얼렉트] 5082 `tsvector` 수정 (#5104 by @griffio)
- [PostgreSQL 다이얼렉트] 5032 PostgreSQL `UPDATE FROM` 문에 대한 컬럼 인접성 수정 (#5035 by @griffio)
- [SQLite 다이얼렉트] 4897 sqlite `alter table rename column` 수정 (#4899 by @griffio)
- [IDE 플러그인] 에러 핸들러 크래시 수정 (#4988 by @aperfilyev)
- [IDE 플러그인] IDEA 2023.3에서 BugSnag 초기화 실패 수정 (by @aperfilyev)
- [IDE 플러그인] 플러그인을 통해 IntelliJ에서 .sq 파일을 열 때 발생하는 `PluginException` 수정 (by @aperfilyev)
- [IDE 플러그인] 이미 플러그인 의존성이므로 kotlin 라이브러리를 IntelliJ 플러그인에 묶지 않도록 수정 (#5126)
- [IDE 플러그인] 스트림 대신 확장 배열을 사용하도록 수정 (#5127)

## [2.0.1] - 2023-12-01
[2.0.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.1

### 추가됨
- [컴파일러] `SELECT` 시 다중 컬럼 표현식(multi-column-expr) 지원 추가 (#4453 by @Adriel-M)
- [PostgreSQL 다이얼렉트] PostgreSQL `CREATE INDEX CONCURRENTLY` 지원 추가 (#4531 by @griffio)
- [PostgreSQL 다이얼렉트] PostgreSQL CTE 보조 문들이 서로를 참조할 수 있도록 허용 (#4493 by @griffio)
- [PostgreSQL 다이얼렉트] 이진 표현식 및 합계에 대한 PostgreSQL 타입 지원 추가 (#4539 by @Adriel-M)
- [PostgreSQL 다이얼렉트] PostgreSQL `SELECT DISTINCT ON` 문법 지원 추가 (#4584 by @griffio)
- [PostgreSQL 다이얼렉트] `SELECT` 문에서 PostgreSQL JSON 함수 지원 추가 (#4590 by @MariusVolkhart)
- [PostgreSQL 다이얼렉트] `generate_series` PostgreSQL 함수 추가 (#4717 by @griffio)
- [PostgreSQL 다이얼렉트] 추가적인 Postgres String 함수 정의 추가 (#4752 by @MariusVolkhart)
- [PostgreSQL 다이얼렉트] min 및 max 집계 함수에 `DATE` PostgreSQL 타입 추가 (#4816 by @anddani)
- [PostgreSQL 다이얼렉트] `SqlBinaryExpr`에 PostgreSQL 시간 타입 추가 (#4657 by @griffio)
- [PostgreSQL 다이얼렉트] PostgreSQL 다이얼렉트에 `TRUNCATE` 추가 (#4817 by @de-luca)
- [SQLite 3.35 다이얼렉트] 순서대로 평가되는 다중 `ON CONFLICT` 절 허용 (#4551 by @griffio)
- [JDBC 드라이버] 더 쾌적한 SQL 편집을 위해 Language 어노테이션 추가 (#4602 by @MariusVolkhart)
- [Native 드라이버] Native 드라이버: `linuxArm64` 지원 추가 (#4792 by @hfhbd)
- [Android 드라이버] `AndroidSqliteDriver`에 `windowSizeBytes` 파라미터 추가 (#4804 by @BoD)
- [Paging3 확장] feat: `OffsetQueryPagingSource`에 `initialOffset` 추가 (#4802 by @MohamadJaara)

### 변경됨
- [컴파일러] 적절한 경우 Kotlin 타입을 선호하도록 함 (#4517 by @eygraber)
- [컴파일러] 값 타입 insert를 수행할 때 항상 컬럼 이름을 포함함 (#4864)
- [PostgreSQL 다이얼렉트] PostgreSQL 다이얼렉트에서 실험적 상태 제거 (#4443 by @hfhbd)
- [PostgreSQL 다이얼렉트] PostgreSQL 타입에 대한 문서 업데이트 (#4569 by @MariusVolkhart)
- [R2DBC 드라이버] PostgreSQL에서 정수 데이터 타입을 처리할 때의 성능 최적화 (#4588 by @MariusVolkhart)

### 삭제됨
- [SQLite Javascript 드라이버] `sqljs-driver` 삭제 (#4613, #4670 by @dellisd)

### 수정됨
- [컴파일러] 반환값이 있고 파라미터가 없는 그룹 문들의 컴파일 수정 (#4699 by @griffio)
- [컴파일러] `SqlBinaryExpr`를 사용하여 인자 바인딩 수정 (#4604 by @griffio)
- [IDE 플러그인] 설정된 경우 IDEA Project JDK 사용 (#4689 by @griffio)
- [IDE 플러그인] IDEA 2023.2 이상에서 "Unknown element type: TYPE_NAME" 에러 수정 (#4727)
- [IDE 플러그인] 2023.2와의 일부 호환성 이슈 수정
- [Gradle 플러그인] `verifyMigrationTask` Gradle 태스크 문서 수정 (#4713 by @joshfriend)
- [Gradle 플러그인] 데이터베이스 검증 전 데이터베이스 생성을 돕기 위해 Gradle 태스크 출력 메시지 추가 (#4684 by @jingwei99)
- [PostgreSQL 다이얼렉트] PostgreSQL 컬럼의 이름을 여러 번 변경할 때 발생하는 문제 수정 (#4566 by @griffio)
- [PostgreSQL 다이얼렉트] 4714 PostgreSQL 컬럼 널 허용 여부 수정 (#4831 by @griffio)
- [PostgreSQL 다이얼렉트] 4837 `alter table alter column` 수정 (#4846 by @griffio)
- [PostgreSQL 다이얼렉트] 4501 PostgreSQL 시퀀스 수정 (#4528 by @griffio)
- [SQLite 다이얼렉트] JSON 이진 연산자를 컬럼 표현식에 사용할 수 있도록 허용 (#4776 by @eygraber)
- [SQLite 다이얼렉트] 동일한 이름을 가진 다중 컬럼이 발견될 때의 `Update From` 오탐(false positive) 수정 (#4777 by @eygraber)
- [Native 드라이버] 명명된 인메모리 데이터베이스 지원 (#4662 by @05nelsonm)
- [Native 드라이버] 쿼리 리스너 컬렉션의 스레드 안전성 보장 (#4567 by @kpgalligan)
- [JDBC 드라이버] `ConnectionManager`의 커넥션 누수 수정 (#4589 by @MariusVolkhart)
- [JDBC 드라이버] `ConnectionManager` 타입을 선택할 때의 `JdbcSqliteDriver` URL 파싱 수정 (#4656 by @05nelsonm)

## [2.0.0] - 2023-07-26
[2.0.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0

### 추가됨
- [MySQL 다이얼렉트] MySQL: `IF` 표현식에서 timestamp/bigint 지원 (#4329 by @shellderp)
- [MySQL 다이얼렉트] MySQL: `now` 추가 (#4431 by @hfhbd)
- [Web 드라이버] NPM 패키지 게시 활성화 (#4364)
- [IDE 플러그인] Gradle 툴링 연결 실패 시 사용자가 스택트레이스(stacktrace)를 볼 수 있도록 허용 (#4383)

### 변경됨
- [Sqlite 드라이버] `JdbcSqliteDriver`에 대한 스키마 마이그레이션 사용 단순화 (#3737 by @morki)
- [R2DBC 드라이버] 실제 비동기 R2DBC 커서 (#4387 by @hfhbd)

### 수정됨
- [IDE 플러그인] 필요한 시점까지 데이터베이스 프로젝트 서비스를 인스턴스화하지 않도록 수정 (#4382)
- [IDE 플러그인] 사용처 찾기(find usages) 중 프로세스 취소 처리 (#4340)
- [IDE 플러그인] 비동기 코드의 IDE 생성 수정 (#4406)
- [IDE 플러그인] 패키지 구조 어셈블리를 한 번만 계산하고 EDT에서 제외하도록 이동 (#4417)
- [IDE 플러그인] 2023.2에서 Kotlin 타입 리졸루션을 위해 올바른 스텁 인덱스 키 사용 (#4416)
- [IDE 플러그인] 검색을 수행하기 전 인덱스가 준비될 때까지 대기 (#4419)
- [IDE 플러그인] 인덱스를 사용할 수 없는 경우 goto를 수행하지 않도록 수정 (#4420)
- [컴파일러] 그룹 문에 대한 결과 표현식 수정 (#4378)
- [컴파일러] 가상 테이블을 인터페이스 타입으로 사용하지 않도록 수정 (#4427 by @hfhbd)

## [2.0.0-rc02] - 2023-06-27
[2.0.0-rc02]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-rc02

### 추가됨
- [MySQL 다이얼렉트] 소문자 날짜 타입 및 날짜 타입에서의 min, max 지원 (#4243 by @shellderp)
- [MySQL 다이얼렉트] 이진 표현식 및 합계에 대한 MySQL 타입 지원 (#4254 by @shellderp)
- [MySQL 다이얼렉트] 표시 너비가 없는 unsigned int 지원 (#4306 by @shellderp)
- [MySQL 다이얼렉트] `LOCK IN SHARED MODE` 지원
- [PostgreSQL 다이얼렉트] min max에 boolean 및 Timestamp 추가 (#4245 by @griffio)
- [PostgreSQL 다이얼렉트] Postgres: 윈도우 함수 지원 추가 (#4283 by @hfhbd)
- [런타임] 런타임에 `linuxArm64`, `androidNative` 및 `watchosDeviceArm` 타겟 추가 (#4258 by @hfhbd)
- [페이징 확장] 페이징 확장에 `linux` 및 `mingw x64` 타겟 추가 (#4280 by @chippman)

### 변경됨
- [Gradle 플러그인] Android API 34에 대한 자동 다이얼렉트 지원 추가 (#4251)
- [페이징 확장] `QueryPagingSource`에서 `SuspendingTransacter` 지원 추가 (#4292 by @daio)
- [런타임] `addListener` API 개선 (#4244 by @hfhbd)
- [런타임] 마이그레이션 버전으로 `Long` 사용 (#4297 by @hfhbd)

### 수정됨
- [Gradle 플러그인] 생성된 소스에 대해 안정적인 출력 경로 사용 (#4269 by @joshfriend)
- [Gradle 플러그인] Gradle 조정 (#4222 by @3flex)

## [2.0.0-rc01] - 2023-05-29
[2.0.0-rc01]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-rc01

### 추가됨
- [페이징] 페이징 확장에 `js browser` 타겟 추가 (#3843 by @sproctor)
- [페이징] `androidx-paging3` 확장에 `iosSimulatorArm64` 타겟 추가 (#4117)
- [PostgreSQL 다이얼렉트] `gen_random_uuid()` 지원 및 테스트 추가 (#3855 by @davidwheeler123)
- [PostgreSQL 다이얼렉트] PostgreSQL `Alter table add constraint` (#4116 by @griffio)
- [PostgreSQL 다이얼렉트] PostgreSQL `Alter table add constraint check` (#4120 by @griffio)
- [PostgreSQL 다이얼렉트] PostgreSQL 문자 길이 함수 추가 (#4121 by @griffio)
- [PostgreSQL 다이얼렉트] PostgreSQL 컬럼 기본값 interval 추가 (#4142 by @griffio)
- [PostgreSQL 다이얼렉트] PostgreSQL interval 컬럼 결과 추가 (#4152 by @griffio)
- [PostgreSQL 다이얼렉트] PostgreSQL `Alter Column` 추가 (#4165 by @griffio)
- [PostgreSQL 다이얼렉트] PostgreSQL: `date_part` 추가 (#4198 by @hfhbd)
- [MySQL 다이얼렉트] SQL 문자 길이 함수 추가 (#4134 by @griffio)
- [IDE 플러그인] sqldelight 디렉토리 제안 추가 (#3976 by @aperfilyev)
- [IDE 플러그인] 프로젝트 트리에서 중간 패키지 축소 (#3992 by @aperfilyev)
- [IDE 플러그인] join 절 완성 추가 (#4086 by @aperfilyev)
- [IDE 플러그인] view 생성 의도(intention) 및 라이브 템플릿 추가 (#4074 by @aperfilyev)
- [IDE 플러그인] `DELETE` 또는 `UPDATE` 내부의 `WHERE` 누락 시 경고 (#4058 by @aperfilyev)
- [Gradle 플러그인] 타입 세이프(typesafe) 프로젝트 접근자 활성화 (#4005 by @hfhbd)

### 변경됨
- [Gradle 플러그인] ServiceLoader 메커니즘을 사용하여 `VerifyMigrationTask`를 위한 `DriverInitializer` 등록 허용 (#3986 by @C2H6O)
- [Gradle 플러그인] 명시적 컴파일러 환경 생성 (#4079 by @hfhbd)
- [JS 드라이버] 웹 워커 드라이버를 별도 아티팩트로 분리
- [JS 드라이버] `JsWorkerSqlCursor`를 노출하지 않도록 수정 (#3874 by @hfhbd)
- [JS 드라이버] `sqljs` 드라이버 게시 비활성화 (#4108)
- [런타임] 동기 드라이버가 동기 스키마 초기화 프로그램을 요구하도록 강제 (#4013)
- [런타임] 커서에 대한 비동기 지원 개선 (#4102)
- [런타임] 지원 중단된 타겟 삭제 (#4149 by @hfhbd)
- [런타임] 이전 MM(Memory Manager) 지원 삭제 (#4148 by @hfhbd)

### 수정됨
- [R2DBC 드라이버] R2DBC: 드라이버 종료 대기 (#4139 by @hfhbd)
- [컴파일러] 데이터베이스 `create(SqlDriver)` 시 마이그레이션의 `PRAGMA` 포함 (#3845 by @MariusVolkhart)
- [컴파일러] `RETURNING` 절의 코드 생성 수정 (#3872 by @MariusVolkhart)
- [컴파일러] 가상 테이블에 대한 타입을 생성하지 않도록 수정 (#4015)
- [Gradle 플러그인] 사소한 Gradle 플러그인 QoL 개선 (#3930 by @zacsweers)
- [IDE 플러그인] 해결되지 않은 Kotlin 타입 수정 (#3924 by @aperfilyev)
- [IDE 플러그인] 한정자(qualifier)와 함께 작동하도록 와일드카드 확장 의도 수정 (#3979 by @aperfilyev)
- [IDE 플러그인] Java Home이 없는 경우 사용 가능한 JDK 사용 (#3925 by @aperfilyev)
- [IDE 플러그인] 패키지 이름에서 사용처 찾기 수정 (#4010)
- [IDE 플러그인] 유효하지 않은 요소에 대해 자동 임포트를 표시하지 않도록 수정 (#4008)
- [IDE 플러그인] 다이얼렉트가 없는 경우 해결(resolve)하지 않도록 수정 (#4009)
- [IDE 플러그인] 무효화된 상태 동안의 컴파일러 IDE 실행 무시 (#4016)
- [IDE 플러그인] IntelliJ 2023.1 지원 추가 (#4037 by @madisp)
- [IDE 플러그인] 컬럼 이름 변경 시 명명된 인자 사용량 이름 변경 (#4027 by @aperfilyev)
- [IDE 플러그인] 마이그레이션 추가 팝업 수정 (#4105 by @aperfilyev)
- [IDE 플러그인] 마이그레이션 파일 내에서 `SchemaNeedsMigrationInspection` 비활성화 (#4106 by @aperfilyev)
- [IDE 플러그인] 마이그레이션 생성 시 타입 이름 대신 SQL 컬럼 이름 사용 (#4112 by @aperfilyev)

## [2.0.0-alpha05] - 2023-01-20
[2.0.0-alpha05]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha05

### 추가됨
- [페이징] 멀티플랫폼 페이징 확장 (by @jeffdgr8)
- [런타임] `Listener` 인터페이스에 `fun` 수식어 추가.
- [SQLite 다이얼렉트] SQLite 3.33 지원 추가 (`UPDATE FROM`) (by @eygraber))
- [PostgreSQL 다이얼렉트] PostgreSQL에서 `UPDATE FROM` 지원 (by @eygraber))

### 변경됨
- [RDBC 드라이버] 커넥션 노출 (by @hfhbd)
- [런타임] 마이그레이션 콜백을 메인 `migrate` 함수로 이동
- [Gradle 플러그인] 다운스트림 프로젝트로부터 Configuration 숨김
- [Gradle 플러그인] IntelliJ만 셰이드(shade) 처리 (by @hfhbd)
- [Gradle 플러그인] Kotlin 1.8.0-Beta 지원 및 멀티 버전 Kotlin 테스트 추가 (by @hfhbd)

### 수정됨
- [RDBC 드라이버] 대신 `javaObjectType` 사용 (by @hfhbd)
- [RDBC 드라이버] `bindStatement`에서 원시(primitive) 널 값 수정 (by @hfhbd)
- [RDBC 드라이버] R2DBC 1.0 지원 (by @hfhbd)
- [PostgreSQL 다이얼렉트] Postgres: 타입 파라미터가 없는 Array 수정 (by @hfhbd)
- [IDE 플러그인] IntelliJ를 221.6008.13으로 업데이트 (by @hfhbd)
- [컴파일러] 순수 View로부터 재귀적 원본 테이블 해결 (by @hfhbd)
- [컴파일러] 테이블 외래 키 절에서 가치 클래스(value classes) 사용 (by @hfhbd)
- [컴파일러] 괄호 없는 바인드 표현식을 지원하도록 `SelectQueryGenerator` 수정 (by @bellatoris)
- [컴파일러] 트랜잭션 사용 시 `${name}Indexes` 변수의 중복 생성 수정 (by @sachera)

## [1.5.5] - 2023-01-20
[1.5.5]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.5

이 릴리스는 Kotlin 1.8 및 IntelliJ 2021+를 위한 호환성 릴리스이며, JDK 17을 지원합니다.

## [1.5.4] - 2022-10-06
[1.5.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.4

이 릴리스는 Kotlin 1.7.20 및 AGP 7.3.0을 위한 호환성 업데이트입니다.

## [2.0.0-alpha04] - 2022-10-03
[2.0.0-alpha04]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha04

### 주요 변경 사항(Breaking Changes)

- Paging 3 확장 API가 개수(count)에 대해 int 타입만 허용하도록 변경되었습니다.
- 코루틴 확장은 이제 기본값을 사용하는 대신 디스패처(dispatcher)를 전달해야 합니다.
- 다이얼렉트(Dialect) 및 드라이버(Driver) 클래스는 final이며, 대신 위임(delegation)을 사용하세요.

### 추가됨
- [HSQL 다이얼렉트] Hsql: Insert에서 생성된 컬럼에 `DEFAULT` 사용 지원 (#3372 by @hfhbd)
- [PostgreSQL 다이얼렉트] PostgreSQL: INSERT에서 생성된 컬럼에 `DEFAULT` 사용 지원 (#3373 by @hfhbd)
- [PostgreSQL 다이얼렉트] PostgreSQL에 `NOW()` 추가 (#3403 by @hfhbd)
- [PostgreSQL 다이얼렉트] PostgreSQL에 `NOT` 연산자 추가 (#3504 by @hfhbd)
- [페이징] `*QueryPagingSource`에 `CoroutineContext` 전달 허용 (#3384)
- [Gradle 플러그인] 다이얼렉트에 대해 더 나은 버전 카탈로그(version catalog) 지원 추가 (#3435)
- [Native 드라이버] `NativeSqliteDriver`의 `DatabaseConfiguration` 생성에 훅(hook)을 거는 콜백 추가 (#3512 by @svenjacobs)

### 변경됨
- [페이징] `KeyedQueryPagingSource` 기반 `QueryPagingSource` 함수에 기본 디스패처 추가 (#3385)
- [페이징] `OffsetQueryPagingSource`가 Int와만 작동하도록 변경 (#3386)
- [비동기 런타임] `await*`를 상위 클래스 `ExecutableQuery`로 이동 (#3524 by @hfhbd)
- [코루틴 확장] flow 확장에서 기본 파라미터 삭제 (#3489)

### 수정됨
- [Gradle 플러그인] Kotlin 1.7.20으로 업데이트 (#3542 by @zacsweers)
- [R2DBC 드라이버] 항상 값을 보내지 않는 R2DBC 변경 사항 채택 (#3525 by @hfhbd)
- [HSQL 다이얼렉트] Hsql 사용 시 SQLite `VerifyMigrationTask` 실패 수정 (#3380 by @hfhbd)
- [Gradle 플러그인] 지연 구성(lazy configuration) API를 사용하도록 태스크 전환 (by @3flex)
- [Gradle 플러그인] Kotlin 1.7.20에서의 NPE 방지 (#3398 by @ZacSweers)
- [Gradle 플러그인] squash 마이그레이션 태스크 설명 수정 (#3449)
- [IDE 플러그인] 최신 Kotlin 플러그인에서의 `NoSuchFieldError` 수정 (#3422 by @madisp)
- [IDE 플러그인] IDEA: `UnusedQueryInspection` - `ArrayIndexOutOfBoundsException` 수정. (#3427 by @vanniktech)
- [IDE 플러그인] 이전 Kotlin 플러그인 참조를 위해 리플렉션 사용
- [컴파일러] 확장 함수가 있는 커스텀 다이얼렉트가 임포트를 생성하지 않는 문제 수정 (#3338 by @hfhbd)
- [컴파일러] `CodeBlock.of("${CodeBlock.toString()}")` 이스케이프 수정 (#3338 by @hfhbd)
- [컴파일러] 마이그레이션에서의 비동기 실행 문 대기 (#3352)
- [컴파일러] `AS` 수정 (#3370 by @hfhbd)
- [컴파일러] `getObject` 메서드가 실제 타입의 자동 채우기를 지원함. (#3401 by @robxyy)
- [컴파일러] 비동기 그룹 반환 문의 코드 생성 수정 (#3411)
- [컴파일러] 가능한 경우 바인드 파라미터의 Kotlin 타입을 추론하고, 불가능할 경우 더 나은 에러 메시지와 함께 실패 처리 (#3413 by @hfhbd)
- [컴파일러] `ABS("foo")`를 허용하지 않도록 수정 (#3430 by @hfhbd)
- [컴파일러] 다른 파라미터로부터 Kotlin 타입 추론 지원 (#3431 by @hfhbd)
- [컴파일러] 항상 데이터베이스 구현을 생성하도록 수정 (#3540 by @hfhbd)
- [컴파일러] javaDoc 완화 및 커스텀 매퍼 함수에도 추가 (#3554 @hfhbd)
- [컴파일러] 바인딩에서의 `DEFAULT` 수정 (by @hfhbd)
- [페이징] Paging 3 수정 (#3396)
- [페이징] `Long`으로 `OffsetQueryPagingSource` 생성 허용 (#3409)
- [페이징] `Dispatchers.Main`을 정적으로 교체하지 않도록 수정 (#3428)

## [2.0.0-alpha03] - 2022-06-17
[2.0.0-alpha03]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha03

### 주요 변경 사항(Breaking Changes)

- 다이얼렉트는 이제 실제 Gradle 의존성처럼 참조됩니다.
```groovy
sqldelight {
  MyDatabase {
    dialect("app.cash.sqldelight:postgres-dialect:2.0.0-alpha03")
  }
}
```
- `AfterVersionWithDriver` 타입이 이제 항상 드라이버를 가지는 `AfterVersion`을 위해 삭제되었습니다.
- `Schema` 타입은 더 이상 `SqlDriver`의 서브타입이 아닙니다.
- `PreparedStatement` API는 이제 0부터 시작하는 인덱스로 호출됩니다.

### 추가됨
- [IDE 플러그인] 실행 중인 데이터베이스에 대해 SQLite, MySQL, PostgreSQL 명령을 실행하는 지원 추가 (#2718 by @aperfilyev)
- [IDE 플러그인] Android Studio DB 인스펙터 지원 추가 (#3107 by @aperfilyev)
- [런타임] 비동기 드라이버 지원 추가 (#3168 by @dellisd)
- [Native 드라이버] 새로운 Kotlin Native 메모리 모델 지원 (#3177 by @kpgalligan)
- [JS 드라이버] SqlJs 워커를 위한 드라이버 추가 (#3203 by @dellisd)
- [Gradle 플러그인] SQLDelight 태스크를 위한 클래스패스 노출
- [Gradle 플러그인] 마이그레이션 압축(squashing)을 위한 Gradle 태스크 추가
- [Gradle 플러그인] 마이그레이션 확인 중 스키마 정의를 무시하는 플래그 추가
- [MySQL 다이얼렉트] MySQL에서 `FOR SHARE` 및 `FOR UPDATE` 지원 (#3098)
- [MySQL 다이얼렉트] MySQL 인덱스 힌트 지원 (#3099)
- [PostgreSQL 다이얼렉트] `date_trunc` 추가 (#3295 by @hfhbd)
- [JSON 확장] JSON 테이블 함수 지원 (#3090)

### 변경됨
- [런타임] 드라이버가 없는 `AfterVersion` 타입 삭제 (#3091)
- [런타임] `Schema` 타입을 최상위로 이동
- [런타임] 제3자 구현을 지원하도록 다이얼렉트 및 리졸버 개방 (#3232 by @hfhbd)
- [컴파일러] 실패 보고서에 컴파일에 사용된 다이얼렉트 포함 (#3086)
- [컴파일러] 사용되지 않는 어댑터 건너뛰기 (#3162 by @eygraber)
- [컴파일러] `PrepareStatement`에서 0부터 시작하는 인덱스 사용 (#3269 by @hfhbd)
- [Gradle 플러그인] 다이얼렉트를 문자열 대신 적절한 Gradle 의존성으로 변경 (#3085)
- [Gradle 플러그인] Gradle Verify 태스크: 데이터베이스 파일이 없을 때 예외 발생. (#3126 by @vanniktech)

### 수정됨
- [Gradle 플러그인] Gradle 플러그인의 사소한 정리 및 조정 (#3171 by @3flex)
- [Gradle 플러그인] 생성된 디렉토리에 AGP 문자열을 사용하지 않도록 수정
- [Gradle 플러그인] AGP namespace 속성 사용 (#3220)
- [Gradle 플러그인] Gradle 플러그인의 런타임 의존성으로 `kotlin-stdlib`을 추가하지 않도록 수정 (#3245 by @mbonnin)
- [Gradle 플러그인] 멀티플랫폼 구성 단순화 (#3246 by @mbonnin)
- [Gradle 플러그인] js 전용 프로젝트 지원 (#3310 by @hfhbd)
- [IDE 플러그인] Gradle 툴링 API를 위해 Java Home 사용 (#3078)
- [IDE 플러그인] IDE 플러그인 내에서 올바른 `classLoader`로 JDBC 드라이버를 로드하도록 수정 (#3080)
- [IDE 플러그인] 이미 존재하는 PSI 변경 중 에러 방지를 위해 무효화하기 전 파일 요소를 널로 표시 (#3082)
- [IDE 플러그인] `ALTER TABLE` 문에서 새로운 테이블 이름의 사용처를 찾을 때 발생하는 크래시 수정 (#3106)
- [IDE 플러그인] 인스펙터를 최적화하고 예상되는 예외 타입에 대해 조용히 실패하도록 활성화 (#3121)
- [IDE 플러그인] 생성된 디렉토리여야 하는 파일 삭제 (#3198)
- [IDE 플러그인] 안전하지 않은 연산자 호출 수정
- [컴파일러] `RETURNING` 문이 포함된 업데이트 및 삭제가 쿼리를 실행하도록 보장. (#3084)
- [컴파일러] 복합 select에서 인자 타입을 올바르게 추론 (#3096)
- [컴파일러] 공통 테이블은 데이터 클래스를 생성하지 않으므로 반환하지 않음 (#3097)
- [컴파일러] 최상위 마이그레이션 파일을 더 빨리 찾도록 수정 (#3108)
- [컴파일러] 파이프 연산자에서 널 허용 여부를 적절히 상속 (#3094)
- [컴파일러] `iif` ANSI SQL 함수 지원
- [컴파일러] 빈 쿼리 파일을 생성하지 않도록 수정 (#3300 by @hfhbd)
- [컴파일러] 물음표만 있는 어댑터 수정 (#3314 by @hfhbd)
- [PostgreSQL 다이얼렉트] Postgres 기본 키 컬럼은 항상 널 불가임 (#3092)
- [PostgreSQL 다이얼렉트] 여러 테이블에서 동일한 이름을 가진 복사 수정 (#3297 by @hfhbd)
- [SQLite 3.35 다이얼렉트] 변경된 테이블에서 인덱스된 컬럼을 드롭할 때만 에러 표시 (#3158 by @eygraber)

## [2.0.0-alpha02] - 2022-04-13
[2.0.0-alpha02]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha02

### 주요 변경 사항(Breaking Changes)

- `app.cash.sqldelight.runtime.rx`가 나타나는 모든 곳을 `app.cash.sqldelight.rx2`로 교체해야 합니다.

### 추가됨
- [컴파일러] 그룹 문의 끝에서 returning 지원
- [컴파일러] 다이얼렉트 모듈을 통한 컴파일러 확장 지원 및 SQLite JSON 확장 추가 (#1379, #2087)
- [컴파일러] 값을 반환하는 `PRAGMA` 문 지원 (#1106)
- [컴파일러] 표시된 컬럼에 대해 가치 타입(value type) 생성 지원
- [컴파일러] 낙관적 락(optimistic locks) 및 유효성 검사 지원 추가 (#1952)
- [컴파일러] 멀티 업데이트(multi-update) 문 지원
- [PostgreSQL] Postgres returning 문 지원
- [PostgreSQL] Postgres 날짜 타입 지원
- [PostgreSQL] Postgres interval 지원
- [PostgreSQL] Postgres Boolean 지원 및 alter 테이블에서의 insert 수정
- [PostgreSQL] Postgres에서 선택적 limit 지원
- [PostgreSQL] Postgres `BYTEA` 타입 지원
- [PostgreSQL] Postgres serial 테스트 추가
- [PostgreSQL] Postgres `for update` 문법 지원
- [PostgreSQL] PostgreSQL 배열 타입 지원
- [PostgreSQL] Postgres에서 `UUID` 타입을 적절히 저장/검색
- [PostgreSQL] PostgreSQL `NUMERIC` 타입 지원 (#1882)
- [PostgreSQL] 공통 테이블 식 내부에서 쿼리 반환 지원 (#2471)
- [PostgreSQL] JSON 특정 연산자 지원
- [PostgreSQL] Postgres Copy 추가 (by @hfhbd)
- [MySQL] MySQL Replace 지원
- [MySQL] `NUMERIC`/`BigDecimal` MySQL 타입 지원 (#2051)
- [MySQL] MySQL truncate 문 지원
- [MySQL] MySQL에서 JSON 특정 연산자 지원 (by @eygraber)
- [MySQL] MySQL `INTERVAL` 지원 (#2969 by @eygraber)
- [HSQL] HSQL Window 기능 추가
- [SQLite] `WHERE`에서 널 허용 파라미터에 대한 동일성 체크를 교체하지 않음 (#1490 by @eygraber)
- [SQLite] SQLite 3.35 returning 문 지원 (#1490 by @eygraber)
- [SQLite] `GENERATED` 절 지원
- [SQLite] SQLite 3.38 다이얼렉트 지원 추가 (by @eygraber)

### 변경됨
- [컴파일러] 생성된 코드 약간 정리
- [컴파일러] 그룹 문에서 테이블 파라미터 사용 금지 (#1822)
- [컴파일러] 그룹 쿼리를 트랜잭션 내부에 배치 (#2785)
- [런타임] 드라이버의 execute 메서드에서 업데이트된 행 수 반환
- [런타임] 커넥션에 접근하는 임계 구역으로 `SqlCursor` 한정 (#2123 by @andersio)
- [Gradle 플러그인] 마이그레이션을 위한 스키마 정의 비교 (#841)
- [PostgreSQL] Postgres에 대해 큰따옴표 허용 안 함
- [MySQL] MySQL에서 `==` 사용 시 에러 발생 (#2673)

### 수정됨
- [컴파일러] 서로 다른 테이블의 동일한 어댑터 타입이 2.0 alpha에서 컴파일 에러를 일으키는 문제 수정
- [컴파일러] upsert 문 컴파일 문제 수정 (#2791)
- [컴파일러] 여러 매치가 있을 경우 select의 테이블을 사용하도록 쿼리 결과 수정 (#1874, #2313)
- [컴파일러] `INSTEAD OF` 트리거가 있는 view 업데이트 지원 (#1018)
- [컴파일러] 함수 이름에서 from 및 for 지원
- [컴파일러] 함수 표현식에서 `SEPARATOR` 키워드 허용
- [컴파일러] `ORDER BY`에서 에일리어스(alias)된 테이블의 `ROWID`에 접근할 수 없는 문제 수정
- [컴파일러] MySQL의 `HAVING` 절에서 에일리어스(alias)된 컬럼 이름이 인식되지 않는 문제 수정
- [컴파일러] 잘못된 'Multiple columns found' 에러 수정
- [컴파일러] `PRAGMA locking_mode = EXCLUSIVE;`를 설정할 수 없는 문제 수정
- [PostgreSQL] PostgreSQL 컬럼 이름 변경 수정
- [MySQL] `UNIX_TIMESTAMP`, `TO_SECONDS`, `JSON_ARRAYAGG` MySQL 함수가 인식되지 않는 문제 수정
- [SQLite] SQLite 윈도우 기능 수정
- [IDE 플러그인] 빈 진행 표시기에서 goto 핸들러 실행 (#2990)
- [IDE 플러그인] 프로젝트가 구성되지 않은 경우 하이라이트 비지터가 실행되지 않도록 보장 (#2981, #2976)
- [IDE 플러그인] 전이적으로 생성된 코드도 IDE에서 업데이트되도록 보장 (#1837)
- [IDE 플러그인] 다이얼렉트 업데이트 시 인덱스 무효화

## [2.0.0-alpha01] - 2022-03-31
[2.0.0-alpha01]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha01

이것은 2.0의 첫 번째 알파 릴리스이며 일부 주요 변경 사항이 포함되어 있습니다. 더 많은 ABI 파괴적 변경이 발생할 것으로 예상되므로 이 릴리스에 의존하는 라이브러리를 게시하지 마십시오(애플리케이션은 괜찮을 것입니다).

### 주요 변경 사항(Breaking Changes)

- 첫째, `com.squareup.sqldelight`가 나타나는 모든 곳을 `app.cash.sqldelight`로 교체해야 합니다.
- 둘째, `app.cash.sqldelight.android`가 나타나는 모든 곳을 `app.cash.sqldelight.driver.android`로 교체해야 합니다.
- 셋째, `app.cash.sqldelight.sqlite.driver`가 나타나는 모든 곳을 `app.cash.sqldelight.driver.jdbc.sqlite`로 교체해야 합니다.
- 넷째, `app.cash.sqldelight.drivers.native`가 나타나는 모든 곳을 `app.cash.sqldelight.driver.native`로 교체해야 합니다.
- IDE 플러그인은 2.X 버전으로 업데이트되어야 하며, [알파 또는 eap 채널](https://plugins.jetbrains.com/plugin/8191-sqldelight/versions/alpha)에서 찾을 수 있습니다.
- 다이얼렉트는 이제 Gradle 내에서 지정할 수 있는 의존성입니다.

```gradle
sqldelight {
  MyDatabase {
    packageName = "com.example"
    dialect = "app.cash.sqldelight:mysql-dialect:2.0.0-alpha01"
  }
}
```

현재 지원되는 다이얼렉트는 `mysql-dialect`, `postgresql-dialect`, `hsql-dialect`, `sqlite-3-18-dialect`, `sqlite-3-24-dialect`, `sqlite-3-25-dialect`, `sqlite-3-30-dialect`, `sqlite-3-35-dialect`입니다.

- 원시 타입은 이제 명시적으로 임포트해야 합니다(예: `INTEGER AS Boolean`을 쓰려면 `import kotlin.Boolean` 필요). 이전에 지원되던 일부 타입은 이제 어댑터가 필요합니다. 대부분의 변환을 위한 원시 어댑터는 `app.cash.sqldelight:primitive-adapters:2.0.0-alpha01`에서 제공됩니다(예: `IntColumnAdapter`를 위한 `Integer AS kotlin.Int`).

### 추가됨
- [IDE 플러그인] 기본적인 마이그레이션 제안 (by @aperfilyev)
- [IDE 플러그인] 임포트 힌트 액션 추가 (by @aperfilyev)
- [IDE 플러그인] Kotlin 클래스 완성 추가 (by @aperfilyev)
- [Gradle 플러그인] 타입 세이프(typesafe) 프로젝트 접근자 단축어 추가 (by @hfhbd)
- [컴파일러] 다이얼렉트에 기반한 코드 생성 커스터마이징 (by @MariusVolkhart)
- [JDBC 드라이버] `JdbcDriver`에 일반 타입 추가 (by @MariusVolkhart)
- [SQLite] SQLite 3.35 지원 추가 (by @eygraber)
- [SQLite] `ALTER TABLE DROP COLUMN` 지원 추가 (by @eygraber)
- [SQLite] SQLite 3.30 다이얼렉트 지원 추가 (by @eygraber)
- [SQLite] SQLite에서 `NULLS FIRST`/`LAST` 지원 (by @eygraber)
- [HSQL] 생성된 절에 대한 HSQL 지원 추가 (by @MariusVolkhart)
- [HSQL] HSQL에서 명명된 파라미터 지원 추가 (by @MariusVolkhart)
- [HSQL] HSQL insert 쿼리 커스터마이징 (by @MariusVolkhart)

### 변경됨
- [전체] 패키지 이름이 `com.squareup.sqldelight`에서 `app.cash.sqldelight`로 변경되었습니다.
- [런타임] 다이얼렉트를 고유의 독립된 Gradle 모듈로 이동
- [런타임] 드라이버가 구현하는 쿼리 알림으로 전환
- [런타임] 기본 컬럼 어댑터를 별도 모듈로 분리 (#2056, #2060)
- [컴파일러] 각 모듈에서 다시 하는 대신 모듈이 쿼리 구현을 생성하도록 함
- [컴파일러] 생성된 데이터 클래스의 커스텀 `toString` 생성을 제거 (by @PaulWoitaschek)
- [JS 드라이버] `sqljs-driver`에서 `sql.js` 의존성 제거 (by @dellisd)
- [페이징] Android 페이징 2 확장 삭제
- [IDE 플러그인] SQLDelight가 동기화되는 동안 에디터 배너 표시 (#2511)
- [IDE 플러그인] 최소 지원 IntelliJ 버전은 2021.1

### 수정됨
- [런타임] 할당 및 포인터 체이싱을 줄이기 위해 리스너 리스트를 평탄화(Flatten). (by @andersio)
- [IDE 플러그인] 에러로 점프할 수 있도록 에러 메시지 수정 (by @hfhbd)
- [IDE 플러그인] 누락된 검사(inspection) 설명 추가 (#2768 by @aperfilyev)
- [IDE 플러그인] `GotoDeclarationHandler`의 예외 수정 (#2531, #2688, #2804 by @aperfilyev)
- [IDE 플러그인] 임포트 키워드 하이라이트 (by @aperfilyev)
- [IDE 플러그인] 해결되지 않은 Kotlin 타입 수정 (#1678 by @aperfilyev)
- [IDE 플러그인] 해결되지 않은 패키지에 대한 하이라이트 수정 (#2543 by @aperfilyev)
- [IDE 플러그인] Dont attempt to inspect mismatched columns if the project index is not yet initialized
- [IDE 플러그인] Dont initialize the file index until a gradle sync has occurred
- [IDE 플러그인] Cancel the SQLDelight import if a gradle sync begins
- [IDE 플러그인] Regenerate the database outside of the thread an undo action is performed on
- [IDE 플러그인] If a reference cannot be resolves use a blank java type
- [IDE 플러그인] 파일 파싱 중에는 메인 스레드에서 벗어나고 쓰기 시에만 복귀하도록 개선
- [IDE 플러그인] 구 버전 IntelliJ와의 호환성 개선 (by @3flex)
- [IDE 플러그인] 더 빠른 어노테이션 API 사용
- [Gradle 플러그인] 런타임 추가 시 js/android 플러그인을 명시적으로 지원 (by @ZacSweers)
- [Gradle 플러그인] 마이그레이션에서 스키마를 도출하지 않고 마이그레이션 출력 태스크 등록 (#2744 by @kevincianfarini)
- [Gradle 플러그인] 마이그레이션 태스크 크래시 시 실행 중이던 파일 출력
- [Gradle 플러그인] 멱등성(idempotent) 있는 출력을 보장하기 위해 코드 생성 시 파일 정렬 (by @ZacSweers)
- [컴파일러] 파일 반복을 위해 더 빠른 API를 사용하고 전체 PSI 그래프를 탐색하지 않음
- [컴파일러] select 함수 파라미터에 키워드 맹글링 추가 (#2759 by @aperfilyev)
- [컴파일러] 마이그레이션 어댑터를 위한 `packageName` 수정 (by @hfhbd)
- [컴파일러] 타입 대신 프로퍼티에 어노테이션 방출 (#2798 by @aperfilyev)
- [컴파일러] Query 서브타입으로 전달하기 전 인자 정렬 (#2379 by @aperfilyev)

## [1.5.3] - 2021-11-23
[1.5.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.3

### 추가됨
- [JDBC 드라이버] 제3자 드라이버 구현을 위해 `JdbcDriver` 개방 (#2672 by @hfhbd)
- [MySQL 다이얼렉트] 누락된 시간 증가 함수 추가 (#2671 by @sdoward)
- [코루틴 확장] 코루틴 확장에 M1 타겟 추가 (by @PhilipDukhov)

### 변경됨
- [Paging3 확장] `sqldelight-android-paging3`를 AAR 대신 JAR로 배포 (#2634 by @julioromano)
- 소프트 키워드(soft keywords)이기도 한 프로퍼티 이름에는 이제 언더스코어가 접미사로 붙습니다. 예를 들어 `value`는 `value_`로 노출됩니다.

### 수정됨
- [컴파일러] 중복된 배열 파라미터에 대해 변수를 추출하지 않도록 수정 (by @aperfilyev)
- [Gradle 플러그인] `kotlin.mpp.enableCompatibilityMetadataVariant` 추가. (#2628 by @martinbonnin)
- [IDE 플러그인] 사용처 찾기 처리에 읽기 액션 필요

## [1.5.2] - 2021-10-12
[1.5.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.2

### 추가됨
- [Gradle 플러그인] HMPP 지원 (#2548 by @martinbonnin)
- [IDE 플러그인] NULL 비교 검사 추가 (by @aperfilyev)
- [IDE 플러그인] 검사 억제기(suppressor) 추가 (#2519 by @aperfilyev)
- [IDE 플러그인] 명명된 파라미터와 위치 파라미터 혼용 검사 (by @aperfilyev)
- [SQLite 드라이버] `mingwX86` 타겟 추가. (#2558 by @enginegl)
- [SQLite 드라이버] M1 타겟 추가
- [SQLite 드라이버] `linuxX64` 지원 추가 (#2456 by @chippmann)
- [MySQL 다이얼렉트] MySQL에 `ROW_COUNT` 함수 추가 (#2523)
- [PostgreSQL 다이얼렉트] PostgreSQL rename, drop column (by @pabl0rg)
- [PostgreSQL 다이얼렉트] PostgreSQL 그래머가 `CITEXT`를 인식하지 못하던 문제 수정
- [PostgreSQL 다이얼렉트] `TIMESTAMP WITH TIME ZONE` 및 `TIMESTAMPTZ` 포함
- [PostgreSQL 다이얼렉트] PostgreSQL `GENERATED` 컬럼 그래머 추가
- [런타임] `AfterVersion`의 파라미터로 `SqlDriver` 제공 (#2534, 2614 by @ahmedre)

### 변경됨
- [Gradle 플러그인] Gradle 7.0을 명시적으로 요구 (#2572 by @martinbonnin)
- [Gradle 플러그인] `VerifyMigrationTask`가 Gradle의 최신 상태 확인(up-to-date checks)을 지원하도록 함 (#2533 by @3flex)
- [IDE 플러그인] 널 허용 타입과 널 불가 타입을 조인할 때 "Join compares two columns of different types" 경고가 표시되지 않도록 수정 (#2550 by @pchmielowski)
- [IDE 플러그인] 컬럼 타입에서 소문자 'as'에 대한 에러 설명 명확화 (by @aperfilyev)

### 수정됨
- [IDE 플러그인] 프로젝트가 이미 폐기된(disposed) 경우 새로운 다이얼렉트로 다시 파싱하지 않도록 수정 (#2609)
- [IDE 플러그인] 연관된 가상 파일이 널인 경우 모듈도 널임 (#2607)
- [IDE 플러그인] 사용되지 않는 쿼리 검사 중 크래시 방지 (#2610)
- [IDE 플러그인] 쓰기 액션 내부에서 데이터베이스 동기화 쓰기 실행 (#2605)
- [IDE 플러그인] IDE가 SQLDelight 동기화를 스케줄링하도록 허용
- [IDE 플러그인] `JavaTypeMixin`의 NPE 수정 (#2603 by @aperfilyev)
- [IDE 플러그인] `MismatchJoinColumnInspection`의 `IndexOutOfBoundsException` 수정 (#2602 by @aperfilyev)
- [IDE 플러그인] `UnusedColumnInspection` 설명 추가 (#2600 by @aperfilyev)
- [IDE 플러그인] `PsiElement.generatedVirtualFiles`를 읽기 액션으로 감쌈 (#2599 by @aperfilyev)
- [IDE 플러그인] 불필요한 nonnull 캐스트 제거 (#2596)
- [IDE 플러그인] 사용처 찾기 시 널을 적절히 처리 (#2595)
- [IDE 플러그인] Android를 위해 생성된 파일의 IDE 자동 완성 수정 (#2573 by @martinbonnin)
- [IDE 플러그인] `SqlDelightGotoDeclarationHandler`의 NPE 수정 (by @aperfilyev)
- [IDE 플러그인] insert 문 내부의 인자에서 Kotlin 키워드 맹글링 (#2433 by @aperfilyev)
- [IDE 플러그인] `SqlDelightFoldingBuilder`의 NPE 수정 (#2382 by @aperfilyev)
- [IDE 플러그인] `CopyPasteProcessor`의 `ClassCastException` 포착 (#2369 by @aperfilyev)
- [IDE 플러그인] 업데이트 라이브 템플릿 수정 (by @IliasRedissi)
- [IDE 플러그인] 의도(intention) 액션에 설명 추가 (#2489 by @aperfilyev)
- [IDE 플러그인] 테이블을 찾을 수 없는 경우 `CreateTriggerMixin`의 예외 수정 (by @aperfilyev)
- [컴파일러] 테이블 생성 문을 위상 정렬(Topologically sort)함
- [컴파일러] 디렉토리에 대해 `forDatabaseFiles` 콜백 호출 중단 (#2532)
- [Gradle 플러그인] `generateDatabaseInterface` 태스크 의존성을 잠재적 소비자에게 전파 (#2518 by @martinbonnin)

## [1.5.1] - 2021-07-16
[1.5.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.1

### 추가됨
- [PostgreSQL 다이얼렉트] PostgreSQL JSONB 및 `ON Conflict Do Nothing` (by @satook)
- [PostgreSQL 다이얼렉트] PostgreSQL `ON CONFLICT (column, ...) DO UPDATE` 지원 추가 (by @satook)
- [MySQL 다이얼렉트] MySQL 생성된 컬럼 지원 (by @JGulbronson)
- [Native 드라이버] `watchosX64` 지원 추가
- [IDE 플러그인] 파라미터 타입 및 어노테이션 추가 (by @aperfilyev)
- [IDE 플러그인] 'select all' 쿼리 생성 액션 추가 (by @aperfilyev)
- [IDE 플러그인] 자동 완성 시 컬럼 타입 표시 (by @aperfilyev)
- [IDE 플러그인] 자동 완성 시 아이콘 추가 (by @aperfilyev)
- [IDE 플러그인] 'select by primary key' 쿼리 생성 액션 추가 (by @aperfilyev)
- [IDE 플러그인] 'insert into' 쿼리 생성 액션 추가 (by @aperfilyev)
- [IDE 플러그인] 컬럼 이름, 문 식별자, 함수 이름 하이라이트 추가 (by @aperfilyev)
- [IDE 플러그인] 남은 쿼리 생성 액션들 추가 (#489 by @aperfilyev)
- [IDE 플러그인] insert-stmt의 파라미터 힌트 표시 (by @aperfilyev)
- [IDE 플러그인] 테이블 에일리어스 의도 액션 (by @aperfilyev)
- [IDE 플러그인] 컬럼 이름 한정(qualify) 의도 추가 (by @aperfilyev)
- [IDE 플러그인] Kotlin 프로퍼티 선언으로 이동 추가 (by @aperfilyev)

### 변경됨
- [Native 드라이버] 가능한 경우 프리징(freezing) 및 공유 가능 데이터 구조를 피하여 네이티브 트랜잭션 성능 개선 (by @andersio)
- [Paging 3] Paging 3 버전을 3.0.0 stable로 상향
- [JS 드라이버] sql.js를 1.5.0으로 업그레이드

### 수정됨
- [JDBC SQLite 드라이버] ThreadLocal을 지우기 전 커넥션에서 `close()` 호출 (#2444 by @hannesstruss)
- [RX 확장] 구독 / 해제 경쟁 누수 수정 (#2403 by @pyricau)
- [코루틴 확장] 통지 전 쿼리 리스너를 등록하도록 보장
- [컴파일러] 일관된 Kotlin 출력 파일을 위해 `notifyQueries` 정렬 (by @thomascjy)
- [컴파일러] select 쿼리 클래스 프로퍼티에 `@JvmField` 어노테이션을 붙이지 않도록 수정 (by @eygraber)
- [IDE 플러그인] 임포트 최적화 도구 수정 (#2350 by @aperfilyev)
- [IDE 플러그인] 사용되지 않는 컬럼 검사 수정 (by @aperfilyev)
- [IDE 플러그인] 임포트 검사 및 클래스 어노테이터에 중첩 클래스 지원 추가 (#2350 by @aperfilyev)
- [IDE 플러그인] `CopyPasteProcessor`의 NPE 수정 (#2363 by @aperfilyev)
- [IDE 플러그인] `InlayParameterHintsProvider`의 크래시 수정 (#2359 by @aperfilyev)
- [IDE 플러그인] create table 문에 텍스트 복사-붙여넣기 시 빈 줄 삽입 수정 (#2431 by @aperfilyev)

## [1.5.0] - 2021-04-23
[1.5.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.0

### 추가됨
- [SQLite Javascript 드라이버] `sqljs-driver` 게시 활성화 (#1667 by @dellisd)
- [Paging3 확장] Android Paging 3 라이브러리 확장 (#1786 by @kevincianfarini)
- [MySQL 다이얼렉트] MySQL의 `ON DUPLICATE KEY UPDATE` 충돌 해결 지원 추가. (by @rharter)
- [SQLite 다이얼렉트] SQLite `offsets()` 컴파일러 지원 추가 (by @qjroberts)
- [IDE 플러그인] 알 수 없는 타입에 대한 임포트 퀵 픽 추가 (#683 by @aperfilyev)
- [IDE 플러그인] 사용되지 않는 임포트 검사 추가 (#1161 by @aperfilyev)
- [IDE 플러그인] 사용되지 않는 쿼리 검사 추가 (by @aperfilyev)
- [IDE 플러그인] 사용되지 않는 컬럼 검사 추가 (#569 by @aperfilyev)
- [IDE 플러그인] 복사/붙여넣기 시 자동으로 임포트 가져오기 (#684 by @aperfilyev)
- [IDE 플러그인] Gradle/IntelliJ 플러그인 버전 간 호환되지 않을 때 풍선 도움말 표시
- [IDE 플러그인] `Insert Into ... VALUES(?)` 파라미터 힌트 (#506 by @aperfilyev)
- [IDE 플러그인] 인라인 파라미터 힌트 (by @aperfilyev)
- [런타임] 콜백과 함께 마이그레이션을 실행하기 위한 API 런타임에 포함 (#1844)

### 변경됨
- [컴파일러] "IS NOT NULL" 쿼리 스마트 캐스트 (#867)
- [컴파일러] 런타임에 실패할 수 있는 키워드 방지 (#1471, #1629)
- [Gradle 플러그인] Gradle 플러그인 크기를 60mb에서 13mb로 축소.
- [Gradle 플러그인] Android 변형(variants)을 적절히 지원하고, KMM 타겟별 sql 지원 삭제 (#1039)
- [Gradle 플러그인] minsdk에 기반하여 최소 SQLite 버전 선택 (#1684)
- [Native 드라이버] Native 드라이버 커넥션 풀 및 성능 업데이트

### 수정됨
- [컴파일러] 람다 앞의 NBSP 수정 (by @oldergod)
- [컴파일러] 생성된 `bind*` 및 `cursor.get*` 문에서 호환되지 않는 타입 수정
- [컴파일러] SQL 절이 어댑터 타입을 유지해야 함 (#2067)
- [컴파일러] NULL 키워드만 있는 컬럼은 널 허용이어야 함
- [컴파일러] 타입 어노테이션이 있는 매퍼 람다를 생성하지 않도록 수정 (#1957)
- [컴파일러] 커스텀 쿼리가 충돌할 경우 파일 이름을 추가 패키지 접미사로 사용 (#1057, #1278)
- [컴파일러] 외래 키 캐스케이드(cascades)가 쿼리 리스너에게 통지되도록 보장 (#1325, #1485)
- [컴파일러] 동일한 타입의 두 개를 유니온할 때 테이블 타입 반환 (#1342)
- [컴파일러] `ifnull` 및 `coalesce` 인자가 널 허용일 수 있도록 보장 (#1263)
- [컴파일러] 표현식에 대해 쿼리에 부과된 널 허용 여부를 정확하게 사용
- [MySQL 다이얼렉트] MySQL if 문 지원
- [PostgreSQL 다이얼렉트] PostgreSQL에서 `NUMERIC` 및 `DECIMAL`을 Double로 검색 (#2118)
- [SQLite 다이얼렉트] UPSERT 알림이 `BEFORE`/`AFTER UPDATE` 트리거를 고려해야 함. (#2198 by @andersio)
- [SQLite 드라이버] 인메모리가 아닌 경우 SQLite 드라이버에서 스레드 당 다중 커넥션 사용 (#1832)
- [JDBC 드라이버] JDBC 드라이버가 `autoCommit`을 true로 가정하던 문제 수정 (#2041)
- [JDBC 드라이버] 예외 발생 시 커넥션을 닫도록 보장 (#2306)
- [IDE 플러그인] 경로 구분자 버그로 인해 Windows에서 GoToDeclaration/FindUsages가 깨지던 문제 수정 (#2054 by @angusholder)
- [IDE 플러그인] IDE에서 크래시를 내는 대신 Gradle 에러를 무시하도록 수정.
- [IDE 플러그인] sqldelight 파일이 비-sqldelight 모듈로 이동된 경우 코드 생성을 시도하지 않음
- [IDE 플러그인] IDE에서의 코드 생성 에러 무시
- [IDE 플러그인] 음수 서브스트링을 시도하지 않도록 보장 (#2068)
- [IDE 플러그인] Gradle 액션 실행 전 프로젝트가 폐기되지 않았는지 보장 (#2155)
- [IDE 플러그인] 널 허용 타입의 산술 연산도 널 허용이어야 함 (#1853)
- [IDE 플러그인] 추가적인 프로젝션과 함께 'expand * intention'이 작동하도록 수정 (#2173 by @aperfilyev)
- [IDE 플러그인] GoTo 중 Kotlin 리졸루션 실패 시 sqldelight 파일로 이동을 시도하지 않음
- [IDE 플러그인] SQLDelight가 인덱싱하는 동안 IntelliJ가 예외를 만나더라도 크래시 나지 않도록 수정
- [IDE 플러그인] IDE에서 코드 생성 전 에러 탐지 중 발생하는 예외 처리
- [IDE 플러그인] IDE 플러그인이 다이내믹 플러그인(Dynamic Plugins)과 호환되도록 수정 (#1536)
- [Gradle 플러그인] WorkerApi 사용 시 데이터베이스 생성 경쟁 조건 수정 (#2062 by @stephanenicolas)
- [Gradle 플러그인] `classLoaderIsolation`이 커스텀 jdbc 사용을 방해하는 문제 수정 (#2048 by @benasher44)
- [Gradle 플러그인] 누락된 `packageName` 에러 메시지 개선 (by @vanniktech)
- [Gradle 플러그인] SQLDelight가 buildscript 클래스 경로에 IntelliJ 의존성을 유출하는 문제 수정 (#1998)
- [Gradle 플러그인] Gradle 빌드 캐싱 수정 (#2075)
- [Gradle 플러그인] Gradle 플러그인에서 `kotlin-native-utils`에 의존하지 않도록 수정 (by @ilmat192)
- [Gradle 플러그인] 마이그레이션 파일만 있는 경우에도 데이터베이스를 쓰도록 보장 (#2094)
- [Gradle 플러그인] 다이아몬드 의존성이 최종 컴파일 단위에서 한 번만 선택되도록 보장 (#1455)

이 릴리스에서 SQLDelight 인프라 개선을 위해 많은 수고를 해주신 @3flex 님께 감사를 표합니다.

## [1.4.4] - 2020-10-08
[1.4.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.4

### 추가됨
- [PostgreSQL 다이얼렉트] `WITH`에서 데이터 변경 문 지원
- [PostgreSQL 다이얼렉트] `substring` 함수 지원
- [Gradle 플러그인] SQLDelight 컴파일 중 마이그레이션 검증을 위해 `verifyMigrations` 플래그 추가 (#1872)

### 변경됨
- [컴파일러] SQLite 전용 함수를 비-SQLite 다이얼렉트에서 알 수 없는 함수로 플래그 처리
- [Gradle 플러그인] sqldelight 플러그인이 적용되었으나 데이터베이스가 구성되지 않은 경우 경고 제공 (#1421)

### 수정됨
- [컴파일러] `ORDER BY` 절에서 컬럼 이름을 바인딩할 때 에러 보고 (#1187 by @eygraber)
- [컴파일러] db 인터페이스 생성 시 레지스트리 경고가 나타나는 문제 수정 (#1792)
- [컴파일러] case 문에 대한 잘못된 타입 추론 수정 (#1811)
- [컴파일러] 버전이 없는 마이그레이션 파일에 대해 더 나은 에러 제공 (#2006)
- [컴파일러] 일부 데이터베이스 타입 `ColumnAdapter`에 대해 마샬링에 필요한 데이터베이스 타입이 잘못되던 문제 수정 (#2012)
- [컴파일러] `CAST`의 널 허용 여부 수정 (#1261)
- [컴파일러] 쿼리 래퍼에서 이름 섀도잉(shadowed) 경고 대량 수정 (#1946 by @eygraber)
- [컴파일러] 생성된 코드가 전체 한정 이름(full qualifier names)을 사용하던 문제 수정 (#1939)
- [IDE 플러그인] Gradle 동기화로부터 SQLDelight 코드 생성 유도
- [IDE 플러그인] .sq 파일 변경 시 플러그인이 데이터베이스 인터페이스를 재생성하지 않던 문제 수정 (#1945)
- [IDE 플러그인] 파일을 새 패키지로 이동할 때의 이슈 수정 (#444)
- [IDE 플러그인] 커서를 이동할 곳이 없으면 크래시 내는 대신 아무것도 하지 않음 (#1994)
- [IDE 플러그인] Gradle 프로젝트 외부의 파일에 대해 빈 패키지 이름 사용 (#1973)
- [IDE 플러그인] 유효하지 않은 타입에 대해 우아하게 실패하도록 수정 (#1943)
- [IDE 플러그인] 알 수 없는 표현식을 만났을 때 더 나은 에러 메시지 발생 (#1958)
- [Gradle 플러그인] SQLDelight가 buildscript 클래스 경로에 IntelliJ 의존성을 유출하는 문제 수정 (#1998)
- [Gradle 플러그인] *.sq 파일에 메서드 문서 추가 시 "JavadocIntegrationKt not found" 컴파일 에러 수정 (#1982)
- [Gradle 플러그인] SQLDelight Gradle 플러그인이 구성 캐싱(Configuration Caching)을 지원하지 않던 문제 수정 (#1947 by @stephanenicolas)
- [SQLite JDBC 드라이버] SQLException: database in auto-commit mode (#1832)
- [코루틴 확장] 코루틴 확장에 대해 IR 백엔드 수정 (#1918 by @dellisd)

## [1.4.3] - 2020-09-04
[1.4.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.3

### 추가됨
- [MySQL 다이얼렉트] MySQL `last_insert_id` 함수 지원 추가 (by @lawkai)
- [PostgreSQL 다이얼렉트] `SERIAL` 데이터 타입 지원 (by @veyndan & @felipecsl)
- [PostgreSQL 다이얼렉트] PostgreSQL `RETURNING` 지원 (by @veyndan)

### 수정됨
- [MySQL 다이얼렉트] MySQL `AUTO_INCREMENT`를 기본값이 있는 것으로 취급 (#1823)
- [컴파일러] Upsert 문 컴파일러 에러 수정 (#1809 by @eygraber)
- [컴파일러] 유효하지 않은 Kotlin이 생성되는 이슈 수정 (#1925 by @eygraber)
- [컴파일러] 알 수 없는 함수에 대해 더 나은 에러 메시지 제공 (#1843)
- [컴파일러] `instr`의 두 번째 파라미터 타입으로 string 노출
- [IDE 플러그인] IDE 플러그인의 데몬 비대화 및 UI 스레드 지연 수정 (#1916)
- [IDE 플러그인] 널 모듈 시나리오 처리 (#1902)
- [IDE 플러그인] 구성되지 않은 sq 파일에서 패키지 이름으로 빈 문자열 반환 (#1920)
- [IDE 플러그인] 그룹 문 수정 및 이에 대한 통합 테스트 추가 (#1820)
- [IDE 플러그인] 요소의 모듈을 찾기 위해 내장 `ModuleUtil` 사용 (#1854)
- [IDE 플러그인] 조회(lookups)에 유효한 요소만 추가 (#1909)
- [IDE 플러그인] Parent가 널일 수 있음 (#1857)

## [1.4.2] - 2020-08-27
[1.4.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.2

### 추가됨
- [런타임] 새로운 JS IR 백엔드 지원
- [Gradle 플러그인] `generateSqlDelightInterface` Gradle 태스크 추가 (by @vanniktech)
- [Gradle 플러그인] `verifySqlDelightMigration` Gradle 태스크 추가 (by @vanniktech)

### 수정됨
- [IDE 플러그인] IDE와 Gradle 간의 데이터 공유를 용이하게 하기 위해 Gradle 툴링 API 사용
- [IDE 플러그인] 스키마 도출(derivation) 기본값을 false로 설정
- [IDE 플러그인] `commonMain` 소스 세트를 적절히 검색
- [MySQL 다이얼렉트] `mySqlFunctionType()`에 minute 추가 (by @maaxgr)

## [1.4.1] - 2020-08-21
[1.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.1

### 추가됨
- [런타임] Kotlin 1.4.0 지원 (#1859)

### 변경됨
- [Gradle 플러그인] AGP 의존성을 `compileOnly`로 변경 (#1362)

### 수정됨
- [컴파일러] 컬럼 정의 규칙 및 테이블 인터페이스 생성기에 선택적 javadoc 추가 (#1224 by @endanke)
- [SQLite 다이얼렉트] SQLite FTS5 보조 함수 `highlight`, `snippet`, `bm25` 지원 추가 (by @drampelt)
- [MySQL 다이얼렉트] MySQL bit 데이터 타입 지원
- [MySQL 다이얼렉트] MySQL 바이너리 리터럴 지원
- [PostgreSQL 다이얼렉트] sql-psi로부터 `SERIAL` 노출 (by @veyndan)
- [PostgreSQL 다이얼렉트] `BOOLEAN` 데이터 타입 추가 (by @veyndan)
- [PostgreSQL 다이얼렉트] `NULL` 컬럼 제약 조건 추가 (by @veyndan)
- [HSQL 다이얼렉트] HSQL에 `AUTO_INCREMENT` 지원 추가 (by @rharter)

## [1.4.0] - 2020-06-22
[1.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.0

### 추가됨
- [MySQL 다이얼렉트] MySQL 지원 (by @JGulbronson & @veyndan)
- [PostgreSQL 다이얼렉트] 실험적 PostgreSQL 지원 (by @veyndan)
- [HSQL 다이얼렉트] 실험적 H2 지원 (by @MariusVolkhart)
- [SQLite 다이얼렉트] SQLite FTS5 지원 (by @benasher44 & @jpalawaga)
- [SQLite 다이얼렉트] `alter table rename column` 지원 (#1505 by @angusholder)
- [IDE] 마이그레이션(.sqm) 파일에 대한 IDE 지원
- [IDE] 내장 SQL Live 템플릿을 모방하는 SQLDelight Live 템플릿 추가 (#1154 by @veyndan)
- [IDE] 새로운 SqlDelight 파일 액션 추가 (#42 by @romtsn)
- [런타임] 결과를 반환하는 트랜잭션을 위한 `transactionWithReturn` API
- [컴파일러] .sq 파일에서 여러 SQL 문을 함께 그룹화하기 위한 문법
- [컴파일러] 마이그레이션 파일로부터 스키마 생성 지원
- [Gradle 플러그인] 마이그레이션 파일을 유효한 SQL로 출력하는 태스크 추가

### 변경됨
- [문서] 문서 웹사이트 전면 개편 (by @saket)
- [Gradle 플러그인] 지원되지 않는 다이얼렉트 에러 메시지 개선 (by @veyndan)
- [IDE] 다이얼렉트에 따라 파일 아이콘을 동적으로 변경 (by @veyndan)
- [JDBC 드라이버] `javax.sql.DataSource`로부터 `JdbcDriver` 생성자 노출 (#1614)

### 수정됨
- [컴파일러] 테이블에 대한 Javadoc 지원 및 한 파일 내의 다중 javadoc 수정 (#1224)
- [컴파일러] 합성 컬럼(synthesized columns)에 대한 값 삽입 활성화 (#1351)
- [컴파일러] 디렉토리 이름 새니타이징(sanitizing)의 불일치 수정 (by @ZacSweers)
- [컴파일러] 합성 컬럼이 조인 전체에서 널 허용 여부를 유지해야 함 (#1656)
- [컴파일러] delete 키워드에 delete 문을 고정 (#1643)
- [컴파일러] 따옴표 처리 수정 (#1525 by @angusholder)
- [컴파일러] `between` 연산자가 표현식으로 적절히 재귀하도록 수정 (#1279)
- [컴파일러] 인덱스 생성 시 누락된 테이블/컬럼에 대해 더 나은 에러 제공 (#1372)
- [컴파일러] 조인 제약 조건에서 외부 쿼리의 프로젝션 사용 활성화 (#1346)
- [Native 드라이버] `execute`가 `transationPool`을 사용하도록 수정 (by @benasher44)
- [JDBC 드라이버] JDBC 드라이버가 `autoCommit`을 true로 가정하던 문제 수정 (#2041)
- [JDBC 드라이버] 예외 발생 시 커넥션을 닫도록 보장 (#2306)
- [IDE] 가상 파일 참조가 항상 원본 파일이 되도록 보장 (#1782)
- [IDE] Bugsnag에 에러 보고 시 올바른 throwable 사용 (#1262)
- [페이징 확장] 누수되는 `DataSource` 수정 (#1628)
- [Gradle 플러그인] 스키마 생성 시 출력 db 파일이 이미 존재하면 삭제 (#1645)
- [Gradle 플러그인] 마이그레이션 검증 중 갭(gaps)이 있으면 실패 처리
- [Gradle 플러그인] 설정된 파일 인덱스를 명시적으로 사용 (#1644)

## [1.3.0] - 2020-04-03
[1.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.3.0

* 신규: [Gradle] 컴파일할 SQL 다이얼렉트를 지정하기 위한 `dialect` 프로퍼티.
* 신규: [컴파일러] #1009 MySQL 다이얼렉트 실험적 지원.
* 신규: [컴파일러] #1436 `sqlite:3.24` 다이얼렉트 및 `upsert` 지원.
* 신규: [JDBC 드라이버] sqlite jvm 드라이버에서 JDBC 드라이버 분리.
* 수정: [컴파일러] #1199 모든 길이의 람다 지원.
* 수정: [컴파일러] #1610 `avg()`의 반환 타입을 널 허용으로 수정.
* 수정: [IntelliJ] #1594 Windows에서 Goto 및 Find Usages를 망가뜨리던 경로 구분자 처리 수정.

## [1.2.2] - 2020-01-22
[1.2.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.2

* 신규: [런타임] Windows (mingW), tvOS, watchOS 및 macOS 아키텍처 지원.
* 수정: [컴파일러] `sum()`의 반환 타입은 널 허용이어야 함.
* 수정: [페이징] 경쟁 조건을 피하기 위해 `QueryDataSourceFactory`로 `Transacter` 전달.
* 수정: [IntelliJ 플러그인] 파일의 패키지 이름을 찾을 때 의존성을 검색하지 않도록 수정.
* 수정: [Gradle] #862 Gradle의 validator 로그를 debug 레벨로 변경.
* 개선: [Gradle] `GenerateSchemaTask`가 Gradle worker를 사용하도록 전환.
* 참고: `sqldelight-runtime` 아티팩트가 `runtime`으로 이름 변경됨.

## [1.2.1] - 2019-12-11
[1.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.1

* 수정: [Gradle] Kotlin Native 1.3.60 지원.
* 수정: [Gradle] #1287 동기화 시 경고 발생.
* 수정: [컴파일러] #1469 `SynetheticAccessor` 생성.
* 수정: [JVM 드라이버] 메모리 누수 수정.
* 참고: 코루틴 확장 아티팩트는 buildscript에 kotlinx bintray maven 저장소 추가가 필요합니다.

## [1.2.0] - 2019-08-30
[1.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.0

* 신규: [런타임] 안정적인 Flow API.
* 수정: [Gradle] Kotlin Native 1.3.50 지원.
* 수정: [Gradle] #1380 클린 빌드가 가끔 실패하는 문제.
* 수정: [Gradle] #1348 verify 태스크 실행 시 "Could not retrieve functions"가 출력되는 문제.
* 수정: [Compile] #1405 쿼리에 FTS 테이블이 조인되어 포함된 경우 프로젝트 빌드 불가 문제.
* 수정: [Gradle] #1266 여러 데이터베이스 모듈이 있을 때 산발적인 Gradle 빌드 실패 문제.

## [1.1.4] - 2019-07-11
[1.1.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.4

* 신규: [런타임] 실험적인 Kotlin Flow API.
* 수정: [Gradle] Kotlin/Native 1.3.40 호환성.
* 수정: [Gradle] #1243 Gradle 'configure on demand'와 함께 SQLDelight 사용 시 수정.
* 수정: [Gradle] #1385 증분 어노테이션 처리(incremental annotation processing)와 함께 SQLDelight 사용 시 수정.
* 수정: [Gradle] Gradle 태스크 캐싱 활성화.
* 수정: [Gradle] #1274 Kotlin DSL과 함께 sqldelight 확장 사용 활성화.
* 수정: [컴파일러] 각 쿼리에 대해 고유 ID가 결정론적으로 생성됨.
* 수정: [컴파일러] 트랜잭션이 완료되었을 때만 리스닝 쿼리에 통지.
* 수정: [JVM 드라이버] #1370 `JdbcSqliteDriver` 사용자가 DB URL을 제공하도록 강제.

## [1.1.3] - 2019-04-14
[1.1.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.3

* Gradle Metadata 1.0 출시.

## [1.1.2] - 2019-04-14
[1.1.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.2

* 신규: [런타임] #1267 로깅 드라이버 데코레이터.
* 수정: [컴파일러] #1254 2^16자보다 긴 문자열 리터럴 분할.
* 수정: [Gradle] #1260 생성된 소스가 멀티플랫폼 프로젝트에서 iOS 소스로 인식됨.
* 수정: [IDE] #1290 `CopyAsSqliteAction.kt:43`에서의 `kotlin.KotlinNullPointerException`.
* 수정: [Gradle] #1268 최근 버전에서 `linkDebugFrameworkIos*` 태스크 실행 실패 문제.

## [1.1.1] - 2019-03-01
[1.1.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.1

* 수정: [Gradle] Android 프로젝트를 위한 모듈 의존성 컴파일 수정.
* 수정: [Gradle] #1246 `afterEvaluate`에서 API 의존성 설정.
* 수정: [컴파일러] 배열 타입이 적절히 출력됨.

## [1.1.0] - 2019-02-27
[1.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.0

* 신규: [Gradle] #502 스키마 모듈 의존성 지정 허용.
* 개선: [컴파일러] #1111 테이블 에러가 다른 에러보다 먼저 정렬됨.
* 수정: [컴파일러] #1225 `REAL` 리터럴에 대해 올바른 타입 반환.
* 수정: [컴파일러] #1218 `docid`가 트리거를 통해 전파됨.

## [1.0.3] - 2019-01-30
[1.0.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.3

* 개선: [런타임] #1195 Native 드라이버/런타임 Arm32.
* 개선: [런타임] #1190 `Query` 타입으로부터 매퍼 노출.

## [1.0.2] - 2019-01-26
[1.0.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.2

* 수정: [Gradle 플러그인] Kotlin 1.3.20으로 업데이트.
* 수정: [런타임] 트랜잭션이 더 이상 예외를 삼키지 않음.

## [1.0.1] - 2019-01-21
[1.0.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.1

* 개선: [Native 드라이버] `DatabaseConfiguration`으로 디렉토리 이름 전달 허용.
* 개선: [컴파일러] #1173 패키지가 없는 파일은 컴파일 실패.
* 수정: [IDE] Square에 IDE 에러를 적절히 보고.
* 수정: [IDE] #1162 동일한 패키지의 타입들이 에러로 표시되지만 정상 작동하는 문제.
* 수정: [IDE] #1166 테이블 이름 변경 시 NPE로 실패하는 문제.
* 수정: [컴파일러] #1167 `UNION` 및 `SELECT`를 포함하는 복잡한 SQL 문 파싱 시도 시 예외 발생 문제.

## [1.0.0] - 2019-01-08
[1.0.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.0

* 신규: 생성된 코드 전면 개편, 이제 Kotlin으로 작성됨.
* 신규: RxJava2 확장 아티팩트.
* 신규: Android Paging 확장 아티팩트.
* 신규: Kotlin 멀티플랫폼 지원.
* 신규: Android, iOS 및 JVM SQLite 드라이버 아티팩트.
* 신규: 트랜잭션 API.

## [0.7.0] - 2018-02-12
[0.7.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.7.0

 * 신규: 생성된 코드가 Support SQLite 라이브러리만 사용하도록 업데이트되었습니다. 이제 모든 쿼리는 원시 문자열 대신 statement 객체를 생성합니다.
 * 신규: IDE에서의 Statement 폴딩.
 * 신규: Boolean 타입이 이제 자동으로 처리됩니다.
 * 수정: 코드 생성에서 지원 중단된 marshal 제거.
 * 수정: 'avg' SQL 함수 타입 매핑을 `REAL`로 수정.
 * 수정: 'julianday' SQL 함수를 정확히 탐지.

## [0.6.1] - 2017-03-22
[0.6.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.6.1

 * 신규: 인자가 없는 Delete, Update 및 Insert 문에 대해 컴파일된 statement가 생성됩니다.
 * 수정: 서브쿼리에 사용된 view 내부의 Using 절이 에러를 내지 않음.
 * 수정: 생성된 매퍼에서 중복 타입 제거.
 * 수정: 서브쿼리를 사용하여 인자를 확인하는 표현식을 사용할 수 있음.

## [0.6.0] - 2017-03-06
[0.6.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.6.0

 * 신규: Select 쿼리가 이제 문자열 상수가 아닌 `SqlDelightStatement` 팩토리로 노출됩니다.
 * 신규: Query JavaDoc이 이제 statement 및 매퍼 팩토리로 복사됩니다.
 * 신규: view 이름에 대해 문자열 상수 방출.
 * 수정: 팩토리를 요구하는 view에 대한 쿼리가 이제 해당 팩토리들을 인자로 적절히 요구함.
 * 수정: insert의 인자 개수가 지정된 컬럼 수와 일치하는지 검증.
 * 수정: where 절에 사용된 blob 리터럴을 적절히 인코딩.
 * Gradle 3.3 이상이 필요합니다.

## [0.5.1] - 2016-10-24
[0.5.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.5.1

 * 신규: 컴파일된 statement가 추상 타입을 확장함.
 * 수정: 파라미터의 원시 타입이 널 허용일 경우 박싱됨.
 * 수정: 바인드 인자를 위해 필요한 모든 팩토리가 팩토리 메서드에 존재함.
 * 수정: 이스케이프된 컬럼 이름이 적절히 마샬링됨.

## [0.5.0] - 2016-10-19
[0.5.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.5.0

 * 신규: SQLite 인자를 Factory를 통해 타입 세이프하게 전달 가능
 * 신규: IntelliJ 플러그인이 .sq 파일에서 포맷팅 수행
 * 신규: SQLite timestamp 리터럴 지원
 * 수정: IntelliJ에서 파라미터화된 타입을 클릭하여 이동 가능
 * 수정: 이스케이프된 컬럼 이름이 Cursor에서 가져올 때 더 이상 `RuntimeException`을 발생시키지 않음.
 * 수정: Gradle 플러그인이 예외를 출력하려고 할 때 크래시 나지 않음.

## [0.4.4] - 2016-07-20
[0.4.4]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.4

 * 신규: 컬럼 Java 타입으로 short 원시 지원
 * 신규: 생성된 매퍼 및 팩토리 메서드에 Javadoc 추가
 * 수정: group_concat 및 nullif 함수의 널 허용 여부 수정
 * 수정: Android Studio 2.2-alpha와의 호환성
 * 수정: `WITH RECURSIVE`가 더 이상 플러그인을 크래시 내지 않음

## [0.4.3] - 2016-07-07
[0.4.3]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.3

 * 신규: 컴파일 에러가 소스 파일로 링크됨.
 * 신규: 우클릭하여 SQLDelight 코드를 유효한 SQLite로 복사 가능.
 * 신규: 이름이 명명된 statement의 Javadoc이 생성된 String에 나타남.
 * 수정: 생성된 view 모델이 널 허용 어노테이션을 포함함.
 * 수정: 유니온으로부터 생성된 코드가 가능한 모든 컬럼을 지원하도록 적절한 타입과 널 허용 여부를 가짐.
 * 수정: 생성된 코드에서 sum 및 round SQLite 함수가 적절한 타입을 가짐.
 * 수정: CAST, 내부 select 버그 수정.
 * 수정: CREATE TABLE 문에서의 자동 완성.
 * 수정: SQLite 키워드를 패키지에 사용 가능.

## [0.4.2] - 2016-06-16
[0.4.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.2

 * 신규: Marshal을 팩토리로부터 생성 가능.
 * 수정: IntelliJ 플러그인이 적절한 제네릭 순서로 팩토리 메서드를 생성함.
 * 수정: 함수 이름에 대소문자 구분 없이 사용 가능.

## [0.4.1] - 2016-06-14
[0.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.1

 * 수정: IntelliJ 플러그인이 적절한 제네릭 순서로 클래스를 생성함.
 * 수정: 컬럼 정의에 대소문자 구분 없이 사용 가능.

## [0.4.0] - 2016-06-14
[0.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.0

 * 신규: 매퍼가 테이블 당 하나가 아닌 쿼리 당 하나씩 생성됨.
 * 신규: .sq 파일에서 Java 타입을 임포트 가능.
 * 신규: SQLite 함수 검증.
 * 수정: 중복 에러 제거.
 * 수정: 대문자 컬럼 이름 및 Java 키워드 컬럼 이름이 에러를 내지 않음.

## [0.3.2] - 2016-05-14
[0.3.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.2

 * 신규: 자동 완성 및 사용처 찾기가 view 및 에일리어스(alias)에 대해 작동함.
 * 수정: 컴파일 타임 검증이 select에서 함수 사용을 허용함.
 * 수정: 기본값만 선언하는 insert 문 지원.
 * 수정: SQLDelight를 사용하지 않는 프로젝트를 임포트할 때 플러그인이 더 이상 크래시 나지 않음.

## [0.3.1] - 2016-04-27
[0.3.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.1

  * 수정: Interface 가시성이 다시 public으로 변경되어 메서드 참조로부터 발생하는 Illegal Access 런타임 예외를 방지함.
  * 수정: 서브 표현식이 적절히 평가됨.

## [0.3.0] - 2016-04-26
[0.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.0

  * 신규: 컬럼 정의는 SQLite 타입을 사용하며 Java 타입을 지정하기 위한 추가적인 'AS' 제약 조건을 가질 수 있음.
  * 신규: IDE에서 버그 리포트 전송 가능.
  * 수정: 자동 완성이 정상 작동함.
  * 수정: .sq 파일 편집 시 SQLDelight 모델 파일이 업데이트됨.
  * 삭제: 연결된(Attached) 데이터베이스 더 이상 지원되지 않음.

## [0.2.2] - 2016-03-07
[0.2.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.2

 * 신규: insert, update, delete, index 및 trigger 문에 사용된 컬럼의 컴파일 타임 검증.
 * 수정: 파일 이동/생성 시 IDE 플러그인 크래시 방지.

## [0.2.1] - 2016-03-07
[0.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.1

 * 신규: Ctrl+`/` (OSX의 경우 Cmd+`/`)로 선택한 라인의 주석 처리를 토글.
 * 신규: SQL 쿼리에 사용된 컬럼의 컴파일 타임 검증.
 * 수정: IDE와 Gradle 플러그인 모두에서 Windows 경로 지원.

## [0.2.0] - 2016-02-29
[0.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.0

 * 신규: Marshal 클래스에 복사 생성자 추가.
 * 신규: Kotlin 1.0 final로 업데이트.
 * 수정: 'sqldelight' 폴더 구조 문제를 실패하지 않는 방식으로 보고.
 * 수정: `table_name`이라는 이름의 컬럼 금지. 이들의 생성된 상수가 테이블 이름 상수와 충돌함.
 * 수정: `.sq` 파일 개방 여부와 상관없이 IDE 플러그인이 즉시 모델 클래스를 생성하도록 보장.
 * 수정: IDE와 Gradle 플러그인 모두에서 Windows 경로 지원.

## [0.1.2] - 2016-02-13
[0.1.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.2

 * 수정: 대부분의 프로젝트에서 Gradle 플러그인 사용을 방해하던 코드 제거.
 * 수정: Antlr 런타임에 대한 누락된 컴파일러 의존성 추가.

## [0.1.1] - 2016-02-12
[0.1.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.1

 * 수정: Gradle 플러그인이 자신과 동일한 버전의 런타임을 가리키도록 보장.

## [0.1.0] - 2016-02-12
[0.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.0

최초 릴리스.