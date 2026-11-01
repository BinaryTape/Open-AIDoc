[//]: # (title: 連線池與快取)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="tutorial-website-interactive-persistence-advanced"/>
<p>
    <b>程式碼範例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
<b>使用的程式庫</b>: <a href="https://github.com/brettwooldridge/HikariCP">HikariCP</a>, <a href="https://www.ehcache.org/">Ehcache</a>
</p>
</tldr>

<link-summary>了解如何實作資料庫連線池與快取。</link-summary>

在[上一篇教學](db-persistence.md)中，我們使用 Exposed 架構為網站新增了持久化功能。
在本教學中，我們將探討如何分別使用 HikariCP 與 Ehcache 程式庫來實作資料庫連線池與快取。

## 新增相依性 {id="add-dependencies"}

首先，您需要新增 HikariCP 與 Ehcache 程式庫的相依性。
開啟 `gradle/libs.versions.toml` 檔案並定義程式庫版本與別名：

```toml
[versions]
ehcache = "3.10.8"
hikaricp = "5.1.0"
[libraries]
ehcache = { module = "org.ehcache:ehcache", version.ref = "ehcache" }
hikaricp = { module = "com.zaxxer:HikariCP", version.ref = "hikaricp" }
```

接著，開啟 `build.gradle.kts` 並新增以下相依性：

```kotlin
dependencies {
    implementation(libs.hikaricp)
    implementation(libs.ehcache)
}
```

點擊 `build.gradle.kts` 檔案右上角的 **Load Gradle Changes** 圖示以安裝新加入的相依性。

## 連線池 {id="connection-pooling"}

當 Exposed 在 `transaction` 呼叫的範圍內首次對資料庫執行操作時，
它會在該 `transaction` 內部建立一個新的 JDBC 連線。
但是頻繁建立多個 JDBC 連線相當消耗資源：
重複使用現有的連線有助於提升效能。
_連線池 (connection pooling)_ 機制正是用來解決這個問題。

在本節中，我們將使用 HikariCP 架構來管理應用程式中的 JDBC 連線池。

### 將連線設定擷取至組態檔案 {id="connection-settings-config"}

在[上一篇教學](db-persistence.md#connect_db)中，我們在 `com/example/dao/DatabaseSingleton.kt` 檔案中使用硬編碼的 `driverClassName` 與 `jdbcURL` 來建立資料庫連線：

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DatabaseSingleton.kt" include-lines="10-12,17"}

讓我們將資料庫連線設定擷取到[自訂組態群組](server-configuration-file.topic)中。

1. 開啟 `src/main/resources/application.conf` 檔案，並在 `ktor` 群組外部新增 `storage` 群組，如下所示：

   ```kotlin
   ```
   {src="snippets/tutorial-website-interactive-persistence-advanced/src/main/resources/application.conf" include-lines="11-14,16"}

2. 開啟 `com/example/dao/DatabaseSingleton.kt` 並更新 `init` 函式，以從組態檔案載入儲存設定：

   ```kotlin
   ```
   {src="snippets/tutorial-website-interactive-persistence-advanced/src/main/kotlin/com/example/dao/DatabaseSingleton.kt" include-lines="5,10-18,23,39"}
   
   現在 `init` 函式接受 `ApplicationConfig` 並使用 `config.property` 載入自訂設定。

3. 最後，開啟 `com/example/Application.kt` 並將 `environment.config` 傳遞給 `DatabaseSingleton.init`，以便在應用程式啟動時載入連線設定：

   ```kotlin
   ```
   {src="snippets/tutorial-website-interactive-persistence-advanced/src/main/kotlin/com/example/Application.kt" include-lines="9-13"}

### 啟用連線池 {id="enable-connection-pooling"}

若要在 Exposed 中啟用連線池，您需要將 [DataSource](https://docs.oracle.com/en/java/javase/19/docs/api/java.sql/javax/sql/DataSource.html) 作為參數提供給 `Database.connect` 函式。
HikariCP 提供了實作 `DataSource` 介面的 `HikariDataSource` 類別。

1. 若要建立 `HikariDataSource`，請開啟 `com/example/dao/DatabaseSingleton.kt` 並將 `createHikariDataSource` 函式新增至 `DatabaseSingleton` 物件：

   ```kotlin
   ```
   {src="snippets/tutorial-website-interactive-persistence-advanced/src/main/kotlin/com/example/dao/DatabaseSingleton.kt" include-lines="4,11-12,25-35,39"}

   以下是有關資料來源設定的一些說明：
     - `createHikariDataSource` 函式接受驅動程式類別名稱與資料庫 URL 作為參數。
     - `maximumPoolSize` 屬性指定了連線池可達到的最大大小。
     - 設定 `isAutoCommit` 與 `transactionIsolation` 是為了與 Exposed 所使用的預設設定保持同步。

2. 若要使用 `HikariDataSource`，請將其傳遞給 `Database.connect` 函式：

   ```kotlin
   ```
   {src="snippets/tutorial-website-interactive-persistence-advanced/src/main/kotlin/com/example/dao/DatabaseSingleton.kt" include-lines="12-13,19,23,39"}

   您現在可以[執行應用程式](db-persistence.md#run_app)，並確保一切如先前一樣正常運作。

## 快取 {id="caching"}

您可以使用資料庫快取來補充資料庫的功能。
快取是一種將常用資料儲存在暫存記憶體中的技術，
可以減輕資料庫的工作負載，並縮短讀取常用資料的時間。

在本教學中，我們將使用 Ehcache 程式庫在檔案中組織快取。

### 將快取檔案路徑新增至組態 {id="cache-file-path"}

開啟 `src/main/resources/application.conf` 檔案，並在 `storage` 群組中新增 `ehcacheFilePath` 屬性：

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence-advanced/src/main/resources/application.conf" include-lines="11,15-16"}

此屬性指定了用於儲存快取資料的檔案路徑。
稍後我們將在設定用於處理快取的 `DAOFacade` 實作時使用它。

### 實作快取 {id="implement-caching"}

若要實作快取，我們需要提供另一個 `DAOFacade` 實作：該實作會從快取中傳回值，
如果沒有快取值，則將請求委託給資料庫介面。

1. 在 `com.example.dao` 套件中建立一個新的 `DAOFacadeCacheImpl.kt` 檔案，並加入以下實作：

   ```kotlin
   ```
   {src="snippets/tutorial-website-interactive-persistence-advanced/src/main/kotlin/com/example/dao/DAOFacadeCacheImpl.kt" include-lines="1-28,51"}

   以下是此程式碼範例的簡要概述：
     - 為了初始化與設定快取，我們定義了一個 Ehcache `CacheManager` 執行個體。我們提供 `storagePath` 作為磁碟存儲的根目錄。
     - 我們為項目建立快取，透過文章的 ID 來儲存文章：`articlesCache` 將 `Int` 鍵對應到 `Article` 值。
     - 接著我們為本機記憶體與磁碟資源提供大小限制。您可以在 [Ehcache 文件](https://www.ehcache.org/documentation/2.8/configuration/cache-size.html)中深入了解這些參數。
     - 最後，我們透過傳入指定的名稱、鍵與值型別呼叫 `cacheManager.getCache()` 來取得已建立的快取。

2. 若要在快取中使用，`Article` 類別應該具備可序列化性並實作 `java.io.Serializable`。
   開啟 `com/example/models/Article.kt` 並將程式碼更新如下：

   ```kotlin
   ```
   {src="snippets/tutorial-website-interactive-persistence-advanced/src/main/kotlin/com/example/models/Article.kt" include-lines="4-6"}

3. 現在我們準備實作 `DAOFacade` 的成員。
   回到 `DAOFacadeCacheImpl.kt`，新增以下方法：

   ```kotlin
   ```
   {src="snippets/tutorial-website-interactive-persistence-advanced/src/main/kotlin/com/example/dao/DAOFacadeCacheImpl.kt" include-lines="30-50"}

   - `allArticles`：我們不嘗試快取所有文章；我們將此操作委託給主資料庫。
   - `article`：取得文章時，我們先檢查它是否存在於快取中，只有在快取中不存在時，才委託給主要的 `DAOFacade`，並同時將該文章加入快取。
   - `addNewArticle`：新增文章時，我們將其委託給主要的 `DAOFacade`，但同時也會將該文章加入快取。
   - `editArticle`：編輯現有文章時，我們同時更新快取與資料庫。
   - `deleteArticle`：刪除時，我們需要同時從快取與主資料庫中刪除該文章。

### 初始化 DAOFacadeCacheImpl {id="init-dao-facade"}

讓我們建立一個 `DAOFacadeCacheImpl` 執行個體，並新增一篇範例文章，以便在應用程式啟動前插入資料庫：

1. 首先，開啟 `DAOFacadeImpl.kt` 檔案，並移除檔案底部的 `dao` 變數初始化。

2. 接著，開啟 `com/example/plugins/Routing.kt` 並在 `configureRouting` 區塊內初始化 `dao` 變數：

   ```kotlin
   ```
   {src="snippets/tutorial-website-interactive-persistence-advanced/src/main/kotlin/com/example/plugins/Routing.kt" include-lines="11-24,73"}

   大功告成！
   您現在可以[執行應用程式](db-persistence.md#run_app)，並確保一切如先前一樣正常運作。

> 您可以在此處找到包含連線池與快取功能的完整範例：[tutorial-website-interactive-persistence-advanced](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/tutorial-website-interactive-persistence-advanced)。