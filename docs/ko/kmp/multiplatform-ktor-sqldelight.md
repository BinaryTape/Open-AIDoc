[//]: # (title: Ktor 및 SQLDelight를 사용한 멀티플랫폼 앱 만들기)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

<tldr>
<p>이 튜토리얼에서는 IntelliJ IDEA를 사용하지만 Android Studio에서도 동일하게 따라 할 수 있습니다. 두 IDE 모두 동일한 핵심 기능과 Kotlin Multiplatform 지원을 공유합니다.</p>
</tldr>

이 튜토리얼에서는 IntelliJ IDEA를 사용하여 Kotlin Multiplatform 기반의 iOS 및 Android용 고급 모바일 애플리케이션을 만드는 방법을 살펴봅니다.
이 애플리케이션은 다음과 같은 작업을 수행합니다.

* [Ktor](https://ktor.io/docs/create-client.html)와 [`kotlinx.serialization`](https://kotlinlang.org/docs/serialization.html)을 사용하여 공개 [Launch Library](https://lldev.thespacedevs.com/docs)에서 인터넷을 통해 데이터를 가져옵니다.
* [SQLDelight](https://github.com/cashapp/sqldelight)를 사용하여 로컬 데이터베이스에 데이터를 저장합니다.
* 우주 로켓 발사 목록을 발사 날짜, 결과, 세부 설명과 함께 표시합니다.
* [Koin](https://insert-koin.io/)을 사용하여 플랫폼별 데이터베이스 드라이버를 제공합니다.

애플리케이션에는 iOS와 Android 플랫폼 모두를 위한 공유 코드가 포함된 모듈이 들어갑니다. 비즈니스 로직과 데이터 액세스 계층은 공유 모듈에서 한 번만 구현되는 반면, 두 애플리케이션의 UI는 네이티브로 구현됩니다.

![에뮬레이터 및 시뮬레이터](android-and-ios.png){width=600}

> GitHub 저장소에서 [템플릿 프로젝트](https://github.com/kotlin-hands-on/kmm-networking-and-data-storage)와 [최종 애플리케이션](https://github.com/kotlin-hands-on/kmm-networking-and-data-storage/tree/final)의 소스 코드를 확인할 수 있습니다.
>
{style="note"}

## 프로젝트 생성 {id="create-a-project"}

1. [빠른 시작](quickstart.md)의 안내에 따라 [Kotlin Multiplatform 개발 환경을 설정](quickstart.md#set-up-the-environment)합니다.
2. IntelliJ IDEA에서 **File** | **New** | **Project**를 선택합니다.
3. 왼쪽 패널에서 **Kotlin Multiplatform**을 선택합니다(Android Studio의 경우 **New Project** 마법사의 **Generic** 탭에서 템플릿을 찾을 수 있습니다).
4. **New Project** 창에서 다음 필드를 지정합니다.

   * **Name**: SpaceTutorial
   * **Project ID**: com.jetbrains.spacetutorial

5. **Android** 및 **iOS** 타깃을 선택합니다.
6. iOS의 경우 **Do not share UI** 옵션을 선택합니다. 두 플랫폼 모두 네이티브 UI로 구현할 것입니다.
7. 모든 필드와 타깃을 지정했으면 **Create**를 클릭합니다.

   ![Ktor 및 SQLDelight 멀티플랫폼 프로젝트 생성](create-ktor-sqldelight-multiplatform-project.png){width=800}

## Gradle 종속성 추가 {id="add-gradle-dependencies"}

공유 모듈에 멀티플랫폼 라이브러리를 추가하려면, 모듈의 `build.gradle.kts` 파일에 있는 해당 소스 세트의 `dependencies {}` 블록에 종속성 지시문(`implementation`)을 추가합니다.

`kotlinx.serialization` 및 SQLDelight 라이브러리에는 추가 구성도 필요합니다.

필요한 모든 종속성을 반영하도록 `gradle/libs.versions.toml` 파일의 버전 카탈로그에서 라인을 변경하거나 추가합니다.

1. `[versions]` 블록에서 AGP 버전을 확인하고 나머지를 추가합니다.

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

2. `[libraries]` 블록에 다음 라이브러리 참조를 추가합니다.

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

3. `[plugins]` 블록에 필요한 Gradle 플러그인을 지정합니다.

   ```toml
   [plugins]
   # ...
   kotlinxSerialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
   sqldelight = { id = "app.cash.sqldelight", version.ref = "sqlDelight" }
   ```

4. 버전 카탈로그가 업데이트되면 프로젝트를 다시 동기화하라는 메시지가 표시됩니다.
   **Sync Gradle Changes** 버튼을 클릭하여 Gradle 파일을 동기화합니다: ![Gradle 파일 동기화](gradle-sync.png){width=50}

5. `sharedLogic/build.gradle.kts` 파일의 맨 처음에 있는 `plugins {}` 블록에 다음 라인을 추가합니다.

   ```kotlin
   plugins {
       // ...
       alias(libs.plugins.kotlinxSerialization)
       alias(libs.plugins.sqldelight)
   }
   ```

6. common 소스 세트에는 각 라이브러리의 코어 아티팩트와 `kotlinx.serialization`을 사용하기 위한 Ktor [serialization 기능](https://ktor.io/docs/serialization-client.html)이 필요합니다.
    iOS 및 Android 소스 세트에는 SQLDelight 및 Ktor 플랫폼 드라이버도 필요합니다.

    동일한 `sharedLogic/build.gradle.kts` 파일에 필요한 모든 종속성을 추가합니다.

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

7. 종속성을 지정한 후 **Sync Gradle Changes** 버튼을 다시 한 번 클릭하여 Gradle 파일을 업데이트합니다.

Gradle 동기화가 완료되면 프로젝트 구성이 끝나고 코드를 작성할 수 있습니다.

> 멀티플랫폼 종속성에 대한 자세한 내용은 [Kotlin Multiplatform 라이브러리 종속성](multiplatform-add-dependencies.md)을 참조하세요.
>
{style="tip"}

## 애플리케이션 데이터 모델 생성 {id="create-an-application-data-model"}

튜토리얼 앱에는 네트워킹 및 캐시 서비스에 대한 퍼사드(facade) 역할을 하는 공개 `SpaceSDK` 클래스가 포함됩니다.
애플리케이션 데이터 모델은 다음과 같은 정보를 담은 세 개의 엔티티 클래스를 가집니다.

* 발사에 대한 일반 정보
* 미션 패치 이미지 링크
* 발사와 관련된 기사의 URL

> 이 튜토리얼을 마칠 때까지 이 데이터가 모두 UI에 표시되는 것은 아닙니다.
> 여기서는 직렬화를 보여주기 위해 이 데이터 모델을 사용합니다.
> 하지만 링크와 패치를 활용하여 예제를 더 유익하게 확장해 볼 수 있습니다!
>
{style="note"}

필요한 데이터 클래스를 생성합니다.

1. `sharedLogic/src/commonMain/kotlin/com/jetbrains/spacetutorial` 디렉터리에 `entity` 패키지를 생성한 다음, 해당 패키지 안에 `Entity.kt` 파일을 생성합니다.
2. 기본 엔티티를 위한 모든 데이터 클래스를 선언합니다.

   ```kotlin
   
   ```

직렬화 가능한 각 클래스는 `@Serializable` 어노테이션으로 표시해야 합니다. `kotlinx.serialization` 플러그인은 어노테이션 인수로 직렬 변환기(serializer) 링크를 명시적으로 전달하지 않는 한, `@Serializable` 클래스에 대한 기본 직렬 변환기를 자동으로 생성합니다.

`@SerialName` 어노테이션을 사용하면 필드 이름을 재정의할 수 있어, 보다 읽기 쉬운 식별자를 사용하여 데이터 클래스의 속성에 액세스하는 데 도움이 됩니다.

## SQLDelight 구성 및 캐시 로직 구현 {id="configure-sqldelight-and-implement-cache-logic"}

SQLDelight 라이브러리를 사용하면 SQL 쿼리로부터 타입 안전(type-safe)한 Kotlin 데이터베이스 API를 생성할 수 있습니다. 컴파일 중에 생성기는 SQL 쿼리의 유효성을 검사하고 이를 공유 모듈에서 사용할 수 있는 Kotlin 코드로 변환합니다.

### SQLDelight 구성 {id="configure-sqldelight"}

SQLDelight 종속성은 이미 프로젝트에 포함되어 있습니다.
라이브러리를 구성하려면 `sharedLogic/build.gradle.kts` 파일을 열고 맨 끝에 `sqldelight {}` 블록을 추가합니다.
이 블록에는 데이터베이스 목록과 해당 매개변수가 포함됩니다.

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

메시지가 표시되면 Gradle 프로젝트 파일을 동기화하거나, <shortcut>Shift</shortcut> 키를 두 번 누르고 **Sync All Gradle, Swift Package Manager projects** 액션을 검색합니다.

> `.sq` 파일 작업을 위해 공식 [SQLDelight 플러그인](https://plugins.jetbrains.com/plugin/8191-sqldelight)을 설치하는 것을 권장합니다.
>
{style="tip"}

### 데이터베이스 API 생성 {id="generate-the-database-api"}

먼저 필요한 모든 SQL 쿼리가 포함된 `.sq` 파일을 생성합니다. 기본적으로 SQLDelight 플러그인은 소스 세트의 `sqldelight` 폴더에서 `.sq` 파일을 찾습니다.

1. `sharedLogic/src/commonMain` 디렉터리에 새 `sqldelight` 디렉터리를 생성합니다.
2. `sqldelight` 디렉터리 내에 `com/jetbrains/spacetutorial/cache`라는 새 디렉터리를 만들어 패키지를 위한 중첩 디렉터리를 생성합니다.
3. `cache` 디렉터리 내에 `AppDatabase.sq` 파일을 생성합니다(`build.gradle.kts` 파일에 지정한 데이터베이스와 동일한 이름).
   애플리케이션의 모든 SQL 쿼리가 이 파일에 저장됩니다.
4. 데이터베이스에는 발사 정보가 담긴 테이블이 포함됩니다.
   `AppDatabase.sq` 파일에 다음 코드를 추가하여 테이블을 생성하고 나중에 사용할 몇 가지 함수를 정의합니다.

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

5. 해당 `AppDatabase` 인터페이스를 생성합니다(나중에 데이터베이스 드라이버로 초기화하게 됩니다).
   이를 위해 프로젝트 루트의 터미널에서 다음 명령을 실행합니다.

   ```shell
   ./gradlew generateCommonMainAppDatabaseInterface
   ```

   생성된 Kotlin 코드는 `sharedLogic/build/generated/sqldelight` 디렉터리에 저장됩니다.

### 플랫폼별 데이터베이스 드라이버 팩토리 생성 {id="create-factories-for-platform-specific-database-drivers"}

`AppDatabase` 인터페이스를 초기화하려면 `SqlDriver` 인스턴스를 전달해야 합니다.
SQLDelight는 SQLite 드라이버의 여러 플랫폼별 구현을 제공하므로 각 플랫폼마다 이러한 인스턴스를 별도로 생성해야 합니다.

[expect/actual 인터페이스](multiplatform-expect-actual.md)를 사용하여 이를 구현할 수도 있지만, 이 프로젝트에서는 Kotlin Multiplatform에서 의존성 주입을 시도해 보기 위해 [Koin](https://insert-koin.io/)을 사용합니다.

1. 데이터베이스 드라이버를 위한 인터페이스를 생성합니다. 이를 위해 `sharedLogic/src/commonMain/kotlin/com/jetbrains/spacetutorial/` 디렉터리에 `cache` 패키지를 생성합니다.
2. `cache` 패키지 안에 `DatabaseDriverFactory` 인터페이스를 생성합니다.

   ```kotlin
   package com.jetbrains.spacetutorial.cache
   
   import app.cash.sqldelight.db.SqlDriver

   interface DatabaseDriverFactory {
       fun createDriver(): SqlDriver
   }
   ```

3. Android용으로 이 인터페이스를 구현하는 클래스를 생성합니다. `sharedLogic/src/androidMain/kotlin` 디렉터리에 `com.jetbrains.spacetutorial.cache` 패키지를 생성한 다음, 그 안에 `AndroidDatabaseDriverFactory.kt` 파일을 생성합니다.
4. Android에서 SQLite 드라이버는 `AndroidSqliteDriver` 클래스로 구현됩니다. `DatabaseDriverFactory.kt` 파일에서 데이터베이스 정보와 컨텍스트 링크를 `AndroidSqliteDriver` 클래스 생성자에 전달합니다.

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

5. iOS의 경우 `shared/src/iosMain/kotlin/com/jetbrains/spacetutorial/` 디렉터리에 `cache` 패키지를 생성합니다.
6. `cache` 패키지 안에 `DatabaseDriverFactory.kt` 파일을 생성하고 다음 코드를 추가합니다.

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

이 팩토리들은 나중에 프로젝트의 플랫폼별 부분에서 사용하게 됩니다.

### 캐시 구현 {id="implement-cache"}

지금까지 플랫폼 데이터베이스 드라이버용 팩토리와 데이터베이스 작업을 수행하기 위한 `AppDatabase` 인터페이스를 추가했습니다.
이제 `AppDatabase` 인터페이스를 래핑하고 캐싱 로직을 포함할 `Database` 클래스를 만듭니다.

1. 공통 소스 세트인 `sharedLogic/src/commonMain/kotlin`의 `com.jetbrains.spacetutorial.cache` 패키지에 새 `Database` 클래스를 생성합니다. 여기에는 두 플랫폼 공통의 로직이 들어갑니다.

2. `AppDatabase`에 드라이버를 제공하기 위해, 추상 `DatabaseDriverFactory` 인스턴스를 `Database` 클래스 생성자에 전달합니다.

   ```kotlin
   package com.jetbrains.spacetutorial.cache

   internal class Database(databaseDriverFactory: DatabaseDriverFactory) {
       private val database = AppDatabase(databaseDriverFactory.createDriver())
       private val dbQuery = database.appDatabaseQueries
   }
   ```

   이 클래스의 [가시성(visibility)](https://kotlinlang.org/docs/visibility-modifiers.html#class-members)은 internal로 설정되어 멀티플랫폼 모듈 내에서만 접근할 수 있습니다.

3. `Database` 클래스 내에 몇 가지 데이터 처리 작업을 구현합니다.
   먼저 모든 로켓 발사 목록을 반환하는 `getAllLaunches()` 함수를 생성합니다.
   `mapLaunchSelecting()` 함수는 데이터베이스 쿼리 결과를 `RocketLaunch` 객체로 매핑하는 데 사용됩니다.

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

4. 데이터베이스를 지우고 새 데이터를 삽입하는 `clearAndCreateLaunches()` 함수를 추가합니다.

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

## API 서비스 구현 {id="implement-the-api-service"}

인터넷을 통해 데이터를 가져오기 위해 [Launch Library 공개 API](https://lldev.thespacedevs.com/docs)를 사용하고, `/2.3.0/launches` 엔드포인트에서 모든 발사 목록을 가져오는 단일 메서드를 사용합니다.

애플리케이션을 API에 연결할 클래스를 생성합니다.

1. `sharedLogic/src/commonMain/kotlin/com/jetbrains/spacetutorial/` 디렉터리에 `network` 패키지를 생성합니다.
2. `network` 디렉터리 안에 `SpaceApi` 클래스를 생성합니다.

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

    이 클래스는 네트워크 요청을 실행하고 JSON 응답을 `com.jetbrains.spacetutorial.entity` 패키지의 엔티티로 역직렬화합니다.
    Ktor `HttpClient` 인스턴스가 `httpClient` 속성을 초기화하고 저장합니다.

    이 코드는 `GET` 요청의 결과를 역직렬화하기 위해 [`ContentNegotiation`](https://ktor.io/docs/serialization-client.html) Ktor 플러그인을 사용합니다. 이 플러그인은 요청 및 응답 페이로드를 JSON으로 처리하여 필요에 따라 직렬화 및 역직렬화합니다.

3. 로켓 발사 목록을 반환하는 데이터 검색 함수를 선언합니다.

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

`getAllLaunches` 함수는 일시 중단 함수인 `HttpClient.get()`의 호출을 포함하므로 `suspend` 한정자가 붙습니다.
`HttpClient.get()` 함수는 인터넷을 통해 데이터를 가져오는 비동기 작업을 포함하므로 코루틴이나 다른 일시 중단 함수에서만 호출할 수 있습니다. 네트워크 요청은 HTTP 클라이언트의 스레드 풀에서 실행됩니다.

GET 요청을 보낼 URL은 `get()` 함수의 인수로 전달됩니다.

## SDK 빌드 {id="build-an-sdk"}

iOS 및 Android 애플리케이션은 공개 클래스인 `SpaceSDK`를 제공하는 공유 모듈을 통해 우주 API와 통신합니다.

1. 공통 소스 세트 `sharedLogic/src/commonMain/kotlin`의 `com.jetbrains.spacetutorial` 패키지에 `SpaceSDK` 클래스를 생성합니다.
   이 클래스는 `Database` 및 `SpaceApi` 클래스의 퍼사드 역할을 합니다.

   `Database` 클래스 인스턴스를 생성하려면 `DatabaseDriverFactory` 인스턴스를 제공해야 합니다.

   ```kotlin
   package com.jetbrains.spacetutorial
   
   import com.jetbrains.spacetutorial.cache.Database
   import com.jetbrains.spacetutorial.cache.DatabaseDriverFactory
   import com.jetbrains.spacetutorial.network.SpaceApi

   class SpaceSDK(databaseDriverFactory: DatabaseDriverFactory, val api: SpaceApi) { 
       private val database = Database(databaseDriverFactory)
   }
   ```

   올바른 데이터베이스 드라이버는 `SpaceSDK` 클래스 생성자를 통해 플랫폼별 코드에서 주입됩니다.

2. 생성된 데이터베이스와 API를 사용하여 발사 목록을 요청하고 저장하는 `getLaunches` 함수를 추가합니다.

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

이 클래스에는 모든 발사 정보를 가져오는 함수 하나가 포함되어 있습니다. `forceReload` 값에 따라 캐시된 값을 반환하거나 인터넷에서 데이터를 로드한 후 그 결과로 캐시를 업데이트합니다. 캐시된 데이터가 없는 경우 `forceReload` 플래그 값에 관계없이 인터넷에서 데이터를 로드합니다.

SDK 클라이언트는 `forceReload` 플래그를 사용하여 최신 발사 정보를 로드함으로써 사용자를 위한 당겨서 새로고침(pull-to-refresh) 제스처를 활성화할 수 있습니다.

Kotlin의 모든 예외는 비검사(unchecked) 예외인 반면, Swift에는 검사(checked) 에러만 존재합니다(자세한 내용은 [Swift/Objective-C와의 상호 운용성](https://kotlinlang.org/docs/native-objc-interop.html#errors-and-exceptions) 참조). 따라서 Swift 코드에서 예상되는 예외를 인식할 수 있도록, Swift에서 호출되는 Kotlin 함수에는 잠재적인 예외 클래스 목록을 지정하는 `@Throws` 어노테이션을 표시해야 합니다.

## Android 애플리케이션 만들기 {id="create-the-android-application"}

IntelliJ IDEA가 초기 Gradle 구성을 처리해 주므로 `sharedUI` 및 `sharedLogic` 모듈이 이미 Android 애플리케이션(`androidApp`)에 연결되어 있습니다.

메시지가 표시되면 Gradle 프로젝트 파일을 동기화하거나, <shortcut>Shift</shortcut> 키를 두 번 누르고 **Sync All Gradle, Swift Package Manager projects**를 검색합니다.

### `androidApp`에 인터넷 액세스 권한 추가 {id="add-internet-access-permission-for-androidapp"}

인터넷에 액세스하려면 Android 애플리케이션에 적절한 권한이 필요합니다.
`androidApp/src/main/AndroidManifest.xml` 파일에 `<uses-permission>` 태그를 추가합니다.

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <!--...-->
</manifest>
```

### 의존성 주입 코드 추가 {id="add-dependency-injection-code"}

Koin 의존성 주입을 사용하면 다양한 컨텍스트에서 사용할 수 있는 모듈(컴포넌트 세트)을 선언할 수 있습니다.
이 프로젝트에서는 Android 애플리케이션용과 iOS 앱용의 두 가지 모듈을 생성합니다.
그런 다음 해당 모듈을 사용하여 각 네이티브 UI에 대해 Koin을 시작합니다.

Android 앱을 위한 컴포넌트가 포함될 Koin 모듈을 선언합니다.

1. `sharedUI/build.gradle.kts` 파일의 `androidMain` 소스 세트에 Koin Android 종속성을 추가합니다.

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

2. Android 전용 UI 코드를 위한 `sharedUI/src/androidMain/kotlin` 디렉터리를 생성합니다.
3. `sharedUI/src/androidMain/kotlin` 디렉터리에 `com.jetbrains.spacetutorial` 패키지를 생성합니다.
4. Android UI는 공유되지 않으므로 `sharedUI` 모듈에서 `commonMain` 및 `commonTest` 소스 세트를 제거합니다.
5. `sharedUI/src/androidMain/kotlin/com.jetbrains.spacetutorial` 패키지에 `AppModule.kt` 파일을 생성합니다.

   해당 파일에서 `SpaceApi` 클래스와 `SpaceSDK` 클래스를 위한 두 개의 [싱글톤(singleton)](https://insert-koin.io/docs/reference/koin-core/definitions#defining-a-singleton)으로 Koin 모듈을 선언합니다.

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

   `SpaceSDK` 클래스 생성자에는 플랫폼별 `AndroidDatabaseDriverFactory` 클래스가 주입됩니다.
   `get()` 함수는 모듈 내에서 종속성을 해결합니다. `SpaceSDK()`의 `api` 매개변수 자리에 Koin이 앞에서 선언한 `SpaceApi` 싱글톤을 전달합니다.

6. `androidApp/build.gradle.kts` 파일에 `androidApp` 모듈을 위한 Koin Android 종속성을 추가합니다.

   ```kotlin
   kotlin {
       // ...
       dependencies {
           // ...
           implementation(libs.koin.androidx.compose)
       }
   }
   ```

7. `androidApp` 모듈의 `src/main/kotlin/com/jetbrains/spacetutorial` 디렉터리에 Koin 모듈을 시작할 `MainApplication` 클래스를 생성합니다.

   `AppModule.kt` 파일에서 선언한 모듈을 `modules()` 함수에 전달합니다.

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

8. 생성한 `MainApplication` 클래스를 `AndroidManifest.xml` 파일의 `<application>` 태그에 지정합니다.

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

이제 플랫폼별 데이터베이스 드라이버가 제공하는 정보를 사용할 UI를 구현할 준비가 되었습니다.

### 발사 목록을 포함하는 뷰 모델 준비 {id="prepare-the-view-model-with-the-list-of-launches"}

Android UI는 Jetpack Compose와 Material 3를 사용하여 구현합니다. 먼저 SDK를 사용하여 발사 목록을 가져오는 뷰 모델을 만듭니다. 그런 다음 Material 테마를 설정하고, 마지막으로 이 모든 것을 하나로 묶는 composable 함수를 작성합니다.

1. `sharedUI/src/androidMain/kotlin` 디렉터리의 `com.jetbrains.spacetutorial` 패키지에 `RocketLaunchViewModel.kt` 파일을 생성합니다.

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

   `RocketLaunchScreenState` 인스턴스는 SDK로부터 수신한 데이터와 요청의 현재 상태를 저장합니다.

2. `RocketLaunchViewModel` 클래스에 이 뷰 모델의 코루틴 스코프에서 SDK의 `getLaunches` 함수를 호출하는 `loadLaunches` 함수를 추가합니다.

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

3. `RocketLaunchViewModel` 객체가 생성되자마자 API에 데이터를 요청하도록, 클래스 내에 `loadLaunches()` 호출이 포함된 `init {}` 블록을 추가합니다.

    ```kotlin
    class RocketLaunchViewModel(private val sdk: SpaceSDK) : ViewModel() {
        // ...

        init {
            loadLaunches()
        }
    }
    ```

4. 이제 `AppModule.kt` 파일의 Koin 모듈에 뷰 모델을 지정합니다.

    ```kotlin
    import org.koin.core.module.dsl.viewModel
    
    val appModule = module {
        // ...
        viewModel { RocketLaunchViewModel(sdk = get()) }
    }
    ```

### Material 테마 빌드 {id="build-the-material-theme"}

Material 테마에서 제공하는 `AppTheme` 함수를 중심으로 메인 `App()` composable을 빌드합니다.

1. [Material Theme Builder](https://m3.material.io/theme-builder#/custom)를 사용하여 Compose 앱용 테마를 생성할 수 있습니다.
   색상과 글꼴을 선택한 다음 오른쪽 하단 모서리에 있는 **Export theme**를 클릭합니다.
2. 내보내기 화면에서 **Export** 드롭다운을 클릭하고 **Jetpack Compose (Theme.kt)** 옵션을 선택합니다.
3. 압축 파일의 압축을 풀고 `theme` 폴더를 `sharedUI/src/androidMain/kotlin/com/jetbrains/spacetutorial` 디렉터리에 복사합니다.

   ![테마 디렉터리 위치](theme-directory.png){width=299}

4. `theme` 패키지 내의 각 파일에서 `package` 라인을 생성한 패키지를 참조하도록 변경합니다.

    ```kotlin
    package com.jetbrains.spacetutorial.theme
    ```

5. `Color.kt` 파일에 성공 및 실패한 발사에 사용할 색상 변수 두 개를 추가합니다.

    ```kotlin
    val app_theme_successful = Color(0xff4BB543)
    val app_theme_unsuccessful = Color(0xffFC100D)
    ```

### 프레젠테이션 로직 구현 {id="implement-the-presentation-logic"}

애플리케이션의 메인 `App()` composable을 생성하고 `ComponentActivity` 클래스에서 호출합니다.

1. `sharedUI/src/androidApp/kotlin/com/jetbrains/spacetutorial` 디렉터리에 `App.kt` 파일을 생성합니다.
2. `App.kt` 파일을 열고 다음 코드를 삽입합니다.

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

   여기서는 Android Koin 모듈에 선언한 `viewModel`을 참조하기 위해 [Koin ViewModel API](https://insert-koin.io/docs/reference/koin-compose/compose-viewmodel)를 사용합니다.

3. 이제 로딩 화면, 발사 결과 컬럼, 당겨서 새로고침 동작을 구현할 UI 코드를 추가합니다.

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

4. 마지막으로 `androidApp/src/main/AndroidManifest.xml`의 `<activity>` 태그에 `MainActivity` 클래스를 지정합니다.

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

5. Android 앱을 실행합니다. 실행 구성 메뉴에서 **androidApp**을 선택하고 에뮬레이터를 선택한 다음 실행 버튼을 클릭합니다.
   앱이 자동으로 API 요청을 실행하고 발사 목록을 표시합니다(배경색은 생성한 Material 테마에 따라 다릅니다).

   ![Android 애플리케이션](android-application.png){width=350}

이제 비즈니스 로직은 Kotlin Multiplatform 모듈에서 구현되고, UI는 네이티브 Jetpack Compose로 실행되는 Android 애플리케이션을 만들었습니다.

## iOS 애플리케이션 만들기 {id="create-the-ios-application"}

프로젝트의 iOS 부분에서는 사용자 인터페이스를 구축하기 위해 [SwiftUI](https://developer.apple.com/xcode/swiftui/)를 사용하고 [Model View View-Model](https://en.wikipedia.org/wiki/Model–view–viewmodel) 패턴을 활용합니다.

IntelliJ IDEA는 공유 모듈에 이미 연결된 iOS 프로젝트를 생성합니다. Kotlin 모듈은 `sharedLogic/build.gradle.kts` 파일에 지정된 이름(`baseName = "SharedLogic"`)으로 내보내지며, 일반적인 `import` 문인 `import SharedLogic`을 사용하여 가져옵니다.

### SQLDelight용 동적 링킹 플래그 추가 {id="add-the-dynamic-linking-flag-for-sqldelight"}

기본적으로 IntelliJ IDEA는 iOS 프레임워크의 정적 링킹을 위해 설정된 프로젝트를 생성합니다.

iOS에서 네이티브 SQLDelight 드라이버를 사용하려면 Xcode 툴링이 시스템 제공 SQLite 바이너리를 찾을 수 있도록 동적 링커 플래그를 추가해야 합니다.

1. IntelliJ IDEA에서 **File** | **Open Project in Xcode** 옵션을 선택하여 Xcode에서 프로젝트를 엽니다.
2. Xcode에서 프로젝트 이름을 클릭하여 설정을 엽니다.
3. **Build Settings** 탭으로 전환하고 **All** 목록으로 전환한 다음 **Other Linker Flags** 필드를 검색합니다.
4. 해당 필드를 확장하고 **Debug** 필드 옆의 더하기 기호를 누른 다음 **Any Architecture | Any SDK**에 `-lsqlite3` 문자열을 붙여넣습니다.
5. **Other Linker Flags** | **Release** 필드에 대해서도 이 과정을 반복합니다.

   ![Xcode 프로젝트에 링커 플래그를 올바르게 추가한 결과](xcode-other-linker-flags.png){width="434"}
6. IntelliJ IDEA로 돌아옵니다.

### iOS 의존성 주입을 위한 Koin 클래스 준비 {id="prepare-a-koin-class-for-ios-dependency-injection"}

Swift 코드에서 Koin 클래스와 함수를 사용하려면 특수한 `KoinComponent` 클래스를 만들고 iOS용 Koin 모듈을 선언해야 합니다.

1. `sharedLogic/src/iosMain/kotlin/com/jetbrains/spacetutorial` 디렉터리에 `KoinHelper.kt` 파일을 생성합니다.
2. 지연 Koin 주입으로 `SpaceSDK` 클래스를 래핑할 `KoinHelper` 클래스를 추가합니다.

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

3. `KoinHelper` 클래스 아래에 Swift에서 iOS Koin 모듈을 초기화하고 시작하는 데 사용할 `initKoin()` 함수를 추가합니다.

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

이제 iOS 앱에서 Koin 모듈을 시작하여 공통 `SpaceSDK` 클래스와 함께 네이티브 데이터베이스 드라이버를 사용할 수 있습니다.

### UI 구현 {id="implement-the-ui"}

먼저 목록의 항목을 표시하기 위한 `RocketLaunchRow` SwiftUI 뷰를 만듭니다. 이 뷰는 `HStack` 및 `VStack` 뷰를 기반으로 합니다. 데이터를 표시하기 위한 유용한 헬퍼를 포함하는 `RocketLaunchRow` 구조체에 대한 익스텐션도 포함됩니다.

1. IntelliJ IDEA에서 **Project** 뷰에 있는지 확인합니다.
2. `iosApp/iosApp` 폴더에서 `ContentView.swift` 옆에 새 Swift 파일을 만들고 이름을 `RocketLaunchRow`로 지정합니다.
3. `RocketLaunchRow.swift` 파일을 다음 코드로 업데이트합니다.

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

   발사 목록은 프로젝트에 이미 포함되어 있는 `ContentView` 뷰에 표시됩니다.

4. `ContentView.swift` 파일에서 데이터를 준비하고 관리할 `ViewModel` 클래스를 포함하도록 `ContentView` 클래스에 익스텐션을 추가합니다.

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

    뷰 모델(`ContentView.ViewModel`)은 [Combine 프레임워크](https://developer.apple.com/documentation/combine)를 통해 뷰(`ContentView`)와 연결됩니다.
    * `ContentView.ViewModel` 클래스는 `ObservableObject`로 선언됩니다.
    * `launches` 속성에는 `@Published` 어트리뷰트가 사용되므로 이 속성이 변경될 때마다 뷰 모델에서 신호를 발생시킵니다.

5. `ContentView_Previews` 구조체를 제거합니다. 뷰 모델과 호환되는 프리뷰는 구현하지 않을 것입니다.

6. 발사 목록을 표시하고 새로고침 기능을 추가하도록 `ContentView` 클래스의 본문을 업데이트합니다.

   * 이는 UI 기초 작업입니다. `loadLaunches` 함수는 튜토리얼의 다음 단계에서 구현합니다.
   * `viewModel` 속성에는 뷰 모델을 구독하기 위해 `@ObservedObject` 어트리뷰트가 표시됩니다.

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

7. `RocketLaunch` 클래스는 `List` 뷰를 초기화하기 위한 매개변수로 사용되므로 [`Identifiable` 프로토콜을 준수](https://developer.apple.com/documentation/swift/identifiable)해야 합니다.
   이 클래스에는 이미 `id`라는 속성이 있으므로 `ContentView.swift` 하단에 익스텐션만 추가해 주면 됩니다.

    ```Swift
    extension RocketLaunch: Identifiable { }
    ```

### 데이터 로드 {id="load-the-data"}

뷰 모델에서 로켓 발사에 대한 데이터를 가져오려면 멀티플랫폼 라이브러리의 `KoinHelper` 클래스 인스턴스가 필요합니다.
이를 통해 올바른 데이터베이스 드라이버로 SDK 함수를 호출할 수 있습니다.

1. `ContentView.swift` 파일에서 `KoinHelper` 객체와 `loadLaunches` 함수를 포함하도록 `ViewModel` 클래스를 확장합니다.

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

2. `loadLaunches()` 함수에서 `KoinHelper.getLaunches()` 함수(`SpaceSDK` 클래스로의 호출을 프록시함)를 호출하고 그 결과를 `launches` 속성에 저장합니다.

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

    Kotlin 모듈을 Apple 프레임워크로 컴파일할 때 [일시 중단 함수(suspending functions)](https://kotlinlang.org/docs/whatsnew14.html#support-for-kotlin-s-suspending-functions-in-swift-and-objective-c)는 Swift의 `async`/`await` 메커니즘을 사용하여 호출할 수 있습니다.
   
    `getLaunches` 함수는 Kotlin에서 `@Throws(Exception::class)` 어노테이션으로 표시되어 있으므로, `Exception` 클래스 또는 그 서브클래스의 인스턴스인 모든 예외는 Swift에 `NSError`로 전파됩니다.
    따라서 이러한 모든 예외는 `loadLaunches()` 함수에 의해 catch될 수 있습니다.

3. 앱의 진입점인 `iOSApp.swift` 파일로 이동하여 Koin 모듈, 뷰, 뷰 모델을 초기화합니다.

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

4. IntelliJ IDEA에서 **iosApp** 구성으로 전환하고 에뮬레이터를 선택한 다음 실행하여 결과를 확인합니다.

![iOS 애플리케이션](ios-application.png){width=350}

> 프로젝트의 최종 버전은 [`final` 브랜치](https://github.com/kotlin-hands-on/kmm-networking-and-data-storage/tree/final)에서 확인할 수 있습니다.
>
{style="note"}

## 다음 단계 {id="what-s-next"}

이 튜토리얼에서는 메인 스레드에서 JSON을 파싱하고 데이터베이스에 요청을 수행하는 등 리소스를 많이 소모할 수 있는 작업들이 일부 포함되어 있습니다. 동시성 코드를 작성하고 앱을 최적화하는 방법에 대해 알아보려면 [코루틴 가이드](https://kotlinlang.org/docs/coroutines-guide.html)를 참조하세요.

다음 추가 학습 자료도 확인할 수 있습니다.

* [멀티플랫폼 프로젝트에서 Ktor HTTP 클라이언트 사용하기](https://ktor.io/docs/http-client-engines.html#mpp-config)
* [Koin 및 의존성 주입 알아보기](https://insert-koin.io/docs/setup/why)
* [Android 애플리케이션을 iOS에서 작동하도록 만들기](multiplatform-integrate-in-existing-app.md)
* [멀티플랫폼 프로젝트 구조에 대해 자세히 알아보기](multiplatform-discover-project.md)