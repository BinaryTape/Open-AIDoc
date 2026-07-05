[//]: # (title: Kotlin 프로젝트에서 어노테이션 프로세서 사용하기)

<tldr>

* 다음의 경우 **[kapt](kapt.md)**를 사용하세요:
  * Maven 프로젝트를 사용하는 경우.
  * Gradle 프로젝트를 사용하지만, 필요한 Java 어노테이션 프로세서가 아직 KSP를 지원하지 않는 경우. [지원되는 라이브러리 목록 보기](ksp-overview.md#supported-libraries).
* 다음의 경우 **[KSP](ksp-overview.md)**를 사용하세요:
  * Gradle 프로젝트를 사용하고, 필요한 Java 어노테이션 프로세서가 KSP를 지원하는 경우.
  * 자신만의 어노테이션 프로세서를 만들고 싶은 경우.

</tldr>

어노테이션 프로세서는 컴파일 시점에 소스 코드를 분석하여 보일러플레이트(boilerplate) 코드를 생성하거나, 사용법을 검증하거나, 기타 아티팩트를 생성합니다.
Kotlin은 어노테이션 프로세서를 사용하는 두 가지 방법을 지원합니다:

* [kapt 컴파일러 플러그인](#use-kapt-with-java-annotation-processors)은 Kotlin 소스 코드에서 스텁(stub) 파일을 생성한 다음, 해당 스텁에서 Java 어노테이션 프로세서를 실행하는 방식으로 작동합니다. 이 추가적인 스텁 생성 단계로 인해 빌드 시간이 느려지며, kapt가 [확장 함수](extensions.md)나 [널 안전성](null-safety.md)과 같은 Kotlin 특유의 구조를 이해할 수 없음을 의미합니다.

  kapt는 Maven과 Gradle을 모두 지원합니다. 모든 Maven 프로젝트와 [MapStruct](https://mapstruct.org/)와 같이 아직 KSP를 채택하지 않은 프로세서 라이브러리를 사용하는 Gradle 프로젝트에 권장됩니다.

* [KSP 프레임워크](#use-ksp-in-gradle-projects)는 스텁을 생성하지 않고 Kotlin 우선(Kotlin-first) API를 통해 Kotlin 소스 코드를 직접 읽습니다. Kotlin 고유의 기능을 네이티브하게 이해하며 kapt보다 빌드 속도가 빠릅니다.

  현재 KSP는 Gradle에 대해서만 공식 지원을 제공합니다. 자신만의 프로세서를 작성하거나 [Dagger](https://dagger.dev/)와 같이 KSP와 호환되는 라이브러리를 사용하는 경우에 권장됩니다.

## Java 어노테이션 프로세서와 함께 kapt 사용하기

[kapt](kapt.md)를 사용하면 프로세서 자체를 변경하지 않고도 Kotlin 프로젝트에서 기존 Java 어노테이션 프로세서를 사용할 수 있습니다.

아래 예제는 컴파일 시점에 Java 빈(bean) 사이의 타입 안전한 매퍼 구현체를 생성하는 [MapStruct](https://mapstruct.org/) 어노테이션 프로세서를 사용하는 방법을 보여줍니다.

1. 빌드 파일에서 `kapt` 플러그인을 적용하고 `dependencies` 섹션에 MapStruct를 추가합니다:

   <tabs group="build-tool">
   <tab title="Maven" group-key="maven">
   
   ```xml
   <properties>
       <kotlin.compiler.jvmTarget>11</kotlin.compiler.jvmTarget>
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
       <executions>
           <execution>
               <id>kapt</id>
               <goals>
                   <goal>kapt</goal>
               </goals>
               <configuration>
                   <sourceDirs>
                       <sourceDir>src/main/kotlin</sourceDir>
                       <sourceDir>src/main/java</sourceDir>
                   </sourceDirs>
                   <aptMode>stubs</aptMode>
                   <annotationProcessorPaths>
                       <annotationProcessorPath>
                           <groupId>org.mapstruct</groupId>
                           <artifactId>mapstruct-processor</artifactId>
                           <version>${mapstruct.version}</version>
                       </annotationProcessorPath>
                   </annotationProcessorPaths>
               </configuration>
           </execution>
       </executions>
   </plugin>
   ```
   
   * `compile` 실행 **전**에 `kotlin-maven-plugin`의 `kapt` 골(goal) 실행을 추가합니다.
   * `aptMode` 옵션을 사용하여 [어노테이션 프로세싱 모드](kapt.md#set-up-in-maven)를 구성합니다.

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

3. 프로젝트를 빌드합니다. MapStruct는 생성된 소스 디렉토리에 `UserMapperImpl` 클래스를 생성합니다.
   `UserMapper` 컴패니언 객체를 사용하여 생성된 구현체를 호출합니다:

   ```kotlin
   fun main() {
       val entity = UserEntity(id = 1L, firstName = "John", lastName = "Doe")
       val dto = UserMapper.toDto(entity)
       println(dto)
       // UserDto(id=1, firstName=John, lastName=Doe)
   }
   ```

## Gradle 프로젝트에서 KSP 사용하기

[KSP](ksp-overview.md)를 사용하면 Gradle 프로젝트에서 기존 어노테이션 프로세서를 사용하거나, 소스 코드의 어노테이션을 기반으로 코드를 생성하는 고유한 프로세서를 만들 수 있습니다.

### Java 어노테이션 프로세서와 함께 KSP 사용하기

Gradle 프로젝트의 경우, 호환되는 어노테이션 프로세서와 함께 KSP를 사용하세요. KSP는 kapt보다 빠르며 Kotlin 고유의 기능을 네이티브하게 이해할 수 있습니다. [이미 KSP를 지원하는 라이브러리](ksp-overview.md#supported-libraries) 목록을 확인하세요.

아래 예제는 의존성 그래프를 위한 연결 코드를 생성하는 컴파일 시점 의존성 주입(dependency injection) 프레임워크인 [Dagger](https://dagger.dev/)를 사용하는 방법을 보여줍니다.

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

   > KSP의 최신 버전을 찾으려면 GitHub [Releases](https://github.com/google/ksp/releases) 페이지를 확인하세요.
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

3. 프로젝트를 빌드합니다. Dagger는 `build/generated/ksp` 디렉토리에 `DaggerAppComponent`와 같은 구현 클래스를 생성합니다. 코드에서 생성된 클래스를 사용합니다:

    ```kotlin
    fun main() {
        val appComponent = DaggerAppComponent.create()
        val userRepository = appComponent.userRepository()
        println("User: ${userRepository.getUser()}")
        // User: John Doe
    }
    ```

Dagger의 KSP 지원에 대한 자세한 내용은 해당 [문서](https://dagger.dev/dev-guide/ksp.html)를 참조하세요.

### 자신만의 어노테이션 프로세서 만들기

KSP API를 사용하여 컴파일 시점에 코드를 생성하는 고유한 어노테이션 프로세서를 작성할 수 있습니다.
새로운 프로세서에는 세 가지 모듈이 필요합니다:

* 커스텀 어노테이션을 선언하는 `annotation` 모듈.
* `SymbolProcessor` 및 `SymbolProcessorProvider` 팩토리를 구현하는 `processor` 모듈. `SymbolProcessor`에는 주요 로직이 포함되며, `SymbolProcessorProvider`는 프로세서를 생성하고 `META-INF/services/` 경로에 프로바이더를 등록합니다.
* KSP 플러그인을 적용하고, 프로세서에 의존하며, 어노테이션을 사용하는 `app` 모듈.

단계별 전체 안내는 [KSP 퀵스타트](ksp-quickstart.md#create-your-own-processor)를 참조하세요.

## 다음 단계

* [kapt 구성에 대해 더 알아보기](kapt.md)
* [KSP 시작하기](ksp-quickstart.md)
* [kapt에서 KSP로 마이그레이션하는 방법 보기](ksp-kapt-migration.md)