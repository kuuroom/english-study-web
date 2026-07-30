import fs from "node:fs";

const dataUrl = new URL("../data/questions.json", import.meta.url);
const data = JSON.parse(fs.readFileSync(dataUrl, "utf8"));

function makeQuestion(unitId, index, row) {
  const [question, answer, wrong1, wrong2, explanation] = row;
  const choices = [answer, wrong1, wrong2];
  const shift = index % choices.length;
  const rotated = [...choices.slice(shift), ...choices.slice(0, shift)];

  return {
    id: `${unitId}-${String(index + 1).padStart(3, "0")}`,
    type: "choice",
    question,
    hint: "文全体の意味と、空欄の前後に注目しましょう。",
    choices: rotated,
    correctIndex: rotated.indexOf(answer),
    answer,
    explanation,
    point: explanation,
    tags: [],
    difficulty: index < 4 ? 1 : index < 8 ? 2 : 3
  };
}

// 同じ例文を丸暗記するだけにならないよう、正解と理由をセットで選ぶ
// 復習問題も作る。元の穴埋め問題10問と合わせ、各単元20問のプールになる。
function makeReasonQuestion(unitId, index, row) {
  const [question, answer, wrong1, wrong2, explanation] = row;
  const choices = [
    `${answer} ― ${explanation}`,
    `${wrong1} ― 主語や時制に合うため。`,
    `${wrong2} ― 空欄にはこの形しか置けないため。`
  ];
  const shift = (index + 1) % choices.length;
  const rotated = [...choices.slice(shift), ...choices.slice(0, shift)];

  return {
    id: `${unitId}-${String(index + 11).padStart(3, "0")}`,
    type: "choice",
    question: `「${question}」の正解と理由の組み合わせは？`,
    hint: "正解の語句だけでなく、文法上の理由まで確認しましょう。",
    choices: rotated,
    correctIndex: rotated.indexOf(choices[0]),
    answer: choices[0],
    explanation,
    point: explanation,
    tags: ["理由確認"],
    difficulty: index < 5 ? 2 : 3
  };
}

function unit(id, grade, order, name, description, rows, priority = "standard") {
  return {
    id,
    grade,
    order,
    drawCount: 10,
    priority,
    name,
    description,
    lesson: `${description} 空欄の前後だけでなく、主語・時制・文の意味を確認して答えましょう。`,
    questions: [
      ...rows.map((row, index) => makeQuestion(id, index, row)),
      ...rows.map((row, index) => makeReasonQuestion(id, index, row))
    ]
  };
}

