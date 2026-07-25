import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { fileURLToPath } from "url";
import pLimit from "p-limit";
import { toContentRelPath } from "../../shared/content-paths.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load configuration from config file
const configPath = path.resolve(__dirname, "./translate-config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

// Google LLM API
let genAI = (() => {
  let instance;
  return () => {
    if (!instance) {
      instance = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
    }
    return instance;
  };
})();

// Load terminology database
// terminology.json is an array of objects, each keyed by "Term [en]": "Term [<locale>]"
// We parse it once and select the right object per target language at translation time.
const TERM_LANG_MAP = { 'zh-Hans': 'zh-CN', 'zh-Hant': 'zh-TW' };
let terminologyData = [];
try {
  terminologyData = JSON.parse(fs.readFileSync(config.terminologyPath, "utf8"));
} catch (error) {
  terminologyData = [];
}

/**
 * Select and minify terminology for a given target language.
 * Returns a minified JSON string, or empty string if no match.
 */
export function getTerminologyForLang(targetLang) {
  const locale = TERM_LANG_MAP[targetLang];
  if (!locale) return "";
  const header = `Term [${locale}]`;
  const matched = terminologyData.find(obj => obj["Term [en]"] === header);
  if (!matched) return "";
  // Strip the header key and minify
  const { "Term [en]": _, ...terms } = matched;
  return JSON.stringify(terms);
}

// Calculate target file path under docs/ (default locale has no language prefix)
function getTargetPath(filePath, targetLang) {
  const baseDir = "./docs";
  const docType = process.env.DOC_TYPE;
  const relativePath = path.relative(process.env.DOC_PATH, filePath);
  return path.join(baseDir, toContentRelPath(targetLang, docType, relativePath));
}

// Load previously translated related files as reference
function loadPreviousTranslations(targetLang, currentFilePath) {
  try {
    // Calculate path for the corresponding translation file
    const targetPath = getTargetPath(currentFilePath, targetLang);

    // Check if corresponding translation file exists
    if (!fs.existsSync(targetPath)) {
      console.log(`Reference translation file does not exist: ${targetPath}`);
      return [];
    }

    // Read previous translation content
    const content = fs.readFileSync(targetPath, "utf8");
    console.log(
      `Successfully loaded reference translation file: ${targetPath}`
    );

    return [
      {
        file: targetPath,
        content: content,
      },
    ];
  } catch (error) {
    console.error("Error loading previous translation:", error);
    return [];
  }
}

// Prepare translation prompt
function prepareTranslationPrompt(sourceText, targetLang, currentFilePath) {
  // Get relevant terminology (minified JSON for the target language)
  const relevantTerms = getTerminologyForLang(targetLang);

  // Get previously translated file with the same name as reference
  const previousTranslations = currentFilePath.includes("locales")
    ? fs.readFileSync(currentFilePath, "utf8")
    : loadPreviousTranslations(targetLang, currentFilePath);

  // Build reference translation section
  let translationReferences = "";
  if (previousTranslations.length > 0) {
    // Choose English or Chinese based on target language
    if (targetLang === "ja" || targetLang === "ko") {
      translationReferences =
        "\n## Reference Translations (Reference previously translated documents to maintain consistent style and terminology)\n";
      translationReferences += `### Previous Translation Version\n\`\`\`\n${previousTranslations[0].content}\n\`\`\`\n\n`;
    } else {
      translationReferences = `\n\`\`\`\n${previousTranslations[0].content}\n\`\`\`\n\n`;
    }
  }

  // Choose appropriate prompt template based on target language
  const promptTemplate = currentFilePath.includes("locales")
    ? getLocalePromptTemplate(getLangDisplayName(targetLang))
    : getPromptTemplate(targetLang, getLangDisplayName(targetLang));

  // Insert variables into template
  return fillPromptTemplate(promptTemplate, targetLang, sourceText, relevantTerms, translationReferences);
}

// Fill prompt template with variables, using language-appropriate fallback text
export function fillPromptTemplate(template, targetLang, sourceText, terms, references) {
  const noTerms = (targetLang === "ja" || targetLang === "ko") ? "No relevant terms" : "无相关术语";
  const noRefs = (targetLang === "ja" || targetLang === "ko") ? "No reference translations" : "无参考翻译";

  return template
    .replace("{RELEVANT_TERMS}", terms || noTerms)
    .replace("{TRANSLATION_REFERENCES}", references || noRefs)
    .replace("{SOURCE_TEXT}", sourceText);
}

export function getLocalePromptTemplate(langDisplayName) {
  return `# Role & Task
  You are a professional AI translation assistant. Your job is to translate **Kotlin/GitHub-related** English JSON copy into ${langDisplayName}. You must produce high-quality, technically accurate text that reads naturally for a developer audience—**without changing any JSON structure or keys**. Translate **values only**.

## 1) General Requirements
  1. **Translate values only; do not modify keys.** Keep all keys, nesting, and order exactly the same.
  2. **Return valid JSON.** Preserve correct JSON syntax and escaping (quotes, backslashes, \`\\n\`, \`\\t\`, etc.).
3. **Clean output.** Return only the final JSON—no explanations, headers, or comments.
4. **Do not translate URLs/paths/version strings.** Keep items like \`https://...\`, file/image paths, \`Kotlin 2.2.0\`, \`2.2.20-Beta1\` unchanged.
5. **Product and proper names.** Keep terms like \`Kotlin\`, \`JetBrains\`, \`Gradle\`, \`Kotlin Multiplatform\` in English unless the Glossary says otherwise.
6. **Tone and fluency.** Ensure technical accuracy and natural, idiomatic ${langDisplayName} suitable for developer-facing UI/Docs.
7. **Do not re-translate already translated values.** If a value is already in ${langDisplayName} (e.g., matches the Glossary/known translations, or clearly contains only ${langDisplayName} text), **leave it unchanged**. If a value mixes English with placeholders/brands, translate only the human-readable English parts and preserve the rest.

## 2) Terminology & Placeholders
1. **Glossary has highest priority.** Use the translations from the Glossary exactly as given.
2. **Consistency.** If a term isn’t in the Glossary, follow the Translation References for style and consistency.
3. **Do not alter placeholders or code-like fragments:**
   - API/class/method/config names, flags, CLI commands.
4. **Uncertain technical terms.** If no guidance exists and translation may confuse, **keep the English term**. In pure JSON UI strings, prefer keeping English rather than risking misleading translations.

## 3) Format & Safety
1. **Only change value strings.** Do not add/remove pairs, reorder keys, or introduce trailing commas.
2. **Escaping.** Correctly preserve and escape \`"\`, \`\\\`, \`\\n\`, \`\\t\`, and Unicode characters.
3. **ICU/Plural/Message syntax.** If values contain patterns like \`{count, plural, one {...} other {...}}\`, keep the syntax and variable names unchanged; translate only the human-readable text.
4. **Contractions and punctuation.** Render them naturally in ${langDisplayName} while keeping JSON validity.

## 4) Output Requirements
1. **Return the translated JSON only** (UTF-8). No code fences or extra text.
2. **Structure must match the source exactly** (keys, nesting, order).
3. **Quality checks.** Ensure technical correctness, clarity, and fluency; no typos or broken placeholders.

---
## 5) Resources
### Glossary
{RELEVANT_TERMS}

### Translation References
{TRANSLATION_REFERENCES}

---
## 6) Source JSON
Translate **all values** in the following JSON from English into ${langDisplayName}, and return valid JSON per the rules above:

{SOURCE_TEXT}
`;
}

// Get appropriate prompt template based on target language
export function getPromptTemplate(targetLang, langDisplayName) {
  // Japanese and Korean use English prompts
  if (targetLang === "ja" || targetLang === "ko") {
    return `# Role and Task
  
    You are a professional AI translation assistant specializing in translating **Kotlin-related** English technical documentation into ${langDisplayName} with precision. Your goal is to produce high-quality, technically accurate translations that conform to the reading habits of the target language, primarily for a **developer audience**. Please strictly follow these guidelines and requirements:
    
    ## I. Translation Style and Quality Requirements
    
    1.  **Faithful to the Original and Fluent Expression:**
        * Translations should be natural and fluent while ensuring technical accuracy, conforming to the language habits of ${langDisplayName} and the expression style of the internet technology community.
        * Properly handle the original sentence structure and word order, avoiding literal translations that may create reading obstacles.
        * Maintain the tone of the original text (e.g., formal, informal, educational).
    
    2.  **Terminology Handling:**
        * **Prioritize the Terminology List:** Strictly translate according to the terminology list provided below. The terminology list has the highest priority.
        * **Reference Translation Consistency:** For terms not included in the terminology list, please refer to the reference translations to maintain consistency in style and existing terminology usage.
        * **New/Ambiguous Terminology Handling:**
            * For proper nouns or technical terms not included in the terminology list and without precedent in reference translations, if you choose to translate them, it is recommended to include the original English in parentheses after the translation at first occurrence, e.g., "Translation (English Term)".
            * If you are uncertain about a term's translation, or believe keeping the English is clearer, please **keep the original English text**.
        * **Placeholders/Variable Names:** Placeholders (such as \`YOUR_API_KEY\`) or special variable names in the document that are not in code blocks should usually be kept in English, or translated with comments based on context.
    
    ## II. Technical Format Requirements
    
    1.  **Markdown Format:**
        * Completely preserve all Markdown syntax and formatting in the original text, including but not limited to: headers, lists, bold, italics, strikethrough, blockquotes, horizontal rules, admonitions (:::), etc.
    
    2.  **Code Handling:**
        * Content in code blocks (wrapped in \` \`\`\` \`) and inline code (wrapped in \` \` \`) (including the code itself, variable names, function names, class names, parameter names, etc.) **must not be translated**, must be kept in the original English, determine whether to translate comments based on context.
    
    3.  **Links and Images:**
        * All links (URLs) and image reference paths in the original text must remain unchanged.
    
    4.  **HTML Tags:**
        * If HTML tags are embedded in the original Markdown, these tags and their attributes should also remain unchanged.
        
    ## III. YAML Frontmatter and Special Comments Handling Requirements
    
    1.  **Format Preservation:**
        * The format of the YAML Frontmatter section at the beginning of the document, surrounded by two '---', must be strictly preserved.
        * Keep all field names, colons, quotes, and other format symbols unchanged.
        
    2.  **Field Translation:**
        * Only translate the content values of fields like 'title', 'description', etc.
        * If field values contain quotes, ensure that the quote format is correctly preserved after translation.
        * Do not translate field names, configuration parameter names, or special identifiers.
        
    3.  **Special Comments Handling:**
        * Translate the title content in special comments like \`[//]: # (title: Content to translate)\`.
        * Keep the comment format unchanged, only translate the actual content after the colon.
        * Example: \`[//]: # (title: Kotlin/Native as an Apple framework – tutorial)\` should be translated to appropriate target language while maintaining the format.
    
    ## IV. Output Requirements
    
    1.  **Clean Output:** Output only the translated Markdown content. Do not include any additional explanations, statements, apologies, or self-comments (e.g., "This is a good translation..." or "Please note...").
    2.  **Consistent Structure:** Maintain the same document structure and paragraphing as the original text.
    
    ---
    
    ## V. Resources
    
    ### 1. Terminology List (Glossary)
    * The following terms must use the specified translations:
    {RELEVANT_TERMS}
    
    ### 2. Reference Translations
    * Please refer to the following previously translated document fragments to maintain consistency in style and terminology:
    {TRANSLATION_REFERENCES}
    
    ---
    
    ## VI. Content to Translate
    * Please translate the following Markdown content from English to ${langDisplayName}:
    
    \`\`\`markdown
    {SOURCE_TEXT}
    \`\`\``;
  }

  if (targetLang === "zh-Hant") {
    return `# 角色與任務

    你是一位專業的 AI 翻譯助手，負責專門將 **Github 中 Kotlin 相關的** 英文技術文件精準翻譯為台灣的 ${langDisplayName}。你的目標是產出高品質、技術準確、且符合目標語言閱讀習慣的譯文，主要面向 **開發者受眾**。請嚴格遵循以下指導原則和要求：

    ## 一、翻譯風格與品質要求

    1. **忠實原文與流暢表達**

    * 在確保技術準確性的前提下，譯文應自然流暢，符合 ${langDisplayName} 的語言習慣和網路技術社群的表達方式。
    * 妥善處理原文的語序和句子結構，避免生硬直譯或造成閱讀障礙。
    * 保持原文的語氣（例如：正式、非正式、教學性）。

    2. **術語與優先級規則（重要）**

    * **優先級次序：** 術語表（Glossary） > 文內慣例 > 一般語言習慣。
    * **衝突裁決：** 當「專有名詞不譯」與「常規含義可譯」衝突時，以術語表 **適用上下文** 說明裁決。
    * **不翻譯術語的形態：** 列入「**不翻譯術語**」的詞一律保持 **英文原形與大小寫**，即使原文為複數或時態變化也要還原為詞典形（如 *futures* → **future**）。
    * **翻譯術語：** 按術語表「翻譯術語」指定譯法執行。若存在「不要譯作 …」的禁用譯法，嚴禁使用。
    * **括號稱謂統一：** 使用「圓括號 / 方括號 / 花括號」，不得使用「小/中/大括號」。

    3. **新／模糊術語處理**

    * 對於術語表中未包含、參考翻譯亦無先例的專有名詞或技術術語：

    * 若你選擇翻譯，**首次出現**可在中文後以括號附註英文原文（可選），如：\`譯文 (English Term)\`。
         * 若不確定或保留英文更清晰，**直接保留英文原文**；必要時在譯文處標註 **\[待確認]**。
    
    4. **風格統一（補充）**
    
       * 程式碼、API 名稱、類別名、方法名、關鍵字、套件名稱等 **一律保持英文與大小寫**，不加空格。
       * 標點遵循中文習慣；數值與單位之間保留半形空格（如 \`10 MB\`）。
    
    ## 二、技術格式要求
    
    1.  **Markdown 格式：**
        * 完整保留原文中的所有 Markdown 語法和格式，包括但不限於：標題 (headers)、清單 (lists)、粗體 (bold)、斜體 (italics)、刪除線 (strikethrough)、引文區塊 (blockquotes)、分隔線 (horizontal rules)、Admonition (:::) 等。
    
    2.  **程式碼處理：**
        * 程式碼區塊 (以 \` \`\`\` \` 包裹) 和行內程式碼 (以 \` \`\` \` 包裹) 中的內容（包括程式碼本身、變數名、函式名、類別名、參數名等）**均不得翻譯**，必須保持英文原文，依上下文判斷是否需要翻譯註解。
    
    3.  **連結與圖片：**
        * 原文中的所有連結 (URLs) 和圖片引用路徑 (image paths) 必須保持不變。
    
    4.  **HTML 標籤：**
        * 如果原文 Markdown 中內嵌了 HTML 標籤，這些標籤及其屬性也應保持不變。
        
    ## 三、YAML Frontmatter 與特殊註解處理要求
    
    1.  **格式保持：**
        * 文件開頭由兩個 '---' 包圍的 YAML Frontmatter 部分的格式必須嚴格保持不變。
        * 保持所有欄位名稱、冒號、引號等格式符號不變。
        
    2.  **欄位翻譯：**
        * 僅翻譯 'title'、'description' 等欄位的內容值。
        * 如欄位值包含引號，請確保在翻譯後正確保留引號格式。
        * 不要翻譯欄位名、設定參數名或特殊識別符。
        
    3.  **特殊註解處理：**
        * 翻譯形如 \`[//]: # (title: 標題內容)\` 的特殊註解中的標題內容。
        * 保持註解格式不變，只翻譯冒號後的實際內容。
        * 例如: \`[//]: # (title: Kotlin/Native as an Apple framework – tutorial)\` 應翻譯為 \`[//]: # (title: Kotlin/Native 作為 Apple 框架 – 教學)\`。

    ## 四、輸出要求
    
    1.  **純淨輸出：** 僅輸出翻譯後的 Markdown 內容。不要包含任何額外的解釋、說明、道歉、或自我評論（例如，「這是一個不錯的翻譯…」或「請注意…」）。
    2.  **結構一致：** 保持與原文相同的文件結構和分段。
    
    ---
    
    ## 五、資源
    
    ### 1. 術語表 (Glossary)
    * 以下術語必須使用指定翻譯：
    {RELEVANT_TERMS}
    
    ### 2. 參考翻譯 (Translation References)
    * 請參考以下已翻譯的文件片段，以保持風格和術語的一致性：
    {TRANSLATION_REFERENCES}
    
    ---
    
    ## 六、待翻譯內容
    * 請將以下 Markdown 內容從英文翻譯為 ${langDisplayName}:
    
    \`\`\`markdown
    {SOURCE_TEXT}
    \`\`\``;

    }

  // Other languages use Chinese prompts
  return `# 角色与任务

    你是一位专业的 AI 翻译助手，专门负责将 **Github中Kotlin相关的** 英文技术文档精准翻译为 ${langDisplayName}。你的目标是产出高质量、技术准确、且符合目标语言阅读习惯的译文，主要面向**开发者受众**。请严格遵循以下指导原则和要求：
    
    ## 一、翻译风格与质量要求
    
    1. **忠实原文与流畅表达**

       * 在确保技术准确性的前提下，译文应自然流畅，符合 \${langDisplayName} 的语言习惯和互联网技术社群的表达方式。
       * 妥善处理原文的语序和句子结构，避免生硬直译或产生阅读障碍。
       * 保持原文的语气（例如：正式、非正式、教学性）。

    2. **术语与优先级规则（重要）**
    
       * **优先级次序：** 术语表（Glossary） > 文内惯例 > 一般语言习惯。
       * **冲突裁决：** 当“专有名词不译”与“常规含义可译”冲突时，以术语表**适用上下文**说明裁决。
       * **不翻译术语的形态：** 列入“**不翻译术语**”的词一律保持**英文原形与大小写**，即使原文为复数或时态变化也要还原为词典形（如 *futures* → **future**）。
       * **翻译术语：** 按术语表“翻译术语”指定译法执行。若存在“不要译作 …”的禁用译法，严禁使用。
       * **括号称谓统一：** 使用“圆括号 / 方括号 / 花括号”，不得使用“小/中/大括号”。
    
    3. **新/模糊术语处理**
    
       * 对于术语表中未包含、参考翻译亦无先例的专有名词或技术术语：
    
         * 若你选择翻译，**首次出现**可在中文后以括号附注英文原文（可选），如：\`译文 (English Term)\`。
         * 若不确定或保留英文更清晰，**直接保留英文原文**；必要时在译文处标注 **\[待确认]**。
    
    4. **风格统一（补充）**
    
       * 代码、API 名、类名、方法名、关键字、包名等**一律保持英文与大小写**，不加空格。
       * 标点遵循中文习惯；数值与单位之间保留半角空格（如 \`10 MB\`）。
    
    ## 二、技术格式要求
    
    1.  **Markdown 格式:**
        * 完整保留原文中的所有 Markdown 语法和格式，包括但不限于：标题 (headers)、列表 (lists)、粗体 (bold)、斜体 (italics)、删除线 (strikethrough)、引用块 (blockquotes)、分隔线 (horizontal rules)、Admonition (:::) 等。
    
    2.  **代码处理:**
        * 代码块 (以 \` \`\`\` \` 包裹) 和内联代码 (以 \` \`\` \` 包裹) 中的内容（包括代码本身、变量名、函数名、类名、参数名等）**均不得翻译**，必须保持英文原文，根据上下文判断是否需要翻译注释。
    
    3.  **链接与图片:**
        * 原文中的所有链接 (URLs) 和图片引用路径 (image paths) 必须保持不变。
    
    4.  **HTML 标签:**
        * 如果原文 Markdown 中内嵌了 HTML 标签，这些标签及其属性也应保持不变。
        
    ## 三、YAML Frontmatter 及特殊注释处理要求
    
    1.  **格式保持:**
        * 文档开头由两个 '---' 包围的 YAML Frontmatter 部分的格式必须严格保持不变。
        * 保持所有字段名称、冒号、引号等格式符号不变。
        
    2.  **字段翻译:**
        * 仅翻译 'title'、'description' 等字段的内容值。
        * 如字段值包含引号，请确保在翻译后正确保留引号格式。
        * 不要翻译字段名、配置参数名或特殊标识符。
        
    3.  **特殊注释处理:**
        * 翻译形如 \`[//]: # (title: 标题内容)\` 的特殊注释中的标题内容。
        * 保持注释格式不变，只翻译冒号后的实际内容。
        * 例如: \`[//]: # (title: Kotlin/Native as an Apple framework – tutorial)\` 应翻译为 \`[//]: # (title: Kotlin/Native 作为 Apple 框架 – 教程)\`。

    ## 四、输出要求
    
    1.  **纯净输出:** 仅输出翻译后的 Markdown 内容。不要包含任何额外的解释、说明、道歉、或自我评论（例如，"这是一个不错的翻译…" 或 "请注意…"）。
    2.  **结构一致:** 保持与原文相同的文档结构和分段。
    
    ---
    
    ## 五、资源
    
    ### 1. 术语表 (Glossary)
    * 以下术语必须使用指定翻译：
    {RELEVANT_TERMS}
    
    ### 2. 参考翻译 (Translation References)
    * 请参考以下已翻译的文档片段，以保持风格和术语的一致性：
    {TRANSLATION_REFERENCES}
    
    ---
    
    ## 六、待翻译内容
    * 请将以下 Markdown 内容从英文翻译为 ${langDisplayName}:
    
    \`\`\`markdown
    {SOURCE_TEXT}
    \`\`\``;
}

// Call LLM API for translation
async function translateWithLLM(text, targetLang, filePath) {
  const modelConfig = config.modelConfigs[targetLang];
  const prompt = prepareTranslationPrompt(text, targetLang, filePath);

  if (modelConfig.provider === "google") {
    return await callGemini(prompt, modelConfig.model);
  }

  throw new Error(`Unsupported provider: ${modelConfig.provider}`);
}

// Call Gemini API
async function callGemini(prompt, model) {
  try {
    const response = await genAI().models.generateContent({
      model: model,
      contents: prompt,
      config: {
        temperature: 1,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
}

// Translate file
async function translateFile(filePath) {
  console.log(`Translating file: ${filePath}`);
  const targetTranslateFiles = [];

  if (!filePath) {
    console.error("Invalid file path");
    return targetTranslateFiles;
  }

  // Fix file path, need to read source file from REPO_PATH
  const absoluteFilePath = path.resolve(process.env.REPO_PATH, filePath);

  // Check if file exists
  if (!fs.existsSync(absoluteFilePath)) {
    console.error(`File not found: ${absoluteFilePath}`);
    return targetTranslateFiles;
  }

  try {
    let content = fs.readFileSync(absoluteFilePath, "utf8");

    for (const targetLang of config.targetLanguages) {
      try {
        // Use new path calculation function
        const targetPath = getTargetPath(filePath, targetLang);

        if (!targetPath) {
          console.error(
            `Unable to get target path: ${filePath} -> ${targetLang}`
          );
          continue;
        }

        // Create target directory
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });

        // Translate content
        let translatedContent;
        if (content && content.trim()) {
          translatedContent = await translateWithLLM(
            content,
            targetLang,
            filePath
          );

          // Check translation result
          if (!translatedContent) {
            console.error(
              `Translation result is empty: ${filePath} -> ${targetLang}`
            );
            continue;
          }

          // Clean up extra content in translation result
          translatedContent = cleanupTranslation(translatedContent);
        } else {
          console.error(`File content is empty: ${filePath}`);
          continue;
        }

        // Write translated file
        fs.writeFileSync(targetPath, translatedContent);
        console.log(`Translated to ${targetLang}: ${targetPath}`);
        targetTranslateFiles.push(targetPath);
      } catch (langError) {
        console.error(
          `Error translating to ${targetLang}: ${langError.message}`
        );
      }
    }
  } catch (fileError) {
    console.error(`Error processing file ${filePath}: ${fileError.message}`);
  }
  return targetTranslateFiles;
}

// Clean up extra content in translation results
export function cleanupTranslation(text) {
  if (!text) return "";

  // Remove markdown code block markers at beginning
  if (text.startsWith("```markdown")) {
    text = text.replace(/^```markdown\n/, "");
  } else if (text.startsWith("```md")) {
    text = text.replace(/^```md\n/, "");
  } else if (text.startsWith("```")) {
    text = text.replace(/^```\n/, "");
  }

  // Remove markdown code block markers at end
  if (text.endsWith("```")) {
    text = text.replace(/```$/, "");
  }

  // Remove extra 'n' characters (usually found in translation API error outputs)
  text = text.replace(/([^\\])\\n/g, "$1\n"); // Replace non-escaped \n with actual newline
  text = text.replace(/^\\n/g, "\n"); // Handle leading \n

  // Remove extra blank lines
  text = text.replace(/\n{3,}/g, "\n\n");

  // Remove possible extra spaces
  text = text.trim();

  // Fix YAML frontmatter values with special characters that need quoting
  text = fixFrontmatterQuoting(text);

  // Prevent translated Markdown from being parsed as broken Vue templates.
  text = fixVueMarkdownParsing(text);

  return text;
}

function fixVueMarkdownParsing(text) {
  return transformOutsideFencedBlocks(text, (line) =>
    escapeInlineHtmlCode(escapeGenericTableCells(line))
  );
}

function transformOutsideFencedBlocks(text, transformLine) {
  let inFence = false;
  return text
    .split("\n")
    .map((line) => {
      if (/^\s*```/.test(line)) {
        inFence = !inFence;
        return line;
      }
      return inFence ? line : transformLine(line);
    })
    .join("\n");
}

function escapeInlineHtmlCode(line) {
  return line.replace(/<code>([\s\S]*?)<\/code>/g, (match, code) => {
    if (!/[<>*]/.test(code)) return match;

    const escaped = code
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*/g, "&#42;");

    return `<code>${escaped}</code>`;
  });
}

function escapeGenericTableCells(line) {
  if (!line.trim().startsWith("|") || !line.includes("|")) return line;

  const cells = line.split("|");
  if (cells.length < 3) return line;

  for (let i = 1; i < cells.length - 1; i++) {
    cells[i] = escapeGenericTableCell(cells[i]);
  }

  return cells.join("|");
}

function escapeGenericTableCell(cell) {
  const value = cell.trim();
  if (!value || value.includes("`") || value.includes("&lt;")) return cell;

  if (!/^[A-Za-z_][\w.]*\??<[^`|]+>\??$/.test(value)) return cell;

  return cell.replace(value, `\`${value}\``);
}

// Fix YAML frontmatter values containing special characters by wrapping them in double quotes
function fixFrontmatterQuoting(text) {
  const fmMatch = text.match(/^(---\n)([\s\S]*?\n)(---(?:\n|$))([\s\S]*)$/);
  if (!fmMatch) return text;

  const fixedBody = fmMatch[2].split("\n").map((line) => {
    // Match "key: value" pattern (skip lines that are not key-value pairs)
    const kvMatch = line.match(/^(\s*[\w][\w.-]*):\s+(.+)$/);
    if (!kvMatch) return line;

    const [, key, value] = kvMatch;

    // Already quoted, skip
    if (/^".*"$/.test(value) || /^'.*'$/.test(value)) return line;

    // YAML special characters at start that require quoting: @ # % * & ! | > ' ` { [ ?
    // Also values starting with "- " or containing ": "
    if (
      /^[@#%*&!|>'`{\[?]/.test(value) ||
      /^-\s/.test(value) ||
      /:\s/.test(value)
    ) {
      const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      return `${key}: "${escaped}"`;
    }

    return line;
  }).join("\n");

  return fmMatch[1] + fixedBody + fmMatch[3] + fmMatch[4];
}

// Get language display name
export function getLangDisplayName(langCode) {
  return config.languageNames[langCode] || langCode;
}

async function retry(fn, attempts = 3) {
  let lastError;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      console.warn(`Attempt ${i} failed: ${e.message}`);
    }
  }
  throw lastError;
}

export async function translateFiles(repoConfig, files) {
  console.log(`Translating ${files.length} files for ${repoConfig.id} (${repoConfig.docType})...`);

  // Set environment variables
  process.env.DOC_TYPE = repoConfig.docType;
  process.env.REPO_PATH = repoConfig.cloneDir;
  process.env.DOC_PATH = repoConfig.sourceDocRoot;

  const limit = pLimit(10);
  const translationTasks = files.map((file) =>
    limit(async () => {
      try {
        return await retry(() => translateFile(file), 3);
      } catch (e) {
        console.error(`❌ Failed translating ${file} after 3 attempts:`, e);
        return [];
      }
    })
  );

  const results = await Promise.all(translationTasks);
  return results.flat();
}

export async function translateLocaleFiles(files) {
  console.log(`Translating locale files...`);

  const limit = pLimit(10);
  const translationTasks = files.map((file) =>
    limit(async () => {
      try {
        return await retry(() => translateLocaleFile(file), 3);
      } catch (e) {
        console.error(`❌ Failed translating ${file} after 3 attempts:`, e);
        return [];
      }
    })
  );

  const results = await Promise.all(translationTasks);
  return results.flat();
}

async function translateLocaleFile(filePath) {
  console.log(`Translating locale file: ${filePath}`);
  let targetTranslateFile = "";
  const absoluteFilePath = path.resolve("docs/.vitepress/locales", filePath);

  if (!fs.existsSync(absoluteFilePath)) {
    console.error(`File not found: ${absoluteFilePath}`);
    return targetTranslateFile;
  }

  try {
    let content = fs.readFileSync(absoluteFilePath, "utf8");

    // Translate content
    let translatedContent;
    if (content && content.trim()) {
      const targetLang = filePath.split(".")[0];
      const modelConfig = config.modelConfigs[targetLang];
      const prompt = prepareTranslationPrompt(
        content,
        targetLang,
        absoluteFilePath
      );
      translatedContent = await callGemini(prompt, modelConfig.model);

      // Clean up extra content in translation result
      translatedContent = cleanupTranslation(translatedContent);
      if (translatedContent.startsWith("```json")) {
        translatedContent = translatedContent.replace(/^```json\n/, "");
      }
    } else {
      console.error(`File content is empty: ${filePath}`);
    }

    // Write translated file
    fs.writeFileSync(absoluteFilePath, translatedContent);
    console.log(`${filePath} Translated`);
    targetTranslateFile = absoluteFilePath;
  } catch (fileError) {
    console.error(`Error processing file ${filePath}: ${fileError.message}`);
  }
  return targetTranslateFile;
}
