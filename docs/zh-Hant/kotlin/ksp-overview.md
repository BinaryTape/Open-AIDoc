[//]: # (title: Kotlin 符號處理 API)

Kotlin 符號處理（Kotlin Symbol Processing，簡稱 KSP）是適用於 Kotlin 的原始碼產生架構。透過 KSP API，你可以建立處理器來檢查原始碼的靜態資訊，並從中產生新的程式碼。最常見的使用案例是基於[註解](annotations.md)來產生程式碼。

KSP 旨在簡化輕量級編譯器外掛程式的建立。使用 KSP 建構的編譯器外掛程式稱為符號處理器（symbol processor），或簡稱處理器。KSP 定義完善的 API 隱藏了編譯器的變更，因此你不需要花費太多心力來維護處理器。然而，這種做法也有其權衡。例如，以 KSP 為基礎的處理器無法檢查運算式或陳述式，也無法修改原始碼。

以 KSP 為基礎的外掛程式之典型使用案例包括： 
* 相依注入 ([Dagger](https://dagger.dev/dev-guide/ksp))
* 序列化 ([Moshi](https://github.com/square/moshi))
* 資料庫管理 ([Room](https://developer.android.com/jetpack/androidx/releases/room#2.3.0-beta02))

若要了解如何建立你的第一個以 KSP 為基礎的處理器，請參閱 [KSP 入門](ksp-quickstart.md)。

## 需求 {id="requirements"}

最新的 KSP 版本 %kspVersion% 支援以下相依性版本：

| 相依性                          | 最低與最高版本                                         |
| ------------------------------  | ------------------------------------------------------ |
| Kotlin Gradle 外掛程式 (KGP)    | 2.2.10–2.3.x                                           |
| Android Gradle 外掛程式 (AGP)   | 8.12.0 或更新版本                                      |
| Gradle                          | 8.13 或更新版本。對於 AGP 9.0 或更新版本，請使用 Gradle 9.x。 |
| JDK                             | 17 或更新版本                                          |

## KSP 在編譯期間如何運作 {id="how-ksp-works-during-compilation"}

KSP 根據 [Kotlin 文法](https://kotlinlang.org/grammar/)將 Kotlin 原始碼表示為符號階層。處理器使用這些符號來檢查宣告，例如類別、函式、屬性以及型別。

> KSP 為宣告與型別資訊建立模型，但並未允許處理器存取運算式或函式主體。
{style="note"}

KSP 融入編譯流程的方式如下：

1. KSP 處理器分析原始碼與資源。

2. 處理器產生原始程式碼檔案或其他輸出。

3. Kotlin 編譯器將原始原始碼與產生的程式碼一起編譯。

若要進一步了解 KSP，請觀看這段影片：

<video src="https://www.youtube.com/v/bv-VyGM3HCY" title="Kotlin Symbol Processing (KSP)"/>

## KSP 如何執行處理器 {id="how-ksp-runs-a-processor"}

KSP 使用 `SymbolProcessorProvider` 的實作作為建立 `SymbolProcessor` 執行個體的入口點：

```kotlin
interface SymbolProcessorProvider {
    fun create(environment: SymbolProcessorEnvironment): SymbolProcessor
}
```

`SymbolProcessor` 介面包含處理邏輯。KSP 會呼叫 `process()` 函式並提供 `Resolver`，供處理器存取原始碼中的符號：

```kotlin
interface SymbolProcessor {
    fun process(resolver: Resolver): List<KSAnnotated>
    fun finish() {}
    fun onError() {}
}
```

有關如何實作和註冊處理器的逐步指南，請參閱 [KSP 入門](ksp-quickstart.md)。

## 支援的程式庫 {id="supported-libraries"}

下表列出 Android 上的熱門程式庫及其對 KSP 的各個支援階段：

| 程式庫           | 狀態                                                                                              |
|------------------|---------------------------------------------------------------------------------------------------|
| Room             | [官方支援](https://developer.android.com/jetpack/androidx/releases/room#2.3.0-beta02)           |
| Moshi            | [官方支援](https://github.com/square/moshi/)                                                    |
| RxHttp           | [官方支援](https://github.com/liujingxing/rxhttp)                                               |
| Kotshi           | [官方支援](https://github.com/ansman/kotshi)                                                    |
| Lyricist         | [官方支援](https://github.com/adrielcafe/lyricist)                                              |
| Lich SavedState  | [官方支援](https://github.com/line/lich/tree/master/savedstate)                                 |
| gRPC Dekorator   | [官方支援](https://github.com/mottljan/grpc-dekorator)                                          |
| EasyAdapter      | [官方支援](https://github.com/AmrDeveloper/EasyAdapter)                                         |
| Koin Annotations | [官方支援](https://github.com/InsertKoinIO/koin-annotations)                                    |
| Glide            | [官方支援](https://github.com/bumptech/glide)                                                   | 
| Micronaut        | [官方支援](https://micronaut.io/2023/07/14/micronaut-framework-4-0-0-released/)                 |
| Epoxy            | [官方支援](https://github.com/airbnb/epoxy)                                                     |
| Paris            | [官方支援](https://github.com/airbnb/paris)                                                     |
| Auto Dagger      | [官方支援](https://github.com/ansman/auto-dagger)                                               |
| SealedX          | [官方支援](https://github.com/skydoves/sealedx)                                                 |
| Ktorfit          | [官方支援](https://github.com/Foso/Ktorfit)                                                     |
| Mockative        | [官方支援](https://github.com/mockative/mockative)                                              |
| Kotest           | [官方支援](https://github.com/kotest/kotest)                                                    |
| DeeplinkDispatch | [透過 airbnb/DeepLinkDispatch#323 支援](https://github.com/airbnb/DeepLinkDispatch/pull/323)    |
| Dagger           | [Alpha](https://dagger.dev/dev-guide/ksp)                                                         |
| Motif            | [Alpha](https://github.com/uber/motif)                                                            |
| Hilt             | [進行中](https://dagger.dev/dev-guide/ksp)                                                       |
| Auto Factory     | [尚未支援](https://github.com/google/auto/issues/982)                                              |

## 其他資源 {id="other-resources"}

* [KSP 入門](ksp-quickstart.md)
* [KSP 如何為 Kotlin 程式碼建立模型](ksp-kotlin-model.md)
* [Java 註解處理器編寫者參考指南](ksp-reference.md)
* [增量處理說明](ksp-incremental.md)
* [多輪處理說明](ksp-multi-round.md)
* [多平台專案中的 KSP](ksp-multiplatform.md)
* [從命令列執行 KSP](ksp-command-line.md)