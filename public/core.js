/** Global state for the project
 * @typedef {Object} OpenRpgContext @property {} hooks - Indicates whether the Courage component is present.
 * @property {} character - Indicates whether the Power component is present.
 */
const OpenRpg = {
    hooks: {},
    character: null,

    /**
     * Register a hook.
     * @param string id name of the callback
     * @param Function fn function to call
     */
    register(id, fn) {
        this.hooks[id] = fn;
    },

    call(name, ...args) {
        const fn = this.hooks[name];
        if (typeof fn === "function") { return fn(...args); }
        return null;
    },

    data(id) {
        return this.character[id];
    },

    async load(id) {
        // TODO: do some sort of caching for this
        const response = await fetch(`/api/modules/${id}/download`);
        if (!response.ok) {
            console.warn(`Module not found: ${id}`);
            return null;
        }

        const bundle = await response.text();
        new Function([], bundle)();
    },

    init() {
        const dropzone = document.getElementById("dropzone");
        const fileInput = document.getElementById("loadfile");

        dropzone.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropzone.classList.add("border-teal-500");
        });

        dropzone.addEventListener("dragleave", () => {
            dropzone.classList.remove("border-teal-500");
        });

        dropzone.addEventListener("drop", (e) => {
            e.preventDefault();
            dropzone.classList.remove("border-teal-500");
            const file = e.dataTransfer.files[0];
            if (file && file.type === "application/json") {
                this.loadFile(file);
            }
        });

        dropzone.addEventListener("click", () => fileInput.click());
        fileInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) this.loadFile(file);
        });

        document
            .getElementById("savefile")
            .addEventListener("click", () => this.saveFile());
        document
            .getElementById("new-character")
            .addEventListener("click", () => this.showHome());
    },

    loadFile(file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
            let data;
            try {
                data = JSON.parse(event.target.result);
            } catch (e) {
                console.error("Failed to load character:", e);
                alert("Failed to load character file");
            }

            const reserved = ["version", "name", "layout"];
            const dependencies = Object.keys(data).filter(
                (key) => !reserved.includes(key),
            );

            console.log("Loading dependencies: ", dependencies);

            await Promise.all(dependencies.map((id) => this.load(id)));

            this.character = data;
            this.render();
        };
        reader.readAsText(file);
    },

    /* Initial render of the page after new character is loaded
     */
    render() {
        document.getElementById("app").classList.add("hidden");
        document.getElementById("mainscreen").classList.remove("hidden");

        this.buildLayout(this.data.layout);
        this.renderPanes();
    },

    buildLayout(layoutConfig) {
        console.log(layoutConfig);

        const main = document.getElementById("maincontent");
        main.className =
            layoutConfig?.container || "flex flex-row gap-4 flex-wrap";
        main.replaceChildren();

        const column = document.createElement("div");
        column.className =
            layoutConfig?.column ||
            "border-2 border-white rounded-lg p-4 flex flex-col gap-4 flex-1";
        column.style.maxWidth = "1200px";
        main.appendChild(column);

        const panes = layoutConfig?.panes || [];

        if (panes.length === 0) {
            column.innerHTML =
                '<p class="text-gray-500">No panes defined in layout</p>';
            return;
        }

        for (const pane of panes) {
            const fieldset = document.createElement("fieldset");
            fieldset.className = "border-2 border-teal-700 rounded-lg p-2";

            const legend = document.createElement("legend");
            legend.className = "text-2xl px-4 text-teal-400";
            legend.textContent = pane.title;
            fieldset.appendChild(legend);

            const container = document.createElement("div");
            container.id = pane.id;
            container.className = pane.containerClasses || "";
            fieldset.appendChild(container);

            column.appendChild(fieldset);
        }
    },

    renderPanes() {
        const panes = this.data.layout?.panes || [];

        for (const pane of panes) {
            const container = document.getElementById(pane.id);
            if (!container) continue;

            const fn = this.call(pane.hook);
            if (fn) {
                fn(container, this.data, null, pane);
            } else {
                container.innerHTML = `<p class="text-gray-500">No handler for ${pane.hook}</p>`;
            }
        }
    },

    saveFile() {
        if (!this.data) return;

        const a = document.createElement("a");
        a.href = URL.createObjectURL(
            new Blob([JSON.stringify(this.data, null, 2)], {
                type: "application/json",
            }),
        );
        a.download = (this.data.name || "character") + ".json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    },

    showHome() {
        this.data = null;
        document.getElementById("mainscreen").classList.add("hidden");
        document.getElementById("app").classList.remove("hidden");
        document.getElementById("loadfile").value = "";
    },
};

OpenRpg.Math = {
/*
function dawnMatch(str) {
    let matches = [];
    var start = -1;
    var searching = false;
    var brackets = 0;

    for (var i = 0; i < str.length; i++) {
        const c = str[i];
        if (searching) {
            if (c == "[") brackets += 1;
            if (c == "]") {
                brackets -= 1;
                if (brackets < 0) {
                    searching = false;
                    continue;
                }
                if (brackets == 0) {
                    let match = str.substring(start, i);
                    match = match.substring(2);
                    matches.push({
                        start: start,
                        end: i + 1,
                        inner: match,
                    });
                    searching = false;
                }
            }
        } else {
            if (c == "$") {
                searching = true;
                brackets = 0;
                start = i;
            }
        }
    }
    return matches;
}

function dawnRoundUp(num, precision = 0) {
    precision = Math.pow(10, precision);
    return Math.ceil(num * precision) / precision;
}

function dawnMath(str) {
    const value = Function(`'use strict'; return (${str})`)();
    return dawnRoundUp(value);
}

function dawnParse(input, opts) {
    if (typeof input === "number") return input;
    let str = input;

    if (str.length == 0) {
        return 0;
    }

    let output = "";
    let start = 0;

    const matches = dawnMatch(str);

    for (m in matches) {
        const match = matches[m];
        const inner = match.inner;

        let replace;
        if (opts[inner] != null) {
            replace = opts[inner].value;
        } else {
            replace = dawnParse(inner, opts);
        }

        output = output + str.substring(start, match.start) + replace;
        start = match.end;
    }

    output = output + str.substring(start);

    try {
        return dawnMath(output);
    } catch (e) {
        return "\%Syntax Error\%";
    }
}
*/
};

window.OpenRpg = OpenRpg;
window.addEventListener("load", () => OpenRpg.init());
