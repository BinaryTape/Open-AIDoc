[//]: # (title: 使用 Ktor Gradle 外掛程式建立 fat JAR)

<tldr>
<var name="example_name" value="deployment-ktor-plugin"/>
<p>
    <b>程式碼範例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>了解如何使用 Ktor Gradle 外掛程式建立並執行可執行的 fat JAR。</link-summary>

[Ktor Gradle 外掛程式](https://github.com/ktorio/ktor-build-plugins)可讓您建立並執行包含所有程式碼相依性的可執行 JAR（fat JAR）。

## 設定 Ktor 外掛程式 {id="configure-plugin"}

若要建置 fat JAR，您需要先設定 Ktor 外掛程式：

1. 開啟 <Path>build.gradle.kts</Path> 檔案，並將 Ktor 外掛程式新增至 `plugins {}` 區塊：
   ```kotlin
   plugins {
       alias(ktorLibs.plugins.ktor)
   }
   ```

   <note>
       上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
       Ktor 版本目錄 (version catalog)</a> 來指定 Ktor 相依性。
   </note>

2. 確保已設定[主要應用程式類別](server-dependencies.topic#create-entry-point)：
   ```kotlin
   application {
       mainClass.set("com.example.ApplicationKt")
   }
   ```

3. （選用）您可以使用 `ktor.fatJar` 擴充套件來設定即將產生的 fat JAR 名稱：
   ```kotlin
   ktor {
       fatJar {
           archiveFileName.set("fat.jar")
       }
   }
   ```

> 若您同時套用 Ktor Gradle 外掛程式與 Kotlin Multiplatform Gradle 外掛程式，fat JAR 建立功能會自動停用。
> 若要同時使用兩者：
> 1. 如上所示，建立一個套用了 Ktor Gradle 外掛程式的純 JVM 專案。
> 2. 將 Kotlin Multiplatform 專案新增為該純 JVM 專案的相依性。
> 
> 如果此暫代方案無法解決您的問題，請在 [KTOR-8464](https://youtrack.jetbrains.com/issue/KTOR-8464) 留下評論以讓我們知道。
>
{style="warning"}

## 建置並執行 fat JAR {id="build"}

Ktor 外掛程式提供了下列任務用於建立與執行 fat JAR：
- `buildFatJar`：建置結合專案與執行時期相依性的 JAR。當此組建完成時，您應該會在 `build/libs` 目錄中看到 `***-all.jar` 檔案。
- `runFatJar`：建置專案的 fat JAR 並執行它。

> 若要了解如何使用 ProGuard 最小化產生的 JAR，請參閱 [proguard](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/proguard) 範例。