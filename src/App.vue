<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div
      v-if="loading"
      class="fixed w-100 h-100 opacity-80 bg-purple-800 inset-0 z-50 flex items-center justify-center"
    >
      <svg
        class="animate-spin -ml-1 mr-3 h-12 w-12 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
    <div class="container">
      <section>
        <div class="flex">
          <div class="max-w-xs">
            <label for="wallet" class="block text-sm font-medium text-gray-700"
              >Тикер</label
            >
            <div class="mt-1 relative rounded-md shadow-md">
              <input
                v-model="tickerValue"
                type="text"
                name="wallet"
                id="wallet"
                class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                placeholder="Например DOGE"
                @keydown.enter="addTicker(tickerValue)"
              />
            </div>
            <div
              v-if="matchedCoins.length"
              class="flex bg-white p-1 rounded-md shadow-md flex-wrap"
            >
              <span
                v-for="coin in matchedCoins.slice(0, 4)"
                :key="coin.symbol"
                class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
                @click="addTicker(coin.symbol)"
              >
                {{ coin.symbol }}
              </span>
            </div>
            <div v-if="isTickerAlreadyAdded" class="text-sm text-red-600">
              Такой тикер уже добавлен
            </div>
            <div
              v-if="!isCoinValid && tickerValue"
              class="text-sm text-red-600"
            >
              Такого коина не существует
            </div>
          </div>
        </div>
        <button
          type="button"
          class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          :class="{
            'pointer-events-none': isTickerAlreadyAdded || !isCoinValid,
          }"
          :disabled="isTickerAlreadyAdded || !isCoinValid"
          @click="addTicker(tickerValue)"
        >
          <!-- Heroicon name: solid/mail -->
          <svg
            class="-ml-0.5 mr-2 h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="#ffffff"
          >
            <path
              d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
            ></path>
          </svg>
          Добавить
        </button>
        <div class="mt-1 flex">
          <div class="mx-2">
            <label for="filter" class="block text-sm font-medium text-gray-700"
              >Фильтр</label
            >
            <div class="mt-1 relative rounded-md shadow-md">
              <input
                v-model="filter"
                type="text"
                name="filter"
                id="filter"
                class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
              />
            </div>
          </div>
        </div>
        <div v-if="tickers.length" class="mt-1 flex gap-2">
          <button
            v-if="hasPrevPage"
            type="button"
            class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            @click="page = page - 1"
          >
            Назад
          </button>
          <button
            v-if="hasNextPage"
            type="button"
            class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            @click="page = page + 1"
          >
            Вперед
          </button>
        </div>
      </section>

      <template v-if="filteredTickers.length">
        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="ticker in paginatedTickers"
            :key="ticker.name"
            :class="{
              'border-purple-800': selectedTicker?.name === ticker.name,
              'bg-red-100': ticker.price === 0,
              'bg-white': ticker.price !== 0,
            }"
            class="overflow-hidden shadow rounded-lg border-4 border-solid cursor-pointer"
            @click="toggleSelectTicker(ticker)"
          >
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ ticker.name }} - USD
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ formatPrice(ticker.price) }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
              class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
              @click.stop="removeTicker(ticker)"
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path></svg
              >Удалить
            </button>
          </div>
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>

      <section v-if="selectedTicker" class="relative">
        <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
          {{ selectedTicker.name }} - USD
        </h3>
        <div
          class="flex items-end border-gray-600 border-b border-l h-64"
          ref="graph"
        >
          <div
            v-for="(bar, index) in calculatedGraph"
            :key="index"
            :style="{
              height: `${bar}%`,
              'min-width': `${GRAPH_BAR_WIDTH}px`,
            }"
            class="bg-purple-800 border"
          ></div>
        </div>
        <button
          type="button"
          class="absolute top-0 right-0"
          @click="unselectTicker"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            x="0"
            y="0"
            viewBox="0 0 511.76 511.76"
            xml:space="preserve"
          >
            <g>
              <path
                d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048    c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z     M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165    c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0    c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"
                fill="#718096"
                data-original="#000000"
              ></path>
            </g>
          </svg>
        </button>
      </section>
    </div>
  </div>
</template>

<script>
import { Api } from "@/api";
import { nextTick } from "vue";

const CURRENT_SELECTED_TICKERS = "CURRENT_SELECTED_TICKERS";
const ALL_COINS_LIST = "ALL_COINS_LIST";
const TICKERS_PER_PAGE = 6;
const PRICE_NO_DATA = "-";
const GRAPH_BAR_WIDTH = 40;

