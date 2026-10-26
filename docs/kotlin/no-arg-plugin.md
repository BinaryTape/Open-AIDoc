[//]: # (title: No-arg 编译器插件)

`no-arg` 编译器插件会为带有特定注解的类生成一个零实参构造函数。

生成的构造函数带有 `HIDDEN` 级别的 `@Deprecated` 注解，因此您可以从 Java 中调用它，但不能从 Kotlin 中调用。框架可以通过反射来调用它。

例如，这使得 Java Persistence API (JPA) 等框架能够实例化未声明零实参构造函数的 Kotlin 类。

> 对于使用 Kotlin 的 JPA 实体，您可以使用 [`kotlin-jpa` 编译器插件](kotlin-jpa-plugin.md)。
> 它会自动指定 `@Entity`、`@Embeddable` 以及 `@MappedSuperclass` 等 JPA 注解。
>
{style="note"}

## 声明注解 {id="declare-an-annotation"}

`no-arg` 插件仅处理在其配置中注册的注解所标记的类。
因此，在启用该插件之前，请先声明一个注解，以标记需要零实参构造函数的类。
例如 `NoArgAnnotation`：

```kotlin
package com.example

annotation class NoArgAnnotation
```

## 应用插件 {id="apply-the-plugin"}

### Gradle {id="gradle"}

在 `build.gradle(.kts)` 文件的 `plugins {}` 块中添加 `no-arg` 插件：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("jvm") version "%kotlinVersion%"  // 要使用的 Kotlin 版本
    kotlin("plugin.noarg") version "%kotlinVersion%" // Kotlin no-arg 插件
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

然后指定前面声明的注解（例如 `com.example.NoArgAnnotation`），为带有该注解的类生成零实参构造函数：

```groovy
noArg {
    annotation("com.example.NoArgAnnotation")
}
```

如果希望插件从生成的构造函数中运行类初始化逻辑，请启用 `invokeInitializers` 选项。该选项默认禁用：

```groovy
noArg {
    invokeInitializers = true
}
```

### Maven {id="maven"}

将插件添加到 `pom.xml` 文件中：

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
            <!-- 在生成的构造函数中调用实例初始值设定项 -->
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

## 使用 `no-arg` 插件 {id="use-the-no-arg-plugin"}

应用该插件后，带有已注册注解的类将在编译时获得零实参构造函数。您无需手动声明该构造函数：

```kotlin
package com.example

// no-arg 插件会为此类生成一个零实参构造函数
@NoArgAnnotation
class MyEntity(val id: Int)
```

<!--
## 命令行编译器 {id="command-line-compiler"}

将插件 JAR 文件添加到编译器插件类路径中，并指定注解或预设：

```bash
-Xplugin=$KOTLIN_HOME/lib/noarg-compiler-plugin.jar
-P plugin:org.jetbrains.kotlin.noarg:annotation=com.my.Annotation
-P plugin:org.jetbrains.kotlin.noarg:preset=jpa
```
-->

## 后续步骤 {id="what-s-next"}

* 对于 JPA 实体，请使用 [`kotlin-jpa` 插件](kotlin-jpa-plugin.md)，该插件会针对 `@Entity`、`@Embeddable` 与 `@MappedSuperclass` 等 JPA 注解自动配置 `no-arg` 和 `all-open` 插件。
* 浏览 [`no-arg` 编译器插件的源代码](https://github.com/JetBrains/kotlin/tree/master/plugins/noarg)。