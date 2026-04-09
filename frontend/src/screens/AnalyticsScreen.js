import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  Dimensions, RefreshControl, ActivityIndicator, TouchableOpacity
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { analyticsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../utils/theme';
import { today, formatShortDay, formatWater, getBMIColor } from '../utils/helpers';

const W = Dimensions.get('window').width - SPACING.md * 2;

function DonutChart({ value, goal, color, size = 100, strokeWidth = 10 }) {
  const pct = Math.min(100, Math.round((value / (goal || 1)) * 100));
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ position: 'absolute', width: size, height: size, borderRadius: size/2, borderWidth: strokeWidth, borderColor: '#E2ECF5' }} />
      {pct > 0 && (
        <View style={{
          position: 'absolute', width: size, height: size, borderRadius: size/2,
          borderWidth: strokeWidth, borderColor: 'transparent',
          borderTopColor: pct >= 12.5  ? color : 'transparent',
          borderRightColor: pct >= 37.5 ? color : 'transparent',
          borderBottomColor: pct >= 62.5 ? color : 'transparent',
          borderLeftColor: pct >= 87.5  ? color : 'transparent',
          transform: [{ rotate: '-90deg' }],
        }} />
      )}
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.text }}>{value}</Text>
        <Text style={{ fontSize: FONTS.sizes.xs, color: COLORS.textSecondary }}>Avg Kcal</Text>
      </View>
    </View>
  );
}

