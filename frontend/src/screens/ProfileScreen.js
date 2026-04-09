import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Alert, Switch
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../utils/theme';
import { RemindersModal } from '../components/RemindersModal';

function formatGoal(g) {
  const goals = {
    lose_weight: '🔥 Lose Weight',
    maintain: '⚖️ Maintain',
    gain_weight: '💪 Gain Weight'
  };
  return goals[g] || 'No goal set';
}

function formatActivityShort(a) {
  const act = {
    sedentary: 'Sedentary',
    light: 'Light',
    moderate: 'Moderate',
    active: 'Active',
    very_active: 'Very Active'
  };
  return act[a] || 'Not set';
}

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const p = user?.profile;

  const [mealReminders, setMealReminders]   = useState(true);
  const [hydrationAlerts, setHydrationAlerts] = useState(true);
  const [metricUnits, setMetricUnits]       = useState(true);
  const [darkMode, setDarkMode]             = useState(false);
  const [remindersVisible, setRemindersVisible] = useState(false);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout }
    ]);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Sync / Cloud Card */}
      <View style={[styles.syncCard, SHADOWS.md]}>
        <Text style={styles.syncIcon}>☁️</Text>
        <Text style={styles.syncTitle}>Sync Your Progress</Text>
        <Text style={styles.syncSub}>Sign in to back up your health data securely to the cloud.</Text>
        <TouchableOpacity style={styles.googleBtn}>
          <Text style={styles.googleBtnText}>🔵  Continue with Google</Text>
        </TouchableOpacity>
      </View>

      {/* Health Profile */}
      <Text style={styles.sectionLabel}>HEALTH PROFILE</Text>
      <View style={[styles.menuCard, SHADOWS.sm]}>
        <TouchableOpacity style={styles.menuRow} onPress={() => navigation.navigate('ProfileSetup')}>
          <View style={[styles.menuIconBg, { backgroundColor: COLORS.surfaceBlue }]}>
            <Text style={styles.menuIcon}>👤</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Personal Data</Text>
            <Text style={styles.menuSub}>
              {p?.age ? `${p.age}yo` : '--'}, {p?.height ? `${p.height}cm` : '--'}, {p?.weight ? `${p.weight}kg` : '--'}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <View style={styles.menuDivider} />

        <TouchableOpacity style={styles.menuRow} onPress={() => navigation.navigate('ProfileSetup')}>
          <View style={[styles.menuIconBg, { backgroundColor: COLORS.surfaceGreen }]}>
            <Text style={styles.menuIcon}>🎯</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>My Goals</Text>
            <Text style={styles.menuSub}>{formatGoal(p?.goal)}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Daily Goals info */}
      <View style={[styles.statsRow, SHADOWS.sm]}>
        {[
          { icon: '🔥', label: 'Calorie Goal', val: `${p?.dailyCalorieGoal || 2000}`, unit: 'kcal' },
          { icon: '💧', label: 'Water Goal',   val: `${p?.dailyWaterGoal   || 2000}`, unit: 'ml'   },
          { icon: '🏃', label: 'Activity',     val: formatActivityShort(p?.activityLevel), unit: ''  },
        ].map((s, i) => (
          <View key={i} style={[styles.statItem, i < 2 && { borderRightWidth: 1, borderRightColor: COLORS.border }]}>
            <Text style={styles.statIcon}>{s.icon}</Text>
            <Text style={styles.statVal}>{s.val} <Text style={styles.statUnit}>{s.unit}</Text></Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Additional Goals */}
      <Text style={styles.sectionLabel}>ADDITIONAL GOALS</Text>
      <View style={[styles.statsRow, SHADOWS.sm]}>
        {[
          { icon: '👟', label: 'Steps Goal', val: `${p?.dailyStepGoal || 8000}`, unit: 'steps' },
          { icon: '😴', label: 'Sleep Goal', val: `${p?.sleepGoal || 8}`, unit: 'hrs' },
        ].map((s, i) => (
          <View key={i} style={[styles.statItem, i === 0 && { borderRightWidth: 1, borderRightColor: COLORS.border }]}>
            <Text style={styles.statIcon}>{s.icon}</Text>
            <Text style={styles.statVal}>{s.val} <Text style={styles.statUnit}>{s.unit}</Text></Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionLabel}>QUICK LINKS</Text>
      <View style={[styles.menuCard, SHADOWS.sm]}>
        <TouchableOpacity style={styles.menuRow} onPress={() => setRemindersVisible(true)}>
          <View style={[styles.menuIconBg, { backgroundColor: COLORS.surfaceYellow }]}>
            <Text style={styles.menuIcon}>🔔</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Manage Reminders</Text>
            <Text style={styles.menuSub}>Set up daily notifications</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <View style={styles.menuDivider} />

        <TouchableOpacity style={styles.menuRow} onPress={() => navigation.navigate('Favorites')}>
          <View style={[styles.menuIconBg, { backgroundColor: COLORS.surfacePurple }]}>
            <Text style={styles.menuIcon}>⭐</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Favorite Meals</Text>
            <Text style={styles.menuSub}>Quick add frequently eaten foods</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Preferences */}
      <Text style={styles.sectionLabel}>PREFERENCES</Text>
      <View style={[styles.menuCard, SHADOWS.sm]}>
        <ToggleRow
          icon="🔔" iconBg={COLORS.surfaceBlue}
          title="Notifications" sub="Receive health tips & reminders"
          value={mealReminders} onToggle={setMealReminders}
        />
        <View style={styles.menuDivider} />
        <ToggleRow
          icon="📏" iconBg={COLORS.surfaceGreen}
          title="Units" sub="Metric (kg/cm)"
          value={metricUnits} onToggle={setMetricUnits}
        />
        <View style={styles.menuDivider} />
        <ToggleRow
          icon="🌙" iconBg={COLORS.surfacePurple}
          title="Dark Mode" sub="Switch app theme"
          value={darkMode} onToggle={setDarkMode}
        />
      </View>

      {/* App Info */}
      <Text style={styles.sectionLabel}>ABOUT</Text>
      <View style={[styles.menuCard, SHADOWS.sm]}>
        <InfoRow icon="📱" iconBg={COLORS.surfaceBlue}  title="Version"    val="1.0.0" />
        <View style={styles.menuDivider} />
        <InfoRow icon="🥗" iconBg={COLORS.surfaceGreen} title="Food Data"  val="OpenFoodFacts" />
        <View style={styles.menuDivider} />
        <InfoRow icon="🗄️" iconBg={COLORS.surfaceYellow} title="Backend"   val="Node.js + MongoDB" />
      </View>

      {/* Logout */}
      <TouchableOpacity style={[styles.logoutBtn, SHADOWS.sm]} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪  Logout</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Health Tracker App  ·  Made with ❤️</Text>
      </View>

      <View style={{ height: SPACING.xxl }} />

      {/* Reminders Modal */}
      <RemindersModal visible={remindersVisible} onClose={() => setRemindersVisible(false)} />
    </ScrollView>
  );
}

function ToggleRow({ icon, iconBg, title, sub, value, onToggle }) {
  return (
    <View style={styles.menuRow}>
      <View style={[styles.menuIconBg, { backgroundColor: iconBg }]}>
        <Text style={styles.menuIcon}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSub}>{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: COLORS.border, true: COLORS.success + '80' }}
        thumbColor={value ? COLORS.success : COLORS.textMuted}
      />
    </View>
  );
}

