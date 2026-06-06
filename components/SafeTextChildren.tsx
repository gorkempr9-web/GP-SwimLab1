import { Children, cloneElement, isValidElement, ReactElement, ReactNode } from 'react';
import { Text, TextStyle } from 'react-native';
import { colors } from '@/theme/tokens';

export function renderSafeTextChildren(children: ReactNode, style?: TextStyle) {
  return Children.map(children, (child) => renderSafeChild(child, style));
}

function renderSafeChild(child: ReactNode, style?: TextStyle): ReactNode {
  if (child === null || child === undefined || typeof child === 'boolean') return null;

  if (typeof child === 'string' || typeof child === 'number') {
    const text = String(child);
    if (!text.trim()) return null;
    return <Text style={[{ color: colors.text, fontWeight: '700' }, style]}>{text}</Text>;
  }

  if (Array.isArray(child)) {
    return Children.map(child, (item) => renderSafeChild(item, style));
  }

  if (isValidElement(child)) {
    const element = child as ReactElement<{ children?: ReactNode }>;
    if (element.props.children === undefined || element.props.children === null) return element;
    return cloneElement(element, undefined, renderSafeTextChildren(element.props.children, style));
  }

  return child;
}
