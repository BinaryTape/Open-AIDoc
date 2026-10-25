[//]: # (title: サポートされているプラットフォーム)

Ktor サーバーは、Kotlin でサポートされている以下のプラットフォームで使用できます。
- JVM
- [Native](server-native.md)
   > Kotlin/Native プロジェクトで Ktor を使用するには、[新しいメモリマネージャー](https://kotlinlang.org/docs/native-memory-manager.html)が必要です。これは Kotlin 1.7.20 以降でデフォルトで有効になっています。
   >
   {id="newmm-note" style="note"}
- [JavaScript](https://kotlinlang.org/docs/js-overview.html)
- [WasmJs](https://kotlinlang.org/docs/wasm-overview.html)

以下の[ターゲット](https://kotlinlang.org/docs/multiplatform-dsl-reference.html#targets)がサポートされています。

<table>

<tr>
<td>
        ターゲットプラットフォーム
    </td>
    <td>
        ターゲットプリセット
    </td>
</tr>

<tr>
<td>
        Kotlin/JVM
    </td>
    <td>
        <list>
            <li>
                <code>jvm</code>
            </li>
        </list>
    </td>
</tr>

<tr>
<td>
        Kotlin/Wasm
    </td>
    <td>
        <list>
            <li>
                <code>wasmJs</code>
            </li>
        </list>
    </td>
</tr>

<tr>
<td>
        Kotlin/JS
    </td>
    <td>
        <list>
            <li>
                <code>js</code>
            </li>
        </list>
    </td>
</tr>

<tr>
<td>
        Android
    </td>
    <td>
        <list>
            <li>
                <code>androidNativeArm32</code>
            </li>
            <li>
                <code>androidNativeArm64</code>
            </li>
            <li>
                <code>androidNativeX86</code>
            </li>
            <li>
                <code>androidNativeX64</code>
            </li>
        </list>
    </td>
</tr>

<tr>
<td>
        iOS
    </td>
    <td>
        <list>
            <li>
                <code>iosArm32</code>
            </li>
            <li>
                <code>iosArm64</code>
            </li>
            <li>
                <code>iosX64</code>
            </li>
            <li>
                <code>iosSimulatorArm64</code>
            </li>
        </list>
    </td>
</tr>

<tr>
<td>
        watchOS
    </td>
    <td>
        <list>
            <li>
                <code>watchosArm32</code>
            </li>
            <li>
                <code>watchosArm64</code>
            </li>
            <li>
                <code>watchosX86</code>
            </li>
            <li>
                <code>watchosX64</code>
            </li>
            <li>
                <code>watchosSimulatorArm64</code>
            </li>
        </list>
    </td>
</tr>

<tr>
<td>
        tvOS
    </td>
    <td>
        <list>
            <li>
                <code>tvosArm64</code>
            </li>
            <li>
                <code>tvosX64</code>
            </li>
            <li>
                <code>tvosSimulatorArm64</code>
            </li>
        </list>
    </td>
</tr>

<tr>
<td>
        macOS
    </td>
    <td>
        <list>
            <li>
                <code>macosX64</code>
            </li>
            <li>
                <code>macosArm64</code>
            </li>
        </list>
    </td>
</tr>

<tr>
<td>
        Linux
    </td>
    <td>
        <list>
            <li>
                <code>linuxX64</code>
            </li>
            <li>
                <code>linuxArm64</code>
            </li>
        </list>
    </td>
</tr>

<tr>
<td>
        Windows
    </td>
    <td>
        <list>
            <li>
                <code>mingwX64</code>
            </li>
        </list>
    </td>
</tr>

</table>