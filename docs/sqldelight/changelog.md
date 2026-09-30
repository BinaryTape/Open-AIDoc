# 变更日志

## 未发布 {id="unreleased"}

### 新增 {id="added"}

- 暂无！

### 变更 {id="changed"}

- [Gradle 插件] 在整个代码生成任务期间将已解析的 `.sq` 文件保留在内存中，使其在垃圾回收后无需再次解析。这可以加快大型项目中的代码生成速度（由 @C2H6O 提交的 #6374）
- [IntelliJ 插件] 崩溃现已报告给 JetBrains Marketplace，而不是自定义的 Bugsnag 实例（由 @JakeWharton 提交的 #6376）

### 修复 {id="fixed"}

- [IntelliJ 插件] 通过更改 IntelliJ API 的使用来修复插件发布违规问题（由 @griffio 提交的 #6366 #6368）

## [2.4.0] - 2026-09-17 {id="2-4-0-2026-09-17"}
[2.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0

### 新增
- [Native 驱动程序] 为 `inMemoryDriver` 添加 `extendedConfig` 形参（由 @GuilhE 提交的 #5539）
- [PostgreSQL 方言] 为隐式定义的系统列添加查询支持（由 @griffio 提交的 #5834）
- [PostgreSQL 方言] 添加基础数组字面量支持（由 @griffio 提交的 #5997）
- [PostgreSQL 方言] 添加基础 LTREE 支持（由 @yesitskev @griffio 提交的 #5880）
- [MySQL 方言] 添加对 INET 函数的支持（由 @mcxinyu 提交的 #5072）
- [PostgreSQL 方言] 添加对 ALTER INDEX 的支持（由 @griffio 提交的 #6224）
- [SQLite 方言] 添加对 SQLite 3.44 聚合函数 DISTINCT、ORDER BY 和 FILTER 的支持（由 @griffio 提交的 #6236）
- [SQLite 方言] 添加对 SQLite 3.37 STRICT 表的支持（由 @griffio 提交的 #6230）
- [Gradle 插件] 添加通过 `codegenExcludedColumns` 从生成的模型中排除列的支持（由 @sokolikp 提交的 #6243）
- [编译器] 向架构添加 `allTableNames` 函数（由 @edenman 提交的 #6245）
- [PostgreSQL 方言] 添加对 ANY 运算符的支持（由 @griffio 提交的 #6253）
- [SQLite 方言] 添加 SQLite 3.39 对 RIGHT JOIN 和 FULL JOIN 的支持（由 @griffio 提交的 #6273）
- [PostgreSQL 方言] 在触发器函数中添加对 `RAISE` 语句和 `FOUND` 变量的支持（由 @griffio 提交的 #6297）

### 变更
- [PostgreSQL 方言] 将 arrayIntermediateType 的可见性更改为 public（由 @griffio 提交的 #5835）
- [Gradle 插件] 实现更严格的 MigrationFile 版本控制（由 @madisp 提交的 #5730）
- [Gradle 插件] 将支持的最低 Gradle 版本提升至 8.2.1（由 @maxsav 提交的 #6217）
- [Gradle 插件] 支持 Gradle 隔离项目（isolated projects）（由 @maxsav 提交的 #6217）
- [IntelliJ 插件] 最低支持版本为 2023.3 / Android Studio Jellyfish

### 修复
- [Gradle 插件] 在 JDK 24+ 上抑制编译器工作线程产生的 `sun.misc.Unsafe` 弃用警告（#6321）
- [编译器] 在生成的代码中抑制 Kotlin 额外警告（由 @eyupcanakman 提交的 #6208）
- [编译器] 非分组聚合结果集中的其他列始终可为 null
- [PostgreSQL 方言] 正确解析 coalesce 和 ifnull 的为 null 性
- [PostgreSQL 方言] 修复 PostgreSQL 方言的 IDE 集成
- [PostgreSQL 方言] 改进 PostgreSQL 方言的 IDE 插件（由 @griffio 提交的 #6209）
- [IntelliJ 插件] IDE 插件可对所有方言执行代码补全（由 @griffio 提交的 #6210）
- [Gradle 插件] 修复运行 verify database 任务时的循环依赖错误（由 @griffio 提交的 #6221）
- [编译器] 修复多行更新时的乐观锁问题（由 @griffio 提交的 #6240）
- [IntelliJ 插件] 修复导致 IDEA 2026.2 崩溃的弃用问题（由 @griffio 提交的 #6247）
- [Gradle 插件] 修复在 AGP 8.9 到 8.11 上 Kotlin 编译无法捕获生成源的问题
- [PostgreSQL 方言] 修复使用基本类型绑定实参的 lower 和 upper 函数默认解析为 TEXT 的问题（由 @griffio 提交的 #6262）
- [编译器] 修复使用适配器进行数据类绑定的 insert 值以及迁移改变为 null 性时的问题（由 griffio 提交的 #6269）
- [编译器] 对 null 安全运算符（IS 和 IS DISTINCT FROM）使用可为 null 的绑定实参（由 @griffio 提交的 #6265）
- [Gradle 插件] 对项目依赖使用 AGP 的变体解析（由 @maxsav 提交的 #6217）
- [Gradle 插件] 修复不同构建之间 AGP 变体列表不同时导致 generateDatabaseInterface 的构建缓存未命中的问题
- [Gradle 插件] 修复在未配置任何数据库的情况下应用插件时导致的 IDE 同步崩溃问题（#6088）
- [PostgreSQL 方言] 修复使用嵌套函数调用时的 JSON 聚合函数问题（由 @griffio 提交的 #6281）
- [Paging3 扩展] 修复数据库为空时 KeyedQueryPagingSource 崩溃的问题（由 @woods-marshes 提交的 #6284）
- [编译器] 修复当更新器语句与类似 `COALESCE` 的封装函数一起使用时的 Java 类型适配器问题（由 @griffio 提交的 #6292）
- [编译器] 修复当模块名称大写时生成的代码包名也大写的问题（由 @griffio 提交的 #6316）
- [PostgreSQL 方言] 允许日期数据类型不区分大小写（由 @griffio 提交的 #6328）
- [PostgreSQL 方言] 修复 `string_agg` 函数使其可为 null（由 @griffio 提交的 #6340）
- [SQLite 方言] 修复使用 `GROUP BY` 时的 SQLite 3.44 聚合函数问题（由 @griffio 提交的 #6343）
- [Gradle 插件] 避免在配置阶段解析数据库依赖（由 @joshfriend 提交的 #6353）

## [2.4.0-rc2] - 2026-09-14 {id="2-4-0-rc2-2026-09-14"}
[2.4.0-rc2]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0-rc2

### 修复

- [PostgreSQL 方言] 修复 `string_agg` 函数使其可为 null（由 @griffio 提交的 #6340）
- [SQLite 方言] 修复使用 `GROUP BY` 时的 SQLite 3.44 聚合函数问题（由 @griffio 提交的 #6343）
- [Gradle 插件] 避免在配置阶段解析数据库依赖（由 @joshfriend 提交的 #6353）

## [2.4.0-rc1] - 2026-09-01 {id="2-4-0-rc1-2026-09-01"}
[2.4.0-rc1]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0-rc1

### 新增
- [Native 驱动程序] 为 `inMemoryDriver` 添加 `extendedConfig` 形参（由 @GuilhE 提交的 #5539）
- [PostgreSQL 方言] 为隐式定义的系统列添加查询支持（由 @griffio 提交的 #5834）
- [PostgreSQL 方言] 添加基础数组字面量支持（由 @griffio 提交的 #5997）
- [PostgreSQL 方言] 添加基础 LTREE 支持（由 @yesitskev @griffio 提交的 #5880）
- [MySQL 方言] 添加对 INET 函数的支持（由 @mcxinyu 提交的 #5072）
- [PostgreSQL 方言] 添加对 ALTER INDEX 的支持（由 @griffio 提交的 #6224）
- [SQLite 方言] 添加对 SQLite 3.44 聚合函数 DISTINCT、ORDER BY 和 FILTER 的支持（由 @griffio 提交的 #6236）
- [SQLite 方言] 添加对 SQLite 3.37 STRICT 表的支持（由 @griffio 提交的 #6230）
- [Gradle 插件] 添加通过 `codegenExcludedColumns` 从生成的模型中排除列的支持（由 @sokolikp 提交的 #6243）
- [编译器] 向架构添加 `allTableNames` 函数（由 @edenman 提交的 #6245）
- [PostgreSQL 方言] 添加对 ANY 运算符的支持（由 @griffio 提交的 #6253）
- [SQLite 方言] 添加 SQLite 3.39 对 RIGHT JOIN 和 FULL JOIN 的支持（由 @griffio 提交的 #6273）
- [PostgreSQL 方言] 在触发器函数中添加对 `RAISE` 语句和 `FOUND` 变量的支持（由 @griffio 提交的 #6297）

### 变更
- [PostgreSQL 方言] 将 arrayIntermediateType 的可见性更改为 public（由 @griffio 提交的 #5835）
- [Gradle 插件] 实现更严格的 MigrationFile 版本控制（由 @madisp 提交的 #5730）
- [Gradle 插件] 将支持的最低 Gradle 版本提升至 8.2.1（由 @maxsav 提交的 #6217）
- [Gradle 插件] 支持 Gradle 隔离项目（由 @maxsav 提交的 #6217）
- [IntelliJ 插件] 最低支持版本为 2023.3 / Android Studio Jellyfish

### 修复
- [Gradle 插件] 在 JDK 24+ 上抑制编译器工作线程产生的 `sun.misc.Unsafe` 弃用警告（#6321）
- [编译器] 在生成的代码中抑制 Kotlin 额外警告（由 @eyupcanakman 提交的 #6208）
- [编译器] 非分组聚合结果集中的其他列始终可为 null
- [PostgreSQL 方言] 正确解析 coalesce 和 ifnull 的为 null 性
- [PostgreSQL 方言] 修复 PostgreSQL 方言的 IDE 集成
- [PostgreSQL 方言] 改进 PostgreSQL 方言的 IDE 插件（由 @griffio 提交的 #6209）
- [IntelliJ 插件] IDE 插件可对所有方言执行代码补全（由 @griffio 提交的 #6210）
- [Gradle 插件] 修复运行 verify database 任务时的循环依赖错误（由 @griffio 提交的 #6221）
- [编译器] 修复多行更新时的乐观锁问题（由 @griffio 提交的 #6240）
- [IntelliJ 插件] 修复导致 IDEA 2026.2 崩溃的弃用问题（由 @griffio 提交的 #6247）
- [Gradle 插件] 修复在 AGP 8.9 到 8.11 上 Kotlin 编译无法捕获生成源的问题
- [PostgreSQL 方言] 修复使用基本类型绑定实参的 lower 和 upper 函数默认解析为 TEXT 的问题（由 @griffio 提交的 #6262）
- [编译器] 修复使用适配器进行数据类绑定的 insert 值以及迁移改变为 null 性时的问题（由 griffio 提交的 #6269）
- [编译器] 对 null 安全运算符（IS 和 IS DISTINCT FROM）使用可为 null 的绑定实参（由 @griffio 提交的 #6265）
- [Gradle 插件] 对项目依赖使用 AGP 的变体解析（由 @maxsav 提交的 #6217）
- [Gradle 插件] 修复不同构建之间 AGP 变体列表不同时导致 generateDatabaseInterface 的构建缓存未命中的问题
- [Gradle 插件] 修复在未配置任何数据库的情况下应用插件时导致的 IDE 同步崩溃问题（#6088）
- [PostgreSQL 方言] 修复使用嵌套函数调用时的 JSON 聚合函数问题（由 @griffio 提交的 #6281）
- [Paging3 扩展] 修复数据库为空时 KeyedQueryPagingSource 崩溃的问题（由 @woods-marshes 提交的 #6284）
- [编译器] 修复当更新器语句与类似 `COALESCE` 的封装函数一起使用时的 Java 类型适配器问题（由 @griffio 提交的 #6292）
- [编译器] 修复当模块名称大写时生成的代码包名也大写的问题（由 @griffio 提交的 #6316）
- [PostgreSQL 方言] 允许日期数据类型不区分大小写（由 @griffio 提交的 #6328）

## [2.3.2] - 2026-03-16 {id="2-3-2-2026-03-16"}
[2.3.2]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.2

### 新增
- [PostgreSQL 方言] 改进对 ALTER TABLE ALTER TYPE USING 表达式的支持（由 @griffio 提交的 #6116）
- [PostgreSQL 方言] 添加对 DROP COLUMN IF EXISTS 的支持（由 @griffio 提交的 #6112）
- [Gradle 插件] 添加 expandSelectStar 标志以关闭 Select 通配符展开（由 @griffio 提交的 #5813）
- [MySQL 方言] 添加对窗口函数的支持（由 @griffio 提交的 #6086）
- [Gradle 插件] 修复起始架构版本非 1 且 verifyMigrations 为 true 时的构建失败问题（由 @neilgmiller 提交的 #6017）
- [Gradle 插件] 使 `SqlDelightWorkerTask` 更具可配置性，并更新默认配置以支持在 Windows 上开发（由 @MSDarwish2000 提交的 #5215）
- [SQLite 方言] 添加对 FTS5 虚表中合成列（synthesized columns）的支持（由 @watbe 提交的 #5986）
- [PostgreSQL 方言] 添加对 Postgres 行级安全性的支持（由 @shellderp 提交的 #6087）
- [PostgreSQL 方言] 扩展 FOR UPDATE 以支持 OF table、NO KEY UPDATE、NO WAIT（由 @shellderp 提交的 #6104）
- [PostgreSQL 方言] 支持 Postgis Point 类型及相关函数（由 @vanniktech 提交的 #5602）
- [运行时] 添加了 `SuspendingTransacter.TransactionDispatcher`，提供了控制事务的 `CoroutineContext` 的机制（由 @eygraber 提交的 #5967）
- [Gradle 插件] 完全兼容 Android Gradle Plugin 9.0 的新 DSL（#6140）
- [PostgreSQL 方言] 支持 PostgreSQL CREATE TABLE 存储参数（由 @griffio 提交的 #6148）
- [PostgreSQL 方言] 修复 PostgreSQL 唯一表约束可为 null 的结果列（由 @griffio 提交的 #6167）

### 变更
- [编译器] 将编译器输出类型从 java.lang.Void 更改为 kotlin.Nothing（由 @griffio 提交的 #6099）
- [编译器] 允许在包名中使用下划线。之前下划线会被清理掉，导致非预期行为（由 @BierDav 提交的 #6027）
- [Paging 扩展] 切换至 AndroidX Paging（由 @jeffdgr8 提交的 #5910）
- [Android 驱动程序] 将 Android minSdk 提升至 23（#6141）
- [Paging 扩展] 升级至 Paging 3.4.1，并移除了 X64 Apple 目标（#6166）

### 修复
- [IntelliJ 插件] 修复在 VFS 刷新事件期间由于在 EDT 上阻塞文件类型检测导致的 IDE 冻结问题。
- [SQLite 方言] 修复使用 JSON 路径运算符时的 SQLite 3.38 编译错误（由 @griffio 提交的 #6070）
- [SQLite 方言] 在使用自定义列类型时，为 group_concat 函数使用 String 类型（由 @griffio 提交的 #6082）
- [Gradle 插件] 提升 `VerifyMigrationTask` 的性能，防止其在复杂架构上卡死（由 @Lightwood13 提交的 #6073）
- [IntelliJ 插件] 修复插件初始化异常并更新弃用方法（由 @griffio 提交的 #6040）
- [Gradle 插件] 修复与 Android Gradle Plugin 内置 Kotlin 的兼容性（#6139）

## [2.3.1] - 2025-03-12 {id="2-3-1-2025-03-12"}
[2.3.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.1

发布失败。请使用 2.3.2！

## [2.3.0] - 2025-03-12 {id="2-3-0-2025-03-12"}
[2.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.0

发布失败。请使用 2.3.2！

## [2.2.1] - 2025-11-13 {id="2-2-1-2025-11-13"}
[2.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.2.1

### 新增
- [PostgreSQL 方言] 修复 Postgres numeric/integer/biginteger 类型映射（由 @griffio 提交的 #5994）
- [编译器] 改进编译器错误消息，在需要 CAST 时包含源文件位置（由 @griffio 提交的 #5979）
- [PostgreSQL 方言] 添加对 Postgres JSON 运算符路径提取的支持（由 @griffio 提交的 #5971）
- [SQLite 方言] 添加 SQLite 3.35 对使用通用表表达式的 MATERIALIZED 查询规划器提示的支持（由 @griffio 提交的 #5961）
- [PostgreSQL 方言] 添加对使用通用表表达式的 MATERIALIZED 查询规划器提示的支持（由 @griffio 提交的 #5961）
- [PostgreSQL 方言] 添加对 Postgres JSON 聚合 FILTER 的支持（由 @griffio 提交的 #5957）
- [PostgreSQL 方言] 添加对 Postgres 枚举的支持（由 @griffio 提交的 #5935）
- [PostgreSQL 方言] 添加对 Postgres 触发器的有限支持（由 @griffio 提交的 #5932）
- [PostgreSQL 方言] 添加断言以检查 SQL 表达式是否可解析为 JSON（由 @griffio 提交的 #5843）
- [PostgreSQL 方言] 添加对 PostgreSQL Comment On 语句的有限支持（由 @griffio 提交的 #5808）
- [MySQL 方言] 添加对索引可见性选项的支持（由 @orenkislev-faire 提交的 #5785）
- [PostgreSQL 方言] 添加对 TSQUERY 数据类型的支持（由 @griffio 提交的 #5779）
- [Gradle 插件] 在添加模块时添加对版本目录（version catalogs）的支持（由 @DRSchlaubi 提交的 #5755）

### 变更
- 开发中的快照现在发布到 Central Portal Snapshots 仓库：https://central.sonatype.com/repository/maven-snapshots/。
- [编译器] 使用构造函数引用简化了默认生成的查询（由 @jonapoul 提交的 #5814）

### 修复
- [编译器] 修复使用包含通用表表达式的视图时的堆栈溢出问题（由 @griffio 提交的 #5928）
- [Gradle 插件] 修复打开 SqlDelight 工具窗口添加“New Connection”时的崩溃问题（由 @griffio 提交的 #5906）
- [IntelliJ 插件] 避免 copy-to-sqlite 装订区域操作中与线程相关的崩溃（由 @griffio 提交的 #5901）
- [IntelliJ 插件] 修复在使用架构语句 CREATE INDEX 和 CREATE VIEW 时的 PostgreSQL 方言问题（由 @griffio 提交的 #5772）
- [编译器] 修复引用列时的 FTS 堆栈溢出（由 @griffio 提交的 #5896）
- [编译器] 修复 With Recursive 堆栈溢出（由 @griffio 提交的 #5892）
- [编译器] 修复 Insert|Update|Delete Returning 语句的 Notify 问题（由 @griffio 提交的 #5851）
- [编译器] 修复返回 Long 的事务块的异步结果类型（由 @griffio 提交的 #5836）
- [编译器] 将 SQL 参数绑定复杂度从 O(n²) 优化到 O(n)（由 @chenf7 提交的 #5898）
- [SQLite 方言] 修复 SQLite 3.18 缺失函数的问题（由 @griffio 提交的 #5759）

## [2.2.0] - 2025-11-13 {id="2-2-0-2025-11-13"}
[2.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.2.0

部分构件发布失败。请使用 2.2.1！

## [2.1.0] - 2025-05-16 {id="2-1-0-2025-05-16"}
[2.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.1.0

### 新增
- [WASM 驱动程序] 为 Web Worker 驱动添加对 wasmJs 的支持（由 @IlyaGulya 提交的 #5534）
- [PostgreSQL 方言] 支持 PostgreSQL UnNest 将数组展开为多行（由 @griffio 提交的 #5673）
- [PostgreSQL 方言] 支持 PostgreSQL TSRANGE/TSTZRANGE（由 @griffio 提交的 #5297）
- [PostgreSQL 方言] 支持 PostgreSQL Right Full Join（由 @griffio 提交的 #5086）
- [PostgreSQL 方言] 支持 PostgreSQL 从时间类型中 extract（由 @griffio 提交的 #5273）
- [PostgreSQL 方言] 支持 PostgreSQL 数组包含运算符（由 @griffio 提交的 #4933）
- [PostgreSQL 方言] 支持 PostgreSQL drop constraint（由 @griffio 提交的 #5288）
- [PostgreSQL 方言] 支持 PostgreSQL 类型转换（由 @griffio 提交的 #5089）
- [PostgreSQL 方言] 支持 PostgreSQL 子查询的 lateral join 运算符（由 @griffio 提交的 #5122）
- [PostgreSQL 方言] 支持 PostgreSQL ILIKE 运算符（由 @griffio 提交的 #5330）
- [PostgreSQL 方言] 支持 PostgreSQL XML 类型（由 @griffio 提交的 #5331）
- [PostgreSQL 方言] 支持 PostgreSQL AT TIME ZONE（由 @griffio 提交的 #5243）
- [PostgreSQL 方言] 支持 PostgreSQL order by nulls（由 @griffio 提交的 #5199）
- [PostgreSQL 方言] 添加对 PostgreSQL 当前日期/时间函数的支持（由 @drewd 提交的 #5226）
- [PostgreSQL 方言] 支持 PostgreSQL 正则表达式运算符（由 @griffio 提交的 #5137）
- [PostgreSQL 方言] 添加 brin 与 gist（由 @griffio 提交的 #5059）
- [MySQL 方言] 支持 MySQL 方言的 RENAME INDEX（由 @orenkislev-faire 提交的 #5212）
- [JSON 扩展] 为 JSON table 函数添加别名（由 @griffio 提交的 #5372）

### 变更
- [编译器] 生成的查询文件为简单更新操作返回受影响的行数（由 @MariusVolkhart 提交的 #4578）
- [Native 驱动程序] 更新 NativeSqlDatabase.kt 以更改 DELETE、INSERT 和 UPDATE 语句的 readonly 标志（由 @griffio 提交的 #5680）
- [PostgreSQL 方言] 将 PgInterval 更改为 String（由 @griffio 提交的 #5403）
- [PostgreSQL 方言] 支持 SqlDelight 模块以实现 PostgreSQL 扩展（由 @griffio 提交的 #5677）

### 修复
- [编译器] 修复：在执行带结果的分组语句时通知查询（由 @vitorhugods 提交的 #5006）
- [编译器] 修复 SqlDelightModule 类型解析器（由 @griffio 提交的 #5625）
- [编译器] 修复 5501 中插入对象转义列的问题（由 @griffio 提交的 #5503）
- [编译器] 编译器：改进错误消息，使路径链接可点击并指向正确的行与字符位置（由 @vanniktech 提交的 #5604）
- [编译器] 修复问题 5298：允许将关键字用作表名
- [编译器] 修复命名 execute 语句并添加测试
- [编译器] 在对初始化语句排序时考虑外键表约束（由 @TheMrMilchmann 提交的 #5325）
- [编译器] 涉及制表符时正确对齐错误波浪下划线（由 @drewd 提交的 #5224）
- [JDBC 驱动程序] 修复事务结束时 connectionManager 的内存泄漏问题
- [JDBC 驱动程序] 如文档所述，在事务内部运行 SQLite 迁移（由 @morki 提交的 #5218）
- [JDBC 驱动程序] 修复事务提交/回滚后连接泄漏的问题（由 @morki 提交的 #5205）
- [Gradle 插件] 在 `GenerateSchemaTask` 之前执行 `DriverInitializer`（由 @nwagu 提交的 #5562）
- [运行时] 修复真实驱动为异步时 LogSqliteDriver 发生的崩溃（由 @edenman 提交的 #5723）
- [运行时] 修复 StringBuilder 容量问题（由 @janbina 提交的 #5192）
- [PostgreSQL 方言] 修复 PostgreSQL create or replace view（由 @griffio 提交的 #5407）
- [PostgreSQL 方言] 修复 PostgreSQL to_json（由 @griffio 提交的 #5606）
- [PostgreSQL 方言] 修复 PostgreSQL numeric 解析器（由 @griffio 提交的 #5399）
- [PostgreSQL 方言] 修复 SQLite 窗口函数问题（由 @griffio 提交的 #2799）
- [PostgreSQL 方言] 修复 PostgreSQL SELECT DISTINCT ON（由 @griffio 提交的 #5345）
- [PostgreSQL 方言] 修复 alter table add column if not exists（由 @griffio 提交的 #5309）
- [PostgreSQL 方言] 修复 PostgreSQL 异步绑定参数（由 @griffio 提交的 #5313）
- [PostgreSQL 方言] 修复 PostgreSQL 布尔文字（由 @griffio 提交的 #5262）
- [PostgreSQL 方言] 修复 PostgreSQL 窗口函数（由 @griffio 提交的 #5155）
- [PostgreSQL 方言] 修复 PostgreSQL isNull isNotNull 类型（由 @griffio 提交的 #5173）
- [PostgreSQL 方言] 修复 PostgreSQL select distinct（由 @griffio 提交的 #5172）
- [Paging 扩展] 修复 Paging 刷新初始加载问题（由 @evant 提交的 #5615）
- [Paging 扩展] 添加 macOS 原生目标平台（由 @vitorhugods 提交的 #5324）
- [IntelliJ 插件] K2 支持

## [2.0.2] - 2024-04-05 {id="2-0-2-2024-04-05"}
[2.0.2]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.2

### 新增
- [PostgreSQL 方言] 添加 PostgreSQL STRING_AGG 函数（由 @anddani 提交的 #4950）
- [PostgreSQL 方言] 为 pg 方言添加 SET 语句（由 @de-luca 提交的 #4927）
- [PostgreSQL 方言] 添加 PostgreSQL alter column 序列参数（由 @griffio 提交的 #4916）
- [PostgreSQL 方言] 为 insert 语句添加 PostgreSQL alter column default 支持（由 @griffio 提交的 #4912）
- [PostgreSQL 方言] 添加 PostgreSQL alter sequence 和 drop sequence（由 @griffio 提交的 #4920）
- [PostgreSQL 方言] 添加 Postgres 正则表达式函数定义（由 @MariusVolkhart 提交的 #5025）
- [PostgreSQL 方言] 添加 GIN 语法（由 @griffio 提交的 #5027）

### 变更
- [IDE 插件] 最低支持版本为 2023.1 / Android Studio Iguana
- [编译器] 允许在 encapsulatingType 中重写类型的为 null 性（由 @eygraber 提交的 #4882）
- [编译器] 为 SELECT * 内联列名
- [Gradle 插件] 切换至 processIsolation（由 @nwagu 提交的 #5068）
- [Android 运行时] 将 Android minSDK 提升至 21（由 @hfhbd 提交的 #5094）
- [驱动程序] 为方言编写者公开更多 JDBC/R2DBC 语句方法（由 @hfhbd 提交的 #5098）

### 修复
- [PostgreSQL 方言] 修复 PostgreSQL alter table alter column（由 @griffio 提交的 #4868）
- [PostgreSQL 方言] 修复 4448 中表模型缺失导入的问题（由 @griffio 提交的 #4885）
- [PostgreSQL 方言] 修复 4932 中 PostgreSQL 默认约束函数的问题（由 @griffio 提交的 #4934）
- [PostgreSQL 方言] 修复 4879 中迁移期间 alter table rename column 的 PostgreSQL 类型转换错误（由 @griffio 提交的 #4880）
- [PostgreSQL 方言] 修复 4474 PostgreSQL create extension（由 @griffio 提交的 #4541）
- [PostgreSQL 方言] 修复 5018 PostgreSQL 添加主键不可为 null 的类型问题（由 @griffio 提交的 #5020）
- [PostgreSQL 方言] 修复 4703 聚合表达式问题（由 @griffio 提交的 #5071）
- [PostgreSQL 方言] 修复 5028 PostgreSQL JSON 问题（由 @griffio 提交的 #5030）
- [PostgreSQL 方言] 修复 5040 PostgreSQL JSON 运算符（由 @griffio 提交的 #5041）
- [PostgreSQL 方言] 修复 5040 的 JSON 运算符绑定（由 @griffio 提交的 #5100）
- [PostgreSQL 方言] 修复 5082 tsvector（由 @griffio 提交的 #5104）
- [PostgreSQL 方言] 修复 5032 PostgreSQL UPDATE FROM 语句的列邻接问题（由 @griffio 提交的 #5035）
- [SQLite 方言] 修复 4897 SQLite alter table rename column（由 @griffio 提交的 #4899）
- [IDE 插件] 修复错误处理程序崩溃问题（由 @aperfilyev 提交的 #4988）
- [IDE 插件] 修复 BugSnag 在 IDEA 2023.3 中初始化失败的问题（由 @aperfilyev 提交）
- [IDE 插件] 修复通过插件在 IntelliJ 中打开 .sq 文件时的 PluginException（由 @aperfilyev 提交）
- [IDE 插件] 不再将 kotlin 库打包进 IntelliJ 插件，因为它已作为插件依赖项存在（#5126）
- [IDE 插件] 使用 extensions 数组代替 stream（#5127）

## [2.0.1] - 2023-12-01 {id="2-0-1-2023-12-01"}
[2.0.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.1

### 新增
- [编译器] 执行 SELECT 时添加对 multi-column-expr 的支持（由 @Adriel-M 提交的 #4453）
- [PostgreSQL 方言] 添加对 PostgreSQL CREATE INDEX CONCURRENTLY 的支持（由 @griffio 提交的 #4531）
- [PostgreSQL 方言] 允许 PostgreSQL CTE 辅助语句相互引用（由 @griffio 提交的 #4493）
- [PostgreSQL 方言] 添加对二元表达式和求和的 PostgreSQL 类型的支持（由 @Adriel-M 提交的 #4539）
- [PostgreSQL 方言] 添加对 PostgreSQL SELECT DISTINCT ON 语法的支持（由 @griffio 提交的 #4584）
- [PostgreSQL 方言] 在 SELECT 语句中添加对 PostgreSQL JSON 函数的支持（由 @MariusVolkhart 提交的 #4590）
- [PostgreSQL 方言] 添加 generate_series PostgreSQL 函数（由 @griffio 提交的 #4717）
- [PostgreSQL 方言] 添加其他 Postgres 字符串函数定义（由 @MariusVolkhart 提交的 #4752）
- [PostgreSQL 方言] 将 DATE PostgreSQL 类型添加到 min 和 max 聚合函数中（由 @anddani 提交的 #4816）
- [PostgreSQL 方言] 为 SqlBinaryExpr 添加 PostgreSQL 时间类型（由 @griffio 提交的 #4657）
- [PostgreSQL 方言] 为 Postgres 方言添加 TRUNCATE（由 @de-luca 提交的 #4817）
- [SQLite 3.35 方言] 允许按顺序评估多个 ON CONFLICT 子句（由 @griffio 提交的 #4551）
- [JDBC 驱动程序] 添加语言注解以获得更愉快的 SQL 编辑体验（由 @MariusVolkhart 提交的 #4602）
- [Native 驱动程序] Native 驱动：添加对 linuxArm64 的支持（由 @hfhbd 提交的 #4792）
- [Android 驱动程序] 为 AndroidSqliteDriver 添加 windowSizeBytes 形参（由 @BoD 提交的 #4804）
- [Paging3 扩展] 功能：为 OffsetQueryPagingSource 添加 initialOffset（由 @MohamadJaara 提交的 #4802）

### 变更
- [编译器] 在适当时优先使用 Kotlin 类型（由 @eygraber 提交的 #4517）
- [编译器] 执行值类型插入时始终包含列名（#4864）
- [PostgreSQL 方言] 移除 PostgreSQL 方言的实验性状态（由 @hfhbd 提交的 #4443）
- [PostgreSQL 方言] 更新 PostgreSQL 类型的文档（由 @MariusVolkhart 提交的 #4569）
- [R2DBC 驱动程序] 优化处理 PostgreSQL 中整数数据类型时的性能（由 @MariusVolkhart 提交的 #4588）

### 移除 {id="removed"}
- [SQLite JavaScript 驱动程序] 移除 sqljs-driver（由 @dellisd 提交的 #4613、#4670）

### 修复
- [编译器] 修复带返回值且无参数的分组语句的编译（由 @griffio 提交的 #4699）
- [编译器] 使用 SqlBinaryExpr 绑定实参（由 @griffio 提交的 #4604）
- [IDE 插件] 如果已设置，则使用 IDEA 项目 JDK（由 @griffio 提交的 #4689）
- [IDE 插件] 修复 IDEA 2023.2 及更高版本中的“Unknown element type: TYPE_NAME”错误（#4727）
- [IDE 插件] 修复与 2023.2 的一些兼容性问题
- [Gradle 插件] 修正 verifyMigrationTask Gradle 任务的文档（由 @joshfriend 提交的 #4713）
- [Gradle 插件] 添加 Gradle 任务输出消息，帮助用户在验证数据库之前生成数据库（由 @jingwei99 提交的 #4684）
- [PostgreSQL 方言] 修复多次重命名 PostgreSQL 列的问题（由 @griffio 提交的 #4566）
- [PostgreSQL 方言] 修复 4714 PostgreSQL alter column 为 null 性问题（由 @griffio 提交的 #4831）
- [PostgreSQL 方言] 修复 4837 alter table alter column（由 @griffio 提交的 #4846）
- [PostgreSQL 方言] 修复 4501 PostgreSQL 序列问题（由 @griffio 提交的 #4528）
- [SQLite 方言] 允许在列表达式上使用 JSON 二元运算符（由 @eygraber 提交的 #4776）
- [SQLite 方言] 修复 Update From 查找到同名多列时的误报问题（由 @eygraber 提交的 #4777）
- [Native 驱动程序] 支持命名的内存数据库（由 @05nelsonm 提交的 #4662）
- [Native 驱动程序] 确保查询监听器集合的线程安全性（由 @kpgalligan 提交的 #4567）
- [JDBC 驱动程序] 修复 ConnectionManager 中的连接泄漏（由 @MariusVolkhart 提交的 #4589）
- [JDBC 驱动程序] 修复在选择 ConnectionManager 类型时的 JdbcSqliteDriver URL 解析问题（由 @05nelsonm 提交的 #4656）

## [2.0.0] - 2023-07-26 {id="2-0-0-2023-07-26"}
[2.0.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0

### 新增
- [MySQL 方言] MySQL：在 IF 表达式中支持 timestamp/bigint（由 @shellderp 提交的 #4329）
- [MySQL 方言] MySQL：添加 now（由 @hfhbd 提交的 #4431）
- [Web 驱动程序] 支持发布 NPM 软件包（#4364）
- [IDE 插件] 允许用户在 Gradle 工具连接失败时显示堆栈跟踪（#4383）

### 变更
- [SQLite 驱动程序] 简化 JdbcSqliteDriver 的架构迁移使用方式（由 @morki 提交的 #3737）
- [R2DBC 驱动程序] 真正的异步 R2DBC 游标（由 @hfhbd 提交的 #4387）

### 修复
- [IDE 插件] 仅在需要时才实例化数据库项目服务（#4382）
- [IDE 插件] 处理查找用例过程中的进程取消（#4340）
- [IDE 插件] 修复异步代码的 IDE 生成（#4406）
- [IDE 插件] 将包结构的装配改为一次性计算并移出 EDT（#4417）
- [IDE 插件] 在 2023.2 上为 Kotlin 类型解析使用正确的存根索引键（#4416）
- [IDE 插件] 在执行搜索前等待索引就绪（#4419）
- [IDE 插件] 如果索引不可用则不执行转到操作（#4420）
- [编译器] 修复分组语句的结果表达式（#4378）
- [编译器] 不要将虚表用作接口类型（由 @hfhbd 提交的 #4427）

## [2.0.0-rc02] - 2023-06-27 {id="2-0-0-rc02-2023-06-27"}
[2.0.0-rc02]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-rc02

### 新增
- [MySQL 方言] 支持小写日期类型以及日期类型上的 min 和 max（由 @shellderp 提交的 #4243）
- [MySQL 方言] 为二元表达式和求和支持 MySQL 类型（由 @shellderp 提交的 #4254）
- [MySQL 方言] 支持无显示宽度的无符号整数（由 @shellderp 提交的 #4306）
- [MySQL 方言] 支持 LOCK IN SHARED MODE
- [PostgreSQL 方言] 为 min max 添加布尔值和 Timestamp（由 @griffio 提交的 #4245）
- [PostgreSQL 方言] Postgres：添加窗口函数支持（由 @hfhbd 提交的 #4283）
- [运行时] 为运行时添加 linuxArm64、androidNative 和 watchosDeviceArm 目标（由 @hfhbd 提交的 #4258）
- [Paging 扩展] 为 paging 扩展添加 linux 和 mingw x64 目标（由 @chippman 提交的 #4280）

### 变更
- [Gradle 插件] 为 Android API 34 添加自动方言支持（#4251）
- [Paging 扩展] 在 QueryPagingSource 中添加对 SuspendingTransacter 的支持（由 @daio 提交的 #4292）
- [运行时] 改进 addListener API（由 @hfhbd 提交的 #4244）
- [运行时] 使用 Long 作为迁移版本类型（由 @hfhbd 提交的 #4297）

### 修复
- [Gradle 插件] 为生成的源使用稳定的输出路径（由 @joshfriend 提交的 #4269）
- [Gradle 插件] Gradle 微调（由 @3flex 提交的 #4222）

## [2.0.0-rc01] - 2023-05-29 {id="2-0-0-rc01-2023-05-29"}
[2.0.0-rc01]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-rc01

### 新增
- [Paging] 为 paging 扩展添加 JS 浏览器目标（由 @sproctor 提交的 #3843）
- [Paging] 为 androidx-paging3 扩展添加 iosSimulatorArm64 目标（#4117）
- [PostgreSQL 方言] 添加对 gen_random_uuid() 的支持和测试（由 @davidwheeler123 提交的 #3855）
- [PostgreSQL 方言] PostgreSQL Alter table add constraint（由 @griffio 提交的 #4116）
- [PostgreSQL 方言] Alter table add constraint check（由 @griffio 提交的 #4120）
- [PostgreSQL 方言] 添加 PostgreSQL 字符长度函数（由 @griffio 提交的 #4121）
- [PostgreSQL 方言] 添加 PostgreSQL 列默认 interval（由 @griffio 提交的 #4142）
- [PostgreSQL 方言] 添加 PostgreSQL interval 列结果（由 @griffio 提交的 #4152）
- [PostgreSQL 方言] 添加 PostgreSQL Alter Column（由 @griffio 提交的 #4165）
- [PostgreSQL 方言] PostgreSQL：添加 date_part（由 @hfhbd 提交的 #4198）
- [MySQL 方言] 添加 SQL 字符长度函数（由 @griffio 提交的 #4134）
- [IDE 插件] 添加 sqldelight 目录建议（由 @aperfilyev 提交的 #3976）
- [IDE 插件] 在项目树中压缩中间包（由 @aperfilyev 提交的 #3992）
- [IDE 插件] 添加 join 子句补全（由 @aperfilyev 提交的 #4086）
- [IDE 插件] 创建视图意图和实时模板（由 @aperfilyev 提交的 #4074）
- [IDE 插件] 对 DELETE 或 UPDATE 中缺失 WHERE 发出警告（由 @aperfilyev 提交的 #4058）
- [Gradle 插件] 启用类型安全的项目访问器（by @hfhbd 提交的 #4005）

### 变更
- [Gradle 插件] 允许使用 ServiceLoader 机制为 VerifyMigrationTask 注册 DriverInitializer（由 @C2H6O 提交的 #3986）
- [Gradle 插件] 创建显式编译器环境（由 @hfhbd 提交的 #4079）
- [JS 驱动程序] 将 Web Worker 驱动拆分为单独的构件
- [JS 驱动程序] 不公开 JsWorkerSqlCursor（由 @hfhbd 提交的 #3874）
- [JS 驱动程序] 禁用 sqljs 驱动的发布（#4108）
- [运行时] 强制同步驱动需要同步架构初始化器（#4013）
- [运行时] 改进游标的异步支持（#4102）
- [运行时] 移除已弃用的目标平台（由 @hfhbd 提交的 #4149）
- [运行时] 移除对旧内存模型的支持（由 @hfhbd 提交的 #4148）

### 修复
- [R2DBC 驱动程序] R2DBC：等待驱动关闭（由 @hfhbd 提交的 #4139）
- [编译器] 在 database create(SqlDriver) 中包含迁移中的 PRAGMA（由 @MariusVolkhart 提交的 #3845）
- [编译器] 修复 RETURNING 子句的代码生成（由 @MariusVolkhart 提交的 #3872）
- [编译器] 不要为虚表生成类型（#4015）
- [Gradle 插件] 若干 Gradle 插件使用体验优化（由 @zacsweers 提交的 #3930）
- [IDE 插件] 修复未解析的 Kotlin 类型（由 @aperfilyev 提交的 #3924）
- [IDE 插件] 修复展开通配符意图以支持限定符（由 @aperfilyev 提交的 #3979）
- [IDE 插件] 如果缺少 java home，则使用可用的 JDK（由 @aperfilyev 提交的 #3925）
- [IDE 插件] 修复包名上的查找用例（#4010）
- [IDE 插件] 不对无效元素显示自动导入（#4008）
- [IDE 插件] 如果缺少方言则不进行解析（#4009）
- [IDE 插件] 在失效状态下忽略编译器在 IDE 中的运行（#4016）
- [IDE 插件] 添加对 IntelliJ 2023.1 的支持（由 @madisp 提交的 #4037）
- [IDE 插件] 重命名列时同步重命名命名的实参用例（由 @aperfilyev 提交的 #4027）
- [IDE 插件] 修复添加迁移弹出窗口（由 @aperfilyev 提交的 #4105）
- [IDE 插件] 在迁移文件中禁用 SchemaNeedsMigrationInspection（由 @aperfilyev 提交的 #4106）
- [IDE 插件] 在生成迁移时使用 SQL 列名而非类型名（由 @aperfilyev 提交的 #4112）

## [2.0.0-alpha05] - 2023-01-20 {id="2-0-0-alpha05-2023-01-20"}
[2.0.0-alpha05]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha05

### 新增
- [Paging] 多平台 paging 扩展（由 @jeffdgr8 提交）
- [运行时] 为 Listener 接口添加 fun 修饰符。
- [SQLite 方言] 添加 SQLite 3.33 支持 (UPDATE FROM)（由 @eygraber 提交）
- [PostgreSQL 方言] 在 PostgreSQL 中支持 UPDATE FROM（由 @eygraber 提交）

### 变更
- [RDBC 驱动程序] 公开连接（由 @hfhbd 提交）
- [运行时] 将迁移回调移入主 `migrate` 函数
- [Gradle 插件] 对下游项目隐藏 Configurations
- [Gradle 插件] 仅内嵌（shade）Intellij（由 @hfhbd 提交）
- [Gradle 插件] 支持 Kotlin 1.8.0-Beta 并添加多版本 Kotlin 测试（由 @hfhbd 提交）

### 修复
- [RDBC 驱动程序] 改用 javaObjectType（由 @hfhbd 提交）
- [RDBC 驱动程序] 修复 bindStatement 中的基本类型 null 值（由 @hfhbd 提交）
- [RDBC 驱动程序] 支持 R2DBC 1.0（由 @hfhbd 提交）
- [PostgreSQL 方言] Postgres：修复不带类型参数的 Array（由 @hfhbd 提交）
- [IDE 插件] 将 IntelliJ 升级至 221.6008.13（由 @hfhbd 提交）
- [编译器] 从纯视图解析递归来源表（由 @hfhbd 提交）
- [编译器] 使用来自表外键子句的值类（value classes）（由 @hfhbd 提交）
- [编译器] 修复 SelectQueryGenerator 以支持不带圆括号的绑定表达式（由 @bellatoris 提交）
- [编译器] 修复使用事务时重复生成 ${name}Indexes 变量的问题（由 @sachera 提交）

## [1.5.5] - 2023-01-20 {id="1-5-5-2023-01-20"}
[1.5.5]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.5

这是针对 Kotlin 1.8 和 IntelliJ 2021+ 的兼容性版本，支持 JDK 17。

## [1.5.4] - 2022-10-06 {id="1-5-4-2022-10-06"}
[1.5.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.4

这是针对 Kotlin 1.7.20 和 AGP 7.3.0 的兼容性更新。

## [2.0.0-alpha04] - 2022-10-03 {id="2-0-0-alpha04-2022-10-03"}
[2.0.0-alpha04]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha04

### 破坏性变更 {id="breaking-changes"}

- Paging 3 扩展 API 已更改为仅允许将 int 类型用于计数。
- 协程扩展现在需要传入调度器（dispatcher），不再提供默认值。
- Dialect 和 Driver 类现已标记为 final，请改用委托。

### 新增
- [HSQL 方言] Hsql：支持在 Insert 中对生成列使用 DEFAULT（由 @hfhbd 提交的 #3372）
- [PostgreSQL 方言] PostgreSQL：支持在 INSERT 中对生成列使用 DEFAULT（由 @hfhbd 提交的 #3373）
- [PostgreSQL 方言] 为 PostgreSQL 添加 NOW()（由 @hfhbd 提交的 #3403）
- [PostgreSQL 方言] PostgreSQL 添加 NOT 运算符（由 @hfhbd 提交的 #3504）
- [Paging] 允许将 CoroutineContext 传入 *QueryPagingSource（#3384）
- [Gradle 插件] 为方言添加更好的版本目录支持（#3435）
- [Native 驱动程序] 添加回调以挂入 NativeSqliteDriver 的 DatabaseConfiguration 创建流程（由 @svenjacobs 提交的 #3512）

### 变更
- [Paging] 为基于 KeyedQueryPagingSource 的 QueryPagingSource 函数添加默认调度器（#3385）
- [Paging] 使 OffsetQueryPagingSource 仅适用于 Int（#3386）
- [异步运行时] 将 await* 移动到上层类 ExecutableQuery（由 @hfhbd 提交的 #3524）
- [协程扩展] 移除 Flow 扩展的默认形参（#3489）

### 修复
- [Gradle 插件] 更新至 Kotlin 1.7.20（由 @zacsweers 提交的 #3542）
- [R2DBC 驱动程序] 适配并不总是发送值的 R2DBC 变更（由 @hfhbd 提交的 #3525）
- [HSQL 方言] 修复使用 Hsql 时失败的 SQLite VerifyMigrationTask（由 @hfhbd 提交的 #3380）
- [Gradle 插件] 将任务转换为使用延迟配置 API（由 @3flex 提交）
- [Gradle 插件] 避免 Kotlin 1.7.20 中的 NPE（由 @ZacSweers 提交的 #3398）
- [Gradle 插件] 修复压缩迁移任务的描述（#3449）
- [IDE 插件] 修复较新 Kotlin 插件中的 NoSuchFieldError（由 @madisp 提交的 #3422）
- [IDE 插件] IDEA：UnusedQueryInspection - 修复 ArrayIndexOutOfBoundsException（由 @vanniktech 提交的 #3427）
- [IDE 插件] 对旧的 Kotlin 插件引用使用反射
- [编译器] 带有扩展函数的自定义方言不创建导入（由 @hfhbd 提交的 #3338）
- [编译器] 修复转义 CodeBlock.of("${CodeBlock.toString()}")（由 @hfhbd 提交的 #3340）
- [编译器] 在迁移中等待异步执行语句（#3352）
- [编译器] 修复 AS（由 @hfhbd 提交的 #3370）
- [编译器] `getObject` 方法支持自动填充实际类型（由 @robxyy 提交的 #3401）
- [编译器] 修复异步分组 returning 语句的代码生成（#3411）
- [编译器] 尽可能推断绑定形参的 Kotlin 类型，否则提供更清晰的错误消息失败（由 @hfhbd 提交的 #3413）
- [编译器] 禁止 ABS("foo")（由 @hfhbd 提交的 #3430）
- [编译器] 支持从其他形参推断 Kotlin 类型（由 @hfhbd 提交的 #3431）
- [编译器] 始终创建数据库实现（由 @hfhbd 提交的 #3540）
- [编译器] 放宽 JavaDoc 限制并将其也添加到自定义映射函数中（由 @hfhbd 提交的 #3554）
- [编译器] 修复绑定中的 DEFAULT（由 @hfhbd 提交）
- [Paging] 修复 Paging 3（#3396）
- [Paging] 允许使用 Long 构建 OffsetQueryPagingSource（#3409）
- [Paging] 不要静态替换 Dispatchers.Main（#3428）

## [2.0.0-alpha03] - 2022-06-17 {id="2-0-0-alpha03-2022-06-17"}
[2.0.0-alpha03]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha03

### 破坏性变更

- 方言现在像普通的 Gradle 依赖一样进行引用。
```groovy
sqldelight {
  MyDatabase {
    dialect("app.cash.sqldelight:postgres-dialect:2.0.0-alpha03")
  }
}
```
- 移除了 `AfterVersionWithDriver` 类型，取而代之的是 `AfterVersion`，后者现在始终包含驱动程序。
- `Schema` 类型不再是 `SqlDriver` 的子类型。
- `PreparedStatement` API 现在使用从零开始的索引进行调用。

### 新增
- [IDE 插件] 添加了针对运行中数据库执行 SQLite、MySQL 和 PostgreSQL 命令的支持（由 @aperfilyev 提交的 #2718）
- [IDE 插件] 添加对 Android Studio 数据库检查器（DB inspector）的支持（由 @aperfilyev 提交的 #3107）
- [运行时] 添加对异步驱动程序的支持（由 @dellisd 提交的 #3168）
- [Native 驱动程序] 支持新的 Kotlin/Native 内存模型（由 @kpgalligan 提交的 #3177）
- [JS 驱动程序] 为 SqlJs worker 添加驱动程序（由 @dellisd 提交的 #3203）
- [Gradle 插件] 公开 SQLDelight 任务的类路径
- [Gradle 插件] 添加用于压缩迁移的 Gradle 任务
- [Gradle 插件] 添加在迁移检查期间忽略架构定义的标志
- [MySQL 方言] 在 MySQL 中支持 FOR SHARE 和 FOR UPDATE（#3098）
- [MySQL 方言] 支持 MySQL 索引提示（#3099）
- [PostgreSQL 方言] 添加 date_trunc（由 @hfhbd 提交的 #3295）
- [JSON 扩展] 支持 JSON 表函数（#3090）

### 变更
- [运行时] 移除不带驱动的 AfterVersion 类型（#3091）
- [运行时] 将 Schema 类型移动到顶层
- [运行时] 开放方言和解析器以支持第三方实现（由 @hfhbd 提交的 #3232）
- [编译器] 在失败报告中包含用于编译的方言（#3086）
- [编译器] 跳过未使用的适配器（由 @eygraber 提交的 #3162）
- [编译器] 在 PrepareStatement 中使用从零开始的索引（由 @hfhbd 提交的 #3269）
- [Gradle 插件] 同时将方言设为正规的 Gradle 依赖项而非字符串（#3085）
- [Gradle 插件] Gradle 验证任务：当缺少数据库文件时抛出异常（由 @vanniktech 提交的 #3126）

### 修复
- [Gradle 插件] Gradle 插件的小幅清理与微调（由 @3flex 提交的 #3171）
- [Gradle 插件] 不要对生成的目录使用 AGP 字符串
- [Gradle 插件] 使用 AGP namespace 特性（#3220）
- [Gradle 插件] 不要将 kotlin-stdlib 作为 Gradle 插件的运行时依赖项添加（由 @mbonnin 提交的 #3245）
- [Gradle 插件] 简化多平台配置（由 @mbonnin 提交的 #3246）
- [Gradle 插件] 支持仅包含 JS 的项目（由 @hfhbd 提交的 #3310）
- [IDE 插件] 为 Gradle 工具 API 使用 java home（#3078）
- [IDE 插件] 在 IDE 插件内部的正确 classLoader 上加载 JDBC 驱动（#3080）
- [IDE 插件] 在失效前将文件元素标记为 null，以避免现有 PSI 更改期间发生错误（#3082）
- [IDE 插件] 在 ALTER TABLE 语句中查找新表名的用例时不再崩溃（#3106）
- [IDE 插件] 优化检查并使其针对预期的异常类型静默失败（#3121）
- [IDE 插件] 删除本应为生成目录的文件（#3198）
- [IDE 插件] 修复非安全运算符调用
- [编译器] 确保带有 RETURNING 语句的 update 和 delete 执行查询（#3084）
- [编译器] 正确推断复合 select 中的实参类型（#3096）
- [编译器] 通用表不生成数据类，因此不返回它们（#3097）
- [编译器] 更快地查找顶层迁移文件（#3108）
- [编译器] 在管道运算符上正确继承为 null 性
- [编译器] 支持 iif ANSI SQL 函数
- [编译器] 不要生成空的查询文件（由 @hfhbd 提交的 #3300）
- [编译器] 修复仅带问号的适配器问题（由 @hfhbd 提交的 #3314）
- [PostgreSQL 方言] Postgres 主键列始终非 null（#3092）
- [PostgreSQL 方言] 修复多个表中同名的 copy 问题（由 @hfhbd 提交的 #3297）
- [SQLite 3.35 方言] 仅在从修改的表中删除带索引的列时显示错误（由 @eygraber 提交的 #3158）

## [2.0.0-alpha02] - 2022-04-13 {id="2-0-0-alpha02-2022-04-13"}
[2.0.0-alpha02]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha02

### 破坏性变更

- 您需要将所有出现的 `app.cash.sqldelight.runtime.rx` 替换为 `app.cash.sqldelight.rx2`

### 新增
- [编译器] 支持在分组语句末尾返回
- [编译器] 通过方言模块支持编译器扩展，并添加 SQLite JSON 扩展（#1379、#2087）
- [编译器] 支持返回值的 PRAGMA 语句（#1106）
- [编译器] 支持为标记的列生成值类型
- [编译器] 添加对乐观锁和验证的支持（#1952）
- [编译器] 支持 multi-update 语句
- [PostgreSQL] 支持 Postgres returning 语句
- [PostgreSQL] 支持 Postgres 日期类型
- [PostgreSQL] 支持 PG intervals
- [PostgreSQL] 支持 PG 布尔值并修复 alter 表上的 insert
- [PostgreSQL] 支持 Postgres 中的可选限制（limit）
- [PostgreSQL] 支持 PG BYTEA 类型
- [PostgreSQL] 为 Postgres serial 添加测试
- [PostgreSQL] 支持 for update Postgres 语法
- [PostgreSQL] 支持 PostgreSQL 数组类型
- [PostgreSQL] 在 PG 中正确存储/检索 UUID 类型
- [PostgreSQL] 支持 PostgreSQL NUMERIC 类型（#1882）
- [PostgreSQL] 支持通用表表达式内部返回查询（#2471）
- [PostgreSQL] 支持 JSON 专用运算符
- [PostgreSQL] 添加 Postgres Copy（由 @hfhbd 提交）
- [MySQL] 支持 MySQL Replace
- [MySQL] 支持 NUMERIC/BigDecimal MySQL 类型（#2051）
- [MySQL] 支持 MySQL truncate 语句
- [MySQL] 支持 MySQL 中的 JSON 专用运算符（由 @eygraber 提交）
- [MySQL] 支持 MySQL INTERVAL（由 @eygraber 提交的 #2969）
- [HSQL] 添加 HSQL 窗口函数功能
- [SQLite] 不要替换 WHERE 中可为 null 形参的相等性检查（由 @eygraber 提交的 #1490）
- [SQLite] 支持 SQLite 3.35 returning 语句（由 @eygraber 提交的 #1490）
- [SQLite] 支持 GENERATED 子句
- [SQLite] 添加对 SQLite 3.38 方言的支持（由 @eygraber 提交）

### 变更
- [编译器] 略微清理生成的代码
- [编译器] 禁止在分组语句中使用表形参（#1822）
- [编译器] 将分组查询放入事务中（#2785）
- [运行时] 从驱动的 execute 方法返回更新的行数
- [运行时] 将 SqlCursor 限制在访问连接的临界区内（由 @andersio 提交的 #2123）
- [Gradle 插件] 比较迁移的架构定义（#841）
- [PostgreSQL] 对 PG 禁用双引号
- [MySQL] 在 MySQL 中使用 == 时报错（#2673）

### 修复
- [编译器] 来自不同表的相同适配器类型在 2.0 alpha 中导致编译错误的问题
- [编译器] 编译 upsert 语句时的问题（#2791）
- [编译器] 如果存在多个匹配项，查询结果应使用 select 中的表（#1874、#2313）
- [编译器] 支持更新具有 INSTEAD OF 触发器的视图（#1018）
- [编译器] 支持函数名中使用 from 和 for
- [编译器] 允许在函数表达式中使用 SEPARATOR 关键字
- [编译器] 无法在 ORDER BY 中访问带别名表的 ROWID
- [编译器] MySQL 的 HAVING 子句中无法识别带别名的列名
- [编译器] 错误的“Multiple columns found”错误
- [编译器] 无法设置 PRAGMA locking_mode = EXCLUSIVE;
- [PostgreSQL] PostgreSQL 重命名列
- [MySQL] 无法识别 UNIX_TIMESTAMP、TO_SECONDS、JSON_ARRAYAGG MySQL 函数
- [SQLite] 修复 SQLite 窗口函数功能
- [IDE 插件] 在空进度指示器中运行转到处理程序（#2990）
- [IDE 插件] 确保在项目未配置时高亮 visitor 不运行（#2981、#2976）
- [IDE 插件] 确保传递生成的代码在 IDE 中也能更新（#1837）
- [IDE 插件] 更新方言时使索引失效

## [2.0.0-alpha01] - 2022-03-31 {id="2-0-0-alpha01-2022-03-31"}
[2.0.0-alpha01]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha01

这是 2.0 的首个 Alpha 版本，包含一些破坏性变更。我们预计后续还会有更多 ABI 破坏性变更，因此请勿发布依赖此版本的库（应用程序使用应该没问题）。

### 破坏性变更

- 首先，您需要将所有出现的 `com.squareup.sqldelight` 替换为 `app.cash.sqldelight`
- 其次，您需要将所有出现的 `app.cash.sqldelight.android` 替换为 `app.cash.sqldelight.driver.android`
- 第三，您需要将所有出现的 `app.cash.sqldelight.sqlite.driver` 替换为 `app.cash.sqldelight.driver.jdbc.sqlite`
- 第四，您需要将所有出现的 `app.cash.sqldelight.drivers.native` 替换为 `app.cash.sqldelight.driver.native`
- IDE 插件必须更新到 2.X 版本，可在 [alpha 或 eap 渠道](https://plugins.jetbrains.com/plugin/8191-sqldelight/versions/alpha) 中找到
- 方言现在可以在 Gradle 中指定依赖项：

```gradle
sqldelight {
  MyDatabase {
    packageName = "com.example"
    dialect = "app.cash.sqldelight:mysql-dialect:2.0.0-alpha01"
  }
}
```

当前支持的方言包括 `mysql-dialect`、`postgresql-dialect`、`hsql-dialect`、`sqlite-3-18-dialect`、`sqlite-3-24-dialect`、`sqlite-3-25-dialect`、`sqlite-3-30-dialect` 和 `sqlite-3-35-dialect`

- 基本类型现在必须导入（例如 `INTEGER AS Boolean` 必须 `import kotlin.Boolean`），一些以前支持的类型现在需要适配器。大多数转换的基本适配器可在 `app.cash.sqldelight:primitive-adapters:2.0.0-alpha01` 中获取（如用于处理 `Integer AS kotlin.Int` 的 `IntColumnAdapter`）。

### 新增
- [IDE 插件] 基础建议迁移（由 @aperfilyev 提交）
- [IDE 插件] 添加导入提示操作（由 @aperfilyev 提交）
- [IDE 插件] 添加 Kotlin 类补全（由 @aperfilyev 提交）
- [Gradle 插件] 为 Gradle 类型安全项目访问器添加快捷方式（由 @hfhbd 提交）
- [编译器] 基于方言自定义代码生成（由 @MariusVolkhart 提交）
- [JDBC 驱动程序] 向 JdbcDriver 添加通用类型（由 @MariusVolkhart 提交）
- [SQLite] 添加对 SQLite 3.35 的支持（由 @eygraber 提交）
- [SQLite] 添加对 ALTER TABLE DROP COLUMN 的支持（由 @eygraber 提交）
- [SQLite] 添加对 SQLite 3.30 方言的支持（由 @eygraber 提交）
- [SQLite] 在 SQLite 中支持 NULLS FIRST/LAST（由 @eygraber 提交）
- [HSQL] 为生成子句添加 HSQL 支持（由 @MariusVolkhart 提交）
- [HSQL] 添加对 HSQL 中命名参数的支持（由 @MariusVolkhart 提交）
- [HSQL] 自定义 HSQL 插入查询（由 @MariusVolkhart 提交）

### 变更
- [整体] 包名已从 com.squareup.sqldelight 更改为 app.cash.sqldelight。
- [运行时] 将方言移入它们各自独立的 Gradle 模块
- [运行时] 切换至驱动程序实现的查询通知。
- [运行时] 将默认列适配器提取到单独的模块（#2056、#2060）
- [编译器] 让模块生成查询实现，而不是在每个模块中重复生成
- [编译器] 移除生成的数据类中自定义 toString 的生成。（由 @PaulWoitaschek 提交）
- [JS 驱动程序] 从 sqljs-driver 中移除 sql.js 依赖（由 @dellisd 提交）
- [Paging] 移除 Android Paging 2 扩展
- [IDE 插件] 在 SQLDelight 同步时添加编辑器横幅（#2511）
- [IDE 插件] 支持的最低 IntelliJ 版本为 2021.1

### 修复
- [运行时] 扁平化监听器列表以减少内存分配和指针追踪。（由 @andersio 提交）
- [IDE 插件] 修复错误消息以允许跳转到错误（由 @hfhbd 提交）
- [IDE 插件] 添加缺失的检查描述（由 @aperfilyev 提交的 #2768）
- [IDE 插件] 修复 GotoDeclarationHandler 中的异常（由 @aperfilyev 提交的 #2531、#2688、#2804）
- [IDE 插件] 高亮 import 关键字（由 @aperfilyev 提交）
- [IDE 插件] 修复未解析的 Kotlin 类型（由 @aperfilyev 提交的 #1678）
- [IDE 插件] 修复未解析包的高亮显示（由 @aperfilyev 提交的 #2543）
- [IDE 插件] 如果项目索引尚未初始化，则不尝试检查不匹配的列
- [IDE 插件] 在 Gradle 同步发生前不初始化文件索引
- [IDE 插件] 如果开始 Gradle 同步，则取消 SQLDelight 导入
- [IDE 插件] 在执行撤消操作的线程之外重新生成数据库
- [IDE 插件] 如果无法解析引用，则使用空白 Java 类型
- [IDE 插件] 在文件解析期间正确移出主线程，仅在写入时切回
- [IDE 插件] 改进与较旧 IntelliJ 版本的兼容性（由 @3flex 提交）
- [IDE 插件] 使用更快的注解 API
- [Gradle 插件] 在添加运行时显式支持 JS/Android 插件（由 @ZacSweers 提交）
- [Gradle 插件] 注册迁移输出任务而无需从迁移推导架构（由 @kevincianfarini 提交的 #2744）
- [Gradle 插件] 如果迁移任务崩溃，打印其运行时崩溃的文件
- [Gradle 插件] 在生成代码时对文件进行排序以确保幂等输出（由 @ZacSweers 提交）
- [编译器] 使用更快的 API 遍历文件，不再浏览整个 PSI 图
- [编译器] 为 select 函数形参添加关键字修饰（mangling）（由 @aperfilyev 提交的 #2759）
- [编译器] 修复迁移适配器的 packageName（由 @hfhbd 提交）
- [编译器] 在属性而非类型上输出注解（由 @aperfilyev 提交的 #2798）
- [编译器] 在传递给 Query 子类型之前对实参进行排序（由 @aperfilyev 提交的 #2379）

## [1.5.3] - 2021-11-23 {id="1-5-3-2021-11-23"}
[1.5.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.3

### 新增
- [JDBC 驱动程序] 开放 JdbcDriver 以支持第三方驱动实现（由 @hfhbd 提交的 #2672）
- [MySQL 方言] 为时间增量添加缺失的函数（由 @sdoward 提交的 #2671）
- [协程扩展] 为 coroutines-extensions 添加 M1 目标（由 @PhilipDukhov 提交）

### 变更
- [Paging3 扩展] 将 sqldelight-android-paging3 作为 JAR 分发而非 AAR（由 @julioromano 提交的 #2634）
- 属性名称如果同时是软关键字，现在将加上下划线后缀。例如 `value` 将暴露为 `value_`

### 修复
- [编译器] 不要为重复的数组形参提取变量（由 @aperfilyev 提交）
- [Gradle 插件] 添加 kotlin.mpp.enableCompatibilityMetadataVariant。（由 @martinbonnin 提交的 #2628）
- [IDE 插件] 查找用例处理需要读操作（Read Action）

## [1.5.2] - 2021-10-12 {id="1-5-2-2021-10-12"}
[1.5.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.2

### 新增
- [Gradle 插件] HMPP 支持（由 @martinbonnin 提交的 #2548）
- [IDE 插件] 添加 NULL 比较检查（由 @aperfilyev 提交）
- [IDE 插件] 添加检查抑制器（由 @aperfilyev 提交的 #2519）
- [IDE 插件] 命名与位置参数混合检查（由 @aperfilyev 提交）
- [SQLite 驱动程序] 添加 mingwX86 目标。（由 @enginegl 提交的 #2558）
- [SQLite 驱动程序] 添加 M1 目标
- [SQLite 驱动程序] 添加 linuxX64 支持（由 @chippmann 提交的 #2456）
- [MySQL 方言] 为 MySQL 添加 ROW_COUNT 函数（#2523）
- [PostgreSQL 方言] Postgres 重命名、删除列（由 @pabl0rg 提交）
- [PostgreSQL 方言] PostgreSQL 语法支持识别 CITEXT
- [PostgreSQL 方言] 包含 TIMESTAMP WITH TIME ZONE 和 TIMESTAMPTZ
- [PostgreSQL 方言] 为 PostgreSQL GENERATED 列添加语法
- [运行时] 为 AfterVersion 提供 SqlDriver 作为参数（由 @ahmedre 提交的 #2534、2614）

### 变更
- [Gradle 插件] 显式要求 Gradle 7.0（由 @martinbonnin 提交的 #2572）
- [Gradle 插件] 使 VerifyMigrationTask 支持 Gradle 的最新检查（up-to-date checks）（由 @3flex 提交的 #2533）
- [IDE 插件] 当连接可为 null 类型与不可为 null 类型时，不再发出“Join compares two columns of different types”警告（由 @pchmielowski 提交的 #2550）
- [IDE 插件] 阐明列类型中小写 'as' 的错误提示（由 @aperfilyev 提交）

### 修复
- [IDE 插件] 如果项目已被释放，则不要在下方言下重新解析（#2609）
- [IDE 插件] 如果关联的虚拟文件为 null，则模块为 null（#2607）
- [IDE 插件] 避免在未使用的查询检查期间发生崩溃（#2610）
- [IDE 插件] 在写操作（Write Action）内运行数据库同步写入（#2605）
- [IDE 插件] 让 IDE 调度 SQLDelight 同步
- [IDE 插件] 修复 JavaTypeMixin 中的 NPE（由 @aperfilyev 提交的 #2603）
- [IDE 插件] 修复 MismatchJoinColumnInspection 中的 IndexOutOfBoundsException（由 @aperfilyev 提交的 #2602）
- [IDE 插件] 为 UnusedColumnInspection 添加描述（由 @aperfilyev 提交的 #2600）
- [IDE 插件] 将 PsiElement.generatedVirtualFiles 封装进读操作（Read Action）中（由 @aperfilyev 提交的 #2599）
- [IDE 插件] 移除不必要的非空转换（#2596）
- [IDE 插件] 正确处理查找用例时的 null 值（#2595）
- [IDE 插件] 修复 Android 生成文件的 IDE 自动补全（由 @martinbonnin 提交的 #2573）
- [IDE 插件] 修复 SqlDelightGotoDeclarationHandler 中的 NPE（由 @aperfilyev 提交）
- [IDE 插件] 在 insert 语句中的实参内部混淆 Kotlin 关键字（由 @aperfilyev 提交的 #2433）
- [IDE 插件] 修复 SqlDelightFoldingBuilder 中的 NPE（由 @aperfilyev 提交的 #2382）
- [IDE 插件] 在 CopyPasteProcessor 中捕获 ClassCastException（由 @aperfilyev 提交的 #2369）
- [IDE 插件] 修复更新实时模板（由 @IliasRedissi 提交）
- [IDE 插件] 为意图操作添加描述（由 @aperfilyev 提交的 #2489）
- [IDE 插件] 修复未找到表时 CreateTriggerMixin 中的异常（由 @aperfilyev 提交）
- [编译器] 拓扑排序建表语句
- [编译器] 停止对目录调用 `forDatabaseFiles` 回调（#2532）
- [Gradle 插件] 将 generateDatabaseInterface 任务依赖传播给潜在的使用者（由 @martinbonnin 提交的 #2518）

## [1.5.1] - 2021-07-16 {id="1-5-1-2021-07-16"}
[1.5.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.1

### 新增
- [PostgreSQL 方言] PostgreSQL JSONB 和 ON Conflict Do Nothing（由 @satook 提交）
- [PostgreSQL 方言] 添加对 PostgreSQL ON CONFLICT (column, ...) DO UPDATE 的支持（由 @satook 提交）
- [MySQL 方言] 支持 MySQL 生成列（由 @JGulbronson 提交）
- [Native 驱动程序] 添加 watchosX64 支持
- [IDE 插件] 添加形参类型和注解（由 @aperfilyev 提交）
- [IDE 插件] 添加生成“select all”查询的操作（由 @aperfilyev 提交）
- [IDE 插件] 在自动补全中显示列类型（由 @aperfilyev 提交）
- [IDE 插件] 在自动补全中添加图标（由 @aperfilyev 提交）
- [IDE 插件] 添加生成“select by primary key”查询的操作（由 @aperfilyev 提交）
- [IDE 插件] 添加生成“insert into”查询的操作（由 @aperfilyev 提交）
- [IDE 插件] 为列名、语句标识符、函数名添加高亮显示（由 @aperfilyev 提交）
- [IDE 插件] 添加其余查询生成操作（由 @aperfilyev 提交的 #489）
- [IDE 插件] 从 insert-stmt 显示形参提示（由 @aperfilyev 提交）
- [IDE 插件] 表别名意图操作（由 @aperfilyev 提交）
- [IDE 插件] 限定列名意图（由 @aperfilyev 提交）
- [IDE 插件] 转到 Kotlin 属性的声明（由 @aperfilyev 提交）

### 变更
- [Native 驱动程序] 通过尽可能避免冻结和可共享数据结构来提升原生事务性能（由 @andersio 提交）
- [Paging 3] 将 Paging3 版本升级至 3.0.0 稳定版
- [JS 驱动程序] 将 sql.js 升级至 1.5.0

### 修复
- [JDBC SQLite 驱动程序] 在清除 ThreadLocal 之前先对连接调用 close()（由 @hannesstruss 提交的 #2444）
- [RX 扩展] 修复订阅/处理竞态泄漏（由 @pyricau 提交的 #2403）
- [协程扩展] 确保在通知之前注册查询监听器
- [编译器] 对 notifyQueries 进行排序以获得一致的 Kotlin 输出文件（由 @thomascjy 提交）
- [编译器] 不要使用 @JvmField 注解 select 查询类属性（由 @eygraber 提交）
- [IDE 插件] 修复导入优化器（由 @aperfilyev 提交的 #2350）
- [IDE 插件] 修复未使用的列检查（由 @aperfilyev 提交）
- [IDE 插件] 为导入检查和类注解器添加嵌套类支持（由 @aperfilyev 提交）
- [IDE 插件] 修复 CopyPasteProcessor 中的 NPE（由 @aperfilyev 提交的 #2363）
- [IDE 插件] 修复 InlayParameterHintsProvider 中的崩溃（由 @aperfilyev 提交的 #2359）
- [IDE 插件] 修复将任何文本复制粘贴到建表语句中时插入空行的问题（由 @aperfilyev 提交的 #2431）

## [1.5.0] - 2021-04-23 {id="1-5-0-2021-04-23"}
[1.5.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.0

### 新增
- [SQLite JavaScript 驱动程序] 启用 sqljs-driver 发布（由 @dellisd 提交的 #1667）
- [Paging3 扩展] Android Paging 3 库的扩展（由 @kevincianfarini 提交的 #1786）
- [MySQL 方言] 添加对 MySQL 的 ON DUPLICATE KEY UPDATE 冲突解决的支持（由 @rharter 提交）
- [SQLite 方言] 为 SQLite offsets() 添加编译器支持（由 @qjroberts 提交）
- [IDE 插件] 为未知类型添加导入快速修复（由 @aperfilyev 提交的 #683）
- [IDE 插件] 添加未使用的导入检查（由 @aperfilyev 提交的 #1161）
- [IDE 插件] 添加未使用的查询检查（由 @aperfilyev 提交）
- [IDE 插件] 添加未使用的列检查（由 @aperfilyev 提交的 #569）
- [IDE 插件] 复制/粘贴时自动引入导入（由 @aperfilyev 提交的 #684）
- [IDE 插件] 当 Gradle/IntelliJ 插件版本不兼容时弹出气泡提示
- [IDE 插件] Insert Into ... VALUES(?) 形参提示（由 @aperfilyev 提交的 #506）
- [IDE 插件] 内联形参提示（由 @aperfilyev 提交）
- [运行时] 在运行时中包含用于带回调运行迁移的 API（#1844）

### 变更
- [编译器] 智能类型转换“IS NOT NULL”查询（#867）
- [编译器] 防止在运行时失败的关键字（#1471、#1629）
- [Gradle 插件] 将 Gradle 插件体积从 60MB 缩减至 13MB。
- [Gradle 插件] 正确支持 Android 变体，并移除对 KMM 特定目标 SQL 的支持（#1039）
- [Gradle 插件] 根据 minsdk 选择最低 SQLite 版本（#1684）
- [Native 驱动程序] 原生驱动连接池与性能更新

### 修复
- [编译器] Lambda 表达式前的不换行空格（NBSP）（由 @oldergod 提交）
- [编译器] 修复生成的 bind* 和 cursor.get* 语句中不兼容的类型
- [编译器] SQL 子句应保留适配类型（#2067）
- [编译器] 仅有 NULL 关键字的列应为可为 null
- [编译器] 不要生成带有类型注解的映射器 Lambda（#1957）
- [编译器] 如果自定义查询冲突，使用文件名作为额外的包后缀（#1057、#1278）
- [编译器] 确保外键级联会触发查询监听器通知（#1325、#1485）
- [编译器] 如果合并两个相同类型，返回表类型（#1342）
- [编译器] 确保 ifnull 和 coalesce 的实参可以为 null（#1263）
- [编译器] 对表达式正确使用查询施加的为 null 性
- [MySQL 方言] 支持 MySQL IF 语句
- [PostgreSQL 方言] 在 PostgreSQL 中将 NUMERIC 和 DECIMAL 检索为 Double（#2118）
- [SQLite 方言] UPSERT 通知应考虑 BEFORE/AFTER UPDATE 触发器（由 @andersio 提交的 #2198）
- [SQLite 驱动程序] 除非在内存中，否则在 SqliteDriver 中为线程使用多个连接（#1832）
- [JDBC 驱动程序] JDBC 驱动假设 autoCommit 为 true（#2041）
- [JDBC 驱动程序] 确保在异常时关闭连接（#2306）
- [IDE 插件] 修复因路径分隔符错误导致 Windows 上的 GoToDeclaration/FindUsages 损坏的问题（由 @angusholder 提交的 #2054）
- [IDE 插件] 忽略 Gradle 错误，而不是在 IDE 中崩溃。
- [IDE 插件] 如果将 sqldelight 文件移动到非 sqldelight 模块，不要尝试代码生成
- [IDE 插件] 忽略 IDE 中的代码生成错误
- [IDE 插件] 确保不尝试执行负向子字符串截取（#2068）
- [IDE 插件] 同时确保在运行 Gradle 操作之前项目未被释放（#2155）
- [IDE 插件] 可为 null 类型上的算术运算结果也应可为 null（#1853）
- [IDE 插件] 使“展开 * 意图”支持额外的投影（由 @aperfilyev 提交的 #2173）
- [IDE 插件] 如果转到期间 Kotlin 解析失败，不要尝试转到 sqldelight 文件
- [IDE 插件] 如果 IntelliJ 在 sqldelight 建立索引时遇到异常，不要崩溃
- [IDE 插件] 处理在 IDE 代码生成前检测错误时发生的异常
- [IDE 插件] 使 IDE 插件兼容动态插件（#1536）
- [Gradle 插件] 使用 WorkerApi 生成数据库时的竞态条件（由 @stephanenicolas 提交的 #2062）
- [Gradle 插件] classLoaderIsolation 阻止自定义 JDBC 使用的问题（由 @benasher44 提交的 #2048）
- [Gradle 插件] 改进缺少 packageName 的错误消息（由 @vanniktech 提交）
- [Gradle 插件] SQLDelight 将 IntelliJ 依赖泄漏到 buildscript 类路径上的问题（#1998）
- [Gradle 插件] 修复 Gradle 构建缓存（#2075）
- [Gradle 插件] 不要在 Gradle 插件中依赖 kotlin-native-utils（由 @ilmat192 提交）
- [Gradle 插件] 如果仅存在迁移文件，也写入数据库（#2094）
- [Gradle 插件] 确保菱形依赖项在最终编译单元中仅被获取一次（#1455）

特别感谢 @3flex，他在本版本中为改进 SQLDelight 基础架构做了大量工作。

## [1.4.4] - 2020-10-08 {id="1-4-4-2020-10-08"}
[1.4.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.4

### 新增
- [PostgreSQL 方言] 在 WITH 中支持数据修改语句
- [PostgreSQL 方言] 支持 substring 函数
- [Gradle 插件] 添加 verifyMigrations 标志以在 SQLDelight 编译期间验证迁移（#1872）

### 变更
- [编译器] 在非 SQLite 方言中将 SQLite 特有函数标记为未知
- [Gradle 插件] 当应用了 sqldelight 插件但未配置任何数据库时提供警告（#1421）

### 修复
- [编译器] 在 ORDER BY 子句中绑定列名时报告错误（由 @eygraber 提交的 #1187）
- [编译器] 生成数据库接口时出现注册表警告的问题（#1792）
- [编译器] CASE 语句的类型推断不正确（#1811）
- [编译器] 为没有版本的迁移文件提供更好的错误提示（#2006）
- [编译器] 某些数据库类型的 ColumnAdapter 所需的编作成数据库类型不正确（#2012）
- [编译器] CAST 的为 null 性（#1261）
- [编译器] 查询包装器中出现大量名称遮蔽警告（由 @eygraber 提交的 #1946）
- [编译器] 生成的代码正在使用全限定名称（#1939）
- [IDE 插件] 从 Gradle 同步触发 sqldelight 代码生成
- [IDE 插件] 更改 .sq 文件时插件未重新生成数据库接口（#1945）
- [IDE 插件] 将文件移动到新包时的问题（#444）
- [IDE 插件] 如果光标无处可移，则什么都不做而不是崩溃（#1994）
- [IDE 插件] 为 Gradle 项目外部的文件使用空包名（#1973）
- [IDE 插件] 针对无效类型优雅失败（#1943）
- [IDE 插件] 遇到未知表达式时抛出更清晰的错误消息（#1958）
- [Gradle 插件] SQLDelight 将 IntelliJ 依赖泄漏到 buildscript 类路径上（#1998）
- [Gradle 插件] 在 *.sq 文件中添加方法文档时出现“JavadocIntegrationKt not found”编译错误（#1982）
- [Gradle 插件] SqlDelight Gradle 插件不支持配置缓存（CoCa）（由 @stephanenicolas 提交的 #1947）
- [SQLite JDBC 驱动程序] SQLException: database in auto-commit mode（#1832）
- [协程扩展] 修复 coroutines-extensions 的 IR 后端（由 @dellisd 提交的 #1918）

## [1.4.3] - 2020-09-04 {id="1-4-3-2020-09-04"}
[1.4.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.3

### 新增
- [MySQL 方言] 添加对 MySQL last_insert_id 函数的支持（由 @lawkai 提交）
- [PostgreSQL 方言] 支持 SERIAL 数据类型（由 @veyndan 和 @felipecsl 提交）
- [PostgreSQL 方言] 支持 PostgreSQL RETURNING（由 @veyndan 提交）

### 修复
- [MySQL 方言] 将 MySQL AUTO_INCREMENT 视为具有默认值（#1823）
- [编译器] 修复 Upsert 语句编译器错误（由 @eygraber 提交的 #1809）
- [编译器] 修复生成无效 Kotlin 的问题（由 @eygraber 提交的 #1925）
- [编译器] 为未知函数提供更好的错误消息（#1843）
- [编译器] 将 String 暴露为 instr 第二个形参的类型
- [IDE 插件] 修复守护进程膨胀和 IDE 插件的 UI 线程卡死问题（#1916）
- [IDE 插件] 处理模块为 null 的场景（#1902）
- [IDE 插件] 在未配置的 sq 文件中返回空字符串作为包名（#1920）
- [IDE 插件] 修复分组语句并为其添加集成测试（#1820）
- [IDE 插件] 使用内置 ModuleUtil 查找元素的模块（#1854）
- [IDE 插件] 仅将有效元素添加到查找中（#1909）
- [IDE 插件] 父级可以为 null（#1857）

## [1.4.2] - 2020-08-27 {id="1-4-2-2020-08-27"}
[1.4.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.2

### 新增
- [运行时] 支持新的 JS IR 后端
- [Gradle 插件] 添加 generateSqlDelightInterface Gradle 任务（由 @vanniktech 提交）
- [Gradle 插件] 添加 verifySqlDelightMigration Gradle 任务（由 @vanniktech 提交）

### 修复
- [IDE 插件] 使用 Gradle 工具 API 便于 IDE 和 Gradle 之间的数据共享
- [IDE 插件] 架构推导默认设为 false
- [IDE 插件] 正确检索 commonMain 源集
- [MySQL 方言] 为 mySqlFunctionType() 添加 minute（由 @maaxgr 提交）

## [1.4.1] - 2020-08-21 {id="1-4-1-2020-08-21"}
[1.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.1

### 新增
- [运行时] 支持 Kotlin 1.4.0（#1859）

### 变更
- [Gradle 插件] 将 AGP 依赖设为 compileOnly（#1362）

### 修复
- [编译器] 为列定义规则和表接口生成器添加可选 JavaDoc（由 @endanke 提交的 #1224）
- [SQLite 方言] 添加对 SQLite FTS5 辅助函数 highlight、snippet 和 bm25 的支持（由 @drampelt 提交）
- [MySQL 方言] 支持 MySQL bit 数据类型
- [MySQL 方言] 支持 MySQL 二进制字面量
- [PostgreSQL 方言] 从 sql-psi 暴露 SERIAL（由 @veyndan 提交）
- [PostgreSQL 方言] 添加 BOOLEAN 数据类型（由 @veyndan 提交）
- [PostgreSQL 方言] 添加 NULL 列约束（由 @veyndan 提交）
- [HSQL 方言] 为 HSQL 添加 `AUTO_INCREMENT` 支持（由 @rharter 提交）

## [1.4.0] - 2020-06-22 {id="1-4-0-2020-06-22"}
[1.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.0

### 新增
- [MySQL 方言] MySQL 支持（由 @JGulbronson 和 @veyndan 提交）
- [PostgreSQL 方言] 实验性 PostgreSQL 支持（由 @veyndan 提交）
- [HSQL 方言] 实验性 H2 支持（由 @MariusVolkhart 提交）
- [SQLite 方言] SQLite FTS5 支持（由 @benasher44 和 @jpalawaga 提交）
- [SQLite 方言] 支持 alter table rename column（由 @angusholder 提交的 #1505）
- [IDE] 对迁移 (.sqm) 文件的 IDE 支持
- [IDE] 添加模仿内置 SQL 实时模板的 SQLDelight 实时模板（由 @veyndan 提交的 #1154）
- [IDE] 添加新建 SqlDelight 文件操作（由 @romtsn 提交的 #42）
- [运行时] 用于返回结果的事务的 transactionWithReturn API
- [编译器] 在 .sq 文件中将多个 SQL 语句组合在一起的语法
- [编译器] 支持从迁移文件生成架构
- [Gradle 插件] 添加用于将迁移文件输出为有效 SQL 的任务

### 变更
- [文档] 全面重构文档网站（由 @saket 提交）
- [Gradle 插件] 改进不支持的方言错误消息（由 @veyndan 提交）
- [IDE] 根据方言动态更改文件图标（由 @veyndan 提交）
- [JDBC 驱动程序] 从 javax.sql.DataSource 公开 JdbcDriver 构造函数（#1614）

### 修复
- [编译器] 支持表上的 JavaDoc 并修复一个文件中多个 JavaDoc 的问题（#1224）
- [编译器] 允许为合成列插入值（#1351）
- [编译器] 修复目录名称清理中的不一致性（由 @ZacSweers 提交）
- [编译器] 合成列在联结（join）时应保留为 null 性（#1656）
- [编译器] 将 delete 语句锚定在 delete 关键字上（#1643）
- [编译器] 修复引号引用问题（由 @angusholder 提交的 #1525）
- [编译器] 修复 between 运算符以正确递归到表达式中（#1279）
- [编译器] 创建索引时缺少表/列提供更好的错误信息（#1372）
- [编译器] 允许在联结约束中使用外部查询的投影（#1346）
- [Native 驱动程序] 使 execute 使用 transationPool（由 @benasher44 提交）
- [JDBC 驱动程序] 使用 JDBC 事务 API 替代 SQLite 事务 API（#1693）
- [IDE] 修复 virtualFile 引用以始终指向原始文件（#1782）
- [IDE] 向 Bugsnag 报告错误时使用正确的 Throwable（#1262）
- [Paging 扩展] 修复泄漏的 DataSource（#1628）
- [Gradle 插件] 生成架构时如果输出 db 文件已存在，则将其删除（#1645）
- [Gradle 插件] 如果存在间隙，则迁移验证失败
- [Gradle 插件] 显式使用我们设置的文件索引（#1644）

## [1.3.0] - 2020-04-03 {id="1-3-0-2020-04-03"}
[1.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.3.0

* 新增：[Gradle] dialect 属性以指定要用于编译的目标 SQL 方言。
* 新增：[编译器] #1009 实验性支持 MySQL 方言。
* 新增：[编译器] #1436 支持 sqlite:3.24 方言及 upsert。
* 新增：[JDBC 驱动程序] 从 SQLite JVM 驱动中拆分出 JDBC 驱动。
* 修复：[编译器] #1199 支持任意长度的 Lambda 表达式。
* 修复：[编译器] #1610 将 avg() 的返回值类型修正为可为 null。
* 修复：[IntelliJ] #1594 修复路径分隔符处理问题，该问题此前导致 Windows 上的转到和查找用例损坏。

## [1.2.2] - 2020-01-22 {id="1-2-2-2020-01-22"}
[1.2.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.2

* 新增：[运行时] 支持 Windows (mingW)、tvOS、watchOS 和 macOS 架构。
* 修复：[编译器] sum() 的返回值类型应为可为 null。
* 修复：[Paging] 将 Transacter 传入 QueryDataSourceFactory 以避免竞态条件。
* 修复：[IntelliJ 插件] 查找文件的包名时不再搜索依赖项。
* 修复：[Gradle] #862 将 Gradle 中的验证器日志更改为 debug 级别。
* 优化：[Gradle] 将 GenerateSchemaTask 转换为使用 Gradle worker。
* 说明：sqldelight-runtime 构件已重命名为 runtime。

## [1.2.1] - 2019-12-11 {id="1-2-1-2019-12-11"}
[1.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.1

* 修复：[Gradle] Kotlin/Native 1.3.60 支持。
* 修复：[Gradle] #1287 同步时的警告。
* 修复：[编译器] #1469 为查询创建 SynetheticAccessor。
* 修复：[JVM 驱动程序] 修复内存泄漏。
* 说明：协程扩展构件要求在 buildscript 中添加 kotlinx bintray maven 仓库。

## [1.2.0] - 2019-08-30 {id="1-2-0-2019-08-30"}
[1.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.0

* 新增：[运行时] 稳定的 Flow API。
* 修复：[Gradle] Kotlin/Native 1.3.50 支持。
* 修复：[Gradle] #1380 clean build 有时失败的问题。
* 修复：[Gradle] #1348 运行验证任务时打印“Could not retrieve functions”。
* 修复：[编译器] #1405 查询包含联结的 FTS 表时无法构建项目。
* 修复：[Gradle] #1266 拥有多个数据库模块时偶现的 Gradle 构建失败。

## [1.1.4] - 2019-07-11 {id="1-1-4-2019-07-11"}
[1.1.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.4

* 新增：[运行时] 实验性 Kotlin Flow API。
* 修复：[Gradle] Kotlin/Native 1.3.40 兼容性。
* 修复：[Gradle] #1243 修复在开启 Gradle 按需配置（configure on demand）时使用 SQLDelight 的问题。
* 修复：[Gradle] #1385 修复在增量注解处理中使用 SQLDelight 的问题。
* 修复：[Gradle] 允许 Gradle 任务缓存。
* 修复：[Gradle] #1274 支持通过 Kotlin DSL 使用 sqldelight 扩展。
* 修复：[编译器] 确定性地为每个查询生成唯一 ID。
* 修复：[编译器] 仅在事务完成时通知监听的查询。
* 修复：[JVM 驱动程序] #1370 强制 JdbcSqliteDriver 用户提供数据库 URL。

## [1.1.3] - 2019-04-14 {id="1-1-3-2019-04-14"}
[1.1.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.3

* Gradle Metadata 1.0 版本。

## [1.1.2] - 2019-04-14 {id="1-1-2-2019-04-14"}
[1.1.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.2

* 新增：[运行时] #1267 日志驱动装饰器。
* 修复：[编译器] #1254 拆分长度超过 2^16 个字符的字符串字面量。
* 修复：[Gradle] #1260 多平台项目中生成的源被识别为 iOS 源的问题。
* 修复：[IDE] #1290 CopyAsSqliteAction.kt:43 中的 kotlin.KotlinNullPointerException。
* 修复：[Gradle] #1268 近期版本中运行 linkDebugFrameworkIos* 任务失败的问题。

## [1.1.1] - 2019-03-01 {id="1-1-1-2019-03-01"}
[1.1.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.1

* 修复：[Gradle] 修复 Android 项目的模块依赖编译。
* 修复：[Gradle] #1246 在 afterEvaluate 中设置 API 依赖项。
* 修复：[编译器] 正确打印数组类型。

## [1.1.0] - 2019-02-27 {id="1-1-0-2019-02-27"}
[1.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.0

* 新增：[Gradle] #502 允许指定架构模块依赖。
* 优化：[编译器] #1111 表错误优先于其他错误排序。
* 修复：[编译器] #1225 为 REAL 字面量返回正确的类型。
* 修复：[编译器] #1218 docid 穿透触发器传播。

## [1.0.3] - 2019-01-30 {id="1-0-3-2019-01-30"}
[1.0.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.3

* 优化：[运行时] #1195 Native 驱动程序/运行时 Arm32。
* 优化：[运行时] #1190 从 Query 类型中公开映射器。

## [1.0.2] - 2019-01-26 {id="1-0-2-2019-01-26"}
[1.0.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.2

* 修复：[Gradle 插件] 更新至 Kotlin 1.3.20。
* 修复：[运行时] 事务不再吞掉异常。

## [1.0.1] - 2019-01-21 {id="1-0-1-2019-01-21"}
[1.0.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.1

* 优化：[Native 驱动程序] 允许将目录名称传递给 DatabaseConfiguration。
* 优化：[编译器] #1173 没有包声明的文件编译失败。
* 修复：[IDE] 正确向 Square 报告 IDE 错误。
* 修复：[IDE] #1162 同一个包中的类型显示为错误但实际运行正常。
* 修复：[IDE] #1166 重命名表失败并抛出 NPE。
* 修复：[编译器] #1167 尝试解析带有 UNION 和 SELECT 的复杂 SQL 语句时抛出异常。

## [1.0.0] - 2019-01-08 {id="1-0-0-2019-01-08"}
[1.0.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.0

* 新增：生成的代码彻底重构，现已转为 Kotlin。
* 新增：RxJava2 扩展构件。
* 新增：Android Paging 扩展构件。
* 新增：Kotlin 多平台支持。
* 新增：Android、iOS 和 JVM SQLite 驱动构件。
* 新增：事务 API。

## [0.7.0] - 2018-02-12 {id="0-7-0-2018-02-12"}
[0.7.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.7.0

 * 新增：生成的代码已更新为仅使用 Support SQLite 库。所有查询现在生成语句对象，而不是原始字符串。
 * 新增：IDE 中的语句折叠。
 * 新增：布尔类型现在自动处理。
 * 修复：从代码生成中移除了弃用的 marshal。
 * 修复：修正 'avg' SQL 函数类型映射为 REAL。
 * 修复：正确检测 'julianday' SQL 函数。

## [0.6.1] - 2017-03-22 {id="0-6-1-2017-03-22"}
[0.6.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.6.1

 * 新增：不带实参的 Delete、Update 和 Insert 语句生成已编译的语句。
 * 修复：在子查询中使用的视图内的 USING 子句不再报错。
 * 修复：移除了生成的 Mapper 上的重复类型。
 * 修复：子查询可用于针对实参进行检查的表达式中。

## [0.6.0] - 2017-03-06 {id="0-6-0-2017-03-06"}
[0.6.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.6.0

 * 新增：Select 查询现在暴露为 `SqlDelightStatement` 工厂，而不是字符串常量。
 * 新增：查询 JavaDoc 现在会复制到语句和映射器工厂中。
 * 新增：为视图名称输出字符串常量。
 * 修复：对需要工厂的视图的查询，现在正确要求将这些工厂作为实参。
 * 修复：验证 insert 的实参数量与指定的列数量匹配。
 * 修复：正确编码在 WHERE 子句中使用的 Blob 字面量。
 * 此版本需要 Gradle 3.3 或更高版本。

## [0.5.1] - 2016-10-24 {id="0-5-1-2016-10-24"}
[0.5.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.5.1

 * 新增：已编译语句扩展自抽象类型。
 * 修复：形参中的基本类型如果可为 null 则会装箱。
 * 修复：绑定实参所需的所有工厂都存在于工厂方法中。
 * 修复：转义的列名被正确编组。

## [0.5.0] - 2016-10-19 {id="0-5-0-2016-10-19"}
[0.5.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.5.0

 * 新增：SQLite 实参可以通过 Factory 进行类型安全的传递。
 * 新增：IntelliJ 插件对 .sq 文件执行格式化。
 * 新增：支持 SQLite 时间戳字面量。
 * 修复：在 IntelliJ 中可以点击跳转参数化类型。
 * 修复：如果从 Cursor 获取转义列名，不再抛出 RuntimeException。
 * 修复：Gradle 插件尝试打印异常时不再崩溃。

## [0.4.4] - 2016-07-20 {id="0-4-4-2016-07-20"}
[0.4.4]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.4

 * 新增：原生支持 short 作为列 Java 类型。
 * 新增：在生成的映射器和工厂方法上添加 JavaDoc。
 * 修复：group_concat 和 nullif 函数具有正确的为 null 性。
 * 修复：与 Android Studio 2.2-alpha 的兼容性。
 * 修复：WITH RECURSIVE 不再导致插件崩溃。

## [0.4.3] - 2016-07-07 {id="0-4-3-2016-07-07"}
[0.4.3]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.3

 * 新增：编译错误链接到源文件。
 * 新增：右键单击可将 SQLDelight 代码复制为有效的 SQLite。
 * 新增：命名语句上的 JavaDoc 将出现在生成的 String 上。
 * 修复：生成的视图模型包含为 null 性注解。
 * 修复：来自 UNION 的生成代码具有正确的类型和为 null 性，以支持所有可能的列。
 * 修复：生成的代码中 sum 和 round SQLite 函数具有正确的类型。
 * 修复：CAST 及内部 SELECT 的问题修复。
 * 修复：CREATE TABLE 语句中的自动补全。
 * 修复：包中可以使用 SQLite 关键字。

## [0.4.2] - 2016-06-16 {id="0-4-2-2016-06-16"}
[0.4.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.2

 * 新增：可以从工厂创建 Marshal。
 * 修复：IntelliJ 插件生成具有正确泛型顺序的工厂方法。
 * 修复：函数名称可以使用任何大小写形式。

## [0.4.1] - 2016-06-14 {id="0-4-1-2016-06-14"}
[0.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.1

 * 修复：IntelliJ 插件生成具有正确泛型顺序的类。
 * 修复：列定义可以使用任何大小写形式。

## [0.4.0] - 2016-06-14 {id="0-4-0-2016-06-14"}
[0.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.0

 * 新增：按查询而非按表生成映射器。
 * 新增：可以在 .sq 文件中导入 Java 类型。
 * 新增：验证 SQLite 函数。
 * 修复：移除重复错误。
 * 修复：大写列名和 Java 关键字列名不再报错。

## [0.3.2] - 2016-05-14 {id="0-3-2-2016-05-14"}
[0.3.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.2

 * 新增：自动补全和查找用例现在适用于视图和别名。
 * 修复：编译期验证现在允许在 SELECT 中使用函数。
 * 修复：支持仅声明默认值的 INSERT 语句。
 * 修复：导入未使用 SQLDelight 的项目时插件不再崩溃。

## [0.3.1] - 2016-04-27 {id="0-3-1-2016-04-27"}
[0.3.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.1

  * 修复：接口可见性改回 public，以避免方法引用引起的 Illegal Access 运行时异常。
  * 修复：子表达式得到正确求值。

## [0.3.0] - 2016-04-26 {id="0-3-0-2016-04-26"}
[0.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.0

  * 新增：列定义使用 SQLite 类型，并可以通过附加的 'AS' 约束指定 Java 类型。
  * 新增：可以从 IDE 发送错误报告。
  * 修复：自动补全功能正常工作。
  * 修复：编辑 .sq 文件时更新 SQLDelight 模型文件。
  * 移除：不再支持附加数据库（attached databases）。

## [0.2.2] - 2016-03-07 {id="0-2-2-2016-03-07"}
[0.2.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.2

 * 新增：对 INSERT、UPDATE、DELETE、索引和触发器语句所使用的列进行编译期验证。
 * 修复：在文件移动/创建时 IDE 插件不再崩溃。

## [0.2.1] - 2016-03-07 {id="0-2-1-2016-03-07"}
[0.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.1

 * 新增：Ctrl+`/`（OSX 上为 Cmd+`/`）切换所选行的注释。
 * 新增：对 SQL 查询使用的列进行编译期验证。
 * 修复：在 IDE 和 Gradle 插件中均支持 Windows 路径。

## [0.2.0] - 2016-02-29 {id="0-2-0-2016-02-29"}
[0.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.0

 * 新增：向 Marshal 类添加复制构造函数。
 * 新增：更新至 Kotlin 1.0 正式版。
 * 修复：以非破坏性方式报告 'sqldelight' 文件夹结构问题。
 * 修复：禁止命名为 `table_name` 的列。其生成的常量会与表名常量冲突。
 * 修复：确保无论 `.sq` 文件是否打开，IDE 插件都会立即生成模型类。
 * 修复：在 IDE 和 Gradle 插件中均支持 Windows 路径。

## [0.1.2] - 2016-02-13 {id="0-1-2-2016-02-13"}
[0.1.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.2

 * 修复：移除了阻止 Gradle 插件在大多数项目中使用的代码。
 * 修复：添加了对 Antlr 运行时缺失的编译器依赖项。

## [0.1.1] - 2016-02-12 {id="0-1-1-2016-02-12"}
[0.1.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.1

 * 修复：确保 Gradle 插件指向与其自身相同版本的运行时。

## [0.1.0] - 2016-02-12 {id="0-1-0-2016-02-12"}
[0.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.0

初始版本发布。