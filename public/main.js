// Of note this page has lots of XSS vulurabilities due to innerHTML but that 
// alright. :)

let data;

let popupopen = false;
let editmode = false;

let estats;
let eskills;
let ename;
let etechniques;
let ebody;

let eswitch;

// TODO: I think this is mostly the same code as `editSkill`
function editAttribute(attr) {
    if (!editmode) return;
    if (popupopen) return;

    popupopen = true;

    const popup = document.createElement("div");
    popup.classList.add("popup", "space-text")
    popup.classList.add("screen")

    const header = document.createElement("h1")
    header.contentEditable = true;
    header.innerText = attr.name;
    popup.appendChild(header)

    const score = document.createElement("h1")
    score.contentEditable = true;
    score.innerText = attr.score;
    popup.appendChild(score)

    const save = document.createElement("button");
    save.classList.add("file-button")
    save.innerText = "Save"
    save.onclick = (_) => {
        attr.name = header.innerText;
        attr.score = score.innerText;

        ebody.removeChild(popup)
        popupopen = false;

        // reloads the whole ui
        loadBundle()
    }
    popup.appendChild(save)

    ebody.appendChild(popup)
}

function editSkill(skill) {
    if (!editmode) return;
    if (popupopen) return;

    popupopen = true;

    const popup = document.createElement("div");
    popup.classList.add("popup", "space-text")
    popup.classList.add("screen")

    const header = document.createElement("h1")
    header.contentEditable = true;
    header.innerText = skill.name;
    popup.appendChild(header)

    const score = document.createElement("h1")
    score.contentEditable = true;
    score.innerText = skill.score;
    popup.appendChild(score)

    const save = document.createElement("button");
    save.classList.add("file-button")
    save.innerText = "Save"
    save.onclick = (_) => {
        skill.name = header.innerText;
        skill.score = score.innerText;

        ebody.removeChild(popup)
        popupopen = false;

        // reloads the technique part of the ui
        loadBundleSkills()
    }
    popup.appendChild(save)

    ebody.appendChild(popup)
}

function editTechnique(technique) {
    if (!editmode) return;
    if (popupopen) return;

    popupopen = true;

    const popup = document.createElement("div");
    popup.classList.add("popup", "space-text", "screen")

    const header = document.createElement("h1")
    header.contentEditable = true;
    header.innerText = technique.name;
    popup.appendChild(header)

    const level= document.createElement("h1")
    level.contentEditable = true;
    level.innerText = technique.level;
    popup.appendChild(level)

    let elements = []
    for (let i = 0; i < technique.skills.length; i++) {
        const rank = technique.skills[i];

        const header = document.createElement("h2")
        header.innerText = rank.name
        header.contentEditable = true;
        popup.appendChild(header);

        const desc = document.createElement("p");
        desc.innerText = rank.desc;
        desc.contentEditable = true;
        popup.appendChild(desc);

        elements.push({
            name: header,
            desc: desc
        })
    }

    const save = document.createElement("button");
    save.classList.add("file-button")
    save.innerText = "Save"
    save.onclick = (_) => {
        technique.name = header.innerText;
        technique.level = level.innerText;

        for (let i = 0; i < technique.skills.length; i++) {
            const skill = technique.skills[i]
            const element = elements[i]

            skill.name = element.name.innerText;
            skill.desc = element.desc.innerText;
        }

        ebody.removeChild(popup)
        popupopen = false;

        // reloads the technique part of the ui
        loadBundleTechniquies()
    }
    popup.appendChild(save)

    ebody.appendChild(popup)
}

let atributes = {}

function preprocessAttributes() {
    atributes = {}
    for (var i = 0; i < data.atributes.length; i++) {
        const atribute = data.atributes[i]
        atributes[atribute.name] = {
            value: dawnParse(atribute.score, atributes),
            index: i,
        }
    }
}

function loadBundleTechniquies() {
    etechniques.innerHTML = ""

    for (const t in data.techniques) {
        const technique = data.techniques[t];

        const techniquesbox = document.createElement("div");
        // techniquesbox.classList.add("techniquesbox");
        techniquesbox.classList.add("screen", "flexdown");

        techniquesbox.addEventListener("click", (_) => editTechnique(technique))

        const name = document.createElement("h2");
        name.innerHTML = technique.name;
        techniquesbox.appendChild(name);

        for (let i = 0; i < technique.level; i++) {
            const rank = technique.skills[i];

            const header = document.createElement("h3")
            header.textContent = rank.name
            techniquesbox.appendChild(header);

            let thing = ""
            let start = 0
            const matches = dawnMatch(rank.desc)
            for (m in matches) {
                const match = matches[m]
                // TODO: make some sort of hover thing for this bold 
                const parsed = "<strong>" + dawnParse(match.inner, atributes) + "</strong>"
                thing = thing + rank.desc.substring(start, match.start) + parsed
                start = match.end
            }
            thing = thing + rank.desc.substring(start)

            const desc = document.createElement("p");

            // HACK: this can be used for XSS
            desc.innerHTML = thing;
            techniquesbox.appendChild(desc);
        }

        etechniques.appendChild(techniquesbox);
    }
}

function loadBundleSkills() {
    eskills.innerHTML = "";

    for (var i = 0; i < data.skills.length; i++) {
        const skill = data.skills[i];
        const skillbox = document.createElement("div");
        // skillbox.classList.add("skillbox");
        skillbox.classList.add("screen");
        skillbox.classList.add("flexacross");
        skillbox.innerHTML =
            "<h2>" + skill.name + "</h2>" +
            "<div class=\"flexfill\"></div>" +
            "<h2>" + skill.score + "</h2>";

        skillbox.addEventListener("click", (_) => editSkill(skill))

        eskills.appendChild(skillbox);
    }
}

