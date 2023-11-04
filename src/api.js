import axios from "axios";

export const Api = {
  getCoinsList: async () => {
    return await axios.get(
      "https://min-api.cryptocompare.com/data/blockchain/list",
      {
        headers: {
          Authorization: `Apikey ${process.env.VUE_APP_CRYPTO_TOKEN}`,
        },
      }
    );
  },
  getCoinsPrices: async (names) => {
    return await axios.get(
      `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${names.join(
        ","
      )}&tsyms=USD`,
      {
        headers: {
          Authorization: `Apikey ${process.env.VUE_APP_CRYPTO_TOKEN}`,
        },
      }
    );
  },
};
