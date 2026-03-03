import React from 'react';

interface RovingTabIndexToolbarProps {
  label: string;
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  style?: React.CSSProperties;
}

interface RovingTabIndexToolbarState {
  focusedIndex: number;
}

/**
 * WAI-ARIA Toolbar pattern with roving tabindex.
 * Provides a single Tab stop for a group of toolbar buttons.
 * Arrow keys navigate between buttons within the toolbar.
 */
export class RovingTabIndexToolbar extends React.Component<
  RovingTabIndexToolbarProps,
  RovingTabIndexToolbarState
> {
  static defaultProps = { orientation: 'horizontal' };
  private _ref = React.createRef<HTMLDivElement>();
  state = { focusedIndex: 0 };

  private _getFocusableChildren(): HTMLElement[] {
    if (!this._ref.current) return [];
    return Array.from(
      this._ref.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [role="button"]:not([aria-disabled="true"])'
      )
    ).filter(el => !el.hasAttribute('disabled'));
  }

  private _updateTabIndices(focusedIdx: number) {
    const children = this._getFocusableChildren();
    children.forEach((child, idx) => {
      child.tabIndex = idx === focusedIdx ? 0 : -1;
    });
  }

  private _onFocus = (e: React.FocusEvent) => {
    const children = this._getFocusableChildren();
    const idx = children.indexOf(e.target as HTMLElement);
    if (idx >= 0) {
      this.setState({ focusedIndex: idx });
    }
  };

  private _onKeyDown = (e: React.KeyboardEvent) => {
    const { orientation } = this.props;
    const isHorizontal = orientation !== 'vertical';
    const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';
    const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';

    const children = this._getFocusableChildren();
    if (children.length === 0) return;

    let { focusedIndex } = this.state;

    if (e.key === nextKey) {
      focusedIndex = (focusedIndex + 1) % children.length;
    } else if (e.key === prevKey) {
      focusedIndex = (focusedIndex - 1 + children.length) % children.length;
    } else if (e.key === 'Home') {
      focusedIndex = 0;
    } else if (e.key === 'End') {
      focusedIndex = children.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    this.setState({ focusedIndex });
    this._updateTabIndices(focusedIndex);
    children[focusedIndex]?.focus();
  };

  componentDidMount() {
    this._updateTabIndices(this.state.focusedIndex);
  }

  componentDidUpdate(_: RovingTabIndexToolbarProps, prevState: RovingTabIndexToolbarState) {
    if (prevState.focusedIndex !== this.state.focusedIndex) {
      this._updateTabIndices(this.state.focusedIndex);
    }
  }

  render() {
    const { label, children, orientation, className, style } = this.props;
    return (
      <div
        ref={this._ref}
        role="toolbar"
        aria-label={label}
        aria-orientation={orientation}
        className={className}
        style={style}
        onKeyDown={this._onKeyDown}
        onFocus={this._onFocus}
      >
        {children}
      </div>
    );
  }
}

export default RovingTabIndexToolbar;
