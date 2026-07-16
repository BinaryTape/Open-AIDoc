[//]: # (title: KtorとSQLDelightを使用したマルチプラットフォームアプリの作成)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

<tldr>
<p>このチュートリアルではIntelliJ IDEAを使用しますが、Android Studioでも同様に進めることができます。両方のIDEは共通のコア機能とKotlin Multiplatformサポートを共有しています。</p>
</tldr>

このチュートリアルでは、IntelliJ IDEAを使用して、Kotlin Multiplatformを用いたiOSおよびAndroid向けの高度なモバイルアプリケーションを作成する方法を説明します。
このアプリケーションでは以下のことを行います。

*   Ktorを使用して、パブリックな [SpaceX API](https://docs.spacexdata.com/?version=latest) からインターネット経由でデータを取得する。
*   SQLDelightを使用して、ローカルデータベースにデータを保存する。
*   SpaceXのロケット打ち上げリストを、打ち上げ日、結果、および詳細な説明とともに表示する。

このアプリケーションには、iOSとAndroidの両方のプラットフォームで共有されるコードを含むモジュールが含まれます。ビジネスロジックとデータアクセスレイヤーは共有モジュールに一度だけ実装され、両方のアプリケーションのUIはネイティブで実装されます。

![エミュレーターとシミュレーター](android-and-ios.png){width=600}

プロジェクトでは、以下のマルチプラットフォームライブラリを使用します。

*   インターネット経由でデータを取得するためのHTTPクライアントとしての [Ktor](https://ktor.io/docs/create-client.html)。
*   JSONレスポンスをエンティティクラスのオブジェクトにデシリアライズするための [`kotlinx.serialization`](https://github.com/Kotlin/kotlinx.serialization)。
*   非同期コードを記述するための [`kotlinx.coroutines`](https://github.com/Kotlin/kotlinx.coroutines)。
*   SQLクエリからKotlinコードを生成し、型安全なデータベースAPIを作成するための [SQLDelight](https://github.com/cashapp/sqldelight)。
*   依存性の注入（Dependency Injection）を介してプラットフォーム固有のデータベースドライバーを提供するための [Koin](https://insert-koin.io/)。

> [テンプレートプロジェクト](https://github.com/kotlin-hands-on/kmm-networking-and-data-storage) および [最終的なアプリケーション](https://github.com/kotlin-hands-on/kmm-networking-and-data-storage/tree/final) のソースコードは、GitHubリポジトリで見つけることができます。
>
{style="note"}

## プロジェクトの作成

1. [クイックスタート](quickstart.md)の手順に従って、[Kotlin Multiplatform開発のための環境構築](quickstart.md#set-up-the-environment)を完了してください。
2. IntelliJ IDEAで、**File** | **New** | **Project** を選択します。
3. 左側のパネルで **Kotlin Multiplatform** を選択します（Android Studioの場合、テンプレートは **New Project** ウィザードの **Generic** タブにあります）。
4. **New Project** ウィンドウで以下のフィールドを指定します。

   *   **Name**: SpaceTutorial
   *   **Group**: com.jetbrains
   *   **Artifact**: spacetutorial

   ![KtorとSQLDelightを使用したマルチプラットフォームプロジェクトの作成](create-ktor-sqldelight-multiplatform-project.png){width=800}

5. **Android** と **iOS** のターゲットを選択します。
6. iOSについては、**Do not share UI** オプションを選択します。両方のプラットフォームでネイティブUIを実装します。
7. すべてのフィールドとターゲットを指定したら、**Create** をクリックします。

## Gradle依存関係の追加

共有モジュールにマルチプラットフォームライブラリを追加するには、`build.gradle.kts` ファイル内の関連するソースセットの `dependencies {}` ブロックに依存関係の指示（`implementation`）を追加する必要があります。

`kotlinx.serialization` と SQLDelight ライブラリの両方は、追加の設定も必要です。

`gradle/libs.versions.toml` ファイルのバージョンカタログ内の行を変更または追加して、必要なすべての依存関係を反映させます。

1. `[versions]` ブロックで、AGP（Android Gradle Plugin）のバージョンを確認し、残りを追加します。

   ```
   [versions]
   agp = "8.7.3"
   ...
   coroutinesVersion = "%coroutinesVersion%"
   dateTimeVersion = "%dateTimeVersion%"
   koin = "%koinVersion%"
   ktor = "%ktorVersion%"
   sqlDelight = "%sqlDelightVersion%"
   material3 = "1.3.2"
   ```
   {initial-collapse-state="collapsed" collapsible="true" collapsed-title="[versions]"}

2. `[libraries]` ブロックに、以下のライブラリ参照を追加します。

   ```
   [libraries]
   ...
   android-driver = { module = "app.cash.sqldelight:android-driver", version.ref = "sqlDelight" }
   koin-androidx-compose = { module = "io.insert-koin:koin-androidx-compose", version.ref = "koin" }
   koin-core = { module = "io.insert-koin:koin-core", version.ref = "koin" }
   kotlinx-coroutines-core = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-core", version.ref = "coroutinesVersion" }
   kotlinx-datetime = { module = "org.jetbrains.kotlinx:kotlinx-datetime", version.ref = "dateTimeVersion" }
   ktor-client-android = { module = "io.ktor:ktor-client-android", version.ref = "ktor" }
   ktor-client-content-negotiation = { module = "io.ktor:ktor-client-content-negotiation", version.ref = "ktor" }
   ktor-client-core = { module = "io.ktor:ktor-client-core", version.ref = "ktor" }
   ktor-client-darwin = { module = "io.ktor:ktor-client-darwin", version.ref = "ktor" }
   ktor-serialization-kotlinx-json = { module = "io.ktor:ktor-serialization-kotlinx-json", version.ref = "ktor" }
   native-driver = { module = "app.cash.sqldelight:native-driver", version.ref = "sqlDelight" }
   runtime = { module = "app.cash.sqldelight:runtime", version.ref = "sqlDelight" }
   androidx-compose-material3 = { module = "androidx.compose.material3:material3", version.ref="material3" }
   ```
   {initial-collapse-state="collapsed" collapsible="true" collapsed-title="[libraries]"}

3. `[plugins]` ブロックで、必要なGradleプラグインを指定します。

   ```
   [plugins]
   ...
   kotlinxSerialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
   sqldelight = { id = "app.cash.sqldelight", version.ref = "sqlDelight" }
   ```

4. 依存関係が追加されると、プロジェクトの再同期を促されます。**Sync Gradle Changes** ボタンをクリックして、Gradleファイルを同期します。 ![Gradleファイルの同期](gradle-sync.png){width=50}

5. `shared/build.gradle.kts` ファイルの冒頭にある `plugins {}` ブロックに、以下の行を追加します。

   ```kotlin
   plugins {
       // ...
       alias(libs.plugins.kotlinxSerialization)
       alias(libs.plugins.sqldelight)
   }
   ```

6. 共通ソースセット（common source set）には、各ライブラリのコアアーティファクトと、ネットワークリクエストおよびレスポンスの処理に `kotlinx.serialization` を使用するためのKtor [シリアライゼーション機能](https://ktor.io/docs/serialization-client.html)が必要です。
    また、iOSおよびAndroidソースセットには、SQLDelightとKtorのプラットフォームドライバーが必要です。

    同じ `shared/build.gradle.kts` ファイルに、必要なすべての依存関係を追加します。

    ```kotlin
    kotlin {
        // ...
    
        sourceSets {
            commonMain.dependencies {
                implementation(libs.kotlinx.coroutines.core)
                implementation(libs.ktor.client.core)
                implementation(libs.ktor.client.content.negotiation)
                implementation(libs.ktor.serialization.kotlinx.json)
                implementation(libs.runtime)
                implementation(libs.kotlinx.datetime)
                implementation(libs.koin.core)
            }
            androidMain.dependencies {
                implementation(libs.ktor.client.android)
                implementation(libs.android.driver)
            }
            iosMain.dependencies {
                implementation(libs.ktor.client.darwin)
                implementation(libs.native.driver)
            }
        }
    }
    ```

7. `sourceSets` ブロックの最初で、Kotlin標準ライブラリの実験的なTime APIをオプトインします。

    ```kotlin
    kotlin {
        // ...
    
        sourceSets {
            all {
                languageSettings.optIn("kotlin.time.ExperimentalTime")
            }
            
            // ...
        }
    }
    ```

8. 依存関係を追加したら、**Sync Gradle Changes** ボタンをもう一度クリックしてGradleファイルを同期します。

Gradleの同期が完了したら、プロジェクトの設定は終了です。コードの記述を開始できます。

> マルチプラットフォームの依存関係に関する詳細なガイドについては、[Kotlin Multiplatformライブラリへの依存関係](multiplatform-add-dependencies.md) を参照してください。
>
{style="tip"}

## アプリケーションデータモデルの作成

チュートリアルアプリには、ネットワーキングサービスとキャッシュサービスを抽象化するファサードとして、パブリックな `SpaceXSDK` クラスが含まれます。
アプリケーションデータモデルには、以下の情報を持つ3つのエンティティクラスがあります。

*   打ち上げに関する一般情報
*   ミッションパッチの画像へのリンク
*   打ち上げに関連する記事のURL

> このチュートリアルの最後までには、これらすべてのデータがUIに表示されるわけではありません。
> データモデルはシリアライゼーションを実演するために使用しています。
> しかし、リンクやパッチを使って、この例をより情報量の多いものに拡張して遊んでみることもできます！
>
{style="note"}

必要なデータクラスを作成します。

1. `shared/src/commonMain/kotlin/com/jetbrains/spacetutorial` ディレクトリに `entity` パッケージを作成し、そのパッケージの中に `Entity.kt` ファイルを作成します。
2. 基本的なエンティティのすべてのデータクラスを宣言します。

   ```kotlin
   
   ```

各シリアル化可能なクラスには `@Serializable` アノテーションを付ける必要があります。`kotlinx.serialization` プラグインは、アノテーションの引数でシリアライザーへのリンクを明示的に渡さない限り、`@Serializable` クラス用のデフォルトシリアライザーを自動的に生成します。

`@SerialName` アノテーションを使用するとフィールド名を再定義でき、より読みやすい識別子を使用してデータクラスのプロパティにアクセスするのに役立ちます。

## SQLDelightの設定とキャッシュロジックの実装

### SQLDelightの設定

SQLDelightライブラリを使用すると、SQLクエリから型安全なKotlinデータベースAPIを生成できます。コンパイル中にジェネレーターはSQLクエリを検証し、共有モジュールで使用できるKotlinコードに変換します。

SQLDelightの依存関係はすでにプロジェクトに含まれています。ライブラリを設定するには、`shared/build.gradle.kts` ファイルを開き、最後に `sqldelight {}` ブロックを追加します。このブロックには、データベースのリストとそのパラメータが含まれます。

```kotlin
sqldelight {
    databases {
        create("AppDatabase") {
            packageName.set("com.jetbrains.spacetutorial.cache")
        }
    }
}
```

`packageName` パラメータは、生成されるKotlinソースのパッケージ名を指定します。

プロンプトが表示されたらGradleプロジェクトファイルを同期するか、<shortcut>Shift</shortcut> を2回押して **Sync All Gradle, Swift Package Manager projects** を検索して実行します。

> `.sq` ファイルを扱うために、公式の [SQLDelightプラグイン](https://plugins.jetbrains.com/plugin/8191-sqldelight) をインストールすることを検討してください。
>
{style="tip"}

### データベースAPIの生成

まず、必要なすべてのSQLクエリを含む `.sq` ファイルを作成します。デフォルトでは、SQLDelightプラグインはソースセットの `sqldelight` フォルダ内にある `.sq` ファイルを探します。

1. `shared/src/commonMain` ディレクトリに新しい `sqldelight` ディレクトリを作成します。
2. `sqldelight` ディレクトリの中に、パッケージ用のネストされたディレクトリを作成するために、`com/jetbrains/spacetutorial/cache` という名前の新しいディレクトリを作成します。
3. `cache` ディレクトリの中に、`AppDatabase.sq` ファイルを作成します（`build.gradle.kts` ファイルで指定したデータベースと同じ名前にします）。
   アプリケーションのすべてのSQLクエリはこのファイルに保存されます。
4. データベースには、打ち上げに関するデータを持つテーブルが含まれます。
   テーブルを作成するための以下のコードを `AppDatabase.sq` ファイルに追加します。

   ```text
   import kotlin.Boolean;
   
   CREATE TABLE Launch (
       flightNumber INTEGER NOT NULL,
       missionName TEXT NOT NULL,
       details TEXT,
       launchSuccess INTEGER AS Boolean DEFAULT NULL,
       launchDateUTC TEXT NOT NULL,
       patchUrlSmall TEXT,
       patchUrlLarge TEXT,
       articleUrl TEXT
   );
   ```

5. テーブルにデータを挿入するための `insertLaunch` 関数を追加します。

   ```text
   insertLaunch:
   INSERT INTO Launch(flightNumber, missionName, details, launchSuccess, launchDateUTC, patchUrlSmall, patchUrlLarge, articleUrl)
   VALUES(?, ?, ?, ?, ?, ?, ?, ?);
   ```

6. テーブルのデータをクリアするための `removeAllLaunches` 関数を追加します。

   ```text
   removeAllLaunches:
   DELETE FROM Launch;
   ```

7. データを取得するための `selectAllLaunchesInfo` 関数を宣言します。

   ```text
   selectAllLaunchesInfo:
   SELECT Launch.*
   FROM Launch;
   ```
8. 対応する `AppDatabase` インターフェースを生成します（これについては後でデータベースドライバーを使用して初期化します）。
   そのためには、ターミナルで以下のコマンドを実行します。

   ```shell
   ./gradlew generateCommonMainAppDatabaseInterface
   ```

   生成されたKotlinコードは `shared/build/generated/sqldelight` ディレクトリに保存されます。

### プラットフォーム固有のデータベースドライバー用のファクトリの作成

`AppDatabase` インターフェースを初期化するために、`SqlDriver` インスタンスを渡します。
SQLDelightはSQLiteドライバーの複数のプラットフォーム固有の実装を提供しているため、各プラットフォームごとに個別にインスタンスを作成する必要があります。

これは [expect/actualインターフェース](multiplatform-expect-actual.md) を使用して実現することもできますが、このプロジェクトでは Kotlin Multiplatform で依存性の注入を試すために [Koin](https://insert-koin.io/) を使用します。

1. データベースドライバー用のインターフェースを作成します。そのためには、`shared/src/commonMain/kotlin/com/jetbrains/spacetutorial/` ディレクトリに `cache` パッケージを作成します。
2. `cache` パッケージ内に `DatabaseDriverFactory` インターフェースを作成します。

   ```kotlin
   package com.jetbrains.spacetutorial.cache
   
   import app.cash.sqldelight.db.SqlDriver

   interface DatabaseDriverFactory {
       fun createDriver(): SqlDriver
   }
   ```

3. Android 用にこのインターフェースを実装するクラスを作成します。`shared/src/androidMain/kotlin` ディレクトリに `com.jetbrains.spacetutorial.cache` パッケージを作成し、その中に `DatabaseDriverFactory.kt` ファイルを作成します。
4. Android では、SQLiteドライバーは `AndroidSqliteDriver` クラスによって実装されます。`DatabaseDriverFactory.kt` ファイルで、データベース情報とコンテキストへのリンクを `AndroidSqliteDriver` クラスのコンストラクタに渡します。

   ```kotlin
   package com.jetbrains.spacetutorial.cache
   
   import android.content.Context
   import app.cash.sqldelight.db.SqlDriver
   import app.cash.sqldelight.driver.android.AndroidSqliteDriver

   class AndroidDatabaseDriverFactory(private val context: Context) : DatabaseDriverFactory {
       override fun createDriver(): SqlDriver {
           return AndroidSqliteDriver(AppDatabase.Schema, context, "launch.db")
       }
   }
   ```

5. iOS 用には、`shared/src/iosMain/kotlin/com/jetbrains/spacetutorial/` ディレクトリに `cache` パッケージを作成します。
6. `cache` パッケージ内に `DatabaseDriverFactory.kt` ファイルを作成し、このコードを追加します。

   ```kotlin
   package com.jetbrains.spacetutorial.cache
   
   import app.cash.sqldelight.db.SqlDriver
   import app.cash.sqldelight.driver.native.NativeSqliteDriver

   class IOSDatabaseDriverFactory : DatabaseDriverFactory {
       override fun createDriver(): SqlDriver {
           return NativeSqliteDriver(AppDatabase.Schema, "launch.db")
       }
   }
   ```

これらのドライバーのインスタンスは、後でプロジェクトのプラットフォーム固有のコードで実装します。

### キャッシュの実装

ここまでで、プラットフォームデータベースドライバー用のファクトリと、データベース操作を実行するための `AppDatabase` インターフェースを追加しました。
次に、`AppDatabase` インターフェースをラップし、キャッシュロジックを含む `Database` クラスを作成します。

1. 共通ソースセット `shared/src/commonMain/kotlin` の `com.jetbrains.spacetutorial.cache` パッケージに新しい `Database` クラスを作成します。これには両方のプラットフォームに共通のロジックが含まれます。

2. `AppDatabase` にドライバーを提供するために、抽象的な `DatabaseDriverFactory` インスタンスを `Database` クラスのコンストラクタに渡します。

   ```kotlin
   package com.jetbrains.spacetutorial.cache

   internal class Database(databaseDriverFactory: DatabaseDriverFactory) {
       private val database = AppDatabase(databaseDriverFactory.createDriver())
       private val dbQuery = database.appDatabaseQueries
   }
   ```

   このクラスの [可視性](https://kotlinlang.org/docs/visibility-modifiers.html#class-members) は internal に設定されており、マルチプラットフォームモジュール内からのみアクセス可能であることを意味します。

3. `Database` クラスの中に、いくつかのデータ処理操作を実装します。
   まず、すべてのロケット打ち上げのリストを返す `getAllLaunches` 関数を作成します。
   `mapLaunchSelecting` 関数は、データベースクエリの結果を `RocketLaunch` オブジェクトにマッピングするために使用されます。

    ```kotlin
    import com.jetbrains.spacetutorial.entity.Links
    import com.jetbrains.spacetutorial.entity.Patch
    import com.jetbrains.spacetutorial.entity.RocketLaunch
    
    internal class Database(databaseDriverFactory: DatabaseDriverFactory) {
        // ...
    
        internal fun getAllLaunches(): `List<RocketLaunch>` {
            return dbQuery.selectAllLaunchesInfo(::mapLaunchSelecting).executeAsList()
        }
    
        private fun mapLaunchSelecting(
            flightNumber: Long,
            missionName: String,
            details: String?,
            launchSuccess: Boolean?,
            launchDateUTC: String,
            patchUrlSmall: String?,
            patchUrlLarge: String?,
            articleUrl: String?
        ): RocketLaunch {
            return RocketLaunch(
                flightNumber = flightNumber.toInt(),
                missionName = missionName,
                details = details,
                launchDateUTC = launchDateUTC,
                launchSuccess = launchSuccess,
                links = Links(
                    patch = Patch(
                        small = patchUrlSmall,
                        large = patchUrlLarge
                    ),
                    article = articleUrl
                )
            )
        }
    }
    ```
   {initial-collapse-state="collapsed" collapsible="true" collapsed-title="internal fun getAllLaunches()"}

4. データベースをクリアして新しいデータを挿入するための `clearAndCreateLaunches` 関数を追加します。

    ```kotlin
    internal class Database(databaseDriverFactory: DatabaseDriverFactory) {
        // ...
    
        internal fun clearAndCreateLaunches(launches: List<RocketLaunch>) {
            dbQuery.transaction {
                dbQuery.removeAllLaunches()
                launches.forEach { launch ->
                    dbQuery.insertLaunch(
                        flightNumber = launch.flightNumber.toLong(),
                        missionName = launch.missionName,
                        details = launch.details,
                        launchSuccess = launch.launchSuccess ?: false,
                        launchDateUTC = launch.launchDateUTC,
                        patchUrlSmall = launch.links.patch?.small,
                        patchUrlLarge = launch.links.patch?.large,
                        articleUrl = launch.links.article
                    )
                }
            }
        }
    }
    ```

## APIサービスの実装

インターネット経由でデータを取得するために、[SpaceXパブリックAPI](https://github.com/r-spacex/SpaceX-API/tree/master/docs#rspacex-api-docs) と、`v5/launches` エンドポイントからすべての打ち上げリストを取得する単一のメソッドを使用します。

アプリケーションをAPIに接続するクラスを作成します。

1. `shared/src/commonMain/kotlin/com/jetbrains/spacetutorial/` ディレクトリに `network` パッケージを作成します。
2. `network` ディレクトリの中に `SpaceXApi` クラスを作成します。

    ```kotlin
    package com.jetbrains.spacetutorial.network
    
    import io.ktor.client.HttpClient
    import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
    import io.ktor.serialization.kotlinx.json.json
    import kotlinx.serialization.json.Json
    
    class SpaceXApi {
        private val httpClient = HttpClient {
            install(ContentNegotiation) {
                json(Json {
                    ignoreUnknownKeys = true
                    useAlternativeNames = false 
                })
            }
        }
    }
    ```

    このクラスはネットワークリクエストを実行し、JSONレスポンスを `com.jetbrains.spacetutorial.entity` パッケージのエンティティにデシリアライズします。
    Ktorの `HttpClient` インスタンスが `httpClient` プロパティを初期化して保持します。

    このコードでは、`GET` リクエストの結果をデシリアライズするために Ktor の [`ContentNegotiation`](https://ktor.io/docs/serialization-client.html) プラグインを使用しています。このプラグインは、リクエストとレスポンスのペイロードを JSON として処理し、必要に応じてシリアライズおよびデシリアライズします。

3. ロケット打ち上げのリストを返すデータ取得関数を宣言します。

    ```kotlin
    import com.jetbrains.spacetutorial.entity.RocketLaunch
    import io.ktor.client.request.get
    import io.ktor.client.call.body
    
    class SpaceXApi {
        // ...
        
        suspend fun getAllLaunches(): `List<RocketLaunch>` {
            return httpClient.get("https://api.spacexdata.com/v5/launches").body()
        }
    }
    ```

`getAllLaunches` 関数には `suspend` 修飾子が付いています。これは、サスペンド関数である `HttpClient.get()` の呼び出しを含んでいるためです。
     `get()` 関数にはインターネット経由でデータを取得するための非同期操作が含まれており、コルーチンまたは別のサスペンド関数からしか呼び出すことができません。ネットワークリクエストはHTTPクライアントのスレッドプールで実行されます。
   
GETリクエストを送信するためのURLが、`get()` 関数の引数として渡されます。

## SDKの構築

iOSおよびAndroidアプリケーションは、共有モジュールを通じてSpaceX APIと通信します。共有モジュールは公開クラス `SpaceXSDK` を提供します。

1. 共通ソースセット `shared/src/commonMain/kotlin` の `com.jetbrains.spacetutorial` パッケージに `SpaceXSDK` クラスを作成します。
   このクラスは、`Database` クラスと `SpaceXApi` クラスのファサードになります。

   `Database` クラスのインスタンスを作成するために、`DatabaseDriverFactory` インスタンスを提供します。

   ```kotlin
   package com.jetbrains.spacetutorial
   
   import com.jetbrains.spacetutorial.cache.Database
   import com.jetbrains.spacetutorial.cache.DatabaseDriverFactory
   import com.jetbrains.spacetutorial.network.SpaceXApi

   class SpaceXSDK(databaseDriverFactory: DatabaseDriverFactory, val api: SpaceXApi) { 
       private val database = Database(databaseDriverFactory)
   }
   ```

   `SpaceXSDK` クラスのコンストラクタを通じて、プラットフォーム固有のコードで正しいデータベースドライバーを注入します。

2. 作成したデータベースとAPIを使用して打ち上げリストを取得する `getLaunches` 関数を追加します。

    ```kotlin
    import com.jetbrains.spacetutorial.entity.RocketLaunch
    
    class SpaceXSDK(databaseDriverFactory: DatabaseDriverFactory, val api: SpaceXApi) {
        // ...
   
        @Throws(Exception::class)
        suspend fun getLaunches(forceReload: Boolean): `List<RocketLaunch>` {
            val cachedLaunches = database.getAllLaunches()
            return if (cachedLaunches.isNotEmpty() && !forceReload) {
                cachedLaunches
            } else {
                api.getAllLaunches().also {
                    database.clearAndCreateLaunches(it)
                }
            }
        }
    }
    ```

このクラスには、すべての打ち上げ情報を取得するための関数が1つ含まれています。`forceReload` の値に応じて、キャッシュされた値を返すか、インターネットからデータをロードしてからその結果でキャッシュを更新します。キャッシュされたデータがない場合は、`forceReload` フラグの値に関係なくインターネットからデータをロードします。

SDKのクライアントは、`forceReload` フラグを使用して最新の打ち上げ情報をロードでき、ユーザー向けのプル・トゥ・リフレッシュ（引っ張って更新）ジェスチャなどを実現できます。

Kotlinのすべての例外は非検査（unchecked）ですが、Swiftには検査例外（checked errors）しかありません（詳細は [Swift/Objective-Cとの相互運用性](https://kotlinlang.org/docs/native-objc-interop.html#errors-and-exceptions) を参照）。したがって、Swiftコードに期待される例外を認識させるために、Swiftから呼び出されるKotlin関数には、潜在的な例外クラスのリストを指定する `@Throws` アノテーションを付ける必要があります。

## Androidアプリケーションの作成

IntelliJ IDEAが初期のGradle設定を自動で行うため、`shared` モジュールはすでにAndroidアプリケーションに接続されています。

UIとプレゼンテーションロジックを実装する前に、必要なすべてのUI依存関係を `composeApp/build.gradle.kts` ファイルに追加します。

```kotlin
kotlin {
// ...
    sourceSets {
        androidMain.dependencies {
            implementation(libs.androidx.compose.material3)
            implementation(libs.koin.androidx.compose)
            implementation(libs.androidx.lifecycle.viewmodelCompose)
        }
        // ... 
    }
}
```

プロンプトが表示されたらGradleプロジェクトファイルを同期するか、<shortcut>Shift</shortcut> を2回押して **Sync All Gradle, Swift Package Manager projects** を検索して実行します。

### インターネットアクセス権限の追加

インターネットにアクセスするには、Androidアプリケーションに適切な権限が必要です。
`composeApp/src/androidMain/AndroidManifest.xml` ファイルに、`<uses-permission>` タグを追加します。

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <!--...-->
</manifest>
```

### 依存性の注入の追加

Koinの依存性の注入を使用すると、異なるコンテキストで使用できるモジュール（コンポーネントのセット）を宣言できます。
このプロジェクトでは、Androidアプリケーション用とiOSアプリ用の2つのモジュールを作成します。
次に、対応するモジュールを使用して、各ネイティブUIに対してKoinを開始します。

Androidアプリのコンポーネントを含むKoinモジュールを宣言します。

1. `composeApp/src/androidMain/kotlin` ディレクトリの `com.jetbrains.spacetutorial` パッケージに `AppModule.kt` ファイルを作成します。

   そのファイルで、`SpaceXApi` クラス用と `SpaceXSDK` クラス用の2つの [シングルトン](https://insert-koin.io/docs/reference/koin-core/definitions#defining-a-singleton) としてモジュールを宣言します。

   ```kotlin
   package com.jetbrains.spacetutorial
   
   import com.jetbrains.spacetutorial.cache.AndroidDatabaseDriverFactory
   import com.jetbrains.spacetutorial.network.SpaceXApi
   import org.koin.android.ext.koin.androidContext
   import org.koin.dsl.module
   
   val appModule = module { 
       single<SpaceXApi> { SpaceXApi() }
       single<SpaceXSDK> {
           SpaceXSDK(
               databaseDriverFactory = AndroidDatabaseDriverFactory(
                   androidContext()
               ), api = get()
           )
       }
   }
   ```

   `SpaceXSDK` クラスのコンストラクタには、プラットフォーム固有の `AndroidDatabaseDriverFactory` クラスが注入されます。
   `get()` 関数はモジュール内の依存関係を解決します。`SpaceXSDK()` の `api` パラメータの代わりに、Koinは先ほど宣言した `SpaceXApi` シングルトンを渡します。

2. Koinモジュールを開始するカスタム `Application` クラスを作成します。

   `AppModule.kt` ファイルの隣に、`Application.kt` ファイルを作成し、以下のコードを記述します。`modules()` 関数の呼び出しで、宣言したモジュールを指定します。

   ```kotlin
   package com.jetbrains.spacetutorial
   
   import android.app.Application
   import org.koin.android.ext.koin.androidContext
   import org.koin.core.context.GlobalContext.startKoin
    
   class MainApplication : Application() {
       override fun onCreate() {
           super.onCreate()
    
           startKoin {
               androidContext(this@MainApplication)
               modules(appModule)
           }
       }
   }
   ```

3. `AndroidManifest.xml` ファイルの `<application>` タグで、作成した `MainApplication` クラスを指定します。

    ```xml
    <manifest xmlns:android="http://schemas.android.com/apk/res/android">
        ...
        <application
            ...
            android:name="com.jetbrains.spacetutorial.MainApplication">
            ...
        </application>
    </manifest>
    ```

これで、プラットフォーム固有のデータベースドライバーによって提供される情報を使用するUIを実装する準備が整いました。

### 打ち上げリストを表示するビューモデルの準備

Jetpack ComposeとMaterial 3を使用してAndroidのUIを実装します。まず、SDKを使用して打ち上げリストを取得するビューモデルを作成します。次にMaterialテーマを設定し、最後にすべてを統合するコンポーザブル（composable）関数を作成します。

1. `composeApp/src/androidMain` ソースセットの `com.jetbrains.spacetutorial` パッケージに `RocketLaunchViewModel.kt` ファイルを作成します。

   ```kotlin
   package com.jetbrains.spacetutorial
   
   import androidx.compose.runtime.State
   import androidx.compose.runtime.mutableStateOf
   import androidx.lifecycle.ViewModel
   import com.jetbrains.spacetutorial.entity.RocketLaunch
    
   class RocketLaunchViewModel(private val sdk: SpaceXSDK) : ViewModel() {
       private val _state = mutableStateOf(RocketLaunchScreenState())
       val state: State<RocketLaunchScreenState> = _state
    
   }
    
   data class RocketLaunchScreenState(
       val isLoading: Boolean = false,
       val launches: `List<RocketLaunch>` = emptyList()
   )
   ```

   `RocketLaunchScreenState` インスタンスは、SDKから受信したデータとリクエストの現在の状態を保存します。

2. このビューモデルのコルーチンスコープでSDKの `getLaunches` 関数を呼び出す `loadLaunches` 関数を追加します。

   ```kotlin
   import androidx.lifecycle.viewModelScope
   import kotlinx.coroutines.launch
   
   class RocketLaunchViewModel(private val sdk: SpaceXSDK) : ViewModel() {
       //...
       
       fun loadLaunches() {
           viewModelScope.launch { 
               _state.value = _state.value.copy(isLoading = true, launches = emptyList())
               try {
                   val launches = sdk.getLaunches(forceReload = true)
                   _state.value = _state.value.copy(isLoading = false, launches = launches)
               } catch (e: Exception) {
                   _state.value = _state.value.copy(isLoading = false, launches = emptyList())
               }
           }
       }
   }
   ```

3. 次に、`RocketLaunchViewModel` オブジェクトが作成されたらすぐにAPIにデータを要求するために、クラスの `init {}` ブロックに `loadLaunches()` の呼び出しを追加します。

    ```kotlin
    class RocketLaunchViewModel(private val sdk: SpaceXSDK) : ViewModel() {
        // ...

        init {
            loadLaunches()
        }
    }
    ```

4. 次に、`AppModule.kt` ファイルで、Koinモジュールにビューモデルを指定します。

    ```kotlin
    import org.koin.core.module.dsl.viewModel
    
    val appModule = module {
        // ...
        viewModel { RocketLaunchViewModel(sdk = get()) }
    }
    ```

### Materialテーマの構築

Materialテーマによって提供される `AppTheme` 関数の周りに、メインの `App()` コンポーザブルを構築します。

1. [Material Theme Builder](https://m3.material.io/theme-builder#/custom) を使用して、Composeアプリ用のテーマを生成できます。色とフォントを選択し、右下の **Export theme** をクリックします。
2. エクスポート画面で、**Export** ドロップダウンをクリックし、**Jetpack Compose (Theme.kt)** オプションを選択します。
3. アーカイブを解凍し、`theme` フォルダを `composeApp/src/androidMain/kotlin/com/jetbrains/spacetutorial` ディレクトリにコピーします。

   ![themeディレクトリの場所](theme-directory.png){width=299}

4. `theme` パッケージ内の各ファイルで、`package` 行を作成したパッケージを参照するように変更します。

    ```kotlin
    package com.jetbrains.spacetutorial.theme
    ```

5. `Color.kt` ファイルに、成功した打ち上げと失敗した打ち上げに使用する色のための2つの変数を追加します。

    ```kotlin
    val app_theme_successful = Color(0xff4BB543)
    val app_theme_unsuccessful = Color(0xffFC100D)
    ```

### プレゼンテーションロジックの実装

アプリケーションのメインとなる `App()` コンポーザブルを作成し、それを `ComponentActivity` クラスから呼び出します。

1. `com.jetbrains.spacetutorial` パッケージの `theme` ディレクトリの隣にある `App.kt` ファイルを開き、デフォルトの `App()` コンポーザブル関数を置き換えます。

    ```kotlin
    package com.jetbrains.spacetutorial
    
    import androidx.compose.material3.pulltorefresh.rememberPullToRefreshState
    import androidx.compose.runtime.Composable
    import androidx.compose.runtime.getValue
    import androidx.compose.runtime.mutableStateOf
    import androidx.compose.runtime.remember
    import androidx.compose.runtime.rememberCoroutineScope
    import androidx.compose.runtime.setValue
    import org.jetbrains.compose.ui.tooling.preview.Preview
    import org.koin.androidx.compose.koinViewModel
    import androidx.compose.material3.ExperimentalMaterial3Api
    
    @OptIn(
      ExperimentalMaterial3Api::class
    )
    @Composable
    @Preview
    fun App() {
        val viewModel = koinViewModel<RocketLaunchViewModel>()
        val state by remember { viewModel.state }
        val coroutineScope = rememberCoroutineScope()
        var isRefreshing by remember { mutableStateOf(false) }
        val pullToRefreshState = rememberPullToRefreshState()
    }
    ```

   ここでは、[Koin ViewModel API](https://insert-koin.io/docs/%koinVersion%/reference/koin-compose/compose/#viewmodel-for-composable) を使用して、Android Koinモジュールで宣言した `viewModel` を参照しています。

2. 次に、読み込み画面、打ち上げ結果の列、およびプル・トゥ・リフレッシュ・アクションを実装するUIコードを追加します。

    ```kotlin
    package com.jetbrains.spacetutorial
    
    import androidx.compose.foundation.layout.Arrangement
    import androidx.compose.foundation.layout.Column
    import androidx.compose.foundation.layout.Spacer
    import androidx.compose.foundation.layout.fillMaxSize
    import androidx.compose.foundation.layout.height
    import androidx.compose.foundation.layout.padding
    import androidx.compose.foundation.lazy.LazyColumn
    import androidx.compose.foundation.lazy.items
    import androidx.compose.material3.HorizontalDivider
    import androidx.compose.material3.MaterialTheme
    import androidx.compose.material3.Scaffold
    import androidx.compose.material3.Text
    import androidx.compose.material3.TopAppBar
    import androidx.compose.material3.pulltorefresh.PullToRefreshBox
    import androidx.compose.ui.Alignment
    import androidx.compose.ui.Modifier
    import androidx.compose.ui.unit.dp
    import com.jetbrains.spacetutorial.entity.RocketLaunch
    import com.jetbrains.spacetutorial.theme.AppTheme
    import com.jetbrains.spacetutorial.theme.app_theme_successful
    import com.jetbrains.spacetutorial.theme.app_theme_unsuccessful
    import kotlinx.coroutines.launch
    ...
    
    @OptIn(
        ExperimentalMaterial3Api::class
    )
    @Composable
    @Preview
    fun App() {
        val viewModel = koinViewModel<RocketLaunchViewModel>()
        val state by remember { viewModel.state }
        val coroutineScope = rememberCoroutineScope()
        var isRefreshing by remember { mutableStateOf(false) }
        val pullToRefreshState = rememberPullToRefreshState()
    
        AppTheme {
            Scaffold(
                topBar = {
                    TopAppBar(
                        title = {
                            Text(
                                "SpaceX Launches",
                                style = MaterialTheme.typography.headlineLarge
                            )
                        }
                    )
                }
            ) { padding ->
                PullToRefreshBox(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding),
                    state = pullToRefreshState,
                    isRefreshing = isRefreshing,
                    onRefresh = {
                        isRefreshing = true
                        coroutineScope.launch {
                            viewModel.loadLaunches()
                            isRefreshing = false
                        }
                    }
                ) {
                    if (state.isLoading && !isRefreshing) {
                        Column(
                            verticalArrangement = Arrangement.Center,
                            horizontalAlignment = Alignment.CenterHorizontally,
                            modifier = Modifier.fillMaxSize()
                        ) {
                            Text("Loading...", style = MaterialTheme.typography.bodyLarge)
                        }
                    } else {
                        LazyColumn {
                            items(state.launches) { launch: RocketLaunch ->
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Text(
                                        text = "${launch.missionName} - ${launch.launchYear}",
                                        style = MaterialTheme.typography.headlineSmall
                                    )
                                    Spacer(Modifier.height(8.dp))
                                    Text(
                                        text = if (launch.launchSuccess == true) "Successful" else "Unsuccessful",
                                        color = if (launch.launchSuccess == true) app_theme_successful else app_theme_unsuccessful
                                    )
                                    Spacer(Modifier.height(8.dp))
                                    val details = launch.details
                                    if (details != null && details.isNotBlank()) {
                                        Text(details)
                                    }
                                }
                                HorizontalDivider()
                            }
                        }
                    }
                }
            }
        }
    }
    ```
    {initial-collapse-state="collapsed" collapsible="true" collapsed-title="import com.jetbrains.spacetutorial.theme.AppTheme"}

3. 最後に、`AndroidManifest.xml` ファイルの `<activity>` タグで `MainActivity` クラスを指定します。

    ```xml
    <manifest xmlns:android="http://schemas.android.com/apk/res/android">
        ...
        <application
            ...
            <activity
                ...
                android:name="com.jetbrains.spacetutorial.MainActivity">
                ...
            </activity>
        </application>
    </manifest>
    ```

4. Androidアプリを実行します。実行構成メニューから **composeApp** を選択し、エミュレーターを選択して、実行ボタンをクリックします。
   アプリは自動的にAPIリクエストを実行し、打ち上げリストを表示します（背景色は生成したMaterialテーマによって異なります）。

   ![Androidアプリケーション](android-application.png){width=350}

これで、ビジネスロジックが Kotlin Multiplatform モジュールに実装され、UIがネイティブの Jetpack Compose を使用して作成された Android アプリケーションを作成できました。

## iOSアプリケーションの作成

プロジェクトのiOS部分については、ユーザーインターフェースの構築に [SwiftUI](https://developer.apple.com/xcode/swiftui/) を使用し、[Model View View-Model](https://en.wikipedia.org/wiki/Model–view–viewmodel) パターンを利用します。

IntelliJ IDEAは、共有モジュールにすでに接続されたiOSプロジェクトを生成します。Kotlinモジュールは `shared/build.gradle.kts` ファイルで指定された名前（`baseName = "Shared"`）でエクスポートされ、通常の `import` ステートメント `import Shared` を使用してインポートされます。

### SQLDelight用の動的リンクフラグの追加

デフォルトでは、IntelliJ IDEAはiOSフレームワークの静的リンク用に設定されたプロジェクトを生成します。

iOSでネイティブのSQLDelightドライバーを使用するには、Xcodeツールがシステム提供のSQLiteバイナリを見つけられるようにするための動的リンカーフラグを追加します。

1. IntelliJ IDEAで、**File** | **Open Project in Xcode** オプションを選択してプロジェクトをXcodeで開きます。
2. Xcodeで、プロジェクト名をダブルクリックしてその設定を開きます。
3. **Build Settings** タブに切り替え、**All** リストに切り替えて、**Other Linker Flags** フィールドを検索します。
4. フィールドを展開し、**Debug** フィールドの隣にあるプラス記号を押し、`-lsqlite3` 文字列を **Any Architecture | Any SDK** に貼り付けます。
5. **Other Linker Flags** | **Release** フィールドについても同様の手順を繰り返します。

![Xcodeプロジェクトにリンカーフラグを正しく追加した結果](xcode-other-linker-flags.png){width="434"}

### iOS依存性の注入用のKoinクラスの準備

SwiftコードでKoinのクラスや関数を使用するために、特別な `KoinComponent` クラスを作成し、iOS用のKoinモジュールを宣言します。

1. `shared/src/iosMain/kotlin/` ソースセットに、`com/jetbrains/spacetutorial/KoinHelper.kt` という名前のファイルを作成します（`cache` フォルダの隣に表示されます）。
2. `SpaceXSDK` クラスを遅延Koin注入でラップする `KoinHelper` クラスを追加します。

    ```kotlin
    package com.jetbrains.spacetutorial
   
    import org.koin.core.component.KoinComponent
    import com.jetbrains.spacetutorial.entity.RocketLaunch
    import org.koin.core.component.inject

    class KoinHelper : KoinComponent {
        private val sdk: SpaceXSDK by inject<SpaceXSDK>()

        suspend fun getLaunches(forceReload: Boolean): `List<RocketLaunch>` {
            return sdk.getLaunches(forceReload = forceReload)
        }
    }
    ```

3. `KoinHelper` クラスの下に `initKoin()` 関数を追加します。これは、iOS Koinモジュールを初期化して開始するためにSwiftで使用します。

    ```kotlin
    import com.jetbrains.spacetutorial.cache.IOSDatabaseDriverFactory
    import com.jetbrains.spacetutorial.network.SpaceXApi
    import org.koin.core.context.startKoin
    import org.koin.dsl.module
    
    fun initKoin() {
        startKoin {
            modules(module {
                single<SpaceXApi> { SpaceXApi() }
                single<SpaceXSDK> {
                    SpaceXSDK(
                        databaseDriverFactory = IOSDatabaseDriverFactory(), api = get()
                    )
                }
            })
        }
    }
    ```

これで、共通の `SpaceXSDK` クラスでネイティブデータベースドライバーを使用するために、iOSアプリでKoinモジュールを開始できるようになりました。

### UIの実装

まず、リストのアイテムを表示するための `RocketLaunchRow` SwiftUIビューを作成します。これは `HStack` と `VStack` ビューに基づいています。`RocketLaunchRow` 構造体には、データを表示するための便利なヘルパーを持つ拡張機能を追加します。

1. IntelliJ IDEAで、**Project** ビューにいることを確認します。
2. `iosApp` フォルダ内の `ContentView.swift` の隣に、`RocketLaunchRow` という名前で新しいSwiftファイルを作成します。
3. `RocketLaunchRow.swift` ファイルを以下のコードで更新します。

    ```Swift
    import SwiftUI
    import Shared
    
    struct RocketLaunchRow: View {
        var rocketLaunch: RocketLaunch
    
        var body: some View {
            HStack() {
                VStack(alignment: .leading, spacing: 10.0) {
                    Text("\(rocketLaunch.missionName) - \(String(rocketLaunch.launchYear))").font(.system(size: 18)).bold()
                    Text(launchText).foregroundColor(launchColor)
                    Text("Launch year: \(String(rocketLaunch.launchYear))")
                    Text("\(rocketLaunch.details ?? "")")
                }
                Spacer()
            }
        }
    }
    
    extension RocketLaunchRow {
        private var launchText: String {
            if let isSuccess = rocketLaunch.launchSuccess {
                return isSuccess.boolValue ? "Successful" : "Unsuccessful"
            } else {
                return "No data"
            }
        }
    
        private var launchColor: Color {
            if let isSuccess = rocketLaunch.launchSuccess {
                return isSuccess.boolValue ? Color.green : Color.red
            } else {
                return Color.gray
            }
        }
    }
    ```

   打ち上げのリストは、プロジェクトにすでに含まれている `ContentView` ビューに表示されます。

4. データを準備して管理する `ViewModel` クラスを持つ `ContentView` クラスの拡張機能を作成します。`ContentView.swift` ファイルに以下のコードを追加します。

    ```Swift
    extension ContentView {
        enum LoadableLaunches {
            case loading
            case result([RocketLaunch])
            case error(String)
        }
        
        @MainActor
        class ViewModel: ObservableObject {
            @Published var launches = LoadableLaunches.loading
        }
    }
    ```

    ビューモデル（`ContentView.ViewModel`）は、[Combineフレームワーク](https://developer.apple.com/documentation/combine) を介してビュー（`ContentView`）と接続します。
    *   `ContentView.ViewModel` クラスは `ObservableObject` として宣言されます。
    *   `launches` プロパティには `@Published` 属性が使用されているため、このプロパティが変更されるたびにビューモデルはシグナルを発行します。

5. `ContentView_Previews` 構造体を削除します。ビューモデルと互換性のあるプレビューを実装する必要はありません。

6. `ContentView` クラスの本体を更新して打ち上げリストを表示し、リロード機能を追加します。

   *   これはUIの下準備です。`loadLaunches` 関数はチュートリアルの次の段階で実装します。
   *   `viewModel` プロパティには、ビューモデルを購読するために `@ObservedObject` 属性が付けられています。

   ```swift
   struct ContentView: View {
       @ObservedObject private(set) var viewModel: ViewModel
   
       var body: some View {
           NavigationView {
               listView()
               .navigationBarTitle("SpaceX Launches")
               .navigationBarItems(trailing:
                   Button("Reload") {
                       self.viewModel.loadLaunches(forceReload: true)
               })
           }
       }
   
       private func listView() -> AnyView {
           switch viewModel.launches {
           case .loading:
               return AnyView(Text("Loading...").multilineTextAlignment(.center))
           case .result(let launches):
               return AnyView(List(launches) { launch in
                   RocketLaunchRow(rocketLaunch: launch)
               })
           case .error(let description):
               return AnyView(Text(description).multilineTextAlignment(.center))
           }
       }
   }
   ```

7. `RocketLaunch` クラスは `List` ビューを初期化するためのパラメータとして使用されるため、[Identifiableプロトコルに適合](https://developer.apple.com/documentation/swift/identifiable) する必要があります。
   このクラスにはすでに `id` という名前のプロパティがあるため、`ContentView.swift` の下部に拡張機能を追加するだけで済みます。

    ```Swift
    extension RocketLaunch: Identifiable { }
    ```

### データのロード

ビューモデルでロケット打ち上げに関するデータを取得するには、マルチプラットフォームライブラリの `KoinHelper` クラスのインスタンスが必要です。
これにより、正しいデータベースドライバーを使用してSDK関数を呼び出すことができます。

1. `ContentView.swift` ファイルで、`ViewModel` クラスを拡張して `KoinHelper` オブジェクトと `loadLaunches` 関数を含めます。

   ```Swift
   extension ContentView {
       // ...
       @MainActor
       class ViewModel: ObservableObject {
           // ...
           let helper: KoinHelper = KoinHelper()
   
           init() {
               self.loadLaunches(forceReload: false)
           }
    
           func loadLaunches(forceReload: Bool) {
               // TODO: データを取得する
           }
       }
   }
   ```

2. `KoinHelper.getLaunches()` 関数（`SpaceXSDK` クラスへの呼び出しを中継します）を呼び出し、その結果を `launches` プロパティに保存します。

    ```Swift
    func loadLaunches(forceReload: Bool) {
        Task {
            do {
                self.launches = .loading
                let launches = try await helper.getLaunches(forceReload: forceReload)
                self.launches = .result(launches)
            } catch {
                self.launches = .error(error.localizedDescription)
            }
        }
    }
    ```

    KotlinモジュールをAppleフレームワークにコンパイルすると、[サスペンド関数](https://kotlinlang.org/docs/whatsnew14.html#support-for-kotlin-s-suspending-functions-in-swift-and-objective-c) は Swift の `async`/`await` メカニズムを使用して呼び出すことができます。
   
    `getLaunches` 関数は Kotlin で `@Throws(Exception::class)` アノテーションが付けられているため、`Exception` クラスまたはそのサブクラスのインスタンスである例外は `NSError` として Swift に伝播されます。
     したがって、そのようなすべての例外は `loadLaunches()` 関数でキャッチできます。

3. アプリのエントリーポイントである `iOSApp.swift` ファイルに移動し、Koinモジュール、ビュー、およびビューモデルを初期化します。

    ```Swift
    import SwiftUI
    import Shared
    
    @main
    struct iOSApp: App {
        init() {
            KoinHelperKt.doInitKoin()
        }
        
        var body: some Scene {
            WindowGroup {
                ContentView(viewModel: .init())
            }
        }
    }
    ```

4. IntelliJ IDEAで、**iosApp** 構成に切り替え、エミュレーターを選択して実行し、結果を確認します。

![iOSアプリケーション](ios-application.png){width=350}

> プロジェクトの最終バージョンは [final ブランチ](https://github.com/kotlin-hands-on/kmm-networking-and-data-storage/tree/final) で見つけることができます。
>
{style="note"}

## 次のステップ

このチュートリアルでは、JSONの解析やメインスレッドでのデータベースへのリクエストなど、リソース負荷の高い操作が含まれています。並行コードの記述方法やアプリの最適化について学ぶには、[コルーチンガイド](https://kotlinlang.org/docs/coroutines-guide.html) を参照してください。

また、以下の追加学習資料も確認してください。

*   [マルチプラットフォームプロジェクトでのKtor HTTPクライアントの使用](https://ktor.io/docs/http-client-engines.html#mpp-config)
*   [Koinと依存性の注入について読む](https://insert-koin.io/docs/setup/why)
*   [AndroidアプリケーションをiOSで動作させる](multiplatform-integrate-in-existing-app.md)
*   [マルチプラットフォームプロジェクトの構造について詳しく学ぶ](multiplatform-discover-project.md)