[//]: # (title: Kotlin-spring 編譯器外掛程式)

`kotlin-spring` 編譯器外掛程式透過在編譯期自動將特定帶有 Spring 註解的類別和成員設為 `open`，來針對 Spring 配置 Kotlin 專案。

此外掛程式是圍繞 [`all-open` 外掛程式](all-open-plugin.md)的預配置包裝器，且運作方式相同：當類別帶有 Spring 註解時，它會將該類別及其成員設為 `open`。你可以在同一個專案中同時使用 `all-open` 和 `kotlin-spring`。

> 如果你使用 [start.spring.io](https://start.spring.io/#!language=kotlin) 產生專案樣板，
> `kotlin-spring` 外掛程式預設會啟用。
>
{style="note"}

## 支援的 Spring 註解 {id="supported-spring-annotations"}

當類別具有以下任何 Spring 註解時，此外掛程式會將該類別及其成員設為 `open`：
* [`@Component`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/stereotype/Component.html)
* [`@Async`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/scheduling/annotation/Async.html)
* [`@Transactional`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/transaction/annotation/Transactional.html)
* [`@Cacheable`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/cache/annotation/Cacheable.html)
* [`@SpringBootTest`](https://docs.spring.io/spring-boot/api/java/org/springframework/boot/test/context/SpringBootTest.html)

此外掛程式也支援元註解。以 [`@Configuration`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/context/annotation/Configuration.html)、
[`@Controller`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/stereotype/Controller.html)、
[`@RestController`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/RestController.html)、
[`@Service`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/stereotype/Service.html)
或 [`@Repository`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/stereotype/Repository.html)
標註的類別也會變為 `open`，因為 Spring 在這些註解上使用了
[`@Component`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/stereotype/Component.html) 作為元註解。

## 套用外掛程式 {id="apply-the-plugin"}

### Gradle {id="gradle"}

在 `build.gradle(.kts)` 檔案的 `plugins {}` 區塊中新增 `kotlin-spring` 外掛程式：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("jvm") version "%springBootSupportedKotlinVersion%"  // 要使用的 Kotlin 版本
    kotlin("plugin.spring") version "%springBootSupportedKotlinVersion%" // Kotlin Spring 外掛程式
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

在 Maven 中，對 `kotlin-spring` 外掛程式的支援是由 `kotlin-maven-allopen` 外掛程式提供。
請將其新增至你的 `pom.xml` 檔案：

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

## 使用 `kotlin-spring` 外掛程式 {id="use-the-kotlin-spring-plugin"}

當你套用此外掛程式時，編譯器會在編譯期將帶有常見 Spring 註解的類別視為 `open`。
你可以直接編寫這些類別，而無需手動加上 `open` 關鍵字：

```kotlin
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/")
class MessageController {
    // 此類別及其所有成員皆為 open
    @GetMapping
    fun listMessages() = listOf(
        Message("1", "Hello!"),
        Message("2", "Bonjour!"),
        Message("3", "Privet!"),
    )
}
```

## 後續步驟 {id="what-s-next"}

* 對於需要零引數建構函式的 JPA 實體，請使用 [`kotlin-jpa` 外掛程式](kotlin-jpa-plugin.md)，它會透過 `@Entity`、`@Embeddable` 和 `@MappedSuperclass` 等 JPA 註解來配置 `no-arg` 外掛程式。
* 透過 [開始使用 Spring Boot 和 Kotlin](jvm-get-started-spring-boot.md) 教學來建立你的第一個 Spring Boot 應用程式。