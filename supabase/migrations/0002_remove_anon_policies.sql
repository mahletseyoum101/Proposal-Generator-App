-- Security fix: the app never reads proposals or signature files as the `anon` role —
-- the public proposal page and all /api/public/* routes use the service-role client
-- exclusively (see lib/supabase/admin.ts). These two anon policies were therefore both
-- unused by the app AND dangerously broad:
--
-- 1. "Anyone can read a published proposal by token" had no token-scoping in its `using`
--    clause, so any caller with the public anon key (shipped in every page's JS bundle)
--    could query the Supabase REST API directly (`GET /rest/v1/proposals?select=*`) and
--    receive every non-draft proposal in the database — client names, business names,
--    pricing, brief text, and every public_token, defeating the "unguessable link" model
--    entirely.
-- 2. The storage policy let anyone list (enumerate) every file in the signatures bucket
--    via the Storage API, exposing every client's e-signature image. The bucket's
--    `public: true` flag already lets the app serve a signature by its exact, known path
--    with no RLS policy required — this policy only added unwanted enumeration.

drop policy if exists "Anyone can read a published proposal by token" on proposals;
drop policy if exists "Signature images are publicly readable" on storage.objects;
