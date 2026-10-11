# 변경 로그 (Change Log)

## 미출시 (Unreleased) {id="unreleased"}

### 추가됨 {id="added"}

- 아직 없음!

### 변경됨 {id="changed"}

- 아직 없음!

### 수정됨 {id="fixed"}

- 아직 없음!

## [2.4.1] - 2026-10-06 {id="2-4-1-2026-10-06"}
[2.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.1

### 추가됨

- [Documentation] Android SQLite 트랜잭션 관련 추가 문서화 (#6381, @griffio 기여)

### 변경됨

- [Gradle Plugin] 파싱된 `.sq` 파일을 전체 코드 생성 작업(Task) 동안 메모리에 유지하여 가비지 컬렉션 이후 다시 파싱되지 않도록 개선. 대규모 프로젝트에서 코드 생성 속도가 향상될 수 있습니다. (#6374, @C2H6O 기여)
- [IntelliJ Plugin] 크래시 보고가 커스텀 Bugsnag 인스턴스 대신 JetBrains Marketplace로 전송되도록 변경 (#6376, @JakeWharton 기여)

### 수정됨

- [IntelliJ Plugin] IntelliJ API 사용 방식을 변경하여 플러그인 배포 위반 사항 수정 (#6366 #6368, @griffio 기여)

## [2.4.0] - 2026-09-17 {id="2-4-0-2026-09-17"}
[2.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0

### 추가됨
- [Native Driver] `inMemoryDriver`에 `extendedConfig` 매개변수 추가 (#5539, @GuilhE 기여)
- [PostgreSQL Dialect] 암시적으로 정의된 시스템 컬럼(System Columns)에 대한 쿼리 지원 추가 (#5834, @griffio 기여)
- [PostgreSQL Dialect] 기본 배열 리터럴(Array literal) 지원 추가 (#5997, @griffio 기여)
- [PostgreSQL Dialect] 기본 LTREE 지원 추가 (#5880, @yesitskev, @griffio 기여)
- [MySQL Dialect] INET 함수 지원 추가 (#5072, @mcxinyu 기여)
- [PostgreSQL Dialect] ALTER INDEX 지원 추가 (#6224, @griffio 기여)
- [SQLite Dialect] SQLite 3.44 집계 함수 DISTINCT, ORDER BY 및 FILTER 지원 추가 (#6236, @griffio 기여)
- [SQLite Dialect] SQLite 3.37 STRICT 테이블 지원 추가 (#6230, @griffio 기여)
- [Gradle Plugin] `codegenExcludedColumns`를 통해 생성된 모델에서 컬럼을 제외할 수 있는 기능 지원 (#6243, @sokolikp 기여)
- [Compiler] 스키마에 `allTableNames` 함수 추가 (#6245, @edenman 기여)
- [PostgreSQL Dialect] ANY 연산자 지원 추가 (#6253, @griffio 기여)
- [SQLite Dialect] SQLite 3.39 RIGHT JOIN 및 FULL JOIN 지원 추가 (#6273, @griffio 기여)
- [PostgreSQL Dialect] 트리거 함수에서 `RAISE` 문 및 `FOUND` 변수 지원 추가 (#6297, @griffio 기여)

### 변경됨
- [PostgreSQL Dialect] arrayIntermediateType의 가시성을 public으로 변경 (#5835, @griffio 기여)
- [Gradle Plugin] 더 엄격한 MigrationFile 버전 관리 구현 (#5730, @madisp 기여)
- [Gradle Plugin] 최소 지원 Gradle 버전을 8.2.1로 상향 (#6217, @maxsav 기여)
- [Gradle Plugin] Gradle의 Isolated Projects 기능 지원 (#6217, @maxsav 기여)
- [IntelliJ Plugin] 최소 요구 버전을 2023.3 / Android Studio Jellyfish로 상향

### 수정됨
- [Gradle Plugin] JDK 24+ 환경에서 컴파일러 워커의 `sun.misc.Unsafe` 지원 중단(deprecation) 경고 억제 (#6321)
- [Compiler] 생성된 코드에서 불필요한 Kotlin 경고 억제 (#6208, @eyupcanakman 기여)
- [Compiler] 그룹화되지 않은 집계 결과 집합의 다른 컬럼들이 항상 nullable이 되도록 수정
- [PostgreSQL Dialect] coalesce 및 ifnull의 null 가능성(nullability)이 올바르게 결정되도록 수정
- [PostgreSQL Dialect] PostgreSQL 방언의 IDE 통합 수정
- [PostgreSQL Dialect] PostgreSQL 방언에 대한 IDE 플러그인 개선 (#6209, @griffio 기여)
- [Intellij Plugin] IDE 플러그인이 모든 방언에 대해 코드 완성을 수행할 수 있도록 수정 (#6210, @griffio 기여)
- [Gradle Plugin] 데이터베이스 검증 태스크 실행 시 발생하던 순환 의존성 오류 수정 (#6221, @griffio 기여)
- [Compiler] 다중 행 업데이트(multirow update)에 대한 낙관적 락(optimistic lock) 수정 (#6240, @griffio 기여)
- [Intellij Plugin] IDEA 2026.2에서 크래시를 유발하던 지원 중단 API 문제 수정 (#6247, @griffio 기여)
- [Gradle Plugin] AGP 8.9~8.11에서 Kotlin 컴파일 시 생성된 소스를 감지하지 못하던 문제 수정
- [PostgreSQL Dialect] lower 및 upper 함수에서 Primitive 바인드 인자를 사용할 때 기본값이 TEXT로 지정되도록 수정 (#6262, @griffio 기여)
- [Compiler] null 가능성을 변경하는 어댑터와 마이그레이션을 사용할 때 데이터 클래스 바인딩이 포함된 insert values 문제 수정 (#6269, @griffio 기여)
- [Compiler] null 안전 연산자(IS 및 IS DISTINCT FROM)에 nullable 바인드 인자 사용 (#6265, @griffio 기여)
- [Gradle Plugin] 프로젝트 의존성에 대해 AGP의 variant resolution 사용 (#6217, @maxsav 기여)
- [Gradle Plugin] 빌드 간 AGP 배리언트 목록이 다를 때 generateDatabaseInterface에 대한 빌드 캐시 미스 문제 수정
- [Gradle Plugin] 데이터베이스를 구성하지 않고 플러그인을 적용했을 때 IDE 동기화가 실패하던 크래시 수정 (#6088)
- [PostgreSQL Dialect] 중첩된 함수 호출을 사용할 때 json 집계 함수 수정 (#6281, @griffio 기여)
- [Paging3 Extension] 빈 데이터베이스에서 KeyedQueryPagingSource가 크래시를 일으키던 문제 수정 (#6284, @woods-marshes 기여)
- [Compiler] `COALESCE`와 같은 래핑 함수와 함께 변경문(mutator statement)을 사용할 때 발생하는 Java 타입 어댑터 문제 수정 (#6292, @griffio 기여)
- [Compiler] 모듈명이 대문자로 시작하는 경우 생성된 코드의 패키지명도 대문자가 되던 문제 수정 (#6316, @griffio 기여)
- [PostgreSQL Dialect] 날짜 데이터 타입의 대소문자를 구분하지 않도록 허용 (#6328, @griffio 기여)
- [PostgreSQL Dialect] `string_agg` 함수가 nullable이 되도록 수정 (#6340, @griffio 기여)
- [SQLite Dialect] `GROUP BY`를 사용하는 SQLite 3.44 집계 함수 수정 (#6343, @griffio 기여)
- [Gradle Plugin] 구성(Configuration) 단계에서 데이터베이스 의존성을 확인(resolve)하지 않도록 수정 (#6353, @joshfriend 기여)

## [2.4.0-rc2] - 2026-09-14 {id="2-4-0-rc2-2026-09-14"}
[2.4.0-rc2]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0-rc2

### 수정됨

- [PostgreSQL Dialect] `string_agg` 함수가 nullable이 되도록 수정 (#6340, @griffio 기여)
- [SQLite Dialect] `GROUP BY`를 사용하는 SQLite 3.44 집계 함수 수정 (#6343, @griffio 기여)
- [Gradle Plugin] 구성(Configuration) 단계에서 데이터베이스 의존성을 확인하지 않도록 수정 (#6353, @joshfriend 기여)

## [2.4.0-rc1] - 2026-09-01 {id="2-4-0-rc1-2026-09-01"}
[2.4.0-rc1]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0-rc1

### 추가됨
- [Native Driver] `inMemoryDriver`에 `extendedConfig` 매개변수 추가 (#5539, @GuilhE 기여)
- [PostgreSQL Dialect] 암시적으로 정의된 시스템 컬럼에 대한 쿼리 지원 추가 (#5834, @griffio 기여)
- [PostgreSQL Dialect] 기본 배열 리터럴 지원 추가 (#5997, @griffio 기여)
- [PostgreSQL Dialect] 기본 LTREE 지원 추가 (#5880, @yesitskev, @griffio 기여)
- [MySQL Dialect] INET 함수 지원 추가 (#5072, @mcxinyu 기여)
- [PostgreSQL Dialect] ALTER INDEX 지원 추가 (#6224, @griffio 기여)
- [SQLite Dialect] SQLite 3.44 집계 함수 DISTINCT, ORDER BY 및 FILTER 지원 추가 (#6236, @griffio 기여)
- [SQLite Dialect] SQLite 3.37 STRICT 테이블 지원 추가 (#6230, @griffio 기여)
- [Gradle Plugin] `codegenExcludedColumns`를 통해 생성된 모델에서 컬럼을 제외할 수 있는 기능 지원 (#6243, @sokolikp 기여)
- [Compiler] 스키마에 `allTableNames` 함수 추가 (#6245, @edenman 기여)
- [PostgreSQL Dialect] ANY 연산자 지원 추가 (#6253, @griffio 기여)
- [SQLite Dialect] SQLite 3.39 RIGHT JOIN 및 FULL JOIN 지원 추가 (#6273, @griffio 기여)
- [PostgreSQL Dialect] 트리거 함수에서 `RAISE` 문 및 `FOUND` 변수 지원 추가 (#6297, @griffio 기여)

### 변경됨
- [PostgreSQL Dialect] arrayIntermediateType의 가시성을 public으로 변경 (#5835, @griffio 기여)
- [Gradle Plugin] 더 엄격한 MigrationFile 버전 관리 구현 (#5730, @madisp 기여)
- [Gradle Plugin] 최소 지원 Gradle 버전을 8.2.1로 상향 (#6217, @maxsav 기여)
- [Gradle Plugin] Gradle의 Isolated Projects 기능 지원 (#6217, @maxsav 기여)
- [IntelliJ Plugin] 최소 요구 버전을 2023.3 / Android Studio Jellyfish로 상향

### 수정됨
- [Gradle Plugin] JDK 24+ 환경에서 컴파일러 워커의 `sun.misc.Unsafe` 지원 중단 경고 억제 (#6321)
- [Compiler] 생성된 코드에서 불필요한 Kotlin 경고 억제 (#6208, @eyupcanakman 기여)
- [Compiler] 그룹화되지 않은 집계 결과 집합의 다른 컬럼들이 항상 nullable이 되도록 수정
- [PostgreSQL Dialect] coalesce 및 ifnull의 null 가능성이 올바르게 결정되도록 수정
- [PostgreSQL Dialect] PostgreSQL 방언의 IDE 통합 수정
- [PostgreSQL Dialect] PostgreSQL 방언에 대한 IDE 플러그인 개선 (#6209, @griffio 기여)
- [Intellij Plugin] IDE 플러그인이 모든 방언에 대해 코드 완성을 수행할 수 있도록 수정 (#6210, @griffio 기여)
- [Gradle Plugin] 데이터베이스 검증 태스크 실행 시 발생하던 순환 의존성 오류 수정 (#6221, @griffio 기여)
- [Compiler] 다중 행 업데이트에 대한 낙관적 락 수정 (#6240, @griffio 기여)
- [Intellij Plugin] IDEA 2026.2에서 크래시를 유발하던 지원 중단 API 문제 수정 (#6247, @griffio 기여)
- [Gradle Plugin] AGP 8.9~8.11에서 Kotlin 컴파일 시 생성된 소스를 감지하지 못하던 문제 수정
- [PostgreSQL Dialect] lower 및 upper 함수에서 Primitive 바인드 인자를 사용할 때 기본값이 TEXT로 지정되도록 수정 (#6262, @griffio 기여)
- [Compiler] null 가능성을 변경하는 어댑터와 마이그레이션을 사용할 때 데이터 클래스 바인딩이 포함된 insert values 문제 수정 (#6269, @griffio 기여)
- [Compiler] null 안전 연산자(IS 및 IS DISTINCT FROM)에 nullable 바인드 인자 사용 (#6265, @griffio 기여)
- [Gradle Plugin] 프로젝트 의존성에 대해 AGP의 variant resolution 사용 (#6217, @maxsav 기여)
- [Gradle Plugin] 빌드 간 AGP 배리언트 목록이 다를 때 generateDatabaseInterface에 대한 빌드 캐시 미스 문제 수정
- [Gradle Plugin] 데이터베이스를 구성하지 않고 플러그인을 적용했을 때 IDE 동기화가 실패하던 크래시 수정 (#6088)
- [PostgreSQL Dialect] 중첩된 함수 호출을 사용할 때 json 집계 함수 수정 (#6281, @griffio 기여)
- [Paging3 Extension] 빈 데이터베이스에서 KeyedQueryPagingSource가 크래시를 일으키던 문제 수정 (#6284, @woods-marshes 기여)
- [Compiler] `COALESCE`와 같은 래핑 함수와 함께 변경문을 사용할 때 발생하는 Java 타입 어댑터 문제 수정 (#6292, @griffio 기여)
- [Compiler] 모듈명이 대문자로 시작하는 경우 생성된 코드의 패키지명도 대문자가 되던 문제 수정 (#6316, @griffio 기여)
- [PostgreSQL Dialect] 날짜 데이터 타입의 대소문자를 구분하지 않도록 허용 (#6328, @griffio 기여)

## [2.3.2] - 2026-03-16 {id="2-3-2-2026-03-16"}
[2.3.2]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.2

### 추가됨
- [PostgreSQL Dialect] ALTER TABLE ALTER TYPE USING 표현식 지원 개선 (#6116, @griffio 기여)
- [PostgreSQL Dialect] DROP COLUMN IF EXISTS 지원 추가 (#6112, @griffio 기여)
- [Gradle Plugin] Select 와일드카드 확장을 끌 수 있는 expandSelectStar 플래그 추가 (#5813, @griffio 기여)
- [MySQL Dialect] 윈도우 함수(Window Functions) 지원 추가 (#6086, @griffio 기여)
- [Gradle Plugin] 시작 스키마 버전이 1이 아니고 verifyMigrations가 true일 때 빌드가 실패하던 문제 수정 (#6017, @neilgmiller 기여)
- [Gradle Plugin] `SqlDelightWorkerTask`의 설정을 보다 유연하게 구성할 수 있도록 개선하고, Windows 환경 개발을 지원하도록 기본 구성 업데이트 (#5215, @MSDarwish2000 기여)
- [SQLite Dialect] FTS5 가상 테이블에서 생성된(synthesized) 컬럼 지원 추가 (#5986, @watbe 기여)
- [PostgreSQL Dialect] Postgres 행 수준 보안(row level security) 지원 추가 (#6087, @shellderp 기여)
- [PostgreSQL Dialect] FOR UPDATE 구문이 OF table, NO KEY UPDATE, NO WAIT를 지원하도록 확장 (#6104, @shellderp 기여)
- [PostgreSQL Dialect] Postgis Point 타입 및 관련 함수 지원 (#5602, @vanniktech 기여)
- [Runtime] 트랜잭션의 `CoroutineContext`를 제어할 수 있는 메커니즘을 제공하는 `SuspendingTransacter.TransactionDispatcher` 추가 (#5967, @eygraber 기여)
- [Gradle Plugin] Android Gradle Plugin 9.0의 신규 DSL과의 완벽한 호환성 지원 (#6140)
- [PostgreSQL Dialect] PostgreSQL CREATE TABLE 스토리지 매개변수 지원 (#6148, @griffio 기여)
- [PostgreSQL Dialect] PostgreSQL 고유 테이블 제약 조건(unique table constraint)의 nullable 결과 컬럼 수정 (#6167, @griffio 기여)

### 변경됨
- [Compiler] 컴파일러 출력 타입을 java.lang.Void에서 kotlin.Nothing으로 변경 (#6099, @griffio 기여)
- [Compiler] 패키지명에 언더스코어(_) 사용 허용. 이전에는 언더스코어가 정제되어 예기치 않은 동작이 발생했습니다. (#6027, @BierDav 기여)
- [Paging Extension] AndroidX Paging으로 전환 (#5910, @jeffdgr8 기여)
- [Android Driver] Android minSdk를 23으로 상향 (#6141)
- [Paging Extension] paging 3.4.1로 업그레이드 및 X64 Apple 타깃 제거 (#6166)

### 수정됨
- [IntelliJ Plugin] VFS 새로고침 이벤트 중 EDT에서 파일 타입 감지를 블로킹하여 발생하던 IDE 프리징 문제 수정
- [SQLite Dialect] Json 경로 연산자 사용 시 Sqlite 3.38 컴파일 오류가 발생하던 문제 수정 (#6070, @griffio 기여)
- [SQLite Dialect] 커스텀 컬럼 타입을 사용할 때 group_concat 함수에 String 타입 사용 (#6082, @griffio 기여)
- [Gradle Plugin] 복잡한 스키마에서 무한 대기 상태에 빠지지 않도록 `VerifyMigrationTask` 성능 개선 (#6073, @Lightwood13 기여)
- [Intellij Plugin] 플러그인 초기화 예외 수정 및 지원 중단된 메서드 업데이트 (#6040, @griffio 기여)
- [Gradle Plugin] Android Gradle Plugin에 내장된 Kotlin과의 호환성 수정 (#6139)

## [2.3.1] - 2025-03-12 {id="2-3-1-2025-03-12"}
[2.3.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.1

배포에 실패한 릴리스입니다. 2.3.2를 사용하세요!

## [2.3.0] - 2025-03-12 {id="2-3-0-2025-03-12"}
[2.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.0

배포에 실패한 릴리스입니다. 2.3.2를 사용하세요!

## [2.2.1] - 2025-11-13 {id="2-2-1-2025-11-13"}
[2.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.2.1

### 추가됨
- [PostgreSQL Dialect] Postgres numeric/integer/biginteger 타입 매핑 수정 (#5994, @griffio 기여)
- [Compiler] CAST가 필요할 때 원본 파일 위치를 포함하도록 컴파일러 에러 메시지 개선 (#5979, @griffio 기여)
- [PostgreSQL Dialect] Postgres JSON 연산자 경로 추출 지원 추가 (#5971, @griffio 기여)
- [SQLite Dialect] 공통 테이블 표현식(CTE)을 사용한 MATERIALIZED 쿼리 플래너 힌트의 Sqlite 3.35 지원 추가 (#5961, @griffio 기여)
- [PostgreSQL Dialect] 공통 테이블 표현식을 사용한 MATERIALIZED 쿼리 플래너 힌트 지원 추가 (#5961, @griffio 기여)
- [PostgreSQL Dialect] Postgres JSON Aggregate FILTER 지원 추가 (#5957, @griffio 기여)
- [PostgreSQL Dialect] Postgres Enum 지원 추가 (#5935, @griffio 기여)
- [PostgreSQL Dialect] Postgres 트리거 제한적 지원 추가 (#5932, @griffio 기여)
- [PostgreSQL Dialect] SQL 표현식을 JSON으로 파싱할 수 있는지 확인하는 조건자(predicate) 추가 (#5843, @griffio 기여)
- [PostgreSQL Dialect] PostgreSQL Comment On 문 제한적 지원 추가 (#5808, @griffio 기여)
- [MySQL Dialect] 인덱스 가시성 옵션 지원 추가 (#5785, @orenkislev-faire 기여)
- [PostgreSql Dialect] TSQUERY 데이터 타입 지원 추가 (#5779, @griffio 기여)
- [Gradle Plugin] 모듈 추가 시 버전 카탈로그(Version Catalogs) 지원 추가 (#5755, @DRSchlaubi 기여)

### 변경됨
- 개발 중인 스냅샷(In-development snapshots)이 이제 https://central.sonatype.com/repository/maven-snapshots/ 의 Central Portal Snapshots 저장소에 배포됩니다.
- [Compiler] 생성자 참조를 사용하여 기본 생성 쿼리 단순화 (#5814, @jonapoul 기여)

### 수정됨
- [Compiler] 공통 테이블 표현식(CTE)을 포함하는 View를 사용할 때 발생하는 스택 오버플로우 수정 (#5928, @griffio 기여)
- [Gradle Plugin] "New Connection"을 추가하기 위해 SqlDelight 툴 윈도우를 열 때 발생하던 크래시 수정 (#5906, @griffio 기여)
- [IntelliJ Plugin] copy-to-sqlite 거터(gutter) 액션에서 스레딩 관련 크래시 방지 (#5901, @griffio 기여)
- [IntelliJ Plugin] CREATE INDEX 및 CREATE VIEW 스키마 문을 사용할 때 PostgreSQL 방언 수정 (#5772, @griffio 기여)
- [Compiler] 컬럼 참조 시 FTS 스택 오버플로우 발생 문제 수정 (#5896, @griffio 기여)
- [Compiler] With Recursive 스택 오버플로우 수정 (#5892, @griffio 기여)
- [Compiler] Insert|Update|Delete Returning 문에 대한 알림(Notify) 수정 (#5851, @griffio 기여)
- [Compiler] Long을 반환하는 트랜잭션 블록의 비동기 결과 타입 수정 (#5836, @griffio 기여)
- [Compiler] SQL 파라미터 바인딩 복잡도를 O(n²)에서 O(n)으로 최적화 (#5898, @chenf7 기여)
- [SQLite Dialect] Sqlite 3.18의 누락된 함수 수정 (#5759, @griffio 기여)

## [2.2.0] - 2025-11-13 {id="2-2-0-2025-11-13"}
[2.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.2.0

아티팩트가 부분적으로 배포되어 실패한 릴리스입니다. 2.2.1을 사용하세요!

## [2.1.0] - 2025-05-16 {id="2-1-0-2025-05-16"}
[2.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.1.0

### 추가됨
- [WASM Driver] 웹 워커 드라이버에 wasmJs 지원 추가 (#5534, @IlyaGulya 기여)
- [PostgreSQL Dialect] PostgreSQL UnNest Array to rows 지원 (#5673, @griffio 기여)
- [PostgreSQL Dialect] PostgreSQL TSRANGE/TSTZRANGE 지원 (#5297, @griffio 기여)
- [PostgreSQL Dialect] PostgreSQL Right Full Join 지원 (#5086, @griffio 기여)
- [PostgreSQL Dialect] PostgreSQL 시간 타입에서의 extract 지원 (#5273, @griffio 기여)
- [PostgreSQL Dialect] PostgreSQL 배열 포함 연산자 지원 (#4933, @griffio 기여)
- [PostgreSQL Dialect] PostgreSQL drop constraint 지원 (#5288, @griffio 기여)
- [PostgreSQL Dialect] PostgreSQL 타입 캐스팅 지원 (#5089, @griffio 기여)
- [PostgreSQL Dialect] 서브쿼리에 대한 PostgreSQL lateral join 연산자 지원 (#5122, @griffio 기여)
- [PostgreSQL Dialect] PostgreSQL ILIKE 연산자 지원 (#5330, @griffio 기여)
- [PostgreSQL Dialect] PostgreSQL XML 타입 지원 (#5331, @griffio 기여)
- [PostgreSQL Dialect] PostgreSQL AT TIME ZONE 지원 (#5243, @griffio 기여)
- [PostgreSQL Dialect] PostgreSQL order by nulls 지원 (#5199, @griffio 기여)
- [PostgreSQL Dialect] PostgreSQL 현재 날짜/시간 함수 지원 추가 (#5226, @drewd 기여)
- [PostgreSQL Dialect] PostgreSQL 정규식(Regex) 연산자 지원 (#5137, @griffio 기여)
- [PostgreSQL Dialect] brin gist 추가 (#5059, @griffio 기여)
- [MySQL Dialect] MySQL 방언에 대한 RENAME INDEX 지원 (#5212, @orenkislev-faire 기여)
- [JSON Extension] json 테이블 함수에 alias 추가 (#5372, @griffio 기여)

### 변경됨
- [Compiler] 단순 변경문(mutator)의 경우 생성된 쿼리 파일이 영향받은 행 수를 반환하도록 변경 (#4578, @MariusVolkhart 기여)
- [Native Driver] NativeSqlDatabase.kt를 업데이트하여 DELETE, INSERT 및 UPDATE 문의 readonly 플래그 변경 (#5680, @griffio 기여)
- [PostgreSQL Dialect] PgInterval을 String으로 변경 (#5403, @griffio 기여)
- [PostgreSQL Dialect] PostgreSQL 확장을 구현하기 위한 SqlDelight 모듈 지원 (#5677, @griffio 기여)

### 수정됨
- [Compiler] 결과가 있는 그룹 문 실행 시 쿼리에 알림을 보내도록 수정 (#5006, @vitorhugods 기여)
- [Compiler] SqlDelightModule 타입 리졸버 수정 (#5625, @griffio 기여)
- [Compiler] 이스케이프된 컬럼이 포함된 5501 insert object 수정 (#5503, @griffio 기여)
- [Compiler] 컴파일러 에러 메시지의 경로 링크가 올바른 라인 및 문자 위치로 클릭 가능하도록 개선 (#5604, @vanniktech 기여)
- [Compiler] 예약어를 테이블 이름으로 사용할 수 있도록 수정 (이슈 5298)
- [Compiler] 명명된 실행(named executes) 수정 및 테스트 추가
- [Compiler] 초기화 문 정렬 시 외래 키 테이블 제약 조건을 고려하도록 수정 (#5325, @TheMrMilchmann 기여)
- [Compiler] 탭 문자가 포함된 경우 에러 밑줄이 올바르게 정렬되도록 수정 (#5224, @drewd 기여)
- [JDBC Driver] 트랜잭션 종료 시 connectionManager의 메모리 누수 수정
- [JDBC Driver] 문서에 명시된 대로 SQLite 마이그레이션을 트랜잭션 내에서 실행 (#5218, @morki 기여)
- [JDBC Driver] 트랜잭션 커밋 / 롤백 후 발생하는 커넥션 누수 수정 (#5205, @morki 기여)
- [Gradle Plugin] `GenerateSchemaTask` 전에 `DriverInitializer` 실행 (#5562, @nwagu 기여)
- [Runtime] 실제 드라이버가 Async일 때 LogSqliteDriver에서 발생하던 크래시 수정 (#5723, @edenman 기여)
- [Runtime] StringBuilder 용량(capacity) 수정 (#5192, @janbina 기여)
- [PostgreSQL Dialect] PostgreSQL create or replace view 수정 (#5407, @griffio 기여)
- [PostgreSQL Dialect] PostgreSQL to_json 수정 (#5606, @griffio 기여)
- [PostgreSQL Dialect] PostgreSQL numeric 리졸버 수정 (#5399, @griffio 기여)
- [PostgreSQL Dialect] sqlite 윈도우 함수 수정 (#2799, @griffio 기여)
- [PostgreSQL Dialect] PostgreSQL SELECT DISTINCT ON 수정 (#5345, @griffio 기여)
- [PostgreSQL Dialect] alter table add column if not exists 수정 (#5309, @griffio 기여)
- [PostgreSQL Dialect] PostgreSQL 비동기 바인드 파라미터 수정 (#5313, @griffio 기여)
- [PostgreSQL Dialect] PostgreSQL 불리언 리터럴 수정 (#5262, @griffio 기여)
- [PostgreSQL Dialect] PostgreSQL 윈도우 함수 수정 (#5155, @griffio 기여)
- [PostgreSQL Dialect] PostgreSQL isNull isNotNull 타입 수정 (#5173, @griffio 기여)
- [PostgreSQL Dialect] PostgreSQL select distinct 수정 (#5172, @griffio 기여)
- [Paging Extension] paging 새로고침 시 초기 로드 문제 수정 (#5615, @evant 기여)
- [Paging Extension] MacOS 네이티브 타깃 추가 (#5324, @vitorhugods 기여)
- [IntelliJ Plugin] K2 지원

## [2.0.2] - 2024-04-05 {id="2-0-2-2024-04-05"}
[2.0.2]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.2

### 추가됨
- [PostgreSQL Dialect] PostgreSQL STRING_AGG 함수 추가 (#4950, @anddani 기여)
- [PostgreSQL Dialect] pg 방언에 SET 문 추가 (#4927, @de-luca 기여)
- [PostgreSQL Dialect] PostgreSQL alter column sequence 매개변수 추가 (#4916, @griffio 기여)
- [PostgreSQL Dialect] insert 문에 대한 postgresql alter column default 지원 추가 (#4912, @griffio 기여)
- [PostgreSQL Dialect] PostgreSQL alter sequence 및 drop sequence 추가 (#4920, @griffio 기여)
- [PostgreSQL Dialect] Postgres 정규식 함수 정의 추가 (#5025, @MariusVolkhart 기여)
- [PostgreSQL Dialect] GIN 문법(grammar) 추가 (#5027, @griffio 기여)

### 변경됨
- [IDE Plugin] 최소 요구 버전을 2023.1 / Android Studio Iguana로 상향
- [Compiler] encapsulatingType에서 타입 null 가능성을 재정의할 수 있도록 허용 (#4882, @eygraber 기여)
- [Compiler] SELECT * 사용 시 컬럼 이름을 인라인화
- [Gradle Plugin] processIsolation으로 전환 (#5068, @nwagu 기여)
- [Android Runtime] Android minSDK를 21로 상향 (#5094, @hfhbd 기여)
- [Drivers] 방언 작성자를 위해 더 많은 JDBC/R2DBC 문 메서드 노출 (#5098, @hfhbd 기여)

### 수정됨
- [PostgreSQL Dialect] postgresql alter table alter column 수정 (#4868, @griffio 기여)
- [PostgreSQL Dialect] 테이블 모델의 4448 누락된 임포트 수정 (#4885, @griffio 기여)
- [PostgreSQL Dialect] 4932 postgresql 기본 제약 조건 함수 수정 (#4934, @griffio 기여)
- [PostgreSQL Dialect] 마이그레이션 중 alter table rename column에서 발생하던 4879 postgresql 클래스 캐스팅 에러 수정 (#4880, @griffio 기여)
- [PostgreSQL Dialect] 4474 PostgreSQL create extension 수정 (#4541, @griffio 기여)
- [PostgreSQL Dialect] 5018 PostgreSQL add Primary Key not nullable 타입 수정 (#5020, @griffio 기여)
- [PostgreSQL Dialect] 4703 집계 표현식 수정 (#5071, @griffio 기여)
- [PostgreSQL Dialect] 5028 PostgreSQL json 수정 (#5030, @griffio 기여)
- [PostgreSQL Dialect] 5040 PostgreSQL json 연산자 수정 (#5041, @griffio 기여)
- [PostgreSQL Dialect] 5040 관련 json 연산자 바인딩 수정 (#5100, @griffio 기여)
- [PostgreSQL Dialect] 5082 tsvector 수정 (#5104, @griffio 기여)
- [PostgreSQL Dialect] PostgreSQL UPDATE FROM 문에 대한 5032 컬럼 인접성 수정 (#5035, @griffio 기여)
- [SQLite Dialect] 4897 sqlite alter table rename column 수정 (#4899, @griffio 기여)
- [IDE Plugin] 에러 핸들러 크래시 수정 (#4988, @aperfilyev 기여)
- [IDE Plugin] IDEA 2023.3에서 BugSnag 초기화 실패 문제 수정 (@aperfilyev 기여)
- [IDE Plugin] 플러그인을 통해 IntelliJ에서 .sq 파일을 열 때 발생하는 PluginException 수정 (@aperfilyev 기여)
- [IDE Plugin] 이미 플러그인 의존성으로 포함되어 있으므로 kotlin 라이브러리를 intellij 플러그인에 번들링하지 않도록 수정 (#5126)
- [IDE Plugin] stream 대신 extensions 배열 사용 (#5127)

## [2.0.1] - 2023-12-01 {id="2-0-1-2023-12-01"}
[2.0.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.1

### 추가됨
- [Compiler] SELECT 수행 시 다중 컬럼 표현식(multi-column-expr) 지원 추가 (#4453, @Adriel-M 기여)
- [PostgreSQL Dialect] PostgreSQL CREATE INDEX CONCURRENTLY 지원 추가 (#4531, @griffio 기여)
- [PostgreSQL Dialect] PostgreSQL CTE 보조 문들이 서로 참조할 수 있도록 허용 (#4493, @griffio 기여)
- [PostgreSQL Dialect] binary expr 및 sum에 대한 PostgreSQL 타입 지원 추가 (#4539, @Adriel-M 기여)
- [PostgreSQL Dialect] PostgreSQL SELECT DISTINCT ON 구문 지원 추가 (#4584, @griffio 기여)
- [PostgreSQL Dialect] SELECT 문에서 PostgreSQL JSON 함수 지원 추가 (#4590, @MariusVolkhart 기여)
- [PostgreSQL Dialect] generate_series PostgreSQL 함수 추가 (#4717, @griffio 기여)
- [PostgreSQL Dialect] 추가 Postgres 문자열 함수 정의 (#4752, @MariusVolkhart 기여)
- [PostgreSQL Dialect] min 및 max 집계 함수에 DATE PostgreSQL 타입 추가 (#4816, @anddani 기여)
- [PostgreSQL Dialect] SqlBinaryExpr에 PostgreSQL 시간 타입 추가 (#4657, @griffio 기여)
- [PostgreSQL Dialect] postgres 방언에 TRUNCATE 추가 (#4817, @de-luca 기여)
- [SQLite 3.35 Dialect] 순차적으로 평가되는 다중 ON CONFLICT 절 허용 (#4551, @griffio 기여)
- [JDBC Driver] 더욱 편리한 SQL 편집을 위한 언어 어노테이션 추가 (#4602, @MariusVolkhart 기여)
- [Native Driver] Native-driver: linuxArm64 지원 추가 (#4792, @hfhbd 기여)
- [Android Driver] AndroidSqliteDriver에 windowSizeBytes 매개변수 추가 (#4804, @BoD 기여)
- [Paging3 Extension] OffsetQueryPagingSource에 대한 initialOffset 추가 (#4802, @MohamadJaara 기여)

### 변경됨
- [Compiler] 적절한 경우 Kotlin 타입을 우선적으로 사용 (#4517, @eygraber 기여)
- [Compiler] 값 타입 insert 수행 시 항상 컬럼 이름을 포함하도록 변경 (#4864)
- [PostgreSQL Dialect] PostgreSQL 방언의 실험적(experimental) 상태 제거 (#4443, @hfhbd 기여)
- [PostgreSQL Dialect] PostgreSQL 타입 관련 문서 업데이트 (#4569, @MariusVolkhart 기여)
- [R2DBC Driver] PostgreSQL에서 정수 데이터 타입을 처리할 때의 성능 최적화 (#4588, @MariusVolkhart 기여)

### 제거됨 {id="removed"}
- [SQLite Javascript Driver] sqljs-driver 제거 (#4613, #4670, @dellisd 기여)

### 수정됨
- [Compiler] 파라미터가 없고 반환값이 있는 그룹 문의 컴파일 수정 (#4699, @griffio 기여)
- [Compiler] SqlBinaryExpr로 인자 바인딩 수정 (#4604, @griffio 기여)
- [IDE Plugin] 설정된 경우 IDEA Project JDK 사용 (#4689, @griffio 기여)
- [IDE Plugin] IDEA 2023.2 이상에서 "Unknown element type: TYPE_NAME" 에러 발생 문제 수정 (#4727)
- [IDE Plugin] 2023.2와의 일부 호환성 문제 수정
- [Gradle Plugin] verifyMigrationTask Gradle 작업 문서 수정 (#4713, @joshfriend 기여)
- [Gradle Plugin] 데이터베이스 검증 전에 사용자가 데이터베이스 생성을 수행하도록 돕는 Gradle 작업 출력 메시지 추가 (#4684, @jingwei99 기여)
- [PostgreSQL Dialect] PostgreSQL 컬럼의 이름이 여러 번 변경되던 문제 수정 (#4566, @griffio 기여)
- [PostgreSQL Dialect] 4714 postgresql alter column nullability 수정 (#4831, @griffio 기여)
- [PostgreSQL Dialect] 4837 alter table alter column 수정 (#4846, @griffio 기여)
- [PostgreSQL Dialect] 4501 PostgreSQL sequence 수정 (#4528, @griffio 기여)
- [SQLite Dialect] 컬럼 표현식에서 JSON 이항 연산자를 사용할 수 있도록 허용 (#4776, @eygraber 기여)
- [SQLite Dialect] 동일한 이름을 가진 여러 컬럼이 발견되었을 때의 Update From 오탐(false positive) 수정 (#4777, @eygraber 기여)
- [Native Driver] 명명된 인메모리 데이터베이스(named in-memory databases) 지원 (#4662, @05nelsonm 기여)
- [Native Driver] 쿼리 리스너 컬렉션에 대한 스레드 안전성 보장 (#4567, @kpgalligan 기여)
- [JDBC Driver] ConnectionManager의 커넥션 누수 수정 (#4589, @MariusVolkhart 기여)
- [JDBC Driver] ConnectionManager 타입을 선택할 때 JdbcSqliteDriver url 파싱 수정 (#4656, @05nelsonm 기여)

## [2.0.0] - 2023-07-26 {id="2-0-0-2023-07-26"}
[2.0.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0

### 추가됨
- [MySQL Dialect] MySQL: IF 표현식에서 timestamp/bigint 지원 (#4329, @shellderp 기여)
- [MySQL Dialect] MySQL: now 추가 (#4431, @hfhbd 기여)
- [Web Driver] NPM 패키지 배포 활성화 (#4364)
- [IDE Plugin] gradle tooling 연결 실패 시 사용자가 스택 트레이스를 볼 수 있도록 허용 (#4383)

### 변경됨
- [Sqlite Driver] JdbcSqliteDriver에 대한 스키마 마이그레이션 사용 단순화 (#3737, @morki 기여)
- [R2DBC Driver] 진정한 비동기 R2DBC 커서 지원 (#4387, @hfhbd 기여)

### 수정됨
- [IDE Plugin] 필요할 때까지 데이터베이스 프로젝트 서비스를 인스턴스화하지 않도록 수정 (#4382)
- [IDE Plugin] 사용처 찾기(find usages) 도중 프로세스 취소 처리 (#4340)
- [IDE Plugin] 비동기 코드의 IDE 생성 문제 수정 (#4406)
- [IDE Plugin] 패키지 구조 어셈블리를 단 한 번만 계산하고 EDT 외부에서 수행하도록 이동 (#4417)
- [IDE Plugin] 2023.2에서 Kotlin 타입 확인에 올바른 스텁 인덱스 키 사용 (#4416)
- [IDE Plugin] 검색을 수행하기 전에 인덱스가 준비될 때까지 대기 (#4419)
- [IDE Plugin] 인덱스를 사용할 수 없는 경우 goto를 수행하지 않도록 수정 (#4420)
- [Compiler] 그룹 문의 결과 표현식 수정 (#4378)
- [Compiler] 가상 테이블을 인터페이스 타입으로 사용하지 않도록 수정 (#4427, @hfhbd 기여)

## [2.0.0-rc02] - 2023-06-27 {id="2-0-0-rc02-2023-06-27"}
[2.0.0-rc02]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-rc02

### 추가됨
- [MySQL Dialect] 소문자 date 타입 및 date 타입에서의 min, max 지원 (#4243, @shellderp 기여)
- [MySQL Dialect] binary expr 및 sum에 대한 mysql 타입 지원 (#4254, @shellderp 기여)
- [MySQL Dialect] 표시 너비(display width)가 없는 unsigned int 지원 (#4306, @shellderp 기여)
- [MySQL Dialect] LOCK IN SHARED MODE 지원
- [PostgreSQL Dialect] min max에 boolean 및 Timestamp 추가 (#4245, @griffio 기여)
- [PostgreSQL Dialect] Postgres: 윈도우 함수 지원 추가 (#4283, @hfhbd 기여)
- [Runtime] 런타임에 linuxArm64, androidNative 및 watchosDeviceArm 타깃 추가 (#4258, @hfhbd 기여)
- [Paging Extension] 페이징 확장에 linux 및 mingw x64 타깃 추가 (#4280, @chippman 기여)

### 변경됨
- [Gradle Plugin] Android API 34에 대한 자동 방언 지원 추가 (#4251)
- [Paging Extension] QueryPagingSource에서 SuspendingTransacter 지원 추가 (#4292, @daio 기여)
- [Runtime] addListener API 개선 (#4244, @hfhbd 기여)
- [Runtime] 마이그레이션 버전으로 Long 사용 (#4297, @hfhbd 기여)

### 수정됨
- [Gradle Plugin] 생성된 소스에 대해 안정적인 출력 경로 사용 (#4269, @joshfriend 기여)
- [Gradle Plugin] Gradle 관련 미세 수정 (#4222, @3flex 기여)

## [2.0.0-rc01] - 2023-05-29 {id="2-0-0-rc01-2023-05-29"}
[2.0.0-rc01]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-rc01

### 추가됨
- [Paging] 페이징 확장에 js browser 타깃 추가 (#3843, @sproctor 기여)
- [Paging] androidx-paging3 확장에 iosSimulatorArm64 타깃 추가 (#4117)
- [PostgreSQL Dialect] gen_random_uuid() 지원 및 테스트 추가 (#3855, @davidwheeler123 기여)
- [PostgreSQL Dialect] postgres alter table add constraint 지원 (#4116, @griffio 기여)
- [PostgreSQL Dialect] alter table add constraint check 지원 (#4120, @griffio 기여)
- [PostgreSQL Dialect] PostgreSQL 문자 길이 함수 추가 (#4121, @griffio 기여)
- [PostgreSQL Dialect] PostgreSQL column default interval 추가 (#4142, @griffio 기여)
- [PostgreSQL Dialect] PostgreSQL interval column result 추가 (#4152, @griffio 기여)
- [PostgreSQL Dialect] PostgreSQL Alter Column 추가 (#4165, @griffio 기여)
- [PostgreSQL Dialect] PostgreSQL: date_part 추가 (#4198, @hfhbd 기여)
- [MySQL Dialect] sql char length 함수 추가 (#4134, @griffio 기여)
- [IDE Plugin] sqldelight 디렉터리 제안 추가 (#3976, @aperfilyev 기여)
- [IDE Plugin] 프로젝트 트리에서 중간 패키지 압축 표시(compact) (#3992, @aperfilyev 기여)
- [IDE Plugin] join 절 자동 완성 추가 (#4086, @aperfilyev 기여)
- [IDE Plugin] 뷰 생성 인텐션(intention) 및 라이브 템플릿 추가 (#4074, @aperfilyev 기여)
- [IDE Plugin] DELETE 또는 UPDATE 문 내에 WHERE가 누락된 경우 경고 (#4058, @aperfilyev 기여)
- [Gradle Plugin] 타입 안전한 프로젝트 접근자(typesafe project accessors) 활성화 (#4005, @hfhbd 기여)

### 변경됨
- [Gradle Plugin] ServiceLoader 메커니즘을 통해 VerifyMigrationTask에 DriverInitializer 등록 허용 (#3986, @C2H6O 기여)
- [Gradle Plugin] 명시적인 컴파일러 환경 생성 (#4079, @hfhbd 기여)
- [JS Driver] 웹 워커 드라이버를 별도의 아티팩트로 분리
- [JS Driver] JsWorkerSqlCursor를 외부에 노출하지 않도록 수정 (#3874, @hfhbd 기여)
- [JS Driver] sqljs 드라이버 배포 비활성화 (#4108)
- [Runtime] 동기 드라이버는 동기 스키마 초기화 프로그램을 요구하도록 강제 (#4013)
- [Runtime] 커서에 대한 비동기 지원 개선 (#4102)
- [Runtime] 지원 중단된 타깃 제거 (#4149, @hfhbd 기여)
- [Runtime] 이전 메모리 모델(old MM) 지원 제거 (#4148, @hfhbd 기여)

### 수정됨
- [R2DBC Driver] R2DBC: 드라이버 닫기 대기(Await closing the driver) (#4139, @hfhbd 기여)
- [Compiler] 마이그레이션의 PRAGMA를 database create(SqlDriver)에 포함 (#3845, @MariusVolkhart 기여)
- [Compiler] RETURNING 절에 대한 코드 생성 수정 (#3872, @MariusVolkhart 기여)
- [Compiler] 가상 테이블에 대한 타입을 생성하지 않도록 수정 (#4015)
- [Gradle Plugin] 작은 Gradle 플러그인 QoL 개선 사항 (#3930, @zacsweers 기여)
- [IDE Plugin] 미해결된 Kotlin 타입 문제 수정 (#3924, @aperfilyev 기여)
- [IDE Plugin] 와일드카드 확장 인텐션이 한정자(qualifier)와 함께 작동하도록 수정 (#3979, @aperfilyev 기여)
- [IDE Plugin] java home이 없는 경우 사용 가능한 jdk 사용 (#3925, @aperfilyev 기여)
- [IDE Plugin] 패키지 이름에 대한 사용처 찾기 수정 (#4010)
- [IDE Plugin] 유효하지 않은 요소에 대해 자동 임포트를 표시하지 않도록 수정 (#4008)
- [IDE Plugin] 방언이 누락된 경우 확인을 시도하지 않도록 수정 (#4009)
- [IDE Plugin] 무효화된 상태(invalidated state)에서는 IDE의 컴파일러 실행을 무시 (#4016)
- [IDE Plugin] IntelliJ 2023.1 지원 추가 (#4037, @madisp 기여)
- [IDE Plugin] 컬럼 이름 변경 시 명명된 인자 사용처 이름 변경 (#4027, @aperfilyev 기여)
- [IDE Plugin] 마이그레이션 추가 팝업 수정 (#4105, @aperfilyev 기여)
- [IDE Plugin] 마이그레이션 파일에서 SchemaNeedsMigrationInspection 비활성화 (#4106, @aperfilyev 기여)
- [IDE Plugin] 마이그레이션 생성 시 타입 이름 대신 sql 컬럼 이름 사용 (#4112, @aperfilyev 기여)

## [2.0.0-alpha05] - 2023-01-20 {id="2-0-0-alpha05-2023-01-20"}
[2.0.0-alpha05]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha05

### 추가됨
- [Paging] 멀티플랫폼 페이징 확장 (@jeffdgr8 기여)
- [Runtime] Listener 인터페이스에 fun 변경자(modifier) 추가
- [SQLite Dialect] SQLite 3.33 지원 추가 (UPDATE FROM) (@eygraber 기여)
- [PostgreSQL Dialect] postgresql에서 UPDATE FROM 지원 (@eygraber 기여)

### 변경됨
- [RDBC Driver] 커넥션 노출 (@hfhbd 기여)
- [Runtime] 마이그레이션 콜백을 메인 `migrate` 함수로 이동
- [Gradle Plugin] 다운스트림 프로젝트로부터 Configuration 숨김
- [Gradle Plugin] Intellij만 섀도잉(shade) (@hfhbd 기여)
- [Gradle Plugin] Kotlin 1.8.0-Beta 지원 및 멀티 버전 Kotlin 테스트 추가 (@hfhbd 기여)

### 수정됨
- [RDBC Driver] 대신 javaObjectType 사용 (@hfhbd 기여)
- [RDBC Driver] bindStatement의 기본형 null 값 수정 (@hfhbd 기여)
- [RDBC Driver] R2DBC 1.0 지원 (@hfhbd 기여)
- [PostgreSQL Dialect] Postgres: 타입 파라미터가 없는 Array 수정 (@hfhbd 기여)
- [IDE Plugin] intellij를 221.6008.13으로 버전업 (@hfhbd 기여)
- [Compiler] 순수 뷰(pure view)로부터 재귀적 원본 테이블 확인 (@hfhbd 기여)
- [Compiler] 테이블 외래 키 절에서 값 클래스(value classes) 사용 (@hfhbd 기여)
- [Compiler] 괄호 없는 바인드 표현식을 지원하도록 SelectQueryGenerator 수정 (@bellatoris 기여)
- [Compiler] 트랜잭션 사용 시 ${name}Indexes 변수의 중복 생성 문제 수정 (@sachera 기여)

## [1.5.5] - 2023-01-20 {id="1-5-5-2023-01-20"}
[1.5.5]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.5

Kotlin 1.8 및 IntelliJ 2021+ 호환성을 지원하고 JDK 17을 지원하는 릴리스입니다.

## [1.5.4] - 2022-10-06 {id="1-5-4-2022-10-06"}
[1.5.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.4

Kotlin 1.7.20 및 AGP 7.3.0과의 호환성 업데이트입니다.

## [2.0.0-alpha04] - 2022-10-03 {id="2-0-0-alpha04-2022-10-03"}
[2.0.0-alpha04]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha04

### 주요 변경 사항 (Breaking Changes) {id="breaking-changes"}

- Paging 3 확장 API가 count에 대해 int 타입만 허용하도록 변경되었습니다.
- 코루틴 확장은 이제 기본값을 사용하는 대신 디스패처를 명시적으로 전달해야 합니다.
- Dialect 및 Driver 클래스가 final로 변경되었으므로 위임(delegation)을 사용해야 합니다.

### 추가됨
- [HSQL Dialect] Hsql: Insert에서 생성된 컬럼에 DEFAULT 사용 지원 (#3372, @hfhbd 기여)
- [PostgreSQL Dialect] PostgreSQL: INSERT에서 생성된 컬럼에 DEFAULT 사용 지원 (#3373, @hfhbd 기여)
- [PostgreSQL Dialect] PostgreSQL에 NOW() 추가 (#3403, @hfhbd 기여)
- [PostgreSQL Dialect] PostgreSQL에 NOT 연산자 추가 (#3504, @hfhbd 기여)
- [Paging] *QueryPagingSource에 CoroutineContext 전달 허용 (#3384)
- [Gradle Plugin] 방언에 대한 더 나은 버전 카탈로그 지원 추가 (#3435)
- [Native Driver] NativeSqliteDriver의 DatabaseConfiguration 생성에 연결할 수 있는 콜백 추가 (#3512, @svenjacobs 기여)

### 변경됨
- [Paging] KeyedQueryPagingSource 기반의 QueryPagingSource 함수에 기본 디스패처 추가 (#3385)
- [Paging] OffsetQueryPagingSource가 Int에서만 작동하도록 변경 (#3386)
- [Async Runtime] await* 메서드를 상위 클래스 ExecutableQuery로 이동 (#3524, @hfhbd 기여)
- [Coroutines Extensions] flow 확장의 기본 매개변수 제거 (#3489)

### 수정됨
- [Gradle Plugin] Kotlin 1.7.20으로 업데이트 (#3542, @zacsweers 기여)
- [R2DBC Driver] 항상 값을 보내지는 않는 R2DBC 변경 사항 반영 (#3525, @hfhbd 기여)
- [HSQL Dialect] Hsql 사용 시 실패하던 sqlite VerifyMigrationTask 수정 (#3380, @hfhbd 기여)
- [Gradle Plugin] 지연 구성(lazy configuration) API를 사용하도록 작업 전환 (@3flex 기여)
- [Gradle Plugin] Kotlin 1.7.20에서 NPE 방지 (#3398, @ZacSweers 기여)
- [Gradle Plugin] squash migrations 작업 설명 수정 (#3449)
- [IDE Plugin] 최신 Kotlin 플러그인에서의 NoSuchFieldError 수정 (#3422, @madisp 기여)
- [IDE Plugin] IDEA: UnusedQueryInspection - ArrayIndexOutOfBoundsException 수정 (#3427, @vanniktech 기여)
- [IDE Plugin] 이전 Kotlin 플러그인 참조에 대해 리플렉션 사용
- [Compiler] 확장 함수가 있는 커스텀 방언이 임포트를 생성하지 않던 문제 수정 (#3338, @hfhbd 기여)
- [Compiler] CodeBlock.of("${CodeBlock.toString()}") 이스케이프 수정 (#3340, @hfhbd 기여)
- [Compiler] 마이그레이션에서 비동기 execute 문 대기(await) (#3352)
- [Compiler] AS 수정 (#3370, @hfhbd 기여)
- [Compiler] `getObject` 메서드가 실제 타입의 자동 완성을 지원하도록 수정 (#3401, @robxyy 기여)
- [Compiler] 비동기 그룹 returning 문에 대한 코드 생성 수정 (#3411)
- [Compiler] 가능한 경우 바인드 파라미터의 Kotlin 타입을 추론하고, 불가능하면 더 명확한 에러 메시지와 함께 실패하도록 개선 (#3413, @hfhbd 기여)
- [Compiler] ABS("foo") 허용 안 함 (#3430, @hfhbd 기여)
- [Compiler] 다른 파라미터로부터 Kotlin 타입 추론 지원 (#3431, @hfhbd 기여)
- [Compiler] 항상 데이터베이스 구현체 생성 (#3540, @hfhbd 기여)
- [Compiler] javaDoc 제약을 완화하고 커스텀 매퍼 함수에도 추가 (#3554, @hfhbd 기여)
- [Compiler] 바인딩에서 DEFAULT 수정 (@hfhbd 기여)
- [Paging] Paging 3 수정 (#3396)
- [Paging] Long을 사용한 OffsetQueryPagingSource 생성 허용 (#3409)
- [Paging] Dispatchers.Main을 정적으로 교체하지 않도록 수정 (#3428)

## [2.0.0-alpha03] - 2022-06-17 {id="2-0-0-alpha03-2022-06-17"}
[2.0.0-alpha03]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha03

### 주요 변경 사항 (Breaking Changes)

- 방언이 이제 실제 Gradle 의존성처럼 참조됩니다.
```groovy
sqldelight {
  MyDatabase {
    dialect("app.cash.sqldelight:postgres-dialect:2.0.0-alpha03")
  }
}
```
- `AfterVersionWithDriver` 타입이 제거되고, 항상 드라이버를 포함하는 `AfterVersion`으로 대체되었습니다.
- `Schema` 타입은 더 이상 `SqlDriver`의 하위 타입이 아닙니다.
- `PreparedStatement` API가 이제 0부터 시작하는 인덱스(zero-based index)로 호출됩니다.

### 추가됨
- [IDE Plugin] 실행 중인 데이터베이스에 대해 SQLite, MySQL, PostgreSQL 명령을 실행하는 기능 추가 (#2718, @aperfilyev 기여)
- [IDE Plugin] Android Studio 데이터베이스 검사기(DB inspector) 지원 추가 (#3107, @aperfilyev 기여)
- [Runtime] 비동기 드라이버 지원 추가 (#3168, @dellisd 기여)
- [Native Driver] 새로운 Kotlin Native 메모리 모델 지원 (#3177, @kpgalligan 기여)
- [JS Driver] SqlJs 워커용 드라이버 추가 (#3203, @dellisd 기여)
- [Gradle Plugin] SQLDelight 작업에 대한 클래스패스 노출
- [Gradle Plugin] 마이그레이션 압축(squash)을 위한 Gradle 작업 추가
- [Gradle Plugin] 마이그레이션 확인 중 스키마 정의를 무시할 수 있는 플래그 추가
- [MySQL Dialect] MySQL에서 FOR SHARE 및 FOR UPDATE 지원 (#3098)
- [MySQL Dialect] MySQL 인덱스 힌트 지원 (#3099)
- [PostgreSQL Dialect] date_trunc 추가 (#3295, @hfhbd 기여)
- [JSON Extensions] JSON 테이블 함수 지원 (#3090)

### 변경됨
- [Runtime] 드라이버가 없는 AfterVersion 타입 제거 (#3091)
- [Runtime] Schema 타입을 최상위로 이동
- [Runtime] 서드파티 구현을 지원할 수 있도록 dialect 및 resolver 오픈 (#3232, @hfhbd 기여)
- [Compiler] 컴파일 실패 보고서에 컴파일에 사용된 방언 포함 (#3086)
- [Compiler] 사용되지 않는 어댑터 건너뛰기 (#3162, @eygraber 기여)
- [Compiler] PrepareStatement에서 0부터 시작하는 인덱스 사용 (#3269, @hfhbd 기여)
- [Gradle Plugin] 방언을 문자열 대신 적절한 Gradle 의존성으로 변경 (#3085)
- [Gradle Plugin] Gradle 검증 작업: 데이터베이스 파일 누락 시 예외 발생 (#3126, @vanniktech 기여)

### 수정됨
- [Gradle Plugin] Gradle 플러그인 사소한 정리 및 개선 (#3171, @3flex 기여)
- [Gradle Plugin] 생성된 디렉터리에 AGP 문자열을 사용하지 않도록 수정
- [Gradle Plugin] AGP 네임스페이스 속성 사용 (#3220)
- [Gradle Plugin] kotlin-stdlib를 Gradle 플러그인의 런타임 의존성으로 추가하지 않도록 수정 (#3245, @mbonnin 기여)
- [Gradle Plugin] 멀티플랫폼 구성 단순화 (#3246, @mbonnin 기여)
- [Gradle Plugin] JS 단독 프로젝트 지원 (#3310, @hfhbd 기여)
- [IDE Plugin] Gradle tooling API에 java home 사용 (#3078)
- [IDE Plugin] IDE 플러그인 내부의 올바른 classLoader에서 JDBC 드라이버 로드 (#3080)
- [IDE Plugin] 이미 존재하는 PSI 변경 중에 발생하는 오류를 피하기 위해 무효화하기 전에 파일 요소를 null로 표시 (#3082)
- [IDE Plugin] ALTER TABLE 문에서 새 테이블 이름의 사용처를 찾을 때 크래시가 발생하지 않도록 수정 (#3106)
- [IDE Plugin] 인스펙터를 최적화하고 예상된 예외 유형에 대해 무음 실패(fail silently)하도록 처리 (#3121)
- [IDE Plugin] 생성된 디렉터리여야 하는 파일 삭제 (#3198)
- [IDE Plugin] 안전하지 않은 연산자 호출 수정
- [Compiler] RETURNING 문이 있는 update 및 delete가 쿼리를 실행하도록 보장 (#3084)
- [Compiler] 복합 select에서 인자 타입을 올바르게 추론하도록 수정 (#3096)
- [Compiler] 일반 테이블(Common tables)은 데이터 클래스를 생성하지 않으므로 반환하지 않도록 수정 (#3097)
- [Compiler] 최상위 마이그레이션 파일을 더 빠르게 검색 (#3108)
- [Compiler] 파이프 연산자에서 null 가능성을 올바르게 상속 (#3108)
- [Compiler] iif ANSI SQL 함수 지원
- [Compiler] 빈 쿼리 파일을 생성하지 않도록 수정 (#3300, @hfhbd 기여)
- [Compiler] 물음표만 있는 어댑터 수정 (#3314, @hfhbd 기여)
- [PostgreSQL Dialect] Postgres 기본 키 컬럼은 항상 non-null임 (#3092)
- [PostgreSQL Dialect] 여러 테이블에서 이름이 같은 복사 문제 수정 (#3297, @hfhbd 기여)
- [SQLite 3.35 Dialect] 변경된 테이블에서 인덱싱된 컬럼을 삭제할 때만 에러를 표시하도록 수정 (#3158, @eygraber 기여)

## [2.0.0-alpha02] - 2022-04-13 {id="2-0-0-alpha02-2022-04-13"}
[2.0.0-alpha02]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha02

### 주요 변경 사항 (Breaking Changes)

- `app.cash.sqldelight.runtime.rx`가 사용된 모든 곳을 `app.cash.sqldelight.rx2`로 변경해야 합니다.

### 추가됨
- [Compiler] 그룹 문의 끝에서 반환 지원
- [Compiler] 방언 모듈을 통한 컴파일러 확장 지원 및 SQLite JSON 확장 추가 (#1379, #2087)
- [Compiler] 값을 반환하는 PRAGMA 문 지원 (#1106)
- [Compiler] 표시된 컬럼에 대한 값 타입 생성 지원
- [Compiler] 낙관적 락 및 검증 지원 추가 (#1952)
- [Compiler] 다중 업데이트(multi-update) 문 지원
- [PostgreSQL] postgres returning 문 지원
- [PostgreSQL] postgres date 타입 지원
- [PostgreSQL] pg interval 지원
- [PostgreSQL] PG Boolean 지원 및 alter table에서의 insert 수정
- [PostgreSQL] Postgres에서 선택적 limit 지원
- [PostgreSQL] PG BYTEA 타입 지원
- [PostgreSQL] postgres serial에 대한 테스트 추가
- [PostgreSQL] for update postgres 구문 지원
- [PostgreSQL] PostgreSQL 배열 타입 지원
- [PostgreSQL] PG에서 UUID 타입을 적절하게 저장/조회하도록 지원
- [PostgreSQL] PostgreSQL NUMERIC 타입 지원 (#1882)
- [PostgreSQL] 공통 테이블 표현식(CTE) 내부의 반환 쿼리 지원 (#2471)
- [PostgreSQL] json 관련 연산자 지원
- [PostgreSQL] Postgres Copy 추가 (@hfhbd 기여)
- [MySQL] MySQL Replace 지원
- [MySQL] NUMERIC/BigDecimal MySQL 타입 지원 (#2051)
- [MySQL] MySQL truncate 문 지원
- [MySQL] MySQL 내의 json 특정 연산자 지원 (@eygraber 기여)
- [MySQL] MySQL INTERVAL 지원 (#2969, @eygraber 기여)
- [HSQL] HSQL Window 기능 추가
- [SQLite] WHERE 절의 nullable 매개변수에 대한 일치 여부 확인을 대체하지 않도록 수정 (#1490, @eygraber 기여)
- [SQLite] Sqlite 3.35 returning 문 지원 (#1490, @eygraber 기여)
- [SQLite] GENERATED 절 지원
- [SQLite] Sqlite 3.38 방언 지원 추가 (@eygraber 기여)

### 변경됨
- [Compiler] 생성된 코드 정리
- [Compiler] 그룹 문에서 테이블 매개변수 사용 금지 (#1822)
- [Compiler] 그룹화된 쿼리를 트랜잭션 내에 배치 (#2785)
- [Runtime] 드라이버의 execute 메서드에서 업데이트된 행 수 반환
- [Runtime] 커넥션에 접근하는 임계 영역으로 SqlCursor를 제한 (#2123, @andersio 기여)
- [Gradle Plugin] 마이그레이션을 위한 스키마 정의 비교 (#841)
- [PostgreSQL] PG에서 큰따옴표 사용 금지
- [MySQL] MySQL에서 == 사용 시 에러 발생 (#2673)

### 수정됨
- [Compiler] 서로 다른 테이블의 동일한 어댑터 타입으로 인해 2.0 alpha에서 컴파일 에러가 발생하던 문제 수정
- [Compiler] upsert 문 컴파일 문제 수정 (#2791)
- [Compiler] 매칭 항목이 여러 개인 경우 select에서 테이블을 사용해야 하는 쿼리 결과 문제 수정 (#1874, #2313)
- [Compiler] INSTEAD OF 트리거가 있는 뷰의 업데이트 지원 (#1018)
- [Compiler] 함수 이름에서 from 및 for 지원
- [Compiler] 함수 표현식에서 SEPARATOR 키워드 허용
- [Compiler] ORDER BY에서 별칭이 지정된 테이블의 ROWID에 접근할 수 없던 문제 수정
- [Compiler] MySQL의 HAVING 절에서 별칭이 지정된 컬럼 이름을 인식하지 못하던 문제 수정
- [Compiler] 잘못 발생하던 'Multiple columns found' 에러 수정
- [Compiler] PRAGMA locking_mode = EXCLUSIVE; 를 설정할 수 없던 문제 수정
- [PostgreSQL] PostgreSQL 컬럼 이름 변경 수정
- [MySQL] UNIX_TIMESTAMP, TO_SECONDS, JSON_ARRAYAGG MySQL 함수가 인식되지 않던 문제 수정
- [SQLite] SQLite 윈도우 기능 수정
- [IDE Plugin] 빈 진행 표시기(empty progress indicator)에서 goto 핸들러 실행 (#2990)
- [IDE Plugin] 프로젝트가 구성되지 않은 경우 하이라이트 방문자가 실행되지 않도록 보장 (#2981, #2976)
- [IDE Plugin] 전이적으로 생성된 코드도 IDE에서 업데이트되도록 보장 (#1837)
- [IDE Plugin] 방언 업데이트 시 인덱스 무효화

## [2.0.0-alpha01] - 2022-03-31 {id="2-0-0-alpha01-2022-03-31"}
[2.0.0-alpha01]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha01

2.0의 첫 번째 알파 릴리스이며 몇 가지 호환성을 깨뜨리는 변경 사항이 포함되어 있습니다. 향후 더 많은 ABI 변경이 있을 수 있으므로 이 릴리스에 의존하는 라이브러리를 배포하지 마세요(일반 애플리케이션 사용은 괜찮습니다).

### 주요 변경 사항 (Breaking Changes)

- 먼저, 모든 `com.squareup.sqldelight`를 `app.cash.sqldelight`로 변경해야 합니다.
- 둘째, 모든 `app.cash.sqldelight.android`를 `app.cash.sqldelight.driver.android`로 변경해야 합니다.
- 셋째, 모든 `app.cash.sqldelight.sqlite.driver`를 `app.cash.sqldelight.driver.jdbc.sqlite`로 변경해야 합니다.
- 넷째, 모든 `app.cash.sqldelight.drivers.native`를 `app.cash.sqldelight.driver.native`로 변경해야 합니다.
- IDE 플러그인은 [알파 또는 EAP 채널](https://plugins.jetbrains.com/plugin/8191-sqldelight/versions/alpha)에서 찾을 수 있는 2.X 버전으로 업데이트해야 합니다.
- 방언은 이제 Gradle 내에서 지정할 수 있는 의존성입니다:

```gradle
sqldelight {
  MyDatabase {
    packageName = "com.example"
    dialect = "app.cash.sqldelight:mysql-dialect:2.0.0-alpha01"
  }
}
```

현재 지원되는 방언은 `mysql-dialect`, `postgresql-dialect`, `hsql-dialect`, `sqlite-3-18-dialect`, `sqlite-3-24-dialect`, `sqlite-3-25-dialect`, `sqlite-3-30-dialect`, `sqlite-3-35-dialect`입니다.

- 기본형(Primitive types)은 이제 임포트해야 합니다(예: `INTEGER AS Boolean`의 경우 `import kotlin.Boolean` 필요). 이전에 지원되던 일부 타입은 이제 어댑터가 필요합니다. 기본형 어댑터는 대부분의 변환을 위해 `app.cash.sqldelight:primitive-adapters:2.0.0-alpha01`에서 제공됩니다(예: `Integer AS kotlin.Int` 처리를 위한 `IntColumnAdapter`).

### 추가됨
- [IDE Plugin] 기본 마이그레이션 제안 추가 (@aperfilyev 기여)
- [IDE Plugin] 임포트 힌트 액션 추가 (@aperfilyev 기여)
- [IDE Plugin] Kotlin 클래스 자동 완성 추가 (@aperfilyev 기여)
- [Gradle Plugin] Gradle 타입 안전 프로젝트 접근자용 바로가기 추가 (@hfhbd 기여)
- [Compiler] 방언에 기반한 코드 생성 커스터마이징 지원 (@MariusVolkhart 기여)
- [JDBC Driver] JdbcDriver에 공통 타입 추가 (@MariusVolkhart 기여)
- [SQLite] sqlite 3.35 지원 추가 (@eygraber 기여)
- [SQLite] ALTER TABLE DROP COLUMN 지원 추가 (@eygraber 기여)
- [SQLite] Sqlite 3.30 방언 지원 추가 (@eygraber 기여)
- [SQLite] sqlite에서 NULLS FIRST/LAST 지원 (@eygraber 기여)
- [HSQL] generated 절에 대한 HSQL 지원 추가 (@MariusVolkhart 기여)
- [HSQL] HSQL에서 명명된 파라미터 지원 추가 (@MariusVolkhart 기여)
- [HSQL] HSQL insert 쿼리 커스터마이징 (@MariusVolkhart 기여)

### 변경됨
- [전체] 패키지명이 com.squareup.sqldelight에서 app.cash.sqldelight로 변경되었습니다.
- [Runtime] 방언을 격리된 별도의 Gradle 모듈로 이동
- [Runtime] 드라이버가 구현하는 쿼리 알림으로 전환
- [Runtime] 기본 컬럼 어댑터를 별도 모듈로 추출 (#2056, #2060)
- [Compiler] 각 모듈에서 반복하지 않고 모듈이 쿼리 구현체를 생성하도록 변경
- [Compiler] 생성된 데이터 클래스에서 커스텀 toString 생성을 제거 (@PaulWoitaschek 기여)
- [JS Driver] sqljs-driver에서 sql.js 의존성 제거 (@dellisd 기여)
- [Paging] android paging 2 확장 제거
- [IDE Plugin] SQLDelight 동기화 중에 에디터 배너 추가 (#2511)
- [IDE Plugin] 최소 지원 IntelliJ 버전을 2021.1로 상향

### 수정됨
- [Runtime] 할당 및 포인터 체이싱을 줄이기 위해 리스너 목록을 평탄화(flatten) (@andersio 기여)
- [IDE Plugin] 오류 위치로 이동할 수 있도록 에러 메시지 수정 (@hfhbd 기여)
- [IDE Plugin] 누락된 인스펙션 설명 추가 (#2768, @aperfilyev 기여)
- [IDE Plugin] GotoDeclarationHandler 예외 수정 (#2531, #2688, #2804, @aperfilyev 기여)
- [IDE Plugin] import 키워드 하이라이트 (@aperfilyev 기여)
- [IDE Plugin] 미해결된 Kotlin 타입 수정 (#1678, @aperfilyev 기여)
- [IDE Plugin] 미해결 패키지에 대한 하이라이트 수정 (#2543, @aperfilyev 기여)
- [IDE Plugin] 프로젝트 인덱스가 아직 초기화되지 않은 경우 불일치 컬럼을 검사하지 않도록 수정
- [IDE Plugin] Gradle 동기화가 발생할 때까지 파일 인덱스를 초기화하지 않도록 수정
- [IDE Plugin] Gradle 동기화가 시작되면 SQLDelight 임포트 취소
- [IDE Plugin] 실행 취소(undo) 작업이 수행된 스레드 외부에서 데이터베이스 재생성
- [IDE Plugin] 참조를 확인할 수 없는 경우 빈 Java 타입 사용
- [IDE Plugin] 파일 파싱 중에 메인 스레드를 벗어나고, 쓸 때만 다시 메인 스레드로 돌아오도록 올바르게 수정
- [IDE Plugin] 구버전 IntelliJ와의 호환성 개선 (@3flex 기여)
- [IDE Plugin] 더 빠른 어노테이션 API 사용
- [Gradle Plugin] 런타임 추가 시 js/android 플러그인을 명시적으로 지원 (@ZacSweers 기여)
- [Gradle Plugin] 마이그레이션에서 스키마를 도출하지 않고 마이그레이션 출력 태스크 등록 (#2744, @kevincianfarini 기여)
- [Gradle Plugin] 마이그레이션 작업이 중단되는 경우 오류가 발생한 파일 출력
- [Gradle Plugin] 멱등한(idempotent) 출력을 보장하기 위해 코드 생성 시 파일 정렬 (@ZacSweers 기여)
- [Compiler] 전체 PSI 그래프를 탐색하지 않고 파일을 반복 처리하는 더 빠른 API 사용
- [Compiler] select 함수 매개변수에 키워드 맹글링(mangling) 추가 (#2759, @aperfilyev 기여)
- [Compiler] 마이그레이션 어댑터의 packageName 수정 (@hfhbd 기여)
- [Compiler] 타입 대신 프로퍼티에 어노테이션을 생성하도록 수정 (#2798, @aperfilyev 기여)
- [Compiler] Query 서브타입으로 전달하기 전에 인자 정렬 (#2379, @aperfilyev 기여)

## [1.5.3] - 2021-11-23 {id="1-5-3-2021-11-23"}
[1.5.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.3

### 추가됨
- [JDBC Driver] 서드파티 드라이버 구현을 위해 JdbcDriver 오픈 (#2672, @hfhbd 기여)
- [MySQL Dialect] 시간 증분에 누락된 함수 추가 (#2671, @sdoward 기여)
- [Coroutines Extension] coroutines-extensions에 M1 타깃 추가 (@PhilipDukhov 기여)

### 변경됨
- [Paging3 Extension] sqldelight-android-paging3를 AAR 대신 JAR로 배포 (#2634, @julioromano 기여)
- 소프트 키워드(soft keywords)이기도 한 프로퍼티 이름 뒤에 언더스코어가 붙습니다. 예를 들어 `value`는 `value_`로 노출됩니다.

### 수정됨
- [Compiler] 중복된 배열 매개변수에 대해 변수를 추출하지 않도록 수정 (@aperfilyev 기여)
- [Gradle Plugin] kotlin.mpp.enableCompatibilityMetadataVariant 추가 (#2628, @martinbonnin 기여)
- [IDE Plugin] 사용처 찾기 처리 시 읽기 작업(read action)이 필요하도록 수정

## [1.5.2] - 2021-10-12 {id="1-5-2-2021-10-12"}
[1.5.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.2

### 추가됨
- [Gradle Plugin] HMPP 지원 (#2548, @martinbonnin 기여)
- [IDE Plugin] NULL 비교 인스펙션 추가 (@aperfilyev 기여)
- [IDE Plugin] 인스펙션 억제기(inspection suppressor) 추가 (#2519, @aperfilyev 기여)
- [IDE Plugin] 혼합된 이름 및 위치 매개변수 인스펙션 추가 (@aperfilyev 기여)
- [SQLite Driver] mingwX86 타깃 추가 (#2558, @enginegl 기여)
- [SQLite Driver] M1 타깃 추가
- [SQLite Driver] linuxX64 지원 추가 (#2456, @chippmann 기여)
- [MySQL Dialect] mysql에 ROW_COUNT 함수 추가 (#2523)
- [PostgreSQL Dialect] postgres rename, drop column 추가 (@pabl0rg 기여)
- [PostgreSQL Dialect] PostgreSQL 문법이 CITEXT를 인식하지 못하던 문제 수정
- [PostgreSQL Dialect] TIMESTAMP WITH TIME ZONE 및 TIMESTAMPTZ 포함
- [PostgreSQL Dialect] PostgreSQL GENERATED 컬럼 문법 추가
- [Runtime] AfterVersion에 매개변수로 SqlDriver 제공 (#2534, 2614, @ahmedre 기여)

### 변경됨
- [Gradle Plugin] 명시적으로 Gradle 7.0 요구 (#2572, @martinbonnin 기여)
- [Gradle Plugin] VerifyMigrationTask가 Gradle의 최신 상태 검사(up-to-date checks)를 지원하도록 수정 (#2533, @3flex 기여)
- [IDE Plugin] nullable 타입을 non-nullable 타입과 조인할 때 "Join compares two columns of different types" 경고를 표시하지 않도록 변경 (#2550, @pchmielowski 기여)
- [IDE Plugin] 컬럼 타입의 소문자 'as'에 대한 에러 명확화 (@aperfilyev 기여)

### 수정됨
- [IDE Plugin] 프로젝트가 이미 폐기된(disposed) 경우 새 방언으로 다시 파싱하지 않도록 수정 (#2609)
- [IDE Plugin] 연결된 가상 파일이 null인 경우 모듈이 null이 되도록 수정 (#2607)
- [IDE Plugin] 사용되지 않는 쿼리 인스펙션 중 크래시 방지 (#2610)
- [IDE Plugin] 쓰기 작업(write action) 내에서 데이터베이스 동기화 쓰기 실행 (#2605)
- [IDE Plugin] IDE가 SQLDelight 동기화를 스케줄링하도록 위임
- [IDE Plugin] JavaTypeMixin의 NPE 수정 (#2603, @aperfilyev 기여)
- [IDE Plugin] MismatchJoinColumnInspection의 IndexOutOfBoundsException 수정 (#2602, @aperfilyev 기여)
- [IDE Plugin] UnusedColumnInspection에 설명 추가 (#2600, @aperfilyev 기여)
- [IDE Plugin] PsiElement.generatedVirtualFiles를 읽기 작업으로 래핑 (#2599, @aperfilyev 기여)
- [IDE Plugin] 불필요한 nonnull 캐스팅 제거 (#2596)
- [IDE Plugin] 사용처 찾기를 위한 null 안전한 처리 (#2595)
- [IDE Plugin] Android용 생성 파일에 대한 IDE 자동 완성 수정 (#2573, @martinbonnin 기여)
- [IDE Plugin] SqlDelightGotoDeclarationHandler의 NPE 수정 (@aperfilyev 기여)
- [IDE Plugin] insert 문 내부 인자에서 Kotlin 키워드 맹글링 처리 (@aperfilyev 기여)
- [IDE Plugin] SqlDelightFoldingBuilder의 NPE 수정 (#2382, @aperfilyev 기여)
- [IDE Plugin] CopyPasteProcessor에서 ClassCastException 캐치 (#2369, @aperfilyev 기여)
- [IDE Plugin] update 라이브 템플릿 수정 (@IliasRedissi 기여)
- [IDE Plugin] 인텐션 액션에 설명 추가 (#2489, @aperfilyev 기여)
- [IDE Plugin] 테이블을 찾을 수 없는 경우 CreateTriggerMixin의 예외 수정 (@aperfilyev 기여)
- [Compiler] 테이블 생성 문 위상 정렬(topologically sort)
- [Compiler] 디렉터리에 대해 `forDatabaseFiles` 콜백 호출 중지 (#2532)
- [Gradle Plugin] 잠재적 컨슈머에게 generateDatabaseInterface 작업 의존성 전파 (#2518, @martinbonnin 기여)

## [1.5.1] - 2021-07-16 {id="1-5-1-2021-07-16"}
[1.5.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.1

### 추가됨
- [PostgreSQL Dialect] PostgreSQL JSONB 및 ON Conflict Do Nothing 지원 (@satook 기여)
- [PostgreSQL Dialect] PostgreSQL ON CONFLICT (column, ...) DO UPDATE 지원 추가 (@satook 기여)
- [MySQL Dialect] MySQL 생성 컬럼 지원 (@JGulbronson 기여)
- [Native Driver] watchosX64 지원 추가
- [IDE Plugin] 매개변수 타입 및 어노테이션 추가 (@aperfilyev 기여)
- [IDE Plugin] 'select all' 쿼리 생성 액션 추가 (@aperfilyev 기여)
- [IDE Plugin] 자동 완성 시 컬럼 타입 표시 (@aperfilyev 기여)
- [IDE Plugin] 자동 완성에 아이콘 추가 (@aperfilyev 기여)
- [IDE Plugin] 'select by primary key' 쿼리 생성 액션 추가 (@aperfilyev 기여)
- [IDE Plugin] 'insert into' 쿼리 생성 액션 추가 (@aperfilyev 기여)
- [IDE Plugin] 컬럼 이름, 문 식별자, 함수 이름에 대한 하이라이트 추가 (@aperfilyev 기여)
- [IDE Plugin] 나머지 쿼리 생성 작업 추가 (#489, @aperfilyev 기여)
- [IDE Plugin] insert-stmt에서 매개변수 힌트 표시 (@aperfilyev 기여)
- [IDE Plugin] 테이블 별칭 인텐션 액션 (@aperfilyev 기여)
- [IDE Plugin] 한정된 컬럼 이름(Qualify column name) 인텐션 (@aperfilyev 기여)
- [IDE Plugin] Kotlin 프로퍼티 선언으로 이동(Go to declaration) (@aperfilyev 기여)

### 변경됨
- [Native Driver] 가능한 경우 동결(freezing) 및 공유 가능한 데이터 구조를 방지하여 네이티브 트랜잭션 성능 향상 (@andersio 기여)
- [Paging 3] Paging3 버전을 3.0.0 stable로 상향
- [JS Driver] sql.js를 1.5.0으로 업그레이드

### 수정됨
- [JDBC SQLite Driver] ThreadLocal을 지우기 전에 커넥션에서 close() 호출 (#2444, @hannesstruss 기여)
- [RX extensions] 구독 / 폐기 레이스 누수(race leak) 수정 (#2403, @pyricau 기여)
- [Coroutines extension] 알림을 보내기 전에 쿼리 리스너를 등록하도록 보장
- [Compiler] 일관된 Kotlin 출력 파일을 생성하도록 notifyQueries 정렬 (@thomascjy 기여)
- [Compiler] select 쿼리 클래스 프로퍼티에 @JvmField 어노테이션을 붙이지 않도록 수정 (@eygraber 기여)
- [IDE Plugin] 임포트 최적화 수정 (#2350, @aperfilyev 기여)
- [IDE Plugin] 미사용 컬럼 인스펙션 수정 (@aperfilyev 기여)
- [IDE Plugin] 임포트 검사 및 클래스 어노테이터에 중첩 클래스 지원 추가 (@aperfilyev 기여)
- [IDE Plugin] CopyPasteProcessor의 NPE 수정 (#2363, @aperfilyev 기여)
- [IDE Plugin] InlayParameterHintsProvider의 크래시 수정 (#2359, @aperfilyev 기여)
- [IDE Plugin] create table 문에 텍스트를 복사-붙여넣기할 때 빈 줄이 삽입되던 문제 수정 (#2431, @aperfilyev 기여)

## [1.5.0] - 2021-04-23 {id="1-5-0-2021-04-23"}
[1.5.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.0

### 추가됨
- [SQLite Javascript Driver] sqljs-driver 배포 활성화 (#1667, @dellisd 기여)
- [Paging3 Extension] Android Paging 3 라이브러리 확장 (#1786, @kevincianfarini 기여)
- [MySQL Dialect] MySQL의 ON DUPLICATE KEY UPDATE 충돌 해결 지원 추가 (@rharter 기여)
- [SQLite Dialect] SQLite offsets()에 대한 컴파일러 지원 추가 (@qjroberts 기여)
- [IDE Plugin] 알 수 없는 타입에 대한 빠른 임포트 수정 추가 (#683, @aperfilyev 기여)
- [IDE Plugin] 미사용 임포트 인스펙션 추가 (#1161, @aperfilyev 기여)
- [IDE Plugin] 미사용 쿼리 인스펙션 추가 (@aperfilyev 기여)
- [IDE Plugin] 미사용 컬럼 인스펙션 추가 (#569, @aperfilyev 기여)
- [IDE Plugin] 복사/붙여넣기 시 자동으로 임포트 가져오기 (#684, @aperfilyev 기여)
- [IDE Plugin] Gradle과 IntelliJ 플러그인 버전 간 비호환성이 있을 때 풍선 알림 표시
- [IDE Plugin] Insert Into ... VALUES(?) 매개변수 힌트 (#506, @aperfilyev 기여)
- [IDE Plugin] 인라인 매개변수 힌트 (@aperfilyev 기여)
- [Runtime] 콜백과 함께 마이그레이션을 실행하기 위한 API 런타임에 포함 (#1844)

### 변경됨
- [Compiler] "IS NOT NULL" 쿼리에 대한 스마트 캐스트 (#867)
- [Compiler] 런타임에 실패할 수 있는 키워드 방어 (#1471, #1629)
- [Gradle Plugin] Gradle 플러그인 크기를 60MB에서 13MB로 축소
- [Gradle Plugin] Android 배리언트를 올바르게 지원하고, KMM 타깃별 SQL 지원 제거 (#1039)
- [Gradle Plugin] minsdk에 따라 최소 sqlite 버전 선택 (#1684)
- [Native Driver] 네이티브 드라이버 커넥션 풀 및 성능 업데이트

### 수정됨
- [Compiler] 람다 앞의 공백(NBSP) 처리 (@oldergod 기여)
- [Compiler] 생성된 bind* 및 cursor.get* 문에서 호환되지 않는 타입 문제 수정
- [Compiler] SQL 절이 어댑터가 적용된 타입을 유지하도록 수정 (#2067)
- [Compiler] NULL 키워드만 있는 컬럼은 nullable이어야 함
- [Compiler] 타입 어노테이션이 있는 매퍼 람다를 생성하지 않도록 수정 (#1957)
- [Compiler] 커스텀 쿼리가 충돌할 경우 파일 이름을 추가 패키지 접미사로 사용 (#1057, #1278)
- [Compiler] 외래 키 연쇄(cascades)가 발생할 때 쿼리 리스너에 알림이 가도록 보장 (#1325, #1485)
- [Compiler] 동일한 두 타입을 union할 때 테이블 타입을 반환하도록 수정 (#1342)
- [Compiler] ifnull 및 coalesce의 인자가 nullable일 수 있도록 보장 (#1263)
- [Compiler] 표현식에 대해 쿼리에서 적용된 null 가능성을 올바르게 사용
- [MySQL Dialect] MySQL if 문 지원
- [PostgreSQL Dialect] PostgreSQL에서 NUMERIC 및 DECIMAL을 Double로 검색 (#2118)
- [SQLite Dialect] UPSERT 알림이 BEFORE/AFTER UPDATE 트리거를 고려하도록 수정 (#2198, @andersio 기여)
- [SQLite Driver] 인메모리가 아닌 경우 SqliteDriver에서 스레드용 다중 커넥션 사용 (#1832)
- [JDBC Driver] JDBC 드라이버가 autoCommit을 true로 간주하던 문제 수정 (#2041)
- [JDBC Driver] 예외 발생 시 커넥션을 확실히 닫도록 수정 (#2306)
- [IDE Plugin] 경로 구분자 버그로 인해 Windows에서 GoToDeclaration/FindUsages가 깨지던 문제 수정 (#2054, @angusholder 기여)
- [IDE Plugin] IDE에서 크래시가 발생하는 대신 Gradle 에러를 무시하도록 처리
- [IDE Plugin] sqldelight 파일이 비-sqldelight 모듈로 이동된 경우 코드 생성을 시도하지 않음
- [IDE Plugin] IDE에서 발생하는 코드 생성 에러 무시
- [IDE Plugin] 음수 서브스트링을 시도하지 않도록 보장 (#2068)
- [IDE Plugin] Gradle 액션을 실행하기 전에 프로젝트가 폐기되지 않았는지 확인 (#2155)
- [IDE Plugin] nullable 타입에 대한 연산 결과도 nullable이 되도록 수정 (#1853)
- [IDE Plugin] 'expand * intention'이 추가 프로젝션과 함께 작동하도록 수정 (#2173, @aperfilyev 기여)
- [IDE Plugin] GoTo 도중 Kotlin 해석이 실패하면 sqldelight 파일로 이동하지 않음
- [IDE Plugin] sqldelight 인덱싱 중 IntelliJ에서 예외가 발생해도 크래시되지 않도록 수정
- [IDE Plugin] IDE에서 코드 생성 전 에러를 감지하는 도중 발생하는 예외 처리
- [IDE Plugin] IDE 플러그인이 동적 플러그인(Dynamic Plugins)과 호환되도록 수정 (#1536)
- [Gradle Plugin] WorkerApi를 사용하여 데이터베이스를 생성할 때 발생하는 경쟁 상태(race condition) 수정 (#2062, @stephanenicolas 기여)
- [Gradle Plugin] classLoaderIsolation으로 인해 커스텀 jdbc 사용이 차단되던 문제 수정 (#2048, @benasher44 기여)
- [Gradle Plugin] 누락된 packageName 에러 메시지 개선 (@vanniktech 기여)
- [Gradle Plugin] SQLDelight가 빌드스크립트 클래스패스에 IntelliJ 의존성을 흘려보내던 문제 수정 (#1998)
- [Gradle Plugin] Gradle 빌드 캐싱 수정 (#2075)
- [Gradle Plugin] Gradle 플러그인에서 kotlin-native-utils에 의존하지 않도록 수정 (@ilmat192 기여)
- [Gradle Plugin] 마이그레이션 파일만 있는 경우에도 데이터베이스를 작성하도록 수정 (#2094)
- [Gradle Plugin] 최종 컴파일 유닛에서 다이아몬드 의존성이 한 번만 포함되도록 보장 (#1455)

이번 릴리스에서 SQLDelight 인프라 개선을 위해 많은 작업을 수행해 주신 @3flex 님께 감사의 말씀을 전합니다.

## [1.4.4] - 2020-10-08 {id="1-4-4-2020-10-08"}
[1.4.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.4

### 추가됨
- [PostgreSQL Dialect] WITH에서 데이터 수정 문(data-modifying statements) 지원
- [PostgreSQL Dialect] substring 함수 지원
- [Gradle Plugin] SQLDelight 컴파일 중 마이그레이션 유효성 검사를 위한 verifyMigrations 플래그 추가 (#1872)

### 변경됨
- [Compiler] 비 SQLite 방언에서 SQLite 고유 함수를 알 수 없음(unknown)으로 표시
- [Gradle Plugin] sqldelight 플러그인이 적용되었으나 데이터베이스가 구성되지 않은 경우 경고 표시 (#1421)

### 수정됨
- [Compiler] ORDER BY 절에서 컬럼 이름을 바인딩할 때 에러 보고 (#1187, @eygraber 기여)
- [Compiler] db 인터페이스 생성 시 레지스트리 경고가 나타나던 문제 수정 (#1792)
- [Compiler] case 문에 대한 잘못된 타입 추론 수정 (#1811)
- [Compiler] 버전이 없는 마이그레이션 파일에 대해 더 나은 에러 제공 (#2006)
- [Compiler] 일부 데이터베이스 타입 ColumnAdapter에 대해 마샬링에 필요한 데이터베이스 타입이 잘못되던 문제 수정 (#2012)
- [Compiler] CAST의 null 가능성 수정 (#1261)
- [Compiler] 쿼리 래퍼에서 이름 가림(name shadowed) 경고가 대량으로 발생하던 문제 수정 (#1946, @eygraber 기여)
- [Compiler] 생성된 코드가 전체 한정자 이름(full qualifier names)을 사용하던 문제 수정 (#1939)
- [IDE Plugin] Gradle 동기화에서 sqldelight 코드 생성 트리거
- [IDE Plugin] .sq 파일 변경 시 플러그인이 데이터베이스 인터페이스를 재생성하지 않던 문제 수정 (#1945)
- [IDE Plugin] 파일을 새 패키지로 이동할 때 발생하던 문제 수정 (#444)
- [IDE Plugin] 커서를 이동할 위치가 없으면 크래시를 내는 대신 아무 작업도 하지 않음 (#1994)
- [IDE Plugin] Gradle 프로젝트 외부의 파일에 대해 빈 패키지 이름 사용 (#1973)
- [IDE Plugin] 유효하지 않은 타입에 대해 정상적으로 실패(fail gracefully) 처리 (#1943)
- [IDE Plugin] 알 수 없는 표현식을 만났을 때 더 나은 에러 메시지 출력 (#1958)
- [Gradle Plugin] SQLDelight가 빌드스크립트 클래스패스에 IntelliJ 의존성을 흘려보내던 문제 수정 (#1998)
- [Gradle Plugin] *.sq 파일에 메서드 문서를 추가할 때 발생하는 "JavadocIntegrationKt not found" 컴파일 에러 수정 (#1982)
- [Gradle Plugin] SqlDelight Gradle 플러그인이 구성 캐싱(Configuration Caching, CoCa)을 지원하지 않던 문제 수정 (#1947, @stephanenicolas 기여)
- [SQLite JDBC Driver] SQLException: database in auto-commit mode 문제 수정 (#1832)
- [Coroutines Extension] coroutines-extensions에 대한 IR 백엔드 수정 (#1918, @dellisd 기여)

## [1.4.3] - 2020-09-04 {id="1-4-3-2020-09-04"}
[1.4.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.3

### 추가됨
- [MySQL Dialect] MySQL last_insert_id 함수 지원 추가 (@lawkai 기여)
- [PostgreSQL Dialect] SERIAL 데이터 타입 지원 (@veyndan, @felipecsl 기여)
- [PostgreSQL Dialect] PostgreSQL RETURNING 지원 (@veyndan 기여)

### 수정됨
- [MySQL Dialect] MySQL AUTO_INCREMENT를 기본값이 있는 것으로 처리 (#1823)
- [Compiler] Upsert 문 컴파일러 에러 수정 (#1809, @eygraber 기여)
- [Compiler] 유효하지 않은 Kotlin이 생성되던 문제 수정 (#1925, @eygraber 기여)
- [Compiler] 알 수 없는 함수에 대해 더 나은 에러 메시지 제공 (#1843)
- [Compiler] instr의 두 번째 매개변수 타입을 string으로 노출
- [IDE Plugin] IDE 플러그인의 데몬 비대화 및 UI 스레드 멈춤 현상 수정 (#1916)
- [IDE Plugin] null 모듈 시나리오 처리 (#1902)
- [IDE Plugin] 구성되지 않은 sq 파일에서 패키지 이름으로 빈 문자열 반환 (#1920)
- [IDE Plugin] 그룹 문 수정 및 통합 테스트 추가 (#1820)
- [IDE Plugin] 요소에 대한 모듈을 찾을 때 내장된 ModuleUtil 사용 (#1854)
- [IDE Plugin] 조회(lookups)에 유효한 요소만 추가 (#1909)
- [IDE Plugin] 부모가 null일 수 있는 상황 처리 (#1857)

## [1.4.2] - 2020-08-27 {id="1-4-2-2020-08-27"}
[1.4.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.2

### 추가됨
- [Runtime] 새로운 JS IR 백엔드 지원
- [Gradle Plugin] generateSqlDelightInterface Gradle 태스크 추가 (@vanniktech 기여)
- [Gradle Plugin] verifySqlDelightMigration Gradle 태스크 추가 (@vanniktech 기여)

### 수정됨
- [IDE Plugin] IDE와 Gradle 간의 데이터 공유를 원활하게 하기 위해 Gradle tooling API 사용
- [IDE Plugin] 스키마 도출(schema derivation)의 기본값을 false로 설정
- [IDE Plugin] commonMain 소스셋을 올바르게 가져오도록 수정
- [MySQL Dialect] mySqlFunctionType()에 minute 추가 (@maaxgr 기여)

## [1.4.1] - 2020-08-21 {id="1-4-1-2020-08-21"}
[1.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.1

### 추가됨
- [Runtime] Kotlin 1.4.0 지원 (#1859)

### 변경됨
- [Gradle Plugin] AGP 의존성을 compileOnly로 변경 (#1362)

### 수정됨
- [Compiler] 컬럼 정의 규칙 및 테이블 인터페이스 생성기에 선택적 javadoc 추가 (#1224, @endanke 기여)
- [SQLite Dialect] sqlite fts5 보조 함수인 highlight, snippet, bm25 지원 추가 (@drampelt 기여)
- [MySQL Dialect] MySQL bit 데이터 타입 지원
- [MySQL Dialect] MySQL 바이너리 리터럴 지원
- [PostgreSQL Dialect] sql-psi에서 SERIAL 노출 (@veyndan 기여)
- [PostgreSQL Dialect] BOOLEAN 데이터 타입 추가 (@veyndan 기여)
- [PostgreSQL Dialect] NULL 컬럼 제약 조건 추가 (@veyndan 기여)
- [HSQL Dialect] HSQL에 `AUTO_INCREMENT` 지원 추가 (@rharter 기여)

## [1.4.0] - 2020-06-22 {id="1-4-0-2020-06-22"}
[1.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.0

### 추가됨
- [MySQL Dialect] MySQL 지원 (@JGulbronson, @veyndan 기여)
- [PostgreSQL Dialect] 실험적 PostgreSQL 지원 (@veyndan 기여)
- [HSQL Dialect] 실험적 H2 지원 (@MariusVolkhart 기여)
- [SQLite Dialect] SQLite FTS5 지원 (@benasher44, @jpalawaga 기여)
- [SQLite Dialect] alter table rename column 지원 (#1505, @angusholder 기여)
- [IDE] 마이그레이션(.sqm) 파일에 대한 IDE 지원
- [IDE] 내장 SQL 라이브 템플릿을 모방한 SQLDelight 라이브 템플릿 추가 (#1154, @veyndan 기여)
- [IDE] 신규 SqlDelight 파일 생성 액션 추가 (#42, @romtsn 기여)
- [Runtime] 결과를 반환하는 트랜잭션을 위한 transactionWithReturn API 추가
- [Compiler] .sq 파일에서 여러 SQL 문을 함께 그룹화하는 구문 추가
- [Compiler] 마이그레이션 파일로부터 스키마 생성 지원
- [Gradle Plugin] 마이그레이션 파일을 유효한 sql로 출력하는 태스크 추가

### 변경됨
- [Documentation] 문서 웹사이트 개편 (@saket 기여)
- [Gradle Plugin] 미지원 방언 에러 메시지 개선 (@veyndan 기여)
- [IDE] 방언에 따라 파일 아이콘을 동적으로 변경 (@veyndan 기여)
- [JDBC Driver] javax.sql.DataSource로부터 JdbcDriver 생성자 노출 (#1614)

### 수정됨
- [Compiler] 테이블의 Javadoc 지원 및 한 파일 내의 다중 javadoc 수정 (#1224)
- [Compiler] 합성 컬럼(synthesized columns)에 대한 값 삽입 활성화 (#1351)
- [Compiler] 디렉터리 이름 정제 시 불일치 수정 (@ZacSweers 기여)
- [Compiler] 합성 컬럼이 조인 간에 null 가능성을 유지하도록 수정 (#1656)
- [Compiler] delete 문을 delete 키워드에 고정시킴 (#1643)
- [Compiler] 인용구(quoting) 수정 (#1525, @angusholder 기여)
- [Compiler] between 연산자가 표현식으로 올바르게 재귀하도록 수정 (#1279)
- [Compiler] 인덱스 생성 시 누락된 테이블/컬럼에 대해 더 나은 에러 제공 (#1372)
- [Compiler] 조인 제약 조건에서 외부 쿼리의 프로젝션을 사용할 수 있도록 지원 (#1346)
- [Native Driver] execute가 transationPool을 사용하도록 변경 (@benasher44 기여)
- [JDBC Driver] sqlite 대신 jdbc 트랜잭션 API 사용 (#1693)
- [IDE] virtualFile 참조가 항상 원본 파일이 되도록 수정 (#1782)
- [IDE] Bugsnag에 오류를 보고할 때 올바른 throwable 사용 (#1262)
- [Paging Extension] 메모리가 누수되던 DataSource 수정 (#1628)
- [Gradle Plugin] 스키마 생성 시 출력 db 파일이 이미 존재하면 삭제 (#1645)
- [Gradle Plugin] 누락된 버전 간격이 있는 경우 마이그레이션 검증 실패 처리
- [Gradle Plugin] 설정된 파일 인덱스를 명시적으로 사용 (#1644)

## [1.3.0] - 2020-04-03 {id="1-3-0-2020-04-03"}
[1.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.3.0

* 신규: [Gradle] 컴파일 대상 SQL 방언을 지정하는 Dialect 프로퍼티.
* 신규: [Compiler] #1009 mysql 방언에 대한 실험적 지원.
* 신규: [Compiler] #1436 sqlite:3.24 방언 및 upsert 지원.
* 신규: [JDBC Driver] sqlite jvm 드라이버에서 JDBC 드라이버 분리.
* 수정: [Compiler] #1199 길이 제한 없는 람다 지원.
* 수정: [Compiler] #1610 avg()의 반환 타입이 nullable이 되도록 수정.
* 수정: [IntelliJ] #1594 Windows에서 Goto 및 Find Usages를 망가뜨리던 경로 구분자 처리 문제 수정.

## [1.2.2] - 2020-01-22 {id="1-2-2-2020-01-22"}
[1.2.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.2

* 신규: [Runtime] Windows (mingW), tvOS, watchOS 및 macOS 아키텍처 지원.
* 수정: [Compiler] sum()의 반환 타입은 nullable이어야 함.
* 수정: [Paging] 경쟁 상태를 방지하기 위해 QueryDataSourceFactory에 Transacter 전달.
* 수정: [IntelliJ Plugin] 파일의 패키지 이름을 찾을 때 의존성을 검색하지 않음.
* 수정: [Gradle] #862 Gradle의 검증기(validator) 로그를 디버그 레벨로 변경.
* 개선: [Gradle] Gradle worker를 사용하도록 GenerateSchemaTask 전환.
* 참고: sqldelight-runtime 아티팩트의 이름이 runtime으로 변경되었습니다.

## [1.2.1] - 2019-12-11 {id="1-2-1-2019-12-11"}
[1.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.1

* 수정: [Gradle] Kotlin Native 1.3.60 지원.
* 수정: [Gradle] #1287 동기화 시 경고 발생 문제.
* 수정: [Compiler] #1469 쿼리에 대한 SyntheticAccessor 생성.
* 수정: [JVM Driver] 메모리 누수 수정.
* 참고: coroutine extension 아티팩트를 사용하려면 buildscript에 kotlinx bintray maven 저장소를 추가해야 합니다.

## [1.2.0] - 2019-08-30 {id="1-2-0-2019-08-30"}
[1.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.0

* 신규: [Runtime] 안정적인 Flow API 제공.
* 수정: [Gradle] Kotlin Native 1.3.50 지원.
* 수정: [Gradle] #1380 클린 빌드가 간헐적으로 실패하던 문제.
* 수정: [Gradle] #1348 verify 작업 실행 시 "Could not retrieve functions"가 출력되던 문제.
* 수정: [Compile] #1405 쿼리에 조인된 FTS 테이블이 포함된 경우 프로젝트를 빌드할 수 없던 문제.
* 수정: [Gradle] #1266 여러 데이터베이스 모듈이 있을 때 산발적으로 발생하던 Gradle 빌드 실패 문제.

## [1.1.4] - 2019-07-11 {id="1-1-4-2019-07-11"}
[1.1.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.4

* 신규: [Runtime] 실험적 Kotlin Flow API.
* 수정: [Gradle] Kotlin/Native 1.3.40 호환성.
* 수정: [Gradle] #1243 Gradle configure on demand 환경에서 SQLDelight 사용 시 문제 수정.
* 수정: [Gradle] #1385 증분 어노테이션 프로세싱과 함께 SQLDelight를 사용할 때의 문제 수정.
* 수정: [Gradle] Gradle 태스크 캐싱 허용.
* 수정: [Gradle] #1274 kotlin dsl과 함께 sqldelight 확장 사용 활성화.
* 수정: [Compiler] 각 쿼리에 대해 고유 ID가 결정론적으로 생성되도록 수정.
* 수정: [Compiler] 트랜잭션이 완료되었을 때만 수신 대기 중인 쿼리에 알림.
* 수정: [JVM Driver] #1370 JdbcSqliteDriver 사용자가 DB URL을 반드시 제공하도록 강제.

## [1.1.3] - 2019-04-14 {id="1-1-3-2019-04-14"}
[1.1.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.3

* Gradle Metadata 1.0 릴리스.

## [1.1.2] - 2019-04-14 {id="1-1-2-2019-04-14"}
[1.1.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.2

* 신규: [Runtime] #1267 로깅 드라이버 데코레이터.
* 수정: [Compiler] #1254 2^16자보다 긴 문자열 리터럴 분할.
* 수정: [Gradle] #1260 생성된 소스가 Multiplatform Project에서 iOS 소스로 인식되던 문제.
* 수정: [IDE] #1290 CopyAsSqliteAction.kt:43의 kotlin.KotlinNullPointerException 수정.
* 수정: [Gradle] #1268 최근 버전에서 linkDebugFrameworkIos* 태스크 실행이 실패하던 문제.

## [1.1.1] - 2019-03-01 {id="1-1-1-2019-03-01"}
[1.1.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.1

* 수정: [Gradle] Android 프로젝트의 모듈 의존성 컴파일 수정.
* 수정: [Gradle] #1246 afterEvaluate에서 api 의존성 설정.
* 수정: [Compiler] 배열 타입이 올바르게 출력되도록 수정.

## [1.1.0] - 2019-02-27 {id="1-1-0-2019-02-27"}
[1.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.0

* 신규: [Gradle] #502 스키마 모듈 의존성 지정 허용.
* 개선: [Compiler] #1111 테이블 오류가 다른 오류보다 먼저 정렬됨.
* 수정: [Compiler] #1225 REAL 리터럴에 대해 올바른 타입 반환.
* 수정: [Compiler] #1218 docid가 트리거를 통해 전파되도록 수정.

## [1.0.3] - 2019-01-30 {id="1-0-3-2019-01-30"}
[1.0.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.3

* 개선: [Runtime] #1195 Native Driver/Runtime Arm32 지원.
* 개선: [Runtime] #1190 Query 타입에서 매퍼 노출.

## [1.0.2] - 2019-01-26 {id="1-0-2-2019-01-26"}
[1.0.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.2

* 수정: [Gradle Plugin] Kotlin 1.3.20으로 업데이트.
* 수정: [Runtime] 트랜잭션이 더 이상 예외를 무시(swallow)하지 않음.

## [1.0.1] - 2019-01-21 {id="1-0-1-2019-01-21"}
[1.0.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.1

* 개선: [Native Driver] DatabaseConfiguration에 디렉터리 이름 전달 허용.
* 개선: [Compiler] #1173 패키지가 없는 파일의 컴파일 실패 처리.
* 수정: [IDE] Square로 IDE 에러를 올바르게 보고하도록 수정.
* 수정: [IDE] #1162 동일한 패키지의 타입이 오류로 표시되지만 정상 작동하던 문제.
* 수정: [IDE] #1166 테이블 이름 변경 시 NPE 발생 문제.
* 수정: [Compiler] #1167 UNION 및 SELECT가 포함된 복잡한 SQL 문을 파싱할 때 예외를 발생시키던 문제.

## [1.0.0] - 2019-01-08 {id="1-0-0-2019-01-08"}
[1.0.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.0

* 신규: 생성 코드가 Kotlin 기반으로 완전히 전면 개편되었습니다.
* 신규: RxJava2 확장 아티팩트.
* 신규: Android Paging 확장 아티팩트.
* 신규: Kotlin Multiplatform 지원.
* 신규: Android, iOS 및 JVM SQLite 드라이버 아티팩트.
* 신규: Transaction API.

## [0.7.0] - 2018-02-12 {id="0-7-0-2018-02-12"}
[0.7.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.7.0

 * 신규: 생성 코드가 Support SQLite 라이브러리만 사용하도록 업데이트되었습니다. 이제 모든 쿼리는 원시 문자열 대신 statement 객체를 생성합니다.
 * 신규: IDE에서의 Statement 폴딩 지원.
 * 신규: Boolean 타입 자동 처리.
 * 수정: 코드 생성에서 지원 중단된 marshal 제거.
 * 수정: 'avg' SQL 함수 타입 매핑이 REAL이 되도록 수정.
 * 수정: 'julianday' SQL 함수를 올바르게 감지하도록 수정.

## [0.6.1] - 2017-03-22 {id="0-6-1-2017-03-22"}
[0.6.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.6.1

 * 신규: 인자가 없는 Delete, Update 및 Insert 문에 대해 컴파일된 statement가 생성됩니다.
 * 수정: 서브쿼리에 사용된 뷰 내부의 using 절에서 에러가 발생하지 않도록 수정.
 * 수정: 생성된 Mapper에서 중복 타입 제거.
 * 수정: 인자와 비교 검사하는 표현식에서 서브쿼리를 사용할 수 있도록 수정.

## [0.6.0] - 2017-03-06 {id="0-6-0-2017-03-06"}
[0.6.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.6.0

 * 신규: Select 쿼리가 이제 문자열 상수 대신 `SqlDelightStatement` 팩토리로 노출됩니다.
 * 신규: 쿼리 JavaDoc이 statement 및 매퍼 팩토리에 복사됩니다.
 * 신규: 뷰 이름에 대한 문자열 상수 출력.
 * 수정: 팩토리를 필요로 하는 뷰 쿼리가 해당 팩토리를 인자로 올바르게 요구하도록 수정.
 * 수정: insert 문의 인자 수가 지정된 컬럼 수와 일치하는지 유효성 검사.
 * 수정: where 절에 사용된 blob 리터럴을 올바르게 인코딩하도록 수정.
 * 이 릴리스에는 Gradle 3.3 이상이 필요합니다.

## [0.5.1] - 2016-10-24 {id="0-5-1-2016-10-24"}
[0.5.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.5.1

 * 신규: 컴파일된 statement가 추상 타입을 상속함.
 * 수정: 매개변수의 기본형 타입이 nullable인 경우 박싱 처리됨.
 * 수정: 바인드 인자에 필요한 모든 팩토리가 팩토리 메서드에 존재하도록 수정.
 * 수정: 이스케이프된 컬럼 이름이 올바르게 마샬링되도록 수정.

## [0.5.0] - 2016-10-19 {id="0-5-0-2016-10-19"}
[0.5.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.5.0

 * 신규: SQLite 인자를 Factory를 통해 타입 안전하게 전달 가능.
 * 신규: IntelliJ 플러그인이 .sq 파일에 대한 서식 지정(formatting) 수행.
 * 신규: SQLite 타임스탬프 리터럴 지원.
 * 수정: IntelliJ에서 매개변수화된 타입을 클릭하여 이동할 수 있도록 수정.
 * 수정: Cursor에서 가져올 때 이스케이프된 컬럼 이름이 더 이상 RuntimeException을 발생시키지 않도록 수정.
 * 수정: 예외를 출력할 때 Gradle 플러그인이 크래시되지 않도록 수정.

## [0.4.4] - 2016-07-20 {id="0-4-4-2016-07-20"}
[0.4.4]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.4

 * 신규: 컬럼의 java 타입으로 short 네이티브 지원.
 * 신규: 생성된 매퍼 및 팩토리 메서드에 Javadoc 추가.
 * 수정: group_concat 및 nullif 함수가 올바른 null 가능성을 가짐.
 * 수정: Android Studio 2.2-alpha와의 호환성 수정.
 * 수정: WITH RECURSIVE가 더 이상 플러그인을 중단시키지 않음.

## [0.4.3] - 2016-07-07 {id="0-4-3-2016-07-07"}
[0.4.3]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.3

 * 신규: 컴파일 에러가 소스 파일로 링크됨.
 * 신규: 마우스 우클릭으로 SQLDelight 코드를 유효한 SQLite로 복사 가능.
 * 신규: 명명된 statement의 Javadoc이 생성된 문자열에 나타남.
 * 수정: 생성된 뷰 모델에 null 가능성 어노테이션 포함.
 * 수정: union에서 생성된 코드가 가능한 모든 컬럼을 지원하도록 적절한 타입 및 null 가능성을 가짐.
 * 수정: sum 및 round SQLite 함수가 생성된 코드에서 올바른 타입을 가짐.
 * 수정: CAST, inner select 버그 수정.
 * 수정: CREATE TABLE 문에서의 자동 완성 지원.
 * 수정: 패키지에 SQLite 키워드 사용 가능.

## [0.4.2] - 2016-06-16 {id="0-4-2-2016-06-16"}
[0.4.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.2

 * 신규: 팩토리에서 Marshal 생성 가능.
 * 수정: IntelliJ 플러그인이 올바른 제네릭 순서로 팩토리 메서드를 생성하도록 수정.
 * 수정: 함수 이름에 대소문자를 자유롭게 사용 가능.

## [0.4.1] - 2016-06-14 {id="0-4-1-2016-06-14"}
[0.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.1

 * 수정: IntelliJ 플러그인이 올바른 제네릭 순서로 클래스를 생성하도록 수정.
 * 수정: 컬럼 정의에 대소문자를 자유롭게 사용 가능.

## [0.4.0] - 2016-06-14 {id="0-4-0-2016-06-14"}
[0.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.0

 * 신규: 테이블별이 아닌 쿼리별로 매퍼가 생성됨.
 * 신규: .sq 파일에서 Java 타입을 임포트 가능.
 * 신규: SQLite 함수 유효성 검사 수행.
 * 수정: 중복 에러 제거.
 * 수정: 대문자 컬럼 이름 및 Java 키워드 컬럼 이름에서 에러가 발생하지 않도록 수정.

## [0.3.2] - 2016-05-14 {id="0-3-2-2016-05-14"}
[0.3.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.2

 * 신규: 뷰 및 별칭에 대해 자동 완성 및 사용처 찾기 작동.
 * 수정: 컴파일 타임 검증에서 select에 함수를 사용할 수 있도록 허용.
 * 수정: 기본값만 선언하는 insert 문 지원.
 * 수정: SQLDelight를 사용하지 않는 프로젝트를 임포트할 때 플러그인이 더 이상 크래시되지 않음.

## [0.3.1] - 2016-04-27 {id="0-3-1-2016-04-27"}
[0.3.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.1

  * 수정: 메서드 참조로 인한 Illegal Access 런타임 예외를 방지하기 위해 인터페이스 가시성을 다시 public으로 변경.
  * 수정: 서브 표현식이 올바르게 평가되도록 수정.

## [0.3.0] - 2016-04-26 {id="0-3-0-2016-04-26"}
[0.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.0

  * 신규: 컬럼 정의가 SQLite 타입을 사용하며, Java 타입을 지정하기 위한 추가적인 'AS' 제약 조건을 가질 수 있음.
  * 신규: IDE에서 버그 리포트 전송 가능.
  * 수정: 자동 완성 기능이 정상적으로 작동하도록 수정.
  * 수정: .sq 파일 편집 시 SQLDelight 모델 파일이 업데이트되도록 수정.
  * 제거됨: Attached 데이터베이스는 더 이상 지원되지 않음.

## [0.2.2] - 2016-03-07 {id="0-2-2-2016-03-07"}
[0.2.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.2

 * 신규: insert, update, delete, index 및 trigger 문에서 사용하는 컬럼에 대한 컴파일 타임 유효성 검사.
 * 수정: 파일 이동/생성 시 IDE 플러그인이 크래시되지 않도록 수정.

## [0.2.1] - 2016-03-07 {id="0-2-1-2016-03-07"}
[0.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.1

 * 신규: Ctrl+`/` (OSX에서는 Cmd+`/`)를 눌러 선택한 라인의 주석 토글 지원.
 * 신규: SQL 쿼리에서 사용되는 컬럼에 대한 컴파일 타임 유효성 검사.
 * 수정: IDE 및 Gradle 플러그인 모두에서 Windows 경로 지원.

## [0.2.0] - 2016-02-29 {id="0-2-0-2016-02-29"}
[0.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.0

 * 신규: Marshal 클래스에 복사 생성자 추가.
 * 신규: Kotlin 1.0 최종 버전으로 업데이트.
 * 수정: 'sqldelight' 폴더 구조 문제를 실패를 유발하지 않는 방식으로 보고.
 * 수정: `table_name`이라는 이름의 컬럼 사용 금지. 생성된 상수가 테이블 이름 상수와 충돌합니다.
 * 수정: IDE 플러그인이 `.sq` 파일의 열림 여부와 관계없이 모델 클래스를 즉시 생성하도록 보장.
 * 수정: IDE 및 Gradle 플러그인 모두에서 Windows 경로 지원.

## [0.1.2] - 2016-02-13 {id="0-1-2-2016-02-13"}
[0.1.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.2

 * 수정: 대부분의 프로젝트에서 Gradle 플러그인을 사용할 수 없게 만들던 코드 제거.
 * 수정: Antlr 런타임에 대한 누락된 컴파일러 의존성 추가.

## [0.1.1] - 2016-02-12 {id="0-1-1-2016-02-12"}
[0.1.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.1

 * 수정: Gradle 플러그인이 자체 버전과 동일한 런타임 버전을 가리키도록 보장.

## [0.1.0] - 2016-02-12 {id="0-1-0-2016-02-12"}
[0.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.0

최초 릴리스.