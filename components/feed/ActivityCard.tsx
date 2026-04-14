import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { FS, SP } from '@/constants/layout';

export type Activity = {
  id: string;
  user: { initials: string; name: string; color: string };
  time: string;
  type: 'gym' | 'kalorien';
  title: string;
  pr: boolean;
  pills: readonly string[];
  likes: number;
  comments: number;
};

type Props = {
  activity: Activity;
  onPress?: () => void;
};

export function ActivityCard({ activity, onPress }: Props) {
  const [liked, setLiked] = useState(false);

  const isGym = activity.type === 'gym';

  const avatarColors =
    activity.user.color === 'purple'
      ? { bg: colors.purpleLight, text: colors.purpleDark }
      : activity.user.color === 'teal'
      ? { bg: colors.tealLight, text: colors.tealDark }
      : { bg: colors.amberLight, text: colors.amberDark };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: avatarColors.bg }]}>
          <Text style={[styles.avatarText, { color: avatarColors.text }]}>
            {activity.user.initials}
          </Text>
        </View>
        <View style={styles.headerMeta}>
          <Text style={styles.userName}>{activity.user.name}</Text>
          <Text style={styles.time}>{activity.time}</Text>
        </View>
        <View
          style={[
            styles.typeBadge,
            { backgroundColor: isGym ? colors.purpleLight : colors.tealLight },
          ]}
        >
          <Text
            style={[
              styles.typeBadgeText,
              { color: isGym ? colors.purpleDark : colors.tealDark },
            ]}
          >
            {isGym ? 'Gym' : 'Kalorien'}
          </Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.title}>{activity.title}</Text>
        {activity.pr && (
          <View style={styles.prBadge}>
            <Text style={styles.prBadgeText}>PR</Text>
          </View>
        )}
      </View>

      {/* Pills */}
      <View style={styles.pills}>
        {activity.pills.map((pill, i) => (
          <View key={i} style={styles.pill}>
            <Text style={styles.pillText}>{pill}</Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.reactionBtn, liked && styles.reactionBtnLiked]}
          onPress={() => setLiked(v => !v)}
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={11}
            color={liked ? colors.purpleDark : colors.textTertiary}
          />
          <Text style={[styles.reactionText, liked && styles.reactionTextLiked]}>
            {activity.likes + (liked ? 1 : 0)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.reactionBtn}>
          <Ionicons name="chatbubble-outline" size={11} color={colors.textTertiary} />
          <Text style={styles.reactionText}>{activity.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.reactionBtn}>
          <Text style={styles.reactionText}>Kommentieren →</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SP.outer,
    marginBottom: SP.gap * 1.6,
    backgroundColor: colors.bgCard,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: SP.card * 0.86,
    paddingHorizontal: SP.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP.gap * 1.4,
    marginBottom: SP.gap * 1.4,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: FS.small,
    fontWeight: '600',
  },
  headerMeta: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  time: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 1,
  },
  typeBadge: {
    paddingHorizontal: SP.gap * 1.4,
    paddingVertical: 3,
    borderRadius: 20,
  },
  typeBadgeText: {
    fontSize: FS.tiny,
    fontWeight: '500',
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP.gap,
    marginBottom: SP.gap * 1.4,
  },
  title: {
    fontSize: FS.body,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  prBadge: {
    backgroundColor: colors.tealLight,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  prBadgeText: {
    fontSize: FS.tiny,
    fontWeight: '600',
    color: colors.tealDark,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SP.gap * 0.7,
    marginBottom: SP.gap * 1.4,
  },
  pill: {
    backgroundColor: colors.bgSecondary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: SP.gap,
    paddingVertical: 2,
  },
  pillText: {
    fontSize: FS.small,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP.gap,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: SP.gap * 1.2,
  },
  reactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.bgSecondary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: SP.gap * 1.4,
    paddingVertical: 2,
  },
  reactionBtnLiked: {
    backgroundColor: colors.purpleLight,
    borderColor: colors.purpleLight,
  },
  reactionText: {
    fontSize: FS.small,
    color: colors.textTertiary,
  },
  reactionTextLiked: {
    color: colors.purpleDark,
  },
});
