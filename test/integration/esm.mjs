import assert from "node:assert/strict";
import { NtpPacketParser } from "../../dist/esm/index.js";

const VALID_PACKET = Buffer.from([
  28, 1, 48, 234, 0, 0, 0, 0, 0, 0, 0, 68, 80, 84, 66, 0, 221, 82, 40, 120,
  122, 239, 46, 145, 48, 48, 48, 48, 48, 48, 48, 10, 221, 82, 40, 124, 17,
  15, 55, 20, 221, 82, 40, 124, 17, 25, 203, 213,
]);

assert.ok(NtpPacketParser, "NtpPacketParser should be importable via ESM");

const result = NtpPacketParser.parse(VALID_PACKET);
const EXPECTED_KEYS = [
  "leapIndicator", "version", "mode", "stratum", "poll", "precision",
  "rootDelay", "rootDispersion", "referenceId", "referenceTimestamp",
  "originTimestamp", "receiveTimestamp", "transmitTimestamp",
];
for (const key of EXPECTED_KEYS) {
  assert.ok(key in result, `Missing key: ${key}`);
}
assert.strictEqual(result.stratum, 1);
assert.strictEqual(result.referenceId, "PTB");
assert.ok(result.receiveTimestamp instanceof Date);
assert.throws(() => NtpPacketParser.parse(Buffer.alloc(0)), TypeError);

console.log("ESM integration test passed");
