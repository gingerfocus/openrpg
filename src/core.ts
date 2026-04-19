interface Pane {
  id: string;
  title: string;
  hook: string;
  containerClasses?: string;
  itemClasses?: string;
}

interface Layout {
  container?: string;
  column?: string;
  panes: Pane[];
}

interface Character {
  version: string;
  name: string;
  layout: Layout;
  [moduleId: string]: unknown;
}

interface ModuleManifest {
  modules: Module[];
}

interface Module {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
}

// Takes the container and return true if it worked
type RenderHook = (container: HTMLElement) => boolean;

export interface OpenRpgGlobal {
  // install a hook, called from plugins
  register(id: string, fn: RenderHook): void;
  // Renders a hook into a specific element returning false if it fails somehow
  call(name: string, container: HTMLElement): boolean;
  // installs and run a modules from an id. TODO: caching
  install(id: string): Promise<boolean>;
  // loads a character from a file
  load(file: File): boolean;
  // redraws all panes to the screen
  render(): boolean;
  // downloads a character to a file
  save(): void;
  // runs on startup
  init(): void;
  /// renders a string to an output given a set of variables to use in
  /// calculation
  calculate(input: number | string, args: Record<string, number>, math: boolean): string
  // saves some arbitrary data, used in plugins
  data(id: string): unknown;

  hooks: Record<string, RenderHook>;
  character: Character | null;
}

declare global {
  interface Window {
    OpenRpg: OpenRpgGlobal;
  }
}

// TODO: is there a way to store these better
let _character: Character | null = null;
const _hooks: Record<string, RenderHook> = {};

const OpenRpg: OpenRpgGlobal = {
  get hooks() { return _hooks; },
  get character() { return _character; },
  set character(v: Character | null) { _character = v; },

  data(id: string): unknown | null {
      if (!this.character) return null;
      return this.character[id];
  },

  // set(id: string, data: unknown): unknown | null {
  //     return this.character?[id]
  // },

  register(id: string, fn: RenderHook) {
    console.log("registering funciton: " + id);
    _hooks[id] = fn;
  },

  call(name: string, container: HTMLElement): boolean {
    const fn: RenderHook | null = _hooks[name];
    if (!fn) return false;
    fn(container);
    return true;
  },

  async install(id) {
    const module = await import(`/modules/${id}.js`);
    return true;
  },

  init() {
    const dropzone = document.getElementById("dropzone");
    const fileInput = document.getElementById("loadfile") as HTMLInputElement | null;

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
      const dt = e.dataTransfer;
      if (!dt) return;
      const file = dt.files[0];
      if (file && file.type === "application/json") {
        OpenRpg.load(file);
      }
    });

    dropzone.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement | null;
      if (!target) return;
      const file = target.files?.[0];
      if (file) OpenRpg.load(file);
    });

    const saveBtn = document.getElementById("savefile");
    const newBtn = document.getElementById("new-character");
    if (saveBtn) saveBtn.addEventListener("click", () => OpenRpg.save());

    if (newBtn) newBtn.addEventListener("click", () => {
        OpenRpg.character = null
        OpenRpg.render()
    });
  },

  load(file: File) {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const result = event.target?.result;
        if (!result) return;
        OpenRpg.character = JSON.parse(result as string) as Character;
      } catch (e) {
        console.error("Failed to load character:", e);
        alert("Failed to load character file");
        return;
      }

      const data = OpenRpg.character;
      if (!data) return;

      const reserved = ["version", "name", "layout"];
      const dependencies = Object.keys(data).filter(
        (key) => !reserved.includes(key),
      );

      console.log("Loading dependencies: ", dependencies);

      await Promise.all(dependencies.map((id) => OpenRpg.install(id)));

      OpenRpg.render();
    };
    reader.readAsText(file);
    return true
  },

  render() {
    const app = document.getElementById("app");
    const mainscreen = document.getElementById("mainscreen");
    if (!app || !mainscreen) return false;

    const character = this.character;
    if (!character) {
        OpenRpg.character = null;
        const loadfile = document.getElementById("loadfile") as HTMLInputElement | null;
        mainscreen.classList.add("hidden");
        app.classList.remove("hidden");
        if (loadfile) loadfile.value = "";
    }

    const data = OpenRpg.character;
    if (!data) return false;
    if (!data.layout) return false;

    app.classList.add("hidden");
    mainscreen.classList.remove("hidden");

    const layoutConfig = data.layout ?? null;
    console.log(layoutConfig);

    const main = document.getElementById("maincontent");
    if (!main) return false;

    main.className = layoutConfig?.container || "flex flex-row gap-4 flex-wrap";
    main.replaceChildren();

    const column = document.createElement("div");
    column.className =
      layoutConfig?.column ||
      "border-2 border-white rounded-lg p-4 flex flex-col gap-4 flex-1";
    column.style.maxWidth = "1200px";
    main.appendChild(column);

    const panes = data.layout?.panes || [];

    if (panes.length === 0) {
      column.innerHTML = '<p class="text-gray-500">No panes defined in layout</p>';
      return false;
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

      if (!OpenRpg.call(pane.hook, container)) {
        container.innerHTML = `<p class="text-gray-500">No handler for ${pane.hook}</p>`;
      }

      fieldset.addEventListener("click", () => {
        // TODO: editing
        alert("Button clicked!");
      });
    }

    return true;
  },

  save() {
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

  calculate(
      input: string, 
      args: Record<string, number>,
      // if this is text should output a number
      math: boolean = false,
    ): string {

    interface Match {
      start: number;
      end: number;
      inner: string;
    }

    function findMatches(str: string): Match[] {
      let matches: Match[] = [];
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

    if (input.length == 0) return "";

    // TODO: build records as we iterate and create dependencies graph
    const matches = findMatches(input);
    var buf = "";
    var idx =  0;
    for (const  match of matches) {
        buf += input.substring(idx, match.start);
        idx = match.end;

        const value = this.calculate(match.inner, args, true)
        buf += value;
    }
    buf += input.substring(idx);

    if (math) {
      try {
        // pases function directly to a javascript envirorment and rounds the value 
        // up.
        const value = Function(`'use strict'; return (${buf})`)() as number;

        let precision = Math.pow(10, 0);
        return "" + Math.ceil(value * precision) / precision;
      } catch (e) {
        return "";
      }
    } else {
        return buf;
    }

  }
};

window.OpenRpg = OpenRpg;
window.addEventListener("load", () => OpenRpg.init());
