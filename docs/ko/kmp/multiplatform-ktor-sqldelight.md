[//]: # (title: Ktor 및 SQLDelight를 사용하여 멀티플랫폼 앱 만들기)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

<tldr>
<p>이 튜토리얼은 IntelliJ IDEA를 사용하지만, Android Studio에서도 따라 할 수 있습니다. 두 IDE 모두 동일한 핵심 기능과 Kotlin 멀티플랫폼 지원을 공유합니다.</p>
</tldr>

이 튜토리얼은 IntelliJ IDEA를 사용하여 Kotlin 멀티플랫폼(Kotlin Multiplatform)으로 iOS 및 Android용 고급 모바일 애플리케이션을 제작하는 방법을 보여줍니다.
이 애플리케이션은 다음 작업을 수행합니다:

* Ktor를 사용하여 공용 [SpaceX API](https://docs.spacexdata.com/?version=latest)에서 인터넷을 통해 데이터를 가져옵니다.
* SQLDelight를 사용하여 로컬 데이터베이스에 데이터를 저장합니다.
* SpaceX 로켓 발사 목록과 함께 발사일, 결과 및 상세 설명을 표시합니다.

애플리케이션에는 iOS와 Android 플랫폼 모두에서 공유되는 코드가 포함된 모듈이 포함됩니다. 비즈니스 로직과 데이터 액세스 계층은 공유 모듈(shared module)에서 한 번만 구현되는 반면, 두 애플리케이션의 UI는 네이티브로 구현됩니다.

![에뮬레이터 및 시뮬레이터](android-and-ios.png){width=600}

프로젝트에서 다음 멀티플랫폼 라이브러리를 사용하게 됩니다:

* [Ktor](https://ktor.io/docs/create-client.html): 인터넷에서 데이터를 가져오기 위한 HTTP 클라이언트.
* [`kotlinx.serialization`](https://github.com/Kotlin/kotlinx.serialization): JSON 응답을 엔티티 클래스의 객체로 역직렬화(deserialize).
* [`kotlinx.coroutines`](https://github.com/Kotlin/kotlinx.coroutines): 비동기 코드 작성.
* [SQLDelight](https://github.com/cashapp/sqldelight): SQL 쿼리에서 Kotlin 코드를 생성하고 타입 안정성(type-safe)이 보장되는 데이터베이스 API 생성.
* [Koin](https://insert-koin.io/): 의존성 주입(dependency injection)을 통해 플랫폼별 데이터베이스 드라이버 제공.

> GitHub 저장소에서 [템플릿 프로젝트](https://github.com/kotlin-hands-on/kmm-networking-and-data-storage)와 [최종 애플리케이션](https://github.com/kotlin-hands-on/kmm-networking-and-data-storage/tree/final)의 소스 코드를 찾을 수 있습니다.
>
{style="note"}

## 프로젝트 생성하기

1. [빠른 시작(quickstart)](quickstart.md)의 안내에 따라 [Kotlin 멀티플랫폼 개발을 위한 환경 설정](quickstart.md#set-up-the-environment)을 완료하세요.
2. IntelliJ IDEA에서 **File** | **New** | **Project**를 선택합니다.
3. 왼쪽 패널에서 **Kotlin Multiplatform**을 선택합니다(Android Studio의 경우 **New Project** 마법사의 **Generic** 탭에서 템플릿을 찾을 수 있습니다).
4. **New Project** 창에서 다음 필드를 지정합니다:

   * **Name**: SpaceTutorial
   * **Group**: com.jetbrains
   * **Artifact**: spacetutorial

   ![Ktor 및 SQLDelight 멀티플랫폼 프로젝트 생성](create-ktor-sqldelight-multiplatform-project.png){width=800}

5. **Android** 및 **iOS** 대상을 선택합니다.
6. iOS의 경우 **Do not share UI** 옵션을 선택합니다. 두 플랫폼 모두 네이티브 UI를 구현할 것입니다.
7. 모든 필드와 대상을 지정했으면 **Create**를 클릭합니다.

## Gradle 의존성 추가하기

공유 모듈에 멀티플랫폼 라이브러리를 추가하려면 `build.gradle.kts` 파일의 관련 소스 세트(source sets) 내 `dependencies {}` 블록에 의존성 지침(`implementation`)을 추가해야 합니다.

`kotlinx.serialization`과 SQLDelight 라이브러리는 추가 구성이 필요합니다.

필요한 모든 의존성을 반영하도록 `gradle/libs.versions.toml` 파일의 버전 카탈로그에서 줄을 변경하거나 추가하세요:

1. `[versions]` 블록에서 AGP 버전을 확인하고 나머지를 추가합니다:

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

2. `[libraries]` 블록에 다음 라이브러리 참조를 추가합니다:

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

3. `[plugins]` 블록에 필요한 Gradle 플러그인을 지정합니다:

   ```
   [plugins]
   ...
   kotlinxSerialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
   sqldelight = { id = "app.cash.sqldelight", version.ref = "sqlDelight" }
   ```

4. 의존성이 추가되면 프로젝트를 다시 동기화하라는 메시지가 표시됩니다. **Sync Gradle Changes** 버튼을 클릭하여 Gradle 파일을 동기화합니다: ![Gradle 파일 동기화](gradle-sync.png){width=50}

5. `shared/build.gradle.kts` 파일의 맨 처음에 있는 `plugins {}` 블록에 다음 줄을 추가합니다:

   ```kotlin
   plugins {
       // ...
       alias(libs.plugins.kotlinxSerialization)
       alias(libs.plugins.sqldelight)
   }
   ```

6. 공통 소스 세트(common source set)에는 각 라이브러리의 코어 아티팩트와 네트워크 요청 및 응답 처리를 위해 `kotlinx.serialization`을 사용하는 Ktor [직렬화 기능](https://ktor.io/docs/serialization-client.html)이 필요합니다.
    또한 iOS 및 Android 소스 세트에는 SQLDelight 및 Ktor 플랫폼 드라이버가 필요합니다.

    동일한 `shared/build.gradle.kts` 파일에 필요한 모든 의존성을 추가합니다:

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

7. `sourceSets` 블록의 시작 부분에서 표준 Kotlin 라이브러리의 실험적 시간 API(experimental time API)를 옵트인(opt-in)합니다:

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

8. 의존성이 추가되면 다시 한 번 **Sync Gradle Changes** 버튼을 클릭하여 Gradle 파일을 동기화합니다.

Gradle 동기화가 끝나면 프로젝트 구성이 완료되어 코드 작성을 시작할 수 있습니다.

> 멀티플랫폼 의존성에 대한 자세한 가이드는 [Kotlin 멀티플랫폼 라이브러리 의존성](multiplatform-add-dependencies.md)을 참조하세요.
>
{style="tip"}

## 애플리케이션 데이터 모델 생성하기

튜토리얼 앱에는 네트워킹 및 캐시 서비스에 대한 퍼사드(facade)로 공용 `SpaceXSDK` 클래스가 포함됩니다.
애플리케이션 데이터 모델은 다음을 포함하는 세 개의 엔티티 클래스를 갖습니다:

* 발사에 대한 일반 정보
* 미션 패치 이미지 링크
* 발사 관련 기사의 URL

> 이 튜토리얼이 끝날 때까지 이 모든 데이터가 UI에 표시되지는 않습니다.
> 우리는 직렬화를 보여주기 위해 데이터 모델을 사용하고 있습니다.
> 하지만 링크와 패치를 활용하여 더 유익한 정보를 제공하도록 예제를 직접 확장해 볼 수 있습니다!
>
{style="note"}

필요한 데이터 클래스를 생성합니다:

1. `shared/src/commonMain/kotlin/com/jetbrains/spacetutorial` 디렉토리에 `entity` 패키지를 생성한 다음, 해당 패키지 안에 `Entity.kt` 파일을 생성합니다.
2. 기본 엔티티에 대한 모든 데이터 클래스를 선언합니다:

   ```kotlin
   
   ```

각 직렬화 가능한 클래스는 `@Serializable` 어노테이션을 표시해야 합니다. `kotlinx.serialization` 플러그인은 어노테이션 인자에 직렬화기(serializer) 링크를 명시적으로 전달하지 않는 한 `@Serializable` 클래스에 대한 기본 직렬화기를 자동으로 생성합니다.

`@SerialName` 어노테이션을 사용하면 필드 이름을 재정의할 수 있으며, 이는 데이터 클래스에서 더 읽기 쉬운 식별자를 사용하여 속성에 액세스하는 데 도움이 됩니다.

## SQLDelight 구성 및 캐시 로직 구현

### SQLDelight 구성

SQLDelight 라이브러리를 사용하면 SQL 쿼리에서 타입 안정성이 보장되는 Kotlin 데이터베이스 API를 생성할 수 있습니다. 컴파일 중에 생성기(generator)는 SQL 쿼리를 검증하고 이를 공유 모듈에서 사용할 수 있는 Kotlin 코드로 변환합니다.

SQLDelight 의존성은 이미 프로젝트에 포함되어 있습니다. 라이브러리를 구성하려면 `shared/build.gradle.kts` 파일을 열고 끝에 `sqldelight {}` 블록을 추가합니다. 이 블록에는 데이터베이스 목록과 해당 매개변수가 포함됩니다:

```kotlin
sqldelight {
    databases {
        create("AppDatabase") {
            packageName.set("com.jetbrains.spacetutorial.cache")
        }
    }
}
```

`packageName` 매개변수는 생성된 Kotlin 소스의 패키지 이름을 지정합니다.

메시지가 표시되면 Gradle 프로젝트 파일을 동기화하거나, <shortcut>Shift</shortcut>를 두 번 누르고 **Sync All Gradle, Swift Package Manager projects**를 검색합니다.

> `.sq` 파일을 작업하려면 공식 [SQLDelight 플러그인](https://plugins.jetbrains.com/plugin/8191-sqldelight)을 설치하는 것이 좋습니다.
>
{style="tip"}

### 데이터베이스 API 생성

먼저 필요한 모든 SQL 쿼리가 포함된 `.sq` 파일을 만듭니다. 기본적으로 SQLDelight 플러그인은 소스 세트의 `sqldelight` 폴더에서 `.sq` 파일을 찾습니다:

1. `shared/src/commonMain` 디렉토리에 새로운 `sqldelight` 디렉토리를 생성합니다.
2. `sqldelight` 디렉토리 안에 패키지를 위한 중첩 디렉토리를 생성하기 위해 `com/jetbrains/spacetutorial/cache`라는 이름의 새 디렉토리를 생성합니다.
3. `cache` 디렉토리 안에 `AppDatabase.sq` 파일을 생성합니다(`build.gradle.kts` 파일에 지정한 데이터베이스와 동일한 이름).
   애플리케이션을 위한 모든 SQL 쿼리가 이 파일에 저장됩니다.
4. 데이터베이스에는 발사 데이터가 포함된 테이블이 있습니다.
   테이블 생성을 위한 다음 코드를 `AppDatabase.sq` 파일에 추가합니다:

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

5. 테이블에 데이터를 삽입하기 위한 `insertLaunch` 함수를 추가합니다:

   ```text
   insertLaunch:
   INSERT INTO Launch(flightNumber, missionName, details, launchSuccess, launchDateUTC, patchUrlSmall, patchUrlLarge, articleUrl)
   VALUES(?, ?, ?, ?, ?, ?, ?, ?);
   ```

6. 테이블의 데이터를 삭제하기 위한 `removeAllLaunches` 함수를 추가합니다:

   ```text
   removeAllLaunches:
   DELETE FROM Launch;
   ```

7. 데이터를 조회하기 위한 `selectAllLaunchesInfo` 함수를 선언합니다:

   ```text
   selectAllLaunchesInfo:
   SELECT Launch.*
   FROM Launch;
   ```
8. 해당 `AppDatabase` 인터페이스를 생성합니다(나중에 데이터베이스 드라이버로 초기화할 것입니다).
   이를 위해 터미널에서 다음 명령을 실행합니다:

   ```shell
   ./gradlew generateCommonMainAppDatabaseInterface
   ```

   생성된 Kotlin 코드는 `shared/build/generated/sqldelight` 디렉토리에 저장됩니다.

### 플랫폼별 데이터베이스 드라이버용 팩토리 생성

`AppDatabase` 인터페이스를 초기화하려면 `SqlDriver` 인스턴스를 전달해야 합니다.
SQLDelight는 SQLite 드라이버의 여러 플랫폼별 구현을 제공하므로, 각 플랫폼에 대해 이러한 인스턴스를 별도로 생성해야 합니다.

[expected 및 actual 인터페이스](multiplatform-expect-actual.md)를 사용하여 이를 달성할 수 있지만, 이 프로젝트에서는 Kotlin 멀티플랫폼에서 의존성 주입을 시도해 보기 위해 [Koin](https://insert-koin.io/)을 사용할 것입니다.

1. 데이터베이스 드라이버용 인터페이스를 만듭니다. 이를 위해 `shared/src/commonMain/kotlin/com/jetbrains/spacetutorial/` 디렉토리에 `cache` 패키지를 생성합니다.
2. `cache` 패키지 안에 `DatabaseDriverFactory` 인터페이스를 생성합니다:

   ```kotlin
   package com.jetbrains.spacetutorial.cache
   
   import app.cash.sqldelight.db.SqlDriver

   interface DatabaseDriverFactory {
       fun createDriver(): SqlDriver
   }
   ```

3. Android용으로 이 인터페이스를 구현하는 클래스를 생성합니다: `shared/src/androidMain/kotlin` 디렉토리에 `com.jetbrains.spacetutorial.cache` 패키지를 생성한 다음, 그 안에 `DatabaseDriverFactory.kt` 파일을 생성합니다.
4. Android에서 SQLite 드라이버는 `AndroidSqliteDriver` 클래스에 의해 구현됩니다. `DatabaseDriverFactory.kt` 파일에서 데이터베이스 정보와 컨텍스트 링크를 `AndroidSqliteDriver` 클래스 생성자에 전달합니다:

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

5. iOS의 경우, `shared/src/iosMain/kotlin/com/jetbrains/spacetutorial/` 디렉토리에 `cache` 패키지를 생성합니다.
6. `cache` 패키지 안에 `DatabaseDriverFactory.kt` 파일을 생성하고 다음 코드를 추가합니다:

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

나중에 프로젝트의 플랫폼별 코드에서 이러한 드라이버의 인스턴스를 구현할 것입니다.

### 캐시 구현

지금까지 플랫폼 데이터베이스 드라이버용 팩토리와 데이터베이스 작업을 수행하기 위한 `AppDatabase` 인터페이스를 추가했습니다.
이제 `AppDatabase` 인터페이스를 래핑하고 캐싱 로직을 포함할 `Database` 클래스를 생성합니다.

1. 공통 소스 세트 `shared/src/commonMain/kotlin`에서 `com.jetbrains.spacetutorial.cache` 패키지에 새로운 `Database` 클래스를 생성합니다. 이 클래스에는 두 플랫폼 모두에 공통적인 로직이 포함됩니다.

2. `AppDatabase`용 드라이버를 제공하려면 추상 `DatabaseDriverFactory` 인스턴스를 `Database` 클래스 생성자에 전달합니다:

   ```kotlin
   package com.jetbrains.spacetutorial.cache

   internal class Database(databaseDriverFactory: DatabaseDriverFactory) {
       private val database = AppDatabase(databaseDriverFactory.createDriver())
       private val dbQuery = database.appDatabaseQueries
   }
   ```

   이 클래스의 [가시성(visibility)](https://kotlinlang.org/docs/visibility-modifiers.html#class-members)은 internal로 설정되어 있으며, 이는 멀티플랫폼 모듈 내에서만 액세스할 수 있음을 의미합니다.

3. `Database` 클래스 내부에서 일부 데이터 처리 작업을 구현합니다.
   먼저 모든 로켓 발사 목록을 반환하는 `getAllLaunches` 함수를 만듭니다.
   `mapLaunchSelecting` 함수는 데이터베이스 쿼리 결과를 `RocketLaunch` 객체로 매핑하는 데 사용됩니다:

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

4. 데이터베이스를 지우고 새로운 데이터를 삽입하는 `clearAndCreateLaunches` 함수를 추가합니다:

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

## API 서비스 구현

인터넷에서 데이터를 가져오기 위해 [SpaceX 공용 API](https://github.com/r-spacex/SpaceX-API/tree/master/docs#rspacex-api-docs)를 사용하고, `v5/launches` 엔드포인트에서 모든 발사 목록을 가져오는 단일 메서드를 사용합니다.

애플리케이션을 API에 연결할 클래스를 생성합니다:

1. `shared/src/commonMain/kotlin/com/jetbrains/spacetutorial/` 디렉토리에 `network` 패키지를 생성합니다.
2. `network` 디렉토리 안에 `SpaceXApi` 클래스를 생성합니다:

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

    이 클래스는 네트워크 요청을 실행하고 JSON 응답을 `com.jetbrains.spacetutorial.entity` 패키지의 엔티티로 역직렬화합니다.
    Ktor `HttpClient` 인스턴스는 `httpClient` 속성을 초기화하고 저장합니다.

    이 코드는 `GET` 요청의 결과를 역직렬화하기 위해 [`ContentNegotiation`](https://ktor.io/docs/serialization-client.html) Ktor 플러그인을 사용합니다. 플러그인은 요청 및 응답 페이로드를 JSON으로 처리하여 필요에 따라 직렬화 및 역직렬화합니다.

3. 로켓 발사 목록을 반환하는 데이터 가져오기 함수를 선언합니다:

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

`getAllLaunches` 함수는 suspend 함수 `HttpClient.get()`을 호출하므로 `suspend` 수정자가 있습니다.
     `get()` 함수는 인터넷을 통해 데이터를 가져오는 비동기 작업을 포함하며, 코루틴이나 다른 suspend 함수에서만 호출할 수 있습니다. 네트워크 요청은 HTTP 클라이언트의 스레드 풀에서 실행됩니다.
   
GET 요청을 보내기 위한 URL은 `get()` 함수의 인자로 전달됩니다.

## SDK 구축하기

iOS 및 Android 애플리케이션은 공유 모듈을 통해 SpaceX API와 통신하며, 공유 모듈은 공용 클래스인 `SpaceXSDK`를 제공합니다.

1. 공통 소스 세트 `shared/src/commonMain/kotlin`의 `com.jetbrains.spacetutorial` 패키지에 `SpaceXSDK` 클래스를 생성합니다.
   이 클래스는 `Database` 및 `SpaceXApi` 클래스에 대한 퍼사드 역할을 합니다.

   `Database` 클래스 인스턴스를 생성하려면 `DatabaseDriverFactory` 인스턴스를 제공해야 합니다:

   ```kotlin
   package com.jetbrains.spacetutorial
   
   import com.jetbrains.spacetutorial.cache.Database
   import com.jetbrains.spacetutorial.cache.DatabaseDriverFactory
   import com.jetbrains.spacetutorial.network.SpaceXApi

   class SpaceXSDK(databaseDriverFactory: DatabaseDriverFactory, val api: SpaceXApi) { 
       private val database = Database(databaseDriverFactory)
   }
   ```

   `SpaceXSDK` 클래스 생성자를 통해 플랫폼별 코드에서 올바른 데이터베이스 드라이버를 주입할 것입니다.

2. 생성된 데이터베이스와 API를 사용하여 발사 목록을 가져오는 `getLaunches` 함수를 추가합니다:

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

이 클래스에는 모든 발사 정보를 가져오기 위한 하나의 함수가 포함되어 있습니다. `forceReload` 값에 따라 캐시된 값을 반환하거나 인터넷에서 데이터를 로드한 후 그 결과로 캐시를 업데이트합니다. 캐시된 데이터가 없으면 `forceReload` 플래그 값에 관계없이 인터넷에서 데이터를 로드합니다.

SDK 클라이언트는 발사에 대한 최신 정보를 로드하기 위해 `forceReload` 플래그를 사용하여 사용자에게 당겨서 새로고침(pull-to-refresh) 제스처를 제공할 수 있습니다.

모든 Kotlin 예외는 언체크 예외(unchecked)인 반면, Swift에는 체크 예외(checked)만 있습니다(자세한 내용은 [Swift/Objective-C와의 상호 운용성](https://kotlinlang.org/docs/native-objc-interop.html#errors-and-exceptions)을 참조하세요). 따라서 Swift 코드에서 예상되는 예외를 인식할 수 있도록 Swift에서 호출되는 Kotlin 함수에는 잠재적인 예외 클래스 목록을 지정하는 `@Throws` 어노테이션을 표시해야 합니다.

## Android 애플리케이션 생성하기

IntelliJ IDEA가 초기 Gradle 구성을 처리해 주므로, `shared` 모듈은 이미 Android 애플리케이션에 연결되어 있습니다.

UI 및 프레젠테이션 로직을 구현하기 전에 `composeApp/build.gradle.kts` 파일에 필요한 모든 UI 의존성을 추가합니다:

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

메시지가 표시되면 Gradle 프로젝트 파일을 동기화하거나, <shortcut>Shift</shortcut>를 두 번 누르고 **Sync All Gradle, Swift Package Manager projects**를 검색합니다.

### 인터넷 액세스 권한 추가

인터넷에 액세스하려면 Android 애플리케이션에 적절한 권한이 필요합니다.
`composeApp/src/androidMain/AndroidManifest.xml` 파일에 `<uses-permission>` 태그를 추가합니다:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <!--...-->
</manifest>
```

### 의존성 주입 추가

Koin 의존성 주입을 사용하면 다양한 컨텍스트에서 사용할 수 있는 모듈(컴포넌트 세트)을 선언할 수 있습니다.
이 프로젝트에서는 Android 애플리케이션용과 iOS 앱용으로 두 개의 모듈을 생성합니다.
그런 다음 해당 모듈을 사용하여 각 네이티브 UI에 대해 Koin을 시작합니다.

Android 앱용 컴포넌트를 포함할 Koin 모듈을 선언합니다:

1. `composeApp/src/androidMain/kotlin` 디렉토리의 `com.jetbrains.spacetutorial` 패키지에 `AppModule.kt` 파일을 생성합니다.

   해당 파일에서 모듈을 두 개의 [싱글톤](https://insert-koin.io/docs/reference/koin-core/definitions#defining-a-singleton)으로 선언합니다. 하나는 `SpaceXApi` 클래스용이고 다른 하나는 `SpaceXSDK` 클래스용입니다:

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

   `SpaceXSDK` 클래스 생성자에는 플랫폼별 `AndroidDatabaseDriverFactory` 클래스가 주입됩니다.
   `get()` 함수는 모듈 내의 의존성을 해결합니다. `SpaceXSDK()`의 `api` 매개변수 위치에 Koin은 앞에서 선언한 `SpaceXApi` 싱글톤을 전달합니다.

2. Koin 모듈을 시작할 커스텀 `Application` 클래스를 생성합니다.

   `AppModule.kt` 파일 옆에 `Application.kt` 파일을 만들고 다음 코드를 추가합니다. `modules()` 함수 호출 시 선언한 모듈을 지정합니다:

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

3. `AndroidManifest.xml` 파일의 `<application>` 태그에 생성한 `MainApplication` 클래스를 지정합니다:

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

이제 플랫폼별 데이터베이스 드라이버가 제공하는 정보를 사용하는 UI를 구현할 준비가 되었습니다.

### 발사 목록을 포함하는 뷰 모델 준비

Jetpack Compose 및 Material 3를 사용하여 Android UI를 구현합니다. 먼저 SDK를 사용하여 발사 목록을 가져오는 뷰 모델(view model)을 만듭니다. 그런 다음 Material 테마를 설정하고 마지막으로 모든 것을 하나로 묶는 컴포저블(composable) 함수를 작성합니다.

1. `composeApp/src/androidMain` 소스 세트의 `com.jetbrains.spacetutorial` 패키지에 `RocketLaunchViewModel.kt` 파일을 생성합니다:

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

   `RocketLaunchScreenState` 인스턴스는 SDK에서 수신한 데이터와 요청의 현재 상태를 저장합니다.

2. 이 뷰 모델의 코루틴 스코프에서 SDK의 `getLaunches` 함수를 호출할 `loadLaunches` 함수를 추가합니다:

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

3. 그런 다음 `RocketLaunchViewModel` 객체가 생성되는 즉시 API에서 데이터를 요청하도록 클래스의 `init {}` 블록에 `loadLaunches()` 호출을 추가합니다:

    ```kotlin
    class RocketLaunchViewModel(private val sdk: SpaceXSDK) : ViewModel() {
        // ...

        init {
            loadLaunches()
        }
    }
    ```

4. 이제 `AppModule.kt` 파일에서 Koin 모듈에 뷰 모델을 지정합니다:

    ```kotlin
    import org.koin.core.module.dsl.viewModel
    
    val appModule = module {
        // ...
        viewModel { RocketLaunchViewModel(sdk = get()) }
    }
    ```

### Material Theme 구축

Material 테마에서 제공하는 `AppTheme` 함수를 중심으로 메인 `App()` 컴포저블을 구축합니다:

1. [Material Theme Builder](https://m3.material.io/theme-builder#/custom)를 사용하여 Compose 앱용 테마를 생성할 수 있습니다.
   색상과 글꼴을 선택한 다음 오른쪽 하단 모서리에 있는 **Export theme**를 클릭합니다.
2. 내보내기 화면에서 **Export** 드롭다운을 클릭하고 **Jetpack Compose (Theme.kt)** 옵션을 선택합니다.
3. 아카이브의 압축을 풀고 `theme` 폴더를 `composeApp/src/androidMain/kotlin/com/jetbrains/spacetutorial` 디렉토리에 복사합니다.

   ![theme 디렉토리 위치](theme-directory.png){width=299}

4. `theme` 패키지 내부의 각 파일에서 `package` 줄을 생성한 패키지를 참조하도록 변경합니다:

    ```kotlin
    package com.jetbrains.spacetutorial.theme
    ```

5. `Color.kt` 파일에 성공 및 실패한 발사에 사용할 색상 변수 두 개를 추가합니다:

    ```kotlin
    val app_theme_successful = Color(0xff4BB543)
    val app_theme_unsuccessful = Color(0xffFC100D)
    ```

### 프레젠테이션 로직 구현

애플리케이션을 위한 메인 `App()` 컴포저블을 만들고 `ComponentActivity` 클래스에서 호출합니다:

1. `com.jetbrains.spacetutorial` 패키지의 `theme` 디렉토리 옆에 있는 `App.kt` 파일을 열고 기본 `App()` 컴포저블 함수를 교체합니다:

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

   여기서는 [Koin ViewModel API](https://insert-koin.io/docs/%koinVersion%/reference/koin-compose/compose/#viewmodel-for-composable)를 사용하여 Android Koin 모듈에서 선언한 `viewModel`을 참조합니다.

2. 이제 로딩 화면, 발사 결과 컬럼 및 당겨서 새로고침 동작을 구현하는 UI 코드를 추가합니다:

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

3. 마지막으로 `AndroidManifest.xml` 파일의 `<activity>` 태그에 `MainActivity` 클래스를 지정합니다:

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

4. Android 앱을 실행합니다: 실행 구성 메뉴에서 **composeApp**을 선택하고 에뮬레이터를 선택한 다음 실행 버튼을 클릭합니다.
   앱은 자동으로 API 요청을 실행하고 발사 목록을 표시합니다(배경색은 생성한 Material 테마에 따라 다릅니다):

   ![Android 애플리케이션](android-application.png){width=350}

방금 비즈니스 로직은 Kotlin 멀티플랫폼 모듈에 구현되고 UI는 네이티브 Jetpack Compose를 사용하여 만든 Android 애플리케이션을 생성했습니다.

## iOS 애플리케이션 생성하기

프로젝트의 iOS 부분에서는 [SwiftUI](https://developer.apple.com/xcode/swiftui/)를 사용하여 사용자 인터페이스를 빌드하고 [Model View View-Model(MVVM)](https://en.wikipedia.org/wiki/Model–view–viewmodel) 패턴을 사용합니다.

IntelliJ IDEA는 이미 공유 모듈에 연결된 iOS 프로젝트를 생성합니다. Kotlin 모듈은 `shared/build.gradle.kts` 파일에 지정된 이름(`baseName = "Shared"`)으로 내보내지며, 일반적인 `import` 문인 `import Shared`를 사용하여 가져옵니다.

### SQLDelight용 동적 연결 플래그 추가

기본적으로 IntelliJ IDEA는 iOS 프레임워크의 정적 연결(static linking)로 설정된 프로젝트를 생성합니다.

iOS에서 네이티브 SQLDelight 드라이버를 사용하려면 Xcode 도구가 시스템 제공 SQLite 바이너리를 찾을 수 있도록 하는 동적 링커 플래그를 추가해야 합니다:

1. IntelliJ IDEA에서 **File** | **Open Project in Xcode** 옵션을 선택하여 Xcode에서 프로젝트를 엽니다.
2. Xcode에서 프로젝트 이름을 더블 클릭하여 설정을 엽니다.
3. **Build Settings** 탭으로 전환하고, **All** 목록으로 전환한 다음 **Other Linker Flags** 필드를 검색합니다.
4. 필드를 확장하고 **Debug** 필드 옆의 더하기 기호를 누른 다음 `-lsqlite3` 문자열을 **Any Architecture | Any SDK**에 붙여넣습니다.
5. **Other Linker Flags** | **Release** 필드에 대해서도 이 프로세스를 반복합니다.

![Xcode 프로젝트에 링커 플래그를 올바르게 추가한 결과](xcode-other-linker-flags.png){width="434"}

### iOS 의존성 주입을 위한 Koin 클래스 준비

Swift 코드에서 Koin 클래스와 함수를 사용하려면 특별한 `KoinComponent` 클래스를 만들고 iOS용 Koin 모듈을 선언합니다.

1. `shared/src/iosMain/kotlin/` 소스 세트에서 `com/jetbrains/spacetutorial/KoinHelper.kt`라는 이름으로 파일을 생성합니다(`cache` 폴더 옆에 나타납니다).
2. 지연된 Koin 주입(lazy Koin injection)으로 `SpaceXSDK` 클래스를 래핑할 `KoinHelper` 클래스를 추가합니다:

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

3. `KoinHelper` 클래스 아래에 iOS Koin 모듈을 초기화하고 시작하기 위해 Swift에서 사용할 `initKoin()` 함수를 추가합니다:

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

이제 iOS 앱에서 Koin 모듈을 시작하여 공통 `SpaceXSDK` 클래스와 함께 네이티브 데이터베이스 드라이버를 사용할 수 있습니다.

### UI 구현

먼저 목록의 항목을 표시하기 위한 `RocketLaunchRow` SwiftUI 뷰를 만듭니다. 이는 `HStack` 및 `VStack` 뷰를 기반으로 합니다. `RocketLaunchRow` 구조체에는 데이터를 표시하는 데 유용한 헬퍼가 포함된 익스텐션(extension)이 있습니다.

1. IntelliJ IDEA에서 **Project** 보기인지 확인합니다.
2. `iosApp` 폴더의 `ContentView.swift` 옆에 `RocketLaunchRow`라는 이름의 새로운 Swift 파일을 생성합니다.
3. `RocketLaunchRow.swift` 파일을 다음 코드로 업데이트합니다:

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

   발사 목록은 프로젝트에 이미 포함된 `ContentView` 뷰에 표시됩니다.

4. 데이터를 준비하고 관리할 `ViewModel` 클래스를 포함하는 `ContentView` 클래스의 익스텐션을 만듭니다.
   `ContentView.swift` 파일에 다음 코드를 추가합니다:

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

    뷰 모델(`ContentView.ViewModel`)은 [Combine 프레임워크](https://developer.apple.com/documentation/combine)를 통해 뷰(`ContentView`)와 연결됩니다:
    * `ContentView.ViewModel` 클래스는 `ObservableObject`로 선언됩니다.
    * `launches` 속성에는 `@Published` 속성이 사용되므로, 이 속성이 변경될 때마다 뷰 모델에서 신호를 보냅니다.

5. `ContentView_Previews` 구조체를 제거합니다. 뷰 모델과 호환되어야 하는 프리뷰는 구현할 필요가 없습니다.

6. 발사 목록을 표시하고 새로고침 기능을 추가하도록 `ContentView` 클래스의 본문을 업데이트합니다.

   * 이는 UI 기초 작업입니다. 다음 단계에서 `loadLaunches` 함수를 구현할 것입니다.
   * `viewModel` 속성은 뷰 모델을 구독하기 위해 `@ObservedObject` 속성이 표시됩니다.

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

7. `RocketLaunch` 클래스는 `List` 뷰를 초기화하기 위한 매개변수로 사용되므로, [`Identifiable` 프로토콜을 준수](https://developer.apple.com/documentation/swift/identifiable)해야 합니다.
   클래스에는 이미 `id`라는 속성이 있으므로 `ContentView.swift` 하단에 익스텐션을 추가하기만 하면 됩니다:

    ```Swift
    extension RocketLaunch: Identifiable { }
    ```

### 데이터 로드

뷰 모델에서 로켓 발사 데이터를 가져오려면 멀티플랫폼 라이브러리의 `KoinHelper` 클래스 인스턴스가 필요합니다.
이를 통해 올바른 데이터베이스 드라이버를 사용하여 SDK 함수를 호출할 수 있습니다.

1. `ContentView.swift` 파일에서 `ViewModel` 클래스를 확장하여 `KoinHelper` 객체와 `loadLaunches` 함수를 포함합니다:

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
               // TODO: 데이터 가져오기
           }
       }
   }
   ```

2. `KoinHelper.getLaunches()` 함수를 호출하고(이는 `SpaceXSDK` 클래스 호출을 대행함) 그 결과를 `launches` 속성에 저장합니다:

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

    Kotlin 모듈을 Apple 프레임워크로 컴파일하면, [중단 함수(suspending functions)](https://kotlinlang.org/docs/whatsnew14.html#support-for-kotlin-s-suspending-functions-in-swift-and-objective-c)는 Swift의 `async`/`await` 메커니즘을 사용하여 호출할 수 있습니다.
   
    `getLaunches` 함수가 Kotlin에서 `@Throws(Exception::class)` 어노테이션으로 표시되어 있으므로, `Exception` 클래스 또는 그 하위 클래스의 인스턴스인 모든 예외는 Swift에 `NSError`로 전달됩니다. 따라서 이러한 모든 예외는 `loadLaunches()` 함수에서 catch할 수 있습니다.

3. 앱의 진입점인 `iOSApp.swift` 파일로 이동하여 Koin 모듈, 뷰 및 뷰 모델을 초기화합니다:

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

4. IntelliJ IDEA에서 **iosApp** 구성으로 전환하고 에뮬레이터를 선택한 후 실행하여 결과를 확인합니다:

![iOS 애플리케이션](ios-application.png){width=350}

> 프로젝트의 최종 버전은 [`final` 브랜치](https://github.com/kotlin-hands-on/kmm-networking-and-data-storage/tree/final)에서 찾을 수 있습니다.
>
{style="note"}

## 다음 단계는?

이 튜토리얼에서는 메인 스레드에서 JSON을 파싱하고 데이터베이스에 요청을 수행하는 것과 같이 잠재적으로 자원을 많이 소모하는 작업이 포함되어 있습니다. 동시성 코드를 작성하고 앱을 최적화하는 방법에 대해 알아보려면 [코루틴 가이드](https://kotlinlang.org/docs/coroutines-guide.html)를 참조하세요.

다음 추가 학습 자료도 확인할 수 있습니다:

* [멀티플랫폼 프로젝트에서 Ktor HTTP 클라이언트 사용하기](https://ktor.io/docs/http-client-engines.html#mpp-config)
* [Koin 및 의존성 주입에 대해 알아보기](https://insert-koin.io/docs/setup/why)
* [Android 애플리케이션을 iOS에서 작동하도록 만들기](multiplatform-integrate-in-existing-app.md)
* [멀티플랫폼 프로젝트 구조에 대해 자세히 알아보기](multiplatform-discover-project.md)