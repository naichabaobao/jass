var MPQ = require('blizzardry/src/lib/mpq');

MPQ.open('common.MPQ', 0, function (mpq) {
  mpq.files.contains('Creature\\Illidan\\Illidan.m2') // true

  // Extract to local filesystem
  mpq.files.extract('Creature\\Illidan\\Illidan.m2', '~/Illidan.m2');

  // Iterate over all entries
  mpq.files.all.forEach(function (result) {
    result.filename // 'SPELLS\\ArcaneBomb_Missle.M2'
    result.name     // 'ArcaneBomb_Missle.M2'
    result.filesize // 28928
  });

  // Search for entries (supports wildcards)
  mpq.files.find('*Illidan*');

  // Accessing file data
  var file = mpq.files.get('Creature\\Illidan\\Illidan.m2');
  file.name // 'Creature\\Illidan\\Illidan.m2'
  file.size // 1888368
  file.data // <Buffer 4d 44 32 30 08 01 00 00 ...>
});

// Or alternatively:
var mpq = MPQ.open('common.MPQ');
// ...
mpq.close();