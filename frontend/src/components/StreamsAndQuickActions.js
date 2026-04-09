import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';

// Component to display a habit streak
export function StreakCard({ type, streak, onPress }) {
  const getIcon = (type) => {
    const icons = {
      'daily_logging': '📅',
      'water_goal': '💧',
      'calorie_goal': '🔥',
      'workout': '💪'
    };
    return icons[type] || '⭐';
  };

  const getLabel = (type) => {
    const labels = {
      'daily_logging': 'Daily Logging',
      'water_goal': 'Water Goal',
      'calorie_goal': 'Calorie Goal',
      'workout': 'Workouts'
    };
    return labels[type] || type;
  };

  const currentStreak = streak?.currentStreak || 0;
  const isActive = currentStreak > 0;

  return (
    <TouchableOpacity
      style={[
        styles.streakCard,
        !isActive && styles.streakCardInactive
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.streakHeader}>
        <Text style={styles.streakIcon}>{getIcon(type)}</Text>
        <Text style={styles.streakLabel}>{getLabel(type)}</Text>
      </View>
      
      <View style={styles.streakStats}>
        <View style={styles.streakStat}>
          <Text style={styles.streakNumber}>{currentStreak}</Text>
          <Text style={styles.streakPhrase}>day streak</Text>
        </View>
        <View style={styles.streakDivider} />
        <View style={styles.streakStat}>
          <Text style={styles.streakNumber}>{streak?.longestStreak || 0}</Text>
          <Text style={styles.streakPhrase}>best streak</Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.min((currentStreak / 7) * 100, 100)}%`,
              backgroundColor: isActive ? COLORS.primary : COLORS.border
            }
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}

// Quick action button for fast tracking
export function QuickActionButton({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.quickButton} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.quickIcon}>{icon}</Text>
      <Text style={styles.quickLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  streakCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  streakCardInactive: {
    borderLeftColor: COLORS.border,
    opacity: 0.6
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm
  },
  streakIcon: {
    fontSize: 24,
    marginRight: SPACING.sm
  },
  streakLabel: {
    ...FONTS.medium,
    fontSize: FONTS.sizes.md,
    color: COLORS.text
  },
  streakStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm
  },
  streakStat: {
    flex: 1,
    alignItems: 'center'
  },
  streakNumber: {
    ...FONTS.bold,
    fontSize: FONTS.sizes.lg,
    color: COLORS.primary
  },
  streakPhrase: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginTop: 2
  },
  streakDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.surfaceLightest,
    borderRadius: 3,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 3
  },

  quickButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceLightest,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginHorizontal: SPACING.xs
  },
  quickIcon: {
    fontSize: 28,
    marginBottom: SPACING.xs
  },
  quickLabel: {
    ...FONTS.medium,
    fontSize: FONTS.sizes.xs,
    color: COLORS.text,
    textAlign: 'center'
  }
});
