/* Short bilingual player lessons. Numerical and mathematical rules stay with their owners. */
(function(root){'use strict';
 const frame=(shot,en,ms)=>({shot,en,ms});
 const lesson=(id,group,exercise,en,ms,frames,details={en:[],ms:[]})=>({id,group,exercise,image:frames[0].shot,frames,en:{title:en[0],lead:en[1],steps:en[2],tip:en[3]},ms:{title:ms[0],lead:ms[1],steps:ms[2],tip:ms[3]},details});
 const chapters=[
 lesson('welcome','start',null,
  ['Your first dungeon journey','Help Alyssa reach the end of two stages.',[
   'Choose a room on the map. Play cards to beat its enemy.',
   'Keep your HP above zero. Beat the boss of Sigil Keep, then the boss of Deck Tower.',
   'Start with the Basics route. Look at each picture, then try the practice.'
  ],'There is no rush in this guide. You can repeat every example.'],
  ['Jom kenal game ini','Bantu Alyssa menamatkan dua stage.',[
   'Pilih bilik pada map. Mainkan kad untuk mengalahkan musuh.',
   'Pastikan HP melebihi sifar. Kalahkan boss Sigil Keep, kemudian boss Deck Tower.',
   'Mulakan dengan laluan Asas. Lihat setiap gambar, kemudian cuba latihan.'
  ],'Baca ikut masa sendiri. Setiap contoh boleh diulang.'],
  [frame('menu','Open Tutorial from the Main Menu.','Buka Tutorial dari Menu utama.'),frame('map','Your journey follows connected rooms.','Perjalanan anda melalui bilik yang bersambung.'),frame('combat','Cards help Alyssa win each battle.','Kad membantu Alyssa memenangi pertempuran.')]),
 lesson('loading','start',null,
  ['Wait for the game to be ready','The opening screen prepares the game files.',[
   'Wait until Enter Game is available, then press it.',
   'If a download fails, use the Retry control shown on the screen.',
   'Some later rooms and Practice prepare more files when needed. Wait for their ready message.'
  ],'Use the same game address and browser to return to local progress.'],
  ['Tunggu game bersedia','Skrin awal menyediakan fail game.',[
   'Tunggu sehingga butang Masuk permainan tersedia, kemudian tekan.',
   'Jika muat turun gagal, gunakan butang Cuba lagi yang dipaparkan.',
   'Sesetengah bilik dan Latihan menyediakan fail tambahan apabila diperlukan. Tunggu sehingga siap.'
  ],'Gunakan alamat game dan browser yang sama untuk menyambung rekod setempat.'],
  [frame('loading','Enter when the game is ready.','Masuk apabila game sudah bersedia.'),frame('menu','The Main Menu appears after entry.','Menu utama muncul selepas anda masuk.')]),
 lesson('start','start',null,
  ['Start or continue','Choose whether to begin again or continue your saved run.',[
   'New Run starts a fresh journey. Continue opens your saved journey.',
   'Choose Learn for your first try. Challenge begins with an Artifact trial.',
   'If a save already exists, read the replacement message before starting again.'
  ],'Easy, Medium and Hard are separate balance playtest profiles. Use the values shown in your selected game.'],
  ['Mula atau sambung','Pilih sama ada mahu bermula semula atau menyambung permainan.',[
   'Permainan baharu memulakan perjalanan baharu. Sambung membuka perjalanan yang disimpan.',
   'Pilih Learn untuk cubaan pertama. Challenge bermula dengan soalan percubaan Artifact.',
   'Jika sudah ada save, baca mesej penggantian sebelum bermula semula.'
  ],'Easy, Medium dan Hard ialah profil ujian imbangan berasingan. Rujuk nilai yang dipaparkan dalam game anda.'],
  [frame('menu','Choose New Run or Continue.','Pilih Permainan baharu atau Sambung.'),frame('modes','Choose Learn for an introduction.','Pilih Learn untuk pengenalan.')]),
 lesson('artifact','start',null,
  ['Claim an Artifact','An Artifact gives the effect written in its description.',[
   'In Challenge, choose one offer from the Dungeon Master. Read its effect.',
   'Press the claim button. Answer the trial question, using help if needed.',
   'A correct answer lets you receive it. After two wrong answers, review the solution and continue without it.'
  ],'A picture of an Artifact is an offer. You own it only after the claim is completed.'],
  ['Tuntut Artifact','Artifact memberi kesan seperti yang tertulis pada penerangannya.',[
   'Dalam Challenge, pilih satu tawaran Dungeon Master. Baca kesannya.',
   'Tekan butang tuntut. Jawab soalan percubaan. Gunakan bantuan jika perlu.',
   'Jawapan betul membolehkan anda menerimanya. Selepas dua jawapan salah, semak penyelesaian dan teruskan tanpa Artifact itu.'
  ],'Gambar Artifact ialah tawaran. Artifact menjadi milik anda selepas tuntutan selesai.'],
  [frame('master','Choose an offer and read its effect.','Pilih tawaran dan baca kesannya.'),frame('artifact-question','Answer before claiming.','Jawab sebelum menerima Artifact.'),frame('artifact-result','Read Result, then Continue.','Baca Keputusan, kemudian Teruskan.')]),
 lesson('map','start','map',
  ['Choose your next room','Follow the connected paths upwards to the boss.',[
   'Find a glowing room connected to your position.',
   'Press its icon once to enter immediately.',
   'Check HP before choosing Battle or Elite. Rest can help you recover.'
  ],'Use the map legend to identify Shop, Rest, Mystery, Battle, Elite and Boss.'],
  ['Pilih bilik seterusnya','Ikut laluan bersambung ke atas menuju boss.',[
   'Cari bilik bercahaya yang bersambung dengan kedudukan anda.',
   'Tekan ikonnya sekali untuk terus masuk.',
   'Semak HP sebelum memilih Battle atau Elite. Rest boleh membantu pemulihan.'
  ],'Rujuk petunjuk map untuk mengenal pasti Shop, Rest, Mystery, Battle, Elite dan Boss.'],
  [frame('map','Only connected glowing rooms are available.','Hanya bilik bercahaya yang bersambung boleh dimasuki.'),frame('combat','Entering Battle opens the fight.','Memasuki Battle membuka pertempuran.')]),
 lesson('combat','battle','block',
  ['Read the enemy’s intent','Look above the enemy before you act.',[
   'The intent shows what the enemy plans to do after End Turn.',
   'HP is your health. Block absorbs incoming damage.',
   'Play a Defend card, then press End Turn. Watch the HP and Block values.'
  ],'Try this below: protect Alyssa before allowing the enemy to act.'],
  ['Baca tindakan musuh','Lihat di atas musuh sebelum bertindak.',[
   'Paparan tindakan musuh menunjukkan rancangannya selepas Tamat giliran.',
   'HP ialah kesihatan anda. Block menyerap kerosakan masuk.',
   'Mainkan kad Defend, kemudian tekan Tamat giliran. Perhatikan nilai HP dan Block.'
  ],'Cuba di bawah: lindungi Alyssa sebelum memberi giliran kepada musuh.'],
  [frame('intent','Read the damage above the enemy.','Baca kerosakan yang tertera di atas musuh.'),frame('block','After a Defend card, check the Block value.','Selepas kad Defend dimainkan, semak nilai Block.'),frame('turn','After End Turn, a new turn begins.','Selepas Tamat giliran, giliran baharu bermula.')],
  {en:['Defense reduces damage from each hit. Block absorbs the damage that remains.','Ordinary leftover Block resets at the next player turn unless an effect retains it.','A normal turn starts with {energy} Energy and draws {hand} cards. Effects can change these amounts.'],ms:['Defense mengurangkan kerosakan setiap pukulan. Block menyerap baki kerosakan.','Baki Block biasa direset pada giliran pemain seterusnya kecuali disimpan oleh kesan tertentu.','Giliran biasa bermula dengan {energy} Energy dan mengambil {hand} kad. Kesan tertentu boleh mengubah jumlah ini.']}),
 lesson('cards','battle','attack',
  ['Read and play a card','Energy pays the cost shown on a card.',[
   'Read the cost at the top left. Then read the effect below the artwork.',
   'Press an affordable card in Hand to play it. Check the changed values.',
   'Attack deals damage. Defend gives protection. Skill has other effects. Passive stays active.'
  ],'A normal card can play immediately. Read it before pressing it.'],
  ['Baca dan mainkan kad','Energy membayar kos yang tertera pada kad.',[
   'Baca kos di kiri atas. Kemudian baca kesan di bawah gambar kad.',
   'Tekan kad dalam Hand jika Energy mencukupi. Semak nilai yang berubah.',
   'Attack memberi kerosakan. Defend melindungi. Skill memberi kesan lain. Passive kekal aktif.'
  ],'Kad biasa boleh terus dimainkan apabila ditekan. Baca dahulu sebelum menekannya.'],
  [frame('card','Find the cost, type and effect.','Cari kos, jenis dan kesan kad.'),frame('attack','After playing Attack, enemy HP and your Energy decrease.','Selepas Attack dimainkan, HP musuh dan Energy anda berkurang.')],
  {en:['X uses available Energy according to that card’s effect.','There is one enemy per battle. Multi-hit cards hit that same enemy. Actual damage can be reduced by Block, Defense or boss seals.'],ms:['X menggunakan Energy yang tersedia mengikut kesan kad tersebut.','Setiap pertempuran mempunyai satu musuh. Serangan berbilang pukulan mengenai musuh yang sama. Block, Defense atau seal boss boleh mengurangkan kerosakan sebenar.']}),
 lesson('first-turn','battle','turn',
  ['Try one full turn','Practise three actions in order.',[
   'Read the intent. Play the Defend card to gain Block.',
   'Play the Attack card. Watch enemy HP and your remaining Energy.',
   'Press End Turn. Check Alyssa’s HP and the new turn number.'
  ],'This is a safe example. Replay it until you can explain all three actions.'],
  ['Cuba satu giliran penuh','Latih tiga tindakan mengikut turutan.',[
   'Baca tindakan musuh. Mainkan kad Defend untuk mendapat Block.',
   'Mainkan kad Attack. Perhatikan HP musuh dan baki Energy.',
   'Tekan Tamat giliran. Semak HP Alyssa dan nombor giliran baharu.'
  ],'Ini contoh yang selamat. Ulang sehingga anda boleh menerangkan ketiga-tiga tindakan.'],
  [frame('intent','1. Read the intent.','1. Baca tindakan musuh.'),frame('block','2. Protect with a Defend card.','2. Lindungi diri dengan kad Defend.'),frame('attack-block','3. Attack while keeping Block.','3. Serang sambil mengekalkan Block.'),frame('turn','4. End the turn and check HP.','4. Tamatkan giliran dan semak HP.')]),
 lesson('piles','battle','draw',
  ['Where do used cards go?','Cards move between piles during a battle.',[
   'Hand holds cards you can play. Draw Pile holds cards waiting to be taken.',
   'Used cards usually enter Discard. When Draw Pile runs out, Discard is shuffled back into it.',
   'Exhaust sets a card aside until this battle ends. Open a pile to see its cards.'
  ],'Exhaust does not delete a card from your run deck.'],
  ['Ke mana kad terpakai pergi?','Kad bergerak antara timbunan semasa pertempuran.',[
   'Hand memegang kad yang boleh dimainkan. Draw Pile menyimpan kad yang menunggu untuk diambil.',
   'Kad terpakai biasanya masuk ke Discard. Apabila Draw Pile kosong, Discard dikocok semula ke dalamnya.',
   'Exhaust mengetepikan kad sehingga pertempuran ini tamat. Buka timbunan untuk melihat kad di dalamnya.'
  ],'Exhaust tidak memadam kad daripada Deck permainan anda.'],
  [frame('resources','Find Hand, Draw Pile, Discard and Exhaust.','Cari Hand, Draw Pile, Discard dan Exhaust.'),frame('draw','Open Draw Pile to inspect the cards.','Buka Draw Pile untuk melihat kad.'),frame('exhaust','An Exhaust card waits here until the battle ends.','Kad Exhaust menunggu di sini sehingga pertempuran tamat.')],
  {en:['Hand holds at most {handLimit} cards. Excess draws stay in the pile.','The pile view sorts cards; it does not reveal the hidden Draw order. Hand, Active and Exhaust are not included in a Discard reshuffle.'],ms:['Hand memuatkan paling banyak {handLimit} kad. Lebihan ambilan kekal dalam timbunan.','Paparan timbunan menyusun kad; ia tidak menunjukkan urutan tersembunyi Draw Pile. Hand, Active dan Exhaust tidak dikocok bersama Discard.']}),
 lesson('predict','battle','predict',
  ['Answer a Predict question','Predict is an optional maths question, once per turn.',[
   'Open Predict. Read Question, choose an answer, then press Check answer.',
   'Need help? Open Help. Use Hint, More Hint when unlocked, or Basics.',
   'After answering, read Result. Use Show steps to understand the solution.'
  ],'A correct first answer without help earns 1 Focus, up to {focusCap}. A guided answer is still useful practice.'],
  ['Jawab soalan Predict','Predict ialah soalan matematik pilihan, sekali setiap giliran.',[
   'Buka Predict. Baca Soalan, pilih jawapan, kemudian tekan Semak jawapan.',
   'Perlukan bantuan? Buka Bantuan. Gunakan Petunjuk, Petunjuk Lanjut apabila dibuka, atau Asas.',
   'Selepas menjawab, baca Keputusan. Gunakan Tunjukkan langkah untuk memahami penyelesaian.'
  ],'Jawapan pertama yang betul tanpa bantuan memberi 1 Focus, sehingga had {focusCap}. Jawapan berbantu juga berguna untuk belajar.'],
  [frame('predict','Read, select, then Check answer.','Baca, pilih, kemudian Semak jawapan.'),frame('help','Open Help for Hint and Basics.','Buka Bantuan untuk Petunjuk dan Asas.'),frame('retry','After one wrong answer, both hints unlock.','Selepas satu jawapan salah, kedua-dua petunjuk dibuka.'),frame('predict-result','Result explains the answer.','Keputusan menerangkan jawapan.')],
  {en:['You have two attempts. A first wrong answer unlocks Hint and More Hint; a second wrong answer locks input and reveals the solution.','Closing Predict ends that turn’s attempt without a reward. An opened question is not repeated in the same run.','The bank contains 120 Form 4 questions: Probability, Sets and Logical Reasoning. The guide uses the same evaluator.'],ms:['Anda mempunyai dua cubaan. Salah pertama membuka Petunjuk dan Petunjuk Lanjut; salah kedua mengunci jawapan dan memaparkan penyelesaian.','Menutup Predict menamatkan cubaan giliran itu tanpa ganjaran. Soalan yang sudah dibuka tidak diulang dalam permainan yang sama.','Bank mengandungi 120 soalan Tingkatan 4: Kebarangkalian, Set dan Penaakulan Logik. Panduan menggunakan penilai jawapan yang sama.']}),
 lesson('focus','battle','focus',
  ['Use your Focus bonus','Focus is separate from Energy.',[
   'After earning Focus, press the Focus control to arm it.',
   'Read the changed effect on an eligible Attack, Defend or Skill card.',
   'Play it. One Focus is spent and that card receives its Focus bonus.'
  ],'You can use Focus once per turn. Passive cards do not spend it.'],
  ['Gunakan bonus Focus','Focus berasingan daripada Energy.',[
   'Selepas mendapat Focus, tekan kawalan Focus untuk mengaktifkannya.',
   'Baca perubahan kesan pada kad Attack, Defend atau Skill yang layak.',
   'Mainkan kad itu. Satu Focus digunakan dan kad menerima bonus Focus.'
  ],'Focus boleh digunakan sekali setiap giliran. Kad Passive tidak menggunakannya.'],
  [frame('focus','Find your Focus stock.','Cari jumlah Focus anda.'),frame('focus-armed','Arm Focus and compare the card.','Aktifkan Focus dan bandingkan kad.'),frame('focus-hit','Play the card and check the result.','Mainkan kad dan semak hasilnya.')],
  {en:['Focus resets for a new battle. Different cards have different printed Focus effects.','This exercise starts with 1 example Focus. In a real run, Predict and certain actual effects can grant Focus.'],ms:['Focus direset pada pertempuran baharu. Bonus Focus berbeza mengikut kesan yang tertera pada kad.','Latihan ini bermula dengan 1 Focus contoh. Dalam permainan sebenar, Predict dan kesan tertentu boleh memberi Focus.']}),
 lesson('passive','battle','passive',
  ['Play a Passive first','A Passive helps only after it has been played.',[
   'Play the purple Passive card. Find its icon beside Alyssa.',
   'Open the icon to read its condition and trigger count.',
   'You can keep {passiveLimit} different Passives active. If full, choose one to replace or cancel.'
  ],'A visible aura shows feedback. Read the actual condition and numbers to know what happened.'],
  ['Mainkan Passive dahulu','Passive membantu selepas kad itu dimainkan.',[
   'Mainkan kad Passive ungu. Cari ikonnya di sebelah Alyssa.',
   'Buka ikon untuk membaca syarat dan bilangan kesan dicetuskan.',
   'Anda boleh mengaktifkan {passiveLimit} Passive berbeza. Jika penuh, pilih satu untuk diganti atau batalkan.'
  ],'Aura memberi maklum balas visual. Baca syarat dan nilai sebenar untuk mengetahui kesannya.'],
  [frame('passive','The Passive is now active beside Alyssa.','Passive kini aktif di sebelah Alyssa.'),frame('passive-detail','Read when its effect triggers.','Baca bila kesannya dicetuskan.')],
  {en:['The replaced Passive goes to Discard and its ongoing effect stops. Effects already resolved stay.','Some Passives act immediately; others wait for a condition. Their trigger counter is evidence of an actual trigger.'],ms:['Passive yang diganti masuk ke Discard dan kesan berterusannya berhenti. Kesan yang sudah berlaku kekal.','Sesetengah Passive bertindak serta-merta; yang lain menunggu syarat. Kaunter menunjukkan kesan yang benar-benar dicetuskan.']}),
 lesson('statuses','battle',null,
  ['Understand status icons','Press a status icon to read its effect.',[
   'Strength helps Attack damage. Agility helps Block from Defend cards. Defense reduces damage received.',
   'Weak reduces Attack damage. Vulnerable makes the affected actor take more Attack damage.',
   'Check the number and duration in the detail panel. Statuses can affect Alyssa or the enemy.'
  ],'Defend is a card type. Defense is a damage-reducing attribute. They are different.'],
  ['Fahami ikon status','Tekan ikon status untuk membaca kesannya.',[
   'Strength membantu kerosakan Attack. Agility membantu Block daripada kad Defend. Defense mengurangkan kerosakan diterima.',
   'Weak mengurangkan kerosakan Attack. Vulnerable menyebabkan watak menerima lebih banyak kerosakan Attack.',
   'Semak nilai dan tempoh dalam panel penerangan. Status boleh melibatkan Alyssa atau musuh.'
  ],'Defend ialah jenis kad. Defense ialah sifat yang mengurangkan kerosakan. Kedua-duanya berbeza.'],
  [frame('statuses','Find status icons near the actor.','Cari ikon status berhampiran watak.'),frame('status-detail','Read the current effect and duration.','Baca kesan dan tempoh semasa.')],
  {en:['Current rules: Vulnerable adds 50% to Attack damage; Weak reduces it by 25%. Stacks extend duration across attack phases. Every hit in the affected phase is modified.','Last Ember’s unused emergency Block survives the next player-turn reset once. Older saves can use their original rules; their detail panels remain authoritative.'],ms:['Peraturan semasa: Vulnerable menambah 50% kerosakan Attack; Weak mengurangkannya sebanyak 25%. Tindanan memanjangkan tempoh mengikut fasa serangan. Setiap pukulan dalam fasa terlibat menerima kesan.','Baki Block kecemasan Last Ember disimpan sekali pada giliran pemain berikutnya. Save lama boleh menggunakan peraturan asal; rujuk panel penerangannya.']}),
 lesson('rewards','journey','reward',
  ['Choose a useful reward','You do not need to take every card.',[
   'Read the offered cards. Compare their cost and effect with your Deck.',
   'Select one card, then use the take button. Or choose Skip.',
   'Continue when all required rewards or trials are finished.'
  ],'A smaller Deck can help important cards appear more often.'],
  ['Pilih ganjaran yang berguna','Anda tidak perlu mengambil setiap kad.',[
   'Baca kad yang ditawarkan. Bandingkan kos dan kesannya dengan Deck anda.',
   'Pilih satu kad, kemudian tekan butang ambil. Atau pilih Langkau.',
   'Teruskan selepas semua ganjaran atau percubaan yang diperlukan selesai.'
  ],'Deck yang lebih kecil boleh membantu kad penting muncul lebih kerap.'],
  [frame('rewards','Compare the card choices before taking one.','Bandingkan pilihan kad sebelum mengambil satu.'),frame('reward-taken','Check the Deck after taking a card.','Semak Deck selepas mengambil kad.')],
  {en:['An Elite card reward is upgraded. Eligible Challenge encounters can also offer Artifacts. Amounts and offers follow the active profile.'],ms:['Ganjaran kad Elite sudah dinaik taraf. Pertemuan Challenge yang layak juga boleh menawarkan Artifact. Jumlah dan tawaran mengikut profil aktif.']}),
 lesson('shop','journey','shop',
  ['Spend Gold in the Shop','Buy only what helps your plan.',[
   'Choose Buy Cards or Buy Artifacts. Read the price and effect.',
   'Select an offer, then confirm Buy. Check that Gold decreases and the offer becomes Sold.',
   'Remove Card is a paid service with its own confirmation. Press Leave when finished.'
  ],'Reopening the Shop does not change its stock. Keeping your Gold is also a choice.'],
  ['Belanjakan Gold di Shop','Beli perkara yang membantu rancangan anda.',[
   'Pilih Beli Kad atau Beli Artifact. Baca harga dan kesannya.',
   'Pilih tawaran, kemudian sahkan Beli. Semak Gold berkurang dan tawaran menjadi Terjual.',
   'Buang Kad ialah perkhidmatan berbayar dengan pengesahan sendiri. Tekan Keluar apabila selesai.'
  ],'Membuka semula Shop tidak menukar stok. Menyimpan Gold juga satu pilihan.'],
  [frame('shop','Choose a card and inspect its price.','Pilih kad dan semak harganya.'),frame('shop-bought','A bought offer becomes Sold.','Tawaran yang dibeli menjadi Terjual.'),frame('shop-artifacts','Artifacts have a separate tab.','Artifact mempunyai tab berasingan.'),frame('shop-remove','Check the removal price before confirming.','Semak harga membuang kad sebelum mengesahkan.')]),
 lesson('rest','journey','rest',
  ['Recover or upgrade','Choose one action at a Rest site.',[
   'If HP is low, read the recovery amount and choose Rest.',
   'Or choose Upgrade, then select an eligible card. Compare its improved effect.',
   'Confirm your choice. Return to the map after that one action.'
  ],'Choose based on what you need now: more HP or a stronger card.'],
  ['Pulih atau naik taraf','Pilih satu tindakan di Rest.',[
   'Jika HP rendah, baca jumlah pemulihan dan pilih Rest.',
   'Atau pilih Naik taraf, kemudian pilih kad yang layak. Bandingkan kesan baharunya.',
   'Sahkan pilihan. Kembali ke map selepas satu tindakan itu.'
  ],'Pilih mengikut keperluan sekarang: lebih HP atau kad yang lebih kuat.'],
  [frame('rest','Compare recovery with Upgrade.','Bandingkan pemulihan dengan Naik taraf.'),frame('rest-upgrade','Choose a card to upgrade.','Pilih kad untuk dinaik taraf.')]),
 lesson('mystery','journey',null,
  ['Read before choosing Mystery','A Mystery has its own costs and outcomes.',[
   'Read every choice. Some spend HP or Gold, change your Deck, or start a battle.',
   'If a timer starts, it continues while Help or other panels are open.',
   'Finish the question, read the outcome and claim any required reward before leaving.'
  ],'Refreshing does not give a new question or restart the timer.'],
  ['Baca pilihan Mystery dahulu','Mystery mempunyai kos dan hasilnya sendiri.',[
   'Baca setiap pilihan. Ada yang menggunakan HP atau Gold, mengubah Deck atau memulakan pertempuran.',
   'Jika masa mula dikira, ia terus berjalan semasa Bantuan atau panel lain dibuka.',
   'Selesaikan soalan, baca hasilnya dan tuntut ganjaran yang diperlukan sebelum keluar.'
  ],'Refresh tidak memberi soalan baharu atau memulakan masa semula.'],
  [frame('mystery','Read the choice and consequence first.','Baca pilihan dan akibatnya dahulu.'),frame('mystery-question','Watch the live timer while answering.','Perhatikan masa semasa menjawab.')],
  {en:['A timed question allows two attempts. The first wrong answer unlocks both hints; a second wrong answer or time up ends it.'],ms:['Soalan bermasa memberi dua cubaan. Salah pertama membuka kedua-dua petunjuk; salah kedua atau masa tamat menamatkannya.']}),
 lesson('boss','journey','boss',
  ['Open the boss seals','A boss has HP and protective seals.',[
   'Find the closed seals. They reduce your Attack damage.',
   'Answer Predict correctly to open one waiting seal. Helped correct answers can also open it.',
   'End the turn before using Predict again. Open the next seal, then keep fighting.'
  ],'After the first boss, continue to Deck Tower. Its boss is the final battle.'],
  ['Buka seal boss','Boss mempunyai HP dan seal perlindungan.',[
   'Cari seal yang tertutup. Seal mengurangkan kerosakan Attack anda.',
   'Jawab Predict dengan betul untuk membuka satu seal. Jawapan betul dengan bantuan juga boleh membukanya.',
   'Tamatkan giliran sebelum menggunakan Predict lagi. Buka seal seterusnya, kemudian teruskan pertempuran.'
  ],'Selepas boss pertama, teruskan ke Deck Tower. Boss di sana ialah pertempuran terakhir.'],
  [frame('boss','Closed seals protect the boss.','Seal tertutup melindungi boss.'),frame('boss-open','A correct Predict opens one seal.','Predict yang betul membuka satu seal.')]),
 lesson('collection','more',null,
  ['Look up a card or Artifact','Use Card Collection to read before planning your Deck.',[
   'Open Card Collection from the Main Menu.',
   'Choose a card to read its cost, effect and upgrade.',
   'Use the Artifacts tab to read discovered Artifacts and their conditions.'
  ],'Collection is a reference. Looking at a card does not add it to your run.'],
  ['Semak kad atau Artifact','Gunakan Koleksi Kad untuk membaca sebelum merancang Deck.',[
   'Buka Koleksi Kad dari Menu utama.',
   'Pilih kad untuk membaca kos, kesan dan naik tarafnya.',
   'Gunakan tab Artifact untuk membaca Artifact yang ditemui serta syaratnya.'
  ],'Koleksi ialah rujukan. Melihat kad tidak menambahkannya ke dalam permainan anda.'],
  [frame('collection','Select a card to inspect it.','Pilih kad untuk melihat penerangannya.'),frame('collection-artifacts','Switch to Artifacts for their effects.','Tukar ke Artifact untuk membaca kesannya.')]),
 lesson('learning','more',null,
  ['Practise maths without a run','Open Education Practice from the Main Menu.',[
   'Choose Learning for unseen questions. Review lets you revisit a selected question.',
   'Read the question and given information. Use Hint, More Hint, diagrams or Basics when needed.',
   'After answering, read the explanation and steps. Change English/BM using the language control.'
  ],'These are Form 4 maths topics. The tutorial explains game controls; Basics can help you revise earlier ideas.'],
  ['Latih matematik tanpa bermain','Buka Latihan Pendidikan dari Menu utama.',[
   'Pilih Learning untuk soalan belum dilihat. Review membolehkan anda mengulang soalan pilihan.',
   'Baca soalan dan maklumat diberi. Gunakan Petunjuk, Petunjuk Lanjut, rajah atau Asas apabila perlu.',
   'Selepas menjawab, baca penerangan dan jalan kerja. Tukar English/BM melalui kawalan bahasa.'
  ],'Topik matematik ini pada aras Tingkatan 4. Tutorial menerangkan kawalan game; Asas membantu mengulang konsep awal.'],
  [frame('learning','Choose Learning or Review.','Pilih Learning atau Review.'),frame('learning-help','Use help to understand the method.','Gunakan bantuan untuk memahami kaedah.')]),
 lesson('reporting','more',null,
  ['Read your report or report a problem','The Learning Report helps you choose what to practise next.',[
   'Open Learning Report. Overview shows your local practice; Details lists question records.',
   'If a game question is unclear, finish it and press Report a problem in Result.',
   'Tick a category, write what was unclear and save. Sharing is optional and follows your saved consent.'
  ],'Tutorial exercises do not count in your real Learning Report. Saved on this device does not mean sent.'],
  ['Baca laporan atau laporkan masalah','Laporan Pembelajaran membantu memilih perkara untuk diulang kaji.',[
   'Buka Laporan Pembelajaran. Ringkasan menunjukkan latihan setempat; Perincian menyenaraikan rekod soalan.',
   'Jika soalan game kurang jelas, selesaikannya dan tekan Laporkan masalah dalam Keputusan.',
   'Tandakan kategori, tulis bahagian yang kurang jelas dan simpan. Perkongsian ialah pilihan mengikut persetujuan anda.'
  ],'Latihan tutorial tidak dikira dalam Laporan Pembelajaran sebenar. Disimpan pada peranti belum bermaksud sudah dihantar.'],
  [frame('report','Check your report and revision suggestions.','Semak laporan dan cadangan ulang kaji.'),frame('report-problem','Tell us which part was unclear.','Nyatakan bahagian yang kurang jelas.')]),
 lesson('settings','more',null,
  ['Save, language and sound','Your run saves in this browser and profile.',[
   'Open Settings to change Game language between English and BM.',
   'Export Save creates a backup. Import Save restores a compatible file after checking it.',
   'Use Game Motion, Combat Effects and Status size for a clearer display. Music, Sound FX and Voice have separate sound controls.'
  ],'Use the same browser to continue. Clearing browser data can remove local progress.'],
  ['Simpanan, bahasa dan bunyi','Permainan disimpan dalam browser dan profil ini.',[
   'Buka Tetapan untuk menukar Bahasa permainan antara English dengan BM.',
   'Eksport Simpanan menghasilkan sandaran. Import Simpanan memulihkan fail serasi selepas disemak.',
   'Gunakan Gerakan permainan, Kesan tempur dan Saiz status untuk paparan lebih jelas. Music, Sound FX dan Voice mempunyai kawalan berasingan.'
  ],'Gunakan browser yang sama untuk menyambung. Memadam data browser boleh memadam rekod setempat.'],
  [frame('settings','Language, save and display controls are in Settings.','Bahasa, simpanan dan kawalan paparan ada dalam Tetapan.'),frame('sound','Adjust Music, Sound FX and Voice separately.','Laraskan Music, Sound FX dan Voice secara berasingan.')],
  {en:['Keyboard: Tab moves focus; Enter/Space activates a button. In battle, number keys play hand positions, 0 selects the tenth, E ends the turn and R opens Predict. Escape closes a dialog.','Your device’s Reduced Motion setting also reduces effects. A different browser/device needs an exported save. Lifetime learning records are separate from a run.'],ms:['Papan kekunci: Tab mengalihkan fokus; Enter/Space menekan butang. Dalam pertempuran, nombor memainkan kedudukan kad, 0 untuk kad kesepuluh, E menamatkan giliran dan R membuka Predict. Escape menutup dialog.','Tetapan Reduced Motion peranti turut mengurangkan kesan. Browser atau peranti lain memerlukan fail eksport save. Rekod pembelajaran sepanjang masa berasingan daripada permainan.']}),
 lesson('ready','more',null,
  ['Ready for your own run','Before each End Turn, do these three checks.',[
   'Read the enemy’s intent. Do you need Block?',
   'Check Energy and choose useful cards. Use Predict or Focus when it helps.',
   'Check HP and your next route after the battle. Return to this guide whenever needed.'
  ],'You can now return to your game. A wrong answer is a chance to learn.'],
  ['Sedia untuk permainan sendiri','Sebelum Tamat giliran, buat tiga semakan ini.',[
   'Baca tindakan musuh. Adakah anda memerlukan Block?',
   'Semak Energy dan pilih kad yang berguna. Gunakan Predict atau Focus apabila membantu.',
   'Semak HP dan laluan seterusnya selepas pertempuran. Kembali ke panduan ini bila-bila masa.'
  ],'Anda kini boleh kembali ke game. Jawapan salah ialah peluang untuk belajar.'],
  [frame('combat','Read intent, check resources, then act.','Baca tindakan musuh, semak sumber, kemudian bertindak.'),frame('results','Complete both stages to finish the journey.','Lengkapkan kedua-dua stage untuk menamatkan perjalanan.')])
 ];
 const paths={basics:['welcome','start','map','combat','cards','first-turn','predict','focus','boss','ready'],all:chapters.map(ch=>ch.id)};
 const groups={start:{en:'Start here',ms:'Mula di sini'},battle:{en:'Your turn',ms:'Giliran anda'},journey:{en:'Between battles',ms:'Antara pertempuran'},more:{en:'Look up when needed',ms:'Rujuk bila perlu'}};
 const legacyStatus={en:'Older rules: Vulnerable adds 2 damage to one incoming Attack hit; Weak removes 2 from one outgoing Attack hit. Each hit uses a stack. Last Ember uses the original Block reset unless another effect retains it.',ms:'Peraturan lama: Vulnerable menambah 2 kerosakan pada satu pukulan Attack diterima; Weak mengurangkan 2 pada satu pukulan Attack diberi. Setiap pukulan menggunakan satu tindanan. Last Ember mengikut reset Block asal kecuali disimpan oleh kesan lain.'};
 function content(id,language='en',legacyRules=false){const ch=chapters.find(ch=>ch.id===id),text=ch[language],details=ch.details[language]||[];return {...text,details:legacyRules&&id==='statuses'?[legacyStatus[language]]:details};}
 const mediaFile=(shot,language='en')=>'tutorial-shot-'+shot+'-'+(language==='ms'?'ms':'en')+'.webp';
 const api={chapters,content,paths,groups,mediaFile};if(typeof module!=='undefined')module.exports=api;else root.DCTutorialData=api;
})(globalThis);
