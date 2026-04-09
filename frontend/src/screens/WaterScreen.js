import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert, RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { waterAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';
import { today, formatDisplayDate, formatWater } from '../utils/helpers';

const QUICK_AMOUNTS = [150, 200, 250, 300, 350, 500];

export default function WaterScreen() {
  const { user } = useAuth();
  const [entries, setEntries]   = useState([]);
  const [total, setTotal]       = useState(0);
  const [custom, setCustom]     = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const goal = user?.profile?.dailyWaterGoal || 2500;
  const pct  = Math.min(100, Math.round((total / goal) * 100));

  const load = async () => {
    try {
      const res = await waterAPI.getByDate(today());
      setEntries(res.data.entries);
      setTotal(res.data.total);
    } catch (e) { console.error(e); }
    finally { setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const addWater = async (amount) => {
    if (!amount || amount <= 0) return Alert.alert('Invalid', 'Enter a valid amount');
    try {
      await waterAPI.add({ amount, date: today() });
      load();
    } catch (e) { Alert.alert('Error', 'Failed to log water'); }
  };

  const deleteEntry = (id) => {
    Alert.alert('Delete', 'Remove this entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await waterAPI.delete(id); load();
      }}
    ]);
  };

  const waveHeight = pct;

  return (
    <ScrollView style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.info} />}>

      {/* Progress visual */}
      <View style={styles.progressCard}>
        <Text style={styles.dateText}>{formatDisplayDate(today())}</Text>
        <View style={styles.circleWrap}>
          {/* Wave background */}
          <View style={[styles.waveFill, { height: `${waveHeight}%` }]} />
          <View style={styles.circleContent}>
            <Text style={styles.bigAmount}>{formatWater(total)}</Text>
            <Text style={styles.goalText}>of {formatWater(goal)}</Text>
            <Text style={styles.pctText}>{pct}%</Text>
          </View>
        </View>
        <Text style={styles.remaining}>
          {total >= goal
            ? '✅ Goal reached! Great hydration!'
            : `${formatWater(goal - total)} more to reach your goal`}
        </Text>
      </View>

      {/* Quick add buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Add</Text>
        <View style={styles.quickGrid}>
          {QUICK_AMOUNTS.map(amt => (
            <TouchableOpacity key={amt} style={styles.quickBtn} onPress={() => addWater(amt)}>
              <Text style={styles.quickIcon}>💧</Text>
              <Text style={styles.quickAmt}>{amt}ml</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom amount */}
        <View style={styles.customRow}>
          <TextInput
            style={styles.customInput}
            placeholder="Custom (ml)"
            placeholderTextColor={COLORS.textMuted}
            value={custom}
            onChangeText={setCustom}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.customBtn} onPress={() => {
            addWater(parseInt(custom));
            setCustom('');
          }}>
            <Text style={styles.customBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Today's log */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Log</Text>
        {entries.length === 0
          ? <Text style={styles.emptyText}>No entries yet. Start drinking! 💧</Text>
          : entries.map((e, i) => (
            <TouchableOpacity key={e._id} style={styles.logItem} onLongPress={() => deleteEntry(e._id)}>
              <Text style={styles.logIcon}>💧</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.logAmt}>{e.amount} ml</Text>
                <Text style={styles.logTime}>{e.time || '--:--'}</Text>
              </View>
              <Text style={styles.logDel}>Hold to delete</Text>
            </TouchableOpacity>
          ))
        }
      </View>

      <View style={{ height: SPACING.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.background },
  progressCard: { backgroundColor: COLORS.surface, margin: SPACING.md, borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  dateText:     { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.md },
  circleWrap:   { width: 180, height: 180, borderRadius: 90, borderWidth: 4, borderColor: COLORS.info, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md },
  waveFill:     { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.info + '40' },
  circleContent:{ alignItems: 'center' },
  bigAmount:    { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.text },
  goalText:     { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  pctText:      { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.info },
  remaining:    { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, textAlign: 'center' },
  section:      { backgroundColor: COLORS.surface, margin: SPACING.md, marginBottom: 0, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  quickGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md },
  quickBtn:     { flex: 1, minWidth: '28%', backgroundColor: COLORS.surface2, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  quickIcon:    { fontSize: 24, marginBottom: 4 },
  quickAmt:     { fontSize: FONTS.sizes.sm, color: COLORS.info, fontWeight: '700' },
  customRow:    { flexDirection: 'row', gap: SPACING.sm },
  customInput:  { flex: 1, backgroundColor: COLORS.surface2, borderRadius: RADIUS.md, padding: SPACING.md, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, fontSize: FONTS.sizes.md },
  customBtn:    { backgroundColor: COLORS.info, borderRadius: RADIUS.md, padding: SPACING.md, paddingHorizontal: SPACING.lg, justifyContent: 'center' },
  customBtnText:{ color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.md },
  emptyText:    { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, fontStyle: 'italic', textAlign: 'center', paddingVertical: SPACING.sm },
  logItem:      { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border, gap: SPACING.sm },
  logIcon:      { fontSize: 24 },
  logAmt:       { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text },
  logTime:      { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
  logDel:       { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
});
