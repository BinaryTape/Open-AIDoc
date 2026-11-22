# 변경 로그 (Change Log)

## 미출시 (Unreleased) {id="unreleased"}

### 추가됨 (Added) {id="added"}

- 아직 없음!

### 변경됨 (Changed) {id="changed"}

- 아직 없음!

### 수정됨 (Fixed) {id="fixed"}

- [Runtime] 트랜잭션을 종료할 때나 롤백 후 훅(hook)에서도 실패하는 경우(예: SQLite가 자체적으로 트랜잭션을 롤백한 후 `cannot rollback - no transaction is active` 발생), 트랜잭션 본문의 예외를 유지하도록 수정했습니다. 두 번째 예외는 suppressed 예외로 추가되며, Android 드라이버는 이제 `endTransaction()`에서 예외가 발생하더라도 현재 트랜잭션을 정리합니다. (@pyricau 작성, #6387)
- [Gradle Plugin] `Configuration.visible` 프로퍼티가 더 이상 아무런 영향을 주지 않습니다. 이 프로퍼티는 이제 deprecated되었으며 Gradle 11에서 제거될 예정입니다. (@griffio 작성, #6394)
- [IntelliJ Plugin] 조인 검사(join inspection)에서 거짓 양성(false positive)이 나타나는 문제를 수정했습니다. (@griffio 작성, #6398)
- [JDBC Driver] 커밋/롤백 실패 시 연결(connection)이 누수되는 문제를 수정했습니다. (@tKe 작성, #6401)

## [2.4.1] - 2026-10-06 {id="2-4-1-2026-10-06"}
[2.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.1

### 추가됨 (Added)

- [Documentation] Android SQLite 트랜잭션 관련 추가 문서를 작성했습니다. (@griffio 작성, #6381)

### 변경됨 (Changed)

- [Gradle Plugin] 전체 코드 생성 태스크 동안 파싱된 `.sq` 파일을 메모리에 유지하여 가비지 컬렉션 후에 다시 파싱되지 않도록 했습니다. 이를 통해 대규모 프로젝트에서 코드 생성 속도를 높일 수 있습니다. (@C2H6O 작성, #6374)
- [IntelliJ Plugin] 크래시 보고가 커스텀 Bugsnag 인스턴스 대신 JetBrains Marketplace로 전송되도록 변경되었습니다. (@JakeWharton 작성, #6376)

### 수정됨 (Fixed)

- [IntelliJ Plugin] IntelliJ API 사용 방식을 변경하여 플러그인 게시 위반 사항을 수정했습니다. (@griffio 작성, #6366, #6368)
- [Intellij Plugin] 처리되지 않은 오류를 트랩(trap)하여 입력 시 안정성을 향상했습니다. (@griffio 작성, #6355)

## [2.4.0] - 2026-09-17 {id="2-4-0-2026-09-17"}
[2.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0

### 추가됨 (Added)
- [Native Driver] `inMemoryDriver`에 `extendedConfig` 파라미터를 추가했습니다. (@GuilhE 작성, #5539)
- [PostgreSQL Dialect] 암시적으로 정의된 시스템 열(System Columns)에 대한 쿼리 지원을 추가했습니다. (@griffio 작성, #5834)
- [PostgreSQL Dialect] 기본적인 배열 리터럴(Array literal) 지원을 추가했습니다. (@griffio 작성, #5997)
- [PostgreSQL Dialect] 기본적인 LTREE 지원을 추가했습니다. (@yesitskev, @griffio 작성, #5880)
- [MySQL Dialect] INET 함수 지원을 추가했습니다. (@mcxinyu 작성, #5072)
- [PostgreSQL Dialect] ALTER INDEX 지원을 추가했습니다. (@griffio 작성, #6224)
- [SQLite Dialect] SQLite 3.44 집계 함수 DISTINCT, ORDER BY 및 FILTER 지원을 추가했습니다. (@griffio 작성, #6236)
- [SQLite Dialect] SQLite 3.37 STRICT 테이블 지원을 추가했습니다. (@griffio 작성, #6230)
- [Gradle Plugin] `codegenExcludedColumns`를 사용하여 생성된 모델에서 열을 제외하는 지원을 추가했습니다. (@sokolikp 작성, #6243)
- [Compiler] 스키마에 `allTableNames` 함수를 추가했습니다. (@edenman 작성, #6245)
- [PostgreSQL Dialect] ANY 연산자 지원을 추가했습니다. (@griffio 작성, #6253)
- [SQLite Dialect] SQLite 3.39의 RIGHT JOIN 및 FULL JOIN 지원을 추가했습니다. (@griffio 작성, #6273)
- [PostgreSQL Dialect] 트리거 함수에서 `RAISE` 문과 `FOUND` 변수 지원을 추가했습니다. (@griffio 작성, #6297)

### 변경됨 (Changed)
- [PostgreSQL Dialect] `arrayIntermediateType`의 가시성을 public으로 변경했습니다. (@griffio 작성, #5835)
- [Gradle Plugin] 더욱 엄격한 MigrationFile 버전 관리를 적용했습니다. (@madisp 작성, #5730)
- [Gradle Plugin] 지원하는 최소 Gradle 버전을 8.2.1로 상향했습니다. (@maxsav 작성, #6217)
- [Gradle Plugin] Gradle isolated projects를 지원합니다. (@maxsav 작성, #6217)
- [IntelliJ Plugin] 최소 지원 버전이 2023.3 / Android Studio Jellyfish로 변경되었습니다.

### 수정됨 (Fixed)
- [Gradle Plugin] JDK 24+ 환경의 컴파일러 워커에서 발생하는 `sun.misc.Unsafe` 지원 중단 경고를 억제했습니다. (#6321)
- [Compiler] 생성된 코드에서 불필요한 Kotlin 추가 경고를 억제했습니다. (@eyupcanakman 작성, #6208)
- [Compiler] 그룹화되지 않은 집계 결과 집합의 다른 열들이 항상 nullable이 되도록 수정했습니다.
- [PostgreSQL Dialect] coalesce 및 ifnull에 대해 nullability를 올바르게 확인하도록 수정했습니다.
- [PostgreSQL Dialect] PostgreSQL dialect의 IDE 통합을 수정했습니다.
- [PostgreSQL Dialect] PostgreSQL dialect용 IDE 플러그인을 개선했습니다. (@griffio 작성, #6209)
- [Intellij Plugin] IDE 플러그인이 모든 dialect에 대해 코드 완성을 수행할 수 있도록 개선했습니다. (@griffio 작성, #6210)
- [Gradle Plugin] 데이터베이스 검증 태스크 실행 시 발생하는 순환 종속성 오류를 수정했습니다. (@griffio 작성, #6221)
- [Compiler] 다중 행 업데이트(multirow update)에 대한 낙관적 락(optimistic lock)을 수정했습니다. (@griffio 작성, #6240)
- [Intellij Plugin] IDEA 2026.2에서 크래시를 유발하던 지원 중단 API 사용 문제를 수정했습니다. (@griffio 작성, #6247)
- [Gradle Plugin] AGP 8.9부터 8.11까지 생성된 소스가 Kotlin 컴파일에 인식되지 않던 문제를 수정했습니다.
- [PostgreSQL Dialect] Primitive 바인드 인자를 사용하는 lower 및 upper 함수가 기본적으로 TEXT로 처리되도록 수정했습니다. (@griffio 작성, #6262)
- [Compiler] 어댑터를 사용하고 마이그레이션이 nullability를 변경할 때 데이터 클래스 바인딩을 사용한 insert values 문제를 수정했습니다. (griffio 작성, #6269)
- [Compiler] Null-safe 연산자(IS 및 IS DISTINCT FROM)와 함께 nullable 바인드 인자를 사용하도록 수정했습니다. (@griffio 작성, #6265)
- [Gradle Plugin] 프로젝트 종속성에 AGP의 variant resolution을 사용하도록 변경했습니다. (@maxsav 작성, #6217)
- [Gradle Plugin] 빌드 간에 AGP variant 목록이 다를 때 generateDatabaseInterface 태스크의 빌드 캐시 미스가 발생하던 문제를 수정했습니다.
- [Gradle Plugin] 데이터베이스를 구성하지 않고 플러그인을 적용했을 때 IDE 동기화가 중단되던 현상을 수정했습니다. (#6088)
- [PostgreSQL Dialect] 중첩 함수 호출을 사용할 때 json 집계 함수가 올바르게 작동하도록 수정했습니다. (@griffio 작성, #6281)
- [Paging3 Extension] 빈 데이터베이스에서 KeyedQueryPagingSource 크래시가 발생하던 문제를 수정했습니다. (@woods-marshes 작성, #6284)
- [Compiler] `COALESCE`와 같은 캡슐화 함수와 함께 mutator 문이 사용될 때 발생하는 Java type adapter 문제를 수정했습니다. (@griffio 작성, #6292)
- [Compiler] 모듈 이름이 대문자로 시작할 때 생성된 코드의 패키지 이름도 대문자로 표기되던 문제를 수정했습니다. (@griffio 작성, #6316)
- [PostgreSQL Dialect] 날짜 데이터 유형의 대소문자를 구분하지 않도록 허용했습니다. (@griffio 작성, #6328)
- [PostgreSQL Dialect] `string_agg` 함수가 nullable이 되도록 수정했습니다. (@griffio 작성, #6340)
- [SQLite Dialect] `GROUP BY`를 사용하는 SQLite 3.44 집계 함수 오류를 수정했습니다. (@griffio 작성, #6343)
- [Gradle Plugin] 구성 시점(configuration time)에 데이터베이스 의존성을 확인(resolve)하지 않도록 수정했습니다. (@joshfriend 작성, #6353)

## [2.4.0-rc2] - 2026-09-14 {id="2-4-0-rc2-2026-09-14"}
[2.4.0-rc2]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0-rc2

### 수정됨 (Fixed)

- [PostgreSQL Dialect] `string_agg` 함수가 nullable이 되도록 수정했습니다. (@griffio 작성, #6340)
- [SQLite Dialect] `GROUP BY`를 사용하는 SQLite 3.44 집계 함수 오류를 수정했습니다. (@griffio 작성, #6343)
- [Gradle Plugin] 구성 시점에 데이터베이스 의존성을 확인하지 않도록 수정했습니다. (@joshfriend 작성, #6353)

## [2.4.0-rc1] - 2026-09-01 {id="2-4-0-rc1-2026-09-01"}
[2.4.0-rc1]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0-rc1

### 추가됨 (Added)
- [Native Driver] `inMemoryDriver`에 `extendedConfig` 파라미터를 추가했습니다. (@GuilhE 작성, #5539)
- [PostgreSQL Dialect] 암시적으로 정의된 시스템 열에 대한 쿼리 지원을 추가했습니다. (@griffio 작성, #5834)
- [PostgreSQL Dialect] 기본적인 배열 리터럴 지원을 추가했습니다. (@griffio 작성, #5997)
- [PostgreSQL Dialect] 기본적인 LTREE 지원을 추가했습니다. (@yesitskev, @griffio 작성, #5880)
- [MySQL Dialect] INET 함수 지원을 추가했습니다. (@mcxinyu 작성, #5072)
- [PostgreSQL Dialect] ALTER INDEX 지원을 추가했습니다. (@griffio 작성, #6224)
- [SQLite Dialect] SQLite 3.44 집계 함수 DISTINCT, ORDER BY 및 FILTER 지원을 추가했습니다. (@griffio 작성, #6236)
- [SQLite Dialect] SQLite 3.37 STRICT 테이블 지원을 추가했습니다. (@griffio 작성, #6230)
- [Gradle Plugin] `codegenExcludedColumns`를 사용하여 생성된 모델에서 열을 제외하는 지원을 추가했습니다. (@sokolikp 작성, #6243)
- [Compiler] 스키마에 `allTableNames` 함수를 추가했습니다. (@edenman 작성, #6245)
- [PostgreSQL Dialect] ANY 연산자 지원을 추가했습니다. (@griffio 작성, #6253)
- [SQLite Dialect] SQLite 3.39의 RIGHT JOIN 및 FULL JOIN 지원을 추가했습니다. (@griffio 작성, #6273)
- [PostgreSQL Dialect] 트리거 함수에서 `RAISE` 문과 `FOUND` 변수 지원을 추가했습니다. (@griffio 작성, #6297)

### 변경됨 (Changed)
- [PostgreSQL Dialect] `arrayIntermediateType`의 가시성을 public으로 변경했습니다. (@griffio 작성, #5835)
- [Gradle Plugin] 더욱 엄격한 MigrationFile 버전 관리를 적용했습니다. (@madisp 작성, #5730)
- [Gradle Plugin] 지원하는 최소 Gradle 버전을 8.2.1로 상향했습니다. (@maxsav 작성, #6217)
- [Gradle Plugin] Gradle isolated projects를 지원합니다. (@maxsav 작성, #6217)
- [IntelliJ Plugin] 최소 지원 버전이 2023.3 / Android Studio Jellyfish로 변경되었습니다.

### 수정됨 (Fixed)
- [Gradle Plugin] JDK 24+ 환경의 컴파일러 워커에서 발생하는 `sun.misc.Unsafe` 지원 중단 경고를 억제했습니다. (#6321)
- [Compiler] 생성된 코드에서 불필요한 Kotlin 추가 경고를 억제했습니다. (@eyupcanakman 작성, #6208)
- [Compiler] 그룹화되지 않은 집계 결과 집합의 다른 열들이 항상 nullable이 되도록 수정했습니다.
- [PostgreSQL Dialect] coalesce 및 ifnull에 대해 nullability를 올바르게 확인하도록 수정했습니다.
- [PostgreSQL Dialect] PostgreSQL dialect의 IDE 통합을 수정했습니다.
- [PostgreSQL Dialect] PostgreSQL dialect용 IDE 플러그인을 개선했습니다. (@griffio 작성, #6209)
- [Intellij Plugin] IDE 플러그인이 모든 dialect에 대해 코드 완성을 수행할 수 있도록 개선했습니다. (@griffio 작성, #6210)
- [Gradle Plugin] 데이터베이스 검증 태스크 실행 시 발생하는 순환 종속성 오류를 수정했습니다. (@griffio 작성, #6221)
- [Compiler] 다중 행 업데이트에 대한 낙관적 락을 수정했습니다. (@griffio 작성, #6240)
- [Intellij Plugin] IDEA 2026.2에서 크래시를 유발하던 지원 중단 API 사용 문제를 수정했습니다. (@griffio 작성, #6247)
- [Gradle Plugin] AGP 8.9부터 8.11까지 생성된 소스가 Kotlin 컴파일에 인식되지 않던 문제를 수정했습니다.
- [PostgreSQL Dialect] Primitive 바인드 인자를 사용하는 lower 및 upper 함수가 기본적으로 TEXT로 처리되도록 수정했습니다. (@griffio 작성, #6262)
- [Compiler] 어댑터를 사용하고 마이그레이션이 nullability를 변경할 때 데이터 클래스 바인딩을 사용한 insert values 문제를 수정했습니다. (griffio 작성, #6269)
- [Compiler] Null-safe 연산자(IS 및 IS DISTINCT FROM)와 함께 nullable 바인드 인자를 사용하도록 수정했습니다. (@griffio 작성, #6265)
- [Gradle Plugin] 프로젝트 종속성에 AGP의 variant resolution을 사용하도록 변경했습니다. (@maxsav 작성, #6217)
- [Gradle Plugin] 빌드 간에 AGP variant 목록이 다를 때 generateDatabaseInterface 태스크의 빌드 캐시 미스가 발생하던 문제를 수정했습니다.
- [Gradle Plugin] 데이터베이스를 구성하지 않고 플러그인을 적용했을 때 IDE 동기화가 중단되던 현상을 수정했습니다. (#6088)
- [PostgreSQL Dialect] 중첩 함수 호출을 사용할 때 json 집계 함수가 올바르게 작동하도록 수정했습니다. (@griffio 작성, #6281)
- [Paging3 Extension] 빈 데이터베이스에서 KeyedQueryPagingSource 크래시가 발생하던 문제를 수정했습니다. (@woods-marshes 작성, #6284)
- [Compiler] `COALESCE`와 같은 캡슐화 함수와 함께 mutator 문이 사용될 때 발생하는 Java type adapter 문제를 수정했습니다. (@griffio 작성, #6292)
- [Compiler] 모듈 이름이 대문자로 시작할 때 생성된 코드의 패키지 이름도 대문자로 표기되던 문제를 수정했습니다. (@griffio 작성, #6316)
- [PostgreSQL Dialect] 날짜 데이터 유형의 대소문자를 구분하지 않도록 허용했습니다. (@griffio 작성, #6328)

## [2.3.2] - 2026-03-16 {id="2-3-2-2026-03-16"}
[2.3.2]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.2

### 추가됨 (Added)
- [PostgreSQL Dialect] ALTER TABLE ALTER TYPE USING 표현식에 대한 지원을 개선했습니다. (@griffio 작성, #6116)
- [PostgreSQL Dialect] DROP COLUMN IF EXISTS 지원을 추가했습니다. (@griffio 작성, #6112)
- [Gradle Plugin] Select 와일드카드 확장을 끌 수 있는 expandSelectStar 플래그를 추가했습니다. (@griffio 작성, #5813)
- [MySQL Dialect] 윈도우 함수(Window Functions) 지원을 추가했습니다. (@griffio 작성, #6086)
- [Gradle Plugin] 시작 스키마 버전이 1이 아니고 verifyMigrations가 true일 때 빌드가 실패하던 문제를 수정했습니다. (@neilgmiller 작성, #6017)
- [Gradle Plugin] `SqlDelightWorkerTask`의 설정 가능성을 높이고, Windows 환경 개발을 지원하도록 기본 설정을 업데이트했습니다. (@MSDarwish2000 작성, #5215)
- [SQLite Dialect] FTS5 가상 테이블에서 합성 열(synthesized columns) 지원을 추가했습니다. (@watbe 작성, #5986)
- [PostgreSQL Dialect] Postgres 행 수준 보안(row level security) 지원을 추가했습니다. (@shellderp 작성, #6087)
- [PostgreSQL Dialect] FOR UPDATE 구문이 OF table, NO KEY UPDATE, NO WAIT를 지원하도록 확장했습니다. (@shellderp 작성, #6104)
- [PostgreSQL Dialect] Postgis Point 타입 및 관련 함수 지원을 추가했습니다. (@vanniktech 작성, #5602)
- [Runtime] 트랜잭션의 `CoroutineContext`를 제어하는 메커니즘을 제공하는 `SuspendingTransacter.TransactionDispatcher`를 추가했습니다. (@eygraber 작성, #5967)
- [Gradle Plugin] Android Gradle Plugin 9.0의 새로운 DSL과의 완전한 호환성을 확보했습니다. (#6140)
- [PostgreSQL Dialect] PostgreSQL CREATE TABLE 저장소 파라미터(storage parameters)를 지원합니다. (@griffio 작성, #6148)
- [PostgreSQL Dialect] PostgreSQL 고유 테이블 제약 조건의 nullable 결과 열을 수정했습니다. (@griffio 작성, #6167)

### 변경됨 (Changed)
- [Compiler] 컴파일러 출력 타입을 java.lang.Void에서 kotlin.Nothing으로 변경했습니다. (@griffio 작성, #6099)
- [Compiler] 패키지 이름에 밑줄(_) 사용을 허용했습니다. 이전에는 밑줄이 정리(sanitize)되어 예기치 않은 동작이 발생했습니다. (@BierDav 작성, #6027)
- [Paging Extension] AndroidX Paging으로 전환했습니다. (@jeffdgr8 작성, #5910)
- [Android Driver] Android minSdk를 23으로 상향했습니다. (#6141)
- [Paging Extension] Paging 3.4.1로 업그레이드하고 X64 Apple 타깃을 제거했습니다. (#6166)

### 수정됨 (Fixed)
- [IntelliJ Plugin] VFS 새로고침 이벤트 중에 EDT에서 파일 형식 감지가 차단되어 IDE가 멈추던 현상을 수정했습니다.
- [SQLite Dialect] Json 경로 연산자 사용 시 SQLite 3.38 컴파일 오류를 수정했습니다. (@griffio 작성, #6070)
- [SQLite Dialect] 커스텀 열 타입을 사용할 때 group_concat 함수에 String 타입을 사용하도록 수정했습니다. (@griffio 작성, #6082)
- [Gradle Plugin] 복잡한 스키마에서 멈추지 않도록 `VerifyMigrationTask`의 성능을 개선했습니다. (@Lightwood13 작성, #6073)
- [Intellij Plugin] 플러그인 초기화 예외를 수정하고 지원 중단된 메서드를 업데이트했습니다. (@griffio 작성, #6040)
- [Gradle Plugin] Android Gradle Plugin에 내장된 Kotlin과의 호환성 문제를 해결했습니다. (#6139)

## [2.3.1] - 2025-03-12 {id="2-3-1-2025-03-12"}
[2.3.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.1

릴리스에 실패했습니다. 2.3.2를 사용하세요!

## [2.3.0] - 2025-03-12 {id="2-3-0-2025-03-12"}
[2.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.0

릴리스에 실패했습니다. 2.3.2를 사용하세요!

## [2.2.1] - 2025-11-13 {id="2-2-1-2025-11-13"}
[2.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.2.1

### 추가됨 (Added)
- [PostgreSQL Dialect] Postgres numeric/integer/biginteger 타입 매핑을 수정했습니다. (@griffio 작성, #5994)
- [Compiler] CAST가 필요할 때 소스 파일 위치를 포함하도록 컴파일러 오류 메시지를 개선했습니다. (@griffio 작성, #5979)
- [PostgreSQL Dialect] Postgres JSON 연산자 경로 추출 지원을 추가했습니다. (@griffio 작성, #5971)
- [SQLite Dialect] 공통 테이블 표현식(CTE)을 사용한 MATERIALIZED 쿼리 플래너 힌트에 대한 SQLite 3.35 지원을 추가했습니다. (@griffio 작성, #5961)
- [PostgreSQL Dialect] 공통 테이블 표현식(CTE)을 사용한 MATERIALIZED 쿼리 플래너 힌트 지원을 추가했습니다. (@griffio 작성, #5961)
- [PostgreSQL Dialect] Postgres JSON Aggregate FILTER 지원을 추가했습니다. (@griffio 작성, #5957)
- [PostgreSQL Dialect] Postgres 열거형(Enums) 지원을 추가했습니다. (@griffio 작성, #5935)
- [PostgreSQL Dialect] Postgres 트리거에 대한 제한적 지원을 추가했습니다. (@griffio 작성, #5932)
- [PostgreSQL Dialect] SQL 표현식을 JSON으로 파싱할 수 있는지 확인하는 조건자(predicate)를 추가했습니다. (@griffio 작성, #5843)
- [PostgreSQL Dialect] PostgreSQL Comment On 문에 대한 제한적 지원을 추가했습니다. (@griffio 작성, #5808)
- [MySQL Dialect] 인덱스 가시성 옵션 지원을 추가했습니다. (@orenkislev-faire 작성, #5785)
- [PostgreSql Dialect] TSQUERY 데이터 타입 지원을 추가했습니다. (@griffio 작성, #5779)
- [Gradle Plugin] 모듈 추가 시 버전 카탈로그(version catalogs) 지원을 추가했습니다. (@DRSchlaubi 작성, #5755)

### 변경됨 (Changed)
- 개발 중인 스냅샷이 이제 https://central.sonatype.com/repository/maven-snapshots/ 의 Central Portal Snapshots 저장소에 게시됩니다.
- [Compiler] 생성자 참조(constructor references)를 사용하여 기본 생성 쿼리를 단순화했습니다. (@jonapoul 작성, #5814)

### 수정됨 (Fixed)
- [Compiler] 공통 테이블 표현식(CTE)이 포함된 뷰를 사용할 때 발생하는 스택 오버플로를 수정했습니다. (@griffio 작성, #5928)
- [Gradle Plugin] "New Connection"을 추가하기 위해 SqlDelight 툴 윈도우를 열 때 발생하던 크래시를 수정했습니다. (@griffio 작성, #5906)
- [IntelliJ Plugin] copy-to-sqlite 거터(gutter) 액션에서 스레딩 관련 크래시를 방지했습니다. (@griffio 작성, #5901)
- [IntelliJ Plugin] CREATE INDEX 및 CREATE VIEW 스키마 문을 사용할 때 PostgreSQL dialect 관련 문제를 수정했습니다. (@griffio 작성, #5772)
- [Compiler] 열을 참조할 때 발생하는 FTS 스택 오버플로를 수정했습니다. (@griffio 작성, #5896)
- [Compiler] With Recursive 스택 오버플로를 수정했습니다. (@griffio 작성, #5892)
- [Compiler] Insert|Update|Delete Returning 문에 대한 알림(Notify)을 수정했습니다. (@griffio 작성, #5851)
- [Compiler] Long을 반환하는 트랜잭션 블록의 비동기 결과 타입을 수정했습니다. (@griffio 작성, #5836)
- [Compiler] SQL 파라미터 바인딩 복잡도를 O(n²)에서 O(n)으로 최적화했습니다. (@chenf7 작성, #5898)
- [SQLite Dialect] SQLite 3.18의 누락된 함수들을 수정했습니다. (@griffio 작성, #5759)

## [2.2.0] - 2025-11-13 {id="2-2-0-2025-11-13"}
[2.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.2.0

아티팩트가 일부만 게시되어 릴리스에 실패했습니다. 2.2.1을 사용하세요!

## [2.1.0] - 2025-05-16 {id="2-1-0-2025-05-16"}
[2.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.1.0

### 추가됨 (Added)
- [WASM Driver] 웹 워커 드라이버에 wasmJs 지원을 추가했습니다. (@IlyaGulya 작성, #5534)
- [PostgreSQL Dialect] PostgreSQL UnNest Array를 행으로 변환하는 기능을 지원합니다. (@griffio 작성, #5673)
- [PostgreSQL Dialect] PostgreSQL TSRANGE/TSTZRANGE 지원을 추가했습니다. (@griffio 작성, #5297)
- [PostgreSQL Dialect] PostgreSQL Right Full Join을 지원합니다. (@griffio 작성, #5086)
- [PostgreSQL Dialect] PostgreSQL 시간 타입에서의 extract를 지원합니다. (@griffio 작성, #5273)
- [PostgreSQL Dialect] PostgreSQL 배열 포함(array contains) 연산자를 지원합니다. (@griffio 작성, #4933)
- [PostgreSQL Dialect] PostgreSQL 제약 조건 삭제(drop constraint)를 지원합니다. (@griffio 작성, #5288)
- [PostgreSQL Dialect] PostgreSQL 타입 캐스팅을 지원합니다. (@griffio 작성, #5089)
- [PostgreSQL Dialect] 서브쿼리를 위한 PostgreSQL lateral join 연산자를 지원합니다. (@griffio 작성, #5122)
- [PostgreSQL Dialect] PostgreSQL ILIKE 연산자를 지원합니다. (@griffio 작성, #5330)
- [PostgreSQL Dialect] PostgreSQL XML 타입을 지원합니다. (@griffio 작성, #5331)
- [PostgreSQL Dialect] PostgreSQL AT TIME ZONE을 지원합니다. (@griffio 작성, #5243)
- [PostgreSQL Dialect] PostgreSQL order by nulls를 지원합니다. (@griffio 작성, #5199)
- [PostgreSQL Dialect] PostgreSQL 현재 날짜/시간 함수 지원을 추가했습니다. (@drewd 작성, #5226)
- [PostgreSQL Dialect] PostgreSQL 정규식(Regex) 연산자를 지원합니다. (@griffio 작성, #5137)
- [PostgreSQL Dialect] brin, gist 인덱스를 추가했습니다. (@griffio 작성, #5059)
- [MySQL Dialect] MySQL dialect를 위한 RENAME INDEX를 지원합니다. (@orenkislev-faire 작성, #5212)
- [JSON Extension] json 테이블 함수에 별칭(alias)을 추가했습니다. (@griffio 작성, #5372)

### 변경됨 (Changed)
- [Compiler] 생성된 쿼리 파일이 단순 mutator에 대해 행 수를 반환하도록 변경했습니다. (@MariusVolkhart 작성, #4578)
- [Native Driver] NativeSqlDatabase.kt를 업데이트하여 DELETE, INSERT 및 UPDATE 문에 대한 readonly 플래그를 변경했습니다. (@griffio 작성, #5680)
- [PostgreSQL Dialect] PgInterval을 String으로 변경했습니다. (@griffio 작성, #5403)
- [PostgreSQL Dialect] SqlDelight 모듈이 PostgreSQL 확장을 구현하도록 지원합니다. (@griffio 작성, #5677)

### 수정됨 (Fixed)
- [Compiler] 결과가 있는 그룹 문을 실행할 때 쿼리에 알림이 가도록 수정했습니다. (@vitorhugods 작성, #5006)
- [Compiler] SqlDelightModule 타입 리졸버를 수정했습니다. (@griffio 작성, #5625)
- [Compiler] 5501 이스케이프된 열 객체 삽입 문제를 수정했습니다. (@griffio 작성, #5503)
- [Compiler] 컴파일러: 경로 링크를 올바른 라인 및 문자 위치로 클릭할 수 있도록 오류 메시지를 개선했습니다. (@vanniktech 작성, #5604)
- [Compiler] 이슈 5298 수정: 키워드를 테이블 이름으로 사용할 수 있도록 허용했습니다.
- [Compiler] named executes를 수정하고 테스트를 추가했습니다.
- [Compiler] 초기화 문을 정렬할 때 외래 키(foreign key) 테이블 제약 조건을 고려하도록 수정했습니다. (@TheMrMilchmann 작성, #5325)
- [Compiler] 탭 문자가 포함되어 있을 때 오류 밑줄이 올바르게 정렬되도록 수정했습니다. (@drewd 작성, #5224)
- [JDBC Driver] 트랜잭션 종료 시 connectionManager의 메모리 누수를 수정했습니다.
- [JDBC Driver] 문서에 언급된 대로 SQLite 마이그레이션을 트랜잭션 내에서 실행하도록 수정했습니다. (@morki 작성, #5218)
- [JDBC Driver] 트랜잭션 커밋/롤백 후 누수되는 연결을 수정했습니다. (@morki 작성, #5205)
- [Gradle Plugin] `GenerateSchemaTask` 전에 `DriverInitializer`를 실행하도록 수정했습니다. (@nwagu 작성, #5562)
- [Runtime] 실제 드라이버가 Async일 때 LogSqliteDriver에서 발생하는 크래시를 수정했습니다. (@edenman 작성, #5723)
- [Runtime] StringBuilder 용량을 수정했습니다. (@janbina 작성, #5192)
- [PostgreSQL Dialect] PostgreSQL create or replace view 문제를 수정했습니다. (@griffio 작성, #5407)
- [PostgreSQL Dialect] PostgreSQL to_json 함수를 수정했습니다. (@griffio 작성, #5606)
- [PostgreSQL Dialect] PostgreSQL numeric 리졸버를 수정했습니다. (@griffio 작성, #5399)
- [PostgreSQL Dialect] SQLite 윈도우 함수 문제를 수정했습니다. (@griffio 작성, #2799)
- [PostgreSQL Dialect] PostgreSQL SELECT DISTINCT ON을 수정했습니다. (@griffio 작성, #5345)
- [PostgreSQL Dialect] alter table add column if not exists 문제를 수정했습니다. (@griffio 작성, #5309)
- [PostgreSQL Dialect] PostgreSQL async 바인드 파라미터를 수정했습니다. (@griffio 작성, #5313)
- [PostgreSQL Dialect] PostgreSQL boolean 리터럴을 수정했습니다. (@griffio 작성, #5262)
- [PostgreSQL Dialect] PostgreSQL 윈도우 함수를 수정했습니다. (@griffio 작성, #5155)
- [PostgreSQL Dialect] PostgreSQL isNull isNotNull 타입을 수정했습니다. (@griffio 작성, #5173)
- [PostgreSQL Dialect] PostgreSQL select distinct를 수정했습니다. (@griffio 작성, #5172)
- [Paging Extension] 페이징 새로고침 시 초기 로드 문제를 수정했습니다. (@evant 작성, #5615)
- [Paging Extension] macOS 네이티브 타깃을 추가했습니다. (@vitorhugods 작성, #5324)
- [IntelliJ Plugin] K2를 지원합니다.

## [2.0.2] - 2024-04-05 {id="2-0-2-2024-04-05"}
[2.0.2]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.2

### 추가됨 (Added)
- [PostgreSQL Dialect] PostgreSQL STRING_AGG 함수를 추가했습니다. (@anddani 작성, #4950)
- [PostgreSQL Dialect] pg dialect에 SET 문을 추가했습니다. (@de-luca 작성, #4927)
- [PostgreSQL Dialect] PostgreSQL alter column 시퀀스 파라미터를 추가했습니다. (@griffio 작성, #4916)
- [PostgreSQL Dialect] insert 문에 대한 PostgreSQL alter column default 지원을 추가했습니다. (@griffio 작성, #4912)
- [PostgreSQL Dialect] PostgreSQL alter sequence 및 drop sequence를 추가했습니다. (@griffio 작성, #4920)
- [PostgreSQL Dialect] Postgres 정규식 함수 정의를 추가했습니다. (@MariusVolkhart 작성, #5025)
- [PostgreSQL Dialect] GIN 문법을 추가했습니다. (@griffio 작성, #5027)

### 변경됨 (Changed)
- [IDE Plugin] 최소 지원 버전이 2023.1 / Android Studio Iguana로 상향되었습니다.
- [Compiler] `encapsulatingType`에서 타입 nullability 재정의를 허용했습니다. (@eygraber 작성, #4882)
- [Compiler] SELECT *에 대해 열 이름을 인라인화했습니다.
- [Gradle Plugin] `processIsolation`으로 전환했습니다. (@nwagu 작성, #5068)
- [Android Runtime] Android minSDK를 21로 상향했습니다. (@hfhbd 작성, #5094)
- [Drivers] dialect 작성자를 위해 더 많은 JDBC/R2DBC statement 메서드를 노출했습니다. (@hfhbd 작성, #5098)

### 수정됨 (Fixed)
- [PostgreSQL Dialect] PostgreSQL alter table alter column 오류를 수정했습니다. (@griffio 작성, #4868)
- [PostgreSQL Dialect] 4448 테이블 모델의 누락된 임포트를 수정했습니다. (@griffio 작성, #4885)
- [PostgreSQL Dialect] 4932 PostgreSQL 기본 제약 조건 함수 관련 문제를 수정했습니다. (@griffio 작성, #4934)
- [PostgreSQL Dialect] 마이그레이션 중 alter table rename column에서 발생하는 4879 PostgreSQL 클래스 캐스트 오류를 수정했습니다. (@griffio 작성, #4880)
- [PostgreSQL Dialect] 4474 PostgreSQL create extension 문제를 수정했습니다. (@griffio 작성, #4541)
- [PostgreSQL Dialect] 5018 PostgreSQL Primary Key 추가 시 non-nullable 타입 문제를 수정했습니다. (@griffio 작성, #5020)
- [PostgreSQL Dialect] 4703 집계 표현식을 수정했습니다. (@griffio 작성, #5071)
- [PostgreSQL Dialect] 5028 PostgreSQL json 관련 문제를 수정했습니다. (@griffio 작성, #5030)
- [PostgreSQL Dialect] 5040 PostgreSQL json 연산자를 수정했습니다. (@griffio 작성, #5041)
- [PostgreSQL Dialect] 5040에 대한 json 연산자 바인딩 문제를 수정했습니다. (@griffio 작성, #5100)
- [PostgreSQL Dialect] 5082 tsvector 문제를 수정했습니다. (@griffio 작성, #5104)
- [PostgreSQL Dialect] PostgreSQL UPDATE FROM 문에 대한 5032 열 인접성(column adjacency) 문제를 수정했습니다. (@griffio 작성, #5035)
- [SQLite Dialect] 4897 SQLite alter table rename column 문제를 수정했습니다. (@griffio 작성, #4899)
- [IDE Plugin] 에러 핸들러 크래시를 수정했습니다. (@aperfilyev 작성, #4988)
- [IDE Plugin] IDEA 2023.3에서 BugSnag 초기화 실패 문제를 수정했습니다. (@aperfilyev 작성)
- [IDE Plugin] 플러그인을 통해 IntelliJ에서 .sq 파일을 열 때 발생하는 PluginException을 수정했습니다. (@aperfilyev 작성)
- [IDE Plugin] Kotlin 라이브러리가 이미 플러그인 종속성으로 존재하므로 IntelliJ 플러그인에 번들링하지 않도록 수정했습니다. (#5126)
- [IDE Plugin] stream 대신 extensions 배열을 사용하도록 변경했습니다. (#5127)

## [2.0.1] - 2023-12-01 {id="2-0-1-2023-12-01"}
[2.0.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.1

### 추가됨 (Added)
- [Compiler] SELECT 수행 시 다중 열 표현식(multi-column-expr) 지원을 추가했습니다. (@Adriel-M 작성, #4453)
- [PostgreSQL Dialect] PostgreSQL CREATE INDEX CONCURRENTLY 지원을 추가했습니다. (@griffio 작성, #4531)
- [PostgreSQL Dialect] PostgreSQL CTE 보조 문(auxiliary statements)이 서로를 참조할 수 있도록 허용했습니다. (@griffio 작성, #4493)
- [PostgreSQL Dialect] 이항 표현식 및 sum에 대한 PostgreSQL 타입 지원을 추가했습니다. (@Adriel-M 작성, #4539)
- [PostgreSQL Dialect] PostgreSQL SELECT DISTINCT ON 문법 지원을 추가했습니다. (@griffio 작성, #4584)
- [PostgreSQL Dialect] SELECT 문에서 PostgreSQL JSON 함수 지원을 추가했습니다. (@MariusVolkhart 작성, #4590)
- [PostgreSQL Dialect] PostgreSQL `generate_series` 함수를 추가했습니다. (@griffio 작성, #4717)
- [PostgreSQL Dialect] 추가적인 Postgres 문자열 함수 정의를 추가했습니다. (@MariusVolkhart 작성, #4752)
- [PostgreSQL Dialect] min 및 max 집계 함수에 DATE PostgreSQL 타입을 추가했습니다. (@anddani 작성, #4816)
- [PostgreSQL Dialect] SqlBinaryExpr에 PostgreSQL 시간 타입을 추가했습니다. (@griffio 작성, #4657)
- [PostgreSQL Dialect] Postgres dialect에 TRUNCATE를 추가했습니다. (@de-luca 작성, #4817)
- [SQLite 3.35 Dialect] 순서대로 평가되는 여러 개의 ON CONFLICT 절을 허용했습니다. (@griffio 작성, #4551)
- [JDBC Driver] 더욱 편리한 SQL 편집을 위해 Language 어노테이션을 추가했습니다. (@MariusVolkhart 작성, #4602)
- [Native Driver] Native 드라이버: linuxArm64 지원을 추가했습니다. (@hfhbd 작성, #4792)
- [Android Driver] AndroidSqliteDriver에 `windowSizeBytes` 파라미터를 추가했습니다. (@BoD 작성, #4804)
- [Paging3 Extension] OffsetQueryPagingSource에 initialOffset을 추가했습니다. (@MohamadJaara 작성, #4802)

### 변경됨 (Changed)
- [Compiler] 적절한 경우 Kotlin 타입을 우선하도록 변경했습니다. (@eygraber 작성, #4517)
- [Compiler] 값 타입 삽입(value type insert) 시 항상 열 이름을 포함하도록 했습니다. (#4864)
- [PostgreSQL Dialect] PostgreSQL dialect의 실험적(experimental) 상태를 해제했습니다. (@hfhbd 작성, #4443)
- [PostgreSQL Dialect] PostgreSQL 타입 문서를 업데이트했습니다. (@MariusVolkhart 작성, #4569)
- [R2DBC Driver] PostgreSQL에서 정수 데이터 타입을 처리할 때의 성능을 최적화했습니다. (@MariusVolkhart 작성, #4588)

### 제거됨 (Removed) {id="removed"}
- [SQLite Javascript Driver] sqljs-driver를 제거했습니다. (@dellisd 작성, #4613, #4670)

### 수정됨 (Fixed)
- [Compiler] 반환값이 있고 파라미터가 없는 그룹화된 문의 컴파일을 수정했습니다. (@griffio 작성, #4699)
- [Compiler] SqlBinaryExpr로 인자를 바인딩하도록 수정했습니다. (@griffio 작성, #4604)
- [IDE Plugin] 설정된 경우 IDEA 프로젝트 JDK를 사용하도록 수정했습니다. (@griffio 작성, #4689)
- [IDE Plugin] IDEA 2023.2 이상에서 "Unknown element type: TYPE_NAME" 오류를 수정했습니다. (#4727)
- [IDE Plugin] 2023.2 버전과의 몇 가지 호환성 문제를 수정했습니다.
- [Gradle Plugin] `verifyMigrationTask` Gradle 태스크의 문서를 바로잡았습니다. (@joshfriend 작성, #4713)
- [Gradle Plugin] 사용자가 데이터베이스를 검증하기 전에 생성할 수 있도록 안내하는 Gradle 태스크 출력 메시지를 추가했습니다. (@jingwei99 작성, #4684)
- [PostgreSQL Dialect] PostgreSQL 열의 이름을 여러 번 변경할 때 발생하던 문제를 수정했습니다. (@griffio 작성, #4566)
- [PostgreSQL Dialect] 4714 PostgreSQL alter column nullability를 수정했습니다. (@griffio 작성, #4831)
- [PostgreSQL Dialect] 4837 alter table alter column 문제를 수정했습니다. (@griffio 작성, #4846)
- [PostgreSQL Dialect] 4501 PostgreSQL 시퀀스 문제를 수정했습니다. (@griffio 작성, #4528)
- [SQLite Dialect] 열 표현식에 JSON 이항 연산자를 사용할 수 있도록 허용했습니다. (@eygraber 작성, #4776)
- [SQLite Dialect] Update From에서 이름이 일치하는 다중 열이 발견되는 거짓 양성 오류를 수정했습니다. (@eygraber 작성, #4777)
- [Native Driver] 명명된 인메모리(named in-memory) 데이터베이스를 지원합니다. (@05nelsonm 작성, #4662)
- [Native Driver] 쿼리 리스너 컬렉션에 대한 스레드 안전성을 보장했습니다. (@kpgalligan 작성, #4567)
- [JDBC Driver] ConnectionManager의 연결 누수를 수정했습니다. (@MariusVolkhart 작성, #4589)
- [JDBC Driver] ConnectionManager 유형을 선택할 때 JdbcSqliteDriver url 파싱 오류를 수정했습니다. (@05nelsonm 작성, #4656)

## [2.0.0] - 2023-07-26 {id="2-0-0-2023-07-26"}
[2.0.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0

### 추가됨 (Added)
- [MySQL Dialect] MySQL: IF 표현식에서 timestamp/bigint를 지원합니다. (@shellderp 작성, #4329)
- [MySQL Dialect] MySQL: now 함수를 추가했습니다. (@hfhbd 작성, #4431)
- [Web Driver] NPM 패키지 게시를 활성화했습니다. (#4364)
- [IDE Plugin] Gradle 툴링 연결이 실패했을 때 사용자가 스택 트레이스를 볼 수 있도록 허용했습니다. (#4383)

### 변경됨 (Changed)
- [Sqlite Driver] JdbcSqliteDriver에 대한 스키마 마이그레이션 사용법을 단순화했습니다. (@morki 작성, #3737)
- [R2DBC Driver] 진정한 비동기 R2DBC 커서를 지원합니다. (@hfhbd 작성, #4387)

### 수정됨 (Fixed)
- [IDE Plugin] 필요할 때까지 데이터베이스 프로젝트 서비스를 인스턴스화하지 않도록 변경했습니다. (#4382)
- [IDE Plugin] Find Usages 수행 중 프로세스 취소를 처리하도록 수정했습니다. (#4340)
- [IDE Plugin] 비동기 코드의 IDE 생성을 수정했습니다. (#4406)
- [IDE Plugin] 패키지 구조 어셈블리를 1회성 계산으로 변경하고 EDT 외부로 이동했습니다. (#4417)
- [IDE Plugin] 2023.2에서 Kotlin 타입 확인을 위해 올바른 스텁 인덱스 키를 사용하도록 수정했습니다. (#4416)
- [IDE Plugin] 검색을 수행하기 전에 인덱스가 준비될 때까지 대기하도록 했습니다. (#4419)
- [IDE Plugin] 인덱스를 사용할 수 없는 경우 goto 동작을 수행하지 않도록 수정했습니다. (#4420)
- [Compiler] 그룹화된 문의 결과 표현식을 수정했습니다. (#4378)
- [Compiler] 가상 테이블을 인터페이스 타입으로 사용하지 않도록 수정했습니다. (@hfhbd 작성, #4427)

## [2.0.0-rc02] - 2023-06-27 {id="2-0-0-rc02-2023-06-27"}
[2.0.0-rc02]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-rc02

### 추가됨 (Added)
- [MySQL Dialect] 소문자 날짜 타입 및 날짜 타입에 대한 min, max를 지원합니다. (@shellderp 작성, #4243)
- [MySQL Dialect] 이항 표현식 및 sum에 대한 MySQL 타입을 지원합니다. (@shellderp 작성, #4254)
- [MySQL Dialect] 디스플레이 너비가 없는 부호 없는 정수(unsigned ints)를 지원합니다. (@shellderp 작성, #4306)
- [MySQL Dialect] LOCK IN SHARED MODE를 지원합니다.
- [PostgreSQL Dialect] min max에 boolean 및 Timestamp를 추가했습니다. (@griffio 작성, #4245)
- [PostgreSQL Dialect] Postgres: 윈도우 함수 지원을 추가했습니다. (@hfhbd 작성, #4283)
- [Runtime] 런타임에 linuxArm64, androidNative 및 watchosDeviceArm 타깃을 추가했습니다. (@hfhbd 작성, #4258)
- [Paging Extension] 페이징 확장에 linux 및 mingw x64 타깃을 추가했습니다. (@chippman 작성, #4280)

### 변경됨 (Changed)
- [Gradle Plugin] Android API 34에 대한 자동 dialect 지원을 추가했습니다. (#4251)
- [Paging Extension] QueryPagingSource에서 SuspendingTransacter 지원을 추가했습니다. (@daio 작성, #4292)
- [Runtime] addListener API를 개선했습니다. (@hfhbd 작성, #4244)
- [Runtime] 마이그레이션 버전에 Long을 사용합니다. (@hfhbd 작성, #4297)

### 수정됨 (Fixed)
- [Gradle Plugin] 생성된 소스에 안정적인 출력 경로를 사용하도록 수정했습니다. (@joshfriend 작성, #4269)
- [Gradle Plugin] Gradle 관련 사소한 사항을 조정했습니다. (@3flex 작성, #4222)

## [2.0.0-rc01] - 2023-05-29 {id="2-0-0-rc01-2023-05-29"}
[2.0.0-rc01]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-rc01

### 추가됨 (Added)
- [Paging] 페이징 확장에 js browser 타깃을 추가했습니다. (@sproctor 작성, #3843)
- [Paging] androidx-paging3 확장에 iosSimulatorArm64 타깃을 추가했습니다. (#4117)
- [PostgreSQL Dialect] `gen_random_uuid()`에 대한 지원 및 테스트를 추가했습니다. (@davidwheeler123 작성, #3855)
- [PostgreSQL Dialect] PostgreSQL alter table 제약 조건 추가(add constraint)를 지원합니다. (@griffio 작성, #4116)
- [PostgreSQL Dialect] alter table 제약 조건 check 추가를 지원합니다. (@griffio 작성, #4120)
- [PostgreSQL Dialect] PostgreSQL 문자 길이 함수들을 추가했습니다. (@griffio 작성, #4121)
- [PostgreSQL Dialect] PostgreSQL 열 기본 interval을 추가했습니다. (@griffio 작성, #4142)
- [PostgreSQL Dialect] PostgreSQL interval 열 결과를 추가했습니다. (@griffio 작성, #4152)
- [PostgreSQL Dialect] PostgreSQL Alter Column을 추가했습니다. (@griffio 작성, #4165)
- [PostgreSQL Dialect] PostgreSQL: `date_part`를 추가했습니다. (@hfhbd 작성, #4198)
- [MySQL Dialect] SQL 문자 길이 함수들을 추가했습니다. (@griffio 작성, #4134)
- [IDE Plugin] sqldelight 디렉터리 제안 기능을 추가했습니다. (@aperfilyev 작성, #3976)
- [IDE Plugin] 프로젝트 트리에서 중간 패키지 축소 표시를 지원합니다. (@aperfilyev 작성, #3992)
- [IDE Plugin] 조인 절 완성을 추가했습니다. (@aperfilyev 작성, #4086)
- [IDE Plugin] 뷰 생성 의도(intention) 및 라이브 템플릿을 추가했습니다. (@aperfilyev 작성, #4074)
- [IDE Plugin] DELETE 또는 UPDATE 내에서 WHERE 절 누락 시 경고를 표시합니다. (@aperfilyev 작성, #4058)
- [Gradle Plugin] 타입 안전 프로젝트 접근자(typesafe project accessors)를 활성화했습니다. (@hfhbd 작성, #4005)

### 변경됨 (Changed)
- [Gradle Plugin] ServiceLoader 메커니즘을 통해 VerifyMigrationTask에 DriverInitializer를 등록할 수 있도록 허용했습니다. (@C2H6O 작성, #3986)
- [Gradle Plugin] 명시적인 컴파일러 환경을 생성하도록 변경했습니다. (@hfhbd 작성, #4079)
- [JS Driver] 웹 워커 드라이버를 별도의 아티팩트로 분리했습니다.
- [JS Driver] JsWorkerSqlCursor를 외부에 노출하지 않도록 수정했습니다. (@hfhbd 작성, #3874)
- [JS Driver] sqljs 드라이버 게시를 비활성화했습니다. (#4108)
- [Runtime] 동기식 드라이버에는 동기식 스키마 초기화 프로그램이 필요하도록 강제했습니다. (#4013)
- [Runtime] Cursor에 대한 비동기 지원을 개선했습니다. (#4102)
- [Runtime] 더 이상 사용되지 않는 지원 중단 타깃들을 제거했습니다. (@hfhbd 작성, #4149)
- [Runtime] 구형 메모리 모델(old MM) 지원을 제거했습니다. (@hfhbd 작성, #4148)

### 수정됨 (Fixed)
- [R2DBC Driver] R2DBC: 드라이버 닫기(closing) 비동기 대기 처리를 수정했습니다. (@hfhbd 작성, #4139)
- [Compiler] 마이그레이션의 PRAGMA를 데이터베이스 `create(SqlDriver)`에 포함하도록 수정했습니다. (@MariusVolkhart 작성, #3845)
- [Compiler] RETURNING 절에 대한 코드 생성을 수정했습니다. (@MariusVolkhart 작성, #3872)
- [Compiler] 가상 테이블에 대한 타입을 생성하지 않도록 수정했습니다. (#4015)
- [Gradle Plugin] 사소한 Gradle 플러그인 사용성 개선(QoL) 작업을 진행했습니다. (@zacsweers 작성, #3930)
- [IDE Plugin] 해결되지 않는 Kotlin 타입을 수정했습니다. (@aperfilyev 작성, #3924)
- [IDE Plugin] 와일드카드 확장 인텐션이 한정자(qualifier)와 함께 동작하도록 수정했습니다. (@aperfilyev 작성, #3979)
- [IDE Plugin] java home이 누락된 경우 사용 가능한 JDK를 사용하도록 수정했습니다. (@aperfilyev 작성, #3925)
- [IDE Plugin] 패키지 이름에서 Find Usages가 동작하도록 수정했습니다. (#4010)
- [IDE Plugin] 유효하지 않은 요소에 대해 자동 가져오기를 표시하지 않도록 수정했습니다. (#4008)
- [IDE Plugin] dialect가 누락된 경우 해석을 진행하지 않도록 수정했습니다. (#4009)
- [IDE Plugin] 무효화된 상태에서는 컴파일러의 IDE 실행을 무시하도록 수정했습니다. (#4016)
- [IDE Plugin] IntelliJ 2023.1 지원을 추가했습니다. (@madisp 작성, #4037)
- [IDE Plugin] 열 이름 변경 시 명명된 인자(named argument) 사용처의 이름도 함께 변경되도록 수정했습니다. (@aperfilyev 작성, #4027)
- [IDE Plugin] 마이그레이션 추가 팝업을 수정했습니다. (@aperfilyev 작성, #4105)
- [IDE Plugin] 마이그레이션 파일에서 SchemaNeedsMigrationInspection을 비활성화했습니다. (@aperfilyev 작성, #4106)
- [IDE Plugin] 마이그레이션 생성 시 타입 이름 대신 SQL 열 이름을 사용하도록 수정했습니다. (@aperfilyev 작성, #4112)

## [2.0.0-alpha05] - 2023-01-20 {id="2-0-0-alpha05-2023-01-20"}
[2.0.0-alpha05]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha05

### 추가됨 (Added)
- [Paging] 멀티플랫폼 페이징 확장 (작성자: @jeffdgr8)
- [Runtime] Listener 인터페이스에 `fun` 수식어를 추가했습니다.
- [SQLite Dialect] SQLite 3.33 지원 (UPDATE FROM) 추가 (작성자: @eygraber)
- [PostgreSQL Dialect] PostgreSQL에서 UPDATE FROM 지원 (작성자: @eygraber)

### 변경됨 (Changed)
- [RDBC Driver] 커넥션을 노출하도록 변경 (작성자: @hfhbd)
- [Runtime] 마이그레이션 콜백을 메인 `migrate` 함수로 이동했습니다.
- [Gradle Plugin] 다운스트림 프로젝트로부터 설정을 숨기도록 처리했습니다.
- [Gradle Plugin] IntelliJ 의존성만 셰이딩(shade)하도록 변경 (작성자: @hfhbd)
- [Gradle Plugin] Kotlin 1.8.0-Beta를 지원하고 다중 버전 Kotlin 테스트를 추가했습니다. (작성자: @hfhbd)

### 수정됨 (Fixed)
- [RDBC Driver] 대신 javaObjectType을 사용하도록 수정 (작성자: @hfhbd)
- [RDBC Driver] `bindStatement`의 원시형(primitive) null 값을 수정했습니다. (작성자: @hfhbd)
- [RDBC Driver] R2DBC 1.0을 지원합니다. (작성자: @hfhbd)
- [PostgreSQL Dialect] Postgres: 타입 파라미터가 없는 Array 문제를 수정했습니다. (작성자: @hfhbd)
- [IDE Plugin] IntelliJ 버전을 221.6008.13으로 올렸습니다. (작성자: @hfhbd)
- [Compiler] 순수 뷰(pure views)에서 재귀적인 원본 테이블을 확인하도록 수정했습니다. (작성자: @hfhbd)
- [Compiler] 테이블 외래 키 절에서 값 클래스(value classes)를 사용하도록 수정했습니다. (작성자: @hfhbd)
- [Compiler] 괄호가 없는 바인드 표현식을 지원하도록 SelectQueryGenerator를 수정했습니다. (작성자: @bellatoris)
- [Compiler] 트랜잭션 사용 시 `${name}Indexes` 변수가 중복 생성되던 문제를 수정했습니다. (작성자: @sachera)

## [1.5.5] - 2023-01-20 {id="1-5-5-2023-01-20"}
[1.5.5]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.5

이 버전은 Kotlin 1.8 및 IntelliJ 2021+ 호환성 릴리스이며, JDK 17을 지원합니다.

## [1.5.4] - 2022-10-06 {id="1-5-4-2022-10-06"}
[1.5.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.4

이 버전은 Kotlin 1.7.20 및 AGP 7.3.0 호환성 업데이트입니다.

## [2.0.0-alpha04] - 2022-10-03 {id="2-0-0-alpha04-2022-10-03"}
[2.0.0-alpha04]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha04

### 주요 변경 사항 (Breaking Changes) {id="breaking-changes"}

- Paging 3 확장 API가 count에 int 타입만 허용하도록 변경되었습니다.
- 코루틴 확장은 이제 기본 디스패처 대신 명시적으로 디스패처를 전달받아야 합니다.
- Dialect 및 Driver 클래스가 final로 지정되었으므로 상속 대신 위임(delegation)을 사용하세요.

### 추가됨 (Added)
- [HSQL Dialect] Hsql: Insert 시 생성된 열에 DEFAULT 사용을 지원합니다. (@hfhbd 작성, #3372)
- [PostgreSQL Dialect] PostgreSQL: INSERT 시 생성된 열에 DEFAULT 사용을 지원합니다. (@hfhbd 작성, #3373)
- [PostgreSQL Dialect] PostgreSQL에 NOW()를 추가했습니다. (@hfhbd 작성, #3403)
- [PostgreSQL Dialect] PostgreSQL에 NOT 연산자를 추가했습니다. (@hfhbd 작성, #3504)
- [Paging] *QueryPagingSource에 CoroutineContext 전달을 허용했습니다. (#3384)
- [Gradle Plugin] dialect에 대한 더 나은 버전 카탈로그 지원을 추가했습니다. (#3435)
- [Native Driver] NativeSqliteDriver의 DatabaseConfiguration 생성에 훅을 걸 수 있는 콜백을 추가했습니다. (@svenjacobs 작성, #3512)

### 변경됨 (Changed)
- [Paging] KeyedQueryPagingSource 기반 QueryPagingSource 함수에 기본 디스패처를 추가했습니다. (#3385)
- [Paging] OffsetQueryPagingSource가 Int에서만 작동하도록 변경했습니다. (#3386)
- [Async Runtime] `await*`를 상위 클래스인 ExecutableQuery로 이동했습니다. (@hfhbd 작성, #3524)
- [Coroutines Extensions] Flow 확장의 기본 파라미터를 제거했습니다. (#3489)

### 수정됨 (Fixed)
- [Gradle Plugin] Kotlin 1.7.20으로 업데이트했습니다. (@zacsweers 작성, #3542)
- [R2DBC Driver] 항상 값을 보내지 않는 R2DBC 변경 사항을 반영했습니다. (@hfhbd 작성, #3525)
- [HSQL Dialect] Hsql 사용 시 실패하던 SQLite VerifyMigrationTask를 수정했습니다. (@hfhbd 작성, #3380)
- [Gradle Plugin] 태스크가 지연 구성 API(lazy configuration API)를 사용하도록 변환했습니다. (작성자: @3flex)
- [Gradle Plugin] Kotlin 1.7.20에서 NPE가 발생하지 않도록 수정했습니다. (@ZacSweers 작성, #3398)
- [Gradle Plugin] squash migrations 태스크의 설명을 바로잡았습니다. (#3449)
- [IDE Plugin] 최신 Kotlin 플러그인에서 NoSuchFieldError가 발생하는 문제를 수정했습니다. (@madisp 작성, #3422)
- [IDE Plugin] IDEA: UnusedQueryInspection의 ArrayIndexOutOfBoundsException을 수정했습니다. (@vanniktech 작성, #3427)
- [IDE Plugin] 구형 Kotlin 플러그인 참조를 위해 리플렉션을 사용하도록 수정했습니다.
- [Compiler] 확장 함수가 있는 커스텀 dialect가 임포트를 생성하지 않던 문제를 수정했습니다. (@hfhbd 작성, #3338)
- [Compiler] `CodeBlock.of("${CodeBlock.toString()}")` 이스케이프 문제를 수정했습니다. (@hfhbd 작성, #3340)
- [Compiler] 마이그레이션에서 비동기 실행 문을 await하도록 수정했습니다. (#3352)
- [Compiler] AS 관련 오류를 수정했습니다. (@hfhbd 작성, #3370)
- [Compiler] `getObject` 메서드가 실제 타입의 자동 채우기를 지원합니다. (@robxyy 작성, #3401)
- [Compiler] 비동기 그룹화된 returning 문에 대한 코드 생성을 수정했습니다. (#3411)
- [Compiler] 가능한 경우 바인드 파라미터의 Kotlin 타입을 유추하고, 그렇지 않은 경우 더 나은 오류 메시지와 함께 실패하도록 개선했습니다. (@hfhbd 작성, #3413)
- [Compiler] `ABS("foo")` 사용을 허용하지 않도록 제한했습니다. (@hfhbd 작성, #3430)
- [Compiler] 다른 파라미터로부터 Kotlin 타입을 추론할 수 있도록 지원합니다. (@hfhbd 작성, #3431)
- [Compiler] 항상 데이터베이스 구현을 생성하도록 수정했습니다. (@hfhbd 작성, #3540)
- [Compiler] javaDoc 검사를 완화하고 커스텀 매퍼 함수에도 javaDoc을 추가했습니다. (@hfhbd 작성, #3554)
- [Compiler] 바인딩의 DEFAULT 문제를 수정했습니다. (작성자: @hfhbd)
- [Paging] Paging 3 관련 문제를 수정했습니다. (#3396)
- [Paging] Long을 사용한 OffsetQueryPagingSource 생성을 허용했습니다. (#3409)
- [Paging] Dispatchers.Main을 정적으로 교체하지 않도록 수정했습니다. (#3428)

## [2.0.0-alpha03] - 2022-06-17 {id="2-0-0-alpha03-2022-06-17"}
[2.0.0-alpha03]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha03

### 주요 변경 사항 (Breaking Changes)

- Dialect는 이제 실제 Gradle 의존성처럼 참조됩니다.
```groovy
sqldelight {
  MyDatabase {
    dialect("app.cash.sqldelight:postgres-dialect:2.0.0-alpha03")
  }
}
```
- `AfterVersionWithDriver` 타입이 제거되고, 항상 드라이버를 포함하는 `AfterVersion`으로 대체되었습니다.
- `Schema` 타입은 더 이상 `SqlDriver`의 하위 타입이 아닙니다.
- `PreparedStatement` API는 이제 0부터 시작하는 인덱스(zero-based index)로 호출됩니다.

### 추가됨 (Added)
- [IDE Plugin] 실행 중인 데이터베이스에 대해 SQLite, MySQL 및 PostgreSQL 명령을 실행할 수 있는 지원을 추가했습니다. (@aperfilyev 작성, #2718)
- [IDE Plugin] Android Studio DB inspector 지원을 추가했습니다. (@aperfilyev 작성, #3107)
- [Runtime] 비동기 드라이버 지원을 추가했습니다. (@dellisd 작성, #3168)
- [Native Driver] 새로운 Kotlin Native 메모리 모델을 지원합니다. (@kpgalligan 작성, #3177)
- [JS Driver] SqlJs 워커용 드라이버를 추가했습니다. (@dellisd 작성, #3203)
- [Gradle Plugin] SQLDelight 태스크를 위한 클래스패스(classpath)를 노출했습니다.
- [Gradle Plugin] 마이그레이션을 합치는(squashing) Gradle 태스크를 추가했습니다.
- [Gradle Plugin] 마이그레이션 검사 중 스키마 정의를 무시할 수 있는 플래그를 추가했습니다.
- [MySQL Dialect] MySQL에서 FOR SHARE 및 FOR UPDATE를 지원합니다. (#3098)
- [MySQL Dialect] MySQL 인덱스 힌트를 지원합니다. (#3099)
- [PostgreSQL Dialect] `date_trunc`를 추가했습니다. (@hfhbd 작성, #3295)
- [JSON Extensions] JSON 테이블 함수를 지원합니다. (#3090)

### 변경됨 (Changed)
- [Runtime] 드라이버가 없는 AfterVersion 타입을 제거했습니다. (#3091)
- [Runtime] Schema 타입을 최상위(top-level)로 이동했습니다.
- [Runtime] 서드파티 구현을 지원하기 위해 dialect 및 resolver를 개방(open)했습니다. (@hfhbd 작성, #3232)
- [Compiler] 컴파일에 사용된 dialect를 실패 보고서에 포함하도록 했습니다. (#3086)
- [Compiler] 사용되지 않는 어댑터를 건너뛰도록 처리했습니다. (@eygraber 작성, #3162)
- [Compiler] PrepareStatement에서 0부터 시작하는 인덱스를 사용하도록 변경했습니다. (@hfhbd 작성, #3269)
- [Gradle Plugin] 문자열 대신 dialect를 올바른 Gradle 종속성으로 지정하도록 개선했습니다. (#3085)
- [Gradle Plugin] Gradle Verify Task: 데이터베이스 파일이 누락된 경우 예외를 발생시키도록 했습니다. (@vanniktech 작성, #3126)

### 수정됨 (Fixed)
- [Gradle Plugin] Gradle 플러그인의 사소한 정리 및 개선 작업을 진행했습니다. (@3flex 작성, #3171)
- [Gradle Plugin] 생성된 디렉터리에 AGP 문자열을 사용하지 않도록 수정했습니다.
- [Gradle Plugin] AGP 네임스페이스 속성을 사용하도록 수정했습니다. (#3220)
- [Gradle Plugin] kotlin-stdlib을 Gradle 플러그인의 런타임 종속성으로 추가하지 않도록 수정했습니다. (@mbonnin 작성, #3245)
- [Gradle Plugin] 멀티플랫폼 구성을 단순화했습니다. (@mbonnin 작성, #3246)
- [Gradle Plugin] JS 단독 프로젝트를 지원합니다. (@hfhbd 작성, #3310)
- [IDE Plugin] Gradle tooling API에 java home을 사용하도록 수정했습니다. (#3078)
- [IDE Plugin] IDE 플러그인 내 올바른 classLoader에서 JDBC 드라이버를 로드하도록 수정했습니다. (#3080)
- [IDE Plugin] 기존 PSI 변경 중 오류를 방지하기 위해 무효화하기 전에 파일 요소를 null로 표시하도록 했습니다. (#3082)
- [IDE Plugin] ALTER TABLE 문에서 새 테이블 이름을 찾을 때 크래시가 발생하지 않도록 수정했습니다. (#3106)
- [IDE Plugin] 검사기(inspectors)를 최적화하고 예상되는 예외 유형에 대해 조용히 실패하도록 처리했습니다. (#3121)
- [IDE Plugin] 생성된 디렉터리여야 하는 파일들을 삭제하도록 수정했습니다. (#3198)
- [IDE Plugin] 안전하지 않은 연산자 호출(not-safe operator call)을 수정했습니다.
- [Compiler] RETURNING 문이 포함된 업데이트 및 삭제 시 쿼리가 실행되도록 보장했습니다. (#3084)
- [Compiler] 복합 select(compound selects)에서 인자 타입을 올바르게 추론하도록 수정했습니다. (#3096)
- [Compiler] 공통 테이블은 데이터 클래스를 생성하지 않으므로 반환하지 않도록 수정했습니다. (#3097)
- [Compiler] 최상위 마이그레이션 파일을 더 빠르게 찾도록 개선했습니다. (#3108)
- [Compiler] 파이프 연산자에서 nullability가 올바르게 상속되도록 수정했습니다.
- [Compiler] IIF ANSI SQL 함수를 지원합니다.
- [Compiler] 빈 쿼리 파일을 생성하지 않도록 수정했습니다. (@hfhbd 작성, #3300)
- [Compiler] 물음표만 있는 어댑터 문제를 수정했습니다. (@hfhbd 작성, #3314)
- [PostgreSQL Dialect] Postgres 기본 키 열은 항상 non-null로 처리되도록 수정했습니다. (#3092)
- [PostgreSQL Dialect] 여러 테이블에서 동일한 이름을 복사할 때 발생하는 문제를 수정했습니다. (@hfhbd 작성, #3297)
- [SQLite 3.35 Dialect] 변경된 테이블에서 인덱싱된 열을 삭제할 때만 오류를 표시하도록 수정했습니다. (@eygraber 작성, #3158)

## [2.0.0-alpha02] - 2022-04-13 {id="2-0-0-alpha02-2022-04-13"}
[2.0.0-alpha02]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha02

### 주요 변경 사항 (Breaking Changes)

- `app.cash.sqldelight.runtime.rx`의 모든 항목을 `app.cash.sqldelight.rx2`로 변경해야 합니다.

### 추가됨 (Added)
- [Compiler] 그룹화된 문의 끝에서 반환하는 기능을 지원합니다.
- [Compiler] dialect 모듈을 통한 컴파일러 확장을 지원하고 SQLite JSON 확장을 추가했습니다. (#1379, #2087)
- [Compiler] 값을 반환하는 PRAGMA 문을 지원합니다. (#1106)
- [Compiler] 지정된 열에 대한 값 타입 생성을 지원합니다.
- [Compiler] 낙관적 락(optimistic locks) 및 유효성 검증 지원을 추가했습니다. (#1952)
- [Compiler] 다중 업데이트(multi-update) 문을 지원합니다.
- [PostgreSQL] Postgres returning 문을 지원합니다.
- [PostgreSQL] Postgres 날짜 타입을 지원합니다.
- [PostgreSQL] pg intervals를 지원합니다.
- [PostgreSQL] PG Booleans를 지원하고 alter tables에서의 insert 문제를 수정했습니다.
- [PostgreSQL] Postgres의 선택적 limits를 지원합니다.
- [PostgreSQL] PG BYTEA 타입을 지원합니다.
- [PostgreSQL] Postgres serials에 대한 테스트를 추가했습니다.
- [PostgreSQL] Postgres for update 문법을 지원합니다.
- [PostgreSQL] PostgreSQL 배열 타입을 지원합니다.
- [PostgreSQL] PG에서 UUID 타입을 적절히 저장/검색할 수 있도록 지원합니다.
- [PostgreSQL] PostgreSQL NUMERIC 타입을 지원합니다. (#1882)
- [PostgreSQL] 공통 테이블 표현식(CTE) 내부에서 쿼리 반환을 지원합니다. (#2471)
- [PostgreSQL] JSON 관련 특정 연산자를 지원합니다.
- [PostgreSQL] Postgres Copy를 추가했습니다. (작성자: @hfhbd)
- [MySQL] MySQL Replace를 지원합니다.
- [MySQL] NUMERIC/BigDecimal MySQL 타입을 지원합니다. (#2051)
- [MySQL] MySQL truncate 문을 지원합니다.
- [MySQL] MySQL에서 JSON 관련 특정 연산자를 지원합니다. (작성자: @eygraber)
- [MySQL] MySQL INTERVAL을 지원합니다. (@eygraber 작성, #2969)
- [HSQL] HSQL 윈도우 기능을 추가했습니다.
- [SQLite] WHERE 절에서 nullable 파라미터에 대한 동일성 검사를 대체하지 않도록 수정했습니다. (@eygraber 작성, #1490)
- [SQLite] SQLite 3.35 returning 문을 지원합니다. (@eygraber 작성, #1490)
- [SQLite] GENERATED 절을 지원합니다.
- [SQLite] SQLite 3.38 dialect 지원을 추가했습니다. (작성자: @eygraber)

### 변경됨 (Changed)
- [Compiler] 생성된 코드를 다듬었습니다.
- [Compiler] 그룹화된 문에서 테이블 파라미터 사용을 금지했습니다. (#1822)
- [Compiler] 그룹화된 쿼리를 트랜잭션 내부에 배치하도록 변경했습니다. (#2785)
- [Runtime] 드라이버의 execute 메서드에서 업데이트된 행 수를 반환하도록 했습니다.
- [Runtime] SqlCursor가 커넥션에 접근하는 임계 영역(critical section) 내에 국한되도록 제한했습니다. (@andersio 작성, #2123)
- [Gradle Plugin] 마이그레이션을 위한 스키마 정의를 비교하도록 변경했습니다. (#841)
- [PostgreSQL] PG에서 큰따옴표 사용을 금지했습니다.
- [MySQL] MySQL에서 == 사용 시 오류를 발생시키도록 변경했습니다. (#2673)

### 수정됨 (Fixed)
- [Compiler] 2.0 alpha에서 서로 다른 테이블의 동일한 어댑터 타입으로 인해 발생하던 컴파일 오류를 수정했습니다.
- [Compiler] upsert 문 컴파일 문제를 수정했습니다. (#2791)
- [Compiler] 매치되는 대상이 여러 개일 때 쿼리 결과가 select 내의 테이블을 사용하도록 수정했습니다. (#1874, #2313)
- [Compiler] INSTEAD OF 트리거가 있는 뷰의 업데이트를 지원하도록 수정했습니다. (#1018)
- [Compiler] 함수 이름에서 from 및 for 사용을 지원합니다.
- [Compiler] 함수 표현식에서 SEPARATOR 키워드를 허용했습니다.
- [Compiler] ORDER BY에서 별칭이 지정된 테이블의 ROWID에 접근할 수 없던 문제를 수정했습니다.
- [Compiler] MySQL의 HAVING 절에서 별칭 열 이름이 인식되지 않던 문제를 수정했습니다.
- [Compiler] 잘못된 'Multiple columns found' 오류를 수정했습니다.
- [Compiler] `PRAGMA locking_mode = EXCLUSIVE;`를 설정할 수 없던 문제를 수정했습니다.
- [PostgreSQL] PostgreSQL 열 이름 변경(rename column)을 수정했습니다.
- [MySQL] UNIX_TIMESTAMP, TO_SECONDS, JSON_ARRAYAGG MySQL 함수가 인식되지 않던 문제를 수정했습니다.
- [SQLite] SQLite 윈도우 기능 문제를 수정했습니다.
- [IDE Plugin] 빈 진행률 표시기(progress indicator)에서 goto 핸들러를 실행하도록 수정했습니다. (#2990)
- [IDE Plugin] 프로젝트가 구성되지 않은 경우 하이라이트 방문자(highlight visitor)가 실행되지 않도록 보장했습니다. (#2981, #2976)
- [IDE Plugin] 전이적으로 생성된 코드도 IDE에서 업데이트되도록 보장했습니다. (#1837)
- [IDE Plugin] dialect를 업데이트할 때 인덱스를 무효화하도록 수정했습니다.

## [2.0.0-alpha01] - 2022-03-31 {id="2-0-0-alpha01-2022-03-31"}
[2.0.0-alpha01]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha01

이 릴리스는 2.0의 첫 번째 알파 릴리스이며 몇 가지 호환성이 깨지는 변경 사항(breaking changes)이 포함되어 있습니다. 향후 더 많은 ABI 변경 사항이 있을 것으로 예상되므로, 이 릴리스에 의존성을 가진 라이브러리를 게시하지 마세요(일반 애플리케이션 개발에는 문제가 없습니다).

### 주요 변경 사항 (Breaking Changes)

- 첫째, `com.squareup.sqldelight`의 모든 항목을 `app.cash.sqldelight`로 변경해야 합니다.
- 둘째, `app.cash.sqldelight.android`의 모든 항목을 `app.cash.sqldelight.driver.android`로 변경해야 합니다.
- 셋째, `app.cash.sqldelight.sqlite.driver`의 모든 항목을 `app.cash.sqldelight.driver.jdbc.sqlite`로 변경해야 합니다.
- 넷째, `app.cash.sqldelight.drivers.native`의 모든 항목을 `app.cash.sqldelight.driver.native`로 변경해야 합니다.
- IDE 플러그인은 [알파 또는 EAP 채널](https://plugins.jetbrains.com/plugin/8191-sqldelight/versions/alpha)에서 찾을 수 있는 2.X 버전으로 업데이트해야 합니다.
- Dialect는 이제 다음과 같이 Gradle 내에서 지정할 수 있는 의존성입니다:

```gradle
sqldelight {
  MyDatabase {
    packageName = "com.example"
    dialect = "app.cash.sqldelight:mysql-dialect:2.0.0-alpha01"
  }
}
```

현재 지원되는 dialect는 `mysql-dialect`, `postgresql-dialect`, `hsql-dialect`, `sqlite-3-18-dialect`, `sqlite-3-24-dialect`, `sqlite-3-25-dialect`, `sqlite-3-30-dialect`, 그리고 `sqlite-3-35-dialect`입니다.

- 원시형(Primitive) 타입은 이제 명시적으로 import해야 하며(예: `INTEGER AS Boolean`의 경우 `import kotlin.Boolean` 필요), 이전에 지원되던 일부 타입은 이제 어댑터가 필요합니다. 기본 어댑터는 대부분의 변환(`Integer AS kotlin.Int`를 위한 `IntColumnAdapter` 등)을 지원하도록 `app.cash.sqldelight:primitive-adapters:2.0.0-alpha01`에서 제공됩니다.

### 추가됨 (Added)
- [IDE Plugin] 기본적인 마이그레이션 제안 기능 (작성자: @aperfilyev)
- [IDE Plugin] 임포트 힌트 액션 추가 (작성자: @aperfilyev)
- [IDE Plugin] Kotlin 클래스 자동 완성 추가 (작성자: @aperfilyev)
- [Gradle Plugin] Gradle 타입 안전 프로젝트 접근자를 위한 단축키 추가 (작성자: @hfhbd)
- [Compiler] dialect에 따른 커스텀 코드 생성 지원 (작성자: @MariusVolkhart)
- [JDBC Driver] JdbcDriver에 공통 타입 추가 (작성자: @MariusVolkhart)
- [SQLite] SQLite 3.35 지원 추가 (작성자: @eygraber)
- [SQLite] ALTER TABLE DROP COLUMN 지원 추가 (작성자: @eygraber)
- [SQLite] SQLite 3.30 dialect 지원 추가 (작성자: @eygraber)
- [SQLite] SQLite에서 NULLS FIRST/LAST 지원 (작성자: @eygraber)
- [HSQL] generated 절에 대한 HSQL 지원 추가 (작성자: @MariusVolkhart)
- [HSQL] HSQL에서 명명된 파라미터(named parameters) 지원 추가 (작성자: @MariusVolkhart)
- [HSQL] HSQL 삽입 쿼리 커스터마이징 (작성자: @MariusVolkhart)

### 변경됨 (Changed)
- [전체] 패키지 이름이 `com.squareup.sqldelight`에서 `app.cash.sqldelight`로 변경되었습니다.
- [Runtime] dialect들을 격리된 별도의 Gradle 모듈로 이동했습니다.
- [Runtime] 드라이버가 구현하는 쿼리 알림 방식으로 전환했습니다.
- [Runtime] 기본 열 어댑터들을 별도의 모듈로 추출했습니다. (#2056, #2060)
- [Compiler] 각 모듈에서 반복하지 않고 모듈이 쿼리 구현을 생성하도록 했습니다.
- [Compiler] 생성된 데이터 클래스의 커스텀 toString 생성을 제거했습니다. (작성자: @PaulWoitaschek)
- [JS Driver] sqljs-driver에서 sql.js 의존성을 제거했습니다. (작성자: @dellisd)
- [Paging] Android Paging 2 확장을 제거했습니다.
- [IDE Plugin] SQLDelight 동기화 중 에디터 배너를 표시하도록 추가했습니다. (#2511)
- [IDE Plugin] 최소 지원 IntelliJ 버전은 2021.1입니다.

### 수정됨 (Fixed)
- [Runtime] 할당 및 포인터 체이싱을 줄이기 위해 리스너 목록을 평탄화(flatten)했습니다. (작성자: @andersio)
- [IDE Plugin] 오류 위치로 이동할 수 있도록 오류 메시지를 수정했습니다. (작성자: @hfhbd)
- [IDE Plugin] 누락된 검사 설명을 추가했습니다. (@aperfilyev 작성, #2768)
- [IDE Plugin] GotoDeclarationHandler의 예외를 수정했습니다. (@aperfilyev 작성, #2531, #2688, #2804)
- [IDE Plugin] import 키워드 하이라이팅을 추가했습니다. (작성자: @aperfilyev)
- [IDE Plugin] 해석되지 않는 Kotlin 타입을 수정했습니다. (@aperfilyev 작성, #1678)
- [IDE Plugin] 해석되지 않는 패키지에 대한 하이라이팅을 수정했습니다. (@aperfilyev 작성, #2543)
- [IDE Plugin] 프로젝트 인덱스가 아직 초기화되지 않은 경우 일치하지 않는 열 검사를 시도하지 않도록 수정했습니다.
- [IDE Plugin] Gradle 동기화가 발생할 때까지 파일 인덱스를 초기화하지 않도록 수정했습니다.
- [IDE Plugin] Gradle 동기화가 시작되면 SQLDelight 임포트를 취소하도록 처리했습니다.
- [IDE Plugin] 실행 취소(undo) 작업이 수행되는 스레드 외부에서 데이터베이스를 재생성하도록 변경했습니다.
- [IDE Plugin] 참조를 확인할 수 없는 경우 빈 Java 타입을 사용하도록 했습니다.
- [IDE Plugin] 파일 파싱 중 메인 스레드에서 올바르게 벗어나고 쓰기 작업 시에만 다시 복귀하도록 수정했습니다.
- [IDE Plugin] 구형 IntelliJ 버전과의 호환성을 개선했습니다. (작성자: @3flex)
- [IDE Plugin] 더 빠른 어노테이션 API를 사용하도록 변경했습니다.
- [Gradle Plugin] 런타임 추가 시 js/android 플러그인을 명시적으로 지원하도록 했습니다. (작성자: @ZacSweers)
- [Gradle Plugin] 마이그레이션에서 스키마를 도출하지 않고 마이그레이션 출력 태스크를 등록하도록 수정했습니다. (@kevincianfarini 작성, #2744)
- [Gradle Plugin] 마이그레이션 태스크가 충돌하면 충돌이 발생한 파일을 출력하도록 했습니다.
- [Gradle Plugin] 멱등한 출력을 보장하기 위해 코드를 생성할 때 파일을 정렬하도록 했습니다. (작성자: @ZacSweers)
- [Compiler] 파일 반복 작업을 위해 더 빠른 API를 사용하고 전체 PSI 그래프를 탐색하지 않도록 최적화했습니다.
- [Compiler] select 함수 파라미터에 키워드 맹글링(mangling)을 추가했습니다. (@aperfilyev 작성, #2759)
- [Compiler] 마이그레이션 어댑터의 packageName을 수정했습니다. (작성자: @hfhbd)
- [Compiler] 타입 대신 프로퍼티에 어노테이션을 생성하도록 변경했습니다. (@aperfilyev 작성, #2798)
- [Compiler] Query 하위 타입으로 전달하기 전에 인자를 정렬하도록 했습니다. (@aperfilyev 작성, #2379)

## [1.5.3] - 2021-11-23 {id="1-5-3-2021-11-23"}
[1.5.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.3

### 추가됨 (Added)
- [JDBC Driver] 서드파티 드라이버 구현을 위해 JdbcDriver를 개방했습니다. (@hfhbd 작성, #2672)
- [MySQL Dialect] 시간 증분을 위한 누락된 함수들을 추가했습니다. (@sdoward 작성, #2671)
- [Coroutines Extension] coroutines-extensions에 M1 타깃을 추가했습니다. (작성자: @PhilipDukhov)

### 변경됨 (Changed)
- [Paging3 Extension] sqldelight-android-paging3을 AAR 대신 JAR로 배포하도록 변경했습니다. (@julioromano 작성, #2634)
- 소프트 키워드(soft keywords)이기도 한 프로퍼티 이름 뒤에는 밑줄이 추가됩니다. 예를 들어 `value`는 `value_`로 노출됩니다.

### 수정됨 (Fixed)
- [Compiler] 중복 배열 파라미터에 대해 변수를 추출하지 않도록 수정했습니다. (작성자: @aperfilyev)
- [Gradle Plugin] `kotlin.mpp.enableCompatibilityMetadataVariant`를 추가했습니다. (@martinbonnin 작성, #2628)
- [IDE Plugin] Find Usages 처리에 읽기 액션(read action)이 필요하도록 수정했습니다.

## [1.5.2] - 2021-10-12 {id="1-5-2-2021-10-12"}
[1.5.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.2

### 추가됨 (Added)
- [Gradle Plugin] HMPP 지원 (@martinbonnin 작성, #2548)
- [IDE Plugin] NULL 비교 검사 추가 (작성자: @aperfilyev)
- [IDE Plugin] 검사 억제기(inspection suppressor) 추가 (작성자: @aperfilyev)
- [IDE Plugin] 이름 지정 및 위치 기반 파라미터 혼용 검사 추가 (작성자: @aperfilyev)
- [SQLite Driver] mingwX86 타깃 추가 (@enginegl 작성, #2558)
- [SQLite Driver] M1 타깃 추가
- [SQLite Driver] linuxX64 지원 추가 (@chippmann 작성, #2456)
- [MySQL Dialect] MySQL에 ROW_COUNT 함수 추가 (#2523)
- [PostgreSQL Dialect] Postgres rename, drop column 추가 (작성자: @pabl0rg)
- [PostgreSQL Dialect] PostgreSQL 문법에서 CITEXT 인식 지원
- [PostgreSQL Dialect] TIMESTAMP WITH TIME ZONE 및 TIMESTAMPTZ 포함
- [PostgreSQL Dialect] PostgreSQL GENERATED 열에 대한 문법 추가
- [Runtime] AfterVersion에 SqlDriver를 파라미터로 제공 (@ahmedre 작성, #2534, #2614)

### 변경됨 (Changed)
- [Gradle Plugin] Gradle 7.0을 명시적으로 요구하도록 변경 (@martinbonnin 작성, #2572)
- [Gradle Plugin] VerifyMigrationTask가 Gradle의 최신 상태 검사(up-to-date checks)를 지원하도록 개선 (@3flex 작성, #2533)
- [IDE Plugin] nullable 타입과 non-nullable 타입을 조인할 때 "Join compares two columns of different types" 경고가 발생하지 않도록 수정 (@pchmielowski 작성, #2550)
- [IDE Plugin] 열 타입에서 소문자 'as'에 대한 오류 설명 명확화 (작성자: @aperfilyev)

### 수정됨 (Fixed)
- [IDE Plugin] 프로젝트가 이미 폐기(disposed)된 경우 새로운 dialect로 다시 파싱하지 않도록 수정 (#2609)
- [IDE Plugin] 연결된 가상 파일이 null인 경우 모듈도 null로 처리하도록 수정 (#2607)
- [IDE Plugin] 사용되지 않는 쿼리 검사 중 크래시가 발생하지 않도록 방지 (#2610)
- [IDE Plugin] 데이터베이스 동기화 쓰기 작업을 쓰기 액션(write action) 내부에서 실행하도록 수정 (#2605)
- [IDE Plugin] IDE가 SQLDelight 동기화를 스케줄링하도록 위임
- [IDE Plugin] JavaTypeMixin의 NPE 수정 (@aperfilyev 작성, #2603)
- [IDE Plugin] MismatchJoinColumnInspection의 IndexOutOfBoundsException 수정 (@aperfilyev 작성, #2602)
- [IDE Plugin] UnusedColumnInspection 설명 추가 (@aperfilyev 작성, #2600)
- [IDE Plugin] `PsiElement.generatedVirtualFiles`를 읽기 액션으로 래핑 (@aperfilyev 작성, #2599)
- [IDE Plugin] 불필요한 nonnull 캐스트 제거 (#2596)
- [IDE Plugin] Find Usages의 null 처리를 올바르게 수정 (#2595)
- [IDE Plugin] Android용으로 생성된 파일에 대한 IDE 자동 완성 수정 (@martinbonnin 작성, #2573)
- [IDE Plugin] SqlDelightGotoDeclarationHandler의 NPE 수정 (작성자: @aperfilyev)
- [IDE Plugin] insert 문 내부의 인자에서 Kotlin 키워드를 맹글링하도록 수정 (@aperfilyev 작성, #2433)
- [IDE Plugin] SqlDelightFoldingBuilder의 NPE 수정 (@aperfilyev 작성, #2382)
- [IDE Plugin] CopyPasteProcessor의 ClassCastException 예외 처리 (@aperfilyev 작성, #2369)
- [IDE Plugin] update 라이브 템플릿 수정 (작성자: @IliasRedissi)
- [IDE Plugin] 의도 액션(intention actions)에 설명 추가 (@aperfilyev 작성, #2489)
- [IDE Plugin] 테이블을 찾을 수 없을 때 CreateTriggerMixin에서 발생하는 예외 수정 (작성자: @aperfilyev)
- [Compiler] 테이블 생성 문을 위상 정렬(topologically sort)하도록 개선
- [Compiler] 디렉터리에 대해 `forDatabaseFiles` 콜백 호출을 중단 (#2532)
- [Gradle Plugin] generateDatabaseInterface 태스크 의존성을 잠재적 컨슈머에게 전파하도록 수정 (@martinbonnin 작성, #2518)

## [1.5.1] - 2021-07-16 {id="1-5-1-2021-07-16"}
[1.5.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.1

### 추가됨 (Added)
- [PostgreSQL Dialect] PostgreSQL JSONB 및 ON Conflict Do Nothing 추가 (작성자: @satook)
- [PostgreSQL Dialect] PostgreSQL ON CONFLICT (column, ...) DO UPDATE 지원 추가 (작성자: @satook)
- [MySQL Dialect] MySQL 생성 열(generated columns) 지원 (작성자: @JGulbronson)
- [Native Driver] watchosX64 지원 추가
- [IDE Plugin] 파라미터 타입 및 어노테이션 추가 (작성자: @aperfilyev)
- [IDE Plugin] 'select all' 쿼리 생성 액션 추가 (작성자: @aperfilyev)
- [IDE Plugin] 자동 완성에서 열 타입 표시 (작성자: @aperfilyev)
- [IDE Plugin] 자동 완성에 아이콘 추가 (작성자: @aperfilyev)
- [IDE Plugin] 'select by primary key' 쿼리 생성 액션 추가 (작성자: @aperfilyev)
- [IDE Plugin] 'insert into' 쿼리 생성 액션 추가 (작성자: @aperfilyev)
- [IDE Plugin] 열 이름, 문 식별자, 함수 이름 하이라이팅 추가 (작성자: @aperfilyev)
- [IDE Plugin] 나머지 쿼리 생성 액션들 추가 (@aperfilyev 작성, #489)
- [IDE Plugin] insert-stmt에서 파라미터 힌트 표시 (작성자: @aperfilyev)
- [IDE Plugin] 테이블 별칭 의도 액션 추가 (작성자: @aperfilyev)
- [IDE Plugin] 열 이름 한정(qualify) 의도 액션 추가 (작성자: @aperfilyev)
- [IDE Plugin] Kotlin 프로퍼티 선언으로 이동(Go to declaration) 지원 (작성자: @aperfilyev)

### 변경됨 (Changed)
- [Native Driver] 가능한 경우 동결(freezing) 및 공유 가능한 데이터 구조를 방지하여 네이티브 트랜잭션 성능을 개선했습니다. (작성자: @andersio)
- [Paging 3] Paging3 버전을 3.0.0 안정화 버전으로 상향했습니다.
- [JS Driver] sql.js를 1.5.0으로 업그레이드했습니다.

### 수정됨 (Fixed)
- [JDBC SQLite Driver] ThreadLocal을 지우기 전에 커넥션의 `close()`를 호출하도록 수정했습니다. (@hannesstruss 작성, #2444)
- [RX extensions] 구독 / 폐기 간의 경쟁 누수(race leak)를 수정했습니다. (@pyricau 작성, #2403)
- [Coroutines extension] 알림을 보내기 전에 쿼리 리스너를 먼저 등록하도록 보장했습니다.
- [Compiler] 일관된 Kotlin 출력 파일을 생성하도록 `notifyQueries`를 정렬했습니다. (작성자: @thomascjy)
- [Compiler] select 쿼리 클래스 프로퍼티에 `@JvmField` 어노테이션을 붙이지 않도록 수정했습니다. (@eygraber 작성)
- [IDE Plugin] 임포트 최적화기를 수정했습니다. (@aperfilyev 작성, #2350)
- [IDE Plugin] 사용되지 않는 열 검사를 수정했습니다. (작성자: @aperfilyev)
- [IDE Plugin] 임포트 검사 및 클래스 어노테이터에 중첩 클래스 지원을 추가했습니다. (작성자: @aperfilyev)
- [IDE Plugin] CopyPasteProcessor의 NPE를 수정했습니다. (@aperfilyev 작성, #2363)
- [IDE Plugin] InlayParameterHintsProvider의 크래시를 수정했습니다. (@aperfilyev 작성, #2359)
- [IDE Plugin] create table 문에 텍스트를 복사하여 붙여넣을 때 빈 줄이 삽입되던 현상을 수정했습니다. (@aperfilyev 작성, #2431)

## [1.5.0] - 2021-04-23 {id="1-5-0-2021-04-23"}
[1.5.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.0

### 추가됨 (Added)
- [SQLite Javascript Driver] sqljs-driver 게시를 활성화했습니다. (@dellisd 작성, #1667)
- [Paging3 Extension] Android Paging 3 라이브러리를 위한 확장을 추가했습니다. (@kevincianfarini 작성, #1786)
- [MySQL Dialect] MySQL의 ON DUPLICATE KEY UPDATE 충돌 해결을 지원합니다. (작성자: @rharter)
- [SQLite Dialect] SQLite `offsets()`에 대한 컴파일러 지원을 추가했습니다. (작성자: @qjroberts)
- [IDE Plugin] 알 수 없는 타입에 대한 임포트 빠른 수정(quick fix)을 추가했습니다. (@aperfilyev 작성, #683)
- [IDE Plugin] 사용되지 않는 임포트 검사를 추가했습니다. (@aperfilyev 작성, #1161)
- [IDE Plugin] 사용되지 않는 쿼리 검사를 추가했습니다. (작성자: @aperfilyev)
- [IDE Plugin] 사용되지 않는 열 검사를 추가했습니다. (@aperfilyev 작성, #569)
- [IDE Plugin] 복사/붙여넣기 시 자동으로 임포트를 가져오도록 개선했습니다. (@aperfilyev 작성, #684)
- [IDE Plugin] Gradle/IntelliJ 플러그인 버전 간 비호환성이 있을 때 알림 말풍선을 표시하도록 했습니다.
- [IDE Plugin] `Insert Into ... VALUES(?)` 파라미터 힌트를 추가했습니다. (@aperfilyev 작성, #506)
- [IDE Plugin] 인라인 파라미터 힌트를 추가했습니다. (작성자: @aperfilyev)
- [Runtime] 콜백을 통해 마이그레이션을 실행하는 API를 런타임에 포함했습니다. (#1844)

### 변경됨 (Changed)
- [Compiler] "IS NOT NULL" 쿼리에 대해 스마트 캐스트를 적용합니다. (#867)
- [Compiler] 런타임에 실패할 수 있는 키워드에 대한 보호 조치를 추가했습니다. (#1471, #1629)
- [Gradle Plugin] Gradle 플러그인 크기를 60MB에서 13MB로 축소했습니다.
- [Gradle Plugin] Android variant를 올바르게 지원하며, KMM 타깃별 SQL 지원을 제거했습니다. (#1039)
- [Gradle Plugin] minsdk를 기반으로 최소 SQLite 버전을 선택하도록 했습니다. (#1684)
- [Native Driver] 네이티브 드라이버 커넥션 풀 및 성능 업데이트를 진행했습니다.

### 수정됨 (Fixed)
- [Compiler] 람다 앞의 NBSP(줄 바꿈 없는 공백) 문제를 수정했습니다. (작성자: @oldergod)
- [Compiler] 생성된 bind* 및 cursor.get* 문에서 호환되지 않는 타입 문제를 수정했습니다.
- [Compiler] SQL 절이 어댑터된 타입을 유지하도록 수정했습니다. (#2067)
- [Compiler] NULL 키워드만 있는 열은 nullable이 되도록 수정했습니다.
- [Compiler] 타입 어노테이션이 있는 매퍼 람다를 생성하지 않도록 수정했습니다. (#1957)
- [Compiler] 커스텀 쿼리가 충돌하는 경우 파일 이름을 추가 패키지 접미사로 사용하도록 수정했습니다. (#1057, #1278)
- [Compiler] 외래 키 연쇄(cascades) 시 쿼리 리스너에 알림이 전달되도록 보장했습니다. (#1325, #1485)
- [Compiler] 동일한 타입 두 개를 union할 때 테이블 타입을 반환하도록 수정했습니다. (#1342)
- [Compiler] ifnull 및 coalesce의 파라미터가 nullable이 될 수 있도록 보장했습니다. (#1263)
- [Compiler] 표현식에 대해 쿼리가 지정한 nullability를 올바르게 적용하도록 수정했습니다.
- [MySQL Dialect] MySQL if 문을 지원합니다.
- [PostgreSQL Dialect] PostgreSQL에서 NUMERIC 및 DECIMAL을 Double로 조회하도록 수정했습니다. (#2118)
- [SQLite Dialect] UPSERT 알림이 BEFORE/AFTER UPDATE 트리거를 고려하도록 수정했습니다. (@andersio 작성, #2198)
- [SQLite Driver] 인메모리 방식이 아닌 경우 SqliteDriver의 스레드에 다중 연결을 사용하도록 수정했습니다. (#1832)
- [JDBC Driver] JDBC 드라이버가 autoCommit을 true로 간주하던 문제를 수정했습니다. (#2041)
- [JDBC Driver] 예외 발생 시 연결을 확실히 닫도록 수정했습니다. (#2306)
- [IDE Plugin] 경로 구분자 버그로 인해 Windows에서 GoToDeclaration/FindUsages가 작동하지 않던 문제를 수정했습니다. (@angusholder 작성, #2054)
- [IDE Plugin] IDE에서 크래시가 발생하는 대신 Gradle 오류를 무시하도록 처리했습니다.
- [IDE Plugin] sqldelight 파일이 비-sqldelight 모듈로 이동된 경우 코드 생성을 시도하지 않도록 수정했습니다.
- [IDE Plugin] IDE 내 코드 생성 오류를 무시하도록 처리했습니다.
- [IDE Plugin] 음수 서브스트링을 시도하지 않도록 보장했습니다. (#2068)
- [IDE Plugin] Gradle 액션을 실행하기 전에 프로젝트가 폐기되지 않았는지 확인하도록 수정했습니다. (#2155)
- [IDE Plugin] nullable 타입에 대한 산술 연산 결과도 nullable이 되도록 수정했습니다. (#1853)
- [IDE Plugin] 'expand * intention'이 추가 프로젝션과 함께 작동하도록 수정했습니다. (@aperfilyev 작성, #2173)
- [IDE Plugin] GoTo 도중 Kotlin 해석이 실패하면 sqldelight 파일로 이동을 시도하지 않도록 수정했습니다.
- [IDE Plugin] SQLDelight 인덱싱 중 IntelliJ에서 예외가 발생하더라도 크래시가 나지 않도록 처리했습니다.
- [IDE Plugin] IDE에서 코드 생성 전 오류 감지 시 발생하는 예외를 처리했습니다.
- [IDE Plugin] IDE 플러그인이 다이내믹 플러그인(Dynamic Plugins)과 호환되도록 수정했습니다. (#1536)
- [Gradle Plugin] WorkerApi를 사용하여 데이터베이스를 생성할 때 발생하던 경쟁 상태를 수정했습니다. (@stephanenicolas 작성, #2062)
- [Gradle Plugin] `classLoaderIsolation`이 커스텀 JDBC 사용을 차단하던 문제를 수정했습니다. (@benasher44 작성, #2048)
- [Gradle Plugin] packageName 누락 시 표시되는 오류 메시지를 개선했습니다. (작성자: @vanniktech)
- [Gradle Plugin] SQLDelight가 빌드스크립트 클래스패스로 IntelliJ 종속성을 유출하던 문제를 수정했습니다. (#1998)
- [Gradle Plugin] Gradle 빌드 캐싱 문제를 수정했습니다. (#2075)
- [Gradle Plugin] Gradle 플러그인에서 `kotlin-native-utils`에 의존하지 않도록 수정했습니다. (작성자: @ilmat192)
- [Gradle Plugin] 마이그레이션 파일만 있는 경우에도 데이터베이스를 작성하도록 수정했습니다. (#2094)
- [Gradle Plugin] 최종 컴파일 단위에서 다이아몬드 의존성이 한 번만 포함되도록 보장했습니다. (#1455)

이번 릴리스에서 SQLDelight 인프라 개선에 많은 도움을 준 @3flex 님께 감사의 뜻을 전합니다.

## [1.4.4] - 2020-10-08 {id="1-4-4-2020-10-08"}
[1.4.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.4

### 추가됨 (Added)
- [PostgreSQL Dialect] WITH 절에서 데이터 수정 문(data-modifying statements)을 지원합니다.
- [PostgreSQL Dialect] substring 함수를 지원합니다.
- [Gradle Plugin] SQLDelight 컴파일 중 마이그레이션 유효성을 검증하기 위한 verifyMigrations 플래그를 추가했습니다. (#1872)

### 변경됨 (Changed)
- [Compiler] SQLite가 아닌 dialect에서는 SQLite 고유 함수를 알 수 없는 함수로 표시하도록 변경했습니다.
- [Gradle Plugin] sqldelight 플러그인이 적용되었지만 데이터베이스가 구성되지 않은 경우 경고를 표시하도록 했습니다. (#1421)

### 수정됨 (Fixed)
- [Compiler] ORDER BY 절에서 열 이름을 바인딩할 때 오류를 보고하도록 수정했습니다. (@eygraber 작성, #1187)
- [Compiler] DB 인터페이스를 생성할 때 레지스트리 경고가 나타나던 문제를 수정했습니다. (#1792)
- [Compiler] case 문의 부정확한 타입 추론을 수정했습니다. (#1811)
- [Compiler] 버전이 없는 마이그레이션 파일에 대해 더 나은 오류를 제공하도록 개선했습니다. (#2006)
- [Compiler] 일부 데이터베이스 타입 ColumnAdapter에 대해 마샬링에 필요한 데이터베이스 타입이 잘못되던 문제를 수정했습니다. (#2012)
- [Compiler] CAST의 nullability를 수정했습니다. (#1261)
- [Compiler] 쿼리 래퍼에서 이름 가림(name shadowed) 경고가 다수 발생하던 문제를 수정했습니다. (@eygraber 작성, #1946)
- [Compiler] 생성된 코드가 완전한 한정자 이름(full qualifier names)을 사용하던 문제를 수정했습니다. (#1939)
- [IDE Plugin] Gradle 동기화 시 sqldelight 코드 생성을 트리거하도록 했습니다.
- [IDE Plugin] .sq 파일 변경 시 플러그인이 데이터베이스 인터페이스를 재생성하지 않던 문제를 수정했습니다. (#1945)
- [IDE Plugin] 파일을 새 패키지로 이동할 때 발생하던 문제를 수정했습니다. (#444)
- [IDE Plugin] 커서를 이동할 위치가 없는 경우 크래시를 내는 대신 아무 작업도 수행하지 않도록 수정했습니다. (#1994)
- [IDE Plugin] Gradle 프로젝트 외부 파일에 대해서는 빈 패키지 이름을 사용하도록 수정했습니다. (#1973)
- [IDE Plugin] 잘못된 타입에 대해 원활하게 실패하도록 처리했습니다. (#1943)
- [IDE Plugin] 알 수 없는 표현식을 만났을 때 더 명확한 오류 메시지를 발생시키도록 수정했습니다. (#1958)
- [Gradle Plugin] SQLDelight가 빌드스크립트 클래스패스로 IntelliJ 의존성을 유출하던 문제를 수정했습니다. (#1998)
- [Gradle Plugin] *.sq 파일에 메서드 문서를 추가할 때 발생하는 "JavadocIntegrationKt not found" 컴파일 오류를 수정했습니다. (#1982)
- [Gradle Plugin] SqlDelight Gradle 플러그인이 구성 캐싱(Configuration Caching, CoCa)을 지원하지 않던 문제를 수정했습니다. (@stephanenicolas 작성, #1947)
- [SQLite JDBC Driver] `SQLException: database in auto-commit mode` 오류를 수정했습니다. (#1832)
- [Coroutines Extension] coroutines-extensions의 IR 백엔드를 수정했습니다. (@dellisd 작성, #1918)

## [1.4.3] - 2020-09-04 {id="1-4-3-2020-09-04"}
[1.4.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.3

### 추가됨 (Added)
- [MySQL Dialect] MySQL `last_insert_id` 함수 지원을 추가했습니다. (작성자: @lawkai)
- [PostgreSQL Dialect] SERIAL 데이터 타입을 지원합니다. (작성자: @veyndan & @felipecsl)
- [PostgreSQL Dialect] PostgreSQL RETURNING을 지원합니다. (작성자: @veyndan)

### 수정됨 (Fixed)
- [MySQL Dialect] MySQL AUTO_INCREMENT를 기본값이 있는 것으로 처리하도록 수정했습니다. (#1823)
- [Compiler] Upsert 문 컴파일러 오류를 수정했습니다. (@eygraber 작성, #1809)
- [Compiler] 잘못된 Kotlin 코드가 생성되던 문제를 수정했습니다. (@eygraber 작성, #1925)
- [Compiler] 알 수 없는 함수에 대해 더 나은 오류 메시지를 제공하도록 수정했습니다. (#1843)
- [Compiler] instr의 두 번째 파라미터 타입으로 문자열을 노출하도록 수정했습니다.
- [IDE Plugin] IDE 플러그인의 데몬 비대화 및 UI 스레드 멈춤 현상을 수정했습니다. (#1916)
- [IDE Plugin] null 모듈 시나리오를 처리하도록 수정했습니다. (#1902)
- [IDE Plugin] 구성되지 않은 sq 파일에서는 패키지 이름으로 빈 문자열을 반환하도록 수정했습니다. (#1920)
- [IDE Plugin] 그룹화된 문을 수정하고 이에 대한 통합 테스트를 추가했습니다. (#1820)
- [IDE Plugin] 요소의 모듈을 찾기 위해 내장된 ModuleUtil을 사용하도록 수정했습니다. (#1854)
- [IDE Plugin] 유효한 요소만 룩업에 추가하도록 수정했습니다. (#1909)
- [IDE Plugin] 부모(Parent)가 null일 수 있는 상황을 처리했습니다. (#1857)

## [1.4.2] - 2020-08-27 {id="1-4-2-2020-08-27"}
[1.4.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.2

### 추가됨 (Added)
- [Runtime] 새로운 JS IR 백엔드를 지원합니다.
- [Gradle Plugin] `generateSqlDelightInterface` Gradle 태스크를 추가했습니다. (작성자: @vanniktech)
- [Gradle Plugin] `verifySqlDelightMigration` Gradle 태스크를 추가했습니다. (작성자: @vanniktech)

### 수정됨 (Fixed)
- [IDE Plugin] IDE와 Gradle 간 데이터 공유를 용이하게 하기 위해 Gradle tooling API를 사용하도록 개선했습니다.
- [IDE Plugin] 스키마 도출(schema derivation)의 기본값을 false로 변경했습니다.
- [IDE Plugin] commonMain 소스 세트를 올바르게 가져오도록 수정했습니다.
- [MySQL Dialect] `mySqlFunctionType()`에 분(minute) 단위를 추가했습니다. (작성자: @maaxgr)

## [1.4.1] - 2020-08-21 {id="1-4-1-2020-08-21"}
[1.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.1

### 추가됨 (Added)
- [Runtime] Kotlin 1.4.0 지원 (#1859)

### 변경됨 (Changed)
- [Gradle Plugin] AGP 종속성을 `compileOnly`로 변경했습니다. (#1362)

### 수정됨 (Fixed)
- [Compiler] 열 정의 규칙 및 테이블 인터페이스 생성기에 선택적 javadoc을 추가했습니다. (@endanke 작성, #1224)
- [SQLite Dialect] SQLite FTS5 보조 함수인 highlight, snippet, bm25 지원을 추가했습니다. (작성자: @drampelt)
- [MySQL Dialect] MySQL bit 데이터 타입을 지원합니다.
- [MySQL Dialect] MySQL 이진 리터럴을 지원합니다.
- [PostgreSQL Dialect] sql-psi에서 SERIAL을 노출하도록 수정했습니다. (작성자: @veyndan)
- [PostgreSQL Dialect] BOOLEAN 데이터 타입을 추가했습니다. (작성자: @veyndan)
- [PostgreSQL Dialect] NULL 열 제약 조건을 추가했습니다. (작성자: @veyndan)
- [HSQL Dialect] HSQL에 `AUTO_INCREMENT` 지원을 추가했습니다. (작성자: @rharter)

## [1.4.0] - 2020-06-22 {id="1-4-0-2020-06-22"}
[1.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.0

### 추가됨 (Added)
- [MySQL Dialect] MySQL 지원 (작성자: @JGulbronson & @veyndan)
- [PostgreSQL Dialect] 실험적 PostgreSQL 지원 (작성자: @veyndan)
- [HSQL Dialect] 실험적 H2 지원 (작성자: @MariusVolkhart)
- [SQLite Dialect] SQLite FTS5 지원 (작성자: @benasher44 & @jpalawaga)
- [SQLite Dialect] alter table rename column 지원 (@angusholder 작성, #1505)
- [IDE] 마이그레이션(.sqm) 파일에 대한 IDE 지원
- [IDE] 내장 SQL 라이브 템플릿과 유사한 SQLDelight 라이브 템플릿 추가 (@veyndan 작성, #1154)
- [IDE] 새로운 SqlDelight 파일 생성 액션 추가 (@romtsn 작성, #42)
- [Runtime] 결과를 반환하는 트랜잭션을 위한 `transactionWithReturn` API
- [Compiler] .sq 파일에서 여러 SQL 문을 함께 그룹화하는 구문 추가
- [Compiler] 마이그레이션 파일로부터 스키마 생성 지원
- [Gradle Plugin] 마이그레이션 파일을 유효한 SQL로 출력하는 태스크 추가

### 변경됨 (Changed)
- [Documentation] 문서 웹사이트 개편 (작성자: @saket)
- [Gradle Plugin] 지원되지 않는 dialect에 대한 오류 메시지 개선 (작성자: @veyndan)
- [IDE] dialect에 따라 파일 아이콘을 동적으로 변경하도록 개선 (작성자: @veyndan)
- [JDBC Driver] `javax.sql.DataSource` 기반의 JdbcDriver 생성자를 노출했습니다. (#1614)

### 수정됨 (Fixed)
- [Compiler] 테이블에서의 Javadoc 지원 및 단일 파일 내 다중 Javadoc 문제를 수정했습니다. (#1224)
- [Compiler] 합성 열(synthesized columns)에 대한 값 삽입을 지원하도록 수정했습니다. (#1351)
- [Compiler] 디렉터리 이름 정리(sanitizing) 시 불일치하던 문제를 수정했습니다. (작성자: @ZacSweers)
- [Compiler] 합성 열이 조인 전반에서 nullability를 유지하도록 수정했습니다. (#1656)
- [Compiler] delete 문이 delete 키워드에 고정(pin)되도록 수정했습니다. (#1643)
- [Compiler] 따옴표 처리 문제를 수정했습니다. (@angusholder 작성, #1525)
- [Compiler] between 연산자가 표현식 내부로 올바르게 재귀 탐색하도록 수정했습니다. (#1279)
- [Compiler] 인덱스 생성 시 테이블/열 누락에 대해 더 명확한 오류를 제공하도록 수정했습니다. (#1372)
- [Compiler] 조인 제약 조건에서 외부 쿼리의 프로젝션을 사용할 수 있도록 지원했습니다. (#1346)
- [Native Driver] execute 시 transactionPool을 사용하도록 변경했습니다. (작성자: @benasher44)
- [JDBC Driver] sqlite 대신 jdbc 트랜잭션 API를 사용하도록 변경했습니다. (#1693)
- [IDE] virtualFile 참조가 항상 원본 파일이 되도록 수정했습니다. (#1782)
- [IDE] bugsnag에 오류를 보고할 때 올바른 throwable을 사용하도록 수정했습니다. (#1262)
- [Paging Extension] DataSource 누수 문제를 수정했습니다. (#1628)
- [Gradle Plugin] 스키마 생성 시 출력 db 파일이 이미 존재하는 경우 삭제하도록 수정했습니다. (#1645)
- [Gradle Plugin] 간격(gaps)이 있는 경우 마이그레이션 유효성 검사가 실패하도록 처리했습니다.
- [Gradle Plugin] 설정한 파일 인덱스를 명시적으로 사용하도록 수정했습니다. (#1644)

## [1.3.0] - 2020-04-03 {id="1-3-0-2020-04-03"}
[1.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.3.0

* 신규: [Gradle] 컴파일 대상 SQL dialect를 지정할 수 있는 Dialect 프로퍼티 추가.
* 신규: [Compiler] #1009 MySQL dialect 실험적 지원.
* 신규: [Compiler] #1436 sqlite:3.24 dialect 및 upsert 지원.
* 신규: [JDBC Driver] SQLite JVM 드라이버에서 JDBC 드라이버를 분리.
* 수정: [Compiler] #1199 임의 길이의 람다 지원.
* 수정: [Compiler] #1610 `avg()`의 반환 타입을 nullable로 수정.
* 수정: [IntelliJ] #1594 Windows에서 Goto 및 Find Usages를 오동작하게 만들던 경로 구분자 처리 수정.

## [1.2.2] - 2020-01-22 {id="1-2-2-2020-01-22"}
[1.2.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.2

* 신규: [Runtime] Windows(mingw), tvOS, watchOS, macOS 아키텍처 지원.
* 수정: [Compiler] `sum()`의 반환 타입이 nullable이 되도록 수정.
* 수정: [Paging] 경쟁 상태(race condition)를 방지하기 위해 QueryDataSourceFactory에 Transacter를 전달하도록 수정.
* 수정: [IntelliJ Plugin] 파일의 패키지 이름을 찾을 때 종속성을 탐색하지 않도록 수정.
* 수정: [Gradle] #862 Gradle의 검증기(validator) 로그를 debug 레벨로 변경.
* 개선: [Gradle] GenerateSchemaTask가 Gradle worker를 사용하도록 변환.
* 참고: sqldelight-runtime 아티팩트의 이름이 runtime으로 변경되었습니다.

## [1.2.1] - 2019-12-11 {id="1-2-1-2019-12-11"}
[1.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.1

* 수정: [Gradle] Kotlin Native 1.3.60 지원.
* 수정: [Gradle] #1287 동기화 시 발생하는 경고 수정.
* 수정: [Compiler] #1469 쿼리에 대한 SyntheticAccessor 생성 수정.
* 수정: [JVM Driver] 메모리 누수 수정.
* 참고: 코루틴 확장 아티팩트를 사용하려면 buildscript에 kotlinx bintray maven 저장소를 추가해야 합니다.

## [1.2.0] - 2019-08-30 {id="1-2-0-2019-08-30"}
[1.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.0

* 신규: [Runtime] 안정화된 Flow API.
* 수정: [Gradle] Kotlin Native 1.3.50 지원.
* 수정: [Gradle] #1380 클린 빌드가 간헐적으로 실패하던 문제 수정.
* 수정: [Gradle] #1348 verify 태스크 실행 시 "Could not retrieve functions"가 출력되던 문제 수정.
* 수정: [Compile] #1405 쿼리에 조인된 FTS 테이블이 포함된 경우 프로젝트를 빌드할 수 없던 문제 수정.
* 수정: [Gradle] #1266 여러 데이터베이스 모듈이 있을 때 간헐적으로 발생하던 Gradle 빌드 실패 수정.

## [1.1.4] - 2019-07-11 {id="1-1-4-2019-07-11"}
[1.1.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.4

* 신규: [Runtime] 실험적 Kotlin Flow API.
* 수정: [Gradle] Kotlin/Native 1.3.40 호환성.
* 수정: [Gradle] #1243 Gradle configure on demand와 함께 SQLDelight를 사용할 때 발생하는 문제 수정.
* 수정: [Gradle] #1385 증분 어노테이션 처리와 함께 SQLDelight를 사용할 때 발생하는 문제 수정.
* 수정: [Gradle] Gradle 태스크 캐싱 허용.
* 수정: [Gradle] #1274 Kotlin DSL에서 sqldelight 확장 사용 지원.
* 수정: [Compiler] 각 쿼리에 대해 고유 ID가 결정론적으로(deterministically) 생성되도록 수정.
* 수정: [Compiler] 트랜잭션이 완료되었을 때만 대기 중인 쿼리에 알림을 보내도록 수정.
* 수정: [JVM Driver] #1370 JdbcSqliteDriver 사용 시 DB URL을 반드시 제공하도록 강제.

## [1.1.3] - 2019-04-14 {id="1-1-3-2019-04-14"}
[1.1.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.3

* Gradle Metadata 1.0 릴리스.

## [1.1.2] - 2019-04-14 {id="1-1-2-2019-04-14"}
[1.1.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.2

* 신규: [Runtime] #1267 로깅 드라이버 데코레이터.
* 수정: [Compiler] #1254 2^16자를 초과하는 문자열 리터럴 분할 처리.
* 수정: [Gradle] #1260 멀티플랫폼 프로젝트에서 생성된 소스가 iOS 소스로 잘못 인식되던 문제 수정.
* 수정: [IDE] #1290 CopyAsSqliteAction.kt:43의 kotlin.KotlinNullPointerException 수정.
* 수정: [Gradle] #1268 최근 버전에서 `linkDebugFrameworkIos*` 태스크 실행이 실패하던 문제 수정.

## [1.1.1] - 2019-03-01 {id="1-1-1-2019-03-01"}
[1.1.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.1

* 수정: [Gradle] Android 프로젝트의 모듈 종속성 컴파일 수정.
* 수정: [Gradle] #1246 afterEvaluate에서 API 종속성을 설정하도록 수정.
* 수정: [Compiler] 배열 타입이 올바르게 출력되도록 수정.

## [1.1.0] - 2019-02-27 {id="1-1-0-2019-02-27"}
[1.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.0

* 신규: [Gradle] #502 스키마 모듈 종속성 지정 허용.
* 개선: [Compiler] #1111 테이블 오류를 다른 오류보다 먼저 정렬하여 표시.
* 수정: [Compiler] #1225 REAL 리터럴에 대해 올바른 타입을 반환하도록 수정.
* 수정: [Compiler] #1218 트리거를 통해 docid가 전파되도록 수정.

## [1.0.3] - 2019-01-30 {id="1-0-3-2019-01-30"}
[1.0.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.3

* 개선: [Runtime] #1195 Native Driver/Runtime Arm32 지원.
* 개선: [Runtime] #1190 Query 타입에서 매퍼를 노출.

## [1.0.2] - 2019-01-26 {id="1-0-2-2019-01-26"}
[1.0.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.2

* 수정: [Gradle Plugin] Kotlin 1.3.20으로 업데이트.
* 수정: [Runtime] 트랜잭션이 더 이상 예외를 삼키지(swallow) 않도록 수정.

## [1.0.1] - 2019-01-21 {id="1-0-1-2019-01-21"}
[1.0.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.1

* 개선: [Native Driver] DatabaseConfiguration에 디렉터리 이름을 전달할 수 있도록 허용.
* 개선: [Compiler] #1173 패키지가 없는 파일은 컴파일에 실패하도록 처리.
* 수정: [IDE] IDE 오류를 Square에 올바르게 보고하도록 수정.
* 수정: [IDE] #1162 동일한 패키지의 타입이 오류로 표시되지만 정상 작동하던 문제 수정.
* 수정: [IDE] #1166 테이블 이름 변경 시 NPE로 실패하던 문제 수정.
* 수정: [Compiler] #1167 UNION 및 SELECT가 포함된 복잡한 SQL 문을 파싱하려고 할 때 예외가 발생하던 문제 수정.

## [1.0.0] - 2019-01-08 {id="1-0-0-2019-01-08"}
[1.0.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.0

* 신규: 생성된 코드를 완전히 전면 개편하여 이제 Kotlin으로 작성됩니다.
* 신규: RxJava2 확장 아티팩트.
* 신규: Android Paging 확장 아티팩트.
* 신규: Kotlin Multiplatform 지원.
* 신규: Android, iOS 및 JVM SQLite 드라이버 아티팩트.
* 신규: 트랜잭션 API.

## [0.7.0] - 2018-02-12 {id="0-7-0-2018-02-12"}
[0.7.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.7.0

 * 신규: 생성된 코드가 Support SQLite 라이브러리만 사용하도록 업데이트되었습니다. 이제 모든 쿼리가 원시 문자열 대신 문(statement) 객체를 생성합니다.
 * 신규: IDE에서 문 접기(Statement folding) 지원.
 * 신규: Boolean 타입이 이제 자동으로 처리됩니다.
 * 수정: 코드 생성에서 deprecated된 marshal을 제거했습니다.
 * 수정: 'avg' SQL 함수 타입 매핑이 REAL이 되도록 바로잡았습니다.
 * 수정: 'julianday' SQL 함수를 올바르게 감지하도록 수정했습니다.

## [0.6.1] - 2017-03-22 {id="0-6-1-2017-03-22"}
[0.6.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.6.1

 * 신규: 인자가 없는 Delete, Update, Insert 문에 대해 컴파일된 문이 생성됩니다.
 * 수정: 서브쿼리에 사용된 뷰 내의 Using 절이 오류를 발생시키지 않도록 수정했습니다.
 * 수정: 생성된 Mapper에서 중복 타입들을 제거했습니다.
 * 수정: 인자를 대상으로 확인하는 표현식에 서브쿼리를 사용할 수 있도록 수정했습니다.

## [0.6.0] - 2017-03-06 {id="0-6-0-2017-03-06"}
[0.6.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.6.0

 * 신규: Select 쿼리가 이제 문자열 상수 대신 `SqlDelightStatement` 팩토리로 노출됩니다.
 * 신규: 쿼리 JavaDoc이 문 및 매퍼 팩토리에 복사됩니다.
 * 신규: 뷰 이름에 대한 문자열 상수를 출력합니다.
 * 수정: 팩토리가 필요한 뷰에 대한 쿼리에서 해당 팩토리를 인자로 올바르게 요구하도록 수정했습니다.
 * 수정: insert의 인자 수가 지정된 열 수와 일치하는지 유효성을 검사합니다.
 * 수정: where 절에 사용된 blob 리터럴을 올바르게 인코딩하도록 수정했습니다.
 * 이번 릴리스에는 Gradle 3.3 이상이 필요합니다.

## [0.5.1] - 2016-10-24 {id="0-5-1-2016-10-24"}
[0.5.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.5.1

 * 신규: 컴파일된 문이 추상 타입을 상속합니다.
 * 수정: 파라미터의 원시 타입이 nullable인 경우 박싱(boxed) 처리됩니다.
 * 수정: 바인드 인자에 필요한 모든 팩토리가 팩토리 메서드에 포함되도록 수정했습니다.
 * 수정: 이스케이프된 열 이름이 올바르게 마샬링되도록 수정했습니다.

## [0.5.0] - 2016-10-19 {id="0-5-0-2016-10-19"}
[0.5.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.5.0

 * 신규: SQLite 인자를 Factory를 통해 타입 안전하게 전달할 수 있습니다.
 * 신규: IntelliJ 플러그인이 .sq 파일에 대한 서식 지정(formatting)을 수행합니다.
 * 신규: SQLite 타임스탬프 리터럴 지원.
 * 수정: IntelliJ에서 매개변수화된 타입을 클릭하여 이동할 수 있도록 수정했습니다.
 * 수정: Cursor에서 가져올 때 이스케이프된 열 이름이 더 이상 RuntimeException을 발생시키지 않습니다.
 * 수정: Gradle 플러그인이 예외를 출력하려고 할 때 크래시가 발생하던 문제를 수정했습니다.

## [0.4.4] - 2016-07-20 {id="0-4-4-2016-07-20"}
[0.4.4]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.4

 * 신규: 열의 Java 타입으로 Short 기본 지원.
 * 신규: 생성된 매퍼 및 팩토리 메서드에 Javadoc 추가.
 * 수정: group_concat 및 nullif 함수가 올바른 nullability를 갖도록 수정했습니다.
 * 수정: Android Studio 2.2-alpha 호환성 수정.
 * 수정: WITH RECURSIVE가 더 이상 플러그인 크래시를 유발하지 않도록 수정했습니다.

## [0.4.3] - 2016-07-07 {id="0-4-3-2016-07-07"}
[0.4.3]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.3

 * 신규: 컴파일 오류 시 소스 파일 링크 제공.
 * 신규: SQLDelight 코드를 유효한 SQLite 형태로 복사할 수 있는 우클릭 액션 추가.
 * 신규: 명명된 문의 Javadoc이 생성된 String에 표시됩니다.
 * 수정: 생성된 뷰 모델에 nullability 어노테이션이 포함되도록 수정했습니다.
 * 수정: union에서 생성된 코드가 가능한 모든 열을 지원할 수 있도록 올바른 타입과 nullability를 갖도록 수정했습니다.
 * 수정: 생성된 코드에서 sum 및 round SQLite 함수가 올바른 타입을 갖도록 수정했습니다.
 * 수정: CAST 및 내부 select 관련 버그 수정.
 * 수정: CREATE TABLE 문에서 자동 완성 기능 수정.
 * 수정: 패키지에 SQLite 키워드를 사용할 수 있도록 수정했습니다.

## [0.4.2] - 2016-06-16 {id="0-4-2-2016-06-16"}
[0.4.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.2

 * 신규: 팩토리로부터 Marshal을 생성할 수 있습니다.
 * 수정: IntelliJ 플러그인이 올바른 제네릭 순서로 팩토리 메서드를 생성하도록 수정했습니다.
 * 수정: 함수 이름에 대소문자를 자유롭게 사용할 수 있도록 수정했습니다.

## [0.4.1] - 2016-06-14 {id="0-4-1-2016-06-14"}
[0.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.1

 * 수정: IntelliJ 플러그인이 올바른 제네릭 순서로 클래스를 생성하도록 수정했습니다.
 * 수정: 열 정의에 대소문자를 자유롭게 사용할 수 있도록 수정했습니다.

## [0.4.0] - 2016-06-14 {id="0-4-0-2016-06-14"}
[0.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.0

 * 신규: 테이블별이 아닌 쿼리별로 매퍼가 생성됩니다.
 * 신규: .sq 파일에서 Java 타입을 임포트할 수 있습니다.
 * 신규: SQLite 함수에 대한 유효성 검사가 진행됩니다.
 * 수정: 중복 오류를 제거했습니다.
 * 수정: 대문자 열 이름 및 Java 키워드 열 이름이 오류를 발생시키지 않도록 수정했습니다.

## [0.3.2] - 2016-05-14 {id="0-3-2-2016-05-14"}
[0.3.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.2

 * 신규: 뷰 및 별칭에 대해 자동 완성 및 Find Usages가 동작합니다.
 * 수정: 컴파일 시점 검증을 통해 select 문에서 함수를 사용할 수 있도록 수정했습니다.
 * 수정: 기본값만 선언하는 insert 문을 지원합니다.
 * 수정: SQLDelight를 사용하지 않는 프로젝트를 가져올 때 플러그인이 더 이상 크래시를 내지 않도록 수정했습니다.

## [0.3.1] - 2016-04-27 {id="0-3-1-2016-04-27"}
[0.3.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.1

  * 수정: 메서드 참조로 인한 Illegal Access 런타임 예외를 방지하기 위해 인터페이스 가시성을 다시 public으로 변경했습니다.
  * 수정: 서브표현식(subexpressions)이 올바르게 평가되도록 수정했습니다.

## [0.3.0] - 2016-04-26 {id="0-3-0-2016-04-26"}
[0.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.0

  * 신규: 열 정의에 SQLite 타입을 사용하며 Java 타입을 지정하기 위해 추가 'AS' 제약 조건을 가질 수 있습니다.
  * 신규: IDE에서 버그 리포트를 전송할 수 있습니다.
  * 수정: 자동 완성이 올바르게 동작하도록 수정했습니다.
  * 수정: .sq 파일 편집 시 SQLDelight 모델 파일이 업데이트되도록 수정했습니다.
  * 제거됨: Attach된 데이터베이스는 더 이상 지원되지 않습니다.

## [0.2.2] - 2016-03-07 {id="0-2-2-2016-03-07"}
[0.2.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.2

 * 신규: insert, update, delete, index 및 trigger 문에서 사용되는 열에 대한 컴파일 시점 유효성 검사.
 * 수정: 파일 이동/생성 시 IDE 플러그인이 비정상 종료되지 않도록 수정했습니다.

## [0.2.1] - 2016-03-07 {id="0-2-1-2016-03-07"}
[0.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.1

 * 신규: Ctrl+`/` (macOS에서는 Cmd+`/`)를 눌러 선택한 줄의 주석을 토글할 수 있습니다.
 * 신규: SQL 쿼리에서 사용되는 열에 대한 컴파일 시점 유효성 검사.
 * 수정: IDE와 Gradle 플러그인 모두에서 Windows 경로를 지원합니다.

## [0.2.0] - 2016-02-29 {id="0-2-0-2016-02-29"}
[0.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.0

 * 신규: Marshal 클래스에 복사 생성자를 추가했습니다.
 * 신규: Kotlin 1.0 정식 버전으로 업데이트.
 * 수정: 'sqldelight' 폴더 구조 문제를 빌드가 실패하지 않는 방식으로 보고하도록 변경했습니다.
 * 수정: 이름이 `table_name`인 열을 금지했습니다. 생성된 상수가 테이블 이름 상수와 충돌합니다.
 * 수정: `.sq` 파일의 열림 여부와 관계없이 IDE 플러그인이 모델 클래스를 즉시 생성하도록 보장했습니다.
 * 수정: IDE와 Gradle 플러그인 모두에서 Windows 경로를 지원합니다.

## [0.1.2] - 2016-02-13 {id="0-1-2-2016-02-13"}
[0.1.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.2

 * 수정: 대부분의 프로젝트에서 Gradle 플러그인을 사용할 수 없게 만들던 코드를 제거했습니다.
 * 수정: Antlr 런타임에 대한 컴파일러 누락 의존성을 추가했습니다.

## [0.1.1] - 2016-02-12 {id="0-1-1-2016-02-12"}
[0.1.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.1

 * 수정: Gradle 플러그인이 자신과 동일한 버전의 런타임을 가리키도록 보장했습니다.

## [0.1.0] - 2016-02-12 {id="0-1-0-2016-02-12"}
[0.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.0

최초 릴리스.