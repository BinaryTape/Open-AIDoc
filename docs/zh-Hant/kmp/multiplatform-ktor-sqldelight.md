[//]: # (title: 使用 Ktor 和 SQLDelight 建立多平台應用程式)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

<tldr>
<p>本教學使用 IntelliJ IDEA，但你也可以在 Android Studio 中進行——這兩款 IDE 擁有相同的核心功能與 Kotlin Multiplatform 支援。</p>
</tldr>

本教學示範如何使用 IntelliJ IDEA 透過 Kotlin Multiplatform 建立適用於 iOS 和 Android 的進階行動應用程式。
此應用程式將會：

* 使用 [Ktor](https://ktor.io/docs/create-client.html) 和 [`kotlinx.serialization`](https://kotlinlang.org/docs/serialization.html) 透過網際網路從公開的 [Launch Library](https://lldev.thespacedevs.com/docs) 擷取資料。
* 使用 [SQLDelight](https://github.com/cashapp/sqldelight) 將資料儲存至本機資料庫中。
* 顯示太空火箭發射清單，包含發射日期、結果以及發射的詳細描述。
* 使用 [Koin](https://insert-koin.io/) 提供平台專屬的資料庫驅動程式。

該應用程式將包含一個具有 iOS 和 Android 平台共享程式碼的模組。商業邏輯與資料存取層僅需在共享模組中實作一次，而這兩個應用程式的 UI 則皆為原生。

![Emulator and Simulator](android-and-ios.png){width=600}

> 你可以在我們的 GitHub 存儲庫中找到[樣板專案](https://github.com/kotlin-hands-on/kmm-networking-and-data-storage)以及[最終應用程式](https://github.com/kotlin-hands-on/kmm-networking-and-data-storage/tree/final)的原始碼。
>
{style="note"}

## 建立專案 {id="create-a-project"}

1. 在[快速入門](quickstart.md)中，完成[設定 Kotlin Multiplatform 開發環境](quickstart.md#set-up-the-environment)的說明。
2. 在 IntelliJ IDEA 中，選取 **File** | **New** | **Project**。
3. 在左側面板中，選取 **Kotlin Multiplatform**（在 Android Studio 中，該範本可在 **New Project** 精靈的 **Generic** 標籤頁中找到）。
4. 在 **New Project** 視窗中指定以下欄位：

   * **Name**：SpaceTutorial
   * **Project ID**：com.jetbrains.spacetutorial

5. 選取 **Android** 與 **iOS** 目標。
6. 對於 iOS，選取 **Do not share UI** 選項。你將為這兩個平台實作原生 UI。
7. 指定所有欄位和目標後，點擊 **Create**。

   ![Create Ktor and SQLDelight Multiplatform project](create-ktor-sqldelight-multiplatform-project.png){width=800}

## 新增 Gradle 相依性 {id="add-gradle-dependencies"}

若要將多平台程式庫新增至共享模組，請在該模組的 `build.gradle.kts` 檔案中，將相依性指令（`implementation`）新增至相應原始碼集的 `dependencies {}` 區塊中。

`kotlinx.serialization` 和 SQLDelight 程式庫也需要額外配置。

在 `gradle/libs.versions.toml` 檔案的版本目錄（version catalog）中修改或新增行，以反映所有必要的相依性：

1. 在 `[versions]` 區塊中，檢查 AGP 版本並新增其餘內容：

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

2. 在 `[libraries]` 區塊中，新增以下程式庫參照：

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

3. 在 `[plugins]` 區塊中，指定必要的 Gradle 外掛程式：

   ```toml
   [plugins]
   # ...
   kotlinxSerialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
   sqldelight = { id = "app.cash.sqldelight", version.ref = "sqlDelight" }
   ```

4. 版本目錄更新後，系統會提示你重新同步專案。
   點擊 **Sync Gradle Changes** 按鈕以同步 Gradle 檔案：![Synchronize Gradle files](gradle-sync.png){width=50}

5. 在 `sharedLogic/build.gradle.kts` 檔案的最開頭，將以下行新增至 `plugins {}` 區塊：

   ```kotlin
   plugins {
       // ...
       alias(libs.plugins.kotlinxSerialization)
       alias(libs.plugins.sqldelight)
   }
   ```

6. common 原始碼集需要各個程式庫的核心產物，以及使用 `kotlinx.serialization` 所需的 Ktor [序列化功能](https://ktor.io/docs/serialization-client.html)。
    iOS 和 Android 原始碼集也需要 SQLDelight 與 Ktor 的平台驅動程式。

    在同一個 `sharedLogic/build.gradle.kts` 檔案中，新增所有必要的相依性：

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

7. 指定相依性後，再次點擊 **Sync Gradle Changes** 按鈕以更新 Gradle 檔案。

完成 Gradle 同步後，即完成了專案配置，可以開始編寫程式碼。

> 若需多平台相依性的深入指南，請參閱[對 Kotlin Multiplatform 程式庫的相依性](multiplatform-add-dependencies.md)。
>
{style="tip"}

## 建立應用程式資料模型 {id="create-an-application-data-model"}

教學中的應用程式將包含公開的 `SpaceSDK` 類別，作為網路與快取服務的門面（facade）。
應用程式資料模型將有三個實體類別，包含：

* 關於發射的一般資訊
* 任務徽章圖片的連結
* 與發射相關的文章 URL

> 在本教學結束時，並非所有這些資料都會顯示在 UI 中。
> 我們使用此資料模型來展示序列化。
> 但你可以隨意運用連結與徽章，將此範例擴展為更豐富的內容！
>
{style="note"}

建立必要的資料類別：

1. 在 `sharedLogic/src/commonMain/kotlin/com/jetbrains/spacetutorial` 目錄中建立 `entity` 套件，然後在該套件內建立 `Entity.kt` 檔案。
2. 宣告基本實體的所有資料類別：

   ```kotlin
   
   ```

每個可序列化的類別都必須使用 `@Serializable` 註解標記。`kotlinx.serialization` 外掛程式會自動為 `@Serializable` 類別產生預設序列化器，除非你在註解引數中明確傳入序列化器的參照。

`@SerialName` 註解可讓你重新定義欄位名稱，這有助於使用更具可讀性的識別符號來存取資料類別中的屬性。

## 配置 SQLDelight 並實作快取邏輯 {id="configure-sqldelight-and-implement-cache-logic"}

SQLDelight 程式庫可讓你從 SQL 查詢產生型別安全的 Kotlin 資料庫 API。在編譯期間，產生器會驗證 SQL 查詢，並將其轉換為可在共享模組中使用的 Kotlin 程式碼。

### 配置 SQLDelight {id="configure-sqldelight"}

專案中已包含 SQLDelight 相依性。
若要配置該程式庫，請開啟 `sharedLogic/build.gradle.kts` 檔案，並在末尾新增 `sqldelight {}` 區塊。
此區塊包含資料庫清單及其參數：

```kotlin
sqldelight {
    databases {
        create("AppDatabase") {
            packageName.set("com.jetbrains.spacetutorial.cache")
        }
    }
}
```

`packageName` 參數保存產生的 Kotlin 原始碼的套件名稱。

出現提示時同步 Gradle 專案檔案，或按兩下 <shortcut>Shift 鍵</shortcut>並搜尋 **Sync All Gradle, Swift Package Manager projects** 操作。

> 建議安裝官方的 [SQLDelight 外掛程式](https://plugins.jetbrains.com/plugin/8191-sqldelight)以處理 `.sq` 檔案。
>
{style="tip"}

### 產生資料庫 API {id="generate-the-database-api"}

首先，建立包含所有必要 SQL 查詢的 `.sq` 檔案。預設情況下，SQLDelight 外掛程式會在原始碼集的 `sqldelight` 資料夾中尋找 `.sq` 檔案：

1. 在 `sharedLogic/src/commonMain` 目錄中，建立新的 `sqldelight` 目錄。
2. 在 `sqldelight` 目錄中，建立名稱為 `com/jetbrains/spacetutorial/cache` 的新目錄，以建立套件的巢狀目錄。
3. 在 `cache` 目錄內，建立 `AppDatabase.sq` 檔案（名稱與你在 `build.gradle.kts` 檔案中指定的資料庫名稱相同）。
   你的應用程式的所有 SQL 查詢都將儲存在此檔案中。
4. 資料庫將包含一個存有發射相關資料的資料表。
   將以下程式碼新增至 `AppDatabase.sq` 檔案以建立資料表，並定義稍後將使用的幾個函式：

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

5. 產生對應的 `AppDatabase` 介面（稍後你將使用資料庫驅動程式將其初始化）。
   為此，請在專案根目錄的終端中執行以下指令：

   ```shell
   ./gradlew generateCommonMainAppDatabaseInterface
   ```

   產生的 Kotlin 程式碼儲存在 `sharedLogic/build/generated/sqldelight` 目錄中。

### 建立平台專屬資料庫驅動程式的工廠 {id="create-factories-for-platform-specific-database-drivers"}

若要初始化 `AppDatabase` 介面，你需要將 `SqlDriver` 執行個體傳遞給它。
SQLDelight 提供了 SQLite 驅動程式的多種平台專屬實作，因此你需要為每個平台分別建立這些執行個體。

雖然你可以透過 [expected 和 actual 介面](multiplatform-expect-actual.md)來實現這一點，
但在本專案中，你將使用 [Koin](https://insert-koin.io/) 來嘗試 Kotlin Multiplatform 中的相依注入。

1. 建立資料庫驅動程式的介面。為此，請在 `sharedLogic/src/commonMain/kotlin/com/jetbrains/spacetutorial/` 目錄中建立 `cache` 套件。
2. 在 `cache` 套件內建立 `DatabaseDriverFactory` 介面：

   ```kotlin
   package com.jetbrains.spacetutorial.cache
   
   import app.cash.sqldelight.db.SqlDriver

   interface DatabaseDriverFactory {
       fun createDriver(): SqlDriver
   }
   ```

3. 建立為 Android 實作此介面的類別：在 `sharedLogic/src/androidMain/kotlin` 目錄中建立 `com.jetbrains.spacetutorial.cache` 套件，然後在其中建立 `AndroidDatabaseDriverFactory.kt` 檔案。
4. 在 Android 上，SQLite 驅動程式由 `AndroidSqliteDriver` 類別實作。在 `DatabaseDriverFactory.kt` 檔案中，將資料庫資訊與 context 參照傳遞給 `AndroidSqliteDriver` 類別建構函式：

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

5. 對於 iOS，在 `shared/src/iosMain/kotlin/com/jetbrains/spacetutorial/` 目錄中建立 `cache` 套件。
6. 在 `cache` 套件內，建立 `DatabaseDriverFactory.kt` 檔案並新增以下程式碼：

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

稍後你將在專案的平台專屬部分中使用這些工廠。

### 實作快取 {id="implement-cache"}

到目前為止，你已新增了平台資料庫驅動程式的工廠以及用於執行資料庫操作的 `AppDatabase` 介面。
現在，建立一個 `Database` 類別，它將封裝 `AppDatabase` 介面並包含快取邏輯。

1. 在 common 原始碼集 `sharedLogic/src/commonMain/kotlin` 中的 `com.jetbrains.spacetutorial.cache` 套件內建立一個新的 `Database` 類別。它將包含兩個平台通用的邏輯。

2. 若要為 `AppDatabase` 提供驅動程式，請將抽象的 `DatabaseDriverFactory` 執行個體傳遞給 `Database` 類別建構函式：

   ```kotlin
   package com.jetbrains.spacetutorial.cache

   internal class Database(databaseDriverFactory: DatabaseDriverFactory) {
       private val database = AppDatabase(databaseDriverFactory.createDriver())
       private val dbQuery = database.appDatabaseQueries
   }
   ```

   此類別的[可見性](https://kotlinlang.org/docs/visibility-modifiers.html#class-members)設定為 internal，這表示它只能在多平台模組內部存取。

3. 在 `Database` 類別內部實作一些資料處理操作。
   首先，建立 `getAllLaunches()` 函式以傳回所有火箭發射的清單。
   `mapLaunchSelecting()` 函式用於將資料庫查詢的結果對應為 `RocketLaunch` 物件：

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

4. 新增 `clearAndCreateLaunches()` 函式以清除資料庫並插入新資料：

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
                        launchDateUTC = launchDateUTC,
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

## 實作 API 服務 {id="implement-the-api-service"}

若要透過網際網路擷取資料，你將使用 [Launch Library 公開 API](https://lldev.thespacedevs.com/docs)，以及一個從 `/2.3.0/launches` 端點擷取所有發射清單的方法。

建立一個將應用程式連線至該 API 的類別：

1. 在 `sharedLogic/src/commonMain/kotlin/com/jetbrains/spacetutorial/` 目錄中建立 `network` 套件。
2. 在 `network` 目錄內建立 `SpaceApi` 類別：

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

    此類別負責執行網路請求，並將 JSON 回應反序列化為 `com.jetbrains.spacetutorial.entity` 套件中的實體。
    Ktor 的 `HttpClient` 執行個體初始化並儲存 `httpClient` 屬性。

    此程式碼使用 [`ContentNegotiation`](https://ktor.io/docs/serialization-client.html) Ktor 外掛程式來反序列化 `GET` 請求的結果。該外掛程式將請求與回應酬載處理為 JSON，並依需求進行序列化與反序列化。

3. 宣告傳回火箭發射清單的資料擷取函式：

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

`getAllLaunches` 函式具有 `suspend` 修飾詞，因為它包含對掛起函式 `HttpClient.get()` 的呼叫。
`HttpClient.get()` 函式包含透過網際網路擷取資料的非同步操作，且只能從協同程式或其他掛起函式中呼叫。網路請求將在 HTTP 用戶端的執行緒池中執行。

用於傳送 GET 請求的 URL 作為引數傳遞給 `get()` 函式。

## 建置 SDK {id="build-an-sdk"}

你的 iOS 與 Android 應用程式將透過共享模組與太空 API 進行通訊，該模組將提供一個公開類別 `SpaceSDK`。

1. 在 common 原始碼集 `sharedLogic/src/commonMain/kotlin` 的 `com.jetbrains.spacetutorial` 套件中建立 `SpaceSDK` 類別。
   此類別將作為 `Database` 和 `SpaceApi` 類別的門面。

   若要建立 `Database` 類別執行個體，請提供 `DatabaseDriverFactory` 執行個體：

   ```kotlin
   package com.jetbrains.spacetutorial
   
   import com.jetbrains.spacetutorial.cache.Database
   import com.jetbrains.spacetutorial.cache.DatabaseDriverFactory
   import com.jetbrains.spacetutorial.network.SpaceApi

   class SpaceSDK(databaseDriverFactory: DatabaseDriverFactory, val api: SpaceApi) { 
       private val database = Database(databaseDriverFactory)
   }
   ```

   你將在平台專屬程式碼中透過 `SpaceSDK` 類別建構函式注入正確的資料庫驅動程式。

2. 新增 `getLaunches` 函式，它使用建立的資料庫與 API 來請求並儲存發射清單：

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

該類別包含一個用於取得所有發射資訊的函式。根據 `forceReload` 的值，它會傳回快取值，或從網際網路載入資料並用結果更新快取。如果沒有快取資料，無論 `forceReload` 旗標的值為何，它都會從網際網路載入資料。

你 SDK 的用戶端可以使用 `forceReload` 旗標來載入關於發射的最新資訊，從而為使用者實現下拉重新整理（pull-to-refresh）手勢。

Kotlin 的所有例外皆為非受檢例外，而 Swift 只有受檢錯誤（詳見[與 Swift/Objective-C 的互通性](https://kotlinlang.org/docs/native-objc-interop.html#errors-and-exceptions)）。因此，為了讓 Swift 程式碼察覺預期的例外，從 Swift 呼叫的 Kotlin 函式應使用 `@Throws` 註解標記，並指定潛在的例外類別清單。

## 建立 Android 應用程式 {id="create-the-android-application"}

IntelliJ IDEA 會為你處理初始 Gradle 配置，因此 `sharedUI` 和 `sharedLogic` 模組已經連線至你的 Android 應用程式（`androidApp`）。

出現提示時同步 Gradle 專案檔案，或按兩下 <shortcut>Shift 鍵</shortcut>並搜尋 **Sync All Gradle, Swift Package Manager projects**。

### 為 `androidApp` 新增網際網路存取權限 {id="add-internet-access-permission-for-androidapp"}

若要存取網際網路，Android 應用程式需要適當的權限。
在 `androidApp/src/main/AndroidManifest.xml` 檔案中，新增 `<uses-permission>` 標籤：

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <!--...-->
</manifest>
```

### 新增相依注入程式碼 {id="add-dependency-injection-code"}

Koin 相依注入可讓你宣告可在不同環境中使用的模組（元件集合）。
在此專案中，你將建立兩個模組：一個用於 Android 應用程式，另一個用於 iOS 應用程式。
然後，你將使用相應的模組為各個原生 UI 啟動 Koin。

宣告一個包含 Android 應用程式元件的 Koin 模組：

1. 將 `androidMain` 原始碼集的 Koin Android 相依性新增至 `sharedUI/build.gradle.kts` 檔案：

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

2. 建立 `sharedUI/src/androidMain/kotlin` 目錄以存放 Android 專屬的 UI 程式碼。
3. 在 `sharedUI/src/androidMain/kotlin` 目錄中，建立 `com.jetbrains.spacetutorial` 套件。
4. 從 `sharedUI` 模組中移除 `commonMain` 和 `commonTest` 原始碼集，因為 Android UI 並未共享。
5. 在 `sharedUI/src/androidMain/kotlin/com.jetbrains.spacetutorial` 套件中建立 `AppModule.kt` 檔案。

   在該檔案中，將 Koin 模組宣告為兩個[單例](https://insert-koin.io/docs/reference/koin-core/definitions#defining-a-singleton)，一個用於 `SpaceApi` 類別，另一個用於 `SpaceSDK` 類別：

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

   `SpaceSDK` 類別建構函式注入了平台專屬的 `AndroidDatabaseDriverFactory` 類別。
   `get()` 函式解析模組內的相依性：在 `SpaceSDK()` 的 `api` 參數位置，Koin 會傳入稍早宣告的 `SpaceApi` 單例。

6. 在 `androidApp/build.gradle.kts` 檔案中，為 `androidApp` 模組新增 Koin Android 相依性：

   ```kotlin
   kotlin {
       // ...
       dependencies {
           // ...
           implementation(libs.koin.androidx.compose)
       }
   }
   ```

7. 在 `androidApp` 模組的 `src/main/kotlin/com/jetbrains/spacetutorial` 目錄中建立 `MainApplication` 類別，它將啟動 Koin 模組。

   將你在 `AppModule.kt` 檔案中宣告的模組傳遞給 `modules()` 函式：

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

8. 在 `AndroidManifest.xml` 檔案的 `<application>` 標籤中指定你建立的 `MainApplication` 類別：

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

現在，你已準備好實作 UI，該 UI 將使用平台專屬資料庫驅動程式提供的資訊。

### 準備包含發射清單的 ViewModel {id="prepare-the-view-model-with-the-list-of-launches"}

你將使用 Jetpack Compose 和 Material 3 實作 Android UI。首先，你將建立使用 SDK 取得發射清單的 ViewModel。接著設定 Material 主題，最後編寫將這一切整合在一起的 Composable 函式。

1. 在 `sharedUI/src/androidMain/kotlin` 目錄下的 `com.jetbrains.spacetutorial` 套件中，建立 `RocketLaunchViewModel.kt` 檔案：

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

   `RocketLaunchScreenState` 執行個體將儲存從 SDK 接收到的資料以及請求的目前狀態。

2. 將 `loadLaunches` 函式新增至 `RocketLaunchViewModel` 類別中，該函式將在此 ViewModel 的協同程式作用域中呼叫 SDK 的 `getLaunches` 函式：

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

3. 在 `RocketLaunchViewModel` 類別內部新增帶有 `loadLaunches()` 呼叫的 `init {}` 區塊，以便在建立 `RocketLaunchViewModel` 物件時立即從 API 請求資料：

    ```kotlin
    class RocketLaunchViewModel(private val sdk: SpaceSDK) : ViewModel() {
        // ...

        init {
            loadLaunches()
        }
    }
    ```

4. 現在，在 `AppModule.kt` 檔案中，於 Koin 模組內指定 ViewModel：

    ```kotlin
    import org.koin.core.module.dsl.viewModel
    
    val appModule = module {
        // ...
        viewModel { RocketLaunchViewModel(sdk = get()) }
    }
    ```

### 建置 Material 主題 {id="build-the-material-theme"}

你將圍繞 Material 主題提供的 `AppTheme` 函式建構主 `App()` Composable：

1. 你可以使用 [Material Theme Builder](https://m3.material.io/theme-builder#/custom) 為你的 Compose 應用程式產生主題。
   挑選顏色、字型，然後點擊右下角的 **Export theme**。
2. 在匯出畫面中，點擊 **Export** 下拉式功能表，然後選取 **Jetpack Compose (Theme.kt)** 選項。
3. 解包壓縮檔並將 `theme` 資料夾複製到 `sharedUI/src/androidMain/kotlin/com/jetbrains/spacetutorial` 目錄中：

   ![theme directory location](theme-directory.png){width=299}

4. 在 `theme` 套件內的每個檔案中，修改 `package` 行以參照你建立的套件：

    ```kotlin
    package com.jetbrains.spacetutorial.theme
    ```

5. 在 `Color.kt` 檔案中，為成功與不成功的發射新增兩個即將使用的顏色變數：

    ```kotlin
    val app_theme_successful = Color(0xff4BB543)
    val app_theme_unsuccessful = Color(0xffFC100D)
    ```

### 實作展示邏輯 {id="implement-the-presentation-logic"}

為你的應用程式建立主要的 `App()` Composable，並從 `ComponentActivity` 類別中呼叫它：

1. 在 `sharedUI/src/androidApp/kotlin/com/jetbrains/spacetutorial` 目錄中建立 `App.kt` 檔案。
2. 開啟 `App.kt` 檔案並插入以下程式碼：

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

   在這裡，你使用 [Koin ViewModel API](https://insert-koin.io/docs/reference/koin-compose/compose-viewmodel) 來參照你在 Android Koin 模組中宣告的 `viewModel`。

3. 現在新增 UI 程式碼，以實作載入畫面、發射結果欄位以及下拉重新整理操作：

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

4. 最後，在 `androidApp/src/main/AndroidManifest.xml` 的 `<activity>` 標籤中指定你的 `MainActivity` 類別：

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

5. 執行你的 Android 應用程式：從執行設定功能表中選取 **androidApp**，選擇一個模擬器，然後點擊執行按鈕。
   應用程式會自動執行 API 請求並顯示發射清單（背景顏色取決於你產生的 Material 主題）：

   ![Android application](android-application.png){width=350}

你剛剛建立了一個 Android 應用程式，其商業邏輯在 Kotlin Multiplatform 模組中實作，而 UI 則在原生 Jetpack Compose 上運行。

## 建立 iOS 應用程式 {id="create-the-ios-application"}

對於專案的 iOS 部分，你將使用 [SwiftUI](https://developer.apple.com/xcode/swiftui/) 來建構使用者介面，並採用 [Model View View-Model](https://en.wikipedia.org/wiki/Model–view–viewmodel) 模式。

IntelliJ IDEA 會產生一個已連線至共享模組的 iOS 專案。Kotlin 模組會以 `sharedLogic/build.gradle.kts` 檔案中指定的名稱（`baseName = "SharedLogic"`）匯出，並使用一般的 `import` 陳述式匯入：`import SharedLogic`。

### 為 SQLDelight 新增動態連結旗標 {id="add-the-dynamic-linking-flag-for-sqldelight"}

預設情況下，IntelliJ IDEA 產生的專案已設定為靜態連結 iOS 框架。

若要在 iOS 上使用原生 SQLDelight 驅動程式，請新增動態連結器旗標，讓 Xcode 工具集能夠找到系統提供的 SQLite 二進位檔：

1. 在 IntelliJ IDEA 中，選取 **File** | **Open Project in Xcode** 選項以在 Xcode 中開啟專案。
2. 在 Xcode 中，點擊專案名稱以開啟其設定。
3. 切換至 **Build Settings** 標籤頁，切換到 **All** 清單，並搜尋 **Other Linker Flags** 欄位。
4. 展開該欄位，按下 **Debug** 欄位旁的加號，並將 `-lsqlite3` 字串貼入 **Any Architecture | Any SDK** 中。
5. 對 **Other Linker Flags** | **Release** 欄位重複此程序。

   ![The result of correctly adding the linker flag to the Xcode project](xcode-other-linker-flags.png){width="434"}
6. 返回 IntelliJ IDEA。

### 準備用於 iOS 相依注入的 Koin 類別 {id="prepare-a-koin-class-for-ios-dependency-injection"}

若要在 Swift 程式碼中使用 Koin 類別與函式，請建立一個特殊的 `KoinComponent` 類別並宣告適用於 iOS 的 Koin 模組。

1. 在 `sharedLogic/src/iosMain/kotlin/com/jetbrains/spacetutorial` 目錄中建立 `KoinHelper.kt` 檔案。
2. 新增 `KoinHelper` 類別，它將透過延遲 Koin 注入封裝 `SpaceSDK` 類別：

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

3. 在 `KoinHelper` 類別下方新增 `initKoin()` 函式，你將在 Swift 中使用它來初始化並啟動 iOS Koin 模組：

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

現在，你可以在 iOS 應用程式中啟動 Koin 模組，將原生資料庫驅動程式與通用 `SpaceSDK` 類別結合使用。

### 實作 UI {id="implement-the-ui"}

首先，你將建立一個 `RocketLaunchRow` SwiftUI 檢視以顯示清單中的項目。它將以 `HStack` 和 `VStack` 檢視為基礎。`RocketLaunchRow` 結構上會有擴充功能，包含用於顯示資料的實用幫助程式。

1. 在 IntelliJ IDEA 中，確認你位於 **Project** 檢視。
2. 在 `iosApp/iosApp` 資料夾中（位於 `ContentView.swift` 旁邊）建立新的 Swift 檔案，並將其命名為 `RocketLaunchRow`。
3. 使用以下程式碼更新 `RocketLaunchRow.swift` 檔案：

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

   發射清單將顯示在 `ContentView` 檢視中，該檢視已包含在專案中。

4. 在 `ContentView.swift` 檔案中，為 `ContentView` 類別新增一個擴充，其中包含用於準備和管理資料的 `ViewModel` 類別：

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

    ViewModel（`ContentView.ViewModel`）透過 [Combine 架構](https://developer.apple.com/documentation/combine)與檢視（`ContentView`）連線：
    * `ContentView.ViewModel` 類別宣告為 `ObservableObject`。
    * `@Published` 屬性用於 `launches` 屬性，因此每當此屬性變更時，ViewModel 都會發出信號。

5. 移除 `ContentView_Previews` 結構：你不需要實作與你的 ViewModel 相容的預覽。

6. 更新 `ContentView` 類別的主體以顯示發射清單並新增重新載入功能。

   * 這是 UI 基礎工作：你將在本教學的下一階段實作 `loadLaunches` 函式。
   * `viewModel` 屬性使用 `@ObservedObject` 屬性標記，以訂閱 ViewModel。

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

7. `RocketLaunch` 類別用作初始化 `List` 檢視的參數，因此它需要[符合 `Identifiable` 協定](https://developer.apple.com/documentation/swift/identifiable)。
   該類別已有名為 `id` 的屬性，因此你只需在 `ContentView.swift` 底部新增一個擴充：

    ```Swift
    extension RocketLaunch: Identifiable { }
    ```

### 載入資料 {id="load-the-data"}

若要在 ViewModel 中擷取關於火箭發射的資料，你將需要 Multiplatform 程式庫中的 `KoinHelper` 類別執行個體。
它將允許你使用正確的資料庫驅動程式呼叫 SDK 函式。

1. 在 `ContentView.swift` 檔案中，擴充 `ViewModel` 類別以包含 `KoinHelper` 物件與 `loadLaunches` 函式：

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

2. 在 `loadLaunches()` 函式中呼叫 `KoinHelper.getLaunches()` 函式
   （它會將呼叫代理至 `SpaceSDK` 類別），
   並將結果儲存於 `launches` 屬性中：

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

    當你將 Kotlin 模組編譯為 Apple 框架時，可以使用 Swift 的 `async`/`await` 機制來呼叫[掛起函式](https://kotlinlang.org/docs/whatsnew14.html#support-for-kotlin-s-suspending-functions-in-swift-and-objective-c)。
   
    由於 `getLaunches` 函式在 Kotlin 中標記了 `@Throws(Exception::class)` 註解，因此任何作為 `Exception` 類別或其子類別執行個體的例外都將作為 `NSError` 傳遞至 Swift。
    因此，所有此類例外都可以被 `loadLaunches()` 函式擷取。

3. 前往應用程式的入口點 `iOSApp.swift` 檔案，並初始化 Koin 模組、檢視以及 ViewModel：

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

4. 在 IntelliJ IDEA 中，切換至 **iosApp** 配置，選擇一個模擬器，然後執行它以檢視結果：

![iOS Application](ios-application.png){width=350}

> 你可以在 [`final` 分支](https://github.com/kotlin-hands-on/kmm-networking-and-data-storage/tree/final)上找到專案的最終版本。
>
{style="note"}

## 下一步？ {id="what-s-next"}

本教學介紹了一些潛在耗費資源的操作，例如剖析 JSON 以及在主執行緒中向資料庫發出請求。若要了解如何編寫並行程式碼並最佳化你的應用程式，請參閱[協同程式指南](https://kotlinlang.org/docs/coroutines-guide.html)。

你也可以查看這些額外的學習資源：

* [在多平台專案中使用 Ktor HTTP 用戶端](https://ktor.io/docs/http-client-engines.html#mpp-config)
* [閱讀關於 Koin 與相依注入的說明](https://insert-koin.io/docs/setup/why)
* [讓你的 Android 應用程式在 iOS 上運行](multiplatform-integrate-in-existing-app.md)
* [進一步了解多平台專案結構](multiplatform-discover-project.md)。