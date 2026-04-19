export const MODULE = '@core/stats';

interface StatItem {
  name: string;
  score: string | number;
}

interface StatsData {
  stats: StatItem[];
}

window.OpenRpg.register('core.stats', (container) => {
  container.replaceChildren();

  const data = window.OpenRpg.data(MODULE) as StatsData | null;
  if (!data || !data.stats || data.stats.length === 0) {
    container.innerHTML = '<p class="text-gray-500">No stats defined</p>';
    return true;
  }

  // TODO: build and store stats for recall
  // TODO: be able to set data for other plugins to fetch??

  for (const stat of data.stats) {
    const statbox = document.createElement("div");
    statbox.className = 'border-2 border-teal-700 rounded-lg p-2 flex flex-row justify-between';

    const nametag = document.createElement("h2");
    nametag.innerText = stat.name;
    statbox.appendChild(nametag);

    const scoretag = document.createElement("h2");
    const scorebold = document.createElement("strong");
    const parsedScore = window.OpenRpg.calculate(stat.score, {}, true);
    scorebold.innerText = String(parsedScore);
    scoretag.appendChild(scorebold);
    statbox.appendChild(scoretag);

    container.appendChild(statbox);
  }

  return true;
});
