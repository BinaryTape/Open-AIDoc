# 變更記錄

## 未發佈

### 新增
- [原生驅動程式] 為 `inMemoryDriver` 新增 `extendedConfig` 參數（#5539 由 @GuilhE 提供）
- [PostgreSQL 方言] 為隱式定義之系統列 (System Columns) 新增查詢支援（#5834 由 @griffio 提供）
- [PostgreSQL 方言] 新增基礎陣列常值 (Array literal) 支援（#5997 由 @griffio 提供）
- [PostgreSQL 方言] 新增基礎 LTREE 支援（#5880 由 @yesitskev @griffio 提供）
- [MySQL 方言] 新增對 INET 函式的支援（#5072 由 @mcxinyu 提供）
- [PostgreSQL 方言] 新增對 ALTER INDEX 的支援（#6224 由 @griffio 提供）
- [SQLite 方言] 新增對 SQLite 3.44 聚合函式 DISTINCT、ORDER BY 與 FILTER 的支援（#6236 由 @griffio 提供）
- [SQLite 方言] 新增對 SQLite 3.37 STRICT 資料表 的支援（#6230 由 @griffio 提供）
- [Gradle 外掛程式] 新增對使用 `codegenExcludedColumns` 從產生的模型中排除列的支援（#6243 由 @sokolikp 提供）
- [編譯器] 為架構新增 `allTableNames` 函式（#6245 由 @edenman 提供）
- [PostgreSQL 方言] 新增對 ANY 運算子的支援（#6253 由 @griffio 提供）
- [SQLite 方言] 為 SQLite 3.39 新增 RIGHT JOIN 與 FULL JOIN 支援（#6273 由 @griffio 提供）

### 變更
- [PostgreSQL 方言] 將 `arrayIntermediateType` 的可見性變更為 public（#5835 由 @griffio 提供）
- [Gradle 外掛程式] 實作更嚴格的 `MigrationFile` 版本控管（#5730 由 @madisp 提供）
- [Gradle 外掛程式] 將最低支援的 Gradle 版本提升至 8.2.1（#6217 由 @maxsav 提供）
- [Gradle 外掛程式] 支援 Gradle 隔離專案 (isolated projects)（#6217 由 @maxsav 提供）

### 修復
- [編譯器] 抑制產生的程式碼中的 Kotlin 額外警告（#6208 由 @eyupcanakman 提供）
- [編譯器] 非群組聚合結果集中的其他列一律為可 null
- [PostgreSQL 方言] 正確解析 `coalesce` 與 `ifnull` 的可 null 性
- [PostgreSQL 方言] 修復 PostgreSQL 方言的 IDE 整合
- [PostgreSQL 方言] 改進 PostgreSQL 方言的 IDE 外掛程式（#6209 由 @griffio 提供）
- [Intellij 外掛程式] IDE 外掛程式可以為所有方言執行程式碼補全（#6210 由 @griffio 提供）
- [Gradle 外掛程式] 修復執行驗證資料庫任務時的循環相依性錯誤（#6221 由 @griffio 提供）
- [編譯器] 修復多列更新的樂觀鎖 (optimistic lock)（#6240 由 @griffio 提供）
- [Intellij 外掛程式] 修復導致 IDEA 2026.2 當機的棄用問題（#6247 由 @griffio 提供）
- [Gradle 外掛程式] 修復產生的原始碼在 AGP 8.9 至 8.11 上無法被 Kotlin 編譯識別的問題
- [PostgreSQL 方言] 修復 `lower` 與 `upper` 函式使用 Primitive 繫結引數預設為 TEXT 的問題（#6262 由 @griffio 提供）
- [編譯器] 修復當使用配接器且遷移變更可 null 性時，使用資料類別繫結插入值的問題（#6269 由 @griffio 提供）
- [編譯器] 為 null 安全運算子（IS 與 IS DISTINCT FROM）使用可 null 繫結引數（#6265 由 @griffio 提供）
- [Gradle 外掛程式] 將 AGP 的變體解析 (variant resolution) 用於專案相依項（#6217 由 @maxsav 提供）
- [Gradle 外掛程式] 修復當不同組建間的 AGP 變體清單不一致時，`generateDatabaseInterface` 的組建快取未命中問題
- [Gradle 外掛程式] 修復當套用外掛程式但未配置任何資料庫時，IDE 同步當機的問題（#6088）
- [PostgreSQL 方言] 修復使用巢狀函式呼叫時的 JSON 聚合函式問題（#6281 由 @griffio 提供）
- [分頁 3 擴充套件] 修復 `KeyedQueryPagingSource` 在空資料庫上當機的問題（#6284 由 @woods-marshes 提供）
- [編譯器] 修復當變動器陳述式與 `COALESCE` 等封裝函式搭配使用時的 Java 型別配接器問題（#6292 由 @griffio 提供）

## [2.3.2] - 2026-03-16
[2.3.2]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.2

### 新增
- [PostgreSQL 方言] 改進對 ALTER TABLE ALTER TYPE USING 運算式的支援（#6116 由 @griffio 提供）
- [PostgreSQL 方言] 新增對 DROP COLUMN IF EXISTS 的支援（#6112 由 @griffio 提供）
- [Gradle 外掛程式] 新增 `expandSelectStar` 旗標以關閉 Select 萬用字元 (wildcard) 展開（#5813 由 @griffio 提供）
- [MySQL 方言] 新增對視窗函式 (Window Functions) 的支援（#6086 由 @griffio 提供）
- [Gradle 外掛程式] 修復當起始架構版本不為 1 且 `verifyMigrations` 為 true 時的組建失敗（#6017 由 @neilgmiller 提供）
- [Gradle 外掛程式] 讓 `SqlDelightWorkerTask` 具備更多可配置性，並更新預設組態以支援在 Windows 上開發（#5215 由 @MSDarwish2000 提供）
- [SQLite 方言] 新增對 FTS5 虛擬表中合成列 (synthesized columns) 的支援（#5986 由 @watbe 提供）
- [PostgreSQL 方言] 新增對 Postgres 資料列層級安全性 (row level security) 的支援（#6087 由 @shellderp 提供）
- [PostgreSQL 方言] 擴充 FOR UPDATE 以支援 OF table、NO KEY UPDATE、NO WAIT（#6104 由 @shellderp 提供）
- [PostgreSQL 方言] 支援 Postgis Point 型別及相關函式（#5602 由 @vanniktech 提供）
- [執行階段] 新增了 `SuspendingTransacter.TransactionDispatcher`，提供一種用於控制交易之 `CoroutineContext` 的機制（#5967 由 @eygraber 提供）
- [Gradle 外掛程式] 完全相容 Android Gradle Plugin 9.0 的新 DSL。（#6140）
- [PostgreSQL 方言] 支援 PostgreSql CREATE TABLE 儲存參數（#6148 由 @griffio 提供）
- [PostgreSQL 方言] 修復 PostgreSql 唯一資料表約束的可 null 結果列（#6167 由 @griffio 提供）

### 變更
- [編譯器] 將編譯器輸出型別從 java.lang.Void 變更為 kotlin.Nothing（#6099 由 @griffio 提供）
- [編譯器] 允許在套件名稱中使用底線。在此之前，底線會被清理，導致非預期的行為（#6027 由 @BierDav 提供）
- [分頁擴充套件] 切換至 AndroidX Paging（#5910 由 @jeffdgr8 提供）
- [Android 驅動程式] 將 Android minSdk 提升至 23。（#6141）
- [分頁擴充套件] 升級至 paging 3.4.1，並移除 X64 Apple 目標。（#6166）

### 修復
- [IntelliJ 外掛程式] 修復在 VFS 重新整理事件期間，因在 EDT 上阻塞檔案型別偵測而導致的 IDE 凍結。
- [SQLite 方言] 修復 SQLite 3.38 編譯錯誤時使用 JSON 路徑運算子的問題（#6070 由 @griffio 提供）
- [SQLite 方言] 使用自訂列型別時，為 `group_concat` 函式使用 String 型別（#6082 由 @griffio 提供）
- [Gradle 外掛程式] 提升 `VerifyMigrationTask` 的效能，防止其在複雜架構上掛起（#6073 由 @Lightwood13 提供）
- [Intellij 外掛程式] 修復外掛程式初始化例外狀況並更新已棄用的方法（#6040 由 @griffio 提供）
- [Gradle 外掛程式] 修復與 Android Gradle Plugin 內建 Kotlin 的相容性（#6139）