function InfoRow({ icon, iconBg, title, val }) {
  return (
    <View style={styles.menuRow}>
      <View style={[styles.menuIconBg, { backgroundColor: iconBg }]}>
        <Text style={styles.menuIcon}>{icon}</Text>
      </View>
      <Text style={[styles.menuTitle, { flex: 1 }]}>{title}</Text>
      <Text style={styles.menuSub}>{val}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: COLORS.background },
  syncCard:    { backgroundColor: COLORS.surfaceGreen, margin: SPACING.md, borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center' },
  syncIcon:    { fontSize: 40, marginBottom: SPACING.sm },
  syncTitle:   { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.xs },
  syncSub:     { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.md },
  googleBtn:   { backgroundColor: COLORS.white, borderRadius: RADIUS.full, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm, width: '100%', alignItems: 'center' },
  googleBtnText:{ fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text },
  sectionLabel:{ fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.textSecondary, marginHorizontal: SPACING.md, marginTop: SPACING.sm, marginBottom: SPACING.xs, letterSpacing: 1 },
  menuCard:    { backgroundColor: COLORS.white, marginHorizontal: SPACING.md, borderRadius: RADIUS.lg, overflow: 'hidden', marginBottom: SPACING.sm },
  menuRow:     { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.sm },
  menuIconBg:  { width: 40, height: 40, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center' },
  menuIcon:    { fontSize: 20 },
  menuTitle:   { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text },
  menuSub:     { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 1 },
  chevron:     { fontSize: 22, color: COLORS.textMuted },
  menuDivider: { height: 1, backgroundColor: COLORS.border, marginLeft: 68 },
  statsRow:    { flexDirection: 'row', backgroundColor: COLORS.white, marginHorizontal: SPACING.md, borderRadius: RADIUS.lg, marginBottom: SPACING.sm, overflow: 'hidden' },
  statItem:    { flex: 1, padding: SPACING.md, alignItems: 'center' },
  statIcon:    { fontSize: 22, marginBottom: 4 },
  statVal:     { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.text },
  statUnit:    { fontSize: FONTS.sizes.xs, fontWeight: '400', color: COLORS.textSecondary },
  statLabel:   { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, textAlign: 'center', marginTop: 2 },
  logoutBtn:   { backgroundColor: COLORS.white, marginHorizontal: SPACING.md, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.error, marginBottom: SPACING.sm },
  logoutText:  { color: COLORS.error, fontWeight: '700', fontSize: FONTS.sizes.md },
  footer:      { alignItems: 'center', padding: SPACING.md },
  footerText:  { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
});
