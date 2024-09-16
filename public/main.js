// ------ Source: https://github.com/remy/min.js/blob/master/dist/%24.js -------

$ = (function (document, window, $) {
  // Node covers all elements, but also the document objects
  var node = Node.prototype,
      nodeList = NodeList.prototype,
      forEach = 'forEach',
      trigger = 'trigger',
      each = [][forEach],
      // note: createElement requires a string in Firefox
      dummy = document.createElement('i');

  nodeList[forEach] = each;

  // we have to explicitly add a window.on as it's not included
  // in the Node object.
  window.on = node.on = function (event, fn) {
    this.addEventListener(event, fn, false);

    // allow for chaining
    return this;
  };

  nodeList.on = function (event, fn) {
    this[forEach](function (el) {
      el.on(event, fn);
    });
    return this;
  };

  // we save a few bytes (but none really in compression)
  // by using [trigger] - really it's for consistency in the
  // source code.
  window[trigger] = node[trigger] = function (type, data) {
    // construct an HTML event. This could have
    // been a real custom event
    var event = document.createEvent('HTMLEvents');
    event.bubbles = true
    event.cancelable = true
    event.type = type;
    event.data = data || {};
    event.eventName = type;
    event.target = this;
    this.dispatchEvent(event);
    return this;
  };

  nodeList[trigger] = function (event) {
    this[forEach](function (el) {
      el[trigger](event);
    });
    return this;
  };

  $ = function (s) {
    // querySelectorAll requires a string with a length
    // otherwise it throws an exception
    var r = document.querySelectorAll(s || '☺'),
        length = r.length;
    // if we have a single element, just return that.
    // if there's no matched elements, return a nodeList to chain from
    // else return the NodeList collection from qSA
    return length == 1 ? r[0] : r;
  };

  // $.on and $.trigger allow for pub/sub type global
  // custom events.
  $.on = node.on.bind(dummy);
  $[trigger] = node[trigger].bind(dummy);

  return $;
})(document, this);

// ---- End Source: https://github.com/remy/min.js/blob/master/dist/%24.js -----

let data;

let popupopen = false;
let editmode = false;

let estats;
let eskills;
let ename;
let etechniques;
let ebody;


let editState = {
    popupRoot: null,
    reloadFn: () => {},
    // the reason the binds and elements are stored differently as we want to 
    // maintain a reference to the origonal object not make a new one and 
    // merging them would result in a deep copy
    bind: {},
    elem: {}
}

function rebindObjectData(src, dst) {
    for (const name in dst) {
        const element = src[name]
        if (element === undefined) continue

        if (element.innerText != undefined) {
            // assume it is a HTMLNode
            dst[name] = element.innerText
        } else {
            // TODO: assert that element.length is not null and a number
            // TODO: this could be rewritten to also handle objects by not recusing and rebinding here

            // assume it is an array of more binds
            for (var i = 0; i < element.length; i++) {
                rebindObjectData(src[name][i], dst[name][i])
            }
        }

    }
}

function editObject(object, reloadFn) {
    if (!editmode) return;
    if (popupopen) return;

    popupopen = true;

    // NODE.dataset

    $('main').classList.add('background-blurred')

    const popup = document.createElement("div");
    popup.classList.add("popup", "space-text", "screen")

    const elem = {}
    for (const name in object) {
        const item = document.createElement("h1")
        item.contentEditable = true;
        item.innerText = object[name];

        popup.appendChild(item)
        elem[name] = item
    }

    const save = document.createElement("button");
    save.classList.add("file-button")
    save.innerText = "Save"

    editState = {
        popupRoot: popup,
        reloadFn: reloadFn,
        bind: object,
        elem: elem
    }

    save.onclick = function onSave(__event) {
        rebindObjectData(editState.elem, editState.bind)

        ebody.removeChild(editState.popupRoot)
        popupopen = false;

        $('main').classList.remove('background-blurred')

        // reloads the ui
        editState.reloadFn()
    }

    popup.appendChild(save)
    ebody.appendChild(popup)
}

/// TODO: rewrite this to use the `editObject` function
function editTechnique(technique) {
    if (!editmode) return;
    if (popupopen) return;

    popupopen = true;

    $('main').classList.add('background-blurred')

    const popup = document.createElement("div");
    popup.classList.add("popup", "space-text", "screen")

    const header = document.createElement("h1")
    header.contentEditable = true;
    header.innerText = technique.name;
    popup.appendChild(header)

    const level = document.createElement("h1")
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

        $('main').classList.remove('background-blurred')

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
    etechniques.replaceChildren()

    for (const t in data.techniques) {
        const technique = data.techniques[t];

        const techniquesbox = document.createElement("div");
        techniquesbox.classList.add("screen", "flexdown");

        techniquesbox.addEventListener("click", (_) => editTechnique(technique))

        const name = document.createElement("h2");
        name.innerText = technique.name;
        techniquesbox.appendChild(name);

        for (let i = 0; i < technique.level; i++) {
            const rank = technique.skills[i];

            const header = document.createElement("h3")
            header.textContent = rank.name
            techniquesbox.appendChild(header);

            const desc = document.createElement("p");
            const matches = dawnMatch(rank.desc)

            let start = 0
            for (m in matches) {
                const match = matches[m]

                let textNode = document.createTextNode(rank.desc.substring(start, match.start))
                desc.appendChild(textNode)

                // TODO: make a hover element for this tag
                let parsedResult = document.createElement("strong")
                parsedResult.innerText = dawnParse(match.inner, atributes)
                desc.appendChild(parsedResult)

                start = match.end
            }
            let textNode = document.createTextNode(rank.desc.substring(start))
            desc.appendChild(textNode)

            techniquesbox.appendChild(desc);
        }

        etechniques.appendChild(techniquesbox);
    }
}

