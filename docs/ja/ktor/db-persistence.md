[//]: # (title: Exposed を使用したデータベース永続化)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="tutorial-website-interactive-persistence"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
<b>使用ライブラリ</b>: <a href="https://github.com/JetBrains/Exposed">Exposed</a>, <a href="https://github.com/h2database/h2database">h2database</a>
</p>
</tldr>

<link-summary>Exposed ORM フレームワークを使用して Web サイトに永続性を追加する方法を学びます。</link-summary>

このチュートリアルシリーズでは、Ktor でシンプルなブログアプリケーションを作成する方法を紹介します。
- 最初のチュートリアルでは、画像や HTML ページなどの静的コンテンツをホストする方法を説明しました。
- 2 番目のチュートリアルでは、FreeMarker テンプレートエンジンを使用してアプリケーションに対話性を追加しました。
- **このチュートリアル**では、Exposed フレームワークを使用して Web サイトに永続化機能を追加します。記事の保存には H2 ローカルデータベースを使用します。
- [次のチュートリアル](db-connection-pooling-caching.md)では、HikariCP および Ehcache ライブラリをそれぞれ使用して、データベース接続プーリングとキャッシュを実装する方法について見ていきます。

## 依存関係の追加 {id="add-dependencies"}

まず、Exposed および H2 ライブラリの依存関係を追加する必要があります。`gradle/libs.versions.toml` ファイルを開き、ライブラリのバージョンとエイリアスを定義します。

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

次に、`build.gradle.kts` を開いて以下の依存関係を追加します。

```kotlin
dependencies {
    implementation(libs.exposed.core)
    implementation(libs.exposed.dao)
    implementation(libs.exposed.jdbc)
    implementation(libs.h2)
}
```

`build.gradle.kts` ファイルの右上にある **Load Gradle Changes** アイコンをクリックして、新しく追加された依存関係をインストールします。

## モデルの更新 {id="model"}

Exposed はデータベーステーブルとして `org.jetbrains.exposed.sql.Table` クラスを使用します。`Article` モデルを更新するには、`models/Article.kt` ファイルを開き、既存のコードを以下のように置き換えます。

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/models/Article.kt"}

`id`、`title`、`body` カラムには、記事に関する情報が保存されます。`id` カラムは主キーとして機能します。

> `Articles` オブジェクトのプロパティの[型を確認](https://www.jetbrains.com/help/idea/viewing-reference-information.html#type-info)すると、必要な型引数を持つ `Column` 型であることがわかります。`id` は `Column<Int>` 型を持ち、`title` と `body` はどちらも `Column<String>` 型を持ちます。
> 
{type="tip"}

## データベースへの接続 {id="connect_db"}

[データアクセスオブジェクト](https://en.wikipedia.org/wiki/Data_access_object) (DAO) は、特定のデータベースの詳細を公開することなくデータベースへのインターフェースを提供するパターンです。後ほど、データベースへの具体的なリクエストを抽象化する `DAOFacade` インターフェースを定義します。

Exposed を使用したデータベースアクセスはすべて、データベースへの接続を取得することから始まります。そのためには、`Database.connect` 関数に JDBC URL とドライバクラス名を渡します。`com.example` 内に `dao` パッケージを作成し、新しい `DatabaseSingleton.kt` ファイルを追加します。その後、次のコードを挿入します。

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DatabaseSingleton.kt" include-lines="1-13,17,21"}

> ここでは `driverClassName` と `jdbcURL` がハードコードされていることに注意してください。Ktor では、このような設定を[カスタム構成グループ](server-configuration-file.topic)に抽出することができます。

### テーブルの作成 {id="create_table"}

接続を取得したら、すべての SQL 文をトランザクション内に配置する必要があります。

```kotlin
fun init() {
    // ...
    val database = Database.connect(jdbcURL, driverClassName)
    transaction(database) {
        // Statements here
    }
}
```

このコードサンプルでは、デフォルトのデータベースが明示的に `transaction` 関数に渡されています。データベースが 1 つしかない場合は、これを省略できます。その場合、Exposed は最後に接続されたデータベースをトランザクションに自動的に使用します。

> `Database.connect` 関数は、トランザクションを呼び出すまで実際のデータベース接続を確立しないことに注意してください。これは、将来の接続のための記述子（ディスクリプタ）を作成するだけです。

`Articles` テーブルがすでに宣言されているため、`init` 関数の末尾で `transaction` の呼び出し内にラップした `SchemaUtils.create(Articles)` を呼び出し、テーブルがまだ存在しない場合に作成するようデータベースに指示できます。

```kotlin
fun init() {
    // ...
    val database = Database.connect(jdbcURL, driverClassName)
    transaction(database) {
        SchemaUtils.create(Articles)
    }
}
```

### クエリの実行 {id="queries"}

利便性を高めるため、`DatabaseSingleton` オブジェクト内にユーティリティ関数 `dbQuery` を作成しましょう。これは、今後データベースへのすべてのリクエストで使用します。トランザクションを使ってブロッキング方式でアクセスする代わりに、コルーチンを活用して各クエリを独自のコルーチンで開始します。

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DatabaseSingleton.kt" include-lines="19-20"}

結果の `DatabaseSingleton.kt` ファイルは次のようになります。

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DatabaseSingleton.kt"}

### 起動時のデータベース設定の読み込み {id="startup"}

最後に、作成した設定をアプリケーションの起動時に読み込む必要があります。`Application.kt` を開き、`Application.module` の本文から `DatabaseSingleton.init` を呼び出します。

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/Application.kt" include-lines="3,8-13"}

## 永続化ロジックの実装 {id="persistence_logic"}

次に、記事の更新に必要な操作を抽象化するインターフェースを作成しましょう。`dao` パッケージ内に `DAOFacade.kt` ファイルを作成し、以下のコードを記述します。

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DAOFacade.kt"}

すべての記事の一覧表示、ID による記事の表示、新しい記事の追加、編集、削除を行う必要があります。これらの関数はすべて内部でデータベースクエリを実行するため、suspend 関数として定義されています。

`DAOFacade` インターフェースを実装するには、その名前にキャレットを置き、インターフェースの横にある黄色い電球アイコンをクリックして **Implement interface** を選択します。表示されたダイアログでデフォルト設定のまま **OK** をクリックします。

**Implement Members** ダイアログで、すべての関数を選択して **OK** をクリックします。

![Implement Members](tutorial_persistence_implement_members.png){width="451"}

IntelliJ IDEA は `dao` パッケージ内に `DAOFacadeImpl.kt` ファイルを作成します。Exposed DSL を使用してすべての関数を実装しましょう。

### すべての記事の取得 {id="get_all"}

まずはすべてのエントリを返す関数から始めましょう。リクエストは `dbQuery` の呼び出しにラップされます。`Table.selectAll` 拡張関数を呼び出して、データベースからすべてのデータを取得します。`Articles` オブジェクトは `Table` のサブクラスであるため、Exposed DSL メソッドを使用して操作します。

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DAOFacadeImpl.kt" include-lines="1-18,45"}

`Table.selectAll` は `Query` のインスタンスを返すため、`Article` インスタンスのリストを取得するには、行ごとに手動でデータを抽出してデータクラスに変換する必要があります。これは、`ResultRow` から `Article` を構築するヘルパー関数 `resultRowToArticle` を使用して行います。

`ResultRow` は、簡潔な `get` 演算子を使用して指定された `Column` に保存されているデータを取得する方法を提供し、配列やマップと同様の大括弧構文を使用できるようにします。

> `Articles.id` の型は `Column<Int>` であり、これは `Expression` インターフェースを実装しています。そのため、任意のカラムを式として渡すことができます。

### 記事の取得 {id="get_article"}

次に、1 つの記事を返す関数を実装しましょう。

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DAOFacadeImpl.kt" include-lines="20-25"}

`select` 関数は引数として拡張ラムダを取ります。このラムダ内の暗黙のレシーバーは `SqlExpressionBuilder` 型です。この型を明示的に使用することはありませんが、クエリを構築するために使用するカラムに対する多数の便利な操作を定義しています。比較（`eq`、`less`、`greater`）、算術演算（`plus`、`times`）、値が指定された値のリストに属しているかどうかの確認（`inList`、`notInList`）、値が null か null でないかのチェックなど、多数の操作を使用できます。

`select` は `Query` 値のリストを返します。先ほどと同様に、それらを記事に変換します。この場合、1 つの記事になるはずなので、それを結果として返します。

### 新しい記事の追加 {id="add_article"}

テーブルに新しい記事を挿入するには、ラムダ引数を取る `Table.insert` 関数を使用します。

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DAOFacadeImpl.kt" include-lines="27-33"}

このラムダ内では、どのカラムにどの値を設定するかを指定します。引数 `it` は `InsertStatement` 型であり、カラムと値を引数に取る `set` 演算子を呼び出すことができます。

### 記事の編集 {id="edit_article"}

既存の記事を更新するには、`Table.update` を使用します。

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DAOFacadeImpl.kt" include-lines="35-40"}

### 記事の削除 {id="delete_article"}

最後に、`Table.deleteWhere` を使用してデータベースから記事を削除します。

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DAOFacadeImpl.kt" include-lines="42-44"}

### DAOFacade の初期化 {id="init-dao-facade"}

`DAOFacade` のインスタンスを作成し、アプリケーションが起動する前にデータベースに挿入されるサンプル記事を追加しましょう。
`DAOFacadeImpl.kt` の末尾に以下のコードを追加します。

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DAOFacadeImpl.kt" include-lines="47-53"}

## ルーティングの更新 {id="update_routes"}

これで、実装したデータベース操作をルートハンドラー内で使用する準備が整いました。
`plugins/Routing.kt` ファイルを開きます。
すべての記事を表示するには、`get` ハンドラー内で `dao.allArticles` を呼び出します。

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/plugins/Routing.kt" include-lines="22-24"}

新しい記事を投稿するには、`post` 内で `dao.addNewArticle` 関数を呼び出します。

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/plugins/Routing.kt" include-lines="28-34"}

表示および編集用の記事を取得するには、それぞれ `get("{id}")` および `get("{id}/edit")` 内で `dao.article` を使用します。

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/plugins/Routing.kt" include-lines="35-42"}

最後に、`post("{id}")` ハンドラーに移動し、記事を更新するために `dao.editArticle` を、記事を削除するために `dao.deleteArticle` を使用します。

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/plugins/Routing.kt" include-lines="43-58"}

> このチュートリアルの完成版プロジェクトは、こちらから確認できます: [tutorial-website-interactive-persistence](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/tutorial-website-interactive-persistence)。

## アプリケーションの実行 {id="run_app"}

ブログアプリケーションが期待どおりに動作するか確認しましょう。`Application.kt` 内の `fun main(...)` の横にある **Run** ボタンをクリックしてアプリケーションを実行できます。

![Run Server](run-app.png){width="706"}

IntelliJ IDEA がアプリケーションを起動し、数秒後にアプリが実行中であることを示す確認メッセージが表示されるはずです。

```Bash
[main] INFO  Application - Responding at http://0.0.0.0:8080
```

ブラウザで [`http://localhost:8080/`](http://localhost:8080/) を開き、記事の作成、編集、削除を試してみてください。記事は `build/db.mv.db` ファイルに保存されます。IntelliJ IDEA では、[Database ツールウィンドウ](https://www.jetbrains.com/help/idea/database-tool-window.html)でこのファイルの内容を確認できます。

![Database tool window](tutorial_persistence_database_tool_window.png){width="706"}