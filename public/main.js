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

window.addEventListener('load', main)

function parse(str) {
    return Function(`'use strict'; return (${str})`)()
}

// document.write( "1+2+3", '=' , parse("1+2+3"), '<br>');
// document.write( "1 + 2 * 3", '=' , parse("1 + 2 * 3"), '<br>');

const data = {
    "name": "Rapheal Augirre",
    "atributes": {
        "Body": 4,
        "Talent": 3,
        "Spirit": 3,
        "Mind": 3,
        "Grit": "4 + 1",
        "Health": "2 * 4 + 2 * 1",
        "Speed": "2 + 2 / 2",
        "Focus": "1 + 3 / 2"
    },
    "ability":  {
        "points": 4,
        "desc": "You can transform the four elements into plants so long as you hold your breath."
    },
    "skills": {
        "Invincible Under the Sun": 1,
        "Unthinking Instinct": 1,
        "Water Dwelling": 2
    },
    "techniques": {
        "Dual Wielder": {
            "level": 3,
            "type": "Powerhouse",
            "skills": [
                `Twinned Blow: When you Skirmish targeting one character, you may “Flurry”,
                repeating the Attack with Swift at no cost. This reduces the dice rolled for
                both to half (before Advantage/Disadvantage).`,

                `Frenzied Barrage: When you spend 2 or more Focus on a Finisher, you may
                substitute it with three Swift Skirmishes that roll half their base dice (before
                applying Advantage/Disadvantage) used one after another (these skirmishes cannot
                trigger “Twinned Blow”).`,

                `Varied Blades: Your Skirmishes have an additional two effects that alternate
                every time you use Skirmish, resetting at the start of your Turn. The first
                Skirmish is *Astral: Gain \[Tier / 2\] Focus*, second is *Vorpal: Restore \[Tier /
                2\] Health*, third is Astral again.`
            ]
        },
        "Predator": {
            "level": 1,
            "type": "Powerhouse",
            "skills": [
                `Yearn: The first time you Investigate each Turn, it becomes Swift and has its
                Cost Reduced to 0. However, it can only be used to ask what your target’s
                current and maximum Health is. When any opponent is Knocked Out while adjacent
                to you, you heal a Wound.`,

                `Obsess: When you know an opponent has half their maximum Health remaining,
                your Speed is increased by 3, and you ignore Difficult Terrain, but you cannot
                move unless you’re moving closer to at least one of said opponents.`,

                `Devour: Once per Scene, when you heal a Wound using “Yearn” you may
                ‘Indulge’, Immobilizing and Dazing yourself. While you’re under these Effects,
                the Focus gained through Breathe and Charge are replaced with healing an equal
                number of Wounds.`
            ]
        },
        "Absolute Bastard": {
            "level": 1,
            "type": "Bulwark",
            "skills": [
                `Easy To Hate: When you Investigate an enemy, you may use this Technique to
                Taunt them. This can only be used 3 times per Scene.`,

                `Bully: Once per turn when you Taunt a character you may move up to 3 spaces
                towards them, if you move adjacent to them, you may Snare them and gain 1 AP.`,

                `Add Injury To Insult: Your Attacks against characters you’ve Taunted gain
                [Tier] Advantage.`
            ]
        }
    },
}

