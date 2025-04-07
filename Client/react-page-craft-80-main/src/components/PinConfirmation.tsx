import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface PinConfirmationProps {
  onCancel: () => void;
  onConfirm: (pin: string) => void;
  isLoading?: boolean;
}

const PinConfirmation: React.FC<PinConfirmationProps> = ({ onCancel, onConfirm, isLoading = false }) => {
  const [pin, setPin] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length === 6) {
      onConfirm(pin);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="flex items-center px-4 py-3 border-b">
        <button onClick={onCancel} className="text-gray-700">
          <X className="h-6 w-6" />
        </button>
        <h1 className="ml-4 text-lg font-medium text-gray-800">Enter PIN</h1>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col p-6">
        <h2 className="text-xl font-medium text-gray-800 mb-2">Confirm Payment</h2>
        <p className="text-gray-500 text-sm mb-8">
          Please enter your 6-digit PIN to confirm the payment
        </p>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <div className="mb-8">
            <Label htmlFor="pin" className="text-xs text-gray-500 mb-1 block">PIN</Label>
            <Input
              id="pin"
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="border-gray-300 text-lg py-6"
              placeholder="Enter 6-digit PIN"
              inputMode="numeric"
              pattern="[0-9]*"
              autoFocus
            />
          </div>

          <div className="mt-auto">
            <Button
              type="submit"
              disabled={pin.length !== 6 || isLoading}
              className="w-full bg-seva-green hover:bg-green-600 text-white py-6 rounded-md text-lg"
            >
              {isLoading ? "Processing..." : "Confirm Payment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PinConfirmation;
