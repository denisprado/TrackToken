import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "token_data";

interface TokenAddition {
  amount: string;
  timestamp: number;
  price: number | null;
}

interface Token {
  id: string;
  name: string;
  additions: TokenAddition[];
}

export const saveToken = async (
  token: Omit<Token, "additions"> & { amount: string; price?: number | null }
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
      price: token.price !== undefined ? token.price : null,
    };

    if (existingTokenIndex !== -1) {
      // Token already exists, update additions
      if (!existingTokens[existingTokenIndex].additions) {
        existingTokens[existingTokenIndex].additions = [];
      }
      existingTokens[existingTokenIndex].additions.push(newTokenAddition);
    } else {
      // New token
      existingTokens.push({
        ...token,
        additions: [newTokenAddition],
      });
    }

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existingTokens));
  } catch (error) {
    console.error("Erro ao salvar token", error);
    throw error;
  }
};

export const loadTokens = async (): Promise<Token[] | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    const tokens: Token[] = data ? JSON.parse(data) : [];
    // Ensure all tokens have additions array.
    const updatedTokens = tokens.map((token) => ({
      ...token,
      additions: token.additions || [],
    }));
    return updatedTokens;
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
