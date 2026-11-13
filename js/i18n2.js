/* Extra texts for version 2 (picture help, peekaboo levels, themes, songs). Plain ES5. */
(function () {
  var X = {
    fr: {
      look: 'Regarde bien !',
      black: 'noir',
      songsLabel: 'Chansons',
      themeLabel: 'Thème',
      themes: ['Animaux', 'Véhicules', 'Fruits & légumes', 'La mer'],
      peekLv: ['Coucou', 'Regarde et retiens', 'Suis l’animal'],
      help: {
        animals: [['Touche un animal : il dit son nom et son cri.'],
                  ['Écoute la question, puis touche le bon animal.'],
                  ['Écoute la question, puis trouve l’animal parmi 6.']],
        bubbles: [['Touche les bulles pour les éclater.'],
                  ['Les bulles vont plus vite.', 'Certaines cachent un animal !'],
                  ['Écoute la couleur, puis éclate seulement ces bulles.']],
        peek: [['Touche la couverture : coucou !'],
               ['Regarde bien les animaux.', 'Ils se cachent : où est celui qu’on demande ?'],
               ['Regarde où se cache l’animal.', 'Les couvertures bougent : suis-les des yeux !', 'Puis touche la bonne couverture.']],
        piano: [['Touche les touches pour jouer de la musique.'],
                ['Touche n’importe quelle touche : la chanson se joue toute seule !'],
                ['Touche la touche qui brille, puis la suivante…']],
        memory: [['Retourne deux cartes.', 'Deux images pareilles ? Elles restent ouvertes !']]
      }
    },
    en: {
      look: 'Look carefully!',
      black: 'black',
      songsLabel: 'Songs',
      themeLabel: 'Theme',
      themes: ['Animals', 'Vehicles', 'Fruit & veg', 'The sea'],
      peekLv: ['Peekaboo', 'Look and remember', 'Follow the animal'],
      help: {
        animals: [['Tap an animal: it says its name and its sound.'],
                  ['Listen to the question, then tap the right animal.'],
                  ['Listen to the question, then find the animal among 6.']],
        bubbles: [['Tap the bubbles to pop them.'],
                  ['The bubbles are faster.', 'Some hide an animal!'],
                  ['Listen to the colour, then pop only those bubbles.']],
        peek: [['Tap the blanket: peekaboo!'],
               ['Look at the animals.', 'They hide: where is the one you hear?'],
               ['Watch where the animal hides.', 'The blankets move: follow them with your eyes!', 'Then tap the right blanket.']],
        piano: [['Tap the keys to make music.'],
                ['Tap any key: the song plays by itself!'],
                ['Tap the key that shines, then the next one…']],
        memory: [['Turn over two cards.', 'Two the same? They stay open!']]
      }
    },
    de: {
      look: 'Schau genau hin!',
      black: 'Schwarz',
      songsLabel: 'Lieder',
      themeLabel: 'Thema',
      themes: ['Tiere', 'Fahrzeuge', 'Obst & Gemüse', 'Das Meer'],
      peekLv: ['Kuckuck', 'Schau und merk es dir', 'Folge dem Tier'],
      help: {
        animals: [['Tippe auf ein Tier: Es sagt seinen Namen und macht sein Geräusch.'],
                  ['Hör die Frage und tippe auf das richtige Tier.'],
                  ['Hör die Frage und finde das Tier unter 6.']],
        bubbles: [['Tippe auf die Blasen, damit sie platzen.'],
                  ['Die Blasen sind schneller.', 'Manche verstecken ein Tier!'],
                  ['Hör die Farbe und lass nur diese Blasen platzen.']],
        peek: [['Tippe auf die Decke: Kuckuck!'],
               ['Schau dir die Tiere gut an.', 'Sie verstecken sich: Wo ist das genannte Tier?'],
               ['Schau, wo sich das Tier versteckt.', 'Die Decken bewegen sich: Folge ihnen mit den Augen!', 'Dann tippe auf die richtige Decke.']],
        piano: [['Tippe auf die Tasten und mach Musik.'],
                ['Tippe auf irgendeine Taste: Das Lied spielt von selbst!'],
                ['Tippe auf die leuchtende Taste, dann auf die nächste…']],
        memory: [['Dreh zwei Karten um.', 'Zweimal das gleiche Bild? Sie bleiben offen!']]
      }
    },
    ru: {
      look: 'Смотри внимательно!',
      black: 'чёрный',
      songsLabel: 'Песни',
      themeLabel: 'Тема',
      themes: ['Животные', 'Транспорт', 'Фрукты и овощи', 'Море'],
      peekLv: ['Ку-ку', 'Смотри и запоминай', 'Следи за животным'],
      help: {
        animals: [['Нажми на животное — оно скажет, как его зовут и как оно говорит.'],
                  ['Послушай вопрос и нажми на нужное животное.'],
                  ['Послушай вопрос и найди животное среди 6.']],
        bubbles: [['Нажимай на пузыри, чтобы они лопались.'],
                  ['Пузыри летят быстрее.', 'В некоторых прячутся животные!'],
                  ['Послушай цвет и лопай только такие пузыри.']],
        peek: [['Нажми на покрывало: ку-ку!'],
               ['Посмотри внимательно на животных.', 'Они спрятались: где то, которое назвали?'],
               ['Посмотри, где прячется животное.', 'Покрывала двигаются — следи за ними глазами!', 'Потом нажми на нужное покрывало.']],
        piano: [['Нажимай на клавиши и играй музыку.'],
                ['Нажимай на любую клавишу — песенка играет сама!'],
                ['Нажми на светящуюся клавишу, потом на следующую…']],
        memory: [['Переверни две карты.', 'Две одинаковые? Они остаются открытыми!']]
      }
    }
  };
  for (var l in X) {
    if (X.hasOwnProperty(l)) {
      for (var k in X[l]) { if (X[l].hasOwnProperty(k)) { I18N[l][k] = X[l][k]; } }
      I18N[l].games.peek.lv = X[l].peekLv;
    }
  }
})();
