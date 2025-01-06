import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, Modal, TextInput, Button } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { loadTokens, saveToken, saveCurrency, loadCurrency } from '../utils/storage';
import { theme } from '../utils/theme';
import { RootStackParamList } from '../types/navigation';
import TokenAdditionItem from '../components/TokenAdditionItem';
import { Feather } from '@expo/vector-icons';
import { fetchTokenPrice } from '../utils/api';


interface TokenAddition {
	amount: string;
	timestamp: number;
	price: number | null;
	currency1PercentageChange: number | null
}

interface Token {
	id: string;
	name: string;
	additions: TokenAddition[];
	selectedCurrency1: string;
}


const TokenDetailsScreen = () => {
	const navigation = useNavigation<import('@react-navigation/native').NavigationProp<RootStackParamList>>();
	const route = useRoute();
	const { tokenId } = route.params as { tokenId: string };
	const [token, setToken] = useState<Token | null>(null);
	const [modalVisible, setModalVisible] = useState(false);
	const [redeemAmount, setRedeemAmount] = useState('');


	useEffect(() => {
		loadTokenDetails();
	}, []);


	const loadTokenDetails = async () => {
		try {
			const savedTokens = await loadTokens();
			if (savedTokens) {
				const tokenDetails = savedTokens.find(token => token.id === tokenId);
				if (tokenDetails) {
					const tokenWithPrice = await Promise.all(
						tokenDetails.additions.map(async (addition) => {
							const currentPrice1 = await fetchTokenPrice(tokenDetails.id, tokenDetails.selectedCurrency1);
							const currency1PercentageChange = currentPrice1 ? (((currentPrice1 - (addition.amount > "0" ? currentPrice1 : 0)) / (addition.amount > "0" ? currentPrice1 : 0)) * 100) : null;

							return {
								...addition,
								currency1PercentageChange,
								price: currentPrice1
							};
						})
					);
					setToken({
						...tokenDetails,
						additions: tokenWithPrice
					});
				}
				else {
					setToken(null);
				}
			}
		}
		catch (error) {
			console.error('Erro ao carregar token details: ', error);
		}
	};

	const handleOpenRedeemModal = () => {
		setModalVisible(true);
	};

	const handleCloseRedeemModal = () => {
		setModalVisible(false);
		setRedeemAmount('');
	};


	const handleRedeemToken = async () => {
		if (!tokenId || !redeemAmount) {
			Alert.alert('Error', 'Please enter the amount to redeem.');
			return;
		}

		try {
			const amount = parseFloat(redeemAmount.replace(',', '.'));

			if (isNaN(amount)) {
				Alert.alert('Error', 'Invalid amount.');
				return;
			}

			const currency1 = await loadCurrency('1')
			const currentPrice1 = await fetchTokenPrice(tokenId, currency1!);

			console.log("Preço atual da moeda 1:", currentPrice1);

			await saveToken({
				id: tokenId,
				name: token?.name || '',
				amount: String(-amount),
				priceCurrency1: currentPrice1,
				selectedCurrency1: token!.selectedCurrency1,
				totalAmount: 0,
				percentageChange: null,
				currentValue: null,
				walletId: undefined
			});
			loadTokenDetails();
			handleCloseRedeemModal();
		}
		catch (error) {
			console.error('Error removing token: ', error);
			Alert.alert('Error', 'Failed to redeem token.');
		}
	};


	const handleSwapTokensPress = (tokenId: string, totalAmount: number) => {
		navigation.navigate('SwapToken', { tokenId, totalAmount });
	};

	const renderAdditionItem = ({ item }: { item: any }) => (
		<TokenAdditionItem amount={item.amount} timestamp={item.timestamp} percentageChange={item.percentageChange} />
	);

	return (
		<View style={styles.container}>
			{token ? (
				<>
					<View style={styles.header}>
						<Text style={styles.title}>{token.name} Details</Text>
						<TouchableOpacity style={styles.iconButton} onPress={() => handleSwapTokensPress(token.id, 0)}>
							<Feather name="repeat" size={24} color={theme.text} />
						</TouchableOpacity>
						<TouchableOpacity style={styles.redeemButton} onPress={handleOpenRedeemModal}>
							<Feather name="arrow-down-circle" size={24} color={theme.error} />
						</TouchableOpacity>
					</View>

					<FlatList
						data={token.additions}
						renderItem={renderAdditionItem}
						keyExtractor={(item, index) => String(index)}
					/>
				</>
			) : <Text style={styles.noTokenText}>Token not found</Text>}

			<Modal
				animationType="slide"
				transparent={true}
				visible={modalVisible}
				onRequestClose={handleCloseRedeemModal}
			>
				<View style={styles.centeredView}>
					<View style={styles.modalView}>
						<Text style={styles.modalTitle}>Redeem Token</Text>
						<View style={styles.inputContainer}>
							<Text style={styles.label}>Amount:</Text>
							<TextInput
								style={[styles.input, { color: theme.text }]}
								keyboardType="numeric"
								value={redeemAmount}
								onChangeText={setRedeemAmount}
								placeholder="Enter amount"
								placeholderTextColor={theme.secondaryText}
								selectionColor={theme.secondaryText}
							/>
						</View>
						<Button title="Redeem" onPress={handleRedeemToken} color={theme.primary} />
						<TouchableOpacity style={styles.modalClose} onPress={handleCloseRedeemModal}>
							<Feather name="x" size={20} color={theme.secondaryText} />
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: theme.background,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 20
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		color: theme.text,
		marginBottom: 20
	},
	additionItem: {
		padding: 10,
		borderBottomWidth: 1,
		borderBottomColor: theme.border,
		flexDirection: 'row',
		justifyContent: 'space-between'
	},
	additionInfo: {
	},
	additionAmount: {
		color: theme.text,
		fontSize: 16
	},
	additionTimestamp: {
		color: theme.secondaryText,
		fontSize: 14
	},
	noTokenText: {
		color: theme.secondaryText,
		textAlign: 'center',
		fontSize: 16
	},
	iconButton: {
		padding: 5,
	},
	redeemButton: {
		padding: 5
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
	modalClose: {
		position: 'absolute',
		top: 10,
		right: 10
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: theme.text,
		marginBottom: 10
	},
	inputContainer: {
		marginBottom: 10,
	},
	label: {
		fontSize: 16,
		marginBottom: 5,
		color: theme.text,
	},
	input: {
		height: 40,
		backgroundColor: theme.inputBackground,
		borderColor: theme.border,
		borderWidth: 1,
		padding: 10,
		borderRadius: 5,
	},
});

export default TokenDetailsScreen;