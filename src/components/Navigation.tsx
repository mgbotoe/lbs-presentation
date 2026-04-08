interface NavigationProps {
  current: number;
  total: number;
  onBack: () => void;
  onNext: () => void;
  children?: React.ReactNode;
}

export function Navigation({ current, total, onBack, onNext, children }: NavigationProps) {
  return (
    <nav className="navigation">
      <button
        className="nav-arrow nav-back"
        onClick={onBack}
        disabled={current === 0}
        aria-label="Previous screen"
      >
        &#8592;
      </button>

      <div className="nav-center">
        {children}
        <span className="nav-position">
          {current + 1} of {total}
        </span>
      </div>

      <button
        className="nav-arrow nav-next"
        onClick={onNext}
        disabled={current === total - 1}
        aria-label="Next screen"
      >
        &#8594;
      </button>
    </nav>
  );
}
