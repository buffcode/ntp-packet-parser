"use strict";

/**
 * @typedef {Object} NTPPacket
 * @property {int} leapIndicator
 * @property {int} version
 * @property {int} mode
 * @property {int} stratum
 * @property {int} poll
 * @property {int} precision
 * @property {Date} rootDelay
 * @property {Date} rootDispersion
 * @property {String} referenceId
 * @property {Date} referenceTimestamp
 * @property {Date} originTimestamp
 * @property {Date} receiveTimestamp
 * @property {Date} transmitTimestamp
 */

export default class NtpPacketParser {
  /**
   * Returns the structure of the UDP packet for parsing
   * @returns {Object}
   */
  static get packetStruct() {
    return [
      { name: "leapIndicator", bits: 2 },
      { name: "version", bits: 3 },
      { name: "mode", bits: 3 },
      { name: "stratum", bits: 8 },
      { name: "poll", bits: 8 },
      { name: "precision", bits: 8 },
      {
        name: "rootDelay",
        bits: 32,
        converter: NtpPacketParser._fromNtpTimestamp
      },
      {
        name: "rootDispersion",
        bits: 32,
        converter: NtpPacketParser._fromNtpTimestamp
      },
      {
        name: "referenceId",
        bits: 32,
        converter: (v, s) => this._ntpIdentifier(s.stratum, v)
      },
      {
        name: "referenceTimestamp",
        bits: 64,
        converter: NtpPacketParser._fromNtpTimestamp
      },
      {
        name: "originTimestamp",
        bits: 64,
        converter: NtpPacketParser._fromNtpTimestamp
      },
      {
        name: "receiveTimestamp",
        bits: 64,
        converter: NtpPacketParser._fromNtpTimestamp
      },
      {
        name: "transmitTimestamp",
        bits: 64,
        converter: NtpPacketParser._fromNtpTimestamp
      }
    ];
  }

  /**
   * Returns the selected bits in binary notation
   * @param msg
   * @param {int} start
   * @param {int} length
   * @returns {string} Bits in binary notation
   * @private
   */
  static _getBits(msg, start, length) {
    let bits = "";
    const pad = "00000000";

    for (let i = 0; i < msg.length; i++) {
      let bitsUnpadded = (msg[i] >>> 0).toString(2);
      bits += pad.substring(0, pad.length - bitsUnpadded.length) + bitsUnpadded;
    }

    return bits.slice(start, start + length);
  }

  /**
   * Converts a NTP identifier from binary notation to ASCII
   * @param {int} stratum
   * @param {String} value Bits in binary notation
   * @returns {string}
   * @private
   */
  static _ntpIdentifier(stratum, value) {
    if (stratum != 1) {
      return parseInt(value, 2).toString();
    }
    let chars = [
      value.slice(0, 8),
      value.slice(8, 16),
      value.slice(16, 24),
      value.slice(24, 32)
    ];

    chars = chars.map(function(v) {
      return String.fromCharCode(parseInt(v, 2));
    });

    return chars.join("").replace(/\0+$/, "");
  }

  /**
   * Converts a NTP timestamp from binary notation to a Date object
   * @param {String} value Bits in binary notation
   * @returns {Date}
   * @private
   */
  static _fromNtpTimestamp(value) {
    if (value.length % 2 !== 0) {
      throw new Error(
        "Invalid timestamp format, expected even number of characters"
      );
    }

    const seconds = parseInt(value, 2) / Math.pow(2, value.length / 2),
      date = new Date("Jan 01 1900 GMT");

    date.setUTCMilliseconds(date.getUTCMilliseconds() + seconds * 1000);

    return date;
  }

  /**
   * Parses an UDP packet buffer and returns a NTPPacket struct
   * @param {Buffer} udpPacket
   * @returns {NTPPacket}
   */
  static parse(udpPacket) {
    let data = [];
    NtpPacketParser.packetStruct.forEach(item => {
      data[item.name] = undefined;
    });

    let offset = 0;
    NtpPacketParser.packetStruct.forEach(item => {
      data[item.name] = NtpPacketParser._getBits(udpPacket, offset, item.bits);
      if (item.converter) {
        data[item.name] = item.converter(data[item.name], data);
      } else {
        data[item.name] = parseInt(data[item.name], 2);
      }
      offset += item.bits;
    });

    return data;
  }
}
