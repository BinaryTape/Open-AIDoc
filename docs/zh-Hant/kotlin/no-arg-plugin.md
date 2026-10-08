[//]: # (title: No-arg 編譯器外掛程式)

*no-arg* 編譯器外掛程式會為具有特定註解的類別產生一個額外的零參數建構函式。 

產生的建構函式是合成的 (synthetic)，因此無法直接從 Java 或 Kotlin 呼叫，但可以使用反射進行呼叫。

這使得 Java Persistence API (JPA) 能夠具現化類別，儘管從 Kotlin 或 Java 的角度來看，該類別並沒有零參數建構函式（請參閱[下方](#jpa-support)的 `kotlin-jpa` 外掛程式說明）。

## 在您的 Kotlin 檔案中 {id="in-your-kotlin-file"}

加入新的註解來標記需要零參數建構函式的程式碼：

```kotlin
package com.my

annotation class Annotation
```

## Gradle {id="gradle"}

使用 Gradle 的外掛程式 DSL 加入外掛程式：

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

然後指定 no-arg 註解清單，這些註解必須導致為被註解的類別產生 no-arg 建構函式：

```groovy
noArg {
    annotation("com.my.Annotation")
}
```

如果您希望外掛程式從合成建構函式執行初始化邏輯，請啟用 `invokeInitializers` 選項。預設情況下，它是停用的。

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
            <!-- 或使用 "jpa" 以取得 JPA 支援 -->
            <plugin>no-arg</plugin>
        </compilerPlugins>

        <pluginOptions>
            <option>no-arg:annotation=com.my.Annotation</option>
            <!-- 在合成建構函式中呼叫執行個體初始設定式 -->
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

## JPA 支援 {id="jpa-support"}

與封裝在 `all-open` 之上的 `kotlin-spring` 外掛程式一樣，`kotlin-jpa` 是封裝在 `no-arg` 之上的。該外掛程式會自動指定 [`@Entity`](https://docs.oracle.com/javaee/7/api/javax/persistence/Entity.html)、[`@Embeddable`](https://docs.oracle.com/javaee/7/api/javax/persistence/Embeddable.html) 和 [`@MappedSuperclass`](https://docs.oracle.com/javaee/7/api/javax/persistence/MappedSuperclass.html) 等 *no-arg* 註解。

使用 Gradle 外掛程式 DSL 加入外掛程式：

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

在 Maven 中，啟用 `jpa` 外掛程式：

```xml
<compilerPlugins>
    <plugin>jpa</plugin>
</compilerPlugins>
```

## 命令列編譯器 {id="command-line-compiler"}

將外掛程式 JAR 檔案加入編譯器外掛程式類別路徑 (classpath)，並指定註解或預設：

```bash
-Xplugin=$KOTLIN_HOME/lib/noarg-compiler-plugin.jar
-P plugin:org.jetbrains.kotlin.noarg:annotation=com.my.Annotation
-P plugin:org.jetbrains.kotlin.noarg:preset=jpa
```
