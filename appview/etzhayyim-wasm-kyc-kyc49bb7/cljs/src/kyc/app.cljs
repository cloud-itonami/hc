(ns kyc.app
  "KYC appview frontend shell.

  Migrated from the Svelte/Vite scaffold at
  appview/etzhayyim-wasm-kyc-kyc49bb7/svelte (a single `App.svelte` with a
  heading + one paragraph, no interactivity, no routing — its own copy says
  'Vite entry scaffold after SvelteKit cleanup.') to reagent + re-frame,
  rendered with `jp-go-dds.core` (デジタル庁デザインシステム) hiccup. This is
  still a scaffold, not a running KYC/KYB verification UI — see the repo's
  root README / CLAUDE.md for what is and is not implemented (README.md:
  'This repository is the app extraction of that design, not a running
  platform'). This repo's other appview,
  `appview/etzhayyim-wasm-hc-hc0mp7ng/cljs/src/hc/app.cljs`, was migrated
  the same way on 2026-08-26 and is the reference this port follows
  verbatim, one namespace over.

  This appview's `svelte/` tree had no `+server.ts` / `+page.server.ts` /
  `hooks.server.ts` (no backend handlers), no `static/` build artifacts, and
  no non-Svelte domain-data module (unlike the sibling appview's
  `svelte/src/lib/legal/contracts.ts`) — every file under `svelte/` was
  exactly the Svelte-build keep-list (App.svelte, main.ts, svelte.d.ts,
  index.html, vite.config.ts, tailwind/postcss config, tsconfig.json,
  package.json), so nothing needed to move out with a provenance header
  before `svelte/` was deleted.

  `public/index.html`'s inlined <style> was produced once, at authoring
  time, by `jp-go-dds.page/->page` running on the JVM (via this deps.edn's
  jp-go-dds git/sha), concatenating the vendored `dds.css` with
  `jp-go-dds.core/ext-css` — exactly what `jp-go-dds.page/page` composes for
  its own <style> block. This namespace itself only requires
  `jp-go-dds.core` — the browser bundle does not need `jp-go-dds.page` or
  `html.core` at runtime; those are JVM-only tools used to author the static
  shell once. Regenerate that shell (e.g. if jp-go-dds's core components or
  ext-rules change) with:

    (require '[jp-go-dds.page :as page] '[clojure.java.io :as io])
    (spit \"public/index.html\"
          (page/->page {:title \"etzhayyim-wasm-kyc-kyc49bb7\"
                         :description \"KYC appview frontend shell (reagent + re-frame + jp-go-dds).\"
                         :css (slurp (io/resource \"jp_go_dds/dds.css\"))}
                        [:div {:id \"app\"}]
                        [:script {:src \"js/app.js\"}]))"
  (:require [reagent.dom :as rdom]
            [re-frame.core :as rf]
            [jp-go-dds.core :as dds]))

;; --- state ------------------------------------------------------------------

(def default-db
  "The two pieces of text the original App.svelte scaffold rendered as bare
  markup literals (a heading and one paragraph), now held as re-frame app-db
  data instead, so there is real event/sub logic to test."
  {:page/heading "etzhayyim-wasm-kyc-kyc49bb7"
   :page/description "Vite entry scaffold after SvelteKit cleanup."})

(rf/reg-event-db
 :initialize-db
 (fn [_ _] default-db))

(rf/reg-sub
 :page/heading
 (fn [db _] (:page/heading db)))

(rf/reg-sub
 :page/description
 (fn [db _] (:page/description db)))

;; --- view ---------------------------------------------------------------

(defn app
  "The whole page: a DADS heading + lead paragraph, centered the same way the
  original App.svelte's `main { display: grid; place-content: center; }`
  scaffold was — via the `dds-ext-hero`/`dds-ext-center` layout classes
  jp-go-dds.core already ships in `ext-css`, not app-authored CSS."
  []
  [:main {:class "dds-ext-hero dds-ext-center"}
   (dds/heading 1 @(rf/subscribe [:page/heading]))
   [:p {:class "dds-ext-lead"} @(rf/subscribe [:page/description])]])

;; --- mount ------------------------------------------------------------------

(defn render []
  (rdom/render [app] (.getElementById js/document "app")))

(defn ^:export main []
  (rf/dispatch-sync [:initialize-db])
  (render))
