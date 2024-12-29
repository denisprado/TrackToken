import { ParamListBase } from "@react-navigation/native";

export type RootStackParamList = {
  Tokens: undefined;
  AddToken: undefined;
  TokenDetails: { tokenId: string };
  SwapToken: { tokenId?: string; totalAmount?: number } | undefined;
};

declare module "@react-navigation/native" {
  export function useNavigation<
    T extends ParamListBase = RootStackParamList
  >(): import("@react-navigation/native").NavigationProp<T>;
}
