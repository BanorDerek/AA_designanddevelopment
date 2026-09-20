import { Outlet } from 'react-router-dom';
import ToggleMenu from '../components/ToggleMenu';
import CartButton from '../components/CartButton';

export default function PublicLayout({ settings }) {
  return (
    <>
      <ToggleMenu settings={settings} />
      <CartButton />
      <Outlet />
    </>
  );
}