[//]: # (title: kaptからKSPへの移行)

<web-summary>KotlinプロジェクトのアノテーションプロセッサをkaptからKSPへ移行する方法を学びます。</web-summary>

このガイドでは、アノテーションプロセッサを [Kotlin Annotation Processing Tool (kapt)](kapt.md) から [Kotlin Symbol Processing (KSP)](ksp-overview.md) へ移行する方法を説明します。移行によって、プロジェクトはKotlinの機能を最大限に活用し、ビルドパフォーマンスを向上させることができます。

kaptを使用すると、KotlinでJavaアノテーションプロセッサを利用できます。KotlinソースコードをJavaの「スタブ（stub）」に変換し、それらのスタブに対してアノテーションプロセッサを実行します。しかし、この処理には高い負荷がかかり、ビルド時間を大幅に増加させるだけでなく、変換の過程でKotlin固有の機能の一部が失われてしまいます。

これに対し、KSPはKotlin専用に設計されたkaptの代替ツールです。Kotlinソースを直接解析し、null許容性（nullability）などのKotlin固有の情報をそのまま利用できるようにすることで、ビルド時間を短縮します。

## 始める前に {id="before-you-start"}

プロジェクト内のプロセッサがKSPをサポートしているかどうかを確認してください。[サポートされているライブラリ](ksp-overview.md#supported-libraries)のリストを参照するか、各ライブラリのドキュメントを確認してください。

> KSPとkaptは共存して実行できるため、ライブラリやモジュールごとに1つずつ段階的にプロジェクトを移行できます。
>
{style="note"}

## プロジェクトにKSPプラグインを追加する {id="add-the-ksp-plugin-to-your-project"}

プロジェクトレベルの `build.gradle(.kts)` ファイルの `plugins {}` ブロックにKSPプラグインを追加します。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
// build.gradle.kts

plugins {
    id("com.google.devtools.ksp") version "%kspVersion%" apply false
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
// build.gradle

plugins {
    id 'com.google.devtools.ksp' version '%kspVersion%' apply false
}
```

</tab>
</tabs>

> KSPの最新バージョンを確認するには、GitHubの [Releases](https://github.com/google/ksp/releases) を参照してください。
>
{style="tip"}

## モジュール内のkaptをKSPに置き換える {id="replace-kapt-with-ksp-in-your-modules"}

移行したいプロセッサを使用しているモジュールを見つけます。そのモジュールの `build.gradle(.kts)` ファイルで以下の手順を行います。

1. `plugins {}` ブロックにKSPプラグインを追加します。

    <tabs group="build-script">
    <tab title="Kotlin" group-key="kotlin">

    ```kotlin
    // build.gradle.kts

    plugins {
        id("com.google.devtools.ksp")
    }
    ```

    </tab>
    <tab title="Groovy" group-key="groovy">

    ```groovy
    // build.gradle

    plugins {
        id 'com.google.devtools.ksp'
    }
    ```

    </tab>
    </tabs>

2. `dependencies {}` ブロックで、`kapt` を `ksp` に置き換えます。

    <tabs group="build-script">
    <tab title="Kotlin" group-key="kotlin">

    ```kotlin
    // build.gradle.kts

    dependencies {
        implementation("com.google.dagger:dagger:2.48")

        // kapt("com.google.dagger:dagger-compiler:2.48") を置き換えます
        ksp("com.google.dagger:dagger-compiler:2.48")
    }
    ```

    </tab>
    <tab title="Groovy" group-key="groovy">

    ```groovy
    // build.gradle

    dependencies {
        implementation 'com.google.dagger:dagger:2.48'

        // kapt 'com.google.dagger:dagger-compiler:2.48' を置き換えます
        ksp 'com.google.dagger:dagger-compiler:2.48'
    }
    ```

    </tab>
    </tabs>

ほとんどのライブラリでは、この置き換えだけで十分です。追加の変更が必要かどうかについては、各ライブラリのドキュメントを確認してください。

## kaptプラグインを削除する {id="remove-the-kapt-plugin"}

すべてのプロセッサをKSPに移行した後は、すべての `build.gradle(.kts)` ファイルからkaptプラグインを安全に削除できます。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
// build.gradle.kts

plugins {
    // kaptプラグインの宣言を削除:
    id("org.jetbrains.kotlin.kapt")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
// build.gradle

plugins {
    // kaptプラグインの宣言を削除:
    id 'org.jetbrains.kotlin.kapt'
}
```

</tab>
</tabs>

`kapt {}` ブロックなど、残っているkaptの設定があれば削除してください。

## 関連項目 {id="see-also"}

* KSP APIを使用して[独自のプロセッサを作成する](ksp-quickstart.md#create-your-own-processor)方法を学ぶ。
* [Javaアノテーション処理からKSPへのリファレンス](ksp-reference.md)で、Javaアノテーション処理APIに相当するKSPのAPIを確認する。
* [Kotlin Symbol Processing APIの概要](ksp-overview.md)で、コンパイル中にKSPがどのように動作するかを学ぶ。
* KSPリポジトリ内の[サンプルプロジェクト](https://github.com/google/ksp/tree/main/examples)を確認する。