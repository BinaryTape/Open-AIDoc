# SVG

要添加 SVG 支持，请导入扩展库：

```kotlin
implementation("io.coil-kt.coil3:coil-svg:3.6.3")
```

就这样！`ImageLoader` 将自动检测并解码任何 SVG。Coil 通过在文件的前 1 KB 中查找 `<svg ` 标记来检测 SVG，这应该能涵盖大多数情况。如果 SVG 未被自动检测到，您可以为请求显式设置 `Decoder`：

```kotlin
imageView.load("/path/to/svg") {
    decoderFactory { result, options, _ -> SvgDecoder(result.source, options) }
}
```

（可选）您也可以在构建 `ImageLoader` 时手动将解码器添加到组件注册表中：

```kotlin
val imageLoader = ImageLoader.Builder(context)
    .components {
        add(SvgDecoder.Factory())
    }
    .build()