export interface NtpPacket {
  leapIndicator: number;
  version: number;
  mode: number;
  stratum: number;
  poll: number;
  precision: number;
  rootDelay: Date;
  rootDispersion: Date;
  referenceId: string;
  referenceTimestamp: Date;
  originTimestamp: Date;
  receiveTimestamp: Date;
  transmitTimestamp: Date;
}
