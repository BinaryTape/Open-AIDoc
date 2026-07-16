![Coil](coil_logo_colored.svg)

[Android](https://www.android.com/) 및 [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/)을 위한 이미지 로딩 라이브러리입니다. Coil은 다음과 같은 특징이 있습니다:

- **빠름**: Coil은 메모리 및 디스크 캐싱, 이미지 다운샘플링(downsampling), 요청 자동 일시 중지/취소 등 다양한 최적화를 수행합니다.
- **가벼움**: Coil은 Kotlin, Coroutines, Okio에만 의존하며 Google의 R8 코드 축소기(code shrinker)와 원활하게 작동합니다.
- **사용하기 쉬움**: Coil의 API는 Kotlin의 언어 기능을 활용하여 단순하며 보일러플레이트(boilerplate)를 최소화합니다.
- **모던함**: Coil은 Kotlin 우선(Kotlin-first)이며 Compose, Coroutines, Okio, OkHttp, Ktor 등 최신 라이브러리와 상호 운용됩니다.

Coil은 **Co**routine **I**mage **L**oader의 약자입니다.

번역: [日本語](README-ja.md), [한국어](README-ko.md), [Русский](README-ru.md), [Svenska](README-sv.md), [Türkçe](README-tr.md), [中文](README-zh.md), [پارسی](README-fa.md), [O'zbekcha](README-uz.md)

## 빠른 시작 (Quick Start)

Compose 라이브러리와 [네트워킹 라이브러리](https://coil-kt.github.io/coil/network/)를 추가합니다:

```kotlin
implementation("io.coil-kt.coil3:coil-compose:3.4.0")
implementation("io.coil-kt.coil3:coil-network-okhttp:3.4.0")
```

이미지를 로드하려면 `AsyncImage` 컴포저블(composable)을 사용하세요:

```kotlin
AsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = null,
)
```

Coil의 [전체 문서는 여기에서 확인](https://coil-kt.github.io/coil/getting_started/)하세요.

## 라이선스 (License)

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