[//]: # (title: 使用 Ktor 與 SQLDelight 建立多平台應用程式)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

<tldr>
<p>本教學使用 IntelliJ IDEA，但您也可以在 Android Studio 中進行 —— 這兩款 IDE 共享相同的核心功能與 Kotlin Multiplatform 支援。</p>
</tldr>

本教學將示範如何使用 IntelliJ IDEA 透過 Kotlin Multiplatform 建立適用於 iOS 與 Android 的進階行動應用程式。
此應用程式將會：

* 透過 Ktor 從公開的 [SpaceX API](https://docs.spacexdata.com/?version=latest) 經由網際網路擷取資料。
* 使用 SQLDelight 將資料儲存至本機資料庫。
* 顯示 SpaceX 火箭發射列表，包含發射日期、結果以及發射的詳細描述。

該應用程式將包含一個具有 iOS 與 Android 平台共用程式碼的模組。商業邏輯與資料存取層僅需在共用模組中實作一次，而雙平台的 UI 則將採用原生實作。

![Emulator and Simulator](android-and-ios.png){width=600}

您將在專案中使用以下多平台程式庫：

* [Ktor](https://ktor.io/docs/create-client.html) 作為 HTTP 用戶端，用於經由網際網路擷取資料。
* [`kotlinx.serialization`](https://github.com/Kotlin/kotlinx.serialization) 用於將 JSON 回應還原序列化為實體類別的物件。
* [`kotlinx.coroutines`](https://github.com/Kotlin/kotlinx.coroutines) 用於編寫非同步程式碼。
* [SQLDelight](https://github.com/cashapp/sqldelight) 用於從 SQL 查詢產生 Kotlin 程式碼，並建立型別安全的資料庫 API。
* [Koin](https://insert-koin.io/) 用於透過相依注入提供平台專屬的資料庫驅動程式。

> 您可以在我們的 GitHub 存儲庫中找到[專案範本](https://github.com/kotlin-hands-on/kmm-networking-and-data-storage)以及[最終應用程式的原始碼](https://github.com/kotlin-hands-on/kmm-networking-and-data-storage/tree/final)。
>
{style="note"}

## 建立專案

1. 在[快速入門指南](quickstart.md)中，完成[設定 Kotlin Multiplatform 開發環境](quickstart.md#set-up-the-environment)的說明。
2. 在 IntelliJ IDEA 中，選取 **File** | **New** | **Project**。
3. 在左側面板中選取 **Kotlin Multiplatform** (在 Android Studio 中，可以在 **New Project** 精靈的 **Generic** 索引標籤中找到此範本)。
4. 在 **New Project** 視窗中指定以下欄位：

   * **Name**: SpaceTutorial
   * **Group**: com.jetbrains
   * **Artifact**: spacetutorial

   ![Create Ktor and SQLDelight Multiplatform project](create-ktor-sqldelight-multiplatform-project.png){width=800}

5. 選取 **Android** 與 **iOS** 目標。
6. 對於 iOS，選取 **Do not share UI** 選項。您將為兩個平台實作原生 UI。
7. 指定完所有欄位與目標後，按一下 **Create**。

## 新增 Gradle 相依性

若要將多平台程式庫新增至共用模組，您需要將相依性指令 (`implementation`) 新增至 `build.gradle.kts` 檔案中相關原始碼集的 `dependencies {}` 區塊。

`kotlinx.serialization` 與 SQLDelight 程式庫也需要額外的設定。

更改或新增 `gradle/libs.versions.toml` 檔案中版本目錄的行，以反映所有需要的相依性：

1. 在 `[versions]` 區塊中，檢查 AGP 版本並新增其餘部分：

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

2. 在 `[libraries]` 區塊中，新增以下程式庫參照：

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

3. 在 `[plugins]` 區塊中，指定必要的 Gradle 外掛程式：

   ```
   [plugins]
   ...
   kotlinxSerialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
   sqldelight = { id = "app.cash.sqldelight", version.ref = "sqlDelight" }
   ```

4. 新增相依性後，系統會提示您重新同步專案。按一下 **Sync Gradle Changes** 按鈕以同步 Gradle 檔案： ![Synchronize Gradle files](gradle-sync.png){width=50}

5. 在 `shared/build.gradle.kts` 檔案的最開頭，將以下幾行新增至 `plugins {}` 區塊：

   ```kotlin
   plugins {
       // ...
       alias(libs.plugins.kotlinxSerialization)
       alias(libs.plugins.sqldelight)
   }
   ```

6. 通用原始碼集需要每個程式庫的核心構件，以及 Ktor [序列化功能](https://ktor.io/docs/serialization-client.html)，以便使用 `kotlinx.serialization` 來處理網路請求與回應。
    iOS 與 Android 原始碼集也需要 SQLDelight 與 Ktor 的平台驅動程式。

    在同一個 `shared/build.gradle.kts` 檔案中，新增所有必要的相依性：

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

7. 在 `sourseSets` 區塊的開頭，選擇採用 Kotlin 標準程式庫的實驗性時間 API：

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

8. 新增相依性後，再次按一下 **Sync Gradle Changes** 按鈕以同步 Gradle 檔案。

Gradle 同步完成後，您就完成了專案組態設定，可以開始編寫程式碼了。

> 如需多平台相依性的深入指南，請參閱 [Kotlin Multiplatform 程式庫的相依性](multiplatform-add-dependencies.md)。
>
{style="tip"}

## 建立應用程式資料模型

本教學應用程式將包含公開的 `SpaceXSDK` 類別，作為網路與快取服務的外觀（facade）。
應用程式資料模型將具有三個實體類別，包含：

* 關於發射的一般資訊
* 任務徽章圖像的連結
* 發射相關文章的 URL

> 在本教學結束時，並非所有這些資料都會顯示在 UI 中。
> 我們使用此資料模型來展示序列化。
> 但您可以嘗試使用連結與徽章，將此範例擴充為更具資訊量的內容！
>
{style="note"}

建立必要的資料類別：

1. 在 `shared/src/commonMain/kotlin/com/jetbrains/spacetutorial` 目錄中，建立 `entity` 套件，然後在該套件中建立 `Entity.kt` 檔案。
2. 宣告基本實體的所有資料類別：

   ```kotlin
   
   ```

每個可序列化的類別都必須標記 `@Serializable` 註解。`kotlinx.serialization` 外掛程式會自動為 `@Serializable` 類別產生預設序列化程式，除非您在註解引數中明確傳遞序列化程式的連結。

`@SerialName` 註解允許您重新定義欄位名稱，這有助於在資料類別中使用更具可讀性的識別符來存取屬性。

## 設定 SQLDelight 並實作快取邏輯

### 設定 SQLDelight

SQLDelight 程式庫允許您從 SQL 查詢產生型別安全的 Kotlin 資料庫 API。在編譯期間，產生器會驗證 SQL 查詢並將其轉換為可在共用模組中使用的 Kotlin 程式碼。

SQLDelight 相依性已包含在專案中。若要設定該程式庫，請開啟 `shared/build.gradle.kts` 檔案並在末尾新增 `sqldelight {}` 區塊。此區塊包含資料庫及其參數的清單：

```kotlin
sqldelight {
    databases {
        create("AppDatabase") {
            packageName.set("com.jetbrains.spacetutorial.cache")
        }
    }
}
```

`packageName` 參數指定產生的 Kotlin 原始碼的套件名稱。

出現提示時同步 Gradle 專案檔案，或按兩下 <shortcut>Shift</shortcut> 並搜尋 **Sync All Gradle, Swift Package Manager projects**。

> 建議安裝官方的 [SQLDelight 外掛程式](https://plugins.jetbrains.com/plugin/8191-sqldelight)以處理 `.sq` 檔案。
>
{style="tip"}

### 產生資料庫 API

首先，建立包含所有必要 SQL 查詢的 `.sq` 檔案。預設情況下，SQLDelight 外掛程式會在原始碼集的 `sqldelight` 資料夾中尋找 `.sq` 檔案：

1. 在 `shared/src/commonMain` 目錄中，建立一個新的 `sqldelight` 目錄。
2. 在 `sqldelight` 目錄中，建立一個名為 `com/jetbrains/spacetutorial/cache` 的新目錄以建立套件的巢狀目錄。
3. 在 `cache` 目錄中，建立 `AppDatabase.sq` 檔案 (與您在 `build.gradle.kts` 檔案中指定的資料庫名稱相同)。
   您應用程式的所有 SQL 查詢都將儲存在此檔案中。
4. 資料庫將包含一個包含發射資料的資料表。
   將以下用於建立資料表的程式碼新增至 `AppDatabase.sq` 檔案：

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

5. 新增用於將資料插入資料表的 `insertLaunch` 函式：

   ```text
   insertLaunch:
   INSERT INTO Launch(flightNumber, missionName, details, launchSuccess, launchDateUTC, patchUrlSmall, patchUrlLarge, articleUrl)
   VALUES(?, ?, ?, ?, ?, ?, ?, ?);
   ```

6. 新增用於清除資料表中資料的 `removeAllLaunches` 函式：

   ```text
   removeAllLaunches:
   DELETE FROM Launch;
   ```

7. 宣告用於擷取資料的 `selectAllLaunchesInfo` 函式：

   ```text
   selectAllLaunchesInfo:
   SELECT Launch.*
   FROM Launch;
   ```
8. 產生相對應的 `AppDatabase` 介面 (稍後您將使用資料庫驅動程式對其進行初始化)。
   若要執行此操作，請在終端機中執行以下指令：

   ```shell
   ./gradlew generateCommonMainAppDatabaseInterface
   ```

   產生的 Kotlin 程式碼儲存在 `shared/build/generated/sqldelight` 目錄中。

### 為平台專屬的資料庫驅動程式建立工廠（類）

若要初始化 `AppDatabase` 介面，您將向其傳遞一個 `SqlDriver` 執行個體。
SQLDelight 提供了多種平台專屬的 SQLite 驅動程式實作，因此您需要分別為每個平台建立這些執行個體。

雖然您可以透過[預期與實際介面](multiplatform-expect-actual.md)來實現這一點，但在本專案中，您將使用 [Koin](https://insert-koin.io/) 來嘗試 Kotlin Multiplatform 中的相依注入。

1. 為資料庫驅動程式建立一個介面。若要執行此操作，請在 `shared/src/commonMain/kotlin/com/jetbrains/spacetutorial/` 目錄中建立 `cache` 套件。
2. 在 `cache` 套件中建立 `DatabaseDriverFactory` 介面：

   ```kotlin
   package com.jetbrains.spacetutorial.cache
   
   import app.cash.sqldelight.db.SqlDriver

   interface DatabaseDriverFactory {
       fun createDriver(): SqlDriver
   }
   ```

3. 建立為 Android 實作此介面的類別：在 `shared/src/androidMain/kotlin` 目錄中，建立 `com.jetbrains.spacetutorial.cache` 套件，然後在其中建立 `DatabaseDriverFactory.kt` 檔案。
4. 在 Android 上，SQLite 驅動程式由 `AndroidSqliteDriver` 類別實作。在 `DatabaseDriverFactory.kt` 檔案中，將資料庫資訊與內容連結傳遞給 `AndroidSqliteDriver` 類別建構函式：

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
6. 在 `cache` 套件中，建立 `DatabaseDriverFactory.kt` 檔案並新增以下程式碼：

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

您稍後將在專案的平台專屬程式碼中實作這些驅動程式的執行個體。

### 實作快取

到目前為止，您已經新增了平台資料庫驅動程式的工廠（類）以及用於執行資料庫操作的 `AppDatabase` 介面。現在，建立一個 `Database` 類別，它將封裝 `AppDatabase` 介面並包含快取邏輯。

1. 在通用原始碼集 `shared/src/commonMain/kotlin` 中，於 `com.jetbrains.spacetutorial.cache` 套件中建立一個新的 `Database` 類別。它將包含兩個平台共用的邏輯。

2. 若要為 `AppDatabase` 提供驅動程式，請將抽象 `DatabaseDriverFactory` 執行個體傳遞給 `Database` 類別建構函式：

   ```kotlin
   package com.jetbrains.spacetutorial.cache

   internal class Database(databaseDriverFactory: DatabaseDriverFactory) {
       private val database = AppDatabase(databaseDriverFactory.createDriver())
       private val dbQuery = database.appDatabaseQueries
   }
   ```

   此類別的[可見性](https://kotlinlang.org/docs/visibility-modifiers.html#class-members)設定為 internal，這意味著它僅能從多平台模組內部存取。

3. 在 `Database` 類別中，實作一些資料處理操作。
   首先，建立 `getAllLaunches` 函式以傳回所有火箭發射的清單。
   `mapLaunchSelecting` 函式用於將資料庫查詢結果對應至 `RocketLaunch` 物件：

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

4. 新增 `clearAndCreateLaunches` 函式以清除資料庫並插入新資料：

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

## 實作 API 服務

若要經由網際網路擷取資料，您將使用 [SpaceX 公開 API](https://github.com/r-spacex/SpaceX-API/tree/master/docs#rspacex-api-docs) 以及單一方法從 `v5/launches` 端點擷取所有發射的列表。

建立一個類別來將應用程式連接到 API：

1. 在 `shared/src/commonMain/kotlin/com/jetbrains/spacetutorial/` 目錄中，建立 `network` 套件。
2. 在 `network` 目錄中，建立 `SpaceXApi` 類別：

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

    此類別執行網路請求並將 JSON 回應還原序列化為 `com.jetbrains.spacetutorial.entity` 套件中的實體。
    Ktor `HttpClient` 執行個體初始化並儲存 `httpClient` 屬性。

    此程式碼使用 [`ContentNegotiation`](https://ktor.io/docs/serialization-client.html) Ktor 外掛程式將 `GET` 請求的結果還原序列化。該外掛程式將請求與回應的承載資料作為 JSON 處理，並根據需要進行序列化與還原序列化。

3. 宣告傳回火箭發射清單的資料擷取函式：

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

`getAllLaunches` 函式具有 `suspend` 修飾詞，因為它包含對掛起函式 `HttpClient.get()` 的呼叫。
     `get()` 函式包含一個經由網際網路擷取資料的非同步操作，且只能從協同程式或其他掛起函式中呼叫。網路請求將在 HTTP 用戶端的執行緒池中執行。
   
發送 GET 請求的 URL 作為引數傳遞給 `get()` 函式。

## 組建一個 SDK

您的 iOS 與 Android 應用程式將透過共用模組與 SpaceX API 進行通訊，該模組將提供一個公開類別 `SpaceXSDK`。

1. 在通用原始碼集 `shared/src/commonMain/kotlin` 的 `com.jetbrains.spacetutorial` 套件中，建立 `SpaceXSDK` 類別。
   此類別將作為 `Database` 與 `SpaceXApi` 類別的外觀（facade）。

   若要建立 `Database` 類別執行個體，請提供 `DatabaseDriverFactory` 執行個體：

   ```kotlin
   package com.jetbrains.spacetutorial
   
   import com.jetbrains.spacetutorial.cache.Database
   import com.jetbrains.spacetutorial.cache.DatabaseDriverFactory
   import com.jetbrains.spacetutorial.network.SpaceXApi

   class SpaceXSDK(databaseDriverFactory: DatabaseDriverFactory, val api: SpaceXApi) { 
       private val database = Database(databaseDriverFactory)
   }
   ```

   您將透過 `SpaceXSDK` 類別建構函式在平台專屬程式碼中注入正確的資料庫驅動程式。

2. 新增 `getLaunches` 函式，該函式使用建立的資料庫與 API 獲取發射列表：

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

該類別包含一個用於獲取所有發射資訊的函式。根據 `forceReload` 的值，它會傳回快取值或從網際網路載入資料，然後使用結果更新快取。如果沒有快取資料，無論 `forceReload` 旗標的值為何，它都會從網際網路載入資料。

您 SDK 的用戶端可以使用 `forceReload` 旗標來載入最新的發射資訊，為使用者提供下拉重新整理手勢。

所有的 Kotlin 例外都是非受檢的，而 Swift 只有受檢錯誤 (詳情請參閱 [與 Swift/Objective-C 的互通性](https://kotlinlang.org/docs/native-objc-interop.html#errors-and-exceptions))。因此，為了讓您的 Swift 程式碼察覺到預期例外，從 Swift 呼叫的 Kotlin 函式應標記 `@Throws` 註解，並指定潛在例外類別的清單。

## 建立 Android 應用程式

IntelliJ IDEA 會為您處理初始的 Gradle 組態，因此 `shared` 模組已經連接到您的 Android 應用程式。

在實作 UI 與呈現邏輯之前，將所有必要的 UI 相依性新增至 `composeApp/build.gradle.kts` 檔案：

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

出現提示時同步 Gradle 專案檔案，或按兩下 <shortcut>Shift</shortcut> 並搜尋 **Sync All Gradle, Swift Package Manager projects**。

### 新增網際網路存取權限

若要存取網際網路，Android 應用程式需要適當的權限。
在 `composeApp/src/androidMain/AndroidManifest.xml` 檔案中，新增 `<uses-permission>` 標籤：

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <!--...-->
</manifest>
```

### 新增相依注入

Koin 相依注入讓您能夠宣告可在不同情境中使用的模組 (組件集)。
在此專案中，您將建立兩個模組：一個用於 Android 應用程式，另一個用於 iOS 應用程式。
然後，您將使用相對應的模組為每個原生 UI 啟動 Koin。

宣告一個 Koin 模組，該模組將包含 Android 應用程式的組件：

1. 在 `composeApp/src/androidMain/kotlin` 目錄中，於 `com.jetbrains.spacetutorial` 套件中建立 `AppModule.kt` 檔案。

   在該檔案中，將模組宣告為兩個[單例](https://insert-koin.io/docs/reference/koin-core/definitions#defining-a-singleton)，一個用於 `SpaceXApi` 類別，另一個用於 `SpaceXSDK` 類別：

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

   `SpaceXSDK` 類別建構函式注入了平台專屬的 `AndroidDatabaseDriverFactory` 類別。
   `get()` 函式用於解析模組內的相依性：在 `SpaceXSDK()` 的 `api` 參數處，Koin 將傳遞早前宣告的 `SpaceXApi` 單例。

2. 建立一個自訂的 `Application` 類別，它將啟動 Koin 模組。

   在 `AppModule.kt` 檔案旁，建立包含以下程式碼的 `Application.kt` 檔案，並在 `modules()` 函式呼叫中指定您宣告的模組：

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

3. 在 `AndroidManifest.xml` 檔案的 `<application>` 標籤中指定您建立的 `MainApplication` 類別：

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

現在，您已準備好實作將使用平台專屬資料庫驅動程式所提供資訊的 UI。

### 準備包含發射清單的視圖模型

您將使用 Jetpack Compose 與 Material 3 實作 Android UI。首先，您將建立使用 SDK 獲取發射清單的視圖模型。然後，您將設定 Material 主題，最後，您將編寫將一切結合在一起的可組合函式。

1. 在 `composeApp/src/androidMain` 原始碼集的 `com.jetbrains.spacetutorial` 套件中，建立 `RocketLaunchViewModel.kt` 檔案：

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

   `RocketLaunchScreenState` 執行個體將儲存從 SDK 接收的資料以及請求的當前狀態。

2. 新增 `loadLaunches` 函式，該函式將在此視圖模型的協同程式範圍內呼叫 SDK 的 `getLaunches` 函式：

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

3. 然後在類別的 `init {}` 區塊中新增一個 `loadLaunches()` 呼叫，以便在 `RocketLaunchViewModel` 物件建立時立即從 API 請求資料：

    ```kotlin
    class RocketLaunchViewModel(private val sdk: SpaceXSDK) : ViewModel() {
        // ...

        init {
            loadLaunches()
        }
    }
    ```

4. 現在，在 `AppModule.kt` 檔案中，在 Koin 模組中指定該視圖模型：

    ```kotlin
    import org.koin.core.module.dsl.viewModel
    
    val appModule = module {
        // ...
        viewModel { RocketLaunchViewModel(sdk = get()) }
    }
    ```

### 組建 Material 主題

您將圍繞 Material 主題提供的 `AppTheme` 函式來組建您的主 `App()` 可組合項：

1. 您可以使用 [Material 主題產生器 (Material Theme Builder)](https://m3.material.io/theme-builder#/custom) 為您的 Compose 應用程式產生主題。選取您的顏色、選取您的字型，然後點擊右下角的 **Export theme**。
2. 在匯出畫面中，按一下 **Export** 下拉式功能表並選取 **Jetpack Compose (Theme.kt)** 選項。
3. 解壓縮封存檔案並將 `theme` 資料夾複製到 `composeApp/src/androidMain/kotlin/com/jetbrains/spacetutorial` 目錄中。

   ![theme directory location](theme-directory.png){width=299}

4. 在 `theme` 套件內的每個檔案中，更改 `package` 行以參照您建立的套件：

    ```kotlin
    package com.jetbrains.spacetutorial.theme
    ```

5. 在 `Color.kt` 檔案中，為成功與失敗的發射新增兩個顏色變數：

    ```kotlin
    val app_theme_successful = Color(0xff4BB543)
    val app_theme_unsuccessful = Color(0xffFC100D)
    ```

### 實作呈現邏輯

為您的應用程式建立主 `App()` 可組合項，並從 `ComponentActivity` 類別中呼叫它：

1. 開啟 `com.jetbrains.spacetutorial` 套件中 `theme` 目錄旁的 `App.kt` 檔案，並替換預設的 `App()` 可組合函式：

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

   在這裡，您使用的是 [Koin ViewModel API](https://insert-koin.io/docs/%koinVersion%/reference/koin-compose/compose/#viewmodel-for-composable) 來參照您在 Android Koin 模組中宣告的 `viewModel`。

2. 現在新增 UI 程式碼，實作載入畫面、發射結果欄位以及下拉重新整理動作：

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

3. 最後，在 `AndroidManifest.xml` 檔案的 `<activity>` 標籤中指定您的 `MainActivity` 類別：

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

4. 執行您的 Android 應用程式：從執行配置功能表中選取 **composeApp**，選擇一個模擬器，然後點擊執行按鈕。
   該應用程式會自動執行 API 請求並顯示發射清單 (背景顏色取決於您產生的 Material 主題)：

   ![Android application](android-application.png){width=350}

您剛剛建立了一個 Android 應用程式，其商業邏輯在 Kotlin Multiplatform 模組中實作，而 UI 則使用原生 Jetpack Compose 製作。

## 建立 iOS 應用程式

對於專案的 iOS 部分，您將利用 [SwiftUI](https://developer.apple.com/xcode/swiftui/) 來建置使用者介面以及 [Model-View-ViewModel](https://en.wikipedia.org/wiki/Model–view–viewmodel) 模式。

IntelliJ IDEA 會產生一個已連接到共用模組的 iOS 專案。Kotlin 模組以 `shared/build.gradle.kts` 檔案中指定的名稱匯出 (`baseName = "Shared"`)，並使用常規的 `import` 陳述式匯入：`import Shared`。

### 為 SQLDelight 新增動態連結旗標

預設情況下，IntelliJ IDEA 產生的專案設定為 iOS 框架的靜態連結。

若要在 iOS 上使用原生 SQLDelight 驅動程式，請新增動態連結器旗標，以便 Xcode 工具能找到系統提供的 SQLite 二進制檔：

1. 在 IntelliJ IDEA 中，選取 **File** | **Open Project in Xcode** 選項以在 Xcode 中開啟您的專案。
2. 在 Xcode 中，連按兩下專案名稱以開啟其設定。
3. 切換至 **Build Settings** 索引標籤，在該處切換至 **All** 列表並搜尋 **Other Linker Flags** 欄位。
4. 展開該欄位，按一下 **Debug** 欄位旁的加號，並將 `-lsqlite3` 字串貼入 **Any Architecture | Any SDK** 中。
5. 對 **Other Linker Flags** | **Release** 欄位重複上述程序。

![The result of correctly adding the linker flag to the Xcode project](xcode-other-linker-flags.png){width="434"}

### 為 iOS 相依注入準備一個 Koin 類別

若要在 Swift 程式碼中使用 Koin 類別與函式，請建立一個特殊的 `KoinComponent` 類別並宣告 iOS 的 Koin 模組。

1. 在 `shared/src/iosMain/kotlin/` 原始碼集中，建立一個名為 `com/jetbrains/spacetutorial/KoinHelper.kt` 的檔案 (它將出現在 `cache` 資料夾旁)。
2. 新增 `KoinHelper` 類別，它將使用消極的 Koin 注入封裝 `SpaceXSDK` 類別：

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

3. 在 `KoinHelper` 類別下方，新增 `initKoin()` 函式，您將在 Swift 中使用它來初始化並啟動 iOS Koin 模組：

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

現在，您可以在 iOS 應用程式中啟動 Koin 模組，以便將原生資料庫驅動程式與通用的 `SpaceXSDK` 類別結合使用。

### 實作 UI

首先，您將建立一個 `RocketLaunchRow` SwiftUI 視圖用於顯示清單中的項目。它將基於 `HStack` 與 `VStack` 視圖。`RocketLaunchRow` 結構將具有一些擴充套件，其中包含用於顯示資料的實用幫助程式。

1. 在 IntelliJ IDEA 中，確保您處於 **Project** 檢視。
2. 在 `iosApp` 資料夾中建立一個新的 Swift 檔案，位於 `ContentView.swift` 旁，並命名為 `RocketLaunchRow`。
3. 使用以下程式碼更新 `RocketLaunchRow.swift` 檔案：

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

   發射清單將顯示在專案中已包含的 `ContentView` 視圖中。

4. 為 `ContentView` 類別建立一個擴充套件，包含一個將準備並管理資料的 `ViewModel` 類別。將以下程式碼新增至 `ContentView.swift` 檔案：

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

    視圖模型 (`ContentView.ViewModel`) 透過 [Combine 框架](https://developer.apple.com/documentation/combine)與視圖 (`ContentView`) 連接：
    * `ContentView.ViewModel` 類別被宣告為 `ObservableObject`。
    * `@Published` 屬性用於 `launches` 屬性，因此視圖模型將在該屬性變更時發送訊號。

5. 移除 `ContentView_Previews` 結構：您不需要實作與視圖模型相容的預覽。

6. 更新 `ContentView` 類別的主體以顯示發射清單並新增重新整理功能。

   * 這是 UI 的基礎工作：您將在教學的下一階段實作 `loadLaunches` 函式。
   * `viewModel` 屬性標記有 `@ObservedObject` 屬性以訂閱視圖模型。

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

7. `RocketLaunch` 類別作為初始化 `List` 視圖的參數，因此它需要[符合 `Identifiable` 協定](https://developer.apple.com/documentation/swift/identifiable)。該類別已經有一個名為 `id` 的屬性，所以您只需在 `ContentView.swift` 的底部新增擴充套件：

    ```Swift
    extension RocketLaunch: Identifiable { }
    ```

### 載入資料

若要在視圖模型中擷取關於火箭發射的資料，您需要來自多平台程式庫的 `KoinHelper` 類別執行個體。
它將允許您使用正確的資料庫驅動程式呼叫 SDK 函式。

1. 在 `ContentView.swift` 檔案中，擴充 `ViewModel` 類別以包含 `KoinHelper` 物件與 `loadLaunches` 函式：

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
               // TODO: retrieve data
           }
       }
   }
   ```

2. 呼叫 `KoinHelper.getLaunches()` 函式 (這會代理對 `SpaceXSDK` 類別的呼叫) 並將結果儲存在 `launches` 屬性中：

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

    當您將 Kotlin 模組編譯成 Apple 框架時，可以使用 Swift 的 `async`/`await` 機制來呼叫[掛起函式](https://kotlinlang.org/docs/whatsnew14.html#support-for-kotlin-s-suspending-functions-in-swift-and-objective-c)。
   
    由於 `getLaunches` 函式在 Kotlin 中標記有 `@Throws(Exception::class)` 註解，任何身為 `Exception` 類別或其子類別執行個體的例外都將作為 `NSError` 傳遞到 Swift 中。因此，所有此類例外都可以被 `loadLaunches()` 函式捕獲。

3. 進入應用程式的入口點 `iOSApp.swift` 檔案，初始化 Koin 模組、視圖與視圖模型：

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

4. 在 IntelliJ IDEA 中，切換至 **iosApp** 組態，選擇一個模擬器並執行，以查看結果：

![iOS Application](ios-application.png){width=350}

> 您可以在 [`final` 分支上](https://github.com/kotlin-hands-on/kmm-networking-and-data-storage/tree/final)找到該專案的最終版本。
>
{style="note"}

## 下一步？

本教學涉及了一些潛在的高負載操作，例如剖析 JSON 以及在主執行緒中向資料庫發出請求。若要了解如何編寫並行程式碼並最佳化您的應用程式，請參閱 [協同程式指南](https://kotlinlang.org/docs/coroutines-guide.html)。

您也可以查看以下額外的學習資料：

* [在多平台專案中使用 Ktor HTTP 用戶端](https://ktor.io/docs/http-client-engines.html#mpp-config)
* [閱讀關於 Koin 與相依注入的內容](https://insert-koin.io/docs/setup/why)
* [讓您的 Android 應用程式在 iOS 上執行](multiplatform-integrate-in-existing-app.md)
* [進一步了解多平台專案結構](multiplatform-discover-project.md)。