// Of note this page has lots of XSS vulurabilities due to innerHTML but that 
// alright. :)

// ----------------------  begin DawnMath.js -----------------------------------

/// Returns an array of objects of the type:
/// {
///     "start": int,
///     "end": int,
///     "inner": String,
/// }
function dawnMatch(str) {
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

function dawnParse(str, opts) {
    if (typeof str === 'number') return str;
    if (str.length == 0) {
        return 0;
        // return { "ok": "0" };
        // return { "err": "Empty String" };
    }

    let output = ""
    let start = 0;

    // look for the escape sequence
    // const matches = str.match(/\$\[[^6]*\]/g);
    const matches = dawnMatch(str)

    for (m in matches) {
        const match = matches[m];
        const inner = match.inner;

        // console.log("match: " + inner);

        let replace;
        if (opts[inner] != null) {
            replace = opts[inner]
        } else {
            replace = dawnParse(inner, opts)
            // if (resu["ok"] != null) replace = resu["ok"]
            // else return resu;
        }
        // TODO: this code now needs to be fixed
        // output = output.replace(/\$\[[^8]*\]/, replace);

        output = output + str.substring(start, match.start) + replace;
        start = match.end

        // console.log("output: " + output + ", start: " + start);
    }

    output = output + str.substring(start);
    // console.log("output: " + output + ", start: " + start);

    try {
        return dawnMath(output);
        // return { "ok": ret };
    } catch (e) {
        return "\%Syntax Error\%"
        // return { "err": "\%Syntax Error\%" }
    }
}

// ------------------------ end DawnMath.js ------------------------------------

let data;

let popupopen = false;

let estats;
let eskills;
let ename;
let etechniques;
let ebody;

function editTechnique(technique) {
    if (popupopen) return;

    popupopen = true;

    const popup = document.createElement("div");
    popup.classList.add("popup")
    popup.classList.add("screen")

    const header = document.createElement("h1")
    header.contentEditable = true;
    header.innerText = technique.name;
    popup.appendChild(header)

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
    save.onclick = (event) => {
        technique.name = header.innerText;

        for (let i = 0; i < technique.skills.length; i++) {
            const skill = technique.skills[i]
            const element = elements[i]

            skill.name = element.name.innerText;
            skill.desc = element.desc.innerText;
        }

        document.querySelector("body").removeChild(popup)
        popupopen = false;

        // reloads the technique part of the ui
        loadBundleTechniquies()
    }
    popup.appendChild(save)

    ebody.appendChild(popup)
}

let atributes = {}

function preprocessAttributes() {
    atributes = data.atributes;
    for (feild in atributes) {
        atributes[feild] = dawnParse(atributes[feild], atributes)
    }
}

function loadBundleTechniquies() {
    etechniques.innerHTML = ""

    for (const t in data.techniques) {
        const technique = data.techniques[t];

        const techniquesbox = document.createElement("div");
        techniquesbox.classList.add("techniquesbox");

        techniquesbox.addEventListener("click", (event) => editTechnique(technique))

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
                const parsed = "<strong>" + dawnParse(match.inner, data.atributes) + "</strong>"
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
    for (const name in data.skills) {
        const skillbox = document.createElement("div");
        skillbox.classList.add("skillbox");
        skillbox.innerHTML =
            "<p>" + name + "</p>" +
            "<p>" + data.skills[name] + "</p>";

        eskills.appendChild(skillbox);
    }
}

function loadBundle() {
    preprocessAttributes();

    // clears existing content
    estats.innerHTML = "";
    eskills.innerHTML = "";
    ename.innerText = data.name;

    for (const feild in atributes) {
        const statbox = document.createElement("div");
        statbox.classList.add("statbox");

        let v = atributes[feild]

        statbox.innerHTML =
            "<p>" + feild + "</p>" +
            "<p>" + v + "</p>";

        estats.appendChild(statbox);
    }

    loadBundleSkills()

    loadBundleTechniquies()
}

window.addEventListener('load', function () {
    estats = document.getElementById("stats");
    eskills = document.getElementById("skills");
    ename = document.getElementById("playername");
    etechniques = document.getElementById("techniques");
    ebody = document.querySelector("body")

    const inputfile = document.getElementById("inputfile");
    inputfile.addEventListener("change", () => {
        if (inputfile.files.length != 1) { console.log("Selecte only 1 file."); return; }

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

// document.designMode = "on";

function savedata() {
    if (typeof data == "undefined") return;

    var a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(new Blob([JSON.stringify(data)], {type: 'application/json'}));

    // TODO: change file name to character name
    a.download = 'character.json';

    console.log("saving file");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
