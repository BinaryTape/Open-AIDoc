[//]: # (title: Kotlin 語言特性與提案)

<web-summary>了解 Kotlin 特性的生命週期。此頁面包含 Kotlin 語言特性與設計提案的完整清單。</web-summary>

JetBrains 根據 [Kotlin 語言演進原則](kotlin-evolution-principles.md)，以實務設計為導向來發展 Kotlin 語言。

> 自 Kotlin 1.7.0 起列出語言特性提案。
> 
> 請參閱 [Kotlin 演進原則文件](kotlin-evolution-principles.md#pre-stable-features) 中關於語言特性狀態的說明。
> 
{style="note"}

<tabs>
<tab id="all-proposals" title="全部">

<!-- <include element-id="all-proposals" from="all-proposals.topic"/> -->

<snippet id="source">
<table style="header-column">

<!-- the first td element should have the width="200" attribute -->

<!-- EXPLORATION AND DESIGN BLOCK -->

<tr filter="exploration-and-design">
<td width="200">

**探索與設計**

</td>
<td>

**支援不可變性 (Support immutability)**

* KEEP 筆記：[immutability](https://github.com/Kotlin/KEEP/blob/master/notes/value-classes.md#immutability-and-value-classes)
* YouTrack 問題：[KT-77734](https://youtrack.jetbrains.com/issue/KT-77734)

</td>
</tr>

<!-- END OF EXPLORATION AND DESIGN BLOCK -->

<!-- KEEP DISCUSSION BLOCK -->

<tr filter="keep">
<td width="200">

**KEEP 討論**

</td>
<td>

**改進編譯期常數**

* KEEP 提案：[improve-compile-time-constants.md](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0444-improve-compile-time-constants.md)
* YouTrack 問題：[KT-22505](https://youtrack.jetbrains.com/issue/KT-22505)

</td>
</tr>

<tr filter="keep">
<td>

**KEEP 討論**

</td>
<td>

**`CoroutineContext` 作為上下文參數**

* KEEP 提案：[CoroutineContext-context-parameter.md](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0443-suspend-CoroutineContext-context-parameter.md)
* YouTrack 問題：[KT-15555](https://youtrack.jetbrains.com/issue/KT-15555)

</td>
</tr>

<tr filter="keep">
<td>

**KEEP 討論**

</td>
<td>

**豐富錯誤 (Rich Errors)：動機與原理**

* KEEP 提案：[rich-errors-motivation.md](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0441-rich-errors-motivation.md)
* YouTrack 問題：[KT-68296](https://youtrack.jetbrains.com/issue/KT-68296)

</td>
</tr>

<tr filter="keep">
<td>

**KEEP 討論**

</td>
<td>

**Kotlin static 與 static 擴充**

* KEEP 提案：[statics.md](https://github.com/Kotlin/KEEP/blob/static-scope/proposals/static-member-type-extension.md)
* YouTrack 問題：[KT-11968](https://youtrack.jetbrains.com/issue/KT-11968)

</td>
</tr>

<tr filter="keep">
<td>

**KEEP 討論**

</td>
<td>

**集合常值 (Collection literals)**

* KEEP 提案：[collection-literals.md](https://github.com/Kotlin/KEEP/blob/bobko/collection-literals/proposals/collection-literals.md)
* YouTrack 問題：[KT-43871](https://youtrack.jetbrains.com/issue/KT-43871)

</td>
</tr>

<tr filter="keep">
<td>

**KEEP 討論**

</td>
<td>

**版本多載 (Version overloading)**

* KEEP 提案：[version-overloading.md](https://github.com/Kotlin/KEEP/blob/version-overloading-proposal/proposals/version-overloading.md)

</td>
</tr>

<tr filter="keep">
<td>

**KEEP 討論**

</td>
<td>

**精簡 KDoc 歧義連結**

* KEEP 提案：[streamline-KDoc-ambiguity-references.md](https://github.com/Kotlin/KEEP/blob/kdoc/Streamline-KDoc-ambiguity-references/proposals/kdoc/streamline-KDoc-ambiguity-references.md)
* GitHub 問題：[dokka/#3451](https://github.com/Kotlin/dokka/issues/3451), [dokka/#3179](https://github.com/Kotlin/dokka/issues/3179), [dokka/#3334](https://github.com/Kotlin/dokka/issues/3334)

</td>
</tr>

<tr filter="keep">
<td>

**KEEP 討論**

</td>
<td>

**KDoc 中擴充連結的解析**

* KEEP 提案：[links-to-extensions.md](https://github.com/Kotlin/KEEP/blob/kdoc/extension-links/proposals/kdoc/links-to-extensions.md)
* GitHub 問題：[dokka/#3555](https://github.com/Kotlin/dokka/issues/3555)

</td>
</tr>

<!-- END OF KEEP DISCUSSION BLOCK -->

<!-- IN PREVIEW BLOCK -->

<tr filter="in-preview">
<td width="200">

**預覽中**

</td>
<td>

**基於名稱的解構 (Name-based destructuring)**

* KEEP 提案：[name-based-destructuring.md](https://github.com/Kotlin/KEEP/blob/name-based-destructuring/proposals/name-based-destructuring.md)
* YouTrack 問題：[KT-19627](https://youtrack.jetbrains.com/issue/KT-19627)
* 穩定性級別：[實驗性](components-stability.md#stability-levels-explained)
* 自該版本起可用：2.3.20

</td>
</tr>

<tr filter="in-preview">
<td width="200">

**預覽中**

</td>
<td>

**明確支援欄位 (Explicit backing fields)**

* KEEP 提案：[explicit-backing-fields.md](https://github.com/Kotlin/KEEP/blob/explicit-backing-fields/proposals/explicit-backing-fields.md)
* YouTrack 問題：[KT-14663](https://youtrack.jetbrains.com/issue/KT-14663)
* 穩定性級別：[實驗性](components-stability.md#stability-levels-explained)
* 自該版本起可用：2.3.0

</td>
</tr>

<tr filter="in-preview">
<td>

**預覽中**

</td>
<td>

**上下文參數 (Context parameters)：支援上下文相關宣告**

* KEEP 提案：[context-parameters.md](https://github.com/Kotlin/KEEP/blob/context-parameters/proposals/context-parameters.md)
* YouTrack 問題：[KT-10468](https://youtrack.jetbrains.com/issue/KT-10468)
* 穩定性級別：[實驗性](components-stability.md#stability-levels-explained)
* 自該版本起可用：2.2.0

</td>
</tr>

<tr filter="in-preview">
<td>

**預覽中**

</td>
<td>

**未使用的傳回值檢查器**

* KEEP 提案：[unused-return-value-checker.md](https://github.com/Kotlin/KEEP/blob/underscore-for-unused-local/proposals/unused-return-value-checker.md)
* YouTrack 問題：[KT-12719](https://youtrack.jetbrains.com/issue/KT-12719)
* 穩定性級別：[實驗性](components-stability.md#stability-levels-explained)
* 自該版本起可用：2.3.0

</td>
</tr>

<tr filter="in-preview">
<td>

**預覽中**

</td>
<td>

**屬性上註解使用處目標 (use-site targets) 的改進**

* KEEP 提案：[Improvements to annotation use-site targets on properties](https://github.com/Kotlin/KEEP/blob/master/proposals/annotation-target-in-properties.md)
* YouTrack 問題：[KT-73255](https://youtrack.jetbrains.com/issue/KT-73255)
* 穩定性級別：[實驗性](components-stability.md#stability-levels-explained)
* 自該版本起可用：2.2.0

</td>
</tr>

<tr filter="in-preview">
<td>

**預覽中**

</td>
<td>

**上下文相關解析 (Context-sensitive resolution)**

* KEEP 提案：[context-sensitive-resolution.md](https://github.com/Kotlin/KEEP/blob/improved-resolution-expected-type/proposals/context-sensitive-resolution.md)
* YouTrack 問題：[KT-16768](https://youtrack.jetbrains.com/issue/KT-16768)
* 穩定性級別：[實驗性](components-stability.md#stability-levels-explained)
* 自該版本起可用：2.2.0

</td>
</tr>

<tr filter="in-preview">
<td>

**預覽中**

</td>
<td>

**在 JVM 中公開裝箱的行內值類別**

* KEEP 提案：[jvm-expose-boxed.md](https://github.com/Kotlin/KEEP/blob/jvm-expose-boxed/proposals/jvm-expose-boxed.md)
* YouTrack 問題：[KT-28135](https://youtrack.jetbrains.com/issue/KT-28135)
* 穩定性級別：[實驗性](components-stability.md#stability-levels-explained)
* 自該版本起可用：2.2.0

</td>
</tr>

<tr filter="in-preview">
<td>

**預覽中**

</td>
<td>

**Uuid**

* KEEP 提案：[uuid.md](https://github.com/Kotlin/KEEP/blob/uuid/proposals/stdlib/uuid.md)
* YouTrack 問題：[KT-31880](https://youtrack.jetbrains.com/issue/KT-31880)
* 穩定性級別：[實驗性](components-stability.md#stability-levels-explained)
* 自該版本起可用：2.0.20

</td>
</tr>

<tr filter="in-preview">
<td>

**預覽中**

</td>
<td>

**通用不可分割量 (Common Atomics) 與不可分割陣列 (Atomic Arrays)**

* KEEP 提案：[Common atomics](https://github.com/Kotlin/KEEP/blob/master/proposals/stdlib/common-atomics.md)
* YouTrack 問題：[KT-62423](https://youtrack.jetbrains.com/issue/KT-62423)
* 穩定性級別：[實驗性](components-stability.md#stability-levels-explained)
* 自該版本起可用：2.2.0

</td>
</tr>

<tr filter="in-preview">
<td>

**預覽中**

</td>
<td>

**KMP Kotlin-to-Java 直接實例化 (direct actualization)**

* KEEP 提案：[kmp-kotlin-to-java-direct-actualization.md](https://github.com/Kotlin/KEEP/blob/kotlin-to-java-direct-actualization/proposals/kmp-kotlin-to-java-direct-actualization.md)
* YouTrack 問題：[KT-67202](https://youtrack.jetbrains.com/issue/KT-67202)
* 穩定性級別：[實驗性](components-stability.md#stability-levels-explained)
* 自該版本起可用：2.1.0

</td>
</tr>

<!-- END OF IN PREVIEW BLOCK -->

<!-- STABLE BLOCK -->

<tr filter="stable">
<td width="200">

**穩定**

</td>
<td>

**基於資料流的窮舉性檢查 (Data flow-based exhaustiveness checking)**

* KEEP 提案：[dfa-exhaustiveness.md](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0442-dfa-exhaustiveness.md)
* YouTrack 問題：[KT-8781](https://youtrack.jetbrains.com/issue/KT-8781)
* 自該版本起可用：2.2.20，自 2.3.0 起穩定

</td>
</tr>

<tr filter="stable">
<td>

**穩定**

</td>
<td>

**巢狀（非擷取）型別別名 (Nested (non-capturing) type aliases)**

* KEEP 提案：[Nested (non-capturing) type aliases](https://github.com/Kotlin/KEEP/blob/master/proposals/nested-typealias.md)
* YouTrack 問題：[KT-45285](https://youtrack.jetbrains.com/issue/KT-45285)
* 自該版本起可用：2.2.0，自 2.3.0 起穩定

</td>
</tr>

<tr filter="stable">
<td>

**穩定**

</td>
<td>

**kotlin.time.Instant**

* KEEP 提案：[Instant and Clock](https://github.com/Kotlin/KEEP/blob/master/proposals/stdlib/instant.md)
* YouTrack 問題：[KT-80778](https://youtrack.jetbrains.com/issue/KT-80778)
* 自該版本起可用：2.1.0，自 2.3.0 起穩定

</td>
</tr>

<tr filter="stable">
<td>

**穩定**

</td>
<td>

**when-with-subject 中的防護條件 (Guard conditions)**

* KEEP 提案：[guards.md](https://github.com/Kotlin/KEEP/blob/guards/proposals/guards.md)
* YouTrack 問題：[KT-13626](https://youtrack.jetbrains.com/issue/KT-13626)
* 自該版本起可用：2.2.0

</td>
</tr>

<tr filter="stable">
<td>

**穩定**

</td>
<td>

**多錢符號插值：改進字串常值中 $ 的處理**

* KEEP 提案：[dollar-escape.md](https://github.com/Kotlin/KEEP/blob/master/proposals/dollar-escape.md)
* YouTrack 問題：[KT-2425](https://youtrack.jetbrains.com/issue/KT-2425)
* 自該版本起可用：2.2.0

</td>
</tr>

<tr filter="stable">
<td>

**穩定**

</td>
<td>

**非區域 (Non-local) `break` 與 `continue`**

* KEEP 提案：[break-continue-in-inline-lambdas.md](https://github.com/Kotlin/KEEP/blob/master/proposals/break-continue-in-inline-lambdas.md)
* YouTrack 問題：[KT-1436](https://youtrack.jetbrains.com/issue/KT-1436)
* 自該版本起可用：2.2.0

</td>
</tr>

<tr filter="stable">
<td>

**穩定**

</td>
<td>

**穩定的 `@SubclassOptInRequired`**

* KEEP 提案：[subclass-opt-in-required.md](https://github.com/Kotlin/KEEP/blob/master/proposals/subclass-opt-in-required.md)
* YouTrack 問題：[KT-54617](https://youtrack.jetbrains.com/issue/KT-54617)
* 自該版本起可用：2.1.0

</td>
</tr>

<tr filter="stable">
<td width="200">

**穩定**

</td>
<td>

**`Enum.entries`：`Enum.values()` 的高效能替代方案**

* KEEP 提案：[enum-entries.md](https://github.com/Kotlin/KEEP/blob/master/proposals/enum-entries.md)
* YouTrack 問題：[KT-48872](https://youtrack.jetbrains.com/issue/KT-48872)
* 自該版本起可用：2.0.0

</td>
</tr>

<tr filter="stable">
<td>

**穩定**

</td>
<td>

**資料物件 (Data objects)**

* KEEP 提案：[data-objects.md](https://github.com/Kotlin/KEEP/blob/master/proposals/data-objects.md)
* YouTrack 問題：[KT-4107](https://youtrack.jetbrains.com/issue/KT-4107)
* 自該版本起可用：1.9.0

</td>
</tr>

<tr filter="stable">
<td>

**穩定**

</td>
<td>

**RangeUntil 運算子 `..<`**

* KEEP 提案：[open-ended-ranges.md](https://github.com/kotlin/KEEP/blob/open-ended-ranges/proposals/open-ended-ranges.md)
* YouTrack 問題：[KT-15613](https://youtrack.jetbrains.com/issue/KT-15613)
* 自該版本起可用：1.7.20

</td>
</tr>

<tr filter="stable">
<td>

**穩定**

</td>
<td>

**絕對不可為 null 型別 (Definitely non-nullable types)**

* KEEP 提案：[definitely-non-nullable-types.md](https://github.com/Kotlin/KEEP/blob/master/proposals/definitely-non-nullable-types.md)
* YouTrack 問題：[KT-26245](https://youtrack.jetbrains.com/issue/KT-26245)
* 自該版本起可用：1.7.0

</td>
</tr>

<!-- END OF STABLE BLOCK -->

<!-- REVOKED BLOCK -->

<tr filter="revoked">
<td width="200">

**已撤銷**

</td>
<td>

**上下文接收器 (Context receivers)**

* KEEP 提案：[context-receivers.md](https://github.com/Kotlin/KEEP/blob/master/proposals/context-receivers.md)
* YouTrack 問題：[KT-10468](https://youtrack.jetbrains.com/issue/KT-10468)
* 替換為 [context-parameters.md](https://github.com/Kotlin/KEEP/blob/context-parameters/proposals/context-parameters.md)

</td>
</tr>

<tr filter="revoked">
<td>

**已撤銷**

</td>
<td>

**Java 合成屬性參照 (Java synthetic property references)**

* KEEP 提案：[references-to-java-synthetic-properties.md](https://github.com/Kotlin/KEEP/blob/master/proposals/references-to-java-synthetic-properties.md)
* YouTrack 問題：[KT-8575](https://youtrack.jetbrains.com/issue/KT-8575)

</td>
</tr>

</table>
</snippet>

<!-- END OF REVOKED BLOCK -->

</tab>

<tab id="exploration-and-design" title="探索與設計">

<table>
<tr filter="exploration-and-design">
<td width="200">

**探索與設計**

</td>
<td>

**支援不可變性 (Support immutability)**

* KEEP 筆記：[immutability](https://github.com/Kotlin/KEEP/blob/master/notes/value-classes.md#immutability-and-value-classes)
* YouTrack 問題：[KT-77734](https://youtrack.jetbrains.com/issue/KT-77734)

</td>
</tr>
</table>

</tab>

<tab id="keep-preparation" title="KEEP 討論">

<table>
<tr filter="keep">
<td width="200">

**KEEP 討論**

</td>
<td>

**改進編譯期常數**

* KEEP 提案：[improve-compile-time-constants.md](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0444-improve-compile-time-constants.md)
* YouTrack 問題：[KT-22505](https://youtrack.jetbrains.com/issue/KT-22505)

</td>
</tr>

<tr filter="keep">
<td>

**KEEP 討論**

</td>
<td>

**`CoroutineContext` 作為上下文參數**

* KEEP 提案：[CoroutineContext-context-parameter.md](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0443-suspend-CoroutineContext-context-parameter.md)
* YouTrack 問題：[KT-15555](https://youtrack.jetbrains.com/issue/KT-15555)

</td>
</tr>

<tr filter="keep">
<td>

**KEEP 討論**

</td>
<td>

**豐富錯誤 (Rich Errors)：動機與原理**

* KEEP 提案：[rich-errors-motivation.md](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0441-rich-errors-motivation.md)
* YouTrack 問題：[KT-68296](https://youtrack.jetbrains.com/issue/KT-68296)

</td>
</tr>

<tr filter="keep">
<td>

**KEEP 討論**

</td>
<td>

**Kotlin static 與 static 擴充**

* KEEP 提案：[statics.md](https://github.com/Kotlin/KEEP/blob/static-scope/proposals/static-member-type-extension.md)
* YouTrack 問題：[KT-11968](https://youtrack.jetbrains.com/issue/KT-11968)

</td>
</tr>

<tr filter="keep">
<td>

**KEEP 討論**

</td>
<td>

**集合常值 (Collection literals)**

* KEEP 提案：[collection-literals.md](https://github.com/Kotlin/KEEP/blob/bobko/collection-literals/proposals/collection-literals.md)
* YouTrack 問題：[KT-43871](https://youtrack.jetbrains.com/issue/KT-43871)

</td>
</tr>

<tr filter="keep">
<td>

**KEEP 討論**

</td>
<td>

**版本多載 (Version overloading)**

* KEEP 提案：[version-overloading.md](https://github.com/Kotlin/KEEP/blob/version-overloading-proposal/proposals/version-overloading.md)

</td>
</tr>

<tr filter="keep">
<td>

**KEEP 討論**

</td>
<td>

**精簡 KDoc 歧義連結**

* KEEP 提案：[streamline-KDoc-ambiguity-references.md](https://github.com/Kotlin/KEEP/blob/kdoc/Streamline-KDoc-ambiguity-references/proposals/kdoc/streamline-KDoc-ambiguity-references.md)
* GitHub 問題：[dokka/#3451](https://github.com/Kotlin/dokka/issues/3451), [dokka/#3179](https://github.com/Kotlin/dokka/issues/3179), [dokka/#3334](https://github.com/Kotlin/dokka/issues/3334)

</td>
</tr>

<tr filter="keep">
<td>

**KEEP 討論**

</td>
<td>

**KDoc 中擴充連結的解析**

* KEEP 提案：[links-to-extensions.md](https://github.com/Kotlin/KEEP/blob/kdoc/extension-links/proposals/kdoc/links-to-extensions.md)
* GitHub 問題：[dokka/#3555](https://github.com/Kotlin/dokka/issues/3555)

</td>
</tr>
</table>

</tab>

<tab id="in-preview" title="預覽中">

<table>
<tr filter="in-preview">
<td width="200">

**預覽中**

</td>
<td>

**基於名稱的解構 (Name-based destructuring)**

* KEEP 提案：[name-based-destructuring.md](https://github.com/Kotlin/KEEP/blob/name-based-destructuring/proposals/name-based-destructuring.md)
* YouTrack 問題：[KT-19627](https://youtrack.jetbrains.com/issue/KT-19627)
* 穩定性級別：[實驗性](components-stability.md#stability-levels-explained)
* 自該版本起可用：2.3.20

</td>
</tr>

<tr filter="in-preview">
<td width="200">

**預覽中**

</td>
<td>

**明確支援欄位 (Explicit backing fields)**

* KEEP 提案：[explicit-backing-fields.md](https://github.com/Kotlin/KEEP/blob/explicit-backing-fields/proposals/explicit-backing-fields.md)
* YouTrack 問題：[KT-14663](https://youtrack.jetbrains.com/issue/KT-14663)
* 穩定性級別：[實驗性](components-stability.md#stability-levels-explained)
* 自該版本起可用：2.3.0

</td>
</tr>

<tr filter="in-preview">
<td>

**預覽中**

</td>
<td>

**上下文參數 (Context parameters)：支援上下文相關宣告**

* KEEP 提案：[context-parameters.md](https://github.com/Kotlin/KEEP/blob/context-parameters/proposals/context-parameters.md)
* YouTrack 問題：[KT-10468](https://youtrack.jetbrains.com/issue/KT-10468)
* 穩定性級別：[實驗性](components-stability.md#stability-levels-explained)
* 自該版本起可用：2.2.0

</td>
</tr>

<tr filter="in-preview">
<td>

**預覽中**

</td>
<td>

**未使用的傳回值檢查器**

* KEEP 提案：[unused-return-value-checker.md](https://github.com/Kotlin/KEEP/blob/underscore-for-unused-local/proposals/unused-return-value-checker.md)
* YouTrack 問題：[KT-12719](https://youtrack.jetbrains.com/issue/KT-12719)
* 穩定性級別：[實驗性](components-stability.md#stability-levels-explained)
* 自該版本起可用：2.3.0

</td>
</tr>

<tr filter="in-preview">
<td>

**預覽中**

</td>
<td>

**屬性上註解使用處目標 (use-site targets) 的改進**

* KEEP 提案：[Improvements to annotation use-site targets on properties](https://github.com/Kotlin/KEEP/blob/master/proposals/annotation-target-in-properties.md)
* YouTrack 問題：[KT-73255](https://youtrack.jetbrains.com/issue/KT-73255)
* 穩定性級別：[實驗性](components-stability.md#stability-levels-explained)
* 自該版本起可用：2.2.0

</td>
</tr>

<tr filter="in-preview">
<td>

**預覽中**

</td>
<td>

**上下文相關解析 (Context-sensitive resolution)**

* KEEP 提案：[context-sensitive-resolution.md](https://github.com/Kotlin/KEEP/blob/improved-resolution-expected-type/proposals/context-sensitive-resolution.md)
* YouTrack 問題：[KT-16768](https://youtrack.jetbrains.com/issue/KT-16768)
* 穩定性級別：[實驗性](components-stability.md#stability-levels-explained)
* 自該版本起可用：2.2.0

</td>
</tr>

<tr filter="in-preview">
<td>

**預覽中**

</td>
<td>

**在 JVM 中公開裝箱的行內值類別**

* KEEP 提案：[jvm-expose-boxed.md](https://github.com/Kotlin/KEEP/blob/jvm-expose-boxed/proposals/jvm-expose-boxed.md)
* YouTrack 問題：[KT-28135](https://youtrack.jetbrains.com/issue/KT-28135)
* 穩定性級別：[實驗性](components-stability.md#stability-levels-explained)
* 自該版本起可用：2.2.0

</td>
</tr>

<tr filter="in-preview">
<td>

**預覽中**

</td>
<td>

**Uuid**

* KEEP 提案：[uuid.md](https://github.com/Kotlin/KEEP/blob/uuid/proposals/stdlib/uuid.md)
* YouTrack 問題：[KT-31880](https://youtrack.jetbrains.com/issue/KT-31880)
* 穩定性級別：[實驗性](components-stability.md#stability-levels-explained)
* 自該版本起可用：2.0.20

</td>
</tr>

<tr filter="in-preview">
<td>

**預覽中**

</td>
<td>

**通用不可分割量 (Common Atomics) 與不可分割陣列 (Atomic Arrays)**

* KEEP 提案：[Common atomics](https://github.com/Kotlin/KEEP/blob/master/proposals/stdlib/common-atomics.md)
* YouTrack 問題：[KT-62423](https://youtrack.jetbrains.com/issue/KT-62423)
* 穩定性級別：[實驗性](components-stability.md#stability-levels-explained)
* 自該版本起可用：2.2.0

</td>
</tr>

<tr filter="in-preview">
<td>

**預覽中**

</td>
<td>

**KMP Kotlin-to-Java 直接實例化 (direct actualization)**

* KEEP 提案：[kmp-kotlin-to-java-direct-actualization.md](https://github.com/Kotlin/KEEP/blob/kotlin-to-java-direct-actualization/proposals/kmp-kotlin-to-java-direct-actualization.md)
* YouTrack 問題：[KT-67202](https://youtrack.jetbrains.com/issue/KT-67202)
* 穩定性級別：[實驗性](components-stability.md#stability-levels-explained)
* 自該版本起可用：2.1.0

</td>
</tr>
</table>

</tab>

<tab id="stable" title="穩定">

<table>
<tr filter="stable">
<td width="200">

**穩定**

</td>
<td>

**基於資料流的窮舉性檢查 (Data flow-based exhaustiveness checking)**

* KEEP 提案：[dfa-exhaustiveness.md](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0442-dfa-exhaustiveness.md)
* YouTrack 問題：[KT-8781](https://youtrack.jetbrains.com/issue/KT-8781)
* 自該版本起可用：2.2.20，自 2.3.0 起穩定

</td>
</tr>

<tr filter="stable">
<td>

**穩定**

</td>
<td>

**巢狀（非擷取）型別別名 (Nested (non-capturing) type aliases)**

* KEEP 提案：[Nested (non-capturing) type aliases](https://github.com/Kotlin/KEEP/blob/master/proposals/nested-typealias.md)
* YouTrack 問題：[KT-45285](https://youtrack.jetbrains.com/issue/KT-45285)
* 自該版本起可用：2.2.0，自 2.3.0 起穩定

</td>
</tr>

<tr filter="stable">
<td>

**穩定**

</td>
<td>

**kotlin.time.Instant**

* KEEP 提案：[Instant and Clock](https://github.com/Kotlin/KEEP/blob/master/proposals/stdlib/instant.md)
* YouTrack 問題：[KT-80778](https://youtrack.jetbrains.com/issue/KT-80778)
* 自該版本起可用：2.1.0，自 2.3.0 起穩定

</td>
</tr>

<tr filter="stable">
<td>

**穩定**

</td>
<td>

**when-with-subject 中的防護條件 (Guard conditions)**

* KEEP 提案：[guards.md](https://github.com/Kotlin/KEEP/blob/guards/proposals/guards.md)
* YouTrack 問題：[KT-13626](https://youtrack.jetbrains.com/issue/KT-13626)
* 自該版本起可用：2.2.0

</td>
</tr>

<tr filter="stable">
<td>

**穩定**

</td>
<td>

**多錢符號插值：改進字串常值中 $ 的處理**

* KEEP 提案：[dollar-escape.md](https://github.com/Kotlin/KEEP/blob/master/proposals/dollar-escape.md)
* YouTrack 問題：[KT-2425](https://youtrack.jetbrains.com/issue/KT-2425)
* 自該版本起可用：2.2.0

</td>
</tr>

<tr filter="stable">
<td>

**穩定**

</td>
<td>

**非區域 (Non-local) `break` 與 `continue`**

* KEEP 提案：[break-continue-in-inline-lambdas.md](https://github.com/Kotlin/KEEP/blob/master/proposals/break-continue-in-inline-lambdas.md)
* YouTrack 問題：[KT-1436](https://youtrack.jetbrains.com/issue/KT-1436)
* 自該版本起可用：2.2.0

</td>
</tr>

<tr filter="stable">
<td>

**穩定**

</td>
<td>

**穩定的 `@SubclassOptInRequired`**

* KEEP 提案：[subclass-opt-in-required.md](https://github.com/Kotlin/KEEP/blob/master/proposals/subclass-opt-in-required.md)
* YouTrack 問題：[KT-54617](https://youtrack.jetbrains.com/issue/KT-54617)
* 自該版本起可用：2.1.0

</td>
</tr>

<tr filter="stable">
<td width="200">

**穩定**

</td>
<td>

**`Enum.entries`：`Enum.values()` 的高效能替代方案**

* KEEP 提案：[enum-entries.md](https://github.com/Kotlin/KEEP/blob/master/proposals/enum-entries.md)
* YouTrack 問題：[KT-48872](https://youtrack.jetbrains.com/issue/KT-48872)
* 自該版本起可用：2.0.0

</td>
</tr>

<tr filter="stable">
<td>

**穩定**

</td>
<td>

**資料物件 (Data objects)**

* KEEP 提案：[data-objects.md](https://github.com/Kotlin/KEEP/blob/master/proposals/data-objects.md)
* YouTrack 問題：[KT-4107](https://youtrack.jetbrains.com/issue/KT-4107)
* 自該版本起可用：1.9.0

</td>
</tr>

<tr filter="stable">
<td>

**穩定**

</td>
<td>

**RangeUntil 運算子 `..<`**

* KEEP 提案：[open-ended-ranges.md](https://github.com/kotlin/KEEP/blob/open-ended-ranges/proposals/open-ended-ranges.md)
* YouTrack 問題：[KT-15613](https://youtrack.jetbrains.com/issue/KT-15613)
* 自該版本起可用：1.7.20

</td>
</tr>

<tr filter="stable">
<td>

**穩定**

</td>
<td>

**絕對不可為 null 型別 (Definitely non-nullable types)**

* KEEP 提案：[definitely-non-nullable-types.md](https://github.com/Kotlin/KEEP/blob/master/proposals/definitely-non-nullable-types.md)
* YouTrack 問題：[KT-26245](https://youtrack.jetbrains.com/issue/KT-26245)
* 自該版本起可用：1.7.0

</td>
</tr>
</table>

</tab>

<tab id="revoked" title="已撤銷">

<table>
<tr filter="revoked">
<td width="200">

**已撤銷**

</td>
<td>

**上下文接收器 (Context receivers)**

* KEEP 提案：[context-receivers.md](https://github.com/Kotlin/KEEP/blob/master/proposals/context-receivers.md)
* YouTrack 問題：[KT-10468](https://youtrack.jetbrains.com/issue/KT-10468)
* 替換為 [context-parameters.md](https://github.com/Kotlin/KEEP/blob/context-parameters/proposals/context-parameters.md)

</td>
</tr>

<tr filter="revoked">
<td>

**已撤銷**

</td>
<td>

**Java 合成屬性參照 (Java synthetic property references)**

* KEEP 提案：[references-to-java-synthetic-properties.md](https://github.com/Kotlin/KEEP/blob/master/proposals/references-to-java-synthetic-properties.md)
* YouTrack 問題：[KT-8575](https://youtrack.jetbrains.com/issue/KT-8575)

</td>
</tr>
</table>

</tab>
</tabs>