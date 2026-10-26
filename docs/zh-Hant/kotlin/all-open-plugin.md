[//]: # (title: All-open 編譯器外掛程式)

在 Kotlin 中，類別及其成員預設為 `final`。這可能會導致仰賴子類別化與執行階段代理（runtime proxy）的架構與程式庫出現問題，因為它們需要類別為 `open`。

`all-open` 編譯器外掛程式會在編譯期將類別及其成員設為 `open`，而無需使用 `open` 關鍵字。
你需要建立一個註解，將其新增至外掛程式選項中，並為要設為 `open` 的類別加上該註解：

```kotlin
@YourAnnotation
class MyService {
    // 這個類別及其所有成員現在都是 open 的
    fun doWork() { /* ... */ }
}
```

若某個類別或其任何超類別標有已配置的註解，該類別及其成員就會變為 `open`。

> 對於使用 Kotlin 的 Spring 應用程式，你可以使用 [`kotlin-spring` 編譯器外掛程式](kotlin-spring-plugin.md)。
> 它會在類別帶有 Spring 註解時，將該類別及其成員設為 `open`。
>
{style="note"}

## 宣告註解 {id="declare-an-annotation"}

`all-open` 外掛程式僅會處理標有你在其配置中註冊之註解的類別。
因此在啟用外掛程式之前，請宣告一個註解來標記想要設為 `open` 的類別。
例如 `AllOpenMarker`：

```kotlin
package com.example

annotation class AllOpenMarker
```

## 套用外掛程式 {id="apply-the-plugin"}

### Gradle {id="gradle"}

若要啟用外掛程式，請將其新增至 `build.gradle(.kts)` 檔案的 `plugins {}` 區塊中：

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

接著指定你稍早宣告的註解（例如 `com.example.AllOpenMarker`）或可使類別成為 `open` 的註解清單：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
allOpen {
    annotation("com.example.AllOpenMarker")
    // 你可以指定多個註解：
    // annotations("com.example.AllOpenMarker", "com.anotherPackage.OtherAnnotation")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
allOpen {
    annotation("com.example.AllOpenMarker")
    // 你可以指定多個註解：
    // annotations("com.example.AllOpenMarker", "com.anotherPackage.OtherAnnotation")
}
```

</tab>
</tabs>

### Maven {id="maven"}

在你的 `pom.xml` 檔案中新增此外掛程式：

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
            <!-- 若有多個註解，可新增多行 -->
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

## 使用 `all-open` 外掛程式 {id="use-the-all-open-plugin"}

若某個類別或其任何超類別帶有你建立的 `com.example.AllOpenMarker` 註解，該類別及其所有成員都會變為 `open`：

```kotlin
package com.example

@AllOpenMarker
class TestClass {
    // 這個類別及其所有成員都是 open 的
}
```

此外掛程式也支援元註解（meta-annotation）。若你使用 `@AllOpenMarker` 標記另一個註解，則所有標有該註解的類別和成員也都會變為 `open`：

```kotlin
package com.example

// 使用先前建立的註解標記的註解
@AllOpenMarker
annotation class AnotherAllOpenMarker

@AllOpenMarker
class NewClass {
    // 這個類別及其所有成員都是 open 的
}

@AnotherAllOpenMarker
class AnotherClass {
    // 這個類別及其所有成員也都是 open 的
}
```

<!--
## 命令列編譯器 {id="command-line-compiler"}

Kotlin 編譯器的二進制發行套件中包含 `all-open` 編譯器外掛程式的 JAR。你可以使用 `-Xplugin` kotlinc 選項提供其 JAR 檔案的路徑來附加該外掛程式：

```bash
-Xplugin=$KOTLIN_HOME/lib/allopen-compiler-plugin.jar
```

你可以使用 `annotation` 外掛程式選項直接指定 `all-open` 註解，或是啟用 _預設_：

```bash
# 外掛程式選項格式為："-P plugin:<plugin id>:<key>=<value>"。 
# 選項可以重複。

-P plugin:org.jetbrains.kotlin.allopen:annotation=com.my.Annotation
-P plugin:org.jetbrains.kotlin.allopen:preset=spring
```

`all-open` 外掛程式可用的預設為：`spring`、`micronaut` 以及 `quarkus`。
-->

## 後續步驟 {id="what-s-next"}

* 對於 Spring 應用程式，請使用 [`kotlin-spring` 外掛程式](kotlin-spring-plugin.md)，這是一個預先設定好的包裝函式，能將帶有 Spring 註解的類別設為 `open`。
* 對於 JPA 實體，請使用 [`kotlin-jpa` 外掛程式](kotlin-jpa-plugin.md)，它會將實體設為 `open` 並為其產生無引數建構函式。
* 探索 [`all-open` 編譯器外掛程式](https://github.com/JetBrains/kotlin/tree/master/plugins/allopen) 的原始碼。