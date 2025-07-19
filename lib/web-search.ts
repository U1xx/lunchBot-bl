// Web検索機能（将来的な拡張用）

export interface SearchResult {
  name: string
  genre?: string
  address?: string
  url?: string
  orderUrl?: string
  rating?: number
  description?: string
}

// 簡易的なWeb検索シミュレーション（実際のAPIは有料のため）
export async function searchRestaurants(query: string, location = "東京"): Promise<SearchResult[]> {
  // 実際の実装では Google Places API、ぐるなび API、食べログ API などを使用
  console.log(`Searching for: ${query} in ${location}`)

  // シミュレーション用のサンプルデータ
  const simulatedResults: SearchResult[] = [
    {
      name: `${location}の人気${query}店`,
      genre: query,
      address: `${location}都内`,
      url: "https://example.com/restaurant1",
      orderUrl: "https://example.com/order1",
      rating: 4.2,
      description: `${location}で人気の${query}専門店`,
    },
    {
      name: `美味しい${query}の店`,
      genre: query,
      address: `${location}都内`,
      url: "https://example.com/restaurant2",
      orderUrl: "https://example.com/order2",
      rating: 4.0,
      description: `地元で愛される${query}店`,
    },
  ]

  // 実際のAPI呼び出しをシミュレート
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return simulatedResults
}

// Google Places API を使用した検索（実装例）
export async function searchWithGooglePlaces(query: string, location: string): Promise<SearchResult[]> {
  // 実際の実装では Google Places API キーが必要
  const apiKey = process.env.GOOGLE_PLACES_API_KEY

  if (!apiKey) {
    console.log("Google Places API key not found, using default data")
    return []
  }

  try {
    // Google Places Text Search API
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query + " " + location)}&key=${apiKey}`

    const response = await fetch(searchUrl)
    const data = await response.json()

    if (data.status !== "OK") {
      console.error("Google Places API error:", data.status)
      return []
    }

    return data.results.map((place: any) => ({
      name: place.name,
      genre: place.types?.[0] || "レストラン",
      address: place.formatted_address,
      url: place.website,
      rating: place.rating,
      description: place.editorial_summary?.overview,
    }))
  } catch (error) {
    console.error("Error searching with Google Places:", error)
    return []
  }
}

// ぐるなび API を使用した検索（実装例）
export async function searchWithGurunavi(query: string, location: string): Promise<SearchResult[]> {
  const apiKey = process.env.GURUNAVI_API_KEY

  if (!apiKey) {
    console.log("Gurunavi API key not found")
    return []
  }

  try {
    // ぐるなび レストラン検索API
    const searchUrl = `https://api.gnavi.co.jp/RestSearchAPI/v3/?keyid=${apiKey}&freeword=${encodeURIComponent(query)}&address=${encodeURIComponent(location)}`

    const response = await fetch(searchUrl)
    const data = await response.json()

    if (!data.rest) {
      return []
    }

    return data.rest.map((restaurant: any) => ({
      name: restaurant.name,
      genre: restaurant.category,
      address: restaurant.address,
      url: restaurant.url,
      description: restaurant.pr?.pr_short,
    }))
  } catch (error) {
    console.error("Error searching with Gurunavi:", error)
    return []
  }
}
