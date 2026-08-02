[//]: # (title: Kotlin/Native 常見問題)

## 我該如何執行我的程式？

定義一個最上層函式 `fun main(args: Array<String>)`，或者如果您對傳入的引數不感興趣，只需定義 `fun main()`，並請確保它不在任何軟件包中。
此外，可以使用編譯器切換參數 `-entry`，使任何接收 `Array<String>` 或不接收引數並傳回 `Unit` 的函式作為入口點。

## Kotlin/Native 的記憶體管理模型為何？

Kotlin/Native 使用一種自動化記憶體管理方案，類似於 Java 或 Swift 提供的方案。

[進一步了解 Kotlin/Native 記憶體管理員](native-memory-manager.md)

## 我該如何建立共用庫？

在您的 Gradle 組建檔案中使用 `-produce dynamic` 編譯器選項或 `binaries.sharedLib()`：

```kotlin
kotlin {
    iosArm64("mylib") {
        binaries.sharedLib()
    }
}
```

它會產生平台特有的共用物件（Linux 上為 `.so`，macOS 上為 `.dylib`，Windows 目標上為 `.dll`）和一個 C 語言標頭檔，允許從 C/C++ 程式碼中使用您的 Kotlin/Native 程式中所有可用的公開 API。

[完成將 Kotlin/Native 作為動態庫的教學](native-dynamic-libraries.md)

## 我該如何建立靜態庫或物件檔案？

在您的 Gradle 組建檔案中使用 `-produce static` 編譯器選項或 `binaries.staticLib()`：

```kotlin
kotlin {
    iosArm64("mylib") {
        binaries.staticLib()
    }
}
```

它會產生平台特有的靜態物件（`.a` 庫格式）和一個 C 語言標頭檔，允許您從 C/C++ 程式碼中使用您的 Kotlin/Native 程式中所有可用的公開 API。

## 我該如何在公司代理伺服器（Corporate Proxy）後執行 Kotlin/Native？

由於 Kotlin/Native 需要下載平台特有的工具鏈，您需要指定 `-Dhttp.proxyHost=xxx -Dhttp.proxyPort=xxx` 作為編譯器或 `gradlew` 的引數，或者透過 `JAVA_OPTS` 環境變數進行設定。

## 我該如何為我的 Kotlin 架構指定自訂的 Objective-C 前綴／名稱？

使用 `-module-name` 編譯器選項或相應的 Gradle DSL 陳述式。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    iosArm64("myapp") {
        binaries.framework {
            freeCompilerArgs += listOf("-module-name", "TheName")
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    iosArm64("myapp") {
        binaries.framework {
            freeCompilerArgs += ["-module-name", "TheName"]
        }
    }
}
```

</tab>
</tabs>

## 我該如何重新命名 iOS 架構？

iOS 架構的預設名稱為 `<專案名稱>.framework`。
若要設定自訂名稱，請使用 `baseName` 選項。這同時也會設定模組名稱。

```kotlin
kotlin {
    iosArm64("myapp") {
       binaries {
          framework {
              baseName = "TheName"
          }
       }
    }
}
```

## 我該如何為我的 Kotlin 架構啟用 Bitcode？

Bitcode 嵌入已在 Xcode 14 中棄用，並在 Xcode 15 中針對所有 Apple 目標移除。
自 Kotlin 2.0.20 起，Kotlin/Native 編譯器不再支援 Bitcode 嵌入。

如果您使用的是較早版本的 Xcode，但希望升級到 Kotlin 2.0.20 或更高版本，請在您的 Xcode 專案中停用 Bitcode 嵌入。

## 我該如何為 iOS 獲取更好的損毀報告？

當一個未處理的 Kotlin 例外傳遞到 iOS 程式碼時，損毀報告工具可能會顯示一個模糊的報告，指出是 Kotlin/Native 內部問題，而不是拋出例外處的實際程式碼行。這是因為在記錄損毀時，原始的 Kotlin 堆疊追蹤已經遺失了。

您可以透過第三方解決方案（如 [NSExceptionKt](https://github.com/rickclephas/NSExceptionKt)）來解決此問題，它會將未捕獲的 Kotlin 例外轉換為 `NSException` 執行個體，以便您的損毀報告工具捕獲正確的堆疊追蹤。它為流行的損毀報告工具提供了專門的整合：

* [Bugsnag](https://github.com/rickclephas/NSExceptionKt/blob/master/NSExceptionKtBugsnag/README.md)
* [Firebase Crashlytics](https://github.com/rickclephas/NSExceptionKt/blob/master/NSExceptionKtCrashlytics/README.md)

## 我該如何安全地從不同的協同程式中引用物件？

若要在 Kotlin/Native 的多個協同程式之間安全地存取或更新物件，請考慮使用並行安全（concurrency-safe）的結構，例如 `@Volatile` 和 `AtomicReference`。

使用 [`@Volatile`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent/-volatile/) 來標註 `var` 屬性。這會使該屬性支援欄位的所有讀取和寫入操作都具有原子性。此外，寫入操作會立即對其他執行緒可見。當另一個執行緒存取此屬性時，它不僅能觀察到更新後的值，還能觀察到更新前發生的變更。

或者，使用 [AtomicReference](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent.atomics/-atomic-reference/)，它支援原子讀取和更新。在 Kotlin/Native 上，它包裝了一個揮發性（volatile）變數並執行原子操作。Kotlin 還提供了一組針對特定資料型別量身定制的原子操作型別。您可以使用 `AtomicInt`、`AtomicLong`、`AtomicBoolean`、`AtomicArray`，以及 `AtomicIntArray` 和 `AtomicLongArray`。

如需有關存取共享可變狀態的更多資訊，請參閱 [協同程式文件](shared-mutable-state-and-concurrency.md)。

## 我該如何使用未發佈版本的 Kotlin/Native 編譯我的專案？

首先，請考慮嘗試 [預覽版本](eap.md)。

如果您需要更近期的開發版本，您可以從原始碼編譯 Kotlin/Native：複製 [Kotlin 存儲庫](https://github.com/JetBrains/kotlin) 並遵循 [這些步驟](https://github.com/JetBrains/kotlin/blob/master/kotlin-native/README.md#building-from-source)。