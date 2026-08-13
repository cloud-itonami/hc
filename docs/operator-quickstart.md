# Operator quickstart

Every command below was executed on 2026-08-13 against commit `02156a4`, on a
fresh copy of `kotoba/` with no changes other than the ones this document tells
you to make and undo. Output is transcribed, not paraphrased. Timings are what
the clock said here, not targets. If a step does not reproduce for you, that is
a bug in this document — fix it here rather than working around it in silence.

Environment used: macOS (darwin 25.3.0), Node v26.3.0, npm 11.16.0.

**Only `kotoba/` is runnable.** Both `appview/` trees depend on
`@etzhayyim/kotodama-host-sdk` at `workspace:*` (npm registry 404). Do not
start there. `npm test` in
`appview/etzhayyim-wasm-hc-hc0mp7ng` is `echo "no tests"`.

## 0. Read this before you run `npm install`

On a machine whose **user** `~/.npmrc` contains an `allow-scripts[]` entry, a
plain install dies in about two seconds:

```console
$ cd kotoba && npm install --no-audit --no-fund
npm error code 1
npm error git dep preparation failed
npm error command …/npm-cli.js install --force --cache=… --no-audit …
npm error npm warn using --force Recommended protections disabled.
npm error npm error code EALLOWSCRIPTS
npm error npm error --allow-scripts is not allowed in project-scoped installs.
npm error npm error Add the entries to the "allowScripts" field in package.json, or to .npmrc, instead.
```

`@etzhayyim/sdk` is a git dependency that declares `"prepare": "tsc"`, so npm
must build it after cloning. It does that by **re-entering itself** with
`--force`. That nested install inherits the user config's `allow-scripts` as a
command-line flag, and npm rejects `--allow-scripts` on a project-scoped
install. Nothing about this repo causes it. Timed here: **2.09 s**.

Point npm at a scratch user config for this one command. Do **not** delete the
entry from your real `~/.npmrc` — something else put it there.

```console
$ printf 'strict-ssl=false\n' > /tmp/npmrc-clean
$ cd kotoba && npm install --no-audit --no-fund --userconfig=/tmp/npmrc-clean
```

The `strict-ssl=false` line is carried over from this machine's `~/.npmrc`
rather than shown to be necessary; drop it first and put it back only if the
install complains about certificates.

If your `~/.npmrc` has no `allow-scripts` entry, none of this applies and plain
`npm install` is the same command. This failure and this fix were first written
down in `cloud-itonami/gtin` / `cloud-itonami/flight-offer`, whose `kotoba/`
packages have the same `@etzhayyim/sdk` git dependency; it reproduces here
unchanged.

## 1. Install

```console
$ npm install --no-audit --no-fund --userconfig=/tmp/npmrc-clean

added 135 packages in 2m
npm warn allow-scripts 8 packages have install scripts not yet covered by allowScripts:
npm warn allow-scripts   @etzhayyim/sdk@0.1.0-alpha (prepare: tsc)
npm warn allow-scripts   @etzhayyim/atproto-client@0.1.0-alpha (prepare: tsc)
npm warn allow-scripts   @etzhayyim/base-l2@0.1.0-alpha (prepare: tsc)
npm warn allow-scripts   @etzhayyim/checkpointer@0.1.0-alpha (prepare: tsc)
npm warn allow-scripts   @etzhayyim/ipfs@0.1.0-alpha (prepare: tsc)
npm warn allow-scripts   @etzhayyim/pqh@0.1.0-alpha (prepare: tsc)
npm warn allow-scripts   @etzhayyim/witness-quorum@0.1.0-alpha (prepare: tsc)
npm warn allow-scripts   @signalapp/libsignal-client@0.94.4 (install: echo Use `npm run build` …)
```

Minutes, not seconds, is normal: npm clones seven git dependencies and runs
`tsc` inside each one. Two minutes here with a warm npm cache and no lockfile
(a sibling `gtin` install had already populated the cache; a cold clone took
seven minutes there). A pile of `npm warn gitignore-fallback No .npmignore
file found` lines scrolls past during that; they are about the git
dependencies' packaging, not about this repo.

Two things in that warning list look like failures and are not:

