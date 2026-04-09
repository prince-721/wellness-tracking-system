import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { profileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';

const GOALS = [
  { key: 'lose_weight',  label: '🔥 Lose Weight' },
  { key: 'maintain',     label: '⚖️ Maintain'    },
  { key: 'gain_weight',  label: '💪 Gain Weight' },
];
const ACTIVITY = [
  { key: 'sedentary',  label: 'Sedentary',    sub: 'Little/no exercise' },
  { key: 'light',      label: 'Light',         sub: '1-3 days/week'      },
  { key: 'moderate',   label: 'Moderate',      sub: '3-5 days/week'      },
  { key: 'active',     label: 'Active',         sub: '6-7 days/week'      },
  { key: 'very_active',label: 'Very Active',    sub: 'Athlete/heavy work' },
];

export default function ProfileSetupScreen() {
  const { updateUser } = useAuth();
  const [form, setForm] = useState({
    age: '', gender: 'male', height: '', weight: '',
    activityLevel: 'moderate', goal: 'maintain'
  });
  const [loading, setLoading] = useState(false);
  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.age || !form.height || !form.weight)
      return Alert.alert('Incomplete', 'Please fill age, height and weight');
    setLoading(true);
    try {
      const res = await profileAPI.update({
        age: Number(form.age),
        gender: form.gender,
        height: Number(form.height),
        weight: Number(form.weight),
        activityLevel: form.activityLevel,
        goal: form.goal
      });
      await updateUser(res.data.user);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Set Up Your Profile</Text>
      <Text style={styles.sub}>Help us personalise your health goals</Text>

      {/* Basic Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Info</Text>
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Age</Text>
            <TextInput style={styles.input} placeholder="25" placeholderTextColor={COLORS.textMuted}
              value={form.age} onChangeText={set('age')} keyboardType="numeric" />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Height (cm)</Text>
            <TextInput style={styles.input} placeholder="170" placeholderTextColor={COLORS.textMuted}
              value={form.height} onChangeText={set('height')} keyboardType="numeric" />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput style={styles.input} placeholder="70" placeholderTextColor={COLORS.textMuted}
              value={form.weight} onChangeText={set('weight')} keyboardType="numeric" />
          </View>
        </View>

        {/* Gender */}
        <Text style={styles.label}>Gender</Text>
        <View style={styles.chipRow}>
          {['male','female','other'].map(g => (
            <TouchableOpacity key={g} style={[styles.chip, form.gender === g && styles.chipActive]}
              onPress={() => set('gender')(g)}>
              <Text style={[styles.chipText, form.gender === g && styles.chipTextActive]}>
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Goal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Goal</Text>
        <View style={styles.chipRow}>
          {GOALS.map(g => (
            <TouchableOpacity key={g.key} style={[styles.chip, form.goal === g.key && styles.chipActive]}
              onPress={() => set('goal')(g.key)}>
              <Text style={[styles.chipText, form.goal === g.key && styles.chipTextActive]}>{g.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Activity Level */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity Level</Text>
        {ACTIVITY.map(a => (
          <TouchableOpacity key={a.key}
            style={[styles.activityCard, form.activityLevel === a.key && styles.activityCardActive]}
            onPress={() => set('activityLevel')(a.key)}>
            <View style={styles.activityDot}>
              {form.activityLevel === a.key && <View style={styles.activityDotInner} />}
            </View>
            <View>
              <Text style={[styles.activityLabel, form.activityLevel === a.key && { color: COLORS.primary }]}>{a.label}</Text>
              <Text style={styles.activitySub}>{a.sub}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.btn} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.btnText}>Save & Continue →</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: COLORS.background },
  content:     { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  heading:     { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  sub:         { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  section:     { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle:{ fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  row:         { flexDirection: 'row', gap: SPACING.sm },
  inputGroup:  { marginBottom: SPACING.sm },
  label:       { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: 4, fontWeight: '600' },
  input:       { backgroundColor: COLORS.surface2, borderRadius: RADIUS.sm, padding: SPACING.sm, color: COLORS.text, fontSize: FONTS.sizes.md, borderWidth: 1, borderColor: COLORS.border },
  chipRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: 4 },
  chip:        { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.border },
  chipActive:  { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText:    { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, fontWeight: '600' },
  chipTextActive:{ color: COLORS.white },
  activityCard:{ flexDirection: 'row', alignItems: 'center', padding: SPACING.sm, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.xs, gap: SPACING.sm },
  activityCardActive:{ borderColor: COLORS.primary, backgroundColor: COLORS.surface2 },
  activityDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.textSecondary, justifyContent: 'center', alignItems: 'center' },
  activityDotInner:{ width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  activityLabel:{ fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text },
  activitySub: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
  btn:         { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', marginTop: SPACING.md },
  btnText:     { color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: '700' },
});
