import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://your-project.supabase.co', 'public-anon-key');

const insertCapacityData = async () => {
  const teamMetrics = {
    total_team_capacity: 1126.4,
    estimated_usage: 478.9,
    remaining_capacity: 647.5,
  };

  const members = [
    "Mayur Mate", "Muskan", "Shantanu Burlawar", "Nidhi Shende",
    "Amisha", "Shubhangi", "Adarsh", "Azharuddin Mulla"
  ];

  for (const name of members) {
    await supabase.from('capacity_summary').insert({
      team_member: name,
      days_worked: 22,
      man_hours: 176,
      capacity_80_percent: 140.8,
      ...teamMetrics
    });
  }
};

insertCapacityData();