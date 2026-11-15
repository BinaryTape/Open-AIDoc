[//]: # (title: 在 Kotlin 项目中使用注解处理器)

<tldr>

* 满足以下条件时使用 **[kapt](kapt.md)**：
  * 这是一个 Maven 项目。
  * 这是一个 Gradle 项目，但所需的 Java 注解处理器尚不支持 KSP。[查看受支持库的列表](ksp-overview.md#supported-libraries)。
* 满足以下条件时使用 **[KSP](ksp-overview.md)**：
  * 这是一个 Gradle 项目，且所需的 Java 注解处理器支持 KSP。
  * 想要创建自定义注解处理器。

</tldr>

注解处理器在编译期分析源代码，以生成模板代码、验证用法或生成其他构件。
Kotlin 支持两种使用注解处理器的方式：

* [kapt 编译器插件](#use-kapt-with-java-annotation-processors) 的工作原理是从 Kotlin 源代码生成存根文件，然后在这些存根上运行 Java 注解处理器。这一额外的存根生成步骤导致构建时间变慢，并且意味着 kapt 无法理解 Kotlin 特有的结构，例如[扩展函数](extensions.md)或[空安全](null-safety.md)。

  kapt 同时支持 Maven 和 Gradle。建议在所有 Maven 项目以及使用尚未采用 KSP 的处理器库（例如 [MapStruct](https://mapstruct.org/)）的 Gradle 项目中使用。

* [KSP 框架](#use-ksp-in-gradle-projects)通过以 Kotlin 优先的 API 直接读取 Kotlin 源代码，无需生成存根。它原生理解 Kotlin 特有功能，并且构建速度快于 kapt。

  目前，KSP 仅官方支持 Gradle。推荐用于编写自定义处理器以及与兼容 KSP 的库（如 [Dagger](https://dagger.dev/)）协同工作。

## 将 kapt 与 Java 注解处理器结合使用 {id="use-kapt-with-java-annotation-processors"}

[kapt](kapt.md) 允许你在 Kotlin 项目中使用现有的 Java 注解处理器，而无需对处理器本身进行任何更改。

下面的示例展示了如何使用 [MapStruct](https://mapstruct.org/) 注解处理器，该处理器在编译期生成 JavaBeans 之间的类型安全映射器实现。

1. 在构建文件中应用 `kapt` 插件并将 MapStruct 添加到 `dependencies` 部分：

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
   
   * `<extensions>true</extensions>` 选项会[自动](maven-configure-project.md#automatic-configuration)配置 kapt。它会注册 `src/main/kotlin` 和 `src/test/kotlin` 源根目录，并添加绑定到正确生命周期阶段的 `kapt` 和 `compile` 执行，从而使 `kapt` 目标在编译之前运行。
   * `maven.compiler.release` 属性同时配置 Java 和 Kotlin 编译器，以便 kapt 生成的 Java 源文件针对相同的 JVM 目标进行编译。

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

2. 定义数据类和映射器接口：

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

3. 构建项目。MapStruct 会在生成的源文件目录中生成 `UserMapperImpl` 类。使用 `UserMapper` 伴生对象调用生成的实现：

   ```kotlin
   fun main() {
       val entity = UserEntity(id = 1L, firstName = "John", lastName = "Doe")
       val dto = UserMapper.toDto(entity)
       println(dto)
       // UserDto(id=1, firstName=John, lastName=Doe)
   }
   ```

## 在 Gradle 项目中使用 KSP {id="use-ksp-in-gradle-projects"}

通过 [KSP](ksp-overview.md)，你可以在 Gradle 项目中使用现有的注解处理器，并创建根据源代码中的注解生成代码的自定义处理器。

### 将 KSP 与 Java 注解处理器结合使用 {id="use-ksp-with-java-annotation-processors"}

对于 Gradle 项目，请使用 KSP 配合兼容的注解处理器。KSP 比 kapt 更快，并且可以原生理解 Kotlin 特有功能。请参阅[已支持 KSP 的库](ksp-overview.md#supported-libraries)列表。

下面的示例展示了如何使用 [Dagger](https://dagger.dev/)，这是一个编译期依赖注入框架，可为依赖关系图生成装配代码。

1. 在 `build.gradle(.kts)` 文件中，应用 KSP 插件并将 Dagger 添加到 `dependencies` 块中：
 
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

   > 要查找 KSP 的最新版本，请查看 GitHub [Releases](https://github.com/google/ksp/releases) 页面。
   >
   {style="tip"}

2. 使用 Dagger 注解标记 Kotlin 类：

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

3. 构建项目。Dagger 会在 `build/generated/ksp` 目录中生成实现类，例如 `DaggerAppComponent`。在代码中使用生成的类：

    ```kotlin
    fun main() {
        val appComponent = DaggerAppComponent.create()
        val userRepository = appComponent.userRepository()
        println("User: ${userRepository.getUser()}")
        // User: John Doe
    }
    ```

有关 Dagger 对 KSP 支持的更多信息，请参阅其[文档](https://dagger.dev/dev-guide/ksp.html)。

### 创建自定义注解处理器 {id="create-your-own-annotation-processor"}

你可以使用 KSP API 编写在编译期生成代码的自定义注解处理器。一个新处理器需要三个模块：

* 声明自定义注解的 `annotation` 模块。
* 实现 `SymbolProcessor` 和 `SymbolProcessorProvider` 工厂的 `processor` 模块。`SymbolProcessor` 包含主要逻辑，而 `SymbolProcessorProvider` 负责创建处理器并在 `META-INF/services/` 路径中注册提供程序。
* 应用 KSP 插件、依赖该处理器并使用该注解的 `app` 模块。

有关完整的分步说明，请参阅 [KSP 快速入门指南](ksp-quickstart.md#create-your-own-processor)。

## 后续步骤 {id="what-s-next"}

* [详细了解 kapt 配置](kapt.md)
* [KSP 入门](ksp-quickstart.md)
* [查看如何从 kapt 迁移到 KSP](ksp-kapt-migration.md)