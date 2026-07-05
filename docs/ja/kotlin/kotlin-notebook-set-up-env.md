[//]: # (title: 環境のセットアップ)

> IntelliJ IDEA 2026.2 以降、Kotlin Notebook は IDE にバンドルされなくなり、JetBrains による公式サポートも終了します。
> ソースコードは引き続き [GitHub](https://github.com/Kotlin/kotlin-notebook) で公開されます。
>
> 詳細はブログ記事をご覧ください。
>
{style="note"}

<tldr>
   <p>これは<strong>Kotlin Notebook入門</strong>チュートリアルの最初のパートです：</p>
   <p><img src="icon-1.svg" width="20" alt="最初のステップ"/> <strong>環境のセットアップ</strong><br/>
      <img src="icon-2-todo.svg" width="20" alt="2番目のステップ"/> Kotlin Notebookの作成<br/>
      <img src="icon-3-todo.svg" width="20" alt="3番目のステップ"/> Kotlin Notebookへの依存関係の追加<br/>
  </p>
</tldr>

最初の [Kotlin Notebook](kotlin-notebook-overview.md) を作成する前に、環境をセットアップする必要があります。

## 環境のセットアップ

Kotlin Notebook は [Kotlin Notebook プラグイン](https://plugins.jetbrains.com/plugin/16340-kotlin-notebook)に依存しています。

Kotlin Notebook を使用するには、[IntelliJ IDEA 2026.1 以前](https://www.jetbrains.com/idea/download/other/)をダウンロードしてインストールしてください。

Kotlin Notebook の機能が利用できない場合は、プラグインが有効になっていることを確認してください：

1. IntelliJ IDEA で、**IntelliJ IDEA | Settings | Plugins** を選択します。
2. **Installed** タブで **Kotlin Notebook** プラグインを見つけ、プラグイン名の横にあるチェックボックスを選択します。

   ![Kotlin Notebookのインストール](kotlin-notebook-plugin.png){width=700}

3. **OK** をクリックして変更を適用し、プロンプトが表示された場合は IDE を再起動します。

## 次のステップ

チュートリアルの次のパートでは、Kotlin Notebook を作成する方法を学びます。

**[次の章に進む](kotlin-notebook-create.md)**