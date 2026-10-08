---
async: true
---
# Web Worker 드라이버를 사용한 멀티플랫폼 설정

{% include 'common/index_gradle_database.md' %}

{% include 'common/index_schema.md' %}

```groovy
kotlin {
  // 대상 플랫폼에 따라 필요한 드라이버가 달라집니다:

  sourceSets.androidMain.dependencies {
    implementation "app.cash.sqldelight:android-driver:{{ versions.sqldelight }}"
  }

  // 또는 sourceSets.iosMain, sourceSets.windowsMain 등
  sourceSets.nativeMain.dependencies {
    implementation "app.cash.sqldelight:native-driver:{{ versions.sqldelight }}"
  }

  sourceSets.jvmMain.dependencies {
    implementation "app.cash.sqldelight:sqlite-driver:{{ versions.sqldelight }}"
  }

  sourceSets.jsMain.dependencies {
    implementation "app.cash.sqldelight:web-worker-driver:{{ versions.sqldelight }}"
    implementation npm("sql.js", "1.6.2")
    implementation devNpm("copy-webpack-plugin", "9.1.0")
  }
}
```

## 드라이버 생성하기 {id="creating-drivers"}

먼저 공통 코드(common code)에서 드라이버를 생성할 방법을 설정합니다. 이는 `expect`/`actual`을 사용하거나, 단순히 공통 인터페이스와 해당 인터페이스의 플랫폼별 구현을 통해 수행할 수 있습니다.

```kotlin title="src/commonMain/kotlin"
expect suspend fun provideDbDriver(
  schema: SqlSchema<QueryResult.AsyncValue<Unit>>
): SqlDriver
```
`SqlSchema` 인터페이스는 `generateAsync` 설정 옵션이 `true`로 설정되어 생성된 스키마 코드를 구분하기 위해 사용되는 제네릭 `QueryResult` 타입 인자를 포함합니다.
일부 드라이버는 스키마를 생성하거나 마이그레이션할 때 동기 동작(synchronous behaviours)에 의존하므로, 비동기 스키마를 사용하려면 [`synchronous()`](../../2.x/extensions/async-extensions/app.cash.sqldelight.async.coroutines/#427896482%2FFunctions%2F-1043631958) 확장 함수를 사용하여 동기 드라이버에서 사용할 수 있도록 조정할 수 있습니다. 

=== "src/jsMain/kotlin"
    ```kotlin
    actual suspend fun provideDbDriver(
      schema: SqlSchema<QueryResult.AsyncValue<Unit>>
    ): SqlDriver {
      return WebWorkerDriver(
        Worker(
          js("""new URL("@cashapp/sqldelight-sqljs-worker/sqljs.worker.js", import.meta.url)""")
        )
      ).also { schema.create(it).await() }
    }
    ```
=== "src/jvmMain/kotlin"
    ```kotlin
    actual suspend fun provideDbDriver(
      schema: SqlSchema<QueryResult.AsyncValue<Unit>>
    ): SqlDriver {
      return JdbcSqliteDriver(JdbcSqliteDriver.IN_MEMORY)
        .also { schema.create(it).await() }
    }
    ```
=== "src/androidMain/kotlin"
    ```kotlin
    actual suspend fun provideDbDriver(
      schema: SqlSchema<QueryResult.AsyncValue<Unit>>
    ): SqlDriver {
      return AndroidSqliteDriver(schema.synchronous(), context, "test.db")
    }
    ```
=== "src/nativeMain/kotlin"
    ```kotlin
    actual suspend fun provideDbDriver(
      schema: SqlSchema<QueryResult.AsyncValue<Unit>>
    ): SqlDriver {
      return NativeSqliteDriver(schema.synchronous(), "test.db")
    }
    ```
