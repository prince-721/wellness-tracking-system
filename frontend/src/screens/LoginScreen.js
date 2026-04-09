import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../utils/theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim())
      return Alert.alert('Missing Fields', 'Please enter email and password');
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.logoCircle}><Text style={styles.logoIcon}>❤️</Text></View>
          <Text style={styles.appName}>HealthTracker</Text>
          <Text style={styles.tagline}>Your personal health companion</Text>
        </View>

        <View style={[styles.card, SHADOWS.md]}>
          <Text style={styles.title}>Welcome back 👋</Text>
          <Text style={styles.subtitle}>Sign in to continue your journey</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} placeholder="you@example.com"
            placeholderTextColor={COLORS.textMuted} value={email}
            onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

          <Text style={styles.label}>Password</Text>
          <View style={styles.pwRow}>
            <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="••••••••" placeholderTextColor={COLORS.textMuted}
              value={password} onChangeText={setPassword} secureTextEntry={!showPass} />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(!showPass)}>
              <Text>{showPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.btnText}>Sign In</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkAccent}>Create one</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll:    { flexGrow: 1, justifyContent: 'center', padding: SPACING.lg },
  hero:      { alignItems: 'center', marginBottom: SPACING.xl },
  logoCircle:{ width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md },
  logoIcon:  { fontSize: 36 },
  appName:   { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.text },
  tagline:   { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 4 },
  card:      { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SPACING.lg },
  title:     { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  subtitle:  { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  label:     { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 6 },
  input:     { backgroundColor: COLORS.surface2, borderRadius: RADIUS.md, padding: SPACING.md, color: COLORS.text, fontSize: FONTS.sizes.md, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md },
  pwRow:     { flexDirection: 'row', gap: 8, marginBottom: SPACING.md },
  eyeBtn:    { backgroundColor: COLORS.surface2, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center' },
  btn:       { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', marginTop: SPACING.xs },
  btnText:   { color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: '700' },
  link:      { alignItems: 'center', marginTop: SPACING.md },
  linkText:  { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm },
  linkAccent:{ color: COLORS.primary, fontWeight: '700' },
});
