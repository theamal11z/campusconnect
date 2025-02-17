import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera } from 'expo-camera';
import { toast } from 'sonner-native';

const STEPS = [
  { id: 1, title: 'Upload', icon: 'upload' },
  { id: 2, title: 'Review', icon: 'eye-check' },
  { id: 3, title: 'Confirm', icon: 'check-circle' },
];

const VerifyScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [hasPermission, setHasPermission] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [image, setImage] = useState(null);
  const cameraRef = useRef(null);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
    if (status === 'granted') {
      setIsCameraActive(true);
    } else {
      toast.error('Camera permission is required for verification');
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setImage(photo.uri);
        setIsCameraActive(false);
        setCurrentStep(2);
      } catch (error) {
        toast.error('Failed to capture photo. Please try again.');
      }
    }
  };

  const { uploadVerificationDocument, uploading } = useVerificationUpload();

const handleSubmit = async () => {
    try {
      if (!image) {
        toast.error('Please take a photo first');
        return;
      }

      const response = await fetch(image);
      const blob = await response.blob();
      const userId = supabase.auth.user()?.id;

      if (!userId) {
        toast.error('User not authenticated');
        return;
      }

      await VerificationService.uploadVerificationDocument(blob, userId);
      setCurrentStep(3);
      toast.success('Verification submitted successfully!');
      setTimeout(() => navigation.goBack(), 2000);
    } catch (error) {
      toast.error('Verification submission failed. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1DA1F2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify Your Identity</Text>
      </View>

      <View style={styles.stepsContainer}>
        {STEPS.map((step, index) => (
          <View key={step.id} style={styles.stepWrapper}>
            <View style={[
              styles.step,
              currentStep >= step.id && styles.activeStep
            ]}>
              <MaterialCommunityIcons
                name={step.icon}
                size={24}
                color={currentStep >= step.id ? '#fff' : '#657786'}
              />
            </View>
            <Text style={[
              styles.stepTitle,
              currentStep >= step.id && styles.activeStepTitle
            ]}>
              {step.title}
            </Text>
            {index < STEPS.length - 1 && (
              <View style={[
                styles.stepConnector,
                currentStep > step.id && styles.activeStepConnector
              ]} />
            )}
          </View>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {currentStep === 1 && (
          <View style={styles.uploadSection}>
            <View style={styles.guidelines}>
              <Text style={styles.guidelineTitle}>Guidelines:</Text>
              <Text style={styles.guidelineText}>• Clear, well-lit photo</Text>
              <Text style={styles.guidelineText}>• Neutral background</Text>
              <Text style={styles.guidelineText}>• Face clearly visible</Text>
              <Text style={styles.guidelineText}>• No filters or edits</Text>
            </View>

            {isCameraActive ? (
              <Camera
                ref={cameraRef}
                style={styles.camera}
                type={Camera.Constants.Type.front}
              >
                <View style={styles.cameraButtons}>
                  <TouchableOpacity
                    style={styles.captureButton}
                    onPress={takePicture}
                  >
                    <MaterialCommunityIcons name="camera" size={32} color="#fff" />
                  </TouchableOpacity>
                </View>
              </Camera>
            ) : (
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={requestCameraPermission}
              >
                <MaterialCommunityIcons name="camera-plus" size={48} color="#1DA1F2" />
                <Text style={styles.uploadText}>Take a Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {currentStep === 2 && (
          <View style={styles.reviewSection}>
            {image && (
              <Image source={{ uri: image }} style={styles.previewImage} />
            )}
            <View style={styles.reviewButtons}>
              <TouchableOpacity
                style={styles.retakeButton}
                onPress={() => {
                  setImage(null);
                  setCurrentStep(1);
                }}
              >
                <Text style={styles.retakeButtonText}>Retake Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <LinearGradient
                  colors={['#1DA1F2', '#0D8ED9']}
                  style={styles.submitButtonGradient}
                >
                  <Text style={styles.submitButtonText}>Submit Verification</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {currentStep === 3 && (
          <View style={styles.confirmationSection}>
            <MaterialCommunityIcons name="check-circle" size={64} color="#17BF63" />
            <Text style={styles.confirmationTitle}>Verification Submitted</Text>
            <Text style={styles.confirmationText}>
              We'll review your submission and get back to you shortly.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#14171A',
    marginLeft: 8,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  stepWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  step: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F8FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  activeStep: {
    backgroundColor: '#1DA1F2',
  },
  stepTitle: {
    fontSize: 14,
    color: '#657786',
    fontWeight: '600',
  },
  activeStepTitle: {
    color: '#1DA1F2',
  },
  stepConnector: {
    position: 'absolute',
    top: 24,
    right: -50,
    width: 100,
    height: 2,
    backgroundColor: '#F5F8FA',
    zIndex: -1,
  },
  activeStepConnector: {
    backgroundColor: '#1DA1F2',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  uploadSection: {
    flex: 1,
    alignItems: 'center',
  },
  guidelines: {
    width: '100%',
    padding: 16,
    backgroundColor: '#F5F8FA',
    borderRadius: 12,
    marginBottom: 24,
  },
  guidelineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#14171A',
    marginBottom: 8,
  },
  guidelineText: {
    fontSize: 14,
    color: '#657786',
    marginBottom: 4,
  },
  uploadButton: {
    width: '100%',
    height: 200,
    borderWidth: 2,
    borderColor: '#1DA1F2',
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F8FA',
  },
  uploadText: {
    marginTop: 8,
    fontSize: 16,
    color: '#1DA1F2',
    fontWeight: '600',
  },
  camera: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cameraButtons: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    padding: 24,
  },
  captureButton: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1DA1F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  reviewSection: {
    flex: 1,
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    marginBottom: 24,
  },
  reviewButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  retakeButton: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1DA1F2',
    borderRadius: 25,
    alignItems: 'center',
    marginRight: 8,
  },
  retakeButtonText: {
    color: '#1DA1F2',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    borderRadius: 25,
    overflow: 'hidden',
    marginLeft: 8,
  },
  submitButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmationSection: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
  },
  confirmationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#14171A',
    marginTop: 16,
    marginBottom: 8,
  },
  confirmationText: {
    fontSize: 16,
    color: '#657786',
    textAlign: 'center',
  },
});

export default VerifyScreen;