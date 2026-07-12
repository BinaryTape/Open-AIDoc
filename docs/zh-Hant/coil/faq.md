# 常見問題

有不在常見問題中的問題嗎？請查看標籤為 #coil 的 [StackOverflow](https://stackoverflow.com/questions/tagged/coil) 或搜尋 [Github discussions](https://github.com/coil-kt/coil/discussions)。

## Coil 可以用於 Java 專案或 Kotlin/Java 混合專案嗎？

是的！[請參閱此處](java_compatibility.md)。

## 我該如何預載圖片？

發動一個沒有目標 (target) 的圖片請求：

```kotlin
val request = ImageRequest.Builder(context)
    .data("https://example.com/image.jpg")
    .build()
imageLoader.enqueue(request)
```

這將會預載圖片並將其儲存到磁碟快取與記憶體快取中。

如果你只想預載到磁碟快取，你可以跳過解碼並儲存到記憶體快取的步驟，如下所示：

```kotlin
val request = ImageRequest.Builder(context)
    .data("https://example.com/image.jpg")
    // 停用寫入記憶體快取。
    .memoryCachePolicy(CachePolicy.DISABLED)
    // 跳過解碼步驟，以免浪費時間/記憶體將圖片解碼至記憶體中。
    .decoderFactory(BlackholeDecoder.Factory())
    .build()
imageLoader.enqueue(request)
```

## 我該如何啟用記錄？

在[建構你的 `ImageLoader`](getting_started.md#configuring-the-singleton-imageloader) 時設定 `logger(DebugLogger())`。

!!! Note
    `DebugLogger` 僅應在偵錯組建中使用。

## 我該如何以 Java 8 或 Java 11 為目標？

Coil 需要 [Java 8 位元組碼](https://developer.android.com/studio/write/java8-support)。在 Android Gradle 外掛程式 `4.2.0` 及更高版本以及 Kotlin Gradle 外掛程式 `1.5.0` 及更高版本中，此功能預設為啟用。如果你使用的是這些外掛程式的舊版本，請將以下內容新增至你的 Gradle 組建指令碼中：

```kotlin
android {
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = "1.8"
    }
}
```

自 Coil `3.2.0` 起，`coil-compose` 和 `coil-compose-core` 需要 Java 11 位元組碼：

```kotlin
android {
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = "11"
    }
}
```

## 為什麼我在使用 Compose Multiplatform 時會收到 Skiko 版本警告？

如果 Coil 的 Skiko 相依性版本比 Compose Multiplatform 舊，Compose Multiplatform 將會印出如下警告：

```text
w: Skiko dependencies' versions are incompatible.
```

此警告通常可以安全忽略，因為 Skiko 版本通常會保持二進制相容性。Coil 版本會追蹤 Compose Multiplatform 的**穩定**發佈版本及其 Skiko 版本，因此如果你遇到此警告，請先將 Coil 更新至最新版本。

**注意**：原則上，Coil 不會僅為了符合 Compose Multiplatform 的 **alpha** 或 **beta** 版本所使用的 Skiko 版本而發佈新版本，除非這些 Skiko 版本與最新 Coil 版本所依賴的版本不相容。

如果警告仍然存在，你可以透過設定以下 Gradle 屬性來忽略它：

```properties
org.jetbrains.compose.library.compatibility.check.disable=true
```

然而，該 Gradle 屬性會停用所有程式庫的 Compose Multiplatform 程式庫相容性檢查，而不僅僅是 Coil。若要僅針對 Coil 及其 Skiko 相依性停用警告，請將此程式碼片段新增至你的根目錄 `build.gradle.kts` 檔案中：

```kotlin
dependencies {
    components {
        all {
            if (id.group == "io.coil-kt.coil3") {
                allVariants {
                    withDependencies {
                        val hadSkikoDependency = removeAll {
                            it.group == "org.jetbrains.skiko" && it.name == "skiko"
                        }
                        if (hadSkikoDependency) {
                            // 將 `0.150.0` 替換為你的 Compose Multiplatform 版本所使用的 Skiko 版本。
                            add("org.jetbrains.skiko:skiko:0.150.0")
                        }
                    }
                }
            }
        }
    }
}
```

## 我該如何取得開發版快照？

將快照儲存庫新增至你的儲存庫清單中：

Gradle (`.gradle`):

```groovy
allprojects {
    repositories {
        maven { url 'https://central.sonatype.com/repository/maven-snapshots/' }
    }
}
```

Gradle Kotlin DSL (`.gradle.kts`):

```kotlin
allprojects {
    repositories {
        maven("https://central.sonatype.com/repository/maven-snapshots/")
    }
}
```

接著透過[最新的快照版本](https://github.com/coil-kt/coil/blob/main/gradle.properties#L34)依賴相同的產物 (artifacts)。

!!! Note
    快照會針對 `main` 分支上每個通過持續整合的新提交進行部署。它們可能包含破壞性變更或不穩定。請自行承擔使用風險。

## 我該如何在 Coil 中使用 Proguard？

若要在 Coil 中使用 Proguard，[請將這些 Proguard 規則新增至你的配置中](https://github.com/coil-kt/coil/blob/main/coil-core/src/jvmMain/resources/META-INF/proguard/proguard-rules.pro)。

你可能還需要為 Ktor、OkHttp 和 Coroutines 新增自訂規則。

!!! Note
    **如果你使用 R8**（Android 上的預設程式碼壓縮器），**則無需為 Coil 新增任何自訂規則**。這些規則會自動新增。