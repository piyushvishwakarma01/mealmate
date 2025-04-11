-- Create Volunteers table
CREATE TABLE IF NOT EXISTS volunteers (
  id UUID PRIMARY KEY REFERENCES users(id),
  availability JSONB,
  vehicle_type TEXT,
  service_areas TEXT[],
  max_distance NUMERIC,
  verified BOOLEAN DEFAULT FALSE,
  verification_document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create VolunteerAssignments table
CREATE TABLE IF NOT EXISTS volunteer_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  volunteer_id UUID NOT NULL REFERENCES users(id),
  donation_id UUID NOT NULL REFERENCES food_donations(id),
  pickup_id UUID REFERENCES pickup_schedules(id),
  assigned_by_id UUID NOT NULL REFERENCES users(id),
  assigned_by_role user_role NOT NULL,
  status TEXT NOT NULL DEFAULT 'assigned',
  pickup_address TEXT NOT NULL,
  dropoff_address TEXT NOT NULL,
  pickup_time TIMESTAMP WITH TIME ZONE NOT NULL,
  dropoff_time TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for Volunteers table
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Volunteers can view their own data" ON volunteers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Volunteers can update their own data" ON volunteers
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "NGOs can view volunteer data" ON volunteers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'ngo'
    )
  );

CREATE POLICY "Donors can view volunteer data" ON volunteers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'donor'
    )
  );

CREATE POLICY "Admins can view all volunteers" ON volunteers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add RLS policies for VolunteerAssignments table
ALTER TABLE volunteer_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Volunteers can view their own assignments" ON volunteer_assignments
  FOR SELECT USING (volunteer_id = auth.uid());

CREATE POLICY "Volunteers can update their own assignments" ON volunteer_assignments
  FOR UPDATE USING (volunteer_id = auth.uid());

CREATE POLICY "NGOs can create volunteer assignments" ON volunteer_assignments
  FOR INSERT WITH CHECK (
    assigned_by_role = 'ngo' AND
    assigned_by_id = auth.uid()
  );

CREATE POLICY "NGOs can view assignments they created" ON volunteer_assignments
  FOR SELECT USING (
    assigned_by_id = auth.uid() AND
    assigned_by_role = 'ngo'
  );

CREATE POLICY "Donors can create volunteer assignments" ON volunteer_assignments
  FOR INSERT WITH CHECK (
    assigned_by_role = 'donor' AND
    assigned_by_id = auth.uid()
  );

CREATE POLICY "Donors can view assignments they created" ON volunteer_assignments
  FOR SELECT USING (
    assigned_by_id = auth.uid() AND
    assigned_by_role = 'donor'
  );

CREATE POLICY "Admins can view all volunteer assignments" ON volunteer_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