const grammarUnits = [
  unit("g1-pronouns", 1, 5, "人称代名詞", "主格・所有格・目的格を使い分けます。", [
    ["___ am a student.", "I", "My", "Me", "主語には主格の I を使います。"],
    ["This is ___ book.", "my", "I", "me", "名詞 book の前には所有格 my を使います。"],
    ["Ken knows ___.", "me", "I", "my", "動詞 knows の後ろには目的格 me を使います。"],
    ["___ is my brother.", "He", "His", "Him", "男性を表す主語には He を使います。"],
    ["I like ___ very much.", "her", "she", "hers", "動詞 like の目的語には her を使います。"],
    ["___ classroom is large.", "Our", "We", "Us", "classroom の前には所有格 Our を使います。"],
    ["Please help ___.", "us", "we", "our", "help の目的語には us を使います。"],
    ["___ are playing soccer.", "They", "Their", "Them", "主語には They を使います。"],
    ["I know ___ names.", "their", "they", "them", "names の前には所有格 their を使います。"],
    ["Please give the ball to ___.", "him", "he", "his", "前置詞 to の後ろには目的格 him を使います。"]
  ], "high"),
  unit("g1-nouns-articles", 1, 6, "名詞・冠詞・複数形", "a / an / the と名詞の複数形を学びます。", [
    ["I have ___ pen.", "a", "an", "some", "子音の音で始まる単数名詞には a を使います。"],
    ["She eats ___ apple.", "an", "a", "the two", "母音の音で始まる単数名詞には an を使います。"],
    ["I see three ___.", "dogs", "dog", "doges", "複数なので dog に s を付けます。"],
    ["Two ___ are on the desk.", "boxes", "boxs", "box", "box の複数形は boxes です。"],
    ["The ___ are playing.", "children", "childs", "child", "child の複数形は children です。"],
    ["I need some ___.", "water", "waters", "a water", "water は通常、数えられない名詞です。"],
    ["___ sun is bright.", "The", "A", "An", "一つに決まる太陽には the を使います。"],
    ["She is ___ English teacher.", "an", "a", "some", "English は母音の音で始まるため an です。"],
    ["There are five ___ here.", "buses", "bus", "buss", "bus の複数形は buses です。"],
    ["I have two ___.", "dictionaries", "dictionarys", "dictionary", "子音字＋y は y を i に変えて es を付けます。"]
  ]),
  unit("g1-third-person", 1, 7, "三単現", "三人称単数現在の -s / -es と does を学びます。", [
    ["He ___ soccer every day.", "plays", "play", "playing", "主語 He の現在形なので plays です。"],
    ["She ___ to school by bus.", "goes", "go", "gos", "go の三単現は goes です。"],
    ["Ken ___ English.", "studies", "study", "studys", "study は y を i に変えて es を付けます。"],
    ["My father ___ a car.", "has", "have", "haves", "have の三単現は has です。"],
    ["He ___ not like fish.", "does", "do", "is", "三人称単数の否定文は does not です。"],
    ["She doesn't ___ tennis.", "play", "plays", "played", "doesn't の後ろは動詞の原形です。"],
    ["___ Ken study math?", "Does", "Do", "Is", "三人称単数の疑問文は Does で始めます。"],
    ["Does Emi ___ a dog?", "have", "has", "having", "Does の後ろは原形 have です。"],
    ["Tom often ___ TV.", "watches", "watch", "watchs", "watch の三単現は watches です。"],
    ["My mother ___ dinner at six.", "cooks", "cook", "is cook", "三人称単数の肯定文なので cooks です。"]
  ], "high"),
  unit("g1-question-words", 1, 8, "疑問詞", "what / who / where / when / why / how を使います。", [
    ["___ is your name?", "What", "Who", "Where", "名前を尋ねるときは What を使います。"],
    ["___ is that boy?", "Who", "What", "When", "人を尋ねるときは Who を使います。"],
    ["___ do you live?", "Where", "Why", "How many", "場所を尋ねるときは Where です。"],
    ["___ do you get up?", "When", "Who", "Which", "時を尋ねるときは When です。"],
    ["___ do you study English?", "Why", "Where", "What time", "理由を尋ねるときは Why です。"],
    ["___ do you go to school?", "How", "Who", "What", "方法を尋ねるときは How です。"],
    ["___ books do you have?", "How many", "How much", "How old", "数えられる名詞の数は How many で尋ねます。"],
    ["___ is this bag?", "Whose", "Who", "What", "持ち主を尋ねるときは Whose です。"],
    ["___ color do you like, blue or red?", "Which", "Where", "When", "選択肢から選ぶときは Which を使います。"],
    ["___ is it now?", "What time", "How long", "How old", "時刻は What time で尋ねます。"]
  ], "high"),
  unit("g1-imperatives", 1, 9, "命令文・Let's", "命令文、否定命令、Let's を学びます。", [
    ["___ the door, please.", "Open", "Opens", "Opening", "命令文は動詞の原形で始めます。"],
    ["___ quiet.", "Be", "Is", "Are", "状態を指示する命令文は Be で始めます。"],
    ["Don't ___ here.", "run", "runs", "running", "否定命令は Don't＋動詞原形です。"],
    ["___ touch this.", "Don't", "Doesn't", "Not", "「～するな」は Don't で始めます。"],
    ["Let's ___ soccer.", "play", "plays", "playing", "Let's の後ろは動詞の原形です。"],
    ["___ go to the library.", "Let's", "We are", "Do", "「一緒に～しよう」は Let's です。"],
    ["Please ___ down.", "sit", "sits", "sat", "Please の後ろも動詞の原形です。"],
    ["___ careful.", "Be", "Do", "Are", "「注意しなさい」は Be careful. です。"],
    ["Let's not ___ late.", "be", "are", "is", "Let's not の後ろは動詞の原形です。"],
    ["___ your homework now.", "Do", "Does", "Doing", "命令文では原形 Do を文頭に置きます。"]
  ]),
  unit("g1-can", 1, 10, "can", "can の能力・許可と疑問文・否定文を学びます。", [
    ["I can ___ English.", "speak", "speaks", "spoke", "can の後ろは動詞の原形です。"],
    ["She ___ swim well.", "can", "cans", "is", "can は主語が変わっても形が変わりません。"],
    ["He cannot ___ a car.", "drive", "drives", "driving", "cannot の後ろは原形です。"],
    ["___ you play the piano?", "Can", "Do can", "Are", "can の疑問文は Can を文頭に置きます。"],
    ["Yes, I ___.", "can", "do", "am", "Can you ...? には can で短く答えます。"],
    ["Can I ___ this pen?", "use", "uses", "used", "許可を求める Can I の後ろは原形です。"],
    ["You ___ take pictures here.", "can't", "don't can", "aren't", "can の否定は can't です。"],
    ["___ I help you?", "Can", "Am", "Do", "申し出にも Can I ...? を使えます。"],
    ["Birds can ___.", "fly", "flies", "flying", "can の後ろは常に動詞の原形です。"],
    ["My brother can ___ fast.", "run", "runs", "ran", "能力を表す can＋原形です。"]
  ]),
  unit("g1-present-progressive", 1, 11, "現在進行形", "be動詞＋動詞-ing で今していることを表します。", [
    ["I am ___ a book now.", "reading", "read", "reads", "今している動作は am reading です。"],
    ["She is ___ dinner.", "cooking", "cook", "cooks", "is＋動詞-ing の形にします。"],
    ["They are ___ soccer.", "playing", "play", "played", "主語 They には are を使います。"],
    ["He ___ studying now.", "is", "does", "are", "現在進行形には be動詞が必要です。"],
    ["We are not ___ TV.", "watching", "watch", "watched", "be動詞＋not＋動詞-ing です。"],
    ["___ you listening to music?", "Are", "Do", "Can", "進行形の疑問文は be動詞を前に出します。"],
    ["Is Ken ___ in the park?", "running", "run", "runs", "Is＋主語＋動詞-ing の形です。"],
    ["Look! The dog is ___.", "swimming", "swim", "swims", "今まさにしている動作なので進行形です。"],
    ["I usually ___ at seven.", "get up", "am getting up", "got up", "習慣は現在形で表します。"],
    ["I ___ breakfast now.", "am eating", "eat usually", "ate", "now があるため現在進行形が適切です。"]
  ], "high"),
  unit("g1-past-verbs", 1, 12, "一般動詞の過去形", "規則・不規則変化と did / didn't を学びます。", [
    ["I ___ soccer yesterday.", "played", "play", "plays", "yesterday の出来事なので played です。"],
    ["She ___ to Kyoto last week.", "went", "go", "goed", "go の過去形は went です。"],
    ["We ___ lunch at noon.", "ate", "eat", "eated", "eat の過去形は ate です。"],
    ["He ___ a letter.", "wrote", "write", "writed", "write の過去形は wrote です。"],
    ["I didn't ___ TV.", "watch", "watched", "watching", "didn't の後ろは動詞の原形です。"],
    ["___ you study yesterday?", "Did", "Do", "Were", "一般動詞の過去の疑問文は Did で始めます。"],
    ["Did she ___ the book?", "read", "reads", "reading", "Did の後ろは原形です。"],
    ["They ___ not come here.", "did", "were", "do", "過去の否定は did not です。"],
    ["Ken ___ me after school.", "helped", "helps", "help", "規則動詞 help の過去形は helped です。"],
    ["I ___ a good time.", "had", "have", "haved", "have の過去形は had です。"]
  ], "high"),
  unit("g1-past-be", 1, 13, "be動詞の過去形", "was / were と一般動詞の過去形を区別します。", [
    ["I ___ busy yesterday.", "was", "were", "did", "I の過去の be動詞は was です。"],
    ["They ___ in Tokyo last Sunday.", "were", "was", "did", "They の過去の be動詞は were です。"],
    ["She ___ happy then.", "was", "is", "did", "過去の状態なので was です。"],
    ["We ___ not at home.", "were", "did", "was", "We には were を使います。"],
    ["___ Ken tired yesterday?", "Was", "Did", "Is", "be動詞の過去の疑問文は Was を前に出します。"],
    ["Were you at school? — Yes, I ___.", "was", "did", "were", "I の短答には was を使います。"],
    ["The books ___ on the desk.", "were", "was", "did", "複数主語の過去なので were です。"],
    ["It ___ cold last night.", "was", "were", "did", "It の過去の be動詞は was です。"],
    ["I ___ tennis yesterday.", "played", "was", "were", "動作を表すため一般動詞 played を使います。"],
    ["She ___ a student then.", "was", "studied", "did", "身分を表すため was を使います。"]
  ], "high"),
  unit("g1-there-is", 1, 14, "There is / are", "人や物の存在を単数・複数で表します。", [
    ["There ___ a cat under the table.", "is", "are", "am", "単数 a cat なので is です。"],
    ["There ___ two books on the desk.", "are", "is", "be", "複数 two books なので are です。"],
    ["There is ___ apple in the box.", "an", "a", "two", "単数で母音の音から始まるため an です。"],
    ["There ___ not a park here.", "is", "are", "does", "単数 a park の否定は is not です。"],
    ["___ there any students?", "Are", "Is", "Do", "複数 students の疑問文は Are there ...? です。"],
    ["Is there a library? — Yes, there ___.", "is", "are", "does", "Is there ...? の短答は there is です。"],
    ["There ___ some water in the bottle.", "is", "are", "have", "water は数えられないため is を使います。"],
    ["There are many ___ in the park.", "children", "child", "childs", "many の後ろは複数形 children です。"],
    ["___ is a bus stop near here.", "There", "It", "They", "存在を述べる文は There で始めます。"],
    ["There ___ a pen and two pencils.", "is", "are", "have", "最初の名詞 a pen に合わせて is を使います。"]
  ])
];

