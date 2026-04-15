import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FS, SP } from '@/constants/layout';

// ─── Design Tokens ────────────────────────────────────────────────────────────

const AMBER_BG     = 'rgba(186,117,23,0.10)';
const AMBER_BORDER = 'rgba(186,117,23,0.35)';
const AMBER_TEXT   = '#ba7517';
const AMBER_ICON   = '#d48a20';

// ─── Constants ────────────────────────────────────────────────────────────────

const VISIBLE_MS  = 3000;
const FADE_OUT_MS =  400;
const FADE_IN_MS  =  220;

// ─── Types ────────────────────────────────────────────────────────────────────

export type Props = {
  visible: boolean;
  exerciseName: string;
  weight: number;
  onHide: () => void;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtWeight(w: number): string {
  return w % 1 === 0 ? `${w}` : w.toFixed(1);
}

// ─── PRToast ──────────────────────────────────────────────────────────────────

export function PRToast({ visible, exerciseName, weight, onHide }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clear any in-flight timer
    if (hideTimer.current) clearTimeout(hideTimer.current);

    if (visible) {
      // Fade in immediately
      Animated.timing(opacity, {
        toValue: 1,
        duration: FADE_IN_MS,
        useNativeDriver: true,
      }).start();

      // Schedule fade-out after VISIBLE_MS
      hideTimer.current = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: FADE_OUT_MS,
          useNativeDriver: true,
        }).start(() => onHide());
      }, VISIBLE_MS);
    } else {
      // Snap hidden when visible flips to false externally
      opacity.setValue(0);
    }

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null;

  return (
    <Animated.View style={[styles.toast, { opacity }]}>
      <View style={styles.iconWrap}>
        <Ionicons name="star" size={15} color={AMBER_ICON} />
      </View>
      <View style={styles.textCol}>
        <Text style={styles.headline}>Persönlicher Rekord!</Text>
        <Text style={styles.detail} numberOfLines={1}>
          {exerciseName}: {fmtWeight(weight)} kg
        </Text>
      </View>
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  toast: {
    marginHorizontal: SP.outer,
    marginBottom: SP.gap * 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP.gap * 1.5,
    backgroundColor: AMBER_BG,
    borderWidth: 0.5,
    borderColor: AMBER_BORDER,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: SP.card,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(186,117,23,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  headline: {
    fontSize: FS.small,
    fontWeight: '600',
    color: AMBER_TEXT,
  },
  detail: {
    fontSize: FS.small,
    color: AMBER_TEXT,
    opacity: 0.75,
  },
});
