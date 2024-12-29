import axios from 'axios';

interface CachedPrice {
	value: number;
	lastFetched: number;
}

interface Coin {
	id: string;
	name: string;
	symbol: string;
	market_cap_rank: number;
}


const priceCache: { [tokenId: string]: CachedPrice } = {};
const CACHE_EXPIRY_TIME = 60 * 1000; // 1 minuto

const requestQueue: (() => Promise<void>)[] = [];
let isProcessingQueue = false;

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
	}
	catch (error) {
		console.error('Error processing request queue', error);
	}
	finally {
		isProcessingQueue = false;
		setTimeout(processQueue, 200);
	}
};


export const fetchTokenPrice = async (tokenId: string): Promise<number | null> => {
	if (priceCache[tokenId] && Date.now() - priceCache[tokenId].lastFetched < CACHE_EXPIRY_TIME) {
		return priceCache[tokenId].value
	}

	return new Promise((resolve, reject) => {
		requestQueue.push(async () => {
			try {
				const response = await axios.get(
					`https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd`
				);

				const priceData = response.data;
				if (priceData && priceData[tokenId] && priceData[tokenId].usd) {
					const price = priceData[tokenId].usd;
					priceCache[tokenId] = { value: price, lastFetched: Date.now() };
					resolve(price);
				} else {
					resolve(null);
				}
			} catch (error) {
				console.error('Error fetching price:', error);
				resolve(null);
			}
		});
		processQueue();
	});
};

export const fetchCoins = async (): Promise<Coin[] | null> => {
	return new Promise(async (resolve, reject) => {
		requestQueue.push(async () => {
			try {
				const response = await axios.get(
					'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false'
				);
				resolve(response.data.slice(0, 20) as Coin[]);
			} catch (error) {
				console.error('Error fetching coins:', error);
				resolve(null);
			}
		});
		processQueue();
	})
};