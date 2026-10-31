import { StyleSheet, View } from 'react-native';
import { useAppTheme } from '@/context/theme-context';
import { ThemedText } from '../themed-text';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, { borderColor: colors.border, backgroundColor: colors.backgroundElement }]}>
      <ThemedText style={[styles.title, { color: colors.text }]}>{title}</ThemedText>
      <ThemedText style={[styles.description, { color: colors.textSecondary }]}>{description}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