## [2.3.1] - 2025-03-12
[2.3.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.1

發佈失敗。請使用 2.3.2！

## [2.3.0] - 2025-03-12
[2.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.0

發佈失敗。請使用 2.3.2！

## [2.2.1] - 2025-11-13
[2.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.2.1

### 新增
- [PostgreSQL 方言] 修復 Postgres numeric/integer/biginteger 型別對應（#5994 由 @griffio 提供）
- [編譯器] 改進編譯器錯誤訊息，在需要 CAST 時包含來源檔案位置（#5979 由 @griffio 提供）
- [PostgreSQL 方言] 新增對 Postgres JSON 運算子路徑提取的支援（#5971 由 @griffio 提供）
- [SQLite 方言] 為使用通用資料表運算式的 MATERIALIZED 查詢計畫提示新增 SQLite 3.35 支援（#5961 由 @griffio 提供）
- [PostgreSQL 方言] 新增對使用通用資料表運算式的 MATERIALIZED 查詢計畫提示的支援（#5961 由 @griffio 提供）
- [PostgreSQL 方言] 新增對 Postgres JSON Aggregate FILTER 的支援（#5957 由 @griffio 提供）
- [PostgreSQL 方言] 新增對 Postgres 列舉的支援（#5935 由 @griffio 提供）
- [PostgreSQL 方言] 新增對 Postgres 觸發器的有限支援（#5932 由 @griffio 提供）
- [PostgreSQL 方言] 新增述詞以檢查 SQL 運算式是否可剖析為 JSON（#5843 由 @griffio 提供）
- [PostgreSQL 方言] 新增對 PostgreSql Comment On 陳述式的有限支援（#5808 由 @griffio 提供）
- [MySQL 方言] 新增對索引可見性選項的支援（#5785 由 @orenkislev-faire 提供）
- [PostgreSql 方言] 新增對 TSQUERY 資料型別的支援（#5779 由 @griffio 提供）
- [Gradle 外掛程式] 在新增模組時增加對版本型錄的支援（#5755 由 @DRSchlaubi 提供）

### 變更
- 開發中的快照現在發佈到 Central Portal Snapshots 存儲庫，網址為 https://central.sonatype.com/repository/maven-snapshots/。
- [編譯器] 使用建構函式參考簡化了預設產生的查詢（#5814 由 @jonapoul 提供）

### 修復
- [編譯器] 修復使用包含通用資料表運算式的檢視時的堆疊溢位（#5928 由 @griffio 提供）
- [Gradle 外掛程式] 修復開啟 SqlDelight 工具視窗新增「新連線」時的當機問題（#5906 由 @griffio 提供）
- [IntelliJ 外掛程式] 避免在 copy-to-sqlite 裝訂邊操作中發生執行緒相關的當機（#5901 由 @griffio 提供）
- [IntelliJ 外掛程式] 修復使用架構陳述式 CREATE INDEX 與 CREATE VIEW 時的 PostgreSql 方言問題（#5772 由 @griffio 提供）
- [編譯器] 修復參考列時的 FTS 堆疊溢位（#5896 由 @griffio 提供）
- [編譯器] 修復 With Recursive 堆疊溢位（#5892 由 @griffio 提供）
- [編譯器] 修復 Insert|Update|Delete Returning 陳述式的通知問題（#5851 由 @griffio 提供）
- [編譯器] 修復傳回 Long 的交易區塊的非同步結果型別（#5836 由 @griffio 提供）
- [編譯器] 將 SQL 參數繫結的複雜度從 O(n²) 最佳化為 O(n)（#5898 由 @chenf7 提供）
- [SQLite 方言] 修復 SQLite 3.18 遺漏的函式（#5759 由 @griffio 提供）

## [2.2.0] - 2025-11-13
[2.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.2.0

發佈失敗，僅部分成品發佈。請使用 2.2.1！

## [2.1.0] - 2025-05-16
[2.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.1.0

### 新增
- [WASM 驅動程式] 為 Web Worker 驅動程式新增 wasmJs 支援（#5534 由 @IlyaGulya 提供）
- [PostgreSQL 方言] 支援 PostgreSql UnNest Array 轉資料列（#5673 由 @griffio 提供）
- [PostgreSQL 方言] 支援 PostgreSql TSRANGE/TSTZRANGE（#5297 由 @griffio 提供）
- [PostgreSQL 方言] PostgreSql Right Full Join（#5086 由 @griffio 提供）
- [PostgreSQL 方言] 從時間型別提取 PostgreSql 資料（#5273 由 @griffio 提供）
- [PostgreSQL 方言] PostgreSql 陣列包含運算子（#4933 由 @griffio 提供）
- [PostgreSQL 方言] PostgreSql 卸載約束（#5288 由 @griffio 提供）
- [PostgreSQL 方言] PostgreSql 型別轉換（#5089 由 @griffio 提供）
- [PostgreSQL 方言] 用於子查詢的 PostgreSql lateral join 運算子（#5122 由 @griffio 提供）
- [PostgreSQL 方言] PostgreSql ILIKE 運算子（#5330 由 @griffio 提供）
- [PostgreSQL 方言] PostgreSql XML 型別（#5331 由 @griffio 提供）
- [PostgreSQL 方言] PostgreSql AT TIME ZONE（#5243 由 @griffio 提供）
- [PostgreSQL 方言] 支援 PostgreSQL order by nulls（#5199 由 @griffio 提供）
- [PostgreSQL 方言] 新增 PostgreSQL 目前日期/時間函式支援（#5226 由 @drewd 提供）
- [PostgreSQL 方言] PostgreSql 正規表示式運算子（#5137 由 @griffio 提供）
- [PostgreSQL 方言] 新增 brin gist（#5059 由 @griffio 提供）
- [MySQL 方言] 為 MySQL 方言支援 RENAME INDEX（#5212 由 @orenkislev-faire 提供）
- [JSON 擴充套件] 為 json 資料表函式新增別名（#5372 由 @griffio 提供）

### 變更
- [編譯器] 產生的查詢檔案為簡單的變動器傳回資料列計數（#4578 由 @MariusVolkhart 提供）
- [原生驅動程式] 更新 `NativeSqlDatabase.kt` 以變更 DELETE、INSERT 與 UPDATE 陳述式的唯讀標記（#5680 由 @griffio 提供）
- [PostgreSQL 方言] 將 PgInterval 變更為 String（#5403 由 @griffio 提供）
- [PostgreSQL 方言] 支援 SqlDelight 模組實作 PostgreSql 擴充功能（#5677 由 @griffio 提供）

### 修復
- [編譯器] 修復：執行帶有結果的群組陳述式時通知查詢（#5006 由 @vitorhugods 提供）
- [編譯器] 修復 SqlDelightModule 型別解析器（#5625 由 @griffio 提供）
- [編譯器] 修復 5501 插入物件逸出列（#5503 由 @griffio 提供）
- [編譯器] 編譯器：改進錯誤訊息，使路徑連結可點擊並具有正確的行與字元位置。（#5604 由 @vanniktech 提供）
- [編譯器] 修復問題 5298：允許將關鍵字用作資料表名稱
- [編譯器] 修復具名執行並新增測試
- [編譯器] 在排序初始化陳述式時考慮外鍵資料表約束（#5325 由 @TheMrMilchmann 提供）
- [編譯器] 當涉及製表符時，正確對齊錯誤底線（#5224 由 @drewd 提供）
- [JDBC 驅動程式] 修復交易結束時 connectionManager 的記憶體洩漏
- [JDBC 驅動程式] 如文件所述，在交易內執行 SQLite 遷移（#5218 由 @morki 提供）
- [JDBC 驅動程式] 修復交易提交/回復後洩漏的連線（#5205 由 @morki 提供）
- [Gradle 外掛程式] 在 `GenerateSchemaTask` 之前執行 `DriverInitializer`（#5562 由 @nwagu 提供）
- [執行階段] 修復當實際驅動程式為非同步時 LogSqliteDriver 的當機問題（#5723 由 @edenman 提供）
- [執行階段] 修復 StringBuilder 容量（#5192 由 @janbina 提供）
- [PostgreSQL 方言] PostgreSql create or replace view (#5407 由 @griffio 提供)
- [PostgreSQL 方言] PostgreSql to_json (#5606 由 @griffio 提供)
- [PostgreSQL 方言] PostgreSql 數值解析器（#5399 由 @griffio 提供）
- [PostgreSQL 方言] SQLite 視窗函式（#2799 由 @griffio 提供）
- [PostgreSQL 方言] PostgreSql SELECT DISTINCT ON (#5345 由 @griffio 提供)
- [PostgreSQL 方言] alter table add column if not exists (#5309 由 @griffio 提供)
- [PostgreSQL 方言] PostgreSql 非同步繫結參數（#5313 由 @griffio 提供）
- [PostgreSQL 方言] PostgreSql 布林常值（#5262 由 @griffio 提供）
- [PostgreSQL 方言] PostgreSql 視窗函式（#5155 由 @griffio 提供）
- [PostgreSQL 方言] PostgreSql isNull isNotNull 型別（#5173 由 @griffio 提供）
- [PostgreSQL 方言] PostgreSql select distinct (#5172 由 @griffio 提供)
- [分頁 3 擴充套件] 分頁重新整理初始載入修復（#5615 由 @evant 提供）
- [分頁 3 擴充套件] 新增 MacOS 原生目標（#5324 由 @vitorhugods 提供）
- [IntelliJ 外掛程式] K2 支援

## [2.0.2] - 2024-04-05
[2.0.2]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.2

### 新增
- [PostgreSQL 方言] 新增 PostgreSQL STRING_AGG 函式（#4950 由 @anddani 提供）
- [PostgreSQL 方言] 在 pg 方言中新增 SET 陳述式（#4927 由 @de-luca 提供）
- [PostgreSQL 方言] 新增 PostgreSql alter column sequence 參數（#4916 由 @griffio 提供）
- [PostgreSQL 方言] 為 insert 陳述式新增 PostgreSQL alter column default 支援（#4912 由 @griffio 提供）
- [PostgreSQL 方言] 新增 PostgreSql alter sequence 與 drop sequence (#4920 由 @griffio 提供)
- [PostgreSQL 方言] 新增 Postgres 正規表示式函式定義（#5025 由 @MariusVolkhart 提供）
- [PostgreSQL 方言] 為 GIN 新增語法（#5027 由 @griffio 提供）

### 變更
- [IDE 外掛程式] 最低版本為 2023.1 / Android Studio Iguana
- [編譯器] 允許在 `encapsulatingType` 中覆寫型別的可 null 性（#4882 由 @eygraber 提供）
- [編譯器] 為 SELECT * 內嵌列名
- [Gradle 外掛程式] 切換至 `processIsolation`（#5068 由 @nwagu 提供）
- [Android 執行階段] 將 Android minSdk 提升至 21（#5094 由 @hfhbd 提供）
- [驅動程式] 為方言作者公開更多 JDBC/R2DBC 陳述式方法（#5098 由 @hfhbd 提供）

### 修復
- [PostgreSQL 方言] 修復 PostgreSQL alter table alter column (#4868 由 @griffio 提供)
- [PostgreSQL 方言] 修復 4448 資料表模型遺漏的匯入（#4885 由 @griffio 提供）
- [PostgreSQL 方言] 修復 4932 PostgreSQL 預設約束函式（#4934 由 @griffio 提供）
- [PostgreSQL 方言] 修復 4879 遷移期間 alter table rename column 中的 PostgreSQL 類別轉換錯誤（#4880 由 @griffio 提供）
- [PostgreSQL 方言] 修復 4474 PostgreSql create extension (#4541 由 @griffio 提供)
- [PostgreSQL 方言] 修復 5018 PostgreSql 新增主鍵不可為 null 型別（#5020 由 @griffio 提供）
- [PostgreSQL 方言] 修復 4703 聚合運算式（#5071 由 @griffio 提供）
- [PostgreSQL 方言] 修復 5028 PostgreSql JSON (#5030 由 @griffio 提供)
- [PostgreSQL 方言] 修復 5040 PostgreSql JSON 運算子（#5041 由 @griffio 提供）
- [PostgreSQL 方言] 修復 5040 的 JSON 運算子繫結（#5100 由 @griffio 提供）
- [PostgreSQL 方言] 修復 5082 tsvector (#5104 由 @griffio 提供)
- [PostgreSQL 方言] 修復 5032 PostgreSql UPDATE FROM 陳述式的列相鄰性（#5035 由 @griffio 提供）
- [SQLite 方言] 修復 4897 SQLite 重新命名列（#4899 由 @griffio 提供）
- [IDE 外掛程式] 修復錯誤處理常式當機（#4988 由 @aperfilyev 提供）
- [IDE 外掛程式] BugSnag 無法在 IDEA 2023.3 中初始化（由 @aperfilyev 提供）
- [IDE 外掛程式] 透過外掛程式在 IntelliJ 中開啟 .sq 檔案時出現 PluginException（由 @aperfilyev 提供）
- [IDE 外掛程式] 不要將 Kotlin 程式庫打包進 IntelliJ 外掛程式，因為它已經是一個外掛程式相依項（#5126）
- [IDE 外掛程式] 使用 extensions 陣列而非串流（#5127）

## [2.0.1] - 2023-12-01
[2.0.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.1

### 新增
- [編譯器] 執行 SELECT 時新增對多列運算式 (multi-column-expr) 的支援（#4453 由 @Adriel-M 提供）
- [PostgreSQL 方言] 新增對 PostgreSQL CREATE INDEX CONCURRENTLY 的支援（#4531 由 @griffio 提供）
- [PostgreSQL 方言] 允許 PostgreSQL CTE 輔助陳述式互相參考（#4493 由 @griffio 提供）
- [PostgreSQL 方言] 新增對二元運算式與總和的 PostgreSQL 型別支援（#4539 由 @Adriel-M 提供）
- [PostgreSQL 方言] 新增對 SELECT 陳述式中 PostgreSQL SELECT DISTINCT ON 語法的支援（#4584 由 @griffio 提供）
- [PostgreSQL 方言] 新增對 SELECT 陳述式中 PostgreSQL JSON 函式的支援（#4590 由 @MariusVolkhart 提供）
- [PostgreSQL 方言] 新增 generate_series PostgreSQL 函式（#4717 由 @griffio 提供）
- [PostgreSQL 方言] 新增額外的 Postgres 字串函式定義（#4752 由 @MariusVolkhart 提供）
- [PostgreSQL 方言] 為 min 與 max 聚合函式新增 DATE PostgreSQL 型別（#4816 由 @anddani 提供）
- [PostgreSQL 方言] 將 PostgreSql 時間型別新增至 SqlBinaryExpr (#4657 由 @griffio 提供)
- [PostgreSQL 方言] 在 postgres 方言中新增 TRUNCATE (#4817 由 @de-luca 提供)
- [SQLite 3.35 方言] 允許依序求值的多個 ON CONFLICT 子句（#4551 由 @griffio 提供）
- [JDBC 驅動程式] 新增語言註解以獲得更愉快的 SQL 編輯體驗（#4602 由 @MariusVolkhart 提供）
- [原生驅動程式] 原生驅動程式：新增對 linuxArm64 的支援（#4792 由 @hfhbd 提供）
- [Android 驅動程式] 為 AndroidSqliteDriver 新增 windowSizeBytes 參數（#4804 由 @BoD 提供）
- [分頁 3 擴充套件] 特性：為 OffsetQueryPagingSource 新增 `initialOffset` (#4802 由 @MohamadJaara 提供)

### 變更
- [編譯器] 在適當的情況下偏好使用 Kotlin 型別（#4517 由 @eygraber 提供）
- [編譯器] 進行值型別插入時一律包含列名 (#4864)
- [PostgreSQL 方言] 從 PostgreSQL 方言中移除實驗性狀態（#4443 由 @hfhbd 提供）
- [PostgreSQL 方言] 更新 PostgreSQL 型別的文件（#4569 由 @MariusVolkhart 提供）
- [R2DBC 驅動程式] 最佳化在 PostgreSQL 中處理整數資料型別時的效能（#4588 由 @MariusVolkhart 提供）

### 移除
- [SQLite Javascript 驅動程式] 移除 sqljs-driver (#4613, #4670 由 @dellisd 提供)

### 修復
- [編譯器] 修復無參數且有傳回值的群組陳述式的編譯（#4699 由 @griffio 提供）
- [編譯器] 使用 SqlBinaryExpr 繫結引數（#4604 由 @griffio 提供）
- [IDE 外掛程式] 如果已設定，則使用 IDEA 專案 JDK (#4689 由 @griffio 提供)
- [IDE 外掛程式] 修復 IDEA 2023.2 及更高版本中的 「Unknown element type: TYPE_NAME」 錯誤（#4727）
- [IDE 外掛程式] 修復了一些與 2023.2 的相容性問題
- [Gradle 外掛程式] 修正 `verifyMigrationTask` Gradle 任務的文件（#4713 由 @joshfriend 提供）
- [Gradle 外掛程式] 新增 Gradle 任務輸出訊息，以協助使用者在驗證資料庫前先產生資料庫（#4684 由 @jingwei99 提供）
- [PostgreSQL 方言] 修復多次重新命名 PostgreSQL 列的問題（#4566 由 @griffio 提供）
- [PostgreSQL 方言] 修復 4714 PostgreSQL alter column 可 null 性（#4831 由 @griffio 提供）
- [PostgreSQL 方言] 修復 4837 alter table alter column (#4846 由 @griffio 提供)
- [PostgreSQL 方言] 修復 4501 PostgreSql sequence (#4528 由 @griffio 提供)
- [SQLite 方言] 允許 JSON 二元運算子在列運算式上使用（#4776 由 @eygraber 提供）
- [SQLite 方言] 更新來自多個同名列的誤報（#4777 由 @eygraber 提供）
- [原生驅動程式] 支援具名的記憶體內資料庫（#4662 由 @05nelsonm 提供）
- [原生驅動程式] 確保查詢接聽程式集合的執行緒安全性（#4567 由 @kpgalligan 提供）
- [JDBC 驅動程式] 修復 ConnectionManager 中的連線洩漏（#4589 由 @MariusVolkhart 提供）
- [JDBC 驅動程式] 修復選擇 ConnectionManager 型別時的 JdbcSqliteDriver URL 剖析（#4656 由 @05nelsonm 提供）

## [2.0.0] - 2023-07-26
[2.0.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0

### 新增
- [MySQL 方言] MySQL：在 IF 運算式中支援 timestamp/bigint (#4329 由 @shellderp 提供)
- [MySQL 方言] MySQL：新增 now (#4431 由 @hfhbd 提供)
- [Web 驅動程式] 啟用 NPM 封裝發佈 (#4364)
- [IDE 外掛程式] 允許使用者在 Gradle 工具連接失敗時顯示堆疊追蹤（#4383）

### 變更
- [Sqlite 驅動程式] 簡化 JdbcSqliteDriver 的架構遷移使用（#3737 由 @morki 提供）
- [R2DBC 驅動程式] 真實的非同步 R2DBC 游標（#4387 由 @hfhbd 提供）

### 修復
- [IDE 外掛程式] 在需要之前不要具現化資料庫專案服務 (#4382)
- [IDE 外掛程式] 處理尋找用法期間的程序取消（#4340）
- [IDE 外掛程式] 修復 IDE 產生的非同步程式碼（#4406）
- [IDE 外掛程式] 將套件結構的組裝改為一次性計算，且不在 EDT 上執行（#4417）
- [IDE 外掛程式] 在 2023.2 上使用正確的虛設常式索引鍵進行 Kotlin 型別解析（#4416）
- [IDE 外掛程式] 在執行搜尋前等待索引就緒（#4419）
- [IDE 外掛程式] 如果索引不可用，則不執行跳轉（#4420）
- [編譯器] 修復群組陳述式的結果運算式（#4378）
- [編譯器] 不要將虛擬表用作介面型別（#4427 由 @hfhbd 提供）

## [2.0.0-rc02] - 2023-06-27
[2.0.0-rc02]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-rc02

### 新增
- [MySQL 方言] 支援小寫日期型別，以及日期型別上的 min 與 max (#4243 由 @shellderp 提供)
- [MySQL 方言] 為二元運算式與總和支援 MySQL 型別（#4254 由 @shellderp 提供）
- [MySQL 方言] 支援不含顯示寬度的無符號整數（#4306 由 @shellderp 提供）
- [MySQL 方言] 支援 LOCK IN SHARED MODE
- [PostgreSQL 方言] 為 min max 新增布林與 Timestamp (#4245 由 @griffio 提供)
- [PostgreSQL 方言] Postgres：新增視窗函式支援（#4283 由 @hfhbd 提供）
- [執行階段] 為執行階段新增 linuxArm64、androidNative 與 watchosDeviceArm 目標（#4258 由 @hfhbd 提供）
- [分頁擴充套件] 為分頁擴充套件新增 linux 與 mingw x64 目標（#4280 由 @chippman 提供）

### 變更
- [Gradle 外掛程式] 為 Android API 34 新增自動方言支援 (#4251)
- [分頁擴充套件] 為 `QueryPagingSource` 新增 `SuspendingTransacter` 支援 (#4292 由 @daio 提供)
- [執行階段] 改進 `addListener` API (#4244 由 @hfhbd 提供)
- [執行階段] 使用 Long 作為遷移版本（#4297 由 @hfhbd 提供）

### 修復
- [Gradle 外掛程式] 為產生的原始碼使用穩定的輸出路徑（#4269 由 @joshfriend 提供）
- [Gradle 外掛程式] Gradle 調整（#4222 由 @3flex 提供）

## [2.0.0-rc01] - 2023-05-29
[2.0.0-rc01]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-rc01

### 新增
- [分頁] 為分頁擴充套件新增 JS 瀏覽器目標（#3843 由 @sproctor 提供）
- [分頁] 為 androidx-paging3 擴充套件新增 iosSimulatorArm64 目標（#4117）
- [PostgreSQL 方言] 新增對 gen_random_uuid() 的支援與測試（#3855 由 @davidwheeler123 提供）
- [PostgreSQL 方言] Alter table add constraint postgres (#4116 由 @griffio 提供)
- [PostgreSQL 方言] Alter table add constraint check (#4120 由 @griffio 提供)
- [PostgreSQL 方言] 新增 PostgreSql 字元長度函式（#4121 由 @griffio 提供）
- [PostgreSQL 方言] 新增 PostgreSql 列預設間隔（#4142 由 @griffio 提供）
- [PostgreSQL 方言] 新增 PostgreSql 間隔列結果（#4152 由 @griffio 提供）
- [PostgreSQL 方言] 新增 PostgreSql Alter Column (#4165 由 @griffio 提供)
- [PostgreSQL 方言] PostgreSQL：新增 date_part (#4198 由 @hfhbd 提供)
- [MySQL 方言] 新增 SQL 字元長度函式（#4134 由 @griffio 提供）
- [IDE 外掛程式] 新增 sqldelight 目錄建議（#3976 由 @aperfilyev 提供）
- [IDE 外掛程式] 在專案樹中壓縮中間套件（#3992 由 @aperfilyev 提供）
- [IDE 外掛程式] 新增 Join 子句補全（#4086 由 @aperfilyev 提供）
- [IDE 外掛程式] 建立檢視意圖與即時範本（#4074 由 @aperfilyev 提供）
- [IDE 外掛程式] 針對 DELETE 或 UPDATE 中遺漏 WHERE 的情況發出警告（#4058 由 @aperfilyev 提供）
- [Gradle 外掛程式] 啟用型別安全專案存取器（#4005 由 @hfhbd 提供）

### 變更
- [Gradle 外掛程式] 允許透過 ServiceLoader 機制為 VerifyMigrationTask 註冊 `DriverInitializer` (#3986 由 @C2H6O 提供)
- [Gradle 外掛程式] 建立明確的編譯器環境（#4079 由 @hfhbd 提供）
- [JS 驅動程式] 將 Web Worker 驅動程式拆分為獨立的產物
- [JS 驅動程式] 不要公開 `JsWorkerSqlCursor` (#3874 由 @hfhbd 提供)
- [JS 驅動程式] 停用 sqljs 驅動程式的發佈 (#4108)
- [執行階段] 強制要求同步驅動程式必須使用同步架構初始化器 (#4013)
- [執行階段] 改進游標的非同步支援（#4102）
- [執行階段] 移除已棄用的目標（#4149 由 @hfhbd 提供）
- [執行階段] 移除對舊版記憶體模型 (MM) 的支援（#4148 由 @hfhbd 提供）

### 修復
- [R2DBC 驅動程式] R2DBC：等待關閉驅動程式（#4139 由 @hfhbd 提供）
- [編譯器] 在資料庫 `create(SqlDriver)` 中包含來自遷移的 PRAGMA (#3845 由 @MariusVolkhart 提供)
- [編譯器] 修復 RETURNING 子句的程式碼產生（#3872 由 @MariusVolkhart 提供）
- [編譯器] 不要為虛擬表產生型別 (#4015)
- [Gradle 外掛程式] 小型 Gradle 外掛程式體驗改善（#3930 由 @zacsweers 提供）
- [IDE 外掛程式] 修復未解決的 Kotlin 型別（#3924 由 @aperfilyev 提供）
- [IDE 外掛程式] 修復展開萬用字元意圖使其可與限定詞搭配使用（#3979 由 @aperfilyev 提供）
- [IDE 外掛程式] 如果 Java Home 遺漏，則使用可用的 JDK (#3925 由 @aperfilyev 提供)
- [IDE 外掛程式] 修復套件名稱上的尋找用法（#4010）
- [IDE 外掛程式] 不要為無效元素顯示自動匯入 (#4008)
- [IDE 外掛程式] 如果方言遺漏，則不進行解析 (#4009)
- [IDE 外掛程式] 忽略在失效狀態期間執行的編譯器 IDE 執行 (#4016)
- [IDE 外掛程式] 新增對 IntelliJ 2023.1 的支援（#4037 由 @madisp 提供）
- [IDE 外掛程式] 列重新命名時重新命名具名引數使用（#4027 由 @aperfilyev 提供）
- [IDE 外掛程式] 修復新增遷移快顯視窗（#4105 由 @aperfilyev 提供）
- [IDE 外掛程式] 在遷移檔案中停用 `SchemaNeedsMigrationInspection` (#4106 由 @aperfilyev 提供)
- [IDE 外掛程式] 為遷移產生使用 SQL 列名而非型別名稱（#4112 由 @aperfilyev 提供）

## [2.0.0-alpha05] - 2023-01-20
[2.0.0-alpha05]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha05

### 新增
- [分頁] 多平台分頁擴充套件（由 @jeffdgr8 提供）
- [執行階段] 為 Listener 介面新增 fun 修飾詞。
- [SQLite 方言] 新增 SQLite 3.33 支援 (UPDATE FROM)（由 @eygraber 提供）
- [PostgreSQL 方言] 在 PostgreSQL 中支援 UPDATE FROM（由 @eygraber 提供）

### 變更
- [RDBC 驅動程式] 公開連線（由 @hfhbd 提供）
- [執行階段] 將遷移回呼移至主要的 `migrate` 函式
- [Gradle 外掛程式] 對下游專案隱藏組態
- [Gradle 外掛程式] 僅遮蔽 IntelliJ（由 @hfhbd 提供）
- [Gradle 外掛程式] 支援 Kotlin 1.8.0-Beta 並新增多版本 Kotlin 測試（由 @hfhbd 提供）

### 修復
- [RDBC 驅動程式] 改為使用 `javaObjectType`（由 @hfhbd 提供）
- [RDBC 驅動程式] 修復 `bindStatement` 中的原始 null 值（由 @hfhbd 提供）
- [RDBC 驅動程式] 支援 R2DBC 1.0（由 @hfhbd 提供）
- [PostgreSQL 方言] Postgres：修復不含型別參數的 Array（由 @hfhbd 提供）
- [IDE 外掛程式] 將 IntelliJ 提升至 221.6008.13（由 @hfhbd 提供）
- [編譯器] 從純檢視解析遞迴原始資料表（由 @hfhbd 提供）
- [編譯器] 使用來自資料表外鍵子句的值類別（由 @hfhbd 提供）
- [編譯器] 修復 `SelectQueryGenerator` 以支援不含括號的繫結運算式（由 @bellatoris 提供）
- [編譯器] 修復使用交易時重複產生 `${name}Indexes` 變數的問題（由 @sachera 提供）

## [1.5.5] - 2023-01-20
[1.5.5]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.5

這是 Kotlin 1.8 與 IntelliJ 2021+ 的相容性版本，支援 JDK 17。

## [1.5.4] - 2022-10-06
[1.5.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.4

這是 Kotlin 1.7.20 與 AGP 7.3.0 的相容性更新。

## [2.0.0-alpha04] - 2022-10-03
[2.0.0-alpha04]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha04

### 重大變更

- 分頁 3 擴充套件 API 已變更，僅允許 Int 型別用於計數。
- 協同程式擴充套件現在需要傳入分派器，不再提供預設值。
- 方言與驅動程式類別現在是最終類別 (final)，請改用委派。

### 新增
- [HSQL 方言] Hsql：支援在 Insert 中為產生的列使用 DEFAULT (#3372 由 @hfhbd 提供)
- [PostgreSQL 方言] PostgreSQL：支援在 INSERT 中為產生的列使用 DEFAULT (#3373 由 @hfhbd 提供)
- [PostgreSQL 方言] 新增 NOW() 至 PostgreSQL (#3403 由 @hfhbd 提供)
- [PostgreSQL 方言] PostgreSQL 新增 NOT 運算子 (#3504 由 @hfhbd 提供)
- [分頁] 允許將 `CoroutineContext` 傳遞給 `*QueryPagingSource` (#3384)
- [Gradle 外掛程式] 為方言提供更好的版本型錄支援（#3435）
- [原生驅動程式] 新增回呼以攔截 `NativeSqliteDriver` 的 `DatabaseConfiguration` 建立過程（#3512 由 @svenjacobs 提供）

### 變更
- [分頁] 為由 `KeyedQueryPagingSource` 支援的 `QueryPagingSource` 函式新增預設分派器（#3385）
- [分頁] 讓 `OffsetQueryPagingSource` 僅適用於 Int (#3386)
- [非同步執行階段] 將 `await*` 移至上層類別 `ExecutableQuery` (#3524 由 @hfhbd 提供)
- [協同程式擴充套件] 移除流程擴充套件的預設參數（#3489）

### 修復
- [Gradle 外掛程式] 更新至 Kotlin 1.7.20 (#3542 由 @zacsweers 提供)
- [R2DBC 驅動程式] 採用 R2DBC 變更，這些變更並不總是傳送值（#3525 由 @hfhbd 提供）
- [HSQL 方言] 修復使用 Hsql 時 SQLite `VerifyMigrationTask` 失敗的問題（#3380 由 @hfhbd 提供）
- [Gradle 外掛程式] 將任務轉換為使用延遲組態 API (由 @3flex 提供)
- [Gradle 外掛程式] 避免 Kotlin 1.7.20 中的 NPE (#3398 由 @ZacSweers 提供)
- [Gradle 外掛程式] 修復壓縮遷移任務的說明（#3449）
- [IDE 外掛程式] 修復較新 Kotlin 外掛程式中的 `NoSuchFieldError` (#3422 由 @madisp 提供)
- [IDE 外掛程式] IDEA：UnusedQueryInspection - 修復 `ArrayIndexOutOfBoundsException`。 (#3427 由 @vanniktech 提供)
- [IDE 外掛程式] 對舊版 Kotlin 外掛程式參考使用反射
- [編譯器] 具有擴充函式的自訂方言不建立匯入（#3338 由 @hfhbd 提供）
- [編譯器] 修復逸出 `CodeBlock.of("${CodeBlock.toString()}")` (#3340 由 @hfhbd 提供)
- [編譯器] 在遷移中等待非同步執行陳述式（#3352）
- [編譯器] 修復 AS (#3370 由 @hfhbd 提供)
- [編譯器] `getObject` 方法支援自動填入實際型別。 (#3401 由 @robxyy 提供)
- [編譯器] 修復非同步群組傳回陳述式的程式碼產生（#3411）
- [編譯器] 如果可能，推論繫結參數的 Kotlin 型別，否則傳回更好的錯誤訊息（#3413 由 @hfhbd 提供）
- [編譯器] 不允許 ABS("foo") (#3430 由 @hfhbd 提供)
- [編譯器] 支援從其他參數推論 Kotlin 型別（#3431 由 @hfhbd 提供）
- [編譯器] 一律建立資料庫實作（#3540 由 @hfhbd 提供）
- [編譯器] 放寬 javaDoc 並將其也新增至自訂對應函式（#3554 由 @hfhbd 提供）
- [編譯器] 修復繫結中的 DEFAULT (由 @hfhbd 提供)
- [分頁 3 擴充套件] 修復分頁 3 (#3396)
- [分頁 3 擴充套件] 允許使用 Long 建構 `OffsetQueryPagingSource` (#3409)
- [分頁 3 擴充套件] 不要靜態切換 `Dispatchers.Main` (#3428)

## [2.0.0-alpha03] - 2022-06-17
[2.0.0-alpha03]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha03

### 重大變更

- 方言現在像實際的 Gradle 相依項一樣被引用。
```groovy
sqldelight {
  MyDatabase {
    dialect("app.cash.sqldelight:postgres-dialect:2.0.0-alpha03")
  }
}
```
- `AfterVersionWithDriver` 型別已移除，改用 `AfterVersion`，後者現在一律包含驅動程式。
- `Schema` 型別不再是 `SqlDriver` 的子型別
- `PreparedStatement` API 現在使用以零為起始的索引進行呼叫。

### 新增
- [IDE 外掛程式] 新增對執行中資料庫執行 SQLite、MySQL 與 PostgreSQL 指令的支援（#2718 由 @aperfilyev 提供）
- [IDE 外掛程式] 新增對 Android Studio 資料庫檢查器的支援（#3107 由 @aperfilyev 提供）
- [執行階段] 新增對非同步驅動程式的支援（#3168 由 @dellisd 提供）
- [原生驅動程式] 支援新的 Kotlin 原生記憶體模型（#3177 由 @kpgalligan 提供）
- [JS 驅動程式] 為 SqlJs 背景工作執行緒新增驅動程式（#3203 由 @dellisd 提供）
- [Gradle 外掛程式] 公開 SQLDelight 任務的類別路徑
- [Gradle 外掛程式] 為壓縮遷移新增 Gradle 任務
- [Gradle 外掛程式] 新增一個標記，用於在遷移檢查期間忽略架構定義
- [MySQL 方言] 在 MySQL 中支援 FOR SHARE 與 FOR UPDATE (#3098)
- [MySQL 方言] 支援 MySQL 索引提示 (#3099)
- [PostgreSQL 方言] 新增 date_trunc (#3295 由 @hfhbd 提供)
- [JSON 擴充套件] 支援 JSON 資料表函式 (#3090)

### 變更
- [執行階段] 移除不含驅動程式的 AfterVersion 型別 (#3091)
- [執行階段] 將 Schema 型別移至最上層
- [執行階段] 開放方言與解析器以支援第三方實作（#3232 由 @hfhbd 提供）
- [編譯器] 在失敗報告中包含用於編譯的方言 (#3086)
- [編譯器] 跳過未使用的配接器（#3162 由 @eygraber 提供）
- [編譯器] 在 PrepareStatement 中使用以 zero 為起始的索引（#3269 由 @hfhbd 提供）
- [Gradle 外掛程式] 同樣將方言設為適當的 Gradle 相依項，而非字串 (#3085)
- [Gradle 外掛程式] Gradle 驗證任務：缺少資料庫檔案時拋出錯誤。 (#3126 由 @vanniktech 提供)

### 修復
- [Gradle 外掛程式] 對 Gradle 外掛程式進行了一些小型清理與調整（#3171 由 @3flex 提供）
- [Gradle 外掛程式] 不要為產生的目錄使用 AGP 字串
- [Gradle 外掛程式] 使用 AGP 命名空間屬性 (#3220)
- [Gradle 外掛程式] 不要將 kotlin-stdlib 新增為 Gradle 外掛程式的執行階段相依項（#3245 由 @mbonnin 提供）
- [Gradle 外掛程式] 簡化多平台組態（#3246 由 @mbonnin 提供）
- [Gradle 外掛程式] 支援純 JS 專案 (#3310 由 @hfhbd 提供)
- [IDE 外掛程式] 使用 Java Home 為 Gradle 工具 API (#3078)
- [IDE 外掛程式] 在 IDE 外掛程式內正確的類別載入器上載入 JDBC 驅動程式 (#3080)
- [IDE 外掛程式] 在失效前將檔案元素標記為 null，以避免在已存在的 PSI 變更期間發生錯誤 (#3082)
- [IDE 外掛程式] 不要當機尋找 ALTER TABLE 陳述式中新資料表名稱的用法 (#3106)
- [IDE 外掛程式] 最佳化檢查器，並使其在遇到預期的例外型別時能安靜地失敗 (#3121)
- [IDE 外掛程式] 刪除應為產生目錄的檔案 (#3198)
- [IDE 外掛程式] 修復一個非安全運算子呼叫
- [編譯器] 確保帶有 RETURNING 陳述式的更新與刪除會執行查詢。 (#3084)
- [編譯器] 在複合選擇中正確推論引數型別 (#3096)
- [編譯器] 通用資料表不會產生資料類別，因此不要傳回它們 (#3097)
- [編譯器] 更快地尋找頂層遷移檔案 (#3108)
- [編譯器] 在管道運算子上正確繼承可 null 性
- [編譯器] 支援 iif ANSI SQL 函式
- [編譯器] 不要產生空的查詢檔案 (#3300 由 @hfhbd 提供)
- [編譯器] 修復僅含問號的配接器（#3314 由 @hfhbd 提供）
- [PostgreSQL 方言] Postgres 主鍵列一律不為 null (#3092)
- [PostgreSQL 方言] 修復多個資料表中同名檔案的轉移問題（#3297 由 @hfhbd 提供）
- [SQLite 3.35 方言] 僅在從變更後的資料表中刪除索引列時顯示錯誤（#3158 由 @eygraber 提供）

## [2.0.0-alpha02] - 2022-04-13
[2.0.0-alpha02]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha02

### 重大變更

- 您需要將所有出現的 `app.cash.sqldelight.runtime.rx` 替換為 `app.cash.sqldelight.rx2`

### 新增
- [編譯器] 支援在群組陳述式結尾傳回
- [編譯器] 透過方言模組支援編譯器擴充功能，並新增 SQLite JSON 擴充功能（#1379、#2087）
- [編譯器] 支援傳回值的 PRAGMA 陳述式（#1106）
- [編譯器] 支援為標記列產生值型別
- [編譯器] 增加對樂觀鎖與驗證的支援（#1952）
- [編譯器] 支援多重更新陳述式
- [PostgreSQL] 支援 PostgreSQL returning 陳述式
- [PostgreSQL] 支援 PostgreSQL 日期型別
- [PostgreSQL] 支援 pg 間隔
- [PostgreSQL] 支援 PG 布林並修復 alter table 上的插入問題
- [PostgreSQL] 在 Postgres 中支援選擇性限制 (limit)
- [PostgreSQL] 支援 PG BYTEA 型別
- [PostgreSQL] 為 Postgres 序列 (serial) 新增測試
- [PostgreSQL] 支援 PostgreSQL for update 語法
- [PostgreSQL] 支援 PostgreSQL 陣列型別
- [PostgreSQL] 在 PG 中正確儲存/擷取 UUID 型別
- [PostgreSQL] 支援 PostgreSQL NUMERIC 型別 (#1882)
- [PostgreSQL] 支援在通用資料表運算式內傳回查詢（#2471）
- [PostgreSQL] 支援 JSON 特定運算子
- [PostgreSQL] 新增 Postgres Copy (由 @hfhbd 提供)
- [MySQL] 支援 MySQL Replace
- [MySQL] 支援 NUMERIC/BigDecimal MySQL 型別 (#2051)
- [MySQL] 支援 MySQL truncate 陳述式
- [MySQL] 在 MySQL 中支援 JSON 特定運算子 (由 @eygraber 提供)
- [MySQL] 支援 MySQL INTERVAL (#2969 由 @eygraber 提供)
- [HSQL] 新增 HSQL 視窗功能
- [SQLite] 在 WHERE 中不要為可 null 參數替換相等檢查（#1490 由 @eygraber 提供）
- [SQLite] 支援 SQLite 3.35 returning 陳述式（#1490 由 @eygraber 提供）
- [SQLite] 支援 GENERATED 子句
- [SQLite] 增加對 SQLite 3.38 方言的支援 (由 @eygraber 提供)

### 變更
- [編譯器] 稍微清理產生的程式碼
- [編譯器] 禁止在群組陳述式中使用資料表參數 (#1822)
- [編譯器] 將群組查詢放入交易中 (#2785)
- [執行階段] 從驅動程式的 execute 方法傳回更新的資料列計數
- [執行階段] 將 `SqlCursor` 限制在存取連線的臨界區域內。 (#2123 由 @andersio 提供)
- [Gradle 外掛程式] 比較遷移的架構定義 (#841)
- [PostgreSQL] 禁止在 PG 中使用雙引號
- [MySQL] 在 MySQL 中使用 == 時報錯 (#2673)

### 修復
- [編譯器] 來自不同資料表的相同配接器型別在 2.0 alpha 中導致編譯錯誤
- [編譯器] 編譯 upsert 陳述式時的問題（#2791）
- [編譯器] 查詢結果應使用 select 中的資料表（#1874、#2313）
- [編譯器] 支援更新具有 INSTEAD OF 觸發器的檢視（#1018）
- [編譯器] 支援函式名稱中的 from 與 for
- [編譯器] 允許在函式運算式中使用 SEPARATOR 關鍵字
- [編譯器] 無法在 ORDER BY 中存取別名資料表的 ROWID
- [編譯器] 別名列名在 MySQL 的 HAVING 子句中無法辨識
- [編譯器] 錯誤的 「找到多個列」 錯誤
- [編譯器] 無法設定 PRAGMA locking_mode = EXCLUSIVE;
- [PostgreSQL] PostgreSQL 重新命名列
- [MySQL] UNIX_TIMESTAMP、TO_SECONDS、JSON_ARRAYAGG MySQL 函式無法辨識
- [SQLite] 修復 SQLite 視窗功能
- [IDE 外掛程式] 在空進度指示器中執行跳轉處理常式 (#2990)
- [IDE 外掛程式] 確保醒目提示訪問器不會在專案未設定時執行 (#2981、#2976)
- [IDE 外掛程式] 確保轉移產生的程式碼在 IDE 中也會更新 (#1837)
- [IDE 外掛程式] 更新方言時使索引失效

## [2.0.0-alpha01] - 2022-03-31
[2.0.0-alpha01]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha01

這是 2.0 的第一個 alpha 版本，包含一些重大變更。我們預計未來會有更多 ABI 重大變更，因此請勿發佈任何依賴此版本的程式庫（應用程式應該沒問題）。

### 重大變更

- 首先，您需要將所有出現的 `com.squareup.sqldelight` 替換為 `app.cash.sqldelight`
- 第二，您需要將所有出現的 `app.cash.sqldelight.android` 替換為 `app.cash.sqldelight.driver.android`
- 第三，您需要將所有出現的 `app.cash.sqldelight.sqlite.driver` 替換為 `app.cash.sqldelight.driver.jdbc.sqlite`
- 第四，您需要將所有出現的 `app.cash.sqldelight.drivers.native` 替換為 `app.cash.sqldelight.driver.native`
- IDE 外掛程式必須更新至 2.X 版本，可以在 [alpha 或 eap 頻道](https://plugins.jetbrains.com/plugin/8191-sqldelight/versions/alpha) 找到。
- 方言現在是相依項，您可以在 Gradle 中指定：

```gradle
sqldelight {
  MyDatabase {
    packageName = "com.example"
    dialect = "app.cash.sqldelight:mysql-dialect:2.0.0-alpha01"
  }
}
```

目前支援的方言包括 `mysql-dialect`、`postgresql-dialect`、`hsql-dialect`、`sqlite-3-18-dialect`、`sqlite-3-24-dialect`、`sqlite-3-25-dialect`、`sqlite-3-30-dialect` 以及 `sqlite-3-35-dialect`

- 原始型別現在必須匯入（例如 `INTEGER AS Boolean` 必須 `import kotlin.Boolean`），一些先前支援的型別現在需要配接器。大多數轉換的原始配接器可在 `app.cash.sqldelight:primitive-adapters:2.0.0-alpha01` 中找到（例如用於 `Integer AS kotlin.Int` 的 `IntColumnAdapter`）。

### 新增
- [IDE 外掛程式] 基礎建議遷移 (由 @aperfilyev 提供)
- [IDE 外掛程式] 新增匯入提示操作 (由 @aperfilyev 提供)
- [IDE 外掛程式] 新增 Kotlin 類別補全 (由 @aperfilyev 提供)
- [Gradle 外掛程式] 為 Gradle 型別安全專案存取器新增快捷方式 (由 @hfhbd 提供)
- [編譯器] 根據方言自訂程式碼產生 (由 @MariusVolkhart 提供)
- [JDBC 驅動程式] 為 `JdbcDriver` 新增常見型別 (由 @MariusVolkhart 提供)
- [SQLite] 增加對 SQLite 3.35 (由 @eygraber 提供)
- [SQLite] 增加對 ALTER TABLE DROP COLUMN (由 @eygraber 提供)
- [SQLite] 增加對 SQLite 3.30 方言的支援 (由 @eygraber 提供)
- [SQLite] 在 SQLite 中支援 NULLS FIRST/LAST (由 @eygraber 提供)
- [HSQL] 為產生的子句新增 HSQL 支援 (由 @MariusVolkhart 提供)
- [HSQL] 增加對 HSQL 中具名參數的支援 (由 @MariusVolkhart 提供)
- [HSQL] 自訂 HSQL 插入查詢 (由 @MariusVolkhart 提供)

### 變更
- [全部] 套件名稱已從 `com.squareup.sqldelight` 變更為 `app.cash.sqldelight`。
- [執行階段] 將方言移入其各自隔離的 Gradle 模組中
- [執行階段] 切換至由驅動程式實作的查詢通知。
- [執行階段] 將預設列配接器提取到單獨的模組 (#2056、#2060)
- [編譯器] 讓模組產生查詢實作，而不是在每個模組中重複執行
- [編譯器] 移除產生的資料類別的自訂 `toString` 產生。 (由 @PaulWoitaschek 提供)
- [JS 驅動程式] 從 `sqljs-driver` 中移除 `sql.js` 相依項 (由 @dellisd 提供)
- [分頁 3 擴充套件] 移除 Android 分頁 2 擴充套件
- [IDE 外掛程式] 在 SQLDelight 同步時新增編輯器橫幅 (#2511)
- [IDE 外掛程式] 最低支援的 IntelliJ 版本為 2021.1

### 修復
- [執行階段] 展平接聽程式清單以減少分配與指標追蹤。 (由 @andersio 提供)
- [IDE 外掛程式] 修復錯誤訊息以允許跳轉至錯誤 (由 @hfhbd 提供)
- [IDE 外掛程式] 新增遺漏的檢查說明 (#2768 由 @aperfilyev 提供)
- [IDE 外掛程式] 修復 `GotoDeclarationHandler` 中的例外 (#2531, #2688, #2804 由 @aperfilyev 提供)
- [IDE 外掛程式] 醒目提示匯入關鍵字 (由 @aperfilyev 提供)
- [IDE 外掛程式] 修復未解決的 Kotlin 型別 (#1678 由 @aperfilyev 提供)
- [IDE 外掛程式] 修復未解決套件的醒目提示 (#2543 由 @aperfilyev 提供)
- [IDE 外掛程式] 如果專案索引尚未初始化，則不要嘗試檢查不相符的列
- [IDE 外掛程式] 如果 Gradle 同步發生前，不要初始化檔案索引
- [IDE 外掛程式] 如果 Gradle 同步開始，則取消 SQLDelight 匯入
- [IDE 外掛程式] 在執行復原操作的執行緒之外重新產生資料庫
- [IDE 外掛程式] 如果參考無法解析，則使用空白的 Java 型別
- [IDE 外掛程式] 在檔案剖析期間正確移出主執行緒，且僅在寫入時移回
- [IDE 外掛程式] 改進與舊版 IntelliJ 版本的相容性 (由 @3flex 提供)
- [IDE 外掛程式] 使用更快的註解 API
- [Gradle 外掛程式] 在新增執行階段時明確支援 js/android 外掛程式 (由 @ZacSweers 提供)
- [Gradle 外掛程式] 註冊遷移輸出任務，而不從遷移推導架構 (#2744 由 @kevincianfarini 提供)
- [Gradle 外掛程式] 如果遷移任務當機，印出當機時正在執行的檔案
- [Gradle 外掛程式] 產生程式碼時對檔案進行排序以確保輸出是冪等的 (由 @ZacSweers 提供)
- [編譯器] 使用更快的 API 疊代檔案，且不探索整個 PSI 圖
- [編譯器] 為選擇函式參數新增關鍵字重整 (#2759 由 @aperfilyev 提供)
- [編譯器] 修復遷移配接器的 `packageName` (由 @hfhbd 提供)
- [編譯器] 在屬性而非型別上發出註解 (#2798 由 @aperfilyev 提供)
- [編譯器] 在傳遞給 Query 子型別之前對引數進行排序 (#2379 由 @aperfilyev 提供)

## [1.5.3] - 2021-11-23
[1.5.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.3

### 新增
- [JDBC 驅動程式] 開放 `JdbcDriver` 以支援第三方驅動程式實作 (#2672 由 @hfhbd 提供)
- [MySQL 方言] 為時間增量新增遺漏的函式 (#2671 由 @sdoward 提供)
- [協同程式擴充套件] 為協同程式擴充套件新增 M1 目標 (由 @PhilipDukhov 提供)

### 變更
- [分頁 3 擴充套件] 將 `sqldelight-android-paging3` 作為 JAR 而非 AAR 發佈 (#2634 由 @julioromano 提供)
- 同時也是軟關鍵字的屬性名稱現在將以底線結尾。例如 `value` 將公開為 `value_`

### 修復
- [編譯器] 不要為重複的陣列參數提取變數 (由 @aperfilyev 提供)
- [Gradle 外掛程式] 新增 `kotlin.mpp.enableCompatibilityMetadataVariant`。 (#2628 由 @martinbonnin 提供)
- [IDE 外掛程式] 尋找用法處理需要讀取操作

## [1.5.2] - 2021-10-12
[1.5.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.2

### 新增
- [Gradle 外掛程式] HMPP 支援 (#2548 由 @martinbonnin 提供)
- [IDE 外掛程式] 新增 NULL 比較檢查 (由 @aperfilyev 提供)
- [IDE 外掛程式] 新增檢查抑制器 (#2519 由 @aperfilyev 提供)
- [IDE 外掛程式] 混合具名與位置參數檢查 (由 @aperfilyev 提供)
- [SQLite 驅動程式] 新增 mingwX86 目標。 (#2558 由 @enginegl 提供)
- [SQLite 驅動程式] 新增 M1 目標
- [SQLite 驅動程式] 新增 linuxX64 支援 (#2456 由 @chippmann 提供)
- [MySQL 方言] 為 MySQL 新增 `ROW_COUNT` 函式 (#2523)
- [PostgreSQL 方言] postgres 重新命名、刪除列 (由 @pabl0rg 提供)
- [PostgreSQL 方言] PostgreSQL 語法無法辨識 CITEXT
- [PostgreSQL 方言] 包含 TIMESTAMP WITH TIME ZONE 與 TIMESTAMPTZ
- [PostgreSQL 方言] 為 PostgreSQL GENERATED 列新增語法
- [執行階段] 提供 `SqlDriver` 作為 `AfterVersion` 的參數 (#2534, 2614 由 @ahmedre 提供)

### 變更
- [Gradle 外掛程式] 明確要求 Gradle 7.0 (#2572 由 @martinbonnin 提供)
- [Gradle 外掛程式] 讓 `VerifyMigrationTask` 支援 Gradle 的最新檢查 (#2533 由 @3flex 提供)
- [IDE 外掛程式] 當將可 null 型別與不可為 null 型別聯結時，不要發出 「聯結比較兩個不同型別的列」 的警告 (#2550 由 @pchmielowski 提供)
- [IDE 外掛程式] 釐清列型別中小寫 「as」 的錯誤 (由 @aperfilyev 提供)

### 修復
- [IDE 外掛程式] 如果專案已處置，則不要在新的方言下重新剖析 (#2609)
- [IDE 外掛程式] 如果關聯的虛擬檔案為 null，則模組為 null (#2607)
- [IDE 外掛程式] 避免在未使用查詢檢查期間當機 (#2610)
- [IDE 外掛程式] 在寫入操作內執行資料庫同步寫入 (#2605)
- [IDE 外掛程式] 讓 IDE 排程 SQLDelight 同步
- [IDE 外掛程式] 修復 `JavaTypeMixin` 中的 NPE (#2603 由 @aperfilyev 提供)
- [IDE 外掛程式] 修復 `MismatchJoinColumnInspection` 中的 `IndexOutOfBoundsException` (#2602 由 @aperfilyev 提供)
- [IDE 外掛程式] 新增 `UnusedColumnInspection` 的說明 (#2600 由 @aperfilyev 提供)
- [IDE 外掛程式] 將 `PsiElement.generatedVirtualFiles` 包裹在讀取操作中 (#2599 由 @aperfilyev 提供)
- [IDE 外掛程式] 移除不必要的非 null 轉換 (#2596)
- [IDE 外掛程式] 正確處理尋找用法的 null (#2595)
- [IDE 外掛程式] 修復 Android 產生檔案的 IDE 自動補全 (#2573 由 @martinbonnin 提供)
- [IDE 外掛程式] 修復 `SqlDelightGotoDeclarationHandler` 中的 NPE (由 @aperfilyev 提供)
- [IDE 外掛程式] 在 insert 陳述式內的引數中重整 Kotlin 關鍵字 (#2433 由 @aperfilyev 提供)
- [IDE 外掛程式] 修復 `SqlDelightFoldingBuilder` 中的 NPE (#2382 由 @aperfilyev 提供)
- [IDE 外掛程式] 在 `CopyPasteProcessor` 中擷取 `ClassCastException` (#2369 由 @aperfilyev 提供)
- [IDE 外掛程式] 修復更新即時範本 (由 @IliasRedissi 提供)
- [IDE 外掛程式] 為意圖操作新增說明 (#2489 由 @aperfilyev 提供)
- [IDE 外掛程式] 修復 `CreateTriggerMixin` 中找不到資料表時的例外 (由 @aperfilyev 提供)
- [編譯器] 以拓撲方式對資料表建立陳述式進行排序
- [編譯器] 停止在目錄上呼叫 `forDatabaseFiles` 回呼 (#2532)
- [Gradle 外掛程式] 將 `generateDatabaseInterface` 任務相依性傳遞給潛在取用者 (#2518 由 @martinbonnin 提供)

## [1.5.1] - 2021-07-16
[1.5.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.1

### 新增
- [PostgreSQL 方言] PostgreSQL JSONB 與 ON Conflict Do Nothing (由 @satook 提供)
- [PostgreSQL 方言] 增加對 PostgreSQL ON CONFLICT (column, ...) DO UPDATE (由 @satook 提供)
- [MySQL 方言] 支援 MySQL 產生的列 (由 @JGulbronson 提供)
- [原生驅動程式] 新增 watchosX64 支援
- [IDE 外掛程式] 新增參數型別與註解 (由 @aperfilyev 提供)
- [IDE 外掛程式] 新增產生 「全選」 查詢的操作 (由 @aperfilyev 提供)
- [IDE 外掛程式] 在自動補全中顯示列型別 (由 @aperfilyev 提供)
- [IDE 外掛程式] 在自動補全中新增圖示 (由 @aperfilyev 提供)
- [IDE 外掛程式] 新增產生 「依主鍵選擇」 查詢的操作 (由 @aperfilyev 提供)
- [IDE 外掛程式] 新增產生 「插入至」 查詢的操作 (由 @aperfilyev 提供)
- [IDE 外掛程式] 為列名、陳述式識別碼、函式名稱新增醒目提示 (由 @aperfilyev 提供)
- [IDE 外掛程式] 新增剩餘的查詢產生操作 (#489 由 @aperfilyev 提供)
- [IDE 外掛程式] 從 insert-stmt 顯示參數提示 (由 @aperfilyev 提供)
- [IDE 外掛程式] 資料表別名意圖操作 (由 @aperfilyev 提供)
- [IDE 外掛程式] 限定列名意圖 (由 @aperfilyev 提供)
- [IDE 外掛程式] 跳轉至 Kotlin 屬性的宣告 (由 @aperfilyev 提供)

### 變更
- [原生驅動程式] 透過在可能時避免凍結與可共用資料結構來改進原生交易效能 (由 @andersio 提供)
- [分頁 3 擴充套件] 將 Paging3 版本提升至 3.0.0 穩定版
- [JS 驅動程式] 將 sql.js 升級至 1.5.0

### 修復
- [JDBC SQLite 驅動程式] 在清除 `ThreadLocal` 之前在連線上呼叫 close() (#2444 由 @hannesstruss 提供)
- [RX 擴充套件] 修復訂閱 / 處置競態洩漏 (#2403 由 @pyricau 提供)
- [協同程式擴充套件] 確保我們在通知前註冊查詢接聽程式
- [編譯器] 對 `notifyQueries` 進行排序以獲得一致的 Kotlin 輸出檔案 (由 @thomascjy 提供)
- [編譯器] 不要為選擇查詢類別屬性加上 @JvmField 註解 (由 @eygraber 提供)
- [IDE 外掛程式] 修復匯入最佳化程式 (#2350 由 @aperfilyev 提供)
- [IDE 外掛程式] 修復未使用的列檢查 (由 @aperfilyev 提供)
- [IDE 外掛程式] 為匯入檢查與類別標註程式新增巢狀類別支援 (由 @aperfilyev 提供)
- [IDE 外掛程式] 修復 `CopyPasteProcessor` 中的 NPE (#2363 由 @aperfilyev 提供)
- [IDE 外掛程式] 修復 `InlayParameterHintsProvider` 中的當機 (#2359 由 @aperfilyev 提供)
- [IDE 外掛程式] 修復將任何文字貼上到建立資料表陳述式時插入空行的問題 (#2431 由 @aperfilyev 提供)

## [1.5.0] - 2021-04-23
[1.5.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.0

### 新增
- [SQLite Javascript 驅動程式] 啟用 sqljs-driver 發佈 (#1667 由 @dellisd 提供)
- [分頁 3 擴充套件] 用於 Android Paging 3 程式庫的擴充套件 (#1786 由 @kevincianfarini 提供)
- [MySQL 方言] 增加對 mysql 的 ON DUPLICATE KEY UPDATE 衝突解決的支援。 (由 @rharter 提供)
- [SQLite 方言] 為 SQLite `offsets()` 新增編譯器支援 (由 @qjroberts 提供)
- [IDE 外掛程式] 為未知型別新增匯入快速修正 (#683 由 @aperfilyev 提供)
- [IDE 外掛程式] 新增未使用的匯入檢查 (#1161 由 @aperfilyev 提供)
- [IDE 外掛程式] 新增未使用的查詢檢查 (由 @aperfilyev 提供)
- [IDE 外掛程式] 新增未使用的列檢查 (#569 由 @aperfilyev 提供)
- [IDE 外掛程式] 複製/貼上時自動帶入匯入 (#684 由 @aperfilyev 提供)
- [IDE 外掛程式] 當 Gradle/IntelliJ 外掛程式版本之間不相容時顯示氣球提示
- [IDE 外掛程式] Insert Into ... VALUES(?) 參數提示 (#506 由 @aperfilyev 提供)
- [IDE 外掛程式] 內嵌參數提示 (由 @aperfilyev 提供)
- [執行階段] 在執行階段中包含一個 API，用於執行帶有回呼的遷移 (#1844)

### 變更
- [編譯器] 智慧轉型 「IS NOT NULL」 查詢 (#867)
- [編譯器] 防止在執行時會失敗的關鍵字使用 (#1471、#1629)
- [Gradle 外掛程式] 將 Gradle 外掛程式大小從 60 MB 減少到 13 MB。
- [Gradle 外掛程式] 正確支援 Android 變體，並移除對 KMM 目標特定 SQL 的支援 (#1039)
- [Gradle 外掛程式] 根據 minsdk 選擇最低 SQLite 版本 (#1684)
- [原生驅動程式] 原生驅動程式連線池與效能更新

### 修復
- [編譯器] Lambda 之前的 NBSP (由 @oldergod 提供)
- [編譯器] 修復產生的 `bind*` 與 `cursor.get*` 陳述式中不相容的型別
- [編譯器] SQL 子句應保留配接型別 (#2067)
- [編譯器] 僅具 NULL 關鍵字的列應為可 null
- [編譯器] 不要產生帶有型別註解的對應器 Lambda (#1957)
- [編譯器] 如果自訂查詢會發生衝突，則使用檔案名稱作為額外的套件後綴 (#1057、#1278)
- [編譯器] 確保外鍵串聯會導致查詢接聽程式收到通知 (#1325、#1485)
- [編譯器] 如果聯結兩個相同的型別，則傳回資料表型別 (#1342)
- [編譯器] 確保 params 到 ifnull 與 coalesce 可以為 null (#1263)
- [編譯器] 為運算式正確使用查詢施加的可 null 性
- [MySQL 方言] 支援 MySQL if 陳述式
- [PostgreSQL 方言] 在 PostgreSQL 中將 NUMERIC 與 DECIMAL 擷取為 Double (#2118)
- [SQLite 方言] UPSERT 通知應考慮 BEFORE/AFTER UPDATE 觸發器。 (#2198 由 @andersio 提供)
- [SQLite 驅動程式] 為 `SqliteDriver` 中的執行緒使用多個連線，除非我們在記憶體中 (#1832)
- [JDBC 驅動程式] JDBC 驅動程式假定 `autoCommit` 為 true (#2041)
- [JDBC 驅動程式] 確保在發生例外時關閉連線 (#2306)
- [IDE 外掛程式] 修復因路徑分隔符號錯誤導致在 Windows 上 GoToDeclaration/FindUsages 毀損的問題 (#2054 由 @angusholder 提供)
- [IDE 外掛程式] 忽略 Gradle 錯誤而不是當機。
- [IDE 外掛程式] 如果 SQLDelight 檔案被移至 non-sqldelight 模組，請勿嘗試產生程式碼
- [IDE 外掛程式] 忽略 IDE 中的程式碼產生錯誤
- [IDE 外掛程式] 確保我們不嘗試負數子字串 (#2068)
- [IDE 外掛程式] 同時確保在執行 Gradle 操作前專案已處置 (#2155)
- [IDE 外掛程式] 可 null 型別上的算術運算也應為可 null (#1853)
- [IDE 外掛程式] 讓 「展開 * 意圖」 可與額外的投影配合使用 (#2173 由 @aperfilyev 提供)
- [IDE 外掛程式] 如果 Kotlin 解析在 GoTo 期間失敗，請勿嘗試前往 SQLDelight 檔案
- [IDE 外掛程式] 如果 IntelliJ 在 SQLDelight 建立索引期間遇到例外，請勿當機
- [IDE 外掛程式] 處理在 IDE 中產生程式碼前偵測錯誤時發生的例外
- [IDE 外掛程式] 讓 IDE 外掛程式相容於動態外掛程式 (Dynamic Plugins) (#1536)
- [Gradle 外掛程式] 使用 `WorkerApi` 產生資料庫時的競態條件 (#2062 由 @stephanenicolas 提供)
- [Gradle 外掛程式] `classLoaderIsolation` 防止自訂 JDBC 使用 (#2048 由 @benasher44 提供)
- [Gradle 外掛程式] 改進遺漏 `packageName` 的錯誤訊息 (由 @vanniktech 提供)
- [Gradle 外掛程式] SQLDelight 將 IntelliJ 相依項流失至 buildscript 類別路徑 (#1998)
- [Gradle 外掛程式] 修復 Gradle 組建快取 (#2075)
- [Gradle 外掛程式] 不要在 Gradle 外掛程式中相依於 `kotlin-native-utils` (由 @ilmat192 提供)
- [Gradle 外掛程式] 如果只有遷移檔案，也要寫入資料庫 (#2094)
- [Gradle 外掛程式] 確保菱形相依項在最終編譯單元中僅被選取一次 (#1455)

同時也要特別感謝 @3flex，他在本版本中為改進 SQLDelight 基礎結構做了大量工作。

## [1.4.4] - 2020-10-08
[1.4.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.4

### 新增
- [PostgreSQL 方言] 支援 WITH 中修改資料的陳述式
- [PostgreSQL 方言] 支援 `substring` 函式
- [Gradle 外掛程式] 新增了 `verifyMigrations` 旗標，用於在 SQLDelight 編譯期間驗證遷移 (#1872)

### 變更
- [編譯器] 在非 SQLite 方言中將 SQLite 特定函式標記為未知
- [Gradle 外掛程式] 當套用了 SQLDelight 外掛程式但未配置資料庫時提供警告 (#1421)

### 修復
- [編譯器] 在 ORDER BY 子句中繫結列名時回報錯誤 (#1187 由 @eygraber 提供)
- [編譯器] 產生資料庫介面時出現註冊表警告 (#1792)
- [編譯器] case 陳述式的型別推論錯誤 (#1811)
- [編譯器] 為無版本的遷移檔案提供更好的錯誤 (#2006)
- [編譯器] 某些資料庫型別 `ColumnAdapter` 所需的編組資料庫型別不正確 (#2012)
- [編譯器] CAST 的可 null 性 (#1261)
- [編譯器] 查詢包裝器中出現許多名稱遮蔽警告 (#1946 由 @eygraber 提供)
- [編譯器] 產生的程式碼使用完全限定名稱 (#1939)
- [IDE 外掛程式] 從 Gradle 同步觸發 SQLDelight 程式碼產生
- [IDE 外掛程式] 外掛程式未在變更 .sq 檔案時重新產生資料庫介面 (#1945)
- [IDE 外掛程式] 將檔案移至新套件時的問題 (#444)
- [IDE 外掛程式] 如果無處可移動游標，則不執行任何操作而不是當機 (#1994)
- [IDE 外掛程式] 為 Gradle 專案之外的檔案使用空套件名稱 (#1973)
- [IDE 外掛程式] 對於無效型別，優雅地失敗 (#1943)
- [IDE 外掛程式] 遇到未知運算式時拋出更好的錯誤訊息 (#1958)
- [Gradle 外掛程式] SQLDelight 將 IntelliJ 相依項流失至 buildscript 類別路徑 (#1998)
- [Gradle 外掛程式] 在 *.sq 檔案中新增方法文件時出現 「找不到 JavadocIntegrationKt」 編譯錯誤 (#1982)
- [Gradle 外掛程式] SQLDelight Gradle 外掛程式不支援組態快取 (CoCa)。(#1947 由 @stephanenicolas 提供)
- [SQLite JDBC 驅動程式] SQLException：資料庫處於自動提交模式 (#1832)
- [協同程式擴充套件] 修復協同程式擴充套件的 IR 後端 (#1918 由 @dellisd 提供)

## [1.4.3] - 2020-09-04
[1.4.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.3

### 新增
- [MySQL 方言] 增加對 MySQL `last_insert_id` 函式的支援 (由 @lawkai 提供)
- [PostgreSQL 方言] 支援 SERIAL 資料型別 (由 @veyndan 與 @felipecsl 提供)
- [PostgreSQL 方言] 支援 PostgreSQL RETURNING (由 @veyndan 提供)

### 修復
- [MySQL 方言] 將 MySQL AUTO_INCREMENT 視為具有預設值 (#1823)
- [編譯器] 修復 Upsert 陳述式編譯器錯誤 (#1809 由 @eygraber 提供)
- [編譯器] 修復產生無效 Kotlin 的問題 (#1925 由 @eygraber 提供)
- [編譯器] 為未知函式提供更好的錯誤訊息 (#1843)
- [編譯器] 公開字串作為 `instr` 第二個參數的型別
- [IDE 外掛程式] 修復 IDE 外掛程式的背景程序膨脹與 UI 執行緒停頓 (#1916)
- [IDE 外掛程式] 處理模組為 null 的情況 (#1902)
- [IDE 外掛程式] 在未配置的 sq 檔案中，為套件名稱傳回空字串 (#1920)
- [IDE 外掛程式] 修復群組陳述式並為其新增整合測試 (#1820)
- [IDE 外掛程式] 使用內建的 `ModuleUtil` 尋找元素的模組 (#1854)
- [IDE 外掛程式] 僅將有效元素新增至查閱清單 (#1909)
- [IDE 外掛程式] 父代可以為 null (#1857)

## [1.4.2] - 2020-08-27
[1.4.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.2

### 新增
- [執行階段] 支援新的 JS IR 後端
- [Gradle 外掛程式] 新增 `generateSqlDelightInterface` Gradle 任務。(由 @vanniktech 提供)
- [Gradle 外掛程式] 新增 `verifySqlDelightMigration` Gradle 任務。(由 @vanniktech 提供)

### 修復
- [IDE 外掛程式] 使用 Gradle 工具 API 促進 IDE 與 Gradle 之間的資料共享
- [IDE 外掛程式] 預設架構推導為 false
- [IDE 外掛程式] 正確獲取 `commonMain` 來源集
- [MySQL 方言] 在 `mySqlFunctionType()` 中新增了 minute (由 @maaxgr 提供)

## [1.4.1] - 2020-08-21
[1.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.1

### 新增
- [執行階段] 支援 Kotlin 1.4.0 (#1859)

### 變更
- [Gradle 外掛程式] 讓 AGP 相依項變為 `compileOnly` (#1362)

### 修復
- [編譯器] 為列定義規則與資料表介面產生器新增選用 JavaDoc (#1224 由 @endanke 提供)
- [SQLite 方言] 增加對 SQLite FTS5 輔助函式 `highlight`、`snippet` 與 `bm25` 的支援 (由 @drampelt 提供)
- [MySQL 方言] 支援 MySQL bit 資料型別
- [MySQL 方言] 支援 MySQL 二進位字面值
- [PostgreSQL 方言] 從 `sql-psi` 公開 SERIAL (由 @veyndan 提供)
- [PostgreSQL 方言] 新增 BOOLEAN 資料型別 (由 @veyndan 提供)
- [PostgreSQL 方言] 新增 NULL 列約束 (由 @veyndan 提供)
- [HSQL 方言] 為 HSQL 增加 `AUTO_INCREMENT` 支援 (由 @rharter 提供)

## [1.4.0] - 2020-06-22
[1.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.0

### 新增
- [MySQL 方言] MySQL 支援 (由 @JGulbronson 與 @veyndan 提供)
- [PostgreSQL 方言] 實驗性 PostgreSQL 支援 (由 @veyndan 提供)
- [HSQL 方言] 實驗性 H2 支援 (由 @MariusVolkhart 提供)
- [SQLite 方言] SQLite FTS5 支援 (由 @benasher44 與 @jpalawaga 提供)
- [SQLite 方言] 支援 ALTER TABLE RENAME COLUMN (#1505 由 @angusholder 提供)
- [IDE] 對遷移 (.sqm) 檔案的 IDE 支援
- [IDE] 新增模仿內建 SQL 即時範本的 SQLDelight 即時範本 (#1154 由 @veyndan 提供)
- [IDE] 新增新建 SqlDelight 檔案操作 (#42 由 @romtsn 提供)
- [執行階段] 用於傳回結果的交易的 `transactionWithReturn` API
- [編譯器] 在 .sq 檔案中將多個 SQL 陳述式群組在一起的語法
- [編譯器] 支援從遷移檔案產生架構
- [Gradle 外掛程式] 新增一個將遷移檔案輸出為有效 SQL 的任務

### 變更
- [文件] 文件網站翻新 (由 @saket 提供)
- [Gradle 外掛程式] 改進不支援方言的錯誤訊息 (由 @veyndan 提供)
- [IDE] 根據方言動態變更檔案圖示 (由 @veyndan 提供)
- [JDBC 驅動程式] 公開源自 `javax.sql.DataSource` 的 `JdbcDriver` 建構函式 (#1614)

### 修復
- [編譯器] 支援資料表上的 Javadoc 並修復一個檔案中出現多個 javadoc 的問題 (#1224)
- [編譯器] 允許為合成列插入值 (#1351)
- [編譯器] 修復目錄名稱清理中的不一致 (由 @ZacSweers 提供)
- [編譯器] 合成列應在聯結中保留可 null 性 (#1656)
- [編譯器] 將刪除陳述式釘選在 delete 關鍵字上 (#1643)
- [編譯器] 修復引號問題 (#1525 由 @angusholder 提供)
- [編譯器] 修復 between 運算子以正確遞迴進入運算式 (#1279)
- [編譯器] 為建立索引時遺漏資料表/列提供更好的錯誤 (#1372)
- [編譯器] 允許在聯結約束中使用外部查詢的投影 (#1346)
- [原生驅動程式] 讓 `execute` 使用 `transationPool` (由 @benasher44 提供)
- [JDBC 驅動程式] 使用 JDBC 交易 API 而非 SQLite (#1693)
- [IDE] 修復 `virtualFile` 參考使其一律為原始檔案 (#1782)
- [IDE] 向 bugsnag 回報錯誤時使用正確的可拋出物件 (#1262)
- [分頁擴充套件] 修復洩漏的 `DataSource` (#1628)
- [Gradle 外掛程式] 如果在產生架構時輸出資料庫檔案已存在，請將其刪除 (#1645)
- [Gradle 外掛程式] 如果有間隙，則遷移驗證失敗
- [Gradle 外掛程式] 明確使用我們設定的檔案索引 (#1644)

## [1.3.0] - 2020-04-03
[1.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.3.0

* 新功能：[Gradle] 方言屬性，用於指定要針對哪個 SQL 方言進行編譯。
* 新功能：[編譯器] #1009 對 MySQL 方言的實驗性支援。
* 新功能：[編譯器] #1436 支援 SQLite:3.24 方言與 upsert。
* 新功能：[JDBC 驅動程式] 將 JDBC 驅動程式從 SQLite JVM 驅動程式中分離出來。
* 修復：[編譯器] #1199 支援任意長度的 Lambda。
* 修復：[編譯器] #1610 修復 `avg()` 的傳回型別為可 null。
* 修復：[IntelliJ] #1594 修復路徑分隔符號處理，此問題導致 Windows 上的跳轉與尋找用法毀損。

## [1.2.2] - 2020-01-22
[1.2.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.2

* 新功能：[執行階段] 支援 Windows (mingw)、tvOS、watchOS 與 macOS 架構。
* 修復：[編譯器] `sum()` 的傳回型別應為可 null。
* 修復：[分頁擴充套件] 將 Transacter 傳入 `QueryDataSourceFactory` 以避免競態條件。
* 修復：[IntelliJ 外掛程式] 尋找檔案套件名稱時不要搜尋相依項。
* 修復：[Gradle] #862 將 Gradle 中的驗證器記錄變更為偵錯層級。
* 增強：[Gradle] 將 `GenerateSchemaTask` 轉換為使用 Gradle 背景工作程序。
* 注意：sqldelight-runtime 成品已重新命名為執行階段 (runtime)。

## [1.2.1] - 2019-12-11
[1.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.1

* 修復：[Gradle] Kotlin 原生 1.3.60 支援。
* 修復：[Gradle] #1287 同步時發出警告。
* 修復：[編譯器] #1469 為查詢建立 `SynetheticAccessor`。
* 修復：[JVM 驅動程式] 修復記憶體洩漏。
* 注意：協同程式擴充套件成品需要將 kotlinx bintray maven 存儲庫新增至您的 buildscript。

## [1.2.0] - 2019-08-30
[1.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.0

* 新功能：[執行階段] 穩定的 Flow API。
* 修復：[Gradle] Kotlin 原生 1.3.50 支援。
* 修復：[Gradle] #1380 乾淨組建有時會失敗。
* 修復：[Gradle] #1348 執行驗證任務印出 「無法擷取函式」 。
* 修復：[編譯器] #1405 如果查詢包含 FTS 資料表聯結，則無法組建專案。
* 修復：[Gradle] #1266 擁有多個資料庫模組時偶爾會出現 Gradle 組建失敗。

## [1.1.4] - 2019-07-11
[1.1.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.4

* 新功能：[執行階段] 實驗性 Kotlin Flow API。
* 修復：[Gradle] Kotlin/Native 1.3.40 相容性。
* 修復：[Gradle] #1243 在 Gradle 隨需組態下使用 SQLDelight 的修復。
* 修復：[Gradle] #1385 在累加註解處理下使用 SQLDelight 的修復。
* 修復：[Gradle] 允許 Gradle 任務快取。
* 修復：[Gradle] #1274 啟用 SQLDelight 外掛程式與 Kotlin DSL 的配合使用。
* 修復：[編譯器] 為每個查詢具決定性地產生唯一識別碼。
* 修復：[編譯器] 僅在交易完成時通知接聽查詢。
* 修復：[JVM 驅動程式] #1370 強制 `JdbcSqliteDriver` 使用者提供資料庫 URL。

## [1.1.3] - 2019-04-14
[1.1.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.3

* Gradle Metadata 1.0 發佈。

## [1.1.2] - 2019-04-14
[1.1.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.2

* 新功能：[執行階段] #1267 記錄驅動程式裝飾器。
* 修復：[編譯器] #1254 拆分長度超過 2^16 個字元的字串常值。
* 修復：[Gradle] #1260 產生的原始碼在多平台專案中被辨識為 iOS 來源。
* 修復：[IDE] #1290 `kotlin.KotlinNullPointerException` 發生在 `CopyAsSqliteAction.kt:43`。
* 修復：[Gradle] #1268 近期版本中執行 `linkDebugFrameworkIos*` 任務失敗。

## [1.1.1] - 2019-03-01
[1.1.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.1

* 修復：[Gradle] 修復 Android 專案的模組相依性編譯。
* 修復：[Gradle] #1246 在 `afterEvaluate` 中設定 API 相依性。
* 修復：[編譯器] 陣列型別能正確印出。

## [1.1.0] - 2019-02-27
[1.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.0

* 新功能：[Gradle] #502 允許指定架構模組相依性。
* 增強：[編譯器] #1111 資料表錯誤排在其他錯誤之前。
* 修復：[編譯器] #1225 為 REAL 常值傳回正確型別。
* 修復：[編譯器] #1218 docid 透過觸發器傳播。

## [1.0.3] - 2019-01-30
[1.0.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.3

* 增強：[執行階段] #1195 原生驅動程式/執行階段 Arm32。
* 增強：[執行階段] #1190 從 `Query` 型別公開對應器。

## [1.0.2] - 2019-01-26
[1.0.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.2

* 修復：[Gradle 外掛程式] 更新至 Kotlin 1.3.20。
* 修復：[執行階段] 交易不再吞掉例外。

## [1.0.1] - 2019-01-21
[1.0.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.1

* 增強：[原生驅動程式] 允許將目錄名稱傳遞給 `DatabaseConfiguration`。
* 增強：[編譯器] #1173 沒有套件的檔案編譯失敗。
* 修復：[IDE] 正確向 Square 回報 IDE 錯誤。
* 修復：[IDE] #1162 同一同一套件中的型別顯示為錯誤，但運作正常。
* 修復：[IDE] #1166 重新命名資料表失敗，出現 NPE。
* 修復：[編譯器] #1167 嘗試剖析帶有 UNION 與 SELECT 的複雜 SQL 陳述式時拋出例外。

## [1.0.0] - 2019-01-08
[1.0.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.0

* 新功能：產生的程式碼全面翻新，現在使用 Kotlin。
* 新功能：RxJava2 擴充套件成品。
* 新功能：Android 分頁擴充套件成品。
* 新功能：Kotlin 多平台支援。
* 新功能：Android、iOS 與 JVM SQLite 驅動程式成品。
* 新功能：交易 API。

## [0.7.0] - 2018-02-12
[0.7.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.7.0

 * 新功能：產生的程式碼已更新，僅使用 Support SQLite 程式庫。所有查詢現在都會產生陳述式物件，而非原始字串。
 * 新功能：陳述式摺疊於 IDE。
 * 新功能：布林型別現在會自動處理。
 * 修復：從程式碼產生中移除已棄用的編組程式。
 * 修復：修正 「avg」 SQL 函式型別對應為 REAL。
 * 修復：正確偵測 「julianday」 SQL 函式。

## [0.6.1] - 2017-03-22
[0.6.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.6.1

 * 新功能：不帶引數的 Delete、Update 與 Insert 陳述式會產生編譯好的陳述式。
 * 修復：在子查詢中使用的檢視內的 USING 子句不會報錯。
 * 修復：移除了產生的對應器上的重複型別。
 * 修復：子查詢可用於針對引數進行檢查的運算式。

## [0.6.0] - 2017-03-06
[0.6.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.6.0

 * 新功能：選擇查詢現在公開為 `SqlDelightStatement` 工廠，而非字串常數。
 * 新功能：查詢 JavaDoc 現在會複製到陳述式與對應器工廠。
 * 新功能：為檢視名稱發出字串常數。
 * 修復：需要工廠的檢視查詢現在能正確地要求這些工廠作為引數。
 * 修復：驗證插入的引數數量是否與指定的列數相符。
 * 修復：正確編碼在 where 子句中使用的 blob 字面值。
 * 本版本需要 Gradle 3.3 或更高版本。

## [0.5.1] - 2016-10-24
[0.5.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.5.1

 * 新功能：編譯過的陳述式擴充了一個抽象型別。
 * 修復：原始型別在參數中的如果是可 null 的，則會被裝箱。
 * 修復：繫結引數所需的所有工廠都存在於工廠方法中。
 * 修復：逸出的列名能正確編組。

## [0.5.0] - 2016-10-19
[0.5.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.5.0

 * 新功能：SQLite 引數可以透過工廠進行型別安全傳遞
 * 新功能：IntelliJ 外掛程式對 .sq 檔案執行格式化
 * 新功能：支援 SQLite timestamp 字面值
 * 修復：參數化型別可以在 IntelliJ 中點擊跳轉
 * 修復：逸出的列名從游標抓取時不再拋出 RuntimeException。
 * 修復：Gradle 外掛程式嘗試列印例外時不會當機。

## [0.4.4] - 2016-07-20
[0.4.4]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.4

 * 新功能：原生支援 short 作為列 Java 型別
 * 新功能：產生的對應器與工廠方法上的 Javadoc
 * 修復：group_concat 與 nullif 函式具有正確的可 null 性
 * 修復：與 Android Studio 2.2-alpha 的相容性
 * 修復：WITH RECURSIVE 不再使外掛程式當機。

## [0.4.3] - 2016-07-07
[0.4.3]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.3

 * 新功能：編譯錯誤連結至來源檔案。
 * 新功能：右鍵點擊將 SQLDelight 程式碼複製為有效的 SQLite。
 * 新功能：具名陳述式上的 Javadoc 將出現在產生的字串上。
 * 修復：產生的檢視模型包含可 null 性註解。
 * 修復：產生的程式碼具有正確的型別與可 null 性，以支援所有可能的列。
 * 修復：sum 與 round SQLite 函式在產生的程式碼中具有正確型別。
 * 修復：CAST、內部 select 的修復。
 * 修復：自動補全在 CREATE TABLE 陳述式中。
 * 修復：SQLite 關鍵字可用於套件。

## [0.4.2] - 2016-06-16
[0.4.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.2

 * 新功能：Marshal 可以從工廠建立。
 * 修復：IntelliJ 外掛程式產生具有正確泛型順序的工廠方法。
 * 修復：函式名稱可以使用任何大小寫。

## [0.4.1] - 2016-06-14
[0.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.1

 * 修復：IntelliJ 外掛程式產生具有正確泛型順序的類別。
 * 修復：列定義可以使用任何大小寫。

## [0.4.0] - 2016-06-14
[0.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.0

 * 新功能：對應器按查詢而非按資料表產生。
 * 新功能：Java 型別可以在 .sq 檔案中匯入。
 * 新功能：SQLite 函式已通過驗證。
 * 修復：移除重複錯誤。
 * 修復：大寫列名與 Java 關鍵字列名不會報錯。

## [0.3.2] - 2016-05-14
[0.3.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.2

 * 新功能：自動補全與尋找用法現在適用於檢視與別名。
 * 修復：編譯時驗證現在允許在 select 中使用函式。
 * 修復：支援插入陳述式僅宣告預設值。
 * 修復：匯入未使用 SQLDelight 的專案時，外掛程式不再當機。

## [0.3.1] - 2016-04-27
[0.3.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.1

  * 修復：介面可見性改回 public，以避免來自方法參考的非法存取執行時例外。
  * 修復：子運算式已正確求值。

## [0.3.0] - 2016-04-26
[0.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.0

  * 新功能：列定義使用 SQLite 型別，並可具有額外的 「AS」 約束來指定 Java 型別。
  * 新功能：可以從 IDE 傳送錯誤報告。
  * 修復：自動補全功能正常運作。
  * 修復：SQLDelight 模型檔案隨 .sq 檔案編輯而更新。
  * 已移除：不再支援附加的資料庫。

## [0.2.2] - 2016-03-07
[0.2.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.2

 * 新功能：編譯時驗證插入、更新、刪除、索引與觸發器陳述式所使用的列。
 * 修復：在檔案移動/建立時不會使 IDE 外掛程式當機。

## [0.2.1] - 2016-03-07
[0.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.1

 * 新功能：Ctrl+`/`（OSX 上為 Cmd+`/`）切換所選行的註解。
 * 新功能：對 SQL 查詢所使用的列進行編譯時驗證。
 * 修復：在 IDE 與 Gradle 外掛程式中均支援 Windows 路徑。

## [0.2.0] - 2016-02-29
[0.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.0

 * 新功能：為 Marshal 類別新增了複製建構函式。
 * 新功能：更新至 Kotlin 1.0 正式版。
 * 修復：以不導致失敗的方式回報 「sqldelight」 資料夾結構問題。
 * 修復：禁止命名為 `table_name` 的列。其產生的常數會與資料表名稱常數發生衝突。
 * 修復：確保 IDE 外掛程式立即產生模型類別，且不論是否開啟 `.sq` 檔案。
 * 修復：支援 Windows 路徑在於 IDE 與 Gradle 外掛程式。

## [0.1.2] - 2016-02-13
[0.1.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.2

 * 修復：移除阻止 Gradle 外掛程式在大多數專案中使用的程式碼。
 * 修復：新增 Antlr 執行階段的遺漏編譯器相依項。

## [0.1.1] - 2016-02-12
[0.1.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.1

 * 修復：確保 Gradle 外掛程式指向與其自身版本相同的執行階段。

## [0.1.0] - 2016-02-12
[0.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.0

初始發佈。