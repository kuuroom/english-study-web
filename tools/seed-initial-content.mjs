import fs from "node:fs";
import { pathToFileURL } from "node:url";

const dataPath = new URL("../data/questions.json", import.meta.url);
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

const q = (id, question, choices, correctIndex, hint, explanation, point, tags = [], difficulty = 1) => ({
  id, type: "choice", question, hint, choices, correctIndex,
  answer: choices[correctIndex], explanation, point, tags, difficulty
});

const wordOrderQuestions = [
  q("g1-order-001", "「私はサッカーをします。」と同じ語順は？", ["I play soccer.", "I soccer play.", "Play I soccer."], 0, "英語は「だれが→する→何を」の順です。", "英語の基本語順は、主語 I の次に動詞 play、その後に目的語 soccer です。", "主語＋動詞＋目的語の順を意識しよう。"),
  q("g1-order-002", "「彼は英語を勉強します。」として正しい文は？", ["He English studies.", "He studies English.", "Studies he English."], 1, "最初に「彼は」、次に「勉強します」です。", "主語 He、動詞 studies、目的語 English の順です。", "日本語の「を」に当たる語は動詞の後ろ。"),
  q("g1-order-003", "「私は毎日走ります。」として正しい文は？", ["I every day run.", "Run I every day.", "I run every day."], 2, "「毎日」は文の後ろに置けます。", "主語 I、動詞 run の後ろに every day を置きます。", "まず主語＋動詞を作り、時間表現を足そう。"),
  q("g1-order-004", "「私の名前はKenです。」として正しい文は？", ["My name is Ken.", "My is name Ken.", "Is my name Ken."], 0, "「私の名前」が主語です。", "My name をひとかたまりの主語として、その後ろに is を置きます。", "所有格＋名詞をひとかたまりで読む。"),
  q("g1-order-005", "「あなたは親切です。」として正しい文は？", ["You kind are.", "You are kind.", "Are you kind."], 1, "肯定文です。", "肯定文は主語 You の後ろに be動詞 are、最後に形容詞 kind を置きます。", "主語＋be動詞＋状態。"),
  q("g1-order-006", "「彼女は本を読みます。」として正しい文は？", ["She a book reads.", "Reads she a book.", "She reads a book."], 2, "だれが→する→何を、の順です。", "She＋reads＋a book が英語の基本語順です。", "動詞は主語のすぐ後ろ。"),
  q("g1-order-007", "英文の主語はどれ？「Tom plays tennis.」", ["Tom", "plays", "tennis"], 0, "「だれが」に当たる語です。", "テニスをする人は Tom なので、Tom が主語です。", "主語は動作をする人・もの。"),
  q("g1-order-008", "英文の動詞はどれ？「We like music.」", ["We", "like", "music"], 1, "「どうする」に当たる語です。", "like は「好きである」という一般動詞です。", "文の中心となる動作・状態を探そう。"),
  q("g1-order-009", "英文の目的語はどれ？「I use this pen.」", ["I", "use", "this pen"], 2, "「何を」に当たる部分です。", "使うものは this pen なので、これが目的語です。", "動詞の後ろの「何を」を探す。"),
  q("g1-order-010", "「私は学校へ行きます。」として正しい文は？", ["I go to school.", "I to school go.", "Go to school I."], 0, "まず I go を作ります。", "主語＋動詞の I go の後ろに、行き先の to school を置きます。", "場所表現の前に基本の主語＋動詞。"),
  q("g1-order-011", "「これは私のかばんです。」として正しい文は？", ["This my bag is.", "This is my bag.", "Is this my bag."], 1, "疑問文ではありません。", "This＋is＋my bag の順で説明します。", "「これは～です」は This is ～。"),
  q("g1-order-012", "「私たちは昼食を食べます。」として正しい文は？", ["We lunch eat.", "Eat we lunch.", "We eat lunch."], 2, "We のすぐ後ろに動詞を置きます。", "We＋eat＋lunch が正しい語順です。", "英語では動詞を早めに置く。"),
  q("g1-order-013", "「彼は公園にいます。」として正しい文は？", ["He is in the park.", "He in the park is.", "In the park he is."], 0, "主語の次にbe動詞です。", "He＋is の後ろに場所 in the park を置きます。", "人＋be動詞＋場所。"),
  q("g1-order-014", "「私はとても忙しいです。」として正しい文は？", ["I very busy am.", "I am very busy.", "Am I very busy."], 1, "肯定文の語順です。", "I＋am＋very busy の順です。very は busy の前に置きます。", "be動詞の後ろで状態を説明する。"),
  q("g1-order-015", "「彼らは野球をします。」として正しい文は？", ["They baseball play.", "Play they baseball.", "They play baseball."], 2, "They の次に「する」を置きます。", "主語 They、動詞 play、目的語 baseball の順です。", "主語＋動詞＋目的語。"),
  q("g1-order-016", "「私は日曜日にテレビを見ます。」として正しい文は？", ["I watch TV on Sunday.", "I on Sunday watch TV.", "Watch TV I on Sunday."], 0, "曜日は文の後ろに置けます。", "I watch TV を先に作り、on Sunday を後ろに足します。", "基本文を作ってから時を足す。"),
  q("g1-order-017", "「その犬は大きいです。」として正しい文は？", ["The dog big is.", "The dog is big.", "Is the dog big."], 1, "肯定文です。", "主語 The dog の後ろに is、状態 big を続けます。", "主語＋be動詞＋形容詞。"),
  q("g1-order-018", "「私の父は車を運転します。」として正しい文は？", ["My father a car drives.", "Drives my father a car.", "My father drives a car."], 2, "「私の父」が主語です。", "My father＋drives＋a car の順です。", "長い主語もひとかたまりで考える。"),
  q("g1-order-019", "「私は朝7時に起きます。」として正しい文は？", ["I get up at seven.", "I at seven get up.", "Get up I at seven."], 0, "get up は2語で1つの動作です。", "I get up の後ろに時刻 at seven を置きます。", "熟語の動詞を離さない。"),
  q("g1-order-020", "「彼女は上手に歌います。」として正しい文は？", ["She well sings.", "She sings well.", "Sings well she."], 1, "「上手に」は歌い方を説明します。", "主語 She、動詞 sings の後ろに well を置きます。", "動作を説明する語は動詞の後ろにも置ける。")
];

