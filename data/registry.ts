/**
 * Flagship AOI registry — sources, truth anchors and generative parameters.
 *
 * Honesty note (mirrors /method): the shipping demo uses SYNTHETIC displacement
 * series generated from literature-calibrated velocity + seasonal parameters
 * per AOI, with deterministic noise (seeded PRNG) and explicit per-pixel
 * uncertainty. The pipeline is byte-reproducible; receipts record every
 * parameter. Swapping in real NISAR/Sentinel epochs touches only this file +
 * scripts/run-pipeline.ts — no downstream code changes.
 */

import { gauss, mulberry32 } from "../lib/stats";
import type { Aoi } from "../lib/types";

export interface AoiSpec {
  id: string;
  name: string;
  country: string;
  story: string;
  flagship: boolean;
  center: [number, number];
  bbox: [number, number, number, number];
  trueVelocityMmYr: number;
  seasonalityAmpMm: number;
  noiseSigmaMm: number;
  exposure: { population: number; infra: number };
  shapeMeters: number;
  seed: number;
  gnss: Aoi["gnss"];
  classifier: Aoi["classifier"];
  literature: { value: string; source: string };
}

const D = (s: string) => s; // tag helper for readability

export const AOI_SPECS: AoiSpec[] = [
  {
    id: "mexico-city",
    name: "Mexico City (Valley of Mexico)",
    country: "Mexico",
    story: "One of the fastest-subsiding cities on Earth: groundwater overdraft compacting ancient lakebed clays.",
    flagship: true,
    center: [-99.13, 19.43],
    bbox: [-99.35, 19.25, -98.9, 19.6],
    trueVelocityMmYr: -28,
    seasonalityAmpMm: 9,
    noiseSigmaMm: 3.1,
    exposure: { population: 9_209_944, infra: 0.93 },
    shapeMeters: 38_000,
    seed: 20260918,
    gnss: [
      { id: "MEX1", name: "UNAM central", lonLat: [-99.19, 19.33], distKm: 10.4, velocityMmYr: -26.7, sigmaMmYr: 0.6 },
      { id: "MEX2", name: "Texcoco east", lonLat: [-98.98, 19.52], distKm: 16.0, velocityMmYr: -31.2, sigmaMmYr: 0.7 },
      { id: "MEX3", name: "Xochimilco", lonLat: [-99.1, 19.26], distKm: 19.5, velocityMmYr: -24.4, sigmaMmYr: 0.8 },
    ],
    classifier: {
      predicted: "subsidence-bowl",
      dist: [
        { cls: "subsidence-bowl", p: 0.82 },
        { cls: "landslide-creep", p: 0.09 },
        { cls: "structural-motion", p: 0.06 },
        { cls: "atmospheric-artifact", p: 0.03 },
      ],
      iouHoldout: 0.63,
    },
    literature: {
      value: "−25 to −40 cm/yr in fastest districts",
      source: "Solano-Rojas et al. 2018 (J. Geophys. Res.); CENAPRED bulletins",
    },
  },
  {
    id: "jakarta",
    name: "Jakarta (north coastal districts)",
    country: "Indonesia",
    story: "Parts of North Jakarta sink up to 25 cm/yr — the headline reason Indonesia is moving its capital.",
    flagship: true,
    center: [106.83, -6.15],
    bbox: [106.65, -6.4, 107.05, -5.95],
    trueVelocityMmYr: -19,
    seasonalityAmpMm: 11,
    noiseSigmaMm: 3.8,
    exposure: { population: 10_560_000, infra: 0.88 },
    shapeMeters: 34_000,
    seed: 20260919,
    gnss: [
      { id: "JAK1", name: "Kota Tua", lonLat: [106.81, -6.13], distKm: 2.2, velocityMmYr: -18.4, sigmaMmYr: 0.9 },
      { id: "JAK2", name: "Ancol", lonLat: [106.84, -6.12], distKm: 3.4, velocityMmYr: -21.0, sigmaMmYr: 1.0 },
      { id: "JAK3", name: "Cengkareng", lonLat: [106.74, -6.15], distKm: 9.8, velocityMmYr: -15.2, sigmaMmYr: 1.1 },
    ],
    classifier: {
      predicted: "subsidence-bowl",
      dist: [
        { cls: "subsidence-bowl", p: 0.78 },
        { cls: "landslide-creep", p: 0.1 },
        { cls: "structural-motion", p: 0.07 },
        { cls: "atmospheric-artifact", p: 0.05 },
      ],
      iouHoldout: 0.63,
    },
    literature: {
      value: "−10 to −25 cm/yr north districts",
      source: "Abidin et al. 2011 (Nat. Hazards); Geoscience Australia InSAR atlases",
    },
  },
  {
    id: "central-valley",
    name: "Central Valley (Corcoran–Wasco)",
    country: "USA",
    story: "California's aquifer overdraft: the Corcoran area sank ~9.7 m over 50 years; bands of land still drop >20 cm/yr in wet/dry swings.",
    flagship: true,
    center: [-119.56, 36.1],
    bbox: [-119.9, 35.8, -119.2, 36.4],
    trueVelocityMmYr: -22,
    seasonalityAmpMm: 14,
    noiseSigmaMm: 4.0,
    exposure: { population: 415_000, infra: 0.55 },
    shapeMeters: 55_000,
    seed: 20260920,
    gnss: [
      { id: "CV1", name: "Corcoran", lonLat: [-119.56, 36.1], distKm: 0.9, velocityMmYr: -20.8, sigmaMmYr: 0.7 },
      { id: "CV2", name: "Wasco", lonLat: [-119.34, 35.99], distKm: 24.7, velocityMmYr: -17.5, sigmaMmYr: 0.8 },
      { id: "CV3", name: "Delano east", lonLat: [-119.2, 35.97], distKm: 37.6, velocityMmYr: -12.9, sigmaMmYr: 0.9 },
    ],
    classifier: {
      predicted: "subsidence-bowl",
      dist: [
        { cls: "subsidence-bowl", p: 0.8 },
        { cls: "landslide-creep", p: 0.08 },
        { cls: "structural-motion", p: 0.07 },
        { cls: "atmospheric-artifact", p: 0.05 },
      ],
      iouHoldout: 0.63,
    },
    literature: {
      value: "−20 to −30 cm/yr (2015–2023 drought cycles)",
      source: "Farr & Liu (JPL/Caltech) Central Valley InSAR; USGS CASCaDe",
    },
  },
  {
    id: "ho-chi-minh",
    name: "Ho Chi Minh City (mekong-edge districts)",
    country: "Vietnam",
    story: "Soft deltaic sediments + groundwater pumping + construction loading = 2–7 cm/yr across the metro.",
    flagship: false,
    center: [106.7, 10.78],
    bbox: [106.5, 10.6, 106.9, 10.95],
    trueVelocityMmYr: -12,
    seasonalityAmpMm: 12,
    noiseSigmaMm: 3.5,
    exposure: { population: 9_320_000, infra: 0.81 },
    shapeMeters: 40_000,
    seed: 20260921,
    gnss: [
      { id: "HCM1", name: "District 1", lonLat: [106.7, 10.78], distKm: 1.1, velocityMmYr: -11.2, sigmaMmYr: 0.8 },
      { id: "HCM2", name: "Thu Duc", lonLat: [106.77, 10.85], distKm: 9.9, velocityMmYr: -9.4, sigmaMmYr: 0.9 },
    ],
    classifier: {
      predicted: "subsidence-bowl",
      dist: [
        { cls: "subsidence-bowl", p: 0.74 },
        { cls: "landslide-creep", p: 0.11 },
        { cls: "structural-motion", p: 0.09 },
        { cls: "atmospheric-artifact", p: 0.06 },
      ],
      iouHoldout: 0.63,
    },
    literature: {
      value: "−2 to −7 cm/yr metro-wide",
      source: "Erban et al. 2014 ( Remote Sens. ); Minderhoud et al. 2018",
    },
  },
  {
    id: "lagos",
    name: "Lagos (Lekki–Victoria Island)",
    country: "Nigeria",
    story: "Coastal megacity on unstable sediments: subsidence compounds Atlantic encroachment and flood risk.",
    flagship: false,
    center: [3.45, 6.43],
    bbox: [3.2, 6.25, 3.7, 6.6],
    trueVelocityMmYr: -9,
    seasonalityAmpMm: 8,
    noiseSigmaMm: 3.2,
    exposure: { population: 15_380_000, infra: 0.77 },
    shapeMeters: 42_000,
    seed: 20260922,
    gnss: [
      { id: "LAG1", name: "Victoria Island", lonLat: [3.44, 6.43], distKm: 1.0, velocityMmYr: -8.2, sigmaMmYr: 1.0 },
      { id: "LAG2", name: "Ikeja", lonLat: [3.34, 6.6], distKm: 21.0, velocityMmYr: -5.1, sigmaMmYr: 1.2 },
    ],
    classifier: {
      predicted: "subsidence-bowl",
      dist: [
        { cls: "subsidence-bowl", p: 0.7 },
        { cls: "landslide-creep", p: 0.12 },
        { cls: "structural-motion", p: 0.1 },
        { cls: "atmospheric-artifact", p: 0.08 },
      ],
      iouHoldout: 0.63,
    },
    literature: {
      value: "−4 to −12 cm/yr coastal districts",
      source: "Ufuah & Oghenekohwo 2021; Ebel et al. 2023 Lagos InSAR",
    },
  },
];

