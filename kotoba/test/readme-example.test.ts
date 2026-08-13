/**
 * Every value printed in the repo root `README.md` API section, asserted.
 *
 * Scope rule: this file holds only what README.md prints. Behavioural cases
 * belong in hc.test.ts. If you change a documented return value, this suite
 * goes red — update the README in the same commit.
 *
 * One assertion here pins a wart rather than a feature, deliberately:
 *   - registerContract defaults governingLaw to the English string "Japan",
 *     while app.ts / contracts.ts say "日本法". The test asserts "Japan", so
 *     unifying the strings is loud.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { MockEtzhayyim } from "@etzhayyim/sdk-mock";
import {
  registerContract,
  getContract,
  registerSpApplication,
  listSpApplications,
  coverage,
  CONTRACT_TEMPLATE_COLLECTION,
  SP_APPLICATION_INNER_TYPE,
  contractDidFor,
} from "../src/index.js";

const OWNER = "did:web:hc.etzhayyim.com";

describe("README example", () => {
  let e: any;
  beforeEach(() => {
    e = new MockEtzhayyim({ did: OWNER });
  });

  it("registerContract statuses", async () => {
    const first = await registerContract(e, { contractType: "worker-agreement", locale: "ja" });
    expect(first).toEqual({
      status: "registered",
      did: "did:web:hc.etzhayyim.com:legal:worker-agreement:ja",
      templateUri: "at://did:web:hc.etzhayyim.com/com.etzhayyim.apps.hc.contractTemplate/ct-worker-agreement-ja",
      contractType: "worker-agreement",
      locale: "ja",
    });
    const dup = await registerContract(e, { contractType: "worker-agreement", locale: "ja" });
    expect(dup.status).toBe("alreadyExists");
    expect(dup.did).toBe("did:web:hc.etzhayyim.com:legal:worker-agreement:ja");
    expect(await registerContract(e, { contractType: "", locale: "ja" })).toEqual({
      status: "rejected",
      error: "missingRequiredFields",
    });
  });

  it("getContract prints the English default", async () => {
    await registerContract(e, { contractType: "worker-agreement", locale: "ja" });
    const got = await getContract(e, { contractType: "worker-agreement", locale: "ja" });
    expect(got.template?.did).toBe("did:web:hc.etzhayyim.com:legal:worker-agreement:ja");
    expect(got.template?.governingLaw).toBe("Japan");
    expect(await getContract(e, { contractType: "nope", locale: "ja" })).toEqual({ error: "notFound" });
  });

  it("constants match the README", () => {
    expect(CONTRACT_TEMPLATE_COLLECTION).toBe("com.etzhayyim.apps.hc.contractTemplate");
    expect(SP_APPLICATION_INNER_TYPE).toBe("com.etzhayyim.apps.hc.spApplication");
    expect(contractDidFor("worker-agreement", "ja")).toBe(
      "did:web:hc.etzhayyim.com:legal:worker-agreement:ja",
    );
  });

  it("registerSpApplication rejects a non-email", async () => {
    const ok = await registerSpApplication(e, {
      applicationId: "app1",
      legalName: "Shenzhen OEM Co Ltd",
      contactEmail: "kyc@oem.example",
      countryIso3: "CHN",
      category: "sp-kyc-review",
    });
    expect(ok.status).toBe("recorded");
    expect(ok.keyId).toBeTruthy();
    expect(ok.uri).toBeTruthy();
    expect(
      await registerSpApplication(e, {
        applicationId: "x",
        legalName: "X",
        contactEmail: "bad",
        countryIso3: "JPN",
        category: "c",
      }),
    ).toEqual({ status: "rejected", error: "invalidContactEmail" });
  });

  it("outsider sees zero encrypted applications", async () => {
    await registerSpApplication(e, {
      applicationId: "app1",
      legalName: "Shenzhen OEM Co Ltd",
      contactEmail: "kyc@oem.example",
      countryIso3: "CHN",
      category: "sp-kyc-review",
    });
    const outsider: any = new MockEtzhayyim({ did: "did:web:outsider.example" });
    expect((await listSpApplications(outsider)).total).toBe(0);
    const cov = await coverage(e);
    expect(cov.contractTemplateCount).toBe(0);
    expect(cov.spApplicationCount).toBe(1);
    expect(cov.applicationsByVerdict?.pending).toBe(1);
  });
});
