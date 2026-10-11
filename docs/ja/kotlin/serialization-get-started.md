[//]: # (title: Kotlin serialization 入門)

[シリアライゼーション](serialization.md)は、オブジェクトを保存または送信し、後で復元できるフォーマットに変換する処理です。

Kotlin serialization は複数のフォーマットをサポートしています。
このチュートリアルでは、Kotlin serialization に必要なプラグインと依存関係を追加する方法、および JSON フォーマットでオブジェクトをシリアライズおよびデシリアライズする方法について説明します。

## プラグインと依存関係の追加 {id="add-plugins-and-dependencies"}

プロジェクトで Kotlin serialization を使用するには、使用しているビルドツールに応じて対応するプラグインと依存関係の設定を追加します。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
// build.gradle.kts
plugins {
    kotlin("plugin.serialization") version "%kotlinVersion%"
}

dependencies { 
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:%serializationVersion%")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
// build.gradle
plugins {
    id 'org.jetbrains.kotlin.plugin.serialization' version '%kotlinVersion%'  
}

dependencies {
    implementation 'org.jetbrains.kotlinx:kotlinx-serialization-json:%serializationVersion%'
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<!-- pom.xml -->
<properties>
    <kotlin.version>%kotlinVersion%</kotlin.version>
    <serialization.version>%serializationVersion%</serialization.version>
</properties>

<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <version>${kotlin.version}</version>
            <executions>
                <execution>
                    <id>compile</id>
                    <phase>compile</phase>
                    <goals>
                        <goal>compile</goal>
                    </goals>
                </execution>
            </executions>
            <configuration>
                <compilerPlugins>
                    <plugin>kotlinx-serialization</plugin>
                </compilerPlugins>
            </configuration>
            <dependencies>
                <dependency>
                    <groupId>org.jetbrains.kotlin</groupId>
                    <artifactId>kotlin-maven-serialization</artifactId>
                    <version>${kotlin.version}</version>
                </dependency>
            </dependencies>
        </plugin>
    </plugins>
</build>

<dependencies>
    <dependency>
        <groupId>org.jetbrains.kotlinx</groupId>
        <artifactId>kotlinx-serialization-json</artifactId>
        <version>${serialization.version}</version>
    </dependency>
</dependencies>
```

</tab>
</tabs>

> Bazel 向けに Kotlin コンパイラープラグインを設定するには、[rules_kotlin リポジトリ](https://github.com/bazelbuild/rules_kotlin/tree/master/examples/plugin/src/serialization) の例に従ってください。
> Bazel は Kotlin チームによって公式にサポートされているわけではなく、このリポジトリは独立して保守されています。
>
{style="tip"}

### マルチプラットフォームプロジェクトへのライブラリの追加 {id="add-the-library-to-a-multiplatform-project"}

マルチプラットフォームプロジェクトで JSON 向けの Kotlin serialization を使用するには、共通ソースセット（common source set）に JSON シリアライゼーションライブラリの依存関係を追加します。

```kotlin
commonMain {
    dependencies {
        implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:%serializationVersion%")
    }
}
```

この依存関係には、コアシリアライゼーションライブラリも自動的に含まれます。

### Android プロジェクトでの Kotlin serialization 向け R8 の設定 {initial-collapse-state="collapsed" collapsible="true" id="configure-r8-for-kotlin-serialization-in-android-projects"}

Kotlin serialization にはデフォルトの [ProGuard ルール](https://github.com/Kotlin/kotlinx.serialization/blob/master/rules/common.pro) が含まれているため、[コードの縮小（shrinking）](https://developer.android.com/topic/performance/app-optimization/enable-app-optimization) 後もすべてのシリアライズ可能クラスのシリアライザーを保持するための追加設定は不要です。
ただし、これらのルールは名前付きコンパニオンオブジェクト（named companion object）を持つクラスには適用されません。

名前付きコンパニオンオブジェクトを持つクラスのシリアライザーを保持するには、使用している[互換性モード（compatibility mode）](https://r8.googlesource.com/r8/+/refs/heads/master/compatibility-faq.md) に基づいて、以下のルールを `proguard-rules.pro` ファイルに追加します。

<tabs>
<tab id="compatibility" title="R8 compatibility mode">

```bash
# 名前付きコンパニオンオブジェクトを持つクラスのシリアライザーは getDeclaredClasses を使用して取得されます
# このようなクラスがある場合は、以下の例をご自身のクラスに置き換えてください
-keepattributes InnerClasses # getDeclaredClasses に必要

-if @kotlinx.serialization.Serializable class
com.example.myapplication.HasNamedCompanion, # <-- 名前付きコンパニオンを持つシリアライズ可能なクラスを列挙
com.example.myapplication.HasNamedCompanion2
{
    static **$* *;
}
-keepnames class <1>$$serializer { # serializer() 呼び出しがクラスを正しく参照できるようにするには -keepnames で十分です
    static <1>$$serializer INSTANCE;
}
```

</tab>

<tab id="full" title="R8 full mode">

```bash
# 名前付きコンパニオンオブジェクトを持つクラスのシリアライザーは getDeclaredClasses を使用して取得されます
# このようなクラスがある場合は、以下の例をご自身のクラスに置き換えてください
-keepattributes InnerClasses # getDeclaredClasses に必要

-if @kotlinx.serialization.Serializable class
com.example.myapplication.HasNamedCompanion, # <-- 名前付きコンパニオンを持つシリアライズ可能なクラスを列挙
com.example.myapplication.HasNamedCompanion2
{
    static **$* *;
}
-keepnames class <1>$$serializer { # serializer() 呼び出しがクラスを正しく参照できるようにするには -keepnames で十分です
    static <1>$$serializer INSTANCE;
}

# InnerClasses 属性を保持するために、シリアライザーとシリアライズ可能クラスの両方を保持
-keepclasseswithmembers, allowshrinking, allowobfuscation, allowaccessmodification class
com.example.myapplication.HasNamedCompanion, # <-- 名前付きコンパニオンを持つシリアライズ可能なクラスを列挙
com.example.myapplication.HasNamedCompanion2
{
    *;
}
```

</tab>
</tabs>

> より絞り込んだ[クラス指定（class specifications）](https://www.guardsquare.com/manual/configuration/usage) を持つカスタム ProGuard ルールを使用することで、実行時に一度もシリアライズされないシリアライズ可能クラスを除外できます。
> 
{style="tip"}

## オブジェクトを JSON にシリアライズする {id="serialize-objects-to-json"}

Kotlin では、`kotlinx-serialization-json` ライブラリを使用してオブジェクトを JSON にシリアライズできます。

クラスをシリアライズ可能にするには、[`@Serializable`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serializable/) アノテーションを付加する必要があります。
このアノテーションは、そのクラスのインスタンスをシリアライズおよびデシリアライズするために必要なコードを生成するようコンパイラーに指示します。
詳細については、[`@Serializable` アノテーション](serialization-customization-options.md#the-serializable-annotation) を参照してください。

例を見てみましょう。

1. 必要なシリアライゼーションライブラリから宣言をインポートします。

    ```kotlin
    import kotlinx.serialization.*
    import kotlinx.serialization.json.*
    ```

2. クラスに `@Serializable` アノテーションを付加して、シリアライズ可能にします。

    ```kotlin
    @Serializable
    data class Book(val yearPublished: Int, val title: String)
    ```

   > `@Serializable` アノテーションを使用すると、バッキングフィールドを持つすべてのプロパティのデフォルトのシリアライゼーションが有効になります。
   > プロパティレベルのアノテーションやオプショナルなプロパティなどを使用して、シリアライゼーションの動作をカスタマイズできます。
   > 
   > 詳細については、[クラスのシリアライズ](serialization-customization-options.md) を参照してください。
   >
   {style="note"}

3. [`Json.encodeToString()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json/encode-to-string.html) 関数を使用して、このクラスのインスタンスをシリアライズします。

    ```kotlin
    // シリアライゼーションおよび JSON 処理ライブラリから宣言をインポート
    import kotlinx.serialization.*
    import kotlinx.serialization.json.*

    // Book クラスをシリアライズ可能としてマーク
    @Serializable
    data class Book(val yearPublished: Int, val title: String)

    fun main() {
        // Book クラスのインスタンスを JSON 文字列にシリアライズ
        val json = Json.encodeToString(Book(1937, "The Hobbit"))
        println(json)
        // {"yearPublished":1937,"title":"The Hobbit"}
    }
    ```
   {kotlin-runnable="true" id="serialize-get-started"}

   その結果、このオブジェクトの状態を JSON フォーマットで表した文字列 `{"yearPublished":1937,"title":"The Hobbit"}` が得られます。

   > 1回の呼び出しでオブジェクトのコレクションをシリアライズすることもできます。
   >
   > ```kotlin
   > val bookList = listOf(Book(1937, "The Hobbit"), Book(1867, "War and Peace"))
   > val jsonList = Json.encodeToString(bookList)
   > ```
   >
   {style="tip"}

## JSON からオブジェクトをデシリアライズする {id="deserialize-objects-from-json"}

デシリアライゼーションは、JSON 文字列をオブジェクトに復元（変換）します。

Kotlin で JSON からオブジェクトをデシリアライズするには、次の手順に従います。

1. 必要なシリアライゼーションライブラリから宣言をインポートします。

    ```kotlin
    import kotlinx.serialization.*
    import kotlinx.serialization.json.*
    ```

2. クラスに `@Serializable` アノテーションを付加して、シリアライズ可能にします。

    ```kotlin
    @Serializable
    data class Book(val yearPublished: Int, val title: String)
    ```

3. [`Json.decodeFromString()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json/decode-from-string.html) 関数を使用して、JSON からオブジェクトをデシリアライズします。

    ```kotlin
    // シリアライゼーションおよび JSON 処理ライブラリから宣言をインポート
    import kotlinx.serialization.*
    import kotlinx.serialization.json.*

    // Book クラスをシリアライズ可能としてマーク
    @Serializable
    data class Book(val yearPublished: Int, val title: String)

    fun main() {
        // JSON 文字列を Book クラスのインスタンスにデシリアライズ
        val obj = Json.decodeFromString<Book>("""{"yearPublished":1937, "title": "The Hobbit"}""")
        println(obj)
        // Book(yearPublished=1937, title=The Hobbit)
    }
    ```
   {kotlin-runnable="true" id="deserialize-get-started"}

これで、Kotlin でオブジェクトを JSON にシリアライズし、それを再びオブジェクトにデシリアライズすることができました。

## 次のステップ {id="what-s-next"}

* プリミティブや文字列などの基本型、および特定の標準ライブラリクラスをシリアライズする方法については、[組み込み型のシリアライズ](serialization-serialize-builtin-types.md) を参照してください。
* クラスのシリアライゼーションをカスタマイズし、`@Serializable` アノテーションのデフォルトの動作を調整する方法については、[クラスのシリアライズ](serialization-customization-options.md) を参照してください。
* JSON データの扱い方や JSON シリアライゼーションの設定の詳細については、[JSON シリアライゼーションの概要](serialization-configure-json-serialization.md) を参照してください。