// X, Slack, LinkedIn and iMessage all fall back to og:image, but the
// twitter:image tag is only emitted when a twitter-image file exists — so this
// re-export removes the doubt for three lines.
export { default, alt, size, contentType } from "./opengraph-image";
