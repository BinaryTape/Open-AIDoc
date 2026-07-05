[//]: # (title: 在 Kotlin 專案中使用註解處理器)

<tldr>

* 符合以下情況時，請使用 **[kapt](kapt.md)**：
  * 您使用的是 Maven 專案。
  * 您使用的是 Gradle 專案，但所需的 Java 註解處理器尚不支援 KSP。[查看支援的程式庫列表](ksp-overview.md#supported-libraries)。
* 符合以下情況時，請使用 **[KSP](ksp-overview.md)**：
  * 您使用的是 Gradle 專案，且所需的 Java 註解處理器支援 KSP。
  * 您想建立自己的註解處理器。

</tldr>

註解處理器在編譯時期分析您的原始碼，以產生樣板程式碼、驗證用法或產出其他產物。
Kotlin 支援兩種使用註解處理器的方法：

* [kapt 編譯器外掛程式](#use-kapt-with-java-annotation-processors) 的運作方式是從 Kotlin 原始碼產生虛設常式檔案，然後在這些虛設常式上執行 Java 註解處理器。這個額外的虛設常式產生步驟會使建置時間變慢，也意味著 kapt 無法理解 Kotlin 特有的結構，例如 [擴充函式](extensions.md) 或 [null 安全性](null-safety.md)。

  kapt 支援 Maven 和 Gradle。推薦所有 Maven 專案，以及尚未採用 KSP 的處理器程式庫（例如 [MapStruct](https://mapstruct.org/)）的 Gradle 專案使用。

* [KSP 架構](#use-ksp-in-gradle-projects) 透過 Kotlin 優先的 API 直接讀取 Kotlin 原始碼，不產生虛設常式。它原生地理解 Kotlin 特有的特性，且建置速度比 kapt 快。

  目前，KSP 僅對 Gradle 提供官方支援。推薦用於編寫您自己的處理器以及與相容 KSP 的程式庫（例如 [Dagger](https://dagger.dev/)）配合使用。

## 搭配 Java 註解處理器使用 kapt

[kapt](kapt.md) 讓您可以在 Kotlin 專案中使用現有的 Java 註解處理器，而無需對處理器本身進行任何變更。

以下範例展示如何使用 [MapStruct](https://mapstruct.org/) 註解處理器，它會在編譯時期產生 Java bean 之間型別安全的映射實作。

1. 在您的建置檔案中，套用 `kapt` 外掛程式並將 MapStruct 加入 `dependencies` 區段：

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
   
   * 在 `compile` 執行 **之前** 加入 `kotlin-maven-plugin` 的 `kapt` goal 執行。
   * 使用 `aptMode` 選項配置 [註解處理模式](kapt.md#set-up-in-maven)。

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

2. 定義您的資料類別和一個映射器介面：

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

3. 建置專案。MapStruct 會在產生的原始碼目錄中產生 `UserMapperImpl` 類別。使用 `UserMapper` 伴生物件來呼叫產生的實作：

   ```kotlin
   fun main() {
       val entity = UserEntity(id = 1L, firstName = "John", lastName = "Doe")
       val dto = UserMapper.toDto(entity)
       println(dto)
       // UserDto(id=1, firstName=John, lastName=Doe)
   }
   ```

## 在 Gradle 專案中使用 KSP

透過 [KSP](ksp-overview.md)，您可以在 Gradle 專案中使用現有的註解處理器，並建立您自己的處理器，根據原始碼中的註解產生程式碼。

### 搭配 Java 註解處理器使用 KSP

對於 Gradle 專案，請搭配相容的註解處理器使用 KSP。KSP 比 kapt 更快，且能原生地理解 Kotlin 特有的特性。請參閱 [已經支援 KSP 的程式庫](ksp-overview.md#supported-libraries) 列表。

以下範例展示如何使用 [Dagger](https://dagger.dev/)，這是一個編譯時期相依注入架構，可為您的相依圖產生連接程式碼。

1. 在您的 `build.gradle(.kts)` 檔案中，套用 KSP 外掛程式並將 Dagger 加入 `dependencies` 區段：
 
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

   > 要尋找 KSP 的最新版本，請查看 GitHub [Releases](https://github.com/google/ksp/releases) 頁面。
   >
   {style="tip"}

2. 使用 Dagger 註解標記您的 Kotlin 類別：

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

3. 建置專案。Dagger 會在 `build/generated/ksp` 目錄中產生實作類別，例如 `DaggerAppComponent`。在您的程式碼中使用產生的類別：

    ```kotlin
    fun main() {
        val appComponent = DaggerAppComponent.create()
        val userRepository = appComponent.userRepository()
        println("User: ${userRepository.getUser()}")
        // User: John Doe
    }
    ```

有關 Dagger 支援 KSP 的更多資訊，請參閱其 [文件](https://dagger.dev/dev-guide/ksp.html)。

### 建立您自己的註解處理器

您可以使用 KSP API 編寫您自己的註解處理器，在編譯時期產生程式碼。一個新的處理器需要三個模組：

* 一個宣告自訂註解的 `annotation` 模組。
* 一個實作 `SymbolProcessor` 和 `SymbolProcessorProvider` 工廠的 `processor` 模組。`SymbolProcessor` 包含主要邏輯，而 `SymbolProcessorProvider` 則建立處理器並在 `META-INF/services/` 路徑中註冊供應商。
* 一個套用 KSP 外掛程式、相依於該處理器並使用該註解的 `app` 模組。

如需完整的逐步說明，請參閱 [KSP 快速入門](ksp-quickstart.md#create-your-own-processor)。

## 下一步

* [進一步了解 kapt 配置](kapt.md)
* [開始使用 KSP](ksp-quickstart.md)
* [了解如何從 kapt 遷移到 KSP](ksp-kapt-migration.md)