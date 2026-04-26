import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export function SosWidget() {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#D32F2F', // HerShield Red
        borderRadius: 50, // Makes it a circle
      }}
      // This clickAction is crucial! It tells Android what to do when tapped.
      clickAction="TRIGGER_SOS_ACTION" 
    >
      <TextWidget
        text="SOS"
        style={{
          fontSize: 32,
          color: '#FFFFFF',
          fontWeight: 'bold',
        }}
      />
    </FlexWidget>
  );
}