[//]: # (title: 在 Kotlin 專案中使用註解處理器)

<tldr>

* 在以下情況使用 **[kapt](kapt.md)**：
  * 你使用的是 Maven 專案。
  * 你使用的是 Gradle 專案，但所需的 Java 註解處理器尚不支援 KSP。[請參閱支援的程式庫清單](ksp-overview.md#supported-libraries)。
* 在以下情況使用 **[KSP](ksp-overview.md)**：
  * 你使用的是 Gradle 專案，且所需的 Java 註解處理器支援 KSP。
  * 你想要建立自己的註解處理器。

</tldr>

註解處理器會在編譯期分析你的原始碼，以產生樣板程式碼、驗證用法或產出其他產物。
Kotlin 支援兩種搭配註解處理器運作的方式：

* [kapt 編譯器外掛程式](#use-kapt-with-java-annotation-processors) 的運作方式是從 Kotlin 原始碼產生虛設常式 (stub) 檔案，然後在這些虛設常式上執行 Java 註解處理器。這個額外的虛設常式產生步驟會使建置時間變慢，而且代表 kapt 無法理解 Kotlin 特有的建構，例如[擴充函式](extensions.md)或 [null 安全性](null-safety.md)。

  kapt 同時支援 Maven 和 Gradle。建議用於所有 Maven 專案，以及處理器程式庫尚未採用 KSP 的 Gradle 專案，例如 [MapStruct](https://mapstruct.org/)。

* [KSP 架構](#use-ksp-in-gradle-projects) 透過 Kotlin 優先的 API 直接讀取 Kotlin 原始碼，無需產生虛設常式。它能原生理解 Kotlin 特有的功能，且建置速度比 kapt 更快。

  目前 KSP 僅對 Gradle 提供官方支援。建議用於編寫你自己的處理器，以及與相容 KSP 的程式庫（如 [Dagger](https://dagger.dev/)）搭配使用。

## 搭配 Java 註解處理器使用 kapt {id="use-kapt-with-java-annotation-processors"}

[kapt](kapt.md) 讓您可以在 Kotlin 專案中使用現有的 Java 註解處理器，而無需對處理器本身進行任何修改。

以下範例展示如何使用 [MapStruct](https://mapstruct.org/) 註解處理器，該處理器會在編譯期產生 Java bean 之間型別安全的映射器實作。

1. 在你的建置檔中套用 `kapt` 外掛程式，並將 MapStruct 新增至 `dependencies` 區段：

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
   
   * `<extensions>true</extensions>` 選項會[自動地](maven-configure-project.md#automatic-configuration)配置 kapt。它會註冊 `src/main/kotlin` 與 `src/test/kotlin` 原始碼根目錄，並新增繫結至正確生命週期階段的 `kapt` 與 `compile` 執行項目，使 `kapt` 目標會在編譯前執行。
   * `maven.compiler.release` 屬性會同時配置 Java 與 Kotlin 編譯器，因此由 kapt 產生的 Java 原始碼會針對相同的 JVM 目標進行編譯。

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

2. 定義你的資料類別與映射器介面：

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

## 在 Gradle 專案中使用 KSP {id="use-ksp-in-gradle-projects"}

透過 [KSP](ksp-overview.md)，你可以在 Gradle 專案中使用現有的註解處理器，並建立自己的處理器以根據原始碼中的註解產生程式碼。

### 搭配 Java 註解處理器使用 KSP {id="use-ksp-with-java-annotation-processors"}

對於 Gradle 專案，請搭配相容的註解處理器使用 KSP。KSP 比 kapt 更快，並且能夠原生理解 Kotlin 特有的功能。請參閱[已支援 KSP 的程式庫](ksp-overview.md#supported-libraries)清單。

以下範例展示如何使用 [Dagger](https://dagger.dev/)，這是一個編譯期相依注入架構，可為你的相依圖產生連接程式碼。

1. 在你的 `build.gradle(.kts)` 檔案中套用 KSP 外掛程式，並將 Dagger 新增至 `dependencies` 區塊：
 
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

   > 若要尋找 KSP 的最新版本，請查看 GitHub [Releases](https://github.com/google/ksp/releases) 頁面。
   >
   {style="tip"}

2. 使用 Dagger 註解來標註你的 Kotlin 類別：

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

3. 建置專案。Dagger 會在 `build/generated/ksp` 目錄中產生實作類別（例如 `DaggerAppComponent`）。在你的程式碼中使用產生的類別：

    ```kotlin
    fun main() {
        val appComponent = DaggerAppComponent.create()
        val userRepository = appComponent.userRepository()
        println("User: ${userRepository.getUser()}")
        // User: John Doe
    }
    ```

如需有關 Dagger 支援 KSP 的詳細資訊，請參閱其[文件](https://dagger.dev/dev-guide/ksp.html)。

### 建立自己的註解處理器 {id="create-your-own-annotation-processor"}

你可以使用 KSP API 編寫自己的註解處理器，以便在編譯期產生程式碼。
一個新的處理器需要三個模組：

* 一個宣告自訂註解的 `annotation` 模組。
* 一個實作 `SymbolProcessor` 與 `SymbolProcessorProvider` 工廠的 `processor` 模組。`SymbolProcessor` 包含主要邏輯，而 `SymbolProcessorProvider` 負責建立處理器並在 `META-INF/services/` 路徑中註冊提供者。
* 一個套用 KSP 外掛程式、相依於該處理器並使用該註解的 `app` 模組。

如需完整的逐步說明，請參閱 [KSP 快速入門指南](ksp-quickstart.md#create-your-own-processor)。

## 下一步 {id="what-s-next"}

* [進一步了解 kapt 配置](kapt.md)
* [開始使用 KSP](ksp-quickstart.md)
* [了解如何從 kapt 遷移到 KSP](ksp-kapt-migration.md)