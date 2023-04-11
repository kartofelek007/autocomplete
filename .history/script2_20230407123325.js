function debounced(delay, fn) {
    let timerId;
    return function(...args) {
        if (timerId) {
            clearTimeout(timerId);
        }
        timerId = setTimeout(() => {
            fn(...args);
            timerId = null;
        }, delay);
    }
}

class Autocomplete {
    constructor(input, options) {
        this.input = input;
        this.selectIndex = -1;
        this.options = {...{
            url : "",
            val : null
        }, ...options};
        this.makeHTML();
        this.bindEvents();
    }

    makeHTML() {
        const cnt = document.createElement("div");
        cnt.classList.add("autocomplete");

        this.cnt = cnt;
        this.input.after(cnt);
        cnt.append(this.input);

        const div = document.createElement("div");
        div.classList.add("autocomplete-place");
        this.div = div;
        this.input.after(div);
    }

    renderElement(inputValue, data) {
        let val = inputValue.toUpperCase();
        let temp = data.toUpperCase();
        let indexStart = temp.indexOf(val);
        let indexEnd = indexStart + inputValue.length;
        let part1 = data.substring(0, indexStart);
        let part2 = data.substring(indexStart, indexEnd);
        let part3 = data.substring(indexEnd);

        return `${part1}<b>${part2}</b>${part3}`;
    }

    createList(data) {
        this.removeList();

        const list = document.createElement("ul");
        list.classList.add("autocomplete-list");
        this.div.append(list);
        this.list = list;

        for (let jsonItem of data.suggestions) {
            const li = document.createElement("li");
            li.classList.add("autocomplete-list-el");
            li.innerHTML = this.renderElement(this.input.value, jsonItem);
            this.list.append(li);
        }
    }

    removeList() {
        if (this.list) this.list.remove();
        this.selectIndex = -1;
    }

    showList() {
        if (this.list) this.list.hidden = false;
    }

    hideList() {
        this.selectIndex = -1;
        if (this.list) this.list.hidden = true;
    }

    showLoading() {
        if (!this.cnt.querySelector(".autocomplete-loading")) {
            const loading = document.createElement("div");
            loading.classList.add("autocomplete-loading");
            this.cnt.append(loading);
        }
    }

    hideLoading() {
        if (this.cnt.querySelector(".autocomplete-loading")) {
            this.cnt.querySelector(".autocomplete-loading").remove();
        }
    }

    async makeRequest() {
        this.removeList();
        this.showLoading();

        try {
            const request = await fetch(this.options.url + "?q=" + this.input.value);
            const json = await request.json();
            this.createList(json);
        } catch (err) {
        } finally {
            this.hideLoading();
        }
    }

    bindInputEvent() {
        if (this.input.value.length < 3) {
            this.hideList();
            return false;
        }

        this.makeRequest();
    }

    markActive() {
        if (this.selectIndex > -1) {
            for (let li of this.list.children) {
                li.classList.remove("is-active");
            }
            this.list.children[this.selectIndex].classList.add("is-active");
        }
    }

    selectActive(input, selectedElement) {
        input.value = this.list.children[this.selectIndex].innerText;
    }

    bindEvents() {
        const tHandler = debounced(200, this.bindInputEvent.bind(this));
        this.input.addEventListener("input", tHandler.bind(this));

        this.input.addEventListener("keydown", e => {
            if (this.list) {
                const max = this.list.children.length;

                if (e.key === "ArrowDown") {
                    this.showList();
                    this.selectIndex++;
                    if (this.selectIndex > max - 1) {
                        this.selectIndex = 0;
                    }
                    //TODO przewijac do listy
                }
                if (e.key === "ArrowUp") {
                    this.showList();
                    this.selectIndex--;
                    if (this.selectIndex < 0) {
                        this.selectIndex = max - 1;
                    }
                    //TODO przewijac do listy
                }
                if (e.key === "Enter") {
                    this.selectActive(this.input, this.list.children[this.selectIndex]);
                    e.preventDefault();
                    this.hideList();
                }
                if (e.key === "Escape") {
                    e.preventDefault();
                    this.hideList();
                }

                this.markActive();
            }
        })

        document.addEventListener("click", e => {
            const el = e.target.closest(".autocomplete-list-el");
            if (el) {
                const index = [...this.list.children].indexOf(el);
                this.selectIndex = index;
                this.markActive();
                this.selectActive(this.input, this.list.children[this.selectIndex]);
                this.hideList();
            } else {
                this.hideList();
            }
        })

    }
}

const auto1 = new Autocomplete(document.querySelector("#testCities"), {
    url : "http://localhost:3333/cities"
})

const auto2 = new Autocomplete(document.querySelector("#testUsers"), {
    url : "http://localhost:3333/users"
})
auto2.renderElement = function(inputValue, data) {
    return `
        <div class="autocomplete-list-user-item">
            <div class="autocomplete-list-user-item-avatar"><img src="${data.avatar}" alt="" /></div>
            <div class="autocomplete-list-user-item-name">${data.first_name} ${data.last_name}</div>
            <div class="autocomplete-list-user-item-email">${data.email}</div>
        </div>
    `
}
auto2.selectActive = function(input, selectedElement) {
    const name = selectedElement.querySelector(".autocomplete-list-user-item-name").innerText;
    this.input.value = name;
}