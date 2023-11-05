import axios from "axios";

const AGGREGATE_INDEX = "5";
const INVALID_SUB = "500";
const WEBSOCKET_OPEN_STATE = 1;
const coinsWebsocketUrl = `wss://streamer.cryptocompare.com/v2?api_key=${process.env.VUE_APP_CRYPTO_TOKEN}`;
const websocket = new WebSocket(coinsWebsocketUrl);
const bc = new BroadcastChannel("crypto_channel");
const SUBSCRIBE_UPDATE_COIN = "SUBSCRIBE_UPDATE_COIN";

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
  sendMessageToBroadCast(params) {
    bc.postMessage(params);
  },
  sendSubscribeUpdateToBroadCast(name) {
    Api.sendMessageToBroadCast({ name, type: SUBSCRIBE_UPDATE_COIN });
  },
  subscribeUpdateCoin: (name, callback, type) => {
    const callbacks = subscribedCoinsToUpdate.get(name) ?? [];
    const message = {
      action: "SubAdd",
      subs: [`5~CCCAGG~${name}~USD`],
    };

    subscribedCoinsToUpdate.set(name, [...callbacks, callback]);
    Api.sendMessageToSocket(message);
    if (!type) {
      Api.sendSubscribeUpdateToBroadCast(name);
    }
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

const handlerReceiveMessage = (message) => {
  const { TYPE, FROMSYMBOL, TOSYMBOL, PRICE, PARAMETER } = message;

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
};

websocket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  handlerReceiveMessage(message);
  Api.sendMessageToBroadCast(message);
});

bc.addEventListener("message", (event) => {
  if (event.data.type === SUBSCRIBE_UPDATE_COIN) {
    Api.subscribeUpdateCoin(event.data.name, () => {}, SUBSCRIBE_UPDATE_COIN);
    return;
  }
  handlerReceiveMessage(event.data);
});
