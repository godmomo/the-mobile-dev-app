import React from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';

type ScreenLayoutProps = {
  children: React.ReactNode;
  style?: any;
  backgroundColor?: string;
  scrollable?: boolean;
};

export default function ScreenLayout({ children, style, backgroundColor, scrollable = false }: ScreenLayoutProps) {
  const { width, height } = useWindowDimensions();
  const isPortrait = height >= width;

  let deviceType = 'phone';
  if (width > 599 && width <= 1023) {
    deviceType = 'tablet';
  } else if (width > 1023) {
    deviceType = 'desktop';
  }

  let containerStyle: any = {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: backgroundColor || 'transparent',
  };

  if (deviceType === 'phone') {
    containerStyle.padding = isPortrait ? 16 : 12;
    containerStyle.maxWidth = '100%';
  } else if (deviceType === 'tablet') {
    containerStyle.padding = isPortrait ? 32 : 24;
    containerStyle.maxWidth = isPortrait ? 720 : 1024;
  } else {
    containerStyle.padding = 40;
    containerStyle.maxWidth = 1200;
    containerStyle.alignSelf = 'center';
  }

  if (style) {
    containerStyle = { ...containerStyle, ...style };
  }

  if (scrollable) {
    return (
      <ScrollView contentContainerStyle={[containerStyle, { flexGrow: 1 }]}>
        {children}
      </ScrollView>
    );
  }

  return <View style={containerStyle}>{children}</View>;
}