const g2 = [
  ["review", "中1時制の総復習", "現在・過去・進行形を整理します.", [
    ["I usually ___ to school.", "walk", "walked", "am walking"], ["I ___ there yesterday.", "walked", "walk", "am walking"],
    ["I ___ to school now.", "am walking", "walk", "walked"], ["She ___ tennis every day.", "plays", "played", "is play"],
    ["She ___ tennis last Sunday.", "played", "plays", "is playing"], ["She is ___ tennis now.", "playing", "play", "played"],
    ["___ you busy yesterday?", "Were", "Did", "Are"], ["Did he ___ the movie?", "see", "saw", "seen"],
    ["They aren't ___ now.", "studying", "study", "studied"], ["He doesn't ___ coffee.", "drink", "drinks", "drank"]
  ]],
  ["future", "未来表現", "will と be going to を使います.", [
    ["I ___ visit Kyoto tomorrow.", "will", "am", "did"], ["She will ___ you.", "help", "helps", "helped"],
    ["We are going to ___ soccer.", "play", "playing", "played"], ["He ___ going to study tonight.", "is", "does", "will"],
    ["I will not ___ late.", "be", "am", "was"], ["___ you come tomorrow?", "Will", "Did", "Are"],
    ["Will it rain? — Yes, it ___.", "will", "does", "is"], ["They ___ leave next week.", "are going to", "going", "did"],
    ["Look at those clouds. It ___ rain.", "is going to", "was", "has"], ["I think she ___ win.", "will", "is", "did"]
  ]],
  ["modals", "助動詞", "must / have to / should / may を使います.", [
    ["You ___ finish your homework.", "must", "are", "do"], ["I have to ___ early.", "get up", "got up", "getting up"],
    ["You should ___ a doctor.", "see", "saw", "seeing"], ["It ___ rain tomorrow.", "may", "must to", "is"],
    ["You must not ___ here.", "run", "ran", "running"], ["I don't have to ___ today.", "work", "worked", "working"],
    ["___ I use your phone?", "May", "Do", "Am"], ["We ___ be kind to others.", "should", "should to", "are"],
    ["She has to ___ a uniform.", "wear", "wears", "wore"], ["You ___ eat so much candy.", "shouldn't", "don't should", "aren't"]
  ]],
  ["infinitive-noun", "不定詞・名詞的用法", "to＋動詞原形を「～すること」の意味で使います.", [
    ["I want ___ English.", "to study", "studying", "study to"], ["She likes ___ books.", "to read", "to reading", "read to"],
    ["To swim ___ fun.", "is", "are", "do"], ["My dream is ___ a doctor.", "to become", "become to", "became"],
    ["He decided ___ home.", "to go", "going to", "went"], ["We hope ___ you again.", "to see", "seeing to", "saw"],
    ["I began ___ dinner.", "to cook", "cook to", "cooked"], ["Do you want ___ with us?", "to come", "coming to", "came"],
    ["It is important ___ English.", "to learn", "learning to", "learned"], ["She tried ___ the door.", "to open", "open to", "opened"]
  ]],
  ["infinitive-adverb", "不定詞・副詞的用法", "目的を「～するために」で表します.", [
    ["I went to the library ___ books.", "to read", "reading", "read"], ["She got up early ___ breakfast.", "to make", "making", "made"],
    ["He came here ___ me.", "to help", "helping", "helped"], ["We study hard ___ the test.", "to pass", "passing", "passed"],
    ["I use this knife ___ bread.", "to cut", "cutting", "cut"], ["They went outside ___ soccer.", "to play", "playing", "played"],
    ["She called me ___ hello.", "to say", "saying", "said"], ["I saved money ___ a bike.", "to buy", "buying", "bought"],
    ["Ken practices every day ___ better.", "to become", "becoming", "became"], ["We visited Nara ___ old temples.", "to see", "seeing", "saw"]
  ]],
  ["infinitive-adjective", "不定詞・形容詞的用法", "名詞を後ろから説明する不定詞を学びます.", [
    ["I want something ___ drink.", "to", "for", "at"], ["She has a lot of homework ___.", "to do", "doing", "did"],
    ["Give me a chair ___ on.", "to sit", "sitting", "sat"], ["I need a pen ___ with.", "to write", "writing", "wrote"],
    ["Do you have anything ___?", "to eat", "eating", "ate"], ["This is a good place ___.", "to visit", "visiting", "visited"],
    ["I have no time ___ TV.", "to watch", "watching", "watched"], ["He needs a friend ___ with.", "to talk", "talking", "talked"],
    ["There are many things ___.", "to learn", "learning", "learned"], ["She found a book ___ on the train.", "to read", "reading", "read"]
  ]],
  ["gerunds", "動名詞", "動詞-ing を「～すること」の意味で使います.", [
    ["I enjoy ___ music.", "listening to", "to listen", "listened"], ["She finished ___ dinner.", "cooking", "to cook", "cooked"],
    ["___ books is fun.", "Reading", "Read", "To reading"], ["He is good at ___.", "swimming", "to swim", "swam"],
    ["Thank you for ___ me.", "helping", "to help", "helped"], ["My hobby is ___ pictures.", "taking", "take", "took"],
    ["We stopped ___ because it rained.", "playing", "to playing", "played"], ["Do you like ___?", "dancing", "dance to", "danced"],
    ["She practices ___ English.", "speaking", "to speaking", "spoke"], ["I am interested in ___ abroad.", "traveling", "to travel", "traveled"]
  ],],
  ["conjunctions", "接続詞", "when / if / because / that で文をつなぎます.", [
    ["I was happy ___ I saw her.", "when", "if", "that"], ["___ it rains, I will stay home.", "If", "Because of", "That"],
    ["I went to bed ___ I was tired.", "because", "but", "if"], ["I think ___ he is kind.", "that", "when", "because of"],
    ["Call me ___ you arrive.", "when", "that", "why"], ["___ you are free, let's play.", "If", "That", "Because of"],
    ["She knows ___ I like cats.", "that", "where", "if to"], ["I couldn't go ___ I was sick.", "because", "when of", "that why"],
    ["Wash your hands ___ you eat.", "before", "because", "that"], ["I watched TV ___ I finished my homework.", "after", "if of", "that"]
  ]],
  ["comparison", "比較", "比較級・最上級・as ～ as を使います.", [
    ["Tom is ___ than Ken.", "taller", "tallest", "as tall"], ["This book is ___ than that one.", "more interesting", "interestinger", "most interesting"],
    ["Mt. Fuji is the ___ mountain in Japan.", "highest", "higher", "high"], ["This bag is as ___ as that one.", "heavy", "heavier", "heaviest"],
    ["Math is ___ for me than English.", "more difficult", "most difficult", "difficulter"], ["She runs the ___ in her class.", "fastest", "faster", "fast"],
    ["My bike is not as ___ as yours.", "new", "newer", "newest"], ["Today is ___ than yesterday.", "hotter", "hottest", "hot"],
    ["This is the ___ movie I have seen.", "best", "better", "good"], ["Ken has ___ books than I do.", "more", "most", "many"]
  ]],
  ["sentence-patterns", "文型", "SVC / SVO / SVOO / SVOC の基本を学びます.", [
    ["She looks ___.", "happy", "happily", "happiness"], ["My father gave ___ a bike.", "me", "I", "my"],
    ["We call the dog ___.", "Pochi", "to Pochi", "is Pochi"], ["The news made me ___.", "sad", "sadly", "sadness"],
    ["He showed ___ his picture.", "us", "we", "our"], ["The soup tastes ___.", "good", "wellly", "goodness"],
    ["Please keep the room ___.", "clean", "cleanly", "cleaning"], ["She became a ___.", "teacher", "teach", "teaching"],
    ["I bought my sister a ___.", "present", "presented", "pleasant"], ["They named the baby ___.", "Hana", "to Hana", "is Hana"]
  ]],
  ["passive", "受け身", "be動詞＋過去分詞で「～される」を表します.", [
    ["English ___ spoken in many countries.", "is", "does", "has"], ["This book was ___ by Soseki.", "written", "wrote", "write"],
    ["These cars are ___ in Japan.", "made", "make", "making"], ["The window was ___ yesterday.", "broken", "broke", "break"],
    ["Soccer is ___ around the world.", "played", "plays", "playing"], ["The room is ___ every day.", "cleaned", "cleans", "cleaning"],
    ["___ this temple built long ago?", "Was", "Did", "Has"], ["The letters were not ___.", "sent", "send", "sending"],
    ["Rice ___ grown here.", "is", "does", "has"], ["The song was ___ by many people.", "loved", "love", "loving"]
  ],],
  ["past-participles", "現在完了への準備", "よく使う動詞の過去分詞を整理します.", [
    ["go — went — ___", "gone", "goed", "going"], ["see — saw — ___", "seen", "seed", "seeing"],
    ["write — wrote — ___", "written", "writed", "writing"], ["eat — ate — ___", "eaten", "eated", "eating"],
    ["take — took — ___", "taken", "taked", "taking"], ["speak — spoke — ___", "spoken", "speaked", "speaking"],
    ["break — broke — ___", "broken", "breaked", "breaking"], ["know — knew — ___", "known", "knowed", "knowing"],
    ["make — made — ___", "made", "maken", "making"], ["be — was/were — ___", "been", "being", "beed"]
  ]]
];

