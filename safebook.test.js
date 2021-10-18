safebook = require('./safebook')

mnemonic         = "large intact option tackle document category faith tackle repair myth hint carpet"
invalid_mnemonic = "large intact option tackle document category faith tackle repair myth hint faith"
entropy          = "GCuEHFMuVYsHvyn4tTAUcYcbp9k2"
address          = "sB2H5mvAXqKmvDkfKHvaZEbahSrNEwSRmjvwzqhrcKvZaXcqn"
account1 = safebook.generate_account()
account2 = safebook.generate_account()

alter = (a) => a[0]--

test("Generate account", () => {
  account = safebook.generate_account()
  expect(account.mnemonic.split(" ")).toHaveLength(12)
  expect([48,49,50].includes(account.address.length)).toBeTruthy()
})

test("Load account from mnemonic", () => {
  account = safebook.load_from_mnemonic(mnemonic)
  expect(account.address).toBe(address)

  account = safebook.load(mnemonic)
  expect(account.address).toBe(address)

  expect(() => safebook.load(invalid_mnemonic)).toThrow()
})

test("Load account from entropy", () => {
  account = safebook.load_from_entropy(entropy)
  expect(account.address).toBe(address)

  account = safebook.load(entropy)
  expect(account.address).toBe(address)
})

test("Decode address", () => {
  account = safebook.load(mnemonic);
  expect(safebook.decode(address)).toEqual(account.sign.publicKey)
  // Fail with
})

test("Encrypt and decrypt", () => {
  box = safebook.encrypt(account1, account2.address, "My Message")
  expect(safebook.decrypt(account1, account2.address, box)).toBe("My Message")
  //expect(safebook.decrypt(account1, account2.address, alter(box))).toThrow()
  //expect(safebook.decrypt(account1, alter(account2.address), box)).toThrow()
  //expect(safebook.decrypt(account2, account2.address, box)).toThrow()
  //expect(safebook.decrypt(account1, account1.address, box)).toThrow()
})

test("Sign and verify", () => {
  account1 = safebook.generate_account()
  account2 = safebook.generate_account()
  signature = safebook.sign(account, "My Message")
  //expect(safebook.verify(account.address, "My Message")).toBe(signature)
  expect(safebook.verify(account.address, "My Other Message", signature)).toBeFalsy()
  expect(() => safebook.verify(account.address, "My Message", alter(signature))).toThrow()
})
