"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ChartErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="app-card flex h-[180px] items-center justify-center text-center">
          <p className="text-[13px] text-app-muted">图表示例暂不可用，不影响其他功能</p>
        </div>
      );
    }
    return this.props.children;
  }
}
