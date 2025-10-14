const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';

export const generateUUID = () => {
  let uuid = '';
  for (let i = 0; i < 16; i++) {
    const token = alphabet[Math.floor(Math.random() * alphabet.length)];
    uuid = `${uuid}${token}`;
  }

  return uuid;
}
