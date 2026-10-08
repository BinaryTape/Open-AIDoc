# 從 Glide/Picasso 遷移

以下是將 Glide/Picasso 呼叫遷移到 Coil 呼叫的一些範例：

### 基本用法 {id="basic-usage"}

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

### 自訂請求 {id="custom-requests"}

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

// Coil (自動偵測縮放類型)
imageView.load(url) {
    placeholder(placeholder)
}
```

### 非 View 目標 {id="non-view-targets"}

```kotlin
// Glide (具有選用的開始和錯誤回呼)
Glide.with(context)
    .load(url)
    .into(object : CustomTarget<Drawable>() {
        override fun onResourceReady(resource: Drawable, transition: Transition<Drawable>) {
            // 處理成功的結果。
        }

        override fun onLoadCleared(placeholder: Drawable) {
            // 從任何 View 中移除 onResourceReady 提供的 drawable，並確保不再保留其參照。
        }
    })

// Picasso
Picasso.get()
    .load(url)
    .into(object : BitmapTarget {
        override fun onBitmapLoaded(bitmap: Bitmap, from: Picasso.LoadedFrom) {
            // 處理成功的結果。
        }

        override fun onBitmapFailed(e: Exception, errorDrawable: Drawable?) {
            // 處理錯誤的 drawable。
        }

        override fun onPrepareLoad(placeHolderDrawable: Drawable?) {
            // 處理占位 drawable。
        }
    })

// Coil
val request = ImageRequest.Builder(context)
    .data(url)
    .target(
        onStart = { placeholder ->
            // 處理占位圖片。
        },
        onSuccess = { result ->
            // 處理成功的結果。
        },
        onError = { error ->
            // 處理錯誤圖片。
        }
    )
    .build()
context.imageLoader.enqueue(request)
```

### 背景執行緒 {id="background-thread"}

```kotlin
// Glide (阻塞目前執行緒；不得從主執行緒呼叫)
val drawable = Glide.with(context)
    .load(url)
    .submit(width, height)
    .get()

// Picasso (阻塞目前執行緒；不得從主執行緒呼叫)
val drawable = Picasso.get()
    .load(url)
    .resize(width, height)
    .get()

// Coil (暫停式、非阻塞且執行緒安全)
val request = ImageRequest.Builder(context)
    .data(url)
    .size(width, height)
    .build()
val drawable = context.imageLoader.execute(request).image.asDrawable(resources)
```
