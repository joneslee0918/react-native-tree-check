import { NativeModules, Platform } from 'react-native';
import { UseScale, UseDetectDevice } from './type';

const { CheckboxTree } = NativeModules;
const { 
    checkSmallDevice,
    deviceInch
} = CheckboxTree.getConstants();

const useScale: UseScale = {
    fontScale: (number: number = 1) => {
        const value = (deviceInch + (checkSmallDevice ? 2 : 3)) / 10;
        const scale = number * Number(value.toFixed(1));
        return scale;
    },
    scale: (number: number = 1) => {
        const value = (deviceInch + (checkSmallDevice ? 3 : 4)) / 10;
        const scale = number * Number(value.toFixed(1));
        return scale;
    },
};

const useDetectDevice: UseDetectDevice = {
    isAndroid: Platform.OS === 'android',
    isIOS: Platform.OS === 'ios',
}

export { useScale, useDetectDevice };
