export type ListElement = {
    id: number | string;
    label: string;
    [key: string]: any;
};

export type SelectedListManagerOptions<T extends ListElement> = {
    list?: T[];
    inputField?: boolean;
    inputFieldValue?: string;
    inputFieldRender?: (value: string) => HTMLInputElement;
    renderItem?: (item: T) => HTMLElement;
    renderList?: (list: T[]) => HTMLElement[];
    onDelete?: (id: string) => void;
    onClear?: () => void;
    onChange?: (value: string) => void;
    floatingLabel?: string;
};

export class SelectedListManager<T extends ListElement> {
    public parentElement: HTMLElement;
    public container: HTMLElement;
    public flexList: HTMLElement;
    public buttonsContainer: HTMLElement;
    public options: SelectedListManagerOptions<T>;
    public list: T[];
    public inputElement: HTMLInputElement | null = null;
    public clearButton: HTMLButtonElement;
    public floatingLabelElement: HTMLLabelElement | null = null;

    constructor(parentElement: HTMLElement, options: SelectedListManagerOptions<T> = {}) {
        this.parentElement = parentElement;
        
        this.options = {
            list: [],
            inputField: true,
            inputFieldValue: '',
            inputFieldRender: (value: string) => {
                const input = document.createElement('input');
                input.type = 'text';
                input.value = value;
                input.placeholder = " ";
                input.size = 1;
                return input;
            },
            renderItem: (item: T) => {
                const el = document.createElement('div');
                el.className = 'element';
                el.dataset.id = String(item.id);

                const label = document.createElement('label');
                label.textContent = item.label;

                const del = document.createElement('div');
                del.dataset.remove = String(item.id);

                el.appendChild(label);
                el.appendChild(del);

                return el;
            },
            ...options
        };

        if (!this.options.renderList) {
            this.options.renderList = (list: T[]) => {
                return list.map(item => this.options.renderItem!(item));
            };
        }

        this.list = this.options.list || [];

        this.container = document.createElement('div');
        this.container.className = 'selected-list';

        if (this.options.floatingLabel) {
            this.floatingLabelElement = document.createElement('label');
            this.floatingLabelElement.className = 'floating-label';
            this.floatingLabelElement.textContent = this.options.floatingLabel;
            this.container.appendChild(this.floatingLabelElement);
        }

        this.flexList = document.createElement('div');
        this.flexList.className = 'flex-list';

        this.buttonsContainer = document.createElement('div');
        this.buttonsContainer.className = 'buttons-container';

        this.clearButton = document.createElement('button');
        this.clearButton.className = 'clear-btn';
        this.clearButton.textContent = '✕';
        this.buttonsContainer.appendChild(this.clearButton);

        this.container.appendChild(this.flexList);
        this.container.appendChild(this.buttonsContainer);
        this.parentElement.appendChild(this.container);

        if (this.options.inputField) {
            this.inputElement = this.options.inputFieldRender!(this.options.inputFieldValue!);
        }

        this._bindEvents();
        this.render();
    }

    private _bindEvents() {
        this.parentElement.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;

            // Handle Clear Button
            const clearBtn = target.closest('.clear-btn');
            if (clearBtn && this.parentElement.contains(clearBtn)) {
                e.preventDefault();
                if (this.options.onClear) {
                    this.options.onClear();
                }
                return;
            }

            // Handle Delete Item
            const delBtn = target.closest('[data-remove]');
            if (delBtn && this.parentElement.contains(delBtn)) {
                if (this.options.onDelete) {
                    const id = delBtn.getAttribute('data-remove');
                    if (id) {
                        this.options.onDelete(id);
                    }
                }
                return;
            }

            // Handle Focus Input
            const container = target.closest('.selected-list');
            if (container && this.parentElement.contains(container)) {
                if (target.closest('.buttons-container')) {
                    return;
                }
                if (this.inputElement && target !== this.inputElement) {
                    this.inputElement.focus();
                }
            }
        });

        this.parentElement.addEventListener('input', (e) => {
            const target = e.target as HTMLElement;
            if (target === this.inputElement && this.options.onChange) {
                this.options.onChange((target as HTMLInputElement).value);
            }
        });
    }

    updateList(list: T[]) {
        this.list = list;
        this.render();
    }

    setInputField(show: boolean) {
        this.options.inputField = show;
        if (show && !this.inputElement) {
            this.inputElement = this.options.inputFieldRender!(this.options.inputFieldValue || '');
        }
        this.render();
    }

    setInputValue(value: string) {
        this.options.inputFieldValue = value;
        if (this.inputElement) {
            this.inputElement.value = value;
        }
    }

    setErrorState(isError: boolean) {
        if (isError) {
            this.container.classList.add('error');
        } else {
            this.container.classList.remove('error');
        }
    }

    setDisabled(disabled: boolean) {
        if (disabled) {
            this.container.classList.add('disabled');
            if (this.inputElement) this.inputElement.disabled = true;
            this.clearButton.disabled = true;
        } else {
            this.container.classList.remove('disabled');
            if (this.inputElement) this.inputElement.disabled = false;
            this.clearButton.disabled = false;
        }
    }

    render() {
        const elements = this.options.renderList!(this.list);

        if (!Array.isArray(elements)) {
            throw new Error('renderList must return an array of HTMLElements');
        }

        // clear the list (except touching input)
        const children = Array.from(this.flexList.childNodes);
        for (const child of children) {
            if (child !== this.inputElement) {
                this.flexList.removeChild(child);
            }
        }

        // rendering elements in order before input
        for (const el of elements) {
            if (!(el instanceof HTMLElement)) {
                throw new Error('renderList must return an array of HTMLElements');
            }
            if (this.inputElement && this.inputElement.parentNode === this.flexList) {
                this.flexList.insertBefore(el, this.inputElement);
            } else {
                this.flexList.appendChild(el);
            }
        }

        // ensure input is at the end if it was just created or detached
        if (this.options.inputField && this.inputElement) {
            if (this.inputElement.parentNode !== this.flexList) {
                this.flexList.appendChild(this.inputElement);
            }
        } else if (!this.options.inputField && this.inputElement && this.inputElement.parentNode === this.flexList) {
            this.flexList.removeChild(this.inputElement);
        }
    }
}
