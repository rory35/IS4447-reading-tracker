import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  compact?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
};

export default function PrimaryButton({
  label,
  onPress,
  compact = false,
  variant = 'primary',
  disabled = false,
}: Props) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' ? styles.secondary : null,
        variant === 'danger' ? styles.danger : null,
        compact ? styles.compact : null,
        pressed ? styles.pressed : null,
        disabled ? styles.disabled : null,
      ]}
    >
      <Text
        style={[
          styles.label,
          variant === 'secondary' ? styles.secondaryLabel : null,
          variant === 'danger' ? styles.dangerLabel : null,
          compact ? styles.compactLabel : null,
          disabled ? styles.disabledLabel : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#0F766E',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  secondary: {
    backgroundColor: '#F8FAFC',
    borderColor: '#94A3B8',
    borderWidth: 1,
  },
  danger: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
  },
  compact: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryLabel: {
    color: '#0F172A',
  },
  dangerLabel: {
    color: '#991B1B',
  },
  compactLabel: {
    fontSize: 14,
  },
  disabledLabel: {
    color: '#94A3B8',
  },
});