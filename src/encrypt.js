const { Buffer } = require('node:buffer')
const crypto = require('crypto')

async function generateRSAKeyPair() {
  const { privateKey, publicKey } = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-512",
    },
    true,
    ["encrypt", "decrypt"]
  );

  const exportedPublicKey = await crypto.subtle.exportKey('spki', publicKey);
  const exportedPrivateKey = await crypto.subtle.exportKey('pkcs8', privateKey);

  const expPublicKeyBase64 = Buffer.from(exportedPublicKey).toString('base64');
  const expPrivateKeyBase64 = Buffer.from(exportedPrivateKey).toString('base64');

  return { expPublicKeyBase64, expPrivateKeyBase64 }
}

async function setEnvVariables() {
  const { expPublicKeyBase64, expPrivateKeyBase64 } = await generateRSAKeyPair()
  process.env.PUBLIC_KEY = expPublicKeyBase64
  process.env.PRIVATE_KEY = expPrivateKeyBase64
  console.log(process.env.PUBLIC_KEY, process.env.PRIVATE_KEY)
}

async function importPrivateDecryptKey() {
  const privateKeyBase64String = Buffer.from(process.env.PRIVATE_KEY).toString('ascii');
  const privateKeyBuffer = Buffer.from(privateKeyBase64String, 'base64');
  const privateCryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyBuffer,
    { name: 'RSA-OAEP', hash: "SHA-512" },
    false,
    ["decrypt"]
  )
  return privateCryptoKey
}

async function decryptedPassword(password) {
  const privateKey = await importPrivateDecryptKey()

  // const cypherTxtBase64Buffer = fs.readFileSync('./cypherText.txt');
  // const cypherTxtBase64String = Buffer.from(cypherTxtBase64Buffer).toString('ascii');
  // const cypherTxtBuffer = Buffer.from(cypherTxtBase64String, 'base64');
  // const plainTxtBuff = await crypto.subtle.decrypt('RSA-OAEP', privateCryptoKey, cypherTxtBuffer);
  // const plainTxt = Buffer.from(plainTxtBuff).toString('ascii');

  const passwordBase64String = Buffer.from(password).toString('ascii');
  const passwordBuffer = Buffer.from(passwordBase64String, 'base64');
  const passwordBuff = await crypto.subtle.decrypt('RSA-OAEP', privateKey, passwordBuffer);
  const passwordDecrypted = Buffer.from(passwordBuff).toString('ascii');
  return passwordDecrypted
}

module.exports = {
  decryptedPassword,
  setEnvVariables
}