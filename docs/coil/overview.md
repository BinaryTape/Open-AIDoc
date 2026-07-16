![Coil](coil_logo_colored.svg)

一个适用于 [Android](https://www.android.com/) 和 [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/) 的图片加载库。Coil 具有以下特点：

- **高效**：Coil 进行了多项优化，包括内存和磁盘缓存、图片向下采样、自动暂停/取消请求等。
- **轻量**：Coil 仅依赖于 Kotlin、协程 (Coroutine) 和 Okio，并能与 Google 的 R8 代码压缩器无缝协作。
- **易于使用**：Coil 的 API 利用了 Kotlin 的语言特性，以实现简洁和最少的模板代码 (boilerplate)。
- **现代**：Coil 坚持 Kotlin 优先，并可与包括 Compose、协程 (Coroutine)、Okio、OkHttp 和 Ktor 在内的现代库互操作。

Coil 是 **Co**routine **I**mage **L**oader（协程图片加载器）的首字母缩写。

翻译：[日本語](README-ja.md), [한국어](README-ko.md), [Русский](README-ru.md), [Svenska](README-sv.md), [Türkçe](README-tr.md), [中文](README-zh.md), [پارسی](README-fa.md), [O'zbekcha](README-uz.md)

## 快速入门

导入 Compose 库和一个 [网络库](https://coil-kt.github.io/coil/network/)：

```kotlin
implementation("io.coil-kt.coil3:coil-compose:3.4.0")
implementation("io.coil-kt.coil3:coil-network-okhttp:3.4.0")
```

要加载图片，请使用 `AsyncImage` 可组合项：

```kotlin
AsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = null,
)
```

在此处查看 Coil 的 [完整文档](https://coil-kt.github.io/coil/getting_started/)。

## 许可证

    Copyright 2025 Coil Contributors

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       https://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.