[//]: # (title: Ktor と SQLDelight を使用してマルチプラットフォームアプリを作成する)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

<tldr>
<p>このチュートリアルでは IntelliJ IDEA を使用しますが、Android Studio でも同様に進めることができます。両方の IDE は同じコア機能と Kotlin Multiplatform サポートを共有しています。</p>
</tldr>

このチュートリアルでは、IntelliJ IDEA を使用して Kotlin Multiplatform による高度な iOS および Android 向けモバイルアプリケーションを作成する方法を説明します。
このアプリケーションは次の処理を行います。

* [Ktor](https://ktor.io/docs/create-client.html) と [`kotlinx.serialization`](https://kotlinlang.org/docs/serialization.html) を使用して、公開されている [Launch Library](https://lldev.thespacedevs.com/docs) からインターネット経由でデータを取得する。
* [SQLDelight](https://github.com/cashapp/sqldelight) を使用してローカルデータベースにデータを保存する。
* 宇宙ロケットの打ち上げリストを、打ち上げ日、結果、および打ち上げの詳細な説明とともに表示する。
* [Koin](https://insert-koin.io/) を使用してプラットフォーム固有のデータベースドライバーを提供する。

このアプリケーションには、iOS と Android の両方のプラットフォーム用の共有コードを持つモジュールが含まれます。ビジネスロジックとデータアクセス層は共有モジュール内で一度だけ実装され、両方のアプリケーションの UI はネイティブになります。

![Emulator and Simulator](android-and-ios.png){width=600}

> [テンプレートプロジェクト](https://github.com/kotlin-hands-on/kmm-networking-and-data-storage)および[完成版アプリケーション](https://github.com/kotlin-hands-on/kmm-networking-and-data-storage/tree/final)のソースコードは、GitHub リポジトリで確認できます。
>
{style="note"}

## プロジェクトを作成する {id="create-a-project"}

1. [クイックスタート](quickstart.md)にある手順に従い、[Kotlin Multiplatform 開発用の環境をセットアップ](quickstart.md#set-up-the-environment)してください。
2. IntelliJ IDEA で、**File** | **New** | **Project** を選択します。
3. 左側のパネルで **Kotlin Multiplatform** を選択します（Android Studio の場合、このテンプレートは **New Project** ウィザードの **Generic** タブにあります）。
4. **New Project** ウィンドウで以下のフィールドを指定します。

   * **Name**: SpaceTutorial
   * **Project ID**: com.jetbrains.spacetutorial

5. **Android** および **iOS** ターゲットを選択します。
6. iOS については、**Do not share UI** オプションを選択します。両プラットフォームでネイティブ UI を実装します。
7. すべてのフィールドとターゲットを指定したら、**Create** をクリックします。

   ![Create Ktor and SQLDelight Multiplatform project](create-ktor-sqldelight-multiplatform-project.png){width=800}

## Gradle の依存関係を追加する {id="add-gradle-dependencies"}

共有モジュールにマルチプラットフォームライブラリを追加するには、モジュールの `build.gradle.kts` ファイル内の関連するソースセットの `dependencies {}` ブロックに依存関係の指示（`implementation`）を追加します。

`kotlinx.serialization` および SQLDelight ライブラリには、追加の設定も必要です。

必要なすべての依存関係を反映するために、`gradle/libs.versions.toml` ファイルのバージョンカタログ内の行を変更または追加します。

1. `[versions]` ブロックで、AGP のバージョンを確認し、残りを追加します。

   ```toml
   [versions]
   agp = "9.0.1"
   material3 = "1.11.0-alpha07"
   # ...
   coroutinesVersion = "%coroutinesVersion%"
   dateTimeVersion = "%dateTimeVersion%"
   koin = "%koinVersion%"
   ktor = "%ktorVersion%"
   sqlDelight = "%sqlDelightVersion%"
   ```
   {initial-collapse-state="collapsed" collapsible="true" collapsed-title="[versions]"}

2. `[libraries]` ブロックに、次のライブラリ参照を追加します。

   ```
   [libraries]
   ...
   koin-core = { module = "io.insert-koin:koin-core", version.ref = "koin" }
   koin-androidx-compose = { module = "io.insert-koin:koin-androidx-compose", version.ref = "koin" }
   kotlinx-coroutines-core = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-core", version.ref = "coroutinesVersion" }
   kotlinx-datetime = { module = "org.jetbrains.kotlinx:kotlinx-datetime", version.ref = "dateTimeVersion" }
   ktor-client-android = { module = "io.ktor:ktor-client-android", version.ref = "ktor" }
   ktor-client-content-negotiation = { module = "io.ktor:ktor-client-content-negotiation", version.ref = "ktor" }
   ktor-client-core = { module = "io.ktor:ktor-client-core", version.ref = "ktor" }
   ktor-client-darwin = { module = "io.ktor:ktor-client-darwin", version.ref = "ktor" }
   ktor-serialization-kotlinx-json = { module = "io.ktor:ktor-serialization-kotlinx-json", version.ref = "ktor" }
   sqldelight-android-driver = { module = "app.cash.sqldelight:android-driver", version.ref = "sqlDelight" }
   sqldelight-native-driver = { module = "app.cash.sqldelight:native-driver", version.ref = "sqlDelight" }
   sqldelight-runtime = { module = "app.cash.sqldelight:runtime", version.ref = "sqlDelight" }
   ```
   {initial-collapse-state="collapsed" collapsible="true" collapsed-title="[libraries]"}

3. `[plugins]` ブロックで、必要な Gradle プラグインを指定します。

   ```toml
   [plugins]
   # ...
   kotlinxSerialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
   sqldelight = { id = "app.cash.sqldelight", version.ref = "sqlDelight" }
   ```

4. バージョンカタログを更新すると、プロジェクトの再同期を促すメッセージが表示されます。
   **Sync Gradle Changes** ボタンをクリックして Gradle ファイルを同期します: ![Synchronize Gradle files](gradle-sync.png){width=50}

5. `sharedLogic/build.gradle.kts` ファイルの先頭にある `plugins {}` ブロックに、次の行を追加します。

   ```kotlin
   plugins {
       // ...
       alias(libs.plugins.kotlinxSerialization)
       alias(libs.plugins.sqldelight)
   }
   ```

6. common ソースセットには各ライブラリのコアアーティファクトと、`kotlinx.serialization` を使用するための Ktor [シリアライゼーション機能](https://ktor.io/docs/serialization-client.html)が必要です。
    iOS および Android ソースセットには、SQLDelight と Ktor のプラットフォームドライバーも必要です。

    同じ `sharedLogic/build.gradle.kts` ファイルで、必要なすべての依存関係を追加します。

    ```kotlin
    kotlin {
        // ...
    
        sourceSets {
            commonMain.dependencies {
                implementation(libs.kotlinx.coroutines.core)
                implementation(libs.ktor.client.core)
                implementation(libs.ktor.client.content.negotiation)
                implementation(libs.ktor.serialization.kotlinx.json)
                implementation(libs.sqldelight.runtime)
                implementation(libs.kotlinx.datetime)
                implementation(libs.koin.core)
            }
            androidMain.dependencies {
                implementation(libs.ktor.client.android)
                implementation(libs.sqldelight.android.driver)
            }
            iosMain.dependencies {
                implementation(libs.ktor.client.darwin)
                implementation(libs.sqldelight.native.driver)
            }
        }
    }
    ```

7. 依存関係を指定したら、もう一度 **Sync Gradle Changes** ボタンをクリックして Gradle ファイルを更新します。

Gradle の同期が完了すると、プロジェクトの設定は完了し、コードの記述を開始できます。

> マルチプラットフォームの依存関係に関する詳細なガイドについては、[Kotlin Multiplatform ライブラリへの依存関係](multiplatform-add-dependencies.md)を参照してください。
>
{style="tip"}

## アプリケーションのデータモデルを作成する {id="create-an-application-data-model"}

このチュートリアルのアプリには、ネットワークおよびキャッシュサービスに対するファサードとしてパブリックな `SpaceSDK` クラスが含まれます。
アプリケーションのデータモデルには、以下を持つ3つのエンティティクラスが含まれます。

* 打ち上げに関する一般的な情報
* ミッションパッチ（記章）の画像へのリンク
* 打ち上げに関連する記事の URL

> このチュートリアルの終わりまでに、これらすべてのデータが UI に表示されるわけではありません。
> データモデルはシリアライゼーションの実演のために使用しています。
> リンクやパッチを使って自由に拡張し、より情報豊富なアプリに仕上げてみてください！
>
{style="note"}

必要なデータクラスを作成します。

1. `sharedLogic/src/commonMain/kotlin/com/jetbrains/spacetutorial` ディレクトリに `entity` パッケージを作成し、そのパッケージ内に `Entity.kt` ファイルを作成します。
2. 基本的なエンティティのすべてのデータクラスを宣言します。

   ```kotlin
   
   ```

シリアライズ可能な各クラスには `@Serializable` アノテーションを付ける必要があります。アノテーション引数でシリアライザーへのリンクを明示的に渡さない限り、`kotlinx.serialization` プラグインは `@Serializable` クラスのデフォルトシリアライザーを自動的に生成します。

`@SerialName` アノテーションを使用するとフィールド名を再定義でき、より読みやすい識別子を使用してデータクラスのプロパティにアクセスするのに役立ちます。

## SQLDelight の設定とキャッシュロジックの実装 {id="configure-sqldelight-and-implement-cache-logic"}

SQLDelight ライブラリを使用すると、SQL クエリから型安全な Kotlin データベース API を生成できます。コンパイル中にジェネレーターが SQL クエリを検証し、共有モジュールで使用できる Kotlin コードに変換します。

### SQLDelight を設定する {id="configure-sqldelight"}

SQLDelight の依存関係はすでにプロジェクトに含まれています。
ライブラリを設定するには、`sharedLogic/build.gradle.kts` ファイルを開き、末尾に `sqldelight {}` ブロックを追加します。
このブロックには、データベースとそのパラメーターのリストが含まれます。

```kotlin
sqldelight {
    databases {
        create("AppDatabase") {
            packageName.set("com.jetbrains.spacetutorial.cache")
        }
    }
}
```

`packageName` パラメーターは、生成される Kotlin ソースのパッケージ名を保持します。

プロンプトが表示されたら Gradle プロジェクトファイルを同期するか、<shortcut>Shift</shortcut> を2回押して **Sync All Gradle, Swift Package Manager projects** アクションを検索して実行します。

> `.sq` ファイルを扱うために、公式の [SQLDelight プラグイン](https://plugins.jetbrains.com/plugin/8191-sqldelight)のインストールを検討してください。
>
{style="tip"}

### データベース API を生成する {id="generate-the-database-api"}

まず、必要なすべての SQL クエリを含む `.sq` ファイルを作成します。デフォルトでは、SQLDelight プラグインはソースセットの `sqldelight` フォルダー内にある `.sq` ファイルを探します。

1. `sharedLogic/src/commonMain` ディレクトリに、新しい `sqldelight` ディレクトリを作成します。
2. `sqldelight` ディレクトリ内に、パッケージ用のネストされたディレクトリとして `com/jetbrains/spacetutorial/cache` という名前の新しいディレクトリを作成します。
3. `cache` ディレクトリ内に、`AppDatabase.sq` ファイルを作成します（`build.gradle.kts` ファイルで指定したデータベースと同じ名前にします）。
   アプリケーションのすべての SQL クエリはこのファイルに保存されます。
4. データベースには、打ち上げに関するデータを含むテーブルが含まれます。
   `AppDatabase.sq` ファイルに次のコードを追加してテーブルを作成し、後で使用するいくつかの関数を定義します。

   ```sql
   import kotlin.Boolean;
   
   CREATE TABLE Launch (
       flightNumber TEXT NOT NULL,
       missionName TEXT NOT NULL,
       launchDateUTC TEXT NOT NULL,
       imageSmall TEXT NOT NULL,
       imageLarge TEXT NOT NULL,
       statusId INTEGER NOT NULL,
       statusName TEXT NOT NULL,
       statusDescription TEXT NOT NULL
   );
   
   insertLaunch:
   INSERT INTO Launch(flightNumber, missionName, launchDateUTC, imageSmall, imageLarge, statusId, statusName, statusDescription)
   VALUES(?, ?, ?, ?, ?, ?, ?, ?);
   
   removeAllLaunches:
   DELETE FROM Launch;
   
   selectAllLaunchesInfo:
   SELECT Launch.*
   FROM Launch;
   ```

5. 対応する `AppDatabase` インターフェース（後でデータベースドライバーで初期化します）を生成します。
   そのためには、プロジェクトのルートにあるターミナルで次のコマンドを実行します。

   ```shell
   ./gradlew generateCommonMainAppDatabaseInterface
   ```

   生成された Kotlin コードは `sharedLogic/build/generated/sqldelight` ディレクトリに保存されます。

### プラットフォーム固有のデータベースドライバーファクトリを作成する {id="create-factories-for-platform-specific-database-drivers"}

`AppDatabase` インターフェースを初期化するには、それに `SqlDriver` インスタンスを渡します。
SQLDelight は SQLite ドライバーの複数のプラットフォーム固有の実装を提供しているため、各プラットフォームごとにこれらのインスタンスを個別に作成する必要があります。

これは [expect/actual インターフェース](multiplatform-expect-actual.md)でも実現できますが、このプロジェクトでは Kotlin Multiplatform での依存関係注入を試すために [Koin](https://insert-koin.io/) を使用します。

1. データベースドライバー用のインターフェースを作成します。これを行うには、`sharedLogic/src/commonMain/kotlin/com/jetbrains/spacetutorial/` ディレクトリに `cache` パッケージを作成します。
2. `cache` パッケージ内に `DatabaseDriverFactory` インターフェースを作成します。

   ```kotlin
   package com.jetbrains.spacetutorial.cache
   
   import app.cash.sqldelight.db.SqlDriver

   interface DatabaseDriverFactory {
       fun createDriver(): SqlDriver
   }
   ```

3. Android 用にこのインターフェースを実装するクラスを作成します。`sharedLogic/src/androidMain/kotlin` ディレクトリに `com.jetbrains.spacetutorial.cache` パッケージを作成し、その中に `AndroidDatabaseDriverFactory.kt` ファイルを作成します。
4. Android では、SQLite ドライバーは `AndroidSqliteDriver` クラスによって実装されます。`DatabaseDriverFactory.kt` ファイルで、データベース情報とコンテキストリンクを `AndroidSqliteDriver` クラスのコンストラクタに渡します。

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

5. iOS の場合は、`shared/src/iosMain/kotlin/com/jetbrains/spacetutorial/` ディレクトリに `cache` パッケージを作成します。
6. `cache` パッケージ内に `DatabaseDriverFactory.kt` ファイルを作成し、次のコードを追加します。

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

これらのファクトリは、後でプロジェクトのプラットフォーム固有の部分で使用します。

### キャッシュを実装する {id="implement-cache"}

ここまでの手順で、プラットフォームのデータベースドライバー用のファクトリと、データベース操作を実行するための `AppDatabase` インターフェースを追加しました。
次に、`AppDatabase` インターフェースをラップし、キャッシュロジックを含む `Database` クラスを作成します。

1. common ソースセット `sharedLogic/src/commonMain/kotlin` 内の `com.jetbrains.spacetutorial.cache` パッケージに、新しい `Database` クラスを作成します。これには両方のプラットフォームに共通のロジックが含まれます。

2. `AppDatabase` にドライバーを提供するために、抽象 `DatabaseDriverFactory` インスタンスを `Database` クラスのコンストラクタに渡します。

   ```kotlin
   package com.jetbrains.spacetutorial.cache

   internal class Database(databaseDriverFactory: DatabaseDriverFactory) {
       private val database = AppDatabase(databaseDriverFactory.createDriver())
       private val dbQuery = database.appDatabaseQueries
   }
   ```

   このクラスの[可視性](https://kotlinlang.org/docs/visibility-modifiers.html#class-members)は internal に設定されており、マルチプラットフォームモジュール内からのみアクセス可能であることを意味します。

3. `Database` クラス内に、いくつかのデータ処理操作を実装します。
   まず、すべてのロケット打ち上げのリストを返す `getAllLaunches()` 関数を作成します。
   `mapLaunchSelecting()` 関数は、データベースクエリの結果を `RocketLaunch` オブジェクトにマッピングするために使用されます。

    ```kotlin
    import com.jetbrains.spacetutorial.entity.Image
    import com.jetbrains.spacetutorial.entity.LaunchStatus
    import com.jetbrains.spacetutorial.entity.RocketLaunch
    
    internal class Database(databaseDriverFactory: DatabaseDriverFactory) {
        private val database = AppDatabase(databaseDriverFactory.createDriver())
        private val dbQuery = database.appDatabaseQueries
    
        internal fun getAllLaunches(): List<RocketLaunch> {
            return dbQuery.selectAllLaunchesInfo(::mapLaunchSelecting).executeAsList()
        }
    
        private fun mapLaunchSelecting(
            flightNumber: String,
            missionName: String,
            launchDateUTC: String,
            imageSmall: String,
            imageLarge: String,
            statusId: Long,
            statusName: String,
            statusDescription: String
        ): RocketLaunch {
            return RocketLaunch(
                id = flightNumber,
                missionName = missionName,
                launchDateUTC = launchDateUTC,
                image = Image(
                    small = imageSmall,
                    large = imageLarge
                ),
                status = LaunchStatus(
                    id = statusId.toInt(),
                    name = statusName,
                    description = statusDescription
                )
            )
        }
    }
    ```
    {initial-collapse-state="collapsed" collapsible="true" collapsed-title="internal fun getAllLaunches()"}

4. データベースをクリアして新しいデータを挿入するための `clearAndCreateLaunches()` 関数を追加します。

    ```kotlin
    internal class Database(databaseDriverFactory: DatabaseDriverFactory) {
        // ...
    
        internal fun clearAndCreateLaunches(launches: List<RocketLaunch>) {
            dbQuery.transaction {
                dbQuery.removeAllLaunches()
                launches.forEach { launch ->
                    dbQuery.insertLaunch(
                        flightNumber = launch.id,
                        missionName = launch.missionName,
                        launchDateUTC = launch.launchDateUTC,
                        imageSmall = launch.image.small,
                        imageLarge = launch.image.large,
                        statusId = launch.status.id.toLong(),
                        statusName = launch.status.name,
                        statusDescription = launch.status.description,
                    )
                }
            }
        }
    }
    ```

## API サービスを実装する {id="implement-the-api-service"}

インターネット経由でデータを取得するには、[Launch Library のパブリック API](https://lldev.thespacedevs.com/docs) と、`/2.3.0/launches` エンドポイントからすべての打ち上げリストを取得する単一のメソッドを使用します。

アプリケーションを API に接続するクラスを作成します。

1. `sharedLogic/src/commonMain/kotlin/com/jetbrains/spacetutorial/` ディレクトリに `network` パッケージを作成します。
2. `network` ディレクトリ内に `SpaceApi` クラスを作成します。

    ```kotlin
    package com.jetbrains.spacetutorial.network
    
    import io.ktor.client.HttpClient
    import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
    import io.ktor.serialization.kotlinx.json.json
    import kotlinx.serialization.json.Json
    
    class SpaceApi {
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

    このクラスはネットワークリクエストを実行し、JSON レスポンスを `com.jetbrains.spacetutorial.entity` パッケージのエンティティにデシリアライズします。
    Ktor の `HttpClient` インスタンスは `httpClient` プロパティを初期化して保持します。

    このコードでは、`GET` リクエストの結果をデシリアライズするために [`ContentNegotiation`](https://ktor.io/docs/serialization-client.html) Ktor プラグインを使用しています。このプラグインはリクエストとレスポンスのペイロードを JSON として処理し、必要に応じてシリアライズおよびデシリアライズします。

3. ロケット打ち上げのリストを返すデータ取得関数を宣言します。

    ```kotlin
    import com.jetbrains.spacetutorial.entity.RocketLaunch
    import com.jetbrains.spacetutorial.entity.LaunchListResponse
    import io.ktor.client.request.get
    import io.ktor.client.call.body
    
    class SpaceApi {
        // ...
        
        suspend fun getAllLaunches(): List<RocketLaunch> {
            return (httpClient.get("https://lldev.thespacedevs.com/2.3.0/launches/previous/?mode=list&format=json").body() as LaunchListResponse).results
        }
    }
    ```

`getAllLaunches` 関数には、suspend 関数である `HttpClient.get()` の呼び出しが含まれているため、`suspend` 修飾子が付いています。
`HttpClient.get()` 関数にはインターネット経由でデータを取得する非同期操作が含まれており、コルーチンまたは別の suspend 関数からのみ呼び出すことができます。ネットワークリクエストは HTTP クライアントのスレッドプールで実行されます。

GET リクエストを送信するための URL は、引数として `get()` 関数に渡されます。

## SDK を構築する {id="build-an-sdk"}

iOS および Android アプリケーションは、パブリッククラス `SpaceSDK` を提供する共有モジュールを介して Space API と通信します。

1. common ソースセット `sharedLogic/src/commonMain/kotlin` の `com.jetbrains.spacetutorial` パッケージに、`SpaceSDK` クラスを作成します。
   このクラスは、`Database` および `SpaceApi` クラスのファサードになります。

   `Database` クラスのインスタンスを作成するには、`DatabaseDriverFactory` インスタンスを提供します。

   ```kotlin
   package com.jetbrains.spacetutorial
   
   import com.jetbrains.spacetutorial.cache.Database
   import com.jetbrains.spacetutorial.cache.DatabaseDriverFactory
   import com.jetbrains.spacetutorial.network.SpaceApi

   class SpaceSDK(databaseDriverFactory: DatabaseDriverFactory, val api: SpaceApi) { 
       private val database = Database(databaseDriverFactory)
   }
   ```

   適切なデータベースドライバーは、`SpaceSDK` クラスのコンストラクタを介してプラットフォーム固有のコードから注入されます。

2. 作成したデータベースと API を使用して打ち上げリストを要求および保存する `getLaunches` 関数を追加します。

    ```kotlin
    import com.jetbrains.spacetutorial.entity.RocketLaunch
    
    class SpaceSDK(databaseDriverFactory: DatabaseDriverFactory, val api: SpaceApi) {
        // ...
   
        @Throws(Exception::class)
        suspend fun getLaunches(forceReload: Boolean): List<RocketLaunch> {
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

このクラスには、すべての打ち上げ情報を取得するための関数が1つ含まれています。`forceReload` の値に応じて、キャッシュされた値を返すか、インターネットからデータを読み込んでその結果でキャッシュを更新します。キャッシュされたデータがない場合は、`forceReload` フラグの値に関係なくインターネットからデータを読み込みます。

SDK のクライアントは、`forceReload` フラグを使用して打ち上げに関する最新情報を読み込み、ユーザー向けにスワイプして更新（pull-to-refresh）ジェスチャーを有効にできます。

すべての Kotlin 例外は非チェック（unchecked）ですが、Swift にはチェックされるエラー（checked error）しかありません（詳細については [Swift/Objective-C との相互運用性](https://kotlinlang.org/docs/native-objc-interop.html#errors-and-exceptions)を参照してください）。したがって、Swift コードに想定される例外を認識させるには、Swift から呼び出される Kotlin 関数に、発生する可能性のある例外クラスのリストを指定した `@Throws` アノテーションを付ける必要があります。

## Android アプリケーションを作成する {id="create-the-android-application"}

IntelliJ IDEA が初期の Gradle 設定を処理するため、`sharedUI` および `sharedLogic` モジュールはすでに Android アプリケーション（`androidApp`）に接続されています。

プロンプトが表示されたら Gradle プロジェクトファイルを同期するか、<shortcut>Shift</shortcut> を2回押して **Sync All Gradle, Swift Package Manager projects** を検索して実行します。

### `androidApp` にインターネットアクセスのパーミッションを追加する {id="add-internet-access-permission-for-androidapp"}

インターネットにアクセスするには、Android アプリケーションに適切な権限（パーミッション）が必要です。
`androidApp/src/main/AndroidManifest.xml` ファイルに `<uses-permission>` タグを追加します。

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <!--...-->
</manifest>
```

### 依存関係注入コードを追加する {id="add-dependency-injection-code"}

Koin の依存関係注入を使用すると、さまざまなコンテキストで使用できるモジュール（コンポーネントのセット）を宣言できます。
このプロジェクトでは、Android アプリケーション用と iOS アプリ用という2つのモジュールを作成します。
その後、対応するモジュールを使用して各ネイティブ UI で Koin を起動します。

Android アプリ用のコンポーネントを含む Koin モジュールを宣言します。

1. `sharedUI/build.gradle.kts` ファイルに、`androidMain` ソースセット用の Koin Android 依存関係を追加します。

   ```kotlin
   kotlin {
       // ...
       sourceSets {
           androidMain.dependencies {
               // ...
               implementation(libs.koin.androidx.compose)
           }
       }
   }
   ```

2. Android 固有の UI コード用に `sharedUI/src/androidMain/kotlin` ディレクトリを作成します。
3. `sharedUI/src/androidMain/kotlin` ディレクトリに `com.jetbrains.spacetutorial` パッケージを作成します。
4. Android UI は共有されないため、`sharedUI` モジュールから `commonMain` および `commonTest` ソースセットを削除します。
5. `sharedUI/src/androidMain/kotlin/com.jetbrains.spacetutorial` パッケージに `AppModule.kt` ファイルを作成します。

   そのファイル内で、`SpaceApi` クラス用と `SpaceSDK` クラス用の2つの[シングルトン](https://insert-koin.io/docs/reference/koin-core/definitions#defining-a-singleton)として Koin モジュールを宣言します。

    ```kotlin
    import com.jetbrains.spacetutorial.cache.AndroidDatabaseDriverFactory
    import com.jetbrains.spacetutorial.network.SpaceApi
    import org.koin.android.ext.koin.androidContext
    import org.koin.dsl.module
    
    val appModule = module {
        single<SpaceApi> { SpaceApi() }
        single<SpaceSDK> {
            SpaceSDK(
                databaseDriverFactory = AndroidDatabaseDriverFactory(androidContext()),
                api = get()
            )
        }
    }
    ```

   `SpaceSDK` クラスのコンストラクタには、プラットフォーム固有の `AndroidDatabaseDriverFactory` クラスが注入されます。
   `get()` 関数はモジュール内の依存関係を解決します。`SpaceSDK()` の `api` パラメーターの位置には、Koin が先ほど宣言された `SpaceApi` シングルトンを渡します。

6. `androidApp/build.gradle.kts` ファイルで、`androidApp` モジュール用の Koin Android 依存関係を追加します。

   ```kotlin
   kotlin {
       // ...
       dependencies {
           // ...
           implementation(libs.koin.androidx.compose)
       }
   }
   ```

7. `androidApp` モジュールの `src/main/kotlin/com/jetbrains/spacetutorial` ディレクトリに、Koin モジュールを起動する `MainApplication` クラスを作成します。

   `AppModule.kt` ファイルで宣言したモジュールを `modules()` 関数に渡します。

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

8. 作成した `MainApplication` クラスを `AndroidManifest.xml` ファイルの `<application>` タグで指定します。

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

これで、プラットフォーム固有のデータベースドライバーから提供される情報を使用する UI を実装する準備が整いました。

### 打ち上げリストを含むビューモデルを準備する {id="prepare-the-view-model-with-the-list-of-launches"}

Jetpack Compose と Material 3 を使用して Android UI を実装します。まず、SDK を使用して打ち上げリストを取得するビューモデルを作成します。次に Material テーマを設定し、最後にすべてを統合するコンポーザブル関数を記述します。

1. `sharedUI/src/androidMain/kotlin` ディレクトリの `com.jetbrains.spacetutorial` パッケージに `RocketLaunchViewModel.kt` ファイルを作成します。

   ```kotlin
   package com.jetbrains.spacetutorial
   
   import androidx.compose.runtime.State
   import androidx.compose.runtime.mutableStateOf
   import androidx.lifecycle.ViewModel
   import com.jetbrains.spacetutorial.entity.RocketLaunch
    
   class RocketLaunchViewModel(private val sdk: SpaceSDK) : ViewModel() {
       private val _state = mutableStateOf(RocketLaunchScreenState())
       val state: State<RocketLaunchScreenState> = _state
    
   }
    
   data class RocketLaunchScreenState(
       val isLoading: Boolean = false,
       val launches: List<RocketLaunch> = emptyList()
   )
   ```

   `RocketLaunchScreenState` インスタンスは、SDK から受信したデータとリクエストの現在の状態を保持します。

2. `RocketLaunchViewModel` クラスに `loadLaunches` 関数を追加します。これは、このビューモデルのコルーチンスコープ内で SDK の `getLaunches` 関数を呼び出します。

   ```kotlin
   import androidx.lifecycle.viewModelScope
   import kotlinx.coroutines.launch
   
   class RocketLaunchViewModel(private val sdk: SpaceSDK) : ViewModel() {
       //...
       
       fun loadLaunches() {
           viewModelScope.launch { 
               _state.value = _state.value.copy(isLoading = true, launches = emptyList())
               try {
                   val launches = sdk.getLaunches(forceReload = true)
                   _state.value = _state.value.copy(isLoading = false, launches = launches)
               } catch (_: Exception) {
                   _state.value = _state.value.copy(isLoading = false, launches = emptyList())
               }
           }
       }
   }
   ```

3. `RocketLaunchViewModel` クラス内に `loadLaunches()` の呼び出しを含む `init {}` ブロックを追加し、`RocketLaunchViewModel` オブジェクトが作成されるとすぐに API にデータを要求するようにします。

    ```kotlin
    class RocketLaunchViewModel(private val sdk: SpaceSDK) : ViewModel() {
        // ...

        init {
            loadLaunches()
        }
    }
    ```

4. 次に、`AppModule.kt` ファイルで、Koin モジュールにビューモデルを指定します。

    ```kotlin
    import org.koin.core.module.dsl.viewModel
    
    val appModule = module {
        // ...
        viewModel { RocketLaunchViewModel(sdk = get()) }
    }
    ```

### Material Theme を構築する {id="build-the-material-theme"}

メインの `App()` コンポーザブルは、Material Theme によって提供される `AppTheme` 関数を中心に構築します。

1. [Material Theme Builder](https://m3.material.io/theme-builder#/custom) を使用して、Compose アプリ用のテーマを生成できます。
   色やフォントを選択し、右下の **Export theme** をクリックします。
2. エクスポート画面で **Export** ドロップダウンをクリックし、**Jetpack Compose (Theme.kt)** オプションを選択します。
3. アーカイブを解凍し、`theme` フォルダーを `sharedUI/src/androidMain/kotlin/com/jetbrains/spacetutorial` ディレクトリにコピーします。

   ![theme directory location](theme-directory.png){width=299}

4. `theme` パッケージ内の各ファイルで、`package` 行を作成したパッケージを参照するように変更します。

    ```kotlin
    package com.jetbrains.spacetutorial.theme
    ```

5. `Color.kt` ファイルに、成功した打ち上げと失敗した打ち上げに使用する色の変数を2つ追加します。

    ```kotlin
    val app_theme_successful = Color(0xff4BB543)
    val app_theme_unsuccessful = Color(0xffFC100D)
    ```

### プレゼンテーションロジックを実装する {id="implement-the-presentation-logic"}

アプリケーション用のメインの `App()` コンポーザブルを作成し、`ComponentActivity` クラスから呼び出します。

1. `sharedUI/src/androidApp/kotlin/com/jetbrains/spacetutorial` ディレクトリに `App.kt` ファイルを作成します。
2. `App.kt` ファイルを開き、次のコードを挿入します。

    ```kotlin
    package com.jetbrains.spacetutorial
    
    import androidx.compose.material3.pulltorefresh.rememberPullToRefreshState
    import androidx.compose.runtime.Composable
    import androidx.compose.runtime.getValue
    import androidx.compose.runtime.mutableStateOf
    import androidx.compose.runtime.remember
    import androidx.compose.runtime.rememberCoroutineScope
    import androidx.compose.runtime.setValue
    import androidx.compose.ui.tooling.preview.Preview
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

   ここでは、[Koin ViewModel API](https://insert-koin.io/docs/reference/koin-compose/compose-viewmodel) を使用して、Android Koin モジュールで宣言した `viewModel` を参照しています。

3. 次に、ローディング画面、打ち上げ結果のカラム、スワイプして更新（pull-to-refresh）アクションを実装する UI コードを追加します。

    ```kotlin
    import androidx.compose.foundation.layout.Arrangement
    import androidx.compose.foundation.layout.Column
    import androidx.compose.foundation.layout.fillMaxSize
    import androidx.compose.foundation.layout.padding
    import androidx.compose.foundation.lazy.LazyColumn
    import androidx.compose.foundation.lazy.items
    import androidx.compose.material3.*
    import androidx.compose.material3.pulltorefresh.PullToRefreshBox
    import androidx.compose.material3.pulltorefresh.rememberPullToRefreshState
    import androidx.compose.runtime.*
    import androidx.compose.ui.Alignment
    import androidx.compose.ui.Modifier
    import androidx.compose.ui.tooling.preview.Preview
    import androidx.compose.ui.unit.dp
    import com.jetbrains.spacetutorial.entity.RocketLaunch
    import com.jetbrains.spacetutorial.theme.AppTheme
    import com.jetbrains.spacetutorial.theme.app_theme_successful
    import com.jetbrains.spacetutorial.theme.app_theme_unsuccessful
    import kotlinx.coroutines.launch
    import org.koin.androidx.compose.koinViewModel
    
    @OptIn(ExperimentalMaterial3Api::class)
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
                                "Space Launches",
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
                                Column(
                                    verticalArrangement = Arrangement.spacedBy(8.dp),
                                    modifier = Modifier.padding(16.dp)
                                ) {
                                    Text(
                                        text = launch.missionName,
                                        style = MaterialTheme.typography.headlineSmall
                                    )
                                    Text(
                                        text = if (launch.status.id == 3) "Successful" else "Unsuccessful",
                                        color = if (launch.status.id == 3) app_theme_successful else app_theme_unsuccessful
                                    )
                                    Text(
                                        text = "Launch year: ${launch.launchYear}"
                                    )
                                    val details = launch.status.description
                                    if (details.isNotBlank()) {
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

4. 最後に、`androidApp/src/main/AndroidManifest.xml` 内で、`<activity>` タグに `MainActivity` クラスを指定します。

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

5. Android アプリを実行します。実行構成メニューから **androidApp** を選択し、エミュレーターを選択して、実行ボタンをクリックします。
   アプリは自動的に API リクエストを実行し、打ち上げのリストを表示します（背景色は生成した Material Theme によって異なります）。

   ![Android application](android-application.png){width=350}

これで、ビジネスロジックが Kotlin Multiplatform モジュールに実装され、UI がネイティブの Jetpack Compose 上で動作する Android アプリケーションが作成できました。

## iOS アプリケーションを作成する {id="create-the-ios-application"}

プロジェクトの iOS 部分では、[SwiftUI](https://developer.apple.com/xcode/swiftui/) を利用してユーザーインターフェースを構築し、[Model View View-Model](https://en.wikipedia.org/wiki/Model–view–viewmodel)（MVVM）パターンを採用します。

IntelliJ IDEA は、共有モジュールにすでに接続されている iOS プロジェクトを生成します。Kotlin モジュールは、`sharedLogic/build.gradle.kts` ファイルで指定された名前（`baseName = "SharedLogic"`）でエクスポートされ、通常の `import` ステートメント（`import SharedLogic`）を使用してインポートされます。

### SQLDelight 用の動的リンクフラグを追加する {id="add-the-dynamic-linking-flag-for-sqldelight"}

デフォルトでは、IntelliJ IDEA は iOS フレームワークの静的リンク用に設定されたプロジェクトを生成します。

iOS でネイティブ SQLDelight ドライバーを使用するには、Xcode ツールがシステム提供の SQLite バイナリを見つけられるようにする動的リンカーフラグを追加します。

1. IntelliJ IDEA で、**File** | **Open Project in Xcode** オプションを選択して、Xcode でプロジェクトを開きます。
2. Xcode でプロジェクト名をクリックして、その設定を開きます。
3. **Build Settings** タブに切り替え、**All** リストに切り替えて、**Other Linker Flags** フィールドを検索します。
4. フィールドを展開し、**Debug** フィールドの横にあるプラス記号を押して、**Any Architecture | Any SDK** に `-lsqlite3` という文字列を貼り付けます。
5. **Other Linker Flags** | **Release** フィールドに対しても同じ手順を繰り返します。

   ![The result of correctly adding the linker flag to the Xcode project](xcode-other-linker-flags.png){width="434"}
6. IntelliJ IDEA に戻ります。

### iOS の依存関係注入用に Koin クラスを準備する {id="prepare-a-koin-class-for-ios-dependency-injection"}

Swift コードで Koin のクラスや関数を使用するために、特別な `KoinComponent` クラスを作成し、iOS 用の Koin モジュールを宣言します。

1. `sharedLogic/src/iosMain/kotlin/com/jetbrains/spacetutorial` ディレクトリに `KoinHelper.kt` ファイルを作成します。
2. 遅延 Koin インジェクションで `SpaceSDK` クラスをラップする `KoinHelper` クラスを追加します。

    ```kotlin
    package com.jetbrains.spacetutorial
   
    import org.koin.core.component.KoinComponent
    import com.jetbrains.spacetutorial.entity.RocketLaunch
    import org.koin.core.component.inject

    class KoinHelper : KoinComponent {
        private val sdk: SpaceSDK by inject<SpaceSDK>()

        suspend fun getLaunches(forceReload: Boolean): List<RocketLaunch> {
            return sdk.getLaunches(forceReload = forceReload)
        }
    }
    ```

3. `KoinHelper` クラスの下に、iOS Koin モジュールを初期化して起動するために Swift で使用する `initKoin()` 関数を追加します。

    ```kotlin
    import com.jetbrains.spacetutorial.cache.IOSDatabaseDriverFactory
    import com.jetbrains.spacetutorial.network.SpaceApi
    import org.koin.core.context.startKoin
    import org.koin.dsl.module
    
    fun initKoin() {
        startKoin {
            modules(module {
                single<SpaceApi> { SpaceApi() }
                single<SpaceSDK> {
                    SpaceSDK(
                        databaseDriverFactory = IOSDatabaseDriverFactory(), api = get()
                    )
                }
            })
        }
    }
    ```

これで、iOS アプリで Koin モジュールを起動して、共通の `SpaceSDK` クラスでネイティブデータベースドライバーを使用できるようになります。

### UI を実装する {id="implement-the-ui"}

まず、リストの項目を表示するための `RocketLaunchRow` SwiftUI ビューを作成します。これは `HStack` と `VStack` ビューに基づきます。データを表示するための便利なヘルパーを備えた `RocketLaunchRow` 構造体の拡張機能も作成します。

1. IntelliJ IDEA で、**Project** ビューになっていることを確認します。
2. `iosApp/iosApp` フォルダー内の `ContentView.swift` の隣に新しい Swift ファイルを作成し、`RocketLaunchRow` と名前を付けます。
3. `RocketLaunchRow.swift` ファイルを次のコードで更新します。

    ```Swift
    import SwiftUI
    import SharedLogic
    
    struct RocketLaunchRow: View {
        var rocketLaunch: RocketLaunch
    
        var body: some View {
            HStack() {
                VStack(alignment: .leading, spacing: 10.0) {
                    Text("\(rocketLaunch.missionName)")
                        .font(.system(size: 18))
                        .bold()
                        .fixedSize(horizontal: false, vertical: true)
                    Text(launchText).foregroundColor(launchColor)
                    Text("Launch year: \(String(rocketLaunch.launchYear))")
                    Text("\(rocketLaunch.status.description_)")
                }
                Spacer()
            }
        }
    }
    
    extension RocketLaunchRow {
        private var launchText: String {
            let isSuccess = rocketLaunch.status.id == 3
            return isSuccess ? "Successful" : "Unsuccessful"
        }
    
        private var launchColor: Color {
            let isSuccess = rocketLaunch.status.id == 3
            return isSuccess ? Color.green : Color.red
        }
    }
    ```

   打ち上げのリストは、プロジェクトにすでに含まれている `ContentView` ビューに表示されます。

4. `ContentView.swift` ファイルで、データを準備および管理する `ViewModel` クラスを持つ `ContentView` クラスの拡張機能を追加します。

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

    ビューモデル（`ContentView.ViewModel`）は、[Combine フレームワーク](https://developer.apple.com/documentation/combine)を介してビュー（`ContentView`）と接続します。
    * `ContentView.ViewModel` クラスは `ObservableObject` として宣言されます。
    * `launches` プロパティには `@Published` 属性が使用されているため、ビューモデルはこのプロパティが変更されるたびにシグナルを発行します。

5. `ContentView_Previews` 構造体を削除します。今回はビューモデルと互換性のあるプレビューは実装しません。

6. 打ち上げのリストを表示し、再読み込み機能を追加するために `ContentView` クラスの body を更新します。

   * これは UI の基礎作業です。`loadLaunches` 関数はチュートリアルの次のフェーズで実装します。
   * `viewModel` プロパティには、ビューモデルを購読するために `@ObservedObject` 属性が付与されています。

   ```swift
   struct ContentView: View {
       @ObservedObject private(set) var viewModel: ViewModel
   
       var body: some View {
           NavigationView {
               listView()
               .navigationBarTitle("Space Launches")
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

7. `RocketLaunch` クラスは `List` ビューを初期化するためのパラメーターとして使用されるため、[`Identifiable` プロトコルに準拠](https://developer.apple.com/documentation/swift/identifiable)している必要があります。
   このクラスにはすでに `id` という名前のプロパティがあるため、`ContentView.swift` の末尾に拡張機能を追加するだけで完了します。

    ```Swift
    extension RocketLaunch: Identifiable { }
    ```

### データを読み込む {id="load-the-data"}

ビューモデルでロケット打ち上げに関するデータを取得するには、Multiplatform ライブラリの `KoinHelper` クラスのインスタンスが必要です。
これにより、適切なデータベースドライバーを使用して SDK 関数を呼び出すことができます。

1. `ContentView.swift` ファイルで、`KoinHelper` オブジェクトと `loadLaunches` 関数を含めるように `ViewModel` クラスを拡張します。

   ```Swift
   extension ContentView {
       // ...
       class ViewModel: ObservableObject {
           // ...
           let helper: KoinHelper = KoinHelper()
   
           init() {
               self.loadLaunches(forceReload: false)
           }
    
           func loadLaunches(forceReload: Bool) {
               // TODO: retrieve data
           }
       }
   }
   ```

2. `loadLaunches()` 関数内で、`KoinHelper.getLaunches()` 関数（`SpaceSDK` クラスへの呼び出しをプロキシします）を呼び出し、その結果を `launches` プロパティに保存します。

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

    Kotlin モジュールを Apple フレームワークにコンパイルすると、Swift の `async`/`await` メカニズムを使用して [suspending functions（中断関数）](https://kotlinlang.org/docs/whatsnew14.html#support-for-kotlin-s-suspending-functions-in-swift-and-objective-c)を呼び出すことができます。
   
    `getLaunches` 関数には Kotlin で `@Throws(Exception::class)` アノテーションが付いているため、`Exception` クラスまたはそのサブクラスのインスタンスである例外は `NSError` として Swift に伝播されます。
    そのため、そのような例外はすべて `loadLaunches()` 関数でキャッチできます。

3. アプリのエントリポイントである `iOSApp.swift` ファイルに移動し、Koin モジュール、ビュー、およびビューモデルを初期化します。

    ```Swift
    import SwiftUI
    import SharedLogic
    
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

4. IntelliJ IDEA で **iosApp** 実行構成に切り替え、シミュレーターを選択して実行し、結果を確認します。

![iOS Application](ios-application.png){width=350}

> プロジェクトの最終バージョンは [`final` ブランチ](https://github.com/kotlin-hands-on/kmm-networking-and-data-storage/tree/final)で確認できます。
>
{style="note"}

## 次のステップ {id="what-s-next"}

このチュートリアルでは、JSON の解析やメインスレッドでのデータベースへのリクエストなど、潜在的にリソースを多く消費する操作を取り上げました。並行コードを記述してアプリを最適化する方法については、[コルーチンガイド](https://kotlinlang.org/docs/coroutines-guide.html)を参照してください。

以下の追加の学習資料も参照できます。

* [マルチプラットフォームプロジェクトで Ktor HTTP クライアントを使用する](https://ktor.io/docs/http-client-engines.html#mpp-config)
* [Koin と依存関係注入について読む](https://insert-koin.io/docs/setup/why)
* [Android アプリケーションを iOS で動作させる](multiplatform-integrate-in-existing-app.md)
* [マルチプラットフォームプロジェクトの構造についてさらに詳しく知る](multiplatform-discover-project.md)