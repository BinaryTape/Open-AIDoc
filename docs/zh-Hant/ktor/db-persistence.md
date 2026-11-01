[//]: # (title: 使用 Exposed 進行資料庫持久化)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="tutorial-website-interactive-persistence"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
<b>使用的程式庫</b>：<a href="https://github.com/JetBrains/Exposed">Exposed</a>、<a href="https://github.com/h2database/h2database">h2database</a>
</p>
</tldr>

<link-summary>了解如何使用 Exposed ORM 架構為網站新增持久化功能。</link-summary>

在這一系列教學中，我們將向你展示如何在 Ktor 中建立一個簡單的部落格應用程式：
- 在第一個教學中，我們展示了如何代管圖片和 HTML 頁面等靜態內容。
- 在第二個教學中，我們使用 FreeMarker 範本引擎為應用程式新增了互動功能。
- 在**本教學**中，我們將使用 Exposed 架構為網站新增持久化功能。我們將使用 H2 本機資料庫來儲存文章。
- 在[下一篇教學](db-connection-pooling-caching.md)中，我們將探討如何分別使用 HikariCP 與 Ehcache 程式庫來實作資料庫連線池與快取。

## 新增相依性 {id="add-dependencies"}

首先，你需要新增 Exposed 和 H2 程式庫的相依性。開啟 `gradle/libs.versions.toml` 檔案並定義程式庫版本與別名：

```toml
[versions]
exposed = "1.6.0"
h2 = "2.4.240"
[libraries]
exposed-core = { module = "org.jetbrains.exposed:exposed-core", version.ref = "exposed" }
exposed-dao = { module = "org.jetbrains.exposed:exposed-dao", version.ref = "exposed" }
exposed-jdbc = { module = "org.jetbrains.exposed:exposed-jdbc", version.ref = "exposed" }
h2 = { module = "com.h2database:h2", version.ref = "h2" }
```

接著，開啟 `build.gradle.kts` 並新增以下相依性：

```kotlin
dependencies {
    implementation(libs.exposed.core)
    implementation(libs.exposed.dao)
    implementation(libs.exposed.jdbc)
    implementation(libs.h2)
}
```

點擊 `build.gradle.kts` 檔案右上角的 **Load Gradle Changes** 圖示以安裝新加入的相依性。

## 更新模型 {id="model"}

Exposed 使用 `org.jetbrains.exposed.sql.Table` 類別作為資料庫資料表。若要更新 `Article` 模型，請開啟 `models/Article.kt` 檔案並將現有程式碼替換為以下內容：

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/models/Article.kt"}

`id`、`title` 和 `body` 欄位將儲存我們文章的資訊。`id` 欄位將作為主鍵。

> 如果你[檢查 `Articles` 物件中屬性的型別](https://www.jetbrains.com/help/idea/viewing-reference-information.html#type-info)，你會看到它們具有帶有必要型別引數的 `Column` 型別：`id` 的型別為 `Column<Int>`，而 `title` 和 `body` 的型別皆為 `Column<String>`。
> 
{type="tip"}

## 連線到資料庫 {id="connect_db"}

[資料存取物件](https://en.wikipedia.org/wiki/Data_access_object) (DAO) 是一種設計模式，可在不公開特定資料庫細節的情況下提供對資料庫的介面。我們稍後將定義一個 `DAOFacade` 介面，以抽象化我們對資料庫的特定請求。

使用 Exposed 的每次資料庫存取都是從取得資料庫連線開始。為此，你需要將 JDBC URL 和驅動程式類別名稱傳遞給 `Database.connect` 函式。在 `com.example` 內建立 `dao` 套件，並新增一個新的 `DatabaseSingleton.kt` 檔案。接著，插入以下程式碼：

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DatabaseSingleton.kt" include-lines="1-13,17,21"}

> 請注意，`driverClassName` 和 `jdbcURL` 在此處是硬編碼的。Ktor 允許你將此類設定擷取到[自訂設定群組](server-configuration-file.topic)。

### 建立資料表 {id="create_table"}

取得連線後，所有 SQL 陳述式都應置於交易之中：

```kotlin
fun init() {
    // ...
    val database = Database.connect(jdbcURL, driverClassName)
    transaction(database) {
        // 陳述式置於此處
    }
}
```

在此程式碼範例中，預設資料庫被明確傳遞給 `transaction` 函式。如果你只有一個資料庫，則可以將其省略。在此情況下，Exposed 會自動將上次連線的資料庫用於交易。

> 請注意，在呼叫交易之前，`Database.connect` 函式不會建立真正的資料庫連線——它僅為未來的連線建立描述項。

鑑於 `Articles` 資料表已經宣告，我們可以在 `init` 函式底部呼叫包裝在 `transaction` 呼叫中的 `SchemaUtils.create(Articles)`，以指示資料庫在此資料表尚不存在時建立它：

```kotlin
fun init() {
    // ...
    val database = Database.connect(jdbcURL, driverClassName)
    transaction(database) {
        SchemaUtils.create(Articles)
    }
}
```

### 執行查詢 {id="queries"}

為了方便起見，讓我們在 `DatabaseSingleton` 物件中建立一個公用函式 `dbQuery`，我們將在未來所有對資料庫的請求中使用它。我們不使用交易以阻塞的方式進行存取，而是利用協同程式的優勢，在各自的協同程式中啟動每個查詢：

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DatabaseSingleton.kt" include-lines="19-20"}

最終的 `DatabaseSingleton.kt` 檔案應如下所示：

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DatabaseSingleton.kt"}

### 在啟動時載入資料庫設定 {id="startup"}

最後，我們需要在應用程式啟動時載入建立的設定。開啟 `Application.kt` 並從 `Application.module` 主體中呼叫 `DatabaseSingleton.init`：

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/Application.kt" include-lines="3,8-13"}

## 實作持久化邏輯 {id="persistence_logic"}

現在讓我們建立一個介面來抽象化更新文章所需的操作。在 `dao` 套件中建立 `DAOFacade.kt` 檔案，並填入以下程式碼：

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DAOFacade.kt"}

我們需要列出所有文章、透過 ID 查看文章、新增文章、編輯或刪除文章。由於所有這些函式在底層都會執行資料庫查詢，因此它們被定義為掛起函式。

若要實作 `DAOFacade` 介面，請將插入號置於其名稱上，點擊該介面旁邊的黃色燈泡圖示，然後選取 **Implement interface**。在叫出的對話方塊中保留預設設定，然後點擊 **OK**。

在 **Implement Members** 對話方塊中，選取所有函式並點擊 **OK**。

![Implement Members](tutorial_persistence_implement_members.png){width="451"}

IntelliJ IDEA 會在 `dao` 套件內建立 `DAOFacadeImpl.kt` 檔案。讓我們使用 Exposed DSL 來實作所有函式。

### 取得所有文章 {id="get_all"}

讓我們從傳回所有項目的函式開始。我們的請求被包裝在 `dbQuery` 呼叫中。我們呼叫 `Table.selectAll` 擴充函式以從資料庫取得所有資料。`Articles` 物件是 `Table` 的子類別，因此我們使用 Exposed DSL 方法來對其進行操作。

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DAOFacadeImpl.kt" include-lines="1-18,45"}

`Table.selectAll` 會傳回一個 `Query` 執行個體，因此若要取得 `Article` 執行個體清單，我們需要手動擷取每一列的資料並將其轉換為我們的資料類別。我們使用輔助函式 `resultRowToArticle` 來完成這項工作，該函式會從 `ResultRow` 建構出 `Article`。

`ResultRow` 透過使用簡潔的 `get` 運算子提供了一種取得儲存在指定 `Column` 中資料的方法，允許我們使用類似陣列或 Map 的方括號語法。

> `Articles.id` 的型別是 `Column<Int>`，它實作了 `Expression` 介面。這就是為什麼我們可以將任何欄位作為運算式傳遞。

### 取得單一文章 {id="get_article"}

現在讓我們實作傳回單一文章的函式：

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DAOFacadeImpl.kt" include-lines="20-25"}

`select` 函式接受擴充 Lambda 作為引數。此 Lambda 內部的隱式接收者型別為 `SqlExpressionBuilder`。你不需要明確使用此型別，但它定義了許多針對欄位的實用操作，可用於建置查詢。你可以使用比較運算子（`eq`、`less`、`greater`）、算術運算（`plus`、`times`）、檢查值是否屬於所提供的值清單（`inList`、`notInList`）、檢查值是否為 null，以及更多其他操作。

`select` 會傳回一個 `Query` 值清單。和之前一樣，我們將它們轉換為文章。在我們的情況下，它應該是一篇文章，因此我們將其作為結果傳回。

### 新增文章 {id="add_article"}

若要將新文章插入資料表中，請使用接受 Lambda 引數的 `Table.insert` 函式：

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DAOFacadeImpl.kt" include-lines="27-33"}

在此 Lambda 內部，我們指定應為哪個欄位設定哪個值。`it` 引數的型別為 `InsertStatement`，我們可以在其上呼叫以欄位和值作為引數的 `set` 運算子。

### 編輯文章 {id="edit_article"}

若要更新現有文章，請使用 `Table.update`：

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DAOFacadeImpl.kt" include-lines="35-40"}

### 刪除文章 {id="delete_article"}

最後，使用 `Table.deleteWhere` 從資料庫中移除文章：

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DAOFacadeImpl.kt" include-lines="42-44"}

### 初始化 DAOFacade {id="init-dao-facade"}

讓我們建立一個 `DAOFacade` 執行個體，並在應用程式啟動前新增一篇範例文章以插入資料庫。
在 `DAOFacadeImpl.kt` 底部新增以下程式碼：

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DAOFacadeImpl.kt" include-lines="47-53"}

## 更新路由 {id="update_routes"}

現在我們已準備好在路由處理常式中使用已實作的資料庫操作。
開啟 `plugins/Routing.kt` 檔案。
若要顯示所有文章，請在 `get` 處理常式內呼叫 `dao.allArticles`：

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/plugins/Routing.kt" include-lines="22-24"}

若要發佈新文章，請在 `post` 內呼叫 `dao.addNewArticle` 函式：

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/plugins/Routing.kt" include-lines="28-34"}

若要取得文章以供顯示和編輯，請分別在 `get("{id}")` 和 `get("{id}/edit")` 內使用 `dao.article`：

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/plugins/Routing.kt" include-lines="35-42"}

最後，前往 `post("{id}")` 處理常式，使用 `dao.editArticle` 更新文章，並使用 `dao.deleteArticle` 刪除它：

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/plugins/Routing.kt" include-lines="43-58"}

> 你可以在此處找到本教學的最終專案：[tutorial-website-interactive-persistence](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/tutorial-website-interactive-persistence)。

## 執行應用程式 {id="run_app"}

讓我們看看日誌應用程式是否如預期運作。我們可以透過按下 `Application.kt` 中 `fun main(...)` 旁邊的 **Run** 按鈕來執行我們的應用程式：

![Run Server](run-app.png){width="706"}

IntelliJ IDEA 將啟動應用程式，幾秒鐘後，我們應該會看到應用程式正在執行的確認資訊：

```Bash
[main] INFO  Application - Responding at http://0.0.0.0:8080
```

在瀏覽器中開啟 [`http://localhost:8080/`](http://localhost:8080/)，並嘗試建立、編輯和刪除文章。文章將儲存在 `build/db.mv.db` 檔案中。在 IntelliJ IDEA 中，你可以在 [Database 工具視窗](https://www.jetbrains.com/help/idea/database-tool-window.html)中檢視此檔案的內容。

![Database tool window](tutorial_persistence_database_tool_window.png){width="706"}