function WeekBarChart({ data, color, goalLine, formatVal }) {
  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.map(d => d.value), goalLine || 1, 1);
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 90, gap: 3 }}>
        {goalLine && (
          <View style={{
            position: 'absolute', left: 0, right: 0,
            bottom: (goalLine / maxVal) * 86,
            height: 1.5, backgroundColor: color, opacity: 0.4,
          }} />
        )}
        {data.map((d, i) => {
          const h = Math.max(4, (d.value / maxVal) * 86);
          const isToday = i === data.length - 1;
          return (
            <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: 90 }}>
              <View style={{
                width: '70%', height: h,
                backgroundColor: isToday ? color : color + '55',
                borderRadius: 4,
              }} />
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', marginTop: 4 }}>
        {data.map((d, i) => (
          <Text key={i} style={{
            flex: 1, fontSize: 10, textAlign: 'center',
            color: i === data.length - 1 ? COLORS.text : COLORS.textMuted,
            fontWeight: i === data.length - 1 ? '700' : '400'
          }}>
            {d.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

export default function AnalyticsScreen() {
  const { user } = useAuth();
  const [weekly, setWeekly]   = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('week');

  const load = async () => {
    try {
      // Load current day summary
      const sRes = await analyticsAPI.getSummary(today());
      setSummary(sRes.data.summary || {});
      
      // For weekly data, fetch each day's summary and aggregate
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        days.push(dateStr);
      }
      
      const weeklyData = await Promise.all(
        days.map(async (dateStr) => {
          try {
            const res = await analyticsAPI.getSummary(dateStr);
            return {
              date: dateStr,
              calories: res.data.summary?.calories?.consumed || 0,
              water: res.data.summary?.water?.consumed || 0,
              screentime: res.data.summary?.screenTime?.totalMinutes || 0
            };
          } catch (e) {
            return { date: dateStr, calories: 0, water: 0, screentime: 0 };
          }
        })
      );
      setWeekly(weeklyData);
    } catch (e) { console.error('Analytics load error:', e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  if (loading) return (
    <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
  );

  const calorieGoal = user?.profile?.dailyCalorieGoal || 2000;
  const waterGoal   = user?.profile?.dailyWaterGoal   || 2000;
  const avgCal = Math.round(weekly.reduce((s, d) => s + d.calories, 0) / (weekly.filter(d => d.calories > 0).length || 1));
  const activeDays = weekly.filter(d => d.calories > 0 || d.water > 0).length;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.primary} />}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your week looks</Text>
        <Text style={styles.headerTitleBold}>so good! 🔥</Text>
      </View>

      {/* Tab switcher */}
      <View style={styles.tabRow}>
        {['week','month'].map(t => (
          <TouchableOpacity key={t} style={[styles.tab, activeTab === t && styles.tabActive]}
            onPress={() => setActiveTab(t)}>
            <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
              {t === 'week' ? 'This Week' : 'This Month'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Calories + Water side by side */}
      <View style={styles.chartsRow}>
        {/* Calories donut */}
        <View style={[styles.chartCard, SHADOWS.sm]}>
          <Text style={styles.chartLabel}>Calories</Text>
          <DonutChart value={avgCal} goal={calorieGoal} color={COLORS.warning} size={90} />
        </View>

        {/* Water bar chart */}
        <View style={[styles.chartCardBlue, SHADOWS.sm]}>
          <Text style={[styles.chartLabel, { color: COLORS.white }]}>Water Intake</Text>
          <WeekBarChart
            data={weekly.map(d => ({ label: formatShortDay(d.date), value: Math.round(d.water / 250) }))}
            color={COLORS.white}
            goalLine={Math.round(waterGoal / 250)}
          />
        </View>
      </View>

      {/* Macro stats row */}
      <View style={[styles.macroCard, SHADOWS.sm]}>
        {[
          { label: 'Calories', val: Math.round(summary?.calories?.consumed || 0), unit: 'Cal', color: COLORS.success,  bg: COLORS.surfaceGreen  },
          { label: 'Protein',  val: summary?.macros?.protein || 0,                unit: 'g',   color: COLORS.info,     bg: COLORS.surfaceBlue   },
          { label: 'Carbs',    val: summary?.macros?.carbs   || 0,                unit: 'g',   color: COLORS.warning,  bg: COLORS.surfaceYellow },
          { label: 'Fats',     val: summary?.macros?.fat     || 0,                unit: 'g',   color: COLORS.purple,   bg: COLORS.surfacePurple },
        ].map(m => (
          <View key={m.label} style={styles.macroItem}>
            <Text style={styles.macroVal}>{m.val}</Text>
            <View style={[styles.macroBadge, { backgroundColor: m.bg }]}>
              <Text style={[styles.macroUnit, { color: m.color }]}>{m.unit}</Text>
            </View>
            <Text style={styles.macroLabel}>{m.label}</Text>
          </View>
        ))}
      </View>

      {/* BMI + Consistency */}
      <View style={[styles.bmiConsistCard, SHADOWS.sm]}>
        <View style={styles.bmiSection}>
          <Text style={styles.bmiSectionLabel}>BMI Score</Text>
          <View style={styles.bmiRow}>
            <Text style={styles.bmiNum}>{summary?.weight?.bmi ?? '--'}</Text>
            <Text style={[styles.bmiCat, { color: getBMIColor(summary?.weight?.category) }]}>
              {summary?.weight?.category || '--'}
            </Text>
          </View>
          <Text style={styles.bmiNote}>Based on height & weight</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.consistSection}>
          <Text style={styles.bmiSectionLabel}>Consistency</Text>
          <View style={styles.bmiRow}>
            <Text style={styles.consistFire}>🔥</Text>
            <Text style={styles.bmiNum}>{activeDays}/7</Text>
          </View>
          <Text style={styles.bmiNote}>Days active this week</Text>
        </View>
      </View>

      {/* Weekly calories bar chart */}
      <View style={[styles.fullChartCard, SHADOWS.sm]}>
        <Text style={styles.fullChartTitle}>📊 Calories – Last 7 Days</Text>
        <WeekBarChart
          data={weekly.map(d => ({ label: formatShortDay(d.date), value: d.calories }))}
          color={COLORS.warning}
          goalLine={calorieGoal}
        />
        <Text style={styles.chartNote}>Dashed line = daily goal ({calorieGoal} kcal)</Text>
      </View>

      {/* Weekly water bar chart */}
      <View style={[styles.fullChartCard, { backgroundColor: COLORS.surfaceBlue }, SHADOWS.sm]}>
        <Text style={styles.fullChartTitle}>💧 Water – Last 7 Days</Text>
        <WeekBarChart
          data={weekly.map(d => ({ label: formatShortDay(d.date), value: d.water }))}
          color={COLORS.primary}
          goalLine={waterGoal}
        />
        <Text style={styles.chartNote}>Goal: {formatWater(waterGoal)}/day</Text>
      </View>

      {/* Weekly averages summary */}
      <View style={[styles.summaryCard, SHADOWS.sm]}>
        <Text style={styles.summaryTitle}>Weekly Summary</Text>
        <View style={styles.summaryGrid}>
          {[
            { label: 'Avg Calories', val: `${avgCal} kcal`,      icon: '🔥' },
            { label: 'Active Days',  val: `${activeDays} / 7`,   icon: '✅' },
            { label: 'Avg Water',    val: formatWater(Math.round(weekly.reduce((s,d)=>s+d.water,0)/(weekly.length||1))), icon: '💧' },
            { label: 'Health Score', val: `${summary?.healthScore ?? '--'}/100`, icon: '❤️' },
          ].map(s => (
            <View key={s.label} style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>{s.icon}</Text>
              <Text style={styles.summaryVal}>{s.val}</Text>
              <Text style={styles.summaryLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ height: SPACING.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: COLORS.background },
  center:     { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  header:     { padding: SPACING.md, paddingTop: SPACING.lg, paddingBottom: SPACING.xs },
  headerTitle:{ fontSize: FONTS.sizes.xxl, fontWeight: '400', color: COLORS.text },
  headerTitleBold:{ fontSize: FONTS.sizes.xxl, fontWeight: '900', color: COLORS.text },
  tabRow:     { flexDirection: 'row', marginHorizontal: SPACING.md, backgroundColor: COLORS.white, borderRadius: RADIUS.full, padding: 4, marginBottom: SPACING.sm, ...SHADOWS.sm },
  tab:        { flex: 1, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, alignItems: 'center' },
  tabActive:  { backgroundColor: COLORS.primary },
  tabText:    { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, fontWeight: '600' },
  tabTextActive:{ color: COLORS.white },
  chartsRow:  { flexDirection: 'row', marginHorizontal: SPACING.md, gap: SPACING.sm, marginBottom: SPACING.sm },
  chartCard:  { flex: 1, backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center' },
  chartCardBlue:{ flex: 1, backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, padding: SPACING.md },
  chartLabel: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textSecondary, marginBottom: SPACING.sm },
  macroCard:  { backgroundColor: COLORS.white, marginHorizontal: SPACING.md, borderRadius: RADIUS.lg, padding: SPACING.md, flexDirection: 'row', justifyContent: 'space-around', marginBottom: SPACING.sm },
  macroItem:  { alignItems: 'center', gap: 4 },
  macroVal:   { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.text },
  macroBadge: { borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 2 },
  macroUnit:  { fontSize: FONTS.sizes.xs, fontWeight: '700' },
  macroLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
  bmiConsistCard: { backgroundColor: COLORS.white, marginHorizontal: SPACING.md, borderRadius: RADIUS.lg, padding: SPACING.md, flexDirection: 'row', marginBottom: SPACING.sm },
  bmiSection: { flex: 1 },
  consistSection:{ flex: 1, alignItems: 'flex-end' },
  bmiSectionLabel:{ fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 4 },
  bmiRow:     { flexDirection: 'row', alignItems: 'baseline', gap: SPACING.xs },
  bmiNum:     { fontSize: FONTS.sizes.xxl, fontWeight: '900', color: COLORS.text },
  bmiCat:     { fontSize: FONTS.sizes.sm, fontWeight: '700' },
  bmiNote:    { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  consistFire:{ fontSize: 22 },
  divider:    { width: 1, backgroundColor: COLORS.border, marginHorizontal: SPACING.md },
  fullChartCard:{ backgroundColor: COLORS.white, marginHorizontal: SPACING.md, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm },
  fullChartTitle:{ fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  chartNote:  { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: SPACING.xs },
  summaryCard:{ backgroundColor: COLORS.white, marginHorizontal: SPACING.md, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm },
  summaryTitle:{ fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.md },
  summaryGrid:{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  summaryItem:{ width: '47%', backgroundColor: COLORS.surface2, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', gap: 4 },
  summaryIcon:{ fontSize: 28 },
  summaryVal: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.text },
  summaryLabel:{ fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, textAlign: 'center' },
});
