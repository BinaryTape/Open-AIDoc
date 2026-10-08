[//]: # (title: 重導向)

預設情況下，Ktor 用戶端會重導向至 `Location` 標頭中提供的 URL。如有需要，您可以停用重導向。

## 新增相依性 {id="add_dependencies"}
`HttpRedirect` 僅需要 [ktor-client-core](client-dependencies.md) 構件，不需要任何特定的相依性。

## 停用重導向 {id="disable"}

若要停用重導向，請在 [用戶端配置區塊](client-create-and-configure.md#configure-client) 中將 `followRedirects` 屬性設定為 `false`：

```kotlin
val client = HttpClient(CIO) {
    followRedirects = false
}
```