const beVerbQuestions = [
  q("g1-be-001", "I ___ a student.", ["am", "is", "are", "do"], 0, "主語は I です。", "I と組み合わせるbe動詞は am です。", "I am をセットで覚える。"),
  q("g1-be-002", "You ___ my friend.", ["am", "is", "are", "does"], 2, "主語は You です。", "You と組み合わせるbe動詞は are です。", "You are をセットで覚える。"),
  q("g1-be-003", "He ___ kind.", ["am", "is", "are", "do"], 1, "He は1人を表します。", "He と組み合わせるbe動詞は is です。", "he / she / it は is。"),
  q("g1-be-004", "We ___ busy.", ["am", "is", "are", "does"], 2, "We は複数です。", "We と組み合わせるbe動詞は are です。", "we / they は are。"),
  q("g1-be-005", "The cat ___ under the table.", ["am", "is", "are", "play"], 1, "猫がいる場所を説明しています。", "The cat は単数なので is を使います。", "1人・1つなら is。"),
  q("g1-be-006", "Tom and Ken ___ classmates.", ["am", "is", "are", "does"], 2, "2人なので複数です。", "Tom and Ken は複数の主語なので are です。", "A and B は複数扱い。"),
  q("g1-be-007", "「私は疲れていません。」として正しい文は？", ["I am not tired.", "I do not tired.", "I not am tired."], 0, "be動詞の後ろに not を置きます。", "am の直後に not を置いて否定文を作ります。", "be動詞＋not。"),
  q("g1-be-008", "「彼は先生ではありません。」として正しい文は？", ["He doesn't a teacher.", "He is not a teacher.", "He not is a teacher."], 1, "先生という立場の否定です。", "be動詞 is の後ろに not を置きます。", "be動詞の否定に don't は使わない。"),
  q("g1-be-009", "「あなたは元気ですか。」として正しい文は？", ["You are fine?", "Do you fine?", "Are you fine?"], 2, "be動詞を文の先頭へ出します。", "Are＋you＋fine? の順で疑問文を作ります。", "be動詞を主語の前へ。"),
  q("g1-be-010", "Is she a tennis player? ― Yes, ___.", ["she is", "she does", "she are"], 0, "質問に is が使われています。", "Is she ～? には Yes, she is. と答えます。", "短い答えでも同じbe動詞を使う。"),
  q("g1-be-011", "Are they at school? ― No, ___.", ["they don't", "they aren't", "they isn't"], 1, "質問に are が使われています。", "No, they aren't. が正しい短答です。", "are not＝aren't。"),
  q("g1-be-012", "___ this your book?", ["Am", "Is", "Are", "Do"], 1, "this は1つの物です。", "This と組み合わせるbe動詞は is なので、疑問文では Is this ～? です。", "this / that は is。"),
  q("g1-be-013", "These books ___ new.", ["am", "is", "are", "does"], 2, "These books は複数です。", "複数の主語には are を使います。", "these / those は are。"),
  q("g1-be-014", "「私の母は台所にいます。」として正しい文は？", ["My mother is in the kitchen.", "My mother cooks in the kitchen.", "My mother does in the kitchen."], 0, "「いる」という場所の説明です。", "場所にいることを表すため is を使います。", "いる・あるはbe動詞。"),
  q("g1-be-015", "「今日は暑いです。」として正しい文は？", ["Today hot.", "It is hot today.", "It does hot today."], 1, "天気の文では It を主語にします。", "天気や気温は It is ～ で表します。", "天気の主語は it。"),
  q("g1-be-016", "「私は13歳です。」として正しい文は？", ["I have thirteen.", "I do thirteen years old.", "I am thirteen years old."], 2, "年齢は状態・情報の説明です。", "英語では be動詞＋年齢で表します。", "年齢は I am ～ years old。"),
  q("g1-be-017", "She ___ not sad.", ["is", "does", "do", "are"], 0, "not の前に必要な語を考えます。", "sad は状態を表す形容詞なので is not sad とします。", "形容詞の前にはbe動詞。"),
  q("g1-be-018", "___ you from Japan?", ["Do", "Are", "Is", "Does"], 1, "出身の説明にはbe動詞を使います。", "You are from Japan. の疑問文なので Are you ～? です。", "be from＝～出身である。"),
  q("g1-be-019", "My shoes ___ black.", ["am", "is", "are", "does"], 2, "shoes は複数形です。", "複数の My shoes には are を使います。", "複数名詞は are。"),
  q("g1-be-020", "Ken ___ in the library now.", ["is", "study", "does", "are"], 0, "今いる場所を説明しています。", "Ken は1人で、場所の説明なので is です。", "単数の人＋is＋場所。"),
  q("g1-be-021", "「彼らは忙しいですか。」として正しい文は？", ["Do they busy?", "Are they busy?", "Is they busy?"], 1, "busy は状態を表す形容詞です。", "They are busy. の疑問文なので Are they busy? です。", "be動詞の疑問文に do は不要。"),
  q("g1-be-022", "「これは簡単ではありません。」として正しい文は？", ["This doesn't easy.", "This not easy.", "This is not easy."], 2, "easy は形容詞です。", "This is easy. の is の後ろに not を置きます。", "形容詞の否定は be動詞＋not。"),
  q("g1-be-023", "Was Tom at home yesterday? ― Yes, ___.", ["he was", "he did", "he is"], 0, "was で聞かれています。", "過去のbe動詞 was を使って Yes, he was. と答えます。", "質問と同じ時制で答える。", ["過去"], 2),
  q("g1-be-024", "We ___ in Osaka last week.", ["are", "were", "was", "did"], 1, "last week は過去です。", "We の過去のbe動詞は were です。", "am / is→was、are→were。", ["過去"], 2)
];

