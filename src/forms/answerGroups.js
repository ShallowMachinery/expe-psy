const answerGroups = {
  "Happiness": {
    exact: ["Happiness", "Kasiyahan", "Happy", "Masaya"],
    related: ["Maligaya", "Natutuwa", "Nagagalak", "Cheerful", "Joyful", "Glad", "Yehey", "Yippie", "Merry", "Delighted", "Thrilled", "Satisfied", "Excited"],
    unrelated: ["Galit", "Suklam", "Naiinis", "Nabubuwisit", "Nabubwisit", "Naiirita", "Annoyed", "Irritated", "Rage", "Hatred", "Malungkot", "Pighati", "Nagluluksa", "Hinagpis", "Nalulumbay", "Naiiyak", "Unhappy", "Forlorn", "Heartbroken", "Gloomy", "Depressed", "Kadiri", "Nasusuya", "Nagsasawa", "Nakakasuka", "Icky", "Repulsed", "Gross", "Yuck", "Ew", "Takot", "Kaba", "Pangamba", "Nakapagpapabagabag", "Natataranta", "Scared", "Afraid", "Anxious", "Fearful", "Panic", "Terrified", "Gulat", "Nabigla", "Pagkamangha", "Nagimbal", "Shocked", "Stunned", "Astonished", "Startled", "Buwisit", "Bwisit", "Nakangiti", "Smile", "Smiling"]
  },
  "Disgust": {
    exact: ["Disgust", "Disgusted", "Kadiri", "Nandidiri"],
    related: ["Nasusuya", "Nagsasawa", "Nakakasuka", "Icky", "Repulsed", "Gross", "Yuck", "Ew"],
    unrelated: ["Masaya", "Maligaya", "Natutuwa", "Nagagalak", "Cheerful", "Joyful", "Glad", "Yehey", "Yippie", "Merry", "Delighted", "Thrilled", "Satisfied", "Galit", "Suklam", "Naiinis", "Nabubwisit", "Naiirita", "Annoyed", "Irritated", "Rage", "Hatred", "Malungkot", "Pighati", "Nagluluksa", "Hinagpis", "Nalulumbay", "Naiiyak", "Unhappy", "Forlorn", "Heartbroken", "Gloomy", "Depressed", "Takot", "Kaba", "Pangamba", "Nakapagpapabagabag", "Natataranta", "Scared", "Afraid", "Anxious", "Fearful", "Panic", "Terrified", "Gulat", "Nabigla", "Pagkamangha", "Nagimbal", "Shocked", "Stunned", "Astonished", "Startled"]
  },
  "Surprise": {
    exact: ["Surprised", "Pagkagulat", "Gulat", "Nagugulat", "Nagulat", "Surprise"],
    related: ["Nabigla", "Pagkamangha", "Nagimbal", "Shocked", "Stunned", "Astonished", "Startled", "Amazed", "Shock", "Shocks"],
    unrelated: ["Masaya", "Maligaya", "Natutuwa", "Nagagalak", "Cheerful", "Joyful", "Glad", "Yehey", "Yippie", "Merry", "Delighted", "Thrilled", "Satisfied", "Galit", "Suklam", "Naiinis", "Nabubwisit", "Naiirita", "Annoyed", "Irritated", "Rage", "Hatred", "Malungkot", "Pighati", "Nagluluksa", "Hinagpis", "Nalulumbay", "Naiiyak", "Unhappy", "Forlorn", "Heartbroken", "Gloomy", "Depressed", "Kadiri", "Nasusuya", "Nagsasawa", "Nakakasuka", "Icky", "Repulsed", "Gross", "Yuck", "Ew", "Takot", "Kaba", "Pangamba", "Nakapagpapabagabag", "Natataranta", "Scared", "Afraid", "Anxious", "Fearful", "Panic", "Terrified"]
  },
  "Fear": {
    exact: ["Fear", "Pagkatakot", "Takot", "Natatakot", "Fearful", "Natakot"],
    related: ["Kaba", "Pangamba", "Nakapagpabagabag", "Natataranta", "Scared", "Afraid", "Anxious", "Panic", "Terrified", "Worried", "Frightened"],
    unrelated: ["Masaya", "Maligaya", "Natutuwa", "Nagagalak", "Cheerful", "Joyful", "Glad", "Yehey", "Yippie", "Merry", "Delighted", "Thrilled", "Satisfied", "Galit", "Suklam", "Naiinis", "Nabubwisit", "Naiirita", "Annoyed", "Irritated", "Rage", "Hatred", "Malungkot", "Pighati", "Nagluluksa", "Hinagpis", "Nalulumbay", "Naiiyak", "Unhappy", "Forlorn", "Heartbroken", "Gloomy", "Depressed", "Kadiri", "Nasusuya", "Nagsasawa", "Nakakasuka", "Icky", "Repulsed", "Gross", "Yuck", "Ew", "Gulat", "Nabigla", "Pagkamangha", "Nagimbal", "Shocked", "Stunned", "Astonished", "Startled", "Surprised", "Surprise"]
  },
  "Anger": {
    exact: ["Anger", "Angry", "Pagkagalit", "Galit"],
    related: ["Suklam", "Naiinis", "Nabubuwisit", "Nabubwisit", "Naiirita", "Annoyed", "Irritated", "Rage", "Hatred", "Pissed", "Buwisit", "Bwisit", "Mad", "Dismay", "Frustrated", "Scornful", "Upset", "Grumpy"],
    unrelated: ["Masaya", "Maligaya", "Natutuwa", "Nagagalak", "Cheerful", "Joyful", "Glad", "Yehey", "Yippie", "Merry", "Delighted", "Thrilled", "Satisfied", "Malungkot", "Pighati", "Nagluluksa", "Hinagpis", "Nalulumbay", "Naiiyak", "Unhappy", "Forlorn", "Heartbroken", "Gloomy", "Depressed", "Kadiri", "Nasusuya", "Nagsasawa", "Nakakasuka", "Icky", "Repulsed", "Gross", "Yuck", "Ew", "Takot", "Kaba", "Pangamba", "Nakapagpapabagabag", "Natataranta", "Scared", "Afraid", "Anxious", "Fearful", "Panic", "Terrified", "Gulat", "Nabigla", "Pagkamangha", "Nagimbal", "Shocked", "Stunned", "Astonished", "Startled"]
  },
  "Sadness": {
    exact: ["Sadness", "Sad", "Kalungkutan", "Malungkot", "Nalulungkot"],
    related: ["Pighati", "Nagluluksa", "Hinagpis", "Nalulumbay", "Naiiyak", "Unhappy", "Forlorn", "Heartbroken", "Gloomy", "Depressed", "Depress", "Blue", "Distressed"],
    unrelated: ["Kadiri", "Nasusuya", "Nagsasawa", "Nakakasuka", "Icky", "Repulsed", "Gross", "Yuck", "Ew", "Takot", "Kaba", "Pangamba", "Nakapagpapabagabag", "Natataranta", "Scared", "Afraid", "Anxious", "Fearful", "Panic", "Terrified", "Gulat", "Nabigla", "Pagkamangha", "Nagimbal", "Shocked", "Stunned", "Astonished", "Startled", "Galit", "Suklam", "Naiinis", "Nabubwisit", "Naiirita", "Annoyed", "Irritated", "Rage", "Hatred", "Masaya", "Maligaya", "Natutuwa", "Nagagalak", "Cheerful", "Joyful", "Glad", "Yehey", "Yippie", "Merry", "Delighted", "Thrilled", "Satisfied"]
  }
};

export default answerGroups;