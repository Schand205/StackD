import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { FS, SP } from '@/constants/layout';

export type Friend = {
  id: string;
  initials: string;
  name: string;
  status: string;
  active: boolean;
  ring: 'teal' | 'purple' | null;
};

type Props = { friend: Friend };

export function FriendChip({ friend }: Props) {
  let avatarBg: string = colors.bgSecondary;
  let avatarText: string = colors.textTertiary;
  let avatarBorderColor: string = 'transparent';

  if (friend.ring === 'teal') {
    avatarBg = colors.tealLight;
    avatarText = colors.tealDark;
    avatarBorderColor = colors.teal;
  } else if (friend.ring === 'purple') {
    avatarBg = colors.purpleLight;
    avatarText = colors.purpleDark;
    avatarBorderColor = colors.purple;
  }

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: friend.active ? colors.tealLight : colors.bgCard,
          borderColor: friend.active ? colors.teal : colors.border,
        },
        !friend.active && styles.inactive,
      ]}
    >
      <View
        style={[
          styles.avatar,
          {
            backgroundColor: avatarBg,
            borderColor: avatarBorderColor,
            borderWidth: friend.ring !== null ? 2 : 0,
          },
        ]}
      >
        <Text style={[styles.avatarText, { color: avatarText }]}>
          {friend.initials}
        </Text>
      </View>
      <View>
        <Text style={styles.name}>{friend.name}</Text>
        <Text style={styles.status}>{friend.status}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP.gap * 0.85,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 20,
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 3,
    paddingRight: SP.gap * 1.4,
  },
  inactive: {
    opacity: 0.5,
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: FS.tiny,
    fontWeight: '600',
  },
  name: {
    fontSize: FS.small,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  status: {
    fontSize: FS.tiny,
    color: colors.textTertiary,
    marginTop: 1,
  },
});
