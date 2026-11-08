---
title: R8 / ProGuard
---

# R8 / ProGuard

本頁說明 Koin 在程式碼壓縮與混淆 (R8 / ProGuard) 下的行為、Koin 為你保留了哪些內容，以及**你**需要在自己的應用程式中保留哪些內容。

## TL;DR {id="tl-dr"}

- **Koin 的核心解析在 R8 下是安全的。** `get<T>()`、`inject<T>()` 以及 `*Of` 建置函式（`singleOf`、`factoryOf`、`viewModelOf`…）會在**編譯期**解析相依性——它們使用具體化型別 (reified types)，且在 Android/JVM 上是以 `Class.getName()` 作為註冊表的鍵。這**不會在執行期對你的建構函式使用反射**，因此你**不需要**為了 Koin 特別保留 (keep) 你的定義、ViewModel 或其建構函式。
- Koin 在其 Android AAR（`koin-android`、`koin-core-viewmodel`、`koin-compose-viewmodel`、`koin-androidx-workmanager`、`koin-androidx-startup`）中隨附了 `consumer-rules.pro`，因此下列規則會自動套用——你通常不需要額外新增任何設定。
- 你仍然需要保留由**其他機制**透過反射載入的類別（請參閱下文）。

## Koin 為你保留的內容（隨附的取用端規則） {id="what-koin-keeps-for-you-shipped-consumer-rules"}

這些 AAR 抑制了關於 Koin 內部的 R8 警告：

```proguard
-dontwarn org.koin.**
```

`koin-androidx-startup` 額外保留了在 AndroidManifest 中參照的 initializer。這些規則都不會保留你的應用程式類別——Koin 不需要保留它們。

## 你必須保留的內容 {id="what-you-must-keep"}

這些需求來自平台或程式庫，而非來自 Koin 的解析：

- **由 `KoinFragmentFactory` 建立的 Fragment** 是透過類別名稱具現化的。請保留你的 Fragment 子類別（它們通常已透過 `@Keep`、版面配置參照或 AndroidX 規則保留）。
- **WorkManager 的 `ListenableWorker` 子類別** 已由 `androidx.work` 自己的取用端規則保留。
- **針對行程終止 (Process death) 的已儲存狀態。** `SavedStateHandle` 是由 AndroidX 的 `CreationExtras` 提供，而非由 Koin 提供。放入其中的值必須與其他已儲存狀態一樣在 R8 處理後依然保留——請保留你自己的 `@Parcelize` / `Serializable` 狀態類別：

```proguard
# 範例 — 保留你自己的已儲存狀態承載資料
-keep class com.example.** implements android.os.Parcelable { *; }
```

## ViewModel 與 SavedStateHandle (#2044) {id="viewmodels-savedstatehandle-2044"}

一個常見的誤解是：間歇性出現的 `No definition found for SavedStateHandle` 當機是由於 R8 剔除了 Koin 的 ViewModel 反射所致。**事實並非如此**——`viewModelOf(::MyViewModel)` 是在編譯期處理的，因此在你的 ViewModel 上加上 `-keep` 並不會改變 Koin 的解析行為。

`SavedStateHandle` 僅在 **ViewModel 建立期間**可用（它是從傳遞給 Factory 的 `CreationExtras` 所建置）。請**直接在 ViewModel 建構函式中**解析它——不要使用延遲載入或在建構完成之後才解析：

```kotlin
// ✅ 在建立期間解析
class MyViewModel(val handle: SavedStateHandle) : ViewModel()

// ❌ 稍後解析 — 此時 CreationExtras 已不存在
class MyViewModel(koin: Koin) : ViewModel() {
    val handle by lazy { koin.get<SavedStateHandle>() } // 會失敗
}
```

如果你在 `viewModelScope { }` 內部宣告 ViewModel，請啟用對應的選項，以便建立該作用域：

```kotlin
startKoin {
    options(viewModelScopeFactory())
    modules(appModule)
}
```

## 非 Android 目標 (JS / WASM / Native) {id="non-android-targets-js-wasm-native"}

在 Android/JVM 上，Koin 以 `Class.getName()` 作為註冊表的鍵，這在 R8 處理下是穩定的。在 **Kotlin/JS、WASM 和 Native** 上，Koin 則使用來自 Kotlin 反射的 `qualifiedName` / `simpleName`。在這些目標上進行積極的名稱縮減 (minification) 可能會影響型別識別——當你在縮減非 Android 目標時，建議使用**具名限定詞** (`named("...")`)，而非依賴類別名稱。