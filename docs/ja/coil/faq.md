# FAQ

FAQに掲載されていない質問がありますか？タグ #coil を付けて [StackOverflow](https://stackoverflow.com/questions/tagged/coil) で確認するか、[Github discussions](https://github.com/coil-kt/coil/discussions) を検索してください。

## CoilはJavaプロジェクトやKotlin/Javaの混在プロジェクトで使用できますか？ {id="can-coil-be-used-with-java-projects-or-mixed-kotlin-java-projects"}

はい！[こちらをご覧ください](java_compatibility.md)。

## 画像をプリロードするにはどうすればよいですか？ {id="how-do-i-preload-an-image"}

ターゲットを指定せずに画像リクエストを実行します：

```kotlin
val request = ImageRequest.Builder(context)
    .data("https://example.com/image.jpg")
    .build()
imageLoader.enqueue(request)
```

これにより、画像がプリロードされ、ディスクキャッシュおよびメモリキャッシュに保存されます。

ディスクキャッシュにのみプリロードしたい場合は、次のようにデコードおよびメモリキャッシュへの保存をスキップできます：

```kotlin
val request = ImageRequest.Builder(context)
    .data("https://example.com/image.jpg")
    // メモリキャッシュへの書き込みを無効化
    .memoryCachePolicy(CachePolicy.DISABLED)
    // デコード処理をスキップし、画像をメモリにデコードするための時間とメモリの消費を防ぐ
    .decoderFactory(BlackholeDecoder.Factory())
    .build()
imageLoader.enqueue(request)
```

## ロギングを有効にするにはどうすればよいですか？ {id="how-do-i-enable-logging"}

[`ImageLoader` の構築時](getting_started.md#configuring-the-singleton-imageloader)に `logger(DebugLogger())` を設定します。

!!! Note
    `DebugLogger` はデバッグビルドでのみ使用してください。

## Java 8またはJava 11をターゲットにするにはどうすればよいですか？ {id="how-do-i-target-java-8-or-java-11"}

Coilには [Java 8バイトコード](https://developer.android.com/studio/write/java8-support) が必要です。これは、Android Gradle Plugin `4.2.0` 以降および Kotlin Gradle Plugin `1.5.0` 以降でデフォルトで有効になっています。これらのプラグインの古いバージョンを使用している場合は、Gradleビルドスクリプトに以下を追加してください：

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

Coil `3.2.0` 以降、`coil-compose` および `coil-compose-core` ではJava 11バイトコードが必要になります：

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

## Compose MultiplatformでSkikoのバージョン警告が表示されるのはなぜですか？ {id="why-do-i-get-a-skiko-version-warning-with-compose-multiplatform"}

CoilのSkiko依存関係がCompose Multiplatformのものより古い場合、Compose Multiplatformは次のような警告を出力します：

```text
w: Skiko dependencies' versions are incompatible.
```

SkikoはSkia（マイルストーンバージョン間で破壊的変更が導入される可能性がある）をラップしているため、マイルストーンバージョン間のバイナリ互換性を保証しません。この警告は無視しても安全であると見なすべきではありません。CoilのリリースはCompose Multiplatformの**安定版（stable）**リリースおよびそのSkikoバージョンに追従しているため、この警告が表示された場合は、まずCoilを最新バージョンに更新してください。

**注意**: Coilは、Compose Multiplatformの**アルファ版（alpha）**や**ベータ版（beta）**リリースで使用されるSkikoバージョンに合わせるためだけの新バージョンをリリースすることはありません。ただし、Coilがより新しいSkikoバージョンに依存する必要があるバイナリ互換性の問題が発生した場合は、依存関係を更新した**アルファ版**リリースを公開します。

Coilを最新バージョンに更新しても警告が解消されない場合は、次のように警告を抑制できます：

**Compose Multiplatform >= 1.13.0**

Compose Multiplatformプラグインを適用している各モジュールの `build.gradle.kts` ファイルに以下を追加します：

```kotlin
compose {
    dependencyCompatibility {
        exclude("io.coil-kt.coil3")
    }
}
```

これにより、Coilに対してのみ互換性チェックが無効化されます。

**それ以前のバージョンのCompose Multiplatform:**

`gradle.properties` ファイルに以下を追加します：

```properties
org.jetbrains.compose.library.compatibility.check.disable=true
```

これにより、Coilを含むすべてのライブラリに対して、Compose Multiplatformのすべてのライブラリ互換性チェックが無効化されます。

## 開発用スナップショットを取得するにはどうすればよいですか？ {id="how-do-i-get-development-snapshots"}

リポジトリ一覧にスナップショットリポジトリを追加します：

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

次に、[最新のスナップショットバージョン](https://github.com/coil-kt/coil/blob/main/gradle.properties#L34)で同じアーティファクトを指定します。

!!! Note
    スナップショットは、CIを通過した `main` ブランチのコミットごとにデプロイされます。破壊的変更が含まれている可能性や、不安定である可能性があります。自己責任で使用してください。

## CoilでProguardを使用するにはどうすればよいですか？ {id="how-to-i-use-proguard-with-coil"}

CoilでProguardを使用するには、[設定にこれらのProguardルールを追加](https://github.com/coil-kt/coil/blob/main/coil-core/src/jvmMain/resources/META-INF/proguard/proguard-rules.pro)してください。

また、Ktor、OkHttp、および Coroutines 用のカスタムルールを追加する必要がある場合もあります。

!!! Note
    Androidのデフォルトのコード縮小ツールである**R8を使用している場合、Coil用のカスタムルールを追加する必要はありません**。ルールは自動的に追加されます。