# Change Log

## Unreleased

### Added
- [Nativeドライバ] `inMemoryDriver` に `extendedConfig` パラメータを追加 (#5539 by @GuilhE)
- [PostgreSQLダイアレクト] 暗黙的に定義されたシステムカラム (System Columns) のクエリサポートを追加 (#5834 by @griffio)
- [PostgreSQLダイアレクト] 基本的な配列リテラル (Array literal) のサポートを追加 (#5997 by @griffio)
- [PostgreSQLダイアレクト] 基本的な LTREE のサポートを追加 (#5880 by @yesitskev @griffio)
- [MySQLダイアレクト] INET 関数のサポートを追加 (#5072 by @mcxinyu)
- [PostgreSQLダイアレクト] `ALTER INDEX` のサポートを追加 (#6224 by @griffio)
- [SQLiteダイアレクト] SQLite 3.44 の集計関数 `DISTINCT`、`ORDER BY`、および `FILTER` のサポートを追加 (#6236 by @griffio)
- [SQLiteダイアレクト] SQLite 3.37 の `STRICT` テーブルのサポートを追加 (#6230 by @griffio)
- [Gradleプラグイン] `codegenExcludedColumns` を使用して生成されたモデルからカラムを除外するサポートを追加 (#6243 by @sokolikp)
- [コンパイラ] スキーマに `allTableNames` 関数を追加 (#6245 by @edenman)
- [PostgreSQLダイアレクト] ANY 演算子のサポートを追加 (#6253 by @griffio)
- [SQLiteダイアレクト] SQLite 3.39 の `RIGHT JOIN` および `FULL JOIN` のサポートを追加 (#6273 by @griffio)

### Changed
- [PostgreSQLダイアレクト] `arrayIntermediateType` の可視性を public に変更 (#5835 by @griffio)
- [Gradleプラグイン] より厳格な MigrationFile のバージョニングを実装 (#5730 by @madisp)
- [Gradleプラグイン] サポートする Gradle の最小バージョンを 8.2.1 に引き上げ (#6217 by @maxsav)
- [Gradleプラグイン] Gradle の隔離されたプロジェクト (Isolated Projects) をサポート (#6217 by @maxsav)

### Fixed
- [コンパイラ] 生成されたコードにおける Kotlin の追加の警告を抑制 (#6208 by @eyupcanakman)
- [コンパイラ] グループ化されていない集計結果セット内の他のカラムが、常に Null 許容になるように修正
- [PostgreSQLダイアレクト] `coalesce` および `ifnull` の Null 許容性を正しく解決するように修正
- [PostgreSQLダイアレクト] PostgreSQL ダイアレクトの IDE 統合を修正
- [PostgreSQLダイアレクト] PostgreSQL ダイアレクトの IDE プラグインを改善 (#6209 by @griffio)
- [Intellijプラグイン] IDE プラグインがすべてのダイアレクトでコード補完を実行可能に改善 (#6210 by @griffio)
- [Gradleプラグイン] データベース検証タスク実行時の循環依存エラーを修正 (#6221 by @griffio)
- [コンパイラ] 複数行の更新 (multirow update) における楽観的ロックを修正 (#6240 by @griffio)
- [Intellijプラグイン] IDEA 2026.2 でクラッシュを引き起こす非推奨事項を修正 (#6247 by @griffio)
- [Gradleプラグイン] AGP 8.9 から 8.11 において、生成されたソースが Kotlin コンパイルに反映されない問題を修正
- [PostgreSQLダイアレクト] `lower` および `upper` 関数が Primitive バインド引数を使用する際にデフォルトで `TEXT` になるように修正 (#6262 by @griffio)
- [コンパイラ] アダプタを使用しマイグレーションで Null 許容性が変更される場合に、データクラスバインディングを用いたインサート値を修正 (#6269 by @griffio)
- [コンパイラ] Null 安全な演算子 (`IS` および `IS DISTINCT FROM`) で Null 許容のバインド引数を使用するように修正 (#6265 by @griffio)
- [Gradleプラグイン] プロジェクト依存関係に AGP のバリアント解決 (variant resolution) を使用するように修正 (#6217 by @maxsav)
- [Gradleプラグイン] AGP バリアントのリストがビルド間で異なる場合に、`generateDatabaseInterface` のビルドキャッシュがミスする問題を修正
- [Gradleプラグイン] データベースを設定せずにプラグインを適用した場合の IDE 同期時のクラッシュを修正 (#6088)
- [PostgreSQLダイアレクト] 関数呼び出しをネストして使用する際の JSON 集計関数を修正 (#6281 by @griffio)
- [Paging3拡張] データベースが空の場合の `KeyedQueryPagingSource` のクラッシュを修正 (#6284 by @woods-marshes)
- [コンパイラ] `COALESCE` のようなカプセル化関数でミューテータ文が使用される際の Java 型アダプタの問題を修正 (#6292 by @griffio)

## [2.3.2] - 2026-03-16
[2.3.2]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.2

### Added
- [PostgreSQLダイアレクト] `ALTER TABLE ALTER TYPE USING` 式のサポートを改善 (#6116 by @griffio)
- [PostgreSQLダイアレクト] `DROP COLUMN IF EXISTS` のサポートを追加 (#6112 by @griffio)
- [Gradleプラグイン] `Select` ワイルドカード展開を無効にする `expandSelectStar` フラグを追加 (#5813 by @griffio)
- [MySQLダイアレクト] ウィンドウ関数 (Window Functions) のサポートを追加 (#6086 by @griffio)
- [Gradleプラグイン] 開始スキーマバージョンが 1 ではなく、`verifyMigrations` が true の場合にビルドが失敗する問題を修正 (#6017 by @neilgmiller)
- [Gradleプラグイン] `SqlDelightWorkerTask` をより詳細に設定可能にし、Windows 上での開発をサポートするようにデフォルト設定を更新 (#5215 by @MSDarwish2000)
- [SQLiteダイアレクト] FTS5 仮想テーブルにおける合成カラム (synthesized columns) のサポートを追加 (#5986 by @watbe)
- [PostgreSQLダイアレクト] Postgres の行レベルセキュリティ (row level security) のサポートを追加 (#6087 by @shellderp)
- [PostgreSQLダイアレクト] `FOR UPDATE` を拡張し、`OF table`、`NO KEY UPDATE`、`NO WAIT` をサポート (#6104 by @shellderp)
- [PostgreSQLダイアレクト] Postgis の `Point` 型と関連関数のサポートを追加 (#5602 by @vanniktech)
- [ランタイム] トランザクションの `CoroutineContext` を制御するメカズムを提供する `SuspendingTransacter.TransactionDispatcher` を追加 (#5967 by @eygraber)
- [Gradleプラグイン] Android Gradle Plugin 9.0 の新しい DSL との完全な互換性を追加 (#6140)
- [PostgreSQLダイアレクト] PostgreSql の `CREATE TABLE` ストレージパラメータのサポートを追加 (#6148 by @griffio)
- [PostgreSQLダイアレクト] PostgreSql の一意なテーブル制約における Null 許容の結果カラムを修正 (#6167 by @griffio)

### Changed
- [コンパイラ] コンパイラの出力型を `java.lang.Void` から `kotlin.Nothing` に変更 (#6099 by @griffio)
- [コンパイラ] パッケージ名にアンダースコアを使用可能に変更。以前はアンダースコアがサニタイズされ、予期しない動作の原因となっていました (#6027 by @BierDav)
- [Paging拡張] AndroidX Paging への切り替え (#5910 by @jeffdgr8)
- [Androidドライバ] Android の `minSdk` を 23 に引き上げ (#6141)
- [Paging拡張] Paging 3.4.1 へのアップグレード、および X64 Apple ターゲットの削除 (#6166)

### Fixed
- [IntelliJプラグイン] VFS リフレッシュイベント中に EDT 上でブロッキングなファイルタイプ検出が行われることによる IDE のフリーズを修正
- [SQLiteダイアレクト] Json パス演算子を使用する際の Sqlite 3.38 のコンパイルエラーを修正 (#6070 by @griffio)
- [SQLiteダイアレクト] カスタムカラム型を使用する際、`group_concat` 関数に `String` 型を使用するように修正 (#6082 by @griffio)
- [Gradleプラグイン] `VerifyMigrationTask` のパフォーマンスを改善し、複雑なスキーマでハングアップする問題を修正 (#6073 by @Lightwood13)
- [Intellijプラグイン] プラグイン初期化時の例外を修正し、非推奨メソッドを更新 (#6040 by @griffio)
- [Gradleプラグイン] Android Gradle Plugin 内蔵の Kotlin との互換性を修正 (#6139)

## [2.3.1] - 2025-03-12
[2.3.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.1

リリースの失敗です。2.3.2 を使用してください！

## [2.3.0] - 2025-03-12
[2.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.0

リリースの失敗です。2.3.2 を使用してください！

## [2.2.1] - 2025-11-13
[2.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.2.1

### Added
- [PostgreSQLダイアレクト] Postgres の numeric/integer/biginteger 型マッピングを修正 (#5994 by @griffio)
- [コンパイラ] `CAST` が必要な場合にソースファイルの場所を含めるよう、コンパイラのエラーメッセージを改善 (#5979 by @griffio)
- [PostgreSQLダイアレクト] Postgres JSON 演算子によるパス抽出のサポートを追加 (#5971 by @griffio)
- [SQLiteダイアレクト] 共通テーブル式 (Common Table Expressions) を使用した `MATERIALIZED` クエリプランナヒントの Sqlite 3.35 サポートを追加 (#5961 by @griffio)
- [PostgreSQLダイアレクト] 共通テーブル式 (Common Table Expressions) を使用した `MATERIALIZED` クエリプランナヒントのサポートを追加 (#5961 by @griffio)
- [PostgreSQLダイアレクト] Postgres JSON Aggregate `FILTER` のサポートを追加 (#5957 by @griffio)
- [PostgreSQLダイアレクト] Postgres Enum のサポートを追加 (#5935 by @griffio)
- [PostgreSQLダイアレクト] Postgres トリガー (Triggers) の限定的なサポートを追加 (#5932 by @griffio)
- [PostgreSQLダイアレクト] SQL 式が JSON としてパース可能かどうかをチェックする述語を追加 (#5843 by @griffio)
- [PostgreSQLダイアレクト] PostgreSql `COMMENT ON` 文の限定的なサポートを追加 (#5808 by @griffio)
- [MySQLダイアレクト] インデックス可視性オプションのサポートを追加 (#5785 by @orenkislev-faire)
- [PostgreSQLダイアレクト] `TSQUERY` データ型のサポートを追加 (#5779 by @griffio)
- [Gradleプラグイン] モジュール追加時のバージョンカタログのサポートを追加 (#5755 by @DRSchlaubi)

### Changed
- 開発中のスナップショットが Central Portal Snapshots リポジトリ (https://central.sonatype.com/repository/maven-snapshots/) に公開されるようになりました。
- [コンパイラ] コンストラクターリファレンスを使用して、デフォルトで生成されるクエリを簡素化 (#5814 by @jonapoul)

### Fixed
- [コンパイラ] 共通テーブル式を含む View を使用した際のスタックオーバーフローを修正 (#5928 by @griffio)
- [Gradleプラグイン] SqlDelight ツールウィンドウを開いて "New Connection" を追加する際のクラッシュを修正 (#5906 by @griffio)
- [IntelliJプラグイン] copy-to-sqlite ガターアクションにおけるスレッド関連のクラッシュを回避 (#5901 by @griffio)
- [IntelliJプラグイン] `CREATE INDEX` および `CREATE VIEW` スキーマ文を使用する際の PostgreSQL ダイアレクトの修正 (#5772 by @griffio)
- [コンパイラ] カラム参照時の FTS スタックオーバーフローを修正 (#5896 by @griffio)
- [コンパイラ] `WITH RECURSIVE` のスタックオーバーフローを修正 (#5892 by @griffio)
- [コンパイラ] `INSERT`|`UPDATE`|`DELETE RETURNING` 文の Notify を修正 (#5851 by @griffio)
- [コンパイラ] `Long` を返すトランザクションブロックの非同期リザルト型を修正 (#5836 by @griffio)
- [コンパイラ] SQL パラメータバインディングの計算量を O(n²) から O(n) に最適化 (#5898 by @chenf7)
- [SQLiteダイアレクト] Sqlite 3.18 で欠落していた関数を修正 (#5759 by @griffio)

## [2.2.0] - 2025-11-13
[2.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.2.0

アーティファクトの一部のみが公開された、リリースの失敗です。2.2.1 を使用してください！

## [2.1.0] - 2025-05-16
[2.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.1.0

### Added
- [WASMドライバ] Web Worker ドライバに `wasmJs` サポートを追加 (#5534 by @IlyaGulya)
- [PostgreSQLダイアレクト] PostgreSql の `UnNest` 配列から行への展開をサポート (#5673 by @griffio)
- [PostgreSQLダイアレクト] PostgreSql `TSRANGE`/`TSTZRANGE` のサポート (#5297 by @griffio)
- [PostgreSQLダイアレクト] PostgreSql `RIGHT FULL JOIN` (#5086 by @griffio)
- [PostgreSQLダイアレクト] PostgreSql の時間型からの `EXTRACT` (#5273 by @griffio)
- [PostgreSQLダイアレクト] PostgreSql 配列包含演算子 (#4933 by @griffio)
- [PostgreSQLダイアレクト] PostgreSql `DROP CONSTRAINT` (#5288 by @griffio)
- [PostgreSQLダイアレクト] PostgreSql 型キャスト (#5089 by @griffio)
- [PostgreSQLダイアレクト] サブクエリのための PostgreSql `LATERAL JOIN` 演算子 (#5122 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQL `ILIKE` 演算子 (#5330 by @griffio)
- [PostgreSQLダイアレクト] PostgreSql `XML` 型 (#5331 by @griffio)
- [PostgreSQLダイアレクト] PostgreSql `AT TIME ZONE` (#5243 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQL の `ORDER BY NULLS` をサポート (#5199 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQL の現在の日付/時刻関数のサポートを追加 (#5226 by @drewd)
- [PostgreSQLダイアレクト] PostgreSql 正規表現演算子 (#5137 by @griffio)
- [PostgreSQLダイアレクト] BRIN GIST を追加 (#5059 by @griffio)
- [MySQLダイアレクト] MySql ダイアレクトの `RENAME INDEX` をサポート (#5212 by @orenkislev-faire)
- [JSON拡張] JSON テーブル関数にエイリアスを追加 (#5372 by @griffio)

### Changed
- [コンパイラ] 生成されたクエリファイルがシンプルなミューテータに対して行数を返すように変更 (#4578 by @MariusVolkhart)
- [Nativeドライバ] `NativeSqlDatabase.kt` を更新し、`DELETE`、`INSERT`、`UPDATE` 文の readonly フラグを変更 (#5680 by @griffio)
- [PostgreSQLダイアレクト] `PgInterval` を `String` に変更 (#5403 by @griffio)
- [PostgreSQLダイアレクト] SqlDelight モジュールによる PostgreSql 拡張の実装をサポート (#5677 by @griffio)

### Fixed
- [コンパイラ] fix: 結果を伴うグループ文を実行する際のクエリ通知を修正 (#5006 by @vitorhugods)
- [コンパイラ] `SqlDelightModule` 型リゾルバを修正 (#5625 by @griffio)
- [コンパイラ] 課題 5501: エスケープされたカラムを持つオブジェクトのインサートを修正 (#5503 by @griffio)
- [コンパイラ] コンパイラ: 正しい行と文字位置でパスリンクがクリック可能になるようエラーメッセージを改善 (#5604 by @vanniktech)
- [コンパイラ] 課題 5298 を修正: キーキーワードをテーブル名として使用できるように変更
- [コンパイラ] 名前付き実行を修正し、テストを追加
- [コンパイラ] 初期化文のソート時に外部キーのテーブル制約を考慮するように修正 (#5325 by @TheMrMilchmann)
- [コンパイラ] タブが含まれる場合のエラー下線を正しく配置するように修正 (#5224 by @drewd)
- [JDBCドライバ] トランザクション終了時の `connectionManager` のメモリリークを修正
- [JDBCドライバ] ドキュメントに記載されている通り、トランザクション内で SQLite のマイグレーションを実行するように修正 (#5218 by @morki)
- [JDBCドライバ] トランザクションのコミット/ロールバック後の接続リークを修正 (#5205 by @morki)
- [Gradleプラグイン] `DriverInitializer` を `GenerateSchemaTask` の前に実行 (#5562 by @nwagu)
- [ランタイム] 実際のドライバが非同期の場合の `LogSqliteDriver` におけるクラッシュを修正 (#5723 by @edenman)
- [ランタイム] `StringBuilder` の容量を修正 (#5192 by @janbina)
- [PostgreSQLダイアレクト] PostgreSql `CREATE OR REPLACE VIEW` (#5407 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQL `to_json` (#5606 by @griffio)
- [PostgreSQLダイアレクト] PostgreSql 数値リゾルバを修正 (#5399 by @griffio)
- [PostgreSQLダイアレクト] sqlite ウィンドウ関数を修正 (#2799 by @griffio)
- [PostgreSQLダイアレクト] PostgreSql `SELECT DISTINCT ON` (#5345 by @griffio)
- [PostgreSQLダイアレクト] `ALTER TABLE ADD COLUMN IF NOT EXISTS` (#5309 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQL 非同期バインドパラメータ (#5313 by @griffio)
- [PostgreSQLダイアレクト] PostgreSql boolean リテラル (#5262 by @griffio)
- [PostgreSQLダイアレクト] PostgreSql ウィンドウ関数 (#5155 by @griffio)
- [PostgreSQLダイアレクト] PostgreSql `isNull`/`isNotNull` 型 (#5173 by @griffio)
- [PostgreSQLダイアレクト] PostgreSql `SELECT DISTINCT` (#5172 by @griffio)
- [Paging拡張] ページングリフレッシュの初期ロードを修正 (#5615 by @evant)
- [Paging拡張] MacOS ネイティブターゲットを追加 (#5324 by @vitorhugods)
- [IntelliJプラグイン] K2 サポート

## [2.0.2] - 2024-04-05
[2.0.2]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.2

### Added
- [PostgreSQLダイアレクト] PostgreSQL `STRING_AGG` 関数を追加 (#4950 by @anddani)
- [PostgreSQLダイアレクト] PostgreSQL ダイアレクトに `SET` 文を追加 (#4927 by @de-luca)
- [PostgreSQLダイアレクト] PostgreSql カラムのシーケンスパラメータ変更 (alter column sequence parameters) を追加 (#4916 by @griffio)
- [PostgreSQLダイアレクト] インサート文における PostgreSQL カラムのデフォルト値変更のサポートを追加 (#4912 by @griffio)
- [PostgreSQLダイアレクト] PostgreSql シーケンスの変更 (alter sequence) と削除 (drop sequence) を追加 (#4920 by @griffio)
- [PostgreSQLダイアレクト] Postgres 正規表現関数の定義を追加 (#5025 by @MariusVolkhart)
- [PostgreSQLダイアレクト] GIN のグラマーを追加 (#5027 by @griffio)

### Changed
- [IDEプラグイン] 最小バージョンを 2023.1 / Android Studio Iguana に変更
- [コンパイラ] `encapsulatingType` における型の Null 許容性の上書きを許可 (#4882 by @eygraber)
- [コンパイラ] `SELECT *` のカラム名をインライン化
- [Gradleプラグイン] `processIsolation` へ切り替え (#5068 by @nwagu)
- [Androidランタイム] Android の `minSDK` を 21 に引き上げ (#5094 by @hfhbd)
- [ドライバ] ダイアレクト作者向けに、より多くの JDBC/R2DBC ステートメントメソッドを公開 (#5098 by @hfhbd)

### Fixed
- [PostgreSQLダイアレクト] PostgreSQL `ALTER TABLE ALTER COLUMN` を修正 (#4868 by @griffio)
- [PostgreSQLダイアレクト] 課題 4448 を修正: テーブルモデルのインポート欠落 (#4885 by @griffio)
- [PostgreSQLダイアレクト] 課題 4932 を修正: PostgreSQL デフォルト制約関数 (#4934 by @griffio)
- [PostgreSQLダイアレクト] 課題 4879 を修正: マイグレーション中の `ALTER TABLE RENAME COLUMN` における PostgreSQL クラスキャストエラー (#4880 by @griffio)
- [PostgreSQLダイアレクト] 課題 4474 を修正: PostgreSql 拡張の作成 (create extension) (#4541 by @griffio)
- [PostgreSQLダイアレクト] 課題 5018 を修正: PostgreSql `ADD PRIMARY KEY` の非 Null 型 (#5020 by @griffio)
- [PostgreSQLダイアレクト] 課題 4703 を修正: 集計式 (#5071 by @griffio)
- [PostgreSQLダイアレクト] 課題 5028 を修正: PostgreSql JSON (#5030 by @griffio)
- [PostgreSQLダイアレクト] 課題 5040 を修正: PostgreSql JSON 演算子 (#5041 by @griffio)
- [PostgreSQLダイアレクト] 課題 5040 の JSON 演算子バインディングを修正 (#5100 by @griffio)
- [PostgreSQLダイアレクト] 課題 5082 を修正: `tsvector` (#5104 by @griffio)
- [PostgreSQLダイアレクト] 課題 5032 を修正: PostgreSql `UPDATE FROM` 文におけるカラムの隣接性 (#5035 by @griffio)
- [SQLiteダイアレクト] 課題 4897 を修正: sqlite `ALTER TABLE RENAME COLUMN` (#4899 by @griffio)
- [IDEプラグイン] エラーハンドラのクラッシュを修正 (#4988 by @aperfilyev)
- [IDEプラグイン] IDEA 2023.3 で BugSnag の初期化に失敗する問題を修正 (by @aperfilyev)
- [IDEプラグイン] プラグイン経由で IntelliJ で .sq ファイルを開く際の `PluginException` を修正 (by @aperfilyev)
- [IDEプラグイン] すでにプラグインの依存関係にあるため、Kotlin lib を IntelliJ プラグインにバンドルしないように変更 (#5126)
- [IDEプラグイン] ストリームの代わりに拡張機能配列を使用するように変更 (#5127)

## [2.0.1] - 2023-12-01
[2.0.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.1

### Added
- [コンパイラ] `SELECT` 実行時の複数カラム式 (multi-column-expr) のサポートを追加 (#4453 by @Adriel-M)
- [PostgreSQLダイアレクト] PostgreSQL `CREATE INDEX CONCURRENTLY` のサポートを追加 (#4531 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQL CTE の補助ステートメントが相互に参照可能になるようサポート (#4493 by @griffio)
- [PostgreSQLダイアレクト] バイナリ式 (binary expr) および `sum` における PostgreSQL 型のサポートを追加 (#4539 by @Adriel-M)
- [PostgreSQLダイアレクト] PostgreSQL `SELECT DISTINCT ON` 構文의サポートを追加 (#4584 by @griffio)
- [PostgreSQLダイアレクト] `SELECT` 文における PostgreSQL JSON 関数のサポートを追加 (#4590 by @MariusVolkhart)
- [PostgreSQLダイアレクト] `generate_series` PostgreSQL 関数を追加 (#4717 by @griffio)
- [PostgreSQLダイアレクト] 追加の Postgres 文字列関数の定義を追加 (#4752 by @MariusVolkhart)
- [PostgreSQLダイアレクト] `min` および `max` 集計関数に `DATE` PostgreSQL 型を追加 (#4816 by @anddani)
- [PostgreSQLダイアレクト] `SqlBinaryExpr` に PostgreSql の時間型を追加 (#4657 by @griffio)
- [PostgreSQLダイアレクト] Postgres ダイアレクトに `TRUNCATE` を追加 (#4817 by @de-luca)
- [SQLite 3.35 ダイアレクト] 順番に評価される複数の `ON CONFLICT` 句を許可 (#4551 by @griffio)
- [JDBCドライバ] SQL 編集をより快適にするための Language アノテーションを追加 (#4602 by @MariusVolkhart)
- [Nativeドライバ] `linuxArm64` のサポートを追加 (#4792 by @hfhbd)
- [Androidドライバ] `AndroidSqliteDriver` に `windowSizeBytes` パラメータを追加 (#4804 by @BoD)
- [Paging3拡張] feat: `OffsetQueryPagingSource` に `initialOffset` を追加 (#4802 by @MohamadJaara)

### Changed
- [コンパイラ] 適切な場合には Kotlin 型を優先するように変更 (#4517 by @eygraber)
- [コンパイラ] 値型をインサートする際、常にカラム名を含めるように変更 (#4864)
- [PostgreSQLダイアレクト] PostgreSQL ダイアレクトから実験的ステータスを削除 (#4443 by @hfhbd)
- [PostgreSQLダイアレクト] PostgreSQL 型のドキュメントを更新 (#4569 by @MariusVolkhart)
- [R2DBCドライバ] PostgreSQL における整数データ型の処理パフォーマンスを最適化 (#4588 by @MariusVolkhart)

### Removed
- [SQLite Javascriptドライバ] `sqljs-driver` を削除 (#4613, #4670 by @dellisd)

### Fixed
- [コンパイラ] 戻り値がありパラメータのないグループ化されたステートメントのコンパイルを修正 (#4699 by @griffio)
- [コンパイラ] `SqlBinaryExpr` で引数をバインドするように修正 (#4604 by @griffio)
- [IDEプラグイン] 設定されている場合は IDEA Project JDK を使用するように修正 (#4689 by @griffio)
- [IDEプラグイン] IDEA 2023.2 以上における "Unknown element type: TYPE_NAME" エラーを修正 (#4727)
- [IDEプラグイン] 2023.2 とのいくつかの互換性問題を修正
- [Gradleプラグイン] `verifyMigrationTask` Gradle タスクのドキュメントを修正 (#4713 by @joshfriend)
- [Gradleプラグイン] データベースを検証する前にデータベースを生成するよう促すタスク出力メッセージを追加 (#4684 by @jingwei99)
- [PostgreSQLダイアレクト] PostgreSQL のカラム名を複数回リネームする問題を修正 (#4566 by @griffio)
- [PostgreSQLダイアレクト] 課題 4714 を修正: PostgreSql カラムの Null 許容性変更 (#4831 by @griffio)
- [PostgreSQLダイアレクト] 課題 4837 を修正: `ALTER TABLE ALTER COLUMN` (#4846 by @griffio)
- [PostgreSQLダイアレクト] 課題 4501 を修正: PostgreSql シーケンス (#4528 by @griffio)
- [SQLiteダイアレクト] カラム式で JSON バイナリ演算子を使用可能に修正 (#4776 by @eygraber)
- [SQLiteダイアレクト] 名前が一致する複数のカラムが見つかった場合の `UPDATE FROM` の誤検出を修正 (#4777 by @eygraber)
- [Nativeドライバ] 名前付きインメモリデータベースをサポート (#4662 by @05nelsonm)
- [Nativeドライバ] クエリリスナーコレクションのスレッドセーフを確保 (#4567 by @kpgalligan)
- [JDBCドライバ] `ConnectionManager` における接続リークを修正 (#4589 by @MariusVolkhart)
- [JDBCドライバ] `ConnectionManager` タイプを選択する際の `JdbcSqliteDriver` URL 解析を修正 (#4656 by @05nelsonm)

## [2.0.0] - 2023-07-26
[2.0.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0

### Added
- [MySQLダイアレクト] MySQL: `IF` 式における `timestamp`/`bigint` をサポート (#4329 by @shellderp)
- [MySQLダイアレクト] MySQL: `now` を追加 (#4431 by @hfhbd)
- [Webドライバ] NPM パッケージの公開を有効化 (#4364)
- [IDEプラグイン] Gradle ツール接続失敗時にスタックトレースを表示可能に修正 (#4383)

### Changed
- [Sqliteドライバ] `JdbcSqliteDriver` におけるスキーママイグレーションの使用を簡素化 (#3737 by @morki)
- [R2DBCドライバ] リアルな非同期 R2DBC カーソル (#4387 by @hfhbd)

### Fixed
- [IDEプラグイン] 必要になるまでデータベースプロジェクトサービスをインスタンス化しないように変更 (#4382)
- [IDEプラグイン] 使用箇所検索中のプロセスキャンセルを処理 (#4340)
- [IDEプラグイン] 非同期コードの IDE 生成を修正 (#4406)
- [IDEプラグイン] パッケージ構造の組み立てを 1 回限りの計算にし、EDT 外に移動 (#4417)
- [IDEプラグイン] 2023.2 における Kotlin 型解決に正しいスタブインデックスキーを使用 (#4416)
- [IDEプラグイン] 検索を実行する前にインデックスの準備が整うのを待つように修正 (#4419)
- [IDEプラグイン] インデックスが利用できない場合は "goto" を実行しないように変更 (#4420)
- [コンパイラ] グループ化されたステートメントの結果式を修正 (#4378)
- [コンパイラ] 仮想テーブルをインターフェース型として使用しないように修正 (#4427 by @hfhbd)

## [2.0.0-rc02] - 2023-06-27
[2.0.0-rc02]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-rc02

### Added
- [MySQLダイアレクト] 小文字の日付型、および日付型に対する `min` と `max` をサポート (#4243 by @shellderp)
- [MySQLダイアレクト] バイナリ式と `sum` に対する MySql 型をサポート (#4254 by @shellderp)
- [MySQLダイアレクト] 表示幅のない符号なし整数 (unsigned ints) をサポート (#4306 by @shellderp)
- [MySQLダイアレクト] `LOCK IN SHARED MODE` をサポート
- [PostgreSQLダイアレクト] `min`/`max` に boolean と `Timestamp` を追加 (#4245 by @griffio)
- [PostgreSQLダイアレクト] Postgres: ウィンドウ関数のサポートを追加 (#4283 by @hfhbd)
- [ランタイム] ランタイムに `linuxArm64`、`androidNative`、`watchosDeviceArm` ターゲットを追加 (#4258 by @hfhbd)
- [Paging拡張] Paging 拡張に linux と mingw x64 ターゲットを追加 (#4280 by @chippman)

### Changed
- [Gradleプラグイン] Android API 34 に対する自動ダイアレクトサポートを追加 (#4251)
- [Paging拡張] `QueryPagingSource` における `SuspendingTransacter` のサポートを追加 (#4292 by @daio)
- [ランタイム] `addListener` API を改善 (#4244 by @hfhbd)
- [ランタイム] マイグレーションバージョンとして `Long` を使用するように変更 (#4297 by @hfhbd)

### Fixed
- [Gradleプラグイン] 生成されたソースに安定した出力パスを使用 (#4269 by @joshfriend)
- [Gradleプラグイン] Gradle の微調整 (#4222 by @3flex)

## [2.0.0-rc01] - 2023-05-29
[2.0.0-rc01]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-rc01

### Added
- [Paging] Paging 拡張に js browser ターゲットを追加 (#3843 by @sproctor)
- [Paging] androidx-paging3 拡張に `iosSimulatorArm64` ターゲットを追加 (#4117)
- [PostgreSQLダイアレクト] `gen_random_uuid()` のサポートとテストを追加 (#3855 by @davidwheeler123)
- [PostgreSQLダイアレクト] PostgreSQL の `ALTER TABLE ADD CONSTRAINT` (#4116 by @griffio)
- [PostgreSQLダイアレクト] `ALTER TABLE ADD CONSTRAINT CHECK` (#4120 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQL の文字長関数を追加 (#4121 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQL のカラムデフォルト `INTERVAL` を追加 (#4142 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQL `INTERVAL` カラム結果を追加 (#4152 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQL `ALTER COLUMN` を追加 (#4165 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQL: `date_part` を追加 (#4198 by @hfhbd)
- [MySQLダイアレクト] SQL 文字長関数を追加 (#4134 by @griffio)
- [IDEプラグイン] sqldelight ディレクトリのサジェストを追加 (#3976 by @aperfilyev)
- [IDEプラグイン] プロジェクトツリー内の中間パッケージをコンパクトに表示 (#3992 by @aperfilyev)
- [IDEプラグイン] `JOIN` 句の補完を追加 (#4086 by @aperfilyev)
- [IDEプラグイン] View 作成のインテンションとライブテンプレートを追加 (#4074 by @aperfilyev)
- [IDEプラグイン] `DELETE` または `UPDATE` 内で `WHERE` が欠落している場合に警告を表示 (#4058 by @aperfilyev)
- [Gradleプラグイン] 型セーフなプロジェクトアクセサを有効化 (#4005 by @hfhbd)

### Changed
- [Gradleプラグイン] `ServiceLoader` メカニズムを使用して `VerifyMigrationTask` 用の `DriverInitializer` を登録可能に変更 (#3986 by @C2H6O)
- [Gradleプラグイン] 明示的なコンパイラ環境を作成 (#4079 by @hfhbd)
- [JSドライバ] Web Worker ドライバを別のアーティファクトに分割
- [JSドライバ] `JsWorkerSqlCursor` を公開しないように変更 (#3874 by @hfhbd)
- [JSドライバ] `sqljs` ドライバの公開を停止 (#4108)
- [ランタイム] 同期ドライバに同期スキーマ初期化子を強制 (#4013)
- [ランタイム] Cursor の非同期サポートを改善 (#4102)
- [ランタイム] 非推奨ターゲットを削除 (#4149 by @hfhbd)
- [ランタイム] 古い MM のサポートを削除 (#4148 by @hfhbd)

### Fixed
- [R2DBCドライバ] R2DBC: ドライバのクローズを待機するように修正 (#4139 by @hfhbd)
- [コンパイラ] データベース `create(SqlDriver)` にマイグレーションからの `PRAGMA` を含めるように修正 (#3845 by @MariusVolkhart)
- [コンパイラ] `RETURNING` 句のコード生成を修正 (#3872 by @MariusVolkhart)
- [コンパイラ] 仮想テーブルの型を生成しないように修正 (#4015)
- [Gradleプラグイン] Gradle プラグインの QoL を向上させる小さな改善 (#3930 by @zacsweers)
- [IDEプラグイン] 未解決の Kotlin 型を修正 (#3924 by @aperfilyev)
- [IDEプラグイン] ワイルドカード展開インテンションが修飾子付きで動作するように修正 (#3979 by @aperfilyev)
- [IDEプラグイン] java home が見つからない場合に利用可能な JDK を使用するように修正 (#3925 by @aperfilyev)
- [IDEプラグイン] パッケージ名に対する使用箇所検索を修正 (#4010)
- [IDEプラグイン] 無効な要素に対して自動インポートを表示しないように変更 (#4008)
- [IDEプラグイン] ダイアレクトが欠落している場合に解決しないように変更 (#4009)
- [IDEプラグイン] 無効な状態での IDE によるコンパイラ実行を無視 (#4016)
- [IDEプラグイン] IntelliJ 2023.1 のサポートを追加 (#4037 by @madisp)
- [IDEプラグイン] カラム名変更時に名前付き引数の使用箇所をリネームするように修正 (#4027 by @aperfilyev)
- [IDEプラグイン] マイグレーション追加ポップアップを修正 (#4105 by @aperfilyev)
- [IDEプラグイン] マイグレーションファイル内の `SchemaNeedsMigrationInspection` を無効化 (#4106 by @aperfilyev)
- [IDEプラグイン] マイグレーション生成に型名の代わりに SQL カラム名を使用するように修正 (#4112 by @aperfilyev)

## [2.0.0-alpha05] - 2023-01-20
[2.0.0-alpha05]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha05

### Added
- [Paging] マルチプラットフォーム Paging 拡張 (by @jeffdgr8)
- [ランタイム] `Listener` インターフェースに `fun` 修飾子を追加。
- [SQLiteダイアレクト] SQLite 3.33 サポート (`UPDATE FROM`) を追加 (by @eygraber)
- [PostgreSQLダイアレクト] PostgreSQL における `UPDATE FROM` をサポート (by @eygraber)

### Changed
- [RDBCドライバ] コネクションを公開 (by @hfhbd)
- [ランタイム] マイグレーションコールバックをメインの `migrate` 関数に移動
- [Gradleプラグイン] 下流プロジェクトから `Configurations` を隠蔽
- [Gradleプラグイン] IntelliJ のみをシェード (by @hfhbd)
- [Gradleプラグイン] Kotlin 1.8.0-Beta をサポートし、複数バージョンの Kotlin テストを追加 (by @hfhbd)

### Fixed
- [RDBCドライバ] 代わりに `javaObjectType` を使用するように修正 (by @hfhbd)
- [RDBCドライバ] `bindStatement` におけるプリミティブの Null 値を修正 (by @hfhbd)
- [RDBCドライバ] R2DBC 1.0 をサポート (by @hfhbd)
- [PostgreSQLダイアレクト] Postgres: 型パラメータのない配列を修正 (by @hfhbd)
- [IDEプラグイン] intellij を 221.6008.13 に引き上げ (by @hfhbd)
- [コンパイラ] 純粋な View から再帰的な元のテーブルを解決するように修正 (by @hfhbd)
- [コンパイラ] テーブルの外部キー句から値クラスを使用するように修正 (by @hfhbd)
- [コンパイラ] 括弧のないバインド式をサポートするように `SelectQueryGenerator` を修正 (by @bellatoris)
- [コンパイラ] トランザクション使用時の `${name}Indexes` 変数の重複生成を修正 (by @sachera)

## [1.5.5] - 2023-01-20
[1.5.5]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.5

Kotlin 1.8 および IntelliJ 2021+ との互換性リリース。JDK 17 をサポート。

## [1.5.4] - 2022-10-06
[1.5.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.4

Kotlin 1.7.20 および AGP 7.3.0 との互換性アップデート。

## [2.0.0-alpha04] - 2022-10-03
[2.0.0-alpha04]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha04

### 破壊的変更

- Paging 3 拡張 API が変更され、count には int 型のみが許可されるようになりました。
- コルーチン拡張で、ディスパッチャのデフォルト設定がなくなり、渡すことが必須になりました。
- ダイアレクトおよびドライバクラスが `final` になりました。代わりにデリゲーションを使用してください。

### Added
- [HSQLダイアレクト] Hsql: インサート時の生成カラムに対する `DEFAULT` の使用をサポート (#3372 by @hfhbd)
- [PostgreSQLダイアレクト] PostgreSQL: `INSERT` における生成カラムに対する `DEFAULT` の使用をサポート (#3373 by @hfhbd)
- [PostgreSQLダイアレクト] PostgreSQL に `NOW()` を追加 (#3403 by @hfhbd)
- [PostgreSQLダイアレクト] PostgreSQL に `NOT` 演算子を追加 (#3504 by @hfhbd)
- [Paging] `*QueryPagingSource` に `CoroutineContext` を渡せるように修正 (#3384)
- [Gradleプラグイン] ダイアレクトに対するより良いバージョンカタログサポートを追加 (#3435)
- [Nativeドライバ] `NativeSqliteDriver` の `DatabaseConfiguration` 作成時にフックするコールバックを追加 (#3512 by @svenjacobs)

### Changed
- [Paging] `KeyedQueryPagingSource` をベースとする `QueryPagingSource` 関数にデフォルトのディスパッチャを追加 (#3385)
- [Paging] `OffsetQueryPagingSource` が `Int` でのみ動作するように変更 (#3386)
- [Asyncランタイム] `await*` を親クラスの `ExecutableQuery` に移動 (#3524 by @hfhbd)
- [コルーチン拡張] Flow 拡張のデフォルトパラメータを削除 (#3489)

### Fixed
- [Gradleプラグイン] Kotlin 1.7.20 に更新 (#3542 by @zacsweers)
- [R2DBCドライバ] 常に値を送信するとは限らない R2DBC の変更を採用 (#3525 by @hfhbd)
- [HSQLダイアレクト] Hsql で SQLite の `VerifyMigrationTask` が失敗する問題を修正 (#3380 by @hfhbd)
- [Gradleプラグイン] タスクを遅延設定 (lazy configuration) API を使用するように変換 (by @3flex)
- [Gradleプラグイン] Kotlin 1.7.20 における NPE を回避 (#3398 by @ZacSweers)
- [Gradleプラグイン] squash migrations タスクの説明を修正 (#3449)
- [IDEプラグイン] 新しい Kotlin プラグインにおける `NoSuchFieldError` を修正 (#3422 by @madisp)
- [IDEプラグイン] IDEA: `UnusedQueryInspection` - `ArrayIndexOutOfBoundsException` を修正 (#3427 by @vanniktech)
- [IDEプラグイン] 古い Kotlin プラグイン参照にリフレクションを使用
- [コンパイラ] 拡張関数を持つカスタムダイアレクトがインポートを作成しない問題を修正 (#3338 by @hfhbd)
- [コンパイラ] `CodeBlock.of("${CodeBlock.toString()}")` のエスケープを修正 (#3340 by @hfhbd)
- [コンパイラ] マイグレーションにおける非同期実行文の待機を追加 (#3352)
- [コンパイラ] `AS` を修正 (#3370 by @hfhbd)
- [コンパイラ] `getObject` メソッドが実際の型の自動充填をサポート (#3401 by @robxyy)
- [コンパイラ] 非同期でグループ化された戻り値のある文のコード生成を修正 (#3411)
- [コンパイラ] 可能であればバインドパラメータの Kotlin 型を推論し、そうでなければより良いエラーメッセージを表示 (#3413 by @hfhbd)
- [コンパイラ] `ABS("foo")` を禁止 (#3430 by @hfhbd)
- [コンパイラ] 他のパラメータからの Kotlin 型推論をサポート (#3431 by @hfhbd)
- [コンパイラ] 常にデータベース実装を作成するように変更 (#3540 by @hfhbd)
- [コンパイラ] javaDoc 制約を緩和し、カスタムマッパー関数にも追加 (#3554 @hfhbd)
- [コンパイラ] バインディングにおける `DEFAULT` を修正 (by @hfhbd)
- [Paging] Paging 3 を修正 (#3396)
- [Paging] `Long` による `OffsetQueryPagingSource` の構築を許可 (#3409)
- [Paging] `Dispatchers.Main` を静的にスワップしないように変更 (#3428)

## [2.0.0-alpha03] - 2022-06-17
[2.0.0-alpha03]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha03

### 破壊的変更

- ダイアレクトは、実際の Gradle 依存関係のように参照されるようになりました。
```groovy
sqldelight {
  MyDatabase {
    dialect("app.cash.sqldelight:postgres-dialect:2.0.0-alpha03")
  }
}
```
- `AfterVersionWithDriver` 型は削除され、常にドライバを持つ `AfterVersion` に統合されました。
- `Schema` 型は `SqlDriver` のサブタイプではなくなりました。
- `PreparedStatement` API は、0 始まりのインデックスで呼び出されるようになりました。

### Added
- [IDEプラグイン] 実行中のデータベースに対して SQLite、MySQL、および PostgreSQL コマンドを実行する機能を追加 (#2718 by @aperfilyev)
- [IDEプラグイン] Android Studio DB inspector のサポートを追加 (#3107 by @aperfilyev)
- [ランタイム] 非同期ドライバのサポートを追加 (#3168 by @dellisd)
- [Nativeドライバ] 新しい Kotlin Native メモリモデルをサポート (#3177 by @kpgalligan)
- [JSドライバ] SqlJs worker 用のドライバを追加 (#3203 by @dellisd)
- [Gradleプラグイン] SQLDelight タスク host クラスパスを公開
- [Gradleプラグイン] マイグレーションを統合 (squashing) するための Gradle タスクを追加
- [Gradleプラグイン] マイグレーションチェック中にスキーマ定義を無視するフラグを追加
- [MySQLダイアレクト] MySQL における `FOR SHARE` および `FOR UPDATE` をサポート (#3098)
- [MySQLダイアレクト] MySQL インデックスヒントをサポート (#3099)
- [PostgreSQLダイアレクト] `date_trunc` を追加 (#3295 by @hfhbd)
- [JSON拡張] JSON テーブル関数をサポート (#3090)

### Changed
- [ランタイム] ドライバのない `AfterVersion` 型を削除 (#3091)
- [ランタイム] `Schema` 型をトップレベルに移動
- [ランタイム] サードパーティ実装をサポートするためにダイアレクトとリゾルバをオープンに変更 (#3232 by @hfhbd)
- [コンパイラ] 失敗レポートにコンパイルに使用されたダイアレクトを含めるように変更 (#3086)
- [コンパイラ] 未使用のアダプタをスキップ (#3162 by @eygraber)
- [コンパイラ] `PreparedStatement` で 0 始まりのインデックスを使用 (#3269 by @hfhbd)
- [Gradleプラグイン] ダイアレクトを文字列ではなく適切な Gradle 依存関係に変更 (#3085)
- [Gradleプラグイン] Gradle 検証タスク: データベースファイルが欠落している場合に例外を投げるように変更 (#3126 by @vanniktech)

### Fixed
- [Gradleプラグイン] Gradle プラグインの細かなクリーンアップと調整 (#3171 by @3flex)
- [Gradleプラグイン] 生成ディレクトリに AGP 文字列を使用しないように変更
- [Gradleプラグイン] AGP 名前空間属性を使用 (#3220)
- [Gradleプラグイン] `kotlin-stdlib` を Gradle プラグインのランタイム依存関係として追加しないように修正 (#3245 by @mbonnin)
- [Gradleプラグイン] マルチプラットフォーム設定を簡素化 (#3246 by @mbonnin)
- [Gradleプラグイン] JS のみのプロジェクトをサポート (#3310 by @hfhbd)
- [IDEプラグイン] Gradle tooling API に java home を使用 (#3078)
- [IDEプラグイン] IDE プラグイン内の正しい `classLoader` で JDBC ドライバをロードするように修正 (#3080)
- [IDEプラグイン] 既存の PSI 変更中のエラーを回避するため、無効化の前にファイル要素を null としてマーク (#3082)
- [IDEプラグイン] `ALTER TABLE` 文における新しいテーブル名の使用箇所を検索する際のクラッシュを修正 (#3106)
- [IDEプラグイン] インスペクタを最適化し、期待される例外タイプについては警告なしで失敗できるように変更 (#3121)
- [IDEプラグイン] 生成ディレクトリであるべきファイルを削除 (#3198)
- [IDEプラグイン] 安全でない演算子呼び出しを修正
- [コンパイラ] `RETURNING` 文を伴う更新および削除でクエリが確実に実行されるように修正 (#3084)
- [コンパイラ] 複合セレクトにおける引数型を正しく推論するように修正 (#3096)
- [コンパイラ] 共通テーブルはデータクラスを生成しないため、それらを返さないように修正 (#3097)
- [コンパイラ] 最上位のマイグレーションファイルをより高速に見つけるように修正 (#3108)
- [コンパイラ] パイプ演算子の Null 許容性を正しく継承するように修正
- [コンパイラ] `iif` ANSI SQL 関数をサポート
- [コンパイラ] 空のクエリファイルを生成しないように修正 (#3300 by @hfhbd)
- [コンパイラ] 疑問符のみのアダプタを修正 (#3314 by @hfhbd)
- [PostgreSQLダイアレクト] Postgres のプライマリキーカラムは常に非 Null になるように修正 (#3092)
- [PostgreSQLダイアレクト] 複数テーブルで同名のカラムがある場合のコピーを修正 (#3297 by @hfhbd)
- [SQLite 3.35 ダイアレクト] 変更されたテーブルからインデックス付きのカラムを削除する際にのみエラーを表示するように修正 (#3158 by @eygraber)

## [2.0.0-alpha02] - 2022-04-13
[2.0.0-alpha02]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha02

### 破壊的変更

- すべての `app.cash.sqldelight.runtime.rx` を `app.cash.sqldelight.rx2` に置換する必要があります。

### Added
- [コンパイラ] グループ化されたステートメントの末尾での `RETURNING` をサポート
- [コンパイラ] ダイアレクトモジュールによるコンパイラ拡張をサポートし、SQLite JSON 拡張を追加 (#1379, #2087)
- [コンパイラ] 値を返す `PRAGMA` 文をサポート (#1106)
- [コンパイラ] マークされたカラムに対する value 型の生成をサポート
- [コンパイラ] 楽観的ロックとバリデーションのサポートを追加 (#1952)
- [コンパイラ] マルチアップデート文をサポート
- [PostgreSQL] Postgres の `RETURNING` 文をサポート
- [PostgreSQL] Postgres の日付型をサポート
- [PostgreSQL] Postgres のインターバルをサポート
- [PostgreSQL] Postgres の Boolean をサポートし、`ALTER TABLE` 時のインサートを修正
- [PostgreSQL] Postgres におけるオプションの `LIMIT` をサポート
- [PostgreSQL] Postgres `BYTEA` 型をサポート
- [PostgreSQL] Postgres シリアルのテストを追加
- [PostgreSQL] Postgres の `FOR UPDATE` 構文をサポート
- [PostgreSQL] PostgreSQL 配列型をサポート
- [PostgreSQL] Postgres における `UUID` 型の保存/取得を適切に処理
- [PostgreSQL] PostgreSQL `NUMERIC` 型をサポート (#1882)
- [PostgreSQL] 共通テーブル式内でのクエリの返却をサポート (#2471)
- [PostgreSQL] JSON 特有の演算子をサポート
- [PostgreSQL] Postgres Copy を追加 (by @hfhbd)
- [MySQL] MySQL `REPLACE` をサポート
- [MySQL] `NUMERIC`/`BigDecimal` MySQL 型をサポート (#2051)
- [MySQL] MySQL `TRUNCATE` 文をサポート
- [MySQL] MySQL における JSON 特有の演算子をサポート (by @eygraber)
- [MySQL] MySQL `INTERVAL` をサポート (#2969 by @eygraber)
- [HSQL] HSQL ウィンドウ機能を追加
- [SQLite] `WHERE` 句における Null 許容パラメータの等価性チェックを置換しないように変更 (#1490 by @eygraber)
- [SQLite] Sqlite 3.35 の `RETURNING` 文をサポート (#1490 by @eygraber)
- [SQLite] `GENERATED` 句をサポート
- [SQLite] Sqlite 3.38 ダイアレクトのサポートを追加 (by @eygraber)

### Changed
- [コンパイラ] 生成コードを整理
- [コンパイラ] グループ化されたステートメント内でのテーブルパラメータの使用を禁止 (#1822)
- [コンパイラ] グループ化されたクエリをトランザクション内に配置 (#2785)
- [ランタイム] ドライバの実行メソッドから更新された行数を返すように変更
- [ランタイム] 接続にアクセスするクリティカルセクションに `SqlCursor` を限定 (#2123 by @andersio)
- [Gradleプラグイン] マイグレーションのためにスキーマ定義を比較 (#841)
- [PostgreSQL] Postgres におけるダブルクォートを禁止
- [MySQL] MySQL における `==` の使用をエラーに設定 (#2673)

### Fixed
- [コンパイラ] 2.0 alpha において異なるテーブルから同じアダプタ型を使用するとコンパイルエラーが発生する問題を修正
- [コンパイラ] `UPSERT` 文のコンパイル問題を修正 (#2791)
- [コンパイラ] 複数（複数）のマッチがある場合、セレクト内のテーブルを使用するようにクエリ結果を修正 (#1874, #2313)
- [コンパイラ] `INSTEAD OF` トリガーを持つ View の更新をサポート (#1018)
- [コンパイラ] 関数名における `FROM` と `FOR` をサポート
- [コンパイラ] 関数式における `SEPARATOR` キーワードを許可
- [コンパイラ] `ORDER BY` においてエイリアスされたテーブルの `ROWID` にアクセスできない問題を修正
- [コンパイラ] MySQL の `HAVING` 句でエイリアスされたカラム名が認識されない問題を修正
- [コンパイラ] 誤った "Multiple columns found" エラーを修正
- [コンパイラ] `PRAGMA locking_mode = EXCLUSIVE;` が設定できない問題を修正
- [PostgreSQL] PostgreSQL のカラムリネームを修正
- [MySQL] `UNIX_TIMESTAMP`、`TO_SECONDS`、`JSON_ARRAYAGG` MySQL 関数が認識されない問題を修正
- [SQLite] fix SQLite ウィンドウ機能を修正
- [IDEプラグイン] 空のプログレスインジケータで goto ハンドラを実行するように修正 (#2990)
- [IDEプラグイン] プロジェクトが設定されていない場合にハイライトビジターが実行されないように修正 (#2981, #2976)
- [IDEプラグイン] 推移的に生成されたコードも IDE 内で更新されるように修正 (#1837)
- [IDEプラグイン] ダイアレクト更新時にインデックスを無効化するように修正

## [2.0.0-alpha01] - 2022-03-31
[2.0.0-alpha01]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha01

2.0 の最初のアルファリリースであり、いくつかの破壊的変更が含まれています。今後も ABI の破壊的変更が予想されるため、このリリースに依存するライブラリは公開しないでください（アプリケーションでの利用は問題ありません）。

### 破壊的変更

- まず、すべての `com.squareup.sqldelight` を `app.cash.sqldelight` に置換する必要があります。
- 次に、すべての `app.cash.sqldelight.android` を `app.cash.sqldelight.driver.android` に置換する必要があります。
- 次に、すべての `app.cash.sqldelight.sqlite.driver` を `app.cash.sqldelight.driver.jdbc.sqlite` に置換する必要があります。
- 次に、すべての `app.cash.sqldelight.drivers.native` を `app.cash.sqldelight.driver.native` に置換する必要があります。
- IDE プラグインは 2.X バージョンに更新する必要があります（[alpha または eap チャンネル](https://plugins.jetbrains.com/plugin/8191-sqldelight/versions/alpha) で入手可能）。
- ダイアレクトは依存関係となり、Gradle 内で指定するようになりました：

```gradle
sqldelight {
  MyDatabase {
    packageName = "com.example"
    dialect = "app.cash.sqldelight:mysql-dialect:2.0.0-alpha01"
  }
}
```

現在サポートされているダイアレクトは、`mysql-dialect`、`postgresql-dialect`、`hsql-dialect`、`sqlite-3-18-dialect`、`sqlite-3-24-dialect`、`sqlite-3-25-dialect`、`sqlite-3-30-dialect`、および `sqlite-3-35-dialect` です。

- プリミティブ型をインポートする必要があります（例：`INTEGER AS Boolean` の場合は `import kotlin.Boolean` が必要）。以前サポートされていた一部の型にはアダプタが必要になりました。プリミティブアダプタは、ほとんどの変換（`Integer AS kotlin.Int` 用の `IntColumnAdapter` など）向けに `app.cash.sqldelight:primitive-adapters:2.0.0-alpha01` で利用可能です。

### Added
- [IDEプラグイン] 基本的なマイグレーション提案を追加 (by @aperfilyev)
- [IDEプラグイン] インポートヒントアクションを追加 (by @aperfilyev)
- [IDEプラグイン] Kotlin クラス補完を追加 (by @aperfilyev)
- [Gradleプラグイン] Gradle の型セーフなプロジェクトアクセサのショートカットを追加 (by @hfhbd)
- [コンパイラ] ダイアレクトに基づいてコード生成をカスタマイズ (by @MariusVolkhart)
- [JDBCドライバ] `JdbcDriver` に共通型を追加 (by @MariusVolkhart)
- [SQLite] Sqlite 3.35 のサポートを追加 (by @eygraber)
- [SQLite] `ALTER TABLE DROP COLUMN` のサポートを追加 (by @eygraber)
- [SQLite] Sqlite 3.30 ダイアレクトのサポートを追加 (by @eygraber)
- [SQLite] Sqlite における `NULLS FIRST`/`LAST` をサポート (by @eygraber)
- [HSQL] HSQL の生成句 (generated clause) サポートを追加 (by @MariusVolkhart)
- [HSQL] HSQL における名前付きパラメータのサポートを追加 (by @MariusVolkhart)
- [HSQL] HSQL インサートクエリをカスタマイズ (by @MariusVolkhart)

### Changed
- [全体] パッケージ名が com.squareup.sqldelight から app.cash.sqldelight に変更されました。
- [ランタイム] ダイアレクトを独自の独立した Gradle モジュールに移動
- [ランタイム] ドライバ実装によるクエリ通知に切り替え
- [ランタイム] デフォルトのカラムアダプタを別モジュールに抽出 (#2056, #2060)
- [コンパイラ] 各モジュールでやり直すのではなく、モジュールにクエリ実装を生成させるように変更
- [コンパイラ] 生成されたデータクラスのカスタム `toString` 生成を削除 (by @PaulWoitaschek)
- [JSドライバ] `sql.js-driver` から `sql.js` 依存関係を削除 (by @dellisd)
- [Paging] Android Paging 2 拡張を削除
- [IDEプラグイン] SQLDelight 同期中にエディタバナーを表示するように変更 (#2511)
- [IDEプラグイン] 最小サポート IntelliJ バージョンを 2021.1 に変更

### Fixed
- [ランタイム] アロケーションとポインタチェイシングを減らすためにリスナーリストをフラット化 (by @andersio)
- [IDEプラグイン] エラーへのジャンプを可能にするためエラーメッセージを修正 (by @hfhbd)
- [IDEプラグイン] 欠落していたインスペクションの説明を追加 (#2768 by @aperfilyev)
- [IDEプラグイン] `GotoDeclarationHandler` における例外を修正 (#2531, #2688, #2804 by @aperfilyev)
- [IDEプラグイン] `import` キーワードをハイライト表示 (by @aperfilyev)
- [IDEプラグイン] 未解決の Kotlin 型を修正 (#1678 by @aperfilyev)
- [IDEプラグイン] 未解決パッケージのハイライトを修正 (#2543 by @aperfilyev)
- [IDEプラグイン] プロジェクトインデックスが初期化されていない場合は、不一致カラムの検査を試みないように変更
- [IDEプラグイン] Gradle 同期が発生するまでファイルインデックスを初期化しないように変更
- [IDEプラグイン] Gradle 同期が開始された場合は SQLDelight インポートをキャンセル
- [IDEプラグイン] データベースを再生成する際、アンドゥアクションが実行されるスレッドの外で実行するように修正
- [IDEプラグイン] 参照を解決できない場合は空の Java 型を使用
- [IDEプラグイン] ファイル解析中にメインスレッドから離れ、書き込み時のみ戻るように改善
- [IDEプラグイン] 古い IntelliJ バージョンとの互換性を改善 (by @3flex)
- [IDEプラグイン] より高速なアノテーション API を使用
- [Gradleプラグイン] JS/Android プラグインランタイム追加時に明示的にサポート (by @ZacSweers)
- [Gradleプラグイン] `GenerateSchemaTask` の前に `DriverInitializer` を実行するように修正 (#5562 by @nwagu)
- [Gradleプラグイン] マイグレーションからスキーマを派生させずにマイグレーション出力タスクを登録 (#2744 by @kevincianfarini)
- [Gradleプラグイン] マイグレーションタスクがクラッシュした場合、クラッシュしたファイルを出力
- [Gradleプラグイン] 冪等な出力を保証するため、コード生成時にファイルをソート (by @ZacSweers)
- [コンパイラ] ファイルの反復処理に高速な API を使用し、PSI グラフ全体を探索しないように変更
- [コンパイラ] セレクト関数のパラメータにキーワードマングリングを追加 (#2759 by @aperfilyev)
- [コンパイラ] マイグレーションアダプタの `packageName` を修正 (by @hfhbd)
- [コンパイラ] 型ではなくプロパティにアノテーションを出力 (#2798 by @aperfilyev)
- [コンパイラ] Query サブタイプに渡す前に引数をソート (#2379 by @aperfilyev)

## [1.5.3] - 2021-11-23
[1.5.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.3

### Added
- [JDBCドライバ] サードパーティドライバ実装のために `JdbcDriver` をオープンに変更 (#2672 by @hfhbd)
- [MySQLダイアレクト] 時間増分用の欠落していた関数を追加 (#2671 by @sdoward)
- [コルーチン拡張] コルーチン拡張に M1 ターゲットを追加 (by @PhilipDukhov)

### Changed
- [Paging3拡張] `sqldelight-android-paging3` を AAR ではなく JAR として配布 (#2634 by @julioromano)
- ソフトキーワードでもあるプロパティ名にアンダースコアが付加されるようになりました。例えば、`value` は `value_` として公開されます。

### Fixed
- [コンパイラ] 重複する配列パラメータに対して変数を抽出しないように修正 (by @aperfilyev)
- [Gradleプラグイン] `kotlin.mpp.enableCompatibilityMetadataVariant` を追加 (#2628 by @martinbonnin)
- [IDEプラグイン] 使用箇所検索処理に read action が必要だった問題を修正

## [1.5.2] - 2021-10-12
[1.5.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.2

### Added
- [Gradleプラグイン] HMPP サポート (#2548 by @martinbonnin)
- [IDEプラグイン] NULL 比較インスペクションを追加 (by @aperfilyev)
- [IDEプラグイン] インスペクションサプレッサーを追加 (#2519 by @aperfilyev)
- [IDEプラグイン] 名前付きパラメータと位置パラメータの混在インスペクションを追加 (by @aperfilyev)
- [SQLiteドライバ] `mingwX86` ターゲットを追加 (#2558 by @enginegl)
- [SQLiteドライバ] M1 ターゲットを追加
- [SQLiteドライバ] `linuxX64` サポートを追加 (#2456 by @chippmann)
- [MySQLダイアレクト] MySQL に `ROW_COUNT` 関数を追加 (#2523)
- [PostgreSQLダイアレクト] PostgreSQL のリネーム、カラム削除を追加 (by @pabl0rg)
- [PostgreSQLダイアレクト] PostgreSQL グラマーが `CITEXT` を認識しない問題を修正
- [PostgreSQLダイアレクト] `TIMESTAMP WITH TIME ZONE` と `TIMESTAMPTZ` を追加
- [PostgreSQLダイアレクト] PostgreSQL `GENERATED` カラムのグラマーを追加
- [ランタイム] `AfterVersion` のパラメータとして `SqlDriver` を提供 (#2534, 2614 by @ahmedre)

### Changed
- [Gradleプラグイン] Gradle 7.0 を明示的に要求 (#2572 by @martinbonnin)
- [Gradleプラグイン] `VerifyMigrationTask` が Gradle の最新状態チェック (up-to-date checks) をサポートするように修正 (#2533 by @3flex)
- [IDEプラグイン] Null 許容型と非 Null 型を結合する際、「Join compares two columns of different types」と警告しないように変更 (#2550 by @pchmielowski)
- [IDEプラグイン] カラム型における小文字の 'as' に関するエラーを明確化 (by @aperfilyev)

### Fixed
- [IDEプラグイン] プロジェクトがすでに破棄されている場合は新しいダイアレクトで再パースしないように修正 (#2609)
- [IDEプラグイン] 関連する仮想ファイルが null の場合、モジュールも null になるように修正 (#2607)
- [IDEプラグイン] 未使用クエリ検査中のクラッシュを回避 (#2610)
- [IDEプラグイン] データベース同期の書き込みを write action 内で実行するように修正 (#2605)
- [IDEプラグイン] IDE に SQLDelight 同期をスケジュールさせるように変更
- [IDEプラグイン] `JavaTypeMixin` における NPE を修正 (#2603 by @aperfilyev)
- [IDEプラグイン] `MismatchJoinColumnInspection` における `IndexOutOfBoundsException` を修正 (#2602 by @aperfilyev)
- [IDEプラグイン] `UnusedColumnInspection` の説明を追加 (#2600 by @aperfilyev)
- [IDEプラグイン] `PsiElement.generatedVirtualFiles` を read action でラップ (#2599 by @aperfilyev)
- [IDEプラグイン] 不要な非 Null キャストを削除 (#2596)
- [IDEプラグイン] 使用箇所検索における Null を適切に処理 (#2595)
- [IDEプラグイン] Android 用生成ファイルの IDE オートコンプリートを修正 (#2573 by @martinbonnin)
- [IDEプラグイン] `SqlDelightGotoDeclarationHandler` における NPE を修正 (by @aperfilyev)
- [IDEプラグイン] `INSERT` 文内の引数で Kotlin キーワードをマングリングするように修正 (#2433 by @aperfilyev)
- [IDEプラグイン] `SqlDelightFoldingBuilder` における NPE を修正 (#2382 by @aperfilyev)
- [IDEプラグイン] `CopyPasteProcessor` における `ClassCastException` をキャッチ (#2369 by @aperfilyev)
- [IDEプラグイン] update ライブテンプレートを修正 (by @IliasRedissi)
- [IDEプラグイン] インテンションアクションに説明を追加 (#2489 by @aperfilyev)
- [IDEプラグイン] テーブルが見つからない場合の `CreateTriggerMixin` における例外を修正 (by @aperfilyev)
- [コンパイラ] テーブル作成文をトポロジカルソート
- [コンパイラ] ディレクトリに対して `forDatabaseFiles` コールバックを呼び出すのを停止 (#2532)
- [Gradleプラグイン] `generateDatabaseInterface` タスクの依存関係を潜在的な消費者に伝搬 (#2518 by @martinbonnin)

## [1.5.1] - 2021-07-16
[1.5.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.1

### Added
- [PostgreSQLダイアレクト] PostgreSQL JSONB と `ON CONFLICT DO NOTHING` (by @satook)
- [PostgreSQLダイアレクト] PostgreSQL `ON CONFLICT (column, ...) DO UPDATE` のサポートを追加 (by @satook)
- [MySQLダイアレクト] MySQL 生成カラムのサポートを追加 (by @JGulbronson)
- [Nativeドライバ] `watchosX64` サポートを追加
- [IDEプラグイン] パラメータ型とアノテーションを追加 (by @aperfilyev)
- [IDEプラグイン] 'select all' クエリ生成アクションを追加 (by @aperfilyev)
- [IDEプラグイン] オートコンプリートにカラム型を表示 (by @aperfilyev)
- [IDEプラグイン] オートコンプリートにアイコンを追加 (by @aperfilyev)
- [IDEプラグイン] 'select by primary key' クエリ生成アクションを追加 (by @aperfilyev)
- [IDEプラグイン] 'insert into' クエリ生成アクションを追加 (by @aperfilyev)
- [IDEプラグイン] カラム名、文の識別子、関数名のハイライトを追加 (by @aperfilyev)
- [IDEプラグイン] 残りのクエリ生成アクションを追加 (#489 by @aperfilyev)
- [IDEプラグイン] `insert-stmt` からのパラメータヒントを表示 (by @aperfilyev)
- [IDEプラグイン] テーブルエイリアスインテンションアクション (by @aperfilyev)
- [IDEプラグイン] カラム名修飾インテンション (by @aperfilyev)
- [IDEプラグイン] Kotlin プロパティへの宣言ジャンプ (by @aperfilyev)

### Changed
- [Nativeドライバ] 可能な場合には凍結 (freezing) や共有可能なデータ構造を避けることで、ネイティブトランザクションのパフォーマンスを改善 (by @andersio)
- [Paging 3] Paging3 バージョンを 3.0.0 stable に引き上げ
- [JSドライバ] sql.js を 1.5.0 にアップグレード

### Fixed
- [JDBC SQLiteドライバ] 接続の `close()` を呼び出す前に `ThreadLocal` をクリアするように修正 (#2444 by @hannesstruss)
- [RX拡張] サブスクリプション/破棄のレースリークを修正 (#2403 by @pyricau)
- [コルーチン拡張] 通知前にクエリリスナーを登録するように修正
- [コンパイラ] Kotlin 出力ファイルを一貫させるため `notifyQueries` をソート (by @thomascjy)
- [コンパイラ] select クエリクラスのプロパティに `@JvmField` アノテーションを付けないように修正 (by @eygraber)
- [IDEプラグイン] インポート最適化を修正 (#2350 by @aperfilyev)
- [IDEプラグイン] 未使用カラム検査を修正 (by @aperfilyev)
- [IDEプラグイン] インポート検査とクラスアノテーターにネストされたクラスのサポートを追加 (by @aperfilyev)
- [IDEプラグイン] `CopyPasteProcessor` における NPE を修正 (#2363 by @aperfilyev)
- [IDEプラグイン] `InlayParameterHintsProvider` におけるクラッシュを修正 (#2359 by @aperfilyev)
- [IDEプラグイン] `CREATE TABLE` 文に任意のテキストをコピー＆ペーストした際の空白行の挿入を修正 (#2431 by @aperfilyev)

## [1.5.0] - 2021-04-23
[1.5.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.0

### Added
- [SQLite Javascriptドライバ] `sqljs-driver` の公開を有効化 (#1667 by @dellisd)
- [Paging3拡張] Android Paging 3 ライブラリ用拡張 (#1786 by @kevincianfarini)
- [MySQLダイアレクト] MySQL の `ON DUPLICATE KEY UPDATE` 衝突解決のサポートを追加 (by @rharter)
- [SQLiteダイアレクト] SQLite `offsets()` のコンパイラサポートを追加 (by @qjroberts)
- [IDEプラグイン] 未知の型に対するインポートクイックフィックスを追加 (#683 by @aperfilyev)
- [IDEプラグイン] 未使用インポート検査を追加 (#1161 by @aperfilyev)
- [IDEプラグイン] 未使用クエリ検査を追加 (by @aperfilyev)
- [IDEプラグイン] 未使用カラム検査を追加 (#569 by @aperfilyev)
- [IDEプラグイン] コピー＆ペースト時にインポートを自動的に保持するように修正 (#684 by @aperfilyev)
- [IDEプラグイン] Gradle/IntelliJ プラグインバージョン間に非互換性がある場合にバルーンを表示
- [IDEプラグイン] `Insert Into ... VALUES(?)` パラメータヒントを追加 (#506 by @aperfilyev)
- [IDEプラグイン] インラインパラメータヒントを追加 (by @aperfilyev)
- [ランタイム] コールバックを伴うマイグレーション実行用の API をランタイムに追加 (#1844)

### Changed
- [コンパイラ] "IS NOT NULL" クエリをスマートキャストするように変更 (#867)
- [コンパイラ] 実行時に失敗するキーワードに対する保護を追加 (#1471, #1629)
- [Gradleプラグイン] Gradle プラグインのサイズを 60mb から 13mb に削減
- [Gradleプラグイン] Android バリアントを適切にサポートし、KMM ターゲット固有の sql サポートを削除 (#1039)
- [Gradleプラグイン] minsdk に基づいて最小 sqlite バージョンを選択 (#1684)
- [Nativeドライバ] Native ドライバの接続プールとパフォーマンスのアップデート

### Fixed
- [コンパイラ] ラムダ前の NBSP を修正 (by @oldergod)
- [コンパイラ] 生成された `bind*` および `cursor.get*` 文における互換性のない型を修正
- [コンパイラ] SQL 句が適合型 (adapted type) を保持するように修正 (#2067)
- [コンパイラ] `NULL` キーワードのみのカラムは Null 許容になるように修正
- [コンパイラ] 型アノテーション付きのマッパーラムダを生成しないように修正 (#1957)
- [コンパイラ] カスタムクエリが衝突する場合、ファイル名をパッケージサフィックスとして追加するように修正 (#1057, #1278)
- [コンパイラ] 外部キーのカスケードがクエリリスナーに通知されるように修正 (#1325, #1485)
- [コンパイラ] 同じ型の 2 つをユニオンする場合、テーブル型を返すように修正 (#1342)
- [コンパイラ] `ifnull` および `coalesce` へのパラメータが Null 許容になるように修正 (#1263)
- [コンパイラ] 式に対してクエリによって課された Null 許容性を正しく使用するように修正
- [MySQLダイアレクト] MySQL `if` 文をサポート
- [PostgreSQLダイアレクト] PostgreSQL において `NUMERIC` および `DECIMAL` を `Double` として取得するように修正 (#2118)
- [SQLiteダイアレクト] `UPSERT` 通知が `BEFORE`/`AFTER UPDATE` トリガーを考慮するように修正 (#2198 by @andersio)
- [SQLiteドライバ] メモリ内処理でない限り、SqliteDriver 内のスレッドに複数の接続を使用するように修正 (#1832)
- [JDBCドライバ] JDBC ドライバが `autoCommit` を true と仮定する問題を修正 (#2041)
- [JDBCドライバ] 例外発生時に確実に接続を閉じるように修正 (#2306)
- [IDEプラグイン] パスセパレータのバグによる Windows 上での GoToDeclaration/FindUsages の不具合を修正 (#2054 by @angusholder)
- [IDEプラグイン] IDE でクラッシュする代わりに Gradle エラーを無視するように変更
- [IDEプラグイン] sqldelight ファイルが非 sqldelight モジュールに移動された場合、コード生成を試みないように変更
- [IDEプラグイン] IDE でのコード生成エラーを無視
- [IDEプラグイン] 負のサブストリングを試みないように修正 (#2068)
- [IDEプラグイン] Gradle アクション実行前にプロジェクトが破棄されていないか確認 (#2155)
- [IDEプラグイン] Null 許容型に対する算術演算も Null 許容になるように修正 (#1853)
- [IDEプラグイン] 'expand * intention' が追加のプロジェクションでも動作するように修正 (#2173 by @aperfilyev)
- [IDEプラグイン] GoTo 中に Kotlin 解決が失敗した場合、sqldelight ファイルへの移動を試みないように変更
- [IDEプラグイン] IntelliJ が SQLDelight のインデックス作成中に例外に遭遇してもクラッシュしないように修正
- [IDEプラグイン] IDE でのコード生成前のエラー検出中に発生する例外を処理
- [IDEプラグイン] IDE プラグインを Dynamic Plugins と互換性を持たせるように修正 (#1536)
- [Gradleプラグイン] WorkerApi を使用したデータベース生成におけるレースコンディションを修正 (#2062 by @stephanenicolas)
- [Gradleプラグイン] `classLoaderIsolation` がカスタム JDBC の使用を妨げる問題を修正 (#2048 by @benasher44)
- [Gradleプラグイン] `packageName` 欠落のエラーメッセージを改善 (by @vanniktech)
- [Gradleプラグイン] SQLDelight が IntelliJ 依存関係を buildscript クラスパスに漏洩させる問題を修正 (#1998)
- [Gradleプラグイン] Gradle ビルドキャッシュを修正 (#2075)
- [Gradleプラグイン] Gradle プラグインで `kotlin-native-utils` に依存しないように修正 (by @ilmat192)
- [Gradleプラグイン] マイグレーションファイルのみが存在する場合でもデータベースを書き出すように修正 (#2094)
- [Gradleプラグイン] 最終的なコンパイルユニットでダイヤモンド依存関係が 1 回だけ取得されるように修正 (#1455)

SQLDelight のインフラ改善に多大な貢献をした @3flex に感謝します。

## [1.4.4] - 2020-10-08
[1.4.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.4

### Added
- [PostgreSQLダイアレクト] `WITH` 内でのデータ変更文をサポート
- [PostgreSQLダイアレクト] `substring` 関数をサポート
- [Gradleプラグイン] SQLDelight コンパイル中のマイグレーション検証を有効にする `verifyMigrations` フラグを追加 (#1872)

### Changed
- [コンパイラ] 非 SQLite ダイアレクトにおいて SQLite 固有の関数を未知としてフラグ付け
- [Gradleプラグイン] sqldelight プラグインが適用されているがデータベースが設定されていない場合に警告を表示 (#1421)

### Fixed
- [コンパイラ] `ORDER BY` 句でカラム名をバインドした際にエラーを報告するように修正 (#1187 by @eygraber)
- [コンパイラ] データベースインターフェース生成時にレジストリ警告が表示される問題を修正 (#1792)
- [コンパイラ] case 文の誤った型推論を修正 (#1811)
- [コンパイラ] バージョンのないマイグレーションファイルに対してより適切なエラーを表示 (#2006)
- [コンパイラ] 一部のデータベース型 `ColumnAdapter` において整列 (marshal) に必要なデータベース型が誤っている問題を修正 (#2012)
- [コンパイラ] `CAST` の Null 許容性を修正 (#1261)
- [コンパイラ] クエリラッパーにおける多数の名前のシャドウイング警告を修正 (#1946 by @eygraber)
- [コンパイラ] 生成されたコードが完全修飾名を使用している問題を修正 (#1939)
- [IDEプラグイン] Gradle 同期から SQLDelight コード生成をトリガーするように修正
- [IDEプラグイン] .sq ファイル変更時にプラグインがデータベースインターフェースを再生成しない問題を修正 (#1945)
- [IDEプラグイン] ファイルを新しいパッケージに移動する際の問題を修正 (#444)
- [IDEプラグイン] カーソルの移動先がない場合は、クラッシュせずに何もしないように修正 (#1994)
- [IDEプラグイン] Gradle プロジェクト外のファイルに対して空のパッケージ名を使用するように修正 (#1973)
- [IDEプラグイン] 無効な型に対して正常に失敗するように修正 (#1943)
- [IDEプラグイン] 未知の式に遭遇した際により適切なエラーメッセージを投げるように修正 (#1958)
- [Gradleプラグイン] SQLDelight が IntelliJ 依存関係を buildscript クラスパスに漏洩させる問題を修正 (#1998)
- [Gradleプラグイン] *.sq ファイルにメソッドドキュメントを追加した際の "JavadocIntegrationKt not found" コンパイルエラーを修正 (#1982)
- [Gradleプラグイン] SQLDelight Gradle プラグインが Configuration Caching (CoCa) をサポートしていない問題を修正 (#1947 by @stephanenicolas)
- [SQLite JDBCドライバ] SQLException: database in auto-commit mode (#1832)
- [コルーチン拡張] coroutines-extensions の IR バックエンドを修正 (#1918 by @dellisd)

## [1.4.3] - 2020-09-04
[1.4.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.3

### Added
- [MySQLダイアレクト] MySQL `last_insert_id` 関数のサポートを追加 (by @lawkai)
- [PostgreSQLダイアレクト] `SERIAL` データ型をサポート (by @veyndan & @felipecsl)
- [PostgreSQLダイアレクト] PostgreSQL `RETURNING` をサポート (by @veyndan)

### Fixed
- [MySQLダイアレクト] MySQL `AUTO_INCREMENT` をデフォルト値を持つものとして扱うように修正 (#1823)
- [コンパイラ] Upsert 文のコンパイルエラーを修正 (#1809 by @eygraber)
- [コンパイラ] 無効な Kotlin が生成される問題を修正 (#1925 by @eygraber)
- [コンパイラ] 未知の関数に対してより適切なエラーメッセージを表示 (#1843)
- [コンパイラ] `instr` の第 2 パラメータの型として文字列を公開
- [IDEプラグイン] IDE プラグインのデーモン肥大化と UI スレッドの停滞を修正 (#1916)
- [IDEプラグイン] モジュールが null のシナリオを処理 (#1902)
- [IDEプラグイン] 未設定の sq ファイルにおいてパッケージ名として空文字列を返すように修正 (#1920)
- [IDEプラグイン] グループ化されたステートメントを修正し、それらの統合テストを追加 (#1820)
- [IDEプラグイン] 要素のモジュールを見つけるために内蔵の `ModuleUtil` を使用するように修正 (#1854)
- [IDEプラグイン] ルックアップに有効な要素のみを追加するように修正 (#1909)
- [IDEプラグイン] 親要素が null になり得る問題を修正 (#1857)

## [1.4.2] - 2020-08-27
[1.4.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.2

### Added
- [ランタイム] 新しい JS IR バックエンドをサポート
- [Gradleプラグイン] `generateSqlDelightInterface` Gradle タスクを追加 (by @vanniktech)
- [Gradleプラグイン] `verifySqlDelightMigration` Gradle タスクを追加 (by @vanniktech)

### Fixed
- [IDEプラグイン] IDE と Gradle 間のデータ共有を容易にするため Gradle tooling API を使用
- [IDEプラグイン] スキーマ派生をデフォルトで false に設定
- [IDEプラグイン] `commonMain` ソースセットを正しく取得するように修正
- [MySQLダイアレクト] `mySqlFunctionType()` に minute を追加 (by @maaxgr)

## [1.4.1] - 2020-08-21
[1.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.1

### Added
- [ランタイム] Kotlin 1.4.0 をサポート (#1859)

### Changed
- [Gradleプラグイン] AGP 依存関係を `compileOnly` に変更 (#1362)

### Fixed
- [コンパイラ] カラム定義ルールおよびテーブルインターフェースジェネレータにオプションの javadoc を追加 (#1224 by @endanke)
- [SQLiteダイアレクト] sqlite FTS5 補助関数 `highlight`、`snippet`、および `bm25` のサポートを追加 (by @drampelt)
- [MySQLダイアレクト] MySQL `bit` データ型をサポート
- [MySQLダイアレクト] MySQL バイナリリテラルをサポート
- [PostgreSQLダイアレクト] `sql-psi` から `SERIAL` を公開 (by @veyndan)
- [PostgreSQLダイアレクト] `BOOLEAN` データ型を追加 (by @veyndan)
- [PostgreSQLダイアレクト] `NULL` カラム制約を追加 (by @veyndan)
- [HSQLダイアレクト] HSQL に `AUTO_INCREMENT` サポートを追加 (by @rharter)

## [1.4.0] - 2020-06-22
[1.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.0

### Added
- [MySQLダイアレクト] MySQL サポート (by @JGulbronson & @veyndan)
- [PostgreSQLダイアレクト] 実験的な PostgreSQL サポート (by @veyndan)
- [HSQLダイアレクト] 実験的な H2 サポート (by @MariusVolkhart)
- [SQLiteダイアレクト] SQLite FTS5 サポート (by @benasher44 & @jpalawaga)
- [SQLiteダイアレクト] `ALTER TABLE RENAME COLUMN` をサポート (#1505 by @angusholder)
- [IDE] マイグレーション (.sqm) ファイルの IDE サポート
- [IDE] 内蔵の SQL ライブテンプレートを模した SQLDelight ライブテンプレートを追加 (#1154 by @veyndan)
- [IDE] 新しい SqlDelight ファイルアクションを追加 (#42 by @romtsn)
- [ランタイム] 結果を返すトランザクション用の `transactionWithReturn` API
- [コンパイラ] .sq ファイル内で複数の SQL ステートメントをグループ化するための構文
- [コンパイラ] マイグレーションファイルからのスキーマ生成をサポート
- [Gradleプラグイン] マイグレーションファイルを有効な SQL として出力するタスクを追加

### Changed
- [ドキュメント] ドキュメントウェブサイトの全面刷新 (by @saket)
- [Gradleプラグイン] サポートされていないダイアレクトのエラーメッセージを改善 (by @veyndan)
- [IDE] ダイアレクトに基づいてファイルアイコンを動的に変更 (by @veyndan)
- [JDBCドライバ] `javax.sql.DataSource` から `JdbcDriver` コンストラクタを公開 (#1614)

### Fixed
- [コンパイラ] テーブル上の Javadoc サポート、および 1 つのファイル内の複数の javadoc を修正 (#1224)
- [コンパイラ] 合成カラムへの値の挿入を可能に修正 (#1351)
- [コンパイラ] ディレクトリ名のサニタイズにおける不一致を修正 (by @ZacSweers)
- [コンパイラ] 合成カラムが結合をまたいで Null 許容性を保持するように修正 (#1656)
- [コンパイラ] 削除文を delete キーワードに固定 (#1643)
- [コンパイラ] クォート処理を修正 (#1525 by @angusholder)
- [コンパイラ] between 演算子が式を適切に再帰するように修正 (#1279)
- [コンパイラ] インデックス作成時のテーブル/カラム欠落に対してより適切なエラーを表示 (#1372)
- [コンパイラ] 結合制約において外部クエリのプロジェクションを使用可能に修正 (#1346)
- [Nativeドライバ] `execute` に `transationPool` を使用するように修正 (by @benasher44)
- [JDBCドライバ] sqlite の代わりに jdbc トランザクション API を使用するように修正 (#1693)
- [IDE] `virtualFile` 参照が常に元のファイルになるように修正 (#1782)
- [IDE] Bugsnag にエラーを報告する際に正しいスロー可能オブジェクトを使用するように修正 (#1262)
- [Paging拡張] リークしていた `DataSource` を修正 (#1628)
- [Gradleプラグイン] スキーマ生成時に出力 db ファイルがすでに存在する場合、削除するように修正 (#1645)
- [Gradleプラグイン] ギャップがある場合にマイグレーション検証を失敗させるように修正
- [Gradleプラグイン] 設定したファイルインデックスを明示的に使用するように修正 (#1644)

## [1.3.0] - 2020-04-03
[1.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.3.0

* 新機能: [Gradle] コンパイル対象の SQL ダイアレクトを指定する `dialect` プロパティ。
* 新機能: [コンパイラ] #1009 mysql ダイアレクトの実験的サポート。
* 新機能: [コンパイラ] #1436 sqlite:3.24 ダイアレクトと upsert のサポート。
* 新機能: [JDBCドライバ] sqlite jvm ドライバから JDBC ドライバを分割。
* 修正: [コンパイラ] #1199 任意の長さのラムダをサポート。
* 修正: [コンパイラ] #1610 `avg()` の戻り値の型を Null 許容に修正。
* 修正: [IntelliJ] #1594 Windows 上で Goto と Find Usages を破壊していたパスセパレータの処理を修正。

## [1.2.2] - 2020-01-22
[1.2.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.2

* 新機能: [ランタイム] Windows (mingW)、tvOS、watchOS、および macOS アーキテクチャのサポート。
* 修正: [コンパイラ] `sum()` の戻り値の型は Null 許容であるべき。
* 修正: [Paging] レースコンディションを避けるため、`QueryDataSourceFactory` に `Transacter` を渡すように修正。
* 修正: [IntelliJプラグイン] ファイルのパッケージ名を探す際に依存関係を検索しないように修正。
* 修正: [Gradle] #862 Gradle のバリデータログをデバッグレベルに変更。
* 改善: [Gradle] `GenerateSchemaTask` を Gradle worker を使用するように変換。
* 注意: `sqldelight-runtime` アーティファクトは `runtime` にリネームされました。

## [1.2.1] - 2019-12-11
[1.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.1

* 修正: [Gradle] Kotlin Native 1.3.60 サポート。
* 修正: [Gradle] #1287 同期時の警告。
* 修正: [コンパイラ] #1469 クエリ用の `SynetheticAccessor` 作成。
* 修正: [JVMドライバ] メモリリークを修正。
* 注意: coroutine extension アーティファクトには、buildscript に kotlinx bintray maven リポジトリを追加する必要があります。

## [1.2.0] - 2019-08-30
[1.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.0

* 新機能: [ランタイム] 安定した Flow API。
* 修正: [Gradle] Kotlin Native 1.3.50 サポート。
* 修正: [Gradle] #1380 クリーンビルドが時々失敗する問題を修正。
* 修正: [Gradle] #1348 検証タスク実行時に "Could not retrieve functions" と表示される問題を修正。
* 修正: [Compile] #1405 クエリに FTS テーブルの結合が含まれている場合にビルドできない問題を修正。
* 修正: [Gradle] #1266 複数のデータベースモジュールがある場合に、散発的に Gradle ビルドが失敗する問題を修正。

## [1.1.4] - 2019-07-11
[1.1.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.4

* 新機能: [ランタイム] 実験的な Kotlin Flow API。
* 修正: [Gradle] Kotlin/Native 1.3.40 互換性。
* 修正: [Gradle] #1243 Gradle のオンデマンド設定時における SQLDelight の使用に関する修正。
* 修正: [Gradle] #1385 漸進的アノテーション処理 (incremental annotation processing) における SQLDelight の使用に関する修正。
* 修正: [Gradle] Gradle タスクのキャッシュを有効化。
* 修正: [Gradle] #1274 Kotlin DSL での sqldelight 拡張の使用を有効化。
* 修正: [コンパイラ] 各クエリに対して一意の ID が決定論的に生成されるように修正。
* 修正: [コンパイラ] トランザクションが完了したときにのみ、待機中のクエリに通知するように修正。
* 修正: [JVMドライバ] #1370 `JdbcSqliteDriver` ユーザーに DB URL の提供を強制。

## [1.1.3] - 2019-04-14
[1.1.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.3

* Gradle Metadata 1.0 リリース。

## [1.1.2] - 2019-04-14
[1.1.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.2

* 新機能: [ランタイム] #1267 ロギングドライバデコレータ。
* 修正: [コンパイラ] #1254 2^16 文字を超える文字列リテラルを分割するように修正。
* 修正: [Gradle] #1260 生成されたソースが Multiplatform プロジェクトにおいて iOS ソースとして認識される問題を修正。
* 修正: [IDE] #1290 `CopyAsSqliteAction.kt:43` における `kotlin.KotlinNullPointerException`。
* 修正: [Gradle] #1268 最近のバージョンで `linkDebugFrameworkIos*` タスクが失敗する問題を修正。

## [1.1.1] - 2019-03-01
[1.1.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.1

* 修正: [Gradle] Android プロジェクトのモジュール依存関係のコンパイルを修正。
* 修正: [Gradle] #1246 `afterEvaluate` で api 依存関係をセットアップするように修正。
* 修正: [コンパイラ] 配列型が適切に出力されるように修正。

## [1.1.0] - 2019-02-27
[1.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.0

* 新機能: [Gradle] #502 スキーマモジュールの依存関係を指定可能に変更。
* 改善: [コンパイラ] #1111 テーブルエラーが他のエラーより前にソートされるように改善。
* 修正: [コンパイラ] #1225 `REAL` リテラルに対して正しい型を返すように修正。
* 修正: [コンパイラ] #1218 `docid` がトリガーを通じて伝搬するように修正。

## [1.0.3] - 2019-01-30
[1.0.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.3

* 改善: [ランタイム] #1195 Native ドライバ/ランタイム Arm32。
* 改善: [ランタイム] #1190 `Query` 型からマッパーを公開。

## [1.0.2] - 2019-01-26
[1.0.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.2

* 修正: [Gradleプラグイン] Kotlin 1.3.20 に更新。
* 修正: [ランタイム] トランザクションが例外を飲み込まないように修正。

## [1.0.1] - 2019-01-21
[1.0.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.1

* 改善: [Nativeドライバ] `DatabaseConfiguration` にディレクトリ名を渡せるように変更。
* 改善: [コンパイラ] #1173 パッケージのないファイルがコンパイルに失敗するように修正。
* 修正: [IDE] IDE エラーを Square に適切に報告するように修正。
* 修正: [IDE] #1162 同じパッケージ内の型がエラーとして表示されるが正常に動作する問題を修正。
* 修正: [IDE] #1166 テーブルのリネームが NPE で失敗する問題を修正。
* 修正: [コンパイラ] #1167 `UNION` と `SELECT` を含む複雑な SQL ステートメントのパース試行時に例外が発生する問題を修正。

## [1.0.0] - 2019-01-08
[1.0.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.0

* 新機能: 生成コードの全面刷新（Kotlin 化）。
* 新機能: RxJava2 拡張アーティファクト。
* 新機能: Android Paging 拡張アーティファクト。
* 新機能: Kotlin Multiplatform サポート。
* 新機能: Android、iOS、および JVM SQLite ドライバアーティファクト。
* 新機能: トランザクション API。

## [0.7.0] - 2018-02-12
[0.7.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.7.0

 * 新機能: 生成コードが Support SQLite ライブラリのみを使用するように更新されました。すべてのクエリが、生の文字列ではなくステートメントオブジェクトを生成するようになりました。
 * 新機能: IDE におけるステートメントの折りたたみ。
 * 新機能: Boolean 型が自動的に処理されるようになりました。
 * 修正: コード生成から非推奨の marshal を削除。
 * 修正: 'avg' SQL 関数の型マッピングを `REAL` に修正。
 * 修正: 'julianday' SQL 関数の検出を修正。

## [0.6.1] - 2017-03-22
[0.6.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.6.1

 * 新機能: 引数のない Delete、Update、および Insert ステートメントに対してコンパイル済みステートメントが生成されるようになりました。
 * 修正: サブクエリで使用されている View 内の Using 句がエラーにならないように修正。
 * 修正: 生成された Mapper からの重複した型を削除。
 * 修正: サブクエリを引数に対してチェックする式で使用可能に修正。

## [0.6.0] - 2017-03-06
[0.6.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.6.0

 * 新機能: Select クエリが、文字列定数ではなく `SqlDelightStatement` ファクトリとして公開されるようになりました。
 * 新機能: クエリの JavaDoc が、ステートメントおよびマッパーファクトリにコピーされるようになりました。
 * 新機能: View 名の文字列定数を出力するように変更。
 * 修正: ファクトリを必要とする View に対するクエリにおいて、それらのファクトリを引数として正しく要求するように修正。
 * 修正: insert への引数の数が指定されたカラムの数と一致することを検証するように修正。
 * 修正: where 句で使用される blob リテラルを適切にエンコードするように修正。
 * このリリースには Gradle 3.3 以降が必要です。

## [0.5.1] - 2016-10-24
[0.5.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.5.1

 * 新機能: コンパイル済みステートメントが抽象型を継承するようになりました。
 * 修正: パラメータ内のプリミティブ型が Null 許容の場合にボックス化されるように修正。
 * 修正: bind args に必要なすべてのファクトリがファクトリメソッドに存在するように修正。
 * 修正: エスケープされたカラム名が正しく整列 (marshal) されるように修正。

## [0.5.0] - 2016-10-19
[0.5.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.5.0

 * 新機能: SQLite 引数を Factory を通じて型セーフに渡せるようになりました。
 * 新機能: IntelliJ プラグインが .sq ファイルのフォーマットを実行するようになりました。
 * 新機能: SQLite タイムスタンプリテラルのサポート。
 * 修正: パラメータ化された型が IntelliJ でクリック可能になるように修正。
 * 修正: エスケープされたカラム名が Cursor から取得した際に、`RuntimeException` を投げないように修正。
 * 修正: Gradle プラグインが例外出力時にクラッシュしないように修正。

## [0.4.4] - 2016-07-20
[0.4.4]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.4

 * 新機能: カラムの Java 型として short をネイティブサポート。
 * 新機能: 生成されたマッパーおよびファクトリメソッドに Javadoc を追加。
 * 修正: `group_concat` および `nullif` 関数が適切な Null 許容性を持つように修正。
 * 修正: Android Studio 2.2-alpha との互換性を修正。
 * 修正: `WITH RECURSIVE` でプラグインがクラッシュしないように修正。

## [0.4.3] - 2016-07-07
[0.4.3]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.3

 * 新機能: コンパイルエラーがソースファイルにリンクされるようになりました。
 * 新機能: 右クリックで SQLDelight コードを有効な SQLite としてコピー可能になりました。
 * 新機能: 名前付きステートメントの Javadoc が生成された String に表示されるようになりました。
 * 修正: 生成されたビューモデルに Null 許容性アノテーションが含まれるように修正。
 * 修正: ユニオンから生成されたコードが、すべての可能なカラムをサポートするために適切な型と Null 許容性を持つように修正。
 * 修正: `sum` および `round` SQLite 関数が適切な型を持つように修正。
 * 修正: `CAST`、内部セレクトに関するバグを修正。
 * 修正: `CREATE TABLE` 文におけるオートコンプリートを修正。
 * 修正: SQLite キーワードをパッケージで使用可能に修正。

## [0.4.2] - 2016-06-16
[0.4.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.2

 * 新機能: Marshal を Factory から作成可能になりました。
 * 修正: IntelliJ プラグインが適切なジェネリック順序でファクトリメソッドを生成するように修正。
 * 修正: 関数名に任意のケース（大文字小文字）を使用可能に修正。

## [0.4.1] - 2016-06-14
[0.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.1

 * 修正: IntelliJ プラグインが適切なジェネリック順序でクラスを生成するように修正。
 * 修正: カラム定義に任意のケース（大文字小文字）を使用可能に修正。

## [0.4.0] - 2016-06-14
[0.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.0

 * 新機能: マッパーがテーブル単位ではなくクエリ単位で生成されるようになりました。
 * 新機能: .sq ファイル内で Java 型をインポート可能になりました。
 * 新機能: SQLite 関数が検証されるようになりました。
 * 修正: 重複エラーを削除。
 * 修正: 大文字のカラム名および Java キーワードのカラム名がエラーにならないように修正。

## [0.3.2] - 2016-05-14
[0.3.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.2

 * 新機能: オートコンプリートと使用箇所検索がビューとエイリアスに対して機能するようになりました。
 * 修正: コンパイル時の検証において、セレクト内での関数の使用を許可。
 * 修正: デフォルト値のみを宣言する insert 文をサポート。
 * 修正: SQLDelight を使用していないプロジェクトがインポートされた際にプラグインがクラッシュしないように修正。

## [0.3.1] - 2016-04-27
[0.3.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.1

  * 修正: メソッドリファレンスによる実行時の Illegal Access 例外を避けるため、インターフェースの可視性を public に戻しました。
  * 修正: サブ式が適切に評価されるように修正。

## [0.3.0] - 2016-04-26
[0.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.0

  * 新機能: カラム定義で SQLite 型を使用し、Java 型を指定するための追加の 'AS' 制約を使用できるようになりました。
  * 新機能: IDE からバグレポートを送信可能になりました。
  * 修正: オートコンプリートが適切に機能するように修正。
  * 修正: .sq ファイルの編集時に SQLDelight モデルファイルが更新されるように修正。
  * 削除: アタッチされたデータベースのサポートを終了。

## [0.2.2] - 2016-03-07
[0.2.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.2

 * 新機能: 挿入、更新、削除、インデックス、およびトリガー文で使用されるカラムのコンパイル時検証。
 * 修正: ファイルの移動/作成時に IDE プラグインがクラッシュしないように修正。

## [0.2.1] - 2016-03-07
[0.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.1

 * 新機能: Ctrl+`/` (OSX では Cmd+`/`) で選択した行のコメントをトグル可能になりました。
 * 新機能: SQL クエリで使用されるカラムのコンパイル時検証。
 * 修正: IDE と Gradle プラグインの両方で Windows パスをサポート。

## [0.2.0] - 2016-02-29
[0.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.0

 * 新機能: Marshal クラスにコピーコンストラクタを追加。
 * 新機能: Kotlin 1.0 final にアップデート。
 * 修正: 'sqldelight' フォルダ構造の問題を、ビルドを失敗させない方法で報告するように修正。
 * 修正: `table_name` という名前のカラムを禁止。それらから生成された定数がテーブル名定数と衝突するためです。
 * 修正: `.sq` ファイルが開かれているかどうかにかかわらず、IDE プラグインがモデルクラスを即座に生成することを保証するように修正。
 * 修正: IDE と Gradle プラグインの両方で Windows パスをサポート。

## [0.1.2] - 2016-02-13
[0.1.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.2

 * 修正: ほとんどのプロジェクトで Gradle プラグインを使用できなくしていたコードを削除。
 * 修正: Antlr ランタイムに対する不足していたコンパイラ依存関係を追加。

## [0.1.1] - 2016-02-12
[0.1.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.1

 * 修正: Gradle プラグインが自身と同じバージョンのランタイムを指すように修正。

## [0.1.0] - 2016-02-12
[0.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.0

初期リリース。