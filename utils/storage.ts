import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "token_data";
const CURRENCY_KEY = "selected_currency";
const CURRENCY = ["brl", "brl"];
interface TokenAddition {
  amount: string;
  timestamp: number;
}
interface Token {
  id: string;
  name: string;
  additions: TokenAddition[];
  selectedCurrency1: string;
  selectedCurrency2: string;
}

export const saveToken = async (
  token: Omit<Token, "additions" | "selectedCurrency"> & {
    amount: string;
    priceCurrency1?: number | null;
    priceCurrency2?: number | null;
    selectedCurrency1: string;
    selectedCurrency2: string;
  }
) => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    const existingTokens: Token[] = existingData
      ? JSON.parse(existingData)
      : [];
    const existingTokenIndex = existingTokens.findIndex(
      (t) => t.id === token.id
    );

    const newTokenAddition = {
      amount: token.amount,
      timestamp: Date.now(),
    };

    if (existingTokenIndex !== -1) {
      // Token already exists, update additions
      if (!existingTokens[existingTokenIndex].additions) {
        existingTokens[existingTokenIndex].additions = [];
      }
      existingTokens[existingTokenIndex].additions.push(newTokenAddition);
      existingTokens[existingTokenIndex].selectedCurrency1 =
        token.selectedCurrency1;
      existingTokens[existingTokenIndex].selectedCurrency2 =
        token.selectedCurrency2;
    } else {
      // New token
      existingTokens.push({
        ...token,
        additions: [newTokenAddition],
      });
    }
    let updatedTokens = existingTokens
      .map((token) => ({
        ...token,
        additions: token.additions || [],
      }))
      .filter((token) => {
        let totalAmount = 0;
        token.additions.forEach((addition) => {
          totalAmount += parseFloat(addition.amount);
        });
        return totalAmount > 0;
      });

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTokens));
  } catch (error) {
    console.error("Erro ao salvar token", error);
    throw error;
  }
};
export const loadTokens = async (): Promise<Token[] | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error loading tokens:", error);
    return null;
  }
};
export const removeToken = async (tokenId: string) => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    const existingTokens: Token[] = existingData
      ? JSON.parse(existingData)
      : [];
    const updatedTokens = existingTokens.filter(
      (token) => token.id !== tokenId
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTokens));
  } catch (error) {
    console.error("Error removing token:", error);
  }
};

export const saveCurrency = async (id: string, currency: string) => {
  try {
    await AsyncStorage.setItem(CURRENCY_KEY + id, currency);
  } catch (error) {
    console.error("Erro ao salvar a moeda", error);
  }
};
export const loadCurrency = async (id: string): Promise<string | null> => {
  try {
    const idNumber = parseInt(id, 10) - 1;
    const currency = await AsyncStorage.getItem(CURRENCY_KEY + id);
    if (!currency) {
      await saveCurrency(id, CURRENCY[idNumber]);
      return CURRENCY[idNumber];
    }
    return currency;
  } catch (error) {
    console.error("Error loading currency:", error);
    return null;
  }
};