const generalVerbQuestions = [
  q("g1-general-001", "I ___ tennis after school.", ["play", "am", "plays", "is"], 0, "「する」という動作です。", "主語 I の現在形なので play を使います。", "I / you / we / they では動詞は原形。"),
  q("g1-general-002", "We ___ English every day.", ["are", "study", "studies", "is"], 1, "「勉強する」は動作です。", "主語 We なので study をそのまま使います。", "習慣の動作には一般動詞。"),
  q("g1-general-003", "They ___ music.", ["are", "likes", "like", "is"], 2, "主語は They です。", "They には一般動詞の原形 like を使います。", "複数主語では -s を付けない。"),
  q("g1-general-004", "「私は犬が好きです。」として正しい文は？", ["I like dogs.", "I am like dogs.", "I likes dogs."], 0, "英語の like は動詞です。", "like は一般動詞なので be動詞と一緒に使いません。", "日本語が「好きです」でも英語は一般動詞。"),
  q("g1-general-005", "「私は毎朝走りません。」として正しい文は？", ["I am not run every morning.", "I do not run every morning.", "I do not runs every morning."], 1, "一般動詞の否定には do not を使います。", "do not の後ろは動詞の原形 run です。", "don't＋動詞原形。"),
  q("g1-general-006", "「あなたは英語を話しますか。」として正しい文は？", ["Are you speak English?", "You do speak English?", "Do you speak English?"], 2, "一般動詞の疑問文です。", "Do を文頭に置き、動詞は原形 speak にします。", "Do＋主語＋動詞原形。"),
  q("g1-general-007", "Do you play soccer? ― Yes, ___.", ["I do", "I am", "I play"], 0, "Do で聞かれています。", "Do you ～? には Yes, I do. と答えます。", "短答では do を使う。"),
  q("g1-general-008", "Do they know Ken? ― No, ___.", ["they aren't", "they don't", "they not know"], 1, "一般動詞 know の質問です。", "No, they don't. が正しい短答です。", "do not＝don't。"),
  q("g1-general-009", "My brother ___ baseball.", ["play", "is play", "plays", "playing"], 2, "主語は1人です。", "My brother は三人称単数なので plays とします。", "he / she / it 相当には -s。", ["三単現"], 2),
  q("g1-general-010", "She ___ to school by bike.", ["goes", "go", "is go", "going"], 0, "主語は She です。", "go は三単現で goes になります。", "oで終わる動詞は -es。", ["三単現"], 2),
  q("g1-general-011", "Ken ___ English every day.", ["study", "studies", "studys", "is study"], 1, "study の三単現です。", "子音字＋y の study は y を i に変えて studies です。", "study→studies。", ["三単現"], 2),
  q("g1-general-012", "Tom ___ a new bag.", ["have", "is have", "has", "haves"], 2, "have の三単現は特別な形です。", "Tom は三人称単数なので has を使います。", "have→has。", ["三単現"], 2),
  q("g1-general-013", "He ___ not play tennis.", ["does", "is", "do", "has"], 0, "主語は He です。", "三単現の否定文は does not＋動詞原形です。", "doesn't の後ろは原形。", ["三単現", "否定"], 2),
  q("g1-general-014", "She doesn't ___ TV at night.", ["watches", "watching", "watch", "watched"], 2, "doesn't の後ろです。", "doesn't に -s の役割があるため、動詞は原形 watch です。", "doesの後ろは必ず原形。", ["三単現", "否定"], 2),
  q("g1-general-015", "___ Ken like cats?", ["Do", "Does", "Is", "Are"], 1, "主語は Ken 1人です。", "三単現の疑問文は Does で始めます。", "Does＋三単現の主語＋原形。", ["三単現", "疑問"], 2),
  q("g1-general-016", "Does he speak English? ― Yes, ___.", ["he is", "he speaks", "he does"], 2, "Does で聞かれています。", "Yes, he does. と答えます。", "短答では does を残す。", ["三単現"], 2),
  q("g1-general-017", "「彼は毎日昼食を作ります。」として正しい文は？", ["He cooks lunch every day.", "He cook lunch every day.", "He is cook lunch every day."], 0, "主語は He です。", "三単現なので cooks を使います。", "現在の習慣＋he なら -s。", ["三単現"], 2),
  q("g1-general-018", "「彼女はピアノを弾きません。」として正しい文は？", ["She isn't play the piano.", "She doesn't play the piano.", "She doesn't plays the piano."], 1, "一般動詞 play の否定です。", "doesn't＋動詞原形 play が正解です。", "doesn't と -s を重ねない。", ["三単現", "否定"], 2),
  q("g1-general-019", "「あなたは何を食べますか。」として正しい文は？", ["What are you eat?", "What you eat?", "What do you eat?"], 2, "一般動詞の疑問文に疑問詞を足します。", "What＋do＋you＋eat? の順です。", "疑問詞＋do＋主語＋原形。", ["疑問詞"], 2),
  q("g1-general-020", "Where ___ your sister live?", ["does", "is", "do", "are"], 0, "your sister は1人です。", "三単現の疑問文なので does を使います。", "疑問詞の後ろも Does＋主語＋原形。", ["三単現", "疑問詞"], 3),
  q("g1-general-021", "I ___ my homework yesterday.", ["do", "did", "does", "am"], 1, "yesterday は過去です。", "do の過去形は did です。", "過去を表す語を先に探そう。", ["過去"], 2),
  q("g1-general-022", "We ___ soccer last Sunday.", ["played", "play", "plays", "are play"], 0, "last Sunday は過去です。", "play の過去形は played です。", "規則動詞の過去形は基本 -ed。", ["過去"], 2),
  q("g1-general-023", "「私は昨日テレビを見ませんでした。」として正しい文は？", ["I didn't watched TV yesterday.", "I wasn't watch TV yesterday.", "I didn't watch TV yesterday."], 2, "didn't の後ろの形に注意します。", "didn't の後ろは動詞の原形 watch です。", "didn't＋動詞原形。", ["過去", "否定"], 2),
  q("g1-general-024", "Did you visit Kyoto? ― Yes, ___.", ["I did", "I was", "I visited"], 0, "Did で聞かれています。", "Yes, I did. と答えます。", "過去の一般動詞の短答は did。", ["過去"], 2)
];

