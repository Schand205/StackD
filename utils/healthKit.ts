import { Platform } from 'react-native'
import { mockStats } from '@/constants/mockData'

export const getTodaySteps = async (): Promise<number> => {
  if (Platform.OS === 'ios') {
    // TODO: react-native-health
    // const steps = await AppleHealthKit.getStepCount({
    //   date: new Date().toISOString(),
    //   includeManuallyAdded: false,
    // })
    // return steps.value
  }

  if (Platform.OS === 'android') {
    // TODO: react-native-health-connect
    // const result = await getHealthConnectData('Steps', {
    //   startTime: startOfDay.toISOString(),
    //   endTime:   new Date().toISOString(),
    // })
    // return result.COUNT_TOTAL ?? 0
  }

  // Fallback: Mock-Daten
  return mockStats.steps.today
}

export const getAvgStepsLast4Weeks = async (): Promise<number> => {
  // TODO: echte Berechnung aus Apple Health / Health Connect
  // Woche für Woche die Tagesdurchschnitte abrufen und mitteln
  return mockStats.steps.avgLast4Weeks
}
