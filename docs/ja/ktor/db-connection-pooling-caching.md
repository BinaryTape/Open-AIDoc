[//]: # (title: コネクションプーリングとキャッシュ)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="tutorial-website-interactive-persistence-advanced"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
<b>使用ライブラリ</b>: <a href="https://github.com/brettwooldridge/HikariCP">HikariCP</a>, <a href="https://www.ehcache.org/">Ehcache</a>
</p>
</tldr>

<link-summary>データベースのコネクションプーリングとキャッシュを実装する方法を学びます。</link-summary>

[前回のチュートリアル](db-persistence.md)では、Exposedフレームワークを使用してWebサイトに永続化機能を追加しました。
このチュートリアルでは、HikariCPライブラリとEhcacheライブラリをそれぞれ使用して、データベースのコネクションプーリングとキャッシュを実装する方法を見ていきます。

## 依存関係の追加 {id="add-dependencies"}

まず、HikariCPおよびEhcacheライブラリの依存関係を追加する必要があります。
`gradle/libs.versions.toml` ファイルを開き、ライブラリのバージョンとエイリアスを定義します。

```toml
[versions]
ehcache = "3.10.8"
hikaricp = "5.1.0"
[libraries]
ehcache = { module = "org.ehcache:ehcache", version.ref = "ehcache" }
hikaricp = { module = "com.zaxxer:HikariCP", version.ref = "hikaricp" }
```

次に、`build.gradle.kts` を開き、以下の依存関係を追加します。

```kotlin
dependencies {
    implementation(libs.hikaricp)
    implementation(libs.ehcache)
}
```

`build.gradle.kts` ファイルの右上隅にある **Load Gradle Changes** アイコンをクリックして、新しく追加された依存関係をインストールします。

## コネクションプーリング {id="connection-pooling"}

Exposedは、各 `transaction` 呼び出しの内部で、その `transaction` のスコープ内でデータベースに対する最初の操作を実行する際に新しいJDBC接続を開始します。
しかし、複数のJDBC接続を確立することはリソースのコストが高くなります。
既存の接続を再利用することで、パフォーマンスを向上させることができます。
_コネクションプーリング_ の仕組みは、この問題を解決します。

このセクションでは、HikariCPフレームワークを使用して、アプリケーションでJDBCコネクションプーリングを管理します。

### 接続設定を設定ファイルに抽出する {id="connection-settings-config"}

[前回のチュートリアル](db-persistence.md#connect_db)では、データベース接続を確立するために、`com/example/dao/DatabaseSingleton.kt` ファイル内でハードコードされた `driverClassName` と `jdbcURL` を使用しました。

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence/src/main/kotlin/com/example/dao/DatabaseSingleton.kt" include-lines="10-12,17"}

データベースの接続設定を[カスタム設定グループ](server-configuration-file.topic)に抽出しましょう。

1. `src/main/resources/application.conf` ファイルを開き、以下のように `ktor` グループの外側に `storage` グループを追加します。

   ```kotlin
   ```
   {src="snippets/tutorial-website-interactive-persistence-advanced/src/main/resources/application.conf" include-lines="11-14,16"}

2. `com/example/dao/DatabaseSingleton.kt` を開き、設定ファイルからストレージ設定を読み込むように `init` 関数を更新します。

   ```kotlin
   ```
   {src="snippets/tutorial-website-interactive-persistence-advanced/src/main/kotlin/com/example/dao/DatabaseSingleton.kt" include-lines="5,10-18,23,39"}
   
   `init` 関数は `ApplicationConfig` を受け取るようになり、`config.property` を使用してカスタム設定を読み込みます。

3. 最後に、`com/example/Application.kt` を開き、アプリケーション起動時に接続設定を読み込むために `DatabaseSingleton.init` に `environment.config` を渡します。

   ```kotlin
   ```
   {src="snippets/tutorial-website-interactive-persistence-advanced/src/main/kotlin/com/example/Application.kt" include-lines="9-13"}

### コネクションプーリングの有効化 {id="enable-connection-pooling"}

Exposedでコネクションプーリングを有効にするには、`Database.connect` 関数のパラメータとして [DataSource](https://docs.oracle.com/en/java/javase/19/docs/api/java.sql/javax/sql/DataSource.html) を渡す必要があります。
HikariCPは、`DataSource` インターフェースを実装した `HikariDataSource` クラスを提供しています。

1. `HikariDataSource` を作成するために、`com/example/dao/DatabaseSingleton.kt` を開き、`DatabaseSingleton` オブジェクトに `createHikariDataSource` 関数を追加します。

   ```kotlin
   ```
   {src="snippets/tutorial-website-interactive-persistence-advanced/src/main/kotlin/com/example/dao/DatabaseSingleton.kt" include-lines="4,11-12,25-35,39"}

   データソース設定に関する注意事項は以下の通りです。
     - `createHikariDataSource` 関数は、ドライバクラス名とデータベースURLをパラメータとして受け取ります。
     - `maximumPoolSize` プロパティは、コネクションプールが到達できる最大サイズを指定します。
     - `isAutoCommit` と `transactionIsolation` は、Exposedで使用されるデフォルト設定と同期するように設定されています。

2. `HikariDataSource` を使用するには、それを `Database.connect` 関数に渡します。

   ```kotlin
   ```
   {src="snippets/tutorial-website-interactive-persistence-advanced/src/main/kotlin/com/example/dao/DatabaseSingleton.kt" include-lines="12-13,19,23,39"}

   これで[アプリケーションを実行](db-persistence.md#run_app)し、すべてが以前と同様に動作することを確認できます。

## キャッシュ {id="caching"}

データベースをデータベースキャッシュで補完することができます。
キャッシュとは、頻繁に使用されるデータを一時メモリに保存できるようにする技術であり、データベースの負荷を軽減し、頻繁に必要とされるデータを読み取る時間を短縮できます。

このチュートリアルでは、Ehcacheライブラリを使用してファイルベースのキャッシュを構成します。

### 設定にキャッシュファイルのパスを追加する {id="cache-file-path"}

`src/main/resources/application.conf` ファイルを開き、`storage` グループに `ehcacheFilePath` プロパティを追加します。

```kotlin
```
{src="snippets/tutorial-website-interactive-persistence-advanced/src/main/resources/application.conf" include-lines="11,15-16"}

このプロパティは、キャッシュデータを保存するために使用されるファイルのパスを指定します。
これは後で、キャッシュを操作するための `DAOFacade` 実装を設定する際に使用します。

### キャッシュの実装 {id="implement-caching"}

キャッシュを実装するには、キャッシュから値を返し、キャッシュされた値がない場合にはデータベースインターフェースに委譲する別の `DAOFacade` 実装を提供する必要があります。

1. `com.example.dao` パッケージに新しい `DAOFacadeCacheImpl.kt` ファイルを作成し、以下の実装を追加します。

   ```kotlin
   ```
   {src="snippets/tutorial-website-interactive-persistence-advanced/src/main/kotlin/com/example/dao/DAOFacadeCacheImpl.kt" include-lines="1-28,51"}

   このコード例の概要は以下の通りです。
     - キャッシュを初期化して設定するために、Ehcacheの `CacheManager` インスタンスを定義します。ディスクストレージ用に使用するルートディレクトリとして `storagePath` を渡します。
     - 記事をそのIDで保存するエントリ用のキャッシュを作成します。`articlesCache` は `Int` 型のキーを `Article` 型の値にマッピングします。
     - 次に、ローカルメモリとディスクリソースのサイズ制約を指定します。これらのパラメータの詳細については、[Ehcacheのドキュメント](https://www.ehcache.org/documentation/2.8/configuration/cache-size.html)を参照してください。
     - 最後に、指定した名前、キー、値の型で `cacheManager.getCache()` を呼び出して、作成されたキャッシュを取得します。

2. キャッシュ内で使用できるようにするには、`Article` クラスがシリアライズ可能であり、`java.io.Serializable` を実装している必要があります。
   `com/example/models/Article.kt` を開き、コードを以下のように更新します。

   ```kotlin
   ```
   {src="snippets/tutorial-website-interactive-persistence-advanced/src/main/kotlin/com/example/models/Article.kt" include-lines="4-6"}

3. これで `DAOFacade` のメンバーを実装する準備が整いました。
   `DAOFacadeCacheImpl.kt` に戻り、以下のメソッドを追加します。

   ```kotlin
   ```
   {src="snippets/tutorial-website-interactive-persistence-advanced/src/main/kotlin/com/example/dao/DAOFacadeCacheImpl.kt" include-lines="30-50"}

   - `allArticles`: すべての記事をキャッシュしようとするのではなく、メインのデータベースに委譲します。
   - `article`: 記事を取得する際、まずキャッシュに存在するかどうかを確認し、存在しない場合にのみメインの `DAOFacade` に委譲し、その記事をキャッシュにも追加します。
   - `addNewArticle`: 新しい記事を追加する際、メインの `DAOFacade` に委譲しますが、その記事をキャッシュにも追加します。
   - `editArticle`: 既存の記事を編集する際、キャッシュとデータベースの両方を更新します。
   - `deleteArticle`: 削除時には、キャッシュとメインのデータベースの両方から記事を削除する必要があります。

### DAOFacadeCacheImplの初期化 {id="init-dao-facade"}

`DAOFacadeCacheImpl` のインスタンスを作成し、アプリケーションが起動する前にデータベースに挿入されるサンプル記事を追加しましょう。

1. まず、`DAOFacadeImpl.kt` ファイルを開き、ファイルの末尾にある `dao` 変数の初期化コードを削除します。

2. 次に、`com/example/plugins/Routing.kt` を開き、`configureRouting` ブロック内で `dao` 変数を初期化します。

   ```kotlin
   ```
   {src="snippets/tutorial-website-interactive-persistence-advanced/src/main/kotlin/com/example/plugins/Routing.kt" include-lines="11-24,73"}

   これで完了です。
   [アプリケーションを実行](db-persistence.md#run_app)して、すべてが以前と同様に動作することを確認できます。

> コネクションプーリングとキャッシュを含む完全なサンプルは、こちらにあります: [tutorial-website-interactive-persistence-advanced](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/tutorial-website-interactive-persistence-advanced)。