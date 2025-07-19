// 事前定義されたレストランデータ
// 福井県に店舗があるチェーン店のみ

export interface RestaurantData {
  name: string
  genre: string
  address: string
  url?: string
  orderUrl?: string
  phone?: string
  description?: string
}

// 福井県に店舗があるチェーン店データ
export const defaultRestaurants: RestaurantData[] = [
  {
    name: "松屋",
    genre: "牛丼・定食",
    address: "福井市、敦賀市など",
    url: "https://www.matsuyafoods.co.jp/",
    orderUrl: "https://www.matsuyafoods.co.jp/menu/",
    description: "手軽な牛丼チェーン",
  },
  {
    name: "すき家",
    genre: "牛丼・カレー",
    address: "福井市、敦賀市、越前市など",
    url: "https://www.sukiya.jp/",
    orderUrl: "https://www.sukiya.jp/menu/",
    description: "24時間営業の牛丼チェーン",
  },
  {
    name: "吉野家",
    genre: "牛丼・定食",
    address: "福井市、敦賀市など",
    url: "https://www.yoshinoya.com/",
    orderUrl: "https://www.yoshinoya.com/menu/",
    description: "老舗牛丼チェーン",
  },
  {
    name: "なか卯",
    genre: "うどん・親子丼",
    address: "福井市、敦賀市など",
    url: "https://www.nakau.co.jp/",
    orderUrl: "https://www.nakau.co.jp/menu/",
    description: "うどんと丼物の専門店",
  },
  {
    name: "ガスト",
    genre: "ファミリーレストラン",
    address: "福井市、敦賀市、越前市など",
    url: "https://www.skylark.co.jp/gusto/",
    orderUrl: "https://www.skylark.co.jp/gusto/menu/",
    description: "手頃な価格のファミレス",
  },
  {
    name: "サイゼリヤ",
    genre: "イタリアン",
    address: "福井市、敦賀市など",
    url: "https://www.saizeriya.co.jp/",
    orderUrl: "https://www.saizeriya.co.jp/menu/",
    description: "リーズナブルなイタリアンレストラン",
  },
  {
    name: "ココイチ",
    genre: "カレー",
    address: "福井市、敦賀市、越前市など",
    url: "https://www.ichibanya.co.jp/",
    orderUrl: "https://www.ichibanya.co.jp/menu/",
    description: "カレーハウスCoCo壱番屋",
  },
  {
    name: "丸亀製麺",
    genre: "うどん",
    address: "福井市、敦賀市など",
    url: "https://www.marugame-seimen.com/",
    orderUrl: "https://www.marugame-seimen.com/menu/",
    description: "讃岐うどんの専門店",
  },
  {
    name: "はなまるうどん",
    genre: "うどん",
    address: "福井市など",
    url: "https://www.hanamaruudon.com/",
    orderUrl: "https://www.hanamaruudon.com/menu/",
    description: "セルフサービスのうどん店",
  },
  {
    name: "ケンタッキー",
    genre: "フライドチキン",
    address: "福井市、敦賀市、越前市など",
    url: "https://www.kfc.co.jp/",
    orderUrl: "https://www.kfc.co.jp/menu/",
    description: "フライドチキンの専門店",
  },
  {
    name: "マクドナルド",
    genre: "ハンバーガー",
    address: "福井市、敦賀市、越前市、鯖江市など",
    url: "https://www.mcdonalds.co.jp/",
    orderUrl: "https://www.mcdonalds.co.jp/menu/",
    description: "世界的なハンバーガーチェーン",
  },
  {
    name: "モスバーガー",
    genre: "ハンバーガー",
    address: "福井市、敦賀市など",
    url: "https://www.mos.jp/",
    orderUrl: "https://www.mos.jp/menu/",
    description: "日本発のハンバーガーチェーン",
  },
  {
    name: "餃子の王将",
    genre: "中華料理",
    address: "福井市、敦賀市、越前市など",
    url: "https://www.ohsho.co.jp/",
    orderUrl: "https://www.ohsho.co.jp/menu/",
    description: "餃子と中華料理の専門店",
  },
  {
    name: "リンガーハット",
    genre: "ちゃんぽん",
    address: "福井市、敦賀市など",
    url: "https://www.ringerhut.jp/",
    orderUrl: "https://www.ringerhut.jp/menu/",
    description: "長崎ちゃんぽんの専門店",
  },
  {
    name: "一風堂",
    genre: "ラーメン",
    address: "福井市など",
    url: "https://www.ippudo.com/",
    orderUrl: "https://www.ippudo.com/menu/",
    description: "博多とんこつラーメンの専門店",
  },
  {
    name: "スターバックス",
    genre: "カフェ",
    address: "福井市、敦賀市、越前市など",
    url: "https://www.starbucks.co.jp/",
    orderUrl: "https://www.starbucks.co.jp/menu/",
    description: "世界的なコーヒーチェーン",
  },
  {
    name: "ドトール",
    genre: "カフェ",
    address: "福井市、敦賀市など",
    url: "https://www.doutor.co.jp/",
    orderUrl: "https://www.doutor.co.jp/menu/",
    description: "手頃な価格のコーヒーチェーン",
  },
  {
    name: "コメダ珈琲店",
    genre: "カフェ",
    address: "福井市、敦賀市、越前市など",
    url: "https://www.komeda.co.jp/",
    orderUrl: "https://www.komeda.co.jp/menu/",
    description: "名古屋発祥の喫茶店チェーン",
  },
  {
    name: "びっくりドンキー",
    genre: "ハンバーグ",
    address: "福井市、敦賀市、越前市など",
    url: "https://www.bikkuri-donkey.com/",
    orderUrl: "https://www.bikkuri-donkey.com/menu/",
    description: "ハンバーグレストランチェーン",
  },
  {
    name: "かっぱ寿司",
    genre: "回転寿司",
    address: "福井市、敦賀市、越前市など",
    url: "https://www.kappasushi.jp/",
    orderUrl: "https://www.kappasushi.jp/menu/",
    description: "リーズナブルな回転寿司チェーン",
  },
]

