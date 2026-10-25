[//]: # (title: Kotlin-jpa 컴파일러 플러그인)

`kotlin-jpa` 컴파일러 플러그인은 Kotlin 프로젝트를 JPA(Java Persistence API)에 맞게 구성합니다.
JPA에는 Kotlin의 기본 동작과 충돌하는 두 가지 요구사항이 있습니다.

* **인자 없는 생성자(Zero-argument constructor):** JPA는 리플렉션을 통해 엔티티를 인스턴스화하므로(이 과정을 _하이드레이션(hydration)_이라고 부름), 인자 없는 생성자가 필요합니다. 하지만 Kotlin 클래스는 기본적으로 인자 없는 생성자를 선언하지 않습니다.
* **Non-final 클래스:** JPA 프로바이더는 지연 로딩(lazy loading, 예: `@ManyToOne` 및 `@OneToOne` 연관 관계)을 지원하기 위해 엔티티의 프록시 서브클래스를 생성합니다. Kotlin 클래스와 그 멤버는 기본적으로 `final`이므로 이를 방지합니다. 엔티티가 `open` 상태가 아니면 지연 로딩이 작동하지 않습니다.

`kotlin-jpa` 플러그인은 이 두 가지 문제를 모두 해결합니다. 이 플러그인은 다음을 적용하는 사전 구성된 래퍼(wrapper)입니다.

* JPA 애너테이션이 적용된 클래스에 인자 없는 생성자를 생성하는 [`no-arg` 플러그인](no-arg-plugin.md)
* JPA 애너테이션이 적용된 클래스와 그 멤버를 `open`으로 만드는 [`all-open` 플러그인](all-open-plugin.md)

생성된 생성자에는 `HIDDEN` 수준의 `@Deprecated` 애너테이션이 붙으므로, Java에서는 호출할 수 있지만 Kotlin에서는 호출할 수 없습니다. JPA는 리플렉션을 통해 이를 호출할 수 있습니다.

> [start.spring.io](https://start.spring.io/#!language=kotlin)에서 JPA 의존성을 포함하여 프로젝트 템플릿을 생성하면 `kotlin-jpa` 플러그인이 기본적으로 활성화됩니다.
>
{style="note"}

## 지원되는 JPA 애너테이션 {id="supported-jpa-annotations"}

JPA 애너테이션은 이전의 `javax.persistence`(Java EE)와 최신의 `jakarta.persistence`(Jakarta EE 9 이후, Spring Boot 3.x 이상에서 사용)라는 두 가지 패키지 네임스페이스에 존재합니다. `kotlin-jpa` 플러그인은 두 네임스페이스를 모두 인식하며, 내부 `no-arg` 및 `all-open` 플러그인에 대해 다음 애너테이션을 자동으로 지정합니다.

* `javax.persistence.Entity` 및 `jakarta.persistence.Entity`
* `javax.persistence.Embeddable` 및 `jakarta.persistence.Embeddable`
* `javax.persistence.MappedSuperclass` 및 `jakarta.persistence.MappedSuperclass`

사용 중인 프레임워크 버전에 일치하는 네임스페이스의 애너테이션을 사용하세요. 두 네임스페이스 모두 기본으로 활성화되어 있으므로 어느 쪽이든 플러그인을 별도로 구성할 필요가 없습니다.

## 플러그인 적용 {id="apply-the-plugin"}

### Gradle {id="gradle"}

`build.gradle(.kts)` 파일의 `plugins {}` 블록에 `kotlin-jpa` 플러그인을 추가합니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("jvm") version "%kotlinVersion%"  // 사용할 Kotlin 버전
    kotlin("plugin.jpa") version "%kotlinVersion%" // Kotlin JPA 플러그인
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

Maven에서는 `kotlin-jpa` 플러그인 지원이 `kotlin-maven-noarg` 플러그인을 통해 제공됩니다. `pom.xml` 파일에 추가하세요.

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

> Kotlin 2.3.20부터 `kotlin-maven-noarg`는 `kotlin-maven-allopen`을 암시적으로 포함하므로, 더 이상 `all-open` 의존성을 명시적으로 추가할 필요가 없습니다.
>
{style="note"}

## `kotlin-jpa` 플러그인 사용하기 {id="use-the-kotlin-jpa-plugin"}

플러그인이 적용되면 일반적인 JPA 애너테이션이 붙은 클래스는 컴파일 시점에 `open`이 되고 인자 없는 생성자를 갖게 됩니다. 따라서 수동으로 `open` 키워드를 추가하거나 인자 없는 생성자를 선언하지 않고도 엔티티를 일반 클래스로 작성할 수 있습니다.

다음 예제는 `jakarta.persistence` 네임스페이스를 사용합니다. 프레임워크에서 여전히 Java EE를 사용하는 경우 대신 `javax.persistence`에서 동일한 애너테이션을 임포트하면 되며, 플러그인은 두 경우를 모두 처리합니다.

```kotlin
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.Id

@Entity
class Message(
    var text: String,
) {
    // kotlin-jpa 플러그인은 이 클래스를 open으로 만들고
    // JPA가 인스턴스화하는 데 사용할 인자 없는 생성자를 생성합니다
    @Id
    @GeneratedValue
    var id: Long? = null
}
```

## JPA 엔티티 모범 사례 {id="best-practices-for-jpa-entities"}

플러그인을 적용하면 엔티티가 `open`이 되고 인자 없는 생성자가 제공되지만, 몇 가지 Kotlin 관용구는 여전히 JPA 프로바이더가 엔티티를 관리하는 방식과 충돌합니다. 일반적인 문제를 방지하려면 다음 가이드라인을 따르세요.

* **`data class` 대신 일반 클래스를 사용하세요.** 데이터 클래스는 불변 `val` 프로퍼티를 선호하며, 모든 프로퍼티로부터 `equals()`, `hashCode()`, `toString()`을 파생합니다. 엔티티의 경우 이는 프록시 동작을 깨뜨리며, `toString()` 또는 `equals()`가 지연 연관 관계에 대한 추가 쿼리를 유발할 수 있습니다. 엔티티는 일반 클래스로 모델링하고(플러그인이 클래스를 `open`으로 만들어 줌), 데이터 클래스는 DTO 및 쿼리 결과용으로만 사용하세요.
* **매핑된 프로퍼티는 `var`로 선언하세요.** JPA는 엔티티를 하이드레이션할 때 필드를 설정하므로, 매핑된 프로퍼티는 가변적(mutable)이어야 합니다.
* **생성된 식별자는 널 허용(nullable) 및 가변(mutable)으로 만드세요.** `@GeneratedValue` 식별자는 엔티티가 영속화(persist)될 때까지 `null`이므로, `var id: Long? = null`과 같이 선언하세요.
  
  > Kotlin에서는 기본형(primitive types)에 `lateinit`을 사용할 수 없습니다.
  >
  {style="note"}
  
* **`equals()`와 `hashCode()`는 모든 프로퍼티가 아니라 식별자와 타입에만 기반하도록 하세요.** 이렇게 해야 엔티티 생명주기 전반에 걸쳐 일관성을 유지하고 지연 로딩 필드를 불필요하게 로드하지 않습니다.

이러한 함정에 대한 자세한 설명은 [How to avoid common pitfalls with JPA and Kotlin](https://blog.jetbrains.com/idea/2026/01/how-to-avoid-common-pitfalls-with-jpa-and-kotlin/) 블로그 포스트를 참고하세요.

## JPA 애너테이션이 없는 클래스 적용하기 {id="cover-classes-without-jpa-annotations"}

`kotlin-jpa` 플러그인은 [지원되는 JPA 애너테이션](#supported-jpa-annotations)만 구성합니다. JPA 애너테이션이 붙지 않은 타입에 대해 인자 없는 생성자를 생성하거나 클래스를 `open`으로 만들려면 자체 애너테이션을 선언하고 이를 내부 `no-arg` 및 `all-open` 플러그인에 등록하세요.

1. 자체 애너테이션을 선언합니다.

   ```kotlin
   package com.example

   annotation class OpenNoArgAnnotation
   ```

2. 빌드 파일에서 내부 플러그인에 애너테이션을 등록합니다.

   <tabs group="build-script">
   <tab title="Gradle (Kotlin)" group-key="kotlin">

   `build.gradle.kts` 파일에서 `kotlin-jpa` 플러그인을 통해 사용할 수 있는 `noArg {}` 및 `allOpen {}` 블록에 애너테이션을 등록합니다.

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

   `build.gradle` 파일에서 `kotlin-jpa` 플러그인을 통해 사용할 수 있는 `noArg {}` 및 `allOpen {}` 블록에 애너테이션을 등록합니다.

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

   `pom.xml` 파일에서 `kotlin-maven-plugin` 설정에 `no-arg:annotation` 및 `all-open:annotation` 옵션을 추가합니다.

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
               <!-- 여러 애너테이션을 추가하려면 여러 줄을 사용하세요 -->
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

3. JPA 애너테이션이 없는 클래스에 지정합니다.

   ```kotlin
   package com.example

   import jakarta.persistence.Entity
   import jakarta.persistence.GeneratedValue
   import jakarta.persistence.Id

   // kotlin-jpa 플러그인에 의해 자동으로 적용됩니다
   @Entity
   class Message(
       var text: String,
   ) {
       @Id
       @GeneratedValue
       var id: Long? = null
   }

   // 커스텀 애너테이션이 클래스를 open으로 만들고
   // 인자 없는 생성자를 생성합니다
   @OpenNoArgAnnotation
   class MessageMetadata(
       var author: String,
   )
   ```

자세한 내용은 [`no-arg`](no-arg-plugin.md) 및 [`all-open`](all-open-plugin.md)을 참조하세요.

## 다음 단계 {id="what-s-next"}

* [흔히 발생하는 엔티티 매핑 문제를 방지하는 방법](https://blog.jetbrains.com/idea/2026/01/how-to-avoid-common-pitfalls-with-jpa-and-kotlin/) 블로그 포스트를 읽어보세요.
* 클래스가 `open`이어야 하는 Spring 애플리케이션의 경우, `@Component`, `@Transactional`, `@Configuration`과 같은 Spring 애너테이션으로 `all-open` 플러그인을 구성하는 [`kotlin-spring` 플러그인](kotlin-spring-plugin.md)을 사용하세요.
* [Spring Boot 및 Kotlin 시작하기](jvm-get-started-spring-boot.md) 튜토리얼을 통해 첫 번째 Spring Boot 애플리케이션을 만들어 보세요.