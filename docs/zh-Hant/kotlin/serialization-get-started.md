[//]: # (title: 開始使用 Kotlin 序列化)

[序列化](serialization.md)（Serialization）會將物件轉換為可儲存或傳輸的格式，並可在日後重構該物件。

Kotlin 序列化支援多種格式。
本教學將向您展示如何為 Kotlin 序列化新增必要的外掛程式與相依性，以及如何對 JSON 格式的物件進行序列化與反序列化。

## 新增外掛程式與相依性 {id="add-plugins-and-dependencies"}

若要在專案中使用 Kotlin 序列化，請根據您的建置工具新增對應的外掛程式與相依性設定：

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

> 若要為 Bazel 設定 Kotlin 編譯器外掛程式，請參考 [rules_kotlin 存儲庫](https://github.com/bazelbuild/rules_kotlin/tree/master/examples/plugin/src/serialization) 中的範例。
> Kotlin 團隊並未正式支援 Bazel，該存儲庫是由社群獨立維護的。
>
{style="tip"}

### 將程式庫新增至多平台專案 {id="add-the-library-to-a-multiplatform-project"}

若要在多平台專案中對 JSON 使用 Kotlin 序列化，請將 JSON 序列化程式庫相依性新增至通用原始碼集（common source set）：

```kotlin
commonMain {
    dependencies {
        implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:%serializationVersion%")
    }
}
```

此相依性也會自動包含核心序列化程式庫。

### 在 Android 專案中為 Kotlin 序列化設定 R8 {initial-collapse-state="collapsed" collapsible="true" id="configure-r8-for-kotlin-serialization-in-android-projects"}

Kotlin 序列化包含了預設的 [ProGuard 規則](https://github.com/Kotlin/kotlinx.serialization/blob/master/rules/common.pro)，因此在[程式碼縮減](https://developer.android.com/topic/performance/app-optimization/enable-app-optimization)（shrinking）之後，您無需進行額外設定即可保留所有可序列化類別的序列化器。
然而，這些規則並不適用於包含具名伴生物件（named companion objects）的類別。

若要保留具有具名伴生物件類別的序列化器，請根據您使用的[相容模式](https://r8.googlesource.com/r8/+/refs/heads/master/compatibility-faq.md)，在 `proguard-rules.pro` 檔案中新增規則：

<tabs>
<tab id="compatibility" title="R8 相容模式">

```bash
# 包含具名伴生物件之類別的序列化器是透過 getDeclaredClasses 取得的
# 若您有任何此類類別，請將以下範例替換為您自己的類別
-keepattributes InnerClasses # getDeclaredClasses 所需

-if @kotlinx.serialization.Serializable class
com.example.myapplication.HasNamedCompanion, # <-- 列出具有具名伴生物件的可序列化類別
com.example.myapplication.HasNamedCompanion2
{
    static **$* *;
}
-keepnames class <1>$$serializer { # 使用 -keepnames 即足以讓 serializer() 呼叫正確參照該類別
    static <1>$$serializer INSTANCE;
}
```

</tab>

<tab id="full" title="R8 完整模式">

```bash
# 包含具名伴生物件之類別的序列化器是透過 getDeclaredClasses 取得的
# 若您有任何此類類別，請將以下範例替換為您自己的類別
-keepattributes InnerClasses # getDeclaredClasses 所需

-if @kotlinx.serialization.Serializable class
com.example.myapplication.HasNamedCompanion, # <-- 列出具有具名伴生物件的可序列化類別
com.example.myapplication.HasNamedCompanion2
{
    static **$* *;
}
-keepnames class <1>$$serializer { # 使用 -keepnames 即足以讓 serializer() 呼叫正確參照該類別
    static <1>$$serializer INSTANCE;
}

# 同時保留序列化器與可序列化類別以保留 InnerClasses 屬性
-keepclasseswithmembers, allowshrinking, allowobfuscation, allowaccessmodification class
com.example.myapplication.HasNamedCompanion, # <-- 列出具有具名伴生物件的可序列化類別
com.example.myapplication.HasNamedCompanion2
{
    *;
}
```

</tab>
</tabs>

> 您可以使用更具針對性的[類別規格](https://www.guardsquare.com/manual/configuration/usage)自訂 ProGuard 規則，排除在執行階段從未被序列化的可序列化類別。
> 
{style="tip"}

## 將物件序列化為 JSON {id="serialize-objects-to-json"}

在 Kotlin 中，您可以使用 `kotlinx-serialization-json` 程式庫將物件序列化為 JSON。

若要使類別可序列化，您需要使用 [`@Serializable`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serializable/) 註解進行標記。
此註解會指示編譯器產生序列化與反序列化該類別執行個體所需的程式碼。
如需更多資訊，請參閱 [The `@Serializable` annotation](serialization-customization-options.md#the-serializable-annotation)。

讓我們來看一個範例：

1. 從必要的序列化程式庫匯入宣告：

    ```kotlin
    import kotlinx.serialization.*
    import kotlinx.serialization.json.*
    ```

2. 透過加上 `@Serializable` 註解使類別可序列化：

    ```kotlin
    @Serializable
    data class Book(val yearPublished: Int, val title: String)
    ```

   > `@Serializable` 註解會對所有具有支援欄位的屬性啟用預設序列化。
   > 您可以使用屬性層級的註解、選用屬性等來自訂序列化行為。
   > 
   > 如需更多資訊，請參閱[序列化類別](serialization-customization-options.md)。
   >
   {style="note"}

3. 使用 [`Json.encodeToString()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json/encode-to-string.html) 函式來序列化此類別的執行個體：

    ```kotlin
    // 從序列化與 JSON 處理程式庫匯入宣告
    import kotlinx.serialization.*
    import kotlinx.serialization.json.*

    // 將 Book 類別標記為可序列化
    @Serializable
    data class Book(val yearPublished: Int, val title: String)

    fun main() {
        // 將 Book 類別的執行個體序列化為 JSON 字串
        val json = Json.encodeToString(Book(1937, "The Hobbit"))
        println(json)
        // {"yearPublished":1937,"title":"The Hobbit"}
    }
    ```
   {kotlin-runnable="true" id="serialize-get-started"}

   結果將會獲得一個包含該物件狀態的 JSON 格式字串：`{"yearPublished":1937,"title":"The Hobbit"}`。

   > 您也可以在單次呼叫中序列化物件集合：
   >
   > ```kotlin
   > val bookList = listOf(Book(1937, "The Hobbit"), Book(1867, "War and Peace"))
   > val jsonList = Json.encodeToString(bookList)
   > ```
   >
   {style="tip"}

## 從 JSON 反序列化物件 {id="deserialize-objects-from-json"}

反序列化會將 JSON 字串轉換回物件。

要在 Kotlin 中從 JSON 反序列化物件：

1. 從必要的序列化程式庫匯入宣告：

    ```kotlin
    import kotlinx.serialization.*
    import kotlinx.serialization.json.*
    ```

2. 透過加上 `@Serializable` 註解使類別可序列化：

    ```kotlin
    @Serializable
    data class Book(val yearPublished: Int, val title: String)
    ```

3. 使用 [`Json.decodeFromString()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json/decode-from-string.html) 函式從 JSON 反序列化物件：

    ```kotlin
    // 從序列化與 JSON 處理程式庫匯入宣告
    import kotlinx.serialization.*
    import kotlinx.serialization.json.*

    // 將 Book 類別標記為可序列化
    @Serializable
    data class Book(val yearPublished: Int, val title: String)

    fun main() {
        // 將 JSON 字串反序列化為 Book 類別的執行個體
        val obj = Json.decodeFromString<Book>("""{"yearPublished":1937, "title": "The Hobbit"}""")
        println(obj)
        // Book(yearPublished=1937, title=The Hobbit)
    }
    ```
   {kotlin-runnable="true" id="deserialize-get-started"}

恭喜！您已成功在 Kotlin 中將物件序列化為 JSON，並將其反序列化回物件。

## 下一步 {id="what-s-next"}

* 請參閱[序列化內建型別](serialization-serialize-builtin-types.md)，了解如何序列化基本型別（如原始型別和字串）以及特定的標準程式庫類別。
* 請參閱[序列化類別](serialization-customization-options.md)，探索如何自訂類別序列化並調整 `@Serializable` 註解的預設行為。
* 在 [JSON 序列化總覽](serialization-configure-json-serialization.md)中深入了解如何處理 JSON 資料與設定 JSON 序列化。