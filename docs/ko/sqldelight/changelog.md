# 변경 로그 (Change Log)

## 미출시 (Unreleased) {id="unreleased"}

### 추가 {id="added"}

- 아직 없음!

### 변경 {id="changed"}

- 아직 없음!

### 수정 {id="fixed"}

- [Runtime] 트랜잭션을 종료할 때나 롤백 후 훅(post-rollback hook)에서도 오류가 발생할 경우(예: SQLite가 자체적으로 트랜잭션을 롤백한 후 `cannot rollback - no transaction is active` 발생), 트랜잭션 본문의 예외를 유지하도록 수정했습니다. 두 번째 예외는 suppressed 예외로 추가되며, 이제 Android 드라이버는 `endTransaction()`이 예외를 발생시키더라도 현재 트랜잭션을 정리합니다. (@pyricau 기여의 #6387)

## [2.4.1] - 2026-10-06 {id="2-4-1-2026-10-06"}
[2.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.1

### 추가

- [Documentation] Android SQLite 트랜잭션 관련 문서 추가 (@griffio 기여의 #6381)

### 변경

- [Gradle Plugin] 전체 코드 생성 태스크 동안 파싱된 `.sq` 파일을 메모리에 유지하여 가비지 컬렉션 후에 다시 파싱되지 않도록 변경했습니다. 이를 통해 대규모 프로젝트에서 코드 생성 속도를 높일 수 있습니다. (@C2H6O 기여의 #6374)
- [IntelliJ Plugin] 크래시 보고가 커스텀 Bugsnag 인스턴스 대신 JetBrains Marketplace로 전달되도록 변경되었습니다. (@JakeWharton 기여의 #6376)

### 수정

- [IntelliJ Plugin] IntelliJ API 사용 방식을 변경하여 플러그인 배포 위반 사항 수정 (@griffio 기여의 #6366 #6368)

## [2.4.0] - 2026-09-17 {id="2-4-0-2026-09-17"}
[2.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0

### 추가
- [Native Driver] `inMemoryDriver`에 `extendedConfig` 매개변수 추가 (@GuilhE 기여의 #5539)
- [PostgreSQL Dialect] 암시적으로 정의된 시스템 컬럼(System Columns) 쿼리 지원 추가 (@griffio 기여의 #5834)
- [PostgreSQL Dialect] 기본 Array 리터럴 지원 추가 (@griffio 기여의 #5997)
- [PostgreSQL Dialect] 기본 LTREE 지원 추가 (@yesitskev @griffio 기여의 #5880)
- [MySQL Dialect] INET 함수 지원 추가 (@mcxinyu 기여의 #5072)
- [PostgreSQL Dialect] ALTER INDEX 지원 추가 (@griffio 기여의 #6224)
- [SQLite Dialect] SQLite 3.44 집계 함수 DISTINCT, ORDER BY, FILTER 지원 추가 (@griffio 기여의 #6236)
- [SQLite Dialect] SQLite 3.37 STRICT 테이블 지원 추가 (@griffio 기여의 #6230)
- [Gradle Plugin] `codegenExcludedColumns`를 통해 생성된 모델에서 특정 컬럼을 제외하는 기능 지원 추가 (@sokolikp 기여의 #6243)
- [Compiler] 스키마에 `allTableNames` 함수 추가 (@edenman 기여의 #6245)
- [PostgreSQL Dialect] ANY 연산자 지원 추가 (@griffio 기여의 #6253)
- [SQLite Dialect] SQLite 3.39 RIGHT JOIN 및 FULL JOIN 지원 추가 (@griffio 기여의 #6273)
- [PostgreSQL Dialect] 트리거 함수 내 `RAISE` 문 및 `FOUND` 변수 지원 추가 (@griffio 기여의 #6297)

### 변경
- [PostgreSQL Dialect] arrayIntermediateType의 가시성을 public으로 변경 (@griffio 기여의 #5835)
- [Gradle Plugin] 더 엄격한 MigrationFile 버전 관리 구현 (@madisp 기여의 #5730)
- [Gradle Plugin] 최소 지원 Gradle 버전을 8.2.1로 상향 (@maxsav 기여의 #6217)
- [Gradle Plugin] Gradle 프로젝트 격리(isolated projects) 지원 (@maxsav 기여의 #6217)
- [IntelliJ Plugin] 최소 지원 버전을 2023.3 / Android Studio Jellyfish로 변경

### 수정
- [Gradle Plugin] JDK 24+ 환경의 컴파일러 워커에서 발생하는 `sun.misc.Unsafe` 지원 중단 경고 억제 (#6321)
- [Compiler] 생성된 코드에서 Kotlin 추가 경고 억제 (@eyupcanakman 기여의 #6208)
- [Compiler] 그룹화되지 않은 집계 결과 집합의 다른 컬럼들이 항상 nullable이 되도록 수정
- [PostgreSQL Dialect] coalesce 및 ifnull에 대해 nullability를 올바르게 판별하도록 수정
- [PostgreSQL Dialect] PostgreSQL 방언의 IDE 통합 수정
- [PostgreSQL Dialect] PostgreSQL 방언을 위한 IDE 플러그인 개선 (@griffio 기여의 #6209)
- [Intellij Plugin] IDE 플러그인이 모든 방언에 대해 코드 완성을 수행할 수 있도록 수정 (@griffio 기여의 #6210)
- [Gradle Plugin] 데이터베이스 검증(verify database) 태스크 실행 시 발생하는 순환 종속성 오류 수정 (@griffio 기여의 #6221)
- [Compiler] 다중 행 업데이트(multirow update)에 대한 낙관적 락(optimistic lock) 수정 (@griffio 기여의 #6240)
- [Intellij Plugin] IDEA 2026.2에서 크래시를 유발하던 지원 중단 API 사용 수정 (@griffio 기여의 #6247)
- [Gradle Plugin] AGP 8.9부터 8.11까지 생성된 소스가 Kotlin 컴파일에 인식되지 않던 문제 수정
- [PostgreSQL Dialect] 원시 타입(Primitive) 바인드 인자를 사용하는 lower 및 upper 함수가 기본값으로 TEXT를 사용하도록 수정 (@griffio 기여의 #6262)
- [Compiler] 어댑터를 사용하는 데이터 클래스 바인딩 및 nullability를 변경하는 마이그레이션이 포함된 insert 값 처리 수정 (griffio 기여의 #6269)
- [Compiler] null 안전 연산자(IS 및 IS DISTINCT FROM)에 nullable 바인드 인자 사용 (@griffio 기여의 #6265)
- [Gradle Plugin] 프로젝트 종속성에 AGP의 variant resolution 사용 (@maxsav 기여의 #6217)
- [Gradle Plugin] 빌드 간 AGP variant 목록이 다를 때 generateDatabaseInterface 태스크의 빌드 캐시 미스 수정
- [Gradle Plugin] 데이터베이스를 구성하지 않고 플러그인을 적용했을 때 IDE 동기화가 크래시되는 문제 수정 (#6088)
- [PostgreSQL Dialect] 중첩 함수 호출을 사용할 때 JSON 집계 함수 문제 수정 (@griffio 기여의 #6281)
- [Paging3 Extension] 빈 데이터베이스에서 KeyedQueryPagingSource가 크래시되는 문제 수정 (@woods-marshes 기여의 #6284)
- [Compiler] `COALESCE`와 같은 래핑 함수와 함께 변경문(mutator statement)이 사용될 때 발생하는 Java 타입 어댑터 문제 수정 (@griffio 기여의 #6292)
- [Compiler] 모듈 이름이 대문자로 시작할 때 생성된 코드의 패키지 이름도 대문자로 시작하던 문제 수정 (@griffio 기여의 #6316)
- [PostgreSQL Dialect] 날짜 데이터 타입의 대소문자를 구분하지 않도록 허용 (@griffio 기여의 #6328)
- [PostgreSQL Dialect] `string_agg` 함수가 nullable이 되도록 수정 (@griffio 기여의 #6340)
- [SQLite Dialect] `GROUP BY`를 사용하는 SQLite 3.44 집계 함수 수정 (@griffio 기여의 #6343)
- [Gradle Plugin] 구성 시점(configuration time)에 데이터베이스 종속성을 확인(resolve)하지 않도록 방지 (@joshfriend 기여의 #6353)

## [2.4.0-rc2] - 2026-09-14 {id="2-4-0-rc2-2026-09-14"}
[2.4.0-rc2]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0-rc2

### 수정

- [PostgreSQL Dialect] `string_agg` 함수가 nullable이 되도록 수정 (@griffio 기여의 #6340)
- [SQLite Dialect] `GROUP BY`를 사용하는 SQLite 3.44 집계 함수 수정 (@griffio 기여의 #6343)
- [Gradle Plugin] 구성 시점(configuration time)에 데이터베이스 종속성을 확인하지 않도록 방지 (@joshfriend 기여의 #6353)

## [2.4.0-rc1] - 2026-09-01 {id="2-4-0-rc1-2026-09-01"}
[2.4.0-rc1]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0-rc1

### 추가
- [Native Driver] `inMemoryDriver`에 `extendedConfig` 매개변수 추가 (@GuilhE 기여의 #5539)
- [PostgreSQL Dialect] 암시적으로 정의된 시스템 컬럼(System Columns) 쿼리 지원 추가 (@griffio 기여의 #5834)
- [PostgreSQL Dialect] 기본 Array 리터럴 지원 추가 (@griffio 기여의 #5997)
- [PostgreSQL Dialect] 기본 LTREE 지원 추가 (@yesitskev @griffio 기여의 #5880)
- [MySQL Dialect] INET 함수 지원 추가 (@mcxinyu 기여의 #5072)
- [PostgreSQL Dialect] ALTER INDEX 지원 추가 (@griffio 기여의 #6224)
- [SQLite Dialect] SQLite 3.44 집계 함수 DISTINCT, ORDER BY, FILTER 지원 추가 (@griffio 기여의 #6236)
- [SQLite Dialect] SQLite 3.37 STRICT 테이블 지원 추가 (@griffio 기여의 #6230)
- [Gradle Plugin] `codegenExcludedColumns`를 통해 생성된 모델에서 특정 컬럼을 제외하는 기능 지원 추가 (@sokolikp 기여의 #6243)
- [Compiler] 스키마에 `allTableNames` 함수 추가 (@edenman 기여의 #6245)
- [PostgreSQL Dialect] ANY 연산자 지원 추가 (@griffio 기여의 #6253)
- [SQLite Dialect] SQLite 3.39 RIGHT JOIN 및 FULL JOIN 지원 추가 (@griffio 기여의 #6273)
- [PostgreSQL Dialect] 트리거 함수 내 `RAISE` 문 및 `FOUND` 변수 지원 추가 (@griffio 기여의 #6297)

### 변경
- [PostgreSQL Dialect] arrayIntermediateType의 가시성을 public으로 변경 (@griffio 기여의 #5835)
- [Gradle Plugin] 더 엄격한 MigrationFile 버전 관리 구현 (@madisp 기여의 #5730)
- [Gradle Plugin] 최소 지원 Gradle 버전을 8.2.1로 상향 (@maxsav 기여의 #6217)
- [Gradle Plugin] Gradle 프로젝트 격리(isolated projects) 지원 (@maxsav 기여의 #6217)
- [IntelliJ Plugin] 최소 지원 버전을 2023.3 / Android Studio Jellyfish로 변경

### 수정
- [Gradle Plugin] JDK 24+ 환경의 컴파일러 워커에서 발생하는 `sun.misc.Unsafe` 지원 중단 경고 억제 (#6321)
- [Compiler] 생성된 코드에서 Kotlin 추가 경고 억제 (@eyupcanakman 기여의 #6208)
- [Compiler] 그룹화되지 않은 집계 결과 집합의 다른 컬럼들이 항상 nullable이 되도록 수정
- [PostgreSQL Dialect] coalesce 및 ifnull에 대해 nullability를 올바르게 판별하도록 수정
- [PostgreSQL Dialect] PostgreSQL 방언의 IDE 통합 수정
- [PostgreSQL Dialect] PostgreSQL 방언을 위한 IDE 플러그인 개선 (@griffio 기여의 #6209)
- [Intellij Plugin] IDE 플러그인이 모든 방언에 대해 코드 완성을 수행할 수 있도록 수정 (@griffio 기여의 #6210)
- [Gradle Plugin] 데이터베이스 검증 태스크 실행 시 발생하는 순환 종속성 오류 수정 (@griffio 기여의 #6221)
- [Compiler] 다중 행 업데이트에 대한 낙관적 락 수정 (@griffio 기여의 #6240)
- [Intellij Plugin] IDEA 2026.2에서 크래시를 유발하던 지원 중단 API 사용 수정 (@griffio 기여의 #6247)
- [Gradle Plugin] AGP 8.9부터 8.11까지 생성된 소스가 Kotlin 컴파일에 인식되지 않던 문제 수정
- [PostgreSQL Dialect] 원시 타입 바인드 인자를 사용하는 lower 및 upper 함수가 기본값으로 TEXT를 사용하도록 수정 (@griffio 기여의 #6262)
- [Compiler] 어댑터를 사용하는 데이터 클래스 바인딩 및 nullability를 변경하는 마이그레이션이 포함된 insert 값 처리 수정 (griffio 기여의 #6269)
- [Compiler] null 안전 연산자(IS 및 IS DISTINCT FROM)에 nullable 바인드 인자 사용 (@griffio 기여의 #6265)
- [Gradle Plugin] 프로젝트 종속성에 AGP의 variant resolution 사용 (@maxsav 기여의 #6217)
- [Gradle Plugin] 빌드 간 AGP variant 목록이 다를 때 generateDatabaseInterface 태스크의 빌드 캐시 미스 수정
- [Gradle Plugin] 데이터베이스를 구성하지 않고 플러그인을 적용했을 때 IDE 동기화가 크래시되는 문제 수정 (#6088)
- [PostgreSQL Dialect] 중첩 함수 호출을 사용할 때 JSON 집계 함수 문제 수정 (@griffio 기여의 #6281)
- [Paging3 Extension] 빈 데이터베이스에서 KeyedQueryPagingSource가 크래시되는 문제 수정 (@woods-marshes 기여의 #6284)
- [Compiler] `COALESCE`와 같은 래핑 함수와 함께 변경문이 사용될 때 발생하는 Java 타입 어댑터 문제 수정 (@griffio 기여의 #6292)
- [Compiler] 모듈 이름이 대문자로 시작할 때 생성된 코드의 패키지 이름도 대문자로 시작하던 문제 수정 (@griffio 기여의 #6316)
- [PostgreSQL Dialect] 날짜 데이터 타입의 대소문자를 구분하지 않도록 허용 (@griffio 기여의 #6328)

## [2.3.2] - 2026-03-16 {id="2-3-2-2026-03-16"}
[2.3.2]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.2

### 추가
- [PostgreSQL Dialect] ALTER TABLE ALTER TYPE USING 표현식 지원 개선 (@griffio 기여의 #6116)
- [PostgreSQL Dialect] DROP COLUMN IF EXISTS 지원 추가 (@griffio 기여의 #6112)
- [Gradle Plugin] Select 와일드카드 확장을 끌 수 있는 expandSelectStar 플래그 추가 (@griffio 기여의 #5813)
- [MySQL Dialect] 윈도우 함수(Window Functions) 지원 추가 (@griffio 기여의 #6086)
- [Gradle Plugin] 시작 스키마 버전이 1이 아니고 verifyMigrations가 true일 때 빌드가 실패하던 문제 수정 (@neilgmiller 기여의 #6017)
- [Gradle Plugin] `SqlDelightWorkerTask`의 설정 가능성을 높이고, Windows에서의 개발을 지원하도록 기본 구성 업데이트 (@MSDarwish2000 기여의 #5215)
- [SQLite Dialect] FTS5 가상 테이블의 합성 컬럼(synthesized columns) 지원 추가 (@watbe 기여의 #5986)
- [PostgreSQL Dialect] Postgres 행 수준 보안(row level security) 지원 추가 (@shellderp 기여의 #6087)
- [PostgreSQL Dialect] OF table, NO KEY UPDATE, NO WAIT를 지원하도록 FOR UPDATE 확장 (@shellderp 기여의 #6104)
- [PostgreSQL Dialect] Postgis Point 타입 및 관련 함수 지원 (@vanniktech 기여의 #5602)
- [Runtime] 트랜잭션의 `CoroutineContext`를 제어하는 메커니즘을 제공하는 `SuspendingTransacter.TransactionDispatcher` 추가 (@eygraber 기여의 #5967)
- [Gradle Plugin] Android Gradle Plugin 9.0의 새로운 DSL과의 완전한 호환성 지원 (#6140)
- [PostgreSQL Dialect] PostgreSQL CREATE TABLE 스토리지 매개변수 지원 (@griffio 기여의 #6148)
- [PostgreSQL Dialect] PostgreSQL 고유 테이블 제약 조건의 nullable 결과 컬럼 수정 (@griffio 기여의 #6167)

### 변경
- [Compiler] 컴파일러 출력 타입을 java.lang.Void에서 kotlin.Nothing으로 변경 (@griffio 기여의 #6099)
- [Compiler] 패키지 이름에 밑줄(_) 사용 허용. 이전에는 밑줄이 제거(sanitized)되어 예상치 못한 동작이 발생했음 (@BierDav 기여의 #6027)
- [Paging Extension] AndroidX Paging으로 전환 (@jeffdgr8 기여의 #5910)
- [Android Driver] Android minSdk를 23으로 상향 (#6141)
- [Paging Extension] Paging 3.4.1로 업그레이드 및 X64 Apple 타깃 제거 (#6166)

### 수정
- [IntelliJ Plugin] VFS 새로고침 이벤트 중 EDT에서 파일 타입 감지가 블로킹되어 발생하던 IDE 프리징 문제 수정
- [SQLite Dialect] JSON 경로 연산자 사용 시 Sqlite 3.38 컴파일 오류 수정 (@griffio 기여의 #6070)
- [SQLite Dialect] 커스텀 컬럼 타입을 사용할 때 group_concat 함수에 String 타입을 사용하도록 수정 (@griffio 기여의 #6082)
- [Gradle Plugin] 복잡한 스키마에서 멈추지 않도록 `VerifyMigrationTask` 성능 개선 (@Lightwood13 기여의 #6073)
- [Intellij Plugin] 플러그인 초기화 예외 수정 및 지원 중단된 메서드 업데이트 (@griffio 기여의 #6040)
- [Gradle Plugin] Android Gradle Plugin의 내장 Kotlin과의 호환성 수정 (#6139)

## [2.3.1] - 2025-03-12 {id="2-3-1-2025-03-12"}
[2.3.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.1

릴리스 실패. 2.3.2를 사용하세요!

## [2.3.0] - 2025-03-12 {id="2-3-0-2025-03-12"}
[2.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.0

릴리스 실패. 2.3.2를 사용하세요!

## [2.2.1] - 2025-11-13 {id="2-2-1-2025-11-13"}
[2.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.2.1

### 추가
- [PostgreSQL Dialect] Postgres numeric/integer/biginteger 타입 매핑 수정 (@griffio 기여의 #5994)
- [Compiler] CAST가 필요할 때 소스 파일 위치를 포함하도록 컴파일러 오류 메시지 개선 (@griffio 기여의 #5979)
- [PostgreSQL Dialect] Postgres JSON 연산자 경로 추출 지원 추가 (@griffio 기여의 #5971)
- [SQLite Dialect] 공통 테이블 표현식(CTE)을 사용하는 MATERIALIZED 쿼리 플래너 힌트에 대한 SQLite 3.35 지원 추가 (@griffio 기여의 #5961)
- [PostgreSQL Dialect] 공통 테이블 표현식(CTE)을 사용하는 MATERIALIZED 쿼리 플래너 힌트 지원 추가 (@griffio 기여의 #5961)
- [PostgreSQL Dialect] Postgres JSON Aggregate FILTER 지원 추가 (@griffio 기여의 #5957)
- [PostgreSQL Dialect] Postgres Enums 지원 추가 (@griffio 기여의 #5935)
- [PostgreSQL Dialect] Postgres 트리거 제한적 지원 추가 (@griffio 기여의 #5932)
- [PostgreSQL Dialect] SQL 표현식이 JSON으로 파싱될 수 있는지 확인하는 조건자(predicate) 추가 (@griffio 기여의 #5843)
- [PostgreSQL Dialect] PostgreSQL Comment On 문에 대한 제한적 지원 추가 (@griffio 기여의 #5808)
- [MySQL Dialect] 인덱스 가시성 옵션 지원 추가 (@orenkislev-faire 기여의 #5785)
- [PostgreSql Dialect] TSQUERY 데이터 타입 지원 추가 (@griffio 기여의 #5779)
- [Gradle Plugin] 모듈 추가 시 버전 카탈로그 지원 추가 (@DRSchlaubi 기여의 #5755)

### 변경
- 개발 중인 스냅샷이 이제 https://central.sonatype.com/repository/maven-snapshots/ 의 Central Portal Snapshots 저장소에 게시됩니다.
- [Compiler] 생성자 참조를 사용하여 기본 생성 쿼리를 단순화 (@jonapoul 기여의 #5814)

### 수정
- [Compiler] 공통 테이블 표현식(CTE)을 포함하는 뷰(View) 사용 시 발생하는 스택 오버플로우 수정 (@griffio 기여의 #5928)
- [Gradle Plugin] "New Connection"을 추가하기 위해 SqlDelight 툴 윈도우를 열 때 크래시가 발생하는 문제 수정 (@griffio 기여의 #5906)
- [IntelliJ Plugin] copy-to-sqlite 거터(gutter) 액션에서 스레딩 관련 크래시 방지 (@griffio 기여의 #5901)
- [IntelliJ Plugin] CREATE INDEX 및 CREATE VIEW 스키마 문을 사용할 때 PostgreSQL 방언 관련 문제 수정 (@griffio 기여의 #5772)
- [Compiler] 컬럼 참조 시 FTS 스택 오버플로우 문제 수정 (@griffio 기여의 #5896)
- [Compiler] With Recursive 스택 오버플로우 문제 수정 (@griffio 기여의 #5892)
- [Compiler] Insert|Update|Delete Returning 문에 대한 알림(Notify) 수정 (@griffio 기여의 #5851)
- [Compiler] Long을 반환하는 트랜잭션 블록의 비동기 결과 타입 수정 (@griffio 기여의 #5836)
- [Compiler] SQL 파라미터 바인딩 복잡도를 O(n²)에서 O(n)으로 최적화 (@chenf7 기여의 #5898)
- [SQLite Dialect] SQLite 3.18 누락된 함수 수정 (@griffio 기여의 #5759)

## [2.2.0] - 2025-11-13 {id="2-2-0-2025-11-13"}
[2.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.2.0

아티팩트가 일부만 배포되어 릴리스에 실패했습니다. 2.2.1을 사용하세요!

## [2.1.0] - 2025-05-16 {id="2-1-0-2025-05-16"}
[2.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.1.0

### 추가
- [WASM Driver] 웹 워커 드라이버에 wasmJs 지원 추가 (@IlyaGulya 기여의 #5534)
- [PostgreSQL Dialect] PostgreSQL UnNest Array를 행으로 변환하는 기능 지원 (@griffio 기여의 #5673)
- [PostgreSQL Dialect] PostgreSQL TSRANGE/TSTZRANGE 지원 (@griffio 기여의 #5297)
- [PostgreSQL Dialect] PostgreSQL Right Full Join 지원 (@griffio 기여의 #5086)
- [PostgreSQL Dialect] PostgreSQL 시간 타입에서의 extract 지원 (@griffio 기여의 #5273)
- [PostgreSQL Dialect] PostgreSQL 배열 포함 연산자 지원 (@griffio 기여의 #4933)
- [PostgreSQL Dialect] PostgreSQL 제약 조건 삭제(drop constraint) 지원 (@griffio 기여의 #5288)
- [PostgreSQL Dialect] PostgreSQL 타입 캐스팅 지원 (@griffio 기여의 #5089)
- [PostgreSQL Dialect] 서브쿼리에 대한 PostgreSQL lateral join 연산자 지원 (@griffio 기여의 #5122)
- [PostgreSQL Dialect] PostgreSQL ILIKE 연산자 지원 (@griffio 기여의 #5330)
- [PostgreSQL Dialect] PostgreSQL XML 타입 지원 (@griffio 기여의 #5331)
- [PostgreSQL Dialect] PostgreSQL AT TIME ZONE 지원 (@griffio 기여의 #5243)
- [PostgreSQL Dialect] PostgreSQL order by nulls 지원 (@griffio 기여의 #5199)
- [PostgreSQL Dialect] PostgreSQL 현재 날짜/시간 함수 지원 추가 (@drewd 기여의 #5226)
- [PostgreSQL Dialect] PostgreSQL 정규식 연산자 지원 (@griffio 기여의 #5137)
- [PostgreSQL Dialect] BRIN, GIST 인덱스 추가 (@griffio 기여의 #5059)
- [MySQL Dialect] MySQL 방언을 위한 RENAME INDEX 지원 (@orenkislev-faire 기여의 #5212)
- [JSON Extension] json table 함수에 별칭(alias) 추가 (@griffio 기여의 #5372)

### 변경
- [Compiler] 생성된 쿼리 파일이 단순 변경자(mutator)에 대해 영향을 받은 행 수를 반환하도록 변경 (@MariusVolkhart 기여의 #4578)
- [Native Driver] DELETE, INSERT 및 UPDATE 문에 대한 읽기 전용 플래그를 변경하도록 NativeSqlDatabase.kt 업데이트 (@griffio 기여의 #5680)
- [PostgreSQL Dialect] PgInterval을 String으로 변경 (@griffio 기여의 #5403)
- [PostgreSQL Dialect] PostgreSQL 확장을 구현할 수 있도록 SqlDelight 모듈 지원 (@griffio 기여의 #5677)

### 수정
- [Compiler] 결과가 있는 그룹 문을 실행할 때 쿼리에 알림이 가도록 수정 (@vitorhugods 기여의 #5006)
- [Compiler] SqlDelightModule 타입 리졸버 수정 (@griffio 기여의 #5625)
- [Compiler] 이스케이프된 컬럼이 포함된 객체 삽입(insert object) 문제 수정 (#5503 by @griffio)
- [Compiler] 올바른 라인 및 문자 위치를 포함하여 경로 링크를 클릭할 수 있도록 컴파일러 오류 메시지 개선 (@vanniktech 기여의 #5604)
- [Compiler] 5298 이슈 수정: 키워드를 테이블 이름으로 사용할 수 있도록 허용
- [Compiler] 이름이 지정된 execute 수정 및 테스트 추가
- [Compiler] 초기화 문을 정렬할 때 외래 키 테이블 제약 조건을 고려하도록 수정 (@TheMrMilchmann 기여의 #5325)
- [Compiler] 탭 문자가 포함되어 있을 때 오류 밑줄이 올바르게 정렬되도록 수정 (@drewd 기여의 #5224)
- [JDBC Driver] 트랜잭션 종료 시 connectionManager의 메모리 누수 수정
- [JDBC Driver] 문서에 언급된 대로 트랜잭션 내에서 SQLite 마이그레이션 실행 (@morki 기여의 #5218)
- [JDBC Driver] 트랜잭션 커밋 / 롤백 후 커넥션 누수 수정 (@morki 기여의 #5205)
- [Gradle Plugin] `GenerateSchemaTask` 전에 `DriverInitializer` 실행 (@nwagu 기여의 #5562)
- [Runtime] 실제 드라이버가 비동기(Async)일 때 LogSqliteDriver에서 발생하는 크래시 수정 (@edenman 기여의 #5723)
- [Runtime] StringBuilder 용량 수정 (@janbina 기여의 #5192)
- [PostgreSQL Dialect] PostgreSQL create or replace view 지원 수정 (@griffio 기여의 #5407)
- [PostgreSQL Dialect] PostgreSQL to_json 지원 수정 (@griffio 기여의 #5606)
- [PostgreSQL Dialect] PostgreSQL numeric 리졸버 수정 (@griffio 기여의 #5399)
- [PostgreSQL Dialect] SQLite 윈도우 함수 지원 수정 (@griffio 기여의 #2799)
- [PostgreSQL Dialect] PostgreSQL SELECT DISTINCT ON 지원 수정 (@griffio 기여의 #5345)
- [PostgreSQL Dialect] alter table add column if not exists 지원 수정 (@griffio 기여의 #5309)
- [PostgreSQL Dialect] PostgreSQL 비동기 바인드 파라미터 수정 (@griffio 기여의 #5313)
- [PostgreSQL Dialect] PostgreSQL 불리언 리터럴 지원 수정 (@griffio 기여의 #5262)
- [PostgreSQL Dialect] PostgreSQL 윈도우 함수 지원 수정 (@griffio 기여의 #5155)
- [PostgreSQL Dialect] PostgreSQL isNull isNotNull 타입 지원 수정 (@griffio 기여의 #5173)
- [PostgreSQL Dialect] PostgreSQL select distinct 지원 수정 (@griffio 기여의 #5172)
- [Paging Extension] Paging 새로고침 초기 로드 문제 수정 (@evant 기여의 #5615)
- [Paging Extension] macOS 네이티브 타깃 추가 (@vitorhugods 기여의 #5324)
- [IntelliJ Plugin] K2 지원

## [2.0.2] - 2024-04-05 {id="2-0-2-2024-04-05"}
[2.0.2]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.2

### 추가
- [PostgreSQL Dialect] PostgreSQL STRING_AGG 함수 추가 (@anddani 기여의 #4950)
- [PostgreSQL Dialect] pg 방언에 SET 문 추가 (@de-luca 기여의 #4927)
- [PostgreSQL Dialect] PostgreSQL alter column 시퀀스 매개변수 추가 (@griffio 기여의 #4916)
- [PostgreSQL Dialect] insert 문에 대한 PostgreSQL alter column default 지원 추가 (@griffio 기여의 #4912)
- [PostgreSQL Dialect] PostgreSQL alter sequence 및 drop sequence 추가 (@griffio 기여의 #4920)
- [PostgreSQL Dialect] Postgres 정규식 함수 정의 추가 (@MariusVolkhart 기여의 #5025)
- [PostgreSQL Dialect] GIN 문법 추가 (@griffio 기여의 #5027)

### 변경
- [IDE Plugin] 최소 지원 버전을 2023.1 / Android Studio Iguana로 변경
- [Compiler] encapsulatingType에서 타입 nullability 재정의 허용 (@eygraber 기여의 #4882)
- [Compiler] SELECT *에 대해 컬럼 이름을 인라인 처리
- [Gradle Plugin] processIsolation으로 전환 (@nwagu 기여의 #5068)
- [Android Runtime] Android minSDK를 21로 상향 (@hfhbd 기여의 #5094)
- [Drivers] 방언 작성자를 위해 더 많은 JDBC/R2DBC 문 메서드 노출 (@hfhbd 기여의 #5098)

### 수정
- [PostgreSQL Dialect] PostgreSQL alter table alter column 수정 (@griffio 기여의 #4868)
- [PostgreSQL Dialect] 테이블 모델의 누락된 import 문제 수정 (@griffio 기여의 #4885)
- [PostgreSQL Dialect] PostgreSQL 기본 제약 조건 함수 수정 (@griffio 기여의 #4934)
- [PostgreSQL Dialect] 마이그레이션 중 alter table rename column에서 발생하는 PostgreSQL 클래스 캐스팅 오류 수정 (@griffio 기여의 #4880)
- [PostgreSQL Dialect] PostgreSQL 확장 생성(create extension) 문제 수정 (@griffio 기여의 #4541)
- [PostgreSQL Dialect] PostgreSQL Primary Key 추가 시 not nullable 타입 문제 수정 (@griffio 기여의 #5020)
- [PostgreSQL Dialect] 집계 표현식 관련 문제 수정 (@griffio 기여의 #5071)
- [PostgreSQL Dialect] PostgreSQL json 관련 문제 수정 (@griffio 기여의 #5030)
- [PostgreSQL Dialect] PostgreSQL json 연산자 관련 문제 수정 (@griffio 기여의 #5041)
- [PostgreSQL Dialect] #5040에 대한 json 연산자 바인딩 문제 수정 (@griffio 기여의 #5100)
- [PostgreSQL Dialect] tsvector 관련 문제 수정 (@griffio 기여의 #5104)
- [PostgreSQL Dialect] PostgreSQL UPDATE FROM 문에 대한 컬럼 인접성(adjacency) 문제 수정 (@griffio 기여의 #5035)
- [SQLite Dialect] SQLite alter table rename column 문제 수정 (@griffio 기여의 #4899)
- [IDE Plugin] 오류 핸들러 크래시 수정 (@aperfilyev 기여의 #4988)
- [IDE Plugin] IDEA 2023.3에서 BugSnag 초기화 실패 문제 해결 (by @aperfilyev)
- [IDE Plugin] 플러그인을 통해 IntelliJ에서 .sq 파일을 열 때 발생하는 PluginException 수정 (by @aperfilyev)
- [IDE Plugin] Kotlin 라이브러리가 이미 플러그인 종속성으로 존재하므로 IntelliJ 플러그인에 번들로 포함하지 않도록 수정 (#5126)
- [IDE Plugin] stream 대신 extensions 배열 사용하도록 수정 (#5127)

## [2.0.1] - 2023-12-01 {id="2-0-1-2023-12-01"}
[2.0.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.1

### 추가
- [Compiler] SELECT 수행 시 multi-column-expr 지원 추가 (@Adriel-M 기여의 #4453)
- [PostgreSQL Dialect] PostgreSQL CREATE INDEX CONCURRENTLY 지원 추가 (@griffio 기여의 #4531)
- [PostgreSQL Dialect] PostgreSQL CTE 보조 문들이 서로를 참조할 수 있도록 허용 (@griffio 기여의 #4493)
- [PostgreSQL Dialect] 이항 표현식 및 sum에 대한 PostgreSQL 타입 지원 추가 (@Adriel-M 기여의 #4539)
- [PostgreSQL Dialect] PostgreSQL SELECT DISTINCT ON 문법 지원 추가 (@griffio 기여의 #4584)
- [PostgreSQL Dialect] SELECT 문에서 PostgreSQL JSON 함수 지원 추가 (@MariusVolkhart 기여의 #4590)
- [PostgreSQL Dialect] generate_series PostgreSQL 함수 추가 (@griffio 기여의 #4717)
- [PostgreSQL Dialect] 추가적인 Postgres String 함수 정의 추가 (@MariusVolkhart 기여의 #4752)
- [PostgreSQL Dialect] min 및 max 집계 함수에 DATE PostgreSQL 타입 추가 (@anddani 기여의 #4816)
- [PostgreSQL Dialect] SqlBinaryExpr에 PostgreSQL 시간 타입 추가 (@griffio 기여의 #4657)
- [PostgreSQL Dialect] postgres 방언에 TRUNCATE 추가 (@de-luca 기여의 #4817)
- [SQLite 3.35 Dialect] 순서대로 평가되는 다중 ON CONFLICT 절 허용 (@griffio 기여의 #4551)
- [JDBC Driver] 더욱 편리한 SQL 편집을 위해 Language 어노테이션 추가 (@MariusVolkhart 기여의 #4602)
- [Native Driver] linuxArm64 지원 추가 (@hfhbd 기여의 #4792)
- [Android Driver] AndroidSqliteDriver에 windowSizeBytes 매개변수 추가 (@BoD 기여의 #4804)
- [Paging3 Extension] OffsetQueryPagingSource에 initialOffset 추가 (@MohamadJaara 기여의 #4802)

### 변경
- [Compiler] 적절한 경우 Kotlin 타입을 우선적으로 사용 (@eygraber 기여의 #4517)
- [Compiler] 값 타입(value type) insert를 수행할 때 항상 컬럼 이름을 포함하도록 변경 (#4864)
- [PostgreSQL Dialect] PostgreSQL 방언의 실험적(experimental) 상태 제거 (@hfhbd 기여의 #4443)
- [PostgreSQL Dialect] PostgreSQL 타입 관련 문서 업데이트 (@MariusVolkhart 기여의 #4569)
- [R2DBC Driver] PostgreSQL에서 정수 데이터 타입을 처리할 때의 성능 최적화 (@MariusVolkhart 기여의 #4588)

### 제거 {id="removed"}
- [SQLite Javascript Driver] sqljs-driver 제거 (@dellisd 기여의 #4613, #4670)

### 수정
- [Compiler] 반환값이 있고 파라미터가 없는 그룹화된 문의 컴파일 문제 수정 (@griffio 기여의 #4699)
- [Compiler] SqlBinaryExpr와의 인자 바인딩 문제 수정 (@griffio 기여의 #4604)
- [IDE Plugin] 설정된 경우 IDEA 프로젝트 JDK를 사용하도록 수정 (@griffio 기여의 #4689)
- [IDE Plugin] IDEA 2023.2 이상에서 "Unknown element type: TYPE_NAME" 오류가 발생하던 문제 수정 (#4727)
- [IDE Plugin] 2023.2와의 일부 호환성 문제 수정
- [Gradle Plugin] verifyMigrationTask Gradle 태스크 문서 수정 (@joshfriend 기여의 #4713)
- [Gradle Plugin] 데이터베이스를 검증하기 전에 사용자가 데이터베이스 생성을 할 수 있도록 안내하는 Gradle 태스크 출력 메시지 추가 (@jingwei99 기여의 #4684)
- [PostgreSQL Dialect] PostgreSQL 컬럼의 이름을 여러 번 변경할 때 발생하던 문제 수정 (@griffio 기여의 #4566)
- [PostgreSQL Dialect] PostgreSQL alter column nullability 문제 수정 (@griffio 기여의 #4831)
- [PostgreSQL Dialect] alter table alter column 관련 문제 수정 (@griffio 기여의 #4846)
- [PostgreSQL Dialect] PostgreSQL 시퀀스 관련 문제 수정 (@griffio 기여의 #4528)
- [SQLite Dialect] 컬럼 표현식에 JSON 이항 연산자를 사용할 수 있도록 허용 (@eygraber 기여의 #4776)
- [SQLite Dialect] 동일한 이름의 컬럼이 여러 개 발견되는 Update From의 오탐지 수정 (@eygraber 기여의 #4777)
- [Native Driver] 이름이 지정된 인메모리 데이터베이스 지원 (@05nelsonm 기여의 #4662)
- [Native Driver] 쿼리 리스너 컬렉션에 대한 스레드 안전성 보장 (@kpgalligan 기여의 #4567)
- [JDBC Driver] ConnectionManager의 커넥션 누수 수정 (@MariusVolkhart 기여의 #4589)
- [JDBC Driver] ConnectionManager 타입을 선택할 때 JdbcSqliteDriver url 파싱 문제 수정 (@05nelsonm 기여의 #4656)

## [2.0.0] - 2023-07-26 {id="2-0-0-2023-07-26"}
[2.0.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0

### 추가
- [MySQL Dialect] MySQL: IF 표현식에서 timestamp/bigint 지원 (@shellderp 기여의 #4329)
- [MySQL Dialect] MySQL: now 추가 (@hfhbd 기여의 #4431)
- [Web Driver] NPM 패키지 배포 활성화 (#4364)
- [IDE Plugin] Gradle tooling 연결 실패 시 사용자가 스택 트레이스를 볼 수 있도록 허용 (#4383)

### 변경
- [Sqlite Driver] JdbcSqliteDriver에 대한 스키마 마이그레이션 사용법 단순화 (@morki 기여의 #3737)
- [R2DBC Driver] 실제 비동기 R2DBC 커서 지원 (@hfhbd 기여의 #4387)

### 수정
- [IDE Plugin] 필요할 때까지 데이터베이스 프로젝트 서비스를 인스턴스화하지 않도록 수정 (#4382)
- [IDE Plugin] find usages 중 프로세스 취소 처리 지원 (#4340)
- [IDE Plugin] 비동기 코드의 IDE 생성 문제 수정 (#4406)
- [IDE Plugin] 패키지 구조 어셈블리를 EDT 외부에서 1회만 계산되도록 이동 (#4417)
- [IDE Plugin] 2023.2에서 Kotlin 타입 확인에 올바른 스텁 인덱스 키 사용 (#4416)
- [IDE Plugin] 검색을 수행하기 전에 인덱스가 준비될 때까지 대기하도록 수정 (#4419)
- [IDE Plugin] 인덱스를 사용할 수 없는 경우 goto를 수행하지 않도록 수정 (#4420)
- [Compiler] 그룹화된 문의 결과 표현식 수정 (#4378)
- [Compiler] 인터페이스 타입으로 가상 테이블을 사용하지 않도록 수정 (@hfhbd 기여의 #4427)

## [2.0.0-rc02] - 2023-06-27 {id="2-0-0-rc02-2023-06-27"}
[2.0.0-rc02]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-rc02

### 추가
- [MySQL Dialect] 소문자 날짜 타입 및 날짜 타입에 대한 min, max 지원 (@shellderp 기여의 #4243)
- [MySQL Dialect] 이항 표현식 및 sum에 대한 MySQL 타입 지원 (@shellderp 기여의 #4254)
- [MySQL Dialect] 표시 너비(display width)가 없는 부호 없는 정수(unsigned ints) 지원 (@shellderp 기여의 #4306)
- [MySQL Dialect] LOCK IN SHARED MODE 지원
- [PostgreSQL Dialect] min max에 boolean 및 Timestamp 추가 (@griffio 기여의 #4245)
- [PostgreSQL Dialect] Postgres: 윈도우 함수 지원 추가 (@hfhbd 기여의 #4283)
- [Runtime] 런타임에 linuxArm64, androidNative, watchosDeviceArm 타깃 추가 (@hfhbd 기여의 #4258)
- [Paging Extension] 페이징 확장에 linux 및 mingw x64 타깃 추가 (@chippman 기여의 #4280)

### 변경
- [Gradle Plugin] Android API 34에 대한 자동 방언 지원 추가 (#4251)
- [Paging Extension] QueryPagingSource에서 SuspendingTransacter 지원 추가 (@daio 기여의 #4292)
- [Runtime] addListener API 개선 (@hfhbd 기여의 #4244)
- [Runtime] 마이그레이션 버전으로 Long 사용 (@hfhbd 기여의 #4297)

### 수정
- [Gradle Plugin] 생성된 소스에 대해 안정적인 출력 경로 사용 (@joshfriend 기여의 #4269)
- [Gradle Plugin] Gradle 관련 미세 수정 (@3flex 기여의 #4222)

## [2.0.0-rc01] - 2023-05-29 {id="2-0-0-rc01-2023-05-29"}
[2.0.0-rc01]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-rc01

### 추가
- [Paging] 페이징 확장에 js browser 타깃 추가 (@sproctor 기여의 #3843)
- [Paging] androidx-paging3 확장에 iosSimulatorArm64 타깃 추가 (#4117)
- [PostgreSQL Dialect] gen_random_uuid() 지원 및 테스트 추가 (@davidwheeler123 기여의 #3855)
- [PostgreSQL Dialect] Alter table add constraint postgres 지원 (@griffio 기여의 #4116)
- [PostgreSQL Dialect] Alter table add constraint check 지원 (@griffio 기여의 #4120)
- [PostgreSQL Dialect] PostgreSQL 문자열 길이 함수 추가 (@griffio 기여의 #4121)
- [PostgreSQL Dialect] PostgreSQL 컬럼 기본값 interval 추가 (@griffio 기여의 #4142)
- [PostgreSQL Dialect] PostgreSQL interval 컬럼 결과 추가 (@griffio 기여의 #4152)
- [PostgreSQL Dialect] PostgreSQL Alter Column 추가 (@griffio 기여의 #4165)
- [PostgreSQL Dialect] PostgreSQL: date_part 추가 (@hfhbd 기여의 #4198)
- [MySQL Dialect] SQL 문자열 길이 함수 추가 (@griffio 기여의 #4134)
- [IDE Plugin] sqldelight 디렉토리 추천 추가 (@aperfilyev 기여의 #3976)
- [IDE Plugin] 프로젝트 트리에서 중간 패키지 압축 표시 (@aperfilyev 기여의 #3992)
- [IDE Plugin] join 절 자동 완성 추가 (@aperfilyev 기여의 #4086)
- [IDE Plugin] View 생성 인텐션 및 라이브 템플릿 추가 (@aperfilyev 기여의 #4074)
- [IDE Plugin] DELETE 또는 UPDATE 내에서 WHERE 절 누락 시 경고 표시 (@aperfilyev 기여의 #4058)
- [Gradle Plugin] typesafe 프로젝트 접근자 활성화 (@hfhbd 기여의 #4005)

### 변경
- [Gradle Plugin] ServiceLoader 메커니즘을 통해 VerifyMigrationTask에 DriverInitializer를 등록할 수 있도록 허용 (@C2H6O 기여의 #3986)
- [Gradle Plugin] 명시적 컴파일러 환경(explicit compiler env) 생성 (@hfhbd 기여의 #4079)
- [JS Driver] 웹 워커 드라이버를 별도의 아티팩트로 분리
- [JS Driver] JsWorkerSqlCursor를 외부에 노출하지 않도록 수정 (@hfhbd 기여의 #3874)
- [JS Driver] sqljs 드라이버 배포 비활성화 (#4108)
- [Runtime] 동기식 드라이버에는 동기식 스키마 초기화 프로그램이 필요하도록 강제 (#4013)
- [Runtime] Cursor의 비동기 지원 개선 (#4102)
- [Runtime] 지원 중단된 타깃 제거 (@hfhbd 기여의 #4149)
- [Runtime] 구 메모리 모델(old MM) 지원 제거 (@hfhbd 기여의 #4148)

### 수정
- [R2DBC Driver] R2DBC: 드라이버 종료(closing) 대기 처리 (@hfhbd 기여의 #4139)
- [Compiler] 마이그레이션의 PRAGMA를 database create(SqlDriver)에 포함하도록 수정 (@MariusVolkhart 기여의 #3845)
- [Compiler] RETURNING 절에 대한 코드 생성 수정 (@MariusVolkhart 기여의 #3872)
- [Compiler] 가상 테이블에 대한 타입을 생성하지 않도록 수정 (#4015)
- [Gradle Plugin] Gradle 플러그인 사용성 개선 (@zacsweers 기여의 #3930)
- [IDE Plugin] 확인되지 않는 Kotlin 타입 문제 해결 (@aperfilyev 기여의 #3924)
- [IDE Plugin] 와일드카드 확장 인텐션이 한정자(qualifier)와 함께 동작하도록 수정 (@aperfilyev 기여의 #3979)
- [IDE Plugin] java home이 누락된 경우 사용 가능한 jdk를 사용하도록 수정 (@aperfilyev 기여의 #3925)
- [IDE Plugin] 패키지 이름에 대한 find usages 문제 수정 (#4010)
- [IDE Plugin] 잘못된 요소에 대해 자동 import를 표시하지 않도록 수정 (#4008)
- [IDE Plugin] 방언이 누락된 경우 처리(resolve)하지 않도록 수정 (#4009)
- [IDE Plugin] 무효화된 상태(invalidated state)에서는 IDE의 컴파일러 실행을 무시하도록 수정 (#4016)
- [IDE Plugin] IntelliJ 2023.1 지원 추가 (@madisp 기여의 #4037)
- [IDE Plugin] 컬럼 이름 변경 시 명명된 인자(named argument) 사용처 이름 변경 처리 (@aperfilyev 기여의 #4027)
- [IDE Plugin] 마이그레이션 추가 팝업 문제 수정 (@aperfilyev 기여의 #4105)
- [IDE Plugin] 마이그레이션 파일에서 SchemaNeedsMigrationInspection 비활성화 (@aperfilyev 기여의 #4106)
- [IDE Plugin] 마이그레이션 생성 시 타입 이름 대신 SQL 컬럼 이름을 사용하도록 수정 (@aperfilyev 기여의 #4112)

## [2.0.0-alpha05] - 2023-01-20 {id="2-0-0-alpha05-2023-01-20"}
[2.0.0-alpha05]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha05

### 추가
- [Paging] 멀티플랫폼 페이징 확장 (by @jeffdgr8)
- [Runtime] Listener 인터페이스에 fun 변경자 추가
- [SQLite Dialect] SQLite 3.33 지원 추가 (UPDATE FROM) (by @eygraber)
- [PostgreSQL Dialect] PostgreSQL에서 UPDATE FROM 지원 (by @eygraber)

### 변경
- [RDBC Driver] Connection 노출 (by @hfhbd)
- [Runtime] 마이그레이션 콜백을 메인 `migrate` 함수로 이동
- [Gradle Plugin] 다운스트림 프로젝트로부터 Configuration 숨김 처리
- [Gradle Plugin] IntelliJ만 셰이딩(shade)하도록 변경 (by @hfhbd)
- [Gradle Plugin] Kotlin 1.8.0-Beta 지원 및 멀티 버전 Kotlin 테스트 추가 (by @hfhbd)

### 수정
- [RDBC Driver] 대신 javaObjectType 사용 (by @hfhbd)
- [RDBC Driver] bindStatement의 원시 타입 null 값 처리 수정 (by @hfhbd)
- [RDBC Driver] R2DBC 1.0 지원 (by @hfhbd)
- [PostgreSQL Dialect] Postgres: 타입 매개변수가 없는 Array 처리 수정 (by @hfhbd)
- [IDE Plugin] IntelliJ 버전을 221.6008.13으로 상향 (by @hfhbd)
- [Compiler] 순수 뷰(pure view)로부터 재귀적 원본 테이블 확인 (by @hfhbd)
- [Compiler] 테이블 외래 키 절의 값 클래스 사용 (by @hfhbd)
- [Compiler] 괄호 없는 바인드 표현식을 지원하도록 SelectQueryGenerator 수정 (by @bellatoris)
- [Compiler] 트랜잭션 사용 시 ${name}Indexes 변수가 중복 생성되던 문제 수정 (by @sachera)

## [1.5.5] - 2023-01-20 {id="1-5-5-2023-01-20"}
[1.5.5]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.5

이 버전은 Kotlin 1.8 및 IntelliJ 2021+ 호환성을 위한 릴리스이며, JDK 17을 지원합니다.

## [1.5.4] - 2022-10-06 {id="1-5-4-2022-10-06"}
[1.5.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.4

이 버전은 Kotlin 1.7.20 및 AGP 7.3.0 호환성 업데이트입니다.

## [2.0.0-alpha04] - 2022-10-03 {id="2-0-0-alpha04-2022-10-03"}
[2.0.0-alpha04]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha04

### 호환성을 깨뜨리는 변경 사항 (Breaking Changes) {id="breaking-changes"}

- Paging 3 확장 API가 카운트에 int 타입만 허용하도록 변경되었습니다.
- 코루틴 확장에서 기본 디스패처 대신 디스패처를 직접 전달해야 합니다.
- 방언(Dialect) 및 드라이버(Driver) 클래스가 final이 되었으므로 대신 위임(delegation)을 사용하세요.

### 추가
- [HSQL Dialect] Hsql: Insert에서 생성된 컬럼에 DEFAULT 사용 지원 (@hfhbd 기여의 #3372)
- [PostgreSQL Dialect] PostgreSQL: INSERT에서 생성된 컬럼에 DEFAULT 사용 지원 (@hfhbd 기여의 #3373)
- [PostgreSQL Dialect] PostgreSQL에 NOW() 추가 (@hfhbd 기여의 #3403)
- [PostgreSQL Dialect] PostgreSQL에 NOT 연산자 추가 (@hfhbd 기여의 #3504)
- [Paging] *QueryPagingSource에 CoroutineContext 전달 허용 (#3384)
- [Gradle Plugin] 방언에 대한 더 나은 버전 카탈로그 지원 추가 (#3435)
- [Native Driver] NativeSqliteDriver의 DatabaseConfiguration 생성에 훅을 걸 수 있는 콜백 추가 (@svenjacobs 기여의 #3512)

### 변경
- [Paging] KeyedQueryPagingSource 기반의 QueryPagingSource 함수에 기본 디스패처 추가 (#3385)
- [Paging] OffsetQueryPagingSource가 Int만 사용하도록 변경 (#3386)
- [Async Runtime] await*를 상위 클래스 ExecutableQuery로 이동 (@hfhbd 기여의 #3524)
- [Coroutines Extensions] flow 확장의 기본 매개변수 제거 (#3489)

### 수정
- [Gradle Plugin] Kotlin 1.7.20으로 업데이트 (@zacsweers 기여의 #3542)
- [R2DBC Driver] 항상 값을 전송하지 않는 R2DBC 변경 사항 적용 (@hfhbd 기여의 #3525)
- [HSQL Dialect] Hsql 사용 시 sqlite VerifyMigrationTask가 실패하던 문제 수정 (@hfhbd 기여의 #3380)
- [Gradle Plugin] 지연 구성(lazy configuration) API를 사용하도록 태스크 변환 (by @3flex)
- [Gradle Plugin] Kotlin 1.7.20에서의 NPE 방지 (@ZacSweers 기여의 #3398)
- [Gradle Plugin] squash migrations 태스크의 설명 수정 (#3449)
- [IDE Plugin] 최신 Kotlin 플러그인에서의 NoSuchFieldError 수정 (@madisp 기여의 #3422)
- [IDE Plugin] IDEA: UnusedQueryInspection - ArrayIndexOutOfBoundsException 수정 (@vanniktech 기여의 #3427)
- [IDE Plugin] 구버전 Kotlin 플러그인 참조에 리플렉션 사용
- [Compiler] 확장 함수가 포함된 커스텀 방언이 import를 생성하지 않던 문제 수정 (@hfhbd 기여의 #3338)
- [Compiler] CodeBlock.of("${CodeBlock.toString()}") 이스케이프 수정 (@hfhbd 기여의 #3340)
- [Compiler] 마이그레이션에서 비동기 execute 문 대기(await) 처리 (#3352)
- [Compiler] AS 수정 (@hfhbd 기여의 #3370)
- [Compiler] `getObject` 메서드가 실제 타입의 자동 완성을 지원하도록 수정 (@robxyy 기여의 #3401)
- [Compiler] 비동기 그룹화된 returning 문에 대한 코드 생성 수정 (#3411)
- [Compiler] 가능한 경우 바인드 파라미터의 Kotlin 타입을 추론하고, 불가능하면 개선된 오류 메시지와 함께 실패하도록 수정 (@hfhbd 기여의 #3413)
- [Compiler] ABS("foo") 허용 안 함 (@hfhbd 기여의 #3430)
- [Compiler] 다른 파라미터로부터 Kotlin 타입 추론 지원 (@hfhbd 기여의 #3431)
- [Compiler] 항상 데이터베이스 구현체를 생성하도록 수정 (@hfhbd 기여의 #3540)
- [Compiler] javaDoc 검증 완화 및 커스텀 매퍼 함수에도 javaDoc 추가 (@hfhbd 기여의 #3554)
- [Compiler] 바인딩의 DEFAULT 수정 (by @hfhbd)
- [Paging] Paging 3 수정 (#3396)
- [Paging] Long을 사용하는 OffsetQueryPagingSource 생성 허용 (#3409)
- [Paging] Dispatchers.Main을 정적으로 교체하지 않도록 수정 (#3428)

## [2.0.0-alpha03] - 2022-06-17 {id="2-0-0-alpha03-2022-06-17"}
[2.0.0-alpha03]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha03

### 호환성을 깨뜨리는 변경 사항 (Breaking Changes)

- 방언은 이제 실제 Gradle 종속성처럼 참조됩니다.
```groovy
sqldelight {
  MyDatabase {
    dialect("app.cash.sqldelight:postgres-dialect:2.0.0-alpha03")
  }
}
```
- `AfterVersionWithDriver` 타입이 제거되고, 항상 드라이버를 포함하는 `AfterVersion`으로 대체되었습니다.
- `Schema` 타입은 더 이상 `SqlDriver`의 하위 타입이 아닙니다.
- 이제 `PreparedStatement` API는 0 기반 인덱스(zero-based index)로 호출됩니다.

### 추가
- [IDE Plugin] 실행 중인 데이터베이스에 대해 SQLite, MySQL, PostgreSQL 명령을 실행하는 기능 추가 (@aperfilyev 기여의 #2718)
- [IDE Plugin] Android Studio DB inspector 지원 추가 (@aperfilyev 기여의 #3107)
- [Runtime] 비동기 드라이버 지원 추가 (@dellisd 기여의 #3168)
- [Native Driver] 새로운 Kotlin Native 메모리 모델 지원 (@kpgalligan 기여의 #3177)
- [JS Driver] SqlJs 워커용 드라이버 추가 (@dellisd 기여의 #3203)
- [Gradle Plugin] SQLDelight 태스크용 클래스패스 노출
- [Gradle Plugin] 마이그레이션 통합(squashing migrations)을 위한 Gradle 태스크 추가
- [Gradle Plugin] 마이그레이션 검사 중 스키마 정의를 무시하는 플래그 추가
- [MySQL Dialect] MySQL에서 FOR SHARE 및 FOR UPDATE 지원 (#3098)
- [MySQL Dialect] MySQL 인덱스 힌트 지원 (#3099)
- [PostgreSQL Dialect] date_trunc 추가 (@hfhbd 기여의 #3295)
- [JSON Extensions] JSON 테이블 함수 지원 (#3090)

### 변경
- [Runtime] 드라이버가 없는 AfterVersion 타입 제거 (#3091)
- [Runtime] Schema 타입을 최상위로 이동
- [Runtime] 서드파티 구현을 지원하도록 방언 및 리졸버를 open으로 변경 (@hfhbd 기여의 #3232)
- [Compiler] 실패 보고서에 컴파일에 사용된 방언 정보 포함 (#3086)
- [Compiler] 사용되지 않는 어댑터 건너뛰기 (@eygraber 기여의 #3162)
- [Compiler] PrepareStatement에서 0 기반 인덱스 사용 (@hfhbd 기여의 #3269)
- [Gradle Plugin] 방언을 문자열 대신 적절한 Gradle 종속성으로 설정하도록 변경 (#3085)
- [Gradle Plugin] Gradle Verify Task: 데이터베이스 파일이 누락된 경우 예외 발생 (@vanniktech 기여의 #3126)

### 수정
- [Gradle Plugin] Gradle 플러그인 사소한 정리 및 개선 (@3flex 기여의 #3171)
- [Gradle Plugin] 생성된 디렉토리에 AGP 문자열을 사용하지 않도록 수정
- [Gradle Plugin] AGP 네임스페이스 속성 사용 (#3220)
- [Gradle Plugin] kotlin-stdlib를 Gradle 플러그인의 런타임 종속성으로 추가하지 않도록 수정 (@mbonnin 기여의 #3245)
- [Gradle Plugin] 멀티플랫폼 구성 단순화 (@mbonnin 기여의 #3246)
- [Gradle Plugin] JS 전용 프로젝트 지원 (@hfhbd 기여의 #3310)
- [IDE Plugin] Gradle tooling API에 java home 사용 (#3078)
- [IDE Plugin] IDE 플러그인 내에서 올바른 classLoader로 JDBC 드라이버를 로드하도록 수정 (#3080)
- [IDE Plugin] 이미 존재하는 PSI 변경 중 오류를 방지하기 위해 무효화 전에 파일 요소를 null로 표시 (#3082)
- [IDE Plugin] ALTER TABLE 문에서 새 테이블 이름의 사용처를 찾을 때 크래시가 발생하지 않도록 수정 (#3106)
- [IDE Plugin] 검사기(inspectors)를 최적화하고 예상되는 예외 타입에 대해 조용히 실패하도록 처리 (#3121)
- [IDE Plugin] 생성된 디렉토리여야 하는 파일 삭제 (#3198)
- [IDE Plugin] 안전하지 않은 연산자 호출 수정
- [Compiler] RETURNING 문이 포함된 update 및 delete가 쿼리를 실행하도록 보장 (#3084)
- [Compiler] 복합 select(compound selects)에서 인자 타입을 올바르게 추론하도록 수정 (#3096)
- [Compiler] 공통 테이블은 데이터 클래스를 생성하지 않으므로 반환하지 않도록 수정 (#3097)
- [Compiler] 최상위 마이그레이션 파일을 더 빠르게 찾도록 개선 (#3108)
- [Compiler] 파이프 연산자에서 nullability를 올바르게 상속하도록 수정
- [Compiler] ANSI SQL 함수인 iif 지원
- [Compiler] 빈 쿼리 파일을 생성하지 않도록 수정 (@hfhbd 기여의 #3300)
- [Compiler] 물음표만 있는 어댑터 처리 수정 (@hfhbd 기여의 #3314)
- [PostgreSQL Dialect] Postgres 기본 키 컬럼은 항상 non-null 처리 (#3092)
- [PostgreSQL Dialect] 여러 테이블에서 동일한 이름을 복사할 때 발생하는 문제 수정 (@hfhbd 기여의 #3297)
- [SQLite 3.35 Dialect] 수정된 테이블에서 인덱싱된 컬럼을 삭제할 때만 오류를 표시하도록 수정 (@eygraber 기여의 #3158)

## [2.0.0-alpha02] - 2022-04-13 {id="2-0-0-alpha02-2022-04-13"}
[2.0.0-alpha02]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha02

### 호환성을 깨뜨리는 변경 사항 (Breaking Changes)

- `app.cash.sqldelight.runtime.rx`가 사용된 모든 곳을 `app.cash.sqldelight.rx2`로 변경해야 합니다.

### 추가
- [Compiler] 그룹화된 문의 끝에서 returning 지원
- [Compiler] 방언 모듈을 통한 컴파일러 확장 지원 및 SQLite JSON 확장 추가 (#1379, #2087)
- [Compiler] 값을 반환하는 PRAGMA 문 지원 (#1106)
- [Compiler] 표시된 컬럼에 대한 값 타입(value types) 생성 지원
- [Compiler] 낙관적 락(optimistic locks) 및 유효성 검사 지원 추가 (#1952)
- [Compiler] 다중 update 문 지원
- [PostgreSQL] PostgreSQL returning 문 지원
- [PostgreSQL] PostgreSQL date 타입 지원
- [PostgreSQL] PostgreSQL interval 지원
- [PostgreSQL] PostgreSQL Boolean 지원 및 alter table에 대한 insert 수정
- [PostgreSQL] PostgreSQL에서 선택적 limit 지원
- [PostgreSQL] PostgreSQL BYTEA 타입 지원
- [PostgreSQL] PostgreSQL serial에 대한 테스트 추가
- [PostgreSQL] PostgreSQL update 문법 지원
- [PostgreSQL] PostgreSQL 배열 타입 지원
- [PostgreSQL] PostgreSQL에서 UUID 타입을 올바르게 저장/조회하도록 지원
- [PostgreSQL] PostgreSQL NUMERIC 타입 지원 (#1882)
- [PostgreSQL] 공통 테이블 표현식(CTE) 내부에서 쿼리 반환 지원 (#2471)
- [PostgreSQL] JSON 관련 연산자 지원
- [PostgreSQL] Postgres Copy 추가 (by @hfhbd)
- [MySQL] MySQL Replace 지원
- [MySQL] NUMERIC/BigDecimal MySQL 타입 지원 (#2051)
- [MySQL] MySQL truncate 문 지원
- [MySQL] MySQL에서 JSON 관련 연산자 지원 (by @eygraber)
- [MySQL] MySQL INTERVAL 지원 (@eygraber 기여의 #2969)
- [HSQL] HSQL 윈도우 기능 추가
- [SQLite] WHERE 절의 nullable 매개변수에 대한 동등성 검사를 대체하지 않도록 수정 (@eygraber 기여의 #1490)
- [SQLite] SQLite 3.35 returning 문 지원 (@eygraber 기여의 #1490)
- [SQLite] GENERATED 절 지원
- [SQLite] SQLite 3.38 방언 지원 추가 (by @eygraber)

### 변경
- [Compiler] 생성된 코드 정리
- [Compiler] 그룹화된 문에서 테이블 매개변수 사용 금지 (#1822)
- [Compiler] 그룹화된 쿼리를 트랜잭션 내에 배치 (#2785)
- [Runtime] 드라이버의 execute 메서드에서 업데이트된 행 수를 반환하도록 변경
- [Runtime] 커넥션에 접근하는 임계 영역(critical section)으로 SqlCursor를 제한 (@andersio 기여의 #2123)
- [Gradle Plugin] 마이그레이션에 대한 스키마 정의 비교 (@841)
- [PostgreSQL] PostgreSQL에서 큰따옴표 사용 금지
- [MySQL] MySQL에서 == 사용 시 오류 발생 (#2673)

### 수정
- [Compiler] 2.0 alpha에서 서로 다른 테이블의 동일한 어댑터 타입으로 인해 컴파일 오류가 발생하던 문제 수정
- [Compiler] upsert 문 컴파일 문제 수정 (#2791)
- [Compiler] 매칭 항목이 여러 개인 경우 select에서 테이블을 사용하도록 쿼리 결과 수정 (#1874, #2313)
- [Compiler] INSTEAD OF 트리거가 있는 뷰의 업데이트 지원 (#1018)
- [Compiler] 함수 이름에서 from 및 for 지원
- [Compiler] 함수 표현식에서 SEPARATOR 키워드 허용
- [Compiler] ORDER BY에서 별칭이 지정된 테이블의 ROWID에 접근할 수 없던 문제 수정
- [Compiler] MySQL의 HAVING 절에서 별칭이 지정된 컬럼 이름이 인식되지 않던 문제 수정
- [Compiler] 잘못된 'Multiple columns found' 오류 수정
- [Compiler] PRAGMA locking_mode = EXCLUSIVE; 설정 불가 문제 수정
- [PostgreSQL] PostgreSQL 컬럼 이름 변경 문제 수정
- [MySQL] UNIX_TIMESTAMP, TO_SECONDS, JSON_ARRAYAGG MySQL 함수가 인식되지 않던 문제 수정
- [SQLite] SQLite 윈도우 기능 수정
- [IDE Plugin] 빈 진행률 표시기(progress indicator)에서 goto 핸들러 실행 (@2990)
- [IDE Plugin] 프로젝트가 구성되지 않은 경우 하이라이트 방문자(highlight visitor)가 실행되지 않도록 보장 (#2981, #2976)
- [IDE Plugin] IDE에서도 전이적으로 생성된 코드가 업데이트되도록 보장 (#1837)
- [IDE Plugin] 방언 업데이트 시 인덱스 무효화

## [2.0.0-alpha01] - 2022-03-31 {id="2-0-0-alpha01-2022-03-31"}
[2.0.0-alpha01]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha01

2.0의 첫 번째 알파 릴리스이며 몇 가지 호환성을 깨뜨리는 변경 사항이 포함되어 있습니다. 향후 더 많은 ABI 변경이 있을 수 있으므로 본 릴리스에 의존하는 라이브러리를 배포하지 마세요(애플리케이션 사용은 괜찮습니다).

### 호환성을 깨뜨리는 변경 사항 (Breaking Changes)

- 첫째, `com.squareup.sqldelight`의 모든 사용처를 `app.cash.sqldelight`로 변경해야 합니다.
- 둘째, `app.cash.sqldelight.android`의 모든 사용처를 `app.cash.sqldelight.driver.android`로 변경해야 합니다.
- 셋째, `app.cash.sqldelight.sqlite.driver`의 모든 사용처를 `app.cash.sqldelight.driver.jdbc.sqlite`로 변경해야 합니다.
- 넷째, `app.cash.sqldelight.drivers.native`의 모든 사용처를 `app.cash.sqldelight.driver.native`로 변경해야 합니다.
- IDE 플러그인은 [alpha 또는 eap 채널](https://plugins.jetbrains.com/plugin/8191-sqldelight/versions/alpha)에 있는 2.X 버전으로 업데이트해야 합니다.
- 방언은 이제 Gradle 내에서 지정할 수 있는 종속성이 되었습니다:

```gradle
sqldelight {
  MyDatabase {
    packageName = "com.example"
    dialect = "app.cash.sqldelight:mysql-dialect:2.0.0-alpha01"
  }
}
```

현재 지원되는 방언은 `mysql-dialect`, `postgresql-dialect`, `hsql-dialect`, `sqlite-3-18-dialect`, `sqlite-3-24-dialect`, `sqlite-3-25-dialect`, `sqlite-3-30-dialect`, `sqlite-3-35-dialect`입니다.

- 이제 원시 타입(Primitive types)을 명시적으로 import해야 하며(예: `INTEGER AS Boolean`의 경우 `import kotlin.Boolean` 필요), 이전에 지원되던 일부 타입은 이제 어댑터가 필요합니다. 원시 어댑터는 대부분의 변환을 위해 `app.cash.sqldelight:primitive-adapters:2.0.0-alpha01`에서 제공됩니다(예: `Integer AS kotlin.Int`를 위한 `IntColumnAdapter`).

### 추가
- [IDE Plugin] 기본적인 마이그레이션 제안 (by @aperfilyev)
- [IDE Plugin] import 힌트 액션 추가 (by @aperfilyev)
- [IDE Plugin] Kotlin 클래스 완성 추가 (by @aperfilyev)
- [Gradle Plugin] Gradle type-safe 프로젝트 접근자를 위한 바로가기 추가 (by @hfhbd)
- [Compiler] 방언에 따른 코드 생성 사용자 정의 (by @MariusVolkhart)
- [JDBC Driver] JdbcDriver에 공통 타입 추가 (by @MariusVolkhart)
- [SQLite] SQLite 3.35 지원 추가 (by @eygraber)
- [SQLite] ALTER TABLE DROP COLUMN 지원 추가 (by @eygraber)
- [SQLite] SQLite 3.30 방언 지원 추가 (by @eygraber)
- [SQLite] SQLite에서 NULLS FIRST/LAST 지원 (by @eygraber)
- [HSQL] generated 절에 대한 HSQL 지원 추가 (by @MariusVolkhart)
- [HSQL] HSQL에서 명명된 파라미터 지원 추가 (by @MariusVolkhart)
- [HSQL] HSQL insert 쿼리 사용자 정의 지원 (by @MariusVolkhart)

### 변경
- [전체] 패키지 이름이 com.squareup.sqldelight에서 app.cash.sqldelight로 변경되었습니다.
- [Runtime] 방언을 별도의 격리된 Gradle 모듈로 이동
- [Runtime] 드라이버 구현 방식의 쿼리 알림(query notification)으로 전환
- [Runtime] 기본 컬럼 어댑터를 별도 모듈로 분리 (#2056, #2060)
- [Compiler] 각 모듈에서 반복하지 않고 쿼리 구현체를 생성하도록 변경
- [Compiler] 생성된 데이터 클래스의 커스텀 toString 생성 제거 (by @PaulWoitaschek)
- [JS Driver] sqljs-driver에서 sql.js 종속성 제거 (by @dellisd)
- [Paging] Android Paging 2 확장 제거
- [IDE Plugin] SQLDelight가 동기화되는 동안 에디터 배너 표시 (#2511)
- [IDE Plugin] 최소 지원 IntelliJ 버전은 2021.1입니다.

### 수정
- [Runtime] 할당 및 포인터 체이싱을 줄이기 위해 리스너 목록을 평탄화(flatten) (by @andersio)
- [IDE Plugin] 오류 위치로 이동할 수 있도록 오류 메시지 수정 (by @hfhbd)
- [IDE Plugin] 누락된 검사 설명 추가 (@aperfilyev 기여의 #2768)
- [IDE Plugin] GotoDeclarationHandler의 예외 수정 (@aperfilyev 기여의 #2531, #2688, #2804)
- [IDE Plugin] import 키워드 하이라이팅 (by @aperfilyev)
- [IDE Plugin] 확인되지 않는 Kotlin 타입 문제 해결 (@aperfilyev 기여의 #1678)
- [IDE Plugin] 확인되지 않는 패키지에 대한 하이라이팅 수정 (@aperfilyev 기여의 #2543)
- [IDE Plugin] 프로젝트 인덱스가 아직 초기화되지 않은 경우 일치하지 않는 컬럼 검사를 시도하지 않도록 수정
- [IDE Plugin] Gradle 동기화가 발생할 때까지 파일 인덱스를 초기화하지 않도록 수정
- [IDE Plugin] Gradle 동기화가 시작되면 SQLDelight import 취소
- [IDE Plugin] 실행 취소(undo) 작업이 수행된 스레드 외부에서 데이터베이스를 재생성
- [IDE Plugin] 참조를 확인할 수 없는 경우 빈 Java 타입 사용
- [IDE Plugin] 파일 파싱 중 메인 스레드에서 올바르게 벗어나고 쓰기 작업 시에만 다시 복귀하도록 수정
- [IDE Plugin] 이전 IntelliJ 버전과의 호환성 개선 (by @3flex)
- [IDE Plugin] 더 빠른 어노테이션 API 사용
- [Gradle Plugin] 런타임 추가 시 JS/Android 플러그인을 명시적으로 지원 (by @ZacSweers)
- [Gradle Plugin] 마이그레이션에서 스키마를 유추하지 않고 마이그레이션 출력 태스크 등록 (@kevincianfarini 기여의 #2744)
- [Gradle Plugin] 마이그레이션 태스크가 크래시될 경우 오류를 유발한 파일 출력
- [Gradle Plugin] 멱등성 있는 출력을 보장하기 위해 코드 생성 시 파일 정렬 (by @ZacSweers)
- [Compiler] 전체 PSI 그래프를 탐색하지 않고 파일을 순회할 때 더 빠른 API 사용
- [Compiler] select 함수 파라미터에 키워드 맹글링(mangling) 추가 (@aperfilyev 기여의 #2759)
- [Compiler] 마이그레이션 어댑터의 packageName 수정 (by @hfhbd)
- [Compiler] 타입 대신 프로퍼티에 어노테이션을 생성하도록 변경 (@aperfilyev 기여의 #2798)
- [Compiler] Query 하위 타입으로 전달하기 전에 인자 정렬 (@aperfilyev 기여의 #2379)

## [1.5.3] - 2021-11-23 {id="1-5-3-2021-11-23"}
[1.5.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.3

### 추가
- [JDBC Driver] 서드파티 드라이버 구현을 위해 JdbcDriver를 open으로 변경 (@hfhbd 기여의 #2672)
- [MySQL Dialect] 시간 증가와 관련된 누락된 함수 추가 (@sdoward 기여의 #2671)
- [Coroutines Extension] coroutines-extensions에 M1 타깃 추가 (by @PhilipDukhov)

### 변경
- [Paging3 Extension] sqldelight-android-paging3를 AAR 대신 JAR로 배포 (@julioromano 기여의 #2634)
- 소프트 키워드이기도 한 프로퍼티 이름 뒤에 이제 밑줄이 붙습니다. 예를 들어 `value`는 `value_`로 노출됩니다.

### 수정
- [Compiler] 중복 배열 파라미터에 대한 변수를 추출하지 않도록 수정 (by @aperfilyev)
- [Gradle Plugin] kotlin.mpp.enableCompatibilityMetadataVariant 추가 (@martinbonnin 기여의 #2628)
- [IDE Plugin] 사용처 찾기(Find usages) 처리에 읽기 액션(read action)이 필요하도록 수정

## [1.5.2] - 2021-10-12 {id="1-5-2-2021-10-12"}
[1.5.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.2

### 추가
- [Gradle Plugin] HMPP 지원 (@martinbonnin 기여의 #2548)
- [IDE Plugin] NULL 비교 검사 추가 (by @aperfilyev)
- [IDE Plugin] 검사 억제기(inspection suppressor) 추가 (by @aperfilyev)
- [IDE Plugin] 이름 지정 및 위치 파라미터 혼용 검사 추가 (by @aperfilyev)
- [SQLite Driver] mingwX86 타깃 추가 (@enginegl 기여의 #2558)
- [SQLite Driver] M1 타깃 추가
- [SQLite Driver] linuxX64 지원 추가 (@chippmann 기여의 #2456)
- [MySQL Dialect] MySQL에 ROW_COUNT 함수 추가 (#2523)
- [PostgreSQL Dialect] PostgreSQL rename, drop column 추가 (by @pabl0rg)
- [PostgreSQL Dialect] PostgreSQL 문법이 CITEXT를 인식하지 못하던 문제 수정
- [PostgreSQL Dialect] TIMESTAMP WITH TIME ZONE 및 TIMESTAMPTZ 포함
- [PostgreSQL Dialect] PostgreSQL GENERATED 컬럼에 대한 문법 추가
- [Runtime] AfterVersion에 SqlDriver를 파라미터로 제공 (@ahmedre 기여의 #2534, 2614)

### 변경
- [Gradle Plugin] Gradle 7.0을 명시적으로 요구하도록 변경 (@martinbonnin 기여의 #2572)
- [Gradle Plugin] VerifyMigrationTask가 Gradle의 최신 상태 검사(up-to-date checks)를 지원하도록 변경 (@3flex 기여의 #2533)
- [IDE Plugin] nullable 타입과 non-nullable 타입을 조인할 때 "Join compares two columns of different types" 경고가 발생하지 않도록 수정 (@pchmielowski 기여의 #2550)
- [IDE Plugin] 컬럼 타입에서 소문자 'as'에 대한 오류 설명 명확화 (by @aperfilyev)

### 수정
- [IDE Plugin] 프로젝트가 이미 dispose된 경우 새 방언으로 다시 파싱하지 않도록 수정 (#2609)
- [IDE Plugin] 연관된 가상 파일이 null이면 모듈도 null 처리 (#2607)
- [IDE Plugin] 미사용 쿼리 검사(unused query inspection) 중 크래시 방지 (#2610)
- [IDE Plugin] 데이터베이스 동기화 쓰기 작업을 쓰기 액션(write action) 내에서 실행 (#2605)
- [IDE Plugin] IDE가 SQLDelight 동기화를 스케줄링하도록 위임
- [IDE Plugin] JavaTypeMixin의 NPE 수정 (@aperfilyev 기여의 #2603)
- [IDE Plugin] MismatchJoinColumnInspection의 IndexOutOfBoundsException 수정 (@aperfilyev 기여의 #2602)
- [IDE Plugin] UnusedColumnInspection에 설명 추가 (@aperfilyev 기여의 #2600)
- [IDE Plugin] PsiElement.generatedVirtualFiles를 읽기 액션으로 래핑 (@aperfilyev 기여의 #2599)
- [IDE Plugin] 불필요한 non-null 캐스팅 제거 (#2596)
- [IDE Plugin] 사용처 찾기 시 null을 올바르게 처리하도록 수정 (#2595)
- [IDE Plugin] Android용 생성 파일에 대한 IDE 자동 완성 수정 (@martinbonnin 기여의 #2573)
- [IDE Plugin] SqlDelightGotoDeclarationHandler의 NPE 수정 (by @aperfilyev)
- [IDE Plugin] insert 문 내부 인자에서 Kotlin 키워드 맹글링 처리 (@aperfilyev 기여의 #2433)
- [IDE Plugin] SqlDelightFoldingBuilder의 NPE 수정 (by @aperfilyev)
- [IDE Plugin] CopyPasteProcessor에서 ClassCastException 캐치 (@aperfilyev 기여의 #2369)
- [IDE Plugin] update 라이브 템플릿 수정 (by @IliasRedissi)
- [IDE Plugin] 인텐션 액션에 설명 추가 (@aperfilyev 기여의 #2489)
- [IDE Plugin] 테이블을 찾을 수 없을 때 CreateTriggerMixin에서 발생하는 예외 수정 (by @aperfilyev)
- [Compiler] 테이블 생성 문을 위상 정렬(topologically sort)하도록 수정
- [Compiler] 디렉토리에 대해 `forDatabaseFiles` 콜백 호출을 중단 (#2532)
- [Gradle Plugin] 잠재적 소비자에게 generateDatabaseInterface 태스크 종속성을 전파 (@martinbonnin 기여의 #2518)

## [1.5.1] - 2021-07-16 {id="1-5-1-2021-07-16"}
[1.5.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.1

### 추가
- [PostgreSQL Dialect] PostgreSQL JSONB 및 ON Conflict Do Nothing (by @satook)
- [PostgreSQL Dialect] PostgreSQL ON CONFLICT (column, ...) DO UPDATE 지원 추가 (by @satook)
- [MySQL Dialect] MySQL 생성된 컬럼 지원 (by @JGulbronson)
- [Native Driver] watchosX64 지원 추가
- [IDE Plugin] 파라미터 타입 및 어노테이션 추가 (by @aperfilyev)
- [IDE Plugin] 'select all' 쿼리 생성 액션 추가 (by @aperfilyev)
- [IDE Plugin] 자동 완성 시 컬럼 타입 표시 (by @aperfilyev)
- [IDE Plugin] 자동 완성에 아이콘 추가 (by @aperfilyev)
- [IDE Plugin] 'select by primary key' 쿼리 생성 액션 추가 (by @aperfilyev)
- [IDE Plugin] 'insert into' 쿼리 생성 액션 추가 (by @aperfilyev)
- [IDE Plugin] 컬럼 이름, 문 식별자, 함수 이름 하이라이팅 추가 (by @aperfilyev)
- [IDE Plugin] 나머지 쿼리 생성 액션 추가 (@aperfilyev 기여의 #489)
- [IDE Plugin] insert-stmt에서 파라미터 힌트 표시 (by @aperfilyev)
- [IDE Plugin] 테이블 별칭 인텐션 액션 (by @aperfilyev)
- [IDE Plugin] 컬럼 이름 한정(qualify) 인텐션 (by @aperfilyev)
- [IDE Plugin] Kotlin 프로퍼티 선언으로 이동(Go to declaration) (by @aperfilyev)

### 변경
- [Native Driver] 가능한 경우 동결(freezing) 및 공유 가능한 데이터 구조를 방지하여 네이티브 트랜잭션 성능 개선 (by @andersio)
- [Paging 3] Paging3 버전을 3.0.0 stable로 상향
- [JS Driver] sql.js를 1.5.0으로 업그레이드

### 수정
- [JDBC SQLite Driver] ThreadLocal을 지우기 전에 커넥션의 close()를 호출하도록 수정 (@hannesstruss 기여의 #2444)
- [RX extensions] 구독 / 폐기(disposal) 간의 경쟁 상태 누수 수정 (@pyricau 기여의 #2403)
- [Coroutines extension] 알림을 보내기 전에 쿼리 리스너를 먼저 등록하도록 보장
- [Compiler] 일관된 Kotlin 출력 파일을 생성하도록 notifyQueries 정렬 (by @thomascjy)
- [Compiler] select 쿼리 클래스 프로퍼티에 @JvmField를 붙이지 않도록 수정 (@eygraber 기여의 #2087)
- [IDE Plugin] import 최적화 도구 수정 (@aperfilyev 기여의 #2350)
- [IDE Plugin] 미사용 컬럼 검사 수정 (by @aperfilyev)
- [IDE Plugin] import 검사 및 클래스 어노테이터에 중첩 클래스 지원 추가 (by @aperfilyev)
- [IDE Plugin] CopyPasteProcessor의 NPE 수정 (@aperfilyev 기여의 #2363)
- [IDE Plugin] InlayParameterHintsProvider의 크래시 수정 (@aperfilyev 기여의 #2359)
- [IDE Plugin] create table 문에 텍스트를 복사하여 붙여넣을 때 빈 줄이 삽입되던 문제 수정 (@aperfilyev 기여의 #2431)

## [1.5.0] - 2021-04-23 {id="1-5-0-2021-04-23"}
[1.5.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.0

### 추가
- [SQLite Javascript Driver] sqljs-driver 배포 활성화 (@dellisd 기여의 #1667)
- [Paging3 Extension] Android Paging 3 라이브러리용 확장 (@kevincianfarini 기여의 #1786)
- [MySQL Dialect] MySQL의 ON DUPLICATE KEY UPDATE 충돌 해결 지원 추가 (by @rharter)
- [SQLite Dialect] SQLite offsets()에 대한 컴파일러 지원 추가 (by @qjroberts)
- [IDE Plugin] 알 수 없는 타입에 대한 import 퀵픽스(quick fix) 추가 (@aperfilyev 기여의 #683)
- [IDE Plugin] 미사용 import 검사 추가 (@aperfilyev 기여의 #1161)
- [IDE Plugin] 미사용 쿼리 검사 추가 (by @aperfilyev)
- [IDE Plugin] 미사용 컬럼 검사 추가 (@aperfilyev 기여의 #569)
- [IDE Plugin] 복사/붙여넣기 시 자동으로 import를 가져오는 기능 추가 (@aperfilyev 기여의 #684)
- [IDE Plugin] Gradle 및 IntelliJ 플러그인 버전 간 호환되지 않는 경우 알림 풍선 표시
- [IDE Plugin] Insert Into ... VALUES(?) 파라미터 힌트 추가 (@aperfilyev 기여의 #506)
- [IDE Plugin] 인라인 파라미터 힌트 추가 (by @aperfilyev)
- [Runtime] 콜백을 사용하여 마이그레이션을 실행할 수 있는 API를 런타임에 포함 (#1844)

### 변경
- [Compiler] "IS NOT NULL" 쿼리에 대한 스마트 캐스트 지원 (#867)
- [Compiler] 런타임에 실패할 수 있는 키워드에 대한 보호 추가 (#1471, #1629)
- [Gradle Plugin] Gradle 플러그인 크기를 60MB에서 13MB로 축소
- [Gradle Plugin] Android variant를 올바르게 지원하고, KMM 타깃별 SQL 지원 제거 (#1039)
- [Gradle Plugin] minSdk에 따라 최소 SQLite 버전 선택 (#1684)
- [Native Driver] 네이티브 드라이버 커넥션 풀 및 성능 업데이트

### 수정
- [Compiler] 람다 앞의 공백(NBSP) 수정 (by @oldergod)
- [Compiler] 생성된 bind* 및 cursor.get* 문에서 호환되지 않는 타입 오류 수정
- [Compiler] SQL 절이 어댑터가 적용된 타입을 유지하도록 수정 (#2067)
- [Compiler] NULL 키워드만 있는 컬럼은 nullable이어야 함
- [Compiler] 타입 어노테이션이 있는 매퍼 람다를 생성하지 않도록 수정 (#1957)
- [Compiler] 커스텀 쿼리가 충돌하는 경우 파일 이름을 추가 패키지 접미사로 사용 (#1057, #1278)
- [Compiler] 외래 키 연쇄(cascades) 시 쿼리 리스너에게 알림이 전달되도록 보장 (#1325, #1485)
- [Compiler] 동일한 타입 두 개를 union할 때 테이블 타입을 반환하도록 수정 (#1342)
- [Compiler] ifnull 및 coalesce의 인자가 nullable일 수 있도록 보장 (#1263)
- [Compiler] 표현식에 대해 쿼리에서 지정된 nullability를 올바르게 적용
- [MySQL Dialect] MySQL IF 문 지원
- [PostgreSQL Dialect] PostgreSQL에서 NUMERIC 및 DECIMAL을 Double로 조회 (#2118)
- [SQLite Dialect] UPSERT 알림이 BEFORE/AFTER UPDATE 트리거를 고려하도록 수정 (@andersio 기여의 #2198)
- [SQLite Driver] 인메모리가 아닌 경우 SqliteDriver에서 스레드용으로 다중 커넥션 사용 (#1832)
- [JDBC Driver] JDBC 드라이버가 autoCommit이 true라고 가정하는 문제 수정 (#2041)
- [JDBC Driver] 예외 발생 시 커넥션을 닫도록 보장 (#2306)
- [IDE Plugin] 경로 구분자 버그로 인해 Windows에서 GoToDeclaration/FindUsages가 작동하지 않던 문제 수정 (@angusholder 기여의 #2054)
- [IDE Plugin] IDE에서 크래시를 유발하는 대신 Gradle 오류를 무시하도록 처리
- [IDE Plugin] sqldelight 파일이 sqldelight가 아닌 모듈로 이동된 경우 코드 생성을 시도하지 않도록 수정
- [IDE Plugin] IDE에서 코드 생성 오류 무시 처리
- [IDE Plugin] 음수 인덱스로 부분 문자열(substring)을 시도하지 않도록 보장 (#2068)
- [IDE Plugin] Gradle 액션을 실행하기 전에 프로젝트가 dispose되지 않았는지 확인 (#2155)
- [IDE Plugin] nullable 타입에 대한 산술 연산 결과도 nullable이 되도록 수정 (#1853)
- [IDE Plugin] 'expand * intention'이 추가 projection과 함께 작동하도록 수정 (@aperfilyev 기여의 #2173)
- [IDE Plugin] GoTo 도중 Kotlin 해석이 실패하면 sqldelight 파일로 이동을 시도하지 않도록 수정
- [IDE Plugin] SQLDelight 인덱싱 중 IntelliJ에서 예외가 발생하더라도 크래시되지 않도록 수정
- [IDE Plugin] IDE에서 코드 생성 전 오류를 감지하는 동안 발생하는 예외 처리
- [IDE Plugin] 동적 플러그인(Dynamic Plugins)과 호환되도록 IDE 플러그인 수정 (#1536)
- [Gradle Plugin] WorkerApi를 사용하여 데이터베이스를 생성할 때 발생하는 경쟁 상태 수정 (@stephanenicolas 기여의 #2062)
- [Gradle Plugin] classLoaderIsolation으로 인해 커스텀 JDBC 사용이 차단되던 문제 수정 (@benasher44 기여의 #2048)
- [Gradle Plugin] 누락된 packageName 오류 메시지 개선 (by @vanniktech)
- [Gradle Plugin] SQLDelight가 빌드스크립트 클래스패스로 IntelliJ 종속성을 유출하던 문제 수정 (#1998)
- [Gradle Plugin] Gradle 빌드 캐싱 수정 (#2075)
- [Gradle Plugin] Gradle 플러그인에서 kotlin-native-utils에 의존하지 않도록 수정 (by @ilmat192)
- [Gradle Plugin] 마이그레이션 파일만 있는 경우에도 데이터베이스를 작성하도록 수정 (#2094)
- [Gradle Plugin] 최종 컴파일 단위에서 다이아몬드 종속성이 한 번만 포함되도록 보장 (#1455)

이번 릴리스에서 SQLDelight 인프라 개선을 위해 많은 기여를 해주신 @3flex 님께 감사를 표합니다.

## [1.4.4] - 2020-10-08 {id="1-4-4-2020-10-08"}
[1.4.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.4

### 추가
- [PostgreSQL Dialect] WITH 절에서 데이터 수정 문(data-modifying statements) 지원
- [PostgreSQL Dialect] substring 함수 지원
- [Gradle Plugin] SQLDelight 컴파일 중 마이그레이션의 유효성을 검사하는 verifyMigrations 플래그 추가 (#1872)

### 변경
- [Compiler] SQLite가 아닌 방언에서는 SQLite 전용 함수를 알 수 없는 함수(unknown)로 표시
- [Gradle Plugin] sqldelight 플러그인이 적용되었으나 데이터베이스가 구성되지 않은 경우 경고 표시 (#1421)

### 수정
- [Compiler] ORDER BY 절에서 컬럼 이름을 바인딩할 때 오류 보고 (@eygraber 기여의 #1187)
- [Compiler] DB 인터페이스 생성 시 레지스트리 경고가 나타나던 문제 수정 (#1792)
- [Compiler] case 문에 대한 부정확한 타입 추론 수정 (#1811)
- [Compiler] 버전이 없는 마이그레이션 파일에 대해 더 나은 오류 제공 (#2006)
- [Compiler] 일부 데이터베이스 타입 ColumnAdapter에 대해 마샬링에 필요한 데이터베이스 타입이 잘못되던 문제 수정 (#2012)
- [Compiler] CAST의 nullability 문제 수정 (#1261)
- [Compiler] 쿼리 래퍼에서 다수의 이름 섀도잉(name shadowed) 경고가 발생하던 문제 수정 (@eygraber 기여의 #1946)
- [Compiler] 생성된 코드가 전체 한정자 이름(full qualifier names)을 사용하던 문제 수정 (#1939)
- [IDE Plugin] Gradle 동기화 시 sqldelight 코드 생성 트리거
- [IDE Plugin] .sq 파일 변경 시 플러그인이 데이터베이스 인터페이스를 재생성하지 않던 문제 수정 (#1945)
- [IDE Plugin] 파일을 새 패키지로 이동할 때 발생하던 문제 수정 (#444)
- [IDE Plugin] 커서를 이동할 위치가 없으면 크래시되는 대신 아무 작업도 수행하지 않도록 수정 (#1994)
- [IDE Plugin] Gradle 프로젝트 외부의 파일에 대해 빈 패키지 이름 사용 (#1973)
- [IDE Plugin] 잘못된 타입에 대해 유연하게 실패(fail gracefully)하도록 처리 (#1943)
- [IDE Plugin] 알 수 없는 표현식을 만났을 때 더 나은 오류 메시지 출력 (#1958)
- [Gradle Plugin] SQLDelight가 빌드스크립트 클래스패스로 IntelliJ 종속성을 유출하던 문제 수정 (#1998)
- [Gradle Plugin] *.sq 파일에 메서드 문서를 추가할 때 "JavadocIntegrationKt not found" 컴파일 오류가 발생하던 문제 수정 (#1982)
- [Gradle Plugin] SQLDelight Gradle 플러그인이 Configuration Caching(CoCa)을 지원하지 않던 문제 수정 (@stephanenicolas 기여의 #1947)
- [SQLite JDBC Driver] SQLException: database in auto-commit mode 문제 수정 (#1832)
- [Coroutines Extension] coroutines-extensions용 IR 백엔드 수정 (@dellisd 기여의 #1918)

## [1.4.3] - 2020-09-04 {id="1-4-3-2020-09-04"}
[1.4.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.3

### 추가
- [MySQL Dialect] MySQL last_insert_id 함수 지원 추가 (by @lawkai)
- [PostgreSQL Dialect] SERIAL 데이터 타입 지원 (by @veyndan & @felipecsl)
- [PostgreSQL Dialect] PostgreSQL RETURNING 지원 (by @veyndan)

### 수정
- [MySQL Dialect] MySQL AUTO_INCREMENT를 기본값을 가진 것으로 처리 (#1823)
- [Compiler] Upsert 문 컴파일러 오류 수정 (@eygraber 기여의 #1809)
- [Compiler] 잘못된 Kotlin 코드가 생성되던 문제 수정 (@eygraber 기여의 #1925)
- [Compiler] 알 수 없는 함수에 대해 더 나은 오류 메시지 제공 (#1843)
- [Compiler] instr의 두 번째 파라미터 타입을 String으로 노출
- [IDE Plugin] IDE 플러그인의 데몬 비대화 및 UI 스레드 멈춤 현상 수정 (#1916)
- [IDE Plugin] null 모듈 시나리오 처리 (#1902)
- [IDE Plugin] 구성되지 않은 sq 파일에서는 패키지 이름으로 빈 문자열 반환 (#1920)
- [IDE Plugin] 그룹화된 문을 수정하고 이에 대한 통합 테스트 추가 (#1820)
- [IDE Plugin] 요소에 대한 모듈을 찾을 때 내장 ModuleUtil을 사용하도록 수정 (#1854)
- [IDE Plugin] 조회 시 유효한 요소만 추가 (#1909)
- [IDE Plugin] 부모가 null일 수 있는 상황 처리 (#1857)

## [1.4.2] - 2020-08-27 {id="1-4-2-2020-08-27"}
[1.4.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.2

### 추가
- [Runtime] 새로운 JS IR 백엔드 지원
- [Gradle Plugin] generateSqlDelightInterface Gradle 태스크 추가 (by @vanniktech)
- [Gradle Plugin] verifySqlDelightMigration Gradle 태스크 추가 (by @vanniktech)

### 수정
- [IDE Plugin] IDE와 Gradle 간의 데이터 공유를 촉진하기 위해 Gradle tooling API 사용
- [IDE Plugin] 스키마 유추(schema derivation)의 기본값을 false로 변경
- [IDE Plugin] commonMain 소스 세트를 올바르게 가져오도록 수정
- [MySQL Dialect] mySqlFunctionType()에 minute 추가 (by @maaxgr)

## [1.4.1] - 2020-08-21 {id="1-4-1-2020-08-21"}
[1.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.1

### 추가
- [Runtime] Kotlin 1.4.0 지원 (#1859)

### 변경
- [Gradle Plugin] AGP 종속성을 compileOnly로 변경 (#1362)

### 수정
- [Compiler] 컬럼 정의 규칙 및 테이블 인터페이스 생성기에 선택적 Javadoc 추가 (@endanke 기여의 #1224)
- [SQLite Dialect] SQLite FTS5 보조 함수 highlight, snippet, bm25 지원 추가 (by @drampelt)
- [MySQL Dialect] MySQL bit 데이터 타입 지원
- [MySQL Dialect] MySQL 바이너리 리터럴 지원
- [PostgreSQL Dialect] sql-psi에서 SERIAL 노출 (by @veyndan)
- [PostgreSQL Dialect] BOOLEAN 데이터 타입 추가 (by @veyndan)
- [PostgreSQL Dialect] NULL 컬럼 제약 조건 추가 (by @veyndan)
- [HSQL Dialect] HSQL에 `AUTO_INCREMENT` 지원 추가 (by @rharter)

## [1.4.0] - 2020-06-22 {id="1-4-0-2020-06-22"}
[1.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.0

### 추가
- [MySQL Dialect] MySQL 지원 (by @JGulbronson & @veyndan)
- [PostgreSQL Dialect] 실험적 PostgreSQL 지원 (by @veyndan)
- [HSQL Dialect] 실험적 H2 지원 (by @MariusVolkhart)
- [SQLite Dialect] SQLite FTS5 지원 (by @benasher44 & @jpalawaga)
- [SQLite Dialect] alter table rename column 지원 (@angusholder 기여의 #1505)
- [IDE] 마이그레이션(.sqm) 파일에 대한 IDE 지원
- [IDE] 내장 SQL 라이브 템플릿을 모방한 SQLDelight 라이브 템플릿 추가 (@veyndan 기여의 #1154)
- [IDE] 새로운 SqlDelight 파일 생성 액션 추가 (@romtsn 기여의 #42)
- [Runtime] 결과를 반환하는 트랜잭션을 위한 transactionWithReturn API 추가
- [Compiler] .sq 파일 내에서 여러 SQL 문을 함께 그룹화하는 문법 추가
- [Compiler] 마이그레이션 파일로부터 스키마 생성 지원
- [Gradle Plugin] 마이그레이션 파일을 유효한 SQL로 출력하는 태스크 추가

### 변경
- [Documentation] 문서 웹사이트 개편 (by @saket)
- [Gradle Plugin] 지원되지 않는 방언에 대한 오류 메시지 개선 (by @veyndan)
- [IDE] 방언에 따라 파일 아이콘을 동적으로 변경 (by @veyndan)
- [JDBC Driver] javax.sql.DataSource로부터 생성 가능한 JdbcDriver 생성자 노출 (#1614)

### 수정
- [Compiler] 테이블의 Javadoc을 지원하고 한 파일에 여러 Javadoc이 있는 경우 수정 (#1224)
- [Compiler] 합성 컬럼에 대한 값 삽입 활성화 (#1351)
- [Compiler] 디렉토리 이름 정리(sanitizing)의 불일치 문제 수정 (by @ZacSweers)
- [Compiler] 합성 컬럼이 조인 간에 nullability를 유지하도록 수정 (#1656)
- [Compiler] delete 문을 delete 키워드에 고정 (#1643)
- [Compiler] 따옴표 처리 수정 (@angusholder 기여의 #1525)
- [Compiler] between 연산자가 표현식 내부로 올바르게 재귀 탐색하도록 수정 (#1279)
- [Compiler] 인덱스 생성 시 테이블/컬럼 누락에 대해 더 나은 오류 제공 (#1372)
- [Compiler] 조인 제약 조건에서 외부 쿼리의 projection을 사용할 수 있도록 활성화 (#1346)
- [Native Driver] execute 시 transationPool을 사용하도록 변경 (by @benasher44)
- [JDBC Driver] sqlite 대신 jdbc 트랜잭션 API를 사용하도록 변경 (#1693)
- [IDE] virtualFile 참조가 항상 원본 파일을 가리키도록 수정 (#1782)
- [IDE] Bugsnag에 오류를 보고할 때 올바른 throwable을 사용하도록 수정 (#1262)
- [Paging Extension] 메모리 누수가 발생하던 DataSource 수정 (#1628)
- [Gradle Plugin] 스키마 생성 시 대상 db 파일이 이미 존재하는 경우 삭제하도록 수정 (#1645)
- [Gradle Plugin] 마이그레이션에 누락(gap)이 있는 경우 유효성 검사 실패 처리
- [Gradle Plugin] 명시적으로 설정된 파일 인덱스를 사용하도록 수정 (#1644)

## [1.3.0] - 2020-04-03 {id="1-3-0-2020-04-03"}
[1.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.3.0

* 신규: [Gradle] 컴파일 대상 SQL 방언을 지정할 수 있는 방언 프로퍼티 추가.
* 신규: [Compiler] #1009 MySQL 방언에 대한 실험적 지원.
* 신규: [Compiler] #1436 sqlite:3.24 방언 및 upsert 지원.
* 신규: [JDBC Driver] SQLite JVM 드라이버에서 JDBC 드라이버 분리.
* 수정: [Compiler] #1199 임의의 길이를 가진 람다 지원.
* 수정: [Compiler] #1610 avg()의 반환 타입이 nullable이 되도록 수정.
* 수정: [IntelliJ] #1594 Windows에서 Goto 및 Find Usages를 망가뜨리던 경로 구분자 처리 문제 수정.

## [1.2.2] - 2020-01-22 {id="1-2-2-2020-01-22"}
[1.2.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.2

* 신규: [Runtime] Windows(mingW), tvOS, watchOS, macOS 아키텍처 지원.
* 수정: [Compiler] sum()의 반환 타입이 nullable이어야 함.
* 수정: [Paging] 경쟁 상태를 피하기 위해 Transacter를 QueryDataSourceFactory로 전달.
* 수정: [IntelliJ Plugin] 파일의 패키지 이름을 찾을 때 종속성을 탐색하지 않도록 수정.
* 수정: [Gradle] #862 Gradle의 유효성 검사기 로그를 디버그 레벨로 변경.
* 개선: [Gradle] GenerateSchemaTask가 Gradle 워커를 사용하도록 변환.
* 참고: sqldelight-runtime 아티팩트의 이름이 runtime으로 변경되었습니다.

## [1.2.1] - 2019-12-11 {id="1-2-1-2019-12-11"}
[1.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.1

* 수정: [Gradle] Kotlin Native 1.3.60 지원.
* 수정: [Gradle] #1287 동기화 시 경고 문제 해결.
* 수정: [Compiler] #1469 쿼리를 위한 SyntheticAccessor 생성.
* 수정: [JVM Driver] 메모리 누수 수정.
* 참고: 코루틴 확장 아티팩트를 사용하려면 buildscript에 kotlinx bintray maven 저장소를 추가해야 합니다.

## [1.2.0] - 2019-08-30 {id="1-2-0-2019-08-30"}
[1.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.0

* 신규: [Runtime] 안정화된 Flow API.
* 수정: [Gradle] Kotlin Native 1.3.50 지원.
* 수정: [Gradle] #1380 클린 빌드가 간헐적으로 실패하던 문제 수정.
* 수정: [Gradle] #1348 검증 태스크 실행 시 "Could not retrieve functions"가 출력되던 문제 수정.
* 수정: [Compile] #1405 쿼리에 FTS 테이블 조인이 포함된 경우 프로젝트를 빌드할 수 없던 문제 수정.
* 수정: [Gradle] #1266 여러 데이터베이스 모듈이 있을 때 간헐적으로 Gradle 빌드가 실패하던 문제 수정.

## [1.1.4] - 2019-07-11 {id="1-1-4-2019-07-11"}
[1.1.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.4

* 신규: [Runtime] 실험적 Kotlin Flow API.
* 수정: [Gradle] Kotlin/Native 1.3.40 호환성 지원.
* 수정: [Gradle] #1243 Gradle configure on demand 환경에서 SQLDelight 사용 문제 수정.
* 수정: [Gradle] #1385 증분 어노테이션 프로세싱 환경에서 SQLDelight 사용 문제 수정.
* 수정: [Gradle] Gradle 태스크 캐싱 허용.
* 수정: [Gradle] #1274 Kotlin DSL과 함께 sqldelight 확장을 사용할 수 있도록 활성화.
* 수정: [Compiler] 결정론적(deterministically) 방식으로 각 쿼리에 고유 ID가 생성되도록 수정.
* 수정: [Compiler] 트랜잭션이 완료된 경우에만 리스닝 중인 쿼리에 알림을 보내도록 수정.
* 수정: [JVM Driver] #1370 JdbcSqliteDriver 사용 시 DB URL을 반드시 제공하도록 강제.

## [1.1.3] - 2019-04-14 {id="1-1-3-2019-04-14"}
[1.1.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.3

* Gradle Metadata 1.0 릴리스.

## [1.1.2] - 2019-04-14 {id="1-1-2-2019-04-14"}
[1.1.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.2

* 신규: [Runtime] #1267 로깅 드라이버 데코레이터.
* 수정: [Compiler] #1254 2^16 자보다 긴 문자열 리터럴 분할 처리.
* 수정: [Gradle] #1260 멀티플랫폼 프로젝트에서 생성된 소스가 iOS 소스로 인식되던 문제 수정.
* 수정: [IDE] #1290 CopyAsSqliteAction.kt:43의 kotlin.KotlinNullPointerException 수정.
* 수정: [Gradle] #1268 최신 버전에서 linkDebugFrameworkIos* 태스크 실행이 실패하던 문제 수정.

## [1.1.1] - 2019-03-01 {id="1-1-1-2019-03-01"}
[1.1.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.1

* 수정: [Gradle] Android 프로젝트의 모듈 종속성 컴파일 문제 수정.
* 수정: [Gradle] #1246 afterEvaluate에서 API 종속성 설정.
* 수정: [Compiler] 배열 타입이 올바르게 출력되도록 수정.

## [1.1.0] - 2019-02-27 {id="1-1-0-2019-02-27"}
[1.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.0

* 신규: [Gradle] #502 스키마 모듈 종속성 지정 허용.
* 개선: [Compiler] #1111 테이블 오류가 다른 오류보다 먼저 정렬되어 출력되도록 개선.
* 수정: [Compiler] #1225 REAL 리터럴에 대해 올바른 타입을 반환하도록 수정.
* 수정: [Compiler] #1218 docid가 트리거를 통해 전파되도록 수정.

## [1.0.3] - 2019-01-30 {id="1-0-3-2019-01-30"}
[1.0.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.3

* 개선: [Runtime] #1195 Native Driver/Runtime Arm32 지원.
* 개선: [Runtime] #1190 Query 타입에서 매퍼 노출.

## [1.0.2] - 2019-01-26 {id="1-0-2-2019-01-26"}
[1.0.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.2

* 수정: [Gradle Plugin] Kotlin 1.3.20으로 업데이트.
* 수정: [Runtime] 트랜잭션이 더 이상 예외를 삼키지(swallow) 않도록 수정.

## [1.0.1] - 2019-01-21 {id="1-0-1-2019-01-21"}
[1.0.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.1

* 개선: [Native Driver] DatabaseConfiguration에 디렉토리 이름을 전달할 수 있도록 허용.
* 개선: [Compiler] #1173 패키지가 없는 파일은 컴파일에 실패하도록 수정.
* 수정: [IDE] IDE 오류를 Square에 올바르게 보고하도록 수정.
* 수정: [IDE] #1162 동일한 패키지의 타입이 오류로 표시되지만 정상 작동하던 문제 수정.
* 수정: [IDE] #1166 테이블 이름 변경 시 NPE가 발생하던 문제 수정.
* 수정: [Compiler] #1167 UNION 및 SELECT가 포함된 복잡한 SQL 문을 파싱할 때 발생하던 예외 수정.

## [1.0.0] - 2019-01-08 {id="1-0-0-2019-01-08"}
[1.0.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.0

* 신규: 생성 코드를 Kotlin으로 전면 개편.
* 신규: RxJava2 확장 아티팩트.
* 신규: Android Paging 확장 아티팩트.
* 신규: Kotlin Multiplatform 지원.
* 신규: Android, iOS, JVM용 SQLite 드라이버 아티팩트.
* 신규: Transaction API.

## [0.7.0] - 2018-02-12 {id="0-7-0-2018-02-12"}
[0.7.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.7.0

 * 신규: Support SQLite 라이브러리만 사용하도록 생성 코드 업데이트. 모든 쿼리가 원시 문자열 대신 statement 객체를 생성합니다.
 * 신규: IDE 내 Statement 폴딩 기능.
 * 신규: 이제 불리언 타입이 자동으로 처리됩니다.
 * 수정: 코드 생성에서 지원 중단된 marshal 제거.
 * 수정: 'avg' SQL 함수 타입 매핑이 REAL이 되도록 수정.
 * 수정: 'julianday' SQL 함수를 올바르게 감지하도록 수정.

## [0.6.1] - 2017-03-22 {id="0-6-1-2017-03-22"}
[0.6.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.6.1

 * 신규: 인자가 없는 Delete, Update, Insert 문에 대해 컴파일된 statement 생성.
 * 수정: 서브쿼리에 사용된 뷰 내의 using 절에서 오류가 발생하지 않도록 수정.
 * 수정: 생성된 Mapper에서 중복 타입 제거.
 * 수정: 인자와 대조하는 표현식에 서브쿼리를 사용할 수 있도록 수정.

## [0.6.0] - 2017-03-06 {id="0-6-0-2017-03-06"}
[0.6.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.6.0

 * 신규: Select 쿼리가 문자열 상수 대신 `SqlDelightStatement` 팩토리로 노출됩니다.
 * 신규: 쿼리 JavaDoc이 이제 statement 및 mapper 팩토리로 복사됩니다.
 * 신규: 뷰 이름에 대한 문자열 상수 출력.
 * 수정: 팩토리가 필요한 뷰에 대한 쿼리가 해당 팩토리를 인자로 올바르게 요구하도록 수정.
 * 수정: insert의 인자 수가 지정된 컬럼 수와 일치하는지 유효성 검사 추가.
 * 수정: WHERE 절에 사용된 BLOB 리터럴을 올바르게 인코딩하도록 수정.
 * 이번 릴리스에는 Gradle 3.3 이상이 필요합니다.

## [0.5.1] - 2016-10-24 {id="0-5-1-2016-10-24"}
[0.5.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.5.1

 * 신규: 컴파일된 statement가 추상 타입을 상속하도록 변경.
 * 수정: 매개변수의 원시 타입이 nullable인 경우 박싱 처리되도록 수정.
 * 수정: 바인드 인자에 필요한 모든 팩토리가 팩토리 메서드에 존재하도록 수정.
 * 수정: 이스케이프된 컬럼 이름이 올바르게 마샬링되도록 수정.

## [0.5.0] - 2016-10-19 {id="0-5-0-2016-10-19"}
[0.5.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.5.0

 * 신규: Factory를 통해 SQLite 인자를 타입 안전하게 전달 가능.
 * 신규: IntelliJ 플러그인이 .sq 파일 서식 지정(formatting) 수행.
 * 신규: SQLite timestamp 리터럴 지원.
 * 수정: IntelliJ에서 매개변수화된 타입을 클릭하여 이동 가능.
 * 수정: 이스케이프된 컬럼 이름을 Cursor에서 가져올 때 더 이상 RuntimeException이 발생하지 않도록 수정.
 * 수정: Gradle 플러그인이 예외를 출력할 때 크래시되지 않도록 수정.

## [0.4.4] - 2016-07-20 {id="0-4-4-2016-07-20"}
[0.4.4]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.4

 * 신규: 컬럼 Java 타입으로 short 네이티브 지원.
 * 신규: 생성된 매퍼 및 팩토리 메서드에 Javadoc 추가.
 * 수정: group_concat 및 nullif 함수가 올바른 nullability를 갖도록 수정.
 * 수정: Android Studio 2.2-alpha와의 호환성 지원.
 * 수정: WITH RECURSIVE가 더 이상 플러그인을 크래시시키지 않도록 수정.

## [0.4.3] - 2016-07-07 {id="0-4-3-2016-07-07"}
[0.4.3]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.3

 * 신규: 컴파일 오류 시 소스 파일 링크 제공.
 * 신규: 마우스 우클릭으로 SQLDelight 코드를 유효한 SQLite 코드로 복사하는 기능 추가.
 * 신규: 이름이 지정된 문에 작성된 Javadoc이 생성된 String에 표시되도록 추가.
 * 수정: 생성된 뷰 모델에 nullability 어노테이션 포함.
 * 수정: union에서 생성된 코드가 가능한 모든 컬럼을 지원하도록 적절한 타입 및 nullability를 갖도록 수정.
 * 수정: sum 및 round SQLite 함수가 생성된 코드에서 올바른 타입을 갖도록 수정.
 * 수정: CAST, 내부 select 관련 버그 수정.
 * 수정: CREATE TABLE 문에서의 자동 완성 수정.
 * 수정: 패키지에 SQLite 키워드를 사용할 수 있도록 수정.

## [0.4.2] - 2016-06-16 {id="0-4-2-2016-06-16"}
[0.4.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.2

 * 신규: Factory로부터 Marshal을 생성할 수 있도록 추가.
 * 수정: IntelliJ 플러그인이 올바른 제네릭 순서로 팩토리 메서드를 생성하도록 수정.
 * 수정: 함수 이름에 대소문자를 자유롭게 사용할 수 있도록 수정.

## [0.4.1] - 2016-06-14 {id="0-4-1-2016-06-14"}
[0.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.1

 * 수정: IntelliJ 플러그인이 올바른 제네릭 순서로 클래스를 생성하도록 수정.
 * 수정: 컬럼 정의에 대소문자를 자유롭게 사용할 수 있도록 수정.

## [0.4.0] - 2016-06-14 {id="0-4-0-2016-06-14"}
[0.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.0

 * 신규: 테이블별이 아닌 쿼리별로 매퍼가 생성되도록 변경.
 * 신규: .sq 파일에서 Java 타입을 import할 수 있도록 지원.
 * 신규: SQLite 함수 유효성 검사 수행.
 * 수정: 중복 오류 제거.
 * 수정: 대문자 컬럼 이름 및 Java 키워드 컬럼 이름에서 오류가 발생하지 않도록 수정.

## [0.3.2] - 2016-05-14 {id="0-3-2-2016-05-14"}
[0.3.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.2

 * 신규: 뷰 및 별칭에 대해 자동 완성 및 사용처 찾기 기능 제공.
 * 수정: 컴파일 타임 검증에서 select 내 함수 사용 허용.
 * 수정: 기본값만 선언하는 insert 문 지원.
 * 수정: SQLDelight를 사용하지 않는 프로젝트를 import할 때 플러그인이 더 이상 크래시되지 않도록 수정.

## [0.3.1] - 2016-04-27 {id="0-3-1-2016-04-27"}
[0.3.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.1

  * 수정: 메서드 참조로 인한 Illegal Access 런타임 예외를 방지하기 위해 인터페이스 가시성을 다시 public으로 변경.
  * 수정: 하위 표현식이 올바르게 평가되도록 수정.

## [0.3.0] - 2016-04-26 {id="0-3-0-2016-04-26"}
[0.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.0

  * 신규: 컬럼 정의에 SQLite 타입을 사용하며 Java 타입을 지정하기 위한 추가적인 'AS' 제약 조건을 가질 수 있음.
  * 신규: IDE에서 버그 보고서를 전송할 수 있는 기능 추가.
  * 수정: 자동 완성 기능이 올바르게 동작하도록 수정.
  * 수정: .sq 파일 편집 시 SQLDelight 모델 파일이 업데이트되도록 수정.
  * 제거: 연결된 데이터베이스(Attached databases)는 더 이상 지원되지 않음.

## [0.2.2] - 2016-03-07 {id="0-2-2-2016-03-07"}
[0.2.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.2

 * 신규: insert, update, delete, index, trigger 문에서 사용되는 컬럼의 컴파일 타임 유효성 검사 추가.
 * 수정: 파일 이동/생성 시 IDE 플러그인이 크래시되지 않도록 수정.

## [0.2.1] - 2016-03-07 {id="0-2-1-2016-03-07"}
[0.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.1

 * 신규: Ctrl+`/` (OSX의 경우 Cmd+`/`)를 사용하여 선택된 줄 주석 토글 기능 추가.
 * 신규: SQL 쿼리에서 사용되는 컬럼의 컴파일 타임 유효성 검사 추가.
 * 수정: IDE 및 Gradle 플러그인 모두에서 Windows 경로 지원.

## [0.2.0] - 2016-02-29 {id="0-2-0-2016-02-29"}
[0.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.0

 * 신규: Marshal 클래스에 복사 생성자 추가.
 * 신규: Kotlin 1.0 파이널 버전으로 업데이트.
 * 수정: 'sqldelight' 폴더 구조 문제를 빌드 실패를 일으키지 않는 방식으로 보고하도록 수정.
 * 수정: `table_name`이라는 이름의 컬럼 사용 금지. 생성된 상수가 테이블 이름 상수와 충돌함.
 * 수정: IDE 플러그인이 `.sq` 파일의 열림 여부와 관계없이 모델 클래스를 즉시 생성하도록 보장.
 * 수정: IDE 및 Gradle 플러그인 모두에서 Windows 경로 지원.

## [0.1.2] - 2016-02-13 {id="0-1-2-2016-02-13"}
[0.1.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.2

 * 수정: 대부분의 프로젝트에서 Gradle 플러그인 사용을 막던 코드 제거.
 * 수정: Antlr 런타임에 대한 누락된 컴파일러 종속성 추가.

## [0.1.1] - 2016-02-12 {id="0-1-1-2016-02-12"}
[0.1.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.1

 * 수정: Gradle 플러그인이 자체 버전과 동일한 런타임 버전을 가리키도록 보장.

## [0.1.0] - 2016-02-12 {id="0-1-0-2016-02-12"}
[0.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.0

초기 릴리스.