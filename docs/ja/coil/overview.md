![Coil](/coil/coil_full_colored.svg)

[Android](https://www.android.com/) および [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/) のための画像読み込みライブラリです。Coil の特徴は以下の通りです：

- **高速**: Coil は、メモリとディスクのキャッシング、画像のダウンサンプリング、リクエストの自動一時停止/キャンセルなど、数多くの最適化を行います。
- **軽量**: Coil は Kotlin、Coroutines、Okio にのみ依存しており、Google の R8 コードシュリンカーとシームレスに動作します。
- **使いやすさ**: Coil の API は Kotlin の言語機能を活用しており、シンプルでボイラープレートを最小限に抑えています。
- **モダン**: Coil は Kotlin ファーストであり、Compose、Coroutines、Okio、OkHttp、Ktor などの最新のライブラリと相互運用可能です。

Coil は **Co**routine **I**mage **L**oader の略称です。

翻訳: [日本語](README-ja.md), [한국어](README-ko.md), [Русский](README-ru.md), [Svenska](README-sv.md), [Türkçe](README-tr.md), [中文](README-zh.md), [پارسی](README-fa.md), [O'zbekcha](README-uz.md)

## クイックスタート

Compose ライブラリと [ネットワークライブラリ](https://coil-kt.github.io/coil/network/) をインポートします：

```kotlin
implementation("io.coil-kt.coil3:coil-compose:3.5.0")
implementation("io.coil-kt.coil3:coil-network-okhttp:3.5.0")
```

画像を読み込むには、`AsyncImage` コンポーザブルを使用します：

```kotlin
AsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = null,
)
```

Coil の [詳細なドキュメントはこちら](https://coil-kt.github.io/coil/getting_started/) をご覧ください。

## ライセンス

    Copyright 2026 Coil Contributors

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       https://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
