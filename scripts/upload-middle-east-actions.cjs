const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs/promises');
const path = require('path');

// Путь к файлу ключа сервисного аккаунта Firebase
const serviceAccountKeyPath = path.join(__dirname, '..', 'serviceAccountKey.json');

// Название коллекции в Firestore
const COLLECTION_NAME = 'middleEastActions';

// Путь к файлу с данными
const DATA_FILE_PATH = path.join(__dirname, '..', 'public', 'history', 'middle_east_actions.json');


async function main() {
    try {
        console.log('Инициализация приложения Firebase...');
        const serviceAccount = JSON.parse(await fs.readFile(serviceAccountKeyPath, 'utf8'));
        initializeApp({
            credential: cert(serviceAccount)
        });

        const db = getFirestore();
        console.log('Соединение с Firestore установлено.');

        console.log(`Чтение данных из файла: ${DATA_FILE_PATH}`);
        const actionsData = JSON.parse(await fs.readFile(DATA_FILE_PATH, 'utf8'));

        if (!Array.isArray(actionsData) || actionsData.length === 0) {
            console.error('Ошибка: Файл с данными пуст или имеет неверный формат.');
            return;
        }

        console.log(`Начинаю загрузку данных в коллекцию '${COLLECTION_NAME}'...`);
        
        const batch = db.batch();
        
        actionsData.forEach(action => {
            if (!action.id) {
                console.warn('Пропущено действие без ID:', action);
                return;
            }
            const docRef = db.collection(COLLECTION_NAME).doc(action.id);
            batch.set(docRef, action);
        });

        await batch.commit();

        console.log(`\nУспешно загружено ${actionsData.length} документов в коллекцию '${COLLECTION_NAME}'.`);
        console.log('Операция завершена.');

    } catch (error) {
        console.error('Произошла ошибка во время выполнения скрипта:', error);
    }
}

main(); 