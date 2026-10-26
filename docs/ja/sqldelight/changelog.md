# チェンジログ

## 未リリース {id="unreleased"}

### 追加 {id="added"}

- 現時点ではなし！

### 変更 {id="changed"}

- 現時点ではなし！

### 修正 {id="fixed"}

- [Runtime] トランザクション終了時やロールバック後フック（post-rollback hook）も失敗した場合（例えば、SQLiteが独自にトランザクションをロールバックした後に `cannot rollback - no transaction is active` となる場合など）でも、トランザクション本体の例外を保持するようにしました。2つ目の例外は抑制された例外（suppressed exception）として追加され、Androidドライバーは `endTransaction()` が例外をスローした場合でも現在のトランザクションをクリアするようになりました (#6387 by @pyricau)

## [2.4.1] - 2026-10-06 {id="2-4-1-2026-10-06"}
[2.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.1

### 追加

- [Documentation] Android SQLiteトランザクションに関するドキュメントを追加 (#6381 by @griffio)

### 変更

- [Gradle Plugin] コード生成タスク全体でパースされた `.sq` ファイルをメモリ上に保持し、ガベージコレクション後に再パースされないようにしました。これにより、大規模プロジェクトでのコード生成が高速化される可能性があります (#6374 by @C2H6O)
- [IntelliJ Plugin] クラッシュレポートの送信先をカスタムBugsnagインスタンスからJetBrains Marketplaceに変更しました (#6376 by @JakeWharton)

### 修正

- [IntelliJ Plugin] IntelliJ APIの使用方法を変更し、プラグイン公開時の違反を修正 (#6366 #6368 by @griffio)

## [2.4.0] - 2026-09-17 {id="2-4-0-2026-09-17"}
[2.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0

### 追加
- [Native Driver] `inMemoryDriver` に `extendedConfig` パラメーターを追加 (#5539 by @GuilhE)
- [PostgreSQL Dialect] 暗黙的に定義されたシステム列のクエリサポートを追加 (#5834 by @griffio)
- [PostgreSQL Dialect] 配列リテラルの基本的なサポートを追加 (#5997 by @griffio)
- [PostgreSQL Dialect] LTREEの基本的なサポートを追加 (#5880 by @yesitskev @griffio)
- [MySQL Dialect] INET関数のサポートを追加 (#5072 by @mcxinyu)
- [PostgreSQL Dialect] ALTER INDEXのサポートを追加 (#6224 by @griffio)
- [SQLite Dialect] SQLite 3.44の集約関数DISTINCT、ORDER BY、FILTERのサポートを追加 (#6236 by @griffio)
- [SQLite Dialect] SQLite 3.37のSTRICTテーブルのサポートを追加 (#6230 by @griffio)
- [Gradle Plugin] `codegenExcludedColumns` を使用して生成モデルから列を除外するサポートを追加 (#6243 by @sokolikp)
- [Compiler] スキーマに `allTableNames` 関数を追加 (#6245 by @edenman)
- [PostgreSQL Dialect] ANY演算子のサポートを追加 (#6253 by @griffio)
- [SQLite Dialect] SQLite 3.39のRIGHT JOINおよびFULL JOINのサポートを追加 (#6273 by @griffio)
- [PostgreSQL Dialect] トリガー関数内での `RAISE` 文と `FOUND` 変数のサポートを追加 (#6297 by @griffio)

### 変更
- [PostgreSQL Dialect] arrayIntermediateTypeの可視性をpublicに変更 (#5835 by @griffio)
- [Gradle Plugin] より厳格なMigrationFileバージョニングを実装 (#5730 by @madisp)
- [Gradle Plugin] 最小サポートGradleバージョンを8.2.1に引き上げ (#6217 by @maxsav)
- [Gradle Plugin] Gradleの分離プロジェクト（isolated projects）をサポート (#6217 by @maxsav)
- [IntelliJ Plugin] 最小バージョンを2023.3 / Android Studio Jellyfishに変更

### 修正
- [Gradle Plugin] JDK 24+でコンパイラーワーカーから発生する `sun.misc.Unsafe` の非推奨警告を抑制 (#6321)
- [Compiler] 生成されたコードにおけるKotlinの余分な警告を抑制 (#6208 by @eyupcanakman)
- [Compiler] グループ化されていない集約結果セット内の他の列が常にnullableになるよう修正
- [PostgreSQL Dialect] coalesceおよびifnullのnull許容性（nullability）が正しく解決されるよう修正
- [PostgreSQL Dialect] PostgreSQLダイアレクトのIDE連携を修正
- [PostgreSQL Dialect] PostgreSQLダイアレクト用のIDEプラグインを改善 (#6209 by @griffio)
- [Intellij Plugin] IDEプラグインがすべてのダイアレクトでコード補完を実行できるように修正 (#6210 by @griffio)
- [Gradle Plugin] データベース検証タスク実行時の循環依存エラーを修正 (#6221 by @griffio)
- [Compiler] 複数行の更新に対するオプティミスティックロックを修正 (#6240 by @griffio)
- [Intellij Plugin] IDEA 2026.2でクラッシュを引き起こしていた非推奨APIを修正 (#6247 by @griffio)
- [Gradle Plugin] AGP 8.9から8.11において、Kotlinコンパイルで生成ソースが認識されない問題を修正
- [PostgreSQL Dialect] プリミティブバインド引数を使用するlowerおよびupper関数がデフォルトでTEXTになるよう修正 (#6262 by @griffio)
- [Compiler] アダプターを使用したデータクラスバインディングとnull許容性を変更するマイグレーションを伴う値の挿入を修正 (#6269 by griffio)
- [Compiler] null安全な演算子（ISおよびIS DISTINCT FROM）でnullableなバインド引数を使用するよう修正 (#6265 by @griffio)
- [Gradle Plugin] プロジェクト依存関係の解決にAGPのバリアント解決を使用 (#6217 by @maxsav)
- [Gradle Plugin] ビルド間でAGPバリアントのリストが異なる場合にgenerateDatabaseInterfaceでビルドキャッシュミスが発生する問題を修正
- [Gradle Plugin] データベースを設定せずにプラグインを適用した際のIDE同期クラッシュを修正 (#6088)
- [PostgreSQL Dialect] ネストされた関数呼び出しを使用する場合のJSON集約関数を修正 (#6281 by @griffio)
- [Paging3 Extension] 空のデータベースでKeyedQueryPagingSourceがクラッシュする問題を修正 (#6284 by @woods-marshes)
- [Compiler] `COALESCE` などのカプセル化関数とともに変更文（mutator statements）が使用された場合のJava型アダプターの問題を修正 (#6292 by @griffio)
- [Compiler] モジュール名が大文字で始まっている場合に、生成されるコードのパッケージ名も大文字になっていた問題を修正 (#6316 by @griffio)
- [PostgreSQL Dialect] 日付データ型の大文字・小文字を区別しないように修正 (#6328 by @griffio)
- [PostgreSQL Dialect] `string_agg` 関数がnullableになるよう修正 (#6340 by @griffio)
- [SQLite Dialect] `GROUP BY` を使用するSQLite 3.44集約関数を修正 (#6343 by @griffio)
- [Gradle Plugin] コンフィグレーション時（configuration time）のデータベース依存関係の解決を回避 (#6353 by @joshfriend)

## [2.4.0-rc2] - 2026-09-14 {id="2-4-0-rc2-2026-09-14"}
[2.4.0-rc2]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0-rc2

### 修正

- [PostgreSQL Dialect] `string_agg` 関数がnullableになるよう修正 (#6340 by @griffio)
- [SQLite Dialect] `GROUP BY` を使用するSQLite 3.44集約関数を修正 (#6343 by @griffio)
- [Gradle Plugin] コンフィグレーション時のデータベース依存関係の解決を回避 (#6353 by @joshfriend)

## [2.4.0-rc1] - 2026-09-01 {id="2-4-0-rc1-2026-09-01"}
[2.4.0-rc1]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0-rc1

### 追加
- [Native Driver] `inMemoryDriver` に `extendedConfig` パラメーターを追加 (#5539 by @GuilhE)
- [PostgreSQL Dialect] 暗黙的に定義されたシステム列のクエリサポートを追加 (#5834 by @griffio)
- [PostgreSQL Dialect] 配列リテラルの基本的なサポートを追加 (#5997 by @griffio)
- [PostgreSQL Dialect] LTREEの基本的なサポートを追加 (#5880 by @yesitskev @griffio)
- [MySQL Dialect] INET関数のサポートを追加 (#5072 by @mcxinyu)
- [PostgreSQL Dialect] ALTER INDEXのサポートを追加 (#6224 by @griffio)
- [SQLite Dialect] SQLite 3.44の集約関数DISTINCT、ORDER BY、FILTERのサポートを追加 (#6236 by @griffio)
- [SQLite Dialect] SQLite 3.37のSTRICTテーブルのサポートを追加 (#6230 by @griffio)
- [Gradle Plugin] `codegenExcludedColumns` を使用して生成モデルから列を除外するサポートを追加 (#6243 by @sokolikp)
- [Compiler] スキーマに `allTableNames` 関数を追加 (#6245 by @edenman)
- [PostgreSQL Dialect] ANY演算子のサポートを追加 (#6253 by @griffio)
- [SQLite Dialect] SQLite 3.39のRIGHT JOINおよびFULL JOINのサポートを追加 (#6273 by @griffio)
- [PostgreSQL Dialect] トリガー関数内での `RAISE` 文と `FOUND` 変数のサポートを追加 (#6297 by @griffio)

### 変更
- [PostgreSQL Dialect] arrayIntermediateTypeの可視性をpublicに変更 (#5835 by @griffio)
- [Gradle Plugin] より厳格なMigrationFileバージョニングを実装 (#5730 by @madisp)
- [Gradle Plugin] 最小サポートGradleバージョンを8.2.1に引き上げ (#6217 by @maxsav)
- [Gradle Plugin] Gradleの分離プロジェクトをサポート (#6217 by @maxsav)
- [IntelliJ Plugin] 最小バージョンを2023.3 / Android Studio Jellyfishに変更

### 修正
- [Gradle Plugin] JDK 24+でコンパイラーワーカーから発生する `sun.misc.Unsafe` の非推奨警告を抑制 (#6321)
- [Compiler] 生成されたコードにおけるKotlinの余分な警告を抑制 (#6208 by @eyupcanakman)
- [Compiler] グループ化されていない集約結果セット内の他の列が常にnullableになるよう修正
- [PostgreSQL Dialect] coalesceおよびifnullのnull許容性が正しく解決されるよう修正
- [PostgreSQL Dialect] PostgreSQLダイアレクトのIDE連携を修正
- [PostgreSQL Dialect] PostgreSQLダイアレクト用のIDEプラグインを改善 (#6209 by @griffio)
- [Intellij Plugin] IDEプラグインがすべてのダイアレクトでコード補完を実行できるように修正 (#6210 by @griffio)
- [Gradle Plugin] データベース検証タスク実行時の循環依存エラーを修正 (#6221 by @griffio)
- [Compiler] 複数行の更新に対するオプティミスティックロックを修正 (#6240 by @griffio)
- [Intellij Plugin] IDEA 2026.2でクラッシュを引き起こしていた非推奨APIを修正 (#6247 by @griffio)
- [Gradle Plugin] AGP 8.9から8.11において、Kotlinコンパイルで生成ソースが認識されない問題を修正
- [PostgreSQL Dialect] プリミティブバインド引数を使用するlowerおよびupper関数がデフォルトでTEXTになるよう修正 (#6262 by @griffio)
- [Compiler] アダプターを使用したデータクラスバインディングとnull許容性を変更するマイグレーションを伴う値の挿入を修正 (#6269 by griffio)
- [Compiler] null安全な演算子（ISおよびIS DISTINCT FROM）でnullableなバインド引数を使用するよう修正 (#6265 by @griffio)
- [Gradle Plugin] プロジェクト依存関係の解決にAGPのバリアント解決を使用 (#6217 by @maxsav)
- [Gradle Plugin] ビルド間でAGPバリアントのリストが異なる場合にgenerateDatabaseInterfaceでビルドキャッシュミスが発生する問題を修正
- [Gradle Plugin] データベースを設定せずにプラグインを適用した際のIDE同期クラッシュを修正 (#6088)
- [PostgreSQL Dialect] ネストされた関数呼び出しを使用する場合のJSON集約関数を修正 (#6281 by @griffio)
- [Paging3 Extension] 空のデータベースでKeyedQueryPagingSourceがクラッシュする問題を修正 (#6284 by @woods-marshes)
- [Compiler] `COALESCE` などのカプセル化関数とともに変更文が使用された場合のJava型アダプターの問題を修正 (#6292 by @griffio)
- [Compiler] モジュール名が大文字で始まっている場合に、生成されるコードのパッケージ名も大文字になっていた問題を修正 (#6316 by @griffio)
- [PostgreSQL Dialect] 日付データ型の大文字・小文字を区別しないように修正 (#6328 by @griffio)

## [2.3.2] - 2026-03-16 {id="2-3-2-2026-03-16"}
[2.3.2]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.2

### 追加
- [PostgreSQL Dialect] ALTER TABLE ALTER TYPE USING式のサポートを改善 (#6116 by @griffio)
- [PostgreSQL Dialect] DROP COLUMN IF EXISTSのサポートを追加 (#6112 by @griffio)
- [Gradle Plugin] SELECTのワイルドカード展開を無効化する `expandSelectStar` フラグを追加 (#5813 by @griffio)
- [MySQL Dialect] ウィンドウ関数のサポートを追加 (#6086 by @griffio)
- [Gradle Plugin] 開始スキーマバージョンが1以外かつ `verifyMigrations` がtrueの場合のビルド失敗を修正 (#6017 by @neilgmiller)
- [Gradle Plugin] `SqlDelightWorkerTask` の設定自由度を高め、Windows上での開発をサポートするようにデフォルト設定を更新 (#5215 by @MSDarwish2000)
- [SQLite Dialect] FTS5仮想テーブル内の合成列（synthesized columns）のサポートを追加 (#5986 by @watbe)
- [PostgreSQL Dialect] Postgresの行レベルセキュリティ（row level security）のサポートを追加 (#6087 by @shellderp)
- [PostgreSQL Dialect] FOR UPDATEを拡張し、OF table、NO KEY UPDATE、NO WAITをサポート (#6104 by @shellderp)
- [PostgreSQL Dialect] PostgisのPoint型および関連関数のサポート (#5602 by @vanniktech)
- [Runtime] トランザクションの `CoroutineContext` を制御する仕組みを提供する `SuspendingTransacter.TransactionDispatcher` を追加 (#5967 by @eygraber)
- [Gradle Plugin] Android Gradle Plugin 9.0の新しいDSLとの完全な互換性を確保 (#6140)
- [PostgreSQL Dialect] PostgreSQLのCREATE TABLEストレージパラメーターをサポート (#6148 by @griffio)
- [PostgreSQL Dialect] PostgreSQLの一意テーブル制約におけるnullableな結果列を修正 (#6167 by @griffio)

### 変更
- [Compiler] コンパイラーの出力型をjava.lang.Voidからkotlin.Nothingに変更 (#6099 by @griffio)
- [Compiler] パッケージ名にアンダースコアを使用できるように変更。以前はアンダースコアがサニタイズされ、予期しない挙動を引き起こしていました (#6027 by @BierDav)
- [Paging Extension] AndroidX Pagingへ切り替え (#5910 by @jeffdgr8)
- [Android Driver] AndroidのminSdkを23に引き上げ (#6141)
- [Paging Extension] paging 3.4.1にアップグレードし、X64 Appleターゲットを削除 (#6166)

### 修正
- [IntelliJ Plugin] VFSリフレッシュイベント中にEDT（イベントディスパッチスレッド）でファイルタイプ検出がブロックされることによるIDEのフリーズを修正
- [SQLite Dialect] JSONパス演算子使用時のSQLite 3.38コンパイルエラーを修正 (#6070 by @griffio)
- [SQLite Dialect] カスタム列タイプを使用する場合、group_concat関数にString型を使用するよう修正 (#6082 by @griffio)
- [Gradle Plugin] 複雑なスキーマで処理が停止するのを防ぐため、`VerifyMigrationTask` のパフォーマンスを改善 (#6073 by @Lightwood13)
- [Intellij Plugin] プラグインの初期化例外を修正し、非推奨メソッドを更新 (#6040 by @griffio)
- [Gradle Plugin] Android Gradle Pluginの内蔵Kotlinとの互換性を修正 (#6139)

## [2.3.1] - 2025-03-12 {id="2-3-1-2025-03-12"}
[2.3.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.1

リリースの失敗。2.3.2を使用してください！

## [2.3.0] - 2025-03-12 {id="2-3-0-2025-03-12"}
[2.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.0

リリースの失敗。2.3.2を使用してください！

## [2.2.1] - 2025-11-13 {id="2-2-1-2025-11-13"}
[2.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.2.1

### 追加
- [PostgreSQL Dialect] Postgresのnumeric/integer/bigintegerの型マッピングを修正 (#5994 by @griffio)
- [Compiler] CASTが必要な際にソースファイルの位置を含めるよう、コンパイラーのエラーメッセージを改善 (#5979 by @griffio)
- [PostgreSQL Dialect] PostgresのJSON演算子パス抽出のサポートを追加 (#5971 by @griffio)
- [SQLite Dialect] 共通テーブル式（CTE）を使用したMATERIALIZEDクエリプランナーヒントのSQLite 3.35サポートを追加 (#5961 by @griffio)
- [PostgreSQL Dialect] 共通テーブル式を使用したMATERIALIZEDクエリプランナーヒントのサポートを追加 (#5961 by @griffio)
- [PostgreSQL Dialect] PostgresのJSON集約FILTERのサポートを追加 (#5957 by @griffio)
- [PostgreSQL Dialect] PostgresのEnumサポートを追加 (#5935 by @griffio)
- [PostgreSQL Dialect] Postgresのトリガーに対する限定的なサポートを追加 (#5932 by @griffio)
- [PostgreSQL Dialect] SQL式がJSONとしてパース可能かどうかをチェックする述語を追加 (#5843 by @griffio)
- [PostgreSQL Dialect] PostgreSQLのComment On文に対する限定的なサポートを追加 (#5808 by @griffio)
- [MySQL Dialect] インデックス可視性オプションのサポートを追加 (#5785 by @orenkislev-faire)
- [PostgreSql Dialect] TSQUERYデータ型のサポートを追加 (#5779 by @griffio)
- [Gradle Plugin] モジュール追加時のバージョンカタログサポートを追加 (#5755 by @DRSchlaubi)

### 変更
- 開発中スナップショットの公開先が、Central Portal Snapshotsリポジトリ（https://central.sonatype.com/repository/maven-snapshots/）に変更されました。
- [Compiler] コンストラクター参照を使用して、デフォルトで生成されるクエリを簡素化 (#5814 by @jonapoul)

### 修正
- [Compiler] 共通テーブル式を含むViewを使用する際のスタックオーバーフローを修正 (#5928 by @griffio)
- [Gradle Plugin] 「New Connection」を追加するためにSqlDelightツールウィンドウを開いた際のクラッシュを修正 (#5906 by @griffio)
- [IntelliJ Plugin] copy-to-sqliteガターアクションにおけるスレッド関連のクラッシュを回避 (#5901 by @griffio)
- [IntelliJ Plugin] スキーマ文CREATE INDEXおよびCREATE VIEWを使用する際のPostgreSQLダイアレクトの修正 (#5772 by @griffio)
- [Compiler] 列参照時のFTSスタックオーバーフローを修正 (#5896 by @griffio)
- [Compiler] With Recursiveのスタックオーバーフローを修正 (#5892 by @griffio)
- [Compiler] Insert|Update|Delete Returning文に対する通知（Notify）を修正 (#5851 by @griffio)
- [Compiler] Longを返すトランザクションブロックの非同期結果型を修正 (#5836 by @griffio)
- [Compiler] SQLパラメーターのバインディング計算量をO(n²)からO(n)に最適化 (#5898 by @chenf7)
- [SQLite Dialect] SQLite 3.18で欠落していた関数を修正 (#5759 by @griffio)

## [2.2.0] - 2025-11-13 {id="2-2-0-2025-11-13"}
[2.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.2.0

一部のアーティファクトのみ公開されリリースに失敗しました。2.2.1を使用してください！

## [2.1.0] - 2025-05-16 {id="2-1-0-2025-05-16"}
[2.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.1.0

### 追加
- [WASM Driver] Web WorkerドライバーにwasmJsのサポートを追加 (#5534 by @IlyaGulya)
- [PostgreSQL Dialect] PostgreSQLの配列を行に展開するUnNestのサポート (#5673 by @griffio)
- [PostgreSQL Dialect] PostgreSQLのTSRANGE/TSTZRANGEのサポート (#5297 by @griffio)
- [PostgreSQL Dialect] PostgreSQLのRight Full Join (#5086 by @griffio)
- [PostgreSQL Dialect] PostgreSQLの時間型からのextract (#5273 by @griffio)
- [PostgreSQL Dialect] PostgreSQLの配列包含演算子 (#4933 by @griffio)
- [PostgreSQL Dialect] PostgreSQLの制約削除（drop constraint） (#5288 by @griffio)
- [PostgreSQL Dialect] PostgreSQLの型キャスト (#5089 by @griffio)
- [PostgreSQL Dialect] サブクエリに対するPostgreSQLのlateral join演算子 (#5122 by @griffio)
- [PostgreSQL Dialect] PostgreSQLのILIKE演算子 (#5330 by @griffio)
- [PostgreSQL Dialect] PostgreSQLのXML型 (#5331 by @griffio)
- [PostgreSQL Dialect] PostgreSQLのAT TIME ZONE (#5243 by @griffio)
- [PostgreSQL Dialect] PostgreSQLのorder by nullsのサポート (#5199 by @griffio)
- [PostgreSQL Dialect] PostgreSQLの現在日付/時刻関数のサポートを追加 (#5226 by @drewd)
- [PostgreSQL Dialect] PostgreSQLの正規表現演算子 (#5137 by @griffio)
- [PostgreSQL Dialect] brinおよびgistの追加 (#5059 by @griffio)
- [MySQL Dialect] MySQLダイアレクトにおけるRENAME INDEXのサポート (#5212 by @orenkislev-faire)
- [JSON Extension] JSONテーブル関数へのエイリアス追加 (#5372 by @griffio)

### 変更
- [Compiler] 生成されたクエリファイルが単純な更新文に対して行数を返すように変更 (#4578 by @MariusVolkhart)
- [Native Driver] DELETE、INSERT、およびUPDATE文に対してreadonlyフラグを変更するようNativeSqlDatabase.ktを更新 (#5680 by @griffio)
- [PostgreSQL Dialect] PgIntervalをStringに変更 (#5403 by @griffio)
- [PostgreSQL Dialect] PostgreSQL拡張機能を実装するためのSqlDelightモジュールをサポート (#5677 by @griffio)

### 修正
- [Compiler] 結果を伴うグループ化された文を実行する際にクエリリスナーへ通知するよう修正 (#5006 by @vitorhugods)
- [Compiler] SqlDelightModule型リゾルバーを修正 (#5625 by @griffio)
- [Compiler] 5501の挿入オブジェクトのエスケープされた列を修正 (#5503 by @griffio)
- [Compiler] 正しい行および文字位置でパスのリンクがクリック可能になるようエラーメッセージを改善 (#5604 by @vanniktech)
- [Compiler] 問題5298の修正：キーワードをテーブル名として使用できるように修正
- [Compiler] 名前付きexecuteを修正しテストを追加
- [Compiler] 初期化文をソートする際に外部キーツール制約を考慮するよう修正 (#5325 by @TheMrMilchmann)
- [Compiler] タブが含まれている場合にエラーの下線が正しく揃うよう調整 (#5224 by @drewd)
- [JDBC Driver] トランザクション終了時におけるconnectionManagerのメモリリークを修正
- [JDBC Driver] ドキュメントの記載通り、SQLiteのマイグレーションをトランザクション内で実行するように修正 (#5218 by @morki)
- [JDBC Driver] トランザクションのコミット/ロールバック後のコネクションリークを修正 (#5205 by @morki)
- [Gradle Plugin] `GenerateSchemaTask` の前に `DriverInitializer` を実行するよう修正 (#5562 by @nwagu)
- [Runtime] 実際のドライバーが非同期（Async）の場合にLogSqliteDriverで発生するクラッシュを修正 (#5723 by @edenman)
- [Runtime] StringBuilderのキャパシティを修正 (#5192 by @janbina)
- [PostgreSQL Dialect] PostgreSQLのcreate or replace viewを修正 (#5407 by @griffio)
- [PostgreSQL Dialect] PostgreSQLのto_jsonを修正 (#5606 by @griffio)
- [PostgreSQL Dialect] PostgreSQLの数値リゾルバーを修正 (#5399 by @griffio)
- [PostgreSQL Dialect] SQLiteのウィンドウ関数を修正 (#2799 by @griffio)
- [PostgreSQL Dialect] PostgreSQLのSELECT DISTINCT ONを修正 (#5345 by @griffio)
- [PostgreSQL Dialect] alter table add column if not existsを修正 (#5309 by @griffio)
- [PostgreSQL Dialect] PostgreSQLの非同期バインドパラメーターを修正 (#5313 by @griffio)
- [PostgreSQL Dialect] PostgreSQLのブールリテラルを修正 (#5262 by @griffio)
- [PostgreSQL Dialect] PostgreSQLのウィンドウ関数を修正 (#5155 by @griffio)
- [PostgreSQL Dialect] PostgreSQLのisNullおよびisNotNull型を修正 (#5173 by @griffio)
- [PostgreSQL Dialect] PostgreSQLのselect distinctを修正 (#5172 by @griffio)
- [Paging Extension] paging更新時の初回読み込みを修正 (#5615 by @evant)
- [Paging Extension] macOS nativeターゲットを追加 (#5324 by @vitorhugods)
- [IntelliJ Plugin] K2モードのサポート

## [2.0.2] - 2024-04-05 {id="2-0-2-2024-04-05"}
[2.0.2]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.2

### 追加
- [PostgreSQL Dialect] PostgreSQLのSTRING_AGG関数を追加 (#4950 by @anddani)
- [PostgreSQL Dialect] pgダイアレクトにSET文を追加 (#4927 by @de-luca)
- [PostgreSQL Dialect] PostgreSQLのalter columnシーケンスパラメーターを追加 (#4916 by @griffio)
- [PostgreSQL Dialect] insert文に対するPostgreSQLのalter column defaultのサポートを追加 (#4912 by @griffio)
- [PostgreSQL Dialect] PostgreSQLのalter sequenceおよびdrop sequenceを追加 (#4920 by @griffio)
- [PostgreSQL Dialect] Postgresの正規表現関数定義を追加 (#5025 by @MariusVolkhart)
- [PostgreSQL Dialect] GINの文法を追加 (#5027 by @griffio)

### 変更
- [IDE Plugin] 最小バージョンを2023.1 / Android Studio Iguanaに変更
- [Compiler] encapsulatingTypeで型のnull許容性をオーバーライドできるように変更 (#4882 by @eygraber)
- [Compiler] SELECT * の列名をインライン化
- [Gradle Plugin] processIsolationに切り替え (#5068 by @nwagu)
- [Android Runtime] AndroidのminSDKを21に引き上げ (#5094 by @hfhbd)
- [Drivers] ダイアレクト開発者向けにJDBC/R2DBCステートメントのメソッドをより多く公開 (#5098 by @hfhbd)

### 修正
- [PostgreSQL Dialect] PostgreSQLのalter table alter columnを修正 (#4868 by @griffio)
- [PostgreSQL Dialect] 4448のテーブルモデルのインポート不足を修正 (#4885 by @griffio)
- [PostgreSQL Dialect] 4932のPostgreSQLデフォルト制約関数を修正 (#4934 by @griffio)
- [PostgreSQL Dialect] マイグレーション中のalter table rename columnにおける4879のPostgreSQL ClassCastExceptionを修正 (#4880 by @griffio)
- [PostgreSQL Dialect] 4474のPostgreSQL create extensionを修正 (#4541 by @griffio)
- [PostgreSQL Dialect] 5018のPostgreSQL add Primary Key非null型を修正 (#5020 by @griffio)
- [PostgreSQL Dialect] 4703の集約式を修正 (#5071 by @griffio)
- [PostgreSQL Dialect] 5028のPostgreSQL JSONを修正 (#5030 by @griffio)
- [PostgreSQL Dialect] 5040のPostgreSQL JSON演算子を修正 (#5041 by @griffio)
- [PostgreSQL Dialect] 5040に対するJSON演算子のバインディングを修正 (#5100 by @griffio)
- [PostgreSQL Dialect] 5082のtsvectorを修正 (#5104 by @griffio)
- [PostgreSQL Dialect] PostgreSQLのUPDATE FROM文における5032の列隣接性問題を修正 (#5035 by @griffio)
- [SQLite Dialect] 4897のSQLite alter table rename columnを修正 (#4899 by @griffio)
- [IDE Plugin] エラーハンドラーのクラッシュを修正 (#4988 by @aperfilyev)
- [IDE Plugin] IDEA 2023.3でBugSnagの初期化に失敗する問題を修正 (by @aperfilyev)
- [IDE Plugin] プラグイン経由でIntelliJで `.sq` ファイルを開いたときのPluginExceptionを修正 (by @aperfilyev)
- [IDE Plugin] 既にプラグイン依存関係にあるため、IntelliJプラグインにKotlinライブラリをバンドルしないように修正 (#5126)
- [IDE Plugin] streamの代わりにextensions配列を使用 (#5127)

## [2.0.1] - 2023-12-01 {id="2-0-1-2023-12-01"}
[2.0.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.1

### 追加
- [Compiler] SELECT実行時の複数列式（multi-column-expr）のサポートを追加 (#4453 by @Adriel-M)
- [PostgreSQL Dialect] PostgreSQLのCREATE INDEX CONCURRENTLYのサポートを追加 (#4531 by @griffio)
- [PostgreSQL Dialect] PostgreSQLのCTE補助文（auxiliary statements）が相互参照できるように変更 (#4493 by @griffio)
- [PostgreSQL Dialect] 二項式およびsumに対するPostgreSQL型のサポートを追加 (#4539 by @Adriel-M)
- [PostgreSQL Dialect] PostgreSQLのSELECT DISTINCT ON構文のサポートを追加 (#4584 by @griffio)
- [PostgreSQL Dialect] SELECT文におけるPostgreSQL JSON関数のサポートを追加 (#4590 by @MariusVolkhart)
- [PostgreSQL Dialect] PostgreSQLのgenerate_series関数を追加 (#4717 by @griffio)
- [PostgreSQL Dialect] 追加のPostgres文字列関数定義を追加 (#4752 by @MariusVolkhart)
- [PostgreSQL Dialect] minおよびmax集約関数にDATE PostgreSQL型を追加 (#4816 by @anddani)
- [PostgreSQL Dialect] SqlBinaryExprにPostgreSQL時間型を追加 (#4657 by @griffio)
- [PostgreSQL Dialect] postgresダイアレクトにTRUNCATEを追加 (#4817 by @de-luca)
- [SQLite 3.35 Dialect] 順番に評価される複数のON CONFLICT句を許可 (#4551 by @griffio)
- [JDBC Driver] より快適なSQL編集のためのLanguageアノテーションを追加 (#4602 by @MariusVolkhart)
- [Native Driver] Native-driver: linuxArm64のサポートを追加 (#4792 by @hfhbd)
- [Android Driver] AndroidSqliteDriverにwindowSizeBytesパラメーターを追加 (#4804 by @BoD)
- [Paging3 Extension] 機能追加: OffsetQueryPagingSourceにinitialOffsetを追加 (#4802 by @MohamadJaara)

### 変更
- [Compiler] 適切な箇所でKotlin型を優先して使用 (#4517 by @eygraber)
- [Compiler] 値型での挿入時に常に列名を含めるように変更 (#4864)
- [PostgreSQL Dialect] PostgreSQLダイアレクトから実験的ステータスを削除 (#4443 by @hfhbd)
- [PostgreSQL Dialect] PostgreSQL型に関するドキュメントを更新 (#4569 by @MariusVolkhart)
- [R2DBC Driver] PostgreSQLにおける整数データ型処理のパフォーマンスを最適化 (#4588 by @MariusVolkhart)

### 削除 {id="removed"}
- [SQLite Javascript Driver] sqljs-driverを削除 (#4613, #4670 by @dellisd)

### 修正
- [Compiler] 戻り値がありパラメーターのないグループ化された文のコンパイルを修正 (#4699 by @griffio)
- [Compiler] SqlBinaryExprでの引数バインディングを修正 (#4604 by @griffio)
- [IDE Plugin] 設定されている場合はIDEAプロジェクトのJDKを使用 (#4689 by @griffio)
- [IDE Plugin] IDEA 2023.2以降における「Unknown element type: TYPE_NAME」エラーを修正 (#4727)
- [IDE Plugin] 2023.2との互換性に関する一部の問題を修正
- [Gradle Plugin] verifyMigrationTask Gradleタスクのドキュメントを修正 (#4713 by @joshfriend)
- [Gradle Plugin] データベース検証前にデータベースを生成するよう促すGradleタスクの出力メッセージを追加 (#4684 by @jingwei99)
- [PostgreSQL Dialect] PostgreSQLの列名変更が複数回行われた場合の挙動を修正 (#4566 by @griffio)
- [PostgreSQL Dialect] 4714のPostgreSQL alter column nullabilityを修正 (#4831 by @griffio)
- [PostgreSQL Dialect] 4837のalter table alter columnを修正 (#4846 by @griffio)
- [PostgreSQL Dialect] 4501のPostgreSQL sequenceを修正 (#4528 by @griffio)
- [SQLite Dialect] 列式でのJSON二項演算子の使用を許可 (#4776 by @eygraber)
- [SQLite Dialect] 同名の複数列が見つかった場合のUpdate Fromの誤検知を修正 (#4777 by @eygraber)
- [Native Driver] 名前付きインメモリデータベースをサポート (#4662 by @05nelsonm)
- [Native Driver] クエリリスナーコレクションのスレッド安全性を確保 (#4567 by @kpgalligan)
- [JDBC Driver] ConnectionManagerでの接続リークを修正 (#4589 by @MariusVolkhart)
- [JDBC Driver] ConnectionManagerタイプ選択時におけるJdbcSqliteDriverのURLパースを修正 (#4656 by @05nelsonm)

## [2.0.0] - 2023-07-26 {id="2-0-0-2023-07-26"}
[2.0.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0

### 追加
- [MySQL Dialect] MySQL: IF式でのtimestamp/bigintのサポート (#4329 by @shellderp)
- [MySQL Dialect] MySQL: nowの追加 (#4431 by @hfhbd)
- [Web Driver] NPMパッケージの公開を有効化 (#4364)
- [IDE Plugin] Gradle tooling接続が失敗した際にスタックトレースを表示できるように変更 (#4383)

### 変更
- [Sqlite Driver] JdbcSqliteDriverでのスキーママイグレーションの使用を簡素化 (#3737 by @morki)
- [R2DBC Driver] 真の非同期R2DBCカーソルに対応 (#4387 by @hfhbd)

### 修正
- [IDE Plugin] 必要になるまでデータベースプロジェクトサービスをインスタンス化しないように修正 (#4382)
- [IDE Plugin] 使用箇所検索（find usages）時のプロセスキャンセルを処理 (#4340)
- [IDE Plugin] 非同期コードのIDE生成を修正 (#4406)
- [IDE Plugin] パッケージ構造の組み立てを一度だけ計算し、EDTから外すよう変更 (#4417)
- [IDE Plugin] 2023.2におけるKotlin型解決に正しいスタブインデックスキーを使用 (#4416)
- [IDE Plugin] 検索を実行する前にインデックスの準備ができるのを待つように修正 (#4419)
- [IDE Plugin] インデックスが利用できない場合は定義への移動（goto）を実行しないように修正 (#4420)
- [Compiler] グループ化された文の結果式を修正 (#4378)
- [Compiler] 仮想テーブルをインターフェース型として使用しないように修正 (#4427 by @hfhbd)

## [2.0.0-rc02] - 2023-06-27 {id="2-0-0-rc02-2023-06-27"}
[2.0.0-rc02]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-rc02

### 追加
- [MySQL Dialect] 小文字の日付型、および日付型に対するminとmaxのサポート (#4243 by @shellderp)
- [MySQL Dialect] 二項式およびsumに対するMySQL型のサポート (#4254 by @shellderp)
- [MySQL Dialect] 表示幅なしの符号なし整数のサポート (#4306 by @shellderp)
- [MySQL Dialect] LOCK IN SHARED MODEのサポート
- [PostgreSQL Dialect] minおよびmaxにbooleanとTimestampを追加 (#4245 by @griffio)
- [PostgreSQL Dialect] Postgres: ウィンドウ関数のサポートを追加 (#4283 by @hfhbd)
- [Runtime] runtimeにlinuxArm64、androidNative、watchosDeviceArmターゲットを追加 (#4258 by @hfhbd)
- [Paging Extension] paging extensionにlinuxおよびmingw x64ターゲットを追加 (#4280 by @chippman)

### 変更
- [Gradle Plugin] Android API 34の自動ダイアレクトサポートを追加 (#4251)
- [Paging Extension] QueryPagingSourceでSuspendingTransacterのサポートを追加 (#4292 by @daio)
- [Runtime] addListener APIを改善 (#4244 by @hfhbd)
- [Runtime] マイグレーションバージョンとしてLongを使用 (#4297 by @hfhbd)

### 修正
- [Gradle Plugin] 生成ソースに対して安定した出力パスを使用 (#4269 by @joshfriend)
- [Gradle Plugin] Gradle関連の調整 (#4222 by @3flex)

## [2.0.0-rc01] - 2023-05-29 {id="2-0-0-rc01-2023-05-29"}
[2.0.0-rc01]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-rc01

### 追加
- [Paging] paging extensionsにjs browserターゲットを追加 (#3843 by @sproctor)
- [Paging] androidx-paging3 extensionにiosSimulatorArm64ターゲットを追加 (#4117)
- [PostgreSQL Dialect] gen_random_uuid()のサポートとテストを追加 (#3855 by @davidwheeler123)
- [PostgreSQL Dialect] PostgreSQLのAlter table add constraint (#4116 by @griffio)
- [PostgreSQL Dialect] Alter table add constraint check (#4120 by @griffio)
- [PostgreSQL Dialect] PostgreSQLの文字長関数を追加 (#4121 by @griffio)
- [PostgreSQL Dialect] PostgreSQLの列デフォルトintervalを追加 (#4142 by @griffio)
- [PostgreSQL Dialect] PostgreSQLのinterval列結果を追加 (#4152 by @griffio)
- [PostgreSQL Dialect] PostgreSQLのAlter Columnを追加 (#4165 by @griffio)
- [PostgreSQL Dialect] PostgreSQL: date_partを追加 (#4198 by @hfhbd)
- [MySQL Dialect] SQL文字長関数を追加 (#4134 by @griffio)
- [IDE Plugin] sqldelightディレクトリ候補のサジェストを追加 (#3976 by @aperfilyev)
- [IDE Plugin] プロジェクトツリー内の中間パッケージをコンパクト表示 (#3992 by @aperfilyev)
- [IDE Plugin] JOIN句の補完を追加 (#4086 by @aperfilyev)
- [IDE Plugin] ビュー作成のインテンションとライブテンプレートを追加 (#4074 by @aperfilyev)
- [IDE Plugin] DELETEまたはUPDATE内のWHERE欠落に関する警告を追加 (#4058 by @aperfilyev)
- [Gradle Plugin] 型安全なプロジェクトアクセサー（typesafe project accessors）を有効化 (#4005 by @hfhbd)

### 変更
- [Gradle Plugin] ServiceLoaderメカニズムを使用してVerifyMigrationTaskのDriverInitializerを登録できるように変更 (#3986 by @C2H6O)
- [Gradle Plugin] 明示的なコンパイラー環境を作成 (#4079 by @hfhbd)
- [JS Driver] Web Workerドライバーを別アーティファクトに分割
- [JS Driver] JsWorkerSqlCursorを外部に公開しないように変更 (#3874 by @hfhbd)
- [JS Driver] sqljsドライバーの公開を無効化 (#4108)
- [Runtime] 同期ドライバーが同期スキーマ初期化子を必要とするよう強制 (#4013)
- [Runtime] Cursorの非同期サポートを改善 (#4102)
- [Runtime] 非推奨となったターゲットを削除 (#4149 by @hfhbd)
- [Runtime] 古いメモリモデル（MM）のサポートを削除 (#4148 by @hfhbd)

### 修正
- [R2DBC Driver] R2DBC: ドライバーのクローズを待機するように修正 (#4139 by @hfhbd)
- [Compiler] データベースのcreate(SqlDriver)にマイグレーションのPRAGMAを含めるよう修正 (#3845 by @MariusVolkhart)
- [Compiler] RETURNING句のコード生成を修正 (#3872 by @MariusVolkhart)
- [Compiler] 仮想テーブルの型を生成しないように修正 (#4015)
- [Gradle Plugin] Gradleプラグインの軽微な使い勝手の改善 (#3930 by @zacsweers)
- [IDE Plugin] 未解決のKotlin型を修正 (#3924 by @aperfilyev)
- [IDE Plugin] ワイルドカード展開インテンションが修飾子（qualifier）とともに動作するよう修正 (#3979 by @aperfilyev)
- [IDE Plugin] java homeが存在しない場合は利用可能なJDKを使用 (#3925 by @aperfilyev)
- [IDE Plugin] パッケージ名に対する使用箇所の検索を修正 (#4010)
- [IDE Plugin] 無効な要素に対して自動インポートを表示しないように修正 (#4008)
- [IDE Plugin] ダイアレクトが見つからない場合は解決しないように修正 (#4009)
- [IDE Plugin] 無効化された状態（invalidated state）でのIDEによるコンパイラー実行を無視 (#4016)
- [IDE Plugin] IntelliJ 2023.1のサポートを追加 (#4037 by @madisp)
- [IDE Plugin] 列名変更時に名前付き引数の使用箇所もリネームされるよう修正 (#4027 by @aperfilyev)
- [IDE Plugin] マイグレーション追加ポップアップを修正 (#4105 by @aperfilyev)
- [IDE Plugin] マイグレーションファイル内でSchemaNeedsMigrationInspectionを無効化 (#4106 by @aperfilyev)
- [IDE Plugin] マイグレーション生成に型名ではなくSQL列名を使用するよう修正 (#4112 by @aperfilyev)

## [2.0.0-alpha05] - 2023-01-20 {id="2-0-0-alpha05-2023-01-20"}
[2.0.0-alpha05]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha05

### 追加
- [Paging] マルチプラットフォームPaging拡張機能 (by @jeffdgr8)
- [Runtime] Listenerインターフェースにfun修飾子を追加
- [SQLite Dialect] SQLite 3.33のサポート（UPDATE FROM）を追加 (by @eygraber)
- [PostgreSQL Dialect] PostgreSQLでUPDATE FROMをサポート (by @eygraber)

### 変更
- [RDBC Driver] コネクションを公開 (by @hfhbd)
- [Runtime] マイグレーションのコールバックをメインの `migrate` 関数内に移動
- [Gradle Plugin] 下流プロジェクトからConfigurationを非表示化
- [Gradle Plugin] IntelliJのみをshade化 (by @hfhbd)
- [Gradle Plugin] Kotlin 1.8.0-Betaをサポートし、複数バージョンのKotlinテストを追加 (by @hfhbd)

### 修正
- [RDBC Driver] 代わりにjavaObjectTypeを使用 (by @hfhbd)
- [RDBC Driver] bindStatementでのプリミティブnull値を修正 (by @hfhbd)
- [RDBC Driver] R2DBC 1.0をサポート (by @hfhbd)
- [PostgreSQL Dialect] Postgres: 型パラメーターのないArrayを修正 (by @hfhbd)
- [IDE Plugin] IntelliJを221.6008.13に引き上げ (by @hfhbd)
- [Compiler] ピュアなビューから再帰的な元のテーブルを解決 (by @hfhbd)
- [Compiler] テーブルの外部キー句から値クラス（value classes）を使用 (by @hfhbd)
- [Compiler] 括弧なしのバインド式をサポートするようSelectQueryGeneratorを修正 (by @bellatoris)
- [Compiler] トランザクション使用時に `${name}Indexes` 変数が重複して生成される問題を修正 (by @sachera)

## [1.5.5] - 2023-01-20 {id="1-5-5-2023-01-20"}
[1.5.5]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.5

Kotlin 1.8およびIntelliJ 2021+との互換性リリースであり、JDK 17をサポートしています。

## [1.5.4] - 2022-10-06 {id="1-5-4-2022-10-06"}
[1.5.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.4

Kotlin 1.7.20およびAGP 7.3.0との互換性アップデートです。

## [2.0.0-alpha04] - 2022-10-03 {id="2-0-0-alpha04-2022-10-03"}
[2.0.0-alpha04]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha04

### 破壊的変更 {id="breaking-changes"}

- Paging 3拡張機能のAPIが変更され、countにはint型のみが許可されるようになりました。
- coroutines拡張機能で、ディスパッチャーのデフォルト適用がなくなり、明示的な受け渡しが必須となりました。
- DialectクラスおよびDriverクラスがfinalになりました。代わりに委譲（delegation）を使用してください。

### 追加
- [HSQL Dialect] Hsql: Insert内の生成列でDEFAULTの使用をサポート (#3372 by @hfhbd)
- [PostgreSQL Dialect] PostgreSQL: INSERT内の生成列でDEFAULTの使用をサポート (#3373 by @hfhbd)
- [PostgreSQL Dialect] PostgreSQLにNOW()を追加 (#3403 by @hfhbd)
- [PostgreSQL Dialect] PostgreSQLにNOT演算子を追加 (#3504 by @hfhbd)
- [Paging] *QueryPagingSourceへのCoroutineContextの受け渡しを許可 (#3384)
- [Gradle Plugin] ダイアレクトに対するバージョンカタログのサポートを改善 (#3435)
- [Native Driver] NativeSqliteDriverのDatabaseConfiguration作成にフックするためのコールバックを追加 (#3512 by @svenjacobs)

### 変更
- [Paging] KeyedQueryPagingSourceを基盤とするQueryPagingSource関数にデフォルトディスパッチャーを追加 (#3385)
- [Paging] OffsetQueryPagingSourceがIntのみで動作するように変更 (#3386)
- [Async Runtime] await* を上位クラスのExecutableQueryに移動 (#3524 by @hfhbd)
- [Coroutines Extensions] Flow拡張機能のデフォルトパラメーターを削除 (#3489)

### 修正
- [Gradle Plugin] Kotlin 1.7.20にアップデート (#3542 by @zacsweers)
- [R2DBC Driver] 常に値を送信するとは限らないR2DBCの変更に対応 (#3525 by @hfhbd)
- [HSQL Dialect] Hsql使用時にSQLiteのVerifyMigrationTaskが失敗する問題を修正 (#3380 by @hfhbd)
- [Gradle Plugin] タスクを遅延構成API（lazy configuration API）を使用するように変換 (by @3flex)
- [Gradle Plugin] Kotlin 1.7.20におけるNPEを回避 (#3398 by @ZacSweers)
- [Gradle Plugin] マイグレーション統合タスク（squash migrations task）の説明文を修正 (#3449)
- [IDE Plugin] より新しいKotlinプラグインでのNoSuchFieldErrorを修正 (#3422 by @madisp)
- [IDE Plugin] IDEA: UnusedQueryInspection - ArrayIndexOutOfBoundsExceptionを修正 (#3427 by @vanniktech)
- [IDE Plugin] 古いKotlinプラグインの参照にリフレクションを使用
- [Compiler] 拡張関数を持つカスタムダイアレクトでインポートが作成されない問題を修正 (#3338 by @hfhbd)
- [Compiler] `CodeBlock.of("${CodeBlock.toString()}")` のエスケープを修正 (#3340 by @hfhbd)
- [Compiler] マイグレーション内の非同期execute文を待機するように修正 (#3352)
- [Compiler] ASを修正 (#3370 by @hfhbd)
- [Compiler] `getObject` メソッドが実際の型の自動補完をサポート (#3401 by @robxyy)
- [Compiler] 非同期のグループ化されたreturning文に対するコード生成を修正 (#3411)
- [Compiler] 可能であればバインドパラメーターのKotlin型を推論し、不可能な場合はより分かりやすいエラーメッセージで失敗するように改善 (#3413 by @hfhbd)
- [Compiler] `ABS("foo")` を不許可に設定 (#3430 by @hfhbd)
- [Compiler] 他のパラメーターからのKotlin型推論をサポート (#3431 by @hfhbd)
- [Compiler] 常にデータベース実装を作成するように変更 (#3540 by @hfhbd)
- [Compiler] javaDocのチェックを緩和し、カスタムマッパー関数にも追加 (#3554 by @hfhbd)
- [Compiler] バインディング内のDEFAULTを修正 (by @hfhbd)
- [Paging] Paging 3を修正 (#3396)
- [Paging] Longを使用したOffsetQueryPagingSourceの構築を許可 (#3409)
- [Paging] Dispatchers.Mainを静的にスワップしないように修正 (#3428)

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
- `AfterVersionWithDriver` 型は削除され、常にドライバーを持つ `AfterVersion` に統合されました。
- `Schema` 型は `SqlDriver` のサブタイプではなくなりました。
- `PreparedStatement` APIは0始まりのインデックスで呼び出されるようになりました。

### 追加
- [IDE Plugin] 実行中のデータベースに対してSQLite、MySQL、およびPostgreSQLのコマンドを実行するサポートを追加 (#2718 by @aperfilyev)
- [IDE Plugin] Android Studioのデータベースインスペクターのサポートを追加 (#3107 by @aperfilyev)
- [Runtime] 非同期ドライバーのサポートを追加 (#3168 by @dellisd)
- [Native Driver] 新しいKotlin/Nativeメモリモデルをサポート (#3177 by @kpgalligan)
- [JS Driver] SqlJsワーカー用ドライバーを追加 (#3203 by @dellisd)
- [Gradle Plugin] SQLDelightタスクのクラスパスを公開
- [Gradle Plugin] マイグレーションを統合（squash）するためのGradleタスクを追加
- [Gradle Plugin] マイグレーションチェック中にスキーマ定義を無視するフラグを追加
- [MySQL Dialect] MySQLでのFOR SHAREおよびFOR UPDATEをサポート (#3098)
- [MySQL Dialect] MySQLのインデックスヒントをサポート (#3099)
- [PostgreSQL Dialect] date_truncを追加 (#3295 by @hfhbd)
- [JSON Extensions] JSONテーブル関数をサポート (#3090)

### 変更
- [Runtime] ドライバーを持たないAfterVersion型を削除 (#3091)
- [Runtime] Schema型をトップレベルに移動
- [Runtime] サードパーティの実装をサポートするため、dialectとresolverをopenに変更 (#3232 by @hfhbd)
- [Compiler] 失敗レポートにコンパイルに使用されたダイアレクトを含めるように変更 (#3086)
- [Compiler] 未使用のアダプターをスキップ (#3162 by @eygraber)
- [Compiler] PrepareStatementで0始まりのインデックスを使用 (#3269 by @hfhbd)
- [Gradle Plugin] ダイアレクトを文字列ではなく適切なGradle依存関係に変更 (#3085)
- [Gradle Plugin] Gradle Verify Task: データベースファイルが存在しない場合に例外をスロー (#3126 by @vanniktech)

### 修正
- [Gradle Plugin] Gradleプラグインの軽微なクリーンアップと調整 (#3171 by @3flex)
- [Gradle Plugin] 生成ディレクトリにAGPの文字列を使用しないように修正
- [Gradle Plugin] AGPのnamespace属性を使用 (#3220)
- [Gradle Plugin] kotlin-stdlibをGradleプラグインのランタイム依存関係に追加しないように修正 (#3245 by @mbonnin)
- [Gradle Plugin] マルチプラットフォーム設定を簡素化 (#3246 by @mbonnin)
- [Gradle Plugin] JSのみのプロジェクトをサポート (#3310 by @hfhbd)
- [IDE Plugin] Gradle tooling APIにjava homeを使用 (#3078)
- [IDE Plugin] IDEプラグイン内で正しいClassLoader上にJDBCドライバーをロード (#3080)
- [IDE Plugin] 既存のPSI変更中のエラーを防ぐため、無効化前にファイル要素をnullとしてマーク (#3082)
- [IDE Plugin] ALTER TABLE文で新しいテーブル名の使用箇所を検索する際にクラッシュしないよう修正 (#3106)
- [IDE Plugin] インスペクターを最適化し、予期される例外タイプに対してサイレントに失敗できるように変更 (#3121)
- [IDE Plugin] 生成ディレクトリであるべきファイルを削除 (#3198)
- [IDE Plugin] 安全でない演算子呼び出しを修正
- [Compiler] RETURNING文を伴うupdateおよびdeleteが確実にクエリを実行するように修正 (#3084)
- [Compiler] 複合selectにおける引数の型を正しく推論 (#3096)
- [Compiler] 共通テーブルはデータクラスを生成しないため、それらを返さないように修正 (#3097)
- [Compiler] 最上位のマイグレーションファイルをより迅速に見つけるよう改善 (#3108)
- [Compiler] パイプ演算子でnull許容性を適切に継承 (#3108)
- [Compiler] iif ANSI SQL関数をサポート
- [Compiler] 空のクエリファイルを生成しないように修正 (#3300 by @hfhbd)
- [Compiler] 疑問符のみのアダプターを修正 (#3314 by @hfhbd)
- [PostgreSQL Dialect] PostgreSQLの主キー列が常に非nullになるよう修正 (#3092)
- [PostgreSQL Dialect] 複数テーブルで同名の場合のcopyを修正 (#3297 by @hfhbd)
- [SQLite 3.35 Dialect] 変更されたテーブルからインデックス付きの列を削除する場合のみエラーを表示するよう修正 (#3158 by @eygraber)

## [2.0.0-alpha02] - 2022-04-13 {id="2-0-0-alpha02-2022-04-13"}
[2.0.0-alpha02]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha02

### 破壊的変更

- すべての `app.cash.sqldelight.runtime.rx` を `app.cash.sqldelight.rx2` に置き換える必要があります。

### 追加
- [Compiler] グループ化された文の末尾でのreturnをサポート
- [Compiler] ダイアレクトモジュールを介したコンパイラー拡張をサポートし、SQLite JSON拡張を追加 (#1379, #2087)
- [Compiler] 値を返すPRAGMA文をサポート (#1106)
- [Compiler] マークされた列に対する値型の生成をサポート
- [Compiler] オプティミスティックロックとバリデーションのサポートを追加 (#1952)
- [Compiler] 複数行の更新文をサポート
- [PostgreSQL] PostgreSQLのreturning文をサポート
- [PostgreSQL] PostgreSQLの日付型をサポート
- [PostgreSQL] PostgreSQLのintervalをサポート
- [PostgreSQL] PostgreSQLのブール値をサポートし、alter tableでのinsertを修正
- [PostgreSQL] PostgreSQLでのオプションのlimitをサポート
- [PostgreSQL] PostgreSQLのBYTEA型をサポート
- [PostgreSQL] PostgreSQLのserialに関するテストを追加
- [PostgreSQL] PostgreSQLのfor update構文をサポート
- [PostgreSQL] PostgreSQLの配列型をサポート
- [PostgreSQL] PostgreSQLでのUUID型を適切に保存/取得
- [PostgreSQL] PostgreSQLのNUMERIC型をサポート (#1882)
- [PostgreSQL] 共通テーブル式内でのクエリのreturningをサポート (#2471)
- [PostgreSQL] JSON固有の演算子をサポート
- [PostgreSQL] Postgres Copyを追加 (by @hfhbd)
- [MySQL] MySQL Replaceをサポート
- [MySQL] MySQLのNUMERIC/BigDecimal型をサポート (#2051)
- [MySQL] MySQLのtruncate文をサポート
- [MySQL] MySQLでのJSON固有の演算子をサポート (by @eygraber)
- [MySQL] MySQLのINTERVALをサポート (#2969 by @eygraber)
- [HSQL] HSQLのウィンドウ機能を追加
- [SQLite] WHERE内のnullableパラメーターに対する等価性チェックを置き換えないように修正 (#1490 by @eygraber)
- [SQLite] SQLite 3.35のreturning文をサポート (#1490 by @eygraber)
- [SQLite] GENERATED句をサポート
- [SQLite] SQLite 3.38ダイアレクトのサポートを追加 (by @eygraber)

### 変更
- [Compiler] 生成されるコードを整理
- [Compiler] グループ化された文でのテーブルパラメーターの使用を禁止 (#1822)
- [Compiler] グループ化されたクエリをトランザクション内に配置 (#2785)
- [Runtime] ドライバーのexecuteメソッドから更新された行数を返すように変更
- [Runtime] SqlCursorをコネクションにアクセスするクリティカルセクションに限定 (#2123 by @andersio)
- [Gradle Plugin] マイグレーション用にスキーマ定義を比較 (#841)
- [PostgreSQL] PostgreSQLでダブルクォーテーションを禁止
- [MySQL] MySQLでの `==` の使用に対してエラーを発生させるよう変更 (#2673)

### 修正
- [Compiler] 異なるテーブルの同一アダプター型が2.0 alphaでコンパイルエラーを引き起こす問題を修正
- [Compiler] upsert文のコンパイルに関する問題を修正 (#2791)
- [Compiler] 複数のマッチが存在する場合、クエリ結果がselect内のテーブルを使用するよう修正 (#1874, #2313)
- [Compiler] INSTEAD OFトリガーを持つビューの更新をサポート (#1018)
- [Compiler] 関数名におけるfromおよびforをサポート
- [Compiler] 関数式内でのSEPARATORキーワードを許可
- [Compiler] ORDER BY内でエイリアス化されたテーブルのROWIDにアクセスできない問題を修正
- [Compiler] MySQLのHAVING句でエイリアス列名が認識されない問題を修正
- [Compiler] 誤った「Multiple columns found」エラーを修正
- [Compiler] `PRAGMA locking_mode = EXCLUSIVE;` を設定できない問題を修正
- [PostgreSQL] PostgreSQLの列名変更を修正
- [MySQL] MySQLのUNIX_TIMESTAMP、TO_SECONDS、JSON_ARRAYAGG関数が認識されない問題を修正
- [SQLite] SQLiteのウィンドウ機能を修正
- [IDE Plugin] 空のプログレスインジケーター内でgotoハンドラーを実行 (#2990)
- [IDE Plugin] プロジェクトが構成されていない場合はハイライトビジターが実行されないように修正 (#2981, #2976)
- [IDE Plugin] 伝播して生成されるコードもIDE内で確実に更新されるように修正 (#1837)
- [IDE Plugin] ダイアレクト更新時にインデックスを無効化

## [2.0.0-alpha01] - 2022-03-31 {id="2-0-0-alpha01-2022-03-31"}
[2.0.0-alpha01]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha01

これは2.0の最初のアルファリリースであり、一部の破壊的変更が含まれています。今後さらなるABI破壊的変更が予定されているため、このリリースに依存するライブラリは公開しないでください（アプリケーションでの利用は問題ありません）。

### 破壊的変更

- まず、すべての `com.squareup.sqldelight` を `app.cash.sqldelight` に置き換える必要があります。
- 次に、すべての `app.cash.sqldelight.android` を `app.cash.sqldelight.driver.android` に置き換える必要があります。
- 3つ目に、すべての `app.cash.sqldelight.sqlite.driver` を `app.cash.sqldelight.driver.jdbc.sqlite` に置き換える必要があります。
- 4つ目に、すべての `app.cash.sqldelight.drivers.native` を `app.cash.sqldelight.driver.native` に置き換える必要があります。
- IDEプラグインは2.Xバージョンに更新する必要があります。[alphaまたはeapチャンネル](https://plugins.jetbrains.com/plugin/8191-sqldelight/versions/alpha)で入手できます。
- ダイアレクトはGradle内で指定可能な依存関係になりました：

```gradle
sqldelight {
  MyDatabase {
    packageName = "com.example"
    dialect = "app.cash.sqldelight:mysql-dialect:2.0.0-alpha01"
  }
}
```

現在サポートされているダイアレクトは、`mysql-dialect`、`postgresql-dialect`、`hsql-dialect`、`sqlite-3-18-dialect`、`sqlite-3-24-dialect`、`sqlite-3-25-dialect`、`sqlite-3-30-dialect`、`sqlite-3-35-dialect` です。

- プリミティブ型はインポートが必要になりました（例えば `INTEGER AS Boolean` の場合、`import kotlin.Boolean` が必要です）。以前サポートされていた一部の型にはアダプターが必要になります。ほとんどの変換用プリミティブアダプターは `app.cash.sqldelight:primitive-adapters:2.0.0-alpha01` で提供されています（`Integer AS kotlin.Int` に対する `IntColumnAdapter` など）。

### 追加
- [IDE Plugin] 基本的な推奨マイグレーション機能 (by @aperfilyev)
- [IDE Plugin] インポートヒントアクションを追加 (by @aperfilyev)
- [IDE Plugin] Kotlinクラスの補完を追加 (by @aperfilyev)
- [Gradle Plugin] Gradleの型安全なプロジェクトアクセサー用ショートカットを追加 (by @hfhbd)
- [Compiler] ダイアレクトに基づくコード生成のカスタマイズ (by @MariusVolkhart)
- [JDBC Driver] JdbcDriverに一般的な型を追加 (by @MariusVolkhart)
- [SQLite] SQLite 3.35のサポートを追加 (by @eygraber)
- [SQLite] ALTER TABLE DROP COLUMNのサポートを追加 (by @eygraber)
- [SQLite] SQLite 3.30ダイアレクトのサポートを追加 (by @eygraber)
- [SQLite] SQLiteでのNULLS FIRST/LASTをサポート (by @eygraber)
- [HSQL] generated句のHSQLサポートを追加 (by @MariusVolkhart)
- [HSQL] HSQLでの名前付きパラメーターのサポートを追加 (by @MariusVolkhart)
- [HSQL] HSQLのinsertクエリをカスタマイズ (by @MariusVolkhart)

### 変更
- [全体] パッケージ名がcom.squareup.sqldelightからapp.cash.sqldelightに変更されました。
- [Runtime] ダイアレクトをそれぞれ独立したGradleモジュールに移動
- [Runtime] ドライバー実装によるクエリ通知に切り替え
- [Runtime] デフォルトの列アダプターを別モジュールに抽出 (#2056, #2060)
- [Compiler] 各モジュールで再生成するのではなく、モジュール側でクエリ実装を生成するように変更
- [Compiler] 生成されたデータクラスのカスタムtoString生成を削除 (by @PaulWoitaschek)
- [JS Driver] sqljs-driverからsql.js依存関係を削除 (by @dellisd)
- [Paging] Android Paging 2拡張機能を削除
- [IDE Plugin] SQLDelight同期中のエディターバナーを追加 (#2511)
- [IDE Plugin] サポートされるIntelliJの最小バージョンを2021.1に変更

### 修正
- [Runtime] アロケーションとポインターチェイスを削減するため、リスナーリストをフラット化 (by @andersio)
- [IDE Plugin] エラー箇所へのジャンプを可能にするためエラーメッセージを修正 (by @hfhbd)
- [IDE Plugin] 不足していたインスペクションの説明を追加 (#2768 by @aperfilyev)
- [IDE Plugin] GotoDeclarationHandlerでの例外を修正 (#2531, #2688, #2804 by @aperfilyev)
- [IDE Plugin] importキーワードをハイライト表示 (by @aperfilyev)
- [IDE Plugin] 未解決のKotlin型を修正 (#1678 by @aperfilyev)
- [IDE Plugin] 未解決パッケージのハイライトを修正 (#2543 by @aperfilyev)
- [IDE Plugin] プロジェクトインデックスがまだ初期化されていない場合は不一致な列のインスペクションを行わないように修正
- [IDE Plugin] Gradle同期が発生するまでファイルインデックスを初期化しないように修正
- [IDE Plugin] Gradle同期が開始された場合はSQLDelightのインポートをキャンセル
- [IDE Plugin] 元に戻す（undo）アクションが実行されたスレッドの外部でデータベースを再生成
- [IDE Plugin] 参照を解決できない場合は空白のJava型を使用
- [IDE Plugin] ファイルパース中にメインスレッドから適切に退避し、書き込み時のみ戻るように修正
- [IDE Plugin] 古いIntelliJバージョンとの互換性を改善 (by @3flex)
- [IDE Plugin] より高速なアノテーションAPIを使用
- [Gradle Plugin] ランタイム追加時にJS/Androidプラグインを明示的にサポート (by @ZacSweers)
- [Gradle Plugin] マイグレーションからスキーマを導出することなくマイグレーション出力タスクを登録 (#2744 by @kevincianfarini)
- [Gradle Plugin] マイグレーションタスクがクラッシュした場合、実行中にクラッシュしたファイルを出力
- [Gradle Plugin] 出力の冪等性を確保するため、コード生成時にファイルをソート (by @ZacSweers)
- [Compiler] ファイルの反復処理により高速なAPIを使用し、PSIグラフ全体を探索しないように変更
- [Compiler] select関数のパラメーターにキーワードマングリングを追加 (#2759 by @aperfilyev)
- [Compiler] マイグレーションアダプターのpackageNameを修正 (by @hfhbd)
- [Compiler] 型ではなくプロパティにアノテーションを出力 (#2798 by @aperfilyev)
- [Compiler] Queryサブタイプに渡す前に引数をソート (#2379 by @aperfilyev)

## [1.5.3] - 2021-11-23 {id="1-5-3-2021-11-23"}
[1.5.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.3

### 追加
- [JDBC Driver] サードパーティのドライバー実装向けにJdbcDriverをopenに変更 (#2672 by @hfhbd)
- [MySQL Dialect] 時間増分用の欠落していた関数を追加 (#2671 by @sdoward)
- [Coroutines Extension] coroutines-extensionsにM1ターゲットを追加 (by @PhilipDukhov)

### 変更
- [Paging3 Extension] sqldelight-android-paging3をAARではなくJARとして配布 (#2634 by @julioromano)
- ソフトキーワードでもあるプロパティ名にアンダースコアのサフィックスが付加されるようになりました（例: `value` は `value_` として公開されます）。

### 修正
- [Compiler] 重複する配列パラメーターに対して変数を抽出しないように修正 (by @aperfilyev)
- [Gradle Plugin] `kotlin.mpp.enableCompatibilityMetadataVariant` を追加 (#2628 by @martinbonnin)
- [IDE Plugin] 使用箇所の検索処理にリード（Read）アクションを要求するように修正

## [1.5.2] - 2021-10-12 {id="1-5-2-2021-10-12"}
[1.5.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.2

### 追加
- [Gradle Plugin] HMPP（階層型マルチプラットフォームプロジェクト）のサポート (#2548 by @martinbonnin)
- [IDE Plugin] NULL比較のインスペクションを追加 (by @aperfilyev)
- [IDE Plugin] インスペクション抑制機能を追加 (#2519 by @aperfilyev)
- [IDE Plugin] 名前付きパラメーターと位置指定パラメーターの混在に関するインスペクションを追加 (by @aperfilyev)
- [SQLite Driver] mingwX86ターゲットを追加 (#2558 by @enginegl)
- [SQLite Driver] M1ターゲットを追加
- [SQLite Driver] linuxX64サポートを追加 (#2456 by @chippmann)
- [MySQL Dialect] MySQLにROW_COUNT関数を追加 (#2523)
- [PostgreSQL Dialect] PostgreSQLのrename、drop column (by @pabl0rg)
- [PostgreSQL Dialect] PostgreSQLの文法でCITEXTを認識できるよう修正
- [PostgreSQL Dialect] TIMESTAMP WITH TIME ZONEおよびTIMESTAMPTZを含めるよう修正
- [PostgreSQL Dialect] PostgreSQLのGENERATED列の文法を追加
- [Runtime] AfterVersionにパラメーターとしてSqlDriverを提供 (#2534, 2614 by @ahmedre)

### 変更
- [Gradle Plugin] Gradle 7.0を明示的に要求 (#2572 by @martinbonnin)
- [Gradle Plugin] VerifyMigrationTaskでGradleの最新チェック（up-to-date checks）をサポート (#2533 by @3flex)
- [IDE Plugin] nullable型と非null型を結合する際に「Join compares two columns of different types」の警告を出さないように変更 (#2550 by @pchmielowski)
- [IDE Plugin] 列型での小文字の 'as' に対するエラーメッセージを明確化 (by @aperfilyev)

### 修正
- [IDE Plugin] プロジェクトが既に破棄（dispose）されている場合は新しいダイアレクトで再パースしないように修正 (#2609)
- [IDE Plugin] 関連する仮想ファイルがnullの場合、モジュールをnullとして扱うよう修正 (#2607)
- [IDE Plugin] 未使用クエリのインスペクション中のクラッシュを回避 (#2610)
- [IDE Plugin] データベース同期の書き込みをライト（Write）アクション内で実行 (#2605)
- [IDE Plugin] SQLDelightの同期スケジュールをIDE側に委ねるよう変更
- [IDE Plugin] JavaTypeMixinでのNPEを修正 (#2603 by @aperfilyev)
- [IDE Plugin] MismatchJoinColumnInspectionでのIndexOutOfBoundsExceptionを修正 (#2602 by @aperfilyev)
- [IDE Plugin] UnusedColumnInspectionの説明を追加 (#2600 by @aperfilyev)
- [IDE Plugin] `PsiElement.generatedVirtualFiles` をリードアクションでラップ (#2599 by @aperfilyev)
- [IDE Plugin] 不要な非nullキャストを削除 (#2596)
- [IDE Plugin] 使用箇所検索でのnullを適切に処理 (#2595)
- [IDE Plugin] Android向けに生成されたファイルに対するIDEのオートコンプリートを修正 (#2573 by @martinbonnin)
- [IDE Plugin] SqlDelightGotoDeclarationHandlerでのNPEを修正 (by @aperfilyev)
- [IDE Plugin] insert文内の引数に含まれるKotlinキーワードをマングリング (by @aperfilyev)
- [IDE Plugin] SqlDelightFoldingBuilderでのNPEを修正 (#2382 by @aperfilyev)
- [IDE Plugin] CopyPasteProcessorでClassCastExceptionをキャッチ (by @aperfilyev)
- [IDE Plugin] updateライブテンプレートを修正 (by @IliasRedissi)
- [IDE Plugin] インテンションアクションに説明を追加 (#2489 by @aperfilyev)
- [IDE Plugin] テーブルが見つからない場合のCreateTriggerMixinの例外を修正 (by @aperfilyev)
- [Compiler] テーブル作成文をトポロジカルソート
- [Compiler] ディレクトリに対して `forDatabaseFiles` コールバックを呼び出すのを停止 (#2532)
- [Gradle Plugin] generateDatabaseInterfaceタスクの依存関係を潜在的なコンシューマーに伝播 (#2518 by @martinbonnin)

## [1.5.1] - 2021-07-16 {id="1-5-1-2021-07-16"}
[1.5.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.1

### 追加
- [PostgreSQL Dialect] PostgreSQLのJSONBおよびON Conflict Do Nothing (by @satook)
- [PostgreSQL Dialect] PostgreSQLのON CONFLICT (column, ...) DO UPDATEのサポートを追加 (by @satook)
- [MySQL Dialect] MySQLの生成列をサポート (by @JGulbronson)
- [Native Driver] watchosX64サポートを追加
- [IDE Plugin] パラメーターの型とアノテーションを追加 (by @aperfilyev)
- [IDE Plugin] 「select all」クエリを生成するアクションを追加 (by @aperfilyev)
- [IDE Plugin] オートコンプリートで列の型を表示 (by @aperfilyev)
- [IDE Plugin] オートコンプリートにアイコンを追加 (by @aperfilyev)
- [IDE Plugin] 「select by primary key」クエリを生成するアクションを追加 (by @aperfilyev)
- [IDE Plugin] 「insert into」クエリを生成するアクションを追加 (by @aperfilyev)
- [IDE Plugin] 列名、文識別子、関数名に対するハイライトを追加 (by @aperfilyev)
- [IDE Plugin] 残りのクエリ生成アクションを追加 (#489 by @aperfilyev)
- [IDE Plugin] insert文からのパラメーターヒントを表示 (by @aperfilyev)
- [IDE Plugin] テーブルエイリアスのインテンションアクション (by @aperfilyev)
- [IDE Plugin] 列名の完全修飾インテンション (by @aperfilyev)
- [IDE Plugin] Kotlinプロパティの宣言へのジャンプ（Go to declaration） (by @aperfilyev)

### 変更
- [Native Driver] 可能な限りフリーズや共有可能データ構造を回避することで、ネイティブトランザクションのパフォーマンスを改善 (by @andersio)
- [Paging 3] Paging3のバージョンを3.0.0安定版に引き上げ
- [JS Driver] sql.jsを1.5.0にアップグレード

### 修正
- [JDBC SQLite Driver] ThreadLocalをクリアする前に接続の `close()` を呼び出すよう修正 (#2444 by @hannesstruss)
- [RX extensions] 購読/破棄の競合リークを修正 (#2403 by @pyricau)
- [Coroutines extension] 通知前に確実にクエリリスナーを登録するよう修正
- [Compiler] Kotlinの出力ファイルを一貫させるためにnotifyQueriesをソート (by @thomascjy)
- [Compiler] selectクエリクラスのプロパティに `@JvmField` をアノテーションしないよう修正 (by @eygraber)
- [IDE Plugin] インポートオプティマイザーを修正 (#2350 by @aperfilyev)
- [IDE Plugin] 未使用列のインスペクションを修正 (by @aperfilyev)
- [IDE Plugin] インポートインスペクションとクラスアノテーターにネストされたクラスのサポートを追加 (by @aperfilyev)
- [IDE Plugin] CopyPasteProcessorでのNPEを修正 (#2363 by @aperfilyev)
- [IDE Plugin] InlayParameterHintsProviderでのクラッシュを修正 (#2359 by @aperfilyev)
- [IDE Plugin] create table文に任意のテキストをコピー＆ペーストした際に空白行が挿入される問題を修正 (#2431 by @aperfilyev)

## [1.5.0] - 2021-04-23 {id="1-5-0-2021-04-23"}
[1.5.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.0

### 追加
- [SQLite Javascript Driver] sqljs-driverの公開を有効化 (#1667 by @dellisd)
- [Paging3 Extension] Android Paging 3ライブラリ用拡張機能 (#1786 by @kevincianfarini)
- [MySQL Dialect] MySQLのON DUPLICATE KEY UPDATE競合解決のサポートを追加 (by @rharter)
- [SQLite Dialect] SQLiteのoffsets()に対するコンパイラーサポートを追加 (by @qjroberts)
- [IDE Plugin] 不明な型に対するインポートクイックフィックスを追加 (#683 by @aperfilyev)
- [IDE Plugin] 未使用インポートのインスペクションを追加 (#1161 by @aperfilyev)
- [IDE Plugin] 未使用クエリのインスペクションを追加 (by @aperfilyev)
- [IDE Plugin] 未使用列のインスペクションを追加 (#569 by @aperfilyev)
- [IDE Plugin] コピー＆ペースト時にインポートを自動的に追加 (#684 by @aperfilyev)
- [IDE Plugin] GradleとIntelliJプラグインのバージョン間に非互換性がある場合にバルーン通知を表示
- [IDE Plugin] Insert Into ... VALUES(?) のパラメーターヒント (#506 by @aperfilyev)
- [IDE Plugin] インラインパラメーターヒント (by @aperfilyev)
- [Runtime] コールバック付きでマイグレーションを実行するためのAPIをランタイムに追加 (#1844)

### 変更
- [Compiler] 「IS NOT NULL」クエリのスマートキャスト (#867)
- [Compiler] ランタイムで失敗するキーワードに対する保護 (#1471, #1629)
- [Gradle Plugin] Gradleプラグインのサイズを60MBから13MBに削減
- [Gradle Plugin] Androidバリアントを適切にサポートし、KMMターゲット固有のSQLサポートを削除 (#1039)
- [Gradle Plugin] minsdkに基づいて最小SQLiteバージョンを選択 (#1684)
- [Native Driver] ネイティブドライバーの接続プールとパフォーマンスの更新

### 修正
- [Compiler] ラムダ前のNBSP（ノーブレークスペース）を修正 (by @oldergod)
- [Compiler] 生成されたbind*およびcursor.get*文における互換性のない型を修正
- [Compiler] SQL句が適合された型を保持するように修正 (#2067)
- [Compiler] NULLキーワードのみの列はnullableになるよう修正
- [Compiler] 型アノテーション付きのマッパーラムダを生成しないように修正 (#1957)
- [Compiler] カスタムクエリが競合する場合、追加のパッケージサフィックスとしてファイル名を使用 (#1057, #1278)
- [Compiler] 外部キーのカスケードによって確実にクエリリスナーが通知されるよう修正 (#1325, #1485)
- [Compiler] 同じ型の2つをUNIONする場合、テーブル型を返すように修正 (#1342)
- [Compiler] ifnullおよびcoalesceへのパラメーターがnullableになるよう修正 (#1263)
- [Compiler] 式に対してクエリによって課されたnull許容性を正しく使用
- [MySQL Dialect] MySQLのIF文をサポート
- [PostgreSQL Dialect] PostgreSQLでNUMERICおよびDECIMALをDoubleとして取得 (#2118)
- [SQLite Dialect] UPSERT通知がBEFORE/AFTER UPDATEトリガーを考慮するように修正 (#2198 by @andersio)
- [SQLite Driver] インメモリでない限り、SqliteDriverでスレッドに対して複数の接続を使用 (#1832)
- [JDBC Driver] JDBCドライバーがautoCommitをtrueと想定していた問題を修正 (#2041)
- [JDBC Driver] 例外発生時に接続を確実にクローズするように修正 (#2306)
- [IDE Plugin] パス区切り文字のバグによりWindowsでGoToDeclaration/FindUsagesが機能しなかった問題を修正 (#2054 by @angusholder)
- [IDE Plugin] IDEでクラッシュする代わりにGradleエラーを無視するように変更
- [IDE Plugin] SQLDelightファイルが非SQLDelightモジュールに移動された場合、コード生成を試みないよう修正
- [IDE Plugin] IDEでのコード生成エラーを無視
- [IDE Plugin] 負のインデックスによるsubstringを試みないように修正 (#2068)
- [IDE Plugin] Gradleアクション実行前にプロジェクトが破棄されていないことを確認 (#2155)
- [IDE Plugin] nullable型に対する算術演算もnullableになるよう修正 (#1853)
- [IDE Plugin] 「expand * intention」が追加の射影（projections）と連携して機能するよう修正 (#2173 by @aperfilyev)
- [IDE Plugin] GoTo中にKotlinの解決に失敗した場合、SQLDelightファイルへのジャンプを試みないように修正
- [IDE Plugin] SQLDelightのインデックス作成中にIntelliJが例外に遭遇してもクラッシュしないよう修正
- [IDE Plugin] IDEでのコード生成前にエラーを検出する際に発生する例外を処理
- [IDE Plugin] IDEプラグインをDynamic Pluginsと互換性を持たせるよう対応 (#1536)
- [Gradle Plugin] WorkerApiを使用したデータベース生成における競合状態を修正 (#2062 by @stephanenicolas)
- [Gradle Plugin] classLoaderIsolationによってカスタムJDBCの使用が妨げられていた問題を修正 (#2048 by @benasher44)
- [Gradle Plugin] packageNameが見つからない場合のエラーメッセージを改善 (by @vanniktech)
- [Gradle Plugin] SQLDelightがIntelliJの依存関係をビルドスクリプトのクラスパスに漏出させていた問題を修正 (#1998)
- [Gradle Plugin] Gradleのビルドキャッシュを修正 (#2075)
- [Gradle Plugin] Gradleプラグインでkotlin-native-utilsに依存しないように修正 (by @ilmat192)
- [Gradle Plugin] マイグレーションファイルのみが存在する場合でもデータベースを書き出すように修正 (#2094)
- [Gradle Plugin] 最終的なコンパイルユニットでダイヤモンド依存関係が1回のみ取得されるように修正 (#1455)

また、本リリースでSQLDelightのインフラ改善に多大な貢献をしてくれた @3flex に感謝します。

## [1.4.4] - 2020-10-08 {id="1-4-4-2020-10-08"}
[1.4.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.4

### 追加
- [PostgreSQL Dialect] WITH内でのデータ変更文をサポート
- [PostgreSQL Dialect] substring関数をサポート
- [Gradle Plugin] SQLDelightコンパイル中のマイグレーション検証用としてverifyMigrationsフラグを追加 (#1872)

### 変更
- [Compiler] 非SQLiteダイアレクトにおいて、SQLite固有の関数を未知（unknown）としてフラグ付け
- [Gradle Plugin] sqldelightプラグインが適用されているにもかかわらずデータベースが設定されていない場合に警告を表示 (#1421)

### 修正
- [Compiler] ORDER BY句で列名をバインドする際にエラーを報告 (#1187 by @eygraber)
- [Compiler] データベースインターフェース生成時にレジストリ警告が表示される問題を修正 (#1792)
- [Compiler] case文に対する誤った型推論を修正 (#1811)
- [Compiler] バージョンのないマイグレーションファイルに対してより適切なエラーを表示 (#2006)
- [Compiler] 一部のデータベース型ColumnAdapterにおいて、マーシャリングに必要なデータベース型が正しくなかった問題を修正 (#2012)
- [Compiler] CASTのnull許容性を修正 (#1261)
- [Compiler] クエリラッパーにおける多数の名前シャドウイング警告を修正 (#1946 by @eygraber)
- [Compiler] 生成されたコードが完全修飾名を使用していた問題を修正 (#1939)
- [IDE Plugin] Gradle同期からSQLDelightコード生成をトリガー
- [IDE Plugin] `.sq` ファイル変更時にプラグインがデータベースインターフェースを再生成しない問題を修正 (#1945)
- [IDE Plugin] ファイルを新しいパッケージに移動する際の問題を修正 (#444)
- [IDE Plugin] カーソルの移動先がない場合はクラッシュせず何もしないように修正 (#1994)
- [IDE Plugin] Gradleプロジェクト外のファイルに対して空のパッケージ名を使用 (#1973)
- [IDE Plugin] 無効な型に対して適切に失敗するように修正 (#1943)
- [IDE Plugin] 未知の式に遭遇した際により適切なエラーメッセージをスロー (#1958)
- [Gradle Plugin] SQLDelightがIntelliJの依存関係をビルドスクリプトのクラスパスに漏出させていた問題を修正 (#1998)
- [Gradle Plugin] `*.sq` ファイルにメソッドドキュメントを追加した際の「JavadocIntegrationKt not found」コンパイルエラーを修正 (#1982)
- [Gradle Plugin] SqlDelight GradleプラグインがConfiguration Caching（CoCa）をサポートしていなかった問題を修正 (#1947 by @stephanenicolas)
- [SQLite JDBC Driver] SQLException: database in auto-commit mode を修正 (#1832)
- [Coroutines Extension] coroutines-extensionsのIRバックエンドを修正 (#1918 by @dellisd)

## [1.4.3] - 2020-09-04 {id="1-4-3-2020-09-04"}
[1.4.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.3

### 追加
- [MySQL Dialect] MySQLのlast_insert_id関数のサポートを追加 (by @lawkai)
- [PostgreSQL Dialect] SERIALデータ型をサポート (by @veyndan & @felipecsl)
- [PostgreSQL Dialect] PostgreSQLのRETURNINGをサポート (by @veyndan)

### 修正
- [MySQL Dialect] MySQLのAUTO_INCREMENTをデフォルト値を持つものとして処理 (#1823)
- [Compiler] Upsert文のコンパイラーエラーを修正 (#1809 by @eygraber)
- [Compiler] 無効なKotlinが生成される問題を修正 (#1925 by @eygraber)
- [Compiler] 未知の関数に対してより適切なエラーメッセージを表示 (#1843)
- [Compiler] instrの第2パラメーターの型としてStringを公開
- [IDE Plugin] IDEプラグインにおけるデーモンの肥大化とUIスレッドの停止を修正 (#1916)
- [IDE Plugin] モジュールがnullのシナリオを処理 (#1902)
- [IDE Plugin] 未設定のsqファイルにおいてパッケージ名に空文字列を返すよう修正 (#1920)
- [IDE Plugin] グループ化された文を修正し、統合テストを追加 (#1820)
- [IDE Plugin] 要素のモジュールを検索するために内蔵のModuleUtilを使用 (#1854)
- [IDE Plugin] 有効な要素のみをルックアップに追加 (#1909)
- [IDE Plugin] 親がnullになり得るケースを処理 (#1857)

## [1.4.2] - 2020-08-27 {id="1-4-2-2020-08-27"}
[1.4.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.2

### 追加
- [Runtime] 新しいJS IRバックエンドをサポート
- [Gradle Plugin] generateSqlDelightInterface Gradleタスクを追加 (by @vanniktech)
- [Gradle Plugin] verifySqlDelightMigration Gradleタスクを追加 (by @vanniktech)

### 修正
- [IDE Plugin] IDEとGradle間のデータ共有を促進するためにGradle tooling APIを使用
- [IDE Plugin] スキーマ導出のデフォルトをfalseに設定
- [IDE Plugin] commonMainソースセットを適切に取得
- [MySQL Dialect] mySqlFunctionType()にminuteを追加 (by @maaxgr)

## [1.4.1] - 2020-08-21 {id="1-4-1-2020-08-21"}
[1.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.1

### 追加
- [Runtime] Kotlin 1.4.0をサポート (#1859)

### 変更
- [Gradle Plugin] AGP依存関係をcompileOnlyに変更 (#1362)

### 修正
- [Compiler] 列定義ルールおよびテーブルインターフェースジェネレーターにオプションのJavadocを追加 (#1224 by @endanke)
- [SQLite Dialect] SQLite FTS5補助関数highlight、snippet、bm25のサポートを追加 (by @drampelt)
- [MySQL Dialect] MySQLのbitデータ型をサポート
- [MySQL Dialect] MySQLのバイナリリテラルをサポート
- [PostgreSQL Dialect] sql-psiからSERIALを公開 (by @veyndan)
- [PostgreSQL Dialect] BOOLEANデータ型を追加 (by @veyndan)
- [PostgreSQL Dialect] NULL列制約を追加 (by @veyndan)
- [HSQL Dialect] HSQLに `AUTO_INCREMENT` サポートを追加 (by @rharter)

## [1.4.0] - 2020-06-22 {id="1-4-0-2020-06-22"}
[1.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.0

### 追加
- [MySQL Dialect] MySQLサポート (by @JGulbronson & @veyndan)
- [PostgreSQL Dialect] 実験的なPostgreSQLサポート (by @veyndan)
- [HSQL Dialect] 実験的なH2サポート (by @MariusVolkhart)
- [SQLite Dialect] SQLite FTS5サポート (by @benasher44 & @jpalawaga)
- [SQLite Dialect] alter table rename columnをサポート (#1505 by @angusholder)
- [IDE] マイグレーション（`.sqm`）ファイルのIDEサポート
- [IDE] 組み込みのSQLライブテンプレートを模倣したSQLDelightライブテンプレートを追加 (#1154 by @veyndan)
- [IDE] 新規SqlDelightファイル作成アクションを追加 (#42 by @romtsn)
- [Runtime] 結果を返すトランザクション用のtransactionWithReturn API
- [Compiler] `.sq` ファイル内で複数のSQL文をグループ化する構文
- [Compiler] マイグレーションファイルからのスキーマ生成をサポート
- [Gradle Plugin] マイグレーションファイルを有効なSQLとして出力するタスクを追加

### 変更
- [Documentation] ドキュメントWebサイトの刷新 (by @saket)
- [Gradle Plugin] サポートされていないダイアレクトのエラーメッセージを改善 (by @veyndan)
- [IDE] ダイアレクトに基づいてファイルアイコンを動的に変更 (by @veyndan)
- [JDBC Driver] javax.sql.DataSourceからJdbcDriverコンストラクターを公開 (#1614)

### 修正
- [Compiler] テーブルでのJavadocをサポートし、1ファイル内の複数Javadocを修正 (#1224)
- [Compiler] 合成列への値の挿入を有効化 (#1351)
- [Compiler] ディレクトリ名サニタイズの不整合を修正 (by @ZacSweers)
- [Compiler] 合成列が結合（join）を越えてnull許容性を維持するよう修正 (#1656)
- [Compiler] delete文をdeleteキーワードに固定 (#1643)
- [Compiler] クォート処理を修正 (#1525 by @angusholder)
- [Compiler] between演算子が式に適切に再帰するよう修正 (#1279)
- [Compiler] インデックス作成時にテーブル/列が見つからない場合のエラー表示を改善 (#1372)
- [Compiler] 結合制約で外部クエリの射影を使用できるように変更 (#1346)
- [Native Driver] executeでtransationPoolを使用するように変更 (by @benasher44)
- [JDBC Driver] SQLiteの代わりにJDBCのトランザクションAPIを使用 (#1693)
- [IDE] virtualFile参照が常に元のファイルになるよう修正 (#1782)
- [IDE] bugsnagにエラーを報告する際に正しいThrowableを使用 (#1262)
- [Paging Extension] DataSourceのリークを修正 (#1628)
- [Gradle Plugin] スキーマ生成時に出力先DBファイルが既に存在する場合は削除するように修正 (#1645)
- [Gradle Plugin] マイグレーションに欠番がある場合は検証を失敗させるよう修正
- [Gradle Plugin] 設定されたファイルインデックスを明示的に使用 (#1644)

## [1.3.0] - 2020-04-03 {id="1-3-0-2020-04-03"}
[1.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.3.0

* 新規: [Gradle] コンパイル対象のSQLダイアレクトを指定するdialectプロパティ。
* 新規: [Compiler] #1009 MySQLダイアレクトの実験的サポート。
* 新規: [Compiler] #1436 sqlite:3.24ダイアレクトおよびupsertのサポート。
* 新規: [JDBC Driver] sqlite jvmドライバーからJDBCドライバーを分離。
* 修正: [Compiler] #1199 任意の長さのラムダをサポート。
* 修正: [Compiler] #1610 avg()の戻り値型がnullableになるよう修正。
* 修正: [IntelliJ] #1594 WindowsでGotoおよびFind Usagesが破損していたパス区切り文字の処理を修正。

## [1.2.2] - 2020-01-22 {id="1-2-2-2020-01-22"}
[1.2.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.2

* 新規: [Runtime] Windows（mingW）、tvOS、watchOS、macOSアーキテクチャのサポート。
* 修正: [Compiler] sum()の戻り値型をnullableに修正。
* 修正: [Paging] 競合状態を避けるため、QueryDataSourceFactoryにTransacterを渡すように変更。
* 修正: [IntelliJ Plugin] ファイルのパッケージ名を検索する際に依存関係内を検索しないように修正。
* 修正: [Gradle] #862 Gradleでのバリデーターログをdebugレベルに変更。
* 改善: [Gradle] GenerateSchemaTaskがGradleワーカーを使用するように変換。
* 注記: sqldelight-runtimeアーティファクトはruntimeに名前が変更されました。

## [1.2.1] - 2019-12-11 {id="1-2-1-2019-12-11"}
[1.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.1

* 修正: [Gradle] Kotlin Native 1.3.60サポート。
* 修正: [Gradle] #1287 同期時の警告を修正。
* 修正: [Compiler] #1469 クエリ用のSynetheticAccessor作成を修正。
* 修正: [JVM Driver] メモリリークを修正。
* 注記: coroutine extensionアーティファクトを使用する場合、buildscriptにkotlinx bintray mavenリポジトリを追加する必要があります。

## [1.2.0] - 2019-08-30 {id="1-2-0-2019-08-30"}
[1.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.0

* 新規: [Runtime] 安定版Flow API。
* 修正: [Gradle] Kotlin Native 1.3.50サポート。
* 修正: [Gradle] #1380 クリーンビルドが失敗することがある問題を修正。
* 修正: [Gradle] #1348 verifyタスク実行時に「Could not retrieve functions」が出力される問題を修正。
* 修正: [Compile] #1405 クエリに結合されたFTSテーブルが含まれているとプロジェクトをビルドできない問題を修正。
* 修正: [Gradle] #1266 複数のデータベースモジュールがある場合に散発的にGradleビルドが失敗する問題を修正。

## [1.1.4] - 2019-07-11 {id="1-1-4-2019-07-11"}
[1.1.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.4

* 新規: [Runtime] 実験的Kotlin Flow API。
* 修正: [Gradle] Kotlin/Native 1.3.40互換性。
* 修正: [Gradle] #1243 Gradleのconfigure on demandとの併用に関する修正。
* 修正: [Gradle] #1385 インクリメンタルアノテーションプロセッシングとの併用に関する修正。
* 修正: [Gradle] Gradleタスクのキャッシュを許可。
* 修正: [Gradle] #1274 Kotlin DSLでのsqldelight拡張機能の使用を有効化。
* 修正: [Compiler] 各クエリに対して一意のIDが決定的（deterministic）に生成されるよう修正。
* 修正: [Compiler] トランザクション完了時のみリッスン中のクエリに通知するよう修正。
* 修正: [JVM Driver] #1370 JdbcSqliteDriverの利用者にDB URLの提供を強制。

## [1.1.3] - 2019-04-14 {id="1-1-3-2019-04-14"}
[1.1.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.3

* Gradle Metadata 1.0リリース。

## [1.1.2] - 2019-04-14 {id="1-1-2-2019-04-14"}
[1.1.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.2

* 新規: [Runtime] #1267 ロギングドライバーデコレーター。
* 修正: [Compiler] #1254 2^16文字を超える文字列リテラルを分割。
* 修正: [Gradle] #1260 マルチプラットフォームプロジェクトで生成ソースがiOSソースとして認識される問題を修正。
* 修正: [IDE] #1290 CopyAsSqliteAction.kt:43でのkotlin.KotlinNullPointerExceptionを修正。
* 修正: [Gradle] #1268 最近のバージョンでlinkDebugFrameworkIos* タスクの実行が失敗する問題を修正。

## [1.1.1] - 2019-03-01 {id="1-1-1-2019-03-01"}
[1.1.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.1

* 修正: [Gradle] Androidプロジェクトでのモジュール依存関係のコンパイルを修正。
* 修正: [Gradle] #1246 afterEvaluateでapi依存関係を設定するよう修正。
* 修正: [Compiler] 配列型が適切に出力されるよう修正。

## [1.1.0] - 2019-02-27 {id="1-1-0-2019-02-27"}
[1.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.0

* 新規: [Gradle] #502 スキーマモジュールの依存関係指定を許可。
* 改善: [Compiler] #1111 テーブルエラーが他のエラーよりも先にソートされるよう改善。
* 修正: [Compiler] #1225 REALリテラルに対して正しい型を返すよう修正。
* 修正: [Compiler] #1218 docidがトリガーを通じて伝播するよう修正。

## [1.0.3] - 2019-01-30 {id="1-0-3-2019-01-30"}
[1.0.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.3

* 改善: [Runtime] #1195 Native Driver/Runtime Arm32。
* 改善: [Runtime] #1190 Query型からマッパーを公開。

## [1.0.2] - 2019-01-26 {id="1-0-2-2019-01-26"}
[1.0.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.2

* 修正: [Gradle Plugin] Kotlin 1.3.20にアップデート。
* 修正: [Runtime] トランザクションが例外を握りつぶさないよう修正。

## [1.0.1] - 2019-01-21 {id="1-0-1-2019-01-21"}
[1.0.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.1

* 改善: [Native Driver] DatabaseConfigurationにディレクトリ名を渡せるように改善。
* 改善: [Compiler] #1173 パッケージのないファイルはコンパイルに失敗するよう改善。
* 修正: [IDE] IDEエラーをSquareに適切に報告するよう修正。
* 修正: [IDE] #1162 同一パッケージ内の型がエラー表示されるが正常に動作する問題を修正。
* 修正: [IDE] #1166 テーブルのリネームがNPEで失敗する問題を修正。
* 修正: [Compiler] #1167 UNIONおよびSELECTを含む複雑なSQL文をパースしようとすると例外がスローされる問題を修正。

## [1.0.0] - 2019-01-08 {id="1-0-0-2019-01-08"}
[1.0.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.0

* 新規: 生成コードを刷新し、Kotlin出力に変更。
* 新規: RxJava2拡張アーティファクト。
* 新規: Android Paging拡張アーティファクト。
* 新規: Kotlin Multiplatformサポート。
* 新規: Android、iOS、JVM用のSQLiteドライバーアーティファクト。
* 新規: Transaction API。

## [0.7.0] - 2018-02-12 {id="0-7-0-2018-02-12"}
[0.7.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.7.0

 * 新規: 生成コードを更新し、Support SQLiteライブラリのみを使用するように変更。すべてのクエリが生の文字列ではなくステートメントオブジェクトを生成するようになりました。
 * 新規: IDEでのステートメント折りたたみ（folding）。
 * 新規: Boolean型が自動的に処理されるようになりました。
 * 修正: コード生成から非推奨のMarshalを削除。
 * 修正: 'avg' SQL関数の型マッピングをREALに修正。
 * 修正: 'julianday' SQL関数を正しく検出するよう修正。

## [0.6.1] - 2017-03-22 {id="0-6-1-2017-03-22"}
[0.6.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.6.1

 * 新規: 引数のないDelete、Update、Insert文に対して、コンパイル済みステートメントを生成。
 * 修正: サブクエリで使用されるビュー内のusing句がエラーにならないよう修正。
 * 修正: 生成されたMapperにおける重複した型を削除。
 * 修正: 引数に対してチェックを行う式でサブクエリを使用できるよう修正。

## [0.6.0] - 2017-03-06 {id="0-6-0-2017-03-06"}
[0.6.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.6.0

 * 新規: Selectクエリが文字列定数ではなく `SqlDelightStatement` ファクトリとして公開されるようになりました。
 * 新規: クエリのJavaDocがステートメントおよびマッパーファクトリにコピーされるようになりました。
 * 新規: ビュー名用の文字列定数を出力。
 * 修正: ファクトリを必要とするビューに対するクエリが、引数としてそれらのファクトリを正しく要求するよう修正。
 * 修正: insertへの引数の数が指定された列数と一致するかを検証。
 * 修正: where句で使用されるblobリテラルが適切にエンコードされるよう修正。
 * 本リリースにはGradle 3.3以降が必要です。

## [0.5.1] - 2016-10-24 {id="0-5-1-2016-10-24"}
[0.5.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.5.1

 * 新規: コンパイル済みステートメントが抽象型を継承するよう変更。
 * 修正: パラメーター内のプリミティブ型がnullableの場合はボクシングされるよう修正。
 * 修正: バインド引数に必要なすべてのファクトリがファクトリメソッド内に存在するよう修正。
 * 修正: エスケープされた列名が正しくマーシャリングされるよう修正。

## [0.5.0] - 2016-10-19 {id="0-5-0-2016-10-19"}
[0.5.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.5.0

 * 新規: SQLite引数をFactory経由で型安全に渡せるようになりました。
 * 新規: IntelliJプラグインが `.sq` ファイルのフォーマットを実行。
 * 新規: SQLiteタイムスタンプリテラルのサポート。
 * 修正: IntelliJでパラメーター化された型をクリックして移動できるよう修正。
 * 修正: Cursorから取得した場合にエスケープされた列名がRuntimeExceptionをスローしないよう修正。
 * 修正: Gradleプラグインが例外出力時にクラッシュしないよう修正。

## [0.4.4] - 2016-07-20 {id="0-4-4-2016-07-20"}
[0.4.4]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.4

 * 新規: 列のJava型としてshortをネイティブサポート。
 * 新規: 生成されたマッパーおよびファクトリメソッドにJavadocを追加。
 * 修正: group_concatおよびnullif関数が適切なnull許容性を持つよう修正。
 * 修正: Android Studio 2.2-alphaとの互換性。
 * 修正: WITH RECURSIVEによってプラグインがクラッシュしないよう修正。

## [0.4.3] - 2016-07-07 {id="0-4-3-2016-07-07"}
[0.4.3]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.3

 * 新規: コンパイルエラーからソースファイルへリンク。
 * 新規: 右クリックでSQLDelightコードを有効なSQLiteとしてコピー。
 * 新規: 名前付きステートメントのJavadocが生成されたString上に表示されるようになりました。
 * 修正: 生成されたビューモデルにnull許容性アノテーションを含めるよう修正。
 * 修正: UNIONから生成されたコードがすべての可能性のある列をサポートする適切な型とnull許容性を持つよう修正。
 * 修正: 生成されたコード内でsumおよびround SQLite関数が適切な型を持つよう修正。
 * 修正: CASTや内部selectに関するバグ修正。
 * 修正: CREATE TABLE文でのオートコンプリート。
 * 修正: パッケージ内でSQLiteキーワードを使用できるよう修正。

## [0.4.2] - 2016-06-16 {id="0-4-2-2016-06-16"}
[0.4.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.2

 * 新規: ファクトリからMarshalを作成可能に。
 * 修正: IntelliJプラグインが適切なジェネリクス順序でファクトリメソッドを生成するよう修正。
 * 修正: 関数名の大文字・小文字を問わず使用できるよう修正。

## [0.4.1] - 2016-06-14 {id="0-4-1-2016-06-14"}
[0.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.1

 * 修正: IntelliJプラグインが適切なジェネリクス順序でクラスを生成するよう修正。
 * 修正: 列定義の大文字・小文字を問わず使用できるよう修正。

## [0.4.0] - 2016-06-14 {id="0-4-0-2016-06-14"}
[0.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.0

 * 新規: マッパーがテーブル単位ではなくクエリ単位で生成されるようになりました。
 * 新規: `.sq` ファイル内でJava型をインポート可能に。
 * 新規: SQLite関数が検証されるようになりました。
 * 修正: 重複したエラーを削除。
 * 修正: 大文字の列名およびJavaキーワードの列名でエラーが発生しないよう修正。

## [0.3.2] - 2016-05-14 {id="0-3-2-2016-05-14"}
[0.3.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.2

 * 新規: ビューおよびエイリアスに対してオートコンプリートと使用箇所の検索が機能するようになりました。
 * 修正: コンパイル時検証でselect内での関数の使用を許可。
 * 修正: デフォルト値のみを宣言するinsert文をサポート。
 * 修正: SQLDelightを使用していないプロジェクトをインポートした際にプラグインがクラッシュしないよう修正。

## [0.3.1] - 2016-04-27 {id="0-3-1-2016-04-27"}
[0.3.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.1

  * 修正: メソッド参照からのIllegalAccessランタイム例外を回避するため、インターフェースの可視性をpublicに戻しました。
  * 修正: 部分式が適切に評価されるよう修正。

## [0.3.0] - 2016-04-26 {id="0-3-0-2016-04-26"}
[0.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.0

  * 新規: 列定義でSQLite型を使用し、Java型を指定するための追加の 'AS' 制約を持てるようになりました。
  * 新規: IDEからバグレポートを送信可能に。
  * 修正: オートコンプリートが適切に機能するよう修正。
  * 修正: `.sq` ファイルの編集時にSQLDelightモデルファイルが更新されるよう修正。
  * 削除: アタッチされたデータベースはサポートされなくなりました。

## [0.2.2] - 2016-03-07 {id="0-2-2-2016-03-07"}
[0.2.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.2

 * 新規: insert、update、delete、index、およびtrigger文で使用される列のコンパイル時検証。
 * 修正: ファイルの移動/作成時にIDEプラグインがクラッシュしないよう修正。

## [0.2.1] - 2016-03-07 {id="0-2-1-2016-03-07"}
[0.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.1

 * 新規: Ctrl+`/`（OSXではCmd+`/`）で選択した行のコメントを切り替え。
 * 新規: SQLクエリで使用される列のコンパイル時検証。
 * 修正: IDEとGradleプラグインの両方でWindowsパスをサポート。

## [0.2.0] - 2016-02-29 {id="0-2-0-2016-02-29"}
[0.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.0

 * 新規: Marshalクラスにコピーコンストラクターを追加。
 * 新規: Kotlin 1.0正式版にアップデート。
 * 修正: 'sqldelight' フォルダ構造の問題をビルド失敗とならない方法で報告するよう修正。
 * 修正: `table_name` という名前の列を禁止。生成される定数がテーブル名定数と衝突するため。
 * 修正: `.sq` ファイルが開かれているかどうかに関係なく、IDEプラグインが直ちにモデルクラスを生成するよう修正。
 * 修正: IDEとGradleプラグインの両方でWindowsパスをサポート。

## [0.1.2] - 2016-02-13 {id="0-1-2-2016-02-13"}
[0.1.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.2

 * 修正: ほとんどのプロジェクトでGradleプラグインが使用できなくなっていたコードを削除。
 * 修正: Antlrランタイムに対する不足していたコンパイラー依存関係を追加。

## [0.1.1] - 2016-02-12 {id="0-1-1-2016-02-12"}
[0.1.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.1

 * 修正: Gradleプラグインが自身と同じバージョンのランタイムを指すように修正。

## [0.1.0] - 2016-02-12 {id="0-1-0-2016-02-12"}
[0.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.0

初期リリース。