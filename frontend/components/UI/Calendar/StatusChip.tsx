import { View, Text } from 'react-native'
import React from 'react'
import { EventStatus } from '@/enum/event'

const StatusChip = ({status}:{status:EventStatus}) => {
  const getStatusStyles = () => {
    switch(status) {
      case EventStatus.SCHEDULED:
        return 'bg-blue-300 border border-blue-300';
      case EventStatus.IN_PROGRESS:
        return 'bg-green-300 border border-green-300';
      case EventStatus.COMPLETED:
        return 'bg-gray-300 border border-gray-300';
      case EventStatus.CANCELLED:
        return 'bg-red-300 border border-red-300';
      default:
        return 'bg-gray-300 border border-gray-300';
    }
  };

  const getTextStyles = () => {
    switch(status) {
      case EventStatus.SCHEDULED:
        return 'text-blue-700';
      case EventStatus.IN_PROGRESS:
        return 'text-green-700';
      case EventStatus.COMPLETED:
        return 'text-gray-700';
      case EventStatus.CANCELLED:
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

 

  return (
    <View className={`rounded-lg p-1 px-2 ${getStatusStyles()}`}>
      <Text className={`text-xs font-medium uppercase ${getTextStyles()}`}>
        {status?.replace("_"," ")}
      </Text>
    </View>
  );
};

export default StatusChip