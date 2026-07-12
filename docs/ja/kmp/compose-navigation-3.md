[//]: # (title: Compose Multiplatform における Navigation 3)

[Android の Navigation ライブラリ](https://developer.android.com/guide/navigation)が Navigation 3 にアップグレードされ、Compose で動作し、前バージョンのライブラリへのフィードバックを考慮した、再設計されたナビゲーション手法が導入されました。
バージョン 1.10 以降、Compose Multiplatform は、Android、iOS、デスクトップ、ウェブといった、サポートされているすべてのプラットフォームでのマルチプラットフォームプロジェクトにおける Navigation 3 の採用をサポートしています。

> ナビゲーションの中心的な概念については、[Compose でのナビゲーション](compose-navigation.md)をご覧ください。
>
{style="tip"}

## 主な変更点

Navigation 3 は単なるライブラリの新しいバージョンではなく、多くの面で完全に新しいライブラリと言えます。
この再設計の背後にある哲学の詳細については、[Android Developers のブログ投稿](https://android-developers.googleblog.com/2025/05/announcing-jetpack-navigation-3-for-compose.html)をご覧ください。

Navigation 3 の主な変更点は以下の通りです：

* **ユーザー所有のバックスタック (User-owned back stack)**。ライブラリの単一のバックスタックを操作する代わりに、UI が直接監視する状態の `SnapshotStateList` を作成して管理します。
* **低レベルのビルディングブロック**。Compose とのより密接な統合により、独自のナビゲーションコンポーネントや動作を実装する際の柔軟性が向上しています。
* **アダプティブレイアウトシステム**。アダプティブデザインにより、複数のデスティネーションを同時に表示したり、レイアウトをシームレスに切り替えたりできます。

Navigation 3 の一般的な設計の詳細については、[Android のドキュメント](https://developer.android.com/guide/navigation/navigation-3)をご覧ください。

## 依存関係の設定

Navigation 3 のマルチプラットフォーム実装を試すには、以下の依存関係をバージョンカタログに追加してください。

```toml
[versions]
multiplatform-nav3-ui = "1.1.1"

[libraries]
jetbrains-navigation3-ui = { module = "org.jetbrains.androidx.navigation3:navigation3-ui", version.ref = "multiplatform-nav3-ui" }
```

> Navigation 3 は `navigation3:navigation3-ui` と `navigation3:navigation3-common` の 2 つのアーティファクトとしてリリースされていますが、Compose Multiplatform 独自の別個の実装があるのは `navigation3-ui` のみです。
> `navigation3-common` への依存関係は、推移的に追加されます。
>
{style="note"}

Material 3 Adaptive および ViewModel ライブラリを使用しているプロジェクトの場合は、以下のナビゲーションサポートアーティファクトも追加してください。
```toml
[versions]
compose-multiplatform-adaptive = "1.3.0-beta02"
compose-multiplatform-lifecycle = "2.10.0"

[libraries]
jetbrains-material3-adaptiveNavigation3 = { module = "org.jetbrains.compose.material3.adaptive:adaptive-navigation3", version.ref = "compose-multiplatform-adaptive" }
jetbrains-lifecycle-viewmodelNavigation3 = { module = "org.jetbrains.androidx.lifecycle:lifecycle-viewmodel-navigation3", version.ref = "compose-multiplatform-lifecycle" }
```

最後に、JetBrains のエンジニアによって作成された [概念実証 (proof-of-concept) ライブラリ](https://github.com/terrakok/navigation3-browser) を試すことができます。このライブラリは、マルチプラットフォームの Navigation 3 をウェブ上のブラウザ履歴ナビゲーションと統合します。

```toml
[versions]
compose-multiplatform-navigation3-browser = "1.1.0"

[libraries]
navigation3-browser = { module = "com.github.terrakok:navigation3-browser", version.ref = "compose-multiplatform-navigation3-browser" }
```

ブラウザ履歴ナビゲーションのサポートは、将来のリリースでベースのマルチプラットフォーム Navigation 3 ライブラリによって提供される予定です。
進捗状況は [CMP-8924](https://youtrack.jetbrains.com/projects/CMP/issues/CMP-8924/Integrate-Browser-History-with-Nav3) で確認できます。

## マルチプラットフォーム対応

Navigation 3 は Compose と密接に連携しているため、Android のナビゲーション実装を最小限の変更で共通の Compose Multiplatform コードで動作させることができます。
ウェブや iOS などの非 JVM プラットフォームをサポートするために必要なのは、[デスティネーションキーのポリモーフィックなシリアル化](#デスティネーションキーのポリモーフィックなシリアル化) を実装することだけです。

GitHub で、Navigation 3 を使用した Android 専用アプリとマルチプラットフォームアプリの広範な例を比較できます：
* [Navigation 3 レシピが含まれるオリジナルの Android リポジトリ](https://github.com/android/nav3-recipes)
* [同じレシピのほとんどを含む Compose Multiplatform プロジェクト](https://github.com/terrakok/nav3-recipes)

### デスティネーションキーのポリモーフィックなシリアル化

Android では、Navigation 3 はリフレクションベースのシリアル化に依存していますが、iOS のような非 JVM プラットフォームをターゲットにする場合はこれを利用できません。
これを考慮して、このライブラリには `rememberNavBackStack()` 関数の 2 つのオーバーロードが用意されています。

* [最初のオーバーロード](https://developer.android.com/reference/kotlin/androidx/navigation3/runtime/package-summary#rememberNavBackStack(kotlin.Array)) は `NavKey` 参照のセットのみを受け取り、リフレクションベースのシリアライザーを必要とします。
* [2 番目のオーバーロード](https://developer.android.com/reference/kotlin/androidx/navigation3/runtime/package-summary#rememberNavBackStack(androidx.savedstate.serialization.SavedStateConfiguration,kotlin.Array)) は、`SerializersModule` を提供し、すべてのプラットフォームでオープンポリモーフィズムを正しく処理できる `SavedStateConfiguration` パラメータも受け取ります。

Navigation 3 の[マルチプラットフォームの例](https://github.com/terrakok/nav3-recipes/blob/8ff455499877225b638d5fcd82b232834f819422/sharedUI/src/commonMain/kotlin/com/example/nav3recipes/basicdsl/BasicDslActivity.kt#L40)では、以下に示すようにルートを定義し、それらを `SavedStateConfiguration` に登録します：

```kotlin
@Serializable
private data object RouteA : NavKey

@Serializable
private data class RouteB(val id: String) : NavKey

// オープンポリモーフィズムに必要なシリアル化設定を作成します
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
    // シリアル化設定を使用します
    val backStack = rememberNavBackStack(config, RouteA)

    NavDisplay(
        backStack = backStack,
        //...
    )
}
```

### 推奨されるシリアル化手法

マルチプラットフォームナビゲーションを実装する際には、ルート定義をどのように整理し、シリアル化するかを選択する必要があります。
プロジェクトの複雑さとモジュール化に応じて、以下の 3 つのパターンのいずれかを使用してください。

#### sealed 型を使用した単一モジュール

すべてのルートが 1 つのモジュールに存在する小規模なプロジェクトの場合は、`sealed interface` を使用します。
Kotlin シリアル化が階層を自動的に処理するため、これが最も直接的な手法です：

```kotlin
@Serializable
sealed interface Route : NavKey

@Serializable
data object RouteA : Route

@Serializable
data class RouteB(val id: String) : Route

// デフォルトのシリアライザーを使用したバックスタック
val backStack: MutableList<Route> =
    rememberSerializable(serializer = SnapshotStateListSerializer()) {
        mutableStateListOf(RouteA)
    }
```

あるいは、`rememberNavBackStack()` 関数を明示的に使用したい場合は、以下のような少し異なる設定になります：

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

#### 集約された sealed 型を使用したマルチモジュール

ルートが複数のモジュールで定義されているより複雑なプロジェクトの場合は、モジュールごとに sealed 型を定義できます。
次に、`app` モジュールで `subclassesOfSealed()` 関数を使用して、それらのシリアライザーを集約します。

```kotlin
// モジュール A
@Serializable sealed interface FeatureA : NavKey
@Serializable data object RouteA1 : FeatureA
@Serializable data object RouteA2 : FeatureA

// モジュール B
@Serializable sealed interface FeatureB : NavKey
@Serializable data class RouteB1(val id: String) : FeatureB
@Serializable data class RouteB2(val id: String) : FeatureB

// モジュール app
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

依存性の注入 (DI) を使用すると、DI コンテナを使用して、各モジュールから sealed 型のシリアライザーを `Set<KSerializer>` に動的に収集することもできます。

#### 個別のルート登録を使用したマルチモジュール

ルートを sealed 型にグループ化できない場合は、異なるモジュールの `SerializersModule` インスタンスを手動で組み合わせることができます。

```kotlin
// モジュール A
@Serializable data object RouteA1 : NavKey
@Serializable data object RouteA2 : NavKey

val serializerModuleA = SerializersModule {
    polymorphic(NavKey::class) {
        subclass(RouteA1::class, RouteA1.serializer())
        subclass(RouteA2::class, RouteA2.serializer())
    }
}

// モジュール B
@Serializable data class RouteB1(val id: String) : NavKey
@Serializable data class RouteB2(val id: String) : NavKey

val serializerModuleB = SerializersModule {
    polymorphic(NavKey::class) {
        subclass(RouteB1::class, RouteB1.serializer())
        subclass(RouteB2::class, RouteB2.serializer())
    }
}

// モジュール app
private val config = SavedStateConfiguration {
    serializersModule = serializerModuleA + serializerModuleB
}
val backStack = rememberNavBackStack(config, RouteA1)
```

この手法は高いレベルの柔軟性と非結合化を提供しますが、より多くの手動メンテナンスが必要になります。
[集約された sealed 型を使用したマルチモジュール](#集約された-sealed-型を使用したマルチモジュール)手法と同様に、DI を使用してシリアライザーのリストを動的に組み立てることができ、これにより柔軟性が向上します。

## 次のステップ

Navigation 3 については、Android デベロッパーポータルで詳しく説明されています。
一部のドキュメントでは Android 固有の例が使用されていますが、コアとなる概念とナビゲーションの原則はすべてのプラットフォームで共通しています。

* [Navigation 3 の概要](https://developer.android.com/guide/navigation/navigation-3):
  状態管理、ナビゲーションコードのモジュール化、アニメーションに関するアドバイスが含まれています。
* [Navigation 2 から Navigation 3 への移行](https://developer.android.com/guide/navigation/navigation-3/migration-guide):
  Navigation 3 は既存のライブラリの新バージョンというよりも新しいライブラリとして捉える方が適切であるため、移行というよりは書き換えに近い作業になります。
  しかし、このガイドでは一般的な手順が示されています。