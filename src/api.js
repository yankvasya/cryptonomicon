import axios from "axios";

const AGGREGATE_INDEX = "5";
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
  subscribeUpdateCoin: (name, callback) => {
    const callbacks = subscribedCoinsToUpdate.get(name) ?? [];
    const hasSubscribes = subscribedCoinsToUpdate.has(name);

    subscribedCoinsToUpdate.set(name, [...callbacks, callback]);

    const stringifyMessage = JSON.stringify({
      action: "SubAdd",
      subs: [`5~CCCAGG~${name}~USD`],
    });
    if (hasSubscribes) return;

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
  unsubscribeUpdateCoin: (name) => {
    const stringifyMessage = JSON.stringify({
      action: "SubRemove",
      subs: [`5~CCCAGG~${name}~USD`],
    });
    subscribedCoinsToUpdate.delete(name);

    websocket.send(stringifyMessage);
  },
};

websocket.addEventListener("message", (event) => {
  const { TYPE, FROMSYMBOL, TOSYMBOL, PRICE } = JSON.parse(event.data);
  if (TYPE !== AGGREGATE_INDEX) return;

  subscribedCoinsToUpdate.get(FROMSYMBOL)?.map((callback) =>
    callback({
      name: FROMSYMBOL,
      price: +PRICE,
      exchange: TOSYMBOL,
    })
  );
});
