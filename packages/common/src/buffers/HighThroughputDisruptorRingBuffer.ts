/**
 * LMAX-style Lock-Free Ring Buffer for High-Throughput Event Streams
 */

export class HighThroughputDisruptorRingBuffer<T> {
  private readonly buffer: Array<T | undefined>;
  private readonly capacity: number;
  private readonly mask: number;
  private sequence = 0;

  constructor(powerOfTwoCapacity = 1024) {
    this.capacity = powerOfTwoCapacity;
    this.mask = powerOfTwoCapacity - 1;
    this.buffer = new Array(powerOfTwoCapacity);
  }

  public publish(item: T): number {
    const currentSeq = this.sequence++;
    const idx = currentSeq & this.mask;
    this.buffer[idx] = item;
    return currentSeq;
  }

  public get(seq: number): T | undefined {
    const idx = seq & this.mask;
    return this.buffer[idx];
  }

  public getCapacity(): number {
    return this.capacity;
  }
}
