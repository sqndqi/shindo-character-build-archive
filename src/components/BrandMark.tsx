export function BrandMark({ monochrome = false }: { monochrome?: boolean }) {
  return (
    <svg
      className="brand-symbol"
      viewBox="0 0 64 64"
      role="img"
      aria-label="Shindo Archive seal"
    >
      <path
        className="brand-symbol__ring"
        d="M32 4 51 12 60 31 52 51 32 60 12 52 4 32 12 12Z"
      />
      <path
        className="brand-symbol__scroll"
        d="M18 18h28v28H18zM23 23h18M23 41h18"
      />
      <path
        className="brand-symbol__s"
        d="M42 23c-3.1-3.4-7-5-11.6-4.5-5.2.5-8.7 3.3-8.7 7 0 4 3.1 5.7 10.2 6.8 6.7 1 9.2 2.7 9.2 6.5 0 4-3.8 6.8-9.5 6.8-4.8 0-9-1.8-12.2-5.2"
      />
      <circle className="brand-symbol__core" cx="32" cy="32" r="3.2" />
      {monochrome && <title>Monochrome archive seal</title>}
    </svg>
  );
}
