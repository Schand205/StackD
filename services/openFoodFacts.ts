import type { FoodProduct } from '@/types/nutrition'

const BASE = 'https://world.openfoodfacts.org'

function mapProduct(raw: any, barcode?: string): FoodProduct | null {
  const n = raw?.nutriments
  const name = raw?.product_name?.trim()
  if (!name) return null
  return {
    name,
    kcalPer100g:     Number(n?.['energy-kcal_100g']  ?? n?.['energy-kcal'] ?? 0),
    proteinPer100g:  Number(n?.proteins_100g          ?? n?.proteins        ?? 0),
    carbsPer100g:    Number(n?.carbohydrates_100g      ?? n?.carbohydrates   ?? 0),
    fatPer100g:      Number(n?.fat_100g               ?? n?.fat             ?? 0),
    imageUrl:        raw?.image_url ?? raw?.image_front_url,
    barcode,
  }
}

export async function fetchProductByBarcode(ean: string): Promise<FoodProduct | null> {
  try {
    const res = await fetch(`${BASE}/api/v0/product/${ean}.json`)
    const data = await res.json()
    if (data?.status !== 1 || !data?.product) return null
    return mapProduct(data.product, ean)
  } catch {
    return null
  }
}

export async function fetchSearchResults(query: string): Promise<FoodProduct[]> {
  if (!query.trim()) return []
  try {
    const params = new URLSearchParams({
      search_terms: query,
      json:         '1',
      page_size:    '20',
      fields:       'product_name,nutriments,image_url,image_front_url',
    })
    const res  = await fetch(`${BASE}/cgi/search.pl?${params}`)
    const data = await res.json()
    return (data?.products ?? [])
      .map((p: any) => mapProduct(p))
      .filter(Boolean) as FoodProduct[]
  } catch {
    return []
  }
}
