import React, { useMemo, useState } from 'react'
import { View } from 'react-native'
import Svg, {
  G,
  Line as SvgLine,
  Path,
  Circle,
  Text as SvgText,
} from 'react-native-svg'
import { colors as appColors } from '@/constants/colors'

// ─── Types ───────────────────────────────────────────────────────────────────

type SeriesPoint = { date: string; value: number }

type Props = {
  data: SeriesPoint[][]
  colors: string[]
  showGoalLine?: boolean
  goalSlope?: 'up' | 'down'
  height?: number
}

// ─── Layout constants ────────────────────────────────────────────────────────

const M = { top: 12, right: 16, bottom: 26, left: 36 }
const GRID_COUNT = 4

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatLabel(date: string): string {
  const [, m, d] = date.split('-')
  return `${d}.${m}`
}

function niceRange(min: number, max: number) {
  const raw = max - min || 10
  // Pad 10 % on each side so dots aren't clipped
  const pad = raw * 0.15
  return { lo: min - pad, hi: max + pad }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LineChart({
  data,
  colors,
  showGoalLine = false,
  goalSlope = 'up',
  height = 180,
}: Props) {
  const [svgWidth, setSvgWidth] = useState(0)

  const chart = useMemo(() => {
    const allValues = data.flatMap(s => s.map(p => p.value))
    if (svgWidth === 0 || allValues.length === 0) return null

    const iW = svgWidth - M.left - M.right
    const iH = height - M.top - M.bottom

    // All unique dates across all series, sorted
    const allDates = [...new Set(data.flatMap(s => s.map(p => p.date)))].sort()
    const n = allDates.length

    const rawMin = Math.min(...allValues)
    const rawMax = Math.max(...allValues)
    const { lo, hi } = niceRange(rawMin, rawMax)
    const valRange = hi - lo

    // Scale fns (clamped to inner box)
    const xOf = (idx: number) => (n <= 1 ? iW / 2 : (idx / (n - 1)) * iW)
    const yOf = (val: number) => iH - ((val - lo) / valRange) * iH

    // ── Grid ──────────────────────────────────────────────────────────────────

    const gridLines = Array.from({ length: GRID_COUNT + 1 }, (_, i) => {
      const val = lo + (i / GRID_COUNT) * valRange
      return {
        y: yOf(val),
        label: Number.isInteger(val) ? String(Math.round(val)) : val.toFixed(1),
      }
    })

    // ── X labels (every 2nd date, always last) ────────────────────────────────

    const xLabels = allDates
      .map((date, i) => ({ date, i }))
      .filter(({ i }) => i % 2 === 0 || i === n - 1)
      .map(({ date, i }) => ({ x: xOf(i), label: formatLabel(date) }))

    // ── Series paths + last-point dots ───────────────────────────────────────

    const series = data.map((pts, si) => {
      const mapped = pts
        .map(p => {
          const idx = allDates.indexOf(p.date)
          return idx >= 0 ? { px: xOf(idx), py: yOf(p.value) } : null
        })
        .filter(Boolean) as { px: number; py: number }[]

      const d = mapped.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.px},${p.py}`).join(' ')
      const last = mapped[mapped.length - 1] ?? null
      return { d, last, color: colors[si] ?? '#888' }
    })

    // ── Goal line: first point of first series → projected end ───────────────

    let goalD: string | null = null
    if (showGoalLine && data[0]?.length > 0) {
      const first = data[0][0]
      const firstIdx = allDates.indexOf(first.date)
      const x1 = xOf(firstIdx)
      const y1 = yOf(first.value)
      const x2 = xOf(n - 1)
      // Project ~25 % of value range in the desired direction
      const delta = valRange * 0.25 * (goalSlope === 'up' ? 1 : -1)
      const y2 = yOf(first.value + delta)
      goalD = `M${x1},${y1} L${x2},${y2}`
    }

    return { iW, iH, gridLines, xLabels, series, goalD }
  }, [svgWidth, data, colors, showGoalLine, goalSlope, height])

  return (
    <View
      style={{ height }}
      onLayout={e => setSvgWidth(e.nativeEvent.layout.width)}
    >
      {chart !== null && svgWidth > 0 && (
        <Svg width={svgWidth} height={height}>
          <G x={M.left} y={M.top}>

            {/* ── Grid lines + Y labels ── */}
            {chart.gridLines.map((gl, i) => (
              <G key={i}>
                <SvgLine
                  x1={0} y1={gl.y} x2={chart.iW} y2={gl.y}
                  stroke={appColors.border} strokeWidth={0.5}
                />
                <SvgText
                  x={-5} y={gl.y + 3.5}
                  fontSize={9} fill={appColors.textTertiary}
                  textAnchor="end"
                >
                  {gl.label}
                </SvgText>
              </G>
            ))}

            {/* ── X labels ── */}
            {chart.xLabels.map((xl, i) => (
              <SvgText
                key={i}
                x={xl.x} y={chart.iH + 18}
                fontSize={9} fill={appColors.textTertiary}
                textAnchor="middle"
              >
                {xl.label}
              </SvgText>
            ))}

            {/* ── Goal line (dashed green) ── */}
            {chart.goalD && (
              <Path
                d={chart.goalD}
                stroke="#1D9E75"
                strokeWidth={1.5}
                strokeDasharray="5,3"
                fill="none"
                opacity={0.65}
              />
            )}

            {/* ── Data lines + last-point dot ── */}
            {chart.series.map((s, i) => (
              <G key={i}>
                <Path
                  d={s.d}
                  stroke={s.color}
                  strokeWidth={2}
                  fill="none"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {s.last && (
                  <Circle
                    cx={s.last.px}
                    cy={s.last.py}
                    r={3.5}
                    fill={s.color}
                  />
                )}
              </G>
            ))}

          </G>
        </Svg>
      )}
    </View>
  )
}
