-- ─────────────────────────────────────────────────────────────────────────────
-- studio_folders & studio_assets — Asset Bank persistence
--
-- Powers the Content Studio → Asset Bank tab. Each user has their own folders
-- and uploaded files. Files themselves live in the `studio-assets` storage
-- bucket; this table tracks the metadata + storage path.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS studio_folders (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS studio_folders_user_id_idx ON studio_folders (user_id);

CREATE TABLE IF NOT EXISTS studio_assets (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id     uuid REFERENCES studio_folders(id) ON DELETE SET NULL,
  name          text NOT NULL,
  mime_type     text,
  size_bytes    bigint NOT NULL DEFAULT 0,
  storage_path  text NOT NULL,           -- path inside the studio-assets bucket
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS studio_assets_user_id_idx    ON studio_assets (user_id);
CREATE INDEX IF NOT EXISTS studio_assets_folder_id_idx  ON studio_assets (folder_id);
CREATE INDEX IF NOT EXISTS studio_assets_created_at_idx ON studio_assets (created_at DESC);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE studio_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_assets  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS studio_folders_owner_all ON studio_folders;
CREATE POLICY studio_folders_owner_all
  ON studio_folders
  FOR ALL
  TO authenticated
  USING      (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS studio_assets_owner_all ON studio_assets;
CREATE POLICY studio_assets_owner_all
  ON studio_assets
  FOR ALL
  TO authenticated
  USING      (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── Storage bucket (run separately in Supabase Dashboard → Storage if RLS
-- restrictions block the next block) ─────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('studio-assets', 'studio-assets', false)
ON CONFLICT (id) DO NOTHING;

-- Each user gets their own top-level folder inside the bucket (their UUID).
-- Policies restrict file access to that folder.

DROP POLICY IF EXISTS "studio_assets_user_read"   ON storage.objects;
DROP POLICY IF EXISTS "studio_assets_user_insert" ON storage.objects;
DROP POLICY IF EXISTS "studio_assets_user_delete" ON storage.objects;

CREATE POLICY "studio_assets_user_read"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'studio-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "studio_assets_user_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'studio-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "studio_assets_user_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'studio-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
