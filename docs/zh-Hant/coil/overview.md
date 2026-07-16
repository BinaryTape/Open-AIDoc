![Coil](coil_logo_colored.svg)

專為 [Android](https://www.android.com/) 與 [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/) 設計的圖片載入程式庫。Coil 具有以下特點：

- **快速**：Coil 執行了多項最佳化，包括記憶體與磁碟快取、圖片降取樣、自動暫停／取消請求等。
- **輕量級**：Coil 僅依賴 Kotlin、協同程式 (Coroutines) 與 Okio，並能與 Google 的 R8 程式碼縮減器無縫運作。
- **易於使用**：Coil 的 API 利用 Kotlin 的語言特性，力求簡單並減少樣板程式碼 (boilerplate)。
- **現代化**：Coil 以 Kotlin 優先，並能與 Compose、協同程式 (Coroutines)、Okio、OkHttp 及 Ktor 等現代化程式庫互通。

Coil 是 **Co**routine **I**mage **L**oader 的縮寫。

翻譯：[日本語](README-ja.md), [한국어](README-ko.md), [Русский](README-ru.md), [Svenska](README-sv.md), [Türkçe](README-tr.md), [中文](README-zh.md), [پارسی](README-fa.md), [O'zbekcha](README-uz.md)

## 快速入門

匯入 Compose 程式庫與一個 [網路程式庫](https://coil-kt.github.io/coil/network/)：

```kotlin
implementation("io.coil-kt.coil3:coil-compose:3.4.0")
implementation("io.coil-kt.coil3:coil-network-okhttp:3.4.0")
```

若要載入圖片，請使用 `AsyncImage` Composable：

```kotlin
AsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = null,
)
```

請在此查看 Coil 的 [完整文件](https://coil-kt.github.io/coil/getting_started/)。

## 授權

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