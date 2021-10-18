safebook = require('./safebook')

test = (name, f) => f()
assert = (a) => {
  if (a) process.stdout.write("."); else console.log("Failed");
}
assert_equal = (a, b) => {
  if (a == b) process.stdout.write("."); else console.log(`Failed : ${a} != ${b}`)
}
assert_equal_uint8array = (a, b) => {
  if (a.toString() == b.toString()) process.stdout.write("."); else console.log(`Failed : ${a} != ${b}`)
}
assert_throw = (f) => {
  try { f(); assert(false) } catch { assert(true) }
}
alter = (a) => a[0]--

mnemonic         = "large intact option tackle document category faith tackle repair myth hint carpet"
invalid_mnemonic = "large intact option tackle document category faith tackle repair myth hint faith"
address          = "sB2H5mvAXqKmvDkfKHvaZEbahSrNEwSRmjvwzqhrcKvZaXcqn"
account1 = safebook.generate_account()
account2 = safebook.generate_account()

test("Generate account", () => {
  account = safebook.generate_account();
  assert_equal(12, account.mnemonic.split(" ").length)
  assert([49,50].includes(account.address.length))
})

test("Load account", () => {
  account = safebook.load(mnemonic)
  assert_equal(account.address, address)

  account = safebook.load(invalid_mnemonic)
  assert_equal(null, account)
})

test("Decode address", () => {
  account = safebook.load(mnemonic);
  assert_equal_uint8array(safebook.decode(address), account.sign.publicKey)
  // Fail with
})

test("Encrypt and decrypt", () => {
  box = safebook.encrypt(account1, account2.address, "My Message")
  assert_equal("My Message", safebook.decrypt(account1, account2.address, box))
  assert_throw(() => safebook.decrypt(account1, account2.address, alter(box)))
  assert_throw(() => safebook.decrypt(account1, alter(account2.address), box))
  assert_throw(() => safebook.decrypt(account2, account2.address, box))
  assert_throw(() => safebook.decrypt(account1, account1.address, box))
})

test("Sign and verify", () => {
  account1 = safebook.generate_account()
  account2 = safebook.generate_account()
  signature = safebook.sign(account, "My Message")
  assert(safebook.verify(account.address, "My Message", signature))
  assert_equal(false, safebook.verify(account.address, "My Other Message", signature))
  assert_throw(() => safebook.verify(account.address, "My Message", alter(signature)))
})

console.log("")
