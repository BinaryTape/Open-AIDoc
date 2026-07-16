## カスタムカラム型

カラムをカスタム型として取得したい場合は、次のように Kotlin の型を指定できます：

```sql
import kotlin.String;
import kotlin.collections.List;

CREATE TABLE hockeyPlayer (
  cup_wins TEXT AS `List<String>` NOT NULL
);
```

ただし、`Database` を作成する際には、データベースの型とカスタム型をマッピングする方法を定義した `ColumnAdapter` を提供する必要があります：

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

## Enum

利便性のために、SQLDelight のランタイムには Enum を `String` データとして保存するための `ColumnAdapter` が含まれています。

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

## Value types

SQLDelight は、リクエストに応じて、基になるデータベースの型をラップする Value type（値型）をカラムに対して生成できます：

```sql
CREATE TABLE hockeyPlayer (
  id INT AS VALUE
);