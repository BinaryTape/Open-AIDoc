[//]: # (title: 與 Java 的比較)

## Kotlin 解決的一些 Java 問題 {id="some-java-issues-addressed-in-kotlin"}

Kotlin 修正了 Java 所面臨的一系列問題：

* Null 參照受[型別系統控制](null-safety.md)。
* [無原始型別 (Raw types)](java-interop.md#java-generics-in-kotlin)
* Kotlin 中的陣列是[不變的 (invariant)](arrays.md)
* Kotlin 擁有真正的[函式型別](lambdas.md#function-types)，而非 Java 的 SAM 轉換
* 不使用萬用字元的[使用處型變 (Use-site variance)](generics.md#use-site-variance-type-projections)
* Kotlin 沒有受檢例外（Checked exceptions）[例外](exceptions.md)
* [唯讀和可變集合具有獨立的介面](collections-overview.md)
* Kotlin 為 [`Enum.values()` 提供了高效能且符合人體工程學的替代方案](enum-classes.md#find-enum-constants)

## Java 擁有但 Kotlin 沒有的特性 {id="what-java-has-that-kotlin-does-not"}

* [受檢例外](exceptions.md)
* 非類別的[基本型別 (Primitive types)](types-overview.md)。位元組碼會在可能的情況下使用基本型別，但它們並未明確提供給開發者使用。
* [Static 成員](classes.md)被替換為[伴生物件 (Companion objects)](object-declarations.md#companion-objects)、[頂層函式 (Top-level functions)](functions.md)、[擴充函式](extensions.md#extension-functions) 或 [@JvmStatic](java-to-kotlin-interop.md#static-methods)。
* [萬用字元型別 (Wildcard-types)](generics.md) 被替換為[宣告處型變 (Declaration-site variance)](generics.md#declaration-site-variance) 與[型別投影](generics.md#type-projections)。
* [三元運算子 `a ? b : c`](control-flow.md#if-expression) 被替換為 [if 運算式](control-flow.md#if-expression)。
* [Records](https://openjdk.org/jeps/395)
* package-private [可見性修飾詞 (Visibility modifier)](visibility-modifiers.md)

> Kotlin 沒有模式配對，但 [Kotlin 中的智慧轉型 (Smart casts)](typecasts.md#smart-casts) 提供了類似於 [Java 中的模式配對](https://openjdk.org/projects/amber/design-notes/patterns/pattern-matching-for-java) 的功能。
>
> 欲了解更多資訊，請觀看 [JetBrains 官方 Kotlin 頻道上的這部影片](https://www.youtube.com/watch?v=yJDoa42X-wQ)。
>
{style="note"}

## Kotlin 擁有但 Java 沒有的特性 {id="what-kotlin-has-that-java-does-not"}

* [Lambda 運算式](lambdas.md) + [內嵌函式 (Inline functions)](inline-functions.md) = 高效能的自訂控制結構
* [擴充函式](extensions.md)
* [Null 安全性](null-safety.md)
* [字串範本](strings.md)
* [屬性](properties.md)
* [主建構函式](classes.md)
* [一等委託 (First-class delegation)](delegation.md)
* [變數與屬性型別的型別推論](types-overview.md)（**Java 10**：[區域變數型別推論](https://openjdk.org/jeps/286)）
* [單例模式 (Singletons)](object-declarations.md)
* [宣告處型變與型別投影](generics.md)
* [區間運算式 (Range expressions)](ranges.md)
* [運算子多載](operator-overloading.md)
* [伴生物件 (Companion objects)](classes.md#companion-objects)
* [資料類別 (Data classes)](data-classes.md)
* [協同程式](coroutines-overview.md)
* [頂層函式](functions.md)
* [具有預設值的參數](functions.md#parameters-with-default-values)
* [具名參數](functions.md#named-arguments)
* [中綴函式 (Infix functions)](functions.md#infix-notation)
* [Expect 與 actual 宣告](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)
* [明確 API 模式 (Explicit API mode)](whatsnew14.md#explicit-api-mode-for-library-authors) 以及[對 API 暴露介面的更佳控制](opt-in-requirements.md)

> Java 沒有智慧轉型，但[模式配對](https://openjdk.org/projects/amber/design-notes/patterns/pattern-matching-for-java)提供了類似於 [Kotlin 中智慧轉型](typecasts.md#smart-casts) 的功能。
>
> 欲了解更多資訊，請觀看 [JetBrains 官方 Kotlin 頻道上的這部影片](https://www.youtube.com/watch?v=yJDoa42X-wQ)。
>
{style="note"}

## 後續步驟 {id="what-s-next"}

了解如何：
* 在 Java 與 Kotlin 中執行[字串的典型任務](java-to-kotlin-idioms-strings.md)。
* 在 Java 與 Kotlin 中執行[集合的典型任務](java-to-kotlin-collections-guide.md)。
* [在 Java 與 Kotlin 中處理可 null 性](java-to-kotlin-nullability-guide.md)。