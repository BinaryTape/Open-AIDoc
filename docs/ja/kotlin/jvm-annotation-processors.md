[//]: # (title: Kotlinプロジェクトでアノテーションプロセッサを使用する)

<tldr>

* 次の場合は **[kapt](kapt.md)** を使用してください:
  * Mavenプロジェクトの場合。
  * Gradleプロジェクトだが、必要なJavaアノテーションプロセッサがまだKSPをサポートしていない場合。[サポートされているライブラリのリスト](ksp-overview.md#supported-libraries)を参照してください。
* 次の場合は **[KSP](ksp-overview.md)** を使用してください:
  * Gradleプロジェクトであり、必要なJavaアノテーションプロセッサがKSPをサポートしている場合。
  * 独自のアノテーションプロセッサを作成したい場合。

</tldr>

アノテーションプロセッサは、コンパイル時にソースコードを解析して、ボイラープレートコードの生成、使い方の検証、またはその他のアーティファクトの生成を行います。
Kotlinは、アノテーションプロセッサを扱うための2つの方法をサポートしています:

* [kaptコンパイラプラグイン](#use-kapt-with-java-annotation-processors)は、Kotlinソースコードからスタブファイルを生成し、それらのスタブに対してJavaアノテーションプロセッサを実行することで機能します。このスタブ生成の余分なステップによりビルド時間が遅くなり、またkaptは[拡張関数](extensions.md)や[null安全](null-safety.md)などのKotlin固有の構造を理解できません。

  kaptはMavenとGradleの両方をサポートしています。すべてのMavenプロジェクト、および[MapStruct](https://mapstruct.org/)など、まだKSPを採用していないプロセッサライブラリを使用するGradleプロジェクトで推奨されます。

* [KSPフレームワーク](#use-ksp-in-gradle-projects)は、スタブを生成することなく、KotlinファーストのAPIを通じてKotlinソースコードを直接読み取ります。Kotlin固有の機能をネイティブに理解し、kaptよりも高速にビルドを実行します。

  現在、KSPの公式サポートはGradleのみです。独自のプロセッサを作成する場合や、[Dagger](https://dagger.dev/)のようなKSP互換ライブラリと連携する場合に推奨されます。

## Javaアノテーションプロセッサでkaptを使用する {id="use-kapt-with-java-annotation-processors"}

[kapt](kapt.md)を使用すると、プロセッサ自体に変更を加えることなく、Kotlinプロジェクトで既存のJavaアノテーションプロセッサを使用できます。

以下の例は、コンパイル時にJava beans間の型安全なマッパー実装を生成する[MapStruct](https://mapstruct.org/)アノテーションプロセッサの使用方法を示しています。

1. ビルドファイルで`kapt`プラグインを適用し、`dependencies`セクションにMapStructを追加します:

   <tabs group="build-tool">
   <tab title="Maven" group-key="maven">
   
   ```xml
   <properties>
       <kotlin.version>%kotlinVersion%</kotlin.version>
       <maven.compiler.release>17</maven.compiler.release>
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
       <configuration>
           <annotationProcessorPaths>
               <annotationProcessorPath>
                   <groupId>org.mapstruct</groupId>
                   <artifactId>mapstruct-processor</artifactId>
                   <version>${mapstruct.version}</version>
               </annotationProcessorPath>
           </annotationProcessorPaths>
       </configuration>
   </plugin>
   ```
   
   * `<extensions>true</extensions>`オプションは、kaptを[自動的](maven-configure-project.md#automatic-configuration)に設定します。これにより、`src/main/kotlin`および`src/test/kotlin`のソースルートが登録され、適切なライフサイクルフェーズにバインドされた`kapt`および`compile`の実行が追加されるため、コンパイル前に`kapt`ゴールが実行されます。
   * `maven.compiler.release`プロパティはJavaとKotlin両方のコンパイラを設定するため、kaptによって生成されたJavaソースは同じJVMターゲットに対してコンパイルされます。

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

2. データクラスとマッパーインターフェースを定義します:

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

3. プロジェクトをビルドします。MapStructは生成されたソースのディレクトリに`UserMapperImpl`クラスを生成します。
   生成された実装を呼び出すには、`UserMapper`のコンパニオンオブジェクトを使用します:

   ```kotlin
   fun main() {
       val entity = UserEntity(id = 1L, firstName = "John", lastName = "Doe")
       val dto = UserMapper.toDto(entity)
       println(dto)
       // UserDto(id=1, firstName=John, lastName=Doe)
   }
   ```

## GradleプロジェクトでKSPを使用する {id="use-ksp-in-gradle-projects"}

[KSP](ksp-overview.md)を使用すると、Gradleプロジェクトで既存のアノテーションプロセッサを使用したり、ソースコード内のアノテーションに基づいてコードを生成する独自のプロセッサを作成したりできます。

### JavaアノテーションプロセッサでKSPを使用する {id="use-ksp-with-java-annotation-processors"}

Gradleプロジェクトでは、互換性のあるアノテーションプロセッサとともにKSPを使用してください。KSPはkaptよりも高速で、Kotlin固有の機能をネイティブに理解できます。[すでにKSPをサポートしているライブラリ](ksp-overview.md#supported-libraries)のリストを参照してください。

以下の例は、依存関係グラフの配線コードを生成するコンパイル時依存性注入フレームワークである[Dagger](https://dagger.dev/)の使用方法を示しています。

1. `build.gradle(.kts)`ファイルでKSPプラグインを適用し、`dependencies`ブロックにDaggerを追加します:
 
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

   > KSPの最新バージョンを確認するには、GitHubの[Releases](https://github.com/google/ksp/releases)ページを確認してください。
   >
   {style="tip"}

2. KotlinクラスにDaggerアノテーションを付与します:

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

3. プロジェクトをビルドします。Daggerは`build/generated/ksp`ディレクトリ内に`DaggerAppComponent`などの実装クラスを生成します。コード内で生成されたクラスを使用します:

    ```kotlin
    fun main() {
        val appComponent = DaggerAppComponent.create()
        val userRepository = appComponent.userRepository()
        println("User: ${userRepository.getUser()}")
        // User: John Doe
    }
    ```

DaggerのKSPサポートに関する詳細については、その[ドキュメント](https://dagger.dev/dev-guide/ksp.html)を参照してください。

### 独自のアノテーションプロセッサを作成する {id="create-your-own-annotation-processor"}

KSP APIを使用して、コンパイル時にコードを生成する独自のアノテーションプロセッサを作成できます。
新しいプロセッサには3つのモジュールが必要です:

* カスタムアノテーションを宣言する`annotation`モジュール。
* `SymbolProcessor`および`SymbolProcessorProvider`ファクトリを実装する`processor`モジュール。`SymbolProcessor`にはメインロジックが含まれ、`SymbolProcessorProvider`はプロセッサを作成してプロバイダを`META-INF/services/`パスに登録します。
* KSPプラグインを適用し、プロセッサに依存して、アノテーションを使用する`app`モジュール。

完全なステップバイステップの手順については、[KSPクイックスタート](ksp-quickstart.md#create-your-own-processor)を参照してください。

## 次のステップ {id="what-s-next"}

* [kaptの設定について詳しく学ぶ](kapt.md)
* [KSPを使ってみる](ksp-quickstart.md)
* [kaptからKSPへの移行方法を確認する](ksp-kapt-migration.md)