/**
 * Real-Time Stream Ingestion & Sliding Window Aggregator
 * Computes P50, P90, and P99 latency percentiles, requests per second (RPS), and error rate telemetry.
 */

export interface ILatencyTelemetryPoint {
  timestampMs: number;
  serviceId: string;
  durationMs: number;
  isError: boolean;
}

export class RealtimeThroughputStreamAggregator {
  private readonly buffer: ILatencyTelemetryPoint[] = [];

  public ingestSample(sample: ILatencyTelemetryPoint): void {
    this.buffer.push(sample);
    // Keep 5 minute buffer
    const cutoff = Date.now() - 300000;
    while (this.buffer.length > 0 && this.buffer[0].timestampMs < cutoff) {
      this.buffer.shift();
    }
  }

  public computeWindowStats(serviceId?: string): { count: number; p50Ms: number; p90Ms: number; p99Ms: number; errorRatePct: number } {
    const samples = serviceId ? this.buffer.filter(s => s.serviceId === serviceId) : this.buffer;
    if (!samples.length) return { count: 0, p50Ms: 0, p90Ms: 0, p99Ms: 0, errorRatePct: 0 };

    const sortedDurations = samples.map(s => s.durationMs).sort((a, b) => a - b);
    const errorCount = samples.filter(s => s.isError).length;

    const p50Idx = Math.floor(sortedDurations.length * 0.50);
    const p90Idx = Math.floor(sortedDurations.length * 0.90);
    const p99Idx = Math.floor(sortedDurations.length * 0.99);

    return {
      count: samples.length,
      p50Ms: +sortedDurations[p50Idx].toFixed(2),
      p90Ms: +sortedDurations[p90Idx].toFixed(2),
      p99Ms: +sortedDurations[p99Idx].toFixed(2),
      errorRatePct: +((errorCount / samples.length) * 100).toFixed(2)
    };
  }
}
