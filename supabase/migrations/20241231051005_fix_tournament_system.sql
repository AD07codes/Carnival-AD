-- Create payment_settings table if not exists
CREATE TABLE IF NOT EXISTS payment_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    qr_image_url TEXT,
    upi_id TEXT DEFAULT 'darkevil@yespop',
    instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create storage for QR codes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-qr', 'payment-qr', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow public access to QR images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'payment-qr' );

-- Create policy to allow authenticated users to upload QR images
CREATE POLICY "Allow admin uploads"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'payment-qr' AND
    auth.role() = 'authenticated' AND
    (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
);

-- Add policies for payment settings
CREATE POLICY "Allow admin to manage payment settings"
ON payment_settings
TO authenticated
USING (
    (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
    (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Allow users to view payment settings"
ON payment_settings
FOR SELECT
TO authenticated
USING (true);

-- Insert default payment settings if not exists
INSERT INTO payment_settings (id, upi_id, instructions)
VALUES ('default', 'darkevil@yespop', 'Please make the payment using the QR code or UPI ID above.')
ON CONFLICT (id) DO NOTHING;
