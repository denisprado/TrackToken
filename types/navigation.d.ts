import { ParamListBase } from "@react-navigation/native";

export type RootStackParamList = {
  Wallets: undefined;
  Tokens: undefined;
  AddToken: undefined;
  CreateWalletScreen: undefined;
  TokenDetails: { tokenId: string };
  SwapToken: { tokenId?: string; totalAmount?: number } | undefined;
};

declare module "@react-navigation/native" {
  export function useNavigation<
    T extends ParamListBase = RootStackParamList
  >(): import("@react-navigation/native").NavigationProp<T>;
}
