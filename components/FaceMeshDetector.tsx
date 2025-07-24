import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface FaceMeshPoint {
  x: number;
  y: number;
  z?: number;
}

interface FaceMeshDetectorProps {
  isActive: boolean;
}

export default function FaceMeshDetector({ isActive }: FaceMeshDetectorProps) {
  const { theme } = useTheme();
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [faceMeshPoints, setFaceMeshPoints] = useState<FaceMeshPoint[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [faceCount, setFaceCount] = useState(0);
  
  const animationFrameRef = useRef<number | null>(null);

  // Initialize AI system (simplified demo version)
  useEffect(() => {
    const initializeAI = async () => {
      try {
        // Simulate model loading time
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsModelLoaded(true);
        console.log('AI Face Mesh system initialized successfully');
      } catch (error) {
        console.error('Error initializing AI system:', error);
        setIsModelLoaded(true); // For demo purposes
      }
    };

    if (isActive) {
      initializeAI();
    }

    return () => {
      if (animationFrameRef.current) {
        clearTimeout(animationFrameRef.current);
      }
    };
  }, [isActive]);

  // Face detection function (simulated for demo)
  const simulateFaceDetection = async () => {
    if (!detectorRef.current || !isDetecting) return;

    try {
      // Simulated face mesh points (468 points for MediaPipe face mesh)
      // In a real implementation, this would process camera frames
      const simulatedPoints: FaceMeshPoint[] = [];

      // Create a realistic face mesh pattern
      const centerX = 150;
      const centerY = 200;

      for (let i = 0; i < 468; i++) {
        // Create different regions of the face
        let x, y;

        if (i < 100) {
          // Face contour
          const angle = (i / 100) * 2 * Math.PI;
          x = centerX + Math.cos(angle) * (80 + Math.random() * 20);
          y = centerY + Math.sin(angle) * (100 + Math.random() * 20);
        } else if (i < 200) {
          // Eyes region
          const eyeOffset = i < 150 ? -40 : 40;
          x = centerX + eyeOffset + (Math.random() - 0.5) * 30;
          y = centerY - 40 + (Math.random() - 0.5) * 20;
        } else if (i < 300) {
          // Nose region
          x = centerX + (Math.random() - 0.5) * 20;
          y = centerY - 10 + (Math.random() - 0.5) * 40;
        } else {
          // Mouth region
          x = centerX + (Math.random() - 0.5) * 60;
          y = centerY + 40 + (Math.random() - 0.5) * 20;
        }

        simulatedPoints.push({
          x: Math.max(0, Math.min(300, x)),
          y: Math.max(0, Math.min(400, y)),
          z: Math.random() * 50,
        });
      }

      setFaceMeshPoints(simulatedPoints);
      setFaceCount(1);
    } catch (error) {
      console.error("Error in face detection simulation:", error);
    }

    // Schedule next detection
    if (isDetecting) {
      animationFrameRef.current = setTimeout(simulateFaceDetection, 100) as any;
    }
  };

  // Start/stop detection
  const toggleDetection = () => {
    if (!isModelLoaded) {
      Alert.alert("Model Loading", "Please wait for the AI model to load.");
      return;
    }

    setIsDetecting(!isDetecting);
  };

  // Start detection when model is loaded and detection is enabled
  useEffect(() => {
    if (isModelLoaded && isDetecting) {
      simulateFaceDetection();
    }
  }, [isModelLoaded, isDetecting]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* AI Status */}
      <View style={styles.statusContainer}>
        <Text style={[styles.statusText, { color: theme.text }]}>
          AI Model: {isModelLoaded ? "✅ Loaded" : "⏳ Loading..."}
        </Text>
        <Text style={[styles.statusText, { color: theme.text }]}>
          Detection: {isDetecting ? "🔴 Active" : "⚫ Inactive"}
        </Text>
        <Text style={[styles.statusText, { color: theme.text }]}>
          Faces Detected: {faceCount}
        </Text>
      </View>

      {/* Control Button */}
      <TouchableOpacity
        style={[
          styles.controlButton,
          { backgroundColor: isDetecting ? theme.error : theme.primary },
        ]}
        onPress={toggleDetection}
        disabled={!isModelLoaded}
      >
        <Text style={[styles.controlButtonText, { color: theme.buttonText }]}>
          {isDetecting ? "Stop Detection" : "Start Detection"}
        </Text>
      </TouchableOpacity>

      {/* Face Mesh Points Display */}
      <View style={styles.meshContainer}>
        <Text style={[styles.meshTitle, { color: theme.text }]}>
          Face Mesh Points ({faceMeshPoints.length})
        </Text>

        {faceMeshPoints.length > 0 && (
          <View style={styles.meshVisualization}>
            {/* Display first 20 points as example */}
            {faceMeshPoints.slice(0, 20).map((point, index) => (
              <View
                key={index}
                style={[
                  styles.meshPoint,
                  {
                    left: point.x % 300,
                    top: point.y % 200,
                    backgroundColor: theme.primary,
                  },
                ]}
              />
            ))}
          </View>
        )}

        {/* Mesh Points Data */}
        <View style={styles.dataContainer}>
          <Text style={[styles.dataTitle, { color: theme.text }]}>
            Sample Coordinates:
          </Text>
          {faceMeshPoints.slice(0, 5).map((point, index) => (
            <Text
              key={index}
              style={[styles.coordinateText, { color: theme.textSecondary }]}
            >
              Point {index}: x:{point.x.toFixed(1)}, y:{point.y.toFixed(1)}, z:
              {point.z?.toFixed(1)}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
  },
  statusContainer: {
    backgroundColor: "rgba(0,0,0,0.1)",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 14,
    marginVertical: 2,
  },
  controlButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  meshContainer: {
    flex: 1,
  },
  meshTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  meshVisualization: {
    height: 200,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 10,
    position: "relative",
    marginBottom: 20,
  },
  meshPoint: {
    position: "absolute",
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  dataContainer: {
    backgroundColor: "rgba(0,0,0,0.1)",
    padding: 15,
    borderRadius: 10,
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  coordinateText: {
    fontSize: 12,
    fontFamily: "monospace",
    marginVertical: 1,
  },
});
