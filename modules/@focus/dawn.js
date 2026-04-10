// Dawn Core Module
// Provides: attributes, skills, techniques, character data

let NAME = '@focus/dawn'
let moduleData;

// ----------------------  Plugin Data Helpers -----------------------------------

function getDawnData(data) {
    return OpenRpg.getPluginData(data, NAME);
}

function setDawnData(data, dawnData) {
    OpenRpg.setPluginData(data, NAME, dawnData);
}

// ----------------------  Module Hooks -----------------------------------

function preprocessAttributes(data) {
    const dawnData = getDawnData(data);
    if (!dawnData || !dawnData.attributes) return {};

    let attributes = {}
    for (var i = 0; i < dawnData.attributes.length; i++) {
        const attribute = dawnData.attributes[i]
        attributes[attribute.name] = {
            value: OpenRpgMath.dawnParse(attribute.score, attributes),
            index: i,
        }
    }
    return attributes;
}


function renderSkills(container, data, editCallback, args) {
    const dawnData = getDawnData(data);
    container.replaceChildren();

    if (args?.containerClasses) {
        container.className = args.containerClasses;
    }

    if (!dawnData || !dawnData.skills || dawnData.skills.length === 0) {
        container.innerHTML = '<p class="text-gray-500">No skills defined</p>';
        return;
    }

    const itemClasses = args?.itemClasses || 'border-2 border-teal-700 rounded-lg p-2 flex flex-row justify-between';

    for (var i = 0; i < dawnData.skills.length; i++) {
        const skill = dawnData.skills[i];
        const skillbox = document.createElement("div");
        skillbox.className = itemClasses;

        let nametag = document.createElement("h2")
        nametag.innerText = skill.name
        skillbox.appendChild(nametag)

        let scoretag = document.createElement("h2")
        let scorebold = document.createElement("strong")
        scorebold.innerText = skill.score
        scoretag.appendChild(scorebold)
        skillbox.appendChild(scoretag)

        if (editCallback) {
            skillbox.addEventListener("click", (_) => editCallback(skill));
        }

        container.appendChild(skillbox);
    }
}

function renderTechniques(container, data, editCallback, args) {
    const dawnData = getDawnData(data);
    container.replaceChildren()

    if (args?.containerClasses) {
        container.className = args.containerClasses;
    }

    if (!dawnData || !dawnData.techniques || dawnData.techniques.length === 0) {
        container.innerHTML = '<p class="text-gray-500">No techniques defined</p>';
        return;
    }

    const attributes = preprocessAttributes(data);
    const itemClasses = args?.itemClasses || 'border-2 border-teal-700 rounded-lg p-2 flex flex-col gap-1';

    for (const t in dawnData.techniques) {
        const technique = dawnData.techniques[t];

        const techniquesbox = document.createElement("div");
        techniquesbox.className = itemClasses;
        
        if (editCallback) {
            techniquesbox.addEventListener("click", (_) => editCallback(technique));
        }

        const name = document.createElement("h2");
        name.innerText = technique.name;
        techniquesbox.appendChild(name);

        for (let i = 0; i < technique.level; i++) {
            const rank = technique.skills[i];

            const header = document.createElement("h3")
            header.textContent = rank.name
            techniquesbox.appendChild(header);

            const desc = document.createElement("p");
            const matches = OpenRpgMath.dawnMatch(rank.desc)

            let start = 0
            for (let m in matches) {
                const match = matches[m]

                let textNode = document.createTextNode(rank.desc.substring(start, match.start))
                desc.appendChild(textNode)

                let parsedResult = document.createElement("strong")
                parsedResult.innerText = OpenRpgMath.dawnParse(match.inner, attributes)
                desc.appendChild(parsedResult)

                start = match.end
            }
            let textNode = document.createTextNode(rank.desc.substring(start))
            desc.appendChild(textNode)

            techniquesbox.appendChild(desc);
        }

        container.appendChild(techniquesbox);
    }
}

// ----------------------  Module Registration -----------------------------------

OpenRpg.register('dawn.renderSkills', renderSkills);
OpenRpg.register('dawn.renderTechniques', renderTechniques);



// function renderAttributes(container, data, editCallback, args) {
//     const dawnData = getDawnData(data);
//     container.replaceChildren();

//     if (args?.containerClasses) {
//         container.className = args.containerClasses;
//     }

//     if (!dawnData || !dawnData.attributes || dawnData.attributes.length === 0) {
//         container.innerHTML = '<p class="text-gray-500">No attributes defined</p>';
//         return;
//     }

//     const attributes = preprocessAttributes(data);
//     const itemClasses = args?.itemClasses || '';

//     for (const name in attributes) {
//         const attribute = attributes[name]

//         const template = document.getElementById('tscorecard');
//         const clone = template.content.cloneNode(true);
//         clone.querySelector("div").className = itemClasses;
//         let h2 = clone.querySelectorAll("h2");
//         h2[0].textContent = name;
//         h2[1].firstChild.textContent = attribute.value; 

//         if (editCallback) {
//             clone.addEventListener("click", (_) => editCallback(dawnData.attributes[attribute.index]));
//         }

//         container.appendChild(clone);
//     }
// }
