import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { FS } from '@/constants/layout';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

type TabDef = {
  key: string;
  label: string;
  iconActive: IoniconName;
  iconInactive: IoniconName;
};

const TABS: TabDef[] = [
  { key: 'feed',     label: 'Feed',     iconActive: 'sunny',    iconInactive: 'sunny-outline'   },
  { key: 'gym',      label: 'Gym',      iconActive: 'barbell',  iconInactive: 'barbell-outline' },
  { key: 'kalorien', label: 'Kalorien', iconActive: 'time',     iconInactive: 'time-outline'    },
  { key: 'profil',   label: 'Profil',   iconActive: 'person',   iconInactive: 'person-outline'  },
];

type Props = {
  activeTab?: string;
  onTabPress?: (key: string) => void;
};

export function TabBar({ activeTab = 'feed', onTabPress }: Props) {
  const { bottom } = useSafeAreaInsets();
  // use the real inset on notched/home-indicator devices, fallback 12px on flat-bottom Android/Web
  const bottomPadding = bottom > 0 ? bottom : 12;

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      {TABS.map(tab => {
        const isActive = tab.key === activeTab;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onTabPress?.(tab.key)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isActive ? tab.iconActive : tab.iconInactive}
              size={22}
              color={isActive ? colors.purple : colors.textTertiary}
            />
            {isActive && <View style={styles.dot} />}
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: colors.bgCard,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: 8,
    // Rounded bottom corners only on iOS — matches the physical phone frame
    borderBottomLeftRadius: Platform.OS === 'ios' ? 36 : 0,
    borderBottomRightRadius: Platform.OS === 'ios' ? 36 : 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.purple,
  },
  label: {
    fontSize: FS.small,
    color: colors.textTertiary,
  },
  labelActive: {
    color: colors.purpleDark,
    fontWeight: '500',
  },
});
