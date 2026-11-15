# 変更履歴 (Change Log)

## 未リリース (Unreleased) {id="unreleased"}

### 追加 (Added) {id="added"}

- まだありません！

### 変更 (Changed) {id="changed"}

- まだありません！

### 修正 (Fixed) {id="fixed"}

- [Runtime] トランザクション終了時やロールバック後フック（post-rollback hook）も失敗した場合（たとえば、SQLiteが独自にトランザクションをロールバックした後に `cannot rollback - no transaction is active` が発生した場合など）に、トランザクション本体の例外を保持するように修正。2つ目の例外は抑制された例外（suppressed exception）として追加され、Androidドライバーは `endTransaction()` がスローした場合でも現在のトランザクションをクリアするようになりました (#6387 by @pyricau)
- [Gradle Plugin] Configuration.visible プロパティが効果を持たなくなりました。このプロパティは非推奨となり、Gradle 11で削除される予定です (#6394 by @griffio)
- [IntelliJ Plugin] JOINのインスペクションで誤検知（false positive）が表示される問題を修正 (#6398 by @griffio)

## [2.4.1] - 2026-10-06 {id="2-4-1-2026-10-06"}
[2.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.1

### 追加 (Added)

- [Documentation] Android SQLiteトランザクションに関するドキュメントを追加 (#6381 by @griffio)

### 変更 (Changed)

- [Gradle Plugin] コード生成タスク全体でパースされた `.sq` ファイルをメモリ内に保持し、ガベージコレクション後に再パースされないように変更。これにより、大規模プロジェクトでのコード生成が高速化される可能性があります (#6374 by @C2H6O)
- [IntelliJ Plugin] クラッシュレポートの送信先をカスタムのBugsnagインスタンスからJetBrains Marketplaceに変更 (#6376 by @JakeWharton)

### 修正 (Fixed)

- [IntelliJ Plugin] IntelliJ APIの使用方法を変更することで、プラグイン公開時の違反を修正 (#6366 #6368 by @griffio)
- [Intellij Plugin] 未処理のエラーをトラップすることで、入力時の安定性を向上 (#6355 by @griffio)

## [2.4.0] - 2026-09-17 {id="2-4-0-2026-09-17"}
[2.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0

### 追加 (Added)
- [Native Driver] `inMemoryDriver` に `extendedConfig` パラメーターを追加 (#5539 by @GuilhE)
- [PostgreSQL Dialect] 暗黙的に定義されたシステム列（System Columns）のクエリサポートを追加 (#5834 by @griffio)
- [PostgreSQL Dialect] 基本的な配列リテラルのサポートを追加 (#5997 by @griffio)
- [PostgreSQL Dialect] 基本的なLTREEサポートを追加 (#5880 by @yesitskev @griffio)
- [MySQL Dialect] INET関数のサポートを追加 (#5072 by @mcxinyu)
- [PostgreSQL Dialect] ALTER INDEX のサポートを追加 (#6224 by @griffio)
- [SQLite Dialect] SQLite 3.44の集約関数 DISTINCT、ORDER BY、FILTER のサポートを追加 (#6236 by @griffio)
- [SQLite Dialect] SQLite 3.37 STRICT テーブルのサポートを追加 (#6230 by @griffio)
- [Gradle Plugin] `codegenExcludedColumns` による生成モデルからの列除外サポートを追加 (#6243 by @sokolikp)
- [Compiler] スキーマに `allTableNames` 関数を追加 (#6245 by @edenman)
- [PostgreSQL Dialect] ANY演算子のサポートを追加 (#6253 by @griffio)
- [SQLite Dialect] SQLite 3.39の RIGHT JOIN および FULL JOIN のサポートを追加 (#6273 by @griffio)
- [PostgreSQL Dialect] トリガー関数における `RAISE` 文と `FOUND` 変数のサポートを追加 (#6297 by @griffio)

### 変更 (Changed)
- [PostgreSQL Dialect] arrayIntermediateType の可視性を public に変更 (#5835 by @griffio)
- [Gradle Plugin] より厳格な MigrationFile のバージョニングを実装 (#5730 by @madisp)
- [Gradle Plugin] サポートする最小Gradleバージョンを8.2.1に引き上げ (#6217 by @maxsav)
- [Gradle Plugin] Gradleの Isolated Projects をサポート (#6217 by @maxsav)
- [IntelliJ Plugin] 最小バージョンを 2023.3 / Android Studio Jellyfish に変更

### 修正 (Fixed)
- [Gradle Plugin] JDK 24+ でコンパイラワーカーから発生する `sun.misc.Unsafe` の非推奨警告を抑制 (#6321)
- [Compiler] 生成されたコードにおけるKotlinの余分な警告を抑制 (#6208 by @eyupcanakman)
- [Compiler] グループ化されていない集約結果セットの他の列が常にnull許容（nullable）になるよう修正
- [PostgreSQL Dialect] coalesce および ifnull のnull許容性を正しく解決するように修正
- [PostgreSQL Dialect] PostgreSQLダイアレクトのIDE統合を修正
- [PostgreSQL Dialect] PostgreSQLダイアレクト向けのIDEプラグインを改善 (#6209 by @griffio)
- [Intellij Plugin] IDEプラグインがすべてのダイアレクトでコード補完を実行できるように修正 (#6210 by @griffio)
- [Gradle Plugin] データベース検証タスクの実行時に発生する循環依存エラーを修正 (#6221 by @griffio)
- [Compiler] 複数行更新（multirow update）時の楽観的ロックを修正 (#6240 by @griffio)
- [Intellij Plugin] IDEA 2026.2 でクラッシュを引き起こす非推奨APIを修正 (#6247 by @griffio)
- [Gradle Plugin] AGP 8.9 から 8.11 において、生成されたソースがKotlinコンパイルで認識されない問題を修正
- [PostgreSQL Dialect] プリミティブなバインド引数を使用する lower および upper 関数のデフォルトが TEXT になるよう修正 (#6262 by @griffio)
- [Compiler] アダプターを使用したデータクラスバインディングとnull許容性を変更するマイグレーションを組み合わせた INSERT 句の値を修正 (#6269 by griffio)
- [Compiler] NULL安全な演算子（IS および IS DISTINCT FROM）でnull許容バインド引数を使用するように修正 (#6265 by @griffio)
- [Gradle Plugin] プロジェクト依存関係にAGPのバリアント解決を使用するように修正 (#6217 by @maxsav)
- [Gradle Plugin] ビルド間でAGPバリアントのリストが異なる場合に generateDatabaseInterface でビルドキャッシュミスが発生する問題を修正
- [Gradle Plugin] データベースを設定せずにプラグインを適用した際のIDE同期クラッシュを修正 (#6088)
- [PostgreSQL Dialect] ネストされた関数呼び出しを使用する場合のJSON集約関数を修正 (#6281 by @griffio)
- [Paging3 Extension] 空のデータベースで KeyedQueryPagingSource がクラッシュする問題を修正 (#6284 by @woods-marshes)
- [Compiler] `COALESCE` のようなカプセル化関数でミューテーター文が使用された場合のJavaタイプアダプターの問題を修正 (#6292 by @griffio)
- [Compiler] モジュール名が大文字の場合に、生成コードのパッケージ名も大文字になってしまう問題を修正 (#6316 by @griffio)
- [PostgreSQL Dialect] 日付データ型の大文字と小文字を区別しないように修正 (#6328 by @griffio)
- [PostgreSQL Dialect] `string_agg` 関数がnull許容になるよう修正 (#6340 by @griffio)
- [SQLite Dialect] `GROUP BY` を使用するSQLite 3.44の集約関数を修正 (#6343 by @griffio)
- [Gradle Plugin] 設定時（configuration time）でのデータベース依存関係の解決を回避 (#6353 by @joshfriend)

## [2.4.0-rc2] - 2026-09-14 {id="2-4-0-rc2-2026-09-14"}
[2.4.0-rc2]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0-rc2

### 修正 (Fixed)

- [PostgreSQL Dialect] `string_agg` 関数がnull許容になるよう修正 (#6340 by @griffio)
- [SQLite Dialect] `GROUP BY` を使用するSQLite 3.44の集約関数を修正 (#6343 by @griffio)
- [Gradle Plugin] 設定時（configuration time）でのデータベース依存関係の解決を回避 (#6353 by @joshfriend)

## [2.4.0-rc1] - 2026-09-01 {id="2-4-0-rc1-2026-09-01"}
[2.4.0-rc1]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0-rc1

### 追加 (Added)
- [Native Driver] `inMemoryDriver` に `extendedConfig` パラメーターを追加 (#5539 by @GuilhE)
- [PostgreSQL Dialect] 暗黙的に定義されたシステム列（System Columns）のクエリサポートを追加 (#5834 by @griffio)
- [PostgreSQL Dialect] 基本的な配列リテラルのサポートを追加 (#5997 by @griffio)
- [PostgreSQL Dialect] 基本的なLTREEサポートを追加 (#5880 by @yesitskev @griffio)
- [MySQL Dialect] INET関数のサポートを追加 (#5072 by @mcxinyu)
- [PostgreSQL Dialect] ALTER INDEX のサポートを追加 (#6224 by @griffio)
- [SQLite Dialect] SQLite 3.44の集約関数 DISTINCT、ORDER BY、FILTER のサポートを追加 (#6236 by @griffio)
- [SQLite Dialect] SQLite 3.37 STRICT テーブルのサポートを追加 (#6230 by @griffio)
- [Gradle Plugin] `codegenExcludedColumns` による生成モデルからの列除外サポートを追加 (#6243 by @sokolikp)
- [Compiler] スキーマに `allTableNames` 関数を追加 (#6245 by @edenman)
- [PostgreSQL Dialect] ANY演算子のサポートを追加 (#6253 by @griffio)
- [SQLite Dialect] SQLite 3.39の RIGHT JOIN および FULL JOIN のサポートを追加 (#6273 by @griffio)
- [PostgreSQL Dialect] トリガー関数における `RAISE` 文と `FOUND` 変数のサポートを追加 (#6297 by @griffio)

### 変更 (Changed)
- [PostgreSQL Dialect] arrayIntermediateType の可視性を public に変更 (#5835 by @griffio)
- [Gradle Plugin] より厳格な MigrationFile のバージョニングを実装 (#5730 by @madisp)
- [Gradle Plugin] サポートする最小Gradleバージョンを8.2.1に引き上げ (#6217 by @maxsav)
- [Gradle Plugin] Gradleの Isolated Projects をサポート (#6217 by @maxsav)
- [IntelliJ Plugin] 最小バージョンを 2023.3 / Android Studio Jellyfish に変更

### 修正 (Fixed)
- [Gradle Plugin] JDK 24+ でコンパイラワーカーから発生する `sun.misc.Unsafe` の非推奨警告を抑制 (#6321)
- [Compiler] 生成されたコードにおけるKotlinの余分な警告を抑制 (#6208 by @eyupcanakman)
- [Compiler] グループ化されていない集約結果セットの他の列が常にnull許容（nullable）になるよう修正
- [PostgreSQL Dialect] coalesce および ifnull のnull許容性を正しく解決するように修正
- [PostgreSQL Dialect] PostgreSQLダイアレクトのIDE統合を修正
- [PostgreSQL Dialect] PostgreSQLダイアレクト向けのIDEプラグインを改善 (#6209 by @griffio)
- [Intellij Plugin] IDEプラグインがすべてのダイアレクトでコード補完を実行できるように修正 (#6210 by @griffio)
- [Gradle Plugin] データベース検証タスクの実行時に発生する循環依存エラーを修正 (#6221 by @griffio)
- [Compiler] 複数行更新（multirow update）時の楽観的ロックを修正 (#6240 by @griffio)
- [Intellij Plugin] IDEA 2026.2 でクラッシュを引き起こす非推奨APIを修正 (#6247 by @griffio)
- [Gradle Plugin] AGP 8.9 から 8.11 において、生成されたソースがKotlinコンパイルで認識されない問題を修正
- [PostgreSQL Dialect] プリミティブなバインド引数を使用する lower および upper 関数のデフォルトが TEXT になるよう修正 (#6262 by @griffio)
- [Compiler] アダプターを使用したデータクラスバインディングとnull許容性を変更するマイグレーションを組み合わせた INSERT 句の値を修正 (#6269 by griffio)
- [Compiler] NULL安全な演算子（IS および IS DISTINCT FROM）でnull許容バインド引数を使用するように修正 (#6265 by @griffio)
- [Gradle Plugin] プロジェクト依存関係にAGPのバリアント解決を使用するように修正 (#6217 by @maxsav)
- [Gradle Plugin] ビルド間でAGPバリアントのリストが異なる場合に generateDatabaseInterface でビルドキャッシュミスが発生する問題を修正
- [Gradle Plugin] データベースを設定せずにプラグインを適用した際のIDE同期クラッシュを修正 (#6088)
- [PostgreSQL Dialect] ネストされた関数呼び出しを使用する場合のJSON集約関数を修正 (#6281 by @griffio)
- [Paging3 Extension] 空のデータベースで KeyedQueryPagingSource がクラッシュする問題を修正 (#6284 by @woods-marshes)
- [Compiler] `COALESCE` のようなカプセル化関数でミューテーター文が使用された場合のJavaタイプアダプターの問題を修正 (#6292 by @griffio)
- [Compiler] モジュール名が大文字の場合に、生成コードのパッケージ名も大文字になってしまう問題を修正 (#6316 by @griffio)
- [PostgreSQL Dialect] 日付データ型の大文字と小文字を区別しないように修正 (#6328 by @griffio)

## [2.3.2] - 2026-03-16 {id="2-3-2-2026-03-16"}
[2.3.2]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.2

### 追加 (Added)
- [PostgreSQL Dialect] ALTER TABLE ALTER TYPE USING 式のサポートを改善 (#6116 by @griffio)
- [PostgreSQL Dialect] DROP COLUMN IF EXISTS のサポートを追加 (#6112 by @griffio)
- [Gradle Plugin] SELECTのワイルドカード展開を無効化する expandSelectStar フラグを追加 (#5813 by @griffio)
- [MySQL Dialect] ウィンドウ関数のサポートを追加 (#6086 by @griffio)
- [Gradle Plugin] 開始スキーマバージョンが1以外で verifyMigrations が true の場合にビルドが失敗する問題を修正 (#6017 by @neilgmiller)
- [Gradle Plugin] `SqlDelightWorkerTask` の設定自由度を高め、Windows環境での開発をサポートするようにデフォルト設定を更新 (#5215 by @MSDarwish2000)
- [SQLite Dialect] FTS5仮想テーブルにおける合成列（synthesized columns）のサポートを追加 (#5986 by @watbe)
- [PostgreSQL Dialect] Postgresの行レベルセキュリティ（RLS）のサポートを追加 (#6087 by @shellderp)
- [PostgreSQL Dialect] FOR UPDATE を拡張し、OF table、NO KEY UPDATE、NO WAIT をサポート (#6104 by @shellderp)
- [PostgreSQL Dialect] Postgisの Point 型および関連関数をサポート (#5602 by @vanniktech)
- [Runtime] トランザクションの `CoroutineContext` を制御するメカニズムを提供する `SuspendingTransacter.TransactionDispatcher` を追加 (#5967 by @eygraber)
- [Gradle Plugin] Android Gradle Plugin 9.0 の新しいDSLと完全互換に対応 (#6140)
- [PostgreSQL Dialect] PostgreSQLの CREATE TABLE ストレージパラメーターをサポート (#6148 by @griffio)
- [PostgreSQL Dialect] PostgreSQLのユニークテーブル制約におけるnull許容結果列を修正 (#6167 by @griffio)

### 変更 (Changed)
- [Compiler] コンパイラの出力型を java.lang.Void から kotlin.Nothing に変更 (#6099 by @griffio)
- [Compiler] パッケージ名にアンダースコアを許可。以前はアンダースコアがサニタイズされ、予期しない動作が発生していました (#6027 by @BierDav)
- [Paging Extension] AndroidX Paging に切り替え (#5910 by @jeffdgr8)
- [Android Driver] Androidの minSdk を 23 に引き上げ (#6141)
- [Paging Extension] paging 3.4.1 にアップグレードし、X64 Appleターゲットを削除 (#6166)

### 修正 (Fixed)
- [IntelliJ Plugin] VFS更新イベント中にEDTでファイルタイプ検出をブロックすることによって引き起こされるIDEフリーズを修正
- [SQLite Dialect] JSONパス演算子を使用する際のSQLite 3.38のコンパイルエラーを修正 (#6070 by @griffio)
- [SQLite Dialect] カスタム列型を使用する場合の group_concat 関数に String 型を使用するように修正 (#6082 by @griffio)
- [Gradle Plugin] 複雑なスキーマでハングアップしないよう `VerifyMigrationTask` のパフォーマンスを向上 (#6073 by @Lightwood13)
- [Intellij Plugin] プラグインの初期化例外を修正し、非推奨メソッドを更新 (#6040 by @griffio)
- [Gradle Plugin] Android Gradle Pluginの内蔵Kotlinとの互換性を修正 (#6139)

## [2.3.1] - 2025-03-12 {id="2-3-1-2025-03-12"}
[2.3.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.1

リリースの失敗。2.3.2 を使用してください！

## [2.3.0] - 2025-03-12 {id="2-3-0-2025-03-12"}
[2.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.0

リリースの失敗。2.3.2 を使用してください！

## [2.2.1] - 2025-11-13 {id="2-2-1-2025-11-13"}
[2.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.2.1

### 追加 (Added)
- [PostgreSQL Dialect] Postgresの numeric/integer/biginteger 型マッピングを修正 (#5994 by @griffio)
- [Compiler] CAST が必要な場合、コンパイラのエラーメッセージにソースファイルの場所を含めるように改善 (#5979 by @griffio)
- [PostgreSQL Dialect] PostgresのJSON演算子によるパス抽出のサポートを追加 (#5971 by @griffio)
- [SQLite Dialect] 共通テーブル式（CTE）を使用した MATERIALIZED クエリプランナーヒントのSQLite 3.35サポートを追加 (#5961 by @griffio)
- [PostgreSQL Dialect] 共通テーブル式（CTE）を使用した MATERIALIZED クエリプランナーヒントのサポートを追加 (#5961 by @griffio)
- [PostgreSQL Dialect] Postgresの JSON Aggregate FILTER のサポートを追加 (#5957 by @griffio)
- [PostgreSQL Dialect] Postgresの Enum のサポートを追加 (#5935 by @griffio)
- [PostgreSQL Dialect] Postgresトリガーの限定的なサポートを追加 (#5932 by @griffio)
- [PostgreSQL Dialect] SQL式がJSONとしてパースできるかチェックする述語を追加 (#5843 by @griffio)
- [PostgreSQL Dialect] PostgreSQLの Comment On 文の限定的なサポートを追加 (#5808 by @griffio)
- [MySQL Dialect] インデックス可視性オプションのサポートを追加 (#5785 by @orenkislev-faire)
- [PostgreSql Dialect] TSQUERY データ型のサポートを追加 (#5779 by @griffio)
- [Gradle Plugin] モジュール追加時のバージョンカタログ（version catalogs）のサポートを追加 (#5755 by @DRSchlaubi)

### 変更 (Changed)
- 開発中スナップショットの公開先を Central Portal Snapshots リポジトリ（https://central.sonatype.com/repository/maven-snapshots/）に変更
- [Compiler] コンストラクター参照を使用して、デフォルトで生成されるクエリを簡素化 (#5814 by @jonapoul)

### 修正 (Fixed)
- [Compiler] 共通テーブル式（CTE）を含むビューを使用する際のスタックオーバーフローを修正 (#5928 by @griffio)
- [Gradle Plugin] SqlDelightツールウィンドウを開いて「New Connection」を追加する際のクラッシュを修正 (#5906 by @griffio)
- [IntelliJ Plugin] copy-to-sqlite ガターアクションにおけるスレッド関連のクラッシュを回避 (#5901 by @griffio)
- [IntelliJ Plugin] スキーマ文 CREATE INDEX および CREATE VIEW を使用する際のPostgreSQLダイアレクトの修正 (#5772 by @griffio)
- [Compiler] 列を参照する際のFTSスタックオーバーフローを修正 (#5896 by @griffio)
- [Compiler] With Recursive のスタックオーバーフローを修正 (#5892 by @griffio)
- [Compiler] Insert|Update|Delete Returning 文の通知を修正 (#5851 by @griffio)
- [Compiler] Long を返すトランザクションブロックの非同期結果型を修正 (#5836 by @griffio)
- [Compiler] SQLパラメーターバインディングの計算量を O(n²) から O(n) に最適化 (#5898 by @chenf7)
- [SQLite Dialect] SQLite 3.18で欠落していた関数を修正 (#5759 by @griffio)

## [2.2.0] - 2025-11-13 {id="2-2-0-2025-11-13"}
[2.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.2.0

成果物が部分的にしか公開されなかった失敗リリース。2.2.1 を使用してください！

## [2.1.0] - 2025-05-16 {id="2-1-0-2025-05-16"}
[2.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.1.0

### 追加 (Added)
- [WASM Driver] Web Workerドライバー向けに wasmJs のサポートを追加 (#5534 by @IlyaGulya)
- [PostgreSQL Dialect] PostgreSQLの配列を行に展開する UnNest のサポート (#5673 by @griffio)
- [PostgreSQL Dialect] PostgreSQLの TSRANGE/TSTZRANGE サポート (#5297 by @griffio)
- [PostgreSQL Dialect] PostgreSQLの Right Full Join (#5086 by @griffio)
- [PostgreSQL Dialect] PostgreSQLの日時型からの extract (#5273 by @griffio)
- [PostgreSQL Dialect] PostgreSQLの配列包含演算子 (#4933 by @griffio)
- [PostgreSQL Dialect] PostgreSQLの drop constraint (#5288 by @griffio)
- [PostgreSQL Dialect] PostgreSQLの型キャスト (#5089 by @griffio)
- [PostgreSQL Dialect] サブクエリに対するPostgreSQLの lateral join 演算子 (#5122 by @griffio)
- [PostgreSQL Dialect] PostgreSQLの ILIKE 演算子 (#5330 by @griffio)
- [PostgreSQL Dialect] PostgreSQLの XML 型 (#5331 by @griffio)
- [PostgreSQL Dialect] PostgreSQLの AT TIME ZONE (#5243 by @griffio)
- [PostgreSQL Dialect] PostgreSQLの order by nulls のサポート (#5199 by @griffio)
- [PostgreSQL Dialect] PostgreSQLの現在日時関数のサポートを追加 (#5226 by @drewd)
- [PostgreSQL Dialect] PostgreSQLの正規表現演算子 (#5137 by @griffio)
- [PostgreSQL Dialect] BRIN、GiST インデックスの追加 (#5059 by @griffio)
- [MySQL Dialect] MySQLダイアレクトにおける RENAME INDEX のサポート (#5212 by @orenkislev-faire)
- [JSON Extension] json table 関数にエイリアスを追加 (#5372 by @griffio)

### 変更 (Changed)
- [Compiler] 単純なミューテーターに対して、生成されたクエリファイルが行数を返すように変更 (#4578 by @MariusVolkhart)
- [Native Driver] DELETE、INSERT、UPDATE 文の readonly フラグを変更するため NativeSqlDatabase.kt を更新 (#5680 by @griffio)
- [PostgreSQL Dialect] PgInterval を String に変更 (#5403 by @griffio)
- [PostgreSQL Dialect] PostgreSQL拡張機能を実装するためのSqlDelightモジュールをサポート (#5677 by @griffio)

### 修正 (Fixed)
- [Compiler] 修正: 結果を伴うグループ文を実行する際のクエリ通知 (#5006 by @vitorhugods)
- [Compiler] SqlDelightModule の型リゾルバーを修正 (#5625 by @griffio)
- [Compiler] エスケープされた列を持つオブジェクトの挿入に関する 5501 を修正 (#5503 by @griffio)
- [Compiler] コンパイラ: 正しい行と文字位置へのパスリンクをクリックできるようにエラーメッセージを改善 (#5604 by @vanniktech)
- [Compiler] Issue 5298の修正: キーワードをテーブル名として使用できるように修正
- [Compiler] 名前付き execute の修正とテストの追加
- [Compiler] 初期化文のソート時に外部キーツールテーブル制約を考慮するように修正 (#5325 by @TheMrMilchmann)
- [Compiler] タブが含まれている場合でもエラーの下線が正しく整列するように修正 (#5224 by @drewd)
- [JDBC Driver] トランザクション終了時における connectionManager のメモリリークを修正
- [JDBC Driver] ドキュメントの記載通り、トランザクション内でSQLiteマイグレーションを実行するように修正 (#5218 by @morki)
- [JDBC Driver] トランザクションのコミット/ロールバック後の接続リークを修正 (#5205 by @morki)
- [Gradle Plugin] `GenerateSchemaTask` の前に `DriverInitializer` を実行するように修正 (#5562 by @nwagu)
- [Runtime] 実際のドライバーが Async の場合の LogSqliteDriver におけるクラッシュを修正 (#5723 by @edenman)
- [Runtime] StringBuilder の初期容量を修正 (#5192 by @janbina)
- [PostgreSQL Dialect] PostgreSQLの create or replace view を修正 (#5407 by @griffio)
- [PostgreSQL Dialect] PostgreSQLの to_json を修正 (#5606 by @griffio)
- [PostgreSQL Dialect] PostgreSQLの numeric リゾルバーを修正 (#5399 by @griffio)
- [PostgreSQL Dialect] SQLiteのウィンドウ関数を修正 (#2799 by @griffio)
- [PostgreSQL Dialect] PostgreSQLの SELECT DISTINCT ON を修正 (#5345 by @griffio)
- [PostgreSQL Dialect] alter table add column if not exists を修正 (#5309 by @griffio)
- [PostgreSQL Dialect] PostgreSQLの非同期バインドパラメーターを修正 (#5313 by @griffio)
- [PostgreSQL Dialect] PostgreSQLのブールリテラルを修正 (#5262 by @griffio)
- [PostgreSQL Dialect] PostgreSQLのウィンドウ関数を修正 (#5155 by @griffio)
- [PostgreSQL Dialect] PostgreSQLの isNull および isNotNull 型を修正 (#5173 by @griffio)
- [PostgreSQL Dialect] PostgreSQLの select distinct を修正 (#5172 by @griffio)
- [Paging Extension] Pagingのリフレッシュ時の初回ロードを修正 (#5615 by @evant)
- [Paging Extension] macOS Native ターゲットを追加 (#5324 by @vitorhugods)
- [IntelliJ Plugin] K2モードのサポート

## [2.0.2] - 2024-04-05 {id="2-0-2-2024-04-05"}
[2.0.2]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.2

### 追加 (Added)
- [PostgreSQL Dialect] PostgreSQLの STRING_AGG 関数を追加 (#4950 by @anddani)
- [PostgreSQL Dialect] pgダイアレクトに SET 文を追加 (#4927 by @de-luca)
- [PostgreSQL Dialect] PostgreSQLの alter column sequence パラメーターを追加 (#4916 by @griffio)
- [PostgreSQL Dialect] INSERT文に対するPostgreSQLの alter column default サポートを追加 (#4912 by @griffio)
- [PostgreSQL Dialect] PostgreSQLの alter sequence および drop sequence を追加 (#4920 by @griffio)
- [PostgreSQL Dialect] Postgresの正規表現関数の定義を追加 (#5025 by @MariusVolkhart)
- [PostgreSQL Dialect] GINインデックスの文法を追加 (#5027 by @griffio)

### 変更 (Changed)
- [IDE Plugin] 最小バージョンを 2023.1 / Android Studio Iguana に変更
- [Compiler] encapsulatingType で型のnull許容性をオーバーライドできるように変更 (#4882 by @eygraber)
- [Compiler] SELECT * の列名をインライン化
- [Gradle Plugin] processIsolation に切り替え (#5068 by @nwagu)
- [Android Runtime] Androidの minSDK を 21 に引き上げ (#5094 by @hfhbd)
- [Drivers] ダイアレクト開発者向けにJDBC/R2DBCステートメントのメソッドをより多く公開 (#5098 by @hfhbd)

### 修正 (Fixed)
- [PostgreSQL Dialect] PostgreSQLの alter table alter column を修正 (#4868 by @griffio)
- [PostgreSQL Dialect] テーブルモデルのインポートが欠落していた問題 4448 を修正 (#4885 by @griffio)
- [PostgreSQL Dialect] PostgreSQLのデフォルト制約関数 4932 を修正 (#4934 by @griffio)
- [PostgreSQL Dialect] マイグレーション中の alter table rename column におけるPostgreSQLのクラスキャストエラー 4879 を修正 (#4880 by @griffio)
- [PostgreSQL Dialect] PostgreSQLの create extension 4474 を修正 (#4541 by @griffio)
- [PostgreSQL Dialect] PostgreSQLの primary key 追加における非null型 5018 を修正 (#5020 by @griffio)
- [PostgreSQL Dialect] 集約式 4703 を修正 (#5071 by @griffio)
- [PostgreSQL Dialect] PostgreSQLの JSON 5028 を修正 (#5030 by @griffio)
- [PostgreSQL Dialect] PostgreSQLの JSON 演算子 5040 を修正 (#5041 by @griffio)
- [PostgreSQL Dialect] 5040 のJSON演算子バインディングを修正 (#5100 by @griffio)
- [PostgreSQL Dialect] tsvector 5082 を修正 (#5104 by @griffio)
- [PostgreSQL Dialect] PostgreSQL UPDATE FROM 文の列の隣接性に関する 5032 を修正 (#5035 by @griffio)
- [SQLite Dialect] SQLiteの alter table rename column 4897 を修正 (#4899 by @griffio)
- [IDE Plugin] エラーハンドラーのクラッシュを修正 (#4988 by @aperfilyev)
- [IDE Plugin] IDEA 2023.3 でBugSnagの初期化に失敗する問題を修正 (by @aperfilyev)
- [IDE Plugin] プラグイン経由でIntelliJで `.sq` ファイルを開いたときの PluginException を修正 (by @aperfilyev)
- [IDE Plugin] すでにプラグインの依存関係にあるため、IntelliJプラグインにKotlinライブラリをバンドルしないように修正 (#5126)
- [IDE Plugin] stream の代わりに extensions 配列を使用するように修正 (#5127)

## [2.0.1] - 2023-12-01 {id="2-0-1-2023-12-01"}
[2.0.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.1

### 追加 (Added)
- [Compiler] SELECT 実行時の複数列式（multi-column-expr）のサポートを追加 (#4453 by @Adriel-M)
- [PostgreSQL Dialect] PostgreSQLの CREATE INDEX CONCURRENTLY のサポートを追加 (#4531 by @griffio)
- [PostgreSQL Dialect] PostgreSQLのCTE補助文が相互に参照できるように修正 (#4493 by @griffio)
- [PostgreSQL Dialect] 二項式および sum に対するPostgreSQL型のサポートを追加 (#4539 by @Adriel-M)
- [PostgreSQL Dialect] PostgreSQLの SELECT DISTINCT ON 構文のサポートを追加 (#4584 by @griffio)
- [PostgreSQL Dialect] SELECT文におけるPostgreSQL JSON関数のサポートを追加 (#4590 by @MariusVolkhart)
- [PostgreSQL Dialect] PostgreSQLの generate_series 関数を追加 (#4717 by @griffio)
- [PostgreSQL Dialect] 追加のPostgres文字列関数定義を追加 (#4752 by @MariusVolkhart)
- [PostgreSQL Dialect] min および max 集約関数に DATE PostgreSQL型を追加 (#4816 by @anddani)
- [PostgreSQL Dialect] SqlBinaryExpr にPostgreSQLの日時型を追加 (#4657 by @griffio)
- [PostgreSQL Dialect] postgresダイアレクトに TRUNCATE を追加 (#4817 by @de-luca)
- [SQLite 3.35 Dialect] 順番に評価される複数の ON CONFLICT 句を許可 (#4551 by @griffio)
- [JDBC Driver] より快適なSQL編集のための Language アノテーションを追加 (#4602 by @MariusVolkhart)
- [Native Driver] linuxArm64 のサポートを追加 (#4792 by @hfhbd)
- [Android Driver] AndroidSqliteDriver に windowSizeBytes パラメーターを追加 (#4804 by @BoD)
- [Paging3 Extension] OffsetQueryPagingSource に initialOffset を追加 (#4802 by @MohamadJaara)

### 変更 (Changed)
- [Compiler] 適切な箇所でKotlin型を優先して使用するように変更 (#4517 by @eygraber)
- [Compiler] 値型の挿入（value type insert）を行う際は常に列名を含めるように変更 (#4864)
- [PostgreSQL Dialect] PostgreSQLダイアレクトから実験的ステータスを削除 (#4443 by @hfhbd)
- [PostgreSQL Dialect] PostgreSQL型に関するドキュメントを更新 (#4569 by @MariusVolkhart)
- [R2DBC Driver] PostgreSQLにおける整数データ型処理のパフォーマンスを最適化 (#4588 by @MariusVolkhart)

### 削除 (Removed) {id="removed"}
- [SQLite Javascript Driver] sqljs-driver を削除 (#4613, #4670 by @dellisd)

### 修正 (Fixed)
- [Compiler] パラメーターがなく戻り値を持つグループ文のコンパイルを修正 (#4699 by @griffio)
- [Compiler] SqlBinaryExpr による引数のバインドを修正 (#4604 by @griffio)
- [IDE Plugin] 設定されている場合はIDEAプロジェクトのJDKを使用するように修正 (#4689 by @griffio)
- [IDE Plugin] IDEA 2023.2 以降で発生する "Unknown element type: TYPE_NAME" エラーを修正 (#4727)
- [IDE Plugin] 2023.2 におけるいくつかの互換性の問題を修正
- [Gradle Plugin] Gradleタスク verifyMigrationTask のドキュメントを修正 (#4713 by @joshfriend)
- [Gradle Plugin] データベースを検証する前にデータベースを生成するよう促すGradleタスク出力メッセージを追加 (#4684 by @jingwei99)
- [PostgreSQL Dialect] PostgreSQLの列の名前変更を複数回行う場合の処理を修正 (#4566 by @griffio)
- [PostgreSQL Dialect] PostgreSQLの alter column のnull許容性 4714 を修正 (#4831 by @griffio)
- [PostgreSQL Dialect] alter table alter column 4837 を修正 (#4846 by @griffio)
- [PostgreSQL Dialect] PostgreSQLのシーケンス 4501 を修正 (#4528 by @griffio)
- [SQLite Dialect] 列式でのJSON二項演算子の使用を許可 (#4776 by @eygraber)
- [SQLite Dialect] 同名の列が複数見つかった場合の Update From の誤検知を修正 (#4777 by @eygraber)
- [Native Driver] 名前付きインメモリデータベースをサポート (#4662 by @05nelsonm)
- [Native Driver] クエリリスナーコレクションのスレッド安全性を確保 (#4567 by @kpgalligan)
- [JDBC Driver] ConnectionManager における接続リークを修正 (#4589 by @MariusVolkhart)
- [JDBC Driver] ConnectionManager の種類を選択する際の JdbcSqliteDriver のURLパースを修正 (#4656 by @05nelsonm)

## [2.0.0] - 2023-07-26 {id="2-0-0-2023-07-26"}
[2.0.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0

### 追加 (Added)
- [MySQL Dialect] IF 式における timestamp/bigint をサポート (#4329 by @shellderp)
- [MySQL Dialect] now 関数を追加 (#4431 by @hfhbd)
- [Web Driver] NPMパッケージの公開を有効化 (#4364)
- [IDE Plugin] Gradleツーリングの接続に失敗した際にスタックトレースを表示できるように修正 (#4383)

### 変更 (Changed)
- [Sqlite Driver] JdbcSqliteDriver のスキーママイグレーション利用を簡素化 (#3737 by @morki)
- [R2DBC Driver] 真の非同期R2DBCカーソルに対応 (#4387 by @hfhbd)

### 修正 (Fixed)
- [IDE Plugin] 必要になるまでデータベースプロジェクトサービスをインスタンス化しないように修正 (#4382)
- [IDE Plugin] 使用箇所の検索（find usages）中のプロセスキャンセルを適切に処理 (#4340)
- [IDE Plugin] IDEによる非同期コード生成を修正 (#4406)
- [IDE Plugin] パッケージ構造の組み立てを1回限りの計算に変更し、EDT外に移動 (#4417)
- [IDE Plugin] 2023.2 におけるKotlin型解決に正しいスタブインデックスキーを使用するように修正 (#4416)
- [IDE Plugin] 検索を実行する前にインデックスの準備が整うのを待つように修正 (#4419)
- [IDE Plugin] インデックスが利用できない場合は「宣言へ移動（goto）」を実行しないように修正 (#4420)
- [Compiler] グループ文の結果式を修正 (#4378)
- [Compiler] 仮想テーブルをインターフェース型として使用しないように修正 (#4427 by @hfhbd)

## [2.0.0-rc02] - 2023-06-27 {id="2-0-0-rc02-2023-06-27"}
[2.0.0-rc02]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-rc02

### 追加 (Added)
- [MySQL Dialect] 小文字の日付型、および日付型に対する min と max をサポート (#4243 by @shellderp)
- [MySQL Dialect] 二項式および sum に対するMySQL型をサポート (#4254 by @shellderp)
- [MySQL Dialect] 表示幅のない符号なし整数（unsigned int）をサポート (#4306 by @shellderp)
- [MySQL Dialect] LOCK IN SHARED MODE をサポート
- [PostgreSQL Dialect] min および max に boolean と Timestamp を追加 (#4245 by @griffio)
- [PostgreSQL Dialect] ウィンドウ関数のサポートを追加 (#4283 by @hfhbd)
- [Runtime] runtime に linuxArm64、androidNative、watchosDeviceArm ターゲットを追加 (#4258 by @hfhbd)
- [Paging Extension] paging extension に linux および mingw x64 ターゲットを追加 (#4280 by @chippman)

### 変更 (Changed)
- [Gradle Plugin] Android API 34 のダイアレクト自動サポートを追加 (#4251)
- [Paging Extension] QueryPagingSource での SuspendingTransacter サポートを追加 (#4292 by @daio)
- [Runtime] addListener API を改善 (#4244 by @hfhbd)
- [Runtime] マイグレーションバージョンとして Long を使用するように変更 (#4297 by @hfhbd)

### 修正 (Fixed)
- [Gradle Plugin] 生成ソースに対して安定した出力パスを使用するように修正 (#4269 by @joshfriend)
- [Gradle Plugin] Gradle関連の調整 (#4222 by @3flex)

## [2.0.0-rc01] - 2023-05-29 {id="2-0-0-rc01-2023-05-29"}
[2.0.0-rc01]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-rc01

### 追加 (Added)
- [Paging] paging extensions に JS ブラウザーターゲットを追加 (#3843 by @sproctor)
- [Paging] androidx-paging3 extension に iosSimulatorArm64 ターゲットを追加 (#4117)
- [PostgreSQL Dialect] gen_random_uuid() のサポートとテストを追加 (#3855 by @davidwheeler123)
- [PostgreSQL Dialect] alter table add constraint postgres のサポート (#4116 by @griffio)
- [PostgreSQL Dialect] alter table add constraint check のサポート (#4120 by @griffio)
- [PostgreSQL Dialect] PostgreSQLの文字長関数を追加 (#4121 by @griffio)
- [PostgreSQL Dialect] PostgreSQLの列デフォルト interval を追加 (#4142 by @griffio)
- [PostgreSQL Dialect] PostgreSQLの interval 列の結果を追加 (#4152 by @griffio)
- [PostgreSQL Dialect] PostgreSQLの Alter Column を追加 (#4165 by @griffio)
- [PostgreSQL Dialect] date_part を追加 (#4198 by @hfhbd)
- [MySQL Dialect] SQL文字長関数を追加 (#4134 by @griffio)
- [IDE Plugin] sqldelight ディレクトリの候補表示を追加 (#3976 by @aperfilyev)
- [IDE Plugin] プロジェクトツリー内の中間パッケージをコンパクト化 (#3992 by @aperfilyev)
- [IDE Plugin] JOIN句のコード補完を追加 (#4086 by @aperfilyev)
- [IDE Plugin] ビュー作成のインテンションとライブテンプレートを追加 (#4074 by @aperfilyev)
- [IDE Plugin] DELETE または UPDATE 内での WHERE 句欠落に対する警告を追加 (#4058 by @aperfilyev)
- [Gradle Plugin] 型安全なプロジェクトアクセサー（Type-safe project accessors）を有効化 (#4005 by @hfhbd)

### 変更 (Changed)
- [Gradle Plugin] ServiceLoaderメカニズムを使用して VerifyMigrationTask に DriverInitializer を登録できるように変更 (#3986 by @C2H6O)
- [Gradle Plugin] 明示的なコンパイラ環境を作成 (#4079 by @hfhbd)
- [JS Driver] Web Workerドライバーを別個のアーティファクトに分割
- [JS Driver] JsWorkerSqlCursor を公開しないように変更 (#3874 by @hfhbd)
- [JS Driver] sqljsドライバーの公開を無効化 (#4108)
- [Runtime] 同期ドライバーには同期スキーマ初期化子が必須となるよう強制 (#4013)
- [Runtime] カーソルの非同期サポートを改善 (#4102)
- [Runtime] 非推奨となったターゲットを削除 (#4149 by @hfhbd)
- [Runtime] 古いメモリモデル（MM）のサポートを削除 (#4148 by @hfhbd)

### 修正 (Fixed)
- [R2DBC Driver] ドライバーのクローズを await するように修正 (#4139 by @hfhbd)
- [Compiler] マイグレーションの PRAGMA をデータベースの create(SqlDriver) に含めるように修正 (#3845 by @MariusVolkhart)
- [Compiler] RETURNING 句のコード生成を修正 (#3872 by @MariusVolkhart)
- [Compiler] 仮想テーブル用の型を生成しないように修正 (#4015)
- [Gradle Plugin] Gradleプラグインの細かな利便性向上 (#3930 by @zacsweers)
- [IDE Plugin] 未解決のKotlin型を修正 (#3924 by @aperfilyev)
- [IDE Plugin] ワイルドカード展開インテンションが修飾子（qualifier）付きでも動作するように修正 (#3979 by @aperfilyev)
- [IDE Plugin] JAVA_HOME が見つからない場合は利用可能なJDKを使用するように修正 (#3925 by @aperfilyev)
- [IDE Plugin] パッケージ名に対する使用箇所の検索を修正 (#4010)
- [IDE Plugin] 無効な要素に対して自動インポートを表示しないように修正 (#4008)
- [IDE Plugin] ダイアレクトが見つからない場合は名前解決を行わないように修正 (#4009)
- [IDE Plugin] 無効化された状態（invalidated state）でのIDEのコンパイラ実行を無視するように修正 (#4016)
- [IDE Plugin] IntelliJ 2023.1 のサポートを追加 (#4037 by @madisp)
- [IDE Plugin] 列名変更時に名前付き引数の使用箇所も名前変更するように修正 (#4027 by @aperfilyev)
- [IDE Plugin] マイグレーション追加ポップアップを修正 (#4105 by @aperfilyev)
- [IDE Plugin] マイグレーションファイル内での SchemaNeedsMigrationInspection を無効化 (#4106 by @aperfilyev)
- [IDE Plugin] マイグレーション生成時に型名ではなくSQLの列名を使用するように修正 (#4112 by @aperfilyev)

## [2.0.0-alpha05] - 2023-01-20 {id="2-0-0-alpha05-2023-01-20"}
[2.0.0-alpha05]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha05

### 追加 (Added)
- [Paging] マルチプラットフォーム Paging 拡張機能 (by @jeffdgr8)
- [Runtime] Listener インターフェースに fun 修飾子を追加
- [SQLite Dialect] SQLite 3.33（UPDATE FROM）のサポートを追加 (by @eygraber)
- [PostgreSQL Dialect] PostgreSQLにおける UPDATE FROM のサポート (by @eygraber)

### 変更 (Changed)
- [RDBC Driver] コネクションを公開 (by @hfhbd)
- [Runtime] マイグレーションのコールバックをメインの `migrate` 関数に移動
- [Gradle Plugin] ダウンストリームプロジェクトから Configuration を隠蔽
- [Gradle Plugin] IntelliJ のみを shade（依存関係の再配置・同梱）するように変更 (by @hfhbd)
- [Gradle Plugin] Kotlin 1.8.0-Beta をサポートし、複数バージョンのKotlinテストを追加 (by @hfhbd)

### 修正 (Fixed)
- [RDBC Driver] 代わりに javaObjectType を使用するように修正 (by @hfhbd)
- [RDBC Driver] bindStatement におけるプリミティブのnull値を修正 (by @hfhbd)
- [RDBC Driver] R2DBC 1.0 をサポート (by @hfhbd)
- [PostgreSQL Dialect] 型パラメーターのない配列を修正 (by @hfhbd)
- [IDE Plugin] IntelliJのバージョンを 221.6008.13 に引き上げ (by @hfhbd)
- [Compiler] 純粋なビューから再帰的な元のテーブルを解決するように修正 (by @hfhbd)
- [Compiler] テーブルの外部キー句から値クラス（value class）を使用するように修正 (by @hfhbd)
- [Compiler] 括弧のないバインド式をサポートするよう SelectQueryGenerator を修正 (by @bellatoris)
- [Compiler] トランザクション使用時に ${name}Indexes 変数が重複して生成される問題を修正 (by @sachera)

## [1.5.5] - 2023-01-20 {id="1-5-5-2023-01-20"}
[1.5.5]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.5

Kotlin 1.8 および IntelliJ 2021+ 向けの互換性リリースです（JDK 17をサポート）。

## [1.5.4] - 2022-10-06 {id="1-5-4-2022-10-06"}
[1.5.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.4

Kotlin 1.7.20 および AGP 7.3.0 向けの互換性アップデートです。

## [2.0.0-alpha04] - 2022-10-03 {id="2-0-0-alpha04-2022-10-03"}
[2.0.0-alpha04]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha04

### 互換性を破る変更 (Breaking Changes) {id="breaking-changes"}

- Paging 3拡張機能のAPIが変更され、count には int 型のみが許可されるようになりました。
- coroutines拡張機能で、デフォルト値を使用する代わりにディスパッチャーの明示的な渡しが必須になりました。
- Dialect および Driver クラスが final になったため、継承の代わりに委譲（delegation）を使用してください。

### 追加 (Added)
- [HSQL Dialect] INSERT文で生成列（generated columns）に対する DEFAULT の使用をサポート (#3372 by @hfhbd)
- [PostgreSQL Dialect] INSERT文で生成列に対する DEFAULT の使用をサポート (#3373 by @hfhbd)
- [PostgreSQL Dialect] PostgreSQLに NOW() を追加 (#3403 by @hfhbd)
- [PostgreSQL Dialect] PostgreSQLに NOT 演算子を追加 (#3504 by @hfhbd)
- [Paging] *QueryPagingSource への CoroutineContext の受け渡しを許可 (#3384)
- [Gradle Plugin] ダイアレクトに対するより優れたバージョンカタログのサポートを追加 (#3435)
- [Native Driver] NativeSqliteDriver の DatabaseConfiguration 作成時にフックするコールバックを追加 (#3512 by @svenjacobs)

### 変更 (Changed)
- [Paging] KeyedQueryPagingSource を利用した QueryPagingSource 関数にデフォルトのディスパッチャーを追加 (#3385)
- [Paging] OffsetQueryPagingSource が Int のみで動作するように変更 (#3386)
- [Async Runtime] await* を親クラス ExecutableQuery に移動 (#3524 by @hfhbd)
- [Coroutines Extensions] Flow拡張機能のデフォルトパラメーターを削除 (#3489)

### 修正 (Fixed)
- [Gradle Plugin] Kotlin 1.7.20 に更新 (#3542 by @zacsweers)
- [R2DBC Driver] 常に値を送信するとは限らないR2DBCの変更に対応 (#3525 by @hfhbd)
- [HSQL Dialect] Hsql で SQLite の VerifyMigrationTask が失敗する問題を修正 (#3380 by @hfhbd)
- [Gradle Plugin] タスクを遅延構成API（lazy configuration API）を使用するように変換 (by @3flex)
- [Gradle Plugin] Kotlin 1.7.20 での NPE を回避 (#3398 by @ZacSweers)
- [Gradle Plugin] squash migrations タスクの説明文を修正 (#3449)
- [IDE Plugin] 新しいKotlinプラグインでの NoSuchFieldError を修正 (#3422 by @madisp)
- [IDE Plugin] UnusedQueryInspection の ArrayIndexOutOfBoundsException を修正 (#3427 by @vanniktech)
- [IDE Plugin] 古いKotlinプラグインの参照にリフレクションを使用するように変更
- [Compiler] 拡張関数を持つカスタムダイアレクトがインポートを作成しない問題を修正 (#3338 by @hfhbd)
- [Compiler] CodeBlock.of("${CodeBlock.toString()}") のエスケープを修正 (#3340 by @hfhbd)
- [Compiler] マイグレーション内の非同期 execute 文を待機（await）するように修正 (#3352)
- [Compiler] AS を修正 (#3370 by @hfhbd)
- [Compiler] `getObject` メソッドが実際の型の自動補完をサポート (#3401 by @robxyy)
- [Compiler] 非同期でグループ化された RETURNING 文のコード生成を修正 (#3411)
- [Compiler] 可能であればバインドパラメーターのKotlin型を推論し、不可能な場合はより適切なエラーメッセージで失敗するように改善 (#3413 by @hfhbd)
- [Compiler] ABS("foo") を許可しないように修正 (#3430 by @hfhbd)
- [Compiler] 他のパラメーターからのKotlin型の推論をサポート (#3431 by @hfhbd)
- [Compiler] 常にデータベース実装を作成するように修正 (#3540 by @hfhbd)
- [Compiler] JavaDocの制約を緩和し、カスタムマッパー関数にも追加 (#3554 @hfhbd)
- [Compiler] バインディング内の DEFAULT を修正 (by @hfhbd)
- [Paging] Paging 3 を修正 (#3396)
- [Paging] Long による OffsetQueryPagingSource の構築を許可 (#3409)
- [Paging] Dispatchers.Main を静的に置き換えないように修正 (#3428)

## [2.0.0-alpha03] - 2022-06-17 {id="2-0-0-alpha03-2022-06-17"}
[2.0.0-alpha03]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha03

### 互換性を破る変更 (Breaking Changes)

- ダイアレクトは通常のGradle依存関係のように参照されるようになりました。
```groovy
sqldelight {
  MyDatabase {
    dialect("app.cash.sqldelight:postgres-dialect:2.0.0-alpha03")
  }
}
```
- `AfterVersionWithDriver` 型は削除され、常にドライバーを受け取る `AfterVersion` に統合されました。
- `Schema` 型は `SqlDriver` のサブタイプではなくなりました。
- `PreparedStatement` API はゼロ始まり（0-based）のインデックスで呼び出されるようになりました。

### 追加 (Added)
- [IDE Plugin] 実行中のデータベースに対してSQLite、MySQL、PostgreSQLコマンドを実行するサポートを追加 (#2718 by @aperfilyev)
- [IDE Plugin] Android Studioのデータベースインスペクター（DB inspector）のサポートを追加 (#3107 by @aperfilyev)
- [Runtime] 非同期ドライバーのサポートを追加 (#3168 by @dellisd)
- [Native Driver] 新しいKotlin/Nativeメモリモデルをサポート (#3177 by @kpgalligan)
- [JS Driver] SqlJs worker 用のドライバーを追加 (#3203 by @dellisd)
- [Gradle Plugin] SQLDelightタスクのクラスパスを公開
- [Gradle Plugin] マイグレーションをスカッシュ（統合）するGradleタスクを追加
- [Gradle Plugin] マイグレーションチェック中にスキーマ定義を無視するフラグを追加
- [MySQL Dialect] MySQLでの FOR SHARE および FOR UPDATE をサポート (#3098)
- [MySQL Dialect] MySQLのインデックスヒントをサポート (#3099)
- [PostgreSQL Dialect] date_trunc を追加 (#3295 by @hfhbd)
- [JSON Extensions] JSONテーブル関数をサポート (#3090)

### 変更 (Changed)
- [Runtime] ドライバーを含まない AfterVersion 型を削除 (#3091)
- [Runtime] Schema 型をトップレベルに移動
- [Runtime] サードパーティの実装をサポートするため、ダイアレクトとリゾルバーを open に変更 (#3232 by @hfhbd)
- [Compiler] 失敗レポートにコンパイル時に使用されたダイアレクトを含めるように変更 (#3086)
- [Compiler] 未使用のアダプターをスキップ (#3162 by @eygraber)
- [Compiler] PrepareStatement でゼロ始まりのインデックスを使用するように変更 (#3269 by @hfhbd)
- [Gradle Plugin] ダイアレクトを文字列ではなく適切なGradle依存関係に変更 (#3085)
- [Gradle Plugin] Gradle検証タスク: データベースファイルが存在しない場合に例外をスローするように変更 (#3126 by @vanniktech)

### 修正 (Fixed)
- [Gradle Plugin] Gradleプラグインの細かなクリーンアップと調整 (#3171 by @3flex)
- [Gradle Plugin] 生成ディレクトリにAGP文字列を使用しないように修正
- [Gradle Plugin] AGPの namespace 属性を使用するように修正 (#3220)
- [Gradle Plugin] Gradleプラグインのランタイム依存関係として kotlin-stdlib を追加しないように修正 (#3245 by @mbonnin)
- [Gradle Plugin] マルチプラットフォーム設定を簡素化 (#3246 by @mbonnin)
- [Gradle Plugin] JSのみのプロジェクトをサポート (#3310 by @hfhbd)
- [IDE Plugin] Gradle Tooling API に JAVA_HOME を使用するように修正 (#3078)
- [IDE Plugin] IDEプラグイン内で正しいクラスローダーにJDBCドライバーをロードするように修正 (#3080)
- [IDE Plugin] 既存のPSI変更中のエラーを回避するため、無効化前にファイル要素を null に設定 (#3082)
- [IDE Plugin] ALTER TABLE 文内の新しいテーブル名の使用箇所を検索する際にクラッシュしないよう修正 (#3106)
- [IDE Plugin] インスペクターを最適化し、想定される例外タイプについては警告なしで処理（fail silently）するように修正 (#3121)
- [IDE Plugin] 生成ディレクトリになるべきファイルを削除 (#3198)
- [IDE Plugin] 安全でない演算子呼び出しを修正
- [Compiler] RETURNING 文を伴う更新および削除が確実にクエリを実行するように修正 (#3084)
- [Compiler] 複合SELECT（compound selects）における引数の型推論を正しく修正 (#3096)
- [Compiler] 共通テーブルはデータクラスを生成しないため、それらを返さないように修正 (#3097)
- [Compiler] 最上位のマイグレーションファイルをより高速に見つけるように修正 (#3108)
- [Compiler] パイプ演算子でnull許容性を適切に継承するように修正
- [Compiler] iif ANSI SQL関数をサポート
- [Compiler] 空のクエリファイルを生成しないように修正 (#3300 by @hfhbd)
- [Compiler] クエスチョンマークのみのアダプターを修正 (#3314 by @hfhbd)
- [PostgreSQL Dialect] Postgresの主キー列が常に非nullになるように修正 (#3092)
- [PostgreSQL Dialect] 複数テーブルで同名を使用する場合の COPY を修正 (#3297 by @hfhbd)
- [SQLite 3.35 Dialect] 変更されたテーブルからインデックス付きの列を削除する場合にのみエラーを表示するように修正 (#3158 by @eygraber)

## [2.0.0-alpha02] - 2022-04-13 {id="2-0-0-alpha02-2022-04-13"}
[2.0.0-alpha02]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha02

### 互換性を破る変更 (Breaking Changes)

- すべての `app.cash.sqldelight.runtime.rx` を `app.cash.sqldelight.rx2` に置き換える必要があります。

### 追加 (Added)
- [Compiler] グループ化された文の末尾での returning をサポート
- [Compiler] ダイアレクトモジュールによるコンパイラ拡張をサポートし、SQLite JSON拡張機能を追加 (#1379, #2087)
- [Compiler] 値を返す PRAGMA 文をサポート (#1106)
- [Compiler] マークされた列に対する値型の生成をサポート
- [Compiler] 楽観的ロックとバリデーションのサポートを追加 (#1952)
- [Compiler] 複数更新文（multi-update statements）をサポート
- [PostgreSQL] postgresの returning 文をサポート
- [PostgreSQL] postgresの日付型をサポート
- [PostgreSQL] pgの interval をサポート
- [PostgreSQL] PGの Boolean をサポートし、alter table での挿入を修正
- [PostgreSQL] Postgresでのオプションの limit をサポート
- [PostgreSQL] PGの BYTEA 型をサポート
- [PostgreSQL] postgresの serial 型のテストを追加
- [PostgreSQL] postgresの for update 構文をサポート
- [PostgreSQL] PostgreSQLの配列型をサポート
- [PostgreSQL] PGでのUUID型の保存/取得を適切に処理
- [PostgreSQL] PostgreSQLの NUMERIC 型をサポート (#1882)
- [PostgreSQL] 共通テーブル式（CTE）内での returning クエリをサポート (#2471)
- [PostgreSQL] JSON専用演算子をサポート
- [PostgreSQL] Postgresの COPY を追加 (by @hfhbd)
- [MySQL] MySQLの REPLACE をサポート
- [MySQL] NUMERIC/BigDecimal MySQL型をサポート (#2051)
- [MySQL] MySQLの TRUNCATE 文をサポート
- [MySQL] MySQL固有のJSON演算子をサポート (by @eygraber)
- [MySQL] MySQLの INTERVAL をサポート (#2969 by @eygraber)
- [HSQL] HSQLのウィンドウ機能を追加
- [SQLite] WHERE句内のnull許容パラメーターに対する等価性チェックを置き換えないように変更 (#1490 by @eygraber)
- [SQLite] SQLite 3.35の returning 文をサポート (#1490 by @eygraber)
- [SQLite] GENERATED 句をサポート
- [SQLite] SQLite 3.38ダイアレクトのサポートを追加 (by @eygraber)

### 変更 (Changed)
- [Compiler] 生成されたコードを整理
- [Compiler] グループ文内でのテーブルパラメーターの使用を禁止 (#1822)
- [Compiler] グループ化されたクエリをトランザクション内に配置 (#2785)
- [Runtime] ドライバーの execute メソッドから更新された行数を返すように変更
- [Runtime] SqlCursor をコネクションにアクセスするクリティカルセクションに限定 (#2123 by @andersio)
- [Gradle Plugin] マイグレーションのためにスキーマ定義を比較するように変更 (#841)
- [PostgreSQL] PGでの二重引用符の使用を禁止
- [MySQL] MySQLでの == の使用時にエラーを出力 (#2673)

### 修正 (Fixed)
- [Compiler] 2.0 alphaにおいて異なるテーブルからの同じアダプター型がコンパイルエラーを引き起こす問題を修正
- [Compiler] upsert 文のコンパイルに関する問題を修正 (#2791)
- [Compiler] 一致するものが複数ある場合、クエリ結果のSELECTでテーブルを使用するように修正 (#1874, #2313)
- [Compiler] INSTEAD OF トリガーを持つビューの更新をサポート (#1018)
- [Compiler] 関数名における from および for をサポート
- [Compiler] 関数式内での SEPARATOR キーワードを許可
- [Compiler] ORDER BY 内でエイリアスされたテーブルの ROWID にアクセスできない問題を修正
- [Compiler] MySQLの HAVING 句でエイリアスされた列名が認識されない問題を修正
- [Compiler] 誤った「Multiple columns found」エラーを修正
- [Compiler] PRAGMA locking_mode = EXCLUSIVE; を設定できない問題を修正
- [PostgreSQL] 列名変更（rename column）を修正
- [MySQL] UNIX_TIMESTAMP、TO_SECONDS、JSON_ARRAYAGG MySQL関数が認識されない問題を修正
- [SQLite] SQLiteのウィンドウ機能を修正
- [IDE Plugin] 空の進捗インジケーター内でgotoハンドラーを実行するように修正 (#2990)
- [IDE Plugin] プロジェクトが設定されていない場合はハイライトビジターを実行しないように修正 (#2981, #2976)
- [IDE Plugin] 伝播して生成されるコードもIDE内で確実に更新されるように修正 (#1837)
- [IDE Plugin] ダイアレクト更新時にインデックスを無効化するように修正

## [2.0.0-alpha01] - 2022-03-31 {id="2-0-0-alpha01-2022-03-31"}
[2.0.0-alpha01]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha01

これは2.0の最初のアルファリリースであり、いくつかの互換性を破る変更が含まれています。今後もさらなるABIの破壊的変更が予想されるため、このリリースに依存するライブラリは公開しないでください（アプリケーション開発での使用は問題ありません）。

### 互換性を破る変更 (Breaking Changes)

- まず、`com.squareup.sqldelight` のすべての記述を `app.cash.sqldelight` に置き換える必要があります。
- 次に、`app.cash.sqldelight.android` のすべての記述を `app.cash.sqldelight.driver.android` に置き換える必要があります。
- さらに、`app.cash.sqldelight.sqlite.driver` のすべての記述を `app.cash.sqldelight.driver.jdbc.sqlite` に置き換える必要があります。
- また、`app.cash.sqldelight.drivers.native` のすべての記述を `app.cash.sqldelight.driver.native` に置き換える必要があります。
- IDEプラグインを2.Xバージョンに更新する必要があります。[アルファまたはEAPチャンネル](https://plugins.jetbrains.com/plugin/8191-sqldelight/versions/alpha)から入手できます。
- ダイアレクトは依存関係となり、Gradle内で指定できるようになりました。

```gradle
sqldelight {
  MyDatabase {
    packageName = "com.example"
    dialect = "app.cash.sqldelight:mysql-dialect:2.0.0-alpha01"
  }
}
```

現在サポートされているダイアレクトは、`mysql-dialect`、`postgresql-dialect`、`hsql-dialect`、`sqlite-3-18-dialect`、`sqlite-3-24-dialect`、`sqlite-3-25-dialect`、`sqlite-3-30-dialect`、`sqlite-3-35-dialect` です。

- プリミティブ型はインポートが必要になりました（たとえば `INTEGER AS Boolean` の場合、`import kotlin.Boolean` を行う必要があります）。以前サポートされていた型の一部にはアダプターが必要になりました。大半の変換に対応するプリミティブアダプターは `app.cash.sqldelight:primitive-adapters:2.0.0-alpha01` で利用可能です（`Integer AS kotlin.Int` 用の `IntColumnAdapter` など）。

### 追加 (Added)
- [IDE Plugin] 基本的なマイグレーションのサジェスト (by @aperfilyev)
- [IDE Plugin] インポートヒントアクションの追加 (by @aperfilyev)
- [IDE Plugin] Kotlinクラスの補完を追加 (by @aperfilyev)
- [Gradle Plugin] Gradleの型安全なプロジェクトアクセサー用のショートカットを追加 (by @hfhbd)
- [Compiler] ダイアレクトに基づくコード生成のカスタマイズ (by @MariusVolkhart)
- [JDBC Driver] JdbcDriver に共通型を追加 (by @MariusVolkhart)
- [SQLite] SQLite 3.35のサポートを追加 (by @eygraber)
- [SQLite] ALTER TABLE DROP COLUMN のサポートを追加 (by @eygraber)
- [SQLite] SQLite 3.30ダイアレクトのサポートを追加 (by @eygraber)
- [SQLite] SQLiteでの NULLS FIRST/LAST をサポート (by @eygraber)
- [HSQL] generated 句のHSQLサポートを追加 (by @MariusVolkhart)
- [HSQL] HSQLにおける名前付きパラメーターのサポートを追加 (by @MariusVolkhart)
- [HSQL] HSQLの INSERT クエリをカスタマイズ (by @MariusVolkhart)

### 変更 (Changed)
- [Everything] パッケージ名が com.squareup.sqldelight から app.cash.sqldelight に変更されました。
- [Runtime] ダイアレクトを独自の独立したGradleモジュールに移動
- [Runtime] ドライバーが実装するクエリ通知方式に切り替え
- [Runtime] デフォルトの列アダプターを別モジュールに抽出 (#2056, #2060)
- [Compiler] 各モジュールで再実行するのではなく、モジュールにクエリ実装を生成させるように変更
- [Compiler] 生成されたデータクラスにおける独自の toString 生成を削除 (by @PaulWoitaschek)
- [JS Driver] sqljs-driver から sql.js の依存関係を削除 (by @dellisd)
- [Paging] Android Paging 2 拡張機能を削除
- [IDE Plugin] SQLDelightの同期中にエディターバナーを追加 (#2511)
- [IDE Plugin] サポートするIntelliJの最小バージョンを 2021.1 に変更

### 修正 (Fixed)
- [Runtime] アロケーションとポインタの追跡を減らすためリスナーリストをフラット化 (by @andersio)
- [IDE Plugin] エラーへジャンプできるようにエラーメッセージを修正 (by @hfhbd)
- [IDE Plugin] 不足していたインスペクションの説明を追加 (#2768 by @aperfilyev)
- [IDE Plugin] GotoDeclarationHandler での例外を修正 (#2531, #2688, #2804 by @aperfilyev)
- [IDE Plugin] import キーワードをハイライトするように修正 (by @aperfilyev)
- [IDE Plugin] 未解決のKotlin型を修正 (#1678 by @aperfilyev)
- [IDE Plugin] 未解決パッケージのハイライトを修正 (#2543 by @aperfilyev)
- [IDE Plugin] プロジェクトインデックスがまだ初期化されていない場合は不一致な列の検査を試みないように修正
- [IDE Plugin] Gradle同期が完了するまでファイルインデックスを初期化しないように修正
- [IDE Plugin] Gradle同期が開始された場合はSQLDelightのインポートをキャンセルするように修正
- [IDE Plugin] 元に戻す（undo）アクションが実行されたスレッドの外側でデータベースを再生成するように修正
- [IDE Plugin] 参照を解決できない場合は空のJava型を使用するように修正
- [IDE Plugin] ファイルパース中は適切にメインスレッドから離れ、書き込み時のみメインスレッドに戻るように修正
- [IDE Plugin] 古いIntelliJバージョンとの互換性を改善 (by @3flex)
- [IDE Plugin] より高速なアノテーションAPIを使用するように変更
- [Gradle Plugin] ランタイム追加時に js/android プラグインを明示的にサポート (by @ZacSweers)
- [Gradle Plugin] マイグレーションからスキーマを導出することなくマイグレーション出力タスクを登録 (#2744 by @kevincianfarini)
- [Gradle Plugin] マイグレーションタスクがクラッシュした場合に、クラッシュした実行ファイル名を出力するように修正
- [Gradle Plugin] 出力の冪等性を確保するためコード生成時にファイルをソート (by @ZacSweers)
- [Compiler] ファイルの反復処理により高速なAPIを使用し、PSIグラフ全体を探索しないように修正
- [Compiler] SELECT関数のパラメーターにキーワードマングリングを追加 (#2759 by @aperfilyev)
- [Compiler] マイグレーションアダプターの packageName を修正 (by @hfhbd)
- [Compiler] 型ではなくプロパティにアノテーションを出力するように修正 (#2798 by @aperfilyev)
- [Compiler] Query サブタイプに渡す前に引数をソート (by @aperfilyev)

## [1.5.3] - 2021-11-23 {id="1-5-3-2021-11-23"}
[1.5.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.3

### 追加 (Added)
- [JDBC Driver] サードパーティのドライバー実装向けに JdbcDriver を open に変更 (#2672 by @hfhbd)
- [MySQL Dialect] 時刻加算用の不足していた関数を追加 (#2671 by @sdoward)
- [Coroutines Extension] coroutines-extensions に M1 ターゲットを追加 (by @PhilipDukhov)

### 変更 (Changed)
- [Paging3 Extension] sqldelight-android-paging3 を AAR ではなく JAR として配布するように変更 (#2634 by @julioromano)
- ソフトキーワード（soft keyword）でもあるプロパティ名にアンダースコアが付加されるようになりました。たとえば `value` は `value_` として公開されます。

### 修正 (Fixed)
- [Compiler] 重複する配列パラメーターに対して変数を抽出しないように修正 (by @aperfilyev)
- [Gradle Plugin] kotlin.mpp.enableCompatibilityMetadataVariant を追加 (#2628 by @martinbonnin)
- [IDE Plugin] 使用箇所の検索処理にリード（read）アクションを要求するように修正

## [1.5.2] - 2021-10-12 {id="1-5-2-2021-10-12"}
[1.5.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.2

### 追加 (Added)
- [Gradle Plugin] HMPP（階層型マルチプラットフォームプロジェクト）のサポート (#2548 by @martinbonnin)
- [IDE Plugin] NULL比較インスペクションを追加 (by @aperfilyev)
- [IDE Plugin] インスペクション抑制機能（suppressor）を追加 (#2519 by @aperfilyev)
- [IDE Plugin] 名前付きパラメーターと位置指定パラメーターの混在に関するインスペクションを追加 (by @aperfilyev)
- [SQLite Driver] mingwX86 ターゲットを追加 (#2558 by @enginegl)
- [SQLite Driver] M1 ターゲットを追加
- [SQLite Driver] linuxX64 のサポートを追加 (#2456 by @chippmann)
- [MySQL Dialect] MySQLに ROW_COUNT 関数を追加 (#2523)
- [PostgreSQL Dialect] 列名変更（rename）、列削除（drop column）のサポート (by @pabl0rg)
- [PostgreSQL Dialect] PostgreSQLの文法で CITEXT を認識するように修正
- [PostgreSQL Dialect] TIMESTAMP WITH TIME ZONE および TIMESTAMPTZ を追加
- [PostgreSQL Dialect] PostgreSQLの GENERATED 列用の文法を追加
- [Runtime] AfterVersion のパラメーターとして SqlDriver を提供 (#2534, 2614 by @ahmedre)

### 変更 (Changed)
- [Gradle Plugin] Gradle 7.0 の使用を明示的に要求 (#2572 by @martinbonnin)
- [Gradle Plugin] VerifyMigrationTask が Gradle の最新状態チェック（up-to-date checks）をサポートするように変更 (#2533 by @3flex)
- [IDE Plugin] null許容型と非null型を結合する際に「Join compares two columns of different types（Joinで異なる型の2つの列を比較しています）」という警告を出さないように修正 (#2550 by @pchmielowski)
- [IDE Plugin] 列型における小文字の 'as' に対するエラーメッセージを明確化 (by @aperfilyev)

### 修正 (Fixed)
- [IDE Plugin] プロジェクトがすでに破棄されている場合は新しいダイアレクトで再パースしないように修正 (#2609)
- [IDE Plugin] 関連付けられた仮想ファイルが null の場合、モジュールも null になるよう修正 (#2607)
- [IDE Plugin] 未使用クエリの検査中にクラッシュする問題を回避 (#2610)
- [IDE Plugin] データベース同期の書き込みをライト（write）アクション内で実行するように修正 (#2605)
- [IDE Plugin] SQLDelightの同期スケジュールをIDE側に委ねるように修正
- [IDE Plugin] JavaTypeMixin における NPE を修正 (#2603 by @aperfilyev)
- [IDE Plugin] MismatchJoinColumnInspection における IndexOutOfBoundsException を修正 (#2602 by @aperfilyev)
- [IDE Plugin] UnusedColumnInspection の説明を追加 (#2600 by @aperfilyev)
- [IDE Plugin] PsiElement.generatedVirtualFiles をリード（read）アクションでラップするように修正 (#2599 by @aperfilyev)
- [IDE Plugin] 不要な非nullキャストを削除 (#2596)
- [IDE Plugin] 使用箇所の検索で null を適切に処理するように修正 (#2595)
- [IDE Plugin] Android向けに生成されたファイルのIDEオートコンプリートを修正 (#2573 by @martinbonnin)
- [IDE Plugin] SqlDelightGotoDeclarationHandler における NPE を修正 (by @aperfilyev)
- [IDE Plugin] INSERT文内の引数に含まれるKotlinキーワードをマングル処理するように修正 (#2433 by @aperfilyev)
- [IDE Plugin] SqlDelightFoldingBuilder における NPE を修正 (#2382 by @aperfilyev)
- [IDE Plugin] CopyPasteProcessor における ClassCastException をキャッチするように修正 (#2369 by @aperfilyev)
- [IDE Plugin] UPDATEのライブテンプレートを修正 (by @IliasRedissi)
- [IDE Plugin] インテンションアクションに説明を追加 (#2489 by @aperfilyev)
- [IDE Plugin] テーブルが見つからない場合の CreateTriggerMixin における例外を修正 (by @aperfilyev)
- [Compiler] テーブル作成文をトポロジカルソートするように修正
- [Compiler] ディレクトリに対して `forDatabaseFiles` コールバックを呼び出すのを停止 (#2532)
- [Gradle Plugin] generateDatabaseInterface タスクの依存関係を潜在的なコンシューマーに伝播 (#2518 by @martinbonnin)

## [1.5.1] - 2021-07-16 {id="1-5-1-2021-07-16"}
[1.5.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.1

### 追加 (Added)
- [PostgreSQL Dialect] PostgreSQLの JSONB および ON CONFLICT DO NOTHING をサポート (by @satook)
- [PostgreSQL Dialect] PostgreSQLの ON CONFLICT (column, ...) DO UPDATE のサポートを追加 (by @satook)
- [MySQL Dialect] MySQLの生成列（generated columns）をサポート (by @JGulbronson)
- [Native Driver] watchosX64 のサポートを追加
- [IDE Plugin] パラメーターの型とアノテーションを追加 (by @aperfilyev)
- [IDE Plugin] 「すべて選択（select all）」クエリを生成するアクションを追加 (by @aperfilyev)
- [IDE Plugin] オートコンプリートに列の型を表示 (by @aperfilyev)
- [IDE Plugin] オートコンプリートにアイコンを追加 (by @aperfilyev)
- [IDE Plugin] 「主キーによる選択（select by primary key）」クエリを生成するアクションを追加 (by @aperfilyev)
- [IDE Plugin] 「insert into」クエリを生成するアクションを追加 (by @aperfilyev)
- [IDE Plugin] 列名、文の識別子、関数名に対するハイライトを追加 (by @aperfilyev)
- [IDE Plugin] 残りのクエリ生成アクションを追加 (#489 by @aperfilyev)
- [IDE Plugin] INSERT文からのパラメーターヒントを表示 (by @aperfilyev)
- [IDE Plugin] テーブルエイリアスのインテンションアクションを追加 (by @aperfilyev)
- [IDE Plugin] 列名修飾（qualify column name）のインテンションを追加 (by @aperfilyev)
- [IDE Plugin] Kotlinプロパティの「宣言へ移動（go to declaration）」を追加 (by @aperfilyev)

### 変更 (Changed)
- [Native Driver] フリーズ処理や共有可能なデータ構造を可能な限り回避することで、ネイティブトランザクションのパフォーマンスを向上 (by @andersio)
- [Paging 3] Paging3 のバージョンを 3.0.0 stable に引き上げ
- [JS Driver] sql.js を 1.5.0 にアップグレード

### 修正 (Fixed)
- [JDBC SQLite Driver] ThreadLocal をクリアする前に接続に対して close() を呼び出すように修正 (#2444 by @hannesstruss)
- [RX extensions] 購読/破棄（subscription / disposal）の競合によるリークを修正 (#2403 by @pyricau)
- [Coroutines extension] 通知前に確実にクエリリスナーを登録するように修正
- [Compiler] 一貫性のあるKotlin出力ファイルを得るために notifyQueries をソートするように修正 (by @thomascjy)
- [Compiler] SELECTクエリクラスのプロパティに @JvmField アノテーションを付与しないように修正 (by @eygraber)
- [IDE Plugin] インポートの最適化（import optimizer）を修正 (#2350 by @aperfilyev)
- [IDE Plugin] 未使用列のインスペクションを修正 (by @aperfilyev)
- [IDE Plugin] インポートインスペクションおよびクラスアノテーターにネストされたクラスのサポートを追加 (by @aperfilyev)
- [IDE Plugin] CopyPasteProcessor における NPE を修正 (#2363 by @aperfilyev)
- [IDE Plugin] InlayParameterHintsProvider におけるクラッシュを修正 (#2359 by @aperfilyev)
- [IDE Plugin] CREATE TABLE 文に任意のテキストをコピー＆ペーストした際に空行が挿入される問題を修正 (#2431 by @aperfilyev)

## [1.5.0] - 2021-04-23 {id="1-5-0-2021-04-23"}
[1.5.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.0

### 追加 (Added)
- [SQLite Javascript Driver] sqljs-driver の公開を有効化 (#1667 by @dellisd)
- [Paging3 Extension] Android Paging 3 ライブラリ用の拡張機能 (#1786 by @kevincianfarini)
- [MySQL Dialect] MySQLの ON DUPLICATE KEY UPDATE 競合解決のサポートを追加 (by @rharter)
- [SQLite Dialect] SQLite offsets() のコンパイラサポートを追加 (by @qjroberts)
- [IDE Plugin] 不明な型に対するインポートのクイックフィックスを追加 (#683 by @aperfilyev)
- [IDE Plugin] 未使用のインポートのインスペクションを追加 (#1161 by @aperfilyev)
- [IDE Plugin] 未使用のクエリのインスペクションを追加 (by @aperfilyev)
- [IDE Plugin] 未使用の列のインスペクションを追加 (#569 by @aperfilyev)
- [IDE Plugin] コピー＆ペースト時にインポートを自動的に引き継ぐように修正 (#684 by @aperfilyev)
- [IDE Plugin] GradleとIntelliJプラグインのバージョン間に互換性がない場合にバルーン通知を表示
- [IDE Plugin] INSERT INTO ... VALUES(?) のパラメーターヒントを追加 (#506 by @aperfilyev)
- [IDE Plugin] インラインパラメーターヒントを追加 (by @aperfilyev)
- [Runtime] コールバック付きでマイグレーションを実行するためのAPIをランタイムに追加 (#1844)

### 変更 (Changed)
- [Compiler] "IS NOT NULL" クエリに対するスマートキャスト (#867)
- [Compiler] 実行時に失敗するキーワードからの保護 (#1471, #1629)
- [Gradle Plugin] Gradleプラグインのサイズを 60MB から 13MB に削減
- [Gradle Plugin] Androidのバリアントを適切にサポートし、KMMのターゲット固有SQLのサポートを削除 (#1039)
- [Gradle Plugin] minsdk に基づいて最小のSQLiteバージョンを選択するように変更 (#1684)
- [Native Driver] ネイティブドライバーの接続プールおよびパフォーマンスをアップデート

### 修正 (Fixed)
- [Compiler] ラムダの前のノーブレークスペース（NBSP）を修正 (by @oldergod)
- [Compiler] 生成された bind* および cursor.get* 文における型の非互換性を修正
- [Compiler] SQL句が適合した型を保持するように修正 (#2067)
- [Compiler] NULL キーワードのみの列をnull許容（nullable）として扱うように修正
- [Compiler] 型アノテーション付きのマッパーラムダを生成しないように修正 (#1957)
- [Compiler] カスタムクエリが競合する場合、追加のパッケージサフィックスとしてファイル名を使用するように修正 (#1057, #1278)
- [Compiler] 外部キーのカスケードによって確実にクエリリスナーに通知されるように修正 (#1325, #1485)
- [Compiler] 同じ型の2つを UNION する場合、テーブル型を返すように修正 (#1342)
- [Compiler] ifnull および coalesce へのパラメーターをnull許容にできるように修正 (#1263)
- [Compiler] 式に対してクエリから課されるnull許容性を正しく適用するように修正
- [MySQL Dialect] MySQLの IF 文をサポート
- [PostgreSQL Dialect] PostgreSQLで NUMERIC および DECIMAL を Double として取得するように修正 (#2118)
- [SQLite Dialect] UPSERT 通知が BEFORE/AFTER UPDATE トリガーを考慮するように修正 (#2198 by @andersio)
- [SQLite Driver] インメモリでない限り、SqliteDriver 内のスレッドに対して複数の接続を使用するように修正 (#1832)
- [JDBC Driver] JDBCドライバーが autoCommit を true と仮定してしまう問題を修正 (#2041)
- [JDBC Driver] 例外発生時に確実に接続を閉じるように修正 (#2306)
- [IDE Plugin] パス区切り文字のバグによりWindows上で「宣言へ移動/使用箇所の検索」が機能しなくなっていた問題を修正 (#2054 by @angusholder)
- [IDE Plugin] IDE内でクラッシュする代わりにGradleエラーを無視するように修正
- [IDE Plugin] sqldelight ファイルが非sqldelightモジュールに移動された場合、コード生成を試行しないように修正
- [IDE Plugin] IDE内でのコード生成エラーを無視するように修正
- [IDE Plugin] 負のインデックスで文字列の切り出し（substring）を試行しないように修正 (#2068)
- [IDE Plugin] Gradleアクションを実行する前にプロジェクトが破棄されていないことを確認するように修正 (#2155)
- [IDE Plugin] null許容型に対する算術演算の結果もnull許容になるよう修正 (#1853)
- [IDE Plugin] 「* の展開インテンション」が追加の射影（projections）でも動作するように修正 (#2173 by @aperfilyev)
- [IDE Plugin] 「宣言へ移動」の実行中にKotlinの解決に失敗した場合、sqldelight ファイルへの移動を試行しないように修正
- [IDE Plugin] SQLDelightのインデックス作成中にIntelliJで例外が発生してもクラッシュしないように修正
- [IDE Plugin] IDEでのコード生成前のエラー検出中に発生する例外を適切に処理
- [IDE Plugin] IDEプラグインを Dynamic Plugins（動的プラグイン）に対応 (#1536)
- [Gradle Plugin] WorkerApi を使用したデータベース生成時の競合状態を修正 (#2062 by @stephanenicolas)
- [Gradle Plugin] classLoaderIsolation によりカスタムJDBCの使用が妨げられる問題を修正 (#2048 by @benasher44)
- [Gradle Plugin] packageName 欠落時のエラーメッセージを改善 (by @vanniktech)
- [Gradle Plugin] SQLDelightがビルドスクリプトのクラスパスにIntelliJの依存関係を混入させていた問題を修正 (#1998)
- [Gradle Plugin] Gradleのビルドキャッシングを修正 (#2075)
- [Gradle Plugin] Gradleプラグイン内で kotlin-native-utils に依存しないように修正 (by @ilmat192)
- [Gradle Plugin] マイグレーションファイルのみが存在する場合でもデータベースを書き出すように修正 (#2094)
- [Gradle Plugin] 最終コンパイル単位で菱形依存関係（diamond dependencies）が1度だけ取り込まれるように修正 (#1455)

今リリースでSQLDelightのインフラ改善に大きく貢献してくれた @3flex にも感謝します。

## [1.4.4] - 2020-10-08 {id="1-4-4-2020-10-08"}
[1.4.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.4

### 追加 (Added)
- [PostgreSQL Dialect] WITH句内でのデータ変更文をサポート
- [PostgreSQL Dialect] substring 関数をサポート
- [Gradle Plugin] SQLDelightのコンパイル中にマイグレーションを検証するための verifyMigrations フラグを追加 (#1872)

### 変更 (Changed)
- [Compiler] 非SQLiteダイアレクトにおいて、SQLite固有の関数を不明なものとしてフラグを立てるように変更
- [Gradle Plugin] sqldelight プラグインが適用されているにもかかわらずデータベースが設定されていない場合に警告を表示 (#1421)

### 修正 (Fixed)
- [Compiler] ORDER BY 句で列名をバインドする際にエラーを報告するように修正 (#1187 by @eygraber)
- [Compiler] データベースインターフェース生成時にレジストリ警告が表示される問題を修正 (#1792)
- [Compiler] case 文における不正な型推論を修正 (#1811)
- [Compiler] バージョンのないマイグレーションファイルに対してより分かりやすいエラーを出力するように修正 (#2006)
- [Compiler] 一部のデータベース型 ColumnAdapter でマーシャリングに必要なデータベース型が正しくなかった問題を修正 (#2012)
- [Compiler] CAST のnull許容性を修正 (#1261)
- [Compiler] クエリラッパーで名前のシャドウイング（name shadowed）警告が多数発生する問題を修正 (#1946 by @eygraber)
- [Compiler] 生成コードが完全修飾名を使用するように修正 (#1939)
- [IDE Plugin] Gradle同期からSQLDelightのコード生成をトリガーするように修正
- [IDE Plugin] `.sq` ファイルを変更してもプラグインがデータベースインターフェースを再生成しない問題を修正 (#1945)
- [IDE Plugin] 新しいパッケージにファイルを移動した際の問題を修正 (#444)
- [IDE Plugin] カーソルの移動先がない場合、クラッシュする代わりに何もしないように修正 (#1994)
- [IDE Plugin] Gradleプロジェクト外のファイルには空のパッケージ名を使用するように修正 (#1973)
- [IDE Plugin] 無効な型に対して適切にフォールバック（fail gracefully）するように修正 (#1943)
- [IDE Plugin] 不明な式に遭遇した際により分かりやすいエラーメッセージをスローするように修正 (#1958)
- [Gradle Plugin] SQLDelightがビルドスクリプトのクラスパスにIntelliJの依存関係を混入させていた問題を修正 (#1998)
- [Gradle Plugin] `*.sq` ファイルにメソッドドキュメントを追加した際の「JavadocIntegrationKt not found」コンパイルエラーを修正 (#1982)
- [Gradle Plugin] Gradleプラグインが Configuration Cache（CoCa）をサポートしていなかった問題を修正 (#1947 by @stephanenicolas)
- [SQLite JDBC Driver] SQLException: database in auto-commit mode を修正 (#1832)
- [Coroutines Extension] coroutines-extensions の IR バックエンドを修正 (#1918 by @dellisd)

## [1.4.3] - 2020-09-04 {id="1-4-3-2020-09-04"}
[1.4.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.3

### 追加 (Added)
- [MySQL Dialect] MySQLの last_insert_id 関数のサポートを追加 (by @lawkai)
- [PostgreSQL Dialect] SERIAL データ型のサポート (by @veyndan & @felipecsl)
- [PostgreSQL Dialect] PostgreSQLの RETURNING をサポート (by @veyndan)

### 修正 (Fixed)
- [MySQL Dialect] MySQLの AUTO_INCREMENT をデフォルト値を持つものとして扱うように修正 (#1823)
- [Compiler] Upsert 文のコンパイルエラーを修正 (#1809 by @eygraber)
- [Compiler] 不正なKotlinコードが生成される問題を修正 (#1925 by @eygraber)
- [Compiler] 不明な関数に対してより適切なエラーメッセージを表示するように修正 (#1843)
- [Compiler] instr の第2パラメーターの型として String を公開するように修正
- [IDE Plugin] IDEプラグインのデーモン肥大化とUIスレッドのストールを修正 (#1916)
- [IDE Plugin] モジュールが null のシナリオを適切に処理 (#1902)
- [IDE Plugin] 未設定の sq ファイルではパッケージ名に空文字列を返すように修正 (#1920)
- [IDE Plugin] グループ化された文を修正し、統合テストを追加 (#1820)
- [IDE Plugin] 要素のモジュール検索に内蔵の ModuleUtil を使用するように修正 (#1854)
- [IDE Plugin] ルックアップには有効な要素のみを追加するように修正 (#1909)
- [IDE Plugin] 親要素が null になり得るケースを処理 (#1857)

## [1.4.2] - 2020-08-27 {id="1-4-2-2020-08-27"}
[1.4.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.2

### 追加 (Added)
- [Runtime] 新しい JS IR バックエンドをサポート
- [Gradle Plugin] generateSqlDelightInterface Gradleタスクを追加 (by @vanniktech)
- [Gradle Plugin] verifySqlDelightMigration Gradleタスクを追加 (by @vanniktech)

### 修正 (Fixed)
- [IDE Plugin] IDEとGradle間のデータ共有を円滑にするために Gradle Tooling API を使用するように修正
- [IDE Plugin] スキーマ導出のデフォルトを false に変更
- [IDE Plugin] commonMain ソースセットを適切に取得するように修正
- [MySQL Dialect] mySqlFunctionType() に minute を追加 (by @maaxgr)

## [1.4.1] - 2020-08-21 {id="1-4-1-2020-08-21"}
[1.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.1

### 追加 (Added)
- [Runtime] Kotlin 1.4.0 をサポート (#1859)

### 変更 (Changed)
- [Gradle Plugin] AGPの依存関係を compileOnly に変更 (#1362)

### 修正 (Fixed)
- [Compiler] 列定義ルールおよびテーブルインターフェースジェネレーターにオプションのJavadocを追加 (#1224 by @endanke)
- [SQLite Dialect] SQLite FTS5の補助関数 highlight、snippet、bm25 のサポートを追加 (by @drampelt)
- [MySQL Dialect] MySQLの bit データ型をサポート
- [MySQL Dialect] MySQLのバイナリリテラルをサポート
- [PostgreSQL Dialect] sql-psi から SERIAL を公開 (by @veyndan)
- [PostgreSQL Dialect] BOOLEAN データ型を追加 (by @veyndan)
- [PostgreSQL Dialect] NULL 列制約を追加 (by @veyndan)
- [HSQL Dialect] HSQLに `AUTO_INCREMENT` のサポートを追加 (by @rharter)

## [1.4.0] - 2020-06-22 {id="1-4-0-2020-06-22"}
[1.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.0

### 追加 (Added)
- [MySQL Dialect] MySQLのサポート (by @JGulbronson & @veyndan)
- [PostgreSQL Dialect] 実験的なPostgreSQLのサポート (by @veyndan)
- [HSQL Dialect] 実験的なH2のサポート (by @MariusVolkhart)
- [SQLite Dialect] SQLite FTS5のサポート (by @benasher44 & @jpalawaga)
- [SQLite Dialect] alter table rename column のサポート (#1505 by @angusholder)
- [IDE] マイグレーションファイル（`.sqm`）のIDEサポート
- [IDE] 組み込みのSQLライブテンプレートを模倣したSQLDelightライブテンプレートを追加 (#1154 by @veyndan)
- [IDE] 新規SqlDelightファイル作成アクションを追加 (#42 by @romtsn)
- [Runtime] 結果を返すトランザクション用の transactionWithReturn API
- [Compiler] `.sq` ファイル内で複数のSQL文をグループ化する構文
- [Compiler] マイグレーションファイルからのスキーマ生成をサポート
- [Gradle Plugin] マイグレーションファイルを有効なSQLとして出力するタスクを追加

### 変更 (Changed)
- [Documentation] ドキュメントWebサイトの刷新 (by @saket)
- [Gradle Plugin] 未サポートのダイアレクトに関するエラーメッセージを改善 (by @veyndan)
- [IDE] ダイアレクトに基づいてファイルアイコンを動的に変更 (by @veyndan)
- [JDBC Driver] javax.sql.DataSource から JdbcDriver のコンストラクターを公開 (#1614)

### 修正 (Fixed)
- [Compiler] テーブルでのJavadocをサポートし、1つのファイルに複数のJavadocが存在する場合の問題を修正 (#1224)
- [Compiler] 合成列への値の挿入を可能に修正 (#1351)
- [Compiler] ディレクトリ名サニタイズの不整合を修正 (by @ZacSweers)
- [Compiler] 合成列が結合をまたいでもnull許容性を維持するように修正 (#1656)
- [Compiler] DELETE文のハイライト位置を delete キーワードに固定 (#1643)
- [Compiler] クオート処理を修正 (#1525 by @angusholder)
- [Compiler] between 演算子が適切に式を再帰処理するように修正 (#1279)
- [Compiler] インデックス作成時にテーブル/列が見つからない場合のエラー出力を改善 (#1372)
- [Compiler] 結合制約で外側クエリの射影（projection）を使用できるように修正 (#1346)
- [Native Driver] execute が transationPool を使用するように修正 (by @benasher44)
- [JDBC Driver] SQLiteの代わりにJDBCのトランザクションAPIを使用するように修正 (#1693)
- [IDE] virtualFile 参照が常に元のファイルになるよう修正 (#1782)
- [IDE] bugsnag へのエラー報告時に正しい throwable を使用するように修正 (#1262)
- [Paging Extension] DataSource のリークを修正 (#1628)
- [Gradle Plugin] スキーマ生成時に出力先DBファイルが既に存在する場合は削除するように修正 (#1645)
- [Gradle Plugin] マイグレーションに欠番がある場合は検証を失敗させるように修正
- [Gradle Plugin] 設定されたファイルインデックスを明示的に使用するように修正 (#1644)

## [1.3.0] - 2020-04-03 {id="1-3-0-2020-04-03"}
[1.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.3.0

* 新規: [Gradle] コンパイル対象のSQLダイアレクトを指定する dialect プロパティ。
* 新規: [Compiler] #1009 MySQLダイアレクトの実験的サポート。
* 新規: [Compiler] #1436 sqlite:3.24 ダイアレクトおよび upsert のサポート。
* 新規: [JDBC Driver] SQLite JVMドライバーからJDBCドライバーを分離。
* 修正: [Compiler] #1199 任意の長さのラムダをサポート。
* 修正: [Compiler] #1610 avg() の戻り値の型をnull許容に修正。
* 修正: [IntelliJ] #1594 Windows上で「宣言へ移動」および「使用箇所の検索」が機能しなくなっていたパス区切り文字の処理を修正。

## [1.2.2] - 2020-01-22 {id="1-2-2-2020-01-22"}
[1.2.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.2

* 新規: [Runtime] Windows（mingw）、tvOS、watchOS、macOS アーキテクチャのサポート。
* 修正: [Compiler] sum() の戻り値の型をnull許容に修正。
* 修正: [Paging] 競合状態を回避するため Transacter を QueryDataSourceFactory に渡すように修正。
* 修正: [IntelliJ Plugin] ファイルのパッケージ名を検索する際に依存関係内を検索しないように修正。
* 修正: [Gradle] #862 Gradle内のバリデータログをデバッグレベルに変更。
* 改善: [Gradle] GenerateSchemaTask をGradleワーカーを使用するように変換。
* 注記: sqldelight-runtime アーティファクトの名前を runtime に変更。

## [1.2.1] - 2019-12-11 {id="1-2-1-2019-12-11"}
[1.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.1

* 修正: [Gradle] Kotlin/Native 1.3.60 のサポート。
* 修正: [Gradle] #1287 同期時の警告を修正。
* 修正: [Compiler] #1469 クエリ用の SyntheticAccessor 作成を修正。
* 修正: [JVM Driver] メモリリークを修正。
* 注記: coroutine extension アーティファクトを使用する場合、buildscript に kotlinx bintray maven リポジトリを追加する必要があります。

## [1.2.0] - 2019-08-30 {id="1-2-0-2019-08-30"}
[1.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.0

* 新規: [Runtime] 安定版の Flow API。
* 修正: [Gradle] Kotlin/Native 1.3.50 のサポート。
* 修正: [Gradle] #1380 クリーンビルドが失敗することがある問題を修正。
* 修正: [Gradle] #1348 検証タスク実行時に「Could not retrieve functions」と出力される問題を修正。
* 修正: [Compile] #1405 クエリに結合されたFTSテーブルが含まれる場合にプロジェクトをビルドできない問題を修正。
* 修正: [Gradle] #1266 複数のデータベースモジュールが存在する場合に散発的にGradleビルドが失敗する問題を修正。

## [1.1.4] - 2019-07-11 {id="1-1-4-2019-07-11"}
[1.1.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.4

* 新規: [Runtime] 実験的なKotlin Flow API。
* 修正: [Gradle] Kotlin/Native 1.3.40 との互換性。
* 修正: [Gradle] #1243 Gradleの Configure on demand と組み合わせてSQLDelightを使用する場合の修正。
* 修正: [Gradle] #1385 インクリメンタルアノテーションプロセッシングと組み合わせてSQLDelightを使用する場合の修正。
* 修正: [Gradle] Gradleタスクのキャッシュを許可。
* 修正: [Gradle] #1274 Kotlin DSLでの sqldelight 拡張機能の使用を有効化。
* 修正: [Compiler] 各クエリに対して一意のIDを決定論的に生成するように修正。
* 修正: [Compiler] トランザクション完了時にのみリスニング中のクエリに通知するように修正。
* 修正: [JVM Driver] #1370 JdbcSqliteDriver の利用者にDB URLの指定を強制するように変更。

## [1.1.3] - 2019-04-14 {id="1-1-3-2019-04-14"}
[1.1.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.3

* Gradle Metadata 1.0 リリース。

## [1.1.2] - 2019-04-14 {id="1-1-2-2019-04-14"}
[1.1.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.2

* 新規: [Runtime] #1267 ロギングドライバーデコレーター。
* 修正: [Compiler] #1254 2^16文字を超える文字列リテラルを分割するように修正。
* 修正: [Gradle] #1260 マルチプラットフォームプロジェクトで生成ソースがiOSソースとして認識される問題を修正。
* 修正: [IDE] #1290 CopyAsSqliteAction.kt:43 における kotlin.KotlinNullPointerException を修正。
* 修正: [Gradle] #1268 最近のバージョンで linkDebugFrameworkIos* タスクの実行が失敗する問題を修正。

## [1.1.1] - 2019-03-01 {id="1-1-1-2019-03-01"}
[1.1.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.1

* 修正: [Gradle] Androidプロジェクトでのモジュール依存関係のコンパイルを修正。
* 修正: [Gradle] #1246 afterEvaluate で api 依存関係を設定するように修正。
* 修正: [Compiler] 配列型が正しく出力されるように修正。

## [1.1.0] - 2019-02-27 {id="1-1-0-2019-02-27"}
[1.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.0

* 新規: [Gradle] #502 スキーマモジュールの依存関係の指定を許可。
* 改善: [Compiler] #1111 テーブルエラーを他のエラーよりも前にソート。
* 修正: [Compiler] #1225 REAL リテラルに対して正しい型を返すように修正。
* 修正: [Compiler] #1218 docid がトリガーを経由して伝播するように修正。

## [1.0.3] - 2019-01-30 {id="1-0-3-2019-01-30"}
[1.0.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.3

* 改善: [Runtime] #1195 Nativeドライバー/ランタイムの Arm32 サポート。
* 改善: [Runtime] #1190 Query 型からマッパーを公開。

## [1.0.2] - 2019-01-26 {id="1-0-2-2019-01-26"}
[1.0.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.2

* 修正: [Gradle Plugin] Kotlin 1.3.20 に更新。
* 修正: [Runtime] トランザクションが例外をもみ消さない（swallow）ように修正。

## [1.0.1] - 2019-01-21 {id="1-0-1-2019-01-21"}
[1.0.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.1

* 改善: [Native Driver] DatabaseConfiguration へのディレクトリ名の受け渡しを許可。
* 改善: [Compiler] #1173 パッケージのないファイルでコンパイルを失敗させるように改善。
* 修正: [IDE] IDEエラーをSquareに正しく報告するように修正。
* 修正: [IDE] #1162 同じパッケージ内の型がエラーとして表示されるものの正常に機能する問題を修正。
* 修正: [IDE] #1166 テーブルのリネームが NPE で失敗する問題を修正。
* 修正: [Compiler] #1167 UNION と SELECT を含む複雑なSQL文をパースしようとしたときに例外がスローされる問題を修正。

## [1.0.0] - 2019-01-08 {id="1-0-0-2019-01-08"}
[1.0.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.0

* 新規: 生成コードを刷新し、Kotlinで出力されるようになりました。
* 新規: RxJava2 拡張アーティファクト。
* 新規: Android Paging 拡張アーティファクト。
* 新規: Kotlin Multiplatform のサポート。
* 新規: Android、iOS、JVM SQLite ドライバーアーティファクト。
* 新規: Transaction API。

## [0.7.0] - 2018-02-12 {id="0-7-0-2018-02-12"}
[0.7.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.7.0

 * 新規: 生成コードが Support SQLite ライブラリのみを使用するように更新されました。すべてのクエリは生の文字列ではなくステートメントオブジェクトを生成するようになりました。
 * 新規: IDEでのステートメント折りたたみ機能。
 * 新規: Boolean 型が自動的に処理されるようになりました。
 * 修正: コード生成から非推奨の marshal を削除。
 * 修正: SQL関数 'avg' の型マッピングが REAL になるよう修正。
 * 修正: SQL関数 'julianday' を正しく検出するように修正。

## [0.6.1] - 2017-03-22 {id="0-6-1-2017-03-22"}
[0.6.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.6.1

 * 新規: 引数のない DELETE、UPDATE、INSERT 文に対してコンパイル済みステートメントを生成するように対応。
 * 修正: サブクエリで使用されるビュー内の USING 句でエラーが発生しないよう修正。
 * 修正: 生成された Mapper 上の重複した型を削除。
 * 修正: 引数に対してチェックを行う式でサブクエリを使用できるように修正。

## [0.6.0] - 2017-03-06 {id="0-6-0-2017-03-06"}
[0.6.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.6.0

 * 新規: SELECTクエリが文字列定数ではなく `SqlDelightStatement` ファクトリとして公開されるようになりました。
 * 新規: クエリのJavaDocがステートメントおよびマッパーファクトリにコピーされるようになりました。
 * 新規: ビュー名用の文字列定数を出力。
 * 修正: ファクトリを必要とするビューへのクエリにおいて、それらのファクトリを引数として正しく要求するように修正。
 * 修正: INSERTへの引数の数が指定された列数と一致していることを検証。
 * 修正: WHERE句で使用される blob リテラルを適切にエンコードするように修正。
 * このリリースには Gradle 3.3 以降が必要です。

## [0.5.1] - 2016-10-24 {id="0-5-1-2016-10-24"}
[0.5.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.5.1

 * 新規: コンパイル済みステートメントが抽象型を継承するように変更。
 * 修正: パラメーター内のプリミティブ型がnull許容の場合、ボクシングされるように修正。
 * 修正: バインド引数に必要なすべてのファクトリがファクトリメソッド内に存在するように修正。
 * 修正: エスケープされた列名が正しくマーシャリングされるように修正。

## [0.5.0] - 2016-10-19 {id="0-5-0-2016-10-19"}
[0.5.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.5.0

 * 新規: SQLite引数を Factory 経由で型安全に渡すことができるようになりました。
 * 新規: IntelliJプラグインが `.sq` ファイルのフォーマットを実行するように対応。
 * 新規: SQLite timestamp リテラルのサポート。
 * 修正: IntelliJ内でパラメーター化された型をクリックしてジャンプできるように修正。
 * 修正: エスケープされた列名を Cursor から取得しても RuntimeException がスローされないよう修正。
 * 修正: 例外を出力しようとしてGradleプラグインがクラッシュしないように修正。

## [0.4.4] - 2016-07-20 {id="0-4-4-2016-07-20"}
[0.4.4]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.4

 * 新規: 列のJava型としての short をネイティブサポート。
 * 新規: 生成されたマッパーおよびファクトリメソッドにJavadocを追加。
 * 修正: group_concat および nullif 関数が適切なnull許容性を持つように修正。
 * 修正: Android Studio 2.2-alpha との互換性。
 * 修正: WITH RECURSIVE によってプラグインがクラッシュしないように修正。

## [0.4.3] - 2016-07-07 {id="0-4-3-2016-07-07"}
[0.4.3]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.3

 * 新規: コンパイルエラーからソースファイルへリンクするように対応。
 * 新規: 右クリックでSQLDelightコードを有効なSQLiteとしてコピーできる機能。
 * 新規: 名前付きステートメント上のJavadocが生成されるString上にも反映されるように対応。
 * 修正: 生成されたビューモデルにnull許容性アノテーションを含めるように修正。
 * 修正: UNIONから生成されたコードが、考えられるすべての列をサポートするために適切な型とnull許容性を持つように修正。
 * 修正: 生成コード内で sum および round SQLite関数が適切な型を持つように修正。
 * 修正: CAST および内部SELECT文に関するバグ修正。
 * 修正: CREATE TABLE 文内でのオートコンプリート。
 * 修正: パッケージ内でSQLiteキーワードを使用可能に修正。

## [0.4.2] - 2016-06-16 {id="0-4-2-2016-06-16"}
[0.4.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.2

 * 新規: ファクトリから Marshal を作成できるように対応。
 * 修正: IntelliJプラグインが適切なジェネリクスの順序でファクトリメソッドを生成するように修正。
 * 修正: 関数名の大文字・小文字を区別せず使用可能に修正。

## [0.4.1] - 2016-06-14 {id="0-4-1-2016-06-14"}
[0.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.1

 * 修正: IntelliJプラグインが適切なジェネリクスの順序でクラスを生成するように修正。
 * 修正: 列定義の大文字・小文字を区別せず使用可能に修正。

## [0.4.0] - 2016-06-14 {id="0-4-0-2016-06-14"}
[0.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.0

 * 新規: マッパーがテーブル単位ではなくクエリ単位で生成されるように変更。
 * 新規: `.sq` ファイル内でJava型をインポートできるように対応。
 * 新規: SQLite関数が検証されるようになりました。
 * 修正: 重複するエラーメッセージを削除。
 * 修正: 大文字の列名やJavaキーワードと同じ列名でエラーが発生しないように修正。

## [0.3.2] - 2016-05-14 {id="0-3-2-2016-05-14"}
[0.3.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.2

 * 新規: オートコンプリートおよび使用箇所の検索がビューおよびエイリアスでも機能するようになりました。
 * 修正: コンパイル時の検証で、SELECT内で関数を使用できるように修正。
 * 修正: デフォルト値のみを宣言する INSERT 文をサポート。
 * 修正: SQLDelightを使用していないプロジェクトをインポートした際にプラグインがクラッシュしないように修正。

## [0.3.1] - 2016-04-27 {id="0-3-1-2016-04-27"}
[0.3.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.1

  * 修正: メソッド参照からの Illegal Access 実行時例外を回避するため、インターフェースの可視性を public に戻しました。
  * 修正: 部分式（subexpression）が適切に評価されるように修正。

## [0.3.0] - 2016-04-26 {id="0-3-0-2016-04-26"}
[0.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.0

  * 新規: 列定義でSQLiteの型を使用し、Javaの型を指定するための追加の 'AS' 制約を持てるように対応。
  * 新規: IDEからバグレポートを送信できるように対応。
  * 修正: オートコンプリートが適切に機能するように修正。
  * 修正: `.sq` ファイルの編集時にSQLDelightモデルファイルが更新されるように修正。
  * 削除: アタッチされたデータベース（Attached databases）のサポートを終了。

## [0.2.2] - 2016-03-07 {id="0-2-2-2016-03-07"}
[0.2.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.2

 * 新規: INSERT、UPDATE、DELETE、INDEX、TRIGGER 文で使用される列のコンパイル時検証。
 * 修正: ファイルの移動/作成時にIDEプラグインがクラッシュしないように修正。

## [0.2.1] - 2016-03-07 {id="0-2-1-2016-03-07"}
[0.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.1

 * 新規: Ctrl+`/`（macOSでは Cmd+`/`）で選択した行のコメントを切り替えられるように対応。
 * 新規: SQLクエリで使用される列のコンパイル時検証。
 * 修正: IDEとGradleプラグインの両方でWindowsパスをサポート。

## [0.2.0] - 2016-02-29 {id="0-2-0-2016-02-29"}
[0.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.0

 * 新規: Marshal クラスにコピーコンストラクターを追加。
 * 新規: Kotlin 1.0 正式版にアップデート。
 * 修正: 'sqldelight' フォルダ構造の問題を、ビルドを失敗させない形で報告するように修正。
 * 修正: `table_name` という名前の列を禁止。生成される定数がテーブル名定数と競合するため。
 * 修正: `.sq` ファイルが開かれているかどうかにかかわらず、IDEプラグインが直ちにモデルクラスを生成するように修正。
 * 修正: IDEとGradleプラグインの両方でWindowsパスをサポート。

## [0.1.2] - 2016-02-13 {id="0-1-2-2016-02-13"}
[0.1.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.2

 * 修正: 大半のプロジェクトでGradleプラグインの使用を妨げていたコードを削除。
 * 修正: Antlr ランタイムに対する不足していたコンパイラ依存関係を追加。

## [0.1.1] - 2016-02-12 {id="0-1-1-2016-02-12"}
[0.1.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.1

 * 修正: Gradleプラグインが自身と同じバージョンのランタイムを確実に参照するように修正。

## [0.1.0] - 2016-02-12 {id="0-1-0-2016-02-12"}
[0.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.0

最初のリリース。