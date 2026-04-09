import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Modal, FlatList, ActivityIndicator, Alert
} from 'react-native';
import { favoritesAPI } from '../services/api';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';

export function FavoriteMealSelector({ visible, onClose, onSelectMeal }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) loadFavorites();
  }, [visible]);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const res = await favoritesAPI.getAll();
      setFavorites(res.data.favorites || []);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMeal = (meal) => {
    onSelectMeal(meal);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Quick Add - Favorites</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeBtn}>✕</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : favorites.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>No favorite meals yet</Text>
            <Text style={styles.emptySubtext}>Start logging meals to build your favorites list</Text>
          </View>
        ) : (
          <FlatList
            data={favorites}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.favoriteItem}
                onPress={() => handleSelectMeal(item)}
              >
                <View style={styles.favoriteInfo}>
                  <Text style={styles.favoriteName}>{item.foodName}</Text>
                  <Text style={styles.favoriteDetails}>
                    {item.calories} cal • {item.servingSize}
                  </Text>
                  <Text style={styles.favoriteUsed}>Used {item.timesLogged} times</Text>
                </View>
                <Text style={styles.favoriteArrow}>→</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: 60
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  title: {
    ...FONTS.bold,
    fontSize: FONTS.sizes.lg,
    color: COLORS.text
  },
  closeBtn: {
    fontSize: 24,
    color: COLORS.textMuted
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    ...FONTS.medium,
    fontSize: FONTS.sizes.md,
    color: COLORS.text
  },
  emptySubtext: {
    ...FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    textAlign: 'center',
    paddingHorizontal: SPACING.md
  },
  favoriteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLightest
  },
  favoriteInfo: {
    flex: 1
  },
  favoriteName: {
    ...FONTS.semibold,
    fontSize: FONTS.sizes.md,
    color: COLORS.text
  },
  favoriteDetails: {
    ...FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginTop: 2
  },
  favoriteUsed: {
    ...FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginTop: 2
  },
  favoriteArrow: {
    fontSize: 18,
    color: COLORS.primary,
    marginLeft: SPACING.md
  }
});
