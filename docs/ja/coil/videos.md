# 動画フレーム

**この機能は Android でのみ利用可能です。**

動画フレームのサポートを追加するには、拡張ライブラリをインポートします:

```kotlin
implementation("io.coil-kt.coil3:coil-video:3.6.3")
```

Coil はサービスローダーを介して自動的に `VideoFrameDecoder.Factory` を登録します。サービスローディングを無効にしている場合は、`ImageLoader` のコンポーネントレジストリにファクトリを追加してください:

```kotlin
val imageLoader = ImageLoader.Builder(context)
    .components {
        add(VideoFrameDecoder.Factory())
    }
    .build()
```

このデコーダーは、MIME タイプが `video/` で始まるソースを自動的に処理します。Coil は認識可能なファイル拡張子からこの MIME タイプを推測できます。ソースの MIME タイプが見つからない場合や正しくない場合は、リクエストに対して明示的にデコーダーを設定してください:

```kotlin
imageView.load("/path/to/video") {
    decoderFactory { result, options, _ -> VideoFrameDecoder(result.source, options) }
}
```

動画から抽出するフレームの時間を指定するには、`videoFrameMillis` または `videoFrameMicros` を使用します:

```kotlin
imageView.load("/path/to/video.mp4") {
    videoFrameMillis(1000)  // 動画の1秒時点のフレームを抽出
}
```

正確なフレーム番号を指定するには、`videoFrameIndex` を使用します（API レベル 28 が必要です）:

```kotlin
imageView.load("/path/to/video.mp4") {
    videoFrameIndex(1234)  // 動画の1234番目のフレームを抽出
}
```

動画の総再生時間に対するパーセンテージに基づいて動画フレームを選択するには、`videoFramePercent` を使用します:

```kotlin
imageView.load("/path/to/video.mp4") {
    videoFramePercent(0.5)  // 動画の再生時間の中間にあるフレームを抽出
}
```

フレームの位置が指定されていない場合は、動画の最初のフレームがデコードされます。