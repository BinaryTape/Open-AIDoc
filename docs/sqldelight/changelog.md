# 更新日志

## 未发布 {id="unreleased"}

### 新增 {id="added"}

- 暂无！

### 变更 {id="changed"}

- 暂无！

### 修复 {id="fixed"}

- [Runtime] 当结束事务或回滚后钩子（post-rollback hook）也失败时（例如 SQLite 自行回滚事务后出现 `cannot rollback - no transaction is active`），保留事务体抛出的异常。第二个异常将作为被抑制的异常（suppressed exception）添加，且 Android 驱动程序现在即使在 `endTransaction()` 抛出异常时也会清除其当前事务（由 @pyricau 在 #6387 中贡献）
- [Gradle Plugin] `Configuration.visible` 属性不再生效。该属性现已被弃用，并将在 Gradle 11 中移除（由 @griffio 在 #6394 中贡献）
- [IntelliJ Plugin] 修复联结检查（join inspection）出现误报的问题（由 @griffio 在 #6398 中贡献）
- [JDBC Driver] 修复提交/回滚失败时连接泄漏的问题（由 @tKe 在 #6401 中贡献）

## [2.4.1] - 2026-10-06 {id="2-4-1-2026-10-06"}
[2.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.1

### 新增

- [Documentation] 补充 Android SQLite 事务文档（由 @griffio 在 #6381 中贡献）

### 变更

- [Gradle Plugin] 在整个代码生成任务期间将解析后的 `.sq` 文件保留在内存中，使其在垃圾回收后无需重新解析。这可以提高大型项目中的代码生成速度（由 @C2H6O 在 #6374 中贡献）
- [IntelliJ Plugin] 崩溃报告现在会发送至 JetBrains Marketplace，而非自定义的 Bugsnag 实例（由 @JakeWharton 在 #6376 中贡献）

### 修复

- [IntelliJ Plugin] 通过更改 IntelliJ API 的调用方式修复插件发布违规问题（由 @griffio 在 #6366 #6368 中贡献）
- [Intellij Plugin] 通过捕获未处理的错误提升键入时的稳定性（由 @griffio 在 #6355 中贡献）

## [2.4.0] - 2026-09-17 {id="2-4-0-2026-09-17"}
[2.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0

### 新增
- [Native Driver] 为 `inMemoryDriver` 添加 `extendedConfig` 形参（由 @GuilhE 在 #5539 中贡献）
- [PostgreSQL Dialect] 为隐式定义的系统列添加查询支持（由 @griffio 在 #5834 中贡献）
- [PostgreSQL Dialect] 添加基础的数组字面量支持（由 @griffio 在 #5997 中贡献）
- [PostgreSQL Dialect] 添加基础的 LTREE 支持（由 @yesitskev 和 @griffio 在 #5880 中贡献）
- [MySQL Dialect] 添加对 INET 函数的支持（由 @mcxinyu 在 #5072 中贡献）
- [PostgreSQL Dialect] 添加对 ALTER INDEX 的支持（由 @griffio 在 #6224 中贡献）
- [SQLite Dialect] 添加对 SQLite 3.44 聚合函数 DISTINCT、ORDER BY 和 FILTER 的支持（由 @griffio 在 #6236 中贡献）
- [SQLite Dialect] 添加对 SQLite 3.37 STRICT 表的支持（由 @griffio 在 #6230 中贡献）
- [Gradle Plugin] 添加通过 `codegenExcludedColumns` 从生成模型中排除列的支持（由 @sokolikp 在 #6243 中贡献）
- [Compiler] 在架构中添加 `allTableNames` 函数（由 @edenman 在 #6245 中贡献）
- [PostgreSQL Dialect] 添加对 ANY 运算符的支持（由 @griffio 在 #6253 中贡献）
- [SQLite Dialect] 添加对 SQLite 3.39 RIGHT JOIN 和 FULL JOIN 的支持（由 @griffio 在 #6273 中贡献）
- [PostgreSQL Dialect] 在触发器函数中添加对 `RAISE` 语句和 `FOUND` 变量的支持（由 @griffio 在 #6297 中贡献）

### 变更
- [PostgreSQL Dialect] 将 arrayIntermediateType 的可见性更改为 public（由 @griffio 在 #5835 中贡献）
- [Gradle Plugin] 实现更严格的 MigrationFile 版本控制（由 @madisp 在 #5730 中贡献）
- [Gradle Plugin] 将最低支持的 Gradle 版本提升至 8.2.1（由 @maxsav 在 #6217 中贡献）
- [Gradle Plugin] 支持 Gradle 隔离项目（isolated projects）（由 @maxsav 在 #6217 中贡献）
- [IntelliJ Plugin] 最低版本要求为 2023.3 / Android Studio Jellyfish

### 修复
- [Gradle Plugin] 在 JDK 24+ 上抑制编译器 worker 产生的 `sun.misc.Unsafe` 弃用警告（#6321）
- [Compiler] 抑制生成代码中额外的 Kotlin 警告（由 @eyupcanakman 在 #6208 中贡献）
- [Compiler] 非分组聚合结果集中的其他列始终可为 null
- [PostgreSQL Dialect] 正确解析 coalesce 和 ifnull 的为 null 性
- [PostgreSQL Dialect] 修复 PostgreSQL 方言的 IDE 集成
- [PostgreSQL Dialect] 改进 PostgreSQL 方言的 IDE 插件（由 @griffio 在 #6209 中贡献）
- [Intellij Plugin] IDE 插件支持针对所有方言执行代码补全（由 @griffio 在 #6210 中贡献）
- [Gradle Plugin] 修复运行数据库验证任务时的循环依赖错误（由 @griffio 在 #6221 中贡献）
- [Compiler] 修复多行更新时的乐观锁问题（由 @griffio 在 #6240 中贡献）
- [Intellij Plugin] 修复在 IDEA 2026.2 中导致崩溃的弃用 API 调用（由 @griffio 在 #6247 中贡献）
- [Gradle Plugin] 修复在 AGP 8.9 至 8.11 上 Kotlin 编译无法识别生成源码的问题
- [PostgreSQL Dialect] 修复使用基本类型绑定实参的 lower 和 upper 函数默认解析为 TEXT 的问题（由 @griffio 在 #6262 中贡献）
- [Compiler] 修复使用适配器进行数据类绑定且迁移更改了为 null 性时的插入值问题（由 griffio 在 #6269 中贡献）
- [Compiler] 在空安全运算符（IS 和 IS DISTINCT FROM）中使用可空的绑定实参（由 @griffio 在 #6265 中贡献）
- [Gradle Plugin] 项目依赖项采用 AGP 的变体解析方式（由 @maxsav 在 #6217 中贡献）
- [Gradle Plugin] 修复当不同构建间的 AGP 变体列表不同时，generateDatabaseInterface 导致构建缓存未命中的问题
- [Gradle Plugin] 修复在未配置任何数据库的情况下应用插件时 IDE 同步崩溃的问题（#6088）
- [PostgreSQL Dialect] 修复使用嵌套函数调用时的 JSON 聚合函数问题（由 @griffio 在 #6281 中贡献）
- [Paging3 Extension] 修复 KeyedQueryPagingSource 在空数据库上崩溃的问题（由 @woods-marshes 在 #6284 中贡献）
- [Compiler] 修复当变更语句与 `COALESCE` 等包装函数一起使用时 Java 类型适配器出现的问题（由 @griffio 在 #6292 中贡献）
- [Compiler] 修复当模块名大写时，生成代码的包名也被大写的问题（由 @griffio 在 #6316 中贡献）
- [PostgreSQL Dialect] 允许日期数据类型不区分大小写（由 @griffio 在 #6328 中贡献）
- [PostgreSQL Dialect] 将 `string_agg` 函数修复为可为 null（由 @griffio 在 #6340 中贡献）
- [SQLite Dialect] 修复 SQLite 3.44 使用 `GROUP BY` 时的聚合函数问题（由 @griffio 在 #6343 中贡献）
- [Gradle Plugin] 避免在配置阶段解析数据库依赖项（由 @joshfriend 在 #6353 中贡献）

## [2.4.0-rc2] - 2026-09-14 {id="2-4-0-rc2-2026-09-14"}
[2.4.0-rc2]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0-rc2

### 修复

- [PostgreSQL Dialect] 将 `string_agg` 函数修复为可为 null（由 @griffio 在 #6340 中贡献）
- [SQLite Dialect] 修复 SQLite 3.44 使用 `GROUP BY` 时的聚合函数问题（由 @griffio 在 #6343 中贡献）
- [Gradle Plugin] 避免在配置阶段解析数据库依赖项（由 @joshfriend 在 #6353 中贡献）

## [2.4.0-rc1] - 2026-09-01 {id="2-4-0-rc1-2026-09-01"}
[2.4.0-rc1]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0-rc1

### 新增
- [Native Driver] 为 `inMemoryDriver` 添加 `extendedConfig` 形参（由 @GuilhE 在 #5539 中贡献）
- [PostgreSQL Dialect] 为隐式定义的系统列添加查询支持（由 @griffio 在 #5834 中贡献）
- [PostgreSQL Dialect] 添加基础的数组字面量支持（由 @griffio 在 #5997 中贡献）
- [PostgreSQL Dialect] 添加基础的 LTREE 支持（由 @yesitskev 和 @griffio 在 #5880 中贡献）
- [MySQL Dialect] 添加对 INET 函数的支持（由 @mcxinyu 在 #5072 中贡献）
- [PostgreSQL Dialect] 添加对 ALTER INDEX 的支持（由 @griffio 在 #6224 中贡献）
- [SQLite Dialect] 添加对 SQLite 3.44 聚合函数 DISTINCT、ORDER BY 和 FILTER 的支持（由 @griffio 在 #6236 中贡献）
- [SQLite Dialect] 添加对 SQLite 3.37 STRICT 表的支持（由 @griffio 在 #6230 中贡献）
- [Gradle Plugin] 添加通过 `codegenExcludedColumns` 从生成模型中排除列的支持（由 @sokolikp 在 #6243 中贡献）
- [Compiler] 在架构中添加 `allTableNames` 函数（由 @edenman 在 #6245 中贡献）
- [PostgreSQL Dialect] 添加对 ANY 运算符的支持（由 @griffio 在 #6253 中贡献）
- [SQLite Dialect] 添加对 SQLite 3.39 RIGHT JOIN 和 FULL JOIN 的支持（由 @griffio 在 #6273 中贡献）
- [PostgreSQL Dialect] 在触发器函数中添加对 `RAISE` 语句和 `FOUND` 变量的支持（由 @griffio 在 #6297 中贡献）

### 变更
- [PostgreSQL Dialect] 将 arrayIntermediateType 的可见性更改为 public（由 @griffio 在 #5835 中贡献）
- [Gradle Plugin] 实现更严格的 MigrationFile 版本控制（由 @madisp 在 #5730 中贡献）
- [Gradle Plugin] 将最低支持的 Gradle 版本提升至 8.2.1（由 @maxsav 在 #6217 中贡献）
- [Gradle Plugin] 支持 Gradle 隔离项目（由 @maxsav 在 #6217 中贡献）
- [IntelliJ Plugin] 最低版本要求为 2023.3 / Android Studio Jellyfish

### 修复
- [Gradle Plugin] 在 JDK 24+ 上抑制编译器 worker 产生的 `sun.misc.Unsafe` 弃用警告（#6321）
- [Compiler] 抑制生成代码中额外的 Kotlin 警告（由 @eyupcanakman 在 #6208 中贡献）
- [Compiler] 非分组聚合结果集中的其他列始终可为 null
- [PostgreSQL Dialect] 正确解析 coalesce 和 ifnull 的为 null 性
- [PostgreSQL Dialect] 修复 PostgreSQL 方言的 IDE 集成
- [PostgreSQL Dialect] 改进 PostgreSQL 方言的 IDE 插件（由 @griffio 在 #6209 中贡献）
- [Intellij Plugin] IDE 插件支持针对所有方言执行代码补全（由 @griffio 在 #6210 中贡献）
- [Gradle Plugin] 修复运行数据库验证任务时的循环依赖错误（由 @griffio 在 #6221 中贡献）
- [Compiler] 修复多行更新时的乐观锁问题（由 @griffio 在 #6240 中贡献）
- [Intellij Plugin] 修复在 IDEA 2026.2 中导致崩溃的弃用 API 调用（由 @griffio 在 #6247 中贡献）
- [Gradle Plugin] 修复在 AGP 8.9 至 8.11 上 Kotlin 编译无法识别生成源码的问题
- [PostgreSQL Dialect] 修复使用基本类型绑定实参的 lower 和 upper 函数默认解析为 TEXT 的问题（由 @griffio 在 #6262 中贡献）
- [Compiler] 修复使用适配器进行数据类绑定且迁移更改了为 null 性时的插入值问题（由 griffio 在 #6269 中贡献）
- [Compiler] 在空安全运算符（IS 和 IS DISTINCT FROM）中使用可空的绑定实参（由 @griffio 在 #6265 中贡献）
- [Gradle Plugin] 项目依赖项采用 AGP 的变体解析方式（由 @maxsav 在 #6217 中贡献）
- [Gradle Plugin] 修复当不同构建间的 AGP 变体列表不同时，generateDatabaseInterface 导致构建缓存未命中的问题
- [Gradle Plugin] 修复在未配置任何数据库的情况下应用插件时 IDE 同步崩溃的问题（#6088）
- [PostgreSQL Dialect] 修复使用嵌套函数调用时的 JSON 聚合函数问题（由 @griffio 在 #6281 中贡献）
- [Paging3 Extension] 修复 KeyedQueryPagingSource 在空数据库上崩溃的问题（由 @woods-marshes 在 #6284 中贡献）
- [Compiler] 修复当变更语句与 `COALESCE` 等包装函数一起使用时 Java 类型适配器出现的问题（由 @griffio 在 #6292 中贡献）
- [Compiler] 修复当模块名大写时，生成代码的包名也被大写的问题（由 @griffio 在 #6316 中贡献）
- [PostgreSQL Dialect] 允许日期数据类型不区分大小写（由 @griffio 在 #6328 中贡献）

## [2.3.2] - 2026-03-16 {id="2-3-2-2026-03-16"}
[2.3.2]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.2

### 新增
- [PostgreSQL Dialect] 改进对 ALTER TABLE ALTER TYPE USING 表达式的支持（由 @griffio 在 #6116 中贡献）
- [PostgreSQL Dialect] 添加对 DROP COLUMN IF EXISTS 的支持（由 @griffio 在 #6112 中贡献）
- [Gradle Plugin] 添加 expandSelectStar 标志以关闭 Select 通配符展开（由 @griffio 在 #5813 中贡献）
- [MySQL Dialect] 添加对窗口函数的支持（由 @griffio 在 #6086 中贡献）
- [Gradle Plugin] 修复当起始架构版本不是 1 且 verifyMigrations 为 true 时的构建失败问题（由 @neilgmiller 在 #6017 中贡献）
- [Gradle Plugin] 使 `SqlDelightWorkerTask` 具备更强的可配置性，并更新默认配置以支持在 Windows 上开发（由 @MSDarwish2000 在 #5215 中贡献）
- [SQLite Dialect] 添加对 FTS5 虚表中合成列（synthesized columns）的支持（由 @watbe 在 #5986 中贡献）
- [PostgreSQL Dialect] 添加对 Postgres 行级安全（row level security）的支持（由 @shellderp 在 #6087 中贡献）
- [PostgreSQL Dialect] 扩展 FOR UPDATE 以支持 OF table、NO KEY UPDATE 和 NO WAIT（由 @shellderp 在 #6104 中贡献）
- [PostgreSQL Dialect] 支持 Postgis Point 类型及相关函数（由 @vanniktech 在 #5602 中贡献）
- [Runtime] 添加 `SuspendingTransacter.TransactionDispatcher`，提供用于控制事务的 `CoroutineContext` 的机制（由 @eygraber 在 #5967 中贡献）
- [Gradle Plugin] 完全兼容 Android Gradle Plugin 9.0 的新 DSL（#6140）
- [PostgreSQL Dialect] 支持 PostgreSQL CREATE TABLE 存储参数（由 @griffio 在 #6148 中贡献）
- [PostgreSQL Dialect] 修复 PostgreSQL 唯一表约束可为 null 的结果列（由 @griffio 在 #6167 中贡献）

### 变更
- [Compiler] 将编译器输出类型从 java.lang.Void 改为 kotlin.Nothing（由 @griffio 在 #6099 中贡献）
- [Compiler] 允许在包名中使用下划线。此前下划线会被过滤，导致意外行为（由 @BierDav 在 #6027 中贡献）
- [Paging Extension] 切换至 AndroidX Paging（由 @jeffdgr8 在 #5910 中贡献）
- [Android Driver] 将 Android minSdk 提升至 23（#6141）
- [Paging Extension] 升级至 paging 3.4.1，并移除了 X64 Apple 目标（#6166）

### 修复
- [IntelliJ Plugin] 修复在 VFS 刷新事件期间由于 EDT 上阻塞式文件类型检测引起的 IDE 卡死问题
- [SQLite Dialect] 修复使用 JSON 路径运算符时的 SQLite 3.38 编译错误（由 @griffio 在 #6070 中贡献）
- [SQLite Dialect] 使用自定义列类型时，为 group_concat 函数使用 String 类型（由 @griffio 在 #6082 中贡献）
- [Gradle Plugin] 提升 `VerifyMigrationTask` 的性能，防止其在复杂架构上挂起（由 @Lightwood13 在 #6073 中贡献）
- [Intellij Plugin] 修复插件初始化异常并更新已弃用的方法（由 @griffio 在 #6040 中贡献）
- [Gradle Plugin] 修复与 Android Gradle Plugin 内置 Kotlin 的兼容性问题（#6139）

## [2.3.1] - 2025-03-12 {id="2-3-1-2025-03-12"}
[2.3.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.1

发布失败。请使用 2.3.2！

## [2.3.0] - 2025-03-12 {id="2-3-0-2025-03-12"}
[2.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.0

发布失败。请使用 2.3.2！

## [2.2.1] - 2025-11-13 {id="2-2-1-2025-11-13"}
[2.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.2.1

### 新增
- [PostgreSQL Dialect] 修复 Postgres numeric/integer/biginteger 类型映射（由 @griffio 在 #5994 中贡献）
- [Compiler] 改进编译器错误消息，在需要 CAST 时包含源文件位置（由 @griffio 在 #5979 中贡献）
- [PostgreSQL Dialect] 添加对 Postgres JSON 运算符路径提取的支持（由 @griffio 在 #5971 中贡献）
- [SQLite Dialect] 为使用通用表表达式的 MATERIALIZED 查询计划提示添加 SQLite 3.35 支持（由 @griffio 在 #5961 中贡献）
- [PostgreSQL Dialect] 为使用通用表表达式的 MATERIALIZED 查询计划提示添加支持（由 @griffio 在 #5961 中贡献）
- [PostgreSQL Dialect] 添加对 Postgres JSON Aggregate FILTER 的支持（由 @griffio 在 #5957 中贡献）
- [PostgreSQL Dialect] 添加对 Postgres 枚举的支持（由 @griffio 在 #5935 中贡献）
- [PostgreSQL Dialect] 添加对 Postgres 触发器的有限支持（由 @griffio 在 #5932 中贡献）
- [PostgreSQL Dialect] 添加谓词以检查 SQL 表达式是否可以解析为 JSON（由 @griffio 在 #5843 中贡献）
- [PostgreSQL Dialect] 添加对 PostgreSQL Comment On 语句的有限支持（由 @griffio 在 #5808 中贡献）
- [MySQL Dialect] 添加对索引可见性选项的支持（由 @orenkislev-faire 在 #5785 中贡献）
- [PostgreSql Dialect] 添加对 TSQUERY 数据类型的支持（由 @griffio 在 #5779 中贡献）
- [Gradle Plugin] 添加模块时支持版本目录（version catalogs）（由 @DRSchlaubi 在 #5755 中贡献）

### 变更
- 开发中的快照现在发布到 Central Portal Snapshots 仓库：https://central.sonatype.com/repository/maven-snapshots/。
- [Compiler] 使用构造函数引用简化了默认生成的查询（由 @jonapoul 在 #5814 中贡献）

### 修复
- [Compiler] 修复使用包含通用表表达式的视图时的堆栈溢出问题（由 @griffio 在 #5928 中贡献）
- [Gradle Plugin] 修复打开 SqlDelight 工具窗口添加“新建连接”时的崩溃问题（由 @griffio 在 #5906 中贡献）
- [IntelliJ Plugin] 避免复制到 sqlite（copy-to-sqlite）装订区域操作中与线程相关的崩溃（由 @griffio 在 #5901 中贡献）
- [IntelliJ Plugin] 修复使用架构语句 CREATE INDEX 和 CREATE VIEW 时 PostgreSQL 方言的问题（由 @griffio 在 #5772 中贡献）
- [Compiler] 修复引用列时的 FTS 堆栈溢出问题（由 @griffio 在 #5896 中贡献）
- [Compiler] 修复 With Recursive 堆栈溢出问题（由 @griffio 在 #5892 中贡献）
- [Compiler] 修复 Insert|Update|Delete Returning 语句的通知（Notify）问题（由 @griffio 在 #5851 中贡献）
- [Compiler] 修复返回 Long 的事务块的异步结果类型（由 @griffio 在 #5836 中贡献）
- [Compiler] 将 SQL 形参绑定复杂度从 O(n²) 优化为 O(n)（由 @chenf7 在 #5898 中贡献）
- [SQLite Dialect] 修复 SQLite 3.18 缺失的函数（由 @griffio 在 #5759 中贡献）

## [2.2.0] - 2025-11-13 {id="2-2-0-2025-11-13"}
[2.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.2.0

发布失败，部分工件未成功发布。请使用 2.2.1！

## [2.1.0] - 2025-05-16 {id="2-1-0-2025-05-16"}
[2.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.1.0

### 新增
- [WASM Driver] 为 Web Worker 驱动程序添加 wasmJs 支持（由 @IlyaGulya 在 #5534 中贡献）
- [PostgreSQL Dialect] 支持 PostgreSQL UnNest 将数组展开为行（由 @griffio 在 #5673 中贡献）
- [PostgreSQL Dialect] 支持 PostgreSQL TSRANGE/TSTZRANGE（由 @griffio 在 #5297 中贡献）
- [PostgreSQL Dialect] 支持 PostgreSQL Right Full Join（由 @griffio 在 #5086 中贡献）
- [PostgreSQL Dialect] 支持 PostgreSQL 从时间类型中提取（extract）（由 @griffio 在 #5273 中贡献）
- [PostgreSQL Dialect] 支持 PostgreSQL 数组包含运算符（由 @griffio 在 #4933 中贡献）
- [PostgreSQL Dialect] 支持 PostgreSQL drop constraint（由 @griffio 在 #5288 中贡献）
- [PostgreSQL Dialect] 支持 PostgreSQL 类型转换（type casting）（由 @griffio 在 #5089 中贡献）
- [PostgreSQL Dialect] 支持 PostgreSQL 子查询 lateral join 运算符（由 @griffio 在 #5122 中贡献）
- [PostgreSQL Dialect] 支持 PostgreSQL ILIKE 运算符（由 @griffio 在 #5330 中贡献）
- [PostgreSQL Dialect] 支持 PostgreSQL XML 类型（由 @griffio 在 #5331 中贡献）
- [PostgreSQL Dialect] 支持 PostgreSQL AT TIME ZONE（由 @griffio 在 #5243 中贡献）
- [PostgreSQL Dialect] 支持 PostgreSQL order by nulls（由 @griffio 在 #5199 中贡献）
- [PostgreSQL Dialect] 添加 PostgreSQL 当前日期/时间函数支持（由 @drewd 在 #5226 中贡献）
- [PostgreSQL Dialect] 支持 PostgreSQL 正则表达式运算符（由 @griffio 在 #5137 中贡献）
- [PostgreSQL Dialect] 添加 brin gist（由 @griffio 在 #5059 中贡献）
- [MySQL Dialect] 支持 MySQL 方言的 RENAME INDEX（由 @orenkislev-faire 在 #5212 中贡献）
- [JSON Extension] 为 json 表函数添加别名（由 @griffio 在 #5372 中贡献）

### 变更
- [Compiler] 生成的查询文件为简单变更操作返回受影响的行数（由 @MariusVolkhart 在 #4578 中贡献）
- [Native Driver] 更新 NativeSqlDatabase.kt，修改 DELETE、INSERT 和 UPDATE 语句的 readonly 标志（由 @griffio 在 #5680 中贡献）
- [PostgreSQL Dialect] 将 PgInterval 改为 String（由 @griffio 在 #5403 中贡献）
- [PostgreSQL Dialect] 支持 SqlDelight 模块实现 PostgreSQL 扩展（由 @griffio 在 #5677 中贡献）

### 修复
- [Compiler] 修复：执行带结果的分组成组语句时通知查询（由 @vitorhugods 在 #5006 中贡献）
- [Compiler] 修复 SqlDelightModule 类型解析器（由 @griffio 在 #5625 中贡献）
- [Compiler] 修复 5501 中插入对象转义列的问题（由 @griffio 在 #5503 中贡献）
- [Compiler] 改进编译器错误消息，使路径链接可点击且指向正确的行与字符位置（由 @vanniktech 在 #5604 中贡献）
- [Compiler] 修复问题 5298：允许将关键字用作表名
- [Compiler] 修复命名 execute 并添加测试
- [Compiler] 对初始化语句排序时考虑外键表约束（由 @TheMrMilchmann 在 #5325 中贡献）
- [Compiler] 在涉及制表符时正确定位错误下划线（由 @drewd 在 #5224 中贡献）
- [JDBC Driver] 修复事务结束时 connectionManager 的内存泄漏问题
- [JDBC Driver] 如文档所述在事务内运行 SQLite 迁移（由 @morki 在 #5218 中贡献）
- [JDBC Driver] 修复事务提交/回滚后连接泄漏的问题（由 @morki 在 #5205 中贡献）
- [Gradle Plugin] 在 `GenerateSchemaTask` 之前执行 `DriverInitializer`（由 @nwagu 在 #5562 中贡献）
- [Runtime] 修复当实际驱动程序为异步时 LogSqliteDriver 发生的崩溃（由 @edenman 在 #5723 中贡献）
- [Runtime] 修复 StringBuilder 容量问题（由 @janbina 在 #5192 中贡献）
- [PostgreSQL Dialect] 支持 PostgreSQL create or replace view（由 @griffio 在 #5407 中贡献）
- [PostgreSQL Dialect] 支持 PostgreSQL to_json（由 @griffio 在 #5606 中贡献）
- [PostgreSQL Dialect] PostgreSQL numeric 解析器（由 @griffio 在 #5399 中贡献）
- [PostgreSQL Dialect] SQLite 窗口函数（由 @griffio 在 #2799 中贡献）
- [PostgreSQL Dialect] PostgreSQL SELECT DISTINCT ON（由 @griffio 在 #5345 中贡献）
- [PostgreSQL Dialect] alter table add column if not exists（由 @griffio 在 #5309 中贡献）
- [PostgreSQL Dialect] PostgreSQL 异步绑定形参（由 @griffio 在 #5313 中贡献）
- [PostgreSQL Dialect] PostgreSQL 布尔字面量（由 @griffio 在 #5262 中贡献）
- [PostgreSQL Dialect] PostgreSQL 窗口函数（由 @griffio 在 #5155 中贡献）
- [PostgreSQL Dialect] PostgreSQL isNull isNotNull 类型（由 @griffio 在 #5173 中贡献）
- [PostgreSQL Dialect] PostgreSQL select distinct（由 @griffio 在 #5172 中贡献）
- [Paging Extension] 修复分页刷新初始加载问题（由 @evant 在 #5615 中贡献）
- [Paging Extension] 添加 macOS 原生目标（由 @vitorhugods 在 #5324 中贡献）
- [IntelliJ Plugin] K2 支持

## [2.0.2] - 2024-04-05 {id="2-0-2-2024-04-05"}
[2.0.2]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.2

### 新增
- [PostgreSQL Dialect] 添加 PostgreSQL STRING_AGG 函数（由 @anddani 在 #4950 中贡献）
- [PostgreSQL Dialect] 为 pg 方言添加 SET 语句（由 @de-luca 在 #4927 中贡献）
- [PostgreSQL Dialect] 添加 PostgreSQL 修改列序列形参（由 @griffio 在 #4916 中贡献）
- [PostgreSQL Dialect] 为 insert 语句添加 postgresql 修改列默认值支持（由 @griffio 在 #4912 中贡献）
- [PostgreSQL Dialect] 添加 PostgreSQL alter sequence 和 drop sequence（由 @griffio 在 #4920 中贡献）
- [PostgreSQL Dialect] 添加 Postgres 正则表达式函数定义（由 @MariusVolkhart 在 #5025 中贡献）
- [PostgreSQL Dialect] 为 GIN 添加语法支持（由 @griffio 在 #5027 中贡献）

### 变更
- [IDE Plugin] 最低版本要求为 2023.1 / Android Studio Iguana
- [Compiler] 允许在 encapsulatingType 中重写类型为 null 性（由 @eygraber 在 #4882 中贡献）
- [Compiler] 为 SELECT * 内联列名
- [Gradle Plugin] 切换至 processIsolation（由 @nwagu 在 #5068 中贡献）
- [Android Runtime] 将 Android minSDK 提升至 21（由 @hfhbd 在 #5094 中贡献）
- [Drivers] 为方言作者公开更多 JDBC/R2DBC 语句方法（由 @hfhbd 在 #5098 中贡献）

### 修复
- [PostgreSQL Dialect] 修复 PostgreSQL alter table alter column（由 @griffio 在 #4868 中贡献）
- [PostgreSQL Dialect] 修复 4448 中表模型缺失导入的问题（由 @griffio 在 #4885 中贡献）
- [PostgreSQL Dialect] 修复 4932 PostgreSQL 默认约束函数问题（由 @griffio 在 #4934 中贡献）
- [PostgreSQL Dialect] 修复 4879 迁移期间 alter table rename column 中的 PostgreSQL 类转换错误（由 @griffio 在 #4880 中贡献）
- [PostgreSQL Dialect] 修复 4474 PostgreSQL create extension（由 @griffio 在 #4541 中贡献）
- [PostgreSQL Dialect] 修复 5018 PostgreSQL 添加主键不可为 null 类型（由 @griffio 在 #5020 中贡献）
- [PostgreSQL Dialect] 修复 4703 聚合表达式（由 @griffio 在 #5071 中贡献）
- [PostgreSQL Dialect] 修复 5028 PostgreSQL json（由 @griffio 在 #5030 中贡献）
- [PostgreSQL Dialect] 修复 5040 PostgreSQL json 运算符（由 @griffio 在 #5041 中贡献）
- [PostgreSQL Dialect] 修复 5040 的 json 运算符绑定（由 @griffio 在 #5100 中贡献）
- [PostgreSQL Dialect] 修复 5082 tsvector（由 @griffio 在 #5104 中贡献）
- [PostgreSQL Dialect] 修复 5032 PostgreSQL UPDATE FROM 语句的列邻接问题（由 @griffio 在 #5035 中贡献）
- [SQLite Dialect] 修复 4897 SQLite alter table rename column（由 @griffio 在 #4899 中贡献）
- [IDE Plugin] 修复错误处理程序崩溃问题（由 @aperfilyev 在 #4988 中贡献）
- [IDE Plugin] BugSnag 在 IDEA 2023.3 中初始化失败（由 @aperfilyev 贡献）
- [IDE Plugin] 通过插件在 IntelliJ 中打开 .sq 文件时出现 PluginException（由 @aperfilyev 贡献）
- [IDE Plugin] 不再将 kotlin 库打包进 IntelliJ 插件中，因为其已作为插件依赖项存在（#5126）
- [IDE Plugin] 使用 extensions 数组代替 stream（#5127）

## [2.0.1] - 2023-12-01 {id="2-0-1-2023-12-01"}
[2.0.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.1

### 新增
- [Compiler] 在执行 SELECT 时支持多列表达式（multi-column-expr）（由 @Adriel-M 在 #4453 中贡献）
- [PostgreSQL Dialect] 添加对 PostgreSQL CREATE INDEX CONCURRENTLY 的支持（由 @griffio 在 #4531 中贡献）
- [PostgreSQL Dialect] 允许 PostgreSQL CTE 辅助语句相互引用（由 @griffio 在 #4493 中贡献）
- [PostgreSQL Dialect] 为二元表达式和 sum 添加对 PostgreSQL 类型的支持（由 @Adriel-M 在 #4539 中贡献）
- [PostgreSQL Dialect] 添加对 PostgreSQL SELECT DISTINCT ON 语法的支持（由 @griffio 在 #4584 中贡献）
- [PostgreSQL Dialect] 在 SELECT 语句中添加对 PostgreSQL JSON 函数的支持（由 @MariusVolkhart 在 #4590 中贡献）
- [PostgreSQL Dialect] 添加 generate_series PostgreSQL 函数（由 @griffio 在 #4717 中贡献）
- [PostgreSQL Dialect] 添加额外的 Postgres 字符串函数定义（由 @MariusVolkhart 在 #4752 中贡献）
- [PostgreSQL Dialect] 为 min 和 max 聚合函数添加 DATE PostgreSQL 类型（由 @anddani 在 #4816 中贡献）
- [PostgreSQL Dialect] 将 PostgreSQL 时间类型添加到 SqlBinaryExpr（由 @griffio 在 #4657 中贡献）
- [PostgreSQL Dialect] 为 postgres 方言添加 TRUNCATE（由 @de-luca 在 #4817 中贡献）
- [SQLite 3.35 Dialect] 允许按顺序求值的多个 ON CONFLICT 子句（由 @griffio 在 #4551 中贡献）
- [JDBC Driver] 添加 Language 注解，提供更舒适的 SQL 编辑体验（由 @MariusVolkhart 在 #4602 中贡献）
- [Native Driver] Native-driver：添加对 linuxArm64 的支持（由 @hfhbd 在 #4792 中贡献）
- [Android Driver] 为 AndroidSqliteDriver 添加 windowSizeBytes 形参（由 @BoD 在 #4804 中贡献）
- [Paging3 Extension] 特性：为 OffsetQueryPagingSource 添加 initialOffset（由 @MohamadJaara 在 #4802 中贡献）

### 变更
- [Compiler] 在合适的地方优先使用 Kotlin 类型（由 @eygraber 在 #4517 中贡献）
- [Compiler] 执行值类型插入时始终包含列名（#4864）
- [PostgreSQL Dialect] 移除 PostgreSQL 方言的实验性状态（由 @hfhbd 在 #4443 中贡献）
- [PostgreSQL Dialect] 更新 PostgreSQL 类型的文档（由 @MariusVolkhart 在 #4569 中贡献）
- [R2DBC Driver] 优化处理 PostgreSQL 中整数数据类型时的性能（由 @MariusVolkhart 在 #4588 中贡献）

### 移除 {id="removed"}
- [SQLite Javascript Driver] 移除 sqljs-driver（由 @dellisd 在 #4613、#4670 中贡献）

### 修复
- [Compiler] 修复带返回值且无形参的分组语句的编译问题（由 @griffio 在 #4699 中贡献）
- [Compiler] 将实参与 SqlBinaryExpr 绑定（由 @griffio 在 #4604 中贡献）
- [IDE Plugin] 若已设置，则使用 IDEA 项目 JDK（由 @griffio 在 #4689 中贡献）
- [IDE Plugin] 修复 IDEA 2023.2 及更高版本中的“Unknown element type: TYPE_NAME”错误（#4727）
- [IDE Plugin] 修复与 2023.2 的一些兼容性问题
- [Gradle Plugin] 更正 verifyMigrationTask Gradle 任务的文档（由 @joshfriend 在 #4713 中贡献）
- [Gradle Plugin] 添加 Gradle 任务输出消息，帮助用户在验证数据库之前先生成数据库（由 @jingwei99 在 #4684 中贡献）
- [PostgreSQL Dialect] 修复多次重命名 PostgreSQL 列的问题（由 @griffio 在 #4566 中贡献）
- [PostgreSQL Dialect] 修复 4714 PostgreSQL alter column 为 null 性问题（由 @griffio 在 #4831 中贡献）
- [PostgreSQL Dialect] 修复 4837 alter table alter column（由 @griffio 在 #4846 中贡献）
- [PostgreSQL Dialect] 修复 4501 PostgreSQL sequence（由 @griffio 在 #4528 中贡献）
- [SQLite Dialect] 允许在列选表达式上使用 JSON 二元运算符（由 @eygraber 在 #4776 中贡献）
- [SQLite Dialect] 修复 Update From 中误报存在多个同名列的问题（由 @eygraber 在 #4777 中贡献）
- [Native Driver] 支持具名内存数据库（由 @05nelsonm 在 #4662 中贡献）
- [Native Driver] 确保查询监听器集合的线程安全（由 @kpgalligan 在 #4567 中贡献）
- [JDBC Driver] 修复 ConnectionManager 中的连接泄漏问题（由 @MariusVolkhart 在 #4589 中贡献）
- [JDBC Driver] 修复选择 ConnectionManager 类型时的 JdbcSqliteDriver url 解析问题（由 @05nelsonm 在 #4656 中贡献）

## [2.0.0] - 2023-07-26 {id="2-0-0-2023-07-26"}
[2.0.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0

### 新增
- [MySQL Dialect] MySQL：在 IF 表达式中支持 timestamp/bigint（由 @shellderp 在 #4329 中贡献）
- [MySQL Dialect] MySQL：添加 now（由 @hfhbd 在 #4431 中贡献）
- [Web Driver] 支持 NPM 软件包发布（#4364）
- [IDE Plugin] 允许用户在 Gradle 工具连接失败时显示堆栈跟踪（#4383）

### 变更
- [Sqlite Driver] 简化 JdbcSqliteDriver 的架构迁移使用方式（由 @morki 在 #3737 中贡献）
- [R2DBC Driver] 真正的异步 R2DBC 游标（由 @hfhbd 在 #4387 中贡献）

### 修复
- [IDE Plugin] 直到需要时才实例化数据库项目服务（#4382）
- [IDE Plugin] 在查找用例期间处理进程取消情况（#4340）
- [IDE Plugin] 修复异步代码的 IDE 生成问题（#4406）
- [IDE Plugin] 将包结构的组装改为一次性计算，并移出 EDT（#4417）
- [IDE Plugin] 在 2023.2 上使用正确的存根索引键进行 Kotlin 类型解析（#4416）
- [IDE Plugin] 在执行搜索前等待索引准备就绪（#4419）
- [IDE Plugin] 若索引不可用则不执行转到操作（#4420）
- [Compiler] 修复分组语句的结果表达式（#4378）
- [Compiler] 不将虚表作为接口类型使用（由 @hfhbd 在 #4427 中贡献）

## [2.0.0-rc02] - 2023-06-27 {id="2-0-0-rc02-2023-06-27"}
[2.0.0-rc02]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-rc02

### 新增
- [MySQL Dialect] 支持小写日期类型以及日期类型上的 min 和 max（由 @shellderp 在 #4243 中贡献）
- [MySQL Dialect] 支持二元表达式和 sum 的 MySQL 类型（由 @shellderp 在 #4254 中贡献）
- [MySQL Dialect] 支持不带显示宽度的无符号整数（由 @shellderp 在 #4306 中贡献）
- [MySQL Dialect] 支持 LOCK IN SHARED MODE
- [PostgreSQL Dialect] 为 min max 添加 boolean 和 Timestamp 支持（由 @griffio 在 #4245 中贡献）
- [PostgreSQL Dialect] Postgres：添加窗口函数支持（由 @hfhbd 在 #4283 中贡献）
- [Runtime] 为运行时添加 linuxArm64、androidNative 和 watchosDeviceArm 目标（由 @hfhbd 在 #4258 中贡献）
- [Paging Extension] 为分页扩展添加 linux 和 mingw x64 目标（由 @chippman 在 #4280 中贡献）

### 变更
- [Gradle Plugin] 为 Android API 34 添加自动方言支持（#4251）
- [Paging Extension] 在 QueryPagingSource 中添加对 SuspendingTransacter 的支持（由 @daio 在 #4292 中贡献）
- [Runtime] 改进 addListener API（由 @hfhbd 在 #4244 中贡献）
- [Runtime] 使用 Long 作为迁移版本号（由 @hfhbd 在 #4297 中贡献）

### 修复
- [Gradle Plugin] 为生成的源码使用稳定的输出路径（由 @joshfriend 在 #4269 中贡献）
- [Gradle Plugin] Gradle 微调（由 @3flex 在 #4222 中贡献）

## [2.0.0-rc01] - 2023-05-29 {id="2-0-0-rc01-2023-05-29"}
[2.0.0-rc01]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-rc01

### 新增
- [Paging] 为分页扩展添加 js 浏览器目标（由 @sproctor 在 #3843 中贡献）
- [Paging] 为 androidx-paging3 扩展添加 iosSimulatorArm64 目标（#4117）
- [PostgreSQL Dialect] 添加对 gen_random_uuid() 的支持和测试（由 @davidwheeler123 在 #3855 中贡献）
- [PostgreSQL Dialect] Postgres alter table add constraint（由 @griffio 在 #4116 中贡献）
- [PostgreSQL Dialect] Alter table add constraint check（由 @griffio 在 #4120 中贡献）
- [PostgreSQL Dialect] 添加 PostgreSQL 字符长度函数（由 @griffio 在 #4121 中贡献）
- [PostgreSQL Dialect] 添加 PostgreSQL 列默认 interval（由 @griffio 在 #4142 中贡献）
- [PostgreSQL Dialect] 添加 PostgreSQL interval 列结果（由 @griffio 在 #4152 中贡献）
- [PostgreSQL Dialect] 添加 PostgreSQL Alter Column（由 @griffio 在 #4165 中贡献）
- [PostgreSQL Dialect] PostgreSQL：添加 date_part（由 @hfhbd 在 #4198 中贡献）
- [MySQL Dialect] 添加 SQL 字符长度函数（由 @griffio 在 #4134 中贡献）
- [IDE Plugin] 添加 sqldelight 目录建议（由 @aperfilyev 在 #3976 中贡献）
- [IDE Plugin] 在项目树中紧凑显示中间包（由 @aperfilyev 在 #3992 中贡献）
- [IDE Plugin] 添加 join 子句补全（由 @aperfilyev 在 #4086 中贡献）
- [IDE Plugin] 创建视图的意图操作与实时模板（由 @aperfilyev 在 #4074 中贡献）
- [IDE Plugin] 针对 DELETE 或 UPDATE 中缺失 WHERE 发出警告（由 @aperfilyev 在 #4058 中贡献）
- [Gradle Plugin] 启用类型安全项目访问器（by @hfhbd 在 #4005 中贡献）

### 变更
- [Gradle Plugin] 允许通过 ServiceLoader 机制为 VerifyMigrationTask 注册 DriverInitializer（由 @C2H6O 在 #3986 中贡献）
- [Gradle Plugin] 创建显式编译器环境（由 @hfhbd 在 #4079 中贡献）
- [JS Driver] 将 Web Worker 驱动程序拆分为单独的构件
- [JS Driver] 不公开 JsWorkerSqlCursor（由 @hfhbd 在 #3874 中贡献）
- [JS Driver] 禁用 sqljs 驱动程序的发布（#4108）
- [Runtime] 强制同步驱动程序必须使用同步架构初始化器（#4013）
- [Runtime] 改进游标（Cursor）的异步支持（#4102）
- [Runtime] 移除已弃用的目标平台（由 @hfhbd 在 #4149 中贡献）
- [Runtime] 移除对旧内存模型（MM）的支持（由 @hfhbd 在 #4148 中贡献）

### 修复
- [R2DBC Driver] R2DBC：等待关闭驱动程序（由 @hfhbd 在 #4139 中贡献）
- [Compiler] 在 database create(SqlDriver) 中包含来自迁移的 PRAGMA（由 @MariusVolkhart 在 #3845 中贡献）
- [Compiler] 修复 RETURNING 子句的代码生成（由 @MariusVolkhart 在 #3872 中贡献）
- [Compiler] 不为虚表生成类型（#4015）
- [Gradle Plugin] Gradle 插件的小体验优化（由 @zacsweers 在 #3930 中贡献）
- [IDE Plugin] 修复未解析的 Kotlin 类型（由 @aperfilyev 在 #3924 中贡献）
- [IDE Plugin] 修复展开通配符意图操作以支持限定符（由 @aperfilyev 在 #3979 中贡献）
- [IDE Plugin] 若缺少 java home，则使用可用的 JDK（由 @aperfilyev 在 #3925 中贡献）
- [IDE Plugin] 修复包名上的查找用例（#4010）
- [IDE Plugin] 不为无效元素显示自动导入（#4008）
- [IDE Plugin] 若缺少方言则不进行解析（#4009）
- [IDE Plugin] 在处于失效状态期间忽略 IDE 的编译器运行（#4016）
- [IDE Plugin] 添加对 IntelliJ 2023.1 的支持（由 @madisp 在 #4037 中贡献）
- [IDE Plugin] 重命名列时重命名指定实参的用法（由 @aperfilyev 在 #4027 中贡献）
- [IDE Plugin] 修复添加迁移弹出窗口（由 @aperfilyev 在 #4105 中贡献）
- [IDE Plugin] 在迁移文件中禁用 SchemaNeedsMigrationInspection（由 @aperfilyev 在 #4106 中贡献）
- [IDE Plugin] 迁移生成时使用 SQL 列名而非类型名称（由 @aperfilyev 在 #4112 中贡献）

## [2.0.0-alpha05] - 2023-01-20 {id="2-0-0-alpha05-2023-01-20"}
[2.0.0-alpha05]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha05

### 新增
- [Paging] 多平台分页扩展（由 @jeffdgr8 贡献）
- [Runtime] 为 Listener 接口添加 fun 修饰符。
- [SQLite Dialect] 添加 SQLite 3.33 支持 (UPDATE FROM)（由 @eygraber 贡献）
- [PostgreSQL Dialect] 在 PostgreSQL 中支持 UPDATE FROM（由 @eygraber 贡献）

### 变更
- [RDBC Driver] 公开连接（由 @hfhbd 贡献）
- [Runtime] 将迁移回调移动到主 `migrate` 函数中
- [Gradle Plugin] 对下游项目隐藏配置
- [Gradle Plugin] 仅对 IntelliJ 打包遮蔽（shade）（由 @hfhbd 贡献）
- [Gradle Plugin] 支持 Kotlin 1.8.0-Beta 并添加多版本 Kotlin 测试（由 @hfhbd 贡献）

### 修复
- [RDBC Driver] 改用 javaObjectType（由 @hfhbd 贡献）
- [RDBC Driver] 修复 bindStatement 中的基本类型 null 值（由 @hfhbd 贡献）
- [RDBC Driver] 支持 R2DBC 1.0（由 @hfhbd 贡献）
- [PostgreSQL Dialect] Postgres：修复不带类型形参的 Array（由 @hfhbd 贡献）
- [IDE Plugin] 将 IntelliJ 升级至 221.6008.13（由 @hfhbd 贡献）
- [Compiler] 从纯视图解析递归源表（由 @hfhbd 贡献）
- [Compiler] 使用表外键子句中的值类（value classes）（由 @hfhbd 贡献）
- [Compiler] 修复 SelectQueryGenerator 以支持不带圆括号的绑定表达式（由 @bellatoris 贡献）
- [Compiler] 修复使用事务时重复生成 ${name}Indexes 变量的问题（由 @sachera 贡献）

## [1.5.5] - 2023-01-20 {id="1-5-5-2023-01-20"}
[1.5.5]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.5

这是针对 Kotlin 1.8 和 IntelliJ 2021+ 的兼容性版本，支持 JDK 17。

## [1.5.4] - 2022-10-06 {id="1-5-4-2022-10-06"}
[1.5.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.4

这是针对 Kotlin 1.7.20 和 AGP 7.3.0 的兼容性更新。

## [2.0.0-alpha04] - 2022-10-03 {id="2-0-0-alpha04-2022-10-03"}
[2.0.0-alpha04]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha04

### 破坏性变更 {id="breaking-changes"}

- Paging 3 扩展 API 已更改为仅允许使用 int 类型作为计数。
- 协程扩展现在要求传入一个调度器，不再提供默认值。
- Dialect 和 Driver 类现为 final 类，请改用委托。

### 新增
- [HSQL Dialect] Hsql：支持在 Insert 中对生成列使用 DEFAULT（由 @hfhbd 在 #3372 中贡献）
- [PostgreSQL Dialect] PostgreSQL：支持在 INSERT 中对生成列使用 DEFAULT（由 @hfhbd 在 #3373 中贡献）
- [PostgreSQL Dialect] 为 PostgreSQL 添加 NOW()（由 @hfhbd 在 #3403 中贡献）
- [PostgreSQL Dialect] PostgreSQL 添加 NOT 运算符（由 @hfhbd 在 #3504 中贡献）
- [Paging] 允许将 CoroutineContext 传入 *QueryPagingSource（#3384）
- [Gradle Plugin] 为方言添加更好的版本目录支持（#3435）
- [Native Driver] 添加用于挂钩 NativeSqliteDriver 的 DatabaseConfiguration 创建的回调（由 @svenjacobs 在 #3512 中贡献）

### 变更
- [Paging] 为基于 KeyedQueryPagingSource 的 QueryPagingSource 函数添加默认调度器（#3385）
- [Paging] 使 OffsetQueryPagingSource 仅支持 Int（#3386）
- [Async Runtime] 将 await* 移动至上层类 ExecutableQuery（由 @hfhbd 在 #3524 中贡献）
- [Coroutines Extensions] 移除 flow 扩展的默认形参（#3489）

### 修复
- [Gradle Plugin] 更新至 Kotlin 1.7.20（由 @zacsweers 在 #3542 中贡献）
- [R2DBC Driver] 采纳 R2DBC 中并不总是发送值的更改（由 @hfhbd 在 #3525 中贡献）
- [HSQL Dialect] 修复在 Hsql 下 SQLite VerifyMigrationTask 失败的问题（由 @hfhbd 在 #3380 中贡献）
- [Gradle Plugin] 将任务转换为使用延迟配置 API（由 @3flex 贡献）
- [Gradle Plugin] 避免 Kotlin 1.7.20 中的 NPE（由 @ZacSweers 在 #3398 中贡献）
- [Gradle Plugin] 修复压缩（合并）迁移任务的描述（#3449）
- [IDE Plugin] 修复较新 Kotlin 插件中的 NoSuchFieldError（由 @madisp 在 #3422 中贡献）
- [IDE Plugin] IDEA：UnusedQueryInspection - 修复 ArrayIndexOutOfBoundsException（由 @vanniktech 在 #3427 中贡献）
- [IDE Plugin] 对旧版 Kotlin 插件引用使用反射
- [Compiler] 带有扩展函数的自定义方言不再创建导入（由 @hfhbd 在 #3338 中贡献）
- [Compiler] 修复转义 CodeBlock.of("${CodeBlock.toString()}")（由 @hfhbd 在 #3340 中贡献）
- [Compiler] 等待迁移中的异步 execute 语句（#3352）
- [Compiler] 修复 AS（由 @hfhbd 在 #3370 中贡献）
- [Compiler] `getObject` 方法支持自动填充实际类型（由 @robxyy 在 #3401 中贡献）
- [Compiler] 修复异步分组 returning 语句的代码生成（#3411）
- [Compiler] 尽可能推断绑定形参的 Kotlin 类型，否则提供更好的错误消息（由 @hfhbd 在 #3413 中贡献）
- [Compiler] 禁止 ABS("foo")（由 @hfhbd 在 #3430 中贡献）
- [Compiler] 支持从其他形参推断 Kotlin 类型（由 @hfhbd 在 #3431 中贡献）
- [Compiler] 始终创建数据库实现（由 @hfhbd 在 #3540 中贡献）
- [Compiler] 放宽 JavaDoc 限制，并将其也添加到自定义映射器函数中（由 @hfhbd 在 #3554 中贡献）
- [Compiler] 修复绑定中的 DEFAULT（由 @hfhbd 贡献）
- [Paging] 修复 Paging 3（#3396）
- [Paging] 允许使用 Long 构建 OffsetQueryPagingSource（#3409）
- [Paging] 不进行 Dispatchers.Main 的静态替换（#3428）

## [2.0.0-alpha03] - 2022-06-17 {id="2-0-0-alpha03-2022-06-17"}
[2.0.0-alpha03]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha03

### 破坏性变更

- 方言现在像普通的 Gradle 依赖项一样被引用。
```groovy
sqldelight {
  MyDatabase {
    dialect("app.cash.sqldelight:postgres-dialect:2.0.0-alpha03")
  }
}
```
- `AfterVersionWithDriver` 类型已被移除，改用始终包含驱动程序的 `AfterVersion`。
- `Schema` 类型不再是 `SqlDriver` 的子类型。
- `PreparedStatement` API 现在采用从零开始的索引调用。

### 新增
- [IDE Plugin] 添加了对在运行中的数据库上执行 SQLite、MySQL 和 PostgreSQL 命令的支持（由 @aperfilyev 在 #2718 中贡献）
- [IDE Plugin] 添加对 Android Studio 数据库检查器（Database Inspector）的支持（由 @aperfilyev 在 #3107 中贡献）
- [Runtime] 添加对异步驱动程序的支持（由 @dellisd 在 #3168 中贡献）
- [Native Driver] 支持新的 Kotlin/Native 内存模型（由 @kpgalligan 在 #3177 中贡献）
- [JS Driver] 为 SqlJs worker 添加驱动程序（由 @dellisd 在 #3203 中贡献）
- [Gradle Plugin] 公开 SQLDelight 任务的类路径（classpath）
- [Gradle Plugin] 添加用于压缩（合并）迁移的 Gradle 任务
- [Gradle Plugin] 添加在迁移检查期间忽略架构定义的标志
- [MySQL Dialect] 在 MySQL 中支持 FOR SHARE 和 FOR UPDATE（#3098）
- [MySQL Dialect] 支持 MySQL 索引提示（index hints）（#3099）
- [PostgreSQL Dialect] 添加 date_trunc（由 @hfhbd 在 #3295 中贡献）
- [JSON Extensions] 支持 JSON 表函数（#3090）

### 变更
- [Runtime] 移除不带驱动程序的 AfterVersion 类型（#3091）
- [Runtime] 将 Schema 类型移至顶级
- [Runtime] 开放方言和解析器以支持第三方实现（由 @hfhbd 在 #3232 中贡献）
- [Compiler] 在失败报告中包含用于编译的方言（#3086）
- [Compiler] 跳过未使用的适配器（由 @eygraber 在 #3162 中贡献）
- [Compiler] 在 PrepareStatement 中使用从零开始的索引（由 @hfhbd 在 #3269 中贡献）
- [Gradle Plugin] 方言配置从字符串改为标准的 Gradle 依赖项（#3085）
- [Gradle Plugin] Gradle 验证任务：当缺少数据库文件时抛出异常（由 @vanniktech 在 #3126 中贡献）

### 修复
- [Gradle Plugin] 对 Gradle 插件进行小规模清理和微调（由 @3flex 在 #3171 中贡献）
- [Gradle Plugin] 不对生成目录使用 AGP 字符串
- [Gradle Plugin] 使用 AGP namespace 特性（#3220）
- [Gradle Plugin] 不将 kotlin-stdlib 作为 Gradle 插件的运行时依赖项添加（由 @mbonnin 在 #3245 中贡献）
- [Gradle Plugin] 简化多平台配置（由 @mbonnin 在 #3246 中贡献）
- [Gradle Plugin] 支持纯 JS 项目（由 @hfhbd 在 #3310 中贡献）
- [IDE Plugin] 为 Gradle Tooling API 使用 java home（#3078）
- [IDE Plugin] 在 IDE 插件内部的正确类加载器上加载 JDBC 驱动程序（#3080）
- [IDE Plugin] 在使元素失效前将文件元素标记为 null，以避免现有 PSI 更改期间出现错误（#3082）
- [IDE Plugin] 修复在 ALTER TABLE 语句中查找新表名用例时崩溃的问题（#3106）
- [IDE Plugin] 优化检查器（inspectors），使其在遇到预期异常类型时静默失败（#3121）
- [IDE Plugin] 删除本应为生成目录的文件（#3198）
- [IDE Plugin] 修复非安全运算符调用
- [Compiler] 确保带有 RETURNING 语句的 update 和 delete 执行查询（#3084）
- [Compiler] 正确推断复合 select 中的实参类型（#3096）
- [Compiler] 通用表不生成数据类，因此不再返回它们（#3097）
- [Compiler] 更快地找到最顶层的迁移文件（#3108）
- [Compiler] 在管道运算符上正确继承为 null 性
- [Compiler] 支持 ANSI SQL 的 iif 函数
- [Compiler] 不生成空的查询文件（由 @hfhbd 在 #3300 中贡献）
- [Compiler] 修复仅带问号的适配器（由 @hfhbd 在 #3314 中贡献）
- [PostgreSQL Dialect] Postgres 主键列始终不可为 null（#3092）
- [PostgreSQL Dialect] 修复多个表中使用相同名称的 copy 问题（由 @hfhbd 在 #3297 中贡献）
- [SQLite 3.35 Dialect] 仅在从修改的表中删除已建立索引的列时显示错误（由 @eygraber 在 #3158 中贡献）

## [2.0.0-alpha02] - 2022-04-13 {id="2-0-0-alpha02-2022-04-13"}
[2.0.0-alpha02]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha02

### 破坏性变更

- 您需要将所有 `app.cash.sqldelight.runtime.rx` 替换为 `app.cash.sqldelight.rx2`

### 新增
- [Compiler] 支持在分组语句末尾使用 returning
- [Compiler] 通过方言模块支持编译器扩展，并添加 SQLite JSON 扩展（#1379, #2087）
- [Compiler] 支持带返回值的 PRAGMA 语句（#1106）
- [Compiler] 支持为标记的列生成值类型
- [Compiler] 添加对乐观锁与校验的支持（#1952）
- [Compiler] 支持多更新语句
- [PostgreSQL] 支持 PostgreSQL returning 语句
- [PostgreSQL] 支持 PostgreSQL 日期类型
- [PostgreSQL] 支持 PG intervals
- [PostgreSQL] 支持 PG Booleans 并修复 alter table 上的 insert
- [PostgreSQL] 支持 Postgres 中的可选 limits
- [PostgreSQL] 支持 PG BYTEA 类型
- [PostgreSQL] 添加 Postgres serials 测试
- [PostgreSQL] 支持 PostgreSQL for update 语法
- [PostgreSQL] 支持 PostgreSQL 数组类型
- [PostgreSQL] 在 PG 中正确存储/读取 UUID 类型
- [PostgreSQL] 支持 PostgreSQL NUMERIC 类型（#1882）
- [PostgreSQL] 支持在通用表表达式内返回查询（#2471）
- [PostgreSQL] 支持 JSON 特定运算符
- [PostgreSQL] 添加 Postgres Copy（由 @hfhbd 贡献）
- [MySQL] 支持 MySQL Replace
- [MySQL] 支持 NUMERIC/BigDecimal MySQL 类型（#2051）
- [MySQL] 支持 MySQL truncate 语句
- [MySQL] 支持 MySQL 中的 JSON 特定运算符（由 @eygraber 贡献）
- [MySQL] 支持 MySQL INTERVAL（由 @eygraber 在 #2969 中贡献）
- [HSQL] 添加 HSQL Window 功能
- [SQLite] 不替换 WHERE 中可空形参的相等性检查（由 @eygraber 在 #1490 中贡献）
- [SQLite] 支持 SQLite 3.35 returning 语句（由 @eygraber 在 #1490 中贡献）
- [SQLite] 支持 GENERATED 子句
- [SQLite] 添加对 SQLite 3.38 方言的支持（由 @eygraber 贡献）

### 变更
- [Compiler] 对生成的代码进行了微调清理
- [Compiler] 禁止在分组语句中使用表形参（#1822）
- [Compiler] 将分组查询置于事务内（#2785）
- [Runtime] 从驱动程序的 execute 方法返回受影响的行数
- [Runtime] 将 SqlCursor 限制在访问连接的临界区内（由 @andersio 在 #2123 中贡献）
- [Gradle Plugin] 比较迁移的架构定义（#841）
- [PostgreSQL] PG 禁止使用双引号
- [MySQL] 在 MySQL 中使用 == 时报错（#2673）

### 修复
- [Compiler] 来自不同表的相同适配器类型在 2.0 alpha 中导致编译错误的问题
- [Compiler] 编译 upsert 语句时的问题（#2791）
- [Compiler] 当存在多个匹配项时，查询结果应使用 select 中的表（#1874, #2313）
- [Compiler] 支持更新带有 INSTEAD OF 触发器的视图（#1018）
- [Compiler] 支持函数名中使用 from 和 for
- [Compiler] 允许在函数表达式中使用 SEPARATOR 关键字
- [Compiler] 无法在 ORDER BY 中访问别名表的 ROWID 的问题
- [Compiler] 在 MySQL 的 HAVING 子句中无法识别别名列名的问题
- [Compiler] 修复错误的“Multiple columns found”错误
- [Compiler] 无法设置 PRAGMA locking_mode = EXCLUSIVE 的问题；
- [PostgreSQL] PostgreSQL 重命名列
- [MySQL] 无法识别 UNIX_TIMESTAMP、TO_SECONDS、JSON_ARRAYAGG MySQL 函数的问题
- [SQLite] 修复 SQLite window 功能
- [IDE Plugin] 在空进度指示器中运行转到（goto）处理程序（#2990）
- [IDE Plugin] 确保若项目未配置则不运行高亮访问器（#2981, #2976）
- [IDE Plugin] 确保传递生成的代码在 IDE 中也能更新（#1837）
- [IDE Plugin] 更新方言时使索引失效

## [2.0.0-alpha01] - 2022-03-31 {id="2-0-0-alpha01-2022-03-31"}
[2.0.0-alpha01]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha01

这是 2.0 的首个 Alpha 版本，包含一些破坏性变更。我们预计未来会有更多 ABI 破坏性变更，因此请勿发布依赖此版本的库（应用程序使用不受影响）。

### 破坏性变更

- 首先，您需要将所有 `com.squareup.sqldelight` 替换为 `app.cash.sqldelight`
- 其次，您需要将所有 `app.cash.sqldelight.android` 替换为 `app.cash.sqldelight.driver.android`
- 第三，您需要将所有 `app.cash.sqldelight.sqlite.driver` 替换为 `app.cash.sqldelight.driver.jdbc.sqlite`
- 第四，您需要将所有 `app.cash.sqldelight.drivers.native` 替换为 `app.cash.sqldelight.driver.native`
- IDE 插件必须更新至 2.X 版本，可在 [alpha 或 eap 渠道](https://plugins.jetbrains.com/plugin/8191-sqldelight/versions/alpha) 中获取
- 方言现在是依赖项，可以在 Gradle 中指定：

```gradle
sqldelight {
  MyDatabase {
    packageName = "com.example"
    dialect = "app.cash.sqldelight:mysql-dialect:2.0.0-alpha01"
  }
}
```

当前支持的方言包括 `mysql-dialect`、`postgresql-dialect`、`hsql-dialect`、`sqlite-3-18-dialect`、`sqlite-3-24-dialect`、`sqlite-3-25-dialect`、`sqlite-3-30-dialect` 和 `sqlite-3-35-dialect`

- 基本类型现在必须导入（例如 `INTEGER AS Boolean`，您必须 `import kotlin.Boolean`），某些之前支持的类型现在需要适配器。大多数转换的基本类型适配器可在 `app.cash.sqldelight:primitive-adapters:2.0.0-alpha01` 中获取（例如用于 `Integer AS kotlin.Int` 的 `IntColumnAdapter`）。

### 新增
- [IDE Plugin] 基础迁移建议（由 @aperfilyev 贡献）
- [IDE Plugin] 添加导入提示操作（由 @aperfilyev 贡献）
- [IDE Plugin] 添加 Kotlin 类补全（由 @aperfilyev 贡献）
- [Gradle Plugin] 为 Gradle 类型安全项目访问器添加快捷方式（由 @hfhbd 贡献）
- [Compiler] 根据方言自定义代码生成（由 @MariusVolkhart 贡献）
- [JDBC Driver] 为 JdbcDriver 添加通用类型（由 @MariusVolkhart 贡献）
- [SQLite] 添加对 SQLite 3.35 的支持（由 @eygraber 贡献）
- [SQLite] 添加对 ALTER TABLE DROP COLUMN 的支持（由 @eygraber 贡献）
- [SQLite] 添加对 SQLite 3.30 方言的支持（由 @eygraber 贡献）
- [SQLite] 在 SQLite 中支持 NULLS FIRST/LAST（由 @eygraber 贡献）
- [HSQL] 为 HSQL 添加 generated 子句支持（由 @MariusVolkhart 贡献）
- [HSQL] 为 HSQL 添加具名形参支持（由 @MariusVolkhart 贡献）
- [HSQL] 自定义 HSQL 插入查询（由 @MariusVolkhart 贡献）

### 变更
- [全局] 包名已由 com.squareup.sqldelight 变更为 app.cash.sqldelight。
- [Runtime] 将方言移动至各自独立的 Gradle 模块中
- [Runtime] 切换为由驱动程序实现的查询通知机制。
- [Runtime] 将默认列适配器提取到独立模块中（#2056, #2060）
- [Compiler] 由各模块自行生成查询实现，而非在每个模块中重复生成
- [Compiler] 移除生成数据类的自定义 toString 生成逻辑（由 @PaulWoitaschek 贡献）
- [JS Driver] 从 sqljs-driver 中移除 sql.js 依赖（由 @dellisd 贡献）
- [Paging] 移除 Android Paging 2 扩展
- [IDE Plugin] 在 SQLDelight 同步期间添加编辑器横幅提示（#2511）
- [IDE Plugin] 最低支持的 IntelliJ 版本为 2021.1

### 修复
- [Runtime] 展平监听器列表以减少分配和指针追踪（由 @andersio 贡献）
- [IDE Plugin] 修复错误消息以允许跳转至错误处（由 @hfhbd 贡献）
- [IDE Plugin] 补充缺失的检查描述（由 @aperfilyev 在 #2768 中贡献）
- [IDE Plugin] 修复 GotoDeclarationHandler 中的异常（由 @aperfilyev 在 #2531, #2688, #2804 中贡献）
- [IDE Plugin] 高亮显示 import 关键字（由 @aperfilyev 贡献）
- [IDE Plugin] 修复未解析的 Kotlin 类型（由 @aperfilyev 在 #1678 中贡献）
- [IDE Plugin] 修复未解析包的高亮显示（由 @aperfilyev 在 #2543 中贡献）
- [IDE Plugin] 若项目索引尚未初始化，则不尝试检查不匹配的列
- [IDE Plugin] 直到 Gradle 同步完成前不初始化文件索引
- [IDE Plugin] 如果 Gradle 同步开始，则取消 SQLDelight 导入
- [IDE Plugin] 在执行撤销操作的线程之外重新生成数据库
- [IDE Plugin] 如果引用无法解析，则使用空白的 Java 类型
- [IDE Plugin] 在文件解析期间正确移出主线程，仅在写入时切回
- [IDE Plugin] 提高与旧版本 IntelliJ 的兼容性（由 @3flex 贡献）
- [IDE Plugin] 使用更快的注解 API
- [Gradle Plugin] 在添加运行时显式支持 js/android 插件（由 @ZacSweers 贡献）
- [Gradle Plugin] 注册迁移输出任务，而不从迁移中推导架构（由 @kevincianfarini 在 #2744 中贡献）
- [Gradle Plugin] 若迁移任务崩溃，打印其崩溃时正在运行的文件
- [Gradle Plugin] 生成代码时对文件进行排序以确保幂等输出（由 @ZacSweers 贡献）
- [Compiler] 使用更快的 API 遍历文件，不再扫描整个 PSI 图
- [Compiler] 为 select 函数形参添加关键字修饰（mangling）（由 @aperfilyev 在 #2759 中贡献）
- [Compiler] 修复迁移适配器的 packageName（由 @hfhbd 贡献）
- [Compiler] 在属性而非类型上生成注解（由 @aperfilyev 在 #2798 中贡献）
- [Compiler] 传递给 Query 子类型前对实参进行排序（由 @aperfilyev 在 #2379 中贡献）

## [1.5.3] - 2021-11-23 {id="1-5-3-2021-11-23"}
[1.5.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.3

### 新增
- [JDBC Driver] 开放 JdbcDriver 以支持第三方驱动程序实现（由 @hfhbd 在 #2672 中贡献）
- [MySQL Dialect] 添加时间递增缺失的函数（由 @sdoward 在 #2671 中贡献）
- [Coroutines Extension] 为 coroutines-extensions 添加 M1 目标（由 @PhilipDukhov 贡献）

### 变更
- [Paging3 Extension] 将 sqldelight-android-paging3 作为 JAR 而非 AAR 分发（由 @julioromano 在 #2634 中贡献）
- 同时作为软关键字的属性名称现在将带有下划线后缀。例如，`value` 将公开为 `value_`

### 修复
- [Compiler] 不对重复的数组形参提取变量（由 @aperfilyev 贡献）
- [Gradle Plugin] 添加 kotlin.mpp.enableCompatibilityMetadataVariant（由 @martinbonnin 在 #2628 中贡献）
- [IDE Plugin] 查找用例处理需要读操作（Read Action）

## [1.5.2] - 2021-10-12 {id="1-5-2-2021-10-12"}
[1.5.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.2

### 新增
- [Gradle Plugin] 支持 HMPP（由 @martinbonnin 在 #2548 中贡献）
- [IDE Plugin] 添加 NULL 比较检查（由 @aperfilyev 贡献）
- [IDE Plugin] 添加检查抑制器（by @aperfilyev 在 #2519 中贡献）
- [IDE Plugin] 命名形参与位置形参混用检查（由 @aperfilyev 贡献）
- [SQLite Driver] 添加 mingwX86 目标（由 @enginegl 在 #2558 中贡献）
- [SQLite Driver] 添加 M1 目标
- [SQLite Driver] 添加 linuxX64 支持（由 @chippmann 在 #2456 中贡献）
- [MySQL Dialect] 为 MySQL 添加 ROW_COUNT 函数（#2523）
- [PostgreSQL Dialect] Postgres rename、drop column（由 @pabl0rg 贡献）
- [PostgreSQL Dialect] PostgreSQL 语法支持识别 CITEXT
- [PostgreSQL Dialect] 包含 TIMESTAMP WITH TIME ZONE 和 TIMESTAMPTZ
- [PostgreSQL Dialect] 为 PostgreSQL GENERATED 列添加语法支持
- [Runtime] 将 SqlDriver 作为实参提供给 AfterVersion（由 @ahmedre 在 #2534, 2614 中贡献）

### 变更
- [Gradle Plugin] 显式要求 Gradle 7.0（由 @martinbonnin 在 #2572 中贡献）
- [Gradle Plugin] 使 VerifyMigrationTask 支持 Gradle 的最新状态检查（up-to-date checks）（由 @3flex 在 #2533 中贡献）
- [IDE Plugin] 当将可空类型与不可空类型联结时，不再提示“Join compares two columns of different types”警告（由 @pchmielowski 在 #2550 中贡献）
- [IDE Plugin] 明确列类型中小写 'as' 的错误提示（由 @aperfilyev 贡献）

### 修复
- [IDE Plugin] 若项目已被处置（disposed），则不使用新方言重新解析（#2609）
- [IDE Plugin] 若关联的虚拟文件为 null，则模块为 null（#2607）
- [IDE Plugin] 避免在未使用的查询检查期间发生崩溃（#2610）
- [IDE Plugin] 在写操作中运行数据库同步写入（#2605）
- [IDE Plugin] 由 IDE 调度 SQLDelight 同步
- [IDE Plugin] 修复 JavaTypeMixin 中的 NPE（由 @aperfilyev 在 #2603 中贡献）
- [IDE Plugin] 修复 MismatchJoinColumnInspection 中的 IndexOutOfBoundsException（由 @aperfilyev 在 #2602 中贡献）
- [IDE Plugin] 为 UnusedColumnInspection 添加描述（由 @aperfilyev 在 #2600 中贡献）
- [IDE Plugin] 将 PsiElement.generatedVirtualFiles 包装进读操作中（由 @aperfilyev 在 #2599 中贡献）
- [IDE Plugin] 移除不必要的 nonnull 转换（#2596）
- [IDE Plugin] 正确处理查找用例中的 null 值（#2595）
- [IDE Plugin] 修复 Android 生成文件的 IDE 自动补全（由 @martinbonnin 在 #2573 中贡献）
- [IDE Plugin] 修复 SqlDelightGotoDeclarationHandler 中的 NPE（由 @aperfilyev 贡献）
- [IDE Plugin] 在 insert 语句的实参中修饰 Kotlin 关键字（由 @aperfilyev 在 #2433 中贡献）
- [IDE Plugin] 修复 SqlDelightFoldingBuilder 中的 NPE（由 @aperfilyev 在 #2382 中贡献）
- [IDE Plugin] 在 CopyPasteProcessor 中捕获 ClassCastException（由 @aperfilyev 在 #2369 中贡献）
- [IDE Plugin] 修复 update 实时模板（由 @IliasRedissi 贡献）
- [IDE Plugin] 为意图操作添加描述（由 @aperfilyev 在 #2489 中贡献）
- [IDE Plugin] 修复未找到表时 CreateTriggerMixin 中的异常（由 @aperfilyev 贡献）
- [Compiler] 对建表语句进行拓扑排序
- [Compiler] 停止在目录上调用 `forDatabaseFiles` 回调（#2532）
- [Gradle Plugin] 将 generateDatabaseInterface 任务依赖传播给潜在的使用者（由 @martinbonnin 在 #2518 中贡献）

## [1.5.1] - 2021-07-16 {id="1-5-1-2021-07-16"}
[1.5.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.1

### 新增
- [PostgreSQL Dialect] 支持 PostgreSQL JSONB 和 ON Conflict Do Nothing（由 @satook 贡献）
- [PostgreSQL Dialect] 添加对 PostgreSQL ON CONFLICT (column, ...) DO UPDATE 的支持（由 @satook 贡献）
- [MySQL Dialect] 支持 MySQL 生成列（由 @JGulbronson 贡献）
- [Native Driver] 添加 watchosX64 支持
- [IDE Plugin] 添加形参类型和注解（由 @aperfilyev 贡献）
- [IDE Plugin] 添加生成“select all”查询的操作（由 @aperfilyev 贡献）
- [IDE Plugin] 在自动补全中显示列类型（由 @aperfilyev 贡献）
- [IDE Plugin] 为自动补全添加图标（由 @aperfilyev 贡献）
- [IDE Plugin] 添加生成“select by primary key”查询的操作（由 @aperfilyev 贡献）
- [IDE Plugin] 添加生成“insert into”查询的操作（由 @aperfilyev 贡献）
- [IDE Plugin] 为列名、语句标识符、函数名添加高亮显示（由 @aperfilyev 贡献）
- [IDE Plugin] 添加其余的查询生成操作（由 @aperfilyev 在 #489 中贡献）
- [IDE Plugin] 显示来自 insert 语句的形参提示（由 @aperfilyev 贡献）
- [IDE Plugin] 表别名意图操作（由 @aperfilyev 贡献）
- [IDE Plugin] 限定列名意图操作（由 @aperfilyev 贡献）
- [IDE Plugin] 转到 Kotlin 属性的声明（由 @aperfilyev 贡献）

### 变更
- [Native Driver] 在可能的情况下避免冻结（freezing）和可共享数据结构，从而提高原生事务性能（由 @andersio 贡献）
- [Paging 3] 将 Paging3 版本升级至 3.0.0 稳定版
- [JS Driver] 将 sql.js 升级至 1.5.0

### 修复
- [JDBC SQLite Driver] 在清除 ThreadLocal 前调用连接的 close()（由 @hannesstruss 在 #2444 中贡献）
- [RX extensions] 修复订阅 / 处置竞态泄漏（由 @pyricau 在 #2403 中贡献）
- [Coroutines extension] 确保在发送通知前注册查询监听器
- [Compiler] 对 notifyQueries 排序以获得一致的 Kotlin 输出文件（由 @thomascjy 贡献）
- [Compiler] 不使用 @JvmField 注解 select 查询类的属性（由 @eygraber 贡献）
- [IDE Plugin] 修复导入优化器（由 @aperfilyev 在 #2350 中贡献）
- [IDE Plugin] 修复未使用的列检查（由 @aperfilyev 贡献）
- [IDE Plugin] 为导入检查和类注解器添加嵌套类支持（由 @aperfilyev 贡献）
- [IDE Plugin] 修复 CopyPasteProcessor 中的 NPE（由 @aperfilyev 在 #2363 中贡献）
- [IDE Plugin] 修复 InlayParameterHintsProvider 中的崩溃（由 @aperfilyev 在 #2359 中贡献）
- [IDE Plugin] 修复将任何文本复制粘贴到 create table 语句中时插入空行的问题（由 @aperfilyev 在 #2431 中贡献）

## [1.5.0] - 2021-04-23 {id="1-5-0-2021-04-23"}
[1.5.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.0

### 新增
- [SQLite Javascript Driver] 支持发布 sqljs-driver（由 @dellisd 在 #1667 中贡献）
- [Paging3 Extension] 针对 Android Paging 3 库的扩展（由 @kevincianfarini 在 #1786 中贡献）
- [MySQL Dialect] 添加对 MySQL ON DUPLICATE KEY UPDATE 冲突解决的支持（由 @rharter 贡献）
- [SQLite Dialect] 为 SQLite offsets() 添加编译器支持（由 @qjroberts 贡献）
- [IDE Plugin] 为未知类型添加导入快速修复（由 @aperfilyev 在 #683 中贡献）
- [IDE Plugin] 添加未使用的导入检查（由 @aperfilyev 在 #1161 中贡献）
- [IDE Plugin] 添加未使用的查询检查（由 @aperfilyev 贡献）
- [IDE Plugin] 添加未使用的列检查（由 @aperfilyev 在 #569 中贡献）
- [IDE Plugin] 复制/粘贴时自动带入导入项（由 @aperfilyev 在 #684 中贡献）
- [IDE Plugin] 当 Gradle/IntelliJ 插件版本不兼容时弹出气泡提示
- [IDE Plugin] Insert Into ... VALUES(?) 形参提示（由 @aperfilyev 在 #506 中贡献）
- [IDE Plugin] 内联形参提示（由 @aperfilyev 贡献）
- [Runtime] 在运行时中包含用于带回调运行迁移的 API（#1844）

### 变更
- [Compiler] 智能转换“IS NOT NULL”查询（#867）
- [Compiler] 防范在运行时会失败的关键字（#1471, #1629）
- [Gradle Plugin] 将 Gradle 插件大小从 60MB 缩减至 13MB。
- [Gradle Plugin] 正确支持 Android 变体，并移除对 KMM 特定目标 SQL 的支持（#1039）
- [Gradle Plugin] 根据 minsdk 选择最低 SQLite 版本（#1684）
- [Native Driver] 原生驱动程序连接池及性能更新

### 修复
- [Compiler] lambda 表达式前的 NBSP（由 @oldergod 贡献）
- [Compiler] 修复生成的 bind* 和 cursor.get* 语句中类型不兼容的问题
- [Compiler] SQL 子句应保留适配后的类型（#2067）
- [Compiler] 仅带有 NULL 关键字的列应可为 null
- [Compiler] 不生成带有类型注解的映射器 lambda（#1957）
- [Compiler] 如果自定义查询发生冲突，使用文件名作为额外的包后缀（#1057, #1278）
- [Compiler] 确保外键级联触发查询监听器通知（#1325, #1485）
- [Compiler] 如果对两个相同类型的项执行 union 操作，则返回表类型（#1342）
- [Compiler] 确保 ifnull 和 coalesce 的形参可以为 null（#1263）
- [Compiler] 正确将查询施加的为 null 性应用于表达式
- [MySQL Dialect] 支持 MySQL if 语句
- [PostgreSQL Dialect] 在 PostgreSQL 中将 NUMERIC 和 DECIMAL 作为 Double 获取（#2118）
- [SQLite Dialect] UPSERT 通知应考虑 BEFORE/AFTER UPDATE 触发器（由 @andersio 在 #2198 中贡献）
- [SQLite Driver] 在 SqliteDriver 中为线程使用多个连接，除非是内存数据库（#1832）
- [JDBC Driver] JDBC 驱动程序默认假设 autoCommit 为 true（#2041）
- [JDBC Driver] 确保在发生异常时关闭连接（#2306）
- [IDE Plugin] 修复由于路径分隔符错误导致 Windows 上 GoToDeclaration/FindUsages 失效的问题（由 @angusholder 在 #2054 中贡献）
- [IDE Plugin] 忽略 Gradle 错误，避免在 IDE 中崩溃。
- [IDE Plugin] 如果将 sqldelight 文件移动到非 sqldelight 模块，则不尝试生成代码
- [IDE Plugin] 忽略 IDE 中的代码生成错误
- [IDE Plugin] 确保不尝试执行负索引子字符串截取（#2068）
- [IDE Plugin] 确保在运行 Gradle 操作前项目未被处置（#2155）
- [IDE Plugin] 可空类型上的算术运算结果也应可为 null（#1853）
- [IDE Plugin] 使“展开 * 意图操作”支持额外的投影（由 @aperfilyev 在 #2173 中贡献）
- [IDE Plugin] 若在 GoTo 期间 Kotlin 解析失败，不尝试跳转到 sqldelight 文件
- [IDE Plugin] 如果 IntelliJ 在 SQLDelight 建立索引时遇到异常，避免崩溃
- [IDE Plugin] 处理 IDE 中代码生成前检测错误时发生的异常
- [IDE Plugin] 使 IDE 插件兼容动态插件（Dynamic Plugins）（#1536）
- [Gradle Plugin] 使用 WorkerApi 生成数据库时的竞态条件（由 @stephanenicolas 在 #2062 中贡献）
- [Gradle Plugin] classLoaderIsolation 阻止自定义 JDBC 使用的问题（由 @benasher44 在 #2048 中贡献）
- [Gradle Plugin] 改进缺少 packageName 时的错误消息（由 @vanniktech 贡献）
- [Gradle Plugin] SQLDelight 将 IntelliJ 依赖项泄漏到 buildscript 类路径上的问题（#1998）
- [Gradle Plugin] 修复 Gradle 构建缓存（#2075）
- [Gradle Plugin] Gradle 插件不再依赖 kotlin-native-utils（由 @ilmat192 贡献）
- [Gradle Plugin] 即使只有迁移文件也写入数据库（#2094）
- [Gradle Plugin] 确保在最终编译单元中菱形依赖仅被识别一次（#1455）

在此特别感谢 @3flex，他在本版本中为改进 SQLDelight 基础设施做出了大量贡献。

## [1.4.4] - 2020-10-08 {id="1-4-4-2020-10-08"}
[1.4.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.4

### 新增
- [PostgreSQL Dialect] 支持 WITH 中的数据修改语句
- [PostgreSQL Dialect] 支持 substring 函数
- [Gradle Plugin] 添加 verifyMigrations 标志，用于在 SQLDelight 编译期间验证迁移（#1872）

### 变更
- [Compiler] 在非 SQLite 方言中将 SQLite 特有函数标记为未知
- [Gradle Plugin] 当应用了 sqldelight 插件但未配置任何数据库时给出警告（#1421）

### 修复
- [Compiler] 在 ORDER BY 子句中绑定列名时报错（由 @eygraber 在 #1187 中贡献）
- [Compiler] 生成数据库接口时出现的注册表警告（#1792）
- [Compiler] case 语句类型推断不正确的问题（#1811）
- [Compiler] 为没有版本号的迁移文件提供更好的错误信息（#2006）
- [Compiler] 部分数据库类型的 ColumnAdapter 所需编组成数据库类型不正确的问题（#2012）
- [Compiler] CAST 的为 null 性问题（#1261）
- [Compiler] 查询包装器中大量的名字阴影（name shadowed）警告（由 @eygraber 在 #1946 中贡献）
- [Compiler] 生成的代码使用了完全限定名称（#1939）
- [IDE Plugin] 从 Gradle 同步触发 SQLDelight 代码生成
- [IDE Plugin] 更改 .sq 文件时插件未重新生成数据库接口的问题（#1945）
- [IDE Plugin] 将文件移动到新包时的问题（#444）
- [IDE Plugin] 如果光标无可移动位置，则不执行任何操作而非崩溃（#1994）
- [IDE Plugin] 对于 Gradle 项目之外的文件使用空包名（#1973）
- [IDE Plugin] 遇到无效类型时正常失败（#1943）
- [IDE Plugin] 遇到未知表达式时抛出更明确的错误消息（#1958）
- [Gradle Plugin] SQLDelight 将 IntelliJ 依赖项泄漏到 buildscript 类路径上的问题（#1998）
- [Gradle Plugin] 在 *.sq 文件中添加方法文档时出现“JavadocIntegrationKt not found”编译错误（#1982）
- [Gradle Plugin] SqlDelight Gradle 插件不支持配置缓存（CoCa）（由 @stephanenicolas 在 #1947 中贡献）
- [SQLite JDBC Driver] SQLException: database in auto-commit mode（#1832）
- [Coroutines Extension] 修复 coroutines-extensions 的 IR 后端问题（由 @dellisd 在 #1918 中贡献）

## [1.4.3] - 2020-09-04 {id="1-4-3-2020-09-04"}
[1.4.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.3

### 新增
- [MySQL Dialect] 添加对 MySQL last_insert_id 函数的支持（由 @lawkai 贡献）
- [PostgreSQL Dialect] 支持 SERIAL 数据类型（由 @veyndan 与 @felipecsl 贡献）
- [PostgreSQL Dialect] 支持 PostgreSQL RETURNING（由 @veyndan 贡献）

### 修复
- [MySQL Dialect] 将 MySQL AUTO_INCREMENT 视为具有默认值（#1823）
- [Compiler] 修复 Upsert 语句编译器错误（由 @eygraber 在 #1809 中贡献）
- [Compiler] 修复生成无效 Kotlin 代码的问题（由 @eygraber 在 #1925 中贡献）
- [Compiler] 为未知函数提供更明确的错误消息（#1843）
- [Compiler] 将 string 作为 instr 第二个形参的类型公开
- [IDE Plugin] 修复 IDE 插件的守护进程膨胀及 UI 线程停顿问题（#1916）
- [IDE Plugin] 处理模块为 null 的场景（#1902）
- [IDE Plugin] 在未配置的 sq 文件中返回空字符串作为包名（#1920）
- [IDE Plugin] 修复分组语句并为其添加集成测试（#1820）
- [IDE Plugin] 使用内置的 ModuleUtil 查找元素的模块（#1854）
- [IDE Plugin] 仅向查找表中添加有效元素（#1909）
- [IDE Plugin] 父级可以为 null（#1857）

## [1.4.2] - 2020-08-27 {id="1-4-2-2020-08-27"}
[1.4.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.2

### 新增
- [Runtime] 支持新的 JS IR 后端
- [Gradle Plugin] 添加 generateSqlDelightInterface Gradle 任务（由 @vanniktech 贡献）
- [Gradle Plugin] 添加 verifySqlDelightMigration Gradle 任务（由 @vanniktech 贡献）

### 修复
- [IDE Plugin] 使用 Gradle Tooling API 促进 IDE 与 Gradle 之间的数据共享
- [IDE Plugin] 架构推导默认设为 false
- [IDE Plugin] 正确获取 commonMain 源集
- [MySQL Dialect] 为 mySqlFunctionType() 添加 minute（由 @maaxgr 贡献）

## [1.4.1] - 2020-08-21 {id="1-4-1-2020-08-21"}
[1.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.1

### 新增
- [Runtime] 支持 Kotlin 1.4.0（#1859）

### 变更
- [Gradle Plugin] 将 AGP 依赖项改为 compileOnly（#1362）

### 修复
- [Compiler] 为列定义规则和表接口生成器添加可选的 Javadoc（由 @endanke 在 #1224 中贡献）
- [SQLite Dialect] 添加对 SQLite FTS5 辅助函数 highlight、snippet 和 bm25 的支持（由 @drampelt 贡献）
- [MySQL Dialect] 支持 MySQL bit 数据类型
- [MySQL Dialect] 支持 MySQL 二进制字面量
- [PostgreSQL Dialect] 从 sql-psi 中公开 SERIAL（由 @veyndan 贡献）
- [PostgreSQL Dialect] 添加 BOOLEAN 数据类型（由 @veyndan 贡献）
- [PostgreSQL Dialect] 添加 NULL 列约束（由 @veyndan 贡献）
- [HSQL Dialect] 为 HSQL 添加 `AUTO_INCREMENT` 支持（由 @rharter 贡献）

## [1.4.0] - 2020-06-22 {id="1-4-0-2020-06-22"}
[1.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.0

### 新增
- [MySQL Dialect] MySQL 支持（由 @JGulbronson 和 @veyndan 贡献）
- [PostgreSQL Dialect] 实验性 PostgreSQL 支持（由 @veyndan 贡献）
- [HSQL Dialect] 实验性 H2 支持（由 @MariusVolkhart 贡献）
- [SQLite Dialect] SQLite FTS5 支持（由 @benasher44 和 @jpalawaga 贡献）
- [SQLite Dialect] 支持 alter table rename column（由 @angusholder 在 #1505 中贡献）
- [IDE] 对迁移 (.sqm) 文件的 IDE 支持
- [IDE] 添加模仿内置 SQL 实时模板的 SQLDelight 实时模板（由 @veyndan 在 #1154 中贡献）
- [IDE] 添加新建 SqlDelight 文件操作（由 @romtsn 在 #42 中贡献）
- [Runtime] 为返回结果的事务提供 transactionWithReturn API
- [Compiler] 在 .sq 文件中将多个 SQL 语句组合在一起的语法
- [Compiler] 支持从迁移文件生成架构
- [Gradle Plugin] 添加用于将迁移文件输出为有效 SQL 的任务

### 变更
- [Documentation] 文档网站全面改版（由 @saket 贡献）
- [Gradle Plugin] 改进不支持方言时的错误提示信息（由 @veyndan 贡献）
- [IDE] 根据方言动态更改文件图标（由 @veyndan 贡献）
- [JDBC Driver] 基于 javax.sql.DataSource 公开 JdbcDriver 构造函数（#1614）

### 修复
- [Compiler] 支持表上的 Javadoc 并修复单个文件中存在多个 Javadoc 的问题（#1224）
- [Compiler] 支持为合成列插入值（#1351）
- [Compiler] 修复目录名规范化不一致的问题（由 @ZacSweers 贡献）
- [Compiler] 合成列在跨联结时应保留为 null 性（#1656）
- [Compiler] 将 delete 语句锚定在 delete 关键字上（#1643）
- [Compiler] 修复引号转义问题（由 @angusholder 在 #1525 中贡献）
- [Compiler] 修复 between 运算符以正确递归进入表达式（#1279）
- [Compiler] 创建索引时若缺少表/列提供更准确的错误提示（#1372）
- [Compiler] 允许在联结约束中使用外部查询的投影（#1346）
- [Native Driver] 使 execute 使用 transationPool（由 @benasher44 贡献）
- [JDBC Driver] 使用 JDBC 事务 API 代替 SQLite 事务 API（#1693）
- [IDE] 修复 virtualFile 引用，使其始终指向原始文件（#1782）
- [IDE] 向 Bugsnag 上报错误时使用正确的 Throwable（#1262）
- [Paging Extension] 修复 DataSource 内存泄漏（#1628）
- [Gradle Plugin] 生成架构时若输出数据库文件已存在，则将其删除（#1645）
- [Gradle Plugin] 若迁移存在断代（gaps），则迁移验证失败
- [Gradle Plugin] 显式使用我们设置的文件索引（#1644）

## [1.3.0] - 2020-04-03 {id="1-3-0-2020-04-03"}
[1.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.3.0

* 新特性：[Gradle] Dialect 属性，用于指定要编译的 SQL 方言。
* 新特性：[Compiler] #1009 对 MySQL 方言的实验性支持。
* 新特性：[Compiler] #1436 支持 sqlite:3.24 方言与 upsert。
* 新特性：[JDBC Driver] 从 SQLite JVM 驱动程序中拆分出 JDBC 驱动程序。
* 修复：[Compiler] #1199 支持任意长度的 lambda 表达式。
* 修复：[Compiler] #1610 将 avg() 的返回值类型修复为可为 null。
* 修复：[IntelliJ] #1594 修复在 Windows 上破坏 Goto 和查找用例的路径分隔符处理问题。

## [1.2.2] - 2020-01-22 {id="1-2-2-2020-01-22"}
[1.2.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.2

* 新特性：[Runtime] 支持 Windows (mingW)、tvOS、watchOS 和 macOS 架构。
* 修复：[Compiler] sum() 的返回值类型应为可为 null。
* 修复：[Paging] 将 Transacter 传入 QueryDataSourceFactory 以避免竞态条件。
* 修复：[IntelliJ Plugin] 查找文件的包名时不搜索依赖项。
* 修复：[Gradle] #862 将 Gradle 中的验证器日志更改为 debug 级别。
* 优化：[Gradle] 将 GenerateSchemaTask 改造为使用 Gradle worker。
* 备注：sqldelight-runtime 构件已重命名为 runtime。

## [1.2.1] - 2019-12-11 {id="1-2-1-2019-12-11"}
[1.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.1

* 修复：[Gradle] Kotlin Native 1.3.60 支持。
* 修复：[Gradle] #1287 同步时的警告。
* 修复：[Compiler] #1469 为查询创建 SyntheticAccessor。
* 修复：[JVM Driver] 修复内存泄漏。
* 备注：协程扩展构件要求在 buildscript 中添加 kotlinx bintray Maven 仓库。

## [1.2.0] - 2019-08-30 {id="1-2-0-2019-08-30"}
[1.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.0

* 新特性：[Runtime] 稳定版 Flow API。
* 修复：[Gradle] Kotlin Native 1.3.50 支持。
* 修复：[Gradle] #1380 Clean 构建偶发失败的问题。
* 修复：[Gradle] #1348 运行验证任务时打印“Could not retrieve functions”的问题。
* 修复：[Compile] #1405 查询包含联结的 FTS 表时无法构建项目的问题。
* 修复：[Gradle] #1266 拥有多个数据库模块时偶发的 Gradle 构建失败问题。

## [1.1.4] - 2019-07-11 {id="1-1-4-2019-07-11"}
[1.1.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.4

* 新特性：[Runtime] 实验性 Kotlin Flow API。
* 修复：[Gradle] Kotlin/Native 1.3.40 兼容性。
* 修复：[Gradle] #1243 修复 SQLDelight 配合 Gradle 按需配置（configure on demand）使用的问题。
* 修复：[Gradle] #1385 修复 SQLDelight 配合增量注解处理使用的问题。
* 修复：[Gradle] 允许 Gradle 任务缓存。
* 修复：[Gradle] #1274 支持在 Kotlin DSL 中使用 SQLDelight 扩展。
* 修复：[Compiler] 确定性地为每个查询生成唯一 ID。
* 修复：[Compiler] 仅在事务完成时通知监听查询。
* 修复：[JVM Driver] #1370 强制 JdbcSqliteDriver 用户提供数据库 URL。

## [1.1.3] - 2019-04-14 {id="1-1-3-2019-04-14"}
[1.1.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.3

* Gradle Metadata 1.0 发布。

## [1.1.2] - 2019-04-14 {id="1-1-2-2019-04-14"}
[1.1.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.2

* 新特性：[Runtime] #1267 日志记录驱动程序装饰器。
* 修复：[Compiler] #1254 拆分长度超过 2^16 个字符的字符串字面量。
* 修复：[Gradle] #1260 生成的源码在多平台项目中被识别为 iOS 源码的问题。
* 修复：[IDE] #1290 CopyAsSqliteAction.kt:43 中的 kotlin.KotlinNullPointerException。
* 修复：[Gradle] #1268 在最近版本中运行 linkDebugFrameworkIos* 任务失败的问题。

## [1.1.1] - 2019-03-01 {id="1-1-1-2019-03-01"}
[1.1.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.1

* 修复：[Gradle] 修复 Android 项目的模块依赖编译问题。
* 修复：[Gradle] #1246 在 afterEvaluate 中设置 API 依赖。
* 修复：[Compiler] 数组类型可正确打印。

## [1.1.0] - 2019-02-27 {id="1-1-0-2019-02-27"}
[1.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.0

* 新特性：[Gradle] #502 允许指定架构模块依赖。
* 优化：[Compiler] #1111 表错误排在其他错误之前。
* 修复：[Compiler] #1225 为 REAL 字面量返回正确的类型。
* 修复：[Compiler] #1218 docid 通过触发器传播。

## [1.0.3] - 2019-01-30 {id="1-0-3-2019-01-30"}
[1.0.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.3

* 优化：[Runtime] #1195 原生驱动程序/运行时 Arm32。
* 优化：[Runtime] #1190 从 Query 类型中公开映射器。

## [1.0.2] - 2019-01-26 {id="1-0-2-2019-01-26"}
[1.0.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.2

* 修复：[Gradle Plugin] 更新至 Kotlin 1.3.20。
* 修复：[Runtime] 事务不再吞没异常。

## [1.0.1] - 2019-01-21 {id="1-0-1-2019-01-21"}
[1.0.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.1

* 优化：[Native Driver] 允许将目录名传递给 DatabaseConfiguration。
* 优化：[Compiler] #1173 没有包声明的文件编译失败。
* 修复：[IDE] 正确向 Square 上报 IDE 错误。
* 修复：[IDE] #1162 同一包中的类型显示为错误但实际运行正常的问题。
* 修复：[IDE] #1166 重命名表失败并抛出 NPE 的问题。
* 修复：[Compiler] #1167 尝试解析包含 UNION 和 SELECT 的复杂 SQL 语句时抛出异常的问题。

## [1.0.0] - 2019-01-08 {id="1-0-0-2019-01-08"}
[1.0.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.0

* 新特性：完全重构生成的代码，现已采用 Kotlin。
* 新特性：RxJava2 扩展构件。
* 新特性：Android Paging 扩展构件。
* 新特性：Kotlin 多平台支持。
* 新特性：Android、iOS 和 JVM SQLite 驱动程序构件。
* 新特性：事务 API。

## [0.7.0] - 2018-02-12 {id="0-7-0-2018-02-12"}
[0.7.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.7.0

 * 新特性：生成的代码已更新为仅使用 Support SQLite 库。所有查询现在生成语句对象而非原始字符串。
 * 新特性：IDE 中的语句折叠功能。
 * 新特性：布尔类型现已自动处理。
 * 修复：从代码生成中移除已弃用的 marshal。
 * 修复：将 'avg' SQL 函数类型映射更正为 REAL。
 * 修复：正确检测 'julianday' SQL 函数。

## [0.6.1] - 2017-03-22 {id="0-6-1-2017-03-22"}
[0.6.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.6.1

 * 新特性：无实参的 Delete、Update 和 Insert 语句生成已编译语句。
 * 修复：子查询中使用的视图内的 USING 子句不再报错。
 * 修复：移除了生成 Mapper 上的重复类型。
 * 修复：子查询可用于针对实参进行检查的表达式中。

## [0.6.0] - 2017-03-06 {id="0-6-0-2017-03-06"}
[0.6.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.6.0

 * 新特性：Select 查询现在公开为 `SqlDelightStatement` 工厂，而非字符串常量。
 * 新特性：查询的 JavaDoc 现在会复制到语句和映射器工厂中。
 * 新特性：为视图名称生成字符串常量。
 * 修复：需要工厂的视图查询现在正确要求将这些工厂作为实参。
 * 修复：验证 insert 的实参数量与指定的列数是否匹配。
 * 修复：正确编码 WHERE 子句中使用的 blob 字面量。
 * 此版本需要 Gradle 3.3 或更高版本。

## [0.5.1] - 2016-10-24 {id="0-5-1-2016-10-24"}
[0.5.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.5.1

 * 新特性：编译语句继承抽象类型。
 * 修复：形参中的基本类型若可为 null 则会被装箱。
 * 修复：工厂方法中存在绑定实参所需的所有工厂。
 * 修复：转义的列名被正确编组。

## [0.5.0] - 2016-10-19 {id="0-5-0-2016-10-19"}
[0.5.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.5.0

 * 新特性：SQLite 实参可以通过工厂以类型安全的方式传递。
 * 新特性：IntelliJ 插件对 .sq 文件执行格式化。
 * 新特性：支持 SQLite 时间戳字面量。
 * 修复：可在 IntelliJ 中点击跳转参数化类型。
 * 修复：从 Cursor 获取转义列名时不再抛出 RuntimeException。
 * 修复：Gradle 插件在尝试打印异常时不会崩溃。

## [0.4.4] - 2016-07-20 {id="0-4-4-2016-07-20"}
[0.4.4]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.4

 * 新特性：原生支持 short 作为列的 Java 类型。
 * 新特性：生成的映射器和工厂方法上的 Javadoc。
 * 修复：group_concat 和 nullif 函数具备正确的为 null 性。
 * 修复：与 Android Studio 2.2-alpha 的兼容性。
 * 修复：WITH RECURSIVE 不再导致插件崩溃。

## [0.4.3] - 2016-07-07 {id="0-4-3-2016-07-07"}
[0.4.3]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.3

 * 新特性：编译错误链接至源文件。
 * 新特性：右键点击可将 SQLDelight 代码复制为有效的 SQLite。
 * 新特性：具名语句上的 Javadoc 将出现在生成的 String 上。
 * 修复：生成的视图模型包含为 null 性注解。
 * 修复：由 union 生成的代码具备正确的类型和为 null 性，以支持所有可能的列。
 * 修复：SQLite 的 sum 和 round 函数在生成代码中具备正确的类型。
 * 修复：CAST 及内部 select 的缺陷修复。
 * 修复：CREATE TABLE 语句中的自动补全。
 * 修复：包中可以使用 SQLite 关键字。

## [0.4.2] - 2016-06-16 {id="0-4-2-2016-06-16"}
[0.4.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.2

 * 新特性：可以从工厂创建 Marshal。
 * 修复：IntelliJ 插件生成具有正确泛型顺序的工厂方法。
 * 修复：函数名称可以使用任意大小写。

## [0.4.1] - 2016-06-14 {id="0-4-1-2016-06-14"}
[0.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.1

 * 修复：IntelliJ 插件生成具有正确泛型顺序的类。
 * 修复：列定义可以使用任意大小写。

## [0.4.0] - 2016-06-14 {id="0-4-0-2016-06-14"}
[0.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.0

 * 新特性：映射器按查询而非按表生成。
 * 新特性：可以在 .sq 文件中导入 Java 类型。
 * 新特性：校验 SQLite 函数。
 * 修复：移除重复错误。
 * 修复：大写列名和 Java 关键字列名不再报错。

## [0.3.2] - 2016-05-14 {id="0-3-2-2016-05-14"}
[0.3.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.2

 * 新特性：自动补全和查找用例现在适用于视图和别名。
 * 修复：编译期验证现在允许在 select 中使用函数。
 * 修复：支持仅声明默认值的 insert 语句。
 * 修复：导入未使用 SQLDelight 的项目时插件不再崩溃。

## [0.3.1] - 2016-04-27 {id="0-3-1-2016-04-27"}
[0.3.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.1

  * 修复：接口可见性改回 public，以避免方法引用引起的非法访问运行时异常。
  * 修复：子表达式求值正确。

## [0.3.0] - 2016-04-26 {id="0-3-0-2016-04-26"}
[0.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.0

  * 新特性：列定义使用 SQLite 类型，并可以通过附加 'AS' 约束指定 Java 类型。
  * 新特性：可以从 IDE 发送错误报告。
  * 修复：自动补全功能正常工作。
  * 修复：编辑 .sq 文件时 SQLDelight 模型文件保持更新。
  * 移除：不再支持附加数据库（attached databases）。

## [0.2.2] - 2016-03-07 {id="0-2-2-2016-03-07"}
[0.2.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.2

 * 新特性：对 insert、update、delete、index 和 trigger 语句使用的列进行编译期验证。
 * 修复：文件移动/创建时 IDE 插件不再崩溃。

## [0.2.1] - 2016-03-07 {id="0-2-1-2016-03-07"}
[0.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.1

 * 新特性：Ctrl+`/`（OSX 上为 Cmd+`/`）切换选定行的注释状态。
 * 新特性：对 SQL 查询使用的列进行编译期验证。
 * 修复：在 IDE 和 Gradle 插件中均支持 Windows 路径。

## [0.2.0] - 2016-02-29 {id="0-2-0-2016-02-29"}
[0.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.0

 * 新特性：为 Marshal 类添加复制构造函数。
 * 新特性：更新至 Kotlin 1.0 正式版。
 * 修复：以非阻断方式报告 'sqldelight' 文件夹结构问题。
 * 修复：禁止命名为 `table_name` 的列，其生成的常量会与表名常量冲突。
 * 修复：确保 IDE 插件立即生成模型类，无论 `.sq` 文件是否被打开。
 * 修复：在 IDE 和 Gradle 插件中均支持 Windows 路径。

## [0.1.2] - 2016-02-13 {id="0-1-2-2016-02-13"}
[0.1.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.2

 * 修复：移除导致 Gradle 插件在大多数项目中无法使用的代码。
 * 修复：添加编译器对 Antlr 运行时缺失的依赖。

## [0.1.1] - 2016-02-12 {id="0-1-1-2016-02-12"}
[0.1.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.1

 * 修复：确保 Gradle 插件指向与其自身相同版本的运行时。

## [0.1.0] - 2016-02-12 {id="0-1-0-2016-02-12"}
[0.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.0

初始版本发布。