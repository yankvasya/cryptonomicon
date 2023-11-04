import axios from "axios";

const AGGREGATE_INDEX = "5";
const INVALID_SUB = "500";
const WEBSOCKET_OPEN_STATE = 1;
const coinsWebsocketUrl = `wss://streamer.cryptocompare.com/v2?api_key=${process.env.VUE_APP_CRYPTO_TOKEN}`;
const websocket = new WebSocket(coinsWebsocketUrl);

export const subscribedCoinsToUpdate = new Map();

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
  sendMessageToSocket(params) {
    const stringifyMessage = JSON.stringify(params);
    if (websocket.readyState === WEBSOCKET_OPEN_STATE) {
      websocket.send(stringifyMessage);
      return;
    }

    websocket.addEventListener(
      "open",
      () => {
        websocket.send(stringifyMessage);
      },
      { once: true }
    );
  },
  subscribeUpdateCoin: (name, callback) => {
    const callbacks = subscribedCoinsToUpdate.get(name) ?? [];
    const message = {
      action: "SubAdd",
      subs: [`5~CCCAGG~${name}~USD`],
    };

    subscribedCoinsToUpdate.set(name, [...callbacks, callback]);
    Api.sendMessageToSocket(message);
  },
  unsubscribeUpdateCoin: (name) => {
    const message = {
      action: "SubRemove",
      subs: [`5~CCCAGG~${name}~USD`],
    };
    subscribedCoinsToUpdate.delete(name);
    Api.sendMessageToSocket(message);
  },
};

websocket.addEventListener("message", (event) => {
  const { TYPE, FROMSYMBOL, TOSYMBOL, PRICE, PARAMETER } = JSON.parse(
    event.data
  );
  if (![AGGREGATE_INDEX, INVALID_SUB].includes(TYPE)) return;

  const coinNameParametr = PARAMETER?.split("~")[2];
  const currentCoinName =
    TYPE === AGGREGATE_INDEX ? FROMSYMBOL : coinNameParametr;
  const callbacks = subscribedCoinsToUpdate.get(currentCoinName) || [];

  callbacks.map((callback) =>
    callback({
      name: currentCoinName,
      price: TYPE !== INVALID_SUB ? +PRICE : 0,
      exchange: TOSYMBOL,
    })
  );
});
