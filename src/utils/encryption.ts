import CryptoJS from "crypto-js";

const SECRET_KEY_B64 = import.meta.env.VITE_APP_ENCRYPTION_KEY;

export const encryptPassword = (password: string) => {
  if (!SECRET_KEY_B64) throw new Error("APP_ENCRYPTION_KEY missing");

  const key = CryptoJS.enc.Base64.parse(SECRET_KEY_B64);
  const iv = CryptoJS.lib.WordArray.random(16);

  const encrypted = CryptoJS.AES.encrypt(password, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const cipherTextB64 = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
  const ivB64 = iv.toString(CryptoJS.enc.Base64);

  return `${cipherTextB64}:${ivB64}`;
};