const contrastAdditionalQuestions = [
  q("g1-contrast-016", "「彼女は忙しいです。」として正しい文は？", ["She is busy.", "She does busy.", "She busy."], 0, "busy は状態を表します。", "状態を表す形容詞 busy の前にはbe動詞 is が必要です。", "状態・性質ならbe動詞。"),
  q("g1-contrast-017", "「彼女は毎日働きます。」として正しい文は？", ["She is work every day.", "She works every day.", "She does works every day."], 1, "work は「働く」という動作です。", "一般動詞 work を使い、She なので works とします。", "動作なら一般動詞。", ["三単現"], 2),
  q("g1-contrast-018", "「私たちは図書館にいます。」として正しい文は？", ["We stay read library.", "We do in the library.", "We are in the library."], 2, "いる場所の説明です。", "場所の説明なので are を使います。", "いる・あるはbe動詞。"),
  q("g1-contrast-019", "「私たちは図書館で本を読みます。」として正しい文は？", ["We read books in the library.", "We are read books in the library.", "We are books in the library."], 0, "read は動作です。", "本を読むという動作なので一般動詞 read を使います。", "場所があっても文の中心が動作なら一般動詞。"),
  q("g1-contrast-020", "「その料理はおいしいです。」として正しい文は？", ["The dish tastes eat.", "The dish is delicious.", "The dish does delicious."], 1, "delicious は形容詞です。", "料理の性質を説明するため is を使います。", "形容詞の前にはbe動詞。"),
  q("g1-contrast-021", "「私は夕食を作ります。」として正しい文は？", ["I am dinner.", "I am cook dinner.", "I cook dinner."], 2, "cook は「料理する」という動作です。", "一般動詞 cook を使います。", "「～する」は一般動詞を探す。"),
  q("g1-contrast-022", "___ your father a doctor?", ["Is", "Does", "Do"], 0, "職業を尋ねています。", "Your father is a doctor. の疑問文なので Is を前へ出します。", "職業・立場はbe動詞。", ["疑問"], 2),
  q("g1-contrast-023", "___ your father work at a hospital?", ["Is", "Does", "Are"], 1, "work は一般動詞です。", "your father は三人称単数なので Does を使います。", "一般動詞の疑問文は do / does。", ["三単現", "疑問"], 2),
  q("g1-contrast-024", "My sister ___ very tall.", ["does", "is", "plays"], 1, "tall は状態・特徴です。", "形容詞 tall の前に is を置きます。", "特徴の説明にはbe動詞。"),
  q("g1-contrast-025", "My sister ___ basketball well.", ["is", "does", "plays"], 2, "play は動作です。", "三人称単数の My sister なので plays です。", "人の特徴と人の動作を区別する。", ["三単現"], 2),
  q("g1-contrast-026", "「彼らは今、公園にいません。」として正しい文は？", ["They don't in the park now.", "They aren't in the park now.", "They doesn't in the park now."], 1, "場所の否定です。", "are の後ろに not を置き、aren't とします。", "be動詞の否定に don't は使わない。", ["否定"], 2),
  q("g1-contrast-027", "「彼らは公園で遊びません。」として正しい文は？", ["They aren't play in the park.", "They don't plays in the park.", "They don't play in the park."], 2, "play は一般動詞です。", "don't＋動詞原形 play が正解です。", "一般動詞の否定は don't。", ["否定"], 2),
  q("g1-contrast-028", "「その本はおもしろいですか。」として正しい文は？", ["Is the book interesting?", "Does the book interesting?", "The book is interesting?"], 0, "interesting は形容詞です。", "The book is interesting. の is を前へ出します。", "形容詞を尋ねるときはbe動詞。", ["疑問"], 2),
  q("g1-contrast-029", "「彼はその本を読みますか。」として正しい文は？", ["Is he read the book?", "Does he read the book?", "Does he reads the book?"], 1, "read は一般動詞です。", "Does＋he＋動詞原形 read の順です。", "Does の後ろは動詞原形。", ["三単現", "疑問"], 2),
  q("g1-contrast-030", "空欄に入る組み合わせは？「Ken ___ kind, and he ___ his friends.」", ["is / helps", "does / is", "helps / is"], 0, "前半は性質、後半は動作です。", "kind の前は is、友達を助ける動作には helps を使います。", "1文の中でも状態と動作を見分ける。", ["総合"], 3)
];

