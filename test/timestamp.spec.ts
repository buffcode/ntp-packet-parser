import { NtpPacketParser } from "../src";

const assert = require("assert");

describe("NTP timestamps", function() {
  describe("Error handling", function() {
    it("should throw an error for invalid values", function() {
      assert.throws(function() {
        NtpPacketParser._fromNtpTimestamp("0");
      }, /expected even number of characters/);
      assert.throws(function() {
        NtpPacketParser._fromNtpTimestamp("000");
      }, /expected even number of characters/);
    });

    it("should not throw an error for valid values", function() {
      assert.doesNotThrow(function() {
        NtpPacketParser._fromNtpTimestamp("00");
      }, /expected even number of characters/);
      assert.doesNotThrow(function() {
        NtpPacketParser._fromNtpTimestamp("0000");
      }, /expected even number of characters/);
    });
  });

  describe("Conversion", function() {
    it("should return Jan 01 1900 GMT for zero timestamp", function() {
      assert.equal(
        NtpPacketParser._fromNtpTimestamp("0".repeat(16)).getTime(),
        new Date("Jan 01 1900 GMT").getTime()
      );
    });

    it("should return Jan 01 1901 GMT for one year in seconds", function() {
      const oneYear =
        (new Date("Jan 01 1901 GMT").getTime() -
          new Date("Jan 01 1900 GMT").getTime()) /
        1000;
      let oneYearAsBits = (oneYear >>> 0).toString(2);
      oneYearAsBits =
        "0".repeat(32).substr(0, 32 - oneYearAsBits.length) + oneYearAsBits;

      assert.equal(
        NtpPacketParser._fromNtpTimestamp(
          oneYearAsBits + "0".repeat(32)
        ).getTime(),
        new Date("Jan 01 1901 GMT").getTime()
      );
    });

    it("should return 500 milliseconds for fraction of 1", function() {
      const millisecondsAsBits = (1 >>> 0).toString(2);

      assert.equal(
        NtpPacketParser._fromNtpTimestamp(
          "0".repeat(millisecondsAsBits.length) + millisecondsAsBits
        ).getUTCMilliseconds(),
        500
      );
    });
  });
});
