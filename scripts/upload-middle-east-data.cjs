const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs/promises');
const path = require('path');

// Путь к файлу ключа сервисного аккаунта Firebase
// Убедитесь, что этот файл находится в безопасном месте и не попадает в git
const serviceAccountKeyPath = path.join(__dirname, '..', 'serviceAccountKey.json');

// Название коллекции в Firestore
const COLLECTION_NAME = 'middleEastCountries';

// Путь к файлу с данными
const DATA_FILE_PATH = path.join(__dirname, '..', 'public', 'history', 'middle_east_countries.json');


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
        const countriesData = JSON.parse(await fs.readFile(DATA_FILE_PATH, 'utf8'));

        if (!Array.isArray(countriesData) || countriesData.length === 0) {
            console.error('Ошибка: Файл с данными пуст или имеет неверный формат.');
            return;
        }

        console.log(`Начинаю загрузку данных в коллекцию '${COLLECTION_NAME}'...`);
        
        const batch = db.batch();
        
        countriesData.forEach(country => {
            if (!country.id) {
                console.warn('Пропущена запись без ID:', country);
                return;
            }
            const docRef = db.collection(COLLECTION_NAME).doc(country.id);
            batch.set(docRef, country);
        });

        await batch.commit();

        console.log(`\nУспешно загружено ${countriesData.length} документов в коллекцию '${COLLECTION_NAME}'.`);
        console.log('Операция завершена.');

    } catch (error) {
        console.error('Произошла ошибка во время выполнения скрипта:', error);
        if (error.code === 'ENOENT' && error.path === serviceAccountKeyPath) {
            console.error('\nВАЖНО: Не найден файл ключа сервисного аккаунта Firebase.');
            console.error(`Пожалуйста, убедитесь, что файл '${path.basename(serviceAccountKeyPath)}' существует в корневой папке проекта.`);
        }
    }
}

main(); 