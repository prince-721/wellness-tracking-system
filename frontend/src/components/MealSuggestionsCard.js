import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { suggestionsAPI } from '../services/api';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';

export function MealSuggestionsCard({ date, onSelectMeal }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [remainingGoals, setRemainingGoals] = useState(null);

  useEffect(() => {
    loadSuggestions();
  }, [date]);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const res = await suggestionsAPI.getDaily(date);
      setSuggestions(res.data.suggestions || []);
      setRemainingGoals(res.data.remainingGoals);
    } catch (e) {
      console.error('Failed to load suggestions:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  const topSuggestion = suggestions[0];

  return (
    <View>
      {/* Main Suggestion Card */}
      <TouchableOpacity
        style={styles.mainCard}
        onPress={() => expanded ? setExpanded(false) : setExpanded(true)}
        activeOpacity={0.8}
      >
        <View style={styles.suggestionHeader}>
          <View style={styles.suggestLeftSide}>
            <View style={styles.mealIcon}>
              <Text style={styles.icon}>💡</Text>
            </View>
            <View style={styles.suggestInfo}>
              <Text style={styles.suggestLabel}>Perfect for you</Text>
              <Text style={styles.mealName}>{topSuggestion.name}</Text>
              <Text style={styles.mealType}>{topSuggestion.type}</Text>
            </View>
          </View>

          <View style={styles.suggestRight}>
            <View style={styles.fitBadge}>
              <Text style={styles.fitScore}>{topSuggestion.fitScore}%</Text>
              <Text style={styles.fitLabel}>fit</Text>
            </View>
            <Text style={styles.expandIcon}>{expanded ? '▼' : '▶'}</Text>
          </View>
        </View>

        {/* Nutrition Quick View */}
        <View style={styles.nutritionRow}>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{topSuggestion.calories}</Text>
            <Text style={styles.nutritionLabel}>cal</Text>
          </View>
          <View style={styles.nutritionDivider} />
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{topSuggestion.protein}g</Text>
            <Text style={styles.nutritionLabel}>protein</Text>
          </View>
          <View style={styles.nutritionDivider} />
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{topSuggestion.carbs}g</Text>
            <Text style={styles.nutritionLabel}>carbs</Text>
          </View>
          <View style={styles.nutritionDivider} />
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{topSuggestion.fat}g</Text>
            <Text style={styles.nutritionLabel}>fat</Text>
          </View>
        </View>

        {/* Macro Match Bars */}
        <View style={styles.macroMatchContainer}>
          <View style={styles.macroMatch}>
            <Text style={styles.macroLabel}>Match: {topSuggestion.macroMatch.calories}%</Text>
            <View style={styles.macroBar}>
              <View
                style={[
                  styles.macroFill,
                  { width: `${Math.min(topSuggestion.macroMatch.calories, 100)}%` }
                ]}
              />
            </View>
          </View>
        </View>

        {/* Quick Add Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            onSelectMeal?.(topSuggestion);
            Alert.alert('Added', `${topSuggestion.name} added to your meal!`);
          }}
        >
          <Text style={styles.addButtonText}>✨ Add to Today</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Expanded Alternatives */}
      {expanded && suggestions.length > 1 && (
        <View style={styles.alternativesContainer}>
          <Text style={styles.alternativesTitle}>More suggestions:</Text>
          {suggestions.slice(1, 5).map((meal, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.alternativeItem}
              onPress={() => {
                onSelectMeal?.(meal);
                setExpanded(false);
              }}
            >
              <View style={styles.altLeft}>
                <Text style={styles.altName}>{meal.name}</Text>
                <Text style={styles.altDetails}>
                  {meal.calories} cal • {meal.type}
                </Text>
              </View>
              <View style={styles.altRight}>
                <Text style={styles.altFit}>{meal.fitScore}%</Text>
                <Text style={styles.altArrow}>→</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// Quick suggestion pill for inline display
export function MealSuggestionPill({ suggestion, onPress }) {
  const getTypeColor = (type) => {
    const colors = {
      breakfast: COLORS.surfaceGreen,
      lunch: COLORS.surfaceBlue,
      dinner: COLORS.surfaceYellow,
      snack: COLORS.surfacePurple
    };
    return colors[type] || COLORS.surfaceLightest;
  };

  return (
    <TouchableOpacity
      style={[styles.pill, { backgroundColor: getTypeColor(suggestion.type) }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.pillEmoji}>💡</Text>
      <View style={styles.pillInfo}>
        <Text style={styles.pillName}>{suggestion.name}</Text>
        <Text style={styles.pillCals}>{suggestion.calories} cal</Text>
      </View>
      <Text style={styles.pillFit}>{suggestion.fitScore}%</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center'
  },
  mainCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm
  },
  suggestLeftSide: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  mealIcon: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceYellow,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md
  },
  icon: {
    fontSize: 28
  },
  suggestInfo: {
    flex: 1
  },
  suggestLabel: {
    ...FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.warning,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  mealName: {
    ...FONTS.bold,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    marginTop: 2
  },
  mealType: {
    ...FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginTop: 1
  },
  suggestRight: {
    alignItems: 'center',
    marginLeft: SPACING.md
  },
  fitBadge: {
    backgroundColor: COLORS.warning + '20',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    marginBottom: SPACING.xs,
    alignItems: 'center'
  },
  fitScore: {
    ...FONTS.bold,
    fontSize: FONTS.sizes.md,
    color: COLORS.warning
  },
  fitLabel: {
    ...FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted
  },
  expandIcon: {
    fontSize: 14,
    color: COLORS.textMuted
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surfaceLightest,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md
  },
  nutritionItem: {
    flex: 1,
    alignItems: 'center'
  },
  nutritionValue: {
    ...FONTS.bold,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text
  },
  nutritionLabel: {
    ...FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginTop: 2
  },
  nutritionDivider: {
    width: 1,
    backgroundColor: COLORS.border
  },
  macroMatchContainer: {
    marginBottom: SPACING.md
  },
  macroMatch: {
    marginBottom: SPACING.sm
  },
  macroLabel: {
    ...FONTS.medium,
    fontSize: FONTS.sizes.xs,
    color: COLORS.text,
    marginBottom: SPACING.xs
  },
  macroBar: {
    height: 8,
    backgroundColor: COLORS.surfaceLightest,
    borderRadius: 4,
    overflow: 'hidden'
  },
  macroFill: {
    height: '100%',
    backgroundColor: COLORS.warning,
    borderRadius: 4
  },
  addButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.warning,
    borderRadius: RADIUS.md,
    alignItems: 'center'
  },
  addButtonText: {
    ...FONTS.bold,
    fontSize: FONTS.sizes.sm,
    color: COLORS.white
  },
  alternativesContainer: {
    backgroundColor: COLORS.surfaceLightest,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    paddingBottom: SPACING.sm
  },
  alternativesTitle: {
    ...FONTS.semibold,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    marginBottom: SPACING.sm
  },
  alternativeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md
  },
  altLeft: {
    flex: 1
  },
  altName: {
    ...FONTS.medium,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text
  },
  altDetails: {
    ...FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginTop: 2
  },
  altRight: {
    alignItems: 'flex-end'
  },
  altFit: {
    ...FONTS.bold,
    fontSize: FONTS.sizes.sm,
    color: COLORS.warning
  },
  altArrow: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 2
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1
  },
  pillEmoji: {
    fontSize: 18,
    marginRight: SPACING.sm
  },
  pillInfo: {
    flex: 1
  },
  pillName: {
    ...FONTS.medium,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text
  },
  pillCals: {
    ...FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginTop: 1
  },
  pillFit: {
    ...FONTS.bold,
    fontSize: FONTS.sizes.xs,
    color: COLORS.primary,
    marginLeft: SPACING.sm
  }
});
