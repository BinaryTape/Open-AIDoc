[//]: # (title: All-open 编译器插件)

在 Kotlin 中，类及其成员默认都是 `final` 的。这可能会给依赖子类化和运行时代理的框架与库带来问题，因为它们要求类必须是 `open` 的。

`all-open` 编译器插件可以在编译时将类及其成员设为 `open`，而无需显式使用 `open` 关键字。
你需要创建一个注解，将其添加到插件选项中，并为你想要设为 `open` 的类添加该注解：

```kotlin
@YourAnnotation
class MyService {
    // 该类及其所有成员现在都是 open 的
    fun doWork() { /* ... */ }
}
```

如果某个类或其任意超类带有所配置的注解，则该类及其成员将变为 `open`。

> 对于使用 Kotlin 的 Spring 应用程序，可以使用 [`kotlin-spring` 编译器插件](kotlin-spring-plugin.md)。
> 当类带有 Spring 注解时，它会将该类及其成员设为 `open`。
>
{style="note"}

## 声明注解 {id="declare-an-annotation"}

`all-open` 插件仅处理带有在配置中注册的注解的类。
因此，在启用该插件之前，请先声明一个注解，以标记需要设为 `open` 的类。
例如，`AllOpenMarker`：

```kotlin
package com.example

annotation class AllOpenMarker
```

## 应用插件 {id="apply-the-plugin"}

### Gradle {id="gradle"}

要启用该插件，请将其添加到 `build.gradle(.kts)` 文件的 `plugins {}` 块中：

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

然后指定之前声明的注解（例如 `com.example.AllOpenMarker`）或使类变为 `open` 的注解列表：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
allOpen {
    annotation("com.example.AllOpenMarker")
    // 你可以指定多个注解：
    // annotations("com.example.AllOpenMarker", "com.anotherPackage.OtherAnnotation")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
allOpen {
    annotation("com.example.AllOpenMarker")
    // 你可以指定多个注解：
    // annotations("com.example.AllOpenMarker", "com.anotherPackage.OtherAnnotation")
}
```

</tab>
</tabs>

### Maven {id="maven"}

在 `pom.xml` 文件中添加该插件：

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
            <!-- 为多个注解添加多行 -->
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

## 使用 `all-open` 插件 {id="use-the-all-open-plugin"}

如果某个类或其任意超类具有所创建的 `com.example.AllOpenMarker` 注解，
则该类及其所有成员都将变为 `open`：

```kotlin
package com.example

@AllOpenMarker
class TestClass {
    // 该类及其所有成员都是 open 的
}
```

该插件还支持元注解。如果使用 `@AllOpenMarker` 标记另一个注解，
则所有带有该新注解的类及其成员也都会变为 `open`：

```kotlin
package com.example

// 使用之前创建的注解进行标记的注解
@AllOpenMarker
annotation class AnotherAllOpenMarker

@AllOpenMarker
class NewClass {
    // 该类及其所有成员都是 open 的
}

@AnotherAllOpenMarker
class AnotherClass {
    // 该类及其所有成员也都是 open 的
}
```

<!--
## 命令行编译器 {id="command-line-compiler"}

`all-open` 编译器插件 JAR 包包含在 Kotlin 编译器的二进制分发版中。你可以使用 kotlinc 的 `-Xplugin` 选项提供其 JAR 文件的路径来挂载该插件：

```bash
-Xplugin=$KOTLIN_HOME/lib/allopen-compiler-plugin.jar
```

你可以使用 `annotation` 插件选项直接指定 `all-open` 注解，也可以启用预设（_preset_）：

```bash
# 插件选项格式为："-P plugin:<plugin id>:<key>=<value>"。 
# 选项可以重复。

-P plugin:org.jetbrains.kotlin.allopen:annotation=com.my.Annotation
-P plugin:org.jetbrains.kotlin.allopen:preset=spring
```

`all-open` 插件可用的预设为：`spring`、`micronaut` 和 `quarkus`。
-->

## 后续步骤 {id="what-s-next"}

* 对于 Spring 应用程序，请使用 [`kotlin-spring` 插件](kotlin-spring-plugin.md)，它是一个预配置的包装器，可使带有 Spring 注解的类变为 `open`。
* 对于 JPA 实体，请使用 [`kotlin-jpa` 插件](kotlin-jpa-plugin.md)，它可将实体设为 `open` 并为其生成零实参构造函数。
* 查阅 [`all-open` 编译器插件的源代码](https://github.com/JetBrains/kotlin/tree/master/plugins/allopen)。