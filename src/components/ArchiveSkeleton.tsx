export function ArchiveSkeleton() {
  return <main className="archive-skeleton" aria-label="Loading archive" aria-busy="true">
    <section className="archive-skeleton__hero"><i /><div><span /><strong /><p /></div></section>
    <section className="archive-skeleton__filters"><span /><span /><span /><span /></section>
    <section className="archive-skeleton__cards">{Array.from({ length: 12 }, (_, index) => <article key={index}><div /><span /><strong /><p /><p /></article>)}</section>
  </main>
}
