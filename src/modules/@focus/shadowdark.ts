export const MODULE = '@focus/shadowdark';

interface ShadowdarkData {
  ancestry?: string;
  class?: string;
  level?: number;
  XP?: number;
  maxHitPoints?: number;
  armorClass?: number;
  attacks?: string[];
  spells?: Record<string, unknown>;
  title?: string;
  alignment?: string;
  background?: string;
  deity?: string;
}

const stats = (container: HTMLElement) => {
  container.replaceChildren();

  const data = window.OpenRpg.data(MODULE) as ShadowdarkData | null;
  if (!data) return false;
  const level = data?.level || 1;
  const hp = data?.maxHitPoints || 0;
  const ac = data?.armorClass || 10;

  const headerInfo = document.createElement('div');
  headerInfo.className = 'flex flex-row gap-6 mb-4 text-sm';
  headerInfo.innerHTML = `
      <span>Level: ${level}</span>
      <span>HP: ${hp}</span>
      <span>AC: ${ac}</span>
  `;
  container.appendChild(headerInfo);

  const charInfo = document.createElement('div');
  charInfo.className = 'mt-4 text-sm space-y-1';
  const classInfo = [];
  if (data.ancestry) classInfo.push(data.ancestry);
  if (data.class) classInfo.push(data.class);
  if (data.title) classInfo.push(data.title);
  if (classInfo.length > 0) {
    charInfo.innerHTML = `<p><span class="text-gray-500">Character:</span> ${classInfo.join(' ')}</p>`;
  }
  if (data.alignment) {
    charInfo.innerHTML += `<p><span class="text-gray-500">Alignment:</span> ${data.alignment}</p>`;
  }
  if (data.background) {
    charInfo.innerHTML += `<p><span class="text-gray-500">Background:</span> ${data.background}</p>`;
  }
  if (data.deity) {
    charInfo.innerHTML += `<p><span class="text-gray-500">Deity:</span> ${data.deity}</p>`;
  }
  if (data.XP !== undefined) {
    charInfo.innerHTML += `<p><span class="text-gray-500">XP:</span> ${data.XP}</p>`;
  }
  container.appendChild(charInfo);

  return true;
};

const features = (container: HTMLElement) => {
  container.replaceChildren();

  const extra = window.OpenRpg.data(MODULE) as ShadowdarkData | null;
  if (!extra) {
    container.innerHTML = '<p class="text-gray-500">No class data</p>';
    return false;
  }

  if (extra.attacks && extra.attacks.length > 0) {
    const attacksSection = document.createElement('div');
    attacksSection.className = 'border-2 border-teal-700 rounded-lg p-3 bg-gray-900 mb-3';

    const attacksHeader = document.createElement('h3');
    attacksHeader.className = 'text-lg text-teal-400 mb-2';
    attacksHeader.textContent = 'Attacks';
    attacksSection.appendChild(attacksHeader);

    for (const attack of extra.attacks) {
      const attackRow = document.createElement('div');
      attackRow.className = 'text-sm py-1';
      attackRow.textContent = attack;
      attacksSection.appendChild(attackRow);
    }
    container.appendChild(attacksSection);
  }

  if (extra.spells && Object.keys(extra.spells).length > 0) {
    const spellsSection = document.createElement('div');
    spellsSection.className = 'border-2 border-teal-700 rounded-lg p-3 bg-gray-900';

    const spellsHeader = document.createElement('h3');
    spellsHeader.className = 'text-lg text-teal-400 mb-2';
    spellsHeader.textContent = 'Spells';
    spellsSection.appendChild(spellsHeader);

    for (const spellName of Object.keys(extra.spells)) {
      const spellRow = document.createElement('div');
      spellRow.className = 'text-sm py-1';
      spellRow.textContent = spellName;
      spellsSection.appendChild(spellRow);
    }
    container.appendChild(spellsSection);
  }

  if ((!extra.attacks || extra.attacks.length === 0) && (!extra.spells || Object.keys(extra.spells).length === 0)) {
    container.innerHTML = '<p class="text-gray-500">No class features</p>';
  }
  return true
};

window.OpenRpg.register('shadowdark.stats', stats);
window.OpenRpg.register('shadowdark.features', features);
