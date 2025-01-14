import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TokensScreen from './screens/TokensScreen';
import AddTokenScreen from './screens/AddTokenScreen';
import { StyleSheet, View } from 'react-native';
import { theme } from './utils/theme';
import { RootStackParamList } from './types/navigation';
import TokenDetailsScreen from './screens/TokenDetailsScreen';
import SwapTokenScreen from './screens/SwapTokenScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import WalletsScreen from './screens/WalletsScreen';
import CreateWalletScreen from './screens/CreateWalletScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<NavigationContainer >
				<View style={styles.container}>
					<Stack.Navigator initialRouteName="Wallets" screenOptions={{
						headerStyle: {
							backgroundColor: theme.colors.background
						},
						headerTitleStyle: {
							color: theme.colors.text,
						},
						headerTintColor: theme.colors.text
					}}>
						<Stack.Screen name="Wallets" component={WalletsScreen} options={{ headerShown: false }} />
						<Stack.Screen name="Tokens" component={TokensScreen} />
						<Stack.Screen name="AddToken" component={AddTokenScreen} />
						<Stack.Screen name="TokenDetails" component={TokenDetailsScreen} />
						<Stack.Screen name="SwapToken" component={SwapTokenScreen} />
						<Stack.Screen name="CreateWalletScreen" component={CreateWalletScreen} />
					</Stack.Navigator>
				</View>
			</NavigationContainer>
		</GestureHandlerRootView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.background,
		fontFamily: theme.fontFamilies.monospace,
	},
});

export default App;