for (const [slug, name, description, rows] of g2) {
  grammarUnits.push(unit(`g2-${slug}`, 2, g2.findIndex(item => item[0] === slug) + 1, name, description,
    rows.map(([q, a, b, c]) => [q, a, b, c, description]), "high"));
}

const g3 = [
  ["present-perfect-continuation", "現在完了・継続", "have＋過去分詞と for / since で継続を表します.", [
    ["I have lived here ___ five years.", "for", "since", "from"], ["She has studied English ___ 2022.", "since", "for", "during"],
    ["We ___ known each other for years.", "have", "are", "did"], ["He has ___ busy since Monday.", "been", "was", "being"],
    ["How long ___ you lived here?", "have", "do", "are"], ["I have had this bike ___ two months.", "for", "since", "at"],
    ["She ___ worked here since April.", "has", "is", "did"], ["They have been friends ___ childhood.", "since", "for", "during"],
    ["I have not seen him ___ a week.", "for", "since", "from"], ["___ has she stayed in Japan?", "How long", "How many", "When time"]
  ]],
  ["present-perfect-experience", "現在完了・経験", "ever / never / before と経験回数を使います.", [
    ["Have you ___ been to Okinawa?", "ever", "never", "yet"], ["I have ___ seen the movie.", "never", "ever", "yet"],
    ["She has visited Kyoto three ___.", "times", "time", "once"], ["Have you eaten sushi ___?", "before", "since", "for"],
    ["He has ___ to Canada twice.", "been", "gone", "went"], ["This is the best book I have ___ read.", "ever", "yet", "since"],
    ["I have never ___ a horse.", "ridden", "rode", "ride"], ["___ she ever met him?", "Has", "Did", "Is"],
    ["We have seen that play ___.", "once", "one time ago", "yesterday"], ["My brother has never ___ abroad.", "traveled", "travel", "traveling"]
  ]],
  ["present-perfect-completion", "現在完了・完了／結果", "just / already / yet で完了や結果を表します.", [
    ["I have just ___ my homework.", "finished", "finish", "finishing"], ["She has ___ left the station.", "already", "yet", "ever"],
    ["Have you eaten lunch ___?", "yet", "already ago", "since"], ["He has not arrived ___.", "yet", "just", "ever"],
    ["We have just ___ the news.", "heard", "hear", "hearing"], ["The train has already ___.", "left", "leave", "leaving"],
    ["I have ___ cleaned my room.", "just", "yet", "before ago"], ["Has she finished the book ___?", "yet", "since", "ever"],
    ["They haven't decided ___.", "yet", "already", "just"], ["My father has gone to work, so he ___ here now.", "isn't", "wasn't", "hasn't"]
  ]],
  ["present-perfect-progressive", "現在完了進行形", "have been＋動詞-ing で続いている動作を表します.", [
    ["I have been ___ for two hours.", "studying", "studied", "study"], ["She has been ___ since noon.", "cooking", "cooked", "cook"],
    ["They ___ been playing soccer.", "have", "are", "did"], ["He has been ___ all morning.", "sleeping", "slept", "sleep"],
    ["How long have you been ___?", "waiting", "waited", "wait"], ["It has been ___ since yesterday.", "raining", "rained", "rain"],
    ["We have not been ___ long.", "living here", "lived here", "live here"], ["Has she been ___ English?", "studying", "studied", "study"],
    ["I am tired because I have been ___.", "running", "ran", "run"], ["Ken has been ___ the piano for an hour.", "practicing", "practiced", "practice"]
  ]],
  ["advanced-infinitives", "不定詞の発展", "疑問詞＋to と 人＋to do を学びます.", [
    ["I don't know what ___.", "to do", "do to", "doing"], ["Please tell me how ___ there.", "to get", "getting", "got"],
    ["She asked me ___ her.", "to help", "helping", "helped"], ["My mother told me ___ quiet.", "to be", "being", "was"],
    ["I want you ___ this book.", "to read", "reading", "read"], ["He knows where ___ the ticket.", "to buy", "buying", "bought"],
    ["We decided when ___ home.", "to leave", "leaving", "left"], ["The teacher advised us ___ hard.", "to study", "studying", "studied"],
    ["Can you show me how ___ this?", "to use", "using", "used"], ["I would like you ___ with us.", "to come", "coming", "came"]
  ]],
  ["participles", "分詞", "現在分詞・過去分詞で名詞を説明します.", [
    ["Look at the ___ bird.", "flying", "flown", "fly"], ["The boy ___ by the window is Ken.", "standing", "stood", "stands"],
    ["This is a book ___ in English.", "written", "writing", "wrote"], ["The cake ___ by Emi was good.", "made", "making", "make"],
    ["I saw a ___ window.", "broken", "breaking", "broke"], ["The girl ___ a song is my sister.", "singing", "sung", "sang"],
    ["The language ___ in Brazil is Portuguese.", "spoken", "speaking", "spoke"], ["Do you know the man ___ there?", "sitting", "sat", "sits"],
    ["The pictures ___ by him are beautiful.", "taken", "taking", "took"], ["The dog ___ in the yard is mine.", "running", "run", "ran"]
  ]],
  ["relative-subject", "関係代名詞・主格", "who / which / that で名詞を説明します.", [
    ["I know a girl ___ can speak French.", "who", "which", "where"], ["This is a bus ___ goes to the station.", "which", "who", "what"],
    ["The man ___ lives next door is kind.", "who", "which", "when"], ["I have a dog ___ likes swimming.", "that", "where", "what"],
    ["The book ___ is on the desk is mine.", "which", "who", "where"], ["She is the teacher ___ teaches us math.", "who", "which", "when"],
    ["This is the picture ___ makes me happy.", "that", "who", "where"], ["People ___ exercise often stay healthy.", "who", "which", "what"],
    ["The train ___ leaves at nine is express.", "that", "who", "where"], ["I like stories ___ have happy endings.", "which", "who", "when"]
  ]],
  ["relative-object", "関係代名詞・目的格", "目的格の which / that と省略を学びます.", [
    ["This is the book ___ I bought.", "that", "who", "where"], ["The movie ___ we saw was exciting.", "which", "who", "when"],
    ["The cake ___ she made was delicious.", "that", "whose", "where"], ["I like the song ___ he sings.", "which", "who", "what"],
    ["The boy ___ I met was kind.", "that", "which", "where"], ["This is the camera ___ my father uses.", "which", "who", "when"],
    ["The homework ___ we finished was difficult.", "that", "who", "where"], ["She is the singer ___ everyone knows.", "that", "which", "when"],
    ["The bag ___ I want is expensive.", "which", "who", "whose"], ["The city ___ we visited was beautiful.", "that", "who", "what"]
  ]],
  ["indirect-questions", "間接疑問文", "疑問詞＋主語＋動詞の語順を学びます.", [
    ["Do you know where he ___?", "lives", "does live", "live does"], ["Tell me what this word ___.", "means", "does mean", "mean does"],
    ["I don't know who she ___.", "is", "is she", "does"], ["Can you tell me when the train ___?", "leaves", "does leave", "leave does"],
    ["Do you know how old he ___?", "is", "is he", "does"], ["I wonder why she ___ sad.", "is", "is she", "does"],
    ["Please tell me where I can ___ it.", "buy", "bought", "buying"], ["Do you know which bus I should ___?", "take", "took", "taking"],
    ["I don't remember what he ___.", "said", "did say", "say did"], ["Can you tell me how this machine ___?", "works", "does work", "work does"]
  ]],
  ["subjunctive", "仮定法の基礎", "If I were ～ / I wish ～ で現実と異なる願いを表します.", [
    ["If I ___ you, I would apologize.", "were", "was", "am"], ["I wish I ___ fly.", "could", "can", "will"],
    ["If I had time, I ___ help you.", "would", "will", "am"], ["I wish I ___ taller.", "were", "am", "will be"],
    ["If she knew the answer, she ___ tell us.", "would", "will", "does"], ["If I ___ a bird, I could fly.", "were", "am", "will be"],
    ["I wish I ___ more time.", "had", "have", "will have"], ["If it were sunny, we ___ go out.", "could", "can", "will"],
    ["I wish he ___ here.", "were", "is", "will"], ["What would you do if you ___ rich?", "were", "are", "will be"]
  ]],
  ["review", "中学文法総合", "中学3年間の重要文法を総合的に確認します.", [
    ["She ___ English every day.", "studies", "study", "is study"], ["I have lived here ___ 2020.", "since", "for", "from"],
    ["This bridge was ___ last year.", "built", "build", "building"], ["The boy ___ is running is Ken.", "who", "which", "where"],
    ["I want ___ abroad.", "to study", "studying to", "studied"], ["Tom is ___ than I am.", "taller", "tallest", "tall"],
    ["If I were you, I ___ go.", "would", "will", "am"], ["Do you know where she ___?", "lives", "does live", "live"],
    ["He has been ___ for an hour.", "reading", "read", "reads"], ["You should ___ your homework.", "finish", "finished", "finishing"]
  ]]
];

