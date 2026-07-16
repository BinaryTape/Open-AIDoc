[//]: # (title: 使用 Ktor 和 SQLDelight 创建多平台应用)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

<tldr>
<p>本教程使用 IntelliJ IDEA，但您也可以在 Android Studio 中进行操作——这两个 IDE 共享相同的核心功能和 Kotlin Multiplatform 支持。</p>
</tldr>

本教程演示了如何使用 IntelliJ IDEA 创建一个面向 iOS 和 Android 的高级跨平台移动应用程序，该程序使用的是 Kotlin Multiplatform。
该应用程序将：

* 使用 Ktor 通过互联网从公开的 [SpaceX API](https://docs.spacexdata.com/?version=latest) 获取数据。
* 使用 SQLDelight 将数据保存在本地数据库中。
* 显示 SpaceX 火箭发射列表，包括发射日期、结果以及发射的详细描述。

该应用程序将包含一个包含 iOS 和 Android 平台共享代码的模块。业务逻辑和数据访问层将在共享模块中仅实现一次，而两个应用程序的 UI 都将是原生的。

![Emulator and Simulator](android-and-ios.png){width=600}

您将在项目中使用以下多平台库：

* [Ktor](https://ktor.io/docs/create-client.html) 作为 HTTP 客户端，用于通过互联网检索数据。
* [`kotlinx.serialization`](https://github.com/Kotlin/kotlinx.serialization) 用于将 JSON 响应反序列化为实体类的对象。
* [`kotlinx.coroutines`](https://github.com/Kotlin/kotlinx.coroutines) 用于编写异步代码。
* [SQLDelight](https://github.com/cashapp/sqldelight) 用于从 SQL 查询生成 Kotlin 代码并创建类型安全的数据库 API。
* [Koin](https://insert-koin.io/) 通过 SQL 注入提供平台特定的数据库驱动程序。

> 您可以在我们的 GitHub 仓库中找到 [项目模板](https://github.com/kotlin-hands-on/kmm-networking-and-data-storage) 以及 [最终应用](https://github.com/kotlin-hands-on/kmm-networking-and-data-storage/tree/final) 的源代码。
>
{style="note"}

## 创建一个项目

1. 在 [快速入门](quickstart.md) 中，完成 [为 Kotlin Multiplatform 开发设置环境](quickstart.md#set-up-the-environment) 的说明。
2. 在 IntelliJ IDEA 中，选择 **File** | **New** | **Project**。
3. 在左侧面板中，选择 **Kotlin Multiplatform**（在 Android Studio 中，该模板可以在 **New Project** 向导的 **Generic** 选项卡中找到）。
4. 在 **New Project** 窗口中指定以下字段：

   * **Name**: SpaceTutorial
   * **Group**: com.jetbrains
   * **Artifact**: spacetutorial

   ![Create Ktor and SQLDelight Multiplatform project](create-ktor-sqldelight-multiplatform-project.png){width=800}

5. 选择 **Android** 和 **iOS** 目标。
6. 对于 iOS，选择 **Do not share UI** 选项。您将为两个平台实现原生 UI。
7. 指定完所有字段和目标后，点击 **Create**。

## 添加 Gradle 依赖项

要将多平台库添加到共享模块中，您需要将依赖项指令 (`implementation`) 添加到 `build.gradle.kts` 文件中相关源集 (source set) 的 `dependencies {}` 块中。

`kotlinx.serialization` 和 SQLDelight 库都需要额外的配置。

修改或在 `gradle/libs.versions.toml` 文件的版本目录中添加行，以反映所有需要的依赖项：

1. 在 `[versions]` 块中，检查 AGP 版本并添加其余部分：

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

2. 在 `[libraries]` 块中，添加以下库引用：

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

3. 在 `[plugins]` 块中，指定必要的 Gradle 插件：

   ```
   [plugins]
   ...
   kotlinxSerialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
   sqldelight = { id = "app.cash.sqldelight", version.ref = "sqlDelight" }
   ```

4. 添加依赖项后，系统会提示您重新同步项目。点击 **Sync Gradle Changes** 按钮同步 Gradle 文件： ![Synchronize Gradle files](gradle-sync.png){width=50}

5. 在 `shared/build.gradle.kts` 文件的最开头，将以下几行添加到 `plugins {}` 块中：

   ```kotlin
   plugins {
       // ...
       alias(libs.plugins.kotlinxSerialization)
       alias(libs.plugins.sqldelight)
   }
   ```

6. 公共源集 (common source set) 需要每个库的核心构件 (artifact)，以及 Ktor 的 [序列化功能](https://ktor.io/docs/serialization-client.html)，以便使用 `kotlinx.serialization` 处理网络请求和响应。
    iOS 和 Android 源集 (source set) 也需要 SQLDelight 和 Ktor 的平台驱动程序。

    在同一个 `shared/build.gradle.kts` 文件中，添加所有需要的依赖项：

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

7. 在 `sourseSets` 块的开头，选择启用 Kotlin 标准库的实验性时间 API：

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

8. 添加依赖项后，再次点击 **Sync Gradle Changes** 按钮以同步 Gradle 文件。

完成 Gradle 同步后，项目配置就完成了，您可以开始编写代码了。

> 有关多平台依赖项的深入指南，请参阅 [Kotlin Multiplatform 库的依赖项](multiplatform-add-dependencies.md)。
>
{style="tip"}

## 创建应用数据模型

本教程的应用将包含公共的 `SpaceXSDK` 类，作为联网和缓存服务的门面 (facade)。
应用程序数据模型将拥有三个实体类，包含：

* 关于发射的一般信息
* 任务徽章图像的链接
* 与发射相关的文章 URL

> 在本教程结束时，并非所有这些数据都会出现在 UI 中。
> 我们使用该数据模型是为了展示序列化。
> 但您可以尝试使用链接和徽标来将此示例扩展为更具信息量的内容！
>
{style="note"}

创建必要的数据类：

1. 在 `shared/src/commonMain/kotlin/com/jetbrains/spacetutorial` 目录中，创建 `entity` 软件包，
   然后在该软件包中创建 `Entity.kt` 文件。 
2. 为基本实体声明所有数据类：

   ```kotlin
   
   ```

每个可序列化的类都必须标记有 `@Serializable` 注解。除非您在注解参数中显式传递了对序列化程序的引用，否则 `kotlinx.serialization` 插件会自动为 `@Serializable` 类生成默认序列化程序。

`@SerialName` 注解允许您重新定义字段名称，这有助于使用更具可读性的标识符访问数据类中的属性。

## 配置 SQLDelight 并实现缓存逻辑

### 配置 SQLDelight

SQLDelight 库允许您从 SQL 查询生成类型安全的 Kotlin 数据库 API。在编译期间，生成器会验证 SQL 查询并将其转换为可在共享模块中使用的 Kotlin 代码。

SQLDelight 依赖项已包含在项目中。要配置该库，请打开 `shared/build.gradle.kts` 文件并在末尾添加 `sqldelight {}` 块。此块包含数据库列表及其参数：

```kotlin
sqldelight {
    databases {
        create("AppDatabase") {
            packageName.set("com.jetbrains.spacetutorial.cache")
        }
    }
}
```

`packageName` 参数指定生成的 Kotlin 源代码的包名。

提示时同步 Gradle 项目文件，或者按两次 <shortcut>Shift</shortcut> 并搜索 **Sync All Gradle, Swift Package Manager projects**。

> 考虑安装官方的 [SQLDelight 插件](https://plugins.jetbrains.com/plugin/8191-sqldelight) 以处理 `.sq` 文件。
>
{style="tip"}

### 生成数据库 API

首先，创建包含所有必要 SQL 查询的 `.sq` 文件。默认情况下，SQLDelight 插件会在源集 (source set) 的 `sqldelight` 文件夹中查找 `.sq` 文件：

1. 在 `shared/src/commonMain` 目录中，创建一个新的 `sqldelight` 目录。
2. 在 `sqldelight` 目录中，创建一个名为 `com/jetbrains/spacetutorial/cache` 的新目录，以创建软件包的嵌套目录。
3. 在 `cache` 目录中，创建 `AppDatabase.sq` 文件（名称与您在 `build.gradle.kts` 文件中指定的数据库名称相同）。
   应用程序的所有 SQL 查询都将存储在此文件中。
4. 数据库将包含一个带有发射数据的表。
   将以下创建表的代码添加到 `AppDatabase.sq` 文件中：

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

5. 添加用于向表中插入数据的 `insertLaunch` 函数：

   ```text
   insertLaunch:
   INSERT INTO Launch(flightNumber, missionName, details, launchSuccess, launchDateUTC, patchUrlSmall, patchUrlLarge, articleUrl)
   VALUES(?, ?, ?, ?, ?, ?, ?, ?);
   ```

6. 添加用于清除表中数据的 `removeAllLaunches` 函数：

   ```text
   removeAllLaunches:
   DELETE FROM Launch;
   ```

7. 声明用于检索数据的 `selectAllLaunchesInfo` 函数：

   ```text
   selectAllLaunchesInfo:
   SELECT Launch.*
   FROM Launch;
   ```
8. 生成相应的 `AppDatabase` 接口（稍后您将使用数据库驱动程序对其进行初始化）。
   为此，请在终端中运行以下命令：

   ```shell
   ./gradlew generateCommonMainAppDatabaseInterface
   ```

   生成的 Kotlin 代码存储在 `shared/build/generated/sqldelight` 目录中。

### 为平台特定的数据库驱动程序创建工厂

要初始化 `AppDatabase` 接口，您需要向其传递一个 `SqlDriver` 实例。
SQLDelight 提供了 SQLite 驱动程序的多个平台特定实现，因此您需要为每个平台单独创建这些实例。

虽然您可以使用 [预期接口和实际接口](multiplatform-expect-actual.md) 来实现这一点，
但在本项目中，您将使用 [Koin](https://insert-koin.io/) 来尝试 Kotlin Multiplatform 中的 SQL 注入。

1. 为数据库驱动程序创建一个接口。为此，在 `shared/src/commonMain/kotlin/com/jetbrains/spacetutorial/` 目录中，
   创建 `cache` 软件包。
2. 在 `cache` 软件包中创建 `DatabaseDriverFactory` 接口：

   ```kotlin
   package com.jetbrains.spacetutorial.cache
   
   import app.cash.sqldelight.db.SqlDriver

   interface DatabaseDriverFactory {
       fun createDriver(): SqlDriver
   }
   ```

3. 为 Android 创建实现此接口的类：在 `shared/src/androidMain/kotlin` 目录中，
   创建 `com.jetbrains.spacetutorial.cache` 软件包，然后在其中创建 `DatabaseDriverFactory.kt` 文件。
4. 在 Android 上，SQLite 驱动程序由 `AndroidSqliteDriver` 类实现。在 `DatabaseDriverFactory.kt` 文件中，
   将数据库信息和上下文链接传递给 `AndroidSqliteDriver` 类构造函数：

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

5. 对于 iOS，在 `shared/src/iosMain/kotlin/com/jetbrains/spacetutorial/` 目录中，创建 `cache` 软件包。
6. 在 `cache` 软件包内部，创建 `DatabaseDriverFactory.kt` 文件并添加以下代码：

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

稍后您将在项目的平台特定代码中实现这些驱动程序的实例。

### 实现缓存

到目前为止，您已经为平台数据库驱动程序添加了工厂，并添加了一个用于执行数据库操作的 `AppDatabase` 接口。
现在，创建一个 `Database` 类，它将包装 `AppDatabase` 接口并包含缓存逻辑。

1. 在公共源集 (common source set) `shared/src/commonMain/kotlin` 中，在 `com.jetbrains.spacetutorial.cache` 软件包下创建一个新的 `Database` 类。它将包含两个平台通用的逻辑。

2. 为了给 `AppDatabase` 提供驱动程序，将一个抽象的 `DatabaseDriverFactory` 实例传递给 `Database` 类构造函数：

   ```kotlin
   package com.jetbrains.spacetutorial.cache

   internal class Database(databaseDriverFactory: DatabaseDriverFactory) {
       private val database = AppDatabase(databaseDriverFactory.createDriver())
       private val dbQuery = database.appDatabaseQueries
   }
   ```

   该类的 [可见性](https://kotlinlang.org/docs/visibility-modifiers.html#class-members) 设置为 internal，这意味着它只能在多平台模块内部访问。

3. 在 `Database` 类中，实现一些数据处理操作。
   首先，创建 `getAllLaunches` 函数以返回所有火箭发射的列表。
   `mapLaunchSelecting` 函数用于将数据库查询的结果映射到 `RocketLaunch` 对象：

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

4. 添加 `clearAndCreateLaunches` 函数以清除数据库并插入新数据：

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

## 实现 API 服务

为了通过互联网检索数据，您将使用 [SpaceX 公开 API](https://github.com/r-spacex/SpaceX-API/tree/master/docs#rspacex-api-docs) 和一个从 `v5/launches` 端点检索所有发射列表的方法。

创建一个将应用程序连接到 API 的类：

1. 在 `shared/src/commonMain/kotlin/com/jetbrains/spacetutorial/` 目录中，创建一个 `network` 软件包。
2. 在 `network` 目录中，创建 `SpaceXApi` 类：

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

    此类执行网络请求并将 JSON 响应反序列化为 `com.jetbrains.spacetutorial.entity` 软件包中的实体。
    Ktor `HttpClient` 实例初始化并存储 `httpClient` 属性。 

    此代码使用 [`ContentNegotiation`](https://ktor.io/docs/serialization-client.html) Ktor 插件来反序列化 `GET` 请求的结果。该插件将请求和响应有效负载作为 JSON 处理，并根据需要对其进行序列化和反序列化。

3. 声明返回火箭发射列表的数据检索函数：

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

`getAllLaunches` 函数具有 `suspend` 修饰符，因为它包含对挂起函数 `HttpClient.get()` 的调用。
     `get()` 函数包含一个通过互联网检索数据的异步操作，并且只能从协程或另一个挂起函数中调用。网络请求将在 HTTP 客户端的线程池中执行。
   
发送 GET 请求的 URL 作为参数传递给 `get()` 函数。

## 构建 SDK

您的 iOS 和 Android 应用程序将通过共享模块与 SpaceX API 进行通信，共享模块将提供一个公共类 `SpaceXSDK`。

1. 在公共源集 (common source set) `shared/src/commonMain/kotlin` 中，在 `com.jetbrains.spacetutorial` 软件包中，创建 `SpaceXSDK` 类。
   此类将作为 `Database` 和 `SpaceXApi` 类的门面。

   要创建 `Database` 类实例，请提供一个 `DatabaseDriverFactory` 实例：

   ```kotlin
   package com.jetbrains.spacetutorial
   
   import com.jetbrains.spacetutorial.cache.Database
   import com.jetbrains.spacetutorial.cache.DatabaseDriverFactory
   import com.jetbrains.spacetutorial.network.SpaceXApi

   class SpaceXSDK(databaseDriverFactory: DatabaseDriverFactory, val api: SpaceXApi) { 
       private val database = Database(databaseDriverFactory)
   }
   ```

   您将通过 `SpaceXSDK` 类构造函数在平台特定代码中注入正确的数据库驱动程序。

2. 添加 `getLaunches` 函数，该函数使用创建的数据库和 API 来获取发射列表：

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

该类包含一个获取所有发射信息的函数。根据 `forceReload` 的值，它返回缓存的值，或者从互联网加载数据，然后用结果更新缓存。如果没有缓存数据，无论 `forceReload` 标志的值如何，它都会从互联网加载数据。

您的 SDK 客户端可以使用 `forceReload` 标志来加载有关发射的最新信息，从而为用户启用下拉刷新手势。

所有 Kotlin 异常都是非受检异常，而 Swift 只有受检错误（详见 [与 Swift/Objective-C 的互操作性](https://kotlinlang.org/docs/native-objc-interop.html#errors-and-exceptions)）。因此，为了让您的 Swift 代码意识到预期的异常，从 Swift 调用的 Kotlin 函数应标有 `@Throws` 注解，并指定潜在异常类的列表。

## 创建 Android 应用程序

IntelliJ IDEA 为您处理了初始 Gradle 配置，因此 `shared` 模块已经连接到了您的 Android 应用程序。

在实现 UI 和展示逻辑之前，请将所有需要的 UI 依赖项添加到 `composeApp/build.gradle.kts` 文件中：

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

提示时同步 Gradle 项目文件，或者按两次 <shortcut>Shift</shortcut> 并搜索 **Sync All Gradle, Swift Package Manager projects**。

### 添加互联网访问权限

要访问互联网，Android 应用程序需要相应的权限。
在 `composeApp/src/androidMain/AndroidManifest.xml` 文件中，添加 `<uses-permission>` 标记：

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <!--...-->
</manifest>
```

### 添加 SQL 注入

Koin SQL 注入允许您声明可在不同上下文中使用的模块（组件集）。
在本项目中，您将创建两个模块：一个用于 Android 应用程序，另一个用于 iOS 应用。
然后，您将使用相应的模块为每个原生 UI 启动 Koin。

声明一个包含 Android 应用组件的 Koin 模块：

1. 在 `composeApp/src/androidMain/kotlin` 目录中，在 `com.jetbrains.spacetutorial` 软件包中创建 `AppModule.kt` 文件。

   在该文件中，将模块声明为两个单例，一个用于 `SpaceXApi` 类，一个用于 `SpaceXSDK` 类：

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

   `SpaceXSDK` 类构造函数被注入了平台特定的 `AndroidDatabaseDriverFactory` 类。`get()` 函数解析模块内的依赖项：Koin 将传递之前声明的 `SpaceXApi` 单例，以代替 `SpaceXSDK()` 的 `api` 参数。

2. 创建一个自定义的 `Application` 类，该类将启动 Koin 模块。

   在 `AppModule.kt` 文件旁边，创建包含以下代码的 `Application.kt` 文件，并在 `modules()` 函数调用中指定您声明的模块：

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

3. 在 `AndroidManifest.xml` 文件的 `<application>` 标记中指定您创建的 `MainApplication` 类：

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

现在，您已准备好实现使用平台特定数据库驱动程序提供的信息的 UI。

### 准备带有发射列表的 View model

您将使用 Jetpack Compose 和 Material 3 实现 Android UI。首先，您将创建使用 SDK 获取发射列表的 View model。然后，您将设置 Material 主题，最后，您将编写将所有内容整合在一起的可组合函数 (composable function)。

1. 在 `composeApp/src/androidMain` 源集 (source set) 中，在 `com.jetbrains.spacetutorial` 软件包中创建 `RocketLaunchViewModel.kt` 文件：

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

   `RocketLaunchScreenState` 实例将存储从 SDK 接收的数据和请求的当前状态。

2. 添加 `loadLaunches` 函数，该函数将在该 View model 的协程作用域内调用 SDK 的 `getLaunches` 函数：

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

3. 然后在类的 `init {}` 块中添加 `loadLaunches()` 调用，以便在创建 `RocketLaunchViewModel` 对象后立即向 API 请求数据：

    ```kotlin
    class RocketLaunchViewModel(private val sdk: SpaceXSDK) : ViewModel() {
        // ...

        init {
            loadLaunches()
        }
    }
    ```

4. 现在，在 `AppModule.kt` 文件中，在 Koin 模块中指定 View model：

    ```kotlin
    import org.koin.core.module.dsl.viewModel
    
    val appModule = module {
        // ...
        viewModel { RocketLaunchViewModel(sdk = get()) }
    }
    ```

### 构建 Material Theme

您将围绕 Material Theme 提供的 `AppTheme` 函数构建主 `App()` 可组合项：

1. 您可以使用 [Material Theme Builder](https://m3.material.io/theme-builder#/custom) 为您的 Compose 应用生成主题。选择您的颜色、字体，然后点击右下角的 **Export theme**。
2. 在导出屏幕上，点击 **Export** 下拉菜单并选择 **Jetpack Compose (Theme.kt)** 选项。
3. 解压存档并将 `theme` 文件夹复制到 `composeApp/src/androidMain/kotlin/com/jetbrains/spacetutorial` 目录中。

   ![theme directory location](theme-directory.png){width=299}

4. 在 `theme` 软件包内的每个文件中，更改 `package` 行以引用您创建的软件包：

    ```kotlin
    package com.jetbrains.spacetutorial.theme
    ```

5. 在 `Color.kt` 文件中，为成功和不成功的发射添加两个颜色变量：

    ```kotlin
    val app_theme_successful = Color(0xff4BB543)
    val app_theme_unsuccessful = Color(0xffFC100D)
    ```

### 实现展示逻辑

为您的应用程序创建主 `App()` 可组合项，并从 `ComponentActivity` 类中调用它：

1. 打开 `com.jetbrains.spacetutorial` 软件包中 `theme` 目录旁边的 `App.kt` 文件，替换默认的 `App()` 可组合函数：

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

   这里，您使用了 [Koin ViewModel API](https://insert-koin.io/docs/%koinVersion%/reference/koin-compose/compose/#viewmodel-for-composable) 来引用您在 Android Koin 模块中声明的 `viewModel`。

2. 现在添加 UI 代码，它将实现加载屏幕、发射结果列以及下拉刷新操作：

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

   <!--3. Remove the `import App` line in the `MainActivity.kt` file in the `com.jetbrains.spacetutorial` package so that
      the `setContent()` function refers to the `App()` composable you just created in that package.-->
3. 最后，在 `AndroidManifest.xml` 文件的 `<activity>` 标记中指定您的 `MainActivity` 类：

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

4. 运行您的 Android 应用：从运行配置菜单中选择 **composeApp**，选择模拟器，然后点击运行按钮。该应用会自动运行 API 请求并显示发射列表（背景颜色取决于您生成的主题）：

   ![Android application](android-application.png){width=350}

您刚刚创建了一个 Android 应用程序，其业务逻辑在 Kotlin Multiplatform 模块中实现，UI 使用原生 Jetpack Compose 制作。

## 创建 iOS 应用程序

对于项目的 iOS 部分，您将利用 [SwiftUI](https://developer.apple.com/xcode/swiftui/) 构建用户界面，并使用 [Model View View-Model](https://en.wikipedia.org/wiki/Model–view–viewmodel) 模式。

IntelliJ IDEA 会生成一个已连接到共享模块的 iOS 项目。Kotlin 模块以 `shared/build.gradle.kts` 文件中指定的名称（`baseName = "Shared"`）导出，并使用常规的 `import` 语句导入：`import Shared`。

### 为 SQLDelight 添加动态链接标志

默认情况下，IntelliJ IDEA 生成的项目设置为静态链接 iOS 框架。

要在 iOS 上使用原生 SQLDelight 驱动程序，请添加动态链接器标志，以便 Xcode 工具能够找到系统提供的 SQLite 二进制文件：

1. 在 IntelliJ IDEA 中，选择 **File** | **Open Project in Xcode** 选项以在 Xcode 中打开您的项目。
2. 在 Xcode 中，双击项目名称以打开其设置。
3. 切换到 **Build Settings** 选项卡，在此处切换到 **All** 列表并搜索 **Other Linker Flags** 字段。
4. 展开该字段，点击 **Debug** 字段旁边的加号，并将 `-lsqlite3` 字符串粘贴到 **Any Architecture | Any SDK** 中。
5. 对 **Other Linker Flags** | **Release** 字段重复此过程。

![The result of correctly adding the linker flag to the Xcode project](xcode-other-linker-flags.png){width="434"}

### 为 iOS SQL 注入准备 Koin 类

要在 Swift 代码中使用 Koin 类和函数，请创建一个特殊的 `KoinComponent` 类并为 iOS 声明 Koin 模块。

1. 在 `shared/src/iosMain/kotlin/` 源集 (source set) 中，创建一个名为 `com/jetbrains/spacetutorial/KoinHelper.kt` 的文件（它将出现在 `cache` 文件夹旁边）。
2. 添加 `KoinHelper` 类，它将使用延迟 Koin 注入来包装 `SpaceXSDK` 类：

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

3. 在 `KoinHelper` 类下方，添加 `initKoin()` 函数，您将在 Swift 中使用它来初始化并启动 iOS Koin 模块：

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

现在，您可以在 iOS 应用中启动 Koin 模块，以便通过通用的 `SpaceXSDK` 类使用原生数据库驱动程序。

### 实现 UI

首先，您将创建一个 `RocketLaunchRow` SwiftUI 视图来显示列表中的一项。它将基于 `HStack` 和 `VStack` 视图。`RocketLaunchRow` 结构上将会有一些扩展，包含显示数据的有用帮助程序。

1. 在 IntelliJ IDEA 中，确保您处于 **Project** 视图中。
2. 在 `iosApp` 文件夹中，在 `ContentView.swift` 旁边创建一个新的 Swift 文件，并命名为 `RocketLaunchRow`。
3. 使用以下代码更新 `RocketLaunchRow.swift` 文件：

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

   发射列表将显示在项目中已包含的 `ContentView` 视图中。

4. 为 `ContentView` 类创建一个扩展，带有一个 `ViewModel` 类，该类将准备和管理数据。将以下代码添加到 `ContentView.swift` 文件中：

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

    View model (`ContentView.ViewModel`) 通过 [Combine 框架](https://developer.apple.com/documentation/combine) 与视图 (`ContentView`) 连接：
    * `ContentView.ViewModel` 类被声明为 `ObservableObject`。
    * `@Published` 属性用于 `launches` 属性，因此每当此属性更改时，View model 都会发出信号。

5. 移除 `ContentView_Previews` 结构：您不需要实现一个必须与您的 View model 兼容的预览。

6. 更新 `ContentView` 类的正文以显示发射列表并添加重新加载功能。

   * 这是 UI 基础工作：您将在教程的下一阶段实现 `loadLaunches` 函数。
   * `viewModel` 属性标有 `@ObservedObject` 属性，以订阅 View model。

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

7. `RocketLaunch` 类用作初始化 `List` 视图的参数，因此它需要 [遵循 `Identifiable` 协议](https://developer.apple.com/documentation/swift/identifiable)。该类已经有一个名为 `id` 的属性，因此您只需在 `ContentView.swift` 底部添加一个扩展：

    ```Swift
    extension RocketLaunch: Identifiable { }
    ```

### 加载数据

要在 View model 中检索有关火箭发射的数据，您需要多平台库中 `KoinHelper` 类的一个实例。它将允许您使用正确的数据库驱动程序调用 SDK 函数。

1. 在 `ContentView.swift` 文件中，扩展 `ViewModel` 类以包含 `KoinHelper` 对象和 `loadLaunches` 函数：

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

2. 调用 `KoinHelper.getLaunches()` 函数（它将代理对 `SpaceXSDK` 类的调用）并将结果保存在 `launches` 属性中：

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

    当您将 Kotlin 模块编译为 Apple 框架时，可以使用 Swift 的 `async`/`await` 机制调用 [挂起函数](https://kotlinlang.org/docs/whatsnew14.html#support-for-kotlin-s-suspending-functions-in-swift-and-objective-c)。
   
    由于 `getLaunches` 函数在 Kotlin 中标有 `@Throws(Exception::class)` 注解，因此任何作为 `Exception` 类或其子类实例的异常都将作为 `NSError` 传播到 Swift。因此，所有此类异常都可以由 `loadLaunches()` 函数捕获。

3. 转到应用的入口点 `iOSApp.swift` 文件，并初始化 Koin 模块、视图和 View model：

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

4. 在 IntelliJ IDEA 中，切换到 **iosApp** 配置，选择模拟器，然后运行它以查看结果：

![iOS Application](ios-application.png){width=350}

> 您可以在 [`final` 分支上](https://github.com/kotlin-hands-on/kmm-networking-and-data-storage/tree/final) 找到该项目的最终版本。
>
{style="note"}

## 下一步是什么？

本教程包含一些可能耗费资源的操作，例如在主线程中解析 JSON 和向数据库发出请求。要了解如何编写并发代码并优化您的应用，请参阅 [协程指南](https://kotlinlang.org/docs/coroutines-guide.html)。

您还可以查看这些额外的学习材料：

* [在多平台项目中使用 Ktor HTTP 客户端](https://ktor.io/docs/http-client-engines.html#mpp-config)
* [阅读有关 Koin 和 SQL 注入的内容](https://insert-koin.io/docs/setup/why)
* [让您的 Android 应用程序在 iOS 上运行](multiplatform-integrate-in-existing-app.md)
* [详细了解多平台项目结构](multiplatform-discover-project.md)。