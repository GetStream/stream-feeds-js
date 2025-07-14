import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { ActivityComposer } from '@/components/ActivityComposer';

export default function ModalScreen() {
  return (
    <>
      <ActivityComposer />
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </>
  );
}
