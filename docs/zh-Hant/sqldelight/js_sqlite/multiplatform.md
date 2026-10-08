---
async: true
---
# 使用 Web Worker Driver 進行多平台設定

{% include 'common/index_gradle_database.md' %}

{% include 'common/index_schema.md' %}

```groovy
kotlin {
  // 視您目標平台的不同，所需的驅動程式也會有所變化：

  sourceSets.androidMain.dependencies {
    implementation "app.cash.sqldelight:android-driver:{{ versions.sqldelight }}"
  }

  // 或 sourceSets.iosMain, sourceSets.windowsMain 等。
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

## 建立驅動程式 {id="creating-drivers"}

首先在您的共用程式碼中設定建立驅動程式的方法。這可以使用 `expect`/`actual` 來完成，或者簡單地使用一個通用介面以及該介面在平台特定的實作。

```kotlin title="src/commonMain/kotlin"
expect suspend fun provideDbDriver(
  schema: SqlSchema<QueryResult.AsyncValue<Unit>>
): SqlDriver
```
`SqlSchema` 介面包含一個泛型 `QueryResult` 型別引數，用於區分在將 `generateAsync` 配置選項設定為 `true` 時產生的架構程式碼。某些驅動程式在建立或遷移架構時依賴同步行為，因此若要使用非同步架構，您可以使用 [`synchronous()`](../../2.x/extensions/async-extensions/app.cash.sqldelight.async.coroutines/#427896482%2FFunctions%2F-1043631958) 擴充方法將其調整為與同步驅動程式搭配使用。

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
