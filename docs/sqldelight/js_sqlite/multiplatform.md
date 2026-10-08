---
async: true
---
# 使用 Web Worker 驱动程序的多平台设置

{% include 'common/index_gradle_database.md' %}

{% include 'common/index_schema.md' %}

```groovy
kotlin {
  // 所需的驱动程序将根据您的目标平台而变化：

  sourceSets.androidMain.dependencies {
    implementation "app.cash.sqldelight:android-driver:{{ versions.sqldelight }}"
  }

  // 或者 sourceSets.iosMain、sourceSets.windowsMain 等
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

## 创建驱动程序 {id="creating-drivers"}

首先在您的公共代码中设置一种创建驱动程序的方法。这可以使用 `expect`/`actual` 来完成，或者简单地通过一个公共接口以及该接口的平台特定实现来完成。

```kotlin title="src/commonMain/kotlin"
expect suspend fun provideDbDriver(
  schema: SqlSchema<QueryResult.AsyncValue<Unit>>
): SqlDriver
```
`SqlSchema` 接口包含一个泛型 `QueryResult` 类型参数，用于区分在 `generateAsync` 配置选项设置为 `true` 时生成的架构代码。
某些驱动程序在创建或迁移架构时依赖同步行为，因此要使用异步架构，您可以使用 [`synchronous()`](../../2.x/extensions/async-extensions/app.cash.sqldelight.async.coroutines/#427896482%2FFunctions%2F-1043631958) 扩展方法将其适配，以便与同步驱动程序一起使用。

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
