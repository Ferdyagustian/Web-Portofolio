-- 1. Pastikan RLS Aktif untuk tabel contact_messages
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- 2. Kebijakan agar SIAPAPUN (Anonim) bisa mengirim pesan ke tabel ini
-- Ini diperlukan agar formulir kontak di website tetap berfungsi.
DROP POLICY IF EXISTS "Enable insert for everyone" ON contact_messages;
CREATE POLICY "Enable insert for everyone" ON contact_messages 
FOR INSERT 
WITH CHECK (true);

-- 3. Kebijakan keamanan agar TIDAK ADA yang bisa membaca pesan secara publik
-- Hanya Anda sebagai pemilik (melalui Dashboard Supabase) yang bisa melihat isinya.
-- Secara default, mengaktifkan RLS tanpa kebijakan SELECT akan melarang semua akses baca publik.
DROP POLICY IF EXISTS "Disable public read" ON contact_messages;
-- (Tidak perlu membuat policy SELECT jika tujuannya melarang akses baca publik)

-- 4. (Opsional) Jika Anda ingin pesan yang sudah masuk tidak bisa diubah oleh orang lain
DROP POLICY IF EXISTS "Disable update for everyone" ON contact_messages;
DROP POLICY IF EXISTS "Disable delete for everyone" ON contact_messages;
