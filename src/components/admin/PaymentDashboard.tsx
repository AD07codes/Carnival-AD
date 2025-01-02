import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, Trash2, Save, QrCode, CreditCard } from 'lucide-react';

export default function PaymentDashboard() {
  const [settings, setSettings] = useState({
    qr_image: '',
    upi_id: '',
    instructions: '',
    min_amount: 0,
    max_amount: 10000
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const { data, error } = await supabase
        .from('payment_settings')
        .select('*')
        .single();

      if (error) throw error;
      if (data) setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleQRUpload(event) {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `qr-${Date.now()}.${fileExt}`;
      const { error: uploadError, data } = await supabase.storage
        .from('payment-qr')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('payment-qr')
        .getPublicUrl(fileName);

      await updateSettings({ qr_image: publicUrl });
    } catch (error) {
      console.error('Error uploading QR:', error);
      alert('Failed to upload QR code');
    } finally {
      setUploading(false);
    }
  }

  async function updateSettings(updates) {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('payment_settings')
        .upsert({
          id: 'default',
          ...settings,
          ...updates,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setSettings(prev => ({ ...prev, ...updates }));
      alert('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update settings');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
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
            
            {settings.qr_image && (
              <div className="relative group">
                <img
                  src={settings.qr_image}
                  alt="Payment QR"
                  className="w-48 h-48 object-contain bg-white rounded-lg p-2"
                />
                <button
                  onClick={() => updateSettings({ qr_image: '' })}
                  className="absolute top-2 right-2 p-2 bg-red-600 rounded-full opacity-0 
                           group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            <label className="block">
              <span className="sr-only">Upload QR Code</span>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 
                            border-dashed rounded-lg hover:border-purple-500 transition-colors">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-400">
                    <label className="relative cursor-pointer rounded-md font-medium 
                                    text-purple-500 hover:text-purple-400">
                      <span>Upload a file</span>
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

          {/* Payment Details Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">UPI ID</label>
              <input
                type="text"
                value={settings.upi_id}
                onChange={(e) => updateSettings({ upi_id: e.target.value })}
                className="mt-1 block w-full rounded-md bg-gray-700 border-transparent 
                         focus:border-purple-500 focus:ring-0"
                placeholder="Enter UPI ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400">
                Payment Instructions
              </label>
              <textarea
                value={settings.instructions}
                onChange={(e) => updateSettings({ instructions: e.target.value })}
                rows={4}
                className="mt-1 block w-full rounded-md bg-gray-700 border-transparent 
                         focus:border-purple-500 focus:ring-0"
                placeholder="Enter payment instructions..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Minimum Amount
                </label>
                <input
                  type="number"
                  value={settings.min_amount}
                  onChange={(e) => updateSettings({ min_amount: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-transparent 
                           focus:border-purple-500 focus:ring-0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Maximum Amount
                </label>
                <input
                  type="number"
                  value={settings.max_amount}
                  onChange={(e) => updateSettings({ max_amount: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-transparent 
                           focus:border-purple-500 focus:ring-0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
        {/* Add transaction history table here */}
      </div>
    </div>
  );
}
