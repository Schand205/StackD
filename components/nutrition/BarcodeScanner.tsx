import React, { useState, useEffect } from 'react'
import {
  View, Text, TouchableOpacity, ActivityIndicator, StyleSheet,
} from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/constants/colors'
import { FS, SP } from '@/constants/layout'
import { fetchProductByBarcode } from '@/services/openFoodFacts'
import type { FoodProduct } from '@/types/nutrition'

interface Props {
  onClose: () => void
  onProductFound: (product: FoodProduct) => void
}

export function BarcodeScanner({ onClose, onProductFound }: Props) {
  const [permission, requestPermission] = useCameraPermissions()
  const [loading,    setLoading]        = useState(false)
  const [error,      setError]          = useState<string | null>(null)
  const [scanned,    setScanned]        = useState(false)

  useEffect(() => {
    if (!permission?.granted) requestPermission()
  }, [])

  async function handleBarcode({ data }: { data: string }) {
    if (scanned || loading) return
    setScanned(true)
    setLoading(true)
    setError(null)
    const product = await fetchProductByBarcode(data)
    setLoading(false)
    if (product) {
      onProductFound(product)
    } else {
      setError('Produkt nicht gefunden')
      setTimeout(() => { setScanned(false); setError(null) }, 2000)
    }
  }

  if (!permission?.granted) {
    return (
      <View style={styles.permBox}>
        <Text style={styles.permText}>Kamera-Berechtigung erforderlich</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Erlauben</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.root}>
      <CameraView
        style={StyleSheet.absoluteFill}
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8'] }}
        onBarcodeScanned={scanned ? undefined : handleBarcode}
      />

      {/* Dark overlay with cutout illusion */}
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.overlayTop} />
        <View style={styles.overlayRow}>
          <View style={styles.overlaySide} />
          <View style={styles.scanWindow}>
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />
          </View>
          <View style={styles.overlaySide} />
        </View>
        <View style={styles.overlayBottom} />
      </View>

      {/* Close button */}
      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <Ionicons name="close" size={22} color="#fff" />
      </TouchableOpacity>

      {/* Feedback */}
      {loading && (
        <View style={styles.feedback}>
          <ActivityIndicator color="#fff" />
        </View>
      )}
      {error && (
        <View style={styles.feedback}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <Text style={styles.hint}>EAN-Barcode in den Rahmen halten</Text>
    </View>
  )
}

const SCAN_W = 280
const SCAN_H = 160
const CORNER = 18
const CORNER_W = 3

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },

  // Overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  overlayRow: {
    flexDirection: 'row',
    height: SCAN_H,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  scanWindow: {
    width: SCAN_W,
    height: SCAN_H,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },

  // Corner markers
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
    borderColor: colors.purple,
  },
  tl: { top: 0, left: 0,  borderTopWidth: CORNER_W, borderLeftWidth: CORNER_W,  borderTopLeftRadius: 4 },
  tr: { top: 0, right: 0, borderTopWidth: CORNER_W, borderRightWidth: CORNER_W, borderTopRightRadius: 4 },
  bl: { bottom: 0, left: 0,  borderBottomWidth: CORNER_W, borderLeftWidth: CORNER_W,  borderBottomLeftRadius: 4 },
  br: { bottom: 0, right: 0, borderBottomWidth: CORNER_W, borderRightWidth: CORNER_W, borderBottomRightRadius: 4 },

  // Close
  closeBtn: {
    position: 'absolute',
    top: 52,
    left: SP.outer,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Feedback
  feedback: {
    position: 'absolute',
    alignSelf: 'center',
    top: '50%',
    marginTop: -SCAN_H / 2 - 40,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  errorText: {
    color: '#fff',
    fontSize: FS.body,
    fontWeight: '500',
  },

  // Hint
  hint: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    color: 'rgba(255,255,255,0.7)',
    fontSize: FS.small,
  },

  // Permission
  permBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: SP.outer,
  },
  permText: {
    fontSize: FS.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  permBtn: {
    backgroundColor: colors.purple,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  permBtnText: {
    color: '#fff',
    fontSize: FS.body,
    fontWeight: '600',
  },
})
