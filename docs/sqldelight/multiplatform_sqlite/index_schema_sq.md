{% if not server %}## 定义架构{% endif %}

将 SQL 语句写入 `src/commonMain/sqldelight` 目录下的 `.sq` 文件中。
通常，`.sq` 文件中的第一条语句用于创建表，但您也可以创建索引或设置默认内容。

```sql title="src/commonMain/sqldelight/com/example/sqldelight/hockey/data/Player.sq"
CREATE TABLE hockeyPlayer (
  player_number INTEGER PRIMARY KEY NOT NULL,
  full_name TEXT NOT NULL
);

CREATE INDEX hockeyPlayer_full_name ON hockeyPlayer(full_name);

INSERT INTO hockeyPlayer (player_number, full_name)
VALUES (15, 'Ryan Getzlaf');
```
