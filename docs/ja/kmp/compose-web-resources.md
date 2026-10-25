[//]: # (title: Webリソースの取り扱い)

ここでは、ブラウザの機能や `preload` API を使用したリソースのプリロード、Web リソースのキャッシュ、および自動フォントフォールバックについて説明します。
  
## Webターゲット向けリソースのプリロード {id="preloading-of-resources-for-web-targets"}

フォントや画像などの Web リソースは、[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) を使用して非同期に読み込まれます。
初回読み込み時や低速なネットワーク接続環境下では、リソースの取得によって [FOUT](https://fonts.google.com/knowledge/glossary/fout) が発生したり、画像の代わりにプレースホルダーが表示されたりといった、表示上の不具合（ビジュアルグリッチ）が生じる可能性があります。

この問題の典型的な例は、`Text()` コンポーネントにカスタムフォントのテキストが含まれているものの、必要なグリフを持つフォントがまだ読み込み中である場合です。この場合、ユーザーには一時的にテキストがデフォルトのフォントで表示されたり、文字の代わりに空の四角形や疑問符が表示されたりすることがあります。同様に、画像や Drawable リソースについても、リソースが完全に読み込まれるまで空白や黒いボックスなどのプレースホルダーが表示されることがあります。

表示上の不具合を防ぐために、ブラウザ組み込みのリソースプリロード機能、Compose Multiplatform のプリロード API、またはその両方の組み合わせを使用できます。

### ブラウザ機能を使用したリソースのプリロード {id="preload-resources-using-browser-features"}

モダンブラウザでは、[`rel="preload"` 属性](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload) を指定した `<link>` タグを使用してリソースをプリロードできます。
この属性は、アプリケーションが開始される前にフォントや画像などのリソースを優先的にダウンロードしてキャッシュするようブラウザに指示し、これらのリソースを早期に利用できるようにします。

例えば、ブラウザ内でのフォントのプリロードを有効にするには、次のようにします：

1. アプリケーションの Web 配信パッケージをビルドします：

    ```console
       ./gradlew :shared:wasmJsBrowserDistribution
    ```

2. 生成された `dist` ディレクトリから必要なリソースを見つけ、そのパスを控えておきます。
3. `wasmJsMain/resources/index.html` ファイルを開き、`<head>` 要素内に `<link>` タグを追加します。
4. `href` 属性にリソースのパスを設定します：

```html
<link rel="preload" href="./composeResources/username.shared.generated.resources/font/FiraMono-Regular.ttf" as="fetch" type="font/ttf" crossorigin/>
```

### Compose Multiplatform プリロード API を使用したリソースのプリロード {id="preload-resources-using-the-compose-multiplatform-preload-api"}

ブラウザでリソースをプリロードした場合でも、それらは生のバイトデータとしてキャッシュされているため、`FontResource` や `DrawableResource` などのレンダリングに適したフォーマットへ変換する必要があります。アプリケーションが初めてリソースを要求したときにこの変換が非同期に行われるため、再びちらつきが発生する可能性があります。ユーザー体験をさらに最適化するために、Compose Multiplatform のリソースには高レベルなリソース表現のための独自の内部キャッシュがあり、これもプリロードできます。

Compose Multiplatform 1.8.0 では、Web ターゲットでフォントおよび画像リソースをプリロードするための API として、`preloadFont()`、`preloadImageBitmap()`、`preloadImageVector()` が導入されました。

レンダリング中に未解決の文字（グリフがない文字）に遭遇した場合、不足している文字を含むフォールバックフォントが[自動的にダウンロードされる](#automatic-font-fallback)ため、絵文字などの特殊文字も標準でサポートされます。

自動的なフォールバックフォントに頼らず、どのフォールバックフォントを使用するかを制御したい場合は、`FontFamily.Resolver.preload()` メソッドを使用して手動で指定します。
Web ターゲットは、TTF、OTF、TTC、バリアブルフォント、および WOFF/WOFF2 のフォント形式をサポートしています。

次の例は、ベクター画像のプリロードを使用する方法を示しています：

```kotlin
@Composable
fun App() {
    val icon by preloadImageVector(Res.drawable.heavy_vector_icon)

    if (icon != null) {
        MainScreen()
    } else {
        Box(modifier = Modifier.fillMaxSize()) {
            CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
        }
    }
}

@Composable
fun MainScreen() {
    // アイコンはキャッシュから読み込まれます
    Image(painter = painterResource(Res.drawable.heavy_vector_icon), contentDescription = null)
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="val icon by preloadImageVector(Res.drawable.heavy_vector_icon)"}

## 自動フォントフォールバック {id="automatic-font-fallback"}
<primary-label ref="Experimental"/>

デフォルトでは、アプリケーションの読み込み済みフォントでカバーされていない文字は、代替グリフ（「[tofu（豆腐）](https://fonts.google.com/knowledge/glossary/tofu)」として知られる □）として表示されます。

バージョン 1.12.0 以降、Compose Multiplatform はレンダリング中に未解決の文字を監視し、必要な Noto フォントのサブセットをオンデマンドでダウンロードします。
Noto という名前は「no tofu」の略であり、これらのフォントは豆腐グリフを排除するために設計されています。

フォントが利用可能になると、影響を受けるテキストが再コンポーズされます。
なお、ダウンロード中には一時的に豆腐グリフが表示される場合があることに注意してください。

CJK（中国語、日本語、韓国語）文字については、ブラウザの言語設定に基づいて適切なフォントバリアントが自動的に選択されます。

## Webリソースのキャッシュ {id="caching-web-resources"}
<primary-label ref="Experimental"/>

Compose Multiplatform は [Web Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache) を使用して成功したレスポンスをキャッシュし、ブラウザのデフォルトのキャッシュ機構によって通常行われる冗長な HTTP 再検証を回避します。

キャッシュは、アプリの起動ごと、およびページの再読み込みごとにグローバルにクリアされます。
複数のセッションにまたがってキャッシュを再利用すると、古くなったり互換性がなくなったりしたリソースによってアプリケーションのクラッシュや論理的な不整合が発生する可能性があるため、このタイミングでキャッシュをリセットしてリソースの一貫性を確保します。

同一リソースに対する重複した同時フェッチを防ぐために、この実装ではリソース固有のロックが使用されます。
各リクエストはリソースごとのミューテックスによって保護されているため、異なるリソースに対するリクエストは並列して実行しつつ、同じパスに対する重複リクエストは直列化されます。
この設計により、不要なネットワークトラフィックが最小限に抑えられ、キャッシュ格納時の競合状態が排除されます。

## 次のステップ {id="what-s-next"}

* [リソースのセットアップ](compose-multiplatform-resources-setup.md)および[アプリでのリソースの使用](compose-multiplatform-resources-usage.md)についてさらに詳しく確認してください。
* アプリ内のテーマや言語など、アプリケーションの[リソース環境](compose-resource-environment.md)を管理する方法について学びましょう。