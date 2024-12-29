import React, { useState, useEffect, useRef } from 'react';
import {
	StyleSheet,
	Text,
	View,
	TextInput,
	Button,
	Alert,
	ScrollView,
	Modal,
	TouchableOpacity,
	FlatList
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../utils/theme';
import { fetchTokenPrice, fetchCoins } from '../utils/api';
import { saveToken } from '../utils/storage';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { Picker } from '@react-native-picker/picker';


interface Coin {
	id: string;
	name: string;
	symbol: string;
	market_cap_rank: number;
}

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


const SwapTokenScreen = () => {
	const navigation = useNavigation<import('@react-navigation/native').NavigationProp<RootStackParamList>>();
	const route = useRoute();
	const { tokenId, totalAmount } = route.params as { tokenId?: string, totalAmount?: number };
	const [tokens, setTokens] = useState<Coin[]>([]);
	const [fromToken, setFromToken] = useState<Coin | null>(null);
	const [toToken, setToToken] = useState<Coin | null>(null);
	const [fromAmount, setFromAmount] = useState('');
	const [toAmount, setToAmount] = useState('');
	const [isCalculating, setIsCalculating] = useState(false);
	const debounceTimer = useRef<any>(null);
	const [fromModalVisible, setFromModalVisible] = useState(false);
	const [toModalVisible, setToModalVisible] = useState(false);

	useEffect(() => {
		const fetchTokens = async () => {
			const coins = await fetchCoins();
			if (coins) {
				setTokens(coins);
				if (tokenId) {
					const selectedToken = coins.find(coin => coin.id === tokenId) || null
					setFromToken(selectedToken);
					if (totalAmount) {
						setFromAmount(String(totalAmount));
					}
				}
			}
		};
		fetchTokens();
	}, []);

	useEffect(() => {
		const calculateToAmount = async () => {
			if (!fromToken || !toToken || !fromAmount) {
				setToAmount('');
				return;
			}
			setIsCalculating(true);
			try {
				const fromPrice = await fetchTokenPrice(fromToken.id);
				const toPrice = await fetchTokenPrice(toToken.id);
				if (fromPrice && toPrice) {
					const amount = parseFloat(fromAmount.replace(',', '.'));
					if (isNaN(amount)) {
						setToAmount('');
						return;
					}
					const calculatedAmount = (amount * fromPrice) / toPrice;
					setToAmount(calculatedAmount.toFixed(6));
				}
				else {
					setToAmount('');
				}
			}
			finally {
				setIsCalculating(false);
			}
		};

		if (debounceTimer.current) {
			clearTimeout(debounceTimer.current);
		}

		debounceTimer.current = setTimeout(() => {
			calculateToAmount();
		}, 500);

		return () => {
			if (debounceTimer.current) {
				clearTimeout(debounceTimer.current);
			}
		};
	}, [fromToken, toToken, fromAmount]);

	const handleSwapTokens = async () => {
		if (!fromToken || !toToken || !fromAmount || !toAmount) {
			Alert.alert('Error', 'Please select tokens and enter the amount.');
			return;
		}


		Alert.alert(
			'Swap Tokens',
			`Are you sure you want to swap ${fromAmount} ${fromToken.name} for ${toAmount} ${toToken.name}?`,
			[
				{
					text: 'Cancel',
					style: 'cancel',
				},
				{
					text: 'Swap',
					onPress: async () => {
						setIsCalculating(true);
						try {
							const parsedFromAmount = parseFloat(fromAmount.replace(',', '.'));
							const parsedToAmount = parseFloat(toAmount);
							const toPrice = await fetchTokenPrice(toToken.id);

							// Subtract from fromToken
							await saveToken({
								id: fromToken.id,
								name: fromToken.name,
								amount: String(-parsedFromAmount),
								price: null
							});
							// Add to toToken
							await saveToken({
								id: toToken.id,
								name: toToken.name,
								amount: String(parsedToAmount),
								price: toPrice
							});

							navigation.goBack();
						}
						catch (error) {
							console.error('Failed to swap tokens', error);
							Alert.alert('Error', 'Failed to swap tokens.');
						}
						finally {
							setIsCalculating(false);
						}
					}
				}
			],
			{ cancelable: false }
		);
	};

	const handleOpenFromModal = () => {
		setFromModalVisible(true);
	};

	const handleCloseFromModal = () => {
		setFromModalVisible(false);
	};

	const handleOpenToModal = () => {
		setToModalVisible(true);
	};

	const handleCloseToModal = () => {
		setToModalVisible(false);
	};

	const handleSelectFromToken = (token: Coin) => {
		setFromToken(token);
		setFromModalVisible(false);
	};

	const handleSelectToToken = (token: Coin) => {
		setToToken(token);
		setToModalVisible(false);
	};

	const renderTokenItem = ({ item }: { item: Coin }, isFrom: boolean) => (
		<TouchableOpacity style={styles.tokenItem} onPress={() => isFrom ? handleSelectFromToken(item) : handleSelectToToken(item)}>
			<Text style={styles.tokenItemText}>{item.name} ({item.symbol.toUpperCase()})</Text>
		</TouchableOpacity>
	);

	return (
		<ScrollView style={styles.container}>
			<Text style={styles.title}>Swap Tokens</Text>

			{/* From Token Selection */}
			<View style={styles.inputContainer}>
				<Text style={styles.label}>From Token:</Text>
				<TouchableOpacity style={styles.selectButton} onPress={handleOpenFromModal}>
					<Text style={styles.selectText}>
						{fromToken ? `${fromToken.name} (${fromToken.symbol.toUpperCase()})` : 'Select a token'}
					</Text>
					<Feather name="chevron-down" size={20} color="grey" />
				</TouchableOpacity>
			</View>

			{/* From Amount Input */}
			<View style={styles.inputContainer}>
				<Text style={styles.label}>Amount:</Text>
				<TextInput
					style={[styles.input, { color: theme.text }]}
					keyboardType="numeric"
					value={fromAmount}
					onChangeText={setFromAmount}
					placeholder="Enter amount"
					placeholderTextColor={theme.secondaryText}
					selectionColor={theme.secondaryText}
				/>
			</View>


			{/* To Token Selection */}
			<View style={styles.inputContainer}>
				<Text style={styles.label}>To Token:</Text>
				<TouchableOpacity style={styles.selectButton} onPress={handleOpenToModal}>
					<Text style={styles.selectText}>
						{toToken ? `${toToken.name} (${toToken.symbol.toUpperCase()})` : 'Select a token'}
					</Text>
					<Feather name="chevron-down" size={20} color="grey" />
				</TouchableOpacity>
			</View>

			{/*  To Amount Display */}
			{toAmount ? (
				<View style={styles.inputContainer}>
					<Text style={styles.label}>Amount to Receive:</Text>
					<Text style={[styles.calculatedAmount, { color: theme.text }]}>
						{toAmount}
					</Text>
				</View>
			) : null}

			<Button title="Swap Tokens" onPress={handleSwapTokens} disabled={isCalculating} color={theme.primary} />

			<Modal
				animationType="slide"
				transparent={true}
				visible={fromModalVisible}
				onRequestClose={handleCloseFromModal}
			>
				<View style={styles.centeredView}>
					<View style={styles.modalView}>
						<FlatList
							data={tokens}
							renderItem={({ item }) => renderTokenItem({ item }, true)}
							keyExtractor={(item) => item.id}
						/>
					</View>
				</View>
			</Modal>

			<Modal
				animationType="slide"
				transparent={true}
				visible={toModalVisible}
				onRequestClose={handleCloseToModal}
			>
				<View style={styles.centeredView}>
					<View style={styles.modalView}>
						<FlatList
							data={tokens}
							renderItem={({ item }) => renderTokenItem({ item }, false)}
							keyExtractor={(item) => item.id}
						/>
					</View>
				</View>
			</Modal>
		</ScrollView>
	);
};


const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: theme.background,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 20,
		textAlign: 'center',
		color: theme.text,
	},
	inputContainer: {
		marginBottom: 10,
	},
	label: {
		fontSize: 16,
		marginBottom: 5,
		color: theme.text,
	},
	calculatedAmount: {
		fontSize: 16,
	},
	input: {
		height: 40,
		backgroundColor: theme.inputBackground,
		borderColor: theme.border,
		borderWidth: 1,
		padding: 10,
		borderRadius: 5,
	},
	selectButton: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		height: 40,
		backgroundColor: theme.inputBackground,
		borderColor: theme.border,
		borderWidth: 1,
		padding: 10,
		borderRadius: 5,
	},
	selectText: {
		fontSize: 16,
		color: theme.text,
	},
	centeredView: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	modalView: {
		margin: 20,
		backgroundColor: theme.cardBackground,
		borderRadius: 10,
		padding: 20,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	tokenItem: {
		padding: 10,
		borderBottomWidth: 1,
		borderBottomColor: theme.border,
	},
	tokenItemText: {
		fontSize: 16,
		color: theme.text
	},
	picker: {
		height: 50,
		backgroundColor: theme.inputBackground
	}
});

export default SwapTokenScreen;