// scripts/build-widgets.mjs
import fs from 'fs/promises';
import path from 'path';
import YAML from 'yaml';

const widgetsDir = path.resolve('src/widgets');
const registryFile = path.resolve(widgetsDir, 'index.js');
const warningHeader = `// !!! ВНИМАНИЕ: ЭТОТ ФАЙЛ ГЕНЕРИРУЕТСЯ АВТОМАТИЧЕСКИ !!!\n// Не редактируйте его вручную. Все изменения будут потеряны.\n\n`;

async function buildRegistry() {
  try {
    const widgetFolders = await fs.readdir(widgetsDir, { withFileTypes: true });
    const imports = [];
    const registrations = [];

    console.log('Сканирую виджеты...');
    for (const dirent of widgetFolders) {
      if (dirent.isDirectory()) {
        const manifestPath = path.join(widgetsDir, dirent.name, 'manifest.yml');
        try {
          // Проверяем, существует ли manifest.yml
          await fs.access(manifestPath);

          const manifestFile = await fs.readFile(manifestPath, 'utf-8');
          const manifest = YAML.parse(manifestFile);

          if (!manifest.name) {
            console.warn(`  - Пропускаю папку '${dirent.name}': в manifest.yml отсутствует поле 'name'.`);
            continue;
          }

          const widgetName = manifest.name;
          // Превращаем имя папки (Kpi) в имя компонента для импорта (KpiWidget)
          const componentName = `${dirent.name.charAt(0).toUpperCase()}${dirent.name.slice(1)}Widget`;

          imports.push(`import ${componentName} from './${dirent.name}/index.js';`);
          registrations.push(`  '${widgetName}': ${componentName},`);
          console.log(`  + Найден и зарегистрирован виджет '${widgetName}' из папки '${dirent.name}'`);

        } catch (e) {
          if (e.code === 'ENOENT') {
             console.log(`  - Пропускаю папку '${dirent.name}': не найден manifest.yml.`);
          } else {
             console.error(`  ! Ошибка при обработке виджета '${dirent.name}':`, e);
          }
        }
      }
    }

    const registryContent = `${warningHeader}${imports.join('\n')}\n\nconst widgets = {\n${registrations.join('\n')}\n};\n\nexport default widgets;\n`;

    await fs.writeFile(registryFile, registryContent, 'utf-8');
    console.log(`\nРеестр виджетов успешно обновлен в файле: ${registryFile}`);

  } catch (error) {
    console.error('Ошибка при сборке реестра виджетов:', error);
    process.exit(1);
  }
}

buildRegistry();