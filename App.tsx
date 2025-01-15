import React, { Children, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TokensScreen from './screens/TokensScreen';
import AddTokenScreen from './screens/AddTokenScreen';
import { Alert, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { theme } from './utils/theme';
import { RootStackParamList } from './types/navigation';
import TokenDetailsScreen from './screens/TokenDetailsScreen';
import SwapTokenScreen from './screens/SwapTokenScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import WalletsScreen from './screens/WalletsScreen';
import CreateWalletScreen from './screens/CreateWalletScreen';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import useThemedStyles from './hooks/useThemedStyles';
import { Feather } from '@expo/vector-icons';
import SettingsModal from './components/SettingsModal';
import { Currency } from './types/types';
import { fetchCurrencies } from './utils/api';
import { clearStorage } from './utils/storage';
const Stack = createNativeStackNavigator<RootStackParamList>();

const StackNav = () => {
	const { toggleTheme, theme, isDarkTheme } = useTheme(); // Usando o contexto do tema e verificando se o tema é escuro
	const styles = useThemedStyles();
	const [settingsModalVisible, setSettingsModalVisible] = useState(false);
	const [tempPrimaryCurrency, setTempPrimaryCurrency] = useState<string | null>(null);
	const [currencies, setCurrencies] = useState<Currency[]>([]);

	useEffect(() => {
		const fetchCurrenciesData = async () => {
			const data = await fetchCurrencies();
			if (data) {
				setCurrencies(data);
			}
		};
		fetchCurrenciesData();
	}, []);

	const handleOpenSettingsModal = () => {
		setSettingsModalVisible(true);
	};

	const handleClearStorage = async () => {
		await clearStorage(); // Chama a função para limpar o armazenamento
		Alert.alert("Sucesso", "Todos os dados foram limpos."); // Exibe um alerta de sucesso
	};

	const handleConfirmCurrencySelection = () => {
		// Lógica para confirmar a seleção da moeda
		handleCloseSettingsModal();
	};
	const handleCloseSettingsModal = () => {
		setSettingsModalVisible(false);
	};
	return (
		<View style={styles.container}>
			<Stack.Navigator initialRouteName="Wallets" screenOptions={{
				headerStyle: {
					backgroundColor: theme.colors.background
				},
				headerTitleStyle: {
					color: theme.colors.text,
					fontSize: theme.fontSizes.large
				},
				headerTintColor: theme.colors.text,
				headerRight: () => (
					<View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.spacing.small, borderRadius: theme.spacing.xlarge, justifyContent: 'flex-end' }}>
						<TouchableOpacity style={styles.iconButton} onPress={handleClearStorage}>
							<Feather name="trash-2" size={24} color={styles.dangerButton.color} />
						</TouchableOpacity>
						<View style={{ marginRight: theme.spacing.small, display: 'flex', flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.spacing.small, borderRadius: theme.spacing.xlarge }}>
							<Feather name={isDarkTheme ? 'sun' : 'moon'} size={18} color={styles.iconButtonText.color} />
							<Switch
								value={isDarkTheme} // O valor do Switch depende se o tema atual é escuro ou não
								onValueChange={toggleTheme} // Chama toggleTheme ao alternar o switch
								thumbColor={theme.colors.inputBackground} // Cor do botão
								trackColor={{ true: theme.colors.primary, false: theme.colors.primary }} // Cor do trilho
							/>
						</View>
						<TouchableOpacity style={styles.iconButton} onPress={handleOpenSettingsModal}>
							<Feather name='settings' size={24} color={styles.iconButtonText.color} />

						</TouchableOpacity>
					</View>
				),
			}}>
				<Stack.Screen name="Wallets" component={WalletsScreen} />
				<Stack.Screen name="Tokens" component={TokensScreen} />
				<Stack.Screen name="AddToken" component={AddTokenScreen} />
				<Stack.Screen name="TokenDetails" component={TokenDetailsScreen} />
				<Stack.Screen name="SwapToken" component={SwapTokenScreen} />
				<Stack.Screen name="CreateWalletScreen" component={CreateWalletScreen} />
			</Stack.Navigator>

			<SettingsModal
				visible={settingsModalVisible}
				onClose={handleCloseSettingsModal}
				currencies={currencies}
				selectedCurrency={tempPrimaryCurrency}
				onCurrencyChange={setTempPrimaryCurrency}
				onConfirm={handleConfirmCurrencySelection}
			/>
		</View>

	)
}

const App = () => {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<ThemeProvider>
				<CurrencyProvider>
					<NavigationContainer >
						<StackNav />
					</NavigationContainer>
				</CurrencyProvider>
			</ThemeProvider>
		</GestureHandlerRootView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		fontFamily: theme.fontFamilies.monospace,
	},
});

export default App;