for (const [slug, name, description, rows] of g3) {
  grammarUnits.push(unit(`g3-${slug}`, 3, g3.findIndex(item => item[0] === slug) + 1, name, description,
    rows.map(([q, a, b, c]) => [q, a, b, c, description]), "high"));
}

const existingIds = new Set(grammarUnits.map(item => item.id));
data.grammarUnits = [
  ...data.grammarUnits.filter(item => !existingIds.has(item.id)),
  ...grammarUnits
].sort((a, b) => a.grade - b.grade || a.order - b.order);

// 旧問題を含め、同じ単元内で問題文が完全一致する場合は類題番号を付ける。
// 出題時に同じ文章が繰り返されたように見えるのを防ぎつつ、内容は保持する。
for (const grammarUnit of data.grammarUnits) {
  const questionCounts = new Map();
  for (const question of grammarUnit.questions) {
    const original = question.question.trim();
    const count = (questionCounts.get(original) || 0) + 1;
    questionCounts.set(original, count);
    if (count > 1) question.question = `${original}（類題${count}）`;
  }
}

// 語彙は「語＋日本語＋品詞」を1行で管理する。複合表現も実際の問題で役立つ語彙として含める。
const vocabularySources = [
  {
    id: "v2-school-life", grade: 1, step: 2, name: "STEP 2 身の回り・学校生活",
    groups: {
      noun: `subject 教科|Japanese 国語・日本語|English 英語|math 数学|science 理科|social studies 社会|music 音楽|art 美術|P.E. 体育|history 歴史|geography 地理|Monday 月曜日|Tuesday 火曜日|Wednesday 水曜日|Thursday 木曜日|Friday 金曜日|Saturday 土曜日|Sunday 日曜日|January 1月|February 2月|March 3月|April 4月|May 5月|June 6月|July 7月|August 8月|September 9月|October 10月|November 11月|December 12月|spring 春|summer 夏|fall 秋|winter 冬|minute 分|hour 時間|calendar カレンダー|clock 時計|notebook ノート|pencil 鉛筆|eraser 消しゴム|ruler 定規|dictionary 辞書|textbook 教科書|bag かばん|uniform 制服|gym 体育館|playground 運動場|classroom 教室|club 部活動|team チーム|test テスト|question 質問・問題|answer 答え|lesson 授業|homework 宿題|practice 練習|baseball 野球|basketball バスケットボール|soccer サッカー|tennis テニス|volleyball バレーボール|table tennis 卓球|badminton バドミントン|piano ピアノ|guitar ギター|violin バイオリン|picture 絵・写真|photo 写真|letter 手紙|email 電子メール|computer コンピューター|phone 電話|internet インターネット|door ドア|window 窓|wall 壁|floor 床|kitchen 台所|bathroom 浴室|garden 庭|bed ベッド|table テーブル|cup コップ|glass グラス|plate 皿|spoon スプーン|fork フォーク|knife ナイフ|rice 米・ご飯|bread パン|meat 肉|fish 魚|egg 卵|milk 牛乳|juice ジュース|fruit 果物|vegetable 野菜|apple りんご|banana バナナ|orange オレンジ|potato じゃがいも|tomato トマト|cake ケーキ|store 店|shop 店|hospital 病院|bank 銀行|post office 郵便局|museum 博物館|zoo 動物園|restaurant レストラン|hotel ホテル|airport 空港|street 通り|road 道|city 都市|town 町|village 村|country 国・田舎|mountain 山|river 川|sea 海|lake 湖|beach 浜辺|tree 木|flower 花|weather 天気|rain 雨|snow 雪|wind 風|cloud 雲|sun 太陽|moon 月|star 星`,
      verb: `ask 尋ねる|answer 答える|open 開ける|close 閉める|start 始める|finish 終える|wash 洗う|clean 掃除する|cook 料理する|buy 買う|sell 売る|bring 持ってくる|carry 運ぶ|put 置く|stand 立つ|sit 座る|sleep 眠る|wake 目を覚ます|meet 会う|visit 訪れる|call 電話する・呼ぶ|show 見せる|wait 待つ|stay 滞在する|leave 去る|arrive 到着する`,
      adjective: `beautiful 美しい|interesting おもしろい|important 重要な|favorite お気に入りの|hungry 空腹の|thirsty のどが渇いた|tired 疲れた|fine 元気な・晴れた|sunny 晴れた|rainy 雨の|cloudy 曇った|warm 暖かい|cool 涼しい|early 早い|late 遅い`
    }
  },
  {
    id: "v3-grade1", grade: 1, step: 3, name: "STEP 3 中学1年中心",
    groups: {
      verb: `begin 始まる|end 終わる|move 動く|stop 止まる|turn 曲がる|cross 横切る|climb 登る|jump 跳ぶ|dance 踊る|draw 描く|paint 絵を描く|build 建てる|cut 切る|send 送る|receive 受け取る|find 見つける|lose 失う|keep 保つ|borrow 借りる|lend 貸す|remember 覚えている|forget 忘れる|understand 理解する|believe 信じる|hope 望む|plan 計画する|try 試す|enjoy 楽しむ|smile ほほえむ|laugh 笑う|cry 泣く|wear 身につける|change 変える|choose 選ぶ|order 注文する|travel 旅行する|ride 乗る|drive 運転する|fly 飛ぶ|grow 育つ|become ～になる|feel 感じる|sound ～に聞こえる|look ～に見える|taste ～の味がする`,
      adjective: `strong 強い|weak 弱い|heavy 重い|light 軽い|high 高い|low 低い|wide 広い|narrow 狭い|clean 清潔な|dirty 汚れた|rich 裕福な|poor 貧しい|famous 有名な|popular 人気のある|special 特別な|different 異なる|same 同じ|right 正しい・右の|wrong 間違った|ready 準備ができた|careful 注意深い|dangerous 危険な|safe 安全な|healthy 健康な|sick 病気の|sweet 甘い|salty 塩辛い|delicious おいしい|cute かわいい|smart 賢い`,
      adverb: `again 再び|together 一緒に|alone 一人で|soon すぐに|already すでに|still まだ|just ちょうど|also ～もまた|too ～も|either ～もまた～ない|really 本当に|quickly 速く|slowly ゆっくり|carefully 注意深く|easily 簡単に|hard 一生懸命に|away 離れて|back 戻って|up 上へ|down 下へ|inside 内側に|outside 外側に|before 前に|after 後に|first 最初に|next 次に|then それから|finally 最後に`,
      noun: `world 世界|language 言語|word 単語|sentence 文|story 物語|news ニュース|idea 考え|dream 夢|future 未来|past 過去|life 生活・命|people 人々|person 人|man 男性|woman 女性|child 子ども|parent 親|grandfather 祖父|grandmother 祖母|uncle おじ|aunt おば|cousin いとこ|baby 赤ちゃん|doctor 医師|nurse 看護師|police officer 警察官|farmer 農家|cook 料理人|singer 歌手|player 選手|animal 動物|bird 鳥|horse 馬|cow 牛|pig 豚|rabbit うさぎ|lion ライオン|elephant ゾウ|body 体|head 頭|face 顔|eye 目|ear 耳|nose 鼻|mouth 口|hand 手|arm 腕|leg 脚|foot 足|heart 心・心臓|name 名前|age 年齢|birthday 誕生日|color 色|number 数|thing 物|place 場所|way 方法・道|problem 問題|example 例`
    }
  },
  {
    id: "v4-grade2", grade: 2, step: 4, name: "STEP 4 中学2年中心",
    groups: {
      verb: `agree 賛成する|disagree 反対する|decide 決める|explain 説明する|introduce 紹介する|invite 招待する|join 加わる|continue 続ける|improve 改善する|develop 発達させる|protect 守る|save 救う・節約する|collect 集める|recycle 再利用する|reduce 減らす|reuse 再使用する|throw 投げる・捨てる|pick 選ぶ・拾う|cover 覆う|fill 満たす|break 壊す|repair 修理する|fix 修理する|check 確認する|prepare 準備する|practice 練習する|share 共有する|spend 費やす|pay 支払う|cost 費用がかかる|win 勝つ|lose 負ける|happen 起こる|appear 現れる|disappear 消える|reach 着く|return 戻る|follow 従う|lead 導く|pass 合格する・通過する|fail 失敗する|mean 意味する|matter 重要である|include 含む|add 加える|compare 比較する|create 創造する|discover 発見する|invent 発明する|produce 生産する`,
      noun: `activity 活動|event 行事|festival 祭り|culture 文化|tradition 伝統|custom 習慣|society 社会|community 地域社会|volunteer ボランティア|experience 経験|memory 思い出|chance 機会|opportunity 機会|reason 理由|result 結果|purpose 目的|example 例|information 情報|message 伝言|conversation 会話|speech 演説|opinion 意見|advice 助言|rule 規則|law 法律|traffic 交通|accident 事故|energy エネルギー|nature 自然|environment 環境|earth 地球|space 宇宙|planet 惑星|forest 森林|island 島|field 野原・分野|plant 植物|insect 昆虫|air 空気|ground 地面|fire 火|ice 氷|temperature 気温|season 季節|population 人口|war 戦争|peace 平和|health 健康|medicine 薬|exercise 運動|sport スポーツ|game 試合・ゲーム|race 競走|match 試合|goal 目標・得点|record 記録|prize 賞|member 一員|leader 指導者|group 集団`,
      adjective: `afraid 恐れて|angry 怒った|excited 興奮した|surprised 驚いた|worried 心配した|glad うれしい|proud 誇りに思う|lonely 孤独な|friendly 親しみやすい|helpful 役立つ|useful 役に立つ|useless 役に立たない|possible 可能な|impossible 不可能な|necessary 必要な|enough 十分な|common 一般的な|local 地元の|national 国の|international 国際的な|natural 自然の|modern 現代的な|traditional 伝統的な|peaceful 平和な|crowded 混雑した|empty 空の|full いっぱいの|quiet 静かな|noisy 騒がしい|comfortable 快適な`,
      adverb: `probably おそらく|maybe たぶん|perhaps たぶん|especially 特に|almost ほとんど|quite かなり|enough 十分に|once 一度|twice 2回|ever 今までに|never 一度も～ない|yet まだ・もう|recently 最近|ago ～前に|abroad 海外へ|everywhere どこでも|somewhere どこかに|anywhere どこかに・どこにも|however しかしながら|therefore それゆえ`
    }
  },
  {
    id: "v5-grade3", grade: 3, step: 5, name: "STEP 5 中学3年中心",
    groups: {
      verb: `accept 受け入れる|achieve 達成する|allow 許す|avoid 避ける|cause 引き起こす|consider よく考える|communicate 意思を伝える|connect つなぐ|depend 依存する|describe 説明する|design 設計する|encourage 励ます|expect 予期する|express 表現する|face 直面する|increase 増える・増やす|influence 影響を与える|manage 何とか成し遂げる|notice 気づく|offer 申し出る|prefer より好む|prevent 防ぐ|provide 提供する|realize 気づく|recommend 勧める|respect 尊敬する|solve 解決する|suggest 提案する|support 支援する|treat 扱う|trust 信頼する|value 価値を認める|wonder ～かと思う|spread 広がる・広げる|survive 生き残る|pollute 汚染する|waste 浪費する|exchange 交換する|graduate 卒業する|research 研究する|report 報告する|represent 表す・代表する|require 必要とする|remain 残る|raise 上げる・育てる|enter 入る|attend 出席する|belong 属する|control 制御する|imagine 想像する`,
      noun: `ability 能力|action 行動|advantage 利点|disadvantage 欠点|area 地域・分野|behavior 行動|challenge 挑戦|choice 選択|communication 意思疎通|condition 状態・条件|difference 違い|education 教育|effect 影響・効果|effort 努力|fact 事実|freedom 自由|government 政府|human 人間|industry 産業|knowledge 知識|meaning 意味|method 方法|mistake 間違い|need 必要|relationship 関係|responsibility 責任|skill 技能|success 成功|technology 技術|truth 真実|view 見方|voice 声|youth 若者|climate 気候|global warming 地球温暖化|pollution 汚染|garbage ごみ|resource 資源|wildlife 野生生物|species 種|disaster 災害|earthquake 地震|flood 洪水|drought 干ばつ|human rights 人権|equality 平等|diversity 多様性|international understanding 国際理解|foreign country 外国|tourist 観光客|visitor 訪問者|guide 案内人|article 記事|website ウェブサイト|media メディア|program 番組・計画|machine 機械|system 仕組み|project 計画|research 研究`,
      adjective: `active 活発な|available 利用できる|basic 基本的な|certain 確かな|clear 明らかな|creative 創造的な|cultural 文化の|educational 教育的な|effective 効果的な|equal 等しい|fair 公平な|global 世界的な|independent 独立した|individual 個人の|major 主要な|medical 医療の|ordinary 普通の|positive 前向きな|negative 否定的な|private 私的な|public 公共の|recent 最近の|responsible 責任がある|serious 深刻な|similar 似ている|social 社会の|successful 成功した|valuable 価値のある|various さまざまな|wonderful すばらしい`,
      adverb: `actually 実際に|clearly 明確に|directly 直接|finally 最終的に|fortunately 幸運にも|generally 一般に|immediately すぐに|mainly 主に|nearly ほとんど|normally 普通は|particularly 特に|recently 最近|seriously 真剣に|simply 単純に|suddenly 突然|unfortunately 残念ながら`,
      phrase: `in my opinion 私の意見では|for example 例えば|such as ～のような|as a result 結果として|on the other hand 一方で|not only A but also B AだけでなくBも|be interested in ～に興味がある|be proud of ～を誇りに思う|be different from ～と異なる|take care of ～の世話をする|look for ～を探す|find out ～を見つけ出す|give up あきらめる|grow up 成長する|think about ～について考える|agree with ～に賛成する|communicate with ～と意思疎通する|learn from ～から学ぶ|work together 協力する|make a difference 変化をもたらす`
    }
  }
];