// 福井県の地域別・ローカルチェーン店
export const regionalRestaurants: { [region: string]: RestaurantData[] } = {
  fukui: [
    {
      name: "8番らーめん",
      genre: "ラーメン",
      address: "福井県内各所",
      url: "https://www.hachiban.jp/",
      orderUrl: "https://www.hachiban.jp/menu/",
      description: "北陸発祥の野菜らーめんチェーン",
    },
    {
      name: "ヨーロッパ軒",
      genre: "洋食",
      address: "福井市、敦賀市など",
      url: "https://www.europe-ken.com/",
      description: "福井名物ソースカツ丼の老舗",
    },
    {
      name: "秋吉",
      genre: "焼き鳥",
      address: "福井県内各所",
      url: "https://www.akiyoshi.co.jp/",
      description: "福井発祥の焼き鳥チェーン",
    },
    {
      name: "とんかつ政ちゃん",
      genre: "とんかつ",
      address: "福井市、敦賀市など",
      description: "福井で愛されるとんかつ店",
    },
    {
      name: "らーめん神月",
      genre: "ラーメン",
      address: "福井市など",
      description: "福井の人気ラーメン店",
    },
    {
      name: "福そば",
      genre: "そば・うどん",
      address: "福井県内各所",
      description: "福井のそば・うどんチェーン",
    },
    {
      name: "越前そば",
      genre: "そば",
      address: "福井県内各所",
      description: "福井名物越前そばの専門店",
    },
    {
      name: "若狭家",
      genre: "海鮮・定食",
      address: "敦賀市、小浜市など",
      description: "若狭湾の新鮮な海鮮料理",
    },
  ],
}

// デフォルト設定
export const restaurantConfig = {
  useGoogleSheets: true, // Google Sheetsを使用するかどうか
  useDefaultData: true, // デフォルトデータを使用するかどうか
  region: "fukui", // 福井県に変更
  mixRatio: 0.7, // Google Sheetsとデフォルトデータの混合比率（0.7 = 70%がSheets、30%がデフォルト）
}
