import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useContext } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import useThemedStyles from '../hooks/useThemedStyles';
import { Currency } from '../types/types';
import { CurrencyContext } from '../context/CurrencyContext';

interface SettingsModalProps {
	visible: boolean;
	onClose: () => void;
	currencies: Currency[];
	selectedCurrency: string | null;
	onCurrencyChange: (value: string) => void;
	onConfirm: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
	visible,
	onClose,
	currencies,
	selectedCurrency,
	onCurrencyChange,
	onConfirm,
}) => {
	const styles = useThemedStyles(); // Obtendo estilos baseados no tema
	const { currency, setCurrency } = useContext(CurrencyContext) as { currency: Currency, setCurrency: (currency: Currency) => void };

	const handleCurrencyChange = (newCurrency: string) => {
		setCurrency({ id: newCurrency, name: newCurrency, symbol: newCurrency });
	};
	return (
		<Modal
			animationType="slide"
			transparent={true}
			visible={visible}
			onRequestClose={onClose}
		>
			<View style={styles.centeredView}>
				<View style={[styles.modalView, { minWidth: '70%' }]}>
					<View style={styles.header}>

						<Text style={styles.modalTitle}>Settings</Text>
						<TouchableOpacity style={styles.modalClose} onPress={onClose}>
							<Feather name="x" size={24} color={styles.iconButtonText.color} />
						</TouchableOpacity>
					</View>
					<ScrollView>
						<Text style={styles.label}>Select currency</Text>
						<TouchableOpacity onPress={() => { }}>
							<Text style={styles.inputText}>{selectedCurrency}</Text>
						</TouchableOpacity>
						<Picker
							selectedValue={currency.id ? currency.id : selectedCurrency!}
							onValueChange={handleCurrencyChange}
							style={[styles.picker, { minWidth: '100%', height: 50 }]}
						>
							{currencies.map(currency => (
								<Picker.Item key={currency.id} label={`${currency.name} (${currency.symbol.toUpperCase()})`} value={currency.id} />
							))}
						</Picker>
						<TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
							<Text style={styles.confirmButtonText}>Confirm</Text>
						</TouchableOpacity>

					</ScrollView>
				</View>
			</View>
		</Modal>
	);
};



export default SettingsModal;
