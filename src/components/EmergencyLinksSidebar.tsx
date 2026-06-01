import { X } from "lucide-react";
import { useEffect } from "react";
import type { EmergencyLinkGroup, EmergencyLinkKind } from "../config/types";

type EmergencyLinksSidebarProps = {
  groups: EmergencyLinkGroup[];
  onClose: () => void;
};

const kindLabels: Record<EmergencyLinkKind, string> = {
  official: "Official",
  map: "Map",
  preparedness: "Preparedness",
  community: "Community",
};

export function EmergencyLinksSidebar({ groups, onClose }: EmergencyLinksSidebarProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="emergency-links-layer" role="presentation">
      <div className="emergency-links-backdrop" data-testid="emergency-links-backdrop" onMouseDown={onClose} />
      <aside id="emergency-links-sidebar" className="emergency-links-sidebar" aria-label="Emergency resources">
        <header>
          <small>Emergency</small>
          <h2>Resources</h2>
          <button className="emergency-links-close" type="button" aria-label="Close emergency links" onClick={onClose}>
            <X aria-hidden="true" size={18} />
          </button>
        </header>

        {groups.length === 0 ? (
          <p className="emergency-links-empty">No emergency resources configured.</p>
        ) : (
          groups.map((group) => (
            <section key={group.id}>
              <h3>{group.title}</h3>
              {group.links.map((link) => (
                <a className="emergency-link" key={link.id} href={link.url} target="_blank" rel="noreferrer">
                  <span>{link.label}</span>
                  <span className={`emergency-link-kind emergency-link-kind-${link.kind}`}>{kindLabels[link.kind]}</span>
                  <span>{link.description}</span>
                </a>
              ))}
            </section>
          ))
        )}
      </aside>
    </div>
  );
}
