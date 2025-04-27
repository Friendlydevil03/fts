import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { QRData } from "@/types";
import { useStationStore } from "@/store/stationStore";
import { ScanBarcode, Camera, CameraOff } from "lucide-react";
import { Html5Qrcode, Html5QrcodeScanType } from "html5-qrcode";
import { useUserStore, hasRole } from "@/store/userStore";
import { Navigate } from "react-router-dom";

const QRScanner = ({
  onScan,
}: {
  onScan: (data: string) => void;
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [scannerInitialized, setScannerInitialized] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerDivId = "qr-scanner";
  const { toast } = useToast();
  const { currentUser } = useUserStore();


  useEffect(() => {
    // Cleanup scanner when component unmounts
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

   if (currentUser && !hasRole(currentUser, ['admin', 'attendant'])) {
    return <Navigate to="/wallet" />;
  }

  const handleStartScan = () => {
  console.log("Starting scanner...");

      // Check browser support for camera
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          title: "Browser Not Supported",
          description: "Your browser doesn't support camera access. Please try a different browser.",
          variant: "destructive",
        });
        return;
      }

      setIsScanning(true);

      // Find or create scanner container
      setTimeout(() => {
        const scannerContainer = document.getElementById(scannerDivId);
        if (!scannerContainer) {
          console.error(`Scanner container element with id=${scannerDivId} not found`);
          setIsScanning(false);
          toast({
            title: "Scanner Error",
            description: "Could not initialize scanner interface - Scanner element not found",
            variant: "destructive",
          });
          return;
        }

        // Clean up previous scanner if it exists
        if (scannerRef.current) {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(console.error);
          }
          scannerRef.current = null;
        }

        // Initialize new scanner - corrected initialization
        try {
          console.log("Initializing scanner...");
          // Initialize with just the element ID, no config options here
          scannerRef.current = new Html5Qrcode(scannerDivId);
          setScannerInitialized(true);

          // Start camera with optimized settings
          startOptimizedCamera();
        } catch (err) {
          console.error("Failed to initialize scanner:", err);
          setIsScanning(false);
          toast({
            title: "Scanner Error",
            description: "Could not initialize QR scanner. Please try again.",
            variant: "destructive",
          });
        }
      }, 300);
    };

  // Enhanced camera start with better QR detection
  const startOptimizedCamera = async () => {
    if (!scannerRef.current) return;

    console.log("Starting optimized camera...");

    try {
      // List available cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      console.log("Available cameras:", cameras.length);

      // Camera settings for better QR detection
      const config = {
        fps: 15,                    // Higher FPS for better detection
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false,        // Allow mirroring if needed
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
      };

      let cameraId;

      // Try to use back camera if available (better for QR scanning)
      if (cameras.length > 1) {
        // In most devices, the back camera is the last one in the list
        cameraId = cameras[cameras.length - 1].deviceId;
      }

      // Start scanning with either specific camera or default environment mode
      if (cameraId) {
        await scannerRef.current.start(
          { deviceId: cameraId },
          config,
          handleSuccessfulScan,
          handleScanError
        );
      } else {
        await scannerRef.current.start(
          { facingMode: "environment" },
          config,
          handleSuccessfulScan,
          handleScanError
        );
      }

      // Apply custom CSS to improve video display
      applyOptimizedVideoCSS();

      console.log("Camera started successfully");
    } catch (err) {
      console.error("Error starting camera:", err);
      toast({
        title: "Camera Error",
        description: "Failed to start camera. Please check permissions.",
        variant: "destructive",
      });
      setPermissionDenied(true);
      setIsScanning(false);
    }
  };

  // Improved success handler with better error checking
  const handleSuccessfulScan = (decodedText: string) => {
    console.log("QR code detected:", decodedText);

    try {
      // Validate the QR data
      JSON.parse(decodedText); // This will throw an error if not valid JSON

      // If we get here, the JSON is valid
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
      setIsScanning(false);

      // Process the valid QR data
      onScan(decodedText);
    } catch (error) {
      console.error("Invalid QR code data:", error);

      // Don't stop scanning for invalid QR codes, just notify
      toast({
        title: "Invalid QR Code",
        description: "The scanned QR code is not in the expected format",
        variant: "destructive",
        duration: 3000,
      });

      // Continue scanning - don't stop or call onScan with invalid data
    }
  };

  // Error handler that doesn't stop scanning
  const handleScanError = (errorMessage: string) => {
    // Most QR scan errors are normal and expected
    // Only log them, don't show toasts which would be distracting
    console.log("QR scan error:", errorMessage);
  };

  // Apply optimized CSS for better video display
  const applyOptimizedVideoCSS = () => {
    setTimeout(() => {
      const scanner = document.getElementById(scannerDivId);
      if (!scanner) return;

      // Find the video element created by the scanner
      const video = scanner.querySelector('video');
      if (video) {
        // Optimize video display
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
        video.style.borderRadius = '0.5rem';
      }

      // Find the canvas element used for detection
      const canvas = scanner.querySelector('canvas');
      if (canvas) {
        // Optimize canvas for detection
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
      }
    }, 500);
  };

  const handleStopScan = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().catch(console.error);
    }
    setIsScanning(false);
  };

  const handleSimulateScan = () => {
    const mockQrData: QRData = {
      userId: "user-001",
      walletId: "wallet-001",
      vehicleId: "vehicle-001",
      fuelType: "Regular",
      maxAmount: 200,
    };

    onScan(JSON.stringify(mockQrData));
    setIsScanning(false);
  };

  return (
    <Card className="border-2 border-dashed border-fuel-blue-200">
      <CardContent className="p-8 flex flex-col items-center justify-center">
        <div className="bg-fuel-blue-100 p-4 rounded-full mb-4">
          <ScanBarcode className="h-12 w-12 text-fuel-blue-500" />
        </div>

        {isScanning ? (
          <div className="space-y-4 text-center">
            <div className="h-[300px] w-full bg-fuel-blue-50 border-2 border-fuel-blue-200 flex flex-col items-center justify-center rounded-lg relative overflow-hidden">
              {/* Scanner container */}
              <div id={scannerDivId} className="w-full h-full absolute top-0 left-0 z-10"></div>

              {/* Scanning animation */}
              <div className="absolute w-full h-2 bg-fuel-blue-300 opacity-70 top-0 z-20"
                style={{
                  animation: "scanAnimation 2s infinite"
                }}
              ></div>

              {/* Positioning guide */}
              <div className="absolute w-[250px] h-[250px] border-2 border-dashed border-fuel-blue-400 rounded-lg z-20"
                   style={{
                     boxShadow: '0 0 0 2000px rgba(0,0,0,0.15)'
                   }}>
              </div>

              {/* Starting message */}
              {isScanning && !scannerRef.current?.isScanning && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 bg-white p-2 rounded">
                  Starting camera...
                </div>
              )}

              {/* Animation styles */}
              <style>
                {`
                  @keyframes scanAnimation {
                    0% { transform: translateY(0); }
                    50% { transform: translateY(300px); }
                    100% { transform: translateY(0); }
                  }
                `}
              </style>
            </div>

            <p className="text-gray-500">
              Position QR code in the center box and hold steady
            </p>

            <Button
              onClick={handleStopScan}
              variant="outline"
              className="bg-red-50 hover:bg-red-100 text-red-600"
            >
              <CameraOff className="h-5 w-5 mr-2" />
              Stop Scanner
            </Button>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <h3 className="text-xl font-semibold text-fuel-blue-700">
              Ready to Scan
            </h3>
            <p className="text-gray-500">
              Scan the customer's QR code to process payment
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
              <Button
                onClick={handleStartScan}
                className="bg-fuel-blue-500 hover:bg-fuel-blue-600"
                disabled={permissionDenied}
              >
                <Camera className="h-5 w-5 mr-2" />
                Start Scanner
              </Button>

              {process.env.NODE_ENV !== 'production' && (
                <Button
                  onClick={handleSimulateScan}
                  variant="outline"
                  className="border-fuel-blue-300 text-fuel-blue-700"
                >
                  Simulate Scan (Dev)
                </Button>
              )}
            </div>

            {permissionDenied && (
              <div className="mt-2 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                Camera access was denied. Please check your browser permissions and try again.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

    const ScanQR = () => {
      const navigate = useNavigate();
      const { toast } = useToast();
      const { setScannedQrData } = useStationStore();

      // This is only the modified part of your existing ScanQR.tsx file

    const handleScan = async (data: string) => {
      try {
        const parsedData = JSON.parse(data);

        // Validate expected fields
        if (!parsedData.userId || !parsedData.walletId) {
          throw new Error("Invalid QR format");
        }

        setScannedQrData(parsedData);

        toast({
          title: "QR Code Scanned",
          description: "Customer wallet identified",
        });

        // Navigate to fuel selection and amount entry page
        navigate(`/scanner/select-fuel/${parsedData.userId}`);
      } catch (error) {
        toast({
          title: "Invalid QR Code",
          description: "The QR code could not be processed",
          variant: "destructive",
        });
      }
    };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-fuel-blue-700">Scan Customer Code</h2>
      <QRScanner onScan={handleScan} />
    </div>
  );
};

export default ScanQR;