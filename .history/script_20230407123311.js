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
            url : ""
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

    createList(data) {
        this.removeList();
        const list = document.createElement("ul");
        list.classList.add("autocomplete-list");
        this.div.append(list);
        this.list = list;

        let val = this.input.value.toUpperCase();
        for (let item of data) {
            let temp = item.toUpperCase();
            let indexStart = temp.indexOf(val);
            let indexEnd = indexStart + val.length;
            let part1 = item.substring(0, indexStart);
            let part2 = item.substring(indexStart, indexEnd);
            let part3 = item.substring(indexEnd);
            console.log({item, part1, part2, part3});
            const li = document.createElement("li");
            li.classList.add("autocomplete-list-el");
            console.log(indexStart, indexEnd);
            li.innerHTML = `${part1}<b>${part2}</b>${part3}`;
            this.hideList();
            this.list.append(li);
        }
    }

    removeList() {
        if (this.list) this.list.remove();
        this.selectIndex = -1;
    }

    showList() {
        this.list.hidden = false;
    }

    hideList() {
        this.selectIndex = -1;
        this.list.hidden = true;
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
        const request = await fetch(this.options.url + "?q=" + this.input.value);
        const json = await request.json();
        this.createList(json.suggestions);
        this.showList();
        this.hideLoading();
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

    selectActive() {
        this.input.value = this.list.children[this.selectIndex].innerText;
    }

    bindEvents() {
        const tHandler = debounced(200, this.bindInputEvent.bind(this));
        this.input.addEventListener("input", tHandler.bind(this));

        document.addEventListener("keydown", e => {
            if (this.list) {
                const max = this.list.children.length;

                if (e.key === "ArrowDown") {
                    this.showList();
                    this.selectIndex++;
                    if (this.selectIndex > max - 1) {
                        this.selectIndex = 0;
                    }
                }
                if (e.key === "ArrowUp") {
                    this.showList();
                    this.selectIndex--;
                    if (this.selectIndex < 0) {
                        this.selectIndex = max - 1;
                    }
                }
                if (e.key === "Enter") {
                    this.selectActive();
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
                this.selectActive();
                this.hideList();
            }
        })

    }
}

const auto = new Autocomplete(document.querySelector("input"), {
    url : "http://localhost:3333"
})