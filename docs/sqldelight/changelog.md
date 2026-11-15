# 更新日志

## 未发布 {id="unreleased"}

### 新增 {id="added"}

- 暂无！

### 变更 {id="changed"}

- 暂无！

### 修复 {id="fixed"}

- [Runtime] 在结束事务或回滚后钩子（post-rollback hook）也失败时（例如 SQLite 自行回滚事务后提示 `cannot rollback - no transaction is active`），保留事务体本身的异常。第二个异常将作为被抑制（suppressed）的异常添加，且 Android 驱动程序现在即使在 `endTransaction()` 抛出异常时也会清理其当前事务（#6387，由 @pyricau 贡献）
- [Gradle Plugin] Configuration.visible 属性不再生效。该属性现已被弃用，并将在 Gradle 11 中移除（#6394，由 @griffio 贡献）
- [IntelliJ Plugin] 修复连接检查（join inspection）出现误报的问题（#6398，由 @griffio 贡献）

## [2.4.1] - 2026-10-06 {id="2-4-1-2026-10-06"}
[2.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.1

### 新增

- [Documentation] 补充 Android SQLite 事务文档（#6381，由 @griffio 贡献）

### 变更

- [Gradle Plugin] 在整个代码生成任务期间将解析后的 `.sq` 文件保留在内存中，从而避免在垃圾回收后再次解析。这可以加快大型项目中的代码生成速度（#6374，由 @C2H6O 贡献）
- [IntelliJ Plugin] 崩溃报告现已上报至 JetBrains Marketplace，不再上报至自定义的 Bugsnag 实例（#6376，由 @JakeWharton 贡献）

### 修复

- [IntelliJ Plugin] 通过调整 IntelliJ API 的使用，修复插件发布违规问题（#6366 #6368，由 @griffio 贡献）
- [IntelliJ Plugin] 通过捕获未处理的错误，提高键入时的稳定性（#6355，由 @griffio 贡献）

## [2.4.0] - 2026-09-17 {id="2-4-0-2026-09-17"}
[2.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0

### 新增
- [Native Driver] 为 `inMemoryDriver` 添加 `extendedConfig` 形参（#5539，由 @GuilhE 贡献）
- [PostgreSQL Dialect] 为隐式定义的系统列（System Columns）添加查询支持（#5834，由 @griffio 贡献）
- [PostgreSQL Dialect] 添加基础的数组字面量支持（#5997，由 @griffio 贡献）
- [PostgreSQL Dialect] 添加基础的 LTREE 支持（#5880，由 @yesitskev 和 @griffio 贡献）
- [MySQL Dialect] 添加对 INET 函数的支持（#5072，由 @mcxinyu 贡献）
- [PostgreSQL Dialect] 添加对 ALTER INDEX 的支持（#6224，由 @griffio 贡献）
- [SQLite Dialect] 添加对 SQLite 3.44 聚合函数 DISTINCT、ORDER BY 和 FILTER 的支持（#6236，由 @griffio 贡献）
- [SQLite Dialect] 添加对 SQLite 3.37 STRICT 表的支持（#6230，由 @griffio 贡献）
- [Gradle Plugin] 支持使用 `codegenExcludedColumns` 从生成的模型中排除特定列（#6243，由 @sokolikp 贡献）
- [Compiler] 为架构添加 `allTableNames` 函数（#6245，由 @edenman 贡献）
- [PostgreSQL Dialect] 添加对 ANY 运算符的支持（#6253，由 @griffio 贡献）
- [SQLite Dialect] 添加 SQLite 3.39 对 RIGHT JOIN 和 FULL JOIN 的支持（#6273，由 @griffio 贡献）
- [PostgreSQL Dialect] 在触发器函数中添加对 `RAISE` 语句和 `FOUND` 变量的支持（#6297，由 @griffio 贡献）

### 变更
- [PostgreSQL Dialect] 将 arrayIntermediateType 的可见性改为 public（#5835，由 @griffio 贡献）
- [Gradle Plugin] 实现更严格的 MigrationFile 版本控制（#5730，由 @madisp 贡献）
- [Gradle Plugin] 将支持的最低 Gradle 版本提升至 8.2.1（#6217，由 @maxsav 贡献）
- [Gradle Plugin] 支持 Gradle 隔离项目（isolated projects）（#6217，由 @maxsav 贡献）
- [IntelliJ Plugin] 最低版本要求提升为 2023.3 / Android Studio Jellyfish

### 修复
- [Gradle Plugin] 在 JDK 24+ 上抑制编译器 worker 发出的 `sun.misc.Unsafe` 弃用警告（#6321）
- [Compiler] 在生成的代码中抑制多余的 Kotlin 警告（#6208，由 @eyupcanakman 贡献）
- [Compiler] 非分组聚合结果集中的其他列始终可为空（#6208）
- [PostgreSQL Dialect] 正确解析 coalesce 和 ifnull 的为 null 性
- [PostgreSQL Dialect] 修复 PostgreSQL 方言的 IDE 集成问题
- [PostgreSQL Dialect] 改进 PostgreSQL 方言的 IDE 插件支持（#6209，由 @griffio 贡献）
- [IntelliJ Plugin] IDE 插件支持对所有方言执行代码补全（#6210，由 @griffio 贡献）
- [Gradle Plugin] 修复运行验证数据库任务时的循环依赖错误（#6221，由 @griffio 贡献）
- [Compiler] 修复多行更新时的乐观锁问题（#6240，由 @griffio 贡献）
- [IntelliJ Plugin] 修复在 IDEA 2026.2 中由于弃用 API 导致的崩溃（#6247，由 @griffio 贡献）
- [Gradle Plugin] 修复 AGP 8.9 到 8.11 上 Kotlin 编译未正确获取生成源文件的问题
- [PostgreSQL Dialect] 修复使用基本类型绑定实参时 lower 和 upper 函数默认解析为 TEXT 的问题（#6262，由 @griffio 贡献）
- [Compiler] 修复使用适配器进行数据类绑定且迁移改变了为 null 性时的插入值问题（#6269，由 @griffio 贡献）
- [Compiler] 对 null 安全运算符（IS 和 IS DISTINCT FROM）使用可为空的绑定实参（#6265，由 @griffio 贡献）
- [Gradle Plugin] 针对项目依赖项采用 AGP 的变体解析机制（#6217，由 @maxsav 贡献）
- [Gradle Plugin] 修复当不同构建之间的 AGP 变体列表不同时，generateDatabaseInterface 的构建缓存未命中问题
- [Gradle Plugin] 修复在未配置任何数据库的情况下应用该插件时 IDE 同步崩溃的问题（#6088）
- [PostgreSQL Dialect] 修复使用嵌套函数调用时 json 聚合函数的问题（#6281，由 @griffio 贡献）
- [Paging3 Extension] 修复空数据库上 KeyedQueryPagingSource 崩溃的问题（#6284，由 @woods-marshes 贡献）
- [Compiler] 修复当变动语句与 `COALESCE` 等封装函数一起使用时的 Java 类型适配器问题（#6292，由 @griffio 贡献）
- [Compiler] 修复模块名称大写时导致生成代码的包名也大写的问题（#6316，由 @griffio 贡献）
- [PostgreSQL Dialect] 允许日期数据类型不区分大小写（#6328，由 @griffio 贡献）
- [PostgreSQL Dialect] 将 `string_agg` 函数修复为可为空（#6340，由 @griffio 贡献）
- [SQLite Dialect] 修复使用 `GROUP BY` 时 SQLite 3.44 聚合函数的问题（#6343，由 @griffio 贡献）
- [Gradle Plugin] 避免在配置阶段解析数据库依赖项（#6353，由 @joshfriend 贡献）

## [2.4.0-rc2] - 2026-09-14 {id="2-4-0-rc2-2026-09-14"}
[2.4.0-rc2]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0-rc2

### 修复

- [PostgreSQL Dialect] 将 `string_agg` 函数修复为可为空（#6340，由 @griffio 贡献）
- [SQLite Dialect] 修复使用 `GROUP BY` 时 SQLite 3.44 聚合函数的问题（#6343，由 @griffio 贡献）
- [Gradle Plugin] 避免在配置阶段解析数据库依赖项（#6353，由 @joshfriend 贡献）

## [2.4.0-rc1] - 2026-09-01 {id="2-4-0-rc1-2026-09-01"}
[2.4.0-rc1]: https://github.com/sqldelight/sqldelight/releases/tag/2.4.0-rc1

### 新增
- [Native Driver] 为 `inMemoryDriver` 添加 `extendedConfig` 形参（#5539，由 @GuilhE 贡献）
- [PostgreSQL Dialect] 为隐式定义的系统列添加查询支持（#5834，由 @griffio 贡献）
- [PostgreSQL Dialect] 添加基础的数组字面量支持（#5997，由 @griffio 贡献）
- [PostgreSQL Dialect] 添加基础的 LTREE 支持（#5880，由 @yesitskev 和 @griffio 贡献）
- [MySQL Dialect] 添加对 INET 函数的支持（#5072，由 @mcxinyu 贡献）
- [PostgreSQL Dialect] 添加对 ALTER INDEX 的支持（#6224，由 @griffio 贡献）
- [SQLite Dialect] 添加对 SQLite 3.44 聚合函数 DISTINCT、ORDER BY 和 FILTER 的支持（#6236，由 @griffio 贡献）
- [SQLite Dialect] 添加对 SQLite 3.37 STRICT 表的支持（#6230，由 @griffio 贡献）
- [Gradle Plugin] 支持使用 `codegenExcludedColumns` 从生成的模型中排除特定列（#6243，由 @sokolikp 贡献）
- [Compiler] 为架构添加 `allTableNames` 函数（#6245，由 @edenman 贡献）
- [PostgreSQL Dialect] 添加对 ANY 运算符的支持（#6253，由 @griffio 贡献）
- [SQLite Dialect] 添加 SQLite 3.39 对 RIGHT JOIN 和 FULL JOIN 的支持（#6273，由 @griffio 贡献）
- [PostgreSQL Dialect] 在触发器函数中添加对 `RAISE` 语句和 `FOUND` 变量的支持（#6297，由 @griffio 贡献）

### 变更
- [PostgreSQL Dialect] 将 arrayIntermediateType 的可见性改为 public（#5835，由 @griffio 贡献）
- [Gradle Plugin] 实现更严格的 MigrationFile 版本控制（#5730，由 @madisp 贡献）
- [Gradle Plugin] 将支持的最低 Gradle 版本提升至 8.2.1（#6217，由 @maxsav 贡献）
- [Gradle Plugin] 支持 Gradle 隔离项目（#6217，由 @maxsav 贡献）
- [IntelliJ Plugin] 最低版本要求提升为 2023.3 / Android Studio Jellyfish

### 修复
- [Gradle Plugin] 在 JDK 24+ 上抑制编译器 worker 发出的 `sun.misc.Unsafe` 弃用警告（#6321）
- [Compiler] 在生成的代码中抑制多余的 Kotlin 警告（#6208，由 @eyupcanakman 贡献）
- [Compiler] 非分组聚合结果集中的其他列始终可为空
- [PostgreSQL Dialect] 正确解析 coalesce 和 ifnull 的为 null 性
- [PostgreSQL Dialect] 修复 PostgreSQL 方言的 IDE 集成问题
- [PostgreSQL Dialect] 改进 PostgreSQL 方言的 IDE 插件支持（#6209，由 @griffio 贡献）
- [IntelliJ Plugin] IDE 插件支持对所有方言执行代码补全（#6210，由 @griffio 贡献）
- [Gradle Plugin] 修复运行验证数据库任务时的循环依赖错误（#6221，由 @griffio 贡献）
- [Compiler] 修复多行更新时的乐观锁问题（#6240，由 @griffio 贡献）
- [IntelliJ Plugin] 修复在 IDEA 2026.2 中由于弃用 API 导致的崩溃（#6247，由 @griffio 贡献）
- [Gradle Plugin] 修复 AGP 8.9 到 8.11 上 Kotlin 编译未正确获取生成源文件的问题
- [PostgreSQL Dialect] 修复使用基本类型绑定实参时 lower 和 upper 函数默认解析为 TEXT 的问题（#6262，由 @griffio 贡献）
- [Compiler] 修复使用适配器进行数据类绑定且迁移改变了为 null 性时的插入值问题（#6269，由 @griffio 贡献）
- [Compiler] 对 null 安全运算符（IS 和 IS DISTINCT FROM）使用可为空的绑定实参（#6265，由 @griffio 贡献）
- [Gradle Plugin] 针对项目依赖项采用 AGP 的变体解析机制（#6217，由 @maxsav 贡献）
- [Gradle Plugin] 修复当不同构建之间的 AGP 变体列表不同时，generateDatabaseInterface 的构建缓存未命中问题
- [Gradle Plugin] 修复在未配置任何数据库的情况下应用该插件时 IDE 同步崩溃的问题（#6088）
- [PostgreSQL Dialect] 修复使用嵌套函数调用时 json 聚合函数的问题（#6281，由 @griffio 贡献）
- [Paging3 Extension] 修复空数据库上 KeyedQueryPagingSource 崩溃的问题（#6284，由 @woods-marshes 贡献）
- [Compiler] 修复当变动语句与 `COALESCE` 等封装函数一起使用时的 Java 类型适配器问题（#6292，由 @griffio 贡献）
- [Compiler] 修复模块名称大写时导致生成代码的包名也大写的问题（#6316，由 @griffio 贡献）
- [PostgreSQL Dialect] 允许日期数据类型不区分大小写（#6328，由 @griffio 贡献）

## [2.3.2] - 2026-03-16 {id="2-3-2-2026-03-16"}
[2.3.2]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.2

### 新增
- [PostgreSQL Dialect] 改进对 ALTER TABLE ALTER TYPE USING 表达式的支持（#6116，由 @griffio 贡献）
- [PostgreSQL Dialect] 添加对 DROP COLUMN IF EXISTS 的支持（#6112，由 @griffio 贡献）
- [Gradle Plugin] 添加 expandSelectStar 标志以关闭 Select 通配符展开（#5813，由 @griffio 贡献）
- [MySQL Dialect] 添加对窗口函数的支持（#6086，由 @griffio 贡献）
- [Gradle Plugin] 修复当起始架构版本不为 1 且 verifyMigrations 为 true 时的构建失败问题（#6017，由 @neilgmiller 贡献）
- [Gradle Plugin] 使 `SqlDelightWorkerTask` 更加可配置，并更新默认配置以支持在 Windows 上进行开发（#5215，由 @MSDarwish2000 贡献）
- [SQLite Dialect] 添加对 FTS5 虚拟表中合成列（synthesized columns）的支持（#5986，由 @watbe 贡献）
- [PostgreSQL Dialect] 添加对 Postgres 行级安全（row level security）的支持（#6087，由 @shellderp 贡献）
- [PostgreSQL Dialect] 扩展 FOR UPDATE 以支持 OF table、NO KEY UPDATE、NO WAIT（#6104，由 @shellderp 贡献）
- [PostgreSQL Dialect] 支持 Postgis Point 类型及相关函数（#5602，由 @vanniktech 贡献）
- [Runtime] 添加 `SuspendingTransacter.TransactionDispatcher`，用于控制事务的 `CoroutineContext`（#5967，由 @eygraber 贡献）
- [Gradle Plugin] 完全兼容 Android Gradle Plugin 9.0 的新 DSL（#6140）
- [PostgreSQL Dialect] 支持 PostgreSQL CREATE TABLE 存储参数（#6148，由 @griffio 贡献）
- [PostgreSQL Dialect] 修复 PostgreSQL 唯一表约束的可为空结果列问题（#6167，由 @griffio 贡献）

### 变更
- [Compiler] 将编译器输出类型从 java.lang.Void 改为 kotlin.Nothing（#6099，由 @griffio 贡献）
- [Compiler] 允许在包名中使用下划线。此前下划线会被清理净化，从而导致意外行为（#6027，由 @BierDav 贡献）
- [Paging Extension] 切换至 AndroidX Paging（#5910，由 @jeffdgr8 贡献）
- [Android Driver] 将 Android minSdk 提升至 23（#6141）
- [Paging Extension] 升级到 paging 3.4.1，并移除了 X64 Apple 目标平台（#6166）

### 修复
- [IntelliJ Plugin] 修复在 VFS 刷新事件期间在 EDT 上阻塞文件类型检测导致的 IDE 卡死问题
- [SQLite Dialect] 修复使用 Json 路径运算符时的 SQLite 3.38 编译错误（#6070，由 @griffio 贡献）
- [SQLite Dialect] 使用自定义列类型时，为 group_concat 函数使用 String 类型（#6082，由 @griffio 贡献）
- [Gradle Plugin] 提升 `VerifyMigrationTask` 的性能，防止在复杂架构上发生挂起（#6073，由 @Lightwood13 贡献）
- [IntelliJ Plugin] 修复插件初始化异常并更新弃用的方法（#6040，由 @griffio 贡献）
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
- [PostgreSQL Dialect] 修复 Postgres numeric/integer/biginteger 类型映射（#5994，由 @griffio 贡献）
- [Compiler] 改进编译器错误消息，在需要 CAST 时包含源文件位置（#5979，由 @griffio 贡献）
- [PostgreSQL Dialect] 添加对 Postgres JSON 运算符路径提取的支持（#5971，由 @griffio 贡献）
- [SQLite Dialect] 添加 SQLite 3.35 对使用通用表表达式（CTE）的 MATERIALIZED 查询计划提示的支持（#5961，由 @griffio 贡献）
- [PostgreSQL Dialect] 添加对使用通用表表达式的 MATERIALIZED 查询计划提示的支持（#5961，由 @griffio 贡献）
- [PostgreSQL Dialect] 添加对 Postgres JSON Aggregate FILTER 的支持（#5957，由 @griffio 贡献）
- [PostgreSQL Dialect] 添加对 Postgres 枚举的支持（#5935，由 @griffio 贡献）
- [PostgreSQL Dialect] 添加对 Postgres 触发器的有限支持（#5932，由 @griffio 贡献）
- [PostgreSQL Dialect] 添加用于检查 SQL 表达式是否可解析为 JSON 的谓词（#5843，由 @griffio 贡献）
- [PostgreSQL Dialect] 添加对 PostgreSQL Comment On 语句的有限支持（#5808，由 @griffio 贡献）
- [MySQL Dialect] 添加对索引可见性选项的支持（#5785，由 @orenkislev-faire 贡献）
- [PostgreSQL Dialect] 添加对 TSQUERY 数据类型的支持（#5779，由 @griffio 贡献）
- [Gradle Plugin] 添加模块时支持版本目录（version catalogs）（#5755，由 @DRSchlaubi 贡献）

### 变更
- 开发中的快照版本现在发布至 Central Portal Snapshots 仓库：https://central.sonatype.com/repository/maven-snapshots/。
- [Compiler] 使用构造函数引用简化了默认生成的查询（#5814，由 @jonapoul 贡献）

### 修复
- [Compiler] 修复使用包含通用表表达式的视图时的堆栈溢出问题（#5928，由 @griffio 贡献）
- [Gradle Plugin] 修复打开 SqlDelight 工具窗口以添加“New Connection”时的崩溃问题（#5906，由 @griffio 贡献）
- [IntelliJ Plugin] 避免在 copy-to-sqlite 装订区域操作中发生与线程相关的崩溃（#5901，由 @griffio 贡献）
- [IntelliJ Plugin] 修复 PostgreSQL 方言在使用架构语句 CREATE INDEX 和 CREATE VIEW 时的支持（#5772，由 @griffio 贡献）
- [Compiler] 修复引用列时的 FTS 堆栈溢出（#5896，由 @griffio 贡献）
- [Compiler] 修复 With Recursive 堆栈溢出（#5892，由 @griffio 贡献）
- [Compiler] 修复对 Insert|Update|Delete Returning 语句的通知（Notify）（#5851，由 @griffio 贡献）
- [Compiler] 修复返回 Long 的事务块的异步结果类型（#5836，由 @griffio 贡献）
- [Compiler] 将 SQL 形参绑定复杂度从 O(n²) 优化为 O(n)（#5898，由 @chenf7 贡献）
- [SQLite Dialect] 修复 SQLite 3.18 缺失函数的问题（#5759，由 @griffio 贡献）

## [2.2.0] - 2025-11-13 {id="2-2-0-2025-11-13"}
[2.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.2.0

发布失败，构件仅部分发布。请使用 2.2.1！

## [2.1.0] - 2025-05-16 {id="2-1-0-2025-05-16"}
[2.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.1.0

### 新增
- [WASM Driver] 为 Web Worker 驱动程序添加 wasmJs 支持（#5534，由 @IlyaGulya 贡献）
- [PostgreSQL Dialect] 支持 PostgreSQL UnNest 将数组解包为行（#5673，由 @griffio 贡献）
- [PostgreSQL Dialect] 支持 PostgreSQL TSRANGE/TSTZRANGE（#5297，由 @griffio 贡献）
- [PostgreSQL Dialect] 支持 PostgreSQL Right Full Join（#5086，由 @griffio 贡献）
- [PostgreSQL Dialect] 支持从 PostgreSQL 时间类型中提取字段（#5273，由 @griffio 贡献）
- [PostgreSQL Dialect] 支持 PostgreSQL 数组包含运算符（#4933，由 @griffio 贡献）
- [PostgreSQL Dialect] 支持 PostgreSQL drop constraint（#5288，由 @griffio 贡献）
- [PostgreSQL Dialect] 支持 PostgreSQL 类型转换（#5089，由 @griffio 贡献）
- [PostgreSQL Dialect] 支持子查询的 PostgreSQL lateral join 运算符（#5122，由 @griffio 贡献）
- [PostgreSQL Dialect] 支持 PostgreSQL ILIKE 运算符（#5330，由 @griffio 贡献）
- [PostgreSQL Dialect] 支持 PostgreSQL XML 类型（#5331，由 @griffio 贡献）
- [PostgreSQL Dialect] 支持 PostgreSQL AT TIME ZONE（#5243，由 @griffio 贡献）
- [PostgreSQL Dialect] 支持 PostgreSQL order by nulls（#5199，由 @griffio 贡献）
- [PostgreSQL Dialect] 添加 PostgreSQL 当前日期/时间函数支持（#5226，由 @drewd 贡献）
- [PostgreSQL Dialect] 支持 PostgreSQL 正则表达式运算符（#5137，由 @griffio 贡献）
- [PostgreSQL Dialect] 添加 brin 与 gist 支持（#5059，由 @griffio 贡献）
- [MySQL Dialect] 为 MySQL 方言支持 RENAME INDEX（#5212，由 @orenkislev-faire 贡献）
- [JSON Extension] 为 json 表函数添加别名支持（#5372，由 @griffio 贡献）

### 变更
- [Compiler] 生成的查询文件为简单的变动操作返回受影响的行数（#4578，由 @MariusVolkhart 贡献）
- [Native Driver] 更新 NativeSqlDatabase.kt，修改 DELETE、INSERT 和 UPDATE 语句的只读标志（#5680，由 @griffio 贡献）
- [PostgreSQL Dialect] 将 PgInterval 改为 String（#5403，由 @griffio 贡献）
- [PostgreSQL Dialect] 支持使用 SqlDelight 模块来实现 PostgreSQL 扩展（#5677，由 @griffio 贡献）

### 修复
- [Compiler] 修复：在执行带结果的分组语句时通知查询（#5006，由 @vitorhugods 贡献）
- [Compiler] 修复 SqlDelightModule 类型解析器（#5625，由 @griffio 贡献）
- [Compiler] 修复问题 5501：插入带有转义列的对象（#5503，由 @griffio 贡献）
- [Compiler] 改进错误消息，使路径链接可点击并带有正确的行与字符位置（#5604，由 @vanniktech 贡献）
- [Compiler] 修复问题 5298：允许将关键字用作表名
- [Compiler] 修复命名的 execute 语句并添加测试
- [Compiler] 在排序初始化语句时考虑外键表约束（#5325，由 @TheMrMilchmann 贡献）
- [Compiler] 包含制表符时正面对齐错误下划线（#5224，由 @drewd 贡献）
- [JDBC Driver] 修复事务结束期间 connectionManager 的内存泄漏
- [JDBC Driver] 按照文档所述在事务内运行 SQLite 迁移（#5218，由 @morki 贡献）
- [JDBC Driver] 修复事务提交/回滚后泄漏连接的问题（#5205，由 @morki 贡献）
- [Gradle Plugin] 在 `GenerateSchemaTask` 之前执行 `DriverInitializer`（#5562，由 @nwagu 贡献）
- [Runtime] 修复实际驱动程序为 Async 时 LogSqliteDriver 发生的崩溃（#5723，由 @edenman 贡献）
- [Runtime] 修复 StringBuilder 容量（#5192，由 @janbina 贡献）
- [PostgreSQL Dialect] 支持 PostgreSQL create or replace view（#5407，由 @griffio 贡献）
- [PostgreSQL Dialect] 支持 PostgreSQL to_json（#5606，由 @griffio 贡献）
- [PostgreSQL Dialect] 修复 PostgreSQL numeric 解析器（#5399，由 @griffio 贡献）
- [PostgreSQL Dialect] 支持 SQLite 窗口函数（#2799，由 @griffio 贡献）
- [PostgreSQL Dialect] 支持 PostgreSQL SELECT DISTINCT ON（#5345，由 @griffio 贡献）
- [PostgreSQL Dialect] 支持 alter table add column if not exists（#5309，由 @griffio 贡献）
- [PostgreSQL Dialect] 修复 PostgreSQL 异步绑定形参（#5313，由 @griffio 贡献）
- [PostgreSQL Dialect] 支持 PostgreSQL 布尔字面量（#5262，由 @griffio 贡献）
- [PostgreSQL Dialect] 支持 PostgreSQL 窗口函数（#5155，由 @griffio 贡献）
- [PostgreSQL Dialect] 支持 PostgreSQL isNull 与 isNotNull 类型（#5173，由 @griffio 贡献）
- [PostgreSQL Dialect] 支持 PostgreSQL select distinct（#5172，由 @griffio 贡献）
- [Paging Extension] 修复分页刷新时的初始加载问题（#5615，由 @evant 贡献）
- [Paging Extension] 添加 macOS 原生目标平台（#5324，由 @vitorhugods 贡献）
- [IntelliJ Plugin] 支持 K2

## [2.0.2] - 2024-04-05 {id="2-0-2-2024-04-05"}
[2.0.2]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.2

### 新增
- [PostgreSQL Dialect] 添加 PostgreSQL STRING_AGG 函数（#4950，由 @anddani 贡献）
- [PostgreSQL Dialect] 为 pg 方言添加 SET 语句支持（#4927，由 @de-luca 贡献）
- [PostgreSQL Dialect] 添加 PostgreSQL alter column sequence 形参支持（#4916，由 @griffio 贡献）
- [PostgreSQL Dialect] 为 insert 语句添加 PostgreSQL alter column default 支持（#4912，由 @griffio 贡献）
- [PostgreSQL Dialect] 添加 PostgreSQL alter sequence 和 drop sequence（#4920，由 @griffio 贡献）
- [PostgreSQL Dialect] 添加 Postgres 正则表达式函数定义（#5025，由 @MariusVolkhart 贡献）
- [PostgreSQL Dialect] 为 GIN 添加语法支持（#5027，由 @griffio 贡献）

### 变更
- [IDE Plugin] 最低版本要求提升为 2023.1 / Android Studio Iguana
- [Compiler] 允许在 encapsulatingType 中重写类型为 null 性（#4882，由 @eygraber 贡献）
- [Compiler] 为 SELECT * 内联列名
- [Gradle Plugin] 切换为 processIsolation（#5068，由 @nwagu 贡献）
- [Android Runtime] 将 Android minSDK 提升至 21（#5094，由 @hfhbd 贡献）
- [Drivers] 为方言编写者公开更多 JDBC/R2DBC 语句方法（#5098，由 @hfhbd 贡献）

### 修复
- [PostgreSQL Dialect] 修复 PostgreSQL alter table alter column（#4868，由 @griffio 贡献）
- [PostgreSQL Dialect] 修复问题 4448：表模型缺失 import（#4885，由 @griffio 贡献）
- [PostgreSQL Dialect] 修复问题 4932：PostgreSQL 默认约束函数（#4934，由 @griffio 贡献）
- [PostgreSQL Dialect] 修复问题 4879：迁移期间 alter table rename column 中的 PostgreSQL 类转换错误（#4880，由 @griffio 贡献）
- [PostgreSQL Dialect] 修复问题 4474：PostgreSQL create extension（#4541，由 @griffio 贡献）
- [PostgreSQL Dialect] 修复问题 5018：PostgreSQL 添加非空主键类型（#5020，由 @griffio 贡献）
- [PostgreSQL Dialect] 修复问题 4703：聚合表达式（#5071，由 @griffio 贡献）
- [PostgreSQL Dialect] 修复问题 5028：PostgreSQL json（#5030，由 @griffio 贡献）
- [PostgreSQL Dialect] 修复问题 5040：PostgreSQL json 运算符（#5041，由 @griffio 贡献）
- [PostgreSQL Dialect] 修复问题 5040 的 json 运算符绑定（#5100，由 @griffio 贡献）
- [PostgreSQL Dialect] 修复问题 5082：tsvector（#5104，由 @griffio 贡献）
- [PostgreSQL Dialect] 修复问题 5032：PostgreSQL UPDATE FROM 语句的列相邻关系（#5035，由 @griffio 贡献）
- [SQLite Dialect] 修复问题 4897：SQLite alter table rename column（#4899，由 @griffio 贡献）
- [IDE Plugin] 修复错误处理程序崩溃问题（#4988，由 @aperfilyev 贡献）
- [IDE Plugin] 修复 IDEA 2023.3 中 BugSnag 初始化失败的问题（由 @aperfilyev 贡献）
- [IDE Plugin] 修复通过插件在 IntelliJ 中打开 `.sq` 文件时出现的 PluginException（由 @aperfilyev 贡献）
- [IDE Plugin] 不再将 kotlin 库打包进 IntelliJ 插件中，因为其已作为插件依赖项存在（#5126）
- [IDE Plugin] 使用 extensions 数组代替 stream（#5127）

## [2.0.1] - 2023-12-01 {id="2-0-1-2023-12-01"}
[2.0.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.1

### 新增
- [Compiler] 在执行 SELECT 时支持多列表达式（multi-column-expr）（#4453，由 @Adriel-M 贡献）
- [PostgreSQL Dialect] 添加对 PostgreSQL CREATE INDEX CONCURRENTLY 的支持（#4531，由 @griffio 贡献）
- [PostgreSQL Dialect] 允许 PostgreSQL CTE 辅助语句相互引用（#4493，由 @griffio 贡献）
- [PostgreSQL Dialect] 为二元表达式和 sum 添加对 PostgreSQL 类型的支持（#4539，由 @Adriel-M 贡献）
- [PostgreSQL Dialect] 添加对 PostgreSQL SELECT DISTINCT ON 语法的支持（#4584，由 @griffio 贡献）
- [PostgreSQL Dialect] 在 SELECT 语句中添加对 PostgreSQL JSON 函数的支持（#4590，由 @MariusVolkhart 贡献）
- [PostgreSQL Dialect] 添加 generate_series PostgreSQL 函数（#4717，由 @griffio 贡献）
- [PostgreSQL Dialect] 添加额外的 Postgres 字符串函数定义（#4752，由 @MariusVolkhart 贡献）
- [PostgreSQL Dialect] 为 min 和 max 聚合函数添加 DATE PostgreSQL 类型支持（#4816，由 @anddani 贡献）
- [PostgreSQL Dialect] 为 SqlBinaryExpr 添加 PostgreSQL 时间类型支持（#4657，由 @griffio 贡献）
- [PostgreSQL Dialect] 为 Postgres 方言添加 TRUNCATE 支持（#4817，由 @de-luca 贡献）
- [SQLite 3.35 Dialect] 允许使用多个按顺序求值的 ON CONFLICT 子句（#4551，由 @griffio 贡献）
- [JDBC Driver] 添加语言注解以获得更舒适的 SQL 编辑体验（#4602，由 @MariusVolkhart 贡献）
- [Native Driver] 添加对 linuxArm64 的支持（#4792，由 @hfhbd 贡献）
- [Android Driver] 为 AndroidSqliteDriver 添加 windowSizeBytes 形参（#4804，由 @BoD 贡献）
- [Paging3 Extension] 为 OffsetQueryPagingSource 添加 initialOffset（#4802，由 @MohamadJaara 贡献）

### 变更
- [Compiler] 在合适的位置优先使用 Kotlin 类型（#4517，由 @eygraber 贡献）
- [Compiler] 执行值类型插入时始终包含列名（#4864）
- [PostgreSQL Dialect] 移除 PostgreSQL 方言的实验性状态（#4443，由 @hfhbd 贡献）
- [PostgreSQL Dialect] 更新 PostgreSQL 类型的文档（#4569，由 @MariusVolkhart 贡献）
- [R2DBC Driver] 优化在 PostgreSQL 中处理整数数据类型时的性能（#4588，由 @MariusVolkhart 贡献）

### 移除 {id="removed"}
- [SQLite Javascript Driver] 移除 sqljs-driver（#4613、#4670，由 @dellisd 贡献）

### 修复
- [Compiler] 修复带返回值且无形参的分组语句的编译（#4699，由 @griffio 贡献）
- [Compiler] 使用 SqlBinaryExpr 绑定实参（#4604，由 @griffio 贡献）
- [IDE Plugin] 若设置了 IDEA 项目 JDK 则优先使用（#4689，由 @griffio 贡献）
- [IDE Plugin] 修复 IDEA 2023.2 及更高版本中的“Unknown element type: TYPE_NAME”错误（#4727）
- [IDE Plugin] 修复了与 2023.2 的一些兼容性问题
- [Gradle Plugin] 更正 verifyMigrationTask Gradle 任务的文档（#4713，由 @joshfriend 贡献）
- [Gradle Plugin] 添加 Gradle 任务输出消息，提示用户在验证数据库之前先生成数据库（#4684，由 @jingwei99 贡献）
- [PostgreSQL Dialect] 修复多次重命名 PostgreSQL 列的问题（#4566，由 @griffio 贡献）
- [PostgreSQL Dialect] 修复问题 4714：PostgreSQL alter column 为 null 性（#4831，由 @griffio 贡献）
- [PostgreSQL Dialect] 修复问题 4837：alter table alter column（#4846，由 @griffio 贡献）
- [PostgreSQL Dialect] 修复问题 4501：PostgreSQL sequence（#4528，由 @griffio 贡献）
- [SQLite Dialect] 允许在列表达式上使用 JSON 二元运算符（#4776，由 @eygraber 贡献）
- [SQLite Dialect] 修复 Update From 中误报“找到多个同名列”的问题（#4777，由 @eygraber 贡献）
- [Native Driver] 支持命名的内存数据库（#4662，由 @05nelsonm 贡献）
- [Native Driver] 确保查询监听器集合的线程安全性（#4567，由 @kpgalligan 贡献）
- [JDBC Driver] 修复 ConnectionManager 中的连接泄漏（#4589，由 @MariusVolkhart 贡献）
- [JDBC Driver] 修复在选择 ConnectionManager 类型时 JdbcSqliteDriver url 的解析问题（#4656，由 @05nelsonm 贡献）

## [2.0.0] - 2023-07-26 {id="2-0-0-2023-07-26"}
[2.0.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0

### 新增
- [MySQL Dialect] MySQL：在 IF 表达式中支持 timestamp/bigint（#4329，由 @shellderp 贡献）
- [MySQL Dialect] MySQL：添加 now 支持（#4431，由 @hfhbd 贡献）
- [Web Driver] 启用 NPM 软件包发布（#4364）
- [IDE Plugin] 允许用户在 Gradle 工具连接失败时显示堆栈跟踪（#4383）

### 变更
- [Sqlite Driver] 简化 JdbcSqliteDriver 的架构迁移使用方式（#3737，由 @morki 贡献）
- [R2DBC Driver] 真正的异步 R2DBC 游标（#4387，由 @hfhbd 贡献）

### 修复
- [IDE Plugin] 仅在需要时才实例化数据库项目服务（#4382）
- [IDE Plugin] 在查找用例（find usages）期间处理进程取消（#4340）
- [IDE Plugin] 修复异步代码的 IDE 生成（#4406）
- [IDE Plugin] 将包结构的组装改为单次计算，并移出 EDT 线程（#4417）
- [IDE Plugin] 在 2023.2 上使用正确的存根索引键进行 Kotlin 类型解析（#4416）
- [IDE Plugin] 在执行搜索前等待索引就绪（#4419）
- [IDE Plugin] 若索引不可用则不执行跳转（goto）（#4420）
- [Compiler] 修复分组语句的结果表达式（#4378）
- [Compiler] 不将虚拟表用作接口类型（#4427，由 @hfhbd 贡献）

## [2.0.0-rc02] - 2023-06-27 {id="2-0-0-rc02-2023-06-27"}
[2.0.0-rc02]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-rc02

### 新增
- [MySQL Dialect] 支持小写日期类型以及在日期类型上使用 min 和 max（#4243，由 @shellderp 贡献）
- [MySQL Dialect] 为二元表达式和 sum 支持 MySQL 类型（#4254，由 @shellderp 贡献）
- [MySQL Dialect] 支持不带显示宽度的无符号整型（#4306，由 @shellderp 贡献）
- [MySQL Dialect] 支持 LOCK IN SHARED MODE
- [PostgreSQL Dialect] 在 min max 中添加布尔和 Timestamp 支持（#4245，由 @griffio 贡献）
- [PostgreSQL Dialect] Postgres：添加窗口函数支持（#4283，由 @hfhbd 贡献）
- [Runtime] 为运行时添加 linuxArm64、androidNative 和 watchosDeviceArm 目标平台（#4258，由 @hfhbd 贡献）
- [Paging Extension] 为分页扩展添加 linux 和 mingw x64 目标平台（#4280，由 @chippman 贡献）

### 变更
- [Gradle Plugin] 为 Android API 34 添加自动方言支持（#4251）
- [Paging Extension] 在 QueryPagingSource 中添加对 SuspendingTransacter 的支持（#4292，由 @daio 贡献）
- [Runtime] 改进 addListener API（#4244，由 @hfhbd 贡献）
- [Runtime] 使用 Long 作为迁移版本（#4297，由 @hfhbd 贡献）

### 修复
- [Gradle Plugin] 为生成的源代码使用稳定的输出路径（#4269，由 @joshfriend 贡献）
- [Gradle Plugin] Gradle 调整（#4222，由 @3flex 贡献）

## [2.0.0-rc01] - 2023-05-29 {id="2-0-0-rc01-2023-05-29"}
[2.0.0-rc01]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-rc01

### 新增
- [Paging] 为分页扩展添加 js 浏览器目标平台（#3843，由 @sproctor 贡献）
- [Paging] 为 androidx-paging3 扩展添加 iosSimulatorArm64 目标平台（#4117）
- [PostgreSQL Dialect] 添加对 gen_random_uuid() 的支持和测试（#3855，由 @davidwheeler123 贡献）
- [PostgreSQL Dialect] Postgres alter table add constraint（#4116，由 @griffio 贡献）
- [PostgreSQL Dialect] Alter table add constraint check（#4120，由 @griffio 贡献）
- [PostgreSQL Dialect] 添加 PostgreSQL 字符长度函数（#4121，由 @griffio 贡献）
- [PostgreSQL Dialect] 添加 PostgreSQL 列默认 interval（#4142，由 @griffio 贡献）
- [PostgreSQL Dialect] 添加 PostgreSQL interval 列结果（#4152，由 @griffio 贡献）
- [PostgreSQL Dialect] 添加 PostgreSQL Alter Column 支持（#4165，由 @griffio 贡献）
- [PostgreSQL Dialect] PostgreSQL：添加 date_part（#4198，由 @hfhbd 贡献）
- [MySQL Dialect] 添加 SQL 字符长度函数（#4134，由 @griffio 贡献）
- [IDE Plugin] 添加 sqldelight 目录建议（#3976，由 @aperfilyev 贡献）
- [IDE Plugin] 在项目树中紧凑显示中间包（#3992，由 @aperfilyev 贡献）
- [IDE Plugin] 添加 join 子句补全（#4086，由 @aperfilyev 贡献）
- [IDE Plugin] 添加创建视图的意图和实时模板（#4074，由 @aperfilyev 贡献）
- [IDE Plugin] 对 DELETE 或 UPDATE 中缺失 WHERE 发出警告（#4058，由 @aperfilyev 贡献）
- [Gradle Plugin] 启用类型安全的项目访问器（#4005，由 @hfhbd 贡献）

### 变更
- [Gradle Plugin] 允许通过 ServiceLoader 机制为 VerifyMigrationTask 注册 DriverInitializer（#3986，由 @C2H6O 贡献）
- [Gradle Plugin] 创建显式编译器环境（#4079，由 @hfhbd 贡献）
- [JS Driver] 将 Web Worker 驱动程序拆分为单独的构件
- [JS Driver] 不再公开 JsWorkerSqlCursor（#3874，由 @hfhbd 贡献）
- [JS Driver] 禁用 sqljs 驱动程序的发布（#4108）
- [Runtime] 强制要求同步驱动程序必须具有同步架构初始化程序（#4013）
- [Runtime] 改进游标（Cursor）的异步支持（#4102）
- [Runtime] 移除已弃用的目标平台（#4149，由 @hfhbd 贡献）
- [Runtime] 移除对旧内存管理器的支持（#4148，由 @hfhbd 贡献）

### 修复
- [R2DBC Driver] R2DBC：等待驱动程序关闭（#4139，由 @hfhbd 贡献）
- [Compiler] 在 database create(SqlDriver) 中包含迁移中的 PRAGMA（#3845，由 @MariusVolkhart 贡献）
- [Compiler] 修复 RETURNING 子句的代码生成（#3872，由 @MariusVolkhart 贡献）
- [Compiler] 不为虚拟表生成类型（#4015）
- [Gradle Plugin] 若干细微的 Gradle 插件体验改进（#3930，由 @zacsweers 贡献）
- [IDE Plugin] 修复未解析的 Kotlin 类型（#3924，由 @aperfilyev 贡献）
- [IDE Plugin] 修复展开通配符意图使其可与限定符一起使用（#3979，由 @aperfilyev 贡献）
- [IDE Plugin] 缺失 java home 时使用可用的 JDK（#3925，由 @aperfilyev 贡献）
- [IDE Plugin] 修复对包名的查找用例（#4010）
- [IDE Plugin] 不对无效元素显示自动导入（#4008）
- [IDE Plugin] 如果缺少方言则不进行解析（#4009）
- [IDE Plugin] 在处于失效状态时忽略 IDE 运行编译器（#4016）
- [IDE Plugin] 添加对 IntelliJ 2023.1 的支持（#4037，由 @madisp 贡献）
- [IDE Plugin] 列重命名时同步重命名具名实参的使用（#4027，由 @aperfilyev 贡献）
- [IDE Plugin] 修复添加迁移弹出窗口问题（#4105，由 @aperfilyev 贡献）
- [IDE Plugin] 在迁移文件中禁用 SchemaNeedsMigrationInspection（#4106，由 @aperfilyev 贡献）
- [IDE Plugin] 生成迁移时使用 SQL 列名而非类型名称（#4112，由 @aperfilyev 贡献）

## [2.0.0-alpha05] - 2023-01-20 {id="2-0-0-alpha05-2023-01-20"}
[2.0.0-alpha05]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha05

### 新增
- [Paging] 多平台分页扩展（由 @jeffdgr8 贡献）
- [Runtime] 为 Listener 接口添加 fun 修饰符。
- [SQLite Dialect] 添加 SQLite 3.33 支持（UPDATE FROM）（由 @eygraber 贡献）
- [PostgreSQL Dialect] 在 PostgreSQL 中支持 UPDATE FROM（由 @eygraber 贡献）

### 变更
- [RDBC Driver] 公开连接（由 @hfhbd 贡献）
- [Runtime] 将迁移回调移入主 `migrate` 函数中
- [Gradle Plugin] 对下游项目隐藏 Configuration
- [Gradle Plugin] 仅着色（shade）IntelliJ（由 @hfhbd 贡献）
- [Gradle Plugin] 支持 Kotlin 1.8.0-Beta 并添加多版本 Kotlin 测试（由 @hfhbd 贡献）

### 修复
- [RDBC Driver] 改用 javaObjectType（由 @hfhbd 贡献）
- [RDBC Driver] 修复 bindStatement 中的基本类型 null 值（由 @hfhbd 贡献）
- [RDBC Driver] 支持 R2DBC 1.0（由 @hfhbd 贡献）
- [PostgreSQL Dialect] Postgres：修复不带类型形参的 Array（由 @hfhbd 贡献）
- [IDE Plugin] 将 IntelliJ 升级至 221.6008.13（由 @hfhbd 贡献）
- [Compiler] 从纯视图中解析递归源表（由 @hfhbd 贡献）
- [Compiler] 使用表外键子句中的值类（value class）（由 @hfhbd 贡献）
- [Compiler] 修复 SelectQueryGenerator 以支持不带圆括号的绑定表达式（由 @bellatoris 贡献）
- [Compiler] 修复使用事务时 ${name}Indexes 变量重复生成的问题（由 @sachera 贡献）

## [1.5.5] - 2023-01-20 {id="1-5-5-2023-01-20"}
[1.5.5]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.5

这是针对 Kotlin 1.8 和 IntelliJ 2021+ 的兼容性发布版本，支持 JDK 17。

## [1.5.4] - 2022-10-06 {id="1-5-4-2022-10-06"}
[1.5.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.4

这是针对 Kotlin 1.7.20 和 AGP 7.3.0 的兼容性更新。

## [2.0.0-alpha04] - 2022-10-03 {id="2-0-0-alpha04-2022-10-03"}
[2.0.0-alpha04]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha04

### 破坏性变更 {id="breaking-changes"}

- Paging 3 扩展 API 已更改为仅允许计数使用 int 类型。
- 协程扩展现在需要显式传入调度器（dispatcher），不再提供默认值。
- Dialect 和 Driver 类现为 final 类，请改用委托（delegation）。

### 新增
- [HSQL Dialect] Hsql：支持在 Insert 中对生成列使用 DEFAULT（#3372，由 @hfhbd 贡献）
- [PostgreSQL Dialect] PostgreSQL：支持在 INSERT 中对生成列使用 DEFAULT（#3373，由 @hfhbd 贡献）
- [PostgreSQL Dialect] 在 PostgreSQL 中添加 NOW()（#3403，由 @hfhbd 贡献）
- [PostgreSQL Dialect] PostgreSQL 添加 NOT 运算符（#3504，由 @hfhbd 贡献）
- [Paging] 允许将 CoroutineContext 传入 *QueryPagingSource（#3384）
- [Gradle Plugin] 为方言添加更好的版本目录支持（#3435）
- [Native Driver] 添加回调以挂入 NativeSqliteDriver 的 DatabaseConfiguration 创建流程（#3512，由 @svenjacobs 贡献）

### 变更
- [Paging] 为由 KeyedQueryPagingSource 支持的 QueryPagingSource 函数添加默认调度器（#3385）
- [Paging] 使 OffsetQueryPagingSource 仅支持 Int（#3386）
- [Async Runtime] 将 await* 移至上层类 ExecutableQuery（#3524，由 @hfhbd 贡献）
- [Coroutines Extensions] 移除 flow 扩展的默认实参（#3489）

### 修复
- [Gradle Plugin] 更新至 Kotlin 1.7.20（#3542，由 @zacsweers 贡献）
- [R2DBC Driver] 适配并不总是发送值的 R2DBC 变更（#3525，由 @hfhbd 贡献）
- [HSQL Dialect] 修复在 Hsql 下失败的 SQLite VerifyMigrationTask（#3380，由 @hfhbd 贡献）
- [Gradle Plugin] 将任务转换为使用延迟配置（lazy configuration）API（由 @3flex 贡献）
- [Gradle Plugin] 避免在 Kotlin 1.7.20 中出现 NPE（#3398，由 @ZacSweers 贡献）
- [Gradle Plugin] 修复压缩迁移任务的描述（#3449）
- [IDE Plugin] 修复在较新的 Kotlin 插件中出现的 NoSuchFieldError（#3422，由 @madisp 贡献）
- [IDE Plugin] IDEA：UnusedQueryInspection - 修复 ArrayIndexOutOfBoundsException（#3427，由 @vanniktech 贡献）
- [IDE Plugin] 对旧版 Kotlin 插件引用采用反射调用
- [Compiler] 带有扩展函数的自定义方言不再创建导入（#3338，由 @hfhbd 贡献）
- [Compiler] 修复转义 CodeBlock.of("${CodeBlock.toString()}")（#3340，由 @hfhbd 贡献）
- [Compiler] 在迁移中等待异步执行语句（#3352）
- [Compiler] 修复 AS（#3370，由 @hfhbd 贡献）
- [Compiler] `getObject` 方法支持自动填充实际类型（#3401，由 @robxyy 贡献）
- [Compiler] 修复异步分组 returning 语句的代码生成（#3411）
- [Compiler] 尽可能推断绑定形参的 Kotlin 类型，或以更清晰的错误消息报错（#3413，由 @hfhbd 贡献）
- [Compiler] 不允许使用 ABS("foo")（#3430，由 @hfhbd 贡献）
- [Compiler] 支持从其他形参推断 Kotlin 类型（#3431，由 @hfhbd 贡献）
- [Compiler] 始终创建数据库实现（#3540，由 @hfhbd 贡献）
- [Compiler] 放宽 JavaDoc 规则并将其也添加到自定义映射器函数中（#3554，由 @hfhbd 贡献）
- [Compiler] 修复绑定中的 DEFAULT（由 @hfhbd 贡献）
- [Paging] 修复 Paging 3（#3396）
- [Paging] 允许使用 Long 构建 OffsetQueryPagingSource（#3409）
- [Paging] 不再静态替换 Dispatchers.Main（#3428）

## [2.0.0-alpha03] - 2022-06-17 {id="2-0-0-alpha03-2022-06-17"}
[2.0.0-alpha03]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha03

### 破坏性变更

- 方言现在像普通的 Gradle 依赖项一样进行引用。
```groovy
sqldelight {
  MyDatabase {
    dialect("app.cash.sqldelight:postgres-dialect:2.0.0-alpha03")
  }
}
```
- 移除了 `AfterVersionWithDriver` 类型，转而使用始终包含驱动程序的 `AfterVersion`。
- `Schema` 类型不再是 `SqlDriver` 的子类型。
- `PreparedStatement` API 现在采用从 0 开始的索引。

### 新增
- [IDE Plugin] 添加了对在运行中数据库上执行 SQLite、MySQL 和 PostgreSQL 命令的支持（#2718，由 @aperfilyev 贡献）
- [IDE Plugin] 添加对 Android Studio 数据库检查器（DB inspector）的支持（#3107，由 @aperfilyev 贡献）
- [Runtime] 添加对异步驱动程序的支持（#3168，由 @dellisd 贡献）
- [Native Driver] 支持新的 Kotlin/Native 内存模型（#3177，由 @kpgalligan 贡献）
- [JS Driver] 添加 SqlJs worker 驱动程序（#3203，由 @dellisd 贡献）
- [Gradle Plugin] 公开 SQLDelight 任务的类路径
- [Gradle Plugin] 添加用于压缩（squashing）迁移的 Gradle 任务
- [Gradle Plugin] 添加在迁移检查期间忽略架构定义的标志
- [MySQL Dialect] 在 MySQL 中支持 FOR SHARE 和 FOR UPDATE（#3098）
- [MySQL Dialect] 支持 MySQL 索引提示（index hints）（#3099）
- [PostgreSQL Dialect] 添加 date_trunc（#3295，由 @hfhbd 贡献）
- [JSON Extensions] 支持 JSON 表函数（#3090）

### 变更
- [Runtime] 移除不带驱动程序的 AfterVersion 类型（#3091）
- [Runtime] 将 Schema 类型移至顶级
- [Runtime] 开放方言和解析器以支持第三方实现（#3232，由 @hfhbd 贡献）
- [Compiler] 在失败报告中包含用于编译的方言（#3086）
- [Compiler] 跳过未使用的适配器（#3162，由 @eygraber 贡献）
- [Compiler] 在 PrepareStatement 中使用从 0 开始的索引（#3269，由 @hfhbd 贡献）
- [Gradle Plugin] 将方言规范为正式的 Gradle 依赖项而非字符串（#3085）
- [Gradle Plugin] Gradle 验证任务：缺少数据库文件时抛出异常（#3126，由 @vanniktech 贡献）

### 修复
- [Gradle Plugin] 对 Gradle 插件的小幅清理与调整（#3171，由 @3flex 贡献）
- [Gradle Plugin] 生成目录不再使用 AGP 字符串
- [Gradle Plugin] 使用 AGP namespace 特性（#3220）
- [Gradle Plugin] 不将 kotlin-stdlib 添加为 Gradle 插件的运行时依赖项（#3245，由 @mbonnin 贡献）
- [Gradle Plugin] 简化多平台配置（#3246，由 @mbonnin 贡献）
- [Gradle Plugin] 支持纯 JS 项目（#3310，由 @hfhbd 贡献）
- [IDE Plugin] 为 Gradle 工具 API 使用 java home（#3078）
- [IDE Plugin] 在 IDE 插件内部的正确 classLoader 上加载 JDBC 驱动程序（#3080）
- [IDE Plugin] 在使元素失效前将其标记为 null，以避免在已有的 PSI 变更期间发生错误（#3082）
- [IDE Plugin] 在 ALTER TABLE 语句中查找新表名的用例时不发生崩溃（#3106）
- [IDE Plugin] 优化检查器（inspector），并使其在遇到预期的异常类型时静默失败（#3121）
- [IDE Plugin] 删除本应为生成目录的文件（#3198）
- [IDE Plugin] 修复非安全运算符调用
- [Compiler] 确保带 RETURNING 语句的更新和删除操作执行查询（#3084）
- [Compiler] 在复合查询中正确推断实参类型（#3096）
- [Compiler] 通用表不会生成数据类，因此不再返回它们（#3097）
- [Compiler] 更快地查找顶级迁移文件（#3108）
- [Compiler] 在管道运算符上正确继承为 null 性
- [Compiler] 支持 ANSI SQL 的 iif 函数
- [Compiler] 不生成空的查询文件（#3300，由 @hfhbd 贡献）
- [Compiler] 修复仅含问号的适配器问题（#3314，由 @hfhbd 贡献）
- [PostgreSQL Dialect] Postgres 主键列始终非空（#3092）
- [PostgreSQL Dialect] 修复在多个表中使用相同名称进行复制的问题（#3297，由 @hfhbd 贡献）
- [SQLite 3.35 Dialect] 仅在从变更后的表中删除带索引的列时才报错（#3158，由 @eygraber 贡献）

## [2.0.0-alpha02] - 2022-04-13 {id="2-0-0-alpha02-2022-04-13"}
[2.0.0-alpha02]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha02

### 破坏性变更

- 您需要将所有出现的 `app.cash.sqldelight.runtime.rx` 替换为 `app.cash.sqldelight.rx2`

### 新增
- [Compiler] 支持在分组语句末尾使用 returning
- [Compiler] 支持通过方言模块扩展编译器，并添加了 SQLite JSON 扩展（#1379、#2087）
- [Compiler] 支持有返回值的 PRAGMA 语句（#1106）
- [Compiler] 支持为标记的列生成值类型
- [Compiler] 添加对乐观锁和验证的支持（#1952）
- [Compiler] 支持多重更新（multi-update）语句
- [PostgreSQL] 支持 Postgres returning 语句
- [PostgreSQL] 支持 Postgres 日期类型
- [PostgreSQL] 支持 PG intervals
- [PostgreSQL] 支持 PG 布尔类型，并修复 alter table 上的插入操作
- [PostgreSQL] 支持 Postgres 中的可选 limit
- [PostgreSQL] 支持 PG BYTEA 类型
- [PostgreSQL] 为 Postgres serial 添加测试
- [PostgreSQL] 支持 Postgres 的 for update 语法
- [PostgreSQL] 支持 PostgreSQL 数组类型
- [PostgreSQL] 在 PG 中正确存储/检索 UUID 类型
- [PostgreSQL] 支持 PostgreSQL NUMERIC 类型（#1882）
- [PostgreSQL] 支持在通用表表达式内部返回查询（#2471）
- [PostgreSQL] 支持 JSON 特定运算符
- [PostgreSQL] 添加 Postgres Copy 支持（由 @hfhbd 贡献）
- [MySQL] 支持 MySQL Replace
- [MySQL] 支持 NUMERIC/BigDecimal MySQL 类型（#2051）
- [MySQL] 支持 MySQL truncate 语句
- [MySQL] 在 MySQL 中支持 JSON 特定运算符（由 @eygraber 贡献）
- [MySQL] 支持 MySQL INTERVAL（#2969，由 @eygraber 贡献）
- [HSQL] 添加 HSQL 窗口功能
- [SQLite] 不在 WHERE 中替换可为空形参的相等性检查（#1490，由 @eygraber 贡献）
- [SQLite] 支持 SQLite 3.35 returning 语句（#1490，由 @eygraber 贡献）
- [SQLite] 支持 GENERATED 子句
- [SQLite] 添加对 SQLite 3.38 方言的支持（由 @eygraber 贡献）

### 变更
- [Compiler] 适当整理生成的代码
- [Compiler] 禁止在分组语句中使用表形参（#1822）
- [Compiler] 将分组查询放入事务中（#2785）
- [Runtime] 从驱动程序的 execute 方法中返回更新的行数
- [Runtime] 将 SqlCursor 限制在访问连接的临界区内（#2123，由 @andersio 贡献）
- [Gradle Plugin] 为迁移比对架构定义（#841）
- [PostgreSQL] 针对 PG 禁用双引号
- [MySQL] 在 MySQL 中使用 == 时报错（#2673）

### 修复
- [Compiler] 修复在 2.0 alpha 中由于来自不同表的相同适配器类型导致的编译错误
- [Compiler] 修复编译 upsert 语句时的问题（#2791）
- [Compiler] 存在多个匹配时，查询结果应使用 select 中的表（#1874、#2313）
- [Compiler] 支持更新具有 INSTEAD OF 触发器的视图（#1018）
- [Compiler] 在函数名称中支持 from 和 for
- [Compiler] 允许在函数表达式中使用 SEPARATOR 关键字
- [Compiler] 无法在 ORDER BY 中访问带别名表的 ROWID
- [Compiler] 在 MySQL 中 HAVING 子句无法识别带别名的列名
- [Compiler] 修复错误的“Multiple columns found”错误
- [Compiler] 修复无法设置 PRAGMA locking_mode = EXCLUSIVE; 的问题
- [PostgreSQL] PostgreSQL 重命名列
- [MySQL] 修复无法识别 UNIX_TIMESTAMP、TO_SECONDS、JSON_ARRAYAGG 等 MySQL 函数的问题
- [SQLite] 修复 SQLite 窗口功能
- [IDE Plugin] 在空进度指示器中运行 goto 处理程序（#2990）
- [IDE Plugin] 确保如果项目未配置，则不高亮显示 visitor（#2981、#2976）
- [IDE Plugin] 确保在 IDE 中也会更新可传递生成的代码（#1837）
- [IDE Plugin] 更新方言时使索引失效

## [2.0.0-alpha01] - 2022-03-31 {id="2-0-0-alpha01-2022-03-31"}
[2.0.0-alpha01]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha01

这是 2.0 的首个 Alpha 版本，包含一些破坏性变更。我们预计后续还会有更多破坏 ABI 的变更，因此请勿发布依赖此版本的库（应用程序项目则可以正常使用）。

### 破坏性变更

- 首先，您需要将所有出现的 `com.squareup.sqldelight` 替换为 `app.cash.sqldelight`
- 其次，您需要将所有出现的 `app.cash.sqldelight.android` 替换为 `app.cash.sqldelight.driver.android`
- 第三，您需要将所有出现的 `app.cash.sqldelight.sqlite.driver` 替换为 `app.cash.sqldelight.driver.jdbc.sqlite`
- 第四，您需要将所有出现的 `app.cash.sqldelight.drivers.native` 替换为 `app.cash.sqldelight.driver.native`
- IDE 插件必须更新至 2.X 版本，可在 [alpha 或 eap 渠道](https://plugins.jetbrains.com/plugin/8191-sqldelight/versions/alpha) 获取
- 方言现在是可以在 Gradle 中指定的依赖项：

```gradle
sqldelight {
  MyDatabase {
    packageName = "com.example"
    dialect = "app.cash.sqldelight:mysql-dialect:2.0.0-alpha01"
  }
}
```

当前支持的方言包括 `mysql-dialect`、`postgresql-dialect`、`hsql-dialect`、`sqlite-3-18-dialect`、`sqlite-3-24-dialect`、`sqlite-3-25-dialect`、`sqlite-3-30-dialect` 和 `sqlite-3-35-dialect`

- 基本类型现在必须导入（例如 `INTEGER AS Boolean` 必须 `import kotlin.Boolean`），此前支持的部分类型现在需要适配器。大多数转换所需的基本类型适配器可从 `app.cash.sqldelight:primitive-adapters:2.0.0-alpha01` 中获取（例如使用 `IntColumnAdapter` 进行 `Integer AS kotlin.Int` 转换）。

### 新增
- [IDE Plugin] 基础的建议迁移支持（由 @aperfilyev 贡献）
- [IDE Plugin] 添加导入提示操作（由 @aperfilyev 贡献）
- [IDE Plugin] 添加 Kotlin 类补全（由 @aperfilyev 贡献）
- [Gradle Plugin] 为 Gradle 类型安全项目访问器添加快捷方式（由 @hfhbd 贡献）
- [Compiler] 根据方言定制代码生成（由 @MariusVolkhart 贡献）
- [JDBC Driver] 为 JdbcDriver 添加常用类型（由 @MariusVolkhart 贡献）
- [SQLite] 添加对 SQLite 3.35 的支持（由 @eygraber 贡献）
- [SQLite] 添加对 ALTER TABLE DROP COLUMN 的支持（由 @eygraber 贡献）
- [SQLite] 添加对 SQLite 3.30 方言的支持（由 @eygraber 贡献）
- [SQLite] 在 SQLite 中支持 NULLS FIRST/LAST（由 @eygraber 贡献）
- [HSQL] 为 generated 子句添加 HSQL 支持（由 @MariusVolkhart 贡献）
- [HSQL] 在 HSQL 中添加对命名参数的支持（由 @MariusVolkhart 贡献）
- [HSQL] 定制 HSQL 插入查询（由 @MariusVolkhart 贡献）

### 变更
- [全局] 包名已从 com.squareup.sqldelight 变更为 app.cash.sqldelight。
- [Runtime] 将方言移动到各自独立的 Gradle 模块中
- [Runtime] 切换到驱动程序实现的查询通知。
- [Runtime] 将默认列适配器提取到单独的模块中（#2056、#2060）
- [Compiler] 由模块生成查询实现，而不是在每个模块中重复生成
- [Compiler] 移除生成的数据类中自定义的 toString 生成（由 @PaulWoitaschek 贡献）
- [JS Driver] 从 sqljs-driver 中移除 sql.js 依赖（由 @dellisd 贡献）
- [Paging] 移除 Android paging 2 扩展
- [IDE Plugin] 在 SQLDelight 同步期间添加编辑器横幅提示（#2511）
- [IDE Plugin] 最低支持的 IntelliJ 版本为 2021.1

### 修复
- [Runtime] 展平监听器列表以减少分配和指针追逐（pointer chasing）（由 @andersio 贡献）
- [IDE Plugin] 修复错误消息以支持跳转到错误位置（由 @hfhbd 贡献）
- [IDE Plugin] 补充缺失的检查描述（#2768，由 @aperfilyev 贡献）
- [IDE Plugin] 修复 GotoDeclarationHandler 中的异常（#2531、#2688、#2804，由 @aperfilyev 贡献）
- [IDE Plugin] 高亮显示 import 关键字（由 @aperfilyev 贡献）
- [IDE Plugin] 修复未解析的 Kotlin 类型（#1678，由 @aperfilyev 贡献）
- [IDE Plugin] 修复未解析包的高亮显示问题（#2543，由 @aperfilyev 贡献）
- [IDE Plugin] 若项目索引尚未初始化，则不尝试检查不匹配的列
- [IDE Plugin] 在 Gradle 同步完成前不初始化文件索引
- [IDE Plugin] 如果 Gradle 开始同步，则取消 SQLDelight 导入
- [IDE Plugin] 在执行撤销操作的线程之外重新生成数据库
- [IDE Plugin] 如果无法解析引用，则使用空白 Java 类型
- [IDE Plugin] 在文件解析期间正确移出主线程，仅在写入时切回
- [IDE Plugin] 改进与旧版 IntelliJ 版本的兼容性（由 @3flex 贡献）
- [IDE Plugin] 使用更快的注解 API
- [Gradle Plugin] 在添加运行时支持时显式支持 js/android 插件（由 @ZacSweers 贡献）
- [Gradle Plugin] 注册迁移输出任务，无需从迁移中推导架构（#2744，由 @kevincianfarini 贡献）
- [Gradle Plugin] 若迁移任务崩溃，打印其运行时崩溃的文件
- [Gradle Plugin] 生成代码时对文件进行排序以确保输出具有幂等性（由 @ZacSweers 贡献）
- [Compiler] 使用更快的 API 遍历文件，不再遍历整个 PSI 图
- [Compiler] 为 select 函数形参添加关键字混淆重命名（#2759，由 @aperfilyev 贡献）
- [Compiler] 修复迁移适配器的 packageName（由 @hfhbd 贡献）
- [Compiler] 在属性上而非类型上生成注解（#2798，由 @aperfilyev 贡献）
- [Compiler] 在传递给 Query 子类型之前对实参进行排序（#2379，由 @aperfilyev 贡献）

## [1.5.3] - 2021-11-23 {id="1-5-3-2021-11-23"}
[1.5.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.3

### 新增
- [JDBC Driver] 开放 JdbcDriver 以供第三方驱动程序实现（#2672，由 @hfhbd 贡献）
- [MySQL Dialect] 补充缺失的时间增量函数（#2671，由 @sdoward 贡献）
- [Coroutines Extension] 为 coroutines-extensions 添加 M1 目标平台（由 @PhilipDukhov 贡献）

### 变更
- [Paging3 Extension] 将 sqldelight-android-paging3 作为 JAR 而非 AAR 发布（#2634，由 @julioromano 贡献）
- 同时作为弱关键字（soft keyword）的属性名称现在将追加下划线后缀。例如 `value` 将作为 `value_` 公开

### 修复
- [Compiler] 不对重复的数组形参提取变量（由 @aperfilyev 贡献）
- [Gradle Plugin] 添加 kotlin.mpp.enableCompatibilityMetadataVariant（#2628，由 @martinbonnin 贡献）
- [IDE Plugin] 查找用例处理需要读操作权限

## [1.5.2] - 2021-10-12 {id="1-5-2-2021-10-12"}
[1.5.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.2

### 新增
- [Gradle Plugin] 支持 HMPP（#2548，由 @martinbonnin 贡献）
- [IDE Plugin] 添加 NULL 比较检查（由 @aperfilyev 贡献）
- [IDE Plugin] 添加检查抑制器（inspection suppressor）（#2519，由 @aperfilyev 贡献）
- [IDE Plugin] 混合命名与位置参数检查（由 @aperfilyev 贡献）
- [SQLite Driver] 添加 mingwX86 目标平台（#2558，由 @enginegl 贡献）
- [SQLite Driver] 添加 M1 目标平台
- [SQLite Driver] 添加 linuxX64 支持（#2456，由 @chippmann 贡献）
- [MySQL Dialect] 为 MySQL 添加 ROW_COUNT 函数（#2523）
- [PostgreSQL Dialect] Postgres 重命名、删除列（由 @pabl0rg 贡献）
- [PostgreSQL Dialect] 修复 PostgreSQL 语法无法识别 CITEXT 的问题
- [PostgreSQL Dialect] 引入 TIMESTAMP WITH TIME ZONE 和 TIMESTAMPTZ
- [PostgreSQL Dialect] 添加 PostgreSQL GENERATED 列的语法支持
- [Runtime] 为 AfterVersion 提供 SqlDriver 作为形参（#2534、#2614，由 @ahmedre 贡献）

### 变更
- [Gradle Plugin] 显式要求 Gradle 7.0（#2572，由 @martinbonnin 贡献）
- [Gradle Plugin] 让 VerifyMigrationTask 支持 Gradle 的最新检查（up-to-date checks）（#2533，由 @3flex 贡献）
- [IDE Plugin] 将可空类型与非空类型连接时，不再提示“Join compares two columns of different types”警告（#2550，由 @pchmielowski 贡献）
- [IDE Plugin] 明确列类型中小写 'as' 的错误提示（由 @aperfilyev 贡献）

### 修复
- [IDE Plugin] 若项目已被处置（disposed），则不在新方言下重新解析（#2609）
- [IDE Plugin] 如果关联的虚拟文件为 null，则模块为 null（#2607）
- [IDE Plugin] 避免在未使用查询检查期间发生崩溃（#2610）
- [IDE Plugin] 在写操作（write action）内部运行数据库同步写入（#2605）
- [IDE Plugin] 由 IDE 调度 SQLDelight 的同步操作
- [IDE Plugin] 修复 JavaTypeMixin 中的 NPE（#2603，由 @aperfilyev 贡献）
- [IDE Plugin] 修复 MismatchJoinColumnInspection 中的 IndexOutOfBoundsException（#2602，由 @aperfilyev 贡献）
- [IDE Plugin] 为 UnusedColumnInspection 添加描述（#2600，由 @aperfilyev 贡献）
- [IDE Plugin] 将 PsiElement.generatedVirtualFiles 包装在读操作中（#2599，由 @aperfilyev 贡献）
- [IDE Plugin] 移除不必要的 nonnull 转换（#2596）
- [IDE Plugin] 正确处理查找用例中的 null 值（#2595）
- [IDE Plugin] 修复 Android 生成文件的 IDE 自动补全（#2573，由 @martinbonnin 贡献）
- [IDE Plugin] 修复 SqlDelightGotoDeclarationHandler 中的 NPE（由 @aperfilyev 贡献）
- [IDE Plugin] 混淆处理 insert 语句内实参中的 Kotlin 关键字（#2433，由 @aperfilyev 贡献）
- [IDE Plugin] 修复 SqlDelightFoldingBuilder 中的 NPE（#2382，由 @aperfilyev 贡献）
- [IDE Plugin] 捕获 CopyPasteProcessor 中的 ClassCastException（#2369，由 @aperfilyev 贡献）
- [IDE Plugin] 修复更新实时模板（由 @IliasRedissi 贡献）
- [IDE Plugin] 为意图操作添加描述（#2489，由 @aperfilyev 贡献）
- [IDE Plugin] 修复在找不到表时 CreateTriggerMixin 中的异常（由 @aperfilyev 贡献）
- [Compiler] 拓扑排序建表语句
- [Compiler] 停止在目录上调用 `forDatabaseFiles` 回调（#2532）
- [Gradle Plugin] 将 generateDatabaseInterface 任务依赖传播给潜在使用者（#2518，由 @martinbonnin 贡献）

## [1.5.1] - 2021-07-16 {id="1-5-1-2021-07-16"}
[1.5.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.1

### 新增
- [PostgreSQL Dialect] PostgreSQL JSONB 与 ON Conflict Do Nothing（由 @satook 贡献）
- [PostgreSQL Dialect] 添加对 PostgreSQL ON CONFLICT (column, ...) DO UPDATE 的支持（由 @satook 贡献）
- [MySQL Dialect] 支持 MySQL 生成列（由 @JGulbronson 贡献）
- [Native Driver] 添加 watchosX64 支持
- [IDE Plugin] 添加形参类型和注解（由 @aperfilyev 贡献）
- [IDE Plugin] 添加生成“查询全部（select all）”查询的操作（由 @aperfilyev 贡献）
- [IDE Plugin] 在自动补全中显示列类型（由 @aperfilyev 贡献）
- [IDE Plugin] 在自动补全中添加图标（由 @aperfilyev 贡献）
- [IDE Plugin] 添加生成“按主键查询（select by primary key）”查询的操作（由 @aperfilyev 贡献）
- [IDE Plugin] 添加生成“插入（insert into）”查询的操作（由 @aperfilyev 贡献）
- [IDE Plugin] 为列名、语句标识符、函数名添加高亮显示（由 @aperfilyev 贡献）
- [IDE Plugin] 添加其余查询生成操作（#489，由 @aperfilyev 贡献）
- [IDE Plugin] 显示来自 insert-stmt 的形参提示（由 @aperfilyev 贡献）
- [IDE Plugin] 表别名意图操作（由 @aperfilyev 贡献）
- [IDE Plugin] 限定列名意图（由 @aperfilyev 贡献）
- [IDE Plugin] 跳转到 Kotlin 属性声明（由 @aperfilyev 贡献）

### 变更
- [Native Driver] 尽可能避免冻结和使用可共享数据结构，从而提高原生事务性能（由 @andersio 贡献）
- [Paging 3] 将 Paging3 版本升级至 3.0.0 稳定版
- [JS Driver] 升级 sql.js 至 1.5.0

### 修复
- [JDBC SQLite Driver] 在清理 ThreadLocal 之前先调用连接的 close()（#2444，由 @hannesstruss 贡献）
- [RX extensions] 修复订阅/处置（disposal）竞争泄漏问题（#2403，由 @pyricau 贡献）
- [Coroutines extension] 确保在通知之前已注册查询监听器
- [Compiler] 对 notifyQueries 排序以生成一致的 Kotlin 输出文件（由 @thomascjy 贡献）
- [Compiler] 不使用 @JvmField 注解 select 查询类属性（由 @eygraber 贡献）
- [IDE Plugin] 修复导入优化器（#2350，由 @aperfilyev 贡献）
- [IDE Plugin] 修复未使用的列检查（由 @aperfilyev 贡献）
- [IDE Plugin] 为导入检查和类注解器添加嵌套类支持（由 @aperfilyev 贡献）
- [IDE Plugin] 修复 CopyPasteProcessor 中的 NPE（#2363，由 @aperfilyev 贡献）
- [IDE Plugin] 修复 InlayParameterHintsProvider 中的崩溃（#2359，由 @aperfilyev 贡献）
- [IDE Plugin] 修复在向 create table 语句中粘贴任何文本时插入空行的问题（#2431，由 @aperfilyev 贡献）

## [1.5.0] - 2021-04-23 {id="1-5-0-2021-04-23"}
[1.5.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.0

### 新增
- [SQLite Javascript Driver] 启用 sqljs-driver 的发布（#1667，由 @dellisd 贡献）
- [Paging3 Extension] 针对 Android Paging 3 库的扩展（#1786，由 @kevincianfarini 贡献）
- [MySQL Dialect] 添加对 MySQL 的 ON DUPLICATE KEY UPDATE 冲突解决语法的支持（由 @rharter 贡献）
- [SQLite Dialect] 为 SQLite offsets() 添加编译器支持（由 @qjroberts 贡献）
- [IDE Plugin] 为未知类型添加导入快速修复（#683，由 @aperfilyev 贡献）
- [IDE Plugin] 添加未使用的导入检查（#1161，由 @aperfilyev 贡献）
- [IDE Plugin] 添加未使用的查询检查（由 @aperfilyev 贡献）
- [IDE Plugin] 添加未使用的列检查（#569，由 @aperfilyev 贡献）
- [IDE Plugin] 复制/粘贴时自动引入导入项（#684，由 @aperfilyev 贡献）
- [IDE Plugin] 当 Gradle/IntelliJ 插件版本不兼容时弹出气泡提示
- [IDE Plugin] Insert Into ... VALUES(?) 形参提示（#506，由 @aperfilyev 贡献）
- [IDE Plugin] 内联形参提示（由 @aperfilyev 贡献）
- [Runtime] 在运行时中引入用于带回调执行迁移的 API（#1844）

### 变更
- [Compiler] 智能转换 "IS NOT NULL" 查询（#867）
- [Compiler] 防止使用在运行时会导致失败的关键字（#1471、#1629）
- [Gradle Plugin] 将 Gradle 插件大小从 60 MB 缩减至 13 MB。
- [Gradle Plugin] 正确支持 Android 变体，并移除对 KMM 目标特定 SQL 的支持（#1039）
- [Gradle Plugin] 根据 minsdk 选择最低 SQLite 版本（#1684）
- [Native Driver] 原生驱动程序连接池及性能更新

### 修复
- [Compiler] Lambda 前的非换行空格（NBSP）（由 @oldergod 贡献）
- [Compiler] 修复生成的 bind* 和 cursor.get* 语句中类型不兼容的问题
- [Compiler] SQL 子句应保留适配后的类型（#2067）
- [Compiler] 仅含 NULL 关键字的列应可为空
- [Compiler] 生成映射器 lambda 时不带类型注解（#1957）
- [Compiler] 如果自定义查询会发生冲突，则使用文件名作为额外的包后缀（#1057、#1278）
- [Compiler] 确保外键级联会触发通知查询监听器（#1325、#1485）
- [Compiler] 如果联合（union）两个相同类型，返回表类型（#1342）
- [Compiler] 确保 ifnull 和 coalesce 的形参可为空（#1263）
- [Compiler] 正确将查询施加的为 null 性应用于表达式
- [MySQL Dialect] 支持 MySQL if 语句
- [PostgreSQL Dialect] 在 PostgreSQL 中将 NUMERIC 和 DECIMAL 检索为 Double（#2118）
- [SQLite Dialect] UPSERT 通知应考虑 BEFORE/AFTER UPDATE 触发器（#2198，由 @andersio 贡献）
- [SQLite Driver] 在 SqliteDriver 中为线程使用多个连接，除非是在内存中运行（#1832）
- [JDBC Driver] 修复 JDBC 驱动程序假设 autoCommit 为 true 的问题（#2041）
- [JDBC Driver] 确保在发生异常时关闭连接（#2306）
- [IDE Plugin] 修复因路径分隔符错误导致 Windows 上 GoToDeclaration/FindUsages 失效的问题（#2054，由 @angusholder 贡献）
- [IDE Plugin] 忽略 Gradle 错误，避免在 IDE 中崩溃
- [IDE Plugin] 若 sqldelight 文件被移动到非 sqldelight 模块，则不尝试生成代码
- [IDE Plugin] 在 IDE 中忽略代码生成错误
- [IDE Plugin] 确保不尝试执行负索引子字符串截取（#2068）
- [IDE Plugin] 确保在运行 Gradle 操作前项目未被处置（#2155）
- [IDE Plugin] 可空类型的算术运算结果也应可为空（#1853）
- [IDE Plugin] 使“展开 * 意图”支持额外的投影（#2173，由 @aperfilyev 贡献）
- [IDE Plugin] 若在 GoTo 期间 Kotlin 解析失败，不尝试跳转到 sqldelight 文件
- [IDE Plugin] 如果 IntelliJ 在 sqldelight 建立索引时遇到异常，不发生崩溃
- [IDE Plugin] 处理在 IDE 中代码生成前检测错误时发生的异常
- [IDE Plugin] 使 IDE 插件兼容动态插件（Dynamic Plugins）（#1536）
- [Gradle Plugin] 修复使用 WorkerApi 生成数据库时的竞态条件（#2062，由 @stephanenicolas 贡献）
- [Gradle Plugin] 修复 classLoaderIsolation 阻止自定义 JDBC 使用的问题（#2048，由 @benasher44 贡献）
- [Gradle Plugin] 改进缺失 packageName 时的错误消息（由 @vanniktech 贡献）
- [Gradle Plugin] 修复 SQLDelight 将 IntelliJ 依赖泄漏到构建脚本类路径上的问题（#1998）
- [Gradle Plugin] 修复 Gradle 构建缓存（#2075）
- [Gradle Plugin] 不在 Gradle 插件中依赖 kotlin-native-utils（由 @ilmat192 贡献）
- [Gradle Plugin] 若仅存在迁移文件，也写入数据库（#2094）
- [Gradle Plugin] 确保菱形依赖项在最终编译单元中仅被引入一次（#1455）

在此特别感谢 @3flex，他在本版本中为改进 SQLDelight 基础设施做出了大量贡献。

## [1.4.4] - 2020-10-08 {id="1-4-4-2020-10-08"}
[1.4.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.4

### 新增
- [PostgreSQL Dialect] 在 WITH 中支持数据修改语句
- [PostgreSQL Dialect] 支持 substring 函数
- [Gradle Plugin] 添加 verifyMigrations 标志，用于在 SQLDelight 编译期间验证迁移（#1872）

### 变更
- [Compiler] 在非 SQLite 方言中将 SQLite 特有函数标记为未知
- [Gradle Plugin] 当应用了 sqldelight 插件但未配置任何数据库时发出警告（#1421）

### 修复
- [Compiler] 在 ORDER BY 子句中绑定列名时报错（#1187，由 @eygraber 贡献）
- [Compiler] 生成数据库接口时出现 Registry 警告（#1792）
- [Compiler] case 语句的类型推断错误（#1811）
- [Compiler] 为没有版本的迁移文件提供更清晰的错误提示（#2006）
- [Compiler] 修复部分数据库类型 ColumnAdapter 所需编组的数据库类型不正确的问题（#2012）
- [Compiler] CAST 的为 null 性（#1261）
- [Compiler] 修复查询包装器中大量变量名遮蔽（name shadowed）的警告（#1946，由 @eygraber 贡献）
- [Compiler] 生成的代码正在使用完整限定名称（#1939）
- [IDE Plugin] 从 Gradle 同步触发 sqldelight 代码生成
- [IDE Plugin] 修改 `.sq` 文件时插件未能重新生成数据库接口（#1945）
- [IDE Plugin] 将文件移动到新包时的问题（#444）
- [IDE Plugin] 若光标无处可移，则不执行任何操作而非崩溃（#1994）
- [IDE Plugin] 对 Gradle 项目之外的文件使用空包名（#1973）
- [IDE Plugin] 针对无效类型实现平稳失败（#1943）
- [IDE Plugin] 遇到未知表达式时抛出更清晰的错误消息（#1958）
- [Gradle Plugin] 修复 SQLDelight 将 IntelliJ 依赖泄漏到构建脚本类路径上的问题（#1998）
- [Gradle Plugin] 在 *.sq 文件中添加方法文档时出现“JavadocIntegrationKt not found”编译错误（#1982）
- [Gradle Plugin] SqlDelight Gradle 插件不支持配置缓存（Configuration Caching, CoCa）（#1947，由 @stephanenicolas 贡献）
- [SQLite JDBC Driver] 修复 SQLException: database in auto-commit mode（#1832）
- [Coroutines Extension] 修复 coroutines-extensions 的 IR 后端问题（#1918，由 @dellisd 贡献）

## [1.4.3] - 2020-09-04 {id="1-4-3-2020-09-04"}
[1.4.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.3

### 新增
- [MySQL Dialect] 添加对 MySQL last_insert_id 函数的支持（由 @lawkai 贡献）
- [PostgreSQL Dialect] 支持 SERIAL 数据类型（由 @veyndan 与 @felipecsl 贡献）
- [PostgreSQL Dialect] 支持 PostgreSQL RETURNING（由 @veyndan 贡献）

### 修复
- [MySQL Dialect] 将 MySQL AUTO_INCREMENT 视为具有默认值（#1823）
- [Compiler] 修复 Upsert 语句编译器错误（#1809，由 @eygraber 贡献）
- [Compiler] 修复生成无效 Kotlin 代码的问题（#1925，由 @eygraber 贡献）
- [Compiler] 为未知函数提供更清晰的错误消息（#1843）
- [Compiler] 将 instr 第二个形参的类型公开为 String
- [IDE Plugin] 修复 IDE 插件的守护进程膨胀和 UI 线程卡顿问题（#1916）
- [IDE Plugin] 处理模块为 null 的场景（#1902）
- [IDE Plugin] 在未配置的 sq 文件中返回空字符串作为包名（#1920）
- [IDE Plugin] 修复分组语句并为其添加集成测试（#1820）
- [IDE Plugin] 使用内置 ModuleUtil 查找元素的模块（#1854）
- [IDE Plugin] 仅将有效元素添加到查找列表（#1909）
- [IDE Plugin] Parent 可以为 null（#1857）

## [1.4.2] - 2020-08-27 {id="1-4-2-2020-08-27"}
[1.4.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.2

### 新增
- [Runtime] 支持新的 JS IR 后端
- [Gradle Plugin] 添加 generateSqlDelightInterface Gradle 任务（由 @vanniktech 贡献）
- [Gradle Plugin] 添加 verifySqlDelightMigration Gradle 任务（由 @vanniktech 贡献）

### 修复
- [IDE Plugin] 使用 Gradle 工具 API 促进 IDE 与 Gradle 之间的数据共享
- [IDE Plugin] 架构推导默认设为 false
- [IDE Plugin] 正确检索 commonMain 源集
- [MySQL Dialect] 向 mySqlFunctionType() 添加 minute（由 @maaxgr 贡献）

## [1.4.1] - 2020-08-21 {id="1-4-1-2020-08-21"}
[1.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.1

### 新增
- [Runtime] 支持 Kotlin 1.4.0（#1859）

### 变更
- [Gradle Plugin] 将 AGP 依赖设置为 compileOnly（#1362）

### 修复
- [Compiler] 向列定义规则和表接口生成器中添加可选 Javadoc（#1224，由 @endanke 贡献）
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
- [MySQL Dialect] 支持 MySQL（由 @JGulbronson 和 @veyndan 贡献）
- [PostgreSQL Dialect] 实验性支持 PostgreSQL（由 @veyndan 贡献）
- [HSQL Dialect] 实验性支持 H2（由 @MariusVolkhart 贡献）
- [SQLite Dialect] 支持 SQLite FTS5（由 @benasher44 和 @jpalawaga 贡献）
- [SQLite Dialect] 支持 alter table rename column（#1505，由 @angusholder 贡献）
- [IDE] 对迁移（.sqm）文件的 IDE 支持
- [IDE] 添加仿照内置 SQL 实时模板的 SQLDelight 实时模板（#1154，由 @veyndan 贡献）
- [IDE] 添加新建 SqlDelight 文件操作（#42，由 @romtsn 贡献）
- [Runtime] 针对返回结果的事务提供 transactionWithReturn API
- [Compiler] 在 .sq 文件中将多个 SQL 语句组合在一起的分组语法
- [Compiler] 支持从迁移文件生成架构
- [Gradle Plugin] 添加用于将迁移文件输出为有效 SQL 的任务

### 变更
- [Documentation] 全面改版文档网站（由 @saket 贡献）
- [Gradle Plugin] 改进不支持方言时的错误消息（由 @veyndan 贡献）
- [IDE] 根据方言动态更改文件图标（由 @veyndan 贡献）
- [JDBC Driver] 公开基于 javax.sql.DataSource 的 JdbcDriver 构造函数（#1614）

### 修复
- [Compiler] 支持表上的 Javadoc，并修复单个文件中存在多个 Javadoc 的问题（#1224）
- [Compiler] 支持为合成列插入值（#1351）
- [Compiler] 修复目录名规范化清理中的不一致问题（由 @ZacSweers 贡献）
- [Compiler] 合成列在跨连接（join）时应保留为 null 性（#1656）
- [Compiler] 将 delete 语句锚定在 delete 关键字上（#1643）
- [Compiler] 修复引号转义问题（#1525，由 @angusholder 贡献）
- [Compiler] 修复 between 运算符以正确递归到表达式中（#1279）
- [Compiler] 创建索引时对缺失的表/列给出更清晰的错误提示（#1372）
- [Compiler] 支持在连接约束中使用外部查询的投影（#1346）
- [Native Driver] 使 execute 使用 transationPool（由 @benasher44 贡献）
- [JDBC Driver] 使用 JDBC 事务 API 替代 SQLite API（#1693）
- [IDE] 修复 virtualFile 引用，使其始终指向原始文件（#1782）
- [IDE] 向 bugsnag 报告错误时使用正确的 throwable（#1262）
- [Paging Extension] 修复 DataSource 泄漏问题（#1628）
- [Gradle Plugin] 生成架构时若输出 db 文件已存在，则将其删除（#1645）
- [Gradle Plugin] 迁移验证存在断档时直接失败
- [Gradle Plugin] 显式使用已设定的文件索引（#1644）

## [1.3.0] - 2020-04-03 {id="1-3-0-2020-04-03"}
[1.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.3.0

* 新增：[Gradle] dialect 属性，用于指定编译所针对的 SQL 方言。
* 新增：[Compiler] #1009 实验性支持 MySQL 方言。
* 新增：[Compiler] #1436 支持 sqlite:3.24 方言与 upsert。
* 新增：[JDBC Driver] 将 JDBC 驱动程序从 SQLite JVM 驱动程序中分离出来。
* 修复：[Compiler] #1199 支持任意长度的 lambda。
* 修复：[Compiler] #1610 修复 avg() 的返回值类型使其可为空。
* 修复：[IntelliJ] #1594 修复导致 Windows 上 Goto 和 Find Usages 失效的路径分隔符处理问题。

## [1.2.2] - 2020-01-22 {id="1-2-2-2020-01-22"}
[1.2.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.2

* 新增：[Runtime] 支持 Windows (mingw)、tvOS、watchOS 和 macOS 架构。
* 修复：[Compiler] sum() 的返回值类型应可为空。
* 修复：[Paging] 将 Transacter 传入 QueryDataSourceFactory 以避免竞态条件。
* 修复：[IntelliJ Plugin] 查找文件的包名时不搜索依赖项。
* 修复：[Gradle] #862 将 Gradle 中的验证器日志调整为 debug 级别。
* 改进：[Gradle] 将 GenerateSchemaTask 改造为使用 Gradle worker。
* 注意：sqldelight-runtime 构件已重命名为 runtime。

## [1.2.1] - 2019-12-11 {id="1-2-1-2019-12-11"}
[1.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.1

* 修复：[Gradle] 支持 Kotlin/Native 1.3.60。
* 修复：[Gradle] #1287 同步时的警告。
* 修复：[Compiler] #1469 为查询创建 SyntheticAccessor。
* 修复：[JVM Driver] 修复内存泄漏。
* 注意：协程扩展构件要求在 buildscript 中添加 kotlinx bintray maven 仓库。

## [1.2.0] - 2019-08-30 {id="1-2-0-2019-08-30"}
[1.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.0

* 新增：[Runtime] 稳定的 Flow API。
* 修复：[Gradle] 支持 Kotlin/Native 1.3.50。
* 修复：[Gradle] #1380 全新构建（clean build）偶尔失败的问题。
* 修复：[Gradle] #1348 运行验证任务时打印“Could not retrieve functions”。
* 修复：[Compiler] #1405 如果查询包含 FTS 表连接则无法构建项目。
* 修复：[Gradle] #1266 存在多个数据库模块时偶尔出现的 Gradle 构建失败问题。

## [1.1.4] - 2019-07-11 {id="1-1-4-2019-07-11"}
[1.1.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.4

* 新增：[Runtime] 实验性 Kotlin Flow API。
* 修复：[Gradle] Kotlin/Native 1.3.40 兼容性。
* 修复：[Gradle] #1243 修复 SQLDelight 与 Gradle 按需配置（configure on demand）配合使用的问题。
* 修复：[Gradle] #1385 修复 SQLDelight 与增量注解处理配合使用的问题。
* 修复：[Gradle] 允许 Gradle 任务缓存。
* 修复：[Gradle] #1274 支持在 Kotlin DSL 中使用 sqldelight 扩展。
* 修复：[Compiler] 以确定性方式为每个查询生成唯一 ID。
* 修复：[Compiler] 仅在事务完成时通知正在监听的查询。
* 修复：[JVM Driver] #1370 强制 JdbcSqliteDriver 用户提供数据库 URL。

## [1.1.3] - 2019-04-14 {id="1-1-3-2019-04-14"}
[1.1.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.3

* Gradle Metadata 1.0 正式发布。

## [1.1.2] - 2019-04-14 {id="1-1-2-2019-04-14"}
[1.1.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.2

* 新增：[Runtime] #1267 日志记录驱动程序装饰器。
* 修复：[Compiler] #1254 拆分长度超过 2^16 个字符的字符串字面量。
* 修复：[Gradle] #1260 生成的源文件在多平台项目中被识别为 iOS 源文件。
* 修复：[IDE] #1290 CopyAsSqliteAction.kt:43 中的 kotlin.KotlinNullPointerException。
* 修复：[Gradle] #1268 近期版本中运行 linkDebugFrameworkIos* 任务失败的问题。

## [1.1.1] - 2019-03-01 {id="1-1-1-2019-03-01"}
[1.1.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.1

* 修复：[Gradle] 修复 Android 项目的模块依赖编译。
* 修复：[Gradle] #1246 在 afterEvaluate 中设置 API 依赖项。
* 修复：[Compiler] 正确打印数组类型。

## [1.1.0] - 2019-02-27 {id="1-1-0-2019-02-27"}
[1.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.0

* 新增：[Gradle] #502 允许指定架构模块依赖项。
* 改进：[Compiler] #1111 表错误排在其他错误之前。
* 修复：[Compiler] #1225 为 REAL 字面量返回正确的类型。
* 修复：[Compiler] #1218 docid 通过触发器传播。

## [1.0.3] - 2019-01-30 {id="1-0-3-2019-01-30"}
[1.0.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.3

* 改进：[Runtime] #1195 原生驱动程序/运行时 Arm32 支持。
* 改进：[Runtime] #1190 从 Query 类型中公开映射器。

## [1.0.2] - 2019-01-26 {id="1-0-2-2019-01-26"}
[1.0.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.2

* 修复：[Gradle Plugin] 更新至 Kotlin 1.3.20。
* 修复：[Runtime] 事务不再吞没异常。

## [1.0.1] - 2019-01-21 {id="1-0-1-2019-01-21"}
[1.0.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.1

* 改进：[Native Driver] 允许将目录名传递给 DatabaseConfiguration。
* 改进：[Compiler] #1173 未声明包名的文件无法通过编译。
* 修复：[IDE] 正确向 Square 报告 IDE 错误。
* 修复：[IDE] #1162 位于相同包中的类型虽报错但运行正常的问题。
* 修复：[IDE] #1166 重命名表时发生 NPE 失败。
* 修复：[Compiler] #1167 尝试解析带有 UNION 和 SELECT 的复杂 SQL 语句时抛出异常。

## [1.0.0] - 2019-01-08 {id="1-0-0-2019-01-08"}
[1.0.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.0

* 新增：生成的代码彻底重构，全面采用 Kotlin。
* 新增：RxJava2 扩展构件。
* 新增：Android Paging 扩展构件。
* 新增：Kotlin 多平台支持。
* 新增：Android、iOS 和 JVM SQLite 驱动程序构件。
* 新增：事务 API。

## [0.7.0] - 2018-02-12 {id="0-7-0-2018-02-12"}
[0.7.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.7.0

 * 新增：生成的代码已更新为仅使用 Support SQLite 库。现在所有查询都会生成语句对象而非原始字符串。
 * 新增：IDE 中的语句折叠功能。
 * 新增：现在自动处理布尔类型。
 * 修复：从代码生成中移除已弃用的 marshal。
 * 修复：将 'avg' SQL 函数类型映射更正为 REAL。
 * 修复：正确检测 'julianday' SQL 函数。

## [0.6.1] - 2017-03-22 {id="0-6-1-2017-03-22"}
[0.6.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.6.1

 * 新增：为不带实参的 Delete、Update 和 Insert 语句生成已编译的语句。
 * 修复：在子查询使用的视图中使用 using 子句不再报错。
 * 修复：移除了生成 Mapper 上的重复类型。
 * 修复：子查询可用于针对实参进行检查的表达式中。

## [0.6.0] - 2017-03-06 {id="0-6-0-2017-03-06"}
[0.6.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.6.0

 * 新增：Select 查询现在作为 `SqlDelightStatement` 工厂公开，而非字符串常量。
 * 新增：查询 Javadoc 现在会被复制到语句和映射器工厂中。
 * 新增：为视图名称生成字符串常量。
 * 修复：对需要工厂的视图进行查询时，现在正确要求将这些工厂作为实参传入。
 * 修复：验证插入操作的实参数量与指定的列数相匹配。
 * 修复：正确编码 where 子句中使用的 blob 字面量。
 * 此版本需要 Gradle 3.3 或更高版本。

## [0.5.1] - 2016-10-24 {id="0-5-1-2016-10-24"}
[0.5.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.5.1

 * 新增：已编译语句继承自抽象类型。
 * 修复：形参中的基本类型若可为空则会被装箱。
 * 修复：绑定实参所需的所有工厂方法均已在工厂方法中齐备。
 * 修复：转义的列名能够正确进行编组。

## [0.5.0] - 2016-10-19 {id="0-5-0-2016-10-19"}
[0.5.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.5.0

 * 新增：SQLite 实参可以通过 Factory 进行类型安全地传递
 * 新增：IntelliJ 插件支持对 `.sq` 文件进行格式化
 * 新增：支持 SQLite 时间戳字面量
 * 修复：在 IntelliJ 中支持点击跳转参数化类型
 * 修复：从 Cursor 获取转义列名时不再抛出 RuntimeException。
 * 修复：Gradle 插件在尝试打印异常时不再崩溃。

## [0.4.4] - 2016-07-20 {id="0-4-4-2016-07-20"}
[0.4.4]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.4

 * 新增：原生支持 short 作为列的 Java 类型
 * 新增：在生成的映射器和工厂方法上附带 Javadoc
 * 修复：group_concat 和 nullif 函数具有正确的为 null 性
 * 修复：与 Android Studio 2.2-alpha 的兼容性
 * 修复：WITH RECURSIVE 不再导致插件崩溃

## [0.4.3] - 2016-07-07 {id="0-4-3-2016-07-07"}
[0.4.3]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.3

 * 新增：编译错误链接至源文件。
 * 新增：右键单击即可将 SQLDelight 代码复制为有效的 SQLite。
 * 新增：命名语句上的 Javadoc 将出现在生成的 String 上。
 * 修复：生成的视图模型包含为 null 性注解。
 * 修复：从 union 生成的代码具有正确的类型和为 null 性，以支持所有可能的列。
 * 修复：sum 和 round SQLite 函数在生成的代码中具有正确的类型。
 * 修复：修复 CAST 及内部 select 的相关问题。
 * 修复：CREATE TABLE 语句中的自动补全。
 * 修复：包名中可以使用 SQLite 关键字。

## [0.4.2] - 2016-06-16 {id="0-4-2-2016-06-16"}
[0.4.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.2

 * 新增：支持从工厂创建 Marshal。
 * 修复：IntelliJ 插件生成具有正确泛型顺序的工厂方法。
 * 修复：函数名称可以使用任意大小写。

## [0.4.1] - 2016-06-14 {id="0-4-1-2016-06-14"}
[0.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.1

 * 修复：IntelliJ 插件生成具有正确泛型顺序的类。
 * 修复：列定义可以使用任意大小写。

## [0.4.0] - 2016-06-14 {id="0-4-0-2016-06-14"}
[0.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.0

 * 新增：按查询而非按表生成映射器。
 * 新增：可以在 `.sq` 文件中导入 Java 类型。
 * 新增：校验 SQLite 函数。
 * 修复：移除重复错误。
 * 修复：大写列名和 Java 关键字列名不再报错。

## [0.3.2] - 2016-05-14 {id="0-3-2-2016-05-14"}
[0.3.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.2

 * 新增：自动补全和查找用例现已支持视图和别名。
 * 修复：编译期校验现在允许在 select 中使用函数。
 * 修复：支持仅声明默认值的 insert 语句。
 * 修复：导入未使用 SQLDelight 的项目时插件不再崩溃。

## [0.3.1] - 2016-04-27 {id="0-3-1-2016-04-27"}
[0.3.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.1

  * 修复：接口可见性改回 public，以避免方法引用引发 Illegal Access 运行时异常。
  * 修复：正确求值子表达式。

## [0.3.0] - 2016-04-26 {id="0-3-0-2016-04-26"}
[0.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.0

  * 新增：列定义使用 SQLite 类型，并可添加额外的 'AS' 约束以指定 Java 类型。
  * 新增：支持从 IDE 发送错误报告。
  * 修复：自动补全功能恢复正常。
  * 修复：编辑 `.sq` 文件时更新 SQLDelight 模型文件。
  * 移除：不再支持附加数据库（Attached databases）。

## [0.2.2] - 2016-03-07 {id="0-2-2-2016-03-07"}
[0.2.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.2

 * 新增：在编译期校验 insert、update、delete、index 和 trigger 语句所使用的列。
 * 修复：在文件移动/创建时 IDE 插件不崩溃。

## [0.2.1] - 2016-03-07 {id="0-2-1-2016-03-07"}
[0.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.1

 * 新增：Ctrl+`/`（OSX 上为 Cmd+`/`）切换选定行的注释。
 * 新增：在编译期校验 SQL 查询所使用的列。
 * 修复：在 IDE 和 Gradle 插件中均支持 Windows 路径。

## [0.2.0] - 2016-02-29 {id="0-2-0-2016-02-29"}
[0.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.0

 * 新增：为 Marshal 类添加复制构造函数。
 * 新增：更新至 Kotlin 1.0 正式版。
 * 修复：以非中断方式报告 'sqldelight' 文件夹结构问题。
 * 修复：禁止命名为 `table_name` 的列，其生成的常量会与表名常量冲突。
 * 修复：确保 IDE 插件立即生成模型类，不论 `.sq` 文件是否已被打开。
 * 修复：在 IDE 和 Gradle 插件中均支持 Windows 路径。

## [0.1.2] - 2016-02-13 {id="0-1-2-2016-02-13"}
[0.1.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.2

 * 修复：移除导致 Gradle 插件在大多数项目中无法使用的代码。
 * 修复：补充编译器对 Antlr 运行时缺失的依赖。

## [0.1.1] - 2016-02-12 {id="0-1-1-2016-02-12"}
[0.1.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.1

 * 修复：确保 Gradle 插件指向与其自身相同版本的运行时。

## [0.1.0] - 2016-02-12 {id="0-1-0-2016-02-12"}
[0.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.0

首次发布。