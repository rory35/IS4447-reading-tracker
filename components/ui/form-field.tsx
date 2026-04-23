import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { Colors } from '@/constants/theme';

const C = Colors.light;

type Props = TextInputProps & {
  label: string;
};

export default function FormField({ label, ...inputProps }: Props) {
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

const styles = StyleSheet.create({
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
});