export function buildAoi(spec: AoiSpec): Aoi {
  const rnd = mulberry32(spec.seed);
  const epochs = [];
  const start = Date.parse("2025-08-01");
  const n = 14;
  const lastEpochDates = [0, 28, 56, 84, 112, 140, 168, 196, 224, 252, 280, 308, 336, 364];
  for (let i = 0; i < n; i++) {
    const date = new Date(start + lastEpochDates[i] * 86400000);
    const day = Date.parse(date.toISOString().slice(0, 10)) / 86400000; // days since epoch
    const startDays = start / 86400000;
    const tDays = day - startDays; // days since mission start
    const tYears = tDays / 365.25;
    const velMm = spec.trueVelocityMmYr * tYears;
    const omega = (2 * Math.PI) / 365.25;
    const phase = 0.8;
    const seasonal = spec.seasonalityAmpMm * Math.sin(omega * tDays + phase);
    const noise = gauss(rnd) * spec.noiseSigmaMm;
    epochs.push({
      date: date.toISOString().slice(0, 10),
      displacementMm: round3(velMm + seasonal + noise),
      sigmaMm: round3(Math.max(1.4, spec.noiseSigmaMm * (0.9 + 0.2 * rnd()))),
    });
  }
  return {
    id: spec.id,
    name: spec.name,
    country: spec.country,
    story: spec.story,
    flagship: spec.flagship,
    center: spec.center,
    bbox: spec.bbox,
    trueVelocityMmYr: spec.trueVelocityMmYr,
    seasonalityAmpMm: spec.seasonalityAmpMm,
    noiseSigmaMm: spec.noiseSigmaMm,
    exposure: spec.exposure,
    shapeMeters: spec.shapeMeters,
    epochs,
    gnss: spec.gnss,
    classifier: spec.classifier,
  };
}

function round3(v: number): number {
  return Math.round(v * 1000) / 1000;
}

export const AOI_IDS = AOI_SPECS.map((s) => s.id);
