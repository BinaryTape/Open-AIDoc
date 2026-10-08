[//]: # (title: No-arg 컴파일러 플러그인)

*no-arg* 컴파일러 플러그인은 특정 어노테이션이 달린 클래스에 대해 인자가 없는 생성자(zero-argument constructor)를 추가로 생성합니다.

생성된 생성자는 가상(synthetic)이므로 Java나 Kotlin에서 직접 호출할 수 없지만, 리플렉션(reflection)을 사용하면 호출할 수 있습니다.

이를 통해 Java Persistence API(JPA)는 Kotlin이나 Java 관점에서 인자가 없는 생성자가 없더라도 클래스의 인스턴스를 생성할 수 있게 됩니다([아래](#jpa-support)의 `kotlin-jpa` 플러그인 설명 참조).

## Kotlin 파일에서 {id="in-your-kotlin-file"}

인자가 없는 생성자가 필요한 코드를 표시하기 위해 새로운 어노테이션을 추가하세요:

```kotlin
package com.my

annotation class Annotation
```

## Gradle {id="gradle"}

Gradle의 플러그인 DSL을 사용하여 플러그인을 추가하세요:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("plugin.noarg") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id "org.jetbrains.kotlin.plugin.noarg" version "%kotlinVersion%"
}
```

</tab>
</tabs>

그 다음, 어노테이션이 달린 클래스에 대해 no-arg 생성자를 생성하도록 유도하는 no-arg 어노테이션 목록을 지정하세요:

```groovy
noArg {
    annotation("com.my.Annotation")
}
```

플러그인이 가상 생성자에서 초기화 로직을 실행하도록 하려면 `invokeInitializers` 옵션을 활성화하세요. 기본적으로 이 옵션은 비활성화되어 있습니다.

```groovy
noArg {
    invokeInitializers = true
}
```

## Maven {id="maven"}

```xml
<plugin>
    <artifactId>kotlin-maven-plugin</artifactId>
    <groupId>org.jetbrains.kotlin</groupId>
    <version>${kotlin.version}</version>

    <configuration>
        <compilerPlugins>
            <!-- 또는 JPA 지원을 위한 "jpa" -->
            <plugin>no-arg</plugin>
        </compilerPlugins>

        <pluginOptions>
            <option>no-arg:annotation=com.my.Annotation</option>
            <!-- 가상 생성자에서 인스턴스 초기화 로직 호출 -->
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

## JPA 지원 {id="jpa-support"}

`all-open` 위에 래핑된 `kotlin-spring` 플러그인과 마찬가지로, `kotlin-jpa`는 `no-arg` 위에 래핑됩니다. 이 플러그인은 [`@Entity`](https://docs.oracle.com/javaee/7/api/javax/persistence/Entity.html), [`@Embeddable`](https://docs.oracle.com/javaee/7/api/javax/persistence/Embeddable.html), [`@MappedSuperclass`](https://docs.oracle.com/javaee/7/api/javax/persistence/MappedSuperclass.html) *no-arg* 어노테이션을 자동으로 지정합니다.

Gradle 플러그인 DSL을 사용하여 플러그인을 추가하세요:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("plugin.jpa") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id "org.jetbrains.kotlin.plugin.jpa" version "%kotlinVersion%"
}
```

</tab>
</tabs>

Maven에서는 `jpa` 플러그인을 활성화하세요:

```xml
<compilerPlugins>
    <plugin>jpa</plugin>
</compilerPlugins>
```

## 명령줄 컴파일러 {id="command-line-compiler"}

컴파일러 플러그인 클래스패스에 플러그인 JAR 파일을 추가하고 어노테이션이나 프리셋을 지정하세요:

```bash
-Xplugin=$KOTLIN_HOME/lib/noarg-compiler-plugin.jar
-P plugin:org.jetbrains.kotlin.noarg:annotation=com.my.Annotation
-P plugin:org.jetbrains.kotlin.noarg:preset=jpa
```
