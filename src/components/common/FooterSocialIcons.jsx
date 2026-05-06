import { FaEnvelope, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

const SOCIAL_ITEMS = [
  { label: "Email", Icon: FaEnvelope },
  { label: "Instagram", Icon: FaInstagram },
  { label: "YouTube", Icon: FaYoutube },
  { label: "Twitter", Icon: FaTwitter },
];

export default function FooterSocialIcons() {
  return (
    <div className="footer-social footer-social--icons">
      {SOCIAL_ITEMS.map(({ label, Icon }) => (
        <span key={label} aria-label={label}>
          <Icon />
        </span>
      ))}
    </div>
  );
}
