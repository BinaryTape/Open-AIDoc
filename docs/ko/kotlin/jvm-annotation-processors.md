[//]: # (title: Kotlin 프로젝트에서 어노테이션 프로세서 사용하기)

<tldr>

* 다음의 경우 **[kapt](kapt.md)**를 사용하세요:
  * Maven 프로젝트인 경우.
  * Gradle 프로젝트이지만 필요한 Java 어노테이션 프로세서가 아직 KSP를 지원하지 않는 경우. [지원되는 라이브러리 목록 보기](ksp-overview.md#supported-libraries).
* 다음의 경우 **[KSP](ksp-overview.md)**를 사용하세요:
  * Gradle 프로젝트이며 필요한 Java 어노테이션 프로세서가 KSP를 지원하는 경우.
  * 직접 어노테이션 프로세서를 만들고자 하는 경우.

</tldr>

어노테이션 프로세서(Annotation processor)는 컴파일 시점에 소스 코드를 분석하여 보일러플레이트 코드를 생성하거나, 사용법을 검증하고, 또는 기타 아티팩트를 생성합니다.
Kotlin은 어노테이션 프로세서를 다루는 두 가지 방법을 지원합니다:

* [kapt 컴파일러 플러그인](#use-kapt-with-java-annotation-processors)은 Kotlin 소스 코드로부터 스텁(stub) 파일을 생성한 다음, 해당 스텁에서 Java 어노테이션 프로세서를 실행하는 방식으로 작동합니다. 이러한 추가적인 스텁 생성 단계로 인해 빌드 시간이 느려지며, kapt가 [확장 함수](extensions.md)나 [null 안전성](null-safety.md)과 같은 Kotlin 고유의 구조를 이해할 수 없음을 의미합니다.

  kapt는 Maven과 Gradle을 모두 지원합니다. 모든 Maven 프로젝트와 [MapStruct](https://mapstruct.org/)처럼 아직 KSP를 도입하지 않은 프로세서 라이브러리를 사용하는 Gradle 프로젝트에 권장됩니다.

* [KSP 프레임워크](#use-ksp-in-gradle-projects)는 스텁을 생성하지 않고 Kotlin 우선(Kotlin-first) API를 통해 Kotlin 소스 코드를 직접 읽습니다. Kotlin 고유의 기능을 기본적으로 이해하며 kapt보다 빠르게 빌드를 실행합니다.

  현재 KSP는 Gradle만 공식적으로 지원합니다. 자체 프로세서를 작성하거나 [Dagger](https://dagger.dev/)와 같은 KSP 호환 라이브러리를 사용할 때 권장됩니다.

## Java 어노테이션 프로세서와 함께 kapt 사용하기 {id="use-kapt-with-java-annotation-processors"}

[kapt](kapt.md)를 사용하면 프로세서 자체를 변경하지 않고도 기존 Java 어노테이션 프로세서를 Kotlin 프로젝트에서 사용할 수 있습니다.

아래 예제는 컴파일 시점에 Java Bean 간의 타입 안전한 매퍼 구현체를 생성하는 [MapStruct](https://mapstruct.org/) 어노테이션 프로세서를 사용하는 방법을 보여줍니다.

1. 빌드 파일에서 `kapt` 플러그인을 적용하고 `dependencies` 섹션에 MapStruct를 추가합니다:

   <tabs group="build-tool">
   <tab title="Maven" group-key="maven">
   
   ```xml
   <properties>
       <kotlin.version>%kotlinVersion%</kotlin.version>
       <maven.compiler.release>17</maven.compiler.release>
       <mapstruct.version>1.6.3</mapstruct.version>
   </properties>
   
   <dependencies>
       <dependency>
           <groupId>org.mapstruct</groupId>
           <artifactId>mapstruct</artifactId>
           <version>${mapstruct.version}</version>
       </dependency>
   </dependencies>
   
   <plugin>
       <groupId>org.jetbrains.kotlin</groupId>
       <artifactId>kotlin-maven-plugin</artifactId>
       <version>${kotlin.version}</version>
       <extensions>true</extensions>
       <configuration>
           <annotationProcessorPaths>
               <annotationProcessorPath>
                   <groupId>org.mapstruct</groupId>
                   <artifactId>mapstruct-processor</artifactId>
                   <version>${mapstruct.version}</version>
               </annotationProcessorPath>
           </annotationProcessorPaths>
       </configuration>
   </plugin>
   ```
   
   * `<extensions>true</extensions>` 옵션은 kapt를 [자동으로 구성](maven-configure-project.md#automatic-configuration)합니다. 이 옵션은 `src/main/kotlin` 및 `src/test/kotlin` 소스 루트를 등록하고 올바른 라이프사이클 단계에 바인딩된 `kapt` 및 `compile` 실행을 추가하여, 컴파일 전에 `kapt` 골(goal)이 실행되도록 합니다.
   * `maven.compiler.release` 속성은 Java 컴파일러와 Kotlin 컴파일러를 모두 구성하므로 kapt가 생성한 Java 소스가 동일한 JVM 타깃을 대상으로 컴파일됩니다.

   </tab>
   <tab title="Gradle Kotlin" group-key="kotlin">
   
   ```kotlin
   plugins {
       kotlin("kapt") version "%kotlinVersion%"
   }
   
   dependencies {
       implementation("org.mapstruct:mapstruct:1.6.3")
       kapt("org.mapstruct:mapstruct-processor:1.6.3")
   }
   ```
   
   </tab>
   <tab title="Gradle Groovy" group-key="groovy">
   
   ```groovy
   plugins {
       id "org.jetbrains.kotlin.kapt" version "%kotlinVersion%"
   }
   
   dependencies {
       implementation "org.mapstruct:mapstruct:1.6.3"
       kapt "org.mapstruct:mapstruct-processor:1.6.3"
   }
   ```
   
   </tab>
   </tabs>

2. 데이터 클래스와 매퍼 인터페이스를 정의합니다:

   ```kotlin
   import org.mapstruct.Mapper
   import org.mapstruct.factory.Mappers
   
   data class UserDto(val id: Long, val firstName: String, val lastName: String)
   
   data class UserEntity(val id: Long, val firstName: String, val lastName: String)
   
   @Mapper
   interface UserMapper {
       fun toDto(entity: UserEntity): UserDto
       fun toEntity(dto: UserDto): UserEntity
   
       companion object : UserMapper by Mappers.getMapper(UserMapper::class.java)
   }
   ```

3. 프로젝트를 빌드합니다. MapStruct는 생성된 소스 디렉터리에 `UserMapperImpl` 클래스를 생성합니다. `UserMapper`의 동반 객체(companion object)를 사용하여 생성된 구현체를 호출합니다:

   ```kotlin
   fun main() {
       val entity = UserEntity(id = 1L, firstName = "John", lastName = "Doe")
       val dto = UserMapper.toDto(entity)
       println(dto)
       // UserDto(id=1, firstName=John, lastName=Doe)
   }
   ```

## Gradle 프로젝트에서 KSP 사용하기 {id="use-ksp-in-gradle-projects"}

[KSP](ksp-overview.md)를 사용하면 Gradle 프로젝트에서 기존 어노테이션 프로세서를 사용할 수 있으며, 소스 코드의 어노테이션을 기반으로 코드를 생성하는 자체 프로세서를 만들 수도 있습니다.

### Java 어노테이션 프로세서와 함께 KSP 사용하기 {id="use-ksp-with-java-annotation-processors"}

Gradle 프로젝트의 경우 호환되는 어노테이션 프로세서와 함께 KSP를 사용하세요. KSP는 kapt보다 빠르고 Kotlin 고유의 기능을 기본적으로 이해할 수 있습니다. [이미 KSP를 지원하는 라이브러리 목록](ksp-overview.md#supported-libraries)을 확인하세요.

아래 예제는 의존성 그래프를 위한 연결 코드를 생성하는 컴파일 타임 의존성 주입(Dependency Injection) 프레임워크인 [Dagger](https://dagger.dev/)를 사용하는 방법을 보여줍니다.

1. `build.gradle(.kts)` 파일에서 KSP 플러그인을 적용하고 `dependencies` 블록에 Dagger를 추가합니다:
 
   <tabs group="build-script">
   <tab title="Kotlin" group-key="kotlin">
   
   ```kotlin
   // build.gradle.kts
   
   plugins {
       kotlin("jvm") version "%kotlinVersion%"
       id("com.google.devtools.ksp") version "%kspVersion%"
   }
   
   dependencies {
       implementation("com.google.dagger:dagger:2.59.2")
       ksp("com.google.dagger:dagger-compiler:2.59.2")
   }
   ```
   
   </tab>
   <tab title="Groovy" group-key="groovy">
   
   ```groovy
   // build.gradle
   
   plugins {
       id 'org.jetbrains.kotlin.jvm' version '%kotlinVersion%'
       id 'com.google.devtools.ksp' version '%kspVersion%'
   }
   
   dependencies {
       implementation 'com.google.dagger:dagger:2.59.2'
       ksp 'com.google.dagger:dagger-compiler:2.59.2'
   }
   ```
   
   </tab>
   </tabs>

   > 최신 KSP 버전을 확인하려면 GitHub [Releases](https://github.com/google/ksp/releases) 페이지를 참조하세요.
   >
   {style="tip"}

2. Kotlin 클래스에 Dagger 어노테이션을 추가합니다:

   ```kotlin
   import javax.inject.Inject
   import javax.inject.Singleton
   import dagger.Component
   import dagger.Module
   import dagger.Provides
   
   @Singleton
   class UserRepository @Inject constructor() {
       fun getUser(): String = "John Doe"
   }
   
   @Module
   class AppModule {
       @Provides
       @Singleton
       fun provideUserRepository(): UserRepository = UserRepository()
   }
   
   @Singleton
   @Component(modules = [AppModule::class])
   interface AppComponent {
       fun userRepository(): UserRepository
   }
   ```

3. 프로젝트를 빌드합니다. Dagger는 `build/generated/ksp` 디렉터리에 `DaggerAppComponent`와 같은 구현 클래스를 생성합니다. 코드에서 생성된 클래스를 사용합니다:

    ```kotlin
    fun main() {
        val appComponent = DaggerAppComponent.create()
        val userRepository = appComponent.userRepository()
        println("User: ${userRepository.getUser()}")
        // User: John Doe
    }
    ```

Dagger의 KSP 지원에 대한 자세한 내용은 해당 [문서](https://dagger.dev/dev-guide/ksp.html)를 참조하세요.

### 자체 어노테이션 프로세서 만들기 {id="create-your-own-annotation-processor"}

KSP API를 사용하여 컴파일 시점에 코드를 생성하는 자체 어노테이션 프로세서를 작성할 수 있습니다. 새 프로세서를 만들려면 세 개의 모듈이 필요합니다:

* 커스텀 어노테이션을 선언하는 `annotation` 모듈.
* `SymbolProcessor` 및 `SymbolProcessorProvider` 팩토리를 구현하는 `processor` 모듈. `SymbolProcessor`에는 메인 로직이 포함되며, `SymbolProcessorProvider`는 프로세서를 생성하고 공급자(provider)를 `META-INF/services/` 경로에 등록합니다.
* KSP 플러그인을 적용하고 프로세서에 의존하며 어노테이션을 사용하는 `app` 모듈.

단계별 전체 지침은 [KSP 빠른 시작](ksp-quickstart.md#create-your-own-processor)을 참조하세요.

## 다음 단계 {id="what-s-next"}

* [kapt 구성에 대해 자세히 알아보기](kapt.md)
* [KSP 시작하기](ksp-quickstart.md)
* [kapt에서 KSP로 마이그레이션하는 방법 살펴보기](ksp-kapt-migration.md)