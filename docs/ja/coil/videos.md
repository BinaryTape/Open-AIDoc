# ビデオフレーム

**この機能は Android でのみ利用可能です。**

ビデオフレームのサポートを追加するには、拡張ライブラリをインポートします：

```kotlin
implementation("io.coil-kt.coil3:coil-video:3.6.3")
```

そして、`ImageLoader` を構築する際に、コンポーネントレジストリにデコーダーを追加します：

```kotlin
val imageLoader = ImageLoader.Builder(context)
    .components {
        add(VideoFrameDecoder.Factory())
    }
    .build()
```

ビデオから抽出するフレームの時間を指定するには、`videoFrameMillis` または `videoFrameMicros` を使用します：

```kotlin
imageView.load("/path/to/video.mp4") {
    videoFrameMillis(1000)  // ビデオの 1 秒時点のフレームを抽出します
}
```

正確なフレーム番号を指定するには、`videoFrameIndex` を使用します（API レベル 28 が必要です）：

```kotlin
imageView.load("/path/to/video.mp4") {
    videoFrameIndex(1234)  // ビデオの 1234 番目のフレームを抽出します
}
```

ビデオの総再生時間に対する割合に基づいてビデオフレームを選択するには、`videoFramePercent` を使用します：

```kotlin
imageView.load("/path/to/video.mp4") {
    videoFramePercent(0.5)  // ビデオの再生時間の中心にあるフレームを抽出します
}
```

フレームの位置が指定されていない場合は、ビデオの最初のフレームがデコードされます。

リクエストのファイル名や URI が [有効なビデオ拡張子](https://developer.android.com/guide/topics/media/media-formats#video-formats) で終わっている場合、`ImageLoader` は自動的にビデオを検出し、そのフレームを抽出します。そうでない場合は、リクエストに対して明示的に `Decoder` を設定できます：

```kotlin
imageView.load("/path/to/video") {
    decoderFactory { result, options, _ -> VideoFrameDecoder(result.source, options) }
}