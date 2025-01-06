import AsyncStorage from "@react-native-async-storage/async-storage"; // Importa o AsyncStorage para armazenamento local
import { TokenData } from "../screens/TokensScreen";

const STORAGE_KEY = "token_data"; // Chave para armazenar os dados dos tokens
const CURRENCY_KEY = "selected_currency"; // Chave para armazenar a moeda selecionada
const CURRENCY = ["usdc", "brl"]; // Lista de moedas suportadas

// Interface para representar uma adição de token
interface TokenAddition {
  amount: string; // Quantidade adicionada
  priceAtPurchaseCurrency1: number; // Preço no momento da compra para a moeda 1
  timestamp: number; // Timestamp da adição
}

// Interface para representar uma carteira
interface Wallet {
  id: string; // ID da carteira
  name: string; // Nome da carteira
  tokens: TokenData[]; // Lista de tokens que pertencem a esta carteira
}

// Função para salvar um token no armazenamento
export const saveToken = async (
  token: Omit<TokenData, "additions"> & {
    amount: string; // Quantidade a ser adicionada
    priceCurrency1?: number | null; // Preço da moeda 1 (opcional)
    selectedCurrency1: string; // Moeda selecionada 1
  }
) => {
  try {
    // Obtém os dados existentes do armazenamento
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    const existingTokens: TokenData[] = existingData
      ? JSON.parse(existingData) // Converte os dados existentes de JSON para objeto
      : []; // Se não houver dados, inicializa como um array vazio

    // Encontra o índice do token existente
    const existingTokenIndex = existingTokens.findIndex(
      (t) => t.id === token.id
    );

    // Cria uma nova adição de token
    const newTokenAddition: TokenAddition = {
      amount: token.amount, // Quantidade adicionada
      priceAtPurchaseCurrency1: token.priceCurrency1 || 0, // Preço no momento da compra para moeda 1

      timestamp: Date.now(), // Timestamp atual
    };

    if (existingTokenIndex !== -1) {
      // Se o token já existe, atualiza as adições
      if (!existingTokens[existingTokenIndex].additions) {
        existingTokens[existingTokenIndex].additions = []; // Inicializa adições se não existir
      }
      existingTokens[existingTokenIndex].additions.push(newTokenAddition); // Adiciona a nova adição
      existingTokens[existingTokenIndex].selectedCurrency1 =
        token.selectedCurrency1; // Atualiza a moeda selecionada 1
    } else {
      // Se for um novo token, adiciona ao array
      existingTokens.push({
        ...token,
        additions: [newTokenAddition], // Inicializa com a nova adição
      });
    }

    // Filtra e atualiza os tokens para remover aqueles com totalAmount <= 0
    let updatedTokens = existingTokens
      .map((token) => ({
        ...token,
        additions: token.additions || [], // Garante que as adições estejam definidas
      }))
      .filter((token) => {
        let totalAmount = 0; // Inicializa o total de quantidades
        token.additions.forEach((addition) => {
          totalAmount += parseFloat(addition.amount); // Soma as quantidades
        });
        return totalAmount > 0; // Retorna apenas tokens com totalAmount > 0
      });

    // Salva os tokens atualizados no armazenamento
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTokens));
  } catch (error) {
    console.error("Erro ao salvar token", error); // Loga o erro em caso de falha
    throw error; // Lança o erro para tratamento posterior
  }
};

// Função para carregar tokens do armazenamento
export const loadTokens = async (): Promise<TokenData[] | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY); // Obtém os dados do armazenamento
    return data ? JSON.parse(data) : null; // Retorna os dados como objeto ou null
  } catch (error) {
    console.error("Error loading tokens:", error); // Loga o erro em caso de falha
    return null; // Retorna null em caso de erro
  }
};

// Função para remover um token do armazenamento
export const removeToken = async (tokenId: string) => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY); // Obtém os dados existentes
    const existingTokens: TokenData[] = existingData
      ? JSON.parse(existingData) // Converte os dados existentes de JSON para objeto
      : []; // Se não houver dados, inicializa como um array vazio

    // Filtra os tokens para remover o token com o ID especificado
    const updatedTokens = existingTokens.filter(
      (token) => token.id !== tokenId
    );

    // Salva os tokens atualizados no armazenamento
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTokens));
  } catch (error) {
    console.error("Error removing token:", error); // Loga o erro em caso de falha
  }
};

// Função para salvar a moeda selecionada no armazenamento
export const saveCurrency = async (id: string, currency: string) => {
  try {
    await AsyncStorage.setItem(CURRENCY_KEY + id, currency); // Salva a moeda com a chave correspondente
  } catch (error) {
    console.error("Erro ao salvar a moeda", error); // Loga o erro em caso de falha
  }
};

// Função para carregar a moeda selecionada do armazenamento
export const loadCurrency = async (id: string): Promise<string | null> => {
  try {
    const idNumber = parseInt(id, 10) - 1; // Converte o ID para número e ajusta
    const currency = await AsyncStorage.getItem(CURRENCY_KEY + id); // Obtém a moeda do armazenamento
    if (!currency) {
      await saveCurrency(id, CURRENCY[idNumber]); // Salva a moeda padrão se não existir
      return CURRENCY[idNumber]; // Retorna a moeda padrão
    }
    return currency; // Retorna a moeda existente
  } catch (error) {
    console.error("Error loading currency:", error); // Loga o erro em caso de falha
    return null; // Retorna null em caso de erro
  }
};

// Função para limpar todos os tokens do armazenamento
export const clearStorage = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY); // Remove os dados dos tokens
    await AsyncStorage.removeItem(CURRENCY_KEY); // Remove as moedas selecionadas
    console.log("Armazenamento limpo com sucesso."); // Loga a confirmação
  } catch (error) {
    console.error("Erro ao limpar o armazenamento:", error); // Loga o erro em caso de falha
  }
};

// Função para salvar uma carteira no armazenamento
export const saveWallet = async (wallet: Wallet) => {
  const wallets = await fetchWallets();
  wallets.push(wallet);
  await AsyncStorage.setItem("wallets", JSON.stringify(wallets));
};

// Função para carregar carteiras do armazenamento
export const fetchWallets = async (): Promise<Wallet[]> => {
  const wallets = await AsyncStorage.getItem("wallets");
  return wallets ? JSON.parse(wallets) : [];
};
