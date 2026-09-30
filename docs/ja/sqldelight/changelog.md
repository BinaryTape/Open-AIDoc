# 変更履歴 (Change Log)

## 未リリース (Unreleased) {id="unreleased"}

### 追加 (Added) {id="added"}

- まだありません！

### 変更 (Changed) {id="changed"}

- [Gradle Plugin] コード生成タスク全体でパース済みの `.sq` ファイルをメモリ上に保持し、ガベージコレクション後に再パースされないようにしました。これにより、大規模プロジェクトでのコード生成が高速化されます (#6374 by @C2H6O)
- [IntelliJ Plugin] クラッシュ報告先を独自のBugsnagインスタンスからJetBrains Marketplaceに変更しました (#6376 by @JakeWharton)

### 修正 (Fixed) {id="fixed"}

- [IntelliJ Plugin] IntelliJ APIの使用方法を変更し、プラグイン公開時の違反を修正しました (#6366 #6368 by @griffio)

## [2.4.0] - 2026-09-17 {id="2-4-0-2026-09-17"}
[2.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0

### 追加 (Added)
- [Native Driver] `inMemoryDriver` に `extendedConfig` パラメータを追加しました (#5539 by @GuilhE)
- [PostgreSQL Dialect] 暗黙的に定義されたシステム列 (System Columns) のクエリサポートを追加しました (#5834 by @griffio)
- [PostgreSQL Dialect] 基本的な配列リテラルのサポートを追加しました (#5997 by @griffio)
- [PostgreSQL Dialect] 基本的な LTREE のサポートを追加しました (#5880 by @yesitskev @griffio)
- [MySQL Dialect] INET関数のサポートを追加しました (#5072 by @mcxinyu)
- [PostgreSQL Dialect] ALTER INDEX のサポートを追加しました (#6224 by @griffio)
- [SQLite Dialect] SQLite 3.44 の集約関数 DISTINCT、ORDER BY、FILTER のサポートを追加しました (#6236 by @griffio)
- [SQLite Dialect] SQLite 3.37 の STRICT テーブルのサポートを追加しました (#6230 by @griffio)
- [Gradle Plugin] `codegenExcludedColumns` を使用して生成されるモデルから特定の列を除外するサポートを追加しました (#6243 by @sokolikp)
- [Compiler] スキーマに `allTableNames` 関数を追加しました (#6245 by @edenman)
- [PostgreSQL Dialect] ANY 演算子のサポートを追加しました (#6253 by @griffio)
- [SQLite Dialect] SQLite 3.39 の RIGHT JOIN および FULL JOIN のサポートを追加しました (#6273 by @griffio)
- [PostgreSQL Dialect] トリガー関数における `RAISE` 文と `FOUND` 変数のサポートを追加しました (#6297 by @griffio)

### 変更 (Changed)
- [PostgreSQL Dialect] arrayIntermediateType の可視性を public に変更しました (#5835 by @griffio)
- [Gradle Plugin] より厳格な MigrationFile のバージョニングを実装しました (#5730 by @madisp)
- [Gradle Plugin] 最小サポート Gradle バージョンを 8.2.1 に引き上げました (#6217 by @maxsav)
- [Gradle Plugin] Gradle の Isolated Projects をサポートしました (#6217 by @maxsav)
- [IntelliJ Plugin] 最小バージョンを 2023.3 / Android Studio Jellyfish に変更しました

### 修正 (Fixed)
- [Gradle Plugin] JDK 24+ において、コンパイラワーカーからの `sun.misc.Unsafe` 非推奨警告を抑制しました (#6321)
- [Compiler] 生成されたコードにおける Kotlin の余分な警告を抑制しました (#6208 by @eyupcanakman)
- [Compiler] グループ化されていない集約結果セットのその他の列が常に nullable になるよう修正しました
- [PostgreSQL Dialect] coalesce および ifnull の null 許容性を正しく解決するようにしました
- [PostgreSQL Dialect] PostgreSQL ダイアレクトの IDE 連携を修正しました
- [PostgreSQL Dialect] PostgreSQL ダイアレクト向けの IDE プラグインを改善しました (#6209 by @griffio)
- [Intellij Plugin] IDE プラグインがすべてのダイアレクトでコード補完を実行できるようにしました (#6210 by @griffio)
- [Gradle Plugin] データベース検証タスクの実行時に循環依存エラーが発生する問題を修正しました (#6221 by @griffio)
- [Compiler] 複数行の更新に対するオプティミスティックロック (楽観的ロック) を修正しました (#6240 by @griffio)
- [Intellij Plugin] IDEA 2026.2 でクラッシュを引き起こしていた非推奨 API の使用を修正しました (#6247 by @griffio)
- [Gradle Plugin] AGP 8.9 から 8.11 において、生成されたソースが Kotlin コンパイルで認識されない問題を修正しました
- [PostgreSQL Dialect] プリミティブバインド引数を使用する lower および upper 関数がデフォルトで TEXT になるよう修正しました (#6262 by @griffio)
- [Compiler] アダプターを使用したデータクラスバインディングと null 許容性を変更するマイグレーションを伴う挿入値の処理を修正しました (#6269 by griffio)
- [Compiler] null 安全演算子 (IS および IS DISTINCT FROM) で nullable なバインド引数を使用するようにしました (#6265 by @griffio)
- [Gradle Plugin] プロジェクト依存関係に AGP のバリアント解決を使用するようにしました (#6217 by @maxsav)
- [Gradle Plugin] ビルド間で AGP バリアントのリストが異なる場合に generateDatabaseInterface でビルドキャッシュミスが発生する問題を修正しました
- [Gradle Plugin] データベースが設定されていない状態でプラグインが適用された場合の IDE 同期クラッシュを修正しました (#6088)
- [PostgreSQL Dialect] ネストされた関数呼び出しを使用する際の JSON 集約関数を修正しました (#6281 by @griffio)
- [Paging3 Extension] 空のデータベースで KeyedQueryPagingSource がクラッシュする問題を修正しました (#6284 by @woods-marshes)
- [Compiler] `COALESCE` などのカプセル化関数とともにミューテーター文が使用された場合の Java 型アダプターの問題を修正しました (#6292 by @griffio)
- [Compiler] モジュール名が大文字で始まっている場合、生成されるコードのパッケージ名も大文字になってしまう問題を修正しました (#6316 by @griffio)
- [PostgreSQL Dialect] 日付データ型の大文字・小文字を区別しないようにしました (#6328 by @griffio)
- [PostgreSQL Dialect] `string_agg` 関数が nullable になるよう修正しました (#6340 by @griffio)
- [SQLite Dialect] `GROUP BY` を使用する SQLite 3.44 集約関数を修正しました (#6343 by @griffio)
- [Gradle Plugin] 設定時 (configuration time) にデータベースの依存関係が解決されるのを回避するようにしました (#6353 by @joshfriend)

## [2.4.0-rc2] - 2026-09-14 {id="2-4-0-rc2-2026-09-14"}
[2.4.0-rc2]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0-rc2

### 修正 (Fixed)

- [PostgreSQL Dialect] `string_agg` 関数が nullable になるよう修正しました (#6340 by @griffio)
- [SQLite Dialect] `GROUP BY` を使用する SQLite 3.44 集約関数を修正しました (#6343 by @griffio)
- [Gradle Plugin] 設定時 (configuration time) にデータベースの依存関係が解決されるのを回避するようにしました (#6353 by @joshfriend)

## [2.4.0-rc1] - 2026-09-01 {id="2-4-0-rc1-2026-09-01"}
[2.4.0-rc1]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0-rc1

### 追加 (Added)
- [Native Driver] `inMemoryDriver` に `extendedConfig` パラメータを追加しました (#5539 by @GuilhE)
- [PostgreSQL Dialect] 暗黙的に定義されたシステム列のクエリサポートを追加しました (#5834 by @griffio)
- [PostgreSQL Dialect] 基本的な配列リテラルのサポートを追加しました (#5997 by @griffio)
- [PostgreSQL Dialect] 基本的な LTREE のサポートを追加しました (#5880 by @yesitskev @griffio)
- [MySQL Dialect] INET関数のサポートを追加しました (#5072 by @mcxinyu)
- [PostgreSQL Dialect] ALTER INDEX のサポートを追加しました (#6224 by @griffio)
- [SQLite Dialect] SQLite 3.44 の集約関数 DISTINCT、ORDER BY、FILTER のサポートを追加しました (#6236 by @griffio)
- [SQLite Dialect] SQLite 3.37 の STRICT テーブルのサポートを追加しました (#6230 by @griffio)
- [Gradle Plugin] `codegenExcludedColumns` を使用して生成されるモデルから特定の列を除外するサポートを追加しました (#6243 by @sokolikp)
- [Compiler] スキーマに `allTableNames` 関数を追加しました (#6245 by @edenman)
- [PostgreSQL Dialect] ANY 演算子のサポートを追加しました (#6253 by @griffio)
- [SQLite Dialect] SQLite 3.39 の RIGHT JOIN および FULL JOIN のサポートを追加しました (#6273 by @griffio)
- [PostgreSQL Dialect] トリガー関数における `RAISE` 文と `FOUND` 変数のサポートを追加しました (#6297 by @griffio)

### 変更 (Changed)
- [PostgreSQL Dialect] arrayIntermediateType の可視性を public に変更しました (#5835 by @griffio)
- [Gradle Plugin] より厳格な MigrationFile のバージョニングを実装しました (#5730 by @madisp)
- [Gradle Plugin] 最小サポート Gradle バージョンを 8.2.1 に引き上げました (#6217 by @maxsav)
- [Gradle Plugin] Gradle の Isolated Projects をサポートしました (#6217 by @maxsav)
- [IntelliJ Plugin] 最小バージョンを 2023.3 / Android Studio Jellyfish に変更しました

### 修正 (Fixed)
- [Gradle Plugin] JDK 24+ において、コンパイラワーカーからの `sun.misc.Unsafe` 非推奨警告を抑制しました (#6321)
- [Compiler] 生成されたコードにおける Kotlin の余分な警告を抑制しました (#6208 by @eyupcanakman)
- [Compiler] グループ化されていない集約結果セットのその他の列が常に nullable になるよう修正しました
- [PostgreSQL Dialect] coalesce および ifnull の null 許容性を正しく解決するようにしました
- [PostgreSQL Dialect] PostgreSQL ダイアレクトの IDE 連携を修正しました
- [PostgreSQL Dialect] PostgreSQL ダイアレクト向けの IDE プラグインを改善しました (#6209 by @griffio)
- [Intellij Plugin] IDE プラグインがすべてのダイアレクトでコード補完を実行できるようにしました (#6210 by @griffio)
- [Gradle Plugin] データベース検証タスクの実行時に循環依存エラーが発生する問題を修正しました (#6221 by @griffio)
- [Compiler] 複数行の更新に対するオプティミスティックロックを修正しました (#6240 by @griffio)
- [Intellij Plugin] IDEA 2026.2 でクラッシュを引き起こしていた非推奨 API の使用を修正しました (#6247 by @griffio)
- [Gradle Plugin] AGP 8.9 から 8.11 において、生成されたソースが Kotlin コンパイルで認識されない問題を修正しました
- [PostgreSQL Dialect] プリミティブバインド引数を使用する lower および upper 関数がデフォルトで TEXT になるよう修正しました (#6262 by @griffio)
- [Compiler] アダプターを使用したデータクラスバインディングと null 許容性を変更するマイグレーションを伴う挿入値の処理を修正しました (#6269 by griffio)
- [Compiler] null 安全演算子 (IS および IS DISTINCT FROM) で nullable なバインド引数を使用するようにしました (#6265 by @griffio)
- [Gradle Plugin] プロジェクト依存関係に AGP のバリアント解決を使用するようにしました (#6217 by @maxsav)
- [Gradle Plugin] ビルド間で AGP バリアントのリストが異なる場合に generateDatabaseInterface でビルドキャッシュミスが発生する問題を修正しました
- [Gradle Plugin] データベースが設定されていない状態でプラグインが適用された場合の IDE 同期クラッシュを修正しました (#6088)
- [PostgreSQL Dialect] ネストされた関数呼び出しを使用する際の JSON 集約関数を修正しました (#6281 by @griffio)
- [Paging3 Extension] 空のデータベースで KeyedQueryPagingSource がクラッシュする問題を修正しました (#6284 by @woods-marshes)
- [Compiler] `COALESCE` などのカプセル化関数とともにミューテーター文が使用された場合の Java 型アダプターの問題を修正しました (#6292 by @griffio)
- [Compiler] モジュール名が大文字で始まっている場合、生成されるコードのパッケージ名も大文字になってしまう問題を修正しました (#6316 by @griffio)
- [PostgreSQL Dialect] 日付データ型の大文字・小文字を区別しないようにしました (#6328 by @griffio)

## [2.3.2] - 2026-03-16 {id="2-3-2-2026-03-16"}
[2.3.2]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.2

### 追加 (Added)
- [PostgreSQL Dialect] ALTER TABLE ALTER TYPE USING 式のサポートを改善しました (#6116 by @griffio)
- [PostgreSQL Dialect] DROP COLUMN IF EXISTS のサポートを追加しました (#6112 by @griffio)
- [Gradle Plugin] Select のワイルドカード展開を無効化する expandSelectStar フラグを追加しました (#5813 by @griffio)
- [MySQL Dialect] ウィンドウ関数 (Window Functions) のサポートを追加しました (#6086 by @griffio)
- [Gradle Plugin] 開始スキーマバージョンが 1 以外で verifyMigrations が true の場合にビルドが失敗する問題を修正しました (#6017 by @neilgmiller)
- [Gradle Plugin] `SqlDelightWorkerTask` の設定自由度を高め、Windows 上での開発をサポートするようデフォルト設定を更新しました (#5215 by @MSDarwish2000)
- [SQLite Dialect] FTS5 仮想テーブルにおける合成列 (synthesized columns) のサポートを追加しました (#5986 by @watbe)
- [PostgreSQL Dialect] Postgres の行レベルセキュリティ (RLS) のサポートを追加しました (#6087 by @shellderp)
- [PostgreSQL Dialect] FOR UPDATE を拡張し、OF table、NO KEY UPDATE、NO WAIT をサポートしました (#6104 by @shellderp)
- [PostgreSQL Dialect] PostGIS の Point 型および関連関数のサポートを追加しました (#5602 by @vanniktech)
- [Runtime] トランザクションの `CoroutineContext` を制御する仕組みを提供する `SuspendingTransacter.TransactionDispatcher` を追加しました (#5967 by @eygraber)
- [Gradle Plugin] Android Gradle Plugin 9.0 の新しい DSL との完全な互換性を確保しました (#6140)
- [PostgreSQL Dialect] PostgreSQL の CREATE TABLE ストレージパラメータをサポートしました (#6148 by @griffio)
- [PostgreSQL Dialect] PostgreSQL のユニークテーブル制約において nullable な結果列を修正しました (#6167 by @griffio)

### 変更 (Changed)
- [Compiler] コンパイラの出力型を java.lang.Void から kotlin.Nothing に変更しました (#6099 by @griffio)
- [Compiler] パッケージ名にアンダースコアを使用できるようにしました。以前はアンダースコアがサニタイズされ予期しない動作が発生していました (#6027 by @BierDav)
- [Paging Extension] AndroidX Paging に移行しました (#5910 by @jeffdgr8)
- [Android Driver] Android の minSdk を 23 に引き上げました (#6141)
- [Paging Extension] Paging 3.4.1 にアップグレードし、X64 Apple ターゲットを削除しました (#6166)

### 修正 (Fixed)
- [IntelliJ Plugin] VFS リフレッシュイベント中に EDT 上でファイルタイプ検出をブロックすることによって引き起こされていた IDE のフリーズを修正しました
- [SQLite Dialect] JSON パス演算子を使用する際の SQLite 3.38 コンパイルエラーを修正しました (#6070 by @griffio)
- [SQLite Dialect] カスタム列タイプを使用する際、group_concat 関数で String 型を使用するようにしました (#6082 by @griffio)
- [Gradle Plugin] 複雑なスキーマでハングアップしないよう `VerifyMigrationTask` のパフォーマンスを改善しました (#6073 by @Lightwood13)
- [Intellij Plugin] プラグイン初期化時の例外を修正し、非推奨メソッドを更新しました (#6040 by @griffio)
- [Gradle Plugin] Android Gradle Plugin 内蔵の Kotlin との互換性を修正しました (#6139)

## [2.3.1] - 2025-03-12 {id="2-3-1-2025-03-12"}
[2.3.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.1

リリースに失敗しました。2.3.2 を使用してください！

## [2.3.0] - 2025-03-12 {id="2-3-0-2025-03-12"}
[2.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.0

リリースに失敗しました。2.3.2 を使用してください！

## [2.2.1] - 2025-11-13 {id="2-2-1-2025-11-13"}
[2.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.2.1

### 追加 (Added)
- [PostgreSQL Dialect] Postgres の numeric/integer/biginteger 型マッピングを修正しました (#5994 by @griffio)
- [Compiler] CAST が必要な際、エラーメッセージにソースファイルの場所を含めるように改善しました (#5979 by @griffio)
- [PostgreSQL Dialect] Postgres JSON 演算子パス抽出のサポートを追加しました (#5971 by @griffio)
- [SQLite Dialect] 共通テーブル式 (CTE) を使用した MATERIALIZED クエリプランナーヒントの SQLite 3.35 サポートを追加しました (#5961 by @griffio)
- [PostgreSQL Dialect] 共通テーブル式を使用した MATERIALIZED クエリプランナーヒントのサポートを追加しました (#5961 by @griffio)
- [PostgreSQL Dialect] Postgres JSON 集約 FILTER のサポートを追加しました (#5957 by @griffio)
- [PostgreSQL Dialect] Postgres の Enum (列挙型) のサポートを追加しました (#5935 by @griffio)
- [PostgreSQL Dialect] Postgres トリガーの限定的なサポートを追加しました (#5932 by @griffio)
- [PostgreSQL Dialect] SQL 式が JSON としてパース可能かどうかをチェックする述語を追加しました (#5843 by @griffio)
- [PostgreSQL Dialect] PostgreSQL の Comment On 文の限定的なサポートを追加しました (#5808 by @griffio)
- [MySQL Dialect] インデックス可視性オプションのサポートを追加しました (#5785 by @orenkislev-faire)
- [PostgreSql Dialect] TSQUERY データ型のサポートを追加しました (#5779 by @griffio)
- [Gradle Plugin] モジュール追加時のバージョンカタログ (Version Catalogs) のサポートを追加しました (#5755 by @DRSchlaubi)

### 変更 (Changed)
- 開発中のスナップショットは、Central Portal Snapshots リポジトリ (https://central.sonatype.com/repository/maven-snapshots/) に公開されるようになりました。
- [Compiler] コンストラクタ参照を使用して、デフォルトで生成されるクエリを簡素化しました (#5814 by @jonapoul)

### 修正 (Fixed)
- [Compiler] 共通テーブル式を含む View を使用する際のスタックオーバーフローを修正しました (#5928 by @griffio)
- [Gradle Plugin] SqlDelight ツールウィンドウを開いて「New Connection」を追加する際のクラッシュを修正しました (#5906 by @griffio)
- [IntelliJ Plugin] copy-to-sqlite ガターアクションでのスレッド関連のクラッシュを回避しました (#5901 by @griffio)
- [IntelliJ Plugin] スキーマ文 CREATE INDEX および CREATE VIEW を使用する際の PostgreSQL ダイアレクトの修正を行いました (#5772 by @griffio)
- [Compiler] 列を参照する際の FTS スタックオーバーフローを修正しました (#5896 by @griffio)
- [Compiler] With Recursive のスタックオーバーフローを修正しました (#5892 by @griffio)
- [Compiler] Insert|Update|Delete Returning 文の通知 (Notify) を修正しました (#5851 by @griffio)
- [Compiler] Long を返すトランザクションブロックの非同期結果型を修正しました (#5836 by @griffio)
- [Compiler] SQL パラメータバインディングの計算量を O(n²) から O(n) に最適化しました (#5898 by @chenf7)
- [SQLite Dialect] SQLite 3.18 で不足していた関数を修正しました (#5759 by @griffio)

## [2.2.0] - 2025-11-13 {id="2-2-0-2025-11-13"}
[2.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.2.0

アーティファクトが一部のみ公開されたためリリースに失敗しました。2.2.1 を使用してください！

## [2.1.0] - 2025-05-16 {id="2-1-0-2025-05-16"}
[2.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.1.0

### 追加 (Added)
- [WASM Driver] Web Worker ドライバーに wasmJs のサポートを追加しました (#5534 by @IlyaGulya)
- [PostgreSQL Dialect] PostgreSQL の配列を行に展開する UnNest のサポートを追加しました (#5673 by @griffio)
- [PostgreSQL Dialect] PostgreSQL の TSRANGE/TSTZRANGE をサポートしました (#5297 by @griffio)
- [PostgreSQL Dialect] PostgreSQL の Right Full Join をサポートしました (#5086 by @griffio)
- [PostgreSQL Dialect] PostgreSQL の日時・時間型からの extract をサポートしました (#5273 by @griffio)
- [PostgreSQL Dialect] PostgreSQL の配列包含演算子をサポートしました (#4933 by @griffio)
- [PostgreSQL Dialect] PostgreSQL の drop constraint をサポートしました (#5288 by @griffio)
- [PostgreSQL Dialect] PostgreSQL の型キャストをサポートしました (#5089 by @griffio)
- [PostgreSQL Dialect] PostgreSQL のサブクエリ用 LATERAL JOIN 演算子をサポートしました (#5122 by @griffio)
- [PostgreSQL Dialect] PostgreSQL の ILIKE 演算子をサポートしました (#5330 by @griffio)
- [PostgreSQL Dialect] PostgreSQL の XML 型をサポートしました (#5331 by @griffio)
- [PostgreSQL Dialect] PostgreSQL の AT TIME ZONE をサポートしました (#5243 by @griffio)
- [PostgreSQL Dialect] PostgreSQL の ORDER BY NULLS をサポートしました (#5199 by @griffio)
- [PostgreSQL Dialect] PostgreSQL の現在日時・時間関数のサポートを追加しました (#5226 by @drewd)
- [PostgreSQL Dialect] PostgreSQL の正規表現演算子をサポートしました (#5137 by @griffio)
- [PostgreSQL Dialect] BRIN、GIST インデックスを追加しました (#5059 by @griffio)
- [MySQL Dialect] MySQL ダイアレクトで RENAME INDEX をサポートしました (#5212 by @orenkislev-faire)
- [JSON Extension] JSON テーブル関数にエイリアスを追加しました (#5372 by @griffio)

### 変更 (Changed)
- [Compiler] 生成されたクエリファイルが、単純なミューテーターに対して変更行数を返すようにしました (#4578 by @MariusVolkhart)
- [Native Driver] NativeSqlDatabase.kt を更新し、DELETE、INSERT、UPDATE 文の readonly フラグを変更しました (#5680 by @griffio)
- [PostgreSQL Dialect] PgInterval を String に変更しました (#5403 by @griffio)
- [PostgreSQL Dialect] PostgreSQL 拡張機能を実装するための SqlDelight モジュールをサポートしました (#5677 by @griffio)

### 修正 (Fixed)
- [Compiler] 修正: 結果を伴うグループ化された文を実行する際にクエリを通知するようにしました (#5006 by @vitorhugods)
- [Compiler] SqlDelightModule の型リゾルバーを修正しました (#5625 by @griffio)
- [Compiler] 5501のエスケープされた列を持つオブジェクトの挿入を修正しました (#5503 by @griffio)
- [Compiler] 正しい行および文字位置でパスリンクをクリックできるようエラーメッセージを改善しました (#5604 by @vanniktech)
- [Compiler] 課題5298の修正: キーワードをテーブル名として使用できるようにしました
- [Compiler] 名前付き execute を修正し、テストを追加しました
- [Compiler] 初期化文をソートする際に、外部キーテーブル制約を考慮するようにしました (#5325 by @TheMrMilchmann)
- [Compiler] タブが含まれている場合でもエラーの下線が適切に揃うようにしました (#5224 by @drewd)
- [JDBC Driver] トランザクション終了時における connectionManager のメモリリークを修正しました
- [JDBC Driver] ドキュメントの記載通り、SQLite のマイグレーションをトランザクション内で実行するようにしました (#5218 by @morki)
- [JDBC Driver] トランザクションのコミット/ロールバック後にコネクションがリークする問題を修正しました (#5205 by @morki)
- [Gradle Plugin] `GenerateSchemaTask` の前に `DriverInitializer` を実行するようにしました (#5562 by @nwagu)
- [Runtime] 実際のドライバーが Async である場合の LogSqliteDriver でのクラッシュを修正しました (#5723 by @edenman)
- [Runtime] StringBuilder の初期容量を修正しました (#5192 by @janbina)
- [PostgreSQL Dialect] PostgreSQL の create or replace view を修正しました (#5407 by @griffio)
- [PostgreSQL Dialect] PostgreSQL の to_json を修正しました (#5606 by @griffio)
- [PostgreSQL Dialect] PostgreSQL の numeric リゾルバーを修正しました (#5399 by @griffio)
- [PostgreSQL Dialect] SQLite のウィンドウ関数を修正しました (#2799 by @griffio)
- [PostgreSQL Dialect] PostgreSQL の SELECT DISTINCT ON を修正しました (#5345 by @griffio)
- [PostgreSQL Dialect] ALTER TABLE ADD COLUMN IF NOT EXISTS を修正しました (#5309 by @griffio)
- [PostgreSQL Dialect] PostgreSQL の非同期バインドパラメータを修正しました (#5313 by @griffio)
- [PostgreSQL Dialect] PostgreSQL の真偽値リテラルを修正しました (#5262 by @griffio)
- [PostgreSQL Dialect] PostgreSQL のウィンドウ関数を修正しました (#5155 by @griffio)
- [PostgreSQL Dialect] PostgreSQL の isNull / isNotNull 型を修正しました (#5173 by @griffio)
- [PostgreSQL Dialect] PostgreSQL の SELECT DISTINCT を修正しました (#5172 by @griffio)
- [Paging Extension] Paging の初回読み込みリフレッシュを修正しました (#5615 by @evant)
- [Paging Extension] macOS ネイティブターゲットを追加しました (#5324 by @vitorhugods)
- [IntelliJ Plugin] K2 をサポートしました

## [2.0.2] - 2024-04-05 {id="2-0-2-2024-04-05"}
[2.0.2]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.2

### 追加 (Added)
- [PostgreSQL Dialect] PostgreSQL の STRING_AGG 関数を追加しました (#4950 by @anddani)
- [PostgreSQL Dialect] pg ダイアレクトに SET 文を追加しました (#4927 by @de-luca)
- [PostgreSQL Dialect] PostgreSQL の alter column シーケンスパラメータを追加しました (#4916 by @griffio)
- [PostgreSQL Dialect] INSERT 文における PostgreSQL の alter column default のサポートを追加しました (#4912 by @griffio)
- [PostgreSQL Dialect] PostgreSQL の alter sequence および drop sequence を追加しました (#4920 by @griffio)
- [PostgreSQL Dialect] Postgres 正規表現関数の定義を追加しました (#5025 by @MariusVolkhart)
- [PostgreSQL Dialect] GIN インデックスの文法を追加しました (#5027 by @griffio)

### 変更 (Changed)
- [IDE Plugin] 最小バージョンを 2023.1 / Android Studio Iguana に変更しました
- [Compiler] encapsulatingType で型の null 許容性をオーバーライドできるようにしました (#4882 by @eygraber)
- [Compiler] SELECT * に対する列名をインライン化しました
- [Gradle Plugin] processIsolation に切り替えました (#5068 by @nwagu)
- [Android Runtime] Android の minSDK を 21 に引き上げました (#5094 by @hfhbd)
- [Drivers] ダイアレクト開発者向けに JDBC/R2DBC のステートメントメソッドをさらに公開しました (#5098 by @hfhbd)

### 修正 (Fixed)
- [PostgreSQL Dialect] PostgreSQL の alter table alter column を修正しました (#4868 by @griffio)
- [PostgreSQL Dialect] テーブルモデルのインポート不足 (4448) を修正しました (#4885 by @griffio)
- [PostgreSQL Dialect] PostgreSQL のデフォルト制約関数 (4932) を修正しました (#4934 by @griffio)
- [PostgreSQL Dialect] マイグレーション中の alter table rename column における PostgreSQL の ClassCastException (4879) を修正しました (#4880 by @griffio)
- [PostgreSQL Dialect] PostgreSQL の CREATE EXTENSION (4474) を修正しました (#4541 by @griffio)
- [PostgreSQL Dialect] PostgreSQL の非 null 型に対する Primary Key 追加 (5018) を修正しました (#5020 by @griffio)
- [PostgreSQL Dialect] 集約式 (4703) を修正しました (#5071 by @griffio)
- [PostgreSQL Dialect] PostgreSQL の JSON 処理 (5028) を修正しました (#5030 by @griffio)
- [PostgreSQL Dialect] PostgreSQL の JSON 演算子 (5040) を修正しました (#5041 by @griffio)
- [PostgreSQL Dialect] 5040 に対する JSON 演算子のバインディングを修正しました (#5100 by @griffio)
- [PostgreSQL Dialect] tsvector (5082) を修正しました (#5104 by @griffio)
- [PostgreSQL Dialect] PostgreSQL の UPDATE FROM 文における列の隣接性 (5032) を修正しました (#5035 by @griffio)
- [SQLite Dialect] SQLite の alter table rename column (4897) を修正しました (#4899 by @griffio)
- [IDE Plugin] エラーハンドラーのクラッシュを修正しました (#4988 by @aperfilyev)
- [IDE Plugin] IDEA 2023.3 で BugSnag の初期化に失敗する問題を修正しました (by @aperfilyev)
- [IDE Plugin] プラグイン経由で IntelliJ で .sq ファイルを開いたときの PluginException を修正しました (by @aperfilyev)
- [IDE Plugin] kotlin-lib は既にプラグインの依存関係にあるため、IntelliJ プラグインにバンドルしないようにしました (#5126)
- [IDE Plugin] stream の代わりに extensions 配列を使用するようにしました (#5127)

## [2.0.1] - 2023-12-01 {id="2-0-1-2023-12-01"}
[2.0.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.1

### 追加 (Added)
- [Compiler] SELECT 実行時の multi-column-expr のサポートを追加しました (#4453 by @Adriel-M)
- [PostgreSQL Dialect] PostgreSQL の CREATE INDEX CONCURRENTLY のサポートを追加しました (#4531 by @griffio)
- [PostgreSQL Dialect] PostgreSQL の CTE 補助文が互いを参照できるようにしました (#4493 by @griffio)
- [PostgreSQL Dialect] 二項式および sum 用の PostgreSQL 型のサポートを追加しました (#4539 by @Adriel-M)
- [PostgreSQL Dialect] PostgreSQL の SELECT DISTINCT ON 構文のサポートを追加しました (#4584 by @griffio)
- [PostgreSQL Dialect] SELECT 文における PostgreSQL の JSON 関数のサポートを追加しました (#4590 by @MariusVolkhart)
- [PostgreSQL Dialect] PostgreSQL の generate_series 関数を追加しました (#4717 by @griffio)
- [PostgreSQL Dialect] Postgres の文字列関数の定義を追加しました (#4752 by @MariusVolkhart)
- [PostgreSQL Dialect] min および max 集約関数に PostgreSQL の DATE 型を追加しました (#4816 by @anddani)
- [PostgreSQL Dialect] SqlBinaryExpr に PostgreSQL の日時・時間型を追加しました (#4657 by @griffio)
- [PostgreSQL Dialect] postgres ダイアレクトに TRUNCATE を追加しました (#4817 by @de-luca)
- [SQLite 3.35 Dialect] 順次評価される複数の ON CONFLICT 句を許可するようにしました (#4551 by @griffio)
- [JDBC Driver] より快適な SQL 編集のために Language アノテーションを追加しました (#4602 by @MariusVolkhart)
- [Native Driver] native-driver: linuxArm64 のサポートを追加しました (#4792 by @hfhbd)
- [Android Driver] AndroidSqliteDriver に windowSizeBytes パラメータを追加しました (#4804 by @BoD)
- [Paging3 Extension] 機能追加: OffsetQueryPagingSource に initialOffset を追加しました (#4802 by @MohamadJaara)

### 変更 (Changed)
- [Compiler] 適切な箇所では Kotlin の型を優先して使用するようにしました (#4517 by @eygraber)
- [Compiler] 値型 (value type) の挿入を行う際は、常に列名を含めるようにしました (#4864)
- [PostgreSQL Dialect] PostgreSQL ダイアレクトから実験的 (experimental) ステータスを削除しました (#4443 by @hfhbd)
- [PostgreSQL Dialect] PostgreSQL の型に関するドキュメントを更新しました (#4569 by @MariusVolkhart)
- [R2DBC Driver] PostgreSQL での整数データ型の処理パフォーマンスを最適化しました (#4588 by @MariusVolkhart)

### 削除 (Removed) {id="removed"}
- [SQLite Javascript Driver] sqljs-driver を削除しました (#4613, #4670 by @dellisd)

### 修正 (Fixed)
- [Compiler] 戻り値がありパラメータのないグループ化された文のコンパイルを修正しました (#4699 by @griffio)
- [Compiler] SqlBinaryExpr による引数のバインドを修正しました (#4604 by @griffio)
- [IDE Plugin] 設定されている場合は IDEA Project JDK を使用するようにしました (#4689 by @griffio)
- [IDE Plugin] IDEA 2023.2 以降での「Unknown element type: TYPE_NAME」エラーを修正しました (#4727)
- [IDE Plugin] 2023.2 とのいくつかの互換性の問題を修正しました
- [Gradle Plugin] Gradle の verifyMigrationTask タスクのドキュメントを修正しました (#4713 by @joshfriend)
- [Gradle Plugin] データベースを検証する前にユーザーがデータベースを生成するのを助けるための Gradle タスク出力メッセージを追加しました (#4684 by @jingwei99)
- [PostgreSQL Dialect] PostgreSQL の列が複数回リネームされる問題を修正しました (#4566 by @griffio)
- [PostgreSQL Dialect] PostgreSQL の alter column nullability (4714) を修正しました (#4831 by @griffio)
- [PostgreSQL Dialect] alter table alter column (4837) を修正しました (#4846 by @griffio)
- [PostgreSQL Dialect] PostgreSQL のシーケンス (4501) を修正しました (#4528 by @griffio)
- [SQLite Dialect] 列式での JSON 二項演算子の使用を許可しました (#4776 by @eygraber)
- [SQLite Dialect] 同じ名前の複数列が見つかった場合の Update From の誤検知を修正しました (#4777 by @eygraber)
- [Native Driver] 名前付きインメモリデータベースをサポートしました (#4662 by @05nelsonm)
- [Native Driver] クエリリスナーコレクションのスレッドセーフ性を確保しました (#4567 by @kpgalligan)
- [JDBC Driver] ConnectionManager における接続リークを修正しました (#4589 by @MariusVolkhart)
- [JDBC Driver] ConnectionManager のタイプを選択する際の JdbcSqliteDriver の URL パースを修正しました (#4656 by @05nelsonm)

## [2.0.0] - 2023-07-26 {id="2-0-0-2023-07-26"}
[2.0.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0

### 追加 (Added)
- [MySQL Dialect] MySQL: IF 式での timestamp/bigint をサポートしました (#4329 by @shellderp)
- [MySQL Dialect] MySQL: NOW() を追加しました (#4431 by @hfhbd)
- [Web Driver] NPM パッケージの公開を有効にしました (#4364)
- [IDE Plugin] Gradle tooling の接続に失敗した際にスタックトレースを表示できるようにしました (#4383)

### 変更 (Changed)
- [Sqlite Driver] JdbcSqliteDriver のスキーママイグレーションの使用を簡素化しました (#3737 by @morki)
- [R2DBC Driver] 真の非同期 R2DBC カーソルに対応しました (#4387 by @hfhbd)

### 修正 (Fixed)
- [IDE Plugin] 必要になるまでデータベースプロジェクトサービスをインスタンス化しないようにしました (#4382)
- [IDE Plugin] 使用箇所の検索 (find usages) 中のプロセスキャンセルを処理するようにしました (#4340)
- [IDE Plugin] IDE による非同期コードの生成を修正しました (#4406)
- [IDE Plugin] パッケージ構造の組み立てを一度だけ計算し、EDT 外で行うように変更しました (#4417)
- [IDE Plugin] 2023.2 における Kotlin 型解決のために正しいスタブインデックスキーを使用するようにしました (#4416)
- [IDE Plugin] 検索を実行する前にインデックスの準備が整うのを待つようにしました (#4419)
- [IDE Plugin] インデックスが利用できない場合は定義へのジャンプ (goto) を実行しないようにしました (#4420)
- [Compiler] グループ化された文の結果式を修正しました (#4378)
- [Compiler] 仮想テーブルをインターフェース型として使用しないようにしました (#4427 by @hfhbd)

## [2.0.0-rc02] - 2023-06-27 {id="2-0-0-rc02-2023-06-27"}
[2.0.0-rc02]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-rc02

### 追加 (Added)
- [MySQL Dialect] 小文字の日時型、および日時型に対する min と max をサポートしました (#4243 by @shellderp)
- [MySQL Dialect] 二項式および sum 用の MySQL 型をサポートしました (#4254 by @shellderp)
- [MySQL Dialect] 表示幅のない unsigned int をサポートしました (#4306 by @shellderp)
- [MySQL Dialect] LOCK IN SHARED MODE をサポートしました
- [PostgreSQL Dialect] min / max に boolean および Timestamp を追加しました (#4245 by @griffio)
- [PostgreSQL Dialect] Postgres: ウィンドウ関数のサポートを追加しました (#4283 by @hfhbd)
- [Runtime] runtime に linuxArm64、androidNative、watchosDeviceArm ターゲットを追加しました (#4258 by @hfhbd)
- [Paging Extension] paging extension に linux および mingw x64 ターゲットを追加しました (#4280 by @chippman)

### 変更 (Changed)
- [Gradle Plugin] Android API 34 の自動ダイアレクトサポートを追加しました (#4251)
- [Paging Extension] QueryPagingSource での SuspendingTransacter のサポートを追加しました (#4292 by @daio)
- [Runtime] addListener API を改善しました (#4244 by @hfhbd)
- [Runtime] マイグレーションのバージョンに Long を使用するようにしました (#4297 by @hfhbd)

### 修正 (Fixed)
- [Gradle Plugin] 生成されたソースに安定した出力パスを使用するようにしました (#4269 by @joshfriend)
- [Gradle Plugin] Gradle の微調整を行いました (#4222 by @3flex)

## [2.0.0-rc01] - 2023-05-29 {id="2-0-0-rc01-2023-05-29"}
[2.0.0-rc01]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-rc01

### 追加 (Added)
- [Paging] paging extensions に js browser ターゲットを追加しました (#3843 by @sproctor)
- [Paging] androidx-paging3 extension に iosSimulatorArm64 ターゲットを追加しました (#4117)
- [PostgreSQL Dialect] gen_random_uuid() のサポートとテストを追加しました (#3855 by @davidwheeler123)
- [PostgreSQL Dialect] Postgres の ALTER TABLE ADD CONSTRAINT をサポートしました (#4116 by @griffio)
- [PostgreSQL Dialect] ALTER TABLE ADD CONSTRAINT CHECK をサポートしました (#4120 by @griffio)
- [PostgreSQL Dialect] PostgreSQL の文字列長関数を追加しました (#4121 by @griffio)
- [PostgreSQL Dialect] PostgreSQL の列デフォルト INTERVAL を追加しました (#4142 by @griffio)
- [PostgreSQL Dialect] PostgreSQL の INTERVAL 列の結果を追加しました (#4152 by @griffio)
- [PostgreSQL Dialect] PostgreSQL の Alter Column を追加しました (#4165 by @griffio)
- [PostgreSQL Dialect] PostgreSQL: date_part を追加しました (#4198 by @hfhbd)
- [MySQL Dialect] SQL 文字列長関数を追加しました (#4134 by @griffio)
- [IDE Plugin] sqldelight ディレクトリの候補表示を追加しました (#3976 by @aperfilyev)
- [IDE Plugin] プロジェクトツリー内の中間パッケージをコンパクトに表示するようにしました (#3992 by @aperfilyev)
- [IDE Plugin] JOIN 句の補完を追加しました (#4086 by @aperfilyev)
- [IDE Plugin] ビュー作成のインテンションとライブテンプレートを追加しました (#4074 by @aperfilyev)
- [IDE Plugin] DELETE または UPDATE 内で WHERE が不足している場合に警告するようにしました (#4058 by @aperfilyev)
- [Gradle Plugin] 型安全なプロジェクトアクセサーを有効化しました (#4005 by @hfhbd)

### 変更 (Changed)
- [Gradle Plugin] ServiceLoader メカニズムを使用して VerifyMigrationTask 用の DriverInitializer を登録できるようにしました (#3986 by @C2H6O)
- [Gradle Plugin] 明示的なコンパイラ環境を作成するようにしました (#4079 by @hfhbd)
- [JS Driver] Web Worker ドライバーを個別のアーティファクトに分割しました
- [JS Driver] JsWorkerSqlCursor を外部公開しないようにしました (#3874 by @hfhbd)
- [JS Driver] sqljs ドライバーの公開を無効化しました (#4108)
- [Runtime] 同期ドライバーには同期スキーマ初期化子が必須であることを強制するようにしました (#4013)
- [Runtime] Cursor の非同期サポートを改善しました (#4102)
- [Runtime] 非推奨となったターゲットを削除しました (#4149 by @hfhbd)
- [Runtime] 従来のメモリモデル (MM) のサポートを削除しました (#4148 by @hfhbd)

### 修正 (Fixed)
- [R2DBC Driver] R2DBC: ドライバーのクローズを待機 (await) するようにしました (#4139 by @hfhbd)
- [Compiler] データベースの create(SqlDriver) にマイグレーションからの PRAGMA を含めるようにしました (#3845 by @MariusVolkhart)
- [Compiler] RETURNING 句のコード生成を修正しました (#3872 by @MariusVolkhart)
- [Compiler] 仮想テーブルの型を生成しないようにしました (#4015)
- [Gradle Plugin] Gradle プラグインの細かな QoL (利便性) の改善を行いました (#3930 by @zacsweers)
- [IDE Plugin] 未解決の Kotlin 型に関する問題を修正しました (#3924 by @aperfilyev)
- [IDE Plugin] ワイルドカード展開インテンションが修飾子付きでも機能するよう修正しました (#3979 by @aperfilyev)
- [IDE Plugin] JAVA_HOME が見つからない場合は利用可能な JDK を使用するようにしました (#3925 by @aperfilyev)
- [IDE Plugin] パッケージ名に対する使用箇所の検索を修正しました (#4010)
- [IDE Plugin] 無効な要素に対して自動インポートを表示しないようにしました (#4008)
- [IDE Plugin] ダイアレクトが見つからない場合は名前解決を行わないようにしました (#4009)
- [IDE Plugin] 無効化された状態での IDE によるコンパイラ実行を無視するようにしました (#4016)
- [IDE Plugin] IntelliJ 2023.1 のサポートを追加しました (#4037 by @madisp)
- [IDE Plugin] 列名のリネーム時に名前付き引数の使用箇所もリネームするようにしました (#4027 by @aperfilyev)
- [IDE Plugin] マイグレーション追加のポップアップを修正しました (#4105 by @aperfilyev)
- [IDE Plugin] マイグレーションファイル内で SchemaNeedsMigrationInspection を無効化しました (#4106 by @aperfilyev)
- [IDE Plugin] マイグレーション生成時に型名ではなく SQL の列名を使用するようにしました (#4112 by @aperfilyev)

## [2.0.0-alpha05] - 2023-01-20 {id="2-0-0-alpha05-2023-01-20"}
[2.0.0-alpha05]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha05

### 追加 (Added)
- [Paging] マルチプラットフォーム向け Paging 拡張機能 (by @jeffdgr8)
- [Runtime] Listener インターフェースに fun 修飾子を追加しました。
- [SQLite Dialect] SQLite 3.33 (UPDATE FROM) のサポートを追加しました (by @eygraber)
- [PostgreSQL Dialect] PostgreSQL での UPDATE FROM をサポートしました (by @eygraber)

### 変更 (Changed)
- [RDBC Driver] コネクションを外部公開しました (by @hfhbd)
- [Runtime] マイグレーションのコールバックをメインの `migrate` 関数内に移動しました
- [Gradle Plugin] ダウンストリームのプロジェクトから Configuration を隠蔽しました
- [Gradle Plugin] IntelliJ のみを shade (埋め込み) するようにしました (by @hfhbd)
- [Gradle Plugin] Kotlin 1.8.0-Beta をサポートし、複数バージョンの Kotlin テストを追加しました (by @hfhbd)

### 修正 (Fixed)
- [RDBC Driver] 代わりに javaObjectType を使用するようにしました (by @hfhbd)
- [RDBC Driver] bindStatement におけるプリミティブの null 値を修正しました (by @hfhbd)
- [RDBC Driver] R2DBC 1.0 をサポートしました (by @hfhbd)
- [PostgreSQL Dialect] Postgres: 型パラメータのない配列を修正しました (by @hfhbd)
- [IDE Plugin] IntelliJ のバージョンを 221.6008.13 に引き上げました (by @hfhbd)
- [Compiler] 単純なビューから再帰的な元のテーブルを解決するようにしました (by @hfhbd)
- [Compiler] テーブルの外部キー句から値クラス (Value Classes) を使用するようにしました (by @hfhbd)
- [Compiler] 括弧のないバインド式をサポートするよう SelectQueryGenerator を修正しました (by @bellatoris)
- [Compiler] トランザクション使用時に ${name}Indexes 変数が重複して生成される問題を修正しました (by @sachera)

## [1.5.5] - 2023-01-20 {id="1-5-5-2023-01-20"}
[1.5.5]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.5

これは Kotlin 1.8 および IntelliJ 2021+ との互換性リリースであり、JDK 17 をサポートします。

## [1.5.4] - 2022-10-06 {id="1-5-4-2022-10-06"}
[1.5.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.4

これは Kotlin 1.7.20 および AGP 7.3.0 との互換性アップデートです。

## [2.0.0-alpha04] - 2022-10-03 {id="2-0-0-alpha04-2022-10-03"}
[2.0.0-alpha04]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha04

### 破壊的変更 (Breaking Changes) {id="breaking-changes"}

- Paging 3 拡張機能の API が変更され、カウントには int 型のみを許可するようになりました。
- coroutines 拡張機能において、デフォルトのディスパッチャが廃止され、明示的にディスパッチャを渡すことが必須になりました。
- Dialect クラスおよび Driver クラスが final になりました。拡張する場合は委譲 (delegation) を使用してください。

### 追加 (Added)
- [HSQL Dialect] Hsql: INSERT 内の生成列 (generated columns) に対する DEFAULT の使用をサポートしました (#3372 by @hfhbd)
- [PostgreSQL Dialect] PostgreSQL: INSERT 内の生成列に対する DEFAULT の使用をサポートしました (#3373 by @hfhbd)
- [PostgreSQL Dialect] PostgreSQL に NOW() を追加しました (#3403 by @hfhbd)
- [PostgreSQL Dialect] PostgreSQL: NOT 演算子を追加しました (#3504 by @hfhbd)
- [Paging] *QueryPagingSource への CoroutineContext の引き渡しを可能にしました (#3384)
- [Gradle Plugin] ダイアレクトに対するバージョンカタログのサポートを改善しました (#3435)
- [Native Driver] NativeSqliteDriver の DatabaseConfiguration 作成時に介入できるコールバックを追加しました (#3512 by @svenjacobs)

### 変更 (Changed)
- [Paging] KeyedQueryPagingSource をバックにした QueryPagingSource 関数にデフォルトのディスパッチャを追加しました (#3385)
- [Paging] OffsetQueryPagingSource が Int のみで動作するように変更しました (#3386)
- [Async Runtime] await* を上位クラス ExecutableQuery に移動しました (#3524 by @hfhbd)
- [Coroutines Extensions] Flow 拡張機能からデフォルト引数を削除しました (#3489)

### 修正 (Fixed)
- [Gradle Plugin] Kotlin 1.7.20 に更新しました (#3542 by @zacsweers)
- [R2DBC Driver] 常に値を送信するとは限らない R2DBC の変更に対応しました (#3525 by @hfhbd)
- [HSQL Dialect] Hsql 使用時に失敗していた SQLite の VerifyMigrationTask を修正しました (#3380 by @hfhbd)
- [Gradle Plugin] タスクを遅延構成 API (Lazy Configuration API) を使用するように変換しました (by @3flex)
- [Gradle Plugin] Kotlin 1.7.20 での NPE を回避しました (#3398 by @ZacSweers)
- [Gradle Plugin] マイグレーション統合タスク (squash migrations task) の説明を修正しました (#3449)
- [IDE Plugin] より新しい Kotlin プラグインでの NoSuchFieldError を修正しました (#3422 by @madisp)
- [IDE Plugin] IDEA: UnusedQueryInspection - ArrayIndexOutOfBoundsException を修正しました (#3427 by @vanniktech)
- [IDE Plugin] 古い Kotlin プラグインの参照にリフレクションを使用するようにしました
- [Compiler] 拡張関数を持つカスタムダイアレクトがインポートを作成しない問題を修正しました (#3338 by @hfhbd)
- [Compiler] CodeBlock.of("${CodeBlock.toString()}") のエスケープを修正しました (#3340 by @hfhbd)
- [Compiler] マイグレーション内の非同期 execute 文を待機 (await) するようにしました (#3352)
- [Compiler] AS を修正しました (#3370 by @hfhbd)
- [Compiler] `getObject` メソッドが実際の型の自動補完をサポートしました (#3401 by @robxyy)
- [Compiler] 非同期でグループ化された returning 文のコード生成を修正しました (#3411)
- [Compiler] 可能であればバインドパラメータの Kotlin 型を推論し、不可能な場合はより分かりやすいエラーメッセージで失敗するようにしました (#3413 by @hfhbd)
- [Compiler] ABS("foo") を許可しないようにしました (#3430 by @hfhbd)
- [Compiler] 他のパラメータからの Kotlin 型の推論をサポートしました (#3431 by @hfhbd)
- [Compiler] 常にデータベース実装を作成するようにしました (#3540 by @hfhbd)
- [Compiler] JavaDoc の制約を緩和し、カスタムマッパー関数にも追加されるようにしました (#3554 @hfhbd)
- [Compiler] バインディング内の DEFAULT を修正しました (by @hfhbd)
- [Paging] Paging 3 を修正しました (#3396)
- [Paging] Long による OffsetQueryPagingSource の構築を許可しました (#3409)
- [Paging] Dispatchers.Main を静的にスワップしないようにしました (#3428)

## [2.0.0-alpha03] - 2022-06-17 {id="2-0-0-alpha03-2022-06-17"}
[2.0.0-alpha03]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha03

### 破壊的変更 (Breaking Changes)

- ダイアレクトは通常の Gradle 依存関係のように参照されるようになりました。
```groovy
sqldelight {
  MyDatabase {
    dialect("app.cash.sqldelight:postgres-dialect:2.0.0-alpha03")
  }
}
```
- `AfterVersionWithDriver` 型が削除され、常にドライバーを保持するようになった `AfterVersion` に一本化されました。
- `Schema` 型は `SqlDriver` のサブタイプではなくなりました。
- `PreparedStatement` API は、0 から始まるインデックス (zero-based indexes) で呼び出されるようになりました。

### 追加 (Added)
- [IDE Plugin] 実行中のデータベースに対して SQLite、MySQL、PostgreSQL コマンドを実行する機能を追加しました (#2718 by @aperfilyev)
- [IDE Plugin] Android Studio の Database Inspector のサポートを追加しました (#3107 by @aperfilyev)
- [Runtime] 非同期ドライバーのサポートを追加しました (#3168 by @dellisd)
- [Native Driver] 新しい Kotlin/Native メモリモデルをサポートしました (#3177 by @kpgalligan)
- [JS Driver] SqlJs Worker 用のドライバーを追加しました (#3203 by @dellisd)
- [Gradle Plugin] SQLDelight タスクのクラスパスを公開しました
- [Gradle Plugin] マイグレーションを統合 (squash) する Gradle タスクを追加しました
- [Gradle Plugin] マイグレーションチェック中にスキーマ定義を無視するフラグを追加しました
- [MySQL Dialect] MySQL での FOR SHARE および FOR UPDATE をサポートしました (#3098)
- [MySQL Dialect] MySQL のインデックスヒントをサポートしました (#3099)
- [PostgreSQL Dialect] date_trunc を追加しました (#3295 by @hfhbd)
- [JSON Extensions] JSON テーブル関数をサポートしました (#3090)

### 変更 (Changed)
- [Runtime] ドライバーを含まない AfterVersion 型を削除しました (#3091)
- [Runtime] Schema 型をトップレベルに移動しました
- [Runtime] サードパーティの実装をサポートするために、ダイアレクトとリゾルバーを open にしました (#3232 by @hfhbd)
- [Compiler] 失敗レポートにコンパイル時に使用されたダイアレクトを含めるようにしました (#3086)
- [Compiler] 未使用のアダプターをスキップするようにしました (#3162 by @eygraber)
- [Compiler] PrepareStatement で 0 から始まるインデックスを使用するようにしました (#3269 by @hfhbd)
- [Gradle Plugin] ダイアレクトを文字列ではなく適切な Gradle 依存関係として指定するようにしました (#3085)
- [Gradle Plugin] Gradle Verify タスク: データベースファイルが存在しない場合に例外をスローするようにしました (#3126 by @vanniktech)

### 修正 (Fixed)
- [Gradle Plugin] Gradle プラグインの細かなクリーンアップと微調整を行いました (#3171 by @3flex)
- [Gradle Plugin] 生成ディレクトリに AGP 文字列を使用しないようにしました
- [Gradle Plugin] AGP の namespace 属性を使用するようにしました (#3220)
- [Gradle Plugin] Gradle プラグインのランタイム依存関係に kotlin-stdlib を追加しないようにしました (#3245 by @mbonnin)
- [Gradle Plugin] マルチプラットフォームの設定を簡素化しました (#3246 by @mbonnin)
- [Gradle Plugin] JS のみのプロジェクトをサポートしました (#3310 by @hfhbd)
- [IDE Plugin] Gradle Tooling API に JAVA_HOME を使用するようにしました (#3078)
- [IDE Plugin] IDE プラグイン内で適切な ClassLoader 上に JDBC ドライバーをロードするようにしました (#3080)
- [IDE Plugin] 既に存在する PSI の変更中のエラーを回避するため、無効化する前にファイル要素を null としてマークするようにしました (#3082)
- [IDE Plugin] ALTER TABLE 文で新しいテーブル名の使用箇所を検索する際にクラッシュしないようにしました (#3106)
- [IDE Plugin] インスペクターを最適化し、予期される例外タイプに対してはエラーを出さずに失敗できるようにしました (#3121)
- [IDE Plugin] 生成ディレクトリであるべきファイルを削除するようにしました (#3198)
- [IDE Plugin] 安全でない演算子の呼び出しを修正しました
- [Compiler] RETURNING 文を含む UPDATE および DELETE が確実にクエリを実行するようにしました (#3084)
- [Compiler] 複合 SELECT における引数の型を正しく推論するようにしました (#3096)
- [Compiler] 共通テーブルはデータクラスを生成しないため、それらを返さないようにしました (#3097)
- [Compiler] 最上位のマイグレーションファイルをより高速に見つけるようにしました (#3108)
- [Compiler] パイプ演算子で null 許容性を適切に継承するようにしました
- [Compiler] ANSI SQL の iif 関数をサポートしました
- [Compiler] 空のクエリファイルを生成しないようにしました (#3300 by @hfhbd)
- [Compiler] クエスチョンマークのみのアダプターを修正しました (#3314 by @hfhbd)
- [PostgreSQL Dialect] Postgres のプライマリキー列は常に非 null (non-null) となるようにしました (#3092)
- [PostgreSQL Dialect] 複数テーブルで同名の COPY を行う際の処理を修正しました (#3297 by @hfhbd)
- [SQLite 3.35 Dialect] 変更対象のテーブルからインデックス付きの列を削除する場合にのみエラーを表示するようにしました (#3158 by @eygraber)

## [2.0.0-alpha02] - 2022-04-13 {id="2-0-0-alpha02-2022-04-13"}
[2.0.0-alpha02]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha02

### 破壊的変更 (Breaking Changes)

- `app.cash.sqldelight.runtime.rx` のすべての使用箇所を `app.cash.sqldelight.rx2` に置き換える必要があります。

### 追加 (Added)
- [Compiler] グループ化された文の末尾での return をサポートしました
- [Compiler] ダイアレクトモジュールを介したコンパイラ拡張機能をサポートし、SQLite JSON 拡張機能を追加しました (#1379, #2087)
- [Compiler] 値を返す PRAGMA 文をサポートしました (#1106)
- [Compiler] マークされた列に対する値型 (value types) の生成をサポートしました
- [Compiler] オプティミスティックロック (楽観的ロック) と検証のサポートを追加しました (#1952)
- [Compiler] 複数更新 (multi-update) 文をサポートしました
- [PostgreSQL] Postgres の RETURNING 文をサポートしました
- [PostgreSQL] Postgres の日付型をサポートしました
- [PostgreSQL] PG の INTERVAL をサポートしました
- [PostgreSQL] PG の真偽値 (Booleans) をサポートし、ALTER TABLE 時の挿入を修正しました
- [PostgreSQL] Postgres における任意の LIMIT をサポートしました
- [PostgreSQL] PG の BYTEA 型をサポートしました
- [PostgreSQL] Postgres の SERIAL に対するテストを追加しました
- [PostgreSQL] Postgres の FOR UPDATE 構文をサポートしました
- [PostgreSQL] PostgreSQL の配列型をサポートしました
- [PostgreSQL] PG での UUID 型の保存と取得を適切に行うようにしました
- [PostgreSQL] PostgreSQL の NUMERIC 型をサポートしました (#1882)
- [PostgreSQL] 共通テーブル式内でのクエリの RETURNING をサポートしました (#2471)
- [PostgreSQL] JSON 固有の演算子をサポートしました
- [PostgreSQL] Postgres の COPY を追加しました (by @hfhbd)
- [MySQL] MySQL の REPLACE をサポートしました
- [MySQL] MySQL の NUMERIC/BigDecimal 型をサポートしました (#2051)
- [MySQL] MySQL の TRUNCATE 文をサポートしました
- [MySQL] MySQL における JSON 固有の演算子をサポートしました (by @eygraber)
- [MySQL] MySQL の INTERVAL をサポートしました (#2969 by @eygraber)
- [HSQL] HSQL のウィンドウ機能を追加しました
- [SQLite] WHERE 句内の nullable なパラメータに対する等価性チェックを置き換えないようにしました (#1490 by @eygraber)
- [SQLite] SQLite 3.35 の RETURNING 文をサポートしました (#1490 by @eygraber)
- [SQLite] GENERATED 句をサポートしました
- [SQLite] SQLite 3.38 ダイアレクトのサポートを追加しました (by @eygraber)

### 変更 (Changed)
- [Compiler] 生成されるコードを整理しました
- [Compiler] グループ化された文でのテーブルパラメータの使用を禁止しました (#1822)
- [Compiler] グループ化されたクエリをトランザクション内に配置するようにしました (#2785)
- [Runtime] ドライバーの execute メソッドから更新行数を返すようにしました
- [Runtime] コネクションにアクセスするクリティカルセクションに SqlCursor を閉じ込めました (#2123 by @andersio)
- [Gradle Plugin] マイグレーション用にスキーマ定義を比較するようにしました (#841)
- [PostgreSQL] PG での二重引用符の使用を禁止しました
- [MySQL] MySQL での == の使用に対してエラーを出すようにしました (#2673)

### 修正 (Fixed)
- [Compiler] 2.0 alpha において異なるテーブルの同一アダプター型が原因で発生していたコンパイルエラーを修正しました
- [Compiler] UPSERT 文のコンパイルに関する問題を修正しました (#2791)
- [Compiler] 複数のマッチが存在する場合、クエリ結果が SELECT 内のテーブルを使用するようにしました (#1874, #2313)
- [Compiler] INSTEAD OF トリガーを持つビューの更新をサポートしました (#1018)
- [Compiler] 関数名における from および for をサポートしました
- [Compiler] 関数式内での SEPARATOR キーワードを許可しました
- [Compiler] ORDER BY 内でエイリアスされたテーブルの ROWID にアクセスできない問題を修正しました
- [Compiler] MySQL の HAVING 句でエイリアスされた列名が認識されない問題を修正しました
- [Compiler] 誤った「Multiple columns found」エラーを修正しました
- [Compiler] PRAGMA locking_mode = EXCLUSIVE; を設定できない問題を修正しました
- [PostgreSQL] PostgreSQL の列名変更 (rename column) を修正しました
- [MySQL] UNIX_TIMESTAMP、TO_SECONDS、JSON_ARRAYAGG の MySQL 関数が認識されない問題を修正しました
- [SQLite] SQLite のウィンドウ機能を修正しました
- [IDE Plugin] 空のプログレスインジケーター内でジャンプハンドラーを実行するようにしました (#2990)
- [IDE Plugin] プロジェクトが構成されていない場合はハイライトビジターが実行されないようにしました (#2981, #2976)
- [IDE Plugin] 推移的に生成されたコードも IDE 内で確実に更新されるようにしました (#1837)
- [IDE Plugin] ダイアレクト更新時にインデックスを無効化するようにしました

## [2.0.0-alpha01] - 2022-03-31 {id="2-0-0-alpha01-2022-03-31"}
[2.0.0-alpha01]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha01

これは 2.0 の最初のアルファリリースであり、いくつかの破壊的変更が含まれています。今後も ABI の破壊的変更が予定されているため、このリリースに依存するライブラリは公開しないでください (アプリケーションでの利用は問題ありません)。

### 破壊的変更 (Breaking Changes)

- まず、`com.squareup.sqldelight` のすべての記述を `app.cash.sqldelight` に置き換える必要があります。
- 次に、`app.cash.sqldelight.android` のすべての記述を `app.cash.sqldelight.driver.android` に置き換える必要があります。
- さらに、`app.cash.sqldelight.sqlite.driver` のすべての記述を `app.cash.sqldelight.driver.jdbc.sqlite` に置き換える必要があります。
- また、`app.cash.sqldelight.drivers.native` のすべての記述を `app.cash.sqldelight.driver.native` に置き換える必要があります。
- IDE プラグインは 2.X バージョンに更新する必要があります。[alpha または eap チャンネル](https://plugins.jetbrains.com/plugin/8191-sqldelight/versions/alpha) から入手できます。
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

- プリミティブ型はインポートが必要になりました (例: `INTEGER AS Boolean` の場合、`import kotlin.Boolean` が必要)。以前サポートされていた一部の型にはアダプターが必要になりました。大半の変換用プリミティブアダプターは `app.cash.sqldelight:primitive-adapters:2.0.0-alpha01` で提供されています (例: `Integer AS kotlin.Int` 用の `IntColumnAdapter`)。

### 追加 (Added)
- [IDE Plugin] マイグレーションの基本的な提案機能 (by @aperfilyev)
- [IDE Plugin] インポートヒントアクションの追加 (by @aperfilyev)
- [IDE Plugin] Kotlin クラス補完の追加 (by @aperfilyev)
- [Gradle Plugin] Gradle の型安全なプロジェクトアクセサーのショートカットを追加 (by @hfhbd)
- [Compiler] ダイアレクトに基づくコード生成のカスタマイズ (by @MariusVolkhart)
- [JDBC Driver] JdbcDriver に共通の型を追加 (by @MariusVolkhart)
- [SQLite] SQLite 3.35 のサポートを追加 (by @eygraber)
- [SQLite] ALTER TABLE DROP COLUMN のサポートを追加 (by @eygraber)
- [SQLite] SQLite 3.30 ダイアレクトのサポートを追加 (by @eygraber)
- [SQLite] SQLite での NULLS FIRST/LAST をサポート (by @eygraber)
- [HSQL] GENERATED 句に対する HSQL サポートを追加 (by @MariusVolkhart)
- [HSQL] HSQL での名前付きパラメータのサポートを追加 (by @MariusVolkhart)
- [HSQL] HSQL の挿入クエリをカスタマイズ (by @MariusVolkhart)

### 変更 (Changed)
- [Everything] パッケージ名が com.squareup.sqldelight から app.cash.sqldelight に変更されました。
- [Runtime] ダイアレクトをそれぞれの独立した Gradle モジュールに移動しました
- [Runtime] ドライバー実装によるクエリ通知に切り替えました。
- [Runtime] デフォルトの列アダプターを別モジュールに抽出しました (#2056, #2060)
- [Compiler] 各モジュールでやり直すのではなく、モジュールにクエリ実装を生成させるようにしました
- [Compiler] 生成されるデータクラスのカスタム toString 生成を削除しました。(by @PaulWoitaschek)
- [JS Driver] sqljs-driver から sql.js 依存関係を削除しました (by @dellisd)
- [Paging] Android Paging 2 拡張機能を削除しました
- [IDE Plugin] SQLDelight の同期中にエディタバナーを追加しました (#2511)
- [IDE Plugin] サポートされる IntelliJ の最小バージョンを 2021.1 に変更しました

### 修正 (Fixed)
- [Runtime] アロケーションとポインタチェイスを削減するためにリスナーリストをフラット化しました。(by @andersio)
- [IDE Plugin] エラーへのジャンプを可能にするためエラーメッセージを修正しました (by @hfhbd)
- [IDE Plugin] 不足していたインスペクションの説明を追加しました (#2768 by @aperfilyev)
- [IDE Plugin] GotoDeclarationHandler での例外を修正しました (#2531, #2688, #2804 by @aperfilyev)
- [IDE Plugin] import キーワードのハイライトを行いました (by @aperfilyev)
- [IDE Plugin] 未解決の Kotlin 型を修正しました (#1678 by @aperfilyev)
- [IDE Plugin] 未解決のパッケージに対するハイライトを修正しました (#2543 by @aperfilyev)
- [IDE Plugin] プロジェクトのインデックスがまだ初期化されていない場合は、型の不一致な列を検査しないようにしました
- [IDE Plugin] Gradle 同期が実行されるまでファイルインデックスを初期化しないようにしました
- [IDE Plugin] Gradle 同期が開始された場合は SQLDelight のインポートをキャンセルするようにしました
- [IDE Plugin] 元に戻す (Undo) アクションが実行されたスレッドの外部でデータベースを再生成するようにしました
- [IDE Plugin] 参照が解決できない場合は空の Java 型を使用するようにしました
- [IDE Plugin] ファイル解析中は適切にメインスレッドから離れ、書き込み時のみ戻るように修正しました
- [IDE Plugin] 古い IntelliJ バージョンとの互換性を改善しました (by @3flex)
- [IDE Plugin] より高速なアノテーション API を使用するようにしました
- [Gradle Plugin] ランタイム追加時に JS / Android プラグインを明示的にサポートするようにしました (by @ZacSweers)
- [Gradle Plugin] マイグレーションからスキーマを導出せずにマイグレーション出力タスクを登録するようにしました (#2744 by @kevincianfarini)
- [Gradle Plugin] マイグレーションタスクがクラッシュした場合、実行時にクラッシュしたファイルを出力するようにしました
- [Gradle Plugin] べき等な出力を保証するために、コード生成時にファイルをソートするようにしました (by @ZacSweers)
- [Compiler] ファイルの反復処理により高速な API を使用し、PSI グラフ全体を走査しないようにしました
- [Compiler] select 関数のパラメータにキーワードのマングリングを追加しました (#2759 by @aperfilyev)
- [Compiler] マイグレーションアダプターの packageName を修正しました (by @hfhbd)
- [Compiler] 型ではなくプロパティにアノテーションを出力するようにしました (#2798 by @aperfilyev)
- [Compiler] Query サブタイプに渡す前に引数をソートするようにしました (#2379 by @aperfilyev)

## [1.5.3] - 2021-11-23 {id="1-5-3-2021-11-23"}
[1.5.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.3

### 追加 (Added)
- [JDBC Driver] サードパーティのドライバー実装向けに JdbcDriver を open にしました (#2672 by @hfhbd)
- [MySQL Dialect] 時間加算に関する不足していた関数を追加しました (#2671 by @sdoward)
- [Coroutines Extension] coroutines-extensions に M1 ターゲットを追加しました (by @PhilipDukhov)

### 変更 (Changed)
- [Paging3 Extension] sqldelight-android-paging3 を AAR ではなく JAR として配布するようにしました (#2634 by @julioromano)
- ソフトキーワードでもあるプロパティ名には、末尾にアンダースコアが付加されるようになりました。例えば、`value` は `value_` として公開されます。

### 修正 (Fixed)
- [Compiler] 重複する配列パラメータに対して変数を抽出しないようにしました (by @aperfilyev)
- [Gradle Plugin] kotlin.mpp.enableCompatibilityMetadataVariant を追加しました (#2628 by @martinbonnin)
- [IDE Plugin] 使用箇所の検索処理にリード・アクション (Read Action) が必要だった問題を修正しました

## [1.5.2] - 2021-10-12 {id="1-5-2-2021-10-12"}
[1.5.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.2

### 追加 (Added)
- [Gradle Plugin] HMPP のサポート (#2548 by @martinbonnin)
- [IDE Plugin] NULL 比較インスペクションの追加 (by @aperfilyev)
- [IDE Plugin] インスペクション抑止機能の追加 (#2519 by @aperfilyev)
- [IDE Plugin] 名前付きパラメータと位置指定パラメータの混在に対するインスペクション (by @aperfilyev)
- [SQLite Driver] mingwX86 ターゲットを追加しました (#2558 by @enginegl)
- [SQLite Driver] M1 ターゲットを追加しました
- [SQLite Driver] linuxX64 のサポートを追加しました (#2456 by @chippmann)
- [MySQL Dialect] MySQL に ROW_COUNT 関数を追加しました (#2523)
- [PostgreSQL Dialect] PostgreSQL のリネーム、列の削除 (by @pabl0rg)
- [PostgreSQL Dialect] PostgreSQL 文法で CITEXT が認識されない問題を修正
- [PostgreSQL Dialect] TIMESTAMP WITH TIME ZONE および TIMESTAMPTZ を含めました
- [PostgreSQL Dialect] PostgreSQL の GENERATED 列の文法を追加しました
- [Runtime] AfterVersion のパラメータとして SqlDriver を提供するようにしました (#2534, 2614 by @ahmedre)

### 変更 (Changed)
- [Gradle Plugin] 明示的に Gradle 7.0 を要求するようにしました (#2572 by @martinbonnin)
- [Gradle Plugin] VerifyMigrationTask が Gradle の最新状態チェック (up-to-date checks) をサポートするようにしました (#2533 by @3flex)
- [IDE Plugin] nullable な型と non-nullable な型を結合する際に「Join compares two columns of different types」と警告しないようにしました (#2550 by @pchmielowski)
- [IDE Plugin] 列の型における小文字の 'as' に対するエラーメッセージを明確化しました (by @aperfilyev)

### 修正 (Fixed)
- [IDE Plugin] プロジェクトが既に破棄されている場合は新しいダイアレクトでの再パースを行わないようにしました (#2609)
- [IDE Plugin] 関連付けられた仮想ファイルが null の場合、モジュールも null になるよう処理しました (#2607)
- [IDE Plugin] 未使用クエリのインスペクション中のクラッシュを回避しました (#2610)
- [IDE Plugin] データベース同期の書き込みをライト・アクション (Write Action) 内で実行するようにしました (#2605)
- [IDE Plugin] SQLDelight の同期スケジュールを IDE に委ねるようにしました
- [IDE Plugin] JavaTypeMixin における NPE を修正しました (#2603 by @aperfilyev)
- [IDE Plugin] MismatchJoinColumnInspection における IndexOutOfBoundsException を修正しました (#2602 by @aperfilyev)
- [IDE Plugin] UnusedColumnInspection の説明を追加しました (#2600 by @aperfilyev)
- [IDE Plugin] PsiElement.generatedVirtualFiles をリード・アクション内にラップしました (#2599 by @aperfilyev)
- [IDE Plugin] 不要な non-null キャストを削除しました (#2596)
- [IDE Plugin] 使用箇所の検索で null を適切に処理するようにしました (#2595)
- [IDE Plugin] Android 向けに生成されたファイルに対する IDE のオートコンプリートを修正しました (#2573 by @martinbonnin)
- [IDE Plugin] SqlDelightGotoDeclarationHandler における NPE を修正しました (by @aperfilyev)
- [IDE Plugin] INSERT 文内の引数で Kotlin キーワードをマングルするようにしました (#2433 by @aperfilyev)
- [IDE Plugin] SqlDelightFoldingBuilder における NPE を修正しました (#2382 by @aperfilyev)
- [IDE Plugin] CopyPasteProcessor における ClassCastException を捕捉するようにしました (#2369 by @aperfilyev)
- [IDE Plugin] update ライブテンプレートを修正しました (by @IliasRedissi)
- [IDE Plugin] インテンションアクションに説明を追加しました (#2489 by @aperfilyev)
- [IDE Plugin] テーブルが見つからない場合の CreateTriggerMixin の例外を修正しました (by @aperfilyev)
- [Compiler] テーブル作成文をトポロジカルソートするようにしました
- [Compiler] ディレクトリに対して `forDatabaseFiles` コールバックを呼び出すのを停止しました (#2532)
- [Gradle Plugin] generateDatabaseInterface タスクの依存関係を潜在的な利用者に伝播させるようにしました (#2518 by @martinbonnin)

## [1.5.1] - 2021-07-16 {id="1-5-1-2021-07-16"}
[1.5.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.1

### 追加 (Added)
- [PostgreSQL Dialect] PostgreSQL の JSONB および ON CONFLICT DO NOTHING (by @satook)
- [PostgreSQL Dialect] PostgreSQL の ON CONFLICT (column, ...) DO UPDATE のサポートを追加しました (by @satook)
- [MySQL Dialect] MySQL の生成列をサポートしました (by @JGulbronson)
- [Native Driver] watchosX64 のサポートを追加しました
- [IDE Plugin] パラメータ型とアノテーションを追加しました (by @aperfilyev)
- [IDE Plugin] 'select all' クエリを生成するアクションを追加しました (by @aperfilyev)
- [IDE Plugin] オートコンプリートで列の型を表示するようにしました (by @aperfilyev)
- [IDE Plugin] オートコンプリートにアイコンを追加しました (by @aperfilyev)
- [IDE Plugin] 'select by primary key' クエリを生成するアクションを追加しました (by @aperfilyev)
- [IDE Plugin] 'insert into' クエリを生成するアクションを追加しました (by @aperfilyev)
- [IDE Plugin] 列名、文の識別子、関数名に対するハイライトを追加しました (by @aperfilyev)
- [IDE Plugin] 残りのクエリ生成アクションを追加しました (#489 by @aperfilyev)
- [IDE Plugin] INSERT 文からパラメータヒントを表示するようにしました (by @aperfilyev)
- [IDE Plugin] テーブルエイリアスのインテンションアクションを追加しました (by @aperfilyev)
- [IDE Plugin] 列名を完全修飾するインテンションを追加しました (by @aperfilyev)
- [IDE Plugin] Kotlin プロパティの宣言へのジャンプを追加しました (by @aperfilyev)

### 変更 (Changed)
- [Native Driver] 可能な限りフリーズや共有可能データ構造を回避することで、ネイティブトランザクションのパフォーマンスを改善しました (by @andersio)
- [Paging 3] Paging3 のバージョンを 3.0.0 安定版に引き上げました
- [JS Driver] sql.js を 1.5.0 にアップグレードしました

### 修正 (Fixed)
- [JDBC SQLite Driver] ThreadLocal をクリアする前にコネクションの close() を呼び出すようにしました (#2444 by @hannesstruss)
- [RX extensions] 購読 (subscription) / 破棄 (disposal) の競合によるリークを修正しました (#2403 by @pyricau)
- [Coroutines extension] 通知を行う前に確実にクエリリスナーを登録するようにしました
- [Compiler] Kotlin 出力ファイルを一貫させるために notifyQueries をソートするようにしました (by @thomascjy)
- [Compiler] select クエリクラスのプロパティに @JvmField アノテーションを付与しないようにしました (#eygraber による)
- [IDE Plugin] インポートの最適化を修正しました (#2350 by @aperfilyev)
- [IDE Plugin] 未使用列のインスペクションを修正しました (by @aperfilyev)
- [IDE Plugin] インポートのインスペクションとクラスアノテーターにネストされたクラスのサポートを追加しました (by @aperfilyev)
- [IDE Plugin] CopyPasteProcessor における NPE を修正しました (#2363 by @aperfilyev)
- [IDE Plugin] InlayParameterHintsProvider のクラッシュを修正しました (#2359 by @aperfilyev)
- [IDE Plugin] CREATE TABLE 文内に任意のテキストをコピー＆ペーストした際に空行が挿入される問題を修正しました (#2431 by @aperfilyev)

## [1.5.0] - 2021-04-23 {id="1-5-0-2021-04-23"}
[1.5.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.0

### 追加 (Added)
- [SQLite Javascript Driver] sqljs-driver の公開を有効化しました (#1667 by @dellisd)
- [Paging3 Extension] Android Paging 3 ライブラリ向け拡張機能 (#1786 by @kevincianfarini)
- [MySQL Dialect] MySQL の ON DUPLICATE KEY UPDATE 競合解決のサポートを追加しました (by @rharter)
- [SQLite Dialect] SQLite の offsets() に対するコンパイラサポートを追加しました (by @qjroberts)
- [IDE Plugin] 未知の型に対するインポートのクイックフィックスを追加しました (#683 by @aperfilyev)
- [IDE Plugin] 未使用のインポートのインスペクションを追加しました (#1161 by @aperfilyev)
- [IDE Plugin] 未使用クエリのインスペクションを追加しました (by @aperfilyev)
- [IDE Plugin] 未使用列のインスペクションを追加しました (#569 by @aperfilyev)
- [IDE Plugin] コピー＆ペースト時にインポートを自動的に取り込むようにしました (#684 by @aperfilyev)
- [IDE Plugin] Gradle と IntelliJ プラグインのバージョン間に互換性がない場合に通知バルーンを表示するようにしました
- [IDE Plugin] Insert Into ... VALUES(?) のパラメータヒントを追加しました (#506 by @aperfilyev)
- [IDE Plugin] インラインパラメータヒントを追加しました (by @aperfilyev)
- [Runtime] コールバックを伴うマイグレーション実行用の API をランタイムに追加しました (#1844)

### 変更 (Changed)
- [Compiler] "IS NOT NULL" クエリをスマートキャストするようにしました (#867)
- [Compiler] 実行時に失敗するキーワードに対する防御策を追加しました (#1471, #1629)
- [Gradle Plugin] Gradle プラグインのサイズを 60MB から 13MB に削減しました
- [Gradle Plugin] Android バリアントを適切にサポートし、KMM ターゲット固有の SQL サポートを削除しました (#1039)
- [Gradle Plugin] minsdk に基づいて最小 SQLite バージョンを選択するようにしました (#1684)
- [Native Driver] Native ドライバーのコネクションプールとパフォーマンスを更新しました

### 修正 (Fixed)
- [Compiler] ラムダの前の NBSP (ノーブレークスペース) を修正しました (by @oldergod)
- [Compiler] 生成された bind* および cursor.get* 文における型の非互換性を修正しました
- [Compiler] SQL 句が適合した型 (adapted type) を保持するようにしました (#2067)
- [Compiler] NULL キーワードのみの列を nullable になるよう修正しました
- [Compiler] 型アノテーション付きのマッパーラムダを生成しないようにしました (#1957)
- [Compiler] カスタムクエリが競合する場合、追加のパッケージサフィックスとしてファイル名を使用するようにしました (#1057, #1278)
- [Compiler] 外部キーのカスケードによって確実にクエリリスナーへ通知されるようにしました (#1325, #1485)
- [Compiler] 同じ型の 2 つを UNION する場合、テーブルの型を返すようにしました (#1342)
- [Compiler] ifnull および coalesce へのパラメータが nullable になれるよう修正しました (#1263)
- [Compiler] 式に対してクエリから課される null 許容性を正しく適用するようにしました
- [MySQL Dialect] MySQL の IF 文をサポートしました
- [PostgreSQL Dialect] PostgreSQL で NUMERIC および DECIMAL を Double として取得するようにしました (#2118)
- [SQLite Dialect] UPSERT 通知が BEFORE/AFTER UPDATE トリガーを考慮するようにしました (#2198 by @andersio)
- [SQLite Driver] インメモリでない限り、SqliteDriver のスレッドに対して複数のコネクションを使用するようにしました (#1832)
- [JDBC Driver] JDBC ドライバーが autoCommit を true と仮定してしまう問題を修正しました (#2041)
- [JDBC Driver] 例外発生時に確実にコネクションを閉じるようにしました (#2306)
- [IDE Plugin] パス区切り文字のバグにより Windows で GoToDeclaration / FindUsages が壊れていた問題を修正しました (#2054 by @angusholder)
- [IDE Plugin] IDE 内でクラッシュする代わりに Gradle エラーを無視するようにしました
- [IDE Plugin] sqldelight ファイルが SQLDelight 非対応のモジュールに移動された場合、コード生成を試行しないようにしました
- [IDE Plugin] IDE 内でのコード生成エラーを無視するようにしました
- [IDE Plugin] 負のインデックスで substring を試みないようにしました (#2068)
- [IDE Plugin] Gradle アクションを実行する前にプロジェクトが破棄されていないかも確認するようにしました (#2155)
- [IDE Plugin] nullable な型に対する演算も nullable になるよう修正しました (#1853)
- [IDE Plugin] 「* の展開 (expand * intention)」が追加の射影 (projections) と連動するようにしました (#2173 by @aperfilyev)
- [IDE Plugin] GoTo 中に Kotlin の解決に失敗した場合、sqldelight ファイルへの移動を試みないようにしました
- [IDE Plugin] SQLDelight のインデックス作成中に IntelliJ で例外が発生してもクラッシュしないようにしました
- [IDE Plugin] IDE でのコード生成前にエラーを検出する際に発生する例外を処理するようにしました
- [IDE Plugin] IDE プラグインを動的プラグイン (Dynamic Plugins) に対応させました (#1536)
- [Gradle Plugin] WorkerApi を使用したデータベース生成における競合状態を修正しました (#2062 by @stephanenicolas)
- [Gradle Plugin] classLoaderIsolation によりカスタム JDBC の使用が妨げられていた問題を修正しました (#2048 by @benasher44)
- [Gradle Plugin] packageName 不足時のエラーメッセージを改善しました (by @vanniktech)
- [Gradle Plugin] SQLDelight がビルドスクリプトのクラスパスに IntelliJ の依存関係を混入させていた問題を修正しました (#1998)
- [Gradle Plugin] Gradle のビルドキャッシュを修正しました (#2075)
- [Gradle Plugin] Gradle プラグインで kotlin-native-utils に依存しないようにしました (by @ilmat192)
- [Gradle Plugin] マイグレーションファイルしか存在しない場合でもデータベースを書き出すようにしました (#2094)
- [Gradle Plugin] 最終的なコンパイル単位でダイヤモンド依存関係が一度だけ取得されるようにしました (#1455)

また、本リリースで SQLDelight のインフラ改善に多大な貢献をしてくれた @3flex 氏にも感謝します。

## [1.4.4] - 2020-10-08 {id="1-4-4-2020-10-08"}
[1.4.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.4

### 追加 (Added)
- [PostgreSQL Dialect] WITH 内でのデータ変更文をサポートしました
- [PostgreSQL Dialect] substring 関数をサポートしました
- [Gradle Plugin] SQLDelight コンパイル中にマイグレーションを検証するための verifyMigrations フラグを追加しました (#1872)

### 変更 (Changed)
- [Compiler] 非 SQLite ダイアレクトにおいて、SQLite 固有の関数を未知 (unknown) としてフラグを立てるようにしました
- [Gradle Plugin] sqldelight プラグインが適用されているにもかかわらずデータベースが設定されていない場合に警告を出すようにしました (#1421)

### 修正 (Fixed)
- [Compiler] ORDER BY 句内で列名をバインドした際にエラーを報告するようにしました (#1187 by @eygraber)
- [Compiler] DB インターフェース生成時にレジストリ警告が表示される問題を修正しました (#1792)
- [Compiler] CASE 文の誤った型推論を修正しました (#1811)
- [Compiler] バージョンのないマイグレーションファイルに対してより適切なエラーを出すようにしました (#2006)
- [Compiler] 一部のデータベース型の ColumnAdapter において、マーシャリングに必要なデータベース型が誤っていた問題を修正しました (#2012)
- [Compiler] CAST の null 許容性を修正しました (#1261)
- [Compiler] クエリラッパーで名前のシャドウイング警告が多発する問題を修正しました (#1946 by @eygraber)
- [Compiler] 生成されたコードが完全修飾名を使用していた問題を修正しました (#1939)
- [IDE Plugin] Gradle の同期から SQLDelight のコード生成をトリガーするようにしました
- [IDE Plugin] .sq ファイルの変更時にプラグインがデータベースインターフェースを再生成しない問題を修正しました (#1945)
- [IDE Plugin] 新しいパッケージにファイルを移動した際の問題を修正しました (#444)
- [IDE Plugin] カーソルの移動先がない場合は、クラッシュする代わりに何もしないようにしました (#1994)
- [IDE Plugin] Gradle プロジェクト外のファイルには空のパッケージ名を使用するようにしました (#1973)
- [IDE Plugin] 無効な型に対して正常に失敗するようにしました (#1943)
- [IDE Plugin] 未知の式に遭遇した際により適切なエラーメッセージをスローするようにしました (#1958)
- [Gradle Plugin] SQLDelight がビルドスクリプトのクラスパスに IntelliJ の依存関係を混入させていた問題を修正しました (#1998)
- [Gradle Plugin] *.sq ファイル内でメソッドのドキュメントを追加した際の「JavadocIntegrationKt not found」コンパイルエラーを修正しました (#1982)
- [Gradle Plugin] SqlDelight Gradle プラグインが Configuration Cache (CoCa) をサポートしていなかった問題を修正しました (#1947 by @stephanenicolas)
- [SQLite JDBC Driver] SQLException: database in auto-commit mode を修正しました (#1832)
- [Coroutines Extension] coroutines-extensions の IR バックエンドを修正しました (#1918 by @dellisd)

## [1.4.3] - 2020-09-04 {id="1-4-3-2020-09-04"}
[1.4.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.3

### 追加 (Added)
- [MySQL Dialect] MySQL の last_insert_id 関数のサポートを追加しました (by @lawkai)
- [PostgreSQL Dialect] SERIAL データ型のサポートを追加しました (by @veyndan & @felipecsl)
- [PostgreSQL Dialect] PostgreSQL の RETURNING をサポートしました (by @veyndan)

### 修正 (Fixed)
- [MySQL Dialect] MySQL の AUTO_INCREMENT をデフォルト値を持つものとして扱うようにしました (#1823)
- [Compiler] Upsert 文のコンパイルエラーを修正しました (#1809 by @eygraber)
- [Compiler] 無効な Kotlin が生成される問題を修正しました (#1925 by @eygraber)
- [Compiler] 未知の関数に対してより適切なエラーメッセージを表示するようにしました (#1843)
- [Compiler] instr の第2引数の型として String を公開するようにしました
- [IDE Plugin] IDE プラグインによるデーモンの肥大化と UI スレッドの停止を修正しました (#1916)
- [IDE Plugin] モジュールが null になるシナリオを処理しました (#1902)
- [IDE Plugin] 未設定の sq ファイルではパッケージ名に空文字列を返すようにしました (#1920)
- [IDE Plugin] グループ化された文を修正し、その統合テストを追加しました (#1820)
- [IDE Plugin] 要素のモジュールを検索するために組み込みの ModuleUtil を使用するようにしました (#1854)
- [IDE Plugin] ルックアップには有効な要素のみを追加するようにしました (#1909)
- [IDE Plugin] 親が null になる可能性を考慮しました (#1857)

## [1.4.2] - 2020-08-27 {id="1-4-2-2020-08-27"}
[1.4.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.2

### 追加 (Added)
- [Runtime] 新しい JS IR バックエンドをサポートしました
- [Gradle Plugin] generateSqlDelightInterface Gradle タスクを追加しました (by @vanniktech)
- [Gradle Plugin] verifySqlDelightMigration Gradle タスクを追加しました (by @vanniktech)

### 修正 (Fixed)
- [IDE Plugin] IDE と Gradle 間のデータ共有を容易にするために Gradle tooling API を使用するようにしました
- [IDE Plugin] スキーマ導出のデフォルトを false に変更しました
- [IDE Plugin] commonMain ソースセットを適切に取得するようにしました
- [MySQL Dialect] mySqlFunctionType() に MINUTE を追加しました (by @maaxgr)

## [1.4.1] - 2020-08-21 {id="1-4-1-2020-08-21"}
[1.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.1

### 追加 (Added)
- [Runtime] Kotlin 1.4.0 をサポートしました (#1859)

### 変更 (Changed)
- [Gradle Plugin] AGP 依存関係を compileOnly に変更しました (#1362)

### 修正 (Fixed)
- [Compiler] 列定義ルールおよびテーブルインターフェースジェネレーターに任意の Javadoc を追加できるようにしました (#1224 by @endanke)
- [SQLite Dialect] SQLite FTS5 の補助関数 highlight、snippet、bm25 のサポートを追加しました (by @drampelt)
- [MySQL Dialect] MySQL の BIT データ型をサポートしました
- [MySQL Dialect] MySQL のバイナリリテラルをサポートしました
- [PostgreSQL Dialect] sql-psi から SERIAL を公開しました (by @veyndan)
- [PostgreSQL Dialect] BOOLEAN データ型を追加しました (by @veyndan)
- [PostgreSQL Dialect] NULL 列制約を追加しました (by @veyndan)
- [HSQL Dialect] HSQL に `AUTO_INCREMENT` のサポートを追加しました (by @rharter)

## [1.4.0] - 2020-06-22 {id="1-4-0-2020-06-22"}
[1.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.0

### 追加 (Added)
- [MySQL Dialect] MySQL サポート (by @JGulbronson & @veyndan)
- [PostgreSQL Dialect] 実験的な PostgreSQL サポート (by @veyndan)
- [HSQL Dialect] 実験的な H2 サポート (by @MariusVolkhart)
- [SQLite Dialect] SQLite FTS5 サポート (by @benasher44 & @jpalawaga)
- [SQLite Dialect] alter table rename column をサポートしました (#1505 by @angusholder)
- [IDE] マイグレーション (.sqm) ファイルの IDE サポート
- [IDE] 組み込みの SQL ライブテンプレートを模倣した SQLDelight ライブテンプレートを追加しました (#1154 by @veyndan)
- [IDE] 新規 SqlDelight ファイル作成アクションを追加しました (#42 by @romtsn)
- [Runtime] 結果を返すトランザクション用の transactionWithReturn API
- [Compiler] .sq ファイル内で複数の SQL 文をグループ化するための構文
- [Compiler] マイグレーションファイルからのスキーマ生成をサポートしました
- [Gradle Plugin] マイグレーションファイルを有効な SQL として出力するタスクを追加しました

### 変更 (Changed)
- [Documentation] ドキュメント Web サイトの全面的な改訂 (by @saket)
- [Gradle Plugin] サポートされていないダイアレクトのエラーメッセージを改善しました (by @veyndan)
- [IDE] ダイアレクトに基づいて動的にファイルアイコンを変更するようにしました (by @veyndan)
- [JDBC Driver] javax.sql.DataSource から JdbcDriver のコンストラクタを公開しました (#1614)

### 修正 (Fixed)
- [Compiler] テーブルでの Javadoc をサポートし、1 つのファイルに複数の Javadoc がある場合を修正しました (#1224)
- [Compiler] 合成列への値の挿入を可能にしました (#1351)
- [Compiler] ディレクトリ名のサニタイズにおける不整合を修正しました (by @ZacSweers)
- [Compiler] 合成列が JOIN をまたいでも null 許容性を維持するようにしました (#1656)
- [Compiler] DELETE 文のピン留め位置を delete キーワードに修正しました (#1643)
- [Compiler] クォート処理を修正しました (#1525 by @angusholder)
- [Compiler] BETWEEN 演算子が式を適切に再帰処理するよう修正しました (#1279)
- [Compiler] インデックス作成時にテーブル/列が見つからない場合のより適切なエラーを表示するようにしました (#1372)
- [Compiler] JOIN 制約内で外部クエリの射影を使用できるようにしました (#1346)
- [Native Driver] execute が transactionPool を使用するように変更しました (by @benasher44)
- [JDBC Driver] SQLite の代わりに JDBC のトランザクション API を使用するようにしました (#1693)
- [IDE] virtualFile の参照が常に元のファイルになるよう修正しました (#1782)
- [IDE] Bugsnag へのエラー報告時に正しい throwable を使用するようにしました (#1262)
- [Paging Extension] DataSource のリークを修正しました (#1628)
- [Gradle Plugin] スキーマ生成時に出力先 DB ファイルが既に存在する場合は削除するようにしました (#1645)
- [Gradle Plugin] マイグレーションに欠番がある場合に検証を失敗させるようにしました
- [Gradle Plugin] 設定したファイルインデックスを明示的に使用するようにしました (#1644)

## [1.3.0] - 2020-04-03 {id="1-3-0-2020-04-03"}
[1.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.3.0

* 新機能: [Gradle] コンパイル対象の SQL ダイアレクトを指定する dialect プロパティを追加しました。
* 新機能: [Compiler] #1009 MySQL ダイアレクトを実験的にサポートしました。
* 新機能: [Compiler] #1436 sqlite:3.24 ダイアレクトおよび UPSERT をサポートしました。
* 新機能: [JDBC Driver] SQLite JVM ドライバーから JDBC ドライバーを分離しました。
* 修正: [Compiler] #1199 任意の長さのラムダをサポートしました。
* 修正: [Compiler] #1610 avg() の戻り値の型が nullable になるよう修正しました。
* 修正: [IntelliJ] #1594 Windows で Goto や Find Usages が壊れていたパス区切り文字の処理を修正しました。

## [1.2.2] - 2020-01-22 {id="1-2-2-2020-01-22"}
[1.2.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.2

* 新機能: [Runtime] Windows (mingw)、tvOS、watchOS、macOS アーキテクチャをサポートしました。
* 修正: [Compiler] sum() の戻り値の型が nullable になるように修正しました。
* 修正: [Paging] 競合状態を避けるため、QueryDataSourceFactory に Transacter を渡すようにしました。
* 修正: [IntelliJ Plugin] ファイルのパッケージ名を検索する際に依存関係内を検索しないようにしました。
* 修正: [Gradle] #862 Gradle 内のバリデータログを debug レベルに変更しました。
* 改善: [Gradle] GenerateSchemaTask が Gradle ワーカーを使用するように変更しました。
* 注意: sqldelight-runtime アーティファクトは runtime に名前が変更されました。

## [1.2.1] - 2019-12-11 {id="1-2-1-2019-12-11"}
[1.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.1

* 修正: [Gradle] Kotlin/Native 1.3.60 をサポートしました。
* 修正: [Gradle] #1287 同期時の警告を修正しました。
* 修正: [Compiler] #1469 クエリに対する SynetheticAccessor の作成を修正しました。
* 修正: [JVM Driver] メモリリークを修正しました。
* 注意: coroutine 拡張アーティファクトを使用する場合、buildscript に kotlinx の bintray maven リポジトリを追加する必要があります。

## [1.2.0] - 2019-08-30 {id="1-2-0-2019-08-30"}
[1.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.0

* 新機能: [Runtime] 安定版の Flow API を追加しました。
* 修正: [Gradle] Kotlin/Native 1.3.50 をサポートしました。
* 修正: [Gradle] #1380 クリーンビルドが失敗することがある問題を修正しました。
* 修正: [Gradle] #1348 verify タスクの実行時に「Could not retrieve functions」と出力される問題を修正しました。
* 修正: [Compile] #1405 クエリに FTS テーブルの結合が含まれている場合にプロジェクトをビルドできない問題を修正しました。
* 修正: [Gradle] #1266 複数のデータベースモジュールがある場合に Gradle ビルドが散発的に失敗する問題を修正しました。

## [1.1.4] - 2019-07-11 {id="1-1-4-2019-07-11"}
[1.1.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.4

* 新機能: [Runtime] 実験的な Kotlin Flow API を追加しました。
* 修正: [Gradle] Kotlin/Native 1.3.40 との互換性を確保しました。
* 修正: [Gradle] #1243 Gradle の Configure on demand とともに SQLDelight を使用する場合の問題を修正しました。
* 修正: [Gradle] #1385 インクリメンタルなアノテーション処理とともに SQLDelight を使用する場合の問題を修正しました。
* 修正: [Gradle] Gradle タスクのキャッシュを許可しました。
* 修正: [Gradle] #1274 Kotlin DSL での sqldelight 拡張機能の使用を可能にしました。
* 修正: [Compiler] 各クエリに対して決定論的に一意の ID が生成されるようにしました。
* 修正: [Compiler] トランザクションが完了したときにのみリスニングしているクエリへ通知するようにしました。
* 修正: [JVM Driver] #1370 JdbcSqliteDriver の利用者に DB URL の指定を必須としました。

## [1.1.3] - 2019-04-14 {id="1-1-3-2019-04-14"}
[1.1.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.3

* Gradle Metadata 1.0 リリースに対応しました。

## [1.1.2] - 2019-04-14 {id="1-1-2-2019-04-14"}
[1.1.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.2

* 新機能: [Runtime] #1267 ロギング用ドライバーデコレーターを追加しました。
* 修正: [Compiler] #1254 2^16 文字を超える文字列リテラルを分割するようにしました。
* 修正: [Gradle] #1260 マルチプラットフォームプロジェクトで生成されたソースが iOS ソースとして認識される問題を修正しました。
* 修正: [IDE] #1290 CopyAsSqliteAction.kt:43 での kotlin.KotlinNullPointerException を修正しました。
* 修正: [Gradle] #1268 最近のバージョンで linkDebugFrameworkIos* タスクの実行に失敗する問題を修正しました。

## [1.1.1] - 2019-03-01 {id="1-1-1-2019-03-01"}
[1.1.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.1

* 修正: [Gradle] Android プロジェクトにおけるモジュール依存関係のコンパイルを修正しました。
* 修正: [Gradle] #1246 afterEvaluate で API 依存関係をセットアップするようにしました。
* 修正: [Compiler] 配列型が正しく出力されるようにしました。

## [1.1.0] - 2019-02-27 {id="1-1-0-2019-02-27"}
[1.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.0

* 新機能: [Gradle] #502 スキーマモジュールの依存関係を指定できるようにしました。
* 改善: [Compiler] #1111 テーブルのエラーが他のエラーよりも前にソートされるようにしました。
* 修正: [Compiler] #1225 REAL リテラルに対して正しい型を返すようにしました。
* 修正: [Compiler] #1218 トリガーを経由して docid が伝播するようにしました。

## [1.0.3] - 2019-01-30 {id="1-0-3-2019-01-30"}
[1.0.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.3

* 改善: [Runtime] #1195 Native Driver/Runtime の Arm32 サポート。
* 改善: [Runtime] #1190 Query 型からマッパーを公開するようにしました。

## [1.0.2] - 2019-01-26 {id="1-0-2-2019-01-26"}
[1.0.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.2

* 修正: [Gradle Plugin] Kotlin 1.3.20 に更新しました。
* 修正: [Runtime] トランザクションが例外をもみ消さないようにしました。

## [1.0.1] - 2019-01-21 {id="1-0-1-2019-01-21"}
[1.0.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.1

* 改善: [Native Driver] DatabaseConfiguration にディレクトリ名を渡せるようにしました。
* 改善: [Compiler] #1173 パッケージのないファイルでコンパイルが失敗するようにしました。
* 修正: [IDE] Square に IDE エラーを適切に報告するようにしました。
* 修正: [IDE] #1162 同じパッケージ内の型がエラーとして表示されるものの正常に機能する問題を修正しました。
* 修正: [IDE] #1166 テーブルのリネームが NPE で失敗する問題を修正しました。
* 修正: [Compiler] #1167 UNION と SELECT を含む複雑な SQL 文をパースしようとすると例外がスローされる問題を修正しました。

## [1.0.0] - 2019-01-08 {id="1-0-0-2019-01-08"}
[1.0.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.0

* 新機能: 生成されるコードを全面的に見直し、Kotlin に刷新しました。
* 新機能: RxJava2 拡張アーティファクト。
* 新機能: Android Paging 拡張アーティファクト。
* 新機能: Kotlin Multiplatform のサポート。
* 新機能: Android、iOS、および JVM SQLite ドライバーアーティファクト。
* 新機能: トランザクション API。

## [0.7.0] - 2018-02-12 {id="0-7-0-2018-02-12"}
[0.7.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.7.0

 * 新機能: 生成されるコードが更新され、Support SQLite ライブラリのみを使用するようになりました。すべてのクエリは生の文字列ではなくステートメントオブジェクトを生成するようになりました。
 * 新機能: IDE でのステートメントの折りたたみ (Statement folding)。
 * 新機能: Boolean 型が自動的に処理されるようになりました。
 * 修正: コード生成から非推奨の marshal を削除しました。
 * 修正: 'avg' SQL 関数の型マッピングが REAL になるよう修正しました。
 * 修正: 'julianday' SQL 関数を正しく検出するようにしました。

## [0.6.1] - 2017-03-22 {id="0-6-1-2017-03-22"}
[0.6.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.6.1

 * 新機能: 引数のない DELETE、UPDATE、INSERT 文に対して、コンパイル済みステートメントが生成されるようになりました。
 * 修正: サブクエリで使用されているビュー内の USING 句でエラーが発生しないようにしました。
 * 修正: 生成された Mapper での重複した型を削除しました。
 * 修正: 引数に対してチェックを行う式でサブクエリを使用できるようにしました。

## [0.6.0] - 2017-03-06 {id="0-6-0-2017-03-06"}
[0.6.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.6.0

 * 新機能: SELECT クエリは文字列定数の代わりに `SqlDelightStatement` ファクトリとして公開されるようになりました。
 * 新機能: クエリの JavaDoc がステートメントおよびマッパーファクトリにコピーされるようになりました。
 * 新機能: ビュー名用の文字列定数を出力するようにしました。
 * 修正: ファクトリを必要とするビューに対するクエリで、それらのファクトリを引数として正しく要求するようにしました。
 * 修正: INSERT への引数の数が指定された列数と一致しているかを検証するようにしました。
 * 修正: WHERE 句で使用される BLOB リテラルを適切にエンコードするようにしました。
 * このリリースには Gradle 3.3 以降が必要です。

## [0.5.1] - 2016-10-24 {id="0-5-1-2016-10-24"}
[0.5.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.5.1

 * 新機能: コンパイル済みステートメントが抽象型を継承するようにしました。
 * 修正: パラメータ内のプリミティブ型が nullable の場合はボクシングされるようにしました。
 * 修正: バインド引数に必要なすべてのファクトリがファクトリメソッド内に存在するようにしました。
 * 修正: エスケープされた列名が正しくマーシャリングされるようにしました。

## [0.5.0] - 2016-10-19 {id="0-5-0-2016-10-19"}
[0.5.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.5.0

 * 新機能: SQLite の引数を Factory を通じて型安全に渡せるようにしました。
 * 新機能: IntelliJ プラグインが .sq ファイルのフォーマットを実行するようにしました。
 * 新機能: SQLite のタイムスタンプリテラルをサポートしました。
 * 修正: IntelliJ でパラメータ化された型をクリックしてジャンプできるようにしました。
 * 修正: Cursor から取得した場合にエスケープされた列名が RuntimeException をスローしないようにしました。
 * 修正: Gradle プラグインが例外を出力しようとしてクラッシュしないようにしました。

## [0.4.4] - 2016-07-20 {id="0-4-4-2016-07-20"}
[0.4.4]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.4

 * 新機能: 列の Java 型としての Short をネイティブサポートしました。
 * 新機能: 生成されたマッパーおよびファクトリメソッドに Javadoc を追加しました。
 * 修正: group_concat および nullif 関数が適切な null 許容性を持つようにしました。
 * 修正: Android Studio 2.2-alpha との互換性を確保しました。
 * 修正: WITH RECURSIVE によってプラグインがクラッシュしないようにしました。

## [0.4.3] - 2016-07-07 {id="0-4-3-2016-07-07"}
[0.4.3]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.3

 * 新機能: コンパイルエラーからソースファイルへリンクするようにしました。
 * 新機能: 右クリックで SQLDelight コードを有効な SQLite としてコピーできるようにしました。
 * 新機能: 名前付きステートメントの Javadoc が生成された String 上に表示されるようにしました。
 * 修正: 生成されたビューモデルに null 許容性アノテーションを含めるようにしました。
 * 修正: UNION から生成されたコードが、すべての可能な列をサポートするために適切な型と null 許容性を持つようにしました。
 * 修正: SQLite 関数の sum および round が、生成コード内で適切な型を持つようにしました。
 * 修正: CAST および内部 SELECT のバグを修正しました。
 * 修正: CREATE TABLE 文内でのオートコンプリートを修正しました。
 * 修正: パッケージ内で SQLite キーワードを使用できるようにしました。

## [0.4.2] - 2016-06-16 {id="0-4-2-2016-06-16"}
[0.4.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.2

 * 新機能: Factory から Marshal を作成できるようにしました。
 * 修正: IntelliJ プラグインが適切なジェネリクス順序でファクトリメソッドを生成するようにしました。
 * 修正: 関数名の大文字・小文字を問わず使用できるようにしました。

## [0.4.1] - 2016-06-14 {id="0-4-1-2016-06-14"}
[0.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.1

 * 修正: IntelliJ プラグインが適切なジェネリクス順序でクラスを生成するようにしました。
 * 修正: 列定義の大文字・小文字を問わず使用できるようにしました。

## [0.4.0] - 2016-06-14 {id="0-4-0-2016-06-14"}
[0.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.0

 * 新機能: マッパーがテーブル単位ではなくクエリ単位で生成されるようになりました。
 * 新機能: .sq ファイル内で Java の型をインポートできるようにしました。
 * 新機能: SQLite 関数が検証されるようになりました。
 * 修正: 重複したエラーを削除しました。
 * 修正: 大文字の列名および Java キーワードと同じ列名でエラーが発生しないようにしました。

## [0.3.2] - 2016-05-14 {id="0-3-2-2016-05-14"}
[0.3.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.2

 * 新機能: オートコンプリートと使用箇所の検索がビューおよびエイリアスでも機能するようになりました。
 * 修正: コンパイル時の検証で、SELECT 内での関数の使用を許可するようにしました。
 * 修正: デフォルト値のみを宣言する INSERT 文をサポートしました。
 * 修正: SQLDelight を使用していないプロジェクトをインポートした際にプラグインがクラッシュしないようにしました。

## [0.3.1] - 2016-04-27 {id="0-3-1-2016-04-27"}
[0.3.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.1

  * 修正: メソッド参照からの Illegal Access 実行時例外を回避するため、インターフェースの可視性を public に戻しました。
  * 修正: 部分式 (Subexpressions) が適切に評価されるようにしました。

## [0.3.0] - 2016-04-26 {id="0-3-0-2016-04-26"}
[0.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.0

  * 新機能: 列定義で SQLite の型を使用し、さらに Java の型を指定するための 'AS' 制約を持てるようにしました。
  * 新機能: IDE からバグレポートを送信できるようにしました。
  * 修正: オートコンプリートが適切に機能するようにしました。
  * 修正: .sq ファイルの編集時に SQLDelight モデルファイルが更新されるようにしました。
  * 削除: アタッチされたデータベース (Attached databases) のサポートを終了しました。

## [0.2.2] - 2016-03-07 {id="0-2-2-2016-03-07"}
[0.2.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.2

 * 新機能: INSERT、UPDATE、DELETE、INDEX、TRIGGER 文で使用される列のコンパイル時検証を追加しました。
 * 修正: ファイルの移動/作成時に IDE プラグインがクラッシュしないようにしました。

## [0.2.1] - 2016-03-07 {id="0-2-1-2016-03-07"}
[0.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.1

 * 新機能: Ctrl+`/` (macOS では Cmd+`/`) で選択した行のコメントを切り替えられるようにしました。
 * 新機能: SQL クエリで使用される列のコンパイル時検証を追加しました。
 * 修正: IDE と Gradle プラグインの両方で Windows のパスをサポートしました。

## [0.2.0] - 2016-02-29 {id="0-2-0-2016-02-29"}
[0.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.0

 * 新機能: Marshal クラスにコピーコンストラクタを追加しました。
 * 新機能: Kotlin 1.0 正式版に更新しました。
 * 修正: 'sqldelight' フォルダ構造の問題を、ビルドを失敗させない形で報告するようにしました。
 * 修正: `table_name` という名前の列を禁止しました (生成される定数がテーブル名定数と衝突するため)。
 * 修正: `.sq` ファイルが開かれているかどうかにかかわらず、IDE プラグインがモデルクラスを即座に生成するようにしました。
 * 修正: IDE と Gradle プラグインの両方で Windows のパスをサポートしました。

## [0.1.2] - 2016-02-13 {id="0-1-2-2016-02-13"}
[0.1.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.2

 * 修正: ほとんどのプロジェクトで Gradle プラグインの使用を妨げていたコードを削除しました。
 * 修正: Antlr ランタイムに対するコンパイラの依存関係の不足を追加しました。

## [0.1.1] - 2016-02-12 {id="0-1-1-2016-02-12"}
[0.1.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.1

 * 修正: Gradle プラグインが自身と同じバージョンのランタイムを確実に参照するようにしました。

## [0.1.0] - 2016-02-12 {id="0-1-0-2016-02-12"}
[0.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.0

初期リリース。