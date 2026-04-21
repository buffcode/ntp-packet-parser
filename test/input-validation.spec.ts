import { NtpPacketParser } from "../src";

const assert = require("assert");

const validPackets = require("./packets.valid.js");

/**
 * Returns a Buffer from the array-shaped fixture regardless of whether the
 * fixture currently stores a plain Array or has been upgraded to a Buffer.
 */
function fixtureBuffer(index: number): Buffer {
  const raw = validPackets[index].buffer;
  return Buffer.isBuffer(raw) ? (raw as Buffer) : Buffer.from(raw);
}

/**
 * Builds a stratum-2 NTP packet buffer by copying fixture 0 and patching:
 *   - byte 1 (stratum field) to 2
 *   - bytes 12-15 (referenceId) to 192.168.1.1
 */
function stratum2Buffer(): Buffer {
  const base = Buffer.from(fixtureBuffer(0));
  base[1] = 2;
  base[12] = 192;
  base[13] = 168;
  base[14] = 1;
  base[15] = 1;
  return base;
}

describe("input validation", function () {
  describe("parse()", function () {
    // V1 - type rejection
    it("throws TypeError for null", function () {
      assert.throws(
        function () {
          (NtpPacketParser.parse as (v: unknown) => unknown)(null);
        },
        { name: "TypeError", message: /udpPacket must be a Buffer or Uint8Array/ }
      );
    });

    it("throws TypeError for undefined", function () {
      assert.throws(
        function () {
          (NtpPacketParser.parse as (v: unknown) => unknown)(undefined);
        },
        { name: "TypeError", message: /udpPacket must be a Buffer or Uint8Array/ }
      );
    });

    it("throws TypeError for string input", function () {
      assert.throws(function () {
        (NtpPacketParser.parse as (v: unknown) => unknown)("hello");
      }, TypeError);
    });

    it("throws TypeError for number input", function () {
      assert.throws(function () {
        (NtpPacketParser.parse as (v: unknown) => unknown)(42);
      }, TypeError);
    });

    it("throws TypeError for plain object", function () {
      assert.throws(function () {
        (NtpPacketParser.parse as (v: unknown) => unknown)({});
      }, TypeError);
    });

    it("throws TypeError for array", function () {
      assert.throws(function () {
        (NtpPacketParser.parse as (v: unknown) => unknown)([]);
      }, TypeError);
    });

    it("throws TypeError for ArrayBuffer", function () {
      assert.throws(function () {
        (NtpPacketParser.parse as (v: unknown) => unknown)(new ArrayBuffer(48));
      }, TypeError);
    });

    it("throws TypeError for DataView", function () {
      assert.throws(function () {
        (NtpPacketParser.parse as (v: unknown) => unknown)(new DataView(new ArrayBuffer(48)));
      }, TypeError);
    });

    // V1/V2 - size rejection
    it("throws for 0-byte Buffer", function () {
      assert.throws(function () {
        NtpPacketParser.parse(Buffer.alloc(0));
      }, TypeError);
    });

    it("throws for 47-byte Buffer", function () {
      assert.throws(function () {
        NtpPacketParser.parse(Buffer.alloc(47));
      }, TypeError);
    });

    it("throws for 49-byte Buffer", function () {
      assert.throws(function () {
        NtpPacketParser.parse(Buffer.alloc(49));
      }, TypeError);
    });

    it("throws for 1MB Buffer", function () {
      assert.throws(function () {
        NtpPacketParser.parse(Buffer.alloc(1_000_000));
      }, TypeError);
    });

    // V1 - positive: accepts Uint8Array of 48 bytes
    it("accepts a 48-byte Uint8Array", function () {
      const buf = fixtureBuffer(0);
      const typed = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);

      // Defensive: make sure we constructed a real Uint8Array that is not also a Buffer.
      // Buffer is a subclass of Uint8Array in Node, so we slice into a fresh Uint8Array.
      const fresh = new Uint8Array(48);
      fresh.set(typed);
      assert.strictEqual(Buffer.isBuffer(fresh), false);
      assert.strictEqual(fresh instanceof Uint8Array, true);

      const struct = NtpPacketParser.parse(fresh);
      assert.ok(struct);
      assert.ok("leapIndicator" in struct);
      assert.strictEqual(struct.stratum, 1);
    });
  });

  describe("_fromNtpTimestamp()", function () {
    // V3 - reject garbage even-length
    it('throws for ""', function () {
      assert.throws(function () {
        NtpPacketParser._fromNtpTimestamp("");
      }, TypeError);
    });

    it("throws for non-binary 16-char garbage", function () {
      assert.throws(function () {
        NtpPacketParser._fromNtpTimestamp("garbagegarbage!!");
      }, TypeError);
    });

    it('throws for "0b"-prefixed string', function () {
      // length 10 is already wrong length; even if it were right length, 0b is non-binary
      assert.throws(function () {
        NtpPacketParser._fromNtpTimestamp("0b10101010");
      }, TypeError);
    });

    it('throws for "10" (too short)', function () {
      assert.throws(function () {
        NtpPacketParser._fromNtpTimestamp("10");
      }, TypeError);
    });

    it('throws for "1".repeat(30) (wrong length)', function () {
      assert.throws(function () {
        NtpPacketParser._fromNtpTimestamp("1".repeat(30));
      }, TypeError);
    });

    it('throws for "1".repeat(66) (wrong length)', function () {
      assert.throws(function () {
        NtpPacketParser._fromNtpTimestamp("1".repeat(66));
      }, TypeError);
    });

    it("throws for null input", function () {
      assert.throws(function () {
        (NtpPacketParser._fromNtpTimestamp as (v: unknown) => unknown)(null);
      }, TypeError);
    });

    it("throws for number input", function () {
      assert.throws(function () {
        (NtpPacketParser._fromNtpTimestamp as (v: unknown) => unknown)(42);
      }, TypeError);
    });

    // V3 - accept correct
    it('accepts "0".repeat(32) returning valid Date', function () {
      const d = NtpPacketParser._fromNtpTimestamp("0".repeat(32));
      assert.ok(d instanceof Date);
      assert.strictEqual(isNaN(d.getTime()), false);
    });

    it('accepts "0".repeat(64) returning valid Date', function () {
      const d = NtpPacketParser._fromNtpTimestamp("0".repeat(64));
      assert.ok(d instanceof Date);
      assert.strictEqual(isNaN(d.getTime()), false);
      assert.strictEqual(d.getTime(), new Date("Jan 01 1900 GMT").getTime());
    });

    it('accepts "1".repeat(64) returning valid Date near year 2036', function () {
      const d = NtpPacketParser._fromNtpTimestamp("1".repeat(64));
      assert.ok(d instanceof Date);
      assert.strictEqual(isNaN(d.getTime()), false);
      // 2^32 - 1 seconds past Jan 01 1900 lands in early February 2036
      assert.strictEqual(d.getUTCFullYear(), 2036);
    });
  });

  describe("_ntpIdentifier()", function () {
    // V4 - strict equality: non-number stratum must NOT be treated as stratum 1
    it('treats string "1" as invalid stratum (throws)', function () {
      assert.throws(function () {
        (
          NtpPacketParser as unknown as {
            _ntpIdentifier: (s: unknown, v: string) => string;
          }
        )._ntpIdentifier("1", "01000111010100000101001100100000");
      }, TypeError);
    });

    it("treats boolean true as invalid stratum (throws)", function () {
      assert.throws(function () {
        (
          NtpPacketParser as unknown as {
            _ntpIdentifier: (s: unknown, v: string) => string;
          }
        )._ntpIdentifier(true, "01000111010100000101001100100000");
      }, TypeError);
    });

    it("treats array [1] as invalid stratum (throws)", function () {
      assert.throws(function () {
        (
          NtpPacketParser as unknown as {
            _ntpIdentifier: (s: unknown, v: string) => string;
          }
        )._ntpIdentifier([1], "01000111010100000101001100100000");
      }, TypeError);
    });

    // V4 - input validation
    it("throws for non-number stratum (null)", function () {
      assert.throws(function () {
        (
          NtpPacketParser as unknown as {
            _ntpIdentifier: (s: unknown, v: string) => string;
          }
        )._ntpIdentifier(null, "0".repeat(32));
      }, TypeError);
    });

    it("throws for negative stratum", function () {
      assert.throws(function () {
        (
          NtpPacketParser as unknown as {
            _ntpIdentifier: (s: number, v: string) => string;
          }
        )._ntpIdentifier(-1, "0".repeat(32));
      }, TypeError);
    });

    it("throws for stratum > 255", function () {
      assert.throws(function () {
        (
          NtpPacketParser as unknown as {
            _ntpIdentifier: (s: number, v: string) => string;
          }
        )._ntpIdentifier(256, "0".repeat(32));
      }, TypeError);
    });

    it("throws for float stratum like 1.5", function () {
      assert.throws(function () {
        (
          NtpPacketParser as unknown as {
            _ntpIdentifier: (s: number, v: string) => string;
          }
        )._ntpIdentifier(1.5, "0".repeat(32));
      }, TypeError);
    });

    it("throws for non-binary value", function () {
      assert.throws(function () {
        (
          NtpPacketParser as unknown as {
            _ntpIdentifier: (s: number, v: string) => string;
          }
        )._ntpIdentifier(2, "not binary data".padEnd(32, "x"));
      }, TypeError);
    });

    it("throws for value of wrong length (not 32)", function () {
      assert.throws(function () {
        (
          NtpPacketParser as unknown as {
            _ntpIdentifier: (s: number, v: string) => string;
          }
        )._ntpIdentifier(2, "0".repeat(31));
      }, TypeError);
      assert.throws(function () {
        (
          NtpPacketParser as unknown as {
            _ntpIdentifier: (s: number, v: string) => string;
          }
        )._ntpIdentifier(2, "0".repeat(33));
      }, TypeError);
    });

    // V6 - COVERAGE GAP: exercise stratum !== 1 path
    it("returns decimal integer string for stratum 2 (192.168.1.1 -> 3232235777)", function () {
      const result = (
        NtpPacketParser as unknown as {
          _ntpIdentifier: (s: number, v: string) => string;
        }
      )._ntpIdentifier(2, "11000000101010000000000100000001");
      assert.strictEqual(result, "3232235777");
    });

    it("returns decimal integer string for stratum 0", function () {
      const result = (
        NtpPacketParser as unknown as {
          _ntpIdentifier: (s: number, v: string) => string;
        }
      )._ntpIdentifier(0, "0".repeat(32));
      assert.strictEqual(result, "0");
    });
  });

  describe("parse() return shape", function () {
    const ALL_KEYS = [
      "leapIndicator",
      "version",
      "mode",
      "stratum",
      "poll",
      "precision",
      "rootDelay",
      "rootDispersion",
      "referenceId",
      "referenceTimestamp",
      "originTimestamp",
      "receiveTimestamp",
      "transmitTimestamp",
    ] as const;

    // V5 - all keys always present on valid input
    it("returns all 13 NtpPacket keys for a valid stratum-1 packet", function () {
      const struct = NtpPacketParser.parse(fixtureBuffer(0));
      for (const key of ALL_KEYS) {
        assert.ok(key in struct, "missing key: " + key);
        assert.notStrictEqual(
          (struct as unknown as Record<string, unknown>)[key],
          undefined,
          "undefined value for key: " + key
        );
      }
    });

    it("returns all 13 NtpPacket keys for a valid stratum-2 packet (exercises line 75)", function () {
      const struct = NtpPacketParser.parse(stratum2Buffer());
      for (const key of ALL_KEYS) {
        assert.ok(key in struct, "missing key: " + key);
        assert.notStrictEqual(
          (struct as unknown as Record<string, unknown>)[key],
          undefined,
          "undefined value for key: " + key
        );
      }
      assert.strictEqual(struct.stratum, 2);
      // 192.168.1.1 as a 32-bit unsigned integer is 3232235777
      assert.strictEqual(struct.referenceId, "3232235777");
    });
  });
});
