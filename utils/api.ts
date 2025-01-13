import axios from "axios";
import { CachedPrice, Coin, CoinMarketData, Currency } from "../types/types";

const priceCache: { [tokenId: string]: CachedPrice } = {};
const CACHE_EXPIRY_TIME = 60 * 1000; // 1 minuto

const requestQueue: (() => Promise<void>)[] = [];
let isProcessingQueue = false;
let delayBetweenRequests = 200; // Initial delay in milliseconds

const API_KEY = "CG-WNCs3Yg5ZJR3CHMsjKmverML";

const processQueue = async () => {
  if (isProcessingQueue || requestQueue.length === 0) {
    return;
  }

  isProcessingQueue = true;
  try {
    const nextRequest = requestQueue.shift();
    if (nextRequest) {
      await nextRequest();
    }
  } catch (error) {
    console.error("Error processing request queue", error);
  } finally {
    isProcessingQueue = false;
    setTimeout(processQueue, delayBetweenRequests);
  }
};

export const fetchCurrencies = async (): Promise<Currency[] | null> => {
  return new Promise(async (resolve, reject) => {
    requestQueue.push(async () => {
      try {
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/simple/supported_vs_currencies`
        );
        // Verifica se a resposta é uma string e a analisa
        const currenciesData =
          typeof response.data === "string"
            ? JSON.parse(response.data)
            : response.data;

        resolve(
          response.data.map((currency: string) => ({
            id: currency.replace(/"/g, ""),
            symbol: currency.replace(/"/g, ""),
            name: currency.replace(/"/g, ""),
          }))
        );
      } catch (error) {
        console.error("Error fetching currencies:", error);
        resolve(null);
      }
    });
    processQueue();
  });
};

export const fetchTokenPrice = async (
  tokenId: string,
  currency: Currency | null
): Promise<number | null> => {
  // Verifica se o preço do token já está em cache e se não expirou
  if (
    priceCache[tokenId] &&
    Date.now() - priceCache[tokenId].lastFetched < CACHE_EXPIRY_TIME
  ) {
    // Se o preço estiver no cache e ainda válido, retorna o valor armazenado
    console.log(priceCache[tokenId].value);
    return priceCache[tokenId].value;
  }

  if (!currency || !currency.symbol) {
    console.log(currency);
    return null;
  }

  try {
    // Faz uma requisição GET para a API do CoinGecko para obter o preço atual do token
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=${
        currency!.symbol
      }&x_cg_demo_api_key=${API_KEY}`
    );

    const priceData = response.data; // Armazena os dados da resposta
    // Verifica se os dados do preço estão disponíveis na resposta
    console.log("priceData", response);
    if (
      priceData &&
      priceData[tokenId] &&
      priceData[tokenId][currency!.symbol] &&
      priceData[tokenId][currency!.symbol.toLowerCase()]
    ) {
      const price = priceData[tokenId][currency!?.symbol.toLowerCase()]; // Obtém o preço do token na moeda especificada

      // Salva o preço e a hora da última busca no cache
      priceCache[tokenId] = { value: price, lastFetched: Date.now() };
      return price; // Retorna o preço do token
    } else {
      return null; // Retorna null se os dados do preço não estiverem disponíveis
    }
  } catch (error) {
    console.error("Error fetching price:", error); // Loga o erro caso a requisição falhe
    return null; // Retorna null em caso de erro
  }
};

export const fetchCoins = async (): Promise<Coin[] | null> => {
  return new Promise(async (resolve, reject) => {
    requestQueue.push(async () => {
      try {
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&x_cg_demo_api_key=${API_KEY}`
        );
        resolve(response.data.slice(0, 20) as Coin[]);
      } catch (error) {
        console.error("Error fetching coins:", error);
        resolve(null);
      }
    });
    processQueue();
  });
};
