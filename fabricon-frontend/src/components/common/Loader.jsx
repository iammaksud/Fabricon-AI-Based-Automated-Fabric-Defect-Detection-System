export function Loader({ fullPage = false, size = 40 }) {
  const spinner = (
    <div
      className="fc-loader-spinner"
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    >
      <span className="visually-hidden">Loading...</span>
    </div>
  );

  if (fullPage) {
    return <div className="fc-loader-overlay">{spinner}</div>;
  }

  return <div className="fc-loader-inline">{spinner}</div>;
}
