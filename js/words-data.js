// js/words-data.js
// タイピングゲーム お題データ
// file:// プロトコルでも動作するよう、グローバル変数として定義
// JSON 版 (words-data.json) は参照用。実際の読み込みはこのファイルを使用。

const WORDS_DATA = {

  // ===== コードモード =====
  code: {

    javascript: {
      easy: [
        { id: "js-e-1", text: "console.log('Hello!');",            label: "コンソール出力" },
        { id: "js-e-2", text: "const name = 'enU';",               label: "変数宣言" },
        { id: "js-e-3", text: "let count = 0;",                    label: "カウンター" },
        { id: "js-e-4", text: "const arr = [];",                   label: "空配列" },
        { id: "js-e-5", text: "return true;",                      label: "返り値" },
        { id: "js-e-6", text: "const PI = 3.14159;",               label: "定数" },
        { id: "js-e-7", text: "typeof value === 'string'",         label: "型チェック" },
      ],
      medium: [
        { id: "js-m-1", text: "function add(a, b) { return a + b; }", label: "加算関数" },
        { id: "js-m-2", text: "const items = [1, 2, 3, 4, 5];",       label: "配列定義" },
        { id: "js-m-3", text: "arr.forEach(item => console.log(item));", label: "forEach" },
        { id: "js-m-4", text: "const greet = name => `Hello, ${name}!`;", label: "テンプレートリテラル" },
        { id: "js-m-5", text: "if (x === null) return false;",         label: "null チェック" },
        { id: "js-m-6", text: "Object.keys(obj).forEach(k => { });",   label: "オブジェクト操作" },
        { id: "js-m-7", text: "const clone = { ...original };",        label: "スプレッド" },
      ],
      hard: [
        { id: "js-h-1", text: "const sum = arr.reduce((acc, v) => acc + v, 0);",                    label: "reduce" },
        { id: "js-h-2", text: "fetch('/api').then(r => r.json()).then(d => console.log(d));",        label: "Fetch API" },
        { id: "js-h-3", text: "const { name, age = 0 } = user ?? {};",                              label: "分割代入" },
        { id: "js-h-4", text: "const unique = [...new Set(array)];",                                label: "重複排除" },
        { id: "js-h-5", text: "Promise.all([fetch('/a'), fetch('/b')]).then(([a, b]) => { });",     label: "並列リクエスト" },
        { id: "js-h-6", text: "const debounce = (fn, t) => { let id; return (...a) => { clearTimeout(id); id = setTimeout(() => fn(...a), t); }; };", label: "デバウンス" },
      ]
    },

    python: {
      easy: [
        { id: "py-e-1", text: 'print("Hello, World!")',         label: "出力" },
        { id: "py-e-2", text: "x = 10",                         label: "代入" },
        { id: "py-e-3", text: "for i in range(5):",             label: "ループ" },
        { id: "py-e-4", text: "return None",                    label: "None返却" },
        { id: "py-e-5", text: "import os",                      label: "インポート" },
        { id: "py-e-6", text: "name = input('Name: ')",         label: "入力" },
      ],
      medium: [
        { id: "py-m-1", text: "def greet(name): return f'Hello, {name}!'",         label: "関数定義" },
        { id: "py-m-2", text: "items = [x ** 2 for x in range(10)]",               label: "リスト内包" },
        { id: "py-m-3", text: "with open('file.txt') as f: data = f.read()",       label: "ファイル読込" },
        { id: "py-m-4", text: "if __name__ == '__main__': main()",                 label: "エントリポイント" },
        { id: "py-m-5", text: "data = {k: v for k, v in pairs.items()}",           label: "dict内包" },
        { id: "py-m-6", text: "try:\n    risky()\nexcept Exception as e:\n    print(e)", label: "例外処理" },
      ],
      hard: [
        { id: "py-h-1", text: "result = sorted(data, key=lambda x: x['score'], reverse=True)",        label: "ソート" },
        { id: "py-h-2", text: "@app.route('/api', methods=['GET', 'POST'])",                           label: "Flaskルート" },
        { id: "py-h-3", text: "async def fetch(url):\n    async with session.get(url) as r:\n        return await r.json()", label: "非同期" },
        { id: "py-h-4", text: "df.groupby('category').agg({'value': ['mean', 'sum']})",               label: "pandas集計" },
      ]
    },

    html: {
      easy: [
        { id: "html-e-1", text: "<h1>Hello, World!</h1>",              label: "見出し" },
        { id: "html-e-2", text: '<p class="intro">テキスト</p>',       label: "段落" },
        { id: "html-e-3", text: '<div id="app"></div>',                label: "div" },
        { id: "html-e-4", text: "<ul><li>項目</li></ul>",              label: "リスト" },
        { id: "html-e-5", text: "<br />",                              label: "改行" },
      ],
      medium: [
        { id: "html-m-1", text: '<button class="btn" type="button">Click</button>', label: "ボタン" },
        { id: "html-m-2", text: '<input type="text" placeholder="search..." />',    label: "テキスト入力" },
        { id: "html-m-3", text: '<a href="https://example.com" target="_blank">link</a>', label: "リンク" },
        { id: "html-m-4", text: '<img src="image.jpg" alt="description" />',        label: "画像" },
        { id: "html-m-5", text: '<form action="/submit" method="post"></form>',      label: "フォーム" },
      ],
      hard: [
        { id: "html-h-1", text: '<meta name="description" content="page description" />', label: "メタタグ" },
        { id: "html-h-2", text: '<link rel="stylesheet" href="css/style.css" />',         label: "CSS読込" },
        { id: "html-h-3", text: '<nav role="navigation" aria-label="main menu"></nav>',   label: "ナビ" },
        { id: "html-h-4", text: '<section class="hero" aria-labelledby="hero-title"></section>', label: "セクション" },
      ]
    },

    css: {
      easy: [
        { id: "css-e-1", text: "body { margin: 0; padding: 0; }",  label: "リセット" },
        { id: "css-e-2", text: "color: #00d4ff;",                   label: "テキスト色" },
        { id: "css-e-3", text: "display: flex;",                    label: "フレックス" },
        { id: "css-e-4", text: "font-size: 16px;",                  label: "フォントサイズ" },
        { id: "css-e-5", text: "background: #1a2332;",              label: "背景色" },
      ],
      medium: [
        { id: "css-m-1", text: ".container { display: flex; align-items: center; }",     label: "中央寄せ" },
        { id: "css-m-2", text: "transition: all 0.3s ease;",                             label: "トランジション" },
        { id: "css-m-3", text: "border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);", label: "カード" },
        { id: "css-m-4", text: "grid-template-columns: repeat(3, 1fr);",                 label: "グリッド" },
        { id: "css-m-5", text: ":root { --primary: #00d4ff; --bg: #1a2332; }",           label: "CSS変数" },
      ],
      hard: [
        { id: "css-h-1", text: "@media (max-width: 768px) { .nav { display: none; } }",  label: "レスポンシブ" },
        { id: "css-h-2", text: "@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }", label: "アニメーション" },
        { id: "css-h-3", text: "background: linear-gradient(135deg, #1a2332 0%, #0d3b5e 100%);", label: "グラデーション" },
        { id: "css-h-4", text: "clip-path: polygon(0 0, 100% 0, 100% 80%, 0 100%);",    label: "クリップ" },
      ]
    },

    sql: {
      easy: [
        { id: "sql-e-1", text: "SELECT * FROM users;",                           label: "全件取得" },
        { id: "sql-e-2", text: "SELECT name FROM users WHERE id = 1;",           label: "条件取得" },
        { id: "sql-e-3", text: "DELETE FROM sessions WHERE active = 0;",         label: "削除" },
        { id: "sql-e-4", text: "SHOW TABLES;",                                   label: "テーブル一覧" },
      ],
      medium: [
        { id: "sql-m-1", text: "INSERT INTO users (name, email) VALUES ('enU', 'test@test.com');", label: "挿入" },
        { id: "sql-m-2", text: "UPDATE users SET active = 1 WHERE id = 1;",                        label: "更新" },
        { id: "sql-m-3", text: "SELECT u.name, o.total FROM users u JOIN orders o ON u.id = o.user_id;", label: "結合" },
        { id: "sql-m-4", text: "SELECT COUNT(*) FROM users GROUP BY role;",                        label: "集計" },
        { id: "sql-m-5", text: "CREATE INDEX idx_email ON users (email);",                         label: "インデックス" },
      ],
      hard: [
        { id: "sql-h-1", text: "SELECT name, RANK() OVER (ORDER BY score DESC) AS rank FROM players;", label: "ウィンドウ関数" },
        { id: "sql-h-2", text: "WITH cte AS (SELECT * FROM orders WHERE total > 1000) SELECT * FROM cte;", label: "CTE" },
        { id: "sql-h-3", text: "SELECT * FROM users WHERE id IN (SELECT user_id FROM orders WHERE total > 500);", label: "サブクエリ" },
      ]
    }
  },

  // ===== 日本語モード =====
  // display: 画面に表示するひらがな/カタカナ
  // romaji : ユーザーがタイプするローマ字列（小文字、Hepburn 式）
  japanese: {

    nature: {
      easy: [
        { id: "ja-n-e-1", display: "はるのさくら",      romaji: "harunosakura",     label: "春の桜" },
        { id: "ja-n-e-2", display: "あおいそら",        romaji: "aoisora",          label: "青い空" },
        { id: "ja-n-e-3", display: "よるのつき",        romaji: "yorunotsuki",      label: "夜の月" },
        { id: "ja-n-e-4", display: "しろいくも",        romaji: "shiroikumo",       label: "白い雲" },
        { id: "ja-n-e-5", display: "かぜがふく",        romaji: "kazegafuku",       label: "風が吹く" },
        { id: "ja-n-e-6", display: "あおいうみ",        romaji: "aoiumi",           label: "青い海" },
      ],
      medium: [
        { id: "ja-n-m-1", display: "なつのうみがひろい",        romaji: "natsunoumigahiroi",       label: "夏の広い海" },
        { id: "ja-n-m-2", display: "あきのもみじがきれい",      romaji: "akinomomijigakirei",      label: "秋の紅葉" },
        { id: "ja-n-m-3", display: "ふゆのゆきがしずかにふる",  romaji: "fuyunoyukigashizukanifuru", label: "冬の雪" },
        { id: "ja-n-m-4", display: "よぞらにほしがかがやく",    romaji: "yozoranihoShigakagayaku",  label: "星が輝く" },
        { id: "ja-n-m-5", display: "みどりのこのはがゆれる",    romaji: "midorinokohagayureru",    label: "緑の葉が揺れる" },
      ],
      hard: [
        { id: "ja-n-h-1", display: "はるのさくらがさいた",        romaji: "harunosakuragasaita",      label: "春の桜が咲いた" },
        { id: "ja-n-h-2", display: "なつのうみはあおくてひろい",  romaji: "natsunoumihaaokutehiroi",  label: "夏の海" },
        { id: "ja-n-h-3", display: "あきのそらはたかくてすんでいる", romaji: "akinosorahatakaKutesundeiru", label: "秋の空" },
      ]
    },

    everyday: {
      easy: [
        { id: "ja-d-e-1", display: "おはようございます", romaji: "ohayougozaimasu",  label: "おはよう" },
        { id: "ja-d-e-2", display: "ありがとうございます", romaji: "arigatougozaimasu", label: "ありがとう" },
        { id: "ja-d-e-3", display: "すみません",          romaji: "sumimasen",        label: "すみません" },
        { id: "ja-d-e-4", display: "いただきます",        romaji: "itadakimasu",      label: "いただきます" },
        { id: "ja-d-e-5", display: "おやすみなさい",      romaji: "oyasuminasai",     label: "おやすみ" },
        { id: "ja-d-e-6", display: "よろしくおねがいします", romaji: "yoroshikuonegaishimasu", label: "よろしく" },
      ],
      medium: [
        { id: "ja-d-m-1", display: "きょうはいいてんきですね",  romaji: "kyouhaiitenkidesune",     label: "いい天気" },
        { id: "ja-d-m-2", display: "おいしいものをたべたい",    romaji: "oishiimonowotabetai",     label: "食べたい" },
        { id: "ja-d-m-3", display: "じかんをたいせつにしたい",  romaji: "jikanwotaisetsunishitai", label: "時間を大切に" },
        { id: "ja-d-m-4", display: "たのしいものをつくりたい",  romaji: "tanoshiimonowotsuKuritai",  label: "作りたい" },
        { id: "ja-d-m-5", display: "まいにちすこしずつまなぶ",  romaji: "mainichisukoshizutsumanabu", label: "毎日学ぶ" },
      ],
      hard: [
        { id: "ja-d-h-1", display: "まいにちすこしずつがんばる",   romaji: "mainichisukoshizutsuganbaru",  label: "毎日少しずつ" },
        { id: "ja-d-h-2", display: "しっぱいしてもあきらめない",   romaji: "shippaitemoakiramenai",       label: "諦めない" },
        { id: "ja-d-h-3", display: "じかんをたいせつにつかいたい", romaji: "jikanwotaisetsunitsukaitai",  label: "時間を大切に" },
      ]
    },

    proverbs: {
      easy: [
        { id: "ja-p-e-1", display: "いそがばまわれ",           romaji: "isogabamaware",          label: "急がば回れ" },
        { id: "ja-p-e-2", display: "なせばなる",               romaji: "nasebanaru",             label: "為せば成る" },
        { id: "ja-p-e-3", display: "ちりもつもればやまとなる", romaji: "chirimotsumerebayamatonaru", label: "塵も積もれば" },
        { id: "ja-p-e-4", display: "いちごいちえ",             romaji: "ichigoichie",            label: "一期一会" },
        { id: "ja-p-e-5", display: "みちはみちびく",           romaji: "michiwamichibiku",       label: "道は導く" },
      ],
      medium: [
        { id: "ja-p-m-1", display: "しっぱいはせいこうのもと",    romaji: "shippaihaseikoUnomoto",    label: "失敗は成功の元" },
        { id: "ja-p-m-2", display: "でるくいはうたれる",          romaji: "derukuihautareru",         label: "出る杭は打たれる" },
        { id: "ja-p-m-3", display: "ひとのふりみてわがふりなおせ", romaji: "hitonofurimiteWagafurinaose", label: "人の振り見て" },
      ]
    }
  },

  // ===== ミックスモード =====
  // 各 item は segments 配列を持つ
  // segment.type "ja"   → display(ひらがな表示) + romaji(入力列)
  // segment.type "code" → text(表示兼入力列)
  mix: {
    easy: [
      {
        id: "mix-e-1", label: "配列初期化",
        segments: [
          { type: "ja",   display: "はいれつをはじめる",  romaji: "hairetsuWohajimeru" },
          { type: "code", text: "const arr = [];" }
        ]
      },
      {
        id: "mix-e-2", label: "変数宣言",
        segments: [
          { type: "ja",   display: "なまえをきめる",  romaji: "namaeWokimeru" },
          { type: "code", text: "const name = 'enU';" }
        ]
      },
      {
        id: "mix-e-3", label: "出力",
        segments: [
          { type: "ja",   display: "けっかをしゅつりょく",  romaji: "kekkaWoshutsuryoku" },
          { type: "code", text: "console.log(result);" }
        ]
      },
      {
        id: "mix-e-4", label: "条件分岐",
        segments: [
          { type: "ja",   display: "じょうけんをたしかめる",  romaji: "joukenWotashikameru" },
          { type: "code", text: "if (x > 0) { return x; }" }
        ]
      },
    ],
    medium: [
      {
        id: "mix-m-1", label: "関数定義",
        segments: [
          { type: "ja",   display: "たすかんすうをていぎ",  romaji: "tasuKansuuWoteigi" },
          { type: "code", text: "function add(a, b) { return a + b; }" }
        ]
      },
      {
        id: "mix-m-2", label: "ループ処理",
        segments: [
          { type: "ja",   display: "はいれつをじゅんにしょり",  romaji: "hairetsuWojunniShori" },
          { type: "code", text: "arr.forEach(item => console.log(item));" }
        ]
      },
      {
        id: "mix-m-3", label: "nullチェック",
        segments: [
          { type: "ja",   display: "ぬるのばあいはかえす",  romaji: "nuruNobaaiHakaesu" },
          { type: "code", text: "if (x === null) return false;" }
        ]
      },
      {
        id: "mix-m-4", label: "クローン",
        segments: [
          { type: "ja",   display: "おぶじぇくとをふくせい",  romaji: "obujekutoWofukusei" },
          { type: "code", text: "const clone = { ...original };" }
        ]
      },
    ],
    hard: [
      {
        id: "mix-h-1", label: "非同期処理",
        segments: [
          { type: "ja",   display: "えーぴーあいからでーたをとる",  romaji: "e-pi-aiKarade-taWotoru" },
          { type: "code", text: "fetch('/api').then(r => r.json());" }
        ]
      },
      {
        id: "mix-h-2", label: "reduce",
        segments: [
          { type: "ja",   display: "はいれつのごうけいをもとめる",  romaji: "hairetsuNogoukeiWomotomeru" },
          { type: "code", text: "const sum = arr.reduce((a, v) => a + v, 0);" }
        ]
      },
      {
        id: "mix-h-3", label: "分割代入",
        segments: [
          { type: "ja",   display: "おぶじぇくとからちをとりだす",  romaji: "obujekutoKarachiWotoridasu" },
          { type: "code", text: "const { name, age = 0 } = user ?? {};" }
        ]
      },
    ]
  }
};
