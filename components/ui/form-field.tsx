import { useMemo } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

type Props = TextInputProps & {
  label: string;
};

export default function FormField({ label, ...inputProps }: Props) {
  const { C } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    container: { marginTop: 12 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 4, color: C.text },
    input: {
      borderWidth: 1,
      borderColor: C.borderStrong,
      borderRadius: 8,
      padding: 10,
      fontSize: 16,
      color: C.text,
      backgroundColor: C.background,
    },
  }), [C]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        accessibilityLabel={label}
        placeholderTextColor={C.textLight}
        {...inputProps}
      />
    </View>
  );
}