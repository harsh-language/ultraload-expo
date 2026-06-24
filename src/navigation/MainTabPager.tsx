import { SlidePager } from './SlidePager';
import { TabPlaceholderScreen } from '../screens/TabPlaceholderScreen';
import { WorkOutScreen } from '../screens/WorkOutScreen';
import type { MainTabKey } from './mainTabs';
import { MAIN_TAB_ORDER } from './mainTabs';

interface MainTabPagerProps {
  selected: MainTabKey;
}

function TabPanel({ tab }: { tab: MainTabKey }) {
  switch (tab) {
    case 'workout':
      return <WorkOutScreen />;
    case 'history':
    case 'settings':
      return <TabPlaceholderScreen tab={tab} />;
    default: {
      const _exhaustive: never = tab;
      return _exhaustive;
    }
  }
}

export function MainTabPager({ selected }: MainTabPagerProps) {
  return (
    <SlidePager
      items={MAIN_TAB_ORDER}
      renderItem={(tab) => <TabPanel tab={tab} />}
      selected={selected}
    />
  );
}
