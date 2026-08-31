/**
 * SMPP 3.4 Protocol PDU Encoder/Decoder for High-Throughput SMS Carrier Gateways
 */

export interface ISmppPdu {
  commandLength: number;
  commandId: number;
  commandStatus: number;
  sequenceNumber: number;
  body: Buffer;
}

export class SmppShortMessageProtocolHandler {
  public static readonly SUBMIT_SM = 0x00000004;
  public static readonly SUBMIT_SM_RESP = 0x80000004;
  public static readonly DELIVER_SM = 0x00000005;
  public static readonly ENQUIRE_LINK = 0x00000015;

  public encodePdu(commandId: number, sequenceNumber: number, body: Buffer): Buffer {
    const length = 16 + body.length;
    const header = Buffer.alloc(16);
    header.writeUInt32BE(length, 0);
    header.writeUInt32BE(commandId, 4);
    header.writeUInt32BE(0, 8); // Command status
    header.writeUInt32BE(sequenceNumber, 12);
    return Buffer.concat([header, body]);
  }

  public decodePdu(buf: Buffer): ISmppPdu | null {
    if (buf.length < 16) return null;
    const commandLength = buf.readUInt32BE(0);
    const commandId = buf.readUInt32BE(4);
    const commandStatus = buf.readUInt32BE(8);
    const sequenceNumber = buf.readUInt32BE(12);
    const body = buf.subarray(16, commandLength);

    return {
      commandLength,
      commandId,
      commandStatus,
      sequenceNumber,
      body
    };
  }
}
