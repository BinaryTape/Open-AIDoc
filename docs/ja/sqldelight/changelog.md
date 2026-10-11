# 変更履歴

## 未リリース {id="unreleased"}

### 追加 {id="added"}

- 現時点ではなし

### 変更 {id="changed"}

- 現時点ではなし

### 修正 {id="fixed"}

- 現時点ではなし

## [2.4.1] - 2026-10-06 {id="2-4-1-2026-10-06"}
[2.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.1

### 追加

- [ドキュメント] Android SQLiteトランザクションに関するドキュメントを追加 (#6381 by @griffio)

### 変更

- [Gradleプラグイン] パース済みの `.sq` ファイルをコード生成タスク全体でメモリ内に保持し、ガベージコレクション後に再パースされないようにしました。これにより、大規模プロジェクトにおけるコード生成が高速化される可能性があります (#6374 by @C2H6O)
- [IntelliJプラグイン] クラッシュレポートの送信先をカスタムBugsnagインスタンスからJetBrains Marketplaceに変更しました (#6376 by @JakeWharton)

### 修正

- [IntelliJプラグイン] IntelliJ APIの使用方法を変更し、プラグイン公開規約違反を修正 (#6366 #6368 by @griffio)

## [2.4.0] - 2026-09-17 {id="2-4-0-2026-09-17"}
[2.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0

### 追加
- [Nativeドライバー] `inMemoryDriver` に `extendedConfig` パラメーターを追加 (#5539 by @GuilhE)
- [PostgreSQLダイアレクト] 暗黙的に定義されたシステム列に対するクエリサポートを追加 (#5834 by @griffio)
- [PostgreSQLダイアレクト] 基本的な配列リテラルのサポートを追加 (#5997 by @griffio)
- [PostgreSQLダイアレクト] 基本的なLTREEのサポートを追加 (#5880 by @yesitskev @griffio)
- [MySQLダイアレクト] INET関数のサポートを追加 (#5072 by @mcxinyu)
- [PostgreSQLダイアレクト] ALTER INDEXのサポートを追加 (#6224 by @griffio)
- [SQLiteダイアレクト] SQLite 3.44の集約関数 DISTINCT、ORDER BY、FILTER のサポートを追加 (#6236 by @griffio)
- [SQLiteダイアレクト] SQLite 3.37の STRICT テーブルのサポートを追加 (#6230 by @griffio)
- [Gradleプラグイン] `codegenExcludedColumns` による生成モデルからの列除外サポートを追加 (#6243 by @sokolikp)
- [コンパイラー] スキーマに `allTableNames` 関数を追加 (#6245 by @edenman)
- [PostgreSQLダイアレクト] ANY演算子のサポートを追加 (#6253 by @griffio)
- [SQLiteダイアレクト] SQLite 3.39の RIGHT JOIN および FULL JOIN のサポートを追加 (#6273 by @griffio)
- [PostgreSQLダイアレクト] トリガー関数における `RAISE` 文および `FOUND` 変数のサポートを追加 (#6297 by @griffio)

### 変更
- [PostgreSQLダイアレクト] arrayIntermediateType の可視性を public に変更 (#5835 by @griffio)
- [Gradleプラグイン] より厳格な MigrationFile バージョニングを実装 (#5730 by @madisp)
- [Gradleプラグイン] 最小サポートGradleバージョンを 8.2.1 に引き上げ (#6217 by @maxsav)
- [Gradleプラグイン] GradleのIsolated Projectsをサポート (#6217 by @maxsav)
- [IntelliJプラグイン] 最小サポートバージョンを 2023.3 / Android Studio Jellyfish に変更

### 修正
- [Gradleプラグイン] JDK 24以降でコンパイラーワーカーから出力される `sun.misc.Unsafe` の非推奨警告を抑制 (#6321)
- [コンパイラー] 生成コードにおけるKotlinの余分な警告を抑制 (#6208 by @eyupcanakman)
- [コンパイラー] グループ化されていない集約結果セット内の他の列が常にnullableになるように修正
- [PostgreSQLダイアレクト] coalesce および ifnull のnull許容性（nullability）が正しく解決されるように修正
- [PostgreSQLダイアレクト] PostgreSQLダイアレクトのIDE連携を修正
- [PostgreSQLダイアレクト] PostgreSQLダイアレクト向けのIDEプラグインを改善 (#6209 by @griffio)
- [Intellijプラグイン] すべてのダイアレクトでIDEプラグインがコード補完を実行できるように修正 (#6210 by @griffio)
- [Gradleプラグイン] verify databaseタスク実行時の循環依存エラーを修正 (#6221 by @griffio)
- [コンパイラー] 複数行更新（multirow update）時のオプティミスティックロックを修正 (#6240 by @griffio)
- [Intellijプラグイン] IDEA 2026.2でクラッシュを引き起こす非推奨APIの利用を修正 (#6247 by @griffio)
- [Gradleプラグイン] AGP 8.9から8.11において、生成されたソースがKotlinコンパイルで認識されない問題を修正
- [PostgreSQLダイアレクト] プリミティブなバインド引数を使用する lower および upper 関数のデフォルトがTEXTになるように修正 (#6262 by @griffio)
- [コンパイラー] アダプターを使用したデータクラスのバインディングおよびnull許容性を変更するマイグレーションを伴う値の挿入（insert values）を修正 (#6269 by griffio)
- [コンパイラー] null安全な演算子（IS および IS DISTINCT FROM）でnullableなバインド引数を使用するように修正 (#6265 by @griffio)
- [Gradleプラグイン] プロジェクト依存関係にAGPのバリアント解決を使用するように変更 (#6217 by @maxsav)
- [Gradleプラグイン] ビルド間でAGPバリアントのリストが異なる場合に発生する generateDatabaseInterface のビルドキャッシュミスを修正
- [Gradleプラグイン] データベースを設定せずにプラグインを適用した際のIDE同期クラッシュを修正 (#6088)
- [PostgreSQLダイアレクト] ネストされた関数呼び出しを使用する際のJSON集約関数を修正 (#6281 by @griffio)
- [Paging3拡張] 空のデータベースで KeyedQueryPagingSource がクラッシュする問題を修正 (#6284 by @woods-marshes)
- [コンパイラー] `COALESCE` などのカプセル化関数とともにミューテーター文が使用された場合のJavaタイプアダプターの問題を修正 (#6292 by @griffio)
- [コンパイラー] モジュール名が大文字で始まっている場合、生成コードのパッケージ名も大文字になっていた問題を修正 (#6316 by @griffio)
- [PostgreSQLダイアレクト] 日付データ型の大文字・小文字を区別しないように修正 (#6328 by @griffio)
- [PostgreSQLダイアレクト] `string_agg` 関数がnullableになるように修正 (#6340 by @griffio)
- [SQLiteダイアレクト] `GROUP BY` を使用するSQLite 3.44の集約関数を修正 (#6343 by @griffio)
- [Gradleプラグイン] コンフィグレーション時（configuration time）におけるデータベース依存関係の解決を回避 (#6353 by @joshfriend)

## [2.4.0-rc2] - 2026-09-14 {id="2-4-0-rc2-2026-09-14"}
[2.4.0-rc2]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0-rc2

### 修正

- [PostgreSQLダイアレクト] `string_agg` 関数がnullableになるように修正 (#6340 by @griffio)
- [SQLiteダイアレクト] `GROUP BY` を使用するSQLite 3.44の集約関数を修正 (#6343 by @griffio)
- [Gradleプラグイン] コンフィグレーション時（configuration time）におけるデータベース依存関係の解決を回避 (#6353 by @joshfriend)

## [2.4.0-rc1] - 2026-09-01 {id="2-4-0-rc1-2026-09-01"}
[2.4.0-rc1]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0-rc1

### 追加
- [Nativeドライバー] `inMemoryDriver` に `extendedConfig` パラメーターを追加 (#5539 by @GuilhE)
- [PostgreSQLダイアレクト] 暗黙的に定義されたシステム列に対するクエリサポートを追加 (#5834 by @griffio)
- [PostgreSQLダイアレクト] 基本的な配列リテラルのサポートを追加 (#5997 by @griffio)
- [PostgreSQLダイアレクト] 基本的なLTREEのサポートを追加 (#5880 by @yesitskev @griffio)
- [MySQLダイアレクト] INET関数のサポートを追加 (#5072 by @mcxinyu)
- [PostgreSQLダイアレクト] ALTER INDEXのサポートを追加 (#6224 by @griffio)
- [SQLiteダイアレクト] SQLite 3.44の集約関数 DISTINCT、ORDER BY、FILTER のサポートを追加 (#6236 by @griffio)
- [SQLiteダイアレクト] SQLite 3.37の STRICT テーブルのサポートを追加 (#6230 by @griffio)
- [Gradleプラグイン] `codegenExcludedColumns` による生成モデルからの列除外サポートを追加 (#6243 by @sokolikp)
- [コンパイラー] スキーマに `allTableNames` 関数を追加 (#6245 by @edenman)
- [PostgreSQLダイアレクト] ANY演算子のサポートを追加 (#6253 by @griffio)
- [SQLiteダイアレクト] SQLite 3.39の RIGHT JOIN および FULL JOIN のサポートを追加 (#6273 by @griffio)
- [PostgreSQLダイアレクト] トリガー関数における `RAISE` 文および `FOUND` 変数のサポートを追加 (#6297 by @griffio)

### 変更
- [PostgreSQLダイアレクト] arrayIntermediateType の可視性を public に変更 (#5835 by @griffio)
- [Gradleプラグイン] より厳格な MigrationFile バージョニングを実装 (#5730 by @madisp)
- [Gradleプラグイン] 最小サポートGradleバージョンを 8.2.1 に引き上げ (#6217 by @maxsav)
- [Gradleプラグイン] GradleのIsolated Projectsをサポート (#6217 by @maxsav)
- [IntelliJプラグイン] 最小サポートバージョンを 2023.3 / Android Studio Jellyfish に変更

### 修正
- [Gradleプラグイン] JDK 24以降でコンパイラーワーカーから出力される `sun.misc.Unsafe` の非推奨警告を抑制 (#6321)
- [コンパイラー] 生成コードにおけるKotlinの余分な警告を抑制 (#6208 by @eyupcanakman)
- [コンパイラー] グループ化されていない集約結果セット内の他の列が常にnullableになるように修正
- [PostgreSQLダイアレクト] coalesce および ifnull のnull許容性（nullability）が正しく解決されるように修正
- [PostgreSQLダイアレクト] PostgreSQLダイアレクトのIDE連携を修正
- [PostgreSQLダイアレクト] PostgreSQLダイアレクト向けのIDEプラグインを改善 (#6209 by @griffio)
- [Intellijプラグイン] すべてのダイアレクトでIDEプラグインがコード補完を実行できるように修正 (#6210 by @griffio)
- [Gradleプラグイン] verify databaseタスク実行時の循環依存エラーを修正 (#6221 by @griffio)
- [コンパイラー] 複数行更新（multirow update）時のオプティミスティックロックを修正 (#6240 by @griffio)
- [Intellijプラグイン] IDEA 2026.2でクラッシュを引き起こす非推奨APIの利用を修正 (#6247 by @griffio)
- [Gradleプラグイン] AGP 8.9から8.11において、生成されたソースがKotlinコンパイルで認識されない問題を修正
- [PostgreSQLダイアレクト] プリミティブなバインド引数を使用する lower および upper 関数のデフォルトがTEXTになるように修正 (#6262 by @griffio)
- [コンパイラー] アダプターを使用したデータクラスのバインディングおよびnull許容性を変更するマイグレーションを伴う値の挿入（insert values）を修正 (#6269 by griffio)
- [コンパイラー] null安全な演算子（IS および IS DISTINCT FROM）でnullableなバインド引数を使用するように修正 (#6265 by @griffio)
- [Gradleプラグイン] プロジェクト依存関係にAGPのバリアント解決を使用するように変更 (#6217 by @maxsav)
- [Gradleプラグイン] ビルド間でAGPバリアントのリストが異なる場合に発生する generateDatabaseInterface のビルドキャッシュミスを修正
- [Gradleプラグイン] データベースを設定せずにプラグインを適用した際のIDE同期クラッシュを修正 (#6088)
- [PostgreSQLダイアレクト] ネストされた関数呼び出しを使用する際のJSON集約関数を修正 (#6281 by @griffio)
- [Paging3拡張] 空のデータベースで KeyedQueryPagingSource がクラッシュする問題を修正 (#6284 by @woods-marshes)
- [コンパイラー] `COALESCE` などのカプセル化関数とともにミューテーター文が使用された場合のJavaタイプアダプターの問題を修正 (#6292 by @griffio)
- [コンパイラー] モジュール名が大文字で始まっている場合、生成コードのパッケージ名も大文字になっていた問題を修正 (#6316 by @griffio)
- [PostgreSQLダイアレクト] 日付データ型の大文字・小文字を区別しないように修正 (#6328 by @griffio)

## [2.3.2] - 2026-03-16 {id="2-3-2-2026-03-16"}
[2.3.2]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.2

### 追加
- [PostgreSQLダイアレクト] ALTER TABLE ALTER TYPE USING 式のサポートを改善 (#6116 by @griffio)
- [PostgreSQLダイアレクト] DROP COLUMN IF EXISTS のサポートを追加 (#6112 by @griffio)
- [Gradleプラグイン] Selectのワイルドカード展開を無効化する expandSelectStar フラグを追加 (#5813 by @griffio)
- [MySQLダイアレクト] ウィンドウ関数（Window Functions）のサポートを追加 (#6086 by @griffio)
- [Gradleプラグイン] 開始スキーマバージョンが1以外かつ verifyMigrations が true の場合のビルド失敗を修正 (#6017 by @neilgmiller)
- [Gradleプラグイン] `SqlDelightWorkerTask` の設定自由度を高め、Windows上での開発をサポートするようにデフォルト設定を更新 (#5215 by @MSDarwish2000)
- [SQLiteダイアレクト] FTS5仮想テーブルにおける合成列（synthesized columns）のサポートを追加 (#5986 by @watbe)
- [PostgreSQLダイアレクト] PostgreSQLの行レベルセキュリティ（RLS）のサポートを追加 (#6087 by @shellderp)
- [PostgreSQLダイアレクト] FOR UPDATE を拡張し、OF table、NO KEY UPDATE、NO WAIT をサポート (#6104 by @shellderp)
- [PostgreSQLダイアレクト] PostGISの Point 型および関連関数をサポート (#5602 by @vanniktech)
- [ランタイム] トランザクションの `CoroutineContext` を制御する仕組みを提供する `SuspendingTransacter.TransactionDispatcher` を追加 (#5967 by @eygraber)
- [Gradleプラグイン] Android Gradle Plugin 9.0の新しいDSLに完全対応 (#6140)
- [PostgreSQLダイアレクト] PostgreSQLの CREATE TABLE ストレージパラメーターをサポート (#6148 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLのテーブルユニーク制約におけるnullableな結果列を修正 (#6167 by @griffio)

### 変更
- [コンパイラー] コンパイラーの出力型を java.lang.Void から kotlin.Nothing に変更 (#6099 by @griffio)
- [コンパイラー] パッケージ名にアンダースコアを使用できるように変更。以前はアンダースコアがサニタイズされ、予期しない動作の原因となっていました (#6027 by @BierDav)
- [Paging拡張] AndroidX Pagingに移行 (#5910 by @jeffdgr8)
- [Androidドライバー] Androidの minSdk を 23 に引き上げ (#6141)
- [Paging拡張] Paging 3.4.1にアップグレードし、X64 Appleターゲットを削除 (#6166)

### 修正
- [IntelliJプラグイン] VFSリフレッシュイベント中にEDT（イベントディスパッチスレッド）でファイルタイプ検出をブロックすることによるIDEのフリーズを修正
- [SQLiteダイアレクト] JSONパス演算子使用時におけるSQLite 3.38のコンパイルエラーを修正 (#6070 by @griffio)
- [SQLiteダイアレクト] カスタム列型使用時における group_concat 関数にString型を使用するように修正 (#6082 by @griffio)
- [Gradleプラグイン] 複雑なスキーマで処理がハングアップしないよう、`VerifyMigrationTask` のパフォーマンスを改善 (#6073 by @Lightwood13)
- [Intellijプラグイン] プラグイン初期化時の例外を修正し、非推奨メソッドを更新 (#6040 by @griffio)
- [Gradleプラグイン] Android Gradle Pluginの内蔵Kotlinとの互換性を修正 (#6139)

## [2.3.1] - 2025-03-12 {id="2-3-1-2025-03-12"}
[2.3.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.1

リリースの失敗。2.3.2を使用してください。

## [2.3.0] - 2025-03-12 {id="2-3-0-2025-03-12"}
[2.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.0

リリースの失敗。2.3.2を使用してください。

## [2.2.1] - 2025-11-13 {id="2-2-1-2025-11-13"}
[2.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.2.1

### 追加
- [PostgreSQLダイアレクト] PostgreSQLの numeric/integer/biginteger 型マッピングを修正 (#5994 by @griffio)
- [コンパイラー] CASTが必要な場合にソースファイルの位置を含めるよう、コンパイラーエラーメッセージを改善 (#5979 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLのJSON演算子によるパス抽出のサポートを追加 (#5971 by @griffio)
- [SQLiteダイアレクト] 共通テーブル式（CTE）を使用した MATERIALIZED クエリプランナーヒントのSQLite 3.35サポートを追加 (#5961 by @griffio)
- [PostgreSQLダイアレクト] 共通テーブル式（CTE）を使用した MATERIALIZED クエリプランナーヒントのサポートを追加 (#5961 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLのJSON集約 FILTER のサポートを追加 (#5957 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLの Enum のサポートを追加 (#5935 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLのトリガーの限定的なサポートを追加 (#5932 by @griffio)
- [PostgreSQLダイアレクト] SQL式がJSONとしてパース可能かチェックする述語を追加 (#5843 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLの Comment On 文の限定的なサポートを追加 (#5808 by @griffio)
- [MySQLダイアレクト] インデックス可視性オプションのサポートを追加 (#5785 by @orenkislev-faire)
- [PostgreSQLダイアレクト] TSQUERY データ型のサポートを追加 (#5779 by @griffio)
- [Gradleプラグイン] モジュール追加時におけるバージョンカタログのサポートを追加 (#5755 by @DRSchlaubi)

### 変更
- 開発中のスナップショットは、https://central.sonatype.com/repository/maven-snapshots/ のCentral Portal Snapshotsリポジトリに公開されるようになりました。
- [コンパイラー] コンストラクター参照を使用して、デフォルトで生成されるクエリを簡素化 (#5814 by @jonapoul)

### 修正
- [コンパイラー] 共通テーブル式（CTE）を含むView使用時のスタックオーバーフローを修正 (#5928 by @griffio)
- [Gradleプラグイン] 「New Connection」を追加するためにSqlDelightツールウィンドウを開いた際のクラッシュを修正 (#5906 by @griffio)
- [IntelliJプラグイン] copy-to-sqlite ガターアクションにおけるスレッド関連のクラッシュを回避 (#5901 by @griffio)
- [IntelliJプラグイン] スキーマ文 CREATE INDEX および CREATE VIEW 使用時におけるPostgreSQLダイアレクトの修正 (#5772 by @griffio)
- [コンパイラー] 列参照時におけるFTSのスタックオーバーフローを修正 (#5896 by @griffio)
- [コンパイラー] With Recursive のスタックオーバーフローを修正 (#5892 by @griffio)
- [コンパイラー] Insert|Update|Delete Returning 文のNotify処理を修正 (#5851 by @griffio)
- [コンパイラー] Longを返すトランザクションブロックの非同期結果型を修正 (#5836 by @griffio)
- [コンパイラー] SQLパラメーターのバインディングの計算量を O(n²) から O(n) に最適化 (#5898 by @chenf7)
- [SQLiteダイアレクト] SQLite 3.18で欠落していた関数を修正 (#5759 by @griffio)

## [2.2.0] - 2025-11-13 {id="2-2-0-2025-11-13"}
[2.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.2.0

アーティファクトの一部公開失敗によるリリース障害。2.2.1を使用してください。

## [2.1.0] - 2025-05-16 {id="2-1-0-2025-05-16"}
[2.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.1.0

### 追加
- [WASMドライバー] Webワーカー用ドライバーに wasmJs サポートを追加 (#5534 by @IlyaGulya)
- [PostgreSQLダイアレクト] PostgreSQLの配列を行に展開する UnNest のサポート (#5673 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLの TSRANGE/TSTZRANGE をサポート (#5297 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLの Right Full Join をサポート (#5086 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLの時間型からの抽出（extract）をサポート (#5273 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLの配列包含演算子をサポート (#4933 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLの drop constraint をサポート (#5288 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLの型キャストをサポート (#5089 by @griffio)
- [PostgreSQLダイアレクト] サブクエリに対するPostgreSQLの lateral join 演算子をサポート (#5122 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLの ILIKE 演算子をサポート (#5330 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLの XML 型をサポート (#5331 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLの AT TIME ZONE をサポート (#5243 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLの order by nulls をサポート (#5199 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLの現在日時関数のサポートを追加 (#5226 by @drewd)
- [PostgreSQLダイアレクト] PostgreSQLの正規表現演算子をサポート (#5137 by @griffio)
- [PostgreSQLダイアレクト] BRINおよびGiSTインデックスを追加 (#5059 by @griffio)
- [MySQLダイアレクト] MySQLダイアレクトの RENAME INDEX をサポート (#5212 by @orenkislev-faire)
- [JSON拡張] json table 関数にエイリアスを追加 (#5372 by @griffio)

### 変更
- [コンパイラー] 単純なミューテーターに対して生成されたクエリファイルが行数を返すように変更 (#4578 by @MariusVolkhart)
- [Nativeドライバー] DELETE、INSERT、UPDATE 文の readonly フラグを変更するため NativeSqlDatabase.kt を更新 (#5680 by @griffio)
- [PostgreSQLダイアレクト] PgInterval を String に変更 (#5403 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQL拡張を実装するためのSqlDelightモジュールをサポート (#5677 by @griffio)

### 修正
- [コンパイラー] 戻り値を持つグループ化された文を実行する際にクエリリスナーへ通知するよう修正 (#5006 by @vitorhugods)
- [コンパイラー] SqlDelightModule の型リゾルバーを修正 (#5625 by @griffio)
- [コンパイラー] エスケープされた列を持つオブジェクトの挿入（issue 5501）を修正 (#5503 by @griffio)
- [コンパイラー] 正しい行および文字位置でパスリンクがクリック可能になるようにエラーメッセージを改善 (#5604 by @vanniktech)
- [コンパイラー] issue 5298の修正: キーワードをテーブル名として使用できるように対応
- [コンパイラー] 名前付きexecuteを修正し、テストを追加
- [コンパイラー] 初期化文のソート時に外部キートランス制約を考慮するように修正 (#5325 by @TheMrMilchmann)
- [コンパイラー] タブが含まれている場合でもエラーの下線が適切に揃うように修正 (#5224 by @drewd)
- [JDBCドライバー] トランザクション終了時における connectionManager のメモリリークを修正
- [JDBCドライバー] ドキュメントの記載通り、SQLiteのマイグレーションをトランザクション内で実行するように修正 (#5218 by @morki)
- [JDBCドライバー] トランザクションのコミット/ロールバック後の接続リークを修正 (#5205 by @morki)
- [Gradleプラグイン] `GenerateSchemaTask` の前に `DriverInitializer` を実行するように修正 (#5562 by @nwagu)
- [ランタイム] 実際のドライバーが非同期（Async）である場合の LogSqliteDriver のクラッシュを修正 (#5723 by @edenman)
- [ランタイム] StringBuilder のキャパシティを修正 (#5192 by @janbina)
- [PostgreSQLダイアレクト] PostgreSQLの create or replace view を修正 (#5407 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLの to_json を修正 (#5606 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLの数値リゾルバーを修正 (#5399 by @griffio)
- [PostgreSQLダイアレクト] SQLiteのウィンドウ関数を修正 (#2799 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLの SELECT DISTINCT ON を修正 (#5345 by @griffio)
- [PostgreSQLダイアレクト] alter table add column if not exists を修正 (#5309 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLの非同期バインドパラメーターを修正 (#5313 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLのブールリテラルを修正 (#5262 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLのウィンドウ関数を修正 (#5155 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLの isNull / isNotNull 型を修正 (#5173 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLの select distinct を修正 (#5172 by @griffio)
- [Paging拡張] Paging更新時の初回読み込みの問題を修正 (#5615 by @evant)
- [Paging拡張] macOSのネイティブターゲットを追加 (#5324 by @vitorhugods)
- [IntelliJプラグイン] K2モードをサポート

## [2.0.2] - 2024-04-05 {id="2-0-2-2024-04-05"}
[2.0.2]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.2

### 追加
- [PostgreSQLダイアレクト] PostgreSQLの STRING_AGG 関数を追加 (#4950 by @anddani)
- [PostgreSQLダイアレクト] PostgreSQLダイアレクトに SET 文を追加 (#4927 by @de-luca)
- [PostgreSQLダイアレクト] PostgreSQLの alter column シーケンスパラメーターを追加 (#4916 by @griffio)
- [PostgreSQLダイアレクト] insert文におけるPostgreSQLの alter column default のサポートを追加 (#4912 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLの alter sequence および drop sequence を追加 (#4920 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLの正規表現関数の定義を追加 (#5025 by @MariusVolkhart)
- [PostgreSQLダイアレクト] GINの文法を追加 (#5027 by @griffio)

### 変更
- [IDEプラグイン] 最小サポートバージョンを 2023.1 / Android Studio Iguana に変更
- [コンパイラー] encapsulatingType における型のnull許容性オーバーライドを許可 (#4882 by @eygraber)
- [コンパイラー] SELECT * の列名をインライン化
- [Gradleプラグイン] processIsolation に切り替え (#5068 by @nwagu)
- [Androidランタイム] Androidの minSdk を 21 に引き上げ (#5094 by @hfhbd)
- [ドライバー] ダイアレクト開発者向けにJDBC/R2DBCステートメントのメソッドをより多く公開 (#5098 by @hfhbd)

### 修正
- [PostgreSQLダイアレクト] PostgreSQLの alter table alter column を修正 (#4868 by @griffio)
- [PostgreSQLダイアレクト] テーブルモデルに対するインポートの欠落を修正（issue 4448） (#4885 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLのデフォルト制約関数の修正（issue 4932） (#4934 by @griffio)
- [PostgreSQLダイアレクト] マイグレーション中の alter table rename column におけるPostgreSQLのクラスキャストエラーを修正（issue 4879） (#4880 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLの create extension を修正（issue 4474） (#4541 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLの非null型に対する Primary Key 追加を修正（issue 5018） (#5020 by @griffio)
- [PostgreSQLダイアレクト] 集約式の修正（issue 4703） (#5071 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLのJSONを修正（issue 5028） (#5030 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLのJSON演算子を修正（issue 5040） (#5041 by @griffio)
- [PostgreSQLダイアレクト] 5040に対するJSON演算子のバインディングを修正 (#5100 by @griffio)
- [PostgreSQLダイアレクト] tsvector を修正（issue 5082） (#5104 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQL UPDATE FROM 文の列隣接性を修正（issue 5032） (#5035 by @griffio)
- [SQLiteダイアレクト] SQLiteの alter table rename column を修正（issue 4897） (#4899 by @griffio)
- [IDEプラグイン] エラーハンドラーのクラッシュを修正 (#4988 by @aperfilyev)
- [IDEプラグイン] IDEA 2023.3でBugSnagの初期化に失敗する問題を修正 (by @aperfilyev)
- [IDEプラグイン] プラグイン経由でIntelliJで `.sq` ファイルを開いたときの PluginException を修正 (by @aperfilyev)
- [IDEプラグイン] 既にプラグインの依存関係に含まれているため、kotlin libをIntelliJプラグインにバンドルしないように変更 (#5126)
- [IDEプラグイン] stream の代わりに extensions 配列を使用するように修正 (#5127)

## [2.0.1] - 2023-12-01 {id="2-0-1-2023-12-01"}
[2.0.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.1

### 追加
- [コンパイラー] SELECT実行時における複数列式（multi-column-expr）のサポートを追加 (#4453 by @Adriel-M)
- [PostgreSQLダイアレクト] PostgreSQLの CREATE INDEX CONCURRENTLY のサポートを追加 (#4531 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLのCTE補助文同士が相互参照できるように対応 (#4493 by @griffio)
- [PostgreSQLダイアレクト] 二項演算式およびsumに対するPostgreSQL型のサポートを追加 (#4539 by @Adriel-M)
- [PostgreSQLダイアレクト] PostgreSQLの SELECT DISTINCT ON 構文のサポートを追加 (#4584 by @griffio)
- [PostgreSQLダイアレクト] SELECT文におけるPostgreSQLのJSON関数のサポートを追加 (#4590 by @MariusVolkhart)
- [PostgreSQLダイアレクト] PostgreSQLの generate_series 関数を追加 (#4717 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLの追加の文字列関数定義を追加 (#4752 by @MariusVolkhart)
- [PostgreSQLダイアレクト] minおよびmax集約関数にDATE PostgreSQL型を追加 (#4816 by @anddani)
- [PostgreSQLダイアレクト] SqlBinaryExpr にPostgreSQLの時間型を追加 (#4657 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLダイアレクトに TRUNCATE を追加 (#4817 by @de-luca)
- [SQLite 3.35ダイアレクト] 順に評価される複数の ON CONFLICT 節を許可 (#4551 by @griffio)
- [JDBCドライバー] より快適なSQL編集のための Language アノテーションを追加 (#4602 by @MariusVolkhart)
- [Nativeドライバー] linuxArm64 のサポートを追加 (#4792 by @hfhbd)
- [Androidドライバー] AndroidSqliteDriver に windowSizeBytes パラメーターを追加 (#4804 by @BoD)
- [Paging3拡張] OffsetQueryPagingSource 用に initialOffset を追加 (#4802 by @MohamadJaara)

### 変更
- [コンパイラー] 適切な箇所でKotlin型を優先するように変更 (#4517 by @eygraber)
- [コンパイラー] 値型を挿入する際は常に列名を含めるように変更 (#4864)
- [PostgreSQLダイアレクト] PostgreSQLダイアレクトの実験的（experimental）ステータスを解除 (#4443 by @hfhbd)
- [PostgreSQLダイアレクト] PostgreSQL型のドキュメントを更新 (#4569 by @MariusVolkhart)
- [R2DBCドライバー] PostgreSQLにおける整数データ型の処理パフォーマンスを最適化 (#4588 by @MariusVolkhart)

### 削除 {id="removed"}
- [SQLite JavaScriptドライバー] sqljs-driver を削除 (#4613, #4670 by @dellisd)

### 修正
- [コンパイラー] 戻り値がありパラメーターのないグループ化された文のコンパイルを修正 (#4699 by @griffio)
- [コンパイラー] SqlBinaryExpr での引数バインディングを修正 (#4604 by @griffio)
- [IDEプラグイン] 設定されている場合はIDEAプロジェクトのJDKを使用するように修正 (#4689 by @griffio)
- [IDEプラグイン] IDEA 2023.2以降における「Unknown element type: TYPE_NAME」エラーを修正 (#4727)
- [IDEプラグイン] 2023.2との互換性に関する一部の問題を修正
- [Gradleプラグイン] verifyMigrationTask Gradleタスクのドキュメントを修正 (#4713 by @joshfriend)
- [Gradleプラグイン] データベースを検証する前にデータベースを生成するよう促すタスク出力メッセージを追加 (#4684 by @jingwei99)
- [PostgreSQLダイアレクト] PostgreSQLの列を複数回リネームする処理を修正 (#4566 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLの alter column のnull許容性を修正（issue 4714） (#4831 by @griffio)
- [PostgreSQLダイアレクト] alter table alter column を修正（issue 4837） (#4846 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLのシーケンスを修正（issue 4501） (#4528 by @griffio)
- [SQLiteダイアレクト] 列式でJSON二項演算子を使用できるように修正 (#4776 by @eygraber)
- [SQLiteダイアレクト] 同名列が複数見つかった場合の Update From の誤検知を修正 (#4777 by @eygraber)
- [Nativeドライバー] 名前付きインメモリデータベースをサポート (#4662 by @05nelsonm)
- [Nativeドライバー] クエリリスナーコレクションのスレッドセーフ性を確保 (#4567 by @kpgalligan)
- [JDBCドライバー] ConnectionManager における接続リークを修正 (#4589 by @MariusVolkhart)
- [JDBCドライバー] ConnectionManager タイプ選択時における JdbcSqliteDriver のURLパースを修正 (#4656 by @05nelsonm)

## [2.0.0] - 2023-07-26 {id="2-0-0-2023-07-26"}
[2.0.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0

### 追加
- [MySQLダイアレクト] MySQL: IF式で timestamp/bigint をサポート (#4329 by @shellderp)
- [MySQLダイアレクト] MySQL: now を追加 (#4431 by @hfhbd)
- [Webドライバー] NPMパッケージの公開を有効化 (#4364)
- [IDEプラグイン] Gradle Tooling APIの接続に失敗した際にスタックトレースを表示できるように対応 (#4383)

### 変更
- [SQLiteドライバー] JdbcSqliteDriver のスキーママイグレーション利用を簡素化 (#3737 by @morki)
- [R2DBCドライバー] 真の非同期（Real async）R2DBCカーソルに対応 (#4387 by @hfhbd)

### 修正
- [IDEプラグイン] 必要になるまでデータベースプロジェクトサービスをインスタンス化しないように変更 (#4382)
- [IDEプラグイン] 使用箇所の検索（find usages）中のプロセスキャンセルを処理 (#4340)
- [IDEプラグイン] 非同期コードのIDE生成を修正 (#4406)
- [IDEプラグイン] パッケージ構造の組み立てを1回のみの計算にし、EDTから移動 (#4417)
- [IDEプラグイン] 2023.2におけるKotlin型解決に正しいスタブインデックスキーを使用するように修正 (#4416)
- [IDEプラグイン] 検索を実行する前にインデックスの準備が整うのを待つように修正 (#4419)
- [IDEプラグイン] インデックスが利用できない場合は「宣言へ移動（goto）」を実行しないように修正 (#4420)
- [コンパイラー] グループ化された文の結果式を修正 (#4378)
- [コンパイラー] 仮想テーブルをインターフェース型として使用しないように修正 (#4427 by @hfhbd)

## [2.0.0-rc02] - 2023-06-27 {id="2-0-0-rc02-2023-06-27"}
[2.0.0-rc02]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-rc02

### 追加
- [MySQLダイアレクト] 小文字の日付型、および日付型に対する min と max をサポート (#4243 by @shellderp)
- [MySQLダイアレクト] 二項演算式および sum に対するMySQL型をサポート (#4254 by @shellderp)
- [MySQLダイアレクト] 表示幅（display width）のない符号なし整数をサポート (#4306 by @shellderp)
- [MySQLダイアレクト] LOCK IN SHARED MODE をサポート
- [PostgreSQLダイアレクト] min max に boolean と Timestamp を追加 (#4245 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQL: ウィンドウ関数のサポートを追加 (#4283 by @hfhbd)
- [ランタイム] ランタイムに linuxArm64、androidNative、watchosDeviceArm ターゲットを追加 (#4258 by @hfhbd)
- [Paging拡張] Paging拡張に linux および mingw x64 ターゲットを追加 (#4280 by @chippman)

### 変更
- [Gradleプラグイン] Android API 34のダイアレクト自動サポートを追加 (#4251)
- [Paging拡張] QueryPagingSource で SuspendingTransacter をサポート (#4292 by @daio)
- [ランタイム] addListener APIを改善 (#4244 by @hfhbd)
- [ランタイム] マイグレーションバージョンにLongを使用するように変更 (#4297 by @hfhbd)

### 修正
- [Gradleプラグイン] 生成されるソースに対して安定した出力パスを使用するように修正 (#4269 by @joshfriend)
- [Gradleプラグイン] Gradleの微調整 (#4222 by @3flex)

## [2.0.0-rc01] - 2023-05-29 {id="2-0-0-rc01-2023-05-29"}
[2.0.0-rc01]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-rc01

### 追加
- [Paging] Paging拡張に js browser ターゲットを追加 (#3843 by @sproctor)
- [Paging] androidx-paging3 拡張に iosSimulatorArm64 ターゲットを追加 (#4117)
- [PostgreSQLダイアレクト] gen_random_uuid() のサポートとテストを追加 (#3855 by @davidwheeler123)
- [PostgreSQLダイアレクト] PostgreSQLの Alter table add constraint を追加 (#4116 by @griffio)
- [PostgreSQLダイアレクト] Alter table add constraint check を追加 (#4120 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLの文字長関数を追加 (#4121 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLの列デフォルト interval を追加 (#4142 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLの interval 列の結果を追加 (#4152 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQLの Alter Column を追加 (#4165 by @griffio)
- [PostgreSQLダイアレクト] PostgreSQL: date_part を追加 (#4198 by @hfhbd)
- [MySQLダイアレクト] SQL文字長関数を追加 (#4134 by @griffio)
- [IDEプラグイン] sqldelightディレクトリの候補表示を追加 (#3976 by @aperfilyev)
- [IDEプラグイン] プロジェクトツリー内の中間パッケージをコンパクト化 (#3992 by @aperfilyev)
- [IDEプラグイン] JOIN句の補完を追加 (#4086 by @aperfilyev)
- [IDEプラグイン] View作成のインテンションとライブテンプレートを追加 (#4074 by @aperfilyev)
- [IDEプラグイン] DELETEまたはUPDATE文内のWHERE欠落に関する警告を追加 (#4058 by @aperfilyev)
- [Gradleプラグイン] タイプセーフなプロジェクトアクセサーを有効化 (#4005 by @hfhbd)

### 変更
- [Gradleプラグイン] ServiceLoaderメカニズムを使用して VerifyMigrationTask 用の DriverInitializer を登録できるように変更 (#3986 by @C2H6O)
- [Gradleプラグイン] 明示的なコンパイラー環境を作成 (#4079 by @hfhbd)
- [JSドライバー] Webワーカー用ドライバーを別個のアーティファクトに分割
- [JSドライバー] JsWorkerSqlCursor を非公開に変更 (#3874 by @hfhbd)
- [JSドライバー] sqljsドライバーの公開を無効化 (#4108)
- [ランタイム] 同期ドライバーには同期スキーマ初期化子を要求するように強制 (#4013)
- [ランタイム] カーソルの非同期サポートを改善 (#4102)
- [ランタイム] 非推奨のターゲットを削除 (#4149 by @hfhbd)
- [ランタイム] 古いMM（メモリモデル）のサポートを削除 (#4148 by @hfhbd)

### 修正
- [R2DBCドライバー] R2DBC: ドライバーのクローズを待機するように修正 (#4139 by @hfhbd)
- [コンパイラー] データベースの create(SqlDriver) にマイグレーションからのPRAGMAを含めるよう修正 (#3845 by @MariusVolkhart)
- [コンパイラー] RETURNING句のコード生成を修正 (#3872 by @MariusVolkhart)
- [コンパイラー] 仮想テーブルの型を生成しないように修正 (#4015)
- [Gradleプラグイン] Gradleプラグインの軽微な使い勝手の改善 (#3930 by @zacsweers)
- [IDEプラグイン] 未解決のKotlin型を修正 (#3924 by @aperfilyev)
- [IDEプラグイン] ワイルドカード展開インテンションが修飾子付きでも動作するように修正 (#3979 by @aperfilyev)
- [IDEプラグイン] JAVA_HOMEが設定されていない場合は利用可能なJDKを使用するように修正 (#3925 by @aperfilyev)
- [IDEプラグイン] パッケージ名に対する使用箇所の検索を修正 (#4010)
- [IDEプラグイン] 無効な要素に対して自動インポートを表示しないように修正 (#4008)
- [IDEプラグイン] ダイアレクトが見つからない場合は解決を試みないように修正 (#4009)
- [IDEプラグイン] 無効化された状態（invalidated state）でのIDEコンパイラー実行を無視するように修正 (#4016)
- [IDEプラグイン] IntelliJ 2023.1のサポートを追加 (#4037 by @madisp)
- [IDEプラグイン] 列のリネーム時に名前付き引数の使用箇所もリネームするように修正 (#4027 by @aperfilyev)
- [IDEプラグイン] マイグレーション追加ポップアップを修正 (#4105 by @aperfilyev)
- [IDEプラグイン] マイグレーションファイル内で SchemaNeedsMigrationInspection を無効化 (#4106 by @aperfilyev)
- [IDEプラグイン] マイグレーション生成時に型名ではなくSQLの列名を使用するように修正 (#4112 by @aperfilyev)

## [2.0.0-alpha05] - 2023-01-20 {id="2-0-0-alpha05-2023-01-20"}
[2.0.0-alpha05]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha05

### 追加
- [Paging] マルチプラットフォームPaging拡張 (by @jeffdgr8)
- [ランタイム] Listener インターフェースに fun 修飾子を追加
- [SQLiteダイアレクト] SQLite 3.33のサポート（UPDATE FROM）を追加 (by @eygraber)
- [PostgreSQLダイアレクト] PostgreSQLにおける UPDATE FROM のサポート (by @eygraber)

### 変更
- [RDBCドライバー] コネクションを公開 (by @hfhbd)
- [ランタイム] マイグレーションのコールバックをメインの `migrate` 関数に移動
- [Gradleプラグイン] 下流プロジェクトからConfigurationsを非表示化
- [Gradleプラグイン] IntelliJのみをシェードするように変更 (by @hfhbd)
- [Gradleプラグイン] Kotlin 1.8.0-Beta をサポートし、マルチバージョンKotlinテストを追加 (by @hfhbd)

### 修正
- [RDBCドライバー] 代わりに javaObjectType を使用するように修正 (by @hfhbd)
- [RDBCドライバー] bindStatement 内のプリミティブnull値を修正 (by @hfhbd)
- [RDBCドライバー] R2DBC 1.0をサポート (by @hfhbd)
- [PostgreSQLダイアレクト] PostgreSQL: 型パラメーターなしのArrayを修正 (by @hfhbd)
- [IDEプラグイン] IntelliJを 221.6008.13 にバージョンアップ (by @hfhbd)
- [コンパイラー] 単純なビューから再帰的な元のテーブルを解決するように修正 (by @hfhbd)
- [コンパイラー] テーブルの外部キー句から値クラス（value classes）を使用するように修正 (by @hfhbd)
- [コンパイラー] 括弧なしのバインド式をサポートするよう SelectQueryGenerator を修正 (by @bellatoris)
- [コンパイラー] トランザクション使用時に ${name}Indexes 変数が重複して生成される問題を修正 (by @sachera)

## [1.5.5] - 2023-01-20 {id="1-5-5-2023-01-20"}
[1.5.5]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.5

Kotlin 1.8 および IntelliJ 2021+ との互換性リリースであり、JDK 17をサポートしています。

## [1.5.4] - 2022-10-06 {id="1-5-4-2022-10-06"}
[1.5.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.4

Kotlin 1.7.20 および AGP 7.3.0 との互換性アップデートです。

## [2.0.0-alpha04] - 2022-10-03 {id="2-0-0-alpha04-2022-10-03"}
[2.0.0-alpha04]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha04

### 破壊的変更 {id="breaking-changes"}

- Paging 3拡張APIが変更され、countにはint型のみが許可されるようになりました。
- Coroutines拡張では、デフォルトのディスパッチャーが廃止され、ディスパッチャーの明示的な受け渡しが必須となりました。
- DialectクラスおよびDriverクラスがfinalになったため、継承の代わりに委譲を使用してください。

### 追加
- [HSQLダイアレクト] HSQL: INSERT内の生成列（generated columns）に対する DEFAULT の使用をサポート (#3372 by @hfhbd)
- [PostgreSQLダイアレクト] PostgreSQL: INSERT内の生成列に対する DEFAULT の使用をサポート (#3373 by @hfhbd)
- [PostgreSQLダイアレクト] PostgreSQLに NOW() を追加 (#3403 by @hfhbd)
- [PostgreSQLダイアレクト] PostgreSQLに NOT 演算子を追加 (#3504 by @hfhbd)
- [Paging] *QueryPagingSource への CoroutineContext の受け渡しを許可 (#3384)
- [Gradleプラグイン] ダイアレクトに対するバージョンカタログのサポートを改善 (#3435)
- [Nativeドライバー] NativeSqliteDriver の DatabaseConfiguration 作成に介入するコールバックを追加 (#3512 by @svenjacobs)

### 変更
- [Paging] KeyedQueryPagingSource を利用した QueryPagingSource 関数にデフォルトのディスパッチャーを追加 (#3385)
- [Paging] OffsetQueryPagingSource を Int 専用に変更 (#3386)
- [非同期ランタイム] await* を上位クラス ExecutableQuery に移動 (#3524 by @hfhbd)
- [Coroutines拡張] flow拡張関数のデフォルトパラメーターを削除 (#3489)

### 修正
- [Gradleプラグイン] Kotlin 1.7.20 に更新 (#3542 by @zacsweers)
- [R2DBCドライバー] 常に値を送信するとは限らないR2DBCの変更に対応 (#3525 by @hfhbd)
- [HSQLダイアレクト] HSQLで失敗していたSQLiteの VerifyMigrationTask を修正 (#3380 by @hfhbd)
- [Gradleプラグイン] タスクをLazy Configuration APIを使用するように変換 (by @3flex)
- [Gradleプラグイン] Kotlin 1.7.20 における NPE を回避 (#3398 by @ZacSweers)
- [Gradleプラグイン] マイグレーション統合（squash migrations）タスクの説明文を修正 (#3449)
- [IDEプラグイン] 新しいKotlinプラグインにおける NoSuchFieldError を修正 (#3422 by @madisp)
- [IDEプラグイン] IDEA: UnusedQueryInspection - ArrayIndexOutOfBoundsException を修正 (#3427 by @vanniktech)
- [IDEプラグイン] 古いKotlinプラグインの参照にリフレクションを使用するように変更
- [コンパイラー] 拡張関数を持つカスタムダイアレクトがインポートを作成しない問題を修正 (#3338 by @hfhbd)
- [コンパイラー] CodeBlock.of("${CodeBlock.toString()}") のエスケープを修正 (#3340 by @hfhbd)
- [コンパイラー] マイグレーション内の非同期execute文をawaitするように修正 (#3352)
- [コンパイラー] AS を修正 (#3370 by @hfhbd)
- [コンパイラー] `getObject` メソッドが実際の型の自動補完をサポート (#3401 by @robxyy)
- [コンパイラー] 非同期のグループ化されたreturning文のコード生成を修正 (#3411)
- [コンパイラー] 可能な場合はバインドパラメーターのKotlin型を推論し、不可能な場合はより分かりやすいエラーメッセージで失敗するように改善 (#3413 by @hfhbd)
- [コンパイラー] ABS("foo") を不許可に修正 (#3430 by @hfhbd)
- [コンパイラー] 他のパラメーターからのKotlin型の推論をサポート (#3431 by @hfhbd)
- [コンパイラー] 常にデータベース実装を作成するように修正 (#3540 by @hfhbd)
- [コンパイラー] JavaDocの制約を緩和し、カスタムマッパー関数にも追加 (#3554 @hfhbd)
- [コンパイラー] バインディング内の DEFAULT を修正 (by @hfhbd)
- [Paging] Paging 3 を修正 (#3396)
- [Paging] Longを使用した OffsetQueryPagingSource の構築を許可 (#3409)
- [Paging] Dispatchers.Main の静的な入れ替えを行わないように修正 (#3428)

## [2.0.0-alpha03] - 2022-06-17 {id="2-0-0-alpha03-2022-06-17"}
[2.0.0-alpha03]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha03

### 破壊的変更

- ダイアレクトは通常のGradle依存関係のように参照されるようになりました。
```groovy
sqldelight {
  MyDatabase {
    dialect("app.cash.sqldelight:postgres-dialect:2.0.0-alpha03")
  }
}
```
- `AfterVersionWithDriver` 型は削除され、常にドライバーを保持する `AfterVersion` に統合されました。
- `Schema` 型は `SqlDriver` のサブタイプではなくなりました。
- `PreparedStatement` APIの呼び出しは0始まりのインデックス（zero-based indexes）になりました。

### 追加
- [IDEプラグイン] 稼働中のデータベースに対してSQLite、MySQL、PostgreSQLのコマンドを実行するサポートを追加 (#2718 by @aperfilyev)
- [IDEプラグイン] Android Studioのデータベースインスペクター（Database Inspector）のサポートを追加 (#3107 by @aperfilyev)
- [ランタイム] 非同期ドライバーのサポートを追加 (#3168 by @dellisd)
- [Nativeドライバー] 新しいKotlin Nativeメモリモデルをサポート (#3177 by @kpgalligan)
- [JSドライバー] SqlJsワーカー用ドライバーを追加 (#3203 by @dellisd)
- [Gradleプラグイン] SQLDelightタスクのクラスパスを公開
- [Gradleプラグイン] マイグレーションを統合（squash）するGradleタスクを追加
- [Gradleプラグイン] マイグレーションチェック中にスキーマ定義を無視するフラグを追加
- [MySQLダイアレクト] MySQLの FOR SHARE および FOR UPDATE をサポート (#3098)
- [MySQLダイアレクト] MySQLのインデックスヒントをサポート (#3099)
- [PostgreSQLダイアレクト] date_trunc を追加 (#3295 by @hfhbd)
- [JSON拡張] JSONテーブル関数をサポート (#3090)

### 変更
- [ランタイム] ドライバーを持たない AfterVersion 型を削除 (#3091)
- [ランタイム] Schema 型をトップレベルに移動
- [ランタイム] サードパーティ実装をサポートするため、ダイアレクトとリゾルバーをオープン化 (#3232 by @hfhbd)
- [コンパイラー] ビルド失敗レポートにコンパイルに使用されたダイアレクトを含めるように変更 (#3086)
- [コンパイラー] 未使用のアダプターをスキップ (#3162 by @eygraber)
- [コンパイラー] PrepareStatement で0始まりのインデックスを使用 (#3269 by @hfhbd)
- [Gradleプラグイン] ダイアレクトを文字列ではなく適切なGradle依存関係として指定するように変更 (#3085)
- [Gradleプラグイン] Gradle検証タスク: データベースファイルが存在しない場合に例外をスローするように変更 (#3126 by @vanniktech)

### 修正
- [Gradleプラグイン] Gradleプラグインの軽微なクリーンアップと調整 (#3171 by @3flex)
- [Gradleプラグイン] 生成ディレクトリにAGPの文字列を使用しないように修正
- [Gradleプラグイン] AGPのnamespace属性を使用するように修正 (#3220)
- [Gradleプラグイン] Gradleプラグインのランタイム依存関係にkotlin-stdlibを追加しないように修正 (#3245 by @mbonnin)
- [Gradleプラグイン] マルチプラットフォーム設定を簡素化 (#3246 by @mbonnin)
- [Gradleプラグイン] JS専用プロジェクトをサポート (#3310 by @hfhbd)
- [IDEプラグイン] Gradle Tooling APIにJAVA_HOMEを使用するように修正 (#3078)
- [IDEプラグイン] IDEプラグイン内で正しいClassLoaderを使用してJDBCドライバーを読み込むように修正 (#3080)
- [IDEプラグイン] 既存のPSI変更中のエラーを防ぐため、無効化する前にファイル要素をnullとしてマークするように修正 (#3082)
- [IDEプラグイン] ALTER TABLE 文内の新しいテーブル名の使用箇所を検索する際にクラッシュしないよう修正 (#3106)
- [IDEプラグイン] インスペクターを最適化し、予期される例外型についてはサイレントに失敗できるように変更 (#3121)
- [IDEプラグイン] 生成ディレクトリであるべきファイルを削除 (#3198)
- [IDEプラグイン] 安全でない演算子呼び出しを修正
- [コンパイラー] RETURNING文を含む更新および削除が確実にクエリを実行するように修正 (#3084)
- [コンパイラー] 複合SELECT（compound selects）における引数の型を正しく推論するように修正 (#3096)
- [コンパイラー] 共通テーブルはデータクラスを生成しないため、それらを返さないように修正 (#3097)
- [コンパイラー] 最上位のマイグレーションファイルの検索を高速化 (#3108)
- [コンパイラー] パイプ演算子でnull許容性が適切に継承されるように修正
- [コンパイラー] ANSI SQLの iif 関数のサポート
- [コンパイラー] 空のクエリファイルを生成しないように修正 (#3300 by @hfhbd)
- [コンパイラー] クエスチョンマークのみのアダプターを修正 (#3314 by @hfhbd)
- [PostgreSQLダイアレクト] PostgreSQLの主キー列が常に非nullになるように修正 (#3092)
- [PostgreSQLダイアレクト] 複数テーブルで同名の場合のコピーを修正 (#3297 by @hfhbd)
- [SQLite 3.35ダイアレクト] 変更されたテーブルからインデックス付きの列を削除する場合にのみエラーを表示するように修正 (#3158 by @eygraber)

## [2.0.0-alpha02] - 2022-04-13 {id="2-0-0-alpha02-2022-04-13"}
[2.0.0-alpha02]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha02

### 破壊的変更

- `app.cash.sqldelight.runtime.rx` をすべて `app.cash.sqldelight.rx2` に置換する必要があります。

### 追加
- [コンパイラー] グループ化された文の末尾でのreturningをサポート
- [コンパイラー] ダイアレクトモジュールによるコンパイラー拡張をサポートし、SQLite JSON拡張を追加 (#1379, #2087)
- [コンパイラー] 値を返すPRAGMA文のサポート (#1106)
- [コンパイラー] マークされた列に対する値型（value types）の生成をサポート
- [コンパイラー] オプティミスティックロックとバリデーションのサポートを追加 (#1952)
- [コンパイラー] 複数更新文（multi-update statements）のサポート
- [PostgreSQL] PostgreSQLのreturning文をサポート
- [PostgreSQL] PostgreSQLの日付型をサポート
- [PostgreSQL] PostgreSQLのintervalをサポート
- [PostgreSQL] PostgreSQLのBooleanをサポートし、alter tableでの挿入を修正
- [PostgreSQL] PostgreSQLにおけるオプションのLIMITをサポート
- [PostgreSQL] PostgreSQLの BYTEA 型をサポート
- [PostgreSQL] PostgreSQLのシリアル（serial）に関するテストを追加
- [PostgreSQL] PostgreSQLの for update 構文をサポート
- [PostgreSQL] PostgreSQLの配列型をサポート
- [PostgreSQL] PostgreSQLにおけるUUID型の適切な保存・取得に対応
- [PostgreSQL] PostgreSQLの NUMERIC 型をサポート (#1882)
- [PostgreSQL] 共通テーブル式内でのreturningクエリをサポート (#2471)
- [PostgreSQL] JSON固有の演算子をサポート
- [PostgreSQL] PostgreSQLの Copy を追加 (by @hfhbd)
- [MySQL] MySQLの Replace をサポート
- [MySQL] MySQLの NUMERIC/BigDecimal 型をサポート (#2051)
- [MySQL] MySQLの truncate 文をサポート
- [MySQL] MySQLにおけるJSON固有の演算子をサポート (by @eygraber)
- [MySQL] MySQLの INTERVAL をサポート (#2969 by @eygraber)
- [HSQL] HSQLのウィンドウ機能を追加
- [SQLite] WHERE句内のnullableなパラメーターに対する等価性チェックを置換しないように変更 (#1490 by @eygraber)
- [SQLite] SQLite 3.35のreturning文をサポート (#1490 by @eygraber)
- [SQLite] GENERATED句をサポート
- [SQLite] SQLite 3.38ダイアレクトのサポートを追加 (by @eygraber)

### 変更
- [コンパイラー] 生成コードを整理
- [コンパイラー] グループ化された文内でのテーブルパラメーターの使用を禁止 (#1822)
- [コンパイラー] グループ化されたクエリをトランザクション内に配置 (#2785)
- [ランタイム] ドライバーのexecuteメソッドから更新行数を返すように変更
- [ランタイム] コネクションにアクセスするクリティカルセクション内にSqlCursorを制限 (#2123 by @andersio)
- [Gradleプラグイン] マイグレーション用にスキーマ定義を比較するように変更 (#841)
- [PostgreSQL] PostgreSQLでダブルクォートを不許可に変更
- [MySQL] MySQLでの == の使用時にエラーを発生させるよう変更 (#2673)

### 修正
- [コンパイラー] 2.0 alphaにおいて異なるテーブルからの同一アダプター型がコンパイルエラーを引き起こす問題を修正
- [コンパイラー] upsert文のコンパイルに関する問題を修正 (#2791)
- [コンパイラー] 複数の一致がある場合、クエリ結果がSELECT句内のテーブルを使用するように修正 (#1874, #2313)
- [コンパイラー] INSTEAD OF トリガーを持つビューの更新をサポート (#1018)
- [コンパイラー] 関数名内の from および for をサポート
- [コンパイラー] 関数式内で SEPARATOR キーワードを許可
- [コンパイラー] ORDER BY 内でエイリアスされたテーブルの ROWID にアクセスできない問題を修正
- [コンパイラー] MySQLのHAVING句内でエイリアスされた列名が認識されない問題を修正
- [コンパイラー] 誤った「Multiple columns found」エラーを修正
- [コンパイラー] PRAGMA locking_mode = EXCLUSIVE; を設定できない問題を修正
- [PostgreSQL] PostgreSQLの列名変更（rename column）を修正
- [MySQL] MySQL関数 UNIX_TIMESTAMP、TO_SECONDS、JSON_ARRAYAGG が認識されない問題を修正
- [SQLite] SQLiteのウィンドウ機能を修正
- [IDEプラグイン] 空のプログレスインジケーター内でgotoハンドラーを実行するように修正 (#2990)
- [IDEプラグイン] プロジェクトが未構成の場合はハイライトビジターが実行されないように修正 (#2981, #2976)
- [IDEプラグイン] 推移的に生成されたコードもIDE内で確実に更新されるように修正 (#1837)
- [IDEプラグイン] ダイアレクト更新時にインデックスを無効化するように修正

## [2.0.0-alpha01] - 2022-03-31 {id="2-0-0-alpha01-2022-03-31"}
[2.0.0-alpha01]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha01

これは2.0の最初のアルファリリースであり、一部破壊的変更が含まれています。今後もさらなるABIの破壊的変更が予定されているため、このリリースに依存するライブラリは公開しないでください（アプリケーション開発での利用は問題ありません）。

### 破壊的変更

- まず、`com.squareup.sqldelight` のすべての出現箇所を `app.cash.sqldelight` に置き換える必要があります。
- 次に、`app.cash.sqldelight.android` を `app.cash.sqldelight.driver.android` に置き換える必要があります。
- 3つ目に、`app.cash.sqldelight.sqlite.driver` を `app.cash.sqldelight.driver.jdbc.sqlite` に置き換える必要があります。
- 4つ目に、`app.cash.sqldelight.drivers.native` を `app.cash.sqldelight.driver.native` に置き換える必要があります。
- IDEプラグインを2.Xバージョンに更新する必要があります。[alphaまたはeapチャンネル](https://plugins.jetbrains.com/plugin/8191-sqldelight/versions/alpha) で入手できます。
- ダイアレクトはGradle内で指定可能な依存関係となりました：

```gradle
sqldelight {
  MyDatabase {
    packageName = "com.example"
    dialect = "app.cash.sqldelight:mysql-dialect:2.0.0-alpha01"
  }
}
```

現在サポートされているダイアレクトは、`mysql-dialect`、`postgresql-dialect`、`hsql-dialect`、`sqlite-3-18-dialect`、`sqlite-3-24-dialect`、`sqlite-3-25-dialect`、`sqlite-3-30-dialect`、`sqlite-3-35-dialect` です。

- プリミティブ型はインポートが必要になりました（例: `INTEGER AS Boolean` の場合は `import kotlin.Boolean` を追加）。以前サポートされていた型の一部にはアダプターが必要になります。ほとんどの変換用のプリミティブアダプター（`Integer AS kotlin.Int` 用の `IntColumnAdapter` など）は `app.cash.sqldelight:primitive-adapters:2.0.0-alpha01` で提供されています。

### 追加
- [IDEプラグイン] 基本的なマイグレーション候補の提案機能 (by @aperfilyev)
- [IDEプラグイン] インポートヒントアクションを追加 (by @aperfilyev)
- [IDEプラグイン] Kotlinクラスのコード補完を追加 (by @aperfilyev)
- [Gradleプラグイン] Gradleタイプセーフプロジェクトアクセサー用のショートカットを追加 (by @hfhbd)
- [コンパイラー] ダイアレクトに応じたコード生成のカスタマイズ (by @MariusVolkhart)
- [JDBCドライバー] JdbcDriver に共通型を追加 (by @MariusVolkhart)
- [SQLite] SQLite 3.35のサポートを追加 (by @eygraber)
- [SQLite] ALTER TABLE DROP COLUMN のサポートを追加 (by @eygraber)
- [SQLite] SQLite 3.30ダイアレクトのサポートを追加 (by @eygraber)
- [SQLite] SQLiteにおける NULLS FIRST/LAST をサポート (by @eygraber)
- [HSQL] HSQLの生成句（generated clause）のサポートを追加 (by @MariusVolkhart)
- [HSQL] HSQLにおける名前付きパラメーターのサポートを追加 (by @MariusVolkhart)
- [HSQL] HSQLのinsertクエリをカスタマイズ (by @MariusVolkhart)

### 変更
- [全体] パッケージ名が com.squareup.sqldelight から app.cash.sqldelight に変更されました。
- [ランタイム] 各ダイアレクトを独立したGradleモジュールに分離
- [ランタイム] ドライバー側で実装するクエリ通知へ移行
- [ランタイム] デフォルトの列アダプターを別モジュールに抽出 (#2056, #2060)
- [コンパイラー] 各モジュールで再生成するのではなく、モジュールにクエリ実装を生成させるように変更
- [コンパイラー] 生成データクラスにおけるカスタム toString の生成を削除 (by @PaulWoitaschek)
- [JSドライバー] sqljs-driver から sql.js 依存関係を削除 (by @dellisd)
- [Paging] Android Paging 2拡張を削除
- [IDEプラグイン] SQLDelight同期中にエディターバナーを表示するように変更 (#2511)
- [IDEプラグイン] 最小サポートIntelliJバージョンは 2021.1

### 修正
- [ランタイム] メモリアロケーションとポインタ追跡を減らすため、リスナーリストをフラット化 (by @andersio)
- [IDEプラグイン] エラー箇所へのジャンプを可能にするためエラーメッセージを修正 (by @hfhbd)
- [IDEプラグイン] 不足していたインスペクションの説明を追加 (#2768 by @aperfilyev)
- [IDEプラグイン] GotoDeclarationHandler における例外を修正 (#2531, #2688, #2804 by @aperfilyev)
- [IDEプラグイン] import キーワードのハイライトを修正 (by @aperfilyev)
- [IDEプラグイン] 未解決のKotlin型を修正 (#1678 by @aperfilyev)
- [IDEプラグイン] 未解決パッケージのハイライトを修正 (#2543 by @aperfilyev)
- [IDEプラグイン] プロジェクトインデックスが未初期化の場合、列の不一致検査を試行しないように修正
- [IDEプラグイン] Gradle同期が実行されるまでファイルインデックスを初期化しないように修正
- [IDEプラグイン] Gradle同期が開始された場合、SQLDelightのインポートをキャンセルするように修正
- [IDEプラグイン] 元に戻す（undo）アクションが実行されたスレッドの外部でデータベースを再生成するように修正
- [IDEプラグイン] 参照を解決できない場合はブランクのJava型を使用するように修正
- [IDEプラグイン] ファイル解析中は適切にメインスレッドから離脱し、書き込み時のみ戻るように修正
- [IDEプラグイン] 古いIntelliJバージョンとの互換性を改善 (by @3flex)
- [IDEプラグイン] より高速なアノテーションAPIを使用するように変更
- [Gradleプラグイン] ランタイム追加時にJS/Androidプラグインを明示的にサポート (by @ZacSweers)
- [Gradleプラグイン] マイグレーションからスキーマを導出せずにマイグレーション出力タスクを登録 (#2744 by @kevincianfarini)
- [Gradleプラグイン] マイグレーションタスクがクラッシュした場合、実行中にクラッシュしたファイルを出力するように修正
- [Gradleプラグイン] 冪等な出力を保証するため、コード生成時にファイルをソート (by @ZacSweers)
- [コンパイラー] PSIグラフ全体を探索せず、ファイル走査により高速なAPIを使用
- [コンパイラー] select関数のパラメーターにキーワードマングリングを追加 (#2759 by @aperfilyev)
- [コンパイラー] マイグレーションアダプターの packageName を修正 (by @hfhbd)
- [コンパイラー] 型ではなくプロパティにアノテーションを出力するように修正 (#2798 by @aperfilyev)
- [コンパイラー] Queryのサブタイプに渡す前に引数をソートするように修正 (#2379 by @aperfilyev)

## [1.5.3] - 2021-11-23 {id="1-5-3-2021-11-23"}
[1.5.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.3

### 追加
- [JDBCドライバー] サードパーティのドライバー実装向けに JdbcDriver をオープン化 (#2672 by @hfhbd)
- [MySQLダイアレクト] 時間加算に関する不足していた関数を追加 (#2671 by @sdoward)
- [Coroutines拡張] coroutines-extensions にM1ターゲットを追加 (by @PhilipDukhov)

### 変更
- [Paging3拡張] sqldelight-android-paging3 をAARではなくJARとして配布するように変更 (#2634 by @julioromano)
- 弱いキーワード（soft keywords）でもあるプロパティ名には、末尾にアンダースコアが付加されるようになりました（例: `value` は `value_` として公開されます）。

### 修正
- [コンパイラー] 重複する配列パラメーターに対して変数を抽出しないように修正 (by @aperfilyev)
- [Gradleプラグイン] kotlin.mpp.enableCompatibilityMetadataVariant を追加 (#2628 by @martinbonnin)
- [IDEプラグイン] 使用箇所の検索処理にリード・アクション（read action）を要求するように修正

## [1.5.2] - 2021-10-12 {id="1-5-2-2021-10-12"}
[1.5.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.2

### 追加
- [Gradleプラグイン] HMPP（階層型マルチプラットフォームプロジェクト）をサポート (#2548 by @martinbonnin)
- [IDEプラグイン] NULL比較インスペクションを追加 (by @aperfilyev)
- [IDEプラグイン] インスペクション抑制機能を追加 (#2519 by @aperfilyev)
- [IDEプラグイン] 名前付きパラメーターと位置指定パラメーターの混在インスペクションを追加 (by @aperfilyev)
- [SQLiteドライバー] mingwX86 ターゲットを追加 (#2558 by @enginegl)
- [SQLiteドライバー] M1ターゲットを追加
- [SQLiteドライバー] linuxX64 サポートを追加 (#2456 by @chippmann)
- [MySQLダイアレクト] MySQLに ROW_COUNT 関数を追加 (#2523)
- [PostgreSQLダイアレクト] PostgreSQLの rename、drop column を追加 (by @pabl0rg)
- [PostgreSQLダイアレクト] PostgreSQL文法が CITEXT を認識しない問題を修正
- [PostgreSQLダイアレクト] TIMESTAMP WITH TIME ZONE および TIMESTAMPTZ を追加
- [PostgreSQLダイアレクト] PostgreSQLの GENERATED 列用の文法を追加
- [ランタイム] AfterVersion にパラメーターとして SqlDriver を提供 (#2534, 2614 by @ahmedre)

### 変更
- [Gradleプラグイン] 明示的にGradle 7.0を要求するように変更 (#2572 by @martinbonnin)
- [Gradleプラグイン] VerifyMigrationTask がGradleの最新状態チェック（up-to-date checks）をサポートするように変更 (#2533 by @3flex)
- [IDEプラグイン] nullable型と非nullable型を結合する際、「Join compares two columns of different types」という警告を出さないように修正 (#2550 by @pchmielowski)
- [IDEプラグイン] 列型における小文字の 'as' に対するエラーメッセージを明確化 (by @aperfilyev)

### 修正
- [IDEプラグイン] プロジェクトが既に破棄（dispose）されている場合は新しいダイアレクトで再パースしないように修正 (#2609)
- [IDEプラグイン] 関連付けられた仮想ファイルがnullの場合、モジュールもnullとして扱うように修正 (#2607)
- [IDEプラグイン] 未使用クエリインスペクション中のクラッシュを回避 (#2610)
- [IDEプラグイン] ライト・アクション（write action）内でデータベース同期の書き込みを実行するように修正 (#2605)
- [IDEプラグイン] SQLDelightの同期スケジュールをIDE側に委ねるよう修正
- [IDEプラグイン] JavaTypeMixin の NPE を修正 (#2603 by @aperfilyev)
- [IDEプラグイン] MismatchJoinColumnInspection における IndexOutOfBoundsException を修正 (#2602 by @aperfilyev)
- [IDEプラグイン] UnusedColumnInspection の説明を追加 (#2600 by @aperfilyev)
- [IDEプラグイン] PsiElement.generatedVirtualFiles をリード・アクションでラップ (#2599 by @aperfilyev)
- [IDEプラグイン] 不要な非nullキャストを削除 (#2596)
- [IDEプラグイン] 使用箇所の検索でnullを適切に処理するように修正 (#2595)
- [IDEプラグイン] Android向け生成ファイルに対するIDEのオートコンプリートを修正 (#2573 by @martinbonnin)
- [IDEプラグイン] SqlDelightGotoDeclarationHandler の NPE を修正 (by @aperfilyev)
- [IDEプラグイン] insert文内の引数に含まれるKotlinキーワードをマングリング (by @aperfilyev)
- [IDEプラグイン] SqlDelightFoldingBuilder の NPE を修正 (#2382 by @aperfilyev)
- [IDEプラグイン] CopyPasteProcessor における ClassCastException をキャッチ (by @aperfilyev)
- [IDEプラグイン] 更新ライブテンプレートを修正 (by @IliasRedissi)
- [IDEプラグイン] インテンションアクションに説明を追加 (#2489 by @aperfilyev)
- [IDEプラグイン] テーブルが見つからない場合の CreateTriggerMixin の例外を修正 (by @aperfilyev)
- [コンパイラー] テーブル作成文をトポロジカルソート
- [コンパイラー] ディレクトリに対して `forDatabaseFiles` コールバックを呼び出さないように修正 (#2532)
- [Gradleプラグイン] generateDatabaseInterface タスクの依存関係を潜在的なコンシューマーに伝播 (#2518 by @martinbonnin)

## [1.5.1] - 2021-07-16 {id="1-5-1-2021-07-16"}
[1.5.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.1

### 追加
- [PostgreSQLダイアレクト] PostgreSQLの JSONB および ON Conflict Do Nothing をサポート (by @satook)
- [PostgreSQLダイアレクト] PostgreSQLの ON CONFLICT (column, ...) DO UPDATE のサポートを追加 (by @satook)
- [MySQLダイアレクト] MySQLの生成列をサポート (by @JGulbronson)
- [Nativeドライバー] watchosX64 サポートを追加
- [IDEプラグイン] パラメーターの型とアノテーションを追加 (by @aperfilyev)
- [IDEプラグイン] 「すべての列を選択（select all）」クエリを生成するアクションを追加 (by @aperfilyev)
- [IDEプラグイン] オートコンプリートで列の型を表示 (by @aperfilyev)
- [IDEプラグイン] オートコンプリートにアイコンを追加 (by @aperfilyev)
- [IDEプラグイン] 「主キーによる選択（select by primary key）」クエリを生成するアクションを追加 (by @aperfilyev)
- [IDEプラグイン] 「挿入（insert into）」クエリを生成するアクションを追加 (by @aperfilyev)
- [IDEプラグイン] 列名、文の識別子、関数名に対するハイライトを追加 (by @aperfilyev)
- [IDEプラグイン] 残りのクエリ生成アクションを追加 (#489 by @aperfilyev)
- [IDEプラグイン] insert文からのパラメーターヒントを表示 (by @aperfilyev)
- [IDEプラグイン] テーブルエイリアスのインテンションアクションを追加 (by @aperfilyev)
- [IDEプラグイン] 列名を完全修飾するインテンションを追加 (by @aperfilyev)
- [IDEプラグイン] Kotlinプロパティの「宣言へ移動」を追加 (by @aperfilyev)

### 変更
- [Nativeドライバー] 可能な場合はフリーズや共有可能データ構造を回避することにより、ネイティブトランザクションのパフォーマンスを改善 (by @andersio)
- [Paging 3] Paging3のバージョンを 3.0.0 安定版に引き上げ
- [JSドライバー] sql.js を 1.5.0 にアップグレード

### 修正
- [JDBC SQLiteドライバー] ThreadLocal をクリアする前に接続に対して close() を呼び出すよう修正 (#2444 by @hannesstruss)
- [RX拡張] 購読/破棄の競合リークを修正 (#2403 by @pyricau)
- [Coroutines拡張] 通知を行う前にクエリリスナーを確実に登録するように修正
- [コンパイラー] 一貫したKotlin出力ファイルを得るために notifyQueries をソート (by @thomascjy)
- [コンパイラー] selectクエリクラスのプロパティに @JvmField アノテーションを付加しないように修正 (by @eygraber)
- [IDEプラグイン] インポートオプティマイザーを修正 (#2350 by @aperfilyev)
- [IDEプラグイン] 未使用列のインスペクションを修正 (by @aperfilyev)
- [IDEプラグイン] インポートインスペクションおよびクラスアノテーターにネストされたクラスのサポートを追加 (by @aperfilyev)
- [IDEプラグイン] CopyPasteProcessor の NPE を修正 (#2363 by @aperfilyev)
- [IDEプラグイン] InlayParameterHintsProvider のクラッシュを修正 (#2359 by @aperfilyev)
- [IDEプラグイン] create table文に任意のテキストをコピー＆ペーストした際の空行挿入を修正 (#2431 by @aperfilyev)

## [1.5.0] - 2021-04-23 {id="1-5-0-2021-04-23"}
[1.5.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.0

### 追加
- [SQLite JavaScriptドライバー] sqljs-driver の公開を有効化 (#1667 by @dellisd)
- [Paging3拡張] Android Paging 3ライブラリ用拡張 (#1786 by @kevincianfarini)
- [MySQLダイアレクト] MySQLの ON DUPLICATE KEY UPDATE 競合解決のサポートを追加 (by @rharter)
- [SQLiteダイアレクト] SQLiteの offsets() に対するコンパイラーサポートを追加 (by @qjroberts)
- [IDEプラグイン] 未知の型に対するインポートクイックフィックスを追加 (#683 by @aperfilyev)
- [IDEプラグイン] 未使用インポートのインスペクションを追加 (#1161 by @aperfilyev)
- [IDEプラグイン] 未使用クエリのインスペクションを追加 (by @aperfilyev)
- [IDEプラグイン] 未使用列のインスペクションを追加 (#569 by @aperfilyev)
- [IDEプラグイン] コピー＆ペースト時に自動的にインポートを取り込むように対応 (#684 by @aperfilyev)
- [IDEプラグイン] GradleとIntelliJプラグインのバージョン間に互換性がない場合に通知バルーンを表示
- [IDEプラグイン] Insert Into ... VALUES(?) のパラメーターヒントを追加 (#506 by @aperfilyev)
- [IDEプラグイン] インラインパラメーターヒントを追加 (by @aperfilyev)
- [ランタイム] コールバック付きでマイグレーションを実行するためのAPIをランタイムに追加 (#1844)

### 変更
- [コンパイラー] 「IS NOT NULL」クエリをスマートキャスト (#867)
- [コンパイラー] 実行時に失敗するキーワードから保護 (#1471, #1629)
- [Gradleプラグイン] Gradleプラグインのサイズを60MBから13MBに削減
- [Gradleプラグイン] Androidバリアントを適切にサポートし、KMMターゲット固有のSQLサポートを削除 (#1039)
- [Gradleプラグイン] minsdkに基づいて最小SQLiteバージョンを選択するように変更 (#1684)
- [Nativeドライバー] ネイティブドライバーの接続プールおよびパフォーマンスのアップデート

### 修正
- [コンパイラー] ラムダの前のノーブレークスペース（NBSP）を修正 (by @oldergod)
- [コンパイラー] 生成された bind* および cursor.get* 文における型の非互換性を修正
- [コンパイラー] SQL節で適合された型を永続化するように修正 (#2067)
- [コンパイラー] NULLキーワードのみの列はnullableになるように修正
- [コンパイラー] 型アノテーション付きのマッパーラムダを生成しないように修正 (#1957)
- [コンパイラー] カスタムクエリが競合する場合、追加のパッケージサフィックスとしてファイル名を使用するように修正 (#1057, #1278)
- [コンパイラー] 外部キーカスケードによってクエリリスナーに確実に通知されるように修正 (#1325, #1485)
- [コンパイラー] 同じ型の2つをUNIONする場合、テーブル型を返すように修正 (#1342)
- [コンパイラー] ifnull および coalesce へのパラメーターをnullableにできるように修正 (#1263)
- [コンパイラー] 式に対してクエリから課されるnull許容性を正しく適用
- [MySQLダイアレクト] MySQLの if 文をサポート
- [PostgreSQLダイアレクト] PostgreSQLで NUMERIC および DECIMAL を Double として取得するように修正 (#2118)
- [SQLiteダイアレクト] UPSERTの通知で BEFORE/AFTER UPDATE トリガーを考慮するように修正 (#2198 by @andersio)
- [SQLiteドライバー] インメモリでない限り、SqliteDriver 内のスレッドに対して複数の接続を使用するように修正 (#1832)
- [JDBCドライバー] JDBCドライバーが autoCommit を true と見なしていた問題を修正 (#2041)
- [JDBCドライバー] 例外発生時に接続を確実に閉じるように修正 (#2306)
- [IDEプラグイン] パス区切り文字のバグによりWindows上でGoToDeclaration/FindUsagesが機能しなかった問題を修正 (#2054 by @angusholder)
- [IDEプラグイン] IDE内でクラッシュする代わりにGradleエラーを無視するように修正
- [IDEプラグイン] sqldelightファイルが非sqldelightモジュールに移動された場合、コード生成を試行しないように修正
- [IDEプラグイン] IDE内でのコード生成エラーを無視するように修正
- [IDEプラグイン] 負のインデックスによる部分文字列取得を試みないように修正 (#2068)
- [IDEプラグイン] Gradleアクションを実行する前にプロジェクトが破棄されていないことを確認するよう修正 (#2155)
- [IDEプラグイン] nullable型に対する算術演算の結果もnullableになるように修正 (#1853)
- [IDEプラグイン] 追加の射影（projections）があっても「*を展開するインテンション」が動作するように修正 (#2173 by @aperfilyev)
- [IDEプラグイン] GoTo実行時にKotlin解決が失敗した場合、sqldelightファイルへの遷移を試行しないように修正
- [IDEプラグイン] SQLDelightのインデックス作成中にIntelliJが例外に遭遇してもクラッシュしないように修正
- [IDEプラグイン] IDEでのコード生成前のエラー検出時に発生した例外を処理
- [IDEプラグイン] IDEプラグインをDynamic Pluginsと互換性があるように修正 (#1536)
- [Gradleプラグイン] WorkerApiを使用したデータベース生成時の競合状態を修正 (#2062 by @stephanenicolas)
- [Gradleプラグイン] classLoaderIsolation によりカスタムJDBCの使用が妨げられていた問題を修正 (#2048 by @benasher44)
- [Gradleプラグイン] packageName 欠落時のエラーメッセージを改善 (by @vanniktech)
- [Gradleプラグイン] SQLDelightがIntelliJ依存関係をbuildscriptクラスパスに漏出させていた問題を修正 (#1998)
- [Gradleプラグイン] Gradleビルドキャッシュを修正 (#2075)
- [Gradleプラグイン] Gradleプラグイン内で kotlin-native-utils に依存しないように修正 (by @ilmat192)
- [Gradleプラグイン] マイグレーションファイルのみが存在する場合でもデータベースを書き出すように修正 (#2094)
- [Gradleプラグイン] 最終コンパイルユニットでダイアモンド依存関係が1回だけ取得されるように修正 (#1455)

また、本リリースでSQLDelightのインフラ改善に多大な貢献をしてくれた @3flex に感謝します。

## [1.4.4] - 2020-10-08 {id="1-4-4-2020-10-08"}
[1.4.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.4

### 追加
- [PostgreSQLダイアレクト] WITH句内でのデータ変更文をサポート
- [PostgreSQLダイアレクト] substring 関数のサポート
- [Gradleプラグイン] SQLDelightコンパイル中にマイグレーションを検証するための verifyMigrations フラグを追加 (#1872)

### 変更
- [コンパイラー] 非SQLiteダイアレクトにおいて、SQLite固有の関数を未知（unknown）としてフラグ付け
- [Gradleプラグイン] sqldelightプラグインが適用されているがデータベースが設定されていない場合に警告を表示 (#1421)

### 修正
- [コンパイラー] ORDER BY 句内で列名をバインドした際にエラーを報告するように修正 (#1187 by @eygraber)
- [コンパイラー] dbインターフェース生成時にレジストリ警告が表示される問題を修正 (#1792)
- [コンパイラー] case文における不正確な型推論を修正 (#1811)
- [コンパイラー] バージョンのないマイグレーションファイルに対してより適切なエラーを表示 (#2006)
- [コンパイラー] 一部のデータベース型の ColumnAdapter においてマーシャリングに必要なデータベース型が正しくなかった問題を修正 (#2012)
- [コンパイラー] CAST のnull許容性を修正 (#1261)
- [コンパイラー] クエリラッパー内で発生していた大量の名前シャドウイング警告を修正 (#1946 by @eygraber)
- [コンパイラー] 生成コードで完全修飾名が使用されている問題を修正 (#1939)
- [IDEプラグイン] Gradle同期からSQLDelightのコード生成をトリガーするように修正
- [IDEプラグイン] `.sq` ファイル変更時にプラグインがデータベースインターフェースを再生成しない問題を修正 (#1945)
- [IDEプラグイン] ファイルを新しいパッケージに移動する際の問題を修正 (#444)
- [IDEプラグイン] カーソルを移動する場所がない場合、クラッシュする代わりに何もしないように修正 (#1994)
- [IDEプラグイン] Gradleプロジェクト外のファイルに対して空のパッケージ名を使用するように修正 (#1973)
- [IDEプラグイン] 無効な型に対して正常に失敗（fail gracefully）するように修正 (#1943)
- [IDEプラグイン] 未知の式に遭遇した際により適切なエラーメッセージをスローするように修正 (#1958)
- [Gradleプラグイン] SQLDelightがIntelliJ依存関係をbuildscriptクラスパスに漏出させていた問題を修正 (#1998)
- [Gradleプラグイン] `*.sq` ファイルにメソッドドキュメントを追加した際の「JavadocIntegrationKt not found」コンパイルエラーを修正 (#1982)
- [Gradleプラグイン] Configuration Caching（CoCa）がサポートされていない問題を修正 (#1947 by @stephanenicolas)
- [SQLite JDBCドライバー] SQLException: database in auto-commit mode を修正 (#1832)
- [Coroutines拡張] coroutines-extensions のIRバックエンドを修正 (#1918 by @dellisd)

## [1.4.3] - 2020-09-04 {id="1-4-3-2020-09-04"}
[1.4.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.3

### 追加
- [MySQLダイアレクト] MySQLの last_insert_id 関数のサポートを追加 (by @lawkai)
- [PostgreSQLダイアレクト] SERIAL データ型のサポート (by @veyndan & @felipecsl)
- [PostgreSQLダイアレクト] PostgreSQLの RETURNING をサポート (by @veyndan)

### 修正
- [MySQLダイアレクト] MySQLの AUTO_INCREMENT をデフォルト値を持つものとして処理するように修正 (#1823)
- [コンパイラー] Upsert文のコンパイラーエラーを修正 (#1809 by @eygraber)
- [コンパイラー] 無効なKotlinコードが生成される問題を修正 (#1925 by @eygraber)
- [コンパイラー] 未知の関数に対してより適切なエラーメッセージを表示 (#1843)
- [コンパイラー] instr の第2パラメーターの型としてStringを公開
- [IDEプラグイン] IDEプラグインによるデーモンのメモリ肥大化とUIスレッドの停止を修正 (#1916)
- [IDEプラグイン] モジュールがnullのシナリオを処理 (#1902)
- [IDEプラグイン] 未設定の `.sq` ファイルにおいてパッケージ名として空文字列を返すように修正 (#1920)
- [IDEプラグイン] グループ化された文を修正し、統合テストを追加 (#1820)
- [IDEプラグイン] 要素のモジュール検索に組み込みの ModuleUtil を使用するように修正 (#1854)
- [IDEプラグイン] ルックアップに有効な要素のみを追加するように修正 (#1909)
- [IDEプラグイン] 親要素がnullになる可能性を処理 (#1857)

## [1.4.2] - 2020-08-27 {id="1-4-2-2020-08-27"}
[1.4.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.2

### 追加
- [ランタイム] 新しいJS IRバックエンドをサポート
- [Gradleプラグイン] generateSqlDelightInterface Gradleタスクを追加 (by @vanniktech)
- [Gradleプラグイン] verifySqlDelightMigration Gradleタスクを追加 (by @vanniktech)

### 修正
- [IDEプラグイン] IDEとGradle間のデータ共有を促進するためにGradle Tooling APIを使用するように変更
- [IDEプラグイン] スキーマ導出のデフォルトをfalseに設定
- [IDEプラグイン] commonMain ソースセットを適切に取得するように修正
- [MySQLダイアレクト] mySqlFunctionType() に minute を追加 (by @maaxgr)

## [1.4.1] - 2020-08-21 {id="1-4-1-2020-08-21"}
[1.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.1

### 追加
- [ランタイム] Kotlin 1.4.0 をサポート (#1859)

### 変更
- [Gradleプラグイン] AGP依存関係を compileOnly に変更 (#1362)

### 修正
- [コンパイラー] 列定義ルールおよびテーブルインターフェースジェネレーターにオプションのJavadocを追加 (#1224 by @endanke)
- [SQLiteダイアレクト] SQLite FTS5補助関数 highlight、snippet、bm25 のサポートを追加 (by @drampelt)
- [MySQLダイアレクト] MySQLの bit データ型をサポート
- [MySQLダイアレクト] MySQLのバイナリリテラルをサポート
- [PostgreSQLダイアレクト] sql-psi から SERIAL を公開 (by @veyndan)
- [PostgreSQLダイアレクト] BOOLEAN データ型を追加 (by @veyndan)
- [PostgreSQLダイアレクト] NULL列制約を追加 (by @veyndan)
- [HSQLダイアレクト] HSQLに `AUTO_INCREMENT` サポートを追加 (by @rharter)

## [1.4.0] - 2020-06-22 {id="1-4-0-2020-06-22"}
[1.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.0

### 追加
- [MySQLダイアレクト] MySQLサポート (by @JGulbronson & @veyndan)
- [PostgreSQLダイアレクト] 実験的なPostgreSQLサポート (by @veyndan)
- [HSQLダイアレクト] 実験的なH2サポート (by @MariusVolkhart)
- [SQLiteダイアレクト] SQLite FTS5サポート (by @benasher44 & @jpalawaga)
- [SQLiteダイアレクト] alter table rename column をサポート (#1505 by @angusholder)
- [IDE] マイグレーション（`.sqm`）ファイルのIDEサポート
- [IDE] 組み込みSQLライブテンプレートを模倣したSQLDelightライブテンプレートを追加 (#1154 by @veyndan)
- [IDE] 新規SqlDelightファイル作成アクションを追加 (#42 by @romtsn)
- [ランタイム] 結果を返すトランザクション用の transactionWithReturn APIを追加
- [コンパイラー] `.sq` ファイル内で複数のSQL文をグループ化する構文
- [コンパイラー] マイグレーションファイルからのスキーマ生成をサポート
- [Gradleプラグイン] マイグレーションファイルを有効なSQLとして出力するタスクを追加

### 変更
- [ドキュメント] ドキュメントWebサイトを刷新 (by @saket)
- [Gradleプラグイン] 未サポートのダイアレクトに関するエラーメッセージを改善 (by @veyndan)
- [IDE] ダイアレクトに基づいてファイルアイコンを動的に変更 (by @veyndan)
- [JDBCドライバー] javax.sql.DataSource から JdbcDriver コンストラクターを公開 (#1614)

### 修正
- [コンパイラー] テーブルに対するJavadocをサポートし、1つのファイルに複数のJavadocが存在する場合の問題を修正 (#1224)
- [コンパイラー] 合成列への値の挿入を有効化 (#1351)
- [コンパイラー] ディレクトリ名サニタイズの不整合を修正 (by @ZacSweers)
- [コンパイラー] 合成列が結合をまたいでもnull許容性を維持するように修正 (#1656)
- [コンパイラー] delete文をdeleteキーワードに固定 (#1643)
- [コンパイラー] クォート処理を修正 (#1525 by @angusholder)
- [コンパイラー] between演算子が適切に式を再帰処理するように修正 (#1279)
- [コンパイラー] インデックス作成時にテーブル/列が存在しない場合のより適切なエラーを表示 (#1372)
- [コンパイラー] 結合制約で外部クエリの射影を使用できるように修正 (#1346)
- [Nativeドライバー] execute で transationPool を使用するように修正 (by @benasher44)
- [JDBCドライバー] SQLiteの代わりにJDBCトランザクションAPIを使用するように修正 (#1693)
- [IDE] virtualFile 参照が常に元のファイルになるように修正 (#1782)
- [IDE] Bugsnagへのエラー報告時に正しいThrowableを使用するように修正 (#1262)
- [Paging拡張] DataSource のリークを修正 (#1628)
- [Gradleプラグイン] スキーマ生成時に出力先dbファイルが既に存在する場合は削除するように修正 (#1645)
- [Gradleプラグイン] バージョンに欠番がある場合にマイグレーション検証を失敗させるように修正
- [Gradleプラグイン] 設定したファイルインデックスを明示的に使用するように修正 (#1644)

## [1.3.0] - 2020-04-03 {id="1-3-0-2020-04-03"}
[1.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.3.0

* 新機能: [Gradle] コンパイル対象のSQLダイアレクトを指定する dialect プロパティ。
* 新機能: [コンパイラー] #1009 MySQLダイアレクトの実験的サポート。
* 新機能: [コンパイラー] #1436 sqlite:3.24 ダイアレクトおよび upsert のサポート。
* 新機能: [JDBCドライバー] SQLite JVMドライバーからJDBCドライバーを分離。
* 修正: [コンパイラー] #1199 任意の長さのラムダをサポート。
* 修正: [コンパイラー] #1610 avg() の戻り値の型がnullableになるように修正。
* 修正: [IntelliJ] #1594 Windows上でGotoおよびFind Usagesを破損させていたパス区切り文字の処理を修正。

## [1.2.2] - 2020-01-22 {id="1-2-2-2020-01-22"}
[1.2.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.2

* 新機能: [ランタイム] Windows (mingW)、tvOS、watchOS、macOSアーキテクチャのサポート。
* 修正: [コンパイラー] sum() の戻り値の型がnullableになるように修正。
* 修正: [Paging] 競合状態を避けるため、QueryDataSourceFactory に Transacter を渡すように修正。
* 修正: [IntelliJプラグイン] ファイルのパッケージ名を検索する際に依存関係内を検索しないように修正。
* 修正: [Gradle] #862 Gradle内のバリデーターログをdebugレベルに変更。
* 改善: [Gradle] GenerateSchemaTask をGradleワーカーを使用するように変換。
* 備考: sqldelight-runtime アーティファクトの名前を runtime に変更。

## [1.2.1] - 2019-12-11 {id="1-2-1-2019-12-11"}
[1.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.1

* 修正: [Gradle] Kotlin Native 1.3.60 のサポート。
* 修正: [Gradle] #1287 同期時の警告を修正。
* 修正: [コンパイラー] #1469 クエリ用の SynetheticAccessor 作成を修正。
* 修正: [JVMドライバー] メモリリークを修正。
* 備考: coroutine拡張アーティファクトを使用するには、buildscriptにkotlinxのbintray mavenリポジトリを追加する必要があります。

## [1.2.0] - 2019-08-30 {id="1-2-0-2019-08-30"}
[1.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.0

* 新機能: [ランタイム] 安定版の Flow API。
* 修正: [Gradle] Kotlin Native 1.3.50 のサポート。
* 修正: [Gradle] #1380 クリーンビルドが失敗することがある問題を修正。
* 修正: [Gradle] #1348 verifyタスク実行時に「Could not retrieve functions」と出力される問題を修正。
* 修正: [コンパイル] #1405 クエリにFTSテーブルの結合が含まれている場合にプロジェクトをビルドできない問題を修正。
* 修正: [Gradle] #1266 複数のデータベースモジュールがある場合に散発的にGradleビルドが失敗する問題を修正。

## [1.1.4] - 2019-07-11 {id="1-1-4-2019-07-11"}
[1.1.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.4

* 新機能: [ランタイム] 実験的なKotlin Flow API。
* 修正: [Gradle] Kotlin/Native 1.3.40 互換性。
* 修正: [Gradle] #1243 Gradleのconfigure on demandとSQLDelightを併用した際の問題を修正。
* 修正: [Gradle] #1385 インクリメンタルアノテーション処理とSQLDelightを併用した際の問題を修正。
* 修正: [Gradle] Gradleタスクのキャッシュを許可。
* 修正: [Gradle] #1274 Kotlin DSLでsqldelight拡張を使用できるように修正。
* 修正: [コンパイラー] クエリごとに一意のIDが決定論的に生成されるように修正。
* 修正: [コンパイラー] トランザクション完了時にのみリスニング中のクエリに通知するように修正。
* 修正: [JVMドライバー] #1370 JdbcSqliteDriver の利用者にDB URLの指定を強制するように変更。

## [1.1.3] - 2019-04-14 {id="1-1-3-2019-04-14"}
[1.1.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.3

* Gradle Metadata 1.0 リリース。

## [1.1.2] - 2019-04-14 {id="1-1-2-2019-04-14"}
[1.1.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.2

* 新機能: [ランタイム] #1267 ロギングドライバーデコレーター。
* 修正: [コンパイラー] #1254 2^16文字を超える文字列リテラルを分割するように修正。
* 修正: [Gradle] #1260 マルチプラットフォームプロジェクトにおいて、生成されたソースがiOSソースとして認識される問題を修正。
* 修正: [IDE] #1290 CopyAsSqliteAction.kt:43 での kotlin.KotlinNullPointerException を修正。
* 修正: [Gradle] #1268 最近のバージョンで linkDebugFrameworkIos* タスクの実行が失敗する問題を修正。

## [1.1.1] - 2019-03-01 {id="1-1-1-2019-03-01"}
[1.1.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.1

* 修正: [Gradle] Androidプロジェクトでのモジュール依存関係コンパイルを修正。
* 修正: [Gradle] #1246 afterEvaluate 内でAPI依存関係をセットアップするように修正。
* 修正: [コンパイラー] 配列型が適切に出力されるように修正。

## [1.1.0] - 2019-02-27 {id="1-1-0-2019-02-27"}
[1.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.0

* 新機能: [Gradle] #502 スキーマモジュールの依存関係の指定を許可。
* 改善: [コンパイラー] #1111 テーブルエラーが他のエラーよりも前にソートされるように改善。
* 修正: [コンパイラー] #1225 REALリテラルに対して正しい型を返すように修正。
* 修正: [コンパイラー] #1218 docid がトリガーを経由して伝播するように修正。

## [1.0.3] - 2019-01-30 {id="1-0-3-2019-01-30"}
[1.0.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.3

* 改善: [ランタイム] #1195 ネイティブドライバー/ランタイムの Arm32 サポート。
* 改善: [ランタイム] #1190 Query 型からマッパーを公開。

## [1.0.2] - 2019-01-26 {id="1-0-2-2019-01-26"}
[1.0.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.2

* 修正: [Gradleプラグイン] Kotlin 1.3.20 に更新。
* 修正: [ランタイム] トランザクションが例外をもみ消さないように修正。

## [1.0.1] - 2019-01-21 {id="1-0-1-2019-01-21"}
[1.0.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.1

* 改善: [Nativeドライバー] DatabaseConfiguration にディレクトリ名を渡せるように改善。
* 改善: [コンパイラー] #1173 パッケージのないファイルでコンパイルを失敗させるように改善。
* 修正: [IDE] IDEエラーをSquareに適切に報告するように修正。
* 修正: [IDE] #1162 同一パッケージ内の型がエラー表示されるが正常に動作する問題を修正。
* 修正: [IDE] #1166 テーブルのリネームが NPE で失敗する問題を修正。
* 修正: [コンパイラー] #1167 UNIONとSELECTを含む複雑なSQL文をパースしようとすると例外をスローする問題を修正。

## [1.0.0] - 2019-01-08 {id="1-0-0-2019-01-08"}
[1.0.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.0

* 新機能: 生成コードを全面的に刷新し、Kotlinコードを生成するように変更。
* 新機能: RxJava2拡張アーティファクト。
* 新機能: Android Paging拡張アーティファクト。
* 新機能: Kotlin Multiplatformのサポート。
* 新機能: Android、iOS、JVM SQLiteドライバーアーティファクト。
* 新機能: トランザクションAPI。

## [0.7.0] - 2018-02-12 {id="0-7-0-2018-02-12"}
[0.7.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.7.0

 * 新機能: 生成コードがSupport SQLiteライブラリのみを使用するように更新されました。すべてのクエリは生の文字列ではなくステートメントオブジェクトを生成するようになりました。
 * 新機能: IDE内でのステートメントの折りたたみ（folding）。
 * 新機能: Boolean型が自動的に処理されるようになりました。
 * 修正: 非推奨のマーシャルをコード生成から削除。
 * 修正: 'avg' SQL関数の型マッピングを REAL に修正。
 * 修正: 'julianday' SQL関数を正しく検出するように修正。

## [0.6.1] - 2017-03-22 {id="0-6-1-2017-03-22"}
[0.6.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.6.1

 * 新機能: 引数のないDelete、Update、Insert文に対してコンパイル済みステートメントを生成するように変更。
 * 修正: サブクエリで使用されるビュー内のUSING句がエラーにならないように修正。
 * 修正: 生成されたMapperにおける重複した型を削除。
 * 修正: 引数との比較を行う式内でサブクエリを使用できるように修正。

## [0.6.0] - 2017-03-06 {id="0-6-0-2017-03-06"}
[0.6.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.6.0

 * 新機能: Selectクエリを文字列定数の代わりに `SqlDelightStatement` ファクトリとして公開するように変更。
 * 新機能: クエリのJavaDocをステートメントおよびマッパーファクトリにコピーするように対応。
 * 新機能: ビュー名用の文字列定数を出力するように変更。
 * 修正: ファクトリを必要とするビューに対するクエリが、それらのファクトリを引数として正しく要求するように修正。
 * 修正: 挿入文の引数の数が指定された列数と一致しているかを検証するように修正。
 * 修正: where句で使用されるblobリテラルを正しくエンコードするように修正。
 * 本リリースにはGradle 3.3以降が必要です。

## [0.5.1] - 2016-10-24 {id="0-5-1-2016-10-24"}
[0.5.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.5.1

 * 新機能: コンパイル済みステートメントが抽象型を継承するように変更。
 * 修正: パラメーター内のプリミティブ型がnullableな場合はボクシングされるように修正。
 * 修正: バインド引数に必要なすべてのファクトリがファクトリメソッド内に存在するように修正。
 * 修正: エスケープされた列名が正しくマーシャリングされるように修正。

## [0.5.0] - 2016-10-19 {id="0-5-0-2016-10-19"}
[0.5.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.5.0

 * 新機能: SQLiteの引数をFactoryを通じてタイプセーフに渡せるように対応。
 * 新機能: IntelliJプラグインが `.sq` ファイルのフォーマットを実行するように対応。
 * 新機能: SQLiteのタイムスタンプリテラルをサポート。
 * 修正: パラメーター化された型をIntelliJ内でクリックしてジャンプできるように修正。
 * 修正: エスケープされた列名をCursorから取得した際にRuntimeExceptionをスローしないように修正。
 * 修正: 例外を出力しようとしてGradleプラグインがクラッシュしないように修正。

## [0.4.4] - 2016-07-20 {id="0-4-4-2016-07-20"}
[0.4.4]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.4

 * 新機能: 列のJava型としてのshort型のネイティブサポート。
 * 新機能: 生成されたマッパーおよびファクトリメソッドにJavadocを出力。
 * 修正: group_concat および nullif 関数が適切なnull許容性を持つように修正。
 * 修正: Android Studio 2.2-alpha との互換性。
 * 修正: WITH RECURSIVE がプラグインをクラッシュさせないように修正。

## [0.4.3] - 2016-07-07 {id="0-4-3-2016-07-07"}
[0.4.3]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.3

 * 新機能: コンパイルエラーからソースファイルへのリンクを追加。
 * 新機能: 右クリックしてSQLDelightコードを有効なSQLiteとしてコピーする機能を追加。
 * 新機能: 名前付きステートメントのJavadocが生成されたStringに表示されるように対応。
 * 修正: 生成されたビューモデルにnull許容性アノテーションを含めるように修正。
 * 修正: unionから生成されたコードが、すべての可能な列をサポートするために適切な型とnull許容性を持つように修正。
 * 修正: sum および round SQLite関数が生成コード内で適切な型を持つように修正。
 * 修正: CASTおよび内部selectのバグ修正。
 * 修正: CREATE TABLE 文内でのオートコンプリートを修正。
 * 修正: パッケージ内でSQLiteキーワードを使用できるように修正。

## [0.4.2] - 2016-06-16 {id="0-4-2-2016-06-16"}
[0.4.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.2

 * 新機能: Marshal をファクトリから作成できるように対応。
 * 修正: IntelliJプラグインが適切なジェネリクスの順序でファクトリメソッドを生成するように修正。
 * 修正: 関数名の大文字・小文字を区別しないように修正。

## [0.4.1] - 2016-06-14 {id="0-4-1-2016-06-14"}
[0.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.1

 * 修正: IntelliJプラグインが適切なジェネリクスの順序でクラスを生成するように修正。
 * 修正: 列定義の大文字・小文字を区別しないように修正。

## [0.4.0] - 2016-06-14 {id="0-4-0-2016-06-14"}
[0.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.0

 * 新機能: マッパーをテーブルごとではなくクエリごとに生成するように変更。
 * 新機能: `.sq` ファイル内でJava型をインポートできるように対応。
 * 新機能: SQLite関数を検証するように対応。
 * 修正: 重複したエラーを削除。
 * 修正: 大文字の列名およびJavaキーワードの列名でエラーが発生しないように修正。

## [0.3.2] - 2016-05-14 {id="0-3-2-2016-05-14"}
[0.3.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.2

 * 新機能: ビューおよびエイリアスに対するオートコンプリートおよび使用箇所の検索が機能するように対応。
 * 修正: コンパイル時検証で、select内で関数を使用できるように修正。
 * 修正: デフォルト値のみを宣言するinsert文のサポート。
 * 修正: SQLDelightを使用していないプロジェクトをインポートした際にプラグインがクラッシュしないように修正。

## [0.3.1] - 2016-04-27 {id="0-3-1-2016-04-27"}
[0.3.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.1

  * 修正: メソッド参照からの Illegal Access 実行時例外を回避するため、インターフェースの可視性を public に戻すよう修正。
  * 修正: 部分式（Subexpressions）が適切に評価されるように修正。

## [0.3.0] - 2016-04-26 {id="0-3-0-2016-04-26"}
[0.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.0

  * 新機能: 列定義でSQLiteの型を使用し、追加の 'AS' 制約によってJava型を指定できるように対応。
  * 新機能: IDEからバグレポートを送信できるように対応。
  * 修正: オートコンプリートが正常に機能するように修正。
  * 修正: `.sq` ファイル編集時にSQLDelightモデルファイルが更新されるように修正。
  * 削除: アタッチされたデータベース（Attached databases）のサポートを終了。

## [0.2.2] - 2016-03-07 {id="0-2-2-2016-03-07"}
[0.2.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.2

 * 新機能: insert、update、delete、index、trigger文で使用される列のコンパイル時検証。
 * 修正: ファイルの移動/作成時にIDEプラグインがクラッシュしないように修正。

## [0.2.1] - 2016-03-07 {id="0-2-1-2016-03-07"}
[0.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.1

 * 新機能: Ctrl+`/`（OSXではCmd+`/`）で選択した行のコメントを切り替えられるように対応。
 * 新機能: SQLクエリで使用される列のコンパイル時検証。
 * 修正: IDEとGradleプラグインの両方でWindowsパスをサポート。

## [0.2.0] - 2016-02-29 {id="0-2-0-2016-02-29"}
[0.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.0

 * 新機能: Marshal クラスにコピーコンストラクターを追加。
 * 新機能: Kotlin 1.0 正式版に更新。
 * 修正: 'sqldelight' フォルダ構造の問題を、ビルドを失敗させない方法で報告するように修正。
 * 修正: `table_name` という名前の列を禁止。生成される定数がテーブル名定数と競合するため。
 * 修正: `.sq` ファイルが開かれているかどうかにかかわらず、IDEプラグインが直ちにモデルクラスを生成するように修正。
 * 修正: IDEとGradleプラグインの両方でWindowsパスをサポート。

## [0.1.2] - 2016-02-13 {id="0-1-2-2016-02-13"}
[0.1.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.2

 * 修正: ほとんどのプロジェクトでGradleプラグインが使用できなくなっていたコードを削除。
 * 修正: Antlrランタイムに対する不足していたコンパイラー依存関係を追加。

## [0.1.1] - 2016-02-12 {id="0-1-1-2016-02-12"}
[0.1.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.1

 * 修正: Gradleプラグインが自身と同じバージョンのランタイムを確実に指すように修正。

## [0.1.0] - 2016-02-12 {id="0-1-0-2016-02-12"}
[0.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.0

初期リリース。