[//]: # (title: 定義ファイル)

Kotlin/Native を使用すると、C および Objective-C ライブラリを利用して、その機能を Kotlin で使用できるようになります。
cinterop と呼ばれる特別なツールが C または Objective-C ライブラリを取り込み、対応する Kotlin バインディングを生成します。
これにより、ライブラリのメソッドを通常の Kotlin コードと同様に使用できるようになります。

これらのバインディングを生成するには、各ライブラリに定義ファイル（通常はライブラリと同じ名前）が必要です。
これは、ライブラリをどのように利用すべきかを正確に記述するプロパティファイルです。利用可能なプロパティの完全な[リスト](#properties)を参照してください。

プロジェクトで作業する際の一般的なワークフローは次のとおりです：

1. バインディングに何を含めるかを記述した `.def` ファイルを作成する。
2. 生成されたバインディングを Kotlin コードで使用する。
3. Kotlin/Native コンパイラを実行して、最終的な実行ファイルを生成する。

## 定義ファイルの作成と設定 {id="create-and-configure-a-definition-file"}

C ライブラリ用の定義ファイルを作成し、バインディングを生成してみましょう：

1. IDE で `src` フォルダを選択し、**File | New | Directory** で新しいディレクトリを作成します。
2. 新しいディレクトリに `nativeInterop/cinterop` と名前を付けます。
   
   これは `.def` ファイルの場所に関するデフォルトの規約ですが、別の場所を使用する場合は `build.gradle.kts` ファイルで上書きできます。
3. 新しいサブフォルダを選択し、**File | New | File** で `png.def` ファイルを作成します。
4. 必要なプロパティを追加します：

   ```none
   headers = png.h
   headerFilter = png.h
   package = png
   
   compilerOpts.linux = -I/usr/include -I/usr/include/x86_64-linux-gnu
   linkerOpts.osx = -L/opt/local/lib -L/usr/local/opt/png/lib -lpng
   linkerOpts.linux = -L/usr/lib/x86_64-linux-gnu -lpng
   ```

   * `headers` は、Kotlin スタブを生成するためのヘッダーファイルのリストです。このエントリには、スペースで区切って複数のファイルを追加できます。この例では `png.h` のみです。参照されるファイルは、指定されたパス（この例では `/usr/include/png`）で利用可能である必要があります。
   * `headerFilter` は、具体的に何が含まれるかを示します。C では、あるファイルが別のファイルを `#include` ディレクティブで参照している場合、すべてのヘッダーも含まれます。これが不要な場合もあり、このパラメータに [glob パターンを使用して](https://en.wikipedia.org/wiki/Glob_(programming))調整を加えることができます。

     システムの `stdint.h` ヘッダーなどの外部依存関係を interop ライブラリに取り込みたくない場合に `headerFilter` を使用できます。また、ライブラリサイズの最適化や、システムと提供された Kotlin/Native コンパイル環境との間の潜在的な競合の修正にも役立つ場合があります。

   * 特定のプラットフォームでの動作を変更する必要がある場合は、`compilerOpts.osx` や `compilerOpts.linux` のような形式を使用して、オプションにプラットフォーム固有の値を指定できます。この例では、macOS（`.osx` サフィックス）と Linux（`.linux` サフィックス）です。サフィックスのないパラメータ（例：`linkerOpts=`）も可能で、すべてのプラットフォームに適用されます。

5. バインディングを生成するには、通知の **Sync Now** をクリックして Gradle ファイルを同期します。

   ![Gradle ファイルを同期する](gradle-sync.png)

バインディングの生成後、IDE はそれらをネイティブライブラリのプロキシビューとして使用できます。

> コマンドラインで [cinterop ツール](#generate-bindings-using-command-line)を使用してバインディング生成を設定することもできます。
> 
{style="tip"}

## プロパティ {id="properties"}

以下は、生成されるバイナリの内容を調整するために定義ファイルで使用できるプロパティの完全なリストです。
詳細については、以下の対応するセクションを参照してください。

| **プロパティ**                                                                        | **説明**                                                                                                                                                                                                          |
|-------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`headers`](#import-headers)                                                        | バインディングに含めるライブラリのヘッダーのリスト。                                                                                                                                                       |
| [`modules`](#import-modules)                                                        | バインディングに含める Objective-C ライブラリの Clang モジュールのリスト。                                                                                                                                    |
| `language`                                                                          | 言語を指定します。デフォルトでは C が使用されます。必要に応じて `Objective-C` に変更してください。                                                                                                                                      |
| [`compilerOpts`](#pass-compiler-and-linker-options)                                 | cinterop ツールが C コンパイラに渡すコンパイラオプション。                                                                                                                                                        |
| [`linkerOpts`](#pass-compiler-and-linker-options)                                   | cinterop ツールがリンカーに渡すリンカーオプション。                                                                                                                                                              |
| [`excludedFunctions`](#ignore-specific-functions)                                   | 無視すべき関数名のスペース区切りリスト。                                                                                                                                                         |                                              
| [`staticLibraries`](#include-a-static-library)                                      | [試験的](components-stability.md#stability-levels-explained)。スタティックライブラリを `.klib` に含めます。                                                                                                              |
| [`libraryPaths`](#include-a-static-library)                                         | [試験的](components-stability.md#stability-levels-explained)。cinterop ツールが `.klib` に含めるライブラリを検索するディレクトリのスペース区切りリスト。                                    |
| [`package`](#set-the-package-name)                                                  | 生成される Kotlin API のパッケージ接頭辞。                                                                                                                                                                             |
| [`headerFilter`](#filter-headers-by-globs)                                          | ヘッダーを glob でフィルタリングし、ライブラリのインポート時にそれらのみを含めます。                                                                                                                                                |
| [`excludeFilter`](#exclude-headers)                                                 | ライブラリのインポート時に特定のヘッダーを除外します。`headerFilter` よりも優先されます。                                                                                                                               |
| [`strictEnums`](#configure-enums-generation)                                        | [Kotlin enum](enum-classes.md) として生成すべき enum のスペース区切りリスト。                                                                                                                             |
| [`nonStrictEnums`](#configure-enums-generation)                                     | 整数値として生成すべき enum のスペース区切りリスト。                                                                                                                                             |
| [`noStringConversion`](#set-up-string-conversion)                                   | `const char*` パラメータを Kotlin の `String` に自動変換すべきではない関数のスペース区切りリスト。                                                                                                     |
| `allowedOverloadsForCFunctions`                                                     | デフォルトでは、C 関数は一意の名前を持つものと見なされます。複数の関数が同じ名前を持つ場合、1 つだけが選択されます。ただし、これらの関数を `allowedOverloadsForCFunctions` に指定することで、この動作を変更できます。 |
| [`disableDesignatedInitializerChecks`](#allow-calling-a-non-designated-initializer) | 指定イニシャライザ（designated initializer）ではない Objective-C イニシャライザを `super()` コンストラクタとして呼び出すことを許可しないコンパイラチェックを無効にします。                                                                                              |
| [`foreignExceptionMode`](#handle-objective-c-exceptions)                            | Objective-C コードからの例外を `ForeignException` 型の Kotlin 例外にラップします。                                                                                                                          |
| [`userSetupHint`](#help-resolve-linker-errors)                                      | ユーザーがリンカーエラーを解決するのに役立つなどの目的で、カスタムメッセージを追加します。                                                                                                                                                 |

<!-- | `excludedMacros`                                                                    |                                                                                                                                                                                                                          |
| `objcClassesIncludingCategories`                                                    |                                                                                                                                                                                                                          | -->

プロパティのリストに加えて、定義ファイルに[カスタム宣言](#add-custom-declarations)を含めることができます。

### ヘッダーのインポート {id="import-headers"}

C ライブラリに Clang モジュールがなく、代わりに一連のヘッダーで構成されている場合は、`headers` プロパティを使用してインポートすべきヘッダーを指定します：

```none
headers = curl/curl.h
```

#### glob によるヘッダーのフィルタリング {id="filter-headers-by-globs"}

`.def` ファイルのフィルタプロパティを使用して、glob でヘッダーをフィルタリングできます。ヘッダーからの宣言を含めるには、`headerFilter` プロパティを使用します。ヘッダーが glob のいずれかに一致する場合、その宣言はバインディングに含まれます。

glob は、適切な include パス要素（例：`time.h` や `curl/curl.h`）に対する相対的なヘッダーパスに適用されます。そのため、ライブラリが通常 `#include <SomeLibrary/Header.h>` でインクルードされる場合、おそらく次のフィルタでヘッダーをフィルタリングできます：

```none
headerFilter = SomeLibrary/**
```

`headerFilter` が提供されない場合、すべてのヘッダーが含まれます。ただし、`headerFilter` を使用し、可能な限り正確に glob を指定することをお勧めします。この場合、生成されるライブラリには必要な宣言のみが含まれます。これにより、開発環境での Kotlin やツールのアップグレード時に発生するさまざまな問題を回避するのに役立ちます。

#### ヘッダーの除外 {id="exclude-headers"}

特定のヘッダーを除外するには、`excludeFilter` プロパティを使用します。指定されたヘッダーからの宣言はバインディングに含まれないため、冗長なヘッダーや問題のあるヘッダーを削除し、コンパイルを最適化するのに役立ちます：

```none
excludeFilter = SomeLibrary/time.h
```

> 同じヘッダーが `headerFilter` でインクルードされ、かつ `excludeFilter` で除外されている場合、そのヘッダーはバインディングに含まれません。
>
{style="note"}

### モジュールのインポート {id="import-modules"}

Objective-C ライブラリに Clang モジュールがある場合は、`modules` プロパティを使用してインポートすべきモジュールを指定します：

```none
modules = UIKit
```

### パッケージ名の設定 {id="set-the-package-name"}

生成される Kotlin API のパッケージ接頭辞を指定するには、`package` プロパティを使用します：

```none
package = png
```

このプロパティを指定しない場合、コンパイラはルートパッケージに宣言を生成します。

> `kotlin` および `kotlinx.cinterop` という名前は予約されており、パッケージ接頭辞として使用することはできません。
>
{style="note"}

### コンパイラおよびリンカーオプションの指定 {id="pass-compiler-and-linker-options"}

`compilerOpts` プロパティを使用して、内部でヘッダーを解析するために使用される C コンパイラにオプションを渡します。最終的な実行ファイルをリンクするために使用されるリンカーにオプションを渡すには、`linkerOpts` を使用します。例：

```none
compilerOpts = -DFOO=bar
linkerOpts = -lpng
```

特定のターゲットにのみ適用されるターゲット固有のオプションを指定することもできます：

```none
compilerOpts = -DBAR=bar
compilerOpts.linux_x64 = -DFOO=foo1
compilerOpts.macos_x64 = -DFOO=foo2
```

この設定では、Linux では `-DBAR=bar -DFOO=foo1` を使用し、macOS では `-DBAR=bar -DFOO=foo2` を使用してヘッダーが解析されます。定義ファイルのオプションには、共通部分とプラットフォーム固有の部分の両方を含めることができることに注意してください。

### 特定の関数の無視 {id="ignore-specific-functions"}

無視すべき関数名のリストを指定するには、`excludedFunctions` プロパティを使用します。これは、ヘッダーで宣言された関数が呼び出し可能であることが保証されておらず、これを自動的に判断するのが困難または不可能な場合に役立ちます。また、interop 自体のバグを回避するためにこのプロパティを使用することもできます。

### スタティックライブラリの取り込み {id="include-a-static-library"}

<primary-label ref="experimental-general"/>

ユーザーの環境で利用可能であることを前提とするよりも、スタティックライブラリを製品と一緒に配布する方が便利な場合があります。スタティックライブラリを `.klib` に含めるには、`staticLibrary` と `libraryPaths` プロパティを使用します：

```none
headers = foo.h
staticLibraries = libfoo.a
libraryPaths = /opt/local/lib /usr/local/opt/curl/lib
```

上記のスニペットが与えられると、cinterop ツールは `/opt/local/lib` および `/usr/local/opt/curl/lib` で `libfoo.a` を検索し、見つかった場合はライブラリバイナリを `klib` に含めます。

このように `klib` をプログラムで使用すると、ライブラリは自動的にリンクされます。

### enum 生成の設定 {id="configure-enums-generation"}

enum を Kotlin enum として生成するには `strictEnums` プロパティを使用し、整数値として生成するには `nonStrictEnums` を使用します。enum がこれらのリストのいずれにも含まれていない場合、ヒューリスティックに基づいて生成されます。

### 文字列変換の設定 {id="set-up-string-conversion"}

`const char*` 関数パラメータを Kotlin の `String` として自動変換する機能を無効にするには、`noStringConversion` プロパティを使用します。

### 指定イニシャライザ以外の呼び出しを許可する {id="allow-calling-a-non-designated-initializer"}

デフォルトでは、Kotlin/Native コンパイラは、指定イニシャライザ（designated initializer）ではない Objective-C イニシャライザを `super()` コンストラクタとして呼び出すことを許可しません。指定イニシャライザがライブラリ内で適切にマークされていない場合、この動作は不便な場合があります。これらのコンパイラチェックを無効にするには、`disableDesignatedInitializerChecks` プロパティを使用します。

### Objective-C 例外の処理 {id="handle-objective-c-exceptions"}

デフォルトでは、Objective-C 例外が Objective-C と Kotlin の interop 境界に達し、Kotlin コードに到達すると、プログラムはクラッシュします。

Objective-C 例外を Kotlin に伝播させるには、`foreignExceptionMode = objc-wrap` プロパティを使用してラッピングを有効にします。この場合、Objective-C 例外は `ForeignException` 型を持つ Kotlin 例外に変換されます。

### リンカーエラーの解決を支援する {id="help-resolve-linker-errors"}

Kotlin ライブラリが C または Objective-C ライブラリに依存している場合（例：[CocoaPods 統合](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-overview.html)を使用している場合）、リンカーエラーが発生することがあります。依存ライブラリがマシンにローカルにインストールされていないか、プロジェクトのビルドスクリプトで明示的に構成されていない場合、"Framework not found" エラーが発生します。

ライブラリの作成者であれば、カスタムメッセージを使用してユーザーがリンカーエラーを解決するのを助けることができます。そのためには、`.def` ファイルに `userSetupHint=message` プロパティを追加するか、`cinterop` に `-Xuser-setup-hint` コンパイラオプションを渡します。

### カスタム宣言の追加 {id="add-custom-declarations"}

バインディングを生成する前に、ライブラリにカスタム C 宣言を追加する必要がある場合があります（例：[マクロ](native-c-interop.md#macros)の場合）。
これらの宣言を含む追加のヘッダーファイルを作成する代わりに、区切りシーケンス `---` のみの行の後に、それらを `.def` ファイルの末尾に直接含めることができます：

```none
headers = errno.h
---

static inline int getErrno() {
    return errno;
}
```

`.def` ファイルのこの部分はヘッダーファイルの一部として扱われるため、本体を持つ関数は `static` として宣言する必要があることに注意してください。宣言は、`headers` リストのファイルをインクルードした後に解析されます。

## コマンドラインを使用したバインディングの生成 {id="generate-bindings-using-command-line"}

定義ファイルに加えて、`cinterop` 呼び出しのオプションとして対応するプロパティを渡すことで、バインディングに含める内容を指定できます。

以下は、コンパイル済みライブラリ `png.klib` を生成するコマンドの例です：

```bash
cinterop -def png.def -compiler-option -I/usr/local/include -o png
```

生成されたバインディングは一般にプラットフォーム固有であるため、複数のターゲット向けに開発している場合は、バインディングを再生成する必要があることに注意してください。

* sysroot の検索パスに含まれていないホストライブラリの場合、ヘッダーが必要になることがあります。
* 設定スクリプトを持つ一般的な UNIX ライブラリの場合、`compilerOpts` には `--cflags` オプション（正確なパスは含まれない可能性があります）を付けた設定スクリプトの出力が含まれる可能性が高いです。
* `--libs` を付けた設定スクリプトの出力は、`linkerOpts` プロパティに渡すことができます。

## 次のステップ {id="what-s-next"}

* [C-interoperability のバインディング](native-c-interop.md#bindings)
* [Swift/Objective-C との相互運用性](native-objc-interop.md)