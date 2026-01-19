import MenuManager from '@/components/MenuManager';
import { Menu } from '@/lib/data';

export default function CreateMenuPage() {
  const handleMenuCreated = (menu: Menu) => {
    console.log('Menu created:', menu);
  };

  return (
    <div>
      <MenuManager onMenuCreated={handleMenuCreated} />
    </div>
  );
}