一部のテスト（マイグレーションの検証など）では、Androidドライバーを[JVMドライバー](https://github.com/square/sqldelight#JVM)に置き換えたい場合があります。これにより、Androidエミュレーターや実機を必要とせずに、データベースに関連するコードをテストできるようになります。その場合は、JVM用のSQLiteドライバーを使用します。

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
// テストでドライバーが必要な場合
@Before fun before() {
  driver = JdbcSqliteDriver(JdbcSqliteDriver.IN_MEMORY)
  Database.Schema.create(driver)
}
```

（[独自のもの](https://github.com/requery/sqlite-android/)を配布するのではなく）Androidに同梱されているSQLiteを使用している場合は、[sqlite-jdbc](https://github.com/xerial/sqlite-jdbc)のバージョンを[AndroidのminSdkVersionに一致するもの](https://stackoverflow.com/questions/2421189/version-of-sqlite-used-in-android#4377116)にオーバーライドできます。たとえば、API 23の場合はSQLite 3.8.10.2を使用します。

```groovy
dependencies {
  testImplementation('org.xerial:sqlite-jdbc') {
    // Android API 23に合わせるため、sqlite-driverが使用するsqliteのバージョンをオーバーライドする
    version { strictly('3.8.10.2') }
  }
}
```
