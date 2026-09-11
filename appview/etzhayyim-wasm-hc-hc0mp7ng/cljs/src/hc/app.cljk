(ns hc.app
  "HC appview frontend shell.

  Migrated from the Svelte/Vite scaffold at
  appview/etzhayyim-wasm-hc-hc0mp7ng/svelte (a single `App.svelte` with a
  heading + one paragraph, no interactivity, no routing — its own copy says
  'Vite entry scaffold after SvelteKit cleanup.') to reagent + re-frame,
  rendered with `jp-go-dds.core` (デジタル庁デザインシステム) hiccup. This is
  still a scaffold, not the gig-shift + micro-task marketplace UI described in
  the repo's root README / CLAUDE.md — see those for what is and is not
  implemented here (README.md: 'This repository is the app extraction of that
  design, not a running platform'). The XRPC service (`kotoba/src/registry.ts`)
  and the Worker entry (`src/app.ts`) are unaffected by this migration.

  The legal contract text module that used to live alongside the Svelte
  scaffold at `svelte/src/lib/legal/contracts.ts` (17,912 B, CLAUDE.md's
  §Contracts authoritative source) is not a Svelte file — it is plain data
  with no framework dependency — so it moved to a sibling
  `appview/etzhayyim-wasm-hc-hc0mp7ng/legal/contracts.ts` instead of being
  deleted with the rest of `svelte/`. It is not imported here; nothing in the
  original App.svelte referenced it either.

  `public/index.html`'s inlined <style> was produced once, at authoring time,
  by `jp-go-dds.page/->page` running on the JVM (via this deps.edn's jp-go-dds
  git/sha), concatenating the vendored `dds.css` with `jp-go-dds.core/ext-css`
  — exactly what `jp-go-dds.page/page` composes for its own <style> block.
  This namespace itself only requires `jp-go-dds.core` — the browser bundle
  does not need `jp-go-dds.page` or `html.core` at runtime; those are JVM-only
  tools used to author the static shell once. Regenerate that shell (e.g. if
  jp-go-dds's core components or ext-rules change) with:

    (require '[jp-go-dds.page :as page] '[clojure.java.io :as io])
    (spit \"public/index.html\"
          (page/->page {:title \"etzhayyim-wasm-hc-hc0mp7ng\"
                         :description \"HC appview frontend shell (reagent + re-frame + jp-go-dds).\"
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
  {:page/heading "etzhayyim-wasm-hc-hc0mp7ng"
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
