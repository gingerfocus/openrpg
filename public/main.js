let data;

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

function usetemplate() {
    fetch("/template.json").then((tmpl) => {
        tmpl.json().then((d) => {
            data = d
            main()
        })
    })
}

const main = function () {
    const estats = document.getElementById("stats");

    for (const feild in data.atributes) {
        const statbox = document.createElement("div");
        statbox.classList.add("statbox");

        let v;
        if (typeof data.atributes[feild] == "string") {
            v = parse(data.atributes[feild])
        } else {
            v = data.atributes[feild]
        }
        statbox.innerHTML =
            "<p>" + feild + "</p>" +
            "<p>" + v + "</p>";

        estats.appendChild(statbox);
    }

    const eskills = document.getElementById("skills");

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

function parse(str) {
    return Function(`'use strict'; return (${str})`)()
}

window.addEventListener('load', function () {
    const inputfile = document.getElementById("inputfile");
    inputfile.addEventListener("change", () => {
        // if (inputfile.files.length == 1) { console.log("File selected: ", inputfile.files[0]); }
        var reader = new FileReader();
        reader.onload = function() {
            const obj = JSON.parse(reader.result);
            // console.log("new input: " + obj);
            data = obj;
            main();
        };
        reader.readAsText(inputfile.files[0]);
    });
})
