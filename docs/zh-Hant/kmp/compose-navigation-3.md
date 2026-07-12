[//]: # (title: Compose Multiplatform 中的 Navigation 3)

[Android 的 Navigation 程式庫](https://developer.android.com/guide/navigation)已升級至 Navigation 3，引入了重新設計的導覽方法，該方法可與 Compose 搭配使用，並考慮了對先前版本程式庫的回饋。
從 1.10 版本開始，Compose Multiplatform 支援在所有支援平台的多平台專案中採用 Navigation 3：
Android、iOS、桌面 (desktop) 和 Web。

> 若要了解核心導覽概念，請參閱 [Compose 中的導覽](compose-navigation.md)。
>
{style="tip"}

## 主要變更

Navigation 3 不僅僅是程式庫的新版本 —— 在許多方面，它完全是一個新的程式庫。
若要進一步了解這次重新設計背後的理念，請參閱 [Android 開發者部落格文章](https://android-developers.googleblog.com/2025/05/announcing-jetpack-navigation-3-for-compose.html)。

Navigation 3 的主要變更包括：

* **使用者擁有的 back stack**。您不再操作單一的程式庫 back stack，而是建立並管理一個 `SnapshotStateList` 狀態，UI 會直接觀察該狀態。
* **低階構建區塊**。由於與 Compose 的整合更加緊密，該程式庫在實作您自己的導覽組件和行為時提供了更大的靈活性。
* **適應性配置系統**。透過適應性設計，您可以同時顯示多個目的地，並在配置之間無縫切換。 

在 [Android 文件](https://developer.android.com/guide/navigation/navigation-3)中進一步了解 Navigation 3 的一般設計。

## 相依性設定

若要嘗試 Navigation 3 的多平台實作，請將以下相依性新增至您的版本目錄：

```toml
[versions]
multiplatform-nav3-ui = "1.1.1"

[libraries]
jetbrains-navigation3-ui = { module = "org.jetbrains.androidx.navigation3:navigation3-ui", version.ref = "multiplatform-nav3-ui" }
```

> 雖然 Navigation 3 以兩個構件發佈，分別是 `navigation3:navigation3-ui` 和 `navigation3:navigation3-common`，但只有 `navigation3-ui` 具有獨立的 Compose Multiplatform 實作。
> 對 `navigation3-common` 的相依性是透過傳遞方式新增的。
>
{style="note"}

對於使用 Material 3 Adaptive 和 ViewModel 程式庫的專案，還需新增以下導覽支援構件：
```toml
[versions]
compose-multiplatform-adaptive = "1.3.0-beta02"
compose-multiplatform-lifecycle = "2.10.0"

[libraries]
jetbrains-material3-adaptiveNavigation3 = { module = "org.jetbrains.compose.material3.adaptive:adaptive-navigation3", version.ref = "compose-multiplatform-adaptive" }
jetbrains-lifecycle-viewmodelNavigation3 = { module = "org.jetbrains.androidx.lifecycle:lifecycle-viewmodel-navigation3", version.ref = "compose-multiplatform-lifecycle" }
```

最後，您可以嘗試由 JetBrains 工程師建立的[概念驗證程式庫](https://github.com/terrakok/navigation3-browser)。該程式庫將多平台 Navigation 3 與 Web 上的瀏覽器歷程導覽整合在一起：

```toml
[versions]
compose-multiplatform-navigation3-browser = "1.1.0"

[libraries]
navigation3-browser = { module = "com.github.terrakok:navigation3-browser", version.ref = "compose-multiplatform-navigation3-browser" }
```

瀏覽器歷程導覽預計將在未來版本的基礎多平台 Navigation 3 程式庫中支援。
請在 [CMP-8924](https://youtrack.jetbrains.com/projects/CMP/issues/CMP-8924/Integrate-Browser-History-with-Nav3) 中追蹤進度。

## 多平台支援

Navigation 3 與 Compose 緊密結合，允許 Android 導覽實作在通用 Compose Multiplatform 程式碼中以最小的變動運作。
為了支援 Web 和 iOS 等非 JVM 平台，您唯一需要做的就是實作[目的地金鑰的多型序列化](#polymorphic-serialization-for-destination-keys)。 

您可以在 GitHub 上比較使用 Navigation 3 的僅限 Android 與多平台應用程式的廣泛範例：
* [包含 Navigation 3 技巧的原始 Android 存儲庫](https://github.com/android/nav3-recipes)
* [包含大部分相同技巧的 Compose Multiplatform 專案](https://github.com/terrakok/nav3-recipes)

### 目的地金鑰的多型序列化

在 Android 上，Navigation 3 依賴基於反射的序列化，這在針對 iOS 等非 JVM 平台時是不可用的。
為了處理此限制，程式庫為 `rememberNavBackStack()` 函式提供了兩個多載：

* [第一個多載](https://developer.android.com/reference/kotlin/androidx/navigation3/runtime/package-summary#rememberNavBackStack(kotlin.Array))僅接受一組 `NavKey` 參考，並需要基於反射的序列化器。
* [第二個多載](https://developer.android.com/reference/kotlin/androidx/navigation3/runtime/package-summary#rememberNavBackStack(androidx.savedstate.serialization.SavedStateConfiguration,kotlin.Array))還接受一個 `SavedStateConfiguration` 參數，允許您提供 `SerializersModule` 並在所有平台上正確處理開放式多型。

Navigation 3 [多平台範例](https://github.com/terrakok/nav3-recipes/blob/8ff455499877225b638d5fcd82b232834f819422/sharedUI/src/commonMain/kotlin/com/example/nav3recipes/basicdsl/BasicDslActivity.kt#L40)定義了路由並使用 `SavedStateConfiguration` 進行註冊，如下所示：

```kotlin
@Serializable
private data object RouteA : NavKey

@Serializable
private data class RouteB(val id: String) : NavKey

// 建立開放式多型所需的序列化配置
private val config = SavedStateConfiguration {
    serializersModule = SerializersModule {
        polymorphic(NavKey::class) {
            subclass(RouteA::class, RouteA.serializer())
            subclass(RouteB::class, RouteB.serializer())
        }
    }
}

@Composable
fun BasicDslActivity() {
    // 使用序列化配置
    val backStack = rememberNavBackStack(config, RouteA)

    NavDisplay(
        backStack = backStack,
        //...
    )
}
```

### 建議的序列化方法

在實作多平台導覽時，您需要選擇如何組織和序列化您的路由定義。根據您專案的複雜程度和模組化程度，請使用以下三種模式之一。

#### 使用密封型別的單一模組

對於所有路由都存在於單一模組的小型專案，請使用 `sealed interface`。這是最直接的方法，因為 Kotlin 序列化會自動處理階層結構：

```kotlin
@Serializable
sealed interface Route : NavKey

@Serializable
data object RouteA : Route

@Serializable
data class RouteB(val id: String) : Route

// 使用預設序列化器的 back stack
val backStack: MutableList<Route> =
    rememberSerializable(serializer = SnapshotStateListSerializer()) {
        mutableStateListOf(RouteA)
    }
```

或者，如果您想明確使用 `rememberNavBackStack()` 函式，這裡有一個稍微不同的配置：

```kotlin
private val config = SavedStateConfiguration {
    serializersModule = SerializersModule {
        polymorphic(NavKey::class) {
            subclassesOfSealed<Route>()
        }
    }
}
val backStack = rememberNavBackStack(config, RouteA)
```

#### 包含聚合密封型別的多模組

對於路由定義在多個模組中的更複雜專案，您可以為每個模組定義一個密封型別。然後，在 `app` 模組中使用 `subclassesOfSealed()` 函式聚合它們的序列化器。

```kotlin
// 模組 A
@Serializable sealed interface FeatureA : NavKey
@Serializable data object RouteA1 : FeatureA
@Serializable data object RouteA2 : FeatureA

// 模組 B
@Serializable sealed interface FeatureB : NavKey
@Serializable data class RouteB1(val id: String) : FeatureB
@Serializable data class RouteB2(val id: String) : FeatureB

// app 模組
private val config = SavedStateConfiguration {
    serializersModule = SerializersModule {
        polymorphic(NavKey::class) {
            subclassesOfSealed<FeatureA>()
            subclassesOfSealed<FeatureB>()
        }
    }
}
val backStack = rememberNavBackStack(config, RouteA1)
```

透過相依注入 (DI)，您還可以動態使用 DI 容器將每個模組的密封型別序列化器收集到 `Set<KSerializer>` 中。

#### 包含個別路由註冊的多模組

如果您的路由無法分組為密封型別，您可以手動組合來自不同模組的 `SerializersModule` 執行個體。

```kotlin
// 模組 A
@Serializable data object RouteA1 : NavKey
@Serializable data object RouteA2 : NavKey

val serializerModuleA = SerializersModule {
    polymorphic(NavKey::class) {
        subclass(RouteA1::class, RouteA1.serializer())
        subclass(RouteA2::class, RouteA2.serializer())
    }
}

// 模組 B
@Serializable data class RouteB1(val id: String) : NavKey
@Serializable data class RouteB2(val id: String) : NavKey

val serializerModuleB = SerializersModule {
    polymorphic(NavKey::class) {
        subclass(RouteB1::class, RouteB1.serializer())
        subclass(RouteB2::class, RouteB2.serializer())
    }
}

// app 模組
private val config = SavedStateConfiguration {
    serializersModule = serializerModuleA + serializerModuleB
}
val backStack = rememberNavBackStack(config, RouteA1)
```

這種方法提供了高度的靈活性和解耦，儘管它需要更多的手動維護。與[包含聚合密封型別的多模組](#multi-module-with-aggregated-sealed-types)方法類似，您可以使用 DI 動態組合序列化器清單，這可以提高靈活性。

## 下一步

Android 開發者入口網站對 Navigation 3 進行了深入探討。雖然部分文件使用了 Android 特定的範例，但核心概念和導覽原則在所有平台上都保持一致：

* [Navigation 3 總覽](https://developer.android.com/guide/navigation/navigation-3)，包含管理狀態、模組化導覽程式碼和動畫的建議。
* [從 Navigation 2 遷移到 Navigation 3](https://developer.android.com/guide/navigation/navigation-3/migration-guide)。將 Navigation 3 視為一個新的程式庫，而不是現有程式庫的新版本會更容易，因此與其說是遷移，不如說是重寫。但該指南指出了應採取的一般步驟。