import StaticPage, {
  Heading,
  Subheading,
  Link,
  Paragraph,
} from "../StaticPage";

export default function AboutPage() {
  return (
    <StaticPage>
      <Heading>About</Heading>
      <Paragraph>
        The Winamp Skin Museum is an attempt to build a <i>fast</i>,{" "}
        <i>searchable</i>, and <i>shareable</i>, interface for the collection of
        Winamp Skins amassed on the{" "}
        <Link
          href="https://archive.org/details/winampskins"
          target="_blank"
          rel="noopener noreferrer"
        >
          Internet Archive
        </Link>
        .
      </Paragraph>
      <Subheading>Features:</Subheading>
      <ul style={{ marginBottom: "1.5rem", paddingLeft: "1.5rem" }}>
        <li style={{ marginBottom: "0.5rem" }}>
          <strong>Infinite scroll</strong> preview images
        </li>
        <li style={{ marginBottom: "0.5rem" }}>
          <strong>Experience</strong> skins with integrated{" "}
          <Link
            href="https://webamp.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Webamp
          </Link>
        </li>
        <li style={{ marginBottom: "0.5rem" }}>
          <strong>Fast search</strong> of indexed readme.txt texts
        </li>
      </ul>
      <Paragraph>
        Made by <Link href="https://jordaneldredge.com">Jordan Eldredge</Link>
      </Paragraph>
      <hr
        style={{
          border: "none",
          borderTop: "1px solid rgba(255, 255, 255, 0.2)",
          margin: "2rem 0",
        }}
      />
      <Paragraph>
        Want Winamp on your Windows PC, but with supported updates & new
        features?{" "}
        <Link
          href="https://getwacup.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Try WACUP
        </Link>
      </Paragraph>
    </StaticPage>
  );
}
