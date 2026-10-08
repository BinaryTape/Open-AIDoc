{% if not server %}## 스키마 정의하기{% endif %}

src/commonMain/sqldelight 아래에 있는 `.sq` 파일에 SQL 문을 작성하세요.
일반적으로 `.sq` 파일의 첫 번째 문은 테이블을 생성하지만, 인덱스를 생성하거나 기본 콘텐츠를 설정할 수도 있습니다.

```sql title="src/commonMain/sqldelight/com/example/sqldelight/hockey/data/Player.sq"
CREATE TABLE hockeyPlayer (
  player_number INTEGER PRIMARY KEY NOT NULL,
  full_name TEXT NOT NULL
);

CREATE INDEX hockeyPlayer_full_name ON hockeyPlayer(full_name);

INSERT INTO hockeyPlayer (player_number, full_name)
VALUES (15, 'Ryan Getzlaf');
```
