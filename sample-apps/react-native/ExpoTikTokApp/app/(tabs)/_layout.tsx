import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs, useRouter } from 'expo-router';
import { Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { View } from '@/components/Themed';
import { useOwnFeedsContext } from '@/contexts/OwnFeedsContext';
import { useNotificationStatus } from '@stream-io/feeds-react-native-sdk';
import { NotificationBadge } from '@/components/NotificationBadge';

const TabBarIcon = (props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) => {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
};

const HeaderRight = () => {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { ownNotificationFeed } = useOwnFeedsContext();
  const { unseen } = useNotificationStatus(ownNotificationFeed) ?? {};

  return (
    <View style={{ flexDirection: 'row' }}>
      <Pressable onPress={() => router.push('/(notifications)/notifications-screen')}>
        {({ pressed }) => (
          <View>
            <Ionicons
              name="notifications"
              size={28}
              color={Colors[colorScheme ?? 'light'].text}
              style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
            />
            {unseen && unseen > 0 ? <NotificationBadge count={unseen} /> : null}
          </View>
        )}
      </Pressable>
      <Pressable onPress={() => router.push('/create-post-modal')}>
        {({ pressed }) => (
          <Ionicons
            name="add-circle"
            size={30}
            color={Colors[colorScheme ?? 'light'].text}
            style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
          />
        )}
      </Pressable>
    </View>
  );
};

const TabLayout = () => {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Timeline',
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
          headerRight: () => <HeaderRight />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
