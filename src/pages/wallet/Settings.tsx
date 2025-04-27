
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useUserStore } from "@/store/userStore";
import { Car, Plus, Trash2, User } from "lucide-react";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { vehicles, addVehicle, removeVehicle } = useUserStore();
  
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    make: "",
    model: "",
    year: "",
    type: "Sedan",
    licensePlate: "",
    fuelType: "Regular",
  });
  
  const vehicleTypes = ["Sedan", "SUV", "Hatchback", "Truck", "Van"];
  const fuelTypes = ["Regular", "Premium", "Diesel", "Electric"];
  const years = Array.from(
    { length: 25 },
    (_, i) => (new Date().getFullYear() - i).toString()
  );
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewVehicle((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setNewVehicle((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleAddVehicle = () => {
    const { make, model, year, type, licensePlate, fuelType } = newVehicle;
    
    if (!make || !model || !year || !licensePlate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    addVehicle({
      make,
      model,
      year,
      type,
      licensePlate,
      fuelType,
    });
    
    toast({
      title: "Vehicle Added",
      description: `Your ${make} ${model} has been added successfully`,
    });
    
    // Reset form
    setNewVehicle({
      make: "",
      model: "",
      year: "",
      type: "Sedan",
      licensePlate: "",
      fuelType: "Regular",
    });
    
    setShowAddVehicle(false);
  };
  
  const handleRemoveVehicle = (id: string) => {
    removeVehicle(id);
    toast({
      title: "Vehicle Removed",
      description: "Your vehicle has been removed successfully",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-fuel-green-700">Settings</h2>
      </div>
      
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            onClick={() => navigate("/wallet/profile")}
            className="w-full sm:w-auto"
          >
            Edit Profile
          </Button>
        </CardContent>
      </Card>
      
      {/* Vehicles Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Car className="h-5 w-5 mr-2" />
            Your Vehicles
          </CardTitle>
          
          {!showAddVehicle && (
            <Button
              size="sm"
              onClick={() => setShowAddVehicle(true)}
              className="bg-fuel-green-500 hover:bg-fuel-green-600"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Vehicle
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {showAddVehicle && (
            <div className="mb-6 p-4 border rounded-lg">
              <h3 className="font-medium mb-4">Add New Vehicle</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Make</label>
                  <Input
                    name="make"
                    placeholder="e.g. Toyota"
                    value={newVehicle.make}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Model</label>
                  <Input
                    name="model"
                    placeholder="e.g. Camry"
                    value={newVehicle.model}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Year</label>
                  <Select
                    value={newVehicle.year}
                    onValueChange={(value) => handleSelectChange("year", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <Select
                    value={newVehicle.type}
                    onValueChange={(value) => handleSelectChange("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">License Plate</label>
                  <Input
                    name="licensePlate"
                    placeholder="e.g. ABC123"
                    value={newVehicle.licensePlate}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Preferred Fuel Type</label>
                  <Select
                    value={newVehicle.fuelType}
                    onValueChange={(value) => handleSelectChange("fuelType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fuelTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAddVehicle(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddVehicle}
                  className="bg-fuel-green-500 hover:bg-fuel-green-600"
                >
                  Add Vehicle
                </Button>
              </div>
            </div>
          )}
          
          {vehicles.length === 0 ? (
            <div className="text-center p-4">
              <p className="text-gray-500">No vehicles added yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center mb-2 sm:mb-0">
                    <div className="bg-fuel-green-100 p-2 rounded-full mr-3">
                      <Car className="h-5 w-5 text-fuel-green-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {vehicle.make} {vehicle.model} ({vehicle.year})
                      </h3>
                      <p className="text-sm text-gray-500">
                        {vehicle.licensePlate} • {vehicle.type} • {vehicle.fuelType}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveVehicle(vehicle.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
