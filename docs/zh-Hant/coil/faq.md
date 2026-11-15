# 常見問題

有不在常見問題中的疑問嗎？請在 [StackOverflow](https://stackoverflow.com/questions/tagged/coil) 查詢帶有 #coil 標籤的問題，或搜尋 [Github discussions](https://github.com/coil-kt/coil/discussions)。

## Coil 可以用於 Java 專案或 Kotlin/Java 混合專案嗎？ {id="can-coil-be-used-with-java-projects-or-mixed-kotlin-java-projects"}

可以！[請閱讀此處](java_compatibility.md)。

## 如何預先載入圖片？ {id="how-do-i-preload-an-image"}

發起一個沒有目標（target）的圖片請求：

```kotlin
val request = ImageRequest.Builder(context)
    .data("https://example.com/image.jpg")
    .build()
imageLoader.enqueue(request)
```

這將會預先載入圖片並將其儲存至磁碟和記憶體快取中。

如果您只想預先載入至磁碟快取，可以略過解碼以及儲存到記憶體快取的步驟，如下所示：

```kotlin
val request = ImageRequest.Builder(context)
    .data("https://example.com/image.jpg")
    // 停用寫入記憶體快取。
    .memoryCachePolicy(CachePolicy.DISABLED)
    // 略過解碼步驟，避免浪費時間/記憶體將圖片解碼至記憶體中。
    .decoderFactory(BlackholeDecoder.Factory())
    .build()
imageLoader.enqueue(request)
```

## 如何啟用記錄（logging）？ {id="how-do-i-enable-logging"}

在[建構您的 `ImageLoader`](getting_started.md#configuring-the-singleton-imageloader) 時設定 `logger(DebugLogger())`。

!!! Note
    `DebugLogger` 應僅用於偵錯組建（debug builds）。

## 如何以 Java 8 或 Java 11 為目標？ {id="how-do-i-target-java-8-or-java-11"}

Coil 需要 [Java 8 位元組碼](https://developer.android.com/studio/write/java8-support)。在 Android Gradle Plugin `4.2.0` 及更新版本，以及 Kotlin Gradle Plugin `1.5.0` 及更新版本中，此設定預設為啟用。如果您使用的是這些外掛程式的舊版本，請在您的 Gradle 建置指令碼中加入以下內容：

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

自 Coil `3.2.0` 起，`coil-compose` 與 `coil-compose-core` 需要 Java 11 位元組碼：

```kotlin
import org.jetbrains.kotlin.gradle.dsl.JvmTarget

android {
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
}

kotlin {
    compilerOptions {
        jvmTarget = JvmTarget.JVM_11
    }
}
```

## 為什麼我在 Compose Multiplatform 中收到 Skiko 版本警告？ {id="why-do-i-get-a-skiko-version-warning-with-compose-multiplatform"}

如果 Coil 的 Skiko 相依性版本比 Compose Multiplatform 的版本舊，Compose Multiplatform 將會印出如下警告：

```text
w: Skiko dependencies' versions are incompatible.
```

Skiko 無法保證里程碑版本之間的二進位相容性，因為它包裝了 Skia，而 Skia 的里程碑版本可能會引入重大變更（breaking changes）。不應認為忽略此警告是安全的。Coil 的發佈版本會追蹤 Compose Multiplatform 的**穩定**（stable）發佈版本及其 Skiko 版本，因此如果您遇到此警告，請先將 Coil 更新至最新版本。

**注意**：Coil 不會僅為了與 **alpha** 和 **beta** Compose Multiplatform 發佈版本使用的 Skiko 版本保持一致而發佈新版本。但是，如果出現二進位相容性問題，且需要 Coil 相依於較新的 Skiko 版本，Coil 將會發佈包含已更新相依性的 **alpha** 版本。

如果您已將 Coil 更新至最新版本但警告依然存在，您可以按照以下方式隱藏該警告：

**Compose Multiplatform >= 1.13.0**

在套用了 Compose Multiplatform 外掛程式的每個模組的 `build.gradle.kts` 檔案中加入以下內容：

```kotlin
compose {
    dependencyCompatibility {
        exclude("io.coil-kt.coil3")
    }
}
```

這將僅停用針對 Coil 的相容性檢查。

**較舊的 Compose Multiplatform 版本：**

在您的 `gradle.properties` 檔案中加入以下內容：

```properties
org.jetbrains.compose.library.compatibility.check.disable=true
```

這將會停用所有程式庫（包括 Coil）的 Compose Multiplatform 程式庫相容性檢查。

## 如何取得開發快照（snapshots）？ {id="how-do-i-get-development-snapshots"}

將快照存儲庫加入到您的存儲庫清單中：

Gradle (`.gradle`)：

```groovy
allprojects {
    repositories {
        maven { url 'https://central.sonatype.com/repository/maven-snapshots/' }
    }
}
```

Gradle Kotlin DSL (`.gradle.kts`)：

```kotlin
allprojects {
    repositories {
        maven("https://central.sonatype.com/repository/maven-snapshots/")
    }
}
```

接著使用[最新的快照版本](https://github.com/coil-kt/coil/blob/main/gradle.properties#L34)來依賴相同的構件。

!!! Note
    快照會在 `main` 分支上每個通過 CI 的新提交時部署。它們可能包含重大變更或可能不穩定。請自行承擔使用風險。

## 如何在 Coil 中使用 Proguard？ {id="how-to-i-use-proguard-with-coil"}

若要在 Coil 中使用 Proguard，[請將這些 Proguard 規則新增至您的設定中](https://github.com/coil-kt/coil/blob/main/coil-core/src/jvmMain/resources/META-INF/proguard/proguard-rules.pro)。

您可能還需要為 Ktor、OkHttp 和 Coroutines 新增自訂規則。

!!! Note
    **如果您使用的是 R8，則不需要為 Coil 新增任何自訂規則**，R8 是 Android 上的預設程式碼壓縮器（code shrinker）。這些規則會自動新增。