const previousContrastUnit = (data.grammarUnits || []).find(unit => unit.id === "g1-be-vs-general");
const legacyContrastQuestions = previousContrastUnit
  ? previousContrastUnit.questions.filter(question => !String(question.id || "").startsWith("g1-contrast-"))
  : (data.grammarUnits || [])
      .filter(unit => ["be-or-action", "meaning-check"].includes(unit.id))
      .flatMap(unit => unit.questions);

const grammarSeeds = [
  {
    id: "g1-word-order", grade: 1, order: 1, drawCount: 10, priority: "high",
    name: "英語の語順", description: "「だれが・どうする・何を」の順を身につけます。",
    lesson: "英語では主語のすぐ後ろに動詞を置きます。日本語との語順の違いを意識しましょう。",
    questions: wordOrderQuestions
  },
  {
    id: "g1-be-verbs", grade: 1, order: 2, drawCount: 10, priority: "high",
    name: "be動詞", description: "am / is / are と、否定文・疑問文を練習します。",
    lesson: "be動詞は立場・状態・場所を説明します。主語によって am / is / are を選びます。",
    questions: beVerbQuestions
  },
  {
    id: "g1-general-verbs", grade: 1, order: 3, drawCount: 10, priority: "high",
    name: "一般動詞", description: "動作・習慣、do / does、過去形の基礎を練習します。",
    lesson: "一般動詞は動作や習慣を表します。否定文・疑問文では do / does / did を使います。",
    questions: generalVerbQuestions
  },
  {
    id: "g1-be-vs-general", grade: 1, order: 4, drawCount: 10, priority: "high",
    name: "be動詞と一般動詞の区別", description: "状態・場所・立場と、動作・習慣を見分けます。",
    lesson: "文の中心が「～です・いる・状態」ならbe動詞、「～する」という動作なら一般動詞を考えます。",
    questions: [...legacyContrastQuestions, ...contrastAdditionalQuestions]
  }
];

