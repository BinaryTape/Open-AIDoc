[//]: # (title: 使用 Ktor 和 SQLDelight 创建多平台应用)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

<tldr>
<p>本教程使用 IntelliJ IDEA，但你也可以在 Android Studio 中跟随操作——这两个 IDE 共享相同的核心功能和 Kotlin Multiplatform 支持。</p>
</tldr>

本教程演示了如何使用 IntelliJ IDEA 通过 Kotlin Multiplatform 为 iOS 和 Android 创建高级移动应用程序。
该应用程序将：

* 使用 [Ktor](https://ktor.io/docs/create-client.html) 和 [`kotlinx.serialization`](https://kotlinlang.org/docs/serialization.html) 通过互联网从公开的 [Launch Library](https://lldev.thespacedevs.com/docs) 获取数据。
* 使用 [SQLDelight](https://github.com/cashapp/sqldelight) 将数据保存在本地数据库中。
* 显示太空火箭发射列表，附带发射日期、结果以及详细的发射说明。
* 使用 [Koin](https://insert-koin.io/) 提供平台特定的数据库驱动程序。

该应用程序将包含一个具有 iOS 和 Android 平台共享代码的模块。业务逻辑和数据访问层仅在共享模块中实现一次，而两个应用程序的 UI 都将采用原生实现。

![模拟器与仿真器](android-and-ios.png){width=600}

> 你可以在我们的 GitHub 仓库中找到[模板项目](https://github.com/kotlin-hands-on/kmm-networking-and-data-storage)以及[最终应用程序的源代码](https://github.com/kotlin-hands-on/kmm-networking-and-data-storage/tree/final)。
>
{style="note"}

## 创建项目 {id="create-a-project"}

1. 在[快速入门指南](quickstart.md)中，按照说明[设置用于 Kotlin Multiplatform 开发的环境](quickstart.md#set-up-the-environment)。
2. 在 IntelliJ IDEA 中，选择 **File** | **New** | **Project**。
3. 在左侧面板中，选择 **Kotlin Multiplatform**（在 Android Studio 中，该模板位于 **New Project** 向导的 **Generic** 选项卡下）。
4. 在 **New Project** 窗口中指定以下字段：

   * **Name**：SpaceTutorial
   * **Project ID**：com.jetbrains.spacetutorial

5. 选择 **Android** 和 **iOS** 目标。
6. 对于 iOS，选择 **Do not share UI** 选项。你将为这两个平台分别实现原生 UI。
7. 指定完所有字段和目标后，点击 **Create**。

   ![创建 Ktor 与 SQLDelight 多平台项目](create-ktor-sqldelight-multiplatform-project.png){width=800}

## 添加 Gradle 依赖项 {id="add-gradle-dependencies"}

要将多平台库添加到共享模块中，请在模块的 `build.gradle.kts` 文件中，将依赖项指令（`implementation`）添加到相关源集的 `dependencies {}` 块中。

`kotlinx.serialization` 和 SQLDelight 库还需要额外的配置。

在 `gradle/libs.versions.toml` 文件的版本目录中更改或添加行，以反映所有必要的依赖项：

1. 在 `[versions]` 块中，检查 AGP 版本并添加其余版本：

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

2. 在 `[libraries]` 块中，添加以下库引用：

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

3. 在 `[plugins]` 块中，指定所需的 Gradle 插件：

   ```toml
   [plugins]
   # ...
   kotlinxSerialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
   sqldelight = { id = "app.cash.sqldelight", version.ref = "sqlDelight" }
   ```

4. 版本目录更新完成后，系统会提示你重新同步项目。
   点击 **Sync Gradle Changes** 按钮同步 Gradle 文件：![同步 Gradle 文件](gradle-sync.png){width=50}

5. 在 `sharedLogic/build.gradle.kts` 文件的最开头，将以下行添加到 `plugins {}` 块中：

   ```kotlin
   plugins {
       // ...
       alias(libs.plugins.kotlinxSerialization)
       alias(libs.plugins.sqldelight)
   }
   ```

6. 公共源集需要每个库的核心构件，以及用于使用 `kotlinx.serialization` 的 Ktor [序列化功能](https://ktor.io/docs/serialization-client.html)。
    iOS 和 Android 源集还需要 SQLDelight 和 Ktor 的平台驱动程序。

    在同一个 `sharedLogic/build.gradle.kts` 文件中，添加所有必需的依赖项：

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

7. 指定依赖项后，再次点击 **Sync Gradle Changes** 按钮以更新 Gradle 文件。

Gradle 同步完成后，项目配置即告完成，你可以开始编写代码了。

> 有关多平台依赖项的深入指南，请参阅[依赖 Kotlin Multiplatform 库](multiplatform-add-dependencies.md)。
>
{style="tip"}

## 创建应用程序数据模型 {id="create-an-application-data-model"}

教程应用将包含公共的 `SpaceSDK` 类，作为网络和缓存服务的门面。
应用程序数据模型将包含三个实体类，分别包含：

* 发射的基本信息
* 任务徽章图片的链接
* 与发射相关的文章 URL

> 在本教程结束时，并非所有这些数据都会呈现在 UI 中。
> 我们使用该数据模型来演示序列化。
> 不过，你可以随意使用链接和徽章图片，将示例扩展得更加丰富！
>
{style="note"}

创建必要的数据类：

1. 在 `sharedLogic/src/commonMain/kotlin/com/jetbrains/spacetutorial` 目录下，创建 `entity` 包，然后在该包内创建 `Entity.kt` 文件。 
2. 为基本实体声明所有数据类：

   ```kotlin
   
   ```

每个可序列化类都必须标记有 `@Serializable` 注解。除非你在注解实参中显式传递对序列化器的引用，否则 `kotlinx.serialization` 插件会自动为 `@Serializable` 类生成默认序列化器。

`@SerialName` 注解允许你重新定义字段名称，这有助于在数据类中使用更易读的标识符来访问属性。

## 配置 SQLDelight 并实现缓存逻辑 {id="configure-sqldelight-and-implement-cache-logic"}

SQLDelight 库允许你从 SQL 查询生成类型安全的 Kotlin 数据库 API。在编译期间，生成器会验证 SQL 查询并将其转换为可在共享模块中使用的 Kotlin 代码。

### 配置 SQLDelight {id="configure-sqldelight"}

SQLDelight 依赖项已经包含在项目中。
要配置该库，请打开 `sharedLogic/build.gradle.kts` 文件并在末尾添加 `sqldelight {}` 块。
该块包含数据库及其参数的列表：

```kotlin
sqldelight {
    databases {
        create("AppDatabase") {
            packageName.set("com.jetbrains.spacetutorial.cache")
        }
    }
}
```

`packageName` 参数保存生成的 Kotlin 源代码的包名。

根据提示同步 Gradle 项目文件，或者双击 <shortcut>Shift 键</shortcut>并搜索 **Sync All Gradle, Swift Package Manager projects** 操作。

> 建议安装官方的 [SQLDelight 插件](https://plugins.jetbrains.com/plugin/8191-sqldelight)以处理 `.sq` 文件。
>
{style="tip"}

### 生成数据库 API {id="generate-the-database-api"}

首先，创建包含所有必需 SQL 查询的 `.sq` 文件。默认情况下，SQLDelight 插件会在源集的 `sqldelight` 文件夹中查找 `.sq` 文件：

1. 在 `sharedLogic/src/commonMain` 目录下，创建一个新的 `sqldelight` 目录。
2. 在 `sqldelight` 目录内，创建一个名为 `com/jetbrains/spacetutorial/cache` 的新目录，为包创建嵌套目录。
3. 在 `cache` 目录内，创建 `AppDatabase.sq` 文件（与你在 `build.gradle.kts` 文件中指定的数据库名称相同）。
   应用程序的所有 SQL 查询都将存储在该文件中。
4. 数据库将包含一个存有发射相关数据的表。
   将以下代码添加到 `AppDatabase.sq` 文件中以创建该表并定义几个稍后会用到的函数：

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

5. 生成对应的 `AppDatabase` 接口（稍后你将使用数据库驱动程序对其进行初始化）。
   为此，在项目的根目录下的终端中运行以下命令：

   ```shell
   ./gradlew generateCommonMainAppDatabaseInterface
   ```

   生成的 Kotlin 代码将存储在 `sharedLogic/build/generated/sqldelight` 目录中。

### 为平台专属数据库驱动程序创建工厂 {id="create-factories-for-platform-specific-database-drivers"}

要初始化 `AppDatabase` 接口，需要向其传递一个 `SqlDriver` 实例。
SQLDelight 提供了多种平台专属的 SQLite 驱动程序实现，因此你需要为每个平台分别创建这些实例。

虽然可以通过 [expected 和 actual 接口](multiplatform-expect-actual.md)来实现这一点，但在本项目中，你将使用 [Koin](https://insert-koin.io/) 来体验 Kotlin Multiplatform 中的依赖项注入。

1. 为数据库驱动程序创建一个接口。为此，在 `sharedLogic/src/commonMain/kotlin/com/jetbrains/spacetutorial/` 目录下，创建 `cache` 包。
2. 在 `cache` 包内创建 `DatabaseDriverFactory` 接口：

   ```kotlin
   package com.jetbrains.spacetutorial.cache
   
   import app.cash.sqldelight.db.SqlDriver

   interface DatabaseDriverFactory {
       fun createDriver(): SqlDriver
   }
   ```

3. 为 Android 创建实现该接口的类：在 `sharedLogic/src/androidMain/kotlin` 目录下，创建 `com.jetbrains.spacetutorial.cache` 包，然后在其中创建 `AndroidDatabaseDriverFactory.kt` 文件。
4. 在 Android 上，SQLite 驱动程序由 `AndroidSqliteDriver` 类实现。在 `DatabaseDriverFactory.kt` 文件中，将数据库信息和上下文引用传递给 `AndroidSqliteDriver` 类构造函数：

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

5. 对于 iOS，在 `shared/src/iosMain/kotlin/com/jetbrains/spacetutorial/` 目录下，创建 `cache` 包。
6. 在 `cache` 包内创建 `DatabaseDriverFactory.kt` 文件并添加以下代码：

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

稍后你将在项目的平台专属部分中使用这些工厂。

### 实现缓存 {id="implement-cache"}

到目前为止，你已经添加了用于平台数据库驱动程序的工厂以及用于执行数据库操作的 `AppDatabase` 接口。
现在，创建一个 `Database` 类，它将包装 `AppDatabase` 接口并包含缓存逻辑。

1. 在公共源集 `sharedLogic/src/commonMain/kotlin` 的 `com.jetbrains.spacetutorial.cache` 包中创建一个新的 `Database` 类。它将包含两个平台通用的逻辑。

2. 为了向 `AppDatabase` 提供驱动程序，请将抽象的 `DatabaseDriverFactory` 实例传递给 `Database` 类的构造函数：

   ```kotlin
   package com.jetbrains.spacetutorial.cache

   internal class Database(databaseDriverFactory: DatabaseDriverFactory) {
       private val database = AppDatabase(databaseDriverFactory.createDriver())
       private val dbQuery = database.appDatabaseQueries
   }
   ```

   该类的[可见性](https://kotlinlang.org/docs/visibility-modifiers.html#class-members)设置为 internal，这意味着它只能在多平台模块内部访问。

3. 在 `Database` 类中，实现一些数据处理操作。
   首先，创建 `getAllLaunches()` 函数以返回所有火箭发射的列表。
   `mapLaunchSelecting()` 函数用于将数据库查询结果映射为 `RocketLaunch` 对象：

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

4. 添加 `clearAndCreateLaunches()` 函数以清空数据库并插入新数据：

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

## 实现 API 服务 {id="implement-the-api-service"}

为了通过互联网获取数据，你将使用 [Launch Library 公开 API](https://lldev.thespacedevs.com/docs)，并通过单个方法从 `/2.3.0/launches` 端点检索所有发射的列表。

创建一个将应用程序连接到 API 的类：

1. 在 `sharedLogic/src/commonMain/kotlin/com/jetbrains/spacetutorial/` 目录下，创建 `network` 包。
2. 在 `network` 目录内，创建 `SpaceApi` 类：

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

    该类负责执行网络请求并将 JSON 响应反序列化为 `com.jetbrains.spacetutorial.entity` 包中的实体。
    Ktor `HttpClient` 实例初始化并存储 `httpClient` 属性。

    此代码使用 [`ContentNegotiation`](https://ktor.io/docs/serialization-client.html) Ktor 插件来反序列化 `GET` 请求的结果。该插件将请求和响应有效负载作为 JSON 处理，并根据需要进行序列化和反序列化。

3. 声明返回火箭发射列表的数据获取函数：

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

`getAllLaunches` 函数具有 `suspend` 修饰符，因为它包含对挂起函数 `HttpClient.get()` 的调用。
`HttpClient.get()` 函数包含一个通过网络获取数据的异步操作，只能从协程或其他挂起函数中调用。网络请求将在 HTTP 客户端的线程池中执行。

发送 GET 请求的 URL 作为实参传递给 `get()` 函数。

## 构建 SDK {id="build-an-sdk"}

你的 iOS 和 Android 应用程序将通过共享模块与航天 API 进行通信，共享模块将提供一个公共类 `SpaceSDK`。

1. 在公共源集 `sharedLogic/src/commonMain/kotlin` 的 `com.jetbrains.spacetutorial` 包中创建 `SpaceSDK` 类。
   该类将充当 `Database` 和 `SpaceApi` 类的门面。

   要创建 `Database` 类实例，需提供一个 `DatabaseDriverFactory` 实例：

   ```kotlin
   package com.jetbrains.spacetutorial
   
   import com.jetbrains.spacetutorial.cache.Database
   import com.jetbrains.spacetutorial.cache.DatabaseDriverFactory
   import com.jetbrains.spacetutorial.network.SpaceApi

   class SpaceSDK(databaseDriverFactory: DatabaseDriverFactory, val api: SpaceApi) { 
       private val database = Database(databaseDriverFactory)
   }
   ```

   你将在平台特定代码中通过 `SpaceSDK` 类的构造函数注入正确的数据库驱动程序。

2. 添加 `getLaunches` 函数，该函数使用创建的数据库和 API 来请求并存储发射列表：

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

该类包含一个用于获取所有发射信息的函数。根据 `forceReload` 的值，它会返回缓存的值，或者从网络加载数据并用结果更新缓存。如果没有缓存数据，则无论 `forceReload` 标志的值如何，它都会从网络加载数据。

你的 SDK 客户端可以使用 `forceReload` 标志来加载关于发射的最新信息，从而为用户提供下拉刷新手势支持。

所有 Kotlin 异常都是非受检异常，而 Swift 只有受检错误（详见[与 Swift/Objective-C 的互操作性](https://kotlinlang.org/docs/native-objc-interop.html#errors-and-exceptions)）。因此，为了让你的 Swift 代码能够感知预期的异常，从 Swift 调用的 Kotlin 函数应标记有 `@Throws` 注解，并指定潜在异常类的列表。

## 创建 Android 应用程序 {id="create-the-android-application"}

IntelliJ IDEA 会为你处理初始的 Gradle 配置，因此 `sharedUI` 和 `sharedLogic` 模块已经连接到你的 Android 应用程序（`androidApp`）。

根据提示同步 Gradle 项目文件，或者双击 <shortcut>Shift 键</shortcut>并搜索 **Sync All Gradle, Swift Package Manager projects**。

### 为 `androidApp` 添加网络访问权限 {id="add-internet-access-permission-for-androidapp"}

为了访问互联网，Android 应用程序需要相应的权限。
在 `androidApp/src/main/AndroidManifest.xml` 文件中，添加 `<uses-permission>` 标记：

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <!--...-->
</manifest>
```

### 添加依赖项注入代码 {id="add-dependency-injection-code"}

通过 Koin 依赖项注入，你可以声明可在不同上下文中使用的模块（组件集）。
在本项目中，你将创建两个模块：一个用于 Android 应用程序，另一个用于 iOS 应用。
然后，你将使用对应的模块为每个原生 UI 启动 Koin。

声明一个包含 Android 应用组件的 Koin 模块：

1. 在 `sharedUI/build.gradle.kts` 文件中，为 `androidMain` 源集添加 Koin Android 依赖项：

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

2. 创建 `sharedUI/src/androidMain/kotlin` 目录以存放 Android 专属的 UI 代码。
3. 在 `sharedUI/src/androidMain/kotlin` 目录下，创建 `com.jetbrains.spacetutorial` 包。
4. 从 `sharedUI` 模块中移除 `commonMain` 和 `commonTest` 源集，因为 Android UI 并不进行共享。
5. 在 `sharedUI/src/androidMain/kotlin/com.jetbrains.spacetutorial` 包中创建 `AppModule.kt` 文件。

   在该文件中，将 Koin 模块声明为两个[单例](https://insert-koin.io/docs/reference/koin-core/definitions#defining-a-singleton)，一个用于 `SpaceApi` 类，另一个用于 `SpaceSDK` 类：

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

   `SpaceSDK` 类的构造函数被注入了平台专属的 `AndroidDatabaseDriverFactory` 类。
   `get()` 函数负责解析模块内的依赖项：对于 `SpaceSDK()` 的 `api` 形参，Koin 将传递先前声明的 `SpaceApi` 单例。

6. 在 `androidApp/build.gradle.kts` 文件中，为 `androidApp` 模块添加 Koin Android 依赖项： 

   ```kotlin
   kotlin {
       // ...
       dependencies {
           // ...
           implementation(libs.koin.androidx.compose)
       }
   }
   ```

7. 在 `androidApp` 模块的 `src/main/kotlin/com/jetbrains/spacetutorial` 目录下，创建 `MainApplication` 类以启动 Koin 模块。

   将你在 `AppModule.kt` 文件中声明的模块传递给 `modules()` 函数：

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

8. 在 `AndroidManifest.xml` 文件的 `<application>` 标记中指定你创建的 `MainApplication` 类：

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

现在，你已准备好实现使用平台专属数据库驱动程序所提供信息的 UI。

### 准备带有发射列表的 ViewModel {id="prepare-the-view-model-with-the-list-of-launches"}

你将使用 Jetpack Compose 和 Material 3 实现 Android UI。首先，创建使用 SDK 获取发射列表的 ViewModel。然后设置 Material 主题，最后编写将所有内容组合在一起的 Composable 函数。

1. 在 `sharedUI/src/androidMain/kotlin` 目录的 `com.jetbrains.spacetutorial` 包中，创建 `RocketLaunchViewModel.kt` 文件：

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

   `RocketLaunchScreenState` 实例将存储从 SDK 接收的数据以及请求的当前状态。

2. 在 `RocketLaunchViewModel` 类中添加 `loadLaunches` 函数，该函数将在该 ViewModel 的协程作用域内调用 SDK 的 `getLaunches` 函数：

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

3. 在 `RocketLaunchViewModel` 类中，添加包含 `loadLaunches()` 调用的 `init {}` 块，以便在创建 `RocketLaunchViewModel` 对象后立即从 API 请求数据：

    ```kotlin
    class RocketLaunchViewModel(private val sdk: SpaceSDK) : ViewModel() {
        // ...

        init {
            loadLaunches()
        }
    }
    ```

4. 现在，在 `AppModule.kt` 文件中，于 Koin 模块中指定该 ViewModel：

    ```kotlin
    import org.koin.core.module.dsl.viewModel
    
    val appModule = module {
        // ...
        viewModel { RocketLaunchViewModel(sdk = get()) }
    }
    ```

### 构建 Material 主题 {id="build-the-material-theme"}

你将围绕 Material 主题提供的 `AppTheme` 函数构建主 `App()` 可组合项：

1. 你可以使用 [Material Theme Builder](https://m3.material.io/theme-builder#/custom) 为你的 Compose 应用生成主题。
   选取颜色、字体，然后点击右下角的 **Export theme**。
2. 在导出界面上，点击 **Export** 下拉菜单并选择 **Jetpack Compose (Theme.kt)** 选项。
3. 解压缩归档文件，并将 `theme` 文件夹复制到 `sharedUI/src/androidMain/kotlin/com/jetbrains/spacetutorial` 目录中：

   ![theme 目录位置](theme-directory.png){width=299}

4. 在 `theme` 包内的每个文件中，修改 `package` 行以指向你创建的包：

    ```kotlin
    package com.jetbrains.spacetutorial.theme
    ```

5. 在 `Color.kt` 文件中，添加两个用于表示发射成功与失败的颜色变量：

    ```kotlin
    val app_theme_successful = Color(0xff4BB543)
    val app_theme_unsuccessful = Color(0xffFC100D)
    ```

### 实现表现层逻辑 {id="implement-the-presentation-logic"}

为你的应用程序创建主 `App()` 可组合项，并从 `ComponentActivity` 类中调用它：

1. 在 `sharedUI/src/androidApp/kotlin/com/jetbrains/spacetutorial` 目录中创建 `App.kt` 文件。
2. 打开 `App.kt` 文件并插入以下代码：

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

   在此处，你使用 [Koin ViewModel API](https://insert-koin.io/docs/reference/koin-compose/compose-viewmodel) 来引用你在 Android Koin 模块中声明的 `viewModel`。

3. 现在添加实现加载屏幕、发射结果列表列以及下拉刷新操作的 UI 代码：

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

4. 最后，在 `androidApp/src/main/AndroidManifest.xml` 的 `<activity>` 标记中指定你的 `MainActivity` 类：

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

5. 运行你的 Android 应用：从运行配置菜单中选择 **androidApp**，选择一个模拟器，然后点击运行按钮。
   应用程序会自动发起 API 请求并显示发射列表（背景颜色取决于你生成的 Material 主题）：

   ![Android 应用程序](android-application.png){width=350}

你刚刚创建了一个 Android 应用程序，其业务逻辑在 Kotlin Multiplatform 模块中实现，UI 则运行在原生 Jetpack Compose 之上。

## 创建 iOS 应用程序 {id="create-the-ios-application"}

对于项目的 iOS 部分，你将使用 [SwiftUI](https://developer.apple.com/xcode/swiftui/) 构建用户界面，并使用 [Model View View-Model](https://en.wikipedia.org/wiki/Model–view–viewmodel) 模式。

IntelliJ IDEA 生成的 iOS 项目已经连接到共享模块。Kotlin 模块以 `sharedLogic/build.gradle.kts` 文件中指定的名称（`baseName = "SharedLogic"`）导出，并使用常规的 `import` 语句导入：`import SharedLogic`。

### 为 SQLDelight 添加动态链接标志 {id="add-the-dynamic-linking-flag-for-sqldelight"}

默认情况下，IntelliJ IDEA 生成的项目配置为静态链接 iOS 框架。

要在 iOS 上使用原生 SQLDelight 驱动程序，请添加动态链接器标志，以便 Xcode 工具链能够找到系统提供的 SQLite 二进制文件：

1. 在 IntelliJ IDEA 中，选择 **File** | **Open Project in Xcode** 选项以在 Xcode 中打开你的项目。
2. 在 Xcode 中，点击项目名称打开其设置。
3. 切换到 **Build Settings** 选项卡，在该选项卡中切换到 **All** 列表，并搜索 **Other Linker Flags** 字段。
4. 展开该字段，点击 **Debug** 字段旁边的加号，并将字符串 `-lsqlite3` 粘贴到 **Any Architecture | Any SDK** 中。
5. 对 **Other Linker Flags** | **Release** 字段重复此过程。

   ![在 Xcode 项目中正确添加链接器标志的结果](xcode-other-linker-flags.png){width="434"}
6. 返回 IntelliJ IDEA。

### 准备用于 iOS 依赖项注入的 Koin 类 {id="prepare-a-koin-class-for-ios-dependency-injection"}

要在 Swift 代码中使用 Koin 类和函数，请创建一个特殊的 `KoinComponent` 类并声明适用于 iOS 的 Koin 模块。

1. 在 `sharedLogic/src/iosMain/kotlin/com/jetbrains/spacetutorial` 目录下，创建 `KoinHelper.kt` 文件。
2. 添加 `KoinHelper` 类，该类将使用延迟 Koin 注入包装 `SpaceSDK` 类：

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

3. 在 `KoinHelper` 类下方，添加 `initKoin()` 函数，你将在 Swift 中使用该函数来初始化并启动 iOS Koin 模块：

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

现在，你可以在 iOS 应用中启动 Koin 模块，以便将原生数据库驱动程序与公共 `SpaceSDK` 类配合使用。

### 实现 UI {id="implement-the-ui"}

首先，你将创建一个 `RocketLaunchRow` SwiftUI 视图以显示列表中的每一项。它将基于 `HStack` 和 `VStack` 视图构建。在 `RocketLaunchRow` 结构体上将提供扩展，包含用于显示数据的实用帮助程序。

1. 在 IntelliJ IDEA 中，确保处于 **Project** 视图中。
2. 在 `iosApp/iosApp` 文件夹中（与 `ContentView.swift` 同级），新建一个名为 `RocketLaunchRow` 的 Swift 文件。
3. 使用以下代码更新 `RocketLaunchRow.swift` 文件：

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

   发射列表将显示在 `ContentView` 视图中，该视图已包含在项目中。

4. 在 `ContentView.swift` 文件中，为 `ContentView` 类添加一个扩展，其中包含用于准备和管理数据的 `ViewModel` 类：

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

    ViewModel（`ContentView.ViewModel`）通过 [Combine 框架](https://developer.apple.com/documentation/combine)与 View（`ContentView`）连接：
    * `ContentView.ViewModel` 类被声明为 `ObservableObject`。
    * `@Published` 属性用于 `launches` 属性，因此每当该属性发生更改时，ViewModel 都会发出信号。

5. 移除 `ContentView_Previews` 结构体：你无需实现与该 ViewModel 兼容的预览。

6. 更新 `ContentView` 类的主体以显示发射列表并添加重新加载功能。

   * 这是 UI 基础工作：你将在教程的下一阶段实现 `loadLaunches` 函数。
   * `viewModel` 属性标记有 `@ObservedObject` 特性，以订阅该 ViewModel。

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

7. `RocketLaunch` 类作为初始化 `List` 视图的参数使用，因此它需要[遵循 `Identifiable` 协议](https://developer.apple.com/documentation/swift/identifiable)。
   该类已经有名为 `id` 的属性，因此你只需在 `ContentView.swift` 的底部添加一个扩展：

    ```Swift
    extension RocketLaunch: Identifiable { }
    ```

### 加载数据 {id="load-the-data"}

要在 ViewModel 中获取关于火箭发射的数据，你需要多平台库中 `KoinHelper` 类的实例。
它将允许你使用正确的数据库驱动程序调用 SDK 函数。

1. 在 `ContentView.swift` 文件中，扩展 `ViewModel` 类以包含一个 `KoinHelper` 对象和 `loadLaunches` 函数：

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

2. 在 `loadLaunches()` 函数中，调用 `KoinHelper.getLaunches()` 函数（它将代理对 `SpaceSDK` 类的调用）并将结果保存到 `launches` 属性中：

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

    将 Kotlin 模块编译为 Apple 框架时，可以使用 Swift 的 `async`/`await` 机制调用[挂起函数](https://kotlinlang.org/docs/whatsnew14.html#support-for-kotlin-s-suspending-functions-in-swift-and-objective-c)。
   
    由于在 Kotlin 中 `getLaunches` 函数标记有 `@Throws(Exception::class)` 注解，任何作为 `Exception` 类或其子类实例的异常都将作为 `NSError` 传播到 Swift 中。
    因此，所有此类异常都可以被 `loadLaunches()` 函数捕获。

3. 转到应用的入口点 `iOSApp.swift` 文件，并初始化 Koin 模块、视图以及 ViewModel：

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

4. 在 IntelliJ IDEA 中，切换到 **iosApp** 配置，选择一个模拟器，然后运行它以查看结果：

![iOS 应用程序](ios-application.png){width=350}

> 你可以在 [`final` 分支](https://github.com/kotlin-hands-on/kmm-networking-and-data-storage/tree/final)上找到该项目的最终版本。
>
{style="note"}

## 下一步 {id="what-s-next"}

本教程包含一些可能较为消耗资源的操作，例如在主线程中解析 JSON 以及向数据库发起请求。要了解如何编写并发代码并优化你的应用，请参阅[协程指南](https://kotlinlang.org/docs/coroutines-guide.html)。

你还可以查看以下附加学习材料：

* [在多平台项目中使用 Ktor HTTP 客户端](https://ktor.io/docs/http-client-engines.html#mpp-config)
* [了解 Koin 和依赖项注入](https://insert-koin.io/docs/setup/why)
* [让你的 Android 应用程序在 iOS 上运行](multiplatform-integrate-in-existing-app.md)
* [详细了解多平台项目结构](multiplatform-discover-project.md)。