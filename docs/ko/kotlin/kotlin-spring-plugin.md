[//]: # (title: Kotlin-spring 컴파일러 플러그인)

`kotlin-spring` 컴파일러 플러그인은 특정 Spring 애너테이션이 지정된 클래스와 멤버를 컴파일 타임에 자동으로 `open`으로 만들어 Spring을 위한 Kotlin 프로젝트를 구성합니다.

이 플러그인은 [`all-open` 플러그인](all-open-plugin.md)을 사전 구성하여 감싼 래퍼(wrapper)이며 동일하게 동작합니다. 즉, Spring 애너테이션이 있는 클래스와 해당 멤버를 `open`으로 만듭니다. 동일한 프로젝트에서 `all-open`과 `kotlin-spring`을 둘 다 사용할 수도 있습니다.

> [start.spring.io](https://start.spring.io/#!language=kotlin)를 사용하여 프로젝트 템플릿을 생성하면 `kotlin-spring` 플러그인이 기본적으로 활성화됩니다.
>
{style="note"}

## 지원되는 Spring 애너테이션 {id="supported-spring-annotations"}

플러그인은 클래스에 다음과 같은 Spring 애너테이션 중 하나라도 지정되어 있으면 해당 클래스와 멤버를 `open`으로 만듭니다.
* [`@Component`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/stereotype/Component.html)
* [`@Async`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/scheduling/annotation/Async.html)
* [`@Transactional`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/transaction/annotation/Transactional.html)
* [`@Cacheable`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/cache/annotation/Cacheable.html)
* [`@SpringBootTest`](https://docs.spring.io/spring-boot/api/java/org/springframework/boot/test/context/SpringBootTest.html)

이 플러그인은 메타 애너테이션(meta-annotation)도 지원합니다. [`@Configuration`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/context/annotation/Configuration.html), [`@Controller`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/stereotype/Controller.html), [`@RestController`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/RestController.html), [`@Service`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/stereotype/Service.html) 또는 [`@Repository`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/stereotype/Repository.html)가 지정된 클래스 역시 `open`이 되는데, Spring이 이러한 애너테이션들에 [`@Component`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/stereotype/Component.html)를 메타 애너테이션으로 지정하고 있기 때문입니다.

## 플러그인 적용하기 {id="apply-the-plugin"}

### Gradle {id="gradle"}

`build.gradle(.kts)` 파일의 `plugins {}` 블록에 `kotlin-spring` 플러그인을 추가합니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("jvm") version "%springBootSupportedKotlinVersion%"  // 사용할 Kotlin 버전
    kotlin("plugin.spring") version "%springBootSupportedKotlinVersion%" // Kotlin Spring 플러그인
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

Maven에서는 `kotlin-maven-allopen` 플러그인을 통해 `kotlin-spring` 플러그인에 대한 지원이 제공됩니다. `pom.xml` 파일에 다음과 같이 추가합니다.

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

## `kotlin-spring` 플러그인 사용하기 {id="use-the-kotlin-spring-plugin"}

플러그인을 적용하면 컴파일러는 컴파일 시 일반적인 Spring 애너테이션이 있는 클래스를 `open`으로 처리합니다. 따라서 `open` 키워드를 직접 추가하지 않고도 이러한 클래스를 작성할 수 있습니다.

```kotlin
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/")
class MessageController {
    // 이 클래스와 모든 멤버는 open 상태가 됩니다
    @GetMapping
    fun listMessages() = listOf(
        Message("1", "Hello!"),
        Message("2", "Bonjour!"),
        Message("3", "Privet!"),
    )
}
```

## 다음 단계 {id="what-s-next"}

* 인자 없는 생성자(zero-argument constructor)가 필요한 JPA 엔티티의 경우, `@Entity`, `@Embeddable`, `@MappedSuperclass`와 같은 JPA 애너테이션으로 `no-arg` 플러그인을 구성하는 [`kotlin-jpa` 플러그인](kotlin-jpa-plugin.md)을 사용하세요.
* [Spring Boot 및 Kotlin 시작하기](jvm-get-started-spring-boot.md) 튜토리얼을 통해 첫 번째 Spring Boot 애플리케이션을 만들어 보세요.