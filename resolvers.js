const {PubSub} = require('graphql-subscriptions')
const db = require('./db');

const pubSub = new PubSub()
const ACCOUNT_ADDED = 'ACCOUNT_ADDED' 
const ACCOUNTS_ADDED = 'ACCOUNTS_ADDED' 

function requireAuth(userId) {
  if (!userId) {    throw new Error('Unauthorized');
  }
}

const Query = {
  messages: (_root, _args, {userId}) => {
    //requireAuth(userId);
    return db.messages.list();
  },
  accounts:(_root, _args)=>{
    return db.accounts.list()
  },
  contacts:(_root, _args)=>{
    return db.contacts.list()
  },
  engagements:(_root, _args)=>{
    return db.engagements.list()
  },
  drnotes:(_root, _args)=>{
    return db.drnotes.list()
  },
  contact:(_root, {id})=>{
    return db.contacts.get(id)
  }
}

const Contact = {
  account :(contact)=>db.accounts.get(contact.accountId)          

}

const Account = {
  contacts : (account)=>db.contacts.list().filter((c)=>c.accountId === account.id)
}

const Engagement = {
  contact : (eng)=>db.contacts.get(eng.contactId)
}

const DrNote = {
  contact : (drnote)=>db.contacts.get(drnote.contactId),
  engagement: (drnote)=>db.engagements.get(drnote.engagementId),

}

const Mutation = {
  createAccount: (_root, {input}) => {    
    const accountId = db.accounts.create({name: input.name});
    const acct = db.accounts.get(accountId);
    console.log('New acct created ... ' + acct)
    pubSub.publish(ACCOUNT_ADDED, {accountAdded: acct})
    return acct
  },
  createAccounts: (_root, {input}) => {
    console.log('input - ' + JSON.stringify(input))
    //Create account
    const accountIds = input.map( (acct) => {
      const acctId = db.accounts.create({name: acct.name})
      console.log('contacts data ' + acct.contacts)
      acct.contacts && acct.contacts.map((theContact)=>{
        db.contacts.create({...theContact, accountId:acctId})
      })      
      return acctId
     }
    )
    console.log('accountIds = ' + accountIds)
    const accts =   accountIds.map((acctId)=>db.accounts.get(acctId)) 
    //console.log('New acct created ... ' + acct)
    pubSub.publish(ACCOUNTS_ADDED, {accountsAdded: accts})
    return accts
  }
}

const Subscription = {
  accountAdded: {
    subscribe: (_root, {input}) => {
      //console.log('userId', userId)
      //requireAuth(userId);
      console.log('Pub sub async iterateable ')
      return pubSub.asyncIterator(ACCOUNT_ADDED)
    }
  },
  accountsAdded: {
    subscribe: (_root, {input}) => {
      //console.log('userId', userId)
      //requireAuth(userId);
      console.log('Pub sub async iterateable ')
      return pubSub.asyncIterator(ACCOUNTS_ADDED)
    }
  }
}

module.exports = { Query, Mutation, Subscription, Contact, Account, Engagement, DrNote};
