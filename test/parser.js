/*jshint mocha*/
const assert = require("assert");
import NtpPacketParser from "../index";

describe("NTP packet parser", function() {
  describe("Structure", function() {
    const validPacket = require("./packets.valid")[0].buffer;

    it("should parse without errors", function() {
      NtpPacketParser.parse(validPacket);
    });

    it("should return a full struct", function() {
      const struct = NtpPacketParser.parse(validPacket);

      assert.ok("leapIndicator" in struct);
      assert.ok("version" in struct);
      assert.ok("mode" in struct);
      assert.ok("stratum" in struct);
      assert.ok("poll" in struct);
      assert.ok("precision" in struct);
      assert.ok("rootDelay" in struct);
      assert.ok("rootDispersion" in struct);
      assert.ok("referenceId" in struct);
      assert.ok("referenceTimestamp" in struct);
      assert.ok("originTimestamp" in struct);
      assert.ok("receiveTimestamp" in struct);
      assert.ok("transmitTimestamp" in struct);
    });

    it("should return an integer for leapIndicator", function() {
      const struct = NtpPacketParser.parse(validPacket);

      assert.ok(Number.isInteger(struct.leapIndicator));
    });

    it("should return an integer for mode", function() {
      const struct = NtpPacketParser.parse(validPacket);

      assert.ok(Number.isInteger(struct.mode));
    });

    it("should return an integer for stratum", function() {
      const struct = NtpPacketParser.parse(validPacket);

      assert.ok(Number.isInteger(struct.stratum));
    });

    it("should return an integer for poll", function() {
      const struct = NtpPacketParser.parse(validPacket);

      assert.ok(Number.isInteger(struct.poll));
    });

    it("should return an integer for precision", function() {
      const struct = NtpPacketParser.parse(validPacket);

      assert.ok(Number.isInteger(struct.precision));
    });

    it("should return a date for rootDelay", function() {
      const struct = NtpPacketParser.parse(validPacket);

      assert.ok(struct.rootDelay instanceof Date);
    });

    it("should return a date for rootDispersion", function() {
      const struct = NtpPacketParser.parse(validPacket);

      assert.ok(struct.rootDispersion instanceof Date);
    });

    it("should return a string for referenceId", function() {
      const struct = NtpPacketParser.parse(validPacket);

      assert.ok(typeof struct.referenceId === "string");
    });

    it("should return a date for referenceTimestamp", function() {
      const struct = NtpPacketParser.parse(validPacket);

      assert.ok(struct.referenceTimestamp instanceof Date);
    });

    it("should return a date for originTimestamp", function() {
      const struct = NtpPacketParser.parse(validPacket);

      assert.ok(struct.originTimestamp instanceof Date);
    });

    it("should return a date for receiveTimestamp", function() {
      const struct = NtpPacketParser.parse(validPacket);

      assert.ok(struct.receiveTimestamp instanceof Date);
    });

    it("should return a date for transmitTimestamp", function() {
      const struct = NtpPacketParser.parse(validPacket);

      assert.ok(struct.transmitTimestamp instanceof Date);
    });
  });

  const validPackets = require("./packets.valid.js");
  validPackets.forEach(function(packet) {
    describe("Parsing", function() {
      const struct = NtpPacketParser.parse(packet.buffer);

      for (let key in packet.expected) {
        if (!packet.expected.hasOwnProperty(key)) {
          continue;
        }

        it("should have the property " + key, function() {
          assert.ok(key in struct);
        });

        it(
          "should return " + packet.expected[key] + " for property " + key,
          function() {
            if (packet.expected[key] instanceof Date) {
              assert.equal(
                struct[key].getTime(),
                packet.expected[key].getTime()
              );
            } else {
              assert.equal(struct[key], packet.expected[key]);
            }
          }
        );
      }
    });
  });
});
