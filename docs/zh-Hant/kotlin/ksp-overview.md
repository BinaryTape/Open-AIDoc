[//]: # (title: Kotlin Symbol Processing API)

Kotlin Symbol Processing (KSP) 是一款適用於 Kotlin 的原始碼產生架構。透過 KSP API，您可以建立檢查原始碼靜態資訊並從中產生新程式碼的處理器。最常見的使用案例是根據[註解](annotations.md)來產生程式碼。

KSP 旨在簡化輕量級編譯器外掛程式的建立。使用 KSP 建置的編譯器外掛程式稱為符號處理器，簡稱處理器。KSP 定義良好的 API 隱藏了編譯器的變更，因此您無需投入大量精力維護處理器。然而，這種方法也存在權衡。例如，基於 KSP 的處理器無法檢查運算式或陳述式，且無法修改原始碼。

基於 KSP 的外掛程式典型使用案例包括： 
* 相依注入 ([Dagger](https://dagger.dev/dev-guide/ksp))
* 序列化 ([Moshi](https://github.com/square/moshi))
* 資料庫管理 ([Room](https://developer.android.com/jetpack/androidx/releases/room#2.3.0-beta02))

若要了解如何建立您的第一個基於 KSP 的處理器，請參閱 [KSP 入門](ksp-quickstart.md)。

## 需求 {id="requirements"}

最新 KSP 版本 %kspVersion% 支援以下相依性版本：

| 相依性 | 最低與最高版本 |
| ------------------------------  | ------------------------------------------------------ |
| Kotlin Gradle 外掛程式 (KGP) | 2.2.10–2.3.x |
| Android Gradle 外掛程式 (AGP) | 8.12.0 或更高版本 |
| Gradle | 8.13 或更高版本。對於 AGP 9.0 或更高版本，請使用 Gradle 9.x。 |
| JDK | 17 或更高版本 |

## KSP 在編譯過程中的運作方式 {id="how-ksp-works-during-compilation"}

KSP 根據 [Kotlin 語法](https://kotlinlang.org/grammar/)將 Kotlin 原始碼表示為符號階層結構。處理器使用這些符號來檢查宣告，例如類別、函式、屬性以及型別。

> KSP 對宣告與型別資訊進行建模，但不允許處理器存取運算式或函式主體。
{style="note"}

KSP 融入編譯流程的方式如下：

1. KSP 處理器分析原始碼與資源。

2. 處理器產生原始程式檔或其他輸出。

3. Kotlin 編譯器將原始程式碼與產生的程式碼一起編譯。

若要深入了解 KSP，請觀看此影片：

<video src="https://www.youtube.com/v/bv-VyGM3HCY" title="Kotlin Symbol Processing (KSP)"/>

## KSP 如何看待原始檔案 {id="how-ksp-looks-at-source-files"}

大多數處理器會遍歷輸入原始碼的各種程式結構。在深入了解 API 的用法之前，讓我們先看看從 KSP 的角度來看，一個檔案可能呈現的樣子：

```text
KSFile
  packageName: KSName
  fileName: String
  annotations: List<KSAnnotation>  (File annotations)
  declarations: List<KSDeclaration>
    KSClassDeclaration // class, interface, object
      simpleName: KSName
      qualifiedName: KSName
      containingFile: String
      typeParameters: KSTypeParameter
      parentDeclaration: KSDeclaration
      classKind: ClassKind
      primaryConstructor: KSFunctionDeclaration
      superTypes: List<KSTypeReference>
      // contains inner classes, member functions, properties, etc.
      declarations: List<KSDeclaration>
    KSFunctionDeclaration // top level function
      simpleName: KSName
      qualifiedName: KSName
      containingFile: String
      typeParameters: KSTypeParameter
      parentDeclaration: KSDeclaration
      functionKind: FunctionKind
      extensionReceiver: KSTypeReference?
      returnType: KSTypeReference
      parameters: List<KSValueParameter>
      // contains local classes, local functions, local variables, etc.
      declarations: List<KSDeclaration>
    KSPropertyDeclaration // global variable
      simpleName: KSName
      qualifiedName: KSName
      containingFile: String
      typeParameters: KSTypeParameter
      parentDeclaration: KSDeclaration
      extensionReceiver: KSTypeReference?
      type: KSTypeReference
      getter: KSPropertyGetter
        returnType: KSTypeReference
      setter: KSPropertySetter
        parameter: KSValueParameter
```

此檢視列出了檔案中宣告的常見內容：類別、函式、屬性等等。

## KSP 如何執行處理器 {id="how-ksp-runs-a-processor"}

KSP 使用 `SymbolProcessorProvider` 的實作作為建立 `SymbolProcessor` 執行個體的入口點：

```kotlin
interface SymbolProcessorProvider {
    fun create(environment: SymbolProcessorEnvironment): SymbolProcessor
}
```

`SymbolProcessor` 介面包含處理邏輯。KSP 呼叫 `process()` 函式並提供 `Resolver`，處理器可透過它來存取原始碼中的符號：

```kotlin
interface SymbolProcessor {
    fun process(resolver: Resolver): List<KSAnnotated>
    fun finish() {}
    fun onError() {}
}
```

有關如何實作和註冊處理器的逐步指南，請參閱 [KSP 入門](ksp-quickstart.md)。

## 支援的程式庫 {id="supported-libraries"}

下表列出了 Android 上熱門的程式庫及其對 KSP 的各個支援階段：

| 程式庫 | 狀態 |
|------------------|---------------------------------------------------------------------------------------------------|
| Room             | [官方支援](https://developer.android.com/jetpack/androidx/releases/room#2.3.0-beta02) |
| Moshi            | [官方支援](https://github.com/square/moshi/)                                          |
| RxHttp           | [官方支援](https://github.com/liujingxing/rxhttp)                                     |
| Kotshi           | [官方支援](https://github.com/ansman/kotshi)                                          |
| Lyricist         | [官方支援](https://github.com/adrielcafe/lyricist)                                    |
| Lich SavedState  | [官方支援](https://github.com/line/lich/tree/master/savedstate)                       |
| gRPC Dekorator   | [官方支援](https://github.com/mottljan/grpc-dekorator)                                |
| EasyAdapter      | [官方支援](https://github.com/AmrDeveloper/EasyAdapter)                               |
| Koin Annotations | [官方支援](https://github.com/InsertKoinIO/koin-annotations)                          |
| Glide            | [官方支援](https://github.com/bumptech/glide)                                         | 
| Micronaut        | [官方支援](https://micronaut.io/2023/07/14/micronaut-framework-4-0-0-released/)       |
| Epoxy            | [官方支援](https://github.com/airbnb/epoxy)                                           |
| Paris            | [官方支援](https://github.com/airbnb/paris)                                           |
| Auto Dagger      | [官方支援](https://github.com/ansman/auto-dagger)                                     |
| SealedX          | [官方支援](https://github.com/skydoves/sealedx)                                       |
| Ktorfit          | [官方支援](https://github.com/Foso/Ktorfit)                                           |
| Mockative        | [官方支援](https://github.com/mockative/mockative)                                    |
| Kotest           | [官方支援](https://github.com/kotest/kotest)                                          |
| DeeplinkDispatch | [透過 airbnb/DeepLinkDispatch#323 支援](https://github.com/airbnb/DeepLinkDispatch/pull/323)  |
| Dagger           | [Alpha](https://dagger.dev/dev-guide/ksp)                                                         |
| Motif            | [Alpha](https://github.com/uber/motif)                                                            |
| Hilt             | [進行中](https://dagger.dev/dev-guide/ksp)                                                   |
| Auto Factory     | [尚未支援](https://github.com/google/auto/issues/982)                                    |

## 其他資源 {id="other-resources"}

* [KSP 入門](ksp-quickstart.md)
* [範例](ksp-examples.md)
* [KSP 如何對 Kotlin 程式碼建模](ksp-additional-details.md)
* [Java 註解處理器作者參考指南](ksp-reference.md)
* [增量處理說明](ksp-incremental.md)
* [多輪處理說明](ksp-multi-round.md)
* [多平台專案中的 KSP](ksp-multiplatform.md)
* [從命令列執行 KSP](ksp-command-line.md)