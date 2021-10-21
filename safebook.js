const nacl      = require('tweetnacl')
nacl.util       = require('tweetnacl-util')
const bs58check = require('bs58check')
const bip32     = require('bip32')
const bip39     = require('bip39')
const ed2curve  = require('ed2curve')

lang = 'french'
bip39.setDefaultWordlist(lang)

let safebook = {
  create: () => {
    return safebook.generate_account()
  },
  load: (password) => {
    if (bip39.validateMnemonic(password))
      return safebook.load_from_mnemonic(password)
    else // TODO: base58 test
      return safebook.load_from_entropy(password)
  },
  load_from_entropy: (entropy) => {
    let mnemonic = bip39.entropyToMnemonic(Buffer.from(safebook.decode(entropy)).toString('hex'))
    return safebook.load_from_mnemonic(mnemonic)
  },
  load_from_mnemonic: (mnemonic) => {
    if (!bip39.validateMnemonic(mnemonic))
      return
    let account = {}
    account.mnemonic = mnemonic
    account.entropy = safebook.encode(Buffer.from(bip39.mnemonicToEntropy(mnemonic), 'hex'))
    account.seed = bip39.mnemonicToSeedSync(mnemonic).slice(0,32)
    account.sign = nacl.sign.keyPair.fromSeed(account.seed)
    account.box  = ed2curve.convertKeyPair(account.sign)
    account.address = safebook.encode(account.sign.publicKey)
    account.name = safebook.name(account)
    return account
  },
  generate_account: () => {
    return safebook.load(bip39.generateMnemonic())
  },
  generate_vanity_account: () => {
    while (1) {
      let account = safebook.generate_account()
      if (['sb','sB','Sb','SB'].includes(account.address.substr(0,2)))
        return account
    }
  },
  name: (account) => {
    let n = Buffer.from(safebook.decode(account.address).slice(0,4)).reduce((a,b) => a * Math.pow(2,8) + b, 0)
    i1 = (n >> 0)   & (Math.pow(2,11) - 1)
    i2 = (n >> 11)  & (Math.pow(2,11) - 1)
    i3 = (n >> 22)  & (Math.pow(2,11) - 1)
    return [i1, i2, i3].map(i => bip39.wordlists[lang][i])
  },
  encrypt: (account, address, message) => { // TODO: split into encrypt (low level : Uint8Array) and hide (high level : str)
    plaintext  = nacl.util.decodeUTF8(message)
    publicKey  = safebook.decode(address) // TODO: Why ed2curve not needed !?? 
    nonce      = nacl.randomBytes(nacl.secretbox.nonceLength)
    ciphertext = nacl.box(Buffer.from(message), nonce, publicKey, account.box.secretKey)
    payload    = new Uint8Array(nonce.length + ciphertext.length)
    payload.set(nonce)
    payload.set(ciphertext, nonce.length)
    return nacl.util.encodeBase64(payload)
  },
  decrypt: (account, address, message) =>
  {
    data       = nacl.util.decodeBase64(message)
    nonce      = data.slice(0, nacl.box.nonceLength)
    ciphertext = data.slice(nacl.box.nonceLength)
    publicKey  = safebook.decode(address) // TODO: Why ed2curve not needed !?? 
    plaintext  = nacl.box.open(ciphertext, nonce, publicKey, account.box.secretKey)
    return nacl.util.encodeUTF8(plaintext)
  },
  // address (public key) encoding and decoding
  encode: (public_key) => {
    return bs58check.encode(Buffer.from(public_key)).split("").reverse().join("")
  },
  decode: (public_key) => {
    return new Uint8Array(bs58check.decode(public_key.split("").reverse().join("")))
  },
  sign: (account, message) =>
  {
    plaintext = nacl.util.decodeUTF8(message)
    signature = nacl.sign.detached(plaintext, account.sign.secretKey)
    return nacl.util.encodeBase64(signature)
  },
  verify: (address, message, signature) =>
  {
    plaintext  = nacl.util.decodeUTF8(message)
    bSignature = nacl.util.decodeBase64(signature)
    bAddress   = safebook.decode(address)
    return nacl.sign.detached.verify(plaintext, bSignature, bAddress)
  }
}

module.exports = safebook
