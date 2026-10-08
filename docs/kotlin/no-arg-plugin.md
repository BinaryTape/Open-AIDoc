[//]: # (title: No-arg 编译器插件)

*no-arg* 编译器插件为带有特定注解的类生成一个额外的零参数构造函数。

生成的构造函数是合成 (synthetic) 的，因此无法从 Java 或 Kotlin 中直接调用，但可以使用反射进行调用。

这使得 Java Persistence API (JPA) 能够实例化一个类，尽管从 Kotlin 或 Java 的角度来看，该类并没有零参数构造函数（参见 [下文](#jpa-support) 中关于 `kotlin-jpa` 插件的说明）。

## 在 Kotlin 文件中 {id="in-your-kotlin-file"}

添加新注解以标记需要零参数构造函数的代码：

```kotlin
package com.my

annotation class Annotation
```

## Gradle {id="gradle"}

使用 Gradle 的插件 DSL 添加插件：

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

然后指定 no-arg 注解列表，这些注解将导致为被注解的类生成 no-arg 构造函数：

```groovy
noArg {
    annotation("com.my.Annotation")
}
```

如果您希望插件从合成构造函数中运行初始化逻辑，请启用 `invokeInitializers` 选项。该选项默认处于禁用状态。

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
            <!-- 或者使用 "jpa" 以获得 JPA 支持 -->
            <plugin>no-arg</plugin>
        </compilerPlugins>

        <pluginOptions>
            <option>no-arg:annotation=com.my.Annotation</option>
            <!-- 在合成构造函数中调用实例初始化器 -->
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

## JPA 支持 {id="jpa-support"}

与封装在 `all-open` 之上的 `kotlin-spring` 插件类似，`kotlin-jpa` 封装在 `no-arg` 之上。该插件会自动指定 [`@Entity`](https://docs.oracle.com/javaee/7/api/javax/persistence/Entity.html)、[`@Embeddable`](https://docs.oracle.com/javaee/7/api/javax/persistence/Embeddable.html) 和 [`@MappedSuperclass`](https://docs.oracle.com/javaee/7/api/javax/persistence/MappedSuperclass.html) 为 *no-arg* 注解。

使用 Gradle 插件 DSL 添加插件：

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

在 Maven 中，启用 `jpa` 插件：

```xml
<compilerPlugins>
    <plugin>jpa</plugin>
</compilerPlugins>
```

## 命令行编译器 {id="command-line-compiler"}

将插件 JAR 文件添加到编译器插件类路径并指定注解或预设：

```bash
-Xplugin=$KOTLIN_HOME/lib/noarg-compiler-plugin.jar
-P plugin:org.jetbrains.kotlin.noarg:annotation=com.my.Annotation
-P plugin:org.jetbrains.kotlin.noarg:preset=jpa
```
