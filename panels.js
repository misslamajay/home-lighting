const root = document.querySelector('#panels');
document.body.classList.toggle('embedded', new URLSearchParams(location.search).get('embed') === '1');
const dialog = document.querySelector('#detail');
let manifest;
const escaped = text => String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

function glass(panel) {
  const xPositions = panel.keys.length === 2 ? [29, 57] : [15, 43, 71];
  return `<div class="glass"><svg class="panel-svg" viewBox="0 0 86 86" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escaped(panel.location)}：${panel.keys.map(key => escaped(key.label)).join('、') || '不刻字'}">${panel.keys.map((key, index) => {
    const icon = manifest.icons.find(item => item.id === key.iconId);
    const x = xPositions[index];
    return `<g><image class="ink" href="${manifest.assetBase}/${encodeURIComponent(icon.file)}" x="${x-icon.widthMM/2}" y="${37.4+(9-icon.heightMM)/2}" width="${icon.widthMM}" height="${icon.heightMM}"/><text x="${x+.125}" y="50.5" fill="currentColor" text-anchor="middle" font-family="Heiti TC, PingFang SC, sans-serif" font-size="3" font-weight="500" letter-spacing=".25">${escaped(key.label)}</text><text class="position-caption" x="${x}" y="55.3" text-anchor="middle" font-family="Heiti TC, PingFang SC, sans-serif">${escaped(key.function)}</text></g>`;
  }).join('')}</svg></div>`;
}

function openDetail(panel, trigger) {
  document.querySelector('#detail-title').textContent = `${String(panel.id).padStart(2, '0')} · ${panel.location}`;
  document.querySelector('#detail-panel').innerHTML = glass(panel);
  const map = document.querySelector('#detail-map');
  map.innerHTML = panel.keys.length ? panel.keys.map(key => `<div><span>第 ${key.position} 键</span><b>${escaped(key.label)}</b><span>${escaped(key.function)}</span></div>`).join('') : `<span class="empty-map">${escaped(panel.note)}</span>`;
  dialog.showModal();
  dialog.addEventListener('close', () => trigger.focus(), {once:true});
}

async function initialize() {
  const response = await fetch('manifest.json');
  if (!response.ok) throw new Error('无法读取面板对应表');
  manifest = await response.json();
  if (manifest.panels.length !== 12 || manifest.icons.length !== 22 || manifest.panels.reduce((n,p) => n+p.keys.length,0) !== 32) throw new Error('面板对应表数量不符');
  for (const panel of manifest.panels) {
    const card = document.createElement('article');
    card.className = 'panel-card';
    card.innerHTML = `<h2 class="panel-heading"><span class="panel-num">${String(panel.id).padStart(2,'0')}</span>${escaped(panel.location)}</h2><button type="button" class="glass-button" aria-label="放大${escaped(panel.location)}面板">${glass(panel)}</button><p class="panel-note">${panel.keys.length ? '' : '超能 PRO · 按原清单保留不刻字'}</p>`;
    const button = card.querySelector('button');
    button.addEventListener('click', () => openDetail(panel, button));
    root.append(card);
  }
  document.querySelector('#status').textContent = '';
}
document.querySelectorAll('[data-tone]').forEach(button => button.addEventListener('click', () => {
  document.body.classList.toggle('dark', button.dataset.tone === 'dark');
  document.querySelectorAll('[data-tone]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
}));
document.querySelector('#show-functions').addEventListener('change', event => document.body.classList.toggle('hide-positions', !event.target.checked));
dialog.querySelector('.close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
initialize().catch(error => { document.querySelector('#status').textContent = error.message; });
