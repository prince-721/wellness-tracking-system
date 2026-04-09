import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, FlatList, Switch, Alert, TextInput
} from 'react-native';
import { remindersAPI } from '../services/api';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';

export function RemindersModal({ visible, onClose }) {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'water',
    title: '',
    time: '09:00',
    enabled: true
  });

  useEffect(() => {
    if (visible) loadReminders();
  }, [visible]);

  const loadReminders = async () => {
    setLoading(true);
    try {
      const res = await remindersAPI.getAll();
      setReminders(res.data.reminders || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReminder = async () => {
    if (!formData.title) {
      Alert.alert('Missing', 'Please enter a reminder title');
      return;
    }

    try {
      await remindersAPI.create(formData);
      setFormData({ type: 'water', title: '', time: '09:00', enabled: true });
      setShowForm(false);
      loadReminders();
      Alert.alert('Success', 'Reminder created');
    } catch (e) {
      Alert.alert('Error', 'Failed to create reminder');
    }
  };

  const toggleReminder = async (id, currentStatus) => {
    try {
      await remindersAPI.toggle(id);
      loadReminders();
    } catch (e) {
      Alert.alert('Error', 'Failed to toggle reminder');
    }
  };

  const deleteReminder = async (id) => {
    try {
      await remindersAPI.delete(id);
      loadReminders();
    } catch (e) {
      Alert.alert('Error', 'Failed to delete reminder');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Reminders</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeBtn}>✕</Text>
          </TouchableOpacity>
        </View>

        {!showForm ? (
          <>
            {reminders.length > 0 && (
              <FlatList
                data={reminders}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <View style={styles.reminderItem}>
                    <View style={styles.reminderInfo}>
                      <Text style={styles.reminderTitle}>{item.title}</Text>
                      <Text style={styles.reminderTime}>{item.time}</Text>
                      <View style={styles.reminderTypeBadge}>
                        <Text style={styles.reminderTypeText}>{item.type}</Text>
                      </View>
                    </View>
                    <View style={styles.reminderActions}>
                      <Switch
                        value={item.enabled}
                        onValueChange={() => toggleReminder(item._id, item.enabled)}
                        trackColor={{ false: COLORS.border, true: COLORS.primary }}
                      />
                      <TouchableOpacity
                        onPress={() => deleteReminder(item._id)}
                        style={styles.deleteBtn}
                      >
                        <Text style={styles.deleteIcon}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            )}
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowForm(true)}
            >
              <Text style={styles.addIcon}>+</Text>
              <Text style={styles.addText}>Add Reminder</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.formContainer}>
            <Text style={styles.formLabel}>Reminder Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Drink water"
              placeholderTextColor={COLORS.textMuted}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />

            <Text style={styles.formLabel}>Time</Text>
            <TextInput
              style={styles.input}
              placeholder="HH:MM"
              placeholderTextColor={COLORS.textMuted}
              value={formData.time}
              onChangeText={(text) => setFormData({ ...formData, time: text })}
            />

            <Text style={styles.formLabel}>Type</Text>
            <View style={styles.typeButtonGroup}>
              {['water', 'meal', 'workout', 'weight_check'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    formData.type === type && styles.typeButtonActive
                  ]}
                  onPress={() => setFormData({ ...formData, type })}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      formData.type === type && styles.typeButtonTextActive
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.formButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowForm(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddReminder}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  reminderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLightest
  },
  reminderInfo: {
    flex: 1
  },
  reminderTitle: {
    ...FONTS.semibold,
    fontSize: FONTS.sizes.md,
    color: COLORS.text
  },
  reminderTime: {
    ...FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    marginTop: 2
  },
  reminderTypeBadge: {
    marginTop: SPACING.xs,
    backgroundColor: COLORS.surfaceLightest,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start'
  },
  reminderTypeText: {
    ...FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.text
  },
  reminderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md
  },
  deleteBtn: {
    padding: SPACING.sm
  },
  deleteIcon: {
    fontSize: 18
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.md,
    marginHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md
  },
  addIcon: {
    fontSize: 24,
    color: COLORS.white,
    marginRight: SPACING.sm
  },
  addText: {
    ...FONTS.semibold,
    fontSize: FONTS.sizes.md,
    color: COLORS.white
  },
  formContainer: {
    flex: 1,
    padding: SPACING.md
  },
  formLabel: {
    ...FONTS.semibold,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.sizes.md,
    color: COLORS.text
  },
  typeButtonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm
  },
  typeButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.white
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  typeButtonText: {
    ...FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text
  },
  typeButtonTextActive: {
    color: COLORS.white
  },
  formButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    alignItems: 'center'
  },
  cancelText: {
    ...FONTS.semibold,
    fontSize: FONTS.sizes.md,
    color: COLORS.text
  },
  saveBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    alignItems: 'center'
  },
  saveText: {
    ...FONTS.semibold,
    fontSize: FONTS.sizes.md,
    color: COLORS.white
  }
});
