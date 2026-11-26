-- Backfill idempoten author_id untuk arsip berita legacy yang cocok unik dengan pengguna aktif.

WITH matched_users AS (
    SELECT
        LOWER(TRIM(name)) AS normalized_name,
        MIN(id) AS user_id,
        MIN(role) AS user_role
    FROM public.users
    WHERE is_active = TRUE
      AND TRIM(name) <> ''
    GROUP BY LOWER(TRIM(name))
    HAVING COUNT(*) = 1
)
UPDATE public.berita AS b
SET author_id = mu.user_id
FROM matched_users AS mu
WHERE b.author_id IS NULL
  AND LOWER(TRIM(b.author_name)) = mu.normalized_name
  AND (
      b.author_role IS NULL
      OR b.author_role = mu.user_role
  );

CREATE INDEX IF NOT EXISTS idx_berita_author_id
    ON public.berita (author_id);
