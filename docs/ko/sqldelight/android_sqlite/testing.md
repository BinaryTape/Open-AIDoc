일부 테스트(마이그레이션 검증 등)에서는 Android 드라이버를 [JVM 드라이버](https://github.com/square/sqldelight#JVM)로 교체하여, Android 에뮬레이터나 실기기 없이도 데이터베이스와 관련된 코드를 테스트하고 싶을 수 있습니다. 이를 위해 JVM SQLite 드라이버를 사용하세요:

=== "Kotlin"
    ```kotlin
    dependencies {
      testImplementation("app.cash.sqldelight:sqlite-driver:{{ versions.sqldelight }}")
    }
    ```
=== "Groovy"
    ```groovy
    dependencies {
      testImplementation "app.cash.sqldelight:sqlite-driver:{{ versions.sqldelight }}"
    }
    ```

```kotlin
// 테스트에서 드라이버가 필요한 경우
@Before fun before() {
  driver = JdbcSqliteDriver(JdbcSqliteDriver.IN_MEMORY)
  Database.Schema.create(driver)
}
```

([자체 라이브러리](https://github.com/requery/sqlite-android/)를 직접 포함하는 대신) Android에 내장된 SQLite를 사용하는 경우, [sqlite-jdbc](https://github.com/xerial/sqlite-jdbc)의 버전을 [Android minSdkVersion에 맞는 버전](https://stackoverflow.com/questions/2421189/version-of-sqlite-used-in-android#4377116)으로 재정의할 수 있습니다. 예를 들어, API 23의 경우 SQLite 3.8.10.2를 사용합니다:

```groovy
dependencies {
  testImplementation('org.xerial:sqlite-jdbc') {
    // Android API 23에 맞추기 위해 sqlite-driver가 사용하는 sqlite 버전을 재정의합니다.
    version { strictly('3.8.10.2') }
  }
}
```
