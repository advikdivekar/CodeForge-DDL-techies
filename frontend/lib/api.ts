import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  timeout: 30000,
});

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface DataSummary {
  total_rows: number;
  date_range: {
    start: string;
    end: string;
  };
  unique_strikes: number;
  unique_expiries: number;
  null_counts: {
    oi_CE: number;
    oi_PE: number;
    volume_CE: number;
    volume_PE: number;
    spot_close: number;
  };
  files_loaded: string[];
}

export interface PCRData {
  timestamps: string[];
  pcr_values: (number | null)[];
  signals: Record<string, "bullish" | "bearish" | "neutral">;
}

export interface VolumeSpikeRecord {
  datetime: string;
  strike: number;
  total_volume: number;
  volume_CE: number;
  volume_PE: number;
  anomaly: 0 | 1;
  anomaly_score: number;
}

export interface VolumeSpikeData {
  data: VolumeSpikeRecord[];
  total_anomalies: number;
  anomaly_rate: number;
}

export interface HeatmapData {
  strikes: number[];
  timestamps: string[];
  values: number[][];
}

export interface SurfaceData {
  strikes: number[];
  expiries: string[];
  surface: number[][];
}

export interface ARIAMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface VolatilitySkewData {
  expiries: string[];
  strikes: number[];
  lines: Record<string, number[]>;
}

export interface MaxPainData {
  strikes: number[];
  pain_values: number[];
  max_pain_strike: number;
}

export interface OIChangeData {
  strikes: number[];
  ce_change: number[];
  pe_change: number[];
  labels: string[];
}

export interface OIDistributionData {
  strikes: number[];
  oi_ce: number[];
  oi_pe: number[];
}

// ── API functions ─────────────────────────────────────────────────────────────

export async function getDataSummary(): Promise<DataSummary> {
  const res = await api.get<DataSummary>("/api/data/summary");
  return res.data;
}

export async function getOIHeatmap(): Promise<HeatmapData> {
  const res = await api.get<HeatmapData>("/api/charts/oi-heatmap");
  return res.data;
}

export async function getPCRData(): Promise<PCRData> {
  const res = await api.get<PCRData>("/api/charts/pcr");
  return res.data;
}

export async function getVolumeSpikes(): Promise<VolumeSpikeData> {
  const res = await api.get<VolumeSpikeData>("/api/charts/volume-spikes");
  return res.data;
}

export async function getVolatilitySurface(): Promise<SurfaceData> {
  const res = await api.get<SurfaceData>("/api/charts/volatility-surface");
  return res.data;
}

export async function postQuery(question: string): Promise<{ answer: string }> {
  const res = await api.post<{ answer: string }>("/api/query", { question });
  return res.data;
}

export async function getNarrative(): Promise<{ narrative: string }> {
  const res = await api.get<{ narrative: string }>("/api/narrative");
  return res.data;
}

export async function postAria(
  message: string,
  history: ARIAMessage[] = []
): Promise<{ response: string }> {
  const res = await api.post<{ response: string }>("/api/aria", {
    message,
    history,
  });
  return res.data;
}

export async function getReport(): Promise<Blob> {
  const res = await api.get("/api/report", { responseType: "blob" });
  return res.data;
}

export async function getVolatilitySkew(): Promise<VolatilitySkewData> {
  const res = await api.get<VolatilitySkewData>("/api/charts/volatility-skew");
  return res.data;
}

export async function getMaxPain(): Promise<MaxPainData> {
  const res = await api.get<MaxPainData>("/api/charts/max-pain");
  return res.data;
}

export async function getOIChange(): Promise<OIChangeData> {
  const res = await api.get<OIChangeData>("/api/charts/oi-change");
  return res.data;
}

export async function getOIDistribution(): Promise<OIDistributionData> {
  const res = await api.get<OIDistributionData>("/api/charts/oi-distribution");
  return res.data;
}

export async function getDocxReport(): Promise<Blob> {
  const res = await api.get("/api/report/docx", { responseType: "blob" });
  return res.data;
}
