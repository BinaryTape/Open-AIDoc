# 變更記錄

## 未發佈 {id="unreleased"}

### 新增 {id="added"}

- 尚無內容！

### 變更 {id="changed"}

- 尚無內容！

### 修正 {id="fixed"}

- [Runtime] 當結束交易或復原後掛鉤（post-rollback hook）也失敗時（例如在 SQLite 自行復原交易後出現 `cannot rollback - no transaction is active`），保留交易主體的例外狀況。第二個例外狀況會作為被抑制的例外（suppressed exception）加入，且 Android 驅動程式現在即使在 `endTransaction()` 擲出例外時也會清除其目前的交易（#6387 由 @pyricau 提供）
- [Gradle Plugin] `Configuration.visible` 屬性不再具有任何效果。該屬性現已棄用，並將在 Gradle 11 中移除（#6394 由 @griffio 提供）
- [IntelliJ Plugin] 修正 join 檢查出現誤報的問題（#6398 由 @griffio 提供）

## [2.4.1] - 2026-10-06 {id="2-4-1-2026-10-06"}
[2.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.1

### 新增

- [Documentation] 新增 Android SQLite 交易文件（#6381 由 @griffio 提供）

### 變更

- [Gradle Plugin] 在整個程式碼產生任務期間將剖析後的 `.sq` 檔案保留在記憶體中，使其在垃圾收集後不會被再次剖析。這可以加快大型專案中的程式碼產生速度（#6374 由 @C2H6O 提供）
- [IntelliJ Plugin] 當機回報現在會發送至 JetBrains Marketplace，而非自訂的 Bugsnag 執行個體（#6376 由 @JakeWharton 提供）

### 修正

- [IntelliJ Plugin] 透過變更 IntelliJ API 的使用方式來修復外掛程式發佈違規問題（#6366 #6368 由 @griffio 提供）
- [Intellij Plugin] 透過攔截未處理的錯誤來提升輸入時的穩定性（#6355 由 @griffio 提供）

## [2.4.0] - 2026-09-17 {id="2-4-0-2026-09-17"}
[2.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0

### 新增
- [Native Driver] 為 `inMemoryDriver` 新增 `extendedConfig` 參數（#5539 由 @GuilhE 提供）
- [PostgreSQL Dialect] 為隱式定義的系統欄位（System Columns）新增查詢支援（#5834 由 @griffio 提供）
- [PostgreSQL Dialect] 新增基本陣列常值支援（#5997 由 @griffio 提供）
- [PostgreSQL Dialect] 新增基本 LTREE 支援（#5880 由 @yesitskev @griffio 提供）
- [MySQL Dialect] 新增對 INET 函式的支援（#5072 由 @mcxinyu 提供）
- [PostgreSQL Dialect] 新增對 ALTER INDEX 的支援（#6224 由 @griffio 提供）
- [SQLite Dialect] 新增對 SQLite 3.44 聚合函式 DISTINCT、ORDER BY 與 FILTER 的支援（#6236 由 @griffio 提供）
- [SQLite Dialect] 新增對 SQLite 3.37 STRICT 資料表的支援（#6230 由 @griffio 提供）
- [Gradle Plugin] 新增透過 `codegenExcludedColumns` 從產生的模型中排除欄位的支援（#6243 由 @sokolikp 提供）
- [Compiler] 為架構新增 `allTableNames` 函式（#6245 由 @edenman 提供）
- [PostgreSQL Dialect] 新增對 ANY 運算子的支援（#6253 由 @griffio 提供）
- [SQLite Dialect] 新增 SQLite 3.39 對 RIGHT JOIN 與 FULL JOIN 的支援（#6273 由 @griffio 提供）
- [PostgreSQL Dialect] 在觸發器函式中新增對 `RAISE` 陳述式和 `FOUND` 變數的支援（#6297 由 @griffio 提供）

### 變更
- [PostgreSQL Dialect] 將 arrayIntermediateType 的可見性更改為 public（#5835 由 @griffio 提供）
- [Gradle Plugin] 實作更嚴格的 MigrationFile 版本控制（#5730 由 @madisp 提供）
- [Gradle Plugin] 將最低支援的 Gradle 版本提升至 8.2.1（#6217 由 @maxsav 提供）
- [Gradle Plugin] 支援 Gradle 隔離專案（isolated projects）（#6217 由 @maxsav 提供）
- [IntelliJ Plugin] 最低版本需求為 2023.3 / Android Studio Jellyfish

### 修正
- [Gradle Plugin] 抑制來自 JDK 24+ 上編譯器背景工作執行緒的 `sun.misc.Unsafe` 棄用警告（#6321）
- [Compiler] 抑制產生的程式碼中額外的 Kotlin 警告（#6208 由 @eyupcanakman 提供）
- [Compiler] 未分組聚合結果集中的其他欄位一律為可 null（#6208）
- [PostgreSQL Dialect] 正確解析 coalesce 與 ifnull 的可 null 性
- [PostgreSQL Dialect] 修正 PostgreSQL 方言的 IDE 整合問題
- [PostgreSQL Dialect] 改進 PostgreSQL 方言的 IDE 外掛程式（#6209 由 @griffio 提供）
- [Intellij Plugin] IDE 外掛程式可為所有方言執行程式碼補全（#6210 由 @griffio 提供）
- [Gradle Plugin] 修正執行資料庫驗證任務時的循環相依性錯誤（#6221 由 @griffio 提供）
- [Compiler] 修正多列更新的開放式鎖定（optimistic lock）（#6240 由 @griffio 提供）
- [Intellij Plugin] 修正導致 IDEA 2026.2 當機的棄用項目（#6247 由 @griffio 提供）
- [Gradle Plugin] 修正 AGP 8.9 到 8.11 上 Kotlin 編譯未偵測到所產生原始碼的問題
- [PostgreSQL Dialect] 修正使用原始繫結引數的 lower 和 upper 函式預設為 TEXT 的問題（#6262 由 @griffio 提供）
- [Compiler] 修正使用介面卡進行資料類別繫結且遷移變更可 null 性時的插入值問題（#6269 由 @griffio 提供）
- [Compiler] 在空值安全運算子（IS 和 IS DISTINCT FROM）中使用可為 null 的繫結引數（#6265 由 @griffio 提供）
- [Gradle Plugin] 針對專案相依性使用 AGP 的變體解析（#6217 由 @maxsav 提供）
- [Gradle Plugin] 修正組建之間 AGP 變體清單不同時 generateDatabaseInterface 的建置快取未命中問題
- [Gradle Plugin] 修正未設定任何資料庫套用外掛程式時 IDE 同步當機的問題（#6088）
- [PostgreSQL Dialect] 修正使用巢狀函式呼叫時的 json 聚合函式問題（#6281 由 @griffio 提供）
- [Paging3 Extension] 修正 KeyedQueryPagingSource 在空資料庫上當機的問題（#6284 由 @woods-marshes 提供）
- [Compiler] 修正當變更陳述式與 `COALESCE` 等封裝函式一起使用時的 Java 型別介面卡問題（#6292 由 @griffio 提供）
- [Compiler] 修正當模組名稱大寫時，所產生程式碼的套件名稱也會大寫的問題（#6316 由 @griffio 提供）
- [PostgreSQL Dialect] 允許日期資料型別不區分大小寫（#6328 由 @griffio 提供）
- [PostgreSQL Dialect] 修正 `string_agg` 函式為可 null（#6340 由 @griffio 提供）
- [SQLite Dialect] 修正使用 `GROUP BY` 的 SQLite 3.44 聚合函式（#6343 由 @griffio 提供）
- [Gradle Plugin] 避免在組態設定階段解析資料庫相依性（#6353 由 @joshfriend 提供）

## [2.4.0-rc2] - 2026-09-14 {id="2-4-0-rc2-2026-09-14"}
[2.4.0-rc2]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0-rc2

### 修正

- [PostgreSQL Dialect] 修正 `string_agg` 函式為可 null（#6340 由 @griffio 提供）
- [SQLite Dialect] 修正使用 `GROUP BY` 的 SQLite 3.44 聚合函式（#6343 由 @griffio 提供）
- [Gradle Plugin] 避免在組態設定階段解析資料庫相依性（#6353 由 @joshfriend 提供）

## [2.4.0-rc1] - 2026-09-01 {id="2-4-0-rc1-2026-09-01"}
[2.4.0-rc1]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0-rc1

### 新增
- [Native Driver] 為 `inMemoryDriver` 新增 `extendedConfig` 參數（#5539 由 @GuilhE 提供）
- [PostgreSQL Dialect] 為隱式定義的系統欄位新增查詢支援（#5834 由 @griffio 提供）
- [PostgreSQL Dialect] 新增基本陣列常值支援（#5997 由 @griffio 提供）
- [PostgreSQL Dialect] 新增基本 LTREE 支援（#5880 由 @yesitskev @griffio 提供）
- [MySQL Dialect] 新增對 INET 函式的支援（#5072 由 @mcxinyu 提供）
- [PostgreSQL Dialect] 新增對 ALTER INDEX 的支援（#6224 由 @griffio 提供）
- [SQLite Dialect] 新增對 SQLite 3.44 聚合函式 DISTINCT、ORDER BY 與 FILTER 的支援（#6236 由 @griffio 提供）
- [SQLite Dialect] 新增對 SQLite 3.37 STRICT 資料表的支援（#6230 由 @griffio 提供）
- [Gradle Plugin] 新增透過 `codegenExcludedColumns` 從產生的模型中排除欄位的支援（#6243 由 @sokolikp 提供）
- [Compiler] 為架構新增 `allTableNames` 函式（#6245 由 @edenman 提供）
- [PostgreSQL Dialect] 新增對 ANY 運算子的支援（#6253 由 @griffio 提供）
- [SQLite Dialect] 新增 SQLite 3.39 對 RIGHT JOIN 與 FULL JOIN 的支援（#6273 由 @griffio 提供）
- [PostgreSQL Dialect] 在觸發器函式中新增對 `RAISE` 陳述式和 `FOUND` 變數的支援（#6297 由 @griffio 提供）

### 變更
- [PostgreSQL Dialect] 將 arrayIntermediateType 的可見性更改為 public（#5835 由 @griffio 提供）
- [Gradle Plugin] 實作更嚴格的 MigrationFile 版本控制（#5730 由 @madisp 提供）
- [Gradle Plugin] 將最低支援的 Gradle 版本提升至 8.2.1（#6217 由 @maxsav 提供）
- [Gradle Plugin] 支援 Gradle 隔離專案（#6217 由 @maxsav 提供）
- [IntelliJ Plugin] 最低版本需求為 2023.3 / Android Studio Jellyfish

### 修正
- [Gradle Plugin] 抑制來自 JDK 24+ 上編譯器背景工作執行緒的 `sun.misc.Unsafe` 棄用警告（#6321）
- [Compiler] 抑制產生的程式碼中額外的 Kotlin 警告（#6208 由 @eyupcanakman 提供）
- [Compiler] 未分組聚合結果集中的其他欄位一律為可 null
- [PostgreSQL Dialect] 正確解析 coalesce 與 ifnull 的可 null 性
- [PostgreSQL Dialect] 修正 PostgreSQL 方言的 IDE 整合問題
- [PostgreSQL Dialect] 改進 PostgreSQL 方言的 IDE 外掛程式（#6209 由 @griffio 提供）
- [Intellij Plugin] IDE 外掛程式可為所有方言執行程式碼補全（#6210 由 @griffio 提供）
- [Gradle Plugin] 修正執行資料庫驗證任務時的循環相依性錯誤（#6221 由 @griffio 提供）
- [Compiler] 修正多列更新的開放式鎖定（#6240 由 @griffio 提供）
- [Intellij Plugin] 修正導致 IDEA 2026.2 當機的棄用項目（#6247 由 @griffio 提供）
- [Gradle Plugin] 修正 AGP 8.9 到 8.11 上 Kotlin 編譯未偵測到所產生原始碼的問題
- [PostgreSQL Dialect] 修正使用原始繫結引數的 lower 和 upper 函式預設為 TEXT 的問題（#6262 由 @griffio 提供）
- [Compiler] 修正使用介面卡進行資料類別繫結且遷移變更可 null 性時的插入值問題（#6269 由 griffio 提供）
- [Compiler] 在空值安全運算子（IS 和 IS DISTINCT FROM）中使用可為 null 的繫結引數（#6265 由 @griffio 提供）
- [Gradle Plugin] 針對專案相依性使用 AGP 的變體解析（#6217 由 @maxsav 提供）
- [Gradle Plugin] 修正組建之間 AGP 變體清單不同時 generateDatabaseInterface 的建置快取未命中問題
- [Gradle Plugin] 修正未設定任何資料庫套用外掛程式時 IDE 同步當機的問題（#6088）
- [PostgreSQL Dialect] 修正使用巢狀函式呼叫時的 json 聚合函式問題（#6281 由 @griffio 提供）
- [Paging3 Extension] 修正 KeyedQueryPagingSource 在空資料庫上當機的問題（#6284 由 @woods-marshes 提供）
- [Compiler] 修正當變更陳述式與 `COALESCE` 等封裝函式一起使用時的 Java 型別介面卡問題（#6292 由 @griffio 提供）
- [Compiler] 修正當模組名稱大寫時，所產生程式碼的套件名稱也會大寫的問題（#6316 由 @griffio 提供）
- [PostgreSQL Dialect] 允許日期資料型別不區分大小寫（#6328 由 @griffio 提供）

## [2.3.2] - 2026-03-16 {id="2-3-2-2026-03-16"}
[2.3.2]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.2

### 新增
- [PostgreSQL Dialect] 改進對 ALTER TABLE ALTER TYPE USING 運算式的支援（#6116 由 @griffio 提供）
- [PostgreSQL Dialect] 新增對 DROP COLUMN IF EXISTS 的支援（#6112 由 @griffio 提供）
- [Gradle Plugin] 新增 expandSelectStar 旗標以關閉 Select 萬用字元展開（#5813 由 @griffio 提供）
- [MySQL Dialect] 新增對視窗函式（Window Functions）的支援（#6086 由 @griffio 提供）
- [Gradle Plugin] 修正當起始結構描述版本不是 1 且 verifyMigrations 為 true 時的建置失敗問題（#6017 由 @neilgmiller 提供）
- [Gradle Plugin] 讓 `SqlDelightWorkerTask` 更具可組態性，並更新預設組態以支援在 Windows 上開發（#5215 由 @MSDarwish2000 提供）
- [SQLite Dialect] 新增對 FTS5 虛擬資料表中合成欄位的支援（#5986 由 @watbe 提供）
- [PostgreSQL Dialect] 新增對 Postgres 資料列層級安全性的支援（#6087 由 @shellderp 提供）
- [PostgreSQL Dialect] 擴充 FOR UPDATE 以支援 OF table、NO KEY UPDATE、NO WAIT（#6104 由 @shellderp 提供）
- [PostgreSQL Dialect] 支援 Postgis Point 型別及相關函式（#5602 由 @vanniktech 提供）
- [Runtime] 新增 `SuspendingTransacter.TransactionDispatcher`，提供控制交易的 `CoroutineContext` 機制（#5967 由 @eygraber 提供）
- [Gradle Plugin] 完全相容於 Android Gradle Plugin 9.0 的新 DSL（#6140）
- [PostgreSQL Dialect] 支援 PostgreSQL CREATE TABLE 儲存參數（#6148 由 @griffio 提供）
- [PostgreSQL Dialect] 修正 PostgreSQL 唯一資料表條件約束可 null 結果欄位的問題（#6167 由 @griffio 提供）

### 變更
- [Compiler] 將編譯器輸出型別從 java.lang.Void 變更為 kotlin.Nothing（#6099 由 @griffio 提供）
- [Compiler] 允許套件名稱中使用底線。在此之前底線會被清除，從而導致未預期的行為（#6027 由 @BierDav 提供）
- [Paging Extension] 切換至 AndroidX Paging（#5910 由 @jeffdgr8 提供）
- [Android Driver] 將 Android minSdk 提升至 23（#6141）
- [Paging Extension] 升級至 paging 3.4.1，並移除了 X64 apple 目標（#6166）

### 修正
- [IntelliJ Plugin] 修正因在 VFS 重新整理事件期間於 EDT 上封鎖檔案型別偵測而導致的 IDE 凍結問題。
- [SQLite Dialect] 修正使用 Json 路徑運算子時的 Sqlite 3.38 編譯錯誤（#6070 由 @griffio 提供）
- [SQLite Dialect] 使用自訂欄位型別時，group_concat 函式採用 String 型別（#6082 由 @griffio 提供）
- [Gradle Plugin] 提升 `VerifyMigrationTask` 的效能，防止其在複雜結構描述上停止回應（#6073 由 @Lightwood13 提供）
- [Intellij Plugin] 修正外掛程式初始化例外狀況並更新已棄用的方法（#6040 由 @griffio 提供）
- [Gradle Plugin] 修正與 Android Gradle Plugin 內建 Kotlin 的相容性（#6139）

## [2.3.1] - 2025-03-12 {id="2-3-1-2025-03-12"}
[2.3.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.1

發佈失敗。請使用 2.3.2！

## [2.3.0] - 2025-03-12 {id="2-3-0-2025-03-12"}
[2.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.0

發佈失敗。請使用 2.3.2！

## [2.2.1] - 2025-11-13 {id="2-2-1-2025-11-13"}
[2.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.2.1

### 新增
- [PostgreSQL Dialect] 修正 Postgres numeric/integer/biginteger 型別對應（#5994 由 @griffio 提供）
- [Compiler] 改進編譯器錯誤訊息，在需要 CAST 時包含原始程式檔位置（#5979 由 @griffio 提供）
- [PostgreSQL Dialect] 新增對 Postgres JSON 運算子路徑擷取的支援（#5971 由 @griffio 提供）
- [SQLite Dialect] 新增 Sqlite 3.35 對使用通用資料表運算式（CTE）的 MATERIALIZED 查詢規劃器提示的支援（#5961 由 @griffio 提供）
- [PostgreSQL Dialect] 新增對使用通用資料表運算式（CTE）的 MATERIALIZED 查詢規劃器提示的支援（#5961 由 @griffio 提供）
- [PostgreSQL Dialect] 新增對 Postgres JSON Aggregate FILTER 的支援（#5957 由 @griffio 提供）
- [PostgreSQL Dialect] 新增對 Postgres 列舉的支援（#5935 由 @griffio 提供）
- [PostgreSQL Dialect] 新增對 Postgres 觸發器的有限支援（#5932 由 @griffio 提供）
- [PostgreSQL Dialect] 新增述詞以檢查 SQL 運算式是否可剖析為 JSON（#5843 由 @griffio 提供）
- [PostgreSQL Dialect] 新增對 PostgreSQL Comment On 陳述式的有限支援（#5808 由 @griffio 提供）
- [MySQL Dialect] 新增對索引可見性選項的支援（#5785 由 @orenkislev-faire 提供）
- [PostgreSql Dialect] 新增對 TSQUERY 資料型別的支援（#5779 由 @griffio 提供）
- [Gradle Plugin] 新增加入模組時對版本目錄（version catalogs）的支援（#5755 由 @DRSchlaubi 提供）

### 變更
- 開發中的快照現在發佈至 Central Portal Snapshots 存儲庫：https://central.sonatype.com/repository/maven-snapshots/。
- [Compiler] 使用建構函式參照簡化預設產生的查詢（#5814 由 @jonapoul 提供）

### 修正
- [Compiler] 修正使用包含通用資料表運算式的 View 時的堆疊溢位問題（#5928 由 @griffio 提供）
- [Gradle Plugin] 修正開啟 SqlDelight 工具視窗以新增「New Connection」時的當機問題（#5906 由 @griffio 提供）
- [IntelliJ Plugin] 避免 copy-to-sqlite 裝訂邊操作中與執行緒相關的當機（#5901 由 @griffio 提供）
- [IntelliJ Plugin] 修正使用結構描述陳述式 CREATE INDEX 和 CREATE VIEW 時的 PostgreSQL 方言問題（#5772 由 @griffio 提供）
- [Compiler] 修正參考欄位時的 FTS 堆疊溢位（#5896 由 @griffio 提供）
- [Compiler] 修正 With Recursive 堆疊溢位（#5892 由 @griffio 提供）
- [Compiler] 修正 Insert|Update|Delete Returning 陳述式的 Notify 問題（#5851 由 @griffio 提供）
- [Compiler] 修正回傳 Long 的交易區塊的非同步結果型別（#5836 由 @griffio 提供）
- [Compiler] 將 SQL 參數繫結複雜度從 O(n²) 最佳化為 O(n)（#5898 由 @chenf7 提供）
- [SQLite Dialect] 修正 Sqlite 3.18 遺失的函式（#5759 由 @griffio 提供）

## [2.2.0] - 2025-11-13 {id="2-2-0-2025-11-13"}
[2.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.2.0

構件部分發佈的失敗版本。請使用 2.2.1！

## [2.1.0] - 2025-05-16 {id="2-1-0-2025-05-16"}
[2.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.1.0

### 新增
- [WASM Driver] 為 Web Worker 驅動程式新增 wasmJs 支援（#5534 由 @IlyaGulya 提供）
- [PostgreSQL Dialect] 支援 PostgreSQL UnNest 陣列轉資料列（#5673 由 @griffio 提供）
- [PostgreSQL Dialect] 支援 PostgreSQL TSRANGE/TSTZRANGE（#5297 由 @griffio 提供）
- [PostgreSQL Dialect] 支援 PostgreSQL Right Full Join（#5086 由 @griffio 提供）
- [PostgreSQL Dialect] 支援 PostgreSQL 從時間型別中擷取（extract）（#5273 由 @griffio 提供）
- [PostgreSQL Dialect] 支援 PostgreSQL 陣列包含運算子（#4933 由 @griffio 提供）
- [PostgreSQL Dialect] 支援 PostgreSQL drop constraint（#5288 由 @griffio 提供）
- [PostgreSQL Dialect] 支援 PostgreSQL 型別轉換（#5089 由 @griffio 提供）
- [PostgreSQL Dialect] 支援子查詢的 PostgreSQL lateral join 運算子（#5122 由 @griffio 提供）
- [PostgreSQL Dialect] 支援 PostgreSQL ILIKE 運算子（#5330 由 @griffio 提供）
- [PostgreSQL Dialect] 支援 PostgreSQL XML 型別（#5331 由 @griffio 提供）
- [PostgreSQL Dialect] 支援 PostgreSQL AT TIME ZONE（#5243 由 @griffio 提供）
- [PostgreSQL Dialect] 支援 PostgreSQL order by nulls（#5199 由 @griffio 提供）
- [PostgreSQL Dialect] 新增 PostgreSQL 目前日期/時間函式支援（#5226 由 @drewd 提供）
- [PostgreSQL Dialect] 支援 PostgreSQL 正規表示式運算子（#5137 由 @griffio 提供）
- [PostgreSQL Dialect] 加入 brin gist（#5059 由 @griffio 提供）
- [MySQL Dialect] 為 MySQL 方言支援 RENAME INDEX（#5212 由 @orenkislev-faire 提供）
- [JSON Extension] 為 json 資料表函式新增別名（#5372 由 @griffio 提供）

### 變更
- [Compiler] 產生的查詢檔案為簡單的變更陳述式回傳受影響資料列數（#4578 由 @MariusVolkhart 提供）
- [Native Driver] 更新 NativeSqlDatabase.kt 以變更 DELETE、INSERT 和 UPDATE 陳述式的唯讀旗標（#5680 由 @griffio 提供）
- [PostgreSQL Dialect] 將 PgInterval 變更為 String（#5403 由 @griffio 提供）
- [PostgreSQL Dialect] 支援 SqlDelight 模組以實作 PostgreSQL 擴充功能（#5677 由 @griffio 提供）

### 修正
- [Compiler] 修正：執行具有結果的分組陳述式時通知查詢（#5006 由 @vitorhugods 提供）
- [Compiler] 修正 SqlDelightModule 型別解析器（#5625 由 @griffio 提供）
- [Compiler] 修正 5501 插入物件跳脫欄位的問題（#5503 由 @griffio 提供）
- [Compiler] 編譯器：改進錯誤訊息，使路徑連結可點擊並具有正確的行號與字元位置（#5604 由 @vanniktech 提供）
- [Compiler] 修正問題 5298：允許將關鍵字用作資料表名稱
- [Compiler] 修正具名執行並新增測試
- [Compiler] 排序初始化陳述式時考慮外部鍵資料表條件約束（#5325 由 @TheMrMilchmann 提供）
- [Compiler] 涉及 Tab 字元時正確對齊錯誤底線（#5224 由 @drewd 提供）
- [JDBC Driver] 修正交易結束時 connectionManager 的記憶體洩漏問題
- [JDBC Driver] 依據文件所述在交易內執行 SQLite 遷移（#5218 由 @morki 提供）
- [JDBC Driver] 修正交易認可/復原後連線洩漏的問題（#5205 由 @morki 提供）
- [Gradle Plugin] 在 `GenerateSchemaTask` 之前執行 `DriverInitializer`（#5562 由 @nwagu 提供）
- [Runtime] 修正實際驅動程式為非同步時 LogSqliteDriver 當機的問題（#5723 由 @edenman 提供）
- [Runtime] 修正 StringBuilder 容量（#5192 由 @janbina 提供）
- [PostgreSQL Dialect] PostgreSQL create or replace view（#5407 由 @griffio 提供）
- [PostgreSQL Dialect] PostgreSQL to_json（#5606 由 @griffio 提供）
- [PostgreSQL Dialect] PostgreSQL 數值解析器（#5399 由 @griffio 提供）
- [PostgreSQL Dialect] SQLite 視窗函式（#2799 由 @griffio 提供）
- [PostgreSQL Dialect] PostgreSQL SELECT DISTINCT ON（#5345 由 @griffio 提供）
- [PostgreSQL Dialect] alter table add column if not exists（#5309 由 @griffio 提供）
- [PostgreSQL Dialect] PostgreSQL 非同步繫結參數（#5313 由 @griffio 提供）
- [PostgreSQL Dialect] PostgreSQL 布林常值（#5262 由 @griffio 提供）
- [PostgreSQL Dialect] PostgreSQL 視窗函式（#5155 由 @griffio 提供）
- [PostgreSQL Dialect] PostgreSQL isNull isNotNull 型別（#5173 由 @griffio 提供）
- [PostgreSQL Dialect] PostgreSQL select distinct（#5172 由 @griffio 提供）
- [Paging Extension] 分頁重新整理初始載入修復（#5615 由 @evant 提供）
- [Paging Extension] 新增 macOS 原生目標（#5324 由 @vitorhugods 提供）
- [IntelliJ Plugin] K2 支援

## [2.0.2] - 2024-04-05 {id="2-0-2-2024-04-05"}
[2.0.2]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.2

### 新增
- [PostgreSQL Dialect] 新增 PostgreSQL STRING_AGG 函式（#4950 由 @anddani 提供）
- [PostgreSQL Dialect] 為 pg 方言新增 SET 陳述式（#4927 由 @de-luca 提供）
- [PostgreSQL Dialect] 新增 PostgreSQL alter column 序列參數（#4916 由 @griffio 提供）
- [PostgreSQL Dialect] 為 insert 陳述式新增 postgresql alter column default 支援（#4912 由 @griffio 提供）
- [PostgreSQL Dialect] 新增 PostgreSQL alter sequence 與 drop sequence（#4920 由 @griffio 提供）
- [PostgreSQL Dialect] 新增 Postgres 正規表示式函式定義（#5025 由 @MariusVolkhart 提供）
- [PostgreSQL Dialect] 新增 GIN 語法（#5027 由 @griffio 提供）

### 變更
- [IDE Plugin] 最低版本需求為 2023.1 / Android Studio Iguana
- [Compiler] 允許在 encapsulatingType 中覆寫型別可 null 性（#4882 由 @eygraber 提供）
- [Compiler] 內聯 SELECT * 的欄位名稱
- [Gradle Plugin] 切換至 processIsolation（#5068 由 @nwagu 提供）
- [Android Runtime] 將 Android minSDK 提升至 21（#5094 由 @hfhbd 提供）
- [Drivers] 為方言編寫者公開更多 JDBC/R2DBC 陳述式方法（#5098 由 @hfhbd 提供）

### 修正
- [PostgreSQL Dialect] 修正 PostgreSQL alter table alter column（#4868 由 @griffio 提供）
- [PostgreSQL Dialect] 修正 4448 資料表模型缺少匯入的問題（#4885 由 @griffio 提供）
- [PostgreSQL Dialect] 修正 4932 PostgreSQL 預設條件約束函式（#4934 由 @griffio 提供）
- [PostgreSQL Dialect] 修正 4879 遷移期間 alter table rename column 中的 PostgreSQL 類別轉換錯誤（#4880 由 @griffio 提供）
- [PostgreSQL Dialect] 修正 4474 PostgreSQL create extension（#4541 由 @griffio 提供）
- [PostgreSQL Dialect] 修正 5018 PostgreSQL 新增主鍵不可為 null 的型別（#5020 由 @griffio 提供）
- [PostgreSQL Dialect] 修正 4703 聚合運算式（#5071 由 @griffio 提供）
- [PostgreSQL Dialect] 修正 5028 PostgreSQL json（#5030 由 @griffio 提供）
- [PostgreSQL Dialect] 修正 5040 PostgreSQL json 運算子（#5041 由 @griffio 提供）
- [PostgreSQL Dialect] 修正 5040 的 json 運算子繫結（#5100 由 @griffio 提供）
- [PostgreSQL Dialect] 修正 5082 tsvector（#5104 由 @griffio 提供）
- [PostgreSQL Dialect] 修正 5032 PostgreSQL UPDATE FROM 陳述式的欄位相鄰問題（#5035 由 @griffio 提供）
- [SQLite Dialect] 修正 4897 SQLite alter table rename column（#4899 由 @griffio 提供）
- [IDE Plugin] 修正錯誤處理程式當機問題（#4988 由 @aperfilyev 提供）
- [IDE Plugin] BugSnag 無法在 IDEA 2023.3 中初始化（由 @aperfilyev 提供）
- [IDE Plugin] 透過外掛程式在 IntelliJ 中開啟 .sq 檔案時發生 PluginException（由 @aperfilyev 提供）
- [IDE Plugin] 不再將 kotlin 程式庫打包進 IntelliJ 外掛程式中，因為它已經是外掛程式相依性（#5126）
- [IDE Plugin] 使用 extensions 陣列取代 stream（#5127）

## [2.0.1] - 2023-12-01 {id="2-0-1-2023-12-01"}
[2.0.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.1

### 新增
- [Compiler] 執行 SELECT 時新增對多欄位運算式（multi-column-expr）的支援（#4453 由 @Adriel-M 提供）
- [PostgreSQL Dialect] 新增對 PostgreSQL CREATE INDEX CONCURRENTLY 的支援（#4531 由 @griffio 提供）
- [PostgreSQL Dialect] 允許 PostgreSQL CTE 輔助陳述式相互參考（#4493 由 @griffio 提供）
- [PostgreSQL Dialect] 新增二元運算式和 sum 對 PostgreSQL 型別的支援（#4539 由 @Adriel-M 提供）
- [PostgreSQL Dialect] 新增對 PostgreSQL SELECT DISTINCT ON 語法的支援（#4584 由 @griffio 提供）
- [PostgreSQL Dialect] 新增 SELECT 陳述式中對 PostgreSQL JSON 函式的支援（#4590 由 @MariusVolkhart 提供）
- [PostgreSQL Dialect] 新增 generate_series PostgreSQL 函式（#4717 由 @griffio 提供）
- [PostgreSQL Dialect] 新增額外的 Postgres 字串函式定義（#4752 由 @MariusVolkhart 提供）
- [PostgreSQL Dialect] 為 min 和 max 聚合函式新增 DATE PostgreSQL 型別（#4816 由 @anddani 提供）
- [PostgreSQL Dialect] 為 SqlBinaryExpr 新增 PostgreSQL 時間型別（#4657 由 @griffio 提供）
- [PostgreSQL Dialect] 為 postgres 方言新增 TRUNCATE（#4817 由 @de-luca 提供）
- [SQLite 3.35 Dialect] 允許依序評估的多個 ON CONFLICT 子句（#4551 由 @griffio 提供）
- [JDBC Driver] 加入語言註解以獲得更愉悅的 SQL 編輯體驗（#4602 由 @MariusVolkhart 提供）
- [Native Driver] Native-driver：新增對 linuxArm64 的支援（#4792 由 @hfhbd 提供）
- [Android Driver] 為 AndroidSqliteDriver 新增 windowSizeBytes 參數（#4804 由 @BoD 提供）
- [Paging3 Extension] 特性：為 OffsetQueryPagingSource 新增 initialOffset（#4802 由 @MohamadJaara 提供）

### 變更
- [Compiler] 適當情況下優先使用 Kotlin 型別（#4517 由 @eygraber 提供）
- [Compiler] 進行值型別插入時一律包含欄位名稱（#4864）
- [PostgreSQL Dialect] 移除 PostgreSQL 方言的實驗性狀態（#4443 由 @hfhbd 提供）
- [PostgreSQL Dialect] 更新 PostgreSQL 型別文件（#4569 由 @MariusVolkhart 提供）
- [R2DBC Driver] 最佳化在 PostgreSQL 中處理整數資料型別時的效能（#4588 由 @MariusVolkhart 提供）

### 移除 {id="removed"}
- [SQLite Javascript Driver] 移除 sqljs-driver（#4613, #4670 由 @dellisd 提供）

### 修正
- [Compiler] 修正帶有回傳值且無參數的分組陳述式編譯（#4699 由 @griffio 提供）
- [Compiler] 使用 SqlBinaryExpr 繫結引數（#4604 由 @griffio 提供）
- [IDE Plugin] 若有設定則使用 IDEA 專案 JDK（#4689 由 @griffio 提供）
- [IDE Plugin] 修正 IDEA 2023.2 及更高版本中的「Unknown element type: TYPE_NAME」錯誤（#4727）
- [IDE Plugin] 修正 2023.2 的一些相容性問題
- [Gradle Plugin] 更正 verifyMigrationTask Gradle 任務的文件（#4713 由 @joshfriend 提供）
- [Gradle Plugin] 新增 Gradle 任務輸出訊息，以協助使用者在驗證資料庫之前產生資料庫（#4684 由 @jingwei99 提供）
- [PostgreSQL Dialect] 修正多次重新命名 PostgreSQL 欄位的問題（#4566 由 @griffio 提供）
- [PostgreSQL Dialect] 修正 4714 PostgreSQL alter column 可 null 性（#4831 由 @griffio 提供）
- [PostgreSQL Dialect] 修正 4837 alter table alter column（#4846 由 @griffio 提供）
- [PostgreSQL Dialect] 修正 4501 PostgreSQL sequence（#4528 由 @griffio 提供）
- [SQLite Dialect] 允許在欄位運算式上使用 JSON 二元運算子（#4776 由 @eygraber 提供）
- [SQLite Dialect] 修正 Update From 對以名稱找到多個欄位的誤報（#4777 由 @eygraber 提供）
- [Native Driver] 支援具名記憶體內資料庫（#4662 由 @05nelsonm 提供）
- [Native Driver] 確保查詢接聽程式集合的執行緒安全（#4567 由 @kpgalligan 提供）
- [JDBC Driver] 修正 ConnectionManager 中的連線洩漏問題（#4589 由 @MariusVolkhart 提供）
- [JDBC Driver] 修正選擇 ConnectionManager 型別時 JdbcSqliteDriver url 剖析問題（#4656 由 @05nelsonm 提供）

## [2.0.0] - 2023-07-26 {id="2-0-0-2023-07-26"}
[2.0.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0

### 新增
- [MySQL Dialect] MySQL：在 IF 運算式中支援 timestamp/bigint（#4329 由 @shellderp 提供）
- [MySQL Dialect] MySQL：新增 now（#4431 由 @hfhbd 提供）
- [Web Driver] 啟用 NPM 套件發佈（#4364）
- [IDE Plugin] 允許使用者在 Gradle 工具連線失敗時顯示堆疊追蹤（#4383）

### 變更
- [Sqlite Driver] 簡化 JdbcSqliteDriver 的架構遷移使用方式（#3737 由 @morki 提供）
- [R2DBC Driver] 真正的非同步 R2DBC 游標（#4387 由 @hfhbd 提供）

### 修正
- [IDE Plugin] 在需要之前不要具現化資料庫專案服務（#4382）
- [IDE Plugin] 處理尋找用法期間的行程取消（#4340）
- [IDE Plugin] 修正非同步程式碼的 IDE 產生問題（#4406）
- [IDE Plugin] 將套件結構的組裝改為單次計算且脫離 EDT（#4417）
- [IDE Plugin] 在 2023.2 上為 Kotlin 型別解析使用正確的虛設常式索引鍵（#4416）
- [IDE Plugin] 在執行搜尋之前等待索引就緒（#4419）
- [IDE Plugin] 若索引不可用則不執行跳轉（#4420）
- [Compiler] 修正分組陳述式的結果運算式（#4378）
- [Compiler] 不要使用虛擬資料表作為介面型別（#4427 由 @hfhbd 提供）

## [2.0.0-rc02] - 2023-06-27 {id="2-0-0-rc02-2023-06-27"}
[2.0.0-rc02]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-rc02

### 新增
- [MySQL Dialect] 支援小寫日期型別以及日期型別上的 min 和 max（#4243 由 @shellderp 提供）
- [MySQL Dialect] 支援二元運算式和 sum 的 MySQL 型別（#4254 由 @shellderp 提供）
- [MySQL Dialect] 支援無顯示寬度的不帶正負號整數（unsigned int）（#4306 由 @shellderp 提供）
- [MySQL Dialect] 支援 LOCK IN SHARED MODE
- [PostgreSQL Dialect] 為 min max 新增布林值和 Timestamp（#4245 由 @griffio 提供）
- [PostgreSQL Dialect] Postgres：新增視窗函式支援（#4283 由 @hfhbd 提供）
- [Runtime] 為 runtime 新增 linuxArm64、androidNative 和 watchosDeviceArm 目標（#4258 由 @hfhbd 提供）
- [Paging Extension] 為分頁擴充套件新增 linux 和 mingw x64 目標（#4280 由 @chippman 提供）

### 變更
- [Gradle Plugin] 為 Android API 34 新增自動方言支援（#4251）
- [Paging Extension] 在 QueryPagingSource 中新增對 SuspendingTransacter 的支援（#4292 由 @daio 提供）
- [Runtime] 改進 addListener API（#4244 由 @hfhbd 提供）
- [Runtime] 使用 Long 作為遷移版本（#4297 由 @hfhbd 提供）

### 修正
- [Gradle Plugin] 為產生的原始碼使用穩定的輸出路徑（#4269 由 @joshfriend 提供）
- [Gradle Plugin] Gradle 調整（#4222 由 @3flex 提供）

## [2.0.0-rc01] - 2023-05-29 {id="2-0-0-rc01-2023-05-29"}
[2.0.0-rc01]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-rc01

### 新增
- [Paging] 為分頁擴充套件新增 js 瀏覽器目標（#3843 由 @sproctor 提供）
- [Paging] 為 androidx-paging3 擴充套件新增 iosSimulatorArm64 目標（#4117）
- [PostgreSQL Dialect] 為 gen_random_uuid() 新增支援與測試（#3855 由 @davidwheeler123 提供）
- [PostgreSQL Dialect] PostgreSQL Alter table add constraint（#4116 由 @griffio 提供）
- [PostgreSQL Dialect] Alter table add constraint check（#4120 由 @griffio 提供）
- [PostgreSQL Dialect] 新增 PostgreSQL 字元長度函式（#4121 由 @griffio 提供）
- [PostgreSQL Dialect] 新增 PostgreSQL 欄位預設間隔（interval）（#4142 由 @griffio 提供）
- [PostgreSQL Dialect] 新增 PostgreSQL 間隔欄位結果（#4152 由 @griffio 提供）
- [PostgreSQL Dialect] 新增 PostgreSQL Alter Column（#4165 由 @griffio 提供）
- [PostgreSQL Dialect] PostgreSQL：新增 date_part（#4198 由 @hfhbd 提供）
- [MySQL Dialect] 新增 SQL 字元長度函式（#4134 由 @griffio 提供）
- [IDE Plugin] 新增 sqldelight 目錄建議（#3976 由 @aperfilyev 提供）
- [IDE Plugin] 在專案樹狀結構中緊湊呈現中間套件（#3992 由 @aperfilyev 提供）
- [IDE Plugin] 新增 join 子句補全（#4086 由 @aperfilyev 提供）
- [IDE Plugin] 建立檢視意圖操作與即時範本（#4074 由 @aperfilyev 提供）
- [IDE Plugin] 針對 DELETE 或 UPDATE 內遺漏 WHERE 發出警告（#4058 由 @aperfilyev 提供）
- [Gradle Plugin] 啟用型別安全專案存取子（#4005 由 @hfhbd 提供）

### 變更
- [Gradle Plugin] 允許透過 ServiceLoader 機制為 VerifyMigrationTask 註冊 DriverInitializer（#3986 由 @C2H6O 提供）
- [Gradle Plugin] 建立明確的編譯器環境（#4079 由 @hfhbd 提供）
- [JS Driver] 將 Web Worker 驅動程式拆分為獨立的構件
- [JS Driver] 不公開 JsWorkerSqlCursor（#3874 由 @hfhbd 提供）
- [JS Driver] 停用 sqljs 驅動程式的發佈（#4108）
- [Runtime] 強制同步驅動程式需要同步結構描述初始設定式（#4013）
- [Runtime] 改進游標的非同步支援（#4102）
- [Runtime] 移除已棄用的目標（#4149 由 @hfhbd 提供）
- [Runtime] 移除對舊 MM（記憶體模型）的支援（#4148 由 @hfhbd 提供）

### 修正
- [R2DBC Driver] R2DBC：等待關閉驅動程式（#4139 由 @hfhbd 提供）
- [Compiler] 在 database create(SqlDriver) 中包含來自遷移的 PRAGMA（#3845 由 @MariusVolkhart 提供）
- [Compiler] 修正 RETURNING 子句的程式碼產生（#3872 由 @MariusVolkhart 提供）
- [Compiler] 不要為虛擬資料表產生型別（#4015）
- [Gradle Plugin] Gradle 外掛程式的小幅使用體驗改善（#3930 由 @zacsweers 提供）
- [IDE Plugin] 修正未解析的 Kotlin 型別（#3924 由 @aperfilyev 提供）
- [IDE Plugin] 修正展開萬用字元意圖操作以支援限定詞（#3979 由 @aperfilyev 提供）
- [IDE Plugin] 若缺少 java home 則使用可用的 JDK（#3925 由 @aperfilyev 提供）
- [IDE Plugin] 修正套件名稱上的尋找用法（#4010）
- [IDE Plugin] 不要為無效元素顯示自動匯入（#4008）
- [IDE Plugin] 若缺少方言則不進行解析（#4009）
- [IDE Plugin] 在失效狀態期間忽略編譯器的 IDE 執行（#4016）
- [IDE Plugin] 新增對 IntelliJ 2023.1 的支援（#4037 由 @madisp 提供）
- [IDE Plugin] 重新命名欄位時重新命名具名引數的使用情況（#4027 由 @aperfilyev 提供）
- [IDE Plugin] 修正新增遷移快顯視窗（#4105 由 @aperfilyev 提供）
- [IDE Plugin] 在遷移檔案中停用 SchemaNeedsMigrationInspection（#4106 由 @aperfilyev 提供）
- [IDE Plugin] 在產生遷移時使用 SQL 欄位名稱取代型別名稱（#4112 由 @aperfilyev 提供）

## [2.0.0-alpha05] - 2023-01-20 {id="2-0-0-alpha05-2023-01-20"}
[2.0.0-alpha05]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha05

### 新增
- [Paging] 多平台分頁擴充套件（由 @jeffdgr8 提供）
- [Runtime] 為 Listener 介面新增 fun 修飾詞。
- [SQLite Dialect] 新增 SQLite 3.33 支援（UPDATE FROM）（由 @eygraber 提供）
- [PostgreSQL Dialect] 在 PostgreSQL 中支援 UPDATE FROM（由 @eygraber 提供）

### 變更
- [RDBC Driver] 公開連線（由 @hfhbd 提供）
- [Runtime] 將遷移回呼移入主要 `migrate` 函式中
- [Gradle Plugin] 對下游專案隱藏 Configurations
- [Gradle Plugin] 僅遮蔽（shade）Intellij（由 @hfhbd 提供）
- [Gradle Plugin] 支援 Kotlin 1.8.0-Beta 並新增多版本 Kotlin 測試（由 @hfhbd 提供）

### 修正
- [RDBC Driver] 改用 javaObjectType（由 @hfhbd 提供）
- [RDBC Driver] 修正 bindStatement 中的原始 null 值（由 @hfhbd 提供）
- [RDBC Driver] 支援 R2DBC 1.0（由 @hfhbd 提供）
- [PostgreSQL Dialect] Postgres：修正不帶型別參數的陣列（由 @hfhbd 提供）
- [IDE Plugin] 將 IntelliJ 升級至 221.6008.13（由 @hfhbd 提供）
- [Compiler] 從純檢視解析遞迴原始資料表（由 @hfhbd 提供）
- [Compiler] 使用來自資料表外部鍵子句的值類別（by @hfhbd）
- [Compiler] 修正 SelectQueryGenerator 以支援不帶括號的繫結運算式（由 @bellatoris 提供）
- [Compiler] 修正使用交易時重複產生 ${name}Indexes 變數的問題（由 @sachera 提供）

## [1.5.5] - 2023-01-20 {id="1-5-5-2023-01-20"}
[1.5.5]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.5

這是針對 Kotlin 1.8 和 IntelliJ 2021+ 的相容性版本，支援 JDK 17。

## [1.5.4] - 2022-10-06 {id="1-5-4-2022-10-06"}
[1.5.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.4

這是針對 Kotlin 1.7.20 和 AGP 7.3.0 的相容性更新。

## [2.0.0-alpha04] - 2022-10-03 {id="2-0-0-alpha04-2022-10-03"}
[2.0.0-alpha04]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha04

### 重大變更 {id="breaking-changes"}

- Paging 3 擴充套件 API 已變更為僅允許 int 型別作為計數。
- 協同程式擴充套件現在需要傳入分派器（dispatcher），不再提供預設值。
- Dialect 和 Driver 類別為 final，請改用委派。

### 新增
- [HSQL Dialect] Hsql：在 Insert 中支援為產生的欄位使用 DEFAULT（#3372 由 @hfhbd 提供）
- [PostgreSQL Dialect] PostgreSQL：在 INSERT 中支援為產生的欄位使用 DEFAULT（#3373 由 @hfhbd 提供）
- [PostgreSQL Dialect] 為 PostgreSQL 新增 NOW()（#3403 由 @hfhbd 提供）
- [PostgreSQL Dialect] PostgreSQL 新增 NOT 運算子（#3504 由 @hfhbd 提供）
- [Paging] 允許將 CoroutineContext 傳入 *QueryPagingSource（#3384）
- [Gradle Plugin] 為方言新增更好的版本目錄支援（#3435）
- [Native Driver] 新增回呼以掛鉤進入 NativeSqliteDriver 的 DatabaseConfiguration 建立（#3512 由 @svenjacobs 提供）

### 變更
- [Paging] 為基於 KeyedQueryPagingSource 的 QueryPagingSource 函式新增預設分派器（#3385）
- [Paging] 使 OffsetQueryPagingSource 僅能與 Int 搭配使用（#3386）
- [Async Runtime] 將 await* 移至上層類別 ExecutableQuery（#3524 由 @hfhbd 提供）
- [Coroutines Extensions] 移除 flow 擴充套件的預設參數（#3489）

### 修正
- [Gradle Plugin] 更新至 Kotlin 1.7.20（#3542 由 @zacsweers 提供）
- [R2DBC Driver] 採用不一定總是發送值的 R2DBC 變更（#3525 由 @hfhbd 提供）
- [HSQL Dialect] 修正與 Hsql 搭配時失敗的 SQLite VerifyMigrationTask（#3380 由 @hfhbd 提供）
- [Gradle Plugin] 將任務轉換為使用延遲組態 API（由 @3flex 提供）
- [Gradle Plugin] 避免 Kotlin 1.7.20 中的 NPE（#3398 由 @ZacSweers 提供）
- [Gradle Plugin] 修正壓縮遷移任務的描述（#3449）
- [IDE Plugin] 修正較新 Kotlin 外掛程式中的 NoSuchFieldError（#3422 由 @madisp 提供）
- [IDE Plugin] IDEA：UnusedQueryInspection - 修正 ArrayIndexOutOfBoundsException（#3427 由 @vanniktech 提供）
- [IDE Plugin] 針對舊的 Kotlin 外掛程式參照使用反射
- [Compiler] 帶有擴充函式的自訂方言不會建立匯入（#3338 由 @hfhbd 提供）
- [Compiler] 修正跳脫 CodeBlock.of("${CodeBlock.toString()}") 的問題（#3340 由 @hfhbd 提供）
- [Compiler] 在遷移中等待非同步執行陳述式（#3352）
- [Compiler] 修正 AS（#3370 由 @hfhbd 提供）
- [Compiler] `getObject` 方法支援自動填入實際型別（#3401 由 @robxyy 提供）
- [Compiler] 修正非同步分組回傳陳述式的程式碼產生（#3411）
- [Compiler] 若可能，推論繫結參數的 Kotlin 型別，否則失敗並提供更好的錯誤訊息（#3413 由 @hfhbd 提供）
- [Compiler] 不允許 ABS("foo")（#3430 由 @hfhbd 提供）
- [Compiler] 支援從其他參數推論 Kotlin 型別（#3431 由 @hfhbd 提供）
- [Compiler] 一律建立資料庫實作（#3540 由 @hfhbd 提供）
- [Compiler] 放寬 Javadoc 並將其也加入至自訂對應函式中（#3554 由 @hfhbd 提供）
- [Compiler] 修正繫結中的 DEFAULT（由 @hfhbd 提供）
- [Paging] 修正 Paging 3（#3396）
- [Paging] 允許使用 Long 建構 OffsetQueryPagingSource（#3409）
- [Paging] 不要靜態替換 Dispatchers.Main（#3428）

## [2.0.0-alpha03] - 2022-06-17 {id="2-0-0-alpha03-2022-06-17"}
[2.0.0-alpha03]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha03

### 重大變更

- 方言現在如同實際的 Gradle 相依性一樣被參照。
```groovy
sqldelight {
  MyDatabase {
    dialect("app.cash.sqldelight:postgres-dialect:2.0.0-alpha03")
  }
}
```
- `AfterVersionWithDriver` 型別已移除，改用現在一律包含驅動程式的 `AfterVersion`。
- `Schema` 型別不再是 `SqlDriver` 的子型別。
- `PreparedStatement` API 現在使用以零為基底的索引進行呼叫。

### 新增
- [IDE Plugin] 新增對針對執行中資料庫執行 SQLite、MySQL 和 PostgreSQL 指令的支援（#2718 由 @aperfilyev 提供）
- [IDE Plugin] 新增對 Android Studio 資料庫檢查器的支援（#3107 由 @aperfilyev 提供）
- [Runtime] 新增對非同步驅動程式的支援（#3168 由 @dellisd 提供）
- [Native Driver] 支援新的 Kotlin Native 記憶體模型（#3177 由 @kpgalligan 提供）
- [JS Driver] 為 SqlJs 背景工作程序新增驅動程式（#3203 由 @dellisd 提供）
- [Gradle Plugin] 公開 SQLDelight 任務的類別路徑
- [Gradle Plugin] 新增用於壓縮遷移的 Gradle 任務
- [Gradle Plugin] 新增在遷移檢查期間忽略結構描述定義的旗標
- [MySQL Dialect] 在 MySQL 中支援 FOR SHARE 和 FOR UPDATE（#3098）
- [MySQL Dialect] 支援 MySQL 索引提示（#3099）
- [PostgreSQL Dialect] 新增 date_trunc（#3295 由 @hfhbd 提供）
- [JSON Extensions] 支援 JSON 資料表函式（#3090）

### 變更
- [Runtime] 移除不帶驅動程式的 AfterVersion 型別（#3091）
- [Runtime] 將 Schema 型別移至最上層
- [Runtime] 開放方言和解析器以支援第三方實作（#3232 由 @hfhbd 提供）
- [Compiler] 在失敗報告中包含用於編譯的方言（#3086）
- [Compiler] 跳過未使用的介面卡（#3162 由 @eygraber 提供）
- [Compiler] 在 PrepareStatement 中使用以零為基底的索引（#3269 由 @hfhbd 提供）
- [Gradle Plugin] 同時使方言成為正確的 Gradle 相依性而非字串（#3085）
- [Gradle Plugin] Gradle 驗證任務：遺失資料庫檔案時擲出例外狀況（#3126 由 @vanniktech 提供）

### 修正
- [Gradle Plugin] Gradle 外掛程式的小幅清理與調整（#3171 由 @3flex 提供）
- [Gradle Plugin] 不要為產生的目錄使用 AGP 字串
- [Gradle Plugin] 使用 AGP 命名空間屬性（#3220）
- [Gradle Plugin] 不要將 kotlin-stdlib 作為 Gradle 外掛程式的執行時期相依性加入（#3245 由 @mbonnin 提供）
- [Gradle Plugin] 簡化多平台設定（#3246 由 @mbonnin 提供）
- [Gradle Plugin] 支援純 JS 專案（#3310 由 @hfhbd 提供）
- [IDE Plugin] 為 Gradle 工具 API 使用 java home（#3078）
- [IDE Plugin] 在 IDE 外掛程式內於正確的 classLoader 上載入 JDBC 驅動程式（#3080）
- [IDE Plugin] 在失效前將檔案元素標記為 null，以避免在已存在的 PSI 變更期間發生錯誤（#3082）
- [IDE Plugin] 在 ALTER TABLE 陳述式中尋找新資料表名稱的用法時不要當機（#3106）
- [IDE Plugin] 最佳化檢查器並使其能針對預期的例外狀況型別靜默失敗（#3121）
- [IDE Plugin] 刪除本應為產生目錄的檔案（#3198）
- [IDE Plugin] 修正非安全運算子呼叫
- [Compiler] 確保帶有 RETURNING 陳述式的更新和刪除會執行查詢（#3084）
- [Compiler] 正確推論複合查詢選取中的引數型別（#3096）
- [Compiler] 通用資料表不會產生資料類別，因此不要回傳它們（#3097）
- [Compiler] 更快地找到最頂層的遷移檔案（#3108）
- [Compiler] 在管道運算子上正確繼承可 null 性
- [Compiler] 支援 iif ANSI SQL 函式
- [Compiler] 不要產生空的查詢檔案（#3300 由 @hfhbd 提供）
- [Compiler] 修正僅有問號的介面卡（#3314 由 @hfhbd 提供）
- [PostgreSQL Dialect] PostgreSQL 主鍵欄位一律不可為 null（#3092）
- [PostgreSQL Dialect] 修正多個資料表中具有相同名稱的複製問題（#3297 由 @hfhbd 提供）
- [SQLite 3.35 Dialect] 僅在從變更後的資料表中捨棄已建立索引的欄位時才顯示錯誤（#3158 由 @eygraber 提供）

## [2.0.0-alpha02] - 2022-04-13 {id="2-0-0-alpha02-2022-04-13"}
[2.0.0-alpha02]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha02

### 重大變更

- 您需要將所有出現的 `app.cash.sqldelight.runtime.rx` 替換為 `app.cash.sqldelight.rx2`

### 新增
- [Compiler] 支援在分組陳述式結尾回傳
- [Compiler] 支援透過方言模組擴充編譯器，並新增 SQLite JSON 擴充套件（#1379, #2087）
- [Compiler] 支援回傳值的 PRAGMA 陳述式（#1106）
- [Compiler] 支援為標記的欄位產生值型別
- [Compiler] 新增對開放式鎖定和驗證的支援（#1952）
- [Compiler] 支援多重更新陳述式
- [PostgreSQL] 支援 PostgreSQL returning 陳述式
- [PostgreSQL] 支援 PostgreSQL 日期型別
- [PostgreSQL] 支援 PostgreSQL intervals
- [PostgreSQL] 支援 PostgreSQL 布林值並修復 alter table 上的插入操作
- [PostgreSQL] 支援 PostgreSQL 中的選用 limits
- [PostgreSQL] 支援 PostgreSQL BYTEA 型別
- [PostgreSQL] 為 PostgreSQL serials 新增測試
- [PostgreSQL] 支援 for update PostgreSQL 語法
- [PostgreSQL] 支援 PostgreSQL 陣列型別
- [PostgreSQL] 在 PostgreSQL 中正確儲存/擷取 UUID 型別
- [PostgreSQL] 支援 PostgreSQL NUMERIC 型別（#1882）
- [PostgreSQL] 支援在通用資料表運算式內回傳查詢（#2471）
- [PostgreSQL] 支援 JSON 專用運算子
- [PostgreSQL] 新增 Postgres Copy（由 @hfhbd 提供）
- [MySQL] 支援 MySQL Replace
- [MySQL] 支援 NUMERIC/BigDecimal MySQL 型別（#2051）
- [MySQL] 支援 MySQL truncate 陳述式
- [MySQL] 在 MySQL 中支援 JSON 專用運算子（由 @eygraber 提供）
- [MySQL] 支援 MySQL INTERVAL（#2969 由 @eygraber 提供）
- [HSQL] 新增 HSQL 視窗功能
- [SQLite] 不要取代 WHERE 中可 null 參數的相等檢查（#1490 由 @eygraber 提供）
- [SQLite] 支援 SQLite 3.35 returning 陳述式（#1490 由 @eygraber 提供）
- [SQLite] 支援 GENERATED 子句
- [SQLite] 新增對 SQLite 3.38 方言的支援（由 @eygraber 提供）

### 變更
- [Compiler] 稍微清理產生的程式碼
- [Compiler] 禁止在分組陳述式中使用資料表參數（#1822）
- [Compiler] 將分組查詢置於交易中（#2785）
- [Runtime] 從驅動程式的 execute 方法回傳更新的資料列數
- [Runtime] 將 SqlCursor 限制在存取連線的關鍵區段內（#2123 由 @andersio 提供）
- [Gradle Plugin] 比較遷移的結構描述定義（#841）
- [PostgreSQL] 在 PostgreSQL 中不允許雙引號
- [MySQL] 在 MySQL 中使用 == 時發出錯誤（#2673）

### 修正
- [Compiler] 來自不同資料表的相同介面卡型別在 2.0 alpha 中導致編譯錯誤
- [Compiler] 編譯 upsert 陳述式時的問題（#2791）
- [Compiler] 若有多個相符項，查詢結果應使用 select 中的資料表（#1874, #2313）
- [Compiler] 支援更新具有 INSTEAD OF 觸發器的檢視（#1018）
- [Compiler] 支援函式名稱中的 from 和 for
- [Compiler] 允許在函式運算式中使用 SEPARATOR 關鍵字
- [Compiler] 無法在 ORDER BY 中存取別名資料表的 ROWID
- [Compiler] 在 MySQL 的 HAVING 子句中無法辨識別名欄位名稱
- [Compiler] 錯誤的「Multiple columns found」錯誤
- [Compiler] 無法設定 PRAGMA locking_mode = EXCLUSIVE;
- [PostgreSQL] PostgreSQL 重新命名欄位
- [MySQL] 無法辨識 UNIX_TIMESTAMP、TO_SECONDS、JSON_ARRAYAGG MySQL 函式
- [SQLite] 修正 SQLite 視窗功能
- [IDE Plugin] 在空進度指示器中執行跳轉處理程式（#2990）
- [IDE Plugin] 確保專案未設定時不執行醒目提示造訪程式（#2981, #2976）
- [IDE Plugin] 確保可傳遞的產生程式碼也在 IDE 中更新（#1837）
- [IDE Plugin] 更新方言時使索引失效

## [2.0.0-alpha01] - 2022-03-31 {id="2-0-0-alpha01-2022-03-31"}
[2.0.0-alpha01]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha01

這是 2.0 的第一個 Alpha 版本，包含一些重大變更。我們預計未來會有更多破壞 ABI 的變更，因此請勿發佈相依於此版本的任何程式庫（應用程式使用應該沒問題）。

### 重大變更

- 首先，您需要將所有出現的 `com.squareup.sqldelight` 替換為 `app.cash.sqldelight`
- 其次，您需要將所有出現的 `app.cash.sqldelight.android` 替換為 `app.cash.sqldelight.driver.android`
- 第三，您需要將所有出現的 `app.cash.sqldelight.sqlite.driver` 替換為 `app.cash.sqldelight.driver.jdbc.sqlite`
- 第四，您需要將所有出現的 `app.cash.sqldelight.drivers.native` 替換為 `app.cash.sqldelight.driver.native`
- IDE 外掛程式必須更新至 2.X 版本，可在 [alpha 或 eap 頻道](https://plugins.jetbrains.com/plugin/8191-sqldelight/versions/alpha) 中找到
- 方言現在是相依項，可以在 Gradle 中指定：

```gradle
sqldelight {
  MyDatabase {
    packageName = "com.example"
    dialect = "app.cash.sqldelight:mysql-dialect:2.0.0-alpha01"
  }
}
```

目前支援的方言有 `mysql-dialect`、`postgresql-dialect`、`hsql-dialect`、`sqlite-3-18-dialect`、`sqlite-3-24-dialect`、`sqlite-3-25-dialect`、`sqlite-3-30-dialect` 和 `sqlite-3-35-dialect`

- 基本型別現在必須匯入（例如 `INTEGER AS Boolean` 必須 `import kotlin.Boolean`），某些先前支援的型別現在需要介面卡。`app.cash.sqldelight:primitive-adapters:2.0.0-alpha01` 中提供了大多數轉換的原始型別介面卡（例如用於執行 `Integer AS kotlin.Int` 的 `IntColumnAdapter`）。

### 新增
- [IDE Plugin] 基本建議遷移（由 @aperfilyev 提供）
- [IDE Plugin] 新增匯入提示操作（由 @aperfilyev 提供）
- [IDE Plugin] 新增 Kotlin 類別補全（由 @aperfilyev 提供）
- [Gradle Plugin] 為 Gradle 型別安全專案存取子新增快速鍵（由 @hfhbd 提供）
- [Compiler] 根據方言自訂程式碼產生（由 @MariusVolkhart 提供）
- [JDBC Driver] 為 JdbcDriver 新增常見型別（由 @MariusVolkhart 提供）
- [SQLite] 新增對 SQLite 3.35 的支援（由 @eygraber 提供）
- [SQLite] 新增對 ALTER TABLE DROP COLUMN 的支援（由 @eygraber 提供）
- [SQLite] 新增對 SQLite 3.30 方言的支援（由 @eygraber 提供）
- [SQLite] 在 SQLite 中支援 NULLS FIRST/LAST（由 @eygraber 提供）
- [HSQL] 為 HSQL 新增 generated 子句支援（由 @MariusVolkhart 提供）
- [HSQL] 在 HSQL 中新增對具名參數的支援（由 @MariusVolkhart 提供）
- [HSQL] 自訂 HSQL 插入查詢（由 @MariusVolkhart 提供）

### 變更
- [Everything] 套件名稱已從 com.squareup.sqldelight 變更為 app.cash.sqldelight。
- [Runtime] 將方言移至各自獨立的 Gradle 模組中
- [Runtime] 切換為由驅動程式實作的查詢通知。
- [Runtime] 將預設欄位介面卡擷取至獨立模組（#2056, #2060）
- [Compiler] 讓模組產生查詢實作，而不是在每個模組中重複執行
- [Compiler] 移除產生的資料類別的自訂 toString 產生（由 @PaulWoitaschek 提供）
- [JS Driver] 從 sqljs-driver 中移除 sql.js 相依性（由 @dellisd 提供）
- [Paging] 移除 Android Paging 2 擴充套件
- [IDE Plugin] 在 SQLDelight 同步時新增編輯器橫幅（#2511）
- [IDE Plugin] 最低支援的 IntelliJ 版本為 2021.1

### 修正
- [Runtime] 扁平化接聽程式清單以減少記憶體配置和指標追蹤（由 @andersio 提供）
- [IDE Plugin] 修正錯誤訊息以允許跳轉至錯誤位置（由 @hfhbd 提供）
- [IDE Plugin] 新增遺失的檢查說明（#2768 由 @aperfilyev 提供）
- [IDE Plugin] 修正 GotoDeclarationHandler 中的例外狀況（#2531, #2688, #2804 由 @aperfilyev 提供）
- [IDE Plugin] 醒目提示 import 關鍵字（由 @aperfilyev 提供）
- [IDE Plugin] 修正未解析的 Kotlin 型別（#1678 由 @aperfilyev 提供）
- [IDE Plugin] 修正未解析套件的醒目提示（#2543 由 @aperfilyev 提供）
- [IDE Plugin] 若專案索引尚未初始化，請勿嘗試檢查不相符的欄位
- [IDE Plugin] 在 Gradle 同步發生之前不要初始化檔案索引
- [IDE Plugin] 若 Gradle 同步開始，則取消 SQLDelight 匯入
- [IDE Plugin] 在執行復原操作的執行緒之外重新產生資料庫
- [IDE Plugin] 若無法解析參照，請使用空白 Java 型別
- [IDE Plugin] 在檔案剖析期間正確脫離主執行緒，且僅在寫入時切回
- [IDE Plugin] 改進與較舊 IntelliJ 版本的相容性（由 @3flex 提供）
- [IDE Plugin] 使用更快的註解 API
- [Gradle Plugin] 加入 runtime 時明確支援 js/android 外掛程式（由 @ZacSweers 提供）
- [Gradle Plugin] 註冊遷移輸出任務，而不從遷移衍生結構描述（#2744 由 @kevincianfarini 提供）
- [Gradle Plugin] 若遷移任務當機，印出其執行當機的檔案
- [Gradle Plugin] 產生程式碼時對檔案進行排序以確保等冪輸出（由 @ZacSweers 提供）
- [Compiler] 使用更快的 API 來反覆運算檔案，且不探索整個 PSI 圖
- [Compiler] 為選取函式參數新增關鍵字名稱修飾（mangling）（#2759 由 @aperfilyev 提供）
- [Compiler] 修正遷移介面卡的 packageName（由 @hfhbd 提供）
- [Compiler] 在屬性上產生註解而非在型別上（#2798 由 @aperfilyev 提供）
- [Compiler] 傳遞至 Query 子型別前先對引數進行排序（#2379 由 @aperfilyev 提供）

## [1.5.3] - 2021-11-23 {id="1-5-3-2021-11-23"}
[1.5.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.3

### 新增
- [JDBC Driver] 開放 JdbcDriver 以供第三方驅動程式實作（#2672 由 @hfhbd 提供）
- [MySQL Dialect] 為時間遞增新增遺失的函式（#2671 由 @sdoward 提供）
- [Coroutines Extension] 為 coroutines-extensions 新增 M1 目標（由 @PhilipDukhov 提供）

### 變更
- [Paging3 Extension] 將 sqldelight-android-paging3 作為 JAR 而非 AAR 發佈（#2634 由 @julioromano 提供）
- 同時為軟關鍵字的屬性名稱現在將加上底線後綴。例如 `value` 將公開為 `value_`

### 修正
- [Compiler] 不要為重複的陣列參數擷取變數（由 @aperfilyev 提供）
- [Gradle Plugin] 加入 kotlin.mpp.enableCompatibilityMetadataVariant（#2628 由 @martinbonnin 提供）
- [IDE Plugin] 尋找用法的處理程序需要讀取操作

## [1.5.2] - 2021-10-12 {id="1-5-2-2021-10-12"}
[1.5.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.2

### 新增
- [Gradle Plugin] HMPP 支援（#2548 由 @martinbonnin 提供）
- [IDE Plugin] 新增 NULL 比較檢查（由 @aperfilyev 提供）
- [IDE Plugin] 新增檢查抑制器（#2519 由 @aperfilyev 提供）
- [IDE Plugin] 混合具名與位置參數檢查（由 @aperfilyev 提供）
- [SQLite Driver] 新增 mingwX86 目標（#2558 由 @enginegl 提供）
- [SQLite Driver] 新增 M1 目標
- [SQLite Driver] 新增 linuxX64 支援（#2456 由 @chippmann 提供）
- [MySQL Dialect] 為 MySQL 新增 ROW_COUNT 函式（#2523）
- [PostgreSQL Dialect] PostgreSQL rename, drop column（由 @pabl0rg 提供）
- [PostgreSQL Dialect] PostgreSQL 語法無法辨識 CITEXT
- [PostgreSQL Dialect] 包含 TIMESTAMP WITH TIME ZONE 和 TIMESTAMPTZ
- [PostgreSQL Dialect] 為 PostgreSQL GENERATED 欄位新增語法
- [Runtime] 為 AfterVersion 提供 SqlDriver 作為參數（#2534, 2614 由 @ahmedre 提供）

### 變更
- [Gradle Plugin] 明確要求 Gradle 7.0（#2572 由 @martinbonnin 提供）
- [Gradle Plugin] 讓 VerifyMigrationTask 支援 Gradle 的最新狀態檢查（#2533 由 @3flex 提供）
- [IDE Plugin] 當將可為 null 的型別與不可為 null 的型別連接（join）時，不要發出「Join compares two columns of different types」警告（#2550 由 @pchmielowski 提供）
- [IDE Plugin] 釐清欄位型別中小寫「as」的錯誤（由 @aperfilyev 提供）

### 修正
- [IDE Plugin] 若專案已處置，請勿在新的方言下重新剖析（#2609）
- [IDE Plugin] 若關聯的虛擬檔案為 null，則模組為 null（#2607）
- [IDE Plugin] 避免在未使用的查詢檢查期間當機（#2610）
- [IDE Plugin] 在寫入操作內執行資料庫同步寫入（#2605）
- [IDE Plugin] 讓 IDE 排程 SQLDelight 同步
- [IDE Plugin] 修正 JavaTypeMixin 中的 NPE（#2603 由 @aperfilyev 提供）
- [IDE Plugin] 修正 MismatchJoinColumnInspection 中的 IndexOutOfBoundsException（#2602 由 @aperfilyev 提供）
- [IDE Plugin] 為 UnusedColumnInspection 新增說明（#2600 由 @aperfilyev 提供）
- [IDE Plugin] 將 PsiElement.generatedVirtualFiles 包裝至讀取操作中（#2599 由 @aperfilyev 提供）
- [IDE Plugin] 移除不必要的非 null 轉換（#2596）
- [IDE Plugin] 正確處理尋找用法的 null（#2595）
- [IDE Plugin] 修正 Android 產生檔案的 IDE 自動補全（#2573 由 @martinbonnin 提供）
- [IDE Plugin] 修正 SqlDelightGotoDeclarationHandler 中的 NPE（由 @aperfilyev 提供）
- [IDE Plugin] 修飾 insert 陳述式內引數中的 Kotlin 關鍵字（#2433 由 @aperfilyev 提供）
- [IDE Plugin] 修正 SqlDelightFoldingBuilder 中的 NPE（#2382 由 @aperfilyev 提供）
- [IDE Plugin] 擷取 CopyPasteProcessor 中的 ClassCastException（#2369 由 @aperfilyev 提供）
- [IDE Plugin] 修正更新即時範本（由 @IliasRedissi 提供）
- [IDE Plugin] 為意圖操作新增說明（#2489 由 @aperfilyev 提供）
- [IDE Plugin] 修正找不到資料表時 CreateTriggerMixin 中的例外狀況（由 @aperfilyev 提供）
- [Compiler] 對資料表建立陳述式進行拓撲排序
- [Compiler] 停止在目錄上叫用 `forDatabaseFiles` 回呼（#2532）
- [Gradle Plugin] 將 generateDatabaseInterface 任務相依性傳播給潛在取用者（#2518 由 @martinbonnin 提供）

## [1.5.1] - 2021-07-16 {id="1-5-1-2021-07-16"}
[1.5.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.1

### 新增
- [PostgreSQL Dialect] PostgreSQL JSONB 與 ON Conflict Do Nothing（由 @satook 提供）
- [PostgreSQL Dialect] 新增對 PostgreSQL ON CONFLICT (column, ...) DO UPDATE 的支援（由 @satook 提供）
- [MySQL Dialect] 支援 MySQL 產生的欄位（由 @JGulbronson 提供）
- [Native Driver] 新增 watchosX64 支援
- [IDE Plugin] 新增參數型別與註解（由 @aperfilyev 提供）
- [IDE Plugin] 新增產生「select all」查詢的操作（由 @aperfilyev 提供）
- [IDE Plugin] 在自動補全中顯示欄位型別（由 @aperfilyev 提供）
- [IDE Plugin] 為自動補全新增圖示（由 @aperfilyev 提供）
- [IDE Plugin] 新增產生「select by primary key」查詢的操作（由 @aperfilyev 提供）
- [IDE Plugin] 新增產生「insert into」查詢的操作（由 @aperfilyev 提供）
- [IDE Plugin] 為欄位名稱、陳述式識別碼、函式名稱新增醒目提示（由 @aperfilyev 提供）
- [IDE Plugin] 新增其餘查詢產生操作（#489 由 @aperfilyev 提供）
- [IDE Plugin] 顯示來自 insert-stmt 的參數提示（由 @aperfilyev 提供）
- [IDE Plugin] 資料表別名意圖操作（由 @aperfilyev 提供）
- [IDE Plugin] 限定欄位名稱意圖操作（由 @aperfilyev 提供）
- [IDE Plugin] 跳轉至 Kotlin 屬性的宣告（由 @aperfilyev 提供）

### 變更
- [Native Driver] 盡可能避免凍結和可共享的資料結構，以提高原生交易效能（由 @andersio 提供）
- [Paging 3] 將 Paging3 版本升級至 3.0.0 穩定版
- [JS Driver] 將 sql.js 升級至 1.5.0

### 修正
- [JDBC SQLite Driver] 在清除 ThreadLocal 之前先對連線呼叫 close()（#2444 由 @hannesstruss 提供）
- [RX extensions] 修正訂閱/處置競爭洩漏問題（#2403 由 @pyricau 提供）
- [Coroutines extension] 確保在通知前先註冊查詢接聽程式
- [Compiler] 排序 notifyQueries 以獲得一致的 Kotlin 輸出檔案（由 @thomascjy 提供）
- [Compiler] 不要使用 @JvmField 註解選取查詢類別屬性（由 @eygraber 提供）
- [IDE Plugin] 修正匯入最佳化程式（#2350 由 @aperfilyev 提供）
- [IDE Plugin] 修正未使用的欄位檢查（由 @aperfilyev 提供）
- [IDE Plugin] 為匯入檢查和類別註解器新增巢狀類別支援（由 @aperfilyev 提供）
- [IDE Plugin] 修正 CopyPasteProcessor 中的 NPE（#2363 由 @aperfilyev 提供）
- [IDE Plugin] 修正 InlayParameterHintsProvider 當機問題（#2359 由 @aperfilyev 提供）
- [IDE Plugin] 修正將任何文字複製貼上至 create table 陳述式時插入空白行的問題（#2431 由 @aperfilyev 提供）

## [1.5.0] - 2021-04-23 {id="1-5-0-2021-04-23"}
[1.5.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.0

### 新增
- [SQLite Javascript Driver] 啟用 sqljs-driver 發佈（#1667 由 @dellisd 提供）
- [Paging3 Extension] Android Paging 3 程式庫的擴充套件（#1786 由 @kevincianfarini 提供）
- [MySQL Dialect] 新增對 MySQL ON DUPLICATE KEY UPDATE 衝突解決的支援（由 @rharter 提供）
- [SQLite Dialect] 為 SQLite offsets() 新增編譯器支援（由 @qjroberts 提供）
- [IDE Plugin] 為未知型別新增匯入快速修正（#683 由 @aperfilyev 提供）
- [IDE Plugin] 新增未使用的匯入檢查（#1161 由 @aperfilyev 提供）
- [IDE Plugin] 新增未使用的查詢檢查（由 @aperfilyev 提供）
- [IDE Plugin] 新增未使用的欄位檢查（#569 由 @aperfilyev 提供）
- [IDE Plugin] 複製/貼上時自動帶入匯入（#684 由 @aperfilyev 提供）
- [IDE Plugin] 當 Gradle/IntelliJ 外掛程式版本之間不相容時彈出氣泡提示
- [IDE Plugin] Insert Into ... VALUES(?) 參數提示（#506 由 @aperfilyev 提供）
- [IDE Plugin] 行內參數提示（由 @aperfilyev 提供）
- [Runtime] 在 runtime 中包含一個透過回呼執行遷移的 API（#1844）

### 變更
- [Compiler] 智慧轉換「IS NOT NULL」查詢（#867）
- [Compiler] 防範會在執行階段失敗的關鍵字（#1471, #1629）
- [Gradle Plugin] 將 Gradle 外掛程式大小從 60MB 減少至 13MB。
- [Gradle Plugin] 正確支援 Android 變體，並移除對 KMM 特定目標 SQL 的支援（#1039）
- [Gradle Plugin] 根據 minsdk 挑選最低 SQLite 版本（#1684）
- [Native Driver] 原生驅動程式連線池與效能更新

### 修正
- [Compiler] Lambda 前的 NBSP（由 @oldergod 提供）
- [Compiler] 修正產生的 bind* 和 cursor.get* 陳述式中不相容的型別
- [Compiler] SQL 子句應保留改編後的型別（#2067）
- [Compiler] 僅有 NULL 關鍵字的欄位應為可 null
- [Compiler] 不要產生帶有型別註解的對應器 lambda（#1957）
- [Compiler] 若自訂查詢發生衝突，使用檔案名稱作為額外的套件後綴（#1057, #1278）
- [Compiler] 確保外部鍵串聯會導致查詢接聽程式收到通知（#1325, #1485）
- [Compiler] 若對兩個相同型別進行 union 操作，回傳資料表型別（#1342）
- [Compiler] 確保 ifnull 和 coalesce 的參數可以為 null（#1263）
- [Compiler] 為運算式正確使用查詢施加的可 null 性
- [MySQL Dialect] 支援 MySQL if 陳述式
- [PostgreSQL Dialect] 在 PostgreSQL 中將 NUMERIC 和 DECIMAL 擷取為 Double（#2118）
- [SQLite Dialect] UPSERT 通知應考慮 BEFORE/AFTER UPDATE 觸發器（#2198 由 @andersio 提供）
- [SQLite Driver] 在 SqliteDriver 中為執行緒使用多個連線，除非是在記憶體中（#1832）
- [JDBC Driver] JDBC 驅動程式假定 autoCommit 為 true（#2041）
- [JDBC Driver] 確保發生例外狀況時關閉連線（#2306）
- [IDE Plugin] 修正因路徑分隔符號錯誤導致 Windows 上的 GoToDeclaration/FindUsages 損壞的問題（#2054 由 @angusholder 提供）
- [IDE Plugin] 忽略 Gradle 錯誤而非在 IDE 中當機。
- [IDE Plugin] 若將 sqldelight 檔案移至非 sqldelight 模組，請勿嘗試產生程式碼
- [IDE Plugin] 忽略 IDE 中的程式碼產生錯誤
- [IDE Plugin] 確保不會嘗試負向取子字串（#2068）
- [IDE Plugin] 同時確保在執行 Gradle 操作之前專案未被處置（#2155）
- [IDE Plugin] 可 null 型別上的算術運算也應為可 null（#1853）
- [IDE Plugin] 使「expand * intention」可與其他投影搭配使用（#2173 由 @aperfilyev 提供）
- [IDE Plugin] 若在 GoTo 期間 Kotlin 解析失敗，請勿嘗試跳轉至 sqldelight 檔案
- [IDE Plugin] 若 IntelliJ 在 sqldelight 建立索引時遇到例外狀況，請勿當機
- [IDE Plugin] 處理在 IDE 中產生程式碼之前偵測錯誤時發生的例外狀況
- [IDE Plugin] 使 IDE 外掛程式與動態外掛程式（Dynamic Plugins）相容（#1536）
- [Gradle Plugin] 使用 WorkerApi 產生資料庫時的競爭條件（#2062 由 @stephanenicolas 提供）
- [Gradle Plugin] classLoaderIsolation 阻止了自訂 JDBC 的使用（#2048 由 @benasher44 提供）
- [Gradle Plugin] 改進遺失 packageName 的錯誤訊息（由 @vanniktech 提供）
- [Gradle Plugin] SQLDelight 將 IntelliJ 相依性滲漏至 buildscript 類別路徑中（#1998）
- [Gradle Plugin] 修正 Gradle 建置快取（#2075）
- [Gradle Plugin] 不在 Gradle 外掛程式中依賴 kotlin-native-utils（由 @ilmat192 提供）
- [Gradle Plugin] 若僅有遷移檔案，也寫入資料庫（#2094）
- [Gradle Plugin] 確保菱形相依性在最終編譯單元中僅被選取一次（#1455）

在此特別感謝 @3flex，他在這個版本中做了大量工作來改進 SQLDelight 的基礎結構。

## [1.4.4] - 2020-10-08 {id="1-4-4-2020-10-08"}
[1.4.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.4

### 新增
- [PostgreSQL Dialect] 支援 WITH 中的資料修改陳述式
- [PostgreSQL Dialect] 支援 substring 函式
- [Gradle Plugin] 新增 verifyMigrations 旗標，用於在 SQLDelight 編譯期間驗證遷移（#1872）

### 變更
- [Compiler] 在非 SQLite 方言中將 SQLite 特定函式標記為未知
- [Gradle Plugin] 當套用了 sqldelight 外掛程式但未設定任何資料庫時提供警告（#1421）

### 修正
- [Compiler] 在 ORDER BY 子句中繫結欄位名稱時回報錯誤（#1187 由 @eygraber 提供）
- [Compiler] 產生資料庫介面時出現註冊表警告（#1792）
- [Compiler] case 陳述式型別推論不正確（#1811）
- [Compiler] 為沒有版本的遷移檔案提供更好的錯誤訊息（#2006）
- [Compiler] 某些資料庫型別 ColumnAdapter 所需編組的資料庫型別不正確（#2012）
- [Compiler] CAST 的可 null 性（#1261）
- [Compiler] 查詢包裝函式中出現大量名稱遮蔽警告（#1946 由 @eygraber 提供）
- [Compiler] 產生的程式碼使用完整限定名稱（#1939）
- [IDE Plugin] 從 Gradle 同步觸發 sqldelight 程式碼產生
- [IDE Plugin] 變更 .sq 檔案此外掛程式未重新產生資料庫介面（#1945）
- [IDE Plugin] 將檔案移至新套件時的問題（#444）
- [IDE Plugin] 若無處可移動游標，則不執行任何操作而非當機（#1994）
- [IDE Plugin] 對於 Gradle 專案之外的檔案使用空套件名稱（#1973）
- [IDE Plugin] 針對無效型別適度失敗（#1943）
- [IDE Plugin] 遇到未知運算式時擲出更好的錯誤訊息（#1958）
- [Gradle Plugin] SQLDelight 將 IntelliJ 相依性滲漏至 buildscript 類別路徑中（#1998）
- [Gradle Plugin] 在 *.sq 檔案中新增方法說明文件時出現「JavadocIntegrationKt not found」編譯錯誤（#1982）
- [Gradle Plugin] SQLDelight Gradle 外掛程式不支援組態快取（CoCa）（#1947 由 @stephanenicolas 提供）
- [SQLite JDBC Driver] SQLException: database in auto-commit mode（#1832）
- [Coroutines Extension] 修復 coroutines-extensions 的 IR 後端（#1918 由 @dellisd 提供）

## [1.4.3] - 2020-09-04 {id="1-4-3-2020-09-04"}
[1.4.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.3

### 新增
- [MySQL Dialect] 新增對 MySQL last_insert_id 函式的支援（由 @lawkai 提供）
- [PostgreSQL Dialect] 支援 SERIAL 資料型別（由 @veyndan & @felipecsl 提供）
- [PostgreSQL Dialect] 支援 PostgreSQL RETURNING（由 @veyndan 提供）

### 修正
- [MySQL Dialect] 將 MySQL AUTO_INCREMENT 視為具有預設值（#1823）
- [Compiler] 修正 Upsert 陳述式編譯器錯誤（#1809 由 @eygraber 提供）
- [Compiler] 修正產生無效 Kotlin 的問題（#1925 由 @eygraber 提供）
- [Compiler] 為未知函式提供更好的錯誤訊息（#1843）
- [Compiler] 將 instr 第二個參數的型別公開為 string
- [IDE Plugin] 修復 IDE 外掛程式的常駐程式膨脹和 UI 執行緒停頓問題（#1916）
- [IDE Plugin] 處理 null 模組情況（#1902）
- [IDE Plugin] 在未設定的 sq 檔案中，套件名稱回傳空字串（#1920）
- [IDE Plugin] 修正分組陳述式並為其新增整合測試（#1820）
- [IDE Plugin] 使用內建 ModuleUtil 尋找元素的模組（#1854）
- [IDE Plugin] 僅將有效元素加入查詢（#1909）
- [IDE Plugin] 父代可以為 null（#1857）

## [1.4.2] - 2020-08-27 {id="1-4-2-2020-08-27"}
[1.4.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.2

### 新增
- [Runtime] 支援新的 JS IR 後端
- [Gradle Plugin] 新增 generateSqlDelightInterface Gradle 任務（由 @vanniktech 提供）
- [Gradle Plugin] 新增 verifySqlDelightMigration Gradle 任務（由 @vanniktech 提供）

### 修正
- [IDE Plugin] 使用 Gradle 工具 API 促進 IDE 與 Gradle 之間的資料共享
- [IDE Plugin] 結構描述推導預設為 false
- [IDE Plugin] 正確擷取 commonMain 原始碼集
- [MySQL Dialect] 在 mySqlFunctionType() 中新增 minute（由 @maaxgr 提供）

## [1.4.1] - 2020-08-21 {id="1-4-1-2020-08-21"}
[1.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.1

### 新增
- [Runtime] 支援 Kotlin 1.4.0（#1859）

### 變更
- [Gradle Plugin] 將 AGP 相依性設為 compileOnly（#1362）

### 修正
- [Compiler] 為欄位定義規則和資料表介面產生器新增選用的 Javadoc（#1224 由 @endanke 提供）
- [SQLite Dialect] 新增對 SQLite fts5 輔助函式 highlight、snippet 和 bm25 的支援（由 @drampelt 提供）
- [MySQL Dialect] 支援 MySQL bit 資料型別
- [MySQL Dialect] 支援 MySQL 二進位常值
- [PostgreSQL Dialect] 從 sql-psi 公開 SERIAL（由 @veyndan 提供）
- [PostgreSQL Dialect] 新增 BOOLEAN 資料型別（由 @veyndan 提供）
- [PostgreSQL Dialect] 新增 NULL 欄位條件約束（由 @veyndan 提供）
- [HSQL Dialect] 為 HSQL 新增 `AUTO_INCREMENT` 支援（由 @rharter 提供）

## [1.4.0] - 2020-06-22 {id="1-4-0-2020-06-22"}
[1.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.0

### 新增
- [MySQL Dialect] MySQL 支援（由 @JGulbronson & @veyndan 提供）
- [PostgreSQL Dialect] 實驗性 PostgreSQL 支援（由 @veyndan 提供）
- [HSQL Dialect] 實驗性 H2 支援（由 @MariusVolkhart 提供）
- [SQLite Dialect] SQLite FTS5 支援（由 @benasher44 & @jpalawaga 提供）
- [SQLite Dialect] 支援 alter table rename column（#1505 由 @angusholder 提供）
- [IDE] IDE 支援遷移（.sqm）檔案
- [IDE] 新增模仿內建 SQL 即時範本的 SQLDelight 即時範本（#1154 由 @veyndan 提供）
- [IDE] 新增建立 SqlDelight 檔案操作（#42 由 @romtsn 提供）
- [Runtime] 用於回傳結果的交易的 transactionWithReturn API
- [Compiler] 在 .sq 檔案中將多個 SQL 陳述式組合在一起的語法
- [Compiler] 支援從遷移檔案產生結構描述
- [Gradle Plugin] 新增將遷移檔案輸出為有效 SQL 的任務

### 變更
- [Documentation] 徹底翻新文件網站（由 @saket 提供）
- [Gradle Plugin] 改進不受支援方言的錯誤訊息（由 @veyndan 提供）
- [IDE] 根據方言動態變更檔案圖示（由 @veyndan 提供）
- [JDBC Driver] 從 javax.sql.DataSource 公開 JdbcDriver 建構函式（#1614）

### 修正
- [Compiler] 支援資料表上的 Javadoc 並修正單一檔案中多個 Javadoc 的問題（#1224）
- [Compiler] 允許為合成欄位插入值（#1351）
- [Compiler] 修正目錄名稱清理的不一致問題（由 @ZacSweers 提供）
- [Compiler] 合成欄位在跨 join 時應保留可 null 性（#1656）
- [Compiler] 將 delete 陳述式鎖定在 delete 關鍵字上（#1643）
- [Compiler] 修正引號引用（#1525 由 @angusholder 提供）
- [Compiler] 修正 between 運算子以正確遞迴至運算式中（#1279）
- [Compiler] 建立索引時缺少資料表/欄位提供更好的錯誤訊息（#1372）
- [Compiler] 允許在 join 條件約束中使用外部查詢的投影（#1346）
- [Native Driver] 使 execute 使用 transationPool（由 @benasher44 提供）
- [JDBC Driver] 使用 JDBC 交易 API 取代 SQLite（#1693）
- [IDE] 修正 virtualFile 參照使其一律為原始檔案（#1782）
- [IDE] 向 Bugsnag 回報錯誤時使用正確的 throwable（#1262）
- [Paging Extension] 修正洩漏的 DataSource（#1628）
- [Gradle Plugin] 產生結構描述時若輸出資料庫檔案已存在，則將其刪除（#1645）
- [Gradle Plugin] 若存在缺口則使遷移驗證失敗
- [Gradle Plugin] 明確使用我們設定的檔案索引（#1644）

## [1.3.0] - 2020-04-03 {id="1-3-0-2020-04-03"}
[1.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.3.0

* 新增：[Gradle] Dialect 屬性，用於指定要針對編譯的 SQL 方言。
* 新增：[Compiler] #1009 實驗性支援 MySQL 方言。
* 新增：[Compiler] #1436 支援 sqlite:3.24 方言和 upsert。
* 新增：[JDBC Driver] 從 SQLite JVM 驅動程式中分離出 JDBC 驅動程式。
* 修正：[Compiler] #1199 支援任意長度的 Lambda。
* 修正：[Compiler] #1610 修正 avg() 的傳回型別為可 null。
* 修正：[IntelliJ] #1594 修正路徑分隔符號處理問題，該問題曾導致 Windows 上的 Goto 和 Find Usages 損壞。

## [1.2.2] - 2020-01-22 {id="1-2-2-2020-01-22"}
[1.2.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.2

* 新增：[Runtime] 支援 Windows (mingw)、tvOS、watchOS 和 macOS 架構。
* 修正：[Compiler] sum() 的傳回型別應為可 null。
* 修正：[Paging] 將 Transacter 傳入 QueryDataSourceFactory 以避免競爭條件。
* 修正：[IntelliJ Plugin] 尋找檔案的套件名稱時不要搜尋相依性。
* 修正：[Gradle] #862 將 Gradle 中的驗證器記錄變更為偵錯等級。
* 增強：[Gradle] 將 GenerateSchemaTask 轉換為使用 Gradle 工作程序。
* 附註：sqldelight-runtime 構件已重新命名為 runtime。

## [1.2.1] - 2019-12-11 {id="1-2-1-2019-12-11"}
[1.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.1

* 修正：[Gradle] 支援 Kotlin Native 1.3.60。
* 修正：[Gradle] #1287 同步時發出警告。
* 修正：[Compiler] #1469 為查詢建立 SyntheticAccessor。
* 修正：[JVM Driver] 修正記憶體洩漏問題。
* 附註：協同程式擴充套件構件要求在您的 buildscript 中加入 kotlinx bintray maven 存儲庫。

## [1.2.0] - 2019-08-30 {id="1-2-0-2019-08-30"}
[1.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.0

* 新增：[Runtime] 穩定的 Flow API。
* 修正：[Gradle] 支援 Kotlin Native 1.3.50。
* 修正：[Gradle] #1380 乾淨組建有時會失敗。
* 修正：[Gradle] #1348 執行驗證任務時印出「Could not retrieve functions」。
* 修正：[Compile] #1405 若查詢包含連接的 FTS 資料表，則無法建置專案。
* 修正：[Gradle] #1266 擁有多個資料庫模組時 Gradle 建置偶發性失敗。

## [1.1.4] - 2019-07-11 {id="1-1-4-2019-07-11"}
[1.1.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.4

* 新增：[Runtime] 實驗性 Kotlin Flow API。
* 修正：[Gradle] Kotlin/Native 1.3.40 相容性。
* 修正：[Gradle] #1243 修正 SQLDelight 與 Gradle configure on demand 的搭配使用問題。
* 修正：[Gradle] #1385 修正 SQLDelight 與增量註解處理的搭配使用問題。
* 修正：[Gradle] 允許快取 Gradle 任務。
* 修正：[Gradle] #1274 允許在 Kotlin DSL 中使用 sqldelight 擴充功能。
* 修正：[Compiler] 具決定性地為每個查詢產生唯一 ID。
* 修正：[Compiler] 僅在交易完成時通知接聽中的查詢。
* 修正：[JVM Driver] #1370 強制 JdbcSqliteDriver 使用者提供資料庫 URL。

## [1.1.3] - 2019-04-14 {id="1-1-3-2019-04-14"}
[1.1.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.3

* Gradle Metadata 1.0 發佈。

## [1.1.2] - 2019-04-14 {id="1-1-2-2019-04-14"}
[1.1.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.2

* 新增：[Runtime] #1267 記錄驅動程式裝飾器。
* 修正：[Compiler] #1254 拆分長度超過 2^16 個字元的字串常值。
* 修正：[Gradle] #1260 產生的原始碼在多平台專案中被識別為 iOS 原始碼。
* 修正：[IDE] #1290 CopyAsSqliteAction.kt:43 中的 kotlin.KotlinNullPointerException。
* 修正：[Gradle] #1268 在最新版本中執行 linkDebugFrameworkIos* 任務失敗。

## [1.1.1] - 2019-03-01 {id="1-1-1-2019-03-01"}
[1.1.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.1

* 修正：[Gradle] 修正 Android 專案的模組相依性編譯。
* 修正：[Gradle] #1246 在 afterEvaluate 中設定 API 相依性。
* 修正：[Compiler] 正確印出陣列型別。

## [1.1.0] - 2019-02-27 {id="1-1-0-2019-02-27"}
[1.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.0

* 新增：[Gradle] #502 允許指定結構描述模組相依性。
* 增強：[Compiler] #1111 資料表錯誤排在其他錯誤之前。
* 修正：[Compiler] #1225 為 REAL 常值傳回正確的型別。
* 修正：[Compiler] #1218 docid 透過觸發器傳播。

## [1.0.3] - 2019-01-30 {id="1-0-3-2019-01-30"}
[1.0.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.3

* 增強：[Runtime] #1195 Native 驅動程式/Runtime Arm32。
* 增強：[Runtime] #1190 從 Query 型別公開對應器。

## [1.0.2] - 2019-01-26 {id="1-0-2-2019-01-26"}
[1.0.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.2

* 修正：[Gradle Plugin] 更新至 Kotlin 1.3.20。
* 修正：[Runtime] 交易不再吞掉例外狀況。

## [1.0.1] - 2019-01-21 {id="1-0-1-2019-01-21"}
[1.0.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.1

* 增強：[Native Driver] 允許將目錄名稱傳遞給 DatabaseConfiguration。
* 增強：[Compiler] #1173 沒有套件的檔案編譯失敗。
* 修正：[IDE] 正確向 Square 回報 IDE 錯誤。
* 修正：[IDE] #1162 同一套件中的型別顯示為錯誤但運作正常。
* 修正：[IDE] #1166 重新命名資料表失敗並出現 NPE。
* 修正：[Compiler] #1167 嘗試剖析帶有 UNION 和 SELECT 的複雜 SQL 陳述式時擲出例外狀況。

## [1.0.0] - 2019-01-08 {id="1-0-0-2019-01-08"}
[1.0.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.0

* 新增：徹底翻新產生的程式碼，現在改用 Kotlin。
* 新增：RxJava2 擴充套件構件。
* 新增：Android Paging 擴充套件構件。
* 新增：Kotlin Multiplatform 支援。
* 新增：Android、iOS 和 JVM SQLite 驅動程式構件。
* 新增：交易 API。

## [0.7.0] - 2018-02-12 {id="0-7-0-2018-02-12"}
[0.7.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.7.0

 * 新增：產生的程式碼已更新為僅使用 Support SQLite 程式庫。所有查詢現在都會產生陳述式物件而非原始字串。
 * 新增：IDE 中的陳述式摺疊。
 * 新增：布林型別現在會自動處理。
 * 修正：從程式碼產生中移除已棄用的編組器（marshals）。
 * 修正：更正「avg」SQL 函式型別對應為 REAL。
 * 修正：正確偵測「julianday」SQL 函式。

## [0.6.1] - 2017-03-22 {id="0-6-1-2017-03-22"}
[0.6.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.6.1

 * 新增：為沒有引數的 Delete、Update 和 Insert 陳述式產生已編譯的陳述式。
 * 修正：在子查詢中使用的檢視內使用 USING 子句不會出錯。
 * 修正：移除產生的 Mapper 上重複的型別。
 * 修正：子查詢可用於針對引數進行檢查的運算式中。

## [0.6.0] - 2017-03-06 {id="0-6-0-2017-03-06"}
[0.6.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.6.0

 * 新增：Select 查詢現在公開為 `SqlDelightStatement` 工廠而非字串常數。
 * 新增：查詢 Javadoc 現在會複製到陳述式和對應器工廠。
 * 新增：為檢視名稱輸出字串常數。
 * 修正：需要工廠的檢視查詢現在正確地要求這些工廠作為引數。
 * 修正：驗證插入的引數數量與指定的欄位數量相符。
 * 修正：正確編碼在 where 子句中使用的 blob 常值。
 * 此版本需要 Gradle 3.3 或更高版本。

## [0.5.1] - 2016-10-24 {id="0-5-1-2016-10-24"}
[0.5.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.5.1

 * 新增：編譯後的陳述式繼承抽象型別。
 * 修正：參數中的原始型別若可為 null 則會進行裝箱（boxed）。
 * 修正：繫結引數所需的所有工廠都存在於工廠方法中。
 * 修正：跳脫的欄位名稱可正確編組。

## [0.5.0] - 2016-10-19 {id="0-5-0-2016-10-19"}
[0.5.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.5.0

 * 新增：SQLite 引數可以透過 Factory 進行型別安全傳遞
 * 新增：IntelliJ 外掛程式對 .sq 檔案執行格式化
 * 新增：支援 SQLite 時間戳記常值
 * 修正：參數化型別可以在 IntelliJ 中點擊穿透
 * 修正：若從 Cursor 抓取跳脫的欄位名稱，不再擲出 RuntimeExceptions。
 * 修正：Gradle 外掛程式在嘗試印出例外狀況時不會當機。

## [0.4.4] - 2016-07-20 {id="0-4-4-2016-07-20"}
[0.4.4]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.4

 * 新增：原生支援 short 作為欄位 Java 型別
 * 新增：產生對應器和工廠方法上的 Javadoc
 * 修正：group_concat 和 nullif 函式具有正確的可 null 性
 * 修正：與 Android Studio 2.2-alpha 的相容性
 * 修正：WITH RECURSIVE 不再導致外掛程式當機

## [0.4.3] - 2016-07-07 {id="0-4-3-2016-07-07"}
[0.4.3]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.3

 * 新增：編譯錯誤連結至原始程式檔。
 * 新增：按右鍵將 SQLDelight 程式碼複製為有效的 SQLite。
 * 新增：具名陳述式上的 Javadoc 將出現在產生的字串上。
 * 修正：產生的檢視模型包含可 null 性註解。
 * 修正：來自 union 產生的程式碼具有正確的型別和可 null 性，以支援所有可能的欄位。
 * 修正：sum 和 round SQLite 函式在產生的程式碼中具有正確的型別。
 * 修正：CAST、內部選取錯誤修復。
 * 修正：CREATE TABLE 陳述式中的自動補全。
 * 修正：套件中可以使用 SQLite 關鍵字。

## [0.4.2] - 2016-06-16 {id="0-4-2-2016-06-16"}
[0.4.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.2

 * 新增：可從工廠建立 Marshal。
 * 修正：IntelliJ 外掛程式以正確的泛型順序產生工廠方法。
 * 修正：函式名稱可以使用任何大小寫。

## [0.4.1] - 2016-06-14 {id="0-4-1-2016-06-14"}
[0.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.1

 * 修正：IntelliJ 外掛程式以正確的泛型順序產生類別。
 * 修正：欄位定義可以使用任何大小寫。

## [0.4.0] - 2016-06-14 {id="0-4-0-2016-06-14"}
[0.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.0

 * 新增：對應器按查詢產生而非按資料表產生。
 * 新增：可在 .sq 檔案中匯入 Java 型別。
 * 新增：驗證 SQLite 函式。
 * 修正：移除重複的錯誤。
 * 修正：大寫欄位名稱和 Java 關鍵字欄位名稱不會報錯。

## [0.3.2] - 2016-05-14 {id="0-3-2-2016-05-14"}
[0.3.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.2

 * 新增：自動補全和尋找用法現在適用於檢視和別名。
 * 修正：編譯期驗證現在允許在 select 中使用函式。
 * 修正：支援僅宣告預設值的 insert 陳述式。
 * 修正：匯入未使用 SQLDelight 的專案此外掛程式不再當機。

## [0.3.1] - 2016-04-27 {id="0-3-1-2016-04-27"}
[0.3.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.1

  * 修正：介面可見性改回 public，以避免來自方法參照的 Illegal Access 執行階段例外狀況。
  * 修正：正確評估子運算式。

## [0.3.0] - 2016-04-26 {id="0-3-0-2016-04-26"}
[0.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.0

  * 新增：欄位定義使用 SQLite 型別，並可包含額外的「AS」條件約束以指定 Java 型別。
  * 新增：可從 IDE 發送錯誤報告。
  * 修正：自動補全功能正常運作。
  * 修正：編輯 .sq 檔案時會更新 SQLDelight 模型檔案。
  * 移除：不再支援附加的資料庫（attached databases）。

## [0.2.2] - 2016-03-07 {id="0-2-2-2016-03-07"}
[0.2.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.2

 * 新增：對 insert、update、delete、index 和 trigger 陳述式所使用的欄位進行編譯期驗證。
 * 修正：在檔案移動/建立時 IDE 外掛程式不當機。

## [0.2.1] - 2016-03-07 {id="0-2-1-2016-03-07"}
[0.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.1

 * 新增：Ctrl+`/`（OSX 上為 Cmd+`/`）切換所選行的註解。
 * 新增：對 SQL 查詢所使用的欄位進行編譯期驗證。
 * 修正：在 IDE 和 Gradle 外掛程式中均支援 Windows 路徑。

## [0.2.0] - 2016-02-29 {id="0-2-0-2016-02-29"}
[0.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.0

 * 新增：為 Marshal 類別新增複製建構函式。
 * 新增：更新至 Kotlin 1.0 正式版。
 * 修正：以非失敗的方式回報「sqldelight」資料夾結構問題。
 * 修正：禁止命名為 `table_name` 的欄位。其產生的常數會與資料表名稱常數衝突。
 * 修正：確保 IDE 外掛程式立即產生模型類別，無論 `.sq` 檔案是否已被開啟。
 * 修正：在 IDE 和 Gradle 外掛程式中均支援 Windows 路徑。

## [0.1.2] - 2016-02-13 {id="0-1-2-2016-02-13"}
[0.1.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.2

 * 修正：移除阻止 Gradle 外掛程式在大多數專案中使用的程式碼。
 * 修正：新增 Antlr 執行階段上遺漏的編譯器相依性。

## [0.1.1] - 2016-02-12 {id="0-1-1-2016-02-12"}
[0.1.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.1

 * 修正：確保 Gradle 外掛程式指向與自身相同版本的 runtime。

## [0.1.0] - 2016-02-12 {id="0-1-0-2016-02-12"}
[0.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.0

初始發佈。