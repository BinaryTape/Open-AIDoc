# 更新日志

## 未发布

### 已添加
- [原生驱动程序] 为 `inMemoryDriver` 添加了 `extendedConfig` 形参 (#5539 由 @GuilhE 贡献)
- [PostgreSQL 方言] 添加了对隐式定义的系统列 (System Columns) 的查询支持 (#5834 由 @griffio 贡献)
- [PostgreSQL 方言] 添加了基础数组字面量 (Array literal) 支持 (#5997 由 @griffio 贡献)
- [PostgreSQL 方言] 添加了基础 LTREE 支持 (#5880 由 @yesitskev @griffio 贡献)
- [MySQL 方言] 添加了对 INET 函数的支持 (#5072 由 @mcxinyu 贡献)
- [PostgreSQL 方言] 添加了对 `ALTER INDEX` 的支持 (#6224 由 @griffio 贡献)
- [SQLite 方言] 添加了对 SQLite 3.44 聚合函数 `DISTINCT`、`ORDER BY` 和 `FILTER` 的支持 (#6236 由 @griffio 贡献)
- [SQLite 方言] 添加了对 SQLite 3.37 STRICT 表的支持 (#6230 由 @griffio 贡献)
- [Gradle 插件] 添加了通过 `codegenExcludedColumns` 从生成的模型中排除列的支持 (#6243 由 @sokolikp 贡献)
- [编译器] 在架构中添加了 `allTableNames` 函数 (#6245 由 @edenman 贡献)
- [PostgreSQL 方言] 添加了对 `ANY` 运算符的支持 (#6253 由 @griffio 贡献)
- [SQLite 方言] 为 SQLite 3.39 添加了对 `RIGHT JOIN` 和 `FULL JOIN` 的支持 (#6273 由 @griffio 贡献)

### 已变更
- [PostgreSQL 方言] 将 `arrayIntermediateType` 的可见性更改为 public (#5835 由 @griffio 贡献)
- [Gradle 插件] 实现了更严格的 `MigrationFile` 版本控制 (#5730 由 @madisp 贡献)
- [Gradle 插件] 将最低支持的 Gradle 版本提高到 8.2.1 (#6217 由 @maxsav 贡献)
- [Gradle 插件] 支持 Gradle 隔离项目 (isolated projects) (#6217 由 @maxsav 贡献)

### 已修复
- [编译器] 抑制生成代码中的 Kotlin 额外警告 (#6208 由 @eyupcanakman 贡献)
- [编译器] 非分组聚合结果集中的其他列始终为可为 null
- [PostgreSQL 方言] 正确解析 `coalesce` 和 `ifnull` 的为 null 性
- [PostgreSQL 方言] 修复了 PostgreSQL 方言的 IDE 集成
- [PostgreSQL 方言] 改进了 PostgreSQL 方言的 IDE 插件 (#6209 由 @griffio 贡献)
- [IntelliJ 插件] IDE 插件可以为所有方言执行代码补全 (#6210 由 @griffio 贡献)
- [Gradle 插件] 修复了运行验证数据库任务时的循环依赖错误 (#6221 由 @griffio 贡献)
- [编译器] 修复了多行更新的乐观锁问题 (#6240 由 @griffio 贡献)
- [IntelliJ 插件] 修复了在 IDEA 2026.2 中导致崩溃的弃用 (deprecation) 问题 (#6247 由 @griffio 贡献)
- [Gradle 插件] 修复了生成的源码在 AGP 8.9 到 8.11 上未被 Kotlin 编译拾取的问题
- [PostgreSQL 方言] 修复了 `lower` 和 `upper` 函数使用原始绑定实参时默认为 `TEXT` 的问题 (#6262 由 @griffio 贡献)
- [编译器] 修复了使用适配器且迁移更改了为 null 性时，通过数据类绑定插入值的问题 (#6269 由 @griffio 贡献)
- [编译器] 在使用 null 安全运算符（`IS` 和 `IS DISTINCT FROM`）时使用可为 null 的绑定实参 (#6265 由 @griffio 贡献)
- [Gradle 插件] 为项目依赖项使用 AGP 的变体解析 (#6217 由 @maxsav 贡献)
- [Gradle 插件] 修复了当构建之间的 AGP 变体列表不同时，`generateDatabaseInterface` 出现的构建缓存未命中问题
- [Gradle 插件] 修复了在未配置任何数据库的情况下应用插件时导致的 IDE 同步崩溃问题 (#6088)
- [PostgreSQL 方言] 修复了使用嵌套函数调用时的 JSON 聚合函数问题 (#6281 由 @griffio 贡献)
- [Paging3 扩展] 修复了数据库为空时 `KeyedQueryPagingSource` 崩溃的问题 (#6284 由 @woods-marshes 贡献)
- [编译器] 修复了当变更器语句与 `COALESCE` 等封装函数一起使用时出现的 Java 类型适配器问题 (#6292 由 @griffio 贡献)

## [2.3.2] - 2026-03-16
[2.3.2]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.2

### 已添加
- [PostgreSQL 方言] 改进了对 `ALTER TABLE ALTER TYPE USING` 表达式的支持 (#6116 由 @griffio 贡献)
- [PostgreSQL 方言] 添加了对 `DROP COLUMN IF EXISTS` 的支持 (#6112 由 @griffio 贡献)
- [Gradle 插件] 添加了 `expandSelectStar` 标志以关闭 Select 通配符扩展 (#5813 由 @griffio 贡献)
- [MySQL 方言] 添加了对窗口函数 (Window Functions) 的支持 (#6086 由 @griffio 贡献)
- [Gradle 插件] 修复了当起始架构版本不为 1 且 `verifyMigrations` 为 `true` 时的构建失败问题 (#6017 由 @neilgmiller 贡献)
- [Gradle 插件] 使 `SqlDelightWorkerTask` 更具可配置性，并更新默认配置以支持在 Windows 上开发 (#5215 由 @MSDarwish2000 贡献)
- [SQLite 方言] 添加了对 FTS5 虚表中合成列的支持 (#5986 由 @watbe 贡献)
- [PostgreSQL 方言] 添加了对 Postgres 行级安全性的支持 (#6087 由 @shellderp 贡献)
- [PostgreSQL 方言] 扩展了 `FOR UPDATE` 以支持 `OF table`、`NO KEY UPDATE`、`NO WAIT` (#6104 由 @shellderp 贡献)
- [PostgreSQL 方言] 支持 Postgis `Point` 类型及相关函数 (#5602 由 @vanniktech 贡献)
- [运行时] 添加了 `SuspendingTransacter.TransactionDispatcher`，提供了一种控制事务 `CoroutineContext` 的机制 (#5967 由 @eygraber 贡献)
- [Gradle 插件] 与 Android Gradle 插件 9.0 的新 DSL 完全兼容。 (#6140)
- [PostgreSQL 方言] 支持 PostgreSQL `CREATE TABLE` 存储参数 (#6148 由 @griffio 贡献)
- [PostgreSQL 方言] 修复了 PostgreSQL 唯一表约束可为 null 的结果列问题 (#6167 由 @griffio 贡献)

### 已变更
- [编译器] 将编译器输出类型从 `java.lang.Void` 更改为 `kotlin.Nothing` (#6099 由 @griffio 贡献)
- [编译器] 允许在软件包名称中使用下划线。之前下划线会被清理，导致出现非预期的行为 (#6027 由 @BierDav 贡献)
- [Paging 扩展] 切换到 AndroidX Paging (#5910 由 @jeffdgr8 贡献)
- [Android 驱动程序] 将 Android `minSdk` 提高到 23。 (#6141)
- [Paging 扩展] 升级至 Paging 3.4.1，并移除了 X64 Apple 目标。 (#6166)

### 已修复
- [IntelliJ 插件] 修复了由于在 VFS 刷新事件期间阻塞 EDT 上的文件类型检测而导致的 IDE 冻结问题。
- [SQLite 方言] 修复了使用 JSON 路径运算符时的 SQLite 3.38 编译错误 (#6070 由 @griffio 贡献)
- [SQLite 方言] 使用自定义列类型时，为 `group_concat` 函数使用 `String` 类型 (#6082 由 @griffio 贡献)
- [Gradle 插件] 改进了 `VerifyMigrationTask` 的性能，防止其在复杂的架构上卡死 (#6073 由 @Lightwood13 贡献)
- [IntelliJ 插件] 修复了插件初始化异常并更新了过时的方法 (#6040 由 @griffio 贡献)
- [Gradle 插件] 修复了与 Android Gradle 插件内置 Kotlin 的兼容性问题 (#6139)

## [2.3.1] - 2025-03-12
[2.3.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.1

发布失败。请使用 2.3.2！

## [2.3.0] - 2025-03-12
[2.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.3.0

发布失败。请使用 2.3.2！

## [2.2.1] - 2025-11-13
[2.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.2.1

### 已添加
- [PostgreSQL 方言] 修复了 Postgres `numeric`/`integer`/`biginteger` 类型映射 (#5994 由 @griffio 贡献)
- [编译器] 改进了编译器错误消息，以便在需要 `CAST` 时包含源文件位置 (#5979 由 @griffio 贡献)
- [PostgreSQL 方言] 添加了对 Postgres JSON 运算符路径提取的支持 (#5971 由 @griffio 贡献)
- [SQLite 方言] 为使用公用表表达式的 `MATERIALIZED` 查询计划程序提示添加了 SQLite 3.35 支持 (#5961 由 @griffio 贡献)
- [PostgreSQL 方言] 添加了对使用公用表表达式的 `MATERIALIZED` 查询计划程序提示的支持 (#5961 由 @griffio 贡献)
- [PostgreSQL 方言] 添加了对 Postgres JSON 聚合 `FILTER` 的支持 (#5957 由 @griffio 贡献)
- [PostgreSQL 方言] 添加了对 Postgres 枚举的支持 (#5935 由 @griffio 贡献)
- [PostgreSQL 方言] 添加了对 Postgres 触发器的有限支持 (#5932 由 @griffio 贡献)
- [PostgreSQL 方言] 添加了检查 SQL 表达式是否可以解析为 JSON 的谓词 (#5843 由 @griffio 贡献)
- [PostgreSQL 方言] 添加了对 PostgreSQL `COMMENT ON` 语句的有限支持 (#5808 由 @griffio 贡献)
- [MySQL 方言] 添加了对索引可见性选项的支持 (#5785 由 @orenkislev-faire 贡献)
- [PostgreSQL 方言] 添加了对 `TSQUERY` 数据类型的支持 (#5779 由 @griffio 贡献)
- [Gradle 插件] 添加模块时增加了对版本目录的支持 (#5755 由 @DRSchlaubi 贡献)

### 已变更
- 开发中的快照现在发布到位于 https://central.sonatype.com/repository/maven-snapshots/ 的 Central Portal Snapshots 仓库。
- [编译器] 使用构造函数引用简化了默认生成的查询 (#5814 由 @jonapoul 贡献)

### 已修复
- [编译器] 修复了使用包含公用表表达式的视图时的堆栈溢出问题 (#5928 由 @griffio 贡献)
- [Gradle 插件] 修复了打开 SqlDelight 工具窗口以添加“新连接”时的崩溃问题 (#5906 由 @griffio 贡献)
- [IntelliJ 插件] 避免了 `copy-to-sqlite` 装订区域操作中与线程相关的崩溃 (#5901 由 @griffio 贡献)
- [IntelliJ 插件] 修复了使用架构语句 `CREATE INDEX` 和 `CREATE VIEW` 时的 PostgreSQL 方言问题 (#5772 由 @griffio 贡献)
- [编译器] 修复了引用列时的 FTS 堆栈溢出问题 (#5896 由 @griffio 贡献)
- [编译器] 修复了 `WITH RECURSIVE` 堆栈溢出问题 (#5892 由 @griffio 贡献)
- [编译器] 修复了 `INSERT|UPDATE|DELETE RETURNING` 语句的通知 (Notify) 问题 (#5851 由 @griffio 贡献)
- [编译器] 修复了返回 `Long` 的事务块的异步结果类型 (#5836 由 @griffio 贡献)
- [编译器] 将 SQL 参数绑定的复杂度从 O(n²) 优化到 O(n) (#5898 由 @chenf7 贡献)
- [SQLite 方言] 修复了 SQLite 3.18 缺失函数的问题 (#5759 由 @griffio 贡献)

## [2.2.0] - 2025-11-13
[2.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.2.0

发布失败，构件仅部分发布。请使用 2.2.1！

## [2.1.0] - 2025-05-16
[2.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.1.0

### 已添加
- [WASM 驱动程序] 为 Web 工作线程驱动程序添加了对 `wasmJs` 的支持 (#5534 由 @IlyaGulya 贡献)
- [PostgreSQL 方言] 支持 PostgreSQL `UNNEST` 数组到行 (#5673 由 @griffio 贡献)
- [PostgreSQL 方言] PostgreSQL `TSRANGE`/`TSTZRANGE` 支持 (#5297 由 @griffio 贡献)
- [PostgreSQL 方言] PostgreSQL `RIGHT FULL JOIN` (#5086 由 @griffio 贡献)
- [PostgreSQL 方言] 从时间类型中提取 PostgreSQL 数据 (#5273 由 @griffio 贡献)
- [PostgreSQL 方言] PostgreSQL 数组包含运算符 (#4933 由 @griffio 贡献)
- [PostgreSQL 方言] PostgreSQL 删除约束 (#5288 由 @griffio 贡献)
- [PostgreSQL 方言] PostgreSQL 类型转换 (#5089 由 @griffio 贡献)
- [PostgreSQL 方言] 用于子查询的 PostgreSQL `LATERAL JOIN` 运算符 (#5122 由 @griffio 贡献)
- [PostgreSQL 方言] PostgreSQL `ILIKE` 运算符 (#5330 由 @griffio 贡献)
- [PostgreSQL 方言] PostgreSQL `XML` 类型 (#5331 由 @griffio 贡献)
- [PostgreSQL 方言] PostgreSQL `AT TIME ZONE` (#5243 由 @griffio 贡献)
- [PostgreSQL 方言] 支持 PostgreSQL `ORDER BY NULLS` (#5199 由 @griffio 贡献)
- [PostgreSQL 方言] 添加了 PostgreSQL 当前日期/时间函数支持 (#5226 由 @drewd 贡献)
- [PostgreSQL 方言] PostgreSQL 正则表达式运算符 (#5137 由 @griffio 贡献)
- [PostgreSQL 方言] 添加了 `BRIN GIST` (#5059 由 @griffio 贡献)
- [MySQL 方言] 为 MySQL 方言支持 `RENAME INDEX` (#5212 由 @orenkislev-faire 贡献)
- [JSON 扩展] 为 JSON 表函数添加了别名 (#5372 由 @griffio 贡献)

### 已变更
- [编译器] 生成的查询文件为简单的变更器返回行计数 (#4578 由 @MariusVolkhart 贡献)
- [原生驱动程序] 更新 `NativeSqlDatabase.kt` 以更改 `DELETE`、`INSERT` 和 `UPDATE` 语句的 `readonly` 标志 (#5680 由 @griffio 贡献)
- [PostgreSQL 方言] 将 `PgInterval` 更改为 `String` (#5403 由 @griffio 贡献)
- [PostgreSQL 方言] 支持 SqlDelight 模块实现 PostgreSQL 扩展 (#5677 由 @griffio 贡献)

### 已修复
- [编译器] 修复：执行带结果的分组语句时通知查询 (#5006 由 @vitorhugods 贡献)
- [编译器] 修复了 `SqlDelightModule` 类型解析器 (#5625 由 @griffio 贡献)
- [编译器] 修复了 5501 插入对象转义列的问题 (#5503 由 @griffio 贡献)
- [编译器] 编译器：改进了错误消息，使路径链接在正确的行和字符位置可点击 (#5604 由 @vanniktech 贡献)
- [编译器] 修复问题 5298：允许将关键字用作表名
- [编译器] 修复命名的执行并添加测试
- [编译器] 在排序初始化语句时考虑外键表约束 (#5325 由 @TheMrMilchmann 贡献)
- [编译器] 在涉及制表符时正确对齐错误波浪下划线 (#5224 由 @drewd 贡献)
- [JDBC 驱动程序] 修复了事务结束期间 `connectionManager` 的内存泄漏问题
- [JDBC 驱动程序] 按照文档所述在事务内运行 SQLite 迁移 (#5218 由 @morki 贡献)
- [JDBC 驱动程序] 修复了事务提交/回滚后泄漏连接的问题 (#5205 由 @morki 贡献)
- [Gradle 插件] 在 `GenerateSchemaTask` 之前执行 `DriverInitializer` (#5562 由 @nwagu 贡献)
- [运行时] 修复了当真实驱动程序为 `Async` 时 `LogSqliteDriver` 中的崩溃问题 (#5723 由 @edenman 贡献)
- [运行时] 修复了 `StringBuilder` 容量问题 (#5192 由 @janbina 贡献)
- [PostgreSQL 方言] PostgreSQL 创建或替换视图 (#5407 由 @griffio 贡献)
- [PostgreSQL 方言] PostgreSQL `TO_JSON` (#5606 由 @griffio 贡献)
- [PostgreSQL 方言] PostgreSQL 数字解析器 (#5399 由 @griffio 贡献)
- [PostgreSQL 方言] SQLite 窗口函数 (#2799 由 @griffio 贡献)
- [PostgreSQL 方言] PostgreSQL `SELECT DISTINCT ON` (#5345 由 @griffio 贡献)
- [PostgreSQL 方言] `ALTER TABLE ADD COLUMN IF NOT EXISTS` (#5309 由 @griffio 贡献)
- [PostgreSQL 方言] PostgreSQL 异步绑定参数 (#5313 由 @griffio 贡献)
- [PostgreSQL 方言] PostgreSQL 布尔字面量 (#5262 由 @griffio 贡献)
- [PostgreSQL 方言] PostgreSQL 窗口函数 (#5155 由 @griffio 贡献)
- [PostgreSQL 方言] PostgreSQL `ISNULL` `ISNOTNULL` 类型 (#5173 由 @griffio 贡献)
- [PostgreSQL 方言] PostgreSQL `SELECT DISTINCT` (#5172 由 @griffio 贡献)
- [Paging 扩展] 分页刷新初始加载修复 (#5615 由 @evant 贡献)
- [Paging 扩展] 添加了 macOS 原生目标 (#5324 由 @vitorhugods 贡献)
- [IntelliJ 插件] K2 支持

## [2.0.2] - 2024-04-05
[2.0.2]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.2

### 已添加
- [PostgreSQL 方言] 添加了 PostgreSQL `STRING_AGG` 函数 (#4950 由 @anddani 贡献)
- [PostgreSQL 方言] 在 PostgreSQL 方言中添加了 `SET` 语句 (#4927 由 @de-luca 贡献)
- [PostgreSQL 方言] 添加了 PostgreSQL 修改列序列参数 (#4916 由 @griffio 贡献)
- [PostgreSQL 方言] 为插入语句添加了 PostgreSQL 修改列默认值支持 (#4912 由 @griffio 贡献)
- [PostgreSQL 方言] 添加了 PostgreSQL 修改序列和删除序列 (#4920 由 @griffio 贡献)
- [PostgreSQL 方言] 添加了 Postgres 正则表达式函数定义 (#5025 由 @MariusVolkhart 贡献)
- [PostgreSQL 方言] 添加了 GIN 的语法 (#5027 由 @griffio 贡献)

### 已变更
- [IDE 插件] 最低版本为 2023.1 / Android Studio Iguana
- [编译器] 允许在 `encapsulatingType` 中重写类型为 null 性 (#4882 由 @eygraber 贡献)
- [编译器] 内联 `SELECT *` 的列名
- [Gradle 插件] 切换到 `processIsolation` (#5068 由 @nwagu 贡献)
- [Android 运行时] 将 Android `minSDK` 提高到 21 (#5094 由 @hfhbd 贡献)
- [驱动程序] 为方言作者公开更多 JDBC/R2DBC 语句方法 (#5098 由 @hfhbd 贡献)

### 已修复
- [PostgreSQL 方言] 修复了 PostgreSQL 修改表修改列 (#4868 由 @griffio 贡献)
- [PostgreSQL 方言] 修复了 4448 表模型缺失导入的问题 (#4885 由 @griffio 贡献)
- [PostgreSQL 方言] 修复了 4932 PostgreSQL 默认约束函数 (#4934 由 @griffio 贡献)
- [PostgreSQL 方言] 修复了 4879 迁移期间修改表重命名列中的 PostgreSQL 类转换错误 (#4880 由 @griffio 贡献)
- [PostgreSQL 方言] 修复了 4474 PostgreSQL 创建扩展 (#4541 由 @griffio 贡献)
- [PostgreSQL 方言] 修复了 5018 PostgreSQL 添加主键不可为 null 类型的问题 (#5020 由 @griffio 贡献)
- [PostgreSQL 方言] 修复了 4703 聚合表达式 (#5071 由 @griffio 贡献)
- [PostgreSQL 方言] 修复了 5028 PostgreSQL JSON (#5030 由 @griffio 贡献)
- [PostgreSQL 方言] 修复了 5040 PostgreSQL JSON 运算符 (#5041 由 @griffio 贡献)
- [PostgreSQL 方言] 修复了 5040 的 JSON 运算符绑定 (#5100 由 @griffio 贡献)
- [PostgreSQL 方言] 修复了 5082 `tsvector` (#5104 由 @griffio 贡献)
- [PostgreSQL 方言] 修复了 5032 PostgreSQL `UPDATE FROM` 语句的列相邻性 (#5035 由 @griffio 贡献)
- [SQLite 方言] 修复了 4897 SQLite 修改表重命名列 (#4899 由 @griffio 贡献)
- [IDE 插件] 修复了错误处理程序崩溃 (#4988 由 @aperfilyev 贡献)
- [IDE 插件] BugSnag 在 IDEA 2023.3 中初始化失败 (#由 @aperfilyev 贡献)
- [IDE 插件] 修复了通过插件在 IntelliJ 中打开 .sq 文件时出现的 `PluginException` (#由 @aperfilyev 贡献)
- [IDE 插件] 不要将 Kotlin 库打包到 IntelliJ 插件中，因为它已经是插件依赖项 (#5126)
- [IDE 插件] 使用扩展数组而不是流 (#5127)

## [2.0.1] - 2023-12-01
[2.0.1]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.1

### 已添加
- [编译器] 执行 `SELECT` 时添加了对多列表达式的支持 (#4453 由 @Adriel-M 贡献)
- [PostgreSQL 方言] 添加了对 PostgreSQL `CREATE INDEX CONCURRENTLY` 的支持 (#4531 由 @griffio 贡献)
- [PostgreSQL 方言] 允许 PostgreSQL CTE 辅助语句相互引用 (#4493 由 @griffio 贡献)
- [PostgreSQL 方言] 添加了对二进制表达式和求和的 PostgreSQL 类型的支持 (#4539 由 @Adriel-M 贡献)
- [PostgreSQL 方言] 添加了对 PostgreSQL `SELECT DISTINCT ON` 语法的支持 (#4584 由 @griffio 贡献)
- [PostgreSQL 方言] 添加了对 `SELECT` 语句中 PostgreSQL JSON 函数的支持 (#4590 由 @MariusVolkhart 贡献)
- [PostgreSQL 方言] 添加了 `GENERATE_SERIES` PostgreSQL 函数 (#4717 由 @griffio 贡献)
- [PostgreSQL 方言] 添加了额外的 Postgres 字符串函数定义 (#4752 由 @MariusVolkhart 贡献)
- [PostgreSQL 方言] 在 `MIN` 和 `MAX` 聚合函数中添加了 `DATE` PostgreSQL 类型 (#4816 由 @anddani 贡献)
- [PostgreSQL 方言] 在 `SqlBinaryExpr` 中添加了 PostgreSQL 时间类型 (#4657 由 @griffio 贡献)
- [PostgreSQL 方言] 在 PostgreSQL 方言中添加了 `TRUNCATE` (#4817 由 @de-luca 贡献)
- [SQLite 3.35 方言] 允许按顺序评估多个 `ON CONFLICT` 子句 (#4551 由 @griffio 贡献)
- [JDBC 驱动程序] 添加了语言注解以提供更愉快的 SQL 编辑体验 (#4602 由 @MariusVolkhart 贡献)
- [原生驱动程序] 原生驱动程序：添加了对 `linuxArm64` 的支持 (#4792 由 @hfhbd 贡献)
- [Android 驱动程序] 为 `AndroidSqliteDriver` 添加了 `windowSizeBytes` 形参 (#4804 由 @BoD 贡献)
- [Paging3 扩展] 已添加：为 `OffsetQueryPagingSource` 添加了 `initialOffset` (#4802 由 @MohamadJaara 贡献)

### 已变更
- [编译器] 在适当的情况下优先使用 Kotlin 类型 (#4517 由 @eygraber 贡献)
- [编译器] 执行值类型插入时始终包含列名 (#4864)
- [PostgreSQL 方言] 从 PostgreSQL 方言中移除实验性状态 (#4443 由 @hfhbd 贡献)
- [PostgreSQL 方言] 更新了 PostgreSQL 类型的文档 (#4569 由 @MariusVolkhart 贡献)
- [R2DBC 驱动程序] 优化了处理 PostgreSQL 中整数数据类型时的性能 (#4588 由 @MariusVolkhart 贡献)

### 已移除
- [SQLite Javascript 驱动程序] 移除了 `sqljs-driver` (#4613, #4670 由 @dellisd 贡献)

### 已修复
- [编译器] 修复了带返回且无参数的分组语句的编译问题 (#4699 由 @griffio 贡献)
- [编译器] 绑定带有 `SqlBinaryExpr` 的实参 (#4604 由 @griffio 贡献)
- [IDE 插件] 如果已设置，则使用 IDEA 项目 JDK (#4689 由 @griffio 贡献)
- [IDE 插件] 修复了 IDEA 2023.2 及更高版本中的 "Unknown element type: TYPE_NAME" 错误 (#4727)
- [IDE 插件] 修复了一些与 2023.2 的兼容性问题
- [Gradle 插件] 修正了 `verifyMigrationTask` Gradle 任务的文档 (#4713 由 @joshfriend 贡献)
- [Gradle 插件] 添加了 Gradle 任务输出消息，以帮助用户在验证数据库之前生成数据库 (#4684 由 @jingwei99 贡献)
- [PostgreSQL 方言] 修复了多次重命名 PostgreSQL 列的问题 (#4566 由 @griffio 贡献)
- [PostgreSQL 方言] 修复了 4714 PostgreSQL 修改列为 null 性 (#4831 由 @griffio 贡献)
- [PostgreSQL 方言] 修复了 4837 修改表修改列 (#4846 由 @griffio 贡献)
- [PostgreSQL 方言] 修复了 4501 PostgreSQL 序列 (#4528 由 @griffio 贡献)
- [SQLite 方言] 允许 JSON 二进制运算符用于列表达式 (#4776 由 @eygraber 贡献)
- [SQLite 方言] 修复了 `UPDATE FROM` 中由于发现多个同名列导致的误报问题 (#4777 由 @eygraber 贡献)
- [原生驱动程序] 支持命名的内存数据库 (#4662 由 @05nelsonm 贡献)
- [原生驱动程序] 确保查询监听器集合的线程安全性 (#4567 由 @kpgalligan 贡献)
- [JDBC 驱动程序] 修复了 `ConnectionManager` 中的连接泄漏问题 (#4589 由 @MariusVolkhart 贡献)
- [JDBC 驱动程序] 修复了选择 `ConnectionManager` 类型时的 `JdbcSqliteDriver` URL 解析问题 (#4656 由 @05nelsonm 贡献)

## [2.0.0] - 2023-07-26
[2.0.0]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0

### 已添加
- [MySQL 方言] MySQL：在 `IF` 表达式中支持 `timestamp`/`bigint` (#4329 由 @shellderp 贡献)
- [MySQL 方言] MySQL：添加了 `now` (#4431 由 @hfhbd 贡献)
- [Web 驱动程序] 启用了 NPM 软件包发布 (#4364)
- [IDE 插件] 允许用户在 Gradle 工具连接失败时显示堆栈跟踪 (#4383)

### 已变更
- [SQLite 驱动程序] 简化了 `JdbcSqliteDriver` 的架构迁移使用 (#3737 由 @morki 贡献)
- [R2DBC 驱动程序] 真正的异步 R2DBC 文本光标 (#4387 由 @hfhbd 贡献)

### 已修复
- [IDE 插件] 不要将数据库项目服务实例化，直到需要时为止 (#4382)
- [IDE 插件] 处理查找用例期间的过程取消 (#4340)
- [IDE 插件] 修复了异步代码的 IDE 生成 (#4406)
- [IDE 插件] 将软件包结构的组装移动为一次性计算并脱离 EDT (#4417)
- [IDE 插件] 为 2023.2 上的 Kotlin 类型解析使用正确的存根索引键 (#4416)
- [IDE 插件] 在执行搜索之前等待索引就绪 (#4419)
- [IDE 插件] 如果索引不可用，不要执行转到操作 (#4420)
- [编译器] 修复了分组语句的结果表达式 (#4378)
- [编译器] 不要将虚表用作接口类型 (#4427 由 @hfhbd 贡献)

## [2.0.0-rc02] - 2023-06-27
[2.0.0-rc02]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-rc02

### 已添加
- [MySQL 方言] 支持小写日期类型以及日期类型上的 `min` 和 `max` (#4243 由 @shellderp 贡献)
- [MySQL 方言] 为二进制表达式和求和支持 MySQL 类型 (#4254 由 @shellderp 贡献)
- [MySQL 方言] 支持不带显示宽度的无符号整型 (#4306 由 @shellderp 贡献)
- [MySQL 方言] 支持 `LOCK IN SHARED MODE`
- [PostgreSQL 方言] 为 `min` `max` 添加了布尔值和时间戳 (#4245 由 @griffio 贡献)
- [PostgreSQL 方言] Postgres：添加了窗口函数支持 (#4283 由 @hfhbd 贡献)
- [运行时] 为运行时添加了 `linuxArm64`、`androidNative` 和 `watchosDeviceArm` 目标 (#4258 由 @hfhbd 贡献)
- [Paging 扩展] 为 Paging 扩展添加了 `linux` 和 `mingw x64` 目标 (#4280 由 @chippman 贡献)

### 已变更
- [Gradle 插件] 为 Android API 34 添加了自动方言支持 (#4251)
- [Paging 扩展] 在 `QueryPagingSource` 中添加了对 `SuspendingTransacter` 的支持 (#4292 由 @daio 贡献)
- [运行时] 改进了 `addListener` API (#4244 由 @hfhbd 贡献)
- [运行时] 使用 `Long` 作为迁移版本 (#4297 由 @hfhbd 贡献)

### 已修复
- [Gradle 插件] 为生成的源码使用稳定的输出路径 (#4269 由 @joshfriend 贡献)
- [Gradle 插件] Gradle 优化 (#4222 由 @3flex 贡献)

## [2.0.0-rc01] - 2023-05-29
[2.0.0-rc01]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-rc01

### 已添加
- [Paging] 为 Paging 扩展添加了 JS 浏览器目标 (#3843 由 @sproctor 贡献)
- [Paging] 为 `androidx-paging3` 扩展添加了 `iosSimulatorArm64` 目标 (#4117)
- [PostgreSQL 方言] 添加了对 `gen_random_uuid()` 的支持和测试 (#3855 由 @davidwheeler123 贡献)
- [PostgreSQL 方言] PostgreSQL 修改表添加约束 (#4116 由 @griffio 贡献)
- [PostgreSQL 方言] 修改表添加 `CHECK` 约束 (#4120 由 @griffio 贡献)
- [PostgreSQL 方言] 添加了 PostgreSQL 字符长度函数 (#4121 由 @griffio 贡献)
- [PostgreSQL 方言] 添加了 PostgreSQL 列默认间隔 (#4142 由 @griffio 贡献)
- [PostgreSQL 方言] 添加了 PostgreSQL 间隔列结果 (#4152 由 @griffio 贡献)
- [PostgreSQL 方言] 添加了 PostgreSQL 修改列支持 (#4165 由 @griffio 贡献)
- [PostgreSQL 方言] PostgreSQL：添加了 `date_part` (#4198 由 @hfhbd 贡献)
- [MySQL 方言] 添加了 SQL 字符长度函数 (#4134 由 @griffio 贡献)
- [IDE 插件] 添加了 `sqldelight` 目录建议 (#3976 由 @aperfilyev 贡献)
- [IDE 插件] 在项目树中压缩中间包 (#3992 由 @aperfilyev 贡献)
- [IDE 插件] 添加了 `JOIN` 子句补全 (#4086 由 @aperfilyev 贡献)
- [IDE 插件] 创建视图意图和实时模板 (#4074 由 @aperfilyev 贡献)
- [IDE 插件] 对 `DELETE` 或 `UPDATE` 中缺失 `WHERE` 的情况发出警告 (#4058 由 @aperfilyev 贡献)
- [Gradle 插件] 启用类型安全的项目访问器 (#4005 由 @hfhbd 贡献)

### 已变更
- [Gradle 插件] 允许通过 `ServiceLoader` 机制为 `VerifyMigrationTask` 注册 `DriverInitializer` (#3986 由 @C2H6O 贡献)
- [Gradle 插件] 创建显式编译器环境 (#4079 由 @hfhbd 贡献)
- [JS 驱动程序] 将 Web 工作线程驱动程序拆分为独立的构件
- [JS 驱动程序] 不要公开 `JsWorkerSqlCursor` (#3874 由 @hfhbd 贡献)
- [JS 驱动程序] 禁用 `sqljs` 驱动程序的发布 (#4108)
- [运行时] 强制同步驱动程序需要同步架构初始化程序 (#4013)
- [运行时] 改进了对 `文本光标` 的异步支持 (#4102)
- [运行时] 移除了已弃用的目标 (#4149 由 @hfhbd 贡献)
- [运行时] 移除了对旧版内存模型 (MM) 的支持 (#4148 由 @hfhbd 贡献)

### 已修复
- [R2DBC 驱动程序] R2DBC：等待驱动程序关闭 (#4139 由 @hfhbd 贡献)
- [编译器] 在数据库 `create(SqlDriver)` 中包含来自迁移的 `PRAGMA` (#3845 由 @MariusVolkhart 贡献)
- [编译器] 修复了 `RETURNING` 子句的代码生成 (#3872 由 @MariusVolkhart 贡献)
- [编译器] 不要为虚表生成类型 (#4015)
- [Gradle 插件] Gradle 插件的小型质量改进 (#3930 由 @zacsweers 贡献)
- [IDE 插件] 修复了未解析的 Kotlin 类型 (#3924 由 @aperfilyev 贡献)
- [IDE 插件] 修复了扩展通配符意图以支持限定符的问题 (#3979 由 @aperfilyev 贡献)
- [IDE 插件] 如果缺少 Java Home，则使用可用的 JDK (#3925 由 @aperfilyev 贡献)
- [IDE 插件] 修复了软件包名称上的查找用例 (#4010)
- [IDE 插件] 不要为无效元素显示自动导入 (#4008)
- [IDE 插件] 如果方言缺失，不要进行解析 (#4009)
- [IDE 插件] 忽略无效状态期间编译器的 IDE 运行 (#4016)
- [IDE 插件] 添加了对 IntelliJ 2023.1 的支持 (#4037 由 @madisp 贡献)
- [IDE 插件] 在重命名列时重命名命名的实参用法 (#4027 由 @aperfilyev 贡献)
- [IDE 插件] 修复了添加迁移弹出窗口 (#4105 由 @aperfilyev 贡献)
- [IDE 插件] 在迁移文件中禁用 `SchemaNeedsMigrationInspection` (#4106 由 @aperfilyev 贡献)
- [IDE 插件] 为迁移生成使用 SQL 列名而不是类型名称 (#4112 由 @aperfilyev 贡献)

## [2.0.0-alpha05] - 2023-01-20
[2.0.0-alpha05]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha05

### 已添加
- [Paging] 多平台 Paging 扩展 (由 @jeffdgr8 贡献)
- [运行时] 为 `Listener` 接口添加了 `fun` 修饰符。
- [SQLite 方言] 添加了 SQLite 3.33 支持 (`UPDATE FROM`) (由 @eygraber 贡献)
- [PostgreSQL 方言] 支持 PostgreSQL 中的 `UPDATE FROM` (由 @eygraber 贡献)

### 已变更
- [R2DBC 驱动程序] 公开连接 (由 @hfhbd 贡献)
- [运行时] 将迁移回调移动到主 `migrate` 函数中
- [Gradle 插件] 对下游项目隐藏配置
- [Gradle 插件] 仅着色 IntelliJ (由 @hfhbd 贡献)
- [Gradle 插件] 支持 Kotlin 1.8.0-Beta 并添加了多版本 Kotlin 测试 (由 @hfhbd 贡献)

### 已修复
- [R2DBC 驱动程序] 改为使用 `javaObjectType` (由 @hfhbd 贡献)
- [R2DBC 驱动程序] 修复了 `bindStatement` 中的基本类型 null 值 (由 @hfhbd 贡献)
- [R2DBC 驱动程序] 支持 R2DBC 1.0 (由 @hfhbd 贡献)
- [PostgreSQL 方言] Postgres：修复了不带类型参数的数组 (由 @hfhbd 贡献)
- [IDE 插件] 将 IntelliJ 提升至 221.6008.13 (由 @hfhbd 贡献)
- [编译器] 从纯视图解析递归原始表 (由 @hfhbd 贡献)
- [编译器] 使用来自表外键子句的值类 (由 @hfhbd 贡献)
- [编译器] 修复了 `SelectQueryGenerator` 以支持不带圆括号的绑定表达式 (由 @bellatoris 贡献)
- [编译器] 修复了使用事务时 `${name}Indexes` 变量的重复生成问题 (由 @sachera 贡献)

## [1.5.5] - 2023-01-20
[1.5.5]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.5

这是一个针对 Kotlin 1.8 和 IntelliJ 2021+ 的兼容性版本，支持 JDK 17。

## [1.5.4] - 2022-10-06
[1.5.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.4

这是一个针对 Kotlin 1.7.20 和 AGP 7.3.0 的兼容性更新。

## [2.0.0-alpha04] - 2022-10-03
[2.0.0-alpha04]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha04

### 破坏性变更

- Paging 3 扩展 API 已更改，仅允许对计数使用 `int` 类型。
- 协程扩展现在要求传入一个调度程序，而不再使用默认值。
- 方言和驱动程序类现在是 `final` 的，请改用委托。

### 已添加
- [HSQL 方言] Hsql：支持在插入中使用 `DEFAULT` 处理生成的列 (#3372 由 @hfhbd 贡献)
- [PostgreSQL 方言] PostgreSQL：支持在 `INSERT` 中使用 `DEFAULT` 处理生成的列 (#3373 由 @hfhbd 贡献)
- [PostgreSQL 方言] 在 PostgreSQL 中添加了 `NOW()` (#3403 由 @hfhbd 贡献)
- [PostgreSQL 方言] PostgreSQL 添加了 `NOT` 运算符 (#3504 由 @hfhbd 贡献)
- [Paging] 允许将 `CoroutineContext` 传入 `*QueryPagingSource` (#3384)
- [Gradle 插件] 为方言添加了更好的版本目录支持 (#3435)
- [原生驱动程序] 为 `NativeSqliteDriver` 的 `DatabaseConfiguration` 创建添加了钩子回调 (#3512 由 @svenjacobs 贡献)

### 已变更
- [Paging] 为基于 `KeyedQueryPagingSource` 的 `QueryPagingSource` 函数添加了默认调度程序 (#3385)
- [Paging] 使 `OffsetQueryPagingSource` 仅适用于 `Int` (#3386)
- [异步运行时] 将 `await*` 移动到上层类 `ExecutableQuery` (#3524 由 @hfhbd 贡献)
- [协程扩展] 移除了流扩展的默认形参 (#3489)

### 已修复
- [Gradle 插件] 更新至 Kotlin 1.7.20 (#3542 由 @zacsweers 贡献)
- [R2DBC 驱动程序] 采用了不总是发送值的 R2DBC 更改 (#3525 由 @hfhbd 贡献)
- [HSQL 方言] 修复了 Hsql 中 SQLite `VerifyMigrationTask` 失败的问题 (#3380 由 @hfhbd 贡献)
- [Gradle 插件] 转换任务以使用延迟配置 API (由 @3flex 贡献)
- [Gradle 插件] 避免 Kotlin 1.7.20 中的 NPE (#3398 由 @ZacSweers 贡献)
- [Gradle 插件] 修复了压缩迁移任务的说明 (#3449)
- [IDE 插件] 修复了较新 Kotlin 插件中的 `NoSuchFieldError` (#3422 由 @madisp 贡献)
- [IDE 插件] IDEA：`UnusedQueryInspection` - 修复了 `ArrayIndexOutOfBoundsException`。 (#3427 由 @vanniktech 贡献)
- [IDE 插件] 为旧版 Kotlin 插件引用使用反射
- [编译器] 自定义方言与扩展函数不创建导入 (#3338 由 @hfhbd 贡献)
- [编译器] 修复了转义 `CodeBlock.of("${CodeBlock.toString()}")` 的问题 (#3340 由 @hfhbd 贡献)
- [编译器] 在迁移中等待异步执行语句 (#3352)
- [编译器] 修复了 `AS` (#3370 由 @hfhbd 贡献)
- [编译器] `getObject` 方法支持自动填充实际类型。 (#3401 由 @robxyy 贡献)
- [编译器] 修复了异步分组返回语句的代码生成 (#3411)
- [编译器] 如果可能，推断绑定参数的 Kotlin 类型，否则报错并提供更好的错误消息 (#3413 由 @hfhbd 贡献)
- [编译器] 不允许 `ABS("foo")` (#3430 由 @hfhbd 贡献)
- [编译器] 支持从其他参数推断 Kotlin 类型 (#3431 由 @hfhbd 贡献)
- [编译器] 始终创建数据库实现 (#3540 由 @hfhbd 贡献)
- [编译器] 放宽 Javadoc 并将其也添加到自定义映射器函数中 (#3554 由 @hfhbd 贡献)
- [编译器] 修复了绑定中的 `DEFAULT` (由 @hfhbd 贡献)
- [Paging] 修复了 Paging 3 (#3396)
- [Paging] 允许使用 `Long` 构造 `OffsetQueryPagingSource` (#3409)
- [Paging] 不要静态交换 `Dispatchers.Main` (#3428)

## [2.0.0-alpha03] - 2022-06-17
[2.0.0-alpha03]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha03

### 破坏性变更

- 方言现在像实际的 Gradle 依赖项一样被引用。
```groovy
sqldelight {
  MyDatabase {
    dialect("app.cash.sqldelight:postgres-dialect:2.0.0-alpha03")
  }
}
```
- `AfterVersionWithDriver` 类型已移除，取而代之的是现在始终包含驱动程序的 `AfterVersion`。
- `Schema` 类型不再是 `SqlDriver` 的子类型。
- `PreparedStatement` API 现在使用从零开始的索引进行调用。

### 已添加
- [IDE 插件] 添加了对针对正在运行的数据库运行 SQLite、MySQL 和 PostgreSQL 命令的支持 (#2718 由 @aperfilyev 贡献)
- [IDE 插件] 添加了对 Android Studio 数据库检查器的支持 (#3107 由 @aperfilyev 贡献)
- [运行时] 添加了对异步驱动程序的支持 (#3168 由 @dellisd 贡献)
- [原生驱动程序] 支持新的 Kotlin 原生内存模型 (#3177 由 @kpgalligan 贡献)
- [JS 驱动程序] 添加了用于 SqlJs 工作线程的驱动程序 (#3203 由 @dellisd 贡献)
- [Gradle 插件] 公开了 SQLDelight 任务的类路径
- [Gradle 插件] 添加了用于压缩迁移的 Gradle 任务
- [Gradle 插件] 添加了一个在迁移检查期间忽略架构定义的标志
- [MySQL 方言] 在 MySQL 中支持 `FOR SHARE` 和 `FOR UPDATE` (#3098)
- [MySQL 方言] 支持 MySQL 索引提示 (#3099)
- [PostgreSQL 方言] 添加了 `date_trunc` (#3295 由 @hfhbd 贡献)
- [JSON 扩展] 支持 JSON 表函数 (#3090)

### 已变更
- [运行时] 移除了不带驱动程序的 `AfterVersion` 类型 (#3091)
- [运行时] 将 `Schema` 类型移动到顶级
- [运行时] 开放方言和解析器以支持第三方实现 (#3232 由 @hfhbd 贡献)
- [编译器] 在失败报告中包含用于编译的方言 (#3086)
- [编译器] 跳过未使用的适配器 (#3162 由 @eygraber 贡献)
- [编译器] 在 `PrepareStatement` 中使用从零开始的索引 (#3269 由 @hfhbd 贡献)
- [Gradle 插件] 同时将方言设为适当的 Gradle 依赖项而不是字符串 (#3085)
- [Gradle 插件] Gradle 验证任务：缺少数据库文件时抛出异常。 (#3126 由 @vanniktech 贡献)

### 已修复
- [Gradle 插件] 对 Gradle 插件进行了微量清理和优化 (#3171 由 @3flex 贡献)
- [Gradle 插件] 不要为生成的目录使用 AGP 字符串
- [Gradle 插件] 使用 AGP 命名空间特性 (#3220)
- [Gradle 插件] 不要将 `kotlin-stdlib` 添加为 Gradle 插件的运行时依赖项 (#3245 由 @mbonnin 贡献)
- [Gradle 插件] 简化了多平台配置 (#3246 由 @mbonnin 贡献)
- [Gradle 插件] 支持仅限 JS 的项目 (#3310 由 @hfhbd 贡献)
- [IDE 插件] 为 Gradle 工具 API 使用 Java Home (#3078)
- [IDE 插件] 在 IDE 插件内部的正确类加载器上加载 JDBC 驱动程序 (#3080)
- [IDE 插件] 在失效前将文件元素标记为 `null`，以避免在已有的 PSI 架构更改期间出错 (#3082)
- [IDE 插件] 不要针对 `ALTER TABLE` 语句中重命名后的表名查找用例时发生崩溃 (#3106)
- [IDE 插件] 优化了检查器并使其能够针对预期的异常类型静默失败 (#3121)
- [IDE 插件] 删除应为生成目录的文件 (#3198)
- [IDE 插件] 修复了一个非安全的运算符调用
- [编译器] 确保带有 `RETURNING` 语句的更新和删除操作执行查询。 (#3084)
- [编译器] 在复合选择中正确推断实参类型 (#3096)
- [编译器] 通用表不生成数据类，因此不要返回它们 (#3097)
- [编译器] 更快地查找顶级迁移文件 (#3108)
- [编译器] 在管道运算符上正确继承为 null 性
- [编译器] 支持 `iif` ANSI SQL 函数
- [编译器] 不要生成空的查询文件 (#3300 由 @hfhbd 贡献)
- [编译器] 修复了仅包含问号的适配器 (#3314 由 @hfhbd 贡献)
- [PostgreSQL 方言] PostgreSQL 主键列始终不可为 null (#3092)
- [PostgreSQL 方言] 修复了多个表中具有相同名称的复制问题 (#3297 由 @hfhbd 贡献)
- [SQLite 3.35 方言] 仅在从修改后的表中删除索引列时显示错误 (#3158 由 @eygraber 贡献)

## [2.0.0-alpha02] - 2022-04-13
[2.0.0-alpha02]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha02

### 破坏性变更

- 您需要将所有出现的 `app.cash.sqldelight.runtime.rx` 替换为 `app.cash.sqldelight.rx2`

### 已添加
- [编译器] 支持在分组语句末尾返回
- [编译器] 支持通过方言模块扩展编译器，并添加了 SQLite JSON 扩展 (#1379, #2087)
- [编译器] 支持返回值的 `PRAGMA` 语句 (#1106)
- [编译器] 支持为标记的列生成值类型
- [编译器] 添加了对乐观锁和验证的支持 (#1952)
- [编译器] 支持多更新语句
- [PostgreSQL] 支持 PostgreSQL 返回语句
- [PostgreSQL] 支持 PostgreSQL 日期类型
- [PostgreSQL] 支持 PostgreSQL 间隔 (Interval)
- [PostgreSQL] 支持 PostgreSQL 布尔值并修复了修改表上的插入操作
- [PostgreSQL] 支持 PostgreSQL 中的可选限制 (Limit)
- [PostgreSQL] 支持 PostgreSQL `BYTEA` 类型
- [PostgreSQL] 为 PostgreSQL 序列 (Serial) 添加了测试
- [PostgreSQL] 支持 PostgreSQL 的 `FOR UPDATE` 语法
- [PostgreSQL] 支持 PostgreSQL 数组类型
- [PostgreSQL] 在 PostgreSQL 中正确存储/检索 UUID 类型
- [PostgreSQL] 支持 PostgreSQL `NUMERIC` 类型 (#1882)
- [PostgreSQL] 支持在公用表表达式内部返回查询 (#2471)
- [PostgreSQL] 支持 JSON 特定运算符
- [PostgreSQL] 添加了 Postgres Copy (由 @hfhbd 贡献)
- [MySQL] 支持 MySQL Replace
- [MySQL] 支持 `NUMERIC`/`BigDecimal` MySQL 类型 (#2051)
- [MySQL] 支持 MySQL `truncate` 语句
- [MySQL] 支持 MySQL 中的 JSON 特定运算符 (由 @eygraber 贡献)
- [MySQL] 支持 MySQL `INTERVAL` (#2969 由 @eygraber 贡献)
- [HSQL] 添加了 HSQL 窗口功能
- [SQLite] 不要在 `WHERE` 中替换可为 null 形参的相等性检查 (#1490 由 @eygraber 贡献)
- [SQLite] 支持 SQLite 3.35 返回语句 (#1490 由 @eygraber 贡献)
- [SQLite] 支持 `GENERATED` 子句
- [SQLite] 添加了对 SQLite 3.38 方言的支持 (由 @eygraber 贡献)

### 已变更
- [编译器] 稍微清理了生成的代码
- [编译器] 禁止在分组语句中使用表参数 (#1822)
- [编译器] 将分组查询放入事务中 (#2785)
- [运行时] 从驱动程序的 `execute` 方法返回更新后的行数
- [运行时] 将 `SqlCursor` 限制在访问连接的关键部分。 (#2123 由 @andersio 贡献)
- [Gradle 插件] 比较迁移的架构定义 (#841)
- [PostgreSQL] 禁止在 PostgreSQL 中使用双引号
- [MySQL] 在 MySQL 中使用 `==` 时报错 (#2673)

### 已修复
- [编译器] 2.0 alpha 中来自不同表的相同适配器类型导致编译错误的问题
- [编译器] 编译 `UPSERT` 语句时的问题 (#2791)
- [编译器] 如果有多个匹配项，查询结果应使用 `SELECT` 中的表 (#1874, #2313)
- [编译器] 支持更新具有 `INSTEAD OF` 触发器的视图 (#1018)
- [编译器] 在函数名称中支持 `from` 和 `for`
- [编译器] 在函数表达式中允许 `SEPARATOR` 关键字
- [编译器] 无法在 `ORDER BY` 中访问别名表的 `ROWID`
- [编译器] MySQL 的 `HAVING` 子句中无法识别别名列名
- [编译器] 错误的“发现多个同名列”错误
- [编译器] 无法设置 `PRAGMA locking_mode = EXCLUSIVE;`
- [PostgreSQL] PostgreSQL 重命名列
- [MySQL] 无法识别 `UNIX_TIMESTAMP`、`TO_SECONDS`、`JSON_ARRAYAGG` 等 MySQL 函数
- [SQLite] 修复 SQLite 窗口功能
- [IDE 插件] 在空进度指示器中运行转到处理程序 (#2990)
- [IDE 插件] 确保如果项目未配置，高亮访问器不运行 (#2981, #2976)
- [IDE 插件] 确保传递生成的代码在 IDE 中也能更新 (#1837)
- [IDE 插件] 更新方言时使索引失效

## [2.0.0-alpha01] - 2022-03-31
[2.0.0-alpha01]: https://github.com/sqldelight/sqldelight/releases/tag/2.0.0-alpha01

这是 2.0 的第一个 Alpha 版本，包含一些破坏性变更。我们预计会有更多 ABI 破坏性变更，因此请不要发布任何依赖此版本的库（应用程序应不受影响）。

### 破坏性变更

- 首先，您需要将所有出现的 `com.squareup.sqldelight` 替换为 `app.cash.sqldelight`
- 第二，您需要将所有出现的 `app.cash.sqldelight.android` 替换为 `app.cash.sqldelight.driver.android`
- 第三，您需要将所有出现的 `app.cash.sqldelight.sqlite.driver` 替换为 `app.cash.sqldelight.driver.jdbc.sqlite`
- 第四，您需要将所有出现的 `app.cash.sqldelight.drivers.native` 替换为 `app.cash.sqldelight.driver.native`
- IDE 插件必须更新到 2.X 版本，可以在 [alpha 或 eap 频道](https://plugins.jetbrains.com/plugin/8191-sqldelight/versions/alpha)中找到
- 方言现在是依赖项，您可以在 Gradle 中指定：

```gradle
sqldelight {
  MyDatabase {
    packageName = "com.example"
    dialect = "app.cash.sqldelight:mysql-dialect:2.0.0-alpha01"
  }
}
```

目前支持的方言包括 `mysql-dialect`、`postgresql-dialect`、`hsql-dialect`、`sqlite-3-18-dialect`、`sqlite-3-24-dialect`、`sqlite-3-25-dialect`、`sqlite-3-30-dialect` 和 `sqlite-3-35-dialect`

- 现在必须导入原始类型（例如 `INTEGER AS Boolean`，您必须 `import kotlin.Boolean`），某些先前支持的类型现在需要适配器。原始适配器在 `app.cash.sqldelight:primitive-adapters:2.0.0-alpha01` 中提供，用于大多数转换（例如使用 `IntColumnAdapter` 执行 `Integer AS kotlin.Int`）。

### 已添加
- [IDE 插件] 基础建议迁移 (由 @aperfilyev 贡献)
- [IDE 插件] 添加了导入提示操作 (由 @aperfilyev 贡献)
- [IDE 插件] 添加了 Kotlin 类补全 (由 @aperfilyev 贡献)
- [Gradle 插件] 为 Gradle 类型安全项目访问器添加了快捷方式 (由 @hfhbd 贡献)
- [编译器] 根据方言自定义代码生成 (由 @MariusVolkhart 贡献)
- [JDBC 驱动程序] 向 `JdbcDriver` 添加了通用类型 (由 @MariusVolkhart 贡献)
- [SQLite] 添加了对 SQLite 3.35 的支持 (由 @eygraber 贡献)
- [SQLite] 添加了对 `ALTER TABLE DROP COLUMN` 的支持 (由 @eygraber 贡献)
- [SQLite] 添加了对 SQLite 3.30 方言的支持 (由 @eygraber 贡献)
- [SQLite] 在 SQLite 中支持 `NULLS FIRST`/`LAST` (由 @eygraber 贡献)
- [HSQL] 为 `GENERATED` 子句添加了 HSQL 支持 (由 @MariusVolkhart 贡献)
- [HSQL] 在 HSQL 中添加了对命名参数的支持 (由 @MariusVolkhart 贡献)
- [HSQL] 自定义了 HSQL 插入查询 (由 @MariusVolkhart 贡献)

### 已变更
- [全局] 软件包名称已从 `com.squareup.sqldelight` 更改为 `app.cash.sqldelight`。
- [运行时] 将方言移动到它们各自隔离的 Gradle 模块中
- [运行时] 切换到由驱动程序实现的查询通知。
- [运行时] 将默认列适配器提取到单独的模块 (#2056, #2060)
- [编译器] 让模块生成查询实现，而不是在每个模块中重复生成
- [编译器] 移除了生成的数据类自定义 `toString` 的生成。 (由 @PaulWoitaschek 贡献)
- [JS 驱动程序] 从 `sqljs-driver` 中移除了 `sql.js` 依赖项 (由 @dellisd 贡献)
- [Paging] 移除了 Android Paging 2 扩展
- [IDE 插件] 在 SQLDelight 同步期间添加了编辑器横幅 (#2511)
- [IDE 插件] 支持的最低 IntelliJ 版本为 2021.1

### 已修复
- [运行时] 扁平化监听器列表以减少分配和指针追逐。 (由 @andersio 贡献)
- [IDE 插件] 修复了错误消息以允许跳转到错误 (由 @hfhbd 贡献)
- [IDE 插件] 添加了缺失的检查说明 (#2768 由 @aperfilyev 贡献)
- [IDE 插件] 修复了 `GotoDeclarationHandler` 中的异常 (#2531, #2688, #2804 由 @aperfilyev 贡献)
- [IDE 插件] 高亮显示 `import` 关键字 (由 @aperfilyev 贡献)
- [IDE 插件] 修复了未解析的 Kotlin 类型 (#1678 由 @aperfilyev 贡献)
- [IDE 插件] 修复了未解析软件包的高亮显示问题 (#2543 由 @aperfilyev 贡献)
- [IDE 插件] 如果项目索引尚未初始化，不要尝试检查不匹配的列
- [IDE 插件] 在 Gradle 同步发生前不要初始化文件索引
- [IDE 插件] 如果 Gradle 同步开始，取消 SQLDelight 导入
- [IDE 插件] 在执行撤消操作的线程之外重新生成数据库
- [IDE 插件] 如果引用无法解析，使用空白 Java 类型
- [IDE 插件] 在文件解析期间正确脱离主线程，仅在写入时切回
- [IDE 插件] 改进了与旧版 IntelliJ 版本的兼容性 (由 @3flex 贡献)
- [IDE 插件] 使用更快的注解 API
- [Gradle 插件] 添加运行时时显式支持 js/android 插件 (由 @ZacSweers 贡献)
- [Gradle 插件] 注册迁移输出任务而不从迁移中推导架构 (#2744 由 @kevincianfarini 贡献)
- [Gradle 插件] 如果迁移任务崩溃，打印崩溃时运行的文件
- [Gradle 插件] 在生成代码时对文件进行排序以确保输出幂等 (由 @ZacSweers 贡献)
- [编译器] 使用更快的 API 遍历文件，且不探索整个 PSI 图
- [编译器] 为选择函数参数添加了关键字重整 (#2759 由 @aperfilyev 贡献)
- [编译器] 修复了迁移适配器的 `packageName` (由 @hfhbd 贡献)
- [编译器] 在属性上而非类型上发出注解 (#2798 由 @aperfilyev 贡献)
- [编译器] 在传递给 `Query` 子类型之前对实参进行排序 (#2379 由 @aperfilyev 贡献)

## [1.5.3] - 2021-11-23
[1.5.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.3

### 已添加
- [JDBC 驱动程序] 开放 `JdbcDriver` 以支持第三方驱动程序实现 (#2672 由 @hfhbd 贡献)
- [MySQL 方言] 添加了缺失的时间增量函数 (#2671 由 @sdoward 贡献)
- [协程扩展] 为协程扩展添加了 M1 目标 (由 @PhilipDukhov 贡献)

### 已变更
- [Paging3 扩展] 以 JAR 而非 AAR 形式分发 `sqldelight-android-paging3` (#2634 由 @julioromano 贡献)
- 既是软关键字的属性名称现在将以后划线结尾。例如，`value` 将公开为 `value_`

### 已修复
- [编译器] 不要为重复的数组形参提取变量 (由 @aperfilyev 贡献)
- [Gradle 插件] 添加了 `kotlin.mpp.enableCompatibilityMetadataVariant`。 (#2628 由 @martinbonnin 贡献)
- [IDE 插件] 查找用例处理需要读操作

## [1.5.2] - 2021-10-12
[1.5.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.2

### 已添加
- [Gradle 插件] HMPP 支持 (#2548 由 @martinbonnin 贡献)
- [IDE 插件] 添加了 `NULL` 比较检查 (由 @aperfilyev 贡献)
- [IDE 插件] 添加了检查抑制器 (#2519 由 @aperfilyev 贡献)
- [IDE 插件] 混合命名的和位置参数的检查 (由 @aperfilyev 贡献)
- [SQLite 驱动程序] 添加了 `mingwX86` 目标。 (#2558 由 @enginegl 贡献)
- [SQLite 驱动程序] 添加了 M1 目标
- [SQLite 驱动程序] 添加了 `linuxX64` 支持 (#2456 由 @chippmann 贡献)
- [MySQL 方言] 向 MySQL 添加了 `ROW_COUNT` 函数 (#2523)
- [PostgreSQL 方言] PostgreSQL 重命名、删除列 (由 @pabl0rg 贡献)
- [PostgreSQL 方言] PostgreSQL 语法无法识别 `CITEXT`
- [PostgreSQL 方言] 包含了 `TIMESTAMP WITH TIME ZONE` 和 `TIMESTAMPTZ`
- [PostgreSQL 方言] 添加了 PostgreSQL `GENERATED` 列的语法
- [运行时] 提供 `SqlDriver` 作为 `AfterVersion` 的形参 (#2534, 2614 由 @ahmedre 贡献)

### 已变更
- [Gradle 插件] 显式要求 Gradle 7.0 (#2572 由 @martinbonnin 贡献)
- [Gradle 插件] 使 `VerifyMigrationTask` 支持 Gradle 的最新检查 (#2533 由 @3flex 贡献)
- [IDE 插件] 当将可为 null 类型与不可为 null 类型连接时，不再发出“Join 比较两个不同类型的列”的警告 (#2550 由 @pchmielowski 贡献)
- [IDE 插件] 澄清了列类型中小写 `as` 的错误 (由 @aperfilyev 贡献)

### 已修复
- [IDE 插件] 如果项目已被释放，不要以新方言重新解析 (#2609)
- [IDE 插件] 如果关联的虚拟文件为 `null`，则模块也为 `null` (#2607)
- [IDE 插件] 避免在未使用查询检查期间发生崩溃 (#2610)
- [IDE 插件] 在写操作内部运行数据库同步写入 (#2605)
- [IDE 插件] 让 IDE 安排 SQLDelight 同步
- [IDE 插件] 修复了 `JavaTypeMixin` 中的 NPE (#2603 由 @aperfilyev 贡献)
- [IDE 插件] 修复了 `MismatchJoinColumnInspection` 中的 `IndexOutOfBoundsException` (#2602 由 @aperfilyev 贡献)
- [IDE 插件] 添加了 `UnusedColumnInspection` 的说明 (#2600 由 @aperfilyev 贡献)
- [IDE 插件] 将 `PsiElement.generatedVirtualFiles` 封装进读操作 (#2599 由 @aperfilyev 贡献)
- [IDE 插件] 移除了不必要的非空转换 (#2596)
- [IDE 插件] 正确处理查找用例的 null 值 (#2595)
- [IDE 插件] 修复了 Android 生成文件的 IDE 自动补全 (#2573 由 @martinbonnin 贡献)
- [IDE 插件] 修复了 `SqlDelightGotoDeclarationHandler` 中的 NPE (由 @aperfilyev 贡献)
- [IDE 插件] 在 `INSERT` 语句内的实参中对 Kotlin 关键字进行重整 (#2433 由 @aperfilyev 贡献)
- [IDE 插件] 修复了 `SqlDelightFoldingBuilder` 中的 NPE (#2382 由 @aperfilyev 贡献)
- [IDE 插件] 在 `CopyPasteProcessor` 中捕获 `ClassCastException` (#2369 由 @aperfilyev 贡献)
- [IDE 插件] 修复了更新实时模板 (由 @IliasRedissi 贡献)
- [IDE 插件] 为意图操作添加了说明 (#2489 由 @aperfilyev 贡献)
- [IDE 插件] 修复了如果未找到表时 `CreateTriggerMixin` 中的异常 (由 @aperfilyev 贡献)
- [编译器] 对表创建语句进行拓扑排序
- [编译器] 停止在目录上调用 `forDatabaseFiles` 回调 (#2532)
- [Gradle 插件] 将 `generateDatabaseInterface` 任务依赖关系传播给潜在的使用者 (#2518 由 @martinbonnin 贡献)

## [1.5.1] - 2021-07-16
[1.5.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.1

### 已添加
- [PostgreSQL 方言] PostgreSQL `JSONB` 和 `ON Conflict Do Nothing` (由 @satook 贡献)
- [PostgreSQL 方言] 添加了对 PostgreSQL `ON CONFLICT (column, ...) DO UPDATE` 的支持 (由 @satook 贡献)
- [MySQL 方言] 支持 MySQL 生成的列 (由 @JGulbronson 贡献)
- [原生驱动程序] 添加了 `watchosX64` 支持
- [IDE 插件] 添加了形参类型和注解 (由 @aperfilyev 贡献)
- [IDE 插件] 添加了生成 'select all' 查询的操作 (由 @aperfilyev 贡献)
- [IDE 插件] 在自动补全中显示列类型 (由 @aperfilyev 贡献)
- [IDE 插件] 为自动补全添加了图标 (由 @aperfilyev 贡献)
- [IDE 插件] 添加了生成 'select by primary key' 查询的操作 (由 @aperfilyev 贡献)
- [IDE 插件] 添加了生成 'insert into' 查询的操作 (由 @aperfilyev 贡献)
- [IDE 插件] 为列名、语句标识符、函数名添加了高亮显示 (由 @aperfilyev 贡献)
- [IDE 插件] 添加了剩余的查询生成操作 (#489 由 @aperfilyev 贡献)
- [IDE 插件] 显示来自 `insert-stmt` 的形参提示 (由 @aperfilyev 贡献)
- [IDE 插件] 表别名意图操作 (由 @aperfilyev 贡献)
- [IDE 插件] 限定列名意图 (由 @aperfilyev 贡献)
- [IDE 插件] Kotlin 属性的转到定义 (由 @aperfilyev 贡献)

### 已变更
- [原生驱动程序] 通过尽可能避免冻结和可共享数据结构来提高原生事务性能 (由 @andersio 贡献)
- [Paging 3] 将 Paging3 版本提升至 3.0.0 稳定版
- [JS 驱动程序] 将 `sql.js` 升级到 1.5.0

### 已修复
- [JDBC SQLite 驱动程序] 在清除 `ThreadLocal` 之前在连接上调用 `close()` (#2444 由 @hannesstruss 贡献)
- [RX 扩展] 修复了订阅/销毁竞态泄漏 (#2403 由 @pyricau 贡献)
- [协程扩展] 确保在通知之前注册查询监听器
- [编译器] 对 `notifyQueries` 进行排序以获得一致的 Kotlin 输出文件 (由 @thomascjy 贡献)
- [编译器] 不要使用 `@JvmField` 注解选择查询类属性 (由 @eygraber 贡献)
- [IDE 插件] 修复了导入优化器 (#2350 由 @aperfilyev 贡献)
- [IDE 插件] 修复了未使用的列检查 (由 @aperfilyev 贡献)
- [IDE 插件] 为导入检查和类注解器添加了嵌套类支持 (由 @aperfilyev 贡献)
- [IDE 插件] 修复了 `CopyPasteProcessor` 中的 NPE (#2363 由 @aperfilyev 贡献)
- [IDE 插件] 修复了 `InlayParameterHintsProvider` 中的崩溃 (#2359 由 @aperfilyev 贡献)
- [IDE 插件] 修复了将任何文本复制粘贴到创建表语句时插入空行的问题 (#2431 由 @aperfilyev 贡献)

## [1.5.0] - 2021-04-23
[1.5.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.5.0

### 已添加
- [SQLite Javascript 驱动程序] 启用了 `sqljs-driver` 发布 (#1667 由 @dellisd 贡献)
- [Paging3 扩展] Android Paging 3 库的扩展 (#1786 由 @kevincianfarini 贡献)
- [MySQL 方言] 添加了对 MySQL `ON DUPLICATE KEY UPDATE` 冲突解决的支持。 (由 @rharter 贡献)
- [SQLite 方言] 为 SQLite `offsets()` 添加了编译器支持 (由 @qjroberts 贡献)
- [IDE 插件] 为未知类型添加了导入快速修复 (#683 由 @aperfilyev 贡献)
- [IDE 插件] 添加了未使用的导入检查 (#1161 由 @aperfilyev 贡献)
- [IDE 插件] 添加了未使用的查询检查 (由 @aperfilyev 贡献)
- [IDE 插件] 添加了未使用的列检查 (#569 由 @aperfilyev 贡献)
- [IDE 插件] 复制/粘贴时自动引入导入 (#684 由 @aperfilyev 贡献)
- [IDE 插件] 当 Gradle/IntelliJ 插件版本不兼容时弹出气泡提示
- [IDE 插件] `Insert Into ... VALUES(?)` 形参提示 (#506 由 @aperfilyev 贡献)
- [IDE 插件] 内联形参提示 (由 @aperfilyev 贡献)
- [运行时] 在运行时中包含一个用于通过回调运行迁移的 API (#1844)

### 已变更
- [编译器] 智能转换 `IS NOT NULL` 查询 (#867)
- [编译器] 防止在运行时会失败的关键字 (#1471, #1629)
- [Gradle 插件] 将 Gradle 插件的大小从 60 MB 减少到 13 MB。
- [Gradle 插件] 正确支持 Android 变体，并移除对 KMM 特定目标的 SQL 支持 (#1039)
- [Gradle 插件] 根据 `minSdk` 选择最低 SQLite 版本 (#1684)
- [原生驱动程序] 原生驱动程序连接池和性能更新

### 已修复
- [编译器] Lambda 前的 NBSP (由 @oldergod 贡献)
- [编译器] 修复了生成的 `bind*` 和 `cursor.get*` 语句中不兼容的类型
- [编译器] SQL 子句应持久化适配后的类型 (#2067)
- [编译器] 仅包含 `NULL` 关键字的列应为可为 null
- [编译器] 不要生成带有类型注解的映射器 lambda (#1957)
- [编译器] 如果自定义查询发生冲突，使用文件名作为额外的软件包后缀 (#1057, #1278)
- [编译器] 确保外键级联会导致查询监听器收到通知 (#1325, #1485)
- [编译器] 如果合并两个相同类型，返回表类型 (#1342)
- [编译器] 确保 `ifnull` 和 `coalesce` 的实参可以为 null (#1263)
- [编译器] 正确为表达式使用查询施加的为 null 性
- [MySQL 方言] 支持 MySQL `if` 语句
- [PostgreSQL 方言] 在 PostgreSQL 中将 `NUMERIC` 和 `DECIMAL` 检索为 `Double` (#2118)
- [SQLite 方言] `UPSERT` 通知应考虑 `BEFORE`/`AFTER UPDATE` 触发器。 (#2198 由 @andersio 贡献)
- [SQLite 驱动程序] 除非是在内存中，否则在 `SqliteDriver` 中为线程使用多个连接 (#1832)
- [JDBC 驱动程序] JDBC 驱动程序假定 `autoCommit` 为 `true` (#2041)
- [JDBC 驱动程序] 确保在发生异常时关闭连接 (#2306)
- [IDE 插件] 修复了 Windows 上由于路径分隔符错误导致 `GoToDeclaration`/`FindUsages` 损坏的问题 (#2054 由 @angusholder 贡献)
- [IDE 插件] 忽略 Gradle 错误而不是在 IDE 中崩溃。
- [IDE 插件] 如果 `sqldelight` 文件被移动到非 `sqldelight` 模块，不要尝试生成代码
- [IDE 插件] 在 IDE 中忽略代码生成错误
- [IDE 插件] 确保不尝试负值子字符串截取 (#2068)
- [IDE 插件] 同时确保在运行 Gradle 操作之前项目未被释放 (#2155)
- [IDE 插件] 可为 null 类型上的算术运算也应为可为 null (#1853)
- [IDE 插件] 使 'expand * 意图' 适用于额外的投影 (#2173 由 @aperfilyev 贡献)
- [IDE 插件] 如果 Kotlin 解析失败期间转到操作 (GoTo) 失败，不要尝试跳转到 `sqldelight` 文件
- [IDE 插件] 如果 IntelliJ 在 SQLDelight 索引时遇到异常，不要崩溃
- [IDE 插件] 处理 IDE 中代码生成前检测错误时发生的异常
- [IDE 插件] 使 IDE 插件与动态插件兼容 (#1536)
- [Gradle 插件] 使用 `WorkerApi` 生成数据库时存在竞态条件 (#2062 由 @stephanenicolas 贡献)
- [Gradle 插件] `classLoaderIsolation` 阻止了自定义 JDBC 的使用 (#2048 由 @benasher44 贡献)
- [Gradle 插件] 改进了缺失 `packageName` 的错误消息 (由 @vanniktech 贡献)
- [Gradle 插件] SQLDelight 将 IntelliJ 依赖项泄露到了构建脚本类路径中 (#1998)
- [Gradle 插件] 修复了构建缓存问题 (#2075)
- [Gradle 插件] 不要在 Gradle 插件中依赖 `kotlin-native-utils` (由 @ilmat192 贡献)
- [Gradle 插件] 如果仅有迁移文件，也写入数据库 (#2094)
- [Gradle 插件] 确保菱形依赖在最终编译单元中仅被拾取一次 (#1455)

此外，还要特别感谢 @3flex，他在此版本中为改进 SQLDelight 基础架构做了大量工作。

## [1.4.4] - 2020-10-08
[1.4.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.4

### 已添加
- [PostgreSQL 方言] 在 `WITH` 中支持数据修改语句
- [PostgreSQL 方言] 支持 `substring` 函数
- [Gradle 插件] 添加了 `verifyMigrations` 标志，用于在 SQLDelight 编译期间验证迁移 (#1872)

### 已变更
- [编译器] 在非 SQLite 方言中将 SQLite 特定函数标记为未知
- [Gradle 插件] 当应用了 `sqldelight` 插件但未配置数据库时提供警告 (#1421)

### 已修复
- [编译器] 报告在 `ORDER BY` 子句中绑定列名的错误 (#1187 由 @eygraber 贡献)
- [编译器] 生成数据库接口时出现注册表警告 (#1792)
- [编译器] 修复了 `case` 语句不正确的类型推断 (#1811)
- [编译器] 为没有版本的迁移文件提供更好的错误提示 (#2006)
- [编译器] 某些数据库类型 `ColumnAdapter` 需要封装的数据库类型不正确 (#2012)
- [编译器] `CAST` 的为 null 性问题 (#1261)
- [编译器] 查询包装器中出现大量名称遮蔽警告 (#1946 由 @eygraber 贡献)
- [编译器] 生成的代码正在使用全限定名称 (#1939)
- [IDE 插件] 从 Gradle 同步触发 SQLDelight 代码生成
- [IDE 插件] 修复了更改 .sq 文件时插件未重新生成数据库接口的问题 (#1945)
- [IDE 插件] 修复了将文件移动到新软件包时的问题 (#444)
- [IDE 插件] 如果无处移动光标，不执行任何操作而非崩溃 (#1994)
- [IDE 插件] 为 Gradle 项目之外的文件使用空软件包名称 (#1973)
- [IDE 插件] 针对无效类型优雅地失败 (#1943)
- [IDE 插件] 遇到未知表达式时抛出更好的错误消息 (#1958)
- [Gradle 插件] SQLDelight 将 IntelliJ 依赖项泄露到了构建脚本类路径中 (#1998)
- [Gradle 插件] 在 *.sq 文件中添加方法文档时，提示 "JavadocIntegrationKt not found" 编译错误 (#1982)
- [Gradle 插件] SQLDelight Gradle 插件不支持配置缓存 (CoCa)。 (#1947 由 @stephanenicolas 贡献)
- [SQLite JDBC 驱动程序] `SQLException`: 数据库处于自动提交模式 (#1832)
- [协程扩展] 修复了协程扩展的 IR 后端 (#1918 由 @dellisd 贡献)

## [1.4.3] - 2020-09-04
[1.4.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.3

### 已添加
- [MySQL 方言] 添加了对 MySQL `last_insert_id` 函数的支持 (由 @lawkai 贡献)
- [PostgreSQL 方言] 支持 `SERIAL` 数据类型 (由 @veyndan 和 @felipecsl 贡献)
- [PostgreSQL 方言] 支持 PostgreSQL `RETURNING` (由 @veyndan 贡献)

### 已修复
- [MySQL 方言] 将 MySQL `AUTO_INCREMENT` 视为具有默认值 (#1823)
- [编译器] 修复了 `Upsert` 语句编译器错误 (#1809 由 @eygraber 贡献)
- [编译器] 修复了生成无效 Kotlin 代码的问题 (#1925 由 @eygraber 贡献)
- [编译器] 为未知函数提供了更好的错误消息 (#1843)
- [编译器] 公开 `string` 作为 `instr` 第二个实参的类型
- [IDE 插件] 修复了 IDE 插件的守护进程膨胀和 UI 线程卡死问题 (#1916)
- [IDE 插件] 处理空模块的情况 (#1902)
- [IDE 插件] 在未配置的 sq 文件中，为软件包名称返回空字符串 (#1920)
- [IDE 插件] 修复了分组语句并为它们添加了集成测试 (#1820)
- [IDE 插件] 使用内置的 `ModuleUtil` 查找元素的模块 (#1854)
- [IDE 插件] 仅将有效元素添加到查找中 (#1909)
- [IDE 插件] 父级可能为 `null` (#1857)

## [1.4.2] - 2020-08-27
[1.4.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.2

### 已添加
- [运行时] 支持新的 JS IR 后端
- [Gradle 插件] 添加了 `generateSqlDelightInterface` Gradle 任务。 (由 @vanniktech 贡献)
- [Gradle 插件] 添加了 `verifySqlDelightMigration` Gradle 任务。 (由 @vanniktech 贡献)

### 已修复
- [IDE 插件] 使用 Gradle 工具 API 促进 IDE 和 Gradle 之间的数据共享
- [IDE 插件] 架构推导默认设为 `false`
- [IDE 插件] 正确检索 `commonMain` 源集
- [MySQL 方言] 向 `mySqlFunctionType()` 添加了 `minute` (由 @maaxgr 贡献)

## [1.4.1] - 2020-08-21
[1.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.1

### 已添加
- [运行时] 支持 Kotlin 1.4.0 (#1859)

### 已变更
- [Gradle 插件] 将 AGP 依赖项设为 `compileOnly` (#1362)

### 已修复
- [编译器] 为列定义规则和表接口生成器添加了可选的 Javadoc (#1224 由 @endanke 贡献)
- [SQLite 方言] 添加了对 SQLite FTS5 辅助函数 `highlight`、`snippet` 和 `bm25` 的支持 (由 @drampelt 贡献)
- [MySQL 方言] 支持 MySQL `bit` 数据类型
- [MySQL 方言] 支持 MySQL 二进制字面量
- [PostgreSQL 方言] 从 `sql-psi` 公开 `SERIAL` (由 @veyndan 贡献)
- [PostgreSQL 方言] 添加了 `BOOLEAN` 数据类型 (由 @veyndan 贡献)
- [PostgreSQL 方言] 添加了 `NULL` 列约束 (由 @veyndan 贡献)
- [HSQL 方言] 为 HSQL 添加了 `AUTO_INCREMENT` 支持 (由 @rharter 贡献)

## [1.4.0] - 2020-06-22
[1.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.4.0

### 已添加
- [MySQL 方言] MySQL 支持 (由 @JGulbronson 和 @veyndan 贡献)
- [PostgreSQL 方言] 实验性 PostgreSQL 支持 (由 @veyndan 贡献)
- [HSQL 方言] 实验性 H2 支持 (由 @MariusVolkhart 贡献)
- [SQLite 方言] SQLite FTS5 支持 (由 @benasher44 和 @jpalawaga 贡献)
- [SQLite 方言] 支持修改表重命名列 (#1505 由 @angusholder 贡献)
- [IDE] 对迁移 (.sqm) 文件的 IDE 支持
- [IDE] 添加了模仿内置 SQL 实时模板的 SQLDelight 实时模板 (#1154 由 @veyndan 贡献)
- [IDE] 添加了新的 SQLDelight 文件操作 (#42 由 @romtsn 贡献)
- [运行时] 用于返回结果的事务的 `transactionWithReturn` API
- [编译器] 在 .sq 文件中将多个 SQL 语句组合在一起的语法
- [编译器] 支持从迁移文件生成架构 (Schema)
- [Gradle 插件] 添加了一个将迁移文件输出为有效 SQL 的任务

### 已变更
- [文档] 重新设计了文档网站 (由 @saket 贡献)
- [Gradle 插件] 改进了不支持的方言错误消息 (由 @veyndan 贡献)
- [IDE] 根据方言动态更改文件图标 (由 @veyndan 贡献)
- [JDBC 驱动程序] 公开了基于 `javax.sql.DataSource` 的 `JdbcDriver` 构造函数 (#1614)

### 已修复
- [编译器] 支持表上的 Javadoc 并修复了单个文件中的多个 Javadoc 问题 (#1224)
- [编译器] 允许为合成列插入值 (#1351)
- [编译器] 修复了目录名称清理中的不一致问题 (由 @ZacSweers 贡献)
- [编译器] 合成列在联接中应保留为 null 性 (#1656)
- [编译器] 将删除语句固定在 `DELETE` 关键字上 (#1643)
- [编译器] 修复了引用 (quoting) 问题 (#1525 由 @angusholder 贡献)
- [编译器] 修复了 `between` 运算符以正确递归到表达式中 (#1279)
- [编译器] 为创建索引时缺失的表/列提供了更好的错误提示 (#1372)
- [编译器] 允许在联接约束中使用外部查询的投影 (#1346)
- [原生驱动程序] 使执行操作使用 `transationPool` (由 @benasher44 贡献)
- [JDBC 驱动程序] 使用 JDBC 事务 API 而非 SQLite 的 (#1693)
- [IDE] 修复了 `virtualFile` 引用始终为原始文件的问题 (#1782)
- [IDE] 报告错误到 Bugsnag 时使用正确的 `throwable` (#1262)
- [Paging 扩展] 修复了泄漏的 `DataSource` (#1628)
- [Gradle 插件] 如果生成架构时输出数据库文件已存在，则将其删除 (#1645)
- [Gradle 插件] 如果存在缺口，则迁移验证失败
- [Gradle 插件] 显式使用我们设置的文件索引 (#1644)

## [1.3.0] - 2020-04-03
[1.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.3.0

* 新增：[Gradle] `dialect` 属性，用于指定要针对其编译的 SQL 方言。
* 新增：[编译器] #1009 对 MySQL 方言的实验性支持。
* 新增：[编译器] #1436 对 SQLite 3.24 方言和 `upsert` 的支持。
* 新增：[JDBC 驱动程序] 从 SQLite JVM 驱动程序中拆分出 JDBC 驱动程序。
* 已修复：[编译器] #1199 支持任意长度的 lambda。
* 已修复：[编译器] #1610 将 `avg()` 的返回值类型修复为可为 null。
* 已修复：[IntelliJ] #1594 修复了路径分隔符处理，该问题导致在 Windows 上破坏了转到和查找用例。

## [1.2.2] - 2020-01-22
[1.2.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.2

* 新增：[运行时] 支持 Windows (mingw)、tvOS、watchOS 和 macOS 架构。
* 已修复：[编译器] `sum()` 的返回值类型应为可为 null。
* 已修复：[Paging] 将 `Transacter` 传入 `QueryPagingSourceFactory` 以避免竞态条件。
* 已修复：[IntelliJ 插件] 查找文件的软件包名称时不要搜索依赖项。
* 已修复：[Gradle] #862 将 Gradle 中的验证器日志更改为调试级别。
* 增强：[Gradle] 转换 `GenerateSchemaTask` 以使用 Gradle 工作程序。
* 注意：`sqldelight-runtime` 构件更名为 `runtime`。

## [1.2.1] - 2019-12-11
[1.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.1

* 已修复：[Gradle] Kotlin Native 1.3.60 支持。
* 已修复：[Gradle] #1287 同步时的警告。
* 已修复：[编译器] #1469 为查询创建 `SynetheticAccessor`。
* 已修复：[JVM 驱动程序] 修复了内存泄漏。
* 注意：协程扩展构件要求将 `kotlinx bintray maven` 仓库添加到您的构建脚本中。

## [1.2.0] - 2019-08-30
[1.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.2.0

* 新增：[运行时] 稳定的 Flow API。
* 已修复：[Gradle] Kotlin Native 1.3.50 支持。
* 已修复：[Gradle] #1380 清理构建有时会失败。
* 已修复：[Gradle] #1348 运行验证任务时打印 "Could not retrieve functions"。
* 已修复：[编译器] #1405 如果查询包含 FTS 表联接，则无法构建项目。
* 已修复：[Gradle] #1266 拥有多个数据库模块时偶尔出现的 Gradle 构建失败。

## [1.1.4] - 2019-07-11
[1.1.4]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.4

* 新增：[运行时] 实验性 Kotlin Flow API。
* 已修复：[Gradle] Kotlin/Native 1.3.40 兼容性。
* 已修复：[Gradle] #1243 修复了在 Gradle 按需配置时使用 SQLDelight 的问题。
* 已修复：[Gradle] #1385 修复了在增量注解处理时使用 SQLDelight 的问题。
* 已修复：[Gradle] 允许 Gradle 任务缓存。
* 已修复：[Gradle] #1274 允许在使用 Kotlin DSL 时使用 `sqldelight` 扩展。
* 已修复：[编译器] 为每个查询确定性地生成唯一 ID。
* 已修复：[编译器] 仅在事务完成时通知正在监听的查询。
* 已修复：[JVM 驱动程序] #1370 强制 `JdbcSqliteDriver` 用户必须提供数据库 URL。

## [1.1.3] - 2019-04-14
[1.1.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.3

* Gradle Metadata 1.0 发布。

## [1.1.2] - 2019-04-14
[1.1.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.2

* 新增：[运行时] #1267 日志驱动程序装饰器。
* 已修复：[编译器] #1254 拆分长度超过 2^16 个字符的字符串字面量。
* 已修复：[Gradle] #1260 生成的源码在多平台项目中被识别为 iOS 源码。
* 已修复：[IDE] #1290 `CopyAsSqliteAction.kt:43` 中的 `kotlin.KotlinNullPointerException`。
* 已修复：[Gradle] #1268 运行 `linkDebugFrameworkIos*` 任务在最近版本中失败。

## [1.1.1] - 2019-03-01
[1.1.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.1

* 已修复：[Gradle] 修复了 Android 项目的模块依赖编译问题。
* 已修复：[Gradle] #1246 在 `afterEvaluate` 中设置 API 依赖项。
* 已修复：[编译器] 数组类型被正确打印。

## [1.1.0] - 2019-02-27
[1.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.1.0

* 新增：[Gradle] #502 允许指定架构模块依赖关系。
* 增强：[编译器] #1111 表错误排在其他错误之前。
* 已修复：[编译器] #1225 为 `REAL` 字面量返回正确的类型。
* 已修复：[编译器] #1218 `docid` 通过触发器传播。

## [1.0.3] - 2019-01-30
[1.0.3]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.3

* 增强：[运行时] #1195 原生驱动程序/运行时 Arm32。
* 增强：[运行时] #1190 从 `Query` 类型中公开映射器。

## [1.0.2] - 2019-01-26
[1.0.2]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.2

* 已修复：[Gradle 插件] 更新至 Kotlin 1.3.20。
* 已修复：[运行时] 事务不再吞没异常。

## [1.0.1] - 2019-01-21
[1.0.1]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.1

* 增强：[原生驱动程序] 允许向 `DatabaseConfiguration` 传递目录名称。
* 增强：[编译器] #1173 不带软件包的文件编译失败。
* 已修复：[IDE] 正确向 Square 报告 IDE 错误。
* 已修复：[IDE] #1162 同一软件包中的类型显示为错误但运行正常。
* 已修复：[IDE] #1166 重命名表失败并出现 NPE。
* 已修复：[编译器] #1167 尝试解析带有 `UNION` 和 `SELECT` 的复杂 SQL 语句时抛出异常。

## [1.0.0] - 2019-01-08
[1.0.0]: https://github.com/sqldelight/sqldelight/releases/tag/1.0.0

* 新增：彻底重构生成的代码，现在使用 Kotlin。
* 新增：RxJava2 扩展构件。
* 新增：Android Paging 扩展构件。
* 新增：Kotlin 多平台支持。
* 新增：Android、iOS 和 JVM SQLite 驱动程序构件。
* 新增：事务 API。

## [0.7.0] - 2018-02-12
[0.7.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.7.0

 * 新增：生成的代码已更新为仅使用 Support SQLite 库。所有查询现在生成语句对象，而非原始字符串。
 * 新增：IDE 中的语句折叠。
 * 新增：布尔类型现已自动处理。
 * 已修复：从代码生成中移除了已弃用的 `marshal`。
 * 已修复：修正了 'avg' SQL 函数类型映射为 `REAL`。
 * 已修复：正确检测 'julianday' SQL 函数。

## [0.6.1] - 2017-03-22
[0.6.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.6.1

 * 新增：不带实参的删除、更新和插入语句会生成编译后的语句。
 * 已修复：子查询中使用的视图内的 `USING` 子句不会报错。
 * 已修复：移除了生成的 `Mapper` 上的重复类型。
 * 已修复：子查询可用于针对实参进行检查的表达式中。

## [0.6.0] - 2017-03-06
[0.6.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.6.0

 * 新增：选择查询现在作为 `SqlDelightStatement` 工厂而非字符串常量公开。
 * 新增：查询 Javadoc 现已复制到语句和映射器工厂。
 * 新增：为视图名称发出字符串常量。
 * 已修复：需要工厂的视图查询现在正确要求这些工厂作为实参。
 * 已修复：验证插入的实参数量是否与指定的列数匹配。
 * 已修复：正确编码 `WHERE` 子句中使用的 `BLOB` 字面量。
 * 此版本要求 Gradle 3.3 或更高版本。

## [0.5.1] - 2016-10-24
[0.5.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.5.1

 * 新增：编译后的语句扩展了一个抽象类型。
 * 已修复：形参中的原始类型如果为可为 null 则会被装箱。
 * 已修复：工厂方法中存在绑定实参所需的所有工厂。
 * 已修复：转义的列名被正确封装。

## [0.5.0] - 2016-10-19
[0.5.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.5.0

 * 新增：SQLite 实参可以通过工厂以类型安全的方式传递。
 * 新增：IntelliJ 插件在 .sq 文件上执行格式设置。
 * 新增：支持 SQLite 时间戳字面量。
 * 已修复：参数化类型可以在 IntelliJ 中点击跳转。
 * 已修复：从 `Cursor` 获取时，转义的列名不再抛出 `RuntimeExceptions`。
 * 已修复：Gradle 插件在尝试打印异常时不会崩溃。

## [0.4.4] - 2016-07-20
[0.4.4]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.4

 * 新增：原生支持 `Short` 作为列的 Java 类型。
 * 新增：在生成的映射器和工厂方法上添加了 Javadoc。
 * 已修复：`group_concat` 和 `nullif` 函数具有正确的为 null 性。
 * 已修复：与 Android Studio 2.2-alpha 的兼容性。
 * 已修复：`WITH RECURSIVE` 不再导致插件崩溃。

## [0.4.3] - 2016-07-07
[0.4.3]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.3

 * 新增：编译错误链接到源文件。
 * 新增：右键点击可将 SQLDelight 代码复制为有效的 SQLite。
 * 新增：命名语句上的 Javadoc 将出现在生成的字符串上。
 * 已修复：生成的视图模型包含为 null 性注解。
 * 已修复：联合生成的代码具有正确的类型和为 null 性，以支持所有可能的列。
 * 已修复：`sum` 和 `round` SQLite 函数在生成的代码中具有正确的类型。
 * 已修复：`CAST`、内部选择的错误修复。
 * 已修复：`CREATE TABLE` 语句中的自动补全。
 * 已修复：SQLite 关键字可以用于软件包中。

## [0.4.2] - 2016-06-16
[0.4.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.2

 * 新增：Marshal 可以从工厂创建。
 * 已修复：IntelliJ 插件生成的工厂方法具有正确的泛型顺序。
 * 已修复：函数名称可以使用任何大小写。

## [0.4.1] - 2016-06-14
[0.4.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.1

 * 已修复：IntelliJ 插件生成的类具有正确的泛型顺序。
 * 已修复：列定义可以使用任何大小写。

## [0.4.0] - 2016-06-14
[0.4.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.4.0

 * 新增：映射器按查询生成，而非按表生成。
 * 新增：Java 类型可以导入 .sq 文件。
 * 新增：SQLite 函数进行验证。
 * 已修复：移除了重复的错误。
 * 已修复：大写列名和 Java 关键字列名不会报错。

## [0.3.2] - 2016-05-14
[0.3.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.2

 * 新增：自动补全和查找用例现在适用于视图和别名。
 * 已修复：编译时验证现在允许在 `SELECT` 中使用函数。
 * 已修复：支持仅声明默认值的插入语句。
 * 已修复：插件不再崩溃当一个不使用 SQLDelight 的项目被导入时。

## [0.3.1] - 2016-04-27
[0.3.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.1

  * 已修复：接口可见性改回 `public`，以避免方法引用引起的非法访问运行时异常。
  * 已修复：子表达式被正确评估。

## [0.3.0] - 2016-04-26
[0.3.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.3.0

  * 新增：列定义使用 SQLite 类型，并可以有额外的 'AS' 约束以指定 Java 类型。
  * 新增：可以从 IDE 发送错误报告。
  * 已修复：自动补全功能正常运行。
  * 已修复：SQLDelight 模型文件在编辑 .sq 文件时更新。
  * 移除：不再支持附加的数据库。

## [0.2.2] - 2016-03-07
[0.2.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.2

 * 新增：对 `INSERT`、`UPDATE`、`DELETE`、`INDEX` 和 `TRIGGER` 语句所用列的编译时验证。
 * 已修复：在文件移动/创建时 IDE 插件不崩溃。

## [0.2.1] - 2016-03-07
[0.2.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.1

 * 新增：Ctrl+`/` (macOS 上为 Cmd+`/`) 切换所选行的注释。
 * 新增：对 SQL 查询所用列的编译时验证。
 * 已修复：支持 IDE 和 Gradle 插件中的 Windows 路径。

## [0.2.0] - 2016-02-29
[0.2.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.2.0

 * 新增：向 `Marshal` 类添加了复制构造函数。
 * 新增：更新至 Kotlin 1.0 正式版。
 * 已修复：以非失败方式报告 'sqldelight' 文件夹结构问题。
 * 已修复：禁止列名为 `table_name`。它们生成的常量会与表名常量冲突。
 * 已修复：确保 IDE 插件立即生成模型类，无论是否打开了 `.sq` 文件。
 * 已修复：支持 IDE 和 Gradle 插件中的 Windows 路径。

## [0.1.2] - 2016-02-13
[0.1.2]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.2

 * 已修复：移除了阻止 Gradle 插件在大多数项目中使用的代码。
 * 已修复：添加了缺失的编译器对 Antlr 运行时的依赖。

## [0.1.1] - 2016-02-12
[0.1.1]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.1

 * 已修复：确保 Gradle 插件指向与其自身版本相同的运行时版本。

## [0.1.0] - 2016-02-12
[0.1.0]: https://github.com/sqldelight/sqldelight/releases/tag/0.1.0

初始版本发布。