const fs = require('fs');
const path = require('path');

// Читаем SVG файл
const svgPath = path.join(__dirname, 'public/history/Outline_map_of_Middle_East.svg');
const svgContent = fs.readFileSync(svgPath, 'utf8');

// Ищем основные элементы
console.log('=== Анализ SVG файла ===');

// Ищем размеры
const widthMatch = svgContent.match(/width="([^"]+)"/);
const heightMatch = svgContent.match(/height="([^"]+)"/);
const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);

console.log('Размеры:');
console.log('Width:', widthMatch ? widthMatch[1] : 'не найден');
console.log('Height:', heightMatch ? heightMatch[1] : 'не найден');
console.log('ViewBox:', viewBoxMatch ? viewBoxMatch[1] : 'не найден');

// Ищем количество path элементов
const pathMatches = svgContent.match(/<path/g);
console.log('\nКоличество path элементов:', pathMatches ? pathMatches.length : 0);

// Ищем уникальные ID
const idMatches = svgContent.match(/id="([^"]+)"/g);
const uniqueIds = [...new Set(idMatches ? idMatches.map(match => match.match(/id="([^"]+)"/)[1]) : [])];
console.log('\nУникальные ID (первые 10):', uniqueIds.slice(0, 10));

// Ищем группы
const groupMatches = svgContent.match(/<g/g);
console.log('\nКоличество group элементов:', groupMatches ? groupMatches.length : 0);

// Ищем стили
const styleMatches = svgContent.match(/style="([^"]+)"/g);
console.log('\nКоличество элементов со стилями:', styleMatches ? styleMatches.length : 0);

// Ищем fill атрибуты
const fillMatches = svgContent.match(/fill="([^"]+)"/g);
const uniqueFills = [...new Set(fillMatches ? fillMatches.map(match => match.match(/fill="([^"]+)"/)[1]) : [])];
console.log('\nУникальные fill цвета:', uniqueFills);

console.log('\n=== Анализ завершен ==='); 