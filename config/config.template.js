module.exports = {
  port: 8089,
  cdns: ['bootstrap-cdn', 'cdnjs', 'google', 'jsdelivr'],
  db: 'db',
  cdnCollections: [
    {name: 'bootstrap-cdn', aliases: ['bootstrap']},
    {name: 'cdnjs', aliases: ['cdnjs']},
    {name: 'google', aliases: ['google']},
    {name: 'jsdelivr', aliases: ['jsdelivr']}
  ],
  etagsCollection: 'etagsCollection',
  //syncUrl: 'http://localhost:8000/data/',
  syncUrl: 'http://144.76.57.166:8000/data/',
  tasks: {
    sync: {minute: 5}
  },
  maxcdn: {
    alias: 'replace this',
    key: 'replace this',
    secret: 'replace this',
    zoneId: 0 // replace with some zone id
  },
  github: '' // replace with github token
};
