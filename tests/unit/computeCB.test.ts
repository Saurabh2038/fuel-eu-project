import { computeCB } from "../../src/core/application/computeCB";

test("computeCB returns expected units", () => {
  const actual = 95; // g/MJ
  const fuel = 1000; // tonnes
  const { cb_gco2eq, cb_tco2eq } = computeCB(actual, fuel);
  expect(typeof cb_gco2eq).toBe("number");
  expect(cb_tco2eq).toBeCloseTo(cb_gco2eq / 1000000);
});
