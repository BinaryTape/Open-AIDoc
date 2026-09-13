[//]: # (title: Gradleプラグインバリアントのサポート)

Gradle 7.0では、Gradleプラグインの作成者向けに新しい機能「[バリアントを持つプラグイン](https://docs.gradle.org/7.0/userguide/implementing_gradle_plugins.html#plugin-with-variants)」が導入されました。
この機能により、古いGradleバージョンとの互換性を維持しながら、最新のGradle機能のサポートをより簡単に追加できるようになります。
[Gradleにおけるバリアント選択](https://docs.gradle.org/current/userguide/variant_model.html)についての詳細をご確認ください。

Gradleプラグインバリアントを使用することで、Kotlinチームは異なるGradleバージョンに対して異なるKotlin Gradleプラグイン（KGP）バリアントを提供できます。
その目的は、サポートされている最も古いバージョンのGradleに対応する `main` バリアントで基本的なKotlinコンパイルをサポートすることです。各バリアントは、対応するリリースのGradle機能の実装を持ちます。最新のバリアントは最新のGradle機能セットをサポートします。このアプローチにより、機能は制限されるものの、より古いGradleバージョンのサポートを継続することが可能になります。

現在、Kotlin Gradleプラグインには以下のバリアントがあります：

| バリアント名 | 対応するGradleバージョン |
|----------------|-------------------------------|
| `main`         | 7.6.0–7.6.3                   |
| `gradle80`     | 8.0–8.0.2                     |
| `gradle81`     | 8.1.1                         |
| `gradle82`     | 8.2.1–8.4                     |
| `gradle85`     | 8.5                           |
| `gradle86`     | 8.6-8.7                       |
| `gradle88`     | 8.8-8.10                      |
| `gradle811`    | 8.11-8.12                     |
| `gradle813`    | 8.13-8.14                     |
| `gradle96`     | 9.6-9.7                       |

今後のKotlinのリリースでは、さらに多くのバリアントが追加される予定です。

ビルドでどのバリアントが使用されているかを確認するには、[`--info` ログレベル](https://docs.gradle.org/current/userguide/logging.html#sec:choosing_a_log_level)を有効にし、出力の中から `Using Kotlin Gradle plugin` で始まる文字列（例：`Using Kotlin Gradle plugin main variant`）を探してください。

## トラブルシューティング {id="troubleshooting"}

> 以下は、Gradleにおけるバリアント選択に関する既知の問題の回避策です：
> * [pluginManagement内のResolutionStrategyがマルチバリアントを持つプラグインで機能しない](https://github.com/gradle/gradle/issues/20545)
> * [プラグインが `buildSrc` の共通依存関係として追加された場合、プラグインバリアントが無視される](https://github.com/gradle/gradle/issues/20847)
>
{style="note"}

### GradleがカスタムコンフィギュレーションでKGPバリアントを選択できない {id="gradle-can-t-select-a-kgp-variant-in-a-custom-configuration"}

Gradleがカスタムコンフィギュレーション（Custom Configuration）においてKGPバリアントを選択できないのは、想定されている挙動です。
カスタムGradleコンフィギュレーションを使用している場合：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
configurations.register("customConfiguration") {
    // ...
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
configurations.register("customConfiguration") {
    // ...
}
```

</tab>
</tabs>

そして、Kotlin Gradleプラグインへの依存関係を追加したい場合（例）：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
dependencies {
    customConfiguration("org.jetbrains.kotlin:kotlin-gradle-plugin:%kotlinVersion%")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
dependencies {
    customConfiguration 'org.jetbrains.kotlin:kotlin-gradle-plugin:%kotlinVersion%'
}
```

</tab>
</tabs>

その `customConfiguration` に以下の属性を追加する必要があります：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
configurations {
    customConfiguration {
        attributes {
            attribute(
                Usage.USAGE_ATTRIBUTE,
                project.objects.named(Usage.class, Usage.JAVA_RUNTIME)
            )
            attribute(
                Category.CATEGORY_ATTRIBUTE,
                project.objects.named(Category.class, Category.LIBRARY)
            )
            // 特定のKGPバリアントに依存したい場合：
            attribute(
                GradlePluginApiVersion.GRADLE_PLUGIN_API_VERSION_ATTRIBUTE,
                project.objects.named("7.0")
            )
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
configurations {
    customConfiguration {
        attributes {
            attribute(
                Usage.USAGE_ATTRIBUTE,
                project.objects.named(Usage, Usage.JAVA_RUNTIME)
            )
            attribute(
                Category.CATEGORY_ATTRIBUTE,
                project.objects.named(Category, Category.LIBRARY)
            )
            // 特定のKGPバリアントに依存したい場合：
            attribute(
                GradlePluginApiVersion.GRADLE_PLUGIN_API_VERSION_ATTRIBUTE,
                project.objects.named('7.0')
            )
        }
    }
}
```

</tab>
</tabs>

そうしないと、以下のようなエラーが発生します：

```none
 > Could not resolve all files for configuration ':customConfiguration'.
      > Could not resolve org.jetbrains.kotlin:kotlin-gradle-plugin:1.7.0.
        Required by:
            project :
         > Cannot choose between the following variants of org.jetbrains.kotlin:kotlin-gradle-plugin:1.7.0:
             - gradle70RuntimeElements
             - runtimeElements
           All of them match the consumer attributes:
             - Variant 'gradle70RuntimeElements' capability org.jetbrains.kotlin:kotlin-gradle-plugin:1.7.0:
                 - Unmatched attributes:
```

## 次のステップ {id="what-s-next"}

[Gradleの基本と詳細](https://docs.gradle.org/current/userguide/userguide.html)について詳しく学びましょう。