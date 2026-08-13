# hc — Human Computing *app extraction* (not the live platform)

`hc` is **human computing**: a gig-shift + micro-task marketplace that
`CLAUDE.md` specifies as Timee-style booking plus MTurk-style HITs, with
Japanese labour-law checks and Matrix notifications. **This repository is the
app extraction of that design, not a running platform.** The only thing you can
execute from a clone is the `kotoba/` record layer (public contract-template
catalog + E2E-encrypted service-provider KYC applications). The host-sdk Worker
and the two Svelte UIs do not install, because they still depend on a
`workspace:*` that the extraction left behind.

- **Identity (kotoba)**: `did:web:hc.etzhayyim.com`
- **Nanoid**: `hc0mp7ng`
- **Collections that exist in `kotoba/`**: `com.etzhayyim.apps.hc.contractTemplate` (plaintext) and inner type `com.etzhayyim.apps.hc.spApplication` (encrypted envelope)
- **Substrate**: AT Protocol PDS writes via `@etzhayyim/sdk` `e.write()` / `e.encryptedWrite()`. No SQL in `kotoba/`.

It is a **record layer, not a labour-market**. It stores the templates and KYC
applications you hand it. It does not post shifts, does not check weekly hours
against 労基法 32, does not escrow USDC, and does not send Matrix events.

## Two west repos share this name. Read this table first.

| west path | this is | contents |
|---|---|---|
| `orgs/cloud-itonami/hc` ← **here** | **app** (`README.edn` `:kind :app`) | `kotoba/` + two `appview/` trees extracted from `etzhayyim/root` `60-apps/etzhayyim-project-hc` |
| `orgs/cloud-itonami/hc-actor` | actor **descriptor / identity** | `actor-manifest.jsonld` · `.well-known/did.json` · `src/hc/murakumo.cljc` |

They are not two copies of the same thing. Origin: this repo is `60-apps/`,
the sibling is `20-actors/`. GitHub still redirects the old names separately —
`etzhayyim/com-etzhayyim-app-hc` → here, `etzhayyim/com-etzhayyim-hc` →
`hc-actor`. Recent main (`02156a4`) removed a DID-shell copy from *this* tree
because the owner of that shell is `hc-actor`. `README.edn` still names this
repo `com-etzhayyim-app-hc`; that is the migration record, left as-is.

## Read this before `CLAUDE.md`: it is a design document, not an inventory

`CLAUDE.md` (12,565 B) describes HCCommandService / HCQueryService, eight Arrow
tables (`hc_shifts`, `hc_tasks`, …), CreateShift / BookShift / CheckIn /
CheckOut / ApproveAssignment, Matrix rooms, USDC escrow, and yoro credit
rewards. **None of those names appear in source.** `CreateShift` is a string in
`CLAUDE.md` only.

What is actually here, counted on 2026-08-13 at `02156a4` (37 tracked files;
tree-identical to west pin `124b53b` — the 6 commits between them add and
remove the same DID-shell files):

| `CLAUDE.md` says | actually here |
|---|---|
| `CreateShift` / `BookShift` / `CheckIn` / `CheckOut` / `ApproveAssignment` | **0 occurrences** outside `CLAUDE.md` |
| HCCommandService / HCQueryService on `hc0mp7ng.etzhayyim.com/xrpc` | host is **NXDOMAIN**; no Envoy, no those service names |
| 8 Arrow tables | no `.sql` / no Arrow schema file. `app.ts` reads `vertex_hc_*` via `@etzhayyim/kotodama-host-sdk` |
| Matrix `actor.SendRoomEvent` | no Matrix client in this tree |
| USDC/USDT escrow + yoro credits | no wallet / no `Invoke("murakumo", …)` |
| `wasm/etzhayyim-wasm-hc-…/svelte/src/lib/legal/contracts.ts` | path is `appview/…` (extraction renamed the directory). The file **is** here (17,912 B) |
| live site `https://hc.etzhayyim.com` | **NXDOMAIN** (curl 000) |

That is not a criticism of `CLAUDE.md` — it came across verbatim from
`etzhayyim/root`. It is a criticism of reading it as a status report.

## What is actually here

```
kotoba/                                              runnable record layer
appview/etzhayyim-wasm-hc-hc0mp7ng/src/app.ts        61,563 B host-sdk Worker — does not install
appview/etzhayyim-wasm-hc-hc0mp7ng/svelte/           Vite scaffold + contracts.ts
appview/etzhayyim-wasm-kyc-kyc49bb7/                 second scaffold; no src/app.ts
```

**Only `kotoba/` is runnable.** See
[`docs/operator-quickstart.md`](docs/operator-quickstart.md), walked end to end
on 2026-08-13 rather than transcribed from `package.json`.

`appview/etzhayyim-wasm-hc-hc0mp7ng/package.json` depends on
`@etzhayyim/kotodama-host-sdk` at `workspace:*`. npm registry returns **404**
for that name, so `npm install` there has nothing to resolve. `svelte/` adds
`@etzhayyim/design-system` at `workspace:*` on top. `App.svelte` is 442 B:
`<h1>etzhayyim-wasm-hc-hc0mp7ng</h1>` plus “Vite entry scaffold after SvelteKit
cleanup.” The KYC tree’s `App.svelte` is the same placeholder with a different
`<h1>`. There is no `component.wasm`.

