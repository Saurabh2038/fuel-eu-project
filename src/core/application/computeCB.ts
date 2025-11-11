import { MJ_PER_TONNE, TARGET_INTENSITY_2025 } from "../../shared/constants";

export function computeCB(actualIntensity: number, fuelConsumptionT: number, target = TARGET_INTENSITY_2025) {
  const energyMJ = fuelConsumptionT * MJ_PER_TONNE;
  const cb_g = (target - actualIntensity) * energyMJ; // grams CO2e
  const cb_t = cb_g / 1_000_000; // tonnes CO2e
  return { cb_gco2eq: cb_g, cb_tco2eq: cb_t } ;
}
