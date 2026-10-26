[//]: # (title: Kotlin-jpa 编译器插件)

`kotlin-jpa` 编译器插件用于为 Java 持久化 API（Java Persistence API，JPA）配置 Kotlin 项目。
JPA 有两项与 Kotlin 默认特性相冲突的要求：

* **无参构造函数。** JPA 通过反射实例化实体（这一过程称为 _hydration_），这需要一个无参构造函数。而 Kotlin 类默认不声明无参构造函数。
* **非 final 类。** JPA 提供程序会为实体创建代理子类以支持延迟加载（例如，针对 `@ManyToOne` 和 `@OneToOne` 关联）。Kotlin 类及其成员默认均为 `final`，这会阻止该特性的工作。如果实体不是 `open` 的，延迟加载将无法正常运行。

`kotlin-jpa` 插件同时解决了这两个问题。它是一个预配置的包装器，应用了以下插件：

* [`no-arg` 插件](no-arg-plugin.md)：为带有 JPA 注解的类生成无参构造函数。
* [`all-open` 插件](all-open-plugin.md)：将带有 JPA 注解的类及其成员设为 `open`。

生成的构造函数会被标记为 `HIDDEN` 级别的 `@Deprecated` 注解，因此你可以从 Java 中调用它，但不能在 Kotlin 中直接调用。JPA 则可以通过反射调用它。

> 如果你使用 [start.spring.io](https://start.spring.io/#!language=kotlin) 并添加 JPA 依赖项来生成项目模板，`kotlin-jpa` 插件将默认启用。
>
{style="note"}

## 支持的 JPA 注解 {id="supported-jpa-annotations"}

JPA 注解存在于两个包命名空间中：较旧的 `javax.persistence`（Java EE）以及较新的 `jakarta.persistence`（自 Jakarta EE 9 起引入，由 Spring Boot 3.x 及更高版本使用）。`kotlin-jpa` 插件可识别这两个命名空间，并自动为底层的 `no-arg` 和 `all-open` 插件指定以下注解：

* `javax.persistence.Entity` 和 `jakarta.persistence.Entity`
* `javax.persistence.Embeddable` 和 `jakarta.persistence.Embeddable`
* `javax.persistence.MappedSuperclass` 和 `jakarta.persistence.MappedSuperclass`

请使用与你的框架版本相匹配的命名空间注解。你无需针对其中任何一个命名空间专门配置该插件：两者均默认启用。

## 应用插件 {id="apply-the-plugin"}

### Gradle {id="gradle"}

在 `build.gradle(.kts)` 文件的 `plugins {}` 代码块中添加 `kotlin-jpa` 插件：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("jvm") version "%kotlinVersion%"  // 要使用的 Kotlin 版本
    kotlin("plugin.jpa") version "%kotlinVersion%" // Kotlin JPA 插件
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id "org.jetbrains.kotlin.jvm" version "%kotlinVersion%"
    id "org.jetbrains.kotlin.plugin.jpa" version "%kotlinVersion%"
}
```

</tab>
</tabs>

### Maven {id="maven"}

在 Maven 中，对 `kotlin-jpa` 插件的支持由 `kotlin-maven-noarg` 插件提供。请将其添加到你的 `pom.xml` 文件中：

```xml
<properties>
    <kotlin.version>%kotlinVersion%</kotlin.version>
</properties>

<plugin>
    <groupId>org.jetbrains.kotlin</groupId>
    <artifactId>kotlin-maven-plugin</artifactId>
    <version>${kotlin.version}</version>
    <configuration>
        <compilerPlugins>
            <plugin>jpa</plugin>
        </compilerPlugins>
    </configuration>
    <dependencies>
        <dependency>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-noarg</artifactId>
            <version>${kotlin.version}</version>
        </dependency>
    </dependencies>
</plugin>
```

> 自 Kotlin 2.3.20 起，`kotlin-maven-noarg` 隐式包含了 `kotlin-maven-allopen`，因此你无需再显式添加 `all-open` 依赖项。
>
{style="note"}

## 使用 `kotlin-jpa` 插件 {id="use-the-kotlin-jpa-plugin"}

应用该插件后，带有常用 JPA 注解的类在编译期将自动变为 `open`，并生成一个无参构造函数。你可以直接将实体编写为常规类，而无需手动添加 `open` 关键字或手动声明无参构造函数。

以下示例使用 `jakarta.persistence` 命名空间。如果你的框架仍在使用 Java EE，请改为从 `javax.persistence` 导入相同的注解，该插件对两者均提供支持：

```kotlin
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.Id

@Entity
class Message(
    var text: String,
) {
    // kotlin-jpa 插件会将此类设为 open 并生成一个
    // 供 JPA 反射实例化使用的无参构造函数
    @Id
    @GeneratedValue
    var id: Long? = null
}
```

## JPA 实体的最佳实践 {id="best-practices-for-jpa-entities"}

虽然应用该插件可以使实体变为 `open` 并为其提供无参构造函数，但 Kotlin 的部分惯用语法仍可能与 JPA 提供程序管理实体的方式发生冲突。请遵循以下准则以避免常见问题：

* **使用常规类，而不是 `data class`。** 数据类偏好不可变的 `val` 属性，并且会基于所有属性派生 `equals()`、`hashCode()` 和 `toString()`。对于实体而言，这会破坏代理机制，且 `toString()` 或 `equals()` 可能会在延迟关联上触发额外的查询。建议将实体建模为常规类（插件会将其设为 `open`），并将数据类仅用于 DTO 和查询结果。
* **将映射属性声明为 `var`。** JPA 在对实体进行组装（hydrate）时会设置字段，因此映射属性必须是可变的。
* **使生成的标识符可空且可变。** 带有 `@GeneratedValue` 的标识符在实体被持久化之前为 `null`，因此应声明为 `var id: Long? = null`。
  
  > 在 Kotlin 中不能对基本数据类型使用 `lateinit`。
  >
  {style="note"}
  
* **仅基于标识符和类型实现 `equals()` 和 `hashCode()`**，而不是基于所有属性。这可确保它们在实体的整个生命周期中保持稳定，并避免加载延迟加载字段。

有关这些陷阱的详细讨论，请参阅博客文章[如何避免 JPA 与 Kotlin 的常见陷阱](https://blog.jetbrains.com/idea/2026/01/how-to-avoid-common-pitfalls-with-jpa-and-kotlin/)。

## 涵盖未带有 JPA 注解的类 {id="cover-classes-without-jpa-annotations"}

`kotlin-jpa` 插件仅配置了[受支持的 JPA 注解](#supported-jpa-annotations)。若要为未带有 JPA 注解的类型生成无参构造函数或将它们设为 `open`，你可以声明自己的注解，并将其注册到底层的 `no-arg` 和 `all-open` 插件中：

1. 声明你自己的注解：

   ```kotlin
   package com.example

   annotation class OpenNoArgAnnotation
   ```

2. 在构建文件中，向底层插件注册该注解：

   <tabs group="build-script">
   <tab title="Gradle (Kotlin)" group-key="kotlin">

   在 `build.gradle.kts` 文件中，在通过 `kotlin-jpa` 插件提供的 `noArg {}` 和 `allOpen {}` 代码块中注册该注解：

   ```kotlin
   plugins {
       kotlin("jvm") version "%kotlinVersion%"
       kotlin("plugin.jpa") version "%kotlinVersion%"
   }

   noArg {
       annotation("com.example.OpenNoArgAnnotation")
   }

   allOpen {
       annotation("com.example.OpenNoArgAnnotation")
   }
   ```

   </tab>
   <tab title="Gradle (Groovy)" group-key="groovy">

   在 `build.gradle` 文件中，在通过 `kotlin-jpa` 插件提供的 `noArg {}` 和 `allOpen {}` 代码块中注册该注解：

   ```groovy
   plugins {
       id "org.jetbrains.kotlin.jvm" version "%kotlinVersion%"
       id "org.jetbrains.kotlin.plugin.jpa" version "%kotlinVersion%"
   }

   noArg {
       annotation("com.example.OpenNoArgAnnotation")
   }

   allOpen {
       annotation("com.example.OpenNoArgAnnotation")
   }
   ```

   </tab>
   <tab title="Maven" group-key="maven">

   在 `pom.xml` 文件中，将 `no-arg:annotation` 和 `all-open:annotation` 选项添加到 `kotlin-maven-plugin` 的配置中：

   ```xml
   <properties>
       <kotlin.version>%kotlinVersion%</kotlin.version>
   </properties>

   <plugin>
       <groupId>org.jetbrains.kotlin</groupId>
       <artifactId>kotlin-maven-plugin</artifactId>
       <version>${kotlin.version}</version>
       <configuration>
           <compilerPlugins>
               <plugin>jpa</plugin>
           </compilerPlugins>

           <pluginOptions>
               <!-- 若有多个注解，请添加多行 -->
               <option>no-arg:annotation=com.example.OpenNoArgAnnotation</option>
               <option>all-open:annotation=com.example.OpenNoArgAnnotation</option>
           </pluginOptions>
       </configuration>
       <dependencies>
           <dependency>
               <groupId>org.jetbrains.kotlin</groupId>
               <artifactId>kotlin-maven-noarg</artifactId>
               <version>${kotlin.version}</version>
           </dependency>
       </dependencies>
   </plugin>
   ```

   </tab>
   </tabs>

3. 标记未带有 JPA 注解的类：

   ```kotlin
   package com.example

   import jakarta.persistence.Entity
   import jakarta.persistence.GeneratedValue
   import jakarta.persistence.Id

   // 由 kotlin-jpa 插件自动支持
   @Entity
   class Message(
       var text: String,
   ) {
       @Id
       @GeneratedValue
       var id: Long? = null
   }

   // 自定义注解将此类设为 open
   // 并生成无参构造函数
   @OpenNoArgAnnotation
   class MessageMetadata(
       var author: String,
   )
   ```

有关更多详细信息，请参阅 [`no-arg`](no-arg-plugin.md) 和 [`all-open`](all-open-plugin.md)。

## 后续步骤 {id="what-s-next"}

* 阅读关于[如何避免常见实体映射问题](https://blog.jetbrains.com/idea/2026/01/how-to-avoid-common-pitfalls-with-jpa-and-kotlin/)的博客文章。
* 对于需要将类设为 `open` 的 Spring 应用程序，请使用 [`kotlin-spring` 插件](kotlin-spring-plugin.md)，该插件会为 `all-open` 插件配置诸如 `@Component`、`@Transactional` 和 `@Configuration` 等 Spring 注解。
* 参考 [Spring Boot 与 Kotlin 入门](jvm-get-started-spring-boot.md)教程创建你的第一个 Spring Boot 应用程序。