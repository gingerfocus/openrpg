// Inventory Plugin
// Provides shared inventory and currency UI

(function() {
    function renderInventory(container, data, editCallback) {
        container.replaceChildren();

        const currencySection = document.createElement('div');
        currencySection.className = 'border-2 border-teal-700 rounded-lg p-3 bg-gray-900 mb-3';

        const currencyHeader = document.createElement('h3');
        currencyHeader.className = 'text-lg text-teal-400 mb-2';
        currencyHeader.textContent = 'Currency';
        currencySection.appendChild(currencyHeader);

        const currency = data.currency || { gold: 0, silver: 0, copper: 0 };
        const currencyDisplay = document.createElement('div');
        currencyDisplay.className = 'flex flex-row gap-4 text-sm';
        currencyDisplay.innerHTML = `
            <span class="text-yellow-400">${currency.gold || 0} gp</span>
            <span class="text-gray-300">${currency.silver || 0} sp</span>
            <span class="text-orange-700">${currency.copper || 0} cp</span>
        `;
        currencySection.appendChild(currencyDisplay);
        container.appendChild(currencySection);

        const inventorySection = document.createElement('div');
        inventorySection.className = 'border-2 border-teal-700 rounded-lg p-3 bg-gray-900';

        const invHeader = document.createElement('h3');
        invHeader.className = 'text-lg text-teal-400 mb-2';
        invHeader.textContent = 'Inventory';
        inventorySection.appendChild(invHeader);

        const slots = data.inventory?.slots || { total: 10, used: 0 };
        const slotsDisplay = document.createElement('p');
        slotsDisplay.className = 'text-xs text-gray-500 mb-2';
        slotsDisplay.textContent = `Slots: ${slots.used}/${slots.total}`;
        inventorySection.appendChild(slotsDisplay);

        const items = data.inventory?.items || [];
        if (items.length === 0) {
            const emptyMsg = document.createElement('p');
            emptyMsg.className = 'text-gray-500 text-sm';
            emptyMsg.textContent = 'No items';
            inventorySection.appendChild(emptyMsg);
        } else {
            const itemList = document.createElement('div');
            itemList.className = 'flex flex-col gap-1';

            for (const item of items) {
                const itemRow = document.createElement('div');
                itemRow.className = 'flex flex-row justify-between items-center text-sm';
                const qty = item.quantity > 1 ? ` (x${item.quantity})` : '';
                itemRow.innerHTML = `
                    <span>${item.name}${qty}</span>
                    <span class="text-gray-500 text-xs">${item.weight || 0} slot</span>
                `;
                itemList.appendChild(itemRow);
            }
            inventorySection.appendChild(itemList);
        }

        container.appendChild(inventorySection);
    }

    OpenRpg.register('openrpg.renderInventory', renderInventory);
})();
