import React from 'react';
import Switch from '../../../../src/components/switch';
import { localized } from 'mailspring-exports';
import { EventPropertyRow, CalendarIcons } from './event-property-row';

interface AllDayToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const AllDayToggle: React.FC<AllDayToggleProps> = ({ checked, onChange }) => {
  return (
    <EventPropertyRow icon={<CalendarIcons.Sun />}>
      <Switch checked={checked} onChange={() => onChange(!checked)} />
      <span className="all-day-label">{localized('All-day')}</span>
    </EventPropertyRow>
  );
};
