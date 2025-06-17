// scripts/new-widget.mjs
import fs from 'fs/promises';
import path from 'path';

const args = process.argv.slice(2);
const widgetFolderName = args[0];

if (!widgetFolderName || !/^[a-zA-Z0-9_-]+$/.test(widgetFolderName)) {
  console.error('\nОшибка: Имя виджета не указано или содержит недопустимые символы.');
  console.log('Пример использования: npm run new-widget -- MyAwesomeChart');
  process.exit(1);
}

// --- НАЧАЛО ИСПРАВЛЕННОЙ ЛОГИКИ ---
// Это правильная регулярка, которая не добавляет дефис в начало.
const kebabCaseName = widgetFolderName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
// --- КОНЕЦ ИСПРАВЛЕННОЙ ЛОГИКИ ---

const componentName = `${widgetFolderName.charAt(0).toUpperCase()}${widgetFolderName.slice(1)}Widget`;
const widgetDir = path.resolve('src/widgets', widgetFolderName);

const templates = {
  'manifest.yml': `name: ${kebabCaseName}
title: ${componentName}
props:
  label: string
`,
  'index.js': `import './style.css';

export default function ${componentName}(props) {
  const el = document.createElement('div');
  el.className = 'widget ${kebabCaseName}-widget';

  const labelEl = document.createElement('h3');
  labelEl.textContent = props.label || '${componentName}';

  el.appendChild(labelEl);

  return el;
}
`,
  'style.css': `.${kebabCaseName}-widget {
  /* Стили для вашего нового виджета */
  border: 2px dashed limegreen;
}
`,
};

async function createWidget() {
  try {
    console.log(`\nСоздание папки для виджета: ${widgetDir}`);
    await fs.mkdir(widgetDir, { recursive: true });

    for (const [fileName, content] of Object.entries(templates)) {
      const filePath = path.join(widgetDir, fileName);
      await fs.writeFile(filePath, content, 'utf-8');
      console.log(`  -> Создан файл: ${fileName}`);
    }

    console.log(`\nВиджет '${widgetFolderName}' успешно создан!`);
    console.log(`\nЧтобы его увидеть:`);
    console.log(`1. Добавьте в 'src/data.yml' в секцию 'metrics':`);
    console.log(`   - {$ref: '@${kebabCaseName}', label: 'Мой новый виджет'}`); // Теперь эта подсказка будет правильной
    console.log(`2. Запустите 'npm run dev'`);

  } catch (error) {
    console.error(`\nНе удалось создать виджет '${widgetFolderName}':`, error);
    process.exit(1);
  }
}

createWidget();