- The `prepare: tsc` lines describe the **outer** tree's lifecycle scripts,
  which npm declines to run. The builds you actually need already happened
  during git-dependency preparation. Confirm rather than trust it:

  ```console
  $ ls node_modules/@etzhayyim/sdk/dist/index.js
  node_modules/@etzhayyim/sdk/dist/index.js
  ```

- `@signalapp/libsignal-client` is an optional native dependency of the SDK.
  Nothing in this package imports it.

At `02156a4` this repo had no `.gitignore`, so finishing this step put a wall
of `node_modules` in `git status`. One was added in the same change that wrote
this document. If your `git status` is unreadable, you are on an older commit.

## 2. Run the tests

```console
$ npm test

> @etzhayyim/hc-kotoba@0.0.0 test
> vitest run

 RUN  v4.1.10 /private/tmp/hc-qs-pre/kotoba

 Test Files  2 passed (2)
      Tests  10 passed (10)
   Duration  373ms
```

Under half a second. If it took two minutes, you are watching step 1
again.

Unlike the sibling `gtin` package, this one **does** ship `typescript` and a
`typecheck` script. `tsc --noEmit` exits 0 with no output on `02156a4` (it
typechecks `src/**` only — `test/` is not in `tsconfig.json` `include`).
`vitest` still strips types rather than checking them, so a type error in a
test file will not fail `npm test`.

The two files are not the same kind of test:

| file | what it holds |
|---|---|
| `test/hc.test.ts` | 5 behavioural cases — register / get / list / encrypt / coverage |
| `test/readme-example.test.ts` | 5 cases asserting every value printed in `README.md` |

The second exists so the README cannot drift the way `CLAUDE.md` already has.

## 3. Prove the suite can fail

A test suite you have only ever seen pass tells you nothing. Break one thing,
watch the right case go red, put it back. Each of these was run here.

```console
$ sed -i '' 's/"Japan"/"日本法"/' src/registry.ts
$ npx vitest run test/readme-example.test.ts

AssertionError: expected '日本法' to be 'Japan'
 Tests  1 failed | 4 passed (5)

$ git checkout src/registry.ts
```

Two more, same shape — the mutation, the case that catches it, and nothing
else:

| break | red case | collateral |
|---|---|---|
| default `governingLaw` `"Japan"` → `"日本法"` | `getContract prints the English default` | none — 4 others pass |
| `registerContract` empty-type return → `"alreadyExists"` | `registerContract statuses` | none — 4 others pass |
| `isEmail` regex → `/^/` (everything matches) | `registerSpApplication rejects a non-email` | none — 4 others pass |

The first pins a wart rather than a feature: `kotoba/` stores governing law as
the English string `"Japan"` while `contracts.ts` and `app.ts` say `"日本法"`.
If someone unifies them, the suite will say so instead of staying quiet.

After restoring, confirm you are back where you started:

```console
$ npm test
 Test Files  2 passed (2)
      Tests  10 passed (10)
```

## 4. Use it from a REPL

There isn't one. `node --experimental-strip-types` cannot load this package —
`@etzhayyim/sdk-mock` ships TypeScript as its entry point and Node refuses to
strip types under `node_modules`:

```console
$ node --experimental-strip-types scratch.ts
Error [ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING]: Stripping types is
currently unsupported for files under node_modules, for
"…/node_modules/@etzhayyim/sdk-mock/src/index.ts"
```

`vitest` is the only runner this package has, so exploratory code goes in a
throwaway file under `test/` and runs with `npx vitest run test/<file>`. That
is how the README example was verified.

## 5. What you cannot do from here

- **Write to a PDS.** Every run above uses `@etzhayyim/sdk-mock`. Nothing in
  this repo has been pointed at a real PDS.
- **Hit `hc.etzhayyim.com` or `hc0mp7ng.etzhayyim.com`.** Both are NXDOMAIN.
  `com.etzhayyim.apps.hc.listHc` against `atproto.etzhayyim.com` returns 501
  `MethodNotImplemented`.
- **Install or run either `appview/` tree.** `workspace:*` does not resolve.
- **Create a shift, book a shift, check in, or pay USDC.** Those commands are
  not in this repository. `CLAUDE.md` describes them.
