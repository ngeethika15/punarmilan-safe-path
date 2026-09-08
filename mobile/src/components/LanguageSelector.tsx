import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Language, useLanguage } from '../context/LanguageContext';

const languages: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
];

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <View style={styles.container}>
      {languages.map((item) => {
        const selected = language === item.code;

        return (
          <Pressable
            key={item.code}
            onPress={() => setLanguage(item.code)}
            style={[
              styles.button,
              selected && styles.selectedButton,
            ]}
          >
            <Text
              style={[
                styles.text,
                selected && styles.selectedText,
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 4,
    borderRadius: 10,
    backgroundColor: '#0F172A',
  },

  button: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 7,
  },

  selectedButton: {
    backgroundColor: '#38BDF8',
  },

  text: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },

  selectedText: {
    color: '#0F172A',
  },
});