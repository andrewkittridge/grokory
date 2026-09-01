import assert from "node:assert/strict";
import { test } from "node:test";
import {
  grokdexMetadata,
  isPaidCheckout,
  parseBoostFulfillment,
  parseFeaturedFulfillment,
  shouldFulfill,
} from "./stripe-fulfill";

const paidFeatured = {
  id: "cs_1",
  payment_status: "paid",
  amount_total: 7900,
  metadata: {
    app: "grokdex",
    kind: "featured",
    templateId: "tmpl_1",
    slug: "chief",
    duration_days: "7",
  },
};

test("shouldFulfill ignores other apps and unpaid sessions", () => {
  assert.equal(shouldFulfill(paidFeatured), true);
  assert.equal(
    shouldFulfill({ ...paidFeatured, payment_status: "unpaid" }),
    false
  );
  assert.equal(
    shouldFulfill({
      ...paidFeatured,
      metadata: { ...paidFeatured.metadata, app: "puttle" },
    }),
    false
  );
  assert.equal(isPaidCheckout({ id: "cs", payment_status: "paid" }), true);
  assert.equal(
    grokdexMetadata({
      id: "cs",
      metadata: { app: "grokdex", kind: "tip" },
    })?.kind,
    "tip"
  );
});

test("parseFeaturedFulfillment needs templateId and duration", () => {
  assert.deepEqual(parseFeaturedFulfillment(paidFeatured), {
    sessionId: "cs_1",
    templateId: "tmpl_1",
    slug: "chief",
    durationDays: 7,
    amount: 7900,
  });
  assert.equal(
    parseFeaturedFulfillment({
      ...paidFeatured,
      metadata: { app: "grokdex", kind: "featured" },
    }),
    null
  );
  assert.equal(
    parseFeaturedFulfillment({
      ...paidFeatured,
      metadata: { ...paidFeatured.metadata, kind: "tip" },
    }),
    null
  );
});

test("parseBoostFulfillment reads duration and template", () => {
  const paidBoost = {
    id: "cs_2",
    payment_status: "paid",
    amount_total: 2900,
    metadata: {
      app: "grokdex",
      kind: "boost",
      templateId: "tmpl_2",
      slug: "coder",
      duration_days: "7",
    },
  };
  assert.deepEqual(parseBoostFulfillment(paidBoost), {
    sessionId: "cs_2",
    templateId: "tmpl_2",
    slug: "coder",
    durationDays: 7,
    amount: 2900,
  });
  assert.equal(shouldFulfill(paidBoost), true);
  assert.equal(parseBoostFulfillment(paidFeatured), null);
});
