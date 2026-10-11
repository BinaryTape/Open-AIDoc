# 更新日誌

## 未發佈 {id="unreleased"}

### 新增 {id="added"}

- 尚無內容！

### 變更 {id="changed"}

- 尚無內容！

### 修正 {id="fixed"}

- 尚無內容！

## [2.4.1] - 2026-10-06 {id="2-4-1-2026-10-06"}
[2.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.1

### 新增

- [文件] 新增 Android SQLite 交易相關文件（#6381 由 @griffio 貢獻）

### 變更

- [Gradle 外掛程式] 在整個程式碼產生任務期間將剖析後的 `.sq` 檔案保留在記憶體中，以避免在垃圾收集後重新剖析。這能提升大型專案中的程式碼產生速度（#6374 由 @C2H6O 貢獻）
- [IntelliJ 外掛程式] 當機回報現在會傳送至 JetBrains Marketplace，而非自訂的 Bugsnag 執行個體（#6376 由 @JakeWharton 貢獻）

### 修正

- [IntelliJ 外掛程式] 透過調整 IntelliJ API 的使用方式修復外掛程式發佈違規問題（#6366 #6368 由 @griffio 貢獻）

## [2.4.0] - 2026-09-17 {id="2-4-0-2026-09-17"}
[2.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0

### 新增
- [原生驅動程式] 為 `inMemoryDriver` 新增 `extendedConfig` 參數（#5539 由 @GuilhE 貢獻）
- [PostgreSQL 方言] 新增對隱式定義之系統欄位（System Columns）的查詢支援（#5834 由 @griffio 貢獻）
- [PostgreSQL 方言] 新增基礎陣列常值支援（#5997 由 @griffio 貢獻）
- [PostgreSQL 方言] 新增基礎 LTREE 支援（#5880 由 @yesitskev @griffio 貢獻）
- [MySQL 方言] 新增對 INET 函式的支援（#5072 由 @mcxinyu 貢獻）
- [PostgreSQL 方言] 新增對 ALTER INDEX 的支援（#6224 由 @griffio 貢獻）
- [SQLite 方言] 新增對 SQLite 3.44 聚合函式 DISTINCT、ORDER BY 與 FILTER 的支援（#6236 由 @griffio 貢獻）
- [SQLite 方言] 新增對 SQLite 3.37 STRICT 資料表的支援（#6230 由 @griffio 貢獻）
- [Gradle 外掛程式] 新增透過 `codegenExcludedColumns` 從產生的模型中排除欄位的支援（#6243 由 @sokolikp 貢獻）
- [編譯器] 在結構描述中新增 `allTableNames` 函式（#6245 由 @edenman 貢獻）
- [PostgreSQL 方言] 新增對 ANY 運算子的支援（#6253 由 @griffio 貢獻）
- [SQLite 方言] 新增 SQLite 3.39 的 RIGHT JOIN 與 FULL JOIN 支援（#6273 由 @griffio 貢獻）
- [PostgreSQL 方言] 新增在觸發程序函式中對 `RAISE` 陳述式與 `FOUND` 變數的支援（#6297 由 @griffio 貢獻）

### 變更
- [PostgreSQL 方言] 將 arrayIntermediateType 的可見性變更為 public（#5835 由 @griffio 貢獻）
- [Gradle 外掛程式] 實作更嚴格的 MigrationFile 版本控制（#5730 由 @madisp 貢獻）
- [Gradle 外掛程式] 將最低支援的 Gradle 版本提升至 8.2.1（#6217 由 @maxsav 貢獻）
- [Gradle 外掛程式] 支援 Gradle 隔離專案 (isolated projects)（#6217 由 @maxsav 貢獻）
- [IntelliJ 外掛程式] 最低版本需求為 2023.3 / Android Studio Jellyfish

### 修正
- [Gradle 外掛程式] 在 JDK 24+ 上隱藏來自編譯器 worker 的 `sun.misc.Unsafe` 棄用警告（#6321）
- [編譯器] 隱藏產生的程式碼中額外的 Kotlin 警告（#6208 由 @eyupcanakman 貢獻）
- [編譯器] 未分組聚合結果集中的其他欄位一律為可 null
- [PostgreSQL 方言] 正確解析 coalesce 與 ifnull 的可 null 性
- [PostgreSQL 方言] 修復 PostgreSQL 方言的 IDE 整合
- [PostgreSQL 方言] 改進 PostgreSQL 方言的 IDE 外掛程式（#6209 由 @griffio 貢獻）
- [Intellij 外掛程式] IDE 外掛程式可為所有方言執行程式碼補全（#6210 由 @griffio 貢獻）
- [Gradle 外掛程式] 修復執行驗證資料庫任務時的循環相依性錯誤（#6221 由 @griffio 貢獻）
- [編譯器] 修復多行更新的開放式鎖定 (optimistic lock)（#6240 由 @griffio 貢獻）
- [Intellij 外掛程式] 修復在 IDEA 2026.2 中導致當機的棄用項目（#6247 由 @griffio 貢獻）
- [Gradle 外掛程式] 修復 AGP 8.9 到 8.11 上產生的原始碼未被 Kotlin 編譯讀取到的問題
- [PostgreSQL 方言] 修復 lower 與 upper 函式使用 Primitive 繫結引數時預設為 TEXT 的問題（#6262 由 @griffio 貢獻）
- [編譯器] 修復使用介接器 (adapters) 與變更可 null 性的遷移時，data class 繫結插入值的問題（#6269 由 griffio 貢獻）
- [編譯器] 在 null 安全運算子（IS 與 IS DISTINCT FROM）中使用可 null 繫結引數（#6265 由 @griffio 貢獻）
- [Gradle 外掛程式] 專案相依性改用 AGP 的 variant 解析（#6217 由 @maxsav 貢獻）
- [Gradle 外掛程式] 修復建置之間 AGP variant 清單不同時，generateDatabaseInterface 發生建置快取未命中的問題
- [Gradle 外掛程式] 修復在套用外掛程式但未設定任何資料庫時，IDE 同步發生的當機問題（#6088）
- [PostgreSQL 方言] 修復使用巢狀函式呼叫時的 JSON 聚合函式問題（#6281 由 @griffio 貢獻）
- [Paging3 擴充套件] 修復 KeyedQueryPagingSource 在空資料庫時發生的當機問題（#6284 由 @woods-marshes 貢獻）
- [編譯器] 修復當變更陳述式與如 `COALESCE` 等封裝函式一起使用時的 Java 型別介接器問題（#6292 由 @griffio 貢獻）
- [編譯器] 修復模組名稱為大寫時，所產生程式碼的套件名稱也變為大寫的問題（#6316 由 @griffio 貢獻）
- [PostgreSQL 方言] 允許日期資料型別不區分大小寫（#6328 由 @griffio 貢獻）
- [PostgreSQL 方言] 修復 `string_agg` 函式應為可 null 的問題（#6340 由 @griffio 貢獻）
- [SQLite 方言] 修復使用 `GROUP BY` 時的 SQLite 3.44 聚合函式問題（#6343 由 @griffio 貢獻）
- [Gradle 外掛程式] 避免在設定階段 (configuration time) 解析資料庫相依性（#6353 由 @joshfriend 貢獻）

## [2.4.0-rc2] - 2026-09-14 {id="2-4-0-rc2-2026-09-14"}
[2.4.0-rc2]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0-rc2

### 修正

- [PostgreSQL 方言] 修復 `string_agg` 函式應為可 null 的問題（#6340 由 @griffio 貢獻）
- [SQLite 方言] 修復使用 `GROUP BY` 時的 SQLite 3.44 聚合函式問題（#6343 由 @griffio 貢獻）
- [Gradle 外掛程式] 避免在設定階段解析資料庫相依性（#6353 由 @joshfriend 貢獻）

## [2.4.0-rc1] - 2026-09-01 {id="2-4-0-rc1-2026-09-01"}
[2.4.0-rc1]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0-rc1

### 新增
- [原生驅動程式] 為 `inMemoryDriver` 新增 `extendedConfig` 參數（#5539 由 @GuilhE 貢獻）
- [PostgreSQL 方言] 新增對隱式定義之系統欄位（System Columns）的查詢支援（#5834 由 @griffio 貢獻）
- [PostgreSQL 方言] 新增基礎陣列常值支援（#5997 由 @griffio 貢獻）
- [PostgreSQL 方言] 新增基礎 LTREE 支援（#5880 由 @yesitskev @griffio 貢獻）
- [MySQL 方言] 新增對 INET 函式的支援（#5072 由 @mcxinyu 貢獻）
- [PostgreSQL 方言] 新增對 ALTER INDEX 的支援（#6224 由 @griffio 貢獻）
- [SQLite 方言] 新增對 SQLite 3.44 聚合函式 DISTINCT、ORDER BY 與 FILTER 的支援（#6236 由 @griffio 貢獻）
- [SQLite 方言] 新增對 SQLite 3.37 STRICT 資料表的支援（#6230 由 @griffio 貢獻）
- [Gradle 外掛程式] 新增透過 `codegenExcludedColumns` 從產生的模型中排除欄位的支援（#6243 由 @sokolikp 貢獻）
- [編譯器] 在結構描述中新增 `allTableNames` 函式（#6245 由 @edenman 貢獻）
- [PostgreSQL 方言] 新增對 ANY 運算子的支援（#6253 由 @griffio 貢獻）
- [SQLite 方言] 新增 SQLite 3.39 的 RIGHT JOIN 與 FULL JOIN 支援（#6273 由 @griffio 貢獻）
- [PostgreSQL 方言] 新增在觸發程序函式中對 `RAISE` 陳述式與 `FOUND` 變數的支援（#6297 由 @griffio 貢獻）

### 變更
- [PostgreSQL 方言] 將 arrayIntermediateType 的可見性變更為 public（#5835 由 @griffio 貢獻）
- [Gradle 外掛程式] 實作更嚴格的 MigrationFile 版本控制（#5730 由 @madisp 貢獻）
- [Gradle 外掛程式] 將最低支援的 Gradle 版本提升至 8.2.1（#6217 由 @maxsav 貢獻）
- [Gradle 外掛程式] 支援 Gradle 隔離專案（#6217 由 @maxsav 貢獻）
- [IntelliJ 外掛程式] 最低版本需求為 2023.3 / Android Studio Jellyfish

### 修正
- [Gradle 外掛程式] 在 JDK 24+ 上隱藏來自編譯器 worker 的 `sun.misc.Unsafe` 棄用警告（#6321）
- [編譯器] 隱藏產生的程式碼中額外的 Kotlin 警告（#6208 由 @eyupcanakman 貢獻）
- [編譯器] 未分組聚合結果集中的其他欄位一律為可 null
- [PostgreSQL 方言] 正確解析 coalesce 與 ifnull 的可 null 性
- [PostgreSQL 方言] 修復 PostgreSQL 方言的 IDE 整合
- [PostgreSQL 方言] 改進 PostgreSQL 方言的 IDE 外掛程式（#6209 由 @griffio 貢獻）
- [Intellij 外掛程式] IDE 外掛程式可為所有方言執行程式碼補全（#6210 由 @griffio 貢獻）
- [Gradle 外掛程式] 修復執行驗證資料庫任務時的循環相依性錯誤（#6221 由 @griffio 貢獻）
- [編譯器] 修復多行更新的開放式鎖定（#6240 由 @griffio 貢獻）
- [Intellij 外掛程式] 修復在 IDEA 2026.2 中導致當機的棄用項目（#6247 由 @griffio 貢獻）
- [Gradle 外掛程式] 修復 AGP 8.9 到 8.11 上產生的原始碼未被 Kotlin 編譯讀取到的問題
- [PostgreSQL 方言] 修復 lower 與 upper 函式使用 Primitive 繫結引數時預設為 TEXT 的問題（#6262 由 @griffio 貢獻）
- [編譯器] 修復使用介接器與變更可 null 性的遷移時，data class 繫結插入值的問題（#6269 由 griffio 貢獻）
- [編譯器] 在 null 安全運算子（IS 與 IS DISTINCT FROM）中使用可 null 繫結引數（#6265 由 @griffio 貢獻）
- [Gradle 外掛程式] 專案相依性改用 AGP 的 variant 解析（#6217 由 @maxsav 貢獻）
- [Gradle 外掛程式] 修復建置之間 AGP variant 清單不同時，generateDatabaseInterface 發生建置快取未命中的問題
- [Gradle 外掛程式] 修復在套用外掛程式但未設定任何資料庫時，IDE 同步發生的當機問題（#6088）
- [PostgreSQL 方言] 修復使用巢狀函式呼叫時的 JSON 聚合函式問題（#6281 由 @griffio 貢獻）
- [Paging3 擴充套件] 修復 KeyedQueryPagingSource 在空資料庫時發生的當機問題（#6284 由 @woods-marshes 貢獻）
- [編譯器] 修復當變更陳述式與如 `COALESCE` 等封裝函式一起使用時的 Java 型別介接器問題（#6292 由 @griffio 貢獻）
- [編譯器] 修復模組名稱為大寫時，所產生程式碼的套件名稱也變為大寫的問題（#6316 由 @griffio 貢獻）
- [PostgreSQL 方言] 允許日期資料型別不區分大小寫（#6328 由 @griffio 貢獻）

## [2.3.2] - 2026-03-16 {id="2-3-2-2026-03-16"}
[2.3.2]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.2

### 新增
- [PostgreSQL 方言] 改進對 ALTER TABLE ALTER TYPE USING 運算式的支援（#6116 由 @griffio 貢獻）
- [PostgreSQL 方言] 新增對 DROP COLUMN IF EXISTS 的支援（#6112 由 @griffio 貢獻）
- [Gradle 外掛程式] 新增 expandSelectStar 旗標以關閉 Select 萬用字元展開（#5813 由 @griffio 貢獻）
- [MySQL 方言] 新增對視窗函式（Window Functions）的支援（#6086 由 @griffio 貢獻）
- [Gradle 外掛程式] 修復當起始結構描述版本不為 1 且 verifyMigrations 為 true 時的建置失敗問題（#6017 由 @neilgmiller 貢獻）
- [Gradle 外掛程式] 使 `SqlDelightWorkerTask` 具備更高可設定性，並更新預設設定以支援在 Windows 上開發（#5215 由 @MSDarwish2000 貢獻）
- [SQLite 方言] 新增對 FTS5 虛擬資料表中合成欄位的支援（#5986 由 @watbe 貢獻）
- [PostgreSQL 方言] 新增對 Postgres 資料列層級安全性 (row level security) 的支援（#6087 由 @shellderp 貢獻）
- [PostgreSQL 方言] 擴展 FOR UPDATE 以支援 OF table、NO KEY UPDATE、NO WAIT（#6104 由 @shellderp 貢獻）
- [PostgreSQL 方言] 支援 Postgis Point 型別及相關函式（#5602 由 @vanniktech 貢獻）
- [執行階段] 新增 `SuspendingTransacter.TransactionDispatcher`，提供控制交易之 `CoroutineContext` 的機制（#5967 由 @eygraber 貢獻）
- [Gradle 外掛程式] 完全相容於 Android Gradle Plugin 9.0 的新 DSL（#6140）
- [PostgreSQL 方言] 支援 PostgreSql CREATE TABLE 儲存參數（#6148 由 @griffio 貢獻）
- [PostgreSQL 方言] 修復 PostgreSql 唯一資料表條件約束可 null 結果欄位的問題（#6167 由 @griffio 貢獻）

### 變更
- [編譯器] 將編譯器輸出型別從 java.lang.Void 變更為 kotlin.Nothing（#6099 由 @griffio 貢獻）
- [編譯器] 允許套件名稱中包含底線。先前底線會被清理淨化，導致非預期的行為（#6027 由 @BierDav 貢獻）
- [Paging 擴充套件] 切換至 AndroidX Paging（#5910 由 @jeffdgr8 貢獻）
- [Android 驅動程式] 將 Android minSdk 提升至 23（#6141）
- [Paging 擴充套件] 升級至 paging 3.4.1，並移除了 X64 Apple 目標（#6166）

### 修正
- [IntelliJ 外掛程式] 修復在 VFS 重新整理事件期間，EDT 上因阻塞性檔案型別偵測導致的 IDE 凍結問題。
- [SQLite 方言] 修復使用 JSON 路徑運算子時的 Sqlite 3.38 編譯錯誤（#6070 由 @griffio 貢獻）
- [SQLite 方言] 使用自訂欄位型別時，group_concat 函式改用 String 型別（#6082 由 @griffio 貢獻）
- [Gradle 外掛程式] 提升 `VerifyMigrationTask` 的效能，避免其在複雜結構描述上停止回應（#6073 由 @Lightwood13 貢獻）
- [Intellij 外掛程式] 修復外掛程式初始化例外狀況並更新已棄用的方法（#6040 由 @griffio 貢獻）
- [Gradle 外掛程式] 修復與 Android Gradle Plugin 內建 Kotlin 的相容性（#6139）

## [2.3.1] - 2025-03-12 {id="2-3-1-2025-03-12"}
[2.3.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.1

發佈失敗。請使用 2.3.2！

## [2.3.0] - 2025-03-12 {id="2-3-0-2025-03-12"}
[2.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.0

發佈失敗。請使用 2.3.2！

## [2.2.1] - 2025-11-13 {id="2-2-1-2025-11-13"}
[2.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.2.1

### 新增
- [PostgreSQL 方言] 修復 Postgres numeric/integer/biginteger 型別對應（#5994 由 @griffio 貢獻）
- [編譯器] 改進編譯器錯誤訊息，在需要 CAST 時包含來源檔案位置（#5979 由 @griffio 貢獻）
- [PostgreSQL 方言] 新增對 Postgres JSON 運算子路徑擷取的支援（#5971 由 @griffio 貢獻）
- [SQLite 方言] 新增 Sqlite 3.35 對使用通用資料表運算式 (CTE) 的 MATERIALIZED 查詢規劃器提示的支援（#5961 由 @griffio 貢獻）
- [PostgreSQL 方言] 新增對使用通用資料表運算式 (CTE) 的 MATERIALIZED 查詢規劃器提示的支援（#5961 由 @griffio 貢獻）
- [PostgreSQL 方言] 新增對 Postgres JSON Aggregate FILTER 的支援（#5957 由 @griffio 貢獻）
- [PostgreSQL 方言] 新增對 Postgres 列舉的支援（#5935 由 @griffio 貢獻）
- [PostgreSQL 方言] 新增對 Postgres 觸發程序的有限支援（#5932 由 @griffio 貢獻）
- [PostgreSQL 方言] 新增述詞以檢查 SQL 運算式是否可剖析為 JSON（#5843 由 @griffio 貢獻）
- [PostgreSQL 方言] 新增對 PostgreSql Comment On 陳述式的有限支援（#5808 由 @griffio 貢獻）
- [MySQL 方言] 新增對索引可見性選項的支援（#5785 由 @orenkislev-faire 貢獻）
- [PostgreSql 方言] 新增對 TSQUERY 資料型別的支援（#5779 由 @griffio 貢獻）
- [Gradle 外掛程式] 新增在新增模組時對版本目錄 (version catalogs) 的支援（#5755 由 @DRSchlaubi 貢獻）

### 變更
- 開發中的快照現在發佈至位於 https://central.sonatype.com/repository/maven-snapshots/ 的 Central Portal Snapshots 存放庫。
- [編譯器] 使用建構函式參照簡化預設產生的查詢（#5814 由 @jonapoul 貢獻）

### 修正
- [編譯器] 修復使用包含通用資料表運算式 (CTE) 的 View 時發生的堆疊溢位問題（#5928 由 @griffio 貢獻）
- [Gradle 外掛程式] 修復開啟 SqlDelight 工具視窗新增「New Connection」時的當機問題（#5906 由 @griffio 貢獻）
- [IntelliJ 外掛程式] 避免 copy-to-sqlite 裝訂邊操作中與執行緒相關的當機（#5901 由 @griffio 貢獻）
- [IntelliJ 外掛程式] 修復使用架構陳述式 CREATE INDEX 與 CREATE VIEW 時的 PostgreSql 方言問題（#5772 由 @griffio 貢獻）
- [編譯器] 修復參照欄位時的 FTS 堆疊溢位問題（#5896 由 @griffio 貢獻）
- [編譯器] 修復 With Recursive 堆疊溢位問題（#5892 由 @griffio 貢獻）
- [編譯器] 修復 Insert|Update|Delete Returning 陳述式的 Notify 問題（#5851 由 @griffio 貢獻）
- [編譯器] 修復回傳 Long 的交易區塊的非同步結果型別（#5836 由 @griffio 貢獻）
- [編譯器] 將 SQL 參數繫結的複雜度從 O(n²) 最佳化為 O(n)（#5898 由 @chenf7 貢獻）
- [SQLite 方言] 修復 Sqlite 3.18 遺失的函式（#5759 由 @griffio 貢獻）

## [2.2.0] - 2025-11-13 {id="2-2-0-2025-11-13"}
[2.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.2.0

發佈失敗（構件僅部分發佈）。請使用 2.2.1！

## [2.1.0] - 2025-05-16 {id="2-1-0-2025-05-16"}
[2.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.1.0

### 新增
- [WASM 驅動程式] 為 Web Worker 驅動程式新增 wasmJs 支援（#5534 由 @IlyaGulya 貢獻）
- [PostgreSQL 方言] 支援 PostgreSql UnNest 陣列轉資料列（#5673 由 @griffio 貢獻）
- [PostgreSQL 方言] 支援 PostgreSql TSRANGE/TSTZRANGE（#5297 由 @griffio 貢獻）
- [PostgreSQL 方言] 支援 PostgreSql Right Full Join（#5086 由 @griffio 貢獻）
- [PostgreSQL 方言] 支援 Postrgesql 從時間型別中提取（#5273 由 @griffio 貢獻）
- [PostgreSQL 方言] 支援 PostgreSql 陣列包含運算子（#4933 由 @griffio 貢獻）
- [PostgreSQL 方言] 支援 PostgreSql drop constraint（#5288 由 @griffio 貢獻）
- [PostgreSQL 方言] 支援 Postgresql 型別轉換（#5089 由 @griffio 貢獻）
- [PostgreSQL 方言] 支援子查詢的 PostgreSql lateral join 運算子（#5122 由 @griffio 貢獻）
- [PostgreSQL 方言] 支援 Postgresql ILIKE 運算子（#5330 由 @griffio 貢獻）
- [PostgreSQL 方言] 支援 PostgreSql XML 型別（#5331 由 @griffio 貢獻）
- [PostgreSQL 方言] 支援 PostgreSql AT TIME ZONE（#5243 由 @griffio 貢獻）
- [PostgreSQL 方言] 支援 postgresql order by nulls（#5199 由 @griffio 貢獻）
- [PostgreSQL 方言] 新增 PostgreSQL 目前日期/時間函式支援（#5226 由 @drewd 貢獻）
- [PostgreSQL 方言] 支援 PostgreSql 正則表示式運算子（#5137 由 @griffio 貢獻）
- [PostgreSQL 方言] 新增 brin gist（#5059 由 @griffio 貢獻）
- [MySQL 方言] 為 MySql 方言支援 RENAME INDEX（#5212 由 @orenkislev-faire 貢獻）
- [JSON 擴充套件] 為 JSON 資料表函式新增別名（#5372 由 @griffio 貢獻）

### 變更
- [編譯器] 產生的查詢檔案為簡單變更器回傳受影響資料列數（#4578 由 @MariusVolkhart 貢獻）
- [原生驅動程式] 更新 NativeSqlDatabase.kt 以變更 DELETE、INSERT 和 UPDATE 陳述式的唯讀旗標（#5680 由 @griffio 貢獻）
- [PostgreSQL 方言] 將 PgInterval 變更為 String（#5403 由 @griffio 貢獻）
- [PostgreSQL 方言] 支援 SqlDelight 模組實作 PostgreSql 擴充套件（#5677 由 @griffio 貢獻）

### 修正
- [編譯器] 修復：執行帶有結果的群組陳述式時通知查詢（#5006 由 @vitorhugods 貢獻）
- [編譯器] 修復 SqlDelightModule 型別解析器（#5625 由 @griffio 貢獻）
- [編譯器] 修復 5501 插入物件逸出欄位問題（#5503 由 @griffio 貢獻）
- [編譯器] 編譯器：改進錯誤訊息，使路徑連結可點擊並帶有正確的行與字元位置（#5604 由 @vanniktech 貢獻）
- [編譯器] 修復問題 5298：允許關鍵字用作資料表名稱
- [編譯器] 修復具名執行並新增測試
- [編譯器] 排序初始化陳述式時考量外鍵資料表條件約束（#5325 由 @TheMrMilchmann 貢獻）
- [編譯器] 當包含定位字元 (Tab) 時正確對齊錯誤底線（#5224 由 @drewd 貢獻）
- [JDBC 驅動程式] 修復交易結束時 connectionManager 的記憶體洩漏問題
- [JDBC 驅動程式] 如文件所述在交易內執行 SQLite 遷移（#5218 由 @morki 貢獻）
- [JDBC 驅動程式] 修復交易提交 / 復原後連線洩漏的問題（#5205 由 @morki 貢獻）
- [Gradle 外掛程式] 在 `GenerateSchemaTask` 之前執行 `DriverInitializer`（#5562 由 @nwagu 貢獻）
- [執行階段] 修復當真實驅動程式為非同步時 LogSqliteDriver 的當機問題（#5723 由 @edenman 貢獻）
- [執行階段] 修復 StringBuilder 容量（#5192 由 @janbina 貢獻）
- [PostgreSQL 方言] PostgreSql create or replace view（#5407 由 @griffio 貢獻）
- [PostgreSQL 方言] Postgresql to_json（#5606 由 @griffio 貢獻）
- [PostgreSQL 方言] PostgreSql numeric 解析器（#5399 由 @griffio 貢獻）
- [PostgreSQL 方言] sqlite 視窗函式（#2799 由 @griffio 貢獻）
- [PostgreSQL 方言] PostgreSql SELECT DISTINCT ON（#5345 由 @griffio 貢獻）
- [PostgreSQL 方言] alter table add column if not exists（#5309 由 @griffio 貢獻）
- [PostgreSQL 方言] Postgresql 非同步繫結參數（#5313 由 @griffio 貢獻）
- [PostgreSQL 方言] PostgreSql 布林常值（#5262 由 @griffio 貢獻）
- [PostgreSQL 方言] PostgreSql 視窗函式（#5155 由 @griffio 貢獻）
- [PostgreSQL 方言] PostgreSql isNull isNotNull 型別（#5173 由 @griffio 貢獻）
- [PostgreSQL 方言] PostgreSql select distinct（#5172 由 @griffio 貢獻）
- [Paging 擴充套件] paging 重新整理初始載入修復（#5615 由 @evant 貢獻）
- [Paging 擴充套件] 新增 macOS 原生目標（#5324 由 @vitorhugods 貢獻）
- [IntelliJ 外掛程式] 支援 K2

## [2.0.2] - 2024-04-05 {id="2-0-2-2024-04-05"}
[2.0.2]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.2

### 新增
- [PostgreSQL 方言] 新增 PostgreSQL STRING_AGG 函式（#4950 由 @anddani 貢獻）
- [PostgreSQL 方言] 為 pg 方言新增 SET 陳述式（#4927 由 @de-luca 貢獻）
- [PostgreSQL 方言] 新增 PostgreSql alter column 序列參數（#4916 由 @griffio 貢獻）
- [PostgreSQL 方言] 為 insert 陳述式新增 postgresql alter column default 支援（#4912 由 @griffio 貢獻）
- [PostgreSQL 方言] 新增 PostgreSql alter sequence 與 drop sequence（#4920 由 @griffio 貢獻）
- [PostgreSQL 方言] 新增 Postgres 正規表示式函式定義（#5025 由 @MariusVolkhart 貢獻）
- [PostgreSQL 方言] 為 GIN 新增語法（#5027 由 @griffio 貢獻）

### 變更
- [IDE 外掛程式] 最低版本需求為 2023.1 / Android Studio Iguana
- [編譯器] 允許在 encapsulatingType 中覆寫型別可 null 性（#4882 由 @eygraber 貢獻）
- [編譯器] 內嵌 SELECT * 的欄位名稱
- [Gradle 外掛程式] 切換至 processIsolation（#5068 由 @nwagu 貢獻）
- [Android 執行階段] 將 Android minSDK 提升至 21（#5094 由 @hfhbd 貢獻）
- [驅動程式] 為方言作者公開更多 JDBC/R2DBC 陳述式方法（#5098 由 @hfhbd 貢獻）

### 修正
- [PostgreSQL 方言] 修復 postgresql alter table alter column（#4868 由 @griffio 貢獻）
- [PostgreSQL 方言] 修復 4448 資料表模型缺少匯入的問題（#4885 由 @griffio 貢獻）
- [PostgreSQL 方言] 修復 4932 postgresql 預設條件約束函式問題（#4934 由 @griffio 貢獻）
- [PostgreSQL 方言] 修復 4879 遷移期間 alter table rename column 中的 postgresql 類別轉換錯誤（#4880 由 @griffio 貢獻）
- [PostgreSQL 方言] 修復 4474 PostgreSql create extension（#4541 由 @griffio 貢獻）
- [PostgreSQL 方言] 修復 5018 PostgreSql add Primary Key 非可 null 型別問題（#5020 由 @griffio 貢獻）
- [PostgreSQL 方言] 修復 4703 聚合運算式問題（#5071 由 @griffio 貢獻）
- [PostgreSQL 方言] 修復 5028 PostgreSql json（#5030 由 @griffio 貢獻）
- [PostgreSQL 方言] 修復 5040 PostgreSql json 運算子（#5041 由 @griffio 貢獻）
- [PostgreSQL 方言] 修復 5040 的 json 運算子繫結問題（#5100 由 @griffio 貢獻）
- [PostgreSQL 方言] 修復 5082 tsvector（#5104 由 @griffio 貢獻）
- [PostgreSQL 方言] 修復 5032 PostgreSql UPDATE FROM 陳述式的欄位鄰接問題（#5035 由 @griffio 貢獻）
- [SQLite 方言] 修復 4897 sqlite alter table rename column（#4899 由 @griffio 貢獻）
- [IDE 外掛程式] 修復錯誤處理常式當機（#4988 由 @aperfilyev 貢獻）
- [IDE 外掛程式] BugSnag 在 IDEA 2023.3 中初始化失敗（由 @aperfilyev 貢獻）
- [IDE 外掛程式] 透過外掛程式在 IntelliJ 中開啟 .sq 檔案時出現 PluginException（由 @aperfilyev 貢獻）
- [IDE 外掛程式] 不將 kotlin 程式庫打包進 intellij 外掛程式中，因其已是外掛程式相依性（#5126）
- [IDE 外掛程式] 使用擴充套件陣列而非串流（#5127）

## [2.0.1] - 2023-12-01 {id="2-0-1-2023-12-01"}
[2.0.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.1

### 新增
- [編譯器] 在執行 SELECT 時新增 multi-column-expr 支援（#4453 由 @Adriel-M 貢獻）
- [PostgreSQL 方言] 新增對 PostgreSQL CREATE INDEX CONCURRENTLY 的支援（#4531 由 @griffio 貢獻）
- [PostgreSQL 方言] 允許 PostgreSQL CTE 輔助陳述式相互參照（#4493 由 @griffio 貢獻）
- [PostgreSQL 方言] 為二元運算式與 sum 新增 PostgreSQL 型別支援（#4539 由 @Adriel-M 貢獻）
- [PostgreSQL 方言] 新增對 PostgreSQL SELECT DISTINCT ON 語法的支援（#4584 由 @griffio 貢獻）
- [PostgreSQL 方言] 新增在 SELECT 陳述式中對 PostgreSQL JSON 函式的支援（#4590 由 @MariusVolkhart 貢獻）
- [PostgreSQL 方言] 新增 generate_series PostgreSQL 函式（#4717 由 @griffio 貢獻）
- [PostgreSQL 方言] 新增額外的 Postgres 字串函式定義（#4752 由 @MariusVolkhart 貢獻）
- [PostgreSQL 方言] 為 min 與 max 聚合函式新增 DATE PostgreSQL 型別（#4816 由 @anddani 貢獻）
- [PostgreSQL 方言] 為 SqlBinaryExpr 新增 PostgreSql 時間型別（#4657 由 @griffio 貢獻）
- [PostgreSQL 方言] 為 postgres 方言新增 TRUNCATE（#4817 由 @de-luca 貢獻）
- [SQLite 3.35 方言] 允許依序評估的多個 ON CONFLICT 子句（#4551 由 @griffio 貢獻）
- [JDBC 驅動程式] 新增語言註解以獲得更愉悅的 SQL 編輯體驗（#4602 由 @MariusVolkhart 貢獻）
- [原生驅動程式] 原生驅動程式：新增對 linuxArm64 的支援（#4792 由 @hfhbd 貢獻）
- [Android 驅動程式] 為 AndroidSqliteDriver 新增 windowSizeBytes 參數（#4804 由 @BoD 貢獻）
- [Paging3 擴充套件] 功能：為 OffsetQueryPagingSource 新增 initialOffset（#4802 由 @MohamadJaara 貢獻）

### 變更
- [編譯器] 在適當的情況下優先使用 Kotlin 型別（#4517 由 @eygraber 貢獻）
- [編譯器] 進行值型別插入時一律包含欄位名稱（#4864）
- [PostgreSQL 方言] 移除 PostgreSQL 方言的實驗性狀態（#4443 由 @hfhbd 貢獻）
- [PostgreSQL 方言] 更新 PostgreSQL 型別的文件（#4569 由 @MariusVolkhart 貢獻）
- [R2DBC 驅動程式] 最佳化在 PostgreSQL 中處理整數資料型別時的效能（#4588 由 @MariusVolkhart 貢獻）

### 移除 {id="removed"}
- [SQLite Javascript 驅動程式] 移除 sqljs-driver（#4613, #4670 由 @dellisd 貢獻）

### 修正
- [編譯器] 修復帶有回傳且無參數的群組陳述式的編譯問題（#4699 由 @griffio 貢獻）
- [編譯器] 繫結引數與 SqlBinaryExpr（#4604 由 @griffio 貢獻）
- [IDE 外掛程式] 若有設定則使用 IDEA 專案 JDK（#4689 由 @griffio 貢獻）
- [IDE 外掛程式] 修復 IDEA 2023.2 及更高版本中的「Unknown element type: TYPE_NAME」錯誤（#4727）
- [IDE 外掛程式] 修復與 2023.2 的一些相容性問題
- [Gradle 外掛程式] 更正 verifyMigrationTask Gradle 任務的文件（#4713 由 @joshfriend 貢獻）
- [Gradle 外掛程式] 新增 Gradle 任務輸出訊息以協助使用者在驗證資料庫前先產生資料庫（#4684 由 @jingwei99 貢獻）
- [PostgreSQL 方言] 修復多次重新命名 PostgreSQL 欄位的問題（#4566 由 @griffio 貢獻）
- [PostgreSQL 方言] 修復 4714 postgresql alter column 可 null 性問題（#4831 由 @griffio 貢獻）
- [PostgreSQL 方言] 修復 4837 alter table alter column（#4846 由 @griffio 貢獻）
- [PostgreSQL 方言] 修復 4501 PostgreSql 序列問題（#4528 由 @griffio 貢獻）
- [SQLite 方言] 允許在欄位運算式上使用 JSON 二元運算子（#4776 由 @eygraber 貢獻）
- [SQLite 方言] Update From 對找到同名多欄位的誤報問題（#4777 由 @eygraber 貢獻）
- [原生驅動程式] 支援具名的記憶體內資料庫（#4662 由 @05nelsonm 貢獻）
- [原生驅動程式] 確保查詢接聽程式集合的執行緒安全（#4567 由 @kpgalligan 貢獻）
- [JDBC 驅動程式] 修復 ConnectionManager 中的連線洩漏問題（#4589 由 @MariusVolkhart 貢獻）
- [JDBC 驅動程式] 修復選擇 ConnectionManager 型別時的 JdbcSqliteDriver url 剖析問題（#4656 由 @05nelsonm 貢獻）

## [2.0.0] - 2023-07-26 {id="2-0-0-2023-07-26"}
[2.0.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0

### 新增
- [MySQL 方言] MySQL：在 IF 運算式中支援 timestamp/bigint（#4329 由 @shellderp 貢獻）
- [MySQL 方言] MySQL：新增 now（#4431 由 @hfhbd 貢獻）
- [Web 驅動程式] 啟用 NPM 套件發佈（#4364）
- [IDE 外掛程式] 當 Gradle 工具連線失敗時允許使用者顯示堆疊追蹤（#4383）

### 變更
- [Sqlite 驅動程式] 簡化 JdbcSqliteDriver 的結構描述遷移使用方式（#3737 由 @morki 貢獻）
- [R2DBC 驅動程式] 真實非同步 R2DBC 游標（#4387 由 @hfhbd 貢獻）

### 修正
- [IDE 外掛程式] 直到需要時才具現化資料庫專案服務（#4382）
- [IDE 外掛程式] 處理尋找用法期間的處理程序取消操作（#4340）
- [IDE 外掛程式] 修復非同步程式碼的 IDE 產生問題（#4406）
- [IDE 外掛程式] 將套件結構的組裝改為單次計算且脫離 EDT（#4417）
- [IDE 外掛程式] 在 2023.2 上使用正確的虛設常式索引金鑰進行 Kotlin 型別解析（#4416）
- [IDE 外掛程式] 在執行搜尋前等待索引就緒（#4419）
- [IDE 外掛程式] 若索引不可用則不執行跳轉（#4420）
- [編譯器] 修復群組陳述式的結果運算式問題（#4378）
- [編譯器] 不使用虛擬資料表作為介面型別（#4427 由 @hfhbd 貢獻）

## [2.0.0-rc02] - 2023-06-27 {id="2-0-0-rc02-2023-06-27"}
[2.0.0-rc02]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-rc02

### 新增
- [MySQL 方言] 支援小寫日期型別以及日期型別上的 min 和 max（#4243 由 @shellderp 貢獻）
- [MySQL 方言] 為二元運算式與 sum 支援 MySQL 型別（#4254 由 @shellderp 貢獻）
- [MySQL 方言] 支援無顯示寬度的無正負號整數 (unsigned ints)（#4306 由 @shellderp 貢獻）
- [MySQL 方言] 支援 LOCK IN SHARED MODE
- [PostgreSQL 方言] 為 min max 新增布林與 Timestamp 支援（#4245 由 @griffio 貢獻）
- [PostgreSQL 方言] Postgres：新增視窗函式支援（#4283 由 @hfhbd 貢獻）
- [執行階段] 為執行階段新增 linuxArm64、androidNative 和 watchosDeviceArm 目標（#4258 由 @hfhbd 貢獻）
- [Paging 擴充套件] 為 paging 擴充套件新增 linux 與 mingw x64 目標（#4280 由 @chippman 貢獻）

### 變更
- [Gradle 外掛程式] 為 Android API 34 新增自動方言支援（#4251）
- [Paging 擴充套件] 在 QueryPagingSource 中新增對 SuspendingTransacter 的支援（#4292 由 @daio 貢獻）
- [執行階段] 改進 addListener API（#4244 由 @hfhbd 貢獻）
- [執行階段] 使用 Long 作為遷移版本（#4297 由 @hfhbd 貢獻）

### 修正
- [Gradle 外掛程式] 為產生的原始碼使用穩定的輸出路徑（#4269 由 @joshfriend 貢獻）
- [Gradle 外掛程式] Gradle 調整（#4222 由 @3flex 貢獻）

## [2.0.0-rc01] - 2023-05-29 {id="2-0-0-rc01-2023-05-29"}
[2.0.0-rc01]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-rc01

### 新增
- [Paging] 為 paging 擴充套件新增 js browser 目標（#3843 由 @sproctor 貢獻）
- [Paging] 為 androidx-paging3 擴充套件新增 iosSimulatorArm64 目標（#4117）
- [PostgreSQL 方言] 新增 gen_random_uuid() 的支援與測試（#3855 由 @davidwheeler123 貢獻）
- [PostgreSQL 方言] Postgres alter table add constraint（#4116 由 @griffio 貢獻）
- [PostgreSQL 方言] Alter table add constraint check（#4120 由 @griffio 貢獻）
- [PostgreSQL 方言] 新增 PostgreSql 字元長度函式（#4121 由 @griffio 貢獻）
- [PostgreSQL 方言] 新增 PostgreSql 欄位預設時間間隔 (interval)（#4142 由 @griffio 貢獻）
- [PostgreSQL 方言] 新增 PostgreSql interval 欄位結果（#4152 由 @griffio 貢獻）
- [PostgreSQL 方言] 新增 PostgreSql Alter Column（#4165 由 @griffio 貢獻）
- [PostgreSQL 方言] PostgreSQL：新增 date_part（#4198 由 @hfhbd 貢獻）
- [MySQL 方言] 新增 SQL 字元長度函式（#4134 由 @griffio 貢獻）
- [IDE 外掛程式] 新增 sqldelight 目錄建議（#3976 由 @aperfilyev 貢獻）
- [IDE 外掛程式] 在專案樹中壓縮中間套件（#3992 由 @aperfilyev 貢獻）
- [IDE 外掛程式] 新增 join 子句補全（#4086 由 @aperfilyev 貢獻）
- [IDE 外掛程式] 建立檢視意圖操作與即時範本（#4074 由 @aperfilyev 貢獻）
- [IDE 外掛程式] 針對 DELETE 或 UPDATE 中遺漏的 WHERE 發出警告（#4058 由 @aperfilyev 貢獻）
- [Gradle 外掛程式] 啟用型別安全專案存取器（#4005 由 @hfhbd 貢獻）

### 變更
- [Gradle 外掛程式] 允許透過 ServiceLoader 機制為 VerifyMigrationTask 註冊 DriverInitializer（#3986 由 @C2H6O 貢獻）
- [Gradle 外掛程式] 建立明確的編譯器環境（#4079 由 @hfhbd 貢獻）
- [JS 驅動程式] 將 Web Worker 驅動程式拆分為獨立構件
- [JS 驅動程式] 不公開 JsWorkerSqlCursor（#3874 由 @hfhbd 貢獻）
- [JS 驅動程式] 停用 sqljs 驅動程式的發佈（#4108）
- [執行階段] 強制同步驅動程式必須使用同步架構初始化器（#4013）
- [執行階段] 改進游標的非同步支援（#4102）
- [執行階段] 移除已棄用的目標（#4149 由 @hfhbd 貢獻）
- [執行階段] 移除對舊記憶體模型 (MM) 的支援（#4148 由 @hfhbd 貢獻）

### 修正
- [R2DBC 驅動程式] R2DBC：等候關閉驅動程式（#4139 由 @hfhbd 貢獻）
- [編譯器] 在資料庫 create(SqlDriver) 中包含來自遷移的 PRAGMA（#3845 由 @MariusVolkhart 貢獻）
- [編譯器] 修復 RETURNING 子句的程式碼產生（#3872 由 @MariusVolkhart 貢獻）
- [編譯器] 不為虛擬資料表產生型別（#4015）
- [Gradle 外掛程式] Gradle 外掛程式的小型體驗改進（#3930 由 @zacsweers 貢獻）
- [IDE 外掛程式] 修復未解析的 Kotlin 型別（#3924 由 @aperfilyev 貢獻）
- [IDE 外掛程式] 修復展開萬用字元意圖操作以支援限定符（#3979 由 @aperfilyev 貢獻）
- [IDE 外掛程式] 若缺少 JAVA_HOME 則使用可用的 JDK（#3925 由 @aperfilyev 貢獻）
- [IDE 外掛程式] 修復套件名稱上的尋找用法（#4010）
- [IDE 外掛程式] 不為無效元素顯示自動匯入（#4008）
- [IDE 外掛程式] 若缺少方言則不進行解析（#4009）
- [IDE 外掛程式] 忽略編譯器在無效狀態下的 IDE 執行（#4016）
- [IDE 外掛程式] 新增對 IntelliJ 2023.1 的支援（#4037 由 @madisp 貢獻）
- [IDE 外掛程式] 在欄位重新命名時重新命名具名引數的使用（#4027 由 @aperfilyev 貢獻）
- [IDE 外掛程式] 修復新增遷移快顯視窗（#4105 由 @aperfilyev 貢獻）
- [IDE 外掛程式] 在遷移檔案中停用 SchemaNeedsMigrationInspection（#4106 由 @aperfilyev 貢獻）
- [IDE 外掛程式] 在產生遷移時使用 SQL 欄位名稱而非型別名稱（#4112 由 @aperfilyev 貢獻）

## [2.0.0-alpha05] - 2023-01-20 {id="2-0-0-alpha05-2023-01-20"}
[2.0.0-alpha05]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha05

### 新增
- [Paging] 多平台 paging 擴充套件（由 @jeffdgr8 貢獻）
- [執行階段] 為 Listener 介面新增 fun 修飾詞。
- [SQLite 方言] 新增 SQLite 3.33 支援（UPDATE FROM）（由 @eygraber 貢獻）
- [PostgreSQL 方言] 在 postgresql 中支援 UPDATE FROM（由 @eygraber 貢獻）

### 變更
- [RDBC 驅動程式] 公開連線（由 @hfhbd 貢獻）
- [執行階段] 將遷移回呼移至主要 `migrate` 函式中
- [Gradle 外掛程式] 對下游專案隱藏 Configurations
- [Gradle 外掛程式] 僅遮蔽 (shade) Intellij（由 @hfhbd 貢獻）
- [Gradle 外掛程式] 支援 Kotlin 1.8.0-Beta 並新增多版本 Kotlin 測試（由 @hfhbd 貢獻）

### 修正
- [RDBC 驅動程式] 改用 javaObjectType（由 @hfhbd 貢獻）
- [RDBC 驅動程式] 修復 bindStatement 中的基本型別 null 值（由 @hfhbd 貢獻）
- [RDBC 驅動程式] 支援 R2DBC 1.0（由 @hfhbd 貢獻）
- [PostgreSQL 方言] Postgres：修復無型別參數的陣列（由 @hfhbd 貢獻）
- [IDE 外掛程式] 將 intellij 升級至 221.6008.13（由 @hfhbd 貢獻）
- [編譯器] 從純檢視解析遞迴原始資料表（由 @hfhbd 貢獻）
- [編譯器] 使用來自資料表外鍵子句的值類別 (value classes)（由 @hfhbd 貢獻）
- [編譯器] 修復 SelectQueryGenerator 以支援不帶圓括號的繫結運算式（由 @bellatoris 貢獻）
- [編譯器] 修復使用交易時重複產生 ${name}Indexes 變數的問題（由 @sachera 貢獻）

## [1.5.5] - 2023-01-20 {id="1-5-5-2023-01-20"}
[1.5.5]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.5

此版本為 Kotlin 1.8 與 IntelliJ 2021+ 的相容性版本，支援 JDK 17。

## [1.5.4] - 2022-10-06 {id="1-5-4-2022-10-06"}
[1.5.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.4

此為 Kotlin 1.7.20 與 AGP 7.3.0 的相容性更新。

## [2.0.0-alpha04] - 2022-10-03 {id="2-0-0-alpha04-2022-10-03"}
[2.0.0-alpha04]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha04

### 重大變更 {id="breaking-changes"}

- Paging 3 擴充套件 API 已變更為僅允許計數使用 int 型別。
- 協同程式擴充套件現在必須傳入 dispatcher，不再提供預設值。
- Dialect 與 Driver 類別現在為 final，請改用委託 (delegation)。

### 新增
- [HSQL 方言] Hsql：在 Insert 中支援為產生欄位使用 DEFAULT（#3372 由 @hfhbd 貢獻）
- [PostgreSQL 方言] PostgreSQL：在 INSERT 中支援為產生欄位使用 DEFAULT（#3373 由 @hfhbd 貢獻）
- [PostgreSQL 方言] 為 PostgreSQL 新增 NOW()（#3403 由 @hfhbd 貢獻）
- [PostgreSQL 方言] PostgreSQL 新增 NOT 運算子（#3504 由 @hfhbd 貢獻）
- [Paging] 允許將 CoroutineContext 傳入 *QueryPagingSource（#3384）
- [Gradle 外掛程式] 為方言新增更好的版本目錄支援（#3435）
- [原生驅動程式] 新增回呼以掛勾至 NativeSqliteDriver 的 DatabaseConfiguration 建立流程（#3512 由 @svenjacobs 貢獻）

### 變更
- [Paging] 為以 KeyedQueryPagingSource 為基礎的 QueryPagingSource 函式新增預設發送器 (dispatcher)（#3385）
- [Paging] 使 OffsetQueryPagingSource 僅適用於 Int（#3386）
- [非同步執行階段] 將 await* 移至上層類別 ExecutableQuery（#3524 由 @hfhbd 貢獻）
- [協同程式擴充套件] 移除 flow 擴充套件的預設參數（#3489）

### 修正
- [Gradle 外掛程式] 更新至 Kotlin 1.7.20（#3542 由 @zacsweers 貢獻）
- [R2DBC 驅動程式] 採用不一定會傳送值的 R2DBC 變更（#3525 由 @hfhbd 貢獻）
- [HSQL 方言] 修復使用 Hsql 時失敗的 sqlite VerifyMigrationTask（#3380 由 @hfhbd 貢獻）
- [Gradle 外掛程式] 將任務轉換為使用延遲設定 API（由 @3flex 貢獻）
- [Gradle 外掛程式] 避免 Kotlin 1.7.20 中的 NPE（#3398 由 @ZacSweers 貢獻）
- [Gradle 外掛程式] 修復壓縮遷移任務的描述（#3449）
- [IDE 外掛程式] 修復較新 Kotlin 外掛程式中的 NoSuchFieldError（#3422 由 @madisp 貢獻）
- [IDE 外掛程式] IDEA：UnusedQueryInspection - 修復 ArrayIndexOutOfBoundsException（#3427 由 @vanniktech 貢獻）
- [IDE 外掛程式] 針對舊的 Kotlin 外掛程式參照使用反射
- [編譯器] 帶有擴充函式的自訂方言不會建立匯入（#3338 由 @hfhbd 貢獻）
- [編譯器] 修復逸出 CodeBlock.of("${CodeBlock.toString()}") 的問題（#3340 由 @hfhbd 貢獻）
- [編譯器] 在遷移中等候非同步 execute 陳述式（#3352）
- [編譯器] 修復 AS（#3370 由 @hfhbd 貢獻）
- [編譯器] `getObject` 方法支援自動填入實際型別（#3401 由 @robxyy 貢獻）
- [編譯器] 修復非同步群組 returning 陳述式的程式碼產生（#3411）
- [編譯器] 若可行則推論繫結參數的 Kotlin 型別，否則回報更明確的錯誤訊息並失敗（#3413 由 @hfhbd 貢獻）
- [編譯器] 禁止 ABS("foo")（#3430 由 @hfhbd 貢獻）
- [編譯器] 支援從其他參數推論 Kotlin 型別（#3431 由 @hfhbd 貢獻）
- [編譯器] 一律建立資料庫實作（#3540 由 @hfhbd 貢獻）
- [編譯器] 放寬 javaDoc 並將其也加入自訂對應器函式（#3554 由 @hfhbd 貢獻）
- [編譯器] 修復繫結中的 DEFAULT（由 @hfhbd 貢獻）
- [Paging] 修復 Paging 3（#3396）
- [Paging] 允許使用 Long 建構 OffsetQueryPagingSource（#3409）
- [Paging] 不要靜態置換 Dispatchers.Main（#3428）

## [2.0.0-alpha03] - 2022-06-17 {id="2-0-0-alpha03-2022-06-17"}
[2.0.0-alpha03]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha03

### 重大變更

- 方言現在如同標準 Gradle 相依性一樣被參照。
```groovy
sqldelight {
  MyDatabase {
    dialect("app.cash.sqldelight:postgres-dialect:2.0.0-alpha03")
  }
}
```
- 移除了 `AfterVersionWithDriver` 型別，改用一律帶有驅動程式的 `AfterVersion`。
- `Schema` 型別不再是 `SqlDriver` 的子型別。
- `PreparedStatement` API 現在使用以 0 為基底的索引進行呼叫。

### 新增
- [IDE 外掛程式] 新增對執行中資料庫執行 SQLite、MySQL 和 PostgreSQL 指令的支援（#2718 由 @aperfilyev 貢獻）
- [IDE 外掛程式] 新增對 Android Studio 資料庫檢查器的支援（#3107 由 @aperfilyev 貢獻）
- [執行階段] 新增對非同步驅動程式的支援（#3168 由 @dellisd 貢獻）
- [原生驅動程式] 支援新的 Kotlin Native 記憶體模型（#3177 由 @kpgalligan 貢獻）
- [JS 驅動程式] 為 SqlJs worker 新增驅動程式（#3203 由 @dellisd 貢獻）
- [Gradle 外掛程式] 公開 SQLDelight 任務的類別路徑 (classpath)
- [Gradle 外掛程式] 新增用於壓縮遷移的 Gradle 任務
- [Gradle 外掛程式] 新增旗標以在遷移檢查期間忽略架構定義
- [MySQL 方言] 在 MySQL 中支援 FOR SHARE 與 FOR UPDATE（#3098）
- [MySQL 方言] 支援 MySQL 索引提示（#3099）
- [PostgreSQL 方言] 新增 date_trunc（#3295 由 @hfhbd 貢獻）
- [JSON 擴充套件] 支援 JSON 資料表函式（#3090）

### 變更
- [執行階段] 移除不含驅動程式的 AfterVersion 型別（#3091）
- [執行階段] 將 Schema 型別移至最上層
- [執行階段] 開放方言與解析器以支援第三方實作（#3232 由 @hfhbd 貢獻）
- [編譯器] 在失敗報告中包含用於編譯的方言（#3086）
- [編譯器] 略過未使用的介接器（#3162 由 @eygraber 貢獻）
- [編譯器] 在 PrepareStatement 中使用以 0 為基底的索引（#3269 由 @hfhbd 貢獻）
- [Gradle 外掛程式] 方言改為標準 Gradle 相依性而非字串（#3085）
- [Gradle 外掛程式] Gradle 驗證任務：缺少資料庫檔案時擲出例外狀況（#3126 由 @vanniktech 貢獻）

### 修正
- [Gradle 外掛程式] Gradle 外掛程式的微幅清理與調整（#3171 由 @3flex 貢獻）
- [Gradle 外掛程式] 產生目錄不使用 AGP 字串
- [Gradle 外掛程式] 使用 AGP 命名空間屬性（#3220）
- [Gradle 外掛程式] 不要將 kotlin-stdlib 新增為 Gradle 外掛程式的執行時期相依性（#3245 由 @mbonnin 貢獻）
- [Gradle 外掛程式] 簡化多平台設定（#3246 由 @mbonnin 貢獻）
- [Gradle 外掛程式] 支援純 JS 專案（#3310 由 @hfhbd 貢獻）
- [IDE 外掛程式] Gradle 工具 API 改用 JAVA_HOME（#3078）
- [IDE 外掛程式] 在 IDE 外掛程式內部使用正確的 classLoader 載入 JDBC 驅動程式（#3080）
- [IDE 外掛程式] 在無效化之前將檔案元素標記為 null，以避免在既有 PSI 變更期間發生錯誤（#3082）
- [IDE 外掛程式] 在 ALTER TABLE 陳述式中尋找新資料表名稱的用法時不發生當機（#3106）
- [IDE 外掛程式] 最佳化檢查器並使其針對預期的例外狀況型別靜默失敗（#3121）
- [IDE 外掛程式] 刪除應為產生目錄的檔案（#3198）
- [IDE 外掛程式] 修復非安全運算子呼叫
- [編譯器] 確保帶有 RETURNING 陳述式的更新與刪除會執行查詢（#3084）
- [編譯器] 正確推論複合選取中的引數型別（#3096）
- [編譯器] 通用資料表不產生資料類別，因此不回傳它們（#3097）
- [編譯器] 更快速找到最頂層的遷移檔案（#3108）
- [編譯器] 在管道運算子上正確繼承可 null 性
- [編譯器] 支援 iif ANSI SQL 函式
- [編譯器] 不產生空的查詢檔案（#3300 由 @hfhbd 貢獻）
- [編譯器] 修復僅有問號的介接器問題（#3314 由 @hfhbd 貢獻）
- [PostgreSQL 方言] Postgres 主鍵欄位一律為非 null（#3092）
- [PostgreSQL 方言] 修復多個資料表中同名的複製問題（#3297 由 @hfhbd 貢獻）
- [SQLite 3.35 方言] 僅在從修改後的資料表中刪除已建立索引的欄位時才顯示錯誤（#3158 由 @eygraber 貢獻）

## [2.0.0-alpha02] - 2022-04-13 {id="2-0-0-alpha02-2022-04-13"}
[2.0.0-alpha02]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha02

### 重大變更

- 您需要將所有出現的 `app.cash.sqldelight.runtime.rx` 替換為 `app.cash.sqldelight.rx2`

### 新增
- [編譯器] 支援在群組陳述式結尾使用 returning
- [編譯器] 透過方言模組支援編譯器擴充套件，並新增 SQLite JSON 擴充套件（#1379, #2087）
- [編譯器] 支援回傳值的 PRAGMA 陳述式（#1106）
- [編譯器] 支援為標記的欄位產生值型別
- [編譯器] 新增對開放式鎖定與驗證的支援（#1952）
- [編譯器] 支援多重更新陳述式
- [PostgreSQL] 支援 postgres returning 陳述式
- [PostgreSQL] 支援 postgres 日期型別
- [PostgreSQL] 支援 pg 時間間隔 (intervals)
- [PostgreSQL] 支援 PG 布林值並修復 alter tables 上的插入
- [PostgreSQL] 支援 Postgres 中的選用 limit
- [PostgreSQL] 支援 PG BYTEA 型別
- [PostgreSQL] 新增 postgres serial 測試
- [PostgreSQL] 支援 for update postgres 語法
- [PostgreSQL] 支援 PostgreSQL 陣列型別
- [PostgreSQL] 在 PG 中正確儲存/擷取 UUID 型別
- [PostgreSQL] 支援 PostgreSQL NUMERIC 型別（#1882）
- [PostgreSQL] 支援在通用資料表運算式內部回傳查詢（#2471）
- [PostgreSQL] 支援 JSON 專屬運算子
- [PostgreSQL] 新增 Postgres Copy（由 @hfhbd 貢獻）
- [MySQL] 支援 MySQL Replace
- [MySQL] 支援 NUMERIC/BigDecimal MySQL 型別（#2051）
- [MySQL] 支援 MySQL truncate 陳述式
- [MySQL] 在 MySQL 中支援 JSON 專屬運算子（由 @eygraber 貢獻）
- [MySQL] 支援 MySQL INTERVAL（#2969 由 @eygraber 貢獻）
- [HSQL] 新增 HSQL 視窗功能
- [SQLite] 不要置換 WHERE 中可 null 參數的相等性檢查（#1490 由 @eygraber 貢獻）
- [SQLite] 支援 Sqlite 3.35 returning 陳述式（#1490 由 @eygraber 貢獻）
- [SQLite] 支援 GENERATED 子句
- [SQLite] 新增對 Sqlite 3.38 方言的支援（由 @eygraber 貢獻）

### 變更
- [編譯器] 稍微整理產生的程式碼
- [編譯器] 禁止在群組陳述式中使用資料表參數（#1822）
- [編譯器] 將群組查詢置於交易內（#2785）
- [執行階段] 從驅動程式的 execute 方法回傳更新的資料列數
- [執行階段] 將 SqlCursor 限制在存取連線的關鍵區段內（#2123 由 @andersio 貢獻）
- [Gradle 外掛程式] 比較遷移的架構定義（#841）
- [PostgreSQL] PG 禁止使用雙引號
- [MySQL] 在 MySQL 中使用 == 時報錯（#2673）

### 修正
- [編譯器] 來自不同資料表的相同介接器型別在 2.0 alpha 中導致編譯錯誤
- [編譯器] 編譯 upsert 陳述式時的問題（#2791）
- [編譯器] 若有多個符合項目，查詢結果應使用 select 中的資料表（#1874, #2313）
- [編譯器] 支援更新具有 INSTEAD OF 觸發程序的檢視（#1018）
- [編譯器] 支援函式名稱中使用 from 與 for
- [編譯器] 允許函式運算式中使用 SEPARATOR 關鍵字
- [編譯器] 無法在 ORDER BY 中存取具別名資料表的 ROWID
- [編譯器] 在 MySQL 的 HAVING 子句中無法識別具別名的欄位名稱
- [編譯器] 錯誤的「Multiple columns found」錯誤
- [編譯器] 無法設定 PRAGMA locking_mode = EXCLUSIVE;
- [PostgreSQL] Postgresql 重新命名欄位
- [MySQL] 無法識別 UNIX_TIMESTAMP、TO_SECONDS、JSON_ARRAYAGG MySQL 函式
- [SQLite] 修復 SQLite 視窗功能
- [IDE 外掛程式] 在空進度指示器中執行跳轉處理常式（#2990）
- [IDE 外掛程式] 確保專案未設定時醒目提示造訪器不執行（#2981, #2976）
- [IDE 外掛程式] 確保傳遞產生的程式碼在 IDE 中也會更新（#1837）
- [IDE 外掛程式] 更新方言時無效化索引

## [2.0.0-alpha01] - 2022-03-31 {id="2-0-0-alpha01-2022-03-31"}
[2.0.0-alpha01]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha01

這是 2.0 的第一個 Alpha 版本，包含一些重大變更。我們預期後續還會有更多 ABI 重大變更，因此請勿發佈相依於此版本的程式庫（應用程式則不受影響）。

### 重大變更

- 首先，您需要將所有出現的 `com.squareup.sqldelight` 替換為 `app.cash.sqldelight`
- 其次，您需要將所有出現的 `app.cash.sqldelight.android` 替換為 `app.cash.sqldelight.driver.android`
- 第三，您需要將所有出現的 `app.cash.sqldelight.sqlite.driver` 替換為 `app.cash.sqldelight.driver.jdbc.sqlite`
- 第四，您需要將所有出現的 `app.cash.sqldelight.drivers.native` 替換為 `app.cash.sqldelight.driver.native`
- IDE 外掛程式必須更新至 2.X 版本，可在 [alpha 或 eap 頻道](https://plugins.jetbrains.com/plugin/8191-sqldelight/versions/alpha) 中找到
- 方言現在是相依項，您可以在 Gradle 內指定：

```gradle
sqldelight {
  MyDatabase {
    packageName = "com.example"
    dialect = "app.cash.sqldelight:mysql-dialect:2.0.0-alpha01"
  }
}
```

目前支援的方言有 `mysql-dialect`、`postgresql-dialect`、`hsql-dialect`、`sqlite-3-18-dialect`、`sqlite-3-24-dialect`、`sqlite-3-25-dialect`、`sqlite-3-30-dialect` 和 `sqlite-3-35-dialect`

- 基本型別現在必須明確匯入（例如 `INTEGER AS Boolean` 必須 `import kotlin.Boolean`），先前支援的某些型別現在需要介接器。大多數轉換的基本介接器可在 `app.cash.sqldelight:primitive-adapters:2.0.0-alpha01` 中取得（例如用於 `Integer AS kotlin.Int` 的 `IntColumnAdapter`）。

### 新增
- [IDE 外掛程式] 基礎建議遷移（由 @aperfilyev 貢獻）
- [IDE 外掛程式] 新增匯入提示操作（由 @aperfilyev 貢獻）
- [IDE 外掛程式] 新增 Kotlin 類別補全（由 @aperfilyev 貢獻）
- [Gradle 外掛程式] 為 Gradle 型別安全專案存取器新增快速鍵（由 @hfhbd 貢獻）
- [編譯器] 依據方言自訂程式碼產生（由 @MariusVolkhart 貢獻）
- [JDBC 驅動程式] 為 JdbcDriver 新增常見型別（由 @MariusVolkhart 貢獻）
- [SQLite] 新增對 sqlite 3.35 的支援（由 @eygraber 貢獻）
- [SQLite] 新增對 ALTER TABLE DROP COLUMN 的支援（由 @eygraber 貢獻）
- [SQLite] 新增對 Sqlite 3.30 方言的支援（由 @eygraber 貢獻）
- [SQLite] 在 sqlite 中支援 NULLS FIRST/LAST（由 @eygraber 貢獻）
- [HSQL] 為 HSQL 新增 generated 子句支援（由 @MariusVolkhart 貢獻）
- [HSQL] 在 HSQL 中新增對具名參數的支援（由 @MariusVolkhart 貢獻）
- [HSQL] 自訂 HSQL insert 查詢（由 @MariusVolkhart 貢獻）

### 變更
- [全部] 套件名稱已從 com.squareup.sqldelight 變更為 app.cash.sqldelight。
- [執行階段] 將方言移至各自獨立的 Gradle 模組中
- [執行階段] 改用由驅動程式實作的查詢通知。
- [執行階段] 將預設欄位介接器擷取至獨立模組（#2056, #2060）
- [編譯器] 讓模組產生查詢實作，而非在每個模組中重複執行
- [編譯器] 移除產生的資料類別的自訂 toString 產生作業（由 @PaulWoitaschek 貢獻）
- [JS 驅動程式] 從 sqljs-driver 移除 sql.js 相依性（由 @dellisd 貢獻）
- [Paging] 移除 Android paging 2 擴充套件
- [IDE 外掛程式] 在 SQLDelight 同步時新增編輯器橫幅（#2511）
- [IDE 外掛程式] 最低支援的 IntelliJ 版本為 2021.1

### 修正
- [執行階段] 展平接聽程式清單以減少記憶體分配與指標追蹤（由 @andersio 貢獻）
- [IDE 外掛程式] 修復錯誤訊息以允許跳轉至錯誤處（由 @hfhbd 貢獻）
- [IDE 外掛程式] 新增遺漏的檢查描述（#2768 由 @aperfilyev 貢獻）
- [IDE 外掛程式] 修復 GotoDeclarationHandler 中的例外狀況（#2531, #2688, #2804 由 @aperfilyev 貢獻）
- [IDE 外掛程式] 醒目提示 import 關鍵字（由 @aperfilyev 貢獻）
- [IDE 外掛程式] 修復未解析的 Kotlin 型別（#1678 由 @aperfilyev 貢獻）
- [IDE 外掛程式] 修復未解析套件的醒目提示（#2543 由 @aperfilyev 貢獻）
- [IDE 外掛程式] 若專案索引尚未初始化，則不嘗試檢查不相符的欄位
- [IDE 外掛程式] 在 Gradle 同步發生之前不初始化檔案索引
- [IDE 外掛程式] 若 Gradle 同步開始，則取消 SQLDelight 匯入
- [IDE 外掛程式] 在執行復原操作的執行緒之外重新產生資料庫
- [IDE 外掛程式] 若參照無法解析，則使用空白 Java 型別
- [IDE 外掛程式] 在檔案剖析期間正確脫離主執行緒，且僅在寫入時切回
- [IDE 外掛程式] 改進與舊版 IntelliJ 的相容性（由 @3flex 貢獻）
- [IDE 外掛程式] 使用更快速的註解 API
- [Gradle 外掛程式] 新增執行階段時明確支援 js/android 外掛程式（由 @ZacSweers 貢獻）
- [Gradle 外掛程式] 註冊遷移輸出任務，且不從遷移中衍生結構描述（#2744 由 @kevincianfarini 貢獻）
- [Gradle 外掛程式] 若遷移任務當機，印出其執行時當機的檔案
- [Gradle 外掛程式] 產生程式碼時對檔案進行排序以確保冪等輸出（由 @ZacSweers 貢獻）
- [編譯器] 使用更快的 API 反覆運算檔案，且不探索整個 PSI 圖
- [編譯器] 為 select 函式參數新增關鍵字重整 (mangling)（#2759 由 @aperfilyev 貢獻）
- [編譯器] 修復遷移介接器的 packageName（由 @hfhbd 貢獻）
- [編譯器] 在屬性而非型別上發出註解（#2798 由 @aperfilyev 貢獻）
- [編譯器] 在傳遞給 Query 子型別之前對引數進行排序（#2379 由 @aperfilyev 貢獻）

## [1.5.3] - 2021-11-23 {id="1-5-3-2021-11-23"}
[1.5.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.3

### 新增
- [JDBC 驅動程式] 開放 JdbcDriver 供第三方驅動程式實作（#2672 由 @hfhbd 貢獻）
- [MySQL 方言] 新增遺漏的時間遞增函式（#2671 由 @sdoward 貢獻）
- [協同程式擴充套件] 為 coroutines-extensions 新增 M1 目標（由 @PhilipDukhov 貢獻）

### 變更
- [Paging3 擴充套件] 將 sqldelight-android-paging3 改以 JAR 而非 AAR 形式發佈（#2634 由 @julioromano 貢獻）
- 同時為軟關鍵字的屬性名稱現在將加上底線後綴。例如 `value` 將公開為 `value_`

### 修正
- [編譯器] 不為重複的陣列參數擷取變數（由 @aperfilyev 貢獻）
- [Gradle 外掛程式] 新增 kotlin.mpp.enableCompatibilityMetadataVariant（#2628 由 @martinbonnin 貢獻）
- [IDE 外掛程式] 尋找用法的處理過程需要讀取操作 (read action)

## [1.5.2] - 2021-10-12 {id="1-5-2-2021-10-12"}
[1.5.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.2

### 新增
- [Gradle 外掛程式] 支援 HMPP（#2548 由 @martinbonnin 貢獻）
- [IDE 外掛程式] 新增 NULL 比較檢查（由 @aperfilyev 貢獻）
- [IDE 外掛程式] 新增檢查隱藏器 (inspection suppressor)（#2519 由 @aperfilyev 貢獻）
- [IDE 外掛程式] 混合具名與位置參數檢查（由 @aperfilyev 貢獻）
- [SQLite 驅動程式] 新增 mingwX86 目標（#2558 由 @enginegl 貢獻）
- [SQLite 驅動程式] 新增 M1 目標
- [SQLite 驅動程式] 新增 linuxX64 支援（#2456 由 @chippmann 貢獻）
- [MySQL 方言] 為 mysql 新增 ROW_COUNT 函式（#2523）
- [PostgreSQL 方言] postgres 重新命名、刪除欄位（由 @pabl0rg 貢獻）
- [PostgreSQL 方言] PostgreSQL 文法無法識別 CITEXT
- [PostgreSQL 方言] 包含 TIMESTAMP WITH TIME ZONE 與 TIMESTAMPTZ
- [PostgreSQL 方言] 為 PostgreSQL GENERATED 欄位新增文法
- [執行階段] 提供 SqlDriver 作為 AfterVersion 的參數（#2534, 2614 由 @ahmedre 貢獻）

### 變更
- [Gradle 外掛程式] 明確要求 Gradle 7.0（#2572 由 @martinbonnin 貢獻）
- [Gradle 外掛程式] 使 VerifyMigrationTask 支援 Gradle 的最新狀態檢查（#2533 由 @3flex 貢獻）
- [IDE 外掛程式] 將可 null 型別與非 null 型別進行聯結時，不發出「Join compares two columns of different types」警告（#2550 由 @pchmielowski 貢獻）
- [IDE 外掛程式] 釐清欄位型別中小寫 'as' 的錯誤提示（由 @aperfilyev 貢獻）

### 修正
- [IDE 外掛程式] 若專案已處置，則不以新方言重新剖析（#2609）
- [IDE 外掛程式] 若關聯的虛擬檔案為 null，則模組為 null（#2607）
- [IDE 外掛程式] 避免在未使用的查詢檢查期間當機（#2610）
- [IDE 外掛程式] 在寫入操作內部執行資料庫同步寫入（#2605）
- [IDE 外掛程式] 讓 IDE 排程 SQLDelight 同步
- [IDE 外掛程式] 修復 JavaTypeMixin 中的 NPE（#2603 由 @aperfilyev 貢獻）
- [IDE 外掛程式] 修復 MismatchJoinColumnInspection 中的 IndexOutOfBoundsException（#2602 由 @aperfilyev 貢獻）
- [IDE 外掛程式] 新增 UnusedColumnInspection 的描述（#2600 由 @aperfilyev 貢獻）
- [IDE 外掛程式] 將 PsiElement.generatedVirtualFiles 包裹進讀取操作中（#2599 由 @aperfilyev 貢獻）
- [IDE 外掛程式] 移除不必要的非 null 轉換（#2596）
- [IDE 外掛程式] 正確處理尋找用法中的 null（#2595）
- [IDE 外掛程式] 修復 Android 產生檔案的 IDE 自動補全（#2573 由 @martinbonnin 貢獻）
- [IDE 外掛程式] 修復 SqlDelightGotoDeclarationHandler 中的 NPE（由 @aperfilyev 貢獻）
- [IDE 外掛程式] 重整 insert 陳述式中引數內的 Kotlin 關鍵字（#2433 由 @aperfilyev 貢獻）
- [IDE 外掛程式] 修復 SqlDelightFoldingBuilder 中的 NPE（#2382 由 @aperfilyev 貢獻）
- [IDE 外掛程式] 擷取 CopyPasteProcessor 中的 ClassCastException（#2369 由 @aperfilyev 貢獻）
- [IDE 外掛程式] 修復 update 即時範本（由 @IliasRedissi 貢獻）
- [IDE 外掛程式] 為意圖操作新增描述（#2489 由 @aperfilyev 貢獻）
- [IDE 外掛程式] 修復找不到資料表時 CreateTriggerMixin 中的例外狀況（由 @aperfilyev 貢獻）
- [編譯器] 對資料表建立陳述式進行拓撲排序
- [編譯器] 停止在目錄上叫用 `forDatabaseFiles` 回呼（#2532）
- [Gradle 外掛程式] 將 generateDatabaseInterface 任務相依性傳播至潛在取用者（#2518 由 @martinbonnin 貢獻）

## [1.5.1] - 2021-07-16 {id="1-5-1-2021-07-16"}
[1.5.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.1

### 新增
- [PostgreSQL 方言] PostgreSQL JSONB 與 ON Conflict Do Nothing（由 @satook 貢獻）
- [PostgreSQL 方言] 新增對 PostgreSQL ON CONFLICT (column, ...) DO UPDATE 的支援（由 @satook 貢獻）
- [MySQL 方言] 支援 MySQL 產生欄位（由 @JGulbronson 貢獻）
- [原生驅動程式] 新增 watchosX64 支援
- [IDE 外掛程式] 新增參數型別與註解（由 @aperfilyev 貢獻）
- [IDE 外掛程式] 新增產生「select all」查詢的操作（由 @aperfilyev 貢獻）
- [IDE 外掛程式] 在自動補全中顯示欄位型別（由 @aperfilyev 貢獻）
- [IDE 外掛程式] 在自動補全中顯示圖示（由 @aperfilyev 貢獻）
- [IDE 外掛程式] 新增產生「select by primary key」查詢的操作（由 @aperfilyev 貢獻）
- [IDE 外掛程式] 新增產生「insert into」查詢的操作（由 @aperfilyev 貢獻）
- [IDE 外掛程式] 為欄位名稱、陳述式識別碼、函式名稱新增醒目提示（由 @aperfilyev 貢獻）
- [IDE 外掛程式] 新增其餘查詢產生操作（#489 由 @aperfilyev 貢獻）
- [IDE 外掛程式] 顯示來自 insert-stmt 的參數提示（由 @aperfilyev 貢獻）
- [IDE 外掛程式] 資料表別名意圖操作（由 @aperfilyev 貢獻）
- [IDE 外掛程式] 限定欄位名稱意圖（由 @aperfilyev 貢獻）
- [IDE 外掛程式] 跳轉至 Kotlin 屬性的宣告（由 @aperfilyev 貢獻）

### 變更
- [原生驅動程式] 藉由在可能的情況下避免凍結和可共享資料結構，提升原生交易效能（由 @andersio 貢獻）
- [Paging 3] 將 Paging3 版本升級至 3.0.0 穩定版
- [JS 驅動程式] 將 sql.js 升級至 1.5.0

### 修正
- [JDBC SQLite 驅動程式] 在清除 ThreadLocal 前先在連線上呼叫 close()（#2444 由 @hannesstruss 貢獻）
- [RX 擴充套件] 修復訂閱 / 處置的競爭洩漏（#2403 由 @pyricau 貢獻）
- [協同程式擴充套件] 確保在發出通知前先註冊查詢接聽程式
- [編譯器] 對 notifyQueries 進行排序以產生一致的 Kotlin 輸出檔案（由 @thomascjy 貢獻）
- [編譯器] 不使用 @JvmField 註解 select 查詢類別屬性（由 @eygraber 貢獻）
- [IDE 外掛程式] 修復匯入最佳化器（#2350 由 @aperfilyev 貢獻）
- [IDE 外掛程式] 修復未使用的欄位檢查（由 @aperfilyev 貢獻）
- [IDE 外掛程式] 為匯入檢查與類別註解器新增巢狀類別支援（由 @aperfilyev 貢獻）
- [IDE 外掛程式] 修復 CopyPasteProcessor 中的 NPE（#2363 由 @aperfilyev 貢獻）
- [IDE 外掛程式] 修復 InlayParameterHintsProvider 中的當機（#2359 由 @aperfilyev 貢獻）
- [IDE 外掛程式] 修復將任何文字複製貼上至建立資料表陳述式時插入空白行的問題（#2431 由 @aperfilyev 貢獻）

## [1.5.0] - 2021-04-23 {id="1-5-0-2021-04-23"}
[1.5.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.0

### 新增
- [SQLite Javascript 驅動程式] 啟用 sqljs-driver 發佈（#1667 由 @dellisd 貢獻）
- [Paging3 擴充套件] Android Paging 3 程式庫的擴充套件（#1786 由 @kevincianfarini 貢獻）
- [MySQL 方言] 新增對 MySQL ON DUPLICATE KEY UPDATE 衝突解決的支援（由 @rharter 貢獻）
- [SQLite 方言] 為 SQLite offsets() 新增編譯器支援（由 @qjroberts 貢獻）
- [IDE 外掛程式] 為未知型別新增匯入快速修正（#683 由 @aperfilyev 貢獻）
- [IDE 外掛程式] 新增未使用的匯入檢查（#1161 由 @aperfilyev 貢獻）
- [IDE 外掛程式] 新增未使用的查詢檢查（由 @aperfilyev 貢獻）
- [IDE 外掛程式] 新增未使用的欄位檢查（#569 由 @aperfilyev 貢獻）
- [IDE 外掛程式] 複製/貼上時自動帶入匯入（#684 由 @aperfilyev 貢獻）
- [IDE 外掛程式] 當 Gradle/IntelliJ 外掛程式版本之間存在不相容時顯示提示氣球
- [IDE 外掛程式] Insert Into ... VALUES(?) 參數提示（#506 由 @aperfilyev 貢獻）
- [IDE 外掛程式] 內嵌參數提示（由 @aperfilyev 貢獻）
- [執行階段] 在執行階段中包含帶有回呼的執行遷移 API（#1844）

### 變更
- [編譯器] 智慧轉換 "IS NOT NULL" 查詢（#867）
- [編譯器] 防範在執行階段會失敗的關鍵字（#1471, #1629）
- [Gradle 外掛程式] 將 Gradle 外掛程式大小從 60mb 減少至 13mb。
- [Gradle 外掛程式] 正確支援 Android variant，並移除對 KMM 特定目標 SQL 的支援（#1039）
- [Gradle 外掛程式] 依據 minsdk 選擇最低 SQLite 版本（#1684）
- [原生驅動程式] 原生驅動程式連線池與效能更新

### 修正
- [編譯器] Lambda 運算式前的非換行空格 (NBSP)（由 @oldergod 貢獻）
- [編譯器] 修復產生的 bind* 與 cursor.get* 陳述式中不相容的型別
- [編譯器] SQL 子句應保留轉換後的型別（#2067）
- [編譯器] 僅有 NULL 關鍵字的欄位應為可 null
- [編譯器] 不產生帶有型別註解的對應器 Lambda（#1957）
- [編譯器] 若自訂查詢發生衝突，使用檔案名稱作為額外的套件後綴（#1057, #1278）
- [編譯器] 確保外鍵串聯會通知查詢接聽程式（#1325, #1485）
- [編譯器] 若對兩個相同型別進行 union，回傳該資料表型別（#1342）
- [編譯器] 確保 ifnull 與 coalesce 的參數可以為可 null（#1263）
- [編譯器] 正確為運算式使用查詢所施加的可 null 性
- [MySQL 方言] 支援 MySQL if 陳述式
- [PostgreSQL 方言] 在 PostgreSQL 中將 NUMERIC 與 DECIMAL 擷取為 Double（#2118）
- [SQLite 方言] UPSERT 通知應考量 BEFORE/AFTER UPDATE 觸發程序（#2198 由 @andersio 貢獻）
- [SQLite 驅動程式] 除非是在記憶體中，否則在 SqliteDriver 中為執行緒使用多個連線（#1832）
- [JDBC 驅動程式] JDBC 驅動程式預設 autoCommit 為 true（#2041）
- [JDBC 驅動程式] 確保發生例外狀況時關閉連線（#2306）
- [IDE 外掛程式] 修復因路徑分隔符問題導致 Windows 上的 GoToDeclaration/FindUsages 損壞的問題（#2054 由 @angusholder 貢獻）
- [IDE 外掛程式] 忽略 Gradle 錯誤而非在 IDE 中當機
- [IDE 外掛程式] 若將 sqldelight 檔案移至非 sqldelight 模組，不嘗試產生程式碼
- [IDE 外掛程式] 忽略 IDE 中的程式碼產生錯誤
- [IDE 外掛程式] 確保不嘗試進行負數子字串操作（#2068）
- [IDE 外掛程式] 同時確保在執行 Gradle 操作前專案未被處置（#2155）
- [IDE 外掛程式] 可 null 型別上的算術運算也應為可 null（#1853）
- [IDE 外掛程式] 使「expand * intention」可搭配額外投影使用（#2173 由 @aperfilyev 貢獻）
- [IDE 外掛程式] 若 GoTo 期間 Kotlin 解析失敗，不嘗試前往 sqldelight 檔案
- [IDE 外掛程式] 若 IntelliJ 在 sqldelight 建立索引時遇到例外狀況，不發生當機
- [IDE 外掛程式] 處理在 IDE 中程式碼產生前偵測錯誤時發生的例外狀況
- [IDE 外掛程式] 使 IDE 外掛程式相容於動態外掛程式 (Dynamic Plugins)（#1536）
- [Gradle 外掛程式] 使用 WorkerApi 產生資料庫時的競爭條件（#2062 由 @stephanenicolas 貢獻）
- [Gradle 外掛程式] classLoaderIsolation 阻礙了自訂 JDBC 的使用（#2048 由 @benasher44 貢獻）
- [Gradle 外掛程式] 改進缺少 packageName 時的錯誤訊息（由 @vanniktech 貢獻）
- [Gradle 外掛程式] SQLDelight 將 IntelliJ 相依性滲漏至 buildscript 類別路徑（#1998）
- [Gradle 外掛程式] 修復 Gradle 建置快取（#2075）
- [Gradle 外掛程式] 不在 Gradle 外掛程式中相依於 kotlin-native-utils（由 @ilmat192 貢獻）
- [Gradle 外掛程式] 若僅有遷移檔案，也寫入資料庫（#2094）
- [Gradle 外掛程式] 確保菱形相依性在最終編譯單元中僅被選取一次（#1455）

同時特別感謝 @3flex，他在本版本中做了大量工作來改進 SQLDelight 的基礎架構。

## [1.4.4] - 2020-10-08 {id="1-4-4-2020-10-08"}
[1.4.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.4

### 新增
- [PostgreSQL 方言] 支援 WITH 中的資料修改陳述式
- [PostgreSQL 方言] 支援 substring 函式
- [Gradle 外掛程式] 新增 verifyMigrations 旗標以在 SQLDelight 編譯期間驗證遷移（#1872）

### 變更
- [編譯器] 在非 SQLite 方言中將 SQLite 專屬函式標記為未知
- [Gradle 外掛程式] 當套用 sqldelight 外掛程式但未設定任何資料庫時提供警告（#1421）

### 修正
- [編譯器] 在 ORDER BY 子句中繫結欄位名稱時回報錯誤（#1187 由 @eygraber 貢獻）
- [編譯器] 產生資料庫介面時出現 Registry 警告（#1792）
- [編譯器] case 陳述式的不正確型別推論（#1811）
- [編譯器] 為沒有版本的遷移檔案提供更好的錯誤訊息（#2006）
- [編譯器] 某些資料庫型別 ColumnAdapter 所需轉換的資料庫型別不正確（#2012）
- [編譯器] CAST 的可 null 性（#1261）
- [編譯器] 查詢包裝函式中大量名稱遮蔽 (name shadowed) 警告（#1946 由 @eygraber 貢獻）
- [編譯器] 產生的程式碼使用了完整限定名稱（#1939）
- [IDE 外掛程式] 從 Gradle 同步觸發 sqldelight 程式碼產生
- [IDE 外掛程式] 修改 .sq 檔案時外掛程式未重新產生資料庫介面（#1945）
- [IDE 外掛程式] 將檔案移至新套件時的問題（#444）
- [IDE 外掛程式] 若無處可移動游標，不執行任何操作而非當機（#1994）
- [IDE 外掛程式] 為 Gradle 專案之外的檔案使用空套件名稱（#1973）
- [IDE 外掛程式] 針對無效型別適當失敗
- [IDE 外掛程式] 遇到未知運算式時擲出更明確的錯誤訊息（#1958）
- [Gradle 外掛程式] SQLDelight 將 IntelliJ 相依性滲漏至 buildscript 類別路徑（#1998）
- [Gradle 外掛程式] 在 *.sq 檔案中新增方法文件時出現「JavadocIntegrationKt not found」編譯錯誤（#1982）
- [Gradle 外掛程式] SQLDelight Gradle 外掛程式不支援組態快取 (CoCa)（#1947 由 @stephanenicolas 貢獻）
- [SQLite JDBC 驅動程式] SQLException: database in auto-commit mode（#1832）
- [協同程式擴充套件] 修復 coroutines-extensions 的 IR 後端問題（#1918 由 @dellisd 貢獻）

## [1.4.3] - 2020-09-04 {id="1-4-3-2020-09-04"}
[1.4.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.3

### 新增
- [MySQL 方言] 新增對 MySQL last_insert_id 函式的支援（由 @lawkai 貢獻）
- [PostgreSQL 方言] 支援 SERIAL 資料型別（由 @veyndan & @felipecsl 貢獻）
- [PostgreSQL 方言] 支援 PostgreSQL RETURNING（由 @veyndan 貢獻）

### 修正
- [MySQL 方言] 將 MySQL AUTO_INCREMENT 視為具有預設值（#1823）
- [編譯器] 修復 Upsert 陳述式編譯器錯誤（#1809 由 @eygraber 貢獻）
- [編譯器] 修復產生無效 Kotlin 程式碼的問題（#1925 由 @eygraber 貢獻）
- [編譯器] 為未知函式提供更明確的錯誤訊息（#1843）
- [編譯器] 將 String 公開為 instr 第二個參數的型別
- [IDE 外掛程式] 修復 IDE 外掛程式常駐程式過度膨脹與 UI 執行緒停滯問題（#1916）
- [IDE 外掛程式] 處理 null 模組的情境（#1902）
- [IDE 外掛程式] 在未設定的 sq 檔案中為套件名稱回傳空字串（#1920）
- [IDE 外掛程式] 修復群組陳述式並為其新增整合測試（#1820）
- [IDE 外掛程式] 使用內建的 ModuleUtil 尋找元素的模組（#1854）
- [IDE 外掛程式] 僅將有效元素新增至查詢（#1909）
- [IDE 外掛程式] 父層可以為 null（#1857）

## [1.4.2] - 2020-08-27 {id="1-4-2-2020-08-27"}
[1.4.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.2

### 新增
- [執行階段] 支援新的 JS IR 後端
- [Gradle 外掛程式] 新增 generateSqlDelightInterface Gradle 任務（由 @vanniktech 貢獻）
- [Gradle 外掛程式] 新增 verifySqlDelightMigration Gradle 任務（由 @vanniktech 貢獻）

### 修正
- [IDE 外掛程式] 使用 Gradle 工具 API 促進 IDE 與 Gradle 之間的資料共享
- [IDE 外掛程式] 結構描述衍生預設為 false
- [IDE 外掛程式] 正確擷取 commonMain 原始碼集
- [MySQL 方言] 為 mySqlFunctionType() 新增 minute（由 @maaxgr 貢獻）

## [1.4.1] - 2020-08-21 {id="1-4-1-2020-08-21"}
[1.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.1

### 新增
- [執行階段] 支援 Kotlin 1.4.0（#1859）

### 變更
- [Gradle 外掛程式] 將 AGP 相依性設為 compileOnly（#1362）

### 修正
- [編譯器] 為欄位定義規則與資料表介面產生器新增選用 Javadoc（#1224 由 @endanke 貢獻）
- [SQLite 方言] 新增對 SQLite FTS5 輔助函式 highlight、snippet 與 bm25 的支援（由 @drampelt 貢獻）
- [MySQL 方言] 支援 MySQL bit 資料型別
- [MySQL 方言] 支援 MySQL 二進日常值
- [PostgreSQL 方言] 從 sql-psi 公開 SERIAL（由 @veyndan 貢獻）
- [PostgreSQL 方言] 新增 BOOLEAN 資料型別（由 @veyndan 貢獻）
- [PostgreSQL 方言] 新增 NULL 欄位條件約束（由 @veyndan 貢獻）
- [HSQL 方言] 為 HSQL 新增 `AUTO_INCREMENT` 支援（由 @rharter 貢獻）

## [1.4.0] - 2020-06-22 {id="1-4-0-2020-06-22"}
[1.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.0

### 新增
- [MySQL 方言] MySQL 支援（由 @JGulbronson & @veyndan 貢獻）
- [PostgreSQL 方言] 實驗性 PostgreSQL 支援（由 @veyndan 貢獻）
- [HSQL 方言] 實驗性 H2 支援（由 @MariusVolkhart 貢獻）
- [SQLite 方言] SQLite FTS5 支援（由 @benasher44 & @jpalawaga 貢獻）
- [SQLite 方言] 支援 alter table rename column（#1505 由 @angusholder 貢獻）
- [IDE] 對遷移 (.sqm) 檔案的 IDE 支援
- [IDE] 新增模仿內建 SQL 即時範本的 SQLDelight 即時範本（#1154 由 @veyndan 貢獻）
- [IDE] 新增建立 SqlDelight 檔案操作（#42 由 @romtsn 貢獻）
- [執行階段] 用於回傳結果之交易的 transactionWithReturn API
- [編譯器] 在 .sq 檔案中將多個 SQL 陳述式群組在一起的語法
- [編譯器] 支援從遷移檔案產生架構
- [Gradle 外掛程式] 新增將遷移檔案輸出為有效 SQL 的任務

### 變更
- [文件] 全面翻新文件網站（由 @saket 貢獻）
- [Gradle 外掛程式] 改進不支援方言的錯誤訊息（由 @veyndan 貢獻）
- [IDE] 依據方言動態變更檔案圖示（由 @veyndan 貢獻）
- [JDBC 驅動程式] 從 javax.sql.DataSource 公開 JdbcDriver 建構函式（#1614）

### 修正
- [編譯器] 支援資料表上的 Javadoc 並修復單一檔案中多個 Javadoc 的問題（#1224）
- [編譯器] 允許為合成欄位插入值（#1351）
- [編譯器] 修復目錄名稱清理淨化的不一致問題（由 @ZacSweers 貢獻）
- [編譯器] 合成欄位在跨聯結時應保留可 null 性（#1656）
- [編譯器] 將 delete 陳述式鎖定在 delete 關鍵字上（#1643）
- [編譯器] 修復引號處理（#1525 由 @angusholder 貢獻）
- [編譯器] 修復 between 運算子以正確遞迴至運算式中（#1279）
- [編譯器] 建立索引時針對遺漏的資料表/欄位提供更明確的錯誤（#1372）
- [編譯器] 允許在聯結條件約束中使用外部查詢的投影（#1346）
- [原生驅動程式] 使 execute 使用 transationPool（由 @benasher44 貢獻）
- [JDBC 驅動程式] 改用 JDBC 交易 API 而非 SQLite（#1693）
- [IDE] 修復 virtualFile 參照以一律指向原始檔案（#1782）
- [IDE] 向 Bugsnag 回報錯誤時使用正確的 throwable（#1262）
- [Paging 擴充套件] 修復洩漏的 DataSource（#1628）
- [Gradle 外掛程式] 產生架構時若輸出資料庫檔案已存在則將其刪除（#1645）
- [Gradle 外掛程式] 若存在不連續區間則使遷移驗證失敗
- [Gradle 外掛程式] 明確使用我們設定的檔案索引（#1644）

## [1.3.0] - 2020-04-03 {id="1-3-0-2020-04-03"}
[1.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.3.0

* 新增：[Gradle] 用於指定欲編譯之 SQL 方言的 Dialect 屬性。
* 新增：[編譯器] #1009 實驗性支援 MySQL 方言。
* 新增：[編譯器] #1436 支援 sqlite:3.24 方言與 upsert。
* 新增：[JDBC 驅動程式] 從 SQLite JVM 驅動程式中分拆出 JDBC 驅動程式。
* 修復：[編譯器] #1199 支援任意長度的 Lambda。
* 修復：[編譯器] #1610 修復 avg() 的傳回型別為可 null。
* 修復：[IntelliJ] #1594 修復路徑分隔符處理，該問題曾導致 Windows 上的 Goto 與 Find Usages 損壞。

## [1.2.2] - 2020-01-22 {id="1-2-2-2020-01-22"}
[1.2.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.2

* 新增：[執行階段] 支援 Windows (mingW)、tvOS、watchOS 與 macOS 架構。
* 修復：[編譯器] sum() 的傳回型別應為可 null。
* 修復：[Paging] 將 Transacter 傳入 QueryDataSourceFactory 以避免競爭條件。
* 修復：[IntelliJ 外掛程式] 尋找檔案的套件名稱時不搜尋相依性。
* 修復：[Gradle] #862 將 Gradle 中的驗證器記錄變更為 debug 等級。
* 增強：[Gradle] 將 GenerateSchemaTask 轉換為使用 Gradle worker。
* 備註：sqldelight-runtime 構件已重新命名為 runtime。

## [1.2.1] - 2019-12-11 {id="1-2-1-2019-12-11"}
[1.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.1

* 修復：[Gradle] 支援 Kotlin Native 1.3.60。
* 修復：[Gradle] #1287 同步時出現警告。
* 修復：[編譯器] #1469 為查詢建立 SynetheticAccessor。
* 修復：[JVM 驅動程式] 修復記憶體洩漏。
* 備註：協同程式擴充套件構件需要在您的 buildscript 中加入 kotlinx bintray Maven 存放庫。

## [1.2.0] - 2019-08-30 {id="1-2-0-2019-08-30"}
[1.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.0

* 新增：[執行階段] 穩定版 Flow API。
* 修復：[Gradle] 支援 Kotlin Native 1.3.50。
* 修復：[Gradle] #1380 全新建置有時會失敗。
* 修復：[Gradle] #1348 執行驗證任務時印出「Could not retrieve functions」。
* 修復：[編譯] #1405 若查詢包含聯結的 FTS 資料表則無法建置專案。
* 修復：[Gradle] #1266 擁有多個資料庫模組時偶發的 Gradle 建置失敗。

## [1.1.4] - 2019-07-11 {id="1-1-4-2019-07-11"}
[1.1.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.4

* 新增：[執行階段] 實驗性 Kotlin Flow API。
* 修復：[Gradle] Kotlin/Native 1.3.40 相容性。
* 修復：[Gradle] #1243 修復 SQLDelight 搭配 Gradle 按需求設定 (configure on demand) 的使用問題。
* 修復：[Gradle] #1385 修復 SQLDelight 搭配增量註解處理的使用問題。
* 修復：[Gradle] 允許 Gradle 任務進行快取。
* 修復：[Gradle] #1274 允許在 Kotlin DSL 中使用 sqldelight 擴充。
* 修復：[編譯器] 確定性地為每個查詢產生唯一識別碼。
* 修復：[編譯器] 僅在交易完成時才通知接聽中的查詢。
* 修復：[JVM 驅動程式] #1370 強制 JdbcSqliteDriver 使用者提供資料庫 URL。

## [1.1.3] - 2019-04-14 {id="1-1-3-2019-04-14"}
[1.1.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.3

* Gradle Metadata 1.0 版本。

## [1.1.2] - 2019-04-14 {id="1-1-2-2019-04-14"}
[1.1.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.2

* 新增：[執行階段] #1267 記錄驅動程式裝飾器。
* 修復：[編譯器] #1254 分割長度超過 2^16 個字元的字串常值。
* 修復：[Gradle] #1260 產生的原始碼在多平台專案中被辨識為 iOS 原始碼。
* 修復：[IDE] #1290 CopyAsSqliteAction.kt:43 中的 kotlin.KotlinNullPointerException。
* 修復：[Gradle] #1268 近期版本中執行 linkDebugFrameworkIos* 任務失敗的問題。

## [1.1.1] - 2019-03-01 {id="1-1-1-2019-03-01"}
[1.1.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.1

* 修復：[Gradle] 修復 Android 專案的模組相依性編譯。
* 修復：[Gradle] #1246 在 afterEvaluate 中設定 API 相依性。
* 修復：[編譯器] 陣列型別能正確輸出。

## [1.1.0] - 2019-02-27 {id="1-1-0-2019-02-27"}
[1.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.0

* 新增：[Gradle] #502 允許指定結構描述模組相依性。
* 增強：[編譯器] #1111 資料表錯誤排在其他錯誤之前。
* 修復：[編譯器] #1225 為 REAL 常值回傳正確型別。
* 修復：[編譯器] #1218 docid 穿透觸發程序傳播。

## [1.0.3] - 2019-01-30 {id="1-0-3-2019-01-30"}
[1.0.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.3

* 增強：[執行階段] #1195 原生驅動程式 / 執行階段 Arm32。
* 增強：[執行階段] #1190 從 Query 型別公開對應器。

## [1.0.2] - 2019-01-26 {id="1-0-2-2019-01-26"}
[1.0.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.2

* 修復：[Gradle 外掛程式] 更新至 Kotlin 1.3.20。
* 修復：[執行階段] 交易不再吞掉例外狀況。

## [1.0.1] - 2019-01-21 {id="1-0-1-2019-01-21"}
[1.0.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.1

* 增強：[原生驅動程式] 允許將目錄名稱傳遞給 DatabaseConfiguration。
* 增強：[編譯器] #1173 未宣告套件的檔案編譯失敗。
* 修復：[IDE] 正確向 Square 回報 IDE 錯誤。
* 修復：[IDE] #1162 同一套件中的型別顯示為錯誤但運作正常。
* 修復：[IDE] #1166 重新命名資料表因 NPE 失敗。
* 修復：[編譯器] #1167 嘗試剖析帶有 UNION 與 SELECT 的複雜 SQL 陳述式時擲出例外狀況。

## [1.0.0] - 2019-01-08 {id="1-0-0-2019-01-08"}
[1.0.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.0

* 新增：全面翻新產生的程式碼，現改為 Kotlin。
* 新增：RxJava2 擴充套件構件。
* 新增：Android Paging 擴充套件構件。
* 新增：Kotlin 多平台支援。
* 新增：Android、iOS 與 JVM SQLite 驅動程式構件。
* 新增：交易 API。

## [0.7.0] - 2018-02-12 {id="0-7-0-2018-02-12"}
[0.7.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.7.0

 * 新增：產生的程式碼已更新為僅使用 Support SQLite 程式庫。所有查詢現在皆產生陳述式物件而非原始字串。
 * 新增：IDE 中的陳述式摺疊。
 * 新增：布林型別現在會自動處理。
 * 修復：從程式碼產生中移除已棄用的 marshal。
 * 修復：更正 'avg' SQL 函式型別對應為 REAL。
 * 修復：正確偵測 'julianday' SQL 函式。

## [0.6.1] - 2017-03-22 {id="0-6-1-2017-03-22"}
[0.6.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.6.1

 * 新增：不帶引數的 Delete、Update 和 Insert 陳述式現在會產生編譯後的陳述式。
 * 修復：子查詢中所使用的檢視內部 using 子句不再報錯。
 * 修復：移除產生的 Mapper 上重複的型別。
 * 修復：子查詢可用於與引數進行比對的運算式中。

## [0.6.0] - 2017-03-06 {id="0-6-0-2017-03-06"}
[0.6.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.6.0

 * 新增：Select 查詢現在公開為 `SqlDelightStatement` 工廠而非字串常數。
 * 新增：查詢 Javadoc 現在會複製到陳述式與對應器工廠中。
 * 新增：發出檢視名稱的字串常數。
 * 修復：需要工廠的檢視查詢現在能正確要求將這些工廠作為引數。
 * 修復：驗證 insert 的引數數量與指定的欄位數量相符。
 * 修復：正確編碼 where 子句中使用的 blob 常值。
 * 此版本需要 Gradle 3.3 或更新版本。

## [0.5.1] - 2016-10-24 {id="0-5-1-2016-10-24"}
[0.5.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.5.1

 * 新增：編譯後的陳述式繼承抽象型別。
 * 修復：參數中的基本型別若為可 null 則進行裝箱 (boxed)。
 * 修復：繫結引數所需的所有工廠皆存在於工廠方法中。
 * 修復：逸出的欄位名稱能正確封組成物件。

## [0.5.0] - 2016-10-19 {id="0-5-0-2016-10-19"}
[0.5.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.5.0

 * 新增：SQLite 引數可透過 Factory 進行型別安全傳遞。
 * 新增：IntelliJ 外掛程式對 .sq 檔案執行格式化。
 * 新增：支援 SQLite 時間戳記常值。
 * 修復：參數化型別可在 IntelliJ 中點擊穿透跳轉。
 * 修復：從 Cursor 擷取逸出欄位名稱時不再擲出 RuntimeException。
 * 修復：Gradle 外掛程式在嘗試印出例外狀況時不發生當機。

## [0.4.4] - 2016-07-20 {id="0-4-4-2016-07-20"}
[0.4.4]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.4

 * 新增：原生支援 short 作為欄位 Java 型別。
 * 新增：產生的對應器與工廠方法上的 Javadoc。
 * 修復：group_concat 與 nullif 函式具備正確的可 null 性。
 * 修復：與 Android Studio 2.2-alpha 的相容性。
 * 修復：WITH RECURSIVE 不再導致外掛程式當機。

## [0.4.3] - 2016-07-07 {id="0-4-3-2016-07-07"}
[0.4.3]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.3

 * 新增：編譯錯誤連結至原始檔。
 * 新增：按滑鼠右鍵可將 SQLDelight 程式碼複製為有效的 SQLite。
 * 新增：具名陳述式上的 Javadoc 會顯示在產生的 String 上。
 * 修復：產生的檢視模型包含可 null 性註解。
 * 修復：來自 union 產生的程式碼具備適當的型別與可 null 性以支援所有可能的欄位。
 * 修復：sum 與 round SQLite 函式在產生的程式碼中具備正確型別。
 * 修復：CAST 與內部選取的錯誤修正。
 * 修復：CREATE TABLE 陳述式中的自動補全。
 * 修復：套件中可使用 SQLite 關鍵字。

## [0.4.2] - 2016-06-16 {id="0-4-2-2016-06-16"}
[0.4.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.2

 * 新增：可從工廠建立 Marshal。
 * 修復：IntelliJ 外掛程式產生具備正確泛型順序的工廠方法。
 * 修復：函式名稱可使用任意大小寫。

## [0.4.1] - 2016-06-14 {id="0-4-1-2016-06-14"}
[0.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.1

 * 修復：IntelliJ 外掛程式產生具備正確泛型順序的類別。
 * 修復：欄位定義可使用任意大小寫。

## [0.4.0] - 2016-06-14 {id="0-4-0-2016-06-14"}
[0.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.0

 * 新增：對應器改為按查詢產生而非按資料表產生。
 * 新增：可在 .sq 檔案中匯入 Java 型別。
 * 新增：驗證 SQLite 函式。
 * 修復：移除重複的錯誤。
 * 修復：大寫欄位名稱與 Java 關鍵字欄位名稱不會報錯。

## [0.3.2] - 2016-05-14 {id="0-3-2-2016-05-14"}
[0.3.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.2

 * 新增：自動補全與尋找用法現在適用於檢視與別名。
 * 修復：編譯期驗證現在允許在選取中使用函式。
 * 修復：支援僅宣告預設值的 insert 陳述式。
 * 修復：匯入未使用 SQLDelight 的專案時外掛程式不再當機。

## [0.3.1] - 2016-04-27 {id="0-3-1-2016-04-27"}
[0.3.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.1

  * 修復：介面可見性改回 public，以避免方法參照造成 Illegal Access 執行時期例外狀況。
  * 修復：子運算式能被正確評估。

## [0.3.0] - 2016-04-26 {id="0-3-0-2016-04-26"}
[0.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.0

  * 新增：欄位定義使用 SQLite 型別，並可帶有額外的 'AS' 限制以指定 Java 型別。
  * 新增：可從 IDE 傳送錯誤回報。
  * 修復：自動補全能正常運作。
  * 修復：編輯 .sq 檔案時 SQLDelight 模型檔案會更新。
  * 移除：不再支援附加的資料庫 (Attached databases)。

## [0.2.2] - 2016-03-07 {id="0-2-2-2016-03-07"}
[0.2.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.2

 * 新增：對 insert、update、delete、index 和 trigger 陳述式所使用的欄位進行編譯期驗證。
 * 修復：檔案移動/建立時 IDE 外掛程式不發生當機。

## [0.2.1] - 2016-03-07 {id="0-2-1-2016-03-07"}
[0.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.1

 * 新增：Ctrl+`/`（OSX 上為 Cmd+`/`）切換所選行註解。
 * 新增：對 SQL 查詢所使用的欄位進行編譯期驗證。
 * 修復：在 IDE 與 Gradle 外掛程式中皆支援 Windows 路徑。

## [0.2.0] - 2016-02-29 {id="0-2-0-2016-02-29"}
[0.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.0

 * 新增：為 Marshal 類別新增複製建構函式。
 * 新增：更新至 Kotlin 1.0 正式版。
 * 修復：以非阻斷失敗的方式回報 'sqldelight' 資料夾結構問題。
 * 修復：禁止命名為 `table_name` 的欄位。其產生的常數會與資料表名稱常數發生衝突。
 * 修復：確保 IDE 外掛程式立即產生模型類別，無論是否開啟了 `.sq` 檔案。
 * 修復：在 IDE 與 Gradle 外掛程式中皆支援 Windows 路徑。

## [0.1.2] - 2016-02-13 {id="0-1-2-2016-02-13"}
[0.1.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.2

 * 修復：移除阻礙 Gradle 外掛程式在大多數專案中使用的程式碼。
 * 修復：新增編譯器對 Antlr 執行階段遺漏的相依性。

## [0.1.1] - 2016-02-12 {id="0-1-1-2016-02-12"}
[0.1.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.1

 * 修復：確保 Gradle 外掛程式指向與其自身相同版本的執行階段。

## [0.1.0] - 2016-02-12 {id="0-1-0-2016-02-12"}
[0.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.0

初始發佈。