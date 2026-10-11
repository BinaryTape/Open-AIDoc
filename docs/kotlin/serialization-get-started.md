[//]: # (title: Kotlin 序列化入门)

[序列化](serialization.md)将对象转换为可用于存储或传输并在之后重新构建的格式。

Kotlin 序列化支持多种格式。
本教程将向您展示如何为 Kotlin 序列化添加必要的插件和依赖项，以及如何以 JSON 格式序列化和反序列化对象。

## 添加插件和依赖项 {id="add-plugins-and-dependencies"}

要在项目中使用 Kotlin 序列化，请根据您的构建工具添加相应的插件和依赖项配置：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
// build.gradle.kts
plugins {
    kotlin("plugin.serialization") version "%kotlinVersion%"
}

dependencies { 
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:%serializationVersion%")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
// build.gradle
plugins {
    id 'org.jetbrains.kotlin.plugin.serialization' version '%kotlinVersion%'  
}

dependencies {
    implementation 'org.jetbrains.kotlinx:kotlinx-serialization-json:%serializationVersion%'
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<!-- pom.xml -->
<properties>
    <kotlin.version>%kotlinVersion%</kotlin.version>
    <serialization.version>%serializationVersion%</serialization.version>
</properties>

<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <version>${kotlin.version}</version>
            <executions>
                <execution>
                    <id>compile</id>
                    <phase>compile</phase>
                    <goals>
                        <goal>compile</goal>
                    </goals>
                </execution>
            </executions>
            <configuration>
                <compilerPlugins>
                    <plugin>kotlinx-serialization</plugin>
                </compilerPlugins>
            </configuration>
            <dependencies>
                <dependency>
                    <groupId>org.jetbrains.kotlin</groupId>
                    <artifactId>kotlin-maven-serialization</artifactId>
                    <version>${kotlin.version}</version>
                </dependency>
            </dependencies>
        </plugin>
    </plugins>
</build>

<dependencies>
    <dependency>
        <groupId>org.jetbrains.kotlinx</groupId>
        <artifactId>kotlinx-serialization-json</artifactId>
        <version>${serialization.version}</version>
    </dependency>
</dependencies>
```

</tab>
</tabs>

> 要为 Bazel 设置 Kotlin 编译器插件，请参考 [rules_kotlin 仓库](https://github.com/bazelbuild/rules_kotlin/tree/master/examples/plugin/src/serialization)中的示例。
> Kotlin 团队并未正式支持 Bazel，该仓库为独立维护。
>
{style="tip"}

### 将库添加到多平台项目 {id="add-the-library-to-a-multiplatform-project"}

要在多平台项目中使用 Kotlin 序列化处理 JSON，请将 JSON 序列化库依赖项添加到公共源集中：

```kotlin
commonMain {
    dependencies {
        implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:%serializationVersion%")
    }
}
```

该依赖项还会自动包含核心序列化库。

### 在 Android 项目中为 Kotlin 序列化配置 R8 {initial-collapse-state="collapsed" collapsible="true" id="configure-r8-for-kotlin-serialization-in-android-projects"}

Kotlin 序列化包含默认的 [ProGuard 规则](https://github.com/Kotlin/kotlinx.serialization/blob/master/rules/common.pro)，因此在[压缩](https://developer.android.com/topic/performance/app-optimization/enable-app-optimization)后，您无需额外配置即可为所有可序列化类保留序列化器。
但是，这些规则不适用于带有命名伴生对象的类。

若要为带有命名伴生对象的类保留序列化器，请根据您使用的[兼容模式](https://r8.googlesource.com/r8/+/refs/heads/master/compatibility-faq.md)将规则添加到 `proguard-rules.pro` 文件中：

<tabs>
<tab id="compatibility" title="R8 compatibility mode">

```bash
# 带有命名伴生对象的类的序列化器是通过 getDeclaredClasses 获取的
# 如果您有任何此类类，请将以下示例替换为您自己的类
-keepattributes InnerClasses # getDeclaredClasses 所需

-if @kotlinx.serialization.Serializable class
com.example.myapplication.HasNamedCompanion, # <-- 列出带有命名伴生对象的可序列化类
com.example.myapplication.HasNamedCompanion2
{
    static **$* *;
}
-keepnames class <1>$$serializer { # 使用 -keepnames 足以让 serializer() 调用正确引用该类
    static <1>$$serializer INSTANCE;
}
```

</tab>

<tab id="full" title="R8 full mode">

```bash
# 带有命名伴生对象的类的序列化器是通过 getDeclaredClasses 获取的
# 如果您有任何此类类，请将以下示例替换为您自己的类
-keepattributes InnerClasses # getDeclaredClasses 所需

-if @kotlinx.serialization.Serializable class
com.example.myapplication.HasNamedCompanion, # <-- 列出带有命名伴生对象的可序列化类
com.example.myapplication.HasNamedCompanion2
{
    static **$* *;
}
-keepnames class <1>$$serializer { # 使用 -keepnames 足以让 serializer() 调用正确引用该类
    static <1>$$serializer INSTANCE;
}

# 同时保留序列化器和可序列化类以保留 InnerClasses 特性
-keepclasseswithmembers, allowshrinking, allowobfuscation, allowaccessmodification class
com.example.myapplication.HasNamedCompanion, # <-- 列出带有命名伴生对象的可序列化类
com.example.myapplication.HasNamedCompanion2
{
    *;
}
```

</tab>
</tabs>

> 您可以通过使用具有更窄[类规范](https://www.guardsquare.com/manual/configuration/usage)的自定义 ProGuard 规则，排除在运行时从不序列化的可序列化类。
> 
{style="tip"}

## 将对象序列化为 JSON {id="serialize-objects-to-json"}

在 Kotlin 中，您可以使用 `kotlinx-serialization-json` 库将对象序列化为 JSON。

要使一个类可序列化，需要使用 [`@Serializable`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serializable/) 注解对其进行标记。
该注解指示编译器生成序列化和反序列化该类实例所需的基本代码。
更多信息请参阅 [`@Serializable` 注解](serialization-customization-options.md#the-serializable-annotation)。

让我们来看一个示例：

1. 导入所需序列化库中的声明：

    ```kotlin
    import kotlinx.serialization.*
    import kotlinx.serialization.json.*
    ```

2. 使用 `@Serializable` 注解标记类，使其可序列化：

    ```kotlin
    @Serializable
    data class Book(val yearPublished: Int, val title: String)
    ```

   > `@Serializable` 注解默认启用所有带支持字段的属性的序列化。
   > 您可以使用属性级注解、可选属性等自定义序列化行为。
   > 
   > 更多信息请参阅[序列化类](serialization-customization-options.md)。
   >
   {style="note"}

3. 使用 [`Json.encodeToString()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json/encode-to-string.html) 函数序列化该类的实例：

    ```kotlin
    // 从序列化和 JSON 处理库中导入声明
    import kotlinx.serialization.*
    import kotlinx.serialization.json.*

    // 将 Book 类标记为可序列化
    @Serializable
    data class Book(val yearPublished: Int, val title: String)

    fun main() {
        // 将 Book 类的实例序列化为 JSON 字符串
        val json = Json.encodeToString(Book(1937, "The Hobbit"))
        println(json)
        // {"yearPublished":1937,"title":"The Hobbit"}
    }
    ```
   {kotlin-runnable="true" id="serialize-get-started"}

   结果，您将获得一个包含该对象 JSON 格式状态的字符串：`{"yearPublished":1937,"title":"The Hobbit"}`。

   > 您还可以在单次调用中序列化对象集合：
   >
   > ```kotlin
   > val bookList = listOf(Book(1937, "The Hobbit"), Book(1867, "War and Peace"))
   > val jsonList = Json.encodeToString(bookList)
   > ```
   >
   {style="tip"}

## 从 JSON 反序列化对象 {id="deserialize-objects-from-json"}

反序列化将 JSON 字符串重新转换为对象。

要在 Kotlin 中从 JSON 反序列化对象：

1. 导入所需序列化库中的声明：

    ```kotlin
    import kotlinx.serialization.*
    import kotlinx.serialization.json.*
    ```

2. 使用 `@Serializable` 注解标记类，使其可序列化：

    ```kotlin
    @Serializable
    data class Book(val yearPublished: Int, val title: String)
    ```

3. 使用 [`Json.decodeFromString()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json/decode-from-string.html) 函数从 JSON 反序列化对象：

    ```kotlin
    // 从序列化和 JSON 处理库中导入声明
    import kotlinx.serialization.*
    import kotlinx.serialization.json.*

    // 将 Book 类标记为可序列化
    @Serializable
    data class Book(val yearPublished: Int, val title: String)

    fun main() {
        // 将 JSON 字符串反序列化为 Book 类的实例
        val obj = Json.decodeFromString<Book>("""{"yearPublished":1937, "title": "The Hobbit"}""")
        println(obj)
        // Book(yearPublished=1937, title=The Hobbit)
    }
    ```
   {kotlin-runnable="true" id="deserialize-get-started"}

恭喜！您已成功在 Kotlin 中将对象序列化为 JSON，并将其反序列化回对象。

## 最新变化 {id="what-s-next"}

* 在[序列化内置类型](serialization-serialize-builtin-types.md)中了解如何序列化基本类型（如基本类型与字符串）以及某些标准库类。
* 在[序列化类](serialization-customization-options.md)中了解如何自定义类序列化并调整 `@Serializable` 注解的默认行为。
* 在 [JSON 序列化概述](serialization-configure-json-serialization.md)中深入了解如何处理 JSON 数据以及配置 JSON 序列化。