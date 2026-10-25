[//]: # (title: All-open 컴파일러 플러그인)

Kotlin에서는 클래스와 클래스 멤버가 기본적으로 `final`입니다. 이는 클래스가 `open`이어야 하는 서브클래싱(subclassing) 및 런타임 프록시에 의존하는 프레임워크와 라이브러리를 사용할 때 문제를 일으킬 수 있습니다.

`all-open` 컴파일러 플러그인은 `open` 키워드를 명시하지 않고도 컴파일 시점에 클래스와 해당 멤버를 `open`으로 만듭니다.
애너테이션을 생성하여 플러그인 옵션에 추가한 다음, `open`으로 만들 클래스에 해당 애너테이션을 지정하기만 하면 됩니다.

```kotlin
@YourAnnotation
class MyService {
    // 이제 이 클래스와 모든 멤버가 open 상태가 됩니다
    fun doWork() { /* ... */ }
}
```

클래스 또는 해당 클래스의 상위 클래스 중 하나에 설정된 애너테이션이 지정되어 있으면, 해당 클래스와 그 멤버는 `open`이 됩니다.

> Kotlin 기반 Spring 애플리케이션의 경우 [`kotlin-spring` 컴파일러 플러그인](kotlin-spring-plugin.md)을 사용할 수 있습니다.
> 이 플러그인은 Spring 애너테이션이 있는 클래스와 해당 멤버를 자동으로 `open`으로 만듭니다.
>
{style="note"}

## 애너테이션 선언 {id="declare-an-annotation"}

`all-open` 플러그인은 설정에 등록한 애너테이션이 지정된 클래스만 처리합니다.
따라서 플러그인을 활성화하기 전에 `open`으로 만들 클래스를 표시할 애너테이션을 선언하세요.
예를 들어 `AllOpenMarker`와 같이 선언할 수 있습니다.

```kotlin
package com.example

annotation class AllOpenMarker
```

## 플러그인 적용 {id="apply-the-plugin"}

### Gradle {id="gradle"}

플러그인을 활성화하려면 `build.gradle(.kts)` 파일의 `plugins {}` 블록에 추가하세요.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
// build.gradle.kts
plugins {
    kotlin("jvm") version "%kotlinVersion%"
    kotlin("plugin.allopen") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
// build.gradle
plugins {
    id "org.jetbrains.kotlin.jvm" version "%kotlinVersion%"
    id "org.jetbrains.kotlin.plugin.allopen" version "%kotlinVersion%"
}
```

</tab>
</tabs>

그런 다음 앞서 선언한 애너테이션(예: `com.example.AllOpenMarker`) 또는 클래스를 `open`으로 만들 애너테이션 목록을 지정합니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
allOpen {
    annotation("com.example.AllOpenMarker")
    // 여러 애너테이션을 지정할 수 있습니다:
    // annotations("com.example.AllOpenMarker", "com.anotherPackage.OtherAnnotation")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
allOpen {
    annotation("com.example.AllOpenMarker")
    // 여러 애너테이션을 지정할 수 있습니다:
    // annotations("com.example.AllOpenMarker", "com.anotherPackage.OtherAnnotation")
}
```

</tab>
</tabs>

### Maven {id="maven"}

`pom.xml` 파일에 플러그인을 추가합니다.

```xml
<properties>
    <kotlin.version>%kotlinVersion%</kotlin.version>
</properties>

<plugin>
    <artifactId>kotlin-maven-plugin</artifactId>
    <groupId>org.jetbrains.kotlin</groupId>
    <version>${kotlin.version}</version>

    <configuration>
        <compilerPlugins>
            <plugin>all-open</plugin>
        </compilerPlugins>

        <pluginOptions>
            <!-- 여러 애너테이션의 경우 여러 줄을 추가합니다 -->
            <option>all-open:annotation=com.example.AllOpenMarker</option>
            <option>all-open:annotation=com.anotherPackage.OtherAnnotation</option>
        </pluginOptions>
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

## `all-open` 플러그인 사용 {id="use-the-all-open-plugin"}

클래스 또는 해당 클래스의 상위 클래스 중 하나에 직접 생성한 `com.example.AllOpenMarker` 애너테이션이 지정되어 있으면, 해당 클래스와 모든 멤버가 `open`이 됩니다.

```kotlin
package com.example

@AllOpenMarker
class TestClass {
    // 이 클래스와 모든 멤버가 open 상태입니다
}
```

이 플러그인은 메타 애너테이션(meta-annotation)에도 동작합니다. 다른 애너테이션에 `@AllOpenMarker`를 지정하면, 해당 애너테이션이 붙은 모든 클래스와 멤버도 `open`이 됩니다.

```kotlin
package com.example

// 이전에 생성한 애너테이션이 지정된 애너테이션
@AllOpenMarker
annotation class AnotherAllOpenMarker

@AllOpenMarker
class NewClass {
    // 이 클래스와 모든 멤버가 open 상태입니다
}

@AnotherAllOpenMarker
class AnotherClass {
    // 이 클래스와 모든 멤버 역시 open 상태입니다
}
```

<!--
## 명령줄 컴파일러 {id="command-line-compiler"}

`all-open` 컴파일러 플러그인 JAR는 Kotlin 컴파일러의 바이너리 배포판에 포함되어 있습니다. `-Xplugin` kotlinc 옵션을 사용하여 JAR 파일의 경로를 제공함으로써 플러그인을 연결할 수 있습니다:

```bash
-Xplugin=$KOTLIN_HOME/lib/allopen-compiler-plugin.jar
```

`annotation` 플러그인 옵션을 사용하여 `all-open` 애너테이션을 직접 지정하거나, 프리셋(_preset_)을 활성화할 수 있습니다:

```bash
# 플러그인 옵션 형식은 "-P plugin:<plugin id>:<key>=<value>"입니다. 
# 옵션은 반복해서 지정할 수 있습니다.

-P plugin:org.jetbrains.kotlin.allopen:annotation=com.my.Annotation
-P plugin:org.jetbrains.kotlin.allopen:preset=spring
```

`all-open` 플러그인에서 사용할 수 있는 프리셋은 `spring`, `micronaut`, `quarkus`입니다.
-->

## 다음 단계 {id="what-s-next"}

* Spring 애플리케이션의 경우 Spring 애너테이션이 적용된 클래스를 `open`으로 만들어 주는 사전 구성된 래퍼인 [`kotlin-spring` 플러그인](kotlin-spring-plugin.md)을 사용하세요.
* JPA 엔티티의 경우 엔티티를 `open`으로 만들고 인자 없는 생성자(zero-argument constructor)를 생성해 주는 [`kotlin-jpa` 플러그인](kotlin-jpa-plugin.md)을 사용하세요.
* [`all-open` 컴파일러 플러그인](https://github.com/JetBrains/kotlin/tree/master/plugins/allopen)의 소스 코드를 살펴보세요.