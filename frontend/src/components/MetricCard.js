import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';

// Metric card for quick stats display
export function MetricCard({ icon, label, value, unit, target, color = COLORS.primary }) {
  const percentage = target ? Math.min((value / target) * 100, 100) : 0;
  const isGoalMet = value >= target;

  return (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricIcon}>{icon}</Text>
        <Text style={styles.metricLabel}>{label}</Text>
      </View>

      <View style={styles.metricContent}>
        <Text style={styles.metricValue}>
          {typeof value === 'number' ? value.toFixed(0) : value}
          <Text style={styles.metricUnit}> {unit}</Text>
        </Text>
        {target && <Text style={styles.metricTarget}>Goal: {target}{unit}</Text>}
      </View>

      {target && (
        <View style={styles.metricProgressBar}>
          <View
            style={[
              styles.metricProgressFill,
              {
                width: `${percentage}%`,
                backgroundColor: isGoalMet ? COLORS.success : color
              }
            ]}
          />
        </View>
      )}

      {target && (
        <Text style={[styles.metricStatus, { color: isGoalMet ? COLORS.success : COLORS.textMuted }]}>
          {isGoalMet ? '✓ Goal reached' : `${(percentage).toFixed(0)}% complete`}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  metricCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm
  },
  metricIcon: {
    fontSize: 20,
    marginRight: SPACING.sm
  },
  metricLabel: {
    ...FONTS.medium,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted
  },
  metricContent: {
    marginBottom: SPACING.sm
  },
  metricValue: {
    ...FONTS.bold,
    fontSize: FONTS.sizes.xl,
    color: COLORS.text
  },
  metricUnit: {
    ...FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted
  },
  metricTarget: {
    ...FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginTop: 2
  },
  metricProgressBar: {
    height: 6,
    backgroundColor: COLORS.surfaceLightest,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SPACING.xs
  },
  metricProgressFill: {
    height: '100%',
    borderRadius: 3
  },
  metricStatus: {
    ...FONTS.regular,
    fontSize: FONTS.sizes.xs,
    textAlign: 'right'
  }
});
