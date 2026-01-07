
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hogjoxzvltogyhbjpaht.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvZ2pveHp2bHRvZ3loYmpwYWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NTcxMjUsImV4cCI6MjA4MzMzMzEyNX0.cxLHtGNid-OV5nbFg6VMHvRoI6_dL9J8ugF1qsWCTPQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
