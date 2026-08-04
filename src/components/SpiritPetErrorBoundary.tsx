"use client";

import { Component, type ReactNode } from "react";
import Link from "next/link";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export default class SpiritPetErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="px-4 pb-4 pt-8 text-center">
          <p className="mb-2 text-sm text-red-400">AI 灵宠页面加载出错</p>
          <p className="mb-4 text-[11px] text-app-muted">{this.state.error.message || "未知错误"}</p>
          <Link href="/records" className="app-btn inline-block">去我的测算检查生辰</Link>
        </div>
      );
    }
    return this.props.children;
  }
}
