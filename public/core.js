/** @type {Record<string, any> | null} */
let _character = null;

/** @type {Record<string, Function>} */
const _hooks = {};

/** @type {any} */
const _math = {
    /**
     * @param {string} str
     * @returns {{ start: number, end: number, inner: string }[]}
     */
    dawnMatch(str) {
        /** @type {{ start: number, end: number, inner: string }[]} */
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
    },

    /**
     * @param {number} num
     * @param {number} [precision]
     * @returns {number}
     */
    dawnRoundUp(num, precision = 0) {
        precision = Math.pow(10, precision);
        return Math.ceil(num * precision) / precision;
    },

    /**
     * @param {string} str
     * @returns {number}
     */
    dawnMath(str) {
        const value = Function(`'use strict'; return (${str})`)();
        return this.dawnRoundUp(/** @type {number} */ (value));
    },

    /**
     * @param {number | string} input
     * @param {Record<string, { value: number }>} opts
     * @returns {number}
     */
    dawnParse(input, opts) {
        if (typeof input === "number") return input;
        let str = /** @type {string} */ (input);

        if (str.length == 0) {
            return 0;
        }

        let output = "";
        let start = 0;

        const matches = this.dawnMatch(str);

        for (const m in matches) {
            const match = matches[/** @type {keyof typeof matches} */ (m)];
            const inner = match.inner;

            /** @type {number | string} */
            let replace;
            if (opts[inner] != null) {
                replace = opts[inner].value;
            } else {
                replace = this.dawnParse(inner, opts);
            }

            output = output + str.substring(start, match.start) + replace;
            start = match.end;
        }

        output = output + str.substring(start);

        try {
            return this.dawnMath(output);
        } catch (e) {
            return -1;
        }
    }
};

/** @type {any} */
const OpenRpg = {
    get hooks() { return _hooks; },

    get character() { return _character; },
    set character(v) { _character = v; },

    /**
     * @param {string} id
     * @param {Function} fn
     */
    register(id, fn) {
        _hooks[id] = fn;
    },

    /**
     * @param {string} name
     * @param {...any} args
     * @returns {any}
     */
    call(name, ...args) {
        const fn = _hooks[name];
        if (typeof fn === "function") { return fn(...args); }
        return null;
    },

    /**
     * @param {string} id
     * @returns {any}
     */
    get(id) {
        // @ts-ignore
        return _character?.[id];
    },

    /**
     * @param {string} id
     * @param {any} data
     */
    set(id, data) {
        if (_character) {
            // @ts-ignore
            _character[id] = data;
        }
    },

    /**
     * @param {string} id
     * @returns {Promise<null | void>}
     */
    async load(id) {
        const response = await fetch(`/api/modules/${id}`);
        if (!response.ok) {
            console.warn(`Module not found: ${id}`);
            return null;
        }

        const bundle = await response.text();
        new Function(bundle)();
    },

    /** Initialize event listeners. */
    init() {
        const dropzone = /** @type {HTMLElement | null} */ (document.getElementById("dropzone"));
        const fileInput = /** @type {HTMLInputElement | null} */ (document.getElementById("loadfile"));

        if (!dropzone || !fileInput) return;

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
            const dt = /** @type {DataTransfer | null} */ (e.dataTransfer);
            if (!dt) return;
            const file = dt.files[0];
            if (file && file.type === "application/json") {
                OpenRpg.loadFile(file);
            }
        });

        dropzone.addEventListener("click", () => fileInput.click());
        fileInput.addEventListener("change", (e) => {
            const target = /** @type {HTMLInputElement | null} */ (e.target);
            if (!target) return;
            const file = target.files?.[0];
            if (file) OpenRpg.loadFile(file);
        });

        const saveBtn = document.getElementById("savefile");
        const newBtn = document.getElementById("new-character");
        if (saveBtn) saveBtn.addEventListener("click", () => OpenRpg.saveFile());
        if (newBtn) newBtn.addEventListener("click", () => OpenRpg.showHome());
    },

    /**
     * @param {File} file
     */
    loadFile(file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const result = /** @type {string | null} */ (event.target?.result);
                if (!result) return;
                // @ts-ignore
                OpenRpg.character = JSON.parse(result);
            } catch (e) {
                console.error("Failed to load character:", e);
                alert("Failed to load character file");
                return;
            }

            // @ts-ignore
            const data = OpenRpg.character;
            if (!data) return;

            const reserved = ["version", "name", "layout"];
            /** @type {string[]} */
            const dependencies = Object.keys(data).filter(
                (key) => !reserved.includes(key),
            );

            console.log("Loading dependencies: ", dependencies);

            await Promise.all(dependencies.map((id) => OpenRpg.load(id)));

            OpenRpg.render();
        };
        reader.readAsText(file);
    },

    /** Render the character sheet. */
    render() {
        const app = document.getElementById("app");
        const mainscreen = document.getElementById("mainscreen");
        if (!app || !mainscreen) return;

        // @ts-ignore
        const data = OpenRpg.character;
        if (!data) return;

        app.classList.add("hidden");
        mainscreen.classList.remove("hidden");

        // @ts-ignore
        OpenRpg.buildLayout(data.layout ?? null);
        OpenRpg.renderPanes();
    },

    /**
     * @param {any} layoutConfig
     */
    buildLayout(layoutConfig) {
        console.log(layoutConfig);

        const main = /** @type {HTMLElement | null} */ (document.getElementById("maincontent"));
        if (!main) return;

        main.className =
            layoutConfig?.container || "flex flex-row gap-4 flex-wrap";
        main.replaceChildren();

        const column = document.createElement("div");
        column.className =
            layoutConfig?.column ||
            "border-2 border-white rounded-lg p-4 flex flex-col gap-4 flex-1";
        column.style.maxWidth = "1200px";
        main.appendChild(column);

        /** @type {any[]} */
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

    /** Render all panes. */
    renderPanes() {
        // @ts-ignore
        const data = OpenRpg.character;
        if (!data) return;

        /** @type {any[]} */
        const panes = data.layout?.panes || [];

        for (const pane of panes) {
            const container = document.getElementById(pane.id);
            if (!container) continue;

            if (!OpenRpg.call(pane.hook, container, null, pane)) {
                container.innerHTML = `<p class="text-gray-500">No handler for ${pane.hook}</p>`;
            }
        }
    },

    /** Save character to file. */
    saveFile() {
        // @ts-ignore
        const data = OpenRpg.character;
        if (!data) return;

        const a = document.createElement("a");
        a.href = URL.createObjectURL(
            new Blob([JSON.stringify(data, null, 2)], {
                type: "application/json",
            }),
        );
        a.download = (data.name || "character") + ".json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    },

    /** Return to home screen. */
    showHome() {
        // @ts-ignore
        OpenRpg.character = null;
        const mainscreen = document.getElementById("mainscreen");
        const app = document.getElementById("app");
        const loadfile = /** @type {HTMLInputElement | null} */ (document.getElementById("loadfile"));
        if (mainscreen) mainscreen.classList.add("hidden");
        if (app) app.classList.remove("hidden");
        if (loadfile) loadfile.value = "";
    },
};

// Global exports
// @ts-ignore
window.OpenRpg = OpenRpg;
// @ts-ignore
window.OpenRpgMath = _math;

window.addEventListener("load", () => OpenRpg.init());
