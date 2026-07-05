[//]: # (title: Kotlin プロジェクトでアノテーションプロセッサを使用する)

<tldr>

* 次の場合は **[kapt](kapt.md)** を使用してください：
  * Maven プロジェクトを使用している。
  * Gradle プロジェクトを使用しているが、必要な Java アノテーションプロセッサがまだ KSP をサポートしていない。[サポートされているライブラリのリストを確認する](ksp-overview.md#supported-libraries)。
* 次の場合は **[KSP](ksp-overview.md)** を使用してください：
  * Gradle プロジェクトを使用しており、必要な Java アノテーションプロセッサが KSP をサポートしている。
  * 独自のアノテーションプロセッサを作成したい。

</tldr>

アノテーションプロセッサは、コンパイル時にソースコードを分析して、ボイラープレートコード（定型コード）を生成したり、使用方法を検証したり、その他のアーティファクトを生成したりします。
Kotlin は、アノテーションプロセッサを操作する 2 つの方法をサポートしています。

* [kapt コンパイラプラグイン](#java-アノテーションプロセッサで-kapt-を使用する)は、Kotlin ソースコードからスタブファイルを生成し、そのスタブに対して Java アノテーションプロセッサを実行することで動作します。この追加のスタブ生成ステップによりビルド時間が遅くなり、また kapt は[拡張関数](extensions.md)や [Null 安全](null-safety.md)などの Kotlin 特有の構造を理解できません。

  kapt は Maven と Gradle の両方をサポートしています。すべての Maven プロジェクト、および [MapStruct](https://mapstruct.org/) のように KSP をまだ採用していないプロセッサライブラリを使用する Gradle プロジェクトに推奨されます。

* [KSP フレームワーク](#gradle-プロジェクトで-ksp-を使用する)は、スタブを生成することなく、Kotlin ファーストな API を通じて Kotlin ソースコードを直接読み取ります。Kotlin 特有の機能をネイティブに理解し、kapt よりも高速にビルドを実行します。

  現在、KSP は Gradle のみを公式にサポートしています。独自のプロセッサを作成する場合や、[Dagger](https://dagger.dev/) のような KSP 対応ライブラリを使用する場合に推奨されます。

## Java アノテーションプロセッサで kapt を使用する

[kapt](kapt.md) を使用すると、プロセッサ自体に変更を加えることなく、既存の Java アノテーションプロセッサを Kotlin プロジェクトで使用できます。

以下の例は、コンパイル時に Java Beans 間の型安全なマッパー実装を生成する [MapStruct](https://mapstruct.org/) アノテーションプロセッサの使用方法を示しています。

1. ビルドファイルで `kapt` プラグインを適用し、`dependencies` セクションに MapStruct を追加します。

   <tabs group="build-tool">
   <tab title="Maven" group-key="maven">
   
   ```xml
   <properties>
       <kotlin.compiler.jvmTarget>11</kotlin.compiler.jvmTarget>
       <mapstruct.version>1.6.3</mapstruct.version>
   </properties>
   
   <dependencies>
       <dependency>
           <groupId>org.mapstruct</groupId>
           <artifactId>mapstruct</artifactId>
           <version>${mapstruct.version}</version>
       </dependency>
   </dependencies>
   
   <plugin>
       <groupId>org.jetbrains.kotlin</groupId>
       <artifactId>kotlin-maven-plugin</artifactId>
       <version>${kotlin.version}</version>
       <extensions>true</extensions>
       <executions>
           <execution>
               <id>kapt</id>
               <goals>
                   <goal>kapt</goal>
               </goals>
               <configuration>
                   <sourceDirs>
                       <sourceDir>src/main/kotlin</sourceDir>
                       <sourceDir>src/main/java</sourceDir>
                   </sourceDirs>
                   <aptMode>stubs</aptMode>
                   <annotationProcessorPaths>
                       <annotationProcessorPath>
                           <groupId>org.mapstruct</groupId>
                           <artifactId>mapstruct-processor</artifactId>
                           <version>${mapstruct.version}</version>
                       </annotationProcessorPath>
                   </annotationProcessorPaths>
               </configuration>
           </execution>
       </executions>
   </plugin>
   ```
   
   * `kotlin-maven-plugin` の `kapt` ゴールの実行を、`compile` 実行の**前**に追加します。
   * `aptMode` オプションを使用して、[アノテーション処理のモード](kapt.md#set-up-in-maven)を設定します。

   </tab>
   <tab title="Gradle Kotlin" group-key="kotlin">
   
   ```kotlin
   plugins {
       kotlin("kapt") version "%kotlinVersion%"
   }
   
   dependencies {
       implementation("org.mapstruct:mapstruct:1.6.3")
       kapt("org.mapstruct:mapstruct-processor:1.6.3")
   }
   ```
   
   </tab>
   <tab title="Gradle Groovy" group-key="groovy">
   
   ```groovy
   plugins {
       id "org.jetbrains.kotlin.kapt" version "%kotlinVersion%"
   }
   
   dependencies {
       implementation "org.mapstruct:mapstruct:1.6.3"
       kapt "org.mapstruct:mapstruct-processor:1.6.3"
   }
   ```
   
   </tab>
   </tabs>

2. データクラスとマッパーインターフェースを定義します。

   ```kotlin
   import org.mapstruct.Mapper
   import org.mapstruct.factory.Mappers
   
   data class UserDto(val id: Long, val firstName: String, val lastName: String)
   
   data class UserEntity(val id: Long, val firstName: String, val lastName: String)
   
   @Mapper
   interface UserMapper {
       fun toDto(entity: UserEntity): UserDto
       fun toEntity(dto: UserDto): UserEntity
   
       companion object : UserMapper by Mappers.getMapper(UserMapper::class.java)
   }
   ```

3. プロジェクトをビルドします。MapStruct は、生成されたソースのディレクトリに `UserMapperImpl` クラスを生成します。
   `UserMapper` コンパニオンオブジェクトを使用して、生成された実装を呼び出します。

   ```kotlin
   fun main() {
       val entity = UserEntity(id = 1L, firstName = "John", lastName = "Doe")
       val dto = UserMapper.toDto(entity)
       println(dto)
       // UserDto(id=1, firstName=John, lastName=Doe)
   }
   ```

## Gradle プロジェクトで KSP を使用する

[KSP](ksp-overview.md) を使用すると、Gradle プロジェクトで既存のアノテーションプロセッサを使用したり、ソースコード内のアノテーションに基づいてコードを生成する独自のプロセッサを作成したりできます。

### Java アノテーションプロセッサで KSP を使用する

Gradle プロジェクトでは、互換性のあるアノテーションプロセッサで KSP を使用してください。KSP は kapt よりも高速で、Kotlin 特有の機能をネイティブに理解できます。[すでに KSP をサポートしているライブラリ](ksp-overview.md#supported-libraries)のリストを参照してください。

以下の例は、依存関係グラフの構築コードを生成するコンパイル時の依存関係注入（DI）フレームワークである [Dagger](https://dagger.dev/) の使用方法を示しています。

1. `build.gradle(.kts)` ファイルで KSP プラグインを適用し、`dependencies` ブロックに Dagger を追加します。
 
   <tabs group="build-script">
   <tab title="Kotlin" group-key="kotlin">
   
   ```kotlin
   // build.gradle.kts
   
   plugins {
       kotlin("jvm") version "%kotlinVersion%"
       id("com.google.devtools.ksp") version "%kspVersion%"
   }
   
   dependencies {
       implementation("com.google.dagger:dagger:2.59.2")
       ksp("com.google.dagger:dagger-compiler:2.59.2")
   }
   ```
   
   </tab>
   <tab title="Groovy" group-key="groovy">
   
   ```groovy
   // build.gradle
   
   plugins {
       id 'org.jetbrains.kotlin.jvm' version '%kotlinVersion%'
       id 'com.google.devtools.ksp' version '%kspVersion%'
   }
   
   dependencies {
       implementation 'com.google.dagger:dagger:2.59.2'
       ksp 'com.google.dagger:dagger-compiler:2.59.2'
   }
   ```
   
   </tab>
   </tabs>

   > KSP の最新バージョンを確認するには、GitHub の [Releases](https://github.com/google/ksp/releases) ページをチェックしてください。
   >
   {style="tip"}

2. Kotlin クラスに Dagger アノテーションを付与します。

   ```kotlin
   import javax.inject.Inject
   import javax.inject.Singleton
   import dagger.Component
   import dagger.Module
   import dagger.Provides
   
   @Singleton
   class UserRepository @Inject constructor() {
       fun getUser(): String = "John Doe"
   }
   
   @Module
   class AppModule {
       @Provides
       @Singleton
       fun provideUserRepository(): UserRepository = UserRepository()
   }
   
   @Singleton
   @Component(modules = [AppModule::class])
   interface AppComponent {
       fun userRepository(): UserRepository
   }
   ```

3. プロジェクトをビルドします。Dagger は `build/generated/ksp` ディレクトリに `DaggerAppComponent` などの実装クラスを生成します。
   コード内で生成されたクラスを使用します。

    ```kotlin
    fun main() {
        val appComponent = DaggerAppComponent.create()
        val userRepository = appComponent.userRepository()
        println("User: ${userRepository.getUser()}")
        // User: John Doe
    }
    ```

Dagger の KSP サポートに関する詳細は、その[ドキュメント](https://dagger.dev/dev-guide/ksp.html)を参照してください。

### 独自のアノテーションプロセッサを作成する

KSP API を使用して、コンパイル時にコードを生成する独自のアノテーションプロセッサを作成できます。
新しいプロセッサには 3 つのモジュールが必要です。

* カスタムアノテーションを宣言する `annotation` モジュール。
* `SymbolProcessor` および `SymbolProcessorProvider` ファクトリを実装する `processor` モジュール。`SymbolProcessor` には主要なロジックが含まれ、`SymbolProcessorProvider` はプロセッサを作成し、`META-INF/services/` パスにプロバイダーを登録します。
* KSP プラグインを適用し、プロセッサに依存し、アノテーションを使用する `app` モジュール。

完全なステップバイステップの手順については、[KSP クイックスタート](ksp-quickstart.md#create-your-own-processor)を参照してください。

## 次のステップ

* [kapt の設定について詳しく学ぶ](kapt.md)
* [KSP を使い始める](ksp-quickstart.md)
* [kapt から KSP への移行方法を確認する](ksp-kapt-migration.md)