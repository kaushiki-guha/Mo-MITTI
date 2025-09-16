
export type Notification = {
  id: number;
  title: string;
  description: string;
  type: 'alert' | 'default';
  icon: 'bell' | 'wind';
};

export const mockNotifications: Notification[] = [
  {
    id: 1,
    title: 'High wind warning',
    description: 'Strong winds expected tomorrow. Secure any loose equipment.',
    type: 'alert',
    icon: 'wind',
  },
  {
    id: 2,
    title: 'New AI suggestions available',
    description: 'Check the AI Crop Guidance page for new recommendations.',
    type: 'default',
    icon: 'bell',
  },
  {
    id: 3,
    title: 'Irrigation reminder',
    description: 'Field 3 is due for irrigation today based on sensor readings.',
    type: 'default',
    icon: 'bell',
  },
];
