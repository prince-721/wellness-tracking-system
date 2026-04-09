import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator, Dimensions
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { analyticsAPI, waterAPI, suggestionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../utils/theme';
import { today, formatLongDate, getGreeting, formatWater, getBMIColor } from '../utils/helpers';
import { MealSuggestionsCard, MealSuggestionPill } from '../components/MealSuggestionsCard';

const W = Dimensions.get('window').width;
const CARD_PAD = SPACING.md;

// Circular progress ring (pure RN)
function RingProgress({ size = 120, strokeWidth = 10, progress = 0, color = COLORS.primary, bg = '#E2ECF5', children }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, progress / 100));
  // We simulate ring with a view trick
  const filled = pct;
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      {/* Background ring */}
      <View style={{
        position: 'absolute', width: size, height: size, borderRadius: size / 2,
        borderWidth: strokeWidth, borderColor: bg,
      }} />
      {/* Progress arc - we use overflow clip trick */}
      {filled > 0 && (
        <View style={{
          position: 'absolute', width: size, height: size, borderRadius: size / 2,
          borderWidth: strokeWidth, borderColor: 'transparent',
          borderTopColor: filled >= 0.125 ? color : 'transparent',
          borderRightColor: filled >= 0.375 ? color : 'transparent',
          borderBottomColor: filled >= 0.625 ? color : 'transparent',
          borderLeftColor: filled >= 0.875 ? color : 'transparent',
          transform: [{ rotate: '-90deg' }],
        }} />
      )}
      <View style={{ alignItems: 'center' }}>{children}</View>
    </View>
  );
}

