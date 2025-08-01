const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { sql } = require('drizzle-orm');

// Database setup
const setup = () => {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    return null;
  }

  const queryClient = postgres(process.env.DATABASE_URL);
  const db = drizzle(queryClient);
  return db;
};

const db = setup();

if (!db) {
  console.error('❌ Database connection failed. Please check your DATABASE_URL environment variable.');
  process.exit(1);
}

async function createIndexes() {
  try {
    console.log('Creating database indexes for performance...');
    
    // Fix column name issue (rename payload to specialties if it exists)
    try {
      await db.execute(sql`
        ALTER TABLE advocates RENAME COLUMN payload TO specialties;
      `);
      console.log('✅ Renamed payload column to specialties');
    } catch (error) {
      // Column might already be renamed or not exist, which is fine
      console.log('ℹ️  Column rename skipped (may already be correct)');
    }
    
    // Primary search indexes
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_advocates_first_name 
      ON advocates(first_name);
    `);
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_advocates_last_name 
      ON advocates(last_name);
    `);
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_advocates_city 
      ON advocates(city);
    `);
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_advocates_degree 
      ON advocates(degree);
    `);
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_advocates_years_experience 
      ON advocates(years_of_experience);
    `);
    
    // Composite indexes for common queries
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_advocates_name_city 
      ON advocates(first_name, last_name, city);
    `);
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_advocates_degree_experience 
      ON advocates(degree, years_of_experience);
    `);
    
    // Full-text search index for specialties
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_advocates_specialties_gin 
      ON advocates USING gin(to_tsvector('english', specialties::text));
    `);
    
    // Computed columns for better performance
    await db.execute(sql`
      ALTER TABLE advocates 
      ADD COLUMN IF NOT EXISTS full_name TEXT 
      GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED;
    `);
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_advocates_full_name 
      ON advocates(full_name);
    `);
    
    // Add computed column safely (will be populated when we insert new data)
    try {
      // Drop the column if it exists to avoid conflicts
      await db.execute(sql`
        ALTER TABLE advocates DROP COLUMN IF EXISTS specialty_count;
      `);
      
      // Recreate the computed column
      await db.execute(sql`
        ALTER TABLE advocates 
        ADD COLUMN specialty_count INTEGER 
        GENERATED ALWAYS AS (jsonb_array_length(specialties)) STORED;
      `);
      
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_advocates_specialty_count 
        ON advocates(specialty_count);
      `);
      
      console.log('✅ Added specialty_count computed column');
    } catch (error) {
      console.log('⚠️  Skipping specialty_count column due to data format issues');
    }
    
    console.log('✅ Database indexes created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    throw error;
  }
}

async function generateLargeDataset() {
  try {
    console.log('Generating large dataset for testing...');
    
    // Clear existing data to ensure clean state
    await db.execute(sql`DELETE FROM advocates`);
    console.log('✅ Cleared existing data');
    
    // Temporarily drop the computed column to avoid issues during bulk insert
    try {
      await db.execute(sql`ALTER TABLE advocates DROP COLUMN IF EXISTS specialty_count;`);
      console.log('✅ Temporarily dropped specialty_count column for bulk insert');
    } catch (error) {
      console.log('ℹ️  specialty_count column not found, continuing...');
    }
    
    const cities = [
      'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
      'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
      'San Francisco', 'Columbus', 'Fort Worth', 'Charlotte', 'Detroit', 'El Paso',
      'Memphis', 'Seattle', 'Denver', 'Boston', 'Nashville', 'Baltimore'
    ];
    
    const degrees = ['MD', 'PhD', 'MSW', 'PsyD', 'LPC', 'LMFT'];
    
    const specialties = [
      'Bipolar', 'LGBTQ', 'Medication/Prescribing', 'Suicide History/Attempts',
      'General Mental Health', 'Men\'s issues', 'Relationship Issues', 'Trauma & PTSD',
      'Personality disorders', 'Personal growth', 'Substance use/abuse', 'Pediatrics',
      'Women\'s issues', 'Chronic pain', 'Weight loss & nutrition', 'Eating disorders',
      'Diabetic Diet and nutrition', 'Coaching', 'Life coaching', 'Obsessive-compulsive disorders',
      'Neuropsychological evaluations', 'Attention and Hyperactivity', 'Sleep issues',
      'Schizophrenia and psychotic disorders', 'Learning disorders', 'Domestic abuse'
    ];
    
    const firstNames = [
      'John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'James', 'Jessica',
      'Robert', 'Amanda', 'William', 'Ashley', 'Richard', 'Stephanie', 'Joseph',
      'Nicole', 'Thomas', 'Elizabeth', 'Christopher', 'Helen', 'Charles', 'Deborah',
      'Daniel', 'Lisa', 'Matthew', 'Nancy', 'Anthony', 'Karen', 'Mark', 'Betty'
    ];
    
    const lastNames = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
      'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
      'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
      'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark',
      'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King'
    ];
    
    // Generate 100,000 advocates
    const advocates = [];
    for (let i = 0; i < 100000; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const degree = degrees[Math.floor(Math.random() * degrees.length)];
      const yearsOfExperience = Math.floor(Math.random() * 30) + 1;
      const phoneNumber = Math.floor(Math.random() * 9000000000) + 1000000000;
      
      // Random specialties (1-4 specialties per advocate)
      const numSpecialties = Math.floor(Math.random() * 4) + 1;
      const advocateSpecialties = [];
      const shuffledSpecialties = [...specialties].sort(() => 0.5 - Math.random());
      for (let j = 0; j < numSpecialties; j++) {
        advocateSpecialties.push(shuffledSpecialties[j]);
      }
      
      advocates.push({
        firstName,
        lastName,
        city,
        degree,
        specialties: advocateSpecialties,
        yearsOfExperience,
        phoneNumber
      });
    }
    
    // Insert in batches of 1000 using parameterized queries
    const batchSize = 1000;
    for (let i = 0; i < advocates.length; i += batchSize) {
      const batch = advocates.slice(i, i + batchSize);
      
      // Insert each record individually for safety
      for (const advocate of batch) {
        await db.execute(sql`
          INSERT INTO advocates (first_name, last_name, city, degree, specialties, years_of_experience, phone_number)
          VALUES (${advocate.firstName}, ${advocate.lastName}, ${advocate.city}, ${advocate.degree}, ${JSON.stringify(advocate.specialties)}, ${advocate.yearsOfExperience}, ${advocate.phoneNumber})
        `);
      }
      
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(advocates.length / batchSize)}`);
    }
    
    // Re-add the computed column after data insertion
    try {
      await db.execute(sql`
        ALTER TABLE advocates 
        ADD COLUMN specialty_count INTEGER 
        GENERATED ALWAYS AS (jsonb_array_length(specialties)) STORED;
      `);
      
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_advocates_specialty_count 
        ON advocates(specialty_count);
      `);
      
      console.log('✅ Re-added specialty_count computed column');
    } catch (error) {
      console.log('⚠️  Could not re-add specialty_count column:', error.message);
    }
    
    console.log('✅ Large dataset generated successfully!');
    
  } catch (error) {
    console.error('❌ Error generating dataset:', error);
    throw error;
  }
}

async function main() {
  try {
    await createIndexes();
    
    await generateLargeDataset();
    
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { createIndexes, generateLargeDataset };