`app.ts` **does** register 34 NSIDs (`com.etzhayyim.apps.hc.listHc` …
`getIntakeSummary`, including game-capture and KYC document review). That is
real TypeScript. It is not a thing you can run from this clone.

## Three DIDs, none of them serving this app

| DID | where it is written | live (2026-08-13) |
|---|---|---|
| `did:web:hc.etzhayyim.com` | `kotoba/src/types.ts` `HC_DID_PREFIX`; both `kotodama.jsonld` `@id`s (hc **and** kyc claim this same id) | host **NXDOMAIN** |
| `did:web:hc0mp7ng.etzhayyim.com:legal:…` | `app.ts` `cmdGetContract` / `cmdListContracts` | host **NXDOMAIN** |
| `did:web:etzhayyim.com:actor:hc` | sibling `hc-actor` `.well-known/did.json` | **200** at `https://etzhayyim.com/actor/hc/did.json` |

The live actor document has empty `alsoKnownAs` and empty `verificationMethod`.
The committed `hc-actor` file lists four `alsoKnownAs` entries. They are not
the same document. `pds.etzhayyim.com/.well-known/did.json` returns **530**
(Cloudflare 1033). `pds.aozora.app` returns **200**. Posting
`com.etzhayyim.apps.hc.listHc` at `atproto.etzhayyim.com` returns **501**
`MethodNotImplemented`.

`cmdGetContract` in `app.ts` also disagrees with `kotoba/` on the contract DID
shape (`…legal:worker-agreement` vs `…legal:worker-agreement:ja`) and on the
effective date (`2026-03-30` in `app.ts`, `2026-04-27` / `REV = 2` in
`contracts.ts`, `2026-04-22` in the `contracts.ts` file header). `kotoba/`
defaults `governingLaw` to the English string `"Japan"`, not `"日本法"`.

NOTICE points at `CHARTER-RIDER.md` and Apache-2.0 `LICENSE`. **Neither file
is in this repository.**

## API (kotoba, mock PDS)

Every value below is asserted by `kotoba/test/readme-example.test.ts`. If you
change a documented return value, that test goes red and you update both
together.

```ts
import { MockEtzhayyim } from "@etzhayyim/sdk-mock";
import {
  registerContract, getContract, listContracts,
  registerSpApplication, getSpApplication, listSpApplications, coverage,
} from "@etzhayyim/hc-kotoba";

const e = new MockEtzhayyim({ did: "did:web:hc.etzhayyim.com" });

await registerContract(e, { contractType: "worker-agreement", locale: "ja" });
// { status: "registered",
//   did: "did:web:hc.etzhayyim.com:legal:worker-agreement:ja",
//   templateUri: "at://did:web:hc.etzhayyim.com/com.etzhayyim.apps.hc.contractTemplate/ct-worker-agreement-ja",
//   contractType: "worker-agreement", locale: "ja" }

await registerContract(e, { contractType: "worker-agreement", locale: "ja" });
// { status: "alreadyExists", did: "did:web:hc.etzhayyim.com:legal:worker-agreement:ja", … }

await registerContract(e, { contractType: "", locale: "ja" });
// { status: "rejected", error: "missingRequiredFields" }

(await getContract(e, { contractType: "worker-agreement", locale: "ja" })).template.did
// "did:web:hc.etzhayyim.com:legal:worker-agreement:ja"
(await getContract(e, { contractType: "worker-agreement", locale: "ja" })).template.governingLaw
// "Japan"   ← English default, not 「日本法」
await getContract(e, { contractType: "nope", locale: "ja" });
// { error: "notFound" }

await registerSpApplication(e, {
  applicationId: "app1",
  legalName: "Shenzhen OEM Co Ltd",
  contactEmail: "kyc@oem.example",
  countryIso3: "CHN",
  category: "sp-kyc-review",
});
// { status: "recorded", keyId: <present>, uri: <present> }

await registerSpApplication(e, {
  applicationId: "x", legalName: "X", contactEmail: "bad",
  countryIso3: "JPN", category: "c",
});
// { status: "rejected", error: "invalidContactEmail" }

const outsider = new MockEtzhayyim({ did: "did:web:outsider.example" });
(await listSpApplications(outsider)).total
// 0   — encrypted body, read-cap is the writer DID
```

`registerSpApplication` defaults `verdict` to `"pending"` when omitted. The
body is written with `encryptedWrite`; a second `MockEtzhayyim` with a
different DID sees zero applications. That isolation is what the suite
actually checks — it does not construct a recipient DID and decrypt.

## What this repo does not do

- **Serve `hc.etzhayyim.com`.** NXDOMAIN. GitHub Pages for `cloud-itonami/hc`
  is 404.
- **Run `app.ts`.** `workspace:*` does not resolve; there is no wrangler
  config; `package.json` `test` is `echo "no tests"`.
- **Create or book a shift.** Those commands are not in `app.ts`.
- **Talk to a real PDS from `kotoba/`.** Every passing test uses
  `@etzhayyim/sdk-mock`. There is no `pdsUrl` configuration in the package.
- **Hold CHARTER-RIDER.md / LICENSE**, despite NOTICE naming both.
