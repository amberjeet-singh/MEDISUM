import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || 3000,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_API_KEY: process.env.SUPABASE_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  NODE_ENV: process.env.NODE_ENV || 'development',
  USE_MOCK_AI: process.env.USE_MOCK_AI === 'true'
};

export const validateEnv = () => {
  const missing: string[] = [];
  if (!env.SUPABASE_URL) missing.push('SUPABASE_URL');
  if (!env.SUPABASE_API_KEY) missing.push('SUPABASE_API_KEY');
  if (!env.USE_MOCK_AI && !env.GEMINI_API_KEY) missing.push('GEMINI_API_KEY');
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};
