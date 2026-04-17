export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks'

export interface MealEntry {
  id: string
  date: string          // YYYY-MM-DD
  mealType: MealType
  name: string
  kcal: number
  protein: number
  carbs: number
  fat: number
  source: 'openfoodfacts' | 'manual'
  barcode?: string
}

export interface DayLog {
  date: string
  entries: MealEntry[]
  goal: number
}

export interface FoodProduct {
  name: string
  kcalPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
  imageUrl?: string
  barcode?: string
}
