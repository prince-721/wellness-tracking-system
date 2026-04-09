import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert, RefreshControl, Modal
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { screenTimeAPI } from '../services/api';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';
import { today, formatDisplayDate, formatMinutes } from '../utils/helpers';

const CATEGORIES = [
  { key: 'work',          label: '💼 Work',          color: '#4CC9F0' },
  { key: 'social',        label: '💬 Social',         color: '#FF9F1C' },
  { key: 'entertainment', label: '🎬 Entertainment',  color: '#E63946' },
  { key: 'education',     label: '📚 Education',      color: '#2EC4B6' },
  { key: 'other',         label: '📱 Other',          color: '#8892A4' },
];

const DAILY_LIMIT = 120; // minutes

export default function ScreenTimeScreen() {
  const [entries, setEntries]   = useState([]);
  const [total, setTotal]       = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState({ duration: '', category: 'social', appName: '', note: '' });
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await screenTimeAPI.getByDate(today());
      setEntries(res.data.entries);
      setTotal(res.data.total);
    } catch (e) { console.error(e); }
    finally { setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const addEntry = async () => {
    if (!form.duration || parseInt(form.duration) <= 0)
      return Alert.alert('Invalid', 'Enter a valid duration in minutes');
    try {
      await screenTimeAPI.add({ ...form, duration: parseInt(form.duration), date: today() });
      setShowModal(false);
      setForm({ duration: '', category: 'social', appName: '', note: '' });
      load();
    } catch (e) { Alert.alert('Error', 'Failed to log screen time'); }
  };

  const deleteEntry = (id) => {
    Alert.alert('Delete', 'Remove this entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await screenTimeAPI.delete(id); load();
      }}
    ]);
  };

  const overLimit = total > DAILY_LIMIT;
  const pct = Math.min(100, Math.round((total / DAILY_LIMIT) * 100));

  // Category breakdown
  const breakdown = CATEGORIES.map(cat => {
    const catTotal = entries.filter(e => e.category === cat.key).reduce((s, e) => s + e.duration, 0);
    return { ...cat, minutes: catTotal, pct: total > 0 ? Math.round((catTotal / total) * 100) : 0 };
  }).filter(c => c.minutes > 0);

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.warning} />}>

        {/* Summary card */}
        <View style={[styles.summaryCard, overLimit && { borderColor: COLORS.error }]}>
          <Text style={styles.dateLabel}>{formatDisplayDate(today())}</Text>
          <View style={styles.summaryMain}>
            <View>
              <Text style={[styles.totalTime, { color: overLimit ? COLORS.error : COLORS.warning }]}>
                {formatMinutes(total)}
              </Text>
              <Text style={styles.limitText}>of {formatMinutes(DAILY_LIMIT)} limit</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusIcon}>{overLimit ? '⚠️' : total > 0 ? '✅' : '📱'}</Text>
              <Text style={[styles.statusText, { color: overLimit ? COLORS.error : COLORS.success }]}>
                {overLimit ? 'Over limit!' : total > 0 ? 'On track' : 'No data'}
              </Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, {
              width: `${pct}%`,
              backgroundColor: overLimit ? COLORS.error : COLORS.warning
            }]} />
            {/* Limit marker at 100% */}
            <View style={[styles.limitMarker, { left: '100%' }]} />
          </View>

          {overLimit && (
            <Text style={styles.warningText}>
              ⚠️ {formatMinutes(total - DAILY_LIMIT)} over your daily limit. Take a break!
            </Text>
          )}
        </View>

        {/* Category breakdown */}
        {breakdown.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Breakdown</Text>
            {breakdown.map(cat => (
              <View key={cat.key} style={styles.catRow}>
                <Text style={styles.catLabel}>{cat.label}</Text>
                <View style={styles.catBarTrack}>
                  <View style={[styles.catBarFill, { width: `${cat.pct}%`, backgroundColor: cat.color }]} />
                </View>
                <Text style={[styles.catTime, { color: cat.color }]}>{formatMinutes(cat.minutes)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.sectionTitle}>Healthy Screen Tips 💡</Text>
          {[
            '👁️ Follow the 20-20-20 rule: every 20 min, look 20 ft away for 20 sec',
            '🧘 Take a 5-minute movement break every hour',
            '🌙 Avoid screens 1 hour before bedtime',
            '📵 Keep phone-free zones: meals and bedroom'
          ].map((tip, i) => (
            <Text key={i} style={styles.tipText}>{tip}</Text>
          ))}
        </View>

        {/* Today's log */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Today's Log</Text>
          {entries.length === 0
            ? <Text style={styles.emptyText}>No screen time logged yet</Text>
            : entries.map(e => {
              const cat = CATEGORIES.find(c => c.key === e.category);
              return (
                <TouchableOpacity key={e._id} style={styles.logItem} onLongPress={() => deleteEntry(e._id)}>
                  <Text style={styles.logIcon}>{cat?.label.split(' ')[0] || '📱'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.logApp}>{e.appName || cat?.label.split(' ').slice(1).join(' ') || 'Unknown'}</Text>
                    <Text style={styles.logCat}>{cat?.label}</Text>
                  </View>
                  <Text style={[styles.logDur, { color: cat?.color }]}>{formatMinutes(e.duration)}</Text>
                </TouchableOpacity>
              );
            })
          }
        </View>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Text style={styles.fabText}>+ Log Time</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Screen Time</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Duration (minutes)</Text>
            <TextInput style={styles.input} placeholder="e.g. 30" placeholderTextColor={COLORS.textMuted}
              value={form.duration} onChangeText={set('duration')} keyboardType="numeric" />

            <Text style={styles.label}>Category</Text>
            <View style={styles.chipRow}>
              {CATEGORIES.map(c => (
                <TouchableOpacity key={c.key}
                  style={[styles.chip, form.category === c.key && { backgroundColor: c.color + '30', borderColor: c.color }]}
                  onPress={() => set('category')(c.key)}>
                  <Text style={[styles.chipText, form.category === c.key && { color: c.color }]}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>App/Activity name</Text>
            <TextInput style={styles.input} placeholder="e.g. Instagram, Netflix" placeholderTextColor={COLORS.textMuted}
              value={form.appName} onChangeText={set('appName')} />

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={addEntry}>
                <Text style={styles.saveText}>Log</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.background },
  summaryCard:  { backgroundColor: COLORS.surface, margin: SPACING.md, borderRadius: RADIUS.lg, padding: SPACING.lg, borderWidth: 2, borderColor: COLORS.border },
  dateLabel:    { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  summaryMain:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  totalTime:    { fontSize: FONTS.sizes.xxxl, fontWeight: '900' },
  limitText:    { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  statusBadge:  { alignItems: 'center' },
  statusIcon:   { fontSize: 32 },
  statusText:   { fontSize: FONTS.sizes.sm, fontWeight: '700' },
  progressTrack:{ height: 10, backgroundColor: COLORS.surface2, borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5 },
  limitMarker:  { position: 'absolute', top: -2, width: 2, height: 14, backgroundColor: COLORS.white },
  warningText:  { color: COLORS.error, fontSize: FONTS.sizes.sm, marginTop: SPACING.sm, fontWeight: '600' },
  card:         { backgroundColor: COLORS.surface, margin: SPACING.md, marginBottom: 0, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  catRow:       { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  catLabel:     { width: 100, fontSize: FONTS.sizes.xs, color: COLORS.text },
  catBarTrack:  { flex: 1, height: 8, backgroundColor: COLORS.surface2, borderRadius: 4, overflow: 'hidden' },
  catBarFill:   { height: '100%', borderRadius: 4 },
  catTime:      { width: 44, fontSize: FONTS.sizes.xs, fontWeight: '700', textAlign: 'right' },
  tipsCard:     { backgroundColor: COLORS.surface, margin: SPACING.md, marginBottom: 0, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  tipText:      { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.xs, lineHeight: 20 },
  emptyText:    { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, fontStyle: 'italic', textAlign: 'center', paddingVertical: SPACING.sm },
  logItem:      { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border, gap: SPACING.sm },
  logIcon:      { fontSize: 22 },
  logApp:       { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text },
  logCat:       { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
  logDur:       { fontSize: FONTS.sizes.md, fontWeight: '700' },
  fab:          { position: 'absolute', bottom: SPACING.lg, right: SPACING.lg, backgroundColor: COLORS.warning, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderRadius: RADIUS.full, elevation: 6 },
  fabText:      { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.md },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000080' },
  modalCard:    { backgroundColor: COLORS.surface, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACING.lg },
  modalHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  modalTitle:   { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.text },
  closeBtn:     { fontSize: 22, color: COLORS.textSecondary },
  label:        { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: 6, fontWeight: '600' },
  input:        { backgroundColor: COLORS.surface2, borderRadius: RADIUS.md, padding: SPACING.md, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md, fontSize: FONTS.sizes.md },
  chipRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginBottom: SPACING.md },
  chip:         { paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.border },
  chipText:     { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, fontWeight: '600' },
  modalBtns:    { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.sm },
  cancelBtn:    { flex: 1, backgroundColor: COLORS.surface2, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  cancelText:   { color: COLORS.textSecondary, fontWeight: '700' },
  saveBtn:      { flex: 2, backgroundColor: COLORS.warning, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' },
  saveText:     { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.md },
});
