import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Feather } from '@expo/vector-icons';
import { Currency } from '../types/types';
import { useTheme } from '../context/ThemeContext';
import useThemedStyles from '../hooks/useThemedStyles';

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

	return (
		<Modal
			animationType="slide"
			transparent={true}
			visible={visible}
			onRequestClose={onClose}
		>
			<View style={styles.centeredView}>
				<View style={[styles.modalView, { minWidth: '70%' }]}>
					<Text style={styles.modalTitle}>Settings</Text>
					<ScrollView>
						<Text style={styles.label}>Select currency</Text>
						<TouchableOpacity onPress={() => { }}>
							<Text style={styles.selectText}>{selectedCurrency}</Text>
						</TouchableOpacity>
						<Picker
							selectedValue={selectedCurrency!}
							onValueChange={onCurrencyChange}
							style={[styles.picker, { minWidth: '100%', height: 150 }]}
						>
							{currencies.map(currency => (
								<Picker.Item key={currency.id} label={`${currency.name} (${currency.symbol.toUpperCase()})`} value={currency.id} />
							))}
						</Picker>
						<TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
							<Text style={styles.confirmButtonText}>Confirm</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.modalClose} onPress={onClose}>
							<Feather name="x" size={20} color={styles.iconButtonText.color} />
						</TouchableOpacity>
					</ScrollView>
				</View>
			</View>
		</Modal>
	);
};



export default SettingsModal;
