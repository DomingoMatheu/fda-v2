// Mounted again on every navigation, so each screen plays its entrance
// animation (see app/styles/sistema/motion.css).
export default function SystemTemplate({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="sys-page">{children}</div>;
}
