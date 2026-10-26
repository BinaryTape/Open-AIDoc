[//]: # (title: Kotlin-jpa 編譯器外掛程式)

`kotlin-jpa` 編譯器外掛程式為 Java Persistence API (JPA) 配置 Kotlin 專案。
JPA 有兩項與 Kotlin 預設設定衝突的需求：

* **無引數建構函式。** JPA 透過反射將實體具現化（此程序稱為 _hydration_），這需要一個無引數建構函式。Kotlin 類別預設不會宣告此函式。
* **非 final 類別。** JPA 提供者會建立實體的代理子類別以支援延遲載入（例如用於 `@ManyToOne` 和 `@OneToOne` 關聯）。Kotlin 類別及其成員預設為 `final`，這會阻礙此機制的運作。如果實體不是 `open`，延遲載入將無法運作。

`kotlin-jpa` 外掛程式解決了這兩個問題。它是一個預先配置的包裝函式，套用了：

* [`no-arg` 外掛程式](no-arg-plugin.md)，為帶有 JPA 註解的類別產生無引數建構函式。
* [`all-open` 外掛程式](all-open-plugin.md)，將帶有 JPA 註解的類別及其成員設為 `open`。

產生的建構函式會標記層級為 `HIDDEN` 的 `@Deprecated` 註解，因此你可以從 Java 呼叫它，但無法從 Kotlin 呼叫。
JPA 則可透過反射來呼叫它。

> 如果你使用 [start.spring.io](https://start.spring.io/#!language=kotlin) 產生包含 JPA 相依性的專案樣板，`kotlin-jpa` 外掛程式預設為啟用。
>
{style="note"}

## 支援的 JPA 註解 {id="supported-jpa-annotations"}

JPA 註解存在於兩個套件命名空間中：較舊的 `javax.persistence`（Java EE）以及較新的 `jakarta.persistence`（自 Jakarta EE 9 起，由 Spring Boot 3.x 及更新版本使用）。`kotlin-jpa` 外掛程式可辨識這兩個命名空間，並自動為底層的 `no-arg` 和 `all-open` 外掛程式指定以下註解：

* `javax.persistence.Entity` 與 `jakarta.persistence.Entity`
* `javax.persistence.Embeddable` 與 `jakarta.persistence.Embeddable`
* `javax.persistence.MappedSuperclass` 與 `jakarta.persistence.MappedSuperclass`

請使用符合你架構版本的命名空間註解。你不需要為任一命名空間特別配置外掛程式：兩者均預設啟用。

## 套用外掛程式 {id="apply-the-plugin"}

### Gradle {id="gradle"}

在 `build.gradle(.kts)` 檔案的 `plugins {}` 區塊中新增 `kotlin-jpa` 外掛程式：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("jvm") version "%kotlinVersion%"  // 要使用的 Kotlin 版本
    kotlin("plugin.jpa") version "%kotlinVersion%" // Kotlin JPA 外掛程式
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id "org.jetbrains.kotlin.jvm" version "%kotlinVersion%"
    id "org.jetbrains.kotlin.plugin.jpa" version "%kotlinVersion%"
}
```

</tab>
</tabs>

### Maven {id="maven"}

在 Maven 中，對 `kotlin-jpa` 外掛程式的支援是由 `kotlin-maven-noarg` 外掛程式提供的。
請將其新增到你的 `pom.xml` 檔案中：

```xml
<properties>
    <kotlin.version>%kotlinVersion%</kotlin.version>
</properties>

<plugin>
    <groupId>org.jetbrains.kotlin</groupId>
    <artifactId>kotlin-maven-plugin</artifactId>
    <version>${kotlin.version}</version>
    <configuration>
        <compilerPlugins>
            <plugin>jpa</plugin>
        </compilerPlugins>
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

> 自 Kotlin 2.3.20 起，`kotlin-maven-noarg` 隱含包含 `kotlin-maven-allopen`，因此你不再需要明確新增 `all-open` 相依性。
>
{style="note"}

## 使用 `kotlin-jpa` 外掛程式 {id="use-the-kotlin-jpa-plugin"}

套用該外掛程式後，帶有常見 JPA 註解的類別會在編譯期變為 `open`，並獲得一個無引數建構函式。你可以將實體編寫為一般類別，而無需手動新增 `open` 關鍵字或宣告無引數建構函式。

以下範例使用 `jakarta.persistence` 命名空間。如果你的架構仍在使用 Java EE，請改為從 `javax.persistence` 匯入相同的註解，外掛程式能同時處理這兩種情況：

```kotlin
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.Id

@Entity
class Message(
    var text: String,
) {
    // kotlin-jpa 外掛程式將此類別設為 open，並產生一個
    // JPA 用來具現化它的無引數建構函式
    @Id
    @GeneratedValue
    var id: Long? = null
}
```

## JPA 實體最佳實務 {id="best-practices-for-jpa-entities"}

套用該外掛程式會使實體成為 `open` 並為其提供無引數建構函式，但少數 Kotlin 慣用法仍與 JPA 提供者管理實體的方式存在衝突。請遵循以下準則以避免常見問題：

* **使用一般類別，而非 `data class`。** 資料類別偏好不可變的 `val` 屬性，並會根據所有屬性衍生出 `equals()`、`hashCode()` 與 `toString()`。對於實體而言，這會破壞代理物件，且 `toString()` 或 `equals()` 可能會在延遲關聯上觸發額外的查詢。請將實體建模為一般類別（外掛程式會將其設為 `open`），並將資料類別保留給 DTO 和查詢結果使用。
* **將對應屬性宣告為 `var`。** JPA 在 hydration 實體時會設定欄位，因此對應屬性必須是可變的。
* **將產生的識別碼設為可 null 且可變。** 在實體被持久化之前，帶有 `@GeneratedValue` 的識別碼為 `null`，因此請將其宣告為 `var id: Long? = null`。
  
  > 在 Kotlin 中，你無法對基本型別使用 `lateinit`。
  >
  {style="note"}
  
* **僅根據識別碼與型別來定義 `equals()` 和 `hashCode()`**，而非根據所有屬性。這能確保它們在實體生命週期中保持穩定，並避免載入延遲欄位。

若要深入了解這些陷阱，請參閱 [How to avoid common pitfalls with JPA and Kotlin](https://blog.jetbrains.com/idea/2026/01/how-to-avoid-common-pitfalls-with-jpa-and-kotlin/) 部落格文章。

## 涵蓋沒有 JPA 註解的類別 {id="cover-classes-without-jpa-annotations"}

`kotlin-jpa` 外掛程式僅配置[支援的 JPA 註解](#supported-jpa-annotations)。若要為未帶有 JPA 註解的型別產生無引數建構函式或將類別設為 `open`，請宣告你自己的註解，並向底層的 `no-arg` 與 `all-open` 外掛程式註冊該註解：

1. 宣告你自己的註解：

   ```kotlin
   package com.example

   annotation class OpenNoArgAnnotation
   ```

2. 在你的建置檔案中，向底層外掛程式註冊該註解：

   <tabs group="build-script">
   <tab title="Gradle (Kotlin)" group-key="kotlin">

   在你的 `build.gradle.kts` 檔案中，於透過 `kotlin-jpa` 外掛程式提供的 `noArg {}` 和 `allOpen {}` 區塊中註冊該註解：

   ```kotlin
   plugins {
       kotlin("jvm") version "%kotlinVersion%"
       kotlin("plugin.jpa") version "%kotlinVersion%"
   }

   noArg {
       annotation("com.example.OpenNoArgAnnotation")
   }

   allOpen {
       annotation("com.example.OpenNoArgAnnotation")
   }
   ```

   </tab>
   <tab title="Gradle (Groovy)" group-key="groovy">

   在你的 `build.gradle` 檔案中，於透過 `kotlin-jpa` 外掛程式提供的 `noArg {}` 和 `allOpen {}` 區塊中註冊該註解：

   ```groovy
   plugins {
       id "org.jetbrains.kotlin.jvm" version "%kotlinVersion%"
       id "org.jetbrains.kotlin.plugin.jpa" version "%kotlinVersion%"
   }

   noArg {
       annotation("com.example.OpenNoArgAnnotation")
   }

   allOpen {
       annotation("com.example.OpenNoArgAnnotation")
   }
   ```

   </tab>
   <tab title="Maven" group-key="maven">

   在你的 `pom.xml` 檔案中，將 `no-arg:annotation` 和 `all-open:annotation` 選項新增至 `kotlin-maven-plugin` 配置：

   ```xml
   <properties>
       <kotlin.version>%kotlinVersion%</kotlin.version>
   </properties>

   <plugin>
       <groupId>org.jetbrains.kotlin</groupId>
       <artifactId>kotlin-maven-plugin</artifactId>
       <version>${kotlin.version}</version>
       <configuration>
           <compilerPlugins>
               <plugin>jpa</plugin>
           </compilerPlugins>

           <pluginOptions>
               <!-- 若有多個註解，可新增多行 -->
               <option>no-arg:annotation=com.example.OpenNoArgAnnotation</option>
               <option>all-open:annotation=com.example.OpenNoArgAnnotation</option>
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

   </tab>
   </tabs>

3. 標記沒有 JPA 註解的類別：

   ```kotlin
   package com.example

   import jakarta.persistence.Entity
   import jakarta.persistence.GeneratedValue
   import jakarta.persistence.Id

   // 自動由 kotlin-jpa 外掛程式涵蓋
   @Entity
   class Message(
       var text: String,
   ) {
       @Id
       @GeneratedValue
       var id: Long? = null
   }

   // 自訂註解將此類別設為 open
   // 並產生一個無引數建構函式
   @OpenNoArgAnnotation
   class MessageMetadata(
       var author: String,
   )
   ```

如需更多詳細資訊，請參閱 [`no-arg`](no-arg-plugin.md) 與 [`all-open`](all-open-plugin.md)。

## 後續步驟 {id="what-s-next"}

* 閱讀關於[如何避免常見實體對應問題](https://blog.jetbrains.com/idea/2026/01/how-to-avoid-common-pitfalls-with-jpa-and-kotlin/)的部落格文章。
* 對於需要類別為 `open` 的 Spring 應用程式，請使用 [`kotlin-spring` 外掛程式](kotlin-spring-plugin.md)，它會使用 Spring 註解（例如 `@Component`、`@Transactional` 和 `@Configuration`）來配置 `all-open` 外掛程式。
* 使用[開始使用 Spring Boot 和 Kotlin](jvm-get-started-spring-boot.md)教學來建立你的第一個 Spring Boot 應用程式。