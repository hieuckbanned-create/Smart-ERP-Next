/**
 * Mobile POS Scanner — barcode/QR code scanning with offline support.
 * Uses expo-barcode-scanner for camera access.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useTranslation } from 'react-i18next';

interface ScannerProps {
  onScan: (barcode: string) => void;
  onClose?: () => void;
}

export function POSScanner({ onScan, onClose }: ScannerProps) {
  const { t } = useTranslation('common');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = (result: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);
    if (result.data) {
      onScan(result.data);
    }
  };

  if (!permission) {
    return <View style={styles.container}><Text>{t('common.loading')}</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>{t('pos.cameraPermissionRequired')}</Text>
        <Text style={styles.subMessage}>{t('pos.cameraPermissionMessage')}</Text>
        <Text style={styles.button} onPress={requestPermission}>
          {t('actions.grantPermission')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
          <Text style={styles.instruction}>{t('pos.scanInstruction')}</Text>
          {onClose && (
            <Text style={styles.cancelButton} onPress={onClose}>
              {t('actions.cancel')}
            </Text>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  camera: { flex: 1, width: '100%' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  scanArea: { width: 250, height: 250, borderWidth: 2, borderColor: '#fff', borderRadius: 12 },
  instruction: { color: '#fff', marginTop: 20, fontSize: 16, textAlign: 'center' },
  cancelButton: { color: '#fff', marginTop: 20, fontSize: 16, textDecorationLine: 'underline' },
  message: { color: '#fff', fontSize: 18, textAlign: 'center', marginBottom: 12 },
  subMessage: { color: '#ccc', fontSize: 14, textAlign: 'center', marginBottom: 20 },
  button: { color: '#3b82f6', fontSize: 16, fontWeight: '600', padding: 12 },
});

export function usePOSScanner(onScan: (barcode: string) => void) {
  const [isScanning, setIsScanning] = useState(false);

  const startScanning = () => setIsScanning(true);
  const stopScanning = () => setIsScanning(false);

  return { isScanning, startScanning, stopScanning };
}
