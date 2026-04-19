export const MODULE = '@focus/dawn';

interface Skill {
  name: string;
  score: string | number;
}

interface Technique {
  name: string;
  level: number;
  skills: {
    name: string;
    desc: string;
  }[];
}

interface DawnData {
  skills?: Skill[];
  techniques?: Technique[];
}

// function preprocessAttributes(data: unknown): Record<string, { value: number; index: number }> {
//   const dawnData = window.OpenRpg.data(MODULE) as DawnData | undefined;
//   if (!dawnData || !dawnData.attributes) return {};
//
//   const attributes: Record<string, { value: number; index: number }> = {};
//   for (let i = 0; i < dawnData.attributes.length; i++) {
//     const attribute = dawnData.attributes[i];
//     attributes[attribute.name] = {
//       value: DawnMath.dawnParse(attribute.score, attributes),
//       index: i,
//     };
//   }
//   return attributes;
// }

window.OpenRpg.register('dawn.skills', (container) => {
  container.replaceChildren();

  const data = window.OpenRpg.data(MODULE) as DawnData | undefined;
  if (!data || !data.skills || data.skills.length === 0) {
    container.innerHTML = '<p class="text-gray-500">No skills defined</p>';
    return false;
  }

  for (let i = 0; i < data.skills.length; i++) {
    const skill = data.skills[i];
    const skillbox = document.createElement("div");
    skillbox.className = 'border-2 border-teal-700 rounded-lg p-2 flex flex-row justify-between';

    const nametag = document.createElement("h2");
    nametag.innerText = skill.name;
    skillbox.appendChild(nametag);

    const scoretag = document.createElement("h2");
    const scorebold = document.createElement("strong");
    scorebold.innerText = String(skill.score);
    scoretag.appendChild(scorebold);
    skillbox.appendChild(scoretag);

    container.appendChild(skillbox);
  }

  return true;
});

window.OpenRpg.register('dawn.techniques', (container) => {
  container.replaceChildren();

  const dawnData = window.OpenRpg.data(MODULE) as DawnData | undefined;
  if (!dawnData || !dawnData.techniques || dawnData.techniques.length === 0) {
    container.innerHTML = '<p class="text-gray-500">No techniques defined</p>';
    return false;
  }

  container.innerHTML = '<p class="text-gray-500">Not done yet!</p>';

  /*
  const attributes = preprocessAttributes(dawnData);
  const itemClasses = 'border-2 border-teal-700 rounded-lg p-2 flex flex-col gap-1';

  for (const t in dawnData.techniques) {
    const technique = dawnData.techniques[t as unknown as number];

    const techniquesbox = document.createElement("div");
    techniquesbox.className = itemClasses;

    const name = document.createElement("h2");
    name.innerText = technique.name;
    techniquesbox.appendChild(name);

    for (let i = 0; i < technique.level; i++) {
      const rank = technique.skills[i];

      const header = document.createElement("h3");
      header.textContent = rank.name;
      techniquesbox.appendChild(header);

      const desc = document.createElement("p");

      const description = window.OpenRpg.calculate(rank.desc, attributes, false);
      const textNode = document.createTextNode(description);
      desc.appendChild(textNode);

      techniquesbox.appendChild(desc);
    }

    container.appendChild(techniquesbox);
  }
  */

  return true;
});
