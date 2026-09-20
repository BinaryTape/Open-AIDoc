# SVG

SVGのサポートを追加するには、拡張ライブラリをインポートします。

```kotlin
implementation("io.coil-kt.coil3:coil-svg:3.6.3")
```

これだけで完了です！`ImageLoader` はすべてのSVGを自動的に検出し、デコードします。Coilは、ファイルの先頭1 KBにある `<svg ` マーカーを探すことでSVGを検出します。これにより、ほとんどのケースがカバーされます。SVGが自動的に検出されない場合は、リクエストに対して明示的に `Decoder` を設定できます。

```kotlin
imageView.load("/path/to/svg") {
    decoderFactory { result, options, _ -> SvgDecoder(result.source, options) }
}
```

あるいは、`ImageLoader` を構築する際に、コンポーネントレジストリに手動でデコーダーを追加することもできます。

```kotlin
val imageLoader = ImageLoader.Builder(context)
    .components {
        add(SvgDecoder.Factory())
    }
    .build()