{% if multiplatform %}
## 原生 SQLite {id="native-sqlite"}
{% else %}
# 外键
{% endif %}

您可以通过在数据库配置中启用外键约束，来为原生 SQLite 驱动程序开启该功能。

```kotlin
NativeSqliteDriver(
  schema = Database.Schema,
  onConfiguration = { config: DatabaseConfiguration ->
    config.copy(
      extendedConfig = DatabaseConfiguration.Extended(foreignKeyConstraints = true)
    )
  }
)
```
