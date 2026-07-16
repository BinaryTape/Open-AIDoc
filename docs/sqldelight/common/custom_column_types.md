## 自定义列类型

如果您希望以自定义类型检索列，可以指定一个 Kotlin 类型：

```sql
import kotlin.String;
import kotlin.collections.List;

CREATE TABLE hockeyPlayer (
  cup_wins TEXT AS `List<String>` NOT NULL
);
```

然而，创建 `Database` 需要您提供一个 `ColumnAdapter`，它知道如何在数据库类型与您的自定义类型之间进行映射：

```kotlin
val listOfStringsAdapter = object : ColumnAdapter<List<String>, String> {
  override fun decode(databaseValue: String) =
    if (databaseValue.isEmpty()) {
      listOf()
    } else {
      databaseValue.split(",")
    }
  override fun encode(value: List<String>) = value.joinToString(separator = ",")
}

val queryWrapper: Database = Database(
  driver = driver,
  hockeyPlayerAdapter = hockeyPlayer.Adapter(
    cup_winsAdapter = listOfStringsAdapter
  )
)
```

## 枚举

为了方便起见，SQLDelight 运行时包含了一个 `ColumnAdapter`，用于将枚举作为字符串数据存储。

```sql
import com.example.hockey.HockeyPlayer;

CREATE TABLE hockeyPlayer (
  position TEXT AS HockeyPlayer.Position
)
```

```kotlin
val queryWrapper: Database = Database(
  driver = driver,
  hockeyPlayerAdapter = HockeyPlayer.Adapter(
    positionAdapter = EnumColumnAdapter()
  )
)
```

## 值类型

如果需要，SQLDelight 可以为列生成一个值类型，用于包装底层数据库类型：

```sql
CREATE TABLE hockeyPlayer (
  id INT AS VALUE
);