[//]: # (title: Kotlin-spring 编译器插件)

`kotlin-spring` 编译器插件用于为 Spring 配置 Kotlin 项目，通过在编译时自动将带有某些 Spring 注解的类和成员标记为 `open`。

该插件是围绕 [`all-open` 插件](all-open-plugin.md) 的预配置包装器，其行为方式相同：当类带有 Spring 注解时，它会将该类及其成员标记为 `open`。你可以在同一个项目中同时使用 `all-open` 和 `kotlin-spring`。

> 如果你使用 [start.spring.io](https://start.spring.io/#!language=kotlin) 生成项目模板，
> 则 `kotlin-spring` 插件默认启用。
>
{style="note"}

## 支持的 Spring 注解 {id="supported-spring-annotations"}

当类带有以下任意 Spring 注解时，该插件会将该类及其成员标记为 `open`：
* [`@Component`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/stereotype/Component.html)
* [`@Async`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/scheduling/annotation/Async.html)
* [`@Transactional`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/transaction/annotation/Transactional.html)
* [`@Cacheable`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/cache/annotation/Cacheable.html)
* [`@SpringBootTest`](https://docs.spring.io/spring-boot/api/java/org/springframework/boot/test/context/SpringBootTest.html)

该插件还支持元注解。使用 [`@Configuration`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/context/annotation/Configuration.html)、
[`@Controller`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/stereotype/Controller.html)、
[`@RestController`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/RestController.html)、
[`@Service`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/stereotype/Service.html)
或 [`@Repository`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/stereotype/Repository.html)
注解的类也会变为 `open`，因为 Spring 用
[`@Component`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/stereotype/Component.html) 对这些注解进行了元注解标记。

## 应用插件 {id="apply-the-plugin"}

### Gradle {id="gradle"}

在 `build.gradle(.kts)` 文件的 `plugins {}` 块中添加 `kotlin-spring` 插件：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("jvm") version "%springBootSupportedKotlinVersion%"  // 要使用的 Kotlin 版本
    kotlin("plugin.spring") version "%springBootSupportedKotlinVersion%" // Kotlin Spring 插件
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id "org.jetbrains.kotlin.jvm" version "%springBootSupportedKotlinVersion%"
    id "org.jetbrains.kotlin.plugin.spring" version "%springBootSupportedKotlinVersion%"
}
```

</tab>
</tabs>

### Maven {id="maven"}

在 Maven 中，对 `kotlin-spring` 插件的支持由 `kotlin-maven-allopen` 插件提供。
请将其添加到你的 `pom.xml` 文件中：

```xml
<properties>
    <kotlin.version>%springBootSupportedKotlinVersion%</kotlin.version>
</properties>

<plugin>
    <groupId>org.jetbrains.kotlin</groupId>
    <artifactId>kotlin-maven-plugin</artifactId>
    <version>${kotlin.version}</version>
    <configuration>
        <args>
            <arg>-Xjsr305=strict</arg>
        </args>
        <compilerPlugins>
            <plugin>spring</plugin>
        </compilerPlugins>
    </configuration>
    <dependencies>
        <dependency>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-allopen</artifactId>
            <version>${kotlin.version}</version>
        </dependency>
    </dependencies>
</plugin>
```

## 使用 `kotlin-spring` 插件 {id="use-the-kotlin-spring-plugin"}

应用该插件后，编译器在编译时会将带有常见 Spring 注解的类视为 `open`。
你可以在编写这些类时无需显式添加 `open` 关键字：

```kotlin
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/")
class MessageController {
    // 此类及其所有成员均为 open
    @GetMapping
    fun listMessages() = listOf(
        Message("1", "Hello!"),
        Message("2", "Bonjour!"),
        Message("3", "Privet!"),
    )
}
```

## 后续步骤 {id="what-s-next"}

* 对于需要无参构造函数的 JPA 实体，请使用 [`kotlin-jpa` 插件](kotlin-jpa-plugin.md)，
  该插件通过 `@Entity`、`@Embeddable` 和 `@MappedSuperclass` 等 JPA 注解来配置 `no-arg` 插件。
* 参阅 [Spring Boot 与 Kotlin 入门](jvm-get-started-spring-boot.md)教程，创建你的第一个 Spring Boot 应用程序。