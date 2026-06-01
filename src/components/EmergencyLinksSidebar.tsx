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
        <header className="emergency-links-header">
          <p>Emergency</p>
          <h2>Resources</h2>
          <button className="emergency-links-close" type="button" aria-label="Close emergency links" onClick={onClose}>
            <X aria-hidden="true" size={18} />
          </button>
        </header>

        {groups.length === 0 ? (
          <p className="emergency-links-empty">No emergency resources configured.</p>
        ) : (
          <div className="emergency-link-groups">
            {groups.map((group) => (
              <section className="emergency-link-group" key={group.id}>
                <h3>{group.title}</h3>
                <div className="emergency-link-list">
                  {group.links.map((link) => (
                    <a className="emergency-link" key={link.id} href={link.url} target="_blank" rel="noreferrer">
                      <span className="emergency-link-label">{link.label}</span>
                      <span className={`emergency-link-kind emergency-link-kind-${link.kind}`}>{kindLabels[link.kind]}</span>
                      <span className="emergency-link-description">{link.description}</span>
                    </a>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}
