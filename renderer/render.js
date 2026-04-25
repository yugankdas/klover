function render(elements) {
    let html = `<div class="column">`;

    for (let el of elements) {
        if (el.type === "text") {
            html += `<p class="kv-text">${el.value}</p>`;
        }

        if (el.type === "button") {
            html += `<button class="kv-button">${el.label}</button>`;
        }
    }

    html += `</div>`;

    return html;
}

module.exports = { render };
