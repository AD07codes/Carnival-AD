import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, Save, QrCode, CreditCard } from 'lucide-react';

export default function PaymentSettings() {
  const [settings, setSettings] = useState({
    qr_image_url: '',
    upi_id: 'darkevil@yespop',
    instructions: '',
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      let { data, error } = await supabase
        .from('payment_settings')
        .select('*')
        .single();

      if (error && error.code === 'PGRST116') {
        // No settings found, create default
        const { data: newData, error: insertError } = await supabase
          .from('payment_settings')
          .insert([{
            id: 'default',
            upi_id: 'darkevil@yespop',
            instructions: 'Please make the payment using the QR code or UPI ID above.'
          }])
          .select()
          .single();

        if (insertError) throw insertError;
        data = newData;
      } else if (error) {
        throw error;
      }

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      alert('Error loading payment settings');
    } finally {
      setLoading(false);
    }
  };

  const handleQRUpload = async (event) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploading(true);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `qr-${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('payment-qr')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('payment-qr')
        .getPublicUrl(fileName);

      // Update settings
      const { error: updateError } = await supabase
        .from('payment_settings')
        .update({ qr_image_url: publicUrl })
        .eq('id', 'default');

      if (updateError) throw updateError;

      setSettings(prev => ({ ...prev, qr_image_url: publicUrl }));
      alert('QR code uploaded successfully!');
    } catch (error) {
      console.error('Error uploading QR:', error);
      alert('Failed to upload QR code. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const updateSettings = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('payment_settings')
        .update({
          upi_id: settings.upi_id,
          instructions: settings.instructions,
          updated_at: new Date().toISOString()
        })
        .eq('id', 'default');

      if (error) throw error;
      alert('Settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-800 rounded-lg h-48"></div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-6">
      <h2 className="text-2xl font-bold flex items-center">
        <CreditCard className="w-6 h-6 mr-2" />
        Payment Settings
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* QR Code Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center">
            <QrCode className="w-5 h-5 mr-2" />
            QR Code
          </h3>

          {settings.qr_image_url && (
            <div className="bg-white p-4 rounded-lg inline-block">
              <img
                src={settings.qr_image_url}
                alt="Payment QR"
                className="w-48 h-48 object-contain"
              />
            </div>
          )}

          <label className="block">
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 
                          border-dashed rounded-lg hover:border-purple-500 transition-colors cursor-pointer">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-400">
                  <label className="relative cursor-pointer rounded-md font-medium text-purple-500 hover:text-purple-400">
                    <span>Upload QR Code</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleQRUpload}
                      disabled={uploading}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
              </div>
            </div>
          </label>
        </div>

        {/* Payment Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              UPI ID
            </label>
            <input
              type="text"
              value={settings.upi_id}
              onChange={(e) => setSettings({ ...settings, upi_id: e.target.value })}
              className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Payment Instructions
            </label>
            <textarea
              value={settings.instructions}
              onChange={(e) => setSettings({ ...settings, instructions: e.target.value })}
              rows={4}
              className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter payment instructions for users..."
            />
          </div>

          <button
            onClick={updateSettings}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 
                     disabled:cursor-not-allowed px-4 py-2 rounded-lg flex items-center justify-center"
          >
            <Save className="w-5 h-5 mr-2" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
