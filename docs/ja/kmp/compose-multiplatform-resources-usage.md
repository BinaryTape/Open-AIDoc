[//]: # (title: アプリでのマルチプラットフォームリソースの使用)

<show-structure depth="2"/>

[プロジェクトのリソースをセットアップ](compose-multiplatform-resources-setup.md)したら、プロジェクトをビルドして、リソースへのアクセスを提供する特別な `Res` クラスを生成します。
`Res` クラスとすべてのリソースアクセサを再生成するには、プロジェクトを再度ビルドするか、IDEでプロジェクトを再インポートします。

その後、生成されたクラスを使用して、コード内や外部ライブラリから設定されたマルチプラットフォームリソースにアクセスできるようになります。

以下のトピックについての詳細は、読み進めて確認してください。

* [生成された `Res` クラスとアクセサのインポート](#importing-the-generated-class)
* [アクセサクラス生成のカスタマイズ](#customizing-accessor-class-generation): publicにする方法、パッケージの割り当て、無条件での生成など。
* 特定のリソースタイプの操作:
  * 単純な画像、ラスタライズ画像、XMLベクターなどの[Drawableリソース](#images)。
  * Material Symbolsライブラリの[ベクターAndroid XMLアイコン](#icons)。
  * 単純な文字列、テンプレート、配列、複数形を含む[文字列](#strings)。
  * [カスタムフォントの保存と読み込み](#fonts)。
  * [Rawファイル](#raw-files)およびバイト配列の画像への変換。
* [文字列IDにマッピングされたリソースへのアクセス](#generated-maps-for-resources-and-string-ids)。
* [マルチプラットフォームリソースをAndroidアセットとして使用](#compose-multiplatform-resources-as-android-assets)。
* Web固有のリソースの処理:
  * ブラウザ機能とpreload APIを使用した[リソースの事前読み込み（プリロード）](compose-web-resources.md#preloading-of-resources-for-web-targets)。
  * 欠落している文字に対する[自動フォントフォールバック](compose-web-resources.md#automatic-font-fallback)。
  * [Webリソースのキャッシュ](compose-web-resources.md#caching-web-resources)。
* 外部リソースの操作: 
  [外部ライブラリから](#accessing-multiplatform-resources-from-external-libraries)、
  [リモートファイル](#remote-files)、および[Javaリソース](#using-java-resources)。

## 生成されたクラスのインポート {id="importing-the-generated-class"}

準備したリソースを使用するには、生成されたクラスをインポートします。例:

```kotlin
import project.shared.generated.resources.Res
import project.shared.generated.resources.example_image
```

ここで:
* `project` はプロジェクトの名前です
* `shared` はリソースディレクトリを配置したモジュールです
* `Res` は生成されたクラスのデフォルト名です
* `example_image` は `composeResources/drawable` ディレクトリ内の画像ファイルの名前です（例: `example_image.png`）。

## アクセサクラス生成のカスタマイズ {id="customizing-accessor-class-generation"}

Gradle設定を使用して、ニーズに合わせて生成される `Res` クラスをカスタマイズできます。

`build.gradle.kts` ファイルの `compose.resources {}` ブロック内で、プロジェクトに対する `Res` クラスの生成方法に影響を与えるいくつかの設定を指定できます。
設定例は以下のようになります。

```kotlin
compose.resources {
    publicResClass = false
    packageOfResClass = "me.sample.library.resources"
    generateResClass = auto
}
```

* `publicResClass` を `true` に設定すると、生成される `Res` クラスがpublicになります。デフォルトでは、生成されるクラスは [internal](https://kotlinlang.org/docs/visibility-modifiers.html) です。
* `packageOfResClass` を使用すると、生成される `Res` クラスを特定のパッケージに割り当てることができます（コード内からのアクセスのため、また最終成果物内での分離のため）。デフォルトでは、Compose Multiplatform はクラスに `{group name}.{module name}.generated.resources` パッケージを割り当てます。
* `generateResClass` を `always` に設定すると、プロジェクトで無条件に `Res` クラスが生成されるようになります。これは、リソースライブラリが推移的（transitively）にしか利用できない場合に役立ちます。デフォルトでは、Compose Multiplatform は `auto` 値を使用し、現在のプロジェクトがリソースライブラリに対して明示的な `implementation` または `api` 依存関係を持っている場合にのみ `Res` クラスを生成します。

## リソースの使用 {id="resource-usage"}

### 画像 {id="images"}

単純な画像、ラスタライズ画像、またはXMLベクターとしてDrawableリソースにアクセスできます。
SVG画像は、Androidを**除く**すべてのプラットフォームでサポートされています。

* Drawableリソースに `Painter` 画像としてアクセスするには、`painterResource()` 関数を使用します。

  ```kotlin
  @Composable
  fun painterResource(resource: DrawableResource): Painter {...}
  ```

  `painterResource()` 関数はリソースパスを受け取り、`Painter` 値を返します。この関数はWebを除くすべてのターゲットで同期的に動作します。Webターゲットの場合、最初の再コンポジション（recomposition）では空の `Painter` を返し、その後の再コンポジションで読み込まれた画像に置き換わります。

  * `painterResource()` は、`.png`、`.jpg`、`.bmp`、`.webp` などのラスタライズ画像形式には `BitmapPainter` を、Android XMLベクタードローアブル形式には `VectorPainter` を読み込みます。
  * XMLベクタードローアブルは [Android](https://developer.android.com/reference/android/graphics/drawable/VectorDrawable) と同じ形式ですが、Androidリソースへの外部参照はサポートされていません。

* Drawableリソースに `ImageBitmap` ラスタライズ画像としてアクセスするには、`imageResource()` 関数を使用します。

  ```kotlin
  @Composable
  fun imageResource(resource: DrawableResource): ImageBitmap {...}
  ```

* Drawableリソースに `ImageVector` XMLベクターとしてアクセスするには、`vectorResource()` 関数を使用します。

  ```kotlin
  @Composable
  fun vectorResource(resource: DrawableResource): ImageVector {...}
  ```

Compose Multiplatformコードで画像にアクセスする方法の例を以下に示します。

```kotlin
Image(
    painter = painterResource(Res.drawable.my_image),
    contentDescription = null
)
```

#### Canvas上への画像の描画 {id="drawing-images-on-a-canvas"}

リソース画像を `Image()` コンポーザブルで表示する代わりに独自に描画したい場合は、`ImageBitmap` または `ImageVector` として読み込み、`DrawScope` 内で使用します。

* `ImageBitmap` を描画するには、`DrawScope.drawImage()` を使用します。
* `ImageVector` を描画するには、`rememberVectorPainter()` で `Painter` を作成し、`Painter.draw()` を使用します。

`DrawScope` 内でのオフセットとサイズはピクセル単位で指定します。

```kotlin
val myImageRaster = imageResource(Res.drawable.my_image_raster)
val myImageVectorPainter = rememberVectorPainter(vectorResource(Res.drawable.my_image_vector))

Canvas(modifier = Modifier.fillMaxSize()) {
    // ラムダの内部では、`this` は `DrawScope` のインスタンスであり、`drawImage()` と `translate()` を提供します
    drawImage(image = myImageRaster, topLeft = Offset(20f, 20f))
    translate(left = 20f, top = myImageRaster.height + 40f) {
        // `Painter.draw()` 関数は、`DrawScope` と `Painter` の両方をレシーバーとして使用します
        with(myImageVectorPainter) {
            draw(Size(200f, 200f))
        }
    }
}
```

### アイコン {id="icons"}

Material SymbolsライブラリのベクターAndroid XMLアイコンを使用できます。

1. [Google Fonts Icons](https://fonts.google.com/icons) ギャラリーを開き、アイコンを選択してAndroidタブに移動し、**Download** をクリックします。

2. ダウンロードしたXMLアイコンファイルを、マルチプラットフォームリソースの `drawable` ディレクトリに追加します。

3. XMLアイコンファイルを開き、`android:fillColor` を `#000000` に設定します。
   `android:tint` など、色調整用の他のAndroid固有の属性を削除します。

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
   
4. プロジェクトをビルドしてリソースアクセサを生成するか、[Kotlin Multiplatform IDEプラグイン](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)に自動的に処理させます。

以下は、Compose Multiplatformコードでアイコンにアクセスし、`colorFilter` パラメータを使用して色を調整する方法の例です。

```kotlin
Image(
    painter = painterResource(Res.drawable.ic_sample_icon),
    contentDescription = "Sample icon",
    modifier = Modifier.size(24.dp),
    colorFilter = ColorFilter.tint(Color.Blue)
)
```

### 文字列 {id="strings"}

すべての文字列リソースは `composeResources/values` ディレクトリ内のXMLファイルに保存します。
各ファイル内の各アイテムに対して静的アクセサが生成されます。

[Kotlin Multiplatform IDEプラグイン](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)は、XMLファイル内で文字列リソース、文字列配列、複数形を直接追加するためのEmmet風の省略記法構文をサポートしています。
たとえば、`strings.xml` で `test{Example}` または `s.test{Example}` と入力して **Tab** キーを押すと、自動的に `<string name="test">Example</string>` に展開されます。

異なるロケール向けに文字列をローカライズする方法については、[文字列のローカライズに関するガイド](compose-localize-strings.md)を参照してください。

#### 単純な文字列 {id="simple-strings"}

単純な文字列を保存するには、XMLに `<string>` 要素を追加します。

```XML
<resources>
    <string name="app_name">My awesome app</string>
    <string name="title">Some title</string>
</resources>
```

文字列リソースを `String` として取得するには、以下のコードを使用します。

<Tabs>
<TabItem title= "コンポーザブルコードから">

```kotlin
@Composable
fun stringResource(resource: StringResource): String {...}

@Composable
fun stringResource(resource: StringResource, vararg formatArgs: Any): String {...}
```

例:

```kotlin
Text(stringResource(Res.string.app_name))
```

</TabItem>
<TabItem title= "非コンポーザブルコードから">

```kotlin
suspend fun getString(resource: StringResource): String

suspend fun getString(resource: StringResource, vararg formatArgs: Any): String
```

例:

```kotlin
coroutineScope.launch {
    val appName = getString(Res.string.app_name)
}
```

</TabItem>
</Tabs>

文字列リソースでは特殊記号を使用できます。

* `\n` – 改行
* `\t` – タブ記号
* `\uXXXX` – 特定のUnicode文字

[Androidの文字列の場合](https://developer.android.com/guide/topics/resources/string-resource#escaping_quotes)とは異なり、"@" や "?" などの特殊なXML文字をエスケープする必要はありません。

> [Kotlin Multiplatformプラグイン](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)がインストールされたIDEでは、**Tab** キーを押してEmmet風の略語を文字列タグに展開できます。
> * `test` → `<string name="test"></string>`
> * `test{Example}` → `<string name="test">Example</string>`
>
{style="tip"}

#### 文字列テンプレート {id="string-templates"}

現在、引数には文字列リソースの基本的なサポートが用意されています。
テンプレートを作成する場合、文字列内に引数を配置するには `%<number>` 形式を使用し、単純なテキストではなく変数のプレースホルダーであることを示すために `$d` または `$s` のサフィックスを含めます。
例:

```XML
<resources>
    <string name="str_template">Hello, %2$s! You have %1$d new messages.</string>
</resources>
```

文字列テンプレートリソースを作成してインポートした後は、正しい順序でプレースホルダーの引数を渡しながら参照できます。

```kotlin
Text(stringResource(Res.string.str_template, 100, "User_name"))
```

`$s` と `$d` のサフィックスに違いはなく、他のサフィックスはサポートされていません。
リソース文字列に `%1$s` プレースホルダーを配置し、それを使用して小数値を表示することも可能です。例:

```kotlin
Text(stringResource(Res.string.str_template, "User_name", 100.1f))
```

> [Kotlin Multiplatformプラグイン](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)がインストールされたIDEでは、プレースホルダー用に `%1$s` や `%2$d` を手動で入力する代わりに、インラインの数値ショートカットを使用できます。
> たとえば、文字列値の中で `1` または `1s` と入力すると、`%1$s` に展開されます。
> 同様に、`2d` と入力すると `%2$d` に展開されます。
> 
{style="tip"}

#### 文字列配列 {id="string-arrays"}

関連する文字列を配列にグループ化し、自動的に `List<String>` オブジェクトとしてアクセスできます。

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

対応するリストを取得するには、以下のコードを使用します。

<Tabs>
<TabItem title= "コンポーザブルコードから">

```kotlin
@Composable
fun stringArrayResource(resource: StringArrayResource): List<String> {...}
```

例:

```kotlin
val arr = stringArrayResource(Res.array.str_arr)
if (arr.isNotEmpty()) Text(arr[0])
```

</TabItem>
<TabItem title= "非コンポーザブルコードから">

```kotlin
suspend fun getStringArray(resource: StringArrayResource): List<String>
```

例:

```kotlin
coroutineScope.launch {
    val appName = getStringArray(Res.array.str_arr)
}
```

</TabItem>
</Tabs>

> [Kotlin Multiplatformプラグイン](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)がインストールされたIDEでは、Emmet風の構文を使用して文字列配列をすばやく定義できます。
> 空の配列テンプレートを生成するには、`string-array`、`sa`、または `>` 演算子を使用します。
> 事前定義されたアイテム数と開始テキストを持つ名前付き配列を作成するには、`test>2{Hello}` と入力して **Tab** キーを押します。
> ```xml
> <string-array name="test">
>    <item>Hello</item>
>    <item>Hello</item>
> </string-array>
> ```
>
{style="tip"}

#### 複数形（Plurals） {id="plurals"}

UIが何らかの数量を表示する場合、プログラム的に無関係な文字列をいくつも作成することなく、同じものの異なる数量に対して文法的な一致（1冊の _book_、多数の _books_ など）をサポートしたい場合があります。

Compose Multiplatformにおける概念と基本的な実装は、Androidの数量文字列（quantity strings）と同じです。
プロジェクトで複数形を使用する際のベストプラクティスとニュアンスの詳細については、[Androidのドキュメント](https://developer.android.com/guide/topics/resources/string-resource#Plurals)を参照してください。

* サポートされているバリアントは `zero`、`one`、`two`、`few`、`many`、および `other` です。すべての言語でこれらすべてのバリアントが考慮されるわけではないことに注意してください。たとえば、英語では `zero` は1以外の他の複数形と同じであるため無視されます。言語が実際にどのような区別を要求しているかについては、言語の専門家に確認してください。
* ユーザーエクスペリエンスを損なわないのであれば、「Books: 1」のような数量に依存しない表現を使用することで、数量文字列を回避できることもよくあります。

複数形を定義するには、`composeResources/values` ディレクトリ内の任意の `.xml` ファイルに `<plurals>` 要素を追加します。
`plurals` コレクションは、name属性（XMLファイルの名前ではありません）を使用して参照される単純なリソースです。
そのため、1つの `<resources>` 要素の下で、同じXMLファイル内の他の単純なリソースと `plurals` リソースを組み合わせることができます。

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

複数形に `String` としてアクセスするには、以下のコードを使用します。

<Tabs>
<TabItem title= "コンポーザブルコードから">

```kotlin
@Composable
fun pluralStringResource(resource: PluralStringResource, quantity: Int): String {...}

@Composable
fun pluralStringResource(resource: PluralStringResource, quantity: Int, vararg formatArgs: Any): String {...}
```

例:

```kotlin
Text(pluralStringResource(Res.plurals.new_message, 1, 1))
```

</TabItem>
<TabItem title= "非コンポーザブルコードから">

```kotlin
suspend fun getPluralString(resource: PluralStringResource, quantity: Int): String

suspend fun getPluralString(resource: PluralStringResource, quantity: Int, vararg formatArgs: Any): String
```

例:

```kotlin
coroutineScope.launch {
    val appName = getPluralString(Res.plurals.new_message, 1, 1)
}
```

</TabItem>
</Tabs>

> [Kotlin Multiplatformプラグイン](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)がインストールされたIDEでは、Emmet風の構文を使用して複数形リソースを生成できます。
> たとえば、`plurals`、`p`、または `:` を使用して、デフォルトの空の文字列テンプレートを生成します。
> `values-en/strings.xml` で作業している場合、IDEはロケール、必要な数量、および英語には `one` と `other` のみが必要であることを自動的に検出します。
> `p.test` または `plurals.test` と入力して **Tab** キーを押すと、略語が `plurals` ブロックに展開されます。
> ```xml
> <plurals name="test">
>     <item quantity="one"></item>
>     <item quantity="other"></item>
> </plurals>
> ```
>
{style="tip"}

### フォント {id="fonts"}

カスタムフォントは `composeResources/font` ディレクトリに保存します。
Compose Multiplatformは、すべてのプラットフォームでTTF、OTF、TTC、およびバリアブルフォント形式をサポートしています。
WOFFおよびWOFF2は、WebとmacOSでのみ利用可能です。

フォントを `Font` 型として読み込むには、`Font()` コンポーザブル関数を使用します。

```kotlin
@Composable
fun Font(
    resource: FontResource,
    weight: FontWeight = FontWeight.Normal,
    style: FontStyle = FontStyle.Normal
): Font
```

例:

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

> `Font` がコンポーザブルである場合、それに依存するコンポーネント（`TextStyle` や `Typography` など）もコンポーザブルであることを確認してください。
>
{style="note"}

絵文字やアラビア文字などの特殊文字は、要求に応じて必要なNotoフォントをダウンロードする[自動フォントフォールバック](compose-web-resources.md#automatic-font-fallback)を通じて、Webターゲットで自動的にサポートされます。

使用するフォントを完全に制御する必要がある場合は、特定のフォントをバンドルし、[preload API](compose-web-resources.md#preload-resources-using-the-compose-multiplatform-preload-api) を使用して手動で登録してください。

### Rawファイル {id="raw-files"}

任意のRaw（未加工の）ファイルをバイト配列として読み込むには、`Res.readBytes(path)` 関数を使用します。

```kotlin
suspend fun readBytes(path: String): ByteArray
```

Rawファイルは `composeResources/files` ディレクトリに配置でき、その中に任意の階層を作成できます。

たとえば、Rawファイルにアクセスするには以下のコードを使用します。

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

#### バイト配列から画像への変換 {id="convert-byte-arrays-into-images"}

読み込んでいるファイルがビットマップ（JPEG、PNG、BMP、WEBP）またはXMLベクター画像である場合、以下の関数を使用して、`Image()` コンポーザブルに適した `ImageBitmap` または `ImageVector` オブジェクトに変換できます。

[Rawファイル](#raw-files) セクションで示したようにRawファイルにアクセスし、その結果をコンポーザブルに渡します。

```kotlin
// bytes = Res.readBytes("files/example.png")
Image(bytes.decodeToImageBitmap(), null)

// bytes = Res.readBytes("files/example.xml")
Image(bytes.decodeToImageVector(LocalDensity.current), null)
```

Androidを除くすべてのプラットフォームでは、SVGファイルを `Painter` オブジェクトに変換することもできます。

```kotlin
// bytes = Res.readBytes("files/example.svg")
Image(bytes.decodeToSvgPainter(LocalDensity.current), null)
```

### リソースと文字列ID用に生成されたマップ {id="generated-maps-for-resources-and-string-ids"}

アクセスを容易にするため、Compose Multiplatformは文字列IDを使用してリソースをマッピングすることも行います。ファイル名をキーとして使用してアクセスできます。

```kotlin
val Res.allDrawableResources: Map<String, DrawableResource>
val Res.allStringResources: Map<String, StringResource>
val Res.allStringArrayResources: Map<String, StringArrayResource>
val Res.allPluralStringResources: Map<String, PluralStringResource>
val Res.allFontResources: Map<String, FontResource>
```

マッピングされたリソースをコンポーザブルに渡す例:

```kotlin
Image(painterResource(Res.allDrawableResources["compose_multiplatform"]!!), null)
```

### AndroidアセットとしてのCompose Multiplatformリソース {id="compose-multiplatform-resources-as-android-assets"}

Compose Multiplatform 1.7.0以降、すべてのマルチプラットフォームリソースはAndroidアセットにパックされます。
これにより、Android StudioでAndroidソースセット内のCompose Multiplatformコンポーザブルのプレビューを生成できるようになります。

> Android Studioのプレビューは、Androidソースセット内のコンポーザブルに対してのみ利用可能です。
> また、最新バージョンのAGP（8.5.2、8.6.0-rc01、または8.7.0-alpha04のいずれか）が必要です。
>
{style="warning"}

マルチプラットフォームリソースをAndroidアセットとして使用することで、リソースに単純なパス（例: `Res.getUri("files/index.html")`）でアクセスできるため、Android上のWebViewやメディアプレーヤーコンポーネントからの直接アクセスも可能になります。

リソース画像へのリンクを含むリソースHTMLページを表示するAndroidコンポーザブルの例:

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

この例は、次のシンプルなHTMLファイルで動作します。

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

![composeResourcesディレクトリのファイル構造](compose-resources-android-webview.png){width="230"}

## 他のライブラリやリソースとの連携 {id="interaction-with-other-libraries-and-resources"}

### 外部ライブラリからのマルチプラットフォームリソースへのアクセス {id="accessing-multiplatform-resources-from-external-libraries"}

プロジェクトに含まれる他のライブラリを使用してマルチプラットフォームリソースを処理したい場合は、プラットフォーム固有のファイルパスをそれらの他のAPIに渡すことができます。
プラットフォーム固有のパスを取得するには、リソースへのプロジェクトパスを指定して `Res.getUri()` 関数を呼び出します。

```kotlin
val uri = Res.getUri("files/my_video.mp4")
```

これで `uri` 変数にファイルへの絶対パスが格納されたため、外部ライブラリはそのパスを使用して、適切な方法でファイルにアクセスできます。

Android固有の用途では、マルチプラットフォームリソースは[Androidアセットとしてもパック](#compose-multiplatform-resources-as-android-assets)されます。

### リモートファイル {id="remote-files"}

リソースライブラリのコンテキストでは、アプリケーションの一部であるファイルのみがリソースとみなされます。

URLを使用してインターネットからリモートファイルを読み込むには、専用のライブラリを使用できます。

* [Compose ImageLoader](https://github.com/qdsfdhvh/compose-imageloader)
* [Kamel](https://github.com/Kamel-Media/Kamel)
* [Ktor client](https://ktor.io/)

画像を手動でダウンロードしたりそのバイトを読み込んだりした場合は、リソースライブラリの[デコード関数](#convert-byte-arrays-into-images)を使用して変換します。デスクトップアプリでネットワーク画像を読み込む例については、[デスクトップ向けCompose Multiplatformでの画像の使用](compose-desktop-images.md#loading-images-from-the-file-system-or-the-network)を参照してください。

画像のバイトを自身でダウンロードまたは読み込んだ場合は、リソースライブラリの[デコード関数](#convert-byte-arrays-into-images)を使用して画像に変換してください。
デスクトップアプリケーションでネットワークから画像を読み込む例については、[デスクトップ向けCompose Multiplatformでの画像の使用](compose-desktop-images.md#loading-images-from-the-file-system-or-the-network) のチュートリアルを参照してください。

### Javaリソースの使用 {id="using-java-resources"}

Compose MultiplatformでJavaリソースを使用することは可能ですが、フレームワークが提供する拡張機能（生成されたアクセサ、マルチモジュールサポート、ローカライズなど）の恩恵を受けることはできません。
その潜在的な機能を活用するために、マルチプラットフォームリソースライブラリへの完全な移行を検討してください。

Compose Multiplatform 1.7.0では、`compose.ui` パッケージで利用可能だったリソースAPIは非推奨（deprecated）になりました。
引き続きJavaリソースを使用する必要がある場合は、Compose Multiplatform 1.7.0以降にアップグレードした後もコードが動作するように、以下の実装をプロジェクトにコピーしてください。

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

## 次のステップ {id="what-s-next"}

* iOS、Android、デスクトップをターゲットとするCompose Multiplatformプロジェクトでリソースをどのように扱えるかを示した公式の [デモプロジェクト](https://github.com/JetBrains/compose-multiplatform/tree/master/components/resources/demo) を確認してください。
* アプリ内のテーマや言語など、アプリケーションの [リソース環境](compose-resource-environment.md) を管理する方法を学びましょう。