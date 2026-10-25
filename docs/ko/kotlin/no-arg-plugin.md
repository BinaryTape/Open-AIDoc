[//]: # (title: No-arg 컴파일러 플러그인)

`no-arg` 컴파일러 플러그인은 특정 어노테이션이 지정된 클래스에 인자 없는 생성자(zero-argument constructor)를 생성합니다.

생성된 생성자에는 `HIDDEN` 레벨의 `@Deprecated` 어노테이션이 적용되므로, Java에서는 호출할 수 있지만 Kotlin에서는 호출할 수 없습니다.
프레임워크는 리플렉션을 통해 이 생성자를 호출할 수 있습니다.

예를 들어 이를 통해 Java Persistence API(JPA)와 같은 프레임워크가 인자 없는 생성자를 선언하지 않은 Kotlin 클래스를 인스턴스화할 수 있습니다.

> Kotlin에서 JPA 엔티티를 다룰 때는 [`kotlin-jpa` 컴파일러 플러그인](kotlin-jpa-plugin.md)을 사용할 수 있습니다.
> 이 플러그인은 `@Entity`, `@Embeddable`, `@MappedSuperclass`와 같은 JPA 어노테이션을 자동으로 지정합니다.
>
{style="note"}

## 어노테이션 선언 {id="declare-an-annotation"}

`no-arg` 플러그인은 설정에 등록된 어노테이션이 지정된 클래스만 처리합니다.
따라서 플러그인을 활성화하기 전에 인자 없는 생성자가 필요한 클래스를 표시할 어노테이션을 선언하세요.
예를 들어 다음과 같이 `NoArgAnnotation`을 선언할 수 있습니다:

```kotlin
package com.example

annotation class NoArgAnnotation
```

## 플러그인 적용 {id="apply-the-plugin"}

### Gradle {id="gradle"}

`build.gradle(.kts)` 파일의 `plugins {}` 블록에 `no-arg` 플러그인을 추가합니다:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("jvm") version "%kotlinVersion%"  // 사용할 Kotlin 버전
    kotlin("plugin.noarg") version "%kotlinVersion%" // Kotlin no-arg 플러그인
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id "org.jetbrains.kotlin.jvm" version "%kotlinVersion%"
    id "org.jetbrains.kotlin.plugin.noarg" version "%kotlinVersion%"
}
```

</tab>
</tabs>

그런 다음 앞서 선언한 어노테이션(예: `com.example.NoArgAnnotation`)을 지정하여 해당 어노테이션이 붙은 클래스에 인자 없는 생성자를 생성하도록 설정합니다:

```groovy
noArg {
    annotation("com.example.NoArgAnnotation")
}
```

생성된 생성자에서 클래스 초기화 로직을 실행하도록 하려면 `invokeInitializers` 옵션을 활성화하세요. 이 옵션은 기본적으로 비활성화되어 있습니다:

```groovy
noArg {
    invokeInitializers = true
}
```

### Maven {id="maven"}

`pom.xml` 파일에 플러그인을 추가합니다:

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
            <plugin>no-arg</plugin>
        </compilerPlugins>

        <pluginOptions>
            <option>no-arg:annotation=com.example.NoArgAnnotation</option>
            <!-- 생성된 생성자에서 인스턴스 초기화 블록 호출 -->
            <!-- <option>no-arg:invokeInitializers=true</option> -->
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

## `no-arg` 플러그인 사용 {id="use-the-no-arg-plugin"}

플러그인이 적용되면 등록된 어노테이션이 지정된 클래스는 컴파일 시점에 인자 없는 생성자를 갖게 됩니다. 생성자를 직접 선언할 필요가 없습니다:

```kotlin
package com.example

// no-arg 플러그인이 이 클래스에 대한 인자 없는 생성자를 생성합니다
@NoArgAnnotation
class MyEntity(val id: Int)
```

<!--
## 커맨드 라인 컴파일러 {id="command-line-compiler"}

컴파일러 플러그인 클래스패스에 플러그인 JAR 파일을 추가하고 어노테이션 또는 프리셋을 지정합니다:

```bash
-Xplugin=$KOTLIN_HOME/lib/noarg-compiler-plugin.jar
-P plugin:org.jetbrains.kotlin.noarg:annotation=com.my.Annotation
-P plugin:org.jetbrains.kotlin.noarg:preset=jpa
```
-->

## 다음 단계 {id="what-s-next"}

* JPA 엔티티의 경우 `@Entity`, `@Embeddable`, `@MappedSuperclass`와 같은 JPA 어노테이션으로 `no-arg` 및 `all-open` 플러그인을 설정해 주는 [`kotlin-jpa` 플러그인](kotlin-jpa-plugin.md)을 사용하세요.
* [`no-arg` 컴파일러 플러그인](https://github.com/JetBrains/kotlin/tree/master/plugins/noarg)의 소스 코드를 살펴보세요.