[//]: # (title: Compose Multiplatform 1.10.3 の新機能)

この機能リリースの主なハイライトは以下の通りです：

 * [統合された `@Preview` アノテーション](#unified-preview-annotation)
 * [Navigation 3 のサポート](#support-for-navigation-3)
 * [Compose Hot Reload の同梱](#compose-hot-reload-integration)

このリリースの変更点の完全なリストは、[GitHub](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.10.0) で確認できます。
特定のコンポーネントバージョンの詳細については、[依存関係](#dependencies) セクションを参照してください。

## 破壊的変更と非推奨

### 非推奨となった依存関係エイリアス

Compose Multiplatform Gradle プラグインでサポートされていた依存関係エイリアス（`compose.ui` など）は、1.10.0-beta01 リリースで非推奨となりました。
バージョンカタログに直接ライブラリ参照を追加することをお勧めします。
具体的な参照先は、対応する非推奨通知の中で提案されています。

この変更により、Compose Multiplatform ライブラリの依存関係管理がより透明（明確）になるはずです。
将来的には、互換性のあるバージョンのセットアップを簡素化するために、Compose Multiplatform 用の BOM を提供したいと考えています。

### 非推奨となった `PredictiveBackHandler()`

`PredictiveBackHandler()` 関数は、Android ネイティブの戻るナビゲーションジェスチャー（Predictive Back）を他のプラットフォームに導入するために Compose Multiplatform で導入されました。
Navigation 3 のリリースに伴い、古い実装は新しい [Navigation Event](https://developer.android.com/jetpack/androidx/releases/navigationevent) ライブラリとその API に置き換わる形で非推奨となりました。
具体的には、`PredictiveBackHandler()` 関数の代わりに、より汎用的な `NavigationEventHandler()` 実装をラップする新しい `NavigationBackHandler()` 関数を使用する必要があります。

最もシンプルな移行は、以下のようになります：

<compare type="top-bottom">
    <code-block lang="kotlin" code="         PredictiveBackHandler(enabled = true) { progress -&gt;&#10;            try {&#10;                progress.collect { event -&gt;&#10;                    // Animate the back gesture progress&#10;                }&#10;                // Process the completed back gesture&#10;            } catch(e: Exception) {&#10;                // Process the canceled back gesture&#10;            }&#10;        }"></code-block>
    <code-block lang="kotlin" code="        // Use an empty state as a stub to satisfy the required argument&#10;        val navState = rememberNavigationEventState(NavigationEventInfo.None)&#10;        NavigationBackHandler(&#10;            state = navState,&#10;            isBackEnabled = true,&#10;            onBackCancelled = {&#10;                // Process the canceled back gesture&#10;            },&#10;            onBackCompleted = {&#10;              // Process the completed back gesture&#10;            }&#10;        )&#10;        LaunchedEffect(navState.transitionState) {&#10;            val transitionState = navState.transitionState&#10;            if (transitionState is NavigationEventTransitionState.InProgress) {&#10;                val progress = transitionState.latestEvent.progress&#10;                // Animate the back gesture progress&#10;            }&#10;        }"></code-block>
</compare>

ここでのポイント：

* `state` パラメーターは必須です：`NavigationEventInfo` は UI 状態に関するコンテキスト情報を保持するように設計されています。
  現時点で保存する情報がない場合は、スタブとして `NavigationEventInfo.None` を使用できます。
* `onBack` パラメーターは `onBackCancelled` と `onBackCompleted` に分割されたため、キャンセルされたジェスチャーを個別に追跡する必要がなくなりました。
* `NavigationEventState.transitionState` プロパティは、物理的なジェスチャーの進行状況を追跡するのに役立ちます。

実装の詳細については、[Navigation Event API リファレンスの NavigationEventHandler ページ](https://developer.android.com/reference/kotlin/androidx/navigationevent/NavigationEventHandler)を参照してください。

### Kotlin の最小バージョンが引き上げられました

プロジェクトに native または web ターゲットが含まれている場合、最新の機能を利用するには Kotlin 2.2.20 へのアップグレードが必要です。

## プラットフォーム共通

### 統合された `@Preview` アノテーション

プラットフォーム間でのプレビューのアプローチを統一しました。
`commonMain` ソースセットで `androidx.compose.ui.tooling.preview.Preview` アノテーションを使用できるようになりました。

`org.jetbrains.compose.ui.tooling.preview.Preview` やデスクトップ専用の `androidx.compose.desktop.ui.tooling.preview.Preview` など、他のすべてのアノテーションは非推奨となりました。

### interop ビューの自動リサイズ

Compose Multiplatform は、デスクトップと iOS の両方で、ネイティブの interop（相互運用）要素の自動リサイズをサポートしました。
これらの要素は、コンテンツに合わせてレイアウトを適応させることができるようになり、
手動で正確なサイズを計算したり、事前に固定の寸法を指定したりする必要がなくなります。

* デスクトップでは、`SwingPanel` が埋め込まれたコンポーネントの最小、推奨、最大サイズに基づいてサイズを自動的に調整します。
* iOS では、UIKit interop ビューがビューの fitting size（固有のコンテンツサイズ / intrinsic content size）に応じたサイジングをサポートするようになりました。
  これにより、`UIHostingController` を介した SwiftUI ビューや、`NSLayoutConstraints` に依存しない基本的な `UIView` サブクラスを適切にラッピングできるようになります。

### `Popup` および `Dialog` プロパティの安定化

`DialogProperties` の以下のプロパティが安定版（stable）に昇格し、実験的（experimental）ではなくなりました：
`usePlatformInsets`、`useSoftwareKeyboardInset`、および `scrimColor`。

同様に、`PopupProperties` の `usePlatformDefaultWidth` および `usePlatformInsets` プロパティも安定版に昇格しました。

`PopupProperties` パラメーターを持たない `Popup` オーバーロードの非推奨レベルが `ERROR` に変更され、更新された API の使用が強制されるようになりました。

### Skia が Milestone 138 に更新されました

Skiko を通じて Compose Multiplatform で使用されている Skia のバージョンが、Milestone 138 に更新されました。

以前に使用されていた Skia のバージョンは Milestone 132 でした。
これらのバージョン間で行われた変更については、[リリースノート](https://skia.googlesource.com/skia/+/refs/heads/chrome/m138/RELEASE_NOTES.md)で確認できます。

### Navigation 3 のサポート
<primary-label ref="Experimental"/>

Navigation 3 は、Compose で動作するように設計された新しいナビゲーションライブラリです。
Navigation 3 では、バックスタックを完全に制御でき、デスティネーション間の移動はリストへの項目の追加や削除と同じくらいシンプルになります。
新しい設計指針や決定事項については、[Navigation 3 のドキュメント](https://developer.android.com/guide/navigation/navigation-3)や、発表の[ブログ記事](https://android-developers.googleblog.com/2025/05/announcing-jetpack-navigation-3-for-compose.html)で読むことができます。

Compose Multiplatform 1.10.0-beta01 は、Android 以外のターゲットで新しいナビゲーション API を使用するための Alpha サポートを提供します。
リリースされたマルチプラットフォームアーティファクトは以下の通りです：

* Navigation 3 UI ライブラリ：`org.jetbrains.androidx.navigation3:navigation3-ui`
* Navigation 3 用 ViewModel：`org.jetbrains.androidx.lifecycle:lifecycle-viewmodel-navigation3`
* Navigation 3 用 Material 3 アダプティブレイアウト：`org.jetbrains.compose.material3.adaptive:adaptive-navigation3`

マルチプラットフォームでの Navigation 3 実装の例は、オリジナルの Android リポジトリからミラーリングされた [nav3-recipes](https://github.com/terrakok/nav3-recipes) サンプルで確認できます。

プラットフォーム固有のいくつかの実装詳細：

* iOS では、[EndEdgePanGestureBehavior](https://github.com/JetBrains/compose-multiplatform-core/pull/2519) オプション（デフォルトは `Disabled`）を使用して、終了エッジの[パンジェスチャー（pan gestures）](https://developer.apple.com/documentation/uikit/handling-pan-gestures)によるナビゲーションを管理できるようになりました。
  ここで「終了エッジ（end edge）」とは、LTR インターフェースでは画面の右端、RTL では左端を指します。
  開始エッジ（start edge）は終了エッジ의 反対側であり、常に戻るジェスチャーに紐付けられています。
* Web アプリでは、デスクトップブラウザで **Esc** キーを押すと、デスクトップアプリと同様に、前の画面に戻る（およびダイアログ、ポップアップ、Material 3 の `SearchBar` などの一部のウィジェットを閉じる）ようになりました。
* [ブラウザの履歴ナビゲーション](compose-navigation-routing.md#support-for-browser-navigation-in-web-apps)のサポートとアドレスバーでのデスティネーションの使用については、Compose Multiplatform 1.10 の Navigation 3 では拡張されません。
  これはマルチプラットフォームライブラリの将来のバージョンまで延期されました。

## iOS

### ウィンドウインセット（Window insets）

Compose Multiplatform は `WindowInsetsRulers` をサポートしました。
これにより、ステータスバー、ナビゲーションバー、またはオンスクリーンキーボードなどのウィンドウインセットに基づいて UI 要素を配置し、サイズを調整する機能が提供されます。

ウィンドウインセットを管理するためのこの新しいアプローチでは、プラットフォーム固有のウィンドウインセットデータを取得するために単一の実装を使用します。
つまり、`WindowInsets` と `WindowInsetsRulers` の両方が共通のメカニズムを使用して、一貫してインセットを管理します。

> 以前、`WindowInsets.Companion.captionBar` は `@Composable` とマークされていませんでした。
> プラットフォーム間での動作を一致させるために、`@Composable` 属性を追加しました。
> 
{style="note"}

### IME 設定の改善

[1.9.0 で導入された](whats-new-compose-190.md#ime-options) iOS 固有の IME カスタマイズに続き、このリリースでは `PlatformImeOptions` を使用してテキスト入力ビューを構成するための新しい API が追加されました。

これらの新しい API を使用すると、フィールドがフォーカスを取得して IME がトリガーされたときの入力インターフェースをカスタ備ズできます：

 * `UIResponder.inputView` は、デフォルトのシステムキーボードを置き換えるカスタム入力ビューを指定します。
 * `UIResponder.inputAccessoryView` は、IME アクティブ化時にシステムキーボードまたはカスタム `inputView` にアタッチされるカスタムアクセサリビューを定義します。

### interop ビューのオーバーレイ配置
<primary-label ref="Experimental"/>

実験的な `placedAsOverlay` フラグを使用して、`UIKitView` および `UIKitViewController` ビューを Compose UI の上に配置できるようになりました。
このフラグにより、interop ビューで透明な背景やネイティブのシェーダー効果をサポートできるようになります。

interop ビューをオーバーレイとしてレンダリングするには、`@OptIn(ExperimentalComposeUiApi::class)` アノテーションを使用し、`UIKitInteropProperties` で `placedAsOverlay` パラメーターを `true` に設定します：

```kotlin
UIKitViewController(
    modifier = modifier,
    update = {},
    factory = { factory.createNativeMap() },
    properties = UIKitInteropProperties(placedAsOverlay = true)
)
```

この構成では、ビューが Compose UI レイヤーの最前面にレンダリングされることに注意してください。
その結果、同じエリアにある他のコンポーザブル（composable）は視覚的に覆い隠されます。

## Web

### リソースのキャッシュ
<primary-label ref="Experimental"/>

Compose Multiplatform は [Web Cache API](https://developer.mozilla.org/ja/docs/Web/API/Cache) を使用して、静的アセットや文字列リソースの成功したレスポンスをキャッシュするようになりました。
このアプローチにより、HTTP リクエストを繰り返して保存されたコンテンツを検証するブラウザのデフォルトキャッシュに伴う遅延を回避でき、特に低帯域幅の接続で低速になる問題を解消できます。
キャッシュは、リソースがアプリケーションの現在の状態と一致することを保証するため、アプリの起動やページの更新のたびにクリアされます。

詳細については、[プルリクエスト](https://github.com/JetBrains/compose-multiplatform/pull/5379)および [Web リソースのキャッシュ](compose-web-resources.md#caching-web-resources)のドキュメントを参照してください。

## デスクトップ

### Compose Hot Reload の統合

Compose Hot Reload プラグインが Compose Multiplatform Gradle プラグインに同梱されるようになりました。
デスクトップをターゲットとする Compose Multiplatform プロジェクトではデフォルトで有効になっているため、Hot Reload プラグインを個別に構成する必要はもうありません。

Compose Hot Reload プラグインを明示的に宣言しているプロジェクトへの影響：

 * Compose Multiplatform Gradle プラグインによって提供されるバージョンを使用するために、宣言を安全に削除できます。
 * 特定のバージョンの宣言を維持することを選択した場合は、同梱されているバージョンの代わりにそのバージョンが使用されます。

同梱されている Compose Hot Reload Gradle プラグインの最小 Kotlin バージョンは 2.1.20 です。
古いバージョンの Kotlin が検出された場合、ホットリロード機能は無効になります。

## Gradle

### AGP 9.0.0 のサポート

Compose Multiplatform は、Android Gradle Plugin (AGP) のバージョン 9.0.0 のサポートを導入しました。
新しい AGP バージョンとの互換性のために、Compose Multiplatform 1.9.3 または 1.10.0 へのアップグレードを確認してください。

長期的にアップデートプロセスをよりスムーズにするために、プロジェクト構造を変更して専用の Android アプリケーションモジュールを使用することをお勧めします。

## 依存関係

| ライブラリ | Maven 座標 | ベースとなる Jetpack バージョン |
|--------------------|------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| Runtime            | `org.jetbrains.compose.runtime:runtime*:1.10.3`                        | [Runtime 1.10.5](https://developer.android.com/jetpack/androidx/releases/compose-runtime#1.10.5)                                     |
| UI                 | `org.jetbrains.compose.ui:ui*:1.10.3`                                  | [UI 1.10.5](https://developer.android.com/jetpack/androidx/releases/compose-ui#1.10.5)                                               |
| Foundation         | `org.jetbrains.compose.foundation:foundation*:1.10.3`                  | [Foundation 1.10.5](https://developer.android.com/jetpack/androidx/releases/compose-foundation#1.10.5)                               |
| Material           | `org.jetbrains.compose.material:material*:1.10.3`                      | [Material 1.10.5](https://developer.android.com/jetpack/androidx/releases/compose-material#1.10.5)                                   |
| Material3          | `org.jetbrains.compose.material3:material3*:1.10.0-alpha05`            | [Material3 1.5.0-alpha08](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.5.0-alpha08)                   |
| Material3 Adaptive | `org.jetbrains.compose.material3.adaptive:adaptive*:1.3.0-alpha02`     | [Material3 Adaptive 1.3.0-alpha03](https://developer.android.com/jetpack/androidx/releases/compose-material3-adaptive#1.3.0-alpha03) |
| Lifecycle          | `org.jetbrains.androidx.lifecycle:lifecycle-*:2.10.0`                  | [Lifecycle 2.10.0](https://developer.android.com/jetpack/androidx/releases/lifecycle#2.10.0)                                         |
| Navigation         | `org.jetbrains.androidx.navigation:navigation-*:2.9.2`                 | [Navigation 2.9.7](https://developer.android.com/jetpack/androidx/releases/navigation#2.9.7)                                         |
| Navigation3        | `org.jetbrains.androidx.navigation3:navigation3-*:1.0.0-alpha06`       | [Navigation3 1.0.0](https://developer.android.com/jetpack/androidx/releases/navigation3#1.0.0)                                       |
| Navigation Event   | `org.jetbrains.androidx.navigationevent:navigationevent-compose:1.0.1` | [Navigation Event 1.0.2](https://developer.android.com/jetpack/androidx/releases/navigationevent#1.0.2)                              |
| Savedstate         | `org.jetbrains.androidx.savedstate:savedstate*:1.4.0`                  | [Savedstate 1.4.0](https://developer.android.com/jetpack/androidx/releases/savedstate#1.4.0)                                         |
| WindowManager Core | `org.jetbrains.androidx.window:window-core:1.5.1`                      | [WindowManager 1.5.1](https://developer.android.com/jetpack/androidx/releases/window#1.5.1)                                          |