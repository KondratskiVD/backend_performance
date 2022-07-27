const DropdownAnalytic = {
    props: {
        itemsList: {
            type: Array,
            default: [],
        },
        showAllCbx: {
            type: Boolean,
            default: false
        },
        showSearch: {
            type: Boolean,
            default: false
        },
        instance_name: {
            type: String
        }
    },
    data() {
        return {
            inputSearch: '',
            refSearchId: 'refSearchCbx'+Math.round(Math.random() * 1000),
            selectedItems: [],
            closeOnItem: true,
            clickedItem: {
                title: '',
                isChecked: false,
            }
        }
    },
    computed: {
        foundItems() {
            return this.inputSearch ?
                this.itemsList.filter(item => {
                    return item.toUpperCase().includes(this.inputSearch.toUpperCase())
                }) :
                this.itemsList
        },
        isAllSelected() {
            return (this.selectedItems.length < this.itemsList.length) && this.selectedItems.length > 0
        }
    },
    watch: {
        selectedItems: function () {
            if(this.showAllCbx) {
                this.$refs[this.refSearchId].checked = this.selectedItems.length === this.itemsList.length ? true : false;
            }
            this.$emit('select-items', { selectedItems: this.selectedItems, clickedItem: this.clickedItem});
        }
    },
    methods: {
        handlerSelectAll() {
            if (this.selectedItems.length !== this.itemsList.length) {
                this.selectedItems = [...this.itemsList];
            } else {
                this.selectedItems.splice(0);
            }
        },
        setClickedItem(title, e) {
            this.clickedItem = {
                title, isChecked: e.target.checked
            }
        }
    },
    template: `
        <div id="complexList" class="complex-list">
            <button class="btn btn-select dropdown-toggle" type="button"
                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <span v-if="selectedItems.length > 0" class="complex-list_filled">{{ selectedItems.length }} selected</span>
                <span v-else class="complex-list_empty">Select Step</span>
            </button>
            <div class="dropdown-menu"
                :class="{'close-outside': closeOnItem}">
                <div v-if="itemsList.length > 4 && showSearch" class="px-3 pb-2 search-group">
                    <div class="custom-input custom-input_search__sm position-relative">
                        <input
                            type="text"
                            placeholder="Search"
                            v-model="inputSearch">
                        <img src="/design-system/static/assets/ico/search.svg" class="icon-search position-absolute">
                    </div>
                </div>
                <ul class="my-0">
                    <li
                       v-if="showAllCbx"
                       class="dropdown-item dropdown-menu_item d-flex align-items-center">
                       <label
                            class="mb-0 w-100 d-flex align-items-center custom-checkbox"
                            :class="{ 'custom-checkbox__minus': isAllSelected }">
                            <input
                                :ref="refSearchId"
                                click="handlerSelectAll"
                                type="checkbox">
                            <span class="w-100 d-inline-block ml-3">All</span>
                       </label>
                    </li>
                    <li
                        class="dropdown-item dropdown-menu_item d-flex align-items-center"
                        v-for="item in foundItems" :key="item">
                         <label
                            class="mb-0 w-100 d-flex align-items-center custom-checkbox">
                            <input
                                :value="item"
                                v-model="selectedItems"
                                @click="setClickedItem(item, $event)"
                                type="checkbox">
                            <span class="w-100 d-inline-block ml-3">{{ item }}</span>
                        </label>
                    </li>
                </ul>
            </div>
        </div>`
};