-- Phase 1C client portal (SEC-270): clients download their own organization's documents.
--
-- The documents bucket is private, and until now only admins could read its files. This lets a
-- signed-in client read a file only when a documents row points to it and that row belongs to one
-- of their organizations. Matching on documents.storage_path, rather than on the folder name,
-- means a stray file in an org's folder with no documents row stays admin-only.
--
-- Read only: clients still can't upload, replace or delete files.

create policy "members read own document files" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'documents'
    and exists (
      select 1 from public.documents d
      where d.storage_path = storage.objects.name
        and private.is_org_member(d.org_id)
    )
  );
