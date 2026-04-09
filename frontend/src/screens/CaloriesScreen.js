import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Modal, FlatList, Alert, ActivityIndicator, RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { caloriesAPI, foodAPI } from '../services/api';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';
import { today, formatDisplayDate } from '../utils/helpers';
import { MealSuggestionsCard } from '../components/MealSuggestionsCard';

const MEAL_TYPES = ['breakfast','lunch','dinner','snack'];
const MEAL_ICONS = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' };

export default function CaloriesScreen() {
  const [date, setDate]           = useState(today());
  const [meals, setMeals]         = useState([]);
  const [totals, setTotals]       = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mealType, setMealType]   = useState('breakfast');

  // Food search modal state
  const [searchQ, setSearchQ]     = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedFood, setSelectedFood]   = useState(null);
  const [quantity, setQuantity]   = useState('100');

  const loadMeals = async () => {
    try {
      const res = await caloriesAPI.getByDate(date);
      setMeals(res.data.meals);
      setTotals(res.data.totals);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { loadMeals(); }, [date]));

  const searchFood = async () => {
    if (!searchQ.trim()) return;
    setSearching(true);
    try {
      const res = await foodAPI.search(searchQ.trim());
      setSearchResults(res.data.products || []);
    } catch (e) {
      Alert.alert('Search failed', 'Check your internet connection');
    } finally { setSearching(false); }
  };

  const addMeal = async () => {
    if (!selectedFood) return Alert.alert('Select a food item first');
    const qty = parseFloat(quantity) || 100;
    const factor = qty / 100;
    try {
      await caloriesAPI.add({
        date,
        mealType,
        foodName: selectedFood.name,
        quantity: qty,
        unit: 'g',
        barcode: selectedFood.id || null,
        nutrition: {
          calories: Math.round((selectedFood.nutrition.calories || 0) * factor),
          protein:  parseFloat(((selectedFood.nutrition.protein  || 0) * factor).toFixed(1)),
          carbs:    parseFloat(((selectedFood.nutrition.carbs    || 0) * factor).toFixed(1)),
          fat:      parseFloat(((selectedFood.nutrition.fat      || 0) * factor).toFixed(1)),
          fiber:    parseFloat(((selectedFood.nutrition.fiber    || 0) * factor).toFixed(1)),
          sugar:    parseFloat(((selectedFood.nutrition.sugar    || 0) * factor).toFixed(1)),
        }
      });
      closeModal();
      loadMeals();
    } catch (e) {
      Alert.alert('Error', 'Failed to add meal');
    }
  };

  const deleteMeal = (id) => {
    Alert.alert('Delete Meal', 'Remove this entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await caloriesAPI.delete(id); loadMeals();
      }}
    ]);
  };

  const closeModal = () => {
    setShowModal(false); setSelectedFood(null);
    setSearchQ(''); setSearchResults([]); setQuantity('100');
  };

  const mealsByType = MEAL_TYPES.map(type => ({
    type,
    items: meals.filter(m => m.mealType === type)
  }));

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadMeals(); }} tintColor={COLORS.primary} />}>

        {/* Summary bar */}
        <View style={styles.summary}>
          <Text style={styles.summaryDate}>{formatDisplayDate(date)}</Text>
          <View style={styles.macroRow}>
            <MacroStat label="Calories" val={Math.round(totals.calories)} unit="kcal" color={COLORS.primary} />
            <MacroStat label="Protein"  val={totals.protein.toFixed(1)}   unit="g"    color="#4CC9F0" />
            <MacroStat label="Carbs"    val={totals.carbs.toFixed(1)}     unit="g"    color="#FF9F1C" />
            <MacroStat label="Fat"      val={totals.fat.toFixed(1)}       unit="g"    color="#E63946" />
          </View>
        </View>

        {/* Meal suggestions */}
        <MealSuggestionsCard 
          date={date} 
          onSelectMeal={(meal) => {
            setSelectedFood({ name: meal.name, nutrition: { calories: meal.calories, protein: meal.protein, carbs: meal.carbs, fat: meal.fat } });
            setMealType('snack');
            setShowModal(true);
          }} 
        />

        {/* Meal sections */}
        {mealsByType.map(({ type, items }) => (
          <View key={type} style={styles.mealSection}>
            <View style={styles.mealHeader}>
              <Text style={styles.mealIcon}>{MEAL_ICONS[type]}</Text>
              <Text style={styles.mealTitle}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
              <Text style={styles.mealCal}>
                {Math.round(items.reduce((s, m) => s + m.nutrition.calories, 0))} kcal
              </Text>
              <TouchableOpacity style={styles.addBtn} onPress={() => { setMealType(type); setShowModal(true); }}>
                <Text style={styles.addBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            {items.length === 0
              ? <Text style={styles.emptyText}>No items logged</Text>
              : items.map(meal => (
                <TouchableOpacity key={meal._id} style={styles.mealItem}
                  onLongPress={() => deleteMeal(meal._id)}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.mealName}>{meal.foodName}</Text>
                    <Text style={styles.mealSub}>{meal.quantity}{meal.unit}  ·  P:{meal.nutrition.protein}g  C:{meal.nutrition.carbs}g  F:{meal.nutrition.fat}g</Text>
                  </View>
                  <Text style={styles.mealCalNum}>{Math.round(meal.nutrition.calories)}</Text>
                  <Text style={styles.mealCalUnit}>kcal</Text>
                </TouchableOpacity>
              ))
            }
          </View>
        ))}
        <View style={{ height: SPACING.xxl }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Text style={styles.fabText}>+ Log Food</Text>
      </TouchableOpacity>

      {/* Food Search Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Food</Text>
            <TouchableOpacity onPress={closeModal}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
          </View>

          {/* Meal type picker */}
          <View style={styles.chipRow}>
            {MEAL_TYPES.map(t => (
              <TouchableOpacity key={t} style={[styles.chip, mealType === t && styles.chipActive]}
                onPress={() => setMealType(t)}>
                <Text style={[styles.chipText, mealType === t && styles.chipTextActive]}>
                  {MEAL_ICONS[t]} {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Search */}
          <View style={styles.searchRow}>
            <TextInput style={styles.searchInput} placeholder="Search food (e.g. apple, rice...)"
              placeholderTextColor={COLORS.textMuted} value={searchQ}
              onChangeText={setSearchQ} onSubmitEditing={searchFood} returnKeyType="search" />
            <TouchableOpacity style={styles.searchBtn} onPress={searchFood}>
              {searching ? <ActivityIndicator color={COLORS.white} size="small" /> : <Text style={styles.searchBtnText}>🔍</Text>}
            </TouchableOpacity>
          </View>

          {/* Selected food */}
          {selectedFood && (
            <View style={styles.selectedCard}>
              <Text style={styles.selectedName}>{selectedFood.name}</Text>
              <Text style={styles.selectedBrand}>{selectedFood.brand}</Text>
              <View style={styles.quantityRow}>
                <Text style={styles.label}>Quantity (g):</Text>
                <TextInput style={styles.qtyInput} value={quantity} onChangeText={setQuantity}
                  keyboardType="numeric" />
              </View>
              <View style={styles.nutritionGrid}>
                {[
                  ['Cal', Math.round((selectedFood.nutrition.calories || 0) * (parseFloat(quantity) || 100) / 100), 'kcal'],
                  ['P',   ((selectedFood.nutrition.protein  || 0) * (parseFloat(quantity) || 100) / 100).toFixed(1), 'g'],
                  ['C',   ((selectedFood.nutrition.carbs    || 0) * (parseFloat(quantity) || 100) / 100).toFixed(1), 'g'],
                  ['F',   ((selectedFood.nutrition.fat      || 0) * (parseFloat(quantity) || 100) / 100).toFixed(1), 'g'],
                ].map(([label, val, unit]) => (
                  <View key={label} style={styles.nutriPill}>
                    <Text style={styles.nutriVal}>{val}</Text>
                    <Text style={styles.nutriLabel}>{label} ({unit})</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity style={styles.addMealBtn} onPress={addMeal}>
                <Text style={styles.addMealBtnText}>Add to {mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Results list */}
          <FlatList
            data={searchResults}
            keyExtractor={(item, i) => item.id || String(i)}
            renderItem={({ item }) => (
              <TouchableOpacity style={[styles.resultItem, selectedFood?.id === item.id && styles.resultItemSelected]}
                onPress={() => setSelectedFood(item)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultName}>{item.name}</Text>
                  <Text style={styles.resultBrand}>{item.brand}</Text>
                </View>
                <Text style={styles.resultCal}>{item.nutrition.calories} kcal/100g</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={!searching && searchQ
              ? <Text style={styles.emptyText}>No results. Try a different search term.</Text>
              : <Text style={styles.emptyText}>Search for a food above to log it</Text>
            }
          />
        </View>
      </Modal>
    </View>
  );
}

function MacroStat({ label, val, unit, color }) {
  return (
    <View style={ms.wrap}>
      <Text style={[ms.val, { color }]}>{val}</Text>
      <Text style={ms.unit}>{unit}</Text>
      <Text style={ms.label}>{label}</Text>
    </View>
  );
}
const ms = StyleSheet.create({
  wrap:  { alignItems: 'center', flex: 1 },
  val:   { fontSize: FONTS.sizes.xl, fontWeight: '800' },
  unit:  { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
  label: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
});

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: COLORS.background },
  summary:     { backgroundColor: COLORS.surface, padding: SPACING.md, margin: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border },
  summaryDate: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  macroRow:    { flexDirection: 'row' },
  mealSection: { backgroundColor: COLORS.surface, margin: SPACING.md, marginBottom: 0, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  mealHeader:  { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  mealIcon:    { fontSize: 20, marginRight: SPACING.xs },
  mealTitle:   { flex: 1, fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text },
  mealCal:     { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginRight: SPACING.sm },
  addBtn:      { backgroundColor: COLORS.primary, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  addBtnText:  { color: COLORS.white, fontSize: 18, lineHeight: 22, fontWeight: '700' },
  emptyText:   { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, fontStyle: 'italic', textAlign: 'center', paddingVertical: SPACING.sm },
  mealItem:    { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.xs, borderTopWidth: 1, borderTopColor: COLORS.border },
  mealName:    { fontSize: FONTS.sizes.sm, color: COLORS.text, fontWeight: '600' },
  mealSub:     { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  mealCalNum:  { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.primary },
  mealCalUnit: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginLeft: 2 },
  fab:         { position: 'absolute', bottom: SPACING.lg, right: SPACING.lg, backgroundColor: COLORS.primary, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderRadius: RADIUS.full, elevation: 6 },
  fabText:     { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.md },

  // Modal
  modal:       { flex: 1, backgroundColor: COLORS.background, padding: SPACING.md },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  modalTitle:  { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.text },
  modalClose:  { fontSize: 22, color: COLORS.textSecondary, padding: SPACING.xs },
  chipRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginBottom: SPACING.md },
  chip:        { paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.border },
  chipActive:  { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText:    { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, fontWeight: '600' },
  chipTextActive:{ color: COLORS.white },
  searchRow:   { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  searchInput: { flex: 1, backgroundColor: COLORS.surface2, borderRadius: RADIUS.md, padding: SPACING.md, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, fontSize: FONTS.sizes.md },
  searchBtn:   { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, padding: SPACING.md, justifyContent: 'center', alignItems: 'center', width: 52 },
  searchBtnText:{ fontSize: 20 },
  selectedCard:{ backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.primary },
  selectedName:{ fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text },
  selectedBrand:{ fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  label:       { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, fontWeight: '600' },
  qtyInput:    { backgroundColor: COLORS.surface2, borderRadius: RADIUS.sm, padding: SPACING.sm, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, width: 80, textAlign: 'center' },
  nutritionGrid:{ flexDirection: 'row', gap: SPACING.xs, marginBottom: SPACING.sm },
  nutriPill:   { flex: 1, backgroundColor: COLORS.surface2, borderRadius: RADIUS.sm, padding: SPACING.xs, alignItems: 'center' },
  nutriVal:    { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text },
  nutriLabel:  { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
  addMealBtn:  { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, padding: SPACING.sm, alignItems: 'center' },
  addMealBtnText:{ color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.md },
  resultItem:  { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  resultItemSelected:{ backgroundColor: COLORS.surface2 },
  resultName:  { fontSize: FONTS.sizes.md, color: COLORS.text, fontWeight: '600' },
  resultBrand: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
  resultCal:   { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '700' },
});