// [英語, 日本語, 品詞]。STEP 1は最重要の基礎語150語以上。
export const vocabularyRows = [
  ["be","～である・いる","verb"],["have","持っている","verb"],["do","する","verb"],["go","行く","verb"],
  ["come","来る","verb"],["get","得る・着く","verb"],["make","作る","verb"],["take","取る・連れて行く","verb"],
  ["see","見る・会う","verb"],["look","見る","verb"],["watch","見る","verb"],["hear","聞こえる","verb"],
  ["listen","聞く","verb"],["say","言う","verb"],["speak","話す","verb"],["talk","話す","verb"],
  ["tell","伝える","verb"],["know","知っている","verb"],["think","思う","verb"],["like","好む","verb"],
  ["love","大好きである","verb"],["want","欲しい・したい","verb"],["need","必要とする","verb"],["use","使う","verb"],
  ["play","する・遊ぶ","verb"],["study","勉強する","verb"],["learn","学ぶ","verb"],["teach","教える","verb"],
  ["read","読む","verb"],["write","書く","verb"],["eat","食べる","verb"],["drink","飲む","verb"],
  ["run","走る","verb"],["walk","歩く","verb"],["swim","泳ぐ","verb"],["sing","歌う","verb"],
  ["help","助ける","verb"],["work","働く","verb"],["live","住む・生きる","verb"],["give","与える","verb"],
  ["good","よい","adjective"],["bad","悪い","adjective"],["big","大きい","adjective"],["small","小さい","adjective"],
  ["new","新しい","adjective"],["old","古い・年を取った","adjective"],["young","若い","adjective"],["happy","うれしい","adjective"],
  ["sad","悲しい","adjective"],["busy","忙しい","adjective"],["free","ひまな・自由な","adjective"],["kind","親切な","adjective"],
  ["easy","簡単な","adjective"],["difficult","難しい","adjective"],["hot","暑い・熱い","adjective"],["cold","寒い・冷たい","adjective"],
  ["long","長い","adjective"],["short","短い・背が低い","adjective"],["fast","速い","adjective"],["slow","遅い","adjective"],
  ["student","生徒","noun"],["teacher","先生","noun"],["school","学校","noun"],["class","授業・クラス","noun"],
  ["book","本","noun"],["pen","ペン","noun"],["desk","机","noun"],["chair","いす","noun"],
  ["friend","友達","noun"],["family","家族","noun"],["father","父","noun"],["mother","母","noun"],
  ["brother","兄・弟","noun"],["sister","姉・妹","noun"],["boy","少年","noun"],["girl","少女","noun"],
  ["dog","犬","noun"],["cat","猫","noun"],["food","食べ物","noun"],["water","水","noun"],
  ["breakfast","朝食","noun"],["lunch","昼食","noun"],["dinner","夕食","noun"],["home","家・家庭","noun"],
  ["room","部屋","noun"],["park","公園","noun"],["library","図書館","noun"],["station","駅","noun"],
  ["day","日","noun"],["week","週","noun"],["month","月","noun"],["year","年","noun"],
  ["time","時間・時刻","noun"],["morning","朝","noun"],["afternoon","午後","noun"],["evening","夕方","noun"],
  ["today","今日","adverb"],["tomorrow","明日","adverb"],["yesterday","昨日","adverb"],["now","今","adverb"],
  ["always","いつも","adverb"],["usually","たいてい","adverb"],["often","よく","adverb"],["sometimes","ときどき","adverb"],
  ["here","ここに","adverb"],["there","そこに","adverb"],["very","とても","adverb"],["well","上手に・よく","adverb"],
  ["I","私は・私が","pronoun"],["you","あなたは・あなたが","pronoun"],["he","彼は・彼が","pronoun"],["she","彼女は・彼女が","pronoun"],
  ["it","それは・それが","pronoun"],["we","私たちは・私たちが","pronoun"],["they","彼らは・彼女らは","pronoun"],["this","これ・この","pronoun"],
  ["that","あれ・その","pronoun"],["what","何","pronoun"],["who","だれ","pronoun"],["which","どちら・どの","pronoun"],
  ["in","～の中に","preposition"],["on","～の上に・～に","preposition"],["at","～で・～に","preposition"],["to","～へ・～に","preposition"],
  ["from","～から","preposition"],["with","～と一緒に・～を使って","preposition"],["for","～のために・～の間","preposition"],["under","～の下に","preposition"],
  ["and","そして・～と","conjunction"],["but","しかし","conjunction"],["or","または","conjunction"],["because","なぜなら","conjunction"],
  ["when","いつ・～するとき","conjunction"],["if","もし～なら","conjunction"],["can","～できる","verb"],["will","～するつもり・～だろう","verb"],
  ["must","～しなければならない","verb"],["may","～かもしれない・～してよい","verb"],["one","1","noun"],["two","2","noun"],
  ["three","3","noun"],["first","最初の・1番目の","adjective"],["many","多くの","adjective"],["much","多くの","adjective"],
  ["some","いくつかの","adjective"],["any","何か・いくらか","adjective"],["every","すべての・毎～","adjective"],["all","すべての","adjective"],
  ["please","どうぞ・お願いします","phrase"],["thank","感謝する","verb"],["hello","こんにちは","phrase"],["sorry","すみません・残念な","phrase"],
  ["yes","はい","phrase"],["no","いいえ","phrase"]
];