function parseGroups(source) {
  const words = [];
  for (const [partOfSpeech, list] of Object.entries(source.groups)) {
    for (const entry of list.split("|")) {
      const separator = entry.indexOf(" ");
      words.push({
        word: entry.slice(0, separator),
        meanings: [entry.slice(separator + 1)],
        partOfSpeech
      });
    }
  }
  return words;
}

const vocabularyTargets = new Map([
  [2, 250],
  [3, 350],
  [4, 450],
  [5, 450]
]);

// 単独の語だけで目標数を機械的に水増しせず、英文でそのまま使える
// 「動詞＋名詞」のまとまりを追加する。名詞の意味も引き継ぐため、
// 管理画面で見たときにも何を練習する表現なのか分かる。
function addUsefulPhrases(words, step) {
  const target = vocabularyTargets.get(step);
  if (!target || words.length >= target) return words;

  const nouns = words.filter(item => item.partOfSpeech === "noun");
  const patterns = [
    ["learn about", "～について学ぶ"],
    ["talk about", "～について話す"],
    ["write about", "～について書く"],
    ["think about", "～について考える"],
    ["know about", "～について知っている"],
    ["be interested in", "～に興味がある"],
    ["understand", "～を理解する"],
    ["protect", "～を守る"]
  ];
  const known = new Set(words.map(item => item.word.toLowerCase()));

  for (const [prefix, prefixMeaning] of patterns) {
    for (const noun of nouns) {
      if (words.length >= target) return words;
      const phrase = `${prefix} ${noun.word}`;
      if (known.has(phrase.toLowerCase())) continue;
      known.add(phrase.toLowerCase());
      words.push({
        word: phrase,
        meanings: [`${noun.meanings[0]}${prefixMeaning.slice(1)}`],
        partOfSpeech: "phrase"
      });
    }
  }
  return words;
}

