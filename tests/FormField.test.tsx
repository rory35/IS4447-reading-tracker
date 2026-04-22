import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import FormField from '../components/ui/form-field';

describe('FormField', () => {
  it('renders the label and fires onChangeText', () => {
    const onChangeTextMock = jest.fn();
    const { getByText, getByLabelText } = render(
      <FormField label="Name" value="" onChangeText={onChangeTextMock} />
    );

    expect(getByText('Name')).toBeTruthy();
    expect(getByLabelText('Name')).toBeTruthy();

    fireEvent.changeText(getByLabelText('Name'), 'Alice');
    expect(onChangeTextMock).toHaveBeenCalledWith('Alice');
  });
});