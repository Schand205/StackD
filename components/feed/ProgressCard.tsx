import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { FS, SP } from '@/constants/layout';

// ─── Types ───────────────────────────────────────────────────────────────────

type MacroStat = { readonly current: number; readonly goal: number };

export type GymStats = {
  readonly lastDay: string;
  readonly exercises: number;
  readonly weekDone: number;
  readonly weekGoal: number;
  readonly nextDay: string;
  readonly restDay: boolean;
};

export type StepsStats = {
  today: number;
  goal: number;
  avgLast4Weeks: number;
  suggestionPending: boolean;
  suggestedGoal: number;
};

export type KalorienStats = {
  readonly current: number;
  readonly goal: number;
  readonly protein: MacroStat;
  readonly carbs: MacroStat;
  readonly fat: MacroStat;
  readonly steps: StepsStats;
};

export type ZielItem = {
  readonly label: string;
  readonly value: string;
  readonly status: 'ok' | 'warn';
};

export type ZielCheck = {
  readonly name: string;
  readonly items: readonly ZielItem[];
};

export type WeekDay = { pct: number; isToday: boolean };

export type Props = {
  gym: GymStats;
  kalorien: KalorienStats;
  zielCheck: ZielCheck;
  week: readonly WeekDay[];
  onGymPress?: () => void;
  onKalorienPress?: () => void;
  onZielPress?: () => void;
  onStepsGoalChange?: (newGoal: number) => void;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const WEEK_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

// ─── Main Component ───────────────────────────────────────────────────────────

export function ProgressCard({ gym, kalorien, zielCheck, week, onGymPress, onKalorienPress, onZielPress, onStepsGoalChange }: Props) {
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const { steps } = kalorien;
  const stepPct      = steps.today / steps.goal;
  const stepFill     = Math.min(stepPct, 1);
  const stepBarColor = stepPct > 1.05 ? '#1D9E75' : stepPct >= 0.95 ? '#C0DD97' : stepPct >= 0.7 ? '#AFA9EC' : '#D3D1C7';
  const showBanner   = steps.suggestionPending && !bannerDismissed;

  return (
    <View style={styles.outerCard}>
      <Text style={styles.sectionTitle}>Dein heutiger Stand</Text>

      {/* ── Stat cards — horizontal snap scroll ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={138}
        decelerationRate="fast"
        contentContainerStyle={styles.cardsRow}
      >
        <GymCard gym={gym} onPress={onGymPress} />
        <KalorienCard kal={kalorien} onPress={onKalorienPress} />
        <ZielCheckCard ziel={zielCheck} onPress={onZielPress} />
      </ScrollView>

      {/* ── Week bar ── */}
      <WeekBar week={week} />

      {/* ── Schritte ── */}
      <View style={styles.stepsSection}>
        <Ionicons name="walk-outline" size={12} color={colors.textTertiary} />
        <View style={styles.stepsMiddle}>
          <Text style={styles.stepsLabel}>Schritte heute</Text>
          <View style={styles.stepsBarTrack}>
            <View style={{ flex: stepFill, backgroundColor: stepBarColor, borderRadius: 2 }} />
            <View style={{ flex: 1 - stepFill }} />
          </View>
        </View>
        <Text style={styles.stepsValue}>
          {steps.today.toLocaleString('de-DE')} / {steps.goal.toLocaleString('de-DE')} · Ø {steps.avgLast4Weeks.toLocaleString('de-DE')}
        </Text>
      </View>

      {showBanner && (
        <View style={styles.stepsBanner}>
          <Text style={styles.stepsBannerText} numberOfLines={2}>
            {'Ziel anpassen auf '}{steps.suggestedGoal.toLocaleString('de-DE')}{'? Dein Schnitt liegt bei '}{steps.avgLast4Weeks.toLocaleString('de-DE')}
          </Text>
          <View style={styles.stepsBannerActions}>
            <TouchableOpacity onPress={() => { onStepsGoalChange?.(steps.suggestedGoal); setBannerDismissed(true); }}>
              <Text style={styles.stepsBannerYes}>Ja</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setBannerDismissed(true)}>
              <Text style={styles.stepsBannerNo}>Nein</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Gym Card ────────────────────────────────────────────────────────────────

function GymCard({ gym, onPress }: { gym: GymStats; onPress?: () => void }) {
  const dots = Array.from({ length: gym.weekGoal }, (_, i) => {
    if (i < gym.weekDone) return 'done' as const;
    if (i === gym.weekDone) return 'active' as const;
    return 'empty' as const;
  });

  return (
    <TouchableOpacity style={styles.statCard} onPress={onPress} activeOpacity={onPress ? 0.75 : 1}>
      <Text style={styles.cardLabel}>Gym</Text>
      <View style={styles.gymBadge}>
        <Text style={styles.gymBadgeText}>{gym.restDay ? 'Ruhetag' : 'Training'}</Text>
      </View>
      <Text style={[styles.cardSub, { marginTop: 3 }]}>{gym.lastDay}</Text>
      <Text style={styles.cardValue} numberOfLines={1}>{gym.exercises} Übungen</Text>

      <View style={styles.divider} />

      <Text style={styles.cardSub}>Woche · {gym.weekDone}/{gym.weekGoal}</Text>
      <View style={styles.gymDotsRow}>
        {dots.map((state, i) => (
          <View
            key={i}
            style={[
              styles.gymDot,
              state === 'done'   && styles.gymDotDone,
              state === 'active' && styles.gymDotActive,
              state === 'empty'  && styles.gymDotEmpty,
            ]}
          >
            {state === 'done' && (
              <Ionicons name="checkmark" size={9} color={colors.teal} />
            )}
          </View>
        ))}
      </View>
      <Text style={styles.cardSub}>{gym.nextDay} nächstes</Text>
    </TouchableOpacity>
  );
}

// ─── Kalorien Card ───────────────────────────────────────────────────────────

function KalorienCard({ kal, onPress }: { kal: KalorienStats; onPress?: () => void }) {
  const calPct    = Math.min(kal.current / kal.goal, 1);
  const remaining = kal.goal - kal.current;
  const pPct = Math.min(kal.protein.current / kal.protein.goal, 1);
  const kPct = Math.min(kal.carbs.current / kal.carbs.goal, 1);
  const fPct = Math.min(kal.fat.current / kal.fat.goal, 1);

  return (
    <TouchableOpacity style={styles.statCard} onPress={onPress} activeOpacity={onPress ? 0.75 : 1}>
      <Text style={styles.cardLabel}>Kalorien</Text>
      <Text style={styles.calValue}>{kal.current.toLocaleString('de-DE')}</Text>
      <Text style={styles.calSub}>/ {kal.goal.toLocaleString('de-DE')} kcal</Text>

      {/* Main calorie bar */}
      <View style={styles.barTrack}>
        <View style={{ flex: calPct, backgroundColor: colors.amber, borderRadius: 2 }} />
        <View style={{ flex: 1 - calPct }} />
      </View>

      {/* Makros */}
      <View style={styles.makrosRow}>
        <MacroCol label="P" value={`${kal.protein.current}g`} pct={pPct} barColor={colors.purple} />
        <MacroCol label="K" value={`${kal.carbs.current}g`}   pct={kPct} barColor={colors.amber}  />
        <MacroCol label="F" value={`${kal.fat.current}g`}     pct={fPct} barColor="#5DCAA5"       />
      </View>

      <Text style={[styles.cardSub, { marginTop: 3 }]}>{remaining} kcal übrig</Text>
    </TouchableOpacity>
  );
}

function MacroCol({
  label,
  value,
  pct,
  barColor,
}: {
  label: string;
  value: string;
  pct: number;
  barColor: string;
}) {
  return (
    <View style={styles.macroCol}>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroValue}>{value}</Text>
      <View style={styles.macroTrack}>
        <View style={{ flex: pct, backgroundColor: barColor, borderRadius: 1 }} />
        <View style={{ flex: 1 - pct }} />
      </View>
    </View>
  );
}

// ─── Ziel-Check Card ──────────────────────────────────────────────────────────

function ZielCheckCard({ ziel, onPress }: { ziel: ZielCheck; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.statCard} onPress={onPress} activeOpacity={onPress ? 0.75 : 1}>
      <Text style={styles.cardLabel}>{ziel.name}</Text>
      <View style={styles.zielItems}>
        {ziel.items.map((item, i) => {
          const isOk = item.status === 'ok';
          return (
            <View key={i} style={styles.zielRow}>
              <View
                style={[
                  styles.zielIcon,
                  { backgroundColor: isOk ? colors.tealLight : colors.amberLight },
                ]}
              >
                <Ionicons
                  name={isOk ? 'checkmark' : 'alert'}
                  size={9}
                  color={isOk ? colors.teal : colors.amberDark}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.zielLabel}>{item.label}</Text>
                <Text style={[styles.zielValue, { color: isOk ? colors.teal : colors.amberDark }]}>
                  {item.value}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </TouchableOpacity>
  );
}

// ─── Week Bar ─────────────────────────────────────────────────────────────────

const MAX_BAR_HEIGHT = 22;

function getBarColor(pct: number): string {
  if (pct === 0)              return colors.bgSecondary
  if (pct >= 95 && pct <= 105) return '#C0DD97'
  if (pct < 95)               return '#AFA9EC'
  return '#EF9F27'
}

function WeekBar({ week }: { week: readonly WeekDay[] }) {
  return (
    <View style={styles.weekBar}>
      {week.map(({ pct, isToday }, i) => {
        const fillHeight = Math.round((Math.min(pct, 120) / 120) * MAX_BAR_HEIGHT);
        const fillColor  = getBarColor(pct);

        return (
          <View key={i} style={styles.weekCol}>
            <View style={[styles.weekBlock, isToday && styles.weekBlockToday]}>
              {pct > 0 && (
                <View style={[styles.weekFill, { height: fillHeight, backgroundColor: fillColor }]} />
              )}
            </View>
            <Text style={[styles.weekLabel, isToday && styles.weekLabelToday]}>
              {WEEK_LABELS[i]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  outerCard: {
    marginHorizontal: SP.outer,
    marginBottom: SP.gap * 1.6,
    backgroundColor: colors.bgCard,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: 18,
    padding: SP.card,
  },

  sectionTitle: {
    fontSize: FS.body,
    fontWeight: '700',
    color: colors.gray,
    opacity: 1.0,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: SP.gap * 1.2,
  },

  cardsRow: {
    flexDirection: 'row',
    gap: SP.gap,
    paddingBottom: SP.gap * 2,
  },

  statCard: {
    minWidth: 130,
    backgroundColor: colors.bgSecondary,
    borderRadius: 10,
    padding: SP.gap * 1.4,
    paddingHorizontal: SP.gap * 1.5,
  },

  // Shared card typography
  cardLabel: {
    fontSize: FS.small,
    color: colors.textTertiary,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: FS.small,
    color: colors.textTertiary,
  },
  cardValue: {
    fontSize: FS.large,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: 6,
  },

  // Gym card
  gymBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.bgCard,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginBottom: 2,
  },
  gymBadgeText: {
    fontSize: FS.small,
    color: colors.textSecondary,
  },
  gymDotsRow: {
    flexDirection: 'row',
    gap: 3,
    marginVertical: 4,
  },
  gymDot: {
    width: 14,
    height: 14,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gymDotDone: {
    backgroundColor: colors.tealLight,
  },
  gymDotActive: {
    backgroundColor: colors.purpleLight,
    borderWidth: 1,
    borderColor: colors.purple,
  },
  gymDotEmpty: {
    backgroundColor: colors.bgCard,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },

  // Kalorien card
  calValue: {
    fontSize: FS.large,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 2,
  },
  calSub: {
    fontSize: FS.small,
    color: colors.textTertiary,
    marginBottom: 4,
  },
  barTrack: {
    flexDirection: 'row',
    height: 2.5,
    borderRadius: 2,
    backgroundColor: colors.bgCard,
    overflow: 'hidden',
    marginBottom: 6,
  },
  makrosRow: {
    flexDirection: 'row',
    gap: 4,
  },
  macroCol: {
    flex: 1,
  },
  macroLabel: {
    fontSize: FS.small,
    color: colors.textTertiary,
  },
  macroValue: {
    fontSize: FS.small,
    fontWeight: '500',
    color: colors.textPrimary,
    marginVertical: 2,
  },
  macroTrack: {
    flexDirection: 'row',
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.bgCard,
    overflow: 'hidden',
  },

  // Schritte
  stepsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  stepsMiddle: {
    flex: 1,
    gap: 4,
  },
  stepsLabel: {
    fontSize: 9,
    color: colors.textTertiary,
  },
  stepsValue: {
    fontSize: 9,
    color: colors.textTertiary,
  },
  stepsBarTrack: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.bgSecondary,
    overflow: 'hidden',
  },
  stepsBanner: {
    marginTop: 6,
    backgroundColor: colors.amberLight,
    borderWidth: 0.5,
    borderColor: colors.amberLight,
    borderRadius: 8,
    padding: 5,
    paddingHorizontal: 8,
    gap: 4,
  },
  stepsBannerText: {
    fontSize: 10,
    color: colors.amberDark,
    flex: 1,
  },
  stepsBannerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  stepsBannerYes: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.teal,
  },
  stepsBannerNo: {
    fontSize: 10,
    color: colors.textTertiary,
  },

  // Ziel-Check card
  zielItems: {
    gap: SP.gap,
    marginTop: 4,
  },
  zielRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP.gap,
  },
  zielIcon: {
    width: 14,
    height: 14,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zielLabel: {
    fontSize: FS.small,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  zielValue: {
    fontSize: FS.small,
    marginTop: 1,
  },

  // Week bar
  weekBar: {
    flexDirection: 'row',
    gap: SP.gap * 0.7,
  },
  weekCol: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  weekBlock: {
    width: '100%',
    height: 22,
    borderRadius: 4,
    backgroundColor: colors.bgSecondary,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  weekBlockToday: {
    borderWidth: 1.5,
    borderColor: colors.purple,
  },
  weekFill: {
    width: '100%',
    borderRadius: 4,
  },
  weekLabel: {
    fontSize: 10,
    color: colors.textTertiary,
  },
  weekLabelToday: {
    color: colors.purple,
    fontWeight: '500',
  },
});
