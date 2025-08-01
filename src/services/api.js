// In src/services/api.js

// IMPORTANT: Replace this with your actual Supabase Anon Key
// It's better to store this in an environment variable (.env file)
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json'
};

export const getProjects = async () => {
  try {
    // The headers object is now included in the fetch options
    const response = await fetch('https://lauydzfbtlsocfsljpcn.supabase.co/rest/v1/projects?select=*', {
      headers: headers
    });

    if (!response.ok) {
      const errorData = await response.json(); // Try to get more specific error info
      throw new Error(errorData.message || 'Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return [];
  }
};