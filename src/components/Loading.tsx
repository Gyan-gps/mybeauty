export function Loading({ label = 'Getting everything ready…' }: {
  label?: string;
}) {
  return <div className="loading-state" role="status" aria-live="polite">
    <div className="loading-orbit">
      <span />
    </div>
    <p>
      {label}
    </p>
    <div className="skeleton-grid">
      {[0, 1, 2].map(i => <div className="skeleton-card" key={i}>
        <div className="skeleton line short" />
        <div className="skeleton line" />
        <div className="skeleton line medium" />
      </div>)}
    </div>
  </div>;
}
