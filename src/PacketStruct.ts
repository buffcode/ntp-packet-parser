import { NtpPacket } from "./NtpPacket";

export interface PacketStruct<T extends keyof NtpPacket> {
  name: T;
  bits: number;
  converter?: (v: string, s: Partial<NtpPacket>) => NtpPacket[T];
}
