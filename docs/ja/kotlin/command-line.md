[//]: # (title: Kotlin コマンドラインコンパイラ)

Kotlinの各リリースには、スタンドアロン版のコンパイラが同梱されています。最新バージョンを手動で、またはパッケージマネージャー経由でダウンロードできます。

> コマンドラインコンパイラのインストールは、Kotlinを使用するために必須のステップではありません。
> 一般的な手法は、[IntelliJ IDEA](https://www.jetbrains.com/idea/) や [Android Studio](https://developer.android.com/studio) など、公式のKotlinサポートを備えたIDEやコードエディタを使用してKotlinアプリケーションを作成することです。
> これらは最初から完全なKotlinサポートを提供しています。
> 
> [IDEでKotlinを始める方法](getting-started.md)については、こちらをご覧ください。
> 
{style="note"}

## コンパイラのインストール

### 手動インストール

Kotlinコンパイラを手動でインストールするには：

1. [GitHub Releases](%kotlinLatestUrl%) から最新バージョン（`kotlin-compiler-%kotlinVersion%.zip`）をダウンロードします。
2. スタンドアロンコンパイラをディレクトリに展開し、オプションで `kotlinc/bin` ディレクトリをシステムパスに追加します。
`bin` ディレクトリには、Windows、macOS、LinuxでKotlinをコンパイルおよび実行するために必要なスクリプトが含まれています。

> WindowsでKotlinコマンドラインコンパイラを使用する場合は、手動でインストールすることをお勧めします。
> 
{style="note"}

### SDKMAN!

macOS、Linux、Cygwin、FreeBSD、SolarisなどのUNIXベースのシステムでKotlinをインストールするより簡単な方法は、[SDKMAN!](https://sdkman.io) です。これは Bash や ZSH シェルでも動作します。[SDKMAN!のインストール方法](https://sdkman.io/install)を確認してください。

SDKMAN! 経由でKotlinコンパイラをインストールするには、ターミナルで次のコマンドを実行します。

```bash
sdk install kotlin
```

### Homebrew

あるいは、macOSでは [Homebrew](https://brew.sh/) を使用してコンパイラをインストールできます。

```bash
brew update
brew install kotlin
```

### Snap パッケージ

Ubuntu 16.04以降で [Snap](https://snapcraft.io/) を使用している場合は、コマンドラインからコンパイラをインストールできます。

```bash
sudo snap install --classic kotlin
```

## アプリケーションの作成と実行

1. `"Hello, World!"` を表示するシンプルなKotlinコンソールJVMアプリケーションを作成します。
   コードエディタで、以下のコードを含む `hello.kt` という名前の新しいファイルを作成します。

   ```kotlin
   fun main() {
       println("Hello, World!")
   }
   ```

2. Kotlinコンパイラを使用してアプリケーションをコンパイルします。

   ```bash
   kotlinc hello.kt -include-runtime -d hello.jar
   ```

   * `-d` オプションは、生成されたクラスファイルの出力パスを指定します。これにはディレクトリまたは **.jar** ファイルを指定できます。
   * `-include-runtime` オプションは、Kotlinランタイムライブラリを生成される **.jar** ファイルに含めることで、そのファイルを自己完結型で実行可能にします。

   利用可能なすべてのオプションを表示するには、以下を実行してください。

   ```bash
   kotlinc -help
   ```

3. アプリケーションを実行します。

   ```bash
   java -jar hello.jar
   ```

> Kotlin/Nativeアプリケーションをコンパイルするには、[Kotlin/Nativeコンパイラ](native-get-started.md#using-the-command-line-compiler)を使用してください。
> 
{style="note"}

## ライブラリのコンパイル

他のKotlinアプリケーションで使用されるライブラリを開発している場合は、Kotlinランタイムを含めずに **.jar** ファイルをビルドできます。

```bash
kotlinc hello.kt -d hello.jar
```

この方法でコンパイルされたバイナリはKotlinランタイムに依存するため、コンパイルされたライブラリが使用される際には、クラスパスにランタイムが存在することを確認する必要があります。

また、`kotlinr` スクリプトを使用して、Kotlinコンパイラによって生成されたバイナリを実行することもできます。

```bash
kotlinr -classpath hello.jar HelloKt
```

`HelloKt` は、`hello.kt` という名前のファイルに対してKotlinコンパイラが生成するメインクラス名です。

> Kotlin/Nativeライブラリをコンパイルするには、[Kotlin/Nativeコンパイラ](native-libraries.md#using-kotlin-native-compiler)を使用してください。
>
{style="note"}

## REPLの実行

対話型シェル（REPL）を使用するには、[`-Xrepl` コンパイラオプション](compiler-reference.md#xrepl)を指定してコンパイラを実行します。このシェルでは、任意の有効なKotlinコードを入力して、その結果を確認できます。

## スクリプトの実行

Kotlinをスクリプティング言語として使用できます。
Kotlinスクリプトは、トップレベルに実行可能コードを持つKotlinソースファイル（`.kts`）です。

```kotlin
import java.io.File

// 渡されたパス（例: "-d some/path"）を取得するか、現在のパスを使用します。
val path = if (args.contains("-d")) args[1 + args.indexOf("-d")]
           else "."

val folders = File(path).listFiles { file -> file.isDirectory() }
folders?.forEach { folder -> println(folder) }
```

スクリプトを実行するには、コンパイラに `-script` オプションと対応するスクリプトファイルを渡します。

```bash
kotlinc -script list_folders.kts -- -d <path_to_folder_to_inspect>
```

Kotlinは、外部プロパティの追加、静的または動的な依存関係の提供など、スクリプトのカスタマイズのための実験的なサポートを提供しています。
カスタマイズは、いわゆる *スクリプト定義 (script definitions)* （適切なサポートコードを備えた、アノテーション付きのKotlinクラス）によって定義されます。
適切な定義を選択するために、スクリプトのファイル拡張子が使用されます。
詳細は [Kotlinのカスタムスクリプティング](custom-script-deps-tutorial.md) を参照してください。

適切に準備されたスクリプト定義は、適切なjarファイルがコンパイルクラスパスに含まれている場合に自動的に検出され適用されます。あるいは、コンパイラに `-script-templates` オプションを渡すことで、手動で定義を指定することもできます。

```bash
kotlinc -script-templates org.example.CustomScriptDefinition -script custom.script1.kts
```

詳細については、[KEEP-75](https://github.com/Kotlin/KEEP/blob/master/proposals/scripting-support.md) を参照してください。

## 次のステップ

[Kotlin/JVMによるコンソールアプリケーションの作成](jvm-get-started.md)