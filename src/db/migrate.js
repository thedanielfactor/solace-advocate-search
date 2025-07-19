const { sql } = require('drizzle-orm');
const { db } = require('./index');

async function createIndexes() {
  try {
    console.log('Creating database indexes for performance...');
    
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
    
    await db.execute(sql`
      ALTER TABLE advocates 
      ADD COLUMN IF NOT EXISTS specialty_count INTEGER 
      GENERATED ALWAYS AS (jsonb_array_length(specialties)) STORED;
    `);
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_advocates_specialty_count 
      ON advocates(specialty_count);
    `);
    
    console.log('✅ Database indexes created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    throw error;
  }
}

async function generateLargeDataset() {
  try {
    console.log('Generating large dataset for testing...');
    
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
    
    // Insert in batches of 1000
    const batchSize = 1000;
    for (let i = 0; i < advocates.length; i += batchSize) {
      const batch = advocates.slice(i, i + batchSize);
      await db.insert(require('./schema').advocates).values(batch);
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(advocates.length / batchSize)}`);
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
    
    // Uncomment the line below to generate a large dataset for testing
    // await generateLargeDataset();
    
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
