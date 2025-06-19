import { addTooltipEvents } from './Tooltip.js';

let activeSectorIndex = null;
let fadeTimeout = null;
let isTooltipDocListenerAttached = false;

export function handlePieChartMouseMove(event, canvas, parties, sectors, tooltipEl) {
  if (!tooltipEl) return;
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const dx = mouseX - centerX;
  const dy = mouseY - centerY;
  let found = false;
  if (Math.sqrt(dx * dx + dy * dy) <= centerX) {
    let angle = Math.atan2(dy, dx);
    if (angle < -Math.PI / 2) angle += 2 * Math.PI;
    for (let i = 0; i < sectors.length; i++) {
      const sector = sectors[i];
      if (angle >= sector.startAngle && angle < sector.endAngle) {
        tooltipEl.innerHTML = `<strong>${parties[i].name}</strong><hr>Популярность: ${parties[i].popularity}%`;
        tooltipEl.style.display = 'block';
        let x = event.clientX + 15;
        let y = event.clientY + 15;
        if (x + tooltipEl.offsetWidth + 10 > window.innerWidth) x = event.clientX - tooltipEl.offsetWidth - 15;
        if (y + tooltipEl.offsetHeight + 10 > window.innerHeight) y = event.clientY - tooltipEl.offsetHeight - 15;
        tooltipEl.style.left = `${x}px`;
        tooltipEl.style.top = `${y}px`;
        if (activeSectorIndex !== i) {
          activeSectorIndex = i;
          if (fadeTimeout) clearTimeout(fadeTimeout);
          drawPoliticalPieChart(canvas, parties, i); // перерисовать с выделением
        }
        found = true;
        return;
      }
    }
  }
  tooltipEl.style.display = 'none';
  if (activeSectorIndex !== null) {
    // Плавное затухание выделения
    const prevIndex = activeSectorIndex;
    fadeTimeout = setTimeout(() => {
      activeSectorIndex = null;
      drawPoliticalPieChart(canvas, parties, null);
    }, 120); // 120мс для плавности
    drawPoliticalPieChart(canvas, parties, prevIndex, true); // рисуем с прозрачной границей
  }
}

export function handlePieChartMouseLeave(tooltipEl, canvas, parties) {
  clearTimeout(fadeTimeout);
  if (tooltipEl) tooltipEl.style.display = 'none';
  activeSectorIndex = null;
  if (canvas && parties) drawPoliticalPieChart(canvas, parties, null);
}

export function drawPoliticalPieChart(canvas, parties, highlightIndex = null, fading = false) {
  if (!canvas || !parties || parties.length === 0) return;
  const ctx = canvas.getContext('2d');
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 14;
  const filteredParties = parties.filter(p => p.popularity > 0);
  const totalPopularity = filteredParties.reduce((sum, party) => sum + party.popularity, 0);
  if (totalPopularity === 0) return;
  let currentAngle = -0.5 * Math.PI;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const sectors = [];
  let highlightSector = null;
  filteredParties.forEach((party, idx) => {
    const sliceAngle = (party.popularity / totalPopularity) * 2 * Math.PI;
    const endAngle = currentAngle + sliceAngle;
    if (highlightIndex === idx) {
      highlightSector = { party, idx, startAngle: currentAngle, endAngle };
    } else {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = party.color || '#cccccc';
      ctx.fill();
      ctx.strokeStyle = '#3c3c3c';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }
    sectors.push({ startAngle: currentAngle, endAngle });
    currentAngle = endAngle;
  });
  // Рисуем выделенный сектор последним, чтобы он был поверх
  if (highlightSector) {
    const { party, idx, startAngle, endAngle } = highlightSector;
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(1.08, 1.08);
    ctx.translate(-centerX, -centerY);
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = party.color || '#cccccc';
    ctx.fill();
    ctx.strokeStyle = fading ? 'rgba(192,192,192,0.2)' : '#C0C0C0'; // серебристая граница
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }
  const tooltipEl = document.querySelector('.tooltip');
  // Сохраняем parties для корректной работы тултипов
  canvas._parties = filteredParties;
  canvas._sectors = sectors;
  if(canvas._handleMouseMove) canvas.removeEventListener('mousemove', canvas._handleMouseMove);
  if(canvas._handleMouseLeave) canvas.removeEventListener('mouseleave', canvas._handleMouseLeave);
  canvas._handleMouseMove = (event) => handlePieChartMouseMove(event, canvas, filteredParties, sectors, tooltipEl);
  canvas._handleMouseLeave = () => handlePieChartMouseLeave(tooltipEl, canvas, filteredParties);
  canvas.addEventListener('mousemove', canvas._handleMouseMove);
  canvas.addEventListener('mouseleave', canvas._handleMouseLeave);
  // === Глобальный обработчик document для скрытия тултипа ===
  if (!isTooltipDocListenerAttached) {
    document.addEventListener('click', (e) => {
      if (tooltipEl && tooltipEl.style.display === 'block') {
        tooltipEl.style.display = 'none';
        clearTimeout(fadeTimeout);
      }
    });
    isTooltipDocListenerAttached = true;
  }
}

export function updatePartyList(listContainer, parties, rulingPartyId) { if (!listContainer || !parties || parties.length === 0) return; const sortedParties = [...parties].filter(p => p.popularity > 0 || p.id === rulingPartyId).sort((a, b) => b.popularity - a.popularity); listContainer.innerHTML = ''; sortedParties.forEach(party => { const listItem = document.createElement('li'); if (party.id === rulingPartyId) listItem.classList.add('highlighted'); const colorBox = document.createElement('div'); colorBox.className = 'party-color-box'; colorBox.style.backgroundColor = party.color || '#cccccc'; const partyNameSpan = document.createElement('span'); partyNameSpan.textContent = ` ${party.name} (${party.popularity}%)`; listItem.appendChild(colorBox); listItem.appendChild(partyNameSpan); addTooltipEvents(listItem, party.name, `Популярность: ${party.popularity}%`, party.short_description); listContainer.appendChild(listItem); }); } 