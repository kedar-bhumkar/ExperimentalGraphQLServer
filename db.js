const { DataStore } = require('notarealdb');

const store = new DataStore('./data');

module.exports = {
  accounts: store.collection('account'),
  contacts: store.collection('contact'),
  engagements: store.collection('engagement'),
  drnotes: store.collection('drnote'),
  assessmentplans: store.collection('assessmentplan')
}