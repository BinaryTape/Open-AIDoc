# 변경 기록

## 미출시 {id="unreleased"}

### 추가됨 {id="added"}

- 아직 없음!

### 변경됨 {id="changed"}

- [Gradle 플러그인] 전체 코드 생성 작업 동안 파싱된 `.sq` 파일을 메모리에 유지하여 가비지 컬렉션 이후에 다시 파싱되지 않도록 변경했습니다. 이를 통해 대규모 프로젝트에서 코드 생성 속도를 향상시킬 수 있습니다. (@C2H6O 님의 #6374)
- [IntelliJ 플러그인] 이제 비정상 종료(크래시)가 커스텀 Bugsnag 인스턴스 대신 JetBrains Marketplace로 보고됩니다. (@JakeWharton 님의 #6376)

### 수정됨 {id="fixed"}

- [IntelliJ 플러그인] IntelliJ API 사용 방식을 변경하여 플러그인 배포 위반 문제를 수정했습니다. (@griffio 님의 #6366, #6368)

## [2.4.0] - 2026-09-17 {id="2-4-0-2026-09-17"}
[2.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0

### 추가됨
- [네이티브 드라이버] `inMemoryDriver`에 `extendedConfig` 매개변수를 추가했습니다. (@GuilhE 님의 #5539)
- [PostgreSQL 방언] 암시적으로 정의된 시스템 컬럼에 대한 쿼리 지원을 추가했습니다. (@griffio 님의 #5834)
- [PostgreSQL 방언] 기본적인 배열 리터럴 지원을 추가했습니다. (@griffio 님의 #5997)
- [PostgreSQL 방언] 기본적인 LTREE 지원을 추가했습니다. (@yesitskev 님, @griffio 님의 #5880)
- [MySQL 방언] INET 함수 지원을 추가했습니다. (@mcxinyu 님의 #5072)
- [PostgreSQL 방언] ALTER INDEX 지원을 추가했습니다. (@griffio 님의 #6224)
- [SQLite 방언] SQLite 3.44 집계 함수 DISTINCT, ORDER BY, FILTER 지원을 추가했습니다. (@griffio 님의 #6236)
- [SQLite 방언] SQLite 3.37 STRICT 테이블 지원을 추가했습니다. (@griffio 님의 #6230)
- [Gradle 플러그인] `codegenExcludedColumns`를 사용하여 생성된 모델에서 컬럼을 제외할 수 있는 지원을 추가했습니다. (@sokolikp 님의 #6243)
- [컴파일러] 스키마에 `allTableNames` 함수를 추가했습니다. (@edenman 님의 #6245)
- [PostgreSQL 방언] ANY 연산자 지원을 추가했습니다. (@griffio 님의 #6253)
- [SQLite 방언] SQLite 3.39 RIGHT JOIN 및 FULL JOIN 지원을 추가했습니다. (@griffio 님의 #6273)
- [PostgreSQL 방언] 트리거 함수에서 `RAISE` 문과 `FOUND` 변수 지원을 추가했습니다. (@griffio 님의 #6297)

### 변경됨
- [PostgreSQL 방언] arrayIntermediateType의 가시성을 public으로 변경했습니다. (@griffio 님의 #5835)
- [Gradle 플러그인] 더 엄격한 MigrationFile 버전 관리를 구현했습니다. (@madisp 님의 #5730)
- [Gradle 플러그인] 최소 지원 Gradle 버전을 8.2.1로 상향했습니다. (@maxsav 님의 #6217)
- [Gradle 플러그인] Gradle 격리된 프로젝트(Isolated Projects)를 지원합니다. (@maxsav 님의 #6217)
- [IntelliJ 플러그인] 최소 지원 버전이 2023.3 / Android Studio Jellyfish로 변경되었습니다.

### 수정됨
- [Gradle 플러그인] JDK 24+ 환경에서 컴파일러 워커의 `sun.misc.Unsafe` 지원 중단 경고를 억제했습니다. (#6321)
- [컴파일러] 생성된 코드에서 불필요한 Kotlin 경고를 억제했습니다. (@eyupcanakman 님의 #6208)
- [컴파일러] 그룹화되지 않은 집계 결과 집합의 다른 컬럼이 항상 nullable이 되도록 수정했습니다.
- [PostgreSQL 방언] coalesce 및 ifnull에 대한 널 가능성(nullability)이 올바르게 확인되도록 수정했습니다.
- [PostgreSQL 방언] PostgreSQL 방언의 IDE 통합 문제를 수정했습니다.
- [PostgreSQL 방언] PostgreSQL 방언용 IDE 플러그인을 개선했습니다. (@griffio 님의 #6209)
- [IntelliJ 플러그인] IDE 플러그인이 모든 방언에 대해 코드 완성을 수행할 수 있도록 개선했습니다. (@griffio 님의 #6210)
- [Gradle 플러그인] 데이터베이스 검증 태스크 실행 시 발생하는 순환 종속성 오류를 수정했습니다. (@griffio 님의 #6221)
- [컴파일러] 다중 행 업데이트에 대한 낙관적 락(optimistic lock)을 수정했습니다. (@griffio 님의 #6240)
- [IntelliJ 플러그인] IDEA 2026.2에서 비정상 종료를 유발하던 지원 중단 문제를 수정했습니다. (@griffio 님의 #6247)
- [Gradle 플러그인] AGP 8.9부터 8.11까지의 버전에서 생성된 소스가 Kotlin 컴파일에 인식되지 않던 문제를 수정했습니다.
- [PostgreSQL 방언] Primitive 바인드 인자를 사용하는 lower 및 upper 함수의 기본값이 TEXT가 되도록 수정했습니다. (@griffio 님의 #6262)
- [컴파일러] 어댑터 사용 및 널 가능성을 변경하는 마이그레이션이 포함된 데이터 클래스 바인딩 시 insert values 문제를 수정했습니다. (griffio 님의 #6269)
- [컴파일러] null 안전 연산자(IS 및 IS DISTINCT FROM)에 nullable 바인드 인자를 사용하도록 수정했습니다. (@griffio 님의 #6265)
- [Gradle 플러그인] 프로젝트 종속성에 AGP의 배선(variant) 확인을 사용하도록 변경했습니다. (@maxsav 님의 #6217)
- [Gradle 플러그인] 빌드 간 AGP 배선 목록이 다를 때 generateDatabaseInterface 태스크의 빌드 캐시 미스가 발생하던 문제를 수정했습니다.
- [Gradle 플러그인] 데이터베이스를 구성하지 않고 플러그인을 적용했을 때 IDE 동기화가 중단되던 문제를 수정했습니다. (#6088)
- [PostgreSQL 방언] 중첩 함수 호출을 사용할 때 json 집계 함수 관련 문제를 수정했습니다. (@griffio 님의 #6281)
- [Paging3 확장] 빈 데이터베이스에서 KeyedQueryPagingSource가 비정상 종료되던 문제를 수정했습니다. (@woods-marshes 님의 #6284)
- [컴파일러] `COALESCE`와 같은 캡슐화 함수와 함께 mutator 구문을 사용할 때 발생하는 Java 타입 어댑터 문제를 수정했습니다. (@griffio 님의 #6292)
- [컴파일러] 모듈 이름이 대문자로 시작할 때 생성된 코드의 패키지 이름도 대문자로 지정되던 문제를 수정했습니다. (@griffio 님의 #6316)
- [PostgreSQL 방언] 날짜 데이터 타입의 대소문자를 구분하지 않도록 허용했습니다. (@griffio 님의 #6328)
- [PostgreSQL 방언] `string_agg` 함수가 nullable이 되도록 수정했습니다. (@griffio 님의 #6340)
- [SQLite 방언] `GROUP BY`를 사용하는 SQLite 3.44 집계 함수 문제를 수정했습니다. (@griffio 님의 #6343)
- [Gradle 플러그인] 구성(Configuration) 단계에서 데이터베이스 종속성이 확인되지 않도록 개선했습니다. (@joshfriend 님의 #6353)

## [2.4.0-rc2] - 2026-09-14 {id="2-4-0-rc2-2026-09-14"}
[2.4.0-rc2]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0-rc2

### 수정됨

- [PostgreSQL 방언] `string_agg` 함수가 nullable이 되도록 수정했습니다. (@griffio 님의 #6340)
- [SQLite 방언] `GROUP BY`를 사용하는 SQLite 3.44 집계 함수 문제를 수정했습니다. (@griffio 님의 #6343)
- [Gradle 플러그인] 구성 단계에서 데이터베이스 종속성이 확인되지 않도록 개선했습니다. (@joshfriend 님의 #6353)

## [2.4.0-rc1] - 2026-09-01 {id="2-4-0-rc1-2026-09-01"}
[2.4.0-rc1]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0-rc1

### 추가됨
- [네이티브 드라이버] `inMemoryDriver`에 `extendedConfig` 매개변수를 추가했습니다. (@GuilhE 님의 #5539)
- [PostgreSQL 방언] 암시적으로 정의된 시스템 컬럼에 대한 쿼리 지원을 추가했습니다. (@griffio 님의 #5834)
- [PostgreSQL 방언] 기본적인 배열 리터럴 지원을 추가했습니다. (@griffio 님의 #5997)
- [PostgreSQL 방언] 기본적인 LTREE 지원을 추가했습니다. (@yesitskev 님, @griffio 님의 #5880)
- [MySQL 방언] INET 함수 지원을 추가했습니다. (@mcxinyu 님의 #5072)
- [PostgreSQL 방언] ALTER INDEX 지원을 추가했습니다. (@griffio 님의 #6224)
- [SQLite 방언] SQLite 3.44 집계 함수 DISTINCT, ORDER BY, FILTER 지원을 추가했습니다. (@griffio 님의 #6236)
- [SQLite 방언] SQLite 3.37 STRICT 테이블 지원을 추가했습니다. (@griffio 님의 #6230)
- [Gradle 플러그인] `codegenExcludedColumns`를 사용하여 생성된 모델에서 컬럼을 제외할 수 있는 지원을 추가했습니다. (@sokolikp 님의 #6243)
- [컴파일러] 스키마에 `allTableNames` 함수를 추가했습니다. (@edenman 님의 #6245)
- [PostgreSQL 방언] ANY 연산자 지원을 추가했습니다. (@griffio 님의 #6253)
- [SQLite 방언] SQLite 3.39 RIGHT JOIN 및 FULL JOIN 지원을 추가했습니다. (@griffio 님의 #6273)
- [PostgreSQL 방언] 트리거 함수에서 `RAISE` 문과 `FOUND` 변수 지원을 추가했습니다. (@griffio 님의 #6297)

### 변경됨
- [PostgreSQL 방언] arrayIntermediateType의 가시성을 public으로 변경했습니다. (@griffio 님의 #5835)
- [Gradle 플러그인] 더 엄격한 MigrationFile 버전 관리를 구현했습니다. (@madisp 님의 #5730)
- [Gradle 플러그인] 최소 지원 Gradle 버전을 8.2.1로 상향했습니다. (@maxsav 님의 #6217)
- [Gradle 플러그인] Gradle 격리된 프로젝트를 지원합니다. (@maxsav 님의 #6217)
- [IntelliJ 플러그인] 최소 지원 버전이 2023.3 / Android Studio Jellyfish로 변경되었습니다.

### 수정됨
- [Gradle 플러그인] JDK 24+ 환경에서 컴파일러 워커의 `sun.misc.Unsafe` 지원 중단 경고를 억제했습니다. (#6321)
- [컴파일러] 생성된 코드에서 불필요한 Kotlin 경고를 억제했습니다. (@eyupcanakman 님의 #6208)
- [컴파일러] 그룹화되지 않은 집계 결과 집합의 다른 컬럼이 항상 nullable이 되도록 수정했습니다.
- [PostgreSQL 방언] coalesce 및 ifnull에 대한 널 가능성이 올바르게 확인되도록 수정했습니다.
- [PostgreSQL 방언] PostgreSQL 방언의 IDE 통합 문제를 수정했습니다.
- [PostgreSQL 방언] PostgreSQL 방언용 IDE 플러그인을 개선했습니다. (@griffio 님의 #6209)
- [IntelliJ 플러그인] IDE 플러그인이 모든 방언에 대해 코드 완성을 수행할 수 있도록 개선했습니다. (@griffio 님의 #6210)
- [Gradle 플러그인] 데이터베이스 검증 태스크 실행 시 발생하는 순환 종속성 오류를 수정했습니다. (@griffio 님의 #6221)
- [컴파일러] 다중 행 업데이트에 대한 낙관적 락을 수정했습니다. (@griffio 님의 #6240)
- [IntelliJ 플러그인] IDEA 2026.2에서 비정상 종료를 유발하던 지원 중단 문제를 수정했습니다. (@griffio 님의 #6247)
- [Gradle 플러그인] AGP 8.9부터 8.11까지의 버전에서 생성된 소스가 Kotlin 컴파일에 인식되지 않던 문제를 수정했습니다.
- [PostgreSQL 방언] Primitive 바인드 인자를 사용하는 lower 및 upper 함수의 기본값이 TEXT가 되도록 수정했습니다. (@griffio 님의 #6262)
- [컴파일러] 어댑터 사용 및 널 가능성을 변경하는 마이그레이션이 포함된 데이터 클래스 바인딩 시 insert values 문제를 수정했습니다. (griffio 님의 #6269)
- [컴파일러] null 안전 연산자(IS 및 IS DISTINCT FROM)에 nullable 바인드 인자를 사용하도록 수정했습니다. (@griffio 님의 #6265)
- [Gradle 플러그인] 프로젝트 종속성에 AGP의 배선 확인을 사용하도록 변경했습니다. (@maxsav 님의 #6217)
- [Gradle 플러그인] 빌드 간 AGP 배선 목록이 다를 때 generateDatabaseInterface 태스크의 빌드 캐시 미스가 발생하던 문제를 수정했습니다.
- [Gradle 플러그인] 데이터베이스를 구성하지 않고 플러그인을 적용했을 때 IDE 동기화가 중단되던 문제를 수정했습니다. (#6088)
- [PostgreSQL 방언] 중첩 함수 호출을 사용할 때 json 집계 함수 관련 문제를 수정했습니다. (@griffio 님의 #6281)
- [Paging3 확장] 빈 데이터베이스에서 KeyedQueryPagingSource가 비정상 종료되던 문제를 수정했습니다. (@woods-marshes 님의 #6284)
- [컴파일러] `COALESCE`와 같은 캡슐화 함수와 함께 mutator 구문을 사용할 때 발생하는 Java 타입 어댑터 문제를 수정했습니다. (@griffio 님의 #6292)
- [컴파일러] 모듈 이름이 대문자로 시작할 때 생성된 코드의 패키지 이름도 대문자로 지정되던 문제를 수정했습니다. (@griffio 님의 #6316)
- [PostgreSQL 방언] 날짜 데이터 타입의 대소문자를 구분하지 않도록 허용했습니다. (@griffio 님의 #6328)

## [2.3.2] - 2026-03-16 {id="2-3-2-2026-03-16"}
[2.3.2]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.2

### 추가됨
- [PostgreSQL 방언] ALTER TABLE ALTER TYPE USING 표현식 지원을 개선했습니다. (@griffio 님의 #6116)
- [PostgreSQL 방언] DROP COLUMN IF EXISTS 지원을 추가했습니다. (@griffio 님의 #6112)
- [Gradle 플러그인] Select 와일드카드 확장을 끌 수 있는 expandSelectStar 플래그를 추가했습니다. (@griffio 님의 #5813)
- [MySQL 방언] 윈도우 함수 지원을 추가했습니다. (@griffio 님의 #6086)
- [Gradle 플러그인] 시작 스키마 버전이 1이 아니고 verifyMigrations가 true일 때 빌드가 실패하던 문제를 수정했습니다. (@neilgmiller 님의 #6017)
- [Gradle 플러그인] `SqlDelightWorkerTask`의 설정을 더 유연하게 변경할 수 있도록 하고, Windows 환경에서의 개발을 지원하도록 기본 구성을 업데이트했습니다. (@MSDarwish2000 님의 #5215)
- [SQLite 방언] FTS5 가상 테이블의 합성 컬럼(synthesized column) 지원을 추가했습니다. (@watbe 님의 #5986)
- [PostgreSQL 방언] Postgres 행 수준 보안(row level security) 지원을 추가했습니다. (@shellderp 님의 #6087)
- [PostgreSQL 방언] FOR UPDATE를 확장하여 OF table, NO KEY UPDATE, NO WAIT를 지원하도록 했습니다. (@shellderp 님의 #6104)
- [PostgreSQL 방언] Postgis Point 타입 및 관련 함수를 지원합니다. (@vanniktech 님의 #5602)
- [런타임] 트랜잭션의 `CoroutineContext`를 제어할 수 있는 메커니즘을 제공하는 `SuspendingTransacter.TransactionDispatcher`를 추가했습니다. (@eygraber 님의 #5967)
- [Gradle 플러그인] Android Gradle Plugin 9.0의 새로운 DSL과의 완전한 호환성을 지원합니다. (#6140)
- [PostgreSQL 방언] PostgreSQL CREATE TABLE 스토리지 매개변수를 지원합니다. (@griffio 님의 #6148)
- [PostgreSQL 방언] PostgreSQL UNIQUE 테이블 제약 조건의 nullable 결과 컬럼 문제를 수정했습니다. (@griffio 님의 #6167)

### 변경됨
- [컴파일러] 컴파일러 출력 타입을 java.lang.Void에서 kotlin.Nothing으로 변경했습니다. (@griffio 님의 #6099)
- [컴파일러] 패키지 이름에 언더스코어(_)를 허용합니다. 이전에는 언더스코어가 제거되어 예기치 않은 동작이 발생했습니다. (@BierDav 님의 #6027)
- [페이징 확장] AndroidX Paging으로 전환했습니다. (@jeffdgr8 님의 #5910)
- [Android 드라이버] Android minSdk를 23으로 상향했습니다. (#6141)
- [페이징 확장] Paging 3.4.1로 업그레이드하고 X64 Apple 타깃을 제거했습니다. (#6166)

### 수정됨
- [IntelliJ 플러그인] VFS 새로고침 이벤트 도중 EDT에서 파일 타입 감지가 차단되어 발생하던 IDE 프리징 현상을 수정했습니다.
- [SQLite 방언] Json 경로 연산자 사용 시 발생하는 SQLite 3.38 컴파일 오류를 수정했습니다. (@griffio 님의 #6070)
- [SQLite 방언] 커스텀 컬럼 타입을 사용할 때 group_concat 함수에 String 타입을 사용하도록 수정했습니다. (@griffio 님의 #6082)
- [Gradle 플러그인] 복잡한 스키마에서 `VerifyMigrationTask`가 멈추는 현상을 방지하도록 성능을 개선했습니다. (@Lightwood13 님의 #6073)
- [IntelliJ 플러그인] 플러그인 초기화 예외를 수정하고 지원 중단된 메서드를 업데이트했습니다. (@griffio 님의 #6040)
- [Gradle 플러그인] Android Gradle Plugin에 내장된 Kotlin과의 호환성 문제를 수정했습니다. (#6139)

## [2.3.1] - 2025-03-12 {id="2-3-1-2025-03-12"}
[2.3.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.1

릴리스에 실패했습니다. 2.3.2 버전을 사용하세요!

## [2.3.0] - 2025-03-12 {id="2-3-0-2025-03-12"}
[2.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.0

릴리스에 실패했습니다. 2.3.2 버전을 사용하세요!

## [2.2.1] - 2025-11-13 {id="2-2-1-2025-11-13"}
[2.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.2.1

### 추가됨
- [PostgreSQL 방언] Postgres numeric/integer/biginteger 타입 매핑을 수정했습니다. (@griffio 님의 #5994)
- [컴파일러] CAST가 필요할 때 컴파일러 오류 메시지에 소스 파일 위치가 포함되도록 개선했습니다. (@griffio 님의 #5979)
- [PostgreSQL 방언] Postgres JSON 연산자 경로 추출 지원을 추가했습니다. (@griffio 님의 #5971)
- [SQLite 방언] 공통 테이블 표현식(CTE)을 사용하는 MATERIALIZED 쿼리 플래너 힌트에 대한 SQLite 3.35 지원을 추가했습니다. (@griffio 님의 #5961)
- [PostgreSQL 방언] 공통 테이블 표현식(CTE)을 사용하는 MATERIALIZED 쿼리 플래너 힌트 지원을 추가했습니다. (@griffio 님의 #5961)
- [PostgreSQL 방언] Postgres JSON 집계 FILTER 지원을 추가했습니다. (@griffio 님의 #5957)
- [PostgreSQL 방언] Postgres 열거형(Enum) 지원을 추가했습니다. (@griffio 님의 #5935)
- [PostgreSQL 방언] Postgres 트리거에 대한 제한적 지원을 추가했습니다. (@griffio 님의 #5932)
- [PostgreSQL 방언] SQL 표현식이 JSON으로 파싱될 수 있는지 확인하는 조건자(predicate)를 추가했습니다. (@griffio 님의 #5843)
- [PostgreSQL 방언] PostgreSQL Comment On 문에 대한 제한적 지원을 추가했습니다. (@griffio 님의 #5808)
- [MySQL 방언] 인덱스 가시성(visibility) 옵션 지원을 추가했습니다. (@orenkislev-faire 님의 #5785)
- [PostgreSQL 방언] TSQUERY 데이터 타입 지원을 추가했습니다. (@griffio 님의 #5779)
- [Gradle 플러그인] 모듈 추가 시 버전 카탈로그(Version Catalogs) 지원을 추가했습니다. (@DRSchlaubi 님의 #5755)

### 변경됨
- 이제 개발 중인 스냅샷이 Central Portal Snapshots 저장소(https://central.sonatype.com/repository/maven-snapshots/)에 게시됩니다.
- [컴파일러] 생성자 참조를 사용하여 기본 생성 쿼리를 단순화했습니다. (@jonapoul 님의 #5814)

### 수정됨
- [컴파일러] 공통 테이블 표현식(CTE)을 포함하는 뷰를 사용할 때 발생하는 스택 오버플로를 수정했습니다. (@griffio 님의 #5928)
- [Gradle 플러그인] "New Connection"을 추가하기 위해 SqlDelight 도구 창을 열 때 발생하는 비정상 종료를 수정했습니다. (@griffio 님의 #5906)
- [IntelliJ 플러그인] copy-to-sqlite 거터(gutter) 액션에서 스레딩 관련 충돌을 방지했습니다. (@griffio 님의 #5901)
- [IntelliJ 플러그인] 스키마 문 CREATE INDEX 및 CREATE VIEW를 사용할 때 PostgreSQL 방언 관련 문제를 수정했습니다. (@griffio 님의 #5772)
- [컴파일러] 컬럼 참조 시 발생하는 FTS 스택 오버플로를 수정했습니다. (@griffio 님의 #5896)
- [컴파일러] With Recursive 스택 오버플로를 수정했습니다. (@griffio 님의 #5892)
- [컴파일러] Insert|Update|Delete Returning 문에 대한 Notify를 수정했습니다. (@griffio 님의 #5851)
- [컴파일러] Long을 반환하는 트랜잭션 블록의 비동기 결과 타입을 수정했습니다. (@griffio 님의 #5836)
- [컴파일러] SQL 매개변수 바인딩 복잡도를 O(n²)에서 O(n)으로 최적화했습니다. (@chenf7 님의 #5898)
- [SQLite 방언] SQLite 3.18 누락 함수들을 수정했습니다. (@griffio 님의 #5759)

## [2.2.0] - 2025-11-13 {id="2-2-0-2025-11-13"}
[2.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.2.0

아티팩트가 부분적으로 배포되어 릴리스에 실패했습니다. 2.2.1 버전을 사용하세요!

## [2.1.0] - 2025-05-16 {id="2-1-0-2025-05-16"}
[2.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.1.0

### 추가됨
- [WASM 드라이버] 웹 워커 드라이버에 wasmJs 지원을 추가했습니다. (@IlyaGulya 님의 #5534)
- [PostgreSQL 방언] PostgreSQL UnNest Array to rows를 지원합니다. (@griffio 님의 #5673)
- [PostgreSQL 방언] PostgreSQL TSRANGE/TSTZRANGE를 지원합니다. (@griffio 님의 #5297)
- [PostgreSQL 방언] PostgreSQL Right Full Join을 지원합니다. (@griffio 님의 #5086)
- [PostgreSQL 방언] PostgreSQL 시간(temporal) 타입에서의 extract를 지원합니다. (@griffio 님의 #5273)
- [PostgreSQL 방언] PostgreSQL 배열 포함 연산자를 지원합니다. (@griffio 님의 #4933)
- [PostgreSQL 방언] PostgreSQL drop constraint를 지원합니다. (@griffio 님의 #5288)
- [PostgreSQL 방언] PostgreSQL 타입 캐스팅을 지원합니다. (@griffio 님의 #5089)
- [PostgreSQL 방언] 하위 쿼리에 대한 PostgreSQL lateral join 연산자를 지원합니다. (@griffio 님의 #5122)
- [PostgreSQL 방언] PostgreSQL ILIKE 연산자를 지원합니다. (@griffio 님의 #5330)
- [PostgreSQL 방언] PostgreSQL XML 타입을 지원합니다. (@griffio 님의 #5331)
- [PostgreSQL 방언] PostgreSQL AT TIME ZONE을 지원합니다. (@griffio 님의 #5243)
- [PostgreSQL 방언] PostgreSQL order by nulls를 지원합니다. (@griffio 님의 #5199)
- [PostgreSQL 방언] PostgreSQL 현재 날짜/시간 함수 지원을 추가했습니다. (@drewd 님의 #5226)
- [PostgreSQL 방언] PostgreSQL 정규식 연산자를 지원합니다. (@griffio 님의 #5137)
- [PostgreSQL 방언] brin gist를 추가했습니다. (@griffio 님의 #5059)
- [MySQL 방언] MySQL 방언을 위한 RENAME INDEX를 지원합니다. (@orenkislev-faire 님의 #5212)
- [JSON 확장] json 테이블 함수에 alias를 추가했습니다. (@griffio 님의 #5372)

### 변경됨
- [컴파일러] 생성된 쿼리 파일이 단순 mutator에 대해 변경된 행 수를 반환하도록 변경했습니다. (@MariusVolkhart 님의 #4578)
- [네이티브 드라이버] DELETE, INSERT, UPDATE 문에 대해 읽기 전용 플래그를 변경하도록 NativeSqlDatabase.kt를 업데이트했습니다. (@griffio 님의 #5680)
- [PostgreSQL 방언] PgInterval을 String으로 변경했습니다. (@griffio 님의 #5403)
- [PostgreSQL 방언] PostgreSQL 확장을 구현하기 위한 SqlDelight 모듈을 지원합니다. (@griffio 님의 #5677)

### 수정됨
- [컴파일러] 결과가 있는 그룹 문 실행 시 쿼리 알림(notify) 문제를 수정했습니다. (@vitorhugods 님의 #5006)
- [컴파일러] SqlDelightModule 타입 리졸버를 수정했습니다. (@griffio 님의 #5625)
- [컴파일러] 이스케이프된 컬럼 객체 삽입 관련 5501 문제를 수정했습니다. (@griffio 님의 #5503)
- [컴파일러] 경로 링크를 클릭했을 때 정확한 행 및 문자 위치로 이동하도록 오류 메시지를 개선했습니다. (@vanniktech 님의 #5604)
- [컴파일러] 5298 문제 수정: 키워드를 테이블 이름으로 사용할 수 있도록 허용했습니다.
- [컴파일러] 명명된 실행(named executes) 문제를 수정하고 테스트를 추가했습니다.
- [컴파일러] 초기화 구문을 정렬할 때 외래 키 테이블 제약 조건을 고려하도록 수정했습니다. (@TheMrMilchmann 님의 #5325)
- [컴파일러] 탭 문자가 포함되어 있을 때 오류 밑줄이 올바르게 맞춰지도록 수정했습니다. (@drewd 님의 #5224)
- [JDBC 드라이버] 트랜잭션 종료 시 connectionManager의 메모리 누수를 수정했습니다.
- [JDBC 드라이버] 문서에 언급된 대로 SQLite 마이그레이션을 트랜잭션 내부에서 실행하도록 수정했습니다. (@morki 님의 #5218)
- [JDBC 드라이버] 트랜잭션 커밋 / 롤백 후 발생하는 연결 누수를 수정했습니다. (@morki 님의 #5205)
- [Gradle 플러그인] `GenerateSchemaTask` 전에 `DriverInitializer`를 실행하도록 수정했습니다. (@nwagu 님의 #5562)
- [런타임] 실제 드라이버가 비동기일 때 LogSqliteDriver에서 발생하는 비정상 종료를 수정했습니다. (@edenman 님의 #5723)
- [런타임] StringBuilder 용량 문제를 수정했습니다. (@janbina 님의 #5192)
- [PostgreSQL 방언] PostgreSQL CREATE OR REPLACE VIEW를 지원하도록 수정했습니다. (@griffio 님의 #5407)
- [PostgreSQL 방언] PostgreSQL to_json을 수정했습니다. (@griffio 님의 #5606)
- [PostgreSQL 방언] PostgreSQL numeric 리졸버를 수정했습니다. (@griffio 님의 #5399)
- [PostgreSQL 방언] SQLite 윈도우 함수를 수정했습니다. (@griffio 님의 #2799)
- [PostgreSQL 방언] PostgreSQL SELECT DISTINCT ON을 수정했습니다. (@griffio 님의 #5345)
- [PostgreSQL 방언] ALTER TABLE ADD COLUMN IF NOT EXISTS를 수정했습니다. (@griffio 님의 #5309)
- [PostgreSQL 방언] PostgreSQL 비동기 바인드 매개변수를 수정했습니다. (@griffio 님의 #5313)
- [PostgreSQL 방언] PostgreSQL 불리언 리터럴을 수정했습니다. (@griffio 님의 #5262)
- [PostgreSQL 방언] PostgreSQL 윈도우 함수를 수정했습니다. (@griffio 님의 #5155)
- [PostgreSQL 방언] PostgreSQL isNull isNotNull 타입을 수정했습니다. (@griffio 님의 #5173)
- [PostgreSQL 방언] PostgreSQL SELECT DISTINCT를 수정했습니다. (@griffio 님의 #5172)
- [페이징 확장] 페이징 새로고침 시 초기 로드 문제를 수정했습니다. (@evant 님의 #5615)
- [페이징 확장] macOS 네이티브 타깃을 추가했습니다. (@vitorhugods 님의 #5324)
- [IntelliJ 플러그인] K2를 지원합니다.

## [2.0.2] - 2024-04-05 {id="2-0-2-2024-04-05"}
[2.0.2]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.2

### 추가됨
- [PostgreSQL 방언] PostgreSQL STRING_AGG 함수를 추가했습니다. (@anddani 님의 #4950)
- [PostgreSQL 방언] pg 방언에 SET 문을 추가했습니다. (@de-luca 님의 #4927)
- [PostgreSQL 방언] PostgreSQL ALTER COLUMN 시퀀스 매개변수를 추가했습니다. (@griffio 님의 #4916)
- [PostgreSQL 방언] INSERT 문에 대한 PostgreSQL ALTER COLUMN DEFAULT 지원을 추가했습니다. (@griffio 님의 #4912)
- [PostgreSQL 방언] PostgreSQL ALTER SEQUENCE 및 DROP SEQUENCE를 추가했습니다. (@griffio 님의 #4920)
- [PostgreSQL 방언] Postgres 정규식 함수 정의를 추가했습니다. (@MariusVolkhart 님의 #5025)
- [PostgreSQL 방언] GIN 문법을 추가했습니다. (@griffio 님의 #5027)

### 변경됨
- [IDE 플러그인] 최소 지원 버전이 2023.1 / Android Studio Iguana로 변경되었습니다.
- [컴파일러] encapsulatingType에서 타입 널 가능성을 재정의할 수 있도록 허용했습니다. (@eygraber 님의 #4882)
- [컴파일러] SELECT *에 대한 컬럼 이름을 인라인화했습니다.
- [Gradle 플러그인] processIsolation으로 전환했습니다. (@nwagu 님의 #5068)
- [Android 런타임] Android minSDK를 21로 상향했습니다. (@hfhbd 님의 #5094)
- [드라이버] 방언 작성자를 위해 더 많은 JDBC/R2DBC 구문 메서드를 노출했습니다. (@hfhbd 님의 #5098)

### 수정됨
- [PostgreSQL 방언] PostgreSQL ALTER TABLE ALTER COLUMN을 수정했습니다. (@griffio 님의 #4868)
- [PostgreSQL 방언] 테이블 모델에 대한 import 누락 문제(4448)를 수정했습니다. (@griffio 님의 #4885)
- [PostgreSQL 방언] PostgreSQL 기본 제약 조건 함수 문제(4932)를 수정했습니다. (@griffio 님의 #4934)
- [PostgreSQL 방언] 마이그레이션 중 ALTER TABLE RENAME COLUMN에서 발생하는 PostgreSQL ClassCastException(4879)을 수정했습니다. (@griffio 님의 #4880)
- [PostgreSQL 방언] PostgreSQL CREATE EXTENSION 문제(4474)를 수정했습니다. (@griffio 님의 #4541)
- [PostgreSQL 방언] PostgreSQL ADD PRIMARY KEY non-nullable 타입 문제(5018)를 수정했습니다. (@griffio 님의 #5020)
- [PostgreSQL 방언] 집계 표현식 문제(4703)를 수정했습니다. (@griffio 님의 #5071)
- [PostgreSQL 방언] PostgreSQL JSON 문제(5028)를 수정했습니다. (@griffio 님의 #5030)
- [PostgreSQL 방언] PostgreSQL JSON 연산자 문제(5040)를 수정했습니다. (@griffio 님의 #5041)
- [PostgreSQL 방언] 5040에 대한 JSON 연산자 바인딩을 수정했습니다. (@griffio 님의 #5100)
- [PostgreSQL 방언] tsvector 문제(5082)를 수정했습니다. (@griffio 님의 #5104)
- [PostgreSQL 방언] PostgreSQL UPDATE FROM 문의 컬럼 인접성 문제(5032)를 수정했습니다. (@griffio 님의 #5035)
- [SQLite 방언] SQLite ALTER TABLE RENAME COLUMN 문제(4897)를 수정했습니다. (@griffio 님의 #4899)
- [IDE 플러그인] 오류 처리기 비정상 종료를 수정했습니다. (@aperfilyev 님의 #4988)
- [IDE 플러그인] IDEA 2023.3에서 BugSnag 초기화 실패 문제를 수정했습니다. (@aperfilyev 님)
- [IDE 플러그인] 플러그인을 통해 IntelliJ에서 .sq 파일을 열 때 발생하는 PluginException을 수정했습니다. (@aperfilyev 님)
- [IDE 플러그인] 이미 플러그인 종속성으로 존재하므로 IntelliJ 플러그인에 kotlin 라이브러리를 번들로 포함하지 않도록 수정했습니다. (#5126)
- [IDE 플러그인] stream 대신 확장 배열을 사용하도록 변경했습니다. (#5127)

## [2.0.1] - 2023-12-01 {id="2-0-1-2023-12-01"}
[2.0.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.1

### 추가됨
- [컴파일러] SELECT 수행 시 다중 컬럼 표현식(multi-column-expr) 지원을 추가했습니다. (@Adriel-M 님의 #4453)
- [PostgreSQL 방언] PostgreSQL CREATE INDEX CONCURRENTLY 지원을 추가했습니다. (@griffio 님의 #4531)
- [PostgreSQL 방언] PostgreSQL CTE의 보조 구문들이 서로를 참조할 수 있도록 허용했습니다. (@griffio 님의 #4493)
- [PostgreSQL 방언] 이항 표현식 및 sum에 대한 PostgreSQL 타입 지원을 추가했습니다. (@Adriel-M 님의 #4539)
- [PostgreSQL 방언] PostgreSQL SELECT DISTINCT ON 문법 지원을 추가했습니다. (@griffio 님의 #4584)
- [PostgreSQL 방언] SELECT 문에서 PostgreSQL JSON 함수 지원을 추가했습니다. (@MariusVolkhart 님의 #4590)
- [PostgreSQL 방언] generate_series PostgreSQL 함수를 추가했습니다. (@griffio 님의 #4717)
- [PostgreSQL 방언] 추가적인 Postgres 문자열 함수 정의를 추가했습니다. (@MariusVolkhart 님의 #4752)
- [PostgreSQL 방언] min 및 max 집계 함수에 DATE PostgreSQL 타입을 추가했습니다. (@anddani 님의 #4816)
- [PostgreSQL 방언] SqlBinaryExpr에 PostgreSQL 시간 타입을 추가했습니다. (@griffio 님의 #4657)
- [PostgreSQL 방언] postgres 방언에 TRUNCATE를 추가했습니다. (@de-luca 님의 #4817)
- [SQLite 3.35 방언] 순서대로 평가되는 여러 개의 ON CONFLICT 절을 허용했습니다. (@griffio 님의 #4551)
- [JDBC 드라이버] 더 편리한 SQL 편집을 위해 언어 주석(Language annotation)을 추가했습니다. (@MariusVolkhart 님의 #4602)
- [네이티브 드라이버] 네이티브 드라이버: linuxArm64 지원을 추가했습니다. (@hfhbd 님의 #4792)
- [Android 드라이버] AndroidSqliteDriver에 windowSizeBytes 매개변수를 추가했습니다. (@BoD 님의 #4804)
- [Paging3 확장] 기능 추가: OffsetQueryPagingSource에 initialOffset을 추가했습니다. (@MohamadJaara 님의 #4802)

### 변경됨
- [컴파일러] 적절한 경우 Kotlin 타입을 우선적으로 사용하도록 변경했습니다. (@eygraber 님의 #4517)
- [컴파일러] 값 타입 삽입을 수행할 때 항상 컬럼 이름을 포함하도록 했습니다. (#4864)
- [PostgreSQL 방언] PostgreSQL 방언에서 실험적(experimental) 상태를 제거했습니다. (@hfhbd 님의 #4443)
- [PostgreSQL 방언] PostgreSQL 타입 문서를 업데이트했습니다. (@MariusVolkhart 님의 #4569)
- [R2DBC 드라이버] PostgreSQL에서 정수 데이터 타입을 처리할 때의 성능을 최적화했습니다. (@MariusVolkhart 님의 #4588)

### 제거됨 {id="removed"}
- [SQLite Javascript 드라이버] sqljs-driver를 제거했습니다. (@dellisd 님의 #4613, #4670)

### 수정됨
- [컴파일러] 반환값이 있고 매개변수가 없는 그룹화된 구문의 컴파일 문제를 수정했습니다. (@griffio 님의 #4699)
- [컴파일러] SqlBinaryExpr와의 인자 바인딩 문제를 수정했습니다. (@griffio 님의 #4604)
- [IDE 플러그인] 설정된 경우 IDEA 프로젝트 JDK를 사용하도록 수정했습니다. (@griffio 님의 #4689)
- [IDE 플러그인] IDEA 2023.2 이상에서 발생하는 "Unknown element type: TYPE_NAME" 오류를 수정했습니다. (#4727)
- [IDE 플러그인] 2023.2와의 일부 호환성 문제를 수정했습니다.
- [Gradle 플러그인] verifyMigrationTask Gradle 태스크의 문서를 바로잡았습니다. (@joshfriend 님의 #4713)
- [Gradle 플러그인] 사용자가 데이터베이스를 검증하기 전에 먼저 생성할 수 있도록 안내하는 Gradle 태스크 출력 메시지를 추가했습니다. (@jingwei99 님의 #4684)
- [PostgreSQL 방언] PostgreSQL 컬럼 이름이 여러 번 변경되던 문제를 수정했습니다. (@griffio 님의 #4566)
- [PostgreSQL 방언] PostgreSQL ALTER COLUMN 널 가능성 문제(4714)를 수정했습니다. (@griffio 님의 #4831)
- [PostgreSQL 방언] ALTER TABLE ALTER COLUMN 문제(4837)를 수정했습니다. (@griffio 님의 #4846)
- [PostgreSQL 방언] PostgreSQL 시퀀스 문제(4501)를 수정했습니다. (@griffio 님의 #4528)
- [SQLite 방언] 컬럼 표현식에 JSON 이항 연산자를 사용할 수 있도록 허용했습니다. (@eygraber 님의 #4776)
- [SQLite 방언] 해당 이름을 가진 컬럼이 여러 개 발견되던 Update From의 오탐 문제를 수정했습니다. (@eygraber 님의 #4777)
- [네이티브 드라이버] 이름이 지정된 인메모리 데이터베이스를 지원합니다. (@05nelsonm 님의 #4662)
- [네이티브 드라이버] 쿼리 리스너 컬렉션의 스레드 안전성을 확보했습니다. (@kpgalligan 님의 #4567)
- [JDBC 드라이버] ConnectionManager의 연결 누수를 수정했습니다. (@MariusVolkhart 님의 #4589)
- [JDBC 드라이버] ConnectionManager 타입을 선택할 때의 JdbcSqliteDriver URL 파싱을 수정했습니다. (@05nelsonm 님의 #4656)

## [2.0.0] - 2023-07-26 {id="2-0-0-2023-07-26"}
[2.0.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0

### 추가됨
- [MySQL 방언] MySQL: IF 표현식에서 timestamp/bigint를 지원합니다. (@shellderp 님의 #4329)
- [MySQL 방언] MySQL: now 지원을 추가했습니다. (@hfhbd 님의 #4431)
- [웹 드라이버] NPM 패키지 배포를 활성화했습니다. (#4364)
- [IDE 플러그인] Gradle 도구 연결 실패 시 스택 추적을 표시할 수 있도록 허용했습니다. (#4383)

### 변경됨
- [SQLite 드라이버] JdbcSqliteDriver의 스키마 마이그레이션 사용을 단순화했습니다. (@morki 님의 #3737)
- [R2DBC 드라이버] 진정한 비동기 R2DBC 커서를 지원합니다. (@hfhbd 님의 #4387)

### 수정됨
- [IDE 플러그인] 필요할 때까지 데이터베이스 프로젝트 서비스를 인스턴스화하지 않도록 변경했습니다. (#4382)
- [IDE 플러그인] find usages 중 프로세스 취소를 올바르게 처리하도록 수정했습니다. (#4340)
- [IDE 플러그인] 비동기 코드 생성 관련 IDE 문제를 수정했습니다. (#4406)
- [IDE 플러그인] 패키지 구조 어셈블리가 한 번만 계산되고 EDT 외부에서 수행되도록 이동했습니다. (#4417)
- [IDE 플러그인] 2023.2에서 Kotlin 타입 확인에 올바른 스텁 인덱스 키를 사용하도록 수정했습니다. (#4416)
- [IDE 플러그인] 검색을 수행하기 전에 인덱스가 준비될 때까지 대기하도록 변경했습니다. (#4419)
- [IDE 플러그인] 인덱스를 사용할 수 없는 경우 goto 동작을 수행하지 않도록 수정했습니다. (#4420)
- [컴파일러] 그룹화된 구문의 결과 표현식을 수정했습니다. (#4378)
- [컴파일러] 가상 테이블을 인터페이스 타입으로 사용하지 않도록 수정했습니다. (@hfhbd 님의 #4427)

## [2.0.0-rc02] - 2023-06-27 {id="2-0-0-rc02-2023-06-27"}
[2.0.0-rc02]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-rc02

### 추가됨
- [MySQL 방언] 소문자 날짜 타입 및 날짜 타입에 대한 min, max 지원 (@shellderp 님의 #4243)
- [MySQL 방언] 이항 표현식 및 sum에 대한 MySQL 타입 지원 (@shellderp 님의 #4254)
- [MySQL 방언] 표시 너비(display width)가 없는 unsigned int 지원 (@shellderp 님의 #4306)
- [MySQL 방언] LOCK IN SHARED MODE 지원
- [PostgreSQL 방언] min max에 boolean 및 Timestamp 추가 (@griffio 님의 #4245)
- [PostgreSQL 방언] Postgres: 윈도우 함수 지원 추가 (@hfhbd 님의 #4283)
- [런타임] 런타임에 linuxArm64, androidNative, watchosDeviceArm 타깃 추가 (@hfhbd 님의 #4258)
- [페이징 확장] 페이징 확장에 linux 및 mingw x64 타깃 추가 (@chippman 님의 #4280)

### 변경됨
- [Gradle 플러그인] Android API 34에 대한 자동 방언 지원 추가 (#4251)
- [페이징 확장] QueryPagingSource에서 SuspendingTransacter 지원 추가 (@daio 님의 #4292)
- [런타임] addListener API 개선 (@hfhbd 님의 #4244)
- [런타임] 마이그레이션 버전에 Long 사용 (@hfhbd 님의 #4297)

### 수정됨
- [Gradle 플러그인] 생성된 소스에 대해 안정적인 출력 경로 사용 (@joshfriend 님의 #4269)
- [Gradle 플러그인] Gradle 미세 조정 (@3flex 님의 #4222)

## [2.0.0-rc01] - 2023-05-29 {id="2-0-0-rc01-2023-05-29"}
[2.0.0-rc01]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-rc01

### 추가됨
- [페이징] 페이징 확장에 js browser 타깃 추가 (@sproctor 님의 #3843)
- [페이징] androidx-paging3 확장에 iosSimulatorArm64 타깃 추가 (#4117)
- [PostgreSQL 방언] gen_random_uuid() 지원 및 테스트 추가 (@davidwheeler123 님의 #3855)
- [PostgreSQL 방언] Postgres ALTER TABLE ADD CONSTRAINT 지원 (@griffio 님의 #4116)
- [PostgreSQL 방언] ALTER TABLE ADD CONSTRAINT CHECK 지원 (@griffio 님의 #4120)
- [PostgreSQL 방언] PostgreSQL 문자 길이 함수 추가 (@griffio 님의 #4121)
- [PostgreSQL 방언] PostgreSQL 컬럼 기본값 interval 추가 (@griffio 님의 #4142)
- [PostgreSQL 방언] PostgreSQL interval 컬럼 결과 추가 (@griffio 님의 #4152)
- [PostgreSQL 방언] PostgreSQL ALTER COLUMN 추가 (@griffio 님의 #4165)
- [PostgreSQL 방언] PostgreSQL: date_part 추가 (@hfhbd 님의 #4198)
- [MySQL 방언] SQL 문자 길이 함수 추가 (@griffio 님의 #4134)
- [IDE 플러그인] sqldelight 디렉터리 추천 추가 (@aperfilyev 님의 #3976)
- [IDE 플러그인] 프로젝트 트리에서 중간 패키지 압축 표시 (@aperfilyev 님의 #3992)
- [IDE 플러그인] JOIN 절 자동 완성 추가 (@aperfilyev 님의 #4086)
- [IDE 플러그인] CREATE VIEW 인텐션 및 라이브 템플릿 추가 (@aperfilyev 님의 #4074)
- [IDE 플러그인] DELETE 또는 UPDATE 내부의 WHERE 누락에 대한 경고 추가 (@aperfilyev 님의 #4058)
- [Gradle 플러그인] 타입 안전한 프로젝트 접근자(type-safe project accessors) 활성화 (@hfhbd 님의 #4005)

### 변경됨
- [Gradle 플러그인] ServiceLoader 메커니즘을 통해 VerifyMigrationTask용 DriverInitializer 등록 허용 (@C2H6O 님의 #3986)
- [Gradle 플러그인] 명시적 컴파일러 환경 생성 (@hfhbd 님의 #4079)
- [JS 드라이버] 웹 워커 드라이버를 별도의 아티팩트로 분리
- [JS 드라이버] JsWorkerSqlCursor를 외부에 노출하지 않도록 변경 (@hfhbd 님의 #3874)
- [JS 드라이버] sqljs 드라이버 배포 비활성화 (#4108)
- [런타임] 동기 드라이버에는 동기 스키마 초기화 프로그램이 필요하도록 강제 (#4013)
- [런타임] 커서에 대한 비동기 지원 개선 (#4102)
- [런타임] 사용 중단된 타깃 제거 (@hfhbd 님의 #4149)
- [런타임] 구형 메모리 모델(old MM) 지원 제거 (@hfhbd 님의 #4148)

### 수정됨
- [R2DBC 드라이버] R2DBC: 드라이버 종료 대기(await) 추가 (@hfhbd 님의 #4139)
- [컴파일러] 마이그레이션의 PRAGMA를 database create(SqlDriver)에 포함 (@MariusVolkhart 님의 #3845)
- [컴파일러] RETURNING 절에 대한 코드 생성 수정 (@MariusVolkhart 님의 #3872)
- [컴파일러] 가상 테이블용 타입을 생성하지 않도록 수정 (#4015)
- [Gradle 플러그인] 소소한 Gradle 플러그인 편의성 개선 (@zacsweers 님의 #3930)
- [IDE 플러그인] 확인되지 않은 Kotlin 타입 문제 수정 (@aperfilyev 님의 #3924)
- [IDE 플러그인] 한정자(qualifier)와 함께 와일드카드 확장 인텐션이 동작하도록 수정 (@aperfilyev 님의 #3979)
- [IDE 플러그인] java home이 누락된 경우 사용 가능한 JDK 사용 (@aperfilyev 님의 #3925)
- [IDE 플러그인] 패키지 이름에 대한 find usages 수정 (#4010)
- [IDE 플러그인] 유효하지 않은 요소에 대해 자동 가져오기를 표시하지 않도록 수정 (#4008)
- [IDE 플러그인] 방언이 누락된 경우 확인을 시도하지 않도록 수정 (#4009)
- [IDE 플러그인] 무효화된 상태에서는 컴파일러의 IDE 실행을 무시하도록 수정 (#4016)
- [IDE 플러그인] IntelliJ 2023.1 지원 추가 (@madisp 님의 #4037)
- [IDE 플러그인] 컬럼 이름 변경 시 명명된 인자 사용 위치의 이름도 변경되도록 수정 (@aperfilyev 님의 #4027)
- [IDE 플러그인] 마이그레이션 추가 팝업 수정 (@aperfilyev 님의 #4105)
- [IDE 플러그인] 마이그레이션 파일에서 SchemaNeedsMigrationInspection 비활성화 (@aperfilyev 님의 #4106)
- [IDE 플러그인] 마이그레이션 생성 시 타입 이름 대신 SQL 컬럼 이름 사용 (@aperfilyev 님의 #4112)

## [2.0.0-alpha05] - 2023-01-20 {id="2-0-0-alpha05-2023-01-20"}
[2.0.0-alpha05]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha05

### 추가됨
- [페이징] 멀티플랫폼 페이징 확장 (@jeffdgr8 님)
- [런타임] Listener 인터페이스에 fun 제어자 추가
- [SQLite 방언] SQLite 3.33 지원(UPDATE FROM) 추가 (@eygraber 님)
- [PostgreSQL 방언] PostgreSQL에서 UPDATE FROM 지원 (@eygraber 님)

### 변경됨
- [RDBC 드라이버] 연결(connection) 노출 (@hfhbd 님)
- [런타임] 마이그레이션 콜백을 메인 `migrate` 함수로 이동
- [Gradle 플러그인] 다운스트림 프로젝트로부터 Configurations 숨김 처리
- [Gradle 플러그인] IntelliJ만 섀도우(shade) 처리 (@hfhbd 님)
- [Gradle 플러그인] Kotlin 1.8.0-Beta 지원 및 다중 버전 Kotlin 테스트 추가 (@hfhbd 님)

### 수정됨
- [RDBC 드라이버] 대신 javaObjectType 사용 (@hfhbd 님)
- [RDBC 드라이버] bindStatement에서 원시 null 값 수정 (@hfhbd 님)
- [RDBC 드라이버] R2DBC 1.0 지원 (@hfhbd 님)
- [PostgreSQL 방언] Postgres: 타입 매개변수가 없는 배열 수정 (@hfhbd 님)
- [IDE 플러그인] IntelliJ를 221.6008.13으로 버전 상향 (@hfhbd 님)
- [컴파일러] 순수 뷰에서 재귀 원본 테이블 확인 (@hfhbd 님)
- [컴파일러] 테이블 외래 키 절의 값 클래스(value classes) 사용 (@hfhbd 님)
- [컴파일러] 괄호 없는 바인드 표현식을 지원하도록 SelectQueryGenerator 수정 (@bellatoris 님)
- [컴파일러] 트랜잭션 사용 시 ${name}Indexes 변수의 중복 생성 문제 수정 (@sachera 님)

## [1.5.5] - 2023-01-20 {id="1-5-5-2023-01-20"}
[1.5.5]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.5

Kotlin 1.8 및 IntelliJ 2021+ 호환성을 지원하고 JDK 17을 지원하는 릴리스입니다.

## [1.5.4] - 2022-10-06 {id="1-5-4-2022-10-06"}
[1.5.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.4

Kotlin 1.7.20 및 AGP 7.3.0 호환성 업데이트입니다.

## [2.0.0-alpha04] - 2022-10-03 {id="2-0-0-alpha04-2022-10-03"}
[2.0.0-alpha04]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha04

### 주요 변경 사항 (Breaking Changes) {id="breaking-changes"}

- Paging 3 확장 API가 변경되어 count에 int 타입만 허용됩니다.
- 코루틴 확장에 이제 기본 디스패처 대신 명시적으로 디스패처를 전달해야 합니다.
- 방언 및 드라이버 클래스가 final로 변경되었으므로 상속 대신 위임(delegation)을 사용하세요.

### 추가됨
- [HSQL 방언] Hsql: INSERT 시 생성된 컬럼에 DEFAULT 사용 지원 (@hfhbd 님의 #3372)
- [PostgreSQL 방언] PostgreSQL: INSERT 시 생성된 컬럼에 DEFAULT 사용 지원 (@hfhbd 님의 #3373)
- [PostgreSQL 방언] PostgreSQL에 NOW() 추가 (@hfhbd 님의 #3403)
- [PostgreSQL 방언] PostgreSQL NOT 연산자 추가 (@hfhbd 님의 #3504)
- [페이징] *QueryPagingSource에 CoroutineContext 전달 허용 (#3384)
- [Gradle 플러그인] 방언에 대한 더 나은 버전 카탈로그 지원 추가 (#3435)
- [네이티브 드라이버] NativeSqliteDriver의 DatabaseConfiguration 생성에 후킹할 수 있는 콜백 추가 (@svenjacobs 님의 #3512)

### 변경됨
- [페이징] KeyedQueryPagingSource 기반의 QueryPagingSource 함수에 기본 디스패처 추가 (#3385)
- [페이징] OffsetQueryPagingSource가 Int에서만 작동하도록 변경 (#3386)
- [비동기 런타임] await* 메서드를 상위 클래스인 ExecutableQuery로 이동 (@hfhbd 님의 #3524)
- [코루틴 확장] 플로우 확장의 기본 매개변수 제거 (#3489)

### 수정됨
- [Gradle 플러그인] Kotlin 1.7.20으로 업데이트 (@zacsweers 님의 #3542)
- [R2DBC 드라이버] 항상 값을 보내지 않는 R2DBC 변경 사항 적용 (@hfhbd 님의 #3525)
- [HSQL 방언] Hsql 사용 시 실패하던 SQLite VerifyMigrationTask 수정 (@hfhbd 님의 #3380)
- [Gradle 플러그인] 태스크를 지연 구성(lazy configuration) API를 사용하도록 변환 (@3flex 님)
- [Gradle 플러그인] Kotlin 1.7.20에서의 NPE 방지 (@ZacSweers 님의 #3398)
- [Gradle 플러그인] squash migrations 태스크의 설명 수정 (#3449)
- [IDE 플러그인] 최신 Kotlin 플러그인에서의 NoSuchFieldError 수정 (@madisp 님의 #3422)
- [IDE 플러그인] IDEA: UnusedQueryInspection - ArrayIndexOutOfBoundsException 수정 (@vanniktech 님의 #3427)
- [IDE 플러그인] 구형 Kotlin 플러그인 참조에 리플렉션 사용
- [컴파일러] 확장 함수가 있는 커스텀 방언에서 import를 생성하지 않던 문제 수정 (@hfhbd 님의 #3338)
- [컴파일러] CodeBlock.of("${CodeBlock.toString()}") 이스케이프 수정 (@hfhbd 님의 #3340)
- [컴파일러] 마이그레이션에서 비동기 실행 구문을 대기(await)하도록 수정 (#3352)
- [컴파일러] AS 수정 (@hfhbd 님의 #3370)
- [컴파일러] `getObject` 메서드가 실제 타입을 자동으로 채우도록 지원 (@robxyy 님의 #3401)
- [컴파일러] 비동기 그룹화 returning 구문의 코드 생성 수정 (#3411)
- [컴파일러] 가능한 경우 바인드 매개변수의 Kotlin 타입을 유추하고, 그렇지 않으면 더 명확한 오류 메시지와 함께 실패하도록 수정 (@hfhbd 님의 #3413)
- [컴파일러] ABS("foo")를 허용하지 않도록 수정 (@hfhbd 님의 #3430)
- [컴파일러] 다른 매개변수로부터 Kotlin 타입 유추 지원 (@hfhbd 님의 #3431)
- [컴파일러] 항상 데이터베이스 구현을 생성하도록 수정 (@hfhbd 님의 #3540)
- [컴파일러] JavaDoc 제한을 완화하고 커스텀 매퍼 함수에도 JavaDoc 추가 (@hfhbd 님의 #3554)
- [컴파일러] 바인딩에서 DEFAULT 수정 (@hfhbd 님)
- [페이징] Paging 3 수정 (#3396)
- [페이징] Long을 사용한 OffsetQueryPagingSource 생성 허용 (#3409)
- [페이징] Dispatchers.Main을 정적으로 교체하지 않도록 수정 (#3428)

## [2.0.0-alpha03] - 2022-06-17 {id="2-0-0-alpha03-2022-06-17"}
[2.0.0-alpha03]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha03

### 주요 변경 사항 (Breaking Changes)

- 방언을 이제 실제 Gradle 종속성처럼 참조합니다.
```groovy
sqldelight {
  MyDatabase {
    dialect("app.cash.sqldelight:postgres-dialect:2.0.0-alpha03")
  }
}
```
- `AfterVersionWithDriver` 타입이 제거되고, 항상 드라이버를 포함하는 `AfterVersion`으로 통일되었습니다.
- `Schema` 타입은 더 이상 `SqlDriver`의 하위 타입이 아닙니다.
- 이제 `PreparedStatement` API가 0부터 시작하는 인덱스(0-based index)로 호출됩니다.

### 추가됨
- [IDE 플러그인] 실행 중인 데이터베이스에 대해 SQLite, MySQL, PostgreSQL 명령을 실행할 수 있는 지원 추가 (@aperfilyev 님의 #2718)
- [IDE 플러그인] Android Studio DB Inspector 지원 추가 (@aperfilyev 님의 #3107)
- [런타임] 비동기 드라이버 지원 추가 (@dellisd 님의 #3168)
- [네이티브 드라이버] 신규 Kotlin/Native 메모리 모델 지원 (@kpgalligan 님의 #3177)
- [JS 드라이버] SqlJs 워커용 드라이버 추가 (@dellisd 님의 #3203)
- [Gradle 플러그인] SQLDelight 태스크용 클래스패스 노출
- [Gradle 플러그인] 마이그레이션을 압축(squash)하는 Gradle 태스크 추가
- [Gradle 플러그인] 마이그레이션 확인 중 스키마 정의를 무시하는 플래그 추가
- [MySQL 방언] MySQL에서 FOR SHARE 및 FOR UPDATE 지원 (#3098)
- [MySQL 방언] MySQL 인덱스 힌트 지원 (#3099)
- [PostgreSQL 방언] date_trunc 추가 (@hfhbd 님의 #3295)
- [JSON 확장] JSON 테이블 함수 지원 (#3090)

### 변경됨
- [런타임] 드라이버가 없는 AfterVersion 타입 제거 (#3091)
- [런타임] Schema 타입을 최상위로 이동
- [런타임] 서드파티 구현을 지원하기 위해 방언 및 리졸버 개방(open) (@hfhbd 님의 #3232)
- [컴파일러] 컴파일 실패 보고서에 컴파일에 사용된 방언 포함 (#3086)
- [컴파일러] 사용되지 않는 어댑터 건너뛰기 (@eygraber 님의 #3162)
- [컴파일러] PrepareStatement에서 0부터 시작하는 인덱스 사용 (@hfhbd 님의 #3269)
- [Gradle 플러그인] 방언을 문자열 대신 적절한 Gradle 종속성으로 지정하도록 변경 (#3085)
- [Gradle 플러그인] Gradle 검증 태스크: 데이터베이스 파일이 누락된 경우 예외 발생 (@vanniktech 님의 #3126)

### 수정됨
- [Gradle 플러그인] Gradle 플러그인에 대한 소소한 정리 및 조정 (@3flex 님의 #3171)
- [Gradle 플러그인] 생성된 디렉터리에 AGP 문자열을 사용하지 않도록 수정
- [Gradle 플러그인] AGP namespace 속성 사용 (#3220)
- [Gradle 플러그인] Gradle 플러그인의 런타임 종속성에 kotlin-stdlib를 추가하지 않도록 수정 (@mbonnin 님의 #3245)
- [Gradle 플러그인] 멀티플랫폼 구성 단순화 (@mbonnin 님의 #3246)
- [Gradle 플러그인] JS 전용 프로젝트 지원 (@hfhbd 님의 #3310)
- [IDE 플러그인] Gradle 도구 API에 Java Home 사용 (#3078)
- [IDE 플러그인] IDE 플러그인 내부에서 올바른 ClassLoader로 JDBC 드라이버 로드 (#3080)
- [IDE 플러그인] 이미 존재하는 PSI 변경 중 오류를 방지하기 위해 무효화 전에 파일 요소를 null로 표시 (#3082)
- [IDE 플러그인] ALTER TABLE 문에서 새 테이블 이름의 사용 위치 검색 시 충돌 방지 (#3106)
- [IDE 플러그인] 검사기(inspector)를 최적화하고 예상된 예외 유형에 대해 조용히 실패하도록 처리 (#3121)
- [IDE 플러그인] 생성된 디렉터리여야 하는 파일 삭제 (#3198)
- [IDE 플러그인] 안전하지 않은 연산자 호출 수정
- [컴파일러] RETURNING 문이 포함된 UPDATE 및 DELETE가 쿼리를 실행하도록 보장 (#3084)
- [컴파일러] 복합 SELECT에서 인자 타입을 올바르게 유추하도록 수정 (#3096)
- [컴파일러] 공통 테이블은 데이터 클래스를 생성하지 않으므로 반환하지 않도록 수정 (#3097)
- [컴파일러] 최상위 마이그레이션 파일을 더 빠르게 검색 (#3108)
- [컴파일러] 파이프 연산자에서 널 가능성을 올바르게 상속하도록 수정
- [컴파일러] iif ANSI SQL 함수 지원
- [컴파일러] 빈 쿼리 파일을 생성하지 않도록 수정 (@hfhbd 님의 #3300)
- [컴파일러] 물음표만 있는 어댑터 문제 수정 (@hfhbd 님의 #3314)
- [PostgreSQL 방언] Postgres 기본 키 컬럼은 항상 non-null로 설정 (#3092)
- [PostgreSQL 방언] 여러 테이블에서 동일한 이름을 가진 복사본 문제 수정 (@hfhbd 님의 #3297)
- [SQLite 3.35 방언] 변경된 테이블에서 인덱싱된 컬럼을 삭제할 때만 오류를 표시하도록 수정 (@eygraber 님의 #3158)

## [2.0.0-alpha02] - 2022-04-13 {id="2-0-0-alpha02-2022-04-13"}
[2.0.0-alpha02]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha02

### 주요 변경 사항 (Breaking Changes)

- `app.cash.sqldelight.runtime.rx`를 모두 `app.cash.sqldelight.rx2`로 변경해야 합니다.

### 추가됨
- [컴파일러] 그룹화된 구문 끝에서의 returning 지원
- [컴파일러] 방언 모듈을 통한 컴파일러 확장 지원 및 SQLite JSON 확장 추가 (#1379, #2087)
- [컴파일러] 값을 반환하는 PRAGMA 문 지원 (#1106)
- [컴파일러] 표시된 컬럼에 대한 값 타입(value types) 생성 지원
- [컴파일러] 낙관적 락 및 검증 지원 추가 (#1952)
- [컴파일러] 다중 업데이트 문 지원
- [PostgreSQL] Postgres returning 문 지원
- [PostgreSQL] Postgres 날짜 타입 지원
- [PostgreSQL] PG interval 지원
- [PostgreSQL] PG 불리언 지원 및 alter table에서의 insert 수정
- [PostgreSQL] Postgres의 선택적 LIMIT 지원
- [PostgreSQL] PG BYTEA 타입 지원
- [PostgreSQL] Postgres serial 테스트 추가
- [PostgreSQL] Postgres FOR UPDATE 문법 지원
- [PostgreSQL] PostgreSQL 배열 타입 지원
- [PostgreSQL] PG에서 UUID 타입을 올바르게 저장/검색하도록 지원
- [PostgreSQL] PostgreSQL NUMERIC 타입 지원 (#1882)
- [PostgreSQL] 공통 테이블 표현식 내부의 returning 쿼리 지원 (#2471)
- [PostgreSQL] JSON 전용 연산자 지원
- [PostgreSQL] Postgres Copy 추가 (@hfhbd 님)
- [MySQL] MySQL Replace 지원
- [MySQL] NUMERIC/BigDecimal MySQL 타입 지원 (#2051)
- [MySQL] MySQL TRUNCATE 문 지원
- [MySQL] MySQL의 JSON 전용 연산자 지원 (@eygraber 님)
- [MySQL] MySQL INTERVAL 지원 (@eygraber 님의 #2969)
- [HSQL] HSQL 윈도우 기능 추가
- [SQLite] WHERE 절에서 nullable 매개변수에 대한 동등성 검사를 대체하지 않도록 수정 (@eygraber 님의 #1490)
- [SQLite] SQLite 3.35 returning 문 지원 (@eygraber 님의 #1490)
- [SQLite] GENERATED 절 지원
- [SQLite] SQLite 3.38 방언 지원 추가 (@eygraber 님)

### 변경됨
- [컴파일러] 생성된 코드 일부 정리
- [컴파일러] 그룹화된 구문에서 테이블 매개변수 사용 금지 (#1822)
- [컴파일러] 그룹화된 쿼리를 트랜잭션 내에 배치 (#2785)
- [런타임] 드라이버의 execute 메서드에서 업데이트된 행 수 반환
- [런타임] 연결에 접근하는 임계 영역에 SqlCursor를 제한 (@andersio 님의 #2123)
- [Gradle 플러그인] 마이그레이션을 위한 스키마 정의 비교 (#841)
- [PostgreSQL] PG에서 큰따옴표 사용 금지
- [MySQL] MySQL에서 == 사용 시 오류 발생 (#2673)

### 수정됨
- [컴파일러] 서로 다른 테이블의 동일한 어댑터 타입이 2.0 alpha에서 컴파일 오류를 유발하던 문제 수정
- [컴파일러] upsert 문 컴파일 문제 수정 (#2791)
- [컴파일러] 일치하는 항목이 여러 개 있는 경우 쿼리 결과의 SELECT에 테이블을 사용하도록 수정 (#1874, #2313)
- [컴파일러] INSTEAD OF 트리거가 있는 뷰의 업데이트 지원 (#1018)
- [컴파일러] 함수 이름에 from 및 for 지원
- [컴파일러] 함수 표현식에서 SEPARATOR 키워드 허용
- [컴파일러] ORDER BY에서 별칭이 지정된 테이블의 ROWID에 접근할 수 없던 문제 수정
- [컴파일러] MySQL의 HAVING 절에서 별칭이 지정된 컬럼 이름을 인식하지 못하던 문제 수정
- [컴파일러] 잘못 발생하던 'Multiple columns found' 오류 수정
- [컴파일러] PRAGMA locking_mode = EXCLUSIVE; 설정이 불가능하던 문제 수정
- [PostgreSQL] PostgreSQL 컬럼 이름 변경 수정
- [MySQL] UNIX_TIMESTAMP, TO_SECONDS, JSON_ARRAYAGG MySQL 함수를 인식하지 못하던 문제 수정
- [SQLite] SQLite 윈도우 기능 수정
- [IDE 플러그인] 빈 진행률 표시기(progress indicator)에서 goto 핸들러 실행 (#2990)
- [IDE 플러그인] 프로젝트가 구성되지 않은 경우 하이라이트 방문자가 실행되지 않도록 보장 (#2981, #2976)
- [IDE 플러그인] 전이적으로 생성된 코드도 IDE에서 업데이트되도록 보장 (#1837)
- [IDE 플러그인] 방언 업데이트 시 인덱스 무효화

## [2.0.0-alpha01] - 2022-03-31 {id="2-0-0-alpha01-2022-03-31"}
[2.0.0-alpha01]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha01

2.0의 첫 번째 알파 릴리스이며 몇 가지 호환성을 깨뜨리는 변경 사항이 포함되어 있습니다. 향후 더 많은 ABI 변경이 있을 수 있으므로 이 릴리스에 의존하는 라이브러리는 배포하지 마세요(애플리케이션 사용은 괜찮습니다).

### 주요 변경 사항 (Breaking Changes)

- 먼저 `com.squareup.sqldelight`를 모두 `app.cash.sqldelight`로 변경해야 합니다.
- 둘째로 `app.cash.sqldelight.android`를 모두 `app.cash.sqldelight.driver.android`로 변경해야 합니다.
- 셋째로 `app.cash.sqldelight.sqlite.driver`를 모두 `app.cash.sqldelight.driver.jdbc.sqlite`로 변경해야 합니다.
- 넷째로 `app.cash.sqldelight.drivers.native`를 모두 `app.cash.sqldelight.driver.native`로 변경해야 합니다.
- IDE 플러그인을 [alpha 또는 eap 채널](https://plugins.jetbrains.com/plugin/8191-sqldelight/versions/alpha)에 있는 2.X 버전으로 업데이트해야 합니다.
- 방언은 이제 Gradle 내에서 지정할 수 있는 종속성입니다:

```gradle
sqldelight {
  MyDatabase {
    packageName = "com.example"
    dialect = "app.cash.sqldelight:mysql-dialect:2.0.0-alpha01"
  }
}
```

현재 지원되는 방언은 `mysql-dialect`, `postgresql-dialect`, `hsql-dialect`, `sqlite-3-18-dialect`, `sqlite-3-24-dialect`, `sqlite-3-25-dialect`, `sqlite-3-30-dialect`, `sqlite-3-35-dialect`입니다.

- 이제 기본형 타입(Primitive types)을 임포트해야 합니다(예: `INTEGER AS Boolean`의 경우 `import kotlin.Boolean` 필요). 이전에 지원되던 일부 타입에는 어댑터가 필요합니다. 기본형 어댑터는 대부분의 변환을 위해 `app.cash.sqldelight:primitive-adapters:2.0.0-alpha01`에서 제공됩니다(예: `Integer AS kotlin.Int`를 위한 `IntColumnAdapter`).

### 추가됨
- [IDE 플러그인] 기본적인 마이그레이션 제안 기능 (@aperfilyev 님)
- [IDE 플러그인] 임포트 힌트 액션 추가 (@aperfilyev 님)
- [IDE 플러그인] Kotlin 클래스 자동 완성 추가 (@aperfilyev 님)
- [Gradle 플러그인] Gradle 타입 안전 프로젝트 접근자 바로가기 추가 (@hfhbd 님)
- [컴파일러] 방언에 기반한 코드 생성 커스터마이징 (@MariusVolkhart 님)
- [JDBC 드라이버] JdbcDriver에 공통 타입 추가 (@MariusVolkhart 님)
- [SQLite] SQLite 3.35 지원 추가 (@eygraber 님)
- [SQLite] ALTER TABLE DROP COLUMN 지원 추가 (@eygraber 님)
- [SQLite] SQLite 3.30 방언 지원 추가 (@eygraber 님)
- [SQLite] SQLite에서 NULLS FIRST/LAST 지원 (@eygraber 님)
- [HSQL] GENERATED 절에 대한 HSQL 지원 추가 (@MariusVolkhart 님)
- [HSQL] HSQL에서 명명된 매개변수 지원 추가 (@MariusVolkhart 님)
- [HSQL] HSQL INSERT 쿼리 커스터마이징 (@MariusVolkhart 님)

### 변경됨
- [전체] 패키지 이름이 com.squareup.sqldelight에서 app.cash.sqldelight로 변경되었습니다.
- [런타임] 방언을 독립된 Gradle 모듈로 분리
- [런타임] 드라이버 구현 쿼리 알림 방식으로 전환
- [런타임] 기본 컬럼 어댑터를 별도 모듈로 추출 (#2056, #2060)
- [컴파일러] 모듈별로 다시 작업하는 대신 모듈이 쿼리 구현을 생성하도록 변경
- [컴파일러] 생성된 데이터 클래스의 커스텀 toString 생성을 제거 (@PaulWoitaschek 님)
- [JS 드라이버] sqljs-driver에서 sql.js 종속성 제거 (@dellisd 님)
- [페이징] Android Paging 2 확장 제거
- [IDE 플러그인] SQLDelight 동기화 중 에디터 배너 표시 (#2511)
- [IDE 플러그인] 최소 지원 IntelliJ 버전은 2021.1입니다.

### 수정됨
- [런타임] 할당 및 포인터 추적을 줄이기 위해 리스너 목록을 평탄화(flatten) (@andersio 님)
- [IDE 플러그인] 오류 위치로 이동할 수 있도록 오류 메시지 수정 (@hfhbd 님)
- [IDE 플러그인] 누락된 검사 설명 추가 (@aperfilyev 님의 #2768)
- [IDE 플러그인] GotoDeclarationHandler 예외 수정 (@aperfilyev 님의 #2531, #2688, #2804)
- [IDE 플러그인] import 키워드 하이라이트 (@aperfilyev 님)
- [IDE 플러그인] 확인되지 않은 Kotlin 타입 문제 수정 (@aperfilyev 님의 #1678)
- [IDE 플러그인] 확인되지 않은 패키지의 하이라이트 수정 (@aperfilyev 님의 #2543)
- [IDE 플러그인] 프로젝트 인덱스가 아직 초기화되지 않은 경우 일치하지 않는 컬럼 검사를 시도하지 않도록 수정
- [IDE 플러그인] Gradle 동기화가 발생할 때까지 파일 인덱스를 초기화하지 않도록 수정
- [IDE 플러그인] Gradle 동기화가 시작되면 SQLDelight 임포트 취소
- [IDE 플러그인] 실행 취소(undo) 액션이 수행되는 스레드 외부에서 데이터베이스 재생성
- [IDE 플러그인] 참조를 확인할 수 없는 경우 빈 Java 타입 사용
- [IDE 플러그인] 파일 파싱 중 메인 스레드에서 올바르게 벗어나고 쓰기 작업 시에만 복귀하도록 수정
- [IDE 플러그인] 구형 IntelliJ 버전과의 호환성 개선 (@3flex 님)
- [IDE 플러그인] 더 빠른 어노테이션 API 사용
- [Gradle 플러그인] 런타임 추가 시 JS/Android 플러그인 명시적 지원 (@ZacSweers 님)
- [Gradle 플러그인] 마이그레이션에서 스키마를 파생하지 않고 마이그레이션 출력 태스크 등록 (@kevincianfarini 님의 #2744)
- [Gradle 플러그인] 마이그레이션 태스크 크래시 시 실행 중 충돌이 발생한 파일 출력
- [Gradle 플러그인] 멱등성 있는 출력을 보장하기 위해 코드 생성 시 파일 정렬 (@ZacSweers 님)
- [컴파일러] 전체 PSI 그래프를 탐색하지 않고 파일을 순회하는 더 빠른 API 사용
- [컴파일러] SELECT 함수 매개변수에 키워드 맹글링(mangling) 추가 (@aperfilyev 님의 #2759)
- [컴파일러] 마이그레이션 어댑터의 packageName 수정 (@hfhbd 님)
- [컴파일러] 타입 대신 프로퍼티에 어노테이션을 생성하도록 변경 (@aperfilyev 님의 #2798)
- [컴파일러] Query 하위 타입으로 전달하기 전에 인자 정렬 (@aperfilyev 님의 #2379)

## [1.5.3] - 2021-11-23 {id="1-5-3-2021-11-23"}
[1.5.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.3

### 추가됨
- [JDBC 드라이버] 서드파티 드라이버 구현을 위해 JdbcDriver 개방 (@hfhbd 님의 #2672)
- [MySQL 방언] 시간 증분에 필요한 누락 함수 추가 (@sdoward 님의 #2671)
- [코루틴 확장] coroutines-extensions에 M1 타깃 추가 (@PhilipDukhov 님)

### 변경됨
- [Paging3 확장] sqldelight-android-paging3를 AAR 대신 JAR로 배포 (@julioromano 님의 #2634)
- 소프트 키워드이기도 한 프로퍼티 이름 뒤에 언더스코어가 접미사로 붙습니다. 예를 들어 `value`는 `value_`로 노출됩니다.

### 수정됨
- [컴파일러] 중복된 배열 매개변수에 대해 변수를 추출하지 않도록 수정 (@aperfilyev 님)
- [Gradle 플러그인] kotlin.mpp.enableCompatibilityMetadataVariant 추가 (@martinbonnin 님의 #2628)
- [IDE 플러그인] find usages 처리에 읽기 액션(read action) 필요

## [1.5.2] - 2021-10-12 {id="1-5-2-2021-10-12"}
[1.5.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.2

### 추가됨
- [Gradle 플러그인] HMPP 지원 (@martinbonnin 님의 #2548)
- [IDE 플러그인] NULL 비교 검사 추가 (@aperfilyev 님)
- [IDE 플러그인] 검사 억제기(suppressor) 추가 (@aperfilyev 님의 #2519)
- [IDE 플러그인] 명명된 매개변수와 위치 매개변수 혼용 검사 추가 (@aperfilyev 님)
- [SQLite 드라이버] mingwX86 타깃 추가 (@enginegl 님의 #2558)
- [SQLite 드라이버] M1 타깃 추가
- [SQLite 드라이버] linuxX64 지원 추가 (@chippmann 님의 #2456)
- [MySQL 방언] MySQL에 ROW_COUNT 함수 추가 (#2523)
- [PostgreSQL 방언] Postgres 컬럼 이름 변경, 삭제 지원 (@pabl0rg 님)
- [PostgreSQL 방언] PostgreSQL 문법에서 CITEXT를 인식하지 못하던 문제 수정
- [PostgreSQL 방언] TIMESTAMP WITH TIME ZONE 및 TIMESTAMPTZ 포함
- [PostgreSQL 방언] PostgreSQL GENERATED 컬럼 문법 추가
- [런타임] AfterVersion에 매개변수로 SqlDriver 제공 (@ahmedre 님의 #2534, #2614)

### 변경됨
- [Gradle 플러그인] Gradle 7.0을 명시적으로 요구하도록 변경 (@martinbonnin 님의 #2572)
- [Gradle 플러그인] VerifyMigrationTask가 Gradle의 최신 상태 검사(up-to-date checks)를 지원하도록 수정 (@3flex 님의 #2533)
- [IDE 플러그인] nullable 타입과 non-nullable 타입을 조인할 때 "Join compares two columns of different types" 경고가 발생하지 않도록 수정 (@pchmielowski 님의 #2550)
- [IDE 플러그인] 컬럼 타입에서 소문자 'as'에 대한 오류 설명 명확화 (@aperfilyev 님)

### 수정됨
- [IDE 플러그인] 프로젝트가 이미 폐기(disposed)된 경우 새 방언으로 다시 파싱하지 않도록 수정 (#2609)
- [IDE 플러그인] 연결된 가상 파일이 null이면 모듈도 null로 처리 (#2607)
- [IDE 플러그인] 미사용 쿼리 검사 중 비정상 종료 방지 (#2610)
- [IDE 플러그인] 데이터베이스 동기화 쓰기를 쓰기 액션(write action) 내부에서 실행 (#2605)
- [IDE 플러그인] IDE가 SQLDelight 동기화를 스케줄링하도록 위임
- [IDE 플러그인] JavaTypeMixin의 NPE 수정 (@aperfilyev 님의 #2603)
- [IDE 플러그인] MismatchJoinColumnInspection의 IndexOutOfBoundsException 수정 (@aperfilyev 님의 #2602)
- [IDE 플러그인] UnusedColumnInspection 설명 추가 (@aperfilyev 님의 #2600)
- [IDE 플러그인] PsiElement.generatedVirtualFiles를 읽기 액션으로 래핑 (@aperfilyev 님의 #2599)
- [IDE 플러그인] 불필요한 non-null 캐스팅 제거 (#2596)
- [IDE 플러그인] find usages 시 null을 올바르게 처리하도록 수정 (#2595)
- [IDE 플러그인] Android용 생성 파일에 대한 IDE 자동 완성 수정 (@martinbonnin 님의 #2573)
- [IDE 플러그인] SqlDelightGotoDeclarationHandler의 NPE 수정 (@aperfilyev 님)
- [IDE 플러그인] INSERT 구문 내부 인자의 Kotlin 키워드 맹글링 처리 (@aperfilyev 님의 #2433)
- [IDE 플러그인] SqlDelightFoldingBuilder의 NPE 수정 (@aperfilyev 님의 #2382)
- [IDE 플러그인] CopyPasteProcessor의 ClassCastException 예외 처리 (@aperfilyev 님의 #2369)
- [IDE 플러그인] UPDATE 라이브 템플릿 수정 (@IliasRedissi 님)
- [IDE 플러그인] 인텐션 액션에 설명 추가 (@aperfilyev 님의 #2489)
- [IDE 플러그인] 테이블을 찾을 수 없는 경우 CreateTriggerMixin의 예외 수정 (@aperfilyev 님)
- [컴파일러] 테이블 생성 구문 위상 정렬(topologically sort)
- [컴파일러] 디렉터리에 대해 `forDatabaseFiles` 콜백 호출 중단 (#2532)
- [Gradle 플러그인] generateDatabaseInterface 태스크 종속성을 잠재적 소비자에게 전파 (@martinbonnin 님의 #2518)

## [1.5.1] - 2021-07-16 {id="1-5-1-2021-07-16"}
[1.5.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.1

### 추가됨
- [PostgreSQL 방언] PostgreSQL JSONB 및 ON CONFLICT DO NOTHING (@satook 님)
- [PostgreSQL 방언] PostgreSQL ON CONFLICT (column, ...) DO UPDATE 지원 추가 (@satook 님)
- [MySQL 방언] MySQL 생성된 컬럼 지원 (@JGulbronson 님)
- [네이티브 드라이버] watchosX64 지원 추가
- [IDE 플러그인] 매개변수 타입 및 어노테이션 추가 (@aperfilyev 님)
- [IDE 플러그인] '모두 선택(select all)' 쿼리 생성 액션 추가 (@aperfilyev 님)
- [IDE 플러그인] 자동 완성 시 컬럼 타입 표시 (@aperfilyev 님)
- [IDE 플러그인] 자동 완성에 아이콘 추가 (@aperfilyev 님)
- [IDE 플러그인] '기본 키로 선택(select by primary key)' 쿼리 생성 액션 추가 (@aperfilyev 님)
- [IDE 플러그인] 'insert into' 쿼리 생성 액션 추가 (@aperfilyev 님)
- [IDE 플러그인] 컬럼 이름, 구문 식별자, 함수 이름 하이라이트 추가 (@aperfilyev 님)
- [IDE 플러그인] 나머지 쿼리 생성 액션 추가 (@aperfilyev 님의 #489)
- [IDE 플러그인] insert-stmt에서 매개변수 힌트 표시 (@aperfilyev 님)
- [IDE 플러그인] 테이블 별칭 인텐션 액션 (@aperfilyev 님)
- [IDE 플러그인] 컬럼 이름 한정(qualify) 인텐션 (@aperfilyev 님)
- [IDE 플러그인] Kotlin 프로퍼티 선언으로 이동(Go to declaration) 지원 (@aperfilyev 님)

### 변경됨
- [네이티브 드라이버] 가능한 경우 프리징(freezing) 및 공유 가능한 데이터 구조를 방지하여 네이티브 트랜잭션 성능 개선 (@andersio 님)
- [Paging 3] Paging3 버전을 3.0.0 안정화 버전으로 상향
- [JS 드라이버] sql.js를 1.5.0으로 업그레이드

### 수정됨
- [JDBC SQLite 드라이버] ThreadLocal을 지우기 전에 연결에 대해 close()를 호출하도록 수정 (@hannesstruss 님의 #2444)
- [RX 확장] 구독 / 해제 레이스 누수 수정 (@pyricau 님의 #2403)
- [코루틴 확장] 알림을 보내기 전에 쿼리 리스너를 먼저 등록하도록 보장
- [컴파일러] 일관된 Kotlin 출력 파일을 생성하도록 notifyQueries 정렬 (@thomascjy 님)
- [컴파일러] SELECT 쿼리 클래스 프로퍼티에 @JvmField 주석을 달지 않도록 변경 (@eygraber 님)
- [IDE 플러그인] 임포트 최적화(import optimizer) 수정 (@aperfilyev 님의 #2350)
- [IDE 플러그인] 미사용 컬럼 검사 수정 (@aperfilyev 님)
- [IDE 플러그인] 임포트 검사 및 클래스 어노테이터에 중첩 클래스 지원 추가 (@aperfilyev 님)
- [IDE 플러그인] CopyPasteProcessor의 NPE 수정 (@aperfilyev 님의 #2363)
- [IDE 플러그인] InlayParameterHintsProvider 충돌 수정 (@aperfilyev 님의 #2359)
- [IDE 플러그인] CREATE TABLE 구문에 텍스트를 복사/붙여넣기할 때 빈 줄이 삽입되던 문제 수정 (@aperfilyev 님의 #2433)

## [1.5.0] - 2021-04-23 {id="1-5-0-2021-04-23"}
[1.5.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.0

### 추가됨
- [SQLite Javascript 드라이버] sqljs-driver 배포 활성화 (@dellisd 님의 #1667)
- [Paging3 확장] Android Paging 3 라이브러리용 확장 (@kevincianfarini 님의 #1786)
- [MySQL 방언] MySQL의 ON DUPLICATE KEY UPDATE 충돌 해결 지원 추가 (@rharter 님)
- [SQLite 방언] SQLite offsets()에 대한 컴파일러 지원 추가 (@qjroberts 님)
- [IDE 플러그인] 알 수 없는 타입에 대한 임포트 빠른 수정 추가 (@aperfilyev 님의 #683)
- [IDE 플러그인] 미사용 임포트 검사 추가 (@aperfilyev 님의 #1161)
- [IDE 플러그인] 미사용 쿼리 검사 추가 (@aperfilyev 님)
- [IDE 플러그인] 미사용 컬럼 검사 추가 (@aperfilyev 님의 #569)
- [IDE 플러그인] 복사/붙여넣기 시 자동으로 임포트 가져오기 (@aperfilyev 님의 #684)
- [IDE 플러그인] Gradle/IntelliJ 플러그인 버전 간 호환되지 않을 때 알림 풍선 표시
- [IDE 플러그인] INSERT INTO ... VALUES(?) 매개변수 힌트 (@aperfilyev 님의 #506)
- [IDE 플러그인] 인라인 매개변수 힌트 (@aperfilyev 님)
- [런타임] 콜백을 사용하여 마이그레이션을 실행할 수 있는 API를 런타임에 포함 (#1844)

### 변경됨
- [컴파일러] "IS NOT NULL" 쿼리에 대한 스마트 캐스트 (#867)
- [컴파일러] 런타임에 실패할 수 있는 키워드 방지 (#1471, #1629)
- [Gradle 플러그인] Gradle 플러그인 크기를 60MB에서 13MB로 축소
- [Gradle 플러그인] Android 배선을 올바르게 지원하고, KMM 타깃별 SQL 지원 제거 (#1039)
- [Gradle 플러그인] minsdk에 따라 최소 SQLite 버전 선택 (#1684)
- [네이티브 드라이버] 네이티브 드라이버 연결 풀 및 성능 업데이트

### 수정됨
- [컴파일러] 람다 앞의 줄 바꿈 없는 공백(NBSP) 처리 (@oldergod 님)
- [컴파일러] 생성된 bind* 및 cursor.get* 구문에서 호환되지 않는 타입 문제 수정
- [컴파일러] SQL 절이 적합한(adapted) 타입을 유지하도록 수정 (#2067)
- [컴파일러] NULL 키워드만 있는 컬럼은 nullable이어야 함
- [컴파일러] 타입 어노테이션이 포함된 매퍼 람다를 생성하지 않도록 수정 (#1957)
- [컴파일러] 커스텀 쿼리가 충돌할 경우 파일 이름을 추가 패키지 접미사로 사용 (#1057, #1278)
- [컴파일러] 외래 키 연쇄(cascades)가 쿼리 리스너에 알림을 보내도록 보장 (#1325, #1485)
- [컴파일러] 동일한 타입 두 개를 UNION하는 경우 테이블 타입 반환 (#1342)
- [컴파일러] ifnull 및 coalesce의 매개변수가 nullable일 수 있도록 보장 (#1263)
- [컴파일러] 표현식에 대해 쿼리에서 부과한 널 가능성을 올바르게 사용
- [MySQL 방언] MySQL IF 문 지원
- [PostgreSQL 방언] PostgreSQL에서 NUMERIC 및 DECIMAL을 Double로 검색 (#2118)
- [SQLite 방언] UPSERT 알림이 BEFORE/AFTER UPDATE 트리거를 고려하도록 수정 (@andersio 님의 #2198)
- [SQLite 드라이버] 인메모리가 아닌 경우 SQLiteDriver의 스레드에 대해 여러 연결 사용 (#1832)
- [JDBC 드라이버] JDBC 드라이버가 autoCommit을 true로 가정하던 문제 (#2041)
- [JDBC 드라이버] 예외 발생 시 연결을 닫도록 보장 (#2306)
- [IDE 플러그인] 경로 구분자 버그로 인해 Windows에서 GoToDeclaration/FindUsages가 중단되던 문제 수정 (@angusholder 님의 #2054)
- [IDE 플러그인] IDE 충돌 대신 Gradle 오류 무시
- [IDE 플러그인] sqldelight 파일이 sqldelight가 아닌 모듈로 이동된 경우 코드 생성을 시도하지 않도록 수정
- [IDE 플러그인] IDE 내의 코드 생성 오류 무시
- [IDE 플러그인] 음수 서브스트링을 시도하지 않도록 보장 (#2068)
- [IDE 플러그인] Gradle 액션을 실행하기 전에 프로젝트가 폐기되지 않았는지 확인 (#2155)
- [IDE 플러그인] nullable 타입에 대한 산술 연산 결과도 nullable이 되도록 수정 (#1853)
- [IDE 플러그인] 'expand * intention'이 추가 프로젝션과 함께 작동하도록 수정 (@aperfilyev 님의 #2173)
- [IDE 플러그인] GoTo 중 Kotlin 확인이 실패하면 sqldelight 파일로 이동을 시도하지 않도록 수정
- [IDE 플러그인] SQLDelight 인덱싱 중 IntelliJ에 예외가 발생해도 비정상 종료되지 않도록 처리
- [IDE 플러그인] IDE에서 코드 생성 전 오류 감지 시 발생하는 예외 처리
- [IDE 플러그인] IDE 플러그인이 동적 플러그인(Dynamic Plugins)과 호환되도록 수정 (#1536)
- [Gradle 플러그인] WorkerApi를 사용하여 데이터베이스를 생성할 때 발생하는 경쟁 조건(race condition) 수정 (@stephanenicolas 님의 #2062)
- [Gradle 플러그인] 커스텀 JDBC 사용을 방해하던 classLoaderIsolation 문제 수정 (@benasher44 님의 #2048)
- [Gradle 플러그인] 누락된 packageName 오류 메시지 개선 (@vanniktech 님)
- [Gradle 플러그인] SQLDelight가 빌드스크립트 클래스패스로 IntelliJ 종속성을 유출하던 문제 수정 (#1998)
- [Gradle 플러그인] Gradle 빌드 캐싱 수정 (#2075)
- [Gradle 플러그인] Gradle 플러그인에서 kotlin-native-utils에 의존하지 않도록 수정 (@ilmat192 님)
- [Gradle 플러그인] 마이그레이션 파일만 있는 경우에도 데이터베이스를 작성하도록 수정 (#2094)
- [Gradle 플러그인] 다이아몬드 종속성이 최종 컴파일 단위에서 한 번만 선택되도록 보장 (#1455)

이번 릴리스에서 SQLDelight 인프라 개선을 위해 많은 기여를 해주신 @3flex 님께 감사를 표합니다.

## [1.4.4] - 2020-10-08 {id="1-4-4-2020-10-08"}
[1.4.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.4

### 추가됨
- [PostgreSQL 방언] WITH 절에서 데이터 수정 구문(data-modifying statements) 지원
- [PostgreSQL 방언] substring 함수 지원
- [Gradle 플러그인] SQLDelight 컴파일 중 마이그레이션 유효성 검사를 위한 verifyMigrations 플래그 추가 (#1872)

### 변경됨
- [컴파일러] SQLite가 아닌 방언에서 SQLite 전용 함수를 알 수 없음으로 표시
- [Gradle 플러그인] sqldelight 플러그인이 적용되었으나 구성된 데이터베이스가 없을 때 경고 출력 (#1421)

### 수정됨
- [컴파일러] ORDER BY 절에서 컬럼 이름을 바인딩할 때 오류 보고 (@eygraber 님의 #1187)
- [컴파일러] DB 인터페이스 생성 시 레지스트리 경고가 나타나던 문제 수정 (#1792)
- [컴파일러] CASE 문에 대한 잘못된 타입 유추 수정 (#1811)
- [컴파일러] 버전이 없는 마이그레이션 파일에 대해 더 나은 오류 제공 (#2006)
- [컴파일러] 일부 데이터베이스 타입 ColumnAdapter에 대해 마샬링에 필요한 데이터베이스 타입이 올바르지 않던 문제 수정 (#2012)
- [컴파일러] CAST의 널 가능성 수정 (#1261)
- [컴파일러] 쿼리 래퍼에서 이름 가림(name shadowed) 경고가 다수 발생하던 문제 수정 (@eygraber 님의 #1946)
- [컴파일러] 생성된 코드가 전체 한정자 이름을 사용하던 문제 수정 (#1939)
- [IDE 플러그인] Gradle 동기화에서 SQLDelight 코드 생성 트리거
- [IDE 플러그인] .sq 파일 변경 시 플러그인이 데이터베이스 인터페이스를 재생성하지 않던 문제 수정 (#1945)
- [IDE 플러그인] 새 패키지로 파일을 이동할 때 발생하던 문제 수정 (#444)
- [IDE 플러그인] 커서를 이동할 위치가 없으면 크래시 대신 아무 작업도 수행하지 않도록 수정 (#1994)
- [IDE 플러그인] Gradle 프로젝트 외부의 파일에 대해 빈 패키지 이름 사용 (#1973)
- [IDE 플러그인] 유효하지 않은 타입에 대해 안전하게 실패하도록 처리 (#1943)
- [IDE 플러그인] 알 수 없는 표현식을 만났을 때 더 나은 오류 메시지 반환 (#1958)
- [Gradle 플러그인] SQLDelight가 빌드스크립트 클래스패스로 IntelliJ 종속성을 유출하던 문제 수정 (#1998)
- [Gradle 플러그인] *.sq 파일에 메서드 문서를 추가할 때 발생하는 "JavadocIntegrationKt not found" 컴파일 오류 수정 (#1982)
- [Gradle 플러그인] SqlDelight Gradle 플러그인이 구성 캐싱(Configuration Caching)을 지원하지 않던 문제 수정 (@stephanenicolas 님의 #1947)
- [SQLite JDBC 드라이버] SQLException: 데이터베이스가 자동 커밋 모드임 (#1832)
- [코루틴 확장] coroutines-extensions에 대한 IR 백엔드 수정 (@dellisd 님의 #1918)

## [1.4.3] - 2020-09-04 {id="1-4-3-2020-09-04"}
[1.4.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.3

### 추가됨
- [MySQL 방언] MySQL last_insert_id 함수 지원 추가 (@lawkai 님)
- [PostgreSQL 방언] SERIAL 데이터 타입 지원 (@veyndan 님, @felipecsl 님)
- [PostgreSQL 방언] PostgreSQL RETURNING 지원 (@veyndan 님)

### 수정됨
- [MySQL 방언] MySQL AUTO_INCREMENT를 기본값이 있는 것으로 처리 (#1823)
- [컴파일러] Upsert 문 컴파일러 오류 수정 (@eygraber 님의 #1809)
- [컴파일러] 유효하지 않은 Kotlin 코드가 생성되던 문제 수정 (@eygraber 님의 #1925)
- [컴파일러] 알 수 없는 함수에 대해 더 나은 오류 메시지 제공 (#1843)
- [컴파일러] instr의 두 번째 매개변수 타입으로 String 노출
- [IDE 플러그인] IDE 플러그인의 데몬 비대화 및 UI 스레드 정체 현상 수정 (#1916)
- [IDE 플러그인] 모듈이 null인 시나리오 처리 (#1902)
- [IDE 플러그인] 구성되지 않은 sq 파일에서는 패키지 이름으로 빈 문자열 반환 (#1920)
- [IDE 플러그인] 그룹화된 구문 수정 및 통합 테스트 추가 (#1820)
- [IDE 플러그인] 내장된 ModuleUtil을 사용하여 요소의 모듈 검색 (#1854)
- [IDE 플러그인] 조회(lookup)에 유효한 요소만 추가 (#1909)
- [IDE 플러그인] 상위 요소가 null일 수 있는 문제 처리 (#1857)

## [1.4.2] - 2020-08-27 {id="1-4-2-2020-08-27"}
[1.4.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.2

### 추가됨
- [런타임] 신규 JS IR 백엔드 지원
- [Gradle 플러그인] generateSqlDelightInterface Gradle 태스크 추가 (@vanniktech 님)
- [Gradle 플러그인] verifySqlDelightMigration Gradle 태스크 추가 (@vanniktech 님)

### 수정됨
- [IDE 플러그인] IDE와 Gradle 간의 데이터 공유를 촉진하기 위해 Gradle 도구 API 사용
- [IDE 플러그인] 스키마 도출(schema derivation) 기본값을 false로 설정
- [IDE 플러그인] commonMain 소스 세트를 올바르게 가져오도록 수정
- [MySQL 방언] mySqlFunctionType()에 minute 추가 (@maaxgr 님)

## [1.4.1] - 2020-08-21 {id="1-4-1-2020-08-21"}
[1.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.1

### 추가됨
- [런타임] Kotlin 1.4.0 지원 (#1859)

### 변경됨
- [Gradle 플러그인] AGP 종속성을 compileOnly로 변경 (#1362)

### 수정됨
- [컴파일러] 컬럼 정의 규칙 및 테이블 인터페이스 생성기에 선택적 JavaDoc 추가 (@endanke 님의 #1224)
- [SQLite 방언] SQLite FTS5 보조 함수 highlight, snippet, bm25 지원 추가 (@drampelt 님)
- [MySQL 방언] MySQL BIT 데이터 타입 지원
- [MySQL 방언] MySQL 바이너리 리터럴 지원
- [PostgreSQL 방언] sql-psi에서 SERIAL 노출 (@veyndan 님)
- [PostgreSQL 방언] BOOLEAN 데이터 타입 추가 (@veyndan 님)
- [PostgreSQL 방언] NULL 컬럼 제약 조건 추가 (@veyndan 님)
- [HSQL 방언] HSQL에 `AUTO_INCREMENT` 지원 추가 (@rharter 님)

## [1.4.0] - 2020-06-22 {id="1-4-0-2020-06-22"}
[1.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.0

### 추가됨
- [MySQL 방언] MySQL 지원 (@JGulbronson 님, @veyndan 님)
- [PostgreSQL 방언] 실험적 PostgreSQL 지원 (@veyndan 님)
- [HSQL 방언] 실험적 H2 지원 (@MariusVolkhart 님)
- [SQLite 방언] SQLite FTS5 지원 (@benasher44 님, @jpalawaga 님)
- [SQLite 방언] ALTER TABLE RENAME COLUMN 지원 (@angusholder 님의 #1505)
- [IDE] 마이그레이션(.sqm) 파일에 대한 IDE 지원
- [IDE] 기본 SQL 라이브 템플릿을 모방한 SQLDelight 라이브 템플릿 추가 (@veyndan 님의 #1154)
- [IDE] 새로운 SqlDelight 파일 액션 추가 (@romtsn 님의 #42)
- [런타임] 결과를 반환하는 트랜잭션을 위한 transactionWithReturn API
- [컴파일러] .sq 파일에서 여러 SQL 구문을 그룹화하기 위한 문법
- [컴파일러] 마이그레이션 파일로부터 스키마 생성 지원
- [Gradle 플러그인] 마이그레이션 파일을 유효한 SQL로 출력하는 태스크 추가

### 변경됨
- [문서] 문서 웹사이트 개편 (@saket 님)
- [Gradle 플러그인] 지원되지 않는 방언에 대한 오류 메시지 개선 (@veyndan 님)
- [IDE] 방언에 따라 파일 아이콘을 동적으로 변경 (@veyndan 님)
- [JDBC 드라이버] javax.sql.DataSource 기반의 JdbcDriver 생성자 노출 (#1614)

### 수정됨
- [컴파일러] 테이블에 대한 JavaDoc 지원 및 한 파일 내의 다중 JavaDoc 문제 수정 (#1224)
- [컴파일러] 합성 컬럼에 값 삽입 가능하도록 지원 (#1351)
- [컴파일러] 디렉터리 이름 정리 불일치 문제 수정 (@ZacSweers 님)
- [컴파일러] 합성 컬럼이 조인 전체에서 널 가능성을 유지하도록 수정 (#1656)
- [컴파일러] DELETE 구문을 DELETE 키워드에 고정 (#1643)
- [컴파일러] 따옴표 처리 수정 (@angusholder 님의 #1525)
- [컴파일러] BETWEEN 연산자가 표현식 내부로 올바르게 재귀하도록 수정 (#1279)
- [컴파일러] 인덱스 생성 시 테이블/컬럼 누락에 대해 더 나은 오류 제공 (#1372)
- [컴파일러] 조인 제약 조건에서 외부 쿼리의 프로젝션을 사용할 수 있도록 지원 (#1346)
- [네이티브 드라이버] execute가 transactionPool을 사용하도록 변경 (@benasher44 님)
- [JDBC 드라이버] SQLite 대신 JDBC 트랜잭션 API 사용 (#1693)
- [IDE] virtualFile 참조가 항상 원본 파일이 되도록 수정 (#1782)
- [IDE] Bugsnag에 오류를 보고할 때 올바른 throwable 사용 (#1262)
- [페이징 확장] DataSource 누수 수정 (#1628)
- [Gradle 플러그인] 스키마 생성 시 출력 db 파일이 이미 존재하는 경우 삭제 (#1645)
- [Gradle 플러그인] 누락된 버전 간격(gap)이 있는 경우 마이그레이션 유효성 검사 실패 처리
- [Gradle 플러그인] 설정된 파일 인덱스를 명시적으로 사용 (#1644)

## [1.3.0] - 2020-04-03 {id="1-3-0-2020-04-03"}
[1.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.3.0

* 신규: [Gradle] 컴파일 대상 SQL 방언을 지정하는 Dialect 프로퍼티 추가.
* 신규: [컴파일러] #1009 MySQL 방언 실험적 지원.
* 신규: [컴파일러] #1436 SQLite 3.24 방언 및 upsert 지원.
* 신규: [JDBC 드라이버] SQLite JVM 드라이버에서 JDBC 드라이버 분리.
* 수정: [컴파일러] #1199 임의 길이의 람다 지원.
* 수정: [컴파일러] #1610 avg()의 반환 타입이 nullable이 되도록 수정.
* 수정: [IntelliJ] #1594 Windows에서 Goto 및 Find Usages를 중단시키던 경로 구분자 처리 문제 수정.

## [1.2.2] - 2020-01-22 {id="1-2-2-2020-01-22"}
[1.2.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.2

* 신규: [런타임] Windows (mingw), tvOS, watchOS, macOS 아키텍처 지원.
* 수정: [컴파일러] sum()의 반환 타입은 nullable이어야 함.
* 수정: [페이징] 경쟁 상태를 피하기 위해 QueryDataSourceFactory에 Transacter 전달.
* 수정: [IntelliJ 플러그인] 파일의 패키지 이름을 찾을 때 종속성을 검색하지 않도록 수정.
* 수정: [Gradle] #862 Gradle의 유효성 검사 로그를 디버그 레벨로 변경.
* 개선: [Gradle] GenerateSchemaTask가 Gradle 워커를 사용하도록 변환.
* 참고: sqldelight-runtime 아티팩트 이름이 runtime으로 변경되었습니다.

## [1.2.1] - 2019-12-11 {id="1-2-1-2019-12-11"}
[1.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.1

* 수정: [Gradle] Kotlin Native 1.3.60 지원.
* 수정: [Gradle] #1287 동기화 시 경고 문제.
* 수정: [컴파일러] #1469 쿼리를 위한 SyntheticAccessor 생성.
* 수정: [JVM 드라이버] 메모리 누수 수정.
* 참고: 코루틴 확장 아티팩트를 사용하려면 buildscript에 kotlinx bintray maven 저장소를 추가해야 합니다.

## [1.2.0] - 2019-08-30 {id="1-2-0-2019-08-30"}
[1.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.0

* 신규: [런타임] 안정화된 Flow API.
* 수정: [Gradle] Kotlin Native 1.3.50 지원.
* 수정: [Gradle] #1380 clean 빌드가 간헐적으로 실패하던 문제.
* 수정: [Gradle] #1348 검증 태스크 실행 시 "Could not retrieve functions"가 출력되던 문제.
* 수정: [컴파일러] #1405 쿼리에 FTS 테이블 조인이 포함된 경우 프로젝트를 빌드할 수 없던 문제.
* 수정: [Gradle] #1266 여러 데이터베이스 모듈이 있을 때 간헐적으로 발생하던 Gradle 빌드 실패.

## [1.1.4] - 2019-07-11 {id="1-1-4-2019-07-11"}
[1.1.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.4

* 신규: [런타임] 실험적 Kotlin Flow API.
* 수정: [Gradle] Kotlin/Native 1.3.40 호환성.
* 수정: [Gradle] #1243 Gradle configure on demand와 함께 SQLDelight 사용 시 발생하는 문제 수정.
* 수정: [Gradle] #1385 증분 어노테이션 처리와 함께 SQLDelight 사용 시 발생하는 문제 수정.
* 수정: [Gradle] Gradle 태스크 캐싱 허용.
* 수정: [Gradle] #1274 Kotlin DSL에서 sqldelight 확장 사용 활성화.
* 수정: [컴파일러] 각 쿼리에 대해 고유 ID가 결정론적으로 생성되도록 수정.
* 수정: [컴파일러] 트랜잭션이 완료되었을 때만 대기 중인 쿼리에 알림 전송.
* 수정: [JVM 드라이버] #1370 JdbcSqliteDriver 사용 시 DB URL을 반드시 제공하도록 강제.

## [1.1.3] - 2019-04-14 {id="1-1-3-2019-04-14"}
[1.1.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.3

* Gradle Metadata 1.0 릴리스.

## [1.1.2] - 2019-04-14 {id="1-1-2-2019-04-14"}
[1.1.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.2

* 신규: [런타임] #1267 로깅 드라이버 데코레이터.
* 수정: [컴파일러] #1254 2^16자보다 긴 문자열 리터럴 분할 처리.
* 수정: [Gradle] #1260 멀티플랫폼 프로젝트에서 생성된 소스가 iOS 소스로 인식되던 문제.
* 수정: [IDE] #1290 CopyAsSqliteAction.kt:43의 kotlin.KotlinNullPointerException 수정.
* 수정: [Gradle] #1268 최신 버전에서 linkDebugFrameworkIos* 태스크 실행이 실패하던 문제.

## [1.1.1] - 2019-03-01 {id="1-1-1-2019-03-01"}
[1.1.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.1

* 수정: [Gradle] Android 프로젝트의 모듈 종속성 컴파일 수정.
* 수정: [Gradle] #1246 afterEvaluate에서 API 종속성 설정.
* 수정: [컴파일러] 배열 타입이 올바르게 출력되도록 수정.

## [1.1.0] - 2019-02-27 {id="1-1-0-2019-02-27"}
[1.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.0

* 신규: [Gradle] #502 스키마 모듈 종속성 지정 허용.
* 개선: [컴파일러] #1111 테이블 오류가 다른 오류보다 먼저 정렬되도록 개선.
* 수정: [컴파일러] #1225 REAL 리터럴에 대해 올바른 타입 반환.
* 수정: [컴파일러] #1218 docid가 트리거를 통해 전파되도록 수정.

## [1.0.3] - 2019-01-30 {id="1-0-3-2019-01-30"}
[1.0.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.3

* 개선: [런타임] #1195 네이티브 드라이버/런타임 Arm32 지원.
* 개선: [런타임] #1190 Query 타입에서 매퍼 노출.

## [1.0.2] - 2019-01-26 {id="1-0-2-2019-01-26"}
[1.0.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.2

* 수정: [Gradle 플러그인] Kotlin 1.3.20으로 업데이트.
* 수정: [런타임] 트랜잭션이 더 이상 예외를 무시(swallow)하지 않음.

## [1.0.1] - 2019-01-21 {id="1-0-1-2019-01-21"}
[1.0.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.1

* 개선: [네이티브 드라이버] DatabaseConfiguration에 디렉터리 이름 전달 허용.
* 개선: [컴파일러] #1173 패키지가 없는 파일은 컴파일에 실패하도록 변경.
* 수정: [IDE] IDE 오류를 Square에 올바르게 보고하도록 수정.
* 수정: [IDE] #1162 동일한 패키지의 타입이 오류로 표시되지만 정상 작동하던 문제 수정.
* 수정: [IDE] #1166 테이블 이름 변경 시 NPE가 발생하던 문제 수정.
* 수정: [컴파일러] #1167 UNION 및 SELECT가 포함된 복잡한 SQL 구문을 파싱할 때 발생하던 예외 수정.

## [1.0.0] - 2019-01-08 {id="1-0-0-2019-01-08"}
[1.0.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.0

* 신규: 생성된 코드를 Kotlin으로 완전히 개편.
* 신규: RxJava2 확장 아티팩트.
* 신규: Android Paging 확장 아티팩트.
* 신규: Kotlin 멀티플랫폼 지원.
* 신규: Android, iOS, JVM SQLite 드라이버 아티팩트.
* 신규: 트랜잭션 API.

## [0.7.0] - 2018-02-12 {id="0-7-0-2018-02-12"}
[0.7.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.7.0

 * 신규: Support SQLite 라이브러리만 사용하도록 생성된 코드 업데이트. 모든 쿼리가 이제 원시 문자열 대신 구문(statement) 객체를 생성합니다.
 * 신규: IDE에서 구문 접기(statement folding) 지원.
 * 신규: 불리언 타입 자동 처리.
 * 수정: 코드 생성에서 지원 중단된 마샬(marshal) 제거.
 * 수정: 'avg' SQL 함수 타입 매핑이 REAL이 되도록 수정.
 * 수정: 'julianday' SQL 함수 올바르게 감지.

## [0.6.1] - 2017-03-22 {id="0-6-1-2017-03-22"}
[0.6.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.6.1

 * 신규: 인자가 없는 Delete, Update, Insert 구문에 대해 컴파일된 구문 객체 생성.
 * 수정: 하위 쿼리에 사용된 뷰 내부의 USING 절이 오류를 발생시키지 않도록 수정.
 * 수정: 생성된 Mapper의 중복 타입 제거.
 * 수정: 인자를 대상으로 확인하는 표현식에서 하위 쿼리를 사용할 수 있도록 수정.

## [0.6.0] - 2017-03-06 {id="0-6-0-2017-03-06"}
[0.6.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.6.0

 * 신규: SELECT 쿼리가 문자열 상수 대신 `SqlDelightStatement` 팩토리로 노출됩니다.
 * 신규: 쿼리 JavaDoc이 구문 및 매퍼 팩토리로 복사됩니다.
 * 신규: 뷰 이름에 대한 문자열 상수 출력.
 * 수정: 팩토리가 필요한 뷰에 대한 쿼리가 해당 팩토리를 인자로 올바르게 요구하도록 수정.
 * 수정: INSERT 문의 인자 수가 지정된 컬럼 수와 일치하는지 유효성 검사 추가.
 * 수정: WHERE 절에 사용된 BLOB 리터럴을 올바르게 인코딩하도록 수정.
 * 이 릴리스를 사용하려면 Gradle 3.3 이상이 필요합니다.

## [0.5.1] - 2016-10-24 {id="0-5-1-2016-10-24"}
[0.5.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.5.1

 * 신규: 컴파일된 구문이 추상 타입을 상속합니다.
 * 수정: 매개변수의 기본형 타입이 nullable인 경우 박싱 처리됩니다.
 * 수정: 바인드 인자에 필요한 모든 팩토리가 팩토리 메서드에 존재하도록 수정.
 * 수정: 이스케이프된 컬럼 이름이 올바르게 마샬링되도록 수정.

## [0.5.0] - 2016-10-19 {id="0-5-0-2016-10-19"}
[0.5.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.5.0

 * 신규: Factory를 통해 SQLite 인자를 타입 안전하게 전달 가능.
 * 신규: IntelliJ 플러그인이 .sq 파일 서식 지정(formatting) 수행.
 * 신규: SQLite 타임스탬프 리터럴 지원.
 * 수정: IntelliJ에서 매개변수화된 타입을 클릭하여 이동할 수 있도록 수정.
 * 수정: Cursor에서 가져올 때 이스케이프된 컬럼 이름이 더 이상 RuntimeException을 발생시키지 않음.
 * 수정: Gradle 플러그인이 예외를 출력하려 할 때 크래시가 발생하지 않도록 수정.

## [0.4.4] - 2016-07-20 {id="0-4-4-2016-07-20"}
[0.4.4]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.4

 * 신규: 컬럼 Java 타입으로 Short 기본 지원.
 * 신규: 생성된 매퍼 및 팩토리 메서드에 Javadoc 포함.
 * 수정: group_concat 및 nullif 함수의 올바른 널 가능성 설정.
 * 수정: Android Studio 2.2-alpha와의 호환성 확보.
 * 수정: WITH RECURSIVE가 더 이상 플러그인을 중단시키지 않음.

## [0.4.3] - 2016-07-07 {id="0-4-3-2016-07-07"}
[0.4.3]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.3

 * 신규: 컴파일 오류 시 소스 파일 링크 제공.
 * 신규: SQLDelight 코드를 유효한 SQLite로 복사하는 마우스 오른쪽 버튼 액션 추가.
 * 신규: 명명된 구문의 Javadoc이 생성된 String에 표시됩니다.
 * 수정: 생성된 뷰 모델에 널 가능성 어노테이션 포함.
 * 수정: UNION에서 생성된 코드가 가능한 모든 컬럼을 지원하도록 적절한 타입 및 널 가능성을 가짐.
 * 수정: sum 및 round SQLite 함수가 생성된 코드에서 올바른 타입을 가짐.
 * 수정: CAST, 내부 SELECT 관련 버그 수정.
 * 수정: CREATE TABLE 문에서의 자동 완성 수정.
 * 수정: 패키지에 SQLite 키워드 사용 가능.

## [0.4.2] - 2016-06-16 {id="0-4-2-2016-06-16"}
[0.4.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.2

 * 신규: 팩토리로부터 Marshal을 생성할 수 있습니다.
 * 수정: IntelliJ 플러그인이 올바른 제네릭 순서로 팩토리 메서드를 생성하도록 수정.
 * 수정: 함수 이름의 대소문자를 구분하지 않도록 수정.

## [0.4.1] - 2016-06-14 {id="0-4-1-2016-06-14"}
[0.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.1

 * 수정: IntelliJ 플러그인이 올바른 제네릭 순서로 클래스를 생성하도록 수정.
 * 수정: 컬럼 정의의 대소문자를 구분하지 않도록 수정.

## [0.4.0] - 2016-06-14 {id="0-4-0-2016-06-14"}
[0.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.0

 * 신규: 테이블별이 아닌 쿼리별로 매퍼가 생성됩니다.
 * 신규: .sq 파일에서 Java 타입을 임포트할 수 있습니다.
 * 신규: SQLite 함수 유효성 검사 수행.
 * 수정: 중복 오류 제거.
 * 수정: 대문자 컬럼 이름 및 Java 키워드 컬럼 이름이 오류를 유발하지 않도록 수정.

## [0.3.2] - 2016-05-14 {id="0-3-2-2016-05-14"}
[0.3.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.2

 * 신규: 뷰 및 별칭에 대해 자동 완성 및 find usages가 작동합니다.
 * 수정: 컴파일 타임 검증에서 SELECT 내 함수 사용을 허용합니다.
 * 수정: 기본값만 선언하는 INSERT 문 지원.
 * 수정: SQLDelight를 사용하지 않는 프로젝트를 가져올 때 플러그인이 더 이상 비정상 종료되지 않음.

## [0.3.1] - 2016-04-27 {id="0-3-1-2016-04-27"}
[0.3.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.1

  * 수정: 메서드 참조로 인한 Illegal Access 런타임 예외를 방지하기 위해 인터페이스 가시성을 다시 public으로 변경.
  * 수정: 하위 표현식이 올바르게 평가되도록 수정.

## [0.3.0] - 2016-04-26 {id="0-3-0-2016-04-26"}
[0.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.0

  * 신규: 컬럼 정의에 SQLite 타입을 사용하며, Java 타입을 지정하기 위해 추가적인 'AS' 제약 조건을 가질 수 있습니다.
  * 신규: IDE에서 버그 리포트를 전송할 수 있습니다.
  * 수정: 자동 완성 기능 정상화.
  * 수정: .sq 파일 편집 시 SQLDelight 모델 파일이 업데이트됩니다.
  * 제거됨: Attached 데이터베이스가 더 이상 지원되지 않습니다.

## [0.2.2] - 2016-03-07 {id="0-2-2-2016-03-07"}
[0.2.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.2

 * 신규: INSERT, UPDATE, DELETE, INDEX, TRIGGER 구문에서 사용되는 컬럼의 컴파일 타임 유효성 검사.
 * 수정: 파일 이동/생성 시 IDE 플러그인이 비정상 종료되지 않도록 수정.

## [0.2.1] - 2016-03-07 {id="0-2-1-2016-03-07"}
[0.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.1

 * 신규: Ctrl+`/` (OSX에서는 Cmd+`/`)를 눌러 선택한 줄의 주석을 토글할 수 있습니다.
 * 신규: SQL 쿼리에서 사용되는 컬럼의 컴파일 타임 유효성 검사.
 * 수정: IDE와 Gradle 플러그인 모두에서 Windows 경로 지원.

## [0.2.0] - 2016-02-29 {id="0-2-0-2016-02-29"}
[0.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.0

 * 신규: Marshal 클래스에 복사 생성자 추가.
 * 신규: Kotlin 1.0 최종 버전으로 업데이트.
 * 수정: 'sqldelight' 폴더 구조 문제를 실패를 유발하지 않는 방식으로 보고.
 * 수정: `table_name`이라는 이름의 컬럼 금지. 생성된 상수가 테이블 이름 상수와 충돌합니다.
 * 수정: `.sq` 파일의 열림 여부와 상관없이 IDE 플러그인이 모델 클래스를 즉시 생성하도록 보장.
 * 수정: IDE와 Gradle 플러그인 모두에서 Windows 경로 지원.

## [0.1.2] - 2016-02-13 {id="0-1-2-2016-02-13"}
[0.1.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.2

 * 수정: 대부분의 프로젝트에서 Gradle 플러그인을 사용할 수 없게 만들던 코드 제거.
 * 수정: Antlr 런타임에 대한 컴파일러 종속성 누락 문제 수정.

## [0.1.1] - 2016-02-12 {id="0-1-1-2016-02-12"}
[0.1.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.1

 * 수정: Gradle 플러그인이 자신과 동일한 버전의 런타임을 가리키도록 보장.

## [0.1.0] - 2016-02-12 {id="0-1-0-2016-02-12"}
[0.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.0

최초 릴리스.