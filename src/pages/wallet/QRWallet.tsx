import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/userStore";
import { Car, X, Clock } from "lucide-react";
import QRCode from "@/components/QRCode";

interface QRWalletProps {
  currentDateTime: string;
}

// Mock data for vehicles
const vehicles = [
  {
    id: "vehicle-001",
    make: "Toyota",
    model: "Camry",
    licensePlate: "ABC123",
    fuelType: "Regular"
  },
  {
    id: "vehicle-002",
    make: "Honda",
    model: "Civic",
    licensePlate: "XYZ789",
    fuelType: "Premium"
  }
];

const QRWallet = ({ currentDateTime }: QRWalletProps) => {
  const { currentUser } = useUserStore();
  const [activeVehicle, setActiveVehicle] = useState<string | null>(vehicles[0]?.id || null);

  // Generate QR code data
  const getQRData = () => {
    if (!currentUser) return JSON.stringify({});

    const selectedVehicle = vehicles.find(v => v.id === activeVehicle);

    const qrData = {
      userId: currentUser.id || "user-001",
      walletId: currentUser.id || "wallet-001",
      name: currentUser.name || "John Doe",
      vehicle: selectedVehicle ? {
        id: selectedVehicle.id,
        licensePlate: selectedVehicle.licensePlate,
        fuelType: selectedVehicle.fuelType
      } : undefined,
      timestamp: new Date().toISOString()
    };

    return JSON.stringify(qrData);
  };

  return (
    <div className="space-y-6">
      <Card className="border-fuel-green-200">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-center">Scan to Pay</CardTitle>
              <CardDescription className="text-center">
                Show this QR code to the gas station attendant
              </CardDescription>
            </div>
            <div className="text-sm text-gray-500 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {currentDateTime}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <div className="bg-white p-4 rounded-lg border">
            <QRCode value={getQRData()} size={220} />
          </div>

          <div className="w-full max-w-md">
            <h3 className="font-medium text-sm mb-2">Select Vehicle:</h3>
            <div className="grid gap-2">
              {vehicles.map((vehicle) => (
                <Button
                  key={vehicle.id}
                  variant={activeVehicle === vehicle.id ? "default" : "outline"}
                  className={`justify-start ${
                    activeVehicle === vehicle.id
                      ? "bg-fuel-green-500 hover:bg-fuel-green-600"
                      : "hover:border-fuel-green-500"
                  }`}
                  onClick={() => setActiveVehicle(vehicle.id)}
                >
                  <Car className="h-5 w-5 mr-2" />
                  {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                </Button>
              ))}
            </div>
          </div>

          <div className="w-full max-w-md">
            <div className="bg-fuel-green-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Instructions:</h3>
              <ol className="list-decimal pl-5 space-y-1 text-sm">
                <li>Show this QR code to the station attendant</li>
                <li>They will scan it and enter the fuel details</li>
                <li>You'll receive a payment confirmation request</li>
                <li>Review and approve the payment</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRWallet;