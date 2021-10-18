const safebook = require("./safebook")
const argv = require('minimist')(process.argv.slice(2));
const command = argv._[0]

usage = () => {
  console.log("Syntax: safebook [command] [options]")
  console.log("")
  console.log("Commands:")
  console.log("")
  console.log("  create           create a new account")
  console.log("  hide             encrypt a message")
  console.log("  show             decrypt a message")
  console.log("  emit             sign a message")
  console.log("")
  console.log("Options:")
  console.log("")
  console.log("  --mnemonic")
  console.log("  --address")
  console.log("  --content")
}

if (command == "create")
{
  let account = safebook.create()
  console.log("[private] Votre mnémonique:")
  console.log(account.mnemonic)
  console.log("[private] Votre seed:")
  console.log(safebook.encode(account.seed))
  console.log("[public]  Votre addresse:")
  console.log(account.address)
}
else if (command == "hide")
{
  let account = safebook.load(argv.mnemonic)

  if (!account)
    return console.log("Error: Invalid mnemonic")
  try {
    safebook.decode(argv.address)
  } catch (e) {
    return console.log(`Error: Invalid address (${e})`)
  }

  ciphertext = safebook.encrypt(account, argv.address, argv.message)
  console.log(ciphertext)
}
else if (command == "show")
{
  let account = safebook.load(argv.mnemonic)

  if (!account)
    return console.log("Error: Invalid mnemonic")
  try {
    safebook.decode(argv.address)
  } catch (e) {
    return console.log(`Error: Invalid address (${e})`)
  }

  console.log(safebook.decrypt(account, argv.address, argv.message))
}
else
  usage()
