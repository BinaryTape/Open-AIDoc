[//]: # (title: No-arg 編譯器外掛程式)

`no-arg` 編譯器外掛程式會為帶有特定註解的類別產生零引數建構函式。

產生的建構函式會標記層級為 `HIDDEN` 的 `@Deprecated`，因此你可以從 Java 呼叫它，但無法從 Kotlin 呼叫。
各個架構可以透過反射來呼叫它。

例如，這可讓像是 Java Persistence API (JPA) 等架構具現化未宣告零引數建構函式的 Kotlin 類別。

> 對於搭配 Kotlin 使用的 JPA 實體，你可以使用 [`kotlin-jpa` 編譯器外掛程式](kotlin-jpa-plugin.md)。
> 它會自動指定 JPA 註解，例如 `@Entity`、`@Embeddable` 以及 `@MappedSuperclass`。
>
{style="note"}

## 宣告註解 {id="declare-an-annotation"}

`no-arg` 外掛程式僅會處理標有你在其配置中註冊之註解的類別。
因此在啟用外掛程式之前，請宣告一個註解來標記需要零引數建構函式的類別。
例如 `NoArgAnnotation`：

```kotlin
package com.example

annotation class NoArgAnnotation
```

## 套用外掛程式 {id="apply-the-plugin"}

### Gradle {id="gradle"}

在 `build.gradle(.kts)` 檔案的 `plugins {}` 區塊中新增 `no-arg` 外掛程式：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("jvm") version "%kotlinVersion%"  // 要使用的 Kotlin 版本
    kotlin("plugin.noarg") version "%kotlinVersion%" // Kotlin no-arg 外掛程式
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

接著指定你先前宣告的註解（例如 `com.example.NoArgAnnotation`），以便為帶有註解的類別產生零引數建構函式：

```groovy
noArg {
    annotation("com.example.NoArgAnnotation")
}
```

如果你希望外掛程式從產生的建構函式中執行類別初始化邏輯，請啟用 `invokeInitializers` 選項。此選項預設已停用：

```groovy
noArg {
    invokeInitializers = true
}
```

### Maven {id="maven"}

將外掛程式新增至你的 `pom.xml` 檔案：

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
            <!-- 在產生的建構函式中呼叫執行個體初始設定式 -->
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

## 使用 `no-arg` 外掛程式 {id="use-the-no-arg-plugin"}

套用外掛程式後，帶有已註冊註解的類別將在編譯期取得零引數建構函式。你不需要手動宣告建構函式：

```kotlin
package com.example

// no-arg 外掛程式會為此類別產生零引數建構函式
@NoArgAnnotation
class MyEntity(val id: Int)
```

<!--
## 命令列編譯器 {id="command-line-compiler"}

將外掛程式 JAR 檔案新增至編譯器外掛程式類別路徑 (classpath)，並指定註解或預設值：

```bash
-Xplugin=$KOTLIN_HOME/lib/noarg-compiler-plugin.jar
-P plugin:org.jetbrains.kotlin.noarg:annotation=com.my.Annotation
-P plugin:org.jetbrains.kotlin.noarg:preset=jpa
```
-->

## 後續內容 {id="what-s-next"}

* 對於 JPA 實體，請使用 [`kotlin-jpa` 外掛程式](kotlin-jpa-plugin.md)，它會使用 JPA 註解（例如 `@Entity`、`@Embeddable` 和 `@MappedSuperclass`）來設定 `no-arg` 與 `all-open` 外掛程式。
* 探索 [`no-arg` 編譯器外掛程式](https://github.com/JetBrains/kotlin/tree/master/plugins/noarg)的原始碼。