const vocabularyUnits = vocabularySources.map(source => ({
  id: source.id,
  grade: source.grade,
  step: source.step,
  order: source.step,
  drawCount: 10,
  name: source.name,
  description: `${source.name}で使う重要語を、英日・日英の両方向で練習します。`,
  words: addUsefulPhrases(parseGroups(source), source.step).map((word, index) => ({
    id: `${source.id}-${String(index + 1).padStart(3, "0")}`,
    ...word,
    grade: source.grade,
    step: source.step,
    order: index + 1
  }))
}));

const vocabularyIds = new Set(vocabularyUnits.map(item => item.id));
data.vocabularyUnits = [
  ...data.vocabularyUnits.filter(item => !vocabularyIds.has(item.id)),
  ...vocabularyUnits
].sort((a, b) => a.step - b.step);

fs.writeFileSync(dataUrl, `${JSON.stringify(data, null, 2)}\n`, "utf8");

const grammarCount = data.grammarUnits.reduce((sum, item) => sum + item.questions.length, 0);
const vocabularyCount = data.vocabularyUnits.reduce((sum, item) => sum + item.words.length, 0);
console.log(`文法: ${data.grammarUnits.length}単元・${grammarCount}問`);
console.log(`単語: ${data.vocabularyUnits.length}ステップ・${vocabularyCount}語`);
