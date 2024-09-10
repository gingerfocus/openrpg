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

let estats;
let eskills; 

function preprocessBundle() {
    let atributes = data.atributes;
    for (feild in atributes) {
        atributes[feild] = dawnParse(atributes[feild], atributes)
    }
}

// loadBundle()
function main() {
    preprocessBundle();

    // clears existing content
    estats.innerHTML = "";
    eskills.innerHTML = "";


    for (const feild in data.atributes) {
        const statbox = document.createElement("div");
        statbox.classList.add("statbox");

        let v;
        if (typeof data.atributes[feild] == "string") {
            v = dawnMath(data.atributes[feild])
        } else {
            v = data.atributes[feild]
        }
        statbox.innerHTML =
            "<p>" + feild + "</p>" +
            "<p>" + v + "</p>";

        estats.appendChild(statbox);
    }

    for (const name in data.skills) {
        const skillbox = document.createElement("div");
        skillbox.classList.add("skillbox");
        skillbox.innerHTML =
            "<p>" + name + "</p>" +
            "<p>" + data.skills[name] + "</p>";

        eskills.appendChild(skillbox);
    }

    const ename = document.getElementById("playername");
    ename.innerHTML = data.name;

    const etechniques = document.getElementById("techniques");

    for (const techniqueName in data.techniques) {
        const techniquesbox = document.createElement("div");
        techniquesbox.classList.add("techniquesbox");

        const name = document.createElement("h3");
        name.innerHTML = techniqueName;
        techniquesbox.appendChild(name);

        const technique = data.techniques[techniqueName];

        const list = document.createElement("ul");

        for (let i = 0; i < technique.level; i++) {
            const description = technique.skills[i];
            const item = document.createElement("li");
            item.innerHTML = description;
            list.appendChild(item);
        }

        techniquesbox.appendChild(list);

        etechniques.appendChild(techniquesbox);
    }
}

window.addEventListener('load', function () {
    estats = document.getElementById("stats");
    eskills = document.getElementById("skills");

    const inputfile = document.getElementById("inputfile");
    inputfile.addEventListener("change", () => {
        if (inputfile.files.length != 1) { console.log("Selecte only 1 file."); return; }

        var reader = new FileReader();
        reader.onload = function() {
            data = JSON.parse(reader.result);
            main();
        };
        reader.readAsText(inputfile.files[0]);
    });
})

// 000000000000000000000000 Button Functions 0000000000000000000000000000000000
function usetemplate() {
    fetch("/template.json").then((tmpl) => {
        tmpl.json().then((d) => {
            data = d
            main()
        })
    })
}

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