export default {
  name: "App",
  data() {
    return {
      tickerValue: "",
      filter: "",
      page: 1,
      maxGraphElements: 0,
      coinList: [],
      tickers: [],
      graph: [],
      selectedTicker: null,
      loading: false,
      GRAPH_BAR_WIDTH,
    };
  },
  computed: {
    hasPrevPage() {
      return this.page > 1;
    },
    hasNextPage() {
      return this.filteredTickers.length > TICKERS_PER_PAGE * this.page;
    },
    startTickerIndex() {
      return (this.page - 1) * TICKERS_PER_PAGE;
    },
    endTickerIndex() {
      return this.page * TICKERS_PER_PAGE;
    },
    tickersNames() {
      return this.tickers.map(({ name }) => name);
    },
    matchedCoins() {
      return this.coinList.filter(
        (coin) =>
          coin.symbol.includes(this.tickerValue.toUpperCase()) &&
          !this.tickersNames.includes(coin.symbol)
      );
    },
    isTickerAlreadyAdded() {
      return this.tickersNames.includes(this.tickerValue.toUpperCase());
    },
    isCoinValid() {
      return this.coinList.some(
        (coin) => coin.symbol === this.tickerValue.toUpperCase()
      );
    },
    filteredTickers() {
      return this.tickers.filter(({ name }) =>
        name.includes(this.filter.toUpperCase())
      );
    },
    paginatedTickers() {
      return this.filteredTickers.slice(
        this.startTickerIndex,
        this.endTickerIndex
      );
    },
    normalizedGraph() {
      const maxValue = Math.max(...this.graph);
      const minValue = Math.min(...this.graph);

      if (maxValue === minValue) {
        return this.graph.map(() => 50);
      }

      return this.graph.map(
        (value) => 5 + ((value - minValue) * 95) / (maxValue - minValue)
      );
    },
    calculatedGraph() {
      const sliceValue = this.normalizedGraph.length - this.maxGraphElements;
      return this.normalizedGraph.slice(sliceValue > 0 ? sliceValue : 0);
    },
    queryOptions() {
      return {
        filter: this.filter,
        page: this.page,
      };
    },
    stringQueryOptions() {
      return Object.entries(this.queryOptions).reduce(
        (prev, [option, value], index) =>
          (prev += `${index ? "&" : ""}${option}=${value}`),
        ""
      );
    },
  },
  methods: {
    calculateGraphElementsMaxAmount() {
      if (!this.$refs.graph) {
        return;
      }

      this.maxGraphElements = Math.trunc(
        this.$refs.graph.offsetWidth / this.GRAPH_BAR_WIDTH
      );
    },
    formatPrice(price) {
      if (!price) {
        return PRICE_NO_DATA;
      }

      return price > 1 ? price.toFixed(2) : price.toPrecision(2);
    },
    async fetchCoinList() {
      this.loading = true;

      return await Api.getCoinsList()
        .then((response) => Object.values(response.data.Data))
        .finally(() => (this.loading = false));
    },
    addTicker(value) {
      if (
        this.tickerValue === value &&
        (this.isTickerAlreadyAdded || !this.isCoinValid)
      )
        return;
      const currentTicker = { name: value.toUpperCase(), price: null };
      this.tickers = [...this.tickers, currentTicker];
      this.tickerValue = "";
      this.filter = "";
      this.subscribeToUpdatePrice(currentTicker.name);
    },
    subscribeToUpdatePrice(tickerName) {
      Api.subscribeUpdateCoin(tickerName, (updatedCoin) => {
        const { name, price } = updatedCoin;

        this.tickers = this.tickers.map((ticker) => {
          return {
            ...ticker,
            price: ticker.name === name ? price : ticker.price,
          };
        });

        if (this.selectedTicker && this.selectedTicker.name === name && price) {
          this.graph = [...this.graph, price];
        }
      });
    },
    removeTicker(ticker) {
      if (this.selectedTicker?.name === ticker.name) {
        this.selectedTicker = null;
      }
      this.tickers = this.tickers.filter(({ name }) => name !== ticker.name);
      Api.unsubscribeUpdateCoin(ticker.name);
    },
    toggleSelectTicker(ticker) {
      this.selectedTicker =
        this.selectedTicker?.name === ticker.name ? null : ticker;
    },
    unselectTicker() {
      this.selectedTicker = null;
    },
    updateQueryURL() {
      window.history.pushState(
        null,
        document.title,
        `${window.location.pathname}?${this.stringQueryOptions}`
      );
    },
  },
  async mounted() {
    window.addEventListener("resize", this.calculateGraphElementsMaxAmount);

    const savedCoinsList = JSON.parse(localStorage.getItem(ALL_COINS_LIST));
    const savedSelectedTickers = localStorage.getItem(CURRENT_SELECTED_TICKERS);
    const { page, filter } = Object.fromEntries(
      new URLSearchParams(window.location.search)
    );

    this.page = +page || this.page;
    this.filter = filter || this.filter;

    this.coinList = savedCoinsList ?? (await this.fetchCoinList());

    if (savedSelectedTickers) {
      this.tickers = JSON.parse(savedSelectedTickers);
    }

    for (const ticker of this.tickers) {
      this.subscribeToUpdatePrice(ticker.name);
    }
  },
  watch: {
    filter() {
      this.page = 1;
    },
    selectedTicker() {
      this.graph = [];
      nextTick(this.calculateGraphElementsMaxAmount);
    },
    queryOptions() {
      this.updateQueryURL();
    },
    tickers() {
      localStorage.setItem(
        CURRENT_SELECTED_TICKERS,
        JSON.stringify(this.tickers)
      );
    },
    paginatedTickers() {
      if (this.paginatedTickers.length === 0 && this.page > 1) {
        this.page = this.page - 1;
      }
    },
    coinList() {
      localStorage.setItem(ALL_COINS_LIST, JSON.stringify(this.coinList));
    },
  },
};
</script>
