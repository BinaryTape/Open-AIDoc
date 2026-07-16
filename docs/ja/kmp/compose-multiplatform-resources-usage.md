[//]: # (title: アプリでマルチプラットフォームリソースを使用する)

<show-structure depth="2"/>

[プロジェクトのリソースを設定](compose-multiplatform-resources-setup.md)したら、プロジェクトをビルドして、リソースへのアクセスを提供する特別な `Res` クラスを生成します。
`Res` クラスとすべてのリソースアクセッサを再生成するには、プロジェクトを再度ビルドするか、IDE でプロジェクトを再インポートしてください。

その後、生成されたクラスを使用して、コードまたは外部ライブラリから設定済みのマルチプラットフォームリソースにアクセスできます。

以下のトピックの詳細については、続きをお読みください。

* [生成された `Res` クラスとアクセッサのインポート](#importing-the-generated-class)
* [アクセッサクラス生成のカスタマイズ](#customizing-accessor-class-generation): 公開設定にする方法、パッケージの割り当て、または無条件に生成する方法。
* 特定のリソースタイプの操作: 
  * [ドローアブルリソース](#images): 単純な画像、ラスタライズされた画像、XML ベクターなど
  * [ベクター Android XML アイコン](#icons): Material Symbols ライブラリから
  * [文字列](#strings): 単純な文字列、テンプレート、配列、複数形など
  * [カスタムフォントの保存と読み込み](#fonts)
  * [Raw ファイル](#raw-files)とバイト配列の画像への変換
* [文字列 ID でマップされたリソースへのアクセス](#generated-maps-for-resources-and-string-ids)
* [マルチプラットフォームリソースを Android アセットとして使用する](#compose-multiplatform-resources-as-android-assets)
* Web 固有のリソースの処理:
  * ブラウザ機能と preload API を使用した[リソースのプリロード](compose-web-resources.md#preloading-of-resources-for-web-targets)
  * [Web リソースのキャッシング](compose-web-resources.md#caching-web-resources)
* 外部リソースの操作: 
  [外部ライブラリから](#accessing-multiplatform-resources-from-external-libraries)、
  [リモートファイル](#remote-files)、および [Java リソース](#using-java-resources)

## 生成されたクラスのインポート

用意したリソースを使用するには、生成されたクラスをインポートします。例：

```kotlin
import project.composeapp.generated.resources.Res
import project.composeapp.generated.resources.example_image
```

ここで：
* `project` はプロジェクトの名前です。
* `composeapp` はリソースディレクトリを配置したモジュールです。
* `Res` は生成されたクラスのデフォルト名です。
* `example_image` は `composeResources/drawable` ディレクトリにある画像ファイルの名前です（例：`example_image.png`）。

## アクセッサクラス生成のカスタマイズ

Gradle の設定を使用して、ニーズに合わせて生成される `Res` クラスをカスタマイズできます。

`build.gradle.kts` ファイルの `compose.resources {}` ブロックで、プロジェクトの `Res` クラスの生成方法に影響を与えるいくつかの設定を指定できます。
設定例は以下のようになります。

```kotlin
compose.resources {
    publicResClass = false
    packageOfResClass = "me.sample.library.resources"
    generateResClass = auto
}
```

* `publicResClass` を `true` に設定すると、生成された `Res` クラスが公開（public）されます。デフォルトでは、生成されたクラスは [internal](https://kotlinlang.org/docs/visibility-modifiers.html) です。
* `packageOfResClass` を使用すると、生成された `Res` クラスを特定のパッケージに割り当てることができます（コード内でのアクセスや、最終的なアーティファクトでの分離のため）。デフォルトでは、Compose Multiplatform はクラスに `{group name}.{module name}.generated.resources` パッケージを割り当てます。
* `generateResClass` を `always` に設定すると、プロジェクトは無条件に `Res` クラスを生成します。これは、リソースライブラリが推移的にのみ利用可能な場合に役立つことがあります。デフォルトでは、Compose Multiplatform は `auto` 値を使用し、現在のプロジェクトがリソースライブラリに対して明示的な `implementation` または `api` 依存関係を持っている場合にのみ `Res` クラスを生成します。

## リソースの使用方法

### 画像

ドローアブル（drawable）リソースには、単純な画像、ラスタライズされた画像、または XML ベクターとしてアクセスできます。
SVG 画像は、Android **以外**のすべてのプラットフォームでサポートされています。

* ドローアブルリソースに `Painter` 画像としてアクセスするには、`painterResource()` 関数を使用します。

  ```kotlin
  @Composable
  fun painterResource(resource: DrawableResource): Painter {...}
  ```

  `painterResource()` 関数はリソースパスを受け取り、`Painter` 値を返します。この関数は、Web ターゲットを除いてすべてのターゲットで同期的に動作します。Web ターゲットの場合、最初の再コンポーズ（recomposition）では空の `Painter` を返し、その後の再コンポーズで読み込まれた画像に置き換えられます。

  * `painterResource()` は、`.png`、`.jpg`、`.bmp`、`.webp` などのラスタライズされた画像形式の場合は `BitmapPainter` を、Android XML ベクタードローアブル形式の場合は `VectorPainter` をロードします。
  * XML ベクタードローアブルは [Android](https://developer.android.com/reference/android/graphics/drawable/VectorDrawable) と同じ形式ですが、Android リソースへの外部参照はサポートしていません。

* ドローアブルリソースに `ImageBitmap` ラスタライズ画像としてアクセスするには、`imageResource()` 関数を使用します。

  ```kotlin
  @Composable
  fun imageResource(resource: DrawableResource): ImageBitmap {...}
  ```

* ドローアブルリソースに `ImageVector` XML ベクターとしてアクセスするには、`vectorResource()` 関数を使用します。

  ```kotlin
  @Composable
  fun vectorResource(resource: DrawableResource): ImageVector {...}
  ```

Compose Multiplatform コードで画像にアクセスする方法の例を次に示します。

```kotlin
Image(
    painter = painterResource(Res.drawable.my_image),
    contentDescription = null
)
```

### アイコン

Material Symbols ライブラリのベクター Android XML アイコンを使用できます。

1. [Google Fonts Icons](https://fonts.google.com/icons) ギャラリーを開き、アイコンを選択し、Android タブに移動して **Download** をクリックします。

2. ダウンロードした XML アイコンファイルを、マルチプラットフォームリソースの `drawable` ディレクトリに追加します。

3. XML アイコンファイルを開き、`android:fillColor` を `#000000` に設定します。
   `android:tint` のような色調整のための他の Android 固有の属性を削除します。

   変更前:

   ```xml
   <vector xmlns:android="http://schemas.android.com/apk/res/android"
        android:width="24dp"
        android:height="24dp"
        android:viewportWidth="960"
        android:viewportHeight="960"
        android:tint="?attr/colorControlNormal">
        <path
            android:fillColor="@android:color/white"
            android:pathData="..."/>
    </vector>
   ```
   
   変更後:

   ```xml
   <vector xmlns:android="http://schemas.android.com/apk/res/android"
        android:width="24dp"
        android:height="24dp"
        android:viewportWidth="960"
        android:viewportHeight="960">
        <path
            android:fillColor="#000000"
            android:pathData="..."/>
   </vector>
   ```
   
4. プロジェクトをビルドしてリソースアクセッサを生成するか、[Kotlin Multiplatform IDE プラグイン](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)に自動的に処理させます。

Compose Multiplatform コードでアイコンにアクセスし、`colorFilter` パラメータを使用して色を調整する方法の例を次に示します。

```kotlin
Image(
    painter = painterResource(Res.drawable.ic_sample_icon),
    contentDescription = "Sample icon",
    modifier = Modifier.size(24.dp),
    colorFilter = ColorFilter.tint(Color.Blue)
)
```

### 文字列

すべての文字列リソースは `composeResources/values` ディレクトリの XML ファイルに保存します。
各ファイルの各アイテムに対して静的アクセッサが生成されます。

Compose Multiplatform は、XML ファイルに直接文字列リソース、文字列配列、複数形を追加するための、Emmet のような短縮構文をサポートしています。
たとえば、`strings.xml` で `test{Example}` または `s.test{Example}` と入力して **Tab** を押すと、自動的に `<string name="test">Example</string>` に展開されます。

異なるロケール用に文字列をローカライズする方法の詳細については、[文字列のローカライズに関するガイド](compose-localize-strings.md)を参照してください。

#### 単純な文字列

単純な文字列を保存するには、XML に `<string>` 要素を追加します。

```XML
<resources>
    <string name="app_name">My awesome app</string>
    <string name="title">Some title</string>
</resources>
```

文字列リソースを `String` として取得するには、次のコードを使用します。

<Tabs>
<TabItem title= "コンポーザブルコードから">

```kotlin
@Composable
fun stringResource(resource: StringResource): String {...}

@Composable
fun stringResource(resource: StringResource, vararg formatArgs: Any): String {...}
```

例：

```kotlin
Text(stringResource(Res.string.app_name))
```

</TabItem>
<TabItem title= "非コンポーザブルコードから">

```kotlin
suspend fun getString(resource: StringResource): String

suspend fun getString(resource: StringResource, vararg formatArgs: Any): String
```

例：

```kotlin
coroutineScope.launch {
    val appName = getString(Res.string.app_name)
}
```

</TabItem>
</Tabs>

文字列リソースでは特殊記号を使用できます。

* `
` – 改行
* `\t` – タブ記号
* `\uXXXX` – 特定の Unicode 文字

[Android の文字列](https://developer.android.com/guide/topics/resources/string-resource#escaping_quotes)のように、"@" や "?" などの特殊な XML 文字をエスケープする必要はありません。

> Emmet のような構文を使用し、**Tab** を押して省略形を文字列タグに展開します:
> * `test` → `<string name="test"></string>`
> * `test{Example}` → `<string name="test">Example</string>`
>
{style="note"}

#### 文字列テンプレート

現在、引数は文字列リソースに対して基本的なサポートを提供しています。
テンプレートを作成するときは、`%<number>` 形式を使用して文字列内に引数を配置し、単純なテキストではなく変数のプレースホルダーであることを示すために `$d` または `$s` 接尾辞を含めます。
例：

```XML
<resources>
    <string name="str_template">Hello, %2$s! You have %1$d new messages.</string>
</resources>
```

文字列テンプレートリソースを作成してインポートした後、プレースホルダーの引数を正しい順序で渡しながら参照できます。

```kotlin
Text(stringResource(Res.string.str_template, 100, "User_name"))
```

`$s` と `$d` 接尾辞の間に違いはなく、他の接尾辞はサポートされていません。
リソース文字列に `%1$s` プレースホルダーを配置し、それを使用して端数を表示することもできます。例：

```kotlin
Text(stringResource(Res.string.str_template, "User_name", 100.1f))
```

> プレースホルダーのために `%1$s` や `%2$d` を手動で入力する代わりに、インラインの数字ショートカットを使用できます。
> たとえば、文字列値の中で `1` または `1s` と入力すると `%1$s` に展開されます。
> 同様に、`2d` と入力すると `%2$d` に展開されます。
> 
{style="note"}

#### 文字列配列

関連する文字列を配列にグループ化し、`List<String>` オブジェクトとして自動的にアクセスできます。

```XML
<resources>
    <string name="app_name">My awesome app</string>
    <string name="title">Some title</string>
    <string-array name="str_arr">
        <item>item \u2605</item>
        <item>item \u2318</item>
        <item>item \u00BD</item>
    </string-array>
</resources>
```

対応するリストを取得するには、次のコードを使用します。

<Tabs>
<TabItem title= "コンポーザブルコードから">

```kotlin
@Composable
fun stringArrayResource(resource: StringArrayResource): `List<String>` {...}
```

例：

```kotlin
val arr = stringArrayResource(Res.array.str_arr)
if (arr.isNotEmpty()) Text(arr[0])
```

</TabItem>
<TabItem title= "非コンポーザブルコードから">

```kotlin
suspend fun getStringArray(resource: StringArrayResource): List<String>
```

例：

```kotlin
coroutineScope.launch {
    val appName = getStringArray(Res.array.str_arr)
}
```

</TabItem>
</Tabs>

> Emmet のような構文を使用して、文字列配列をすばやく定義できます。
> `string-array`、`sa`、または `>` オペレーターを使用して、空の配列テンプレートを生成します。
> 名前付きの配列で、定義済みのアイテム数と開始テキストを指定するには、`test>2{Hello}` と入力して **Tab** を押します。
> ```xml
> <string-array name="test">
>    <item>Hello</item>
>    <item>Hello</item>
> </string-array>
> ```
>
{style="note"}

#### 複数形（Plurals）

UI に何らかの数量を表示する場合、プログラム的に無関係な文字列を作成することなく、同じものの異なる数（1冊の _book_、多数の _books_ など）に対する文法的な一致をサポートしたい場合があります。

Compose Multiplatform における概念と基本実装は、Android の数量文字列（quantity strings）と同じです。
プロジェクトで複数形を使用する場合のベストプラクティスやニュアンスの詳細については、[Android ドキュメント](https://developer.android.com/guide/topics/resources/string-resource#Plurals)を参照してください。

* サポートされているバリアントは、`zero`、`one`、`two`、`few`、`many`、および `other` です。すべてのバリアントがすべての言語で考慮されるわけではないことに注意してください。たとえば、英語では `zero` は 1 以外の他の複数形と同じであるため無視されます。言語が実際にどのような区別を要求するかを知るには、言語の専門家に頼ってください。
* 多くの場合、「Books: 1」のような数量に依存しない表現を使用することで、数量文字列を回避できます。これによりユーザーエクスペリエンスが悪化しない場合は、その方法を検討してください。

複数形を定義するには、`composeResources/values` ディレクトリにある任意の `.xml` ファイルに `<plurals>` 要素を追加します。
`plurals` コレクションは、name 属性（XML ファイルの名前ではない）を使用して参照される単純なリソースです。
そのため、1つの XML ファイル内の1つの `<resources>` 要素の下で、`plurals` リソースを他の単純なリソースと組み合わせることができます。

```xml
<resources>
    <string name="app_name">My awesome app</string>
    <string name="title">Some title</string>
    <plurals name="new_message">
        <item quantity="one">%1$d new message</item>
        <item quantity="other">%1$d new messages</item>
    </plurals>
</resources>
```

複数形を `String` として取得するには、次のコードを使用します。

<Tabs>
<TabItem title= "コンポーザブルコードから">

```kotlin
@Composable
fun pluralStringResource(resource: PluralStringResource, quantity: Int): String {...}

@Composable
fun pluralStringResource(resource: PluralStringResource, quantity: Int, vararg formatArgs: Any): String {...}
```

例：

```kotlin
Text(pluralStringResource(Res.plurals.new_message, 1, 1))
```

</TabItem>
<TabItem title= "非コンポーザブルコードから">

```kotlin
suspend fun getPluralString(resource: PluralStringResource, quantity: Int): String

suspend fun getPluralString(resource: PluralStringResource, quantity: Int, vararg formatArgs: Any): String
```

例：

```kotlin
coroutineScope.launch {
    val appName = getPluralString(Res.plurals.new_message, 1, 1)
}
```

</TabItem>
</Tabs>

> Emmet のような構文を使用して、複数形リソースを生成できます。
> たとえば、`plurals`、`p`、または `:` を使用して、デフォルトの空の文字列テンプレートを生成します。
> `values-en/strings.xml` で作業している場合、IDE はロケール、必要な数量、および英語には `one` と `other` のみが必要であることを自動的に検出します。
> `p.test` または `plurals.test` と入力して **Tab** を押すと、省略形が `plurals` ブロックに展開されます。
> ```xml
> <plurals name="test">
>     <item quantity="one"></item>
>     <item quantity="other"></item>
> </plurals>
> ```
>
{style="note"}

### フォント

カスタムフォントは `composeResources/font` ディレクトリに `*.ttf` または `*.otf` ファイルとして保存します。

フォントを `Font` 型としてロードするには、`Font()` コンポーザブル関数を使用します。

```kotlin
@Composable
fun Font(
    resource: FontResource,
    weight: FontWeight = FontWeight.Normal,
    style: FontStyle = FontStyle.Normal
): Font
```

例：

```kotlin
@Composable
private fun InterTypography(): Typography {
    val interFont = FontFamily(
        Font(Res.font.Inter_24pt_Regular, FontWeight.Normal),
        Font(Res.font.Inter_24pt_SemiBold, FontWeight.Bold),
    )

    return with(MaterialTheme.typography) {
        copy(
            displayLarge = displayLarge.copy(fontFamily = interFont, fontWeight = FontWeight.Bold),
            displayMedium = displayMedium.copy(fontFamily = interFont, fontWeight = FontWeight.Bold),
            displaySmall = displaySmall.copy(fontFamily = interFont, fontWeight = FontWeight.Bold),
            headlineLarge = headlineLarge.copy(fontFamily = interFont, fontWeight = FontWeight.Bold),
            headlineMedium = headlineMedium.copy(fontFamily = interFont, fontWeight = FontWeight.Bold),
            headlineSmall = headlineSmall.copy(fontFamily = interFont, fontWeight = FontWeight.Bold),
            titleLarge = titleLarge.copy(fontFamily = interFont, fontWeight = FontWeight.Bold),
            titleMedium = titleMedium.copy(fontFamily = interFont, fontWeight = FontWeight.Bold),
            titleSmall = titleSmall.copy(fontFamily = interFont, fontWeight = FontWeight.Bold),
            labelLarge = labelLarge.copy(fontFamily = interFont, fontWeight = FontWeight.Normal),
            labelMedium = labelMedium.copy(fontFamily = interFont, fontWeight = FontWeight.Normal),
            labelSmall = labelSmall.copy(fontFamily = interFont, fontWeight = FontWeight.Normal),
            bodyLarge = bodyLarge.copy(fontFamily = interFont, fontWeight = FontWeight.Normal),
            bodyMedium = bodyMedium.copy(fontFamily = interFont, fontWeight = FontWeight.Normal),
            bodySmall = bodySmall.copy(fontFamily = interFont, fontWeight = FontWeight.Normal),
        )
    }
}
```

{initial-collapse-state="collapsed" collapsible="true" collapsed-title="@Composable private fun InterTypography(): Typography { val interFont = FontFamily("}

> `Font` がコンポーザブルである場合、`TextStyle` や `Typography` などの依存コンポーネントもコンポーザブルであることを確認してください。
>
{style="note"}

Web ターゲットで絵文字やアラビア文字などの特殊文字をサポートするには、対応するフォントをリソースに追加し、[フォールバックフォントをプリロード](compose-web-resources.md#preload-resources-using-the-compose-multiplatform-preload-api)する必要があります。

### Raw ファイル

任意の Raw ファイルをバイト配列としてロードするには、`Res.readBytes(path)` 関数を使用します。

```kotlin
suspend fun readBytes(path: String): ByteArray
```

Raw ファイルは `composeResources/files` ディレクトリに配置でき、その中に任意の階層を作成できます。

たとえば、Raw ファイルにアクセスするには、次のコードを使用します。

<Tabs>
<TabItem title= "コンポーザブルコードから">

```kotlin
var bytes by remember {
    mutableStateOf(ByteArray(0))
}
LaunchedEffect(Unit) {
    bytes = Res.readBytes("files/myDir/someFile.bin")
}
Text(bytes.decodeToString())
```

</TabItem>
<TabItem title= "非コンポーザブルコードから">

```kotlin
coroutineScope.launch {
    val bytes = Res.readBytes("files/myDir/someFile.bin")
}
```

</TabItem>
</Tabs>

#### バイト配列を画像に変換する

読み取っているファイルがビットマップ（JPEG、PNG、BMP、WEBP）または XML ベクター画像である場合、次の関数を使用して、`Image()` コンポーザブルに適した `ImageBitmap` または `ImageVector` オブジェクトに変換できます。

[Raw ファイル](#raw-files)セクションで示したように Raw ファイルにアクセスし、その結果をコンポーザブルに渡します。

```kotlin
// bytes = Res.readBytes("files/example.png")
Image(bytes.decodeToImageBitmap(), null)

// bytes = Res.readBytes("files/example.xml")
Image(bytes.decodeToImageVector(LocalDensity.current), null)
```

Android 以外のすべてのプラットフォームでは、SVG ファイルを `Painter` オブジェクトに変換することもできます。

```kotlin
// bytes = Res.readBytes("files/example.svg")
Image(bytes.decodeToSvgPainter(LocalDensity.current), null)
```

### 生成されたリソースと文字列 ID のマップ

アクセスの便宜上、Compose Multiplatform はリソースを文字列 ID ともマップします。ファイル名をキーとして使用してアクセスできます。

```kotlin
val Res.allDrawableResources: Map<String, DrawableResource>
val Res.allStringResources: Map<String, StringResource>
val Res.allStringArrayResources: Map<String, StringArrayResource>
val Res.allPluralStringResources: Map<String, PluralStringResource>
val Res.allFontResources: Map<String, FontResource>
```

マップされたリソースをコンポーザブルに渡す例：

```kotlin
Image(painterResource(Res.allDrawableResources["compose_multiplatform"]!!), null)
```

### Compose Multiplatform リソースを Android アセットとして使用する

Compose Multiplatform 1.7.0 以降、すべてのマルチプラットフォームリソースは Android アセットにパックされます。これにより、Android Studio は Android ソースセット内の Compose Multiplatform コンポーザブルのプレビューを生成できるようになります。

> Android Studio プレビューは、Android ソースセット内のコンポーザブルでのみ利用可能です。
> また、最新バージョンの AGP（8.5.2、8.6.0-rc01、または 8.7.0-alpha04）のいずれかが必要です。
>
{style="warning"}

マルチプラットフォームリソースを Android アセットとして使用すると、Android 上の WebView やメディアプレーヤーコンポーネントからの直接アクセスも可能になります。リソースは単純なパス、例えば `Res.getUri("files/index.html")` で到達できるためです。

リソース画像へのリンクが含まれたリソース HTML ページを表示する Android コンポーザブルの例：

```kotlin
// androidMain/kotlin/com/example/webview/App.kt
@OptIn(ExperimentalResourceApi::class)
@Composable
@Preview
fun App() {
    MaterialTheme {
        val uri = Res.getUri("files/webview/index.html")

        // Adding a WebView inside AndroidView with layout as full screen.
        AndroidView(factory = {
            WebView(it).apply {
                layoutParams = ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )
            }
        }, update = {
            it.loadUrl(uri)
        })
    }
}
```
{initial-collapse-state="collapsed" collapsible="true"  collapsed-title="AndroidView(factory = { WebView(it).apply"}

この例は、次の単純な HTML ファイルで動作します。

```html
<html>
<header>
    <title>
        Cat Resource
    </title>
</header>
<body>
    <img src="cat.jpg">
</body>
</html>
```
{initial-collapse-state="collapsed" collapsible="true"  collapsed-title="<title>Cat Resource</title>"}

この例の両方のリソースファイルは、`commonMain` ソースセットに配置されています。

![composeResources ディレクトリのファイル構造](compose-resources-android-webview.png){width="230"}

## 他のライブラリやリソースとの相互作用

### 外部ライブラリからマルチプラットフォームリソースへのアクセス

プロジェクトに含まれる他のライブラリを使用してマルチプラットフォームリソースを処理したい場合は、プラットフォーム固有のファイルパスをそれらの API に渡すことができます。
プラットフォーム固有のパスを取得するには、リソースへのプロジェクトパスを指定して `Res.getUri()` 関数を呼び出します。

```kotlin
val uri = Res.getUri("files/my_video.mp4")
```

`uri` 変数にはファイルへの絶対パスが含まれるようになり、外部ライブラリはそのパスを使用して、自身に適した方法でファイルにアクセスできます。

Android 固有の使用法については、マルチプラットフォームリソースも [Android アセットとしてパック](#compose-multiplatform-resources-as-android-assets)されています。

### リモートファイル

リソースライブラリのコンテキストでは、アプリケーションの一部であるファイルのみがリソースと見なされます。

専用のライブラリを使用して、URL からインターネット上のリモートファイルをロードできます。

* [Compose ImageLoader](https://github.com/qdsfdhvh/compose-imageloader)
* [Kamel](https://github.com/Kamel-Media/Kamel)
* [Ktor client](https://ktor.io/)

### Java リソースの使用

Compose Multiplatform で Java リソースを使用することはできますが、生成されたアクセッサ、マルチモジュールサポート、ローカライズなどのフレームワークが提供する拡張機能の恩恵を受けることはできません。その可能性を最大限に引き出すために、マルチプラットフォームリソースライブラリへの完全な移行を検討してください。

Compose Multiplatform 1.7.0 では、`compose.ui` パッケージで利用可能なリソース API は非推奨になりました。引き続き Java リソースを操作する必要がある場合は、Compose Multiplatform 1.7.0 以上にアップグレードした後もコードが動作するように、プロジェクトに次の実装をコピーしてください。

```kotlin
@Composable
internal fun painterResource(
    resourcePath: String
): Painter = when (resourcePath.substringAfterLast(".")) {
    "svg" -> rememberSvgResource(resourcePath)
    "xml" -> rememberVectorXmlResource(resourcePath)
    else -> rememberBitmapResource(resourcePath)
}

@Composable
internal fun rememberBitmapResource(path: String): Painter {
    return remember(path) { BitmapPainter(readResourceBytes(path).decodeToImageBitmap()) }
}

@Composable
internal fun rememberVectorXmlResource(path: String): Painter {
    val density = LocalDensity.current
    val imageVector = remember(density, path) { readResourceBytes(path).decodeToImageVector(density) }
    return rememberVectorPainter(imageVector)
}

@Composable
internal fun rememberSvgResource(path: String): Painter {
    val density = LocalDensity.current
    return remember(density, path) { readResourceBytes(path).decodeToSvgPainter(density) }
}

private object ResourceLoader
private fun readResourceBytes(resourcePath: String) =
    ResourceLoader.javaClass.classLoader.getResourceAsStream(resourcePath).readAllBytes()
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="internal fun painterResource(resourcePath: String): Painter"}

## 次のステップ

* iOS、Android、デスクトップをターゲットとした Compose Multiplatform プロジェクトでリソースを処理する方法を示す公式の [デモプロジェクト](https://github.com/JetBrains/compose-multiplatform/tree/master/components/resources/demo) を確認してください。
* アプリ内のテーマや言語などのアプリケーションの [リソース環境](compose-resource-environment.md) を管理する方法を学びましょう。