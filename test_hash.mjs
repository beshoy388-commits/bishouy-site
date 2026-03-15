
import { scrypt } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

async function verifyPassword(password, hash) {
  const [salt, key] = hash.split(":");
  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = (await scryptAsync(password, salt, 64));
  return Buffer.compare(keyBuffer, derivedKey) === 0;
}

const hash = "437b128751cecfe419400a31167dfaca:e8c4d2318007c785ddbcb8a8d908a9ab294416a1b66cab052321c11ff64afcdc9a01491d1dcdb0fd0d615d69b7c2772b7b84656c169458cd4df0d61dc2e84b33";

async function run() {
  console.log("Beshoy470Mimi#611:", await verifyPassword("Beshoy470Mimi#611", hash));
  console.log("BESHOY470MIMO#611:", await verifyPassword("BESHOY470MIMO#611", hash));
  console.log("Beshoy470MIMO#611:", await verifyPassword("Beshoy470MIMO#611", hash));
}

run();
