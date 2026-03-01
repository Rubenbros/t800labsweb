interface DemoReviewsProps {
  title: string;
  subtitle: string;
  reviews: { author: string; rating: number; text: string }[];
  rating: number;
  reviewCount: number;
  badgeLabel: string;
}

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={i <= count ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          className="text-demo-primary"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

export function DemoReviews({ title, subtitle, reviews, rating, reviewCount, badgeLabel }: DemoReviewsProps) {
  return (
    <section id="resenas" className="py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-5 md:px-20">
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-demo-primary">
            {subtitle}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-demo-text md:text-3xl">
            {title}
          </h2>

          {/* Rating badge */}
          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-demo-border bg-demo-card px-6 py-3">
            <span className="text-2xl font-bold text-demo-primary">{rating}</span>
            <Stars count={Math.round(rating)} />
            <span className="text-sm text-demo-text-muted">
              ({reviewCount} {badgeLabel})
            </span>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {reviews.map((review, i) => (
            <div
              key={i}
              className="rounded-xl border border-demo-border bg-demo-card p-6"
            >
              <Stars count={review.rating} />
              <p className="mt-4 text-sm leading-relaxed text-demo-text-muted italic">
                &ldquo;{review.text}&rdquo;
              </p>
              <p className="mt-4 text-sm font-semibold text-demo-text">{review.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
