import React, { useState, useEffect } from 'react';
import {
	StyleSheet,
	Text,
	View,
	TextInput,
	Button,
	Alert,
	Modal,
	TouchableOpacity,
	FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { saveToken } from '../utils/storage';
import axios from 'axios';
import { Feather } from '@expo/vector-icons';
import { theme } from '../utils/theme';


interface Coin {
	id: string;
	name: string;
	symbol: string;
	market_cap_rank: number;
}

interface CoinMarketData {
	id: string;
	symbol: string;
	name: string;
	image: string;
	current_price: number;
	market_cap: number;
	market_cap_rank: number;
	fully_diluted_valuation: number;
	total_volume: number;
	high_24h: number;
	low_24h: number;
	price_change_24h: number;
	price_change_percentage_24h: number;
	market_cap_change_24h: number;
	market_cap_change_percentage_24h: number;
	circulating_supply: number;
	total_supply: number;
	max_supply: number;
	ath: number;
	ath_change_percentage: number;
	ath_date: string;
	atl: number;
	atl_change_percentage: number;
	atl_date: string;
	roi: null | {
		times: number;
		currency: string;
		percentage: number;
	};
	last_updated: string;
}


const AddTokenScreen = () => {
	const navigation = useNavigation();
	const [tokens, setTokens] = useState<Coin[]>([]);
	const [selectedToken, setSelectedToken] = useState<Coin | null>(null);
	const [tokenAmount, setTokenAmount] = useState('');
	const [modalVisible, setModalVisible] = useState(false);
	const [searchText, setSearchText] = useState('');
	const [filteredTokens, setFilteredTokens] = useState<Coin[]>([]);

	useEffect(() => {
		const fetchCoins = async () => {
			try {
				const response = await axios.get<CoinMarketData[]>(
					'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false'
				);
				setTokens(response.data.slice(0, 20).filter((coin): coin is CoinMarketData => coin.market_cap_rank <= 20) as Coin[]);
			} catch (error) {
				console.error('Error fetching coins:', error);
			}
		};
		fetchCoins();
	}, []);

	useEffect(() => {
		if (searchText) {
			const filtered = tokens.filter(token =>
				token.name.toLowerCase().includes(searchText.toLowerCase()) ||
				token.symbol.toLowerCase().includes(searchText.toLowerCase())
			);
			setFilteredTokens(filtered)
		}
		else {
			setFilteredTokens(tokens);
		}
	}, [searchText, tokens])

	const handleAddToken = async () => {
		if (!selectedToken || !tokenAmount) {
			Alert.alert('Error', 'Please select a token and enter the amount.');
			return;
		}

		try {
			const amount = parseFloat(tokenAmount.replace(',', '.'));

			if (isNaN(amount)) {
				Alert.alert('Error', 'Invalid amount.');
				return;
			}

			await saveToken({
				id: selectedToken.id,
				name: selectedToken.name,
				amount: String(amount),
			});
			navigation.goBack();
		} catch (error) {
			Alert.alert('Error', 'Failed to save token.');
		}
	};

	const handleSelectToken = (token: Coin) => {
		setSelectedToken(token);
		setModalVisible(false);
	};

	const handleOpenModal = () => {
		setModalVisible(true);
	};

	const handleCloseModal = () => {
		setModalVisible(false);
		setSearchText('');
	};

	const renderTokenItem = ({ item }: { item: Coin }) => (
		<TouchableOpacity style={styles.tokenItem} onPress={() => handleSelectToken(item)}>
			<Text style={styles.tokenItemText}>{item.name} ({item.symbol.toUpperCase()})</Text>
		</TouchableOpacity>
	);


	return (
		<View style={styles.container}>
			<Text style={styles.title}>Add New Token</Text>

			{/* Token Selection */}
			<View style={styles.inputContainer}>
				<Text style={styles.label}>Select Token:</Text>
				<TouchableOpacity style={styles.selectButton} onPress={handleOpenModal}>
					<Text style={styles.selectText}>
						{selectedToken ? `${selectedToken.name} (${selectedToken.symbol.toUpperCase()})` : 'Select a token'}
					</Text>
					<Feather name="chevron-down" size={20} color="grey" />
				</TouchableOpacity>
			</View>

			{/* Token Amount Input */}
			<View style={styles.inputContainer}>
				<Text style={styles.label}>Amount of Tokens:</Text>
				<TextInput
					style={[styles.input, { color: theme.text }]}
					keyboardType="numeric"
					value={tokenAmount}
					onChangeText={(text) => setTokenAmount(text)}
					placeholder="Enter amount"
					placeholderTextColor={theme.secondaryText}
					selectionColor={theme.secondaryText}
				/>
			</View>

			<Button title="Add Token" onPress={handleAddToken} color={theme.primary} />

			<Modal
				animationType="slide"
				transparent={true}
				visible={modalVisible}
				onRequestClose={handleCloseModal}
			>
				<View style={styles.centeredView}>
					<View style={styles.modalView}>
						<View style={styles.searchContainer}>
							<Feather name="search" size={20} color={theme.secondaryText} style={styles.searchIcon} />
							<TextInput
								placeholder="Search token"
								style={[styles.searchInput, { color: theme.text }]}
								onChangeText={setSearchText}
								placeholderTextColor={theme.secondaryText}
							/>
							<TouchableOpacity onPress={handleCloseModal} style={styles.modalClose}>
								<Feather name="x" size={20} color={theme.secondaryText} />
							</TouchableOpacity>
						</View>
						<FlatList
							data={filteredTokens}
							renderItem={renderTokenItem}
							keyExtractor={(item) => item.id}
						/>
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
	searchContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		borderBottomWidth: 1,
		borderBottomColor: theme.border,
		marginBottom: 10,
	},
	searchIcon: {
		marginRight: 10
	},
	searchInput: {
		flex: 1,
		height: 40,
		paddingVertical: 5,
	},
	modalClose: {
		paddingLeft: 10
	},
	tokenItem: {
		padding: 10,
		borderBottomWidth: 1,
		borderBottomColor: theme.border,
	},
	tokenItemText: {
		fontSize: 16,
		color: theme.text,
	},
});

export default AddTokenScreen;