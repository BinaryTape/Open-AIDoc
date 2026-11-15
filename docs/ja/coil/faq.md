# FAQ

FAQに記載されていない質問がありますか？その場合は、#coil タグを付けて [StackOverflow](https://stackoverflow.com/questions/tagged/coil) を確認するか、[GitHub Discussions](https://github.com/coil-kt/coil/discussions) で検索してください。

## Coil は Java プロジェクトや Kotlin/Java の混在プロジェクトで使用できますか？ {id="can-coil-be-used-with-java-projects-or-mixed-kotlin-java-projects"}

はい、使用できます！[詳細はこちら](java_compatibility.md)をご覧ください。

## 画像をプリロードするにはどうすればよいですか？ {id="how-do-i-preload-an-image"}

ターゲット（target）を指定せずに画像リクエストを実行します：

```kotlin
val request = ImageRequest.Builder(context)
    .data("https://example.com/image.jpg")
    .build()
imageLoader.enqueue(request)
```

これにより、画像がプリロードされ、ディスクキャッシュおよびメモリキャッシュに保存されます。

ディスクキャッシュにのみプリロードしたい場合は、次のようにデコードとメモリキャッシュへの保存をスキップできます：

```kotlin
val request = ImageRequest.Builder(context)
    .data("https://example.com/image.jpg")
    // メモリキャッシュへの書き込みを無効化します。
    .memoryCachePolicy(CachePolicy.DISABLED)
    // デコード処理をスキップし、画像をメモリにデコードするための時間やメモリの消費を防ぎます。
    .decoderFactory(BlackholeDecoder.Factory())
    .build()
imageLoader.enqueue(request)
```

## ロギングを有効にするにはどうすればよいですか？ {id="how-do-i-enable-logging"}

[`ImageLoader` を構築する](getting_started.md#configuring-the-singleton-imageloader)際に `logger(DebugLogger())` を設定します。

!!! Note
    `DebugLogger` はデバッグビルドでのみ使用してください。

## Java 8 または Java 11 をターゲットにするにはどうすればよいですか？ {id="how-do-i-target-java-8-or-java-11"}

Coil は [Java 8 バイトコード](https://developer.android.com/studio/write/java8-support)を必要とします。これは Android Gradle Plugin `4.2.0` 以降および Kotlin Gradle Plugin `1.5.0` 以降ではデフォルトで有効になっています。それより古いバージョンのプラグインを使用している場合は、Gradle ビルドスクリプトに以下を追加してください：

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

Coil `3.2.0` 以降では、`coil-compose` および `coil-compose-core` に Java 11 バイトコードが必要です：

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

## Compose Multiplatform で Skiko のバージョン警告が出るのはなぜですか？ {id="why-do-i-get-a-skiko-version-warning-with-compose-multiplatform"}

Coil が依存している Skiko のバージョンが Compose Multiplatform のものより古い場合、Compose Multiplatform は次のような警告を出力します：

```text
w: Skiko dependencies' versions are incompatible.
```

Skiko は Skia をラップしており、Skia のマイルストーンバージョン間で破壊的変更（breaking changes）が導入される可能性があるため、Skiko はマイルストーンバージョン間のバイナリ互換性を保証していません。この警告は、無視しても安全だとみなすべきではありません。Coil のリリースは Compose Multiplatform の**安定版（stable）**リリースおよびその Skiko バージョンに追従しているため、この警告が発生した場合は、まず Coil を最新バージョンにアップデートしてください。

**注意**: Coil は、Compose Multiplatform の**アルファ版（alpha）**や**ベータ版（beta）**リリースで使用される Skiko バージョンに合わせるためだけの新バージョンリリースは行いません。ただし、Coil 側で新しい Skiko バージョンへの依存が必要となるバイナリ互換性の問題がある場合は、依存関係を更新した**アルファ版**リリースを公開します。

Coil を最新バージョンにアップデートしても警告が解消されない場合は、次のようにして警告を抑制できます：

**Compose Multiplatform 1.13.0 以上の場合**

Compose Multiplatform プラグインを適用している各モジュールの `build.gradle.kts` ファイルに以下を追加します：

```kotlin
compose {
    dependencyCompatibility {
        exclude("io.coil-kt.coil3")
    }
}
```

これにより、Coil に対してのみ互換性チェックが無効化されます。

**古いバージョンの Compose Multiplatform の場合：**

`gradle.properties` ファイルに以下を追加します：

```properties
org.jetbrains.compose.library.compatibility.check.disable=true
```

これにより、Coil を含むすべてのライブラリに対して、Compose Multiplatform のライブラリ互換性チェックが無効化されます。

## 開発用スナップショットを取得するにはどうすればよいですか？ {id="how-do-i-get-development-snapshots"}

リポジトリのリストにスナップショットリポジトリを追加します：

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

その後、[最新のスナップショットバージョン](https://github.com/coil-kt/coil/blob/main/gradle.properties#L34)を指定して同じアーティファクトに依存させます。

!!! Note
    スナップショットは、CI を通過した `main` ブランチのコミットごとにデプロイされます。破壊的変更が含まれていたり、不安定であったりする可能性があります。自己責任でご使用ください。

## Coil で Proguard を使用するにはどうすればよいですか？ {id="how-to-i-use-proguard-with-coil"}

Coil で Proguard を使用するには、[これらの Proguard ルールを設定に追加](https://github.com/coil-kt/coil/blob/main/coil-core/src/jvmMain/resources/META-INF/proguard/proguard-rules.pro)してください。

また、Ktor、OkHttp、Coroutines 用のカスタムルールの追加が必要になる場合もあります。

!!! Note
    Android のデフォルトのコード縮小ツールである **R8 を使用している場合、Coil 用のカスタムルールを追加する必要はありません**。ルールは自動的に追加されます。