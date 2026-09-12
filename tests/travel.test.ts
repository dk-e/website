import { describe, it } from "bun:test";
import assert from "node:assert/strict";
import {
  countryByCode,
  INITIAL_PASSPORT,
  travelStats,
} from "../lib/travel/model";
import { parseLatestCountry, parseVisits } from "../lib/travel/validation";
import shapes from "../data/travel-map.json";
import {
  checkPassword,
  createSession,
  validSession,
  sameOrigin,
} from "../lib/travel/auth";

describe("travel data", () => {
  it("counts Dan's 16 unique countries across 3 continents, with France most recent", () => {
    const stats = travelStats(
      INITIAL_PASSPORT.visits,
      INITIAL_PASSPORT.latestCountry,
    );
    assert.equal(stats.visited.length, 16);
    assert.equal(stats.continents, 3);
    assert.equal(stats.latest?.country, "FR");
    assert.ok(INITIAL_PASSPORT.visits.every((visit) => visit.date === ""));
  });
  it("deduplicates repeated countries and uses a manually selected most recent country", () => {
    const visits = [
      { id: "1", country: "FR", date: "2025-01-01", city: "" },
      { id: "2", country: "FR", date: "2025-03-01", city: "Paris" },
      { id: "3", country: "US", date: "2025-04-01", city: "" },
    ];
    assert.equal(travelStats(visits).visited.length, 2);
    assert.equal(travelStats(visits).latest?.country, "US");
    assert.equal(travelStats(visits, "FR").latest?.city, "Paris");
    assert.equal(travelStats([]).latest, null);
  });
  it("rejects malformed dates, invalid countries, duplicate IDs and invalid latest selections", () => {
    const base = { id: "1", country: "FR", date: "", city: "" };
    assert.throws(() => parseVisits([{ ...base, date: "2025-02-30" }]));
    assert.throws(() => parseVisits([{ ...base, date: "2999-01-01" }]));
    assert.throws(() => parseVisits([{ ...base, country: "XX" }]));
    assert.throws(() => parseVisits([base, base]));
    assert.throws(() => parseLatestCountry("US", [base]));
    assert.deepEqual(parseVisits([base]), [base]);
    assert.deepEqual(parseVisits([]), []);
  });
});

describe("map geography", () => {
  it("keeps France and French Guiana separate, including continent totals", () => {
    const france = shapes.find((shape) => shape.code === "FR")!;
    const guiana = shapes.find((shape) => shape.code === "GF")!;
    assert.ok(france?.path);
    assert.ok(guiana?.path);
    const franceCoordinates = [
      ...france.path.matchAll(/([\d.]+),([\d.]+)/g),
    ].map((match) => [Number(match[1]), Number(match[2])]);
    assert.ok(
      franceCoordinates.every(([x, y]) => x! > 300 && y! < 120),
      "France must contain only European map coordinates",
    );
    assert.equal(countryByCode.get("FR")?.continent, "Europe");
    assert.equal(countryByCode.get("GF")?.continent, "South America");
    assert.equal(countryByCode.get("RE")?.continent, "Africa");
    assert.equal(
      new Set(shapes.map((shape) => shape.code)).size,
      shapes.length,
    );
    assert.equal(countryByCode.get("GB")?.name, "United Kingdom");
  });
});

describe("admin sessions", () => {
  it("rejects forged/expired sessions and invalidates cookies when the password changes", () => {
    const previous = process.env.TRAVEL_ADMIN_PASSWORD;
    try {
      process.env.TRAVEL_ADMIN_PASSWORD = "a-test-password-long-enough";
      assert.equal(checkPassword("wrong"), false);
      assert.equal(checkPassword("a-test-password-long-enough"), true);
      const session = createSession();
      assert.equal(validSession(session), true);
      assert.equal(validSession(`${session}x`), false);
      assert.equal(validSession(`1.${session.split(".")[1]}`), false);
      process.env.TRAVEL_ADMIN_PASSWORD = "a-different-password-long-enough";
      assert.equal(validSession(session), false);
      delete process.env.TRAVEL_ADMIN_PASSWORD;
      assert.equal(validSession(session), false);
    } finally {
      if (previous === undefined) delete process.env.TRAVEL_ADMIN_PASSWORD;
      else process.env.TRAVEL_ADMIN_PASSWORD = previous;
    }
  });
  it("requires same-origin requests for writes", () => {
    assert.equal(
      sameOrigin(
        new Request("https://dann.my/api/admin/travel", {
          headers: { origin: "https://dann.my" },
        }),
      ),
      true,
    );
    assert.equal(
      sameOrigin(
        new Request("https://dann.my/api/admin/travel", {
          headers: { origin: "https://elsewhere.test" },
        }),
      ),
      false,
    );
    assert.equal(
      sameOrigin(new Request("https://dann.my/api/admin/travel")),
      false,
    );
  });
});
