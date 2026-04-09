import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert, RefreshControl, Modal
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { bmiAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';
import { today, formatDisplayDate, getBMIColor } from '../utils/helpers';

const BMI_RANGES = [
  { label: 'Underweight', max: 18.5, color: '#4CC9F0' },
  { label: 'Normal',      max: 25,   color: '#2EC4B6' },
  { label: 'Overweight',  max: 30,   color: '#FF9F1C' },
  { label: 'Obese',       max: 999,  color: '#E63946' },
];

export default function BMIScreen() {
  const { user } = useAuth();
  const [history, setHistory]   = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [weight, setWeight]     = useState('');
  const [note, setNote]         = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await bmiAPI.getHistory();
      setHistory(res.data.entries);
    } catch (e) { console.error(e); }
    finally { setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const addWeight = async () => {
    if (!weight) return Alert.alert('Enter weight');
    try {
      await bmiAPI.log({ weight: parseFloat(weight), date: today(), note });
      setShowModal(false);
      setWeight(''); setNote('');
      load();
    } catch (e) {
      Alert.alert('Error', 'Failed to log weight');
    }
  };

  const deleteEntry = (id) => {
    Alert.alert('Delete', 'Remove this entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await bmiAPI.delete(id); load();
      }}
    ]);
  };

  const latest = history[0];
  const heightM = (user?.profile?.height || 170) / 100;

  // BMI gauge position (scale 10-40)
  const bmiVal = latest?.bmi || 0;
  const gaugePos = Math.min(100, Math.max(0, ((bmiVal - 10) / 30) * 100));

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.success} />}>

        {/* Current BMI card */}
        <View style={styles.bmiCard}>
          <Text style={styles.cardTitle}>Current BMI</Text>
          {latest ? (
            <>
              <View style={styles.bmiMain}>
                <Text style={[styles.bmiNum, { color: getBMIColor(latest.bmiCategory) }]}>
                  {latest.bmi ?? '--'}
                </Text>
                <View style={[styles.categoryBadge, { backgroundColor: getBMIColor(latest.bmiCategory) + '30' }]}>
                  <Text style={[styles.categoryText, { color: getBMIColor(latest.bmiCategory) }]}>
                    {latest.bmiCategory}
                  </Text>
                </View>
              </View>
              <Text style={styles.weightSub}>{latest.weight} kg  ·  {formatDisplayDate(latest.date)}</Text>

              {/* Gauge */}
              <View style={styles.gauge}>
                <View style={styles.gaugeTrack}>
                  {BMI_RANGES.map((r, i) => (
                    <View key={r.label} style={[styles.gaugeSegment, { backgroundColor: r.color, flex: i === 0 ? 2 : i === 1 ? 3 : i === 2 ? 2 : 2 }]} />
                  ))}
                </View>
                <View style={[styles.gaugeMarker, { left: `${gaugePos}%` }]} />
              </View>
              <View style={styles.gaugeLabels}>
                {BMI_RANGES.map(r => (
                  <Text key={r.label} style={[styles.gaugeLabel, { color: r.color }]}>{r.label}</Text>
                ))}
              </View>
            </>
          ) : (
            <Text style={styles.emptyText}>Log your weight to see BMI</Text>
          )}
        </View>

        {/* BMI Info */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>BMI Reference</Text>
          {BMI_RANGES.map(r => (
            <View key={r.label} style={styles.rangeRow}>
              <View style={[styles.rangeDot, { backgroundColor: r.color }]} />
              <Text style={styles.rangeLabel}>{r.label}</Text>
              <Text style={styles.rangeVal}>
                {r.label === 'Underweight' ? '< 18.5' :
                 r.label === 'Normal'      ? '18.5 – 24.9' :
                 r.label === 'Overweight'  ? '25 – 29.9' : '≥ 30'}
              </Text>
            </View>
          ))}
          <Text style={styles.heightNote}>
            Your height: {user?.profile?.height || '--'} cm
          </Text>
        </View>

        {/* Weight history */}
        <View style={styles.historyCard}>
          <Text style={styles.sectionTitle}>Weight History</Text>
          {history.length === 0
            ? <Text style={styles.emptyText}>No entries yet</Text>
            : history.map(e => (
              <TouchableOpacity key={e._id} style={styles.historyRow} onLongPress={() => deleteEntry(e._id)}>
                <View style={[styles.historyDot, { backgroundColor: getBMIColor(e.bmiCategory) }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyWeight}>{e.weight} kg</Text>
                  <Text style={styles.historyDate}>{formatDisplayDate(e.date)}</Text>
                </View>
                <View style={styles.historyBMI}>
                  <Text style={[styles.historyBMINum, { color: getBMIColor(e.bmiCategory) }]}>{e.bmi}</Text>
                  <Text style={styles.historyBMICat}>{e.bmiCategory}</Text>
                </View>
              </TouchableOpacity>
            ))
          }
        </View>
        <View style={{ height: SPACING.xxl }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Text style={styles.fabText}>+ Log Weight</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Log Weight</Text>

            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput style={styles.input} placeholder="e.g. 72.5" placeholderTextColor={COLORS.textMuted}
              value={weight} onChangeText={setWeight} keyboardType="decimal-pad" />

            {/* Real-time BMI preview */}
            {weight && !isNaN(parseFloat(weight)) && (
              <View style={styles.bmiPreview}>
                <Text style={styles.previewLabel}>Estimated BMI: </Text>
                <Text style={[styles.previewVal, { color: COLORS.success }]}>
                  {(parseFloat(weight) / (heightM * heightM)).toFixed(1)}
                </Text>
              </View>
            )}

            <Text style={styles.label}>Note (optional)</Text>
            <TextInput style={styles.input} placeholder="e.g. After workout" placeholderTextColor={COLORS.textMuted}
              value={note} onChangeText={setNote} />

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={addWeight}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: COLORS.background },
  bmiCard:       { backgroundColor: COLORS.surface, margin: SPACING.md, borderRadius: RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border },
  cardTitle:     { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, fontWeight: '600', marginBottom: SPACING.sm },
  bmiMain:       { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.xs },
  bmiNum:        { fontSize: 56, fontWeight: '900' },
  categoryBadge: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full },
  categoryText:  { fontSize: FONTS.sizes.md, fontWeight: '700' },
  weightSub:     { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.md },
  gauge:         { height: 16, position: 'relative', marginBottom: SPACING.xs },
  gaugeTrack:    { flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', marginTop: 2 },
  gaugeSegment:  { height: '100%' },
  gaugeMarker:   { position: 'absolute', top: 0, width: 4, height: 16, backgroundColor: COLORS.white, borderRadius: 2, marginLeft: -2 },
  gaugeLabels:   { flexDirection: 'row', justifyContent: 'space-between' },
  gaugeLabel:    { fontSize: 9, fontWeight: '700' },
  emptyText:     { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, fontStyle: 'italic', textAlign: 'center', paddingVertical: SPACING.md },
  infoCard:      { backgroundColor: COLORS.surface, margin: SPACING.md, marginBottom: 0, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle:  { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  rangeRow:      { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.xs, gap: SPACING.sm },
  rangeDot:      { width: 12, height: 12, borderRadius: 6 },
  rangeLabel:    { flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.text },
  rangeVal:      { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  heightNote:    { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: SPACING.sm },
  historyCard:   { backgroundColor: COLORS.surface, margin: SPACING.md, marginBottom: 0, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  historyRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border, gap: SPACING.sm },
  historyDot:    { width: 10, height: 10, borderRadius: 5 },
  historyWeight: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text },
  historyDate:   { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
  historyBMI:    { alignItems: 'flex-end' },
  historyBMINum: { fontSize: FONTS.sizes.md, fontWeight: '800' },
  historyBMICat: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
  fab:           { position: 'absolute', bottom: SPACING.lg, right: SPACING.lg, backgroundColor: COLORS.success, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderRadius: RADIUS.full, elevation: 6 },
  fabText:       { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.md },
  modalOverlay:  { flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000080' },
  modalCard:     { backgroundColor: COLORS.surface, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACING.lg },
  modalTitle:    { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.md },
  label:         { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: 6, fontWeight: '600' },
  input:         { backgroundColor: COLORS.surface2, borderRadius: RADIUS.md, padding: SPACING.md, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md, fontSize: FONTS.sizes.md },
  bmiPreview:    { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  previewLabel:  { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  previewVal:    { fontSize: FONTS.sizes.lg, fontWeight: '800' },
  modalBtns:     { flexDirection: 'row', gap: SPACING.md },
  cancelBtn:     { flex: 1, backgroundColor: COLORS.surface2, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  cancelBtnText: { color: COLORS.textSecondary, fontWeight: '700' },
  saveBtn:       { flex: 2, backgroundColor: COLORS.success, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' },
  saveBtnText:   { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.md },
});