function loadBundleSkills() {
    eskills.replaceChildren();

    for (var i = 0; i < data.skills.length; i++) {
        const skill = data.skills[i];
        const skillbox = document.createElement("div");
        skillbox.classList.add("screen", "flexacross");
        skillbox.style.justifyContent = 'space-between'

        let nametag = document.createElement("h2")
        nametag.innerText = skill.name
        skillbox.appendChild(nametag)

        let scoretag = document.createElement("h2")
        let scorebold = document.createElement("strong")
        scorebold.innerText = skill.score
        scoretag.appendChild(scorebold)
        skillbox.appendChild(scoretag)

        nametag.innerText = skill.name

        skillbox.addEventListener("click", (_) => editObject(skill, loadBundleSkills))

        eskills.appendChild(skillbox);
    }
}

// TODO: event can contain data. try emitting an event that has the 
// `.data` feild set to the binding and have a universal handler for 
// that event that catches it
//
// document.addEventListener("editobject", (e) => {
//     const object = e.data.object;
//     const reload = e.data.reload;
//     editObject(object, reload)
// })

function loadBundleAttributes() {
    estats.replaceChildren();

    for (const name in atributes) {
        const atribute = atributes[name]

        const template = document.getElementById('tscorecard');
        // tscorecard
        const clone = template.content.cloneNode(true);
        let h2 = clone.querySelectorAll("h2");
        h2[0].textContent = name;
        // `firstChild` gets the bold element
        h2[1].firstChild.textContent = atribute.value; 

        clone.addEventListener("click", (_) => editObject(data.atributes[atribute.index], loadBundle))

        estats.appendChild(clone);
    }
}

function loadBundleName() {
    // backwards compat, remove after giving people some time to migrate
    if (data.name && !data.character) { data.character = { name: data.name } }

    const character = data.character

    ename.innerText = character.name;
    ename.onclick = (_) => { editObject(character, loadBundleName) }
}

function loadBundle() {
    var _e;
    if (_e = document.body.querySelector('#maincontent')) _e.remove();
    if (_e = document.body.querySelector('#loginscreen')) _e.remove();

    const template = document.getElementById('tmain');
    const clone = template.content.cloneNode(true);
    clone.id = 'maincontent'
    document.body.appendChild(clone)

    // ------------------------------------------------------------------------
    const savefile = document.getElementById("savefile");
    savefile.addEventListener("click", (_) => {
        if (typeof data == "undefined") return;

        var a = window.document.createElement('a');
        a.href = window.URL.createObjectURL(new Blob([JSON.stringify(data)], {type: 'application/json'}));

        a.download = data.character.name + ".json"

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });

    const cookiesavefile = document.getElementById("cookiesavefile");
    cookiesavefile.addEventListener("click", (_) => {
        if (typeof data == "undefined") return;

        try {
            window.localStorage.setItem("dawnthing", JSON.stringify(data))
        } catch (e) {
            console.error(e)
        }
    });
    // ------------------------------------------------------------------------

    estats = document.getElementById("stats");
    eskills = document.getElementById("skills");
    ename = document.getElementById("playername");
    etechniques = document.getElementById("techniques");

    ebody = this.document.body

    const eswitch = document.getElementById("edit-switch")
    eswitch.addEventListener("click", (e) => {
        // if (popupopen) return;
        editmode = e.target.checked
    });

    preprocessAttributes();

    // reload all Ui elemets
    loadBundleName()
    loadBundleAttributes()
    loadBundleSkills()
    loadBundleTechniquies()
}

window.addEventListener('load', (_) => {
    // ----------------------------- Button Inputs -----------------------------

    const loadfile = document.getElementById("loadfile");
    loadfile.addEventListener("change", (_) => {
        if (inputfile.files.length != 1) { console.log("Select only 1 file!"); return; }

        var reader = new FileReader();
        reader.onload = function() {
            data = JSON.parse(reader.result);
            loadBundle();
        };
        reader.readAsText(inputfile.files[0]);
    });


    const cookieloadfile = document.getElementById("cookieloadfile");
    cookieloadfile.addEventListener("click", (_) => {
        try {
            const d = window.localStorage.getItem("dawnthing");
            if (d == null) {
                console.error("could not load thing")
                return;
            }
            data = JSON.parse(d)
            loadBundle()
        } catch (e) {
            console.error(e)
        }
    });

    const usetemplatefile = document.getElementById("usetemplatefile");
    usetemplatefile.addEventListener("click", () => {
        fetch("/template.json").then((tmpl) => {
            tmpl.json().then((d) => {
                data = d
                loadBundle()
            })
        })
    })
})

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
        if (searching) {
            if (c == '[') brackets += 1

            if (c == ']') {
                brackets -= 1
                // if (brackets < 0) return "\%Match Error\%"
                if (brackets < 0) { searching = false; continue; }

                if (brackets == 0) {
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

/**
 * Rounds up a number to the nearsest integet
 * @param {number} num input number
 * @returns {number} rounded result
*/
function dawnRoundUp(num, precision = 0) {
    precision = Math.pow(10, precision)
    return Math.ceil(num * precision) / precision
}

/**
 * Evaluates a string to number using math
 * @param {string} str the string to parse
 * @returns {number} the result
*/
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
    if (typeof input === 'number') return input;
    let str = input;

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
