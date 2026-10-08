[//]: # (title: 重定向)

默认情况下，Ktor 客户端会重定向到 `Location` 标头中提供的 URL。如有需要，您可以禁用重定向。

## 添加依赖项 {id="add_dependencies"}
`HttpRedirect` 仅需要 [ktor-client-core](client-dependencies.md) 构件，不需要任何特定的依赖项。

## 禁用重定向 {id="disable"}

要禁用重定向，请在 [客户端配置块](client-create-and-configure.md#configure-client) 中将 `followRedirects` 属性设置为 `false`：

```kotlin
val client = HttpClient(CIO) {
    followRedirects = false
}
```
