import { PacketStruct } from "./PacketStruct";
import { NtpPacket } from "./NtpPacket";

export class NtpPacketParser {
  /**
   * Returns the structure of the UDP packet for parsing
   */
  private static get packetStruct() {
    return [
      { name: "leapIndicator", bits: 2 } as PacketStruct<"leapIndicator">,
      { name: "version", bits: 3 } as PacketStruct<"version">,
      { name: "mode", bits: 3 } as PacketStruct<"mode">,
      { name: "stratum", bits: 8 } as PacketStruct<"stratum">,
      { name: "poll", bits: 8 } as PacketStruct<"poll">,
      { name: "precision", bits: 8 } as PacketStruct<"precision">,
      {
        name: "rootDelay",
        bits: 32,
        converter: NtpPacketParser._fromNtpTimestamp,
      } as PacketStruct<"rootDelay">,
      {
        name: "rootDispersion",
        bits: 32,
        converter: NtpPacketParser._fromNtpTimestamp,
      } as PacketStruct<"rootDispersion">,
      {
        name: "referenceId",
        bits: 32,
        converter: (value, packet) => this._ntpIdentifier(packet.stratum!, value),
      } as PacketStruct<"referenceId">,
      {
        name: "referenceTimestamp",
        bits: 64,
        converter: NtpPacketParser._fromNtpTimestamp,
      } as PacketStruct<"referenceTimestamp">,
      {
        name: "originTimestamp",
        bits: 64,
        converter: NtpPacketParser._fromNtpTimestamp,
      } as PacketStruct<"originTimestamp">,
      {
        name: "receiveTimestamp",
        bits: 64,
        converter: NtpPacketParser._fromNtpTimestamp,
      } as PacketStruct<"receiveTimestamp">,
      {
        name: "transmitTimestamp",
        bits: 64,
        converter: NtpPacketParser._fromNtpTimestamp,
      } as PacketStruct<"transmitTimestamp">,
    ];
  }

  /**
   * Returns the selected bits in binary notation
   */
  private static _getBits(msg: Buffer | Uint8Array, start: number, length: number): string {
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
   * @param {number} stratum NTP stratum (0-255), determines decoding rules
   * @param {string} value 32-bit binary string of the referenceId field
   */
  private static _ntpIdentifier(stratum: number, value: string): string {
    if (typeof stratum !== "number" || !Number.isInteger(stratum) || stratum < 0 || stratum > 255) {
      throw new TypeError("stratum must be an integer in [0, 255]");
    }
    if (typeof value !== "string" || !/^[01]{32}$/.test(value)) {
      throw new TypeError("value must be a 32-bit binary string");
    }
    if (stratum !== 1) {
      return parseInt(value, 2).toString();
    }
    let chars = [value.slice(0, 8), value.slice(8, 16), value.slice(16, 24), value.slice(24, 32)];

    chars = chars.map(function (v) {
      return String.fromCharCode(parseInt(v, 2));
    });

    return chars.join("").replace(/\0+$/, "");
  }

  /**
   * Converts a NTP timestamp from binary notation to a Date object
   * @param {string} value Bits in binary notation (32 bits = short format, 64 bits = full timestamp)
   */
  public static _fromNtpTimestamp(value: string): Date {
    if (typeof value !== "string" || !/^(?:[01]{32}|[01]{64})$/.test(value)) {
      throw new TypeError("value must be a binary string of length 32 or 64");
    }

    const seconds = parseInt(value, 2) / Math.pow(2, value.length / 2),
      date = new Date("Jan 01 1900 GMT");

    date.setUTCMilliseconds(date.getUTCMilliseconds() + seconds * 1000);

    return date;
  }

  /**
   * Parses an UDP packet buffer and returns a NtpPacket struct
   * @throws {TypeError} If `udpPacket` is not a Buffer or Uint8Array, or is not exactly 48 bytes long.
   */
  public static parse(udpPacket: Buffer | Uint8Array): NtpPacket {
    if (!(udpPacket instanceof Uint8Array)) {
      throw new TypeError("udpPacket must be a Buffer or Uint8Array");
    }
    if (udpPacket.length !== 48) {
      throw new TypeError(`udpPacket must be exactly 48 bytes, got ${udpPacket.length}`);
    }

    const data: Partial<NtpPacket> = {};
    let offset = 0;

    NtpPacketParser.packetStruct.forEach((struct) => {
      const baseRepresentation = NtpPacketParser._getBits(udpPacket, offset, struct.bits);
      if (struct.converter) {
        // @ts-ignore
        data[struct.name] = struct.converter(baseRepresentation, data);
      } else {
        // @ts-ignore
        data[struct.name] = parseInt(baseRepresentation, 2);
      }
      offset += struct.bits;
    });

    return data as NtpPacket;
  }
}
