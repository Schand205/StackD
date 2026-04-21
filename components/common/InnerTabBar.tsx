import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { colors } from '@/constants/colors'
import { SP } from '@/constants/layout'

type Tab = { key: string; label: string }

type Props = {
  tabs: Tab[]
  activeTab: string
  onTabChange: (key: string) => void
}

export function InnerTabBar({ tabs, activeTab, onTabChange }: Props) {
  return (
    <View style={styles.container}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && styles.tabActive]}
          onPress={() => onTabChange(tab.key)}
          activeOpacity={0.75}
        >
          <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    marginHorizontal: SP.outer,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -0.5,
  },
  tabActive: {
    borderBottomColor: colors.purple,
  },
  tabText: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  tabTextActive: {
    color: colors.purpleDark,
    fontWeight: '500',
  },
})
