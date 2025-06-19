// import-firestore.js
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// !!! Укажите путь к вашему serviceAccountKey.json !!!
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const historyDir = path.join(__dirname, 'public', 'history');

function getMainArray(json) {
  if (Array.isArray(json.options)) return { key: 'options', arr: json.options };
  if (Array.isArray(json.principles)) return { key: 'principles', arr: json.principles };
  if (Array.isArray(json.areas)) return { key: 'areas', arr: json.areas };
  if (Array.isArray(json)) return { key: null, arr: json };
  return null;
}

async function importFile(filePath, collectionName) {
  const raw = fs.readFileSync(filePath, 'utf8');
  let json;
  try {
    json = JSON.parse(raw);
  } catch (e) {
    console.error(`Ошибка парсинга ${filePath}:`, e.message);
    return;
  }
  const main = getMainArray(json);
  if (!main) {
    console.warn(`Не найден массив данных в ${filePath}, пропуск...`);
    return;
  }
  for (const item of main.arr) {
    const docId = item.id || item.article_number || undefined;
    try {
      if (docId) {
        await db.collection(collectionName).doc(String(docId)).set(item);
      } else {
        await db.collection(collectionName).add(item);
      }
      console.log(`Импортирован документ в ${collectionName}: ${docId || '[auto-id]'}`);
    } catch (e) {
      console.error(`Ошибка импорта документа в ${collectionName}:`, e.message);
    }
  }
}

async function main() {
  const files = fs.readdirSync(historyDir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const filePath = path.join(historyDir, file);
    const collectionName = path.basename(file, '.json');
    console.log(`Импорт ${file} -> коллекция ${collectionName}`);
    await importFile(filePath, collectionName);
  }
  console.log('Импорт завершён!');
  process.exit(0);
}

main();