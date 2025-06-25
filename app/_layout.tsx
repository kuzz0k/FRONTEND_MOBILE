// app/_layout.tsx
import { Provider } from 'react-redux';
import { store } from '../store/store';
import RootLayout from './RootLayout';

export default function AppLayout() {
  return (
    <Provider store={store}>
      <RootLayout />
    </Provider>
  );
}