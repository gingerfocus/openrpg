// Shadowdark RPG Module
// Core rules: stats, ancestry, class, spells, combat

const STAT_NAMES = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

function initCharacter(data) {
    if (!data.stats) data.stats = {};
    STAT_NAMES.forEach(stat => {
        if (!data.stats[stat]) data.stats[stat] = 10;
    });

    const extra = OpenRpg.getPluginData(data, '@focus/shadowdark');
    if (!extra) {
        OpenRpg.setPluginData(data, '@focus/shadowdark', {
            ancestry: '',
            class: '',
            level: 1,
            XP: 0,
            maxHitPoints: 0,
            armorClass: 10,
            attacks: [],
            spells: [],
            title: '',
            alignment: '',
            background: '',
            deity: ''
        });
    }
}

function getStatsModifier(stat) {
    const value = parseInt(stat) || 10;
    const mod = Math.floor((value - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
}

function renderStats(container, data, editCallback) {
    container.replaceChildren();

    const extra = OpenRpg.getPluginData(data, '@gingerfocus/shadowdark');
    const stats = data.stats || {};
    const level = extra?.level || 1;
    const hp = extra?.maxHitPoints || 0;
    const ac = extra?.armorClass || 10;

    const headerInfo = document.createElement('div');
    headerInfo.className = 'flex flex-row gap-6 mb-4 text-sm';
    headerInfo.innerHTML = `
        <span>Level: ${level}</span>
        <span>HP: ${hp}</span>
        <span>AC: ${ac}</span>
    `;
    container.appendChild(headerInfo);

    const statsGrid = document.createElement('div');
    statsGrid.className = 'grid grid-cols-3 gap-2';

    for (const stat of STAT_NAMES) {
        const value = stats[stat] || 10;
        const mod = getStatsModifier(value);

        const statBox = document.createElement('div');
        statBox.className = 'border-2 border-teal-700 rounded-lg p-2 text-center bg-gray-900 cursor-pointer hover:bg-gray-800';
        statBox.innerHTML = `
            <div class="text-xs text-gray-500">${stat}</div>
            <div class="text-xl text-teal-400">${value}</div>
            <div class="text-sm text-yellow-400">${mod}</div>
        `;
        statBox.addEventListener('click', () => {
            if (editCallback) editCallback({ stat, value });
        });
        statsGrid.appendChild(statBox);
    }

    container.appendChild(statsGrid);

    if (extra) {
        const charInfo = document.createElement('div');
        charInfo.className = 'mt-4 text-sm space-y-1';
        const classInfo = [];
        if (extra.ancestry) classInfo.push(extra.ancestry);
        if (extra.class) classInfo.push(extra.class);
        if (extra.title) classInfo.push(extra.title);
        if (classInfo.length > 0) {
            charInfo.innerHTML = `<p><span class="text-gray-500">Character:</span> ${classInfo.join(' ')}</p>`;
        }
        if (extra.alignment) {
            charInfo.innerHTML += `<p><span class="text-gray-500">Alignment:</span> ${extra.alignment}</p>`;
        }
        if (extra.background) {
            charInfo.innerHTML += `<p><span class="text-gray-500">Background:</span> ${extra.background}</p>`;
        }
        if (extra.deity) {
            charInfo.innerHTML += `<p><span class="text-gray-500">Deity:</span> ${extra.deity}</p>`;
        }
        if (extra.XP !== undefined) {
            charInfo.innerHTML += `<p><span class="text-gray-500">XP:</span> ${extra.XP}</p>`;
        }
        container.appendChild(charInfo);
    }
}

function renderClassFeatures(container, data, editCallback) {
    container.replaceChildren();
    
    const extra = OpenRpg.getPluginData(data, '@gingerfocus/shadowdark');
    if (!extra) {
        container.innerHTML = '<p class="text-gray-500">No class data</p>';
        return;
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

        for (const [spellName, spellData] of Object.entries(extra.spells)) {
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
}

OpenRpg.register('dawn.initCharacter', initCharacter);
OpenRpg.register('shadowdark.initCharacter', initCharacter);
OpenRpg.register('openrpg.initCharacter', initCharacter);

OpenRpg.register('dawn.renderAttributes', renderStats);
OpenRpg.register('shadowdark.renderStats', renderStats);

OpenRpg.register('dawn.renderSkills', renderClassFeatures);
OpenRpg.register('shadowdark.renderClassFeatures', renderClassFeatures);

