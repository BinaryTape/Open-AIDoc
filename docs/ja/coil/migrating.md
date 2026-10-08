# Glide/Picasso からの移行

Glide または Picasso の呼び出しを Coil の呼び出しに移行する方法の例をいくつか紹介します。

### 基本的な使い方 {id="basic-usage"}

```kotlin
// Glide
Glide.with(context)
    .load(url)
    .into(imageView)

// Picasso
Picasso.get()
    .load(url)
    .into(imageView)

// Coil
imageView.load(url)
```

### カスタムリクエスト {id="custom-requests"}

```kotlin
imageView.scaleType = ImageView.ScaleType.FIT_CENTER

// Glide
Glide.with(context)
    .load(url)
    .placeholder(placeholder)
    .fitCenter()
    .into(imageView)

// Picasso
Picasso.get()
    .load(url)
    .placeholder(placeholder)
    .fit()
    .into(imageView)

// Coil (スケールタイプを自動的に検出します)
imageView.load(url) {
    placeholder(placeholder)
}
```

### View 以外のターゲット {id="non-view-targets"}

```kotlin
// Glide (start と error のオプションのコールバックがあります)
Glide.with(context)
    .load(url)
    .into(object : CustomTarget<Drawable>() {
        override fun onResourceReady(resource: Drawable, transition: Transition<Drawable>) {
            // 成功した結果を処理します。
        }

        override fun onLoadCleared(placeholder: Drawable) {
            // onResourceReady で提供された Drawable をすべての View から削除し、参照が残らないようにします。
        }
    })

// Picasso
Picasso.get()
    .load(url)
    .into(object : BitmapTarget {
        override fun onBitmapLoaded(bitmap: Bitmap, from: Picasso.LoadedFrom) {
            // 成功した結果を処理します。
        }

        override fun onBitmapFailed(e: Exception, errorDrawable: Drawable?) {
            // エラー時の Drawable を処理します。
        }

        override fun onPrepareLoad(placeHolderDrawable: Drawable?) {
            // プレースホルダーの Drawable を処理します。
        }
    })

// Coil
val request = ImageRequest.Builder(context)
    .data(url)
    .target(
        onStart = { placeholder ->
            // プレースホルダー画像を処理します。
        },
        onSuccess = { result ->
            // 成功した結果を処理します。
        },
        onError = { error ->
            // エラー画像を処理します。
        }
    )
    .build()
context.imageLoader.enqueue(request)
```

### バックグラウンドスレッド {id="background-thread"}

```kotlin
// Glide (現在のスレッドをブロックします。メインスレッドから呼び出さないでください)
val drawable = Glide.with(context)
    .load(url)
    .submit(width, height)
    .get()

// Picasso (現在のスレッドをブロックします。メインスレッドから呼び出さないでください)
val drawable = Picasso.get()
    .load(url)
    .resize(width, height)
    .get()

// Coil (中断可能 (suspend) で、非ブロッキング、かつスレッドセーフです)
val request = ImageRequest.Builder(context)
    .data(url)
    .size(width, height)
    .build()
val drawable = context.imageLoader.execute(request).image.asDrawable(resources)
```