// Water glass icons
function WaterGlasses({ total, goal }) {
  const glassSize = 250; // ml per glass
  const totalGlasses = Math.ceil(goal / glassSize);
  const filledGlasses = Math.floor(total / glassSize);
  return (
    <View style={styles.glassGrid}>
      {Array.from({ length: totalGlasses }).map((_, i) => (
        <View key={i} style={[styles.glass, i < filledGlasses && styles.glassFilled]}>
          {i < filledGlasses && <View style={styles.glassFill} />}
        </View>
      ))}
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [summary, setSummary]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const load = async () => {
    try {
      const res = await analyticsAPI.getSummary(today());
      setSummary(res.data?.summary || {});
      
      // Load meal suggestions
      try {
        const sugRes = await suggestionsAPI.getDaily(today());
        setSuggestions(sugRes.data?.suggestions || []);
      } catch (e) {
        console.error('Suggestions load failed:', e);
        setSuggestions([]);
      }
    } catch (e) {
      console.error('Summary load failed:', e);
      setSummary({});
    }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const quickAddWater = async (amount) => {
    try {
      await waterAPI.add({ amount, date: today() });
      load();
    } catch (e) {}
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );

  const s = summary;
  const calLeft = Math.max(0, (s?.calories?.goal || 2000) - (s?.calories?.consumed || 0));
  const calPct  = s?.calories?.percentage || 0;
  const waterPct = s?.water?.percentage || 0;
  const waterGoal = user?.profile?.dailyWaterGoal || 2000;
  const waterTotal = s?.water?.consumed || 0;

  const MEAL_CARDS = [
    { type: 'breakfast', label: 'Breakfast', icon: '☀️', bg: COLORS.surfaceGreen },
    { type: 'lunch',     label: 'Lunch',     icon: '🍴', bg: COLORS.surfaceBlue  },
    { type: 'dinner',    label: 'Dinner',    icon: '🌙', bg: COLORS.surfaceYellow},
    { type: 'snack',     label: 'Snacks',    icon: '☕', bg: COLORS.surfacePurple},
  ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.primary} />}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || '?'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>{getGreeting()} 👋</Text>
          <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'User'}</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Text style={styles.notifIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Calorie Hero Card */}
      <View style={[styles.heroCard, SHADOWS.md]}>
        <View style={styles.heroLeft}>
          <Text style={styles.heroPct}>{calPct}%</Text>
          <Text style={styles.heroSub}>Daily Goal</Text>
          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeText}>{formatLongDate(today())} ▾</Text>
          </View>
        </View>
        <RingProgress size={130} strokeWidth={12} progress={calPct} color={COLORS.primary} bg="#C7DFF7">
          <Text style={styles.ringNum}>{calLeft}</Text>
          <Text style={styles.ringSub}>Left</Text>
        </RingProgress>
      </View>

      {/* Weight + Calories consumed row */}
      <View style={styles.row}>
        <View style={[styles.miniCard, SHADOWS.sm]}>
          <Text style={styles.miniIcon}>⚖️</Text>
          <Text style={styles.miniLabel}>Weight</Text>
          <Text style={styles.miniVal}>{s?.weight?.value ?? '--'} <Text style={styles.miniUnit}>Kg</Text></Text>
        </View>
        <View style={[styles.miniCard, SHADOWS.sm]}>
          <Text style={[styles.miniIcon, { color: COLORS.warning }]}>🔥</Text>
          <Text style={styles.miniLabel}>Consumed</Text>
          <Text style={[styles.miniVal, { color: COLORS.warning }]}>
            {Math.round(s?.calories?.consumed || 0)} <Text style={styles.miniUnit}>Kcal</Text>
          </Text>
        </View>
      </View>

      {/* Hydration Card */}
      <View style={[styles.hydrationCard, SHADOWS.sm]}>
        <View style={styles.hydrationHeader}>
          <View>
            <Text style={styles.hydrationTitle}>Hydration</Text>
            <Text style={styles.hydrationSub}>{formatWater(waterTotal)} / {formatWater(waterGoal)}</Text>
          </View>
          <View style={styles.hydrationBtns}>
            <TouchableOpacity style={styles.hydBtn} onPress={() => quickAddWater(-250)}>
              <Text style={styles.hydBtnText}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.hydBtn} onPress={() => quickAddWater(250)}>
              <Text style={styles.hydBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <WaterGlasses total={waterTotal} goal={waterGoal} />
        <TouchableOpacity onPress={() => navigation.navigate('Water')}>
          <Text style={styles.seeMore}>Tap to manage →</Text>
        </TouchableOpacity>
      </View>

      {/* Meals Section */}
      {suggestions.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Suggested for You</Text>
          </View>
          <View style={{ marginHorizontal: SPACING.md }}>
            {suggestions.slice(0, 2).map((suggestion, idx) => (
              <MealSuggestionPill
                key={idx}
                suggestion={suggestion}
                onPress={() => navigation.navigate('Calories')}
              />
            ))}
          </View>
        </>
      )}

      {/* Meals Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Meals</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Calories')}>
          <Text style={styles.seeAll}>See all →</Text>
        </TouchableOpacity>
      </View>

      {MEAL_CARDS.map(meal => (
        <TouchableOpacity key={meal.type}
          style={[styles.mealCard, { backgroundColor: meal.bg }, SHADOWS.sm]}
          onPress={() => navigation.navigate('Calories')}>
          <View style={styles.mealCardLeft}>
            <View style={styles.mealIconCircle}>
              <Text style={styles.mealIconText}>{meal.icon}</Text>
            </View>
            <View>
              <Text style={styles.mealName}>{meal.label}</Text>
              <Text style={styles.mealKcal}>
                {Math.round(s?.macros ? 0 : 0)} Kcal
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.mealAddBtn} onPress={() => navigation.navigate('Calories')}>
            <Text style={styles.mealAddText}>+</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      ))}

      {/* Macros row */}
      <View style={[styles.macroCard, SHADOWS.sm]}>
        <Text style={styles.sectionTitle}>Today's Macros</Text>
        <View style={styles.macroRow}>
          {[
            { label: 'Calories', val: Math.round(s?.calories?.consumed || 0), unit: 'Cal', color: COLORS.success,  bg: '#D8F0DC' },
            { label: 'Protein',  val: s?.macros?.protein || 0,                unit: 'g',   color: COLORS.info,     bg: '#D6EAFA' },
            { label: 'Carbs',    val: s?.macros?.carbs   || 0,                unit: 'g',   color: COLORS.warning,  bg: '#FDF3DC' },
            { label: 'Fats',     val: s?.macros?.fat     || 0,                unit: 'g',   color: COLORS.purple,   bg: '#EDE8F7' },
          ].map(m => (
            <View key={m.label} style={styles.macroPill}>
              <Text style={styles.macroPillVal}>{m.val}</Text>
              <View style={[styles.macroPillBadge, { backgroundColor: m.bg }]}>
                <Text style={[styles.macroPillUnit, { color: m.color }]}>{m.unit}</Text>
              </View>
              <Text style={styles.macroPillLabel}>{m.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* BMI + Navigation shortcuts */}
      {s?.weight && (
        <View style={[styles.bmiCard, SHADOWS.sm]}>
          <View style={styles.bmiLeft}>
            <Text style={styles.bmiLabel}>BMI Score</Text>
            <View style={styles.bmiRow}>
              <Text style={styles.bmiVal}>{s.weight.bmi}</Text>
              <Text style={[styles.bmiCat, { color: getBMIColor(s.weight.category) }]}>
                {s.weight.category}
              </Text>
            </View>
            <Text style={styles.bmiNote}>Based on height & weight</Text>
          </View>
          <View style={styles.bmiDivider} />
          <TouchableOpacity style={styles.bmiRight} onPress={() => navigation.navigate('Analytics')}>
            <Text style={styles.consistencyLabel}>Analytics</Text>
            <Text style={styles.consistencyVal}>📊</Text>
            <Text style={styles.consistencyNote}>View details →</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: SPACING.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.background },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },

  // Header
  header:       { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, paddingTop: SPACING.lg, gap: SPACING.sm },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText:   { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: '700' },
  greeting:     { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
  userName:     { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.text },
  notifBtn:     { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center' },
  notifIcon:    { fontSize: 18 },

  // Hero card
  heroCard:     { backgroundColor: COLORS.surfaceBlue, marginHorizontal: SPACING.md, borderRadius: RADIUS.lg, padding: SPACING.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  heroLeft:     { flex: 1 },
  heroPct:      { fontSize: FONTS.huge, fontWeight: '900', color: COLORS.text },
  heroSub:      { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  dateBadge:    { backgroundColor: COLORS.white, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, alignSelf: 'flex-start' },
  dateBadgeText:{ fontSize: FONTS.sizes.sm, color: COLORS.text, fontWeight: '600' },
  ringNum:      { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.text },
  ringSub:      { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },

  // Mini cards
  row:          { flexDirection: 'row', marginHorizontal: SPACING.md, gap: SPACING.sm, marginBottom: SPACING.sm },
  miniCard:     { flex: 1, backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md },
  miniIcon:     { fontSize: 22, marginBottom: SPACING.xs },
  miniLabel:    { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
  miniVal:      { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.text, marginTop: 2 },
  miniUnit:     { fontSize: FONTS.sizes.sm, fontWeight: '400', color: COLORS.textSecondary },

  // Hydration
  hydrationCard:   { backgroundColor: COLORS.surfaceBlue, marginHorizontal: SPACING.md, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm },
  hydrationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.md },
  hydrationTitle:  { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text },
  hydrationSub:    { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  hydrationBtns:   { flexDirection: 'row', gap: SPACING.sm },
  hydBtn:          { backgroundColor: COLORS.white, borderRadius: RADIUS.md, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  hydBtnText:      { fontSize: 22, color: COLORS.primary, fontWeight: '700', lineHeight: 26 },
  glassGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACING.sm },
  glass:           { width: 36, height: 44, borderRadius: 8, borderWidth: 2, borderColor: COLORS.white, backgroundColor: 'transparent', overflow: 'hidden', justifyContent: 'flex-end' },
  glassFilled:     { borderColor: COLORS.primary },
  glassFill:       { backgroundColor: COLORS.primary, height: '100%' },
  seeMore:         { fontSize: FONTS.sizes.xs, color: COLORS.primary, fontWeight: '600', textAlign: 'right' },

  // Section
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: SPACING.md, marginTop: SPACING.sm, marginBottom: SPACING.xs },
  sectionTitle:  { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.text },
  seeAll:        { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '600' },

  // Meal cards
  mealCard:      { marginHorizontal: SPACING.md, borderRadius: RADIUS.lg, padding: SPACING.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs },
  mealCardLeft:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  mealIconCircle:{ width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center' },
  mealIconText:  { fontSize: 20 },
  mealName:      { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text },
  mealKcal:      { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
  mealAddBtn:    { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.text, justifyContent: 'center', alignItems: 'center' },
  mealAddText:   { color: COLORS.white, fontSize: 20, lineHeight: 24, fontWeight: '700' },

  // Macros
  macroCard:     { backgroundColor: COLORS.white, marginHorizontal: SPACING.md, borderRadius: RADIUS.lg, padding: SPACING.md, marginTop: SPACING.sm, marginBottom: SPACING.sm },
  macroRow:      { flexDirection: 'row', justifyContent: 'space-around', marginTop: SPACING.md },
  macroPill:     { alignItems: 'center', gap: SPACING.xs },
  macroPillVal:  { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.text },
  macroPillBadge:{ borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 3 },
  macroPillUnit: { fontSize: FONTS.sizes.xs, fontWeight: '700' },
  macroPillLabel:{ fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },

  // BMI card
  bmiCard:       { backgroundColor: COLORS.white, marginHorizontal: SPACING.md, borderRadius: RADIUS.lg, padding: SPACING.md, flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  bmiLeft:       { flex: 1 },
  bmiLabel:      { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, fontWeight: '600' },
  bmiRow:        { flexDirection: 'row', alignItems: 'baseline', gap: SPACING.sm },
  bmiVal:        { fontSize: FONTS.sizes.xxl, fontWeight: '900', color: COLORS.text },
  bmiCat:        { fontSize: FONTS.sizes.sm, fontWeight: '700' },
  bmiNote:       { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  bmiDivider:    { width: 1, height: 50, backgroundColor: COLORS.border, marginHorizontal: SPACING.md },
  bmiRight:      { flex: 1, alignItems: 'center' },
  consistencyLabel:{ fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, fontWeight: '600' },
  consistencyVal:  { fontSize: 32 },
  consistencyNote: { fontSize: FONTS.sizes.xs, color: COLORS.primary, fontWeight: '600' },
});
