---
async: true
---
# Web Worker Driverを使用したマルチプラットフォームのセットアップ

{% include 'common/index_gradle_database.md' %}

{% include 'common/index_schema.md' %}

```groovy
kotlin {
  // ターゲットとするプラットフォームに応じて、必要なドライバーが変わります：

  sourceSets.androidMain.dependencies {
    implementation "app.cash.sqldelight:android-driver:{{ versions.sqldelight }}"
  }

  // または sourceSets.iosMain, sourceSets.windowsMain など
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

## ドライバーの作成 {id="creating-drivers"}

まず、共通コード（common code）内でドライバーを作成する方法を設定します。これは `expect`/`actual` を使用するか、あるいは共通インターフェースとそのインターフェースのプラットフォーム固有の実装を用意することで行えます。

```kotlin title="src/commonMain/kotlin"
expect suspend fun provideDbDriver(
  schema: SqlSchema<QueryResult.AsyncValue<Unit>>
): SqlDriver
```
`SqlSchema` インターフェースには `QueryResult` ジェネリック型引数が含まれており、これは `generateAsync` 設定オプションを `true` に設定して生成されたスキーマコードを区別するために使用されます。
一部のドライバーはスキーマの作成や移行時に同期的な動作に依存するため、非同期スキーマを使用する場合は [`synchronous()`](../../2.x/extensions/async-extensions/app.cash.sqldelight.async.coroutines/#427896482%2FFunctions%2F-1043631958) 拡張メソッドを使用して、同期ドライバーで使用できるように適合させることができます。

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