const vocabularyUnit = {
  id: "v1-basic-words", grade: 1, step: 1, order: 1, drawCount: 10,
  name: "STEP 1 最重要基礎語",
  description: "中学英語で何度も使う基本の150語以上を練習します。",
  words: vocabularyRows.map(([word, meaning, partOfSpeech], index) => ({
    id: `v1-${String(index + 1).padStart(3, "0")}-${word.replaceAll(" ", "-")}`,
    word,
    meanings: [meaning],
    partOfSpeech,
    grade: 1,
    step: 1,
    order: index + 1
  }))
};

const seedIds = new Set(grammarSeeds.map(unit => unit.id));
data.grammarUnits = [
  ...grammarSeeds,
  ...(data.grammarUnits || []).filter(unit =>
    !seedIds.has(unit.id) && !["be-or-action", "meaning-check"].includes(unit.id)
  )
].sort((a, b) => (a.grade - b.grade) || (a.order - b.order));
data.vocabularyUnits = [
  vocabularyUnit,
  ...(data.vocabularyUnits || []).filter(unit => unit.id !== vocabularyUnit.id)
];
data.version = 2;

// 他の生成スクリプトから基礎単語一覧だけをimportした場合は書き込まない。
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  fs.writeFileSync(dataPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log(`文法単元: ${data.grammarUnits.length}`);
  console.log(`初期文法問題: ${grammarSeeds.reduce((sum, unit) => sum + unit.questions.length, 0)}問`);
  console.log(`基礎単語: ${vocabularyUnit.words.length}語`);
}
