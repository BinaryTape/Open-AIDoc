{% if multiplatform %}
## 原生 SQLite {id="native-sqlite"}
{% else %}
# 外鍵
{% endif %}

您可以透過在資料庫配置中啟用外鍵約束，來為原生 SQLite 驅動程式啟用此功能。

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
