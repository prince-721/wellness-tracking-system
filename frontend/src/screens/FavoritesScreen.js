import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  FlatList, Alert, ActivityIndicator, RefreshControl, TextInput
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { favoritesAPI, caloriesAPI } from '../services/api';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';
import { today } from '../utils/helpers';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(useCallback(() => {
    loadFavorites();
  }, []));

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const res = await favoritesAPI.getAll();
      setFavorites(res.data.favorites || []);
    } catch (e) {
      Alert.alert('Error', 'Failed to load favorite meals');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogMeal = async (meal) => {
    try {
      await caloriesAPI.add({
        date: today(),
        mealType: 'snack',
        foodName: meal.foodName,
        quantity: meal.servingSize || 100,
        unit: meal.servingUnit || 'g',
        barcode: meal.barcode || null,
        nutrition: {
          calories: meal.calories || 0,
          protein: meal.protein || 0,
          carbs: meal.carbs || 0,
          fat: meal.fat || 0,
          fiber: 0,
          sugar: 0
        }
      });

      // Update favorite's last used date
      await favoritesAPI.add({
        foodName: meal.foodName,
        barcode: meal.barcode,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        servingSize: meal.servingSize,
        servingUnit: meal.servingUnit
      });

      loadFavorites();
      Alert.alert('Success', `${meal.foodName} logged!`);
    } catch (e) {
      Alert.alert('Error', 'Failed to log meal');
    }
  };

  const handleDeleteFavorite = async (id) => {
    Alert.alert('Delete', 'Remove this favorite?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await favoritesAPI.delete(id);
            loadFavorites();
          } catch (e) {
            Alert.alert('Error', 'Failed to delete favorite');
          }
        }
      }
    ]);
  };

  const filteredFavorites = favorites.filter(f =>
    f.foodName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search favorites..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {filteredFavorites.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadFavorites} />}
        >
          <Text style={styles.emptyIcon}>🍽️</Text>
          <Text style={styles.emptyTitle}>No Favorite Meals Yet</Text>
          <Text style={styles.emptyMessage}>
            Log meals regularly to build your favorites list for quick access
          </Text>
        </ScrollView>
      ) : (
        <FlatList
          data={filteredFavorites}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.favoriteCard}>
              <View style={styles.favoriteHeader}>
                <View style={styles.foodInfo}>
                  <Text style={styles.foodName}>{item.foodName}</Text>
                  <Text style={styles.foodDetails}>
                    {item.calories} cal • {item.servingSize}
                  </Text>
                </View>
                <Text style={styles.timesUsed}>{item.timesLogged}x</Text>
              </View>

              <View style={styles.nutrientRow}>
                <View style={styles.nutrientItem}>
                  <Text style={styles.nutrientValue}>{item.protein}g</Text>
                  <Text style={styles.nutrientLabel}>Protein</Text>
                </View>
                <View style={styles.nutrientDivider} />
                <View style={styles.nutrientItem}>
                  <Text style={styles.nutrientValue}>{item.carbs}g</Text>
                  <Text style={styles.nutrientLabel}>Carbs</Text>
                </View>
                <View style={styles.nutrientDivider} />
                <View style={styles.nutrientItem}>
                  <Text style={styles.nutrientValue}>{item.fat}g</Text>
                  <Text style={styles.nutrientLabel}>Fat</Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.logButton}
                  onPress={() => handleLogMeal(item)}
                >
                  <Text style={styles.logButtonText}>➕ Log Meal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteFavorite(item._id)}
                >
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadFavorites} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  searchIcon: {
    fontSize: 18,
    marginRight: SPACING.sm
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.text
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: SPACING.md
  },
  emptyTitle: {
    ...FONTS.bold,
    fontSize: FONTS.sizes.lg,
    color: COLORS.text,
    marginBottom: SPACING.sm
  },
  emptyMessage: {
    ...FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    textAlign: 'center'
  },
  favoriteCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  favoriteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md
  },
  foodInfo: {
    flex: 1
  },
  foodName: {
    ...FONTS.semibold,
    fontSize: FONTS.sizes.md,
    color: COLORS.text
  },
  foodDetails: {
    ...FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginTop: 2
  },
  timesUsed: {
    ...FONTS.bold,
    fontSize: FONTS.sizes.md,
    color: COLORS.primary,
    backgroundColor: COLORS.surfaceBlue,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surfaceLightest,
    borderRadius: RADIUS.md
  },
  nutrientItem: {
    flex: 1,
    alignItems: 'center'
  },
  nutrientValue: {
    ...FONTS.bold,
    fontSize: FONTS.sizes.md,
    color: COLORS.text
  },
  nutrientLabel: {
    ...FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginTop: 2
  },
  nutrientDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.xs
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.md
  },
  logButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    alignItems: 'center'
  },
  logButtonText: {
    ...FONTS.semibold,
    fontSize: FONTS.sizes.sm,
    color: COLORS.white
  },
  deleteButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.errorLight,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center'
  },
  deleteIcon: {
    fontSize: 18
  }
});
