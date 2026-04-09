import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password)
      return Alert.alert('Missing Fields', 'All fields are required');
    if (form.password !== form.confirm)
      return Alert.alert('Password Mismatch', 'Passwords do not match');
    if (form.password.length < 6)
      return Alert.alert('Weak Password', 'Password must be at least 6 characters');

    setLoading(true);
    try {
      console.log('🔄 Sending registration request:', { name: form.name, email: form.email });
      await register(form.name.trim(), form.email.trim().toLowerCase(), form.password);
      console.log('✅ Registration successful!');
    } catch (err) {
      console.error('❌ Registration Error Details:', {
        message: err.message,
        code: err.code,
        status: err.response?.status,
        responseData: err.response?.data,
        url: err.config?.url
      });
      
      let errorMsg = 'Something went wrong';
      
      // Network/Connection errors
      if (err.code === 'ECONNABORTED') {
        errorMsg = 'Request timeout. Backend server may be down. Try again.';
      } else if (err.code === 'ENOTFOUND') {
        errorMsg = 'Cannot reach server. Check BASE_URL configuration (10.0.2.2:5000 for Android).';
      } else if (!err.response) {
        errorMsg = `Network error: ${err.message}`;
      }
      // Server validation errors
      else if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        errorMsg = err.response.data.errors[0]?.msg || 'Validation failed';
      }
      // Server message
      else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      // Generic server error
      else if (err.response?.status >= 500) {
        errorMsg = `Server error (${err.response.status}). Check backend logs.`;
      }
      
      Alert.alert('Registration Failed', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          <View style={styles.logoCircle}><Text style={styles.logoIcon}>❤️</Text></View>
          <Text style={styles.appName}>HealthTracker</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Start your health journey today</Text>

          {[
            { key: 'name',     label: 'Full Name',       placeholder: 'John Doe',         keyboard: 'default',       cap: 'words' },
            { key: 'email',    label: 'Email',           placeholder: 'you@example.com',  keyboard: 'email-address', cap: 'none' },
          ].map(f => (
            <View key={f.key} style={styles.inputGroup}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput
                style={styles.input}
                placeholder={f.placeholder}
                placeholderTextColor={COLORS.textMuted}
                value={form[f.key]}
                onChangeText={set(f.key)}
                keyboardType={f.keyboard}
                autoCapitalize={f.cap}
              />
            </View>
          ))}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="Min. 6 characters"
                placeholderTextColor={COLORS.textMuted}
                value={form.password}
                onChangeText={set('password')}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(!showPass)}>
                <Text style={styles.eyeText}>{showPass ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Re-enter password"
              placeholderTextColor={COLORS.textMuted}
              value={form.confirm}
              onChangeText={set('confirm')}
              secureTextEntry={!showPass}
            />
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
            {loading
              ? <ActivityIndicator color={COLORS.white} />
              : <Text style={styles.btnText}>Create Account</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Already have an account? <Text style={styles.linkAccent}>Sign in</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: COLORS.background },
  scroll:     { flexGrow: 1, justifyContent: 'center', padding: SPACING.lg },
  header:     { alignItems: 'center', marginBottom: SPACING.xl },
  logoCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm },
  logoIcon:   { fontSize: 32 },
  appName:    { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.text },
  card:       { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border },
  title:      { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  subtitle:   { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  inputGroup: { marginBottom: SPACING.md },
  label:      { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: 6, fontWeight: '600' },
  input:      { backgroundColor: COLORS.surface2, borderRadius: RADIUS.md, padding: SPACING.md, color: COLORS.text, fontSize: FONTS.sizes.md, borderWidth: 1, borderColor: COLORS.border },
  passwordRow:{ flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn:     { backgroundColor: COLORS.surface2, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  eyeText:    { fontSize: 18 },
  btn:        { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', marginTop: SPACING.md },
  btnText:    { color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: '700' },
  linkRow:    { alignItems: 'center', marginTop: SPACING.md },
  linkText:   { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm },
  linkAccent: { color: COLORS.primary, fontWeight: '700' },
});
