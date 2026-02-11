import { useContext, useEffect, useState } from "react";
import {AuthContext} from "@/contexts/AuthContext"
import { router } from "expo-router";
import { Button, TextInput, View, Text } from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const {login, loading, user} = useContext(AuthContext)!;


  const handleSubmit = async () => {
    try {
      login(email, password);
      router.replace('/(root)/(tabs)');
    } catch {
      setError('Invalid credentials');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ marginBottom: 10, borderWidth: 1, padding: 8 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ marginBottom: 10, borderWidth: 1, padding: 8 }}
      />
      <Button title={loading ? 'Logging in...' : 'Login'} onPress={handleSubmit} disabled={loading} />
      {error ? <Text>{error}</Text> : null}
    </View>
  );
}
