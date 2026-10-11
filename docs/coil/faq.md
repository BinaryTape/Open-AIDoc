# 常见问题解答

如果有常见问题解答中未包含的问题？可以在 [StackOverflow](https://stackoverflow.com/questions/tagged/coil) 上查看带有 #coil 标签的问题，或搜索 [GitHub Discussions](https://github.com/coil-kt/coil/discussions)。

## Coil 是否适用于 Java 项目或 Kotlin/Java 混合项目？ {id="can-coil-be-used-with-java-projects-or-mixed-kotlin-java-projects"}

是的！[请阅读此处](java_compatibility.md)。

## 如何预加载图片？ {id="how-do-i-preload-an-image"}

发起一个不设置目标的图片请求：

```kotlin
val request = ImageRequest.Builder(context)
    .data("https://example.com/image.jpg")
    .build()
imageLoader.enqueue(request)
```

这将预加载图片并将其保存到磁盘和内存缓存中。

如果您只想预加载到磁盘缓存中，可以跳过解码和保存到内存缓存的步骤，如下所示：

```kotlin
val request = ImageRequest.Builder(context)
    .data("https://example.com/image.jpg")
    // 禁用写入内存缓存。
    .memoryCachePolicy(CachePolicy.DISABLED)
    // 跳过解码步骤，避免浪费时间/内存将图片解码到内存中。
    .decoderFactory(BlackholeDecoder.Factory())
    .build()
imageLoader.enqueue(request)
```

## 如何启用日志记录？ {id="how-do-i-enable-logging"}

在[构建 `ImageLoader`](getting_started.md#configuring-the-singleton-imageloader) 时设置 `logger(DebugLogger())`。

!!! Note
    `DebugLogger` 仅应在调试构建中使用。

## 如何以 Java 8 或 Java 11 为目标版本？ {id="how-do-i-target-java-8-or-java-11"}

Coil 需要 [Java 8 字节码](https://developer.android.com/studio/write/java8-support)。Android Gradle 插件 `4.2.0` 及更高版本以及 Kotlin Gradle 插件 `1.5.0` 及更高版本默认启用此功能。如果您使用的是这些插件的较旧版本，请将以下内容添加到您的 Gradle 构建脚本中：

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

从 Coil `3.2.0` 开始，`coil-compose` 和 `coil-compose-core` 需要 Java 11 字节码：

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

## 为什么在使用 Compose Multiplatform 时会出现 Skiko 版本警告？ {id="why-do-i-get-a-skiko-version-warning-with-compose-multiplatform"}

如果 Coil 的 Skiko 依赖版本早于 Compose Multiplatform 的依赖版本，Compose Multiplatform 将输出如下警告：

```text
w: Skiko dependencies' versions are incompatible.
```

Skiko 不保证里程碑版本之间的二进制兼容性，因为它是对 Skia 的封装，而 Skia 的里程碑版本可能会引入破坏性变更。不应认为该警告可以安全忽略。Coil 的发布版本会跟踪 Compose Multiplatform 的**稳定**发布版本及其 Skiko 版本，因此如果您遇到此警告，请先将 Coil 更新到最新版本。

**注意**：Coil 不会仅仅为了匹配 Compose Multiplatform 的 **alpha** 和 **beta** 版本所使用的 Skiko 版本而发布新版本。但是，如果存在二进制兼容性问题导致 Coil 必须依赖较新的 Skiko 版本，Coil 将发布包含更新依赖的 **alpha** 版本。

如果您已将 Coil 更新到最新版本但警告仍然存在，可以按如下方式抑制该警告：

**Compose Multiplatform >= 1.13.0**

将以下内容添加到每个应用了 Compose Multiplatform 插件的模块的 `build.gradle.kts` 文件中：

```kotlin
compose {
    dependencyCompatibility {
        exclude("io.coil-kt.coil3")
    }
}
```

这将仅针对 Coil 禁用兼容性检查。

**较旧的 Compose Multiplatform 版本：**

将以下内容添加到您的 `gradle.properties` 文件中：

```properties
org.jetbrains.compose.library.compatibility.check.disable=true
```

这将针对所有库（包括 Coil）禁用所有 Compose Multiplatform 库兼容性检查。

## 如何获取开发快照？ {id="how-do-i-get-development-snapshots"}

将快照仓库添加到您的仓库列表中：

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

然后依赖使用[最新快照版本](https://github.com/coil-kt/coil/blob/main/gradle.properties#L34)的相同构件。

!!! Note
    对于 `main` 分支上通过 CI 的每个新提交，都会部署快照。它们可能包含破坏性变更或不够稳定。请自行承担使用风险。

## 如何在 Coil 中使用 Proguard？ {id="how-to-i-use-proguard-with-coil"}

要在 Coil 中使用 Proguard，[请将这些 Proguard 规则添加到您的配置中](https://github.com/coil-kt/coil/blob/main/coil-core/src/jvmMain/resources/META-INF/proguard/proguard-rules.pro)。

您可能还需要为 Ktor、OkHttp 和 Coroutines 添加自定义规则。

!!! Note
    **如果您使用 R8**（Android 上的默认代码缩减器），**则无需为 Coil 添加任何自定义规则**。这些规则会自动添加。