在某些測試中（例如驗證遷移），你可能希望將 Android 驅動程式更換為 [JVM 驅動程式](https://github.com/square/sqldelight#JVM)，讓你在無需 Android 模擬器或實體裝置的情況下測試涉及資料庫的程式碼。若要執行此操作，請使用 JVM SQLite 驅動程式：

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
// 當你的測試需要驅動程式時
@Before fun before() {
  driver = JdbcSqliteDriver(JdbcSqliteDriver.IN_MEMORY)
  Database.Schema.create(driver)
}
```

如果你使用的是 Android 內建的 SQLite（而非隨附 [你自己的版本](https://github.com/requery/sqlite-android/)），你可以將 [sqlite-jdbc](https://github.com/xerial/sqlite-jdbc) 的版本覆寫為 [與你的 Android minSdkVersion 相符](https://stackoverflow.com/questions/2421189/version-of-sqlite-used-in-android#4377116) 的版本，例如針對 API 23 使用 SQLite 3.8.10.2：

```groovy
dependencies {
  testImplementation('org.xerial:sqlite-jdbc') {
    // 覆寫 sqlite-driver 所使用的 sqlite 版本以符合 Android API 23
    version { strictly('3.8.10.2') }
  }
}
```
