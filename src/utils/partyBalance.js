// Перераспределяет популярность партий по правилам:
// - partyId: id целевой партии
// - popularities: объект {id: число}
// - delta: +1 или -1 (увеличить или уменьшить целевую партию)
// Возвращает новый объект popularities
export function redistributePopularity(partyId, popularities, delta) {
  const ids = Object.keys(popularities);
  const N = ids.length;
  if (N < 2) return { ...popularities };
  let newPopularities = { ...popularities };
  newPopularities[partyId] = +(newPopularities[partyId] + delta);
  // Считаем равную долю для остальных
  const others = ids.filter(id => id !== partyId);
  const share = Math.abs(delta) / (N - 1);
  others.forEach((id) => {
    if (delta > 0) {
      newPopularities[id] = +(newPopularities[id] - share);
    } else {
      newPopularities[id] = +(newPopularities[id] + share);
    }
  });
  // Округляем до двух знаков
  ids.forEach(id => newPopularities[id] = +newPopularities[id].toFixed(2));

  // Итеративно устраняем отрицательные значения и перераспределяем их остаток
  let changed = true;
  while (changed) {
    changed = false;
    const negatives = others.filter(id => newPopularities[id] < 0);
    if (negatives.length === 0) break;
    let negSum = negatives.reduce((a, id) => a + newPopularities[id], 0); // отрицательное число
    negatives.forEach(id => { newPopularities[id] = 0; });
    // Перераспределяем отрицательный остаток между оставшимися нецелевыми партиями с положительной популярностью
    const positives = others.filter(id => newPopularities[id] > 0);
    if (positives.length === 0) break;
    const perParty = Math.abs(negSum) / positives.length;
    positives.forEach((id, idx) => {
      if (idx === positives.length - 1) {
        newPopularities[id] = +(newPopularities[id] + Math.abs(negSum) - perParty * (positives.length - 1)).toFixed(2);
      } else {
        newPopularities[id] = +(newPopularities[id] + perParty).toFixed(2);
      }
    });
    changed = true;
    // После перераспределения снова округляем
    ids.forEach(id => newPopularities[id] = +newPopularities[id].toFixed(2));
  }

  // Финальная нормализация: обнуляем все < 0, масштабируем положительные до суммы 100
  ids.forEach(id => { if (newPopularities[id] < 0) newPopularities[id] = 0; });
  let posSum = Object.values(newPopularities).reduce((a, b) => a + (b > 0 ? b : 0), 0);
  if (posSum > 0) {
    ids.forEach(id => {
      if (newPopularities[id] > 0) {
        newPopularities[id] = +(newPopularities[id] * 100 / posSum).toFixed(2);
      } else {
        newPopularities[id] = 0;
      }
    });
  }
  // Финальная корректировка суммы (на случай округления)
  let finalSum = Object.values(newPopularities).reduce((a, b) => a + b, 0);
  if (finalSum !== 100) {
    // Корректируем первую положительную партию
    const firstPos = ids.find(id => newPopularities[id] > 0);
    if (firstPos) newPopularities[firstPos] = +(newPopularities[firstPos] + (100 - finalSum)).toFixed(2);
  }
  // Гарантируем отсутствие отрицательных значений после всех корректировок
  ids.forEach(id => { if (newPopularities[id] < 0) newPopularities[id] = 0; });
  return newPopularities;
} 