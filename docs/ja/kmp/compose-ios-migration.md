[//]: # (title: iOS移行ガイド)

このページでは、プロジェクト内のCompose Multiplatformライブラリを新しいバージョン（1.7.0以降）へアップグレードする際の、iOSに関する考慮事項について説明します。

## Compose Multiplatform 1.6.11から1.7.0 {id="compose-multiplatform-1-6-11-to-1-7-0"}

### UIKitViewおよびUIKitViewControllerにおけるbackgroundパラメータの削除 {id="removed-background-parameter-in-uikitview-and-uikitviewcontroller"}

非推奨となった `UIKitView` および `UIKitViewController` APIには `background` パラメータがありましたが、新しいAPIにはありません。このパラメータは冗長であると判断され、削除されました。

* 新規インスタンスに対して相互運用ビュー（interop view）の背景を設定する必要がある場合は、`factory` パラメータを使用して設定できます。
* 背景を更新可能にする必要がある場合は、対応するコードを `update` ラムダ内に記述してください。

### タッチやジェスチャーが期待どおりに動作しなくなる場合がある {id="touches-or-gestures-may-stop-working-as-expected"}

新しいデフォルトの[タッチ動作](compose-ios-touch.md)では、タッチが相互運用ビュー向けのものか、そのビューのComposeコンテナ向けのものかを判定するために遅延が使用されます。相互運用ビューがタッチを受け取るには、ユーザーが少なくとも150ミリ秒間静止（長押し）する必要があります。

Compose Multiplatformで以前と同じようにタッチを処理させる必要がある場合は、新しい実験的な `UIKitInteropProperties` コンストラクタの利用を検討してください。
これには `interactionMode` パラメータがあり、`UIKitInteropInteractionMode.NonCooperative` に設定することで、Composeがタッチを相互運用ビューに直接渡すようになります。

このコンストラクタが実験的（experimental）とマークされているのは、最終的には相互運用ビューの操作性を単一のブール値フラグで記述できるようにすることを意図しているためです。
`interactionMode` パラメータで明示的に指定されている動作は、将来的には自動的に導出されるようになる可能性が高いです。

### accessibilityEnabledがisNativeAccessibilityEnabledに置き換わり、デフォルトでオフに {id="accessibilityenabled-replaced-by-isnativeaccessibilityenabled-and-turned-off-by-default"}

以前の `UIKitView` および `UIKitViewController` コンストラクタの `accessibilityEnabled` パラメータは移動および名前変更され、`UIKitInteropProperties.isNativeAccessibilityEnabled` プロパティとして利用できるようになりました。
また、デフォルトで `false` に設定されています。

`isNativeAccessibilityEnabled` プロパティは、マージされたComposeサブツリーにネイティブのアクセシビリティ解決の影響を及ぼします。
そのため、相互運用ビューのリッチなアクセシビリティ機能（Webビューなど）が必要な場合を除き、`true` に設定することは推奨されません。

このプロパティとそのデフォルト値の背景にある理由については、[`UIKitInteropProperties` クラスのコード内ドキュメント](https://github.com/JetBrains/compose-multiplatform-core/blob/jb-main/compose/ui/ui/src/uikitMain/kotlin/androidx/compose/ui/viewinterop/UIKitInteropProperties.uikit.kt)を参照してください。

### onResizeパラメータの削除 {id="onresize-parameter-removed"}

以前の `UIKitView` および `UIKitViewController` コンストラクタの `onResize` パラメータは、`rect` 引数に基づいてカスタムフレームを設定していましたが、Composeのレイアウト自体には影響を与えなかったため、直感的に使用できませんでした。
さらに、`onResize` パラメータのデフォルト実装は相互運用ビューのフレームを適切に設定する必要があり、ビューを適切にクリッピングするための実装の詳細が含まれていました。

`onResize` を使わずに対応する方法：

* 相互運用ビューのフレーム変更に対応する必要がある場合は、以下の方法があります：
    * 相互運用 `UIView` の [`layoutSubviews`](https://developer.apple.com/documentation/uikit/uiview/1622482-layoutsubviews) をオーバーライドする
    * 相互運用 `UIViewController` の [`viewDidLayoutSubviews`](https://developer.apple.com/documentation/uikit/uiviewcontroller/1621398-viewdidlayoutsubviews) をオーバーライドする
    * または、`Modifier` チェーンに `onGloballyPositioned` を追加する
* 相互運用ビューのフレームを設定する必要がある場合は、対応するCompose修飾子（`size`、`fillMaxSize` など）を使用してください。

### 一部のonReset使用パターンが無効化 {id="some-onreset-usage-patterns-were-invalidated"}

`remember { UIView() }` と一緒に非nullの `onReset` ラムダを使用することは誤りです。

次のコードを考えてみましょう：

```kotlin
val view = remember { UIView() }

UIKitView(factory = { view }, onReset = { /* ... */ })
```

`UIKitView` がコンポジションに入るとき、`factory` または `onReset` のいずれか一方が呼び出され、両方が呼び出されることはありません。
そのため、`onReset` がnullでない場合、rememberされた `view` は画面に表示されているビューと異なる可能性があります。
コンポーザブルがコンポジションから離脱する際、`factory` を使って新しいビューを割り当てる代わりに、`onReset` でリセットした後に再利用されるビューのインスタンスが残されることがあるためです。

このような間違いを避けるため、コンストラクタで `onReset` の値を指定しないでください。
ビューを出力する関数がコンポジションに入ったコンテキストに基づいて、相互運用ビュー内からコールバックを実行する必要がある場合があります。
その場合は、`onReset` ではなく `update` を使用してビュー内部にコールバックを保持することを検討してください。