import _ from 'underscore';
import React from 'react';
import { Calendar, Account } from 'mailspring-exports';
import { calcColor } from './calendar-helpers';

interface CalendarSelectorProps {
  calendars: Calendar[];
  accounts: Account[];
  disabledCalendars: string[];
  selectedCalendarId: string;
  onChange: (calendarId: string, accountId: string) => void;
}

export class CalendarSelector extends React.Component<CalendarSelectorProps> {
  static displayName = 'CalendarSelector';

  _onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const calendarId = e.target.value;
    const calendar = this.props.calendars.find((c) => c.id === calendarId);
    if (calendar) {
      this.props.onChange(calendar.id, calendar.accountId);
    }
  };

  render() {
    const { calendars, accounts, disabledCalendars, selectedCalendarId } = this.props;

    // Filter to only writable, enabled calendars
    const editableCalendars = calendars.filter(
      (c) => !c.readOnly && !disabledCalendars.includes(c.id)
    );

    // Group by account
    const calsByAccountId = _.groupBy(editableCalendars, 'accountId');

    // Get the selected calendar's color for the indicator dot
    const selectedColor = calcColor(selectedCalendarId);

    return (
      <div className="calendar-selector">
        <div className="calendar-selector-dot" style={{ backgroundColor: selectedColor }} />
        <select value={selectedCalendarId} onChange={this._onChange}>
          {Object.keys(calsByAccountId).map((accountId) => {
            const cals = calsByAccountId[accountId];
            const account = accounts.find((a) => a.id === accountId);
            const accountLabel = account ? account.label : accountId;

            return (
              <optgroup key={accountId} label={accountLabel}>
                {cals.map((cal) => (
                  <option key={cal.id} value={cal.id}>
                    {cal.name}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>
      </div>
    );
  }
}
