/* Player instructions. Amounts belong to the loaded engine, not this guide. */
(function(root){'use strict';
 const lesson=(id,image,exercise,en,ms)=>({id,image,exercise,en:{title:en[0],lead:en[1],steps:en[2],tip:en[3]},ms:{title:ms[0],lead:ms[1],steps:ms[2],tip:ms[3]}});
 const chapters=[
 lesson('welcome','menu',null,
  ['Your dungeon journey','Build a deck, plan each turn and use maths to help Alyssa clear two stages.',[
   'Choose connected rooms on the map. Win battles to earn Gold and card choices.',
   'Your HP, deck and owned artifacts carry between rooms. Each battle starts a new hand and combat resources.',
   'Defeat the boss of Sigil Keep, then the boss of Deck Tower. If your HP reaches zero, the run ends.'
  ],'Read any chapter in any order. The Try it panels are separate practice examples.'],
  ['Perjalanan dungeon','Bina deck, rancang giliran dan gunakan matematik untuk membantu Alyssa menamatkan dua stage.',[
   'Pilih bilik yang bersambung pada map. Menangi pertempuran untuk mendapat Gold dan pilihan kad.',
   'HP, deck dan artifak yang dimiliki dibawa ke bilik seterusnya. Tangan kad dan sumber tempur bermula semula pada pertempuran baharu.',
   'Kalahkan boss Sigil Keep, kemudian boss Deck Tower. Run tamat jika HP menjadi sifar.'
  ],'Baca bab mengikut keperluan. Panel Cuba sendiri menggunakan contoh latihan yang berasingan.']),
 lesson('start','master',null,
  ['Start or continue','New Run starts a fresh journey. Continue returns to your saved journey.',[
   'Choose Learn for a gentler introduction or Challenge for the artifact journey. Easy, Medium and Hard are separate balance playtest profiles.',
   'In Challenge, meet the Dungeon Master. Select an offered artifact, then choose Claim & Choose Artifact.',
   'Answer the trial correctly and continue to receive the artifact. Hint, More Hint and Basics can help. Read the artifact effect before choosing.'
  ],'Learn does not start with the Dungeon Master. Starting a replacement run asks before replacing that profile’s save.'],
  ['Mula atau sambung','New Run memulakan perjalanan baharu. Continue menyambung perjalanan yang disimpan.',[
   'Pilih Learn untuk pengenalan yang lebih mudah atau Challenge untuk perjalanan dengan artifak. Easy, Medium dan Hard ialah profil ujian imbangan yang berasingan.',
   'Dalam Challenge, jumpa Dungeon Master. Pilih satu artifak yang ditawarkan, kemudian tekan Claim & Choose Artifact.',
   'Jawab soalan percubaan dengan betul dan teruskan untuk menerima artifak. Hint, More Hint dan Basics boleh membantu. Baca kesan artifak sebelum memilih.'
  ],'Learn tidak bermula dengan Dungeon Master. Game meminta pengesahan sebelum menggantikan save profil tersebut.']),
 lesson('map','map','map',
  ['Choose your next room','Follow the paths from the bottom of the map towards the boss.',[
   'Only glowing, connected rooms can be entered. Selecting a room icon enters it immediately. Scroll up to inspect later floors.',
   'Battle is a normal fight. Elite is a stronger fight with better rewards. Boss ends a stage.',
   'Shop spends Gold, Rest offers recovery or an upgrade, and Mystery has its own choices. Use the legend on the left.'
  ],'Plan with your current HP, Gold and deck. A route with more rewards may also carry more risk.'],
  ['Pilih bilik seterusnya','Ikut laluan dari bahagian bawah map menuju boss.',[
   'Hanya bilik bercahaya yang bersambung boleh dimasuki. Tekan ikon bilik untuk terus masuk. Skrol ke atas untuk melihat tingkat seterusnya.',
   'Battle ialah pertempuran biasa. Elite lebih kuat dan memberi ganjaran lebih baik. Boss menamatkan stage.',
   'Shop menggunakan Gold, Rest memberi pilihan pemulihan atau naik taraf, dan Mystery mempunyai pilihan sendiri. Rujuk petunjuk di sebelah kiri.'
  ],'Rancang berdasarkan HP, Gold dan deck semasa. Laluan dengan lebih banyak ganjaran juga boleh lebih berisiko.']),
 lesson('combat','combat','block',
  ['Read the enemy’s intent','Prepare for the move shown above the enemy before pressing End Turn.',[
   'HP is your health. Block absorbs incoming damage. Ordinary leftover Block resets at the start of your next turn unless an effect keeps some.',
   'A normal turn begins with {energy} Energy and draws {hand} cards. Card and artifact effects may change what you receive.',
   'Use defense before End Turn. The enemy then acts, unused hand cards go to Discard, and the next turn begins if both sides are alive.'
  ],'Block and Defense are different. Defense reduces incoming damage; Block absorbs the damage that remains.'],
  ['Baca tindakan musuh','Bersedia untuk tindakan yang dipaparkan di atas musuh sebelum menekan End Turn.',[
   'HP ialah kesihatan anda. Block menyerap kerosakan masuk. Baki Block biasa direset pada awal giliran seterusnya kecuali kesan tertentu mengekalkannya.',
   'Giliran biasa bermula dengan {energy} Energy dan mengambil {hand} kad. Kesan kad atau artifak boleh mengubah jumlah yang diterima.',
   'Gunakan kad pertahanan sebelum End Turn. Musuh kemudian bertindak, baki kad di tangan masuk ke Discard, dan giliran baharu bermula jika kedua-duanya masih hidup.'
  ],'Block dan Defense berbeza. Defense mengurangkan kerosakan masuk; Block menyerap baki kerosakan.']),
 lesson('cards','cards','attack',
  ['Read and play a card','Read the cost and effect before selecting a card in your hand.',[
   'The cost shows how much Energy a card needs. X uses the available Energy according to that card’s effect. A card you cannot afford cannot be played.',
   'Red Attack cards deal damage, blue Defend cards protect, green Skill cards provide other effects, and purple Passive cards stay active.',
   'There is one enemy per battle. Multi-hit cards hit that same enemy; enemy Block, Defense and boss seals can reduce actual damage.'
  ],'Selecting a normal combat card can play it immediately. Cards needing a target or extra choice open their own choice panel.'],
  ['Baca dan mainkan kad','Baca kos dan kesan sebelum memilih kad di tangan.',[
   'Kos menunjukkan Energy yang diperlukan. X menggunakan Energy yang tersedia mengikut kesan kad itu. Kad tidak boleh dimainkan jika Energy tidak cukup.',
   'Attack merah memberi kerosakan, Defend biru melindungi, Skill hijau memberi kesan lain, dan Passive ungu kekal aktif.',
   'Setiap pertempuran mempunyai satu musuh. Serangan berbilang hit mengenai musuh yang sama; Block, Defense dan seal boss boleh mengurangkan kerosakan sebenar.'
  ],'Menekan kad tempur biasa boleh terus memainkannya. Kad yang memerlukan sasaran atau pilihan tambahan membuka panel pilihan sendiri.']),
 lesson('piles','combat','draw',
  ['Hand, Draw, Discard and Exhaust','Your run deck stays yours even when cards move during a battle.',[
   'Hand contains playable cards. Draw holds cards waiting to be drawn. Used cards usually move to Discard.',
   'When another draw is needed and Draw is empty, Discard is shuffled into Draw. Cards in Hand, Active or Exhaust are not included.',
   'Exhaust removes a card for the current battle. It does not delete it from the run deck. Hand holds at most {handLimit} cards; excess draws stay in the pile.'
  ],'Open a pile to inspect its cards. The display sorts cards and does not reveal the hidden Draw order.'],
  ['Hand, Draw, Discard dan Exhaust','Kad masih milik deck run walaupun bergerak antara timbunan semasa pertempuran.',[
   'Hand mengandungi kad yang boleh dimainkan. Draw menyimpan kad yang menunggu untuk diambil. Kad yang digunakan biasanya masuk ke Discard.',
   'Apabila Draw kosong dan satu lagi kad perlu diambil, Discard dikocok semula ke Draw. Kad dalam Hand, Active atau Exhaust tidak disertakan.',
   'Exhaust mengetepikan kad untuk pertempuran semasa. Kad itu tidak dipadam daripada deck run. Hand memuatkan paling banyak {handLimit} kad; lebihan ambilan kekal dalam timbunan.'
  ],'Buka timbunan untuk melihat kad. Paparan disusun dan tidak mendedahkan urutan sebenar Draw.']),
 lesson('predict','predict','predict',
  ['Predict, Hint and More Hint','Predict opens a maths question from the shared 120-question bank.',[
   'Choose an answer, then check it. An independent correct first answer earns 1 Focus up to the cap of {focusCap}. A helped or retried answer is recorded separately.',
   'Open Hint for a starting idea. A wrong answer submitted after opening Hint unlocks More Hint. Basics explains the foundation; worked steps are available after completion.',
   'Predict is optional and can be used once per turn. Closing it ends that turn’s attempt without a reward. A question already opened will not be repeated in the same run.'
  ],'Pink terms explain maths, green terms explain the game, and purple calculations explain values. Hover, keyboard-focus or tap a highlighted term.'],
  ['Predict, Hint dan More Hint','Predict membuka soalan matematik daripada bank bersama yang mempunyai 120 soalan.',[
   'Pilih jawapan, kemudian semak. Jawapan pertama yang betul secara kendiri memberi 1 Focus sehingga had {focusCap}. Jawapan dengan bantuan atau cubaan semula direkodkan secara berasingan.',
   'Buka Hint untuk idea awal. Jawapan salah yang dihantar selepas Hint dibuka akan membuka More Hint. Basics menerangkan asas; jalan kerja tersedia selepas soalan selesai.',
   'Predict ialah pilihan dan boleh digunakan sekali setiap giliran. Menutupnya menamatkan cubaan giliran itu tanpa ganjaran. Soalan yang sudah dibuka tidak diulang dalam run yang sama.'
  ],'Istilah merah jambu menerangkan matematik, hijau menerangkan game, dan pengiraan ungu menerangkan nilai. Letakkan penuding, fokus papan kekunci atau tekan istilah yang disorot.']),
 lesson('focus','focus','focus',
  ['Arm and spend Focus','Focus is a separate resource. It does not give extra Energy.',[
   'After earning Focus, press the Focus control to arm it. Inspect the changed card effect before playing.',
   'The next eligible Attack, Defend or Skill card spends 1 Focus and receives its printed Focus effect. Different cards have different bonuses.',
   'Use Focus at most once per turn. Passive cards never spend it. Focus stock resets for a new battle; plan to use it where it helps.'
  ],'This practice starts with 1 example Focus. Earn your own Focus through Predict in a real run.'],
  ['Aktifkan dan gunakan Focus','Focus ialah sumber berasingan. Ia tidak memberi Energy tambahan.',[
   'Selepas mendapat Focus, tekan kawalan Focus untuk mengaktifkannya. Lihat perubahan kesan kad sebelum bermain.',
   'Kad Attack, Defend atau Skill seterusnya yang layak menggunakan 1 Focus dan menerima kesan Focus yang tertulis. Bonus berbeza mengikut kad.',
   'Gunakan Focus paling banyak sekali setiap giliran. Passive tidak menggunakannya. Stok Focus direset pada pertempuran baharu; gunakan apabila bermanfaat.'
  ],'Latihan ini bermula dengan 1 Focus contoh. Dalam run sebenar, dapatkan Focus sendiri melalui Predict.']),
 lesson('passive','passive','passive',
  ['Passives, buffs and debuffs','A Passive must be played before its ongoing effect can help you.',[
   'Up to {passiveLimit} different Passives can be active. Playing another when full asks which one to replace; the replaced card goes to Discard.',
   'Some Passives help immediately. Others wait for a condition. Read their counter and description; a visible card does not mean its trigger has happened.',
   'Strength helps Attack damage, Agility helps Block from Defend cards, and Defense reduces incoming damage. Read status badges for conditions and duration.',
   'Vulnerable adds 50% to Attack damage for the affected attack phase. Weak reduces Attack damage by 25%. Every hit is affected; stacks extend duration. Unused Last Ember emergency Block survives the next player-turn reset once.'
  ],'Auras and animations show status feedback. The current numbers and descriptions determine the actual effect.'],
  ['Passive, buff dan debuff','Kad Passive perlu dimainkan dahulu sebelum kesan berterusannya membantu.',[
   'Paling banyak {passiveLimit} Passive yang berbeza boleh aktif. Jika penuh, game meminta anda memilih satu untuk diganti; kad lama masuk ke Discard.',
   'Sesetengah Passive memberi kesan segera. Yang lain menunggu syarat. Baca kaunter dan penerangan; kad yang kelihatan belum tentu sudah mencetuskan kesannya.',
   'Strength membantu kerosakan Attack, Agility membantu Block daripada Defend, dan Defense mengurangkan kerosakan masuk. Baca lencana status untuk syarat dan tempoh kesan.',
   'Terdedah menambah 50% kerosakan Serangan pada fasa serangan yang terlibat. Lemah mengurangkan kerosakan Serangan sebanyak 25%. Setiap pukulan terlibat; tindanan memanjangkan tempoh. Baki Blok kecemasan Bara Terakhir disimpan sekali pada awal giliran pemain berikutnya.'
  ],'Aura dan animasi memberi maklum balas status. Nilai serta penerangan semasa menentukan kesan sebenar.']),
 lesson('rewards','rewards','reward',
  ['Choose rewards for your deck','After a battle, review your card choices before adding one.',[
   'Choose one offered card or Skip. Taking every card can make important cards harder to draw.',
   'An Elite card reward is upgraded. In Challenge, eligible encounters can also offer artifacts; complete any required trial before moving on.',
   'Compare cost, role, Focus effect and synergy with your existing cards. Read an artifact’s trigger as well as its reward.'
  ],'Gold and reward amounts depend on the current mode/profile. These pictures show examples, not guaranteed offers.'],
  ['Pilih ganjaran untuk deck','Selepas pertempuran, semak pilihan kad sebelum menambah satu.',[
   'Pilih satu kad yang ditawarkan atau Skip. Mengambil semua kad boleh menyukarkan kad penting untuk muncul.',
   'Ganjaran kad Elite sudah dinaik taraf. Dalam Challenge, pertemuan tertentu juga menawarkan artifak; selesaikan percubaan yang diperlukan sebelum bergerak.',
   'Bandingkan kos, peranan, kesan Focus dan gabungan dengan kad sedia ada. Baca syarat pencetus artifak bersama ganjarannya.'
  ],'Jumlah Gold dan ganjaran bergantung pada mode atau profil semasa. Gambar ini ialah contoh, bukan tawaran yang dijamin.']),
 lesson('shop','shop','shop',
  ['Use the Shop','Spend Gold on a useful improvement, or leave and keep your Gold.',[
   'Buy Cards shows six cards, including one sale at 60% off. Buy Artifacts has a separate stock. Read the displayed price and effect.',
   'Select a card or artifact, then confirm its Buy button. A purchased offer becomes Sold; reopening the Shop does not refresh the stock.',
   'Remove Card is a paid service. Select a card, check the cost and confirm; minimum deck size and service limits still apply. Use Leave to continue.'
  ],'The practice below buys one real example card with example Gold. Your own Gold and inventory are untouched.'],
  ['Gunakan Shop','Belanjakan Gold untuk penambahbaikan yang berguna, atau keluar dan simpan Gold.',[
   'Buy Cards memaparkan enam kad, termasuk satu jualan dengan diskaun 60%. Buy Artifacts mempunyai stok berasingan. Baca harga dan kesan yang dipaparkan.',
   'Pilih kad atau artifak, kemudian sahkan dengan butang Buy. Tawaran yang dibeli menjadi Sold; membuka semula Shop tidak menukar stok.',
   'Remove Card ialah perkhidmatan berbayar. Pilih kad, semak kos dan sahkan; had minimum deck dan had perkhidmatan masih terpakai. Tekan Leave untuk teruskan.'
  ],'Latihan di bawah membeli satu kad contoh dengan Gold contoh. Gold dan inventori anda sendiri tidak berubah.']),
 lesson('rest','rest','rest',
  ['Rest or upgrade','A Rest site offers a choice for the next part of your journey.',[
   'Rest restores the displayed HP, up to your maximum. Check your HP before choosing.',
   'Upgrade strengthens one eligible card for the rest of this run. Select an unupgraded card and compare its improved effect.',
   'You use one Rest-site action and then return to the map. Decide whether recovery or a stronger card matters more right now.'
  ],'The supplied background includes decorative words. The live buttons show which actions are actually available.'],
  ['Pulih atau naik taraf','Rest memberi pilihan untuk bahagian perjalanan seterusnya.',[
   'Rest memulihkan HP mengikut jumlah yang dipaparkan, sehingga HP maksimum. Semak HP sebelum memilih.',
   'Upgrade menguatkan satu kad yang layak untuk baki run ini. Pilih kad yang belum dinaik taraf dan bandingkan kesannya.',
   'Anda menggunakan satu tindakan di Rest sebelum kembali ke map. Tentukan sama ada pemulihan atau kad lebih kuat lebih diperlukan sekarang.'
  ],'Latar asal mengandungi perkataan hiasan. Butang langsung menunjukkan tindakan yang benar-benar tersedia.']),
 lesson('mystery','mystery',null,
  ['Read a Mystery before committing','Mystery rooms have event-specific choices, costs and consequences.',[
   'Read the introduction and each option before choosing. Some choices use HP or Gold, change your deck, or lead to a battle.',
   'A timed challenge shows its deadline. Use the available help before submitting; Mystery uses one final answer, unlike Predict retries.',
   'Review the outcome and claim any required reward or target before leaving. Refreshing does not give a fresh question or restart the deadline.'
  ],'A timed Mystery keeps running while other panels are open. Finish it before spending time in this guide.'],
  ['Baca Mystery sebelum memilih','Bilik Mystery mempunyai pilihan, kos dan akibat mengikut event.',[
   'Baca pengenalan dan setiap pilihan dahulu. Sesetengah pilihan menggunakan HP atau Gold, mengubah deck atau membawa kepada pertempuran.',
   'Cabaran bermasa memaparkan had masa. Gunakan bantuan sebelum menghantar jawapan; Mystery menggunakan satu jawapan akhir, berbeza daripada cubaan semula Predict.',
   'Semak keputusan dan tuntut ganjaran atau pilih sasaran yang diperlukan sebelum keluar. Refresh tidak memberi soalan baharu atau memulakan masa semula.'
  ],'Masa Mystery terus berjalan apabila panel lain dibuka. Selesaikannya sebelum meluangkan masa dalam panduan ini.']),
 lesson('boss','boss','boss',
  ['Open the boss seals','Bosses have seals as well as HP. Read their intent every turn.',[
   'Unopened seals reduce your attack damage. A correct Predict answer opens one waiting seal; a guided correct answer can also open it.',
   'Predict is still once per turn. To open the next seal, finish the turn and answer the next Predict. Skipping or a wrong unfinished answer does not open a seal.',
   'After the first boss, use the stage-clear action to enter Deck Tower. The second boss is the final battle.'
  ],'The exercise below lets you open both seals using the real question and combat rules.'],
  ['Buka seal boss','Boss mempunyai seal selain HP. Baca tindakannya setiap giliran.',[
   'Seal yang belum dibuka mengurangkan kerosakan serangan anda. Jawapan Predict yang betul membuka satu seal yang menunggu; jawapan betul dengan bantuan juga boleh membukanya.',
   'Predict masih sekali setiap giliran. Untuk seal seterusnya, tamatkan giliran dan jawab Predict baharu. Melangkau atau meninggalkan jawapan salah tidak membuka seal.',
   'Selepas boss pertama, gunakan tindakan Stage Clear untuk memasuki Deck Tower. Boss kedua ialah pertempuran terakhir.'
  ],'Latihan di bawah membolehkan anda membuka kedua-dua seal menggunakan soalan dan peraturan tempur sebenar.']),
 lesson('learning','learning',null,
  ['Practise maths and read your report','Education Practice is available from the Main Menu without starting a run.',[
   'Explore Probability, Sets and Logical Reasoning. Learning selects unseen questions; Review lets you revisit a chosen question.',
   'Use Hint, More Hint, Basics, diagrams and worked solutions. Settings changes the language of questions, hints and solutions between BM and English.',
   'Learning Report separates independent, supported, retried and revealed work. Comments help improve a question. Export records when needed; sharing starts off and needs a configured destination and your consent.'
  ],'Tutorial exercises are practice examples and never count towards your real Learning Report or question history.'],
  ['Latih matematik dan baca laporan','Education Practice boleh dibuka dari Main Menu tanpa memulakan run.',[
   'Terokai Kebarangkalian, Set dan Penaakulan Logik. Learning memilih soalan belum dilihat; Review membolehkan anda mengulang soalan pilihan.',
   'Gunakan Hint, More Hint, Basics, rajah dan jalan kerja. Settings menukar bahasa soalan, petunjuk dan jalan kerja antara BM dengan English.',
   'Learning Report membezakan jawapan kendiri, berbantu, cubaan semula dan jawapan yang didedahkan. Komen membantu menambah baik soalan. Eksport rekod jika perlu; perkongsian bermula dalam keadaan tutup dan memerlukan destinasi serta persetujuan anda.'
  ],'Latihan tutorial ialah contoh dan tidak dikira dalam Learning Report atau sejarah soalan sebenar.']),
 lesson('settings','settings',null,
  ['Save, sound and controls','Your current run saves automatically in this browser and profile.',[
   'Use Settings → Export Save for a backup. Import Save lets you restore a compatible file after checking it. Another device or browser needs that exported file.',
   'Music, Sound FX and Voice have their own controls. Motion Off and your device’s Reduced Motion setting reduce effects.',
   'Use click/tap or Tab and Enter/Space. In battle, number keys play hand positions (0 is the tenth); E ends the turn, R opens Predict. Escape closes an open dialog.'
  ],'New Run resets that run’s seen-question list. Lifetime learning history is separate. Clearing browser data can remove local saves.'],
  ['Simpanan, bunyi dan kawalan','Run semasa disimpan secara automatik dalam browser dan profil ini.',[
   'Gunakan Settings → Export Save untuk salinan sandaran. Import Save memulihkan fail yang serasi selepas disemak. Peranti atau browser lain memerlukan fail eksport itu.',
   'Music, Sound FX dan Voice mempunyai kawalan masing-masing. Motion Off dan tetapan Reduced Motion peranti mengurangkan kesan.',
   'Gunakan klik atau sentuhan, atau Tab dan Enter/Space. Dalam pertempuran, kekunci nombor memainkan kedudukan kad (0 untuk kad kesepuluh); E menamatkan giliran, R membuka Predict. Escape menutup dialog terbuka.'
  ],'New Run mereset senarai soalan yang dilihat dalam run itu. Sejarah pembelajaran sepanjang masa berasingan. Memadam data browser boleh memadam save setempat.']),
 lesson('ready','results',null,
  ['Ready for your own run','You can return to this guide whenever you need a reminder.',[
   'Before End Turn: read intent, check your HP and Block, and use your Energy deliberately.',
   'Before taking a reward: ask whether it helps your deck. Before choosing a path: check HP, Gold and recovery options.',
   'Use Predict and its help to build understanding. A wrong answer is a chance to improve your reasoning.'
  ],'Return to the game to continue your existing run, or choose New Run from the Main Menu when you are ready.'],
  ['Sedia untuk run sendiri','Anda boleh kembali ke panduan ini apabila memerlukan peringatan.',[
   'Sebelum End Turn: baca intent, semak HP dan Block, serta gunakan Energy dengan tujuan.',
   'Sebelum mengambil ganjaran: fikir sama ada ia membantu deck. Sebelum memilih laluan: semak HP, Gold dan peluang pemulihan.',
   'Gunakan Predict dan bantuannya untuk memahami konsep. Jawapan salah ialah peluang untuk membaiki penaakulan.'
  ],'Kembali ke game untuk menyambung run sedia ada, atau pilih New Run dari Main Menu apabila bersedia.'])
 ];
 const legacyStatus={en:'Vulnerable adds 2 damage to one incoming Attack hit. Weak removes 2 damage from one outgoing Attack hit. Each hit uses one stack. Last Ember Block follows the original turn reset unless another effect retains it.',ms:'Terdedah menambah 2 kerosakan pada satu pukulan Serangan yang diterima. Lemah mengurangkan 2 kerosakan pada satu pukulan Serangan yang diberi. Setiap pukulan menggunakan satu tindanan. Blok Bara Terakhir mengikut tetapan semula giliran asal kecuali disimpan oleh kesan lain.'};
 function content(id,language='en',legacyRules=false){const text=chapters.find(ch=>ch.id===id)[language];return legacyRules&&id==='passive'?{...text,steps:[...text.steps.slice(0,-1),legacyStatus[language]]}:text;}
 const api={chapters,content};if(typeof module!=='undefined')module.exports=api;else root.DCTutorialData=api;
})(globalThis);