function loadBundleAttributes() {
    estats.innerHTML = "";

    for (const name in atributes) {
        const statbox = document.createElement("div");
        statbox.classList.add("screen");
        statbox.classList.add("statbox");
        statbox.classList.add("flexdown");

        let atribute = atributes[name]

        statbox.innerHTML =
            "<h3>" + name + "</h3>" +
            // "<div class=\"flexfill\"></div>" +
            "<h3>" + atribute.value + "</h3>";

        statbox.addEventListener("click", (_) => editAttribute(data.atributes[atribute.index]))

        estats.appendChild(statbox);
    }
}

function loadBundleName() {
    // clears existing content
    ename.innerText = data.name;
    ename.onclick = (_) => {
        if (!editmode) return;
        if (popupopen) return;

        popupopen = true;

        const popup = document.createElement("div");
        popup.classList.add("popup", "space-text")
        popup.classList.add("screen")

        const header = document.createElement("h1")
        header.contentEditable = true;
        header.innerText = data.name
        popup.appendChild(header)

        const save = document.createElement("button");
        save.classList.add("file-button")
        save.innerText = "Save"
        save.onclick = (_) => {
            data.name = header.innerText

            ebody.removeChild(popup)
            popupopen = false;

            // reloads the name in ui
            ename.innerText = data.name
        }
        popup.appendChild(save)

        ebody.appendChild(popup)
    }
}

function loadBundle() {
    preprocessAttributes();

    // reload all Ui elemets
    loadBundleName()
    loadBundleAttributes()
    loadBundleSkills()
    loadBundleTechniquies()
}

window.addEventListener('load', function () {
    estats = document.getElementById("stats");
    eskills = document.getElementById("skills");
    ename = document.getElementById("playername");
    etechniques = document.getElementById("techniques");

    ebody = document.querySelector("body")

    eswitch = document.getElementById("edit-switch")
    eswitch.addEventListener("click", (_) => {
        // if (popupopen) return;
        editmode = eswitch.checked
    });

    const inputfile = document.getElementById("inputfile");
    inputfile.addEventListener("change", () => {
        if (inputfile.files.length != 1) { console.log("Select only 1 file!"); return; }

        var reader = new FileReader();
        reader.onload = function() {
            data = JSON.parse(reader.result);
            loadBundle();
        };
        reader.readAsText(inputfile.files[0]);
    });
})

// 000000000000000000000000 Button Functions 0000000000000000000000000000000000
function usetemplate() {
    fetch("/template.json").then((tmpl) => {
        tmpl.json().then((d) => {
            data = d
            loadBundle()
        })
    })
}

function savedata() {
    if (typeof data == "undefined") return;

    var a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(new Blob([JSON.stringify(data)], {type: 'application/json'}));

    a.download = data.name + ".json"

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// ----------------------  begin DawnMath.js -----------------------------------

/**
 * One match in a string
 * @typedef {Object} DawnMatch
 * @property {number} start - start index of the match
 * @property {number} end - end index of the match
 * @property {string} inner - the inner content of the match withou the braces
 */

/**
 * The `dawnMatch` finds the locations of things matching `$[...]` in strings 
 * and returns the indexes
 * @param {string} str
 * @returns {DawnMatch[]} A lists of matches
*/
function dawnMatch(str) {
    /** @const {DawnMatch[]} */
    let matches = [];

    var start = -1;

    var searching = false;
    var brackets = 0;

    for (var i = 0; i < str.length; i++) {
        const c = str[i];
        // console.log("char: " + c + ", i: " + i)
        if (searching) {
            if (c == '[') brackets += 1

            if (c == ']') {
                brackets -= 1
                // TODO: check for underflow
                // console.log("removing bracket (count: " + brackets + ")")

                if (brackets == 0) {
                    // console.log("start: " + start + ", end: " + i)
                    // HACK: I dont know why but this MUST be written this way
                    // to work properly
                    let match = str.substring(start, i)
                    match = match.substring(2)

                    // console.log("found match: " + match)
                    matches.push({
                        start: start,
                        end: i + 1,
                        inner: match
                    })
                    searching = false
                }
            }
        } else {
            if (c == '$') {
                searching = true
                brackets = 0
                start = i;
            }
        }
    }

    return matches
}

function dawnRoundUp(num) {
    let precision = 0;
    precision = Math.pow(10, precision)
    return Math.ceil(num * precision) / precision
}

function dawnMath(str) {
    const value = Function(`'use strict'; return (${str})`)()
    return dawnRoundUp(value)
}

/**
 * Parses a string and evaluates all math expressions to compute result
 * and returns the indexes
 * @param {string|number} input
 * @returns {number} the parsed result
*/
function dawnParse(input, opts) {
    /** @const {string} */
    let str;
    if (typeof input === 'number') return input;
    else str = input;

    if (str.length == 0) { return 0; }

    let output = ""
    let start = 0;

    // look for the escape sequence
    // const matches = str.match(/\$\[[^6]*\]/g);
    const matches = dawnMatch(str)

    for (m in matches) {
        const match = matches[m];
        const inner = match.inner;

        let replace;

        if (opts[inner] != null) { replace = opts[inner].value } 
        else { replace = dawnParse(inner, opts) }

        output = output + str.substring(start, match.start) + replace;
        start = match.end
    }

    // add the rest, if there are no matches this just adds the whole string
    output = output + str.substring(start);

    try { return dawnMath(output); }
    catch (e) { return "\%Syntax Error\%" }
}

// ------------------------ end DawnMath.js ------------------------------------
