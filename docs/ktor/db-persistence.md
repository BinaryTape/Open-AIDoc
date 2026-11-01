[//]: # (title: 使用 Exposed 实现数据库持久化)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="tutorial-website-interactive-persistence"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
<b>所用库</b>：<a href="https://github.com/JetBrains/Exposed">Exposed</a>、<a href="https://github.com/h2database/h2database">h2database</a>
</p>
</tldr>

<link-summary>了解如何使用 Exposed ORM 框架为网站添加持久化支持。</link-summary>

在这一系列教程中，我们将向你展示如何在 Ktor 中创建一个简单的博客应用程序：
- 在第一篇教程中，我们展示了如何托管图片和 HTML 页面等静态内容。
- 在第二篇教程中，我们使用 FreeMarker 模板引擎为应用程序添加了交互性。
- 在**本教程**中，我们将使用 Exposed 框架为网站添加持久化支持。我们将使用 H2 本地数据库来存储文章。
- 在[下一篇教程](db-connection-pooling-caching.md)中，我们将探讨如何分别使用 HikariCP 和 Ehcache 库来实现数据库连接池与缓存。

## 添加依赖项 {id="add-dependencies"}

首先，你需要为 Exposed 和 H2 库添加依赖项。打开 `gradle/libs.versions.toml` 文件并定义库版本和别名：

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

然后，打开 `build.gradle.kts` 并添加以下依赖项：

```kotlin
dependencies {
    implementation(libs.exposed.core)
    implementation(libs.exposed.dao)
    implementation(libs.exposed.jdbc)
    implementation(libs.h2)
}
```

点击 `build.gradle.kts` 文件右上角的 **Load Gradle Changes** 图标安装新添加的依赖项。

## 更新模型 {id="model"}

Exposed 使用 `org.jetbrains.exposed.sql.Table` 类作为数据库表。要更新 `Article` 模型，请打开 `models/Article.kt` 文件并将现有代码替换为以下内容：

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/models/Article.kt"}

`id`、`title` 和 `body` 列将存储我们文章的相关信息。`id` 列将充当主键。

> 如果你[检查](https://www.jetbrains.com/help/idea/viewing-reference-information.html#type-info) `Articles` 对象中属性的类型，会发现它们属于 `Column` 类型并带有相应的类型实参：`id` 的类型为 `Column<Int>`，而 `title` 和 `body` 的类型均为 `Column<String>`。
> 
{type="tip"}

## 连接到数据库 {id="connect_db"}

[数据访问对象](https://en.wikipedia.org/wiki/Data_access_object)（DAO）是一种设计模式，它提供面向数据库的接口，而无需暴露具体数据库的实现细节。稍后我们将定义一个 `DAOFacade` 接口，以抽象针对数据库的具体请求。

使用 Exposed 进行的每次数据库访问均始于获取数据库连接。为此，你需要将 JDBC URL 和驱动程序类名传递给 `Database.connect` 函数。在 `com.example` 内创建 `dao` 软件包，并添加新的 `DatabaseSingleton.kt` 文件。然后插入以下代码：

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DatabaseSingleton.kt" include-lines="1-13,17,21"}

> 请注意，此处的 `driverClassName` 和 `jdbcURL` 是硬编码的。Ktor 允许你将此类设置提取到[自定义配置组](server-configuration-file.topic)中。

### 创建表 {id="create_table"}

获取连接后，所有 SQL 语句都应置于事务中：

```kotlin
fun init() {
    // ...
    val database = Database.connect(jdbcURL, driverClassName)
    transaction(database) {
        // 语句写在此处
    }
}
```

在此代码示例中，默认数据库被显式传递给 `transaction` 函数。如果只有一个数据库，可以省略它。在这种情况下，Exposed 会自动将最后连接的数据库用于事务。

> 请注意，在调用事务之前，`Database.connect` 函数不会建立真实的数据库连接——它仅创建用于未来连接的描述符。

鉴于 `Articles` 表已经声明，我们可以在 `init` 函数末尾调用包裹在 `transaction` 调用中的 `SchemaUtils.create(Articles)`，以指示数据库在表尚不存在时创建该表：

```kotlin
fun init() {
    // ...
    val database = Database.connect(jdbcURL, driverClassName)
    transaction(database) {
        SchemaUtils.create(Articles)
    }
}
```

### 执行查询 {id="queries"}

为方便起见，让我们在 `DatabaseSingleton` 对象中创建一个工具函数 `dbQuery`，后续对数据库的所有请求都将使用该函数。与其通过事务以阻塞方式访问数据库，不如利用协程的优势，在各自的协程中启动每个查询：

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DatabaseSingleton.kt" include-lines="19-20"}

最终的 `DatabaseSingleton.kt` 文件应如下所示：

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DatabaseSingleton.kt"}

### 在启动时加载数据库配置 {id="startup"}

最后，我们需要在应用程序启动时加载已创建的配置。打开 `Application.kt` 并在 `Application.module` 主体中调用 `DatabaseSingleton.init`：

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/Application.kt" include-lines="3,8-13"}

## 实现持久化逻辑 {id="persistence_logic"}

现在让我们创建一个接口，以抽象更新文章所需的操作。在 `dao` 软件包中创建 `DAOFacade.kt` 文件，并填入以下代码：

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DAOFacade.kt"}

我们需要列出所有文章、按 ID 查看文章、添加新文章、编辑或删除文章。由于所有这些函数底层都执行数据库查询，因此它们被定义为挂起函数。

要实现 `DAOFacade` 接口，请将文本光标置于其名称上，点击该接口旁边的黄色灯泡图标，然后选择 **Implement interface**。在调出的对话框中，保留默认设置并点击 **OK**。

在 **Implement Members** 对话框中，选择所有函数并点击 **OK**。

![实现成员](tutorial_persistence_implement_members.png){width="451"}

IntelliJ IDEA 会在 `dao` 软件包中创建 `DAOFacadeImpl.kt` 文件。接下来让我们使用 Exposed DSL 实现所有函数。

### 获取所有文章 {id="get_all"}

我们先从一个返回所有条目的函数开始。我们的请求被包裹在 `dbQuery` 调用中。我们调用 `Table.selectAll` 扩展函数从数据库获取所有数据。`Articles` 对象是 `Table` 的子类，因此我们使用 Exposed DSL 方法来对其进行操作。

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DAOFacadeImpl.kt" include-lines="1-18,45"}

`Table.selectAll` 返回一个 `Query` 实例，因此要获取 `Article` 实例列表，我们需要手动提取每行数据并将其转换为我们的数据类。我们通过帮助程序函数 `resultRowToArticle` 来实现这一点，该函数会根据 `ResultRow` 构建一个 `Article`。

`ResultRow` 提供了通过使用简洁的 `get` 运算符来获取存储在指定 `Column` 中的数据的方法，允许我们使用类似于数组或 Map 的方括號语法。

> `Articles.id` 的类型为 `Column<Int>`，它实现了 `Expression` 接口。这就是为什么我们可以将任何列作为表达式传递的原因。

### 获取单篇文章 {id="get_article"}

现在让我们实现一个返回单篇文章的函数：

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DAOFacadeImpl.kt" include-lines="20-25"}

`select` 函数接收一个扩展 lambda 作为实参。此 lambda 内的隐式接收者类型为 `SqlExpressionBuilder`。你不需要显式使用此类型，但它定义了一系列对列的实用操作，可供你用来构建查询。你可以使用比较操作（`eq`、`less`、`greater`）、算术运算（`plus`、`times`），检查值是否属于或不属于提供的值列表（`inList`、`notInList`），检查值是否为 null 或非 null，等等。

`select` 返回 `Query` 值的列表。同之前一样，我们将它们转换为文章。在我们的示例中，它应该只有一篇文章，因此我们将其作为结果返回。

### 添加新文章 {id="add_article"}

要将新文章插入到表中，请使用接收 lambda 实参的 `Table.insert` 函数：

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DAOFacadeImpl.kt" include-lines="27-33"}

在此 lambda 中，我们指定哪一列应该设置哪个值。`it` 实参的类型为 `InsertStatement`，我们可以在其上调用以列和值为实参的 `set` 运算符。

### 编辑文章 {id="edit_article"}

要更新现有文章，可使用 `Table.update`：

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DAOFacadeImpl.kt" include-lines="35-40"}

### 删除文章 {id="delete_article"}

最后，使用 `Table.deleteWhere` 从数据库中移除文章：

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DAOFacadeImpl.kt" include-lines="42-44"}

### 初始化 DAOFacade {id="init-dao-facade"}

让我们创建 `DAOFacade` 的一个实例，并在应用程序启动之前向数据库中插入一篇示例文章。
在 `DAOFacadeImpl.kt` 末尾添加以下代码：

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DAOFacadeImpl.kt" include-lines="47-53"}

## 更新路由 {id="update_routes"}

现在我们可以在路由处理程序中使用已实现的数据库操作了。
打开 `plugins/Routing.kt` 文件。
要显示所有文章，请在 `get` 处理程序中调用 `dao.allArticles`：

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/plugins/Routing.kt" include-lines="22-24"}

要发布新文章，请在 `post` 中调用 `dao.addNewArticle` 函数：

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/plugins/Routing.kt" include-lines="28-34"}

要获取文章以进行显示和编辑，请分别在 `get("{id}")` 和 `get("{id}/edit")` 中使用 `dao.article`：

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/plugins/Routing.kt" include-lines="35-42"}

最后，转到 `post("{id}")` 处理程序，使用 `dao.editArticle` 更新文章，并使用 `dao.deleteArticle` 删除文章：

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/plugins/Routing.kt" include-lines="43-58"}

> 你可以在此处找到本教程的最终项目：[tutorial-website-interactive-persistence](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/tutorial-website-interactive-persistence)。

## 运行应用程序 {id="run_app"}

让我们看看我们的日志应用程序是否按预期运行。我们可以通过点击 `Application.kt` 中 `fun main(...)` 旁边的 **Run** 按钮来运行应用程序：

![运行服务器](run-app.png){width="706"}

IntelliJ IDEA 将启动应用程序，几秒钟后，我们将看到应用正在运行的确认信息：

```Bash
[main] INFO  Application - Responding at http://0.0.0.0:8080
```

在浏览器中打开 [`http://localhost:8080/`](http://localhost:8080/) 并尝试创建、编辑和删除文章。文章将保存在 `build/db.mv.db` 文件中。在 IntelliJ IDEA 中，你可以在[数据库工具窗口](https://www.jetbrains.com/help/idea/database-tool-window.html)中查看该文件的内容。

![数据库工具窗口](tutorial_persistence_database_tool_window.png){width="706"}