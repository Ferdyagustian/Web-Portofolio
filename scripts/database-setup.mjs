import postgres from 'postgres';

const sql = postgres('postgresql://postgres:Iwonderhoww166@db.zpgomcmoynrvrrugokrh.supabase.co:5432/postgres', { ssl: 'require' });

async function setup() {
  console.log("Creating tables in Supabase...");

  try {
    // Contact Messages table
    await sql`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `;
    console.log("contact_messages table created.");

    // Projects table
    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        tech_stack TEXT[] DEFAULT '{}',
        live_url TEXT,
        github_url TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `;
    console.log("projects table created.");

    // Insert dummy projects
    const existing = await sql`SELECT count(*) FROM projects`;
    if (existing[0].count === '0') {
      await sql`
        INSERT INTO projects (title, description, tech_stack, github_url) VALUES 
        ('Pixel Forest Journey', 'A WebGL interactive story using Three.js and GSAP.', ARRAY['React', 'Three.js', 'GSAP'], 'https://github.com/Ferdyagustian'),
        ('AI Data Predictor', 'Machine learning model for analyzing web traffic trends.', ARRAY['Python', 'Scikit-Learn', 'Pandas'], 'https://github.com/Ferdyagustian'),
        ('Eco-Tracker App', 'Mobile app to track carbon footprint and promote sustainable living.', ARRAY['React Native', 'Node.js', 'MongoDB'], 'https://github.com/Ferdyagustian')
      `;
      console.log("Dummy projects seeded.");
    }

  } catch (err) {
    console.error("Database setup failed:", err);
  } finally {
    await sql.end();
  }
}

setup();
