[//]: # (title: Kotlin Symbol Processing API)

Kotlin Symbol Processing (KSP) 是一款適用於 Kotlin 的原始碼產生架構。透過 KSP API，您可以根據原始碼中的[註解](annotations.md)來建立產生程式碼的處理器。

KSP 旨在簡化輕量級編譯器外掛程式的開發。其定義良好的 API 隱藏了編譯器的變更，因此您無需投入大量精力維護處理器。然而，這種方法也存在權衡。例如，基於 KSP 的處理器無法檢查運算式或陳述式，且無法修改原始碼。

基於 KSP 的外掛程式典型使用案例包括： 
* 相依注入 ([Dagger](https://dagger.dev/dev-guide/ksp))
* 序列化 ([Moshi](https://github.com/square/moshi))
* 資料庫管理 ([Room](https://developer.android.com/jetpack/androidx/releases/room#2.3.0-beta02))

若要了解如何建立您的第一個基於 KSP 的處理器，請參閱 [KSP 快速入門指南](ksp-quickstart.md)。

## 總覽

KSP API 以慣用的方式處理 Kotlin 程式。KSP 了解 Kotlin 特有的特性，例如擴充函式、宣告處差異以及區域函式。它還對型別進行明確建模，並提供基本的型別檢查，例如等價性和指派相容性。

該 API 根據 [Kotlin 語法](https://kotlinlang.org/grammar/)在符號層級對 Kotlin 程式結構進行建模。當基於 KSP 的外掛程式處理原始程式時，處理器可以存取類別、類別成員、函式及其相關參數等結構，而 `if` 區塊和 `for` 迴圈等內容則無法存取。

從概念上講，KSP 類似於 Kotlin 反射中的 [KType](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-type/)。該 API 允許處理器從類別宣告導覽到具有特定型別引數的對應型別，反之亦然。您還可以替換型別引數、指定差異、套用星號投影並標記型別的可 null 性。

思考 KSP 的另一種方式是將其視為 Kotlin 程式的前置處理器架構。透過將基於 KSP 的外掛程式視為「符號處理器」或簡稱為「處理器」，編譯中的資料流可以透過以下步驟描述：

1. 處理器讀取並分析原始程式與資源。
2. 處理器產生程式碼或其他形式的輸出。
3. Kotlin 編譯器將原始程式與產生的程式碼一起編譯。

與成熟的編譯器外掛程式不同，處理器不能修改程式碼。改變語言語意的編譯器外掛程式有時會讓人感到非常困惑。KSP 透過將原始程式視為唯讀來避免這種情況。

您也可以透過此影片了解 KSP 的總覽：

<video src="https://www.youtube.com/v/bv-VyGM3HCY" title="Kotlin Symbol Processing (KSP)"/>

## KSP 如何看待原始檔案

大多數處理器會遍歷輸入原始碼的各種程式結構。在深入了解 API 的用法之前，讓我們看看從 KSP 的角度來看，一個檔案可能呈現的樣子：

```text
KSFile
  packageName: KSName
  fileName: String
  annotations: `List<KSAnnotation>`  (File annotations)
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

## SymbolProcessorProvider：入口點

KSP 需要實作 `SymbolProcessorProvider` 介面來具現化 `SymbolProcessor`：

```kotlin
interface SymbolProcessorProvider {
    fun create(environment: SymbolProcessorEnvironment): SymbolProcessor
}
```

而 `SymbolProcessor` 定義如下：

```kotlin
interface SymbolProcessor {
    fun process(resolver: Resolver): `List<KSAnnotated>` // Let's focus on this
    fun finish() {}
    fun onError() {}
}
```

`Resolver` 為 `SymbolProcessor` 提供了存取編譯器細節（例如符號）的能力。一個尋找所有頂層函式以及頂層類別中非區域函式的處理器可能如下所示：

```kotlin
class HelloFunctionFinderProcessor : SymbolProcessor() {
    // ...
    val functions = mutableListOf<KSFunctionDeclaration>()
    val visitor = FindFunctionsVisitor()

    override fun process(resolver: Resolver) {
        resolver.getAllFiles().forEach { it.accept(visitor, Unit) }
    }

    inner class FindFunctionsVisitor : KSVisitorVoid() {
        override fun visitClassDeclaration(classDeclaration: KSClassDeclaration, data: Unit) {
            classDeclaration.getDeclaredFunctions().forEach { it.accept(this, Unit) }
        }

        override fun visitFunctionDeclaration(function: KSFunctionDeclaration, data: Unit) {
            functions.add(function)
        }

        override fun visitFile(file: KSFile, data: Unit) {
            file.declarations.forEach { it.accept(this, Unit) }
        }
    }
    // ...
    
    class Provider : SymbolProcessorProvider {
        override fun create(environment: SymbolProcessorEnvironment): SymbolProcessor = TODO()
    }
}
```

## 資源

* [快速入門](ksp-quickstart.md)
* [為何使用 KSP？](ksp-why-ksp.md)
* [範例](ksp-examples.md)
* [KSP 如何對 Kotlin 程式碼建模](ksp-additional-details.md)
* [Java 註解處理器作者參考指南](ksp-reference.md)
* [增量處理說明](ksp-incremental.md)
* [多輪處理說明](ksp-multi-round.md)
* [多平台專案中的 KSP](ksp-multiplatform.md)
* [從命令列執行 KSP](https://github.com/google/ksp/blob/main/docs/ksp2cmdline.md)
* [常見問題](ksp-faq.md)

## 支援的程式庫

下表列出了 Android 上熱門的程式庫及其對 KSP 的支援階段：

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