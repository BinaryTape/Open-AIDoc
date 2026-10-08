# 从 Glide/Picasso 迁移

以下是几个如何将 Glide/Picasso 调用迁移为 Coil 调用的示例：

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

### 自定义请求 {id="custom-requests"}

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

// Coil（自动检测缩放类型）
imageView.load(url) {
    placeholder(placeholder)
}
```

### 非 View 目标 {id="non-view-targets"}

```kotlin
// Glide（具有启动和错误的可选回调）
Glide.with(context)
    .load(url)
    .into(object : CustomTarget<Drawable>() {
        override fun onResourceReady(resource: Drawable, transition: Transition<Drawable>) {
            // 处理成功结果。
        }

        override fun onLoadCleared(placeholder: Drawable) {
            // 从任何 View 中移除 onResourceReady 中提供的 drawable，并确保不再保留对它的引用。
        }
    })

// Picasso
Picasso.get()
    .load(url)
    .into(object : BitmapTarget {
        override fun onBitmapLoaded(bitmap: Bitmap, from: Picasso.LoadedFrom) {
            // 处理成功结果。
        }

        override fun onBitmapFailed(e: Exception, errorDrawable: Drawable?) {
            // 处理错误 drawable。
        }

        override fun onPrepareLoad(placeHolderDrawable: Drawable?) {
            // 处理占位符 drawable。
        }
    })

// Coil
val request = ImageRequest.Builder(context)
    .data(url)
    .target(
        onStart = { placeholder ->
            // 处理占位符图像。
        },
        onSuccess = { result ->
            // 处理成功结果。
        },
        onError = { error ->
            // 处理错误图像。
        }
    )
    .build()
context.imageLoader.enqueue(request)
```

### 后台线程 {id="background-thread"}

```kotlin
// Glide（阻塞当前线程；严禁在主线程中调用）
val drawable = Glide.with(context)
    .load(url)
    .submit(width, height)
    .get()

// Picasso（阻塞当前线程；严禁在主线程中调用）
val drawable = Picasso.get()
    .load(url)
    .resize(width, height)
    .get()

// Coil（挂起、非阻塞且线程安全）
val request = ImageRequest.Builder(context)
    .data(url)
    .size(width, height)
    .build()
val drawable = context.imageLoader.execute(request).image.asDrawable(resources)
```
