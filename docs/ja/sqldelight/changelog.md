# 変更履歴

## 未リリース {id="unreleased"}

### 追加 {id="added"}

- まだありません！

### 変更 {id="changed"}

- まだありません！

### 修正 {id="fixed"}

- [Runtime] トランザクションの終了時やロールバック後フック（post-rollback hook）も失敗した場合（例えば SQLite が独自にトランザクションをロールバックした後の `cannot rollback - no transaction is active` など）、トランザクション本体の例外を保持するように修正。2つ目の例外は抑制された例外（suppressed exception）として追加され、Android ドライバーは `endTransaction()` が例外をスローした場合でも現在のトランザクションをクリアするようになりました (#6387 by @pyricau)
- [Gradle Plugin] Configuration.visible プロパティは効果を持たなくなりました。このプロパティは非推奨となり、Gradle 11 で削除される予定です (#6394 by @griffio)
- [IntelliJ Plugin] JOIN インスペクションで誤検知（false positive）が発生する問題を修正 (#6398 by @griffio)
- [JDBC Driver] コミット/ロールバックの失敗時に接続がリークする問題を修正 (#6401 by @tKe)

## [2.4.1] - 2026-10-06 {id="2-4-1-2026-10-06"}
[2.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.1

### 追加

- [Documentation] Android SQLite トランザクションに関するドキュメントを追加 (#6381 by @griffio)

### 変更

- [Gradle Plugin] パース済みの `.sq` ファイルをコード生成タスク全体を通じてメモリ上に保持し、ガベージコレクション後に再パースされないように変更。これにより大規模プロジェクトでのコード生成が高速化されます (#6374 by @C2H6O)
- [IntelliJ Plugin] クラッシュレポートの送信先をカスタム Bugsnag インスタンスから JetBrains Marketplace に変更 (#6376 by @JakeWharton)

### 修正

- [IntelliJ Plugin] IntelliJ API の利用方法を変更し、プラグイン公開規約違反を修正 (#6366 #6368 by @griffio)
- [IntelliJ Plugin] 未処理のエラーをトラップすることで、タイピング時の安定性を向上 (#6355 by @griffio)

## [2.4.0] - 2026-09-17 {id="2-4-0-2026-09-17"}
[2.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0

### 追加
- [Native Driver] `inMemoryDriver` に `extendedConfig` パラメータを追加 (#5539 by @GuilhE)
- [PostgreSQL Dialect] 暗黙的に定義されたシステム列（System Columns）のクエリサポートを追加 (#5834 by @griffio)
- [PostgreSQL Dialect] 基本的な配列リテラルのサポートを追加 (#5997 by @griffio)
- [PostgreSQL Dialect] 基本的な LTREE のサポートを追加 (#5880 by @yesitskev @griffio)
- [MySQL Dialect] INET 関数のサポートを追加 (#5072 by @mcxinyu)
- [PostgreSQL Dialect] ALTER INDEX のサポートを追加 (#6224 by @griffio)
- [SQLite Dialect] SQLite 3.44 の集約関数 DISTINCT、ORDER BY、FILTER のサポートを追加 (#6236 by @griffio)
- [SQLite Dialect] SQLite 3.37 の STRICT テーブルのサポートを追加 (#6230 by @griffio)
- [Gradle Plugin] `codegenExcludedColumns` による生成モデルからの列除外サポートを追加 (#6243 by @sokolikp)
- [Compiler] スキーマに `allTableNames` 関数を追加 (#6245 by @edenman)
- [PostgreSQL Dialect] ANY 演算子のサポートを追加 (#6253 by @griffio)
- [SQLite Dialect] SQLite 3.39 の RIGHT JOIN および FULL JOIN のサポートを追加 (#6273 by @griffio)
- [PostgreSQL Dialect] トリガー関数内での `RAISE` 文および `FOUND` 変数のサポートを追加 (#6297 by @griffio)

### 変更
- [PostgreSQL Dialect] arrayIntermediateType の可視性を public に変更 (#5835 by @griffio)
- [Gradle Plugin] より厳格な MigrationFile バージョニングを実装 (#5730 by @madisp)
- [Gradle Plugin] サポートする最小 Gradle バージョンを 8.2.1 に引き上げ (#6217 by @maxsav)
- [Gradle Plugin] Gradle の Isolated Projects をサポート (#6217 by @maxsav)
- [IntelliJ Plugin] 最小サポートバージョンを 2023.3 / Android Studio Jellyfish に変更

### 修正
- [Gradle Plugin] JDK 24+ 上でコンパイラワーカーから発生する `sun.misc.Unsafe` の非推奨警告を抑制 (#6321)
- [Compiler] 生成コード内の Kotlin 余分な警告を抑制 (#6208 by @eyupcanakman)
- [Compiler] 非グループ化集約結果セット内のその他の列が常に null 許容になるよう修正
- [PostgreSQL Dialect] coalesce および ifnull の null 許容性を正しく解決するように修正
- [PostgreSQL Dialect] PostgreSQL ダイアレクトの IDE 統合を修正
- [PostgreSQL Dialect] PostgreSQL ダイアレクト向けの IDE プラグインを改善 (#6209 by @griffio)
- [IntelliJ Plugin] IDE プラグインがすべてのダイアレクトでコード補完を実行できるように修正 (#6210 by @griffio)
- [Gradle Plugin] データベース検証タスクの実行時に発生する循環依存エラーを修正 (#6221 by @griffio)
- [Compiler] 複数行更新（multirow update）での楽観的ロックを修正 (#6240 by @griffio)
- [IntelliJ Plugin] IDEA 2026.2 でクラッシュを引き起こしていた非推奨 API の利用を修正 (#6247 by @griffio)
- [Gradle Plugin] AGP 8.9 から 8.11 において、生成されたソースが Kotlin コンパイルで認識されない問題を修正
- [PostgreSQL Dialect] プリミティブバインド引数を使用する lower および upper 関数がデフォルトで TEXT になるよう修正 (#6262 by @griffio)
- [Compiler] アダプターを使用するデータクラスバインディングでの INSERT 値および null 許容性を変更するマイグレーションを修正 (#6269 by griffio)
- [Compiler] NULL 安全演算子（IS および IS DISTINCT FROM）で null 許容バインド引数を使用するように修正 (#6265 by @griffio)
- [Gradle Plugin] プロジェクト依存関係に AGP のバリアント解決を使用するように修正 (#6217 by @maxsav)
- [Gradle Plugin] ビルド間で AGP バリアントのリストが異なる場合の generateDatabaseInterface のビルドキャッシュミスを修正
- [Gradle Plugin] データベースを設定せずにプラグインを適用した場合に IDE 同期がクラッシュする問題を修正 (#6088)
- [PostgreSQL Dialect] ネストされた関数呼び出しを使用する場合の JSON 集約関数を修正 (#6281 by @griffio)
- [Paging3 Extension] 空のデータベースで KeyedQueryPagingSource がクラッシュする問題を修正 (#6284 by @woods-marshes)
- [Compiler] `COALESCE` などのカプセル化関数とともにミューテーター文（mutator statements）を使用した場合の Java 型アダプターの問題を修正 (#6292 by @griffio)
- [Compiler] モジュール名が大文字で始まっている場合に、生成コードのパッケージ名も大文字になってしまう問題を修正 (#6316 by @griffio)
- [PostgreSQL Dialect] 日付データ型の大文字と小文字を区別しないように修正 (#6328 by @griffio)
- [PostgreSQL Dialect] `string_agg` 関数が null 許容になるよう修正 (#6340 by @griffio)
- [SQLite Dialect] `GROUP BY` を使用する SQLite 3.44 集約関数を修正 (#6343 by @griffio)
- [Gradle Plugin] 設定時（configuration time）でのデータベース依存関係の解決を回避 (#6353 by @joshfriend)

## [2.4.0-rc2] - 2026-09-14 {id="2-4-0-rc2-2026-09-14"}
[2.4.0-rc2]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0-rc2

### 修正

- [PostgreSQL Dialect] `string_agg` 関数が null 許容になるよう修正 (#6340 by @griffio)
- [SQLite Dialect] `GROUP BY` を使用する SQLite 3.44 集約関数を修正 (#6343 by @griffio)
- [Gradle Plugin] 設定時（configuration time）でのデータベース依存関係の解決を回避 (#6353 by @joshfriend)

## [2.4.0-rc1] - 2026-09-01 {id="2-4-0-rc1-2026-09-01"}
[2.4.0-rc1]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0-rc1

### 追加
- [Native Driver] `inMemoryDriver` に `extendedConfig` パラメータを追加 (#5539 by @GuilhE)
- [PostgreSQL Dialect] 暗黙的に定義されたシステム列（System Columns）のクエリサポートを追加 (#5834 by @griffio)
- [PostgreSQL Dialect] 基本的な配列リテラルのサポートを追加 (#5997 by @griffio)
- [PostgreSQL Dialect] 基本的な LTREE のサポートを追加 (#5880 by @yesitskev @griffio)
- [MySQL Dialect] INET 関数のサポートを追加 (#5072 by @mcxinyu)
- [PostgreSQL Dialect] ALTER INDEX のサポートを追加 (#6224 by @griffio)
- [SQLite Dialect] SQLite 3.44 の集約関数 DISTINCT、ORDER BY、FILTER のサポートを追加 (#6236 by @griffio)
- [SQLite Dialect] SQLite 3.37 の STRICT テーブルのサポートを追加 (#6230 by @griffio)
- [Gradle Plugin] `codegenExcludedColumns` による生成モデルからの列除外サポートを追加 (#6243 by @sokolikp)
- [Compiler] スキーマに `allTableNames` 関数を追加 (#6245 by @edenman)
- [PostgreSQL Dialect] ANY 演算子のサポートを追加 (#6253 by @griffio)
- [SQLite Dialect] SQLite 3.39 の RIGHT JOIN および FULL JOIN のサポートを追加 (#6273 by @griffio)
- [PostgreSQL Dialect] トリガー関数内での `RAISE` 文および `FOUND` 変数のサポートを追加 (#6297 by @griffio)

### 変更
- [PostgreSQL Dialect] arrayIntermediateType の可視性を public に変更 (#5835 by @griffio)
- [Gradle Plugin] より厳格な MigrationFile バージョニングを実装 (#5730 by @madisp)
- [Gradle Plugin] サポートする最小 Gradle バージョンを 8.2.1 に引き上げ (#6217 by @maxsav)
- [Gradle Plugin] Gradle の Isolated Projects をサポート (#6217 by @maxsav)
- [IntelliJ Plugin] 最小サポートバージョンを 2023.3 / Android Studio Jellyfish に変更

### 修正
- [Gradle Plugin] JDK 24+ 上でコンパイラワーカーから発生する `sun.misc.Unsafe` の非推奨警告を抑制 (#6321)
- [Compiler] 生成コード内の Kotlin 余分な警告を抑制 (#6208 by @eyupcanakman)
- [Compiler] 非グループ化集約結果セット内のその他の列が常に null 許容になるよう修正
- [PostgreSQL Dialect] coalesce および ifnull の null 許容性を正しく解決するように修正
- [PostgreSQL Dialect] PostgreSQL ダイアレクトの IDE 統合を修正
- [PostgreSQL Dialect] PostgreSQL ダイアレクト向けの IDE プラグインを改善 (#6209 by @griffio)
- [IntelliJ Plugin] IDE プラグインがすべてのダイアレクトでコード補完を実行できるように修正 (#6210 by @griffio)
- [Gradle Plugin] データベース検証タスクの実行時に発生する循環依存エラーを修正 (#6221 by @griffio)
- [Compiler] 複数行更新（multirow update）での楽観的ロックを修正 (#6240 by @griffio)
- [IntelliJ Plugin] IDEA 2026.2 でクラッシュを引き起こしていた非推奨 API の利用を修正 (#6247 by @griffio)
- [Gradle Plugin] AGP 8.9 から 8.11 において、生成されたソースが Kotlin コンパイルで認識されない問題を修正
- [PostgreSQL Dialect] プリミティブバインド引数を使用する lower および upper 関数がデフォルトで TEXT になるよう修正 (#6262 by @griffio)
- [Compiler] アダプターを使用するデータクラスバインディングでの INSERT 値および null 許容性を変更するマイグレーションを修正 (#6269 by griffio)
- [Compiler] NULL 安全演算子（IS および IS DISTINCT FROM）で null 許容バインド引数を使用するように修正 (#6265 by @griffio)
- [Gradle Plugin] プロジェクト依存関係に AGP のバリアント解決を使用するように修正 (#6217 by @maxsav)
- [Gradle Plugin] ビルド間で AGP バリアントのリストが異なる場合の generateDatabaseInterface のビルドキャッシュミスを修正
- [Gradle Plugin] データベースを設定せずにプラグインを適用した場合に IDE 同期がクラッシュする問題を修正 (#6088)
- [PostgreSQL Dialect] ネストされた関数呼び出しを使用する場合の JSON 集約関数を修正 (#6281 by @griffio)
- [Paging3 Extension] 空のデータベースで KeyedQueryPagingSource がクラッシュする問題を修正 (#6284 by @woods-marshes)
- [Compiler] `COALESCE` などのカプセル化関数とともにミューテーター文を使用した場合の Java 型アダプターの問題を修正 (#6292 by @griffio)
- [Compiler] モジュール名が大文字で始まっている場合に、生成コードのパッケージ名も大文字になってしまう問題を修正 (#6316 by @griffio)
- [PostgreSQL Dialect] 日付データ型の大文字と小文字を区別しないように修正 (#6328 by @griffio)

## [2.3.2] - 2026-03-16 {id="2-3-2-2026-03-16"}
[2.3.2]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.2

### 追加
- [PostgreSQL Dialect] ALTER TABLE ALTER TYPE USING 式のサポートを改善 (#6116 by @griffio)
- [PostgreSQL Dialect] DROP COLUMN IF EXISTS のサポートを追加 (#6112 by @griffio)
- [Gradle Plugin] SELECT ワイルドカードの展開を無効化するための expandSelectStar フラグを追加 (#5813 by @griffio)
- [MySQL Dialect] ウィンドウ関数のサポートを追加 (#6086 by @griffio)
- [Gradle Plugin] verifyMigrations が true で開始スキーマバージョンが 1 でない場合のビルド失敗を修正 (#6017 by @neilgmiller)
- [Gradle Plugin] `SqlDelightWorkerTask` の設定自由度を高め、Windows 上での開発をサポートするようにデフォルト設定を更新 (#5215 by @MSDarwish2000)
- [SQLite Dialect] FTS5 仮想テーブルにおける合成列（synthesized columns）のサポートを追加 (#5986 by @watbe)
- [PostgreSQL Dialect] Postgres 行レベルセキュリティ（RLS）のサポートを追加 (#6087 by @shellderp)
- [PostgreSQL Dialect] FOR UPDATE を拡張し、OF table、NO KEY UPDATE、NO WAIT をサポート (#6104 by @shellderp)
- [PostgreSQL Dialect] PostGIS の Point 型および関連関数のサポート (#5602 by @vanniktech)
- [Runtime] トランザクションの `CoroutineContext` を制御するメカニズムを提供する `SuspendingTransacter.TransactionDispatcher` を追加 (#5967 by @eygraber)
- [Gradle Plugin] Android Gradle Plugin 9.0 の新しい DSL との完全な互換性を確保 (#6140)
- [PostgreSQL Dialect] PostgreSQL CREATE TABLE のストレージパラメータをサポート (#6148 by @griffio)
- [PostgreSQL Dialect] PostgreSQL の一意テーブル制約における null 許容結果列を修正 (#6167 by @griffio)

### 変更
- [Compiler] コンパイラの出力型を java.lang.Void から kotlin.Nothing に変更 (#6099 by @griffio)
- [Compiler] パッケージ名にアンダースコアを使用できるように変更。以前はアンダースコアがサニタイズされ予期しない挙動を引き起こしていました (#6027 by @BierDav)
- [Paging Extension] AndroidX Paging に切り替え (#5910 by @jeffdgr8)
- [Android Driver] Android の minSdk を 23 に引き上げ (#6141)
- [Paging Extension] Paging 3.4.1 にアップグレードし、X64 Apple ターゲットを削除 (#6166)

### 修正
- [IntelliJ Plugin] VFS リフレッシュイベント中に EDT 上でブロッキングなファイルタイプ検出が行われ、IDE がフリーズする問題を修正
- [SQLite Dialect] JSON パス演算子を使用する際の SQLite 3.38 コンパイルエラーを修正 (#6070 by @griffio)
- [SQLite Dialect] カスタム列型を使用する際の group_concat 関数に String 型を使用するように修正 (#6082 by @griffio)
- [Gradle Plugin] 複雑なスキーマでハングアップしないよう `VerifyMigrationTask` のパフォーマンスを改善 (#6073 by @Lightwood13)
- [IntelliJ Plugin] プラグイン初期化時の例外を修正し、非推奨メソッドを更新 (#6040 by @griffio)
- [Gradle Plugin] Android Gradle Plugin の組み込み Kotlin との互換性を修正 (#6139)

## [2.3.1] - 2025-03-12 {id="2-3-1-2025-03-12"}
[2.3.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.1

リリース失敗。2.3.2 を使用してください！

## [2.3.0] - 2025-03-12 {id="2-3-0-2025-03-12"}
[2.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.0

リリース失敗。2.3.2 を使用してください！

## [2.2.1] - 2025-11-13 {id="2-2-1-2025-11-13"}
[2.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.2.1

### 追加
- [PostgreSQL Dialect] Postgres の numeric/integer/biginteger 型マッピングを修正 (#5994 by @griffio)
- [Compiler] CAST が必要な際、エラーメッセージにソースファイルの場所を含めるようコンパイラエラーメッセージを改善 (#5979 by @griffio)
- [PostgreSQL Dialect] Postgres JSON 演算子パス抽出のサポートを追加 (#5971 by @griffio)
- [SQLite Dialect] 共通テーブル式（CTE）を使用した MATERIALIZED クエリプランナーヒントの SQLite 3.35 サポートを追加 (#5961 by @griffio)
- [PostgreSQL Dialect] 共通テーブル式（CTE）を使用した MATERIALIZED クエリプランナーヒントのサポートを追加 (#5961 by @griffio)
- [PostgreSQL Dialect] Postgres JSON 集約 FILTER のサポートを追加 (#5957 by @griffio)
- [PostgreSQL Dialect] Postgres Enum のサポートを追加 (#5935 by @griffio)
- [PostgreSQL Dialect] Postgres トリガーの限定的なサポートを追加 (#5932 by @griffio)
- [PostgreSQL Dialect] SQL 式が JSON としてパースできるかチェックする述語を追加 (#5843 by @griffio)
- [PostgreSQL Dialect] PostgreSQL Comment On 文の限定的なサポートを追加 (#5808 by @griffio)
- [MySQL Dialect] インデックス可視性オプションのサポートを追加 (#5785 by @orenkislev-faire)
- [PostgreSQL Dialect] TSQUERY データ型のサポートを追加 (#5779 by @griffio)
- [Gradle Plugin] モジュール追加時のバージョンカタログサポートを追加 (#5755 by @DRSchlaubi)

### 変更
- 開発中スナップショットの公開先を https://central.sonatype.com/repository/maven-snapshots/ の Central Portal Snapshots リポジトリに変更
- [Compiler] コンストラクタ参照を使用してデフォルトの生成クエリを簡素化 (#5814 by @jonapoul)

### 修正
- [Compiler] 共通テーブル式を含む View を使用した際のスタックオーバーフローを修正 (#5928 by @griffio)
- [Gradle Plugin] SqlDelight ツールウィンドウを開いて「New Connection」を追加する際のクラッシュを修正 (#5906 by @griffio)
- [IntelliJ Plugin] copy-to-sqlite ガターアクションにおけるスレッド関連のクラッシュを回避 (#5901 by @griffio)
- [IntelliJ Plugin] スキーマ文 CREATE INDEX および CREATE VIEW を使用する際の PostgreSQL ダイアレクトの修正 (#5772 by @griffio)
- [Compiler] 列を参照する際の FTS スタックオーバーフローを修正 (#5896 by @griffio)
- [Compiler] WITH RECURSIVE のスタックオーバーフローを修正 (#5892 by @griffio)
- [Compiler] Insert|Update|Delete Returning 文に対する通知（Notify）を修正 (#5851 by @griffio)
- [Compiler] Long を返すトランザクションブロックの非同期結果型を修正 (#5836 by @griffio)
- [Compiler] SQL パラメータバインディングの計算量を O(n²) から O(n) に最適化 (#5898 by @chenf7)
- [SQLite Dialect] SQLite 3.18 の不足していた関数を修正 (#5759 by @griffio)

## [2.2.0] - 2025-11-13 {id="2-2-0-2025-11-13"}
[2.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.2.0

アーティファクトの一部のみが公開されたリリース失敗。2.2.1 を使用してください！

## [2.1.0] - 2025-05-16 {id="2-1-0-2025-05-16"}
[2.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.1.0

### 追加
- [WASM Driver] Web Worker ドライバーへの wasmJs サポートを追加 (#5534 by @IlyaGulya)
- [PostgreSQL Dialect] PostgreSQL の配列を行に展開する UNNEST のサポート (#5673 by @griffio)
- [PostgreSQL Dialect] PostgreSQL TSRANGE/TSTZRANGE のサポート (#5297 by @griffio)
- [PostgreSQL Dialect] PostgreSQL RIGHT FULL JOIN のサポート (#5086 by @griffio)
- [PostgreSQL Dialect] PostgreSQL 時間型からの EXTRACT のサポート (#5273 by @griffio)
- [PostgreSQL Dialect] PostgreSQL 配列包含演算子のサポート (#4933 by @griffio)
- [PostgreSQL Dialect] PostgreSQL 制約削除（DROP CONSTRAINT）のサポート (#5288 by @griffio)
- [PostgreSQL Dialect] PostgreSQL 型キャストのサポート (#5089 by @griffio)
- [PostgreSQL Dialect] サブクエリに対する PostgreSQL LATERAL JOIN 演算子のサポート (#5122 by @griffio)
- [PostgreSQL Dialect] PostgreSQL ILIKE 演算子のサポート (#5330 by @griffio)
- [PostgreSQL Dialect] PostgreSQL XML 型のサポート (#5331 by @griffio)
- [PostgreSQL Dialect] PostgreSQL AT TIME ZONE のサポート (#5243 by @griffio)
- [PostgreSQL Dialect] PostgreSQL ORDER BY NULLS のサポート (#5199 by @griffio)
- [PostgreSQL Dialect] PostgreSQL 現在日時関数のサポートを追加 (#5226 by @drewd)
- [PostgreSQL Dialect] PostgreSQL 正規表現演算子のサポート (#5137 by @griffio)
- [PostgreSQL Dialect] BRIN および GIST の追加 (#5059 by @griffio)
- [MySQL Dialect] MySQL ダイアレクトでの RENAME INDEX のサポート (#5212 by @orenkislev-faire)
- [JSON Extension] json_table 関数にエイリアスを追加 (#5372 by @griffio)

### 変更
- [Compiler] 生成されたクエリファイルが、単純なミューテーターに対して更新行数を返すように変更 (#4578 by @MariusVolkhart)
- [Native Driver] NativeSqlDatabase.kt を更新し、DELETE、INSERT、UPDATE 文の readonly フラグを変更 (#5680 by @griffio)
- [PostgreSQL Dialect] PgInterval を String に変更 (#5403 by @griffio)
- [PostgreSQL Dialect] PostgreSQL 拡張機能を実装するための SqlDelight モジュールをサポート (#5677 by @griffio)

### 修正
- [Compiler] 修正: 結果を伴うグループ文を実行した際にクエリリスナーへ通知するよう修正 (#5006 by @vitorhugods)
- [Compiler] SqlDelightModule 型リゾルバーを修正 (#5625 by @griffio)
- [Compiler] 5501 エスケープされた列でのオブジェクト挿入を修正 (#5503 by @griffio)
- [Compiler] コンパイラ: 正しい行と文字位置でパスリンクをクリックできるようにエラーメッセージを改善 (#5604 by @vanniktech)
- [Compiler] 課題 5298 を修正: テーブル名としてキーワードを使用できるように修正
- [Compiler] 名前付き execute を修正しテストを追加
- [Compiler] 初期化文のソート時に外部キータスク制約を考慮するように修正 (#5325 by @TheMrMilchmann)
- [Compiler] タブが含まれている場合のエラー下線の位置ずれを修正 (#5224 by @drewd)
- [JDBC Driver] トランザクション終了時における connectionManager のメモリリークを修正
- [JDBC Driver] ドキュメントの記載通り、SQLite マイグレーションをトランザクション内で実行するように修正 (#5218 by @morki)
- [JDBC Driver] トランザクションのコミット/ロールバック後の接続リークを修正 (#5205 by @morki)
- [Gradle Plugin] `GenerateSchemaTask` の前に `DriverInitializer` を実行するように修正 (#5562 by @nwagu)
- [Runtime] 実際のドライバーが非同期（Async）の場合における LogSqliteDriver のクラッシュを修正 (#5723 by @edenman)
- [Runtime] StringBuilder の初期容量を修正 (#5192 by @janbina)
- [PostgreSQL Dialect] PostgreSQL CREATE OR REPLACE VIEW を修正 (#5407 by @griffio)
- [PostgreSQL Dialect] PostgreSQL to_json を修正 (#5606 by @griffio)
- [PostgreSQL Dialect] PostgreSQL numeric リゾルバーを修正 (#5399 by @griffio)
- [PostgreSQL Dialect] SQLite ウィンドウ関数を修正 (#2799 by @griffio)
- [PostgreSQL Dialect] PostgreSQL SELECT DISTINCT ON を修正 (#5345 by @griffio)
- [PostgreSQL Dialect] ALTER TABLE ADD COLUMN IF NOT EXISTS を修正 (#5309 by @griffio)
- [PostgreSQL Dialect] PostgreSQL 非同期バインドパラメータを修正 (#5313 by @griffio)
- [PostgreSQL Dialect] PostgreSQL ブールリテラルを修正 (#5262 by @griffio)
- [PostgreSQL Dialect] PostgreSQL ウィンドウ関数を修正 (#5155 by @griffio)
- [PostgreSQL Dialect] PostgreSQL isNull / isNotNull 型を修正 (#5173 by @griffio)
- [PostgreSQL Dialect] PostgreSQL SELECT DISTINCT を修正 (#5172 by @griffio)
- [Paging Extension] Paging リフレッシュ初期ロードを修正 (#5615 by @evant)
- [Paging Extension] macOS ネイティブターゲットを追加 (#5324 by @vitorhugods)
- [IntelliJ Plugin] K2 をサポート

## [2.0.2] - 2024-04-05 {id="2-0-2-2024-04-05"}
[2.0.2]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.2

### 追加
- [PostgreSQL Dialect] PostgreSQL STRING_AGG 関数を追加 (#4950 by @anddani)
- [PostgreSQL Dialect] PG ダイアレクトに SET 文を追加 (#4927 by @de-luca)
- [PostgreSQL Dialect] PostgreSQL ALTER COLUMN シーケンスパラメータを追加 (#4916 by @griffio)
- [PostgreSQL Dialect] INSERT 文での PostgreSQL ALTER COLUMN DEFAULT サポートを追加 (#4912 by @griffio)
- [PostgreSQL Dialect] PostgreSQL ALTER SEQUENCE および DROP SEQUENCE を追加 (#4920 by @griffio)
- [PostgreSQL Dialect] Postgres 正規表現関数の定義を追加 (#5025 by @MariusVolkhart)
- [PostgreSQL Dialect] GIN の文法を追加 (#5027 by @griffio)

### 変更
- [IDE Plugin] 最小サポートバージョンを 2023.1 / Android Studio Iguana に変更
- [Compiler] encapsulatingType で型の null 許容性をオーバーライドできるように変更 (#4882 by @eygraber)
- [Compiler] SELECT * の列名をインライン化
- [Gradle Plugin] processIsolation に切り替え (#5068 by @nwagu)
- [Android Runtime] Android の minSDK を 21 に引き上げ (#5094 by @hfhbd)
- [Drivers] ダイアレクト作成者向けに、より多くの JDBC/R2DBC ステートメントメソッドを公開 (#5098 by @hfhbd)

### 修正
- [PostgreSQL Dialect] PostgreSQL ALTER TABLE ALTER COLUMN を修正 (#4868 by @griffio)
- [PostgreSQL Dialect] 4448 テーブルモデルのインポート漏れを修正 (#4885 by @griffio)
- [PostgreSQL Dialect] 4932 PostgreSQL デフォルト制約関数を修正 (#4934 by @griffio)
- [PostgreSQL Dialect] 4879 マイグレーション中の ALTER TABLE RENAME COLUMN における PostgreSQL クラスキャストエラーを修正 (#4880 by @griffio)
- [PostgreSQL Dialect] 4474 PostgreSQL CREATE EXTENSION を修正 (#4541 by @griffio)
- [PostgreSQL Dialect] 5018 PostgreSQL PRIMARY KEY 追加時の非 null 型を修正 (#5020 by @griffio)
- [PostgreSQL Dialect] 4703 集約式を修正 (#5071 by @griffio)
- [PostgreSQL Dialect] 5028 PostgreSQL JSON を修正 (#5030 by @griffio)
- [PostgreSQL Dialect] 5040 PostgreSQL JSON 演算子を修正 (#5041 by @griffio)
- [PostgreSQL Dialect] 5040 の JSON 演算子バインディングを修正 (#5100 by @griffio)
- [PostgreSQL Dialect] 5082 tsvector を修正 (#5104 by @griffio)
- [PostgreSQL Dialect] 5032 PostgreSQL UPDATE FROM 文の列隣接性を修正 (#5035 by @griffio)
- [SQLite Dialect] 4897 SQLite ALTER TABLE RENAME COLUMN を修正 (#4899 by @griffio)
- [IDE Plugin] エラーハンドラーのクラッシュを修正 (#4988 by @aperfilyev)
- [IDE Plugin] IDEA 2023.3 で BugSnag の初期化に失敗する問題を修正 (by @aperfilyev)
- [IDE Plugin] プラグイン経由で IntelliJ で .sq ファイルを開いた際の PluginException を修正 (by @aperfilyev)
- [IDE Plugin] すでにプラグインの依存関係にあるため、Kotlin ライブラリを IntelliJ プラグインにバンドルしないように修正 (#5126)
- [IDE Plugin] stream の代わりに extensions 配列を使用するように修正 (#5127)

## [2.0.1] - 2023-12-01 {id="2-0-1-2023-12-01"}
[2.0.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.1

### 追加
- [Compiler] SELECT 実行時の複数列式（multi-column-expr）のサポートを追加 (#4453 by @Adriel-M)
- [PostgreSQL Dialect] PostgreSQL CREATE INDEX CONCURRENTLY のサポートを追加 (#4531 by @griffio)
- [PostgreSQL Dialect] PostgreSQL CTE の補助文が相互参照できるように対応 (#4493 by @griffio)
- [PostgreSQL Dialect] 二項式および SUM に対する PostgreSQL 型のサポートを追加 (#4539 by @Adriel-M)
- [PostgreSQL Dialect] PostgreSQL SELECT DISTINCT ON 構文のサポートを追加 (#4584 by @griffio)
- [PostgreSQL Dialect] SELECT 文における PostgreSQL JSON 関数のサポートを追加 (#4590 by @MariusVolkhart)
- [PostgreSQL Dialect] PostgreSQL generate_series 関数を追加 (#4717 by @griffio)
- [PostgreSQL Dialect] Postgres 文字列関数の定義を追加 (#4752 by @MariusVolkhart)
- [PostgreSQL Dialect] min および max 集約関数に DATE PostgreSQL 型を追加 (#4816 by @anddani)
- [PostgreSQL Dialect] SqlBinaryExpr に PostgreSQL 時間型を追加 (#4657 by @griffio)
- [PostgreSQL Dialect] PG ダイアレクトに TRUNCATE を追加 (#4817 by @de-luca)
- [SQLite 3.35 Dialect] 評価順序に従う複数の ON CONFLICT 節を許可 (#4551 by @griffio)
- [JDBC Driver] より快適な SQL 編集のための Language アノテーションを追加 (#4602 by @MariusVolkhart)
- [Native Driver] native-driver: linuxArm64 のサポートを追加 (#4792 by @hfhbd)
- [Android Driver] AndroidSqliteDriver に windowSizeBytes パラメータを追加 (#4804 by @BoD)
- [Paging3 Extension] feat: OffsetQueryPagingSource に initialOffset を追加 (#4802 by @MohamadJaara)

### 変更
- [Compiler] 適切な箇所で Kotlin の型を優先するように変更 (#4517 by @eygraber)
- [Compiler] 値型での insert を行う際、常に列名を含めるように変更 (#4864)
- [PostgreSQL Dialect] PostgreSQL ダイアレクトから実験的（experimental）ステータスを削除 (#4443 by @hfhbd)
- [PostgreSQL Dialect] PostgreSQL 型のドキュメントを更新 (#4569 by @MariusVolkhart)
- [R2DBC Driver] PostgreSQL での整数データ型処理時のパフォーマンスを最適化 (#4588 by @MariusVolkhart)

### 削除 {id="removed"}
- [SQLite Javascript Driver] sqljs-driver を削除 (#4613, #4670 by @dellisd)

### 修正
- [Compiler] 戻り値がありパラメータのないグループ化された文のコンパイルを修正 (#4699 by @griffio)
- [Compiler] SqlBinaryExpr を使用した引数のバインドを修正 (#4604 by @griffio)
- [IDE Plugin] 設定されている場合は IDEA Project JDK を使用するように修正 (#4689 by @griffio)
- [IDE Plugin] IDEA 2023.2 以降で発生していた "Unknown element type: TYPE_NAME" エラーを修正 (#4727)
- [IDE Plugin] 2023.2 とのいくつかの互換性の問題を修正
- [Gradle Plugin] Gradle の verifyMigrationTask タスクのドキュメントを修正 (#4713 by @joshfriend)
- [Gradle Plugin] データベース検証前にデータベースを生成するようユーザーに案内する Gradle タスク出力メッセージを追加 (#4684 by @jingwei99)
- [PostgreSQL Dialect] PostgreSQL の列を複数回リネームする処理を修正 (#4566 by @griffio)
- [PostgreSQL Dialect] 4714 PostgreSQL ALTER COLUMN の null 許容性を修正 (#4831 by @griffio)
- [PostgreSQL Dialect] 4837 ALTER TABLE ALTER COLUMN を修正 (#4846 by @griffio)
- [PostgreSQL Dialect] 4501 PostgreSQL シーケンスを修正 (#4528 by @griffio)
- [SQLite Dialect] 列式に対して JSON 二項演算子の使用を許可 (#4776 by @eygraber)
- [SQLite Dialect] UPDATE FROM で同名の列が複数見つかった場合の誤検知を修正 (#4777 by @eygraber)
- [Native Driver] 名前付きインメモリデータベースをサポート (#4662 by @05nelsonm)
- [Native Driver] クエリリスナーコレクションのスレッドセーフ性を確保 (#4567 by @kpgalligan)
- [JDBC Driver] ConnectionManager の接続リークを修正 (#4589 by @MariusVolkhart)
- [JDBC Driver] ConnectionManager タイプを選択する際の JdbcSqliteDriver の URL パースを修正 (#4656 by @05nelsonm)

## [2.0.0] - 2023-07-26 {id="2-0-0-2023-07-26"}
[2.0.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0

### 追加
- [MySQL Dialect] MySQL: IF 式内での timestamp/bigint をサポート (#4329 by @shellderp)
- [MySQL Dialect] MySQL: now を追加 (#4431 by @hfhbd)
- [Web Driver] NPM パッケージの公開を有効化 (#4364)
- [IDE Plugin] Gradle ツーリング接続失敗時にスタックトレースを表示できるように変更 (#4383)

### 変更
- [Sqlite Driver] JdbcSqliteDriver のスキーママイグレーション利用を簡素化 (#3737 by @morki)
- [R2DBC Driver] 真の非同期 R2DBC カーソルに対応 (#4387 by @hfhbd)

### 修正
- [IDE Plugin] 必要になるまでデータベースプロジェクトサービスをインスタンス化しないように修正 (#4382)
- [IDE Plugin] 使用箇所の検索（find usages）中のプロセスキャンセルを適切に処理 (#4340)
- [IDE Plugin] 非同期コードの IDE 生成を修正 (#4406)
- [IDE Plugin] パッケージ構造の組み立てを EDT 外で1回だけ計算するように移動 (#4417)
- [IDE Plugin] 2023.2 における Kotlin 型解決に正しいスタブインデックスキーを使用するように修正 (#4416)
- [IDE Plugin] 検索を実行する前にインデックスの準備完了を待機するように修正 (#4419)
- [IDE Plugin] インデックスが利用できない場合はジャンプ（goto）を実行しないように修正 (#4420)
- [Compiler] グループ化された文の結果式を修正 (#4378)
- [Compiler] 仮想テーブルをインターフェース型として使用しないように修正 (#4427 by @hfhbd)

## [2.0.0-rc02] - 2023-06-27 {id="2-0-0-rc02-2023-06-27"}
[2.0.0-rc02]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-rc02

### 追加
- [MySQL Dialect] 小文字の日付型、および日付型に対する min と max をサポート (#4243 by @shellderp)
- [MySQL Dialect] 二項式および SUM に対する MySQL 型のサポート (#4254 by @shellderp)
- [MySQL Dialect] 表示幅なしの符号なし整数（unsigned ints）をサポート (#4306 by @shellderp)
- [MySQL Dialect] LOCK IN SHARED MODE をサポート
- [PostgreSQL Dialect] min max に boolean と Timestamp を追加 (#4245 by @griffio)
- [PostgreSQL Dialect] Postgres: ウィンドウ関数のサポートを追加 (#4283 by @hfhbd)
- [Runtime] runtime に linuxArm64、androidNative、watchosDeviceArm ターゲットを追加 (#4258 by @hfhbd)
- [Paging Extension] paging extension に linux および mingw x64 ターゲットを追加 (#4280 by @chippman)

### 変更
- [Gradle Plugin] Android API 34 の自動ダイアレクトサポートを追加 (#4251)
- [Paging Extension] QueryPagingSource で SuspendingTransacter のサポートを追加 (#4292 by @daio)
- [Runtime] addListener API を改善 (#4244 by @hfhbd)
- [Runtime] マイグレーションバージョンとして Long を使用するように変更 (#4297 by @hfhbd)

### 修正
- [Gradle Plugin] 生成されるソースに対して安定した出力パスを使用するように修正 (#4269 by @joshfriend)
- [Gradle Plugin] Gradle の微調整 (#4222 by @3flex)

## [2.0.0-rc01] - 2023-05-29 {id="2-0-0-rc01-2023-05-29"}
[2.0.0-rc01]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-rc01

### 追加
- [Paging] paging extensions に JS ブラウザターゲットを追加 (#3843 by @sproctor)
- [Paging] androidx-paging3 extension に iosSimulatorArm64 ターゲットを追加 (#4117)
- [PostgreSQL Dialect] gen_random_uuid() のサポートとテストを追加 (#3855 by @davidwheeler123)
- [PostgreSQL Dialect] PostgreSQL ALTER TABLE ADD CONSTRAINT を追加 (#4116 by @griffio)
- [PostgreSQL Dialect] ALTER TABLE ADD CONSTRAINT CHECK を追加 (#4120 by @griffio)
- [PostgreSQL Dialect] PostgreSQL 文字長関数を追加 (#4121 by @griffio)
- [PostgreSQL Dialect] PostgreSQL 列デフォルトの interval を追加 (#4142 by @griffio)
- [PostgreSQL Dialect] PostgreSQL interval 列の結果を追加 (#4152 by @griffio)
- [PostgreSQL Dialect] PostgreSQL ALTER COLUMN を追加 (#4165 by @griffio)
- [PostgreSQL Dialect] PostgreSQL: date_part を追加 (#4198 by @hfhbd)
- [MySQL Dialect] SQL 文字長関数を追加 (#4134 by @griffio)
- [IDE Plugin] sqldelight ディレクトリの候補表示を追加 (#3976 by @aperfilyev)
- [IDE Plugin] プロジェクトツリーの中間パッケージをコンパクト表示するように改善 (#3992 by @aperfilyev)
- [IDE Plugin] JOIN 節の補完を追加 (#4086 by @aperfilyev)
- [IDE Plugin] View 作成のインテンションとライブテンプレートを追加 (#4074 by @aperfilyev)
- [IDE Plugin] DELETE または UPDATE 内での WHERE 句の欠落に関する警告を追加 (#4058 by @aperfilyev)
- [Gradle Plugin] タイプセーフなプロジェクトアクセサーを有効化 (#4005 by @hfhbd)

### 変更
- [Gradle Plugin] ServiceLoader メカニズムを使用して VerifyMigrationTask に DriverInitializer を登録できるように変更 (#3986 by @C2H6O)
- [Gradle Plugin] 明示的なコンパイラ環境を作成 (#4079 by @hfhbd)
- [JS Driver] Web Worker ドライバーを別個のアーティファクトに分割
- [JS Driver] JsWorkerSqlCursor を公開しないように変更 (#3874 by @hfhbd)
- [JS Driver] sqljs ドライバーの公開を無効化 (#4108)
- [Runtime] 同期ドライバーには同期スキーマ初期化子を必須とするよう強制 (#4013)
- [Runtime] Cursor の非同期サポートを改善 (#4102)
- [Runtime] 非推奨ターゲットを削除 (#4149 by @hfhbd)
- [Runtime] 旧メモリモデル（Old MM）のサポートを削除 (#4148 by @hfhbd)

### 修正
- [R2DBC Driver] R2DBC: ドライバーのクローズを await するように修正 (#4139 by @hfhbd)
- [Compiler] database create(SqlDriver) においてマイグレーションの PRAGMA を含めるように修正 (#3845 by @MariusVolkhart)
- [Compiler] RETURNING 句のコード生成を修正 (#3872 by @MariusVolkhart)
- [Compiler] 仮想テーブルの型を生成しないように修正 (#4015)
- [Gradle Plugin] Gradle プラグインの細かな利便性改善 (#3930 by @zacsweers)
- [IDE Plugin] 未解決の Kotlin 型を修正 (#3924 by @aperfilyev)
- [IDE Plugin] ワイルドカード展開インテンションが修飾子（qualifier）付きでも動作するように修正 (#3979 by @aperfilyev)
- [IDE Plugin] JAVA_HOME が存在しない場合は利用可能な JDK を使用するように修正 (#3925 by @aperfilyev)
- [IDE Plugin] パッケージ名での使用箇所の検索（find usages）を修正 (#4010)
- [IDE Plugin] 無効な要素に対して自動インポートを表示しないように修正 (#4008)
- [IDE Plugin] ダイアレクトが存在しない場合は名前解決を行わないように修正 (#4009)
- [IDE Plugin] 無効化された状態の間は IDE によるコンパイラの実行を無視するように修正 (#4016)
- [IDE Plugin] IntelliJ 2023.1 のサポートを追加 (#4037 by @madisp)
- [IDE Plugin] 列のリネーム時に名前付き引数の使用箇所もリネームされるよう修正 (#4027 by @aperfilyev)
- [IDE Plugin] マイグレーション追加ポップアップを修正 (#4105 by @aperfilyev)
- [IDE Plugin] マイグレーションファイル内での SchemaNeedsMigrationInspection を無効化 (#4106 by @aperfilyev)
- [IDE Plugin] マイグレーション生成時に型名ではなく SQL 列名を使用するように修正 (#4112 by @aperfilyev)

## [2.0.0-alpha05] - 2023-01-20 {id="2-0-0-alpha05-2023-01-20"}
[2.0.0-alpha05]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha05

### 追加
- [Paging] マルチプラットフォーム向け Paging 拡張 (by @jeffdgr8)
- [Runtime] Listener インターフェースに fun 修飾子を追加
- [SQLite Dialect] SQLite 3.33 のサポート（UPDATE FROM）を追加 (by @eygraber)
- [PostgreSQL Dialect] PostgreSQL での UPDATE FROM をサポート (by @eygraber)

### 変更
- [RDBC Driver] 接続を公開 (by @hfhbd)
- [Runtime] マイグレーションコールバックをメインの `migrate` 関数内に移動
- [Gradle Plugin] 下流プロジェクトから Configurations を非表示に設定
- [Gradle Plugin] IntelliJ のみを shade するよう変更 (by @hfhbd)
- [Gradle Plugin] Kotlin 1.8.0-Beta をサポートし、複数バージョンの Kotlin テストを追加 (by @hfhbd)

### 修正
- [RDBC Driver] 代わりに javaObjectType を使用するように修正 (by @hfhbd)
- [RDBC Driver] bindStatement でのプリミティブ null 値を修正 (by @hfhbd)
- [RDBC Driver] R2DBC 1.0 をサポート (by @hfhbd)
- [PostgreSQL Dialect] Postgres: 型パラメータなしの配列を修正 (by @hfhbd)
- [IDE Plugin] IntelliJ を 221.6008.13 に引き上げ (by @hfhbd)
- [Compiler] 純粋なビューから再帰的な元のテーブルを解決するように修正 (by @hfhbd)
- [Compiler] テーブルの外部キー節の値クラスを使用するように修正 (by @hfhbd)
- [Compiler] 括弧なしのバインド式をサポートするよう SelectQueryGenerator を修正 (by @bellatoris)
- [Compiler] トランザクション使用時に ${name}Indexes 変数が重複生成される問題を修正 (by @sachera)

## [1.5.5] - 2023-01-20 {id="1-5-5-2023-01-20"}
[1.5.5]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.5

これは Kotlin 1.8 および IntelliJ 2021+ 向けの互換性リリースであり、JDK 17 をサポートします。

## [1.5.4] - 2022-10-06 {id="1-5-4-2022-10-06"}
[1.5.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.4

これは Kotlin 1.7.20 および AGP 7.3.0 向けの互換性アップデートです。

## [2.0.0-alpha04] - 2022-10-03 {id="2-0-0-alpha04-2022-10-03"}
[2.0.0-alpha04]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha04

### 破壊的変更 {id="breaking-changes"}

- Paging 3 拡張 API が変更され、count には Int 型のみが許可されるようになりました。
- coroutines 拡張において、ディスパッチャのデフォルト値がなくなり、明示的な受け渡しが必須になりました。
- Dialect クラスおよび Driver クラスが final になったため、継承の代わりに委譲（delegation）を使用してください。

### 追加
- [HSQL Dialect] Hsql: INSERT 内の生成列に対して DEFAULT の使用をサポート (#3372 by @hfhbd)
- [PostgreSQL Dialect] PostgreSQL: INSERT 内の生成列に対して DEFAULT の使用をサポート (#3373 by @hfhbd)
- [PostgreSQL Dialect] PostgreSQL に NOW() を追加 (#3403 by @hfhbd)
- [PostgreSQL Dialect] PostgreSQL に NOT 演算子を追加 (#3504 by @hfhbd)
- [Paging] *QueryPagingSource への CoroutineContext の受け渡しを許可 (#3384)
- [Gradle Plugin] ダイアレクトに対するバージョンカタログサポートを改善 (#3435)
- [Native Driver] NativeSqliteDriver の DatabaseConfiguration 作成にフックするコールバックを追加 (#3512 by @svenjacobs)

### 変更
- [Paging] KeyedQueryPagingSource をベースとした QueryPagingSource 関数にデフォルトディスパッチャを追加 (#3385)
- [Paging] OffsetQueryPagingSource が Int のみで動作するように変更 (#3386)
- [Async Runtime] await* を上位クラス ExecutableQuery に移動 (#3524 by @hfhbd)
- [Coroutines Extensions] flow 拡張からデフォルトパラメータを削除 (#3489)

### 修正
- [Gradle Plugin] Kotlin 1.7.20 にアップデート (#3542 by @zacsweers)
- [R2DBC Driver] 常に値が送信されるとは限らない R2DBC の変更に対応 (#3525 by @hfhbd)
- [HSQL Dialect] Hsql を使用した SQLite の VerifyMigrationTask の失敗を修正 (#3380 by @hfhbd)
- [Gradle Plugin] 遅延設定 API（Lazy Configuration API）を使用するようタスクを変換 (by @3flex)
- [Gradle Plugin] Kotlin 1.7.20 における NPE を回避 (#3398 by @ZacSweers)
- [Gradle Plugin] squash migrations タスクの説明を修正 (#3449)
- [IDE Plugin] 新しい Kotlin プラグインでの NoSuchFieldError を修正 (#3422 by @madisp)
- [IDE Plugin] IDEA: UnusedQueryInspection - ArrayIndexOutOfBoundsException を修正 (#3427 by @vanniktech)
- [IDE Plugin] 古い Kotlin プラグイン参照に対してリフレクションを使用するように変更
- [Compiler] 拡張関数を持つカスタムダイアレクトでインポートが生成されない問題を修正 (#3338 by @hfhbd)
- [Compiler] CodeBlock.of("${CodeBlock.toString()}") のエスケープを修正 (#3340 by @hfhbd)
- [Compiler] マイグレーション内の非同期 execute 文を await するように修正 (#3352)
- [Compiler] AS を修正 (#3370 by @hfhbd)
- [Compiler] `getObject` メソッドが実際の型の自動補完をサポート (#3401 by @robxyy)
- [Compiler] 非同期グループ化 returning 文のコード生成を修正 (#3411)
- [Compiler] 可能な場合はバインドパラメータの Kotlin 型を推論し、不可能な場合はより分かりやすいエラーメッセージで失敗するように改善 (#3413 by @hfhbd)
- [Compiler] ABS("foo") を不許可に設定 (#3430 by @hfhbd)
- [Compiler] 他のパラメータからの Kotlin 型推論をサポート (#3431 by @hfhbd)
- [Compiler] 常にデータベース実装を作成するように修正 (#3540 by @hfhbd)
- [Compiler] Javadoc の制約を緩和し、カスタムマッパー関数にも追加 (#3554 @hfhbd)
- [Compiler] バインディング内の DEFAULT を修正 (by @hfhbd)
- [Paging] Paging 3 を修正 (#3396)
- [Paging] Long による OffsetQueryPagingSource の構築を許可 (#3409)
- [Paging] Dispatchers.Main を静的に入れ替えないように修正 (#3428)

## [2.0.0-alpha03] - 2022-06-17 {id="2-0-0-alpha03-2022-06-17"}
[2.0.0-alpha03]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha03

### 破壊的変更

- ダイアレクトは通常の Gradle 依存関係のように参照されるようになりました。
```groovy
sqldelight {
  MyDatabase {
    dialect("app.cash.sqldelight:postgres-dialect:2.0.0-alpha03")
  }
}
```
- `AfterVersionWithDriver` 型が削除され、常にドライバーを保持するようになった `AfterVersion` に統合されました。
- `Schema` 型は `SqlDriver` のサブタイプではなくなりました。
- `PreparedStatement` API は 0 始まりのインデックス（zero-based indexes）で呼び出されるようになりました。

### 追加
- [IDE Plugin] 実行中のデータベースに対して SQLite、MySQL、PostgreSQL コマンドを実行するサポートを追加 (#2718 by @aperfilyev)
- [IDE Plugin] Android Studio の Database Inspector のサポートを追加 (#3107 by @aperfilyev)
- [Runtime] 非同期ドライバーのサポートを追加 (#3168 by @dellisd)
- [Native Driver] 新しい Kotlin/Native メモリモデルのサポート (#3177 by @kpgalligan)
- [JS Driver] SqlJs ワーカー用のドライバーを追加 (#3203 by @dellisd)
- [Gradle Plugin] SQLDelight タスクのクラスパスを公開
- [Gradle Plugin] マイグレーションを統合（squash）する Gradle タスクを追加
- [Gradle Plugin] マイグレーションチェック中にスキーマ定義を無視するフラグを追加
- [MySQL Dialect] MySQL での FOR SHARE および FOR UPDATE をサポート (#3098)
- [MySQL Dialect] MySQL インデックスヒントをサポート (#3099)
- [PostgreSQL Dialect] date_trunc を追加 (#3295 by @hfhbd)
- [JSON Extensions] JSON テーブル関数をサポート (#3090)

### 変更
- [Runtime] ドライバーを持たない AfterVersion 型を削除 (#3091)
- [Runtime] Schema 型をトップレベルに移動
- [Runtime] サードパーティの実装をサポートするため dialect および resolver をオープン化 (#3232 by @hfhbd)
- [Compiler] コンパイルに使用されたダイアレクトを失敗レポートに含めるように変更 (#3086)
- [Compiler] 未使用のアダプターをスキップ (#3162 by @eygraber)
- [Compiler] PreparedStatement で 0 始まりのインデックスを使用 (#3269 by @hfhbd)
- [Gradle Plugin] ダイアレクトを文字列ではなく正式な Gradle 依存関係として指定できるように変更 (#3085)
- [Gradle Plugin] Gradle Verify Task: データベースファイルが存在しない場合に例外をスロー (#3126 by @vanniktech)

### 修正
- [Gradle Plugin] Gradle プラグインの細かなクリーンアップと調整 (#3171 by @3flex)
- [Gradle Plugin] 生成ディレクトリに AGP 文字列を使用しないように修正
- [Gradle Plugin] AGP の namespace 属性を使用するように修正 (#3220)
- [Gradle Plugin] Gradle プラグインのランタイム依存関係に kotlin-stdlib を追加しないように修正 (#3245 by @mbonnin)
- [Gradle Plugin] マルチプラットフォーム設定を簡素化 (#3246 by @mbonnin)
- [Gradle Plugin] JS 専用プロジェクトをサポート (#3310 by @hfhbd)
- [IDE Plugin] Gradle tooling API に JAVA_HOME を使用するように修正 (#3078)
- [IDE Plugin] IDE プラグイン内で正しい ClassLoader 上に JDBC ドライバーをロードするように修正 (#3080)
- [IDE Plugin] 既存の PSI 変更中のエラーを避けるため、無効化前にファイル要素を null としてマーク (#3082)
- [IDE Plugin] ALTER TABLE 文での新しいテーブル名の使用箇所検索中にクラッシュしないよう修正 (#3106)
- [IDE Plugin] インスペクターを最適化し、想定される例外タイプについては警告なしで失敗（fail silently）できるように修正 (#3121)
- [IDE Plugin] 生成ディレクトリであるべきファイルを削除 (#3198)
- [IDE Plugin] 非安全な演算子呼び出しを修正
- [Compiler] RETURNING 文を伴う UPDATE および DELETE が確実にクエリを実行するよう修正 (#3084)
- [Compiler] 複合 SELECT 内の引数の型を正しく推論するように修正 (#3096)
- [Compiler] 共通テーブル（Common tables）はデータクラスを生成しないため、それらを返さないように修正 (#3097)
- [Compiler] 最上位のマイグレーションファイルをより高速に検出するように修正 (#3108)
- [Compiler] パイプ演算子で null 許容性を正しく継承するように修正
- [Compiler] ANSI SQL の iif 関数のサポート
- [Compiler] 空のクエリファイルを生成しないように修正 (#3300 by @hfhbd)
- [Compiler] クエスチョンマークのみのアダプターを修正 (#3314 by @hfhbd)
- [PostgreSQL Dialect] Postgres の主キー列が常に非 null になるよう修正 (#3092)
- [PostgreSQL Dialect] 複数テーブルで同名の場合のコピーを修正 (#3297 by @hfhbd)
- [SQLite 3.35 Dialect] 変更対象テーブルからインデックス付き列を削除する場合にのみエラーを表示するよう修正 (#3158 by @eygraber)

## [2.0.0-alpha02] - 2022-04-13 {id="2-0-0-alpha02-2022-04-13"}
[2.0.0-alpha02]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha02

### 破壊的変更

- すべての `app.cash.sqldelight.runtime.rx` を `app.cash.sqldelight.rx2` に置換する必要があります。

### 追加
- [Compiler] グループ化された文の末尾での RETURNING をサポート
- [Compiler] ダイアレクトモジュールによるコンパイラ拡張をサポートし、SQLite JSON 拡張を追加 (#1379, #2087)
- [Compiler] 値を返す PRAGMA 文のサポート (#1106)
- [Compiler] マークされた列に対する値型（value types）の生成をサポート
- [Compiler] 楽観的ロックとバリデーションのサポートを追加 (#1952)
- [Compiler] 複数行の UPDATE 文をサポート
- [PostgreSQL] PostgreSQL の RETURNING 文をサポート
- [PostgreSQL] PostgreSQL の日付型をサポート
- [PostgreSQL] PG interval をサポート
- [PostgreSQL] PG Boolean をサポートし、ALTER TABLE での INSERT を修正
- [PostgreSQL] PostgreSQL でのオプショナルな LIMIT をサポート
- [PostgreSQL] PG BYTEA 型をサポート
- [PostgreSQL] PostgreSQL SERIAL 型のテストを追加
- [PostgreSQL] PostgreSQL の FOR UPDATE 構文をサポート
- [PostgreSQL] PostgreSQL の配列型をサポート
- [PostgreSQL] PG での UUID 型の適切な保存/取得をサポート
- [PostgreSQL] PostgreSQL NUMERIC 型をサポート (#1882)
- [PostgreSQL] 共通テーブル式内でのクエリの RETURNING をサポート (#2471)
- [PostgreSQL] JSON 固有の演算子をサポート
- [PostgreSQL] Postgres Copy を追加 (by @hfhbd)
- [MySQL] MySQL Replace をサポート
- [MySQL] MySQL の NUMERIC/BigDecimal 型をサポート (#2051)
- [MySQL] MySQL TRUNCATE 文をサポート
- [MySQL] MySQL の JSON 固有演算子をサポート (by @eygraber)
- [MySQL] MySQL INTERVAL をサポート (#2969 by @eygraber)
- [HSQL] HSQL ウィンドウ機能を追加
- [SQLite] WHERE 句内の null 許容パラメータに対する等価性チェックを置き換えないよう修正 (#1490 by @eygraber)
- [SQLite] SQLite 3.35 の RETURNING 文をサポート (#1490 by @eygraber)
- [SQLite] GENERATED 句をサポート
- [SQLite] SQLite 3.38 ダイアレクトのサポートを追加 (by @eygraber)

### 変更
- [Compiler] 生成コードを整理
- [Compiler] グループ化された文内でのテーブルパラメータの使用を禁止 (#1822)
- [Compiler] グループ化されたクエリをトランザクション内に配置 (#2785)
- [Runtime] ドライバーの execute メソッドから更新行数を返すように変更
- [Runtime] 接続にアクセスするクリティカルセクション内に SqlCursor を限定 (#2123 by @andersio)
- [Gradle Plugin] マイグレーション用にスキーマ定義を比較 (#841)
- [PostgreSQL] PG での二重引用符（ダブルクォート）を不許可に設定
- [MySQL] MySQL での == の使用に対してエラーを表示 (#2673)

### 修正
- [Compiler] 異なるテーブルの同一アダプター型が 2.0 alpha でコンパイルエラーを引き起こす問題を修正
- [Compiler] UPSERT 文のコンパイルに関する問題を修正 (#2791)
- [Compiler] 複数の一致がある場合、SELECT 内のテーブルをクエリ結果に使用するように修正 (#1874, #2313)
- [Compiler] INSTEAD OF トリガーを持つビューの更新をサポート (#1018)
- [Compiler] 関数名での from および for をサポート
- [Compiler] 関数式内での SEPARATOR キーワードを許可
- [Compiler] ORDER BY 内でエイリアスされたテーブルの ROWID にアクセスできない問題を修正
- [Compiler] MySQL の HAVING 句内でエイリアスされた列名が認識されない問題を修正
- [Compiler] 誤った「Multiple columns found」エラーを修正
- [Compiler] PRAGMA locking_mode = EXCLUSIVE; を設定できない問題を修正
- [PostgreSQL] PostgreSQL 列のリネームを修正
- [MySQL] MySQL 関数 UNIX_TIMESTAMP、TO_SECONDS、JSON_ARRAYAGG が認識されない問題を修正
- [SQLite] SQLite ウィンドウ機能を修正
- [IDE Plugin] 空のプログレスインジケータ内で goto ハンドラーを実行するように修正 (#2990)
- [IDE Plugin] プロジェクトが設定されていない場合はハイライトビジターを実行しないように修正 (#2981, #2976)
- [IDE Plugin] 推移的に生成されたコードも IDE 内で確実に更新されるよう修正 (#1837)
- [IDE Plugin] ダイアレクト更新時にインデックスを無効化するように修正

## [2.0.0-alpha01] - 2022-03-31 {id="2-0-0-alpha01-2022-03-31"}
[2.0.0-alpha01]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha01

これは 2.0 の最初のアルファリリースであり、いくつかの破壊的変更が含まれています。今後も ABI の破壊的変更が予定されているため、このリリースに依存するライブラリは公開しないでください（アプリケーションでの利用は問題ありません）。

### 破壊的変更

- まず、すべての `com.squareup.sqldelight` を `app.cash.sqldelight` に置換する必要があります。
- 次に、すべての `app.cash.sqldelight.android` を `app.cash.sqldelight.driver.android` に置換する必要があります。
- 3つ目に、すべての `app.cash.sqldelight.sqlite.driver` を `app.cash.sqldelight.driver.jdbc.sqlite` に置換する必要があります。
- 4つ目に、すべての `app.cash.sqldelight.drivers.native` を `app.cash.sqldelight.driver.native` に置換する必要があります。
- IDE プラグインを [alpha または eap チャンネル](https://plugins.jetbrains.com/plugin/8191-sqldelight/versions/alpha) にある 2.X バージョンに更新する必要があります。
- ダイアレクトは Gradle 内で指定可能な依存関係になりました：

```gradle
sqldelight {
  MyDatabase {
    packageName = "com.example"
    dialect = "app.cash.sqldelight:mysql-dialect:2.0.0-alpha01"
  }
}
```

現在サポートされているダイアレクトは、`mysql-dialect`、`postgresql-dialect`、`hsql-dialect`、`sqlite-3-18-dialect`、`sqlite-3-24-dialect`、`sqlite-3-25-dialect`、`sqlite-3-30-dialect`、`sqlite-3-35-dialect` です。

- プリミティブ型は明示的にインポートする必要があります（例えば `INTEGER AS Boolean` の場合、`import kotlin.Boolean` が必要です）。以前サポートされていた一部の型にはアダプターが必要になりました。大部分の変換に対応するプリミティブアダプターが `app.cash.sqldelight:primitive-adapters:2.0.0-alpha01` で利用可能です（`Integer AS kotlin.Int` を行うための `IntColumnAdapter` など）。

### 追加
- [IDE Plugin] 基本的な推奨マイグレーションの提示 (by @aperfilyev)
- [IDE Plugin] インポートヒントアクションを追加 (by @aperfilyev)
- [IDE Plugin] Kotlin クラスの補完を追加 (by @aperfilyev)
- [Gradle Plugin] Gradle タイプセーフプロジェクトアクセサー用のショートカットを追加 (by @hfhbd)
- [Compiler] ダイアレクトに基づいたコード生成のカスタマイズ (by @MariusVolkhart)
- [JDBC Driver] JdbcDriver に共通の型を追加 (by @MariusVolkhart)
- [SQLite] SQLite 3.35 のサポートを追加 (by @eygraber)
- [SQLite] ALTER TABLE DROP COLUMN のサポートを追加 (by @eygraber)
- [SQLite] SQLite 3.30 ダイアレクトのサポートを追加 (by @eygraber)
- [SQLite] SQLite での NULLS FIRST/LAST をサポート (by @eygraber)
- [HSQL] HSQL での生成列句のサポートを追加 (by @MariusVolkhart)
- [HSQL] HSQL での名前付きパラメータのサポートを追加 (by @MariusVolkhart)
- [HSQL] HSQL INSERT クエリをカスタマイズ (by @MariusVolkhart)

### 変更
- [全体] パッケージ名が com.squareup.sqldelight から app.cash.sqldelight に変更されました。
- [Runtime] ダイアレクトをそれぞれ独立した Gradle モジュールに分離
- [Runtime] ドライバー実装によるクエリ通知に切り替え
- [Runtime] デフォルトの列アダプターを別モジュールに抽出 (#2056, #2060)
- [Compiler] 各モジュールで再実行する代わりに、モジュール自身にクエリ実装を生成させるよう変更
- [Compiler] 生成されたデータクラスのカスタム toString 生成を削除 (by @PaulWoitaschek)
- [JS Driver] sqljs-driver から sql.js の依存関係を削除 (by @dellisd)
- [Paging] Android Paging 2 拡張を削除
- [IDE Plugin] SQLDelight 同期中のエディタバナーを追加 (#2511)
- [IDE Plugin] サポートする最小 IntelliJ バージョンは 2021.1

### 修正
- [Runtime] アロケーションとポインタチェイスを削減するためリスナーリストをフラット化 (by @andersio)
- [IDE Plugin] エラーへジャンプできるようエラーメッセージを修正 (by @hfhbd)
- [IDE Plugin] 不足していたインスペクションの説明を追加 (#2768 by @aperfilyev)
- [IDE Plugin] GotoDeclarationHandler での例外を修正 (#2531, #2688, #2804 by @aperfilyev)
- [IDE Plugin] import キーワードをハイライト表示 (by @aperfilyev)
- [IDE Plugin] 未解決の Kotlin 型を修正 (#1678 by @aperfilyev)
- [IDE Plugin] 未解決パッケージのハイライトを修正 (#2543 by @aperfilyev)
- [IDE Plugin] プロジェクトインデックスがまだ初期化されていない場合は、型の不一致列の検査を試行しないように修正
- [IDE Plugin] Gradle 同期が実行されるまでファイルインデックスを初期化しないように修正
- [IDE Plugin] Gradle 同期が開始された場合は SQLDelight のインポートをキャンセルするように修正
- [IDE Plugin] 元に戻す（Undo）操作が実行されたスレッドの外側でデータベースを再生成するように修正
- [IDE Plugin] 参照が解決できない場合は空の Java 型を使用するように修正
- [IDE Plugin] ファイルパース中はメインスレッドから適切に離れ、書き込み時のみ戻るように修正
- [IDE Plugin] 古い IntelliJ バージョンとの互換性を改善 (by @3flex)
- [IDE Plugin] より高速なアノテーション API を使用するように修正
- [Gradle Plugin] ランタイム追加時に js/android プラグインを明示的にサポート (by @ZacSweers)
- [Gradle Plugin] マイグレーションからスキーマを導出することなくマイグレーション出力タスクを登録 (#2744 by @kevincianfarini)
- [Gradle Plugin] マイグレーションタスクがクラッシュした場合、実行時にクラッシュしたファイルを出力するように修正
- [Gradle Plugin] 出力の冪等性を確保するため、コード生成時にファイルをソート (by @ZacSweers)
- [Compiler] ファイル反復処理により高速な API を使用し、PSI グラフ全体を探索しないように修正
- [Compiler] SELECT 関数のパラメータにキーワードマングリングを追加 (#2759 by @aperfilyev)
- [Compiler] マイグレーションアダプターの packageName を修正 (by @hfhbd)
- [Compiler] 型ではなくプロパティにアノテーションを出力するように修正 (#2798 by @aperfilyev)
- [Compiler] Query サブタイプに渡す前に引数をソート (by @aperfilyev)

## [1.5.3] - 2021-11-23 {id="1-5-3-2021-11-23"}
[1.5.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.3

### 追加
- [JDBC Driver] サードパーティのドライバー実装向けに JdbcDriver をオープン化 (#2672 by @hfhbd)
- [MySQL Dialect] 時間加算用の不足していた関数を追加 (#2671 by @sdoward)
- [Coroutines Extension] coroutines-extensions に M1 ターゲットを追加 (by @PhilipDukhov)

### 変更
- [Paging3 Extension] sqldelight-android-paging3 を AAR ではなく JAR として配布 (#2634 by @julioromano)
- 予約語（soft keywords）でもあるプロパティ名には末尾にアンダースコアが付加されるようになりました（例: `value` は `value_` として公開されます）。

### 修正
- [Compiler] 重複する配列パラメータに対して変数を抽出しないように修正 (by @aperfilyev)
- [Gradle Plugin] kotlin.mpp.enableCompatibilityMetadataVariant を追加 (#2628 by @martinbonnin)
- [IDE Plugin] 使用箇所の検索処理に Read Action を要求するように修正

## [1.5.2] - 2021-10-12 {id="1-5-2-2021-10-12"}
[1.5.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.2

### 追加
- [Gradle Plugin] HMPP をサポート (#2548 by @martinbonnin)
- [IDE Plugin] NULL 比較インスペクションを追加 (by @aperfilyev)
- [IDE Plugin] インスペクション抑止機能（suppressor）を追加 (#2519 by @aperfilyev)
- [IDE Plugin] 名前付きパラメータと位置パラメータの混在に関するインスペクションを追加 (by @aperfilyev)
- [SQLite Driver] mingwX86 ターゲットを追加 (#2558 by @enginegl)
- [SQLite Driver] M1 ターゲットを追加
- [SQLite Driver] linuxX64 のサポートを追加 (#2456 by @chippmann)
- [MySQL Dialect] MySQL に ROW_COUNT 関数を追加 (#2523)
- [PostgreSQL Dialect] PostgreSQL のリネーム、列削除 (by @pabl0rg)
- [PostgreSQL Dialect] PostgreSQL 文法が CITEXT を認識しない問題を修正
- [PostgreSQL Dialect] TIMESTAMP WITH TIME ZONE および TIMESTAMPTZ を追加
- [PostgreSQL Dialect] PostgreSQL GENERATED 列の文法を追加
- [Runtime] AfterVersion へのパラメータとして SqlDriver を提供 (#2534, 2614 by @ahmedre)

### 変更
- [Gradle Plugin] Gradle 7.0 を明示的に要求 (#2572 by @martinbonnin)
- [Gradle Plugin] VerifyMigrationTask が Gradle の最新性チェック（up-to-date checks）をサポートするように変更 (#2533 by @3flex)
- [IDE Plugin] null 許容型と非 null 型を結合する際、「Join compares two columns of different types（JOIN が異なる型の2つの列を比較しています）」という警告を出さないように変更 (#2550 by @pchmielowski)
- [IDE Plugin] 列型での小文字 'as' に対するエラーメッセージを明確化 (by @aperfilyev)

### 修正
- [IDE Plugin] プロジェクトがすでに破棄（dispose）されている場合は新しいダイアレクトで再パースしないように修正 (#2609)
- [IDE Plugin] 関連付けられた仮想ファイルが null の場合、モジュールも null になるよう修正 (#2607)
- [IDE Plugin] 未使用クエリのインスペクション中のクラッシュを回避 (#2610)
- [IDE Plugin] Write Action 内でデータベース同期書き込みを実行するように修正 (#2605)
- [IDE Plugin] IDE に SQLDelight の同期スケジュールを任せるように変更
- [IDE Plugin] JavaTypeMixin の NPE を修正 (#2603 by @aperfilyev)
- [IDE Plugin] MismatchJoinColumnInspection の IndexOutOfBoundsException を修正 (#2602 by @aperfilyev)
- [IDE Plugin] UnusedColumnInspection に説明を追加 (#2600 by @aperfilyev)
- [IDE Plugin] PsiElement.generatedVirtualFiles を Read Action でラップ (#2599 by @aperfilyev)
- [IDE Plugin] 不要な非 null キャストを削除 (#2596)
- [IDE Plugin] 使用箇所の検索で null を適切に処理するように修正 (#2595)
- [IDE Plugin] Android 向け生成ファイルに対する IDE オートコンプリートを修正 (#2573 by @martinbonnin)
- [IDE Plugin] SqlDelightGotoDeclarationHandler の NPE を修正 (by @aperfilyev)
- [IDE Plugin] INSERT 文内の引数に含まれる Kotlin キーワードをマングリング (by @aperfilyev)
- [IDE Plugin] SqlDelightFoldingBuilder の NPE を修正 (#2382 by @aperfilyev)
- [IDE Plugin] CopyPasteProcessor の ClassCastException をキャッチ (#2369 by @aperfilyev)
- [IDE Plugin] UPDATE ライブテンプレートを修正 (by @IliasRedissi)
- [IDE Plugin] インテンションアクションに説明を追加 (#2489 by @aperfilyev)
- [IDE Plugin] テーブルが見つからない場合の CreateTriggerMixin での例外を修正 (by @aperfilyev)
- [Compiler] テーブル作成文をトポロジカルソート
- [Compiler] ディレクトリに対して `forDatabaseFiles` コールバックを呼び出すのを停止 (#2532)
- [Gradle Plugin] generateDatabaseInterface タスクの依存関係を潜在的な利用側へ伝播 (#2518 by @martinbonnin)

## [1.5.1] - 2021-07-16 {id="1-5-1-2021-07-16"}
[1.5.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.1

### 追加
- [PostgreSQL Dialect] PostgreSQL JSONB および ON CONFLICT DO NOTHING (by @satook)
- [PostgreSQL Dialect] PostgreSQL ON CONFLICT (column, ...) DO UPDATE のサポートを追加 (by @satook)
- [MySQL Dialect] MySQL 生成列をサポート (by @JGulbronson)
- [Native Driver] watchosX64 のサポートを追加
- [IDE Plugin] パラメータの型とアノテーションを追加 (by @aperfilyev)
- [IDE Plugin] 'select all' クエリを生成するアクションを追加 (by @aperfilyev)
- [IDE Plugin] オートコンプリートで列の型を表示 (by @aperfilyev)
- [IDE Plugin] オートコンプリートにアイコンを追加 (by @aperfilyev)
- [IDE Plugin] 'select by primary key' クエリを生成するアクションを追加 (by @aperfilyev)
- [IDE Plugin] 'insert into' クエリを生成するアクションを追加 (by @aperfilyev)
- [IDE Plugin] 列名、文の識別子、関数名に対するハイライトを追加 (by @aperfilyev)
- [IDE Plugin] 残りのクエリ生成アクションを追加 (#489 by @aperfilyev)
- [IDE Plugin] insert-stmt からパラメータヒントを表示 (by @aperfilyev)
- [IDE Plugin] テーブルエイリアスのインテンションアクション (by @aperfilyev)
- [IDE Plugin] 列名の修飾（Qualify）インテンション (by @aperfilyev)
- [IDE Plugin] Kotlin プロパティへの宣言へのジャンプ (by @aperfilyev)

### 変更
- [Native Driver] 可能な場合はフリーズ（freezing）および共有可能データ構造を回避し、ネイティブトランザクションのパフォーマンスを改善 (by @andersio)
- [Paging 3] Paging3 のバージョンを 3.0.0 stable に引き上げ
- [JS Driver] sql.js を 1.5.0 にアップグレード

### 修正
- [JDBC SQLite Driver] ThreadLocal をクリアする前に接続で close() を呼び出すように修正 (#2444 by @hannesstruss)
- [RX extensions] 購読/破棄（subscription / disposal）の競合によるリークを修正 (#2403 by @pyricau)
- [Coroutines extension] 通知前にクエリリスナーが確実に登録されるように修正
- [Compiler] 一貫した Kotlin 出力ファイルを得るために notifyQueries をソート (by @thomascjy)
- [Compiler] SELECT クエリクラスのプロパティに @JvmField アノテーションを付与しないように修正 (by @eygraber)
- [IDE Plugin] インポートオプティマイザを修正 (#2350 by @aperfilyev)
- [IDE Plugin] 未使用列のインスペクションを修正 (by @aperfilyev)
- [IDE Plugin] インポートインスペクションおよびクラスアノテーターにネストされたクラスのサポートを追加 (by @aperfilyev)
- [IDE Plugin] CopyPasteProcessor の NPE を修正 (#2363 by @aperfilyev)
- [IDE Plugin] InlayParameterHintsProvider のクラッシュを修正 (#2359 by @aperfilyev)
- [IDE Plugin] CREATE TABLE 文にテキストをコピー＆ペーストした際に空白行が挿入される問題を修正 (#2431 by @aperfilyev)

## [1.5.0] - 2021-04-23 {id="1-5-0-2021-04-23"}
[1.5.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.0

### 追加
- [SQLite Javascript Driver] sqljs-driver の公開を有効化 (#1667 by @dellisd)
- [Paging3 Extension] Android Paging 3 ライブラリ向け拡張 (#1786 by @kevincianfarini)
- [MySQL Dialect] MySQL の ON DUPLICATE KEY UPDATE 競合解決のサポートを追加 (by @rharter)
- [SQLite Dialect] SQLite offsets() のコンパイラサポートを追加 (by @qjroberts)
- [IDE Plugin] 不明な型に対するインポートのクイックフィックスを追加 (#683 by @aperfilyev)
- [IDE Plugin] 未使用インポートのインスペクションを追加 (#1161 by @aperfilyev)
- [IDE Plugin] 未使用クエリのインスペクションを追加 (by @aperfilyev)
- [IDE Plugin] 未使用列のインスペクションを追加 (#569 by @aperfilyev)
- [IDE Plugin] コピー＆ペースト時にインポートを自動的に取り込むように改善 (#684 by @aperfilyev)
- [IDE Plugin] Gradle と IntelliJ プラグインのバージョン間に非互換性がある場合にバルーン通知を表示
- [IDE Plugin] Insert Into ... VALUES(?) のパラメータヒントを表示 (#506 by @aperfilyev)
- [IDE Plugin] インラインパラメータヒント (by @aperfilyev)
- [Runtime] コールバック付きでマイグレーションを実行するための API をランタイムに追加 (#1844)

### 変更
- [Compiler] "IS NOT NULL" クエリをスマートキャスト (#867)
- [Compiler] ランタイムで失敗するキーワードに対する保護を追加 (#1471, #1629)
- [Gradle Plugin] Gradle プラグインのサイズを 60MB から 13MB に削減
- [Gradle Plugin] Android バリアントを適切にサポートし、KMM ターゲット固有の SQL サポートを削除 (#1039)
- [Gradle Plugin] minsdk に基づいて最小 SQLite バージョンを選択するように変更 (#1684)
- [Native Driver] ネイティブドライバーの接続プールおよびパフォーマンスアップデート

### 修正
- [Compiler] ラムダ前の NBSP（ノーブレークスペース）を修正 (by @oldergod)
- [Compiler] 生成された bind* および cursor.get* 文における非互換な型を修正
- [Compiler] SQL 節で適合された型（adapted type）が保持されるよう修正 (#2067)
- [Compiler] NULL キーワードのみの列は null 許容になるよう修正
- [Compiler] 型アノテーション付きのラムダマッパーを生成しないように修正 (#1957)
- [Compiler] カスタムクエリが競合する場合、追加のパッケージサフィックスとしてファイル名を使用するように修正 (#1057, #1278)
- [Compiler] 外部キーカスケードによってクエリリスナーが確実に通知されるように修正 (#1325, #1485)
- [Compiler] 同一の型を UNION する場合、テーブルの型を返すように修正 (#1342)
- [Compiler] ifnull および coalesce へのパラメータが null 許容になり得るよう修正 (#1263)
- [Compiler] 式に対してクエリによって課された null 許容性を正しく使用するように修正
- [MySQL Dialect] MySQL の IF 文をサポート
- [PostgreSQL Dialect] PostgreSQL で NUMERIC および DECIMAL を Double として取得するように修正 (#2118)
- [SQLite Dialect] UPSERT 通知が BEFORE/AFTER UPDATE トリガーを考慮するように修正 (#2198 by @andersio)
- [SQLite Driver] インメモリでない限り、SqliteDriver のスレッドに対して複数の接続を使用するように修正 (#1832)
- [JDBC Driver] JDBC ドライバーが autoCommit を true と仮定していた問題を修正 (#2041)
- [JDBC Driver] 例外発生時に接続を確実にクローズするように修正 (#2306)
- [IDE Plugin] パス区切り文字のバグにより Windows 上で GoToDeclaration/FindUsages が壊れていた問題を修正 (#2054 by @angusholder)
- [IDE Plugin] IDE 内でクラッシュする代わりに Gradle エラーを無視するように修正
- [IDE Plugin] sqldelight ファイルが非 sqldelight モジュールに移動された場合、コード生成を試行しないように修正
- [IDE Plugin] IDE 内でのコード生成エラーを無視するように修正
- [IDE Plugin] 負のインデックスで部分文字列を取得しようとしないよう修正 (#2068)
- [IDE Plugin] Gradle アクションを実行する前にプロジェクトが破棄されていないことも確認するように修正 (#2155)
- [IDE Plugin] null 許容型に対する算術演算も null 許容になるよう修正 (#1853)
- [IDE Plugin] 追加の射影（projections）があっても「expand * intention」が動作するように修正 (#2173 by @aperfilyev)
- [IDE Plugin] GoTo 中に Kotlin の解決に失敗した場合、sqldelight ファイルへのジャンプを試行しないように修正
- [IDE Plugin] SQLDelight のインデックス作成中に IntelliJ が例外に遭遇してもクラッシュしないように修正
- [IDE Plugin] IDE でのコード生成前のエラー検出中に発生する例外を適切に処理
- [IDE Plugin] IDE プラグインを Dynamic Plugins と互換性を持つように修正 (#1536)
- [Gradle Plugin] WorkerApi を使用したデータベース生成時の競合状態を修正 (#2062 by @stephanenicolas)
- [Gradle Plugin] classLoaderIsolation によりカスタム JDBC の利用が妨げられていた問題を修正 (#2048 by @benasher44)
- [Gradle Plugin] packageName 欠落時のエラーメッセージを改善 (by @vanniktech)
- [Gradle Plugin] SQLDelight が IntelliJ の依存関係を buildscript クラスパスに漏出させていた問題を修正 (#1998)
- [Gradle Plugin] Gradle ビルドキャッシュを修正 (#2075)
- [Gradle Plugin] Gradle プラグインで kotlin-native-utils に依存しないように修正 (by @ilmat192)
- [Gradle Plugin] マイグレーションファイルのみが存在する場合でもデータベースを出力するように修正 (#2094)
- [Gradle Plugin] 最終コンパイルユニットでダイアモンド依存関係が一度だけ取得されるように修正 (#1455)

また、本リリースで SQLDelight のインフラ改善に多大な貢献をしてくれた @3flex に感謝します。

## [1.4.4] - 2020-10-08 {id="1-4-4-2020-10-08"}
[1.4.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.4

### 追加
- [PostgreSQL Dialect] WITH 内でのデータ変更文をサポート
- [PostgreSQL Dialect] substring 関数をサポート
- [Gradle Plugin] SQLDelight コンパイル中にマイグレーションを検証するための verifyMigrations フラグを追加 (#1872)

### 変更
- [Compiler] SQLite 固有の関数を非 SQLite ダイアレクトにおいて未知（unknown）としてフラグ付け
- [Gradle Plugin] sqldelight プラグインが適用されているにもかかわらずデータベースが設定されていない場合に警告を表示 (#1421)

### 修正
- [Compiler] ORDER BY 句内で列名をバインドした際にエラーを報告するように修正 (#1187 by @eygraber)
- [Compiler] DB インターフェース生成時にレジストリの警告が表示される問題を修正 (#1792)
- [Compiler] CASE 文に対する不適切な型推論を修正 (#1811)
- [Compiler] バージョンのないマイグレーションファイルに対してより良いエラーメッセージを提供するよう改善 (#2006)
- [Compiler] 一部のデータベース型 ColumnAdapter でマーシャリングに必要なデータベース型が正しくなかった問題を修正 (#2012)
- [Compiler] CAST の null 許容性を修正 (#1261)
- [Compiler] クエリラッパー内で発生していた大量の名前シャドウイング警告を修正 (#1946 by @eygraber)
- [Compiler] 生成コードで完全修飾名が使用されている問題を修正 (#1939)
- [IDE Plugin] Gradle 同期から sqldelight のコード生成をトリガーするように修正
- [IDE Plugin] .sq ファイルの変更時にプラグインがデータベースインターフェースを再生成しない問題を修正 (#1945)
- [IDE Plugin] 新しいパッケージへファイルを移動する際の問題を修正 (#444)
- [IDE Plugin] カーソルの移動先がない場合、クラッシュする代わりに何もしないように修正 (#1994)
- [IDE Plugin] Gradle プロジェクト外のファイルには空のパッケージ名を使用するように修正 (#1973)
- [IDE Plugin] 無効な型に対して適切に失敗（fail gracefully）するように修正 (#1943)
- [IDE Plugin] 未知の式に遭遇した際により分かりやすいエラーメッセージをスローするように修正 (#1958)
- [Gradle Plugin] SQLDelight が IntelliJ の依存関係を buildscript クラスパスに漏出させていた問題を修正 (#1998)
- [Gradle Plugin] *.sq ファイルにメソッドドキュメントを追加した際の "JavadocIntegrationKt not found" コンパイルエラーを修正 (#1982)
- [Gradle Plugin] SqlDelight Gradle プラグインが Configuration Caching (CoCa) をサポートしていない問題を修正 (#1947 by @stephanenicolas)
- [SQLite JDBC Driver] SQLException: database in auto-commit mode を修正 (#1832)
- [Coroutines Extension] coroutines-extensions の IR バックエンドを修正 (#1918 by @dellisd)

## [1.4.3] - 2020-09-04 {id="1-4-3-2020-09-04"}
[1.4.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.3

### 追加
- [MySQL Dialect] MySQL の last_insert_id 関数のサポートを追加 (by @lawkai)
- [PostgreSQL Dialect] SERIAL データ型をサポート (by @veyndan & @felipecsl)
- [PostgreSQL Dialect] PostgreSQL RETURNING をサポート (by @veyndan)

### 修正
- [MySQL Dialect] MySQL の AUTO_INCREMENT をデフォルト値を持つものとして扱うよう修正 (#1823)
- [Compiler] Upsert 文のコンパイラエラーを修正 (#1809 by @eygraber)
- [Compiler] 無効な Kotlin コードが生成される問題を修正 (#1925 by @eygraber)
- [Compiler] 未知の関数に対してより分かりやすいエラーメッセージを表示するよう改善 (#1843)
- [Compiler] instr の第2パラメータの型として String を公開
- [IDE Plugin] IDE プラグインにおけるデーモンの肥大化と UI スレッドの停止（stalling）を修正 (#1916)
- [IDE Plugin] モジュールが null の場合のシナリオを適切に処理 (#1902)
- [IDE Plugin] 未設定の sq ファイルではパッケージ名に空文字列を返すように修正 (#1920)
- [IDE Plugin] グループ化された文を修正し、統合テストを追加 (#1820)
- [IDE Plugin] 要素のモジュールを検索するために組み込みの ModuleUtil を使用するように修正 (#1854)
- [IDE Plugin] ルックアップには有効な要素のみを追加するように修正 (#1909)
- [IDE Plugin] 親要素が null になり得るケースを修正 (#1857)

## [1.4.2] - 2020-08-27 {id="1-4-2-2020-08-27"}
[1.4.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.2

### 追加
- [Runtime] 新しい JS IR バックエンドをサポート
- [Gradle Plugin] generateSqlDelightInterface Gradle タスクを追加 (by @vanniktech)
- [Gradle Plugin] verifySqlDelightMigration Gradle タスクを追加 (by @vanniktech)

### 修正
- [IDE Plugin] IDE と Gradle 間のデータ共有を促進するために Gradle tooling API を使用するように修正
- [IDE Plugin] スキーマ導出のデフォルトを false に変更
- [IDE Plugin] commonMain ソースセットを適切に取得するように修正
- [MySQL Dialect] mySqlFunctionType() に MINUTE を追加 (by @maaxgr)

## [1.4.1] - 2020-08-21 {id="1-4-1-2020-08-21"}
[1.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.1

### 追加
- [Runtime] Kotlin 1.4.0 をサポート (#1859)

### 変更
- [Gradle Plugin] AGP の依存関係を compileOnly に変更 (#1362)

### 修正
- [Compiler] 列定義ルールおよびテーブルインターフェースジェネレーターに任意の Javadoc を追加 (#1224 by @endanke)
- [SQLite Dialect] SQLite FTS5 補助関数 highlight、snippet、bm25 のサポートを追加 (by @drampelt)
- [MySQL Dialect] MySQL の BIT データ型をサポート
- [MySQL Dialect] MySQL のバイナリリテラルをサポート
- [PostgreSQL Dialect] sql-psi から SERIAL を公開 (by @veyndan)
- [PostgreSQL Dialect] BOOLEAN データ型を追加 (by @veyndan)
- [PostgreSQL Dialect] NULL 列制約を追加 (by @veyndan)
- [HSQL Dialect] HSQL に `AUTO_INCREMENT` サポートを追加 (by @rharter)

## [1.4.0] - 2020-06-22 {id="1-4-0-2020-06-22"}
[1.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.0

### 追加
- [MySQL Dialect] MySQL のサポート (by @JGulbronson & @veyndan)
- [PostgreSQL Dialect] 実験的な PostgreSQL のサポート (by @veyndan)
- [HSQL Dialect] 実験的な H2 のサポート (by @MariusVolkhart)
- [SQLite Dialect] SQLite FTS5 のサポート (by @benasher44 & @jpalawaga)
- [SQLite Dialect] ALTER TABLE RENAME COLUMN をサポート (#1505 by @angusholder)
- [IDE] マイグレーション（.sqm）ファイルの IDE サポート
- [IDE] 組み込みの SQL ライブテンプレートを模倣した SQLDelight ライブテンプレートを追加 (#1154 by @veyndan)
- [IDE] 新規 SqlDelight ファイル作成アクションを追加 (#42 by @romtsn)
- [Runtime] 結果を返すトランザクション用の transactionWithReturn API
- [Compiler] .sq ファイル内で複数の SQL 文をグループ化するための構文
- [Compiler] マイグレーションファイルからのスキーマ生成をサポート
- [Gradle Plugin] マイグレーションファイルを有効な SQL として出力するタスクを追加

### 変更
- [Documentation] ドキュメント Web サイトの刷新 (by @saket)
- [Gradle Plugin] サポートされていないダイアレクトのエラーメッセージを改善 (by @veyndan)
- [IDE] ダイアレクトに基づいて動的にファイルアイコンを変更 (by @veyndan)
- [JDBC Driver] javax.sql.DataSource から JdbcDriver コンストラクタを公開 (#1614)

### 修正
- [Compiler] テーブルでの Javadoc をサポートし、1つのファイルに複数の Javadoc がある場合の問題を修正 (#1224)
- [Compiler] 合成列（synthesized columns）への値の挿入を有効化 (#1351)
- [Compiler] ディレクトリ名のサニタイズにおける不整合を修正 (by @ZacSweers)
- [Compiler] 合成列が JOIN 全体で null 許容性を維持するように修正 (#1656)
- [Compiler] DELETE 文を DELETE キーワードに固定 (#1643)
- [Compiler] クォート処理を修正 (#1525 by @angusholder)
- [Compiler] 式へと適切に再帰するよう BETWEEN 演算子を修正 (#1279)
- [Compiler] インデックス作成時にテーブル/列が存在しない場合のエラーメッセージを改善 (#1372)
- [Compiler] JOIN 制約内で外部クエリの射影を使用できるように修正 (#1346)
- [Native Driver] execute が transationPool を使用するように修正 (by @benasher44)
- [JDBC Driver] SQLite の代わりに JDBC トランザクション API を使用するように修正 (#1693)
- [IDE] virtualFile 参照が常に元のファイルとなるように修正 (#1782)
- [IDE] Bugsnag にエラーを報告する際に正しい Throwable を使用するように修正 (#1262)
- [Paging Extension] リークしていた DataSource を修正 (#1628)
- [Gradle Plugin] スキーマ生成時に出力 DB ファイルがすでに存在する場合は削除するように修正 (#1645)
- [Gradle Plugin] 欠落（ギャップ）がある場合にマイグレーション検証を失敗させるよう修正
- [Gradle Plugin] 設定したファイルインデックスを明示的に使用するように修正 (#1644)

## [1.3.0] - 2020-04-03 {id="1-3-0-2020-04-03"}
[1.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.3.0

* 新機能: [Gradle] コンパイル対象の SQL ダイアレクトを指定する dialect プロパティを追加。
* 新機能: [Compiler] #1009 MySQL ダイアレクトの実験的サポート。
* 新機能: [Compiler] #1436 sqlite:3.24 ダイアレクトおよび UPSERT のサポート。
* 新機能: [JDBC Driver] SQLite JVM ドライバーから JDBC ドライバーを分離。
* 修正: [Compiler] #1199 任意の長さのラムダをサポート。
* 修正: [Compiler] #1610 avg() の戻り値型が null 許容になるよう修正。
* 修正: [IntelliJ] #1594 Windows 上で Goto および Find Usages を破損させていたパス区切り文字の処理を修正。

## [1.2.2] - 2020-01-22 {id="1-2-2-2020-01-22"}
[1.2.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.2

* 新機能: [Runtime] Windows (mingw)、tvOS、watchOS、macOS アーキテクチャのサポート。
* 修正: [Compiler] sum() の戻り値型は null 許容であるべき点に対応。
* 修正: [Paging] 競合状態を回避するため QueryDataSourceFactory に Transacter を渡すよう修正。
* 修正: [IntelliJ Plugin] ファイルのパッケージ名を検索する際に依存関係内を検索しないように修正。
* 修正: [Gradle] #862 Gradle のバリデータログをデバッグレベルに変更。
* 改善: [Gradle] GenerateSchemaTask が Gradle ワーカーを使用するように変換。
* 注意: sqldelight-runtime アーティファクトは runtime にリネームされました。

## [1.2.1] - 2019-12-11 {id="1-2-1-2019-12-11"}
[1.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.1

* 修正: [Gradle] Kotlin Native 1.3.60 のサポート。
* 修正: [Gradle] #1287 同期時の警告を修正。
* 修正: [Compiler] #1469 クエリに対する SynetheticAccessor の作成。
* 修正: [JVM Driver] メモリリークを修正。
* 注意: coroutine extension アーティファクトを使用する場合、buildscript に kotlinx bintray maven リポジトリを追加する必要があります。

## [1.2.0] - 2019-08-30 {id="1-2-0-2019-08-30"}
[1.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.0

* 新機能: [Runtime] 安定版 Flow API。
* 修正: [Gradle] Kotlin Native 1.3.50 のサポート。
* 修正: [Gradle] #1380 クリーンビルドが失敗することがある問題を修正。
* 修正: [Gradle] #1348 検証タスク実行時に "Could not retrieve functions" と出力される問題を修正。
* 修正: [Compile] #1405 クエリに JOIN された FTS テーブルが含まれているとプロジェクトをビルドできない問題を修正。
* 修正: [Gradle] #1266 複数のデータベースモジュールがある場合に散発的に Gradle ビルドが失敗する問題を修正。

## [1.1.4] - 2019-07-11 {id="1-1-4-2019-07-11"}
[1.1.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.4

* 新機能: [Runtime] 実験的な Kotlin Flow API。
* 修正: [Gradle] Kotlin/Native 1.3.40 との互換性。
* 修正: [Gradle] #1243 Gradle の configure on demand と組み合わせて SQLDelight を使用した場合の問題を修正。
* 修正: [Gradle] #1385 インクリメンタルアノテーション処理と組み合わせて SQLDelight を使用した場合の問題を修正。
* 修正: [Gradle] Gradle タスクのキャッシュを許可。
* 修正: [Gradle] #1274 Kotlin DSL での sqldelight 拡張の使用を有効化。
* 修正: [Compiler] 各クエリに対して決定論的に一意な ID を生成するように修正。
* 修正: [Compiler] トランザクション完了時にのみリスニング中のクエリに通知するように修正。
* 修正: [JVM Driver] #1370 JdbcSqliteDriver のユーザーに DB URL の指定を強制。

## [1.1.3] - 2019-04-14 {id="1-1-3-2019-04-14"}
[1.1.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.3

* Gradle Metadata 1.0 リリース。

## [1.1.2] - 2019-04-14 {id="1-1-2-2019-04-14"}
[1.1.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.2

* 新機能: [Runtime] #1267 ロギングドライバーデコレータ。
* 修正: [Compiler] #1254 2^16 文字より長い文字列リテラルを分割するように修正。
* 修正: [Gradle] #1260 マルチプラットフォームプロジェクトで生成ソースが iOS ソースとして認識されてしまう問題を修正。
* 修正: [IDE] #1290 CopyAsSqliteAction.kt:43 での kotlin.KotlinNullPointerException を修正。
* 修正: [Gradle] #1268 最近のバージョンで linkDebugFrameworkIos* タスクの実行が失敗する問題を修正。

## [1.1.1] - 2019-03-01 {id="1-1-1-2019-03-01"}
[1.1.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.1

* 修正: [Gradle] Android プロジェクトでのモジュール依存関係のコンパイルを修正。
* 修正: [Gradle] #1246 afterEvaluate で api 依存関係をセットアップするように修正。
* 修正: [Compiler] 配列型が正しく出力されるように修正。

## [1.1.0] - 2019-02-27 {id="1-1-0-2019-02-27"}
[1.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.0

* 新機能: [Gradle] #502 スキーマモジュールの依存関係の指定を許可。
* 改善: [Compiler] #1111 テーブルエラーが他のエラーよりも前にソートされるように改善。
* 修正: [Compiler] #1225 REAL リテラルに対して正しい型を返すように修正。
* 修正: [Compiler] #1218 トリガーを介して docid が伝播するように修正。

## [1.0.3] - 2019-01-30 {id="1-0-3-2019-01-30"}
[1.0.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.3

* 改善: [Runtime] #1195 Native Driver/Runtime Arm32。
* 改善: [Runtime] #1190 Query 型からマッパーを公開。

## [1.0.2] - 2019-01-26 {id="1-0-2-2019-01-26"}
[1.0.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.2

* 修正: [Gradle Plugin] Kotlin 1.3.20 にアップデート。
* 修正: [Runtime] トランザクションが例外を握りつぶさないように修正。

## [1.0.1] - 2019-01-21 {id="1-0-1-2019-01-21"}
[1.0.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.1

* 改善: [Native Driver] DatabaseConfiguration へのディレクトリ名の受け渡しを許可。
* 改善: [Compiler] #1173 パッケージのないファイルはコンパイルを失敗させるように変更。
* 修正: [IDE] IDE エラーを Square に正しく報告するように修正。
* 修正: [IDE] #1162 同一パッケージ内の型がエラー表示されるものの問題なく動作していた現象を修正。
* 修正: [IDE] #1166 テーブルのリネームが NPE で失敗する問題を修正。
* 修正: [Compiler] #1167 UNION と SELECT を含む複雑な SQL 文のパースを試みた際に例外をスローする問題を修正。

## [1.0.0] - 2019-01-08 {id="1-0-0-2019-01-08"}
[1.0.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.0

* 新機能: 生成コードの完全な刷新、すべて Kotlin で生成されるように変更。
* 新機能: RxJava2 拡張アーティファクト。
* 新機能: Android Paging 拡張アーティファクト。
* 新機能: Kotlin Multiplatform のサポート。
* 新機能: Android、iOS、JVM SQLite ドライバーアーティファクト。
* 新機能: Transaction API。

## [0.7.0] - 2018-02-12 {id="0-7-0-2018-02-12"}
[0.7.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.7.0

 * 新機能: 生成コードが Support SQLite ライブラリのみを使用するように更新。すべてのクエリが生の文字列ではなく statement オブジェクトを生成するように変更。
 * 新機能: IDE での statement 折りたたみ（folding）。
 * 新機能: Boolean 型が自動的に処理されるように変更。
 * 修正: コード生成から非推奨の marshal を削除。
 * 修正: 'avg' SQL 関数の型マッピングが REAL になるよう修正。
 * 修正: 'julianday' SQL 関数の検出を正しく修正。

## [0.6.1] - 2017-03-22 {id="0-6-1-2017-03-22"}
[0.6.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.6.1

 * 新機能: 引数のない Delete、Update、および Insert 文に対してコンパイル済み文を生成。
 * 修正: サブクエリで使用されるビュー内の USING 句でエラーが発生しないように修正。
 * 修正: 生成された Mapper で重複していた型を削除。
 * 修正: 引数に対してチェックを行う式の中でサブクエリを使用できるように修正。

## [0.6.0] - 2017-03-06 {id="0-6-0-2017-03-06"}
[0.6.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.6.0

 * 新機能: SELECT クエリが文字列定数ではなく `SqlDelightStatement` ファクトリとして公開されるように変更。
 * 新機能: クエリの Javadoc が statement および mapper ファクトリにコピーされるように変更。
 * 新機能: ビュー名用の文字列定数を出力。
 * 修正: ファクトリを必要とするビューへのクエリで、それらのファクトリを引数として正しく要求するように修正。
 * 修正: INSERT への引数の数が指定された列数と一致するか検証するように修正。
 * 修正: WHERE 句で使用される BLOB リテラルを適切にエンコードするように修正。
 * 本リリースには Gradle 3.3 以降が必要です。

## [0.5.1] - 2016-10-24 {id="0-5-1-2016-10-24"}
[0.5.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.5.1

 * 新機能: コンパイル済み文が抽象型を継承するように変更。
 * 修正: パラメータ内のプリミティブ型が null 許容の場合にボックス化されるように修正。
 * 修正: バインド引数に必要なすべてのファクトリがファクトリメソッド内に存在するように修正。
 * 修正: エスケープされた列名が正しくマーシャリングされるように修正。

## [0.5.0] - 2016-10-19 {id="0-5-0-2016-10-19"}
[0.5.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.5.0

 * 新機能: Factory を介して SQLite 引数をタイプセーフに渡せるように対応。
 * 新機能: IntelliJ プラグインが .sq ファイルのフォーマットを実行。
 * 新機能: SQLite タイムスタンプリテラルのサポート。
 * 修正: IntelliJ 内でパラメータ化された型をクリックしてジャンプできるように修正。
 * 修正: Cursor から取得した際、エスケープされた列名が RuntimeException をスローしないように修正。
 * 修正: 例外を出力しようとして Gradle プラグインがクラッシュしないように修正。

## [0.4.4] - 2016-07-20 {id="0-4-4-2016-07-20"}
[0.4.4]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.4

 * 新機能: 列の Java 型としての short 型をネイティブサポート。
 * 新機能: 生成された mapper およびファクトリメソッドに Javadoc を追加。
 * 修正: group_concat および nullif 関数が適切な null 許容性を持つように修正。
 * 修正: Android Studio 2.2-alpha との互換性。
 * 修正: WITH RECURSIVE によってプラグインがクラッシュしないように修正。

## [0.4.3] - 2016-07-07 {id="0-4-3-2016-07-07"}
[0.4.3]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.3

 * 新機能: コンパイルエラーがソースファイルへリンクするように対応。
 * 新機能: 右クリックして SQLDelight コードを有効な SQLite としてコピーする機能。
 * 新機能: 名前付き文の Javadoc が生成された String に表示されるように対応。
 * 修正: 生成されたビューモデルに null 許容性アノテーションが含まれるように修正。
 * 修正: UNION から生成されたコードが、すべての可能な列をサポートするために適切な型と null 許容性を持つように修正。
 * 修正: SQLite 関数 sum および round が生成コード内で適切な型を持つように修正。
 * 修正: CAST および内部 SELECT のバグ修正。
 * 修正: CREATE TABLE 文内でのオートコンプリート。
 * 修正: パッケージ内で SQLite キーワードを使用できるように修正。

## [0.4.2] - 2016-06-16 {id="0-4-2-2016-06-16"}
[0.4.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.2

 * 新機能: ファクトリから Marshal を作成できるように対応。
 * 修正: IntelliJ プラグインが適切なジェネリクス順序でファクトリメソッドを生成するように修正。
 * 修正: 関数名の大文字小文字を問わず使用できるように修正。

## [0.4.1] - 2016-06-14 {id="0-4-1-2016-06-14"}
[0.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.1

 * 修正: IntelliJ プラグインが適切なジェネリクス順序でクラスを生成するように修正。
 * 修正: 列定義の大文字小文字を問わず使用できるように修正。

## [0.4.0] - 2016-06-14 {id="0-4-0-2016-06-14"}
[0.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.0

 * 新機能: Mapper がテーブルごとではなくクエリごとに生成されるように変更。
 * 新機能: .sq ファイル内で Java 型をインポート可能に対応。
 * 新機能: SQLite 関数を検証。
 * 修正: 重複したエラーを削除。
 * 修正: 大文字の列名および Java キーワードと同じ列名でエラーが発生しないように修正。

## [0.3.2] - 2016-05-14 {id="0-3-2-2016-05-14"}
[0.3.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.2

 * 新機能: ビューおよびエイリアスに対してオートコンプリートと使用箇所の検索が機能するように対応。
 * 修正: コンパイル時検証において、SELECT 内で関数を使用できるように修正。
 * 修正: デフォルト値のみを宣言する INSERT 文をサポート。
 * 修正: SQLDelight を使用していないプロジェクトをインポートした際にプラグインがクラッシュしないように修正。

## [0.3.1] - 2016-04-27 {id="0-3-1-2016-04-27"}
[0.3.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.1

  * 修正: メソッド参照からの Illegal Access ランタイム例外を回避するため、インターフェースの可視性を public に戻すよう修正。
  * 修正: 部分式（Subexpressions）が適切に評価されるように修正。

## [0.3.0] - 2016-04-26 {id="0-3-0-2016-04-26"}
[0.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.0

  * 新機能: 列定義で SQLite 型を使用し、Java 型を指定するための追加の 'AS' 制約を持てるように対応。
  * 新機能: IDE からバグレポートを送信可能に対応。
  * 修正: オートコンプリートが適切に機能するように修正。
  * 修正: .sq ファイルの編集時に SQLDelight モデルファイルが更新されるように修正。
  * 削除: アタッチされたデータベースのサポートを終了。

## [0.2.2] - 2016-03-07 {id="0-2-2-2016-03-07"}
[0.2.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.2

 * 新機能: INSERT、UPDATE、DELETE、INDEX、TRIGGER 文で使用される列のコンパイル時検証。
 * 修正: ファイルの移動/作成時に IDE プラグインがクラッシュしないように修正。

## [0.2.1] - 2016-03-07 {id="0-2-1-2016-03-07"}
[0.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.1

 * 新機能: Ctrl+`/`（OSX では Cmd+`/`）で選択した行のコメントを切り替えられるように対応。
 * 新機能: SQL クエリで使用される列のコンパイル時検証。
 * 修正: IDE と Gradle プラグインの両方で Windows パスをサポート。

## [0.2.0] - 2016-02-29 {id="0-2-0-2016-02-29"}
[0.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.0

 * 新機能: Marshal クラスにコピーコンストラクタを追加。
 * 新機能: Kotlin 1.0 final にアップデート。
 * 修正: 'sqldelight' フォルダ構造の問題をビルド失敗にならない形で報告するように修正。
 * 修正: `table_name` という名前の列を禁止。生成された定数がテーブル名定数と衝突するため。
 * 修正: `.sq` ファイルが開かれているかどうかにかかわらず、IDE プラグインが即座にモデルクラスを生成するように修正。
 * 修正: IDE と Gradle プラグインの両方で Windows パスをサポート。

## [0.1.2] - 2016-02-13 {id="0-1-2-2016-02-13"}
[0.1.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.2

 * 修正: ほとんどのプロジェクトで Gradle プラグインが使用できなくなっていたコードを削除。
 * 修正: Antlr ランタイムに対する不足していたコンパイラ依存関係を追加。

## [0.1.1] - 2016-02-12 {id="0-1-1-2016-02-12"}
[0.1.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.1

 * 修正: Gradle プラグインが自身と同じバージョンのランタイムを確実に参照するように修正。

## [0.1.0] - 2016-02-12 {id="0-1-0-2016-02-12"}
[0.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.0

初回リリース。